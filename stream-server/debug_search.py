import requests, json

def test_search(query):
    r = requests.get('https://www.jiosaavn.com/api.php', params={
        '__call': 'search.getResults', '_format': 'json', '_marker': '0',
        'ctx': 'web6dot0', 'q': query, 'n': '10', 'p': '1'
    }, headers={'User-Agent': 'Mozilla/5.0'})
    d = r.json()
    print(f"\n=== '{query}' ({d['total']} total) ===")
    for i, s in enumerate(d['results']):
        drm = 'DRM' if s.get('is_drm','0') == '1' else ''
        print(f"  {i+1}. {s['song']} — {s['primary_artists']} [{s.get('language','')}] {drm}")

test_search("Rockstar Post Malone")
test_search("Sao Paulo The Weeknd")
test_search("Blinding Lights The Weeknd")
test_search("Pasoori Coke Studio")
