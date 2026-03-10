import { useRef, useState } from 'react';
import '../../css/imageUpload.css';

interface ImageUploadProps {
    onImageSelected?: (file: File | null, dataUrl: string | null) => void;
}

const ImageUpload = ({ onImageSelected }: ImageUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [imageTitle, setImageTitle] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const processFile = (file: File | null) => {
        if (!file) {
            setImage(null);
            setImageTitle('');
            if (fileInputRef.current) fileInputRef.current.value = '';
            onImageSelected?.(null, null);
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target && typeof ev.target.result === 'string') {
                setImage(ev.target.result);
                setImageTitle(file.name);
                onImageSelected?.(file, ev.target.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        processFile(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0] || null;
        processFile(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
    };

    const removeUpload = () => {
        processFile(null);
    };

    return (
        <div className="file-upload">
            <button className="file-upload-btn" type="button" onClick={handleButtonClick}>
                Add Image
            </button>
            {!image ? (
                <div
                    className={`image-upload-wrap${dragActive ? ' image-dropping' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        className="file-upload-input"
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <div className="drag-text">
                        <h3>Drag and drop a file or select add Image</h3>
                    </div>
                </div>
            ) : (
                <div className="file-upload-content">
                    <img className="file-upload-image" src={image} alt="your upload" />
                    <div className="image-title-wrap">
                        <button type="button" onClick={removeUpload} className="remove-image">
                            Remove <span className="image-title">{imageTitle}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
