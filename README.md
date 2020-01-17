# Summary

(Describe the overall automation context)

The following individual automation scenarios are currently in use:

## Automation Scenario: Automation 1

(Describe how triggered, what gets processed, and what the business process is.)

## Automation Scenario: Automation 2

(Describe how triggered, what gets processed, and what the business process is.)


## For Developers
The following section covers development, testing and code-deployment recommendations.

### AWS Setup

Each automation scenario is designed as a separte "serverless" application to be deployed on AWS. Each application has its own AWS template file, as defined in the `./templates` folder. The AWS services used are:

* API Gateway - for receiving webhooks
* Lambda - for NodeJS functions (both enqueue and processing)
* SQS - for enqueuing data (messages) to be processed
* SSM - for storing sensitive parameters
* S3 - staging of deployed code
* CloudWatch Logs - for logging

Generally the following strategies are used

#### When Application is Triggered by a Webhook...
When receiving webhooks, an API Gateway service is configured to receive the HTTP POST. A Lambda function parses the POST request, and places the request message in an SQS queue.

#### When Application Polls for Changes...
If not triggered by a webhook, the application polls for work to do. A Lambda function performs the polling, typically using an Apigrate API-stored account parameter as a "bookmark" to hold the last-updated timestamp. When messages are found, they are enqueued in an SQS queue.

#### Processing Enqueued Items
Lambda handlers are defined for each application which handle messages from their operation queue. 

#### System Manager Parameters

The following sensitive information is needed by the Lambda functions. It is stored stored globally in the AWS System Manager Parameter Store (SSM).

* Application 1 Private Key (parameter name: `APP1_PRIVATE_KEY`)
* Application 2 Access Token (parameter name: `APP2_ACCESS_TOKEN`)
* Apigrate account id (parameter name: `GR8_ACCOUNT_ID`)
* Apigrate API key (parameter name: `GR8_API_KEY`)
* Apigrate Slack webhook URL (parameter name: `GR8_SLACK_WEBHOOK_URL`)

> Note: These variables should **never** be stored in this or other Github repositories, or other source code control repositories.

### Prerequisites for AWS Development
It is highly recommended to use VSCode or an IDE that supports the AWS command line environment.
1. Docker must be installed and running on your machine.
1. The AWS CLI must be installed on your machine.
1. You should run `aws configure` to log in to AWS as the correct IAM user and region before running any AWS CLI operations.

### Defining Sample Events
Use test event files to test locally. These simulate the actual events that would be received from the event sources (SQS, API Gateway etc). You may find it useful to make API queries to pull entities you want to test with and then save them in separate event files. For example, for the Simple Queue Service, a sample event looks like this:

```json
{
  "Records": [
    {
      "messageId": "19dd0b57-b21e-4ac1-bd88-01bbb068cb78",
      "receiptHandle": "MessageReceiptHandle",
      "body": "{\"id\":64176143,\"created_at\":\"2019-07-25T21:33:24.673Z\",\"updated_at\":\"2019-09-11T20:07:29.687Z\",...omitted for brevity...}",
      "attributes": {
        "ApproximateReceiveCount": "1",
        "SentTimestamp": "1523232000000",
        "SenderId": "123456789012",
        "ApproximateFirstReceiveTimestamp": "1523232000001"
      },
      "messageAttributes": {},
      "md5OfBody": "7b270e59b47ff90a553787216d55d91d",
      "eventSource": "aws:sqs",
      "eventSourceARN": "arn:aws:sqs:us-east-1:123456789012:MyQueue",
      "awsRegion": "us-east-1"
    }
  ]
}
```
Note that the `body` parameter is a string that contains *stringified* JSON that you would process.

### Running Tests

To test a Lambda function as if it were deployed on AWS, use the `sam local invoke` command. 

```bash
sam local invoke -e my-event-file.json "lambdaName" -t template-file.yaml 
```

For example, to run the "tgVariantsToSortly" lambda (as defined in a `./templates/sam-tg2sortly-variants.yaml` SAM definition):

```bash
sam local invoke -e test/sqs-event-variant-update.json "tgVariantsToSortly" -t ./templates/sam-tg2sortly-variants.yaml
```

### Connecting a Debugger

Note, this section assumes you are using VSCode as your code editor.

#### Prerequisites

To debug your local session, you must have a launch configuration in VSCode that will connect the debugger to the running session in Docker.
First, add the following Launch Configuration in your Debug view (click the Gear icon).

```json
...
  {
    "name": "Attach to SAM CLI",
    "type": "node",
    "request": "attach",
    "address": "localhost",
    "port": 5858,
    "localRoot": "${workspaceRoot}",
    "remoteRoot": "/var/task",
    "protocol": "inspector",
    "stopOnEntry": false
  }
```
You only have to do this once.

Next, set a breakpoint in your lambda function.

Now, run the application locally as stated above, except with the added switch `--debug-port 5858`. For example:

```bash
sam local invoke -e test/sqs-event-variant-update.json "tgVariantsToSortly" -t ./templates/sam-tg2sortly-variants.yaml --debug-port 5858
```

As the Docker image starts, navigate over to the Debug view, and click to start the "Attach to SAM CLI"  Launch configuration. In a moment or two, the code will execute to your breakpoint and you'll be able to debug line by line as desired!

## How to Package and Deploy Applications
The AWS `sam package` CLI command creates an optimized template file that is subsequently used to deploy code:
```bash
sam package --template-file ./templates/sam-my-scenario.yaml --output-template-file package-my-scenario.yaml --s3-bucket codestage
```
> Note, in this example, an S3 bucket called "codestage" must have been created already.

To deploy the app to AWS you can use the `aws cloudformation deploy` CLI command.
```bash
aws cloudformation deploy --template-file package-my-scenario.yaml --stack-name my-scenario
```

For convenience, each automation scenario (application) can be deployed by using the appropriate script tasks in the `package.json` file. These npm scripts run the above commands for each scenario. For example, run this command to package the code (make it ready for deployment) for a scenario.
```bash 
npm package-my-scenario
``` 
Then, run the following command to deploy it to AWS.
```bash 
npm deploy-my-scenario
```

Each automation scenario has corresponding package and deploy script.


## Appendix

[App1 API](https://api.app1example.com)
