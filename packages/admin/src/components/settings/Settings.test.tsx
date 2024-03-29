import "@testing-library/jest-dom/extend-expect";

import React from "react";

import { render, wait } from "@testing-library/react";

import * as factories from "../../../test-support/factories";
import AWSService from "../../services/aws-service";
import Settings from "./Settings";

/* FIXME: The nasty warning about test not wrapped in act(...) should go away when this is resolved:
 *        https://github.com/facebook/react/issues/14769
 */
describe("<Settings/>", () => {
  beforeEach(() => {
    AWSService.retrieveStack = jest.fn().mockReturnValue(factories.instances()[1]);
  });

  it("renders a table with the settings", async () => {
    const { getByText } = render(<Settings />);

    await wait(() => {
      getByText("EventProcessorStreamName");
      getByText("Name of the Event Processor Kinesis Data Stream");
      getByText("SSDN-Production-EventProcessor");
      getByText("Hello SSDN Lambda Function ARN");
      getByText("HelloSSDNFunction");
      getByText(/SSDN-HelloSSDNFunction-60K87QSYCYTJ/i);
    });
  });
});
