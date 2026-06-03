import { buildReadingTimings, extractReadingBlocks, findActiveReadingBlock, type ReadingBlock, type ReadingTiming } from '@/utils/ttsReading';
import { useEffect, useRef, useState } from 'react';

const LANG = 'es-CO';

const VOICES = [
    { label: 'Alonso (América)', value: 'es-US-AlonsoNeural', available: true, lang: 'es-US' },
    { label: 'Paloma (América)', value: 'es-US-PalomaNeural', available: true, lang: 'es-US' },
    { label: 'Dalia (México)', value: 'es-MX-DaliaNeural', available: true, lang: 'es-MX' },
    { label: 'Jorge (México)', value: 'es-MX-JorgeNeural', available: true, lang: 'es-MX' },
    { label: 'Elvira (España)', value: 'es-ES-ElviraNeural', available: true, lang: 'es-ES' },
    { label: 'Alvaro (España)', value: 'es-ES-AlvaroNeural', available: true, lang: 'es-ES' },
];

function csrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

type Props = {
    html: string;
    onBlockChange?: (index: number | null) => void;
};

type TtsResponse = {
    timings?: ReadingTiming[] | null;
    url: string;
};

export default function TextToSpeechButton({ html, onBlockChange }: Props) {
    const [selectedVoice, setSelectedVoice] = useState(VOICES[0].value);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [rate, setRate] = useState(1);
    const [showSpeed, setShowSpeed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioReady, setAudioReady] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const blocksRef = useRef(extractReadingBlocks(html));
    const timingsRef = useRef<{ end: number; index: number; start: number }[]>([]);
    const hasServerTimingsRef = useRef(false);
    const activeBlockRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const emitBlockChange = (index: number | null) => {
        if (activeBlockRef.current === index) {
            return;
        }

        activeBlockRef.current = index;
        onBlockChange?.(index);
    };

    const stopRaf = () => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    };

    const startRaf = () => {
        stopRaf();
        const tick = () => {
            syncActiveBlock();
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
    };

    useEffect(() => () => {
        stopRaf();
        abortRef.current?.abort();
    }, []);

    const rebuildTimings = () => {
        if (hasServerTimingsRef.current) {
            return;
        }

        const audio = audioRef.current;
        timingsRef.current = buildReadingTimings(blocksRef.current, audio?.duration);
    };

    const setServerTimings = (timings: ReadingTiming[] | null | undefined, blocks: ReadingBlock[]) => {
        if (!Array.isArray(timings)) {
            hasServerTimingsRef.current = false;
            return;
        }

        const blockIndexes = new Set(blocks.map((block) => block.index));
        const validTimings = timings
            .filter((timing) => blockIndexes.has(timing.index))
            .sort((a, b) => a.start - b.start);

        if (validTimings.length !== blocks.length) {
            hasServerTimingsRef.current = false;
            return;
        }

        timingsRef.current = validTimings;
        hasServerTimingsRef.current = true;
    };

    const syncActiveBlock = () => {
        const audio = audioRef.current;
        if (!audio) {
            emitBlockChange(null);
            return;
        }

        const active = findActiveReadingBlock(timingsRef.current, audio.currentTime);
        emitBlockChange(active);
    };

    const loadAudio = async (): Promise<boolean> => {
        // Cancel any in-flight request before starting a new one
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setAudioUrl(null);
        setAudioReady(false);
        setIsPlaying(false);
        setIsPaused(false);
        emitBlockChange(null);
        blocksRef.current = extractReadingBlocks(html);
        timingsRef.current = [];
        hasServerTimingsRef.current = false;

        const selectedVoiceConfig = VOICES.find((voice) => voice.value === selectedVoice);
        const lang = selectedVoiceConfig?.lang ?? LANG;
        const readingBlocks = blocksRef.current;

        try {
            const res = await fetch('/api/tts', {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify({
                    texto: html,
                    format: 'html',
                    lang,
                    v: selectedVoice,
                    blocks: readingBlocks.map((block) => ({
                        index: block.index,
                        kind: block.kind,
                        text: block.text,
                    })),
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                setLoading(false);
                setIsPlaying(false);
                alert('Error generando el audio:\n' + errorText);
                return false;
            }
            const data = await res.json() as TtsResponse;
            const audioUrl = data.url.startsWith('http') ? data.url : window.location.origin + data.url;

            setAudioUrl(audioUrl);
            const audio = audioRef.current;

            if (!audio) {
                setLoading(false);
                setIsPlaying(false);
                return false;
            }

            audio.src = audioUrl;
            audio.playbackRate = rate;
            rebuildTimings();
            setServerTimings(data.timings, readingBlocks);

            setLoading(false);
            setAudioReady(true);
            setIsPlaying(false);
            setIsPaused(false);

            return true;
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                // Request was cancelled intentionally — don't show error
                return false;
            }
            setLoading(false);
            setIsPlaying(false);
            alert('Error generando el audio.');
            return false;
        }
    };

    const handleMainClick = () => {
        if (audioReady && audioRef.current && !loading) {
            audioRef.current.playbackRate = rate;
            audioRef.current.play()
                .then(() => {
                    setAudioReady(false);
                    setIsPlaying(true);
                    setIsPaused(false);
                    startRaf();
                })
                .catch(() => {
                    alert('No se pudo reproducir el audio. Intenta tocar Play otra vez.');
                });
            return;
        }

        if (!isPlaying && !loading) {
            loadAudio();
        } else if (isPlaying && !isPaused && !loading) {
            audioRef.current?.pause();
            stopRaf();
            setIsPaused(true);
        } else if (isPlaying && isPaused && !loading) {
            audioRef.current?.play();
            startRaf();
            setIsPaused(false);
        }
    };

    const handleStopClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
        stopRaf();
        setIsPlaying(false);
        setIsPaused(false);
        setLoading(false);
        setAudioReady(false);
        emitBlockChange(null);
    };

    const onEnded = () => {
        stopRaf();
        setLoading(false);
        setAudioReady(false);
        setIsPlaying(false);
        setIsPaused(false);
        emitBlockChange(null);
    };

    const onLoadedMetadata = () => {
        rebuildTimings();
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
                                        if (audioRef.current) {
                                            audioRef.current.playbackRate = r;
                                        }
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
                onLoadedMetadata={onLoadedMetadata}
                onPause={() => { stopRaf(); setIsPaused(true); }}
                onPlay={() => { startRaf(); setIsPaused(false); }}
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
