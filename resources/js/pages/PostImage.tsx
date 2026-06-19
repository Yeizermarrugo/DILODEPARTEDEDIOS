import ImageUpload from '@/components/ImageUpload';
import LoaderBook from '@/components/LoaderBook';
import axios from 'axios';
import { useEffect, useState } from 'react';
import '../../css/postImageGallery.css'; // Importa tu nuevo CSS

const csrfToken = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

const PostImage = () => {
    const [imagenUrl, setImagenUrl] = useState('');
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    interface PostImage {
        id: number;
        url: string;
    }

    const [postImages, setPostImages] = useState<PostImage[]>([]); // Lista de imágenes

    const showLoader = isLoading || isSubmitting;

    useEffect(() => {
        fetchImages();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timeout);
    }, []);

    const fetchImages = () => {
        fetch('/post-images')
            .then((response) => response.json())
            .then((data) => {
                setPostImages(data);
            })
            .catch((error) => {
                console.error('Error fetching images:', error);
            });
    };

    const handleImageChange = (file: File | null) => {
        setSelectedImageFile(file);
        setImagenUrl('');
    };

    const handleGuardar = async () => {
        setIsSubmitting(true);
        let urlImagenFinal = imagenUrl;

        if (selectedImageFile) {
            try {
                const formData = new FormData();
                formData.append('file', selectedImageFile);
                formData.append('_token', csrfToken());
                const response = await axios.post('/upload-post-image', formData, {
                    withCredentials: true,
                    headers: {
                        'X-CSRF-TOKEN': csrfToken(),
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                urlImagenFinal = response.data.location || response.data.url;
                setImagenUrl(urlImagenFinal);
                setSelectedImageFile(null);
                fetchImages();
                alert('Post agregado correctamente');
                window.location.href = '/postImage';
            } catch {
                alert('Error al subir la imagen');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // Eliminar imagen
    const handleEliminar = async (id: number) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta imagen?')) return;
        setIsSubmitting(true);
        try {
            await axios.delete(`/post-image/${id}`, {
                withCredentials: true,
                headers: {
                    'X-CSRF-TOKEN': csrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            setPostImages(postImages.filter((img) => img.id !== id));
        } catch {
            alert('Error al eliminar la imagen');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="post-image-gallery-container">
            {/* Loader overlay */}
            {isSubmitting && (
                <div className="post-image-gallery-loader">
                    <LoaderBook />
                </div>
            )}
            <div className="post-image-upload-bar">
                <ImageUpload onImageSelected={handleImageChange} />
                <button className="post-image-btn-guardar" onClick={handleGuardar} disabled={showLoader || !selectedImageFile}>
                    Guardar
                </button>
            </div>
            {/* Cards pequeñas y responsive */}
            {isLoading && !isSubmitting && (
                <div className="post-image-gallery-grid" aria-hidden="true">
                    {Array.from({ length: 10 }).map((_, index) => (
                        <div className="post-image-card post-image-card--skeleton" key={index}>
                            <div className="post-image-skeleton__media" />
                        </div>
                    ))}
                </div>
            )}
            {!isLoading && (
                <div className="post-image-gallery-grid">
                    {postImages.map((img) => (
                        <div className="post-image-card" key={img.id}>
                            <img src={img.url} alt={`Imagen ${img.id}`} className="post-image-card-img" loading="lazy" />
                            <button
                                className="post-image-card-delete"
                                onClick={() => handleEliminar(img.id)}
                                title="Eliminar imagen"
                                disabled={isSubmitting}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostImage;
