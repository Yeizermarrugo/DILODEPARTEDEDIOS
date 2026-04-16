import { useEffect, useRef, useState } from 'react';

const DENIED_KEY = 'push_denied_at';
const POS_KEY = 'push_btn_pos';
const DAYS_RETRY = 3;
const SW_TIMEOUT_MS = 30000;
const DRAG_THRESHOLD = 6;
const BTN_SIZE = 56; // Tamaño fijo del botón para cálculos

type Estado = 'waiting' | 'idle' | 'subscribed' | 'loading' | 'unsupported' | 'denied';
type Pos = { x: number; y: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const buffer = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) buffer[i] = rawData.charCodeAt(i);
    return buffer.buffer;
}

function shouldAskAgain(): boolean {
    try {
        const deniedAt = localStorage.getItem(DENIED_KEY);
        if (!deniedAt) return true;
        const daysPassed = (Date.now() - parseInt(deniedAt, 10)) / 86_400_000;
        return daysPassed >= DAYS_RETRY;
    } catch { return true; }
}

function isPushSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/** * Margen de seguridad para que el botón no toque físicamente el borde del cristal.
 * Aumentado a 24px para que no se vea "muy hacia allá".
 */
function getSnapMargin(): number {
    return 24;
}

/** * FUNCIÓN CRÍTICA: Mantiene el botón dentro de los límites visuales
 */
function clamp(pos: Pos): Pos {
    const margin = getSnapMargin();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;

    return {
        x: Math.min(Math.max(margin, pos.x), vw - BTN_SIZE - margin),
        y: Math.min(Math.max(margin, pos.y), vh - BTN_SIZE - margin),
    };
}

function loadPos(): Pos {
    try {
        const saved = localStorage.getItem(POS_KEY);
        if (saved) return JSON.parse(saved) as Pos;
    } catch { /* ignorado — devuelve posición por defecto */ }
    // Por defecto: Abajo a la derecha
    return { x: document.documentElement.clientWidth - 100, y: window.innerHeight - 120 };
}

function savePos(pos: Pos) {
    try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch { /* ignorado */ }
}

function snapToEdge(pos: Pos): Pos {
    const width = document.documentElement.clientWidth;
    const margin = getSnapMargin();
    const midScreen = width / 2;
    // Si está a la izquierda de la mitad, pega a la izquierda, si no, a la derecha
    const snappedX = (pos.x + BTN_SIZE / 2) < midScreen ? margin : width - BTN_SIZE - margin;
    // Asegurar que en Y no se salga al hacer snap
    const clamped = clamp({ x: snappedX, y: pos.y });
    return clamped;
}

// ─── Componente Principal ──────────────────────────────────────────────────────

