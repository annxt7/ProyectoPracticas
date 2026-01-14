const corsMiddleware = require('./cors');
const helmetMiddleware = require('./helmet');
const rateLimitMiddleware = require('./rateLimit');
const hpp = require('hpp');

module.exports = (app) => {
    app.use(corsMiddleware);
    app.use(helmetMiddleware);
    app.use(rateLimitMiddleware);
    app.use(hpp());
};