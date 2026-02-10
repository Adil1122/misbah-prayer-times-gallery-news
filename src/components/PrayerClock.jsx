import { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import logoImg from '../assets/logo.png';
import './PrayerClock.css';

const PrayerClock = ({ prayers }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Europe/London'
        });
    };

    const formatIslamicDate = (date) => {
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'Europe/London'
        }).format(date);
    };

    const formatEnglishDate = (date) => {
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'Europe/London'
        });
    };

    // Format string HH:MM:SS to HH:MM AM/PM
    const formatPrayerTime = (timeStr) => {
        if (!timeStr) return '--:--';
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    // Logic to find current active prayer using 'begin_time'
    const getCurrentPrayerId = () => {
        if (!prayers || prayers.length === 0) return null;

        // Get UK time components for logic
        const ukTimeStr = currentTime.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Europe/London'
        });
        const [ukH, ukM, ukS] = ukTimeStr.split(':').map(Number);
        const now = ukH * 3600 + ukM * 60 + ukS;

        let currentPrayerId = null;

        for (const prayer of prayers) {
            const timeStr = prayer.begin_time || prayer.time;
            if (!timeStr) continue;

            const [h, m, s] = timeStr.split(':').map(Number);
            const prayerSeconds = h * 3600 + m * 60 + (s || 0);

            if (prayerSeconds <= now) {
                currentPrayerId = prayer.id;
            }
        }

        // If no prayer has started yet today (early morning), it's Isha time from previous day
        return currentPrayerId || prayers[prayers.length - 1].id;
    };

    const currentPrayerId = getCurrentPrayerId();

    return (
        <div className="prayer-clock-container">
            {/* Header Section */}
            <div className="institute-header">
                {/* Logo Section (Left) */}
                <div className="logo-section">
                    <img src={logoImg} alt="Misbah Ul Quran" className="institute-logo" />
                </div>

                {/* Clocks Section (Center) */}
                <div className="clocks-wrapper">
                    <div className="digital-clock">
                        <span className="time-display">{formatTime(currentTime)}</span>
                        <div className="date-group">
                            <span className="date-display english-date">{formatEnglishDate(currentTime)}</span>
                            <span className="date-display islamic-date">{formatIslamicDate(currentTime)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Prayer Table Section */}
            <div className="prayers-table-container">
                <table className="prayers-table">
                    <thead>
                        <tr>
                            <th className="text-left">Prayer</th>
                            <th className="text-center">Begin</th>
                            <th className="text-center">Jamaat</th>
                            <th className="text-right">Arabic</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prayers.map((prayer) => (
                            <tr
                                key={prayer.id}
                                className={`prayer-row ${currentPrayerId === prayer.id ? 'active' : ''}`}
                            >
                                <td className="text-left prayer-name-en">{prayer.name}</td>
                                <td className="text-center prayer-time-cell">{formatPrayerTime(prayer.begin_time || prayer.time)}</td>
                                <td className="text-center prayer-time-cell">{formatPrayerTime(prayer.end_time || '--:--')}</td>
                                <td className="text-right prayer-name-ar">{prayer.arabic_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PrayerClock;
