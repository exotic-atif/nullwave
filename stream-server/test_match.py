import requests
import re
import html
import unicodedata

def _clean(text):
    text = re.sub(r"\([^)]*(feat\.?|ft\.?|with)[^)]*\)", "", text, flags=re.I)
    text = re.sub(r"\[[^\]]*(feat\.?|ft\.?|with)[^\]]*\]", "", text, flags=re.I)
    return " ".join(text.split()).strip()

def _primary_artist(artist):
    return re.split(r",|&| and | feat\.?| ft\.?", artist, flags=re.I)[0].strip()

def normalize_text(text):
    text = html.unescape(text)
    # Remove accents/diacritics
    text = ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')
    return text.lower().strip()

def is_good_match(song_result, target_title, target_artist):
    res_title = normalize_text(song_result.get("song", ""))
    res_artist = normalize_text(song_result.get("primary_artists", ""))
    singers = normalize_text(song_result.get("singers", ""))
    
    tgt_title = normalize_text(_clean(target_title))
    tgt_artist = normalize_text(_primary_artist(target_artist))
    
    # 1. Reject instrumentals/karaoke/covers if not asked for
    orig_tgt_lower = target_title.lower()
    if "instrumental" not in orig_tgt_lower and "instrumental" in res_title:
        return False
    if "karaoke" not in orig_tgt_lower and "karaoke" in res_title:
        return False
    if "cover" not in orig_tgt_lower and "cover" in res_title:
        return False

    # 2. Artist must match (partially)
    if tgt_artist:
        if tgt_artist not in res_artist and tgt_artist not in singers:
            # Maybe the artist in the result is just slightly different
            # Check overlap of words
            tgt_artist_words = set(tgt_artist.split())
            res_artist_words = set(res_artist.split() + singers.split())
            if not tgt_artist_words.intersection(res_artist_words):
                return False

    # 3. Title must match (partially)
    if tgt_title not in res_title and res_title not in tgt_title:
        tgt_words = set(tgt_title.split())
        res_words = set(res_title.split())
        # Require at least one word from the title to match
        if not tgt_words.intersection(res_words):
            return False

    return True

def test_search(query, target_title, target_artist):
    r = requests.get('https://www.jiosaavn.com/api.php', params={
        '__call': 'search.getResults', '_format': 'json', '_marker': '0',
        'ctx': 'web6dot0', 'q': query, 'n': '5', 'p': '1'
    }, headers={'User-Agent': 'Mozilla/5.0'})
    d = r.json()
    print(f"\n=== '{query}' ===")
    results = d.get('results', [])
    found_match = False
    for i, s in enumerate(results):
        match = is_good_match(s, target_title, target_artist)
        album_str = html.unescape(s.get('album',''))
        label = s.get('more_info', {}).get('label', s.get('label', ''))
        copy = s.get('more_info', {}).get('copyright_text', s.get('copyright_text', ''))
        print(f"  {i+1}. [Match: {match}] {html.unescape(s.get('song',''))} — {html.unescape(s.get('primary_artists',''))}")
        print(f"      Album: {album_str} | Label: {label} | Copy: {copy}")
        if match and not found_match:
            print("     -> SELECTED THIS ONE")
            found_match = True

test_search("Rockstar Post Malone", "Rockstar", "Post Malone")
test_search("Sao Paulo The Weeknd", "Sao Paulo", "The Weeknd")
test_search("Blinding Lights The Weeknd", "Blinding Lights", "The Weeknd")
test_search("Pasoori Coke Studio", "Pasoori", "Coke Studio")
test_search("Tajdar-e-Haram Atif Aslam", "Tajdar-e-Haram", "Atif Aslam")
