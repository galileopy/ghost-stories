import Resource from "../../src/unions/Resource";
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
    const error = Resource.Error("a message");
    const data = Resource.Data("a value");
    const query = Resource.Query(" a param");
    const empty = Resource.Empty({});
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
    fail("implement this ");
  });
  it("Resource.mapPromise", () => {
    fail("implement this ");
  });
  it("Resource.mapPromiseBlob", () => {
    fail("implement this ");
  });
});
