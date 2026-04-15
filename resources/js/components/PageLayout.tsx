import Footer from '@/components/Footer';
import Header from '@/components/Header';
import type { ReactNode } from 'react';

type Props = {
    className?: string;
    children: ReactNode;
};

export default function PageLayout({ className = 'index-page', children }: Props) {
    return (
        <div className={className}>
            <Header />
            {children}
            <Footer />
        </div>
    );
}
