import axios from "axios";
import Search from "../models/Search.js";
import Favorite from "../models/Favorite.js";

const WEATHER_URL =
  "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_URL =
  "https://api.openweathermap.org/data/2.5/forecast";

/* ========================================
   CURRENT WEATHER
======================================== */

export const getWeather = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city?.trim()) {
      return res.status(400).json({
        success: false,
        message: "City name is required",
      });
    }

    const response = await axios.get(WEATHER_URL, {
      params: {
        q: city.trim(),
        appid: process.env.OPENWEATHER_API_KEY,
        units: "metric",
      },
    });

    const data = response.data;

    const weather = {
      city: data.name,
      country: data.sys.country,

      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),

      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),

      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,

      humidity: data.main.humidity,
      pressure: data.main.pressure,

      windSpeed: data.wind.speed,

      visibility: data.visibility,
      clouds: data.clouds.all,

      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,

      timezone: data.timezone,

      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon,
      },
    };

    await Search.create({
      city: weather.city,
      country: weather.country,
      temperature: weather.temperature,
      condition: weather.condition,
      humidity: weather.humidity,
    });

    return res.status(200).json({
      success: true,
      weather,
    });
  } catch (error) {
    console.error(
      "Weather error:",
      error.response?.data || error.message
    );

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "City not found",
      });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: "Invalid OpenWeather API key",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to fetch weather",
    });
  }
};

/* ========================================
   FORECAST
======================================== */

export const getForecast = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city?.trim()) {
      return res.status(400).json({
        success: false,
        message: "City name is required",
      });
    }

    const response = await axios.get(FORECAST_URL, {
      params: {
        q: city.trim(),
        appid: process.env.OPENWEATHER_API_KEY,
        units: "metric",
      },
    });

    const data = response.data;

    // One forecast near midday for each day
    const dailyMap = new Map();

    data.list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      const hour = item.dt_txt.split(" ")[1];

      if (!dailyMap.has(date) || hour === "12:00:00") {
        dailyMap.set(date, item);
      }
    });

    const forecast = Array.from(dailyMap.values())
      .slice(0, 5)
      .map((item) => ({
        date: item.dt,
        dateText: item.dt_txt,

        temperature: Math.round(item.main.temp),
        tempMin: Math.round(item.main.temp_min),
        tempMax: Math.round(item.main.temp_max),

        humidity: item.main.humidity,

        condition: item.weather[0].main,
        description: item.weather[0].description,
        icon: item.weather[0].icon,

        windSpeed: item.wind.speed,

        rainProbability: Math.round(
          (item.pop || 0) * 100
        ),
      }));

    return res.status(200).json({
      success: true,

      city: {
        name: data.city.name,
        country: data.city.country,
      },

      forecast,
    });
  } catch (error) {
    console.error(
      "Forecast error:",
      error.response?.data || error.message
    );

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "City not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to fetch forecast",
    });
  }
};

/* ========================================
   RECENT SEARCHES
======================================== */

export const getRecentSearches = async (req, res) => {
  try {
    const searches = await Search.aggregate([
      {
        $sort: {
          searchedAt: -1,
        },
      },

      {
        $group: {
          _id: {
            city: "$city",
            country: "$country",
          },

          city: {
            $first: "$city",
          },

          country: {
            $first: "$country",
          },

          temperature: {
            $first: "$temperature",
          },

          condition: {
            $first: "$condition",
          },

          searchedAt: {
            $first: "$searchedAt",
          },
        },
      },

      {
        $sort: {
          searchedAt: -1,
        },
      },

      {
        $limit: 6,
      },
    ]);

    res.status(200).json({
      success: true,
      searches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch recent searches",
    });
  }
};

/* ========================================
   DELETE SEARCH HISTORY
======================================== */

export const clearRecentSearches = async (req, res) => {
  try {
    await Search.deleteMany({});

    res.status(200).json({
      success: true,
      message: "Search history cleared",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to clear search history",
    });
  }
};

/* ========================================
   FAVORITES
======================================== */

export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch favorites",
    });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { city, country } = req.body;

    if (!city || !country) {
      return res.status(400).json({
        success: false,
        message: "City and country are required",
      });
    }

    const exists = await Favorite.findOne({
      city: {
        $regex: new RegExp(`^${city}$`, "i"),
      },
      country,
    });

    if (exists) {
      return res.status(200).json({
        success: true,
        favorite: exists,
        message: "City already in favorites",
      });
    }

    const favorite = await Favorite.create({
      city,
      country,
    });

    res.status(201).json({
      success: true,
      favorite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to add favorite",
    });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findByIdAndDelete(
      req.params.id
    );

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Favorite removed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to remove favorite",
    });
  }
};