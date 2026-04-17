import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh w-full">
            {/* Panel izquierdo — branding */}
            <div
                className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-[45%]"
                style={{ backgroundColor: '#2d465e' }}
            >
                {/* Patrón de fondo sutil */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, #faf8f4 1px, transparent 0)`,
                        backgroundSize: '32px 32px',
                    }}
                />

                {/* Cruz decorativa de fondo */}
                <div
                    className="absolute right-[-60px] top-[-60px] opacity-5"
                    style={{ color: '#f75815' }}
                >
                    <svg width="320" height="320" viewBox="0 0 100 100" fill="currentColor">
                        <rect x="42" y="5" width="16" height="90" rx="3" />
                        <rect x="5" y="30" width="90" height="16" rx="3" />
                    </svg>
                </div>

                {/* Logo */}
                <Link href={route('home')} className="relative flex items-center gap-3 no-underline" style={{ textDecoration: 'none' }}>
                    <img
                        src="/icon-192.png"
                        alt="Dilo de parte de Dios"
                        className="h-11 w-11 rounded-xl object-cover"
                    />
                    <span
                        className="text-lg font-semibold tracking-wide text-white"
                        style={{ fontFamily: "'Instrument Sans', sans-serif", textDecoration: 'none' }}
                    >
                        Dilo de parte de Dios
                    </span>
                </Link>

                {/* Contenido central */}
                <div className="relative space-y-6">
                    <h2
                        className="text-5xl leading-tight text-white"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
                    >
                        Habla su palabra,<br />
                        <em style={{ color: '#f75815' }}>transforma</em> tu mundo.
                    </h2>
                    <p className="text-base leading-relaxed" style={{ color: '#a8bfcc' }}>
                        Devocionales, estudios bíblicos y enseñanzas para fortalecer tu fe cada día.
                    </p>
                </div>

                {/* Versículo */}
                <div className="relative border-l-2 pl-5" style={{ borderColor: '#f75815' }}>
                    <p
                        className="text-base italic leading-relaxed text-white/80"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                        "Lámpara es a mis pies tu palabra, y lumbrera a mi camino."
                    </p>
                    <span className="mt-2 block text-sm font-medium" style={{ color: '#f75815' }}>
                        Salmos 119:105
                    </span>
                </div>
            </div>

            {/* Panel derecho — formulario */}
            <div
                className="flex flex-1 flex-col items-center justify-center p-6 md:p-12"
                style={{ backgroundColor: '#faf8f4' }}
            >
                {/* Logo mobile */}
                <Link href={route('home')} className="mb-10 flex items-center gap-3 lg:hidden" style={{ textDecoration: 'none' }}>
                    <img
                        src="/icon-192.png"
                        alt="Dilo de parte de Dios"
                        className="h-10 w-10 rounded-xl object-cover"
                    />
                    <span
                        className="text-base font-semibold"
                        style={{ color: '#2d465e', fontFamily: "'Instrument Sans', sans-serif", textDecoration: 'none' }}
                    >
                        Dilo de parte de Dios
                    </span>
                </Link>

                <div className="w-full max-w-md">
                    {/* Encabezado del formulario */}
                    <div className="mb-8">
                        <h1
                            className="text-3xl font-light"
                            style={{ color: '#2d465e', fontFamily: "'Cormorant Garamond', serif" }}
                        >
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-2 text-sm" style={{ color: '#8a7f72' }}>
                                {description}
                            </p>
                        )}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
