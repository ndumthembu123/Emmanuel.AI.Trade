/**
 * Weather Routes
 * REST API endpoints for weather data
 */

import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import {
  getCurrentWeather,
  getForecast,
  getAirQuality,
  getWeatherByCoordinates,
  getMultipleCitiesWeather,
  getWeatherAlerts,
  convertTemperature,
  getWeatherEmoji
} from '../services/weatherService';

const router = Router();

/**
 * GET /api/weather/current?city=London
 * Get current weather for a city
 */
router.get('/current', async (req: Request, res: Response) => {
  try {
    const { city, units = 'metric' } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        error: 'City parameter is required'
      });
    }

    const weather = await getCurrentWeather(city as string, units as 'metric' | 'imperial');

    if (!weather) {
      return res.status(404).json({
        success: false,
        error: `Weather data not found for city: ${city}`
      });
    }

    res.json({
      success: true,
      data: {
        ...weather,
        emoji: getWeatherEmoji(weather.current.main)
      }
    });
  } catch (error) {
    logger.error('Error fetching current weather', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/weather/forecast?city=London
 * Get 5-day forecast for a city
 */
router.get('/forecast', async (req: Request, res: Response) => {
  try {
    const { city, units = 'metric' } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        error: 'City parameter is required'
      });
    }

    const forecast = await getForecast(city as string, units as 'metric' | 'imperial');

    if (!forecast) {
      return res.status(404).json({
        success: false,
        error: `Forecast data not found for city: ${city}`
      });
    }

    res.json({
      success: true,
      data: {
        city,
        count: forecast.length,
        forecast: forecast.map(day => ({
          ...day,
          emoji: getWeatherEmoji(day.description)
        })),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching forecast', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/weather/coordinates?lat=51.5074&lon=-0.1278
 * Get weather by latitude and longitude
 */
router.get('/coordinates', async (req: Request, res: Response) => {
  try {
    const { lat, lon, units = 'metric' } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude (lat) and Longitude (lon) parameters are required'
      });
    }

    const weather = await getWeatherByCoordinates(
      parseFloat(lat as string),
      parseFloat(lon as string),
      units as 'metric' | 'imperial'
    );

    if (!weather) {
      return res.status(404).json({
        success: false,
        error: 'Weather data not found for coordinates'
      });
    }

    res.json({
      success: true,
      data: {
        ...weather,
        emoji: getWeatherEmoji(weather.current.main)
      }
    });
  } catch (error) {
    logger.error('Error fetching weather by coordinates', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/weather/air-quality?lat=51.5074&lon=-0.1278
 * Get air quality data for coordinates
 */
router.get('/air-quality', async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude (lat) and Longitude (lon) parameters are required'
      });
    }

    const airQuality = await getAirQuality(
      parseFloat(lat as string),
      parseFloat(lon as string)
    );

    if (!airQuality) {
      return res.status(404).json({
        success: false,
        error: 'Air quality data not found'
      });
    }

    res.json({
      success: true,
      data: airQuality,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching air quality', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/weather/multiple?cities=London,Paris,New%20York
 * Get weather for multiple cities
 */
router.get('/multiple', async (req: Request, res: Response) => {
  try {
    const { cities, units = 'metric' } = req.query;

    if (!cities) {
      return res.status(400).json({
        success: false,
        error: 'Cities parameter is required (comma-separated)'
      });
    }

    const cityList = (cities as string).split(',').map(c => c.trim());

    if (cityList.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 cities per request'
      });
    }

    const weather = await getMultipleCitiesWeather(cityList, units as 'metric' | 'imperial');

    const results = Object.entries(weather).map(([city, data]) => ({
      city,
      ...data,
      emoji: data ? getWeatherEmoji(data.current.main) : undefined
    }));

    res.json({
      success: true,
      data: {
        count: results.length,
        results,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching multiple cities weather', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/weather/alerts?lat=51.5074&lon=-0.1278
 * Get weather alerts for coordinates
 */
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude (lat) and Longitude (lon) parameters are required'
      });
    }

    const alerts = await getWeatherAlerts(
      parseFloat(lat as string),
      parseFloat(lon as string)
    );

    res.json({
      success: true,
      data: {
        count: alerts?.length || 0,
        alerts: alerts || [],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching weather alerts', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/weather/convert?temp=32&from=fahrenheit&to=celsius
 * Convert temperature units
 */
router.get('/convert', (req: Request, res: Response) => {
  try {
    const { temp, from, to } = req.query;

    if (!temp || !from || !to) {
      return res.status(400).json({
        success: false,
        error: 'Temperature (temp), from, and to parameters are required'
      });
    }

    const validUnits = ['celsius', 'fahrenheit', 'kelvin'];

    if (!validUnits.includes(from as string) || !validUnits.includes(to as string)) {
      return res.status(400).json({
        success: false,
        error: `Invalid units. Valid options: ${validUnits.join(', ')}`
      });
    }

    const result = convertTemperature(
      parseFloat(temp as string),
      from as 'celsius' | 'fahrenheit' | 'kelvin',
      to as 'celsius' | 'fahrenheit' | 'kelvin'
    );

    res.json({
      success: true,
      data: {
        original: {
          value: parseFloat(temp as string),
          unit: from
        },
        converted: {
          value: result,
          unit: to
        }
      }
    });
  } catch (error) {
    logger.error('Error converting temperature', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/weather/test
 * Test weather API connectivity
 */
router.get('/test', async (req: Request, res: Response) => {
  try {
    const weather = await getCurrentWeather('London', 'metric');

    res.json({
      success: !!weather,
      data: weather ? {
        message: 'Weather API is working',
        location: weather.location.name,
        temperature: weather.current.temp
      } : {
        message: 'Weather API test failed',
        hint: 'Make sure OPENWEATHER_API_KEY is set'
      }
    });
  } catch (error) {
    logger.error('Weather API test failed', error);
    res.status(500).json({
      success: false,
      error: 'Weather API test failed'
    });
  }
});

export default router;
