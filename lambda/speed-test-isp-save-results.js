const AWS = require("aws-sdk");
const CW = new AWS.CloudWatch();
const RESPONSE = {statusCode: 200,body: "Metrics Received!"};

exports.handler = async (event,context,callback) => {

    console.log("Received request to store new metrics : " + JSON.stringify(event));

    const version = "1_0";
    const namespace_prefix =  'SPEED_TEST_ISP_';
    const metrics = {Namespace: namespace_prefix + version, MetricData: []};
    const data = JSON.parse(event.body);
    const timestamp = data.timestamp;

    console.log("Http Body Data : " + JSON.stringify(data));

    const dimensions = [
       {Name: 'CUSTOMER_IP', Value: data.client.ip},
       {Name: 'CUSTOMER_NAME', Value: data.client.customer_name},
       {Name: 'CUSTOMER_ISP', Value: data.client.isp},
       {Name: 'TEST_SERVER_NAME', Value: data.server.name},
       {Name: 'TEST_SERVER_SPONSER', Value: data.server.sponsor},
       {Name: 'TEST_SERVER_HOST', Value: data.server.host}
    ];

    //build metrics data structure
    addMetric(metrics, "DOWNLOAD_BITS_PER_SECOND", dimensions, timestamp, "Bits/Second", data.download);
    addMetric(metrics, "UPLOAD_BITS_PER_SECOND", dimensions, timestamp, "Bits/Second", data.upload);
    addMetric(metrics, "LATENCY_MS", dimensions, timestamp, "Milliseconds", data.server.latency);
    addMetric(metrics, "BYTES_SENT", dimensions, timestamp, "Bytes", data.bytes_sent);
    addMetric(metrics, "BYTES_RECEIVED", dimensions, timestamp, "Bytes", data.bytes_received);

    //push metrics into cloud watch
    CW.putMetricData(metrics, function(err, data) {
        if (err) {
            console.log("Error Pushing Metrics to CloudWatch : ", err);
        } else {
            console.log("Success", JSON.stringify(data));
        }
    });

    //return static response
    return callback(null,RESPONSE);
};

function addMetric(metrics, metricName, dimensions, timestamp, unit, value) {
    const data = {
            MetricName: metricName,
            Dimensions: dimensions,
            Timestamp: timestamp,
            Unit: unit,
            Value: parseFloat(value)
        };
        console.log("Added New Metric : " + JSON.stringify(data));
        metrics.MetricData.push(data);
}