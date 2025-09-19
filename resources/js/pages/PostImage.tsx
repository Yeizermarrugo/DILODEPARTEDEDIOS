import ImageUpload from '@/components/ImageUpload';
import LoaderBook from '@/components/LoaderBook';
import axios from 'axios';
import { useEffect, useState } from 'react';

const PostImage = () => {
    const [imagenUrl, setImagenUrl] = useState('');
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null); // Solo guardar el archivo, no la URL
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const showLoader = isLoading || isSubmitting;

    useEffect(() => {
        // Simula carga inicial
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);

    // Subir imagen
    const handleImageChange = (file: File | null) => {
        setSelectedImageFile(file);
        setImagenUrl(''); // Limpiar la URL previa
    };
    // Guardar imagen
    const handleGuardar = async () => {
        setIsSubmitting(true);
        let urlImagenFinal = imagenUrl;

        // SUBIR imagen si existe
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
                alert('Post agregado correctamente');
                window.location.href = '/postImage';
            } catch {
                alert('Error al subir la imagen');
                setIsSubmitting(false);
                return;
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div>
            {/* Loader overlay */}
            {showLoader && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: 'rgba(255,255,255,0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <LoaderBook />
                </div>
            )}
            <ImageUpload onImageSelected={handleImageChange} />
            <button className="btn-guardar" onClick={handleGuardar} disabled={showLoader}>
                Guardar
            </button>
        </div>
    );
};

export default PostImage;
