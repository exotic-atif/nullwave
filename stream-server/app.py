"""
NullWave Stream Server — Python
Primary source: JioSaavn (works from datacenter IPs, 320kbps MP4)
Fallback: yt-dlp / YouTube (works from residential IPs only)
"""

import os
import re
import json
import logging
import subprocess
import base64
import shutil
import html
import unicodedata
from urllib.parse import urlparse

import requests
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS

# Try to import pycryptodome for JioSaavn URL decryption
try:
    from Crypto.Cipher import DES
    HAS_CRYPTO = True
except ImportError:
    try:
        from Cryptodome.Cipher import DES
        HAS_CRYPTO = True
    except ImportError:
        HAS_CRYPTO = False

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

app = Flask(__name__)
CORS(app, expose_headers=[
    "Accept-Ranges", "Content-Length", "Content-Range", "Content-Type"
])
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("nullwave-stream")

MOCK_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
)

PASSTHROUGH_HEADERS = {
    "accept-ranges", "content-length", "content-range",
    "content-type", "etag", "last-modified",
}

# JioSaavn decryption key (well-known, used by all open-source wrappers)
JIOSAAVN_KEY = b"38346591"

# ---------------------------------------------------------------------------
# Cookies for yt-dlp fallback
# ---------------------------------------------------------------------------

def _resolve_cookies():
    candidates = [
        os.environ.get("COOKIES_PATH", ""),
        "/etc/secrets/cookies.txt",
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "cookies.txt"),
    ]
    source = next((p for p in candidates if p and os.path.isfile(p)), None)
    if not source:
        return None
    writable = "/tmp/cookies.txt"
    try:
        shutil.copy2(source, writable)
        log.info("Cookies: %s -> %s", source, writable)
        return writable
    except Exception:
        return source

COOKIES_PATH = _resolve_cookies()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _clean(text):
    text = re.sub(r"\([^)]*(feat\.?|ft\.?|with)[^)]*\)", "", text, flags=re.I)
    text = re.sub(r"\[[^\]]*(feat\.?|ft\.?|with)[^\]]*\]", "", text, flags=re.I)
    return " ".join(text.split()).strip()

def _primary_artist(artist):
    return re.split(r",|&| and | feat\.?| ft\.?", artist, flags=re.I)[0].strip()

def _normalize_text(text):
    text = html.unescape(text)
    text = ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')
    return text.lower().strip()

def _is_good_match(song_result, target_title, target_artist):
    res_title = _normalize_text(song_result.get("song", ""))
    res_artist = _normalize_text(song_result.get("primary_artists", ""))
    singers = _normalize_text(song_result.get("singers", ""))
    
    tgt_title = _normalize_text(_clean(target_title))
    tgt_artist = _normalize_text(_primary_artist(target_artist))
    
    # Reject instrumentals/karaoke/covers if not requested
    orig_tgt_lower = target_title.lower()
    if "instrumental" not in orig_tgt_lower and "instrumental" in res_title:
        return False
    if "karaoke" not in orig_tgt_lower and "karaoke" in res_title:
        return False
    if "cover" not in orig_tgt_lower and "cover" in res_title:
        return False

    # Artist must match (partially)
    if tgt_artist:
        if tgt_artist not in res_artist and tgt_artist not in singers:
            tgt_artist_words = set(tgt_artist.split())
            res_artist_words = set(res_artist.split() + singers.split())
            if not tgt_artist_words.intersection(res_artist_words):
                return False

    # Title must match (partially)
    if tgt_title not in res_title and res_title not in tgt_title:
        tgt_words = set(tgt_title.split())
        res_words = set(res_title.split())
        if not tgt_words.intersection(res_words):
            return False

    return True

# ---------------------------------------------------------------------------
# JioSaavn — Primary source (works from datacenter IPs)
# ---------------------------------------------------------------------------

def _decrypt_jiosaavn_url(encrypted_url):
    """Decrypt JioSaavn's encrypted media URL using DES-ECB."""
    if not HAS_CRYPTO:
        return None
    try:
        encrypted_data = base64.b64decode(encrypted_url.strip())
        cipher = DES.new(JIOSAAVN_KEY, DES.MODE_ECB)
        decrypted = cipher.decrypt(encrypted_data)
        # Remove PKCS5 padding
        pad_len = decrypted[-1]
        if isinstance(pad_len, int) and 1 <= pad_len <= 8:
            decrypted = decrypted[:-pad_len]
        return decrypted.decode("utf-8")
    except Exception as e:
        log.warning("[JioSaavn] Decrypt failed: %s", e)
        return None


