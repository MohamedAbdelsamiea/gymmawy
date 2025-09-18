import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { rateLimiter } from "./middlewares/rateLimiter.js";
import { requireAuth } from "./middlewares/authMiddleware.js";
import { checkFileAccess, serveSecureFile } from "./middlewares/fileAccessMiddleware.js";
import { 
  addSecurityHeaders, 
  sanitizeRequestBody, 
  preventSqlInjection, 
  preventXss,
  validateRequestSize,
  logSecurityEvents
} from "./middlewares/securityMiddleware.js";
import { requestLogger, errorLogger } from "./utils/logger.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";
import couponRoutes from "./modules/coupons/coupon.routes.js";
import leadRoutes from "./modules/leads/lead.routes.js";
import subscriptionRoutes from "./modules/subscriptions/subscription.routes.js";
import programmeRoutes from "./modules/programmes/programme.routes.js";
import cmsRoutes from "./modules/cms/cms.routes.js";
import shippingRoutes from "./modules/shipping/shipping.routes.js";
import referralRoutes from "./modules/referrals/referral.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import imageRoutes from "./modules/images/image.routes.js";
import videoRoutes from "./modules/videos/video.routes.js";
import uploadRoutes from "./modules/uploads/upload.routes.js";

const app = express();

app.set("trust proxy", 1);

// Security middleware (order matters!)
app.use(helmet());
app.use(addSecurityHeaders);
app.use(compression());
app.use(cors({ 
  origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000", "http://localhost:5173"], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));
app.use(validateRequestSize);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || (() => {
  console.warn("WARNING: Using default cookie secret. Set COOKIE_SECRET environment variable in production!");
  return "change-me";
})()));

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(requestLogger);
app.use(logSecurityEvents);

// Security validation
app.use(preventSqlInjection);
app.use(preventXss);
app.use(sanitizeRequestBody);

// Rate limiting
app.use(rateLimiter);

app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString()
  });
});

// Mount all routes according to new structure
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/programmes", programmeRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/uploads", uploadRoutes);

// Serve static files from uploads directory with CORS headers and access control
app.use("/uploads", (req, res, next) => {
  // Set CORS headers for static files
  const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || ["*"];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes("*") || (origin && allowedOrigins.includes(origin))) {
    res.header('Access-Control-Allow-Origin', origin || allowedOrigins[0]);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Check if accessing private files or sensitive files
  if (req.path.startsWith('/private/') || req.path.startsWith('/payment-proofs/')) {
    // For private files and payment proofs, require authentication and file access check
    return requireAuth(req, res, (err) => {
      if (err) return next(err);
      return checkFileAccess(req, res, (err) => {
        if (err) return next(err);
        return serveSecureFile(req, res, next);
      });
    });
  }
  
  next();
}, express.static("uploads"));

// Serve public assets (plans, etc.) with CORS headers
app.use('/assets', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static("public/assets"));

// Error handling (must be last)
app.use(errorLogger);

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (error.message === 'Only image files (JPEG, PNG, GIF, WebP) are allowed') {
    return res.status(400).json({ 
      error: { message: error.message } 
    });
  }
  
  if (error.message === 'File too large. Maximum size is 10MB.') {
    return res.status(400).json({ 
      error: { message: error.message } 
    });
  }
  
  if (error.message === 'Too many files. Only one file allowed.') {
    return res.status(400).json({ 
      error: { message: error.message } 
    });
  }
  
  res.status(error.status || 500).json({
    error: {
      message: isDevelopment ? error.message : 'Internal server error',
      ...(isDevelopment && { stack: error.stack })
    }
  });
});

export default app;

