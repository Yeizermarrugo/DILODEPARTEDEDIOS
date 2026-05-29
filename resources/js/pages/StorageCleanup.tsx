import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { FileText, Film, Image, RefreshCw, Trash2, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Limpieza de almacenamiento', href: '/storage-cleanup' },
];

interface OrphanedFile {
    path: string;
    url: string;
    name: string;
    folder: string;
    extension: string;
    is_image: boolean;
    is_pdf: boolean;
    is_video: boolean;
    is_audio?: boolean;
}

const FOLDER_LABELS: Record<string, string> = {
    imagenes: 'Imágenes',
    'imagenes/dev': 'Imágenes (dev)',
    postCard: 'Post Cards',
    'postCard/dev': 'Post Cards (dev)',
    pdf: 'PDFs',
    'pdf/dev': 'PDFs (dev)',
    videos: 'Videos',
    'videos/dev': 'Videos (dev)',
    tts: 'Audios TTS',
    'tts/dev': 'Audios TTS (dev)',
};

function FileIcon({ file }: { file: OrphanedFile }) {
    if (file.is_pdf) return <FileText size={32} style={{ color: '#e53e3e' }} />;
    if (file.is_video) return <Film size={32} style={{ color: '#805ad5' }} />;
    if (file.is_audio) return <Volume2 size={32} style={{ color: '#0f766e' }} />;
    return <Image size={32} style={{ color: '#2d465e' }} />;
}

function folderLabel(folder: string): string {
    const parts = folder.split('/').filter(Boolean);
    const key = parts[1] === 'dev' ? `${parts[0]}/dev` : (parts[0] ?? folder);

    return FOLDER_LABELS[key] ?? folder;
}

