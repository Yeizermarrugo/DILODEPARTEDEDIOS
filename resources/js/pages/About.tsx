import Header from '@/components/Header';
import '../../css/main.css';

const teamMembers = [
    {
        img: 'assets/img/person/person-m-7.webp',
        name: 'Walter White',
        role: 'Chief Executive Officer',
        desc: 'Aliquam iure quaerat voluptatem praesentium possimus unde laudantium vel dolorum distinctio dire flow',
    },
    {
        img: 'assets/img/person/person-f-8.webp',
        name: 'Sarah Jhonson',
        role: 'Product Manager',
        desc: 'Labore ipsam sit consequatur exercitationem rerum laboriosam laudantium aut quod dolores exercitationem ut',
    },
    {
        img: 'assets/img/person/person-m-6.webp',
        name: 'William Anderson',
        role: 'CTO',
        desc: 'Illum minima ea autem doloremque ipsum quidem quas aspernatur modi ut praesentium vel tque sed facilis at qui',
    },
    {
        img: 'assets/img/person/person-f-4.webp',
        name: 'Amanda Jepson',
        role: 'Accountant',
        desc: 'Magni voluptatem accusamus assumenda cum nisi aut qui dolorem voluptate sed et veniam quasi quam consectetur',
    },
    {
        img: 'assets/img/person/person-m-12.webp',
        name: 'Brian Doe',
        role: 'Marketing',
        desc: 'Qui consequuntur quos accusamus magnam quo est molestiae eius laboriosam sunt doloribus quia impedit laborum velit',
    },
    {
        img: 'assets/img/person/person-f-9.webp',
        name: 'Josepha Palas',
        role: 'Operation',
        desc: 'Sint sint eveniet explicabo amet consequatur nesciunt error enim rerum earum et omnis fugit eligendi cupiditate vel',
    },
];

