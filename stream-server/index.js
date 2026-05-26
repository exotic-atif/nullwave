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

function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

function sendError(res, status, message) {
  res.status(status).json({ error: message });
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

app.get('/stream', async (req, res) => {
  const { title, artist } = req.query;

  if (!title) {
    return res.status(400).json({ error: 'Missing title' });
  }

  const query = `ytsearch1:"${title} ${artist || ''} audio"`;
  console.log(`[Stream] Searching for: ${query}`);

  try {
    // Run yt-dlp to get the direct stream URL
    // -f bestaudio gets the best audio format
    // -g gets the direct URL instead of downloading
    const output = await youtubedl(query, {
      extractAudio: true,
      audioFormat: 'best',
      getUrl: true,
      noWarnings: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
    });

    // The output is just the raw URL string
    const streamUrl = typeof output === 'string' ? output.trim() : null;

    if (!streamUrl || !streamUrl.startsWith('http')) {
      return res.status(404).json({ error: 'No stream URL found' });
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
    console.error(`[Stream] Exception for ${query}:`, error.message);
    res.status(500).json({ error: 'Internal server error' });
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
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  };

  const range = req.headers.range;
  if (range) {
    upstreamHeaders.Range = range;
  }

  try {
    const upstream = await fetch(parsedUrl, { headers: upstreamHeaders });

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
