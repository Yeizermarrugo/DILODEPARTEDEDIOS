import TextToSpeechButton from '@/components/TextToSpeechButton';
import { useImagePreload } from '@/components/useImagePreload';
import { useEffect, useState } from 'react';
import '../../css/devocionalDetails.css';

type Devocional = {
    contenido: string;
    imagen: string;
    created_at?: string;
    autor?: string;
};

interface props {
    devocional: Devocional;
}

const DevocionalDetailsPage = ({ devocional }: props) => {
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

    const splitH1Parts = (h1Text: string): [string, string] => {
        const words = h1Text.trim().split(/\s+/);
        const total = words.length;
        const groupSize = Math.ceil(total / 2);

        // Calcula los límites de cada grupo
        const first = words.slice(0, groupSize).join(' ');
        const second = words.slice(groupSize, groupSize * 2).join(' ');
        // const third = words.slice(groupSize * 2).join(' ');

        return [first, second];
    };
    const removeFirstTag = (html: string): string => {
        return html.replace(/<h1[^>]*>.*?<\/h1>/i, '').trim();
    };

    const devocionalContent = removeFirstTag(devocional.contenido);

    const decodeHtmlEntities = (str: string): string => {
        const txt = document.createElement('textarea');
        txt.innerHTML = str;
        return txt.value;
    };

    const H1Custom = ({ contenido }: { contenido: string }) => {
        const h1Text = getH1Text(contenido);
        const [parte1, parte2] = splitH1Parts(decodeHtmlEntities(h1Text));
        return (
            <header
                className="header-modal"
                style={{
                    background: `url(${devocional.imagen}) center center no-repeat`,
                    backgroundSize: 'cover',
                    paddingTop: '60%',
                    // fontFamily: "'Sucrose Bold Two'",
                    position: 'relative',
                    paddingBottom: '200px',
                    color: 'white',
                    zIndex: -2,
                }}
            >
                <h1 className="title" style={{ paddingTop: '70px', marginBottom: '0px', paddingBottom: '150px' }}>
                    {parte1}
                    {' '}
                    {parte2}
                </h1>
            </header>
        );
    };

    const stripHtml = (html: string) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
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
        <div className="devocional">
            <H1Custom contenido={devocional.contenido} />

            <section
                style={{
                    background: '#fff',
                    padding: '24px',
                    borderRadius: '8px',
                    width: '100%',
                    position: 'relative',
                }}
            >
                <TextToSpeechButton texto={stripHtml(devocional.contenido ?? '')} />
                <p style={{ padding: '5px' }} dangerouslySetInnerHTML={{ __html: devocionalContent }} />
            </section>
            <p style={{ color: '#888', display: 'flex', justifyContent: 'flex-end', padding: '0 20px 0 0' }}>
                {devocional.autor ? `${devocional.autor}` : ''}
            </p>
            <div style={{ color: '#888', display: 'flex', justifyContent: 'flex-end', padding: '0 20px 10px 0' }}>
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
export default DevocionalDetailsPage;