const About = () => {
    return (
        <div className="about-page">
            <Header />

            <main className="main">
                {/* Page Title */}
                <div className="page-title">
                    <div className="breadcrumbs">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <a href="#">
                                        <i className="bi bi-house"></i> Home
                                    </a>
                                </li>
                                <li className="breadcrumb-item">
                                    <a href="#">Category</a>
                                </li>
                                <li className="breadcrumb-item active current">About</li>
                            </ol>
                        </nav>
                    </div>
                    <div className="title-wrapper">
                        <h1>About</h1>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus
                            leo.
                        </p>
                    </div>
                </div>

                {/* About Section */}
                <section id="about" className="about section">
                    <div className="container" data-aos="fade-up" data-aos-delay="100">
                        <span className="section-badge">
                            <i className="bi bi-info-circle"></i> About Us
                        </span>
                        <div className="row">
                            <div className="col-lg-6">
                                <h2 className="about-title">Nemo enim ipsam voluptatem quia voluptas aspernatur</h2>
                                <p className="about-description">
                                    Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates
                                    repudiandae sint et molestiae non recusandae.
                                </p>
                            </div>
                            <div className="col-lg-6">
                                <p className="about-text">
                                    Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut
                                    perferendis doloribus asperiores repellat.
                                </p>
                                <p className="about-text">
                                    Amet eos ut. Officiis soluta ab id dolor non sint. Corporis omnis consequatur quisquam ex consequuntur quo omnis.
                                    Quo eligendi cum. Amet mollitia qui quidem dolores praesentium quasi ut et.
                                </p>
                            </div>
                        </div>
                        <div className="row features-boxes gy-4 mt-3">
                            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
                                <div className="feature-box">
                                    <div className="icon-box">
                                        <i className="bi bi-bullseye"></i>
                                    </div>
                                    <h3>
                                        <a href="#" className="stretched-link">
                                            At vero eos
                                        </a>
                                    </h3>
                                    <p>
                                        Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat.
                                    </p>
                                </div>
                            </div>
                            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
                                <div className="feature-box">
                                    <div className="icon-box">
                                        <i className="bi bi-person-check"></i>
                                    </div>
                                    <h3>
                                        <a href="#" className="stretched-link">
                                            Sed ut perspiciatis
                                        </a>
                                    </h3>
                                    <p>
                                        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti
                                        atque.
                                    </p>
                                </div>
                            </div>
                            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="400">
                                <div className="feature-box">
                                    <div className="icon-box">
                                        <i className="bi bi-clipboard-data"></i>
                                    </div>
                                    <h3>
                                        <a href="#" className="stretched-link">
                                            Nemo enim ipsam
                                        </a>
                                    </h3>
                                    <p>
                                        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non
                                        numquam.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-5">
                            <div className="col-lg-12" data-aos="zoom-in" data-aos-delay="200">
                                <div className="video-box">
                                    <img src="assets/img/about/about-wide-1.webp" className="img-fluid" alt="Video Thumbnail" />
                                    <a href="https://www.youtube.com/watch?v=Y7f98aduVJ8" className="glightbox pulsating-play-btn"></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section id="team" className="team section light-background">
                    <div className="section-title container" data-aos="fade-up">
                        <h2>Team</h2>
                        <div>
                            <span>Check Our</span> <span className="description-title">Team</span>
                        </div>
                    </div>
                    <div className="container" data-aos="fade-up" data-aos-delay="100">
                        <div className="row gy-4">
                            {teamMembers.map((member, i) => (
                                <div className="col-lg-6" data-aos="fade-up" data-aos-delay={100 * (i + 1)} key={i}>
                                    <div className="team-member d-flex">
                                        <div className="member-img">
                                            <img src={member.img} className="img-fluid" alt={member.name} loading="lazy" />
                                        </div>
                                        <div className="member-info flex-grow-1">
                                            <h4>{member.name}</h4>
                                            <span>{member.role}</span>
                                            <p>{member.desc}</p>
                                            <div className="social">
                                                <a href="">
                                                    <i className="bi bi-facebook"></i>
                                                </a>
                                                <a href="">
                                                    <i className="bi bi-twitter-x"></i>
                                                </a>
                                                <a href="">
                                                    <i className="bi bi-linkedin"></i>
                                                </a>
                                                <a href="">
                                                    <i className="bi bi-youtube"></i>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer id="footer" className="footer">
                <div className="footer-top container">
                    <div className="row gy-4">
                        <div className="col-lg-4 col-md-6 footer-about">
                            <a href="index.html" className="logo d-flex align-items-center">
                                <span className="sitename">Blogy</span>
                            </a>
                            <div className="footer-contact pt-3">
                                <p>A108 Adam Street</p>
                                <p>New York, NY 535022</p>
                                <p className="mt-3">
                                    <strong>Phone:</strong> <span>+1 5589 55488 55</span>
                                </p>
                                <p>
                                    <strong>Email:</strong> <span>info@example.com</span>
                                </p>
                            </div>
                            <div className="social-links d-flex mt-4">
                                <a href="">
                                    <i className="bi bi-twitter-x"></i>
                                </a>
                                <a href="">
                                    <i className="bi bi-facebook"></i>
                                </a>
                                <a href="">
                                    <i className="bi bi-instagram"></i>
                                </a>
                                <a href="">
                                    <i className="bi bi-linkedin"></i>
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-3 footer-links">
                            <h4>Useful Links</h4>
                            <ul>
                                <li>
                                    <a href="#">Home</a>
                                </li>
                                <li>
                                    <a href="#">About us</a>
                                </li>
                                <li>
                                    <a href="#">Services</a>
                                </li>
                                <li>
                                    <a href="#">Terms of service</a>
                                </li>
                                <li>
                                    <a href="#">Privacy policy</a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-lg-2 col-md-3 footer-links">
                            <h4>Our Services</h4>
                            <ul>
                                <li>
                                    <a href="#">Web Design</a>
                                </li>
                                <li>
                                    <a href="#">Web Development</a>
                                </li>
                                <li>
                                    <a href="#">Product Management</a>
                                </li>
                                <li>
                                    <a href="#">Marketing</a>
                                </li>
                                <li>
                                    <a href="#">Graphic Design</a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-lg-2 col-md-3 footer-links">
                            <h4>Hic solutasetp</h4>
                            <ul>
                                <li>
                                    <a href="#">Molestiae accusamus iure</a>
                                </li>
                                <li>
                                    <a href="#">Excepturi dignissimos</a>
                                </li>
                                <li>
                                    <a href="#">Suscipit distinctio</a>
                                </li>
                                <li>
                                    <a href="#">Dilecta</a>
                                </li>
                                <li>
                                    <a href="#">Sit quas consectetur</a>
                                </li>
                            </ul>
                        </div>
                        <div className="col-lg-2 col-md-3 footer-links">
                            <h4>Nobis illum</h4>
                            <ul>
                                <li>
                                    <a href="#">Ipsam</a>
                                </li>
                                <li>
                                    <a href="#">Laudantium dolorum</a>
                                </li>
                                <li>
                                    <a href="#">Dinera</a>
                                </li>
                                <li>
                                    <a href="#">Trodelas</a>
                                </li>
                                <li>
                                    <a href="#">Flexo</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="copyright container mt-4 text-center">
                    <p>
                        © <span>Copyright</span> <strong className="sitename px-1">Blogy</strong> <span>All Rights Reserved</span>
                    </p>
                    <div className="credits">
                        Designed by <a href="https://bootstrapmade.com/">BootstrapMade</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default About;
