import { useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, LogIn } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Link } from '@inertiajs/react';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Bienvenido de nuevo" description="Ingresa tus credenciales para acceder al panel">

            {status && (
                <div
                    className="mb-6 rounded-xl border px-4 py-3 text-sm font-medium"
                    style={{ backgroundColor: '#f0f9f0', borderColor: '#86efac', color: '#166534' }}
                >
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                    <Label
                        htmlFor="email"
                        className="text-sm font-medium"
                        style={{ color: '#2d465e' }}
                    >
                        Correo electrónico
                    </Label>
                    <input
                        id="email"
                        type="email"
                        required
                        autoFocus
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-[#8a7f72]"
                        style={{
                            borderColor: errors.email ? '#ef4444' : '#e8e2d8',
                            backgroundColor: '#fff',
                            color: '#1c1917',
                        }}
                        onFocus={(e) => { if (!errors.email) e.target.style.borderColor = '#f75815'; }}
                        onBlur={(e) => { if (!errors.email) e.target.style.borderColor = '#e8e2d8'; }}
                    />
                    <InputError message={errors.email} />
                </div>

                {/* Contraseña */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label
                            htmlFor="password"
                            className="text-sm font-medium"
                            style={{ color: '#2d465e' }}
                        >
                            Contraseña
                        </Label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs transition-colors hover:underline"
                                style={{ color: '#f75815' }}
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-xl border py-3 pl-4 pr-11 text-sm outline-none transition-all duration-200 placeholder:text-[#8a7f72]"
                            style={{
                                borderColor: errors.password ? '#ef4444' : '#e8e2d8',
                                backgroundColor: '#fff',
                                color: '#1c1917',
                            }}
                            onFocus={(e) => { if (!errors.password) e.target.style.borderColor = '#f75815'; }}
                            onBlur={(e) => { if (!errors.password) e.target.style.borderColor = '#e8e2d8'; }}
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

                {/* Recordarme */}
                <div className="flex items-center gap-2.5">
                    <Checkbox
                        id="remember"
                        checked={data.remember}
                        onCheckedChange={(checked) => setData('remember', !!checked)}
                        className="rounded"
                        style={{ accentColor: '#f75815' }}
                    />
                    <Label htmlFor="remember" className="cursor-pointer text-sm" style={{ color: '#8a7f72' }}>
                        Mantener sesión iniciada
                    </Label>
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
                        <LogIn className="size-4 transition-transform group-hover:translate-x-0.5" />
                    )}
                    {processing ? 'Ingresando...' : 'Iniciar sesión'}
                </button>
            </form>

            {/* Separador */}
            <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1" style={{ backgroundColor: '#e8e2d8' }} />
                <span className="text-xs" style={{ color: '#8a7f72' }}>o</span>
                <div className="h-px flex-1" style={{ backgroundColor: '#e8e2d8' }} />
            </div>

            <p className="text-center text-sm" style={{ color: '#8a7f72' }}>
                ¿No tienes una cuenta?{' '}
                <Link
                    href={route('register')}
                    className="font-medium transition-colors hover:underline"
                    style={{ color: '#f75815' }}
                >
                    Solicitar acceso
                </Link>
            </p>
        </AuthLayout>
    );
}
