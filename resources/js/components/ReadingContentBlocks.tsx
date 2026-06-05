import PublishedContent from '@/content/PublishedContent';

type Props = {
    activeIndex: number | null;
    className?: string;
    html: string;
};

/**
 * Compatibility wrapper for existing detail pages.
 * New code should import PublishedContent from @/content/PublishedContent.
 */
export default function ReadingContentBlocks(props: Props) {
    return <PublishedContent {...props} />;
}
