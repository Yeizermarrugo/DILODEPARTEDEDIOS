import ImageUpload from '@/components/ImageUpload';
import LoaderBook from '@/components/LoaderBook';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import { useRef, useState } from 'react';
import type { Editor as TinyMCEEditor } from 'tinymce';

const DevocionalesAgregar = () => {
    // Tipado correcto para TinyMCE Editor instance
    const editorRef = useRef<TinyMCEEditor | null>(null);
    const [imagenUrl, setImagenUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Loader visible si TinyMCE está cargando o si se está guardando/subiendo algo
    const showLoader = isLoading || isSubmitting;

    // Cuando el editor esté listo, ocultar loader
    const handleEditorInit = (_evt: unknown, editor: TinyMCEEditor) => {
        editorRef.current = editor;
        setIsLoading(false);
    };

    // Subir imagen
    const handleImageChange = async (file: File | null) => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            setIsSubmitting(true);
            console.log('formData', formData.get('file'));
            try {
                const response = await axios.post('/upload-image', formData, {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });
                console.log('Respuesta backend:', response.data);
                setImagenUrl(response.data.location || response.data.url);
            } catch (error: unknown) {
                alert('Error al subir la imagen');
                if (error && typeof error === 'object' && 'response' in error) {
                    // @ts-expect-error: error might not have response
                    console.error('Error al subir la imagen:', error.response?.data || error.message);
                } else {
                    console.error('Error al subir la imagen:', error);
                }
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setImagenUrl('');
        }
    };

    // Guardar devocional
    const handleGuardar = async () => {
        if (editorRef.current) {
            const content = editorRef.current.getContent();
            setIsSubmitting(true);
            try {
                await axios.post(
                    '/devocionalesadd',
                    { contenido: content, imagen: imagenUrl },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                    },
                );
                alert('Devocional agregado correctamente');
                window.location.href = '/dashboard';
            } catch (error: any) {
                alert('Hubo un error al guardar el devocional');
                // Muestra los errores de validación si existen
                if (error.response && error.response.data && error.response.data.errors) {
                    console.error('Errores de validación:', error.response.data.errors);
                } else {
                    console.error('Error al guardar el devocional:', error);
                }
            } finally {
                setIsSubmitting(false);
            }
        } else {
            alert('Editor no encontrado');
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: 400 }}>
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
            {/* Formulario */}
            <div className="aggregar-devocionales" style={{ pointerEvents: showLoader ? 'none' : 'auto', opacity: showLoader ? 0.5 : 1 }}>
                <ImageUpload onImageSelected={handleImageChange} />
                <button className="btn-guardar" onClick={handleGuardar} disabled={showLoader}>
                    Guardar
                </button>
                <Editor
                    apiKey="pc7pp06765v04kvyv0e65n2ja3v0c3hn5law9o9vpchu0erd"
                    onInit={handleEditorInit}
                    initialValue="<p>This is the initial content of the editor.</p>"
                    init={{
                        height: '100%',
                        width: '100%',
                        menubar: true,
                        plugins: [
                            'advlist',
                            'autolink',
                            'lists',
                            'link',
                            'image',
                            'charmap',
                            'preview',
                            'anchor',
                            'searchreplace',
                            'visualblocks',
                            'code',
                            'fullscreen',
                            'insertdatetime',
                            'media',
                            'table',
                            'help',
                            'wordcount',
                        ],
                        toolbar:
                            'undo redo | blocks | ' +
                            'bold italic forecolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'removeformat | help | image',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                        automatic_uploads: true,
                    }}
                />
            </div>
        </div>
    );
};

export default DevocionalesAgregar;
