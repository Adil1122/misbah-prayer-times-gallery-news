import { useState, useEffect } from 'react';
import './NewsTicker.css';

const NewsTicker = ({ newsItems = [] }) => {
    if (!newsItems || newsItems.length === 0) return null;

    return (
        <div className="news-ticker-container">

            <div className="ticker-wrapper">
                <div className="ticker-track">
                    {newsItems.map((item, index) => (
                        <span key={index} className="ticker-item">{item} • </span>
                    ))}
                    {/* Duplicate for seamless loop if items are few */}
                    {newsItems.map((item, index) => (
                        <span key={`dup-${index}`} className="ticker-item">{item} • </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewsTicker;
