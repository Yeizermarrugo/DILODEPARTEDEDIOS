import PageLayout from "@/components/PageLayout";
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import '../../css/contacto.css';

// ─── Types ───────────────────────────────────────────────────────────────────

type FormState = 'idle' | 'loading' | 'success' | 'error';

interface ContactForm {
    name: string;
    email: string;
    whatsapp: string;
    subject: string;
    body: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Contacto() {
    const [formState, setFormState] = useState<FormState>('idle');
    const [form, setForm] = useState<ContactForm>({ name: '', email: '', whatsapp: '', subject: '', body: '' });
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormState('loading');
        setErrorMsg('');
        try {
            await axios.post('/api/contact', form);
            setFormState('success');
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err) && err.response?.status === 429
                ? 'Demasiados intentos. Espera un momento e intenta de nuevo.'
                : 'Ocurrió un error al enviar. Intenta de nuevo.';
            setErrorMsg(msg);
            setFormState('error');
        }
    };

    return (
        <PageLayout>
            <Head title="Dilo de parte de Dios | Contacto" />
            <div className="ct-page">

                {/* ── HERO ── */}
                <section className="ct-hero">
                    <div className="ct-hero__bg" aria-hidden />
                    <div className="ct-hero__content">
                        <span className="ct-hero__label">Colombia · Contacto</span>
                        <h1 className="ct-hero__title">¿Cómo podemos <em>ayudarte?</em></h1>
                        <p className="ct-hero__subtitle">
                            Escríbenos. Estamos disponibles para acompañarte en tu crecimiento espiritual y responder tus preguntas.
                        </p>
                    </div>
                </section>

                {/* ── MAIN ── */}
                <section className="ct-main">
                    <div className="ct-main__inner">

                        {/* ── Info ── */}
                        <div className="ct-info">
                            <h2 className="ct-info__title">Información de contacto</h2>
                            <p className="ct-info__desc">
                                Respondemos lo antes posible. También puedes encontrarnos en redes sociales.
                            </p>
                            <ul className="ct-info__list">
                                <li>
                                    <a href="https://wa.me/573045851480" className="ct-info__link" target="_blank" rel="noopener noreferrer">
                                        <span className="ct-info__icon-wrap"><i className="bi bi-whatsapp" /></span>
                                        <div>
                                            <span className="ct-info__link-label">WhatsApp</span>
                                            <span className="ct-info__link-value">+57 300 585 1480</span>
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <a href="https://www.instagram.com/dilodepartededios" className="ct-info__link" target="_blank" rel="noopener noreferrer">
                                        <span className="ct-info__icon-wrap"><i className="bi bi-instagram" /></span>
                                        <div>
                                            <span className="ct-info__link-label">Instagram</span>
                                            <span className="ct-info__link-value">@dilodepartededios</span>
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <a href="mailto:dilodepartededios@gmail.com" className="ct-info__link">
                                        <span className="ct-info__icon-wrap"><i className="bi bi-envelope" /></span>
                                        <div>
                                            <span className="ct-info__link-label">Correo electrónico</span>
                                            <span className="ct-info__link-value">dilodepartededios@gmail.com</span>
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <a href="https://www.youtube.com/@casadevalientes7" className="ct-info__link" target="_blank" rel="noopener noreferrer">
                                        <span className="ct-info__icon-wrap"><i className="bi bi-youtube" /></span>
                                        <div>
                                            <span className="ct-info__link-label">YouTube</span>
                                            <span className="ct-info__link-value">@casadevalientes7</span>
                                        </div>
                                    </a>
                                </li>
                            </ul>

                            <blockquote className="ct-info__verse">
                                <p>"Pidan, y se les dará; busquen, y encontrarán; llamen, y se les abrirá."</p>
                                <cite>— Mateo 7:7</cite>
                            </blockquote>
                        </div>

                        {/* ── Form ── */}
                        <div className="ct-form-wrap">
                            {formState === 'success' ? (
                                <div className="ct-success" role="status">
                                    <div className="ct-success__icon" aria-hidden>
                                        <i className="bi bi-check-circle-fill" />
                                    </div>
                                    <h3>¡Mensaje enviado!</h3>
                                    <p>Gracias por escribirnos, <strong>{form.name}</strong>. Hemos recibido tu mensaje y te responderemos pronto.</p>
                                    <button className="ct-success__reset" onClick={() => { setFormState('idle'); setForm({ name: '', email: '', whatsapp: '', subject: '', body: '' }); }}>
                                        Enviar otro mensaje
                                    </button>
                                </div>
                            ) : (
                                <form className="ct-form" onSubmit={handleSubmit} noValidate>
                                    <h2 className="ct-form__title">Envíanos un mensaje</h2>
                                    <div className="ct-form-row ct-form-row--2">
                                        <div className="ct-form-group">
                                            <label htmlFor="cf-name">Nombre <span className="ct-req" aria-hidden>*</span></label>
                                            <input id="cf-name" name="name" type="text" required maxLength={100} placeholder="Tu nombre" value={form.name} onChange={handleChange} />
                                        </div>
                                        <div className="ct-form-group">
                                            <label htmlFor="cf-email">Correo electrónico <span className="ct-req" aria-hidden>*</span></label>
                                            <input id="cf-email" name="email" type="email" required maxLength={150} placeholder="tu@correo.com" value={form.email} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="ct-form-row ct-form-row--2">
                                        <div className="ct-form-group">
                                            <label htmlFor="cf-whatsapp">WhatsApp <span className="ct-optional">(opcional)</span></label>
                                            <input id="cf-whatsapp" name="whatsapp" type="tel" maxLength={20} placeholder="+57 3XX XXX XXXX" value={form.whatsapp} onChange={handleChange} />
                                        </div>
                                        <div className="ct-form-group">
                                            <label htmlFor="cf-subject">Asunto <span className="ct-req" aria-hidden>*</span></label>
                                            <input id="cf-subject" name="subject" type="text" required maxLength={150} placeholder="¿De qué trata tu mensaje?" value={form.subject} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="ct-form-group">
                                        <label htmlFor="cf-body">
                                            Mensaje <span className="ct-req" aria-hidden>*</span>
                                            <span className="ct-counter">{form.body.length}/2000</span>
                                        </label>
                                        <textarea id="cf-body" name="body" required maxLength={2000} rows={6} placeholder="Escribe tu mensaje aquí..." value={form.body} onChange={handleChange} />
                                    </div>
                                    {formState === 'error' && (
                                        <p className="ct-form-error" role="alert">
                                            <i className="bi bi-exclamation-circle" /> {errorMsg}
                                        </p>
                                    )}
                                    <button type="submit" className="ct-submit" disabled={formState === 'loading'}>
                                        {formState === 'loading' ? (
                                            <><span className="ct-spinner" aria-hidden /> Enviando...</>
                                        ) : (
                                            <><i className="bi bi-send-fill" aria-hidden /> Enviar mensaje</>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                    </div>
                </section>

            </div>
        </PageLayout>
    );
}
