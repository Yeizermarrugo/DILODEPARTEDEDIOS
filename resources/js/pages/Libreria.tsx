import Footer from "@/components/Footer";
import Header from "@/components/Header";
import '../../css/main.css';
import '../../css/podcast.css';

const Libreria = () => {
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
                    <p style={{ fontStyle: 'italic' }}>

                        “Más bien, busquen todo lo que sea bueno y que ayude a su espíritu, así como los niños recién nacidos buscan ansiosos la leche de su madre. Si lo hacen así, serán mejores cristianos y Dios los salvará,”{' '}
                        <span style={{ fontWeight: 'bold' }}>1 Pedro 2:2 TLA</span>
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

export default Libreria