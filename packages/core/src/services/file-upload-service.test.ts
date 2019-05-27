import nucleusEvent from "../../test-support/data-samples/file-transfer-nucleus-event.json";
import Event from "../interfaces/event";
import FileUploadService from "./file-upload-service";

describe("FileUploadService", () => {
  describe("process", () => {
    const inMemoryRepository = { store: jest.fn(), storeBatch: jest.fn() };

    beforeEach(() => {
      inMemoryRepository.store.mockImplementation((arg1: any) => arg1);
    });

    it("stores the content", async () => {
      const results = await FileUploadService.process(nucleusEvent as Event, inMemoryRepository);

      expect(results).toEqual(nucleusEvent);
      expect(results).not.toHaveProperty("errors");
    });

    it("wraps any uncontrolled error", async () => {
      inMemoryRepository.store.mockImplementation(() => {
        throw new Error("Unexpected error message");
      });

      const results = await FileUploadService.process(nucleusEvent as Event, inMemoryRepository);

      expect(results).toHaveProperty("error", "Unexpected error message");
    });
  });
});
