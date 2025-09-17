import { useEffect, useRef, useState } from 'react';

export default function TextToSpeechButton({ texto }: { texto: string }) {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [rate, setRate] = useState(1);
    const [showSpeed, setShowSpeed] = useState(false);
    const [currentWordIdx, setCurrentWordIdx] = useState(0);
    const [words, setWords] = useState<string[]>([]);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        setWords(texto.trim().split(/\s+/));
    }, [texto]);

    // Carga voces disponibles y solo muestra las de español
    useEffect(() => {
        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            const spanishVoices = allVoices.filter((v) => v.lang.startsWith('es'));
            setVoices(spanishVoices.length ? spanishVoices : allVoices); // fallback si no hay voces "es"
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => window.speechSynthesis.cancel();
    }, []);

    // PLAY (desde inicio)
    const handlePlay = () => {
        window.speechSynthesis.cancel();
        setCurrentWordIdx(0);
        const utterance = new window.SpeechSynthesisUtterance(texto);
        utterance.voice = voices[selectedVoiceIndex] || null;
        utterance.rate = rate;
        utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentWordIdx(words.length);
        };
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                const idx = texto.slice(0, event.charIndex).trim().split(/\s+/).length;
                setCurrentWordIdx(idx);
            }
        };
        utterance.onpause = () => setIsPaused(true);
        utterance.onresume = () => setIsPaused(false);
        window.speechSynthesis.speak(utterance);
        utteranceRef.current = utterance;
        setIsPlaying(true);
        setIsPaused(false);
    };

    // PAUSE
    const handlePause = () => {
        window.speechSynthesis.pause();
        setIsPaused(true);
    };

    // RESUME
    const handleResume = () => {
        window.speechSynthesis.resume();
        setIsPaused(false);
    };

    // STOP
    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIdx(0);
    };

    // Avance estimado por palabras
    const progress = words.length ? Math.min(currentWordIdx / words.length, 1) : 0;

    // Botón principal (Play/Pause/Resume/Stop)
    const handleMainClick = () => {
        if (!isPlaying) handlePlay();
        else if (isPlaying && !isPaused) handlePause();
        else if (isPlaying && isPaused) handleResume();
    };

    const handleStopClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        handleStop();
    };

    // Estilos responsivos y modernos
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
                {/* Botón único Play/Pause/Resume */}
                <button aria-label={isPlaying ? (isPaused ? 'Reanudar' : 'Pausa') : 'Play'} onClick={handleMainClick} style={mainBtnStyle}>
                    {!isPlaying && <span>▶️</span>}
                    {isPlaying && !isPaused && <span>⏸</span>}
                    {isPlaying && isPaused && <span>▶️</span>}
                </button>
                {/* Botón Stop sólo visible en reproducción */}
                {isPlaying && (
                    <button aria-label="Stop" onClick={handleStopClick} style={{ ...mainBtnStyle, background: '#6C63FF' }}>
                        ⏹
                    </button>
                )}

                {/* Selector de velocidad compacto */}
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
                                        if (isPlaying) handlePlay();
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

                {/* Selector de voz */}
                <select
                    aria-label="Seleccionar voz"
                    value={selectedVoiceIndex}
                    onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
                    style={{ ...mainBtnStyle, background: '#f4f4f4', color: '#333', minWidth: 150, fontSize: '1em' }}
                >
                    {voices.map((voice, idx) => (
                        <option key={voice.voiceURI} value={idx}>
                            {voice.name} ({voice.lang})
                        </option>
                    ))}
                </select>
            </div>
            {/* Barra de progreso por palabras */}
            <div
                style={{
                    width: '100%',
                    height: '8px',
                    background: '#eee',
                    borderRadius: '5px',
                    marginTop: '16px',
                    position: 'relative',
                    maxWidth: '400px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                }}
            >
                <div
                    style={{
                        width: `${progress * 100}%`,
                        height: '100%',
                        background: '#6C63FF',
                        borderRadius: '5px',
                        transition: 'width .2s',
                    }}
                />
            </div>
            <div
                style={{
                    fontSize: '0.88em',
                    marginTop: '4px',
                    textAlign: 'right',
                    maxWidth: '400px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                }}
            >{`${Math.round(progress * 100)}% leído`}</div>
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

// Menú de velocidades
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
