import { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, Volume2, VolumeOff } from 'lucide-react';
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
        const adjustedDate = new Date(date);
        // Adjusted per user request: moved 1 day further (removed -1 adjustment)
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

    // Find the currently active prayer: highlighted only between begin_time and end_time (Jamaat)
    const getCurrentPrayerId = () => {
        if (!prayers || prayers.length === 0) return null;

        // Get London timezone day directly as string
        const londonWeekday = currentTime.toLocaleDateString('en-GB', { timeZone: 'Europe/London', weekday: 'short' });
        const londonHour = parseInt(currentTime.toLocaleString('en-GB', { timeZone: 'Europe/London', hour: 'numeric' }), 10);
        const londonMinute = parseInt(currentTime.toLocaleString('en-GB', { timeZone: 'Europe/London', minute: 'numeric' }), 10);
        const londonSecond = parseInt(currentTime.toLocaleString('en-GB', { timeZone: 'Europe/London', second: 'numeric' }), 10);
        const isFriday = londonWeekday === 'Fri';
        const now = (londonHour * 3600) + (londonMinute * 60) + londonSecond;

        for (const prayer of prayers) {
            // Check if prayer is Jummah by flag OR by name
            const prayerName = (prayer.name || prayer.english_name || '').toLowerCase();
            const isJummah = Boolean(prayer.is_jummah) || prayerName.includes('jummah') || prayerName.includes('juma');
            
            // Skip Jummah if not Friday
            if (isJummah && !isFriday) continue;

            const begin = timeToSeconds(prayer.begin_time || prayer.time);
            const end = timeToSeconds(prayer.end_time);

            // Only active if both times are set and now is within [begin, end)
            if (begin && end && now >= begin && now < end) {
                return prayer.id;
            }
        }

        return null; // No prayer currently active
    };

    const currentPrayerId = getCurrentPrayerId();
    const [isUnmuted, setIsUnmuted] = useState(false);
    const audioRef = useRef(null);
    const audioContextRef = useRef(null);
    const audioBufferRef = useRef(null);
    const lastPlayedRef = useRef(null);

    // Initialize only the HTMLAudioElement path at mount (no AudioContext yet)
    useEffect(() => {
        const audioPath = import.meta.env.BASE_URL + 'notification.mp3';
        audioRef.current = new Audio(audioPath);
        audioRef.current.load();
        // Store path for lazy AudioContext decode
        audioRef.current._src = audioPath;
    }, []);

    /**
     * Play sound using the best available method.
     * AudioContext buffer source is tried first (works on Android TV).
     * Falls back to HTMLAudioElement (works on desktop/mobile).
     */
    const playNotification = () => {
        if (audioContextRef.current && audioBufferRef.current) {
            const ctx = audioContextRef.current;
            const playBuffer = () => {
                const source = ctx.createBufferSource();
                source.buffer = audioBufferRef.current;
                source.connect(ctx.destination);
                source.start(0);
            };
            if (ctx.state === 'suspended') {
                ctx.resume().then(playBuffer).catch(_playViaElement);
            } else {
                playBuffer();
            }
        } else {
            _playViaElement();
        }
    };

    const _playViaElement = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(err => {
                console.log('HTMLAudio playback failed:', err);
                setIsUnmuted(false);
            });
        }
    };

    /**
     * Unmute handler — MUST create AudioContext here, inside the user gesture,
     * so Android TV browsers allow it to start in 'running' state immediately.
     * Creating it outside a gesture (e.g. at page load) leaves it 'suspended'
     * and some TV browsers silently refuse to resume it later.
     */
    const handleUnmute = () => {
        const audioPath = import.meta.env.BASE_URL + 'notification.mp3';
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;

        if (AudioContextClass && !audioContextRef.current) {
            // Create context INSIDE the gesture — guaranteed 'running' on Android TV
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;

            // Decode and cache the audio buffer immediately
            fetch(audioPath)
                .then(res => res.arrayBuffer())
                .then(buf => ctx.decodeAudioData(buf))
                .then(decoded => {
                    audioBufferRef.current = decoded;
                })
                .catch(err => console.warn('AudioContext decode failed:', err));
        } else if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume().catch(() => { });
        }

        // Also unlock HTMLAudioElement as fallback
        if (audioRef.current) {
            audioRef.current.play().then(() => {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setIsUnmuted(true);
            }).catch(() => {
                // HTMLAudioElement blocked — rely on AudioContext path
                setIsUnmuted(true);
            });
        } else {
            setIsUnmuted(true);
        }
    };

    // Audio Notification logic — fires at prayer time
    useEffect(() => {
        if (!prayers || prayers.length === 0 || !isUnmuted) return;

        const londonWeekday = currentTime.toLocaleDateString('en-GB', { timeZone: 'Europe/London', weekday: 'short' });
        const currentH = parseInt(currentTime.toLocaleString('en-GB', { timeZone: 'Europe/London', hour: 'numeric' }), 10);
        const currentM = parseInt(currentTime.toLocaleString('en-GB', { timeZone: 'Europe/London', minute: 'numeric' }), 10);
        const isFriday = londonWeekday === 'Fri';

        const timestamp = `${currentH}:${currentM}`;

        prayers.forEach(prayer => {
            const pTime = prayer.begin_time || prayer.time;
            if (!pTime) return;

            // Check if prayer is Jummah by flag OR by name
            const prayerName = (prayer.name || prayer.english_name || '').toLowerCase();
            const isJummah = Boolean(prayer.is_jummah) || prayerName.includes('jummah') || prayerName.includes('juma');

            // Skip Jumma if not Friday
            if (isJummah && !isFriday) return;

            const [pH, pM] = pTime.split(':').map(Number);

            if (currentH === pH && currentM === pM && lastPlayedRef.current !== timestamp) {
                lastPlayedRef.current = timestamp;
                playNotification();
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTime, prayers, isUnmuted]);

    // Auto-scroll to active row when expanded or prayer changes
    useEffect(() => {
        if (isExpanded && activeRowRef.current) {
            activeRowRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [isExpanded, currentPrayerId]);

    // Separate regular prayers from Jummah — check by flag OR by name
    const isJummahPrayer = (p) => Boolean(p.is_jummah) || (p.name || p.english_name || '').toLowerCase().includes('jummah') || (p.name || p.english_name || '').toLowerCase().includes('juma');
    const regularPrayers = prayers.filter(p => !isJummahPrayer(p));
    const jummahPrayer = prayers.find(p => isJummahPrayer(p));

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
                        <div className="time-row">
                            <span className="time-display">{formatTime(currentTime)}</span>
                            <button
                                onClick={handleUnmute}
                                className={`audio-control-btn ${isUnmuted ? 'is-enabled' : 'is-disabled'}`}
                                title={isUnmuted ? "Sound Enabled" : "Enable Sound"}
                            >
                                {isUnmuted ? <Volume2 size={24} /> : <VolumeOff size={24} />}
                            </button>
                        </div>
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
                        {regularPrayers.map((prayer) => {
                            const isActive = currentPrayerId === prayer.id;
                            return (
                                <tr
                                    key={prayer.id}
                                    ref={isActive ? activeRowRef : null}
                                    className={`prayer-row ${isActive ? 'active' : ''}`}
                                >
                                    <td className="text-left prayer-name-en">{prayer.name || prayer.english_name}</td>
                                    <td className="text-center prayer-time-cell">{formatPrayerTime(prayer.begin_time || prayer.time)}</td>
                                    <td className="text-center prayer-time-cell">{formatPrayerTime(prayer.end_time || '--:--')}</td>
                                    <td className="text-right prayer-name-ar">{prayer.arabic_name}</td>
                                </tr>
                            );
                        })}

                        {/* Jummah Prayer Row — shown after Isha, highlighted only on Friday during its time */}
                        {jummahPrayer && (() => {
                            const isJummahActive = currentPrayerId === jummahPrayer.id;

                            return (
                                <tr className={`prayer-row jummah-row${isJummahActive ? ' active' : ''}`}>
                                    <td className="text-left prayer-name-en">
                                        {jummahPrayer.name || jummahPrayer.english_name}
                                    </td>
                                    <td className="text-center prayer-time-cell">{formatPrayerTime(jummahPrayer.begin_time || jummahPrayer.time)}</td>
                                    <td className="text-center prayer-time-cell">{formatPrayerTime(jummahPrayer.end_time || '--:--')}</td>
                                    <td className="text-right prayer-name-ar">{jummahPrayer.arabic_name}</td>
                                </tr>
                            );
                        })()}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PrayerClock;
