import '../../../css/main.css';

interface DevocionalesProps {
    className?: string;
    onUploadClick?: () => void;
}

const Post = ({ className }: DevocionalesProps) => {
    return (
        <>
            <div className={className}>
                <div className="blog-hero" data-aos="fade-up" data-aos-delay="100" style={{ width: '100%', height: '100%', padding: '0' }}>
                    <a href="/postImage" title="Devocionales - Daily Inspirations">
                        <article className="blog-item featured" data-aos="fade-up">
                            <img src="/assets/img/blog/uploadImage.png" alt="Blog Image" className="img-fluid" />
                            <div className="blog-content">
                                <div className="post-meta"></div>
                                <span className="post-meta"></span>
                            </div>
                        </article>
                    </a>
                </div>
            </div>
        </>
    );
};

export default Post;
