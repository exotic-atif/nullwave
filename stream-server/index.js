const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('NullWave Stream Server (yt-dlp) is running');
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

    // Return the URL to the frontend
    res.json({
      streamUrl: streamUrl,
      quality: 'high',
      mimeType: 'audio/mp4' // The player will handle it
    });

  } catch (error) {
    console.error(`[Stream] Exception for ${query}:`, error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`NullWave Stream Server listening on http://localhost:${PORT}`);
});
