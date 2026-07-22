'use client';

import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  Search,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';

interface CurrentWeather {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  cloudiness: number;
  description: string;
  main: string;
  icon: string;
  sunrise: number;
  sunset: number;
  visibility: number;
  rain?: number;
  snow?: number;
}

interface Location {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface WeatherData {
  location: Location;
  current: CurrentWeather;
  timestamp: number;
  emoji: string;
}

interface ForecastDay {
  date: string;
  temp_max: number;
  temp_min: number;
  description: string;
  icon: string;
  precipitation: number;
  humidity: number;
  wind_speed: number;
  emoji: string;
}

interface AirQuality {
  aqi: number;
  aqiLevel: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
}

interface WeatherDashboardProps {
  apiUrl?: string;
}

const WeatherDashboard: React.FC<WeatherDashboardProps> = ({
  apiUrl = 'http://localhost:5000/api/weather'
}) => {
  const [city, setCity] = useState('London');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [airQuality, setAirQuality] = useState<AirQuality | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const tempUnit = units === 'metric' ? '°C' : '°F';
  const windUnit = units === 'metric' ? 'm/s' : 'mph';

  // Fetch weather data
  const fetchWeather = async (searchCity: string = city) => {
    try {
      setLoading(true);
      setError(null);

      const currentRes = await fetch(`${apiUrl}/current?city=${searchCity}&units=${units}`);
      if (!currentRes.ok) throw new Error('Failed to fetch current weather');
      const currentData = await currentRes.json();
      setWeather(currentData.data);

      const forecastRes = await fetch(`${apiUrl}/forecast?city=${searchCity}&units=${units}`);
      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        setForecast(forecastData.data.forecast);
      }

      // Fetch air quality
      if (currentData.data) {
        const aqRes = await fetch(
          `${apiUrl}/air-quality?lat=${currentData.data.location.latitude}&lon=${currentData.data.location.longitude}`
        );
        if (aqRes.ok) {
          const aqData = await aqRes.json();
          setAirQuality(aqData.data);
        }
      }

      setCity(searchCity);
      setSearchInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchWeather();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchWeather(searchInput.trim());
    }
  };

