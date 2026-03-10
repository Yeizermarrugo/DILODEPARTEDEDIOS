import ImageUpload from '@/components/ImageUpload';
import LoaderBook from '@/components/LoaderBook';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import type { Editor as TinyMCEEditor } from 'tinymce';
import styles from '../../css/categoriaSelect.module.css';

interface DevocionalFormProps {
    mode: 'create' | 'edit';
    id?: string;
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

    const [is_devocional, setIsDevocional] = useState<0 | 1 | 2>(1);
    const [ocultar, setOcultar] = useState(false);

    const [series, setSeries] = useState<{ id: string; nombre: string }[]>([]);
    const [serie, setSerie] = useState('');
    const [ensenanzas, setEnsenanzas] = useState<{ id: string; titulo: string }[]>([]);
    const [ensenanzaId, setEnsenanzaId] = useState('');
    const [nuevaSerie, setNuevaSerie] = useState('');
    const [useNuevaSerie, setUseNuevaSerie] = useState(false);

    const [useNuevaEnsenanza, setUseNuevaEnsenanza] = useState(false);
    const [nuevaEnsenanzaTitulo, setNuevaEnsenanzaTitulo] = useState('');
    const [nuevaEnsenanzaDescripcion, setNuevaEnsenanzaDescripcion] = useState('');
    const [nuevaEnsenanzaImagenFile, setNuevaEnsenanzaImagenFile] = useState<File | null>(null);
    const [nuevaEnsenanzaImagenUrl, setNuevaEnsenanzaImagenUrl] = useState('');

    const [initialContent, setInitialContent] = useState('<p>This is the initial content of the editor.</p>');
    const [createdAt, setCreatedAt] = useState<string>('');

    const [pdf, setPdf] = useState('');
    const [instagram, setInstagram] = useState('');
    const [tiktok, setTiktok] = useState('');

    const showLoader = isLoading || isSubmitting;

    // Cargar categorías / autores / series / enseñanzas
    useEffect(() => {
        axios.get('/devocionales-searchCategories').then((res) => {
            const cats = res.data.categorias.map((c: { categoria: string }) => c.categoria);
            setCategorias(cats);

            const auts = res.data.autores.map((a: { autor: string }) => a.autor);
            setAutores(auts);

            const sers = (res.data.series || []).map((s: { id: string; nombre: string }) => s);
            setSeries(sers);

            axios.get('/api/ensenanzas').then((res2) => {
                setEnsenanzas(res2.data);
            });
        });
    }, []);

    // Cargar devocional en modo edición
    useEffect(() => {
        if (mode === 'edit' && id) {
            axios.get(`/devocionales/${id}`).then((res) => {
                const d = res.data;
                setImagenUrl(d.imagen || '');
                setCategoria(d.categoria || '');
                setAutor(d.autor || '');
                setIsDevocional((d.is_devocional ?? 1) as 0 | 1 | 2);
                setInitialContent(d.contenido || '');
                setSerie(d.serie || '');
                setOcultar(d.is_devocional === 2);
                setPdf(d.pdf || '');
                setInstagram(d.instagram || '');
                setTiktok(d.tiktok || '');
                setEnsenanzaId(d.ensenanza_id || '');
                if (d.created_at) {
                    const iso = new Date(d.created_at).toISOString();
                    const local = iso.slice(0, 16); // YYYY-MM-DDTHH:MM
                    setCreatedAt(local);
                }
            });
        }
    }, [mode, id]);

    const handleEditorInit = (_evt: unknown, editor: TinyMCEEditor) => {
        editorRef.current = editor;
        setIsLoading(false);
    };

    const handleImageChange = (file: File | null, _dataUrl: string | null) => {
        console.log('handleImageChange file', file);
        setSelectedImageFile(file);
        if (file) {
            setImagenUrl('');
        }
    };


    const handlePdfChange = async (file: File | null) => {
        if (!file) return;
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await axios.post('/upload-pdf', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-TOKEN':
                        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            setPdf(response.data.location);
        } catch (e) {
            console.error(e);
            alert('Error al subir el PDF');
        }
    };

