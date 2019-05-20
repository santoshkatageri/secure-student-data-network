import APIGateway from "aws-sdk/clients/apigateway";
import CloudFormation from "aws-sdk/clients/cloudformation";
import DynamoDB from "aws-sdk/clients/dynamodb";
import IAM from "aws-sdk/clients/iam";
import Kinesis from "aws-sdk/clients/kinesis";
import Lambda from "aws-sdk/clients/lambda";

import { readEnv } from "./helpers/app-helper";

export function getDocumentClient(clientSettings = {}) {
  return new DynamoDB.DocumentClient(
    Object.assign(
      {
        apiVersion: "2012-08-10",
        endpoint: readEnv("NUCLEUS_DYNAMODB_ENDPOINT", undefined),
      },
      clientSettings,
    ),
  );
}

export function getApiGateway(clientSettings = {}) {
  return new APIGateway(
    Object.assign(
      {
        apiVersion: "2015-07-09",
        endpoint: readEnv("NUCLEUS_API_GATEWAY_ENDPOINT", undefined),
      },
      clientSettings,
    ),
  );
}

export function getIam(clientSettings = {}) {
  return new IAM(
    Object.assign(
      {
        apiVersion: "2010-05-08",
        endpoint: readEnv("NUCLEUS_IAM_ENDPOINT", undefined),
      },
      clientSettings,
    ),
  );
}

export function getCloudFormation(clientSettings = {}) {
  return new CloudFormation(
    Object.assign(
      {
        apiVersion: "2010-05-15",
        endpoint: readEnv("NUCLEUS_CLOUDFORMATION_ENDPOINT", undefined),
      },
      clientSettings,
    ),
  );
}

export function getKinesis(clientSettings = {}) {
  return new Kinesis(
    Object.assign(
      {
        apiVersion: "2013-12-02",
        endpoint: readEnv("NUCLEUS_KINESIS_ENDPOINT", undefined),
      },
      clientSettings,
    ),
  );
}

export function getLambda(clientSettings = {}) {
  return new Lambda(
    Object.assign(
      {
        apiVersion: "2015-03-31",
        endpoint: readEnv("NUCLEUS_LAMBDA_ENDPOINT", undefined),
      },
      clientSettings,
    ),
  );
}