const Footer = () => {
    return (
        <footer id="footer" className="footer">
            <div className="footer-top container">{/* ...Footer content as JSX... */}</div>
            <div className="copyright container mt-4 text-center">
                <p>
                    © <span>Copyright</span> <strong className="sitename px-1">Casa de Valientes</strong> <span>All Rights Reserved</span>
                </p>
                <div className="credits">
                    Designed by <a href="">The Glory of God</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
