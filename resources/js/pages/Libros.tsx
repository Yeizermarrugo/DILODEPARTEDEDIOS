import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LibroList from '@/components/LibroList';
import '../../css/main.css';
import '../../css/podcast.css';

export default function Libros() {
    return (
        <div className="index-page">
            {/* Header */}
            <Header />

            {/* Page Title */}
            <div className="page-title">
                <div className="title-wrapper">
                    <h1>Librería Cristiana: Recursos para tu Crecimiento Espiritual</h1>
                    <br />
                    <br />
                    {/* <h1 style={{ fontSize: '1.4rem', display: 'flex', justifyContent: 'center' }}>¡Próximamente!</h1>
                    <br /> */}
                    <p>En nuestra Librería cristiana encontrarás una variedad de recursos que te ayudarán a crecer en tu relación con Dios.</p>
                    <br />
                    <p>
                        Descubre libros cristianos de nuestra autoría y de otros autores destacados, así como herramientas para el estudio bíblico,
                        souvenirs, arte cristiano y otros productos que te inspirarán y motivarán en tu camino espiritual.
                    </p>
                    <br />
                    <p style={{ fontWeight: 'bold' }}>¡Encuentra lo que necesitas para fortalecer tu fe y compartir el amor de Cristo con otros!</p>
                    <br />
                    {/* <p style={{ fontStyle: 'italic' }}>
                        Amado, yo deseo que tú seas prosperado en todas las cosas, y que tengas salud, así como prospera tu alma.”{' '}
                        <span style={{ fontWeight: 'bold' }}>3 JUAN 1:2 RVR1960</span>
                    </p> */}
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
