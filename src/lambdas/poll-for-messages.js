const debug = require('debug')('michals:services');
const { app1, gr8AccountApi } = require('../helpers/bootstrap');
const { Poller } = require('../helpers/poller');
const { SQS } = require('aws-sdk');

let poller = new Poller(app1, gr8AccountApi);
let sqs = new SQS({ apiVersion: '2012-11-05' });

/**
 * AWS Lambda Handler function which polls for entity updates.
 * 
 * Environment variables:
 * - POLLING_MODE: must be 'active' otherwise no polling is performed.
 * - GR8_ACCOUNT_ID: numeric Apigrate account id
 * - GR8_API_KEY: Apigrate api key
 * - SQS_URL: sqs queue where data is deposited
 * - DEBUG: (optional) debug category
 * 
 * Note the event and context parameters are not used. This lambda can be triggered
 * by API Gateway or by a CloudWatch Events Rule if desired.
 */
module.exports = async function (event, context) {

  let apiResponse = {};
  try {
    if (process.env.POLLING_MODE === 'active') {
      debug(`Checking for updates...`);
      let pollResults = await poller.pollForChanges();

      // assuming a hypothetical account entity
      debug(`Detected ${pollResults.accounts.length} updates.`);
      for (let account of pollResults.accounts) {
        try {
          
          //enqueue each stock transfer in a queue.
          await sqs.sendMessage({
            MessageBody: JSON.stringify(account),
            QueueUrl: process.env.SQS_URL,
            DelaySeconds: 0,
          }).promise();

        } catch (ex) {
          console.error(ex);
        }
      }

      if (pollResults.accounts) {
        apiResponse.count = pollResults.accounts.length;
      }
    } else {
      debug(`Polling is paused. Retrieval queries are not being executed.`)
    }
    return apiResponse;

  } catch (ex) {
    console.error(ex);
    console.error(`Error polling for updates. ${ex.message}`);
    throw ex;
  }
}
