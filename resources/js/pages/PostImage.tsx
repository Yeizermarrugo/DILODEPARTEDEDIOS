import ImageUpload from '@/components/ImageUpload';
import LoaderBook from '@/components/LoaderBook';
import axios from 'axios';
import { useEffect, useState } from 'react';
import '../../css/postImageGallery.css'; // Importa tu nuevo CSS

const PostImage = () => {
    const [imagenUrl, setImagenUrl] = useState('');
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [postImages, setPostImages] = useState([]); // Lista de imágenes

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
                const response = await axios.post('/upload-post-image', formData, {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
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
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            setPostImages(postImages.filter((img: any) => img.id !== id));
        } catch {
            alert('Error al eliminar la imagen');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="post-image-gallery-container">
            {/* Loader overlay */}
            {showLoader && (
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
            <div className="post-image-gallery-grid">
                {postImages.map((img: any) => (
                    <div className="post-image-card" key={img.id}>
                        <img src={img.url} alt={`Imagen ${img.id}`} className="post-image-card-img" />
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
        </div>
    );
};

export default PostImage;