    const handleEnsenanzaImageChange = async (file: File | null) => {
        if (!file) {
            setNuevaEnsenanzaImagenFile(null);
            setNuevaEnsenanzaImagenUrl('');
            return;
        }
        try {
            setNuevaEnsenanzaImagenFile(file);
            const formData = new FormData();
            formData.append('file', file);
            const response = await axios.post('/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-TOKEN':
                        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const url = response.data.location || response.data.url;
            setNuevaEnsenanzaImagenUrl(url);
        } catch (e) {
            console.error(e);
            alert('Error al subir la imagen de la enseñanza');
        }
    };

    const handleGuardar = async () => {
        if (isSubmitting) return;

        if (!editorRef.current) {
            alert('Editor no encontrado');
            return;
        }

        setIsSubmitting(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const standardHeaders = { 'X-CSRF-TOKEN': csrfToken };

            let urlImagenFinal = imagenUrl;

            // 1. Subir imagen principal si existe
            if (selectedImageFile) {
                const formData = new FormData();
                formData.append('file', selectedImageFile);
                const response = await axios.post('/upload-image', formData, {
                    headers: { ...standardHeaders, 'Content-Type': 'multipart/form-data' },
                });
                urlImagenFinal = response.data.location || response.data.url;
            }

            // 2. Crear nueva enseñanza si es necesario
            let ensenanzaIdFinal: string | null = ensenanzaId || null;
            if ((serie || useNuevaSerie) && useNuevaEnsenanza) {
                if (!nuevaEnsenanzaTitulo.trim()) {
                    alert('El título de la enseñanza es obligatorio');
                    setIsSubmitting(false);
                    return;
                }

                const resEnsenanza = await axios.post('/api/ensenanzas', {
                    titulo: nuevaEnsenanzaTitulo.trim(),
                    descripcion: nuevaEnsenanzaDescripcion.trim(),
                    imagen: nuevaEnsenanzaImagenUrl || null,
                }, { headers: standardHeaders });

                ensenanzaIdFinal = resEnsenanza.data.id?.toString();
            }

            // 3. Payload final
            const payload = {
                contenido: editorRef.current.getContent(),
                imagen: urlImagenFinal,
                categoria: useNuevaCategoria ? nuevaCategoria : categoria,
                autor: useNuevoAutor ? nuevoAutor : autor,
                is_devocional: is_devocional,
                serie: useNuevaSerie ? nuevaSerie : serie,
                created_at: createdAt || null,
                ensenanza_id: ensenanzaIdFinal,
                pdf: pdf || null,
                instagram: instagram || null,
                tiktok: tiktok || null,
            };

            // 4. Enviar a Laravel
            const endpoint = mode === 'create' ? '/devocionalesadd' : `/devocionales/${id}`;
            const method = mode === 'create' ? 'post' : 'put';

            await axios[method](endpoint, payload, { headers: standardHeaders });

            alert(mode === 'create' ? '¡Guardado con éxito!' : '¡Actualizado con éxito!');
            window.location.href = mode === 'create' ? '/dashboard' : '/devocionales-edit';

        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const data = error.response?.data;

                if (status === 422) {
                    // Error de validación: Falta algo en el formulario
                    const errores = data.errors ? Object.values(data.errors).flat().join('\n') : data.message;
                    alert(`⚠️ Datos incompletos o incorrectos:\n\n${errores}`);
                } else if (status === 500) {
                    // Error de servidor: Probablemente un duplicado
                    console.error('Detalle 500:', data);
                    alert('🔥 Error 500: El servidor no pudo procesar la solicitud. Posiblemente el título o el slug ya existen en la base de datos.');
                } else {
                    alert(`Error inesperado (${status}): ${data?.message || 'Consulta la consola'}`);
                }
            } else {
                alert('Error de conexión o de red.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    const categoriasCompletas = Array.from(new Set([...categorias])).sort();

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

                {/* Serie */}
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

                {/* Enseñanza */}
                {(serie || useNuevaSerie) && (
                    <div className={styles['categoria-wrapper']} style={{ marginTop: 8 }}>
                        <label className={styles['categoria-label']}>Enseñanza:</label>
                        <select
                            className={styles['categoria-select']}
                            value={useNuevaEnsenanza ? 'nueva' : ensenanzaId}
                            onChange={(e) => {
                                if (e.target.value === 'nueva') {
                                    setUseNuevaEnsenanza(true);
                                    setEnsenanzaId('');
                                } else {
                                    setUseNuevaEnsenanza(false);
                                    setEnsenanzaId(e.target.value);
                                }
                            }}
                        >
                            <option value="">Selecciona una enseñanza</option>
                            {ensenanzas.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.titulo}
                                </option>
                            ))}
                            <option value="nueva">Agregar nueva enseñanza...</option>
                        </select>

                        {useNuevaEnsenanza && (
                            <div style={{ marginTop: 8 }}>
                                <input
                                    className={styles['categoria-input']}
                                    type="text"
                                    placeholder="Título de la nueva enseñanza"
                                    value={nuevaEnsenanzaTitulo}
                                    onChange={(e) => setNuevaEnsenanzaTitulo(e.target.value)}
                                />

                                <textarea
                                    className={styles['categoria-input']}
                                    placeholder="Descripción de la enseñanza"
                                    value={nuevaEnsenanzaDescripcion}
                                    onChange={(e) => setNuevaEnsenanzaDescripcion(e.target.value)}
                                    style={{ marginTop: 8, minHeight: 80 }}
                                />

                                <div style={{ marginTop: 8 }}>
                                    <label style={{ display: 'block', marginBottom: 4 }}>
                                        Imagen de la enseñanza (opcional):
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleEnsenanzaImageChange(e.target.files?.[0] || null)}
                                    />
                                    {nuevaEnsenanzaImagenUrl && (
                                        <div style={{ marginTop: 6 }}>
                                            <img
                                                src={nuevaEnsenanzaImagenUrl}
                                                alt="Imagen enseñanza"
                                                style={{ maxWidth: 200, borderRadius: 8 }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Categoría */}
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

                {/* Autor */}
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

                {/* PDF / IG / TikTok: solo cuando hay serie */}
                {(serie || useNuevaSerie) && (
                    <>
                        <div className={styles['autor-wrapper']} style={{ marginTop: 16 }}>
                            <label className={styles['autor-label']}>PDF (opcional):</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                className={styles['autor-input']}
                                onChange={(e) => handlePdfChange(e.target.files?.[0] || null)}
                            />
                            {pdf && (
                                <div style={{ marginTop: 6 }}>
                                    <a href={pdf} target="_blank" rel="noopener noreferrer">
                                        Ver PDF subido
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className={styles['autor-wrapper']} style={{ marginTop: 8 }}>
                            <label className={styles['autor-label']}>Instagram (URL opcional):</label>
                            <input
                                type="url"
                                className={styles['autor-input']}
                                placeholder="https://www.instagram.com/..."
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                            />
                        </div>

                        <div className={styles['autor-wrapper']} style={{ marginTop: 8 }}>
                            <label className={styles['autor-label']}>TikTok (URL opcional):</label>
                            <input
                                type="url"
                                className={styles['autor-input']}
                                placeholder="https://www.tiktok.com/..."
                                value={tiktok}
                                onChange={(e) => setTiktok(e.target.value)}
                            />
                        </div>
                    </>
                )}

                {/* Flags devocional / oculto */}
                <div>
                    <label>¿Es un devocional?</label>
                    <input
                        type="checkbox"
                        checked={is_devocional === 1}
                        onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked) {
                                setIsDevocional(1);
                                setOcultar(false);
                            } else {
                                setIsDevocional(0);
                            }
                        }}
                        style={{ marginLeft: '8px' }}
                    />
                </div>

                <div style={{ marginTop: 8 }}>
                    <label>Ocultar devocional</label>
                    <input
                        type="checkbox"
                        checked={ocultar}
                        onChange={(e) => {
                            const checked = e.target.checked;
                            setOcultar(checked);
                            if (checked) {
                                setIsDevocional(2);
                            } else {
                                setIsDevocional(is_devocional);
                            }
                        }}
                        style={{ marginLeft: 8 }}
                    />
                </div>

                {/* Fecha y hora */}
                <div className={styles['autor-wrapper']} style={{ marginTop: 16 }}>
                    <label className={styles['autor-label']}>Fecha y hora:</label>
                    <input
                        type="datetime-local"
                        className={styles['autor-input']}
                        value={createdAt}
                        onChange={(e) => setCreatedAt(e.target.value)}
                    />
                </div>

                {/* Editor */}
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
