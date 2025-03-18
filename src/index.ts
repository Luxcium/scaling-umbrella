/// <reference types="node" />

/**
 * TFTDD (Type-First Test-Driven Development) Framework
 *
 * This framework emphasizes type-first development combined with test-driven development
 * principles to create robust, type-safe applications.
 *
 * @packageDocumentation
 */
import { PrismaClient } from '@prisma/client';
import http from 'http';
import { URL } from 'url';
import { getImages, createImage } from './services/imageService';

// Initialize Prisma client
const prisma = new PrismaClient();

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.url === '/health') {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      // Return success response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          services: {
            database: 'connected',
          },
        })
      );
      return;
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'error',
          message: 'Database connection failed',
        })
      );
      return;
    }
  }

  // Handle image-related endpoints
  if (req.url?.startsWith('/images')) {
    if (req.method === 'GET') {
      // Parse query parameters
      const url = new URL(req.url, `http://${req.headers.host}`);
      const zipPath = url.searchParams.get('zipPath');
      const imageName = url.searchParams.get('imageName') || undefined;

      if (!zipPath) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'zipPath is required' }));
        return;
      }

      const result = await getImages({ zipPath, imageName });

      if (result.success) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.value));
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: result.error.message }));
      }
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const result = await createImage(data);

          if (result.success) {
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.value));
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: result.error.message }));
          }
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error: 'Invalid JSON payload',
            })
          );
        }
      });
      return;
    }
  }

  // Handle 404 for unknown routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.warn(`Server running on port ${PORT}`);
  console.warn(`Health check endpoint: http://localhost:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.warn('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  server.close(() => {
    console.warn('HTTP server closed');
    process.exit(0);
  });
});
