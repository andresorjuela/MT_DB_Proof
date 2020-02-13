//App1
const App1 = null; //require('app1');
exports.app1 = new App1({ apiToken: process.env.APP1_API_KEY });

//other app connectors here...

//Apigrate Account API
const { AccountApi } = require('@apigrate/sdk');
exports.gr8AccountApi = new AccountApi(process.env.GR8_ACCOUNT_ID, process.env.GR8_API_KEY);

//Apigrate Slack Logger
exports.SlackLogger = require('@apigrate/slack');