import type { ReactNode } from 'react';

type Props = {
    showBreadcrumbs?: boolean;
    children: ReactNode;
};

export default function PageHero({ showBreadcrumbs = false, children }: Props) {
    return (
        <div className="page-title">
            {showBreadcrumbs && <div className="breadcrumbs" />}
            <div className="title-wrapper">
                {children}
            </div>
        </div>
    );
}
