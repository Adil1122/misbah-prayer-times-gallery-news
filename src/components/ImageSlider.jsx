import { useState, useEffect } from 'react';
import './ImageSlider.css';

const ImageSlider = ({ images, interval = 5000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!images || images.length === 0) return;

        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, interval);

        return () => clearInterval(timer);
    }, [images, interval]);

    if (!images || images.length === 0) {
        return <div className="slider-placeholder">No images available</div>;
    }

    return (
        <div className="slider-container">
            {images.map((image, index) => (
                <div
                    key={image.id}
                    className={`slide ${index === currentIndex ? 'active' : ''}`}
                >
                    <img
                        src={image.url.includes("https://aquilastech.com/misbah-ul-quran/backend") ? image.url.replace("https://aquilastech.com/misbah-ul-quran/backend", "https://aquilastech.com/misbah-ul-quran/backend/public") : image.url}
                        alt={image.caption || `Slide ${index + 1}`}
                        className="slide-image"
                        onError={(e) => {
                            console.error('Image failed to load:', image.url);
                            e.target.style.display = 'none';
                        }}
                    />
                    <div className="slide-overlay">
                        <h3 className="slide-caption">{image.caption}</h3>
                    </div>
                </div>
            ))}

            <div className="slider-indicators">
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={`indicator ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageSlider;
