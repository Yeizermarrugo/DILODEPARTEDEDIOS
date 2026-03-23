import Footer from "@/components/Footer";
import Header from "@/components/Header";
import '../../css/legal.css';
import '../../css/main.css';

const PaginaLegal = () => {
    return (
        <div className="index-page">
            <Header />
            <main className="centered-main">
                {/* Agregamos este div con la clase legal-container */}
                <div className="container legal-container mt-5 mb-5">
                    <h2 className="mb-4">Derechos de Autor y Uso del Contenido</h2>
                    <p className="lead" style={{ color: '#555' }}>
                        Todo el contenido publicado en esta plataforma es propiedad de la escuela<strong> Dilo de parte de Dios </strong>.
                    </p>

                    <hr className="my-4" />

                    <div className="row mt-4">
                        <div className="col-md-6 mb-4">
                            <h4 className="text-success">✅ Uso permitido</h4>
                            <ul>
                                <li>Compartir el contenido con otras personas.</li>
                                <li>Imprimir para enseñanza o discipulado.</li>
                                <li>Apoyo educativo en iglesias o fundaciones.</li>
                            </ul>
                        </div>
                        <div className="col-md-6 mb-4">
                            <h4 className="text-danger">❌ Uso NO permitido</h4>
                            <ul>
                                <li>Vender total o parcialmente el contenido.</li>
                                <li>Modificarlo y presentarlo como propio.</li>
                                <li>Distribuirlo con fines comerciales.</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PaginaLegal;