import { isNil, isEmpty, curryN } from "ramda";
interface ResourcePattern {
  Query: (resource: _Query) => any;
  Data: (resource: _Data) => any;
  Empty: (resource: _Empty) => any;
  Error: (resource: _Error) => any;
}
// it might be a good idea to have a resource pattern with defaults
abstract class ResourceBase {
  run() {
    return this;
  }
  runPromise() {
    return this;
  }
  chain() {
    return this;
  }
  map() {
    return this;
  }
  update() {
    return this;
  }
  mapEmptyParams() {
    return this;
  }
  mapParams() {
    return this;
  }
  empty() {
    return this;
  }
  validate() {
    return this;
  }
  fail() {
    return this;
  }
  changeParams() {
    return this;
  }
  getDataOr() {
    return this;
  }
  query() {
    return this;
  }
  tap() {
    return this;
  }
  public abstract matchWith(pattern: ResourcePattern): any;
}

type _ResourceKind = _Query | _Data | _Empty | _Error;

class _Query extends ResourceBase {
  public readonly isQuery = true;
  constructor(readonly params: any, readonly meta?: any) {
    super();
  }
  public static hasInstance(instance: _ResourceKind): boolean {
    return (instance as _Query).isQuery || false;
  }
  public matchWith(pattern: ResourcePattern) {
    return pattern.Query(this);
  }
}

class _Data extends ResourceBase {
  public readonly isData = true;
  constructor(
    readonly value: any,
    readonly params?: any,
    readonly meta?: any
  ) {
    super();
  }
  public static hasInstance(instance: _ResourceKind): boolean {
    return (instance as _Data).isData || false;
  }
  public matchWith(pattern: ResourcePattern) {
    return pattern.Data(this);
  }
}

class _Empty extends ResourceBase {
  public readonly isEmpty = true;
  constructor(readonly params: any, readonly meta?: any) {
    super();
  }
  public static hasInstance(instance: _ResourceKind): boolean {
    return (instance as _Empty).isEmpty || false;
  }
  public matchWith(pattern: ResourcePattern) {
    return pattern.Empty(this);
  }
}

class _Error extends ResourceBase {
  public readonly isError = true;
  constructor(
    readonly messages: [string],
    readonly params?: any,
    readonly meta?: any
  ) {
    super();
  }
  public static hasInstance(instance: _ResourceKind): boolean {
    return (instance as _Error).isError || false;
  }
  public matchWith(pattern: ResourcePattern) {
    return pattern.Error(this);
  }
}

export class Resource {
  static Query = (function () {
    const ctor = (params: any, meta?: any) => new _Query(params, meta);
    ctor.hasInstance = _Query.hasInstance;
    return ctor;
  })();

  static Data = (function () {
    const ctor = (value: any, params?: any, meta?: any) =>
      new _Data(value, params, meta);
    ctor.hasInstance = _Data.hasInstance;
    return ctor;
  })();

  static Empty = (function () {
    const ctor = (params: any, meta?: any) => new _Empty(params, meta);
    ctor.hasInstance = _Empty.hasInstance;
    return ctor;
  })();

  static Error = (function () {
    const ctor = (messages: [string], params?: any, meta?: any) =>
      new _Error(messages, params, meta);
    ctor.hasInstance = _Error.hasInstance;
    return ctor;
  })();

  static fromBlob = curryN(2, (params, blob) =>
    Resource.Data(blob, params, null)
  );

  static fromError = curryN(2, (params, error: Error) =>
    Resource.Error([error.message], params, error)
  );

  static fromResult = curryN(2, (params, data) => {
    if (isEmpty(data) || isNil(data)) {
      return Resource.Empty(params, null);
    }
    return Resource.Data(data, params, null);
  });

  static mapPromise = curryN(2, (params, promise) =>
    promise.then(Resource.fromResult(params), Resource.fromError(params))
  );

  static mapPromiseBlob = curryN(2, (params, promise) =>
    promise.then(Resource.fromBlob(params), Resource.fromError(params))
  );

  static isEmpty = (resource: _ResourceKind) =>
    Resource.Empty.hasInstance(resource);
  static isData = (resource: _ResourceKind) =>
    Resource.Data.hasInstance(resource);
  static isQuery = (resource: _ResourceKind) =>
    Resource.Query.hasInstance(resource);
  static isError = (resource: _ResourceKind) =>
    Resource.Error.hasInstance(resource);
}
