import clone from "lodash/fp/clone";
import nucleusEventSample from "../../../test-support/data-samples/nucleus-event.json";
import processEventInput from "../../../test-support/lambda-events/put-xapi-statement-event.json";
import LambdaStatementParser from "./lambda-statement-parser";

describe("LambdaStatementParser", () => {
  describe("parse", () => {
    it("generates a nucleus event structured object", async () => {
      const nucleusEvent = new LambdaStatementParser(processEventInput).parse();

      expect(nucleusEvent).toEqual(nucleusEventSample);
    });

    it("does not try to decode content when flag is not set", async () => {
      const unencodedEventInput = clone(processEventInput);
      unencodedEventInput.body = JSON.stringify({
        content: "My content",
        id: "5030ba19-5d5b-43be-998f-cfcd530c1a09",
      });
      unencodedEventInput.isBase64Encoded = false;

      const nucleusEvent = new LambdaStatementParser(unencodedEventInput).parse();

      expect(nucleusEvent.content).toHaveProperty("content", "My content");
      expect(nucleusEvent.content).toHaveProperty("id", "5030ba19-5d5b-43be-998f-cfcd530c1a09");
    });

    it("generates an UUID when none is provided", async () => {
      const unencodedEventInput = processEventInput;
      unencodedEventInput.body = JSON.stringify({
        content: "My content",
      });
      unencodedEventInput.isBase64Encoded = false;

      const nucleusEvent = new LambdaStatementParser(processEventInput).parse();

      expect(nucleusEvent.content).toHaveProperty("content", "My content");
      expect(nucleusEvent.content).toHaveProperty("id");
    });
  });
});
