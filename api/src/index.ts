import "reflect-metadata";
import "dotenv/config";
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

  console.log("[start] AIME_PREVIEW_NO_DB =", process.env.AIME_PREVIEW_NO_DB || "NOT SET");
  console.log("[start] DATABASE_URL set:", !!process.env.DATABASE_URL);
  console.log("[start] NODE_ENV:", process.env.NODE_ENV || "NOT SET");

  if (previewNoDb) {
    console.log("[start] Skipping database connection (preview mode)");
  } else {
    try {
      console.log("[start] Initializing DataSource...");
      await AppDataSource.initialize();
      console.log("[start] Database connected successfully");
      console.log("[start] Registered entities:", AppDataSource.entityMetadatas.map(e => e.name).join(", "));
    } catch (err: any) {
      console.error("[start] Database connection FAILED");
      console.error("[start] Message:", err.message);
      console.error("[start] Stack:", err.stack?.split("\n").slice(0, 5).join("\n"));
      if (err.code) console.error("[start] Code:", err.code);
      if (err.errno) console.error("[start] Errno:", err.errno);
      if (err.sqlState) console.error("[start] SQL State:", err.sqlState);
      if (err.sqlMessage) console.error("[start] SQL Message:", err.sqlMessage);
      // Force exit so the container restarts and logs are visible
      console.error("[start] Exiting process...");
      setTimeout(() => process.exit(1), 500);
      return;
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
