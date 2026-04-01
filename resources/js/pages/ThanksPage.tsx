import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
    AlertCircleIcon,
    BuildingIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    CreditCardIcon,
    FileTextIcon,
    HashIcon,
    Loader2,
    PrinterIcon,
    ShieldCheckIcon,
    XCircleIcon
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import '../../css/main.css';
import '../../css/podcast.css';

// Config por estado
const STATUS_CONFIG: Record<string, {
    bg: string;
    icon: ReactNode;
    label: string;
    message: string;
    showDetails: boolean;
}> = {
    'Aceptada': {
        bg: 'bg-green-600',
        icon: <CheckCircleIcon className="w-8 h-8 text-white" />,
        label: 'Transacción Aceptada',
        message: '¡Gracias por tu siembra! Tu aporte fue procesado exitosamente.',
        showDetails: true,
    },
    'Pendiente': {
        bg: 'bg-yellow-500',
        icon: <ClockIcon className="w-8 h-8 text-white" />,
        label: 'Transacción Pendiente',
        message: 'Tu transacción está siendo procesada. Recibirás una confirmación pronto.',
        showDetails: true,
    },
    'Fallida': {
        bg: 'bg-red-600',
        icon: <XCircleIcon className="w-8 h-8 text-white" />,
        label: 'Transacción Fallida',
        message: 'No pudimos procesar tu pago. Por favor intenta nuevamente.',
        showDetails: false,
    },
    'Rechazada': {
        bg: 'bg-red-700',
        icon: <AlertCircleIcon className="w-8 h-8 text-white" />,
        label: 'Transacción Rechazada',
        message: 'Tu pago fue rechazado por el banco. Verifica tus datos e intenta de nuevo.',
        showDetails: false,
    },
    'Reversada': {
        bg: 'bg-gray-600',
        icon: <AlertCircleIcon className="w-8 h-8 text-white" />,
        label: 'Transacción Reversada',
        message: 'Esta transacción fue reversada.',
        showDetails: false,
    },
};

const DEFAULT_STATUS = {
    bg: 'bg-gray-500',
    icon: <AlertCircleIcon className="w-8 h-8 text-white" />,
    label: 'Estado Desconocido',
    message: 'No pudimos determinar el estado de tu transacción.',
    showDetails: false,
};

const ThanksPage = () => {
    const [payment, setPayment] = useState<any>(null);
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
                .then(res => {
                    if (!res.ok) throw new Error("not_found");
                    return res.json();
                })
                .then(dbData => {
                    if (dbData?.raw_response) {
                        const raw = typeof dbData.raw_response === 'string'
                            ? JSON.parse(dbData.raw_response)
                            : dbData.raw_response;

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
                        throw new Error("sin_datos");
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
            minimumFractionDigits: 0
        }).format(num);
    };

    if (loading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50 px-4">
                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium font-sans text-sm sm:text-base text-center">Generando tu comprobante oficial...</p>
                <p className="text-xs text-gray-400 mt-2 text-center">Esperando confirmación del banco</p>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-50 p-4 text-center">
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 w-full max-w-sm">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 font-sans italic">¡Hola!</h2>
                    <p className="text-gray-600 mb-6 font-sans text-sm sm:text-base">
                        Tu siembra está siendo procesada. Si el valor no aparece en unos minutos, por favor verifica tu correo electrónico.
                    </p>
                    <a href="/" className="inline-block bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm sm:text-base">
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
        <div className="flex flex-col min-h-screen bg-[#F3F4F6] font-sans">
            <Header />
            <main className="flex-grow flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12">
                <div className="max-w-lg w-full">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">

                        {/* Header dinámico según estado */}
                        <div className={`${config.bg} p-4 sm:p-6 text-center text-white`}>
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-full mb-3 backdrop-blur-sm">
                                {config.icon}
                            </div>
                            <h2 className="text-base sm:text-xl font-bold uppercase tracking-wide italic">Dilo de parte de Dios</h2>
                            <p className="text-xs sm:text-sm opacity-90 tracking-tight">{config.label}</p>
                        </div>

                        <div className="p-4 sm:p-8">
                            {/* Mensaje contextual */}
                            <div className={`mb-5 rounded-xl p-3 sm:p-4 text-center ${statusKey === 'Aceptada' ? 'bg-green-50 border border-green-100' : statusKey === 'Pendiente' ? 'bg-yellow-50 border border-yellow-100' : 'bg-red-50 border border-red-100'}`}>
                                <p className={`text-xs sm:text-sm font-medium ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                                    {config.message}
                                </p>
                                {/* Razón del error si está disponible */}
                                {!isSuccess && payment.error_reason && (
                                    <p className="text-xs text-red-500 mt-1 italic">
                                        {payment.error_reason}
                                    </p>
                                )}
                            </div>

                            {/* Monto — siempre visible */}
                            <div className="text-center mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-dashed border-gray-200">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1 italic">Valor del Aporte</p>
                                <span className={`text-2xl sm:text-4xl font-black break-all ${isSuccess ? 'text-gray-900' : 'text-red-400'}`}>
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

                            <div className="mt-6 sm:mt-8 bg-blue-50 rounded-xl p-3 sm:p-4 text-center border border-blue-100">
                                <p className="text-[10px] text-blue-600 leading-relaxed font-medium uppercase tracking-tight">
                                    Este comprobante es un soporte digital de tu transacción procesada por ePayco.
                                </p>
                            </div>
                        </div>

                        {/* Botonera */}
                        <div className="px-4 sm:px-8 pb-6 sm:pb-8 flex flex-col gap-3">
                            {isSuccess && (
                                <button
                                    onClick={() => window.print()}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm border border-gray-200"
                                >
                                    <PrinterIcon size={16} /> Imprimir Soporte
                                </button>
                            )}
                            {statusKey === 'Pendiente' && (
                                <a href="/obras" className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg text-center text-sm sm:text-base">
                                    Intentar de nuevo
                                </a>
                            )} {statusKey === 'Aceptada' && (
                                <a href="/devocionales" className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg text-center text-sm sm:text-base">
                                    Continuar
                                </a>
                            )}
                            {(statusKey === 'Fallida' || statusKey === 'Rechazada') && (
                                <a href="/obras" className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg text-center text-sm sm:text-base">
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

const DetailRow = ({ icon, label, value, isBold = false }: any) => (
    <div className="flex justify-between items-start gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 text-gray-400 font-medium italic shrink-0 min-w-[90px] sm:min-w-[120px]">
            <span className="text-gray-400">{icon}</span>
            <span>{label}:</span>
        </div>
        <span className={`text-right break-all ${isBold ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
            {value}
        </span>
    </div>
);

export default ThanksPage;