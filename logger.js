const winston = require('winston');
require('winston-daily-rotate-file');
const { Mail } = require('winston-mail');

const logger = new winston.createLogger({
  level: 'silly',
  format: winston.format.simple(),
  transports: [
    new winston.transports.DailyRotateFile({ 
      filename: process.env.LOG_PATH + "/%DATE%.log", 
      level: process.env.LOG_LEVEL,
      handleExceptions: true,
      humanReadableUnhandledException: true,
    })
  ],
  exitOnError: false
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({  all: true }),
          winston.format.simple()
        ),
        handleExceptions : false
    }));
} 

logger.add(new Mail({
  to: [process.env.TO_EMAIL],
  from: process.env.FROM_EMAIL,
  subject: process.env.MAIL_SUBJECT,
  host: process.env.SMTP_HOST,
  username: process.env.GMAIL_USERNAME,
  password: process.env.GMAIL_PASSWORD,
  ssl: true,
  prettyPrint: true,
  html: true,
  level: process.env.MAIL_LOG_LEVEL
}));

module.exports = logger;
