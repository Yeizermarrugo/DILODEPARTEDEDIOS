import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LibroList from '@/components/LibroList';
import '../../css/main.css';
import '../../css/podcast.css';

export default function Estudios() {
    return (
        <div className="index-page">
            {/* Header */}
            <Header />

            {/* Page Title */}
            <div className="page-title">
                <div className="title-wrapper">
                    <h1 style={{ textAlign: 'center' }}>Estudios Biblicos</h1>
                    <br />
                    <br />
                    {/* <h1 style={{ fontSize: '1.4rem', display: 'flex', justifyContent: 'center' }}>¡Próximamente!</h1>
                    <br /> */}
                    <p>Esta sección está dedicada a la <strong>enseñanza fiel de la Palabra de Dios</strong>, con el propósito de acompañar a cada persona en su crecimiento espiritual y en el conocimiento de la voluntad del Señor.</p>
                    <br />
                    <p>
                        A través de estudios bíblicos <strong>libro por libro y capítulo por capítulo</strong>, guiamos a los lectores a conocer el corazón de Dios y a vivir conforme a la verdad de Su Palabra, edificando la fe y fortaleciendo los fundamentos espirituales.
                    </p>
                    <br />
                    <p>
                        Nuestro anhelo es <strong>que la Palabra sea comprendida, creída y vivida</strong>, produciendo fruto espiritual en quienes se acercan con un corazón dispuesto a aprender.
                    </p>
                    <br />
                    <p style={{ fontWeight: 'bold' }}>Comprende las palabras del que murió en la cruz</p>
                    <br />
                    <p style={{ fontStyle: 'italic' }}>
                        “Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir, para corregir, para instruir en justicia, a fin de que el hombre de Dios sea perfecto, enteramente preparado para toda buena obra.”{' '}
                        <span style={{ fontWeight: 'bold' }}>2 TIMOTEO 3:16-17 RVR1960</span>
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <main className="page-title">
                <div className="title-wrapper">

                    <LibroList />
                </div>
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
