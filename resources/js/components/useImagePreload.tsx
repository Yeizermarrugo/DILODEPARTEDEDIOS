import { useEffect, useState } from 'react';

export function useImagePreload(src: string) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!src) return;
        const img = new window.Image();
        img.src = src;
        img.onload = () => setLoaded(true);
    }, [src]);

    return loaded;
}
