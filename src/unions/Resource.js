import union from "folktale/adt/union/union";
import adtMethods from "folktale/helpers/define-adt-methods";
import assertFunction from "folktale/helpers/assert-function";
import { isNil, isEmpty, curry } from "ramda";
// utility functions, maybe to be factored out

export const Resource = union("Resource", {
  Query(params, meta) {
    return { params, meta };
  },
  Empty(params, meta) {
    return { params, meta };
  },
  Data(value, params, meta) {
    return { value, params, meta };
  },
  Error(messages, params, meta) {
    return { messages, params, meta };
  },
});

adtMethods(Resource, {
  run: {
    Data: emptyHOF("Resource.Data#run"),
    Empty: emptyHOF("Resource.Empty#run"),
    Error: emptyHOF("Resource.Error#run"),
    Query: function run(fn) {
      assertFunction("Resource.Query#run", fn);
      const { params, meta } = this;
      try {
        const result = fn(params);
        return Resource.Data(result, params, meta);
      } catch (error) {
        return Resource.Error([error.message], params, meta);
      }
    },
  },
  runPromise: {
    Data: emptyHOF("Resource.Data#runPromise"),
    Empty: emptyHOF("Resource.Empty#runPromise"),
    Error: emptyHOF("Resource.Error#runPromise"),
    Query: function run(fn) {
      assertFunction("Resource.Query#runPromise", fn);
      const { params, meta } = this;
      return fn(params).then(
        (result) => Resource.Data(result, params, meta),
        (error) => Resource.Error([error.message], params, meta)
      );
    },
  },
  map: {
    Query: emptyHOF("Resource.Query#map"),
    Empty: emptyHOF("Resource.Empty#map"),
    Error: emptyHOF("Resource.Error#map"),
    Data: function map(fn) {
      assertFunction("Resource.Data#map", fn);
      const { value, params, meta } = this;
      try {
        const result = fn(value);
        return Resource.Data(result, params, meta);
      } catch (e) {
        return Resource.Error([e.message], params, meta);
      }
    },
  },
  mapParams: {
    Query: emptyHOF("Resource.Query#mapParams"),
    Empty: emptyHOF("Resource.Empty#mapParams"),
    Error: emptyHOF("Resource.Empty#mapParams"),
    Data: function map(f) {
      assertFunction("Resource.Data#mapParams", f);
      const { value, params, meta } = this;
      try {
        const result = f(value);
        return Resource.Data(value, result, meta);
      } catch (e) {
        return Resource.Error([e.message], params, meta);
      }
    },
  },
  mapEmptyParams: {
    Query: emptyHOF("Resource.Query#mapEmptyParams"),
    Data: emptyHOF("Resource.Data#mapEmptyParams"),
    Error: emptyHOF("Resource.Error#mapEmptyParams"),
    Empty: function mapEmptyParams(f) {
      assertFunction("Resource.Data#mapEmptyParams", f);
      const { params, meta } = this;
      try {
        const result = f(params);
        return Resource.Empty(result, meta);
      } catch (e) {
        return Resource.Error([e.message], params, meta);
      }
    },
  },
  chain: {
    Query: emptyHOF("Resource.Query#chain"),
    Empty: emptyHOF("Resource.Empty#chain"),
    Error: emptyHOF("Resource.Error#chain"),
    Data: function chain(f) {
      assertFunction("Resource.Data#chain", f);
      return f(this);
    },
  },
  validate: {
    Query: emptyHOF("Resource.Query#validate"),
    Empty: emptyHOF("Resource.Empty#validate"),
    Error: emptyHOF("Resource.Error#validate"),
    Data: function validate(f, message) {
      assertFunction("Resource.Data#validate", f);
      try {
        f(this.value);
      } catch (error) {
        return Resource.Error(
          [message, error.message],
          this.params,
          this.meta
        );
      }
      return this;
    },
  },
  update: {
    Query: update,
    Empty: update,
    Error: update,
    Data: update,
  },
  changeParams: {
    Query: changeParams,
    Empty: changeParams,
    Error: changeParams,
    Data: changeParams,
  },
  empty: {
    Query: empty,
    Empty: empty,
    Error: empty,
    Data: empty,
  },
  query: {
    Query: query,
    Empty: query,
    Error: query,
    Data: query,
  },
  fail: {
    Query: fail,
    Empty: fail,
    Error: fail,
    Data: fail,
  },
  tap: {
    Query: emptyHOF("Resource.Query#tap"),
    Empty: emptyHOF("Resource.Empty#tap"),
    Error: emptyHOF("Resource.Error#tap"),
    Data: function tap(f) {
      assertFunction("Resource.Data#tap", f);
      const { value } = this;
      f(value);
      return this;
    },
  },
  getDataOr: {
    Query(value) {
      return value;
    },
    Empty(value) {
      return value;
    },
    Error(value) {
      return value;
    },
    Data() {
      return this.value;
    },
  },
  onData: {
    Query(fn) {
      return undefined;
    },
    Empty(fn) {
      return undefined;
    },
    Error(fn) {
      return undefined;
    },
    Data(fn) {
      fn(this.value);
      return undefined;
    },
  },
});

//TODO add test for onData, considerar que debe retornar onData
export const fromBlob = curry((params, blob) =>
  Resource.Data(blob, params, null)
);

export const fromError = curry((params, error) =>
  Resource.Error([error.message], params, error)
);

export const fromResult = curry((params, data) => {
  if (isEmpty(data) || isNil(data)) {
    return Resource.Empty(params);
  }
  return Resource.Data(data, params);
});

export const mapPromise = curry((params, promise) =>
  promise.then(fromResult(params), fromError(params))
);

export const mapPromiseBlob = curry((params, promise) =>
  promise.then(fromBlob(params), fromError(params))
);

Resource.fromError = fromError;
Resource.fromResult = fromResult;
Resource.fromBlob = fromBlob;

Resource.mapPromise = mapPromise;
Resource.mapPromiseBlob = mapPromiseBlob;

Resource.isEmpty = (resource) => Resource.Empty.hasInstance(resource);
Resource.isData = (resource) => Resource.Data.hasInstance(resource);
Resource.isQuery = (resource) => Resource.Query.hasInstance(resource);
Resource.isError = (resource) => Resource.Error.hasInstance(resource);

function emptyHOF(message) {
  return function (fn) {
    assertFunction(message, fn);
    return this;
  };
}

function update(newParams) {
  const { params } = this;
  return Resource.Query(Object.assign({}, params, newParams));
}

function changeParams(newParams) {
  const { params } = this;
  return Resource.Empty(Object.assign({}, params, newParams));
}

function empty() {
  return Resource.Empty(this.params, this.meta);
}

function query() {
  return Resource.Query(this.params, this.meta);
}

function fail(message) {
  return Resource.Error([message], this.params, this.meta);
}
