import { useEffect, useState } from 'react';

const PrivacyBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasAccepted = localStorage.getItem('dilodeparte_privacy_v1');
        if (!hasAccepted) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = async () => {
        // 1. Guardamos localmente para que no parpadee el banner
        localStorage.setItem('dilodeparte_privacy_v1', 'true');
        setIsVisible(false);

        // 2. Enviamos al servidor para persistir en la DB
        try {
            await fetch('/privacy/accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ accepted: true }),
            });
        } catch (error) {
            console.error("Error al registrar consentimiento:", error);
        }
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed', bottom: '20px', left: '20px', right: '20px',
            backgroundColor: 'rgba(33, 37, 41, 0.95)', color: '#ffffff',
            padding: '20px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            zIndex: 10000, display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            alignItems: 'center', justifyContent: 'space-between', gap: '15px',
            border: '1px solid rgba(119, 215, 185, 0.3)', backdropFilter: 'blur(10px)'
        }}>
            <div style={{ textAlign: window.innerWidth < 768 ? 'center' : 'left' }}>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                    En <strong>Dilo de parte de Dios</strong>, valoramos tu privacidad.
                    Utilizamos registros anónimos (como tu ubicación general y tipo de dispositivo)
                    para entender el alcance de nuestros recursos educativos y espirituales y mejorar tu experiencia.
                    Al continuar, aceptas nuestra Política de Privacidad
                    {/* <a href="/privacidad" style={{ color: '#77d7b9', textDecoration: 'underline' }}> */}

                    {/* </a>. */}
                </p>
            </div>
            <button
                onClick={handleAccept}
                style={{
                    backgroundColor: '#77d7b9', color: '#212529', border: 'none',
                    padding: '10px 25px', borderRadius: '6px', fontWeight: '700',
                    cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap',
                    transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                Aceptar y continuar
            </button>
        </div>
    );
};

export default PrivacyBanner;