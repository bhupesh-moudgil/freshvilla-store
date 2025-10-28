const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

const initSentry = (app) => {
  if (!process.env.SENTRY_DSN) {
    console.log('⚠️  Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Set sampling rate for profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Attach stack traces
    attachStacktrace: true,
    
    // Filter out health check requests
    beforeSend(event, hint) {
      const url = event.request?.url || '';
      
      // Don't send health check errors
      if (url.includes('/health')) {
        return null;
      }
      
      // Filter out specific errors if needed
      const error = hint.originalException;
      if (error && error.message && error.message.includes('ECONNRESET')) {
        return null;
      }
      
      return event;
    },
  });

  console.log('✅ Sentry initialized for error tracking');
};

// Express middleware
const requestHandler = () => Sentry.Handlers.requestHandler();
const tracingHandler = () => Sentry.Handlers.tracingHandler();
const errorHandler = () => Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Capture all 4xx and 5xx errors
    return error.status >= 400;
  },
});

// Manual error capture
const captureException = (error, context = {}) => {
  Sentry.withScope((scope) => {
    Object.keys(context).forEach((key) => {
      scope.setContext(key, context[key]);
    });
    Sentry.captureException(error);
  });
};

// Manual message capture
const captureMessage = (message, level = 'info', context = {}) => {
  Sentry.withScope((scope) => {
    Object.keys(context).forEach((key) => {
      scope.setContext(key, context[key]);
    });
    Sentry.captureMessage(message, level);
  });
};

module.exports = {
  initSentry,
  requestHandler,
  tracingHandler,
  errorHandler,
  captureException,
  captureMessage,
};
