import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ObrasList from "@/components/ObrasList";
import { useEffect, useState } from "react";
import '../../css/main.css';
import '../../css/podcast.css';

const Obras = () => {
    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("cop");

    // Lógica de Validación
    const minCOP = 5000;
    const minUSD = 1.25;

    // El botón se habilita solo si hay un monto y cumple el mínimo según la moneda
    const isValidAmount = currency === "cop"
        ? parseFloat(amount) >= minCOP
        : parseFloat(amount) >= minUSD;

    const launchEpayco = () => {
        if (!isValidAmount) return; // Doble validación de seguridad

        const publicKey = import.meta.env.VITE_EPAYCO_PUBLIC_KEY;
        const epayco = (window as any).ePayco;

        if (epayco && publicKey) {
            const handler = epayco.checkout.configure({
                key: publicKey,
                test: true
            });

            const detectedCountry = (navigator.language.split('-')[1] || 'co').toLowerCase();

            const data = {
                name: "Donación al Ministerio",
                description: "Apoyo a las obras sociales - Dilo de parte de Dios",
                currency: currency.toLowerCase(),
                amount: amount,
                tax_base: "0",
                tax: "0",
                country: detectedCountry,
                lang: "es",
                external: "false",
                // confirmation: `${import.meta.env.EPAYCO_TEST === 'true' ? 'https://dilodepartededios.com/recaudo/confirmacion' : 'https://localhost:8000/recaudo/confirmacion'}`,
                // response: `${window.location.origin}/gracias`,
                response: `${import.meta.env.VITE_APP_URL}/gracias`,
                confirmation: `${import.meta.env.VITE_APP_URL}/recaudo/confirmacion`,
                invoice: `DON-${Date.now()}`,
            };

            setShowSelectionModal(false);
            handler.open(data);
        } else {
            alert("Error: La pasarela no cargó correctamente.");
        }
    };

    useEffect(() => {
        if (document.getElementById('epayco-script')) return;
        const script = document.createElement('script');
        script.id = 'epayco-script';
        script.src = "https://checkout.epayco.co/checkout.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    return (
        <div className="index-page">
            <Header />

            <div className="page-title">
                <div className="title-wrapper">
                    <h1 style={{ textAlign: 'center' }}>Llamados a servir con amor</h1>
                    <br /><br />
                    <p>En esta sección compartimos las obras y acciones sociales que realizamos como ministerio...</p>
                    <br />
                    <p style={{ fontWeight: 'bold' }}>Tu apoyo nos ayuda a seguir sirviendo y alcanzando más vidas</p>
                    <br />
                    <p style={{ fontStyle: 'italic' }}>“Hijitos, nuestro amor no debe ser solo de palabras...” <b>1 Juan 3:18 PDT</b></p>
                    <br />

                    {/* Botón Principal que abre TU modal */}
                    {/* <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            onClick={() => setShowSelectionModal(true)}
                            className="obras-header__cta"
                            style={{ cursor: 'pointer', border: 'none' }}
                        >
                            Apoyar esta obra
                        </button>
                    </div> */}
                </div>
            </div>

            {/* MODAL DE SELECCIÓN DE MONTO (Se muestra si showSelectionModal es true) */}
            {showSelectionModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.82)', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', zIndex: 1000, padding: '15px' // Margen externo para móviles
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '25px', borderRadius: '15px',
                        width: '100%', maxWidth: '500px', textAlign: 'center',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        boxSizing: 'border-box' // Asegura que el padding no sume al ancho
                    }}>
                        <h2 style={{ marginBottom: '15px', color: '#333', fontSize: '1.5rem' }}>Selecciona tu aporte</h2>

                        <p style={{ marginBottom: '10px' }}><strong>Gracias por tu apoyo 🙏</strong></p>
                        <p style={{ fontStyle: 'italic', fontSize: '14px', marginBottom: '20px', lineHeight: '1.4', color: '#666' }}>
                            Tu aporte voluntario nos ayuda a llevar el mensaje de la Palabra a más personas y a seguir impactando vidas con obras sociales.
                        </p>

                        {/* Contenedor de Input y Select corregido */}
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            marginBottom: '5px', // Reducido para que el aviso quede cerca
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    flex: '1',
                                    minWidth: '80px',
                                    fontSize: '16px'
                                }}
                            >
                                <option value="usd">USD ($)</option>
                                <option value="cop">COP ($)</option>
                            </select>
                            <input
                                type="number"
                                value={amount}
                                placeholder="Monto"
                                onChange={(e) => setAmount(e.target.value)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    flex: '2',
                                    minWidth: '0',
                                    width: '100%',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                                min="1"
                            />
                        </div>

                        <p style={{
                            fontSize: '12px',
                            color: isValidAmount || amount === "" ? '#888' : '#ff0000', // Rojo si el monto es insuficiente
                            textAlign: 'left', marginBottom: '20px', marginTop: '0', width: '100%'
                        }}>
                            Monto mínimo: $5.000 COP (~$1.25 USD)
                        </p>

                        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                            <button
                                onClick={() => setShowSelectionModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    backgroundColor: '#eee',
                                    fontSize: '14px'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={launchEpayco}
                                disabled={!isValidAmount}
                                style={{
                                    flex: 2, padding: '12px', border: 'none', borderRadius: '8px',
                                    cursor: isValidAmount ? 'pointer' : 'not-allowed',
                                    backgroundColor: isValidAmount ? '#28a745' : '#a5d6a7', // Color más claro si está deshabilitado
                                    color: 'white', fontWeight: 'bold'
                                }}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="centered-main">
                <ObrasList />
            </main>

            <Footer />
        </div>
    );
}

export default Obras;