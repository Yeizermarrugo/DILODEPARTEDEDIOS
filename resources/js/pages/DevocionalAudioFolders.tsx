import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Folder, Shuffle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Carpetas de audio', href: '/devocionales-audio-folders' },
];

interface FolderSummary {
    month: number;
    name: string;
    capacity: number;
    count: number;
}

interface Props {
    folders: FolderSummary[];
    totalCapacity: number;
    totalAssigned: number;
}

export default function DevocionalAudioFolders({ folders, totalCapacity, totalAssigned }: Props) {
    const [generating, setGenerating] = useState(false);

    const generate = () => {
        setGenerating(true);
        router.post(
            '/devocionales-audio-folders/generate',
            {},
            {
                preserveScroll: true,
                onFinish: () => setGenerating(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-6 p-3 sm:p-5 md:p-7" style={{ backgroundColor: '#f5f0e8', minHeight: '100vh' }}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold" style={{ color: '#2d465e', fontFamily: "'Cormorant Garamond', serif" }}>
                            Carpetas de audio
                        </h1>
                        <p className="mt-1 text-sm" style={{ color: '#8a7f72' }}>
                            {totalAssigned} de {totalCapacity} devocionales asignados
                        </p>
                    </div>

                    <button
                        onClick={generate}
                        disabled={generating}
                        className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
                        style={{ backgroundColor: '#f75815', color: '#fff' }}
                    >
                        <Shuffle size={14} className={generating ? 'animate-spin' : ''} />
                        {generating ? 'Agrupando…' : 'Rellenar carpetas'}
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {folders.map((folder) => {
                        const full = folder.count >= folder.capacity;

                        return (
                            <Link
                                key={folder.month}
                                href={`/devocionales-audio-folders/${folder.month}`}
                                className="flex flex-col gap-3 rounded-2xl border p-4 transition-all hover:shadow-md"
                                style={{ backgroundColor: '#fff', borderColor: '#e8e2d8' }}
                            >
                                <div className="flex items-center justify-between">
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                                        style={{ backgroundColor: full ? '#f0f9f4' : '#f5f0e8' }}
                                    >
                                        <Folder size={18} style={{ color: full ? '#2a7d4f' : '#2d465e' }} />
                                    </div>
                                    <span
                                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                        style={{
                                            backgroundColor: full ? '#f0f9f4' : '#faf3ea',
                                            color: full ? '#2a7d4f' : '#b45309',
                                        }}
                                    >
                                        {folder.count}/{folder.capacity}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold" style={{ color: '#2d465e' }}>
                                        {folder.name}
                                    </p>
                                    <p className="mt-1 text-xs" style={{ color: '#8a7f72' }}>
                                        {full ? 'Carpeta completa' : `Faltan ${folder.capacity - folder.count}`}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
