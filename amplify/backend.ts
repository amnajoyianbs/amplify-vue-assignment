import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { assetHandler } from './functions/asset-handler/resource';
import { assetApi } from './functions/asset-api/resource';
import { RestApi, LambdaIntegration, CognitoUserPoolsAuthorizer, Cors, AuthorizationType } from 'aws-cdk-lib/aws-apigateway';
import { LayerVersion, Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const backend = defineBackend({
  auth,
  data,
  storage,
  assetHandler,
  assetApi,
});

// Create Lambda Layer with dependencies
const dependenciesLayer = new LayerVersion(backend.stack, 'AssetApiDependenciesLayer', {
  code: Code.fromAsset(join(__dirname, 'functions/asset-api/layer')),
  compatibleRuntimes: [Runtime.NODEJS_20_X],
  description: 'Dependencies for asset-api function (sequelize, mysql2, aws-jwt-verify)',
});

// Add layer to Lambda function using CDK escape hatch
const cfnFunction = backend.assetApi.resources.lambda.node.defaultChild as any;
cfnFunction.addPropertyOverride('Layers', [dependenciesLayer.layerVersionArn]);

// Create API Gateway REST API
const api = new RestApi(backend.stack, 'AssetManagementApi', {
  restApiName: 'Asset Management API',
  description: 'API for asset management with Cognito authorization',
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: [
      'Content-Type',
      'X-Amz-Date',
      'Authorization',
      'X-Api-Key',
      'X-Amz-Security-Token',
    ],
    allowCredentials: true,
  },
  deployOptions: {
    stageName: 'prod',
  },
});

// Create Cognito Authorizer
const authorizer = new CognitoUserPoolsAuthorizer(backend.stack, 'CognitoAuthorizer', {
  cognitoUserPools: [backend.auth.resources.userPool],
  authorizerName: 'CognitoAuthorizer',
  identitySource: 'method.request.header.Authorization',
});

// Create Lambda Integration
const assetApiIntegration = new LambdaIntegration(backend.assetApi.resources.lambda, {
  proxy: true,
  allowTestInvoke: true,
});

// Define API routes
const assets = api.root.addResource('assets');

// GET /assets - List all assets
assets.addMethod('GET', assetApiIntegration, {
  authorizer,
  authorizationType: AuthorizationType.COGNITO,
});

// POST /assets - Create new asset
assets.addMethod('POST', assetApiIntegration, {
  authorizer,
  authorizationType: AuthorizationType.COGNITO,
});

// /assets/{id} routes
const assetById = assets.addResource('{id}');

// GET /assets/{id} - Get single asset
assetById.addMethod('GET', assetApiIntegration, {
  authorizer,
  authorizationType: AuthorizationType.COGNITO,
});

// PUT /assets/{id} - Update asset
assetById.addMethod('PUT', assetApiIntegration, {
  authorizer,
  authorizationType: AuthorizationType.COGNITO,
});

// DELETE /assets/{id} - Delete asset
assetById.addMethod('DELETE', assetApiIntegration, {
  authorizer,
  authorizationType: AuthorizationType.COGNITO,
});

// Output API Gateway URL
backend.addOutput({
  custom: {
    assetApiUrl: api.url,
  },
});
