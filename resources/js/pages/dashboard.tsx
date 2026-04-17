import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    Edit3,
    Eye,
    GraduationCap,
    Heart,
    Image,
    PlusCircle,
    TrendingUp
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

interface Stats {
    devocionales: number;
    estudios: number;
    series: number;
    episodios: number;
    total_vistas: number;
    total_likes: number;
    suscriptores: number;
    este_mes: number;
}

interface Reciente {
    id: string;
    titulo: string;
    ensenanza: string | null;
    categoria: string;
    tipo: 'devocional' | 'estudio' | 'episodio';
    vistas: number;
    created_at: string;
}

interface DashboardProps {
    stats: Stats;
    recientes: Reciente[];
}

const TIPO_LABEL: Record<string, { label: string; color: string; bg: string }> = {
    devocional: { label: 'Devocional', color: '#f75815', bg: '#fff5f0' },
    estudio: { label: 'Estudio', color: '#2a7d4f', bg: '#f0f9f4' },
    episodio: { label: 'Episodio', color: '#6b5b95', bg: '#f5f3fa' },
};

function fmt(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
}

function fmtDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

export default function Dashboard({ stats, recientes }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const firstName = auth.user?.name?.split(' ')[0] ?? 'Administrador';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';
    const today = new Date().toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-5 md:p-7" style={{ backgroundColor: '#f5f0e8', textDecoration: 'none' }}>

                {/* ── HERO ─────────────────────────────────────────── */}
                <div
                    className="relative overflow-hidden rounded-2xl p-7 md:p-9"
                    style={{ backgroundColor: '#2d465e' }}
                >
                    {/* grid pattern */}
                    <div className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px,#faf8f4 1px,transparent 0)`,
                            backgroundSize: '28px 28px',
                        }}
                    />
                    {/* blobs decorativos */}
                    <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-10"
                        style={{ backgroundColor: '#f75815' }} />
                    <div className="absolute -bottom-8 right-32 h-28 w-28 rounded-full opacity-[0.07]"
                        style={{ backgroundColor: '#f75815' }} />

                    <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-widest capitalize"
                                style={{ color: '#a8bfcc' }}>{today}</p>
                            <h1 className="mt-1 text-3xl md:text-4xl text-white"
                                style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300 }}>
                                {greeting},{' '}
                                <span style={{ color: '#f75815' }}>{firstName}</span>
                            </h1>
                            <p className="mt-2 text-sm" style={{ color: '#a8bfcc' }}>
                                Tienes{' '}
                                <span className="font-semibold text-white">{stats.este_mes}</span>
                                {' '}devocional{stats.este_mes !== 1 ? 'es' : ''} publicado{stats.este_mes !== 1 ? 's' : ''} este mes.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link href="/devocionalesAgregar"
                                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                                style={{ backgroundColor: '#f75815' }}>
                                <PlusCircle className="size-4" />
                                Nuevo contenido
                            </Link>
                            <Link href="/devocionales-edit"
                                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all hover:opacity-90"
                                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff' }}>
                                <Edit3 className="size-4" />
                                Editar
                            </Link>
                        </div>
                    </div>

                    {/* mini-stats en el hero */}
                    <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                            { label: 'Devocionales', value: fmt(stats.devocionales), icon: BookOpen },
                            { label: 'Estudios', value: fmt(stats.estudios), icon: BookOpen },
                            { label: 'Series', value: fmt(stats.series), icon: GraduationCap },
                            { label: 'Este mes', value: fmt(stats.este_mes), icon: TrendingUp },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label}
                                className="rounded-xl px-4 py-3"
                                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className="size-3.5" style={{ color: '#f75815' }} />
                                    <span className="text-xs" style={{ color: '#a8bfcc' }}>{label}</span>
                                </div>
                                <p className="text-2xl font-semibold text-white">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── MÉTRICAS ─────────────────────────────────────── */}
                <div className="grid gap-4 sm:grid-cols-3">
                    {[
                        { label: 'Total vistas', value: fmt(stats.total_vistas), icon: Eye, color: '#2d465e', bg: '#f0f4f7', sub: 'en todo el contenido' },
                        { label: 'Total likes', value: fmt(stats.total_likes), icon: Heart, color: '#e0375c', bg: '#fdf0f4', sub: 'reacciones acumuladas' },
                        { label: 'Suscriptores', value: fmt(stats.suscriptores), icon: Bell, color: '#f75815', bg: '#fff5f0', sub: 'notificaciones push' },
                    ].map(({ label, value, icon: Icon, color, bg, sub }) => (
                        <div key={label}
                            className="flex items-center gap-4 rounded-2xl border p-5"
                            style={{ backgroundColor: '#fff', borderColor: '#e8e2d8' }}>
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                                style={{ backgroundColor: bg }}>
                                <Icon className="size-5" style={{ color }} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold" style={{ color: '#1c1917' }}>{value}</p>
                                <p className="text-xs font-medium" style={{ color: '#2d465e' }}>{label}</p>
                                <p className="text-xs" style={{ color: '#8a7f72' }}>{sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── ACCIONES + RECIENTES ──────────────────────────── */}
                <div className="grid gap-6 lg:grid-cols-5">

                    {/* Acciones — 2 cols */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        <h2 className="text-base font-semibold" style={{ color: '#2d465e' }}>
                            Acciones rápidas
                        </h2>
                        <div className="flex flex-col gap-3">
                            {[
                                { label: 'Nuevo Devocional', href: '/devocionalesAgregar', icon: PlusCircle, color: '#f75815', bg: '#fff5f0' },
                                { label: 'Editar contenido', href: '/devocionales-edit',   icon: Edit3,      color: '#2d465e', bg: '#f0f4f7' },
                                { label: 'Imágenes de post', href: '/postImage',           icon: Image,      color: '#2a7d4f', bg: '#f0f9f4' },
                            ].map(({ label, href, icon: Icon, color, bg }) => (
                                <Link key={label} href={href}
                                    className="group flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                                    style={{ backgroundColor: '#fff', borderColor: '#e8e2d8' }}>
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105"
                                        style={{ backgroundColor: bg }}>
                                        <Icon className="size-4" style={{ color }} />
                                    </div>
                                    <p className="text-sm font-semibold" style={{ color: '#1c1917' }}>{label}</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recientes — 3 cols */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold" style={{ color: '#2d465e' }}>
                                Publicaciones recientes
                            </h2>
                            <Link href="/devocionales-edit"
                                className="text-xs font-medium transition-colors hover:underline"
                                style={{ color: '#f75815' }}>
                                Ver todas →
                            </Link>
                        </div>

                        <div className="rounded-2xl border overflow-hidden"
                            style={{ backgroundColor: '#fff', borderColor: '#e8e2d8' }}>
                            {recientes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <BookOpen className="mb-3 size-8" style={{ color: '#e8e2d8' }} />
                                    <p className="text-sm font-medium" style={{ color: '#8a7f72' }}>
                                        Sin publicaciones aún
                                    </p>
                                    <Link href="/devocionalesAgregar"
                                        className="mt-3 text-xs font-medium hover:underline"
                                        style={{ color: '#f75815' }}>
                                        Crear el primero →
                                    </Link>
                                </div>
                            ) : (
                                <div className="divide-y" style={{ borderColor: '#f5f0e8' }}>
                                    {recientes.map((item, i) => {
                                        const tipo = TIPO_LABEL[item.tipo] ?? TIPO_LABEL.devocional;
                                        const href = item.tipo === 'estudio'
                                            ? `/estudio-biblico/${item.id}`
                                            : `/devocional/${item.id}`;
                                        return (
                                            <Link key={item.id} href={href}
                                                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#faf8f4]">
                                                {/* Número */}
                                                <span className="w-5 shrink-0 text-center text-xs font-medium"
                                                    style={{ color: '#e8e2d8' }}>
                                                    {String(i + 1).padStart(2, '0')}
                                                </span>

                                                {/* Contenido */}
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium transition-colors group-hover:text-[#f75815]"
                                                        style={{ color: '#1c1917' }}>
                                                        {item.titulo}
                                                    </p>
                                                    {item.tipo === 'episodio' && item.ensenanza && item.ensenanza !== item.titulo && (
                                                        <p className="truncate text-[11px] mt-0.5" style={{ color: '#6b5b95' }}>
                                                            {item.ensenanza}
                                                        </p>
                                                    )}
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <span className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                                                            style={{ backgroundColor: tipo.bg, color: tipo.color }}>
                                                            {tipo.label}
                                                        </span>
                                                        {item.categoria && (
                                                            <span className="text-[11px]" style={{ color: '#8a7f72' }}>
                                                                {item.categoria}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Meta */}
                                                <div className="shrink-0 text-right">
                                                    <div className="flex items-center gap-1 justify-end"
                                                        style={{ color: '#8a7f72' }}>
                                                        <Eye className="size-3" />
                                                        <span className="text-xs">{fmt(item.vistas)}</span>
                                                    </div>
                                                    <p className="mt-1 text-[11px]" style={{ color: '#e8e2d8' }}>
                                                        {fmtDate(item.created_at)}
                                                    </p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── VERSÍCULO ─────────────────────────────────────── */}
                <div
                    className="relative overflow-hidden rounded-2xl border p-6 md:p-8"
                    style={{ backgroundColor: '#f5f0e8', borderColor: '#e8e2d8' }}
                >
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[120px] leading-none select-none opacity-10"
                        style={{ color: '#f75815', fontFamily: "'Cormorant Garamond',serif" }}>
                        "
                    </div>
                    <div className="relative max-w-2xl">
                        <div className="mb-4 h-0.5 w-8 rounded-full" style={{ backgroundColor: '#f75815' }} />
                        <p className="text-lg md:text-xl italic leading-relaxed"
                            style={{ color: '#2d465e', fontFamily: "'Cormorant Garamond',serif" }}>
                            Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas;
                            correrán, y no se cansarán; caminarán, y no se fatigarán.
                        </p>
                        <p className="mt-4 text-sm font-semibold" style={{ color: '#f75815' }}>
                            Isaías 40:31
                        </p>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
