import Footer from "@/components/Footer";
import Header from "@/components/Header";
import '../../css/legal.css';
import '../../css/main.css';

const PaginaLegal = () => {
    return (
        <div className="index-page">
            <Header />
            <main className="centered-main">
                <div className="container legal-container mt-5 mb-5">
                    {/* SECCIÓN 1: DERECHOS DE AUTOR */}
                    <section id="copyright" className="mb-5">
                        <h2 className="mb-4">📃Derechos de Autor y Uso del Contenido</h2>
                        <p className="lead" style={{ color: '#555' }}>
                            Todo el contenido publicado en esta plataforma es propiedad de la escuela <strong>Dilo de parte de Dios</strong>.
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
                    </section>

                    {/* SECCIÓN 2: PRIVACIDAD */}
                    <section id="privacidad" className="pt-5 border-top">
                        <h2 className="mb-4">🛡️ Política de Privacidad</h2>
                        <p>
                            En <strong>Dilo de parte de Dios</strong>, valoramos tu privacidad. Esta política explica cómo manejamos la información cuando visitas nuestro sitio:
                        </p>

                        <div className="privacy-box mt-4">
                            <h5>1. Información que recolectamos</h5>
                            <p>
                                No solicitamos registros obligatorios. Recolectamos datos <strong>anónimos</strong> (ubicación general, tipo de dispositivo y páginas visitadas) para entender el alcance de nuestro ministerio.
                            </p>

                            <h5>2. Uso de la información</h5>
                            <p>
                                Estos datos se utilizan exclusivamente para mejorar nuestros materiales y asegurar que el sitio funcione correctamente en tu región. No compartimos estos datos con terceros.
                            </p>

                            <h5>3. Consentimiento</h5>
                            <p>
                                Al utilizar nuestro sitio y aceptar el banner de privacidad, consientes el uso de estos registros técnicos necesarios para la mejora de la plataforma.
                            </p>
                        </div>
                    </section>

                    <footer className="mt-5 pt-4 border-top text-center">
                        <p className="text-muted" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                            Última actualización: Marzo 2026. <br />
                            © 2025 - {new Date().getFullYear()} Dilo de parte de Dios. Todos los derechos reservados.
                        </p>
                    </footer>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PaginaLegal;