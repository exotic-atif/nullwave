"""
NullWave Stream Server — Python / yt-dlp
A lightweight Flask server that searches YouTube for a track,
extracts the best audio stream URL via yt-dlp, and proxies the
audio bytes back to the browser with proper Range / Accept-Ranges
headers so that mobile browsers can seek and play without issues.
"""

import os
import re
import logging
import subprocess
from urllib.parse import urlparse

import requests
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS

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

# Headers we pass through from the upstream audio response
PASSTHROUGH_HEADERS = {
    "accept-ranges", "content-length", "content-range",
    "content-type", "etag", "last-modified",
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _clean(text: str) -> str:
    """Strip feat/ft tags and extra whitespace."""
    text = re.sub(r"\([^)]*(feat\.?|ft\.?|with)[^)]*\)", "", text, flags=re.I)
    text = re.sub(r"\[[^\]]*(feat\.?|ft\.?|with)[^\]]*\]", "", text, flags=re.I)
    return " ".join(text.split()).strip()


def _primary_artist(artist: str) -> str:
    return re.split(r",|&| and | feat\.?| ft\.?", artist, flags=re.I)[0].strip()


def _find_stream_url(title: str, artist: str) -> dict:
    """
    Use yt-dlp to search YouTube and return the direct audio URL.
    We try multiple query variations to maximise hit-rate.
    """
    clean_title = _clean(title)
    clean_artist = _clean(_primary_artist(artist))
    raw_artist = _clean(artist)

    queries = list(dict.fromkeys(filter(None, [
        f"{clean_title} {clean_artist} official audio",
        f"{clean_title} {raw_artist} audio",
        f"{clean_title} {clean_artist}",
        f"{title} {artist} audio",
    ])))

    # Check for cookies in multiple locations:
    # 1. Local file next to app.py
    # 2. Render Secret Files location (/etc/secrets/)
    # 3. Custom path via COOKIES_PATH env var
    cookies_candidates = [
        os.environ.get("COOKIES_PATH", ""),
        "/etc/secrets/cookies.txt",
        os.path.join(os.path.dirname(__file__), "cookies.txt"),
    ]
    cookies_path = next((p for p in cookies_candidates if p and os.path.isfile(p)), None)
    use_cookies = cookies_path is not None

    errors = []
    for q in queries:
        search = f"ytsearch1:{q}"
        log.info("[Stream] Searching: %s", search)

        cmd = [
            "yt-dlp",
            "--format", "bestaudio[ext=m4a]/bestaudio/best",
            "--get-url",
            "--no-warnings",
            "--no-check-certificate",
            "--user-agent", MOCK_UA,
            "--extractor-args", "youtube:player_client=tv,android",
        ]
        if use_cookies:
            cmd += ["--cookies", cookies_path]
        cmd.append(search)

        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True, timeout=30,
            )
            url = (result.stdout or "").strip().split("\n")[0].strip()
            if url.startswith("http"):
                log.info("[Stream] Found URL: %s...", url[:60])
                return {"streamUrl": url, "query": q, "errors": errors}
            else:
                msg = (result.stderr or "").strip() or "No URL in output"
                log.warning("[Stream] Query failed: %s — %s", q, msg)
                errors.append({"query": q, "message": msg})
        except subprocess.TimeoutExpired:
            errors.append({"query": q, "message": "yt-dlp timed out"})
        except Exception as exc:
            errors.append({"query": q, "message": str(exc)})

    return {"streamUrl": None, "query": queries[0] if queries else title, "errors": errors}


def _base_url():
    return request.host_url.rstrip("/")

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return "NullWave Stream Server (Python / yt-dlp) is running"


@app.route("/health")
def health():
    return jsonify(ok=True, service="nullwave-stream-py")


@app.route("/debug/cookies")
def debug_cookies():
    paths = [
        os.environ.get("COOKIES_PATH", ""),
        "/etc/secrets/cookies.txt",
        os.path.join(os.path.dirname(__file__), "cookies.txt"),
    ]
    results = {}
    for p in paths:
        if not p:
            continue
        results[p] = {
            "exists": os.path.isfile(p),
            "size": os.path.getsize(p) if os.path.isfile(p) else 0,
        }
    found = next((p for p in paths if p and os.path.isfile(p)), None)
    return jsonify(found=found, checked=results)


@app.route("/stream")
def stream():
    title = (request.args.get("title") or "").strip()
    artist = (request.args.get("artist") or "").strip()
    if not title:
        return jsonify(error="Missing title"), 400

    result = _find_stream_url(title, artist)

    if not result["streamUrl"]:
        return jsonify(
            error="No stream URL found",
            query=result["query"],
            details=result["errors"][-3:],
        ), 404

    # Return a proxied URL so the browser never touches the raw Google CDN link
    proxied = f"{_base_url()}/audio?url={requests.utils.quote(result['streamUrl'], safe='')}"
    return jsonify(streamUrl=proxied, quality="high", mimeType="audio/mp4")


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
