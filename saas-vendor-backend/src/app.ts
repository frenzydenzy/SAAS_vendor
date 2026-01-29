import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from "mongoose";
import config from './config/environment';

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import dealRoutes from './routes/dealRoutes';
import claimRoutes from './routes/claimRoutes';
import adminRoutes from './routes/adminRoutes';

// Middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// MongoDB Memory Server (for development fallback)
let mongoServer: any = null;

dotenv.config();

const app: Express = express();
const PORT = config.port;

// ==================== Middleware ====================
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// ==================== Routes ====================
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// ==================== Database Connection & Server Start ====================
export const startServer = async (): Promise<void> => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    let connectionType = 'MongoDB Atlas';

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // FIX: Clean the URI if it contains a port number with +srv
    if (mongoUri.startsWith('mongodb+srv://') && mongoUri.includes(':27017')) {
      console.log("⚠️  Cleaning port :27017 from mongodb+srv URI...");
      mongoUri = mongoUri.replace(':27017', '');
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    
    try {
      // Try connecting to MongoDB Atlas first
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        retryWrites: true,
      } as any);

      console.log("✅ MongoDB Atlas connected successfully");
      connectionType = 'MongoDB Atlas';

    } catch (atlasError: any) {
      console.log("\n⚠️  MongoDB Atlas connection failed\n");

      // Try local MongoDB as fallback
      const localMongoUri = 'mongodb://localhost:27017/saasvendor';
      
      if (config.nodeEnv === 'development') {
        console.log('🔄 Attempting to connect to local MongoDB...');
        
        try {
          await mongoose.connect(localMongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
          } as any);

          console.log("✅ Local MongoDB connected successfully");
          connectionType = 'Local MongoDB';

        } catch (localError: any) {
          console.error('❌ Local MongoDB connection also failed:', localError.message);
          
          // As last resort, use Memory Server (but with shorter timeout)
          console.log('🔄 Starting MongoDB Memory Server as fallback...');
          
          try {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            
            const memoryServerPromise = MongoMemoryServer.create();
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Memory Server timeout')), 20000)
            );
            
            mongoServer = await Promise.race([memoryServerPromise, timeoutPromise]);
            const memoryUri = mongoServer.getUri();

            await mongoose.connect(memoryUri, {
              maxPoolSize: 10,
            } as any);

            console.log("✅ MongoDB Memory Server started successfully");
            connectionType = 'MongoDB Memory Server (Dev Mode)';

          } catch (memoryError: any) {
            console.error('❌ All database connection attempts failed');
            throw atlasError;
          }
        }
      } else {
        throw atlasError;
      }
    }

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║   SAAS VENDOR - Backend API                ║
║   Server running on port ${PORT}               ║
║   Environment: ${config.nodeEnv}           ║
║   Database: ${connectionType}              ║
║   Status: ✅ Ready                         ║
╚════════════════════════════════════════════╝
      `);
    });

    // Prevent Node from exiting
    // Keep strong reference to server
    server.unref = () => server; // Override unref to prevent garbage collection
    
    // Wait forever
    await new Promise<never>(() => {
      // Never resolve
    });

  } catch (error: any) {
    console.error('\n❌ Failed to start server\n');
    console.error(`Error: ${error.message}\n`);
    
    console.error('🔧 TROUBLESHOOTING:\n');
    console.error('To use MongoDB Atlas:');
    console.error('1. Go to: https://cloud.mongodb.com/v2');
    console.error('2. Click: Security → Network Access');
    console.error('3. Add your IP address (or 0.0.0.0/0 for development)');
    console.error('4. Wait 5-10 minutes for changes to propagate');
    console.error('5. Try again\n');
    
    console.error('Alternative - Use Local MongoDB:');
    console.error('1. Install MongoDB Community: https://www.mongodb.com/try/download/community');
    console.error('2. Start MongoDB service');
    console.error('3. Set MONGODB_URI=mongodb://localhost:27017/saasvendor in .env\n');

    process.exit(1);
  }
};

if (require.main === module) {
  process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    // Don't exit - let the server keep running
  });

  process.on('unhandledRejection', (reason, _promise) => {
    console.error('💥 Unhandled Rejection:', reason);
    // Don't exit - let the server keep running
  });

  (async () => {
    try {
      await startServer();
      // This will never return since startServer waits forever
    } catch (err) {
      console.error('Fatal error in startServer:', err);
      process.exit(1);
    }
  })();
}

export default app;