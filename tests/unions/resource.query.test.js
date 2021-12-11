import { Resource } from "../../src/unions/Resource";
import { tap, merge } from "ramda";
const params = { value: "value " };
const meta = { page: 1 };
const value = params;
const message = "This should be an error message";

const ok = (value) => value;
const err = (value) => {
  throw new Error(message);
};

const okPromise = (value) => Promise.resolve(value);
const errPromise = () => Promise.reject(new Error(message));

const checkParams = (resource) => expect(resource.params).toEqual(params);
const checkMeta = (resource) => expect(resource.meta).toEqual(meta);
const checkValue = (resource) => expect(resource.value).toEqual(value);
const checkMessages = (resource) =>
  expect(resource.messages).toContain(message);

describe("Checking union.Resource.Query", () => {
  const resource = Resource.Query(params, meta);
  it("Constructor works", () => {
    checkMeta(resource);
    checkParams(resource);
  });
  it("Query.run resolves to Data on success, keeps meta and params", () => {
    const result = resource.run(ok);
    checkParams(result);
    checkMeta(result);
    checkValue(result);
  });
  it("Query.runPromise resolves to Data on success, keeps meta and params", (done) => {
    const result = resource.runPromise(okPromise);
    expect.assertions(3);
    result
      .then(tap(checkParams))
      .then(tap(checkMeta))
      .then(tap(checkValue))
      .then(() => done());
  });
  it("Query.run resolves to Error on reject, keeps meta and params", () => {
    const result = resource.run(err);
    checkParams(result);
    checkMeta(result);
    checkMessages(result);
  });
  it("Query.runPromise resolves to Error on reject, keeps meta and params", (done) => {
    const result = resource.runPromise(errPromise);
    expect.assertions(3);
    result
      .then(tap(checkParams))
      .then(tap(checkMeta))
      .then(tap(checkMessages))
      .then(() => done());
  });
  it("Query.map does nothing", () => {
    const result = resource.map(() => "a simple string");
    expect(result).toEqual(resource);
  });
  it("Query.mapParams does nothing", () => {
    const result = resource.mapParams(() => "a simple string");
    expect(result).toEqual(resource);
  });
  it("Query.mapEmptyParams does nothing", () => {
    const result = resource.mapEmptyParams(() => "a simple string");
    expect(result).toEqual(resource);
  });
  it("Query.chain does nothing", () => {
    const result = resource.chain(() => Resource.Data("a simple string"));
    expect(result).toEqual(resource);
  });
  it("Query.validate does nothing", () => {
    const result = resource.chain(() => {
      throw new Error(message);
    });
    expect(result).toEqual(resource);
  });
  it("Query.update returns a new query with new params", () => {
    const extra = { value2: "another value" };
    const result = resource.update(extra);
    expect(result.params).toEqual(merge(params, extra));
    expect(result.meta).toBeUndefined();
    expect(result.value).toBeUndefined();
    expect(result.messages).toBeUndefined();
    expect(Resource.isQuery(result)).toBe(true);
  });
  it("Query.changeParams returns a new Query", () => {
    const extra = { value2: "another value" };
    const result = resource.changeParams(extra);
    expect(result.params).toEqual(merge(extra, params));
    expect(result.meta).toBeUndefined();
    expect(result.value).toBeUndefined();
    expect(result.messages).toBeUndefined();
    expect(Resource.isEmpty(result));
  });
  it("Query.empty returns a new empty resource", () => {
    const result = resource.empty();
    expect(result.params).toEqual(params);
    expect(result.meta).toEqual(meta);
    expect(result.value).toBeUndefined();
    expect(result.messages).toBeUndefined();
    expect(Resource.isEmpty(result));
  });
  it("Query.query returns a new query", () => {
    const result = resource.query();
    expect(result.params).toEqual(params);
    expect(result.meta).toEqual(meta);
    expect(result.value).toBeUndefined();
    expect(result.messages).toBeUndefined();
    expect(Resource.isQuery(result));
  });
  it("Query.fail returns a new error", () => {
    const result = resource.fail(message);
    expect(result.params).toEqual(params);
    expect(result.meta).toEqual(meta);
    expect(result.value).toBeUndefined();
    expect(result.messages).toContain(message);
    expect(Resource.isError(result));
  });
  it("Query.tap does nothing", () => {
    const result = resource.tap(() => "some string");
    expect(result).toEqual(resource);
  });
  it("Query.getDataOr returns a default value", () => {
    const something = "some string";
    const result = resource.getDataOr(something);
    expect(result).toEqual(something);
  });
});
