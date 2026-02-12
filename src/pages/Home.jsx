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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchDisplayData();
                if (data.status === 'success') {
                    // Map Prayer Timings
                    const mappedPrayers = data.data.prayer_timings.map((p, index) => ({
                        id: p.id || index + 1,
                        name: p.english_name,
                        arabic_name: p.arabic_name,
                        begin_time: p.begin_time,
                        end_time: p.end_time
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

