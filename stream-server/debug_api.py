import requests, json

# Strategy: use search.getArtistResults for artist info,
# then search.getResults for their songs
artist_name = "The Weeknd"

# 1. Get artist info
r = requests.get('https://www.jiosaavn.com/api.php', params={
    '__call': 'search.getArtistResults',
    'q': artist_name, '_format': 'json', '_marker': '0', 'ctx': 'web6dot0', 'n': '1', 'p': '1',
}, headers={'User-Agent': 'Mozilla/5.0'})
artist = r.json()['results'][0]
print(f"Artist: {artist['name']}")
print(f"ID: {artist.get('artistId', artist.get('id'))}")
print(f"Image: {artist.get('image','')}")

# 2. Get their songs
r2 = requests.get('https://www.jiosaavn.com/api.php', params={
    '__call': 'search.getResults',
    'q': artist_name, '_format': 'json', '_marker': '0', 'ctx': 'web6dot0', 'n': '20', 'p': '1',
}, headers={'User-Agent': 'Mozilla/5.0'})
songs = r2.json()['results']
print(f"\nSongs ({len(songs)}):")
for s in songs[:10]:
    print(f"  {s['song']} | {s['primary_artists']} | {s.get('language','')} | ID: {s['id']}")

# 3. Test image upscale
img = artist.get('image', '')
print(f"\nOriginal image: {img}")
print(f"500x500: {img.replace('150x150', '500x500')}")
