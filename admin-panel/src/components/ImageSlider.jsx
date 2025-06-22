// src/components/ImageSlider.jsx
import React, { useState } from 'react';
import '../styles/ImageSlider.css';

const ImageSlider = ({ images }) => {
    // State to keep track of the current image index
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const goToSlide = (slideIndex) => {
        setCurrentIndex(slideIndex);
    }

    return (
        <div className="slider-container">
            {/* Left and Right Arrows */}
            <button className="slider-arrow left" onClick={goToPrevious}>&#10094;</button>
            <button className="slider-arrow right" onClick={goToNext}>&#10095;</button>

            {/* The main image */}
            <img
                src={images[currentIndex]}
                alt={`Product slide ${currentIndex + 1}`}
                className="slider-image"
            />

            {/* Indicator Dots */}
            <div className="slider-dots-container">
                {images.map((_, slideIndex) => (
                    <div
                        key={slideIndex}
                        className={`slider-dot ${currentIndex === slideIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(slideIndex)}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default ImageSlider;