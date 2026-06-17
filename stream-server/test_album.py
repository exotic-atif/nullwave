import requests
import random

headers = {
    'User-Agent': 'Mozilla/5.0',
    'X-Forwarded-For': '122.160.10.1',
    'X-Country-Code': 'IN'
}

def search(q):
    r = requests.get(f'https://www.jiosaavn.com/api.php?__call=search.getResults&q={q}&n=20&p=1&_format=json&_marker=0&ctx=web6dot0', headers=headers)
    try:
        return r.json().get('results', [])
    except:
        return []

artist = "Weeknd"
genre = "English"

# Get tracks by artist
t1 = search(artist)
# Get tracks by genre/language
t2 = search(f"{genre} hits")

tracks = t1 + t2
print("Total found:", len(tracks))

bad_keywords = ["slowed", "reverb", "speed", "sped", "lofi", "remix", "mashup", "instrumental"]

filtered = []
for t in tracks:
    title = (t.get('title') or t.get('song')).lower()
    if not any(b in title for b in bad_keywords):
        filtered.append(title)

print("Filtered unique tracks:", list(set(filtered))[:10])
