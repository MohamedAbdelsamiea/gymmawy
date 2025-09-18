import { body, validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Security headers middleware
export const addSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
};

// Request body sanitization
export const sanitizeRequestBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = DOMPurify.sanitize(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };
    sanitizeObject(req.body);
  }
  next();
};

// SQL injection prevention
export const preventSqlInjection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(\b(OR|AND)\s+['"]\s*=\s*['"])/gi,
    /(\bUNION\s+SELECT\b)/gi,
    /(\bDROP\s+TABLE\b)/gi,
    /(\bINSERT\s+INTO\b)/gi,
    /(\bDELETE\s+FROM\b)/gi,
    /(\bUPDATE\s+SET\b)/gi
  ];

  const checkForSqlInjection = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        for (const pattern of sqlPatterns) {
          if (pattern.test(obj[key])) {
            return true;
          }
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkForSqlInjection(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (req.body && checkForSqlInjection(req.body)) {
    return res.status(400).json({
      error: {
        message: 'Invalid request data detected',
        code: 'SECURITY_VIOLATION'
      }
    });
  }

  if (req.query && checkForSqlInjection(req.query)) {
    return res.status(400).json({
      error: {
        message: 'Invalid query parameters detected',
        code: 'SECURITY_VIOLATION'
      }
    });
  }

  next();
};

// XSS prevention
export const preventXss = (req, res, next) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
    /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi
  ];

  const checkForXss = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        for (const pattern of xssPatterns) {
          if (pattern.test(obj[key])) {
            return true;
          }
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkForXss(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (req.body && checkForXss(req.body)) {
    return res.status(400).json({
      error: {
        message: 'Potentially malicious content detected',
        code: 'XSS_VIOLATION'
      }
    });
  }

  next();
};

// Request size validation
export const validateRequestSize = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const contentLength = parseInt((req.headers && req.headers['content-length']) || '0');
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: {
        message: 'Request entity too large',
        code: 'REQUEST_TOO_LARGE'
      }
    });
  }
  
  next();
};

// Security event logging
export const logSecurityEvents = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log security-related responses
    if (res.statusCode >= 400) {
      console.log(`[SECURITY] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')}`);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};
