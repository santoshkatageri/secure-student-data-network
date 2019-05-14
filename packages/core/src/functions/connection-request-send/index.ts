import { APIGatewayProxyHandler } from "aws-lambda";

import { getConnectionRequestRepository, getConnectionRequestService } from "../../aws-services";
import { apiResponse, applyMiddlewares } from "../api-helper";

export const handler = applyMiddlewares<APIGatewayProxyHandler>(async (event) => {
  const id = event.pathParameters!.id;
  const connectionRequest = await getConnectionRequestRepository().get(id);
  await getConnectionRequestService().sendConnectionRequest(connectionRequest);
  return apiResponse();
});
