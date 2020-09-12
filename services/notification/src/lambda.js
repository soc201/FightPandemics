//// TODO remove/replace with actual code
//const tempFunction = async (event, context) => {
//  /* eslint-disable no-console */
//  console.log(event);
//  /* eslint-disable no-console */
//  console.log(context);
//};
//
//exports.handler = async (event, context) => {
//  try {
//    // TODO replace this with actual function to call
//    await tempFunction(event, context);
//    return {
//      body: JSON.stringify("Hello world!"),
//      statusCode: 200,
//    };
//  } catch (error) {
//    /* eslint-disable no-console */
//    console.log(error); // TODO remove or replace with logger
//    return {
//      body: JSON.stringify("Goodbye world :("),
//      statusCode: 500,
//    };
//  }
//};

function parseSqsBodyMessage(sqsRecord) {
    const body = sqsRecord && sqsRecord.body;
    let result = {};
    try {
        result = JSON.parse(body);
    } catch (ex) {
        console.error('Error parsing sqs message body: ', ex);
    }

    return result;
}

exports.handler = async (event, context) =>  {
    const records = event['Records'] || [];

    const errorRecords = records.filter((record) => {
        const bodyMessage = parseSqsBodyMessage(record);
        return bodyMessage.type === 'ERROR';
    });

    if (errorRecords.length > 0) {
        throw new Error('Received error from SQS message body');
    }

    console.log('FP SQS Records: ', JSON.stringify(records, null, 4));
}
