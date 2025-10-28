// Vercel serverless entrypoint: re-export the Express app
const app = require('../src/app');
module.exports = app;
