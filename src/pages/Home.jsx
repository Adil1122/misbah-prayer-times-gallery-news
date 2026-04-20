import { useState, useEffect } from 'react';
import PrayerClock from '../components/PrayerClock';
import ImageSlider from '../components/ImageSlider';
import NewsTicker from '../components/NewsTicker';
import { fetchDisplayData } from '../services/frontendApi';
import { Maximize2, Minimize2 } from 'lucide-react';
import './Home.css';

const Home = () => {
    const [prayers, setPrayers] = useState([]);
    const [images, setImages] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const formatTimeForNews = (timeStr) => {
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
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Today's Data
                const data = await fetchDisplayData();

                // Fetch Tomorrow's Data
                const tomorrowDate = new Date();
                tomorrowDate.setDate(tomorrowDate.getDate() + 1);
                const tomorrowData = await fetchDisplayData(
                    tomorrowDate.getFullYear(),
                    tomorrowDate.getMonth() + 1,
                    tomorrowDate.getDate()
                );

                if (data.status === 'success') {
                    // Map Prayer Timings Map today's prayers
                    const mappedPrayers = data.data.prayer_timings.map((p, index) => ({
                        id: p.id || index + 1,
                        name: p.english_name,
                        arabic_name: p.arabic_name,
                        begin_time: p.begin_time,
                        end_time: p.end_time,
                        is_jummah: p.is_jummah ?? false
                    }));
                    setPrayers(mappedPrayers);

                    // Map Slider Images to full URLs
                    const mainUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
                    const mappedImages = data.data.slider_images.map((img, index) => ({
                        id: img.id || index + 1,
                        url: `${mainUrl}/${img.image_name}`,
                        caption: ''
                    }));
                    setImages(mappedImages);

                    // Map News to simple strings
                    const mappedNews = data.data.news.map(n => n.content);

                    // Check for changes in tomorrow's prayer timings
                    if (tomorrowData && tomorrowData.status === 'success') {
                        const todayTimings = data.data.prayer_timings;
                        const tomorrowTimings = tomorrowData.data.prayer_timings;

                        tomorrowTimings.forEach(tPrayer => {
                            const matchingToday = todayTimings.find(p => p.english_name === tPrayer.english_name);
                            // Compare begin_time - ignoring cases where both are null/missing
                            if (matchingToday && tPrayer.begin_time && matchingToday.begin_time !== tPrayer.begin_time) {
                                const formattedTime = formatTimeForNews(tPrayer.begin_time);
                                mappedNews.push({
                                    text: `Tomorrow ${tPrayer.english_name} time would be ${formattedTime}`,
                                    color: '#ff4d4d'
                                });
                            }
                        });
                    }

                    setNews(mappedNews);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Poll every 30 seconds to keep display updated
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className={`home-container ${isExpanded ? 'is-expanded' : ''}`}>
            <button
                className="layout-toggle-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Show Gallery" : "Expand Prayer Timings"}
            >
                {isExpanded ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
            <div className="main-content">
                <div className="left-panel">
                    <PrayerClock prayers={prayers} isExpanded={isExpanded} />
                </div>
                <div className="right-panel">
                    <ImageSlider images={images} />
                </div>
            </div>
            <footer className="footer-section">
                <NewsTicker newsItems={news} />
            </footer>
        </div>
    );
};

export default Home;

