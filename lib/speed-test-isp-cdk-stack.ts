import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apiGateway from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam';

export class SpeedTestIspCdkStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        //create lambda to handle persisting results from api-gateway
        const saveResultsLambda = new lambda.Function(this, 'speed-test-isp-save-results', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'speed-test-isp-save-results.handler',
            code: lambda.Code.fromAsset('lambda')
        });
        //give lambda permission to add cloud watch metrics
        saveResultsLambda.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['cloudwatch:PutMetricData'],
            resources: ["*"]
        }));
        //create api gateway
        const api = new apiGateway.RestApi(this, 'speed-test-isp', {});
        const saveResultsLambdaIntegration = new apiGateway.LambdaIntegration(saveResultsLambda);
        const v1 = api.root.addResource('v1');
        const saveResults = v1.addResource('save-results');
        const echoMethod = saveResults.addMethod('POST', saveResultsLambdaIntegration, {apiKeyRequired: true});
        //create api key and usage plan
        const key = api.addApiKey('speed-test-isp-api-key');
        const plan = api.addUsagePlan('speed-test-isp-usage-plan', {
            name: 'speed-test-isp-save-result-key',
            apiKey: key,
            throttle: {
                rateLimit: 10,
                burstLimit: 2
            }
        });
        plan.addApiStage({
            stage: api.deploymentStage,
            throttle: [
                {
                    method: echoMethod,
                    throttle: {
                        rateLimit: 10,
                        burstLimit: 2
                    }
                }
            ]
        });
    }
}
