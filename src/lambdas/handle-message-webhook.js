const debug = require('debug')('mycompany:services');
const { app1, SlackLogger } = require('../helpers/bootstrap');
const { SQS } = require('aws-sdk');

let slackLogger = new SlackLogger(process.env.SLACK_WEBHOOK_URL, process.env.NODE_ENV || "AWS", "App1 Webhook Handler");
let sqs = new SQS({ apiVersion: '2012-11-05' });

/**
 * AWS Lambda Handler function which receives API Gateway webhook notifications for ...
 */
module.exports = async function (event, context) {
  let payload = null;
  let result = null;//from the processing function
  let entity_link = null;
  try {
    payload = JSON.parse(event.body);
    debug(`Received webhook payload:\n${payload}`);

    // Configure the entity_link for convenient debugging.
    entity_link = `https://app1.api.com/${payload.object_id}`;

    //Get the full entity if you need to.
    result = await app1.get(`/entities/${payload.object_id}`);
    let entity = result.entity;

    //enqueue each entity in a queue.
    await sqs.sendMessage({
      MessageBody: JSON.stringify(entity),
      QueueUrl: process.env.QUEUE_URL,
      DelaySeconds: 0,
    }).promise();

    await slackLogger.log(true,
      'Enqueued ok.',
      null,
      { id: payload.object_id, entity_link: entity_link });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: ""
    };

  } catch (ex) {
    console.error(ex);
    console.error(`Error handling webhook. ${ex.message}`);
    await slackLogger.log(false,
      ex.message,
      ex.stack,
      { company_id: payload.object_id, entity_link: entity_link });
    throw ex;//leaves the message in the queue.
  }
}
