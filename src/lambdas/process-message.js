const debug = require('debug')('mycompany:services');
const { app1, app2, SlackLogger } = require('../helpers/bootstrap');
const { EntitySyncEnvironment } = require('../app1-app2-sync-entity');

let sync = new EntitySyncEnvironment(app1, app2);
let slackLogger = new SlackLogger(process.env.SLACK_WEBHOOK_URL, process.env.NODE_ENV || "AWS", "App1 Entities to App2");

/**
 * AWS Lambda Handler function which receives SQS notifications for App1 entity updates.
 * 
 * When configuring the triggering, make sure to set the batch size = 1 for the SQS lambda trigger. This 
 * ensures the lambda is invoked once per each item in the queue. Messages are automatically deleted
 * from the queue when the lambda returns successfully. If it throws an error, the message stays in the
 * the queue. Depending on the redrive policy, a number of successive errors will eventually result in the 
 * message being placed in a SQS dead letter queue (which should not require additional configuration here
 * because DLQ configuration is configured in AWS for the Queue redrive policy)
 * 
 * Environment variables:
 * - PROCESSING_MODE: must be 'active' otherwise no processing is performed and the handler returns null.
 * - GR8_ACCOUNT_ID: numeric Apigrate account id
 * - GR8_API_KEY: Apigrate api key
 * - SLACK_WEBHOOK_URL: transaction logging endpoint for Slack
 * - DEBUG: (optional) debug category
 * - LOG_LEVEL: (optional) transaction log level
 */
module.exports = async function (event, context) {
  let record = event.Records[0];
  let result = null;//from the processing function
  let entity_link = null;
  try {
    if (process.env.PROCESSING_MODE !== 'active') {
      debug(`Processing mode is not active.`);
      return null;
    }
    debug(`Received queued App1 data:\n${record.body}`);

    let entity = JSON.parse(record.body);
    entity_link = `https://go.app1.com/relationships/${entity.id}`;
    result = await sync.processEntity(entity);

    if (result.success) {
      await slackLogger.log(true,
        result.message,
        result.transcript,
        { messageId: record.messageId, entity_link: entity_link });
      return result;
    }

    throw new Error(result.error);

  } catch (ex) {
    console.error(ex);
    console.error(`Error processing App1 entity to App2. ${ex.message}`);
    await slackLogger.log(false,
      result ? `${result.message} ${result.error}` : ex.message,
      result ? result.transcript : ex.stack,
      { messageId: record.messageId, entity_link: entity_link });
    throw ex;//leaves the message in the queue.
  }
}
