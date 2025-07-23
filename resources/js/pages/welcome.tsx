import MainContent from '@/components/main';
import 'bootstrap/dist/css/bootstrap.min.css'; // Instala bootstrap vía npm
import { useEffect, useState } from 'react';
import '../../css/main.css';

export default function Welcome() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading delay
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000); // Adjust the delay as needed

        return () => clearTimeout(timer); // Cleanup on unmount
    }, []);

    if (loading) {
        return (
            <div id="preloader" className="d-flex align-items-center justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }
    return (
        <div className="index-page">
            {/* Header */}
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
                {/* Navigation */}
                <div className="nav-wrap">
                    <div className="d-flex justify-content-center position-relative container">
                        <nav id="navmenu" className="navmenu">
                            <ul>
                                <li>
                                    <a href="index.html" className="active">
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <a href="about.html">About</a>
                                </li>
                                <li>
                                    <a href="category.html">Category</a>
                                </li>
                                <li>
                                    <a href="blog-details.html">Blog Details</a>
                                </li>
                                <li>
                                    <a href="author-profile.html">Author Profile</a>
                                </li>

                                <li>
                                    <a href="contact.html">Contact</a>
                                </li>
                            </ul>
                            <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main">
                <MainContent />
            </main>

            {/* Footer */}
            <footer id="footer" className="footer">
                <div className="footer-top container">{/* ...Footer content as JSX... */}</div>
                <div className="copyright container mt-4 text-center">
                    <p>
                        © <span>Copyright</span> <strong className="sitename px-1">Blogy</strong> <span>All Rights Reserved</span>
                    </p>
                    <div className="credits">
                        Designed by <a href="https://bootstrapmade.com/">BootstrapMade</a>
                    </div>
                </div>
            </footer>

            {/* Scroll Top Button */}
            <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
                <i className="bi bi-arrow-up-short"></i>
            </a>

            {/* Preloader */}
            {/* <div id="preloader"></div> */}
        </div>
    );
}
