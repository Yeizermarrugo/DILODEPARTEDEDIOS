import { useRef, useState } from 'react';

interface TextToSpeechAudioPlayerProps {
    texto: string;
}

export default function TextToSpeechAudioPlayer({ texto }: TextToSpeechAudioPlayerProps) {
    const [audioUrl, setAudioUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const handleGenerateAudio = async () => {
        setLoading(true);
        setAudioUrl('');
        try {
            // Cambia la URL por tu endpoint real
            const res = await fetch('/api/generate-audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texto }),
            });
            const data = await res.json();
            setAudioUrl(data.audioUrl); // debe ser la URL pública del mp3
        } catch {
            alert('Ocurrió un error al generar el audio.');
        }
        setLoading(false);
    };

    return (
        <div>
            <button onClick={handleGenerateAudio} disabled={loading}>
                {loading ? 'Generando...' : '🔊 Generar audio'}
            </button>
            {audioUrl && (
                <div style={{ marginTop: 16 }}>
                    <audio ref={audioRef} src={audioUrl} controls style={{ width: '100%' }} />
                    <div style={{ marginTop: 8 }}>
                        <label>Velocidad:&nbsp;</label>
                        <select
                            defaultValue={1}
                            onChange={(e) => {
                                if (audioRef.current) {
                                    audioRef.current.playbackRate = Number(e.target.value);
                                }
                            }}
                        >
                            <option value={0.75}>0.75x</option>
                            <option value={1}>1x</option>
                            <option value={1.5}>1.5x</option>
                            <option value={2}>2x</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
