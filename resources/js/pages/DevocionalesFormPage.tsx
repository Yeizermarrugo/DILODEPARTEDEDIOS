
import { Head, usePage } from '@inertiajs/react';
import DevocionalForm from './DevocionalesForm';

interface PageProps {
    mode: 'create' | 'edit';
    id?: string;
    [key: string]: any;
}

export default function DevocionalesFormPage() {
    const { mode, id } = usePage<PageProps>().props;

    return (
        <>
            <Head title={mode === 'create' ? 'Agregar devocional' : 'Editar devocional'} />
            <DevocionalForm mode={mode} id={id} />
        </>
    );
}
