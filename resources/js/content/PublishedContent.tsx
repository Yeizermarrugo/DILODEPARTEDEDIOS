import DOMPurify from 'dompurify';
import { useEffect, useMemo, useRef } from 'react';
import './publishedContent.css';

const SCROLL_MARGIN_RATIO = 0.2;

type Props = {
    activeIndex: number | null;
    className?: string;
    html: string;
};

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const BLOCK_TAGS = new Set([...HEADING_TAGS, 'p', 'blockquote', 'div', 'section', 'article']);
const CONTAINER_TAGS = new Set(['div', 'section', 'article', 'blockquote']);

function hasBlockChildren(element: HTMLElement): boolean {
    return Array.from(element.children).some((child) => {
        const tag = child.tagName.toLowerCase();
        return BLOCK_TAGS.has(tag) || tag === 'li' || tag === 'ul' || tag === 'ol';
    });
}

function hasReadableText(element: HTMLElement): boolean {
    return Boolean((element.textContent ?? '').replace(/\u200d|[\s\u00a0\u200b\u200c\ufeff]/g, ''));
}

function annotateElement(element: HTMLElement, nextIndex: { current: number }, activeIndex: number | null): void {
    const tag = element.tagName.toLowerCase();

    if (tag === 'ul' || tag === 'ol') {
        Array.from(element.children).forEach((child) => {
            const childElement = child as HTMLElement;

            if (childElement.tagName.toLowerCase() === 'li' && hasReadableText(childElement)) {
                childElement.dataset.readingIndex = String(nextIndex.current);
                if (nextIndex.current === activeIndex) {
                    childElement.classList.add('dd-reading-active');
                }
                nextIndex.current += 1;
                return;
            }

            annotateElement(childElement, nextIndex, activeIndex);
        });

        return;
    }

    if (CONTAINER_TAGS.has(tag) && hasBlockChildren(element)) {
        Array.from(element.children).forEach((child) => annotateElement(child as HTMLElement, nextIndex, activeIndex));
        return;
    }

    if (BLOCK_TAGS.has(tag)) {
        if (hasReadableText(element)) {
            element.dataset.readingIndex = String(nextIndex.current);
            if (nextIndex.current === activeIndex) {
                element.classList.add('dd-reading-active');
            }
            nextIndex.current += 1;
        }

        return;
    }

    Array.from(element.children).forEach((child) => annotateElement(child as HTMLElement, nextIndex, activeIndex));
}

function sanitizeAndAnnotate(html: string, activeIndex: number | null): string {
    if (typeof window === 'undefined') {
        return html;
    }

    const sanitized = DOMPurify.sanitize(html, { ADD_ATTR: ['style', 'data-reading-index'] }) as string;
    const template = document.createElement('template');
    template.innerHTML = sanitized;
    const nextIndex = { current: 0 };

    Array.from(template.content.children).forEach((child) => annotateElement(child as HTMLElement, nextIndex, activeIndex));

    return template.innerHTML;
}

/**
 * Protected published-content renderer.
 *
 * Contract:
 * - Do not restructure saved TinyMCE HTML.
 * - Only sanitize and annotate readable blocks for audio highlighting.
 * - Styling belongs in publishedContent.css under .dd-reading-content.
 */
export default function PublishedContent({ activeIndex, className = '', html }: Props) {
    const contentHtml = useMemo(() => sanitizeAndAnnotate(html, activeIndex), [activeIndex, html]);
    const classes = ['dd-reading-content', className].filter(Boolean).join(' ');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeIndex === null) {
            console.log('[dd-scroll] activeIndex null, skip');
            return;
        }

        const el = containerRef.current?.querySelector<HTMLElement>(`[data-reading-index="${activeIndex}"]`);
        if (!el) {
            console.log('[dd-scroll] no element found for index', activeIndex);
            return;
        }

        const rect = el.getBoundingClientRect();
        const margin = window.innerHeight * SCROLL_MARGIN_RATIO;
        const outOfBounds = rect.top < margin || rect.bottom > window.innerHeight - margin;

        console.log('[dd-scroll] index', activeIndex, 'rect.top', rect.top, 'rect.bottom', rect.bottom, 'margin', margin, 'innerHeight', window.innerHeight, 'outOfBounds', outOfBounds);

        if (outOfBounds) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [activeIndex, contentHtml]);

    return <div ref={containerRef} className={classes} dangerouslySetInnerHTML={{ __html: contentHtml }} />;
}