def _jiosaavn_search(title, artist):
    """Search JioSaavn and return a direct 320kbps audio URL."""
    query = f"{_clean(title)} {_clean(_primary_artist(artist))}"
    log.info("[JioSaavn] Searching: %s", query)

    try:
        # Use JioSaavn's internal search API
        res = requests.get(
            "https://www.jiosaavn.com/api.php",
            params={
                "__call": "search.getResults",
                "_format": "json",
                "_marker": "0",
                "ctx": "web6dot0",
                "q": query,
                "n": "5",
                "p": "1",
            },
            headers={
                "User-Agent": MOCK_UA,
                "X-Forwarded-For": "122.160.10.1",  # Spoof Airtel India IP
                "X-Real-IP": "122.160.10.1",
                "client-ip": "122.160.10.1",
                "X-Country-Code": "IN"
            },
            timeout=10,
        )
        
        if not res.ok:
            log.warning("[JioSaavn] Search HTTP %d", res.status_code)
            return None

        data = res.json()
        results = data.get("results", [])
        if not results:
            log.warning("[JioSaavn] No results for: %s", query)
            return None

        # Pick the best matching result
        song = None
        for s in results:
            if _is_good_match(s, title, artist):
                song = s
                break
                
        if not song:
            log.warning("[JioSaavn] Results found but all were bad matches (instrumentals/wrong artist). Falling back.")
            return None
        encrypted_url = song.get("encrypted_media_url", "")
        
        if not encrypted_url:
            log.warning("[JioSaavn] No encrypted URL in result")
            return None

        decrypted_url = _decrypt_jiosaavn_url(encrypted_url)
        if not decrypted_url:
            return None

        # Upgrade quality to 320kbps
        stream_url = decrypted_url.replace("_96.mp4", "_320.mp4")
        
        # Verify the URL works
        check = requests.head(stream_url, timeout=5, allow_redirects=True)
        if check.status_code == 200:
            log.info("[JioSaavn] Got 320kbps stream: %s...", stream_url[:60])
            return stream_url
        
        # Try 160kbps fallback
        stream_url = decrypted_url.replace("_96.mp4", "_160.mp4")
        check = requests.head(stream_url, timeout=5, allow_redirects=True)
        if check.status_code == 200:
            log.info("[JioSaavn] Got 160kbps stream: %s...", stream_url[:60])
            return stream_url

        # Use whatever quality we got
        log.info("[JioSaavn] Using default quality: %s...", decrypted_url[:60])
        return decrypted_url

    except Exception as e:
        log.warning("[JioSaavn] Error: %s", e)
        return None

# ---------------------------------------------------------------------------
# yt-dlp — Fallback source (residential IPs only)
# ---------------------------------------------------------------------------

def _ytdlp_search(title, artist):
    """Use yt-dlp to find a YouTube audio stream. Only works on residential IPs."""
    clean_title = _clean(title)
    clean_artist = _clean(_primary_artist(artist))

    queries = list(dict.fromkeys(filter(None, [
        f"{clean_title} {clean_artist} official audio",
        f"{clean_title} {clean_artist}",
    ])))

    for q in queries:
        search = f"ytsearch1:{q}"
        log.info("[yt-dlp] Searching: %s", search)

        cmd = [
            "yt-dlp",
            "--format", "bestaudio[ext=m4a]/bestaudio/best",
            "--get-url",
            "--no-warnings",
            "--no-check-certificate",
            "--user-agent", MOCK_UA,
            "--extractor-args", "youtube:player_client=tv,android",
        ]
        if COOKIES_PATH:
            cmd += ["--cookies", COOKIES_PATH]
        cmd.append(search)

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            url = (result.stdout or "").strip().split("\n")[0].strip()
            if url.startswith("http"):
                log.info("[yt-dlp] Found URL: %s...", url[:60])
                return url
        except Exception as e:
            log.warning("[yt-dlp] Failed: %s", e)

    return None

# ---------------------------------------------------------------------------
# Combined search: JioSaavn first, then yt-dlp fallback
# ---------------------------------------------------------------------------

def _find_stream_url(title, artist):
    # 1. Try JioSaavn (works from datacenter IPs)
    url = _jiosaavn_search(title, artist)
    if url:
        return {"streamUrl": url, "source": "jiosaavn"}

    # 2. Fallback to yt-dlp (works from residential IPs)
    url = _ytdlp_search(title, artist)
    if url:
        return {"streamUrl": url, "source": "ytdlp"}

    return {"streamUrl": None, "source": None}


def _base_url():
    return request.host_url.rstrip("/")

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return "NullWave Stream Server is running"

@app.route("/health")
def health():
    return jsonify(ok=True, service="nullwave-stream", crypto=HAS_CRYPTO)

@app.route("/stream")
def stream():
    title = (request.args.get("title") or "").strip()
    artist = (request.args.get("artist") or "").strip()
    if not title:
        return jsonify(error="Missing title"), 400

    result = _find_stream_url(title, artist)

    if not result["streamUrl"]:
        return jsonify(error="No stream URL found"), 404

    proxied = f"{_base_url()}/audio?url={requests.utils.quote(result['streamUrl'], safe='')}"
    return jsonify(streamUrl=proxied, quality="high", mimeType="audio/mp4", source=result["source"])

@app.route("/audio")
def audio():
    target_url = request.args.get("url", "")
    if not target_url:
        return jsonify(error="Missing url"), 400

    parsed = urlparse(target_url)
    if parsed.scheme not in ("http", "https"):
        return jsonify(error="Invalid url"), 400

    upstream_headers = {"User-Agent": MOCK_UA}
    range_header = request.headers.get("Range")
    if range_header:
        upstream_headers["Range"] = range_header

    try:
        upstream = requests.get(
            target_url, headers=upstream_headers, stream=True, timeout=30,
        )
    except requests.RequestException as exc:
        log.error("[Audio] Upstream fetch failed: %s", exc)
        return jsonify(error="Audio proxy failed"), 502

    if upstream.status_code not in (200, 206):
        return jsonify(error=f"Upstream returned {upstream.status_code}"), upstream.status_code

    resp_headers = {}
    for key, value in upstream.headers.items():
        if key.lower() in PASSTHROUGH_HEADERS:
            resp_headers[key] = value

    resp_headers["Accept-Ranges"] = "bytes"
    resp_headers["Cache-Control"] = "private, max-age=300"
    if "Content-Type" not in resp_headers:
        resp_headers["Content-Type"] = "audio/mp4"

    def generate():
        for chunk in upstream.iter_content(chunk_size=64 * 1024):
            yield chunk

    return Response(
        stream_with_context(generate()),
        status=upstream.status_code,
        headers=resp_headers,
    )

# ---------------------------------------------------------------------------
# Entry
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 4000))
    app.run(host="0.0.0.0", port=port)
