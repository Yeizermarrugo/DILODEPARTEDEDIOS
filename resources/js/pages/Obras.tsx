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
                    <p>En esta sección compartimos las obras y acciones sociales que realizamos como ministerio, sirviendo a otros con el amor de Cristo y llevando esperanza a quienes más lo necesitan.
                    </p>
                    <br />
                    <p>
                        Creemos que el Evangelio no solo se predica con palabras, sino también con hechos que reflejan la gracia de Dios.
                    </p>
                    <br />
                    <p style={{ fontWeight: 'bold' }}>Tu apoyo nos ayuda a seguir sirviendo y alcanzando más vidas</p>
                    <br />
                    <p style={{ fontStyle: 'italic' }}>

                        “Hijitos, nuestro amor no debe ser solo de palabras, pues el verdadero amor se demuestra con hechos.”{' '}
                        <span style={{ fontWeight: 'bold' }}>1 Juan 3:18 PDT</span>
                    </p>
                    <br />
                    {/* <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                        <a style={{}}
                            href="https://checkout.nequi.wompi.co/l/VPOS_FXXUBu"
                            target="_blank"
                            rel="noreferrer"
                            className="obras-header__cta"
                        >
                            Done a nuestro ministerio
                        </a>
                    </div> */}
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