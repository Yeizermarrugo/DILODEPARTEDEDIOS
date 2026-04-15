import PageLayout from "@/components/PageLayout";
import '../../css/legal.css';

const PaginaLegal = () => {
    const scrollTo = (id: string) =>
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    return (
        <PageLayout>
            <div className="legal-root">
                <main>

                    {/* ── Hero ── */}
                    <section className="legal-hero">
                        <div className="legal-hero__pill">
                            <span className="legal-hero__pill-dot" />
                            Aviso legal
                        </div>
                        <h1 className="legal-hero__title">
                            <span className="legal-hero__t1">Términos y</span>
                            <span className="legal-hero__t2">Privacidad</span>
                        </h1>
                        <p className="legal-hero__sub">
                            Condiciones de uso del contenido y tratamiento de datos de la plataforma{' '}
                            <strong>Dilo de Parte de Dios</strong>.
                        </p>
                        <nav className="legal-hero__nav">
                            <button
                                className="legal-hero__navbtn"
                                onClick={() => scrollTo('copyright')}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                                </svg>
                                Derechos de autor
                            </button>
                            <button
                                className="legal-hero__navbtn"
                                onClick={() => scrollTo('privacidad')}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                Privacidad
                            </button>
                        </nav>
                    </section>

                    {/* ── Contenido ── */}
                    <div className="legal-main">

                        {/* Sección 1: Derechos de autor */}
                        <section id="copyright" className="legal-section">
                            <div className="legal-section__head">
                                <div className="legal-eyebrow">
                                    <span className="legal-eyebrow__line" />
                                    Sección 01
                                    <span className="legal-eyebrow__line" />
                                </div>
                                <h2 className="legal-section__title">
                                    Derechos de autor<br />y uso del contenido
                                </h2>
                                <p className="legal-section__lead">
                                    Todo el contenido publicado en esta plataforma de formación bíblica <strong>Dilo de Parte de Dios</strong> es de su propiedad. A continuación, se especifican los usos permitidos y las restricciones correspondientes
                                </p>
                            </div>

                            <div className="legal-perm-grid">
                                {/* Permitido */}
                                <div className="legal-perm-card legal-perm-card--allow">
                                    <div className="legal-perm-card__accent" />
                                    <div className="legal-perm-card__icon">
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <div className="legal-perm-card__label">Uso permitido</div>
                                    <ul className="legal-perm-card__list">
                                        <li><span className="legal-perm-dot" />Compartir el contenido con otras personas</li>
                                        <li><span className="legal-perm-dot" />Imprimir para enseñanza o discipulado</li>
                                        <li><span className="legal-perm-dot" />Apoyo educativo en iglesias o fundaciones</li>
                                    </ul>
                                </div>

                                {/* No permitido */}
                                <div className="legal-perm-card legal-perm-card--deny">
                                    <div className="legal-perm-card__accent" />
                                    <div className="legal-perm-card__icon">
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A32D2D" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </div>
                                    <div className="legal-perm-card__label">Uso no permitido</div>
                                    <ul className="legal-perm-card__list">
                                        <li><span className="legal-perm-dot" />Vender total o parcialmente el contenido</li>
                                        <li><span className="legal-perm-dot" />Modificarlo y presentarlo como propio</li>
                                        <li><span className="legal-perm-dot" />Distribuirlo con fines comerciales</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <hr className="legal-divider" />

                        {/* Sección 2: Privacidad */}
                        <section id="privacidad" className="legal-section">
                            <div className="legal-section__head">
                                <div className="legal-eyebrow">
                                    <span className="legal-eyebrow__line" />
                                    Sección 02
                                    <span className="legal-eyebrow__line" />
                                </div>
                                <h2 className="legal-section__title">
                                    Política de<br />Privacidad
                                </h2>
                                <p className="legal-section__lead">
                                    En <strong>Dilo de Parte de Dios</strong> valoramos tu privacidad.
                                    Esta política explica cómo manejamos la información cuando visitas nuestro sitio.
                                </p>
                            </div>

                            <div className="legal-priv-items">
                                <div className="legal-priv-item">
                                    <div className="legal-priv-item__num-wrap">
                                        <div className="legal-priv-item__num">01</div>
                                    </div>
                                    <div className="legal-priv-item__icon">
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f75815" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                        </svg>
                                    </div>
                                    <div className="legal-priv-item__body">
                                        <div className="legal-priv-item__title">Información que recolectamos</div>
                                        <p className="legal-priv-item__text">
                                            No solicitamos registros obligatorios. Recolectamos datos anónimos — ubicación general, tipo de dispositivo y páginas visitadas — para entender el alcance de nuestro ministerio.
                                        </p>
                                    </div>
                                </div>

                                <div className="legal-priv-item">
                                    <div className="legal-priv-item__num-wrap">
                                        <div className="legal-priv-item__num">02</div>
                                    </div>
                                    <div className="legal-priv-item__icon">
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f75815" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                        </svg>
                                    </div>
                                    <div className="legal-priv-item__body">
                                        <div className="legal-priv-item__title">Uso de la información</div>
                                        <p className="legal-priv-item__text">
                                            Estos datos se utilizan exclusivamente para mejorar nuestros materiales y asegurar que el sitio funcione correctamente en tu región. No compartimos estos datos con terceros.
                                        </p>
                                    </div>
                                </div>

                                <div className="legal-priv-item">
                                    <div className="legal-priv-item__num-wrap">
                                        <div className="legal-priv-item__num">03</div>
                                    </div>
                                    <div className="legal-priv-item__icon">
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f75815" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            <path d="m9 12 2 2 4-4" />
                                        </svg>
                                    </div>
                                    <div className="legal-priv-item__body">
                                        <div className="legal-priv-item__title">Consentimiento</div>
                                        <p className="legal-priv-item__text">
                                            Al utilizar nuestro sitio y aceptar el banner de privacidad, consientes el uso de estos registros técnicos necesarios para la mejora de la plataforma.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <span className="legal-footer__date">Última actualización · Marzo 2026</span>
                    </div>
                </main>
            </div>
        </PageLayout>
    );
};

export default PaginaLegal;