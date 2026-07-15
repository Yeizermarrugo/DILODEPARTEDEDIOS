import CardNew from '@/components/CardNew';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/react';
import { Download, FileArchive, Loader2, Play } from 'lucide-react';
import { useState } from 'react';
import '../../css/admin-edit.css';
import '../../css/cardNew.css';

interface VoicePair {
    lang: string;
    voice: string;
    label: string;
}

interface FolderItem {
    id: string;
    position: number;
    categoria: string | null;
    autor: string | null;
    imagen: string | null;
    titulo: string;
    views_count: number | null;
    filename: string;
}

interface MonthOption {
    month: number;
    name: string;
}

interface Props {
    month: number;
    monthName: string;
    capacity: number;
    items: FolderItem[];
    voicePairs: VoicePair[];
    todasLasCategorias: string[];
    monthOptions: MonthOption[];
}

function voiceKey(lang: string, voice: string): string {
    return `${lang}|${voice}`;
}

function csrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

export default function DevocionalAudioFolderDetail({ month, monthName, capacity, items, voicePairs, todasLasCategorias, monthOptions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Carpetas de audio', href: '/devocionales-audio-folders' },
        { title: monthName, href: `/devocionales-audio-folders/${month}` },
    ];

    const defaultPair = voicePairs[0] ?? { lang: 'es-MX', voice: 'es-MX-DaliaNeural', label: 'Dalia' };
    const [selectedKey, setSelectedKey] = useState(voiceKey(defaultPair.lang, defaultPair.voice));
    const [lang, voice] = selectedKey.split('|');

    const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [zipLoading, setZipLoading] = useState(false);
    const [moveTargets, setMoveTargets] = useState<Record<string, number>>({});
    const [movingId, setMovingId] = useState<string | null>(null);

    const playCardKey = (id: string) => `${id}|${selectedKey}`;

    const loadAudio = async (id: string) => {
        const cacheKey = playCardKey(id);
        if (audioUrls[cacheKey]) return;

        setLoadingId(id);
        try {
            const res = await fetch(`/devocionales-audio-folders-audio/${id}/url?lang=${lang}&voice=${voice}`);
            const data = (await res.json()) as { url: string };
            setAudioUrls((prev) => ({ ...prev, [cacheKey]: data.url }));
        } finally {
            setLoadingId(null);
        }
    };

    const downloadZip = () => {
        setZipLoading(true);
        window.location.href = `/devocionales-audio-folders/${month}/zip?lang=${lang}&voice=${voice}`;
        setTimeout(() => setZipLoading(false), 3000);
    };

    const moveItem = async (id: string) => {
        const target = moveTargets[id];
        if (!target || target === month) return;

        setMovingId(id);
        try {
            const res = await fetch('/devocionales-audio-folders/move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify({ id, month: target }),
            });

            if (!res.ok) {
                const data = (await res.json().catch(() => null)) as { message?: string } | null;
                alert(data?.message ?? 'No se pudo mover el devocional.');
                return;
            }

            router.reload({ only: ['items', 'capacity'] });
        } finally {
            setMovingId(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-6 p-3 sm:p-5 md:p-7" style={{ backgroundColor: '#f5f0e8', minHeight: '100vh' }}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold" style={{ color: '#2d465e', fontFamily: "'Cormorant Garamond', serif" }}>
                            {monthName}
                        </h1>
                        <p className="mt-1 text-sm" style={{ color: '#8a7f72' }}>
                            {items.length} de {capacity} devocionales
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={selectedKey}
                            onChange={(e) => {
                                setSelectedKey(e.target.value);
                            }}
                            className="rounded-xl border px-3 py-2 text-sm"
                            style={{ borderColor: '#e8e2d8', backgroundColor: '#fff', color: '#2d465e' }}
                        >
                            {voicePairs.map((pair) => (
                                <option key={voiceKey(pair.lang, pair.voice)} value={voiceKey(pair.lang, pair.voice)}>
                                    {pair.label}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={downloadZip}
                            disabled={zipLoading || items.length === 0}
                            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
                            style={{ backgroundColor: '#f75815', color: '#fff' }}
                        >
                            {zipLoading ? <Loader2 size={14} className="animate-spin" /> : <FileArchive size={14} />}
                            Descargar ZIP
                        </button>
                    </div>
                </div>

                {items.length === 0 && (
                    <div
                        className="flex flex-col items-center justify-center rounded-2xl border py-20 text-center"
                        style={{ backgroundColor: '#fff', borderColor: '#e8e2d8' }}
                    >
                        <p className="font-semibold" style={{ color: '#2d465e' }}>
                            Carpeta vacía
                        </p>
                        <p className="mt-1 text-sm" style={{ color: '#8a7f72' }}>
                            Volvé a la lista de carpetas y usá "Rellenar carpetas" para asignar devocionales.
                        </p>
                    </div>
                )}

                <div className="ae-grid">
                    {items.map((item) => {
                        const cacheKey = playCardKey(item.id);
                        const url = audioUrls[cacheKey];
                        const isLoading = loadingId === item.id;
                        const isMoving = movingId === item.id;

                        return (
                            <div key={item.id} className="ae-card-wrap">
                                <CardNew
                                    dev={{
                                        id: item.id,
                                        imagen: item.imagen ?? '',
                                        titulo: item.titulo,
                                        autor: item.autor ?? '',
                                        categoria: item.categoria ?? '',
                                        views_count: item.views_count ?? 0,
                                        is_devocional: 1,
                                    }}
                                    todasLasCategorias={todasLasCategorias}
                                    onClick={() => window.open(`/devocional/${item.id}`, '_blank')}
                                />

                                <div className="ae-card-actions">
                                    <span className="ae-card-btn" style={{ background: '#f5f0e8', color: '#2d465e', flex: '0 0 auto' }}>
                                        #{item.position}
                                    </span>

                                    {url ? (
                                        <audio controls autoPlay src={url} style={{ flex: 1, height: 30 }} />
                                    ) : (
                                        <button
                                            onClick={() => loadAudio(item.id)}
                                            disabled={isLoading}
                                            className="ae-card-btn ae-card-btn--view"
                                        >
                                            {isLoading ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}
                                            {isLoading ? 'Generando…' : 'Reproducir'}
                                        </button>
                                    )}

                                    <a
                                        href={`/devocionales-audio-folders-audio/${item.id}?lang=${lang}&voice=${voice}`}
                                        className="ae-card-btn ae-card-btn--edit"
                                        style={{ flex: '0 0 auto' }}
                                    >
                                        <Download size={11} />
                                    </a>
                                </div>

                                <div className="ae-card-actions">
                                    <select
                                        value={moveTargets[item.id] ?? ''}
                                        onChange={(e) => setMoveTargets((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                                        className="ae-card-btn"
                                        style={{ background: '#fff', color: '#2d465e', border: '1px solid #e8e2d8', fontWeight: 500 }}
                                    >
                                        <option value="">Mover a…</option>
                                        {monthOptions
                                            .filter((opt) => opt.month !== month)
                                            .map((opt) => (
                                                <option key={opt.month} value={opt.month}>
                                                    {opt.name}
                                                </option>
                                            ))}
                                    </select>
                                    <button
                                        onClick={() => moveItem(item.id)}
                                        disabled={isMoving || !moveTargets[item.id]}
                                        className="ae-card-btn ae-card-btn--hide"
                                        style={{ flex: '0 0 auto' }}
                                    >
                                        {isMoving ? <Loader2 size={11} className="animate-spin" /> : 'OK'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
