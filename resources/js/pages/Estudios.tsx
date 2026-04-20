import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LibroList from '@/components/LibroList';
import { useRef, useState } from 'react';
import '../../css/estudios.css';
import '../../css/main.css';

function useReveal(threshold = 0.1) {
    const [visible, setVisible] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);

    const setRef = (el: HTMLDivElement | null) => {
        observer.current?.disconnect();
        if (!el) return;
        observer.current = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.current?.disconnect(); } },
            { threshold },
        );
        observer.current.observe(el);
    };

    return { ref: setRef, visible };
}

export default function Estudios() {
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ total: 0, categorias: 0 });
    const inputRef = useRef<HTMLInputElement>(null);
    const { ref: heroRef, visible: heroVisible } = useReveal(0.05);

    return (
        <div className="est-page">
            <Header />
            <main>

                {/* ── HERO ── */}
                <div className="est-hero">
                    <div className="est-hero__bg" aria-hidden />
                    <div
                        ref={heroRef}
                        className={`est-hero__inner est-reveal ${heroVisible ? 'est-reveal--visible' : ''}`}
                    >
                        <div className="est-hero__eyebrow">
                            <span className="est-hero__eyebrow-line" />
                            Estudios Bíblicos
                            <span className="est-hero__eyebrow-line" />
                        </div>

                        <h1 className="est-hero__title">
                            Comprende las palabras<br />
                            del que <em>murió en la cruz</em>
                        </h1>

                        <p className="est-hero__desc">
                            A través de estudios <em>libro por libro y capítulo por capítulo</em>,
                            acompañamos tu crecimiento espiritual con enseñanza fiel de la Palabra de Dios.
                        </p>

                        <div className="est-hero__verse">
                            <div className="est-hero__verse-text">
                                "Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir,
                                para corregir, para instruir en justicia, a fin de que el hombre de Dios sea
                                perfecto, enteramente preparado para toda buena obra."
                            </div>
                            <div className="est-hero__verse-ref">2 Timoteo 3:16-17 · RVR1960</div>
                        </div>

                        {stats.total > 0 && (
                            <div className="est-hero__stats">
                                <div className="est-hero__stat">
                                    <div className="est-hero__stat-num">{stats.total}</div>
                                    <div className="est-hero__stat-lbl">Estudios</div>
                                </div>
                                <div className="est-hero__stat">
                                    <div className="est-hero__stat-num">{stats.categorias}</div>
                                    <div className="est-hero__stat-lbl">Libros</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── SECCIÓN PRINCIPAL ── */}
                <div className="est-section">

                    {/* Topbar */}
                    <div className="est-topbar">
                        <div className="est-topbar__left">
                            <div className="est-topbar__accent" />
                            <div>
                                <div className="est-topbar__title">
                                    {searchTerm.trim()
                                        ? `Resultados de "${searchTerm.trim()}"`
                                        : 'Todos los estudios'}
                                </div>
                                <div className="est-topbar__count">
                                    {stats.total} estudio{stats.total !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>

                        <div className="est-search">
                            <svg className="est-search__icon" viewBox="0 0 24 24" width={14} height={14}
                                fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                className="est-search__input"
                                placeholder="Buscar estudio..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                autoComplete="off"
                                spellCheck={false}
                            />
                            {searchTerm && (
                                <button
                                    className="est-search__clear"
                                    onClick={() => { setSearchTerm(''); inputRef.current?.focus(); }}
                                    aria-label="Limpiar"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    <LibroList
                        searchTerm={searchTerm}
                        onLoad={setStats}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}
