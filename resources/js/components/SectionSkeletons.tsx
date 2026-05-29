import '../../css/skeletons.css';

type CountProps = {
    count?: number;
};

export function DevocionalGridSkeleton({ count = 8 }: CountProps) {
    return (
        <div className="cards-container dv-skeleton-grid" aria-hidden="true">
            {Array.from({ length: count }).map((_, index) => (
                <div className="card-wrapper-link sk-card" key={index}>
                    <div className="sk-card__media">
                        <div className="sk-line sk-line--badge" />
                        <div className="sk-card__footer">
                            <div className="sk-line sk-line--author" />
                            <div className="sk-line sk-line--title" />
                            <div className="sk-line sk-line--title sk-line--short" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function EnsenanzasGridSkeleton({ count = 6 }: CountProps) {
    return (
        <div className="ens-grid sk-ens-grid" aria-hidden="true">
            {Array.from({ length: count }).map((_, index) => (
                <div className="ens-card sk-ens-card" key={index}>
                    <div className="sk-ens-card__cover">
                        <div className="sk-line sk-line--avatar" />
                        <div className="sk-line sk-line--cover-title" />
                    </div>
                    <div className="sk-ens-card__body">
                        <div className="sk-line" />
                        <div className="sk-line" />
                        <div className="sk-line sk-line--half" />
                    </div>
                    <div className="sk-ens-card__footer">
                        <div className="sk-line sk-line--button" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function EstudiosAccordionSkeleton({ count = 8 }: CountProps) {
    return (
        <div className="est-acordeon sk-est-list" aria-hidden="true">
            {Array.from({ length: count }).map((_, index) => (
                <div className="est-book sk-est-book" key={index}>
                    <div className="sk-est-book__head">
                        <div className="sk-line sk-line--num" />
                        <div className="sk-line sk-line--book" />
                        <div className="sk-line sk-line--count" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function DevocionalDetailsSkeleton() {
    return (
        <div className="dd-page dd-skeleton-page" aria-hidden="true">
            <div className="dd-hero sk-dd-hero">
                <div className="sk-dd-title">
                    <div className="sk-line sk-line--hero-title" />
                    <div className="sk-line sk-line--hero-title sk-line--hero-title-short" />
                </div>
            </div>
            <div className="dd-body">
                <div className="dd-content sk-dd-content">
                    <div className="sk-line sk-line--toolbar" />
                    <div className="sk-line sk-line--paragraph" />
                    <div className="sk-line sk-line--paragraph" />
                    <div className="sk-line sk-line--paragraph sk-line--paragraph-short" />
                    <div className="sk-line sk-line--paragraph" />
                    <div className="sk-line sk-line--paragraph sk-line--paragraph-mid" />
                    <div className="sk-dd-meta">
                        <div className="sk-line sk-line--meta" />
                        <div className="sk-line sk-line--meta sk-line--meta-short" />
                    </div>
                </div>
            </div>
        </div>
    );
}
