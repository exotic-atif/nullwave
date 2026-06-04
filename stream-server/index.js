const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const { Readable } = require('node:stream');

const app = express();
const startedAt = new Date();

app.use(cors({
  origin: true,
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Range'],
  exposedHeaders: ['Accept-Ranges', 'Content-Length', 'Content-Range', 'Content-Type'],
}));

const AUDIO_HEADERS = new Set([
  'accept-ranges',
  'content-length',
  'content-range',
  'content-type',
  'etag',
  'last-modified',
]);

const MOCK_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

function sendError(res, status, message) {
  res.status(status).json({ error: message });
}

function cleanSearchText(value = '') {
  return String(value)
    .replace(/\([^)]*(feat\.?|ft\.?|with)[^)]*\)/gi, '')
    .replace(/\[[^\]]*(feat\.?|ft\.?|with)[^\]]*\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getPrimaryArtist(value = '') {
  return String(value)
    .split(/,|&| and | feat\.?| ft\.?/i)[0]
    .trim();
}

function getFirstUrl(output) {
  if (typeof output !== 'string') return null;
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith('http')) || null;
}

async function findStreamUrl(title, artist) {
  const cleanTitle = cleanSearchText(title);
  const cleanArtist = cleanSearchText(getPrimaryArtist(artist));
  const rawArtist = cleanSearchText(artist);
  const queries = [
    `${cleanTitle} ${cleanArtist} official audio`,
    `${cleanTitle} ${rawArtist} audio`,
    `${cleanTitle} ${cleanArtist}`,
    `${title} ${artist} audio`,
  ].filter((query, index, all) => query.trim() && all.indexOf(query) === index);

  const errors = [];

  for (const searchText of queries) {
    const query = `ytsearch3:${searchText}`;
    console.log(`[Stream] Searching for: ${query}`);

    try {
      const output = await youtubedl(query, {
        format: 'bestaudio[ext=m4a]/bestaudio/best',
        dumpSingleJson: true,
        noWarnings: true,
        noCheckCertificate: true,
        defaultSearch: 'ytsearch',
        userAgent: MOCK_USER_AGENT,
        extractorArgs: 'youtube:player_client=android',
      });
      const streamUrl = output.url;
      if (streamUrl) {
        return { streamUrl, query, errors };
      }
    } catch (error) {
      console.warn(`[Stream] Query failed: ${query}`, error.message);
      errors.push({ query, message: error.message });
    }
  }

  return { streamUrl: null, query: queries[0] || title, errors };
}

app.get('/', (req, res) => {
  res.send('NullWave Stream Server (yt-dlp) is running');
});

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'nullwave-stream',
    startedAt: startedAt.toISOString(),
    uptime: Math.round(process.uptime()),
  });
});

app.get('/debug/ytdlp', async (req, res) => {
  try {
    const output = await youtubedl('--version');
    res.json({
      ok: true,
      version: typeof output === 'string' ? output.trim() : output,
    });
  } catch (error) {
    console.error('[Debug] yt-dlp failed:', error.message);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

app.get('/stream', async (req, res) => {
  const { title, artist } = req.query;

  if (!title) {
    return res.status(400).json({ error: 'Missing title' });
  }

  try {
    const { streamUrl, query, errors } = await findStreamUrl(title, artist || '');

    if (!streamUrl) {
      return res.status(404).json({
        error: 'No stream URL found',
        query,
        details: errors.slice(-3),
      });
    }

    console.log(`[Stream] Found URL: ${streamUrl.substring(0, 50)}...`);

    const proxiedUrl = `${getBaseUrl(req)}/audio?url=${encodeURIComponent(streamUrl)}`;

    // Return our own URL to the frontend. Mobile browsers then stream from this
    // server instead of opening a raw Google/YouTube CDN URL.
    res.json({
      streamUrl: proxiedUrl,
      quality: 'high',
      mimeType: 'audio/mp4' // The player will handle it
    });

  } catch (error) {
    console.error(`[Stream] Exception:`, error.message);
    res.status(500).json({
      error: 'Stream server failed before search completed',
      details: error.message,
    });
  }
});

app.get('/audio', async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl || typeof targetUrl !== 'string') {
    return sendError(res, 400, 'Missing url');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return sendError(res, 400, 'Invalid url');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return sendError(res, 400, 'Unsupported url protocol');
  }

  const upstreamHeaders = {
    'User-Agent': MOCK_USER_AGENT,
  };

  const range = req.headers.range;
  if (range) {
    upstreamHeaders.Range = range;
  }

  const controller = new AbortController();
  req.on('close', () => controller.abort());

  try {
    const upstream = await fetch(parsedUrl, { 
      headers: upstreamHeaders,
      signal: controller.signal
    });

    if (!upstream.ok && upstream.status !== 206) {
      return sendError(res, upstream.status, `Upstream audio request failed: ${upstream.status}`);
    }

    res.status(upstream.status);

    for (const [key, value] of upstream.headers.entries()) {
      if (AUDIO_HEADERS.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'private, max-age=300');

    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'audio/mp4');
    }

    if (!upstream.body) {
      return res.end();
    }

    Readable.fromWeb(upstream.body).pipe(res);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('[Audio] Client disconnected, upstream fetch aborted.');
      return;
    }
    console.error('[Audio] Proxy error:', error.message);
    if (!res.headersSent) {
      sendError(res, 502, 'Audio proxy failed');
    } else {
      res.end();
    }
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`NullWave Stream Server listening on http://localhost:${PORT}`);
});
