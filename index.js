// Webhook triggered automation...
exports.handleMessageWebhook = require('./src/lambdas/handle-message-webhook');
exports.processMessage = require('./src/lambdas/process-message');

// Polling triggered automation
exports.pollForMessages = require('./src/lambdas/poll-for-messages');
//exports.processDifferentMessage = ...