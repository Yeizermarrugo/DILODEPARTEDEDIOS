import { useEffect, useRef, useState } from 'react';
import '../../css/coverflowCarousel.css';

interface PostImage {
    id: number;
    url: string;
    created_at: string;
}
export default function CoverflowCarousel() {
    const [center, setCenter] = useState(0); // <-- inicia en 0
    const touchStartX = useRef<number | null>(null);
    const [visibleImages, setVisibleImages] = useState<PostImage[]>([]);
    const intervalTime = 5000;

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = () => {
        fetch('/post-images')
            .then((response) => response.json())
            .then((data: PostImage[]) => {
                const sorted = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                const lastFive = sorted.slice(0, 5);
                setVisibleImages(lastFive);
                setCenter(0); // <-- inicia en el primer elemento (el más reciente)
            })
            .catch((error) => {
                console.error('Error fetching images:', error);
            });
    };

    useEffect(() => {
        if (!visibleImages.length) return;
        const interval = setInterval(() => {
            handleRight();
        }, intervalTime);
        return () => clearInterval(interval);
    }, [visibleImages, center]);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (dx > 50) handleLeft();
        else if (dx < -50) handleRight();
    };

    const itemsLength = visibleImages.length;
    function handleLeft() {
        setCenter((prev) => (prev === 0 ? itemsLength - 1 : prev - 1));
    }
    function handleRight() {
        setCenter((prev) => (prev === itemsLength - 1 ? 0 : prev + 1));
    }

    function getImageClass(idx: number) {
        if (idx === center) return 'img_center';
        if (idx === (center === 0 ? itemsLength - 1 : center - 1)) return 'img_left1';
        if (idx === (center <= 1 ? itemsLength - (2 - center) : center - 2)) return 'img_left2';
        if (idx === (center === itemsLength - 1 ? 0 : center + 1)) return 'img_right1';
        if (idx === (center >= itemsLength - 2 ? (center + 2) % itemsLength : center + 2)) return 'img_right2';
        return 'img_hidden';
    }

    return (
        <div className="container_carru" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <div id="actions">
                <button id="arrowrigth" onClick={handleRight} aria-label="Siguiente" className="arrow-btn arrow-btn-right">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#222" opacity="0.6" />
                        <path d="M12 10l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <button id="arrowleft" onClick={handleLeft} aria-label="Anterior" className="arrow-btn arrow-btn-left">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#222" opacity="0.6" />
                        <path d="M20 10l-6 6 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
            <div id="items">
                {visibleImages.map((img, idx) => (
                    <img key={img.id} src={img.url} draggable={false} alt={`Slide ${idx + 1}`} className={getImageClass(idx)} />
                ))}
            </div>
        </div>
    );
}
