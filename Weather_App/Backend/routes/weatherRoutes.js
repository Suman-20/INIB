import express from "express";

import {
  getWeather,
  getForecast,
  getRecentSearches,
  clearRecentSearches,
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../controllers/weatherController.js";

const router = express.Router();

router.get("/", getWeather);

router.get("/forecast", getForecast);

router.get("/recent", getRecentSearches);

router.delete("/recent", clearRecentSearches);

router.get("/favorites", getFavorites);

router.post("/favorites", addFavorite);

router.delete("/favorites/:id", removeFavorite);

export default router;
