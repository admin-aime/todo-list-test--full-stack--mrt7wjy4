import "dotenv/config";
import "reflect-metadata";
import express from "express";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";
import dbStatusRoutes from "./routes/db-status";

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

app.use(cors());
app.use(express.json());

// Swagger setup
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todo App API",
      version: "1.0.0",
      description: "REST API for the Todo List application",
    },
    servers: [{ url: "/api" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check (no DB required)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/db-status", dbStatusRoutes);

// Initialize DB and start
async function start() {
  const previewNoDb = (process.env.AIME_PREVIEW_NO_DB || "").trim().toLowerCase() === "true";

  if (previewNoDb) {
    console.log("AIME_PREVIEW_NO_DB=true — skipping database connection");
  } else {
    try {
      await AppDataSource.initialize();
      console.log("Database connected");
    } catch (err: any) {
      console.warn(
        "Database connection failed — running without DB:",
        err.message
      );
    }
  }

  const hostBindingEnabled =
    (process.env.DEFAULT_HOST_BINDING_ENABLED || "").trim().toLowerCase() ===
    "true";

  if (hostBindingEnabled) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } else {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

start();

export default app;
