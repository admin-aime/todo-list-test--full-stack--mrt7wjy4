import { Router, Request, Response } from "express";
import * as net from "net";

const router = Router();

/**
 * @swagger
 * /api/db-status:
 *   get:
 *     summary: Get database connection status
 *     description: Tests TCP reachability of the configured DATABASE_URL host and returns sanitized connection info.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Database status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connected:
 *                   type: boolean
 *                 database:
 *                   type: string
 *                 host:
 *                   type: string
 *                 type:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.get("/", async (_req: Request, res: Response) => {
  let database = "unknown";
  let host = "unknown";
  let dbType = "unknown";
  let port = 5432;

  const dbUrl = process.env.DATABASE_URL || "";

  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      host = url.hostname;
      database = url.pathname.replace(/^\//, "") || "unknown";
      dbType = url.protocol.replace(/:$/, "");
      port = parseInt(url.port, 10) || 5432;
    } catch {
      const atSplit = dbUrl.split("@");
      if (atSplit.length > 1) {
        const hostPart = atSplit[1].split("/")[0];
        host = hostPart.split(":")[0] || "unknown";
        port = parseInt(hostPart.split(":")[1], 10) || 5432;
      }
      const slashSplit = dbUrl.split("/");
      if (slashSplit.length > 3) {
        database = slashSplit[slashSplit.length - 1] || "unknown";
      }
    }
  }

  // Use a raw TCP socket to test reachability — avoids the pg module's SSL
  // handshake which crashes inside WebContainer (detached ArrayBuffer).
  let connected = false;
  let error = "";

  if (dbUrl) {
    try {
      connected = await new Promise<boolean>((resolve) => {
        const socket = new net.Socket();
        const timeout = 8000;

        socket.setTimeout(timeout);
        socket.on("connect", () => {
          socket.destroy();
          resolve(true);
        });
        socket.on("timeout", () => {
          socket.destroy();
          resolve(false);
        });
        socket.on("error", (err: any) => {
          error = err.message || String(err);
          socket.destroy();
          resolve(false);
        });

        socket.connect(port, host);
      });
    } catch (err: any) {
      error = err.message || String(err);
      connected = false;
    }
  }

  res.json({
    connected,
    database,
    host,
    type: dbType || "postgres",
    error: error || undefined,
  });
});

export default router;
