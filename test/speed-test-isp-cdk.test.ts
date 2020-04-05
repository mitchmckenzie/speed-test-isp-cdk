import {expect as expectCDK, matchTemplate, MatchStyle, haveResource} from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import SpeedTestIspCdk = require('../lib/speed-test-isp-cdk-stack');

test('Speed Test ISP Test Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new SpeedTestIspCdk.SpeedTestIspCdkStack(app, 'SpeedTestIspStack');
    // THEN
    expectCDK(stack).to(haveResource('AWS::ApiGateway::RestApi', {
        Name: "speed-test-isp"
    }));
    expectCDK(stack).to(haveResource('AWS::Lambda::Function', {
        Handler: "speed-test-isp-save-results.handler"
    }));
    expectCDK(stack).to(haveResource('AWS::ApiGateway::UsagePlan', {
        Throttle: {
            BurstLimit: 2,
            RateLimit: 10
        }
    }));
    expectCDK(stack).to(haveResource('AWS::ApiGateway::UsagePlanKey', {
        KeyType: "API_KEY"
    }));
    expectCDK(stack).to(haveResource('AWS::ApiGateway::Stage', {
        StageName: "prod"
    }));
    expectCDK(stack).to(haveResource('AWS::ApiGateway::Resource', {
        PathPart: "v1"
    }));
    expectCDK(stack).to(haveResource('AWS::ApiGateway::Resource', {
        PathPart: "save-results"
    }));

});
