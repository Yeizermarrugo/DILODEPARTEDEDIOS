import LibroList from '@/components/LibroList';
import PageHero from '@/components/PageHero';
import PageLayout from '@/components/PageLayout';
import '../../css/main.css';

export default function Estudios() {
    return (
        <PageLayout>
            <PageHero>
                <h1 style={{ textAlign: 'center' }}>Estudios Biblicos</h1>
                <br />
                <br />
                <p>Esta sección está dedicada a la <strong>enseñanza fiel de la Palabra de Dios</strong>, con el propósito de acompañar a cada persona en su crecimiento espiritual y en el conocimiento de la voluntad del Señor.</p>
                <br />
                <p>
                    A través de estudios bíblicos <strong>libro por libro y capítulo por capítulo</strong>, buscamos que la Palabra sea comprendida, creída y vivida, fortaleciendo la fe de quienes desean aprender.
                </p>
                <br />
                <p style={{ fontWeight: 'bold', fontStyle: 'italic' }}>"Comprende las palabras del que murió en la cruz"</p>
                <br />
                <p style={{ fontStyle: 'italic' }}>
                    "Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir, para corregir, para instruir en justicia, a fin de que el hombre de Dios sea perfecto, enteramente preparado para toda buena obra."{' '}
                    <span style={{ fontWeight: 'bold' }}>2 TIMOTEO 3:16-17 RVR1960</span>
                </p>
            </PageHero>

            <main className="page-title">
                <div className="title-wrapper">
                    <LibroList />
                </div>
            </main>
        </PageLayout>
    );
}
