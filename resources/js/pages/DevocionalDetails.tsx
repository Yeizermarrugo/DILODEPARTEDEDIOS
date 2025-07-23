import { useImagePreload } from '@/components/useImagePreload';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import '../../css/devocionalDetails.css';

type Devocional = {
    contenido: string;
    imagen: string;
    // Agrega aquí otros campos si es necesario
};

const DevocionalDetails = () => {
    const { devocional } = usePage().props as unknown as { devocional: Devocional };
    const [loading, setLoading] = useState(true);
    const imageLoaded = useImagePreload(devocional.imagen);

    useEffect(() => {
        setLoading(true);
        // Simulate an API call
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    console.log('devocional', devocional);

    const getH1Text = (html: string): string => {
        const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
        return match ? match[1].trim() : '';
    };

    const splitH1Parts = (h1Text: string): [string, string, string] => {
        const parts = h1Text.split(' ');
        return [parts[0] || '', parts[1] || '', parts.slice(2).join(' ') || ''];
    };

    const removeFirstTag = (html: string): string => {
        return html.replace(/<h1[^>]*>.*?<\/h1>/i, '').trim();
    };

    const devocionalContent = removeFirstTag(devocional.contenido);

    const H1Custom = ({ contenido }: { contenido: string }) => {
        const h1Text = getH1Text(contenido);
        const [parte1, parte2, parte3] = splitH1Parts(h1Text);
        return (
            <header
                className="header"
                style={{
                    background: `url(${devocional.imagen}) no-repeat`,
                    backgroundSize: 'cover',
                    paddingTop: '61.93333333%',
                    fontFamily: "'Sucrose Bold Two'",
                    position: 'relative',
                    color: 'white',
                    zIndex: -2,
                }}
            >
                <h1 style={{ paddingTop: '50px' }}>
                    {parte1}
                    <span>{parte2}</span>
                    {parte3}
                </h1>
            </header>
        );
    };

    if (loading && !imageLoaded) {
        return (
            <div id="preloader" className="d-flex align-items-center justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="devocional-details">
            <H1Custom contenido={devocional.contenido} />
            <section>
                <p style={{ fontSize: '20px', padding: '10px' }} dangerouslySetInnerHTML={{ __html: devocionalContent }} />
            </section>
        </div>
    );
};
export default DevocionalDetails;
