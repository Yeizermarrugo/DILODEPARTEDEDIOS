import ImageUpload from '@/components/ImageUpload';
import LoaderBook from '@/components/LoaderBook';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import type { Editor as TinyMCEEditor } from 'tinymce';
import styles from '../../css/categoriaSelect.module.css';

const DevocionalesAgregar = () => {
    // Tipado correcto para TinyMCE Editor instance
    const editorRef = useRef<TinyMCEEditor | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null); // Solo guardar el archivo, no la URL
    const [imagenUrl, setImagenUrl] = useState(''); // La URL solo se seteará tras guardar
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categorias, setCategorias] = useState<string[]>([]);
    const [autores, setAutores] = useState<string[]>([]);

    const [categoria, setCategoria] = useState('');
    const [autor, setAutor] = useState('');
    const [nuevaCategoria, setNuevaCategoria] = useState('');
    const [nuevoAutor, setNuevoAutor] = useState('');
    const [useNuevaCategoria, setUseNuevaCategoria] = useState(false);
    const [useNuevoAutor, setUseNuevoAutor] = useState(false);
    const [is_devocional, setIsDevocional] = useState(true);

    // Loader visible si TinyMCE está cargando o si se está guardando/subiendo algo
    const showLoader = isLoading || isSubmitting;

    // Cargar categorías existentes al montar
    useEffect(() => {
        axios.get('/devocionales-search').then((res) => {
            const cats = res.data.categorias.map((c: { categoria: string }) => c.categoria);
            setCategorias(cats);

            const auts = res.data.autores.map((a: { autor: string }) => a.autor);
            setAutores(auts);
        });
    }, []);

    // Cuando el editor esté listo, ocultar loader
    const handleEditorInit = (_evt: unknown, editor: TinyMCEEditor) => {
        editorRef.current = editor;
        setIsLoading(false);
    };

    // Solo guardar el archivo seleccionado, NO subir aún
    const handleImageChange = (file: File | null) => {
        setSelectedImageFile(file);
        setImagenUrl(''); // Limpiar la URL previa
    };

    // Guardar devocional (sube imagen solo al guardar)
    const handleGuardar = async () => {
        if (!editorRef.current) {
            alert('Editor no encontrado');
            return;
        }
        setIsSubmitting(true);
        let urlImagenFinal = imagenUrl;

        // SUBIR imagen si existe
        if (selectedImageFile) {
            try {
                const formData = new FormData();
                formData.append('file', selectedImageFile);
                const response = await axios.post('/upload-image', formData, {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });
                urlImagenFinal = response.data.location || response.data.url;
                setImagenUrl(urlImagenFinal);
            } catch {
                alert('Error al subir la imagen');
                setIsSubmitting(false);
                return;
            }
        }

        // GUARDAR devocional
        try {
            await axios.post(
                '/devocionalesadd',
                {
                    contenido: editorRef.current.getContent(),
                    imagen: urlImagenFinal,
                    categoria: useNuevaCategoria ? nuevaCategoria : categoria,
                    autor: useNuevoAutor ? nuevoAutor : autor,
                    is_devocional: is_devocional,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                },
            );
            alert('Devocional agregado correctamente');
            window.location.href = '/dashboard';
        } catch (error: unknown) {
            alert('Hubo un error al guardar el devocional');
            if (
                typeof error === 'object' &&
                error !== null &&
                'response' in error &&
                (error as { response?: { data?: { errors?: unknown } } }).response &&
                (error as { response: { data?: { errors?: unknown } } }).response.data &&
                (error as { response: { data: { errors?: unknown } } }).response.data.errors
            ) {
                console.error('Errores de validación:', (error as { response: { data: { errors: unknown } } }).response.data.errors);
            } else {
                console.error('Error al guardar el devocional:', error);
            }
        } finally {
            setIsSubmitting(false);
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
                {/* Preview de la imagen seleccionada */}
                {selectedImageFile && (
                    <div style={{ margin: '16px 0' }}>
                        <img src={URL.createObjectURL(selectedImageFile)} alt="Preview" style={{ maxWidth: 300, maxHeight: 200, borderRadius: 8 }} />
                    </div>
                )}
                <button className="btn-guardar" onClick={handleGuardar} disabled={showLoader}>
                    Guardar
                </button>
                <div className={styles['categoria-wrapper']}>
                    <label className={styles['categoria-label']}>Categoría:</label>
                    <select
                        className={styles['categoria-select']}
                        value={useNuevaCategoria ? 'nueva' : categoria}
                        onChange={(e) => {
                            if (e.target.value === 'nueva') {
                                setUseNuevaCategoria(true);
                                setCategoria('');
                            } else {
                                setUseNuevaCategoria(false);
                                setCategoria(e.target.value);
                            }
                        }}
                    >
                        <option value="">Selecciona una categoría</option>
                        {categorias.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                        <option value="nueva">Agregar nueva categoría...</option>
                    </select>
                    {useNuevaCategoria && (
                        <input
                            className={styles['categoria-input']}
                            type="text"
                            placeholder="Nueva categoría"
                            value={nuevaCategoria}
                            onChange={(e) => setNuevaCategoria(e.target.value)}
                        />
                    )}
                </div>
                <div className={styles['autor-wrapper']}>
                    <label className={styles['autor-label']}>Autor:</label>
                    <select
                        className={styles['autor-select']}
                        value={useNuevoAutor ? 'nuevo' : autor}
                        onChange={(e) => {
                            if (e.target.value === 'nuevo') {
                                setUseNuevoAutor(true);
                                setAutor('');
                            } else {
                                setUseNuevoAutor(false);
                                setAutor(e.target.value);
                            }
                        }}
                    >
                        <option value="">Selecciona un Autor</option>
                        {autores.map((aut) => (
                            <option key={aut} value={aut}>
                                {aut}
                            </option>
                        ))}
                        <option value="nuevo">Agregar nuevo autor...</option>
                    </select>
                    {useNuevoAutor && (
                        <input
                            className={styles['autor-input']}
                            type="text"
                            placeholder="Nuevo autor"
                            value={nuevoAutor}
                            onChange={(e) => setNuevoAutor(e.target.value)}
                        />
                    )}
                </div>
                <div>
                    <label>¿Es un devocional?</label>
                    <input
                        type="checkbox"
                        checked={is_devocional}
                        onChange={(e) => setIsDevocional(e.target.checked)}
                        style={{ marginLeft: '8px' }}
                    />
                </div>
                <Editor
                    apiKey="pc7pp06765v04kvyv0e65n2ja3v0c3hn5law9o9vpchu0erd"
                    onInit={handleEditorInit}
                    initialValue="<p>This is the initial content of the editor.</p>"
                    init={{
                        height: '100%',
                        width: '100%',
                        menubar: true,
                        automatic_uploads: false, // <--- IMPORTANTE: Desactiva uploads automáticos
                        plugins: [
                            'advlist',
                            'autolink',
                            'lists',
                            'link',
                            // 'image', // <--- Puedes quitar 'image' del editor si NO quieres el botón de imagen
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
                            'removeformat | help',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                    }}
                />
            </div>
        </div>
    );
};

export default DevocionalesAgregar;
