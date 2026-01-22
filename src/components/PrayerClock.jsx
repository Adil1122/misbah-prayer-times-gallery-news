import { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
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
        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
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

    // Logic to find next prayer using 'begin_time'
    const getNextPrayerId = () => {
        if (!prayers || prayers.length === 0) return null;

        const now = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();

        for (const prayer of prayers) {
            // Support both mock formats for safety while transitioning
            const timeStr = prayer.begin_time || prayer.time;
            if (!timeStr) continue;

            const [h, m, s] = timeStr.split(':').map(Number);
            const prayerSeconds = h * 3600 + m * 60 + (s || 0);

            if (prayerSeconds > now) {
                return prayer.id;
            }
        }
        // If all passed, highlight Fajr
        return prayers[0].id;
    };

    const nextPrayerId = getNextPrayerId();

    return (
        <div className="prayer-clock-container">
            {/* Header Section */}
            <div className="institute-header">
                <div className="left-header-content">
                    <div className="logo-placeholder">Logo</div>
                    <div className="institute-info">
                        <h1 className="institute-name">Misbah Ul Quran Institute</h1>
                        <div className="institute-address">
                            <MapPin size={16} />
                            <span>United Kingdom</span>
                        </div>
                    </div>
                </div>

                {/* Clock Section Moved Here */}
                <div className="digital-clock">
                    <Clock size={48} className="clock-icon" />
                    <span className="time-display">{formatTime(currentTime)}</span>
                    <span className="date-display">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Prayer Table Section */}
            <div className="prayers-table-container">
                <table className="prayers-table">
                    <thead>
                        <tr>
                            <th className="text-left">Prayer</th>
                            <th className="text-center">Begin</th>
                            <th className="text-center">End</th>
                            <th className="text-right">Arabic</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prayers.map((prayer) => (
                            <tr
                                key={prayer.id}
                                className={`prayer-row ${nextPrayerId === prayer.id ? 'active' : ''}`}
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
