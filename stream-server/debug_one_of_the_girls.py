import requests
import json
import re
import html
import unicodedata

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

query = "One Of The Girls The Weeknd"
title = "One Of The Girls"
artist = "The Weeknd"

r = requests.get('https://www.jiosaavn.com/api.php', params={
    '__call': 'search.getResults', '_format': 'json', '_marker': '0',
    'ctx': 'web6dot0', 'q': query, 'n': '10', 'p': '1'
}, headers={'User-Agent': 'Mozilla/5.0'})

data = r.json()
print(f"=== {query} ===")
for i, s in enumerate(data.get('results', [])):
    match = _is_good_match(s, title, artist)
    print(f"{i+1}. [Match: {match}] {html.unescape(s.get('song',''))} — {html.unescape(s.get('primary_artists',''))} (Singers: {html.unescape(s.get('singers',''))})")

