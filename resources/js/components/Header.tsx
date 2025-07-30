const Header = () => {
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
            {/* Navigation */}
            <div className="nav-wrap">
                <div className="d-flex justify-content-center position-relative container">
                    <nav id="navmenu" className="navmenu">
                        <ul>
                            <li>
                                <a href="/" className="active">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="/about">About</a>
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
    );
};

export default Header;
