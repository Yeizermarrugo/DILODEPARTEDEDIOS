export default function Spinner() {
    return (
        <div id="preloader" className="d-flex align-items-center justify-content-center">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
}
