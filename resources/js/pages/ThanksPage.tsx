import Footer from '@/components/Footer';
import Header from '@/components/Header';
import {
    AlertCircleIcon,
    BuildingIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    CreditCardIcon,
    FileTextIcon,
    HashIcon,
    PrinterIcon,
    ShieldCheckIcon,
    XCircleIcon,
} from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import '../../css/main.css';
import '../../css/podcast.css';

// Config por estado
const STATUS_CONFIG: Record<
    string,
    {
        bg: string;
        icon: ReactNode;
        label: string;
        message: string;
        showDetails: boolean;
    }
> = {
    Aceptada: {
        bg: 'bg-green-600',
        icon: <CheckCircleIcon className="h-8 w-8 text-white" />,
        label: 'Transacción Aceptada',
        message: '¡Gracias por tu siembra! Tu aporte fue procesado exitosamente.',
        showDetails: true,
    },
    Pendiente: {
        bg: 'bg-yellow-500',
        icon: <ClockIcon className="h-8 w-8 text-white" />,
        label: 'Transacción Pendiente',
        message: 'Tu transacción está siendo procesada. Recibirás una confirmación pronto.',
        showDetails: true,
    },
    Fallida: {
        bg: 'bg-red-600',
        icon: <XCircleIcon className="h-8 w-8 text-white" />,
        label: 'Transacción Fallida',
        message: 'No pudimos procesar tu pago. Por favor intenta nuevamente.',
        showDetails: false,
    },
    Rechazada: {
        bg: 'bg-red-700',
        icon: <AlertCircleIcon className="h-8 w-8 text-white" />,
        label: 'Transacción Rechazada',
        message: 'Tu pago fue rechazado por el banco. Verifica tus datos e intenta de nuevo.',
        showDetails: false,
    },
    Reversada: {
        bg: 'bg-gray-600',
        icon: <AlertCircleIcon className="h-8 w-8 text-white" />,
        label: 'Transacción Reversada',
        message: 'Esta transacción fue reversada.',
        showDetails: false,
    },
};

const DEFAULT_STATUS = {
    bg: 'bg-gray-500',
    icon: <AlertCircleIcon className="h-8 w-8 text-white" />,
    label: 'Estado Desconocido',
    message: 'No pudimos determinar el estado de tu transacción.',
    showDetails: false,
};

interface PaymentData {
    ref_epayco: string;
    ref_comercio: string;
    cus: string;
    amount: string;
    bank: string;
    status: string;
    date: string;
    description: string;
    method: string;
    currency: string;
    error_reason?: string;
    error_code?: string;
}

