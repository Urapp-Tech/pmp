import { useEffect, useState } from 'react';

const images = [
    'https://images.unsplash.com/photo-1570129477752-5079a32c253b?q=80&w=1770&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b174?q=80&w=1943&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c6c579?q=80&w=1770&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560185007-5f0d3170460d?q=80&w=1770&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1588661858525-46c596324b17?q=80&w=1974&auto=format&fit=crop'
];

const AutoSlideHoverCarousel = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const visibleCount = 2.5;

    const nextSlide = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevSlide = () => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (hoveredIndex === null) {
                nextSlide();
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [hoveredIndex]);

    return (
        <div className="relative w-full mx-auto py-8 overflow-hidden" style={{ maxWidth: '1700px' }}>
            <div
                className="relative flex items-center justify-center"
                onMouseEnter={() => setHoveredIndex(-1)}
                onMouseLeave={() => setHoveredIndex(null)}
            >
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                        transform: `translateX(calc(-${activeIndex * (100 / visibleCount)}%))`
                    }}
                >
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 p-2 group"
                            style={{ width: `calc(100% / ${visibleCount})` }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(-1)}
                        >
                            <img
                                src={image}
                                alt={`House ${index}`}
                                className={`w-full h-80 object-cover rounded-2xl shadow-lg transition-transform duration-300 transform ${hoveredIndex === index ? 'scale-105 z-20' : 'scale-100 z-10'
                                    }`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation buttons */}
            <button
                onClick={prevSlide}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 p-3 rounded-full bg-gray-800/50 text-white hover:bg-gray-800 transition-colors duration-300 z-30"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <button
                onClick={nextSlide}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 p-3 rounded-full bg-gray-800/50 text-white hover:bg-gray-800 transition-colors duration-300 z-30"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

        </div>
    );
};

export default AutoSlideHoverCarousel;