/**
 * Deriva la URL del thumbnail (~640px) generado en backend a partir de la URL
 * full, ej. ".../imagenes/abc.webp" -> ".../imagenes/abc_thumb.webp". Solo
 * los WebP tienen thumbnail pareado (ver OptimizesUploadedImages::thumbKeyFor).
 */
export function toThumbSrc(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    if (!url.toLowerCase().endsWith('.webp')) return url;

    return url.replace(/\.webp$/i, '_thumb.webp');
}
