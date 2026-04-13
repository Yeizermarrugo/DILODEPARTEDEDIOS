import '../../css/footer.css';

const navLinks = [
    { href: '/devocionales', label: 'Devocionales' },
    { href: '/series', label: 'Series' },
    { href: '/estudios', label: 'Estudios bíblicos' },
    { href: '/recursos', label: 'Recursos' },
    { href: '/podcast', label: 'Podcast y más' },
    { href: '/obras', label: 'Obras' },
];

const socialLinks = [
    {
        href: 'https://www.facebook.com/share/1MD6hDKdce/?mibextid=wwXIfr',
        label: 'Facebook',
        icon: (
            <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
        ),
    },
    {
        href: 'https://www.instagram.com/dilodepartededios?igsh=ODU0dHc1bnVhNGd2',
        label: 'Instagram',
        icon: (
            <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
                <path d="M12 2C8.74 2 8.333 2.015 7.053 2.072 5.775 2.13 4.905 2.333 4.14 2.63c-.789.306-1.459.717-2.126 1.384S.935 5.35.63 6.14C.333 6.905.13 7.775.072 9.053.015 10.333 0 10.74 0 14c0 3.259.015 3.668.072 4.948.058 1.277.262 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 25.985 8.74 26 12 26c3.259 0 3.668-.015 4.948-.072 1.277-.058 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.058-1.28.072-1.689.072-4.948 0-3.259-.015-3.667-.072-4.947-.059-1.277-.263-2.148-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 0 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
            </svg>
        ),
    },
    {
        href: 'https://www.youtube.com/@casadevalientes7',
        label: 'YouTube',
        icon: (
            <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
                <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
            </svg>
        ),
    },
];

const currentYear = new Date().getFullYear();

const Footer = () => {
    return (
        <footer className="site-footer">
            {/* ── Top ── */}
            <div className="site-footer__top">
                {/* Brand */}
                <div className="site-footer__brand">
                    <div className="site-footer__sitename">
                        Dilo <em>de Parte</em> de Dios
                    </div>
                    <div className="site-footer__tagline">Plataforma de formación bíblica · 2025 - {currentYear}</div>
                    <p className="site-footer__desc">
                        Formación bíblica para el crecimiento espiritual y la vida práctica.
                        Encuentra recursos diseñados para que avances día a día hacia el cumplimiento de tu propósito y el desarrollo correcto en cada asignación.
                    </p>
                    <div className="site-footer__socials">
                        {socialLinks.map((s) => (
                            <a
                                key={s.href}
                                href={s.href}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={s.label}
                                className="site-footer__soc"
                            >
                                {s.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Nav links */}
                <div className="site-footer__nav">
                    <div className="site-footer__col-title">Explorar</div>
                    <ul className="site-footer__links">
                        {navLinks.map((l) => (
                            <li key={l.href}>
                                <a href={l.href}>{l.label}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Versículo */}
                <div className="site-footer__verse-block">
                    <div className="site-footer__col-title">Palabra</div>
                    <p className="site-footer__verse-text">
                        Lámpara es a mis pies tu palabra, y lumbrera a mi camino.
                    </p>
                    <div className="site-footer__verse-ref">Salmos 119:105 — RVR1960</div>
                </div>
            </div>

            {/* ── Divider ── */}
            <div className="site-footer__divider" />

            {/* ── Bottom ── */}
            <div className="site-footer__bottom">
                <div className="site-footer__bottom-left">
                    <p className="site-footer__copy">
                        © 2025{currentYear !== 2025 ? `–${currentYear}` : ''}{' '}
                        <strong>Dilo de Parte de Dios</strong> · Todos los derechos reservados.
                    </p>
                    <p className="site-footer__legal-text">
                        Contenido para fines educativos y espirituales.
                        Prohibida su modificación o comercialización sin autorización.
                    </p>
                    <a href="/content-usage" className="site-footer__legal-link">
                        Términos de uso y Derechos de autor
                    </a>
                </div>
                <div className="site-footer__bottom-right">
                    <div className="site-footer__cross" aria-hidden>
                        <div className="site-footer__cross-v" />
                        <div className="site-footer__cross-h" />
                    </div>
                    <span className="site-footer__credits">
                        Designed by <a href="#">The Glory of God</a>
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;