#!/usr/bin/env python3
# Прокси к api.kinobox.tv: api сбрасывает не-браузерные TLS и запросы без
# Sec-Fetch-*/Referer, поэтому нужна имперсонация Chrome через curl_cffi.
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qsl, urlencode
from curl_cffi import requests as cffi

UPSTREAM = 'https://api.kinobox.tv/api/players'
HEADERS = {
    'Referer': 'https://tapeop.dev/',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Accept': '*/*',
}

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = urlencode(parse_qsl(urlparse(self.path).query))
        try:
            r = cffi.get(f'{UPSTREAM}?{query}', headers=HEADERS, impersonate='chrome131', timeout=25)
            code, body = r.status_code, r.content
        except Exception as e:
            code, body = 502, str(e).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *args):
        pass

ThreadingHTTPServer(('127.0.0.1', 8787), Handler).serve_forever()
