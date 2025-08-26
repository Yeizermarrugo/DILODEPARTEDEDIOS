import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import '../../css/header.css';

const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/about', label: 'Quienes somos?' },
    { href: '/devocionales', label: 'Devocionales' },
    { href: '/podcast', label: 'Podcast y mas' },
    { href: '/libros', label: 'Libros' },
    { href: '/contact.html', label: 'Contact' },
];

const Header = () => {
    const { url } = usePage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === '/') return url === '/';
        return url.startsWith(href.replace('.html', ''));
    };

    return (
        <header id="header" className="header position-relative">
            <div className="container-fluid container-xl position-relative">
                <div className="top-row d-flex align-items-center justify-content-between">
                    <a href="#" className="logo d-flex align-items-end">
                        <h1 className="sitename" style={{ fontFamily: 'serif' }}>
                            Dilo de parte de Dios
                        </h1>
                        <span></span>
                    </a>
                    <div className="d-flex align-items-center">
                        <div className="social-links">
                            <a
                                href="https://www.facebook.com/share/1MD6hDKdce/?mibextid=wwXIfr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="facebook"
                            >
                                <i className="bi bi-facebook"></i>
                            </a>
                            <a href="#" className="twitter">
                                <i className="bi bi-twitter"></i>
                            </a>
                            <a
                                href="https://www.instagram.com/dilodepartededios?igsh=ODU0dHc1bnVhNGd2"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="instagram"
                            >
                                <i className="bi bi-instagram"></i>
                            </a>
                        </div>
                        <form className="search-form ms-4">
                            <input type="text" placeholder="Search..." className="form-control" />
                            <button type="submit" className="btn">
                                <i className="bi bi-search"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="nav-wrap">
                <div className="d-flex justify-content-center position-relative container">
                    <nav id="navmenu" className={`navmenu ${mobileMenuOpen ? 'open' : ''}`}>
                        <ul style={{ display: mobileMenuOpen ? 'block' : '' }}>
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <a href={link.href} className={isActive(link.href) ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <button
                            className="mobile-nav-toggle d-xl-none"
                            onClick={() => setMobileMenuOpen((open) => !open)}
                            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '2rem',
                                color: '#333',
                                cursor: 'pointer',
                            }}
                        >
                            <i className={`bi ${mobileMenuOpen ? 'bi-x' : 'bi-list'}`}></i>
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
