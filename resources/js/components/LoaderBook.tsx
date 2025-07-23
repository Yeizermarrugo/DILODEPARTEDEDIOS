import '../../css/loaderBook.css'; // Crea este archivo y pega el CSS ahí

const LoaderBook = () => {
    return (
        <div className="loader-bg">
            <div className="loader book">
                <figure className="page"></figure>
                <figure className="page"></figure>
                <figure className="page"></figure>
            </div>
            <h1>Reading</h1>
        </div>
    );
};

export default LoaderBook;