  const getAQIColor = (aqi: number): string => {
    switch (aqi) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-orange-500';
      case 4: return 'bg-red-500';
      case 5: return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getAQILevelColor = (level: string): string => {
    switch (level) {
      case 'Good': return 'text-green-600';
      case 'Fair': return 'text-yellow-600';
      case 'Moderate': return 'text-orange-600';
      case 'Poor': return 'text-red-600';
      case 'Very Poor': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (loading && !weather) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600">
        <div className="text-center">
          <Cloud className="w-16 h-16 animate-bounce text-white mx-auto mb-4" />
          <p className="text-white text-lg font-semibold">Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🌤️ Weather Dashboard</h1>
          <p className="text-blue-100">Real-time weather forecast powered by OpenWeatherMap</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search city..."
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
            >
              Search
            </button>
            <div className="flex gap-2 bg-white/20 rounded-lg p-1 backdrop-blur-sm">
              <button
                onClick={() => setUnits('metric')}
                className={`px-4 py-2 rounded transition ${
                  units === 'metric'
                    ? 'bg-white text-blue-600 font-semibold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setUnits('imperial')}
                className={`px-4 py-2 rounded transition ${
                  units === 'imperial'
                    ? 'bg-white text-blue-600 font-semibold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                °F
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mb-8 bg-red-500/90 backdrop-blur-sm text-white p-4 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {weather && (
          <>
            {/* Current Weather Card */}
            <div className="mb-8 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 text-white mb-2">
                    <MapPin size={20} />
                    <span className="text-sm font-medium">{weather.location.name}, {weather.location.country}</span>
                  </div>
                  <p className="text-gray-200 text-sm">{weather.location.timezone}</p>
                </div>
                <span className="text-6xl">{weather.emoji}</span>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Temperature */}
                <div>
                  <p className="text-blue-100 text-sm mb-2">Temperature</p>
                  <div className="text-5xl font-bold text-white mb-2">
                    {Math.round(weather.current.temp)}{tempUnit}
                  </div>
                  <p className="text-blue-100">
                    Feels like {Math.round(weather.current.feels_like)}{tempUnit}
                  </p>
                  <p className="text-xl capitalize text-blue-50 mt-2">{weather.current.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-100 mb-2">
                      <Droplets size={16} />
                      <span className="text-xs">Humidity</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">{weather.current.humidity}%</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-100 mb-2">
                      <Wind size={16} />
                      <span className="text-xs">Wind Speed</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">{weather.current.wind_speed} {windUnit}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-100 mb-2">
                      <Gauge size={16} />
                      <span className="text-xs">Pressure</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">{weather.current.pressure} mb</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-100 mb-2">
                      <Eye size={16} />
                      <span className="text-xs">Visibility</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">{(weather.current.visibility / 1000).toFixed(1)} km</p>
                  </div>
                </div>

                {/* Cloudiness & Rain */}
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-100 mb-2">
                      <Cloud size={16} />
                      <span className="text-xs">Cloud Coverage</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                      <div
                        className="bg-white h-2 rounded-full transition-all"
                        style={{ width: `${weather.current.cloudiness}%` }}
                      ></div>
                    </div>
                    <p className="text-white font-semibold">{weather.current.cloudiness}%</p>
                  </div>

                  {weather.current.rain && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-100 mb-2">
                        <CloudRain size={16} />
                        <span className="text-xs">Rain (1h)</span>
                      </div>
                      <p className="text-2xl font-semibold text-white">{weather.current.rain} mm</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Air Quality Card */}
            {airQuality && (
              <div className="mb-8 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Air Quality Index</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-24 h-24 rounded-full ${getAQIColor(airQuality.aqi)} flex items-center justify-center`}>
                      <span className="text-4xl font-bold text-white">{airQuality.aqi}</span>
                    </div>
                    <div>
                      <p className="text-gray-200 text-sm">Air Quality</p>
                      <p className={`text-3xl font-bold ${getAQILevelColor(airQuality.aqiLevel)}`}>
                        {airQuality.aqiLevel}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-blue-100">PM2.5</p>
                      <p className="text-xl font-semibold text-white">{airQuality.pm25.toFixed(1)}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-blue-100">PM10</p>
                      <p className="text-xl font-semibold text-white">{airQuality.pm10.toFixed(1)}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-blue-100">NO₂</p>
                      <p className="text-xl font-semibold text-white">{airQuality.no2.toFixed(1)}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-blue-100">O₃</p>
                      <p className="text-xl font-semibold text-white">{airQuality.o3.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5-Day Forecast */}
            {forecast.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">5-Day Forecast</h2>
                <div className="grid md:grid-cols-5 gap-4">
                  {forecast.slice(0, 5).map((day, idx) => (
                    <div key={idx} className="bg-white/10 rounded-xl p-4 text-center border border-white/10 hover:bg-white/20 transition">
                      <p className="text-white font-semibold mb-2">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                      <p className="text-3xl mb-3">{day.emoji}</p>

                      <div className="flex justify-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <TrendingUp size={16} className="text-red-300" />
                          <span className="text-red-300 font-semibold">{Math.round(day.temp_max)}{tempUnit}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingDown size={16} className="text-blue-300" />
                          <span className="text-blue-300 font-semibold">{Math.round(day.temp_min)}{tempUnit}</span>
                        </div>
                      </div>

                      <p className="text-xs text-blue-100 capitalize mb-3">{day.description}</p>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-gray-200">
                          <span>Humidity:</span>
                          <span>{day.humidity}%</span>
                        </div>
                        <div className="flex justify-between text-gray-200">
                          <span>Wind:</span>
                          <span>{day.wind_speed} {windUnit}</span>
                        </div>
                        {day.precipitation > 0 && (
                          <div className="flex justify-between text-gray-200">
                            <span>Rain:</span>
                            <span>{day.precipitation} mm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherDashboard;
