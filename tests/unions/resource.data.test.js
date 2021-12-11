import { Resource } from "../../src/unions/Resource";
import { tap, merge } from "ramda";
const params = { value: "value " };
const meta = { page: 1 };
const value = { foo: "bar" };
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

describe("Checking union.Resource.Data", () => {
  const resource = Resource.Data(value, params, meta);
  it("Constructor works", () => {
    checkMeta(resource);
    checkParams(resource);
  });

  it("Data.run resolves to Data on success, keeps meta and params", () => {
    const result = resource.run(ok);
    checkParams(result);
    checkMeta(result);
    checkValue(result);
  });

  it("Data.runPromise does nothing", () => {
    const result = resource.runPromise(okPromise);
    checkParams(result);
    checkMeta(result);
    checkValue(result);
    expect(result).toEqual(resource);
  });

  it("Data.run does nothing", () => {
    const result = resource.run(err);
    checkParams(result);
    checkMeta(result);
    checkValue(result);
    expect(result).toEqual(resource);
  });

  it("Data.runPromise resolves to Error on reject, keeps meta and params", () => {
    const result = resource.runPromise(errPromise);
    checkParams(result);
    checkMeta(result);
    checkValue(result);
    expect(result === resource).toBe(true);
  });

  it("Data.map alters only the value and not meta & params", () => {
    const newValue = "a simple string";
    const result = resource.map(() => newValue);
    expect(result.value).toEqual(newValue);
    checkParams(result);
    checkMeta(result);
  });

  it("Data.mapParams alters only the value and not meta & params", () => {
    const newParams = "a simple string";
    const result = resource.mapParams(() => "a simple string");
    checkMeta(result);
    checkValue(result);
    expect(result.params).toEqual(newParams);
  });

  it("Data.mapEmptyParams does nothing", () => {
    const result = resource.mapEmptyParams(() => "a simple string");
    expect(result).toEqual(resource);
  });

  it("Data.chain returns the internal value", () => {
    const internal = Resource.Data("a simple string");
    const result = resource.chain(() => internal);
    expect(result).toEqual(internal);
  });

  it("Data.chain maps to error if fn fails", () => {
    const result = resource.chain(() => {
      throw new Error(message);
    });
    expect(Resource.isError(result)).toEqual(true);
    expect(result.messages).toContain(message);
  });

  it("Data.update returns a new Query with new params", () => {
    const extra = { value2: "another value" };
    const result = resource.update(extra);
    expect(result.params).toEqual(merge(params, extra));
    expect(result.meta).toBeUndefined();
    expect(result.value).toBeUndefined();
    expect(result.messages).toBeUndefined();
    expect(Resource.isQuery(result)).toBe(true);
  });

  it("Data.changeParams returns a new Empty with merged params", () => {
    const extra = { value2: "another value" };
    const result = resource.changeParams(extra);
    expect(result.params).toEqual(merge(extra, params));
    expect(result.meta).toBeUndefined();
    expect(result.value).toBeUndefined();
    expect(result.messages).toBeUndefined();
    expect(Resource.isEmpty(result)).toBe(true);
  });

  it("Data.empty returns a new empty resource", () => {
    const result = resource.empty();
    expect(result.params).toEqual(params);
    expect(result.meta).toEqual(meta);
    expect(result.value).toBeUndefined();
    expect(result.messages).toBeUndefined();
    expect(Resource.isEmpty(result)).toBe(true);
  });

  it("Data.query returns a new Query", () => {
    const result = resource.query();
    expect(result.params).toEqual(params);
    expect(result.meta).toEqual(meta);
    expect(result.value).toBeUndefined();
    expect(result.messages).toBeUndefined();
    expect(Resource.isQuery(result)).toBe(true);
  });

  it("Data.fail returns a new error", () => {
    const result = resource.fail(message);
    expect(result.params).toEqual(params);
    expect(result.meta).toEqual(meta);
    expect(result.value).toBeUndefined();
    expect(result.messages).toContain(message);
    expect(Resource.isError(result)).toBe(true);
  });

  it("Data.tap does nothing", () => {
    const result = resource.tap(() => "some string");
    expect(result).toEqual(resource);
  });

  it("Data.getDataOr extracts the current value", () => {
    const something = "some string";
    const result = resource.getDataOr(something);
    expect(result).toEqual(value);
  });

  it("Data.validate returns data if validate does not throw", () => {
    const result = resource.validate((v) => {
      return true;
    });
    checkParams(result);
    checkMeta(result);
    checkValue(result);
  });

  it("Data.validate returns an Error if validate throws", () => {
    const result = resource.validate((v) => {
      throw new Error(message);
    });
    checkParams(result);
    checkMeta(result);
    checkMessages(result);
  });
});
