import Footer from '@/components/Footer';
import Header from '@/components/Header';
import '../../css/main.css';

const teamMembers = [
    {
        img: 'assets/img/person/Yeizer.png',
        name: 'Yeizer Marrugo',
        role: 'Cofundador & Director de Tecnología (CTO)',
        desc: 'Discípulo de Cristo, Ingeniero de sistemas y desarrollador de software, es el encargado de diseñar y programar nuestra página web y brindarnos todos las herramientas y recursos digitales necesarios para cumplir con nuestra asignación de expandir el reino de Dios aquí en la tierra; es también deportista profesional, padre, creador de contenido y cofundador de la escuela de formación y capacitación bíblica Dilo de parte de Dios.',
        insta: 'https://www.instagram.com/yeizermarrugo/',
        face: 'https://www.facebook.com/yemave',
        yout: 'https://www.youtube.com/@diosconnosotrosyd'
    },
    {
        img: 'assets/img/person/Diana.png',
        name: 'Diana López',
        role: 'Cofundadora & Escritora',
        desc: 'Discípulo de Cristo, administradora de empresas, escritora y maestra de vocación, madre, creadora de contenido y cofundadora de la escuela de formación y capacitación bíblica Dilo de parte de Dios. Dios le entregó la visión de esta escuela y del ministerio en el año 2022, y desde entonces ha estado trabajando incansablemente para equipar al pueblo de Dios con recursos que les ayuden a comprender y vivir las Escrituras.',
        insta: 'https://www.instagram.com/dianalopez_fit/',
        face: 'https://www.facebook.com/Dlopez0712',
        yout: 'https://www.youtube.com/@diosconnosotrosyd'
    },
];

