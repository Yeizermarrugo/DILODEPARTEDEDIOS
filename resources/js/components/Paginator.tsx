type PaginationMeta = {
    current_page?: number;
    last_page?: number;
};

type Props = {
    pagination: PaginationMeta;
    onPageChange: (page: number) => void;
};

export default function Paginator({ pagination, onPageChange }: Props) {
    if (!pagination.last_page || pagination.last_page <= 1) return null;

    const maxPagesToShow = 5;
    let start = Math.max(1, (pagination.current_page || 1) - 2);
    const end = Math.min(pagination.last_page, start + maxPagesToShow - 1);
    if (end - start < maxPagesToShow - 1) {
        start = Math.max(1, end - maxPagesToShow + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
        pages.push(
            <button
                key={i}
                className={`paginator-btn ${pagination.current_page === i ? 'active' : ''}`}
                onClick={() => onPageChange(i)}
                disabled={pagination.current_page === i}
                style={{
                    margin: '0 3px',
                    padding: '5px 10px',
                    background: pagination.current_page === i ? '#007bff' : '#f0f0f0',
                    color: pagination.current_page === i ? '#fff' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: pagination.current_page === i ? 'default' : 'pointer',
                }}
            >
                {i}
            </button>,
        );
    }

    return (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <button
                onClick={() => onPageChange((pagination.current_page || 2) - 1)}
                disabled={pagination.current_page === 1}
                style={{ marginRight: '5px' }}
            >
                &laquo; Anterior
            </button>
            {pages}
            <button
                onClick={() => onPageChange((pagination.current_page || 0) + 1)}
                disabled={pagination.current_page === pagination.last_page}
                style={{ marginLeft: '5px' }}
            >
                Siguiente &raquo;
            </button>
        </div>
    );
}
