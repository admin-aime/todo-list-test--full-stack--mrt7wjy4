import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Task } from "./entities/Task";

console.log("[data-source] DATABASE_URL =", process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/\/\/.*@/, "//***:***@") : "NOT SET");
console.log("[data-source] AIME_PREVIEW_NO_DB =", process.env.AIME_PREVIEW_NO_DB || "NOT SET");

export const AppDataSource = new DataSource({
  type: "mysql",
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: ["error", "warn", "migration"],
  entities: [User, Task],
  migrations: [],
  subscribers: [],
  ssl: {
    rejectUnauthorized: false,
  },
});
