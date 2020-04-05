#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SpeedTestIspCdkStack } from '../lib/speed-test-isp-cdk-stack';

const app = new cdk.App();
new SpeedTestIspCdkStack(app, 'SpeedTestIspCdkStack');
