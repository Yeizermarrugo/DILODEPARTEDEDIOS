// Express route example
import express from 'express';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

// Ensure process.env is available (Node.js context)

const app = express();
app.use(express.json());

app.post('/api/generate-audio', async (req, res) => {
    const { texto } = req.body;
    // ElevenLabs API example (replace with Polly/Google if needed)
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/<voice-id>', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({ text: texto }),
    });
    if (!response.ok) return res.status(500).send({ error: 'Error TTS' });
    const buffer = await response.buffer();
    const fileName = `audio-${Date.now()}.mp3`;
    const filePath = path.join(__dirname, 'audios', fileName);
    fs.writeFileSync(filePath, buffer);
    res.json({ audioUrl: `/audios/${fileName}` });
});
