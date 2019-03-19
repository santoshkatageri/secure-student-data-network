import get from "lodash/fp/get";
import has from "lodash/fp/has";
import trim from "lodash/fp/trim";
import isEmpty from "lodash/fp/isEmpty";
import KinesisRepository from "../../repositories/kinesis-repository";
import XAPIValidator from "../../validators/xapi-validator";
import LambdaStatementParser from "./lambda-statement-parser";
import StatementService from "./statement-service";

export const handler = async (event: object) => {
    const requestErrors = validateRequest(event);
    if (!isEmpty(requestErrors)) {
        return buildResponse({
            errors: requestErrors,
            message: "Some arguments in the request are invalid",
        }, 400);
    }

    const results = await StatementService.process(
        new LambdaStatementParser(event).parse(),
        new XAPIValidator(),
        new KinesisRepository(),
    );
    const hasErrors = has("errors")(results);

    return buildResponse(results, hasErrors ? 422 : 200);
};

const validateRequest = (event: object) => {
    const errors = [];
    const xAPIVersion = trim(get("headers.X-Experience-API-Version")(event));
    if (!/^1\.0(\.\d{1,2})?$/.test(xAPIVersion)) {
        errors.push(`Unsupported xAPI version (${xAPIVersion})`);
    }

    return errors;
};

const buildResponse = (results: object, statusCode: number) => {
    return {
        body: JSON.stringify(results),
        headers: {"X-Experience-API-Version": "1.0.3"},
        statusCode,
    };
};