export default function PushSubscribeButton() {
    const [estado, setEstado] = useState<Estado>('waiting');
    const [showTooltip, setShowTooltip] = useState(false);

    const isDragging = useRef(false);
    const dragDistance = useRef(0);
    const startOffset = useRef<Pos>({ x: 0, y: 0 });
    const pointerStart = useRef<Pos>({ x: 0, y: 0 });
    const posRef = useRef<Pos>({ x: 0, y: 0 });

    const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
    const [posReady, setPosReady] = useState(false);
    const [activeDrag, setActiveDrag] = useState(false);

    useEffect(() => {
        const initial = clamp(snapToEdge(loadPos()));
        setPos(initial);
        posRef.current = initial;
        setPosReady(true);

        const handleResize = () => {
            const resnapped = clamp(snapToEdge(posRef.current));
            setPos(resnapped);
            posRef.current = resnapped;
            savePos(resnapped);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isPushSupported()) { setEstado('unsupported'); return; }
        if (Notification.permission === 'denied') { setEstado('denied'); return; }

        const timeout = setTimeout(() => setEstado('unsupported'), SW_TIMEOUT_MS);

        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(() => navigator.serviceWorker.ready)
            .then(reg => reg.pushManager.getSubscription())
            .then(sub => {
                clearTimeout(timeout);
                if (sub) setEstado('subscribed');
                else if (shouldAskAgain()) setEstado('idle');
                else setEstado('unsupported');
            })
            .catch(() => { clearTimeout(timeout); setEstado('unsupported'); });

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (estado === 'idle') {
            const t = setTimeout(() => setShowTooltip(true), 1200);
            return () => clearTimeout(t);
        }
        setShowTooltip(false);
    }, [estado]);

    const suscribirse = async () => {
        setEstado('loading');
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                localStorage.setItem(DENIED_KEY, String(Date.now()));
                setEstado('unsupported');
                return;
            }
            localStorage.removeItem(DENIED_KEY);
            const reg = await navigator.serviceWorker.ready;
            const res = await fetch('/api/push/vapid-key');
            const { publicKey } = await res.json();

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });

            const json = sub.toJSON();
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: json.endpoint,
                    publicKey: json.keys?.p256dh,
                    authToken: json.keys?.auth,
                    contentEncoding: 'aesgcm',
                }),
            });
            setEstado('subscribed');
        } catch (err) {
            console.error(err);
            setEstado('idle');
        }
    };

    const desuscribirse = async () => {
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await fetch('/api/push/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                });
                await sub.unsubscribe();
            }
            setEstado('idle');
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggle = () => {
        if (estado === 'subscribed') desuscribirse();
        else suscribirse();
    };

    const onPointerDown = (e: React.PointerEvent) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);

        isDragging.current = true;
        setActiveDrag(true);
        dragDistance.current = 0;
        pointerStart.current = { x: e.clientX, y: e.clientY };
        startOffset.current = {
            x: e.clientX - posRef.current.x,
            y: e.clientY - posRef.current.y,
        };
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!isDragging.current) return;

        const dx = e.clientX - pointerStart.current.x;
        const dy = e.clientY - pointerStart.current.y;
        dragDistance.current = Math.sqrt(dx * dx + dy * dy);

        // Aplicamos clamp en tiempo real
        const next = clamp({
            x: e.clientX - startOffset.current.x,
            y: e.clientY - startOffset.current.y,
        });

        setPos(next);
        posRef.current = next;
    };

    const onPointerUp = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        setActiveDrag(false);

        if (dragDistance.current < DRAG_THRESHOLD) {
            handleToggle();
        } else {
            // Al soltar, hacemos snap al borde pero siempre dentro del clamp
            const snapped = clamp(snapToEdge(posRef.current));
            setPos(snapped);
            posRef.current = snapped;
            savePos(snapped);
        }
    };

    if (['unsupported', 'waiting', 'denied'].includes(estado)) return null;

    const isSubscribed = estado === 'subscribed';
    const isLoading = estado === 'loading';

    // ── Lógica de posicionamiento del Tooltip ──
    const vw = document.documentElement.clientWidth;
    const isAtRight = pos.x + BTN_SIZE / 2 > vw / 2;

    const tooltipStyles: React.CSSProperties = {
        position: 'absolute',
        background: '#fff',
        border: '1px solid #e8e2d8',
        borderRadius: 12,
        padding: '8px 12px',
        fontSize: 12,
        color: '#444',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        width: 160,
        textAlign: 'center',
        pointerEvents: 'none',
        animation: 'fadeInTooltip 0.3s ease',
        zIndex: -1, // Detrás del botón principal
    };

    // Posición horizontal opuesta
    if (isAtRight) {
        tooltipStyles.right = BTN_SIZE + 12; // A la izquierda del botón
        tooltipStyles.transformOrigin = 'right center';
    } else {
        tooltipStyles.left = BTN_SIZE + 12; // A la derecha del botón
        tooltipStyles.transformOrigin = 'left center';
    }

    // Posición vertical (centrado con el botón, o arriba/abajo si está muy al borde)
    tooltipStyles.top = '50%';
    tooltipStyles.transform = isAtRight
        ? 'translateY(-50%) translateX(0)'
        : 'translateY(-50%) translateX(0)';


    return (
        <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{
                position: 'fixed',
                left: pos.x,
                top: pos.y,
                width: BTN_SIZE,
                height: BTN_SIZE,
                zIndex: 9900,
                userSelect: 'none',
                touchAction: 'none',
                opacity: posReady ? 1 : 0,
                pointerEvents: posReady ? 'auto' : 'none',
                // Transición suave para el snap
                transition: activeDrag
                    ? 'none'
                    : 'left 0.5s cubic-bezier(0.19, 1, 0.22, 1), top 0.4s ease, opacity 0.25s ease',
            }}
        >
            {/* Tooltip Inteligente */}
            {showTooltip && estado === 'idle' && (
                <div style={tooltipStyles}>
                    🙏 Activa las notificaciones para recibir nuevos devocionales
                </div>
            )}

            {/* Botón Principal */}
            <button
                disabled={isLoading}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: 'none',
                    background: isSubscribed ? '#e0e0e0' : '#f75815',
                    color: isSubscribed ? '#555' : '#fff',
                    fontSize: 22,
                    cursor: isLoading ? 'not-allowed' : (activeDrag ? 'grabbing' : 'grab'),
                    boxShadow: activeDrag ? '0 12px 30px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.20)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: activeDrag ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.2s, background 0.2s',
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    position: 'relative',
                    zIndex: 2,
                }}
            >
                {isLoading ? '⏳' : (isSubscribed ? '🔕' : '🔔')}
            </button>

            {/* Indicador de arrastre */}
            <div style={{
                position: 'absolute',
                bottom: -14,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 10,
                opacity: 0.2,
                fontWeight: 'bold',
                pointerEvents: 'none'
            }}>
                ✥
            </div>

            <style>{`
                @keyframes fadeInTooltip {
                    from { opacity: 0; transform: translateY(-50%) scale(0.9); }
                    to   { opacity: 1; transform: translateY(-50%) scale(1); }
                }
            `}</style>
        </div>
    );
}