import { Currency } from '@prisma/client';

/**
 * Currency detection middleware based on user location
 * Egypt -> EGP, Saudi Arabia -> SAR, UAE -> AED, Others -> USD
 */
export function currencyDetectionMiddleware(req, res, next) {
  try {
    // Get currency from various sources (in order of priority)
    let currency = getCurrencyFromRequest(req);
    
    // Set currency in request object for use in controllers
    req.currency = currency;
    
    // Set currency in response headers for frontend
    res.set('X-Currency', currency);
    
    next();
  } catch (error) {
    console.error('Currency detection error:', error);
    // Fallback to EGP if detection fails (since this is primarily an Egyptian service)
    req.currency = Currency.EGP;
    res.set('X-Currency', Currency.EGP);
    next();
  }
}

/**
 * Extract currency from request using multiple detection methods
 */
function getCurrencyFromRequest(req) {
  // 1. Check if currency is explicitly set in query params or headers
  const explicitCurrency = req.query.currency || req.headers['x-currency'];
  if (explicitCurrency && Object.values(Currency).includes(explicitCurrency)) {
    return explicitCurrency;
  }
  
  // 2. Check user's stored preference (if authenticated)
  if (req.user?.preferredCurrency) {
    return req.user.preferredCurrency;
  }
  
  // 3. Detect from IP geolocation
  const currencyFromIP = detectCurrencyFromIP(req);
  if (currencyFromIP) {
    return currencyFromIP;
  }
  
  // 4. Detect from Accept-Language header
  const currencyFromLanguage = detectCurrencyFromLanguage(req);
  if (currencyFromLanguage) {
    return currencyFromLanguage;
  }
  
  // 5. Default to EGP (since this is primarily an Egyptian service)
  return Currency.EGP;
}

/**
 * Detect currency from IP address using geolocation
 */
function detectCurrencyFromIP(req) {
  try {
    // Get IP address from various sources
    const ip = getClientIP(req);
    
    if (!ip || ip === '127.0.0.1' || ip === '::1') {
      return null; // Skip localhost
    }
    
    // Use a simple IP-to-country mapping for common cases
    // In production, you might want to use a service like MaxMind GeoIP2
    const countryCode = getCountryFromIP(ip);
    
    switch (countryCode) {
      case 'EG': return Currency.EGP;
      case 'SA': return Currency.SAR;
      case 'AE': return Currency.AED;
      default: return null;
    }
  } catch (error) {
    console.error('IP geolocation error:', error);
    return null;
  }
}

/**
 * Detect currency from Accept-Language header
 */
function detectCurrencyFromLanguage(req) {
  try {
    const acceptLanguage = req.headers['accept-language'] || '';
    
    // Check for Arabic language (common in EGP, SAR, AED regions)
    if (acceptLanguage.includes('ar')) {
      // Default to EGP for Arabic, but this is less reliable
      return Currency.EGP;
    }
    
    return null;
  } catch (error) {
    console.error('Language detection error:', error);
    return null;
  }
}

/**
 * Get client IP address from request
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip;
}

/**
 * Simple IP-to-country mapping (for demo purposes)
 * In production, use MaxMind GeoIP2 or similar service
 */
function getCountryFromIP(ip) {
  // This is a simplified mapping for demo purposes
  // In production, you should use a proper geolocation service
  
  // Check if IP is in Egypt range (simplified)
  if (ip.startsWith('41.') || ip.startsWith('197.')) {
    return 'EG';
  }
  
  // Check if IP is in Saudi Arabia range (simplified)
  if (ip.startsWith('5.') || ip.startsWith('46.')) {
    return 'SA';
  }
  
  // Check if IP is in UAE range (simplified)
  if (ip.startsWith('31.') || ip.startsWith('37.')) {
    return 'AE';
  }
  
  // For demo purposes, you can also check against known IP ranges
  // In production, use MaxMind GeoIP2 database
  
  return null;
}

/**
 * Currency detection service for frontend
 */
export async function detectCurrencyService(req) {
  try {
    const currency = getCurrencyFromRequest(req);
    
    return {
      success: true,
      currency,
      detectedFrom: getDetectionSource(req, currency),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Currency detection service error:', error);
    return {
      success: false,
      currency: Currency.USD,
      error: 'Failed to detect currency',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get the source of currency detection for debugging
 */
function getDetectionSource(req, currency) {
  if (req.query.currency || req.headers['x-currency']) {
    return 'explicit';
  }
  if (req.user?.preferredCurrency) {
    return 'user_preference';
  }
  if (getCountryFromIP(getClientIP(req))) {
    return 'ip_geolocation';
  }
  if (req.headers['accept-language']?.includes('ar')) {
    return 'language_header';
  }
  return 'default';
}
