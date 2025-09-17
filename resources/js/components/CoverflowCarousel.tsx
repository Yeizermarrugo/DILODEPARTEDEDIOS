import { useRef, useState } from 'react';
import '../../css/coverflowCarousel.css';

const IMAGES = [
    'https://thumb9.shutterstock.com/display_pic_with_logo/176492940/1018241128/stock-vector-arabica-coffee-ads-with-a-cup-of-beverage-and-beans-in-d-illustration-with-retro-ingredient-plants-1018241128.jpg',
    '//image.shutterstock.com/image-vector/cup-coffee-beans-graphic-260nw-487613659.jpg',
    '//image.shutterstock.com/image-vector/coffee-graphic-design-vector-illustration-260nw-227954110.jpg',
    '//image.shutterstock.com/image-photo/cup-coffee-beans-cinnamon-sticks-260nw-133418606.jpg',
    '//image.shutterstock.com/image-photo/fresh-coffee-260nw-97048451.jpg',
];

export default function CoverflowCarousel() {
    const [center, setCenter] = useState(1); // Start at 2nd image
    const itemsLength = IMAGES.length;
    const touchStartX = useRef<number | null>(null);

    // Responsive swipe handlers
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (dx > 50) handleLeft();
        else if (dx < -50) handleRight();
    };

    // Arrow navigation
    function handleLeft() {
        setCenter((prev) => (prev === 0 ? itemsLength - 1 : prev - 1));
    }
    function handleRight() {
        setCenter((prev) => (prev === itemsLength - 1 ? 0 : prev + 1));
    }

    // Get position classes for each image (5 visibles: 2 left, center, 2 right)
    function getImageClass(idx: number) {
        if (idx === center) return 'img_center';
        // left1: one position left of center
        if (idx === (center === 0 ? itemsLength - 1 : center - 1)) return 'img_left1';
        // left2: two positions left of center
        if (idx === (center <= 1 ? itemsLength - (2 - center) : center - 2)) return 'img_left2';
        // right1: one position right of center
        if (idx === (center === itemsLength - 1 ? 0 : center + 1)) return 'img_right1';
        // right2: two positions right of center
        if (idx === (center >= itemsLength - 2 ? (center + 2) % itemsLength : center + 2)) return 'img_right2';
        return 'img_hidden';
    }
    return (
        <>
            <div className="container_carru" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <div id="actions">
                    <button id="arrowrigth" onClick={handleRight} aria-label="Siguiente" className="arrow-btn arrow-btn-right">
                        {/* Flecha derecha SVG */}
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="16" fill="#222" opacity="0.6" />
                            <path d="M12 10l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <button id="arrowleft" onClick={handleLeft} aria-label="Anterior" className="arrow-btn arrow-btn-left">
                        {/* Flecha izquierda SVG */}
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="16" fill="#222" opacity="0.6" />
                            <path d="M20 10l-6 6 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                <div id="items">
                    {IMAGES.map((src, idx) => (
                        <img key={src} src={src} draggable={false} alt={`Slide ${idx + 1}`} className={getImageClass(idx)} />
                    ))}
                </div>
            </div>
        </>
    );
}
