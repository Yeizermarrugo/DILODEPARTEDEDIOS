import '../../../css/main.css';

interface DevocionalesProps {
    className?: string;
}

const Devocionales = ({ className }: DevocionalesProps) => {
    return (
        <>
            <div className={className}>
                <div className="blog-hero" data-aos="fade-up" data-aos-delay="100" style={{ width: '100%', height: '100%', padding: '0' }}>
                    <a href="/devocionales-edit" title="Devocionales Editar">
                        <article className="blog-item featured" data-aos="fade-up">
                            <img src="/assets/img/blog/Devocionales.jpg" alt="Blog Image" className="img-fluid" />
                            <div className="blog-content">
                                <div className="post-meta">
                                    <span className="date">
                                        {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <span className="post-meta">
                                    <h2 style={{ color: '#f75815' }}>Editar Devocionales</h2>
                                </span>
                            </div>
                        </article>
                    </a>
                </div>
            </div>
        </>
    );
};

export default Devocionales;
