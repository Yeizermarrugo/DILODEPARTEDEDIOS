import TextToSpeechButton from '@/components/TextToSpeechButton';
import { useImagePreload } from '@/components/useImagePreload';
import { useEffect, useState } from 'react';
import '../../css/devocionalDetails.css';

type Devocional = {
    contenido: string;
    imagen: string;
    created_at?: string;
};

interface props {
    devocional: Devocional;
}

const DevocionalDetails = ({ devocional }: props) => {
    // const { devocional } = usePage().props as unknown as { devocional: Devocional };
    const [loading, setLoading] = useState(true);
    const imageLoaded = useImagePreload(devocional.imagen);

    useEffect(() => {
        setLoading(true);
        // Simulate an API call
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

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
                className="header-modal"
                style={{
                    background: `url(${devocional.imagen}) no-repeat`,
                    backgroundSize: 'cover',
                    paddingTop: '61.93333333%',
                    fontFamily: "'Sucrose Bold Two'",
                    position: 'relative',
                    paddingBottom: '200px',
                    color: 'white',
                    zIndex: -2,
                }}
            >
                <h1 className="title" style={{ paddingTop: '50px' }}>
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

    const stripHtml = (html: string) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    return (
        <div className="devocional-details">
            <H1Custom contenido={devocional.contenido} />
            <section>
                <TextToSpeechButton texto={stripHtml(devocional.contenido ?? '')} />

                <p style={{ fontSize: '20px', padding: '10px' }} dangerouslySetInnerHTML={{ __html: devocionalContent }} />
            </section>
            <div style={{ marginTop: '8px', color: '#888' }}>
                {devocional.created_at
                    ? new Date(devocional.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                      })
                    : ''}
            </div>
        </div>
    );
};
export default DevocionalDetails;
