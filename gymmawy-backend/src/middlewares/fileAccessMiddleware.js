import { getPrismaClient } from "../config/db.js";
import path from "path";
import fs from "fs";

const prisma = getPrismaClient();

/**
 * Middleware to check if user has permission to access a specific file
 * This adds an extra layer of security beyond just authentication
 */
export const checkFileAccess = async (req, res, next) => {
  try {
    const filePath = req.path;
    const userId = req.user?.id;

    // For payment proof files, check if user has access
    if (filePath.startsWith('/payment-proofs/')) {
      const fileName = path.basename(filePath);
      
      // Check if this payment proof belongs to the user or if user is admin
      const payment = await prisma.payment.findFirst({
        where: {
          OR: [
            { paymentProofUrl: { contains: fileName } },
            { paymentProofUrl: { contains: filePath } }
          ]
        },
        include: {
          user: true
        }
      });

      if (!payment) {
        return res.status(404).json({ error: { message: "File not found" } });
      }

      // Check if user owns this payment or is admin
      if (payment.userId !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: { message: "Access denied" } });
      }
    }

    // For private files, check ownership
    if (filePath.startsWith('/private/')) {
      const fileName = path.basename(filePath);
      
      // Check if this private file belongs to the user or if user is admin
      const privateFile = await prisma.upload.findFirst({
        where: {
          OR: [
            { url: { contains: fileName } },
            { url: { contains: filePath } }
          ]
        }
      });

      if (!privateFile) {
        return res.status(404).json({ error: { message: "File not found" } });
      }

      // Check if user owns this file or is admin
      if (privateFile.userId !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: { message: "Access denied" } });
      }
    }

    next();
  } catch (error) {
    console.error('File access check error:', error);
    return res.status(500).json({ error: { message: "Internal server error" } });
  }
};

/**
 * Middleware to serve files with proper headers and security
 */
export const serveSecureFile = (req, res, next) => {
  try {
    const filePath = path.join(process.cwd(), 'uploads', req.path);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: { message: "File not found" } });
    }

    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: { message: "Error reading file" } });
      }
    });

  } catch (error) {
    console.error('File serving error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: { message: "Internal server error" } });
    }
  }
};
