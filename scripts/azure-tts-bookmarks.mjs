import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

const FORMAT_MAP = {
    'audio-16khz-32kbitrate-mono-mp3': SpeechSDK.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3,
    'audio-16khz-64kbitrate-mono-mp3': SpeechSDK.SpeechSynthesisOutputFormat.Audio16Khz64KBitRateMonoMp3,
    'audio-16khz-128kbitrate-mono-mp3': SpeechSDK.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3,
    'audio-24khz-48kbitrate-mono-mp3': SpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3,
    'audio-24khz-96kbitrate-mono-mp3': SpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz96KBitRateMonoMp3,
    'audio-24khz-160kbitrate-mono-mp3': SpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3,
    'audio-48khz-96kbitrate-mono-mp3': SpeechSDK.SpeechSynthesisOutputFormat.Audio48Khz96KBitRateMonoMp3,
    'audio-48khz-192kbitrate-mono-mp3': SpeechSDK.SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3,
};

async function readStdin() {
    let input = '';
    for await (const chunk of process.stdin) {
        input += chunk;
    }

    return JSON.parse(input);
}

function closeSynthesizer(synthesizer) {
    return new Promise((resolve) => {
        synthesizer.close(resolve, resolve);
    });
}

const SYNTHESIS_TIMEOUT_MS = 50_000;

async function synthesize({ key, region, outputFormat, outputPath, ssml, voice }) {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(key, region);
    speechConfig.speechSynthesisVoiceName = voice;
    speechConfig.speechSynthesisOutputFormat =
        FORMAT_MAP[outputFormat] ?? SpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);
    const bookmarks = [];

    synthesizer.bookmarkReached = (_sender, event) => {
        bookmarks.push({
            mark: event.text,
            offset: event.audioOffset / 10_000_000,
        });
    };

    let timeoutHandle;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(
            () => reject(new Error(`Azure synthesis timed out after ${SYNTHESIS_TIMEOUT_MS / 1000}s`)),
            SYNTHESIS_TIMEOUT_MS,
        );
    });

    try {
        const result = await Promise.race([
            new Promise((resolve, reject) => {
                synthesizer.speakSsmlAsync(ssml, resolve, reject);
            }),
            timeoutPromise,
        ]);

        clearTimeout(timeoutHandle);

        if (result.reason !== SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
            throw new Error(result.errorDetails || `Azure synthesis failed with reason ${result.reason}`);
        }

        fs.writeFileSync(outputPath, Buffer.from(result.audioData));

        return {
            bookmarks,
            duration: result.audioDuration ? result.audioDuration / 10_000_000 : null,
        };
    } finally {
        clearTimeout(timeoutHandle);
        await closeSynthesizer(synthesizer);
    }
}

try {
    const payload = await readStdin();
    const result = await synthesize(payload);
    process.stdout.write(`${JSON.stringify(result)}\n`);
} catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
}
