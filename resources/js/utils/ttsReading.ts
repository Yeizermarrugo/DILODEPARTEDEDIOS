import DOMPurify from 'dompurify';

export type ReadingBlockKind = 'heading' | 'paragraph' | 'list-item' | 'other';

export type ReadingBlock = {
    index: number;
    html: string;
    kind: ReadingBlockKind;
    tag: string;
    text: string;
    weight: number;
    align?: string;
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

    const sanitized = DOMPurify.sanitize(html, { ADD_ATTR: ['style'] });
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${sanitized}</body>`, 'text/html');
    const blocks: ReadingBlock[] = [];

    Array.from(doc.body.childNodes).forEach((node) => collectBlocks(node, blocks));

    return blocks;
}

// Must match TextToSpeechService::DICTIONARY in the PHP backend.
// Longer entries first so e.g. "RVR1960" is matched before "RVR".
const TTS_DICTIONARY: [RegExp, string][] = [
    [/\bRVR1960\b/g, 'Reina Valera 1960'],
    [/\bRVR2015\b/g, 'Reina Valera actualizada 2015'],
    [/\bRVR1909\b/g, 'Reina Valera 1909'],
    [/\bNBLH\b/g, 'Nueva Biblia Latinoamericana de Hoy'],
    [/\bLBLA\b/g, 'La Biblia de las Américas'],
    [/\bNTV\b/g, 'Nueva Traducción Viviente'],
    [/\bNVI\b/g, 'Nueva Versión Internacional'],
    [/\bDHH\b/g, 'Dios Habla Hoy'],
    [/\bPDT\b/g, 'Palabra de Dios para Todos'],
    [/\bTLA\b/g, 'Traducción en Lenguaje Actual'],
    [/\bBLS\b/g, 'Biblia en Lenguaje Sencillo'],
    [/\bRVR\b/g, 'Reina Valera'],
    [/\bNKJV\b/g, 'New King James Version'],
    [/\bKJV\b/g, 'King James Version'],
    [/\bNIV\b/g, 'New International Version'],
    [/\bESV\b/g, 'English Standard Version'],
    [/\bNLT\b/g, 'New Living Translation'],
];

function expandDictionary(text: string): string {
    return TTS_DICTIONARY.reduce((t, [re, expansion]) => t.replace(re, expansion), text);
}

// Must match TextToSpeechService::BREAKS in the PHP backend.
const SSML_BREAK_SECONDS: Record<ReadingBlockKind | 'other', number> = {
    heading: 0.85,
    paragraph: 0.65,
    'list-item': 0.35,
    other: 0.65,
};

export function buildReadingTimings(blocks: ReadingBlock[], durationSeconds: number | null | undefined): ReadingTiming[] {
    if (!blocks.length) {
        return [];
    }

    const totalDuration = durationSeconds && Number.isFinite(durationSeconds) && durationSeconds > 0
        ? durationSeconds
        : null;

    if (!totalDuration) {
        return buildEstimatedTimings(blocks);
    }

    // Each block (except the last) contributes a known SSML <break> after it.
    const blockBreaks = blocks.map((block, i) =>
        i < blocks.length - 1 ? (SSML_BREAK_SECONDS[block.kind] ?? 0.65) : 0
    );
    const totalBreakTime = blockBreaks.reduce((s, b) => s + b, 0);
    const totalSpeechTime = Math.max(0.1, totalDuration - totalBreakTime);

    const blockChars = blocks.map(b => effectiveChars(b.text));
    const totalChars = blockChars.reduce((s, c) => s + c, 0);

    // Calculate where each block's speech content starts in the timeline.
    let cursor = 0;
    const speechStarts: number[] = [];
    const speechTimes: number[] = [];
    for (let i = 0; i < blocks.length; i++) {
        speechStarts.push(cursor);
        const speechTime = (blockChars[i] / totalChars) * totalSpeechTime;
        speechTimes.push(speechTime);
        cursor += speechTime + blockBreaks[i];
    }

    // Block N transitions to block N+1 at the midpoint of the break between them.
    // This highlights the next block slightly before its speech starts (anticipation effect).
    return blocks.map((block, i) => {
        const start = i === 0
            ? 0
            : speechStarts[i] - blockBreaks[i - 1] * 0.5;
        const end = i < blocks.length - 1
            ? speechStarts[i + 1] - blockBreaks[i] * 0.5
            : totalDuration;

        return { index: block.index, start, end };
    });
}

function buildEstimatedTimings(blocks: ReadingBlock[]): ReadingTiming[] {
    const totalWeight = blocks.reduce((sum, block) => sum + block.weight, 0);
    if (totalWeight <= 0) return [];
    const totalDuration = blocks.reduce((sum, block) => sum + estimateSeconds(block), 0);

    let cursor = 0;
    return blocks.map((block) => {
        const start = cursor;
        cursor += (block.weight / totalWeight) * totalDuration;
        return { index: block.index, start, end: cursor };
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
        const align = element.style.textAlign || undefined;
        pushBlock(tag, element.innerHTML, normalizeText(element.textContent ?? ''), kindForTag(tag), blocks, align);
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

function pushBlock(tag: string, html: string, text: string, kind: ReadingBlockKind, blocks: ReadingBlock[], align?: string): void {
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
        ...(align && { align }),
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

function effectiveChars(text: string): number {
    const normalized = normalizeText(text);
    // Expand known abbreviations to what Azure actually speaks — same mapping as backend.
    let working = expandDictionary(normalized);
    let extra = 0;

    // Verse references: "13:14-15" — Azure reads each digit individually as a word.
    working = working.replace(/\b\d+(?:[:-]\d+)+\b/g, (m) => {
        extra += (m.match(/\d/g) ?? []).length * 4;
        return ' ';
    });

    // Fallback for unknown abbreviation+digit codes not in TTS_DICTIONARY (e.g. "TLA2000").
    working = working.replace(/\b[A-ZÁÉÍÓÚÜÑ]{2,}[0-9]+\b/g, (m) => {
        extra += m.length * 4;
        return ' ';
    });

    // Standalone numbers: years, chapters, etc. Azure reads as words (≈5× per digit).
    working = working.replace(/\b\d+\b/g, (m) => {
        extra += m.length * 5;
        return ' ';
    });

    const baseChars = Math.max(4, working.replace(/\s/g, '').length);

    const sentenceEnds = (normalized.match(/[.!?]/g) ?? []).length;
    const ellipses = (normalized.match(/…|\.\.\./g) ?? []).length;
    const commas = (normalized.match(/[,;]/g) ?? []).length;

    return baseChars + extra + sentenceEnds * 7 + ellipses * 7 + commas * 2;
}

function estimateWeight(text: string, kind: ReadingBlockKind): number {
    const charUnit = effectiveChars(text) / 5.5;
    const base = kind === 'list-item' ? 0.9 : 1.0;
    const bonus = kind === 'heading' ? 1.2 : kind === 'list-item' ? 0.5 : 0.9;
    return Math.max(1, charUnit * base + bonus);
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
