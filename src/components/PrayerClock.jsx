import { useState, useEffect, useRef } from 'react';
import { Clock, MapPin } from 'lucide-react';
import logoImg from '../assets/logo.png';
import './PrayerClock.css';

const PrayerClock = ({ prayers, isExpanded }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const activeRowRef = useRef(null);

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
        // Adjust date by -1 day for Birmingham Mosque
        const adjustedDate = new Date(date);
        adjustedDate.setDate(adjustedDate.getDate() - 1);

        const parts = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'Europe/London'
        }).formatToParts(adjustedDate);

        const day = parts.find(p => p.type === 'day')?.value.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)) || '';
        const month = parts.find(p => p.type === 'month')?.value || '';
        let year = parts.find(p => p.type === 'year')?.value.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)) || '';

        // Ensure "هـ" is used if "ه" is present or update year to include it
        if (year.includes('ه')) {
            year = year.replace('ه', 'هـ');
        } else {
            year = year + ' هـ';
        }

        return `${day} ${month} ${year}`;
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

    // Helper to convert HH:MM(:SS) to seconds from midnight
    const timeToSeconds = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m, s] = timeStr.split(':').map(Number);
        return (h * 3600) + (m * 60) + (s || 0);
    };

    // Refactored logic to find current active prayer
    const getCurrentPrayerId = () => {
        if (!prayers || prayers.length === 0) return null;

        // Get current UK time in seconds from midnight
        const ukDate = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Europe/London' }));
        const now = (ukDate.getHours() * 3600) + (ukDate.getMinutes() * 60) + ukDate.getSeconds();

        // Sort prayers by time to ensure logical order
        const sortedPrayers = [...prayers].sort((a, b) => {
            return timeToSeconds(a.begin_time || a.time) - timeToSeconds(b.begin_time || b.time);
        });

        let activeId = null;
        for (const prayer of sortedPrayers) {
            const prayerSeconds = timeToSeconds(prayer.begin_time || prayer.time);
            if (prayerSeconds <= now) {
                activeId = prayer.id;
            }
        }

        // Fallback to the last prayer of the day (e.g., if it's after midnight but before Fajr)
        return activeId !== null ? activeId : sortedPrayers[sortedPrayers.length - 1].id;
    };

    const currentPrayerId = getCurrentPrayerId();
    const lastPlayedRef = useRef(null); // To prevent duplicate or missed sounds

    // Audio Notification logic
    useEffect(() => {
        if (!prayers || prayers.length === 0) return;

        const ukDate = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Europe/London' }));
        const currentH = ukDate.getHours();
        const currentM = ukDate.getMinutes();
        const currentS = ukDate.getSeconds();

        const timestamp = `${currentH}:${currentM}`; // HH:M format for comparison

        // Check every prayer
        prayers.forEach(prayer => {
            const pTime = prayer.begin_time || prayer.time;
            if (!pTime) return;

            const [pH, pM] = pTime.split(':').map(Number);

            // If the time matches and we haven't played for this timestamp yet
            if (currentH === pH && currentM === pM && lastPlayedRef.current !== timestamp) {
                lastPlayedRef.current = timestamp;

                const audioPath = import.meta.env.BASE_URL + 'notification.mp3';
                const audio = new Audio(audioPath);
                audio.play().catch(error => {
                    console.log("Audio playback blocked or failed:", error);
                });
            }
        });

        // Reset lastPlayedRef if we're no longer in that minute (optional, but good practice)
        if (lastPlayedRef.current && lastPlayedRef.current !== timestamp) {
            // No reset needed here actually, as we check != timestamp, but let's keep it clean
        }
    }, [currentTime, prayers]);

    // Auto-scroll to active row when expanded or prayer changes
    useEffect(() => {
        if (isExpanded && activeRowRef.current) {
            activeRowRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [isExpanded, currentPrayerId]);

    return (
        <div className={`prayer-clock-container ${isExpanded ? 'expanded-mode' : ''}`}>
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
                        {prayers.map((prayer) => {
                            const isActive = currentPrayerId === prayer.id;
                            return (
                                <tr
                                    key={prayer.id}
                                    ref={isActive ? activeRowRef : null}
                                    className={`prayer-row ${isActive ? 'active' : ''}`}
                                >
                                    <td className="text-left prayer-name-en">{prayer.name}</td>
                                    <td className="text-center prayer-time-cell">{formatPrayerTime(prayer.begin_time || prayer.time)}</td>
                                    <td className="text-center prayer-time-cell">{formatPrayerTime(prayer.end_time || '--:--')}</td>
                                    <td className="text-right prayer-name-ar">{prayer.arabic_name}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PrayerClock;
