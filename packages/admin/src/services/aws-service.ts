/**
 * aws-service.ts: Main service that interacts with the AWS APIs and SDKs
 */
import CloudFormation from "aws-sdk/clients/cloudformation";
import CloudWatchLogs from "aws-sdk/clients/cloudwatchlogs";
import CognitoIdentityServiceProvider from "aws-sdk/clients/cognitoidentityserviceprovider";
import DynamoDB from "aws-sdk/clients/dynamodb";
import { config } from "aws-sdk/global";
import { filter, map } from "lodash/fp";

import API from "@aws-amplify/api";
import Auth from "@aws-amplify/auth";
import Amplify from "@aws-amplify/core";

import awsconfiguration from "../aws-configuration";
import awsmobile from "../aws-exports";
import { Connection } from "../interfaces/connection";
import { ConnectionRequest, NewConnectionRequest } from "../interfaces/connection-request";
import UserForm from "../interfaces/user-form";
import AWSAdapter from "./aws-adapter";

export default class AWSService {
  public static async configure() {
    Amplify.configure({
      ...awsmobile,
      API: awsconfiguration.Api,
      Auth: awsconfiguration.Auth,
    });
    await AWSService.updateCredentials();
    config.apiVersions = {
      cloudformation: "2010-05-15",
      cloudwatchlogs: "2014-03-28",
      cognitoidentityserviceprovider: "2016-04-18",
      dynamodb: "2012-08-10",
    };
  }

  public static async updateCredentials() {
    config.update({
      credentials: await Auth.currentCredentials(),
      region: awsmobile.aws_project_region,
    });
  }

  public static async retrieveStreams(type: "input" | "output") {
    return AWSService.withCredentials(async () => {
      const documentClient = new DynamoDB.DocumentClient();
      const filterAttr = type === "input" ? "inputStreams" : "outputStreams";
      const items = await documentClient
        .scan({
          FilterExpression: `attribute_exists(${filterAttr}[0])`,
          TableName: awsconfiguration.Storage.nucleusConnections,
        })
        .promise();

      if (!items.Items) {
        return [];
      }

      return (items.Items as Connection[])
        .flatMap((e) =>
          e[filterAttr]!.map((ex) => ({
            channel: ex.channel,
            endpoint: e.endpoint,
            namespace: ex.namespace,
            status: ex.status,
          })),
        )
        .sort((a, b) =>
          `${a.endpoint}.${a.namespace}.${a.channel}`.localeCompare(
            `${a.endpoint}.${b.namespace}.${b.channel}`,
          ),
        );
    });
  }

  public static async retrieveConnectionRequests(type: "incoming" | "submitted") {
    const tableName =
      type === "incoming"
        ? awsconfiguration.Storage.nucleusIncomingConnectionRequests
        : awsconfiguration.Storage.nucleusConnectionRequests;

    return AWSService.withCredentials(async () => {
      const documentClient = new DynamoDB.DocumentClient();
      const connectionRequests = await documentClient
        .scan({
          TableName: tableName,
        })
        .promise();

      return (connectionRequests.Items as ConnectionRequest[]).sort(
        (a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime(),
      );
    });
  }

  public static async updateStream(
    endpoint: string,
    channel: string,
    namespace: string,
    status: "active" | "paused",
    type: "input" | "output",
  ) {
    return AWSService.withCredentials(async () => {
      const response = await API.post("ExchangeApiSigv4", "/connections/streams/update", {
        body: {
          channel,
          endpoint,
          namespace,
          notify: true,
          status,
          type,
        },
      });
      return response as ConnectionRequest;
    });
  }

  public static async saveConnectionRequest(
    connectionRequest: NewConnectionRequest,
  ): Promise<ConnectionRequest> {
    return AWSService.withCredentials(async () => {
      const response = await API.post("ExchangeApi", "/connections/requests", {
        body: connectionRequest,
      });
      return response as ConnectionRequest;
    });
  }

  public static async submitConnectionRequest(id: string) {
    return AWSService.withCredentials(async () => {
      return await API.post("ExchangeApi", `/connections/requests/${id}/send`, {});
    });
  }

  public static async deleteConnectionRequest(id: string) {
    return AWSService.withCredentials(async () => {
      const documentClient = new DynamoDB.DocumentClient();
      const params = { Key: { id }, TableName: awsconfiguration.Storage.nucleusConnectionRequests };

      return await documentClient.delete(params).promise();
    });
  }

  public static async acceptConnectionRequest(endpoint: string, id: string, accepted: boolean) {
    return AWSService.withCredentials(async () => {
      const response = await API.post("ExchangeApi", "/connections/incoming-requests/accept", {
        body: {
          accepted,
          endpoint,
          id,
        },
      });
      return response as ConnectionRequest;
    });
  }

  public static async retrieveStacks() {
    return AWSService.withCredentials(async () => {
      const cloudFormation = new CloudFormation();
      const stackData = await cloudFormation.describeStacks().promise();

      if (stackData.Stacks) {
        const isNucleusStack = (stack: CloudFormation.Stack) =>
          stack.StackName.toLowerCase().startsWith(awsconfiguration.Auth.stackName.toLowerCase());

        return AWSAdapter.convertStacks(filter(isNucleusStack)(stackData.Stacks));
      }
    });
  }

  public static async retrieveLogGroups() {
    return AWSService.withCredentials(async () => {
      const cloudWatchLogs = new CloudWatchLogs();
      const logGroupsData = await cloudWatchLogs
        .describeLogGroups({ logGroupNamePrefix: `/aws/lambda/${awsconfiguration.Auth.stackName}` })
        .promise();

      return map("logGroupName")(logGroupsData.logGroups);
    });
  }

  public static async retrieveLogEvents(logGroup: string) {
    return AWSService.withCredentials(async () => {
      const cloudWatchLogs = new CloudWatchLogs();
      const streamsData = await cloudWatchLogs
        .describeLogStreams({ logGroupName: logGroup, orderBy: "LastEventTime", descending: true })
        .promise();
      const eventsData = await cloudWatchLogs
        .getLogEvents({
          logGroupName: logGroup,
          logStreamName: streamsData.logStreams![0].logStreamName!,
          startFromHead: true,
        })
        .promise();

      return eventsData.events ? AWSAdapter.convertLogEvents(eventsData.events) : [];
    });
  }

  public static async retrieveUsers() {
    return AWSService.withCredentials(async () => {
      const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider();
      const userData = await cognitoIdentityServiceProvider
        .listUsers({ UserPoolId: awsconfiguration.Auth.userPoolId })
        .promise();

      return userData.Users ? AWSAdapter.convertUsers(userData.Users) : [];
    });
  }

  public static async createUser(userParams: UserForm) {
    return AWSService.withCredentials(async () => {
      const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider();
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
          UserPoolId: awsconfiguration.Auth.userPoolId,
          Username: userParams.username,
        })
        .promise();
    });
  }

  public static async deleteUser(username: string) {
    return AWSService.withCredentials(async () => {
      const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider();
      return await cognitoIdentityServiceProvider
        .adminDeleteUser({
          UserPoolId: awsconfiguration.Auth.userPoolId,
          Username: username,
        })
        .promise();
    });
  }

  private static async withCredentials(request: () => Promise<any>) {
    try {
      try {
        return await request();
      } catch (error) {
        if (error.code && error.code === "CredentialsError") {
          await AWSService.updateCredentials();
          return await request();
        } else {
          throw error;
        }
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        throw new Error(error.response.data.errors[0].detail);
      }
      throw new Error(`An unexpected error occurred: ${error.message}`);
    }
  }
}
