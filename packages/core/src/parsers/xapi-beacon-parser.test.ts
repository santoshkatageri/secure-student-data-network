import { APIGatewayProxyEvent } from "aws-lambda";

import beaconEventSample from "../../test-support/data-samples/beacon-event.json";
import beaconEventInput from "../../test-support/lambda-events/get-xapi-beacon-event.json";
import XAPIBeaconParser from "./xapi-beacon-parser";

describe("XAPIBeaconParser", () => {
  describe("parse", () => {
    it("generates a nucleus event structured object", async () => {
      const nucleusEvent = new XAPIBeaconParser(
        (beaconEventInput as unknown) as APIGatewayProxyEvent,
        "nucleus-test.learningtapestry.com",
      ).parse();

      expect(nucleusEvent).toEqual(beaconEventSample);
    });

    it("allows user to specify a custom namespace", async () => {
      const customNamespaceEvent = {
        ...beaconEventInput,
        queryStringParameters: {
          ...beaconEventInput.queryStringParameters,
          ns: "custom.learningtapestry.com",
        },
      };

      const nucleusEvent = new XAPIBeaconParser(
        (customNamespaceEvent as unknown) as APIGatewayProxyEvent,
        "nucleus-test.learningtapestry.com",
      ).parse();

      expect(nucleusEvent.event.namespace).toEqual("custom.learningtapestry.com");
    });

    it("generates an UUID when none is provided", async () => {
      const nucleusEvent = new XAPIBeaconParser(
        (beaconEventInput as unknown) as APIGatewayProxyEvent,
        "nucleus-test.learningtapestry.com",
      ).parse();

      expect(nucleusEvent.content).toHaveProperty("id");
    });
  });
});
