import requests
import json

headers = {
    'User-Agent': 'Mozilla/5.0',
    'X-Forwarded-For': '122.160.10.1',
    'X-Real-IP': '122.160.10.1',
    'client-ip': '122.160.10.1',
    'X-Country-Code': 'IN'
}

r = requests.get('https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&ctx=web6dot0&q=The Weeknd', headers=headers)
try:
    for s in r.json().get('results', []):
        print(s.get('title'), "by", s.get('primary_artists', ''))
except Exception as e:
    print("Error:", e)
    print("Response:", r.text[:500])
