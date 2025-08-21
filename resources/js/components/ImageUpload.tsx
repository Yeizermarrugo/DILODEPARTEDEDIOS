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
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        console.log('file', file);
        console.log('image', image);
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target && typeof ev.target.result === 'string') {
                    setImage(ev.target.result);
                    setImageTitle(file.name);
                    if (onImageSelected) {
                        onImageSelected(file, ev.target.result);
                        console.log('onImageSelected', JSON.stringify(onImageSelected(file, ev.target.result)));
                    }
                }
            };
            reader.readAsDataURL(file);
        } else {
            removeUpload();
        }
    };

    const removeUpload = () => {
        setImage(null);
        setImageTitle('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onImageSelected) onImageSelected(null, null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target && typeof ev.target.result === 'string') {
                    setImage(ev.target.result);
                    setImageTitle(file.name);
                    if (onImageSelected) onImageSelected(file, ev.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="file-upload">
            <button className="file-upload-btn" type="button" onClick={handleButtonClick}>
                Add Image
            </button>
            {!image ? (
                <div
                    className={`image-upload-wrap${dragActive ? 'image-dropping' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input className="file-upload-input" name="file" type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
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
