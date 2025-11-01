import React, { useState, useEffect, useCallback } from 'react';
import { getWeatherData, getMarketPriceData, getYieldData, getWeatherDataByCity, getWaterContentData, getGovernmentSchemes, getFarmingCalendar } from '../services/geminiService';
import { WeatherData, MarketPriceData, YieldData, WaterData, Language, GovernmentSchemeData, FarmingCalendarData } from '../types';
import { translations, indianStates, crops } from '../constants';
import { SearchIcon } from './Icons';

const Spinner = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark dark:border-primary-light"></div>
);

const Card: React.FC<{ title: string, children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{title}</h2>
        {children}
    </div>
);

const WeatherWidget: React.FC<{ language: Language }> = ({ language }) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const t = translations[language];

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const data = await getWeatherData(latitude, longitude);
                    if (data) {
                        setWeather(data);
                    } else {
                        setError(t.weatherError);
                    }
                    setLoading(false);
                },
                () => {
                    setError(t.weatherError);
                    setLoading(false);
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);
    
    const handleSearch = async () => {
        if (!citySearch.trim()) return;
        setLoading(true);
        setError('');
        const data = await getWeatherDataByCity(citySearch);
        if (data) {
            setWeather(data);
        } else {
            setError(`Could not fetch weather for ${citySearch}.`);
        }
        setLoading(false);
    };

    return (
        <Card title={t.weather}>
            <div className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    value={citySearch} 
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder={t.searchLocationPlaceholder}
                    className="flex-1 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 border border-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
                />
                <button onClick={handleSearch} className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-colors" aria-label={t.search}>
                    <SearchIcon className="w-6 h-6" />
                </button>
            </div>
            {loading && <div className="flex items-center gap-4"><Spinner /><p>{t.fetchWeather}</p></div>}
            {error && <p className="text-red-500">{error}</p>}
            {weather && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-4xl font-bold">{weather.temperature}°C</p>
                            <p className="text-gray-600 dark:text-gray-300">{weather.condition}</p>
                            <p className="text-gray-600 dark:text-gray-300">{weather.city}</p>
                        </div>
                        <div className="text-right">
                           <p>Humidity: {weather.humidity}%</p>
                           <p>Wind: {weather.windSpeed} km/h</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                        {weather.forecast.map(day => (
                            <div key={day.day} className="bg-secondary dark:bg-gray-700/50 p-2 rounded-lg">
                               <p className="font-semibold">{day.day}</p> 
                               <p>{day.temp}°C</p>
                               <p className="text-xs">{day.condition}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};

const MarketPriceWidget: React.FC<{ language: Language }> = ({ language }) => {
    const [data, setData] = useState<MarketPriceData | null>(null);
    const [loading, setLoading] = useState(false);
    const [state, setState] = useState(Object.keys(indianStates)[0]);
    const [city, setCity] = useState(indianStates[Object.keys(indianStates)[0]][0]);
    const [crop, setCrop] = useState(crops[0]);
    const t = translations[language];

    const fetchData = useCallback(async () => {
        setLoading(true);
        setData(null);
        const result = await getMarketPriceData(crop, city, state);
        setData(result);
        setLoading(false);
    }, [crop, city, state]);

    return (
        <Card title={t.marketPrices}>
            <div className="flex flex-wrap gap-4 mb-4">
                <select value={state} onChange={e => { setState(e.target.value); setCity(indianStates[e.target.value][0]); }} className="flex-1 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 min-w-[120px]">
                    {Object.keys(indianStates).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={city} onChange={e => setCity(e.target.value)} className="flex-1 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 min-w-[120px]">
                    {indianStates[state].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={crop} onChange={e => setCrop(e.target.value)} className="flex-1 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 min-w-[120px]">
                    {crops.map(cr => <option key={cr} value={cr}>{cr}</option>)}
                </select>
            </div>
            <button onClick={fetchData} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors" disabled={loading}>{loading ? '...' : t.fetch}</button>
            {loading && <div className="mt-4 flex justify-center"><Spinner /></div>}
            {data && (
                <div className="mt-4 p-4 bg-secondary dark:bg-gray-700/50 rounded-lg">
                    <p><span className="font-semibold">Crop:</span> {data.crop}</p>
                    <p><span className="font-semibold">Price:</span> {data.price}</p>
                    <p><span className="font-semibold">Market:</span> {data.market}</p>
                    <p><span className="font-semibold">Updated:</span> {data.lastUpdated}</p>
                </div>
            )}
        </Card>
    );
};

const YieldWidget: React.FC<{ language: Language }> = ({ language }) => {
    const [data, setData] = useState<YieldData | null>(null);
    const [loading, setLoading] = useState(false);
    const [crop, setCrop] = useState(crops[0]);
    const t = translations[language];

    const fetchData = useCallback(async () => {
        setLoading(true);
        setData(null);
        const result = await getYieldData(crop);
        setData(result);
        setLoading(false);
    }, [crop]);

    return (
        <Card title={t.yieldProduction}>
            <div className="flex gap-4 mb-4">
                <select value={crop} onChange={e => setCrop(e.target.value)} className="flex-1 p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                    {crops.map(cr => <option key={cr} value={cr}>{cr}</option>)}
                </select>
                <button onClick={fetchData} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors" disabled={loading}>{loading ? '...' : t.fetch}</button>
            </div>
            {loading && <div className="mt-4 flex justify-center"><Spinner /></div>}
            {data && (
                <div className="mt-4 p-4 bg-secondary dark:bg-gray-700/50 rounded-lg space-y-2">
                    <p><span className="font-semibold">Avg. Yield:</span> {data.averageYield}</p>
                    <p><span className="font-semibold">Potential Yield:</span> {data.potentialYield}</p>
                    <div>
                        <p className="font-semibold">Key Factors:</p>
                        <ul className="list-disc list-inside text-sm">
                            {data.factors.map((factor, i) => <li key={i}>{factor}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </Card>
    );
};

const WaterContentWidget: React.FC<{ language: Language }> = ({ language }) => {
    const [data, setData] = useState<WaterData | null>(null);
    const [loading, setLoading] = useState(false);
    const [crop, setCrop] = useState(crops[0]);
    const t = translations[language];

    const fetchData = useCallback(async () => {
        setLoading(true);
        setData(null);
        const result = await getWaterContentData(crop);
        setData(result);
        setLoading(false);
    }, [crop]);

    return (
        <Card title={t.waterNeeds}>
            <div className="flex gap-4 mb-4">
                <select value={crop} onChange={e => setCrop(e.target.value)} className="flex-1 p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                    {crops.map(cr => <option key={cr} value={cr}>{cr}</option>)}
                </select>
                <button onClick={fetchData} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors" disabled={loading}>{loading ? '...' : t.fetch}</button>
            </div>
            {loading && <div className="mt-4 flex justify-center"><Spinner /></div>}
            {data && (
                <div className="mt-4 p-4 bg-secondary dark:bg-gray-700/50 rounded-lg space-y-2">
                    <p><span className="font-semibold">Requirement:</span> {data.waterRequirement}</p>
                    <div>
                        <p className="font-semibold">Farming Tips:</p>
                        <ul className="list-disc list-inside text-sm">
                            {data.farmingTips.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </Card>
    );
};

const GovernmentSchemesWidget: React.FC<{ language: Language }> = ({ language }) => {
    const [data, setData] = useState<GovernmentSchemeData | null>(null);
    const [loading, setLoading] = useState(true);
    const t = translations[language];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const result = await getGovernmentSchemes();
            setData(result);
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <Card title={t.governmentSchemes}>
            {loading && <div className="flex justify-center"><Spinner /></div>}
            {data && (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {data.schemes.map((scheme, index) => (
                        <div key={index} className="p-3 bg-secondary dark:bg-gray-700/50 rounded-lg">
                            <h4 className="font-bold text-md text-primary-dark dark:text-primary-light">{scheme.name}</h4>
                            <p className="text-sm mt-1">{scheme.description}</p>
                            <p className="text-sm mt-2"><span className="font-semibold">Eligibility:</span> {scheme.eligibility}</p>
                            {scheme.link && (
                                <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-dark dark:text-accent-light hover:underline mt-1 inline-block">
                                    Learn More &rarr;
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {!loading && !data && <p>Could not load schemes.</p>}
        </Card>
    );
};

const FarmingCalendarWidget: React.FC<{ language: Language }> = ({ language }) => {
    const [data, setData] = useState<FarmingCalendarData | null>(null);
    const [loading, setLoading] = useState(false);
    const [crop, setCrop] = useState(crops[0]);
    const t = translations[language];

    const fetchData = useCallback(async () => {
        setLoading(true);
        setData(null);
        const result = await getFarmingCalendar(crop);
        setData(result);
        setLoading(false);
    }, [crop]);

    return (
        <Card title={t.farmingCalendar}>
            <div className="flex gap-4 mb-4">
                <select value={crop} onChange={e => setCrop(e.target.value)} className="flex-1 p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                    {crops.map(cr => <option key={cr} value={cr}>{cr}</option>)}
                </select>
                <button onClick={fetchData} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors" disabled={loading}>
                    {loading ? t.generating : t.generateSchedule}
                </button>
            </div>
            {loading && <div className="mt-4 flex justify-center"><Spinner /></div>}
            {data && (
                <div className="mt-4 space-y-4 max-h-80 overflow-y-auto pr-2">
                    {data.schedule.map((item, index) => (
                        <div key={index} className="p-3 bg-secondary dark:bg-gray-700/50 rounded-lg relative pl-8">
                            <div className="absolute left-3 top-5 bottom-0 w-0.5 bg-primary/50"></div>
                             {index !== data.schedule.length -1 && <div className="absolute left-3 top-5 h-full w-0.5 bg-primary/50"></div>}
                            <div className="absolute left-[7px] top-4 bg-primary w-3 h-3 rounded-full border-2 border-secondary dark:border-gray-700/50"></div>
                            <h4 className="font-bold text-md text-primary-dark dark:text-primary-light">{item.timeframe}: {item.task}</h4>
                            <p className="text-sm mt-1">{item.details}</p>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};


const Dashboard: React.FC<{ language: Language }> = ({ language }) => {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WeatherWidget language={language} />
                <MarketPriceWidget language={language} />
                <YieldWidget language={language} />
                <WaterContentWidget language={language} />
                <GovernmentSchemesWidget language={language} />
                <FarmingCalendarWidget language={language} />
            </div>
        </div>
    );
};

export default Dashboard;