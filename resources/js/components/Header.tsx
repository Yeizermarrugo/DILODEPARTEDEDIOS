import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import '../../css/header.css';

const navLinks = [
    { href: '/', label: 'Inicio', icon: 'bi-house' },
    { href: '/about', label: '¿Quiénes somos?', icon: 'bi-people' },
    { href: '/devocionales', label: 'Devocionales', icon: 'bi-journal-bookmark' },
    { href: '/series', label: 'Series', icon: 'bi-collection-play' },
    { href: '/estudios', label: 'Estudios bíblicos', icon: 'bi-book' },
    { href: '/recursos', label: 'Recursos', icon: 'bi-archive' },
    { href: '/podcast', label: 'Podcast y más', icon: 'bi-mic' },
    { href: '/obras', label: 'Obras', icon: 'bi-heart' },
    { href: '/contacto', label: 'Contacto', icon: 'bi-envelope' },
];

const socialLinks = [
    {
        href: 'https://www.facebook.com/share/1MD6hDKdce/?mibextid=wwXIfr',
        icon: 'bi-facebook', label: 'Facebook',
    },
    {
        href: 'https://www.youtube.com/@casadevalientes7',
        icon: 'bi-youtube', label: 'YouTube',
    },
    {
        href: 'https://www.instagram.com/dilodepartededios?igsh=ODU0dHc1bnVhNGd2',
        icon: 'bi-instagram', label: 'Instagram',
    },
];

const Header = () => {
    const { url } = usePage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === '/') return url === '/';
        return url.startsWith(href.replace('.html', ''));
    };

    // Bloquear scroll del body cuando el menú está abierto
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const close = () => setMobileMenuOpen(false);

    return (
        <>
            <header id="header" className="header position-relative">
                <div className="container-fluid container-xl position-relative">
                    <div className="top-row d-flex align-items-center justify-content-between">
                        <a href="/" className="logo d-flex align-items-end">
                            <h1 className="sitename" style={{ fontFamily: 'serif', fontSize: '20px' }}>
                                Dilo de parte de Dios
                            </h1>
                            <span></span>
                        </a>
                        <div className="d-flex align-items-center gap-3">
                            {/* Redes sociales — solo desktop */}
                            <div className="social-links d-none d-xl-flex">
                                {socialLinks.map(s => (
                                    <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                                        <i className={`bi ${s.icon}`}></i>
                                    </a>
                                ))}
                            </div>
                            {/* Botón hamburguesa — solo mobile */}
                            <button
                                className="hdr-burger d-xl-none"
                                onClick={() => setMobileMenuOpen(o => !o)}
                                aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                                aria-expanded={mobileMenuOpen}
                            >
                                <span className={`hdr-burger__bar ${mobileMenuOpen ? 'hdr-burger__bar--open' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Nav desktop */}
                <div className="nav-wrap d-none d-xl-flex">
                    <div className="d-flex justify-content-center position-relative container">
                        <nav id="navmenu" className="navmenu">
                            <ul>
                                {navLinks.map(link => (
                                    <li key={link.href}>
                                        <a
                                            href={link.href}
                                            className={isActive(link.href) ? 'active' : ''}
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            </header>

            {/* ── MOBILE MENU ── */}
            {/* Overlay */}
            <div
                className={`mob-overlay ${mobileMenuOpen ? 'mob-overlay--visible' : ''}`}
                onClick={close}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                className={`mob-drawer ${mobileMenuOpen ? 'mob-drawer--open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Menú de navegación"
            >
                {/* Drawer header */}
                <div className="mob-drawer__head">
                    <div className="mob-drawer__brand">
                        <span className="mob-drawer__brand-line" />
                        <span className="mob-drawer__brand-name">
                            Dilo <em>de Parte</em> de Dios
                        </span>
                    </div>
                    <button className="mob-drawer__close" onClick={close} aria-label="Cerrar menú">
                        <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Links */}
                <nav className="mob-drawer__nav">
                    <ul>
                        {navLinks.map((link, i) => (
                            <li
                                key={link.href}
                                style={{ transitionDelay: mobileMenuOpen ? `${i * 45}ms` : '0ms' }}
                                className={`mob-drawer__item ${mobileMenuOpen ? 'mob-drawer__item--in' : ''}`}
                            >
                                <a
                                    href={link.href}
                                    className={`mob-drawer__link ${isActive(link.href) ? 'mob-drawer__link--active' : ''}`}
                                    onClick={close}
                                >
                                    <i className={`bi ${link.icon} mob-drawer__link-icon`} />
                                    <span className="mob-drawer__link-label">{link.label}</span>
                                    {isActive(link.href) && (
                                        <span className="mob-drawer__link-dot" />
                                    )}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Divider */}
                <div className="mob-drawer__divider" />

                {/* Redes sociales */}
                <div className="mob-drawer__socials">
                    <p className="mob-drawer__socials-label">Síguenos</p>
                    <div className="mob-drawer__socials-row">
                        {socialLinks.map(s => (
                            <a
                                key={s.href}
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mob-drawer__soc"
                                aria-label={s.label}
                                onClick={close}
                            >
                                <i className={`bi ${s.icon}`} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Versículo */}
                <div className="mob-drawer__verse">
                    "Lámpara es a mis pies tu palabra"
                    <span>Sal 119:105</span>
                </div>
            </div>
        </>
    );
};

export default Header;