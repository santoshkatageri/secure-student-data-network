/**
 * aws-service.ts: Main service that interacts with the AWS APIs and SDKs
 */

import Amplify, { Auth } from "aws-amplify";
import AWS, { CloudFormation, CognitoIdentityServiceProvider, DynamoDB } from "aws-sdk";
import { filter } from "lodash/fp";
import awsmobile from "../aws-exports";
import ConnectionRequest from "../interfaces/connection-request";
import UserForm from "../interfaces/user-form";
import AWSAdapter from "./aws-adapter";

export default class AWSService {
  public static async configure() {
    Amplify.configure(awsmobile);
    AWS.config.update({
      credentials: await Auth.currentCredentials(),
      region: awsmobile.aws_project_region,
    });
    AWS.config.apiVersions = {
      cloudformation: "2010-05-15",
      cognitoidentityserviceprovider: "2016-04-18",
      dynamodb: "2012-08-10",
    };
  }

  public static async retrieveConnectionRequests({
    documentClient = new DynamoDB.DocumentClient(),
    type = "consumer",
  } = {}) {
    const params = {
      ExpressionAttributeNames: { "#type": "type" },
      ExpressionAttributeValues: { ":type": type },
      FilterExpression: "#type = :type",
      TableName: awsmobile.aws_dynamodb_table_schemas[0].tableName,
    };
    const connectionRequests = await documentClient.scan(params).promise();

    return connectionRequests.Items as ConnectionRequest[];
  }

  public static async saveConnectionRequest(
    connectionRequest: ConnectionRequest,
    { documentClient = new DynamoDB.DocumentClient() } = {},
  ) {
    const params = {
      Item: connectionRequest,
      TableName: awsmobile.aws_dynamodb_table_schemas[0].tableName,
    };
    return await documentClient.put(params).promise();
  }

  public static async availableStacks({ cloudFormation = new CloudFormation() } = {}) {
    const stackData = await cloudFormation.describeStacks().promise();

    if (stackData.Stacks) {
      const isNucleusStack = (stack: CloudFormation.Stack) =>
        stack.StackName.toLowerCase().startsWith("nucleus");

      return AWSAdapter.convertStacks(filter(isNucleusStack)(stackData.Stacks));
    }
  }

  public static async retrieveUsers({
    cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider(),
  } = {}) {
    const userData = await cognitoIdentityServiceProvider
      .listUsers({ UserPoolId: awsmobile.aws_user_pools_id })
      .promise();

    return userData.Users ? AWSAdapter.convertUsers(userData.Users) : [];
  }

  public static async createUser(
    userParams: UserForm,
    { cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider() } = {},
  ) {
    return await cognitoIdentityServiceProvider
      .adminCreateUser({
        DesiredDeliveryMediums: ["EMAIL"],
        TemporaryPassword: userParams.password,
        UserAttributes: [
          { Name: "email", Value: userParams.email },
          { Name: "name", Value: userParams.name },
          { Name: "phone_number", Value: userParams.phoneNumber },
          { Name: "email_verified", Value: "true" },
          { Name: "phone_number_verified", Value: "false" },
        ],
        UserPoolId: awsmobile.aws_user_pools_id,
        Username: userParams.username,
      })
      .promise();
  }

  public static async deleteUser(
    username: string,
    { cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider() } = {},
  ) {
    return await cognitoIdentityServiceProvider
      .adminDeleteUser({
        UserPoolId: awsmobile.aws_user_pools_id,
        Username: username,
      })
      .promise();
  }
}
