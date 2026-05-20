import LoaderBook from '@/components/LoaderBook';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    Eye,
    EyeOff,
    FileText,
    GraduationCap,
    Image as ImageIcon,
    Instagram,
    Link2,
    Loader2,
    Save,
    Tv2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Editor as TinyMCEEditor } from 'tinymce';
import '../../css/devocionalesForm.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps extends SharedData {
    mode: 'create' | 'edit';
    id?: string;
}

type ContentType = 1 | 2 | 3;

// ─── Component ────────────────────────────────────────────────────────────────

export default function DevocionalesForm() {
    const { tinymce_key, mode, id } = usePage<PageProps>().props;
    const editorRef = useRef<TinyMCEEditor | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Image
    const [dragActive, setDragActive] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageName, setImageName] = useState('');
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagenUrl, setImagenUrl] = useState('');
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Metadata selects
    const [categorias, setCategorias] = useState<string[]>([]);
    const [autores, setAutores] = useState<string[]>([]);
    const [categoria, setCategoria] = useState('');
    const [autor, setAutor] = useState('');
    const [nuevaCategoria, setNuevaCategoria] = useState('');
    const [nuevaCategoriaDescripcion, setNuevaCategoriaDescripcion] = useState('');
    const [nuevoAutor, setNuevoAutor] = useState('');
    const [useNuevaCategoria, setUseNuevaCategoria] = useState(false);
    const [useNuevoAutor, setUseNuevoAutor] = useState(false);

    // Content type and visibility
    const [contentType, setContentType] = useState<ContentType>(1);
    const [ocultar, setOcultar] = useState(false);

    // Series / Enseñanzas
    const [series, setSeries] = useState<{ id: string; nombre: string }[]>([]);
    const [ensenanzas, setEnsenanzas] = useState<{ id: string; titulo: string }[]>([]);
    const [serie, setSerie] = useState('');
    const [ensenanzaId, setEnsenanzaId] = useState('');
    const [nuevaSerie, setNuevaSerie] = useState('');
    const [useNuevaSerie, setUseNuevaSerie] = useState(false);
    const [useNuevaEnsenanza, setUseNuevaEnsenanza] = useState(false);
    const [nuevaEnsenanzaTitulo, setNuevaEnsenanzaTitulo] = useState('');
    const [nuevaEnsenanzaDescripcion, setNuevaEnsenanzaDescripcion] = useState('');
    const [nuevaEnsenanzaImagenUrl, setNuevaEnsenanzaImagenUrl] = useState('');

    // Media links
    const [pdf, setPdf] = useState('');
    const [instagram, setInstagram] = useState('');
    const [tiktok, setTiktok] = useState('');

    // Date
    const [createdAt, setCreatedAt] = useState('');

    // Editor
    const [initialContent, setInitialContent] = useState('');

    const showLoader = isLoading || isSubmitting;
    const hasSerie = !!(serie || useNuevaSerie);

    // ── Load data ────────────────────────────────────────────────────────────

    useEffect(() => {
        axios.get('/devocionales-searchCategories').then((res) => {
            setCategorias(res.data.categorias.map((c: { categoria: string }) => c.categoria).sort());
            setAutores(res.data.autores.map((a: { autor: string }) => a.autor).sort());
            setSeries(res.data.series || []);
            axios.get('/api/series').then((res2) => setEnsenanzas(res2.data));
        });
    }, []);

    useEffect(() => {
        if (mode === 'edit' && id) {
            axios.get(`/devocionales/${id}`).then((res) => {
                const d = res.data;
                setImagenUrl(d.imagen || '');
                if (d.imagen) setImagePreview(d.imagen);
                setCategoria(d.categoria || '');
                setAutor(d.autor || '');
                setOcultar(!!d.hidden);
                setContentType((d.is_devocional ?? 1) as ContentType);
                setInitialContent(d.contenido || '');
                setSerie(d.serie || '');
                setPdf(d.pdf || '');
                setInstagram(d.instagram || '');
                setTiktok(d.tiktok || '');
                setEnsenanzaId(d.ensenanza_id || '');
                if (d.created_at) {
                    const dt = new Date(d.created_at);
                    const pad = (n: number) => String(n).padStart(2, '0');
                    setCreatedAt(
                        `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
                    );
                }
            });
        }
    }, [mode, id]);

    // ── Image handlers ───────────────────────────────────────────────────────

    const processImageFile = (file: File | null) => {
        if (!file) {
            setSelectedImageFile(null);
            setImagePreview(imagenUrl || null);
            setImageName('');
            return;
        }
        setSelectedImageFile(file);
        setImageName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) setImagePreview(e.target.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleImageDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        processImageFile(e.dataTransfer.files?.[0] ?? null);
    };

    const handleRemoveImage = () => {
        setSelectedImageFile(null);
        setImagePreview(null);
        setImageName('');
        setImagenUrl('');
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    // ── PDF / enseñanza image ────────────────────────────────────────────────

    const handlePdfChange = async (file: File | null) => {
        if (!file) return;
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await axios.post('/upload-pdf', fd, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            setPdf(res.data.location);
        } catch {
            alert('Error al subir el PDF');
        }
    };

    const handleEnsenanzaImageChange = async (file: File | null) => {
        if (!file) { setNuevaEnsenanzaImagenUrl(''); return; }
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await axios.post('/upload-image', fd, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            setNuevaEnsenanzaImagenUrl(res.data.location || res.data.url);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { errors?: { file?: string[] } } } })?.response?.data?.errors?.file?.[0];
            alert(msg ? `Error imagen: ${msg}` : 'Error al subir la imagen de la enseñanza');
        }
    };

    // ── Submit ───────────────────────────────────────────────────────────────

    const handleGuardar = async () => {
        if (isSubmitting || !editorRef.current) return;
        setIsSubmitting(true);

        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const headers = { 'X-CSRF-TOKEN': csrf };
            const categoriaFinal = useNuevaCategoria ? nuevaCategoria.trim() : categoria;

            let urlImagenFinal = imagenUrl;

            if (selectedImageFile) {
                const fd = new FormData();
                fd.append('file', selectedImageFile);
                const res = await axios.post('/upload-image', fd, {
                    headers,
                });
                urlImagenFinal = res.data.location || res.data.url;
            }

            let ensenanzaIdFinal: string | null = ensenanzaId || null;
            if (hasSerie && useNuevaEnsenanza) {
                if (!nuevaEnsenanzaTitulo.trim()) {
                    alert('El título de la enseñanza es obligatorio');
                    setIsSubmitting(false);
                    return;
                }
                const resE = await axios.post(
                    '/api/series',
                    {
                        titulo: nuevaEnsenanzaTitulo.trim(),
                        descripcion: nuevaEnsenanzaDescripcion.trim(),
                        imagen: nuevaEnsenanzaImagenUrl || null,
                    },
                    { headers },
                );
                ensenanzaIdFinal = resE.data.id?.toString();
            }

            if (useNuevaCategoria) {
                if (!categoriaFinal) {
                    alert('El nombre de la nueva categoría es obligatorio');
                    setIsSubmitting(false);
                    return;
                }

                if (!nuevaCategoriaDescripcion.trim()) {
                    alert('La descripción de la nueva categoría es obligatoria');
                    setIsSubmitting(false);
                    return;
                }
            }

            const payload = {
                contenido: editorRef.current.getContent(),
                imagen: urlImagenFinal,
                categoria: categoriaFinal,
                category_description: useNuevaCategoria ? nuevaCategoriaDescripcion.trim() : null,
                autor: useNuevoAutor ? nuevoAutor : autor,
                is_devocional: contentType,
                hidden: ocultar,
                serie: useNuevaSerie ? nuevaSerie : serie,
                created_at: createdAt || null,
                ensenanza_id: ensenanzaIdFinal,
                pdf: pdf || null,
                instagram: instagram || null,
                tiktok: tiktok || null,
            };

            const endpoint = mode === 'create' ? '/devocionalesadd' : `/devocionales/${id}`;
            const method = mode === 'create' ? 'post' : 'put';
            await axios[method](endpoint, payload, { headers });

            alert(mode === 'create' ? '¡Publicado con éxito!' : '¡Actualizado con éxito!');
            window.location.href = mode === 'create' ? '/dashboard' : '/devocionales-edit';
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const data = error.response?.data;
                if (status === 422) {
                    const errores = data.errors
                        ? Object.values(data.errors).flat().join('\n')
                        : data.message;
                    alert(`Datos incompletos:\n\n${errores}`);
                } else if (status === 500) {
                    alert('Error 500: posiblemente el título o slug ya existen en la base de datos.');
                } else {
                    alert(`Error (${status}): ${data?.message || 'Consulta la consola'}`);
                }
            } else {
                alert('Error de conexión.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Breadcrumbs ──────────────────────────────────────────────────────────

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Contenido', href: '/devocionales-edit' },
        { title: mode === 'create' ? 'Nuevo' : 'Editar', href: '#' },
    ];

    const contentTypeOptions: { value: ContentType; label: string; desc: string; icon: React.ReactNode }[] = [
        { value: 1, label: 'Devocional', desc: 'Reflexión diaria', icon: <BookOpen size={14} /> },
        { value: 3, label: 'Estudio Bíblico', desc: 'Estudio temático', icon: <GraduationCap size={14} /> },
        { value: 2, label: 'Serie / Enseñanza', desc: 'Episodio de serie', icon: <Tv2 size={14} /> },
    ];

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="df-root">

                {/* ── Loader Overlay ── */}
                {showLoader && (
                    <div className="df-loader-overlay">
                        <LoaderBook />
                        <span className="df-loader-text">
                            {isSubmitting ? 'Guardando contenido…' : 'Cargando editor…'}
                        </span>
                    </div>
                )}

                {/* ── Sticky Header ── */}
                <header className="df-header">
                    <div className="df-header__left">
                        <a href="/devocionales-edit" className="df-header__back" title="Volver al panel">
                            <ArrowLeft size={16} />
                        </a>
                        <div className="df-header__meta">
                            <span className="df-header__mode">
                                {mode === 'create' ? 'Nuevo contenido' : 'Editando'}
                            </span>
                            <h1 className="df-header__title">
                                {mode === 'create' ? 'Crear publicación' : 'Editar publicación'}
                            </h1>
                        </div>
                    </div>

                    <div className="df-header__actions">
                        {ocultar && (
                            <span className="df-badge df-badge--hidden">
                                <EyeOff size={10} /> Oculto
                            </span>
                        )}
                        {!ocultar && mode === 'edit' && (
                            <span className="df-badge df-badge--visible">
                                <Eye size={10} /> Publicado
                            </span>
                        )}
                        <button
                            className="df-btn-primary"
                            onClick={handleGuardar}
                            disabled={showLoader}
                        >
                            {isSubmitting ? (
                                <Loader2 size={15} className="df-spin" />
                            ) : (
                                <Save size={15} />
                            )}
                            {mode === 'create' ? 'Publicar' : 'Actualizar'}
                        </button>
                    </div>
                </header>

                {/* ── Body ── */}
                <div
                    className="df-body"
                    style={{ pointerEvents: showLoader ? 'none' : 'auto', opacity: showLoader ? 0.5 : 1 }}
                >
                    {/* ── MAIN: Editor ── */}
                    <div className="df-section df-section--editor">
                        <div className="df-section__header">
                            <span className="df-section__icon"><FileText size={15} /></span>
                            <span className="df-section__label">Contenido</span>
                        </div>
                        <div className="df-section__body df-section__body--editor">
                            <Editor
                                apiKey={tinymce_key ?? ''}
                                onInit={(_evt, editor) => {
                                    editorRef.current = editor;
                                    setIsLoading(false);
                                }}
                                initialValue={initialContent}
                                init={{
                                    height: 750,
                                    width: '100%',
                                    menubar: true,
                                    automatic_uploads: false,
                                    plugins: [
                                        'advlist', 'autolink', 'lists', 'link', 'charmap',
                                        'preview', 'anchor', 'searchreplace', 'visualblocks',
                                        'code', 'fullscreen', 'insertdatetime', 'media',
                                        'table', 'help', 'wordcount',
                                    ],
                                    toolbar:
                                        'undo redo | blocks | bold italic forecolor | ' +
                                        'alignleft aligncenter alignright alignjustify | ' +
                                        'bullist numlist outdent indent | removeformat | help',
                                    content_style:
                                        'body { font-family: "Instrument Sans", Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.7; color: #1c1917; padding: 16px; }',
                                    skin: 'oxide',
                                    content_css: 'default',
                                }}
                            />
                        </div>
                    </div>

                    {/* ── SIDEBAR ── */}
                    <aside className="df-sidebar">

                        {/* Imagen */}
                        <div className="df-section">
                            <div className="df-section__header">
                                <span className="df-section__icon"><ImageIcon size={15} /></span>
                                <span className="df-section__label">Imagen destacada</span>
                            </div>
                            <div className="df-section__body df-section__body--tight">
                                <div
                                    className={`df-image-zone${dragActive ? ' df-image-zone--drag' : ''}`}
                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                                    onDrop={handleImageDrop}
                                    onClick={(e) => {
                                        if ((e.target as HTMLElement) !== imageInputRef.current) {
                                            imageInputRef.current?.click();
                                        }
                                    }}
                                >
                                    <input
                                        ref={imageInputRef}
                                        className="df-image-zone__input"
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        onChange={(e) => processImageFile(e.target.files?.[0] ?? null)}
                                    />
                                    {imagePreview ? (
                                        <>
                                            <img className="df-image-zone__preview" src={imagePreview} alt="Preview" />
                                            <div className="df-image-zone__overlay">
                                                <ImageIcon size={18} />
                                                Cambiar imagen
                                            </div>
                                        </>
                                    ) : (
                                        <div className="df-image-zone__placeholder">
                                            <div className="df-image-zone__placeholder-icon">
                                                <ImageIcon size={20} />
                                            </div>
                                            <div className="df-image-zone__placeholder-text">
                                                <strong>Arrastra o haz clic</strong>
                                                PNG, JPG, WEBP · máx. 10 MB
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {imagePreview && (
                                    <div className="df-image-info">
                                        <span>{imageName || 'Imagen actual'}</span>
                                        <button className="df-image-remove" onClick={handleRemoveImage}>
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tipo de contenido */}
                        <div className="df-section">
                            <div className="df-section__header">
                                <span className="df-section__icon"><BookOpen size={15} /></span>
                                <span className="df-section__label">Tipo de contenido</span>
                            </div>
                            <div className="df-section__body df-section__body--tight">
                                <div className="df-type-grid">
                                    {contentTypeOptions.map((opt) => (
                                        <label
                                            key={opt.value}
                                            className={`df-type-option${contentType === opt.value ? ' df-type-option--active' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="contentType"
                                                value={opt.value}
                                                checked={contentType === opt.value}
                                                onChange={() => {
                                                    setContentType(opt.value);
                                                                    if (opt.value !== 2) {
                                                        setSerie('');
                                                        setEnsenanzaId('');
                                                        setUseNuevaSerie(false);
                                                        setUseNuevaEnsenanza(false);
                                                    }
                                                }}
                                            />
                                            <span className="df-type-dot" />
                                            <span className="df-type-icon">{opt.icon}</span>
                                            <span>
                                                <span className="df-type-text">{opt.label}</span>
                                                <br />
                                                <span className="df-type-desc">{opt.desc}</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Visibilidad */}
                        <div className="df-section">
                            <div className="df-section__header">
                                <span className="df-section__icon">
                                    {ocultar ? <EyeOff size={15} /> : <Eye size={15} />}
                                </span>
                                <span className="df-section__label">Visibilidad</span>
                            </div>
                            <div className="df-section__body df-section__body--tight">
                                <div className={`df-visibility${ocultar ? ' df-visibility--hidden' : ''}`}>
                                    <div className="df-visibility__text">
                                        <span className="df-visibility__label">
                                            {ocultar ? 'Contenido oculto' : 'Publicado'}
                                        </span>
                                        <span className="df-visibility__sub">
                                            {ocultar
                                                ? 'No visible para el público'
                                                : 'Visible para todos los visitantes'}
                                        </span>
                                    </div>
                                    <label className="df-toggle">
                                        <input
                                            type="checkbox"
                                            checked={ocultar}
                                            onChange={(e) => setOcultar(e.target.checked)}
                                        />
                                        <span className="df-toggle__track" />
                                        <span className="df-toggle__thumb" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Categoría */}
                        <div className="df-section">
                            <div className="df-section__header">
                                <span className="df-section__icon"><FileText size={15} /></span>
                                <span className="df-section__label">Categoría y Autor</span>
                            </div>
                            <div className="df-section__body">
                                <div className="df-field">
                                    <label className="df-label">Categoría</label>
                                    <select
                                        className="df-select"
                                        value={useNuevaCategoria ? 'nueva' : categoria}
                                        onChange={(e) => {
                                            if (e.target.value === 'nueva') {
                                                setUseNuevaCategoria(true);
                                                setCategoria('');
                                            } else {
                                                setUseNuevaCategoria(false);
                                                setNuevaCategoriaDescripcion('');
                                                setCategoria(e.target.value);
                                            }
                                        }}
                                    >
                                        <option value="">Selecciona una categoría</option>
                                        {categorias.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                        <option value="nueva">+ Nueva categoría…</option>
                                    </select>
                                    {useNuevaCategoria && (
                                        <div className="df-expand df-expand--compact">
                                            <div className="df-field">
                                                <label className="df-label">Nombre de la nueva categoría</label>
                                                <input
                                                    className="df-input"
                                                    type="text"
                                                    placeholder="Nombre de la nueva categoría"
                                                    value={nuevaCategoria}
                                                    onChange={(e) => setNuevaCategoria(e.target.value)}
                                                />
                                            </div>
                                            <div className="df-field">
                                                <label className="df-label">Descripción</label>
                                                <textarea
                                                    className="df-textarea"
                                                    placeholder="Descripción que se mostrará al filtrar esta categoría"
                                                    value={nuevaCategoriaDescripcion}
                                                    onChange={(e) => setNuevaCategoriaDescripcion(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="df-divider" />

                                <div className="df-field">
                                    <label className="df-label">Autor</label>
                                    <select
                                        className="df-select"
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
                                        <option value="">Selecciona un autor</option>
                                        {autores.map((a) => (
                                            <option key={a} value={a}>{a}</option>
                                        ))}
                                        <option value="nuevo">+ Nuevo autor…</option>
                                    </select>
                                    {useNuevoAutor && (
                                        <input
                                            className="df-input df-input-new"
                                            type="text"
                                            placeholder="Nombre del nuevo autor"
                                            value={nuevoAutor}
                                            onChange={(e) => setNuevoAutor(e.target.value)}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Serie (solo cuando contentType = 2) */}
                        {contentType === 2 && (
                            <div className="df-section">
                                <div className="df-section__header">
                                    <span className="df-section__icon"><Tv2 size={15} /></span>
                                    <span className="df-section__label">Serie</span>
                                </div>
                                <div className="df-section__body">
                                    <div className="df-field">
                                        <label className="df-label">Nombre de serie</label>
                                        <select
                                            className="df-select"
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
                                                <option key={s.nombre} value={s.nombre}>{s.nombre}</option>
                                            ))}
                                            <option value="nueva">+ Nueva serie…</option>
                                        </select>
                                        {useNuevaSerie && (
                                            <input
                                                className="df-input df-input-new"
                                                type="text"
                                                placeholder="Nombre de la serie"
                                                value={nuevaSerie}
                                                onChange={(e) => setNuevaSerie(e.target.value)}
                                            />
                                        )}
                                    </div>

                                    {hasSerie && (
                                        <>
                                            <div className="df-divider" />
                                            <div className="df-field">
                                                <label className="df-label">Enseñanza</label>
                                                <select
                                                    className="df-select"
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
                                                        <option key={e.id} value={e.id}>{e.titulo}</option>
                                                    ))}
                                                    <option value="nueva">+ Nueva enseñanza…</option>
                                                </select>
                                            </div>

                                            {useNuevaEnsenanza && (
                                                <div className="df-expand">
                                                    <span className="df-expand__label">Nueva Enseñanza</span>
                                                    <div className="df-field">
                                                        <label className="df-label">Título</label>
                                                        <input
                                                            className="df-input"
                                                            type="text"
                                                            placeholder="Título de la enseñanza"
                                                            value={nuevaEnsenanzaTitulo}
                                                            onChange={(e) => setNuevaEnsenanzaTitulo(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="df-field">
                                                        <label className="df-label">Descripción</label>
                                                        <textarea
                                                            className="df-textarea"
                                                            placeholder="Descripción breve"
                                                            value={nuevaEnsenanzaDescripcion}
                                                            onChange={(e) => setNuevaEnsenanzaDescripcion(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="df-field">
                                                        <label className="df-label">Imagen (opcional)</label>
                                                        <label className="df-file-label">
                                                            <ImageIcon size={13} />
                                                            Seleccionar imagen
                                                            <input
                                                                className="df-file-input"
                                                                type="file"
                                                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                                onChange={(e) => handleEnsenanzaImageChange(e.target.files?.[0] ?? null)}
                                                            />
                                                        </label>
                                                        {nuevaEnsenanzaImagenUrl && (
                                                            <img
                                                                src={nuevaEnsenanzaImagenUrl}
                                                                alt="Imagen enseñanza"
                                                                style={{ maxWidth: '100%', borderRadius: 8, marginTop: 6 }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Recursos multimedia (solo cuando hay serie) */}
                        {hasSerie && contentType === 2 && (
                            <div className="df-section">
                                <div className="df-section__header">
                                    <span className="df-section__icon"><Link2 size={15} /></span>
                                    <span className="df-section__label">Recursos multimedia</span>
                                </div>
                                <div className="df-section__body">
                                    <div className="df-field">
                                        <label className="df-label">PDF</label>
                                        <label className="df-file-label">
                                            <FileText size={13} />
                                            {pdf ? 'Cambiar PDF' : 'Subir PDF'}
                                            <input
                                                className="df-file-input"
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(e) => handlePdfChange(e.target.files?.[0] ?? null)}
                                            />
                                        </label>
                                        {pdf && (
                                            <a href={pdf} target="_blank" rel="noopener noreferrer" className="df-file-link">
                                                <FileText size={11} />
                                                Ver PDF subido
                                            </a>
                                        )}
                                    </div>

                                    <div className="df-divider" />

                                    <div className="df-field">
                                        <label className="df-label">Instagram</label>
                                        <input
                                            className="df-input"
                                            type="url"
                                            placeholder="https://www.instagram.com/…"
                                            value={instagram}
                                            onChange={(e) => setInstagram(e.target.value)}
                                        />
                                        {instagram && (
                                            <a href={instagram} target="_blank" rel="noopener noreferrer" className="df-file-link">
                                                <Instagram size={11} />
                                                Ver en Instagram
                                            </a>
                                        )}
                                    </div>

                                    <div className="df-divider" />

                                    <div className="df-field">
                                        <label className="df-label">TikTok</label>
                                        <input
                                            className="df-input"
                                            type="url"
                                            placeholder="https://www.tiktok.com/…"
                                            value={tiktok}
                                            onChange={(e) => setTiktok(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fecha y hora */}
                        <div className="df-section">
                            <div className="df-section__header">
                                <span className="df-section__icon"><Calendar size={15} /></span>
                                <span className="df-section__label">Fecha de publicación</span>
                            </div>
                            <div className="df-section__body">
                                <div className="df-field">
                                    <label className="df-label">Fecha y hora</label>
                                    <input
                                        className="df-input"
                                        type="datetime-local"
                                        value={createdAt}
                                        onChange={(e) => setCreatedAt(e.target.value)}
                                    />
                                    <span style={{ fontSize: 10, color: 'var(--df-muted)', fontFamily: 'var(--df-sans)' }}>
                                        Vacío = fecha actual al guardar
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom save button (mobile UX) */}
                        <button
                            className="df-btn-primary"
                            onClick={handleGuardar}
                            disabled={showLoader}
                            style={{ width: '100%', justifyContent: 'center', padding: '12px 22px' }}
                        >
                            {isSubmitting ? (
                                <Loader2 size={15} className="df-spin" />
                            ) : (
                                <Save size={15} />
                            )}
                            {mode === 'create' ? 'Publicar contenido' : 'Guardar cambios'}
                        </button>

                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
