const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const streakRoutes = require("./routes/streak.routes");
const errorMiddleware = require("./middleware/error.middleware");
const { generalLimiter } = require("./middleware/rateLimit.middleware");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(generalLimiter);

app.get("/health", (req, res) => res.json({ success: true, status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/daily-streak", streakRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, code: "NOT_FOUND", message: "Route not found." });
});

app.use(errorMiddleware);

module.exports = app;
