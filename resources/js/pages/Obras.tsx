import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ObrasList from "@/components/ObrasList";
import '../../css/main.css';
import '../../css/podcast.css';

const Obras = () => {
    return (
        <div className="index-page">
            {/* Header */}
            <Header />

            {/* Page Title */}
            <div className="page-title">
                <div className="title-wrapper">
                    <h1 style={{ textAlign: 'center' }}>Llamados a servir con amor</h1>
                    <br />
                    <br />
                    {/* <h1 style={{ fontSize: '1.4rem', display: 'flex', justifyContent: 'center' }}>¡Próximamente!</h1>
                    <br /> */}
                    <p>Esta sección refleja la fe puesta en acción a través del servicio que realizamos como ministerio, participando en las obras y espacios que el Señor nos permite, en ocasiones junto a otros hermanos en la fe.
                    </p>
                    <br />
                    <p>
                        Creemos que Dios nos ha enviado a mostrar nuestras buenas obras para que otros glorifiquen su nombre (Mateo 5:16), llevando esperanza, amor y oportunidades a quienes más lo necesitan, manifestando el Evangelio con hechos y verdad.
                    </p>
                    <br />
                    <p style={{ fontWeight: 'bold' }}>Tu apoyo nos ayuda a seguir sirviendo y alcanzando más vidas</p>
                    <br />
                    <p style={{ fontStyle: 'italic' }}>

                        “Hijitos, nuestro amor no debe ser solo de palabras, pues el verdadero amor se demuestra con hechos.”{' '}
                        <span style={{ fontWeight: 'bold' }}>1 Juan 3:18 PDT</span>
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <main className="centered-main">
                <ObrasList />
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

export default Obras