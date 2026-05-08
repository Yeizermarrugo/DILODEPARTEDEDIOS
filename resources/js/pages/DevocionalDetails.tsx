import { LikeButton } from '@/components/LikeButton';
import { ShareButton } from '@/components/ShareButton';
import TextToSpeechButton from '@/components/TextToSpeechButton';
import { useImagePreload } from '@/components/useImagePreload';
import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import '../../css/devocionalDetails.css';

type Devocional = {
    id?: string;
    contenido: string;
    imagen: string;
    created_at?: string;
    autor?: string;
    is_devocional?: number; // 0=estudio | 1=devocional | 2=ensenanza
};

interface Props {
    devocional: Devocional;
}

function getContentType(is_devocional?: number): 'devocional' | 'estudio' | 'ensenanza' {
    if (is_devocional === 3) return 'estudio';
    if (is_devocional === 2) return 'ensenanza';
    return 'devocional';
}

const DevocionalDetails = ({ devocional }: Props) => {
    const [loading, setLoading] = useState(true);
    const imageLoaded = useImagePreload(devocional.imagen);
    const contentType = getContentType(devocional.is_devocional);

    useEffect(() => {
        setLoading(true);
        const t = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(t);
    }, []);

    const getH1Text = (html: string): string => {
        const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
        return match ? match[1].trim() : '';
    };

    const splitH1Parts = (h1Text: string): [string, string] => {
        const words = h1Text.trim().split(/\s+/);
        const groupSize = Math.ceil(words.length / 2);
        return [words.slice(0, groupSize).join(' '), words.slice(groupSize, groupSize * 2).join(' ')];
    };

    const removeFirstTag = (html: string) => html.replace(/<h1[^>]*>.*?<\/h1>/i, '').trim();

    const devocionalContent = removeFirstTag(devocional.contenido);

    const decodeHtmlEntities = (str: string) => {
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
                    paddingTop: '61.93333333%',
                    fontFamily: "'Sucrose Bold Two'",
                    position: 'relative',
                    paddingBottom: '200px',
                    color: 'white',
                    zIndex: -2,
                }}
            >
                <h1 className="title" style={{ paddingTop: '70px', textTransform: 'uppercase' }}>
                    {parte1} {parte2}
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
        <div className="devocional-details">
            <H1Custom contenido={devocional.contenido} />

            <section>
                <TextToSpeechButton texto={stripHtml(devocional.contenido ?? '')} />

                <p style={{ padding: '5px', textAlign: 'justify' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(devocionalContent) }}
                />

                <p style={{ color: '#888', display: 'flex', justifyContent: 'flex-end', padding: '0 20px 0 0' }}>
                    {devocional.autor ?? ''}
                </p>

                <div style={{ color: '#888', display: 'flex', justifyContent: 'flex-end', padding: '0 20px 10px 0' }}>
                    {devocional.created_at
                        ? new Date(devocional.created_at)
                            .toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                            .replace(/^\w/, c => c.toUpperCase())
                        : ''}
                </div>

                {/* ── Compartir + Like al pie ── */}
                {devocional.id && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '8px',
                        padding: '10px 20px 4px 0',
                        borderTop: '1px solid #f0f0f0',
                        marginTop: '6px',
                        color: '#888',
                    }}>
                        <ShareButton type={contentType} id={devocional.id} variant="default" />
                        <LikeButton type={contentType} id={devocional.id} variant="default" />
                    </div>
                )}
            </section>
        </div>
    );
};

export default DevocionalDetails;
