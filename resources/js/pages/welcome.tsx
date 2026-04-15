import MainContent from '@/components/main';
import PageLayout from '@/components/PageLayout';
import 'bootstrap/dist/css/bootstrap.min.css'; // Instala bootstrap vía npm
import { useEffect, useState } from 'react';
import '../../css/main.css';

export default function Welcome() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading delay
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000); // Adjust the delay as needed

        return () => clearTimeout(timer); // Cleanup on unmount
    }, []);

    if (loading) {
        return (
            <div id="preloader" className="d-flex align-items-center justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }
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
