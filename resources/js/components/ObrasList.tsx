// ObrasList.tsx
import { InstagramEmbed } from 'react-social-media-embed';
import '../../css/obrasList.css';

type InstagramItem = {
    id: number;
    url: string;
    type?: 'post' | 'profile';
    title?: string;
};

const INSTAGRAM_ITEMS: InstagramItem[] = [
    {
        id: 1,
        type: 'post',
        url: 'https://www.instagram.com/p/DNWRIEeJX_d/' // reemplaza por tu reel/post
    },
    {
        id: 2,
        type: 'post',
        url: 'https://www.instagram.com/p/DTg414TDMU0/'
    },
    {
        id: 3,
        type: 'profile',
        url: 'https://www.instagram.com/dilodepartededios/',
    },
];

const ObrasList = () => {
    return (
        <section className="obras-section">
            <header className="obras-header">
                <h2>Nuestras obras en acción</h2>
                <p>
                    Mira algunos momentos de servicio y síguenos en Instagram para ver más.
                </p>
                <a
                    href="https://www.instagram.com/dilodepartededios"
                    target="_blank"
                    rel="noreferrer"
                    className="obras-header__cta"
                >
                    Ir a nuestro Instagram
                </a>
            </header>

            <div className="obras-grid">
                {INSTAGRAM_ITEMS.map((item) => (
                    <article key={item.id} className="obra-card">
                        <div className="obra-card__embed">
                            <InstagramEmbed url={item.url} width="100%" />
                        </div>

                        <div className="obra-card__body">
                            {item.title && <h3>{item.title}</h3>}

                            <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="obra-card__link"
                            >
                                {item.type === 'profile' ? 'Ver perfil en Instagram' : 'Ir a Instagram'}
                            </a>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default ObrasList;