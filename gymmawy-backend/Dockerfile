FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for Prisma)
RUN npm ci

# Copy source code
COPY . .

# Create .env file with default values
RUN echo 'DATABASE_URL="postgresql://gymmawy:gymmawy123@db:5432/gymmawy_db"' > .env && \
    echo 'JWT_SECRET="a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"' >> .env && \
    echo 'JWT_REFRESH_SECRET="f6e5d4c3b2a1098765432109876543210987654321fedcba0987654321fedcba"' >> .env && \
    echo 'EMAIL_HOST="smtp.gmail.com"' >> .env && \
    echo 'EMAIL_PORT=587' >> .env && \
    echo 'EMAIL_USER="onboarding@resend.dev"' >> .env && \
    echo 'EMAIL_PASS="your-app-password"' >> .env && \
    echo 'PORT=5000' >> .env && \
    echo 'NODE_ENV=production' >> .env && \
    echo 'CORS_ORIGIN="http://5.189.152.130:3000"' >> .env

# Generate Prisma client
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p uploads/content/images uploads/content/videos uploads/content/documents uploads/payment-proofs uploads/temp

# Set environment variable for port
ENV PORT=5000

# Expose port 5000
EXPOSE 5000

# Create startup script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Start the application
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
