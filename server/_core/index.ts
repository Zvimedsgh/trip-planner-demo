import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Document download proxy endpoint
  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const { getDocument } = await import("../db");
      const { ENV } = await import("./env");
      
      const documentId = parseInt(req.params.id);
      const document = await getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      // Fetch file directly from Manus Storage API using authenticated request
      // Storage API expects path in format: {uid}/{filePath}
      const downloadUrl = new URL("v1/storage/download", ENV.forgeApiUrl.replace(/\/+$/, "") + "/");
      const fullPath = `${ENV.ownerOpenId}/${document.fileKey}`;
      downloadUrl.searchParams.set("path", fullPath);
      
      console.log("[Document Download] Fetching from Storage API:", downloadUrl.toString());
      
      const fileResponse = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ENV.forgeApiKey}`,
        },
      });
      
      if (!fileResponse.ok) {
        console.error("[Document Download] Storage API error:", fileResponse.status, await fileResponse.text());
        return res.status(500).json({ error: "Failed to fetch file from storage" });
      }
      
      // Stream the file to the client
      res.setHeader("Content-Type", document.mimeType || "application/octet-stream");
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(document.name)}"`);
      
      const buffer = await fileResponse.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("[Document Download] Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
