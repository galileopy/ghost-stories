import { isNil, isEmpty, curryN, identity, tap, merge } from "ramda";

export interface ResourcePattern {
  Query: (resource: _Query) => any;
  Data: (resource: _Data) => any;
  Empty: (resource: _Empty) => any;
  Error: (resource: _Error) => any;
}

export const makePattern = (
  fn: (x: ResourceKind) => ResourceKind
): ResourcePattern => {
  return {
    Query: fn,
    Data: fn,
    Empty: fn,
    Error: fn,
  };
};

// it might be a good idea to have a resource pattern with defaults
// I need to fix the fact that value is optional in Data, it should not be
abstract class ResourceBase {
  constructor(
    readonly params: object,
    readonly value?: any,
    readonly messages?: string[],
    readonly meta?: object
  ) {}

  // COMMON METHODS: They behave the same regardless of type
  update(newParams: object) {
    return Resource.Query(Object.assign({}, this.params, newParams));
  }
  changeParams(newParams: object) {
    return Resource.Empty(Object.assign({}, this.params, newParams));
  }
  empty() {
    return Resource.Empty(this.params, this.meta);
  }
  fail(message: string) {
    return Resource.Error([message], this.params, this.meta);
  }
  query() {
    return Resource.Query(this.params, this.meta);
  }
  tap(fn: Function): ResourceKind {
    const pattern = merge(makePattern(identity), {
      Data: (data: _Data) => {
        fn(data.value);
        return data;
      },
    });
    return this.matchWith(pattern);
  }

  getDataOr(defaultValue: any) {
    const alwaysValue = () => defaultValue;
    return this.matchWith({
      Query: alwaysValue,
      Empty: alwaysValue,
      Error: alwaysValue,
      Data: ({ value }: _Data) => value,
    });
  }

  public matchWith(pattern: ResourcePattern): any {
    if (this instanceof _Data) return pattern.Data(this as _Data);
    if (this instanceof _Query) return pattern.Query(this as _Query);
    if (this instanceof _Empty) return pattern.Empty(this as _Empty);
    if (this instanceof _Error) return pattern.Error(this as _Error);
  }

  public run(fn: Function) {
    const run = ({ params, meta }: _Query) => {
      try {
        const result = fn(params);
        return Resource.Data(result, params, meta);
      } catch (error) {
        return Resource.Error([error.message], params, meta);
      }
    };
    const pattern = merge(makePattern(identity), {
      Query: run,
    });
    return this.matchWith(pattern);
  }

  public runPromise(fn: (x: any) => Promise<any>) {
    const runPromise = ({ params, meta }: _Query) => {
      return fn(params).then(
        (result) => Resource.Data(result, params, meta),
        (error) => Resource.Error([error.message], params, meta)
      );
    };
    const pattern = merge(makePattern(identity), {
      Query: runPromise,
    });
    return this.matchWith(pattern);
  }

  public map(fn: (x: any) => any) {
    const map = ({ value, params, meta }: _Data) => {
      try {
        const result = fn(value);
        return Resource.Data(result, params, meta);
      } catch (e) {
        return Resource.Error([e.message], params, meta);
      }
    };

    const pattern = merge(makePattern(identity), {
      Data: map,
    });
    return this.matchWith(pattern);
  }

  public mapParams(fn: (x: any) => any) {
    const mapParams = ({ value, params, meta }: _Data) => {
      try {
        const result = fn(params);
        return Resource.Data(value, result, meta);
      } catch (e) {
        return Resource.Error([e.message], params, meta);
      }
    };

    const pattern = merge(makePattern(identity), {
      Data: mapParams,
    });
    return this.matchWith(pattern);
  }

  public mapEmptyParams(fn: (x: any) => any) {
    const mapEmptyParams = ({ params, meta }: _Empty) => {
      try {
        const result = fn(params);
        return Resource.Empty(result, meta);
      } catch (e) {
        return Resource.Error([e.message], params, meta);
      }
    };

    const pattern = merge(makePattern(identity), {
      Empty: mapEmptyParams,
    });

    return this.matchWith(pattern);
  }

  public chain(fn: (x: _Data) => ResourceKind): ResourceKind {
    const pattern = merge(makePattern(identity), {
      Data: fn,
    });
    return this.matchWith(pattern);
  }
  public validate(fn: (x: any) => any, message: string): ResourceKind {
    const validate = ({ value, params, meta }: _Data) => {
      try {
        fn(value);
      } catch (error) {
        return Resource.Error(
          [message, error.message as string],
          params,
          meta
        );
      }
    };

    const pattern = merge(makePattern(identity), {
      Data: validate,
    });
    return this.matchWith(pattern);
  }
}

export type ResourceKind = _Query | _Data | _Empty | _Error;

class _Query extends ResourceBase {
  public readonly isQuery = true;
  constructor(params: any, meta?: any) {
    super(params, null, undefined, meta);
  }
  public static hasInstance(instance: ResourceKind): boolean {
    return (instance as _Query).isQuery || false;
  }
}

class _Data extends ResourceBase {
  public readonly isData = true;
  constructor(readonly value: any, readonly params: any, meta?: any) {
    super(params, value, undefined, meta);
  }
  public static hasInstance(instance: ResourceKind): boolean {
    return (instance as _Data).isData || false;
  }
  public run(fn: Function): ResourceKind {
    return this;
  }
}

class _Empty extends ResourceBase {
  public readonly isEmpty = true;
  constructor(readonly params: any, meta?: any) {
    super(params, null, undefined, meta);
  }
  public static hasInstance(instance: ResourceKind): boolean {
    return (instance as _Empty).isEmpty || false;
  }
  public run(fn: Function): ResourceKind {
    return this;
  }
}

class _Error extends ResourceBase {
  public readonly isError = true;
  constructor(
    readonly messages: string[],
    readonly params: any,
    readonly meta?: any
  ) {
    super(params, null, messages, meta);
  }
  public static hasInstance(instance: ResourceKind): boolean {
    return (instance as _Error).isError || false;
  }
  public run(fn: Function): ResourceKind {
    return this;
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
    const ctor = (messages: string[], params?: any, meta?: any) =>
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

  static fromResult = curryN(2, (params, data): _Data | _Empty => {
    if (isEmpty(data) || isNil(data)) {
      return Resource.Empty(params);
    }
    return Resource.Data(data, params);
  });

  static mapPromise = curryN(2, (params, promise) =>
    promise.then(Resource.fromResult(params), Resource.fromError(params))
  );

  static mapPromiseBlob = curryN(2, (params, promise) =>
    promise.then(Resource.fromBlob(params), Resource.fromError(params))
  );

  static isEmpty = (resource: ResourceKind) =>
    Resource.Empty.hasInstance(resource);
  static isData = (resource: ResourceKind) =>
    Resource.Data.hasInstance(resource);
  static isQuery = (resource: ResourceKind) =>
    Resource.Query.hasInstance(resource);
  static isError = (resource: ResourceKind) =>
    Resource.Error.hasInstance(resource);
}
