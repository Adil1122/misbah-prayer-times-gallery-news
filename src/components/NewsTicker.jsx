import { useState, useEffect } from 'react';
import './NewsTicker.css';

const NewsTicker = ({ newsItems = [] }) => {
    if (!newsItems || newsItems.length === 0) return null;

    const renderItem = (item, index, suffix = '') => {
        const isObject = typeof item === 'object' && item !== null;
        const text = isObject ? item.text : item;
        const color = isObject ? item.color : 'inherit';

        return (
            <span
                key={`${suffix}${index}`}
                className="ticker-item"
                style={{ color: color }}
            >
                {text} •
            </span>
        );
    };

    return (
        <div className="news-ticker-container">
            <div className="ticker-wrapper">
                <div className="ticker-track">
                    {newsItems.map((item, index) => renderItem(item, index, 'orig-'))}
                    {/* Duplicate for seamless loop if items are few */}
                    {newsItems.map((item, index) => renderItem(item, index, 'dup-'))}
                </div>
            </div>
        </div>
    );
};

export default NewsTicker;