const ThanksPage = () => {
    const [payment, setPayment] = useState<PaymentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const queryString = params.toString();

        if (!queryString) {
            setLoading(false);
            return;
        }

        const fetchDonacion = (intentos = 0) => {
            fetch(`/donacion-by-params?${queryString}&t=${Date.now()}`)
                .then((res) => {
                    if (!res.ok) throw new Error('not_found');
                    return res.json();
                })
                .then((dbData) => {
                    if (dbData?.raw_response) {
                        const raw = typeof dbData.raw_response === 'string' ? JSON.parse(dbData.raw_response) : dbData.raw_response;

                        setPayment({
                            ref_epayco: raw.x_ref_payco,
                            ref_comercio: raw.x_id_invoice,
                            cus: raw.x_approval_code,
                            amount: raw.x_amount,
                            bank: raw.x_bank_name === 'N/A' ? 'Simulador PSE' : raw.x_bank_name,
                            status: raw.x_transaction_state,
                            date: raw.x_transaction_date,
                            description: raw.x_description,
                            method: raw.x_type_payment || raw.x_payment_method || 'PSE',
                            currency: raw.x_currency_code || 'COP',
                            error_reason: raw.x_response_reason_text,
                            error_code: raw.x_errorcode,
                        });
                        setLoading(false);
                    } else {
                        throw new Error('sin_datos');
                    }
                })
                .catch(() => {
                    if (intentos < 12) {
                        setTimeout(() => fetchDonacion(intentos + 1), 3000);
                    } else {
                        setLoading(false);
                    }
                });
        };

        fetchDonacion();
    }, []);

    const formatCurrency = (value: string | number) => {
        const num = parseFloat(String(value));
        if (isNaN(num)) return '$ 0';
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(num);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10" aria-busy="true">
                <div className="w-full max-w-lg animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                    <div className="h-28 bg-gray-200" />
                    <div className="space-y-5 p-6">
                        <div className="mx-auto h-14 w-14 rounded-full bg-gray-200" />
                        <div className="mx-auto h-5 w-56 rounded-full bg-gray-200" />
                        <div className="mx-auto h-3 w-72 max-w-full rounded-full bg-gray-100" />
                        <div className="grid grid-cols-2 gap-3 pt-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="rounded-xl border border-gray-100 p-4">
                                    <div className="mb-3 h-3 w-20 rounded-full bg-gray-100" />
                                    <div className="h-4 w-28 rounded-full bg-gray-200" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="w-full max-w-sm rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="mb-2 font-sans text-xl font-bold text-gray-800 italic sm:text-2xl">¡Hola!</h2>
                    <p className="mb-6 font-sans text-sm text-gray-600 sm:text-base">
                        Tu siembra está siendo procesada. Si el valor no aparece en unos minutos, por favor verifica tu correo electrónico.
                    </p>
                    <a
                        href="/"
                        className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 sm:px-8 sm:text-base"
                    >
                        Volver al inicio
                    </a>
                </div>
            </div>
        );
    }

    const statusKey = payment.status as string;
    const config = STATUS_CONFIG[statusKey] ?? DEFAULT_STATUS;
    const isSuccess = statusKey === 'Aceptada';

    return (
        <div className="flex min-h-screen flex-col bg-[#F3F4F6] font-sans">
            <Header />
            <main className="flex flex-grow items-center justify-center px-3 py-6 sm:px-4 sm:py-12">
                <div className="w-full max-w-lg">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                        {/* Header dinámico según estado */}
                        <div className={`${config.bg} p-4 text-center text-white sm:p-6`}>
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:h-14 sm:w-14">
                                {config.icon}
                            </div>
                            <h2 className="text-base font-bold tracking-wide uppercase italic sm:text-xl">Dilo de parte de Dios</h2>
                            <p className="text-xs tracking-tight opacity-90 sm:text-sm">{config.label}</p>
                        </div>

                        <div className="p-4 sm:p-8">
                            {/* Mensaje contextual */}
                            <div
                                className={`mb-5 rounded-xl p-3 text-center sm:p-4 ${statusKey === 'Aceptada' ? 'border border-green-100 bg-green-50' : statusKey === 'Pendiente' ? 'border border-yellow-100 bg-yellow-50' : 'border border-red-100 bg-red-50'}`}
                            >
                                <p className={`text-xs font-medium sm:text-sm ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>{config.message}</p>
                                {/* Razón del error si está disponible */}
                                {!isSuccess && payment.error_reason && <p className="mt-1 text-xs text-red-500 italic">{payment.error_reason}</p>}
                            </div>

                            {/* Monto — siempre visible */}
                            <div className="mb-6 border-b border-dashed border-gray-200 pb-5 text-center sm:mb-8 sm:pb-6">
                                <p className="mb-1 text-xs font-bold tracking-widest text-gray-400 uppercase italic">Valor del Aporte</p>
                                <span className={`text-2xl font-black break-all sm:text-4xl ${isSuccess ? 'text-gray-900' : 'text-red-400'}`}>
                                    {formatCurrency(payment.amount)} {payment.currency}
                                </span>
                            </div>

                            {/* Detalles — solo si el pago fue exitoso o pendiente */}
                            {config.showDetails && (
                                <div className="space-y-3 sm:space-y-4">
                                    <DetailRow icon={<FileTextIcon size={15} />} label="Concepto" value={payment.description} />
                                    <DetailRow icon={<HashIcon size={15} />} label="Ref. ePayco" value={payment.ref_epayco} />
                                    <DetailRow icon={<HashIcon size={15} />} label="Ref. Comercio" value={payment.ref_comercio} isBold />
                                    <DetailRow icon={<CalendarIcon size={15} />} label="Fecha" value={payment.date} />
                                    <DetailRow icon={<CreditCardIcon size={15} />} label="Medio" value={payment.method} />
                                    <DetailRow icon={<BuildingIcon size={15} />} label="Banco" value={payment.bank} />
                                    <DetailRow icon={<ShieldCheckIcon size={15} />} label="CUS / Autorización" value={payment.cus} isBold />
                                </div>
                            )}

                            {/* Si falló: solo mostrar ref para soporte */}
                            {!config.showDetails && (
                                <div className="space-y-3 sm:space-y-4">
                                    <DetailRow icon={<HashIcon size={15} />} label="Ref. Comercio" value={payment.ref_comercio} isBold />
                                    <DetailRow icon={<CalendarIcon size={15} />} label="Fecha" value={payment.date} />
                                </div>
                            )}

                            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-3 text-center sm:mt-8 sm:p-4">
                                <p className="text-[10px] leading-relaxed font-medium tracking-tight text-blue-600 uppercase">
                                    Este comprobante es un soporte digital de tu transacción procesada por ePayco.
                                </p>
                            </div>
                        </div>

                        {/* Botonera */}
                        <div className="flex flex-col gap-3 px-4 pb-6 sm:px-8 sm:pb-8">
                            {isSuccess && (
                                <button
                                    onClick={() => window.print()}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-100"
                                >
                                    <PrinterIcon size={16} /> Imprimir Soporte
                                </button>
                            )}
                            {statusKey === 'Pendiente' && (
                                <a
                                    href="/obras"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-600 py-3 text-center text-sm font-bold text-white shadow-lg transition-all hover:bg-red-700 sm:text-base"
                                >
                                    Intentar de nuevo
                                </a>
                            )}{' '}
                            {statusKey === 'Aceptada' && (
                                <a
                                    href="/devocionales"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-center text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-700 sm:text-base"
                                >
                                    Continuar
                                </a>
                            )}
                            {(statusKey === 'Fallida' || statusKey === 'Rechazada') && (
                                <a
                                    href="/obras"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-center text-sm font-bold text-white shadow-lg transition-all hover:bg-red-700 sm:text-base"
                                >
                                    Intentar de nuevo
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

interface DetailRowProps {
    icon: ReactNode;
    label: string;
    value: string | undefined;
    isBold?: boolean;
}

const DetailRow = ({ icon, label, value, isBold = false }: DetailRowProps) => (
    <div className="flex items-start justify-between gap-2 text-xs sm:text-sm">
        <div className="flex min-w-[90px] shrink-0 items-center gap-1.5 font-medium text-gray-400 italic sm:min-w-[120px]">
            <span className="text-gray-400">{icon}</span>
            <span>{label}:</span>
        </div>
        <span className={`text-right break-all ${isBold ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{value}</span>
    </div>
);

export default ThanksPage;
