// TODO remove/replace with actual code
const tempFunction = async (event, context) => {
  /* eslint-disable no-console */
  console.log(event);
  /* eslint-disable no-console */
  console.log(context);
};

exports.handler = async (event, context) => {
  try {
    // TODO replace this with actual function to call
    await tempFunction(event, context);
    return {
      body: JSON.stringify("Hello world!"),
      statusCode: 200,
    };
  } catch (error) {
    /* eslint-disable no-console */
    console.log(error); // TODO remove or replace with logger
    return {
      body: JSON.stringify("Goodbye world :("),
      statusCode: 500,
    };
  }
};

var LambdaForwarder = require("aws-lambda-ses-forwarder");

exports.handler = function(event, context, callback) {
    var overrides = {
        config: {
            fromEmail: process.env.EMAIL_FROM,
            emailBucket: process.env.EMAIL_BUCKET_NAME,
            emailKeyPrefix: process.env.EMAIL_BUCKET_PATH,
            forwardMapping: JSON.parse(process.env.EMAIL_MAPPING)
        }
    };
    LambdaForwarder.handler(event, context, callback, overrides);
};
