import requests
import json

def test_jiosaavn_search(query):
    # Test autocomplete.get
    print("--- AUTOCOMPLETE ---")
    r1 = requests.get('https://www.jiosaavn.com/api.php', params={
        '__call': 'autocomplete.get', '_format': 'json', '_marker': '0',
        'ctx': 'web6dot0', 'query': query
    }, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        print(json.dumps({k: [x.get('title', x.get('name', '')) for x in v.get('data', [])] for k, v in r1.json().items() if isinstance(v, dict) and 'data' in v}, indent=2))
    except Exception as e:
        print("Error parsing autocomplete:", e)

    # Test artist search directly
    print("\n--- ARTIST SEARCH ---")
    r2 = requests.get('https://www.jiosaavn.com/api.php', params={
        '__call': 'search.getArtistResults', '_format': 'json', '_marker': '0',
        'ctx': 'web6dot0', 'q': query, 'n': '5', 'p': '1'
    }, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        print(json.dumps([x.get('name', '') for x in r2.json().get('results', [])], indent=2))
    except Exception as e:
        print("Error parsing artist search:", e)

test_jiosaavn_search("weeknd")
test_jiosaavn_search("sao paulo")