const About = () => {
    return (
        <div className="about-page">
            <Header />

            <main className="main">
                {/* Page Title */}
                <div className="page-title">
                    <div className="title-wrapper">
                        <p>
                            <span style={{ fontWeight: 'bold' }}>Dilo de parte de Dios</span> es una plataforma donde encontrarás palabra, recursos y
                            herramientas que te ayudarán a conectar con Dios, conocerlo y entender lo que él tiene para decirte de manera personal.
                        </p>
                        <br />
                        <p style={{ fontStyle: 'italic' }}>
                            “Lámpara es a mis pies tu palabra, y lumbrera a mi camino.”{' '}
                            <span style={{ fontWeight: 'bold' }}>Salmos 119:105 RVR1960</span>
                        </p>
                    </div>
                </div>

                {/* About Section */}
                <section id="about" className="about section">
                    <div className="container" data-aos="fade-up" data-aos-delay="100">
                        {/* <span className="section-badge">
                            <i className="bi bi-info-circle"></i> About Us
                        </span> */}
                        <div className="row">
                            <div className="mision col-lg-5">
                                <h2 className="about-title">Misión</h2>
                                <p className="about-description">
                                    Preparar y capacitar al pueblo de Dios de manera que puedan lograr el completo desarrollo de sus capacidades
                                    espirituales y naturales, para que vivan con excelencia una vida basada en los principios bíblicos, y de ese modo
                                    cumplan la voluntad de Dios para sus vidas y sirvan como instrumento para los planes de Dios en la vida de otros.
                                </p>
                            </div>
                            <div className="vision col-lg-6">
                                <h2 className="about-title">Visión</h2>
                                <p className="about-description">
                                    Ser líderes a nivel mundial en fomentar la cultura de la lectura bíblica, brindando herramientas para su correcta
                                    comprensión e interpretación, la cual se da de manera efectiva teniendo y manteniendo comunión con el Espíritu
                                    Santo de Dios, quien nos enseña, nos redarguye, nos corrige y nos instruye para poder entenderla y vivirla.
                                </p>
                            </div>
                        </div>
                        <br />
                        <br />
                        <div>
                            <h2 className="about-title" style={{ justifyContent: 'center', display: 'flex', marginTop: '30px' }}>
                                Valores
                            </h2>
                        </div>
                        <div className="row features-boxes gy-4 mt-3">
                            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
                                <div className="feature-box">
                                    <div className="icon-box">
                                        <i className="bi bi-stars"></i>
                                    </div>
                                    <h3>
                                        <a className="stretched-link" style={{ cursor: 'default' }}>
                                            FE
                                        </a>
                                    </h3>
                                    <p style={{ textAlign: 'justify' }}>
                                        Por fe creemos que la biblia fue inspirada por el Espíritu Santo de Dios, además de que ya hay evidencia
                                        científica de todo lo que habla y se ha cumplido mucho de lo que allí está escrito; por esta razón, es nuestro
                                        valor principal para el estudio, comprensión e interpretación de las escrituras. La fe, la cual nos es dada
                                        por Dios, nos ayuda a creer que él existe, que es bueno y que somos salvos por medio del sacrificio de
                                        Jesucristo.
                                    </p>
                                </div>
                            </div>
                            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
                                <div className="feature-box">
                                    <div className="icon-box">
                                        <i className="bi bi-flower2"></i>
                                    </div>
                                    <h3>
                                        <a className="stretched-link" style={{ cursor: 'default' }}>
                                            HUMILDAD
                                        </a>
                                    </h3>
                                    <p style={{ textAlign: 'justify' }}>
                                        Sólo con humildad podremos tener un corazón dispuesto a recibir y a poner por obra las enseñanzas que Dios nos
                                        da a través de su palabra. La humildad nos mantiene conscientes de que necesitamos a Dios para ser todo lo que
                                        somos y hacer todo lo que hacemos.
                                    </p>
                                </div>
                            </div>
                            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="400" style={{ cursor: 'default' }}>
                                <div className="feature-box">
                                    <div className="icon-box">
                                        <i className="bi bi-shield-check"></i>
                                    </div>
                                    <h3>
                                        <a className="stretched-link">CONFIANZA</a>
                                    </h3>
                                    <p style={{ textAlign: 'justify' }}>
                                        La confianza nos permite estar seguros de que los planes de Dios para nuestra vida son muchos mejores que los
                                        nuestros, y nos ayuda a descansar en su perfecto plan y propósito, animándonos a cooperar con el Espíritu
                                        Santo en nuestra transformación y la de otros.
                                    </p>
                                </div>
                            </div>
                            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="400" style={{ cursor: 'default' }}>
                                <div className="feature-box">
                                    <div className="icon-box">
                                        <i className="bi bi-check2-circle"></i>
                                    </div>
                                    <h3>
                                        <a className="stretched-link">OBEDIENCIA</a>
                                    </h3>
                                    <p style={{ textAlign: 'justify' }}>
                                        Obedeciendo de manera práctica y de forma completa los mandatos de Dios, los cuales nos son dados a través de
                                        su palabra, podremos alcanzar todo lo que él ha dispuesto para nuestra vida, cumpliendo cabalmente cada una de
                                        nuestras asignaciones.
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* <div className="row mt-5">
                            <div className="col-lg-12" data-aos="zoom-in" data-aos-delay="200">
                                <div className="video-box">
                                    <img src="assets/img/about/about-wide-1.webp" className="img-fluid" alt="Video Thumbnail" />
                                    <a href="https://www.youtube.com/watch?v=Y7f98aduVJ8" className="glightbox pulsating-play-btn"></a>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </section>

                {/* Team Section */}
                <section id="team" className="team section light-background">
                    <div className="section-title container" data-aos="fade-up">
                        <h2>Equipo</h2>
                        <div>
                            <span>Nuestro</span> <span className="description-title">Equipo</span>
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
                                            <p style={{ textAlign: 'justify' }}>{member.desc}</p>
                                            <div className="social">
                                                <a href={member.face} target='_blank'>
                                                    <i className="bi bi-facebook"></i>
                                                </a>
                                                <a href={member.insta} target='_blank'>
                                                    <i className="bi bi-instagram"></i>
                                                </a>
                                                {/* <a href="">
                                                    <i className="bi bi-linkedin"></i>
                                                </a> */}
                                                <a href={member.yout} target='_blank'>
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
            <Footer />
        </div>
    );
};

export default About;
