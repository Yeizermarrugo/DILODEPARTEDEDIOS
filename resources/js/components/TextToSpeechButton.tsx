import { useRef, useState } from 'react';

const LANG = 'es-CO';

const VOICES = [
    { label: 'Salomé (Colombia)', value: 'es-CO-SalomeNeural', available: true },
    { label: 'Gonzalo (Colombia)', value: 'es-CO-GonzaloNeural', available: true },
    { label: 'Dalia (México)', value: 'es-MX-DaliaNeural', available: true, lang: 'es-MX' },
    { label: 'Jorge (México)', value: 'es-MX-JorgeNeural', available: true, lang: 'es-MX' },
];

function csrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

export default function TextToSpeechButton({ texto }: { texto: string }) {
    const [selectedVoice, setSelectedVoice] = useState(VOICES[0].value);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [rate, setRate] = useState(1);
    const [showSpeed, setShowSpeed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioReady, setAudioReady] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playAudio = async (): Promise<boolean> => {
        setLoading(true);
        setAudioUrl(null);
        setAudioReady(false);

        const selectedVoiceConfig = VOICES.find((voice) => voice.value === selectedVoice);
        const lang = selectedVoiceConfig?.lang ?? LANG;
        const rateParam = Math.round((rate - 1) * 100);

        try {
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify({
                    texto,
                    lang,
                    r: rateParam,
                    v: selectedVoice,
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                setLoading(false);
                alert('Error generando el audio:\n' + errorText);
                setIsPlaying(false);
                return false;
            }
            const data = await res.json();
            const audioUrl = data.url.startsWith('http') ? data.url : window.location.origin + data.url;

            setAudioUrl(audioUrl);
            const audio = audioRef.current;

            if (!audio) {
                setLoading(false);
                setIsPlaying(false);
                return false;
            }

            audio.src = audioUrl;

            try {
                await audio.play();
            } catch {
                setLoading(false);
                setIsPlaying(false);
                setIsPaused(false);
                setAudioReady(true);
                return false;
            }

            setLoading(false);
            setIsPlaying(true);
            setIsPaused(false);
            setAudioReady(false);

            return true;
        } catch {
            setLoading(false);
            setIsPlaying(false);
            alert('Error generando el audio.');
            return false;
        }
    };

    const handleMainClick = () => {
        if (audioReady && audioRef.current && !loading) {
            audioRef.current.play()
                .then(() => {
                    setAudioReady(false);
                    setIsPlaying(true);
                    setIsPaused(false);
                })
                .catch(() => {
                    alert('No se pudo reproducir el audio. Abre el enlace del audio o recarga la página.');
                });
            return;
        }

        if (!isPlaying && !loading) {
            playAudio();
        } else if (isPlaying && !isPaused) {
            audioRef.current?.pause();
            setIsPaused(true);
        } else if (isPlaying && isPaused) {
            audioRef.current?.play();
            setIsPaused(false);
        }
    };

    const handleStopClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setIsPaused(false);
        setLoading(false);
        setAudioReady(false);
    };

    const onEnded = () => {
        setLoading(false);
        setAudioReady(false);
        setIsPlaying(false);
        setIsPaused(false);
    };

    return (
        <div style={{ margin: '12px 0', width: '100%' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}
            >
                <button
                    aria-label={isPlaying ? (isPaused ? 'Reanudar' : 'Pausa') : 'Play'}
                    onClick={handleMainClick}
                    disabled={loading}
                    style={mainBtnStyle}
                >
                    {loading && <span>⏳</span>}
                    {!isPlaying && !loading && <span>▶️</span>}
                    {isPlaying && !isPaused && !loading && <span>⏸</span>}
                    {isPlaying && isPaused && !loading && <span>▶️</span>}
                </button>
                {isPlaying && (
                    <button aria-label="Stop" onClick={handleStopClick} style={{ ...mainBtnStyle, background: '#6C63FF' }}>
                        ⏹
                    </button>
                )}

                {/* Selector de voz */}
                <select
                    aria-label="Seleccionar voz"
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    style={{
                        ...mainBtnStyle,
                        background: '#f4f4f4',
                        color: '#333',
                        minWidth: 150,
                        fontSize: '1em',
                        maxWidth: '100%',
                    }}
                >
                    {VOICES.map((voice) => (
                        <option key={voice.value} value={voice.value} disabled={!voice.available}>
                            {voice.label} {!voice.available && '(No disponible)'}
                        </option>
                    ))}
                </select>

                <div style={{ position: 'relative', minWidth: 56 }}>
                    <button
                        aria-label="Velocidad"
                        onClick={() => setShowSpeed((v) => !v)}
                        style={{
                            ...mainBtnStyle,
                            background: '#f4f4f4',
                            color: '#6C63FF',
                            fontWeight: 700,
                            minWidth: 56,
                            fontSize: '1em',
                        }}
                    >
                        x{rate}
                    </button>
                    {showSpeed && (
                        <div style={speedMenuStyle}>
                            {[0.75, 1, 1.25, 1.5, 2].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => {
                                        setRate(r);
                                        setShowSpeed(false);
                                    }}
                                    style={{
                                        ...mainBtnStyle,
                                        background: r === rate ? '#6C63FF' : '#f4f4f4',
                                        color: r === rate ? '#fff' : '#6C63FF',
                                        fontSize: '1em',
                                        minWidth: 56,
                                        margin: 2,
                                    }}
                                >
                                    x{r}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <audio
                ref={audioRef}
                src={audioUrl || undefined}
                onEnded={onEnded}
                onPause={() => setIsPaused(true)}
                onPlay={() => setIsPaused(false)}
                style={{ display: 'none' }}
            />

            {audioReady && (
                <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.95em', color: '#6C63FF' }}>
                    Audio listo. Toca Play para escucharlo.
                </div>
            )}
        </div>
    );
}

// Estilos
const mainBtnStyle = {
    background: '#6C63FF',
    color: '#fff',
    borderRadius: '2rem',
    border: 'none',
    padding: '0.5rem 1.2rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '1.35em',
    boxShadow: '0 2px 12px rgba(108,99,255,0.09)',
    minWidth: '44px',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const speedMenuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '110%',
    left: 0,
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: '1em',
    padding: '4px 5px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 20,
    boxShadow: '0 2px 18px rgba(0,0,0,0.09)',
    minWidth: 56,
};
