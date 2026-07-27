import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import weatherRoutes from "./routes/weatherRoutes.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Weather API is running",
  });
});

app.use("/api/weather", weatherRoutes);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Weather server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("Server failed:", error.message);
  }
};

startServer();