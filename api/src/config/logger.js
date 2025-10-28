const winston = require('winston');
const path = require('path');

const isVercel = !!process.env.VERCEL;
const isProduction = process.env.NODE_ENV === 'production';
const enableFileLogs = process.env.LOG_TO_FILES === 'true' && !isVercel; // never write files on Vercel

const logDir = path.join(process.cwd(), 'logs');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'duskpet-api' },
    transports: []
});

// Prefer console logging on Vercel and by default in production
logger.add(new winston.transports.Console({
    format: isProduction
        ? winston.format.json()
        : winston.format.combine(winston.format.colorize(), winston.format.simple())
}));

// Optionally add file transports only when explicitly enabled and not on Vercel
if (enableFileLogs) {
    logger.add(new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
    }));

    logger.add(new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5
    }));
}

module.exports = logger;
