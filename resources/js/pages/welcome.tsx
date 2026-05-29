import MainContent from '@/components/main';
import PageLayout from '@/components/PageLayout';
import 'bootstrap/dist/css/bootstrap.min.css'; // Instala bootstrap vía npm
import '../../css/main.css';

export default function Welcome() {
    return (
        <div className="index-page">
            {/* Header */}

            <PageLayout>

                {/* Main Content */}
                <main className="main">
                    <MainContent />
                </main>

                {/* Footer */}

                {/* Scroll Top Button */}
                {/* <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
                <i className="bi bi-arrow-up-short"></i>
            </a> */}
            </PageLayout>
        </div>
    );
}
