import ImageUpload from '@/components/ImageUpload';
import LoaderBook from '@/components/LoaderBook';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import type { Editor as TinyMCEEditor } from 'tinymce';
import styles from '../../css/categoriaSelect.module.css';

interface DevocionalFormProps {
    mode: 'create' | 'edit';
    id?: string; // requerido en modo edit
}

const DevocionalForm = ({ mode, id }: DevocionalFormProps) => {
    const editorRef = useRef<TinyMCEEditor | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagenUrl, setImagenUrl] = useState('');
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

    const [series, setSeries] = useState<{ nombre: string; categorias: { categoria: string }[] }[]>([]);
    const [serie, setSerie] = useState('');
    const [nuevaSerie, setNuevaSerie] = useState('');
    const [useNuevaSerie, setUseNuevaSerie] = useState(false);


    const [initialContent, setInitialContent] = useState('<p>This is the initial content of the editor.</p>');

    const showLoader = isLoading || isSubmitting;

    // Cargar categorías/autores
    useEffect(() => {
        axios.get('/devocionales-searchCategories').then((res) => {
            const cats = res.data.categorias.map((c: { categoria: string }) => c.categoria);
            setCategorias(cats);

            const auts = res.data.autores.map((a: { autor: string }) => a.autor);
            setAutores(auts);

            const sers = (res.data.series || []).map((s: { nombre: string }) => s);
            setSeries(sers);
            console.log("sers: ", sers);
        });
    }, []);

    // Si estamos en modo editar, cargar el devocional
    useEffect(() => {
        if (mode === 'edit' && id) {
            axios.get(`/devocionales/${id}`).then((res) => {
                const d = res.data;
                setImagenUrl(d.imagen || '');
                setCategoria(d.categoria || '');
                setAutor(d.autor || '');
                setIsDevocional(!!d.is_devocional);
                setInitialContent(d.contenido || '');
                setSerie(d.serie || '');
            });
        }
    }, [mode, id]);

    const handleEditorInit = (_evt: unknown, editor: TinyMCEEditor) => {
        editorRef.current = editor;
        setIsLoading(false);
    };

    const handleImageChange = (file: File | null) => {
        setSelectedImageFile(file);
        // si estás editando y no seleccionas nueva imagen, conservas imagenUrl
        if (file) {
            setImagenUrl('');
        }
    };

    const handleGuardar = async () => {
        if (!editorRef.current) {
            alert('Editor no encontrado');
            return;
        }
        setIsSubmitting(true);
        let urlImagenFinal = imagenUrl;

        // Subir nueva imagen si se seleccionó
        if (selectedImageFile) {
            try {
                const formData = new FormData();
                formData.append('file', selectedImageFile);
                const response = await axios.post('/upload-image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRF-TOKEN':
                            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
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

        const payload = {
            contenido: editorRef.current.getContent(),
            imagen: urlImagenFinal,
            categoria: useNuevaCategoria ? nuevaCategoria : categoria,
            autor: useNuevoAutor ? nuevoAutor : autor,
            is_devocional: is_devocional,
            serie: useNuevaSerie ? nuevaSerie : serie,
        };

        try {
            if (mode === 'create') {
                await axios.post('/devocionalesadd', payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });
                alert('Devocional agregado correctamente');
                window.location.href = '/dashboard';
            } else {
                await axios.put(`/devocionales/${id}`, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });
                alert('Devocional actualizado correctamente');
                window.location.href = '/devocionales-edit';
            }
        } catch (error) {
            alert('Hubo un error al guardar el devocional');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const categoriasDeSeries = series.flatMap((s) =>
        s.categorias.map((c) => c.categoria),
    );
    const categoriasCompletas = Array.from(
        new Set([
            ...categorias,
            ...categoriasDeSeries,
        ]),
    ).sort();

    return (
        <div style={{ position: 'relative', minHeight: 400 }}>
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

            <div
                className="aggregar-devocionales"
                style={{ pointerEvents: showLoader ? 'none' : 'auto', opacity: showLoader ? 0.5 : 1 }}
            >
                <ImageUpload onImageSelected={handleImageChange} />

                {/* Preview imagen actual o nueva */}
                {selectedImageFile ? (
                    <div style={{ margin: '16px 0' }}>
                        <img
                            src={URL.createObjectURL(selectedImageFile)}
                            alt="Preview"
                            style={{ maxWidth: 300, maxHeight: 200, borderRadius: 8 }}
                        />
                    </div>
                ) : imagenUrl ? (
                    <div style={{ margin: '16px 0' }}>
                        <img
                            src={imagenUrl}
                            alt="Imagen actual"
                            style={{ maxWidth: 300, maxHeight: 200, borderRadius: 8 }}
                        />
                    </div>
                ) : null}

                <button className="btn-guardar" onClick={handleGuardar} disabled={showLoader}>
                    {mode === 'create' ? 'Guardar' : 'Actualizar'}
                </button>

                {/* Serie (carpeta que agrupa categorías de series) */}
                <div className={styles['categoria-wrapper']} style={{ marginTop: 16 }}>
                    <label className={styles['categoria-label']}>Serie (opcional):</label>
                    <select
                        className={styles['categoria-select']}
                        value={useNuevaSerie ? 'nueva' : serie}
                        onChange={(e) => {
                            if (e.target.value === 'nueva') {
                                setUseNuevaSerie(true);
                                setSerie('');
                            } else {
                                setUseNuevaSerie(false);
                                setSerie(e.target.value);
                            }
                        }}
                    >
                        <option value="">Sin serie</option>
                        {series.map((s) => (
                            <option key={s.nombre} value={s.nombre}>
                                {s.nombre}
                            </option>
                        ))}
                        <option value="nueva">Agregar nueva serie...</option>
                    </select>

                    {useNuevaSerie && (
                        <input
                            className={styles['categoria-input']}
                            type="text"
                            placeholder='Nombre de la serie (ej: "Series", "Yugo desigual", etc.)'
                            value={nuevaSerie}
                            onChange={(e) => setNuevaSerie(e.target.value)}
                        />
                    )}
                </div>


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

                        {categoriasCompletas.map((cat) => (
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
                    initialValue={initialContent}
                    init={{
                        height: '100%',
                        width: '100%',
                        menubar: true,
                        automatic_uploads: false,
                        plugins: [
                            'advlist',
                            'autolink',
                            'lists',
                            'link',
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

export default DevocionalForm;
