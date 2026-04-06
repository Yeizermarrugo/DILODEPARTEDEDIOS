export default function Offline() {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh', padding: '20px', textAlign: 'center',
        }}>
            <img src="/assets/img/logo.png" alt="Logo" style={{ width: 80, marginBottom: 24 }} />
            <h1 style={{ fontSize: '1.5rem', color: '#1a1a1a', marginBottom: 12 }}>
                Sin conexión
            </h1>
            <p style={{ color: '#666', marginBottom: 24, maxWidth: 300 }}>
                Revisa tu conexión e intenta de nuevo.
            </p>
            <button
                onClick={() => window.location.reload()}
                style={{
                    padding: '12px 28px', borderRadius: 8,
                    background: '#f75815', color: '#fff',
                    border: 'none', fontSize: 15, cursor: 'pointer',
                }}
            >
                Reintentar
            </button>
        </div>
    );
}