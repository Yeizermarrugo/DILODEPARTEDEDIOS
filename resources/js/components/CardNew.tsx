import '../../css/cardNew.css';


const colorArray = [
    '#ffabab', '#ff990086', '#c511627c', '#ffd6408c', '#0090ea9a',
    '#fc00009f', '#00e67791', '#7c4dff85', '#ff408085', '#FFD600',
    '#69F0AE', '#00B8D4', '#2979FF', '#304FFE', '#AA00FF',
];

function buildCategoryColorMap(todasLasCategorias: string[]) {
    const map: { [categoria: string]: string } = {};
    todasLasCategorias.forEach((cat, idx) => {
        // Usamos la misma lógica: si se acaba el array, por defecto blanco
        map[cat] = colorArray[idx] ?? '#FFFFFF';
    });
    return map;
}

interface CardNewProps {
    dev: {
        id: string;
        imagen: string;
        titulo: string;
        autor: string;
        categoria: string;
        likes?: number;
        comments?: number;
        views_count?: number;
    };
    todasLasCategorias: string[]; // Recibe la lista completa para calcular su color
    onClick?: () => void;
    buildHref?: (dev: any) => string;
}

const CardNew = ({ dev, todasLasCategorias, onClick, buildHref }: CardNewProps) => {
    const { id, imagen, titulo, autor, categoria, likes = 0, comments = 0, views_count } = dev;

    // 3. Calculamos el color aquí mismo
    const categoryColorMap = buildCategoryColorMap(todasLasCategorias);
    const normalizedCat = categoria.trim().toLowerCase();
    const categoryColor = categoryColorMap[categoria] || categoryColorMap[normalizedCat] || '#FFFFFF';

    const href = buildHref ? buildHref(dev) : `/devocional/${id}`;

    // Función para agregar transparencia a cualquier color HEX
    const addAlpha = (hex: string, opacity: number) => {
        // Si el color es #ffffff86 (ya tiene alpha), le quitamos los últimos 2 caracteres primero
        const cleanHex = hex.length > 7 ? hex.substring(0, 7) : hex;
        const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
        return `${cleanHex}${alpha}`;
    };


    return (
        <div className="card-wrapper-link" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div className="example-2 card-custom">
                <div
                    className="wrapper"
                    style={{
                        backgroundImage: `url(${imagen})`,
                        /* Opcional: un borde sutil del color de la categoría */
                        borderBottom: `4px solid ${categoryColor}`
                    }}
                >
                    <div className="header">
                        <div className="date">
                            <span
                                className="category-badge"
                                style={{
                                    backgroundColor: addAlpha(categoryColor, 0.9),
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                }}
                            >
                                {categoria}
                            </span>
                        </div>
                        <ul className="menu-content" style={{ width: 'auto', display: 'flex', marginTop: '10px' }}>
                            {/* <li><i className="fa fa-heart-o"></i><span>{likes}</span></li>
                            <li><i className="fa fa-comment-o"></i><span>{comments}</span></li> */}
                            <li>
                                <i className="bi bi-eye"></i> {/* Usando Bootstrap Icons */}
                                <span>{views_count}</span>
                            </li>
                        </ul>
                    </div>
                    <div className="data">
                        <div className="content">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="author">{autor}</span>
                                {/* <ul className="menu-content" style={{ width: 'auto', display: 'flex', marginBottom: '12px' }}>
                                    <li><i className="fa fa-heart-o"></i> <span>{likes}</span></li>
                                    <li><i className="fa fa-comment-o"></i> <span>{comments}</span></li>
                                </ul> */}
                            </div>
                            <h1 className="title"><span>{titulo}</span></h1>
                            <span className="button-read" style={{ color: categoryColor }}>
                                <a key={id}
                                    href={href}
                                    style={{ textDecoration: 'none', color: 'white' }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Leer
                                </a>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardNew;