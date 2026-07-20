import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";

console.log("[data-source] DATABASE_URL =", process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/\/\/.*@/, "//***:***@") : "NOT SET");
console.log("[data-source] AIME_PREVIEW_NO_DB =", process.env.AIME_PREVIEW_NO_DB || "NOT SET");
console.log("[data-source] __dirname =", __dirname);

export const AppDataSource = new DataSource({
  type: "mysql",
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: ["error", "warn", "migration"],
  // Glob patterns — TypeORM scans filesystem at initialize() time.
  // *.js = production (tsc → dist/), *.ts = dev (ts-node-dev → src/).
  // No explicit entity imports = no circular-dep / module-resolution issues.
  entities: [
    path.join(__dirname, "entities", "*.js"),
    path.join(__dirname, "entities", "*.ts"),
  ],
  migrations: [],
  subscribers: [],
  // SSL at BOTH levels: top-level (TypeORM MySQL connector) AND extra (mysql2 driver).
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
