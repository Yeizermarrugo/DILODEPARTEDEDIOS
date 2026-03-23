const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer id="footer" className="footer">
            <div className="footer-top container">{/* ...Footer content as JSX... */}</div>

            <div className="copyright container mt-4 text-center">
                <p>
                    © 2025 - {currentYear} <strong className="sitename px-1">Dilo de parte de Dios</strong> <span>Todos los derechos reservados.</span>
                </p>

                {/* Texto corto legal añadido */}
                <p className="mt-2" style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    Contenido para fines educativos y espirituales. Prohibida su modificación o comercialización sin autorización.
                </p>
                <div className="legal-links mb-2">
                    <a href="/content-usage" style={{ fontSize: '0.8rem', color: 'inherit', textDecoration: 'underline' }}>
                        Términos de uso y Derechos de autor
                    </a>
                </div>

                <div className="credits">
                    Designed by <a href="">The Glory of God</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;