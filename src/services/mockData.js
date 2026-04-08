// This service mimics the data structure we expect from the Laravel backend

const MOCK_PRAYERS = [
    { id: 1, name: 'Fajr', begin_time: '05:30:00', end_time: '06:45:00', arabic_name: 'Fajr', is_jummah: false },
    { id: 2, name: 'Dhuhr', begin_time: '12:30:00', end_time: '13:30:00', arabic_name: 'Dhuhr', is_jummah: false },
    { id: 3, name: 'Asr', begin_time: '15:45:00', end_time: '16:30:00', arabic_name: 'Asr', is_jummah: false },
    { id: 4, name: 'Maghrib', begin_time: '17:50:00', end_time: '18:10:00', arabic_name: 'Maghrib', is_jummah: false },
    { id: 5, name: 'Isha', begin_time: '19:15:00', end_time: '20:00:00', arabic_name: 'Isha', is_jummah: false },
    { id: 6, name: 'Jummah', begin_time: '13:15:00', end_time: '13:45:00', arabic_name: 'Jummah', is_jummah: true },
];

// Correcting Arabic names in a separate update to ensure encoding is handled if file saving has issues, 
// using unicode or direct text.
// Fajr: الفجر
// Dhuhr: الظهر
// Asr: العصر
// Maghrib: المغرب
// Isha: العشاء
const MOCK_PRAYERS_WITH_ARABIC = [
    { id: 1, name: 'Fajr', begin_time: '05:30:00', end_time: '06:00:00', arabic_name: 'الفجر', is_jummah: false },
    { id: 2, name: 'Dhuhr', begin_time: '12:30:00', end_time: '13:15:00', arabic_name: 'الظهر', is_jummah: false },
    { id: 3, name: 'Asr', begin_time: '15:45:00', end_time: '16:15:00', arabic_name: 'العصر', is_jummah: false },
    { id: 4, name: 'Maghrib', begin_time: '17:50:00', end_time: '18:05:00', arabic_name: 'المغرب', is_jummah: false },
    { id: 5, name: 'Isha', begin_time: '19:15:00', end_time: '19:45:00', arabic_name: 'العشاء', is_jummah: false },
    { id: 6, name: 'Jummah', begin_time: '13:15:00', end_time: '13:45:00', arabic_name: 'الجمعة', is_jummah: true },
];

const MOCK_IMAGES = [
    {
        id: 1,
        url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=1000',
        caption: 'Great Mosque of Mecca'
    },
    {
        id: 2,
        url: 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&q=80&w=1000',
        caption: 'Prophet\'s Mosque'
    },
    {
        id: 3,
        url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1000',
        caption: 'Sheikh Zayed Grand Mosque'
    },
];

const MOCK_NEWS = [
    "Welcome to Misbah Ul Quran Institute.",
    "Jummah Prayer tomorrow at 1:00 PM.",
    "Registration open for new Quran circles.",
    "Please switch off your mobile phones inside the prayer hall."
];

export const getPrayers = async () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_PRAYERS_WITH_ARABIC), 500);
    });
};

export const getSliderImages = async () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_IMAGES), 500);
    });
};

export const getNews = async () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_NEWS), 500);
    });
};
