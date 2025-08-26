import Footer from '@/components/Footer';
import Header from '@/components/Header';
import '../../css/main.css';
import '../../css/podcast.css';

export default function Libros() {
    return (
        <div className="index-page">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="centered-main">
                <img src="/assets/img/Estamos%20trabajando.png" alt="Estamos trabajando" className="trabajando" />
            </main>

            {/* Footer */}
            <Footer />

            {/* Scroll Top Button */}
            {/* <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
                <i className="bi bi-arrow-up-short"></i>
            </a> */}
        </div>
    );
}
