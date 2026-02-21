import React, { useEffect, useRef, useMemo } from 'react';

function StarsBackground() {
    const containerRef = useRef(null);

    // Generate stars data once
    const stars = useMemo(() => {
        const starData = [];
        const starCount = 150;

        for (let i = 0; i < starCount; i++) {
            starData.push({
                id: i,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                opacity: Math.random() * 0.5 + 0.3,
                duration: `${Math.random() * 3 + 2}s`
            });
        }
        return starData;
    }, []);

    // Generate shooting stars data
    const shootingStars = useMemo(() => {
        const data = [];
        for (let i = 0; i < 3; i++) {
            data.push({
                id: i,
                left: `${Math.random() * 50}%`,
                top: `${Math.random() * 30}%`,
                delay: `${Math.random() * 10 + i * 5}s`
            });
        }
        return data;
    }, []);

    return (
        <div className="stars-container" ref={containerRef}>
            {stars.map(star => (
                <div
                    key={star.id}
                    className="star"
                    style={{
                        left: star.left,
                        top: star.top,
                        width: star.width,
                        height: star.height,
                        '--opacity': star.opacity,
                        '--duration': star.duration
                    }}
                />
            ))}
            {shootingStars.map(star => (
                <div
                    key={`shooting-${star.id}`}
                    className="shooting-star"
                    style={{
                        left: star.left,
                        top: star.top,
                        animationDelay: star.delay
                    }}
                />
            ))}
        </div>
    );
}

export default StarsBackground;
