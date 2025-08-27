import Footer from '@/components/Footer';
import Header from '@/components/Header';
import '../../css/main.css';
import '../../css/podcast.css';

export default function Podcast() {
    return (
        <div className="index-page">
            {/* Header */}
            <Header />

            {/* Page Title */}
            <div className="page-title">
                <div className="title-wrapper">
                    <h1>¿Buscas inspiración y dirección para vivir una vida plenamente saludable?</h1>
                    <br />
                    <br />
                    <h1 style={{ fontSize: '1.4rem', display: 'flex', justifyContent: 'center' }}>¡Próximamente!</h1>
                    <br />
                    <p>
                        Descubre la conexión perfecta entre la fe, el amor y el cuidado físico en nuestra nueva serie de podcasts,{' '}
                        <span style={{ fontWeight: 'bold' }}>'Cristo, Amor y Fitness'</span>. En cada episodio, exploraremos cómo la relación con
                        Cristo puede inspirarte a vivir una vida de amor y compasión, mientras que el ejercicio y la nutrición te ayudan a cuidar tu
                        cuerpo, templo del Espíritu Santo. Desde consejos prácticos para mejorar tu salud física, mental y emocional, hasta
                        testimonios de personas que han encontrado la paz y la felicidad a través de la fe y el fitness, nuestra serie te impulsará a
                        cooperar con el Espíritu Santo hacia tu transformación y crecimiento.
                    </p>
                    <br />
                    <p style={{ fontWeight: 'bold' }}>
                        ¡Únete a nosotros en este aprendizaje y descubre cómo Cristo, el amor y el fitness pueden cambiar tu vida para siempre.
                    </p>
                    <br />
                    <p style={{ fontStyle: 'italic' }}>
                        Amado, yo deseo que tú seas prosperado en todas las cosas, y que tengas salud, así como prospera tu alma.”{' '}
                        <span style={{ fontWeight: 'bold' }}>3 JUAN 1:2 RVR1960</span>
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <main className="centered-main">
                <img src="/assets/img/Estamos%20trabajando.png" alt="Estamos trabajando" className="trabajando" />
            </main>

            {/* Footer */}
            <Footer />

            {/* Scroll Top Button */}
            {/* <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
                <i className="bi bi-arrow-up-short"></i>
            </a> */}
        </div>
    );
}
