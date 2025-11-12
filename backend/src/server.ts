
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { environment } from './config/environment';
import { connectToDatabase } from './config/database';
import apiRouter from './api/routes';
import { errorMiddleware } from './api/middleware/errorMiddleware';

const app = express();
const PORT = environment.PORT;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies, with a larger limit for code payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Servir imagens geradas estaticamente
app.use('/api/images/generated', express.static(path.join(process.cwd(), 'public', 'generated-images')));

// API Routes
app.use('/api', apiRouter);

// Root endpoint for health check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'AI Web Weaver backend is running!' });
});

// Unhandled route handler - This must be after all other routes and before the error handler
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: 'Not Found' });
});

// Global Error Handler Middleware - This must be the last 'app.use()'
app.use(errorMiddleware);

const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    (process as any).exit(1);
  }
};

startServer();