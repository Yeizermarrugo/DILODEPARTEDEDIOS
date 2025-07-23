import '../../../css/main.css';

interface DevocionalesProps {
    className?: string;
}

const Devocionales = ({ className }: DevocionalesProps) => {
    return (
        <>
            <div className={className}>
                <div className="blog-hero" data-aos="fade-up" data-aos-delay="100" style={{ width: '100%', height: '100%', padding: '0' }}>
                    <article className="blog-item featured" data-aos="fade-up">
                        <img src="/assets/img/blog/Devocionales.jpg" alt="Blog Image" className="img-fluid" />
                        <div className="blog-content">
                            <div className="post-meta">
                                <span className="date">
                                    {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                            <span className="post-meta">
                                <a href="/devocionalesAgregar" title="Devocionales - Daily Inspirations">
                                    Agregar Devocionales
                                </a>
                            </span>
                        </div>
                    </article>
                </div>
            </div>
        </>
    );
};

export default Devocionales;
