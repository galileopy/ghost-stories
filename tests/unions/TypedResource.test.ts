import { Resource } from "../../src/unions/TypedResource";

describe("Checking union.Resource", () => {
  it("Resource is defined", () => {
    expect(Resource).toBeDefined();
  });
  it("Resource.Query is defined", () => {
    expect(Resource.Query).toBeDefined();
  });
  it("Resource.Empty is defined", () => {
    expect(Resource.Empty).toBeDefined();
  });
  it("Resource.Data is defined", () => {
    expect(Resource.Data).toBeDefined();
  });
  it("Resource.Error is defined", () => {
    expect(Resource.Error).toBeDefined();
  });
  it("Resource.is{Data,Empty,Error,Query} works", () => {
    const error = Resource.Error("a message", null, null);
    const data = Resource.Data("a value", null, null);
    const query = Resource.Query(" a param", null);
    const empty = Resource.Empty({}, null);

    expect(Resource.isData(data)).toBe(true);
    expect(Resource.isError(data)).toBe(false);
    expect(Resource.isQuery(data)).toBe(false);
    expect(Resource.isEmpty(data)).toBe(false);

    expect(Resource.isData(error)).toBe(false);
    expect(Resource.isError(error)).toBe(true);
    expect(Resource.isQuery(error)).toBe(false);
    expect(Resource.isEmpty(error)).toBe(false);

    expect(Resource.isData(query)).toBe(false);
    expect(Resource.isError(query)).toBe(false);
    expect(Resource.isQuery(query)).toBe(true);
    expect(Resource.isEmpty(query)).toBe(false);

    expect(Resource.isData(empty)).toBe(false);
    expect(Resource.isError(empty)).toBe(false);
    expect(Resource.isQuery(empty)).toBe(false);
    expect(Resource.isEmpty(empty)).toBe(true);
  });
  it("Resource.fromError", () => {
    const message = "this is an error message";
    const params = { value: null };
    const error = Resource.fromError(params)(new Error(message));
    expect(error.messages).toContain(message);
    expect(error.params).toEqual(params);
    expect(Resource.isError(error)).toBe(true);
  });
  it("Resource.fromResult", () => {
    const resultEmpty = Resource.fromResult({ search: "empty" }, {});
    const resultData = Resource.fromResult(
      { search: "data" },
      { data: "some data" }
    );
    expect(Resource.isEmpty(resultEmpty)).toBe(true);
    expect(Resource.isData(resultData)).toBe(true);
    expect(resultEmpty.params).toEqual({ search: "empty" });
    expect(resultData.params).toEqual({ search: "data" });
    expect(resultData.value).toEqual({ data: "some data" });
  });
  it("Resource.fromBlob", () => {
    const resultBlob = Resource.fromBlob({ search: "empty" }, {});
    expect(Resource.isData(resultBlob)).toBe(true);
    expect(resultBlob.params).toEqual({ search: "empty" });
    expect(resultBlob.value).toEqual({});

    const resultBlob2 = Resource.fromBlob(
      { search: "blob" },
      "some value"
    );
    expect(Resource.isData(resultBlob2)).toBe(true);
    expect(resultBlob2.params).toEqual({ search: "blob" });
    expect(resultBlob2.value).toEqual("some value");
  });
  it("Resource.mapPromise", (done) => {
    expect.assertions(8);
    const message = "Message";

    const promiseError = Promise.reject(new Error(message));
    const promiseData = Promise.resolve({ data: message });
    const promiseEmpty = Promise.resolve({});

    const resultError = Resource.mapPromise(
      { search: "error" },
      promiseError
    );
    const resultData = Resource.mapPromise(
      { search: "data" },
      promiseData
    );
    const resultEmpty = Resource.mapPromise(
      { search: "empty" },
      promiseEmpty
    );

    const p1 = resultError.then((result) => {
      expect(Resource.isError(result)).toBe(true);
      expect(result.params).toEqual({ search: "error" });
      expect(result.messages).toContain(message);
    });

    const p2 = resultEmpty.then((result) => {
      expect(Resource.isEmpty(result)).toBe(true);
      expect(result.params).toEqual({ search: "empty" });
    });

    const p3 = resultData.then((result) => {
      expect(Resource.isData(result)).toBe(true);
      expect(result.params).toEqual({ search: "data" });
      expect(result.value).toEqual({ data: message });
    });

    Promise.all([p1, p2, p3]).then((x) => done());
  });
  it("Resource.mapPromiseBlob", (done) => {
    expect.assertions(9);
    const message = "Message";

    const promiseError = Promise.reject(new Error(message));
    const promiseData = Promise.resolve({ data: message });
    const promiseEmpty = Promise.resolve({});

    const resultError = Resource.mapPromiseBlob(
      { search: "error" },
      promiseError
    );
    const resultData = Resource.mapPromiseBlob(
      { search: "data" },
      promiseData
    );
    const resultEmpty = Resource.mapPromiseBlob(
      { search: "empty" },
      promiseEmpty
    );

    const p1 = resultError.then((result) => {
      expect(Resource.isError(result)).toBe(true);
      expect(result.params).toEqual({ search: "error" });
      expect(result.messages).toContain(message);
    });

    const p2 = resultEmpty.then((result) => {
      expect(Resource.isEmpty(result)).toBe(false);
      expect(result.params).toEqual({ search: "empty" });
      expect(result.value).toEqual({});
    });

    const p3 = resultData.then((result) => {
      expect(Resource.isData(result)).toBe(true);
      expect(result.params).toEqual({ search: "data" });
      expect(result.value).toEqual({ data: message });
    });

    Promise.all([p1, p2, p3]).then((x) => done());
  });
});
