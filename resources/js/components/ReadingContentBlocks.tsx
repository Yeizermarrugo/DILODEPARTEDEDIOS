import { extractReadingBlocks } from '@/utils/ttsReading';
import DOMPurify from 'dompurify';
import { useMemo, type CSSProperties } from 'react';

type Props = {
    activeIndex: number | null;
    html: string;
    className?: string;
};

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export default function ReadingContentBlocks({ html, activeIndex, className }: Props) {
    const blocks = useMemo(() => extractReadingBlocks(html), [html]);

    if (!blocks.length) {
        return null;
    }

    return (
        <div className={className} style={{ display: 'grid', gap: '12px' }}>
            {blocks.map((block) => {
                const active = activeIndex === block.index;
                const isHeading = HEADING_TAGS.has(block.tag);
                const sharedStyle: CSSProperties = {
                    position: 'relative',
                    padding: block.kind === 'list-item' ? '0.6rem 0.9rem 0.6rem 1rem' : '0.75rem 0.9rem',
                    margin: 0,
                    borderLeft: active ? '4px solid #6C63FF' : '4px solid transparent',
                    background: active ? 'rgba(108, 99, 255, 0.08)' : 'transparent',
                    borderRadius: 8,
                    transition: 'background 50ms ease, border-color 50ms ease, box-shadow 50ms ease',
                    boxShadow: active ? '0 10px 24px rgba(108, 99, 255, 0.08)' : 'none',
                    ...(!isHeading && { textAlign: 'justify' }),
                };

                if (block.kind === 'list-item') {
                    return (
                        <div key={block.index} style={sharedStyle}>
                            <span style={{ display: 'inline-flex', width: 22, color: active ? '#6C63FF' : '#888' }}>
                                •
                            </span>
                            <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.html) }} />
                        </div>
                    );
                }

                const Tag: HeadingTag | 'div' = HEADING_TAGS.has(block.tag)
                    ? (block.tag as HeadingTag)
                    : 'div';

                return (
                    <Tag
                        key={block.index}
                        style={{
                            ...sharedStyle,
                        }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.html) }}
                    />
                );
            })}
        </div>
    );
}
