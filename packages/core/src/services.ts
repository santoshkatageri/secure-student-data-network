import Kinesis from "aws-sdk/clients/kinesis";

import {
  getApiGateway,
  getCloudFormation,
  getDocumentClient,
  getIam,
  getKinesis,
  getLambda,
  getS3,
  getSts,
} from "./aws-clients";
import { readEnv } from "./helpers/app-helper";
import { Connection } from "./interfaces/connection";
import DynamoConnectionRepository from "./repositories/dynamo-connection-repository";
import DynamoConnectionRequestRepository from "./repositories/dynamo-connection-request-repository";
import DynamoFormatRepository from "./repositories/dynamo-format-repository";
import KinesisEventRepository from "./repositories/kinesis-event-repository";
import ApiGatewayService from "./services/api-gateway-service";
import AwsConnectionRequestService from "./services/aws-connection-request-service";
import AwsConnectionService from "./services/aws-connection-service";
import AwsEventRouter from "./services/aws-event-router";
import AwsExchangeService from "./services/aws-exchange-service";
import AwsNucleusMetadataService from "./services/aws-nucleus-metadata-service";
import ExternalNucleusMetadataService from "./services/external-nucleus-metadata-service";
import IamService from "./services/iam-service";
import LambdaService from "./services/lambda-service";
import S3TransferService from "./services/s3-transfer-service";
import TemporaryCredentialsFactory from "./services/temporary-credentials-factory";
import UploadCredentialsService from "./services/upload-credentials-service";

const CONTAINER_CACHE: { [k: string]: any } = {};

function singleton<T>(key: string, builder: () => T): T {
  let cachedObj = CONTAINER_CACHE[key];
  if (cachedObj) {
    return cachedObj;
  }
  cachedObj = CONTAINER_CACHE[key] = builder();
  return cachedObj;
}

export function getConnectionRepository() {
  return singleton(
    "DynamoConnectionRepository",
    () => new DynamoConnectionRepository(getMetadataService(), getDocumentClient()),
  );
}

export function getConnectionRequestRepository() {
  return singleton(
    "DynamoConnectionRequestRepository",
    () => new DynamoConnectionRequestRepository(getMetadataService(), getDocumentClient()),
  );
}

export function getEventRepository() {
  return singleton(
    "KinesisEventRepository",
    () => new KinesisEventRepository(getMetadataService(), getKinesis()),
  );
}

export function getIamService() {
  return singleton("IamService", () => new IamService(getIam()));
}

export function getApiGatewayService() {
  return singleton("ApiGatewayService", () => new ApiGatewayService(getApiGateway()));
}

export function getLambdaService() {
  return singleton("LambdaService", () => new LambdaService(getLambda()));
}

export function getExchangeService() {
  return singleton(
    "AwsExchangeService",
    () =>
      new AwsExchangeService(
        getMetadataService(),
        getTemporaryCredentialsFactory(),
        getExternalEventRepository,
      ),
  );
}

export function getMetadataService() {
  return singleton(
    "AwsNucleusMetadataService",
    () => new AwsNucleusMetadataService(getCloudFormation(), readEnv("NUCLEUS_STACK_ID")),
  );
}

export function getConnectionRequestService() {
  return singleton(
    "AwsConnectionRequestService",
    () =>
      new AwsConnectionRequestService(
        getConnectionRequestRepository(),
        getMetadataService(),
        getExchangeService(),
        getLambdaService(),
      ),
  );
}

export function getConnectionService() {
  return singleton(
    "AwsConnectionService",
    () =>
      new AwsConnectionService(
        getConnectionRepository(),
        getConnectionRequestRepository(),
        getConnectionRequestService(),
        getExchangeService(),
        getIamService(),
        getMetadataService(),
      ),
  );
}

export function getEventRouter() {
  return new AwsEventRouter(getConnectionRepository(), getExchangeService());
}

export function getExternalEventRepository(
  metadataParams: ConstructorParameters<typeof ExternalNucleusMetadataService>,
  kinesisParams: ConstructorParameters<typeof Kinesis>,
) {
  return new KinesisEventRepository(
    getExternalMetadataService(...metadataParams),
    getKinesis(...kinesisParams),
  );
}

export function getTemporaryCredentialsFactory() {
  return new TemporaryCredentialsFactory();
}

export function getExternalMetadataService(connection: Connection) {
  return new ExternalNucleusMetadataService(connection);
}

export function getS3TransferService() {
  return new S3TransferService(getMetadataService(), getS3, getTemporaryCredentialsFactory());
}

export function getUploadCredentialsService() {
  return new UploadCredentialsService(getMetadataService(), getSts(), getS3());
}

export function getFormatRepository() {
  return new DynamoFormatRepository(getMetadataService(), getDocumentClient());
}