function StorageCleanupSkeleton() {
    return (
        <div className="flex flex-col gap-5" aria-hidden="true">
            {[0, 1].map((group) => (
                <div key={group} className="flex flex-col gap-3">
                    <div className="h-3 w-44 animate-pulse rounded-full bg-[#e8e2d8]" />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="animate-pulse overflow-hidden rounded-2xl border bg-white" style={{ borderColor: '#e8e2d8' }}>
                                <div className="aspect-video bg-[#ece6dc]" />
                                <div className="space-y-3 p-3">
                                    <div className="h-4 w-3/4 rounded-full bg-[#ece6dc]" />
                                    <div className="h-3 w-1/2 rounded-full bg-[#f0ebe3]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function StorageCleanup() {
    const [orphaned, setOrphaned] = useState<OrphanedFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [deleting, setDeleting] = useState(false);

    const fetchOrphaned = () => {
        setLoading(true);
        setSelected(new Set());
        axios
            .get<OrphanedFile[]>('/storage-cleanup/orphaned')
            .then((res) => setOrphaned(res.data))
            .catch(() => setOrphaned([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchOrphaned();
    }, []);

    const toggleSelect = (path: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }

            return next;
        });
    };

    const toggleAll = () => {
        setSelected((prev) => (prev.size === orphaned.length ? new Set() : new Set(orphaned.map((f) => f.path))));
    };

    const deletePaths = (paths: string[]) => {
        setDeleting(true);
        router.delete('/storage-cleanup', {
            data: { paths },
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => fetchOrphaned(),
            onFinish: () => {
                setDeleting(false);
                setSelected(new Set());
            },
        });
    };

    const deleteSelected = () => {
        if (selected.size === 0) return;
        if (!confirm(`¿Eliminar ${selected.size} archivo${selected.size > 1 ? 's' : ''}? Esta acción no se puede deshacer.`)) return;
        deletePaths(Array.from(selected));
    };

    const deleteSingle = (path: string) => {
        if (!confirm('¿Eliminar este archivo? Esta acción no se puede deshacer.')) return;
        deletePaths([path]);
    };

    const byFolder = orphaned.reduce<Record<string, OrphanedFile[]>>((acc, f) => {
        (acc[f.folder] ??= []).push(f);
        return acc;
    }, {});

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-6 p-3 sm:p-5 md:p-7" style={{ backgroundColor: '#f5f0e8', minHeight: '100vh' }}>
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold" style={{ color: '#2d465e', fontFamily: "'Cormorant Garamond', serif" }}>
                            Limpieza de almacenamiento
                        </h1>
                        <p className="mt-1 text-sm" style={{ color: '#8a7f72' }}>
                            {loading
                                ? 'Escaneando bucket…'
                                : orphaned.length === 0
                                  ? 'No hay archivos huérfanos. El bucket está limpio.'
                                  : `${orphaned.length} archivo${orphaned.length > 1 ? 's' : ''} sin usar en el bucket`}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchOrphaned}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors disabled:opacity-50"
                            style={{ borderColor: '#e8e2d8', backgroundColor: '#fff', color: '#2d465e' }}
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            Actualizar
                        </button>

                        {!loading && orphaned.length > 0 && (
                            <>
                                <button
                                    onClick={toggleAll}
                                    className="rounded-xl border px-4 py-2 text-sm transition-colors"
                                    style={{ borderColor: '#e8e2d8', backgroundColor: '#fff', color: '#2d465e' }}
                                >
                                    {selected.size === orphaned.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                                </button>
                                {selected.size > 0 && (
                                    <button
                                        onClick={deleteSelected}
                                        disabled={deleting}
                                        className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
                                        style={{ backgroundColor: '#dc2626', color: '#fff' }}
                                    >
                                        <Trash2 size={14} />
                                        Eliminar {selected.size} seleccionado{selected.size > 1 ? 's' : ''}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Loading state */}
                {loading && <StorageCleanupSkeleton />}

                {/* Empty state */}
                {!loading && orphaned.length === 0 && (
                    <div
                        className="flex flex-col items-center justify-center rounded-2xl border py-20 text-center"
                        style={{ backgroundColor: '#fff', borderColor: '#e8e2d8' }}
                    >
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: '#f0f9f4' }}>
                            <Image size={24} style={{ color: '#2a7d4f' }} />
                        </div>
                        <p className="font-semibold" style={{ color: '#2d465e' }}>
                            Todo en orden
                        </p>
                        <p className="mt-1 text-sm" style={{ color: '#8a7f72' }}>
                            No hay archivos huérfanos en el bucket.
                        </p>
                    </div>
                )}

                {/* Files by folder */}
                {!loading &&
                    Object.entries(byFolder).map(([folder, folderFiles]) => (
                        <div key={folder} className="flex flex-col gap-3">
                            <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#8a7f72' }}>
                                {folderLabel(folder)} — {folderFiles.length} archivo{folderFiles.length > 1 ? 's' : ''}
                            </h2>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {folderFiles.map((file) => (
                                    <div
                                        key={file.path}
                                        onClick={() => toggleSelect(file.path)}
                                        className="group relative cursor-pointer overflow-hidden rounded-2xl border transition-all"
                                        style={{
                                            backgroundColor: '#fff',
                                            borderColor: selected.has(file.path) ? '#f75815' : '#e8e2d8',
                                            boxShadow: selected.has(file.path) ? '0 0 0 2px #f75815' : 'none',
                                        }}
                                    >
                                        {/* Checkbox */}
                                        <div
                                            className="absolute top-2 left-2 z-10 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all"
                                            style={{
                                                backgroundColor: selected.has(file.path) ? '#f75815' : '#fff',
                                                borderColor: selected.has(file.path) ? '#f75815' : '#d1c9bc',
                                            }}
                                        >
                                            {selected.has(file.path) && (
                                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                    <path
                                                        d="M1 4L3.5 6.5L9 1"
                                                        stroke="white"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </div>

                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteSingle(file.path);
                                            }}
                                            disabled={deleting}
                                            className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
                                            style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={13} />
                                        </button>

                                        {/* Preview */}
                                        <div
                                            className="flex items-center justify-center overflow-hidden"
                                            style={{ height: 140, backgroundColor: '#f5f0e8' }}
                                        >
                                            {file.is_image ? (
                                                <img src={file.url} alt={file.name} className="h-full w-full object-cover" crossOrigin="anonymous" />
                                            ) : (
                                                <FileIcon file={file} />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="p-3">
                                            <p className="truncate text-xs font-medium" style={{ color: '#1c1917' }} title={file.name}>
                                                {file.name}
                                            </p>
                                            <p className="mt-0.5 text-[11px] font-medium uppercase" style={{ color: '#8a7f72' }}>
                                                {file.extension}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
            </div>
        </AppLayout>
    );
}
