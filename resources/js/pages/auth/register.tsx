import { Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, UserPlus } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const inputClass = () =>
        'w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-[#8a7f72]';

    const inputStyle = (hasError: boolean) => ({
        borderColor: hasError ? '#ef4444' : '#e8e2d8',
        backgroundColor: '#fff',
        color: '#1c1917' as const,
    });

    const onFocus = (e: React.FocusEvent<HTMLInputElement>, hasError: boolean) => {
        if (!hasError) e.target.style.borderColor = '#f75815';
    };
    const onBlur = (e: React.FocusEvent<HTMLInputElement>, hasError: boolean) => {
        if (!hasError) e.target.style.borderColor = '#e8e2d8';
    };

    return (
        <AuthLayout title="Crear una cuenta" description="Completa los datos para solicitar acceso al panel">

            <form onSubmit={submit} className="space-y-5">
                {/* Nombre */}
                <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium" style={{ color: '#2d465e' }}>
                        Nombre completo
                    </Label>
                    <input
                        id="name"
                        type="text"
                        required
                        autoFocus
                        autoComplete="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        disabled={processing}
                        placeholder="Tu nombre"
                        className={inputClass()}
                        style={inputStyle(!!errors.name)}
                        onFocus={(e) => onFocus(e, !!errors.name)}
                        onBlur={(e) => onBlur(e, !!errors.name)}
                    />
                    <InputError message={errors.name} />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#2d465e' }}>
                        Correo electrónico
                    </Label>
                    <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        disabled={processing}
                        placeholder="correo@ejemplo.com"
                        className={inputClass()}
                        style={inputStyle(!!errors.email)}
                        onFocus={(e) => onFocus(e, !!errors.email)}
                        onBlur={(e) => onBlur(e, !!errors.email)}
                    />
                    <InputError message={errors.email} />
                </div>

                {/* Contraseña */}
                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-medium" style={{ color: '#2d465e' }}>
                        Contraseña
                    </Label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Mínimo 8 caracteres"
                            className={`${inputClass()} pr-11`}
                            style={inputStyle(!!errors.password)}
                            onFocus={(e) => onFocus(e, !!errors.password)}
                            onBlur={(e) => onBlur(e, !!errors.password)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                            style={{ color: '#8a7f72' }}
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                {/* Confirmar contraseña */}
                <div className="space-y-1.5">
                    <Label htmlFor="password_confirmation" className="text-sm font-medium" style={{ color: '#2d465e' }}>
                        Confirmar contraseña
                    </Label>
                    <div className="relative">
                        <input
                            id="password_confirmation"
                            type={showConfirm ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Repite tu contraseña"
                            className={`${inputClass()} pr-11`}
                            style={inputStyle(!!errors.password_confirmation)}
                            onFocus={(e) => onFocus(e, !!errors.password_confirmation)}
                            onBlur={(e) => onBlur(e, !!errors.password_confirmation)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                            style={{ color: '#8a7f72' }}
                            tabIndex={-1}
                        >
                            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password_confirmation} />
                </div>

                {/* Nota de activación */}
                <div
                    className="flex items-start gap-3 rounded-xl border p-3.5 text-xs leading-relaxed"
                    style={{ backgroundColor: '#f5f0e8', borderColor: '#e8e2d8', color: '#8a7f72' }}
                >
                    <span className="mt-0.5 text-base leading-none" style={{ color: '#f75815' }}>ℹ</span>
                    <span>Tu cuenta será activada manualmente. Recibirás acceso una vez que sea aprobada.</span>
                </div>

                {/* Botón */}
                <button
                    type="submit"
                    disabled={processing}
                    className="group mt-2 flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                    style={{ backgroundColor: processing ? '#c4521c' : '#f75815' }}
                    onMouseEnter={(e) => { if (!processing) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e0500f'; }}
                    onMouseLeave={(e) => { if (!processing) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f75815'; }}
                >
                    {processing ? (
                        <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                        <UserPlus className="size-4 transition-transform group-hover:translate-y-[-1px]" />
                    )}
                    {processing ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
            </form>

            {/* Separador */}
            <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1" style={{ backgroundColor: '#e8e2d8' }} />
                <span className="text-xs" style={{ color: '#8a7f72' }}>o</span>
                <div className="h-px flex-1" style={{ backgroundColor: '#e8e2d8' }} />
            </div>

            <p className="text-center text-sm" style={{ color: '#8a7f72' }}>
                ¿Ya tienes cuenta?{' '}
                <Link
                    href={route('login')}
                    className="font-medium transition-colors hover:underline"
                    style={{ color: '#f75815' }}
                >
                    Iniciar sesión
                </Link>
            </p>
        </AuthLayout>
    );
}
