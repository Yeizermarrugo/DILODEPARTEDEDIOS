import { useRef, useState } from 'react';

const LANG = 'es-mx';
const MAX_LENGTH = 900;

// Lista de voces de Voice RSS para español (México)
const VOICES = [
    { label: 'Jose (masculino)', value: 'Jose', available: true },
    { label: 'Juana (femenino)', value: 'Juana', available: true },
    { label: 'Silvia (femenino)', value: 'Silvia', available: true },
    { label: 'Teresa (femenino)', value: 'Teresa', available: true },
];

function splitText(text: string, maxLength = MAX_LENGTH): string[] {
    const parts = [];
    let i = 0;
    while (i < text.length) {
        let end = i + maxLength;
        if (end < text.length) {
            const lastDot = text.lastIndexOf('.', end);
            if (lastDot > i) end = lastDot + 1;
            end = lastDot > i ? lastDot + 1 : end;
        }
        parts.push(text.slice(i, end).trim());
        i = end;
    }
    return parts;
}

export default function TextToSpeechButton({ texto }: { texto: string }) {
    const [selectedVoice, setSelectedVoice] = useState(VOICES[0].value);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [rate, setRate] = useState(1);
    const [showSpeed, setShowSpeed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentPartIdx, setCurrentPartIdx] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const parts = splitText(texto);

    // Reproduce la parte actual (usando backend Laravel)
    const playPart = async (idx: number) => {
        setLoading(true);
        setAudioUrl(null);

        const rateParam = Math.round((rate - 1) * 10);
        const url = `/api/tts?texto=${encodeURIComponent(parts[idx])}&lang=${LANG}&r=${rateParam}&v=${selectedVoice}`;

        try {
            const res = await fetch(url);
            if (!res.ok) {
                const errorText = await res.text();
                setLoading(false);
                alert('Error generando el audio:\n' + errorText);
                setIsPlaying(false);
                return;
            }
            const data = await res.json();
            const audioUrl = data.url.startsWith('http') ? data.url : window.location.origin + data.url;

            setAudioUrl(audioUrl);
            console.log('audioUrl', audioUrl);

            setTimeout(() => {
                audioRef.current?.play();
                setIsPlaying(true);
                setIsPaused(false);
            }, 100);
        } catch {
            setLoading(false);
            setIsPlaying(false);
            alert('Error generando el audio.');
        }
    };
    console.log('audioUrl', audioUrl);

    const playAllParts = async () => {
        setCurrentPartIdx(0);
        for (let idx = 0; idx < parts.length; idx++) {
            setCurrentPartIdx(idx);
            await playPartSync(idx);
        }
        setIsPlaying(false);
        setCurrentPartIdx(0);
    };

    const playPartSync = async (idx: number) => {
        await playPart(idx);
        await new Promise<void>((resolve) => {
            if (audioRef.current) {
                audioRef.current.onended = () => resolve();
            } else {
                resolve();
            }
        });
    };

    const handleMainClick = () => {
        if (!isPlaying && !loading) {
            playAllParts();
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
        setCurrentPartIdx(0);
    };

    const onEnded = () => {
        setLoading(false);
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

            {parts.length > 1 && isPlaying && (
                <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.95em', color: '#6C63FF' }}>
                    Fragmento {currentPartIdx + 1} de {parts.length}
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
