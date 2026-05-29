import DOMPurify from 'dompurify';

export type ReadingBlockKind = 'heading' | 'paragraph' | 'list-item' | 'other';

export type ReadingBlock = {
    index: number;
    html: string;
    kind: ReadingBlockKind;
    tag: string;
    text: string;
    weight: number;
};

export type ReadingTiming = {
    end: number;
    index: number;
    start: number;
};

const BLOCK_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'div', 'section', 'article']);
const CONTAINER_TAGS = new Set(['div', 'section', 'article', 'blockquote']);

export function extractReadingBlocks(html: string): ReadingBlock[] {
    if (typeof window === 'undefined') {
        return [];
    }

    const sanitized = DOMPurify.sanitize(html);
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${sanitized}</body>`, 'text/html');
    const blocks: ReadingBlock[] = [];

    Array.from(doc.body.childNodes).forEach((node) => collectBlocks(node, blocks));

    return blocks;
}

export function buildReadingTimings(blocks: ReadingBlock[], durationSeconds: number | null | undefined): ReadingTiming[] {
    if (!blocks.length) {
        return [];
    }

    const totalWeight = blocks.reduce((sum, block) => sum + block.weight, 0);
    const estimatedTotal = blocks.reduce((sum, block) => sum + estimateSeconds(block), 0);
    const totalDuration = durationSeconds && Number.isFinite(durationSeconds) && durationSeconds > 0
        ? durationSeconds
        : estimatedTotal;

    if (!Number.isFinite(totalDuration) || totalDuration <= 0 || totalWeight <= 0) {
        return [];
    }

    let cursor = 0;
    return blocks.map((block) => {
        const start = cursor;
        cursor += (block.weight / totalWeight) * totalDuration;

        return {
            index: block.index,
            start,
            end: cursor,
        };
    });
}

export function findActiveReadingBlock(timings: ReadingTiming[], currentTime: number): number | null {
    if (!timings.length) {
        return null;
    }

    const current = timings.find((timing) => currentTime >= timing.start && currentTime < timing.end);
    if (current) {
        return current.index;
    }

    if (currentTime >= timings[timings.length - 1].end) {
        return timings[timings.length - 1].index;
    }

    return null;
}

function collectBlocks(node: ChildNode, blocks: ReadingBlock[]): void {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = normalizeText(node.textContent ?? '');
        if (!text) {
            return;
        }

        pushBlock('div', escapeHtml(text), text, 'other', blocks);
        return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
    }

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (tag === 'br') {
        return;
    }

    if (tag === 'ul' || tag === 'ol') {
        Array.from(element.children).forEach((child) => {
            if (child.tagName.toLowerCase() === 'li') {
                pushBlock('li', child.innerHTML, normalizeText(child.textContent ?? ''), 'list-item', blocks);
            } else {
                collectBlocks(child, blocks);
            }
        });

        return;
    }

    if (CONTAINER_TAGS.has(tag) && hasBlockChildren(element)) {
        Array.from(element.childNodes).forEach((child) => collectBlocks(child, blocks));
        return;
    }

    if (BLOCK_TAGS.has(tag)) {
        pushBlock(tag, element.innerHTML, normalizeText(element.textContent ?? ''), kindForTag(tag), blocks);
        return;
    }

    if (element.childElementCount > 0) {
        Array.from(element.childNodes).forEach((child) => collectBlocks(child, blocks));
        return;
    }

    const text = normalizeText(element.textContent ?? '');
    if (!text) {
        return;
    }

    pushBlock('div', element.innerHTML, text, 'other', blocks);
}

function pushBlock(tag: string, html: string, text: string, kind: ReadingBlockKind, blocks: ReadingBlock[]): void {
    if (!text) {
        return;
    }

    blocks.push({
        index: blocks.length,
        html,
        kind,
        tag,
        text,
        weight: estimateWeight(text, kind),
    });
}

function hasBlockChildren(element: HTMLElement): boolean {
    return Array.from(element.children).some((child) => {
        const tag = child.tagName.toLowerCase();
        return BLOCK_TAGS.has(tag) || tag === 'li' || tag === 'ul' || tag === 'ol';
    });
}

function kindForTag(tag: string): ReadingBlockKind {
    if (tag.startsWith('h')) {
        return 'heading';
    }

    if (tag === 'p') {
        return 'paragraph';
    }

    return 'other';
}

function estimateWeight(text: string, kind: ReadingBlockKind): number {
    const words = Math.max(1, normalizeText(text).split(/\s+/).filter(Boolean).length);
    const base = kind === 'heading' ? 1.45 : kind === 'list-item' ? 0.88 : kind === 'paragraph' ? 1 : 1.05;
    const bonus = kind === 'heading' ? 2.25 : kind === 'list-item' ? 0.85 : 1.15;

    return Math.max(1, words * base + bonus);
}

function estimateSeconds(block: ReadingBlock): number {
    return block.weight * 0.42;
}

function normalizeText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
