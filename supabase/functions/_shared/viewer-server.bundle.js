var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: (arg) => ZodString.create({ ...arg, coerce: true }),
  number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
  boolean: (arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  }),
  bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
  date: (arg) => ZodDate.create({ ...arg, coerce: true })
};
var NEVER = INVALID;

// packages/schema/src/sizing.ts
var BlockAlign = external_exports.enum(["left", "center", "right"]);
var BlockWidthFraction = external_exports.number().gt(0).max(1);
var sizingFields = {
  width: BlockWidthFraction.optional(),
  align: BlockAlign.optional()
};

// packages/schema/src/blocks/image.ts
var CROP_EPSILON = 1e-6;
var CropRect = external_exports.object({
  x: external_exports.number().min(0).lt(1),
  y: external_exports.number().min(0).lt(1),
  w: external_exports.number().gt(0).max(1),
  h: external_exports.number().gt(0).max(1)
}).refine(
  (c) => c.x + c.w <= 1 + CROP_EPSILON && c.y + c.h <= 1 + CROP_EPSILON,
  { message: "crop window must stay within the source (x+w \u2264 1, y+h \u2264 1)" }
);
var ImageBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("image"),
  src: external_exports.string().url(),
  // alt is required for accessibility but defaults to empty string for
  // decorative images. Editors should warn (not block) on empty alt.
  alt: external_exports.string().default(""),
  caption: external_exports.string().optional(),
  // Variable block sizing: optional width fraction + alignment (sizing.ts).
  // This IS the image display-size mechanism — no separate intrinsic size.
  ...sizingFields,
  // Crop (reframe) — the visible sub-rectangle of the source (docs/design/
  // image-crop.md). `srcAspect` (the source's natural W/H ratio) lets the pure
  // renderer derive the crop pixel aspect A = srcAspect·(w/h) without reading
  // image dimensions. Stored BOTH-OR-NEITHER: an uncropped image carries
  // neither (byte-identical to today). The pairing is enforced in the editor +
  // serialize (not a schema .refine — ImageBlock is a discriminatedUnion member
  // and refined objects can't be discriminated); see serialize.ts + CR-INV-both.
  crop: CropRect.optional(),
  srcAspect: external_exports.number().positive().optional()
});

// packages/schema/src/graph-primitives.ts
var AxisConfig = external_exports.object({
  xMin: external_exports.number(),
  xMax: external_exports.number(),
  yMin: external_exports.number(),
  yMax: external_exports.number(),
  xGridStep: external_exports.number().positive().default(1),
  yGridStep: external_exports.number().positive().default(1),
  showGrid: external_exports.boolean().default(true),
  // When true, a dragged handle snaps to the nearest grid intersection. Keyboard
  // nudge always moves by one grid step regardless (Shift = 0.1 step, fine).
  snapToGrid: external_exports.boolean().default(true)
});
var EndpointStyle = external_exports.enum(["open", "closed"]);
var CurveDomain = external_exports.object({
  min: external_exports.number().optional(),
  minStyle: EndpointStyle.optional(),
  max: external_exports.number().optional(),
  maxStyle: EndpointStyle.optional()
});
var LinearModel = external_exports.object({
  family: external_exports.literal("linear"),
  slope: external_exports.number(),
  intercept: external_exports.number(),
  slopeTolerance: external_exports.number().nonnegative().default(0.1),
  interceptTolerance: external_exports.number().nonnegative().default(0.1)
});
var QuadraticModel = external_exports.object({
  family: external_exports.literal("quadratic"),
  a: external_exports.number(),
  b: external_exports.number(),
  c: external_exports.number(),
  aTolerance: external_exports.number().nonnegative().default(0.1),
  bTolerance: external_exports.number().nonnegative().default(0.1),
  cTolerance: external_exports.number().nonnegative().default(0.1)
});
var ExponentialModel = external_exports.object({
  family: external_exports.literal("exponential"),
  a: external_exports.number(),
  b: external_exports.number(),
  aTolerance: external_exports.number().nonnegative().default(0.1),
  bTolerance: external_exports.number().nonnegative().default(0.1)
});
var LogarithmicModel = external_exports.object({
  family: external_exports.literal("logarithmic"),
  a: external_exports.number(),
  b: external_exports.number(),
  aTolerance: external_exports.number().nonnegative().default(0.1),
  bTolerance: external_exports.number().nonnegative().default(0.1)
});
var VerticalModel = external_exports.object({
  family: external_exports.literal("vertical"),
  x: external_exports.number(),
  xTolerance: external_exports.number().nonnegative().default(0.1)
});
var FunctionModel = external_exports.discriminatedUnion("family", [
  LinearModel,
  QuadraticModel,
  ExponentialModel,
  LogarithmicModel,
  VerticalModel
]);
var DrawableColor = external_exports.enum([
  "blue",
  "indigo",
  "teal",
  "green",
  "amber",
  "red",
  "violet",
  "slate"
]);
var PointDrawable = external_exports.object({
  kind: external_exports.literal("point"),
  at: external_exports.tuple([external_exports.number(), external_exports.number()]),
  label: external_exports.string().optional(),
  // open = hollow (excluded), closed = filled. Default closed.
  style: EndpointStyle.optional(),
  color: DrawableColor.optional()
});
var CurveDrawable = external_exports.object({
  kind: external_exports.literal("curve"),
  model: FunctionModel,
  // Drop 5: dashed boundary + half-plane shading turn a display curve into a
  // pictured inequality; domain restricts it to a ray/segment.
  style: external_exports.enum(["solid", "dashed"]).optional(),
  shade: external_exports.enum(["above", "below", "left", "right"]).optional(),
  domain: CurveDomain.optional(),
  // Continuation arrowheads on UNBOUNDED ends (textbook convention: arrow =
  // "keeps going", dot = "stops here"). Drawn where the curve exits the visible
  // window; an authored domain bound suppresses that end's arrow (it gets the
  // open/closed dot instead). undefined = true — arrows are the convention,
  // this flag is the opt-out (author call 2026-07-10).
  arrows: external_exports.boolean().optional(),
  color: DrawableColor.optional()
});
var ExpressionDrawable = external_exports.object({
  kind: external_exports.literal("expression"),
  expression: external_exports.string().min(1),
  style: external_exports.enum(["solid", "dashed"]).optional(),
  // Continuation arrowheads at both window exits (see CurveDrawable.arrows).
  arrows: external_exports.boolean().optional(),
  color: DrawableColor.optional()
});
var SegmentDrawable = external_exports.object({
  kind: external_exports.literal("segment"),
  from: external_exports.tuple([external_exports.number(), external_exports.number()]),
  to: external_exports.tuple([external_exports.number(), external_exports.number()]),
  // Drop 5: open/closed endpoint dots ([from, to]). Default closed.
  endpoints: external_exports.tuple([EndpointStyle, EndpointStyle]).optional(),
  color: DrawableColor.optional()
});
var RayDrawable = external_exports.object({
  kind: external_exports.literal("ray"),
  from: external_exports.tuple([external_exports.number(), external_exports.number()]),
  through: external_exports.tuple([external_exports.number(), external_exports.number()]),
  fromStyle: EndpointStyle.optional(),
  // Continuation arrowhead on the unbounded end (see CurveDrawable.arrows).
  arrows: external_exports.boolean().optional(),
  color: DrawableColor.optional()
});
var PolygonDrawable = external_exports.object({
  kind: external_exports.literal("polygon"),
  vertices: external_exports.array(external_exports.tuple([external_exports.number(), external_exports.number()])).min(3),
  filled: external_exports.boolean().default(true),
  color: DrawableColor.optional()
});
var Drawable = external_exports.discriminatedUnion("kind", [
  PointDrawable,
  CurveDrawable,
  ExpressionDrawable,
  SegmentDrawable,
  RayDrawable,
  PolygonDrawable
]);

// packages/schema/src/blocks/graph-figure.ts
var GraphFigureBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("graph_figure"),
  axis: AxisConfig,
  drawables: external_exports.array(Drawable).default([])
});

// packages/schema/src/inline.ts
var BoldMark = external_exports.object({ type: external_exports.literal("bold") });
var ItalicMark = external_exports.object({ type: external_exports.literal("italic") });
var UnderlineMark = external_exports.object({ type: external_exports.literal("underline") });
var CodeMark = external_exports.object({ type: external_exports.literal("code") });
var SubscriptMark = external_exports.object({ type: external_exports.literal("subscript") });
var SuperscriptMark = external_exports.object({ type: external_exports.literal("superscript") });
var SimpleMark = external_exports.discriminatedUnion("type", [
  BoldMark,
  ItalicMark,
  UnderlineMark,
  CodeMark,
  SubscriptMark,
  SuperscriptMark
]);
var MathPrompt = external_exports.object({
  // Matches the `\placeholder[id]{}` marker in the owning node's latex. NOT a
  // uuid: MathLive placeholder ids may not contain spaces/special characters
  // (uuid hyphens are unsafe), so the editor mints a MathLive-safe token.
  // Document-wide uniqueness (it keys into the blanks map) is an authoring-time
  // invariant, not a schema constraint.
  id: external_exports.string().min(1),
  answer: external_exports.string().min(1),
  // Alternative acceptable forms ("also accept"). Empty array is the common case.
  acceptableAnswers: external_exports.array(external_exports.string()).default([]),
  // Equivalence mode: 'value' (default, any expression that evaluates equal) or
  // 'exact-form' (normalized-string match). Absent = 'value'. Mirrors BlankToken.
  equivalence: external_exports.enum(["value", "exact-form"]).optional(),
  // Absolute sampling tolerance. Absent = no extra slack. Mirrors BlankToken.
  tolerance: external_exports.number().min(0).optional()
});
var InlineMathNode = external_exports.object({
  type: external_exports.literal("math_inline"),
  latex: external_exports.string(),
  // Model A: optional in-equation gradeable gaps (§MathPrompt). Optional with
  // NO default so a math node authored before Model A — or one with no gaps —
  // re-serializes BYTE-IDENTICALLY (a `.default([])` would materialize `prompts:
  // []` on every legacy node). Same optional-no-default discipline as
  // BlankToken.answerType/tolerance. See docs/design/math-blanks.md (Model A).
  prompts: external_exports.array(MathPrompt).optional()
});
var HardBreakNode = external_exports.object({
  type: external_exports.literal("hard_break")
});
var DefinitionContentText = external_exports.object({
  type: external_exports.literal("text"),
  text: external_exports.string(),
  marks: external_exports.array(SimpleMark).default([])
});
var DefinitionContentInline = external_exports.discriminatedUnion("type", [
  DefinitionContentText,
  InlineMathNode,
  HardBreakNode
]);
var DefinitionBlockId = external_exports.string().uuid().optional();
var DefinitionParagraphBlock = external_exports.object({
  id: DefinitionBlockId,
  type: external_exports.literal("paragraph"),
  content: external_exports.array(DefinitionContentInline).default([])
});
var DefinitionHeadingBlock = external_exports.object({
  id: DefinitionBlockId,
  type: external_exports.literal("heading"),
  level: external_exports.union([external_exports.literal(1), external_exports.literal(2), external_exports.literal(3)]),
  content: external_exports.array(DefinitionContentInline).default([])
});
var DefinitionMathBlock = external_exports.object({
  id: DefinitionBlockId,
  type: external_exports.literal("math_block"),
  latex: external_exports.string(),
  ...sizingFields
});
var DefinitionImageBlock = external_exports.object({
  id: DefinitionBlockId,
  type: external_exports.literal("image"),
  src: external_exports.string(),
  alt: external_exports.string().default(""),
  ...sizingFields,
  crop: CropRect.optional(),
  srcAspect: external_exports.number().positive().optional()
});
var DefinitionListItem = external_exports.lazy(
  () => external_exports.object({
    id: DefinitionBlockId,
    content: external_exports.array(DefinitionContentInline).default([]),
    children: external_exports.array(external_exports.union([DefinitionBulletListBlock, DefinitionOrderedListBlock])).optional()
  })
);
var DefinitionBulletListBlock = external_exports.object({
  id: DefinitionBlockId,
  type: external_exports.literal("bullet_list"),
  items: external_exports.array(DefinitionListItem).default([])
});
var DefinitionOrderedListBlock = external_exports.object({
  id: DefinitionBlockId,
  type: external_exports.literal("ordered_list"),
  items: external_exports.array(DefinitionListItem).default([])
});
var DefinitionBlock = external_exports.discriminatedUnion("type", [
  DefinitionParagraphBlock,
  DefinitionHeadingBlock,
  DefinitionMathBlock,
  DefinitionImageBlock,
  DefinitionBulletListBlock,
  DefinitionOrderedListBlock,
  GraphFigureBlock
]);
var DefinitionMark = external_exports.object({
  type: external_exports.literal("definition"),
  content: external_exports.array(DefinitionBlock).default([]),
  glossaryKey: external_exports.string().optional()
});
function upgradeDefinitionMark(m) {
  let content = m.content;
  const rest = { ...m };
  if (typeof rest.definition === "string" && content === void 0) {
    const text = rest.definition;
    content = text ? [{ type: "text", text }] : [];
  }
  delete rest.definition;
  const INLINE_TYPES = ["text", "math_inline", "hard_break"];
  if (Array.isArray(content) && content.length > 0) {
    const first = content[0];
    if (typeof first?.type === "string" && INLINE_TYPES.includes(first.type)) {
      content = [{ type: "paragraph", content }];
    }
  }
  const image = rest.image;
  delete rest.image;
  if (image !== null && typeof image === "object") {
    const { src, alt } = image;
    if (typeof src === "string" && src) {
      const blocks = Array.isArray(content) ? [...content] : [];
      blocks.push({
        type: "image",
        src,
        alt: typeof alt === "string" ? alt : ""
      });
      content = blocks;
    }
  }
  return { ...rest, content: content ?? [] };
}
var Mark = external_exports.preprocess(
  (m) => {
    if (typeof m === "string") return { type: m };
    if (m !== null && typeof m === "object" && m.type === "definition") {
      return upgradeDefinitionMark(m);
    }
    return m;
  },
  external_exports.discriminatedUnion("type", [
    BoldMark,
    ItalicMark,
    UnderlineMark,
    CodeMark,
    SubscriptMark,
    SuperscriptMark,
    DefinitionMark
  ])
);
var TextNode = external_exports.object({
  type: external_exports.literal("text"),
  text: external_exports.string(),
  // Default to empty marks array so callers don't need to specify when none.
  marks: external_exports.array(Mark).default([])
});
var InlineNode = external_exports.discriminatedUnion("type", [
  TextNode,
  InlineMathNode,
  HardBreakNode
]);
var BlankToken = external_exports.object({
  type: external_exports.literal("blank"),
  id: external_exports.string().uuid(),
  answer: external_exports.string().min(1),
  // Alternative correct answers. Empty array is the common case.
  acceptableAnswers: external_exports.array(external_exports.string()).default([]),
  width: external_exports.number().int().positive().optional(),
  // Optional teacher-authored nudge shown when this blank is wrong and no
  // mistakeFeedback entry matches. Rich inline content (formatted text + math).
  hint: external_exports.array(InlineNode).optional(),
  // Optional list of anticipated wrong answers paired with specific feedback.
  // If the student's wrong answer matches a `match` string (Phase 1: exact
  // match; the strategy-dispatch hook in the runtime supports smarter
  // matching later), the corresponding feedback is shown instead of the
  // generic hint. First match wins. `feedback` is rich inline content.
  mistakeFeedback: external_exports.array(external_exports.object({
    match: external_exports.string(),
    feedback: external_exports.array(InlineNode)
  })).optional(),
  // Order-independent answer grouping. When true, this blank's answer is
  // interchangeable with the blank immediately before it (in document order,
  // within the same block) — e.g. factoring `(x + ☐)(x + ☐)` where (2,3) and
  // (3,2) are both correct but (2,2) is not. A "group" is a maximal run of
  // adjacent blanks each flagged here; the renderer compiles runs into a
  // shared `data-blank-group` id, and the runtime scores the group with
  // consume-once matching (each correct answer can satisfy only one blank).
  //
  // This boolean is authoring *sugar*: the general model lives in the runtime
  // data-attribute contract (group ids), so richer grouping (non-adjacent,
  // cross-block) can be added later as an additive `group` field without a
  // breaking change. The first blank in a block ignores this flag (no
  // previous blank to group with).
  interchangeableWithPrevious: external_exports.boolean().default(false),
  // Answer interpretation mode. Absent (= 'text') keeps the Phase 1 behavior:
  // exact string match against answer + acceptableAnswers. 'numeric' tells the
  // runtime to parse BOTH the typed value and each key entry numerically
  // (decimals, fractions like 3/2, mixed numbers like "1 1/2", comma
  // separators, a leading $) and compare within `tolerance` — so 0.5, 1/2,
  // and .50 all satisfy an answer of "1/2". Optional rather than defaulted so
  // documents stored before this field existed re-serialize byte-identically.
  // 'math' (Model B math blanks) grades the typed value as a math EXPRESSION:
  // the runtime lazy-loads the graph-kit and compares by numeric-sampling
  // equivalence (2a ≡ a+a ≡ a*2), NOT string match. See docs/design/math-blanks.md.
  answerType: external_exports.enum(["text", "numeric", "math"]).optional(),
  // Absolute comparison tolerance. For 'numeric': |typed - key| <= tolerance.
  // For 'math': the absolute tolerance passed to the sampling comparison.
  // Absent = exact equality (numeric) / no extra slack (math).
  tolerance: external_exports.number().min(0).optional(),
  // Equivalence mode for 'math' blanks: 'value' (default, any expression that
  // evaluates equal) or 'exact-form' (normalized-string match — "write it in
  // this form"). Only meaningful when answerType is 'math'; absent = 'value'.
  equivalence: external_exports.enum(["value", "exact-form"]).optional()
});
var FillInBlankInline = external_exports.discriminatedUnion("type", [
  TextNode,
  InlineMathNode,
  HardBreakNode,
  BlankToken
]);

// packages/schema/src/blocks/paragraph.ts
var ParagraphBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("paragraph"),
  content: external_exports.array(InlineNode)
});

// packages/schema/src/blocks/heading.ts
var HeadingLevel = external_exports.union([external_exports.literal(1), external_exports.literal(2), external_exports.literal(3)]);
var HeadingBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("heading"),
  level: HeadingLevel,
  content: external_exports.array(InlineNode)
});

// packages/schema/src/label.ts
var BlockLabel = external_exports.discriminatedUnion("mode", [
  external_exports.object({ mode: external_exports.literal("auto") }),
  // min(1): an empty custom label is meaningless — author either wants text or
  // wants `none`. Keeps round-trip honest (no empty-string ghosts).
  external_exports.object({ mode: external_exports.literal("custom"), text: external_exports.string().min(1) }),
  external_exports.object({ mode: external_exports.literal("none") })
]);
var labelFields = {
  label: BlockLabel.optional()
};

// packages/schema/src/blocks/math-block.ts
var MathBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("math_block"),
  latex: external_exports.string(),
  // Model A: optional in-equation gradeable gaps (§MathPrompt, inline.ts).
  // Optional with NO default so a math block authored before Model A — or one
  // with no gaps — re-serializes BYTE-IDENTICALLY. See docs/design/math-blanks.md.
  prompts: external_exports.array(MathPrompt).optional(),
  // Worked explanation revealed post-check, mirroring FillInBlankBlock.solution.
  // Optional; only meaningful on a gap-bearing equation. Never leaks the gap
  // answer directly (the sanctioned reveal, per the runtime's no-leak stance).
  solution: external_exports.array(InlineNode).optional(),
  // Variable block sizing: optional width fraction + alignment (sizing.ts).
  ...sizingFields,
  // Per-block display label — a gap-bearing equation is a numbered problem by
  // default; custom/none opt out (numbering/label decouple). Inert on a
  // prompt-free display equation (it's never numbered regardless). See label.ts.
  ...labelFields
});

// packages/schema/src/blocks/callout.ts
var CalloutVariant = external_exports.enum(["info", "warning", "success", "note"]);
var CalloutBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("callout"),
  variant: CalloutVariant,
  content: external_exports.array(InlineNode)
});

// packages/schema/src/blocks/problem.ts
var ProblemBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("problem"),
  number: external_exports.number().int().positive().optional(),
  content: external_exports.array(InlineNode),
  solution: external_exports.array(InlineNode).optional(),
  skills: external_exports.array(external_exports.string()).default([])
});

// packages/schema/src/blocks/fill-in-blank.ts
var FillInBlankBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("fill_in_blank"),
  number: external_exports.number().int().positive().optional(),
  content: external_exports.array(FillInBlankInline),
  solution: external_exports.array(InlineNode).optional(),
  hasConfidenceRating: external_exports.boolean().default(false),
  skills: external_exports.array(external_exports.string()).default([]),
  workSpace: external_exports.number().min(0).optional(),
  // Per-block display label (auto/custom/none). Absent = auto =
  // today's numbered behavior. See label.ts.
  ...labelFields
});

// packages/schema/src/blocks/list.ts
var ListItem = external_exports.lazy(
  () => external_exports.object({
    id: external_exports.string().uuid(),
    content: external_exports.array(InlineNode),
    children: external_exports.array(external_exports.union([BulletListBlock, OrderedListBlock])).optional()
  })
);
var BulletListBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("bullet_list"),
  items: external_exports.array(ListItem)
});
var OrderedListBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("ordered_list"),
  items: external_exports.array(ListItem)
});

// packages/schema/src/blocks/interactive-graph.ts
var PointInteraction = external_exports.object({
  type: external_exports.literal("plot_point"),
  // One or more correct points; the student must plot all of them. A single
  // point is the common case; multiple supports e.g. "plot the two roots."
  correctPoints: external_exports.array(external_exports.tuple([external_exports.number(), external_exports.number()])).min(1),
  // Per-point tolerance in graph units (a Euclidean/each-axis radius, applied
  // by the kit's scorer). 0.1 default suits a snap-to-grid single point.
  tolerance: external_exports.number().nonnegative().default(0.1)
});
var FunctionInteraction = external_exports.object({
  type: external_exports.literal("plot_function"),
  models: external_exports.array(FunctionModel).min(1),
  // Drop 6: optional per-curve domain restrictions ("graph y = 2x + 3 for
  // x >= 0"), parallel to models by index. The freeform parser fills these from
  // a `for …` clause; the widget's endpoint-drag UX is the planned follow-up —
  // until it lands, the domain is authoring metadata drawn on the key, and
  // scoring remains on the curve parameters.
  domains: external_exports.array(CurveDomain.nullable()).optional()
});
var RegionAnswer = external_exports.object({
  correctVertices: external_exports.array(external_exports.tuple([external_exports.number(), external_exports.number()])).min(3),
  // 0.9 is strict (near-exact on a snapped grid); lower it for hand-dragged /
  // approximate regions.
  minOverlap: external_exports.number().min(0).max(1).default(0.9)
});
var RegionInteraction = external_exports.object({
  type: external_exports.literal("shade_region"),
  regions: external_exports.array(RegionAnswer).min(1)
});
var ShadeSideValue = external_exports.enum(["above", "below", "left", "right"]);
var InequalityAnswer = external_exports.object({
  boundary: FunctionModel,
  // true = strict (< / >, dotted boundary); false = inclusive (≤ / ≥, solid).
  strict: external_exports.boolean(),
  shadeSide: ShadeSideValue
});
var InequalityInteraction = external_exports.object({
  type: external_exports.literal("graph_inequality"),
  inequalities: external_exports.array(InequalityAnswer).min(1)
});
var DisplayInteraction = external_exports.object({
  type: external_exports.literal("display"),
  drawables: external_exports.array(Drawable).default([])
});
var RayAnswer = external_exports.object({
  // The ray's endpoint (scored on position + open/closed style).
  from: external_exports.tuple([external_exports.number(), external_exports.number()]),
  // Any second point ON the ray — names the direction; the student's through
  // handle may sit anywhere along the correct ray.
  through: external_exports.tuple([external_exports.number(), external_exports.number()]),
  fromStyle: EndpointStyle.default("closed"),
  // Endpoint position tolerance in graph units (matches the domain-glider
  // default). Direction is scored by unit-vector alignment kit-side.
  tolerance: external_exports.number().nonnegative().default(0.25)
});
var RayInteraction = external_exports.object({
  type: external_exports.literal("plot_ray"),
  rays: external_exports.array(RayAnswer).min(1)
});
var SegmentAnswer = external_exports.object({
  from: external_exports.tuple([external_exports.number(), external_exports.number()]),
  to: external_exports.tuple([external_exports.number(), external_exports.number()]),
  // [from-endpoint style, to-endpoint style]. Scored order-independently —
  // the student may draw the segment in either direction.
  endpoints: external_exports.tuple([EndpointStyle, EndpointStyle]).default(["closed", "closed"]),
  tolerance: external_exports.number().nonnegative().default(0.25)
});
var SegmentInteraction = external_exports.object({
  type: external_exports.literal("plot_segment"),
  segments: external_exports.array(SegmentAnswer).min(1)
});
var GraphInteraction = external_exports.discriminatedUnion("type", [
  PointInteraction,
  FunctionInteraction,
  RegionInteraction,
  InequalityInteraction,
  RayInteraction,
  SegmentInteraction,
  DisplayInteraction
]);
var InteractiveGraphBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("interactive_graph"),
  number: external_exports.number().int().positive().optional(),
  ...labelFields,
  prompt: external_exports.array(InlineNode),
  axisConfig: AxisConfig,
  interaction: GraphInteraction,
  // When true, a multi-part graph (several points, a system of curves/regions,
  // or — from Drop 4 — an inequality's line + side + style) scores fractionally
  // per object and the dashboard itemizes it; when false (default) it is all-or-
  // nothing. The flag + the kit's per-object scoring engine land here (Drop 2);
  // the runtime + submission consume the fraction at the Drop 4 wire bump.
  partialCredit: external_exports.boolean().default(false),
  // When true, the student gets a "cannot be graphed / no solution" choice, and
  // the answer key may mark THAT as the correct answer (trick questions). The
  // flag lands here (Drop 2); the student control + no-solution response ride the
  // Drop 4 wire bump.
  allowNoSolution: external_exports.boolean().default(false),
  // Trick questions: when true (requires allowNoSolution), "no solution" IS the
  // correct answer and the drawn answer key is a decoy. A student who selects
  // no-solution is correct; one who draws anything is not.
  noSolutionCorrect: external_exports.boolean().default(false),
  // Built-in mistake classifiers (swapped coordinates, swapped slope/intercept,
  // right-boundary-wrong-side, …) show a targeted nudge instead of the generic
  // "Not quite" after a check. Default ON; a teacher can switch them off. The
  // classifier catalogue + messages live kit-side (graph-score.ts) — this flag
  // only gates them.
  builtinFeedback: external_exports.boolean().default(true),
  // Authored anticipated mistakes — the graph twin of BlankToken.mistakeFeedback.
  // `match` is a freeform graph answer in the SAME syntax the authoring formula
  // field accepts ("(4, 3)", "y = x + 2", "y < 2x + 1"); the kit parses it with
  // the same parser and compares against the student's answer with the same
  // tolerances as scoring. First match wins, and an authored match beats a
  // built-in classifier. `feedback` is rich inline content, shown (post-check
  // only) in the block's feedback line.
  mistakeFeedback: external_exports.array(external_exports.object({
    match: external_exports.string(),
    feedback: external_exports.array(InlineNode)
  })).default([]),
  solution: external_exports.array(InlineNode).optional(),
  hasConfidenceRating: external_exports.boolean().default(false),
  skills: external_exports.array(external_exports.string()).default([]),
  // Variable block sizing: optional width fraction + alignment (sizing.ts).
  // Author-set display footprint for the figure; renderer honors it via the
  // shared .block-sized path. Additive/optional — no schemaVersion bump.
  ...sizingFields
});

// packages/schema/src/blocks/multiple-choice.ts
var ChoiceImage = external_exports.object({
  src: external_exports.string().url(),
  alt: external_exports.string().default("")
});
var ChoiceGraph = external_exports.object({
  axis: AxisConfig,
  drawables: external_exports.array(Drawable).default([])
});
var MultipleChoiceOption = external_exports.object({
  id: external_exports.string().uuid(),
  // Rich inline content (formatted text + inline math). Non-empty is an
  // editor concern, not a schema one (mid-edit drafts must save).
  content: external_exports.array(InlineNode),
  correct: external_exports.boolean().default(false),
  // Optional per-choice explanation, revealed post-check when this choice was
  // selected. Rich inline content, like blank mistakeFeedback entries.
  feedback: external_exports.array(InlineNode).optional(),
  // Optional figure below the choice text — the additive widening the header
  // comment reserved. Both may technically coexist (image renders first);
  // the editor UI treats them as a single figure slot.
  image: ChoiceImage.optional(),
  graph: ChoiceGraph.optional()
});
var MultipleChoiceBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("multiple_choice"),
  number: external_exports.number().int().positive().optional(),
  ...labelFields,
  // The question prose (rich inline content, like a problem statement).
  prompt: external_exports.array(InlineNode),
  choices: external_exports.array(MultipleChoiceOption).min(2),
  // false = single answer (radios, exactly one selectable); true = "select
  // all that apply" (checkboxes). Scoring is set equality either way.
  multiSelect: external_exports.boolean().default(false),
  // Worked explanation for the whole problem, revealed post-check regardless
  // of correctness (same contract as FillInBlankBlock.solution).
  solution: external_exports.array(InlineNode).optional(),
  hasConfidenceRating: external_exports.boolean().default(false),
  skills: external_exports.array(external_exports.string()).default([]),
  // Per-problem print work-space override (rem); absent = inherit the
  // activity-level default (see FillInBlankBlock.workSpace for the CSS
  // custom-property reasoning).
  workSpace: external_exports.number().min(0).optional()
});

// packages/schema/src/blocks/matching.ts
var MatchingItem = external_exports.object({
  id: external_exports.string().uuid(),
  // Rich inline content (formatted text + inline math). Non-empty is an
  // editor concern, not a schema one (mid-edit drafts must save).
  content: external_exports.array(InlineNode),
  // Optional figure below the item text (same single-figure-slot treatment
  // as MC choices; image renders first if both are somehow set).
  image: ChoiceImage.optional(),
  graph: ChoiceGraph.optional()
});
var MatchingTarget = external_exports.object({
  id: external_exports.string().uuid(),
  content: external_exports.array(InlineNode),
  image: ChoiceImage.optional(),
  graph: ChoiceGraph.optional()
});
var MatchingBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("matching"),
  number: external_exports.number().int().positive().optional(),
  ...labelFields,
  // The question prose (rich inline content, like a problem statement).
  prompt: external_exports.array(InlineNode),
  // Left column, document order.
  items: external_exports.array(MatchingItem).min(2),
  // Right column; may exceed items (extra targets are distractors). Letters
  // are assigned by position AFTER the publish-time shuffle, never authored.
  targets: external_exports.array(MatchingTarget).min(2),
  // The correct pairing: item id → target id. Partial during authoring (see
  // header); multiple items may share a target only under allowTargetReuse.
  key: external_exports.record(external_exports.string().uuid(), external_exports.string().uuid()),
  // false = one-to-one (docking moves the card; a used target can't be used
  // again). true = many-to-one allowed (docking copies the card).
  allowTargetReuse: external_exports.boolean().default(false),
  // MC-parity problem chrome (one problem shape, one dashboard row shape).
  solution: external_exports.array(InlineNode).optional(),
  hasConfidenceRating: external_exports.boolean().default(false),
  skills: external_exports.array(external_exports.string()).default([]),
  workSpace: external_exports.number().min(0).optional()
});

// packages/schema/src/blocks/ordering.ts
var OrderingItem = external_exports.object({
  id: external_exports.string().uuid(),
  // Rich inline content (formatted text + inline math). Non-empty is an
  // editor concern, not a schema one (mid-edit drafts must save).
  content: external_exports.array(InlineNode)
});
var OrderingBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("ordering"),
  number: external_exports.number().int().positive().optional(),
  ...labelFields,
  // The question prose (rich inline content, like a problem statement).
  prompt: external_exports.array(InlineNode),
  // Authored order = correct order. The renderer shuffles deterministically
  // (seeded by block id) for the student-facing arrangement.
  items: external_exports.array(OrderingItem).min(2),
  // MC-parity problem chrome (one problem shape, one dashboard row shape).
  solution: external_exports.array(InlineNode).optional(),
  hasConfidenceRating: external_exports.boolean().default(false),
  skills: external_exports.array(external_exports.string()).default([]),
  workSpace: external_exports.number().min(0).optional()
});

// packages/schema/src/blocks/number-line.ts
var NumberLineConfig = external_exports.object({
  min: external_exports.number(),
  max: external_exports.number(),
  // Spacing between LABELED ticks (line units).
  tickStep: external_exports.number().positive().default(1),
  // Unlabeled minor ticks drawn between each pair of labeled ticks (0 = none).
  // Visual only — never scored.
  minorTicksPerStep: external_exports.number().int().nonnegative().default(0),
  // When true, a dragged handle snaps to the nearest tick (minor if present,
  // else the labeled step). Keyboard nudge always moves by one tick regardless
  // (Shift = fine, one-tenth of a tick).
  snapToTick: external_exports.boolean().default(true)
});
var NumberLinePointInteraction = external_exports.object({
  type: external_exports.literal("plot_point"),
  // Correct positions in line units. A single point is the common case.
  correctPoints: external_exports.array(external_exports.number()).min(1),
  // Match radius in line units (a point is correct within +/- tolerance).
  tolerance: external_exports.number().nonnegative().default(0.1)
});
var NumberLineInterval = external_exports.object({
  min: external_exports.number().optional(),
  minStyle: EndpointStyle.optional(),
  max: external_exports.number().optional(),
  maxStyle: EndpointStyle.optional()
});
var NumberLineIntervalInteraction = external_exports.object({
  type: external_exports.literal("plot_interval"),
  correctInterval: NumberLineInterval,
  // Match radius in line units, applied to each present endpoint.
  tolerance: external_exports.number().nonnegative().default(0.1)
});
var NumberLineInteraction = external_exports.discriminatedUnion("type", [
  NumberLinePointInteraction,
  NumberLineIntervalInteraction
]);
var NumberLineBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("number_line"),
  number: external_exports.number().int().positive().optional(),
  ...labelFields,
  prompt: external_exports.array(InlineNode),
  config: NumberLineConfig,
  interaction: NumberLineInteraction,
  solution: external_exports.array(InlineNode).optional(),
  hasConfidenceRating: external_exports.boolean().default(false),
  skills: external_exports.array(external_exports.string()).default([]),
  // Variable block sizing: optional width fraction + alignment (sizing.ts).
  // Additive/optional — no schemaVersion bump.
  ...sizingFields
});

// packages/schema/src/blocks/data-plot.ts
var DataPlotConfig = NumberLineConfig.extend({
  // Equal-width bin size spanning [min, max]; only read when chart ==
  // 'histogram'. Absent → the histogram falls back to `tickStep` as the bin
  // width. Positive.
  binWidth: external_exports.number().positive().optional(),
  // Fixed ceiling for the histogram/dot-plot vertical scale. Absent → the
  // scale auto-fits the tallest bar/stack from `data`. A fixed value keeps
  // several plots on a page visually comparable. Positive integer (frequency).
  maxFrequency: external_exports.number().int().positive().optional()
});
var DataPlotChart = external_exports.enum(["dotplot", "histogram", "boxplot"]);
var DataPlotDisplayInteraction = external_exports.object({
  type: external_exports.literal("display"),
  chart: DataPlotChart
});
var DataPlotDotplotInteraction = external_exports.object({
  type: external_exports.literal("build_dotplot")
});
var DataPlotHistogramInteraction = external_exports.object({
  type: external_exports.literal("build_histogram")
});
var DataPlotBoxplotInteraction = external_exports.object({
  type: external_exports.literal("build_boxplot"),
  // Match radius in line units, applied to each of the five handles. Default
  // half a unit tick.
  tolerance: external_exports.number().nonnegative().default(0.5)
});
var DataPlotInteraction = external_exports.discriminatedUnion("type", [
  DataPlotDisplayInteraction,
  DataPlotDotplotInteraction,
  DataPlotHistogramInteraction,
  DataPlotBoxplotInteraction
]);
var DataPlotBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("data_plot"),
  number: external_exports.number().int().positive().optional(),
  ...labelFields,
  prompt: external_exports.array(InlineNode),
  // The dataset. Single source of truth: the chart is drawn from it and, in
  // build mode, the correct answer is derived from it. Non-empty.
  data: external_exports.array(external_exports.number()).min(1),
  config: DataPlotConfig,
  interaction: DataPlotInteraction,
  solution: external_exports.array(InlineNode).optional(),
  hasConfidenceRating: external_exports.boolean().default(false),
  skills: external_exports.array(external_exports.string()).default([]),
  // Variable block sizing: optional width fraction + alignment (sizing.ts).
  // Additive/optional — no schemaVersion bump.
  ...sizingFields
});

// packages/schema/src/blocks/learning-objectives.ts
var LearningObjectivesBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("learning_objectives"),
  title: external_exports.string(),
  items: external_exports.array(external_exports.array(InlineNode))
});

// packages/schema/src/blocks/worked-example.ts
var WorkedExampleChild = external_exports.discriminatedUnion("type", [
  ParagraphBlock,
  HeadingBlock,
  MathBlock,
  ImageBlock,
  BulletListBlock,
  OrderedListBlock
]);
var WorkedExampleBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("worked_example"),
  title: external_exports.string(),
  content: external_exports.array(WorkedExampleChild)
});

// packages/schema/src/blocks/faded-worked-example.ts
var FadedWorkedExampleChild = external_exports.discriminatedUnion("type", [
  ParagraphBlock,
  HeadingBlock,
  MathBlock,
  ImageBlock,
  BulletListBlock,
  OrderedListBlock,
  FillInBlankBlock
]);
var FadedWorkedExampleBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("faded_worked_example"),
  title: external_exports.string(),
  content: external_exports.array(FadedWorkedExampleChild),
  // The whole box is ONE numbered problem (its number leads the title); the
  // faded fill_in_blank steps are lettered (a), (b)… WITHIN the box instead of
  // consuming worksheet problem numbers. showStepLabels toggles those letters
  // off per box (bare blanks, no gutter) for teachers who want maximum writing
  // room. Defaulted so pre-existing documents (no field) render labelled.
  showStepLabels: external_exports.boolean().default(true)
});

// packages/schema/src/blocks/self-explanation.ts
var SelfExplanationBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("self_explanation"),
  prompt: external_exports.array(InlineNode),
  placeholder: external_exports.string().optional()
});

// packages/schema/src/blocks/free-response.ts
var RubricCriterion = external_exports.object({
  id: external_exports.string().uuid(),
  label: external_exports.string().min(1),
  maxPoints: external_exports.number().positive().finite(),
  description: external_exports.string().optional()
});
var Rubric = external_exports.object({
  criteria: external_exports.array(RubricCriterion).min(1)
});
var ShortAnswerBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("short_answer"),
  prompt: external_exports.array(InlineNode),
  placeholder: external_exports.string().optional(),
  rubric: Rubric.optional()
});
var WordCountHint = external_exports.object({
  min: external_exports.number().int().positive().optional(),
  max: external_exports.number().int().positive().optional()
}).refine(
  (h) => h.min === void 0 || h.max === void 0 || h.min <= h.max,
  { message: "wordCountHint.min must be \u2264 max" }
);
var EssayBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("essay"),
  prompt: external_exports.array(InlineNode),
  placeholder: external_exports.string().optional(),
  wordCountHint: WordCountHint.optional(),
  rubric: Rubric.optional()
});

// packages/schema/src/blocks/index.ts
var Block = external_exports.discriminatedUnion("type", [
  ParagraphBlock,
  HeadingBlock,
  MathBlock,
  ImageBlock,
  CalloutBlock,
  ProblemBlock,
  FillInBlankBlock,
  BulletListBlock,
  OrderedListBlock,
  InteractiveGraphBlock,
  MultipleChoiceBlock,
  MatchingBlock,
  OrderingBlock,
  NumberLineBlock,
  DataPlotBlock,
  LearningObjectivesBlock,
  WorkedExampleBlock,
  FadedWorkedExampleBlock,
  SelfExplanationBlock,
  ShortAnswerBlock,
  EssayBlock,
  GraphFigureBlock
]);

// packages/schema/src/layout.ts
var ColumnGridLines = external_exports.enum(["inherit", "on", "off"]);
var Column = external_exports.object({
  id: external_exports.string().uuid(),
  // Per-column width weight (fr units). Optional; absent = equal split.
  width: external_exports.number().positive().optional(),
  // Reserved work-space floor in rem (a min-height, not a fixed height).
  minHeight: external_exports.number().positive().optional(),
  // A column holds a non-empty STACK of blocks (block+). A column can hold a
  // heading followed by several problems — the thing a document tool needs and
  // a one-block-per-row model can't express.
  blocks: external_exports.array(Block).min(1)
});
var Row = external_exports.object({
  id: external_exports.string().uuid(),
  columns: external_exports.array(Column).min(1).max(6),
  gridLines: ColumnGridLines.default("inherit")
});

// packages/schema/src/document.ts
var Section = external_exports.object({
  id: external_exports.string().uuid(),
  title: external_exports.string().optional(),
  isCheckpoint: external_exports.boolean().default(false),
  rows: external_exports.array(Row)
});
var PrintHeader = external_exports.object({
  name: external_exports.boolean().default(true),
  date: external_exports.boolean().default(true),
  period: external_exports.boolean().default(false),
  class: external_exports.boolean().default(false),
  score: external_exports.boolean().default(false),
  custom: external_exports.array(external_exports.string()).default([])
});
var PrintConfig = external_exports.object({
  paperSize: external_exports.enum(["letter", "a4"]).default("letter"),
  columns: external_exports.number().int().min(1).max(3).default(1),
  workSpace: external_exports.number().min(0).default(0),
  fontSize: external_exports.number().positive().default(11),
  problemSpacing: external_exports.number().min(0).default(1),
  margin: external_exports.number().min(0).default(0.5),
  gridLines: external_exports.boolean().default(false),
  printReferencePanel: external_exports.boolean().default(true),
  printDefinitionGlossary: external_exports.boolean().default(false),
  header: PrintHeader.default({})
});
var ActivityFont = external_exports.enum([
  "default",
  "lexend",
  "atkinson-hyperlegible",
  "andika",
  "comic-neue"
]);
var Typography = external_exports.object({
  font: ActivityFont.default("default"),
  fontSize: external_exports.number().min(12).max(24).default(16)
});
var ActivityMeta = external_exports.object({
  title: external_exports.string().min(1),
  course: external_exports.string().default("Algebra II"),
  unit: external_exports.string().optional(),
  submissionMode: external_exports.enum(["single", "locked", "free"]).default("free"),
  revisionMode: external_exports.enum(["free", "locked"]).default("free"),
  gradingMode: external_exports.enum(["auto", "manual", "mixed"]).default("auto"),
  activityType: external_exports.enum(["worksheet", "exit_ticket", "warm_up", "review"]).default("worksheet"),
  answerFeedback: external_exports.enum(["immediate", "on_check"]).default("on_check"),
  skills: external_exports.array(external_exports.string()).default([]),
  print: PrintConfig.default({}),
  typography: Typography.optional()
});
var ReferencePanel = external_exports.object({
  title: external_exports.string().optional(),
  blocks: external_exports.array(Block)
});
var RegressionModel = external_exports.enum([
  "linear",
  "quadratic",
  "exponential",
  "logarithmic"
]);
var CalculatorRestrictions = external_exports.object({
  mode: external_exports.enum(["scientific", "graphing"]).default("scientific"),
  allowTrig: external_exports.boolean().default(true),
  allowLogExp: external_exports.boolean().default(true),
  // Inequality rows in the graphing expression list (calculator-parity batch).
  // Additive + defaulted like the other gates — no schemaVersion bump; the kit
  // reads a missing value as permissive, so old published pages stay full-tool.
  allowInequalities: external_exports.boolean().default(true),
  allowedRegressionModels: external_exports.array(RegressionModel).default(["linear", "quadratic", "exponential", "logarithmic"]),
  // Stage 4: cap on the graphing expression list. ABSENT = unlimited (the
  // permissive default — optional, not defaulted, so it stays out of stored
  // docs unless a teacher sets it). Graphing mode only.
  maxExpressions: external_exports.number().int().min(1).max(50).optional()
});
var CalculatorTool = external_exports.object({
  enabled: external_exports.boolean().default(false),
  restrictions: CalculatorRestrictions.default({})
});
var ActivityDocument = external_exports.object({
  schemaVersion: external_exports.literal(2),
  meta: ActivityMeta,
  sections: external_exports.array(Section),
  referencePanel: ReferencePanel.optional(),
  calculator: CalculatorTool.optional()
});

// packages/schema/src/upgrade.ts
var ACTIVITY_SCHEMA_VERSION = 2;
var UpgradeError = class extends Error {
  constructor(message, storedVersion) {
    super(message);
    this.storedVersion = storedVersion;
    this.name = "UpgradeError";
  }
};
var UPGRADES = [];
function upgradeActivityDocument(raw) {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new UpgradeError("Stored content is not an object");
  }
  const stored = raw;
  const version = stored.schemaVersion;
  if (typeof version !== "number" || !Number.isInteger(version)) {
    throw new UpgradeError("Stored content has no integer schemaVersion");
  }
  if (version > ACTIVITY_SCHEMA_VERSION) {
    throw new UpgradeError(
      `Stored schemaVersion ${version} is newer than this build's ${ACTIVITY_SCHEMA_VERSION} \u2014 refusing to guess`,
      version
    );
  }
  let current = stored;
  let at = version;
  while (at < ACTIVITY_SCHEMA_VERSION) {
    const step = UPGRADES.find((u) => u.from === at);
    if (!step) {
      throw new UpgradeError(
        `No upgrade path from schemaVersion ${at} \u2014 cannot serve`,
        version
      );
    }
    current = step.run(current);
    at += 1;
  }
  const parsed = ActivityDocument.safeParse(current);
  if (!parsed.success) {
    throw new UpgradeError(
      `Content failed validation at schemaVersion ${at}: ` + parsed.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      version
    );
  }
  return { doc: parsed.data, fromSchemaVersion: version };
}

// packages/schema/src/submission.ts
var ConfidenceLevel = external_exports.enum(["unsure", "think_so", "certain"]);
var BlankResponse = external_exports.object({
  answer: external_exports.string(),
  correct: external_exports.boolean(),
  confidence: ConfidenceLevel.optional()
});
var PointResponse = external_exports.object({
  type: external_exports.literal("plot_point"),
  // Every point the student plotted, in graph units. Order follows the block's
  // correctPoints for multi-point questions; a single point is the common case.
  studentPoints: external_exports.array(external_exports.tuple([external_exports.number(), external_exports.number()])),
  correct: external_exports.boolean(),
  confidence: ConfidenceLevel.optional()
});
var FunctionResponse = external_exports.object({
  type: external_exports.literal("plot_function"),
  studentPoints: external_exports.array(external_exports.tuple([external_exports.number(), external_exports.number()])),
  correct: external_exports.boolean(),
  confidence: ConfidenceLevel.optional()
});
var RegionResponse = external_exports.object({
  type: external_exports.literal("shade_region"),
  studentPoints: external_exports.array(external_exports.tuple([external_exports.number(), external_exports.number()])),
  correct: external_exports.boolean(),
  confidence: ConfidenceLevel.optional()
});
var InequalityResponse = external_exports.object({
  type: external_exports.literal("graph_inequality"),
  studentPoints: external_exports.array(external_exports.tuple([external_exports.number(), external_exports.number()])),
  strict: external_exports.boolean(),
  side: external_exports.enum(["above", "below", "left", "right"]),
  correct: external_exports.boolean(),
  confidence: ConfidenceLevel.optional()
});
var RayResponse = external_exports.object({
  type: external_exports.literal("plot_ray"),
  studentPoints: external_exports.array(external_exports.tuple([external_exports.number(), external_exports.number()])),
  // The student's chosen SHAPE (ray direction / segment) — a graded part of
  // the answer since the shape-toggle widget; absent = never chosen (or a
  // pre-toggle submission). Optional + additive within v4.
  shape: external_exports.enum(["ray_positive", "ray_negative", "segment"]).optional(),
  fromStyle: external_exports.enum(["open", "closed"]),
  correct: external_exports.boolean(),
  confidence: ConfidenceLevel.optional()
});
var SegmentResponse = external_exports.object({
  type: external_exports.literal("plot_segment"),
  studentPoints: external_exports.array(external_exports.tuple([external_exports.number(), external_exports.number()])),
  shape: external_exports.enum(["ray_positive", "ray_negative", "segment"]).optional(),
  endpoints: external_exports.tuple([external_exports.enum(["open", "closed"]), external_exports.enum(["open", "closed"])]),
  correct: external_exports.boolean(),
  confidence: ConfidenceLevel.optional()
});
var SystemInequalityResponse = external_exports.object({
  type: external_exports.literal("graph_inequality_system"),
  // One per boundary; at least two for a real system, but min(1) keeps the
  // scorer/parse total (an under-count can't match every authored key → wrong).
  parts: external_exports.array(InequalityResponse).min(1),
  correct: external_exports.boolean(),
  confidence: ConfidenceLevel.optional()
});
var SystemFunctionResponse = external_exports.object({
  type: external_exports.literal("plot_function_system"),
  // One per curve; min(1) keeps the parse total (an under-count can't match
  // every authored model → wrong).
  parts: external_exports.array(FunctionResponse).min(1),
  correct: external_exports.boolean(),
  confidence: ConfidenceLevel.optional()
});
var GraphResponse = external_exports.discriminatedUnion("type", [
  PointResponse,
  FunctionResponse,
  RegionResponse,
  InequalityResponse
]);
var V4Extras = {
  noSolution: external_exports.boolean().optional(),
  earned: external_exports.number().nonnegative().optional(),
  total: external_exports.number().positive().optional(),
  // Domain-restricted plot_function (rays/segments): the student's endpoint
  // positions + open/closed choices. Optional and additive within v4.
  domain: external_exports.object({
    minX: external_exports.number().optional(),
    minStyle: external_exports.enum(["open", "closed"]).optional(),
    maxX: external_exports.number().optional(),
    maxStyle: external_exports.enum(["open", "closed"]).optional()
  }).optional()
};
var GraphResponseV4 = external_exports.discriminatedUnion("type", [
  PointResponse.extend(V4Extras),
  FunctionResponse.extend(V4Extras),
  RegionResponse.extend(V4Extras),
  InequalityResponse.extend(V4Extras),
  RayResponse.extend(V4Extras),
  SegmentResponse.extend(V4Extras),
  // Graph systems: additive members. earned/total (V4Extras) carry the
  // per-object partial credit; noSolution/domain ride along but are unused by a
  // system (kept for union uniformity, like every other member).
  SystemInequalityResponse.extend(V4Extras),
  SystemFunctionResponse.extend(V4Extras)
]);
var CheckpointResult = external_exports.object({
  checkedAt: external_exports.string().datetime(),
  // ISO timestamp from runtime
  score: external_exports.number().nonnegative(),
  // fractional under partialCredit (v4)
  total: external_exports.number().int().positive()
});
var BLANK_ID_KEY = external_exports.string().refine(
  (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s) || /^g[0-9a-f]{32}$/i.test(s),
  { message: "Blank id must be a uuid or a math-gap id (g + 32 hex)" }
);
var SubmissionResponsesV1 = external_exports.object({
  schemaVersion: external_exports.literal(1),
  blanks: external_exports.record(external_exports.string().uuid(), external_exports.object({
    answer: external_exports.string(),
    correct: external_exports.boolean()
  }))
});
var SubmissionResponsesV2 = external_exports.object({
  schemaVersion: external_exports.literal(2),
  blanks: external_exports.record(external_exports.string().uuid(), BlankResponse),
  checkpointResults: external_exports.record(external_exports.string().uuid(), CheckpointResult).optional()
});
var SubmissionResponsesV3 = external_exports.object({
  schemaVersion: external_exports.literal(3),
  blanks: external_exports.record(external_exports.string().uuid(), BlankResponse),
  checkpointResults: external_exports.record(external_exports.string().uuid(), CheckpointResult).optional(),
  graphResponses: external_exports.record(external_exports.string().uuid(), GraphResponse).optional()
});
var SubmissionResponsesV4 = external_exports.object({
  schemaVersion: external_exports.literal(4),
  blanks: external_exports.record(external_exports.string().uuid(), BlankResponse),
  checkpointResults: external_exports.record(external_exports.string().uuid(), CheckpointResult).optional(),
  graphResponses: external_exports.record(external_exports.string().uuid(), GraphResponseV4).optional()
});
var ChoiceResponse = external_exports.object({
  // Selected choice ids (MultipleChoiceOption.id), in document order.
  // Non-empty: an unanswered block is simply absent from the map (an
  // omission), like an unanswered graph.
  selected: external_exports.array(external_exports.string().uuid()).min(1),
  correct: external_exports.boolean(),
  confidence: ConfidenceLevel.optional()
});
var SubmissionResponsesV5 = external_exports.object({
  schemaVersion: external_exports.literal(5),
  blanks: external_exports.record(external_exports.string().uuid(), BlankResponse),
  checkpointResults: external_exports.record(external_exports.string().uuid(), CheckpointResult).optional(),
  graphResponses: external_exports.record(external_exports.string().uuid(), GraphResponseV4).optional(),
  choices: external_exports.record(external_exports.string().uuid(), ChoiceResponse).optional()
});
var MatchResponse = external_exports.object({
  // item id → docked target id. Non-empty: a block with no pairs made is an
  // omission (absent from the map), like an unanswered graph or MC block.
  pairs: external_exports.record(external_exports.string().uuid(), external_exports.string().uuid()).refine((pairs) => Object.keys(pairs).length > 0, {
    message: "an answered matching block has at least one pair"
  }),
  correct: external_exports.boolean(),
  earned: external_exports.number().int().nonnegative(),
  total: external_exports.number().int().positive(),
  confidence: ConfidenceLevel.optional()
});
var OrderResponse = external_exports.object({
  order: external_exports.array(external_exports.string().uuid()).min(2),
  correct: external_exports.boolean(),
  confidence: ConfidenceLevel.optional()
});
var NumberLinePointResponse = external_exports.object({
  type: external_exports.literal("plot_point"),
  // Every position the student plotted, in line units. Order follows the block's
  // correctPoints for multi-point questions; a single point is the common case.
  studentPoints: external_exports.array(external_exports.number()),
  correct: external_exports.boolean(),
  confidence: ConfidenceLevel.optional()
});
var NumberLineIntervalResponse = external_exports.object({
  type: external_exports.literal("plot_interval"),
  min: external_exports.number().optional(),
  minStyle: external_exports.enum(["open", "closed"]).optional(),
  max: external_exports.number().optional(),
  maxStyle: external_exports.enum(["open", "closed"]).optional(),
  correct: external_exports.boolean(),
  confidence: ConfidenceLevel.optional()
});
var NumberLineResponse = external_exports.discriminatedUnion("type", [
  NumberLinePointResponse,
  NumberLineIntervalResponse
]);
var DataPlotDotplotResponse = external_exports.object({
  type: external_exports.literal("build_dotplot"),
  // Every dot the student placed, as its value on the axis (a multiset — the
  // frequency map derives from counting). Non-empty: a block with no dots is an
  // omission (absent from the map), like an unanswered graph or number line.
  studentValues: external_exports.array(external_exports.number()).min(1),
  correct: external_exports.boolean(),
  confidence: ConfidenceLevel.optional()
});
var DataPlotHistogramResponse = external_exports.object({
  type: external_exports.literal("build_histogram"),
  studentBins: external_exports.array(external_exports.number()).min(1),
  correct: external_exports.boolean(),
  confidence: ConfidenceLevel.optional()
});
var DataPlotBoxplotResponse = external_exports.object({
  type: external_exports.literal("build_boxplot"),
  studentFive: external_exports.object({
    min: external_exports.number(),
    q1: external_exports.number(),
    median: external_exports.number(),
    q3: external_exports.number(),
    max: external_exports.number()
  }),
  correct: external_exports.boolean(),
  confidence: ConfidenceLevel.optional()
});
var DataPlotResponse = external_exports.discriminatedUnion("type", [
  DataPlotDotplotResponse,
  DataPlotHistogramResponse,
  DataPlotBoxplotResponse
]);
var SubmissionResponsesV6 = external_exports.object({
  schemaVersion: external_exports.literal(6),
  blanks: external_exports.record(external_exports.string().uuid(), BlankResponse),
  checkpointResults: external_exports.record(external_exports.string().uuid(), CheckpointResult).optional(),
  graphResponses: external_exports.record(external_exports.string().uuid(), GraphResponseV4).optional(),
  choices: external_exports.record(external_exports.string().uuid(), ChoiceResponse).optional(),
  matches: external_exports.record(external_exports.string().uuid(), MatchResponse).optional(),
  orderings: external_exports.record(external_exports.string().uuid(), OrderResponse).optional()
});
var SubmissionResponsesV7 = external_exports.object({
  schemaVersion: external_exports.literal(7),
  blanks: external_exports.record(external_exports.string().uuid(), BlankResponse),
  checkpointResults: external_exports.record(external_exports.string().uuid(), CheckpointResult).optional(),
  graphResponses: external_exports.record(external_exports.string().uuid(), GraphResponseV4).optional(),
  choices: external_exports.record(external_exports.string().uuid(), ChoiceResponse).optional(),
  matches: external_exports.record(external_exports.string().uuid(), MatchResponse).optional(),
  orderings: external_exports.record(external_exports.string().uuid(), OrderResponse).optional(),
  numberLineResponses: external_exports.record(external_exports.string().uuid(), NumberLineResponse).optional()
});
var FreeResponse = external_exports.object({
  text: external_exports.string().min(1)
});
var SubmissionResponsesV8 = external_exports.object({
  schemaVersion: external_exports.literal(8),
  blanks: external_exports.record(external_exports.string().uuid(), BlankResponse),
  checkpointResults: external_exports.record(external_exports.string().uuid(), CheckpointResult).optional(),
  graphResponses: external_exports.record(external_exports.string().uuid(), GraphResponseV4).optional(),
  choices: external_exports.record(external_exports.string().uuid(), ChoiceResponse).optional(),
  matches: external_exports.record(external_exports.string().uuid(), MatchResponse).optional(),
  orderings: external_exports.record(external_exports.string().uuid(), OrderResponse).optional(),
  numberLineResponses: external_exports.record(external_exports.string().uuid(), NumberLineResponse).optional(),
  dataPlotResponses: external_exports.record(external_exports.string().uuid(), DataPlotResponse).optional()
});
var SubmissionResponses = external_exports.object({
  schemaVersion: external_exports.literal(9),
  // Keyed by blank.id — a uuid, OR a math-gap id (Model A). See BLANK_ID_KEY.
  // Only the CURRENT version is widened: gaps postdate v9 and shipped without a
  // wire bump, so every gap-bearing page sends v9. The frozen v1–v8 shapes stay
  // uuid-only, which is what they could ever have contained.
  blanks: external_exports.record(BLANK_ID_KEY, BlankResponse),
  // Keyed by section.id. Only present in locked/free submission modes for
  // sections that were actually checkpoint-checked. Absent in single mode
  // and absent for non-checkpoint sections.
  checkpointResults: external_exports.record(external_exports.string().uuid(), CheckpointResult).optional(),
  // Keyed by interactive_graph block.id (uuid). Absent when the activity
  // has no graph blocks or none were answered. Sibling to `blanks`, never
  // merged into it — geometric answers are shaped differently and the
  // dashboard renders them differently (see the extension pattern above).
  graphResponses: external_exports.record(external_exports.string().uuid(), GraphResponseV4).optional(),
  // Keyed by multiple_choice block.id (uuid). Absent when the activity has
  // no MC blocks or none were answered (same omission rule as graphs).
  choices: external_exports.record(external_exports.string().uuid(), ChoiceResponse).optional(),
  // Keyed by matching block.id (uuid). Same omission rule.
  matches: external_exports.record(external_exports.string().uuid(), MatchResponse).optional(),
  // Keyed by ordering block.id (uuid). Same omission rule.
  orderings: external_exports.record(external_exports.string().uuid(), OrderResponse).optional(),
  // Keyed by number_line block.id (uuid). Absent when the activity has no
  // number-line blocks or none were answered. Sibling to `graphResponses`,
  // never merged — 1-D geometric answers are shaped differently and the
  // dashboard renders them differently.
  numberLineResponses: external_exports.record(external_exports.string().uuid(), NumberLineResponse).optional(),
  // Keyed by data_plot block.id (uuid). Absent when the activity has no
  // graded data-plot blocks or none were answered (display data_plots are
  // ungraded and never appear). Sibling to the other geometric maps.
  dataPlotResponses: external_exports.record(external_exports.string().uuid(), DataPlotResponse).optional(),
  // Keyed by self_explanation block.id (uuid). Ungraded free text — never in
  // the score. Absent when the activity has no self-explanation blocks or none
  // were written. Phase 2.6 short_answer / essay will reuse this same map.
  freeResponses: external_exports.record(external_exports.string().uuid(), FreeResponse).optional()
});

// packages/viewer/src/registry/registry.ts
var BLANK_SECRET_FIELDS = [
  "answer",
  "acceptableAnswers",
  "mistakeFeedback",
  "tolerance",
  "equivalence"
];
var MATH_PROMPT_SECRET_FIELDS = [
  "answer",
  "acceptableAnswers",
  "equivalence",
  "tolerance"
];
var blockRegistry = {
  paragraph: {
    type: "paragraph",
    family: "static",
    interactivity: "container",
    category: "content",
    numbered: "never",
    analyticsKey: "paragraph",
    sanitize: { strip: [] },
    print: { breakInside: "auto", treatment: "prose" }
  },
  heading: {
    type: "heading",
    family: "static",
    interactivity: "container",
    category: "content",
    numbered: "never",
    analyticsKey: "heading",
    sanitize: { strip: [] },
    print: { breakInside: "auto", treatment: "prose", keepWithNext: true }
  },
  math_block: {
    type: "math_block",
    // Gap-bearing (Model A prompts) → auto-gradable + numbered + interactive;
    // a plain display equation resolves static through familyOf().
    family: "auto_gradable",
    interactivity: "interactive",
    category: "content",
    // faithful: renderer emits content even when gap-bearing
    numbered: "when_gradable",
    analyticsKey: "math_block",
    sanitize: { strip: ["solution"], inlineBlankSecrets: true },
    // Faithful oddity: NOT in the current break-inside:avoid list, and not in
    // the showAnswers set — a numbered math problem can split across pages
    // today. T8 decides whether to fix; the registry records what is.
    print: { breakInside: "auto", treatment: "underline-blanks" },
    a11y: {
      story: 'Each in-equation gap is a text input in tab order, labeled with its position ("gap 1 of 2 in problem 3"). Values type as plain text; verdicts are announced via the shared state-pill aria-live region.'
    }
  },
  image: {
    type: "image",
    family: "static",
    interactivity: "container",
    category: "content",
    numbered: "never",
    analyticsKey: "image",
    sanitize: { strip: [] },
    print: { breakInside: "auto", treatment: "figure" }
  },
  callout: {
    type: "callout",
    family: "static",
    interactivity: "container",
    category: "content",
    numbered: "never",
    analyticsKey: "callout",
    sanitize: { strip: [] },
    print: { breakInside: "auto", treatment: "variant-border-box" }
  },
  problem: {
    type: "problem",
    // Numbered legacy prose problem; carries a solution but no auto-graded
    // response (isGradeable: false) → static family, no state chrome. Schema
    // orphan: no editor NodeView; still renderable, so it keeps an entry.
    family: "static",
    interactivity: "container",
    category: "question",
    numbered: "always",
    analyticsKey: "problem",
    sanitize: { strip: ["solution"] },
    print: { breakInside: "avoid", treatment: "prose" }
  },
  fill_in_blank: {
    type: "fill_in_blank",
    family: "auto_gradable",
    interactivity: "interactive",
    category: "question",
    numbered: "always",
    analyticsKey: "fill_in_blank",
    sanitize: { strip: ["solution"], inlineBlankSecrets: true },
    print: { breakInside: "avoid", treatment: "underline-blanks", answerKeyVariant: true },
    a11y: {
      story: 'Each blank is a text input in tab order with a label naming its problem and sub-part ("blank (a), problem 3"). Hint and mistake affordances are buttons reachable by Tab; the opened popover traps no focus and closes on Escape. Verdicts announce via aria-live.'
    }
  },
  bullet_list: {
    type: "bullet_list",
    family: "static",
    interactivity: "container",
    category: "content",
    numbered: "never",
    analyticsKey: "bullet_list",
    sanitize: { strip: [] },
    print: { breakInside: "auto", treatment: "prose" }
  },
  ordered_list: {
    type: "ordered_list",
    family: "static",
    interactivity: "container",
    category: "content",
    numbered: "never",
    analyticsKey: "ordered_list",
    sanitize: { strip: [] },
    print: { breakInside: "auto", treatment: "prose" }
  },
  interactive_graph: {
    type: "interactive_graph",
    family: "auto_gradable",
    // display variant resolves static via familyOf()
    interactivity: "interactive",
    category: "question",
    // display variant resolves content via categoryOf()
    numbered: "when_gradable",
    analyticsKey: "interactive_graph",
    variants: [
      "plot_point",
      "plot_function",
      "shade_region",
      "graph_inequality",
      "plot_ray",
      "plot_segment",
      "display"
    ],
    sanitize: {
      // Variant-scoped keys: paths that don't exist on an instance's
      // interaction simply don't match. `allowNoSolution` SURVIVES (it renders
      // the "no solution" control); `noSolutionCorrect` is the answer.
      strip: [
        "interaction.correctPoints",
        "interaction.tolerance",
        "interaction.models",
        "interaction.domains",
        "interaction.regions",
        "interaction.inequalities",
        "interaction.rays",
        "interaction.segments",
        "mistakeFeedback",
        "solution",
        "noSolutionCorrect",
        "partialCredit",
        "builtinFeedback"
      ]
    },
    print: { breakInside: "avoid", treatment: "static-svg", answerKeyVariant: true },
    a11y: {
      story: "The canvas is focusable; handles move by arrow keys with position narration to a visually-hidden aria-live region (a visible readout would hand over the answer \u2014 reading the grid is the skill). Post-check results are visible text. Touch targets meet 44px."
    }
  },
  multiple_choice: {
    type: "multiple_choice",
    family: "auto_gradable",
    interactivity: "interactive",
    category: "question",
    numbered: "always",
    analyticsKey: "multiple_choice",
    sanitize: {
      // Per-choice feedback returns via the check RPC (2.1A), like blanks'.
      strip: ["choices[].correct", "choices[].feedback", "solution"]
    },
    print: { breakInside: "avoid", treatment: "choice-letters", answerKeyVariant: true },
    a11y: {
      story: "Native radio (single) / checkbox (multi) inputs grouped in a fieldset whose legend is the prompt; full label click targets. Standard arrow-key radio behavior; verdicts announce via aria-live."
    }
  },
  matching: {
    type: "matching",
    family: "auto_gradable",
    interactivity: "interactive",
    category: "question",
    numbered: "always",
    analyticsKey: "matching",
    sanitize: { strip: ["key", "solution"] },
    print: { breakInside: "avoid", treatment: "letter-bank", answerKeyVariant: true },
    a11y: {
      story: 'Pointer drag with a keyboard select-then-place grammar underneath: target cards are focusable, Space/Enter lifts, arrows choose a dock, Space/Enter places, Escape cancels. Every move narrates to a visually-hidden aria-live region ("Card B placed on item 2").'
    }
  },
  ordering: {
    type: "ordering",
    family: "auto_gradable",
    interactivity: "interactive",
    category: "question",
    numbered: "always",
    analyticsKey: "ordering",
    sanitize: {
      strip: ["solution"],
      // The authored items order IS the key — the server serves a shuffle
      // (stable per version + student so reloads don't reshuffle).
      serveShuffled: ["items"]
    },
    print: { breakInside: "avoid", treatment: "number-boxes", answerKeyVariant: true },
    a11y: {
      story: "Rows are focusable and reorder via the shared lift grammar: Space/Enter lifts, arrows move the row, Space/Enter drops, Escape cancels; positions narrate to a visually-hidden aria-live region."
    }
  },
  number_line: {
    type: "number_line",
    family: "auto_gradable",
    interactivity: "interactive",
    category: "question",
    numbered: "always",
    analyticsKey: "number_line",
    variants: ["plot_point", "plot_interval"],
    sanitize: {
      strip: [
        "interaction.correctPoints",
        "interaction.tolerance",
        "interaction.correctInterval",
        "solution"
      ]
    },
    print: { breakInside: "avoid", treatment: "static-svg", answerKeyVariant: true },
    a11y: {
      story: "The line is focusable; points/interval endpoints move by arrow keys with value narration to a visually-hidden aria-live region (visible readout would reveal the answer). Post-check results are visible."
    }
  },
  data_plot: {
    type: "data_plot",
    family: "auto_gradable",
    // display variant resolves static via familyOf()
    interactivity: "interactive",
    category: "question",
    // display variant resolves content via categoryOf()
    numbered: "when_gradable",
    analyticsKey: "data_plot",
    variants: ["display", "build_dotplot", "build_histogram", "build_boxplot"],
    sanitize: {
      strip: ["solution", "interaction.tolerance"],
      derivableFromServed: "The data set is the working material the student builds the chart FROM, and the correct chart is computed from it \u2014 withholding the data would remove the task. Server-authoritative grading still gates verdicts; the leak tests whitelist `data` for this block explicitly."
    },
    // Faithful oddity: NOT in the current break-inside:avoid list (unlike the
    // graph and number-line canvases). T8 decides; registry records what is.
    print: { breakInside: "auto", treatment: "static-svg", answerKeyVariant: true },
    a11y: {
      story: "Chart-building controls are focusable; dots/bars/box handles adjust by arrow keys with value narration to a visually-hidden aria-live region. Post-check results are visible text."
    }
  },
  learning_objectives: {
    type: "learning_objectives",
    family: "static",
    interactivity: "container",
    category: "content",
    numbered: "never",
    analyticsKey: "learning_objectives",
    sanitize: { strip: [] },
    print: { breakInside: "avoid", treatment: "bordered-box" }
  },
  worked_example: {
    type: "worked_example",
    family: "static",
    interactivity: "container",
    category: "content",
    numbered: "never",
    analyticsKey: "worked_example",
    sanitize: { strip: [], childBlocks: ["content"] },
    print: { breakInside: "avoid", treatment: "bordered-box" }
  },
  faded_worked_example: {
    type: "faded_worked_example",
    // The box counts as ONE numbered problem; grading rides its child
    // fill_in_blank steps, each sanitized by its own entry via childBlocks.
    family: "auto_gradable",
    interactivity: "container",
    category: "scaffold",
    numbered: "always",
    analyticsKey: "faded_worked_example",
    sanitize: { strip: [], childBlocks: ["content"] },
    print: { breakInside: "avoid", treatment: "bordered-box" }
  },
  self_explanation: {
    type: "self_explanation",
    family: "recorded",
    interactivity: "interactive",
    category: "question",
    numbered: "never",
    analyticsKey: "self_explanation",
    sanitize: { strip: [] },
    // The current avoid rides the textarea, not the block — a long prompt can
    // split from its writing box today. Faithful; T8 decides.
    print: { breakInside: "auto", treatment: "writing-box" },
    a11y: {
      story: 'A labeled textarea in tab order. On check the block announces "Recorded \u2014 your teacher will review" via aria-live; never a verdict.'
    }
  },
  short_answer: {
    type: "short_answer",
    family: "recorded",
    interactivity: "interactive",
    category: "question",
    numbered: "never",
    analyticsKey: "short_answer",
    // Rubrics are teacher-side data — already correctly withheld from student
    // HTML today; the registry makes that a declared invariant.
    sanitize: { strip: ["rubric"] },
    print: { breakInside: "auto", treatment: "writing-box" },
    a11y: {
      story: "A labeled textarea in tab order. Recorded state announces via aria-live; teacher feedback, once released, renders as a labeled region announced on arrival."
    }
  },
  essay: {
    type: "essay",
    family: "recorded",
    interactivity: "interactive",
    category: "question",
    numbered: "never",
    analyticsKey: "essay",
    sanitize: { strip: ["rubric"] },
    print: { breakInside: "auto", treatment: "writing-box" },
    a11y: {
      story: "A labeled textarea in tab order. The live word counter is aria-live=polite and debounced so it never chatters per keystroke. Recorded state and released teacher feedback announce via aria-live."
    }
  },
  graph_figure: {
    type: "graph_figure",
    family: "static",
    interactivity: "container",
    category: "content",
    numbered: "never",
    analyticsKey: "graph_figure",
    sanitize: { strip: [] },
    print: { breakInside: "auto", treatment: "figure" }
  }
};
var registeredBlockTypes = Object.keys(blockRegistry);

// packages/viewer/src/sanitize/sanitize.ts
var SANITIZER_ALGO_REV = 1;
function fnv1a(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
function computeSanitizerRev() {
  const specs = [...registeredBlockTypes].sort().map((type) => [type, blockRegistry[type].sanitize]);
  const material = JSON.stringify({
    algo: SANITIZER_ALGO_REV,
    blank: BLANK_SECRET_FIELDS,
    prompt: MATH_PROMPT_SECRET_FIELDS,
    specs
  });
  return `${SANITIZER_ALGO_REV}-${fnv1a(material)}`;
}
var SANITIZER_REV = computeSanitizerRev();
function applyStripPath(block, path) {
  const arrayIdx = path.indexOf("[].");
  if (arrayIdx !== -1) {
    const field = path.slice(0, arrayIdx);
    const sub = path.slice(arrayIdx + 3);
    const arr = block[field];
    if (Array.isArray(arr)) {
      for (const el of arr) {
        if (el !== null && typeof el === "object") {
          delete el[sub];
        }
      }
    }
    return;
  }
  const dotIdx = path.indexOf(".");
  if (dotIdx !== -1) {
    const parent = block[path.slice(0, dotIdx)];
    if (parent !== null && typeof parent === "object" && !Array.isArray(parent)) {
      delete parent[path.slice(dotIdx + 1)];
    }
    return;
  }
  delete block[path];
}
var PROMPT_CARRIER_TYPES = /* @__PURE__ */ new Set(["math_inline", "math_block"]);
function stripInBandSecrets(value) {
  if (Array.isArray(value)) {
    for (const el of value) stripInBandSecrets(el);
    return;
  }
  if (value === null || typeof value !== "object") return;
  const obj = value;
  if (obj.type === "blank") {
    for (const field of BLANK_SECRET_FIELDS) delete obj[field];
  }
  if (typeof obj.type === "string" && PROMPT_CARRIER_TYPES.has(obj.type) && Array.isArray(obj.prompts)) {
    for (const prompt of obj.prompts) {
      if (prompt !== null && typeof prompt === "object") {
        for (const field of MATH_PROMPT_SECRET_FIELDS) {
          delete prompt[field];
        }
      }
    }
  }
  for (const key of Object.keys(obj)) stripInBandSecrets(obj[key]);
}
function sanitizeBlockMut(block) {
  const type = block.type;
  const entry = typeof type === "string" && type in blockRegistry ? blockRegistry[type] : void 0;
  if (!entry) {
    throw new Error(`sanitize: unknown block type ${String(type)}`);
  }
  for (const path of entry.sanitize.strip) applyStripPath(block, path);
  for (const field of entry.sanitize.childBlocks ?? []) {
    const children = block[field];
    if (Array.isArray(children)) {
      for (const child of children) {
        if (child !== null && typeof child === "object") {
          sanitizeBlockMut(child);
        }
      }
    }
  }
  stripInBandSecrets(block);
}
function sanitizeBlock(block) {
  const clone = structuredClone(block);
  sanitizeBlockMut(clone);
  return clone;
}
function sanitizeActivityDocument(doc) {
  const clone = structuredClone(doc);
  for (const section of clone.sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        for (const block of column.blocks) {
          if (block !== null && typeof block === "object") {
            sanitizeBlockMut(block);
          }
        }
      }
    }
  }
  stripInBandSecrets(clone);
  return clone;
}

// packages/viewer/src/sanitize/shuffle.ts
function seedFrom(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = a + 1831565813 >>> 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function seededShuffle(items, seedKey) {
  const out = [...items];
  const next = mulberry32(seedFrom(seedKey));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    const a = out[i];
    out[i] = out[j];
    out[j] = a;
  }
  return out;
}
function applyServeShuffles(doc, seedKey) {
  const clone = structuredClone(doc);
  const shuffleBlock = (block) => {
    const type = block.type;
    const entry = typeof type === "string" && type in blockRegistry ? blockRegistry[type] : void 0;
    if (!entry) return;
    for (const field of entry.sanitize.serveShuffled ?? []) {
      const arr = block[field];
      if (Array.isArray(arr)) {
        block[field] = seededShuffle(
          arr,
          `${seedKey}:${String(block.id ?? "")}:${field}`
        );
      }
    }
    for (const field of entry.sanitize.childBlocks ?? []) {
      const children = block[field];
      if (Array.isArray(children)) {
        for (const child of children) {
          if (child !== null && typeof child === "object") {
            shuffleBlock(child);
          }
        }
      }
    }
  };
  for (const section of clone.sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        for (const block of column.blocks) {
          if (block !== null && typeof block === "object") {
            shuffleBlock(block);
          }
        }
      }
    }
  }
  return clone;
}
export {
  ACTIVITY_SCHEMA_VERSION,
  SANITIZER_ALGO_REV,
  SANITIZER_REV,
  UpgradeError,
  applyServeShuffles,
  sanitizeActivityDocument,
  sanitizeBlock,
  seededShuffle,
  upgradeActivityDocument
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvZXh0ZXJuYWwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvaGVscGVycy91dGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL1pvZEVycm9yLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2xvY2FsZXMvZW4uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvZXJyb3JzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2hlbHBlcnMvcGFyc2VVdGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2hlbHBlcnMvZXJyb3JVdGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL3R5cGVzLmpzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvc2l6aW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2ltYWdlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvZ3JhcGgtcHJpbWl0aXZlcy50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9ncmFwaC1maWd1cmUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9pbmxpbmUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvcGFyYWdyYXBoLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2hlYWRpbmcudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9sYWJlbC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9tYXRoLWJsb2NrLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2NhbGxvdXQudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvcHJvYmxlbS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9maWxsLWluLWJsYW5rLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2xpc3QudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvaW50ZXJhY3RpdmUtZ3JhcGgudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvbXVsdGlwbGUtY2hvaWNlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL21hdGNoaW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL29yZGVyaW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL251bWJlci1saW5lLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2RhdGEtcGxvdC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9sZWFybmluZy1vYmplY3RpdmVzLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL3dvcmtlZC1leGFtcGxlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2ZhZGVkLXdvcmtlZC1leGFtcGxlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL3NlbGYtZXhwbGFuYXRpb24udHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvZnJlZS1yZXNwb25zZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9pbmRleC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2xheW91dC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2RvY3VtZW50LnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvdXBncmFkZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL3N1Ym1pc3Npb24udHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9yZWdpc3RyeS9yZWdpc3RyeS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3Nhbml0aXplL3Nhbml0aXplLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2FuaXRpemUvc2h1ZmZsZS50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0ICogZnJvbSBcIi4vZXJyb3JzLmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9oZWxwZXJzL3BhcnNlVXRpbC5qc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vaGVscGVycy90eXBlQWxpYXNlcy5qc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vaGVscGVycy91dGlsLmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi90eXBlcy5qc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vWm9kRXJyb3IuanNcIjtcbiIsICJleHBvcnQgdmFyIHV0aWw7XG4oZnVuY3Rpb24gKHV0aWwpIHtcbiAgICB1dGlsLmFzc2VydEVxdWFsID0gKF8pID0+IHsgfTtcbiAgICBmdW5jdGlvbiBhc3NlcnRJcyhfYXJnKSB7IH1cbiAgICB1dGlsLmFzc2VydElzID0gYXNzZXJ0SXM7XG4gICAgZnVuY3Rpb24gYXNzZXJ0TmV2ZXIoX3gpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgfVxuICAgIHV0aWwuYXNzZXJ0TmV2ZXIgPSBhc3NlcnROZXZlcjtcbiAgICB1dGlsLmFycmF5VG9FbnVtID0gKGl0ZW1zKSA9PiB7XG4gICAgICAgIGNvbnN0IG9iaiA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcbiAgICAgICAgICAgIG9ialtpdGVtXSA9IGl0ZW07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9O1xuICAgIHV0aWwuZ2V0VmFsaWRFbnVtVmFsdWVzID0gKG9iaikgPT4ge1xuICAgICAgICBjb25zdCB2YWxpZEtleXMgPSB1dGlsLm9iamVjdEtleXMob2JqKS5maWx0ZXIoKGspID0+IHR5cGVvZiBvYmpbb2JqW2tdXSAhPT0gXCJudW1iZXJcIik7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkID0ge307XG4gICAgICAgIGZvciAoY29uc3QgayBvZiB2YWxpZEtleXMpIHtcbiAgICAgICAgICAgIGZpbHRlcmVkW2tdID0gb2JqW2tdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1dGlsLm9iamVjdFZhbHVlcyhmaWx0ZXJlZCk7XG4gICAgfTtcbiAgICB1dGlsLm9iamVjdFZhbHVlcyA9IChvYmopID0+IHtcbiAgICAgICAgcmV0dXJuIHV0aWwub2JqZWN0S2V5cyhvYmopLm1hcChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIG9ialtlXTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICB1dGlsLm9iamVjdEtleXMgPSB0eXBlb2YgT2JqZWN0LmtleXMgPT09IFwiZnVuY3Rpb25cIiAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhbi9iYW5cbiAgICAgICAgPyAob2JqKSA9PiBPYmplY3Qua2V5cyhvYmopIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFuL2JhblxuICAgICAgICA6IChvYmplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGtleXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG9iamVjdCkge1xuICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBrZXlzO1xuICAgICAgICB9O1xuICAgIHV0aWwuZmluZCA9IChhcnIsIGNoZWNrZXIpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGFycikge1xuICAgICAgICAgICAgaWYgKGNoZWNrZXIoaXRlbSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIHV0aWwuaXNJbnRlZ2VyID0gdHlwZW9mIE51bWJlci5pc0ludGVnZXIgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICA/ICh2YWwpID0+IE51bWJlci5pc0ludGVnZXIodmFsKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhbi9iYW5cbiAgICAgICAgOiAodmFsKSA9PiB0eXBlb2YgdmFsID09PSBcIm51bWJlclwiICYmIE51bWJlci5pc0Zpbml0ZSh2YWwpICYmIE1hdGguZmxvb3IodmFsKSA9PT0gdmFsO1xuICAgIGZ1bmN0aW9uIGpvaW5WYWx1ZXMoYXJyYXksIHNlcGFyYXRvciA9IFwiIHwgXCIpIHtcbiAgICAgICAgcmV0dXJuIGFycmF5Lm1hcCgodmFsKSA9PiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiA/IGAnJHt2YWx9J2AgOiB2YWwpKS5qb2luKHNlcGFyYXRvcik7XG4gICAgfVxuICAgIHV0aWwuam9pblZhbHVlcyA9IGpvaW5WYWx1ZXM7XG4gICAgdXRpbC5qc29uU3RyaW5naWZ5UmVwbGFjZXIgPSAoXywgdmFsdWUpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJiaWdpbnRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG59KSh1dGlsIHx8ICh1dGlsID0ge30pKTtcbmV4cG9ydCB2YXIgb2JqZWN0VXRpbDtcbihmdW5jdGlvbiAob2JqZWN0VXRpbCkge1xuICAgIG9iamVjdFV0aWwubWVyZ2VTaGFwZXMgPSAoZmlyc3QsIHNlY29uZCkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uZmlyc3QsXG4gICAgICAgICAgICAuLi5zZWNvbmQsIC8vIHNlY29uZCBvdmVyd3JpdGVzIGZpcnN0XG4gICAgICAgIH07XG4gICAgfTtcbn0pKG9iamVjdFV0aWwgfHwgKG9iamVjdFV0aWwgPSB7fSkpO1xuZXhwb3J0IGNvbnN0IFpvZFBhcnNlZFR5cGUgPSB1dGlsLmFycmF5VG9FbnVtKFtcbiAgICBcInN0cmluZ1wiLFxuICAgIFwibmFuXCIsXG4gICAgXCJudW1iZXJcIixcbiAgICBcImludGVnZXJcIixcbiAgICBcImZsb2F0XCIsXG4gICAgXCJib29sZWFuXCIsXG4gICAgXCJkYXRlXCIsXG4gICAgXCJiaWdpbnRcIixcbiAgICBcInN5bWJvbFwiLFxuICAgIFwiZnVuY3Rpb25cIixcbiAgICBcInVuZGVmaW5lZFwiLFxuICAgIFwibnVsbFwiLFxuICAgIFwiYXJyYXlcIixcbiAgICBcIm9iamVjdFwiLFxuICAgIFwidW5rbm93blwiLFxuICAgIFwicHJvbWlzZVwiLFxuICAgIFwidm9pZFwiLFxuICAgIFwibmV2ZXJcIixcbiAgICBcIm1hcFwiLFxuICAgIFwic2V0XCIsXG5dKTtcbmV4cG9ydCBjb25zdCBnZXRQYXJzZWRUeXBlID0gKGRhdGEpID0+IHtcbiAgICBjb25zdCB0ID0gdHlwZW9mIGRhdGE7XG4gICAgc3dpdGNoICh0KSB7XG4gICAgICAgIGNhc2UgXCJ1bmRlZmluZWRcIjpcbiAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLnVuZGVmaW5lZDtcbiAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuc3RyaW5nO1xuICAgICAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICAgICAgICByZXR1cm4gTnVtYmVyLmlzTmFOKGRhdGEpID8gWm9kUGFyc2VkVHlwZS5uYW4gOiBab2RQYXJzZWRUeXBlLm51bWJlcjtcbiAgICAgICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLmJvb2xlYW47XG4gICAgICAgIGNhc2UgXCJmdW5jdGlvblwiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuZnVuY3Rpb247XG4gICAgICAgIGNhc2UgXCJiaWdpbnRcIjpcbiAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLmJpZ2ludDtcbiAgICAgICAgY2FzZSBcInN5bWJvbFwiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuc3ltYm9sO1xuICAgICAgICBjYXNlIFwib2JqZWN0XCI6XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLmFycmF5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5udWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGEudGhlbiAmJiB0eXBlb2YgZGF0YS50aGVuID09PSBcImZ1bmN0aW9uXCIgJiYgZGF0YS5jYXRjaCAmJiB0eXBlb2YgZGF0YS5jYXRjaCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUucHJvbWlzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgTWFwICE9PSBcInVuZGVmaW5lZFwiICYmIGRhdGEgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5tYXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIFNldCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuc2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBEYXRlICE9PSBcInVuZGVmaW5lZFwiICYmIGRhdGEgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuZGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLm9iamVjdDtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLnVua25vd247XG4gICAgfVxufTtcbiIsICJpbXBvcnQgeyB1dGlsIH0gZnJvbSBcIi4vaGVscGVycy91dGlsLmpzXCI7XG5leHBvcnQgY29uc3QgWm9kSXNzdWVDb2RlID0gdXRpbC5hcnJheVRvRW51bShbXG4gICAgXCJpbnZhbGlkX3R5cGVcIixcbiAgICBcImludmFsaWRfbGl0ZXJhbFwiLFxuICAgIFwiY3VzdG9tXCIsXG4gICAgXCJpbnZhbGlkX3VuaW9uXCIsXG4gICAgXCJpbnZhbGlkX3VuaW9uX2Rpc2NyaW1pbmF0b3JcIixcbiAgICBcImludmFsaWRfZW51bV92YWx1ZVwiLFxuICAgIFwidW5yZWNvZ25pemVkX2tleXNcIixcbiAgICBcImludmFsaWRfYXJndW1lbnRzXCIsXG4gICAgXCJpbnZhbGlkX3JldHVybl90eXBlXCIsXG4gICAgXCJpbnZhbGlkX2RhdGVcIixcbiAgICBcImludmFsaWRfc3RyaW5nXCIsXG4gICAgXCJ0b29fc21hbGxcIixcbiAgICBcInRvb19iaWdcIixcbiAgICBcImludmFsaWRfaW50ZXJzZWN0aW9uX3R5cGVzXCIsXG4gICAgXCJub3RfbXVsdGlwbGVfb2ZcIixcbiAgICBcIm5vdF9maW5pdGVcIixcbl0pO1xuZXhwb3J0IGNvbnN0IHF1b3RlbGVzc0pzb24gPSAob2JqKSA9PiB7XG4gICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KG9iaiwgbnVsbCwgMik7XG4gICAgcmV0dXJuIGpzb24ucmVwbGFjZSgvXCIoW15cIl0rKVwiOi9nLCBcIiQxOlwiKTtcbn07XG5leHBvcnQgY2xhc3MgWm9kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgZ2V0IGVycm9ycygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNzdWVzO1xuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcihpc3N1ZXMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5pc3N1ZXMgPSBbXTtcbiAgICAgICAgdGhpcy5hZGRJc3N1ZSA9IChzdWIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaXNzdWVzID0gWy4uLnRoaXMuaXNzdWVzLCBzdWJdO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFkZElzc3VlcyA9IChzdWJzID0gW10pID0+IHtcbiAgICAgICAgICAgIHRoaXMuaXNzdWVzID0gWy4uLnRoaXMuaXNzdWVzLCAuLi5zdWJzXTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgYWN0dWFsUHJvdG8gPSBuZXcudGFyZ2V0LnByb3RvdHlwZTtcbiAgICAgICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGJhbi9iYW5cbiAgICAgICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBhY3R1YWxQcm90byk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9fcHJvdG9fXyA9IGFjdHVhbFByb3RvO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubmFtZSA9IFwiWm9kRXJyb3JcIjtcbiAgICAgICAgdGhpcy5pc3N1ZXMgPSBpc3N1ZXM7XG4gICAgfVxuICAgIGZvcm1hdChfbWFwcGVyKSB7XG4gICAgICAgIGNvbnN0IG1hcHBlciA9IF9tYXBwZXIgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChpc3N1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc3N1ZS5tZXNzYWdlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZmllbGRFcnJvcnMgPSB7IF9lcnJvcnM6IFtdIH07XG4gICAgICAgIGNvbnN0IHByb2Nlc3NFcnJvciA9IChlcnJvcikgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCBpc3N1ZSBvZiBlcnJvci5pc3N1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNzdWUuY29kZSA9PT0gXCJpbnZhbGlkX3VuaW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNzdWUudW5pb25FcnJvcnMubWFwKHByb2Nlc3NFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLmNvZGUgPT09IFwiaW52YWxpZF9yZXR1cm5fdHlwZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NFcnJvcihpc3N1ZS5yZXR1cm5UeXBlRXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfYXJndW1lbnRzXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0Vycm9yKGlzc3VlLmFyZ3VtZW50c0Vycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUucGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGRFcnJvcnMuX2Vycm9ycy5wdXNoKG1hcHBlcihpc3N1ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnIgPSBmaWVsZEVycm9ycztcbiAgICAgICAgICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IGlzc3VlLnBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbCA9IGlzc3VlLnBhdGhbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXJtaW5hbCA9IGkgPT09IGlzc3VlLnBhdGgubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGVybWluYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyW2VsXSA9IGN1cnJbZWxdIHx8IHsgX2Vycm9yczogW10gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAodHlwZW9mIGVsID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBjdXJyW2VsXSA9IGN1cnJbZWxdIHx8IHsgX2Vycm9yczogW10gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHR5cGVvZiBlbCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgY29uc3QgZXJyb3JBcnJheTogYW55ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBlcnJvckFycmF5Ll9lcnJvcnMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGN1cnJbZWxdID0gY3VycltlbF0gfHwgZXJyb3JBcnJheTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyW2VsXSA9IGN1cnJbZWxdIHx8IHsgX2Vycm9yczogW10gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyW2VsXS5fZXJyb3JzLnB1c2gobWFwcGVyKGlzc3VlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyID0gY3VycltlbF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHByb2Nlc3NFcnJvcih0aGlzKTtcbiAgICAgICAgcmV0dXJuIGZpZWxkRXJyb3JzO1xuICAgIH1cbiAgICBzdGF0aWMgYXNzZXJ0KHZhbHVlKSB7XG4gICAgICAgIGlmICghKHZhbHVlIGluc3RhbmNlb2YgWm9kRXJyb3IpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vdCBhIFpvZEVycm9yOiAke3ZhbHVlfWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tZXNzYWdlO1xuICAgIH1cbiAgICBnZXQgbWVzc2FnZSgpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMuaXNzdWVzLCB1dGlsLmpzb25TdHJpbmdpZnlSZXBsYWNlciwgMik7XG4gICAgfVxuICAgIGdldCBpc0VtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc3N1ZXMubGVuZ3RoID09PSAwO1xuICAgIH1cbiAgICBmbGF0dGVuKG1hcHBlciA9IChpc3N1ZSkgPT4gaXNzdWUubWVzc2FnZSkge1xuICAgICAgICBjb25zdCBmaWVsZEVycm9ycyA9IHt9O1xuICAgICAgICBjb25zdCBmb3JtRXJyb3JzID0gW107XG4gICAgICAgIGZvciAoY29uc3Qgc3ViIG9mIHRoaXMuaXNzdWVzKSB7XG4gICAgICAgICAgICBpZiAoc3ViLnBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpcnN0RWwgPSBzdWIucGF0aFswXTtcbiAgICAgICAgICAgICAgICBmaWVsZEVycm9yc1tmaXJzdEVsXSA9IGZpZWxkRXJyb3JzW2ZpcnN0RWxdIHx8IFtdO1xuICAgICAgICAgICAgICAgIGZpZWxkRXJyb3JzW2ZpcnN0RWxdLnB1c2gobWFwcGVyKHN1YikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9ybUVycm9ycy5wdXNoKG1hcHBlcihzdWIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBmb3JtRXJyb3JzLCBmaWVsZEVycm9ycyB9O1xuICAgIH1cbiAgICBnZXQgZm9ybUVycm9ycygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxhdHRlbigpO1xuICAgIH1cbn1cblpvZEVycm9yLmNyZWF0ZSA9IChpc3N1ZXMpID0+IHtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBab2RFcnJvcihpc3N1ZXMpO1xuICAgIHJldHVybiBlcnJvcjtcbn07XG4iLCAiaW1wb3J0IHsgWm9kSXNzdWVDb2RlIH0gZnJvbSBcIi4uL1pvZEVycm9yLmpzXCI7XG5pbXBvcnQgeyB1dGlsLCBab2RQYXJzZWRUeXBlIH0gZnJvbSBcIi4uL2hlbHBlcnMvdXRpbC5qc1wiO1xuY29uc3QgZXJyb3JNYXAgPSAoaXNzdWUsIF9jdHgpID0+IHtcbiAgICBsZXQgbWVzc2FnZTtcbiAgICBzd2l0Y2ggKGlzc3VlLmNvZGUpIHtcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlOlxuICAgICAgICAgICAgaWYgKGlzc3VlLnJlY2VpdmVkID09PSBab2RQYXJzZWRUeXBlLnVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIlJlcXVpcmVkXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEV4cGVjdGVkICR7aXNzdWUuZXhwZWN0ZWR9LCByZWNlaXZlZCAke2lzc3VlLnJlY2VpdmVkfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9saXRlcmFsOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGxpdGVyYWwgdmFsdWUsIGV4cGVjdGVkICR7SlNPTi5zdHJpbmdpZnkoaXNzdWUuZXhwZWN0ZWQsIHV0aWwuanNvblN0cmluZ2lmeVJlcGxhY2VyKX1gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLnVucmVjb2duaXplZF9rZXlzOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBVbnJlY29nbml6ZWQga2V5KHMpIGluIG9iamVjdDogJHt1dGlsLmpvaW5WYWx1ZXMoaXNzdWUua2V5cywgXCIsIFwiKX1gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmludmFsaWRfdW5pb246XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgaW5wdXRgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmludmFsaWRfdW5pb25fZGlzY3JpbWluYXRvcjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBkaXNjcmltaW5hdG9yIHZhbHVlLiBFeHBlY3RlZCAke3V0aWwuam9pblZhbHVlcyhpc3N1ZS5vcHRpb25zKX1gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmludmFsaWRfZW51bV92YWx1ZTpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBlbnVtIHZhbHVlLiBFeHBlY3RlZCAke3V0aWwuam9pblZhbHVlcyhpc3N1ZS5vcHRpb25zKX0sIHJlY2VpdmVkICcke2lzc3VlLnJlY2VpdmVkfSdgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmludmFsaWRfYXJndW1lbnRzOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGZ1bmN0aW9uIGFyZ3VtZW50c2A7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9yZXR1cm5fdHlwZTpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBmdW5jdGlvbiByZXR1cm4gdHlwZWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9kYXRlOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGRhdGVgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nOlxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpc3N1ZS52YWxpZGF0aW9uID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKFwiaW5jbHVkZXNcIiBpbiBpc3N1ZS52YWxpZGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dDogbXVzdCBpbmNsdWRlIFwiJHtpc3N1ZS52YWxpZGF0aW9uLmluY2x1ZGVzfVwiYDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpc3N1ZS52YWxpZGF0aW9uLnBvc2l0aW9uID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gYCR7bWVzc2FnZX0gYXQgb25lIG9yIG1vcmUgcG9zaXRpb25zIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byAke2lzc3VlLnZhbGlkYXRpb24ucG9zaXRpb259YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChcInN0YXJ0c1dpdGhcIiBpbiBpc3N1ZS52YWxpZGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dDogbXVzdCBzdGFydCB3aXRoIFwiJHtpc3N1ZS52YWxpZGF0aW9uLnN0YXJ0c1dpdGh9XCJgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChcImVuZHNXaXRoXCIgaW4gaXNzdWUudmFsaWRhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgaW5wdXQ6IG11c3QgZW5kIHdpdGggXCIke2lzc3VlLnZhbGlkYXRpb24uZW5kc1dpdGh9XCJgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXRpbC5hc3NlcnROZXZlcihpc3N1ZS52YWxpZGF0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS52YWxpZGF0aW9uICE9PSBcInJlZ2V4XCIpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgJHtpc3N1ZS52YWxpZGF0aW9ufWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gXCJJbnZhbGlkXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUudG9vX3NtYWxsOlxuICAgICAgICAgICAgaWYgKGlzc3VlLnR5cGUgPT09IFwiYXJyYXlcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEFycmF5IG11c3QgY29udGFpbiAke2lzc3VlLmV4YWN0ID8gXCJleGFjdGx5XCIgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgYXQgbGVhc3RgIDogYG1vcmUgdGhhbmB9ICR7aXNzdWUubWluaW11bX0gZWxlbWVudChzKWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcInN0cmluZ1wiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgU3RyaW5nIG11c3QgY29udGFpbiAke2lzc3VlLmV4YWN0ID8gXCJleGFjdGx5XCIgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgYXQgbGVhc3RgIDogYG92ZXJgfSAke2lzc3VlLm1pbmltdW19IGNoYXJhY3RlcihzKWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcIm51bWJlclwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgTnVtYmVyIG11c3QgYmUgJHtpc3N1ZS5leGFjdCA/IGBleGFjdGx5IGVxdWFsIHRvIGAgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIGAgOiBgZ3JlYXRlciB0aGFuIGB9JHtpc3N1ZS5taW5pbXVtfWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcImJpZ2ludFwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgTnVtYmVyIG11c3QgYmUgJHtpc3N1ZS5leGFjdCA/IGBleGFjdGx5IGVxdWFsIHRvIGAgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIGAgOiBgZ3JlYXRlciB0aGFuIGB9JHtpc3N1ZS5taW5pbXVtfWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcImRhdGVcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYERhdGUgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHkgZXF1YWwgdG8gYCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gYCA6IGBncmVhdGVyIHRoYW4gYH0ke25ldyBEYXRlKE51bWJlcihpc3N1ZS5taW5pbXVtKSl9YDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gXCJJbnZhbGlkIGlucHV0XCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUudG9vX2JpZzpcbiAgICAgICAgICAgIGlmIChpc3N1ZS50eXBlID09PSBcImFycmF5XCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBBcnJheSBtdXN0IGNvbnRhaW4gJHtpc3N1ZS5leGFjdCA/IGBleGFjdGx5YCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBhdCBtb3N0YCA6IGBsZXNzIHRoYW5gfSAke2lzc3VlLm1heGltdW19IGVsZW1lbnQocylgO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJzdHJpbmdcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYFN0cmluZyBtdXN0IGNvbnRhaW4gJHtpc3N1ZS5leGFjdCA/IGBleGFjdGx5YCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBhdCBtb3N0YCA6IGB1bmRlcmB9ICR7aXNzdWUubWF4aW11bX0gY2hhcmFjdGVyKHMpYDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwibnVtYmVyXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBOdW1iZXIgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYGxlc3MgdGhhbiBvciBlcXVhbCB0b2AgOiBgbGVzcyB0aGFuYH0gJHtpc3N1ZS5tYXhpbXVtfWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcImJpZ2ludFwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgQmlnSW50IG11c3QgYmUgJHtpc3N1ZS5leGFjdCA/IGBleGFjdGx5YCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBsZXNzIHRoYW4gb3IgZXF1YWwgdG9gIDogYGxlc3MgdGhhbmB9ICR7aXNzdWUubWF4aW11bX1gO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJkYXRlXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBEYXRlIG11c3QgYmUgJHtpc3N1ZS5leGFjdCA/IGBleGFjdGx5YCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBzbWFsbGVyIHRoYW4gb3IgZXF1YWwgdG9gIDogYHNtYWxsZXIgdGhhbmB9ICR7bmV3IERhdGUoTnVtYmVyKGlzc3VlLm1heGltdW0pKX1gO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkludmFsaWQgaW5wdXRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5jdXN0b206XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgaW5wdXRgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmludmFsaWRfaW50ZXJzZWN0aW9uX3R5cGVzOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnRlcnNlY3Rpb24gcmVzdWx0cyBjb3VsZCBub3QgYmUgbWVyZ2VkYDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5ub3RfbXVsdGlwbGVfb2Y6XG4gICAgICAgICAgICBtZXNzYWdlID0gYE51bWJlciBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgJHtpc3N1ZS5tdWx0aXBsZU9mfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUubm90X2Zpbml0ZTpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIk51bWJlciBtdXN0IGJlIGZpbml0ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gX2N0eC5kZWZhdWx0RXJyb3I7XG4gICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGlzc3VlKTtcbiAgICB9XG4gICAgcmV0dXJuIHsgbWVzc2FnZSB9O1xufTtcbmV4cG9ydCBkZWZhdWx0IGVycm9yTWFwO1xuIiwgImltcG9ydCBkZWZhdWx0RXJyb3JNYXAgZnJvbSBcIi4vbG9jYWxlcy9lbi5qc1wiO1xubGV0IG92ZXJyaWRlRXJyb3JNYXAgPSBkZWZhdWx0RXJyb3JNYXA7XG5leHBvcnQgeyBkZWZhdWx0RXJyb3JNYXAgfTtcbmV4cG9ydCBmdW5jdGlvbiBzZXRFcnJvck1hcChtYXApIHtcbiAgICBvdmVycmlkZUVycm9yTWFwID0gbWFwO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldEVycm9yTWFwKCkge1xuICAgIHJldHVybiBvdmVycmlkZUVycm9yTWFwO1xufVxuIiwgImltcG9ydCB7IGdldEVycm9yTWFwIH0gZnJvbSBcIi4uL2Vycm9ycy5qc1wiO1xuaW1wb3J0IGRlZmF1bHRFcnJvck1hcCBmcm9tIFwiLi4vbG9jYWxlcy9lbi5qc1wiO1xuZXhwb3J0IGNvbnN0IG1ha2VJc3N1ZSA9IChwYXJhbXMpID0+IHtcbiAgICBjb25zdCB7IGRhdGEsIHBhdGgsIGVycm9yTWFwcywgaXNzdWVEYXRhIH0gPSBwYXJhbXM7XG4gICAgY29uc3QgZnVsbFBhdGggPSBbLi4ucGF0aCwgLi4uKGlzc3VlRGF0YS5wYXRoIHx8IFtdKV07XG4gICAgY29uc3QgZnVsbElzc3VlID0ge1xuICAgICAgICAuLi5pc3N1ZURhdGEsXG4gICAgICAgIHBhdGg6IGZ1bGxQYXRoLFxuICAgIH07XG4gICAgaWYgKGlzc3VlRGF0YS5tZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLmlzc3VlRGF0YSxcbiAgICAgICAgICAgIHBhdGg6IGZ1bGxQYXRoLFxuICAgICAgICAgICAgbWVzc2FnZTogaXNzdWVEYXRhLm1lc3NhZ2UsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGxldCBlcnJvck1lc3NhZ2UgPSBcIlwiO1xuICAgIGNvbnN0IG1hcHMgPSBlcnJvck1hcHNcbiAgICAgICAgLmZpbHRlcigobSkgPT4gISFtKVxuICAgICAgICAuc2xpY2UoKVxuICAgICAgICAucmV2ZXJzZSgpO1xuICAgIGZvciAoY29uc3QgbWFwIG9mIG1hcHMpIHtcbiAgICAgICAgZXJyb3JNZXNzYWdlID0gbWFwKGZ1bGxJc3N1ZSwgeyBkYXRhLCBkZWZhdWx0RXJyb3I6IGVycm9yTWVzc2FnZSB9KS5tZXNzYWdlO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5pc3N1ZURhdGEsXG4gICAgICAgIHBhdGg6IGZ1bGxQYXRoLFxuICAgICAgICBtZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgfTtcbn07XG5leHBvcnQgY29uc3QgRU1QVFlfUEFUSCA9IFtdO1xuZXhwb3J0IGZ1bmN0aW9uIGFkZElzc3VlVG9Db250ZXh0KGN0eCwgaXNzdWVEYXRhKSB7XG4gICAgY29uc3Qgb3ZlcnJpZGVNYXAgPSBnZXRFcnJvck1hcCgpO1xuICAgIGNvbnN0IGlzc3VlID0gbWFrZUlzc3VlKHtcbiAgICAgICAgaXNzdWVEYXRhOiBpc3N1ZURhdGEsXG4gICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgZXJyb3JNYXBzOiBbXG4gICAgICAgICAgICBjdHguY29tbW9uLmNvbnRleHR1YWxFcnJvck1hcCwgLy8gY29udGV4dHVhbCBlcnJvciBtYXAgaXMgZmlyc3QgcHJpb3JpdHlcbiAgICAgICAgICAgIGN0eC5zY2hlbWFFcnJvck1hcCwgLy8gdGhlbiBzY2hlbWEtYm91bmQgbWFwIGlmIGF2YWlsYWJsZVxuICAgICAgICAgICAgb3ZlcnJpZGVNYXAsIC8vIHRoZW4gZ2xvYmFsIG92ZXJyaWRlIG1hcFxuICAgICAgICAgICAgb3ZlcnJpZGVNYXAgPT09IGRlZmF1bHRFcnJvck1hcCA/IHVuZGVmaW5lZCA6IGRlZmF1bHRFcnJvck1hcCwgLy8gdGhlbiBnbG9iYWwgZGVmYXVsdCBtYXBcbiAgICAgICAgXS5maWx0ZXIoKHgpID0+ICEheCksXG4gICAgfSk7XG4gICAgY3R4LmNvbW1vbi5pc3N1ZXMucHVzaChpc3N1ZSk7XG59XG5leHBvcnQgY2xhc3MgUGFyc2VTdGF0dXMge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnZhbHVlID0gXCJ2YWxpZFwiO1xuICAgIH1cbiAgICBkaXJ0eSgpIHtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgPT09IFwidmFsaWRcIilcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBcImRpcnR5XCI7XG4gICAgfVxuICAgIGFib3J0KCkge1xuICAgICAgICBpZiAodGhpcy52YWx1ZSAhPT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gXCJhYm9ydGVkXCI7XG4gICAgfVxuICAgIHN0YXRpYyBtZXJnZUFycmF5KHN0YXR1cywgcmVzdWx0cykge1xuICAgICAgICBjb25zdCBhcnJheVZhbHVlID0gW107XG4gICAgICAgIGZvciAoY29uc3QgcyBvZiByZXN1bHRzKSB7XG4gICAgICAgICAgICBpZiAocy5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgaWYgKHMuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICBhcnJheVZhbHVlLnB1c2gocy52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBhcnJheVZhbHVlIH07XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBtZXJnZU9iamVjdEFzeW5jKHN0YXR1cywgcGFpcnMpIHtcbiAgICAgICAgY29uc3Qgc3luY1BhaXJzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgcGFpci5rZXk7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IHBhaXIudmFsdWU7XG4gICAgICAgICAgICBzeW5jUGFpcnMucHVzaCh7XG4gICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFBhcnNlU3RhdHVzLm1lcmdlT2JqZWN0U3luYyhzdGF0dXMsIHN5bmNQYWlycyk7XG4gICAgfVxuICAgIHN0YXRpYyBtZXJnZU9iamVjdFN5bmMoc3RhdHVzLCBwYWlycykge1xuICAgICAgICBjb25zdCBmaW5hbE9iamVjdCA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHsga2V5LCB2YWx1ZSB9ID0gcGFpcjtcbiAgICAgICAgICAgIGlmIChrZXkuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIGlmIChrZXkudmFsdWUgIT09IFwiX19wcm90b19fXCIgJiYgKHR5cGVvZiB2YWx1ZS52YWx1ZSAhPT0gXCJ1bmRlZmluZWRcIiB8fCBwYWlyLmFsd2F5c1NldCkpIHtcbiAgICAgICAgICAgICAgICBmaW5hbE9iamVjdFtrZXkudmFsdWVdID0gdmFsdWUudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBmaW5hbE9iamVjdCB9O1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBJTlZBTElEID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgc3RhdHVzOiBcImFib3J0ZWRcIixcbn0pO1xuZXhwb3J0IGNvbnN0IERJUlRZID0gKHZhbHVlKSA9PiAoeyBzdGF0dXM6IFwiZGlydHlcIiwgdmFsdWUgfSk7XG5leHBvcnQgY29uc3QgT0sgPSAodmFsdWUpID0+ICh7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZSB9KTtcbmV4cG9ydCBjb25zdCBpc0Fib3J0ZWQgPSAoeCkgPT4geC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiO1xuZXhwb3J0IGNvbnN0IGlzRGlydHkgPSAoeCkgPT4geC5zdGF0dXMgPT09IFwiZGlydHlcIjtcbmV4cG9ydCBjb25zdCBpc1ZhbGlkID0gKHgpID0+IHguc3RhdHVzID09PSBcInZhbGlkXCI7XG5leHBvcnQgY29uc3QgaXNBc3luYyA9ICh4KSA9PiB0eXBlb2YgUHJvbWlzZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiB4IGluc3RhbmNlb2YgUHJvbWlzZTtcbiIsICJleHBvcnQgdmFyIGVycm9yVXRpbDtcbihmdW5jdGlvbiAoZXJyb3JVdGlsKSB7XG4gICAgZXJyb3JVdGlsLmVyclRvT2JqID0gKG1lc3NhZ2UpID0+IHR5cGVvZiBtZXNzYWdlID09PSBcInN0cmluZ1wiID8geyBtZXNzYWdlIH0gOiBtZXNzYWdlIHx8IHt9O1xuICAgIC8vIGJpb21lLWlnbm9yZSBsaW50OlxuICAgIGVycm9yVXRpbC50b1N0cmluZyA9IChtZXNzYWdlKSA9PiB0eXBlb2YgbWVzc2FnZSA9PT0gXCJzdHJpbmdcIiA/IG1lc3NhZ2UgOiBtZXNzYWdlPy5tZXNzYWdlO1xufSkoZXJyb3JVdGlsIHx8IChlcnJvclV0aWwgPSB7fSkpO1xuIiwgImltcG9ydCB7IFpvZEVycm9yLCBab2RJc3N1ZUNvZGUsIH0gZnJvbSBcIi4vWm9kRXJyb3IuanNcIjtcbmltcG9ydCB7IGRlZmF1bHRFcnJvck1hcCwgZ2V0RXJyb3JNYXAgfSBmcm9tIFwiLi9lcnJvcnMuanNcIjtcbmltcG9ydCB7IGVycm9yVXRpbCB9IGZyb20gXCIuL2hlbHBlcnMvZXJyb3JVdGlsLmpzXCI7XG5pbXBvcnQgeyBESVJUWSwgSU5WQUxJRCwgT0ssIFBhcnNlU3RhdHVzLCBhZGRJc3N1ZVRvQ29udGV4dCwgaXNBYm9ydGVkLCBpc0FzeW5jLCBpc0RpcnR5LCBpc1ZhbGlkLCBtYWtlSXNzdWUsIH0gZnJvbSBcIi4vaGVscGVycy9wYXJzZVV0aWwuanNcIjtcbmltcG9ydCB7IHV0aWwsIFpvZFBhcnNlZFR5cGUsIGdldFBhcnNlZFR5cGUgfSBmcm9tIFwiLi9oZWxwZXJzL3V0aWwuanNcIjtcbmNsYXNzIFBhcnNlSW5wdXRMYXp5UGF0aCB7XG4gICAgY29uc3RydWN0b3IocGFyZW50LCB2YWx1ZSwgcGF0aCwga2V5KSB7XG4gICAgICAgIHRoaXMuX2NhY2hlZFBhdGggPSBbXTtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgIHRoaXMuZGF0YSA9IHZhbHVlO1xuICAgICAgICB0aGlzLl9wYXRoID0gcGF0aDtcbiAgICAgICAgdGhpcy5fa2V5ID0ga2V5O1xuICAgIH1cbiAgICBnZXQgcGF0aCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9jYWNoZWRQYXRoLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5fa2V5KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlZFBhdGgucHVzaCguLi50aGlzLl9wYXRoLCAuLi50aGlzLl9rZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVkUGF0aC5wdXNoKC4uLnRoaXMuX3BhdGgsIHRoaXMuX2tleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZFBhdGg7XG4gICAgfVxufVxuY29uc3QgaGFuZGxlUmVzdWx0ID0gKGN0eCwgcmVzdWx0KSA9PiB7XG4gICAgaWYgKGlzVmFsaWQocmVzdWx0KSkge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQudmFsdWUgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmICghY3R4LmNvbW1vbi5pc3N1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWYWxpZGF0aW9uIGZhaWxlZCBidXQgbm8gaXNzdWVzIGRldGVjdGVkLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBnZXQgZXJyb3IoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2Vycm9yKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZXJyb3I7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgWm9kRXJyb3IoY3R4LmNvbW1vbi5pc3N1ZXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2Vycm9yID0gZXJyb3I7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Vycm9yO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG59O1xuZnVuY3Rpb24gcHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpIHtcbiAgICBpZiAoIXBhcmFtcylcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIGNvbnN0IHsgZXJyb3JNYXAsIGludmFsaWRfdHlwZV9lcnJvciwgcmVxdWlyZWRfZXJyb3IsIGRlc2NyaXB0aW9uIH0gPSBwYXJhbXM7XG4gICAgaWYgKGVycm9yTWFwICYmIChpbnZhbGlkX3R5cGVfZXJyb3IgfHwgcmVxdWlyZWRfZXJyb3IpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgdXNlIFwiaW52YWxpZF90eXBlX2Vycm9yXCIgb3IgXCJyZXF1aXJlZF9lcnJvclwiIGluIGNvbmp1bmN0aW9uIHdpdGggY3VzdG9tIGVycm9yIG1hcC5gKTtcbiAgICB9XG4gICAgaWYgKGVycm9yTWFwKVxuICAgICAgICByZXR1cm4geyBlcnJvck1hcDogZXJyb3JNYXAsIGRlc2NyaXB0aW9uIH07XG4gICAgY29uc3QgY3VzdG9tTWFwID0gKGlzcywgY3R4KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbWVzc2FnZSB9ID0gcGFyYW1zO1xuICAgICAgICBpZiAoaXNzLmNvZGUgPT09IFwiaW52YWxpZF9lbnVtX3ZhbHVlXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB7IG1lc3NhZ2U6IG1lc3NhZ2UgPz8gY3R4LmRlZmF1bHRFcnJvciB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgY3R4LmRhdGEgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB7IG1lc3NhZ2U6IG1lc3NhZ2UgPz8gcmVxdWlyZWRfZXJyb3IgPz8gY3R4LmRlZmF1bHRFcnJvciB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc3MuY29kZSAhPT0gXCJpbnZhbGlkX3R5cGVcIilcbiAgICAgICAgICAgIHJldHVybiB7IG1lc3NhZ2U6IGN0eC5kZWZhdWx0RXJyb3IgfTtcbiAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogbWVzc2FnZSA/PyBpbnZhbGlkX3R5cGVfZXJyb3IgPz8gY3R4LmRlZmF1bHRFcnJvciB9O1xuICAgIH07XG4gICAgcmV0dXJuIHsgZXJyb3JNYXA6IGN1c3RvbU1hcCwgZGVzY3JpcHRpb24gfTtcbn1cbmV4cG9ydCBjbGFzcyBab2RUeXBlIHtcbiAgICBnZXQgZGVzY3JpcHRpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuZGVzY3JpcHRpb247XG4gICAgfVxuICAgIF9nZXRUeXBlKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBnZXRQYXJzZWRUeXBlKGlucHV0LmRhdGEpO1xuICAgIH1cbiAgICBfZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCkge1xuICAgICAgICByZXR1cm4gKGN0eCB8fCB7XG4gICAgICAgICAgICBjb21tb246IGlucHV0LnBhcmVudC5jb21tb24sXG4gICAgICAgICAgICBkYXRhOiBpbnB1dC5kYXRhLFxuICAgICAgICAgICAgcGFyc2VkVHlwZTogZ2V0UGFyc2VkVHlwZShpbnB1dC5kYXRhKSxcbiAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICBwYXRoOiBpbnB1dC5wYXRoLFxuICAgICAgICAgICAgcGFyZW50OiBpbnB1dC5wYXJlbnQsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGF0dXM6IG5ldyBQYXJzZVN0YXR1cygpLFxuICAgICAgICAgICAgY3R4OiB7XG4gICAgICAgICAgICAgICAgY29tbW9uOiBpbnB1dC5wYXJlbnQuY29tbW9uLFxuICAgICAgICAgICAgICAgIGRhdGE6IGlucHV0LmRhdGEsXG4gICAgICAgICAgICAgICAgcGFyc2VkVHlwZTogZ2V0UGFyc2VkVHlwZShpbnB1dC5kYXRhKSxcbiAgICAgICAgICAgICAgICBzY2hlbWFFcnJvck1hcDogdGhpcy5fZGVmLmVycm9yTWFwLFxuICAgICAgICAgICAgICAgIHBhdGg6IGlucHV0LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBpbnB1dC5wYXJlbnQsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cbiAgICBfcGFyc2VTeW5jKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3BhcnNlKGlucHV0KTtcbiAgICAgICAgaWYgKGlzQXN5bmMocmVzdWx0KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3luY2hyb25vdXMgcGFyc2UgZW5jb3VudGVyZWQgcHJvbWlzZS5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgX3BhcnNlQXN5bmMoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcGFyc2UoaW5wdXQpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCk7XG4gICAgfVxuICAgIHBhcnNlKGRhdGEsIHBhcmFtcykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLnNhZmVQYXJzZShkYXRhLCBwYXJhbXMpO1xuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LmRhdGE7XG4gICAgICAgIHRocm93IHJlc3VsdC5lcnJvcjtcbiAgICB9XG4gICAgc2FmZVBhcnNlKGRhdGEsIHBhcmFtcykge1xuICAgICAgICBjb25zdCBjdHggPSB7XG4gICAgICAgICAgICBjb21tb246IHtcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICAgICAgICAgIGFzeW5jOiBwYXJhbXM/LmFzeW5jID8/IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbnRleHR1YWxFcnJvck1hcDogcGFyYW1zPy5lcnJvck1hcCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBwYXJhbXM/LnBhdGggfHwgW10sXG4gICAgICAgICAgICBzY2hlbWFFcnJvck1hcDogdGhpcy5fZGVmLmVycm9yTWFwLFxuICAgICAgICAgICAgcGFyZW50OiBudWxsLFxuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHBhcnNlZFR5cGU6IGdldFBhcnNlZFR5cGUoZGF0YSksXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3BhcnNlU3luYyh7IGRhdGEsIHBhdGg6IGN0eC5wYXRoLCBwYXJlbnQ6IGN0eCB9KTtcbiAgICAgICAgcmV0dXJuIGhhbmRsZVJlc3VsdChjdHgsIHJlc3VsdCk7XG4gICAgfVxuICAgIFwifnZhbGlkYXRlXCIoZGF0YSkge1xuICAgICAgICBjb25zdCBjdHggPSB7XG4gICAgICAgICAgICBjb21tb246IHtcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICAgICAgICAgIGFzeW5jOiAhIXRoaXNbXCJ+c3RhbmRhcmRcIl0uYXN5bmMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogW10sXG4gICAgICAgICAgICBzY2hlbWFFcnJvck1hcDogdGhpcy5fZGVmLmVycm9yTWFwLFxuICAgICAgICAgICAgcGFyZW50OiBudWxsLFxuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHBhcnNlZFR5cGU6IGdldFBhcnNlZFR5cGUoZGF0YSksXG4gICAgICAgIH07XG4gICAgICAgIGlmICghdGhpc1tcIn5zdGFuZGFyZFwiXS5hc3luYykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wYXJzZVN5bmMoeyBkYXRhLCBwYXRoOiBbXSwgcGFyZW50OiBjdHggfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzVmFsaWQocmVzdWx0KVxuICAgICAgICAgICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHQudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc3N1ZXM6IGN0eC5jb21tb24uaXNzdWVzLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnI/Lm1lc3NhZ2U/LnRvTG93ZXJDYXNlKCk/LmluY2x1ZGVzKFwiZW5jb3VudGVyZWRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpc1tcIn5zdGFuZGFyZFwiXS5hc3luYyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN0eC5jb21tb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnNlQXN5bmMoeyBkYXRhLCBwYXRoOiBbXSwgcGFyZW50OiBjdHggfSkudGhlbigocmVzdWx0KSA9PiBpc1ZhbGlkKHJlc3VsdClcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHQudmFsdWUsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IGN0eC5jb21tb24uaXNzdWVzLFxuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jIHBhcnNlQXN5bmMoZGF0YSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc2FmZVBhcnNlQXN5bmMoZGF0YSwgcGFyYW1zKTtcbiAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5kYXRhO1xuICAgICAgICB0aHJvdyByZXN1bHQuZXJyb3I7XG4gICAgfVxuICAgIGFzeW5jIHNhZmVQYXJzZUFzeW5jKGRhdGEsIHBhcmFtcykge1xuICAgICAgICBjb25zdCBjdHggPSB7XG4gICAgICAgICAgICBjb21tb246IHtcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICAgICAgICAgIGNvbnRleHR1YWxFcnJvck1hcDogcGFyYW1zPy5lcnJvck1hcCxcbiAgICAgICAgICAgICAgICBhc3luYzogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBwYXJhbXM/LnBhdGggfHwgW10sXG4gICAgICAgICAgICBzY2hlbWFFcnJvck1hcDogdGhpcy5fZGVmLmVycm9yTWFwLFxuICAgICAgICAgICAgcGFyZW50OiBudWxsLFxuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHBhcnNlZFR5cGU6IGdldFBhcnNlZFR5cGUoZGF0YSksXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG1heWJlQXN5bmNSZXN1bHQgPSB0aGlzLl9wYXJzZSh7IGRhdGEsIHBhdGg6IGN0eC5wYXRoLCBwYXJlbnQ6IGN0eCB9KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgKGlzQXN5bmMobWF5YmVBc3luY1Jlc3VsdCkgPyBtYXliZUFzeW5jUmVzdWx0IDogUHJvbWlzZS5yZXNvbHZlKG1heWJlQXN5bmNSZXN1bHQpKTtcbiAgICAgICAgcmV0dXJuIGhhbmRsZVJlc3VsdChjdHgsIHJlc3VsdCk7XG4gICAgfVxuICAgIHJlZmluZShjaGVjaywgbWVzc2FnZSkge1xuICAgICAgICBjb25zdCBnZXRJc3N1ZVByb3BlcnRpZXMgPSAodmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIG1lc3NhZ2UgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBtZXNzYWdlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UodmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVmaW5lbWVudCgodmFsLCBjdHgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNoZWNrKHZhbCk7XG4gICAgICAgICAgICBjb25zdCBzZXRFcnJvciA9ICgpID0+IGN0eC5hZGRJc3N1ZSh7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmN1c3RvbSxcbiAgICAgICAgICAgICAgICAuLi5nZXRJc3N1ZVByb3BlcnRpZXModmFsKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBQcm9taXNlICE9PSBcInVuZGVmaW5lZFwiICYmIHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRFcnJvcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgc2V0RXJyb3IoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlZmluZW1lbnQoY2hlY2ssIHJlZmluZW1lbnREYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZpbmVtZW50KCh2YWwsIGN0eCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjaGVjayh2YWwpKSB7XG4gICAgICAgICAgICAgICAgY3R4LmFkZElzc3VlKHR5cGVvZiByZWZpbmVtZW50RGF0YSA9PT0gXCJmdW5jdGlvblwiID8gcmVmaW5lbWVudERhdGEodmFsLCBjdHgpIDogcmVmaW5lbWVudERhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgX3JlZmluZW1lbnQocmVmaW5lbWVudCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEVmZmVjdHMoe1xuICAgICAgICAgICAgc2NoZW1hOiB0aGlzLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFZmZlY3RzLFxuICAgICAgICAgICAgZWZmZWN0OiB7IHR5cGU6IFwicmVmaW5lbWVudFwiLCByZWZpbmVtZW50IH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdXBlclJlZmluZShyZWZpbmVtZW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZpbmVtZW50KHJlZmluZW1lbnQpO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihkZWYpIHtcbiAgICAgICAgLyoqIEFsaWFzIG9mIHNhZmVQYXJzZUFzeW5jICovXG4gICAgICAgIHRoaXMuc3BhID0gdGhpcy5zYWZlUGFyc2VBc3luYztcbiAgICAgICAgdGhpcy5fZGVmID0gZGVmO1xuICAgICAgICB0aGlzLnBhcnNlID0gdGhpcy5wYXJzZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnNhZmVQYXJzZSA9IHRoaXMuc2FmZVBhcnNlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucGFyc2VBc3luYyA9IHRoaXMucGFyc2VBc3luYy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnNhZmVQYXJzZUFzeW5jID0gdGhpcy5zYWZlUGFyc2VBc3luYy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnNwYSA9IHRoaXMuc3BhLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucmVmaW5lID0gdGhpcy5yZWZpbmUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5yZWZpbmVtZW50ID0gdGhpcy5yZWZpbmVtZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc3VwZXJSZWZpbmUgPSB0aGlzLnN1cGVyUmVmaW5lLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub3B0aW9uYWwgPSB0aGlzLm9wdGlvbmFsLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMubnVsbGFibGUgPSB0aGlzLm51bGxhYmxlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMubnVsbGlzaCA9IHRoaXMubnVsbGlzaC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmFycmF5ID0gdGhpcy5hcnJheS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnByb21pc2UgPSB0aGlzLnByb21pc2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5vciA9IHRoaXMub3IuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5hbmQgPSB0aGlzLmFuZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybSA9IHRoaXMudHJhbnNmb3JtLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnJhbmQgPSB0aGlzLmJyYW5kLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZGVmYXVsdCA9IHRoaXMuZGVmYXVsdC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmNhdGNoID0gdGhpcy5jYXRjaC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmRlc2NyaWJlID0gdGhpcy5kZXNjcmliZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnBpcGUgPSB0aGlzLnBpcGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5yZWFkb25seSA9IHRoaXMucmVhZG9ubHkuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5pc051bGxhYmxlID0gdGhpcy5pc051bGxhYmxlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaXNPcHRpb25hbCA9IHRoaXMuaXNPcHRpb25hbC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzW1wifnN0YW5kYXJkXCJdID0ge1xuICAgICAgICAgICAgdmVyc2lvbjogMSxcbiAgICAgICAgICAgIHZlbmRvcjogXCJ6b2RcIixcbiAgICAgICAgICAgIHZhbGlkYXRlOiAoZGF0YSkgPT4gdGhpc1tcIn52YWxpZGF0ZVwiXShkYXRhKSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgb3B0aW9uYWwoKSB7XG4gICAgICAgIHJldHVybiBab2RPcHRpb25hbC5jcmVhdGUodGhpcywgdGhpcy5fZGVmKTtcbiAgICB9XG4gICAgbnVsbGFibGUoKSB7XG4gICAgICAgIHJldHVybiBab2ROdWxsYWJsZS5jcmVhdGUodGhpcywgdGhpcy5fZGVmKTtcbiAgICB9XG4gICAgbnVsbGlzaCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubnVsbGFibGUoKS5vcHRpb25hbCgpO1xuICAgIH1cbiAgICBhcnJheSgpIHtcbiAgICAgICAgcmV0dXJuIFpvZEFycmF5LmNyZWF0ZSh0aGlzKTtcbiAgICB9XG4gICAgcHJvbWlzZSgpIHtcbiAgICAgICAgcmV0dXJuIFpvZFByb21pc2UuY3JlYXRlKHRoaXMsIHRoaXMuX2RlZik7XG4gICAgfVxuICAgIG9yKG9wdGlvbikge1xuICAgICAgICByZXR1cm4gWm9kVW5pb24uY3JlYXRlKFt0aGlzLCBvcHRpb25dLCB0aGlzLl9kZWYpO1xuICAgIH1cbiAgICBhbmQoaW5jb21pbmcpIHtcbiAgICAgICAgcmV0dXJuIFpvZEludGVyc2VjdGlvbi5jcmVhdGUodGhpcywgaW5jb21pbmcsIHRoaXMuX2RlZik7XG4gICAgfVxuICAgIHRyYW5zZm9ybSh0cmFuc2Zvcm0pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RFZmZlY3RzKHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXModGhpcy5fZGVmKSxcbiAgICAgICAgICAgIHNjaGVtYTogdGhpcyxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRWZmZWN0cyxcbiAgICAgICAgICAgIGVmZmVjdDogeyB0eXBlOiBcInRyYW5zZm9ybVwiLCB0cmFuc2Zvcm0gfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGRlZmF1bHQoZGVmKSB7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRWYWx1ZUZ1bmMgPSB0eXBlb2YgZGVmID09PSBcImZ1bmN0aW9uXCIgPyBkZWYgOiAoKSA9PiBkZWY7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRGVmYXVsdCh7XG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHRoaXMuX2RlZiksXG4gICAgICAgICAgICBpbm5lclR5cGU6IHRoaXMsXG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IGRlZmF1bHRWYWx1ZUZ1bmMsXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZERlZmF1bHQsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBicmFuZCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RCcmFuZGVkKHtcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQnJhbmRlZCxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMsXG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHRoaXMuX2RlZiksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjYXRjaChkZWYpIHtcbiAgICAgICAgY29uc3QgY2F0Y2hWYWx1ZUZ1bmMgPSB0eXBlb2YgZGVmID09PSBcImZ1bmN0aW9uXCIgPyBkZWYgOiAoKSA9PiBkZWY7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQ2F0Y2goe1xuICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyh0aGlzLl9kZWYpLFxuICAgICAgICAgICAgaW5uZXJUeXBlOiB0aGlzLFxuICAgICAgICAgICAgY2F0Y2hWYWx1ZTogY2F0Y2hWYWx1ZUZ1bmMsXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZENhdGNoLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZGVzY3JpYmUoZGVzY3JpcHRpb24pIHtcbiAgICAgICAgY29uc3QgVGhpcyA9IHRoaXMuY29uc3RydWN0b3I7XG4gICAgICAgIHJldHVybiBuZXcgVGhpcyh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBpcGUodGFyZ2V0KSB7XG4gICAgICAgIHJldHVybiBab2RQaXBlbGluZS5jcmVhdGUodGhpcywgdGFyZ2V0KTtcbiAgICB9XG4gICAgcmVhZG9ubHkoKSB7XG4gICAgICAgIHJldHVybiBab2RSZWFkb25seS5jcmVhdGUodGhpcyk7XG4gICAgfVxuICAgIGlzT3B0aW9uYWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNhZmVQYXJzZSh1bmRlZmluZWQpLnN1Y2Nlc3M7XG4gICAgfVxuICAgIGlzTnVsbGFibGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNhZmVQYXJzZShudWxsKS5zdWNjZXNzO1xuICAgIH1cbn1cbmNvbnN0IGN1aWRSZWdleCA9IC9eY1teXFxzLV17OCx9JC9pO1xuY29uc3QgY3VpZDJSZWdleCA9IC9eWzAtOWEtel0rJC87XG5jb25zdCB1bGlkUmVnZXggPSAvXlswLTlBLUhKS01OUC1UVi1aXXsyNn0kL2k7XG4vLyBjb25zdCB1dWlkUmVnZXggPVxuLy8gICAvXihbYS1mMC05XXs4fS1bYS1mMC05XXs0fS1bMS01XVthLWYwLTldezN9LVthLWYwLTldezR9LVthLWYwLTldezEyfXwwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDApJC9pO1xuY29uc3QgdXVpZFJlZ2V4ID0gL15bMC05YS1mQS1GXXs4fVxcYi1bMC05YS1mQS1GXXs0fVxcYi1bMC05YS1mQS1GXXs0fVxcYi1bMC05YS1mQS1GXXs0fVxcYi1bMC05YS1mQS1GXXsxMn0kL2k7XG5jb25zdCBuYW5vaWRSZWdleCA9IC9eW2EtejAtOV8tXXsyMX0kL2k7XG5jb25zdCBqd3RSZWdleCA9IC9eW0EtWmEtejAtOS1fXStcXC5bQS1aYS16MC05LV9dK1xcLltBLVphLXowLTktX10qJC87XG5jb25zdCBkdXJhdGlvblJlZ2V4ID0gL15bLStdP1AoPyEkKSg/Oig/OlstK10/XFxkK1kpfCg/OlstK10/XFxkK1suLF1cXGQrWSQpKT8oPzooPzpbLStdP1xcZCtNKXwoPzpbLStdP1xcZCtbLixdXFxkK00kKSk/KD86KD86Wy0rXT9cXGQrVyl8KD86Wy0rXT9cXGQrWy4sXVxcZCtXJCkpPyg/Oig/OlstK10/XFxkK0QpfCg/OlstK10/XFxkK1suLF1cXGQrRCQpKT8oPzpUKD89W1xcZCstXSkoPzooPzpbLStdP1xcZCtIKXwoPzpbLStdP1xcZCtbLixdXFxkK0gkKSk/KD86KD86Wy0rXT9cXGQrTSl8KD86Wy0rXT9cXGQrWy4sXVxcZCtNJCkpPyg/OlstK10/XFxkKyg/OlsuLF1cXGQrKT9TKT8pPz8kLztcbi8vIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzQ2MTgxLzE1NTAxNTVcbi8vIG9sZCB2ZXJzaW9uOiB0b28gc2xvdywgZGlkbid0IHN1cHBvcnQgdW5pY29kZVxuLy8gY29uc3QgZW1haWxSZWdleCA9IC9eKCgoW2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKyhcXC4oW2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKykqKXwoKFxceDIyKSgoKChcXHgyMHxcXHgwOSkqKFxceDBkXFx4MGEpKT8oXFx4MjB8XFx4MDkpKyk/KChbXFx4MDEtXFx4MDhcXHgwYlxceDBjXFx4MGUtXFx4MWZcXHg3Zl18XFx4MjF8W1xceDIzLVxceDViXXxbXFx4NWQtXFx4N2VdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoXFxcXChbXFx4MDEtXFx4MDlcXHgwYlxceDBjXFx4MGQtXFx4N2ZdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpKSooKChcXHgyMHxcXHgwOSkqKFxceDBkXFx4MGEpKT8oXFx4MjB8XFx4MDkpKyk/KFxceDIyKSkpQCgoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4pKygoW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKSQvaTtcbi8vb2xkIGVtYWlsIHJlZ2V4XG4vLyBjb25zdCBlbWFpbFJlZ2V4ID0gL14oKFtePD4oKVtcXF0uLDs6XFxzQFwiXSsoXFwuW148PigpW1xcXS4sOzpcXHNAXCJdKykqKXwoXCIuK1wiKSlAKCg/IS0pKFtePD4oKVtcXF0uLDs6XFxzQFwiXStcXC4pK1tePD4oKVtcXF0uLDs6XFxzQFwiXXsxLH0pW14tPD4oKVtcXF0uLDs6XFxzQFwiXSQvaTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuLy8gY29uc3QgZW1haWxSZWdleCA9XG4vLyAgIC9eKChbXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFxcWygoKDI1WzAtNV0pfCgyWzAtNF1bMC05XSl8KDFbMC05XXsyfSl8KFswLTldezEsMn0pKVxcLil7M30oKDI1WzAtNV0pfCgyWzAtNF1bMC05XSl8KDFbMC05XXsyfSl8KFswLTldezEsMn0pKVxcXSl8KFxcW0lQdjY6KChbYS1mMC05XXsxLDR9Oil7N318OjooW2EtZjAtOV17MSw0fTopezAsNn18KFthLWYwLTldezEsNH06KXsxfTooW2EtZjAtOV17MSw0fTopezAsNX18KFthLWYwLTldezEsNH06KXsyfTooW2EtZjAtOV17MSw0fTopezAsNH18KFthLWYwLTldezEsNH06KXszfTooW2EtZjAtOV17MSw0fTopezAsM318KFthLWYwLTldezEsNH06KXs0fTooW2EtZjAtOV17MSw0fTopezAsMn18KFthLWYwLTldezEsNH06KXs1fTooW2EtZjAtOV17MSw0fTopezAsMX0pKFthLWYwLTldezEsNH18KCgoMjVbMC01XSl8KDJbMC00XVswLTldKXwoMVswLTldezJ9KXwoWzAtOV17MSwyfSkpXFwuKXszfSgoMjVbMC01XSl8KDJbMC00XVswLTldKXwoMVswLTldezJ9KXwoWzAtOV17MSwyfSkpKVxcXSl8KFtBLVphLXowLTldKFtBLVphLXowLTktXSpbQS1aYS16MC05XSkqKFxcLltBLVphLXpdezIsfSkrKSkkLztcbi8vIGNvbnN0IGVtYWlsUmVnZXggPVxuLy8gICAvXlthLXpBLVowLTlcXC5cXCFcXCNcXCRcXCVcXCZcXCdcXCpcXCtcXC9cXD1cXD9cXF5cXF9cXGBcXHtcXHxcXH1cXH5cXC1dK0BbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKiQvO1xuLy8gY29uc3QgZW1haWxSZWdleCA9XG4vLyAgIC9eKD86W2EtejAtOSEjJCUmJyorLz0/Xl9ge3x9fi1dKyg/OlxcLlthLXowLTkhIyQlJicqKy89P15fYHt8fX4tXSspKnxcIig/OltcXHgwMS1cXHgwOFxceDBiXFx4MGNcXHgwZS1cXHgxZlxceDIxXFx4MjMtXFx4NWJcXHg1ZC1cXHg3Zl18XFxcXFtcXHgwMS1cXHgwOVxceDBiXFx4MGNcXHgwZS1cXHg3Zl0pKlwiKUAoPzooPzpbYS16MC05XSg/OlthLXowLTktXSpbYS16MC05XSk/XFwuKStbYS16MC05XSg/OlthLXowLTktXSpbYS16MC05XSk/fFxcWyg/Oig/OjI1WzAtNV18MlswLTRdWzAtOV18WzAxXT9bMC05XVswLTldPylcXC4pezN9KD86MjVbMC01XXwyWzAtNF1bMC05XXxbMDFdP1swLTldWzAtOV0/fFthLXowLTktXSpbYS16MC05XTooPzpbXFx4MDEtXFx4MDhcXHgwYlxceDBjXFx4MGUtXFx4MWZcXHgyMS1cXHg1YVxceDUzLVxceDdmXXxcXFxcW1xceDAxLVxceDA5XFx4MGJcXHgwY1xceDBlLVxceDdmXSkrKVxcXSkkL2k7XG5jb25zdCBlbWFpbFJlZ2V4ID0gL14oPyFcXC4pKD8hLipcXC5cXC4pKFtBLVowLTlfJytcXC1cXC5dKilbQS1aMC05XystXUAoW0EtWjAtOV1bQS1aMC05XFwtXSpcXC4pK1tBLVpdezIsfSQvaTtcbi8vIGNvbnN0IGVtYWlsUmVnZXggPVxuLy8gICAvXlthLXowLTkuISMkJSZcdTIwMTkqKy89P15fYHt8fX4tXStAW2EtejAtOS1dKyg/OlxcLlthLXowLTlcXC1dKykqJC9pO1xuLy8gZnJvbSBodHRwczovL3RoZWtldmluc2NvdHQuY29tL2Vtb2ppcy1pbi1qYXZhc2NyaXB0LyN3cml0aW5nLWEtcmVndWxhci1leHByZXNzaW9uXG5jb25zdCBfZW1vamlSZWdleCA9IGBeKFxcXFxwe0V4dGVuZGVkX1BpY3RvZ3JhcGhpY318XFxcXHB7RW1vamlfQ29tcG9uZW50fSkrJGA7XG5sZXQgZW1vamlSZWdleDtcbi8vIGZhc3Rlciwgc2ltcGxlciwgc2FmZXJcbmNvbnN0IGlwdjRSZWdleCA9IC9eKD86KD86MjVbMC01XXwyWzAtNF1bMC05XXwxWzAtOV1bMC05XXxbMS05XVswLTldfFswLTldKVxcLil7M30oPzoyNVswLTVdfDJbMC00XVswLTldfDFbMC05XVswLTldfFsxLTldWzAtOV18WzAtOV0pJC87XG5jb25zdCBpcHY0Q2lkclJlZ2V4ID0gL14oPzooPzoyNVswLTVdfDJbMC00XVswLTldfDFbMC05XVswLTldfFsxLTldWzAtOV18WzAtOV0pXFwuKXszfSg/OjI1WzAtNV18MlswLTRdWzAtOV18MVswLTldWzAtOV18WzEtOV1bMC05XXxbMC05XSlcXC8oM1swLTJdfFsxMl0/WzAtOV0pJC87XG4vLyBjb25zdCBpcHY2UmVnZXggPVxuLy8gL14oKFthLWYwLTldezEsNH06KXs3fXw6OihbYS1mMC05XXsxLDR9Oil7MCw2fXwoW2EtZjAtOV17MSw0fTopezF9OihbYS1mMC05XXsxLDR9Oil7MCw1fXwoW2EtZjAtOV17MSw0fTopezJ9OihbYS1mMC05XXsxLDR9Oil7MCw0fXwoW2EtZjAtOV17MSw0fTopezN9OihbYS1mMC05XXsxLDR9Oil7MCwzfXwoW2EtZjAtOV17MSw0fTopezR9OihbYS1mMC05XXsxLDR9Oil7MCwyfXwoW2EtZjAtOV17MSw0fTopezV9OihbYS1mMC05XXsxLDR9Oil7MCwxfSkoW2EtZjAtOV17MSw0fXwoKCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSlcXC4pezN9KCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSkpJC87XG5jb25zdCBpcHY2UmVnZXggPSAvXigoWzAtOWEtZkEtRl17MSw0fTopezcsN31bMC05YS1mQS1GXXsxLDR9fChbMC05YS1mQS1GXXsxLDR9Oil7MSw3fTp8KFswLTlhLWZBLUZdezEsNH06KXsxLDZ9OlswLTlhLWZBLUZdezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDV9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDJ9fChbMC05YS1mQS1GXXsxLDR9Oil7MSw0fSg6WzAtOWEtZkEtRl17MSw0fSl7MSwzfXwoWzAtOWEtZkEtRl17MSw0fTopezEsM30oOlswLTlhLWZBLUZdezEsNH0pezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDJ9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDV9fFswLTlhLWZBLUZdezEsNH06KCg6WzAtOWEtZkEtRl17MSw0fSl7MSw2fSl8OigoOlswLTlhLWZBLUZdezEsNH0pezEsN318Oil8ZmU4MDooOlswLTlhLWZBLUZdezAsNH0pezAsNH0lWzAtOWEtekEtWl17MSx9fDo6KGZmZmYoOjB7MSw0fSl7MCwxfTopezAsMX0oKDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKVxcLil7MywzfSgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSl8KFswLTlhLWZBLUZdezEsNH06KXsxLDR9OigoMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pXFwuKXszLDN9KDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKSkkLztcbmNvbnN0IGlwdjZDaWRyUmVnZXggPSAvXigoWzAtOWEtZkEtRl17MSw0fTopezcsN31bMC05YS1mQS1GXXsxLDR9fChbMC05YS1mQS1GXXsxLDR9Oil7MSw3fTp8KFswLTlhLWZBLUZdezEsNH06KXsxLDZ9OlswLTlhLWZBLUZdezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDV9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDJ9fChbMC05YS1mQS1GXXsxLDR9Oil7MSw0fSg6WzAtOWEtZkEtRl17MSw0fSl7MSwzfXwoWzAtOWEtZkEtRl17MSw0fTopezEsM30oOlswLTlhLWZBLUZdezEsNH0pezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDJ9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDV9fFswLTlhLWZBLUZdezEsNH06KCg6WzAtOWEtZkEtRl17MSw0fSl7MSw2fSl8OigoOlswLTlhLWZBLUZdezEsNH0pezEsN318Oil8ZmU4MDooOlswLTlhLWZBLUZdezAsNH0pezAsNH0lWzAtOWEtekEtWl17MSx9fDo6KGZmZmYoOjB7MSw0fSl7MCwxfTopezAsMX0oKDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKVxcLil7MywzfSgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSl8KFswLTlhLWZBLUZdezEsNH06KXsxLDR9OigoMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pXFwuKXszLDN9KDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKSlcXC8oMTJbMC04XXwxWzAxXVswLTldfFsxLTldP1swLTldKSQvO1xuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNzg2MDM5Mi9kZXRlcm1pbmUtaWYtc3RyaW5nLWlzLWluLWJhc2U2NC11c2luZy1qYXZhc2NyaXB0XG5jb25zdCBiYXNlNjRSZWdleCA9IC9eKFswLTlhLXpBLVorL117NH0pKigoWzAtOWEtekEtWisvXXsyfT09KXwoWzAtOWEtekEtWisvXXszfT0pKT8kLztcbi8vIGh0dHBzOi8vYmFzZTY0Lmd1cnUvc3RhbmRhcmRzL2Jhc2U2NHVybFxuY29uc3QgYmFzZTY0dXJsUmVnZXggPSAvXihbMC05YS16QS1aLV9dezR9KSooKFswLTlhLXpBLVotX117Mn0oPT0pPyl8KFswLTlhLXpBLVotX117M30oPSk/KSk/JC87XG4vLyBzaW1wbGVcbi8vIGNvbnN0IGRhdGVSZWdleFNvdXJjZSA9IGBcXFxcZHs0fS1cXFxcZHsyfS1cXFxcZHsyfWA7XG4vLyBubyBsZWFwIHllYXIgdmFsaWRhdGlvblxuLy8gY29uc3QgZGF0ZVJlZ2V4U291cmNlID0gYFxcXFxkezR9LSgoMFsxMzU3OF18MTB8MTIpLTMxfCgwWzEzLTldfDFbMC0yXSktMzB8KDBbMS05XXwxWzAtMl0pLSgwWzEtOV18MVxcXFxkfDJcXFxcZCkpYDtcbi8vIHdpdGggbGVhcCB5ZWFyIHZhbGlkYXRpb25cbmNvbnN0IGRhdGVSZWdleFNvdXJjZSA9IGAoKFxcXFxkXFxcXGRbMjQ2OF1bMDQ4XXxcXFxcZFxcXFxkWzEzNTc5XVsyNl18XFxcXGRcXFxcZDBbNDhdfFswMjQ2OF1bMDQ4XTAwfFsxMzU3OV1bMjZdMDApLTAyLTI5fFxcXFxkezR9LSgoMFsxMzU3OF18MVswMl0pLSgwWzEtOV18WzEyXVxcXFxkfDNbMDFdKXwoMFs0NjldfDExKS0oMFsxLTldfFsxMl1cXFxcZHwzMCl8KDAyKS0oMFsxLTldfDFcXFxcZHwyWzAtOF0pKSlgO1xuY29uc3QgZGF0ZVJlZ2V4ID0gbmV3IFJlZ0V4cChgXiR7ZGF0ZVJlZ2V4U291cmNlfSRgKTtcbmZ1bmN0aW9uIHRpbWVSZWdleFNvdXJjZShhcmdzKSB7XG4gICAgbGV0IHNlY29uZHNSZWdleFNvdXJjZSA9IGBbMC01XVxcXFxkYDtcbiAgICBpZiAoYXJncy5wcmVjaXNpb24pIHtcbiAgICAgICAgc2Vjb25kc1JlZ2V4U291cmNlID0gYCR7c2Vjb25kc1JlZ2V4U291cmNlfVxcXFwuXFxcXGR7JHthcmdzLnByZWNpc2lvbn19YDtcbiAgICB9XG4gICAgZWxzZSBpZiAoYXJncy5wcmVjaXNpb24gPT0gbnVsbCkge1xuICAgICAgICBzZWNvbmRzUmVnZXhTb3VyY2UgPSBgJHtzZWNvbmRzUmVnZXhTb3VyY2V9KFxcXFwuXFxcXGQrKT9gO1xuICAgIH1cbiAgICBjb25zdCBzZWNvbmRzUXVhbnRpZmllciA9IGFyZ3MucHJlY2lzaW9uID8gXCIrXCIgOiBcIj9cIjsgLy8gcmVxdWlyZSBzZWNvbmRzIGlmIHByZWNpc2lvbiBpcyBub256ZXJvXG4gICAgcmV0dXJuIGAoWzAxXVxcXFxkfDJbMC0zXSk6WzAtNV1cXFxcZCg6JHtzZWNvbmRzUmVnZXhTb3VyY2V9KSR7c2Vjb25kc1F1YW50aWZpZXJ9YDtcbn1cbmZ1bmN0aW9uIHRpbWVSZWdleChhcmdzKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4ke3RpbWVSZWdleFNvdXJjZShhcmdzKX0kYCk7XG59XG4vLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzMxNDMyMzFcbmV4cG9ydCBmdW5jdGlvbiBkYXRldGltZVJlZ2V4KGFyZ3MpIHtcbiAgICBsZXQgcmVnZXggPSBgJHtkYXRlUmVnZXhTb3VyY2V9VCR7dGltZVJlZ2V4U291cmNlKGFyZ3MpfWA7XG4gICAgY29uc3Qgb3B0cyA9IFtdO1xuICAgIG9wdHMucHVzaChhcmdzLmxvY2FsID8gYFo/YCA6IGBaYCk7XG4gICAgaWYgKGFyZ3Mub2Zmc2V0KVxuICAgICAgICBvcHRzLnB1c2goYChbKy1dXFxcXGR7Mn06P1xcXFxkezJ9KWApO1xuICAgIHJlZ2V4ID0gYCR7cmVnZXh9KCR7b3B0cy5qb2luKFwifFwiKX0pYDtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXiR7cmVnZXh9JGApO1xufVxuZnVuY3Rpb24gaXNWYWxpZElQKGlwLCB2ZXJzaW9uKSB7XG4gICAgaWYgKCh2ZXJzaW9uID09PSBcInY0XCIgfHwgIXZlcnNpb24pICYmIGlwdjRSZWdleC50ZXN0KGlwKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKCh2ZXJzaW9uID09PSBcInY2XCIgfHwgIXZlcnNpb24pICYmIGlwdjZSZWdleC50ZXN0KGlwKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gaXNWYWxpZEpXVChqd3QsIGFsZykge1xuICAgIGlmICghand0UmVnZXgudGVzdChqd3QpKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgW2hlYWRlcl0gPSBqd3Quc3BsaXQoXCIuXCIpO1xuICAgICAgICBpZiAoIWhlYWRlcilcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy8gQ29udmVydCBiYXNlNjR1cmwgdG8gYmFzZTY0XG4gICAgICAgIGNvbnN0IGJhc2U2NCA9IGhlYWRlclxuICAgICAgICAgICAgLnJlcGxhY2UoLy0vZywgXCIrXCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvXy9nLCBcIi9cIilcbiAgICAgICAgICAgIC5wYWRFbmQoaGVhZGVyLmxlbmd0aCArICgoNCAtIChoZWFkZXIubGVuZ3RoICUgNCkpICUgNCksIFwiPVwiKTtcbiAgICAgICAgY29uc3QgZGVjb2RlZCA9IEpTT04ucGFyc2UoYXRvYihiYXNlNjQpKTtcbiAgICAgICAgaWYgKHR5cGVvZiBkZWNvZGVkICE9PSBcIm9iamVjdFwiIHx8IGRlY29kZWQgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChcInR5cFwiIGluIGRlY29kZWQgJiYgZGVjb2RlZD8udHlwICE9PSBcIkpXVFwiKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoIWRlY29kZWQuYWxnKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoYWxnICYmIGRlY29kZWQuYWxnICE9PSBhbGcpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5mdW5jdGlvbiBpc1ZhbGlkQ2lkcihpcCwgdmVyc2lvbikge1xuICAgIGlmICgodmVyc2lvbiA9PT0gXCJ2NFwiIHx8ICF2ZXJzaW9uKSAmJiBpcHY0Q2lkclJlZ2V4LnRlc3QoaXApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoKHZlcnNpb24gPT09IFwidjZcIiB8fCAhdmVyc2lvbikgJiYgaXB2NkNpZHJSZWdleC50ZXN0KGlwKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZXhwb3J0IGNsYXNzIFpvZFN0cmluZyBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5fZGVmLmNvZXJjZSkge1xuICAgICAgICAgICAgaW5wdXQuZGF0YSA9IFN0cmluZyhpbnB1dC5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLnN0cmluZykge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5zdHJpbmcsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdGF0dXMgPSBuZXcgUGFyc2VTdGF0dXMoKTtcbiAgICAgICAgbGV0IGN0eCA9IHVuZGVmaW5lZDtcbiAgICAgICAgZm9yIChjb25zdCBjaGVjayBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2sua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5kYXRhLmxlbmd0aCA8IGNoZWNrLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5kYXRhLmxlbmd0aCA+IGNoZWNrLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibGVuZ3RoXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b29CaWcgPSBpbnB1dC5kYXRhLmxlbmd0aCA+IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb1NtYWxsID0gaW5wdXQuZGF0YS5sZW5ndGggPCBjaGVjay52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodG9vQmlnIHx8IHRvb1NtYWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodG9vQmlnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodG9vU21hbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZW1haWxcIikge1xuICAgICAgICAgICAgICAgIGlmICghZW1haWxSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiZW1haWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImVtb2ppXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVtb2ppUmVnZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgZW1vamlSZWdleCA9IG5ldyBSZWdFeHAoX2Vtb2ppUmVnZXgsIFwidVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFlbW9qaVJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJlbW9qaVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwidXVpZFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF1dWlkUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcInV1aWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm5hbm9pZFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFuYW5vaWRSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwibmFub2lkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJjdWlkXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWN1aWRSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiY3VpZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiY3VpZDJcIikge1xuICAgICAgICAgICAgICAgIGlmICghY3VpZDJSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiY3VpZDJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInVsaWRcIikge1xuICAgICAgICAgICAgICAgIGlmICghdWxpZFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJ1bGlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ1cmxcIikge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIG5ldyBVUkwoaW5wdXQuZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJ1cmxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInJlZ2V4XCIpIHtcbiAgICAgICAgICAgICAgICBjaGVjay5yZWdleC5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRlc3RSZXN1bHQgPSBjaGVjay5yZWdleC50ZXN0KGlucHV0LmRhdGEpO1xuICAgICAgICAgICAgICAgIGlmICghdGVzdFJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcInJlZ2V4XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ0cmltXCIpIHtcbiAgICAgICAgICAgICAgICBpbnB1dC5kYXRhID0gaW5wdXQuZGF0YS50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImluY2x1ZGVzXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0LmRhdGEuaW5jbHVkZXMoY2hlY2sudmFsdWUsIGNoZWNrLnBvc2l0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiB7IGluY2x1ZGVzOiBjaGVjay52YWx1ZSwgcG9zaXRpb246IGNoZWNrLnBvc2l0aW9uIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ0b0xvd2VyQ2FzZVwiKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQuZGF0YSA9IGlucHV0LmRhdGEudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwidG9VcHBlckNhc2VcIikge1xuICAgICAgICAgICAgICAgIGlucHV0LmRhdGEgPSBpbnB1dC5kYXRhLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInN0YXJ0c1dpdGhcIikge1xuICAgICAgICAgICAgICAgIGlmICghaW5wdXQuZGF0YS5zdGFydHNXaXRoKGNoZWNrLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiB7IHN0YXJ0c1dpdGg6IGNoZWNrLnZhbHVlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJlbmRzV2l0aFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpbnB1dC5kYXRhLmVuZHNXaXRoKGNoZWNrLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiB7IGVuZHNXaXRoOiBjaGVjay52YWx1ZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZGF0ZXRpbWVcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gZGF0ZXRpbWVSZWdleChjaGVjayk7XG4gICAgICAgICAgICAgICAgaWYgKCFyZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiZGF0ZXRpbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImRhdGVcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gZGF0ZVJlZ2V4O1xuICAgICAgICAgICAgICAgIGlmICghcmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInRpbWVcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gdGltZVJlZ2V4KGNoZWNrKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJ0aW1lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJkdXJhdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkdXJhdGlvblJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJkdXJhdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiaXBcIikge1xuICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZElQKGlucHV0LmRhdGEsIGNoZWNrLnZlcnNpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiaXBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImp3dFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkSldUKGlucHV0LmRhdGEsIGNoZWNrLmFsZykpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJqd3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImNpZHJcIikge1xuICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZENpZHIoaW5wdXQuZGF0YSwgY2hlY2sudmVyc2lvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJjaWRyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJiYXNlNjRcIikge1xuICAgICAgICAgICAgICAgIGlmICghYmFzZTY0UmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImJhc2U2NFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiYmFzZTY0dXJsXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWJhc2U2NHVybFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJiYXNlNjR1cmxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGNoZWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGlucHV0LmRhdGEgfTtcbiAgICB9XG4gICAgX3JlZ2V4KHJlZ2V4LCB2YWxpZGF0aW9uLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlZmluZW1lbnQoKGRhdGEpID0+IHJlZ2V4LnRlc3QoZGF0YSksIHtcbiAgICAgICAgICAgIHZhbGlkYXRpb24sXG4gICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfYWRkQ2hlY2soY2hlY2spIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTdHJpbmcoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgY2hlY2tdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZW1haWwobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImVtYWlsXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgdXJsKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJ1cmxcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBlbW9qaShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiZW1vamlcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICB1dWlkKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJ1dWlkXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgbmFub2lkKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJuYW5vaWRcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBjdWlkKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJjdWlkXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgY3VpZDIobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImN1aWQyXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgdWxpZChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwidWxpZFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIGJhc2U2NChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiYmFzZTY0XCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgYmFzZTY0dXJsKG1lc3NhZ2UpIHtcbiAgICAgICAgLy8gYmFzZTY0dXJsIGVuY29kaW5nIGlzIGEgbW9kaWZpY2F0aW9uIG9mIGJhc2U2NCB0aGF0IGNhbiBzYWZlbHkgYmUgdXNlZCBpbiBVUkxzIGFuZCBmaWxlbmFtZXNcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwiYmFzZTY0dXJsXCIsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBqd3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImp3dFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucykgfSk7XG4gICAgfVxuICAgIGlwKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJpcFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucykgfSk7XG4gICAgfVxuICAgIGNpZHIob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImNpZHJcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG9wdGlvbnMpIH0pO1xuICAgIH1cbiAgICBkYXRldGltZShvcHRpb25zKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgICAgICBraW5kOiBcImRhdGV0aW1lXCIsXG4gICAgICAgICAgICAgICAgcHJlY2lzaW9uOiBudWxsLFxuICAgICAgICAgICAgICAgIG9mZnNldDogZmFsc2UsXG4gICAgICAgICAgICAgICAgbG9jYWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG9wdGlvbnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJkYXRldGltZVwiLFxuICAgICAgICAgICAgcHJlY2lzaW9uOiB0eXBlb2Ygb3B0aW9ucz8ucHJlY2lzaW9uID09PSBcInVuZGVmaW5lZFwiID8gbnVsbCA6IG9wdGlvbnM/LnByZWNpc2lvbixcbiAgICAgICAgICAgIG9mZnNldDogb3B0aW9ucz8ub2Zmc2V0ID8/IGZhbHNlLFxuICAgICAgICAgICAgbG9jYWw6IG9wdGlvbnM/LmxvY2FsID8/IGZhbHNlLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG9wdGlvbnM/Lm1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZGF0ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiZGF0ZVwiLCBtZXNzYWdlIH0pO1xuICAgIH1cbiAgICB0aW1lKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAgICAgIGtpbmQ6IFwidGltZVwiLFxuICAgICAgICAgICAgICAgIHByZWNpc2lvbjogbnVsbCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBvcHRpb25zLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwidGltZVwiLFxuICAgICAgICAgICAgcHJlY2lzaW9uOiB0eXBlb2Ygb3B0aW9ucz8ucHJlY2lzaW9uID09PSBcInVuZGVmaW5lZFwiID8gbnVsbCA6IG9wdGlvbnM/LnByZWNpc2lvbixcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihvcHRpb25zPy5tZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGR1cmF0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJkdXJhdGlvblwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIHJlZ2V4KHJlZ2V4LCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcInJlZ2V4XCIsXG4gICAgICAgICAgICByZWdleDogcmVnZXgsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbmNsdWRlcyh2YWx1ZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJpbmNsdWRlc1wiLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgcG9zaXRpb246IG9wdGlvbnM/LnBvc2l0aW9uLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG9wdGlvbnM/Lm1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc3RhcnRzV2l0aCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJzdGFydHNXaXRoXCIsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbmRzV2l0aCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJlbmRzV2l0aFwiLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbWluKG1pbkxlbmd0aCwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtaW5cIixcbiAgICAgICAgICAgIHZhbHVlOiBtaW5MZW5ndGgsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtYXgobWF4TGVuZ3RoLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IG1heExlbmd0aCxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGxlbmd0aChsZW4sIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibGVuZ3RoXCIsXG4gICAgICAgICAgICB2YWx1ZTogbGVuLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRXF1aXZhbGVudCB0byBgLm1pbigxKWBcbiAgICAgKi9cbiAgICBub25lbXB0eShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbigxLCBlcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkpO1xuICAgIH1cbiAgICB0cmltKCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFN0cmluZyh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCB7IGtpbmQ6IFwidHJpbVwiIH1dLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgdG9Mb3dlckNhc2UoKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kU3RyaW5nKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogWy4uLnRoaXMuX2RlZi5jaGVja3MsIHsga2luZDogXCJ0b0xvd2VyQ2FzZVwiIH1dLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgdG9VcHBlckNhc2UoKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kU3RyaW5nKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogWy4uLnRoaXMuX2RlZi5jaGVja3MsIHsga2luZDogXCJ0b1VwcGVyQ2FzZVwiIH1dLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0IGlzRGF0ZXRpbWUoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiZGF0ZXRpbWVcIik7XG4gICAgfVxuICAgIGdldCBpc0RhdGUoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiZGF0ZVwiKTtcbiAgICB9XG4gICAgZ2V0IGlzVGltZSgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJ0aW1lXCIpO1xuICAgIH1cbiAgICBnZXQgaXNEdXJhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJkdXJhdGlvblwiKTtcbiAgICB9XG4gICAgZ2V0IGlzRW1haWwoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiZW1haWxcIik7XG4gICAgfVxuICAgIGdldCBpc1VSTCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJ1cmxcIik7XG4gICAgfVxuICAgIGdldCBpc0Vtb2ppKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImVtb2ppXCIpO1xuICAgIH1cbiAgICBnZXQgaXNVVUlEKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcInV1aWRcIik7XG4gICAgfVxuICAgIGdldCBpc05BTk9JRCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJuYW5vaWRcIik7XG4gICAgfVxuICAgIGdldCBpc0NVSUQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiY3VpZFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzQ1VJRDIoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiY3VpZDJcIik7XG4gICAgfVxuICAgIGdldCBpc1VMSUQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwidWxpZFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzSVAoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiaXBcIik7XG4gICAgfVxuICAgIGdldCBpc0NJRFIoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiY2lkclwiKTtcbiAgICB9XG4gICAgZ2V0IGlzQmFzZTY0KCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImJhc2U2NFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzQmFzZTY0dXJsKCkge1xuICAgICAgICAvLyBiYXNlNjR1cmwgZW5jb2RpbmcgaXMgYSBtb2RpZmljYXRpb24gb2YgYmFzZTY0IHRoYXQgY2FuIHNhZmVseSBiZSB1c2VkIGluIFVSTHMgYW5kIGZpbGVuYW1lc1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImJhc2U2NHVybFwiKTtcbiAgICB9XG4gICAgZ2V0IG1pbkxlbmd0aCgpIHtcbiAgICAgICAgbGV0IG1pbiA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWluID09PSBudWxsIHx8IGNoLnZhbHVlID4gbWluKVxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWluO1xuICAgIH1cbiAgICBnZXQgbWF4TGVuZ3RoKCkge1xuICAgICAgICBsZXQgbWF4ID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGlmIChtYXggPT09IG51bGwgfHwgY2gudmFsdWUgPCBtYXgpXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXg7XG4gICAgfVxufVxuWm9kU3RyaW5nLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFN0cmluZyh7XG4gICAgICAgIGNoZWNrczogW10sXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kU3RyaW5nLFxuICAgICAgICBjb2VyY2U6IHBhcmFtcz8uY29lcmNlID8/IGZhbHNlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzk2NjQ4NC93aHktZG9lcy1tb2R1bHVzLW9wZXJhdG9yLXJldHVybi1mcmFjdGlvbmFsLW51bWJlci1pbi1qYXZhc2NyaXB0LzMxNzExMDM0IzMxNzExMDM0XG5mdW5jdGlvbiBmbG9hdFNhZmVSZW1haW5kZXIodmFsLCBzdGVwKSB7XG4gICAgY29uc3QgdmFsRGVjQ291bnQgPSAodmFsLnRvU3RyaW5nKCkuc3BsaXQoXCIuXCIpWzFdIHx8IFwiXCIpLmxlbmd0aDtcbiAgICBjb25zdCBzdGVwRGVjQ291bnQgPSAoc3RlcC50b1N0cmluZygpLnNwbGl0KFwiLlwiKVsxXSB8fCBcIlwiKS5sZW5ndGg7XG4gICAgY29uc3QgZGVjQ291bnQgPSB2YWxEZWNDb3VudCA+IHN0ZXBEZWNDb3VudCA/IHZhbERlY0NvdW50IDogc3RlcERlY0NvdW50O1xuICAgIGNvbnN0IHZhbEludCA9IE51bWJlci5wYXJzZUludCh2YWwudG9GaXhlZChkZWNDb3VudCkucmVwbGFjZShcIi5cIiwgXCJcIikpO1xuICAgIGNvbnN0IHN0ZXBJbnQgPSBOdW1iZXIucGFyc2VJbnQoc3RlcC50b0ZpeGVkKGRlY0NvdW50KS5yZXBsYWNlKFwiLlwiLCBcIlwiKSk7XG4gICAgcmV0dXJuICh2YWxJbnQgJSBzdGVwSW50KSAvIDEwICoqIGRlY0NvdW50O1xufVxuZXhwb3J0IGNsYXNzIFpvZE51bWJlciBleHRlbmRzIFpvZFR5cGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLm1pbiA9IHRoaXMuZ3RlO1xuICAgICAgICB0aGlzLm1heCA9IHRoaXMubHRlO1xuICAgICAgICB0aGlzLnN0ZXAgPSB0aGlzLm11bHRpcGxlT2Y7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5fZGVmLmNvZXJjZSkge1xuICAgICAgICAgICAgaW5wdXQuZGF0YSA9IE51bWJlcihpbnB1dC5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLm51bWJlcikge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5udW1iZXIsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY3R4ID0gdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBzdGF0dXMgPSBuZXcgUGFyc2VTdGF0dXMoKTtcbiAgICAgICAgZm9yIChjb25zdCBjaGVjayBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2sua2luZCA9PT0gXCJpbnRcIikge1xuICAgICAgICAgICAgICAgIGlmICghdXRpbC5pc0ludGVnZXIoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcImludGVnZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBcImZsb2F0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb1NtYWxsID0gY2hlY2suaW5jbHVzaXZlID8gaW5wdXQuZGF0YSA8IGNoZWNrLnZhbHVlIDogaW5wdXQuZGF0YSA8PSBjaGVjay52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodG9vU21hbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogY2hlY2suaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b29CaWcgPSBjaGVjay5pbmNsdXNpdmUgPyBpbnB1dC5kYXRhID4gY2hlY2sudmFsdWUgOiBpbnB1dC5kYXRhID49IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29CaWcpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwibnVtYmVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IGNoZWNrLmluY2x1c2l2ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm11bHRpcGxlT2ZcIikge1xuICAgICAgICAgICAgICAgIGlmIChmbG9hdFNhZmVSZW1haW5kZXIoaW5wdXQuZGF0YSwgY2hlY2sudmFsdWUpICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5ub3RfbXVsdGlwbGVfb2YsXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZU9mOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImZpbml0ZVwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLm5vdF9maW5pdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdXRpbC5hc3NlcnROZXZlcihjaGVjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBpbnB1dC5kYXRhIH07XG4gICAgfVxuICAgIGd0ZSh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1pblwiLCB2YWx1ZSwgdHJ1ZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgZ3QodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtaW5cIiwgdmFsdWUsIGZhbHNlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBsdGUodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtYXhcIiwgdmFsdWUsIHRydWUsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIGx0KHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWF4XCIsIHZhbHVlLCBmYWxzZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgc2V0TGltaXQoa2luZCwgdmFsdWUsIGluY2x1c2l2ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZE51bWJlcih7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFtcbiAgICAgICAgICAgICAgICAuLi50aGlzLl9kZWYuY2hlY2tzLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2luZCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgX2FkZENoZWNrKGNoZWNrKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kTnVtYmVyKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogWy4uLnRoaXMuX2RlZi5jaGVja3MsIGNoZWNrXSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGludChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImludFwiLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcG9zaXRpdmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtaW5cIixcbiAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5lZ2F0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBub25wb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBub25uZWdhdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtdWx0aXBsZU9mKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm11bHRpcGxlT2ZcIixcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGZpbml0ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImZpbml0ZVwiLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc2FmZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IE51bWJlci5NSU5fU0FGRV9JTlRFR0VSLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KS5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtYXhcIixcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUixcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldCBtaW5WYWx1ZSgpIHtcbiAgICAgICAgbGV0IG1pbiA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWluID09PSBudWxsIHx8IGNoLnZhbHVlID4gbWluKVxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWluO1xuICAgIH1cbiAgICBnZXQgbWF4VmFsdWUoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9XG4gICAgZ2V0IGlzSW50KCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImludFwiIHx8IChjaC5raW5kID09PSBcIm11bHRpcGxlT2ZcIiAmJiB1dGlsLmlzSW50ZWdlcihjaC52YWx1ZSkpKTtcbiAgICB9XG4gICAgZ2V0IGlzRmluaXRlKCkge1xuICAgICAgICBsZXQgbWF4ID0gbnVsbDtcbiAgICAgICAgbGV0IG1pbiA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwiZmluaXRlXCIgfHwgY2gua2luZCA9PT0gXCJpbnRcIiB8fCBjaC5raW5kID09PSBcIm11bHRpcGxlT2ZcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2gua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChtaW4gPT09IG51bGwgfHwgY2gudmFsdWUgPiBtaW4pXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2gua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGlmIChtYXggPT09IG51bGwgfHwgY2gudmFsdWUgPCBtYXgpXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBOdW1iZXIuaXNGaW5pdGUobWluKSAmJiBOdW1iZXIuaXNGaW5pdGUobWF4KTtcbiAgICB9XG59XG5ab2ROdW1iZXIuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTnVtYmVyKHtcbiAgICAgICAgY2hlY2tzOiBbXSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2ROdW1iZXIsXG4gICAgICAgIGNvZXJjZTogcGFyYW1zPy5jb2VyY2UgfHwgZmFsc2UsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kQmlnSW50IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMubWluID0gdGhpcy5ndGU7XG4gICAgICAgIHRoaXMubWF4ID0gdGhpcy5sdGU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5fZGVmLmNvZXJjZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpbnB1dC5kYXRhID0gQmlnSW50KGlucHV0LmRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRJbnZhbGlkSW5wdXQoaW5wdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuYmlnaW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0SW52YWxpZElucHV0KGlucHV0KTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY3R4ID0gdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBzdGF0dXMgPSBuZXcgUGFyc2VTdGF0dXMoKTtcbiAgICAgICAgZm9yIChjb25zdCBjaGVjayBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2sua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb1NtYWxsID0gY2hlY2suaW5jbHVzaXZlID8gaW5wdXQuZGF0YSA8IGNoZWNrLnZhbHVlIDogaW5wdXQuZGF0YSA8PSBjaGVjay52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodG9vU21hbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYmlnaW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogY2hlY2suaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b29CaWcgPSBjaGVjay5pbmNsdXNpdmUgPyBpbnB1dC5kYXRhID4gY2hlY2sudmFsdWUgOiBpbnB1dC5kYXRhID49IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29CaWcpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImJpZ2ludFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IGNoZWNrLmluY2x1c2l2ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm11bHRpcGxlT2ZcIikge1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5kYXRhICUgY2hlY2sudmFsdWUgIT09IEJpZ0ludCgwKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUubm90X211bHRpcGxlX29mLFxuICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGVPZjogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdXRpbC5hc3NlcnROZXZlcihjaGVjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBpbnB1dC5kYXRhIH07XG4gICAgfVxuICAgIF9nZXRJbnZhbGlkSW5wdXQoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5iaWdpbnQsXG4gICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICB9XG4gICAgZ3RlKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWluXCIsIHZhbHVlLCB0cnVlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBndCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1pblwiLCB2YWx1ZSwgZmFsc2UsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIGx0ZSh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1heFwiLCB2YWx1ZSwgdHJ1ZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgbHQodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtYXhcIiwgdmFsdWUsIGZhbHNlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBzZXRMaW1pdChraW5kLCB2YWx1ZSwgaW5jbHVzaXZlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQmlnSW50KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogW1xuICAgICAgICAgICAgICAgIC4uLnRoaXMuX2RlZi5jaGVja3MsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBraW5kLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfYWRkQ2hlY2soY2hlY2spIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RCaWdJbnQoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgY2hlY2tdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcG9zaXRpdmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtaW5cIixcbiAgICAgICAgICAgIHZhbHVlOiBCaWdJbnQoMCksXG4gICAgICAgICAgICBpbmNsdXNpdmU6IGZhbHNlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbmVnYXRpdmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtYXhcIixcbiAgICAgICAgICAgIHZhbHVlOiBCaWdJbnQoMCksXG4gICAgICAgICAgICBpbmNsdXNpdmU6IGZhbHNlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbm9ucG9zaXRpdmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtYXhcIixcbiAgICAgICAgICAgIHZhbHVlOiBCaWdJbnQoMCksXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBub25uZWdhdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG11bHRpcGxlT2YodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibXVsdGlwbGVPZlwiLFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQgbWluVmFsdWUoKSB7XG4gICAgICAgIGxldCBtaW4gPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pbiA9PT0gbnVsbCB8fCBjaC52YWx1ZSA+IG1pbilcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pbjtcbiAgICB9XG4gICAgZ2V0IG1heFZhbHVlKCkge1xuICAgICAgICBsZXQgbWF4ID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGlmIChtYXggPT09IG51bGwgfHwgY2gudmFsdWUgPCBtYXgpXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXg7XG4gICAgfVxufVxuWm9kQmlnSW50LmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEJpZ0ludCh7XG4gICAgICAgIGNoZWNrczogW10sXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQmlnSW50LFxuICAgICAgICBjb2VyY2U6IHBhcmFtcz8uY29lcmNlID8/IGZhbHNlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZEJvb2xlYW4gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RlZi5jb2VyY2UpIHtcbiAgICAgICAgICAgIGlucHV0LmRhdGEgPSBCb29sZWFuKGlucHV0LmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuYm9vbGVhbikge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5ib29sZWFuLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZEJvb2xlYW4uY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kQm9vbGVhbih7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQm9vbGVhbixcbiAgICAgICAgY29lcmNlOiBwYXJhbXM/LmNvZXJjZSB8fCBmYWxzZSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2REYXRlIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY29lcmNlKSB7XG4gICAgICAgICAgICBpbnB1dC5kYXRhID0gbmV3IERhdGUoaW5wdXQuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5kYXRlKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmRhdGUsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoTnVtYmVyLmlzTmFOKGlucHV0LmRhdGEuZ2V0VGltZSgpKSkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfZGF0ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc3RhdHVzID0gbmV3IFBhcnNlU3RhdHVzKCk7XG4gICAgICAgIGxldCBjdHggPSB1bmRlZmluZWQ7XG4gICAgICAgIGZvciAoY29uc3QgY2hlY2sgb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoZWNrLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuZGF0YS5nZXRUaW1lKCkgPCBjaGVjay52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJkYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEuZ2V0VGltZSgpID4gY2hlY2sudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoY2hlY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGF0dXM6IHN0YXR1cy52YWx1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBuZXcgRGF0ZShpbnB1dC5kYXRhLmdldFRpbWUoKSksXG4gICAgICAgIH07XG4gICAgfVxuICAgIF9hZGRDaGVjayhjaGVjaykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZERhdGUoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgY2hlY2tdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbWluKG1pbkRhdGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICB2YWx1ZTogbWluRGF0ZS5nZXRUaW1lKCksXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtYXgobWF4RGF0ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtYXhcIixcbiAgICAgICAgICAgIHZhbHVlOiBtYXhEYXRlLmdldFRpbWUoKSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldCBtaW5EYXRlKCkge1xuICAgICAgICBsZXQgbWluID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChtaW4gPT09IG51bGwgfHwgY2gudmFsdWUgPiBtaW4pXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtaW4gIT0gbnVsbCA/IG5ldyBEYXRlKG1pbikgOiBudWxsO1xuICAgIH1cbiAgICBnZXQgbWF4RGF0ZSgpIHtcbiAgICAgICAgbGV0IG1heCA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWF4ID09PSBudWxsIHx8IGNoLnZhbHVlIDwgbWF4KVxuICAgICAgICAgICAgICAgICAgICBtYXggPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF4ICE9IG51bGwgPyBuZXcgRGF0ZShtYXgpIDogbnVsbDtcbiAgICB9XG59XG5ab2REYXRlLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZERhdGUoe1xuICAgICAgICBjaGVja3M6IFtdLFxuICAgICAgICBjb2VyY2U6IHBhcmFtcz8uY29lcmNlIHx8IGZhbHNlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZERhdGUsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kU3ltYm9sIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuc3ltYm9sKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLnN5bWJvbCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG59XG5ab2RTeW1ib2wuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kU3ltYm9sKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RTeW1ib2wsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kVW5kZWZpbmVkIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLnVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG59XG5ab2RVbmRlZmluZWQuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kVW5kZWZpbmVkKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RVbmRlZmluZWQsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kTnVsbCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLm51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUubnVsbCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG59XG5ab2ROdWxsLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE51bGwoe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE51bGwsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kQW55IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIC8vIHRvIHByZXZlbnQgaW5zdGFuY2VzIG9mIG90aGVyIGNsYXNzZXMgZnJvbSBleHRlbmRpbmcgWm9kQW55LiB0aGlzIGNhdXNlcyBpc3N1ZXMgd2l0aCBjYXRjaGFsbCBpbiBab2RPYmplY3QuXG4gICAgICAgIHRoaXMuX2FueSA9IHRydWU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuWm9kQW55LmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEFueSh7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQW55LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZFVua25vd24gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgLy8gcmVxdWlyZWRcbiAgICAgICAgdGhpcy5fdW5rbm93biA9IHRydWU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuWm9kVW5rbm93bi5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RVbmtub3duKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RVbmtub3duLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZE5ldmVyIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUubmV2ZXIsXG4gICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICB9XG59XG5ab2ROZXZlci5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2ROZXZlcih7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTmV2ZXIsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kVm9pZCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLnVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS52b2lkLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZFZvaWQuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kVm9pZCh7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kVm9pZCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RBcnJheSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCwgc3RhdHVzIH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCBkZWYgPSB0aGlzLl9kZWY7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5hcnJheSkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5hcnJheSxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZWYuZXhhY3RMZW5ndGggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHRvb0JpZyA9IGN0eC5kYXRhLmxlbmd0aCA+IGRlZi5leGFjdExlbmd0aC52YWx1ZTtcbiAgICAgICAgICAgIGNvbnN0IHRvb1NtYWxsID0gY3R4LmRhdGEubGVuZ3RoIDwgZGVmLmV4YWN0TGVuZ3RoLnZhbHVlO1xuICAgICAgICAgICAgaWYgKHRvb0JpZyB8fCB0b29TbWFsbCkge1xuICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiB0b29CaWcgPyBab2RJc3N1ZUNvZGUudG9vX2JpZyA6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgIG1pbmltdW06ICh0b29TbWFsbCA/IGRlZi5leGFjdExlbmd0aC52YWx1ZSA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgICAgIG1heGltdW06ICh0b29CaWcgPyBkZWYuZXhhY3RMZW5ndGgudmFsdWUgOiB1bmRlZmluZWQpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5leGFjdExlbmd0aC5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChkZWYubWluTGVuZ3RoICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoY3R4LmRhdGEubGVuZ3RoIDwgZGVmLm1pbkxlbmd0aC52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBkZWYubWluTGVuZ3RoLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBkZWYubWluTGVuZ3RoLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZi5tYXhMZW5ndGggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjdHguZGF0YS5sZW5ndGggPiBkZWYubWF4TGVuZ3RoLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBkZWYubWF4TGVuZ3RoLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBkZWYubWF4TGVuZ3RoLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbLi4uY3R4LmRhdGFdLm1hcCgoaXRlbSwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWYudHlwZS5fcGFyc2VBc3luYyhuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgaXRlbSwgY3R4LnBhdGgsIGkpKTtcbiAgICAgICAgICAgIH0pKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VBcnJheShzdGF0dXMsIHJlc3VsdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN1bHQgPSBbLi4uY3R4LmRhdGFdLm1hcCgoaXRlbSwgaSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGRlZi50eXBlLl9wYXJzZVN5bmMobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIGl0ZW0sIGN0eC5wYXRoLCBpKSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VBcnJheShzdGF0dXMsIHJlc3VsdCk7XG4gICAgfVxuICAgIGdldCBlbGVtZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnR5cGU7XG4gICAgfVxuICAgIG1pbihtaW5MZW5ndGgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RBcnJheSh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBtaW5MZW5ndGg6IHsgdmFsdWU6IG1pbkxlbmd0aCwgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtYXgobWF4TGVuZ3RoLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQXJyYXkoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgbWF4TGVuZ3RoOiB7IHZhbHVlOiBtYXhMZW5ndGgsIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbGVuZ3RoKGxlbiwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEFycmF5KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGV4YWN0TGVuZ3RoOiB7IHZhbHVlOiBsZW4sIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbm9uZW1wdHkobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5taW4oMSwgbWVzc2FnZSk7XG4gICAgfVxufVxuWm9kQXJyYXkuY3JlYXRlID0gKHNjaGVtYSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RBcnJheSh7XG4gICAgICAgIHR5cGU6IHNjaGVtYSxcbiAgICAgICAgbWluTGVuZ3RoOiBudWxsLFxuICAgICAgICBtYXhMZW5ndGg6IG51bGwsXG4gICAgICAgIGV4YWN0TGVuZ3RoOiBudWxsLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEFycmF5LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZnVuY3Rpb24gZGVlcFBhcnRpYWxpZnkoc2NoZW1hKSB7XG4gICAgaWYgKHNjaGVtYSBpbnN0YW5jZW9mIFpvZE9iamVjdCkge1xuICAgICAgICBjb25zdCBuZXdTaGFwZSA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzY2hlbWEuc2hhcGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkU2NoZW1hID0gc2NoZW1hLnNoYXBlW2tleV07XG4gICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gWm9kT3B0aW9uYWwuY3JlYXRlKGRlZXBQYXJ0aWFsaWZ5KGZpZWxkU2NoZW1hKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4uc2NoZW1hLl9kZWYsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gbmV3U2hhcGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2RBcnJheSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEFycmF5KHtcbiAgICAgICAgICAgIC4uLnNjaGVtYS5fZGVmLFxuICAgICAgICAgICAgdHlwZTogZGVlcFBhcnRpYWxpZnkoc2NoZW1hLmVsZW1lbnQpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoc2NoZW1hIGluc3RhbmNlb2YgWm9kT3B0aW9uYWwpIHtcbiAgICAgICAgcmV0dXJuIFpvZE9wdGlvbmFsLmNyZWF0ZShkZWVwUGFydGlhbGlmeShzY2hlbWEudW53cmFwKCkpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoc2NoZW1hIGluc3RhbmNlb2YgWm9kTnVsbGFibGUpIHtcbiAgICAgICAgcmV0dXJuIFpvZE51bGxhYmxlLmNyZWF0ZShkZWVwUGFydGlhbGlmeShzY2hlbWEudW53cmFwKCkpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoc2NoZW1hIGluc3RhbmNlb2YgWm9kVHVwbGUpIHtcbiAgICAgICAgcmV0dXJuIFpvZFR1cGxlLmNyZWF0ZShzY2hlbWEuaXRlbXMubWFwKChpdGVtKSA9PiBkZWVwUGFydGlhbGlmeShpdGVtKSkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNjaGVtYTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgWm9kT2JqZWN0IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMuX2NhY2hlZCA9IG51bGw7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAZGVwcmVjYXRlZCBJbiBtb3N0IGNhc2VzLCB0aGlzIGlzIG5vIGxvbmdlciBuZWVkZWQgLSB1bmtub3duIHByb3BlcnRpZXMgYXJlIG5vdyBzaWxlbnRseSBzdHJpcHBlZC5cbiAgICAgICAgICogSWYgeW91IHdhbnQgdG8gcGFzcyB0aHJvdWdoIHVua25vd24gcHJvcGVydGllcywgdXNlIGAucGFzc3Rocm91Z2goKWAgaW5zdGVhZC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubm9uc3RyaWN0ID0gdGhpcy5wYXNzdGhyb3VnaDtcbiAgICAgICAgLy8gZXh0ZW5kPFxuICAgICAgICAvLyAgIEF1Z21lbnRhdGlvbiBleHRlbmRzIFpvZFJhd1NoYXBlLFxuICAgICAgICAvLyAgIE5ld091dHB1dCBleHRlbmRzIHV0aWwuZmxhdHRlbjx7XG4gICAgICAgIC8vICAgICBbayBpbiBrZXlvZiBBdWdtZW50YXRpb24gfCBrZXlvZiBPdXRwdXRdOiBrIGV4dGVuZHMga2V5b2YgQXVnbWVudGF0aW9uXG4gICAgICAgIC8vICAgICAgID8gQXVnbWVudGF0aW9uW2tdW1wiX291dHB1dFwiXVxuICAgICAgICAvLyAgICAgICA6IGsgZXh0ZW5kcyBrZXlvZiBPdXRwdXRcbiAgICAgICAgLy8gICAgICAgPyBPdXRwdXRba11cbiAgICAgICAgLy8gICAgICAgOiBuZXZlcjtcbiAgICAgICAgLy8gICB9PixcbiAgICAgICAgLy8gICBOZXdJbnB1dCBleHRlbmRzIHV0aWwuZmxhdHRlbjx7XG4gICAgICAgIC8vICAgICBbayBpbiBrZXlvZiBBdWdtZW50YXRpb24gfCBrZXlvZiBJbnB1dF06IGsgZXh0ZW5kcyBrZXlvZiBBdWdtZW50YXRpb25cbiAgICAgICAgLy8gICAgICAgPyBBdWdtZW50YXRpb25ba11bXCJfaW5wdXRcIl1cbiAgICAgICAgLy8gICAgICAgOiBrIGV4dGVuZHMga2V5b2YgSW5wdXRcbiAgICAgICAgLy8gICAgICAgPyBJbnB1dFtrXVxuICAgICAgICAvLyAgICAgICA6IG5ldmVyO1xuICAgICAgICAvLyAgIH0+XG4gICAgICAgIC8vID4oXG4gICAgICAgIC8vICAgYXVnbWVudGF0aW9uOiBBdWdtZW50YXRpb25cbiAgICAgICAgLy8gKTogWm9kT2JqZWN0PFxuICAgICAgICAvLyAgIGV4dGVuZFNoYXBlPFQsIEF1Z21lbnRhdGlvbj4sXG4gICAgICAgIC8vICAgVW5rbm93bktleXMsXG4gICAgICAgIC8vICAgQ2F0Y2hhbGwsXG4gICAgICAgIC8vICAgTmV3T3V0cHV0LFxuICAgICAgICAvLyAgIE5ld0lucHV0XG4gICAgICAgIC8vID4ge1xuICAgICAgICAvLyAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgLy8gICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgLy8gICAgIHNoYXBlOiAoKSA9PiAoe1xuICAgICAgICAvLyAgICAgICAuLi50aGlzLl9kZWYuc2hhcGUoKSxcbiAgICAgICAgLy8gICAgICAgLi4uYXVnbWVudGF0aW9uLFxuICAgICAgICAvLyAgICAgfSksXG4gICAgICAgIC8vICAgfSkgYXMgYW55O1xuICAgICAgICAvLyB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAZGVwcmVjYXRlZCBVc2UgYC5leHRlbmRgIGluc3RlYWRcbiAgICAgICAgICogICovXG4gICAgICAgIHRoaXMuYXVnbWVudCA9IHRoaXMuZXh0ZW5kO1xuICAgIH1cbiAgICBfZ2V0Q2FjaGVkKCkge1xuICAgICAgICBpZiAodGhpcy5fY2FjaGVkICE9PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZDtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB0aGlzLl9kZWYuc2hhcGUoKTtcbiAgICAgICAgY29uc3Qga2V5cyA9IHV0aWwub2JqZWN0S2V5cyhzaGFwZSk7XG4gICAgICAgIHRoaXMuX2NhY2hlZCA9IHsgc2hhcGUsIGtleXMgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZDtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUub2JqZWN0KSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm9iamVjdCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IHsgc2hhcGUsIGtleXM6IHNoYXBlS2V5cyB9ID0gdGhpcy5fZ2V0Q2FjaGVkKCk7XG4gICAgICAgIGNvbnN0IGV4dHJhS2V5cyA9IFtdO1xuICAgICAgICBpZiAoISh0aGlzLl9kZWYuY2F0Y2hhbGwgaW5zdGFuY2VvZiBab2ROZXZlciAmJiB0aGlzLl9kZWYudW5rbm93bktleXMgPT09IFwic3RyaXBcIikpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGN0eC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzaGFwZUtleXMuaW5jbHVkZXMoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBleHRyYUtleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYWlycyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBzaGFwZUtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleVZhbGlkYXRvciA9IHNoYXBlW2tleV07XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGN0eC5kYXRhW2tleV07XG4gICAgICAgICAgICBwYWlycy5wdXNoKHtcbiAgICAgICAgICAgICAgICBrZXk6IHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlOiBrZXkgfSxcbiAgICAgICAgICAgICAgICB2YWx1ZToga2V5VmFsaWRhdG9yLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgdmFsdWUsIGN0eC5wYXRoLCBrZXkpKSxcbiAgICAgICAgICAgICAgICBhbHdheXNTZXQ6IGtleSBpbiBjdHguZGF0YSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY2F0Y2hhbGwgaW5zdGFuY2VvZiBab2ROZXZlcikge1xuICAgICAgICAgICAgY29uc3QgdW5rbm93bktleXMgPSB0aGlzLl9kZWYudW5rbm93bktleXM7XG4gICAgICAgICAgICBpZiAodW5rbm93bktleXMgPT09IFwicGFzc3Rocm91Z2hcIikge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGV4dHJhS2V5cykge1xuICAgICAgICAgICAgICAgICAgICBwYWlycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogeyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGtleSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlOiBjdHguZGF0YVtrZXldIH0sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHVua25vd25LZXlzID09PSBcInN0cmljdFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV4dHJhS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnVucmVjb2duaXplZF9rZXlzLFxuICAgICAgICAgICAgICAgICAgICAgICAga2V5czogZXh0cmFLZXlzLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodW5rbm93bktleXMgPT09IFwic3RyaXBcIikge1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnRlcm5hbCBab2RPYmplY3QgZXJyb3I6IGludmFsaWQgdW5rbm93bktleXMgdmFsdWUuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBydW4gY2F0Y2hhbGwgdmFsaWRhdGlvblxuICAgICAgICAgICAgY29uc3QgY2F0Y2hhbGwgPSB0aGlzLl9kZWYuY2F0Y2hhbGw7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBleHRyYUtleXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGN0eC5kYXRhW2tleV07XG4gICAgICAgICAgICAgICAgcGFpcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogeyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGtleSB9LFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY2F0Y2hhbGwuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCB2YWx1ZSwgY3R4LnBhdGgsIGtleSkgLy8sIGN0eC5jaGlsZChrZXkpLCB2YWx1ZSwgZ2V0UGFyc2VkVHlwZSh2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgYWx3YXlzU2V0OiBrZXkgaW4gY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICAgICAgICAgIC50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzeW5jUGFpcnMgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgcGFpci5rZXk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgcGFpci52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgc3luY1BhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbHdheXNTZXQ6IHBhaXIuYWx3YXlzU2V0LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN5bmNQYWlycztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oKHN5bmNQYWlycykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZU9iamVjdFN5bmMoc3RhdHVzLCBzeW5jUGFpcnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VPYmplY3RTeW5jKHN0YXR1cywgcGFpcnMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBzaGFwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zaGFwZSgpO1xuICAgIH1cbiAgICBzdHJpY3QobWVzc2FnZSkge1xuICAgICAgICBlcnJvclV0aWwuZXJyVG9PYmo7XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHVua25vd25LZXlzOiBcInN0cmljdFwiLFxuICAgICAgICAgICAgLi4uKG1lc3NhZ2UgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1hcDogKGlzc3VlLCBjdHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRFcnJvciA9IHRoaXMuX2RlZi5lcnJvck1hcD8uKGlzc3VlLCBjdHgpLm1lc3NhZ2UgPz8gY3R4LmRlZmF1bHRFcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc3N1ZS5jb2RlID09PSBcInVucmVjb2duaXplZF9rZXlzXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpLm1lc3NhZ2UgPz8gZGVmYXVsdEVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZmF1bHRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDoge30pLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc3RyaXAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHVua25vd25LZXlzOiBcInN0cmlwXCIsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwYXNzdGhyb3VnaCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgdW5rbm93bktleXM6IFwicGFzc3Rocm91Z2hcIixcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGNvbnN0IEF1Z21lbnRGYWN0b3J5ID1cbiAgICAvLyAgIDxEZWYgZXh0ZW5kcyBab2RPYmplY3REZWY+KGRlZjogRGVmKSA9PlxuICAgIC8vICAgPEF1Z21lbnRhdGlvbiBleHRlbmRzIFpvZFJhd1NoYXBlPihcbiAgICAvLyAgICAgYXVnbWVudGF0aW9uOiBBdWdtZW50YXRpb25cbiAgICAvLyAgICk6IFpvZE9iamVjdDxcbiAgICAvLyAgICAgZXh0ZW5kU2hhcGU8UmV0dXJuVHlwZTxEZWZbXCJzaGFwZVwiXT4sIEF1Z21lbnRhdGlvbj4sXG4gICAgLy8gICAgIERlZltcInVua25vd25LZXlzXCJdLFxuICAgIC8vICAgICBEZWZbXCJjYXRjaGFsbFwiXVxuICAgIC8vICAgPiA9PiB7XG4gICAgLy8gICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAvLyAgICAgICAuLi5kZWYsXG4gICAgLy8gICAgICAgc2hhcGU6ICgpID0+ICh7XG4gICAgLy8gICAgICAgICAuLi5kZWYuc2hhcGUoKSxcbiAgICAvLyAgICAgICAgIC4uLmF1Z21lbnRhdGlvbixcbiAgICAvLyAgICAgICB9KSxcbiAgICAvLyAgICAgfSkgYXMgYW55O1xuICAgIC8vICAgfTtcbiAgICBleHRlbmQoYXVnbWVudGF0aW9uKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiAoe1xuICAgICAgICAgICAgICAgIC4uLnRoaXMuX2RlZi5zaGFwZSgpLFxuICAgICAgICAgICAgICAgIC4uLmF1Z21lbnRhdGlvbixcbiAgICAgICAgICAgIH0pLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHJpb3IgdG8gem9kQDEuMC4xMiB0aGVyZSB3YXMgYSBidWcgaW4gdGhlXG4gICAgICogaW5mZXJyZWQgdHlwZSBvZiBtZXJnZWQgb2JqZWN0cy4gUGxlYXNlXG4gICAgICogdXBncmFkZSBpZiB5b3UgYXJlIGV4cGVyaWVuY2luZyBpc3N1ZXMuXG4gICAgICovXG4gICAgbWVyZ2UobWVyZ2luZykge1xuICAgICAgICBjb25zdCBtZXJnZWQgPSBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIHVua25vd25LZXlzOiBtZXJnaW5nLl9kZWYudW5rbm93bktleXMsXG4gICAgICAgICAgICBjYXRjaGFsbDogbWVyZ2luZy5fZGVmLmNhdGNoYWxsLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+ICh7XG4gICAgICAgICAgICAgICAgLi4udGhpcy5fZGVmLnNoYXBlKCksXG4gICAgICAgICAgICAgICAgLi4ubWVyZ2luZy5fZGVmLnNoYXBlKCksXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kT2JqZWN0LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG1lcmdlZDtcbiAgICB9XG4gICAgLy8gbWVyZ2U8XG4gICAgLy8gICBJbmNvbWluZyBleHRlbmRzIEFueVpvZE9iamVjdCxcbiAgICAvLyAgIEF1Z21lbnRhdGlvbiBleHRlbmRzIEluY29taW5nW1wic2hhcGVcIl0sXG4gICAgLy8gICBOZXdPdXRwdXQgZXh0ZW5kcyB7XG4gICAgLy8gICAgIFtrIGluIGtleW9mIEF1Z21lbnRhdGlvbiB8IGtleW9mIE91dHB1dF06IGsgZXh0ZW5kcyBrZXlvZiBBdWdtZW50YXRpb25cbiAgICAvLyAgICAgICA/IEF1Z21lbnRhdGlvbltrXVtcIl9vdXRwdXRcIl1cbiAgICAvLyAgICAgICA6IGsgZXh0ZW5kcyBrZXlvZiBPdXRwdXRcbiAgICAvLyAgICAgICA/IE91dHB1dFtrXVxuICAgIC8vICAgICAgIDogbmV2ZXI7XG4gICAgLy8gICB9LFxuICAgIC8vICAgTmV3SW5wdXQgZXh0ZW5kcyB7XG4gICAgLy8gICAgIFtrIGluIGtleW9mIEF1Z21lbnRhdGlvbiB8IGtleW9mIElucHV0XTogayBleHRlbmRzIGtleW9mIEF1Z21lbnRhdGlvblxuICAgIC8vICAgICAgID8gQXVnbWVudGF0aW9uW2tdW1wiX2lucHV0XCJdXG4gICAgLy8gICAgICAgOiBrIGV4dGVuZHMga2V5b2YgSW5wdXRcbiAgICAvLyAgICAgICA/IElucHV0W2tdXG4gICAgLy8gICAgICAgOiBuZXZlcjtcbiAgICAvLyAgIH1cbiAgICAvLyA+KFxuICAgIC8vICAgbWVyZ2luZzogSW5jb21pbmdcbiAgICAvLyApOiBab2RPYmplY3Q8XG4gICAgLy8gICBleHRlbmRTaGFwZTxULCBSZXR1cm5UeXBlPEluY29taW5nW1wiX2RlZlwiXVtcInNoYXBlXCJdPj4sXG4gICAgLy8gICBJbmNvbWluZ1tcIl9kZWZcIl1bXCJ1bmtub3duS2V5c1wiXSxcbiAgICAvLyAgIEluY29taW5nW1wiX2RlZlwiXVtcImNhdGNoYWxsXCJdLFxuICAgIC8vICAgTmV3T3V0cHV0LFxuICAgIC8vICAgTmV3SW5wdXRcbiAgICAvLyA+IHtcbiAgICAvLyAgIGNvbnN0IG1lcmdlZDogYW55ID0gbmV3IFpvZE9iamVjdCh7XG4gICAgLy8gICAgIHVua25vd25LZXlzOiBtZXJnaW5nLl9kZWYudW5rbm93bktleXMsXG4gICAgLy8gICAgIGNhdGNoYWxsOiBtZXJnaW5nLl9kZWYuY2F0Y2hhbGwsXG4gICAgLy8gICAgIHNoYXBlOiAoKSA9PlxuICAgIC8vICAgICAgIG9iamVjdFV0aWwubWVyZ2VTaGFwZXModGhpcy5fZGVmLnNoYXBlKCksIG1lcmdpbmcuX2RlZi5zaGFwZSgpKSxcbiAgICAvLyAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgLy8gICB9KSBhcyBhbnk7XG4gICAgLy8gICByZXR1cm4gbWVyZ2VkO1xuICAgIC8vIH1cbiAgICBzZXRLZXkoa2V5LCBzY2hlbWEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXVnbWVudCh7IFtrZXldOiBzY2hlbWEgfSk7XG4gICAgfVxuICAgIC8vIG1lcmdlPEluY29taW5nIGV4dGVuZHMgQW55Wm9kT2JqZWN0PihcbiAgICAvLyAgIG1lcmdpbmc6IEluY29taW5nXG4gICAgLy8gKTogLy9ab2RPYmplY3Q8VCAmIEluY29taW5nW1wiX3NoYXBlXCJdLCBVbmtub3duS2V5cywgQ2F0Y2hhbGw+ID0gKG1lcmdpbmcpID0+IHtcbiAgICAvLyBab2RPYmplY3Q8XG4gICAgLy8gICBleHRlbmRTaGFwZTxULCBSZXR1cm5UeXBlPEluY29taW5nW1wiX2RlZlwiXVtcInNoYXBlXCJdPj4sXG4gICAgLy8gICBJbmNvbWluZ1tcIl9kZWZcIl1bXCJ1bmtub3duS2V5c1wiXSxcbiAgICAvLyAgIEluY29taW5nW1wiX2RlZlwiXVtcImNhdGNoYWxsXCJdXG4gICAgLy8gPiB7XG4gICAgLy8gICAvLyBjb25zdCBtZXJnZWRTaGFwZSA9IG9iamVjdFV0aWwubWVyZ2VTaGFwZXMoXG4gICAgLy8gICAvLyAgIHRoaXMuX2RlZi5zaGFwZSgpLFxuICAgIC8vICAgLy8gICBtZXJnaW5nLl9kZWYuc2hhcGUoKVxuICAgIC8vICAgLy8gKTtcbiAgICAvLyAgIGNvbnN0IG1lcmdlZDogYW55ID0gbmV3IFpvZE9iamVjdCh7XG4gICAgLy8gICAgIHVua25vd25LZXlzOiBtZXJnaW5nLl9kZWYudW5rbm93bktleXMsXG4gICAgLy8gICAgIGNhdGNoYWxsOiBtZXJnaW5nLl9kZWYuY2F0Y2hhbGwsXG4gICAgLy8gICAgIHNoYXBlOiAoKSA9PlxuICAgIC8vICAgICAgIG9iamVjdFV0aWwubWVyZ2VTaGFwZXModGhpcy5fZGVmLnNoYXBlKCksIG1lcmdpbmcuX2RlZi5zaGFwZSgpKSxcbiAgICAvLyAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgLy8gICB9KSBhcyBhbnk7XG4gICAgLy8gICByZXR1cm4gbWVyZ2VkO1xuICAgIC8vIH1cbiAgICBjYXRjaGFsbChpbmRleCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjYXRjaGFsbDogaW5kZXgsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwaWNrKG1hc2spIHtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdXRpbC5vYmplY3RLZXlzKG1hc2spKSB7XG4gICAgICAgICAgICBpZiAobWFza1trZXldICYmIHRoaXMuc2hhcGVba2V5XSkge1xuICAgICAgICAgICAgICAgIHNoYXBlW2tleV0gPSB0aGlzLnNoYXBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+IHNoYXBlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgb21pdChtYXNrKSB7XG4gICAgICAgIGNvbnN0IHNoYXBlID0ge307XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHV0aWwub2JqZWN0S2V5cyh0aGlzLnNoYXBlKSkge1xuICAgICAgICAgICAgaWYgKCFtYXNrW2tleV0pIHtcbiAgICAgICAgICAgICAgICBzaGFwZVtrZXldID0gdGhpcy5zaGFwZVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiBzaGFwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgZGVlcFBhcnRpYWwoKSB7XG4gICAgICAgIHJldHVybiBkZWVwUGFydGlhbGlmeSh0aGlzKTtcbiAgICB9XG4gICAgcGFydGlhbChtYXNrKSB7XG4gICAgICAgIGNvbnN0IG5ld1NoYXBlID0ge307XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHV0aWwub2JqZWN0S2V5cyh0aGlzLnNoYXBlKSkge1xuICAgICAgICAgICAgY29uc3QgZmllbGRTY2hlbWEgPSB0aGlzLnNoYXBlW2tleV07XG4gICAgICAgICAgICBpZiAobWFzayAmJiAhbWFza1trZXldKSB7XG4gICAgICAgICAgICAgICAgbmV3U2hhcGVba2V5XSA9IGZpZWxkU2NoZW1hO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3U2hhcGVba2V5XSA9IGZpZWxkU2NoZW1hLm9wdGlvbmFsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+IG5ld1NoYXBlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVxdWlyZWQobWFzaykge1xuICAgICAgICBjb25zdCBuZXdTaGFwZSA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB1dGlsLm9iamVjdEtleXModGhpcy5zaGFwZSkpIHtcbiAgICAgICAgICAgIGlmIChtYXNrICYmICFtYXNrW2tleV0pIHtcbiAgICAgICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gdGhpcy5zaGFwZVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmllbGRTY2hlbWEgPSB0aGlzLnNoYXBlW2tleV07XG4gICAgICAgICAgICAgICAgbGV0IG5ld0ZpZWxkID0gZmllbGRTY2hlbWE7XG4gICAgICAgICAgICAgICAgd2hpbGUgKG5ld0ZpZWxkIGluc3RhbmNlb2YgWm9kT3B0aW9uYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3RmllbGQgPSBuZXdGaWVsZC5fZGVmLmlubmVyVHlwZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3U2hhcGVba2V5XSA9IG5ld0ZpZWxkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiBuZXdTaGFwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGtleW9mKCkge1xuICAgICAgICByZXR1cm4gY3JlYXRlWm9kRW51bSh1dGlsLm9iamVjdEtleXModGhpcy5zaGFwZSkpO1xuICAgIH1cbn1cblpvZE9iamVjdC5jcmVhdGUgPSAoc2hhcGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgc2hhcGU6ICgpID0+IHNoYXBlLFxuICAgICAgICB1bmtub3duS2V5czogXCJzdHJpcFwiLFxuICAgICAgICBjYXRjaGFsbDogWm9kTmV2ZXIuY3JlYXRlKCksXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kT2JqZWN0LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuWm9kT2JqZWN0LnN0cmljdENyZWF0ZSA9IChzaGFwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICBzaGFwZTogKCkgPT4gc2hhcGUsXG4gICAgICAgIHVua25vd25LZXlzOiBcInN0cmljdFwiLFxuICAgICAgICBjYXRjaGFsbDogWm9kTmV2ZXIuY3JlYXRlKCksXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kT2JqZWN0LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuWm9kT2JqZWN0LmxhenljcmVhdGUgPSAoc2hhcGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgc2hhcGUsXG4gICAgICAgIHVua25vd25LZXlzOiBcInN0cmlwXCIsXG4gICAgICAgIGNhdGNoYWxsOiBab2ROZXZlci5jcmVhdGUoKSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kVW5pb24gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLl9kZWYub3B0aW9ucztcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzdWx0cyhyZXN1bHRzKSB7XG4gICAgICAgICAgICAvLyByZXR1cm4gZmlyc3QgaXNzdWUtZnJlZSB2YWxpZGF0aW9uIGlmIGl0IGV4aXN0c1xuICAgICAgICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQucmVzdWx0LnN0YXR1cyA9PT0gXCJ2YWxpZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQucmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnJlc3VsdC5zdGF0dXMgPT09IFwiZGlydHlcIikge1xuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgaXNzdWVzIGZyb20gZGlydHkgb3B0aW9uXG4gICAgICAgICAgICAgICAgICAgIGN0eC5jb21tb24uaXNzdWVzLnB1c2goLi4ucmVzdWx0LmN0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmV0dXJuIGludmFsaWRcbiAgICAgICAgICAgIGNvbnN0IHVuaW9uRXJyb3JzID0gcmVzdWx0cy5tYXAoKHJlc3VsdCkgPT4gbmV3IFpvZEVycm9yKHJlc3VsdC5jdHguY29tbW9uLmlzc3VlcykpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdW5pb24sXG4gICAgICAgICAgICAgICAgdW5pb25FcnJvcnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwob3B0aW9ucy5tYXAoYXN5bmMgKG9wdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkQ3R4ID0ge1xuICAgICAgICAgICAgICAgICAgICAuLi5jdHgsXG4gICAgICAgICAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uY3R4LmNvbW1vbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogbnVsbCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdDogYXdhaXQgb3B0aW9uLl9wYXJzZUFzeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGNoaWxkQ3R4LFxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgY3R4OiBjaGlsZEN0eCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkpLnRoZW4oaGFuZGxlUmVzdWx0cyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgZGlydHkgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBjb25zdCBpc3N1ZXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEN0eCA9IHtcbiAgICAgICAgICAgICAgICAgICAgLi4uY3R4LFxuICAgICAgICAgICAgICAgICAgICBjb21tb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLmN0eC5jb21tb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBvcHRpb24uX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjaGlsZEN0eCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gXCJ2YWxpZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwiZGlydHlcIiAmJiAhZGlydHkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlydHkgPSB7IHJlc3VsdCwgY3R4OiBjaGlsZEN0eCB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRDdHguY29tbW9uLmlzc3Vlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNzdWVzLnB1c2goY2hpbGRDdHguY29tbW9uLmlzc3Vlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRpcnR5KSB7XG4gICAgICAgICAgICAgICAgY3R4LmNvbW1vbi5pc3N1ZXMucHVzaCguLi5kaXJ0eS5jdHguY29tbW9uLmlzc3Vlcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpcnR5LnJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHVuaW9uRXJyb3JzID0gaXNzdWVzLm1hcCgoaXNzdWVzKSA9PiBuZXcgWm9kRXJyb3IoaXNzdWVzKSk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbixcbiAgICAgICAgICAgICAgICB1bmlvbkVycm9ycyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IG9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYub3B0aW9ucztcbiAgICB9XG59XG5ab2RVbmlvbi5jcmVhdGUgPSAodHlwZXMsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kVW5pb24oe1xuICAgICAgICBvcHRpb25zOiB0eXBlcyxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RVbmlvbixcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vLy8vLy8vLy9cbi8vLy8vLy8vLy8gICAgICBab2REaXNjcmltaW5hdGVkVW5pb24gICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5jb25zdCBnZXREaXNjcmltaW5hdG9yID0gKHR5cGUpID0+IHtcbiAgICBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZExhenkpIHtcbiAgICAgICAgcmV0dXJuIGdldERpc2NyaW1pbmF0b3IodHlwZS5zY2hlbWEpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kRWZmZWN0cykge1xuICAgICAgICByZXR1cm4gZ2V0RGlzY3JpbWluYXRvcih0eXBlLmlubmVyVHlwZSgpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZExpdGVyYWwpIHtcbiAgICAgICAgcmV0dXJuIFt0eXBlLnZhbHVlXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZEVudW0pIHtcbiAgICAgICAgcmV0dXJuIHR5cGUub3B0aW9ucztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZE5hdGl2ZUVudW0pIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGJhbi9iYW5cbiAgICAgICAgcmV0dXJuIHV0aWwub2JqZWN0VmFsdWVzKHR5cGUuZW51bSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2REZWZhdWx0KSB7XG4gICAgICAgIHJldHVybiBnZXREaXNjcmltaW5hdG9yKHR5cGUuX2RlZi5pbm5lclR5cGUpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kVW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBbdW5kZWZpbmVkXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZE51bGwpIHtcbiAgICAgICAgcmV0dXJuIFtudWxsXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZE9wdGlvbmFsKSB7XG4gICAgICAgIHJldHVybiBbdW5kZWZpbmVkLCAuLi5nZXREaXNjcmltaW5hdG9yKHR5cGUudW53cmFwKCkpXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZE51bGxhYmxlKSB7XG4gICAgICAgIHJldHVybiBbbnVsbCwgLi4uZ2V0RGlzY3JpbWluYXRvcih0eXBlLnVud3JhcCgpKV07XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RCcmFuZGVkKSB7XG4gICAgICAgIHJldHVybiBnZXREaXNjcmltaW5hdG9yKHR5cGUudW53cmFwKCkpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kUmVhZG9ubHkpIHtcbiAgICAgICAgcmV0dXJuIGdldERpc2NyaW1pbmF0b3IodHlwZS51bndyYXAoKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RDYXRjaCkge1xuICAgICAgICByZXR1cm4gZ2V0RGlzY3JpbWluYXRvcih0eXBlLl9kZWYuaW5uZXJUeXBlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG59O1xuZXhwb3J0IGNsYXNzIFpvZERpc2NyaW1pbmF0ZWRVbmlvbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLm9iamVjdCkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5vYmplY3QsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkaXNjcmltaW5hdG9yID0gdGhpcy5kaXNjcmltaW5hdG9yO1xuICAgICAgICBjb25zdCBkaXNjcmltaW5hdG9yVmFsdWUgPSBjdHguZGF0YVtkaXNjcmltaW5hdG9yXTtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5vcHRpb25zTWFwLmdldChkaXNjcmltaW5hdG9yVmFsdWUpO1xuICAgICAgICBpZiAoIW9wdGlvbikge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdW5pb25fZGlzY3JpbWluYXRvcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBBcnJheS5mcm9tKHRoaXMub3B0aW9uc01hcC5rZXlzKCkpLFxuICAgICAgICAgICAgICAgIHBhdGg6IFtkaXNjcmltaW5hdG9yXSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb24uX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9uLl9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGRpc2NyaW1pbmF0b3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuZGlzY3JpbWluYXRvcjtcbiAgICB9XG4gICAgZ2V0IG9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYub3B0aW9ucztcbiAgICB9XG4gICAgZ2V0IG9wdGlvbnNNYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYub3B0aW9uc01hcDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBkaXNjcmltaW5hdGVkIHVuaW9uIHNjaGVtYS4gSXRzIGJlaGF2aW91ciBpcyB2ZXJ5IHNpbWlsYXIgdG8gdGhhdCBvZiB0aGUgbm9ybWFsIHoudW5pb24oKSBjb25zdHJ1Y3Rvci5cbiAgICAgKiBIb3dldmVyLCBpdCBvbmx5IGFsbG93cyBhIHVuaW9uIG9mIG9iamVjdHMsIGFsbCBvZiB3aGljaCBuZWVkIHRvIHNoYXJlIGEgZGlzY3JpbWluYXRvciBwcm9wZXJ0eS4gVGhpcyBwcm9wZXJ0eSBtdXN0XG4gICAgICogaGF2ZSBhIGRpZmZlcmVudCB2YWx1ZSBmb3IgZWFjaCBvYmplY3QgaW4gdGhlIHVuaW9uLlxuICAgICAqIEBwYXJhbSBkaXNjcmltaW5hdG9yIHRoZSBuYW1lIG9mIHRoZSBkaXNjcmltaW5hdG9yIHByb3BlcnR5XG4gICAgICogQHBhcmFtIHR5cGVzIGFuIGFycmF5IG9mIG9iamVjdCBzY2hlbWFzXG4gICAgICogQHBhcmFtIHBhcmFtc1xuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGUoZGlzY3JpbWluYXRvciwgb3B0aW9ucywgcGFyYW1zKSB7XG4gICAgICAgIC8vIEdldCBhbGwgdGhlIHZhbGlkIGRpc2NyaW1pbmF0b3IgdmFsdWVzXG4gICAgICAgIGNvbnN0IG9wdGlvbnNNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIC8vIHRyeSB7XG4gICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBvcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBkaXNjcmltaW5hdG9yVmFsdWVzID0gZ2V0RGlzY3JpbWluYXRvcih0eXBlLnNoYXBlW2Rpc2NyaW1pbmF0b3JdKTtcbiAgICAgICAgICAgIGlmICghZGlzY3JpbWluYXRvclZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEEgZGlzY3JpbWluYXRvciB2YWx1ZSBmb3Iga2V5IFxcYCR7ZGlzY3JpbWluYXRvcn1cXGAgY291bGQgbm90IGJlIGV4dHJhY3RlZCBmcm9tIGFsbCBzY2hlbWEgb3B0aW9uc2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBkaXNjcmltaW5hdG9yVmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnNNYXAuaGFzKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYERpc2NyaW1pbmF0b3IgcHJvcGVydHkgJHtTdHJpbmcoZGlzY3JpbWluYXRvcil9IGhhcyBkdXBsaWNhdGUgdmFsdWUgJHtTdHJpbmcodmFsdWUpfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvcHRpb25zTWFwLnNldCh2YWx1ZSwgdHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2REaXNjcmltaW5hdGVkVW5pb24oe1xuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2REaXNjcmltaW5hdGVkVW5pb24sXG4gICAgICAgICAgICBkaXNjcmltaW5hdG9yLFxuICAgICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgICAgIG9wdGlvbnNNYXAsXG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG1lcmdlVmFsdWVzKGEsIGIpIHtcbiAgICBjb25zdCBhVHlwZSA9IGdldFBhcnNlZFR5cGUoYSk7XG4gICAgY29uc3QgYlR5cGUgPSBnZXRQYXJzZWRUeXBlKGIpO1xuICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBhIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKGFUeXBlID09PSBab2RQYXJzZWRUeXBlLm9iamVjdCAmJiBiVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS5vYmplY3QpIHtcbiAgICAgICAgY29uc3QgYktleXMgPSB1dGlsLm9iamVjdEtleXMoYik7XG4gICAgICAgIGNvbnN0IHNoYXJlZEtleXMgPSB1dGlsLm9iamVjdEtleXMoYSkuZmlsdGVyKChrZXkpID0+IGJLZXlzLmluZGV4T2Yoa2V5KSAhPT0gLTEpO1xuICAgICAgICBjb25zdCBuZXdPYmogPSB7IC4uLmEsIC4uLmIgfTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2Ygc2hhcmVkS2V5cykge1xuICAgICAgICAgICAgY29uc3Qgc2hhcmVkVmFsdWUgPSBtZXJnZVZhbHVlcyhhW2tleV0sIGJba2V5XSk7XG4gICAgICAgICAgICBpZiAoIXNoYXJlZFZhbHVlLnZhbGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdPYmpba2V5XSA9IHNoYXJlZFZhbHVlLmRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIGRhdGE6IG5ld09iaiB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChhVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS5hcnJheSAmJiBiVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS5hcnJheSkge1xuICAgICAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXdBcnJheSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1BID0gYVtpbmRleF07XG4gICAgICAgICAgICBjb25zdCBpdGVtQiA9IGJbaW5kZXhdO1xuICAgICAgICAgICAgY29uc3Qgc2hhcmVkVmFsdWUgPSBtZXJnZVZhbHVlcyhpdGVtQSwgaXRlbUIpO1xuICAgICAgICAgICAgaWYgKCFzaGFyZWRWYWx1ZS52YWxpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3QXJyYXkucHVzaChzaGFyZWRWYWx1ZS5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgZGF0YTogbmV3QXJyYXkgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYVR5cGUgPT09IFpvZFBhcnNlZFR5cGUuZGF0ZSAmJiBiVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS5kYXRlICYmICthID09PSArYikge1xuICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgZGF0YTogYSB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlIH07XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFpvZEludGVyc2VjdGlvbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCBoYW5kbGVQYXJzZWQgPSAocGFyc2VkTGVmdCwgcGFyc2VkUmlnaHQpID0+IHtcbiAgICAgICAgICAgIGlmIChpc0Fib3J0ZWQocGFyc2VkTGVmdCkgfHwgaXNBYm9ydGVkKHBhcnNlZFJpZ2h0KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbWVyZ2VkID0gbWVyZ2VWYWx1ZXMocGFyc2VkTGVmdC52YWx1ZSwgcGFyc2VkUmlnaHQudmFsdWUpO1xuICAgICAgICAgICAgaWYgKCFtZXJnZWQudmFsaWQpIHtcbiAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfaW50ZXJzZWN0aW9uX3R5cGVzLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzRGlydHkocGFyc2VkTGVmdCkgfHwgaXNEaXJ0eShwYXJzZWRSaWdodCkpIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogbWVyZ2VkLmRhdGEgfTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAgICAgdGhpcy5fZGVmLmxlZnQuX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHRoaXMuX2RlZi5yaWdodC5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdKS50aGVuKChbbGVmdCwgcmlnaHRdKSA9PiBoYW5kbGVQYXJzZWQobGVmdCwgcmlnaHQpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVQYXJzZWQodGhpcy5fZGVmLmxlZnQuX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KSwgdGhpcy5fZGVmLnJpZ2h0Ll9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfVxufVxuWm9kSW50ZXJzZWN0aW9uLmNyZWF0ZSA9IChsZWZ0LCByaWdodCwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RJbnRlcnNlY3Rpb24oe1xuICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICByaWdodDogcmlnaHQsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kSW50ZXJzZWN0aW9uLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuLy8gdHlwZSBab2RUdXBsZUl0ZW1zID0gW1pvZFR5cGVBbnksIC4uLlpvZFR5cGVBbnlbXV07XG5leHBvcnQgY2xhc3MgWm9kVHVwbGUgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLmFycmF5KSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmFycmF5LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5kYXRhLmxlbmd0aCA8IHRoaXMuX2RlZi5pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgbWluaW11bTogdGhpcy5fZGVmLml0ZW1zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzdCA9IHRoaXMuX2RlZi5yZXN0O1xuICAgICAgICBpZiAoIXJlc3QgJiYgY3R4LmRhdGEubGVuZ3RoID4gdGhpcy5fZGVmLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgbWF4aW11bTogdGhpcy5fZGVmLml0ZW1zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbXMgPSBbLi4uY3R4LmRhdGFdXG4gICAgICAgICAgICAubWFwKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuX2RlZi5pdGVtc1tpdGVtSW5kZXhdIHx8IHRoaXMuX2RlZi5yZXN0O1xuICAgICAgICAgICAgaWYgKCFzY2hlbWEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4gc2NoZW1hLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgaXRlbSwgY3R4LnBhdGgsIGl0ZW1JbmRleCkpO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmZpbHRlcigoeCkgPT4gISF4KTsgLy8gZmlsdGVyIG51bGxzXG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoaXRlbXMpLnRoZW4oKHJlc3VsdHMpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VBcnJheShzdGF0dXMsIHJlc3VsdHMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VBcnJheShzdGF0dXMsIGl0ZW1zKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgaXRlbXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaXRlbXM7XG4gICAgfVxuICAgIHJlc3QocmVzdCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFR1cGxlKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHJlc3QsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblpvZFR1cGxlLmNyZWF0ZSA9IChzY2hlbWFzLCBwYXJhbXMpID0+IHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoc2NoZW1hcykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgcGFzcyBhbiBhcnJheSBvZiBzY2hlbWFzIHRvIHoudHVwbGUoWyAuLi4gXSlcIik7XG4gICAgfVxuICAgIHJldHVybiBuZXcgWm9kVHVwbGUoe1xuICAgICAgICBpdGVtczogc2NoZW1hcyxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RUdXBsZSxcbiAgICAgICAgcmVzdDogbnVsbCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RSZWNvcmQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBnZXQga2V5U2NoZW1hKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmtleVR5cGU7XG4gICAgfVxuICAgIGdldCB2YWx1ZVNjaGVtYSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi52YWx1ZVR5cGU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUub2JqZWN0KSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm9iamVjdCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhaXJzID0gW107XG4gICAgICAgIGNvbnN0IGtleVR5cGUgPSB0aGlzLl9kZWYua2V5VHlwZTtcbiAgICAgICAgY29uc3QgdmFsdWVUeXBlID0gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gY3R4LmRhdGEpIHtcbiAgICAgICAgICAgIHBhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgIGtleToga2V5VHlwZS5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIGtleSwgY3R4LnBhdGgsIGtleSkpLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVR5cGUuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBjdHguZGF0YVtrZXldLCBjdHgucGF0aCwga2V5KSksXG4gICAgICAgICAgICAgICAgYWx3YXlzU2V0OiBrZXkgaW4gY3R4LmRhdGEsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFBhcnNlU3RhdHVzLm1lcmdlT2JqZWN0QXN5bmMoc3RhdHVzLCBwYWlycyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VPYmplY3RTeW5jKHN0YXR1cywgcGFpcnMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBlbGVtZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICB9XG4gICAgc3RhdGljIGNyZWF0ZShmaXJzdCwgc2Vjb25kLCB0aGlyZCkge1xuICAgICAgICBpZiAoc2Vjb25kIGluc3RhbmNlb2YgWm9kVHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBab2RSZWNvcmQoe1xuICAgICAgICAgICAgICAgIGtleVR5cGU6IGZpcnN0LFxuICAgICAgICAgICAgICAgIHZhbHVlVHlwZTogc2Vjb25kLFxuICAgICAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kUmVjb3JkLFxuICAgICAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXModGhpcmQpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RSZWNvcmQoe1xuICAgICAgICAgICAga2V5VHlwZTogWm9kU3RyaW5nLmNyZWF0ZSgpLFxuICAgICAgICAgICAgdmFsdWVUeXBlOiBmaXJzdCxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kUmVjb3JkLFxuICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhzZWNvbmQpLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgWm9kTWFwIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgZ2V0IGtleVNjaGVtYSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5rZXlUeXBlO1xuICAgIH1cbiAgICBnZXQgdmFsdWVTY2hlbWEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWVUeXBlO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLm1hcCkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5tYXAsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBrZXlUeXBlID0gdGhpcy5fZGVmLmtleVR5cGU7XG4gICAgICAgIGNvbnN0IHZhbHVlVHlwZSA9IHRoaXMuX2RlZi52YWx1ZVR5cGU7XG4gICAgICAgIGNvbnN0IHBhaXJzID0gWy4uLmN0eC5kYXRhLmVudHJpZXMoKV0ubWFwKChba2V5LCB2YWx1ZV0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGtleToga2V5VHlwZS5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIGtleSwgY3R4LnBhdGgsIFtpbmRleCwgXCJrZXlcIl0pKSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVUeXBlLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgdmFsdWUsIGN0eC5wYXRoLCBbaW5kZXgsIFwidmFsdWVcIl0pKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgY29uc3QgZmluYWxNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHBhaXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IHBhaXIua2V5O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IHBhaXIudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkuc3RhdHVzID09PSBcImFib3J0ZWRcIiB8fCB2YWx1ZS5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5LnN0YXR1cyA9PT0gXCJkaXJ0eVwiIHx8IHZhbHVlLnN0YXR1cyA9PT0gXCJkaXJ0eVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbE1hcC5zZXQoa2V5LnZhbHVlLCB2YWx1ZS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogZmluYWxNYXAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZmluYWxNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBwYWlyLmtleTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHBhaXIudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiYWJvcnRlZFwiIHx8IHZhbHVlLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChrZXkuc3RhdHVzID09PSBcImRpcnR5XCIgfHwgdmFsdWUuc3RhdHVzID09PSBcImRpcnR5XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsTWFwLnNldChrZXkudmFsdWUsIHZhbHVlLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogZmluYWxNYXAgfTtcbiAgICAgICAgfVxuICAgIH1cbn1cblpvZE1hcC5jcmVhdGUgPSAoa2V5VHlwZSwgdmFsdWVUeXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE1hcCh7XG4gICAgICAgIHZhbHVlVHlwZSxcbiAgICAgICAga2V5VHlwZSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RNYXAsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kU2V0IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5zZXQpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuc2V0LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVmID0gdGhpcy5fZGVmO1xuICAgICAgICBpZiAoZGVmLm1pblNpemUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjdHguZGF0YS5zaXplIDwgZGVmLm1pblNpemUudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgbWluaW11bTogZGVmLm1pblNpemUudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic2V0XCIsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBkZWYubWluU2l6ZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChkZWYubWF4U2l6ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGN0eC5kYXRhLnNpemUgPiBkZWYubWF4U2l6ZS52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogZGVmLm1heFNpemUudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic2V0XCIsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBkZWYubWF4U2l6ZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlVHlwZSA9IHRoaXMuX2RlZi52YWx1ZVR5cGU7XG4gICAgICAgIGZ1bmN0aW9uIGZpbmFsaXplU2V0KGVsZW1lbnRzKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWRTZXQgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgcGFyc2VkU2V0LmFkZChlbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogcGFyc2VkU2V0IH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSBbLi4uY3R4LmRhdGEudmFsdWVzKCldLm1hcCgoaXRlbSwgaSkgPT4gdmFsdWVUeXBlLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgaXRlbSwgY3R4LnBhdGgsIGkpKSk7XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoZWxlbWVudHMpLnRoZW4oKGVsZW1lbnRzKSA9PiBmaW5hbGl6ZVNldChlbGVtZW50cykpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZpbmFsaXplU2V0KGVsZW1lbnRzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBtaW4obWluU2l6ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFNldCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBtaW5TaXplOiB7IHZhbHVlOiBtaW5TaXplLCBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1heChtYXhTaXplLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kU2V0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIG1heFNpemU6IHsgdmFsdWU6IG1heFNpemUsIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc2l6ZShzaXplLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbihzaXplLCBtZXNzYWdlKS5tYXgoc2l6ZSwgbWVzc2FnZSk7XG4gICAgfVxuICAgIG5vbmVtcHR5KG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluKDEsIG1lc3NhZ2UpO1xuICAgIH1cbn1cblpvZFNldC5jcmVhdGUgPSAodmFsdWVUeXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFNldCh7XG4gICAgICAgIHZhbHVlVHlwZSxcbiAgICAgICAgbWluU2l6ZTogbnVsbCxcbiAgICAgICAgbWF4U2l6ZTogbnVsbCxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RTZXQsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kRnVuY3Rpb24gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy52YWxpZGF0ZSA9IHRoaXMuaW1wbGVtZW50O1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5mdW5jdGlvbikge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5mdW5jdGlvbixcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VBcmdzSXNzdWUoYXJncywgZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBtYWtlSXNzdWUoe1xuICAgICAgICAgICAgICAgIGRhdGE6IGFyZ3MsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgZXJyb3JNYXBzOiBbY3R4LmNvbW1vbi5jb250ZXh0dWFsRXJyb3JNYXAsIGN0eC5zY2hlbWFFcnJvck1hcCwgZ2V0RXJyb3JNYXAoKSwgZGVmYXVsdEVycm9yTWFwXS5maWx0ZXIoKHgpID0+ICEheCksXG4gICAgICAgICAgICAgICAgaXNzdWVEYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX2FyZ3VtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgYXJndW1lbnRzRXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBtYWtlUmV0dXJuc0lzc3VlKHJldHVybnMsIGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFrZUlzc3VlKHtcbiAgICAgICAgICAgICAgICBkYXRhOiByZXR1cm5zLFxuICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgIGVycm9yTWFwczogW2N0eC5jb21tb24uY29udGV4dHVhbEVycm9yTWFwLCBjdHguc2NoZW1hRXJyb3JNYXAsIGdldEVycm9yTWFwKCksIGRlZmF1bHRFcnJvck1hcF0uZmlsdGVyKCh4KSA9PiAhIXgpLFxuICAgICAgICAgICAgICAgIGlzc3VlRGF0YToge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9yZXR1cm5fdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuVHlwZUVycm9yOiBlcnJvcixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyYW1zID0geyBlcnJvck1hcDogY3R4LmNvbW1vbi5jb250ZXh0dWFsRXJyb3JNYXAgfTtcbiAgICAgICAgY29uc3QgZm4gPSBjdHguZGF0YTtcbiAgICAgICAgaWYgKHRoaXMuX2RlZi5yZXR1cm5zIGluc3RhbmNlb2YgWm9kUHJvbWlzZSkge1xuICAgICAgICAgICAgLy8gV291bGQgbG92ZSBhIHdheSB0byBhdm9pZCBkaXNhYmxpbmcgdGhpcyBydWxlLCBidXQgd2UgbmVlZFxuICAgICAgICAgICAgLy8gYW4gYWxpYXMgKHVzaW5nIGFuIGFycm93IGZ1bmN0aW9uIHdhcyB3aGF0IGNhdXNlZCAyNjUxKS5cbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuICAgICAgICAgICAgY29uc3QgbWUgPSB0aGlzO1xuICAgICAgICAgICAgcmV0dXJuIE9LKGFzeW5jIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgWm9kRXJyb3IoW10pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZEFyZ3MgPSBhd2FpdCBtZS5fZGVmLmFyZ3MucGFyc2VBc3luYyhhcmdzLCBwYXJhbXMpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yLmFkZElzc3VlKG1ha2VBcmdzSXNzdWUoYXJncywgZSkpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBSZWZsZWN0LmFwcGx5KGZuLCB0aGlzLCBwYXJzZWRBcmdzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWRSZXR1cm5zID0gYXdhaXQgbWUuX2RlZi5yZXR1cm5zLl9kZWYudHlwZVxuICAgICAgICAgICAgICAgICAgICAucGFyc2VBc3luYyhyZXN1bHQsIHBhcmFtcylcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yLmFkZElzc3VlKG1ha2VSZXR1cm5zSXNzdWUocmVzdWx0LCBlKSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZWRSZXR1cm5zO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBXb3VsZCBsb3ZlIGEgd2F5IHRvIGF2b2lkIGRpc2FibGluZyB0aGlzIHJ1bGUsIGJ1dCB3ZSBuZWVkXG4gICAgICAgICAgICAvLyBhbiBhbGlhcyAodXNpbmcgYW4gYXJyb3cgZnVuY3Rpb24gd2FzIHdoYXQgY2F1c2VkIDI2NTEpLlxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG4gICAgICAgICAgICBjb25zdCBtZSA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4gT0soZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWRBcmdzID0gbWUuX2RlZi5hcmdzLnNhZmVQYXJzZShhcmdzLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIGlmICghcGFyc2VkQXJncy5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBab2RFcnJvcihbbWFrZUFyZ3NJc3N1ZShhcmdzLCBwYXJzZWRBcmdzLmVycm9yKV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBSZWZsZWN0LmFwcGx5KGZuLCB0aGlzLCBwYXJzZWRBcmdzLmRhdGEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZFJldHVybnMgPSBtZS5fZGVmLnJldHVybnMuc2FmZVBhcnNlKHJlc3VsdCwgcGFyYW1zKTtcbiAgICAgICAgICAgICAgICBpZiAoIXBhcnNlZFJldHVybnMuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgWm9kRXJyb3IoW21ha2VSZXR1cm5zSXNzdWUocmVzdWx0LCBwYXJzZWRSZXR1cm5zLmVycm9yKV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VkUmV0dXJucy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcGFyYW1ldGVycygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5hcmdzO1xuICAgIH1cbiAgICByZXR1cm5UeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnJldHVybnM7XG4gICAgfVxuICAgIGFyZ3MoLi4uaXRlbXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RGdW5jdGlvbih7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBhcmdzOiBab2RUdXBsZS5jcmVhdGUoaXRlbXMpLnJlc3QoWm9kVW5rbm93bi5jcmVhdGUoKSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm5zKHJldHVyblR5cGUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RGdW5jdGlvbih7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICByZXR1cm5zOiByZXR1cm5UeXBlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW1wbGVtZW50KGZ1bmMpIHtcbiAgICAgICAgY29uc3QgdmFsaWRhdGVkRnVuYyA9IHRoaXMucGFyc2UoZnVuYyk7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZWRGdW5jO1xuICAgIH1cbiAgICBzdHJpY3RJbXBsZW1lbnQoZnVuYykge1xuICAgICAgICBjb25zdCB2YWxpZGF0ZWRGdW5jID0gdGhpcy5wYXJzZShmdW5jKTtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlZEZ1bmM7XG4gICAgfVxuICAgIHN0YXRpYyBjcmVhdGUoYXJncywgcmV0dXJucywgcGFyYW1zKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRnVuY3Rpb24oe1xuICAgICAgICAgICAgYXJnczogKGFyZ3MgPyBhcmdzIDogWm9kVHVwbGUuY3JlYXRlKFtdKS5yZXN0KFpvZFVua25vd24uY3JlYXRlKCkpKSxcbiAgICAgICAgICAgIHJldHVybnM6IHJldHVybnMgfHwgWm9kVW5rbm93bi5jcmVhdGUoKSxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRnVuY3Rpb24sXG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RMYXp5IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgZ2V0IHNjaGVtYSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5nZXR0ZXIoKTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCBsYXp5U2NoZW1hID0gdGhpcy5fZGVmLmdldHRlcigpO1xuICAgICAgICByZXR1cm4gbGF6eVNjaGVtYS5fcGFyc2UoeyBkYXRhOiBjdHguZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pO1xuICAgIH1cbn1cblpvZExhenkuY3JlYXRlID0gKGdldHRlciwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RMYXp5KHtcbiAgICAgICAgZ2V0dGVyOiBnZXR0ZXIsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTGF6eSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RMaXRlcmFsIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmIChpbnB1dC5kYXRhICE9PSB0aGlzLl9kZWYudmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9saXRlcmFsLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiB0aGlzLl9kZWYudmFsdWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZTogaW5wdXQuZGF0YSB9O1xuICAgIH1cbiAgICBnZXQgdmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWU7XG4gICAgfVxufVxuWm9kTGl0ZXJhbC5jcmVhdGUgPSAodmFsdWUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTGl0ZXJhbCh7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RMaXRlcmFsLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZnVuY3Rpb24gY3JlYXRlWm9kRW51bSh2YWx1ZXMsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgWm9kRW51bSh7XG4gICAgICAgIHZhbHVlcyxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFbnVtLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG5leHBvcnQgY2xhc3MgWm9kRW51bSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodHlwZW9mIGlucHV0LmRhdGEgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGNvbnN0IGV4cGVjdGVkVmFsdWVzID0gdGhpcy5fZGVmLnZhbHVlcztcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiB1dGlsLmpvaW5WYWx1ZXMoZXhwZWN0ZWRWYWx1ZXMpLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZSA9IG5ldyBTZXQodGhpcy5fZGVmLnZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9jYWNoZS5oYXMoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGNvbnN0IGV4cGVjdGVkVmFsdWVzID0gdGhpcy5fZGVmLnZhbHVlcztcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9lbnVtX3ZhbHVlLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGV4cGVjdGVkVmFsdWVzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxuICAgIGdldCBvcHRpb25zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnZhbHVlcztcbiAgICB9XG4gICAgZ2V0IGVudW0oKSB7XG4gICAgICAgIGNvbnN0IGVudW1WYWx1ZXMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCB2YWwgb2YgdGhpcy5fZGVmLnZhbHVlcykge1xuICAgICAgICAgICAgZW51bVZhbHVlc1t2YWxdID0gdmFsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbnVtVmFsdWVzO1xuICAgIH1cbiAgICBnZXQgVmFsdWVzKCkge1xuICAgICAgICBjb25zdCBlbnVtVmFsdWVzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgdmFsIG9mIHRoaXMuX2RlZi52YWx1ZXMpIHtcbiAgICAgICAgICAgIGVudW1WYWx1ZXNbdmFsXSA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZW51bVZhbHVlcztcbiAgICB9XG4gICAgZ2V0IEVudW0oKSB7XG4gICAgICAgIGNvbnN0IGVudW1WYWx1ZXMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCB2YWwgb2YgdGhpcy5fZGVmLnZhbHVlcykge1xuICAgICAgICAgICAgZW51bVZhbHVlc1t2YWxdID0gdmFsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbnVtVmFsdWVzO1xuICAgIH1cbiAgICBleHRyYWN0KHZhbHVlcywgbmV3RGVmID0gdGhpcy5fZGVmKSB7XG4gICAgICAgIHJldHVybiBab2RFbnVtLmNyZWF0ZSh2YWx1ZXMsIHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIC4uLm5ld0RlZixcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGV4Y2x1ZGUodmFsdWVzLCBuZXdEZWYgPSB0aGlzLl9kZWYpIHtcbiAgICAgICAgcmV0dXJuIFpvZEVudW0uY3JlYXRlKHRoaXMub3B0aW9ucy5maWx0ZXIoKG9wdCkgPT4gIXZhbHVlcy5pbmNsdWRlcyhvcHQpKSwge1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgLi4ubmV3RGVmLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5ab2RFbnVtLmNyZWF0ZSA9IGNyZWF0ZVpvZEVudW07XG5leHBvcnQgY2xhc3MgWm9kTmF0aXZlRW51bSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBuYXRpdmVFbnVtVmFsdWVzID0gdXRpbC5nZXRWYWxpZEVudW1WYWx1ZXModGhpcy5fZGVmLnZhbHVlcyk7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLnN0cmluZyAmJiBjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5udW1iZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4cGVjdGVkVmFsdWVzID0gdXRpbC5vYmplY3RWYWx1ZXMobmF0aXZlRW51bVZhbHVlcyk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogdXRpbC5qb2luVmFsdWVzKGV4cGVjdGVkVmFsdWVzKSxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9jYWNoZSkge1xuICAgICAgICAgICAgdGhpcy5fY2FjaGUgPSBuZXcgU2V0KHV0aWwuZ2V0VmFsaWRFbnVtVmFsdWVzKHRoaXMuX2RlZi52YWx1ZXMpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlLmhhcyhpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWRWYWx1ZXMgPSB1dGlsLm9iamVjdFZhbHVlcyhuYXRpdmVFbnVtVmFsdWVzKTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9lbnVtX3ZhbHVlLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGV4cGVjdGVkVmFsdWVzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxuICAgIGdldCBlbnVtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnZhbHVlcztcbiAgICB9XG59XG5ab2ROYXRpdmVFbnVtLmNyZWF0ZSA9ICh2YWx1ZXMsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTmF0aXZlRW51bSh7XG4gICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE5hdGl2ZUVudW0sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kUHJvbWlzZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIHVud3JhcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi50eXBlO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5wcm9taXNlICYmIGN0eC5jb21tb24uYXN5bmMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLnByb21pc2UsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9taXNpZmllZCA9IGN0eC5wYXJzZWRUeXBlID09PSBab2RQYXJzZWRUeXBlLnByb21pc2UgPyBjdHguZGF0YSA6IFByb21pc2UucmVzb2x2ZShjdHguZGF0YSk7XG4gICAgICAgIHJldHVybiBPSyhwcm9taXNpZmllZC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnR5cGUucGFyc2VBc3luYyhkYXRhLCB7XG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgZXJyb3JNYXA6IGN0eC5jb21tb24uY29udGV4dHVhbEVycm9yTWFwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pKTtcbiAgICB9XG59XG5ab2RQcm9taXNlLmNyZWF0ZSA9IChzY2hlbWEsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kUHJvbWlzZSh7XG4gICAgICAgIHR5cGU6IHNjaGVtYSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RQcm9taXNlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZEVmZmVjdHMgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBpbm5lclR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuc2NoZW1hO1xuICAgIH1cbiAgICBzb3VyY2VUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnNjaGVtYS5fZGVmLnR5cGVOYW1lID09PSBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRWZmZWN0c1xuICAgICAgICAgICAgPyB0aGlzLl9kZWYuc2NoZW1hLnNvdXJjZVR5cGUoKVxuICAgICAgICAgICAgOiB0aGlzLl9kZWYuc2NoZW1hO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3QgZWZmZWN0ID0gdGhpcy5fZGVmLmVmZmVjdCB8fCBudWxsO1xuICAgICAgICBjb25zdCBjaGVja0N0eCA9IHtcbiAgICAgICAgICAgIGFkZElzc3VlOiAoYXJnKSA9PiB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCBhcmcpO1xuICAgICAgICAgICAgICAgIGlmIChhcmcuZmF0YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0IHBhdGgoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN0eC5wYXRoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgY2hlY2tDdHguYWRkSXNzdWUgPSBjaGVja0N0eC5hZGRJc3N1ZS5iaW5kKGNoZWNrQ3R4KTtcbiAgICAgICAgaWYgKGVmZmVjdC50eXBlID09PSBcInByZXByb2Nlc3NcIikge1xuICAgICAgICAgICAgY29uc3QgcHJvY2Vzc2VkID0gZWZmZWN0LnRyYW5zZm9ybShjdHguZGF0YSwgY2hlY2tDdHgpO1xuICAgICAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHByb2Nlc3NlZCkudGhlbihhc3luYyAocHJvY2Vzc2VkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMudmFsdWUgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcHJvY2Vzc2VkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERJUlRZKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMudmFsdWUgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBESVJUWShyZXN1bHQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cy52YWx1ZSA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHByb2Nlc3NlZCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERJUlRZKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cy52YWx1ZSA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRElSVFkocmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChlZmZlY3QudHlwZSA9PT0gXCJyZWZpbmVtZW50XCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGVSZWZpbmVtZW50ID0gKGFjYykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGVmZmVjdC5yZWZpbmVtZW50KGFjYywgY2hlY2tDdHgpO1xuICAgICAgICAgICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmMgcmVmaW5lbWVudCBlbmNvdW50ZXJlZCBkdXJpbmcgc3luY2hyb25vdXMgcGFyc2Ugb3BlcmF0aW9uLiBVc2UgLnBhcnNlQXN5bmMgaW5zdGVhZC5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5uZXIgPSB0aGlzLl9kZWYuc2NoZW1hLl9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChpbm5lci5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICBpZiAoaW5uZXIuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIC8vIHJldHVybiB2YWx1ZSBpcyBpZ25vcmVkXG4gICAgICAgICAgICAgICAgZXhlY3V0ZVJlZmluZW1lbnQoaW5uZXIudmFsdWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogaW5uZXIudmFsdWUgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9kZWYuc2NoZW1hLl9wYXJzZUFzeW5jKHsgZGF0YTogY3R4LmRhdGEsIHBhdGg6IGN0eC5wYXRoLCBwYXJlbnQ6IGN0eCB9KS50aGVuKChpbm5lcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5uZXIuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5uZXIuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4ZWN1dGVSZWZpbmVtZW50KGlubmVyLnZhbHVlKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogaW5uZXIudmFsdWUgfTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVmZmVjdC50eXBlID09PSBcInRyYW5zZm9ybVwiKSB7XG4gICAgICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlID0gdGhpcy5fZGVmLnNjaGVtYS5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzVmFsaWQoYmFzZSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGVmZmVjdC50cmFuc2Zvcm0oYmFzZS52YWx1ZSwgY2hlY2tDdHgpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQXN5bmNocm9ub3VzIHRyYW5zZm9ybSBlbmNvdW50ZXJlZCBkdXJpbmcgc3luY2hyb25vdXMgcGFyc2Ugb3BlcmF0aW9uLiBVc2UgLnBhcnNlQXN5bmMgaW5zdGVhZC5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiByZXN1bHQgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9kZWYuc2NoZW1hLl9wYXJzZUFzeW5jKHsgZGF0YTogY3R4LmRhdGEsIHBhdGg6IGN0eC5wYXRoLCBwYXJlbnQ6IGN0eCB9KS50aGVuKChiYXNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZChiYXNlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGVmZmVjdC50cmFuc2Zvcm0oYmFzZS52YWx1ZSwgY2hlY2tDdHgpKS50aGVuKChyZXN1bHQpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHN0YXR1cy52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGVmZmVjdCk7XG4gICAgfVxufVxuWm9kRWZmZWN0cy5jcmVhdGUgPSAoc2NoZW1hLCBlZmZlY3QsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kRWZmZWN0cyh7XG4gICAgICAgIHNjaGVtYSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFZmZlY3RzLFxuICAgICAgICBlZmZlY3QsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5ab2RFZmZlY3RzLmNyZWF0ZVdpdGhQcmVwcm9jZXNzID0gKHByZXByb2Nlc3MsIHNjaGVtYSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RFZmZlY3RzKHtcbiAgICAgICAgc2NoZW1hLFxuICAgICAgICBlZmZlY3Q6IHsgdHlwZTogXCJwcmVwcm9jZXNzXCIsIHRyYW5zZm9ybTogcHJlcHJvY2VzcyB9LFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVmZmVjdHMsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgeyBab2RFZmZlY3RzIGFzIFpvZFRyYW5zZm9ybWVyIH07XG5leHBvcnQgY2xhc3MgWm9kT3B0aW9uYWwgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS51bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBPSyh1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlLl9wYXJzZShpbnB1dCk7XG4gICAgfVxuICAgIHVud3JhcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuWm9kT3B0aW9uYWwuY3JlYXRlID0gKHR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kT3B0aW9uYWwoe1xuICAgICAgICBpbm5lclR5cGU6IHR5cGUsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kT3B0aW9uYWwsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kTnVsbGFibGUgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS5udWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gT0sobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKGlucHV0KTtcbiAgICB9XG4gICAgdW53cmFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmlubmVyVHlwZTtcbiAgICB9XG59XG5ab2ROdWxsYWJsZS5jcmVhdGUgPSAodHlwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2ROdWxsYWJsZSh7XG4gICAgICAgIGlubmVyVHlwZTogdHlwZSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2ROdWxsYWJsZSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2REZWZhdWx0IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBsZXQgZGF0YSA9IGN0eC5kYXRhO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgPT09IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBkYXRhID0gdGhpcy5fZGVmLmRlZmF1bHRWYWx1ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlLl9wYXJzZSh7XG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlbW92ZURlZmF1bHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlO1xuICAgIH1cbn1cblpvZERlZmF1bHQuY3JlYXRlID0gKHR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kRGVmYXVsdCh7XG4gICAgICAgIGlubmVyVHlwZTogdHlwZSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2REZWZhdWx0LFxuICAgICAgICBkZWZhdWx0VmFsdWU6IHR5cGVvZiBwYXJhbXMuZGVmYXVsdCA9PT0gXCJmdW5jdGlvblwiID8gcGFyYW1zLmRlZmF1bHQgOiAoKSA9PiBwYXJhbXMuZGVmYXVsdCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RDYXRjaCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgLy8gbmV3Q3R4IGlzIHVzZWQgdG8gbm90IGNvbGxlY3QgaXNzdWVzIGZyb20gaW5uZXIgdHlwZXMgaW4gY3R4XG4gICAgICAgIGNvbnN0IG5ld0N0eCA9IHtcbiAgICAgICAgICAgIC4uLmN0eCxcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIC4uLmN0eC5jb21tb24sXG4gICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKHtcbiAgICAgICAgICAgIGRhdGE6IG5ld0N0eC5kYXRhLFxuICAgICAgICAgICAgcGF0aDogbmV3Q3R4LnBhdGgsXG4gICAgICAgICAgICBwYXJlbnQ6IHtcbiAgICAgICAgICAgICAgICAuLi5uZXdDdHgsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGlzQXN5bmMocmVzdWx0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFwidmFsaWRcIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC5zdGF0dXMgPT09IFwidmFsaWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgPyByZXN1bHQudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy5fZGVmLmNhdGNoVmFsdWUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldCBlcnJvcigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBab2RFcnJvcihuZXdDdHguY29tbW9uLmlzc3Vlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogbmV3Q3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXR1czogXCJ2YWxpZFwiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHQuc3RhdHVzID09PSBcInZhbGlkXCJcbiAgICAgICAgICAgICAgICAgICAgPyByZXN1bHQudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgOiB0aGlzLl9kZWYuY2F0Y2hWYWx1ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZXQgZXJyb3IoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBab2RFcnJvcihuZXdDdHguY29tbW9uLmlzc3Vlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IG5ld0N0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlQ2F0Y2goKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlO1xuICAgIH1cbn1cblpvZENhdGNoLmNyZWF0ZSA9ICh0eXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZENhdGNoKHtcbiAgICAgICAgaW5uZXJUeXBlOiB0eXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZENhdGNoLFxuICAgICAgICBjYXRjaFZhbHVlOiB0eXBlb2YgcGFyYW1zLmNhdGNoID09PSBcImZ1bmN0aW9uXCIgPyBwYXJhbXMuY2F0Y2ggOiAoKSA9PiBwYXJhbXMuY2F0Y2gsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kTmFOIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUubmFuKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm5hbixcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZTogaW5wdXQuZGF0YSB9O1xuICAgIH1cbn1cblpvZE5hTi5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2ROYU4oe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE5hTixcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjb25zdCBCUkFORCA9IFN5bWJvbChcInpvZF9icmFuZFwiKTtcbmV4cG9ydCBjbGFzcyBab2RCcmFuZGVkIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCBkYXRhID0gY3R4LmRhdGE7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudHlwZS5fcGFyc2Uoe1xuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB1bndyYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudHlwZTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgWm9kUGlwZWxpbmUgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZUFzeW5jID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluUmVzdWx0ID0gYXdhaXQgdGhpcy5fZGVmLmluLl9wYXJzZUFzeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoaW5SZXN1bHQuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgaWYgKGluUmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRElSVFkoaW5SZXN1bHQudmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vdXQuX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogaW5SZXN1bHQudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUFzeW5jKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBpblJlc3VsdCA9IHRoaXMuX2RlZi5pbi5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGluUmVzdWx0LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICBpZiAoaW5SZXN1bHQuc3RhdHVzID09PSBcImRpcnR5XCIpIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFwiZGlydHlcIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGluUmVzdWx0LnZhbHVlLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGVmLm91dC5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogaW5SZXN1bHQudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgY3JlYXRlKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RQaXBlbGluZSh7XG4gICAgICAgICAgICBpbjogYSxcbiAgICAgICAgICAgIG91dDogYixcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kUGlwZWxpbmUsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RSZWFkb25seSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9kZWYuaW5uZXJUeXBlLl9wYXJzZShpbnB1dCk7XG4gICAgICAgIGNvbnN0IGZyZWV6ZSA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNWYWxpZChkYXRhKSkge1xuICAgICAgICAgICAgICAgIGRhdGEudmFsdWUgPSBPYmplY3QuZnJlZXplKGRhdGEudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBpc0FzeW5jKHJlc3VsdCkgPyByZXN1bHQudGhlbigoZGF0YSkgPT4gZnJlZXplKGRhdGEpKSA6IGZyZWV6ZShyZXN1bHQpO1xuICAgIH1cbiAgICB1bndyYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlO1xuICAgIH1cbn1cblpvZFJlYWRvbmx5LmNyZWF0ZSA9ICh0eXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFJlYWRvbmx5KHtcbiAgICAgICAgaW5uZXJUeXBlOiB0eXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFJlYWRvbmx5LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLyAgICAgICAgICAgICAgICAgICAgLy8vLy8vLy8vL1xuLy8vLy8vLy8vLyAgICAgIHouY3VzdG9tICAgICAgLy8vLy8vLy8vL1xuLy8vLy8vLy8vLyAgICAgICAgICAgICAgICAgICAgLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZnVuY3Rpb24gY2xlYW5QYXJhbXMocGFyYW1zLCBkYXRhKSB7XG4gICAgY29uc3QgcCA9IHR5cGVvZiBwYXJhbXMgPT09IFwiZnVuY3Rpb25cIiA/IHBhcmFtcyhkYXRhKSA6IHR5cGVvZiBwYXJhbXMgPT09IFwic3RyaW5nXCIgPyB7IG1lc3NhZ2U6IHBhcmFtcyB9IDogcGFyYW1zO1xuICAgIGNvbnN0IHAyID0gdHlwZW9mIHAgPT09IFwic3RyaW5nXCIgPyB7IG1lc3NhZ2U6IHAgfSA6IHA7XG4gICAgcmV0dXJuIHAyO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGN1c3RvbShjaGVjaywgX3BhcmFtcyA9IHt9LCBcbi8qKlxuICogQGRlcHJlY2F0ZWRcbiAqXG4gKiBQYXNzIGBmYXRhbGAgaW50byB0aGUgcGFyYW1zIG9iamVjdCBpbnN0ZWFkOlxuICpcbiAqIGBgYHRzXG4gKiB6LnN0cmluZygpLmN1c3RvbSgodmFsKSA9PiB2YWwubGVuZ3RoID4gNSwgeyBmYXRhbDogZmFsc2UgfSlcbiAqIGBgYFxuICpcbiAqL1xuZmF0YWwpIHtcbiAgICBpZiAoY2hlY2spXG4gICAgICAgIHJldHVybiBab2RBbnkuY3JlYXRlKCkuc3VwZXJSZWZpbmUoKGRhdGEsIGN0eCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgciA9IGNoZWNrKGRhdGEpO1xuICAgICAgICAgICAgaWYgKHIgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHIudGhlbigocikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IGNsZWFuUGFyYW1zKF9wYXJhbXMsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgX2ZhdGFsID0gcGFyYW1zLmZhdGFsID8/IGZhdGFsID8/IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguYWRkSXNzdWUoeyBjb2RlOiBcImN1c3RvbVwiLCAuLi5wYXJhbXMsIGZhdGFsOiBfZmF0YWwgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IGNsZWFuUGFyYW1zKF9wYXJhbXMsIGRhdGEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IF9mYXRhbCA9IHBhcmFtcy5mYXRhbCA/PyBmYXRhbCA/PyB0cnVlO1xuICAgICAgICAgICAgICAgIGN0eC5hZGRJc3N1ZSh7IGNvZGU6IFwiY3VzdG9tXCIsIC4uLnBhcmFtcywgZmF0YWw6IF9mYXRhbCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIFpvZEFueS5jcmVhdGUoKTtcbn1cbmV4cG9ydCB7IFpvZFR5cGUgYXMgU2NoZW1hLCBab2RUeXBlIGFzIFpvZFNjaGVtYSB9O1xuZXhwb3J0IGNvbnN0IGxhdGUgPSB7XG4gICAgb2JqZWN0OiBab2RPYmplY3QubGF6eWNyZWF0ZSxcbn07XG5leHBvcnQgdmFyIFpvZEZpcnN0UGFydHlUeXBlS2luZDtcbihmdW5jdGlvbiAoWm9kRmlyc3RQYXJ0eVR5cGVLaW5kKSB7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kU3RyaW5nXCJdID0gXCJab2RTdHJpbmdcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2ROdW1iZXJcIl0gPSBcIlpvZE51bWJlclwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE5hTlwiXSA9IFwiWm9kTmFOXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kQmlnSW50XCJdID0gXCJab2RCaWdJbnRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RCb29sZWFuXCJdID0gXCJab2RCb29sZWFuXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kRGF0ZVwiXSA9IFwiWm9kRGF0ZVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFN5bWJvbFwiXSA9IFwiWm9kU3ltYm9sXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kVW5kZWZpbmVkXCJdID0gXCJab2RVbmRlZmluZWRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2ROdWxsXCJdID0gXCJab2ROdWxsXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kQW55XCJdID0gXCJab2RBbnlcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RVbmtub3duXCJdID0gXCJab2RVbmtub3duXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTmV2ZXJcIl0gPSBcIlpvZE5ldmVyXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kVm9pZFwiXSA9IFwiWm9kVm9pZFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEFycmF5XCJdID0gXCJab2RBcnJheVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE9iamVjdFwiXSA9IFwiWm9kT2JqZWN0XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kVW5pb25cIl0gPSBcIlpvZFVuaW9uXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kRGlzY3JpbWluYXRlZFVuaW9uXCJdID0gXCJab2REaXNjcmltaW5hdGVkVW5pb25cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RJbnRlcnNlY3Rpb25cIl0gPSBcIlpvZEludGVyc2VjdGlvblwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFR1cGxlXCJdID0gXCJab2RUdXBsZVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFJlY29yZFwiXSA9IFwiWm9kUmVjb3JkXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTWFwXCJdID0gXCJab2RNYXBcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RTZXRcIl0gPSBcIlpvZFNldFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEZ1bmN0aW9uXCJdID0gXCJab2RGdW5jdGlvblwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZExhenlcIl0gPSBcIlpvZExhenlcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RMaXRlcmFsXCJdID0gXCJab2RMaXRlcmFsXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kRW51bVwiXSA9IFwiWm9kRW51bVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEVmZmVjdHNcIl0gPSBcIlpvZEVmZmVjdHNcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2ROYXRpdmVFbnVtXCJdID0gXCJab2ROYXRpdmVFbnVtXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kT3B0aW9uYWxcIl0gPSBcIlpvZE9wdGlvbmFsXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTnVsbGFibGVcIl0gPSBcIlpvZE51bGxhYmxlXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kRGVmYXVsdFwiXSA9IFwiWm9kRGVmYXVsdFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZENhdGNoXCJdID0gXCJab2RDYXRjaFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFByb21pc2VcIl0gPSBcIlpvZFByb21pc2VcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RCcmFuZGVkXCJdID0gXCJab2RCcmFuZGVkXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kUGlwZWxpbmVcIl0gPSBcIlpvZFBpcGVsaW5lXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kUmVhZG9ubHlcIl0gPSBcIlpvZFJlYWRvbmx5XCI7XG59KShab2RGaXJzdFBhcnR5VHlwZUtpbmQgfHwgKFpvZEZpcnN0UGFydHlUeXBlS2luZCA9IHt9KSk7XG4vLyByZXF1aXJlcyBUUyA0LjQrXG5jbGFzcyBDbGFzcyB7XG4gICAgY29uc3RydWN0b3IoLi4uXykgeyB9XG59XG5jb25zdCBpbnN0YW5jZU9mVHlwZSA9IChcbi8vIGNvbnN0IGluc3RhbmNlT2ZUeXBlID0gPFQgZXh0ZW5kcyBuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk+KFxuY2xzLCBwYXJhbXMgPSB7XG4gICAgbWVzc2FnZTogYElucHV0IG5vdCBpbnN0YW5jZSBvZiAke2Nscy5uYW1lfWAsXG59KSA9PiBjdXN0b20oKGRhdGEpID0+IGRhdGEgaW5zdGFuY2VvZiBjbHMsIHBhcmFtcyk7XG5jb25zdCBzdHJpbmdUeXBlID0gWm9kU3RyaW5nLmNyZWF0ZTtcbmNvbnN0IG51bWJlclR5cGUgPSBab2ROdW1iZXIuY3JlYXRlO1xuY29uc3QgbmFuVHlwZSA9IFpvZE5hTi5jcmVhdGU7XG5jb25zdCBiaWdJbnRUeXBlID0gWm9kQmlnSW50LmNyZWF0ZTtcbmNvbnN0IGJvb2xlYW5UeXBlID0gWm9kQm9vbGVhbi5jcmVhdGU7XG5jb25zdCBkYXRlVHlwZSA9IFpvZERhdGUuY3JlYXRlO1xuY29uc3Qgc3ltYm9sVHlwZSA9IFpvZFN5bWJvbC5jcmVhdGU7XG5jb25zdCB1bmRlZmluZWRUeXBlID0gWm9kVW5kZWZpbmVkLmNyZWF0ZTtcbmNvbnN0IG51bGxUeXBlID0gWm9kTnVsbC5jcmVhdGU7XG5jb25zdCBhbnlUeXBlID0gWm9kQW55LmNyZWF0ZTtcbmNvbnN0IHVua25vd25UeXBlID0gWm9kVW5rbm93bi5jcmVhdGU7XG5jb25zdCBuZXZlclR5cGUgPSBab2ROZXZlci5jcmVhdGU7XG5jb25zdCB2b2lkVHlwZSA9IFpvZFZvaWQuY3JlYXRlO1xuY29uc3QgYXJyYXlUeXBlID0gWm9kQXJyYXkuY3JlYXRlO1xuY29uc3Qgb2JqZWN0VHlwZSA9IFpvZE9iamVjdC5jcmVhdGU7XG5jb25zdCBzdHJpY3RPYmplY3RUeXBlID0gWm9kT2JqZWN0LnN0cmljdENyZWF0ZTtcbmNvbnN0IHVuaW9uVHlwZSA9IFpvZFVuaW9uLmNyZWF0ZTtcbmNvbnN0IGRpc2NyaW1pbmF0ZWRVbmlvblR5cGUgPSBab2REaXNjcmltaW5hdGVkVW5pb24uY3JlYXRlO1xuY29uc3QgaW50ZXJzZWN0aW9uVHlwZSA9IFpvZEludGVyc2VjdGlvbi5jcmVhdGU7XG5jb25zdCB0dXBsZVR5cGUgPSBab2RUdXBsZS5jcmVhdGU7XG5jb25zdCByZWNvcmRUeXBlID0gWm9kUmVjb3JkLmNyZWF0ZTtcbmNvbnN0IG1hcFR5cGUgPSBab2RNYXAuY3JlYXRlO1xuY29uc3Qgc2V0VHlwZSA9IFpvZFNldC5jcmVhdGU7XG5jb25zdCBmdW5jdGlvblR5cGUgPSBab2RGdW5jdGlvbi5jcmVhdGU7XG5jb25zdCBsYXp5VHlwZSA9IFpvZExhenkuY3JlYXRlO1xuY29uc3QgbGl0ZXJhbFR5cGUgPSBab2RMaXRlcmFsLmNyZWF0ZTtcbmNvbnN0IGVudW1UeXBlID0gWm9kRW51bS5jcmVhdGU7XG5jb25zdCBuYXRpdmVFbnVtVHlwZSA9IFpvZE5hdGl2ZUVudW0uY3JlYXRlO1xuY29uc3QgcHJvbWlzZVR5cGUgPSBab2RQcm9taXNlLmNyZWF0ZTtcbmNvbnN0IGVmZmVjdHNUeXBlID0gWm9kRWZmZWN0cy5jcmVhdGU7XG5jb25zdCBvcHRpb25hbFR5cGUgPSBab2RPcHRpb25hbC5jcmVhdGU7XG5jb25zdCBudWxsYWJsZVR5cGUgPSBab2ROdWxsYWJsZS5jcmVhdGU7XG5jb25zdCBwcmVwcm9jZXNzVHlwZSA9IFpvZEVmZmVjdHMuY3JlYXRlV2l0aFByZXByb2Nlc3M7XG5jb25zdCBwaXBlbGluZVR5cGUgPSBab2RQaXBlbGluZS5jcmVhdGU7XG5jb25zdCBvc3RyaW5nID0gKCkgPT4gc3RyaW5nVHlwZSgpLm9wdGlvbmFsKCk7XG5jb25zdCBvbnVtYmVyID0gKCkgPT4gbnVtYmVyVHlwZSgpLm9wdGlvbmFsKCk7XG5jb25zdCBvYm9vbGVhbiA9ICgpID0+IGJvb2xlYW5UeXBlKCkub3B0aW9uYWwoKTtcbmV4cG9ydCBjb25zdCBjb2VyY2UgPSB7XG4gICAgc3RyaW5nOiAoKGFyZykgPT4gWm9kU3RyaW5nLmNyZWF0ZSh7IC4uLmFyZywgY29lcmNlOiB0cnVlIH0pKSxcbiAgICBudW1iZXI6ICgoYXJnKSA9PiBab2ROdW1iZXIuY3JlYXRlKHsgLi4uYXJnLCBjb2VyY2U6IHRydWUgfSkpLFxuICAgIGJvb2xlYW46ICgoYXJnKSA9PiBab2RCb29sZWFuLmNyZWF0ZSh7XG4gICAgICAgIC4uLmFyZyxcbiAgICAgICAgY29lcmNlOiB0cnVlLFxuICAgIH0pKSxcbiAgICBiaWdpbnQ6ICgoYXJnKSA9PiBab2RCaWdJbnQuY3JlYXRlKHsgLi4uYXJnLCBjb2VyY2U6IHRydWUgfSkpLFxuICAgIGRhdGU6ICgoYXJnKSA9PiBab2REYXRlLmNyZWF0ZSh7IC4uLmFyZywgY29lcmNlOiB0cnVlIH0pKSxcbn07XG5leHBvcnQgeyBhbnlUeXBlIGFzIGFueSwgYXJyYXlUeXBlIGFzIGFycmF5LCBiaWdJbnRUeXBlIGFzIGJpZ2ludCwgYm9vbGVhblR5cGUgYXMgYm9vbGVhbiwgZGF0ZVR5cGUgYXMgZGF0ZSwgZGlzY3JpbWluYXRlZFVuaW9uVHlwZSBhcyBkaXNjcmltaW5hdGVkVW5pb24sIGVmZmVjdHNUeXBlIGFzIGVmZmVjdCwgZW51bVR5cGUgYXMgZW51bSwgZnVuY3Rpb25UeXBlIGFzIGZ1bmN0aW9uLCBpbnN0YW5jZU9mVHlwZSBhcyBpbnN0YW5jZW9mLCBpbnRlcnNlY3Rpb25UeXBlIGFzIGludGVyc2VjdGlvbiwgbGF6eVR5cGUgYXMgbGF6eSwgbGl0ZXJhbFR5cGUgYXMgbGl0ZXJhbCwgbWFwVHlwZSBhcyBtYXAsIG5hblR5cGUgYXMgbmFuLCBuYXRpdmVFbnVtVHlwZSBhcyBuYXRpdmVFbnVtLCBuZXZlclR5cGUgYXMgbmV2ZXIsIG51bGxUeXBlIGFzIG51bGwsIG51bGxhYmxlVHlwZSBhcyBudWxsYWJsZSwgbnVtYmVyVHlwZSBhcyBudW1iZXIsIG9iamVjdFR5cGUgYXMgb2JqZWN0LCBvYm9vbGVhbiwgb251bWJlciwgb3B0aW9uYWxUeXBlIGFzIG9wdGlvbmFsLCBvc3RyaW5nLCBwaXBlbGluZVR5cGUgYXMgcGlwZWxpbmUsIHByZXByb2Nlc3NUeXBlIGFzIHByZXByb2Nlc3MsIHByb21pc2VUeXBlIGFzIHByb21pc2UsIHJlY29yZFR5cGUgYXMgcmVjb3JkLCBzZXRUeXBlIGFzIHNldCwgc3RyaWN0T2JqZWN0VHlwZSBhcyBzdHJpY3RPYmplY3QsIHN0cmluZ1R5cGUgYXMgc3RyaW5nLCBzeW1ib2xUeXBlIGFzIHN5bWJvbCwgZWZmZWN0c1R5cGUgYXMgdHJhbnNmb3JtZXIsIHR1cGxlVHlwZSBhcyB0dXBsZSwgdW5kZWZpbmVkVHlwZSBhcyB1bmRlZmluZWQsIHVuaW9uVHlwZSBhcyB1bmlvbiwgdW5rbm93blR5cGUgYXMgdW5rbm93biwgdm9pZFR5cGUgYXMgdm9pZCwgfTtcbmV4cG9ydCBjb25zdCBORVZFUiA9IElOVkFMSUQ7XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHNpemluZy50cyBcdTIwMTQgU2hhcmVkIHBlci1ibG9jayBzaXppbmcgZnJhZ21lbnQgKHZhcmlhYmxlIGJsb2NrIHNpemluZywgRHJvcCAxKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE9uZSB1bmlmaWVkIG1lY2hhbmlzbSBmb3IgXCJ0aGlzIGJsb2NrIHJlbmRlcnMgbmFycm93ZXIgdGhhbiBpdHMgY29udGFpbmVyXCI6XG4vLyBhbiBvcHRpb25hbCB3aWR0aCBGUkFDVElPTiBwbHVzIGFuIG9wdGlvbmFsIGFsaWdubWVudC4gQXBwbGllZCB0b2RheSB0b1xuLy8gSW1hZ2VCbG9jayBhbmQgTWF0aEJsb2NrICh0aGUgc2l6YWJsZSBzZXQgd2l0aCBhIHJlYWwgYXV0aG9yaW5nIHN1cmZhY2UpO1xuLy8gZXh0ZW5kcyB0byBvdGhlciBibG9ja3MgYWRkaXRpdmVseSB3aGVuIHRoZWlyIGVkaXRpbmcgVUkgbGFuZHMuIERlc2lnbjpcbi8vIGRvY3MvZGVzaWduL3ZhcmlhYmxlLWJsb2NrLXNpemluZy5tZC5cbi8vXG4vLyBSZWZsb3ctc2FmZSBieSBjb25zdHJ1Y3Rpb246IHdpZHRoIGlzIHJlbGF0aXZlIChhIGZyYWN0aW9uIG9mIHdoYXRldmVyXG4vLyBjb250YWluZXIgdGhlIGJsb2NrIHNpdHMgaW4gXHUyMDE0IHBhZ2Ugb3IgY29sdW1uIGNlbGwpLCBuZXZlciBhYnNvbHV0ZSBwaXhlbHMsXG4vLyBhbmQgYSBuYXJyb3dlZCBibG9jayBzdGF5cyBpbiBub3JtYWwgZmxvdyAobm8gd3JhcC1hcm91bmQvZmxvYXQpLCBzbyBwcmludFxuLy8gcGFnaW5hdGlvbiBhbmQgdGhlIGZvbGRhYmxlJ3MgaGVpZ2h0IG1lYXN1cmVtZW50IGtlZXAgd29ya2luZy5cbi8vXG4vLyB3aWR0aCBcdTIwMTQgZnJhY3Rpb24gb2YgdGhlIGNvbnRhaW5lcidzIGNvbnRlbnQgd2lkdGgsIGluICgwLCAxXS4gQWJzZW50ID0gZnVsbFxuLy8gd2lkdGggKHRvZGF5J3MgYmVoYXZpb3IpLiBUaGUgZWRpdG9yIFVJIHNuYXBzIHRvIGNsZWFuIHN0b3BzICgyNS8zMy81MC82Ni9cbi8vIDc1LzEwMCUpIGJ1dCB0aGUgc2NoZW1hIGFjY2VwdHMgYW55IGZyYWN0aW9uIHNvIGZpbmUtZ3JhaW5lZCBkcmFncyB2YWxpZGF0ZS5cbi8vXG4vLyBhbGlnbiBcdTIwMTQgd2hlcmUgdGhlIG5hcnJvd2VkIGJsb2NrIHNpdHMgaG9yaXpvbnRhbGx5LiBBYnNlbnQgPSBjZW50ZXIgKHRoZVxuLy8gbmF0dXJhbCByZWFkIGZvciBmaWd1cmVzIG9uIGEgd29ya3NoZWV0KTsgb25seSBtZWFuaW5nZnVsIHdoZW4gd2lkdGggaXNcbi8vIHByZXNlbnQsIGFuZCB0aGUgcmVuZGVyZXIgaWdub3JlcyBpdCBvdGhlcndpc2UuIFN0b3JlZCBvbmx5IHdoZW4gd2lkdGggaXNcbi8vIHNldCBhbmQgdGhlIHZhbHVlIGlzICdsZWZ0Jy8ncmlnaHQnLCBzbyByb3VuZC10cmlwIGVxdWFsaXR5IGhvbGRzIGZvciB0aGVcbi8vIGRlZmF1bHQgY2FzZS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG5leHBvcnQgY29uc3QgQmxvY2tBbGlnbiA9IHouZW51bShbJ2xlZnQnLCAnY2VudGVyJywgJ3JpZ2h0J10pO1xuZXhwb3J0IHR5cGUgQmxvY2tBbGlnbiA9IHouaW5mZXI8dHlwZW9mIEJsb2NrQWxpZ24+O1xuXG4vLyBGcmFjdGlvbiBvZiBjb250YWluZXIgd2lkdGguIGd0KDApIG5vdCBtaW4oMCkgXHUyMDE0IGEgemVyby13aWR0aCBibG9jayBpcyBhXG4vLyBoaWRkZW4gYmxvY2ssIHdoaWNoIGlzIGEgZGlmZmVyZW50IChub25leGlzdGVudCkgZmVhdHVyZS5cbmV4cG9ydCBjb25zdCBCbG9ja1dpZHRoRnJhY3Rpb24gPSB6Lm51bWJlcigpLmd0KDApLm1heCgxKTtcblxuLy8gU3ByZWFkIGludG8gYSBibG9jaydzIHoub2JqZWN0KHsuLi59KSBzaGFwZS4gQSBwbGFpbiBvYmplY3QgKG5vdCBhIFpvZFxuLy8gc2NoZW1hKSBzbyBlYWNoIGJsb2NrIGtlZXBzIGEgZmxhdCBmaWVsZCBsaXN0IGFuZCBkaXNjcmltaW5hdGVkVW5pb24ga2VlcHNcbi8vIHdvcmtpbmcgdW50b3VjaGVkLlxuZXhwb3J0IGNvbnN0IHNpemluZ0ZpZWxkcyA9IHtcbiAgd2lkdGg6IEJsb2NrV2lkdGhGcmFjdGlvbi5vcHRpb25hbCgpLFxuICBhbGlnbjogQmxvY2tBbGlnbi5vcHRpb25hbCgpLFxufTtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IHNpemluZ0ZpZWxkcyB9IGZyb20gJy4uL3NpemluZy5qcyc7XG5cbi8vIEEgY3JvcCB3aW5kb3c6IHRoZSB2aXNpYmxlIHJlY3RhbmdsZSBpbnNpZGUgdGhlIHNvdXJjZSBpbWFnZSwgYXMgZnJhY3Rpb25zIG9mXG4vLyB0aGUgc291cmNlJ3Mgb3duIHdpZHRoL2hlaWdodC4geCx5ID0gdG9wLWxlZnQgb2YgdGhlIHdpbmRvdzsgdyxoID0gaXRzIHNpemUuXG4vLyBUaGUgd2luZG93IG11c3Qgc3RheSBpbnNpZGUgdGhlIHNvdXJjZSAoeCt3IFx1MjI2NCAxLCB5K2ggXHUyMjY0IDEpLiBBIHRpbnkgZXBzaWxvblxuLy8gYWJzb3JicyBmbG9hdCBlcnJvciBmcm9tIHRoZSBlZGl0b3IncyBweFx1MjE5MmZyYWN0aW9uIG1hdGguIFRoZSByZW5kZXJlciBpcyBwdXJlXG4vLyAobm8gaW1hZ2UgZGltZW5zaW9ucyksIHNvIHRoZSBjcm9wIHBpeGVsIGFzcGVjdCBpcyBkZXJpdmVkIGZyb20gdGhlIHNlcGFyYXRlbHlcbi8vIHN0b3JlZCBgc3JjQXNwZWN0YCAoc2VlIEltYWdlQmxvY2spLiBEZXNpZ246IGRvY3MvZGVzaWduL2ltYWdlLWNyb3AubWQuXG5jb25zdCBDUk9QX0VQU0lMT04gPSAxZS02O1xuZXhwb3J0IGNvbnN0IENyb3BSZWN0ID0gelxuICAub2JqZWN0KHtcbiAgICB4OiB6Lm51bWJlcigpLm1pbigwKS5sdCgxKSxcbiAgICB5OiB6Lm51bWJlcigpLm1pbigwKS5sdCgxKSxcbiAgICB3OiB6Lm51bWJlcigpLmd0KDApLm1heCgxKSxcbiAgICBoOiB6Lm51bWJlcigpLmd0KDApLm1heCgxKSxcbiAgfSlcbiAgLnJlZmluZShcbiAgICAoYykgPT4gYy54ICsgYy53IDw9IDEgKyBDUk9QX0VQU0lMT04gJiYgYy55ICsgYy5oIDw9IDEgKyBDUk9QX0VQU0lMT04sXG4gICAgeyBtZXNzYWdlOiAnY3JvcCB3aW5kb3cgbXVzdCBzdGF5IHdpdGhpbiB0aGUgc291cmNlICh4K3cgXHUyMjY0IDEsIHkraCBcdTIyNjQgMSknIH0sXG4gICk7XG5leHBvcnQgdHlwZSBDcm9wUmVjdCA9IHouaW5mZXI8dHlwZW9mIENyb3BSZWN0PjtcblxuLy8gUGhhc2UgMTogVVJMLW9ubHkuIE5vIHVwbG9hZCBwaXBlbGluZTsgdGVhY2hlcnMgcGFzdGUgYSBwdWJsaWMgVVJMLlxuLy8gUGhhc2UgMis6IGEgc2VwYXJhdGUgdmFyaWFudCB3aXRoIGEgU3VwYWJhc2UgU3RvcmFnZSB1cGxvYWQsIHdpdGggc3JjXG4vLyBwb2ludGluZyB0byBhIHNpZ25lZCBVUkwuIFNjaGVtYSBpcyBmb3J3YXJkLWNvbXBhdGlibGUgXHUyMDE0IGFkZGluZyBhIG5ld1xuLy8gYHNvdXJjZWAgZGlzY3JpbWluYXRvciBmaWVsZCBsYXRlciBpcyBub24tYnJlYWtpbmcgaWYgZXhpc3Rpbmcgcm93cyBhcmVcbi8vIHRyZWF0ZWQgYXMgYHNvdXJjZTogJ3VybCdgIGJ5IGRlZmF1bHQuXG5leHBvcnQgY29uc3QgSW1hZ2VCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2ltYWdlJyksXG4gIHNyYzogei5zdHJpbmcoKS51cmwoKSxcbiAgLy8gYWx0IGlzIHJlcXVpcmVkIGZvciBhY2Nlc3NpYmlsaXR5IGJ1dCBkZWZhdWx0cyB0byBlbXB0eSBzdHJpbmcgZm9yXG4gIC8vIGRlY29yYXRpdmUgaW1hZ2VzLiBFZGl0b3JzIHNob3VsZCB3YXJuIChub3QgYmxvY2spIG9uIGVtcHR5IGFsdC5cbiAgYWx0OiB6LnN0cmluZygpLmRlZmF1bHQoJycpLFxuICBjYXB0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIC8vIFZhcmlhYmxlIGJsb2NrIHNpemluZzogb3B0aW9uYWwgd2lkdGggZnJhY3Rpb24gKyBhbGlnbm1lbnQgKHNpemluZy50cykuXG4gIC8vIFRoaXMgSVMgdGhlIGltYWdlIGRpc3BsYXktc2l6ZSBtZWNoYW5pc20gXHUyMDE0IG5vIHNlcGFyYXRlIGludHJpbnNpYyBzaXplLlxuICAuLi5zaXppbmdGaWVsZHMsXG4gIC8vIENyb3AgKHJlZnJhbWUpIFx1MjAxNCB0aGUgdmlzaWJsZSBzdWItcmVjdGFuZ2xlIG9mIHRoZSBzb3VyY2UgKGRvY3MvZGVzaWduL1xuICAvLyBpbWFnZS1jcm9wLm1kKS4gYHNyY0FzcGVjdGAgKHRoZSBzb3VyY2UncyBuYXR1cmFsIFcvSCByYXRpbykgbGV0cyB0aGUgcHVyZVxuICAvLyByZW5kZXJlciBkZXJpdmUgdGhlIGNyb3AgcGl4ZWwgYXNwZWN0IEEgPSBzcmNBc3BlY3RcdTAwQjcody9oKSB3aXRob3V0IHJlYWRpbmdcbiAgLy8gaW1hZ2UgZGltZW5zaW9ucy4gU3RvcmVkIEJPVEgtT1ItTkVJVEhFUjogYW4gdW5jcm9wcGVkIGltYWdlIGNhcnJpZXNcbiAgLy8gbmVpdGhlciAoYnl0ZS1pZGVudGljYWwgdG8gdG9kYXkpLiBUaGUgcGFpcmluZyBpcyBlbmZvcmNlZCBpbiB0aGUgZWRpdG9yICtcbiAgLy8gc2VyaWFsaXplIChub3QgYSBzY2hlbWEgLnJlZmluZSBcdTIwMTQgSW1hZ2VCbG9jayBpcyBhIGRpc2NyaW1pbmF0ZWRVbmlvbiBtZW1iZXJcbiAgLy8gYW5kIHJlZmluZWQgb2JqZWN0cyBjYW4ndCBiZSBkaXNjcmltaW5hdGVkKTsgc2VlIHNlcmlhbGl6ZS50cyArIENSLUlOVi1ib3RoLlxuICBjcm9wOiBDcm9wUmVjdC5vcHRpb25hbCgpLFxuICBzcmNBc3BlY3Q6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBJbWFnZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgSW1hZ2VCbG9jaz47XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGdyYXBoLXByaW1pdGl2ZXMudHMgXHUyMDE0IGNvb3JkaW5hdGUtcGxhbmUgcHJpbWl0aXZlcywgZGVwZW5kZW5jeS1mcmVlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGF4aXMgLyBmdW5jdGlvbi1tb2RlbCAvIGRyYXdhYmxlIHZvY2FidWxhcnkgc2hhcmVkIGJ5IGV2ZXJ5IGdyYXBoLXNoYXBlZFxuLy8gc3VyZmFjZTogaW50ZXJhY3RpdmVfZ3JhcGggKHRoZSBncmFkZWQgYmxvY2spLCBncmFwaF9maWd1cmUgKHRoZSBzdGF0aWNcbi8vIHBpY3R1cmUpLCBtdWx0aXBsZV9jaG9pY2UgY2hvaWNlIGZpZ3VyZXMsIG1hdGNoaW5nIHNpZGVzLCBudW1iZXJfbGluZVxuLy8gKEVuZHBvaW50U3R5bGUpLCBhbmQgZGF0YV9wbG90LlxuLy9cbi8vIFRoZXNlIHNjaGVtYXMgbGl2ZSBIRVJFLCBpbiBhIGxlYWYgbW9kdWxlIHRoYXQgaW1wb3J0cyBub3RoaW5nIGJ1dCB6b2QsXG4vLyByYXRoZXIgdGhhbiBpbiBibG9ja3MvaW50ZXJhY3RpdmUtZ3JhcGgudHMgd2hlcmUgdGhleSBncmV3IHVwLiBUaGUgcmVhc29uIGlzXG4vLyBhIGhhcmQgb25lLCBub3QgdGlkaW5lc3M6IGludGVyYWN0aXZlLWdyYXBoLnRzIGltcG9ydHMgSW5saW5lTm9kZSBmcm9tXG4vLyBpbmxpbmUudHMgKGl0cyBwcm9tcHQvZmVlZGJhY2svc29sdXRpb24gZmllbGRzKSwgc28gYW55dGhpbmcgcmVhY2hpbmcgdGhlc2Vcbi8vIHByaW1pdGl2ZXMgVEhST1VHSCBpdCBpbmhlcml0cyBhIGRlcGVuZGVuY3kgb24gaW5saW5lLnRzLiBXaGVuIGlubGluZS50c1xuLy8gaXRzZWxmIG5lZWRzIHRoZW0gXHUyMDE0IERlZmluaXRpb25CbG9jayBhZG1pdHMgYSBncmFwaF9maWd1cmUsIHNlZSBpbmxpbmUudHMgXHUyMDE0XG4vLyB0aGF0IGNsb3NlcyB0aGUgY3ljbGUgaW5saW5lLnRzIC0+IGdyYXBoLWZpZ3VyZS50cyAtPiBpbnRlcmFjdGl2ZS1ncmFwaC50cyAtPlxuLy8gaW5saW5lLnRzLCBhbmQgdGhlIGN5Y2xlIGlzIGZhdGFsIHJhdGhlciB0aGFuIGNvc21ldGljOiBpbnRlcmFjdGl2ZS1ncmFwaC50c1xuLy8gZXZhbHVhdGVzIGB6LmFycmF5KElubGluZU5vZGUpYCBhdCBtb2R1bGUgc2NvcGUsIHNvIGEgcGFydGlhbGx5LWluaXRpYWxpemVkXG4vLyBpbmxpbmUuanMgdGhyb3dzIGEgVERaIFJlZmVyZW5jZUVycm9yIGF0IGltcG9ydCB0aW1lLlxuLy9cbi8vIGJsb2Nrcy9pbnRlcmFjdGl2ZS1ncmFwaC50cyByZS1leHBvcnRzIGV2ZXJ5dGhpbmcgaGVyZSwgc28gZXZlcnkgZXhpc3Rpbmdcbi8vIGltcG9ydGVyIGtlZXBzIGl0cyBjdXJyZW50IGltcG9ydCBwYXRoIGFuZCBpZGVudGl0eSBcdTIwMTQgbm90aGluZyBtb3ZlZCBmcm9tIGFcbi8vIGNvbnN1bWVyJ3MgcG9pbnQgb2Ygdmlldy4gTmV3IGlubGluZS1yZWFjaGFibGUgY29kZSAoZ3JhcGgtZmlndXJlLnRzKSBpbXBvcnRzXG4vLyBmcm9tIHRoaXMgbW9kdWxlIGRpcmVjdGx5LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5cbi8vIC0tLS0gQXhpcyBjb25maWd1cmF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgY29vcmRpbmF0ZSBwbGFuZSB0aGUgc3R1ZGVudCB3b3JrcyBpbi4gR3JhcGggdW5pdHMgdGhyb3VnaG91dCBcdTIwMTQgdG9sZXJhbmNlXG4vLyBhbmQgZ3JpZCBzdGVwcyBhcmUgaW4gdGhlIHNhbWUgdW5pdHMsIG5ldmVyIHBpeGVscywgc28gYSBwdWJsaXNoZWQgcGFnZSB0aGF0XG4vLyByZS1sYXlzLW91dCBhdCBhIGRpZmZlcmVudCBzaXplIHN0aWxsIHNjb3JlcyBpZGVudGljYWxseS5cbmV4cG9ydCBjb25zdCBBeGlzQ29uZmlnID0gei5vYmplY3Qoe1xuICB4TWluOiB6Lm51bWJlcigpLFxuICB4TWF4OiB6Lm51bWJlcigpLFxuICB5TWluOiB6Lm51bWJlcigpLFxuICB5TWF4OiB6Lm51bWJlcigpLFxuICB4R3JpZFN0ZXA6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5kZWZhdWx0KDEpLFxuICB5R3JpZFN0ZXA6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5kZWZhdWx0KDEpLFxuICBzaG93R3JpZDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgLy8gV2hlbiB0cnVlLCBhIGRyYWdnZWQgaGFuZGxlIHNuYXBzIHRvIHRoZSBuZWFyZXN0IGdyaWQgaW50ZXJzZWN0aW9uLiBLZXlib2FyZFxuICAvLyBudWRnZSBhbHdheXMgbW92ZXMgYnkgb25lIGdyaWQgc3RlcCByZWdhcmRsZXNzIChTaGlmdCA9IDAuMSBzdGVwLCBmaW5lKS5cbiAgc25hcFRvR3JpZDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbn0pO1xuZXhwb3J0IHR5cGUgQXhpc0NvbmZpZyA9IHouaW5mZXI8dHlwZW9mIEF4aXNDb25maWc+O1xuXG4vLyAtLS0tIEVuZHBvaW50IHN0eWxlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gb3BlbiA9IGhvbGxvdyBkb3QsIHZhbHVlIEVYQ0xVREVEIChhIHN0cmljdCBpbmVxdWFsaXR5IGJvdW5kYXJ5LCBhbiBvcGVuXG4vLyBpbnRlcnZhbCBlbmQpOyBjbG9zZWQgPSBmaWxsZWQgZG90LCB2YWx1ZSBJTkNMVURFRC4gQSBzaGFyZWQgdm9jYWJ1bGFyeSB1c2VkXG4vLyBieSBpbmVxdWFsaXR5IGJvdW5kYXJpZXMgKERyb3AgNDogc3RyaWN0IFx1MjE5MiBvcGVuKSwgZG9tYWluLXJlc3RyaWN0ZWQgcmF5cyBhbmRcbi8vIHNlZ21lbnRzIChEcm9wIDYpLCBkaXNwbGF5IHNlZ21lbnRzLCBhbmQgdGhlIGZ1dHVyZSBudW1iZXItbGluZSBmYW1pbHkuIEFkZGVkXG4vLyBhcyBhIGZvdW5kYXRpb24gbm93IChEcm9wIDIpOyBjb25zdW1lcnMgcmVuZGVyL3Njb3JlIGl0IGluIHRoZWlyIG93biBkcm9wcy5cbmV4cG9ydCBjb25zdCBFbmRwb2ludFN0eWxlID0gei5lbnVtKFsnb3BlbicsICdjbG9zZWQnXSk7XG5leHBvcnQgdHlwZSBFbmRwb2ludFN0eWxlID0gei5pbmZlcjx0eXBlb2YgRW5kcG9pbnRTdHlsZT47XG5cbi8vIERvbWFpbiByZXN0cmljdGlvbiBvbiBhIGRyYXduIGN1cnZlIChEcm9wIDUvNik6IHJheXMgYW5kIHNlZ21lbnRzIG9mIGFcbi8vIGZ1bmN0aW9uLiBTdHlsZXMgbWFyayB3aGV0aGVyIGVhY2ggZW5kcG9pbnQgaXMgaW5jbHVkZWQgKGNsb3NlZCkgb3Igbm90LlxuZXhwb3J0IGNvbnN0IEN1cnZlRG9tYWluID0gei5vYmplY3Qoe1xuICBtaW46IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgbWluU3R5bGU6IEVuZHBvaW50U3R5bGUub3B0aW9uYWwoKSxcbiAgbWF4OiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIG1heFN0eWxlOiBFbmRwb2ludFN0eWxlLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIEN1cnZlRG9tYWluID0gei5pbmZlcjx0eXBlb2YgQ3VydmVEb21haW4+O1xuXG4vLyAtLS0tIEZ1bmN0aW9uIG1vZGVscyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRWFjaCBmYW1pbHkgY2FycmllcyBpdHMgcGFyYW1ldGVycyArIGEgcGVyLXBhcmFtZXRlciB0b2xlcmFuY2UsIGFuZCBpdHNcbi8vIHBhcmFtZXRlciBuYW1lcyBNQVRDSCB0aGUga2l0J3MgcmVncmVzc2lvbiBmaXR0ZXJzIChncmFwaC1raXQgZml0TGluZWFyIC9cbi8vIGZpdFF1YWRyYXRpYyAvIGZpdEV4cG9uZW50aWFsIC8gZml0TG9nYXJpdGhtaWMpIHNvIGEgZml0dGVkIGN1cnZlIHNjb3Jlc1xuLy8gYWdhaW5zdCB0aGUga2V5IHdpdGggbm8gdHJhbnNsYXRpb24uIEZvcm1zOlxuLy8gICBsaW5lYXIgICAgICAgeSA9IHNsb3BlXHUwMEI3eCArIGludGVyY2VwdFxuLy8gICBxdWFkcmF0aWMgICAgeSA9IGFcdTAwQjd4XHUwMEIyICsgYlx1MDBCN3ggKyBjXG4vLyAgIGV4cG9uZW50aWFsICB5ID0gYVx1MDBCN2JcdTAyRTMgICAgICAgICAgICAoYiA+IDApXG4vLyAgIGxvZ2FyaXRobWljICB5ID0gYSArIGJcdTAwQjdsbih4KSAgICAgKHggPiAwKVxuLy8gICB2ZXJ0aWNhbCAgICAgeCA9IGsgICAgICAgICAgICAgICAoTk9UIGEgeSA9IGYoeCkgY3VydmUgXHUyMDE0IHNjb3JlZCBvbiB4KVxuZXhwb3J0IGNvbnN0IExpbmVhck1vZGVsID0gei5vYmplY3Qoe1xuICBmYW1pbHk6IHoubGl0ZXJhbCgnbGluZWFyJyksXG4gIHNsb3BlOiB6Lm51bWJlcigpLFxuICBpbnRlcmNlcHQ6IHoubnVtYmVyKCksXG4gIHNsb3BlVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBpbnRlcmNlcHRUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIExpbmVhck1vZGVsID0gei5pbmZlcjx0eXBlb2YgTGluZWFyTW9kZWw+O1xuXG5leHBvcnQgY29uc3QgUXVhZHJhdGljTW9kZWwgPSB6Lm9iamVjdCh7XG4gIGZhbWlseTogei5saXRlcmFsKCdxdWFkcmF0aWMnKSxcbiAgYTogei5udW1iZXIoKSxcbiAgYjogei5udW1iZXIoKSxcbiAgYzogei5udW1iZXIoKSxcbiAgYVRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgYlRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgY1RvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgUXVhZHJhdGljTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBRdWFkcmF0aWNNb2RlbD47XG5cbmV4cG9ydCBjb25zdCBFeHBvbmVudGlhbE1vZGVsID0gei5vYmplY3Qoe1xuICBmYW1pbHk6IHoubGl0ZXJhbCgnZXhwb25lbnRpYWwnKSxcbiAgYTogei5udW1iZXIoKSxcbiAgYjogei5udW1iZXIoKSxcbiAgYVRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgYlRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgRXhwb25lbnRpYWxNb2RlbCA9IHouaW5mZXI8dHlwZW9mIEV4cG9uZW50aWFsTW9kZWw+O1xuXG5leHBvcnQgY29uc3QgTG9nYXJpdGhtaWNNb2RlbCA9IHoub2JqZWN0KHtcbiAgZmFtaWx5OiB6LmxpdGVyYWwoJ2xvZ2FyaXRobWljJyksXG4gIGE6IHoubnVtYmVyKCksXG4gIGI6IHoubnVtYmVyKCksXG4gIGFUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG4gIGJUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIExvZ2FyaXRobWljTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBMb2dhcml0aG1pY01vZGVsPjtcblxuLy8gQSB2ZXJ0aWNhbCBsaW5lIHggPSBrLiBJdCBoYXMgbm8geSA9IGYoeCkgcmVwcmVzZW50YXRpb24gKGluZmluaXRlIHNsb3BlKSwgc29cbi8vIGl0IGNhbid0IHJpZGUgdGhlIHJlZ3Jlc3Npb24gZml0dGVycyBcdTIwMTQgdGhlIGtpdCBzY29yZXMgaXQgZGlyZWN0bHkgb24gdGhlXG4vLyBzdHVkZW50J3MgeC4gS2VwdCBpbiBGdW5jdGlvbk1vZGVsIChub3QgYSBzZXBhcmF0ZSBpbnRlcmFjdGlvbikgc28gYXV0aG9yaW5nIGFcbi8vIHZlcnRpY2FsIGxpbmUgaXMgdGhlIHNhbWUgXCJ0eXBlIGFuIGVxdWF0aW9uXCIgZmxvdyBhcyBhbnkgb3RoZXIgZmFtaWx5LlxuZXhwb3J0IGNvbnN0IFZlcnRpY2FsTW9kZWwgPSB6Lm9iamVjdCh7XG4gIGZhbWlseTogei5saXRlcmFsKCd2ZXJ0aWNhbCcpLFxuICB4OiB6Lm51bWJlcigpLFxuICB4VG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxufSk7XG5leHBvcnQgdHlwZSBWZXJ0aWNhbE1vZGVsID0gei5pbmZlcjx0eXBlb2YgVmVydGljYWxNb2RlbD47XG5cbi8vIERpc2NyaW1pbmF0ZWQgb24gYGZhbWlseWAgc28gY29uc3VtZXJzIGJyYW5jaCB1bmlmb3JtbHkuIEdyb3dpbmcgYSBmYW1pbHkgaXMgYVxuLy8gbmV3IG1lbWJlciBoZXJlICsgYSBuZXcgZml0L3Njb3JlIGJyYW5jaCBpbiB0aGUga2l0IFx1MjAxNCBubyBvdGhlciBibG9jayB0b3VjaGVkLlxuZXhwb3J0IGNvbnN0IEZ1bmN0aW9uTW9kZWwgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbignZmFtaWx5JywgW1xuICBMaW5lYXJNb2RlbCxcbiAgUXVhZHJhdGljTW9kZWwsXG4gIEV4cG9uZW50aWFsTW9kZWwsXG4gIExvZ2FyaXRobWljTW9kZWwsXG4gIFZlcnRpY2FsTW9kZWwsXG5dKTtcbmV4cG9ydCB0eXBlIEZ1bmN0aW9uTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBGdW5jdGlvbk1vZGVsPjtcblxuLy8gLS0tLSBEcmF3YWJsZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGBEcmF3YWJsZWAgaXMgZGlzY3JpbWluYXRlZCBvbiBga2luZGAuIGBjdXJ2ZWAgUkVVU0VTIEZ1bmN0aW9uTW9kZWwsIHNvIHRoZVxuLy8gZGF5IHF1YWRyYXRpYy9leHBvbmVudGlhbC9sb2dhcml0aG1pYyBsYW5kIHRoZXkgbGlnaHQgdXAgaGVyZSBBTkQgaW5cbi8vIHBsb3RfZnVuY3Rpb24gYXQgb25jZS4gQSBgbGFiZWxgIHRleHQtYW5ub3RhdGlvbiBkcmF3YWJsZSBpcyBkZWxpYmVyYXRlbHlcbi8vIGRlZmVycmVkIChwb2ludC5sYWJlbCBjb3ZlcnMgdGhlIGNvbW1vbiBjYXNlKSBcdTIwMTQgWUFHTkksIGFkZGl0aXZlIHdoZW4gbmVlZGVkLlxuLy8gQXV0aG9yZWQgcGVyLWRyYXdhYmxlIGNvbG9yLiBTdG9yZWQgYXMgYSBwYWxldHRlIEtFWSAobm90IGEgaGV4KSBzbyBjb2xvcnNcbi8vIHN0YXkgc2VtYW50aWM7IHRoZSBrZXkgbGlzdCBpcyBkZWZpbmVkIEhFUkUgKGRlcGVuZGVuY3ktZnJlZSkgYW5kIHRoZSBrZXkgLT5cbi8vIGhleCBtYXAgbGl2ZXMgaW4gQGFjdGl2aXR5L2dyYXBoLWtpdCdzIERSQVdBQkxFX1BBTEVUVEUuIEEgZHJpZnQgZ3VhcmQgdGVzdFxuLy8ga2VlcHMgdGhlIHR3byBsaXN0cyBpbiBsb2Nrc3RlcC4gT3B0aW9uYWw6IGFic2VudCA9IHRoZSBzaGFyZWQgZGVmYXVsdCBjb2xvci5cbmV4cG9ydCBjb25zdCBEcmF3YWJsZUNvbG9yID0gei5lbnVtKFtcbiAgJ2JsdWUnLFxuICAnaW5kaWdvJyxcbiAgJ3RlYWwnLFxuICAnZ3JlZW4nLFxuICAnYW1iZXInLFxuICAncmVkJyxcbiAgJ3Zpb2xldCcsXG4gICdzbGF0ZScsXG5dKTtcbmV4cG9ydCB0eXBlIERyYXdhYmxlQ29sb3JUID0gei5pbmZlcjx0eXBlb2YgRHJhd2FibGVDb2xvcj47XG5cbmNvbnN0IFBvaW50RHJhd2FibGUgPSB6Lm9iamVjdCh7XG4gIGtpbmQ6IHoubGl0ZXJhbCgncG9pbnQnKSxcbiAgYXQ6IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgbGFiZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgLy8gb3BlbiA9IGhvbGxvdyAoZXhjbHVkZWQpLCBjbG9zZWQgPSBmaWxsZWQuIERlZmF1bHQgY2xvc2VkLlxuICBzdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxuICBjb2xvcjogRHJhd2FibGVDb2xvci5vcHRpb25hbCgpLFxufSk7XG5jb25zdCBDdXJ2ZURyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ2N1cnZlJyksXG4gIG1vZGVsOiBGdW5jdGlvbk1vZGVsLFxuICAvLyBEcm9wIDU6IGRhc2hlZCBib3VuZGFyeSArIGhhbGYtcGxhbmUgc2hhZGluZyB0dXJuIGEgZGlzcGxheSBjdXJ2ZSBpbnRvIGFcbiAgLy8gcGljdHVyZWQgaW5lcXVhbGl0eTsgZG9tYWluIHJlc3RyaWN0cyBpdCB0byBhIHJheS9zZWdtZW50LlxuICBzdHlsZTogei5lbnVtKFsnc29saWQnLCAnZGFzaGVkJ10pLm9wdGlvbmFsKCksXG4gIHNoYWRlOiB6LmVudW0oWydhYm92ZScsICdiZWxvdycsICdsZWZ0JywgJ3JpZ2h0J10pLm9wdGlvbmFsKCksXG4gIGRvbWFpbjogQ3VydmVEb21haW4ub3B0aW9uYWwoKSxcbiAgLy8gQ29udGludWF0aW9uIGFycm93aGVhZHMgb24gVU5CT1VOREVEIGVuZHMgKHRleHRib29rIGNvbnZlbnRpb246IGFycm93ID1cbiAgLy8gXCJrZWVwcyBnb2luZ1wiLCBkb3QgPSBcInN0b3BzIGhlcmVcIikuIERyYXduIHdoZXJlIHRoZSBjdXJ2ZSBleGl0cyB0aGUgdmlzaWJsZVxuICAvLyB3aW5kb3c7IGFuIGF1dGhvcmVkIGRvbWFpbiBib3VuZCBzdXBwcmVzc2VzIHRoYXQgZW5kJ3MgYXJyb3cgKGl0IGdldHMgdGhlXG4gIC8vIG9wZW4vY2xvc2VkIGRvdCBpbnN0ZWFkKS4gdW5kZWZpbmVkID0gdHJ1ZSBcdTIwMTQgYXJyb3dzIGFyZSB0aGUgY29udmVudGlvbixcbiAgLy8gdGhpcyBmbGFnIGlzIHRoZSBvcHQtb3V0IChhdXRob3IgY2FsbCAyMDI2LTA3LTEwKS5cbiAgYXJyb3dzOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICBjb2xvcjogRHJhd2FibGVDb2xvci5vcHRpb25hbCgpLFxufSk7XG5cbi8vIERyb3AgNTogcGxvdCBBTlkgcGFyc2VhYmxlIGZvcm11bGEgKHNpbih4KSwgcmF0aW9uYWxzLCBcdTIwMjYpIGJ5IHNhbXBsaW5nIFx1MjAxNCB0aGVcbi8vIGVzY2FwZSBoYXRjaCB0aGUgZ3JhZGVkIGZhbWlsaWVzIGRlbGliZXJhdGVseSBkb24ndCBjb3Zlci4gRGlzcGxheS1vbmx5LlxuY29uc3QgRXhwcmVzc2lvbkRyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ2V4cHJlc3Npb24nKSxcbiAgZXhwcmVzc2lvbjogei5zdHJpbmcoKS5taW4oMSksXG4gIHN0eWxlOiB6LmVudW0oWydzb2xpZCcsICdkYXNoZWQnXSkub3B0aW9uYWwoKSxcbiAgLy8gQ29udGludWF0aW9uIGFycm93aGVhZHMgYXQgYm90aCB3aW5kb3cgZXhpdHMgKHNlZSBDdXJ2ZURyYXdhYmxlLmFycm93cykuXG4gIGFycm93czogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgY29sb3I6IERyYXdhYmxlQ29sb3Iub3B0aW9uYWwoKSxcbn0pO1xuY29uc3QgU2VnbWVudERyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ3NlZ21lbnQnKSxcbiAgZnJvbTogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICB0bzogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICAvLyBEcm9wIDU6IG9wZW4vY2xvc2VkIGVuZHBvaW50IGRvdHMgKFtmcm9tLCB0b10pLiBEZWZhdWx0IGNsb3NlZC5cbiAgZW5kcG9pbnRzOiB6LnR1cGxlKFtFbmRwb2ludFN0eWxlLCBFbmRwb2ludFN0eWxlXSkub3B0aW9uYWwoKSxcbiAgY29sb3I6IERyYXdhYmxlQ29sb3Iub3B0aW9uYWwoKSxcbn0pO1xuXG4vLyBEcm9wIDU6IGEgcmF5IFx1MjAxNCBzdGFydHMgYXQgYGZyb21gIChvcGVuL2Nsb3NlZCksIHBhc3NlcyB0aHJvdWdoIGB0aHJvdWdoYCxcbi8vIHJ1bnMgdG8gdGhlIHdpbmRvdyBlZGdlLiBUaGUgcGh5c2ljcy1jbGFzcyBzdGFwbGUuXG5jb25zdCBSYXlEcmF3YWJsZSA9IHoub2JqZWN0KHtcbiAga2luZDogei5saXRlcmFsKCdyYXknKSxcbiAgZnJvbTogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICB0aHJvdWdoOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIGZyb21TdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxuICAvLyBDb250aW51YXRpb24gYXJyb3doZWFkIG9uIHRoZSB1bmJvdW5kZWQgZW5kIChzZWUgQ3VydmVEcmF3YWJsZS5hcnJvd3MpLlxuICBhcnJvd3M6IHouYm9vbGVhbigpLm9wdGlvbmFsKCksXG4gIGNvbG9yOiBEcmF3YWJsZUNvbG9yLm9wdGlvbmFsKCksXG59KTtcbmNvbnN0IFBvbHlnb25EcmF3YWJsZSA9IHoub2JqZWN0KHtcbiAga2luZDogei5saXRlcmFsKCdwb2x5Z29uJyksXG4gIHZlcnRpY2VzOiB6LmFycmF5KHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSkubWluKDMpLFxuICBmaWxsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gIGNvbG9yOiBEcmF3YWJsZUNvbG9yLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCBjb25zdCBEcmF3YWJsZSA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCdraW5kJywgW1xuICBQb2ludERyYXdhYmxlLFxuICBDdXJ2ZURyYXdhYmxlLFxuICBFeHByZXNzaW9uRHJhd2FibGUsXG4gIFNlZ21lbnREcmF3YWJsZSxcbiAgUmF5RHJhd2FibGUsXG4gIFBvbHlnb25EcmF3YWJsZSxcbl0pO1xuZXhwb3J0IHR5cGUgRHJhd2FibGUgPSB6LmluZmVyPHR5cGVvZiBEcmF3YWJsZT47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG4vLyBGcm9tIHRoZSBsZWFmIHByaW1pdGl2ZXMgbW9kdWxlLCBOT1QgZnJvbSAuL2ludGVyYWN0aXZlLWdyYXBoLmpzIFx1MjAxNCB0aGF0IGZpbGVcbi8vIGltcG9ydHMgaW5saW5lLnRzLCBhbmQgaW5saW5lLnRzIGltcG9ydHMgVEhJUyBvbmUgKGEgZGVmaW5pdGlvbiBtYXkgY29udGFpbiBhXG4vLyBncmFwaCBmaWd1cmUpLCBzbyByb3V0aW5nIHRocm91Z2ggaXQgd291bGQgY2xvc2UgYSBmYXRhbCBtb2R1bGUgY3ljbGUuIFNlZVxuLy8gLi4vZ3JhcGgtcHJpbWl0aXZlcy50cy5cbmltcG9ydCB7IEF4aXNDb25maWcsIERyYXdhYmxlIH0gZnJvbSAnLi4vZ3JhcGgtcHJpbWl0aXZlcy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBHcmFwaEZpZ3VyZUJsb2NrIFx1MjAxNCBhIHN0YXRpYyBjb29yZGluYXRlLXBsYW5lIHBpY3R1cmUgKG5ldmVyIGludGVyYWN0aXZlKS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIHB1cmUgQ09OVEVOVCBibG9jayAoZGF0YS1ibG9jay1jYXRlZ29yeT1cImNvbnRlbnRcIik6IG5vbi1pbnRlcmFjdGl2ZSxcbi8vIG5vbi1udW1iZXJlZCwgbm8gcnVudGltZSB3aXJpbmcsIG5vIHN1Ym1pc3Npb24gd2lyZSBpbXBhY3QuIFRoZSBzdGFuZGFsb25lXG4vLyBwcm9tb3Rpb24gb2YgdGhlIE1DL21hdGNoaW5nIENob2ljZUdyYXBoIGZpZ3VyZSAoeyBheGlzLCBkcmF3YWJsZXMgfSkgdG8gYVxuLy8gYmxvY2ssIGJ1aWx0IGZvciB0aGUgcmVmZXJlbmNlIHBhbmVsIFx1MjAxNCBcInRoZXNlIHR3byBsaW5lcyBhcmUgcGFyYWxsZWxcIi1zdHlsZVxuLy8gcGljdHVyZXMgb24gYSBmb3JtdWxhIHNoZWV0LlxuLy9cbi8vIFJlbmRlcmVkIHNlcnZlci1zaWRlIGFzIGlubGluZSBTVkcgYnkgdGhlIHJlbmRlcmVyJ3MgZ3JhcGgtc3ZnIGVuZ2luZSwgbmV2ZXJcbi8vIHRoZSBpbnRlcmFjdGl2ZSBraXQgXHUyMDE0IHNvIGl0IHdvcmtzIG9uIHBhcGVyLCBpbiB0aGUgcHJpbnQgYm94LCBhbmQgaW4gdGhlXG4vLyBmbG9hdGluZyBwYW5lbCB3aXRoIHplcm8gSlMuIENvbnNlcXVlbmNlIChzYW1lIGFzIENob2ljZUdyYXBoKTogYGV4cHJlc3Npb25gXG4vLyBkcmF3YWJsZXMgbmVlZCB0aGUga2l0J3MgZm9ybXVsYSBwYXJzZXIgYW5kIGFyZSBOT1QgZHJhd247IGF1dGhvcmluZ1xuLy8gc3VyZmFjZXMgZG9uJ3Qgb2ZmZXIgdGhlbSBoZXJlLlxuLy9cbi8vIERlbGliZXJhdGVseSBOT1QgYSBkaXNwbGF5LW1vZGUgaW50ZXJhY3RpdmVfZ3JhcGg6IHRoYXQgYmxvY2sgaXMgYSBudW1iZXJlZC1cbi8vIHF1ZXN0aW9uIGZhbWlseSB3aXRoIHByb21wdC9zb2x1dGlvbi9jb25maWRlbmNlIGNocm9tZSBhbmQga2l0IGh5ZHJhdGlvbi5cbi8vIFRoaXMgb25lIGNhbiBuZXZlciBhY2NlcHQgc3R1ZGVudCBpbnB1dCBieSBjb25zdHJ1Y3Rpb24sIHdoaWNoIGlzIHRoZVxuLy8gcmVmZXJlbmNlIHBhbmVsJ3MgY29udHJhY3QuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgY29uc3QgR3JhcGhGaWd1cmVCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2dyYXBoX2ZpZ3VyZScpLFxuICBheGlzOiBBeGlzQ29uZmlnLFxuICBkcmF3YWJsZXM6IHouYXJyYXkoRHJhd2FibGUpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBHcmFwaEZpZ3VyZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgR3JhcGhGaWd1cmVCbG9jaz47XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGlubGluZS50cyBcdTIwMTQgSW5saW5lIGNvbnRlbnQgbm9kZXNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBJbmxpbmUgbm9kZXMgYXJlIHRoZSBhdG9tcyBpbnNpZGUgYSBibG9jaydzIGBjb250ZW50YCBhcnJheS4gTW9zdCBibG9ja3Ncbi8vIGFjY2VwdCB0aGUgSW5saW5lTm9kZSB1bmlvbiAodGV4dCArIGlubGluZSBtYXRoKS4gVGhlIGZpbGxfaW5fYmxhbmsgYmxvY2tcbi8vIGlzIHNwZWNpYWw6IGl0IGFjY2VwdHMgYW4gZXh0ZW5kZWQgdW5pb24gdGhhdCBhbHNvIGluY2x1ZGVzIEJsYW5rVG9rZW4uXG4vL1xuLy8gRGlzY3JpbWluYXRpb246IGV2ZXJ5IGlubGluZSBub2RlIGhhcyBhIGB0eXBlYCBsaXRlcmFsLiBab2Qnc1xuLy8gZGlzY3JpbWluYXRlZFVuaW9uIGtleXMgb24gaXQsIHdoaWNoIGdpdmVzIHVzIG5hcnJvdyB0eXBlcyBhZnRlciBwYXJzaW5nXG4vLyBhbmQgY2xlYXIgZXJyb3IgbWVzc2FnZXMgb24gbWFsZm9ybWVkIGRhdGEuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbi8vIEJvdGggaW1wb3J0cyBhcmUgTEVBRi1TQUZFIFx1MjAxNCBuZWl0aGVyIG1vZHVsZSBpbXBvcnRzIGlubGluZS50cywgc28gbmVpdGhlclxuLy8gY3JlYXRlcyBhIGN5Y2xlLiBzaXppbmcuanMgYW5kIGJsb2Nrcy9pbWFnZS5qcydzIENyb3BSZWN0IGFyZSB6b2Qtb25seTtcbi8vIGJsb2Nrcy9ncmFwaC1maWd1cmUuanMgcmVhY2hlcyBpdHMgYXhpcy9kcmF3YWJsZSBwcmltaXRpdmVzIHZpYSB0aGUgbGVhZlxuLy8gZ3JhcGgtcHJpbWl0aXZlcy50cyBwcmVjaXNlbHkgc28gdGhhdCB0aGlzIGltcG9ydCBpcyBwb3NzaWJsZS4gRG8gbm90IHN3YXBcbi8vIGVpdGhlciBmb3IgYSBibG9ja3MvIG1vZHVsZSB0aGF0IGNhcnJpZXMgSW5saW5lTm9kZS5cbmltcG9ydCB7IHNpemluZ0ZpZWxkcywgdHlwZSBCbG9ja0FsaWduIH0gZnJvbSAnLi9zaXppbmcuanMnO1xuaW1wb3J0IHsgQ3JvcFJlY3QgfSBmcm9tICcuL2Jsb2Nrcy9pbWFnZS5qcyc7XG5pbXBvcnQgeyBHcmFwaEZpZ3VyZUJsb2NrIH0gZnJvbSAnLi9ibG9ja3MvZ3JhcGgtZmlndXJlLmpzJztcblxuLy8gLS0tLSBNYXJrcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE1hcmtzIGFyZSBmb3JtYXR0aW5nIGFwcGxpZWQgdG8gYSBydW4gb2YgdGV4dCBcdTIwMTQgbm90IG5lc3RlZCBlbGVtZW50cyAobm9cbi8vIDxlbT48c3Ryb25nPi4uLjwvc3Ryb25nPjwvZW0+IHN0cnVjdHVyZSk7IGEgc2luZ2xlIFRleHROb2RlIGNhbiBjYXJyeVxuLy8gc2V2ZXJhbC4gT3JkZXIgZG9lc24ndCBtYXR0ZXIgXHUyMDE0IHJlbmRlciBvdXRwdXQgaXMgY2Fub25pY2FsaXplZC5cbi8vXG4vLyBFYWNoIG1hcmsgaXMgYW4gT0JKRUNUIHdpdGggYSBgdHlwZWAgZGlzY3JpbWluYW50LiBTaW1wbGUgbWFya3MgKGJvbGQsIGV0Yy4pXG4vLyBjYXJyeSBvbmx5IGB0eXBlYDsgYXR0cmlidXRlLWNhcnJ5aW5nIG1hcmtzIChlLmcuIGBkZWZpbml0aW9uYCkgaGFuZyB0aGVpclxuLy8gZGF0YSBvZmYgdGhlIHNhbWUgb2JqZWN0LiBMZWdhY3kgZG9jdW1lbnRzIHN0b3JlZCBtYXJrcyBhcyBiYXJlIHN0cmluZ3Ncbi8vICgnYm9sZCcpOyB0aGUgcHJlcHJvY2VzcyBiZWxvdyB1cGdyYWRlcyB0aG9zZSB0byB0aGUgb2JqZWN0IGZvcm0gb24gcmVhZCwgc29cbi8vIG9sZCBhY3Rpdml0aWVzIGtlZXAgcGFyc2luZyB3aXRob3V0IGEgc2NoZW1hVmVyc2lvbiBidW1wLiBOZXcgY29kZSBhbHdheXNcbi8vIHdyaXRlcyB0aGUgb2JqZWN0IGZvcm0uXG5leHBvcnQgY29uc3QgU0lNUExFX01BUktfVFlQRVMgPSBbXG4gICdib2xkJyxcbiAgJ2l0YWxpYycsXG4gICd1bmRlcmxpbmUnLFxuICAnY29kZScsXG4gICdzdWJzY3JpcHQnLFxuICAnc3VwZXJzY3JpcHQnLFxuXSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIFNpbXBsZU1hcmtUeXBlID0gKHR5cGVvZiBTSU1QTEVfTUFSS19UWVBFUylbbnVtYmVyXTtcblxuY29uc3QgQm9sZE1hcmsgPSB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnYm9sZCcpIH0pO1xuY29uc3QgSXRhbGljTWFyayA9IHoub2JqZWN0KHsgdHlwZTogei5saXRlcmFsKCdpdGFsaWMnKSB9KTtcbmNvbnN0IFVuZGVybGluZU1hcmsgPSB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgndW5kZXJsaW5lJykgfSk7XG5jb25zdCBDb2RlTWFyayA9IHoub2JqZWN0KHsgdHlwZTogei5saXRlcmFsKCdjb2RlJykgfSk7XG5jb25zdCBTdWJzY3JpcHRNYXJrID0gei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ3N1YnNjcmlwdCcpIH0pO1xuY29uc3QgU3VwZXJzY3JpcHRNYXJrID0gei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ3N1cGVyc2NyaXB0JykgfSk7XG5cbi8vIFRoZSBhdHRyaWJ1dGUtZnJlZSBtYXJrcyBhcyBhIHVuaW9uLiBEZWZpbml0aW9uIGNvbnRlbnQgKGJlbG93KSBhbGxvd3Mgb25seVxuLy8gdGhlc2UgXHUyMDE0IGEgZGVmaW5pdGlvbiBjYW4gYmUgZm9ybWF0dGVkIGJ1dCBjYW5ub3QgaXRzZWxmIGNvbnRhaW4gYSBuZXN0ZWRcbi8vIGRlZmluaXRpb24sIHdoaWNoIGFsc28ga2VlcHMgdGhlIHNjaGVtYSBub24tcmVjdXJzaXZlLlxuY29uc3QgU2ltcGxlTWFyayA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBCb2xkTWFyayxcbiAgSXRhbGljTWFyayxcbiAgVW5kZXJsaW5lTWFyayxcbiAgQ29kZU1hcmssXG4gIFN1YnNjcmlwdE1hcmssXG4gIFN1cGVyc2NyaXB0TWFyayxcbl0pO1xuXG4vLyAtLS0tIE1hdGggcHJvbXB0IChNb2RlbCBBOiBpbi1lcXVhdGlvbiBibGFuaykgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBncmFkZWFibGUgZ2FwIElOU0lERSBhIHJlbmRlcmVkIGVxdWF0aW9uIFx1MjAxNCB0aGUgTWF0aExpdmUgYFxccGxhY2Vob2xkZXJbaWRde31gXG4vLyBmZWF0dXJlLiBgaWRgIG1hdGNoZXMgdGhlIHBsYWNlaG9sZGVyIG1hcmtlciBpbiB0aGUgb3duaW5nIG5vZGUncyBgbGF0ZXhgOyB0aGVcbi8vIHN0dWRlbnQncyB0eXBlZCBtYXRoIGV4cHJlc3Npb24gaXMgZ3JhZGVkIGV4YWN0bHkgbGlrZSBhICdtYXRoJyBmaWxsLWluLWJsYW5rXG4vLyAobnVtZXJpYy1zYW1wbGluZyBlcXVpdmFsZW5jZSwgMmEgXHUyMjYxIGErYSBcdTIyNjEgYSoyKS4gTW9kZWwgQSByZXVzZXMgdGhlIGV4aXN0aW5nXG4vLyBgc3VibWlzc2lvbnMucmVzcG9uc2VzLmJsYW5rc2AgbWFwIGtleWVkIGJ5IHRoaXMgaWQsIHNvIHByb21wdHMgbmVlZCBOTyBuZXdcbi8vIHdpcmUgc2hhcGUuIEEgZ2FwIGlzIGluaGVyZW50bHkgYSBtYXRoIGFuc3dlciwgc28gdGhlcmUgaXMgbm8gYGFuc3dlclR5cGVgXG4vLyBoZXJlIFx1MjAxNCBgZXF1aXZhbGVuY2VgICsgYHRvbGVyYW5jZWAgYXJlIHRoZSBzYW1lIGdyYWRpbmcga25vYnMgYSAnbWF0aCdcbi8vIEJsYW5rVG9rZW4gY2FycmllcywgcmV1c2VkIHZlcmJhdGltLiBTZWUgZG9jcy9kZXNpZ24vbWF0aC1ibGFua3MubWQgKE1vZGVsIEEpLlxuZXhwb3J0IGNvbnN0IE1hdGhQcm9tcHQgPSB6Lm9iamVjdCh7XG4gIC8vIE1hdGNoZXMgdGhlIGBcXHBsYWNlaG9sZGVyW2lkXXt9YCBtYXJrZXIgaW4gdGhlIG93bmluZyBub2RlJ3MgbGF0ZXguIE5PVCBhXG4gIC8vIHV1aWQ6IE1hdGhMaXZlIHBsYWNlaG9sZGVyIGlkcyBtYXkgbm90IGNvbnRhaW4gc3BhY2VzL3NwZWNpYWwgY2hhcmFjdGVyc1xuICAvLyAodXVpZCBoeXBoZW5zIGFyZSB1bnNhZmUpLCBzbyB0aGUgZWRpdG9yIG1pbnRzIGEgTWF0aExpdmUtc2FmZSB0b2tlbi5cbiAgLy8gRG9jdW1lbnQtd2lkZSB1bmlxdWVuZXNzIChpdCBrZXlzIGludG8gdGhlIGJsYW5rcyBtYXApIGlzIGFuIGF1dGhvcmluZy10aW1lXG4gIC8vIGludmFyaWFudCwgbm90IGEgc2NoZW1hIGNvbnN0cmFpbnQuXG4gIGlkOiB6LnN0cmluZygpLm1pbigxKSxcbiAgYW5zd2VyOiB6LnN0cmluZygpLm1pbigxKSxcbiAgLy8gQWx0ZXJuYXRpdmUgYWNjZXB0YWJsZSBmb3JtcyAoXCJhbHNvIGFjY2VwdFwiKS4gRW1wdHkgYXJyYXkgaXMgdGhlIGNvbW1vbiBjYXNlLlxuICBhY2NlcHRhYmxlQW5zd2Vyczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgLy8gRXF1aXZhbGVuY2UgbW9kZTogJ3ZhbHVlJyAoZGVmYXVsdCwgYW55IGV4cHJlc3Npb24gdGhhdCBldmFsdWF0ZXMgZXF1YWwpIG9yXG4gIC8vICdleGFjdC1mb3JtJyAobm9ybWFsaXplZC1zdHJpbmcgbWF0Y2gpLiBBYnNlbnQgPSAndmFsdWUnLiBNaXJyb3JzIEJsYW5rVG9rZW4uXG4gIGVxdWl2YWxlbmNlOiB6LmVudW0oWyd2YWx1ZScsICdleGFjdC1mb3JtJ10pLm9wdGlvbmFsKCksXG4gIC8vIEFic29sdXRlIHNhbXBsaW5nIHRvbGVyYW5jZS4gQWJzZW50ID0gbm8gZXh0cmEgc2xhY2suIE1pcnJvcnMgQmxhbmtUb2tlbi5cbiAgdG9sZXJhbmNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNYXRoUHJvbXB0ID0gei5pbmZlcjx0eXBlb2YgTWF0aFByb21wdD47XG5cbi8vIC0tLS0gSW5saW5lIG1hdGggLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBMYVRlWCBzb3VyY2UgZm9yIEthVGVYLiBTdG9yZWQgdmVyYmF0aW07IHJlbmRlcmVkIGF0IHJlbmRlciB0aW1lLiBUaGVcbi8vIHJlbmRlcmVyIGlzIHRvbGVyYW50IG9mIGludmFsaWQgTGFUZVggKHJlbmRlcnMgYW4gZXJyb3IgaW5kaWNhdG9yIHJhdGhlclxuLy8gdGhhbiBjcmFzaGluZykgc28gc2F2aW5nIGEgZG9jIHdpdGggYnJva2VuIG1hdGggZG9lc24ndCBsb2NrIHRoZSBlZGl0b3IuXG5leHBvcnQgY29uc3QgSW5saW5lTWF0aE5vZGUgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnbWF0aF9pbmxpbmUnKSxcbiAgbGF0ZXg6IHouc3RyaW5nKCksXG4gIC8vIE1vZGVsIEE6IG9wdGlvbmFsIGluLWVxdWF0aW9uIGdyYWRlYWJsZSBnYXBzIChcdTAwQTdNYXRoUHJvbXB0KS4gT3B0aW9uYWwgd2l0aFxuICAvLyBOTyBkZWZhdWx0IHNvIGEgbWF0aCBub2RlIGF1dGhvcmVkIGJlZm9yZSBNb2RlbCBBIFx1MjAxNCBvciBvbmUgd2l0aCBubyBnYXBzIFx1MjAxNFxuICAvLyByZS1zZXJpYWxpemVzIEJZVEUtSURFTlRJQ0FMTFkgKGEgYC5kZWZhdWx0KFtdKWAgd291bGQgbWF0ZXJpYWxpemUgYHByb21wdHM6XG4gIC8vIFtdYCBvbiBldmVyeSBsZWdhY3kgbm9kZSkuIFNhbWUgb3B0aW9uYWwtbm8tZGVmYXVsdCBkaXNjaXBsaW5lIGFzXG4gIC8vIEJsYW5rVG9rZW4uYW5zd2VyVHlwZS90b2xlcmFuY2UuIFNlZSBkb2NzL2Rlc2lnbi9tYXRoLWJsYW5rcy5tZCAoTW9kZWwgQSkuXG4gIHByb21wdHM6IHouYXJyYXkoTWF0aFByb21wdCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgSW5saW5lTWF0aE5vZGUgPSB6LmluZmVyPHR5cGVvZiBJbmxpbmVNYXRoTm9kZT47XG5cbi8vIC0tLS0gSGFyZCBicmVhayAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIHNvZnQgbGluZSBicmVhayBpbnNpZGUgYSBibG9jayAoVGlwdGFwJ3MgaGFyZEJyZWFrIC8gU2hpZnQrRW50ZXIpLCBhc1xuLy8gb3Bwb3NlZCB0byBhIG5ldyBibG9jay4gQ2FycmllcyBubyBkYXRhIFx1MjAxNCBpdCByZW5kZXJzIGFzIDxicj4uIFdpdGhvdXQgdGhpc1xuLy8gbm9kZSB0aGUgYnJlYWsgaXMgZHJvcHBlZCBvbiBzZXJpYWxpemUgYW5kIGFkamFjZW50IHRleHQgcnVucyBjb25jYXRlbmF0ZS5cbmV4cG9ydCBjb25zdCBIYXJkQnJlYWtOb2RlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2hhcmRfYnJlYWsnKSxcbn0pO1xuZXhwb3J0IHR5cGUgSGFyZEJyZWFrTm9kZSA9IHouaW5mZXI8dHlwZW9mIEhhcmRCcmVha05vZGU+O1xuXG4vLyAtLS0tIERlZmluaXRpb24gY29udGVudCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHJpY2ggY29udGVudCBzaG93biBpbiBhIGRlZmluaXRpb24ncyBwb3BvdmVyOiBmb3JtYXR0ZWQgdGV4dCArIGlubGluZVxuLy8gbWF0aCAodGhlIHNhbWUgYWxwaGFiZXQgdGhlIGJsYW5rIGhpbnQgdXNlcyksIGF1dGhvcmVkIHZpYSB0aGUgc2hhcmVkXG4vLyBJbmxpbmVSaWNoVGV4dEVkaXRvci4gQSBkZWZpbml0aW9uJ3MgdGV4dCBydW4gY2FycmllcyBTaW1wbGVNYXJrIG9ubHkgXHUyMDE0IG5vXG4vLyBuZXN0ZWQgZGVmaW5pdGlvbnMgXHUyMDE0IHdoaWNoIGFsc28gYnJlYWtzIHRoZSByZWN1cnNpb24gdGhhdCByZXVzaW5nIElubGluZU5vZGVcbi8vIGhlcmUgd291bGQgY3JlYXRlIChEZWZpbml0aW9uTWFyayBcdTIxOTIgY29udGVudCBcdTIxOTIgdGV4dCBcdTIxOTIgbWFya3MgXHUyMTkyIERlZmluaXRpb25NYXJrKS5cbmNvbnN0IERlZmluaXRpb25Db250ZW50VGV4dCA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCd0ZXh0JyksXG4gIHRleHQ6IHouc3RyaW5nKCksXG4gIG1hcmtzOiB6LmFycmF5KFNpbXBsZU1hcmspLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgY29uc3QgRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmUgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgRGVmaW5pdGlvbkNvbnRlbnRUZXh0LFxuICBJbmxpbmVNYXRoTm9kZSxcbiAgSGFyZEJyZWFrTm9kZSxcbl0pO1xuZXhwb3J0IHR5cGUgRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmUgPSB6LmluZmVyPHR5cGVvZiBEZWZpbml0aW9uQ29udGVudElubGluZT47XG5cbi8vIC0tLS0gRGVmaW5pdGlvbiBibG9ja3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIGRlZmluaXRpb24ncyBjb250ZW50IGlzIGEgQkxPQ0sgc2VxdWVuY2UsIHNvIGEgdm9jYWJ1bGFyeSBwb3BvdmVyIGNhbiBob2xkXG4vLyB3aGF0IGEgcmVmZXJlbmNlIHNoZWV0IGhvbGRzOiBhIGRpc3BsYXkgZXF1YXRpb24sIGEgc2hvcnQgcHJvcGVydHkgbGlzdCwgYVxuLy8gZmlndXJlLiBTZWUgZG9jcy9kZXNpZ24vZGVmaW5pdGlvbi1yaWNoLWNvbnRlbnQubWQuXG4vL1xuLy8gVGhlIHVuaW9uIGlzIGEgY3VyYXRlZCBzdWJzZXQgb2YgdGhlIHJlZmVyZW5jZSBwYW5lbCdzIGNvbnRlbnQgYmxvY2tzLCBhbmRcbi8vIGV2ZXJ5IHRleHQtYmVhcmluZyBtZW1iZXIgaXMgZGVmaW5lZCBMT0NBTExZIG92ZXIgRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmVcbi8vIHJhdGhlciB0aGFuIHJldXNpbmcgaXRzIGJsb2Nrcy8gc2libGluZy4gVGhhdCBpcyB3aGF0IGtlZXBzIHRoZSBzY2hlbWFcbi8vIE5PTi1SRUNVUlNJVkU6IGJsb2Nrcy9wYXJhZ3JhcGgudHMgYW5kIGZyaWVuZHMgY2FycnkgSW5saW5lTm9kZSwgd2hvc2Vcbi8vIFRleHROb2RlIGNhcnJpZXMgTWFyaywgd2hpY2ggaW5jbHVkZXMgRGVmaW5pdGlvbk1hcmsgXHUyMDE0IHNvIHJldXNpbmcgdGhlbSB3b3VsZFxuLy8gY2xvc2UgdGhlIGN5Y2xlIERlZmluaXRpb25NYXJrIC0+IGJsb2NrIC0+IHRleHQgLT4gbWFyayAtPiBEZWZpbml0aW9uTWFyayBhbmRcbi8vIGFkbWl0IGRlZmluaXRpb25zIG5lc3RlZCBpbnNpZGUgZGVmaW5pdGlvbnMgYXQgYXJiaXRyYXJ5IGRlcHRoLiBJdCB3b3VsZCBhbHNvXG4vLyBsYW5kIG9uIHRoZSBzYW1lIHRzYyBkZWNsYXJhdGlvbi1zZXJpYWxpemF0aW9uIGxpbWl0IChUUzcwNTYpIHRoYXQgYWxyZWFkeVxuLy8gZm9yY2VkIHRoZSBoYW5kLXdyaXR0ZW4gYGludGVyZmFjZSBBY3Rpdml0eURvY3VtZW50YCBpbiBkb2N1bWVudC50cy5cbi8vXG4vLyBFeGNsdWRlZCBvbiBwdXJwb3NlIChhdXRob3IgcnVsaW5ncywgZGVzaWduIGRvYyBEMi9EMyk6IGNvbHVtbnMgKHVucmVhZGFibGVcbi8vIGluIGEgfjI4cmVtIHBvcG92ZXIgXHUyMDE0IGEgZGVmaW5pdGlvbiB0aGF0IG5lZWRzIHR3by1jb2x1bW4gbGF5b3V0IElTIHRoZVxuLy8gcmVmZXJlbmNlIHBhbmVsKSwgY2FsbG91dCAoYSBub3RlIGJveCBpbnNpZGUgYSBub3RlIGJveCksIGFuZCBldmVyeVxuLy8gcXVlc3Rpb24vaW50ZXJhY3RpdmUgYmxvY2sgKGEgZGVmaW5pdGlvbiBpcyBuZXZlciBncmFkZWFibGUpLlxuLy9cbi8vIGBpZGAgaXMgT1BUSU9OQUwgb24gdGhlIGxvY2FsbHktZGVmaW5lZCBtZW1iZXJzLCB1bmxpa2UgZXZlcnkgYmxvY2tzLyBzaWJsaW5nXG4vLyB3aGVyZSBpdCBpcyBhIHJlcXVpcmVkIHV1aWQuIFR3byByZWFzb25zOiBub3RoaW5nIGFkZHJlc3NlcyBhIGRlZmluaXRpb24gYmxvY2tcbi8vIChpdCBpcyBuZXZlciBzY29yZWQsIG5ldmVyIGEgc3VibWlzc2lvbiBrZXksIG5ldmVyIGEgcnVudGltZSByZWYgXHUyMDE0IG9ubHkgdGhlXG4vLyBlZGl0b3Igd2FudHMgaXQsIGFuZCB0aGUgZWRpdG9yIGFsd2F5cyBtaW50cyBvbmUpLCBhbmQgdGhlIGxlZ2FjeSB1cGdyYWRlcyBpblxuLy8gdGhlIE1hcmsgcHJlcHJvY2VzcyBiZWxvdyBtdXN0IGJlIERFVEVSTUlOSVNUSUMuIEEgcmVxdWlyZWQgdXVpZCB3b3VsZCBmb3JjZVxuLy8gY3J5cHRvLnJhbmRvbVVVSUQoKSBhdCBwYXJzZSB0aW1lLCBzbyBwYXJzaW5nIG9uZSBzdG9yZWQgZG9jdW1lbnQgdHdpY2Ugd291bGRcbi8vIHlpZWxkIGRpZmZlcmVudCBpZHMgYW5kIGJyZWFrIHJlLXNlcmlhbGl6YXRpb24gYnl0ZS1pZGVudGl0eS5cblxuLy8gRXZlcnkgc2NoZW1hIGJlbG93IGNhcnJpZXMgYW4gRVhQTElDSVQgaW50ZXJmYWNlICsgYHouWm9kVHlwZTxcdTIwMjY+YCBhbm5vdGF0aW9uXG4vLyByYXRoZXIgdGhhbiByZWx5aW5nIG9uIHouaW5mZXIuIFRoaXMgaXMgbm90IHN0eWxlOiB3aXRob3V0IGl0LCBhZGRpbmcgYVxuLy8gNy1tZW1iZXIgYmxvY2sgdW5pb24gaW5zaWRlIGEgbWFyayB0aGF0IGV2ZXJ5IGJsb2NrJ3MgaW5saW5lIGNvbnRlbnQgY2FuXG4vLyByZWFjaCBvdmVyZmxvd3MgdHNjJ3MgZGVjbGFyYXRpb24tc2VyaWFsaXphdGlvbiBsaW1pdCBhbmQgZmFpbHMgdGhlIGJ1aWxkIHdpdGhcbi8vIFRTNzA1NiBpbiBmaXZlIGRvd25zdHJlYW0gZmlsZXMgKGJsb2Nrcy9pbmRleC50cydzIEJsb2NrLCBkb2N1bWVudC50cyxcbi8vIGxheW91dC50cykuIE5hbWluZyB0aGUgdHlwZXMgc3RvcHMgdGhlIHN0cnVjdHVyYWwgZXhwYW5zaW9uIGF0IHRoaXMgYm91bmRhcnkgXHUyMDE0XG4vLyB0aGUgc2FtZSByZW1lZHkgYGludGVyZmFjZSBBY3Rpdml0eURvY3VtZW50YCBhbHJlYWR5IGFwcGxpZXMgaW4gZG9jdW1lbnQudHMuXG4vLyBUaGUgYW5ub3RhdGlvbnMgYXJlIGNoZWNrZWQgYWdhaW5zdCB0aGUgb2JqZWN0IHNjaGVtYXMsIHNvIG5vdGhpbmcgaGVyZSBsb3Nlc1xuLy8gdHlwZSBzYWZldHksIGFuZCB0aGUgcnVudGltZSBvYmplY3RzIGFyZSB1bnRvdWNoZWQgKGEgZGlzY3JpbWluYXRlZFVuaW9uIHN0aWxsXG4vLyBwYXJzZXMgYXMgYSBkaXNjcmltaW5hdGVkVW5pb24pLlxuXG5jb25zdCBEZWZpbml0aW9uQmxvY2tJZCA9IHouc3RyaW5nKCkudXVpZCgpLm9wdGlvbmFsKCk7XG5cbi8vIFNoYXJlZCBzaXppbmcgZnJhZ21lbnQsIHNwZWxsZWQgb3V0IGZvciB0aGUgaW50ZXJmYWNlcyBhYm92ZS5cbmludGVyZmFjZSBEZWZpbml0aW9uU2l6aW5nIHtcbiAgd2lkdGg/OiBudW1iZXI7XG4gIGFsaWduPzogQmxvY2tBbGlnbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZWZpbml0aW9uUGFyYWdyYXBoQmxvY2sge1xuICBpZD86IHN0cmluZztcbiAgdHlwZTogJ3BhcmFncmFwaCc7XG4gIGNvbnRlbnQ6IERlZmluaXRpb25Db250ZW50SW5saW5lW107XG59XG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25IZWFkaW5nQmxvY2sge1xuICBpZD86IHN0cmluZztcbiAgdHlwZTogJ2hlYWRpbmcnO1xuICBsZXZlbDogMSB8IDIgfCAzO1xuICBjb250ZW50OiBEZWZpbml0aW9uQ29udGVudElubGluZVtdO1xufVxuZXhwb3J0IGludGVyZmFjZSBEZWZpbml0aW9uTWF0aEJsb2NrIGV4dGVuZHMgRGVmaW5pdGlvblNpemluZyB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAnbWF0aF9ibG9jayc7XG4gIGxhdGV4OiBzdHJpbmc7XG59XG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25JbWFnZUJsb2NrIGV4dGVuZHMgRGVmaW5pdGlvblNpemluZyB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAnaW1hZ2UnO1xuICBzcmM6IHN0cmluZztcbiAgYWx0OiBzdHJpbmc7XG4gIGNyb3A/OiBDcm9wUmVjdDtcbiAgc3JjQXNwZWN0PzogbnVtYmVyO1xufVxuXG5jb25zdCBEZWZpbml0aW9uUGFyYWdyYXBoQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgdHlwZTogei5saXRlcmFsKCdwYXJhZ3JhcGgnKSxcbiAgY29udGVudDogei5hcnJheShEZWZpbml0aW9uQ29udGVudElubGluZSkuZGVmYXVsdChbXSksXG59KTtcblxuLy8gU2FtZSB0aHJlZS1sZXZlbCBjYXAgYXMgSGVhZGluZ0Jsb2NrLiBUaGUgcG9wb3ZlciBzdHlsZXNoZWV0IHNjb3BlcyB0aGVzZVxuLy8gZG93biBzbyBhIHBhbmVsLXNjYWxlIGgxIHJlYWRzIGNvcnJlY3RseSBhdCBwb3BvdmVyIHNjYWxlLlxuY29uc3QgRGVmaW5pdGlvbkhlYWRpbmdCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IERlZmluaXRpb25CbG9ja0lkLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2hlYWRpbmcnKSxcbiAgbGV2ZWw6IHoudW5pb24oW3oubGl0ZXJhbCgxKSwgei5saXRlcmFsKDIpLCB6LmxpdGVyYWwoMyldKSxcbiAgY29udGVudDogei5hcnJheShEZWZpbml0aW9uQ29udGVudElubGluZSkuZGVmYXVsdChbXSksXG59KTtcblxuLy8gRGlzcGxheSBtYXRoLiBBIGRlZmluaXRpb24tbG9jYWwgc2hhcGUgcmF0aGVyIHRoYW4gYmxvY2tzL21hdGgtYmxvY2sudHMnc1xuLy8gTWF0aEJsb2NrLCB3aGljaCBjYXJyaWVzIGBwcm9tcHRzYCAoaW4tZXF1YXRpb24gZ3JhZGVhYmxlIGdhcHMpIGFuZFxuLy8gYHNvbHV0aW9uOiBJbmxpbmVOb2RlW11gIFx1MjAxNCB0aGUgZmlyc3QgaXMgbWVhbmluZ2xlc3MgaGVyZSAoYSBkZWZpbml0aW9uIGlzXG4vLyBuZXZlciBncmFkZWFibGUsIHRoZSBzYW1lIHBvc3R1cmUgdGhlIHJlZmVyZW5jZSBwYW5lbCBhbHJlYWR5IHRha2VzKSBhbmQgdGhlXG4vLyBzZWNvbmQgaXMgZXhhY3RseSB0aGUgcmVjdXJzaXZlIGVkZ2UgZGVzY3JpYmVkIGFib3ZlLiBTaXppbmcgcmlkZXMgYWxvbmc7XG4vLyBsYWJlbEZpZWxkcyBkbyBub3QgKGEgZGVmaW5pdGlvbiBibG9jayBpcyBuZXZlciBudW1iZXJlZCkuXG5jb25zdCBEZWZpbml0aW9uTWF0aEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogRGVmaW5pdGlvbkJsb2NrSWQsXG4gIHR5cGU6IHoubGl0ZXJhbCgnbWF0aF9ibG9jaycpLFxuICBsYXRleDogei5zdHJpbmcoKSxcbiAgLi4uc2l6aW5nRmllbGRzLFxufSk7XG5cbi8vIElsbHVzdHJhdGl2ZSBpbWFnZS4gRGVmaW5pdGlvbi1sb2NhbCBmb3IgdGhlIG9wdGlvbmFsLWlkIHJlYXNvbiBhYm92ZSwgYnV0IGl0XG4vLyByZXVzZXMgdGhlIHNoYXJlZCBzaXppbmcgKyBjcm9wIHZvY2FidWxhcnkgdmVyYmF0aW0sIHNvIHJlZnJhbWluZyBhIHRleHRib29rXG4vLyBmaWd1cmUgZG93biB0byB0aGUgcmVsZXZhbnQgY29ybmVyIHdvcmtzIGV4YWN0bHkgYXMgaXQgZG9lcyBpbiB0aGUgYm9keS5cbi8vIGBjYXB0aW9uYCBpcyBkZWxpYmVyYXRlbHkgYWJzZW50IChZQUdOSSBcdTIwMTQgYWx0IGNvdmVycyBhY2Nlc3NpYmlsaXR5LCBhbmQgYVxuLy8gY2FwdGlvbmVkIGZpZ3VyZSBpbiBhIHBvcG92ZXIgaXMgdGhlIHJlZmVyZW5jZSBwYW5lbCdzIGpvYik7IGFkZGl0aXZlIGxhdGVyLlxuY29uc3QgRGVmaW5pdGlvbkltYWdlQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgdHlwZTogei5saXRlcmFsKCdpbWFnZScpLFxuICBzcmM6IHouc3RyaW5nKCksXG4gIGFsdDogei5zdHJpbmcoKS5kZWZhdWx0KCcnKSxcbiAgLi4uc2l6aW5nRmllbGRzLFxuICBjcm9wOiBDcm9wUmVjdC5vcHRpb25hbCgpLFxuICBzcmNBc3BlY3Q6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxufSk7XG5cbi8vIE5lc3RlZCBsaXN0cywgbWlycm9yaW5nIGJsb2Nrcy9saXN0LnRzJ3Mgc2hhcGUgc28gVGFiLXRvLWluZGVudCBpbiB0aGVcbi8vIGRlZmluaXRpb24gZGlhbG9nIHJvdW5kLXRyaXBzLiBTYW1lIHJlY3Vyc2lvbiBtZWNoYW5pYzogb25seSB0aGUgY3ljbGljIGVkZ2Vcbi8vIChpdGVtIC0+IGxpc3QgLT4gaXRlbSkgaXMgei5sYXp5KCksIGxlYXZpbmcgdGhlIGxpc3QgYmxvY2tzIGFzIHBsYWluXG4vLyB6Lm9iamVjdHMgc28gdGhleSBzdGF5IHVzYWJsZSBhcyBkaXNjcmltaW5hdGVkVW5pb24gbWVtYmVycyBiZWxvdy5cbmV4cG9ydCBpbnRlcmZhY2UgRGVmaW5pdGlvbkxpc3RJdGVtIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIGNvbnRlbnQ6IERlZmluaXRpb25Db250ZW50SW5saW5lW107XG4gIGNoaWxkcmVuPzogQXJyYXk8RGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jayB8IERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrPjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jayB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAnYnVsbGV0X2xpc3QnO1xuICBpdGVtczogRGVmaW5pdGlvbkxpc3RJdGVtW107XG59XG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIHR5cGU6ICdvcmRlcmVkX2xpc3QnO1xuICBpdGVtczogRGVmaW5pdGlvbkxpc3RJdGVtW107XG59XG5cbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uTGlzdEl0ZW06IHouWm9kVHlwZTxcbiAgRGVmaW5pdGlvbkxpc3RJdGVtLFxuICB6LlpvZFR5cGVEZWYsXG4gIHVua25vd25cbj4gPSB6LmxhenkoKCkgPT5cbiAgei5vYmplY3Qoe1xuICAgIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgICBjb250ZW50OiB6LmFycmF5KERlZmluaXRpb25Db250ZW50SW5saW5lKS5kZWZhdWx0KFtdKSxcbiAgICBjaGlsZHJlbjogelxuICAgICAgLmFycmF5KHoudW5pb24oW0RlZmluaXRpb25CdWxsZXRMaXN0QmxvY2ssIERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrXSkpXG4gICAgICAub3B0aW9uYWwoKSxcbiAgfSksXG4pO1xuXG5leHBvcnQgY29uc3QgRGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IERlZmluaXRpb25CbG9ja0lkLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2J1bGxldF9saXN0JyksXG4gIGl0ZW1zOiB6LmFycmF5KERlZmluaXRpb25MaXN0SXRlbSkuZGVmYXVsdChbXSksXG59KTtcblxuZXhwb3J0IGNvbnN0IERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogRGVmaW5pdGlvbkJsb2NrSWQsXG4gIHR5cGU6IHoubGl0ZXJhbCgnb3JkZXJlZF9saXN0JyksXG4gIGl0ZW1zOiB6LmFycmF5KERlZmluaXRpb25MaXN0SXRlbSkuZGVmYXVsdChbXSksXG59KTtcblxuLy8gR3JhcGhGaWd1cmVCbG9jayBpcyB0aGUgT05FIG1lbWJlciByZXVzZWQgdmVyYmF0aW06IGl0IGlzIGFscmVhZHkgaW5saW5lLWZyZWVcbi8vIChheGlzICsgZHJhd2FibGVzIG9ubHkpLCBzbyBpdCBpbnRyb2R1Y2VzIG5vIGN5Y2xlLCBhbmQgaXQgaGFzIG5vIGxlZ2FjeVxuLy8gdXBncmFkZSBwYXRoIHRoYXQgd291bGQgbmVlZCB0byBtaW50IGl0cyByZXF1aXJlZCB1dWlkLiBJbXBvcnRpbmcgaXQgaXMgc2FmZVxuLy8gb25seSBiZWNhdXNlIGl0cyBvd24gZ3JhcGggcHJpbWl0aXZlcyBub3cgY29tZSBmcm9tIHRoZSBsZWFmXG4vLyBncmFwaC1wcmltaXRpdmVzLnRzIHJhdGhlciB0aGFuIHRocm91Z2ggYmxvY2tzL2ludGVyYWN0aXZlLWdyYXBoLnRzIFx1MjAxNCBzZWUgdGhlXG4vLyBoZWFkZXIgY29tbWVudCB0aGVyZS5cbmV4cG9ydCB0eXBlIERlZmluaXRpb25CbG9jayA9XG4gIHwgRGVmaW5pdGlvblBhcmFncmFwaEJsb2NrXG4gIHwgRGVmaW5pdGlvbkhlYWRpbmdCbG9ja1xuICB8IERlZmluaXRpb25NYXRoQmxvY2tcbiAgfCBEZWZpbml0aW9uSW1hZ2VCbG9ja1xuICB8IERlZmluaXRpb25CdWxsZXRMaXN0QmxvY2tcbiAgfCBEZWZpbml0aW9uT3JkZXJlZExpc3RCbG9ja1xuICB8IEdyYXBoRmlndXJlQmxvY2s7XG5cbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uQmxvY2s6IHouWm9kVHlwZTxcbiAgRGVmaW5pdGlvbkJsb2NrLFxuICB6LlpvZFR5cGVEZWYsXG4gIHVua25vd25cbj4gPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgRGVmaW5pdGlvblBhcmFncmFwaEJsb2NrLFxuICBEZWZpbml0aW9uSGVhZGluZ0Jsb2NrLFxuICBEZWZpbml0aW9uTWF0aEJsb2NrLFxuICBEZWZpbml0aW9uSW1hZ2VCbG9jayxcbiAgRGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jayxcbiAgRGVmaW5pdGlvbk9yZGVyZWRMaXN0QmxvY2ssXG4gIEdyYXBoRmlndXJlQmxvY2ssXG5dKTtcblxuLy8gRGVmaW5pdGlvbk1hcmsgXHUyMDE0IGlubGluZSB2b2NhYnVsYXJ5IGRlZmluaXRpb24gKFBoYXNlIDIpLiBgY29udGVudGAgaXMgdGhlXG4vLyByaWNoIGRlZmluaXRpb24gc2hvd24gaW4gdGhlIHB1Ymxpc2hlZC1wYWdlIHBvcG92ZXIsIG5vdyBhIGJsb2NrIHNlcXVlbmNlXG4vLyAoc2VlIERlZmluaXRpb25CbG9jayBhYm92ZSkuIGBnbG9zc2FyeUtleWAgaXMgcmVzZXJ2ZWQgZm9yIHRoZSBQaGFzZSA0IHRlbmFudFxuLy8gZ2xvc3Nhcnkgc3RvcmUgKHJlc29sdmVkIGF0IHB1Ymxpc2gpIGFuZCBpcyB1bnVzZWQgaW4gUGhhc2UgMi4gVGhlIHJlbmRlcmVyXG4vLyBlbWl0cyBgPHNwYW4gY2xhc3M9XCJkZWZpbml0aW9uXCIgXHUyMDI2PmAgcGx1cyBhIGhpZGRlbiA8dGVtcGxhdGU+IGNhcnJ5aW5nIHRoZVxuLy8gcmVuZGVyZWQgY29udGVudDsgc2VlIFJVTlRJTUUubWQsIGRvY3MvZGVzaWduL3ZvY2FidWxhcnktZGVmaW5pdGlvbnMubWQsIGFuZFxuLy8gZG9jcy9kZXNpZ24vZGVmaW5pdGlvbi1yaWNoLWNvbnRlbnQubWQuXG4vLyBOT1QgYW5ub3RhdGVkIGFzIHouWm9kVHlwZSwgdW5saWtlIERlZmluaXRpb25CbG9jayBhYm92ZTogdGhpcyBzY2hlbWEgaXMgYVxuLy8gbWVtYmVyIG9mIHRoZSBgTWFya2AgZGlzY3JpbWluYXRlZFVuaW9uIGJlbG93LCBhbmQgei5kaXNjcmltaW5hdGVkVW5pb24gbmVlZHNcbi8vIHJlYWwgWm9kT2JqZWN0cyB0byBpbnRyb3NwZWN0IHRoZSBgdHlwZWAgZGlzY3JpbWluYXRvci4gVGhlIG5hbWVkXG4vLyBEZWZpbml0aW9uQmxvY2sgYWxpYXMgaXMgd2hhdCBrZWVwcyB0aGUgaW5mZXJyZWQgdHlwZSBoZXJlIHNtYWxsIGVub3VnaCBcdTIwMTQgdGhlXG4vLyBzYW1lIHJlYXNvbiBsaXN0LnRzIGtlZXBzIGl0cyBsaXN0IGJsb2NrcyBhcyBwbGFpbiB6Lm9iamVjdHMgYW5kIHB1dHMgdGhlXG4vLyB6LmxhenkoKSBvbmx5IG9uIHRoZSBjeWNsaWMgZWRnZS5cbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uTWFyayA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdkZWZpbml0aW9uJyksXG4gIGNvbnRlbnQ6IHouYXJyYXkoRGVmaW5pdGlvbkJsb2NrKS5kZWZhdWx0KFtdKSxcbiAgZ2xvc3NhcnlLZXk6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGVmaW5pdGlvbk1hcmsgPSB6LmluZmVyPHR5cGVvZiBEZWZpbml0aW9uTWFyaz47XG5cbi8vIEEgZGVmaW5pdGlvbidzIGNvbnRlbnQgaXMgYSBibG9jayBhcnJheSB0b2RheSwgYnV0IHR3byBvbGRlciBzaGFwZXMgYXJlIHN0aWxsXG4vLyBvdXQgdGhlcmUgaW4gc3RvcmVkIGRvY3VtZW50cy4gQm90aCB1cGdyYWRlcyBiZWxvdyBhcmUgcHVyZSwgZGV0ZXJtaW5pc3RpY1xuLy8gcmVhZC10aW1lIHJld3JpdGVzIFx1MjAxNCB0aGV5IG1pbnQgbm8gaWRzIGFuZCBubyByYW5kb21uZXNzLCBzbyBwYXJzaW5nIHRoZSBzYW1lXG4vLyBzdG9yZWQgZG9jdW1lbnQgdHdpY2UgeWllbGRzIGlkZW50aWNhbCBvdXRwdXQuXG4vL1xuLy8gVGhleSBDT01QT1NFLCBvbGRlc3QgZmlyc3QsIGJlY2F1c2UgYSBkb2N1bWVudCBjYW4gY2FycnkgdGhlIG9sZGVzdCBzaGFwZTpcbi8vICAgdjEgIHsgZGVmaW5pdGlvbjogJ2Egc3RyaW5nJyB9ICAgICAgICAgICAgICAgICAgICAocHJlLXJpY2gtY29udGVudClcbi8vICAgdjIgIHsgY29udGVudDogW2lubGluZVx1MjAyNl0sIGltYWdlPzoge3NyYywgYWx0fSB9ICAgIChQaGFzZSAyIHJpY2ggaW5saW5lKVxuLy8gICB2MyAgeyBjb250ZW50OiBbYmxvY2tcdTIwMjZdIH0gICAgICAgICAgICAgICAgICAgICAgICAgKGN1cnJlbnQpXG4vLyBzbyB2MSBcdTIxOTIgdjIgXHUyMTkyIHYzIG11c3QgcnVuIGluIHNlcXVlbmNlIG9uIGEgc2luZ2xlIG1hcmsuXG4vLyBFeHBvcnRlZCBiZWNhdXNlIHRoZSBhcHAncyBzZXJpYWxpemVyIG5lZWRzIHRoZSBJREVOVElDQUwgbm9ybWFsaXphdGlvbiB3aGVuXG4vLyBpdCByZWFkcyBhIGRlZmluaXRpb24gbWFyaydzIFRpcHRhcCBhdHRycyBcdTIwMTQgYW4gZWRpdG9yIHNlc3Npb24gb3BlbmVkIGJlZm9yZVxuLy8gdGhlIGJsb2NrIG1pZ3JhdGlvbiBzdGlsbCBjYXJyaWVzIHRoZSB2MiBhdHRyIHNoYXBlLiBPbmUgaW1wbGVtZW50YXRpb24sIHNvXG4vLyB0aGUgc2NoZW1hIGFuZCB0aGUgc2VyaWFsaXplciBjYW5ub3QgZHJpZnQgYXBhcnQgb24gd2hhdCBhbiBvbGQgbWFyayBtZWFucy5cbmV4cG9ydCBmdW5jdGlvbiB1cGdyYWRlRGVmaW5pdGlvbk1hcmsobTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB1bmtub3duIHtcbiAgbGV0IGNvbnRlbnQgPSBtLmNvbnRlbnQ7XG4gIGNvbnN0IHJlc3QgPSB7IC4uLm0gfTtcblxuICAvLyB2MSBcdTIxOTIgdjI6IGEgcGxhaW4gYGRlZmluaXRpb25gIHN0cmluZyBiZWNvbWVzIGEgc2luZ2xlIGlubGluZSB0ZXh0IHJ1bi5cbiAgaWYgKHR5cGVvZiByZXN0LmRlZmluaXRpb24gPT09ICdzdHJpbmcnICYmIGNvbnRlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHRleHQgPSByZXN0LmRlZmluaXRpb247XG4gICAgY29udGVudCA9IHRleHQgPyBbeyB0eXBlOiAndGV4dCcsIHRleHQgfV0gOiBbXTtcbiAgfVxuICBkZWxldGUgcmVzdC5kZWZpbml0aW9uO1xuXG4gIC8vIHYyIFx1MjE5MiB2MzogYW4gSU5MSU5FIGNvbnRlbnQgYXJyYXkgYmVjb21lcyBvbmUgcGFyYWdyYXBoIGJsb2NrLiBEZXRlY3RlZCBieVxuICAvLyBzaGFwZSwgbm90IGJ5IGEgdmVyc2lvbiBmaWVsZCBcdTIwMTQgYW4gaW5saW5lIG5vZGUgaXMgYSB0ZXh0IC8gbWF0aF9pbmxpbmUgL1xuICAvLyBoYXJkX2JyZWFrLCBub25lIG9mIHdoaWNoIGlzIGEgYmxvY2sgYHR5cGVgLCBzbyB0aGUgZmlyc3QgZWxlbWVudFxuICAvLyBkaXNjcmltaW5hdGVzIHVuYW1iaWd1b3VzbHkuIEFuIGVtcHR5IGFycmF5IGlzIGFscmVhZHkgdmFsaWQgYXQgYm90aFxuICAvLyB2ZXJzaW9ucyBhbmQgaXMgbGVmdCBhbG9uZS5cbiAgY29uc3QgSU5MSU5FX1RZUEVTID0gWyd0ZXh0JywgJ21hdGhfaW5saW5lJywgJ2hhcmRfYnJlYWsnXTtcbiAgaWYgKEFycmF5LmlzQXJyYXkoY29udGVudCkgJiYgY29udGVudC5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZmlyc3QgPSBjb250ZW50WzBdIGFzIHsgdHlwZT86IHVua25vd24gfSB8IHVuZGVmaW5lZDtcbiAgICBpZiAodHlwZW9mIGZpcnN0Py50eXBlID09PSAnc3RyaW5nJyAmJiBJTkxJTkVfVFlQRVMuaW5jbHVkZXMoZmlyc3QudHlwZSkpIHtcbiAgICAgIGNvbnRlbnQgPSBbeyB0eXBlOiAncGFyYWdyYXBoJywgY29udGVudCB9XTtcbiAgICB9XG4gIH1cblxuICAvLyB2MiBcdTIxOTIgdjMgKEQ3KTogdGhlIHNlcGFyYXRlIGBpbWFnZWAgYXR0ciBiZWNvbWVzIGEgdHJhaWxpbmcgaW1hZ2UgYmxvY2ssIHNvXG4gIC8vIHRoZXJlIGlzIGV4YWN0bHkgb25lIHdheSB0byBleHByZXNzIGFuIGltYWdlIGluIGEgZGVmaW5pdGlvbi4gQXBwZW5kZWRcbiAgLy8gQUZURVIgdGhlIHRleHQsIG1hdGNoaW5nIHdoZXJlIHRoZSBvbGQgcG9wb3ZlciByZW5kZXJlZCBpdC5cbiAgY29uc3QgaW1hZ2UgPSByZXN0LmltYWdlO1xuICBkZWxldGUgcmVzdC5pbWFnZTtcbiAgaWYgKGltYWdlICE9PSBudWxsICYmIHR5cGVvZiBpbWFnZSA9PT0gJ29iamVjdCcpIHtcbiAgICBjb25zdCB7IHNyYywgYWx0IH0gPSBpbWFnZSBhcyB7IHNyYz86IHVua25vd247IGFsdD86IHVua25vd24gfTtcbiAgICBpZiAodHlwZW9mIHNyYyA9PT0gJ3N0cmluZycgJiYgc3JjKSB7XG4gICAgICBjb25zdCBibG9ja3MgPSBBcnJheS5pc0FycmF5KGNvbnRlbnQpID8gWy4uLmNvbnRlbnRdIDogW107XG4gICAgICBibG9ja3MucHVzaCh7XG4gICAgICAgIHR5cGU6ICdpbWFnZScsXG4gICAgICAgIHNyYyxcbiAgICAgICAgYWx0OiB0eXBlb2YgYWx0ID09PSAnc3RyaW5nJyA/IGFsdCA6ICcnLFxuICAgICAgfSk7XG4gICAgICBjb250ZW50ID0gYmxvY2tzO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IC4uLnJlc3QsIGNvbnRlbnQ6IGNvbnRlbnQgPz8gW10gfTtcbn1cblxuZXhwb3J0IGNvbnN0IE1hcmsgPSB6LnByZXByb2Nlc3MoXG4gIChtKSA9PiB7XG4gICAgLy8gTGVnYWN5OiBtYXJrcyB3ZXJlIGJhcmUgc3RyaW5ncyAoJ2JvbGQnKS5cbiAgICBpZiAodHlwZW9mIG0gPT09ICdzdHJpbmcnKSByZXR1cm4geyB0eXBlOiBtIH07XG4gICAgaWYgKFxuICAgICAgbSAhPT0gbnVsbCAmJlxuICAgICAgdHlwZW9mIG0gPT09ICdvYmplY3QnICYmXG4gICAgICAobSBhcyB7IHR5cGU/OiB1bmtub3duIH0pLnR5cGUgPT09ICdkZWZpbml0aW9uJ1xuICAgICkge1xuICAgICAgcmV0dXJuIHVwZ3JhZGVEZWZpbml0aW9uTWFyayhtIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICB9XG4gICAgcmV0dXJuIG07XG4gIH0sXG4gIHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICAgIEJvbGRNYXJrLFxuICAgIEl0YWxpY01hcmssXG4gICAgVW5kZXJsaW5lTWFyayxcbiAgICBDb2RlTWFyayxcbiAgICBTdWJzY3JpcHRNYXJrLFxuICAgIFN1cGVyc2NyaXB0TWFyayxcbiAgICBEZWZpbml0aW9uTWFyayxcbiAgXSksXG4pO1xuZXhwb3J0IHR5cGUgTWFyayA9IHouaW5mZXI8dHlwZW9mIE1hcms+O1xuLy8gVGhlIHNldCBvZiBtYXJrIGB0eXBlYCBkaXNjcmltaW5hbnRzLCBmb3IgY2FsbGVycyB0aGF0IGFsbG93LWxpc3QgYnkgbmFtZS5cbmV4cG9ydCB0eXBlIE1hcmtUeXBlID0gTWFya1sndHlwZSddO1xuXG4vLyAtLS0tIFRleHQgbm9kZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGNvbnN0IFRleHROb2RlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3RleHQnKSxcbiAgdGV4dDogei5zdHJpbmcoKSxcbiAgLy8gRGVmYXVsdCB0byBlbXB0eSBtYXJrcyBhcnJheSBzbyBjYWxsZXJzIGRvbid0IG5lZWQgdG8gc3BlY2lmeSB3aGVuIG5vbmUuXG4gIG1hcmtzOiB6LmFycmF5KE1hcmspLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBUZXh0Tm9kZSA9IHouaW5mZXI8dHlwZW9mIFRleHROb2RlPjtcblxuLy8gLS0tLSBJbmxpbmVOb2RlIHVuaW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIElubGluZU5vZGUgaXMgdGhlIHN0YW5kYXJkIGlubGluZSBhbHBoYWJldC4gVXNlZCBieSBhbGwgYmxvY2tzIGV4Y2VwdFxuLy8gZmlsbF9pbl9ibGFuay4gRGVmaW5lZCBiZWZvcmUgQmxhbmtUb2tlbiBiZWNhdXNlIHRoZSBibGFuaydzIHJpY2ggZmVlZGJhY2tcbi8vIGZpZWxkcyAoaGludCwgbWlzdGFrZUZlZWRiYWNrKSByZXVzZSB0aGlzIHVuaW9uLlxuZXhwb3J0IGNvbnN0IElubGluZU5vZGUgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgVGV4dE5vZGUsXG4gIElubGluZU1hdGhOb2RlLFxuICBIYXJkQnJlYWtOb2RlLFxuXSk7XG5leHBvcnQgdHlwZSBJbmxpbmVOb2RlID0gei5pbmZlcjx0eXBlb2YgSW5saW5lTm9kZT47XG5cbi8vIC0tLS0gQmxhbmsgdG9rZW4gKGZpbGwtaW4tdGhlLWJsYW5rIG9ubHkpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCbGFua3MgbGl2ZSBJTlNJREUgdGhlIGlubGluZSBjb250ZW50IHN0cmVhbSBvZiBhIGZpbGxfaW5fYmxhbmsgYmxvY2sgXHUyMDE0XG4vLyBzdHVkZW50cyBzZWUgYSBwcm9tcHQgd2l0aCBvbmUgb3IgbW9yZSBpbmxpbmUgYmxhbmtzLiBFYWNoIGJsYW5rIGhhcyBhXG4vLyBzdGFibGUgaWQgKHJlZmVyZW5jZWQgaW4gc3VibWlzc2lvbnMucmVzcG9uc2VzLmJsYW5rc1s8aWQ+XSkgYW5kIGFuIGFuc3dlclxuLy8ga2V5LlxuLy9cbi8vIHdpZHRoIGlzIGluIENTUyBjaGFycyAoYGNoYCB1bml0cykgXHUyMDE0IHVzZWQgdG8gc2l6ZSB0aGUgaW5wdXQuIE9wdGlvbmFsXG4vLyBiZWNhdXNlIHRoZSByZW5kZXJlciBoYXMgYSBzZW5zaWJsZSBkZWZhdWx0ICh+NiBjaGFycykuXG4vL1xuLy8gaGludCBhbmQgbWlzdGFrZUZlZWRiYWNrIGFyZSB0aGUgcGVyLWJsYW5rIGZlZWRiYWNrIGxheWVycyAoYmxvY2stbGV2ZWxcbi8vIGZpZWxkcyBcdTIwMTQgc29sdXRpb24sIGhhc0NvbmZpZGVuY2VSYXRpbmcsIHNraWxscyBcdTIwMTQgbGl2ZSBvbiBGaWxsSW5CbGFua0Jsb2NrKS5cbi8vIEJvdGggY2FycnkgcmljaCBpbmxpbmUgY29udGVudCAoSW5saW5lTm9kZVtdOiBmb3JtYXR0ZWQgdGV4dCArIGlubGluZSBtYXRoKVxuLy8gc28gZmVlZGJhY2sgY2FuIGluY2x1ZGUgdGhlIHNhbWUgZm9ybWF0dGluZyBhbmQgbWF0aCBhcyBwcm9ibGVtIHByb3NlLlxuLy8gVGhlIHJ1bnRpbWUgcmVhZHMgYm90aCBhdCBpbml0IGJ1dCBkb2VzIE5PVCBpbmplY3QgYW55dGhpbmcgaW50byB0aGUgRE9NXG4vLyB1bnRpbCB0aGUgc3R1ZGVudCBjbGlja3MgXCJDaGVjayB0aGlzIHNlY3Rpb24uXCIgT24gYSB3cm9uZyBhbnN3ZXIsIHRoZVxuLy8gcnVudGltZSBmaXJzdCBsb29rcyBmb3IgYSBtYXRjaGluZyBtaXN0YWtlRmVlZGJhY2sgZW50cnkgKGV4YWN0IHN0cmluZ1xuLy8gbWF0Y2ggZm9yIFBoYXNlIDEpOyBpZiBub25lIG1hdGNoZXMsIGl0IGZhbGxzIGJhY2sgdG8gaGludDsgaWYgaGludCBpc1xuLy8gYWxzbyBhYnNlbnQsIGl0IHNob3dzIHRoZSBnZW5lcmljIFx1MjcxNy5cbmV4cG9ydCBjb25zdCBCbGFua1Rva2VuID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2JsYW5rJyksXG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgYW5zd2VyOiB6LnN0cmluZygpLm1pbigxKSxcbiAgLy8gQWx0ZXJuYXRpdmUgY29ycmVjdCBhbnN3ZXJzLiBFbXB0eSBhcnJheSBpcyB0aGUgY29tbW9uIGNhc2UuXG4gIGFjY2VwdGFibGVBbnN3ZXJzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICB3aWR0aDogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC8vIE9wdGlvbmFsIHRlYWNoZXItYXV0aG9yZWQgbnVkZ2Ugc2hvd24gd2hlbiB0aGlzIGJsYW5rIGlzIHdyb25nIGFuZCBub1xuICAvLyBtaXN0YWtlRmVlZGJhY2sgZW50cnkgbWF0Y2hlcy4gUmljaCBpbmxpbmUgY29udGVudCAoZm9ybWF0dGVkIHRleHQgKyBtYXRoKS5cbiAgaGludDogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICAvLyBPcHRpb25hbCBsaXN0IG9mIGFudGljaXBhdGVkIHdyb25nIGFuc3dlcnMgcGFpcmVkIHdpdGggc3BlY2lmaWMgZmVlZGJhY2suXG4gIC8vIElmIHRoZSBzdHVkZW50J3Mgd3JvbmcgYW5zd2VyIG1hdGNoZXMgYSBgbWF0Y2hgIHN0cmluZyAoUGhhc2UgMTogZXhhY3RcbiAgLy8gbWF0Y2g7IHRoZSBzdHJhdGVneS1kaXNwYXRjaCBob29rIGluIHRoZSBydW50aW1lIHN1cHBvcnRzIHNtYXJ0ZXJcbiAgLy8gbWF0Y2hpbmcgbGF0ZXIpLCB0aGUgY29ycmVzcG9uZGluZyBmZWVkYmFjayBpcyBzaG93biBpbnN0ZWFkIG9mIHRoZVxuICAvLyBnZW5lcmljIGhpbnQuIEZpcnN0IG1hdGNoIHdpbnMuIGBmZWVkYmFja2AgaXMgcmljaCBpbmxpbmUgY29udGVudC5cbiAgbWlzdGFrZUZlZWRiYWNrOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICBtYXRjaDogei5zdHJpbmcoKSxcbiAgICBmZWVkYmFjazogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgfSkpLm9wdGlvbmFsKCksXG4gIC8vIE9yZGVyLWluZGVwZW5kZW50IGFuc3dlciBncm91cGluZy4gV2hlbiB0cnVlLCB0aGlzIGJsYW5rJ3MgYW5zd2VyIGlzXG4gIC8vIGludGVyY2hhbmdlYWJsZSB3aXRoIHRoZSBibGFuayBpbW1lZGlhdGVseSBiZWZvcmUgaXQgKGluIGRvY3VtZW50IG9yZGVyLFxuICAvLyB3aXRoaW4gdGhlIHNhbWUgYmxvY2spIFx1MjAxNCBlLmcuIGZhY3RvcmluZyBgKHggKyBcdTI2MTApKHggKyBcdTI2MTApYCB3aGVyZSAoMiwzKSBhbmRcbiAgLy8gKDMsMikgYXJlIGJvdGggY29ycmVjdCBidXQgKDIsMikgaXMgbm90LiBBIFwiZ3JvdXBcIiBpcyBhIG1heGltYWwgcnVuIG9mXG4gIC8vIGFkamFjZW50IGJsYW5rcyBlYWNoIGZsYWdnZWQgaGVyZTsgdGhlIHJlbmRlcmVyIGNvbXBpbGVzIHJ1bnMgaW50byBhXG4gIC8vIHNoYXJlZCBgZGF0YS1ibGFuay1ncm91cGAgaWQsIGFuZCB0aGUgcnVudGltZSBzY29yZXMgdGhlIGdyb3VwIHdpdGhcbiAgLy8gY29uc3VtZS1vbmNlIG1hdGNoaW5nIChlYWNoIGNvcnJlY3QgYW5zd2VyIGNhbiBzYXRpc2Z5IG9ubHkgb25lIGJsYW5rKS5cbiAgLy9cbiAgLy8gVGhpcyBib29sZWFuIGlzIGF1dGhvcmluZyAqc3VnYXIqOiB0aGUgZ2VuZXJhbCBtb2RlbCBsaXZlcyBpbiB0aGUgcnVudGltZVxuICAvLyBkYXRhLWF0dHJpYnV0ZSBjb250cmFjdCAoZ3JvdXAgaWRzKSwgc28gcmljaGVyIGdyb3VwaW5nIChub24tYWRqYWNlbnQsXG4gIC8vIGNyb3NzLWJsb2NrKSBjYW4gYmUgYWRkZWQgbGF0ZXIgYXMgYW4gYWRkaXRpdmUgYGdyb3VwYCBmaWVsZCB3aXRob3V0IGFcbiAgLy8gYnJlYWtpbmcgY2hhbmdlLiBUaGUgZmlyc3QgYmxhbmsgaW4gYSBibG9jayBpZ25vcmVzIHRoaXMgZmxhZyAobm9cbiAgLy8gcHJldmlvdXMgYmxhbmsgdG8gZ3JvdXAgd2l0aCkuXG4gIGludGVyY2hhbmdlYWJsZVdpdGhQcmV2aW91czogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIEFuc3dlciBpbnRlcnByZXRhdGlvbiBtb2RlLiBBYnNlbnQgKD0gJ3RleHQnKSBrZWVwcyB0aGUgUGhhc2UgMSBiZWhhdmlvcjpcbiAgLy8gZXhhY3Qgc3RyaW5nIG1hdGNoIGFnYWluc3QgYW5zd2VyICsgYWNjZXB0YWJsZUFuc3dlcnMuICdudW1lcmljJyB0ZWxscyB0aGVcbiAgLy8gcnVudGltZSB0byBwYXJzZSBCT1RIIHRoZSB0eXBlZCB2YWx1ZSBhbmQgZWFjaCBrZXkgZW50cnkgbnVtZXJpY2FsbHlcbiAgLy8gKGRlY2ltYWxzLCBmcmFjdGlvbnMgbGlrZSAzLzIsIG1peGVkIG51bWJlcnMgbGlrZSBcIjEgMS8yXCIsIGNvbW1hXG4gIC8vIHNlcGFyYXRvcnMsIGEgbGVhZGluZyAkKSBhbmQgY29tcGFyZSB3aXRoaW4gYHRvbGVyYW5jZWAgXHUyMDE0IHNvIDAuNSwgMS8yLFxuICAvLyBhbmQgLjUwIGFsbCBzYXRpc2Z5IGFuIGFuc3dlciBvZiBcIjEvMlwiLiBPcHRpb25hbCByYXRoZXIgdGhhbiBkZWZhdWx0ZWQgc29cbiAgLy8gZG9jdW1lbnRzIHN0b3JlZCBiZWZvcmUgdGhpcyBmaWVsZCBleGlzdGVkIHJlLXNlcmlhbGl6ZSBieXRlLWlkZW50aWNhbGx5LlxuICAvLyAnbWF0aCcgKE1vZGVsIEIgbWF0aCBibGFua3MpIGdyYWRlcyB0aGUgdHlwZWQgdmFsdWUgYXMgYSBtYXRoIEVYUFJFU1NJT046XG4gIC8vIHRoZSBydW50aW1lIGxhenktbG9hZHMgdGhlIGdyYXBoLWtpdCBhbmQgY29tcGFyZXMgYnkgbnVtZXJpYy1zYW1wbGluZ1xuICAvLyBlcXVpdmFsZW5jZSAoMmEgXHUyMjYxIGErYSBcdTIyNjEgYSoyKSwgTk9UIHN0cmluZyBtYXRjaC4gU2VlIGRvY3MvZGVzaWduL21hdGgtYmxhbmtzLm1kLlxuICBhbnN3ZXJUeXBlOiB6LmVudW0oWyd0ZXh0JywgJ251bWVyaWMnLCAnbWF0aCddKS5vcHRpb25hbCgpLFxuICAvLyBBYnNvbHV0ZSBjb21wYXJpc29uIHRvbGVyYW5jZS4gRm9yICdudW1lcmljJzogfHR5cGVkIC0ga2V5fCA8PSB0b2xlcmFuY2UuXG4gIC8vIEZvciAnbWF0aCc6IHRoZSBhYnNvbHV0ZSB0b2xlcmFuY2UgcGFzc2VkIHRvIHRoZSBzYW1wbGluZyBjb21wYXJpc29uLlxuICAvLyBBYnNlbnQgPSBleGFjdCBlcXVhbGl0eSAobnVtZXJpYykgLyBubyBleHRyYSBzbGFjayAobWF0aCkuXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbiAgLy8gRXF1aXZhbGVuY2UgbW9kZSBmb3IgJ21hdGgnIGJsYW5rczogJ3ZhbHVlJyAoZGVmYXVsdCwgYW55IGV4cHJlc3Npb24gdGhhdFxuICAvLyBldmFsdWF0ZXMgZXF1YWwpIG9yICdleGFjdC1mb3JtJyAobm9ybWFsaXplZC1zdHJpbmcgbWF0Y2ggXHUyMDE0IFwid3JpdGUgaXQgaW5cbiAgLy8gdGhpcyBmb3JtXCIpLiBPbmx5IG1lYW5pbmdmdWwgd2hlbiBhbnN3ZXJUeXBlIGlzICdtYXRoJzsgYWJzZW50ID0gJ3ZhbHVlJy5cbiAgZXF1aXZhbGVuY2U6IHouZW51bShbJ3ZhbHVlJywgJ2V4YWN0LWZvcm0nXSkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQmxhbmtUb2tlbiA9IHouaW5mZXI8dHlwZW9mIEJsYW5rVG9rZW4+O1xuXG4vLyAtLS0tIEZpbGxJbkJsYW5rSW5saW5lIHVuaW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRmlsbEluQmxhbmtJbmxpbmUgaXMgdGhlIGV4dGVuZGVkIGFscGhhYmV0IGZvciBmaWxsX2luX2JsYW5rIGJsb2NrcyBvbmx5LlxuLy8gSW5jbHVkZXMgQmxhbmtUb2tlbiBpbiBhZGRpdGlvbiB0byB0aGUgc3RhbmRhcmQgaW5saW5lIG5vZGVzLlxuZXhwb3J0IGNvbnN0IEZpbGxJbkJsYW5rSW5saW5lID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFRleHROb2RlLFxuICBJbmxpbmVNYXRoTm9kZSxcbiAgSGFyZEJyZWFrTm9kZSxcbiAgQmxhbmtUb2tlbixcbl0pO1xuZXhwb3J0IHR5cGUgRmlsbEluQmxhbmtJbmxpbmUgPSB6LmluZmVyPHR5cGVvZiBGaWxsSW5CbGFua0lubGluZT47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuZXhwb3J0IGNvbnN0IFBhcmFncmFwaEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgncGFyYWdyYXBoJyksXG4gIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG59KTtcbmV4cG9ydCB0eXBlIFBhcmFncmFwaEJsb2NrID0gei5pbmZlcjx0eXBlb2YgUGFyYWdyYXBoQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vIFRocmVlIGxldmVscyBpcyBhIGRlbGliZXJhdGUgY29uc3RyYWludC4gV29ya3NoZWV0cyBkb24ndCBuZWVkIGRlZXBlclxuLy8gaGllcmFyY2h5IGFuZCBjYXBwaW5nIGl0IGF0IDMga2VlcHMgdGhlIHZpc3VhbCBoaWVyYXJjaHkgbWVhbmluZ2Z1bC5cbmV4cG9ydCBjb25zdCBIZWFkaW5nTGV2ZWwgPSB6LnVuaW9uKFt6LmxpdGVyYWwoMSksIHoubGl0ZXJhbCgyKSwgei5saXRlcmFsKDMpXSk7XG5leHBvcnQgdHlwZSBIZWFkaW5nTGV2ZWwgPSB6LmluZmVyPHR5cGVvZiBIZWFkaW5nTGV2ZWw+O1xuXG5leHBvcnQgY29uc3QgSGVhZGluZ0Jsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnaGVhZGluZycpLFxuICBsZXZlbDogSGVhZGluZ0xldmVsLFxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxufSk7XG5leHBvcnQgdHlwZSBIZWFkaW5nQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBIZWFkaW5nQmxvY2s+O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBsYWJlbC50cyBcdTIwMTQgU2hhcmVkIHBlci1ibG9jayBkaXNwbGF5LWxhYmVsIGZyYWdtZW50IChudW1iZXJpbmcvbGFiZWwgZGVjb3VwbGUpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRGVjb3VwbGVzIFwiaXMgdGhpcyBncmFkZWFibGU/XCIgZnJvbSBcImRvZXMgaXQgd2VhciBhIHByb2JsZW0gbnVtYmVyP1wiLiBBXG4vLyBncmFkZWFibGUgYmxvY2sgaXMgYWx3YXlzIHNjb3JlZCBhbmQgYWx3YXlzIHJldmlld2FibGU7IHRoaXMgZmllbGQgY29udHJvbHNcbi8vIG9ubHkgd2hhdCBzaG93cyBvbiB0aGUgcGFnZTpcbi8vXG4vLyAgIGF1dG8gICBcdTIwMTQgdGhlIGRlZmF1bHQ6IGEgbnVtYmVyZWQgcHJvYmxlbSwgY29uc3VtaW5nIG9uZSBzbG90IG9mIHRoZVxuLy8gICAgICAgICAgICBkb2N1bWVudC13aWRlIHNlcXVlbmNlICh0b2RheSdzIGJlaGF2aW9yIGZvciBldmVyeSBncmFkZWFibGUgYmxvY2spLlxuLy8gICBjdXN0b20gXHUyMDE0IHNob3cgYXV0aG9yZWQgdGV4dCAoXCJXYXJtLXVwXCIsIFwiQ2hhbGxlbmdlXCIpIGluc3RlYWQgb2YgYSBudW1iZXIsXG4vLyAgICAgICAgICAgIGFuZCBET04nVCBjb25zdW1lIGEgc2VxdWVuY2Ugc2xvdCAob3V0LW9mLXNlcXVlbmNlIGxhYmVsKS5cbi8vICAgbm9uZSAgIFx1MjAxNCBzaG93IG5vdGhpbmc7IERPTidUIGNvbnN1bWUgYSBzbG90LiBUaGUgbm90ZXMga2V5d29yZC1ibGFuayBjYXNlOlxuLy8gICAgICAgICAgICBhIGdyYWRlYWJsZSBnYXAgdGhhdCBrZWVwcyBzdHVkZW50cyByZWFkaW5nIHdpdGhvdXQgbG9va2luZyBsaWtlIGFcbi8vICAgICAgICAgICAgcXVpeiBxdWVzdGlvbi4gU3RpbGwgc2NvcmVkLCBzdGlsbCBpbiB0aGUgdGVhY2hlcidzIHJlc3VsdHMgdmlld1xuLy8gICAgICAgICAgICAobG9jYXRlZCBieSBpdHMgc3Vycm91bmRpbmcgdGV4dCwgbm90IGEgbnVtYmVyKS5cbi8vXG4vLyBPcHRpb25hbCB3aXRoIE5PIGRlZmF1bHQsIGV4YWN0bHkgbGlrZSBzaXppbmdGaWVsZHMgYW5kIG1hdGhfYmxvY2sucHJvbXB0czpcbi8vIGFuIGFic2VudCBgbGFiZWxgIG1lYW5zIGBhdXRvYCwgc28gYSBibG9jayBhdXRob3JlZCBiZWZvcmUgdGhpcyBmZWF0dXJlIFx1MjAxNCBvclxuLy8gb25lIGxlZnQgYXQgdGhlIGRlZmF1bHQgXHUyMDE0IHJlLXNlcmlhbGl6ZXMgQllURS1JREVOVElDQUxMWS4gVGhlIHJlbmRlcmVyIGFuZFxuLy8gZWRpdG9yIHRyZWF0IGB1bmRlZmluZWRgIGFuZCBge21vZGU6J2F1dG8nfWAgaWRlbnRpY2FsbHkuXG4vL1xuLy8gVGhlIHBlci1ibG9jayBtYW51YWwgaW50ZWdlciBgbnVtYmVyYCBvdmVycmlkZSBpcyBvcnRob2dvbmFsIGFuZCBzdGlsbCBsaXZlc1xuLy8gb24gdGhlIGluZGl2aWR1YWwgYmxvY2tzOiBpdCByZWxhYmVscyB0aGUgc2hvd24gaW50ZWdlciB3aGlsZSBTVEFZSU5HIGluXG4vLyBzZXF1ZW5jZSwgYW5kIGl0IGFwcGxpZXMgb25seSB3aGVuIHRoZSBsYWJlbCBtb2RlIGlzIGF1dG8gKGN1c3RvbS9ub25lIHdpbikuXG4vLyBTZWUgZG9jcy9kZXNpZ24gKyBibG9jay1wcmVkaWNhdGVzLnRzLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5cbmV4cG9ydCBjb25zdCBCbG9ja0xhYmVsID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ21vZGUnLCBbXG4gIHoub2JqZWN0KHsgbW9kZTogei5saXRlcmFsKCdhdXRvJykgfSksXG4gIC8vIG1pbigxKTogYW4gZW1wdHkgY3VzdG9tIGxhYmVsIGlzIG1lYW5pbmdsZXNzIFx1MjAxNCBhdXRob3IgZWl0aGVyIHdhbnRzIHRleHQgb3JcbiAgLy8gd2FudHMgYG5vbmVgLiBLZWVwcyByb3VuZC10cmlwIGhvbmVzdCAobm8gZW1wdHktc3RyaW5nIGdob3N0cykuXG4gIHoub2JqZWN0KHsgbW9kZTogei5saXRlcmFsKCdjdXN0b20nKSwgdGV4dDogei5zdHJpbmcoKS5taW4oMSkgfSksXG4gIHoub2JqZWN0KHsgbW9kZTogei5saXRlcmFsKCdub25lJykgfSksXG5dKTtcbmV4cG9ydCB0eXBlIEJsb2NrTGFiZWwgPSB6LmluZmVyPHR5cGVvZiBCbG9ja0xhYmVsPjtcblxuLy8gU3ByZWFkIGludG8gYSBncmFkZWFibGUgYmxvY2sncyB6Lm9iamVjdCh7Li4ufSkgc2hhcGUuIFBsYWluIG9iamVjdCAobm90IGEgWm9kXG4vLyBzY2hlbWEpIHNvIGVhY2ggYmxvY2sga2VlcHMgYSBmbGF0IGZpZWxkIGxpc3QgYW5kIGRpc2NyaW1pbmF0ZWRVbmlvbiBrZWVwc1xuLy8gd29ya2luZywgbWlycm9yaW5nIHNpemluZ0ZpZWxkcy5cbmV4cG9ydCBjb25zdCBsYWJlbEZpZWxkcyA9IHtcbiAgbGFiZWw6IEJsb2NrTGFiZWwub3B0aW9uYWwoKSxcbn07XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBzaXppbmdGaWVsZHMgfSBmcm9tICcuLi9zaXppbmcuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5pbXBvcnQgeyBNYXRoUHJvbXB0LCBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gRGlzcGxheSBtYXRoIChjZW50ZXJlZCwgZnVsbCB3aWR0aCBieSBkZWZhdWx0KS4gSW5saW5lIG1hdGggaXMgaW4gaW5saW5lLnRzXG4vLyBhcyBJbmxpbmVNYXRoTm9kZS4gVGhleSdyZSBzZXBhcmF0ZSBub2RlIHR5cGVzIGJlY2F1c2UgdGhleSByZW5kZXJcbi8vIGRpZmZlcmVudGx5IGFuZCBoYXZlIGRpZmZlcmVudCBzZW1hbnRpYyBtZWFuaW5nLlxuZXhwb3J0IGNvbnN0IE1hdGhCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ21hdGhfYmxvY2snKSxcbiAgbGF0ZXg6IHouc3RyaW5nKCksXG4gIC8vIE1vZGVsIEE6IG9wdGlvbmFsIGluLWVxdWF0aW9uIGdyYWRlYWJsZSBnYXBzIChcdTAwQTdNYXRoUHJvbXB0LCBpbmxpbmUudHMpLlxuICAvLyBPcHRpb25hbCB3aXRoIE5PIGRlZmF1bHQgc28gYSBtYXRoIGJsb2NrIGF1dGhvcmVkIGJlZm9yZSBNb2RlbCBBIFx1MjAxNCBvciBvbmVcbiAgLy8gd2l0aCBubyBnYXBzIFx1MjAxNCByZS1zZXJpYWxpemVzIEJZVEUtSURFTlRJQ0FMTFkuIFNlZSBkb2NzL2Rlc2lnbi9tYXRoLWJsYW5rcy5tZC5cbiAgcHJvbXB0czogei5hcnJheShNYXRoUHJvbXB0KS5vcHRpb25hbCgpLFxuICAvLyBXb3JrZWQgZXhwbGFuYXRpb24gcmV2ZWFsZWQgcG9zdC1jaGVjaywgbWlycm9yaW5nIEZpbGxJbkJsYW5rQmxvY2suc29sdXRpb24uXG4gIC8vIE9wdGlvbmFsOyBvbmx5IG1lYW5pbmdmdWwgb24gYSBnYXAtYmVhcmluZyBlcXVhdGlvbi4gTmV2ZXIgbGVha3MgdGhlIGdhcFxuICAvLyBhbnN3ZXIgZGlyZWN0bHkgKHRoZSBzYW5jdGlvbmVkIHJldmVhbCwgcGVyIHRoZSBydW50aW1lJ3Mgbm8tbGVhayBzdGFuY2UpLlxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICAvLyBWYXJpYWJsZSBibG9jayBzaXppbmc6IG9wdGlvbmFsIHdpZHRoIGZyYWN0aW9uICsgYWxpZ25tZW50IChzaXppbmcudHMpLlxuICAuLi5zaXppbmdGaWVsZHMsXG4gIC8vIFBlci1ibG9jayBkaXNwbGF5IGxhYmVsIFx1MjAxNCBhIGdhcC1iZWFyaW5nIGVxdWF0aW9uIGlzIGEgbnVtYmVyZWQgcHJvYmxlbSBieVxuICAvLyBkZWZhdWx0OyBjdXN0b20vbm9uZSBvcHQgb3V0IChudW1iZXJpbmcvbGFiZWwgZGVjb3VwbGUpLiBJbmVydCBvbiBhXG4gIC8vIHByb21wdC1mcmVlIGRpc3BsYXkgZXF1YXRpb24gKGl0J3MgbmV2ZXIgbnVtYmVyZWQgcmVnYXJkbGVzcykuIFNlZSBsYWJlbC50cy5cbiAgLi4ubGFiZWxGaWVsZHMsXG59KTtcbmV4cG9ydCB0eXBlIE1hdGhCbG9jayA9IHouaW5mZXI8dHlwZW9mIE1hdGhCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gRm91ciB2YXJpYW50cyBpcyBhIGRlbGliZXJhdGUgY29uc3RyYWludC4gTW9yZSB0aGFuIHRoaXMgYW5kIHN0eWxpbmdcbi8vIGJlY29tZXMgaW5jb25zaXN0ZW50IGFjcm9zcyB3b3Jrc2hlZXRzLiBBZGRpbmcgYSBuZXcgdmFyaWFudCBsYXRlciBpcyBhXG4vLyBicmVha2luZyBzY2hlbWEgY2hhbmdlIFx1MjAxNCBjb25zaWRlciB0aGF0IGJlZm9yZSBleHRlbmRpbmcuXG5leHBvcnQgY29uc3QgQ2FsbG91dFZhcmlhbnQgPSB6LmVudW0oWydpbmZvJywgJ3dhcm5pbmcnLCAnc3VjY2VzcycsICdub3RlJ10pO1xuZXhwb3J0IHR5cGUgQ2FsbG91dFZhcmlhbnQgPSB6LmluZmVyPHR5cGVvZiBDYWxsb3V0VmFyaWFudD47XG5cbmV4cG9ydCBjb25zdCBDYWxsb3V0QmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdjYWxsb3V0JyksXG4gIHZhcmlhbnQ6IENhbGxvdXRWYXJpYW50LFxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxufSk7XG5leHBvcnQgdHlwZSBDYWxsb3V0QmxvY2sgPSB6LmluZmVyPHR5cGVvZiBDYWxsb3V0QmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vIEF1dG8tbnVtYmVyZWQgYXQgcmVuZGVyIHRpbWUgYnkgd2Fsa2luZyB0aGUgZG9jdW1lbnQgYW5kIGNvdW50aW5nIHByb2JsZW1cbi8vIGJsb2NrcyBpbiBvcmRlci4gVGhlIG9wdGlvbmFsIGBudW1iZXJgIGZpZWxkIG92ZXJyaWRlcyB0aGUgYXV0by1udW1iZXJcbi8vIChyYXJlIGNhc2VzIGxpa2UgXCJQcm9ibGVtIDVhXCIgb3IgaGFuZC1udW1iZXJlZCBsZWdhY3kgd29ya3NoZWV0cykuXG4vL1xuLy8gc29sdXRpb246IG9wdGlvbmFsIHdvcmtlZCBleHBsYW5hdGlvbiBzaG93biB0byBhbGwgc3R1ZGVudHMgYWZ0ZXIgdGhlXG4vLyBzZWN0aW9uIGlzIGNoZWNrZWQgKG9yIGFmdGVyIGZpbmFsIHN1Ym1pdCBpbiBzaW5nbGUtbW9kZSBhY3Rpdml0aWVzKSxcbi8vIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGV5IGFuc3dlcmVkIGNvcnJlY3RseS4gRGlmZmVyZW50IGZyb20gaGludCBcdTIwMTRcbi8vIGhpbnRzIG51ZGdlIGR1cmluZyB0aGUgYXR0ZW1wdDsgc29sdXRpb25zIGV4cGxhaW4gYWZ0ZXIuIFRoZSBydW50aW1lXG4vLyByZWFkcyB0aGlzIG9uIGluaXQgYnV0IGRvZXMgTk9UIGluamVjdCBpdCBpbnRvIHRoZSBET00gdW50aWwgYWZ0ZXJcbi8vIGNoZWNrIChQaGFzZSAxIHNlY3VyaXR5IGNlaWxpbmcgXHUyMDE0IGRvbid0IG1ha2UgdGhlIGxlYWsgd29yc2UpLlxuLy9cbi8vIHNraWxsczogb3B0aW9uYWwgYXJyYXkgb2YgdW5pdmVyc2FsIHNraWxsIHRhZ3MgdGhpcyBwcm9ibGVtIHRhcmdldHMuXG4vLyBBY3Rpdml0eS1sZXZlbCBza2lsbHMgbGl2ZSBvbiBBY3Rpdml0eU1ldGE7IHRoaXMgZmllbGQgY2FwdHVyZXNcbi8vIHByb2JsZW0tbGV2ZWwgZ3JhbnVsYXJpdHkgZm9yIGZ1dHVyZSBwZXItc2tpbGwgYW5hbHl0aWNzLiBFZGl0b3IgVUkgaXNcbi8vIFBoYXNlIDI7IHRoZSBmaWVsZCBleGlzdHMgaW4gUGhhc2UgMSBzbyBhbmFseXRpY3MgY2FuIHJlYWNoIGJhY2suXG5leHBvcnQgY29uc3QgUHJvYmxlbUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogei5saXRlcmFsKCdwcm9ibGVtJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBQcm9ibGVtQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBQcm9ibGVtQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgRmlsbEluQmxhbmtJbmxpbmUsIElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5cbi8vIFRoZSBhcmNoaXRlY3R1cmFsbHkgaW50ZXJlc3RpbmcgYmxvY2suIGNvbnRlbnQgaXMgYW4gYXJyYXkgb2YgaW5saW5lIG5vZGVzXG4vLyB0aGF0IG1heSBpbmNsdWRlIEJsYW5rVG9rZW4gXHUyMDE0IHN0dWRlbnRzIHNlZSBwcm9zZSB3aXRoIGVkaXRhYmxlIGJsYW5rcy5cbi8vIEVhY2ggYmxhbmsncyBpZCBpcyBhIHN0YWJsZSByZWZlcmVuY2UgdXNlZCBpbiBzdWJtaXNzaW9ucy5yZXNwb25zZXMsIHNvXG4vLyByZW9yZGVyaW5nIGJsb2NrcyBkb2Vzbid0IGJyZWFrIGdyYWRpbmcgb24gcGFzdCBzdWJtaXNzaW9ucy5cbi8vXG4vLyBhdXRvLW51bWJlcmVkIGxpa2UgUHJvYmxlbUJsb2NrIGZvciB0aGUgcHJvYmxlbSBoZWFkZXIgKGUuZy4sIFwiUHJvYmxlbSAzXCIpLlxuLy8gV2h5IG5vdCBqdXN0IHVzZSBQcm9ibGVtQmxvY2s/IFRoZXkgaGF2ZSBkaWZmZXJlbnQgcmVuZGVyaW5nIGFuZCBkaWZmZXJlbnRcbi8vIHN0dWRlbnQgaW50ZXJhY3Rpb247IGNvbmZsYXRpbmcgdGhlbSB3b3VsZCBmb3JjZSBldmVyeSBwcm9ibGVtIHRvIGVpdGhlclxuLy8gaGF2ZSBvciBub3QgaGF2ZSBibGFua3MsIGluc3RlYWQgb2YgYmVpbmcgYSBwZXItcHJvYmxlbSBkZWNpc2lvbi5cbi8vXG4vLyBQZXItYmxhbmsgZmllbGRzIChoaW50LCBtaXN0YWtlRmVlZGJhY2spIGxpdmUgb24gQmxhbmtUb2tlbiBpbiBpbmxpbmUudHMuXG4vLyBQZXItYmxvY2sgZmllbGRzIGJlbG93OlxuLy8gICAtIHNvbHV0aW9uOiBvbmUgd29ya2VkIGV4cGxhbmF0aW9uIGZvciB0aGUgd2hvbGUgcHJvYmxlbSAoYSBcInNpbXBsaWZ5XG4vLyAgICAgX194XHUwMEIyICsgX194IC0gMTJcIiBwcm9tcHQgaGFzIG9uZSBzb2x1dGlvbiBjb3ZlcmluZyBhbGwgYmxhbmtzLCBub3Qgb25lXG4vLyAgICAgcGVyIGJsYW5rKS4gU2hvd24gcG9zdC1jaGVjayByZWdhcmRsZXNzIG9mIGNvcnJlY3RuZXNzLlxuLy8gICAtIGhhc0NvbmZpZGVuY2VSYXRpbmc6IHdoZW4gdHJ1ZSwgc3R1ZGVudHMgc2VlIGEgMy1wb2ludCBjb25maWRlbmNlXG4vLyAgICAgc2VsZWN0b3IgKHVuc3VyZSAvIHRoaW5rX3NvIC8gY2VydGFpbikgZm9yIHRoaXMgcHJvYmxlbSBiZWZvcmVcbi8vICAgICBjaGVja2luZy4gQXNrZWQgb25jZSBwZXIgcHJvYmxlbSwgbm90IHBlciBibGFuay4gVGhlIHJ1bnRpbWUgc3RvcmVzXG4vLyAgICAgdGhlIHJhdGluZyBwZXItYmxhbmsgaW4gU3VibWlzc2lvblJlc3BvbnNlcyAoYXBwbGllZCB1bmlmb3JtbHkgdG9cbi8vICAgICBldmVyeSBibGFuayBpbiB0aGlzIHByb2JsZW0pLlxuLy8gICAtIHNraWxsczogdW5pdmVyc2FsIHNraWxsIHRhZ3MgKHNlZSBBY3Rpdml0eU1ldGEuc2tpbGxzKS4gRWRpdG9yIFVJIGZvclxuLy8gICAgIHRoaXMgZmllbGQgaXMgUGhhc2UgMjsgZmllbGQgZXhpc3RzIGluIFBoYXNlIDEgc28gcGVyLXNraWxsIGFuYWx5dGljc1xuLy8gICAgIGNhbiByZWFjaCBiYWNrIHRvIFBoYXNlIDEgcHJvYmxlbXMgd2hlbiB0aGUgZWRpdG9yIGxhbmRzLlxuLy8gICAtIHdvcmtTcGFjZTogcGVyLXByb2JsZW0gb3ZlcnJpZGUgKGluIHJlbSkgZm9yIHRoZSBibGFuayB3b3JraW5nIHNwYWNlXG4vLyAgICAgcHJpbnRlZCBiZWxvdyB0aGlzIHByb2JsZW0uIE9wdGlvbmFsIHdpdGggTk8gZGVmYXVsdCBvbiBwdXJwb3NlOiBhblxuLy8gICAgIGFic2VudCB2YWx1ZSBtZWFucyBcImluaGVyaXQgdGhlIGFjdGl2aXR5LWxldmVsIHByaW50LndvcmtTcGFjZVwiLCB3aGljaFxuLy8gICAgIGlzIGV4YWN0bHkgdGhlIENTUy1jdXN0b20tcHJvcGVydHkgaW5oZXJpdGFuY2UgdGhlIHJlbmRlcmVyIHJlbGllcyBvblxuLy8gICAgICh0aGUgYmxvY2sgc2V0cyBpdHMgb3duIC0tcHJpbnQtd29yay1zcGFjZSBvbmx5IHdoZW4gdGhpcyBpcyBwcmVzZW50KS5cbi8vICAgICBBIGRlZmF1bHQgaGVyZSB3b3VsZCBwaW4gZXZlcnkgYmxvY2sgdG8gYSBjb25jcmV0ZSB2YWx1ZSBhbmQgZGVmZWF0XG4vLyAgICAgdGhhdCBpbmhlcml0YW5jZS4gUHJpbnQtb25seTsgaWdub3JlZCBvbiBzY3JlZW4uXG5leHBvcnQgY29uc3QgRmlsbEluQmxhbmtCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB6LmxpdGVyYWwoJ2ZpbGxfaW5fYmxhbmsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogei5hcnJheShGaWxsSW5CbGFua0lubGluZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NvbmZpZGVuY2VSYXRpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtTcGFjZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGVyLWJsb2NrIGRpc3BsYXkgbGFiZWwgKGF1dG8vY3VzdG9tL25vbmUpLiBBYnNlbnQgPSBhdXRvID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdG9kYXkncyBudW1iZXJlZCBiZWhhdmlvci4gU2VlIGxhYmVsLnRzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5sYWJlbEZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgRmlsbEluQmxhbmtCbG9jayA9IHouaW5mZXI8dHlwZW9mIEZpbGxJbkJsYW5rQmxvY2s+O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBsaXN0LnRzIFx1MjAxNCBCdWxsZXQgYW5kIG9yZGVyZWQgbGlzdCBibG9ja3Ncbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBMaXN0cyBuZXN0LiBBIExpc3RJdGVtIGhvbGRzIGlubGluZSBjb250ZW50IHBsdXMgYW4gb3B0aW9uYWwgYGNoaWxkcmVuYFxuLy8gYXJyYXkgb2YgbmVzdGVkIGxpc3QgYmxvY2tzOyBidWxsZXQgYW5kIG9yZGVyZWQgbGlzdHMgY2FuIG1peCBmcmVlbHkgYXRcbi8vIGFueSBkZXB0aC4gVGhpcyBtaXJyb3JzIFRpcHRhcCdzIGxpc3RJdGVtID4gcGFyYWdyYXBoICsgKGJ1bGxldExpc3QgfFxuLy8gb3JkZXJlZExpc3QpIHNoYXBlIGVuZC10by1lbmQsIHNvIFRhYi10by1pbmRlbnQgaW4gdGhlIGVkaXRvciBwcmVzZXJ2ZXNcbi8vIGhpZXJhcmNoeSB0aHJvdWdoIGF1dG9zYXZlLlxuLy9cbi8vIFJlY3Vyc2lvbiBtZWNoYW5pYzogb25seSB0aGUgY3ljbGljIGVkZ2UgKExpc3RJdGVtLmNoaWxkcmVuIFx1MjE5MiBsaXN0IGJsb2NrIFx1MjE5MlxuLy8gTGlzdEl0ZW0pIG5lZWRzIHoubGF6eSgpLiBCdWxsZXRMaXN0QmxvY2sgYW5kIE9yZGVyZWRMaXN0QmxvY2sgYXJlIHBsYWluXG4vLyB6Lm9iamVjdHMsIHdoaWNoIGtlZXBzIHRoZW0gdXNhYmxlIGFzIG1lbWJlcnMgb2Ygei5kaXNjcmltaW5hdGVkVW5pb24gaW5cbi8vIGJsb2Nrcy9pbmRleC50cy4gRGlzY3JpbWluYXRlZCB1bmlvbnMgbmVlZCBab2RPYmplY3RzIHRvIGludHJvc3BlY3QgdGhlXG4vLyBgdHlwZWAgZGlzY3JpbWluYXRvcjsgYSB0b3AtbGV2ZWwgei5sYXp5KCkgd3JhcHBlciB3b3VsZCBkZWZlYXQgdGhhdC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vIC0tLS0gVHlwZVNjcmlwdCBpbnRlcmZhY2VzIChmb3J3YXJkIGRlY2xhcmF0aW9ucyBmb3IgdGhlIHJlY3Vyc2l2ZSB0eXBlcykgLS0tXG5cbmV4cG9ydCBpbnRlcmZhY2UgTGlzdEl0ZW0ge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY29udGVudDogei5pbmZlcjx0eXBlb2YgSW5saW5lTm9kZT5bXTtcbiAgICBjaGlsZHJlbj86IEFycmF5PEJ1bGxldExpc3RCbG9jayB8IE9yZGVyZWRMaXN0QmxvY2s+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1bGxldExpc3RCbG9jayB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB0eXBlOiAnYnVsbGV0X2xpc3QnO1xuICAgIGl0ZW1zOiBMaXN0SXRlbVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE9yZGVyZWRMaXN0QmxvY2sge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgdHlwZTogJ29yZGVyZWRfbGlzdCc7XG4gICAgaXRlbXM6IExpc3RJdGVtW107XG59XG5cbi8vIC0tLS0gWm9kIHNjaGVtYXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIExhenkgYmVjYXVzZSBMaXN0SXRlbS5jaGlsZHJlbiByZWZlcnMgdG8gdGhlIGxpc3QgYmxvY2tzLCB3aGljaCByZWZlciBiYWNrXG4vLyB0byBMaXN0SXRlbS4gVGhlIGFycm93IGJvZHkgb25seSBydW5zIGF0IHBhcnNlIHRpbWUsIGJ5IHdoaWNoIHBvaW50IGFsbFxuLy8gdGhyZWUgZXhwb3J0cyBhcmUgYm91bmQuXG5leHBvcnQgY29uc3QgTGlzdEl0ZW06IHouWm9kVHlwZTxMaXN0SXRlbSwgei5ab2RUeXBlRGVmLCB1bmtub3duPiA9IHoubGF6eSgoKSA9Plxuei5vYmplY3Qoe1xuICAgIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgICAgICAgIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gICAgICAgICBjaGlsZHJlbjogelxuICAgICAgICAgLmFycmF5KHoudW5pb24oW0J1bGxldExpc3RCbG9jaywgT3JkZXJlZExpc3RCbG9ja10pKVxuICAgICAgICAgLm9wdGlvbmFsKCksXG59KSxcbik7XG5cbmV4cG9ydCBjb25zdCBCdWxsZXRMaXN0QmxvY2sgPSB6Lm9iamVjdCh7XG4gICAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHoubGl0ZXJhbCgnYnVsbGV0X2xpc3QnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogei5hcnJheShMaXN0SXRlbSksXG59KTtcblxuZXhwb3J0IGNvbnN0IE9yZGVyZWRMaXN0QmxvY2sgPSB6Lm9iamVjdCh7XG4gICAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB6LmxpdGVyYWwoJ29yZGVyZWRfbGlzdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogei5hcnJheShMaXN0SXRlbSksXG59KTtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5pbXBvcnQgeyBzaXppbmdGaWVsZHMgfSBmcm9tICcuLi9zaXppbmcuanMnO1xuaW1wb3J0IHtcbiAgQXhpc0NvbmZpZyxcbiAgQ3VydmVEb21haW4sXG4gIERyYXdhYmxlLFxuICBFbmRwb2ludFN0eWxlLFxuICBGdW5jdGlvbk1vZGVsLFxufSBmcm9tICcuLi9ncmFwaC1wcmltaXRpdmVzLmpzJztcblxuLy8gVGhlIGNvb3JkaW5hdGUtcGxhbmUgcHJpbWl0aXZlcyAoQXhpc0NvbmZpZywgRW5kcG9pbnRTdHlsZSwgQ3VydmVEb21haW4sIHRoZVxuLy8gRnVuY3Rpb25Nb2RlbCBmYW1pbHksIERyYXdhYmxlQ29sb3IsIERyYXdhYmxlKSBNT1ZFRCB0byAuLi9ncmFwaC1wcmltaXRpdmVzLnRzXG4vLyBcdTIwMTQgYSBsZWFmIG1vZHVsZSB0aGF0IGltcG9ydHMgbm90aGluZyBidXQgem9kLiBUaGV5IGFyZSByZS1leHBvcnRlZCBoZXJlLCB3aXRoXG4vLyBpZGVudGljYWwgaWRlbnRpdGllcywgc28gZXZlcnkgZXhpc3RpbmcgaW1wb3J0IHBhdGgga2VlcHMgd29ya2luZy5cbi8vXG4vLyBXaHkgdGhleSBtb3ZlZDogdGhpcyBmaWxlIGltcG9ydHMgSW5saW5lTm9kZSwgc28gcmVhY2hpbmcgdGhlIHByaW1pdGl2ZXNcbi8vIHRocm91Z2ggaXQgZHJhZ3MgaW4gaW5saW5lLnRzLiBpbmxpbmUudHMgbm93IG5lZWRzIGdyYXBoX2ZpZ3VyZSAoYSBkZWZpbml0aW9uXG4vLyBtYXkgY29udGFpbiBvbmUpLCB3aGljaCB3b3VsZCBjbG9zZSB0aGUgY3ljbGUgaW5saW5lIC0+IGdyYXBoLWZpZ3VyZSAtPlxuLy8gaW50ZXJhY3RpdmUtZ3JhcGggLT4gaW5saW5lLiBUaGF0IGN5Y2xlIGlzIGZhdGFsLCBub3QgY29zbWV0aWM6IHRoZVxuLy8gYHouYXJyYXkoSW5saW5lTm9kZSlgIGNhbGxzIGJlbG93IHJ1biBhdCBtb2R1bGUgc2NvcGUgYW5kIHdvdWxkIGhpdCBhIFREWlxuLy8gUmVmZXJlbmNlRXJyb3Igb24gYSBwYXJ0aWFsbHktaW5pdGlhbGl6ZWQgaW5saW5lLmpzLiBTZWUgZ3JhcGgtcHJpbWl0aXZlcy50cy5cbmV4cG9ydCB7XG4gIEF4aXNDb25maWcsXG4gIEVuZHBvaW50U3R5bGUsXG4gIEN1cnZlRG9tYWluLFxuICBMaW5lYXJNb2RlbCxcbiAgUXVhZHJhdGljTW9kZWwsXG4gIEV4cG9uZW50aWFsTW9kZWwsXG4gIExvZ2FyaXRobWljTW9kZWwsXG4gIFZlcnRpY2FsTW9kZWwsXG4gIEZ1bmN0aW9uTW9kZWwsXG4gIERyYXdhYmxlQ29sb3IsXG4gIERyYXdhYmxlLFxufSBmcm9tICcuLi9ncmFwaC1wcmltaXRpdmVzLmpzJztcbmV4cG9ydCB0eXBlIHsgRHJhd2FibGVDb2xvclQgfSBmcm9tICcuLi9ncmFwaC1wcmltaXRpdmVzLmpzJztcblxuLy8gVGhlIGludGVyYWN0aXZlIGdyYXBoIGJsb2NrIChQaGFzZSAyLjcsIFN0YWdlIDUpLiBVbmxpa2UgZXZlcnkgb3RoZXIgYmxvY2ssXG4vLyB0aGUgc3R1ZGVudCdzIGFuc3dlciBpcyBHRU9NRVRSSUMgXHUyMDE0IGEgcG9pbnQgdGhleSBwbG90IG9uIGEgY29vcmRpbmF0ZSBwbGFuZSBcdTIwMTRcbi8vIG5vdCB0ZXh0LiBUaHJlZSBzdHJ1Y3R1cmFsIGNvbnNlcXVlbmNlcyAoc2VlIGRvY3MvZGVzaWduL2ludGVyYWN0aXZlLWdyYXBoLVxuLy8gYmxvY2subWQpOiB0aGUgYW5zd2VyIGlzIGEgc3RydWN0dXJlZCB2YWx1ZSAoaXRzIG93biBzdWJtaXNzaW9uIG1hcCwgbm90IHRoZVxuLy8gYmxhbmtzIG1hcCksIHNjb3JpbmcgaXMgdG9sZXJhbmNlLWJhc2VkIGdlb21ldHJpYyBjb21wYXJpc29uICh0aGUgZ3JhcGgta2l0XG4vLyBzY29yZXMgaXQsIG5vdCB0aGUgcnVudGltZSdzIHN0cmluZyBzdHJhdGVnaWVzKSwgYW5kIHRoZSB3aWRnZXQgaXMgbGFyZ2Vcbi8vIChKU1hHcmFwaCByaWRlcyB0aGUgbGF6eS1sb2FkZWQgQGFjdGl2aXR5L2dyYXBoLWtpdCwgbmV2ZXIgdGhlIGJhc2UgcnVudGltZSkuXG4vL1xuLy8gU2xpY2UgMSAoMi43YSkgc2hpcHMgT05FIGludGVyYWN0aW9uIFx1MjAxNCBwbG90X3BvaW50LiBUaGUgaW50ZXJhY3Rpb24gaXMgYVxuLy8gZGlzY3JpbWluYXRlZCB1bmlvbiBmcm9tIGRheSBvbmUgc28gcGxvdF9saW5lICgyLjdiKSBhbmQgc2hhZGVfcmVnaW9uICgyLjdjKVxuLy8gYXJlIGVhY2ggYSBuZXcgdmFyaWFudCArIGEgbmV3IHNjb3Jpbmcgc3RyYXRlZ3kgd2l0aCBOTyBzY2hlbWEgbWlncmF0aW9uIGFuZFxuLy8gbm8gY2hhbmdlIHRvIGFueSBvdGhlciBibG9jayB0eXBlIFx1MjAxNCBleGFjdGx5IGhvdyB0aGUgdG9wLWxldmVsIEJsb2NrIHVuaW9uXG4vLyBncm93cy5cblxuLy8gLS0tLSBJbnRlcmFjdGlvbiB2YXJpYW50cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVhY2ggdmFyaWFudCBjYXJyaWVzIGl0cyBPV04gYW5zd2VyIGtleSArIHRvbGVyYW5jZS4gcGxvdF9wb2ludCBpcyB0aGUgb25seVxuLy8gdmFyaWFudCBpbiBzbGljZSAxOyB0aGUgdW5pb24gc2hhcGUgaXMgaGVyZSBzbyB0aGUgbmV4dCB2YXJpYW50cyBzbG90IGluLlxuZXhwb3J0IGNvbnN0IFBvaW50SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9wb2ludCcpLFxuICAvLyBPbmUgb3IgbW9yZSBjb3JyZWN0IHBvaW50czsgdGhlIHN0dWRlbnQgbXVzdCBwbG90IGFsbCBvZiB0aGVtLiBBIHNpbmdsZVxuICAvLyBwb2ludCBpcyB0aGUgY29tbW9uIGNhc2U7IG11bHRpcGxlIHN1cHBvcnRzIGUuZy4gXCJwbG90IHRoZSB0d28gcm9vdHMuXCJcbiAgY29ycmVjdFBvaW50czogei5hcnJheSh6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSkpLm1pbigxKSxcbiAgLy8gUGVyLXBvaW50IHRvbGVyYW5jZSBpbiBncmFwaCB1bml0cyAoYSBFdWNsaWRlYW4vZWFjaC1heGlzIHJhZGl1cywgYXBwbGllZFxuICAvLyBieSB0aGUga2l0J3Mgc2NvcmVyKS4gMC4xIGRlZmF1bHQgc3VpdHMgYSBzbmFwLXRvLWdyaWQgc2luZ2xlIHBvaW50LlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIFBvaW50SW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBQb2ludEludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBwbG90X2Z1bmN0aW9uOiBwbG90IGEgY3VydmUgb2YgYSBnaXZlbiBmYW1pbHkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc3R1ZGVudCBwbGFjZXMgTiBwb2ludHMgYW5kIHRoZSB3aWRnZXQgZml0cyArIGRyYXdzIGEgY3VydmUgVEhST1VHSCB0aGVtXG4vLyAoTiA9IHRoZSBmYW1pbHkncyBwYXJhbWV0ZXIgY291bnQ6IGxpbmVhciAyLCBxdWFkcmF0aWMgMywgZXhwb25lbnRpYWwgMixcbi8vIGxvZ2FyaXRobWljIDIpLiBTY29yZWQgb24gdGhlIGZpdHRlZCBjdXJ2ZSdzIFBBUkFNRVRFUlMgKG5vdCB0aGUgZXhhY3QgcG9pbnRcbi8vIHBvc2l0aW9ucyksIHNvIGFueSBwb2ludHMgb24gdGhlIGNvcnJlY3QgY3VydmUgYXJlIGFjY2VwdGVkLiBUaGUgcGFyYW1ldGVyc1xuLy8gY29tZSBmcm9tIHRoZSBTQU1FIHJlZ3Jlc3Npb24gZml0IGVuZ2luZSB0aGUgY2FsY3VsYXRvciB1c2VzIChmaXRMaW5lYXIsIFx1MjAyNikuXG4vL1xuLy8gYG1vZGVsYCBpcyBhIGRpc2NyaW1pbmF0ZWQgdW5pb24gb24gYGZhbWlseWAgKEZ1bmN0aW9uTW9kZWwsIG5vdyBpblxuLy8gLi4vZ3JhcGgtcHJpbWl0aXZlcy50cyBhbmQgcmUtZXhwb3J0ZWQgYWJvdmUpOiBsaW5lYXIsIHF1YWRyYXRpYywgZXhwb25lbnRpYWwsXG4vLyBsb2dhcml0aG1pYywgdmVydGljYWwuIEdyb3dpbmcgYSBmYW1pbHkgaXMgYSBuZXcgbWVtYmVyIHRoZXJlICsgYSBuZXcgZml0XG4vLyBicmFuY2ggaW4gdGhlIGtpdCdzIHNjb3JlciBcdTIwMTQgYWRkaXRpdmUsIG5vdCBhIHJld3JpdGUuXG5cbi8vIHBsb3RfZnVuY3Rpb24gY2FycmllcyBhbiBBUlJBWSBvZiBjdXJ2ZXMgKHNoaXBzIGFzIG9uZSkuIE9uZSBjdXJ2ZSBpcyB0aGVcbi8vIGNvbW1vbiBjYXNlOyBtdWx0aXBsZSBpcyBhIHN5c3RlbSBvZiBlcXVhdGlvbnMgKFwiZ3JhcGggYm90aCBsaW5lc1wiKSwgc2NvcmVkXG4vLyBhcyBvbmUgb2JqZWN0IGVhY2ggXHUyMDE0IHNvIHN5c3RlbXMgYXJlIGFkZGl0aXZlLCBub3QgYSByZXNoYXBlIChEcm9wIDIgZGVjaXNpb24pLlxuZXhwb3J0IGNvbnN0IEZ1bmN0aW9uSW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9mdW5jdGlvbicpLFxuICBtb2RlbHM6IHouYXJyYXkoRnVuY3Rpb25Nb2RlbCkubWluKDEpLFxuICAvLyBEcm9wIDY6IG9wdGlvbmFsIHBlci1jdXJ2ZSBkb21haW4gcmVzdHJpY3Rpb25zIChcImdyYXBoIHkgPSAyeCArIDMgZm9yXG4gIC8vIHggPj0gMFwiKSwgcGFyYWxsZWwgdG8gbW9kZWxzIGJ5IGluZGV4LiBUaGUgZnJlZWZvcm0gcGFyc2VyIGZpbGxzIHRoZXNlIGZyb21cbiAgLy8gYSBgZm9yIFx1MjAyNmAgY2xhdXNlOyB0aGUgd2lkZ2V0J3MgZW5kcG9pbnQtZHJhZyBVWCBpcyB0aGUgcGxhbm5lZCBmb2xsb3ctdXAgXHUyMDE0XG4gIC8vIHVudGlsIGl0IGxhbmRzLCB0aGUgZG9tYWluIGlzIGF1dGhvcmluZyBtZXRhZGF0YSBkcmF3biBvbiB0aGUga2V5LCBhbmRcbiAgLy8gc2NvcmluZyByZW1haW5zIG9uIHRoZSBjdXJ2ZSBwYXJhbWV0ZXJzLlxuICBkb21haW5zOiB6LmFycmF5KEN1cnZlRG9tYWluLm51bGxhYmxlKCkpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIEZ1bmN0aW9uSW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBGdW5jdGlvbkludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBzaGFkZV9yZWdpb246IHNoYWRlIGEgcG9seWdvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHN0dWRlbnQgZHJhZ3MgdGhlIHZlcnRpY2VzIG9mIGEgcG9seWdvbiAob25lIGhhbmRsZSBwZXIgdmVydGV4KSB0byBjb3ZlciBhXG4vLyB0YXJnZXQgcmVnaW9uLCB3aGljaCBpcyBzaGFkZWQgYXMgdGhleSBtb3ZlLiBTY29yZWQgYnkgQVJFQSBPVkVSTEFQIHdpdGggdGhlXG4vLyBjb3JyZWN0IHBvbHlnb24gKGludGVyc2VjdGlvbi1vdmVyLXVuaW9uIFx1MjI2NSBtaW5PdmVybGFwKSwgc28gdGhlIGV4YWN0IHZlcnRleFxuLy8gcG9zaXRpb25zIGRvbid0IG1hdHRlciBcdTIwMTQgb25seSB0aGF0IHRoZSBzaGFkZWQgcmVnaW9uIG1hdGNoZXMuIEEgcG9seWdvbiwgbm90IGFcbi8vIGN1cnZlLCBzbyBpdCdzIGl0cyBvd24gaW50ZXJhY3Rpb24gKG5vdCBhIHBsb3RfZnVuY3Rpb24gZmFtaWx5KS5cbi8vIE9uZSB0YXJnZXQgcG9seWdvbjogdmVydGljZXMgaW4gb3JkZXIgKG1pbiAzKSArIHRoZSBtaW5pbXVtIGludGVyc2VjdGlvbi1vdmVyLVxuLy8gdW5pb24gd2l0aCB0aGUgc3R1ZGVudCdzIHBvbHlnb24gdG8gY291bnQgYXMgY29ycmVjdC5cbmV4cG9ydCBjb25zdCBSZWdpb25BbnN3ZXIgPSB6Lm9iamVjdCh7XG4gIGNvcnJlY3RWZXJ0aWNlczogei5hcnJheSh6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSkpLm1pbigzKSxcbiAgLy8gMC45IGlzIHN0cmljdCAobmVhci1leGFjdCBvbiBhIHNuYXBwZWQgZ3JpZCk7IGxvd2VyIGl0IGZvciBoYW5kLWRyYWdnZWQgL1xuICAvLyBhcHByb3hpbWF0ZSByZWdpb25zLlxuICBtaW5PdmVybGFwOiB6Lm51bWJlcigpLm1pbigwKS5tYXgoMSkuZGVmYXVsdCgwLjkpLFxufSk7XG5leHBvcnQgdHlwZSBSZWdpb25BbnN3ZXIgPSB6LmluZmVyPHR5cGVvZiBSZWdpb25BbnN3ZXI+O1xuXG4vLyBzaGFkZV9yZWdpb24gY2FycmllcyBhbiBBUlJBWSBvZiB0YXJnZXQgcG9seWdvbnMgKHNoaXBzIGFzIG9uZSksIGVhY2ggc2NvcmVkXG4vLyBhcyBvbmUgb2JqZWN0IFx1MjAxNCBzbyBcInNoYWRlIGJvdGggcmVnaW9uc1wiIGlzIGFkZGl0aXZlLCBtYXRjaGluZyBwbG90X2Z1bmN0aW9uLlxuZXhwb3J0IGNvbnN0IFJlZ2lvbkludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3NoYWRlX3JlZ2lvbicpLFxuICByZWdpb25zOiB6LmFycmF5KFJlZ2lvbkFuc3dlcikubWluKDEpLFxufSk7XG5leHBvcnQgdHlwZSBSZWdpb25JbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIFJlZ2lvbkludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBncmFwaF9pbmVxdWFsaXR5OiBncmFwaCBhbiBpbmVxdWFsaXR5IChEcm9wIDQpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHN0dWRlbnQgcGxhY2VzIHRoZSBib3VuZGFyeSAoc2FtZSBoYW5kbGVzIGFzIHBsb3RfZnVuY3Rpb24pLCB0b2dnbGVzIHRoZVxuLy8gbGluZSBkb3R0ZWQgKHN0cmljdCkgb3Igc29saWQgKGluY2x1c2l2ZSksIGFuZCBjbGlja3MgYSBzaWRlIHRvIHNoYWRlLiBBbGxcbi8vIHRocmVlIGFyZSBncmFkZWQgXHUyMDE0IGNob29zaW5nIHRoZW0gSVMgdGhlIHNraWxsLiBUaGUgYm91bmRhcnkgaXMgYSBGdW5jdGlvbk1vZGVsLFxuLy8gc28gcXVhZHJhdGljIGluZXF1YWxpdGllcyAoeSA+IHhcdTAwQjIpIHdvcmsgdGhlIGRheSB0aGUgZmFtaWx5IGRvZXM7IGEgdmVydGljYWxcbi8vIGJvdW5kYXJ5ICh4ID4gMykgc2hhZGVzIGxlZnQvcmlnaHQgaW5zdGVhZCBvZiBhYm92ZS9iZWxvdy5cbmV4cG9ydCBjb25zdCBTaGFkZVNpZGVWYWx1ZSA9IHouZW51bShbJ2Fib3ZlJywgJ2JlbG93JywgJ2xlZnQnLCAncmlnaHQnXSk7XG5leHBvcnQgdHlwZSBTaGFkZVNpZGVWYWx1ZSA9IHouaW5mZXI8dHlwZW9mIFNoYWRlU2lkZVZhbHVlPjtcblxuZXhwb3J0IGNvbnN0IEluZXF1YWxpdHlBbnN3ZXIgPSB6Lm9iamVjdCh7XG4gIGJvdW5kYXJ5OiBGdW5jdGlvbk1vZGVsLFxuICAvLyB0cnVlID0gc3RyaWN0ICg8IC8gPiwgZG90dGVkIGJvdW5kYXJ5KTsgZmFsc2UgPSBpbmNsdXNpdmUgKFx1MjI2NCAvIFx1MjI2NSwgc29saWQpLlxuICBzdHJpY3Q6IHouYm9vbGVhbigpLFxuICBzaGFkZVNpZGU6IFNoYWRlU2lkZVZhbHVlLFxufSk7XG5leHBvcnQgdHlwZSBJbmVxdWFsaXR5QW5zd2VyID0gei5pbmZlcjx0eXBlb2YgSW5lcXVhbGl0eUFuc3dlcj47XG5cbi8vIEFuIEFSUkFZIG9mIGluZXF1YWxpdGllcyAoc2hpcHMgYXMgb25lKTsgc3lzdGVtcyAoXCJzaGFkZSB3aGVyZSBCT1RIIGhvbGRcIilcbi8vIGJlY29tZSBhZGRpdGl2ZSBtZW1iZXJzLCBtYXRjaGluZyBwbG90X2Z1bmN0aW9uL3NoYWRlX3JlZ2lvbi5cbmV4cG9ydCBjb25zdCBJbmVxdWFsaXR5SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnZ3JhcGhfaW5lcXVhbGl0eScpLFxuICBpbmVxdWFsaXRpZXM6IHouYXJyYXkoSW5lcXVhbGl0eUFuc3dlcikubWluKDEpLFxufSk7XG5leHBvcnQgdHlwZSBJbmVxdWFsaXR5SW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBJbmVxdWFsaXR5SW50ZXJhY3Rpb24+O1xuXG4vLyAtLS0tIGRpc3BsYXk6IGEgc3RhdGljICh1bmdyYWRlZCkgZ3JhcGggLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBibG9jayBkcmF3cyBhIGZpeGVkIHBpY3R1cmUgXHUyMDE0IHBvaW50cywgY3VydmVzLCBzZWdtZW50cywgZmlsbGVkIHBvbHlnb25zIFx1MjAxNFxuLy8gYW5kIGNvbGxlY3RzIE5PIGFuc3dlci4gVHdvIGpvYnMgZnJvbSBvbmUgc2hhcGU6IGEgc3RpbXVsdXMgYSBncmFkZWQgcXVlc3Rpb25cbi8vIHJlZmVycyB0byAoXCJ1c2luZyB0aGUgZ3JhcGggYmVsb3csIFx1MjAyNlwiKSwgYW5kIGEgc3RhbmRhbG9uZSBleGVtcGxhciB3aXRoIG5vXG4vLyBxdWVzdGlvbiBhdCBhbGwgKGFuIGVtcHR5IHByb21wdCkuIEJlY2F1c2UgYGRpc3BsYXlgIGlzIGp1c3QgYW5vdGhlciBtZW1iZXIgb2Zcbi8vIHRoZSBgdHlwZWAgdW5pb24sIGEgc3RpbXVsdXMtd2l0aC1hbi1hbnN3ZXIgbGF0ZXIgaXMgYWRkaXRpdmUgXHUyMDE0IGEgbmV3IGFuc3dlclxuLy8gZmllbGQgYmVzaWRlIHRoZSBkcmF3YWJsZXMgXHUyMDE0IG5vdCBhIG5ldyBibG9jayBmYW1pbHkuXG4vL1xuLy8gYERyYXdhYmxlYCAodGhlIHBvaW50IC8gY3VydmUgLyBleHByZXNzaW9uIC8gc2VnbWVudCAvIHJheSAvIHBvbHlnb24gdW5pb24sXG4vLyBkaXNjcmltaW5hdGVkIG9uIGBraW5kYCkgYW5kIGl0cyBgRHJhd2FibGVDb2xvcmAgcGFsZXR0ZSBrZXlzIG5vdyBsaXZlIGluXG4vLyAuLi9ncmFwaC1wcmltaXRpdmVzLnRzIGFuZCBhcmUgcmUtZXhwb3J0ZWQgYWJvdmUuXG5cbmV4cG9ydCBjb25zdCBEaXNwbGF5SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnZGlzcGxheScpLFxuICBkcmF3YWJsZXM6IHouYXJyYXkoRHJhd2FibGUpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBEaXNwbGF5SW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBEaXNwbGF5SW50ZXJhY3Rpb24+O1xuXG4vLyAtLS0tIHBsb3RfcmF5IC8gcGxvdF9zZWdtZW50OiBkcmF3IGEgcmF5IG9yIHNlZ21lbnQgZGlyZWN0bHkgLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGaXJzdC1jbGFzcyByZXBsYWNlbWVudHMgZm9yIHRoZSBkb21haW4tZ2xpZGVyIGFwcHJvYWNoICh3aGljaCBhc2tlZCBzdHVkZW50c1xuLy8gdG8gZGVmaW5lIGFuIGluZmluaXRlIGxpbmUsIHRoZW4gbWFyayBlbmRwb2ludHMgb24gaXQgd2l0aCBzZXBhcmF0ZSBjb250cm9scyBcdTIwMTRcbi8vIHRoZSBkcmF3biBsaW5lIG5ldmVyIGV2ZW4gY2xpcHBlZCkuIEhlcmUgdGhlIHN0dWRlbnQgZHJhZ3MgVFdPIGhhbmRsZXMgXHUyMDE0IHRoZVxuLy8gZW5kcG9pbnQocykgXHUyMDE0IGFuZCB0aGUgd2lkZ2V0IGRyYXdzIGFuIEFDVFVBTCByYXkvc2VnbWVudCB0aHJvdWdoIHRoZW1cbi8vIChKU1hHcmFwaCBzdHJhaWdodEZpcnN0L3N0cmFpZ2h0TGFzdCksIHdpdGggb3Blbi9jbG9zZWQgZW5kcG9pbnQgcGlsbHMuXG4vLyBBcnJheXMtb2Ytb25lIGxpa2UgbW9kZWxzL3JlZ2lvbnMvaW5lcXVhbGl0aWVzLCBzbyBzeXN0ZW1zIHN0YXkgYWRkaXRpdmUuXG4vLyAocGxvdF9mdW5jdGlvbidzIGRvbWFpbnNbXSByZW1haW5zIHNjb3JlZCBmb3IgYWxyZWFkeS1wdWJsaXNoZWQgcGFnZXMsIGJ1dFxuLy8gYXV0aG9yaW5nIHN0ZWVycyBoZXJlIG5vdy4pXG5leHBvcnQgY29uc3QgUmF5QW5zd2VyID0gei5vYmplY3Qoe1xuICAvLyBUaGUgcmF5J3MgZW5kcG9pbnQgKHNjb3JlZCBvbiBwb3NpdGlvbiArIG9wZW4vY2xvc2VkIHN0eWxlKS5cbiAgZnJvbTogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICAvLyBBbnkgc2Vjb25kIHBvaW50IE9OIHRoZSByYXkgXHUyMDE0IG5hbWVzIHRoZSBkaXJlY3Rpb247IHRoZSBzdHVkZW50J3MgdGhyb3VnaFxuICAvLyBoYW5kbGUgbWF5IHNpdCBhbnl3aGVyZSBhbG9uZyB0aGUgY29ycmVjdCByYXkuXG4gIHRocm91Z2g6IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgZnJvbVN0eWxlOiBFbmRwb2ludFN0eWxlLmRlZmF1bHQoJ2Nsb3NlZCcpLFxuICAvLyBFbmRwb2ludCBwb3NpdGlvbiB0b2xlcmFuY2UgaW4gZ3JhcGggdW5pdHMgKG1hdGNoZXMgdGhlIGRvbWFpbi1nbGlkZXJcbiAgLy8gZGVmYXVsdCkuIERpcmVjdGlvbiBpcyBzY29yZWQgYnkgdW5pdC12ZWN0b3IgYWxpZ25tZW50IGtpdC1zaWRlLlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMjUpLFxufSk7XG5leHBvcnQgdHlwZSBSYXlBbnN3ZXIgPSB6LmluZmVyPHR5cGVvZiBSYXlBbnN3ZXI+O1xuXG5leHBvcnQgY29uc3QgUmF5SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9yYXknKSxcbiAgcmF5czogei5hcnJheShSYXlBbnN3ZXIpLm1pbigxKSxcbn0pO1xuZXhwb3J0IHR5cGUgUmF5SW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBSYXlJbnRlcmFjdGlvbj47XG5cbmV4cG9ydCBjb25zdCBTZWdtZW50QW5zd2VyID0gei5vYmplY3Qoe1xuICBmcm9tOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIHRvOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIC8vIFtmcm9tLWVuZHBvaW50IHN0eWxlLCB0by1lbmRwb2ludCBzdHlsZV0uIFNjb3JlZCBvcmRlci1pbmRlcGVuZGVudGx5IFx1MjAxNFxuICAvLyB0aGUgc3R1ZGVudCBtYXkgZHJhdyB0aGUgc2VnbWVudCBpbiBlaXRoZXIgZGlyZWN0aW9uLlxuICBlbmRwb2ludHM6IHoudHVwbGUoW0VuZHBvaW50U3R5bGUsIEVuZHBvaW50U3R5bGVdKS5kZWZhdWx0KFsnY2xvc2VkJywgJ2Nsb3NlZCddKSxcbiAgdG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjI1KSxcbn0pO1xuZXhwb3J0IHR5cGUgU2VnbWVudEFuc3dlciA9IHouaW5mZXI8dHlwZW9mIFNlZ21lbnRBbnN3ZXI+O1xuXG5leHBvcnQgY29uc3QgU2VnbWVudEludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3Rfc2VnbWVudCcpLFxuICBzZWdtZW50czogei5hcnJheShTZWdtZW50QW5zd2VyKS5taW4oMSksXG59KTtcbmV4cG9ydCB0eXBlIFNlZ21lbnRJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIFNlZ21lbnRJbnRlcmFjdGlvbj47XG5cbi8vIFRoZSBpbnRlcmFjdGlvbiB1bmlvbi4gcGxvdF9wb2ludCArIHBsb3RfZnVuY3Rpb24gKyBzaGFkZV9yZWdpb24gYXJlIGdyYWRlZDtcbi8vIGRpc3BsYXkgaXMgdGhlIHVuZ3JhZGVkIHN0YXRpYyBncmFwaC4gTW9yZSBhcmUgZnV0dXJlIG1lbWJlcnMuIEtlcHRcbi8vIGRpc2NyaW1pbmF0ZWQgb24gYHR5cGVgIHNvIHRoZSB3aXJlIGZvcm1hdCBhbHdheXMgY2FycmllcyBpdCBhbmQgY29uc3VtZXJzXG4vLyBicmFuY2ggdW5pZm9ybWx5LlxuZXhwb3J0IGNvbnN0IEdyYXBoSW50ZXJhY3Rpb24gPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgUG9pbnRJbnRlcmFjdGlvbixcbiAgRnVuY3Rpb25JbnRlcmFjdGlvbixcbiAgUmVnaW9uSW50ZXJhY3Rpb24sXG4gIEluZXF1YWxpdHlJbnRlcmFjdGlvbixcbiAgUmF5SW50ZXJhY3Rpb24sXG4gIFNlZ21lbnRJbnRlcmFjdGlvbixcbiAgRGlzcGxheUludGVyYWN0aW9uLFxuXSk7XG5leHBvcnQgdHlwZSBHcmFwaEludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgR3JhcGhJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gVGhlIGJsb2NrIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBdXRvLW51bWJlcmVkIGxpa2UgUHJvYmxlbUJsb2NrIC8gRmlsbEluQmxhbmtCbG9jay4gaGFzQ29uZmlkZW5jZVJhdGluZyArXG4vLyBza2lsbHMgZm9sbG93IHRoZSBzYW1lIG9wdC1pbiBwYXR0ZXJucyBGaWxsSW5CbGFua0Jsb2NrIGVzdGFibGlzaGVkOyBzb2x1dGlvblxuLy8gaXMgc2hvd24gcG9zdC1jaGVjayByZWdhcmRsZXNzIG9mIGNvcnJlY3RuZXNzLlxuZXhwb3J0IGNvbnN0IEludGVyYWN0aXZlR3JhcGhCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2ludGVyYWN0aXZlX2dyYXBoJyksXG4gIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC4uLmxhYmVsRmllbGRzLFxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGF4aXNDb25maWc6IEF4aXNDb25maWcsXG4gIGludGVyYWN0aW9uOiBHcmFwaEludGVyYWN0aW9uLFxuICAvLyBXaGVuIHRydWUsIGEgbXVsdGktcGFydCBncmFwaCAoc2V2ZXJhbCBwb2ludHMsIGEgc3lzdGVtIG9mIGN1cnZlcy9yZWdpb25zLFxuICAvLyBvciBcdTIwMTQgZnJvbSBEcm9wIDQgXHUyMDE0IGFuIGluZXF1YWxpdHkncyBsaW5lICsgc2lkZSArIHN0eWxlKSBzY29yZXMgZnJhY3Rpb25hbGx5XG4gIC8vIHBlciBvYmplY3QgYW5kIHRoZSBkYXNoYm9hcmQgaXRlbWl6ZXMgaXQ7IHdoZW4gZmFsc2UgKGRlZmF1bHQpIGl0IGlzIGFsbC1vci1cbiAgLy8gbm90aGluZy4gVGhlIGZsYWcgKyB0aGUga2l0J3MgcGVyLW9iamVjdCBzY29yaW5nIGVuZ2luZSBsYW5kIGhlcmUgKERyb3AgMik7XG4gIC8vIHRoZSBydW50aW1lICsgc3VibWlzc2lvbiBjb25zdW1lIHRoZSBmcmFjdGlvbiBhdCB0aGUgRHJvcCA0IHdpcmUgYnVtcC5cbiAgcGFydGlhbENyZWRpdDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIFdoZW4gdHJ1ZSwgdGhlIHN0dWRlbnQgZ2V0cyBhIFwiY2Fubm90IGJlIGdyYXBoZWQgLyBubyBzb2x1dGlvblwiIGNob2ljZSwgYW5kXG4gIC8vIHRoZSBhbnN3ZXIga2V5IG1heSBtYXJrIFRIQVQgYXMgdGhlIGNvcnJlY3QgYW5zd2VyICh0cmljayBxdWVzdGlvbnMpLiBUaGVcbiAgLy8gZmxhZyBsYW5kcyBoZXJlIChEcm9wIDIpOyB0aGUgc3R1ZGVudCBjb250cm9sICsgbm8tc29sdXRpb24gcmVzcG9uc2UgcmlkZSB0aGVcbiAgLy8gRHJvcCA0IHdpcmUgYnVtcC5cbiAgYWxsb3dOb1NvbHV0aW9uOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgLy8gVHJpY2sgcXVlc3Rpb25zOiB3aGVuIHRydWUgKHJlcXVpcmVzIGFsbG93Tm9Tb2x1dGlvbiksIFwibm8gc29sdXRpb25cIiBJUyB0aGVcbiAgLy8gY29ycmVjdCBhbnN3ZXIgYW5kIHRoZSBkcmF3biBhbnN3ZXIga2V5IGlzIGEgZGVjb3kuIEEgc3R1ZGVudCB3aG8gc2VsZWN0c1xuICAvLyBuby1zb2x1dGlvbiBpcyBjb3JyZWN0OyBvbmUgd2hvIGRyYXdzIGFueXRoaW5nIGlzIG5vdC5cbiAgbm9Tb2x1dGlvbkNvcnJlY3Q6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAvLyBCdWlsdC1pbiBtaXN0YWtlIGNsYXNzaWZpZXJzIChzd2FwcGVkIGNvb3JkaW5hdGVzLCBzd2FwcGVkIHNsb3BlL2ludGVyY2VwdCxcbiAgLy8gcmlnaHQtYm91bmRhcnktd3Jvbmctc2lkZSwgXHUyMDI2KSBzaG93IGEgdGFyZ2V0ZWQgbnVkZ2UgaW5zdGVhZCBvZiB0aGUgZ2VuZXJpY1xuICAvLyBcIk5vdCBxdWl0ZVwiIGFmdGVyIGEgY2hlY2suIERlZmF1bHQgT047IGEgdGVhY2hlciBjYW4gc3dpdGNoIHRoZW0gb2ZmLiBUaGVcbiAgLy8gY2xhc3NpZmllciBjYXRhbG9ndWUgKyBtZXNzYWdlcyBsaXZlIGtpdC1zaWRlIChncmFwaC1zY29yZS50cykgXHUyMDE0IHRoaXMgZmxhZ1xuICAvLyBvbmx5IGdhdGVzIHRoZW0uXG4gIGJ1aWx0aW5GZWVkYmFjazogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgLy8gQXV0aG9yZWQgYW50aWNpcGF0ZWQgbWlzdGFrZXMgXHUyMDE0IHRoZSBncmFwaCB0d2luIG9mIEJsYW5rVG9rZW4ubWlzdGFrZUZlZWRiYWNrLlxuICAvLyBgbWF0Y2hgIGlzIGEgZnJlZWZvcm0gZ3JhcGggYW5zd2VyIGluIHRoZSBTQU1FIHN5bnRheCB0aGUgYXV0aG9yaW5nIGZvcm11bGFcbiAgLy8gZmllbGQgYWNjZXB0cyAoXCIoNCwgMylcIiwgXCJ5ID0geCArIDJcIiwgXCJ5IDwgMnggKyAxXCIpOyB0aGUga2l0IHBhcnNlcyBpdCB3aXRoXG4gIC8vIHRoZSBzYW1lIHBhcnNlciBhbmQgY29tcGFyZXMgYWdhaW5zdCB0aGUgc3R1ZGVudCdzIGFuc3dlciB3aXRoIHRoZSBzYW1lXG4gIC8vIHRvbGVyYW5jZXMgYXMgc2NvcmluZy4gRmlyc3QgbWF0Y2ggd2lucywgYW5kIGFuIGF1dGhvcmVkIG1hdGNoIGJlYXRzIGFcbiAgLy8gYnVpbHQtaW4gY2xhc3NpZmllci4gYGZlZWRiYWNrYCBpcyByaWNoIGlubGluZSBjb250ZW50LCBzaG93biAocG9zdC1jaGVja1xuICAvLyBvbmx5KSBpbiB0aGUgYmxvY2sncyBmZWVkYmFjayBsaW5lLlxuICBtaXN0YWtlRmVlZGJhY2s6IHouYXJyYXkoei5vYmplY3Qoe1xuICAgIG1hdGNoOiB6LnN0cmluZygpLFxuICAgIGZlZWRiYWNrOiB6LmFycmF5KElubGluZU5vZGUpLFxuICB9KSkuZGVmYXVsdChbXSksXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIGhhc0NvbmZpZGVuY2VSYXRpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIC8vIFZhcmlhYmxlIGJsb2NrIHNpemluZzogb3B0aW9uYWwgd2lkdGggZnJhY3Rpb24gKyBhbGlnbm1lbnQgKHNpemluZy50cykuXG4gIC8vIEF1dGhvci1zZXQgZGlzcGxheSBmb290cHJpbnQgZm9yIHRoZSBmaWd1cmU7IHJlbmRlcmVyIGhvbm9ycyBpdCB2aWEgdGhlXG4gIC8vIHNoYXJlZCAuYmxvY2stc2l6ZWQgcGF0aC4gQWRkaXRpdmUvb3B0aW9uYWwgXHUyMDE0IG5vIHNjaGVtYVZlcnNpb24gYnVtcC5cbiAgLi4uc2l6aW5nRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBJbnRlcmFjdGl2ZUdyYXBoQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBJbnRlcmFjdGl2ZUdyYXBoQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcbmltcG9ydCB7IEF4aXNDb25maWcsIERyYXdhYmxlIH0gZnJvbSAnLi9pbnRlcmFjdGl2ZS1ncmFwaC5qcyc7XG5cbi8vIE11bHRpcGxlLWNob2ljZSBxdWVzdGlvbiBibG9jay4gT25lIHByb21wdCwgMisgY2hvaWNlcywgcmFkaW8gKHNpbmdsZSkgb3Jcbi8vIGNoZWNrYm94IChcInNlbGVjdCBhbGwgdGhhdCBhcHBseVwiKSB2aWEgbXVsdGlTZWxlY3QuIFNjb3JlZCBhbGwtb3Itbm90aGluZzpcbi8vIHRoZSBzZWxlY3RlZCBzZXQgbXVzdCBlcXVhbCB0aGUgY29ycmVjdCBzZXQgKHBlci1jaG9pY2UgcGFydGlhbCBjcmVkaXQgaXMgYVxuLy8gZnV0dXJlIGFkZGl0aXZlIGZsYWcsIG1pcnJvcmluZyB0aGUgZ3JhcGggYmxvY2sncyBwYXJ0aWFsQ3JlZGl0IHByZWNlZGVudCkuXG4vL1xuLy8gQ2hvaWNlIGNvbnRlbnQgaXMgcmljaCBpbmxpbmUgKGZvcm1hdHRlZCB0ZXh0ICsgaW5saW5lIG1hdGgpIFx1MjAxNCB0aGUgc2FtZVxuLy8gYWxwaGFiZXQgYXMgcHJvYmxlbSBwcm9zZSwgc28gbWF0aCBhbnN3ZXIgY2hvaWNlcyByZW5kZXIgcHJvcGVybHkuIFJpY2hlclxuLy8gY2hvaWNlcyBhcmUgQURESVRJVkUgRklFTERTIG9uIE11bHRpcGxlQ2hvaWNlT3B0aW9uLCBub3QgYSB1bmlvbiByZXdvcmsgXHUyMDE0XG4vLyBkZWNpZGVkIGF0IGRlc2lnbiB0aW1lLCBleGVyY2lzZWQgMjAyNi0wNy0xMCB3aGVuIHRoZSBvcHRpb25hbCBgaW1hZ2VgIGFuZFxuLy8gYGdyYXBoYCBmaWd1cmVzIGxhbmRlZCB3aXRob3V0IGEgc2NoZW1hVmVyc2lvbiBidW1wLlxuLy9cbi8vIFBlci1jaG9pY2UgYGZlZWRiYWNrYCBpcyB0aGUgTUMgYW5hbG9ndWUgb2YgYSBibGFuaydzIG1pc3Rha2VGZWVkYmFjazpcbi8vIGRpc3RyYWN0b3JzIGFyZSB1c3VhbGx5IGF1dGhvcmVkIEJFQ0FVU0UgdGhleSdyZSBhbnRpY2lwYXRlZCBtaXN0YWtlcywgc29cbi8vIGVhY2ggY2hvaWNlIGNhbiBjYXJyeSBhbiBleHBsYW5hdGlvbiBzaG93biBwb3N0LWNoZWNrIHdoZW4gaXQgd2FzIHNlbGVjdGVkLlxuLy9cbi8vIEJsb2NrLWxldmVsIGZpZWxkcyBtaXJyb3IgRmlsbEluQmxhbmtCbG9jayBmb3IgcGFyaXR5IChzb2x1dGlvbixcbi8vIGhhc0NvbmZpZGVuY2VSYXRpbmcsIHNraWxscywgd29ya1NwYWNlKSBcdTIwMTQgb25lIHByb2JsZW0gY2hyb21lLCBvbmUgcnVudGltZVxuLy8gdHJlYXRtZW50LCBvbmUgZGFzaGJvYXJkIHJvdyBzaGFwZS5cbi8vXG4vLyBEZWxpYmVyYXRlbHkgTk9UIHNjaGVtYS1lbmZvcmNlZDogXCJhdCBsZWFzdCBvbmUgY2hvaWNlIGlzIG1hcmtlZCBjb3JyZWN0LlwiXG4vLyBBIG1pZC1lZGl0IGRyYWZ0ICh0ZWFjaGVyIGhhc24ndCBwaWNrZWQgdGhlIHJpZ2h0IGFuc3dlciB5ZXQpIG11c3Qgc3RpbGxcbi8vIGF1dG9zYXZlOyB0aGUgZWRpdG9yIHN1cmZhY2VzIHRoZSB3YXJuaW5nIGluc3RlYWQuIEEgemVyby1jb3JyZWN0IGJsb2NrIGlzXG4vLyB3ZWxsLWRlZmluZWQgYXQgcnVudGltZSAobXVsdGktc2VsZWN0OiBzZWxlY3Rpbmcgbm90aGluZyBpcy4uLiBzdGlsbCBhblxuLy8gb21pc3Npb247IG5vdGhpbmcgc2NvcmVzIGNvcnJlY3QpIFx1MjAxNCB3cm9uZyBhdXRob3JpbmcsIG5vdCBhIGNyYXNoLlxuXG4vLyBPcHRpb25hbCBpbGx1c3RyYXRpdmUgaW1hZ2Ugb24gYSBjaG9pY2UgKFwid2hpY2ggZGlhZ3JhbSBzaG93c1x1MjAyNlwiKS4gTWlycm9yc1xuLy8gRGVmaW5pdGlvbkltYWdlIC8gUGhhc2UtMSBJbWFnZUJsb2NrOiBVUkwtb25seSwgbm8gdXBsb2FkIHBpcGVsaW5lOyBhbHRcbi8vIHJlcXVpcmVkIGJ1dCBkZWZhdWx0aW5nIHRvICcnIGZvciBkZWNvcmF0aXZlIGZpZ3VyZXMgKGVkaXRvciB3YXJucykuXG5leHBvcnQgY29uc3QgQ2hvaWNlSW1hZ2UgPSB6Lm9iamVjdCh7XG4gIHNyYzogei5zdHJpbmcoKS51cmwoKSxcbiAgYWx0OiB6LnN0cmluZygpLmRlZmF1bHQoJycpLFxufSk7XG5leHBvcnQgdHlwZSBDaG9pY2VJbWFnZSA9IHouaW5mZXI8dHlwZW9mIENob2ljZUltYWdlPjtcblxuLy8gT3B0aW9uYWwgc3RhdGljIGdyYXBoIG9uIGEgY2hvaWNlIChcIndoaWNoIGdyYXBoIHNob3dzXHUyMDI2XCIpLiBSZXVzZXMgdGhlXG4vLyBpbnRlcmFjdGl2ZS1ncmFwaCB2b2NhYnVsYXJ5IChBeGlzQ29uZmlnICsgZGlzcGxheSBEcmF3YWJsZXMpIGJ1dCBpc1xuLy8gcmVuZGVyZWQgc2VydmVyLXNpZGUgYXMgaW5saW5lIFNWRyBieSB0aGUgcmVuZGVyZXIncyBncmFwaC1zdmcgZW5naW5lIFx1MjAxNFxuLy8gbmV2ZXIgdGhlIGludGVyYWN0aXZlIGtpdC4gQ29uc2VxdWVuY2U6IGBleHByZXNzaW9uYCBkcmF3YWJsZXMgbmVlZCB0aGVcbi8vIGtpdCdzIHBhcnNlciBhbmQgYXJlIE5PVCBkcmF3bjsgdGhlIGVkaXRvciBkb2Vzbid0IG9mZmVyIHRoZW0gaGVyZS5cbmV4cG9ydCBjb25zdCBDaG9pY2VHcmFwaCA9IHoub2JqZWN0KHtcbiAgYXhpczogQXhpc0NvbmZpZyxcbiAgZHJhd2FibGVzOiB6LmFycmF5KERyYXdhYmxlKS5kZWZhdWx0KFtdKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ2hvaWNlR3JhcGggPSB6LmluZmVyPHR5cGVvZiBDaG9pY2VHcmFwaD47XG5cbmV4cG9ydCBjb25zdCBNdWx0aXBsZUNob2ljZU9wdGlvbiA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAvLyBSaWNoIGlubGluZSBjb250ZW50IChmb3JtYXR0ZWQgdGV4dCArIGlubGluZSBtYXRoKS4gTm9uLWVtcHR5IGlzIGFuXG4gIC8vIGVkaXRvciBjb25jZXJuLCBub3QgYSBzY2hlbWEgb25lIChtaWQtZWRpdCBkcmFmdHMgbXVzdCBzYXZlKS5cbiAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgY29ycmVjdDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIE9wdGlvbmFsIHBlci1jaG9pY2UgZXhwbGFuYXRpb24sIHJldmVhbGVkIHBvc3QtY2hlY2sgd2hlbiB0aGlzIGNob2ljZSB3YXNcbiAgLy8gc2VsZWN0ZWQuIFJpY2ggaW5saW5lIGNvbnRlbnQsIGxpa2UgYmxhbmsgbWlzdGFrZUZlZWRiYWNrIGVudHJpZXMuXG4gIGZlZWRiYWNrOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIC8vIE9wdGlvbmFsIGZpZ3VyZSBiZWxvdyB0aGUgY2hvaWNlIHRleHQgXHUyMDE0IHRoZSBhZGRpdGl2ZSB3aWRlbmluZyB0aGUgaGVhZGVyXG4gIC8vIGNvbW1lbnQgcmVzZXJ2ZWQuIEJvdGggbWF5IHRlY2huaWNhbGx5IGNvZXhpc3QgKGltYWdlIHJlbmRlcnMgZmlyc3QpO1xuICAvLyB0aGUgZWRpdG9yIFVJIHRyZWF0cyB0aGVtIGFzIGEgc2luZ2xlIGZpZ3VyZSBzbG90LlxuICBpbWFnZTogQ2hvaWNlSW1hZ2Uub3B0aW9uYWwoKSxcbiAgZ3JhcGg6IENob2ljZUdyYXBoLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE11bHRpcGxlQ2hvaWNlT3B0aW9uID0gei5pbmZlcjx0eXBlb2YgTXVsdGlwbGVDaG9pY2VPcHRpb24+O1xuXG5leHBvcnQgY29uc3QgTXVsdGlwbGVDaG9pY2VCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ211bHRpcGxlX2Nob2ljZScpLFxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAuLi5sYWJlbEZpZWxkcyxcbiAgLy8gVGhlIHF1ZXN0aW9uIHByb3NlIChyaWNoIGlubGluZSBjb250ZW50LCBsaWtlIGEgcHJvYmxlbSBzdGF0ZW1lbnQpLlxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGNob2ljZXM6IHouYXJyYXkoTXVsdGlwbGVDaG9pY2VPcHRpb24pLm1pbigyKSxcbiAgLy8gZmFsc2UgPSBzaW5nbGUgYW5zd2VyIChyYWRpb3MsIGV4YWN0bHkgb25lIHNlbGVjdGFibGUpOyB0cnVlID0gXCJzZWxlY3RcbiAgLy8gYWxsIHRoYXQgYXBwbHlcIiAoY2hlY2tib3hlcykuIFNjb3JpbmcgaXMgc2V0IGVxdWFsaXR5IGVpdGhlciB3YXkuXG4gIG11bHRpU2VsZWN0OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgLy8gV29ya2VkIGV4cGxhbmF0aW9uIGZvciB0aGUgd2hvbGUgcHJvYmxlbSwgcmV2ZWFsZWQgcG9zdC1jaGVjayByZWdhcmRsZXNzXG4gIC8vIG9mIGNvcnJlY3RuZXNzIChzYW1lIGNvbnRyYWN0IGFzIEZpbGxJbkJsYW5rQmxvY2suc29sdXRpb24pLlxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICBoYXNDb25maWRlbmNlUmF0aW5nOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICAvLyBQZXItcHJvYmxlbSBwcmludCB3b3JrLXNwYWNlIG92ZXJyaWRlIChyZW0pOyBhYnNlbnQgPSBpbmhlcml0IHRoZVxuICAvLyBhY3Rpdml0eS1sZXZlbCBkZWZhdWx0IChzZWUgRmlsbEluQmxhbmtCbG9jay53b3JrU3BhY2UgZm9yIHRoZSBDU1NcbiAgLy8gY3VzdG9tLXByb3BlcnR5IHJlYXNvbmluZykuXG4gIHdvcmtTcGFjZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgTXVsdGlwbGVDaG9pY2VCbG9jayA9IHouaW5mZXI8dHlwZW9mIE11bHRpcGxlQ2hvaWNlQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcbmltcG9ydCB7IENob2ljZUltYWdlLCBDaG9pY2VHcmFwaCB9IGZyb20gJy4vbXVsdGlwbGUtY2hvaWNlLmpzJztcblxuLy8gTWF0Y2hpbmcgcXVlc3Rpb24gYmxvY2suIFR3byBjb2x1bW5zOiBsZWZ0IFwiaXRlbXNcIiAoc3RlbXMsIGRvY3VtZW50IG9yZGVyKVxuLy8gYW5kIHJpZ2h0IFwidGFyZ2V0c1wiIChsZXR0ZXJlZCBBLCBCLCBDXHUyMDI2LCBzaHVmZmxlZCBhdCBwdWJsaXNoIHRpbWUpLiBUaGVcbi8vIHN0dWRlbnQgZHJhZ3MgYSB0YXJnZXQgY2FyZCBvbnRvIGFuIGl0ZW07IHRoZSBjYXJkIGRvY2tzIG5leHQgdG8gdGhlIHN0ZW0uXG4vLyBEZXNpZ246IGRvY3MvZGVzaWduL21hdGNoaW5nLW9yZGVyaW5nLXF1ZXN0aW9ucy5tZCAoZGVjaWRlZCAyMDI2LTA3LTEwKS5cbi8vXG4vLyBEaXN0cmFjdG9yczogdGFyZ2V0cyBtYXkgZXhjZWVkIGl0ZW1zIFx1MjAxNCBhbiB1bm1hdGNoZWQgdGFyZ2V0IGlzIHNpbXBseVxuLy8gcmVmZXJlbmNlZCBieSBubyBrZXkgZW50cnkuIGFsbG93VGFyZ2V0UmV1c2UgKG9mZiBieSBkZWZhdWx0KSBsZXRzIHNldmVyYWxcbi8vIGl0ZW1zIHNoYXJlIG9uZSB0YXJnZXQgKFwiY2F0ZWdvcml6YXRpb24tbGl0ZVwiOiBjbGFzc2lmeSBlYWNoIGV4cHJlc3Npb24gYXNcbi8vIGxpbmVhci9xdWFkcmF0aWMvZXhwb25lbnRpYWwpOyB0aGUgVUkgdGhlbiBDT1BJRVMgdGhlIGNhcmQgb24gZG9jayBpbnN0ZWFkXG4vLyBvZiBtb3ZpbmcgaXQuXG4vL1xuLy8gU2NvcmVkIFBFUiBQQUlSIChlYXJuZWQvdG90YWwgXHUyMDE0IHRoZSBmcmFjdGlvbmFsIENoZWNrcG9pbnRSZXN1bHQgcHJlY2VkZW50XG4vLyBmcm9tIHdpcmUgdjQpOiBlYWNoIGl0ZW0gaXMgb25lIHBvaW50LCBjb3JyZWN0IHdoZW4gdGhlIHN0dWRlbnQncyB0YXJnZXRcbi8vIGZvciBpdCBlcXVhbHMga2V5W2l0ZW1JZF0uIEJsb2NrIGBjb3JyZWN0YCA9IGV2ZXJ5IHBhaXIgcmlnaHQuIE5vIGJpcGFydGl0ZVxuLy8gbWFjaGluZXJ5IFx1MjAxNCB0aGUgc3R1ZGVudCdzIHBhaXJpbmcgSVMgdGhlIGFzc2lnbm1lbnQgKGNvbnRyYXN0IGJsYW5rIGdyb3Vwcyxcbi8vIHdoZXJlIHR5cGVkIHZhbHVlcyBtdXN0IGJlIG1hdGNoZWQgdG8gc2xvdHMpLlxuLy9cbi8vIEZpZ3VyZXM6IGl0ZW1zIGFuZCB0YXJnZXRzIGJvdGggdGFrZSB0aGUgb3B0aW9uYWwgaW1hZ2UvZ3JhcGggZmlndXJlIHNsb3Rcbi8vIHNoaXBwZWQgZm9yIE1DIGNob2ljZXMgKENob2ljZUltYWdlL0Nob2ljZUdyYXBoIFx1MjAxNCBVUkwtb25seSBpbWFnZTsgc3RhdGljXG4vLyBncmFwaCB2aWEgdGhlIHJlbmRlcmVyJ3Mga2l0LWZyZWUgU1ZHIGVuZ2luZSwgc28gYGV4cHJlc3Npb25gIGRyYXdhYmxlcyBhcmVcbi8vIGV4Y2x1ZGVkIHRoZXJlIGFuZCB0aGUgZWRpdG9yIGRvZXNuJ3Qgb2ZmZXIgdGhlbSkuIFwiTWF0Y2ggdGhlIGdyYXBoIHRvIGl0c1xuLy8gZXF1YXRpb25cIiBpcyB0aGUgbWFycXVlZSBjYXNlLlxuLy9cbi8vIERlbGliZXJhdGVseSBOT1Qgc2NoZW1hLWVuZm9yY2VkOiBcImtleSBjb3ZlcnMgZXZlcnkgaXRlbVwiIC8gXCJrZXkgcmVmZXJlbmNlc1xuLy8gcmVhbCB0YXJnZXRzLlwiIEEgbWlkLWVkaXQgZHJhZnQgKHRlYWNoZXIgc3RpbGwgYXNzaWduaW5nIGFuc3dlcnMpIG11c3Rcbi8vIGF1dG9zYXZlOyB0aGUgZWRpdG9yIHN1cmZhY2VzIHRoZSB3YXJuaW5nIGluc3RlYWQgKHRoZSBNQyB6ZXJvLWNvcnJlY3Rcbi8vIHByZWNlZGVudCkuIFRoZSBydW50aW1lIHRyZWF0cyBhbiBpdGVtIG1pc3NpbmcgZnJvbSB0aGUga2V5IGFzIG5ldmVyXG4vLyBjb3JyZWN0IFx1MjAxNCB3cm9uZyBhdXRob3JpbmcsIG5vdCBhIGNyYXNoLlxuXG5leHBvcnQgY29uc3QgTWF0Y2hpbmdJdGVtID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIC8vIFJpY2ggaW5saW5lIGNvbnRlbnQgKGZvcm1hdHRlZCB0ZXh0ICsgaW5saW5lIG1hdGgpLiBOb24tZW1wdHkgaXMgYW5cbiAgLy8gZWRpdG9yIGNvbmNlcm4sIG5vdCBhIHNjaGVtYSBvbmUgKG1pZC1lZGl0IGRyYWZ0cyBtdXN0IHNhdmUpLlxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxuICAvLyBPcHRpb25hbCBmaWd1cmUgYmVsb3cgdGhlIGl0ZW0gdGV4dCAoc2FtZSBzaW5nbGUtZmlndXJlLXNsb3QgdHJlYXRtZW50XG4gIC8vIGFzIE1DIGNob2ljZXM7IGltYWdlIHJlbmRlcnMgZmlyc3QgaWYgYm90aCBhcmUgc29tZWhvdyBzZXQpLlxuICBpbWFnZTogQ2hvaWNlSW1hZ2Uub3B0aW9uYWwoKSxcbiAgZ3JhcGg6IENob2ljZUdyYXBoLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE1hdGNoaW5nSXRlbSA9IHouaW5mZXI8dHlwZW9mIE1hdGNoaW5nSXRlbT47XG5cbmV4cG9ydCBjb25zdCBNYXRjaGluZ1RhcmdldCA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxuICBpbWFnZTogQ2hvaWNlSW1hZ2Uub3B0aW9uYWwoKSxcbiAgZ3JhcGg6IENob2ljZUdyYXBoLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE1hdGNoaW5nVGFyZ2V0ID0gei5pbmZlcjx0eXBlb2YgTWF0Y2hpbmdUYXJnZXQ+O1xuXG5leHBvcnQgY29uc3QgTWF0Y2hpbmdCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ21hdGNoaW5nJyksXG4gIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC4uLmxhYmVsRmllbGRzLFxuICAvLyBUaGUgcXVlc3Rpb24gcHJvc2UgKHJpY2ggaW5saW5lIGNvbnRlbnQsIGxpa2UgYSBwcm9ibGVtIHN0YXRlbWVudCkuXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgLy8gTGVmdCBjb2x1bW4sIGRvY3VtZW50IG9yZGVyLlxuICBpdGVtczogei5hcnJheShNYXRjaGluZ0l0ZW0pLm1pbigyKSxcbiAgLy8gUmlnaHQgY29sdW1uOyBtYXkgZXhjZWVkIGl0ZW1zIChleHRyYSB0YXJnZXRzIGFyZSBkaXN0cmFjdG9ycykuIExldHRlcnNcbiAgLy8gYXJlIGFzc2lnbmVkIGJ5IHBvc2l0aW9uIEFGVEVSIHRoZSBwdWJsaXNoLXRpbWUgc2h1ZmZsZSwgbmV2ZXIgYXV0aG9yZWQuXG4gIHRhcmdldHM6IHouYXJyYXkoTWF0Y2hpbmdUYXJnZXQpLm1pbigyKSxcbiAgLy8gVGhlIGNvcnJlY3QgcGFpcmluZzogaXRlbSBpZCBcdTIxOTIgdGFyZ2V0IGlkLiBQYXJ0aWFsIGR1cmluZyBhdXRob3JpbmcgKHNlZVxuICAvLyBoZWFkZXIpOyBtdWx0aXBsZSBpdGVtcyBtYXkgc2hhcmUgYSB0YXJnZXQgb25seSB1bmRlciBhbGxvd1RhcmdldFJldXNlLlxuICBrZXk6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCB6LnN0cmluZygpLnV1aWQoKSksXG4gIC8vIGZhbHNlID0gb25lLXRvLW9uZSAoZG9ja2luZyBtb3ZlcyB0aGUgY2FyZDsgYSB1c2VkIHRhcmdldCBjYW4ndCBiZSB1c2VkXG4gIC8vIGFnYWluKS4gdHJ1ZSA9IG1hbnktdG8tb25lIGFsbG93ZWQgKGRvY2tpbmcgY29waWVzIHRoZSBjYXJkKS5cbiAgYWxsb3dUYXJnZXRSZXVzZTogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIE1DLXBhcml0eSBwcm9ibGVtIGNocm9tZSAob25lIHByb2JsZW0gc2hhcGUsIG9uZSBkYXNoYm9hcmQgcm93IHNoYXBlKS5cbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgaGFzQ29uZmlkZW5jZVJhdGluZzogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgd29ya1NwYWNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNYXRjaGluZ0Jsb2NrID0gei5pbmZlcjx0eXBlb2YgTWF0Y2hpbmdCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuXG4vLyBPcmRlcmluZyAvIHNlcXVlbmNpbmcgcXVlc3Rpb24gYmxvY2suIFRoZSBBVVRIT1JFRCBvcmRlciBvZiBgaXRlbXNgIElTIHRoZVxuLy8gY29ycmVjdCBvcmRlcjsgc3R1ZGVudHMgc2VlIHRoZSBsaXN0IHNodWZmbGVkIGF0IHB1Ymxpc2ggdGltZSBhbmQgZHJhZyBpdFxuLy8gYmFjayBpbnRvIHNlcXVlbmNlLiBEZXNpZ246IGRvY3MvZGVzaWduL21hdGNoaW5nLW9yZGVyaW5nLXF1ZXN0aW9ucy5tZFxuLy8gKGRlY2lkZWQgMjAyNi0wNy0xMCkuXG4vL1xuLy8gU2NvcmVkIEFMTC1PUi1OT1RISU5HIG9uIGV4YWN0IHNlcXVlbmNlIGVxdWFsaXR5IChhdXRob3IgY2FsbDogcGFydGlhbC1cbi8vIGNyZWRpdCBtZXRyaWNzIGZvciBvcmRlcmluZ3MgYXJlIGVpdGhlciBtaXNsZWFkaW5nIFx1MjAxNCBwb3NpdGlvbiBtYXRjaGVzXG4vLyBwdW5pc2ggYW4gb2ZmLWJ5LW9uZSBzaGlmdCBhYnN1cmRseSBcdTIwMTQgb3Igb3BhcXVlIHRvIHRlYWNoZXJzOyByZXZpc2l0IG9ubHlcbi8vIG9uIG9ic2VydmVkIGRlbWFuZCkuIEludGVyY2hhbmdlYWJsZSBhZGphY2VudCBpdGVtczogWUFHTkksIGFkZGl0aXZlIGxhdGVyLlxuLy9cbi8vIEFuIHVudG91Y2hlZCBsaXN0IGlzIGFuIE9NSVNTSU9OLCBub3QgYW4gYW5zd2VyOiBhIHNodWZmbGVkIGxpc3QgaXMgYWx3YXlzXG4vLyAqc29tZSogc2VxdWVuY2UsIHNvIHRoZSBydW50aW1lIG9ubHkgcmVjb3JkcyBhIHJlc3BvbnNlIG9uY2UgdGhlIHN0dWRlbnRcbi8vIGhhcyBtb3ZlZCBzb21ldGhpbmcuXG4vL1xuLy8gTm8gZmlndXJlIHNsb3Qgb24gaXRlbXMgaW4gdjEgKG5vIGNsZWFyIHVzZSBjYXNlIHlldDsgYWRkaXRpdmUgbGF0ZXIgXHUyMDE0XG4vLyB0aGUgTUMvbWF0Y2hpbmcgQ2hvaWNlSW1hZ2UvQ2hvaWNlR3JhcGggcGF0dGVybiBpcyBzaXR0aW5nIHRoZXJlKS5cblxuZXhwb3J0IGNvbnN0IE9yZGVyaW5nSXRlbSA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAvLyBSaWNoIGlubGluZSBjb250ZW50IChmb3JtYXR0ZWQgdGV4dCArIGlubGluZSBtYXRoKS4gTm9uLWVtcHR5IGlzIGFuXG4gIC8vIGVkaXRvciBjb25jZXJuLCBub3QgYSBzY2hlbWEgb25lIChtaWQtZWRpdCBkcmFmdHMgbXVzdCBzYXZlKS5cbiAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbn0pO1xuZXhwb3J0IHR5cGUgT3JkZXJpbmdJdGVtID0gei5pbmZlcjx0eXBlb2YgT3JkZXJpbmdJdGVtPjtcblxuZXhwb3J0IGNvbnN0IE9yZGVyaW5nQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdvcmRlcmluZycpLFxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAuLi5sYWJlbEZpZWxkcyxcbiAgLy8gVGhlIHF1ZXN0aW9uIHByb3NlIChyaWNoIGlubGluZSBjb250ZW50LCBsaWtlIGEgcHJvYmxlbSBzdGF0ZW1lbnQpLlxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIC8vIEF1dGhvcmVkIG9yZGVyID0gY29ycmVjdCBvcmRlci4gVGhlIHJlbmRlcmVyIHNodWZmbGVzIGRldGVybWluaXN0aWNhbGx5XG4gIC8vIChzZWVkZWQgYnkgYmxvY2sgaWQpIGZvciB0aGUgc3R1ZGVudC1mYWNpbmcgYXJyYW5nZW1lbnQuXG4gIGl0ZW1zOiB6LmFycmF5KE9yZGVyaW5nSXRlbSkubWluKDIpLFxuICAvLyBNQy1wYXJpdHkgcHJvYmxlbSBjaHJvbWUgKG9uZSBwcm9ibGVtIHNoYXBlLCBvbmUgZGFzaGJvYXJkIHJvdyBzaGFwZSkuXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIGhhc0NvbmZpZGVuY2VSYXRpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIHdvcmtTcGFjZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgT3JkZXJpbmdCbG9jayA9IHouaW5mZXI8dHlwZW9mIE9yZGVyaW5nQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcbmltcG9ydCB7IEVuZHBvaW50U3R5bGUgfSBmcm9tICcuL2ludGVyYWN0aXZlLWdyYXBoLmpzJztcbmltcG9ydCB7IHNpemluZ0ZpZWxkcyB9IGZyb20gJy4uL3NpemluZy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBudW1iZXItbGluZS50cyBcdTIwMTQgdGhlIG51bWJlcl9saW5lIGJsb2NrICgxLUQgZ3JhZGVkLCBLLTggLyBlYXJseSBhbGdlYnJhKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSAxLUQgc2libGluZyBvZiBpbnRlcmFjdGl2ZV9ncmFwaC4gVGhlIHN0dWRlbnQncyBhbnN3ZXIgaXMgR0VPTUVUUklDIFx1MjAxNCBhXG4vLyBwb2ludCAob3Igc2V2ZXJhbCkgcGxvdHRlZCBvbiBhIHNpbmdsZSBudW1iZXIgbGluZSwgb3IgYW4gaW50ZXJ2YWwvcmF5IHdpdGhcbi8vIG9wZW4vY2xvc2VkIGVuZHBvaW50cyAoXCJncmFwaCB4ID49IC0yXCIpLiBTYW1lIHRocmVlIHN0cnVjdHVyYWwgY29uc2VxdWVuY2VzXG4vLyBhcyB0aGUgZ3JhcGggYmxvY2sgKHNlZSBkb2NzL2Rlc2lnbi9udW1iZXItbGluZS1ibG9jay5tZCk6IGEgc3RydWN0dXJlZFxuLy8gYW5zd2VyIHdpdGggaXRzIE9XTiBzdWJtaXNzaW9uIG1hcCAobnVtYmVyTGluZVJlc3BvbnNlcywgbm90IHRoZSBibGFua3MgbWFwKSxcbi8vIHRvbGVyYW5jZS1iYXNlZCBnZW9tZXRyaWMgc2NvcmluZyBkb25lIGJ5IHRoZSBsYXp5IGdyYXBoLWtpdCAobm90IHRoZVxuLy8gcnVudGltZSdzIHN0cmluZyBzdHJhdGVnaWVzKSwgYW5kIGEgd2lkZ2V0IHRoYXQgcmlkZXMgQGFjdGl2aXR5L2dyYXBoLWtpdC5cbi8vXG4vLyBBIFNFUEFSQVRFIGJsb2NrIGZhbWlseSwgbm90IGEgR3JhcGhJbnRlcmFjdGlvbiB2YXJpYW50IChhdXRob3IgY2FsbCwgU1RBVEVcbi8vIDIwMjYtMDctMTApOiBudW1iZXIgbGluZXMgYXJlIDEtRCBhbmQgbXVzdCBub3QgYmUgZm9yY2VkIHVuZGVyIHRoZSBncmFwaFxuLy8gYmxvY2sncyAyLUQgQXhpc0NvbmZpZy4gRW5kcG9pbnRTdHlsZSBpcyBzaGFyZWQgZnJvbSBpbnRlcmFjdGl2ZS1ncmFwaC50cyBcdTIwMTRcbi8vIGl0IHdhcyByZXNlcnZlZCB0aGVyZSBcImZvciB0aGUgZnV0dXJlIG51bWJlci1saW5lIGZhbWlseVwiIGZyb20gRHJvcCAyLlxuLy9cbi8vIFNsaWNlIDEgc2hpcHMgVFdPIGludGVyYWN0aW9ucyAocGxvdF9wb2ludCwgcGxvdF9pbnRlcnZhbCksIGRpc2NyaW1pbmF0ZWQgb25cbi8vIGB0eXBlYCBmcm9tIGRheSBvbmUgc28gcGxvdF9yYXkgLyBkaXNwbGF5IHNsb3QgaW4gYWRkaXRpdmVseSBsYXRlciwgZXhhY3RseVxuLy8gaG93IEdyYXBoSW50ZXJhY3Rpb24gZ3Jvd3MuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyAtLS0tIExpbmUgY29uZmlndXJhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIDEtRCBhbmFsb2d1ZSBvZiBBeGlzQ29uZmlnLiBMaW5lIHVuaXRzIHRocm91Z2hvdXQgXHUyMDE0IHRvbGVyYW5jZSBhbmQgdGlja1xuLy8gc3RlcHMgYXJlIGluIHRoZSBzYW1lIHVuaXRzLCBuZXZlciBwaXhlbHMsIHNvIGEgcGFnZSB0aGF0IHJlLWxheXMtb3V0IGF0IGFcbi8vIGRpZmZlcmVudCB3aWR0aCBzdGlsbCBzY29yZXMgaWRlbnRpY2FsbHkuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUNvbmZpZyA9IHoub2JqZWN0KHtcbiAgbWluOiB6Lm51bWJlcigpLFxuICBtYXg6IHoubnVtYmVyKCksXG4gIC8vIFNwYWNpbmcgYmV0d2VlbiBMQUJFTEVEIHRpY2tzIChsaW5lIHVuaXRzKS5cbiAgdGlja1N0ZXA6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5kZWZhdWx0KDEpLFxuICAvLyBVbmxhYmVsZWQgbWlub3IgdGlja3MgZHJhd24gYmV0d2VlbiBlYWNoIHBhaXIgb2YgbGFiZWxlZCB0aWNrcyAoMCA9IG5vbmUpLlxuICAvLyBWaXN1YWwgb25seSBcdTIwMTQgbmV2ZXIgc2NvcmVkLlxuICBtaW5vclRpY2tzUGVyU3RlcDogei5udW1iZXIoKS5pbnQoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMCksXG4gIC8vIFdoZW4gdHJ1ZSwgYSBkcmFnZ2VkIGhhbmRsZSBzbmFwcyB0byB0aGUgbmVhcmVzdCB0aWNrIChtaW5vciBpZiBwcmVzZW50LFxuICAvLyBlbHNlIHRoZSBsYWJlbGVkIHN0ZXApLiBLZXlib2FyZCBudWRnZSBhbHdheXMgbW92ZXMgYnkgb25lIHRpY2sgcmVnYXJkbGVzc1xuICAvLyAoU2hpZnQgPSBmaW5lLCBvbmUtdGVudGggb2YgYSB0aWNrKS5cbiAgc25hcFRvVGljazogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbn0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZUNvbmZpZyA9IHouaW5mZXI8dHlwZW9mIE51bWJlckxpbmVDb25maWc+O1xuXG4vLyAtLS0tIEludGVyYWN0aW9uIHZhcmlhbnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gcGxvdF9wb2ludDogdGhlIHN0dWRlbnQgcGxhY2VzIG9uZSBvciBtb3JlIHBvaW50cyBvbiB0aGUgbGluZS4gTXVsdGktcG9pbnRcbi8vIChcInBsb3QgLTIgYW5kIDVcIikgaXMgc2NvcmVkIGNvbnN1bWUtb25jZSwgYWxsLW9yLW5vdGhpbmcgXHUyMDE0IGV2ZXJ5IGNvcnJlY3Rcbi8vIHBvc2l0aW9uIG11c3QgYmUgbWF0Y2hlZCAobWlycm9ycyB0aGUgZ3JhcGggYmxvY2sncyBOLWhhbmRsZSBwbG90X3BvaW50KS5cbmV4cG9ydCBjb25zdCBOdW1iZXJMaW5lUG9pbnRJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X3BvaW50JyksXG4gIC8vIENvcnJlY3QgcG9zaXRpb25zIGluIGxpbmUgdW5pdHMuIEEgc2luZ2xlIHBvaW50IGlzIHRoZSBjb21tb24gY2FzZS5cbiAgY29ycmVjdFBvaW50czogei5hcnJheSh6Lm51bWJlcigpKS5taW4oMSksXG4gIC8vIE1hdGNoIHJhZGl1cyBpbiBsaW5lIHVuaXRzIChhIHBvaW50IGlzIGNvcnJlY3Qgd2l0aGluICsvLSB0b2xlcmFuY2UpLlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uXG4+O1xuXG4vLyBBbiBpbnRlcnZhbCBvciByYXkgb24gdGhlIGxpbmUuIEEgcHJlc2VudCBib3VuZCBjYXJyaWVzIGFuIG9wZW4vY2xvc2VkIHN0eWxlXG4vLyAodGhlIGluZXF1YWxpdHkgZGlzdGluY3Rpb246IHggPiAzIG9wZW4gdnMgeCA+PSAzIGNsb3NlZCkuIEFuIEFCU0VOVCBib3VuZCBpc1xuLy8gdW5ib3VuZGVkIHRoYXQgZGlyZWN0aW9uIFx1MjAxNCBzbyBhIHJheSBpcyBqdXN0IGFuIGludGVydmFsIHdpdGggb25lIHNpZGUgb21pdHRlZFxuLy8gKFwieCA+PSAzXCIgPSBtaW4gMyBjbG9zZWQsIG5vIG1heDsgXCJ4IDwgNVwiID0gbWF4IDUgb3Blbiwgbm8gbWluKS4gVGhlIHNoYWRlZFxuLy8gcmVnaW9uIGlzIHVuYW1iaWd1b3VzIGZyb20gd2hpY2ggYm91bmRzIGFyZSBwcmVzZW50LCBzbyBubyBzZXBhcmF0ZSBzaWRlIGZsYWdcbi8vIGlzIG5lZWRlZCAodW5saWtlIHRoZSAyLUQgZ3JhcGggaW5lcXVhbGl0eSkuIEF0IGxlYXN0IG9uZSBib3VuZCBtdXN0IGJlXG4vLyBwcmVzZW50IChhIHR3by1zaWRlZC11bmJvdW5kZWQgaW50ZXJ2YWwgaXMgdGhlIHdob2xlIGxpbmUgXHUyMDE0IG1lYW5pbmdsZXNzKTsgdGhlXG4vLyBmYWN0b3J5ICsgYXV0aG9yIFVJIGd1YXJhbnRlZSBpdCBhbmQgdGhlIHNjb3JlciBhc3N1bWVzIGl0LlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVJbnRlcnZhbCA9IHoub2JqZWN0KHtcbiAgbWluOiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIG1pblN0eWxlOiBFbmRwb2ludFN0eWxlLm9wdGlvbmFsKCksXG4gIG1heDogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBtYXhTdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBOdW1iZXJMaW5lSW50ZXJ2YWwgPSB6LmluZmVyPHR5cGVvZiBOdW1iZXJMaW5lSW50ZXJ2YWw+O1xuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9pbnRlcnZhbCcpLFxuICBjb3JyZWN0SW50ZXJ2YWw6IE51bWJlckxpbmVJbnRlcnZhbCxcbiAgLy8gTWF0Y2ggcmFkaXVzIGluIGxpbmUgdW5pdHMsIGFwcGxpZWQgdG8gZWFjaCBwcmVzZW50IGVuZHBvaW50LlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVJbnRlcnZhbEludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIE51bWJlckxpbmVJbnRlcnZhbEludGVyYWN0aW9uXG4+O1xuXG4vLyBEaXNjcmltaW5hdGVkIG9uIGB0eXBlYCBzbyBjb25zdW1lcnMgYnJhbmNoIHVuaWZvcm1seSBhbmQgdGhlIHdpcmUgZm9ybWF0XG4vLyBhbHdheXMgY2FycmllcyBpdC4gR3Jvd2luZyBhIHZhcmlhbnQgaXMgYSBuZXcgbWVtYmVyIGhlcmUgKyBhIG5ldyBzY29yZXJcbi8vIGJyYW5jaCBpbiB0aGUga2l0IFx1MjAxNCBubyBvdGhlciBibG9jayB0b3VjaGVkLlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVJbnRlcmFjdGlvbiA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBOdW1iZXJMaW5lUG9pbnRJbnRlcmFjdGlvbixcbiAgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb24sXG5dKTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIE51bWJlckxpbmVJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gVGhlIGJsb2NrIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBdXRvLW51bWJlcmVkIGxpa2UgdGhlIG90aGVyIHF1ZXN0aW9uIGJsb2Nrcy4gaGFzQ29uZmlkZW5jZVJhdGluZyArIHNraWxscyArXG4vLyBzb2x1dGlvbiBmb2xsb3cgdGhlIHNhbWUgb3B0LWluIHBhdHRlcm5zIEZpbGxJbkJsYW5rQmxvY2sgLyBJbnRlcmFjdGl2ZUdyYXBoXG4vLyBlc3RhYmxpc2hlZC4gRGVsaWJlcmF0ZWx5IExFQU4gZm9yIHNsaWNlIDEgKG5vIHBhcnRpYWxDcmVkaXQgLyBhbGxvd05vU29sdXRpb25cbi8vIC8gbWlzdGFrZUZlZWRiYWNrKSBcdTIwMTQgYWxsLW9yLW5vdGhpbmcgc2NvcmluZyAoZGVzaWduIGRlY2lzaW9uIDYpOyB0aG9zZSBmaWVsZHNcbi8vIGFyZSBhZGRpdGl2ZSBsYXRlciBpZiBhc2tlZCBmb3IgKFlBR05JKSwgZXhhY3RseSBhcyB0aGUgZ3JhcGggYmxvY2sgcmVzZXJ2ZWRcbi8vIHRoZW0gYWNyb3NzIGRyb3BzLlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ251bWJlcl9saW5lJyksXG4gIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC4uLmxhYmVsRmllbGRzLFxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGNvbmZpZzogTnVtYmVyTGluZUNvbmZpZyxcbiAgaW50ZXJhY3Rpb246IE51bWJlckxpbmVJbnRlcmFjdGlvbixcbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgaGFzQ29uZmlkZW5jZVJhdGluZzogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgLy8gVmFyaWFibGUgYmxvY2sgc2l6aW5nOiBvcHRpb25hbCB3aWR0aCBmcmFjdGlvbiArIGFsaWdubWVudCAoc2l6aW5nLnRzKS5cbiAgLy8gQWRkaXRpdmUvb3B0aW9uYWwgXHUyMDE0IG5vIHNjaGVtYVZlcnNpb24gYnVtcC5cbiAgLi4uc2l6aW5nRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBOdW1iZXJMaW5lQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBOdW1iZXJMaW5lQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcbmltcG9ydCB7IE51bWJlckxpbmVDb25maWcgfSBmcm9tICcuL251bWJlci1saW5lLmpzJztcbmltcG9ydCB7IHNpemluZ0ZpZWxkcyB9IGZyb20gJy4uL3NpemluZy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBkYXRhLXBsb3QudHMgXHUyMDE0IHRoZSBkYXRhX3Bsb3QgYmxvY2sgKHN0YXRpc3RpY3MgY2hhcnRzKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzdGF0aXN0aWNzIHNpYmxpbmcgb2YgaW50ZXJhY3RpdmVfZ3JhcGggKDItRCBmdW5jdGlvbnMpIGFuZCBudW1iZXJfbGluZVxuLy8gKDEtRCBnZW9tZXRyeSkuIEEgZGF0YV9wbG90IHJlbmRlcnMgYSBkb3QgcGxvdCwgaGlzdG9ncmFtLCBvciBib3ggcGxvdCBmcm9tIGFcbi8vIGRhdGFzZXQgXHUyMDE0IGVpdGhlciBhcyBhIHN0YXRpYyBTVElNVUxVUyB0aGUgc3R1ZGVudCByZWFkcyAoXCJ3aGF0IGlzIHRoZSBtZWRpYW5cbi8vIG9mIHRoaXMgYm94IHBsb3Q/XCIsIHBhaXJlZCB3aXRoIGEgc2libGluZyBudW1lcmljL01DIGJsb2NrKSBvciBhcyBhIGdyYWRlZFxuLy8gQ09OU1RSVUNUSU9OIHRoZSBzdHVkZW50IGJ1aWxkcyAoXCJtYWtlIGEgZG90IHBsb3Qgb2YgdGhlc2UgdmFsdWVzXCIpLlxuLy9cbi8vIEEgU0VQQVJBVEUgYmxvY2sgZmFtaWx5LCBub3QgYSBHcmFwaEludGVyYWN0aW9uIHZhcmlhbnQgKHRheG9ub215IGZpeGVkXG4vLyAyMDI2LTA3LTEwLCBTVEFURSk6IHN0YXRzIGNoYXJ0cyBhcmUgdGhlaXIgb3duIHNoYXBlIGFuZCBtdXN0IG5vdCBiZSBmb3JjZWRcbi8vIHVuZGVyIHRoZSBncmFwaCBibG9jaydzIDItRCBBeGlzQ29uZmlnLiBEZXNpZ24gKyA5IGRlY2lzaW9ucyBpblxuLy8gZG9jcy9kZXNpZ24vZGF0YS1wbG90LWJsb2NrLm1kIChhdXRob3IgYXBwcm92ZWQgdGhlIHJlY29tbWVuZGVkIGFuc3dlcnMpLlxuLy9cbi8vIFRIRSBBTlNXRVIgSVMgQ09NUFVURUQgRlJPTSBUSEUgREFUQSAoZGVzaWduIGRlY2lzaW9uIDNhKTogYSBkb3QgcGxvdCxcbi8vIGhpc3RvZ3JhbSwgYW5kIGJveCBwbG90IGFyZSBlYWNoIGEgZGV0ZXJtaW5pc3RpYyBmdW5jdGlvbiBvZiBgZGF0YWAsIHNvIHRoZVxuLy8gYXV0aG9yIGVudGVycyB0aGUgcmF3IGRhdGFzZXQgT05DRSBhbmQgdGhlIGNvcnJlY3QgcGxvdCBpcyBkZXJpdmVkIGJ5IHRoZSBraXRcbi8vIHNjb3JlciBcdTIwMTQgdGhlcmUgaXMgbm8gc2VwYXJhdGVseS1hdXRob3JlZCBhbnN3ZXIga2V5IHRvIGRyaWZ0IGZyb20gdGhlIGRhdGEuXG4vLyBUaGUgc2FtZSBgZGF0YWAgcmVuZGVycyB0aGUgY2hhcnQgaW4gZGlzcGxheSBtb2RlIGFuZCBpcyB0aGUgc291cmNlIHRoZVxuLy8gc3R1ZGVudCBwbG90cyAoYW5kIHRoZSBrZXkgaXQncyBzY29yZWQgYWdhaW5zdCkgaW4gYnVpbGQgbW9kZS5cbi8vXG4vLyBTbGljZSAxIHNoaXBzIFRXTyBpbnRlcmFjdGlvbnMgXHUyMDE0IGBkaXNwbGF5YCAoYWxsIHRocmVlIGNoYXJ0IHR5cGVzLCB1bmdyYWRlZFxuLy8gc3RpbXVsdXMpIGFuZCBgYnVpbGRfZG90cGxvdGAgKHRoZSBzaW1wbGVzdCBncmFkZWQgY29uc3RydWN0aW9uKSBcdTIwMTRcbi8vIGRpc2NyaW1pbmF0ZWQgb24gYHR5cGVgIGZyb20gZGF5IG9uZSBzbyBgYnVpbGRfaGlzdG9ncmFtYCAvIGBidWlsZF9ib3hwbG90YFxuLy8gc2xvdCBpbiBhZGRpdGl2ZWx5IGxhdGVyLCBleGFjdGx5IGhvdyBHcmFwaEludGVyYWN0aW9uIGFuZCBOdW1iZXJMaW5lSW50ZXJhY3Rpb25cbi8vIGdyb3cuIFNhbWUgdGhyZWUgc3RydWN0dXJhbCBjb25zZXF1ZW5jZXMgYXMgdGhlIGdyYXBoL251bWJlci1saW5lIGJsb2NrczogYVxuLy8gc3RydWN0dXJlZCBhbnN3ZXIgd2l0aCBpdHMgT1dOIHN1Ym1pc3Npb24gbWFwIChkYXRhUGxvdFJlc3BvbnNlcywgbm90IHRoZVxuLy8gYmxhbmtzIG1hcCksIGZyZXF1ZW5jeS9zdW1tYXJ5IHNjb3JpbmcgZG9uZSBieSB0aGUgbGF6eSBncmFwaC1raXQgKG5vdCB0aGVcbi8vIHJ1bnRpbWUncyBzdHJpbmcgc3RyYXRlZ2llcyksIGFuZCBhIHdpZGdldCB0aGF0IHJpZGVzIEBhY3Rpdml0eS9ncmFwaC1raXQuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyAtLS0tIENoYXJ0IGNvbmZpZ3VyYXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIG51bWVyaWMgYXhpcyBpcyByZXVzZWQgVkVSQkFUSU0gZnJvbSBOdW1iZXJMaW5lQ29uZmlnIChkZXNpZ24gZGVjaXNpb24gNSk6XG4vLyBhIGRvdCBwbG90IHN0YWNrcyBkb3RzIGFib3ZlIHRoZWlyIHZhbHVlIG9uIGEgMS1EIG51bWJlciBsaW5lLCBhbmQgYSBib3ggcGxvdFxuLy8gc2l0cyBvbiB0aGF0IHNhbWUgYXhpcywgc28gdGhlIHRpY2svbWlub3Ivc25hcCBzZW1hbnRpY3MgYXJlIGlkZW50aWNhbC4gVGhlXG4vLyBoaXN0b2dyYW0tb25seSBleHRyYXMgKGVxdWFsLXdpZHRoIGJpbnMgKyBhbiBvcHRpb25hbCB5LXNjYWxlIGNlaWxpbmcpIGFyZVxuLy8gY29uc3VsdGVkIG9ubHkgd2hlbiB0aGUgY2hhcnQgaXMgYSBoaXN0b2dyYW07IHVuZXF1YWwtYmluIGBiaW5FZGdlc2AgaXMgYVxuLy8gZG9jdW1lbnRlZCBsYXRlciBsZXZlciAoWUFHTkkgaW4gc2xpY2UgMSkuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RDb25maWcgPSBOdW1iZXJMaW5lQ29uZmlnLmV4dGVuZCh7XG4gIC8vIEVxdWFsLXdpZHRoIGJpbiBzaXplIHNwYW5uaW5nIFttaW4sIG1heF07IG9ubHkgcmVhZCB3aGVuIGNoYXJ0ID09XG4gIC8vICdoaXN0b2dyYW0nLiBBYnNlbnQgXHUyMTkyIHRoZSBoaXN0b2dyYW0gZmFsbHMgYmFjayB0byBgdGlja1N0ZXBgIGFzIHRoZSBiaW5cbiAgLy8gd2lkdGguIFBvc2l0aXZlLlxuICBiaW5XaWR0aDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC8vIEZpeGVkIGNlaWxpbmcgZm9yIHRoZSBoaXN0b2dyYW0vZG90LXBsb3QgdmVydGljYWwgc2NhbGUuIEFic2VudCBcdTIxOTIgdGhlXG4gIC8vIHNjYWxlIGF1dG8tZml0cyB0aGUgdGFsbGVzdCBiYXIvc3RhY2sgZnJvbSBgZGF0YWAuIEEgZml4ZWQgdmFsdWUga2VlcHNcbiAgLy8gc2V2ZXJhbCBwbG90cyBvbiBhIHBhZ2UgdmlzdWFsbHkgY29tcGFyYWJsZS4gUG9zaXRpdmUgaW50ZWdlciAoZnJlcXVlbmN5KS5cbiAgbWF4RnJlcXVlbmN5OiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RDb25maWcgPSB6LmluZmVyPHR5cGVvZiBEYXRhUGxvdENvbmZpZz47XG5cbi8vIFRoZSBjaGFydCBzaGFwZS4gU2hhcmVkIGJ5IHRoZSBgZGlzcGxheWAgbWVtYmVyICh3aGljaCBvbmUgdG8gcmVuZGVyKSBhbmRcbi8vIGltcGxpZWQgYnkgZWFjaCBgYnVpbGRfKmAgbWVtYmVyLiBOYW1lZCBieSBzaGFwZSwgbm90IGJ5IGdyYWRlIGJhbmQuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RDaGFydCA9IHouZW51bShbJ2RvdHBsb3QnLCAnaGlzdG9ncmFtJywgJ2JveHBsb3QnXSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdENoYXJ0ID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3RDaGFydD47XG5cbi8vIC0tLS0gSW50ZXJhY3Rpb24gdmFyaWFudHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBkaXNwbGF5OiBhIHN0YXRpYywgdW5ncmFkZWQgY2hhcnQgb2YgYGRhdGFgIFx1MjAxNCBhIHN0aW11bHVzIHRoZSBzdHVkZW50IHJlYWRzLlxuLy8gTGlrZSBpbnRlcmFjdGl2ZV9ncmFwaCdzIGBkaXNwbGF5YCBtZW1iZXIgaXQgcHVsbHMgbm8gcHJvYmxlbSBudW1iZXIsIGlzXG4vLyBuZXZlciBzY29yZWQsIGFuZCBuZXZlciBqb2lucyB0aGUgc3VibWlzc2lvbiBwYXlsb2FkOyBhIFwicmVhZCB0aGlzIGNoYXJ0IHRoZW5cbi8vIGFuc3dlclwiIHRhc2sgY29tcG9zZXMgYSBkaXNwbGF5IGRhdGFfcGxvdCB3aXRoIGEgc2libGluZyBudW1lcmljL01DIGJsb2NrXG4vLyAodGhlIHBhdHRlcm4gdGhhdCByZXBsYWNlZCB0aGUgcmV0aXJlZCBhbnN3ZXItc3VyZmFjZS1hcy1hLWZpZWxkIHNlYW0pLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90RGlzcGxheUludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2Rpc3BsYXknKSxcbiAgY2hhcnQ6IERhdGFQbG90Q2hhcnQsXG59KTtcbmV4cG9ydCB0eXBlIERhdGFQbG90RGlzcGxheUludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIERhdGFQbG90RGlzcGxheUludGVyYWN0aW9uXG4+O1xuXG4vLyBidWlsZF9kb3RwbG90OiB0aGUgc3R1ZGVudCBzdGFja3MgZG90cyBhYm92ZSB0aGUgYXhpcyB0byByZXByb2R1Y2UgdGhlXG4vLyBmcmVxdWVuY3kgZGlzdHJpYnV0aW9uIG9mIGBkYXRhYC4gU2NvcmVkIGFsbC1vci1ub3RoaW5nIG9uIGZyZXF1ZW5jeS1tYXBcbi8vIGVxdWFsaXR5IChkZXNpZ24gZGVjaXNpb24gOCkgXHUyMDE0IGRvdCB2YWx1ZXMgYXJlIGRpc2NyZXRlICh0aGUgd2lkZ2V0IHNuYXBzIGVhY2hcbi8vIGRvdCB0byBhIHRpY2spLCBzbyB0aGUgY29tcGFyaXNvbiBpcyBleGFjdCwgbm8gdG9sZXJhbmNlIGZpZWxkLiBUaGUgY29ycmVjdFxuLy8gZGlzdHJpYnV0aW9uIGlzIENPTVBVVEVEIGZyb20gYGRhdGFgIChkZWNpc2lvbiAzYSk7IG5vdGhpbmcgdG8gYXV0aG9yIGhlcmVcbi8vIGJleW9uZCB0aGUgZGF0YXNldCBpdHNlbGYsIHNvIHRoaXMgaXMgYSBiYXJlIG1hcmtlciB2YXJpYW50IHRoYXQgZ3Jvd3Ncbi8vIGJ1aWxkX2hpc3RvZ3JhbSAvIGJ1aWxkX2JveHBsb3Qgc2libGluZ3MgbGF0ZXIuXG5leHBvcnQgY29uc3QgRGF0YVBsb3REb3RwbG90SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnYnVpbGRfZG90cGxvdCcpLFxufSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdERvdHBsb3RJbnRlcmFjdGlvbiA9IHouaW5mZXI8XG4gIHR5cGVvZiBEYXRhUGxvdERvdHBsb3RJbnRlcmFjdGlvblxuPjtcblxuLy8gYnVpbGRfaGlzdG9ncmFtOiB0aGUgc3R1ZGVudCBzZXRzIGVhY2ggYmFyJ3MgZnJlcXVlbmN5IHRvIHJlcHJvZHVjZSB0aGVcbi8vIGhpc3RvZ3JhbSBvZiBgZGF0YWAgKGJpbm5lZCBieSBjb25maWcuYmluV2lkdGggb3ZlciBbbWluLG1heF0pLiBTY29yZWRcbi8vIGFsbC1vci1ub3RoaW5nIG9uIGV4YWN0IHBlci1iaW4gaW50ZWdlci1mcmVxdWVuY3kgZXF1YWxpdHkgKGEgYmFyIGlzIGEgd2hvbGVcbi8vIGNvdW50IFx1MjAxNCBubyB0b2xlcmFuY2UpLCB0aGUgZnJlcXVlbmN5LWRpc3RyaWJ1dGlvbiB0d2luIG9mIGJ1aWxkX2RvdHBsb3QuIFRoZVxuLy8gY29ycmVjdCBoZWlnaHRzIGFyZSBDT01QVVRFRCBmcm9tIGBkYXRhYCwgc28gdGhpcyB0b28gaXMgYSBiYXJlIG1hcmtlciB2YXJpYW50LlxuZXhwb3J0IGNvbnN0IERhdGFQbG90SGlzdG9ncmFtSW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnYnVpbGRfaGlzdG9ncmFtJyksXG59KTtcbmV4cG9ydCB0eXBlIERhdGFQbG90SGlzdG9ncmFtSW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgRGF0YVBsb3RIaXN0b2dyYW1JbnRlcmFjdGlvblxuPjtcblxuLy8gYnVpbGRfYm94cGxvdDogdGhlIHN0dWRlbnQgZHJhZ3MgdGhlIGZpdmUtbnVtYmVyLXN1bW1hcnkgaGFuZGxlcyAobWluLCBRMSxcbi8vIG1lZGlhbiwgUTMsIG1heCkgdG8gYnVpbGQgdGhlIGJveCArIHdoaXNrZXJzIG9mIGBkYXRhYC4gU2NvcmVkIGFsbC1vci1ub3RoaW5nXG4vLyB3aXRoIGVhY2ggaGFuZGxlIHdpdGhpbiBgdG9sZXJhbmNlYCBsaW5lIHVuaXRzIG9mIHRoZSBjb21wdXRlZCBzdW1tYXJ5LiBVbmxpa2Vcbi8vIHRoZSBmcmVxdWVuY3kgYnVpbGRzIHRoaXMgY2FycmllcyBhIHRvbGVyYW5jZSBiZWNhdXNlIGJveCBwb3NpdGlvbnMgYXJlXG4vLyBjb250aW51b3VzIGFuZCB0aGUgdHdvIGNvbW1vbiBxdWFydGlsZSBtZXRob2RzIGNhbiBkaWZmZXIgYnkgYSBkYXRhIHBvaW50IG9uXG4vLyBldmVuLWxlbmd0aCBzZXRzIFx1MjAxNCB0aGUga2V5IHVzZXMgdGhlIFRJLTg0IGV4Y2x1c2l2ZS1tZWRpYW4gbWV0aG9kIChsb2NrZWQsXG4vLyBkZXNpZ24gZGVjaXNpb24gNCkgYW5kIHRoZSB0b2xlcmFuY2UgYWJzb3JicyB0aGUgYWRqYWNlbnQtbWV0aG9kIGFuc3dlci5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdEJveHBsb3RJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdidWlsZF9ib3hwbG90JyksXG4gIC8vIE1hdGNoIHJhZGl1cyBpbiBsaW5lIHVuaXRzLCBhcHBsaWVkIHRvIGVhY2ggb2YgdGhlIGZpdmUgaGFuZGxlcy4gRGVmYXVsdFxuICAvLyBoYWxmIGEgdW5pdCB0aWNrLlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuNSksXG59KTtcbmV4cG9ydCB0eXBlIERhdGFQbG90Qm94cGxvdEludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIERhdGFQbG90Qm94cGxvdEludGVyYWN0aW9uXG4+O1xuXG4vLyBEaXNjcmltaW5hdGVkIG9uIGB0eXBlYCBzbyBjb25zdW1lcnMgYnJhbmNoIHVuaWZvcm1seSBhbmQgdGhlIHdpcmUgZm9ybWF0XG4vLyBhbHdheXMgY2FycmllcyBpdC4gR3Jvd2luZyBhIHZhcmlhbnQgaXMgYSBuZXcgbWVtYmVyIGhlcmUgKyBhIG5ldyBzY29yZXJcbi8vIGJyYW5jaCBpbiB0aGUga2l0IFx1MjAxNCBubyBvdGhlciBibG9jayB0b3VjaGVkLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90SW50ZXJhY3Rpb24gPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb24sXG4gIERhdGFQbG90RG90cGxvdEludGVyYWN0aW9uLFxuICBEYXRhUGxvdEhpc3RvZ3JhbUludGVyYWN0aW9uLFxuICBEYXRhUGxvdEJveHBsb3RJbnRlcmFjdGlvbixcbl0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIERhdGFQbG90SW50ZXJhY3Rpb24+O1xuXG4vLyAtLS0tIFRoZSBibG9jayAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQXV0by1udW1iZXJlZCBsaWtlIHRoZSBvdGhlciBxdWVzdGlvbiBibG9ja3MgV0hFTiBHUkFERUQgXHUyMDE0IGEgYGRpc3BsYXlgXG4vLyBkYXRhX3Bsb3QgcHVsbHMgbm8gbnVtYmVyICh0aGUgcmVuZGVyZXIncyBpc051bWJlcmVkQmxvY2sgcmV0dXJucyBmYWxzZSBmb3Jcbi8vIGl0LCBleGFjdGx5IGFzIGl0IGRvZXMgZm9yIGEgZGlzcGxheSBpbnRlcmFjdGl2ZV9ncmFwaCkuIGhhc0NvbmZpZGVuY2VSYXRpbmdcbi8vICsgc2tpbGxzICsgc29sdXRpb24gZm9sbG93IHRoZSBzYW1lIG9wdC1pbiBwYXR0ZXJucyB0aGUgZ3JhcGggLyBudW1iZXItbGluZVxuLy8gYmxvY2tzIGVzdGFibGlzaGVkLCBhbmQgKGxpa2UgdGhlbSkgbWF0dGVyIG9ubHkgaW4gYnVpbGQgbW9kZS4gRGVsaWJlcmF0ZWx5XG4vLyBMRUFOIGZvciBzbGljZSAxIChubyBwYXJ0aWFsQ3JlZGl0IC8gbWlzdGFrZUZlZWRiYWNrKSBcdTIwMTQgYWxsLW9yLW5vdGhpbmdcbi8vIHNjb3JpbmcgKGRlY2lzaW9uIDgpOyB0aG9zZSBmaWVsZHMgYXJlIGFkZGl0aXZlIGxhdGVyIGlmIGFza2VkIGZvciAoWUFHTkkpLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90QmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdkYXRhX3Bsb3QnKSxcbiAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLi4ubGFiZWxGaWVsZHMsXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgLy8gVGhlIGRhdGFzZXQuIFNpbmdsZSBzb3VyY2Ugb2YgdHJ1dGg6IHRoZSBjaGFydCBpcyBkcmF3biBmcm9tIGl0IGFuZCwgaW5cbiAgLy8gYnVpbGQgbW9kZSwgdGhlIGNvcnJlY3QgYW5zd2VyIGlzIGRlcml2ZWQgZnJvbSBpdC4gTm9uLWVtcHR5LlxuICBkYXRhOiB6LmFycmF5KHoubnVtYmVyKCkpLm1pbigxKSxcbiAgY29uZmlnOiBEYXRhUGxvdENvbmZpZyxcbiAgaW50ZXJhY3Rpb246IERhdGFQbG90SW50ZXJhY3Rpb24sXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIGhhc0NvbmZpZGVuY2VSYXRpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIC8vIFZhcmlhYmxlIGJsb2NrIHNpemluZzogb3B0aW9uYWwgd2lkdGggZnJhY3Rpb24gKyBhbGlnbm1lbnQgKHNpemluZy50cykuXG4gIC8vIEFkZGl0aXZlL29wdGlvbmFsIFx1MjAxNCBubyBzY2hlbWFWZXJzaW9uIGJ1bXAuXG4gIC4uLnNpemluZ0ZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RCbG9jayA9IHouaW5mZXI8dHlwZW9mIERhdGFQbG90QmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBMZWFybmluZ09iamVjdGl2ZXNCbG9jayBcdTIwMTQgYSB0aXRsZWQgbGlzdCBvZiBsZWFybmluZyBvYmplY3RpdmVzLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEEgcHVyZSBDT05URU5UIGJsb2NrIChkYXRhLWJsb2NrLWNhdGVnb3J5PVwiY29udGVudFwiKTogbm9uLWludGVyYWN0aXZlLFxuLy8gbm9uLW51bWJlcmVkLCBubyBydW50aW1lIHdpcmluZywgbm8gc3VibWlzc2lvbiB3aXJlIGltcGFjdC4gUGVkYWdvZ2ljYWxseSBpdFxuLy8gZnJvbnRzIGFuIGFjdGl2aXR5IChvciBhIHNlY3Rpb24pIHdpdGggdGhlIFwic3R1ZGVudHMgd2lsbCBiZSBhYmxlIHRvXHUyMDI2XCIgZ29hbHNcbi8vIHRoYXQgU3dlbGxlci1zdHlsZSBzY2FmZm9sZGluZyBpcyBidWlsdCBhcm91bmQuXG4vL1xuLy8gU2hhcGU6IGFuIGVkaXRhYmxlIGB0aXRsZWAgKGRlZmF1bHRlZCwgYnV0IHRoZSB0ZWFjaGVyIGNhbiByZW5hbWUgaXQpIHBsdXMgYVxuLy8gbGlzdCBvZiBgaXRlbXNgLCBlYWNoIGEgcmljaCBpbmxpbmUgcnVuICh0ZXh0ICsgaW5saW5lIG1hdGggKyBtYXJrcykgXHUyMDE0IHRoZVxuLy8gc2FtZSBhbHBoYWJldCBwYXJhZ3JhcGhzIHVzZS4gSXRlbXMgbWFwIDE6MSB0byBlZGl0YWJsZSBwYXJhZ3JhcGhzIGluIHRoZVxuLy8gZWRpdG9yIE5vZGVWaWV3OyB0aGUgcmVuZGVyZXIgZW1pdHMgdGhlbSBhcyBhIDx1bD4uXG4vL1xuLy8gYGl0ZW1zYCBtYXkgYmUgZW1wdHk6IHRoZSBlZGl0b3IncyBjb250ZW50IHNwZWMga2VlcHMgYXQgbGVhc3Qgb25lIHBhcmFncmFwaFxuLy8gbGl2ZSwgYnV0IGEgc2VyaWFsaXplZCByb3VuZC10cmlwIGNhbiBsZWdpdGltYXRlbHkgcHJvZHVjZSBhbiBlbXB0eSBsaXN0XG4vLyAoZS5nLiBldmVyeSBpdGVtIGNsZWFyZWQpLCBhbmQgdGhhdCBtdXN0IG5vdCBmYWlsIHB1Ymxpc2ggdmFsaWRhdGlvbi5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBjb25zdCBMZWFybmluZ09iamVjdGl2ZXNCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2xlYXJuaW5nX29iamVjdGl2ZXMnKSxcbiAgdGl0bGU6IHouc3RyaW5nKCksXG4gIGl0ZW1zOiB6LmFycmF5KHouYXJyYXkoSW5saW5lTm9kZSkpLFxufSk7XG5leHBvcnQgdHlwZSBMZWFybmluZ09iamVjdGl2ZXNCbG9jayA9IHouaW5mZXI8dHlwZW9mIExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IFBhcmFncmFwaEJsb2NrIH0gZnJvbSAnLi9wYXJhZ3JhcGguanMnO1xuaW1wb3J0IHsgSGVhZGluZ0Jsb2NrIH0gZnJvbSAnLi9oZWFkaW5nLmpzJztcbmltcG9ydCB7IE1hdGhCbG9jayB9IGZyb20gJy4vbWF0aC1ibG9jay5qcyc7XG5pbXBvcnQgeyBJbWFnZUJsb2NrIH0gZnJvbSAnLi9pbWFnZS5qcyc7XG5pbXBvcnQgeyBCdWxsZXRMaXN0QmxvY2ssIE9yZGVyZWRMaXN0QmxvY2sgfSBmcm9tICcuL2xpc3QuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gV29ya2VkRXhhbXBsZUJsb2NrIFx1MjAxNCBhIHRpdGxlZCwgYm94ZWQgZnVsbHktd29ya2VkIGV4YW1wbGUgdG8gc3R1ZHkuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBwdXJlIENPTlRFTlQgYmxvY2sgKGRhdGEtYmxvY2stY2F0ZWdvcnk9XCJjb250ZW50XCIpOiBub24taW50ZXJhY3RpdmUsXG4vLyBub24tbnVtYmVyZWQsIG5vIHJ1bnRpbWUgd2lyaW5nLCBubyBzdWJtaXNzaW9uIHdpcmUgaW1wYWN0LiBEcmF3cyBvblxuLy8gU3dlbGxlcidzIGNvZ25pdGl2ZS1sb2FkIHRoZW9yeSBcdTIwMTQgYSB3b3JrZWQgZXhhbXBsZSBhIHN0dWRlbnQgcmVhZHMgYmVmb3JlXG4vLyBhdHRlbXB0aW5nIHRoZSBhbmFsb2dvdXMgcHJvYmxlbS5cbi8vXG4vLyBVbmxpa2UgYSBjYWxsb3V0IChpbmxpbmUtb25seSBib2R5KSwgYSB3b3JrZWQgZXhhbXBsZSBob2xkcyBORVNURUQgQkxPQ0tcbi8vIGNvbnRlbnQgc28gYSBtdWx0aS1zdGVwLCBtYXRoLWhlYXZ5IHNvbHV0aW9uIHJlbmRlcnMgcHJvcGVybHk6IHBhcmFncmFwaHMsXG4vLyBibG9jayBtYXRoLCBsaXN0cywgYW5kIGltYWdlcy4gVGhlIGNoaWxkIHVuaW9uIGlzIGRlbGliZXJhdGVseSBhIGN1cmF0ZWRcbi8vIHN1YnNldCBvZiB0aGUgQmxvY2sgdW5pb24gXHUyMDE0IGxlYWYgQ09OVEVOVCBibG9ja3Mgb25seS4gSXQgZXhjbHVkZXM6XG4vLyAgIC0gcXVlc3Rpb24gYmxvY2tzIChhIHdvcmtlZCBleGFtcGxlIGlzIGNvbnRlbnQsIG5ldmVyIHNjb3JlZCksXG4vLyAgIC0gY29sdW1ucyBhbmQgd29ya2VkX2V4YW1wbGUgaXRzZWxmIChzbyBuZXN0aW5nIHRlcm1pbmF0ZXMgXHUyMDE0IG5vIHJlY3Vyc2lvbixcbi8vICAgICB0aGUgc2FtZSBkaXNjaXBsaW5lIGFzIENvbHVtbkNlbGxCbG9jayBmb3JiaWRkaW5nIGNvbHVtbnMtaW4tY29sdW1ucykuXG4vLyBUaGlzIGFsc28ga2VlcHMgdGhlIGRhc2hib2FyZCBpbmRleCB1bnRvdWNoZWQ6IGEgd29ya2VkIGV4YW1wbGUgY2FuIG5ldmVyXG4vLyBjb250YWluIGEgcXVlc3Rpb24sIHNvIGJ1aWxkQWN0aXZpdHlJbmRleCBuZXZlciBuZWVkcyB0byByZWN1cnNlIGludG8gaXQuXG4vL1xuLy8gVGhlIHN1YnNldCBtYXRjaGVzIHRoZSBlZGl0b3ItbWFwcGFibGUgY29udGVudCBub2RlcyAxOjEgKFdvcmtlZEV4YW1wbGUudHMnc1xuLy8gY29udGVudCBleHByZXNzaW9uKSwgc28gc2VyaWFsaXplIHJvdW5kLXRyaXBzIHdpdGhvdXQgc2lsZW50bHkgZHJvcHBpbmcgYVxuLy8gY2hpbGQuIGBjb250ZW50YCBtYXkgYmUgZW1wdHkgZm9yIHRoZSBzYW1lIHJlYXNvbiBMZWFybmluZ09iamVjdGl2ZXMuaXRlbXNcbi8vIG1heSBiZSBcdTIwMTQgYW4gYWxsLXVubWFwcGFibGUgcm91bmQgdHJpcCAoZS5nLiBhIHNpbmdsZSBlbXB0eSBpbWFnZSkgbXVzdCBub3Rcbi8vIGZhaWwgcHVibGlzaCB2YWxpZGF0aW9uLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IFdvcmtlZEV4YW1wbGVDaGlsZCA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBQYXJhZ3JhcGhCbG9jayxcbiAgSGVhZGluZ0Jsb2NrLFxuICBNYXRoQmxvY2ssXG4gIEltYWdlQmxvY2ssXG4gIEJ1bGxldExpc3RCbG9jayxcbiAgT3JkZXJlZExpc3RCbG9jayxcbl0pO1xuZXhwb3J0IHR5cGUgV29ya2VkRXhhbXBsZUNoaWxkID0gei5pbmZlcjx0eXBlb2YgV29ya2VkRXhhbXBsZUNoaWxkPjtcblxuZXhwb3J0IGNvbnN0IFdvcmtlZEV4YW1wbGVCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ3dvcmtlZF9leGFtcGxlJyksXG4gIHRpdGxlOiB6LnN0cmluZygpLFxuICBjb250ZW50OiB6LmFycmF5KFdvcmtlZEV4YW1wbGVDaGlsZCksXG59KTtcbmV4cG9ydCB0eXBlIFdvcmtlZEV4YW1wbGVCbG9jayA9IHouaW5mZXI8dHlwZW9mIFdvcmtlZEV4YW1wbGVCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBQYXJhZ3JhcGhCbG9jayB9IGZyb20gJy4vcGFyYWdyYXBoLmpzJztcbmltcG9ydCB7IEhlYWRpbmdCbG9jayB9IGZyb20gJy4vaGVhZGluZy5qcyc7XG5pbXBvcnQgeyBNYXRoQmxvY2sgfSBmcm9tICcuL21hdGgtYmxvY2suanMnO1xuaW1wb3J0IHsgSW1hZ2VCbG9jayB9IGZyb20gJy4vaW1hZ2UuanMnO1xuaW1wb3J0IHsgQnVsbGV0TGlzdEJsb2NrLCBPcmRlcmVkTGlzdEJsb2NrIH0gZnJvbSAnLi9saXN0LmpzJztcbmltcG9ydCB7IEZpbGxJbkJsYW5rQmxvY2sgfSBmcm9tICcuL2ZpbGwtaW4tYmxhbmsuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRmFkZWRXb3JrZWRFeGFtcGxlQmxvY2sgXHUyMDE0IGEgc2NhZmZvbGRlZCAoXCJmYWRlZFwiKSB3b3JrZWQgZXhhbXBsZS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgaW50ZXJhY3RpdmUgc2libGluZyBvZiB3b3JrZWRfZXhhbXBsZSAoUmVua2wvQXRraW5zb24gY29tcGxldGlvblxuLy8gcHJvYmxlbXMpOiBlYXJseSBzdGVwcyBhcmUgZnVsbHkgc2hvd24sIGxhdGVyIHN0ZXBzIGFyZSBGQURFRCBcdTIwMTQgdGhlIHN0dWRlbnRcbi8vIGZpbGxzIHRoZW0gaW4uIFN0cnVjdHVyYWxseSBpdCdzIGEgd29ya2VkX2V4YW1wbGUgZnJhbWUgd2hvc2UgY2hpbGQgdW5pb25cbi8vIEFMU08gYWRtaXRzIGZpbGxfaW5fYmxhbmsgYmxvY2tzOiBhIHNob3duIHN0ZXAgaXMgYSBwYXJhZ3JhcGggLyBibG9jayBtYXRoIC9cbi8vIGxpc3QgLyBpbWFnZTsgYSBmYWRlZCBzdGVwIGlzIGEgZmlsbF9pbl9ibGFuayBibG9jayBjYXJyeWluZyB0aGUgYmxhbmtzLlxuLy9cbi8vIFJldXNlIG92ZXIgcmVpbnZlbnRpb24gKGRlY2lkZWQgYXQgZGVzaWduLCAyMDI2LTA3LTEyKTpcbi8vICAgLSBUaGUgZmFkZWQgc3RlcHMgQVJFIGZpbGxfaW5fYmxhbmsgYmxvY2tzLCBzbyB0aGUgcnVudGltZSBzY29yZXMgdGhlbSB3aXRoXG4vLyAgICAgWkVSTyBuZXcgcnVudGltZSBjb2RlIFx1MjAxNCBpbml0LnRzIGFscmVhZHkgc2NhbnMgZWFjaCAuYWN0aXZpdHktc2VjdGlvbiBmb3Jcbi8vICAgICBgW2RhdGEtYmxvY2stdHlwZT1cImZpbGxfaW5fYmxhbmtcIl1gIGFuZCBmaW5kcyBORVNURUQgb25lcy4gVGhleSByaWRlIHRoZVxuLy8gICAgIGV4aXN0aW5nIEJsYW5rUmVzcG9uc2UgbWFwLCBzbyB0aGVyZSBpcyBOTyBzdWJtaXNzaW9uIHdpcmUvc3RvcmFnZSBidW1wLlxuLy8gICAtIFNjb3JpbmcgcmlkZXMgdGhlIGNoaWxkIGJsYW5rczsgdGhpcyBmcmFtZSByZWFkcyBubyB0eXBlLXNwZWNpZmljXG4vLyAgICAgYXR0cmlidXRlcyBpdHNlbGYgXHUyMTkyIGl0IGlzIGEgQ09OVEFJTkVSIChsaWtlIGBwcm9ibGVtYCksIG5vdCBJTlRFUkFDVElWRS5cbi8vICAgLSBOdW1iZXJpbmcgKHJldmlzZWQgMjAyNi0wNy0xMyk6IHRoZSBXSE9MRSBib3ggaXMgb25lIG51bWJlcmVkIHByb2JsZW0gXHUyMDE0XG4vLyAgICAgaXRzIG51bWJlciBsZWFkcyB0aGUgdGl0bGUsIGFuZCB0aGUgZmFkZWQgZmlsbF9pbl9ibGFuayBzdGVwcyBhcmUgbGV0dGVyZWRcbi8vICAgICAoYSkvKGIpXHUyMDI2IExPQ0FMTFkgKHNob3dTdGVwTGFiZWxzIHRvZ2dsZXMgdGhlbSBvZmYpLCBzbyB0aGV5IG5vIGxvbmdlclxuLy8gICAgIGNvbnN1bWUgd29ya3NoZWV0IHByb2JsZW0gbnVtYmVycy4gU2VlIHJlbmRlckZhZGVkV29ya2VkRXhhbXBsZSBhbmQgdGhlXG4vLyAgICAgZWRpdG9yJ3MgcHJvYmxlbU51bWJlckF0ICh3aGljaCB0cmVhdHMgdGhlIGJveCBhcyBhdG9taWMpLiBUaGlzIHJldmVyc2VkXG4vLyAgICAgdGhlIG9yaWdpbmFsIFwic3RlcHMgbnVtYmVyIGFzIG9yZGluYXJ5IHByb2JsZW1zXCIgY2hvaWNlLCB3aGljaCB3YXN0ZWRcbi8vICAgICB3cml0aW5nL3ByaW50IHdpZHRoIGFuZCBwb2xsdXRlZCB0aGUgd29ya3NoZWV0J3MgbnVtYmVyaW5nLlxuLy9cbi8vIFRoZSBjaGlsZCB1bmlvbiBzdGlsbCBleGNsdWRlcyBxdWVzdGlvbnMgT1RIRVIgdGhhbiBmaWxsX2luX2JsYW5rLCBwbHVzXG4vLyBjb2x1bW5zIC8gd29ya2VkX2V4YW1wbGUgLyBmYWRlZF93b3JrZWRfZXhhbXBsZSBpdHNlbGYgXHUyMDE0IHNvIG5lc3Rpbmdcbi8vIHRlcm1pbmF0ZXMgYW5kIHRoZSBkYXNoYm9hcmQgaW5kZXggcmVjdXJzZXMgb25seSBvbmUgcHJlZGljdGFibGUgbGV2ZWwuXG4vLyBgY29udGVudGAgbWF5IGJlIGVtcHR5IGZvciB0aGUgc2FtZSByb3VuZC10cmlwLXNhZmV0eSByZWFzb24gYXNcbi8vIHdvcmtlZF9leGFtcGxlLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IEZhZGVkV29ya2VkRXhhbXBsZUNoaWxkID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFBhcmFncmFwaEJsb2NrLFxuICBIZWFkaW5nQmxvY2ssXG4gIE1hdGhCbG9jayxcbiAgSW1hZ2VCbG9jayxcbiAgQnVsbGV0TGlzdEJsb2NrLFxuICBPcmRlcmVkTGlzdEJsb2NrLFxuICBGaWxsSW5CbGFua0Jsb2NrLFxuXSk7XG5leHBvcnQgdHlwZSBGYWRlZFdvcmtlZEV4YW1wbGVDaGlsZCA9IHouaW5mZXI8dHlwZW9mIEZhZGVkV29ya2VkRXhhbXBsZUNoaWxkPjtcblxuZXhwb3J0IGNvbnN0IEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnZmFkZWRfd29ya2VkX2V4YW1wbGUnKSxcbiAgdGl0bGU6IHouc3RyaW5nKCksXG4gIGNvbnRlbnQ6IHouYXJyYXkoRmFkZWRXb3JrZWRFeGFtcGxlQ2hpbGQpLFxuICAvLyBUaGUgd2hvbGUgYm94IGlzIE9ORSBudW1iZXJlZCBwcm9ibGVtIChpdHMgbnVtYmVyIGxlYWRzIHRoZSB0aXRsZSk7IHRoZVxuICAvLyBmYWRlZCBmaWxsX2luX2JsYW5rIHN0ZXBzIGFyZSBsZXR0ZXJlZCAoYSksIChiKVx1MjAyNiBXSVRISU4gdGhlIGJveCBpbnN0ZWFkIG9mXG4gIC8vIGNvbnN1bWluZyB3b3Jrc2hlZXQgcHJvYmxlbSBudW1iZXJzLiBzaG93U3RlcExhYmVscyB0b2dnbGVzIHRob3NlIGxldHRlcnNcbiAgLy8gb2ZmIHBlciBib3ggKGJhcmUgYmxhbmtzLCBubyBndXR0ZXIpIGZvciB0ZWFjaGVycyB3aG8gd2FudCBtYXhpbXVtIHdyaXRpbmdcbiAgLy8gcm9vbS4gRGVmYXVsdGVkIHNvIHByZS1leGlzdGluZyBkb2N1bWVudHMgKG5vIGZpZWxkKSByZW5kZXIgbGFiZWxsZWQuXG4gIHNob3dTdGVwTGFiZWxzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxufSk7XG5leHBvcnQgdHlwZSBGYWRlZFdvcmtlZEV4YW1wbGVCbG9jayA9IHouaW5mZXI8dHlwZW9mIEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gU2VsZkV4cGxhbmF0aW9uQmxvY2sgXHUyMDE0IGFuIHVuZ3JhZGVkIGZyZWUtdGV4dCByZWZsZWN0aW9uIHByb21wdC5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBNZXRhY29nbml0aXZlIHNlbGYtZXhwbGFuYXRpb24gKENoaSBldCBhbC4pOiB0aGUgc3R1ZGVudCB3cml0ZXMgV0hZLCBpbiB0aGVpclxuLy8gb3duIHdvcmRzLiBEZWxpYmVyYXRlbHkgVU5HUkFERUQgKGF1dGhvciBkZWNpc2lvbiwgMjAyNi0wNy0xMikgXHUyMDE0IHRoZSBydW50aW1lXG4vLyBjYXB0dXJlcyB0aGUgdGV4dCBhbmQgdGhlIHRlYWNoZXIgZGFzaGJvYXJkIHNob3dzIGl0IHJhdzsgdGhlcmUgaXMgbm8gYW5zd2VyXG4vLyBrZXksIG5vIGNvcnJlY3QvaW5jb3JyZWN0LCBhbmQgaXQgbmV2ZXIgY29udHJpYnV0ZXMgdG8gdGhlIHNjb3JlLiBUaGlzIGtlZXBzXG4vLyBpdCBjbGVhciBvZiBQaGFzZSAyLjYgcnVicmljIGdyYWRpbmcuXG4vL1xuLy8gSXQgaXMgdGhlIEZJUlNUIGZyZWUtdGV4dCByZXNwb25zZSB0eXBlLCBzbyBpdCBpbnRyb2R1Y2VzIHRoZSBgZnJlZVJlc3BvbnNlc2Bcbi8vIG1hcCBvbiBTdWJtaXNzaW9uUmVzcG9uc2VzICh3aXJlIHY4IFx1MjE5MiB2OSkgXHUyMDE0IHRoZSBtYXAgbmFtZSB0aGUgc2NoZW1hIHJlc2VydmVkXG4vLyBmb3IgZXhhY3RseSB0aGlzIHNoYXBlLiBQaGFzZSAyLjYgc2hvcnRfYW5zd2VyIC8gZXNzYXkgcmV1c2UgdGhlIHNhbWUgbWFwIChhXG4vLyBzdHJpbmcgcGVyIGJsb2NrKSB3aXRoIG5vIGZ1cnRoZXIgd2lyZSBidW1wOyBncmFkaW5nLCB3aGVuIGl0IGxhbmRzLCBsaXZlcyBpblxuLy8gYSBzZXBhcmF0ZSB0YWJsZSwgbm90IGluIHRoZSByZXNwb25zZSBzaGFwZS5cbi8vXG4vLyBTaGFwZTogYSBgcHJvbXB0YCAocmljaCBpbmxpbmUgXHUyMDE0IHRleHQgKyBpbmxpbmUgbWF0aCArIG1hcmtzLCBsaWtlIGV2ZXJ5IG90aGVyXG4vLyBxdWVzdGlvbiBwcm9tcHQpIHBsdXMgYW4gb3B0aW9uYWwgYHBsYWNlaG9sZGVyYCAoYSBzZW50ZW5jZS1zdGFydGVyIC8gaGludFxuLy8gc2hvd24gaW4gdGhlIGVtcHR5IHRleHRhcmVhKS4gTm8gYW5zd2VyIGtleS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBjb25zdCBTZWxmRXhwbGFuYXRpb25CbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ3NlbGZfZXhwbGFuYXRpb24nKSxcbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICBwbGFjZWhvbGRlcjogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBTZWxmRXhwbGFuYXRpb25CbG9jayA9IHouaW5mZXI8dHlwZW9mIFNlbGZFeHBsYW5hdGlvbkJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gZnJlZS1yZXNwb25zZS50cyBcdTIwMTQgc2hvcnRfYW5zd2VyICsgZXNzYXkgKG1hbnVhbGx5LWdyYWRlZCBmcmVlIHRleHQpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIFBoYXNlIDIuNiBncmFkZWQgZnJlZS10ZXh0IHNpYmxpbmdzIG9mIHNlbGZfZXhwbGFuYXRpb24uIEFsbCB0aHJlZSB3cml0ZVxuLy8gdGhlaXIgc3R1ZGVudCB0ZXh0IGludG8gdGhlIFNBTUUgYGZyZWVSZXNwb25zZXNgIG1hcCAod2lyZSB2OSkgXHUyMDE0IHRoZSByZXNwb25zZVxuLy8gc2hhcGUgaXMgaWRlbnRpY2FsIChhIHN0cmluZyk7IHdoYXQgZGlmZmVycyBpcyBpbnRlbnQgKyBncmFkaW5nOlxuLy8gICAtIHNlbGZfZXhwbGFuYXRpb24gXHUyMDE0IHVuZ3JhZGVkIHJlZmxlY3Rpb24gKGFscmVhZHkgc2hpcHBlZCkuXG4vLyAgIC0gc2hvcnRfYW5zd2VyICAgICBcdTIwMTQgYSBicmllZiBncmFkZWQgcmVzcG9uc2UgKG1hbnVhbCBydWJyaWMgZ3JhZGluZywgMi42KS5cbi8vICAgLSBlc3NheSAgICAgICAgICAgIFx1MjAxNCBhIGxvbmcgZ3JhZGVkIHJlc3BvbnNlOyBhZGRzIG9wdGlvbmFsIHdvcmQtY291bnRcbi8vICAgICAgICAgICAgICAgICAgICAgICAgZ3VpZGFuY2UgKGEgdGFyZ2V0IHJhbmdlIHNob3duIGFzIGEgbGl2ZSBjb3VudGVyKS5cbi8vIEdyYWRpbmcgaXRzZWxmIGxpdmVzIGluIGEgc2VwYXJhdGUgYGdyYWRlc2AgdGFibGUgKFBoYXNlIDIuNiBsYXRlciBzbGljZXMpLFxuLy8gbmV2ZXIgaW4gdGhlIHN1Ym1pc3Npb24ganNvbmIgXHUyMDE0IGdyYWRlcyBhcmUgbXV0YWJsZSwgc3VibWlzc2lvbnMgYXJlIG5vdC4gVGhlc2Vcbi8vIGJsb2NrcyBjYXJyeSBOTyBhbnN3ZXIga2V5IGFuZCBhcmUgbmV2ZXIgYXV0by1zY29yZWQgYnkgdGhlIHJ1bnRpbWUuXG4vL1xuLy8gd29yZENvdW50SGludCAoZXNzYXkgb25seSk6IGFuIG9wdGlvbmFsIHttaW4/LCBtYXg/fSB0YXJnZXQuIFRoZSByZW5kZXJlclxuLy8gc2hvd3MgYSBsaXZlIHdvcmQgY291bnRlcjsgdGhlIGNvdW50IGl0c2VsZiBpcyBjb21wdXRlZC1vbi1yZWFkIChuZXZlciBzdG9yZWRcbi8vIGluIHRoZSB3aXJlIFx1MjAxNCBpdCdzIGRlcml2YWJsZSBmcm9tIHRoZSB0ZXh0KSwgc28gdGhpcyBpcyBkaXNwbGF5IGd1aWRhbmNlIG9ubHkuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyBPbmUgcnVicmljIGNyaXRlcmlvbjogYSBsYWJlbCAoXCJUaGVzaXMgY2xhcml0eVwiKSwgdGhlIHBvaW50cyBpdCdzIHdvcnRoLCBhbmRcbi8vIGFuIG9wdGlvbmFsIGRlc2NyaXB0aW9uIG9mIHdoYXQgZnVsbCBjcmVkaXQgbG9va3MgbGlrZS4gTGV2ZWxlZCBkZXNjcmlwdG9yXG4vLyBncmlkcyAoNC8zLzIvMSBjb2x1bW5zKSBhcmUgYSBmdXR1cmUgQURESVRJVkUgZXh0ZW5zaW9uIG9mIHRoaXMgc2hhcGUuXG5leHBvcnQgY29uc3QgUnVicmljQ3JpdGVyaW9uID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIGxhYmVsOiB6LnN0cmluZygpLm1pbigxKSxcbiAgbWF4UG9pbnRzOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkuZmluaXRlKCksXG4gIGRlc2NyaXB0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFJ1YnJpY0NyaXRlcmlvbiA9IHouaW5mZXI8dHlwZW9mIFJ1YnJpY0NyaXRlcmlvbj47XG5cbi8vIEEgYmxvY2sncyBncmFkaW5nIHJ1YnJpYy4gTGl2ZXMgSU4gdGhlIGRvY3VtZW50IChhdXRob3IgZGVjaXNpb24gMjAyNi0wNy0xMyxcbi8vIGRvY3MvZGVzaWduL21hbnVhbC1ncmFkaW5nLm1kKTogc3VibWlzc2lvbnMgcGluIHRvIGFjdGl2aXR5X3ZlcnNpb25zLCBzbyB0aGVcbi8vIGdyYWRpbmcgVUkgcmVhZHMgdGhlIGV4YWN0IHJ1YnJpYyB0aGUgc3R1ZGVudCB3YXMgYXNzZXNzZWQgYWdhaW5zdCBcdTIwMTQgdmVyc2lvblxuLy8gcGlubmluZyBJUyB0aGUgXCJydWJyaWMgZWRpdHMgYXBwbHkgcHJvc3BlY3RpdmVseVwiIG1lY2hhbmlzbS4gVGhlIHJlbmRlcmVyXG4vLyBuZXZlciBlbWl0cyBpdCAodGVhY2hlci1zaWRlIGRhdGE7IHN0YXlzIG91dCBvZiBzdHVkZW50IEhUTUwpLiBHcmFkZXNcbi8vIHRoZW1zZWx2ZXMgYXJlIG11dGFibGUgYW5kIGxpdmUgaW4gdGhlIGBncmFkZXNgIFRBQkxFLCBrZXllZCBieVxuLy8gKHN1Ym1pc3Npb25faWQsIGJsb2NrX2lkKSArIGNyaXRlcmlvbiBpZC5cbmV4cG9ydCBjb25zdCBSdWJyaWMgPSB6Lm9iamVjdCh7XG4gIGNyaXRlcmlhOiB6LmFycmF5KFJ1YnJpY0NyaXRlcmlvbikubWluKDEpLFxufSk7XG5leHBvcnQgdHlwZSBSdWJyaWMgPSB6LmluZmVyPHR5cGVvZiBSdWJyaWM+O1xuXG5leHBvcnQgY29uc3QgU2hvcnRBbnN3ZXJCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ3Nob3J0X2Fuc3dlcicpLFxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIHBsYWNlaG9sZGVyOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIHJ1YnJpYzogUnVicmljLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFNob3J0QW5zd2VyQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBTaG9ydEFuc3dlckJsb2NrPjtcblxuZXhwb3J0IGNvbnN0IFdvcmRDb3VudEhpbnQgPSB6XG4gIC5vYmplY3Qoe1xuICAgIG1pbjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gICAgbWF4OiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgfSlcbiAgLy8gR3VhcmQgYWdhaW5zdCBhbiBpbnZlcnRlZCByYW5nZSAobWluID4gbWF4KSBcdTIwMTQgYSBub25zZW5zZSBoaW50IHRoZSBlZGl0b3JcbiAgLy8gc2hvdWxkbid0IGJlIGFibGUgdG8gcHJvZHVjZSwgYnV0IHZhbGlkYXRpb24gaXMgdGhlIHNjaGVtYSdzIGpvYi5cbiAgLnJlZmluZShcbiAgICAoaCkgPT4gaC5taW4gPT09IHVuZGVmaW5lZCB8fCBoLm1heCA9PT0gdW5kZWZpbmVkIHx8IGgubWluIDw9IGgubWF4LFxuICAgIHsgbWVzc2FnZTogJ3dvcmRDb3VudEhpbnQubWluIG11c3QgYmUgXHUyMjY0IG1heCcgfSxcbiAgKTtcbmV4cG9ydCB0eXBlIFdvcmRDb3VudEhpbnQgPSB6LmluZmVyPHR5cGVvZiBXb3JkQ291bnRIaW50PjtcblxuZXhwb3J0IGNvbnN0IEVzc2F5QmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdlc3NheScpLFxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIHBsYWNlaG9sZGVyOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIHdvcmRDb3VudEhpbnQ6IFdvcmRDb3VudEhpbnQub3B0aW9uYWwoKSxcbiAgcnVicmljOiBSdWJyaWMub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgRXNzYXlCbG9jayA9IHouaW5mZXI8dHlwZW9mIEVzc2F5QmxvY2s+O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBibG9ja3MvaW5kZXgudHMgXHUyMDE0IEJsb2NrIGRpc2NyaW1pbmF0ZWQgdW5pb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTaW5nbGUgc291cmNlIG9mIHRydXRoIGZvciBcIndoYXQgYmxvY2sgdHlwZXMgZXhpc3QgaW4gUGhhc2UgMS5cIiBBZGRpbmcgYVxuLy8gbmV3IGJsb2NrIHR5cGUgbWVhbnM6IG5ldyBmaWxlIHVuZGVyIGJsb2Nrcy8sIG5ldyBlbnRyeSBoZXJlLCBuZXcgZmFjdG9yeVxuLy8gaW4gZmFjdG9yaWVzLnRzLCBuZXcgcmVuZGVyZXIgaW4gQGFjdGl2aXR5L3JlbmRlcmVyL2Jsb2Nrcy8uIFRocmVlIHBsYWNlcyxcbi8vIGFsd2F5cyBpbiB0aGF0IG9yZGVyLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5cbmltcG9ydCB7IFBhcmFncmFwaEJsb2NrIH0gZnJvbSAnLi9wYXJhZ3JhcGguanMnO1xuaW1wb3J0IHsgSGVhZGluZ0Jsb2NrIH0gZnJvbSAnLi9oZWFkaW5nLmpzJztcbmltcG9ydCB7IE1hdGhCbG9jayB9IGZyb20gJy4vbWF0aC1ibG9jay5qcyc7XG5pbXBvcnQgeyBJbWFnZUJsb2NrLCBDcm9wUmVjdCB9IGZyb20gJy4vaW1hZ2UuanMnO1xuaW1wb3J0IHsgQ2FsbG91dEJsb2NrIH0gZnJvbSAnLi9jYWxsb3V0LmpzJztcbmltcG9ydCB7IFByb2JsZW1CbG9jayB9IGZyb20gJy4vcHJvYmxlbS5qcyc7XG5pbXBvcnQgeyBGaWxsSW5CbGFua0Jsb2NrIH0gZnJvbSAnLi9maWxsLWluLWJsYW5rLmpzJztcbmltcG9ydCB7IEJ1bGxldExpc3RCbG9jaywgT3JkZXJlZExpc3RCbG9jaywgTGlzdEl0ZW0gfSBmcm9tICcuL2xpc3QuanMnO1xuaW1wb3J0IHsgSW50ZXJhY3RpdmVHcmFwaEJsb2NrIH0gZnJvbSAnLi9pbnRlcmFjdGl2ZS1ncmFwaC5qcyc7XG5pbXBvcnQgeyBNdWx0aXBsZUNob2ljZUJsb2NrIH0gZnJvbSAnLi9tdWx0aXBsZS1jaG9pY2UuanMnO1xuaW1wb3J0IHsgTWF0Y2hpbmdCbG9jayB9IGZyb20gJy4vbWF0Y2hpbmcuanMnO1xuaW1wb3J0IHsgT3JkZXJpbmdCbG9jayB9IGZyb20gJy4vb3JkZXJpbmcuanMnO1xuaW1wb3J0IHsgTnVtYmVyTGluZUJsb2NrIH0gZnJvbSAnLi9udW1iZXItbGluZS5qcyc7XG5pbXBvcnQgeyBEYXRhUGxvdEJsb2NrIH0gZnJvbSAnLi9kYXRhLXBsb3QuanMnO1xuaW1wb3J0IHsgTGVhcm5pbmdPYmplY3RpdmVzQmxvY2sgfSBmcm9tICcuL2xlYXJuaW5nLW9iamVjdGl2ZXMuanMnO1xuaW1wb3J0IHsgV29ya2VkRXhhbXBsZUJsb2NrIH0gZnJvbSAnLi93b3JrZWQtZXhhbXBsZS5qcyc7XG5pbXBvcnQgeyBHcmFwaEZpZ3VyZUJsb2NrIH0gZnJvbSAnLi9ncmFwaC1maWd1cmUuanMnO1xuaW1wb3J0IHsgRmFkZWRXb3JrZWRFeGFtcGxlQmxvY2sgfSBmcm9tICcuL2ZhZGVkLXdvcmtlZC1leGFtcGxlLmpzJztcbmltcG9ydCB7IFNlbGZFeHBsYW5hdGlvbkJsb2NrIH0gZnJvbSAnLi9zZWxmLWV4cGxhbmF0aW9uLmpzJztcbmltcG9ydCB7IFNob3J0QW5zd2VyQmxvY2ssIEVzc2F5QmxvY2sgfSBmcm9tICcuL2ZyZWUtcmVzcG9uc2UuanMnO1xuXG5leHBvcnQgY29uc3QgQmxvY2sgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgUGFyYWdyYXBoQmxvY2ssXG4gIEhlYWRpbmdCbG9jayxcbiAgTWF0aEJsb2NrLFxuICBJbWFnZUJsb2NrLFxuICBDYWxsb3V0QmxvY2ssXG4gIFByb2JsZW1CbG9jayxcbiAgRmlsbEluQmxhbmtCbG9jayxcbiAgQnVsbGV0TGlzdEJsb2NrLFxuICBPcmRlcmVkTGlzdEJsb2NrLFxuICBJbnRlcmFjdGl2ZUdyYXBoQmxvY2ssXG4gIE11bHRpcGxlQ2hvaWNlQmxvY2ssXG4gIE1hdGNoaW5nQmxvY2ssXG4gIE9yZGVyaW5nQmxvY2ssXG4gIE51bWJlckxpbmVCbG9jayxcbiAgRGF0YVBsb3RCbG9jayxcbiAgTGVhcm5pbmdPYmplY3RpdmVzQmxvY2ssXG4gIFdvcmtlZEV4YW1wbGVCbG9jayxcbiAgRmFkZWRXb3JrZWRFeGFtcGxlQmxvY2ssXG4gIFNlbGZFeHBsYW5hdGlvbkJsb2NrLFxuICBTaG9ydEFuc3dlckJsb2NrLFxuICBFc3NheUJsb2NrLFxuICBHcmFwaEZpZ3VyZUJsb2NrLFxuXSk7XG5leHBvcnQgdHlwZSBCbG9jayA9IHouaW5mZXI8dHlwZW9mIEJsb2NrPjtcblxuLy8gTk9URTogbGF5b3V0IGlzIE5PVCBhIGJsb2NrLiBSb3dzL0NvbHVtbnMgKHBhY2thZ2VzL3NjaGVtYS9zcmMvbGF5b3V0LnRzKSBhcmVcbi8vIHRoZSBzdHJ1Y3R1cmFsIGNvbnRhaW5lciBBQk9WRSBibG9ja3MgXHUyMDE0IGEgQ29sdW1uIGhvbGRzIEJsb2NrW10sIG5ldmVyIHRoZVxuLy8gcmV2ZXJzZSBcdTIwMTQgc28gdGhlIEJsb2NrIHVuaW9uIGlzIGxlYWYgYmxvY2tzIG9ubHkgYW5kIGNhbiBuZXZlciBuZXN0IGEgcm93LlxuXG4vLyBSZS1leHBvcnQgaW5kaXZpZHVhbCBibG9jayB0eXBlcyBzbyBjb25zdW1lcnMgY2FuIGltcG9ydCB0aGVtIGJ5IG5hbWUuXG5leHBvcnQge1xuICBQYXJhZ3JhcGhCbG9jayxcbiAgSGVhZGluZ0Jsb2NrLFxuICBNYXRoQmxvY2ssXG4gIEltYWdlQmxvY2ssXG4gIENyb3BSZWN0LFxuICBDYWxsb3V0QmxvY2ssXG4gIFByb2JsZW1CbG9jayxcbiAgRmlsbEluQmxhbmtCbG9jayxcbiAgQnVsbGV0TGlzdEJsb2NrLFxuICBPcmRlcmVkTGlzdEJsb2NrLFxuICBMaXN0SXRlbSxcbiAgSW50ZXJhY3RpdmVHcmFwaEJsb2NrLFxufTtcbmV4cG9ydCB7XG4gIE11bHRpcGxlQ2hvaWNlQmxvY2ssXG4gIE11bHRpcGxlQ2hvaWNlT3B0aW9uLFxuICBDaG9pY2VJbWFnZSxcbiAgQ2hvaWNlR3JhcGgsXG59IGZyb20gJy4vbXVsdGlwbGUtY2hvaWNlLmpzJztcbmV4cG9ydCB7IE1hdGNoaW5nQmxvY2ssIE1hdGNoaW5nSXRlbSwgTWF0Y2hpbmdUYXJnZXQgfSBmcm9tICcuL21hdGNoaW5nLmpzJztcbmV4cG9ydCB7IE9yZGVyaW5nQmxvY2ssIE9yZGVyaW5nSXRlbSB9IGZyb20gJy4vb3JkZXJpbmcuanMnO1xuZXhwb3J0IHtcbiAgTnVtYmVyTGluZUJsb2NrLFxuICBOdW1iZXJMaW5lQ29uZmlnLFxuICBOdW1iZXJMaW5lSW50ZXJhY3Rpb24sXG4gIE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uLFxuICBOdW1iZXJMaW5lSW50ZXJ2YWxJbnRlcmFjdGlvbixcbiAgTnVtYmVyTGluZUludGVydmFsLFxufSBmcm9tICcuL251bWJlci1saW5lLmpzJztcbmV4cG9ydCB7XG4gIERhdGFQbG90QmxvY2ssXG4gIERhdGFQbG90Q29uZmlnLFxuICBEYXRhUGxvdENoYXJ0LFxuICBEYXRhUGxvdEludGVyYWN0aW9uLFxuICBEYXRhUGxvdERpc3BsYXlJbnRlcmFjdGlvbixcbiAgRGF0YVBsb3REb3RwbG90SW50ZXJhY3Rpb24sXG4gIERhdGFQbG90SGlzdG9ncmFtSW50ZXJhY3Rpb24sXG4gIERhdGFQbG90Qm94cGxvdEludGVyYWN0aW9uLFxufSBmcm9tICcuL2RhdGEtcGxvdC5qcyc7XG5leHBvcnQgeyBMZWFybmluZ09iamVjdGl2ZXNCbG9jayB9IGZyb20gJy4vbGVhcm5pbmctb2JqZWN0aXZlcy5qcyc7XG5leHBvcnQgeyBXb3JrZWRFeGFtcGxlQmxvY2ssIFdvcmtlZEV4YW1wbGVDaGlsZCB9IGZyb20gJy4vd29ya2VkLWV4YW1wbGUuanMnO1xuZXhwb3J0IHsgR3JhcGhGaWd1cmVCbG9jayB9IGZyb20gJy4vZ3JhcGgtZmlndXJlLmpzJztcbmV4cG9ydCB7XG4gIEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrLFxuICBGYWRlZFdvcmtlZEV4YW1wbGVDaGlsZCxcbn0gZnJvbSAnLi9mYWRlZC13b3JrZWQtZXhhbXBsZS5qcyc7XG5leHBvcnQgeyBTZWxmRXhwbGFuYXRpb25CbG9jayB9IGZyb20gJy4vc2VsZi1leHBsYW5hdGlvbi5qcyc7XG5leHBvcnQge1xuICBTaG9ydEFuc3dlckJsb2NrLFxuICBFc3NheUJsb2NrLFxuICBXb3JkQ291bnRIaW50LFxuICBSdWJyaWMsXG4gIFJ1YnJpY0NyaXRlcmlvbixcbn0gZnJvbSAnLi9mcmVlLXJlc3BvbnNlLmpzJztcbmV4cG9ydCB7XG4gIEF4aXNDb25maWcsXG4gIFBvaW50SW50ZXJhY3Rpb24sXG4gIEZ1bmN0aW9uSW50ZXJhY3Rpb24sXG4gIEZ1bmN0aW9uTW9kZWwsXG4gIFJlZ2lvbkludGVyYWN0aW9uLFxuICBSYXlJbnRlcmFjdGlvbixcbiAgUmF5QW5zd2VyLFxuICBTZWdtZW50SW50ZXJhY3Rpb24sXG4gIFNlZ21lbnRBbnN3ZXIsXG4gIEVuZHBvaW50U3R5bGUsXG4gIERyYXdhYmxlLFxuICBEcmF3YWJsZUNvbG9yLFxuICBEaXNwbGF5SW50ZXJhY3Rpb24sXG4gIEdyYXBoSW50ZXJhY3Rpb24sXG59IGZyb20gJy4vaW50ZXJhY3RpdmUtZ3JhcGguanMnO1xuZXhwb3J0IHR5cGUgeyBIZWFkaW5nTGV2ZWwgfSBmcm9tICcuL2hlYWRpbmcuanMnO1xuZXhwb3J0IHR5cGUgeyBDYWxsb3V0VmFyaWFudCB9IGZyb20gJy4vY2FsbG91dC5qcyc7XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGxheW91dC50cyBcdTIwMTQgU3RydWN0dXJhbCBsYXlvdXQgbGF5ZXI6IFJvdyArIENvbHVtblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBkb2N1bWVudCBib2R5IGlzIGEgc3RhY2sgb2YgUk9XUy4gQSByb3cgbGF5cyBpdHMgY2hpbGQgY29sdW1ucyBzaWRlIGJ5XG4vLyBzaWRlOyBlYWNoIGNvbHVtbiBob2xkcyBpdHMgb3duIFNUQUNLIG9mIGJsb2NrcyAoYmxvY2srKS4gT25lIGNvbHVtbiBpcyB0aGVcbi8vIGlkZW50aXR5L2RlZmF1bHQgXHUyMDE0IGEgMS1jb2x1bW4gcm93IGlzIHRoZSBub3JtYWwgZnVsbC13aWR0aCB2ZXJ0aWNhbCBmbG93LCBhbmRcbi8vIFwiYWRkIGNvbHVtbnNcIiBzcGxpdHMgYSByb3cgaW50byBtb3JlIGNvbHVtbnMuIFRoaXMgcmVwbGFjZXMgdGhlIG9sZCBgY29sdW1uc2Bcbi8vIGJsb2NrIHR5cGU6IGxheW91dCBpcyBub3cgdGhlIHVuaXZlcnNhbCBjb250YWluZXIgaW5zdGVhZCBvZiBhbiBpbnNlcnRlZFxuLy8gYmxvY2ssIHdoaWNoIGlzIGhvdyBxdWFsaXR5IHByaW50IGVuZ2luZXMgKEluRGVzaWduLCBwcmludCBDU1MpIGFuZCB3ZWJcbi8vIGxheW91dCB0b29scyBtb2RlbCBhIGRvY3VtZW50LlxuLy9cbi8vIE5vIHJlY3Vyc2lvbjogYHJvd2AgYW5kIGBjb2x1bW5gIGFyZSBOT1QgbWVtYmVycyBvZiB0aGUgQmxvY2sgdW5pb24gKEJsb2NrIGlzXG4vLyBsZWFmIGJsb2NrcyBvbmx5KSwgc28gYSBDb2x1bW4ncyBgYmxvY2tzOiBCbG9ja1tdYCBjYW4gbmV2ZXIgY29udGFpbiBhIFJvdy5cbi8vIFRoZSBvbGQgY29sdW1ucy1pbi1jb2x1bW5zIGd1YXJkIChhbiBlbnVtZXJhdGVkIGNlbGwgdW5pb24pIGlzIHRoZXJlZm9yZSBhXG4vLyBzdHJ1Y3R1cmFsIGZhY3QgaGVyZSwgbm90IGFuIGVuZm9yY2VkIGV4Y2x1c2lvbi5cbi8vXG4vLyB3aWR0aCBpcyBhbiBvcHRpb25hbCB1bml0bGVzcyB3ZWlnaHQgcGVyIGNvbHVtbjogYSBjb2x1bW4gd2l0aCB3aWR0aCAyIGJlc2lkZVxuLy8gYSBjb2x1bW4gd2l0aCB3aWR0aCAxIHRha2VzIDIvMyBvZiB0aGUgcm93LiBBYnNlbnQgXHUyMTkyIGVxdWFsIHNwbGl0LiBUaGlzIGlzIHRoZVxuLy8gcmVhc29uIGxheW91dCBpcyBzdHJ1Y3R1cmFsIHJhdGhlciB0aGFuIGEgQ1NTIHRvZ2dsZSBcdTIwMTQgXCJ3aWRlIHdvcmtlZCBleGFtcGxlICtcbi8vIG5hcnJvdyBhbnN3ZXIgc3RyaXBcIiBuZWVkcyB1bmVxdWFsIHdpZHRocy5cbi8vXG4vLyBtaW5IZWlnaHQgaXMgYSByZXNlcnZlZCB3b3JrLXNwYWNlIGZsb29yIGluIHJlbS4gVGhlIGNlbGwgc3RpbGwgR1JPV1Mgd2l0aFxuLy8gY29udGVudCAoYSBmbG9vciwgbm90IGEgZml4ZWQgaGVpZ2h0IFx1MjAxNCBmaXhlZCBoZWlnaHRzIGJyZWFrIHByaW50IHJlZmxvdyBhbmRcbi8vIHRoZSBmb2xkYWJsZSdzIGhlaWdodCBtZWFzdXJlbWVudCkuIHJlbSBzbyB0aGUgcmVzZXJ2ZWQgc3BhY2Ugc2NhbGVzIHdpdGggdGhlXG4vLyBwcmludCBmb250LXNpemUgY29uZmlnLiBBYnNlbnQgPSBjb250ZW50LWRldGVybWluZWQgaGVpZ2h0LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5cbmltcG9ydCB7IEJsb2NrIH0gZnJvbSAnLi9ibG9ja3MvaW5kZXguanMnO1xuXG4vLyBncmlkTGluZXMgdHVybnMgYSByb3cgaW50byBhIHJ1bGVkIGdyaWQ6IGEgYm9yZGVyIGFyb3VuZCB0aGUgd2hvbGUgcm93LCBydWxlc1xuLy8gYmV0d2VlbiB0aGUgY2VsbHMsIGFuZCBydWxlcyBiZXR3ZWVuIHRoZSBzdGFja2VkIGJsb2NrcyB3aXRoaW4gYSBjZWxsLlxuLy8gRXNwZWNpYWxseSB1c2VmdWwgaW4gcHJpbnQgKGJveGVkIHJlZ2lvbnMgdG8gd3JpdGUgaW4gLyBjdXQgb3V0KS4gVHJpLXN0YXRlIHNvXG4vLyBhIHJvdyBjYW4gZGVmZXIgdG8gdGhlIGFjdGl2aXR5LXdpZGUgZGVmYXVsdDpcbi8vICAgJ2luaGVyaXQnIFx1MjAxNCBmb2xsb3cgbWV0YS5wcmludC5ncmlkTGluZXMgKHRoZSBhY3Rpdml0eSBkZWZhdWx0OyB0aGUgcmVuZGVyZXJcbi8vICAgICAgICAgICAgICAgcmVzb2x2ZXMgdGhpcykuIERlZmF1bHQsIHNvIGEgZnJlc2hseSBhdXRob3JlZCByb3cgdHJhY2tzIHRoZVxuLy8gICAgICAgICAgICAgICBhY3Rpdml0eSBzZXR0aW5nIHdpdGhvdXQgcGVyLXJvdyBmaWRkbGluZy5cbi8vICAgJ29uJyAgICAgIFx1MjAxNCBhbHdheXMgcnVsZWQsIHJlZ2FyZGxlc3Mgb2YgdGhlIGFjdGl2aXR5IGRlZmF1bHQuXG4vLyAgICdvZmYnICAgICBcdTIwMTQgbmV2ZXIgcnVsZWQsIHJlZ2FyZGxlc3Mgb2YgdGhlIGFjdGl2aXR5IGRlZmF1bHQuXG5leHBvcnQgY29uc3QgQ29sdW1uR3JpZExpbmVzID0gei5lbnVtKFsnaW5oZXJpdCcsICdvbicsICdvZmYnXSk7XG5leHBvcnQgdHlwZSBDb2x1bW5HcmlkTGluZXMgPSB6LmluZmVyPHR5cGVvZiBDb2x1bW5HcmlkTGluZXM+O1xuXG5leHBvcnQgY29uc3QgQ29sdW1uID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIC8vIFBlci1jb2x1bW4gd2lkdGggd2VpZ2h0IChmciB1bml0cykuIE9wdGlvbmFsOyBhYnNlbnQgPSBlcXVhbCBzcGxpdC5cbiAgd2lkdGg6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAvLyBSZXNlcnZlZCB3b3JrLXNwYWNlIGZsb29yIGluIHJlbSAoYSBtaW4taGVpZ2h0LCBub3QgYSBmaXhlZCBoZWlnaHQpLlxuICBtaW5IZWlnaHQ6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAvLyBBIGNvbHVtbiBob2xkcyBhIG5vbi1lbXB0eSBTVEFDSyBvZiBibG9ja3MgKGJsb2NrKykuIEEgY29sdW1uIGNhbiBob2xkIGFcbiAgLy8gaGVhZGluZyBmb2xsb3dlZCBieSBzZXZlcmFsIHByb2JsZW1zIFx1MjAxNCB0aGUgdGhpbmcgYSBkb2N1bWVudCB0b29sIG5lZWRzIGFuZFxuICAvLyBhIG9uZS1ibG9jay1wZXItcm93IG1vZGVsIGNhbid0IGV4cHJlc3MuXG4gIGJsb2Nrczogei5hcnJheShCbG9jaykubWluKDEpLFxufSk7XG5leHBvcnQgdHlwZSBDb2x1bW4gPSB6LmluZmVyPHR5cGVvZiBDb2x1bW4+O1xuXG4vLyAxLi42IGNvbHVtbnMuIFRoZSBlZGl0b3Igc3VyZmFjZXMgYSBub24tYmxvY2tpbmcgd2FybmluZyBhYm92ZSAzICh0b28gbmFycm93XG4vLyB0byByZWFkIG9uIHBhcGVyIG9yIGEgQ2hyb21lYm9vayksIGJ1dCB0aGUgc2NoZW1hIGFjY2VwdHMgdXAgdG8gNiBzbyBhblxuLy8gaW50ZW50aW9uYWwgZGVuc2UgbGF5b3V0IHN0aWxsIHZhbGlkYXRlcy4gT25lIGNvbHVtbiBpcyB0aGUgaWRlbnRpdHkgc3RhdGU6XG4vLyBhIGZ1bGwtd2lkdGggcm93IHRoYXQgXCJyZW1vdmUgY29sdW1uXCIgY2Fubm90IGRpc3NvbHZlIGJlbG93LlxuZXhwb3J0IGNvbnN0IFJvdyA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICBjb2x1bW5zOiB6LmFycmF5KENvbHVtbikubWluKDEpLm1heCg2KSxcbiAgZ3JpZExpbmVzOiBDb2x1bW5HcmlkTGluZXMuZGVmYXVsdCgnaW5oZXJpdCcpLFxufSk7XG5leHBvcnQgdHlwZSBSb3cgPSB6LmluZmVyPHR5cGVvZiBSb3c+O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBkb2N1bWVudC50cyBcdTIwMTQgVG9wLWxldmVsIEFjdGl2aXR5RG9jdW1lbnQgYW5kIFNlY3Rpb24gc2NoZW1hc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEFjdGl2aXR5RG9jdW1lbnQgaXMgd2hhdCBnZXRzIHN0b3JlZCBpbiBhY3Rpdml0aWVzLmRyYWZ0X2NvbnRlbnQgYW5kXG4vLyBhY3Rpdml0eV92ZXJzaW9ucy5jb250ZW50LiBUaGUgc2hhcGUgbGl2ZXMgaW4gdGhpcyBwYWNrYWdlIGFzIHRoZSBzaW5nbGVcbi8vIHNvdXJjZSBvZiB0cnV0aCBcdTIwMTQgdGhlIHJlbmRlcmVyIHBhcnNlcyBpdCwgdGhlIGVkaXRvciBwcm9kdWNlcyBpdCB2aWEgdGhlXG4vLyBzZXJpYWxpemUgbGF5ZXIsIHRoZSBkYXRhYmFzZSBzdG9yZXMgaXQgYXMganNvbmIuXG4vL1xuLy8gc2NoZW1hVmVyc2lvbiBpcyB0aGUgbWlncmF0aW9uIGFuY2hvci4gSXQgaXMgY3VycmVudGx5IDIuIFRoZSAxXHUyMTkyMiByZXNoYXBlXG4vLyAoYmxvY2stc3RyZWFtIHNlY3Rpb25zIFx1MjE5MiByb3dzLW9mLWNvbHVtbnMpIHdhcyBhIEdSRUVORklFTEQgSEFSRC1DVVQ6IHRoZXJlIHdhc1xuLy8gbm8gcHJvZHVjdGlvbiBkYXRhIHRvIHByZXNlcnZlLCBzbyB0aGVyZSBpcyBkZWxpYmVyYXRlbHkgTk8gbWlncmF0ZSgxXHUyMTkyMikgYW5kXG4vLyBOTyBtaWdyYXRlLW9uLXJlYWQgXHUyMDE0IHRoZSBwYXJzZXIgaXMgei5saXRlcmFsKDIpIGFuZCBSRUpFQ1RTIGEgdjEgZG9jdW1lbnRcbi8vIChhIHN0cmF5IHYxIGZhaWxzIGxvdWRseSBhdCBwYXJzZSByYXRoZXIgdGhhbiBtaXMtcGFyc2luZyBpbnRvIGdhcmJhZ2UpLlxuLy8gV2hlbiBhIEZVVFVSRSBzY2hlbWEgbmVlZHMgYSBub24tdHJpdmlhbCBtaWdyYXRpb24gYWdhaW5zdCByZWFsIHN0b3JlZCBkYXRhLFxuLy8gYnVtcCB0aGUgdmVyc2lvbiBhbmQgYWRkIGEgbWlncmF0ZShOIC0+IE4rMSkgdGhhdCBydW5zIG9uIHJlYWQgKG9sZFxuLy8gYWN0aXZpdHlfdmVyc2lvbnMgcm93cyBzdGF5IGF0IHRoZWlyIG9yaWdpbmFsIHNjaGVtYVZlcnNpb24gZm9yZXZlcjsgbWlncmF0ZVxuLy8gb24gcmVhZCwgbmV2ZXIgYnkgbXV0YXRpbmcgc3RvcmVkIHZlcnNpb25zKS4gVGhlIGdyZWVuZmllbGQgaGFyZC1jdXQgaXMgYVxuLy8gb25lLXRpbWUgZXhjZXB0aW9uLCBub3QgdGhlIGdlbmVyYWwgcG9saWN5LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBCbG9jayB9IGZyb20gJy4vYmxvY2tzL2luZGV4LmpzJztcbmltcG9ydCB7IFJvdyB9IGZyb20gJy4vbGF5b3V0LmpzJztcblxuLy8gU2VjdGlvbjogYSBjb2xsZWN0aW9uIG9mIFJPV1Mgd2l0aCBhbiBvcHRpb25hbCB0aXRsZS4gU2VjdGlvbnMgYXJlIHRoZVxuLy8gdmVydGljYWwgY2hlY2twb2ludCBwcmltaXRpdmU7IHJvd3MgYXJlIHRoZSBob3Jpem9udGFsLXNwbGl0IHByaW1pdGl2ZVxuLy8gKGxheW91dC50cykuIEEgc2VjdGlvbiBpcyB1c3VhbGx5IG9uZSAxLWNvbHVtbiByb3cgd2hvc2UgY29sdW1uIHN0YWNrcyBtYW55XG4vLyBibG9ja3M7IGEgY29sdW1uZWQgcmVnaW9uIGlzIGEgbXVsdGktY29sdW1uIHJvdy4gU2VjdGlvbnMgYXJlIG9yZ2FuaXphdGlvbmFsXG4vLyBvbmx5IFx1MjAxNCB0aGV5IGRvbid0IGNvbnN0cmFpbiBjb250ZW50IGJleW9uZCBob2xkaW5nIHJvd3MuXG4vL1xuLy8gaXNDaGVja3BvaW50IG1hcmtzIHRoaXMgc2VjdGlvbiBhcyBoYXZpbmcgYSBcIkNoZWNrIHRoaXMgc2VjdGlvblwiIGJ1dHRvbiBhdFxuLy8gaXRzIGJvdHRvbSBpbiB0aGUgcHVibGlzaGVkIEhUTUwuIE9ubHkgbWVhbmluZ2Z1bCB3aGVuIHRoZSBhY3Rpdml0eSdzXG4vLyBzdWJtaXNzaW9uTW9kZSBpcyAnbG9ja2VkJyBvciAnZnJlZScgKGlnbm9yZWQgaW4gJ3NpbmdsZScgbW9kZSBcdTIwMTQgbm9cbi8vIGNoZWNrcG9pbnQgYnV0dG9ucyByZW5kZXIgYW55d2hlcmUpLlxuZXhwb3J0IGNvbnN0IFNlY3Rpb24gPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDaGVja3BvaW50OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93czogei5hcnJheShSb3cpLFxufSk7XG5leHBvcnQgdHlwZSBTZWN0aW9uID0gei5pbmZlcjx0eXBlb2YgU2VjdGlvbj47XG5cbi8vIE1ldGE6IHRoZSBhY3Rpdml0eSdzIHRpdGxlLCBjb3Vyc2UsIHVuaXQsIGV0Yy4gTm90IHVzZWQgaW4gcmVuZGVyaW5nIG9mXG4vLyB0aGUgYm9keSBcdTIwMTQgZHJpdmVzIHRoZSBwdWJsaXNoZWQgSFRNTCdzIDx0aXRsZT4gYW5kIGhlYWRlciBiYW5uZXIuXG4vL1xuLy8gc3VibWlzc2lvbk1vZGUgY29udHJvbHMgdGhlIHN0dWRlbnQtZmFjaW5nIGZsb3c6XG4vLyAgICdzaW5nbGUnIFx1MjAxNCBvbmUgc3VibWl0IGF0IHRoZSBlbmQsIG5vIGNoZWNrcG9pbnRzICh0aGUgb3JpZ2luYWwgUGhhc2UgMSBtb2RlbClcbi8vICAgJ2xvY2tlZCcgXHUyMDE0IHBlci1zZWN0aW9uIGNoZWNrcG9pbnRzOyBpbnB1dHMgZnJlZXplIGFmdGVyIGVhY2ggc2VjdGlvbiBpcyBjaGVja2VkXG4vLyAgICdmcmVlJyAgIFx1MjAxNCBwZXItc2VjdGlvbiBjaGVja3BvaW50czsgc3R1ZGVudCBjYW4gcmV2aXNlIGFueSBjaGVja2VkIHNlY3Rpb24gZnJlZWx5XG4vL1xuLy8gcmV2aXNpb25Nb2RlIGNvbnRyb2xzIHBvc3Qtc3VibWlzc2lvbiBiZWhhdmlvcjpcbi8vICAgJ2ZyZWUnICAgXHUyMDE0IGFmdGVyIGZpbmFsIHN1Ym1pdCwgc3R1ZGVudCBjYW4gcmV2aXNlIGFuZCByZXN1Ym1pdCAobmV3IGF0dGVtcHQgcm93KVxuLy8gICAnbG9ja2VkJyBcdTIwMTQgZmluYWwgc3VibWl0IGlzIGZpbmFsOyBubyByZXN1Ym1pc3Npb25zXG4vLyByZXZpc2lvbk1vZGUgaXMgaWdub3JlZCB3aGVuIHN1Ym1pc3Npb25Nb2RlID09PSAnc2luZ2xlJy5cbi8vXG4vLyBncmFkaW5nTW9kZSBjb250cm9scyB3aG8gc2NvcmVzIHRoZSBhY3Rpdml0eTpcbi8vICAgJ2F1dG8nICAgXHUyMDE0IFBoYXNlIDEgZGVmYXVsdC4gUnVudGltZSBjb21wdXRlcyBzY29yZXMgY2xpZW50LXNpZGUgZnJvbVxuLy8gICAgICAgICAgICAgIGFuc3dlciBrZXlzIGJha2VkIGludG8gdGhlIHB1Ymxpc2hlZCBIVE1MLlxuLy8gICAnbWFudWFsJyBcdTIwMTQgUGhhc2UgMi42Ky4gTm8gYXV0by1zY29yaW5nOyBzdWJtaXNzaW9ucyBsYW5kIGluIHRoZVxuLy8gICAgICAgICAgICAgIHRlYWNoZXIgZGFzaGJvYXJkIHBlbmRpbmcgcnVicmljIGFwcGxpY2F0aW9uLlxuLy8gICAnbWl4ZWQnICBcdTIwMTQgUGhhc2UgMi42Ky4gU29tZSBibG9ja3MgYXV0by1ncmFkZWQsIHNvbWUgbWFudWFsbHkgZ3JhZGVkXG4vLyAgICAgICAgICAgICAgKGUuZy4sIDUgTUMgcXVlc3Rpb25zICsgMSBlc3NheSkuIEZpbmFsIHNjb3JlIGNvbWJpbmVzIGJvdGguXG4vLyBJbmVydCBpbiBQaGFzZSAxIFx1MjAxNCBubyBtYW51YWwtZ3JhZGVkIGJsb2NrIHR5cGVzIGV4aXN0IHlldCwgc28gdGhlXG4vLyBydW50aW1lIHRyZWF0cyAnbWFudWFsJy8nbWl4ZWQnIHRoZSBzYW1lIGFzICdhdXRvJyB1bnRpbCBQaGFzZSAyLjZcbi8vIGxhbmRzIHBlci1ibG9jayBncmFkaW5nIG1ldGFkYXRhLiBGaWVsZCBleGlzdHMgbm93IHNvIGV4aXN0aW5nIHN0b3JlZFxuLy8gZG9jdW1lbnRzIHBhcnNlIGNsZWFubHkgd2hlbiB0aG9zZSBibG9jayB0eXBlcyBhcnJpdmUuXG4vL1xuLy8gYWN0aXZpdHlUeXBlIGRyaXZlcyBwcmVzZW50YXRpb246IGFuIGV4aXRfdGlja2V0IHJlbmRlcnMgYXMgYSBzaW5nbGUtcGFnZVxuLy8gZm9jdXNlZCBsYXlvdXQ7IGEgd29ya3NoZWV0IHJlbmRlcnMgd2l0aCBmdWxsIHNlY3Rpb24gbmF2aWdhdGlvbjsgZXRjLlxuLy9cbi8vIGFuc3dlckZlZWRiYWNrIGNvbnRyb2xzIFdIRU4gYSBibGFuaydzIGNvcnJlY3QvaW5jb3JyZWN0IHNpZ25hbCAodGhlXG4vLyBncmVlbi9yZWQgYm9yZGVyICsgYXJpYS1pbnZhbGlkICsgdGFyZ2V0ZWQgbWlzdGFrZSBmZWVkYmFjaykgYmVjb21lc1xuLy8gdmlzaWJsZSB0byB0aGUgc3R1ZGVudDpcbi8vICAgJ2ltbWVkaWF0ZScgXHUyMDE0IHRoZSBibGFuayBzZWxmLWNoZWNrcyBvbiBibHVyLCBzbyB0aGUgc3R1ZGVudCBzZWVzXG4vLyAgICAgICAgICAgICAgICAgY29ycmVjdC9pbmNvcnJlY3QgYXMgc29vbiBhcyB0aGV5IGxlYXZlIHRoZSBmaWVsZC4gQVxuLy8gICAgICAgICAgICAgICAgIHNlbGYtY2hlY2sgcHJhY3RpY2UgZXhwZXJpZW5jZS5cbi8vICAgJ29uX2NoZWNrJyAgXHUyMDE0IGNvcnJlY3RuZXNzIGlzIGhpZGRlbiB1bnRpbCB0aGUgc3R1ZGVudCBjaGVja3MgdGhlIHNlY3Rpb25cbi8vICAgICAgICAgICAgICAgICAobG9ja2VkL2ZyZWUpIG9yIHN1Ym1pdHMgKHNpbmdsZSkuIEFuIGFzc2Vzc21lbnQtc3R5bGVcbi8vICAgICAgICAgICAgICAgICBleHBlcmllbmNlIHRoYXQgZG9lc24ndCBsZWFrIGFuc3dlcnMgYmVmb3JlIHRoZSBnYXRlLlxuLy8gT3J0aG9nb25hbCB0byBzdWJtaXNzaW9uTW9kZSBcdTIwMTQgYW55IGNoZWNrcG9pbnQgYmVoYXZpb3IgY2FuIHBhaXIgd2l0aFxuLy8gZWl0aGVyIGZlZWRiYWNrIHRpbWluZyAodGhlIHNhbWUgcmVhc29uIHJldmlzaW9uTW9kZSBpcyBpdHMgb3duIGZpZWxkKS5cbi8vIERlZmF1bHQgJ29uX2NoZWNrJzogdGhlIGNoZWNrcG9pbnQgbW9kZWwgaW1wbGllcyBcImFuc3dlciwgdGhlbiBjaGVja1wiLFxuLy8gYW5kIGxlYWtpbmcgY29ycmVjdG5lc3Mgb24gYmx1ciB1bmRlcmN1dCB0aGF0LiBOT1RFIHRoZSBydW50aW1lIGRlZmF1bHRzIGFcbi8vIE1JU1NJTkcgYW5zd2VyRmVlZGJhY2sgKGFjdGl2aXRpZXMgcHVibGlzaGVkIGJlZm9yZSB0aGlzIGZpZWxkIGV4aXN0ZWQpIHRvXG4vLyAnaW1tZWRpYXRlJywgcHJlc2VydmluZyB0aGVpciBvcmlnaW5hbCBiZWhhdmlvciBcdTIwMTQgdGhlIHNjaGVtYSBkZWZhdWx0IGFuZFxuLy8gdGhlIHJ1bnRpbWUgYmFjay1jb21wYXQgZmFsbGJhY2sgZGlmZmVyIG9uIHB1cnBvc2UuXG4vL1xuLy8gc2tpbGxzIGlzIGFuIGFycmF5IG9mIHVuaXZlcnNhbCBza2lsbCB0YWdzIGRlc2NyaWJpbmcgd2hhdCB0aGUgYWN0aXZpdHlcbi8vIHRlYWNoZXMuIEFjdGlvbi1vcmllbnRlZCwgZnJhbWV3b3JrLW5ldXRyYWw6IFwic2ltcGxpZnlpbmcgcmF0aW9uYWxcbi8vIGV4cHJlc3Npb25zXCIsIFwiZmFjdG9yaW5nIHF1YWRyYXRpY3NcIiwgXCJncmFwaGluZyBwYXJhYm9sYXNcIi4gQSB0ZWFjaGVyIHdob1xuLy8gd2FudHMgdG8gdXNlIFRFS1Mgb3IgQ0NTUyBjb2RlcyBjYW4gXHUyMDE0IHRoZSBmaWVsZCBkb2Vzbid0IHZhbGlkYXRlIGFnYWluc3Rcbi8vIGFueSBmcmFtZXdvcmsuIFBoYXNlIDUgbWFya2V0cGxhY2UgYWRkcyBjb250cm9sbGVkIHZvY2FidWxhcnkgb24gdG9wLlxuLy9cbi8vIHByaW50IGlzIHRoZSB0ZWFjaGVyLWNvbmZpZ3VyYWJsZSBwcmludCBsYXllciAoc2VlIFByaW50Q29uZmlnIGJlbG93KS4gSXRcbi8vIGlzIGFsd2F5cyBwcmVzZW50IGFmdGVyIHBhcnNlIChkZWZhdWx0IHt9KSwgc28gZXZlcnkgY29uc3VtZXIgY2FuIHJlYWRcbi8vIGRvYy5tZXRhLnByaW50Liogd2l0aG91dCBhbiB1bmRlZmluZWQgY2hlY2s7IGRvY3VtZW50cyBzdG9yZWQgYmVmb3JlIHRoaXNcbi8vIGZpZWxkIGV4aXN0ZWQgZ2V0IHRoZSBkZWZhdWx0cyBhcHBsaWVkIG9uIHJlYWQuIFRoZSBkZWZhdWx0cyBrZWVwIHRoZVxuLy8gU3RhZ2UgMTEgYmFzZWxpbmUgcGFnZSBnZW9tZXRyeSAoc2luZ2xlIGNvbHVtbiwgMC41aW4gbWFyZ2luLCBsZXR0ZXIpIGFuZFxuLy8gYWRkIHRoZSBwcmludCB0eXBvZ3JhcGh5IFN0YWdlIDExIGRlbGliZXJhdGVseSBkZWZlcnJlZCB0byB0aGlzIGZlYXR1cmVcbi8vICgxMXB0IGJvZHksIDFyZW0gcHJvYmxlbSBzcGFjaW5nKSBcdTIwMTQgc28gYSBmcmVzaGx5IHB1Ymxpc2hlZCBwYWdlIHByaW50cyBpbiBhXG4vLyBzZW5zaWJsZSBkZWZhdWx0IHN0eWxlLCBhbmQgdGhlIHRlYWNoZXIgdHVuZXMgZnJvbSB0aGVyZS5cblxuLy8gUHJpbnRIZWFkZXI6IHdoaWNoIGxhYmVsZWQgZmlsbC1pbiBsaW5lcyBhcHBlYXIgYXQgdGhlIHRvcCBvZiBhIHByaW50ZWRcbi8vIHNoZWV0LiBOYW1lICsgRGF0ZSBhcmUgdGhlIG5lYXItdW5pdmVyc2FsIHBhaXIsIHNvIHRoZXkgZGVmYXVsdCBvbjsgdGhlXG4vLyByZXN0IGRlZmF1bHQgb2ZmLiBjdXN0b20gaG9sZHMgZXh0cmEgdGVhY2hlci1hdXRob3JlZCBsYWJlbHMgKGUuZy5cbi8vIFwiQmxvY2tcIiwgXCJUZWFjaGVyXCIpIHJlbmRlcmVkIGFzIHRoZWlyIG93biBmaWxsLWluIGxpbmVzLiBUaGUgaGVhZGVyIGlzXG4vLyBwcmludC1vbmx5IFx1MjAxNCBpdCBuZXZlciBzaG93cyBvbiBzY3JlZW4gKHRoZSBvbi1zY3JlZW4gaWRlbnRpdHkgcHJvbXB0IGlzIHRoZVxuLy8gbGl2ZSBuYW1lIGZpZWxkKTsgc2VlIHJlbmRlclByaW50SGVhZGVyICsgdGhlIEBtZWRpYSBwcmludCBydWxlcy5cbmV4cG9ydCBjb25zdCBQcmludEhlYWRlciA9IHoub2JqZWN0KHtcbiAgbmFtZTogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGU6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2Q6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmU6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VzdG9tOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBQcmludEhlYWRlciA9IHouaW5mZXI8dHlwZW9mIFByaW50SGVhZGVyPjtcblxuLy8gUHJpbnRDb25maWc6IHRoZSB0ZWFjaGVyJ3MgcHJpbnQgc2V0dGluZ3MgZm9yIGFuIGFjdGl2aXR5LiBFdmVyeSBmaWVsZCBpc1xuLy8gZGVmYXVsdGVkIHNvIFByaW50Q29uZmlnLnBhcnNlKHt9KSB5aWVsZHMgYSBjb21wbGV0ZSwgYmFzZWxpbmUtZXF1aXZhbGVudFxuLy8gY29uZmlnIFx1MjAxNCB0aGF0IGlzIHdoYXQgQWN0aXZpdHlNZXRhLnByaW50IGZhbGxzIGJhY2sgdG8uXG4vL1xuLy8gICBwYXBlclNpemUgICAgICBcdTIwMTQgJ2xldHRlcicgfCAnYTQnLiBEcml2ZXMgdGhlIEBwYWdlIHNpemUga2V5d29yZC4gRGVmYXVsdFxuLy8gICAgICAgICAgICAgICAgICAgIGxldHRlciBmb3Igbm93IChOWi9BNCBpcyBhIG9uZS1saW5lIGZsaXAgbGF0ZXIpOyBlbWl0dGVkXG4vLyAgICAgICAgICAgICAgICAgICAgYXMgYSBMSVRFUkFMIEBwYWdlIHJ1bGUsIG5ldmVyIGEgQ1NTIHZhciwgYmVjYXVzZSBAcGFnZVxuLy8gICAgICAgICAgICAgICAgICAgIHJ1bGVzIGNhbm5vdCByZWxpYWJseSByZWFkIGN1c3RvbSBwcm9wZXJ0aWVzLlxuLy8gICBjb2x1bW5zICAgICAgICBcdTIwMTQgMS4uMy4gY29sdW1uLWNvdW50IGluIHByaW50OyAxIGlzIGEgbm8tb3AgKHNpbmdsZSBjb2wpLlxuLy8gICAgICAgICAgICAgICAgICAgIERPUk1BTlQ6IHRoZSBhdXRob3ItZmFjaW5nIGNvbnRyb2wgd2FzIHJldGlyZWQgd2hlblxuLy8gICAgICAgICAgICAgICAgICAgIHN0cnVjdHVyYWwgYXV0aG9yZWQgY29sdW1ucyAodGhlIFJvdy9Db2x1bW4gbGF5b3V0XG4vLyAgICAgICAgICAgICAgICAgICAgcHJpbWl0aXZlKSBsYW5kZWQgXHUyMDE0IGEgbXVsdGktY29sdW1uIHJvdyByZW5kZXJzIGNvbnNpc3RlbnRseVxuLy8gICAgICAgICAgICAgICAgICAgIG9uIHNjcmVlbiwgaW4gd29ya3NoZWV0IHByaW50LCBhbmQgaW5zaWRlIGEgZm9sZGFibGUsIHNvXG4vLyAgICAgICAgICAgICAgICAgICAgdGhpcyBwZXItbW9kZSBwcmludCBzZXR0aW5nIGJlY2FtZSByZWR1bmRhbnQuIFRoZSBmaWVsZCArXG4vLyAgICAgICAgICAgICAgICAgICAgaXRzIHJlbmRlcmVyIHZhci9DU1MgYXJlIGtlcHQgKG5vdCBkZWxldGVkKSBzbyB2YWx1ZXNcbi8vICAgICAgICAgICAgICAgICAgICBhbHJlYWR5IHNhdmVkIG9uIGV4aXN0aW5nIGFjdGl2aXRpZXMga2VlcCBwcmludGluZyBhc1xuLy8gICAgICAgICAgICAgICAgICAgIGF1dGhvcmVkLCBhbmQgc28gdGhlIGNvbnRyb2wgY2FuIGJlIHJlLWV4cG9zZWQgbGF0ZXIgd2l0aFxuLy8gICAgICAgICAgICAgICAgICAgIG5vIHNjaGVtYS9yZW5kZXJlciBjaGFuZ2UuIE5ldyBhY3Rpdml0aWVzIGRlZmF1bHQgdG8gMS5cbi8vICAgd29ya1NwYWNlICAgICAgXHUyMDE0IHJlbSBvZiBibGFuayBzcGFjZSBiZWxvdyBlYWNoIHByb2JsZW0gZm9yIGhhbmQtd29ya2luZy5cbi8vICAgICAgICAgICAgICAgICAgICBBY3Rpdml0eS1sZXZlbCBkZWZhdWx0OyBhIGZpbGwtaW4tYmxhbmsgYmxvY2sgbWF5IG92ZXJyaWRlXG4vLyAgICAgICAgICAgICAgICAgICAgaXQgcGVyLXByb2JsZW0gdmlhIEZpbGxJbkJsYW5rQmxvY2sud29ya1NwYWNlLlxuLy8gICBmb250U2l6ZSAgICAgICBcdTIwMTQgcHQuIEFwcGxpZWQgdG8gLmFjdGl2aXR5LWNvbnRhaW5lciBpbiBwcmludCBvbmx5LlxuLy8gICBwcm9ibGVtU3BhY2luZyBcdTIwMTQgcmVtIG9mIHZlcnRpY2FsIG1hcmdpbiBhcm91bmQgZWFjaCBwcm9ibGVtIGluIHByaW50LlxuLy8gICBtYXJnaW4gICAgICAgICBcdTIwMTQgaW5jaGVzLiBUaGUgQHBhZ2UgbWFyZ2luIChsaXRlcmFsLCBsaWtlIHBhcGVyU2l6ZSkuXG4vLyAgIGdyaWRMaW5lcyAgICAgIFx1MjAxNCBhY3Rpdml0eS13aWRlIGRlZmF1bHQgZm9yIHJ1bGVkIHJvd3MuIEEgUm93IHdpdGhcbi8vICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6J2luaGVyaXQnICh0aGUgcGVyLXJvdyBkZWZhdWx0KSByZXNvbHZlcyB0byB0aGlzO1xuLy8gICAgICAgICAgICAgICAgICAgICdvbicvJ29mZicgb24gYSByb3cgb3ZlcnJpZGUgaXQuIE9mZiBieSBkZWZhdWx0IFx1MjAxNCBydWxlZFxuLy8gICAgICAgICAgICAgICAgICAgIGdyaWRzIGFyZSBvcHQtaW4uXG4vLyAgIHByaW50UmVmZXJlbmNlUGFuZWwgXHUyMDE0IHdoZXRoZXIgdGhlIGFjdGl2aXR5J3MgcmVmZXJlbmNlIHBhbmVsIHByaW50cyBhcyBhXG4vLyAgICAgICAgICAgICAgICAgICAgYm94IGF0IHRoZSB0b3Agb2YgdGhlIHdvcmtzaGVldC4gT24gYnkgZGVmYXVsdDsgYSB0ZWFjaGVyXG4vLyAgICAgICAgICAgICAgICAgICAgd2l0aCBhIGNsYXNzIHNldCBvZiBjaGFydHMgY2FuIHR1cm4gaXQgb2ZmIHNvIGl0IGlzbid0XG4vLyAgICAgICAgICAgICAgICAgICAgcmVwcmludGVkIHBlciBhY3Rpdml0eS4gVGhlIG9uLVNDUkVFTiByZWZlcmVuY2UgdG9vbGJhciBpc1xuLy8gICAgICAgICAgICAgICAgICAgIHVuYWZmZWN0ZWQgXHUyMDE0IHRoaXMgZ2F0ZXMgcHJpbnQgYWxvbmUuIFJlYWQgYnkgdGhlIHJlbmRlcmVyXG4vLyAgICAgICAgICAgICAgICAgICAgdG8gZGVjaWRlIHdoZXRoZXIgdG8gZW1pdCB0aGUgcHJpbnQgYm94OyBub3QgYSBjb250YWluZXJcbi8vICAgICAgICAgICAgICAgICAgICBDU1MgdmFyLlxuLy8gICBwcmludERlZmluaXRpb25HbG9zc2FyeSBcdTIwMTQgd2hldGhlciBpbmxpbmUgdm9jYWJ1bGFyeSBkZWZpbml0aW9ucyBwcmludCBhcyBhXG4vLyAgICAgICAgICAgICAgICAgICAgZ2xvc3NhcnkgYXBwZW5kaXggYXQgdGhlIEVORCBvZiB0aGUgd29ya3NoZWV0LiBPRkYgYnlcbi8vICAgICAgICAgICAgICAgICAgICBkZWZhdWx0LCB1bmxpa2UgcHJpbnRSZWZlcmVuY2VQYW5lbDogb24gc2NyZWVuIGEgZGVmaW5pdGlvblxuLy8gICAgICAgICAgICAgICAgICAgIGlzIGEgcG9wb3ZlciBhIHN0dWRlbnQgb3BlbnMgb24gZGVtYW5kLCBhbmQgbW9zdCBhcmUgYVxuLy8gICAgICAgICAgICAgICAgICAgIHNob3J0IGdsb3NzIHRoYXQgd291bGQgb25seSBwYWQgdGhlIHByaW50b3V0LiBBIHRlYWNoZXIgd2hvXG4vLyAgICAgICAgICAgICAgICAgICAgaGFzIHB1dCBhIGZvcm11bGEgb3IgYSBkaWFncmFtIGluIGEgZGVmaW5pdGlvbiB0dXJucyB0aGlzXG4vLyAgICAgICAgICAgICAgICAgICAgb24gc28gaXQgc3Vydml2ZXMgb24gcGFwZXIgKGRlZmluaXRpb24gcG9wb3ZlcnMgYXJlXG4vLyAgICAgICAgICAgICAgICAgICAgZGlzcGxheTpub25lIGluIHByaW50KS4gUmVhZCBieSB0aGUgcmVuZGVyZXIgdG8gZGVjaWRlXG4vLyAgICAgICAgICAgICAgICAgICAgd2hldGhlciB0byBlbWl0IHRoZSBhcHBlbmRpeDsgbm90IGEgY29udGFpbmVyIENTUyB2YXIuXG4vLyAgIGhlYWRlciAgICAgICAgIFx1MjAxNCBzZWUgUHJpbnRIZWFkZXIuXG4vL1xuLy8gY29sdW1ucy93b3JrU3BhY2UvZm9udFNpemUvcHJvYmxlbVNwYWNpbmcgcmlkZSBhcyAtLXByaW50LSogQ1NTIHZhcnMgb24gdGhlXG4vLyBjb250YWluZXIgKG5vcm1hbCBzZWxlY3RvcnMgY2FuIHJlYWQgdGhlbSk7IHBhcGVyU2l6ZS9tYXJnaW4gYXJlIGVtaXR0ZWQgYXNcbi8vIGEgcGVyLWRvY3VtZW50IGxpdGVyYWwgQHBhZ2UgcnVsZS4gZ3JpZExpbmVzIGlzIG5vdCBhIGNvbnRhaW5lciB2YXIgXHUyMDE0IGl0IGlzXG4vLyByZXNvbHZlZCBwZXIgcm93IGF0IHJlbmRlciB0aW1lIChzZWUgcmVuZGVyUm93KS5cbmV4cG9ydCBjb25zdCBQcmludENvbmZpZyA9IHoub2JqZWN0KHtcbiAgcGFwZXJTaXplOiB6LmVudW0oWydsZXR0ZXInLCAnYTQnXSkuZGVmYXVsdCgnbGV0dGVyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uczogei5udW1iZXIoKS5pbnQoKS5taW4oMSkubWF4KDMpLmRlZmF1bHQoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya1NwYWNlOiB6Lm51bWJlcigpLm1pbigwKS5kZWZhdWx0KDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkuZGVmYXVsdCgxMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvYmxlbVNwYWNpbmc6IHoubnVtYmVyKCkubWluKDApLmRlZmF1bHQoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiB6Lm51bWJlcigpLm1pbigwKS5kZWZhdWx0KDAuNSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmludFJlZmVyZW5jZVBhbmVsOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaW50RGVmaW5pdGlvbkdsb3NzYXJ5OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXI6IFByaW50SGVhZGVyLmRlZmF1bHQoe30pLFxufSk7XG5leHBvcnQgdHlwZSBQcmludENvbmZpZyA9IHouaW5mZXI8dHlwZW9mIFByaW50Q29uZmlnPjtcblxuLy8gVHlwb2dyYXBoeTogdGhlIGFjdGl2aXR5LXdpZGUgZm9udCArIGJhc2UgYm9keSBzaXplIChhdXRob3ItYXBwcm92ZWRcbi8vIDIwMjYtMDctMDgpLiBPTkUgZm9udCBhbmQgT05FIGJhc2Ugc2l6ZSBmb3IgdGhlIHdob2xlIGFjdGl2aXR5IFx1MjAxNCBwdWJsaXNoZWRcbi8vIHBhZ2UsIGVkaXRvciBjYW52YXMsIGFuZCBwcmludCB2aWV3IGFsbCByZWFkIHRoZSBzYW1lIGNvbmZpZyBzbyBhdXRob3JpbmcgaXNcbi8vIFdZU0lXWUcuIE9wdGlvbmFsIGFuZCBhZGRpdGl2ZTogZG9jdW1lbnRzIHN0b3JlZCBiZWZvcmUgdGhpcyBmaWVsZCBleGlzdGVkXG4vLyBwYXJzZSB1bmNoYW5nZWQgKG5vIHNjaGVtYVZlcnNpb24gYnVtcCksIGFuZCB0aGUgZWRpdG9yIG9taXRzIHRoZSBmaWVsZFxuLy8gZW50aXJlbHkgd2hpbGUgaXQgaG9sZHMgdGhlIGRlZmF1bHRzIHNvIHVudG91Y2hlZCBkb2N1bWVudHMgc3RheVxuLy8gc3RydWN0dXJhbGx5IGlkZW50aWNhbC5cbi8vXG4vLyAgIGZvbnQgICAgIFx1MjAxNCBhbiBpZCBpbnRvIHRoZSByZW5kZXJlcidzIEZPTlRfUkVHSVNUUlkgKHRoZSBDU1Mgc3BlY2lmaWNzIFx1MjAxNFxuLy8gICAgICAgICAgICAgIGZhbWlseSBuYW1lLCBmYWxsYmFjayBzdGFjaywgV09GRjIgZmlsZXMgXHUyMDE0IGxpdmUgcmVuZGVyZXItc2lkZTtcbi8vICAgICAgICAgICAgICB0aGUgc2NoZW1hIG9ubHkgY29uc3RyYWlucyB0aGUgbWVudSkuICdkZWZhdWx0JyA9IHRoZSBjdXJyZW50XG4vLyAgICAgICAgICAgICAgc3lzdGVtIHN0YWNrLCBubyBmb250IGRvd25sb2FkLiBUaGUgb3RoZXIgZm91ciBhcmUgU0lMIE9GTFxuLy8gICAgICAgICAgICAgIGZhY2VzIHNlbGYtaG9zdGVkIGFzIFdPRkYyIG9uIFIyIChubyBHb29nbGUgQ0ROIGRlcGVuZGVuY3kgb25cbi8vICAgICAgICAgICAgICBwdWJsaXNoZWQgcGFnZXMpLlxuLy8gICBmb250U2l6ZSBcdTIwMTQgYmFzZSBCT0RZIHNpemUgaW4gcHgsIGFwcGxpZWQgb24gc2NyZWVuIHZpYVxuLy8gICAgICAgICAgICAgIC0tYWN0aXZpdHktZm9udC1zaXplLiBQcmludCBib2R5IHNpemluZyBzdGF5cyBvd25lZCBieVxuLy8gICAgICAgICAgICAgIG1ldGEucHJpbnQuZm9udFNpemUgKHB0KSBcdTIwMTQgdGhlIEBtZWRpYSBwcmludCBydWxlIG92ZXJyaWRlcyB0aGVcbi8vICAgICAgICAgICAgICBzY3JlZW4gc2l6ZSwgc28gdGhlIHR3byBuZXZlciBmaWdodC4gSGVhZGluZ3MgYXJlIGVtLXJlbGF0aXZlXG4vLyAgICAgICAgICAgICAgYW5kIHNjYWxlIG9mZiB3aGljaGV2ZXIgYmFzZSBpcyBpbiBlZmZlY3QuXG4vL1xuLy8gUGVyLXNwYW4gZm9udC9zaXplIG1hcmtzIGFyZSBQQVJLRUQgYnV0IGRlc2lnbmVkIGZvcjogdGhpcyBhY3Rpdml0eS13aWRlXG4vLyBsYXllciBvbmx5IHNldHMgQ1NTIHZhcnMgKyBAZm9udC1mYWNlLCBzbyBhIGZ1dHVyZSBgdGV4dFN0eWxlYCBtYXJrIGNhblxuLy8gc2xvdCBpbiBhZGRpdGl2ZWx5IChzcGFuLWxldmVsIGlubGluZSBzdHlsZXMgd2luIHRoZSBjYXNjYWRlOyB0aGVcbi8vIHJlbmRlcmVyJ3MgZm9udEZhY2VDc3MgYWxyZWFkeSB0YWtlcyBhIExJU1Qgb2YgZmFtaWxpZXMgdG8gZW1iZWQpLlxuZXhwb3J0IGNvbnN0IEFjdGl2aXR5Rm9udCA9IHouZW51bShbXG4gICdkZWZhdWx0JyxcbiAgJ2xleGVuZCcsXG4gICdhdGtpbnNvbi1oeXBlcmxlZ2libGUnLFxuICAnYW5kaWthJyxcbiAgJ2NvbWljLW5ldWUnLFxuXSk7XG5leHBvcnQgdHlwZSBBY3Rpdml0eUZvbnQgPSB6LmluZmVyPHR5cGVvZiBBY3Rpdml0eUZvbnQ+O1xuXG5leHBvcnQgY29uc3QgVHlwb2dyYXBoeSA9IHoub2JqZWN0KHtcbiAgZm9udDogQWN0aXZpdHlGb250LmRlZmF1bHQoJ2RlZmF1bHQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogei5udW1iZXIoKS5taW4oMTIpLm1heCgyNCkuZGVmYXVsdCgxNiksXG59KTtcbmV4cG9ydCB0eXBlIFR5cG9ncmFwaHkgPSB6LmluZmVyPHR5cGVvZiBUeXBvZ3JhcGh5PjtcblxuZXhwb3J0IGNvbnN0IEFjdGl2aXR5TWV0YSA9IHoub2JqZWN0KHtcbiAgdGl0bGU6IHouc3RyaW5nKCkubWluKDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdXJzZTogei5zdHJpbmcoKS5kZWZhdWx0KCdBbGdlYnJhIElJJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pdDogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pc3Npb25Nb2RlOiB6LmVudW0oWydzaW5nbGUnLCAnbG9ja2VkJywgJ2ZyZWUnXSkuZGVmYXVsdCgnZnJlZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldmlzaW9uTW9kZTogei5lbnVtKFsnZnJlZScsICdsb2NrZWQnXSkuZGVmYXVsdCgnZnJlZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyYWRpbmdNb2RlOiB6LmVudW0oWydhdXRvJywgJ21hbnVhbCcsICdtaXhlZCddKS5kZWZhdWx0KCdhdXRvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZpdHlUeXBlOiB6LmVudW0oWyd3b3Jrc2hlZXQnLCAnZXhpdF90aWNrZXQnLCAnd2FybV91cCcsICdyZXZpZXcnXSkuZGVmYXVsdCgnd29ya3NoZWV0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyRmVlZGJhY2s6IHouZW51bShbJ2ltbWVkaWF0ZScsICdvbl9jaGVjayddKS5kZWZhdWx0KCdvbl9jaGVjaycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmludDogUHJpbnRDb25maWcuZGVmYXVsdCh7fSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwb2dyYXBoeTogVHlwb2dyYXBoeS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBBY3Rpdml0eU1ldGEgPSB6LmluZmVyPHR5cGVvZiBBY3Rpdml0eU1ldGE+O1xuXG4vLyBUaGUgdG9wLWxldmVsIGRvY3VtZW50LiBBbHdheXMgdmFsaWRhdGUgdXNlci1mYWNpbmcgaW5wdXQgdGhyb3VnaCB0aGlzXG4vLyBiZWZvcmUgc3RvcmluZy4gVGhlIEVkZ2UgRnVuY3Rpb25zIHBhcnNlIGluY29taW5nIGRyYWZ0cyB3aXRoIHRoaXMgc2NoZW1hXG4vLyBhbmQgcmVqZWN0IG1hbGZvcm1lZCBkb2N1bWVudHMgd2l0aCBhIDQwMC5cbi8vIFJlZmVyZW5jZVBhbmVsOiBvcHRpb25hbCBzdGlja3ktc2lkZWJhciBjb250ZW50IHN0dWRlbnRzIGNvbnN1bHQgd2hpbGVcbi8vIHdvcmtpbmcgXHUyMDE0IGZvcm11bGEgY2hhcnRzLCBwZXJpb2RpYyB0YWJsZXMsIHZvY2FidWxhcnkgbGlzdHMsIGNvbnZlcnNpb25cbi8vIHRhYmxlcywgdW5pdC1jaXJjbGUgZGlhZ3JhbXMsIHNlbnRlbmNlLXN0ZW0gcHJvbXB0cywgZm9yZWlnbi1sYW5ndWFnZVxuLy8gdmVyYiB0YWJsZXMsIHByaW1hcnktc291cmNlIGV4Y2VycHRzLCBtYXBzLiBUaGUgYmxvY2tzIGFycmF5IHVzZXMgdGhlXG4vLyBzYW1lIEJsb2NrIHNjaGVtYSBhcyBzZWN0aW9uIGNvbnRlbnQ7IG5vIG5ldyBibG9jayB0eXBlcyBhcmUgbmVlZGVkXG4vLyBmb3IgdGhlIHBhbmVsLlxuLy9cbi8vIFBoYXNlIDE6IHRoZSBzY2hlbWEgYWNjZXB0cyB0aGUgZmllbGQgYXMgZm9yd2FyZC1jb21wYXQ7IHRoZSBlZGl0b3Jcbi8vIGRvZXNuJ3Qgc3VyZmFjZSBpdCwgYW5kIHRoZSByZW5kZXJlciBpZ25vcmVzIGl0LiBQaGFzZSAyIHdpcmVzIHVwIHRoZVxuLy8gYXV0aG9yaW5nIFVJIGFuZCB0aGUgc2lkZWJhciBsYXlvdXQgaW4gcHVibGlzaGVkIEhUTUwuIEZpZWxkIGlzXG4vLyBvcHRpb25hbCB3aXRoIG5vIGRlZmF1bHQgb24gQWN0aXZpdHlEb2N1bWVudCwgc28gZXhpc3Rpbmcgc3RvcmVkXG4vLyBkb2N1bWVudHMgcGFyc2UgY2xlYW5seS5cbi8vXG4vLyBSZW5kZXJlciB3aWxsIHRyZWF0IHJlZmVyZW5jZSBjb250ZW50IGFzIGRhdGEtYmxvY2stY2F0ZWdvcnk9XCJzY2FmZm9sZFwiXG4vLyAoUGhhc2UgMispIFx1MjAxNCBkb2Vzbid0IGNvbnRyaWJ1dGUgdG8gc2NvcmluZyBvciBjaGVja3BvaW50IGJlaGF2aW9yLlxuZXhwb3J0IGNvbnN0IFJlZmVyZW5jZVBhbmVsID0gei5vYmplY3Qoe1xuICB0aXRsZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tzOiB6LmFycmF5KEJsb2NrKSxcbn0pO1xuZXhwb3J0IHR5cGUgUmVmZXJlbmNlUGFuZWwgPSB6LmluZmVyPHR5cGVvZiBSZWZlcmVuY2VQYW5lbD47XG5cbi8vIENhbGN1bGF0b3IgdG9vbDogYW4gYWN0aXZpdHktbGV2ZWwgc2NhZmZvbGQsIGEgc2libGluZyB0byB0aGUgcmVmZXJlbmNlXG4vLyBwYW5lbCBcdTIwMTQgYSB0ZWFjaGVyLWNvbmZpZ3VyYWJsZSBvbi1zY3JlZW4gY2FsY3VsYXRvciBhIHN0dWRlbnQgc3VtbW9ucyB3aGlsZVxuLy8gd29ya2luZyAobGlrZSB0aGUgY2FsY3VsYXRvciBhbGxvd2VkIG9uIGEgZGlnaXRhbCBTQVQpLiBJdCBpcyBORVZFUiBzY29yZWQsXG4vLyBwcm9kdWNlcyBubyBzdWJtaXNzaW9uLCBhbmQgY2FycmllcyBubyBhbnN3ZXIga2V5OyB0aGUgcmVuZGVyZXIgdHJlYXRzIGl0IGFzXG4vLyBkYXRhLWJsb2NrLWNhdGVnb3J5PVwic2NhZmZvbGRcIiAob3V0c2lkZSBhbnkgLmFjdGl2aXR5LXNlY3Rpb24sIHNvIHRoZSBzY29yaW5nXG4vLyBydW50aW1lIG5ldmVyIHNlZXMgaXQpLiBJdCB0cmF2ZWxzIGluIHRoZSB3aXJlIGZvcm1hdCwgY29uZmlndXJlZCBvbmNlIHBlclxuLy8gYWN0aXZpdHksIGFuZCBpcyBvcHRpb25hbCBzbyBleGlzdGluZyBzdG9yZWQgZG9jdW1lbnRzIHBhcnNlIHVuY2hhbmdlZCBcdTIwMTQgbm9cbi8vIHNjaGVtYVZlcnNpb24gYnVtcCAoc2FtZSBmb3J3YXJkLWNvbXBhdCBzdG9yeSBhcyByZWZlcmVuY2VQYW5lbC9wcmludCkuXG4vL1xuLy8gUmVzdHJpY3Rpb25zIGFyZSBQRVJNSVNTSVZFIGJ5IGRlZmF1bHQ6IGFuIGVuYWJsZWQtYnV0LXVuY29uZmlndXJlZFxuLy8gY2FsY3VsYXRvciBpcyBhIGZ1bGwgdG9vbDsgdGVhY2hlcnMgb3B0IElOVE8gcmVzdHJpY3Rpb25zLCBuZXZlciBvdXQgb2Zcbi8vIGNhcGFiaWxpdHkuIExhdGVyIGZsYWdzIChsb2NrVmlld3BvcnQsIGFsbG93ZWRSZWdyZXNzaW9uTW9kZWxzLFxuLy8gbWF4RXhwcmVzc2lvbnNcdTIwMjYpIGFyZSBhZGRlZCBhZGRpdGl2ZWx5IGFzIGdyYXBoaW5nLXRyYWNrIHN0YWdlcyBsYW5kIFx1MjAxNCBhbGxcbi8vIG9wdGlvbmFsL2RlZmF1bHRlZCwgc28gc3RpbGwgbm8gc2NoZW1hVmVyc2lvbiBidW1wLlxuLy9cbi8vIGBtb2RlYCBpcyB0aGUgY2FwYWJpbGl0eSBjZWlsaW5nLiBUaGUgZW51bSBjYXJyaWVzIHRoZSBmdWxsIGNvbnRyYWN0IG5vdywgYnV0XG4vLyB0aGUgZGVmYXVsdCBpcyAnc2NpZW50aWZpYycgYmVjYXVzZSB0aGF0IGlzIHRoZSBvbmx5IGNhcGFiaWxpdHkgU3RhZ2UgMVxuLy8gaW1wbGVtZW50cyBcdTIwMTQgYW4gZW5hYmxlZCBjYWxjdWxhdG9yIGRvZXMgZXhhY3RseSB3aGF0IGlzIGJ1aWx0LiBUaGUgZGVmYXVsdFxuLy8gbWF5IGZsaXAgdG8gJ2dyYXBoaW5nJyBvbmNlIHRoZSBib2FyZCBsYXllciBsYW5kcyAoU3RhZ2UgMikuXG4vLyBTdGFnZSAzOiB3aGljaCBmaXQgbW9kZWxzIHRoZSBncmFwaGluZyBjYWxjdWxhdG9yJ3MgZGF0YS9yZWdyZXNzaW9uIHBhbmVsXG4vLyBvZmZlcnMuIFBlcm1pc3NpdmUgZGVmYXVsdCAoYWxsIHRocmVlKTsgYW4gRU1QVFkgYXJyYXkgdHVybnMgcmVncmVzc2lvbiBvZmZcbi8vIGVudGlyZWx5IChubyBkYXRhIHBhbmVsKS4gT25seSBtZWFuaW5nZnVsIHVuZGVyIG1vZGUgJ2dyYXBoaW5nJyBcdTIwMTQgdGhlXG4vLyAnc2NpZW50aWZpYycgY2VpbGluZyBhbHJlYWR5IGV4Y2x1ZGVzIHRoZSBib2FyZCB0aGUgZml0cyBkcmF3IG9uLlxuLy8gJ2xvZ2FyaXRobWljJyBqb2luZWQgMjAyNi0wNy0xMSAoY2FsY3VsYXRvci1wYXJpdHkgYmF0Y2gpOiB0aGUga2l0IGNvbXB1dGVkXG4vLyBsb2cgZml0cyBhbGwgYWxvbmc7IHRoZSBlbnVtIHdhcyB0aGUgb25seSBnYXAuIE5PVEUgYSBzdG9yZWQgZG9jIHRoYXQgY2Fycmllc1xuLy8gdGhlIGV4cGxpY2l0IHRocmVlLW1vZGVsIGFycmF5IHN0YXlzIHRocmVlLW1vZGVsIChpbmRpc3Rpbmd1aXNoYWJsZSBmcm9tIGFcbi8vIGRlbGliZXJhdGUgcmVzdHJpY3Rpb24pIHVudGlsIHRoZSB0ZWFjaGVyIHRvdWNoZXMgdGhlIGNvbmZpZyBcdTIwMTQgYWNjZXB0ZWQgYXRcbi8vIHRoZSBkZXNpZ24gcGFzczsgdGhlIHBlcm1pc3NpdmUgZGVmYXVsdCBvbmx5IGFwcGxpZXMgd2hlbiB0aGUgZmllbGQgaXMgYWJzZW50LlxuZXhwb3J0IGNvbnN0IFJlZ3Jlc3Npb25Nb2RlbCA9IHouZW51bShbXG4gICdsaW5lYXInLFxuICAncXVhZHJhdGljJyxcbiAgJ2V4cG9uZW50aWFsJyxcbiAgJ2xvZ2FyaXRobWljJyxcbl0pO1xuZXhwb3J0IHR5cGUgUmVncmVzc2lvbk1vZGVsID0gei5pbmZlcjx0eXBlb2YgUmVncmVzc2lvbk1vZGVsPjtcblxuZXhwb3J0IGNvbnN0IENhbGN1bGF0b3JSZXN0cmljdGlvbnMgPSB6Lm9iamVjdCh7XG4gIG1vZGU6IHouZW51bShbJ3NjaWVudGlmaWMnLCAnZ3JhcGhpbmcnXSkuZGVmYXVsdCgnc2NpZW50aWZpYycpLFxuICBhbGxvd1RyaWc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gIGFsbG93TG9nRXhwOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAvLyBJbmVxdWFsaXR5IHJvd3MgaW4gdGhlIGdyYXBoaW5nIGV4cHJlc3Npb24gbGlzdCAoY2FsY3VsYXRvci1wYXJpdHkgYmF0Y2gpLlxuICAvLyBBZGRpdGl2ZSArIGRlZmF1bHRlZCBsaWtlIHRoZSBvdGhlciBnYXRlcyBcdTIwMTQgbm8gc2NoZW1hVmVyc2lvbiBidW1wOyB0aGUga2l0XG4gIC8vIHJlYWRzIGEgbWlzc2luZyB2YWx1ZSBhcyBwZXJtaXNzaXZlLCBzbyBvbGQgcHVibGlzaGVkIHBhZ2VzIHN0YXkgZnVsbC10b29sLlxuICBhbGxvd0luZXF1YWxpdGllczogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgYWxsb3dlZFJlZ3Jlc3Npb25Nb2RlbHM6IHpcbiAgICAuYXJyYXkoUmVncmVzc2lvbk1vZGVsKVxuICAgIC5kZWZhdWx0KFsnbGluZWFyJywgJ3F1YWRyYXRpYycsICdleHBvbmVudGlhbCcsICdsb2dhcml0aG1pYyddKSxcbiAgLy8gU3RhZ2UgNDogY2FwIG9uIHRoZSBncmFwaGluZyBleHByZXNzaW9uIGxpc3QuIEFCU0VOVCA9IHVubGltaXRlZCAodGhlXG4gIC8vIHBlcm1pc3NpdmUgZGVmYXVsdCBcdTIwMTQgb3B0aW9uYWwsIG5vdCBkZWZhdWx0ZWQsIHNvIGl0IHN0YXlzIG91dCBvZiBzdG9yZWRcbiAgLy8gZG9jcyB1bmxlc3MgYSB0ZWFjaGVyIHNldHMgaXQpLiBHcmFwaGluZyBtb2RlIG9ubHkuXG4gIG1heEV4cHJlc3Npb25zOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoNTApLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIENhbGN1bGF0b3JSZXN0cmljdGlvbnMgPSB6LmluZmVyPHR5cGVvZiBDYWxjdWxhdG9yUmVzdHJpY3Rpb25zPjtcblxuZXhwb3J0IGNvbnN0IENhbGN1bGF0b3JUb29sID0gei5vYmplY3Qoe1xuICBlbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgcmVzdHJpY3Rpb25zOiBDYWxjdWxhdG9yUmVzdHJpY3Rpb25zLmRlZmF1bHQoe30pLFxufSk7XG5leHBvcnQgdHlwZSBDYWxjdWxhdG9yVG9vbCA9IHouaW5mZXI8dHlwZW9mIENhbGN1bGF0b3JUb29sPjtcblxuLy8gVGhlIGV4cGxpY2l0IHR5cGUgKyB6LlpvZFR5cGUgYW5ub3RhdGlvbiAoaW5zdGVhZCBvZiB6LmluZmVyKSBleGlzdHMgYmVjYXVzZVxuLy8gdGhlIGZ1bGx5IGluZmVycmVkIGRvY3VtZW50IHR5cGUgb3V0Z3JldyB0c2MncyBkZWNsYXJhdGlvbi1zZXJpYWxpemF0aW9uXG4vLyBsaW1pdCAoVFM3MDU2KSB3aGVuIHRoZSBCbG9jayB1bmlvbiByZWFjaGVkIDE0IG1lbWJlcnMuIFN0cnVjdHVyYWxseVxuLy8gaWRlbnRpY2FsIHRvIHdoYXQgaW5mZXJlbmNlIHByb2R1Y2VkOyBub3RoaW5nIGhlcmUgbG9zZXMgdHlwZSBzYWZldHkgXHUyMDE0XG4vLyB0aGUgYW5ub3RhdGlvbiBpcyBjaGVja2VkIGFnYWluc3QgdGhlIG9iamVjdCBzY2hlbWEuXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2aXR5RG9jdW1lbnQge1xuICBzY2hlbWFWZXJzaW9uOiAyO1xuICBtZXRhOiBBY3Rpdml0eU1ldGE7XG4gIHNlY3Rpb25zOiBTZWN0aW9uW107XG4gIHJlZmVyZW5jZVBhbmVsPzogUmVmZXJlbmNlUGFuZWw7XG4gIGNhbGN1bGF0b3I/OiBDYWxjdWxhdG9yVG9vbDtcbn1cbmV4cG9ydCBjb25zdCBBY3Rpdml0eURvY3VtZW50OiB6LlpvZFR5cGU8QWN0aXZpdHlEb2N1bWVudCwgei5ab2RUeXBlRGVmLCB1bmtub3duPiA9XG4gIHoub2JqZWN0KHtcbiAgICBzY2hlbWFWZXJzaW9uOiB6LmxpdGVyYWwoMiksXG4gICAgbWV0YTogQWN0aXZpdHlNZXRhLFxuICAgIHNlY3Rpb25zOiB6LmFycmF5KFNlY3Rpb24pLFxuICAgIHJlZmVyZW5jZVBhbmVsOiBSZWZlcmVuY2VQYW5lbC5vcHRpb25hbCgpLFxuICAgIGNhbGN1bGF0b3I6IENhbGN1bGF0b3JUb29sLm9wdGlvbmFsKCksXG4gIH0pO1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyB1cGdyYWRlLnRzIFx1MjAxNCBzZXJ2ZXItc2lkZSB1cGdyYWRlLW9uLXJlYWQgKGNvbXBvbmVudHMtYXMtZGF0YSBydWxpbmcgNEEpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHJlYWQgQVBJIChTMikgdXBncmFkZXMgZXZlcnkgc3RvcmVkIGFjdGl2aXR5X3ZlcnNpb25zLmNvbnRlbnQgdG8gdGhlXG4vLyBDVVJSRU5UIHNjaGVtYSBiZWZvcmUgc2FuaXRpemluZyBhbmQgc2VydmluZyBpdCwgc28gdGhlIHZpZXdlciBvbmx5IGV2ZXJcbi8vIHNlZXMgdGhlIGxhdGVzdCBzaGFwZS4gVGhpcyBtb2R1bGUgaXMgdGhhdCBzZWFtLlxuLy9cbi8vIFRoZSBjaGFpbiBpcyBFTVBUWSB0b2RheSwgZGVsaWJlcmF0ZWx5OiBzY2hlbWFWZXJzaW9uIGlzIDIgYW5kIHRoZSAxXHUyMTkyMlxuLy8gcmVzaGFwZSB3YXMgYSBncmVlbmZpZWxkIGhhcmQtY3V0IHdpdGggbm8gbWlncmF0ZSBwYXRoIChkb2N1bWVudC50cyBoZWFkZXIgXHUyMDE0XG4vLyBhIHN0cmF5IHYxIGZhaWxzIGxvdWRseSByYXRoZXIgdGhhbiBtaXMtcGFyc2luZykuIFdoZW4gc2NoZW1hVmVyc2lvbiAzXG4vLyBsYW5kcywgaXRzIG1pZ3JhdGlvbiBpcyBvbmUgcHVyZSBlbnRyeSBpbiBVUEdSQURFUyBiZWxvdzsgc3RvcmVkIHJvd3Mgc3RheVxuLy8gYXQgdGhlaXIgb3JpZ2luYWwgdmVyc2lvbiBmb3JldmVyIGFuZCBhcmUgdXBncmFkZWQgb24gcmVhZCwgbmV2ZXIgbXV0YXRlZC5cbi8vXG4vLyBEaXN0aW5jdCBmcm9tIHRoZSB0d28gb3RoZXIgXCJ1cGdyYWRlXCIgbGF5ZXJzLCBvbiBwdXJwb3NlOlxuLy8gICAtIE1hcmsvZGVmaW5pdGlvbiBsZWdhY3kgcHJlcHJvY2Vzc2luZyAoaW5saW5lLnRzKSBydW5zIElOU0lERVxuLy8gICAgIEFjdGl2aXR5RG9jdW1lbnQucGFyc2UgXHUyMDE0IGFkZGl0aXZlIHNoYXBlIGRyaWZ0IHdpdGhpbiBvbmUgc2NoZW1hVmVyc2lvbi5cbi8vICAgLSBtaWdyYXRlU3VibWlzc2lvblJlc3BvbnNlcyAoc3VibWlzc2lvbi50cykgaXMgdGhlIFNVQk1JU1NJT04gd2lyZSdzXG4vLyAgICAgbGFkZGVyIFx1MjAxNCBhIGRpZmZlcmVudCBkb2N1bWVudCB3aXRoIGl0cyBvd24gdmVyc2lvbmluZy5cbi8vIFRoaXMgbW9kdWxlIG93bnMgb25seSB0aGUgdG9wLWxldmVsIEFjdGl2aXR5RG9jdW1lbnQgc2NoZW1hVmVyc2lvbi5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IEFjdGl2aXR5RG9jdW1lbnQgfSBmcm9tICcuL2RvY3VtZW50LmpzJztcblxuLyoqIFRoZSBzY2hlbWFWZXJzaW9uIHRoaXMgYnVpbGQgcGFyc2VzIGFuZCBzZXJ2ZXMuIEd1YXJkLXRlc3RlZCBhZ2FpbnN0IHRoZVxuICogQWN0aXZpdHlEb2N1bWVudCBsaXRlcmFsIHNvIHRoZSBjb25zdGFudCBjYW4ndCBkcmlmdCBmcm9tIHRoZSBwYXJzZXIuICovXG5leHBvcnQgY29uc3QgQUNUSVZJVFlfU0NIRU1BX1ZFUlNJT04gPSAyO1xuXG4vKiogVGhyb3duIHdoZW4gc3RvcmVkIGNvbnRlbnQgY2Fubm90IGJlIGJyb3VnaHQgdG8gdGhlIGN1cnJlbnQgc2NoZW1hLiBUaGVcbiAqIHJlYWQgQVBJIG1hcHMgdGhpcyB0byBhbiBleHBsaWNpdCBlcnJvciBzdGF0ZSAoZmFpbHVyZS1tb2RlcyB0YWJsZTogXCJ1cGdyYWRlXG4gKiBjaGFpbiBidWcgb24gb2xkIHZlcnNpb25cIiBcdTIxOTIgY2xlYXIgZXJyb3IsIG5ldmVyIGEgd2hpdGUgc2NyZWVuKS4gKi9cbmV4cG9ydCBjbGFzcyBVcGdyYWRlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAvKiogVGhlIHNjaGVtYVZlcnNpb24gdGhlIHN0b3JlZCBkb2N1bWVudCBjbGFpbWVkLCB3aGVuIHJlYWRhYmxlLiAqL1xuICAgIHJlYWRvbmx5IHN0b3JlZFZlcnNpb24/OiBudW1iZXIsXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9ICdVcGdyYWRlRXJyb3InO1xuICB9XG59XG5cbi8qKiBPbmUgc3RlcCBvZiB0aGUgY2hhaW46IGEgUFVSRSBqc29uIFx1MjE5MiBqc29uIHJld3JpdGUgZnJvbSBgZnJvbWAgdG8gYGZyb20rMWAuXG4gKiBObyBJL08sIG5vIHJhbmRvbW5lc3MsIG5vIERhdGUgXHUyMDE0IHVwZ3JhZGluZyB0aGUgc2FtZSBzdG9yZWQgcm93IHR3aWNlIG11c3RcbiAqIHlpZWxkIGlkZW50aWNhbCBvdXRwdXQgKHRoZSBwZXItdmVyc2lvbiByZWFkIGNhY2hlIGRlcGVuZHMgb24gaXQpLiAqL1xuaW50ZXJmYWNlIFVwZ3JhZGVTdGVwIHtcbiAgcmVhZG9ubHkgZnJvbTogbnVtYmVyO1xuICByZWFkb25seSBydW46IChyYXc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuLy8gVGhlIGNoYWluLiBBcHBlbmQtb25seTsgZWFjaCBlbnRyeSBidW1wcyBleGFjdGx5IG9uZSB2ZXJzaW9uLiBFbXB0eSB0b2RheSBcdTIwMTRcbi8vIHNlZSB0aGUgaGVhZGVyIGZvciB3aHkgdjEgZGVsaWJlcmF0ZWx5IGhhcyBubyBlbnRyeS5cbmNvbnN0IFVQR1JBREVTOiByZWFkb25seSBVcGdyYWRlU3RlcFtdID0gW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgVXBncmFkZVJlc3VsdCB7XG4gIC8qKiBUaGUgZG9jdW1lbnQsIHBhcnNlZCBhbmQgdmFsaWRhdGVkIGF0IHRoZSBDVVJSRU5UIHNjaGVtYS4gKi9cbiAgZG9jOiBBY3Rpdml0eURvY3VtZW50O1xuICAvKiogVGhlIHNjaGVtYVZlcnNpb24gdGhlIHN0b3JlZCBjb250ZW50IGFycml2ZWQgYXQgKD09PSBjdXJyZW50IHdoZW4gbm9cbiAgICogY2hhaW4gc3RlcCByYW4pLiBDYWxsZXJzIG1heSBsb2cgaXQ7IHRoZSBjYWNoZSBzdG9yZXMgdGhlIHRhcmdldC4gKi9cbiAgZnJvbVNjaGVtYVZlcnNpb246IG51bWJlcjtcbn1cblxuLyoqXG4gKiBCcmluZyByYXcgc3RvcmVkIGNvbnRlbnQgKGFjdGl2aXR5X3ZlcnNpb25zLmNvbnRlbnQpIHRvIHRoZSBjdXJyZW50IHNjaGVtYVxuICogYW5kIHZhbGlkYXRlIGl0LiBUaHJvd3MgVXBncmFkZUVycm9yIG9uIGFueSBjb250ZW50IHRoaXMgYnVpbGQgY2Fubm90IHNlcnZlXG4gKiBcdTIwMTQgYW4gdW5rbm93bi9mdXR1cmUgdmVyc2lvbiwgYSB2ZXJzaW9uIHdpdGggbm8gY2hhaW4gcGF0aCwgb3IgY29udGVudCB0aGF0XG4gKiBmYWlscyB2YWxpZGF0aW9uIGFmdGVyIHVwZ3JhZGluZy4gTmV2ZXIgcmV0dXJucyBhIHBhcnRpYWxseS11cGdyYWRlZCBkb2MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGdyYWRlQWN0aXZpdHlEb2N1bWVudChyYXc6IHVua25vd24pOiBVcGdyYWRlUmVzdWx0IHtcbiAgaWYgKHJhdyA9PT0gbnVsbCB8fCB0eXBlb2YgcmF3ICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHJhdykpIHtcbiAgICB0aHJvdyBuZXcgVXBncmFkZUVycm9yKCdTdG9yZWQgY29udGVudCBpcyBub3QgYW4gb2JqZWN0Jyk7XG4gIH1cbiAgY29uc3Qgc3RvcmVkID0gcmF3IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBjb25zdCB2ZXJzaW9uID0gc3RvcmVkLnNjaGVtYVZlcnNpb247XG4gIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIodmVyc2lvbikpIHtcbiAgICB0aHJvdyBuZXcgVXBncmFkZUVycm9yKCdTdG9yZWQgY29udGVudCBoYXMgbm8gaW50ZWdlciBzY2hlbWFWZXJzaW9uJyk7XG4gIH1cbiAgaWYgKHZlcnNpb24gPiBBQ1RJVklUWV9TQ0hFTUFfVkVSU0lPTikge1xuICAgIC8vIENvbnRlbnQgd3JpdHRlbiBieSBhIE5FV0VSIGJ1aWxkIHRoYW4gdGhpcyBvbmUgKGRlcGxveS1vcmRlciBzbGlwKS5cbiAgICB0aHJvdyBuZXcgVXBncmFkZUVycm9yKFxuICAgICAgYFN0b3JlZCBzY2hlbWFWZXJzaW9uICR7dmVyc2lvbn0gaXMgbmV3ZXIgdGhhbiB0aGlzIGJ1aWxkJ3MgYCArXG4gICAgICAgIGAke0FDVElWSVRZX1NDSEVNQV9WRVJTSU9OfSBcdTIwMTQgcmVmdXNpbmcgdG8gZ3Vlc3NgLFxuICAgICAgdmVyc2lvbixcbiAgICApO1xuICB9XG5cbiAgbGV0IGN1cnJlbnQgPSBzdG9yZWQ7XG4gIGxldCBhdCA9IHZlcnNpb247XG4gIHdoaWxlIChhdCA8IEFDVElWSVRZX1NDSEVNQV9WRVJTSU9OKSB7XG4gICAgY29uc3Qgc3RlcCA9IFVQR1JBREVTLmZpbmQoKHUpID0+IHUuZnJvbSA9PT0gYXQpO1xuICAgIGlmICghc3RlcCkge1xuICAgICAgLy8gdjEgbGFuZHMgaGVyZSBieSBkZXNpZ24gKGdyZWVuZmllbGQgaGFyZC1jdXQ6IG5vIG1pZ3JhdGUoMVx1MjE5MjIpKS5cbiAgICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoXG4gICAgICAgIGBObyB1cGdyYWRlIHBhdGggZnJvbSBzY2hlbWFWZXJzaW9uICR7YXR9IFx1MjAxNCBjYW5ub3Qgc2VydmVgLFxuICAgICAgICB2ZXJzaW9uLFxuICAgICAgKTtcbiAgICB9XG4gICAgY3VycmVudCA9IHN0ZXAucnVuKGN1cnJlbnQpO1xuICAgIGF0ICs9IDE7XG4gIH1cblxuICBjb25zdCBwYXJzZWQgPSBBY3Rpdml0eURvY3VtZW50LnNhZmVQYXJzZShjdXJyZW50KTtcbiAgaWYgKCFwYXJzZWQuc3VjY2Vzcykge1xuICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoXG4gICAgICBgQ29udGVudCBmYWlsZWQgdmFsaWRhdGlvbiBhdCBzY2hlbWFWZXJzaW9uICR7YXR9OiBgICtcbiAgICAgICAgcGFyc2VkLmVycm9yLmlzc3Vlc1xuICAgICAgICAgIC5zbGljZSgwLCAzKVxuICAgICAgICAgIC5tYXAoKGkpID0+IGAke2kucGF0aC5qb2luKCcuJyl9OiAke2kubWVzc2FnZX1gKVxuICAgICAgICAgIC5qb2luKCc7ICcpLFxuICAgICAgdmVyc2lvbixcbiAgICApO1xuICB9XG4gIHJldHVybiB7IGRvYzogcGFyc2VkLmRhdGEsIGZyb21TY2hlbWFWZXJzaW9uOiB2ZXJzaW9uIH07XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHN1Ym1pc3Npb24udHMgXHUyMDE0IFN1Ym1pc3Npb25SZXNwb25zZXMgc2NoZW1hXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHNoYXBlIG9mIHN1Ym1pc3Npb25zLnJlc3BvbnNlcyBqc29uYi4gS2V5ZWQgYnkgc3RhYmxlIGJsYW5rLmlkIGZyb21cbi8vIHRoZSBkb2N1bWVudCBzbyBwZXItYmxhbmsgYWdncmVnYXRpb24gcXVlcmllcyB3b3JrIGV2ZW4gd2hlbiBibG9ja3MgYXJlXG4vLyByZW9yZGVyZWQgYmV0d2VlbiBkb2N1bWVudCB2ZXJzaW9ucy5cbi8vXG4vLyBzY2hlbWFWZXJzaW9uIGhlcmUgaXMgaW5kZXBlbmRlbnQgb2YgQWN0aXZpdHlEb2N1bWVudC5zY2hlbWFWZXJzaW9uIFx1MjAxNFxuLy8gdGhleSBldm9sdmUgc2VwYXJhdGVseS4gV2hlbiB0aGlzIHNjaGVtYSBjaGFuZ2VzIChlLmcuLCBhZGRpbmcgcGFydGlhbC1cbi8vIGNyZWRpdCBzY29yaW5nKSwgYnVtcCBUSElTIHNjaGVtYVZlcnNpb24gYW5kIG1pZ3JhdGUgb24gcmVhZC5cbi8vXG4vLyBOb3RlOiBhdHRlbXB0X251bWJlciBsaXZlcyBvbiB0aGUgc3VibWlzc2lvbnMgdGFibGUgYXMgYSBjb2x1bW4sIG5vdCBpblxuLy8gdGhpcyBqc29uYi4gVGhlIEVkZ2UgRnVuY3Rpb24gZGVyaXZlcyBpdCBzZXJ2ZXItc2lkZSBmcm9tXG4vLyBtYXgoYXR0ZW1wdF9udW1iZXIpICsgMSBmb3IgdGhlIHN0dWRlbnQncyBpZGVudGl0eSwgYW5kIHN0b3JlcyBpdCBpblxuLy8gdGhlIGluZGV4ZWQgY29sdW1uLiBUaGUgY2xpZW50IG1heSBzZW5kIGEgdmFsdWUgZm9yIG9wdGltaXN0aWMgVUksIGJ1dFxuLy8gdGhlIHNlcnZlcidzIHZhbHVlIGlzIGNhbm9uaWNhbCBhbmQgdGhlIGpzb25iIGRvZXNuJ3QgZWNobyBpdC5cbi8vXG4vLyBNaWdyYXRpb24gaGlzdG9yeTpcbi8vICAgdjEgXHUyMTkyIHYyIChTdGFnZSA5YSk6IGFkZHMgb3B0aW9uYWwgY29uZmlkZW5jZSBwZXIgYmxhbmsgYW5kIG9wdGlvbmFsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgY2hlY2twb2ludFJlc3VsdHMuIHYxIHN1Ym1pc3Npb25zIG1pZ3JhdGUtb24tcmVhZFxuLy8gICAgICAgICAgICAgICAgICAgICAgIHRvIHYyIGJ5IHNldHRpbmcgc2NoZW1hVmVyc2lvbjogMiAob3RoZXIgZmllbGRzXG4vLyAgICAgICAgICAgICAgICAgICAgICAgYXJlIHVuY2hhbmdlZCBvciBvcHRpb25hbC1hbmQtYWJzZW50IGluIHYxKS5cbi8vICAgdjIgXHUyMTkyIHYzIChTdGFnZSA1LCBQaGFzZSAyLjcpOiBhZGRzIHRoZSBvcHRpb25hbCBncmFwaFJlc3BvbnNlcyBtYXAgZm9yXG4vLyAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJhY3RpdmUtZ3JhcGggYmxvY2tzLiB2MiBzdWJtaXNzaW9ucyBtaWdyYXRlLW9uLVxuLy8gICAgICAgICAgICAgICAgICAgICAgIHJlYWQgdG8gdjMgYnkgc2V0dGluZyBzY2hlbWFWZXJzaW9uOiAzIChncmFwaFJlc3BvbnNlc1xuLy8gICAgICAgICAgICAgICAgICAgICAgIHNpbXBseSBhYnNlbnQgXHUyMDE0IHZhbGlkIGZvciBhbiBvcHRpb25hbCBmaWVsZCkuXG4vLyAgIHY0IFx1MjE5MiB2NSAobXVsdGlwbGUgY2hvaWNlKTogYWRkcyB0aGUgb3B0aW9uYWwgYGNob2ljZXNgIG1hcCBmb3Jcbi8vICAgICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZV9jaG9pY2UgYmxvY2tzIChDaG9pY2VSZXNwb25zZTogc2VsZWN0ZWRcbi8vICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2UgaWRzICsgY29ycmVjdCArIGNvbmZpZGVuY2UpLiB2NCByb3dzIG1pZ3JhdGVcbi8vICAgICAgICAgICAgICAgICAgICAgICBvbiByZWFkIGJ5IHNldHRpbmcgc2NoZW1hVmVyc2lvbjogNS5cbi8vICAgdjUgXHUyMTkyIHY2IChtYXRjaGluZyArIG9yZGVyaW5nKTogYWRkcyB0aGUgb3B0aW9uYWwgYG1hdGNoZXNgIG1hcFxuLy8gICAgICAgICAgICAgICAgICAgICAgIChNYXRjaFJlc3BvbnNlOiBpdGVtXHUyMTkydGFyZ2V0IHBhaXJzICsgcGVyLXBhaXJcbi8vICAgICAgICAgICAgICAgICAgICAgICBlYXJuZWQvdG90YWwpIGFuZCBgb3JkZXJpbmdzYCBtYXAgKE9yZGVyUmVzcG9uc2U6XG4vLyAgICAgICAgICAgICAgICAgICAgICAgdGhlIGFycmFuZ2VkIGl0ZW0taWQgc2VxdWVuY2UsIGFsbC1vci1ub3RoaW5nKS5cbi8vICAgICAgICAgICAgICAgICAgICAgICB2NSByb3dzIG1pZ3JhdGUgb24gcmVhZCBieSBzZXR0aW5nIHNjaGVtYVZlcnNpb246IDYuXG4vLyAgIHY2IFx1MjE5MiB2NyAobnVtYmVyIGxpbmUpOiBhZGRzIHRoZSBvcHRpb25hbCBgbnVtYmVyTGluZVJlc3BvbnNlc2AgbWFwXG4vLyAgICAgICAgICAgICAgICAgICAgICAgKE51bWJlckxpbmVSZXNwb25zZTogcGxvdHRlZCAxLUQgcG9pbnRzLCBvciBhblxuLy8gICAgICAgICAgICAgICAgICAgICAgIGludGVydmFsL3JheSB3aXRoIG9wZW4vY2xvc2VkIGJvdW5kczsgYWxsLW9yLW5vdGhpbmcpLlxuLy8gICAgICAgICAgICAgICAgICAgICAgIHY2IHJvd3MgbWlncmF0ZSBvbiByZWFkIGJ5IHNldHRpbmcgc2NoZW1hVmVyc2lvbjogNy5cbi8vICAgdjcgXHUyMTkyIHY4IChkYXRhIHBsb3QpOiBhZGRzIHRoZSBvcHRpb25hbCBgZGF0YVBsb3RSZXNwb25zZXNgIG1hcFxuLy8gICAgICAgICAgICAgICAgICAgICAgIChEYXRhUGxvdFJlc3BvbnNlOiB0aGUgc3R1ZGVudCdzIGJ1aWx0IGNoYXJ0LCBlLmcuIHRoZVxuLy8gICAgICAgICAgICAgICAgICAgICAgIHBsb3R0ZWQgZG90LXBsb3QgdmFsdWVzOyBhbGwtb3Itbm90aGluZykuIGRpc3BsYXktbW9kZVxuLy8gICAgICAgICAgICAgICAgICAgICAgIGRhdGFfcGxvdHMgYXJlIHVuZ3JhZGVkIHN0aW11bGkgYW5kIG5ldmVyIGFwcGVhciBoZXJlLlxuLy8gICAgICAgICAgICAgICAgICAgICAgIHY3IHJvd3MgbWlncmF0ZSBvbiByZWFkIGJ5IHNldHRpbmcgc2NoZW1hVmVyc2lvbjogOC5cbi8vICAgdjggXHUyMTkyIHY5IChzZWxmLWV4cGxhbmF0aW9uKTogYWRkcyB0aGUgb3B0aW9uYWwgYGZyZWVSZXNwb25zZXNgIG1hcFxuLy8gICAgICAgICAgICAgICAgICAgICAgIChGcmVlUmVzcG9uc2U6IHVuZ3JhZGVkIGZyZWUgdGV4dCwganVzdCB7IHRleHQgfSkuIE5ldmVyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgc2NvcmVkLiB2OCByb3dzIG1pZ3JhdGUgb24gcmVhZCBieSBzZXR0aW5nXG4vLyAgICAgICAgICAgICAgICAgICAgICAgc2NoZW1hVmVyc2lvbjogOS5cbi8vXG4vLyBFeHRlbnNpb24gcGF0dGVybiBcdTIwMTQgYWRkaW5nIG5ldyByZXNwb25zZSBzaGFwZXMgKFBoYXNlIDIrKTpcbi8vICAgV2hlbiBhIG5ldyBxdWVzdGlvbiBjYXRlZ29yeSBuZWVkcyBhIGRpZmZlcmVudCByZXNwb25zZSBzaGFwZSBcdTIwMTQgTUNcbi8vICAgc2VsZWN0aW9ucywgb3JkZXJpbmcgYXJyYW5nZW1lbnRzLCBtYXRjaGluZyBwYWlycywgZ3JhcGggaW5wdXRzLCBmaWxlXG4vLyAgIHVwbG9hZHMsIGVzc2F5IHRleHQsIGFubm90YXRpb25zIFx1MjAxNCBpdCBnZXRzIGl0cyBvd24ga2V5ZWQtYnktdXVpZFxuLy8gICBvcHRpb25hbCBtYXAgb24gU3VibWlzc2lvblJlc3BvbnNlcywgc2libGluZyB0byBgYmxhbmtzYC4gRG9uJ3Qgd2lkZW5cbi8vICAgQmxhbmtSZXNwb25zZS5hbnN3ZXIgdG8gYSB1bmlvbiB3aXRoIG9iamVjdCB0eXBlczsgdGhhdCBmb3JjZXMgZXZlcnlcbi8vICAgY29uc3VtZXIgKHRlYWNoZXIgZGFzaGJvYXJkLCBmdXR1cmUgYW5hbHl0aWNzLCBwZXItYmxhbmsgYWdncmVnYXRpb25cbi8vICAgcXVlcmllcykgdG8gYWRkIHR5cGUgZ3VhcmRzIG9uIHdoYXQgc2hvdWxkIHJlbWFpbiBhIHV1aWQta2V5ZWQtc3RyaW5nXG4vLyAgIG1hcC4gVHlwZSBwdXJpdHkgYXQgdGhlIGNvbnN1bWVyIGJvdW5kYXJ5IGlzIHRoZSBnb2FsLlxuLy9cbi8vICAgUGxhbm5lZCBmdXR1cmUgbWFwcyAoZWFjaCBsYW5kcyB3aXRoIHRoZSBibG9jayB0eXBlIHRoYXQgbmVlZHMgaXQpOlxuLy8gICAgIGNob2ljZXMgICAgICAgICBcdTIwMTQgU0hJUFBFRCBhdCB2NSAobXVsdGlwbGUgY2hvaWNlLCBzaW5nbGUgKyBtdWx0aS1zZWxlY3QpXG4vLyAgICAgbWF0Y2hlcyAgICAgICAgIFx1MjAxNCBTSElQUEVEIGF0IHY2IChtYXRjaGluZyBwYWlycywgcGVyLXBhaXIgZWFybmVkL3RvdGFsKVxuLy8gICAgIG9yZGVyaW5ncyAgICAgICBcdTIwMTQgU0hJUFBFRCBhdCB2NiAob3JkZXJpbmcgLyBzZXF1ZW5jaW5nLCBhbGwtb3Itbm90aGluZylcbi8vICAgICBmcmVlUmVzcG9uc2VzICAgXHUyMDE0IFNISVBQRUQgYXQgdjkgKHNlbGYtZXhwbGFuYXRpb247IFBoYXNlIDIuNiBzaG9ydF9hbnN3ZXJcbi8vICAgICAgICAgICAgICAgICAgICAgICAvIGVzc2F5IHJldXNlIHRoZSBzYW1lIG1hcCwgbm8gZnVydGhlciB3aXJlIGJ1bXApXG4vLyAgICAgZ3JhcGhSZXNwb25zZXMgIFx1MjAxNCBQaGFzZSAyLjcgaW50ZXJhY3RpdmUgZ3JhcGhzXG4vLyAgICAgbnVtYmVyTGluZVJlc3BvbnNlcyBcdTIwMTQgUGhhc2UgMi43IG51bWJlci1saW5lIGJsb2NrcyAoMS1EKVxuLy8gICAgIGRhdGFQbG90UmVzcG9uc2VzIFx1MjAxNCBQaGFzZSAyLjcgZGF0YS1wbG90IGJsb2NrcyAoc3RhdHMgY2hhcnRzKVxuLy8gICAgIGZpbGVzICAgICAgICAgICBcdTIwMTQgUGhhc2UgMi44IGF1ZGlvIC8gdmlkZW8gLyBmaWxlIHVwbG9hZFxuLy8gICAgIGFubm90YXRpb25zICAgICBcdTIwMTQgUGhhc2UgMi45IGhpZ2hsaWdodCAvIGxhYmVsIC8gcmVnaW9uXG4vL1xuLy8gICBFYWNoIGFkZGl0aW9uIGlzIGFuIG9wdGlvbmFsIGZpZWxkIGF0IGEgc2NoZW1hVmVyc2lvbiBidW1wOyBvbGRlclxuLy8gICBzdWJtaXNzaW9ucyByZWFkIGZvcndhcmQgdGhyb3VnaCBtaWdyYXRlU3VibWlzc2lvblJlc3BvbnNlcywgd2hpY2hcbi8vICAgcmV0dXJucyB0aGUgY3VycmVudCBzaGFwZSB3aXRoIGFic2VudCBtYXBzIHNpbXBseSB1bmRlZmluZWQuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcblxuLy8gQ29uZmlkZW5jZSByYXRpbmcgY2FwdHVyZWQgYmVmb3JlIGEgc3R1ZGVudCBjaGVja3MgYSBzZWN0aW9uLiBPbmx5XG4vLyBwcmVzZW50IHdoZW4gdGhlIGJsYW5rJ3MgcGFyZW50IEZpbGxJbkJsYW5rQmxvY2sgaGFzIGhhc0NvbmZpZGVuY2VSYXRpbmdcbi8vID09PSB0cnVlLiBUaHJlZS1wb2ludCBzY2FsZSBjYXB0dXJlcyBtZXRhY29nbml0aXZlIGNhbGlicmF0aW9uIHdpdGhvdXRcbi8vIGJlaW5nIHNvIGdyYW51bGFyIHRoYXQgc3R1ZGVudHMgY2FuJ3QgZGVjaWRlLlxuZXhwb3J0IGNvbnN0IENvbmZpZGVuY2VMZXZlbCA9IHouZW51bShbJ3Vuc3VyZScsICd0aGlua19zbycsICdjZXJ0YWluJ10pO1xuZXhwb3J0IHR5cGUgQ29uZmlkZW5jZUxldmVsID0gei5pbmZlcjx0eXBlb2YgQ29uZmlkZW5jZUxldmVsPjtcblxuLy8gT25lIGJsYW5rJ3MgcmVzcG9uc2U6IHdoYXQgdGhlIHN0dWRlbnQgdHlwZWQsIHdoZXRoZXIgdGhlIHJ1bnRpbWUgc2NvcmVkXG4vLyBpdCBjb3JyZWN0LCBhbmQgb3B0aW9uYWxseSB0aGVpciBjb25maWRlbmNlIHJhdGluZy4gVGhlIGBjb3JyZWN0YCBib29sZWFuXG4vLyBpcyBjb21wdXRlZCBDTElFTlQtU0lERSBpbiB0aGUgcnVudGltZSBKUyBvZiB0aGUgcHVibGlzaGVkIEhUTUwgXHUyMDE0IHRoZVxuLy8gYW5zd2VyIGtleSBpcyBiYWtlZCBpbnRvIHRoZSBIVE1MLCBzbyB0aGlzIGlzIGNvbnZlbmllbmNlIGZvciB0aGVcbi8vIHRlYWNoZXIgdmlld2VyLCBub3QgYXV0aG9yaXRhdGl2ZSBncmFkaW5nLiAoU2VlIHRoZSBzZWN1cml0eSBjZWlsaW5nXG4vLyBkaXNjdXNzaW9uOiBQaGFzZSA1KyBtYXJrZXRwbGFjZSByZXF1aXJlcyBzZXJ2ZXItc2lkZSBncmFkaW5nLilcbmV4cG9ydCBjb25zdCBCbGFua1Jlc3BvbnNlID0gei5vYmplY3Qoe1xuICBhbnN3ZXI6IHouc3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQmxhbmtSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIEJsYW5rUmVzcG9uc2U+O1xuXG4vLyBPbmUgaW50ZXJhY3RpdmUtZ3JhcGggYmxvY2sncyByZXNwb25zZSAoUGhhc2UgMi43KS4gTWlycm9ycyB0aGUgYmxvY2snc1xuLy8gaW50ZXJhY3Rpb24gZGlzY3JpbWluYXRlZCB1bmlvbiBcdTIwMTQgZWFjaCB2YXJpYW50IGNhcnJpZXMgdGhlIHN0dWRlbnQnc1xuLy8gc3RydWN0dXJlZCBnZW9tZXRyaWMgaW5wdXQgcGx1cyB0aGUgc2FtZSBjb3JyZWN0bmVzcy9jb25maWRlbmNlIGZpZWxkc1xuLy8gYmxhbmtzIGhhdmUuIExpa2UgQmxhbmtSZXNwb25zZSwgYGNvcnJlY3RgIGlzIGNvbXB1dGVkIENMSUVOVC1TSURFIGluIHRoZVxuLy8gcHVibGlzaGVkIHBhZ2UncyBsYXp5LWxvYWRlZCBraXQgKHRoZSBhbnN3ZXIga2V5IGlzIGJha2VkIGludG8gdGhlIEhUTUwpIFx1MjAxNFxuLy8gY29udmVuaWVuY2UgZm9yIHRoZSB0ZWFjaGVyIHZpZXdlciwgbm90IGF1dGhvcml0YXRpdmUgZ3JhZGluZy4gS2VwdCBhXG4vLyBkaXNjcmltaW5hdGVkIHVuaW9uIHNvIHBsb3RfbGluZSAvIHNoYWRlX3JlZ2lvbiBhZGQgYSB2YXJpYW50IGhlcmUgd2l0aCBub1xuLy8gY2hhbmdlIHRvIGNvbnN1bWVycyB0aGF0IGJyYW5jaCBvbiBgdHlwZWAuIFNsaWNlIDEgKDIuN2EpIHNoaXBzIHBsb3RfcG9pbnQuXG5leHBvcnQgY29uc3QgUG9pbnRSZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X3BvaW50JyksXG4gIC8vIEV2ZXJ5IHBvaW50IHRoZSBzdHVkZW50IHBsb3R0ZWQsIGluIGdyYXBoIHVuaXRzLiBPcmRlciBmb2xsb3dzIHRoZSBibG9jaydzXG4gIC8vIGNvcnJlY3RQb2ludHMgZm9yIG11bHRpLXBvaW50IHF1ZXN0aW9uczsgYSBzaW5nbGUgcG9pbnQgaXMgdGhlIGNvbW1vbiBjYXNlLlxuICBzdHVkZW50UG9pbnRzOiB6LmFycmF5KHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgUG9pbnRSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIFBvaW50UmVzcG9uc2U+O1xuXG4vLyBwbG90X2Z1bmN0aW9uIChQaGFzZSAyLjcgMi43Yik6IHRoZSBzdHVkZW50IHBsYWNlZCBOIHBvaW50cyBkZWZpbmluZyBhIGN1cnZlLlxuLy8gV2Ugc3RvcmUgdGhlIHJhdyBwb2ludHMgKHVuaWZvcm0gd2l0aCBwbG90X3BvaW50KTsgdGhlIGZpdHRlZCBwYXJhbWV0ZXJzIGFyZVxuLy8gcmUtZGVyaXZhYmxlIGZyb20gdGhlbSB3aXRoIHRoZSBzYW1lIGVuZ2luZSB0aGF0IHNjb3JlZCBpdCwgc28gdGhlIGRhc2hib2FyZFxuLy8gY2FuIHNob3cgXCJzdHVkZW50J3MgbGluZVwiIHdpdGhvdXQgYSBzZWNvbmQgc3RvcmVkIHNoYXBlLlxuZXhwb3J0IGNvbnN0IEZ1bmN0aW9uUmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9mdW5jdGlvbicpLFxuICBzdHVkZW50UG9pbnRzOiB6LmFycmF5KHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgRnVuY3Rpb25SZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIEZ1bmN0aW9uUmVzcG9uc2U+O1xuXG4vLyBzaGFkZV9yZWdpb24gKDIuN2MpOiBzdHVkZW50UG9pbnRzIGFyZSB0aGUgcG9seWdvbidzIHZlcnRpY2VzIGluIG9yZGVyLlxuZXhwb3J0IGNvbnN0IFJlZ2lvblJlc3BvbnNlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3NoYWRlX3JlZ2lvbicpLFxuICBzdHVkZW50UG9pbnRzOiB6LmFycmF5KHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgUmVnaW9uUmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBSZWdpb25SZXNwb25zZT47XG5cbi8vIGdyYXBoX2luZXF1YWxpdHkgKERyb3AgNCk6IHRoZSBib3VuZGFyeSBoYW5kbGVzICsgdGhlIHR3byBncmFkZWQgY2hvaWNlcy5cbi8vIHNpZGUgbGVmdC9yaWdodCBhcHBlYXJzIHdpdGggdmVydGljYWwgYm91bmRhcmllczsgYWJvdmUvYmVsb3cgb3RoZXJ3aXNlLlxuZXhwb3J0IGNvbnN0IEluZXF1YWxpdHlSZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdncmFwaF9pbmVxdWFsaXR5JyksXG4gIHN0dWRlbnRQb2ludHM6IHouYXJyYXkoei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pKSxcbiAgc3RyaWN0OiB6LmJvb2xlYW4oKSxcbiAgc2lkZTogei5lbnVtKFsnYWJvdmUnLCAnYmVsb3cnLCAnbGVmdCcsICdyaWdodCddKSxcbiAgY29ycmVjdDogei5ib29sZWFuKCksXG4gIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBJbmVxdWFsaXR5UmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBJbmVxdWFsaXR5UmVzcG9uc2U+O1xuXG4vLyBwbG90X3JheSAvIHBsb3Rfc2VnbWVudCAoRHJvcCBDIFx1MjAxNCBmaXJzdC1jbGFzcyByYXlzL3NlZ21lbnRzKS4gc3R1ZGVudFBvaW50c1xuLy8gY2FycmllcyBbZnJvbSwgdGhyb3VnaF0gZm9yIGEgcmF5IGFuZCBbZW5kLCBlbmRdIGZvciBhIHNlZ21lbnQ7IHRoZSBlbmRwb2ludFxuLy8gc3R5bGUgY2hvaWNlcyByaWRlIGFsb25nc2lkZS4gdjQtb25seSBtZW1iZXJzOiBwYWdlcyB0aGF0IGVtaXQgdGhlbSBhcmVcbi8vIHB1Ymxpc2hlZCBBRlRFUiB0aGUgRHJvcCBDIGluZ2VzdCBkZXBsb3ksIGFuZCBhZGRpbmcgdW5pb24gbWVtYmVycyBBQ0NFUFRTXG4vLyBNT1JFIFx1MjAxNCBubyBzdG9yZWQgcm93IGlzIGludmFsaWRhdGVkIGFuZCBubyB2ZXJzaW9uIGJ1bXAgaXMgbmVlZGVkLlxuZXhwb3J0IGNvbnN0IFJheVJlc3BvbnNlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3RfcmF5JyksXG4gIHN0dWRlbnRQb2ludHM6IHouYXJyYXkoei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pKSxcbiAgLy8gVGhlIHN0dWRlbnQncyBjaG9zZW4gU0hBUEUgKHJheSBkaXJlY3Rpb24gLyBzZWdtZW50KSBcdTIwMTQgYSBncmFkZWQgcGFydCBvZlxuICAvLyB0aGUgYW5zd2VyIHNpbmNlIHRoZSBzaGFwZS10b2dnbGUgd2lkZ2V0OyBhYnNlbnQgPSBuZXZlciBjaG9zZW4gKG9yIGFcbiAgLy8gcHJlLXRvZ2dsZSBzdWJtaXNzaW9uKS4gT3B0aW9uYWwgKyBhZGRpdGl2ZSB3aXRoaW4gdjQuXG4gIHNoYXBlOiB6LmVudW0oWydyYXlfcG9zaXRpdmUnLCAncmF5X25lZ2F0aXZlJywgJ3NlZ21lbnQnXSkub3B0aW9uYWwoKSxcbiAgZnJvbVN0eWxlOiB6LmVudW0oWydvcGVuJywgJ2Nsb3NlZCddKSxcbiAgY29ycmVjdDogei5ib29sZWFuKCksXG4gIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBSYXlSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIFJheVJlc3BvbnNlPjtcblxuZXhwb3J0IGNvbnN0IFNlZ21lbnRSZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X3NlZ21lbnQnKSxcbiAgc3R1ZGVudFBvaW50czogei5hcnJheSh6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSkpLFxuICBzaGFwZTogei5lbnVtKFsncmF5X3Bvc2l0aXZlJywgJ3JheV9uZWdhdGl2ZScsICdzZWdtZW50J10pLm9wdGlvbmFsKCksXG4gIGVuZHBvaW50czogei50dXBsZShbei5lbnVtKFsnb3BlbicsICdjbG9zZWQnXSksIHouZW51bShbJ29wZW4nLCAnY2xvc2VkJ10pXSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgU2VnbWVudFJlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgU2VnbWVudFJlc3BvbnNlPjtcblxuLy8gZ3JhcGhfaW5lcXVhbGl0eV9zeXN0ZW0gKEdyYXBoIHN5c3RlbXMpOiB0aGUgc3R1ZGVudCdzIGFuc3dlciB0byBhIFNZU1RFTSBvZlxuLy8gaW5lcXVhbGl0aWVzIFx1MjAxNCBhIGdyYXBoX2luZXF1YWxpdHkgd2l0aCBpbmVxdWFsaXRpZXMubGVuZ3RoID4gMS4gYHBhcnRzYCBpcyBvbmVcbi8vIEluZXF1YWxpdHlSZXNwb25zZSBwZXIgYXV0aG9yZWQgYm91bmRhcnkgdGhlIHN0dWRlbnQgcGxvdHRlZCAoZWFjaCBjYXJyaWVzIGl0c1xuLy8gb3duIGJvdW5kYXJ5IHBvaW50cyArIHNpZGUgKyBzdHlsZSwgc28gbWl4ZWQgc3RyaWN0L2luY2x1c2l2ZSBib3VuZGFyaWVzIGFyZVxuLy8gcGVyLXBhcnQpLiBgY29ycmVjdGAgaXMgdGhlIG1hdGNoLWFsbCBBTkQgXHUyMDE0IGV2ZXJ5IGF1dGhvcmVkIGluZXF1YWxpdHkgcGFpcmVkLFxuLy8gb3JkZXItaW5kZXBlbmRlbnRseSwgd2l0aCBhIGRpc3RpbmN0IHN0dWRlbnQgcGFydDsgYGVhcm5lZGAvYHRvdGFsYCAodmlhXG4vLyBWNEV4dHJhcyBiZWxvdykgY2FycnkgcGVyLWluZXF1YWxpdHkgcGFydGlhbCBjcmVkaXQgKG1hdGNoZWQgLyBOKSB3aGVuIHRoZVxuLy8gYmxvY2sncyBwYXJ0aWFsQ3JlZGl0IGZsYWcgaXMgb24uIExpa2UgQmxhbmtSZXNwb25zZSwgYGNvcnJlY3RgIGlzIGNvbXB1dGVkXG4vLyBDTElFTlQtU0lERSBpbiB0aGUgcHVibGlzaGVkIHBhZ2UncyBsYXp5IGtpdCBcdTIwMTQgY29udmVuaWVuY2UgZm9yIHRoZSB0ZWFjaGVyXG4vLyB2aWV3ZXIsIG5vdCBhdXRob3JpdGF0aXZlIGdyYWRpbmcuIEEgTkVXIGFkZGl0aXZlIG1lbWJlcjogcGFnZXMgdGhhdCBlbWl0IGl0XG4vLyBhcmUgcHVibGlzaGVkIEFGVEVSIHRoZSBpbmdlc3QgcmVkZXBsb3ksIGFuZCB3aWRlbmluZyB0aGUgdW5pb24gb25seSBBQ0NFUFRTXG4vLyBNT1JFLCBzbyBubyBzdWJtaXNzaW9uLnNjaGVtYVZlcnNpb24gYnVtcCAodGhlIHBsb3RfcmF5IC8gcGxvdF9zZWdtZW50XG4vLyBwcmVjZWRlbnQpLiBOPTEgbmV2ZXIgZW1pdHMgdGhpcyBcdTIwMTQgdGhlIHJ1bnRpbWUga2VlcHMgdGhlIHBsYWluIHNpbmdsZVxuLy8gSW5lcXVhbGl0eVJlc3BvbnNlIGZvciBvbmUgYm91bmRhcnkgKGJ5dGUtaWRlbnRpY2FsIHRvIHRvZGF5KS5cbmV4cG9ydCBjb25zdCBTeXN0ZW1JbmVxdWFsaXR5UmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnZ3JhcGhfaW5lcXVhbGl0eV9zeXN0ZW0nKSxcbiAgLy8gT25lIHBlciBib3VuZGFyeTsgYXQgbGVhc3QgdHdvIGZvciBhIHJlYWwgc3lzdGVtLCBidXQgbWluKDEpIGtlZXBzIHRoZVxuICAvLyBzY29yZXIvcGFyc2UgdG90YWwgKGFuIHVuZGVyLWNvdW50IGNhbid0IG1hdGNoIGV2ZXJ5IGF1dGhvcmVkIGtleSBcdTIxOTIgd3JvbmcpLlxuICBwYXJ0czogei5hcnJheShJbmVxdWFsaXR5UmVzcG9uc2UpLm1pbigxKSxcbiAgY29ycmVjdDogei5ib29sZWFuKCksXG4gIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBTeXN0ZW1JbmVxdWFsaXR5UmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBTeXN0ZW1JbmVxdWFsaXR5UmVzcG9uc2U+O1xuXG4vLyBwbG90X2Z1bmN0aW9uX3N5c3RlbSAoR3JhcGggc3lzdGVtcyBQaGFzZSAyKTogdGhlIHN0dWRlbnQncyBhbnN3ZXIgdG8gYSBTWVNURU1cbi8vIG9mIGZ1bmN0aW9ucyBcdTIwMTQgYSBwbG90X2Z1bmN0aW9uIHdpdGggbW9kZWxzLmxlbmd0aCA+IDEgKFwiZ3JhcGggYm90aCBsaW5lc1wiKS5cbi8vIGBwYXJ0c2AgaXMgb25lIEZ1bmN0aW9uUmVzcG9uc2UgcGVyIGN1cnZlIHRoZSBzdHVkZW50IHBsb3R0ZWQgKGVhY2ggY2FycmllcyB0aGVcbi8vIHJhdyBwb2ludHMgdGhhdCBkZWZpbmUgdGhhdCBjdXJ2ZSkuIGBjb3JyZWN0YCBpcyB0aGUgbWF0Y2gtYWxsIEFORCBcdTIwMTQgZXZlcnlcbi8vIGF1dGhvcmVkIG1vZGVsIHBhaXJlZCwgb3JkZXItaW5kZXBlbmRlbnRseSwgd2l0aCBhIGRpc3RpbmN0IHN0dWRlbnQgY3VydmU7XG4vLyBgZWFybmVkYC9gdG90YWxgICh2aWEgVjRFeHRyYXMpIGNhcnJ5IHBlci1jdXJ2ZSBwYXJ0aWFsIGNyZWRpdCAobWF0Y2hlZCAvIE4pLlxuLy8gQWRkaXRpdmUgbWVtYmVyIFx1MjAxNCBzYW1lIHBsb3RfcmF5IC8gcGxvdF9zZWdtZW50IHByZWNlZGVudCwgbm8gc2NoZW1hVmVyc2lvblxuLy8gYnVtcC4gTj0xIG5ldmVyIGVtaXRzIHRoaXMgXHUyMDE0IHRoZSBydW50aW1lIGtlZXBzIHRoZSBwbGFpbiBzaW5nbGUgRnVuY3Rpb25SZXNwb25zZVxuLy8gZm9yIG9uZSBjdXJ2ZSAoYnl0ZS1pZGVudGljYWwgdG8gdG9kYXkpLlxuZXhwb3J0IGNvbnN0IFN5c3RlbUZ1bmN0aW9uUmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9mdW5jdGlvbl9zeXN0ZW0nKSxcbiAgLy8gT25lIHBlciBjdXJ2ZTsgbWluKDEpIGtlZXBzIHRoZSBwYXJzZSB0b3RhbCAoYW4gdW5kZXItY291bnQgY2FuJ3QgbWF0Y2hcbiAgLy8gZXZlcnkgYXV0aG9yZWQgbW9kZWwgXHUyMTkyIHdyb25nKS5cbiAgcGFydHM6IHouYXJyYXkoRnVuY3Rpb25SZXNwb25zZSkubWluKDEpLFxuICBjb3JyZWN0OiB6LmJvb2xlYW4oKSxcbiAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFN5c3RlbUZ1bmN0aW9uUmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBTeXN0ZW1GdW5jdGlvblJlc3BvbnNlPjtcblxuZXhwb3J0IGNvbnN0IEdyYXBoUmVzcG9uc2UgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgUG9pbnRSZXNwb25zZSxcbiAgRnVuY3Rpb25SZXNwb25zZSxcbiAgUmVnaW9uUmVzcG9uc2UsXG4gIEluZXF1YWxpdHlSZXNwb25zZSxcbl0pO1xuZXhwb3J0IHR5cGUgR3JhcGhSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIEdyYXBoUmVzcG9uc2U+O1xuXG4vLyB2NCBncmFwaCByZXNwb25zZXMgd2lkZW4gZXZlcnkgdmFyaWFudCB3aXRoIHRoZSBEcm9wIDQgb3B0aW9uYWxzOiBgbm9Tb2x1dGlvbmBcbi8vICh0aGUgc3R1ZGVudCBjaG9zZSBcImNhbm5vdCBiZSBncmFwaGVkXCI7IHN0dWRlbnRQb2ludHMgbWF5IGJlIGVtcHR5KSBhbmRcbi8vIGBlYXJuZWRgL2B0b3RhbGAgKHBlci1wYXJ0IHBhcnRpYWwgY3JlZGl0LCBwcmVzZW50IG9ubHkgd2hlbiB0aGUgYmxvY2snc1xuLy8gcGFydGlhbENyZWRpdCBmbGFnIGlzIG9uKS4gQXBwbGllZCBhcyBhbiBleHRlbnNpb24gb2YgZWFjaCB2YXJpYW50IHNvIHYzIHJvd3Ncbi8vIChubyBzdWNoIGZpZWxkcykgcmVtYWluIHZhbGlkIHY0IHJvd3MuXG5jb25zdCBWNEV4dHJhcyA9IHtcbiAgbm9Tb2x1dGlvbjogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgZWFybmVkOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkub3B0aW9uYWwoKSxcbiAgdG90YWw6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAvLyBEb21haW4tcmVzdHJpY3RlZCBwbG90X2Z1bmN0aW9uIChyYXlzL3NlZ21lbnRzKTogdGhlIHN0dWRlbnQncyBlbmRwb2ludFxuICAvLyBwb3NpdGlvbnMgKyBvcGVuL2Nsb3NlZCBjaG9pY2VzLiBPcHRpb25hbCBhbmQgYWRkaXRpdmUgd2l0aGluIHY0LlxuICBkb21haW46IHpcbiAgICAub2JqZWN0KHtcbiAgICAgIG1pblg6IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgICAgIG1pblN0eWxlOiB6LmVudW0oWydvcGVuJywgJ2Nsb3NlZCddKS5vcHRpb25hbCgpLFxuICAgICAgbWF4WDogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICAgICAgbWF4U3R5bGU6IHouZW51bShbJ29wZW4nLCAnY2xvc2VkJ10pLm9wdGlvbmFsKCksXG4gICAgfSlcbiAgICAub3B0aW9uYWwoKSxcbn07XG5leHBvcnQgY29uc3QgR3JhcGhSZXNwb25zZVY0ID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFBvaW50UmVzcG9uc2UuZXh0ZW5kKFY0RXh0cmFzKSxcbiAgRnVuY3Rpb25SZXNwb25zZS5leHRlbmQoVjRFeHRyYXMpLFxuICBSZWdpb25SZXNwb25zZS5leHRlbmQoVjRFeHRyYXMpLFxuICBJbmVxdWFsaXR5UmVzcG9uc2UuZXh0ZW5kKFY0RXh0cmFzKSxcbiAgUmF5UmVzcG9uc2UuZXh0ZW5kKFY0RXh0cmFzKSxcbiAgU2VnbWVudFJlc3BvbnNlLmV4dGVuZChWNEV4dHJhcyksXG4gIC8vIEdyYXBoIHN5c3RlbXM6IGFkZGl0aXZlIG1lbWJlcnMuIGVhcm5lZC90b3RhbCAoVjRFeHRyYXMpIGNhcnJ5IHRoZVxuICAvLyBwZXItb2JqZWN0IHBhcnRpYWwgY3JlZGl0OyBub1NvbHV0aW9uL2RvbWFpbiByaWRlIGFsb25nIGJ1dCBhcmUgdW51c2VkIGJ5IGFcbiAgLy8gc3lzdGVtIChrZXB0IGZvciB1bmlvbiB1bmlmb3JtaXR5LCBsaWtlIGV2ZXJ5IG90aGVyIG1lbWJlcikuXG4gIFN5c3RlbUluZXF1YWxpdHlSZXNwb25zZS5leHRlbmQoVjRFeHRyYXMpLFxuICBTeXN0ZW1GdW5jdGlvblJlc3BvbnNlLmV4dGVuZChWNEV4dHJhcyksXG5dKTtcbmV4cG9ydCB0eXBlIEdyYXBoUmVzcG9uc2VWNCA9IHouaW5mZXI8dHlwZW9mIEdyYXBoUmVzcG9uc2VWND47XG5cbi8vIFBlci1zZWN0aW9uIGNoZWNrcG9pbnQgcmVzdWx0LCBjYXB0dXJlZCB3aGVuIGEgc3R1ZGVudCBjbGlja3MgXCJDaGVjayB0aGlzXG4vLyBzZWN0aW9uXCIgaW4gbG9ja2VkL2ZyZWUgc3VibWlzc2lvbiBtb2Rlcy4gS2V5ZWQgYnkgc2VjdGlvbi5pZCBpbiB0aGVcbi8vIHBhcmVudCBTdWJtaXNzaW9uUmVzcG9uc2VzLmNoZWNrcG9pbnRSZXN1bHRzIG1hcC4gTm90IHByZXNlbnQgaW5cbi8vIHNpbmdsZS1tb2RlIHN1Ym1pc3Npb25zIG9yIGZvciBzZWN0aW9ucyB3aXRob3V0IGlzQ2hlY2twb2ludCA9IHRydWUuXG5leHBvcnQgY29uc3QgQ2hlY2twb2ludFJlc3VsdCA9IHoub2JqZWN0KHtcbiAgY2hlY2tlZEF0OiB6LnN0cmluZygpLmRhdGV0aW1lKCksICAgICAgICAgICAgICAgICAgLy8gSVNPIHRpbWVzdGFtcCBmcm9tIHJ1bnRpbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmU6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKSwgLy8gZnJhY3Rpb25hbCB1bmRlciBwYXJ0aWFsQ3JlZGl0ICh2NClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWw6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ2hlY2twb2ludFJlc3VsdCA9IHouaW5mZXI8dHlwZW9mIENoZWNrcG9pbnRSZXN1bHQ+O1xuXG4vLyAtLS0tIEJsYW5rLW1hcCBrZXkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGBibGFua3NgIG1hcCBpcyBrZXllZCBieSBCTEFOSyBpZCBcdTIwMTQgYnV0IHR3byBkaWZmZXJlbnQgaWQgc2hhcGVzIGxlZ2l0aW1hdGVseVxuLy8gbGFuZCBpbiBpdCwgYmVjYXVzZSBNb2RlbCBBIChpbi1lcXVhdGlvbiBtYXRoIGdhcHMpIGRlbGliZXJhdGVseSByZXVzZXMgdGhpcyBtYXBcbi8vIHJhdGhlciB0aGFuIGFkZGluZyBhIHdpcmUgc2hhcGU6XG4vL1xuLy8gICAxLiBCbGFua1Rva2VuLmlkICAgICAgXHUyMDE0IGEgdXVpZC5cbi8vICAgMi4gTWF0aFByb21wdC5pZCAgICAgIFx1MjAxNCAnZycgKyBhIGh5cGhlbi1zdHJpcHBlZCB1dWlkIChcImdjYWI2MmJcdTIwMjZmMDBlMGFcIikuXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PVCBhIHV1aWQsIGFuZCBjYW5ub3QgYmU6IHRoZSBpZCBpcyBlbWJlZGRlZCBpbiBhXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgIGBcXHBsYWNlaG9sZGVyW2lkXXt9YCBtYXJrZXIsIGFuZCBNYXRoTGl2ZSByZWplY3RzXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgIGh5cGhlbnMgdGhlcmUgKHNlZSBNYXRoUHJvbXB0IGluIGlubGluZS50cywgYW5kIHRoZVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICBtaW50aW5nIHNpdGUgaW4gYXBwL2xpYi9tYXJrZG93blRvVGlwdGFwLnRzKS5cbi8vXG4vLyBUaGUgcnVudGltZSByZWdpc3RlcnMgYm90aCBpbnRvIHRoZSBTQU1FIHJlZnMuYmxhbmtzIG1hcCBvbiBwdXJwb3NlIChzZWVcbi8vIHJ1bnRpbWUvaW5pdC50cyBcIk1hdGggcHJvbXB0cyAoTW9kZWwgQSlcIiksIHNvIHN1Ym1pdCBnYXRoZXJzIHRoZW0gdG9nZXRoZXIuXG4vL1xuLy8gUkVHUkVTU0lPTiBUSElTIEZJWEVTIChmb3VuZCAyMDI2LTA3LTI5IGJ5IHN1Ym1pdHRpbmcgYSByZWFsIHB1Ymxpc2hlZCBwYWdlKTpcbi8vIHRoaXMga2V5IHdhcyBgei5zdHJpbmcoKS51dWlkKClgLCBzbyBFVkVSWSBzdWJtaXNzaW9uIGZyb20gYW4gYWN0aXZpdHlcbi8vIGNvbnRhaW5pbmcgYSBtYXRoIGdhcCB3YXMgcmVqZWN0ZWQgYnkgaW5nZXN0LXN1Ym1pc3Npb24gd2l0aFxuLy8gYHJlc3BvbnNlcyBmYWlsZWQgc2NoZW1hIHZhbGlkYXRpb24gLyBJbnZhbGlkIHV1aWRgLiBNb2RlbCBBIHNoaXBwZWRcbi8vIDIwMjYtMDctMjIgYW5kIHdhcyBuZXZlciBzdWJtaXR0YWJsZSBcdTIwMTQgaXRzIHVuaXQgdGVzdHMgY292ZXJlZCB0aGUgZG9jdW1lbnRcbi8vIHNjaGVtYSBhbmQgdGhlIGNhcHR1cmUgYnJpZGdlLCBidXQgbm90aGluZyBjb25zdHJ1Y3RlZCBhIFN1Ym1pc3Npb25SZXNwb25zZXMsXG4vLyBzbyB0aGUgdHdvIGNvcnJlY3QgaGFsdmVzIG5ldmVyIG1ldC4gV2lkZW5pbmcgdGhlIEtFWSBpcyB0aGUgd2hvbGUgZml4OyB0aGVcbi8vIHZhbHVlIHNoYXBlIGlzIHVudG91Y2hlZC5cbmNvbnN0IEJMQU5LX0lEX0tFWSA9IHpcbiAgLnN0cmluZygpXG4gIC5yZWZpbmUoXG4gICAgKHMpID0+XG4gICAgICAvXlswLTlhLWZdezh9LVswLTlhLWZdezR9LVswLTlhLWZdezR9LVswLTlhLWZdezR9LVswLTlhLWZdezEyfSQvaS50ZXN0KHMpIHx8XG4gICAgICAvXmdbMC05YS1mXXszMn0kL2kudGVzdChzKSxcbiAgICB7IG1lc3NhZ2U6ICdCbGFuayBpZCBtdXN0IGJlIGEgdXVpZCBvciBhIG1hdGgtZ2FwIGlkIChnICsgMzIgaGV4KScgfSxcbiAgKTtcblxuLy8gLS0tLSB2MSAobGVnYWN5KSBzaGFwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFByZS1TdGFnZS05YSBzdWJtaXNzaW9ucy4gS2VwdCBzbyB3ZSBjYW4gcmVhZCBvbGQgcm93cyBmcm9tIHRoZSBkYXRhYmFzZVxuLy8gYW5kIG1pZ3JhdGUgdGhlbSBmb3J3YXJkIG9uIHJlYWQuIE5ldmVyIHdyaXR0ZW4gYnkgbmV3IGNvZGUuXG5leHBvcnQgY29uc3QgU3VibWlzc2lvblJlc3BvbnNlc1YxID0gei5vYmplY3Qoe1xuICBzY2hlbWFWZXJzaW9uOiB6LmxpdGVyYWwoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxhbmtzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgei5vYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiB6LnN0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbn0pO1xuZXhwb3J0IHR5cGUgU3VibWlzc2lvblJlc3BvbnNlc1YxID0gei5pbmZlcjx0eXBlb2YgU3VibWlzc2lvblJlc3BvbnNlc1YxPjtcblxuLy8gLS0tLSB2MiAobGVnYWN5KSBzaGFwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFByZS1TdGFnZS01IHN1Ym1pc3Npb25zLiBLZXB0IHNvIHdlIGNhbiByZWFkIG9sZCByb3dzIGFuZCBtaWdyYXRlIHRoZW1cbi8vIGZvcndhcmQgb24gcmVhZC4gTmV2ZXIgd3JpdHRlbiBieSBuZXcgY29kZS5cbmV4cG9ydCBjb25zdCBTdWJtaXNzaW9uUmVzcG9uc2VzVjIgPSB6Lm9iamVjdCh7XG4gIHNjaGVtYVZlcnNpb246IHoubGl0ZXJhbCgyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBibGFua3M6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBCbGFua1Jlc3BvbnNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja3BvaW50UmVzdWx0czogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIENoZWNrcG9pbnRSZXN1bHQpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFN1Ym1pc3Npb25SZXNwb25zZXNWMiA9IHouaW5mZXI8dHlwZW9mIFN1Ym1pc3Npb25SZXNwb25zZXNWMj47XG5cbi8vIC0tLS0gdjMgKGxlZ2FjeSkgc2hhcGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFByZS1Ecm9wLTQgc3VibWlzc2lvbnMgKGFuZCBwYWdlcyBwdWJsaXNoZWQgYmVmb3JlIHRoZSB2NCBydW50aW1lIHRoYXQgYXJlXG4vLyBzdGlsbCBsaXZlKS4gS2VwdCBzbyBpbmdlc3Qga2VlcHMgQUNDRVBUSU5HIHYzIHBvc3RzIGFuZCBzdG9yZWQgcm93cyBtaWdyYXRlXG4vLyBmb3J3YXJkIG9uIHJlYWQuIE5ldmVyIHdyaXR0ZW4gYnkgbmV3IGNvZGUuXG5leHBvcnQgY29uc3QgU3VibWlzc2lvblJlc3BvbnNlc1YzID0gei5vYmplY3Qoe1xuICBzY2hlbWFWZXJzaW9uOiB6LmxpdGVyYWwoMyksXG4gIGJsYW5rczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIEJsYW5rUmVzcG9uc2UpLFxuICBjaGVja3BvaW50UmVzdWx0czogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIENoZWNrcG9pbnRSZXN1bHQpLm9wdGlvbmFsKCksXG4gIGdyYXBoUmVzcG9uc2VzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgR3JhcGhSZXNwb25zZSkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgU3VibWlzc2lvblJlc3BvbnNlc1YzID0gei5pbmZlcjx0eXBlb2YgU3VibWlzc2lvblJlc3BvbnNlc1YzPjtcblxuLy8gLS0tLSB2NCAobGVnYWN5KSBzaGFwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHJlLW11bHRpcGxlLWNob2ljZSBzdWJtaXNzaW9ucyAoYW5kIHBhZ2VzIHB1Ymxpc2hlZCBiZWZvcmUgdGhlIHY1IHJ1bnRpbWVcbi8vIHRoYXQgYXJlIHN0aWxsIGxpdmUpLiBLZXB0IHNvIGluZ2VzdCBrZWVwcyBBQ0NFUFRJTkcgdjQgcG9zdHMgYW5kIHN0b3JlZCByb3dzXG4vLyBtaWdyYXRlIGZvcndhcmQgb24gcmVhZC4gTmV2ZXIgd3JpdHRlbiBieSBuZXcgY29kZS5cbmV4cG9ydCBjb25zdCBTdWJtaXNzaW9uUmVzcG9uc2VzVjQgPSB6Lm9iamVjdCh7XG4gIHNjaGVtYVZlcnNpb246IHoubGl0ZXJhbCg0KSxcbiAgYmxhbmtzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQmxhbmtSZXNwb25zZSksXG4gIGNoZWNrcG9pbnRSZXN1bHRzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQ2hlY2twb2ludFJlc3VsdCkub3B0aW9uYWwoKSxcbiAgZ3JhcGhSZXNwb25zZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBHcmFwaFJlc3BvbnNlVjQpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFN1Ym1pc3Npb25SZXNwb25zZXNWNCA9IHouaW5mZXI8dHlwZW9mIFN1Ym1pc3Npb25SZXNwb25zZXNWND47XG5cbi8vIE9uZSBtdWx0aXBsZV9jaG9pY2UgYmxvY2sncyByZXNwb25zZTogd2hpY2ggY2hvaWNlIGlkcyB0aGUgc3R1ZGVudCBzZWxlY3RlZFxuLy8gKG9uZSBmb3Igc2luZ2xlLXNlbGVjdCwgYW55IG51bWJlciBmb3IgbXVsdGktc2VsZWN0KSBwbHVzIHRoZSBzYW1lXG4vLyBjb3JyZWN0bmVzcy9jb25maWRlbmNlIGZpZWxkcyBibGFua3MgaGF2ZS4gTGlrZSBCbGFua1Jlc3BvbnNlLCBgY29ycmVjdGAgaXNcbi8vIGNvbXB1dGVkIENMSUVOVC1TSURFIGluIHRoZSBwdWJsaXNoZWQgcGFnZSdzIHJ1bnRpbWUgKHRoZSBhbnN3ZXIga2V5IGlzXG4vLyBiYWtlZCBpbnRvIHRoZSBIVE1MKSBcdTIwMTQgY29udmVuaWVuY2UgZm9yIHRoZSB0ZWFjaGVyIHZpZXdlciwgbm90IGF1dGhvcml0YXRpdmVcbi8vIGdyYWRpbmcuIEFsbC1vci1ub3RoaW5nOiBjb3JyZWN0IG1lYW5zIHRoZSBzZWxlY3RlZCBTRVQgZXF1YWxzIHRoZSBjb3JyZWN0XG4vLyBzZXQgKHBlci1jaG9pY2UgcGFydGlhbCBjcmVkaXQgaXMgYSBmdXR1cmUgYWRkaXRpdmUgZmllbGQsIG1pcnJvcmluZyB0aGVcbi8vIGdyYXBoIGJsb2NrJ3MgZWFybmVkL3RvdGFsIHByZWNlZGVudCkuXG5leHBvcnQgY29uc3QgQ2hvaWNlUmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIC8vIFNlbGVjdGVkIGNob2ljZSBpZHMgKE11bHRpcGxlQ2hvaWNlT3B0aW9uLmlkKSwgaW4gZG9jdW1lbnQgb3JkZXIuXG4gIC8vIE5vbi1lbXB0eTogYW4gdW5hbnN3ZXJlZCBibG9jayBpcyBzaW1wbHkgYWJzZW50IGZyb20gdGhlIG1hcCAoYW5cbiAgLy8gb21pc3Npb24pLCBsaWtlIGFuIHVuYW5zd2VyZWQgZ3JhcGguXG4gIHNlbGVjdGVkOiB6LmFycmF5KHouc3RyaW5nKCkudXVpZCgpKS5taW4oMSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ2hvaWNlUmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBDaG9pY2VSZXNwb25zZT47XG5cbi8vIC0tLS0gdjUgKGxlZ2FjeSkgc2hhcGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFByZS1tYXRjaGluZy9vcmRlcmluZyBzdWJtaXNzaW9ucyAoYW5kIHBhZ2VzIHB1Ymxpc2hlZCBiZWZvcmUgdGhlIHY2IHJ1bnRpbWVcbi8vIHRoYXQgYXJlIHN0aWxsIGxpdmUpLiBLZXB0IHNvIGluZ2VzdCBrZWVwcyBBQ0NFUFRJTkcgdjUgcG9zdHMgYW5kIHN0b3JlZCByb3dzXG4vLyBtaWdyYXRlIGZvcndhcmQgb24gcmVhZC4gTmV2ZXIgd3JpdHRlbiBieSBuZXcgY29kZS5cbmV4cG9ydCBjb25zdCBTdWJtaXNzaW9uUmVzcG9uc2VzVjUgPSB6Lm9iamVjdCh7XG4gIHNjaGVtYVZlcnNpb246IHoubGl0ZXJhbCg1KSxcbiAgYmxhbmtzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQmxhbmtSZXNwb25zZSksXG4gIGNoZWNrcG9pbnRSZXN1bHRzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQ2hlY2twb2ludFJlc3VsdCkub3B0aW9uYWwoKSxcbiAgZ3JhcGhSZXNwb25zZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBHcmFwaFJlc3BvbnNlVjQpLm9wdGlvbmFsKCksXG4gIGNob2ljZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBDaG9pY2VSZXNwb25zZSkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgU3VibWlzc2lvblJlc3BvbnNlc1Y1ID0gei5pbmZlcjx0eXBlb2YgU3VibWlzc2lvblJlc3BvbnNlc1Y1PjtcblxuLy8gT25lIG1hdGNoaW5nIGJsb2NrJ3MgcmVzcG9uc2U6IHdoaWNoIHRhcmdldCB0aGUgc3R1ZGVudCBkb2NrZWQgb24gZWFjaCBpdGVtLlxuLy8gTGlrZSBCbGFua1Jlc3BvbnNlLCBgY29ycmVjdGAgaXMgY29tcHV0ZWQgQ0xJRU5ULVNJREUgaW4gdGhlIHB1Ymxpc2hlZCBwYWdlJ3Ncbi8vIHJ1bnRpbWUgKHRoZSBhbnN3ZXIga2V5IGlzIGJha2VkIGludG8gdGhlIEhUTUwpIFx1MjAxNCBjb252ZW5pZW5jZSBmb3IgdGhlIHRlYWNoZXJcbi8vIHZpZXdlciwgbm90IGF1dGhvcml0YXRpdmUgZ3JhZGluZy4gU2NvcmVkIFBFUiBQQUlSOiBgZWFybmVkYCBvZiBgdG90YWxgIGl0ZW1zXG4vLyBjYXJyeSB0aGUga2V5ZWQgdGFyZ2V0IChgdG90YWxgID0gdGhlIGJsb2NrJ3MgaXRlbSBjb3VudCwgc28gYW4gdW5wYWlyZWQgaXRlbVxuLy8gd2l0aGluIGFuIGFuc3dlcmVkIGJsb2NrIHNjb3JlcyBhcyBhIHdyb25nIHBhaXIpOyBgY29ycmVjdGAgPSBlYXJuZWQgPT09IHRvdGFsLlxuZXhwb3J0IGNvbnN0IE1hdGNoUmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIC8vIGl0ZW0gaWQgXHUyMTkyIGRvY2tlZCB0YXJnZXQgaWQuIE5vbi1lbXB0eTogYSBibG9jayB3aXRoIG5vIHBhaXJzIG1hZGUgaXMgYW5cbiAgLy8gb21pc3Npb24gKGFic2VudCBmcm9tIHRoZSBtYXApLCBsaWtlIGFuIHVuYW5zd2VyZWQgZ3JhcGggb3IgTUMgYmxvY2suXG4gIHBhaXJzOiB6XG4gICAgLnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgei5zdHJpbmcoKS51dWlkKCkpXG4gICAgLnJlZmluZSgocGFpcnMpID0+IE9iamVjdC5rZXlzKHBhaXJzKS5sZW5ndGggPiAwLCB7XG4gICAgICBtZXNzYWdlOiAnYW4gYW5zd2VyZWQgbWF0Y2hpbmcgYmxvY2sgaGFzIGF0IGxlYXN0IG9uZSBwYWlyJyxcbiAgICB9KSxcbiAgY29ycmVjdDogei5ib29sZWFuKCksXG4gIGVhcm5lZDogei5udW1iZXIoKS5pbnQoKS5ub25uZWdhdGl2ZSgpLFxuICB0b3RhbDogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgTWF0Y2hSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIE1hdGNoUmVzcG9uc2U+O1xuXG4vLyBPbmUgb3JkZXJpbmcgYmxvY2sncyByZXNwb25zZTogdGhlIHN0dWRlbnQncyBmdWxsIGFycmFuZ2VtZW50IChldmVyeSBpdGVtIGlkLFxuLy8gaW4gdGhlaXIgY2hvc2VuIHNlcXVlbmNlKS4gQWxsLW9yLW5vdGhpbmc6IGBjb3JyZWN0YCA9IHRoZSBzZXF1ZW5jZSBlcXVhbHNcbi8vIHRoZSBhdXRob3JlZCBvcmRlciBleGFjdGx5LiBBbiB1bnRvdWNoZWQgKHN0aWxsLXNodWZmbGVkKSBsaXN0IGlzIGFuXG4vLyBvbWlzc2lvbiBcdTIwMTQgdGhlIHJ1bnRpbWUgb25seSByZWNvcmRzIGEgcmVzcG9uc2Ugb25jZSB0aGUgc3R1ZGVudCBoYXMgbW92ZWRcbi8vIHNvbWV0aGluZy5cbmV4cG9ydCBjb25zdCBPcmRlclJlc3BvbnNlID0gei5vYmplY3Qoe1xuICBvcmRlcjogei5hcnJheSh6LnN0cmluZygpLnV1aWQoKSkubWluKDIpLFxuICBjb3JyZWN0OiB6LmJvb2xlYW4oKSxcbiAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE9yZGVyUmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBPcmRlclJlc3BvbnNlPjtcblxuLy8gT25lIG51bWJlcl9saW5lIGJsb2NrJ3MgcmVzcG9uc2UgKDEtRCkuIExpa2UgQmxhbmtSZXNwb25zZSwgYGNvcnJlY3RgIGlzXG4vLyBjb21wdXRlZCBDTElFTlQtU0lERSBpbiB0aGUgcHVibGlzaGVkIHBhZ2UncyBsYXp5IGtpdCAodGhlIGFuc3dlciBrZXkgaXMgYmFrZWRcbi8vIGludG8gdGhlIEhUTUwpIFx1MjAxNCBjb252ZW5pZW5jZSBmb3IgdGhlIHRlYWNoZXIgdmlld2VyLCBub3QgYXV0aG9yaXRhdGl2ZVxuLy8gZ3JhZGluZy4gRGlzY3JpbWluYXRlZCBvbiBgdHlwZWAgc28gcGxvdF9yYXkgLyBkaXNwbGF5IGFkZCBhIHZhcmlhbnQgaGVyZSB3aXRoXG4vLyBubyBjb25zdW1lciBjaGFuZ2UuIFNsaWNlIDEgc2hpcHMgcGxvdF9wb2ludCArIHBsb3RfaW50ZXJ2YWwuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZVBvaW50UmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9wb2ludCcpLFxuICAvLyBFdmVyeSBwb3NpdGlvbiB0aGUgc3R1ZGVudCBwbG90dGVkLCBpbiBsaW5lIHVuaXRzLiBPcmRlciBmb2xsb3dzIHRoZSBibG9jaydzXG4gIC8vIGNvcnJlY3RQb2ludHMgZm9yIG11bHRpLXBvaW50IHF1ZXN0aW9uczsgYSBzaW5nbGUgcG9pbnQgaXMgdGhlIGNvbW1vbiBjYXNlLlxuICBzdHVkZW50UG9pbnRzOiB6LmFycmF5KHoubnVtYmVyKCkpLFxuICBjb3JyZWN0OiB6LmJvb2xlYW4oKSxcbiAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVQb2ludFJlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgTnVtYmVyTGluZVBvaW50UmVzcG9uc2U+O1xuXG4vLyBwbG90X2ludGVydmFsOiB0aGUgc3R1ZGVudCdzIGludGVydmFsL3JheSBcdTIwMTQgcHJlc2VudCBib3VuZHMgKyBvcGVuL2Nsb3NlZFxuLy8gc3R5bGVzLCBzYW1lIHNoYXBlIGFzIHRoZSBibG9jaydzIGNvcnJlY3RJbnRlcnZhbC4gQW4gYWJzZW50IGJvdW5kIGlzIGFuXG4vLyB1bmJvdW5kZWQgKHJheSkgZW5kLlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVJbnRlcnZhbFJlc3BvbnNlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3RfaW50ZXJ2YWwnKSxcbiAgbWluOiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIG1pblN0eWxlOiB6LmVudW0oWydvcGVuJywgJ2Nsb3NlZCddKS5vcHRpb25hbCgpLFxuICBtYXg6IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgbWF4U3R5bGU6IHouZW51bShbJ29wZW4nLCAnY2xvc2VkJ10pLm9wdGlvbmFsKCksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZUludGVydmFsUmVzcG9uc2UgPSB6LmluZmVyPFxuICB0eXBlb2YgTnVtYmVyTGluZUludGVydmFsUmVzcG9uc2Vcbj47XG5cbmV4cG9ydCBjb25zdCBOdW1iZXJMaW5lUmVzcG9uc2UgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgTnVtYmVyTGluZVBvaW50UmVzcG9uc2UsXG4gIE51bWJlckxpbmVJbnRlcnZhbFJlc3BvbnNlLFxuXSk7XG5leHBvcnQgdHlwZSBOdW1iZXJMaW5lUmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBOdW1iZXJMaW5lUmVzcG9uc2U+O1xuXG4vLyBPbmUgZGF0YV9wbG90IGJsb2NrJ3MgcmVzcG9uc2UuIExpa2UgQmxhbmtSZXNwb25zZSwgYGNvcnJlY3RgIGlzIGNvbXB1dGVkXG4vLyBDTElFTlQtU0lERSBpbiB0aGUgcHVibGlzaGVkIHBhZ2UncyBsYXp5IGtpdCAodGhlIGFuc3dlciBrZXkgXHUyMDE0IHRoZSBmcmVxdWVuY3lcbi8vIGRpc3RyaWJ1dGlvbiBvZiB0aGUgYmxvY2sncyBkYXRhc2V0IFx1MjAxNCBpcyBkZXJpdmVkIGluIHRoZSBIVE1MKSBcdTIwMTQgY29udmVuaWVuY2Vcbi8vIGZvciB0aGUgdGVhY2hlciB2aWV3ZXIsIG5vdCBhdXRob3JpdGF0aXZlIGdyYWRpbmcuIERpc2NyaW1pbmF0ZWQgb24gYHR5cGVgXG4vLyBzbyBidWlsZF9oaXN0b2dyYW0gLyBidWlsZF9ib3hwbG90IGFkZCBhIHZhcmlhbnQgaGVyZSB3aXRoIG5vIGNvbnN1bWVyXG4vLyBjaGFuZ2UuIFNsaWNlIDEgc2hpcHMgYnVpbGRfZG90cGxvdDsgYGRpc3BsYXlgIGRhdGFfcGxvdHMgYXJlIHVuZ3JhZGVkXG4vLyBzdGltdWxpIGFuZCBuZXZlciBwcm9kdWNlIGEgcmVzcG9uc2UuXG5leHBvcnQgY29uc3QgRGF0YVBsb3REb3RwbG90UmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnYnVpbGRfZG90cGxvdCcpLFxuICAvLyBFdmVyeSBkb3QgdGhlIHN0dWRlbnQgcGxhY2VkLCBhcyBpdHMgdmFsdWUgb24gdGhlIGF4aXMgKGEgbXVsdGlzZXQgXHUyMDE0IHRoZVxuICAvLyBmcmVxdWVuY3kgbWFwIGRlcml2ZXMgZnJvbSBjb3VudGluZykuIE5vbi1lbXB0eTogYSBibG9jayB3aXRoIG5vIGRvdHMgaXMgYW5cbiAgLy8gb21pc3Npb24gKGFic2VudCBmcm9tIHRoZSBtYXApLCBsaWtlIGFuIHVuYW5zd2VyZWQgZ3JhcGggb3IgbnVtYmVyIGxpbmUuXG4gIHN0dWRlbnRWYWx1ZXM6IHouYXJyYXkoei5udW1iZXIoKSkubWluKDEpLFxuICBjb3JyZWN0OiB6LmJvb2xlYW4oKSxcbiAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIERhdGFQbG90RG90cGxvdFJlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3REb3RwbG90UmVzcG9uc2U+O1xuXG4vLyBidWlsZF9oaXN0b2dyYW06IHRoZSBzdHVkZW50J3MgcGVyLWJpbiBmcmVxdWVuY2llcywgaW4gYmluIG9yZGVyIChsZWZ0XHUyMTkycmlnaHQpLlxuLy8gTm9uLWVtcHR5OyBhbiB1bnRvdWNoZWQgaGlzdG9ncmFtIGlzIGFuIG9taXNzaW9uIChhYnNlbnQgZnJvbSB0aGUgbWFwKS5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdEhpc3RvZ3JhbVJlc3BvbnNlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2J1aWxkX2hpc3RvZ3JhbScpLFxuICBzdHVkZW50Qmluczogei5hcnJheSh6Lm51bWJlcigpKS5taW4oMSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RIaXN0b2dyYW1SZXNwb25zZSA9IHouaW5mZXI8XG4gIHR5cGVvZiBEYXRhUGxvdEhpc3RvZ3JhbVJlc3BvbnNlXG4+O1xuXG4vLyBidWlsZF9ib3hwbG90OiB0aGUgc3R1ZGVudCdzIHBsYWNlZCBmaXZlLW51bWJlciBzdW1tYXJ5IChsaW5lIHVuaXRzKS5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdEJveHBsb3RSZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdidWlsZF9ib3hwbG90JyksXG4gIHN0dWRlbnRGaXZlOiB6Lm9iamVjdCh7XG4gICAgbWluOiB6Lm51bWJlcigpLFxuICAgIHExOiB6Lm51bWJlcigpLFxuICAgIG1lZGlhbjogei5udW1iZXIoKSxcbiAgICBxMzogei5udW1iZXIoKSxcbiAgICBtYXg6IHoubnVtYmVyKCksXG4gIH0pLFxuICBjb3JyZWN0OiB6LmJvb2xlYW4oKSxcbiAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIERhdGFQbG90Qm94cGxvdFJlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3RCb3hwbG90UmVzcG9uc2U+O1xuXG4vLyBUaGUgdGhyZWUgYnVpbGQgdmFyaWFudHMgYXJlIGFkZGl0aXZlIG1lbWJlcnM6IHdpZGVuaW5nIHRoZSB1bmlvbiBvbmx5IEFDQ0VQVFNcbi8vIE1PUkUsIHNvIHBhZ2VzIHRoYXQgZW1pdCBoaXN0b2dyYW0vYm94IHJlc3BvbnNlcyAocHVibGlzaGVkIGFmdGVyIHRoZSBpbmdlc3Rcbi8vIHRoYXQgY2FycmllcyB0aGlzIHdpZGVuZWQgdW5pb24pIG5lZWQgbm8gd2lyZS1mb3JtYXQgYnVtcCBcdTIwMTQgdGhlIHNhbWUgZGlzY2lwbGluZVxuLy8gdGhlIGdyYXBoIGJsb2NrJ3MgcGxvdF9yYXkvcGxvdF9zZWdtZW50IHVzZWQgd2l0aGluIHY0LiBBIGJ1aWxkX2RvdHBsb3Qtb25seVxuLy8gcGFnZSBrZWVwcyB2YWxpZGF0aW5nLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90UmVzcG9uc2UgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgRGF0YVBsb3REb3RwbG90UmVzcG9uc2UsXG4gIERhdGFQbG90SGlzdG9ncmFtUmVzcG9uc2UsXG4gIERhdGFQbG90Qm94cGxvdFJlc3BvbnNlLFxuXSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdFJlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3RSZXNwb25zZT47XG5cbi8vIC0tLS0gdjYgKGxlZ2FjeSkgc2hhcGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFByZS1udW1iZXItbGluZSBzdWJtaXNzaW9ucyAoYW5kIHBhZ2VzIHB1Ymxpc2hlZCBiZWZvcmUgdGhlIHY3IHJ1bnRpbWUgdGhhdFxuLy8gYXJlIHN0aWxsIGxpdmUpLiBLZXB0IHNvIGluZ2VzdCBrZWVwcyBBQ0NFUFRJTkcgdjYgcG9zdHMgYW5kIHN0b3JlZCByb3dzXG4vLyBtaWdyYXRlIGZvcndhcmQgb24gcmVhZC4gTmV2ZXIgd3JpdHRlbiBieSBuZXcgY29kZS5cbmV4cG9ydCBjb25zdCBTdWJtaXNzaW9uUmVzcG9uc2VzVjYgPSB6Lm9iamVjdCh7XG4gIHNjaGVtYVZlcnNpb246IHoubGl0ZXJhbCg2KSxcbiAgYmxhbmtzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQmxhbmtSZXNwb25zZSksXG4gIGNoZWNrcG9pbnRSZXN1bHRzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQ2hlY2twb2ludFJlc3VsdCkub3B0aW9uYWwoKSxcbiAgZ3JhcGhSZXNwb25zZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBHcmFwaFJlc3BvbnNlVjQpLm9wdGlvbmFsKCksXG4gIGNob2ljZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBDaG9pY2VSZXNwb25zZSkub3B0aW9uYWwoKSxcbiAgbWF0Y2hlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIE1hdGNoUmVzcG9uc2UpLm9wdGlvbmFsKCksXG4gIG9yZGVyaW5nczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIE9yZGVyUmVzcG9uc2UpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFN1Ym1pc3Npb25SZXNwb25zZXNWNiA9IHouaW5mZXI8dHlwZW9mIFN1Ym1pc3Npb25SZXNwb25zZXNWNj47XG5cbi8vIC0tLS0gdjcgKGxlZ2FjeSkgc2hhcGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFByZS1kYXRhLXBsb3Qgc3VibWlzc2lvbnMgKGFuZCBwYWdlcyBwdWJsaXNoZWQgYmVmb3JlIHRoZSB2OCBydW50aW1lIHRoYXQgYXJlXG4vLyBzdGlsbCBsaXZlKS4gS2VwdCBzbyBpbmdlc3Qga2VlcHMgQUNDRVBUSU5HIHY3IHBvc3RzIGFuZCBzdG9yZWQgcm93cyBtaWdyYXRlXG4vLyBmb3J3YXJkIG9uIHJlYWQuIE5ldmVyIHdyaXR0ZW4gYnkgbmV3IGNvZGUuXG5leHBvcnQgY29uc3QgU3VibWlzc2lvblJlc3BvbnNlc1Y3ID0gei5vYmplY3Qoe1xuICBzY2hlbWFWZXJzaW9uOiB6LmxpdGVyYWwoNyksXG4gIGJsYW5rczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIEJsYW5rUmVzcG9uc2UpLFxuICBjaGVja3BvaW50UmVzdWx0czogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIENoZWNrcG9pbnRSZXN1bHQpLm9wdGlvbmFsKCksXG4gIGdyYXBoUmVzcG9uc2VzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgR3JhcGhSZXNwb25zZVY0KS5vcHRpb25hbCgpLFxuICBjaG9pY2VzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQ2hvaWNlUmVzcG9uc2UpLm9wdGlvbmFsKCksXG4gIG1hdGNoZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBNYXRjaFJlc3BvbnNlKS5vcHRpb25hbCgpLFxuICBvcmRlcmluZ3M6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBPcmRlclJlc3BvbnNlKS5vcHRpb25hbCgpLFxuICBudW1iZXJMaW5lUmVzcG9uc2VzOiB6XG4gICAgLnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgTnVtYmVyTGluZVJlc3BvbnNlKVxuICAgIC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBTdWJtaXNzaW9uUmVzcG9uc2VzVjcgPSB6LmluZmVyPHR5cGVvZiBTdWJtaXNzaW9uUmVzcG9uc2VzVjc+O1xuXG4vLyBPbmUgc2VsZl9leHBsYW5hdGlvbiBibG9jaydzIHJlc3BvbnNlOiB0aGUgZnJlZSB0ZXh0IHRoZSBzdHVkZW50IHdyb3RlLlxuLy8gVU5HUkFERUQgXHUyMDE0IHRoZXJlIGlzIG5vIGBjb3JyZWN0YCBmaWVsZCBhbmQgaXQgbmV2ZXIgY29udHJpYnV0ZXMgdG8gdGhlIHNjb3JlO1xuLy8gdGhlIHRlYWNoZXIgZGFzaGJvYXJkIHNob3dzIHRoZSB0ZXh0IHJhdy4gVGhpcyBpcyB0aGUgc2hhcGUgdGhlIHJlc2VydmVkXG4vLyBgZnJlZVJlc3BvbnNlc2AgbWFwIGNhcnJpZXMsIGFuZCBpdCBpcyBkZWxpYmVyYXRlbHkgbWluaW1hbCAoanVzdCBhIHN0cmluZylcbi8vIHNvIFBoYXNlIDIuNiBzaG9ydF9hbnN3ZXIgLyBlc3NheSByZXVzZSBpdCB1bmNoYW5nZWQgXHUyMDE0IHRoZWlyIGdyYWRpbmcgbGl2ZXMgaW5cbi8vIGEgc2VwYXJhdGUgdGFibGUsIG5vdCBpbiB0aGUgcmVzcG9uc2UuIE5vbi1lbXB0eTogYW4gdW50b3VjaGVkIHByb21wdCBpcyBhblxuLy8gb21pc3Npb24gKGFic2VudCBmcm9tIHRoZSBtYXApLCBsaWtlIGFueSBvdGhlciB1bmFuc3dlcmVkIGJsb2NrLlxuZXhwb3J0IGNvbnN0IEZyZWVSZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgdGV4dDogei5zdHJpbmcoKS5taW4oMSksXG59KTtcbmV4cG9ydCB0eXBlIEZyZWVSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIEZyZWVSZXNwb25zZT47XG5cbi8vIC0tLS0gdjggKGxlZ2FjeSkgc2hhcGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFByZS1zZWxmLWV4cGxhbmF0aW9uIHN1Ym1pc3Npb25zIChhbmQgcGFnZXMgcHVibGlzaGVkIGJlZm9yZSB0aGUgdjkgcnVudGltZVxuLy8gdGhhdCBhcmUgc3RpbGwgbGl2ZSkuIEtlcHQgc28gaW5nZXN0IGtlZXBzIEFDQ0VQVElORyB2OCBwb3N0cyBhbmQgc3RvcmVkIHJvd3Ncbi8vIG1pZ3JhdGUgZm9yd2FyZCBvbiByZWFkLiBOZXZlciB3cml0dGVuIGJ5IG5ldyBjb2RlLlxuZXhwb3J0IGNvbnN0IFN1Ym1pc3Npb25SZXNwb25zZXNWOCA9IHoub2JqZWN0KHtcbiAgc2NoZW1hVmVyc2lvbjogei5saXRlcmFsKDgpLFxuICBibGFua3M6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBCbGFua1Jlc3BvbnNlKSxcbiAgY2hlY2twb2ludFJlc3VsdHM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBDaGVja3BvaW50UmVzdWx0KS5vcHRpb25hbCgpLFxuICBncmFwaFJlc3BvbnNlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIEdyYXBoUmVzcG9uc2VWNCkub3B0aW9uYWwoKSxcbiAgY2hvaWNlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIENob2ljZVJlc3BvbnNlKS5vcHRpb25hbCgpLFxuICBtYXRjaGVzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgTWF0Y2hSZXNwb25zZSkub3B0aW9uYWwoKSxcbiAgb3JkZXJpbmdzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgT3JkZXJSZXNwb25zZSkub3B0aW9uYWwoKSxcbiAgbnVtYmVyTGluZVJlc3BvbnNlczogelxuICAgIC5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIE51bWJlckxpbmVSZXNwb25zZSlcbiAgICAub3B0aW9uYWwoKSxcbiAgZGF0YVBsb3RSZXNwb25zZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBEYXRhUGxvdFJlc3BvbnNlKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBTdWJtaXNzaW9uUmVzcG9uc2VzVjggPSB6LmluZmVyPHR5cGVvZiBTdWJtaXNzaW9uUmVzcG9uc2VzVjg+O1xuXG4vLyAtLS0tIHY5IChjdXJyZW50KSBzaGFwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBOZXcgc3VibWlzc2lvbnMgd3JpdGUgdGhpcyBzaGFwZS4gdjggXHUyMTkyIHY5IChzZWxmLWV4cGxhbmF0aW9uKTogYWRkcyB0aGVcbi8vIG9wdGlvbmFsIGBmcmVlUmVzcG9uc2VzYCBtYXAgKHVuZ3JhZGVkIGZyZWUgdGV4dCkuIEFwcGxpY2F0aW9uIGNvZGUgdGhhdCByZWFkc1xuLy8gc3VibWlzc2lvbnMgY2FsbHMgbWlncmF0ZVN1Ym1pc3Npb25SZXNwb25zZXMoKSBvbmNlIGFmdGVyIHJlYWRpbmcgdG8gaGFuZGxlXG4vLyB2MVx1MjAxM3Y5IHVuaWZvcm1seS5cbmV4cG9ydCBjb25zdCBTdWJtaXNzaW9uUmVzcG9uc2VzID0gei5vYmplY3Qoe1xuICBzY2hlbWFWZXJzaW9uOiB6LmxpdGVyYWwoOSksXG4gIC8vIEtleWVkIGJ5IGJsYW5rLmlkIFx1MjAxNCBhIHV1aWQsIE9SIGEgbWF0aC1nYXAgaWQgKE1vZGVsIEEpLiBTZWUgQkxBTktfSURfS0VZLlxuICAvLyBPbmx5IHRoZSBDVVJSRU5UIHZlcnNpb24gaXMgd2lkZW5lZDogZ2FwcyBwb3N0ZGF0ZSB2OSBhbmQgc2hpcHBlZCB3aXRob3V0IGFcbiAgLy8gd2lyZSBidW1wLCBzbyBldmVyeSBnYXAtYmVhcmluZyBwYWdlIHNlbmRzIHY5LiBUaGUgZnJvemVuIHYxXHUyMDEzdjggc2hhcGVzIHN0YXlcbiAgLy8gdXVpZC1vbmx5LCB3aGljaCBpcyB3aGF0IHRoZXkgY291bGQgZXZlciBoYXZlIGNvbnRhaW5lZC5cbiAgYmxhbmtzOiB6LnJlY29yZChCTEFOS19JRF9LRVksIEJsYW5rUmVzcG9uc2UpLFxuICAvLyBLZXllZCBieSBzZWN0aW9uLmlkLiBPbmx5IHByZXNlbnQgaW4gbG9ja2VkL2ZyZWUgc3VibWlzc2lvbiBtb2RlcyBmb3JcbiAgLy8gc2VjdGlvbnMgdGhhdCB3ZXJlIGFjdHVhbGx5IGNoZWNrcG9pbnQtY2hlY2tlZC4gQWJzZW50IGluIHNpbmdsZSBtb2RlXG4gIC8vIGFuZCBhYnNlbnQgZm9yIG5vbi1jaGVja3BvaW50IHNlY3Rpb25zLlxuICBjaGVja3BvaW50UmVzdWx0czogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIENoZWNrcG9pbnRSZXN1bHQpLm9wdGlvbmFsKCksXG4gIC8vIEtleWVkIGJ5IGludGVyYWN0aXZlX2dyYXBoIGJsb2NrLmlkICh1dWlkKS4gQWJzZW50IHdoZW4gdGhlIGFjdGl2aXR5XG4gIC8vIGhhcyBubyBncmFwaCBibG9ja3Mgb3Igbm9uZSB3ZXJlIGFuc3dlcmVkLiBTaWJsaW5nIHRvIGBibGFua3NgLCBuZXZlclxuICAvLyBtZXJnZWQgaW50byBpdCBcdTIwMTQgZ2VvbWV0cmljIGFuc3dlcnMgYXJlIHNoYXBlZCBkaWZmZXJlbnRseSBhbmQgdGhlXG4gIC8vIGRhc2hib2FyZCByZW5kZXJzIHRoZW0gZGlmZmVyZW50bHkgKHNlZSB0aGUgZXh0ZW5zaW9uIHBhdHRlcm4gYWJvdmUpLlxuICBncmFwaFJlc3BvbnNlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIEdyYXBoUmVzcG9uc2VWNCkub3B0aW9uYWwoKSxcbiAgLy8gS2V5ZWQgYnkgbXVsdGlwbGVfY2hvaWNlIGJsb2NrLmlkICh1dWlkKS4gQWJzZW50IHdoZW4gdGhlIGFjdGl2aXR5IGhhc1xuICAvLyBubyBNQyBibG9ja3Mgb3Igbm9uZSB3ZXJlIGFuc3dlcmVkIChzYW1lIG9taXNzaW9uIHJ1bGUgYXMgZ3JhcGhzKS5cbiAgY2hvaWNlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIENob2ljZVJlc3BvbnNlKS5vcHRpb25hbCgpLFxuICAvLyBLZXllZCBieSBtYXRjaGluZyBibG9jay5pZCAodXVpZCkuIFNhbWUgb21pc3Npb24gcnVsZS5cbiAgbWF0Y2hlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIE1hdGNoUmVzcG9uc2UpLm9wdGlvbmFsKCksXG4gIC8vIEtleWVkIGJ5IG9yZGVyaW5nIGJsb2NrLmlkICh1dWlkKS4gU2FtZSBvbWlzc2lvbiBydWxlLlxuICBvcmRlcmluZ3M6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBPcmRlclJlc3BvbnNlKS5vcHRpb25hbCgpLFxuICAvLyBLZXllZCBieSBudW1iZXJfbGluZSBibG9jay5pZCAodXVpZCkuIEFic2VudCB3aGVuIHRoZSBhY3Rpdml0eSBoYXMgbm9cbiAgLy8gbnVtYmVyLWxpbmUgYmxvY2tzIG9yIG5vbmUgd2VyZSBhbnN3ZXJlZC4gU2libGluZyB0byBgZ3JhcGhSZXNwb25zZXNgLFxuICAvLyBuZXZlciBtZXJnZWQgXHUyMDE0IDEtRCBnZW9tZXRyaWMgYW5zd2VycyBhcmUgc2hhcGVkIGRpZmZlcmVudGx5IGFuZCB0aGVcbiAgLy8gZGFzaGJvYXJkIHJlbmRlcnMgdGhlbSBkaWZmZXJlbnRseS5cbiAgbnVtYmVyTGluZVJlc3BvbnNlczogelxuICAgIC5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIE51bWJlckxpbmVSZXNwb25zZSlcbiAgICAub3B0aW9uYWwoKSxcbiAgLy8gS2V5ZWQgYnkgZGF0YV9wbG90IGJsb2NrLmlkICh1dWlkKS4gQWJzZW50IHdoZW4gdGhlIGFjdGl2aXR5IGhhcyBub1xuICAvLyBncmFkZWQgZGF0YS1wbG90IGJsb2NrcyBvciBub25lIHdlcmUgYW5zd2VyZWQgKGRpc3BsYXkgZGF0YV9wbG90cyBhcmVcbiAgLy8gdW5ncmFkZWQgYW5kIG5ldmVyIGFwcGVhcikuIFNpYmxpbmcgdG8gdGhlIG90aGVyIGdlb21ldHJpYyBtYXBzLlxuICBkYXRhUGxvdFJlc3BvbnNlczogelxuICAgIC5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIERhdGFQbG90UmVzcG9uc2UpXG4gICAgLm9wdGlvbmFsKCksXG4gIC8vIEtleWVkIGJ5IHNlbGZfZXhwbGFuYXRpb24gYmxvY2suaWQgKHV1aWQpLiBVbmdyYWRlZCBmcmVlIHRleHQgXHUyMDE0IG5ldmVyIGluXG4gIC8vIHRoZSBzY29yZS4gQWJzZW50IHdoZW4gdGhlIGFjdGl2aXR5IGhhcyBubyBzZWxmLWV4cGxhbmF0aW9uIGJsb2NrcyBvciBub25lXG4gIC8vIHdlcmUgd3JpdHRlbi4gUGhhc2UgMi42IHNob3J0X2Fuc3dlciAvIGVzc2F5IHdpbGwgcmV1c2UgdGhpcyBzYW1lIG1hcC5cbiAgZnJlZVJlc3BvbnNlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIEZyZWVSZXNwb25zZSkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgU3VibWlzc2lvblJlc3BvbnNlcyA9IHouaW5mZXI8dHlwZW9mIFN1Ym1pc3Npb25SZXNwb25zZXM+O1xuXG4vLyAtLS0tIE1pZ3JhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUmVhZHMgYSBzdG9yZWQgc3VibWlzc2lvbiBvZiBhbnkgc2hhcGUgYW5kIHJldHVybnMgdGhlIGN1cnJlbnQgKHY4KSBzaGFwZS5cbi8vIEFwcGxpY2F0aW9uIGNvZGUgdGhhdCBjb25zdW1lcyBzdWJtaXNzaW9ucyBjYWxscyB0aGlzIG9uY2UgYWZ0ZXIgcmVhZGluZ1xuLy8gZnJvbSB0aGUgZGF0YWJhc2U7IG9sZGVyIGlucHV0IHNoYXBlcyBhcmUgbmV2ZXIgcHJvcGFnYXRlZCBwYXN0IHRoaXMgbGF5ZXIuXG4vLyBUaGUgRWRnZSBGdW5jdGlvbiB3cml0ZXMgb25seSB0aGUgY3VycmVudCBzaGFwZS5cbi8vXG4vLyBFdmVyeSBwcm9tb3Rpb24gaXMgXCJidW1wIHRoZSB2ZXJzaW9uLCBjYXJyeSB0aGUgbWFwcyBmb3J3YXJkXCIgXHUyMDE0IGVhY2ggbmV3XG4vLyB2ZXJzaW9uIG9ubHkgQURERUQgYW4gb3B0aW9uYWwgbWFwIChvciB3aWRlbmVkIGEgdW5pb24pLCBzbyBvbGRlciBkYXRhIGlzXG4vLyBhbHdheXMgYSB2YWxpZCBpbnN0YW5jZSBvZiB0aGUgbmV3ZXIgc2hhcGUgd2l0aCB0aGUgbmV3IGZpZWxkcyBhYnNlbnQuXG5leHBvcnQgZnVuY3Rpb24gbWlncmF0ZVN1Ym1pc3Npb25SZXNwb25zZXMocmF3OiB1bmtub3duKTogU3VibWlzc2lvblJlc3BvbnNlcyB7XG4gIC8vIFRyeSB0aGUgY3VycmVudCBzaGFwZSBmaXJzdCAodGhlIGNvbW1vbiBjYXNlIGZvciBuZXcgZGF0YSkuXG4gIGNvbnN0IHY5ID0gU3VibWlzc2lvblJlc3BvbnNlcy5zYWZlUGFyc2UocmF3KTtcbiAgaWYgKHY5LnN1Y2Nlc3MpIHJldHVybiB2OS5kYXRhO1xuXG4gIC8vIHY4OiBwcm9tb3RlIGJ5IGJ1bXBpbmcgdGhlIHZlcnNpb24gXHUyMDE0IGZyZWVSZXNwb25zZXMgc2ltcGx5IGFic2VudC5cbiAgY29uc3QgdjggPSBTdWJtaXNzaW9uUmVzcG9uc2VzVjguc2FmZVBhcnNlKHJhdyk7XG4gIGlmICh2OC5zdWNjZXNzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjaGVtYVZlcnNpb246IDksXG4gICAgICBibGFua3M6IHY4LmRhdGEuYmxhbmtzLFxuICAgICAgLi4uKHY4LmRhdGEuY2hlY2twb2ludFJlc3VsdHMgJiYge1xuICAgICAgICBjaGVja3BvaW50UmVzdWx0czogdjguZGF0YS5jaGVja3BvaW50UmVzdWx0cyxcbiAgICAgIH0pLFxuICAgICAgLi4uKHY4LmRhdGEuZ3JhcGhSZXNwb25zZXMgJiYgeyBncmFwaFJlc3BvbnNlczogdjguZGF0YS5ncmFwaFJlc3BvbnNlcyB9KSxcbiAgICAgIC4uLih2OC5kYXRhLmNob2ljZXMgJiYgeyBjaG9pY2VzOiB2OC5kYXRhLmNob2ljZXMgfSksXG4gICAgICAuLi4odjguZGF0YS5tYXRjaGVzICYmIHsgbWF0Y2hlczogdjguZGF0YS5tYXRjaGVzIH0pLFxuICAgICAgLi4uKHY4LmRhdGEub3JkZXJpbmdzICYmIHsgb3JkZXJpbmdzOiB2OC5kYXRhLm9yZGVyaW5ncyB9KSxcbiAgICAgIC4uLih2OC5kYXRhLm51bWJlckxpbmVSZXNwb25zZXMgJiYge1xuICAgICAgICBudW1iZXJMaW5lUmVzcG9uc2VzOiB2OC5kYXRhLm51bWJlckxpbmVSZXNwb25zZXMsXG4gICAgICB9KSxcbiAgICAgIC4uLih2OC5kYXRhLmRhdGFQbG90UmVzcG9uc2VzICYmIHtcbiAgICAgICAgZGF0YVBsb3RSZXNwb25zZXM6IHY4LmRhdGEuZGF0YVBsb3RSZXNwb25zZXMsXG4gICAgICB9KSxcbiAgICB9O1xuICB9XG5cbiAgLy8gdjc6IHByb21vdGUgYnkgYnVtcGluZyB0aGUgdmVyc2lvbiBcdTIwMTQgZGF0YVBsb3RSZXNwb25zZXMgc2ltcGx5IGFic2VudC5cbiAgY29uc3QgdjcgPSBTdWJtaXNzaW9uUmVzcG9uc2VzVjcuc2FmZVBhcnNlKHJhdyk7XG4gIGlmICh2Ny5zdWNjZXNzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjaGVtYVZlcnNpb246IDksXG4gICAgICBibGFua3M6IHY3LmRhdGEuYmxhbmtzLFxuICAgICAgLi4uKHY3LmRhdGEuY2hlY2twb2ludFJlc3VsdHMgJiYge1xuICAgICAgICBjaGVja3BvaW50UmVzdWx0czogdjcuZGF0YS5jaGVja3BvaW50UmVzdWx0cyxcbiAgICAgIH0pLFxuICAgICAgLi4uKHY3LmRhdGEuZ3JhcGhSZXNwb25zZXMgJiYgeyBncmFwaFJlc3BvbnNlczogdjcuZGF0YS5ncmFwaFJlc3BvbnNlcyB9KSxcbiAgICAgIC4uLih2Ny5kYXRhLmNob2ljZXMgJiYgeyBjaG9pY2VzOiB2Ny5kYXRhLmNob2ljZXMgfSksXG4gICAgICAuLi4odjcuZGF0YS5tYXRjaGVzICYmIHsgbWF0Y2hlczogdjcuZGF0YS5tYXRjaGVzIH0pLFxuICAgICAgLi4uKHY3LmRhdGEub3JkZXJpbmdzICYmIHsgb3JkZXJpbmdzOiB2Ny5kYXRhLm9yZGVyaW5ncyB9KSxcbiAgICAgIC4uLih2Ny5kYXRhLm51bWJlckxpbmVSZXNwb25zZXMgJiYge1xuICAgICAgICBudW1iZXJMaW5lUmVzcG9uc2VzOiB2Ny5kYXRhLm51bWJlckxpbmVSZXNwb25zZXMsXG4gICAgICB9KSxcbiAgICB9O1xuICB9XG5cbiAgLy8gdjY6IHByb21vdGUgYnkgYnVtcGluZyB0aGUgdmVyc2lvbiBcdTIwMTQgbnVtYmVyTGluZVJlc3BvbnNlcyBzaW1wbHkgYWJzZW50LlxuICBjb25zdCB2NiA9IFN1Ym1pc3Npb25SZXNwb25zZXNWNi5zYWZlUGFyc2UocmF3KTtcbiAgaWYgKHY2LnN1Y2Nlc3MpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2NoZW1hVmVyc2lvbjogOSxcbiAgICAgIGJsYW5rczogdjYuZGF0YS5ibGFua3MsXG4gICAgICAuLi4odjYuZGF0YS5jaGVja3BvaW50UmVzdWx0cyAmJiB7XG4gICAgICAgIGNoZWNrcG9pbnRSZXN1bHRzOiB2Ni5kYXRhLmNoZWNrcG9pbnRSZXN1bHRzLFxuICAgICAgfSksXG4gICAgICAuLi4odjYuZGF0YS5ncmFwaFJlc3BvbnNlcyAmJiB7IGdyYXBoUmVzcG9uc2VzOiB2Ni5kYXRhLmdyYXBoUmVzcG9uc2VzIH0pLFxuICAgICAgLi4uKHY2LmRhdGEuY2hvaWNlcyAmJiB7IGNob2ljZXM6IHY2LmRhdGEuY2hvaWNlcyB9KSxcbiAgICAgIC4uLih2Ni5kYXRhLm1hdGNoZXMgJiYgeyBtYXRjaGVzOiB2Ni5kYXRhLm1hdGNoZXMgfSksXG4gICAgICAuLi4odjYuZGF0YS5vcmRlcmluZ3MgJiYgeyBvcmRlcmluZ3M6IHY2LmRhdGEub3JkZXJpbmdzIH0pLFxuICAgIH07XG4gIH1cblxuICAvLyB2NTogcHJvbW90ZSBieSBidW1waW5nIHRoZSB2ZXJzaW9uIFx1MjAxNCBtYXRjaGVzL29yZGVyaW5ncyBzaW1wbHkgYWJzZW50LlxuICBjb25zdCB2NSA9IFN1Ym1pc3Npb25SZXNwb25zZXNWNS5zYWZlUGFyc2UocmF3KTtcbiAgaWYgKHY1LnN1Y2Nlc3MpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2NoZW1hVmVyc2lvbjogOSxcbiAgICAgIGJsYW5rczogdjUuZGF0YS5ibGFua3MsXG4gICAgICAuLi4odjUuZGF0YS5jaGVja3BvaW50UmVzdWx0cyAmJiB7XG4gICAgICAgIGNoZWNrcG9pbnRSZXN1bHRzOiB2NS5kYXRhLmNoZWNrcG9pbnRSZXN1bHRzLFxuICAgICAgfSksXG4gICAgICAuLi4odjUuZGF0YS5ncmFwaFJlc3BvbnNlcyAmJiB7IGdyYXBoUmVzcG9uc2VzOiB2NS5kYXRhLmdyYXBoUmVzcG9uc2VzIH0pLFxuICAgICAgLi4uKHY1LmRhdGEuY2hvaWNlcyAmJiB7IGNob2ljZXM6IHY1LmRhdGEuY2hvaWNlcyB9KSxcbiAgICB9O1xuICB9XG5cbiAgLy8gdjQ6IHByb21vdGUgXHUyMDE0IHRoZSBjaG9pY2VzL21hdGNoZXMvb3JkZXJpbmdzIG1hcHMgYXJlIHNpbXBseSBhYnNlbnQuXG4gIGNvbnN0IHY0ID0gU3VibWlzc2lvblJlc3BvbnNlc1Y0LnNhZmVQYXJzZShyYXcpO1xuICBpZiAodjQuc3VjY2Vzcykge1xuICAgIHJldHVybiB7XG4gICAgICBzY2hlbWFWZXJzaW9uOiA5LFxuICAgICAgYmxhbmtzOiB2NC5kYXRhLmJsYW5rcyxcbiAgICAgIC4uLih2NC5kYXRhLmNoZWNrcG9pbnRSZXN1bHRzICYmIHtcbiAgICAgICAgY2hlY2twb2ludFJlc3VsdHM6IHY0LmRhdGEuY2hlY2twb2ludFJlc3VsdHMsXG4gICAgICB9KSxcbiAgICAgIC4uLih2NC5kYXRhLmdyYXBoUmVzcG9uc2VzICYmIHsgZ3JhcGhSZXNwb25zZXM6IHY0LmRhdGEuZ3JhcGhSZXNwb25zZXMgfSksXG4gICAgfTtcbiAgfVxuXG4gIC8vIHYzOiBwcm9tb3RlIFx1MjAxNCBldmVyeSB2MyBncmFwaCByZXNwb25zZSBpcyBhIHZhbGlkIHY0KyByZXNwb25zZSAodGhlIHY0XG4gIC8vIGZpZWxkcyBhcmUgb3B0aW9uYWwgYW5kIHRoZSB1bmlvbiBvbmx5IHdpZGVuZWQpLlxuICBjb25zdCB2MyA9IFN1Ym1pc3Npb25SZXNwb25zZXNWMy5zYWZlUGFyc2UocmF3KTtcbiAgaWYgKHYzLnN1Y2Nlc3MpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2NoZW1hVmVyc2lvbjogOSxcbiAgICAgIGJsYW5rczogdjMuZGF0YS5ibGFua3MsXG4gICAgICAuLi4odjMuZGF0YS5jaGVja3BvaW50UmVzdWx0cyAmJiB7XG4gICAgICAgIGNoZWNrcG9pbnRSZXN1bHRzOiB2My5kYXRhLmNoZWNrcG9pbnRSZXN1bHRzLFxuICAgICAgfSksXG4gICAgICAuLi4odjMuZGF0YS5ncmFwaFJlc3BvbnNlcyAmJiB7IGdyYXBoUmVzcG9uc2VzOiB2My5kYXRhLmdyYXBoUmVzcG9uc2VzIH0pLFxuICAgIH07XG4gIH1cblxuICAvLyB2MjogcHJvbW90ZTsgYmxhbmtzICsgY2hlY2twb2ludFJlc3VsdHMgY2Fycnkgb3Zlci5cbiAgY29uc3QgdjIgPSBTdWJtaXNzaW9uUmVzcG9uc2VzVjIuc2FmZVBhcnNlKHJhdyk7XG4gIGlmICh2Mi5zdWNjZXNzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjaGVtYVZlcnNpb246IDksXG4gICAgICBibGFua3M6IHYyLmRhdGEuYmxhbmtzLFxuICAgICAgLi4uKHYyLmRhdGEuY2hlY2twb2ludFJlc3VsdHMgJiYge1xuICAgICAgICBjaGVja3BvaW50UmVzdWx0czogdjIuZGF0YS5jaGVja3BvaW50UmVzdWx0cyxcbiAgICAgIH0pLFxuICAgIH07XG4gIH1cblxuICAvLyBGYWxsIGJhY2sgdG8gdjEgYW5kIG1pZ3JhdGUgZm9yd2FyZC4gVGhpcyB3aWxsIHRocm93IGlmIHRoZSBpbnB1dCBtYXRjaGVzXG4gIC8vIG5vIGtub3duIHNoYXBlLCB3aGljaCBpcyB0aGUgY29ycmVjdCBiZWhhdmlvciBcdTIwMTQgY29ycnVwdGVkIG9yIHVua25vd24tXG4gIC8vIHZlcnNpb24gc3VibWlzc2lvbnMgc2hvdWxkIGZhaWwgbG91ZGx5LCBub3Qgc2lsZW50bHkgcGFzcy5cbiAgY29uc3QgdjEgPSBTdWJtaXNzaW9uUmVzcG9uc2VzVjEucGFyc2UocmF3KTtcbiAgcmV0dXJuIHtcbiAgICBzY2hlbWFWZXJzaW9uOiA5LFxuICAgIGJsYW5rczogdjEuYmxhbmtzLFxuICB9O1xufVxuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyByZWdpc3RyeS9yZWdpc3RyeS50cyBcdTIwMTQgdGhlIHNpbmdsZSBibG9jayByZWdpc3RyeSAoUzAsIHJ1bGluZyBRMUEpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gT25lIGVudHJ5IHBlciBzY2hlbWEgYmxvY2sgdHlwZS4gVGhlIGd1YXJkIHN1aXRlICh0ZXN0cy9yZWdpc3RyeS50ZXN0LnRzKVxuLy8gcHJvdmVzOiBjb3ZlcmFnZSBpcyBleGFjdCBhZ2FpbnN0IHRoZSBCbG9jayB1bmlvbiwgbnVtYmVyaW5nIGRlY2xhcmF0aW9uc1xuLy8gYWdyZWUgd2l0aCBibG9jay1wcmVkaWNhdGVzLnRzLCBmYW1pbGllcyBhZ3JlZSB3aXRoIGlzR3JhZGVhYmxlLCB2YXJpYW50c1xuLy8gYWdyZWUgd2l0aCB0aGUgc2NoZW1hJ3MgaW50ZXJhY3Rpb24gdW5pb25zLCBhbmQgZXZlcnkgaW50ZXJhY3RpdmUgZW50cnlcbi8vIGNhcnJpZXMgYW4gYTExeSBzdG9yeS4gQWRkIGEgYmxvY2sgdHlwZSB0byB0aGUgc2NoZW1hIGFuZCB0aGlzIGZpbGUgZmFpbHMgdG9cbi8vIGNvbXBpbGUgKEJsb2NrUmVnaXN0cnkgaXMga2V5ZWQgYnkgdGhlIHVuaW9uKSBcdTIwMTQgdGhhdCBpcyB0aGUgcG9pbnQuXG4vL1xuLy8gUHJpbnQgZGVjbGFyYXRpb25zIGFyZSBGQUlUSEZVTCB0byB0aGUgY3VycmVudCBiYXNlbGluZSBwcmludCBsYXllclxuLy8gKHJlbmRlcmVyL3NyYy9ydW50aW1lL3N0eWxlcy50cyBAbWVkaWEgcHJpbnQpLCBpbmNsdWRpbmcgaXRzIHR3byBrbm93blxuLy8gb2RkaXRpZXMgKG1hdGhfYmxvY2sgYW5kIGRhdGFfcGxvdCBtaXNzaW5nIGZyb20gdGhlIGJyZWFrLWluc2lkZSBsaXN0KSBcdTIwMTRcbi8vIFQ4J3MgcGFyaXR5IHNuYXBzaG90cyBjb21wYXJlIGFnYWluc3QgY3VycmVudCBvdXRwdXQsIHNvIGltcHJvdmVtZW50cyBhcmVcbi8vIGRlbGliZXJhdGUgbGF0ZXIgZGVjaXNpb25zLCBuZXZlciBzaWxlbnQgcmVnaXN0cnkgc2lkZSBlZmZlY3RzLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHtcbiAgaXNHcmFkZWFibGUsXG4gIGlzUGFnZU51bWJlcmVkLFxuICB0eXBlIEJsb2NrLFxufSBmcm9tICdAYWN0aXZpdHkvc2NoZW1hJztcbmltcG9ydCB0eXBlIHtcbiAgQmxvY2tDYXRlZ29yeSxcbiAgQmxvY2tSZWdpc3RyeSxcbiAgQmxvY2tUeXBlLFxuICBDaGVja2VkU3RhdGVGYW1pbHksXG59IGZyb20gJy4vdHlwZXMuanMnO1xuXG4vKiogQmxhbmtUb2tlbiBmaWVsZHMgc3RyaXBwZWQgZnJvbSBpbmxpbmUgY29udGVudCB3aGVyZXZlclxuICogU2FuaXRpemVTcGVjLmlubGluZUJsYW5rU2VjcmV0cyBpcyBzZXQuIGBoaW50YCBkZWxpYmVyYXRlbHkgc3Vydml2ZXMgXHUyMDE0IGl0IGlzXG4gKiBhIHByZS1jaGVjayBhZmZvcmRhbmNlIHRoZSBzdHVkZW50IG1heSBvcGVuOyBwZXItbWlzdGFrZSBmZWVkYmFjayBpc1xuICogcmV0dXJuZWQgYnkgdGhlIGNoZWNrIFJQQyAocnVsaW5nIDIuMUEpLCBzbyB0aGUgd2hvbGUgbWlzdGFrZUZlZWRiYWNrIGFycmF5XG4gKiAobWF0Y2ggc3RyaW5ncyBBTkQgZmVlZGJhY2sgdGV4dCkgc3RyaXBzLiBgYW5zd2VyVHlwZWAgc3Vydml2ZXM6IGl0IHNoYXBlc1xuICogdGhlIGlucHV0IChudW1lcmljIGtleWJvYXJkcykuICovXG5leHBvcnQgY29uc3QgQkxBTktfU0VDUkVUX0ZJRUxEUyA9IFtcbiAgJ2Fuc3dlcicsXG4gICdhY2NlcHRhYmxlQW5zd2VycycsXG4gICdtaXN0YWtlRmVlZGJhY2snLFxuICAndG9sZXJhbmNlJyxcbiAgJ2VxdWl2YWxlbmNlJyxcbl0gYXMgY29uc3Q7XG5cbi8qKiBNYXRoUHJvbXB0IGZpZWxkcyBzdHJpcHBlZCB3aGVyZXZlciBhIHByb21wdHMgYXJyYXkgYXBwZWFycyAobWF0aF9ibG9ja1xuICogYmxvY2tzIEFORCBtYXRoX2lubGluZSBub2RlcykuIFRoZSBnYXAgbWFya2VycyBpbiB0aGUgbGF0ZXggYXJlIHRoZSBnYXBzXG4gKiB0aGVtc2VsdmVzIChhbHJlYWR5IHNlcnZlZCBlbXB0eSB0b2RheSBcdTIwMTQgc2VyaWFsaXplLnRzIHByZWNlZGVudCk7IHRoZVxuICogcHJvbXB0J3MgYW5zd2VyL2dyYWRpbmcgY29uZmlnIGlzIHRoZSBzZWNyZXQuIGBhY2NlcHRhYmxlQW5zd2Vyc2Agd2FzXG4gKiBNSVNTSU5HIGZyb20gdGhlIFMwIGRlY2xhcmF0aW9uIChcImFsc28gYWNjZXB0XCIgYWx0ZXJuYXRpdmUgYW5zd2VycyBcdTIwMTQgYSByZWFsXG4gKiBrZXkgbGVhaykgXHUyMDE0IGNhdWdodCBieSBTMidzIGNyb3NzLWNoZWNrIGFnYWluc3QgdGhlIE1hdGhQcm9tcHQgc2NoZW1hIGFuZFxuICogYWRkZWQgYmVmb3JlIHRoZSBmaXJzdCBzYW5pdGl6ZWQgYnl0ZSB3YXMgc2VydmVkLiAqL1xuZXhwb3J0IGNvbnN0IE1BVEhfUFJPTVBUX1NFQ1JFVF9GSUVMRFMgPSBbXG4gICdhbnN3ZXInLFxuICAnYWNjZXB0YWJsZUFuc3dlcnMnLFxuICAnZXF1aXZhbGVuY2UnLFxuICAndG9sZXJhbmNlJyxcbl0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBibG9ja1JlZ2lzdHJ5OiBCbG9ja1JlZ2lzdHJ5ID0ge1xuICBwYXJhZ3JhcGg6IHtcbiAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAncGFyYWdyYXBoJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICdwcm9zZScgfSxcbiAgfSxcblxuICBoZWFkaW5nOiB7XG4gICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdoZWFkaW5nJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICdwcm9zZScsIGtlZXBXaXRoTmV4dDogdHJ1ZSB9LFxuICB9LFxuXG4gIG1hdGhfYmxvY2s6IHtcbiAgICB0eXBlOiAnbWF0aF9ibG9jaycsXG4gICAgLy8gR2FwLWJlYXJpbmcgKE1vZGVsIEEgcHJvbXB0cykgXHUyMTkyIGF1dG8tZ3JhZGFibGUgKyBudW1iZXJlZCArIGludGVyYWN0aXZlO1xuICAgIC8vIGEgcGxhaW4gZGlzcGxheSBlcXVhdGlvbiByZXNvbHZlcyBzdGF0aWMgdGhyb3VnaCBmYW1pbHlPZigpLlxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JywgLy8gZmFpdGhmdWw6IHJlbmRlcmVyIGVtaXRzIGNvbnRlbnQgZXZlbiB3aGVuIGdhcC1iZWFyaW5nXG4gICAgbnVtYmVyZWQ6ICd3aGVuX2dyYWRhYmxlJyxcbiAgICBhbmFseXRpY3NLZXk6ICdtYXRoX2Jsb2NrJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogWydzb2x1dGlvbiddLCBpbmxpbmVCbGFua1NlY3JldHM6IHRydWUgfSxcbiAgICAvLyBGYWl0aGZ1bCBvZGRpdHk6IE5PVCBpbiB0aGUgY3VycmVudCBicmVhay1pbnNpZGU6YXZvaWQgbGlzdCwgYW5kIG5vdCBpblxuICAgIC8vIHRoZSBzaG93QW5zd2VycyBzZXQgXHUyMDE0IGEgbnVtYmVyZWQgbWF0aCBwcm9ibGVtIGNhbiBzcGxpdCBhY3Jvc3MgcGFnZXNcbiAgICAvLyB0b2RheS4gVDggZGVjaWRlcyB3aGV0aGVyIHRvIGZpeDsgdGhlIHJlZ2lzdHJ5IHJlY29yZHMgd2hhdCBpcy5cbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICd1bmRlcmxpbmUtYmxhbmtzJyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnRWFjaCBpbi1lcXVhdGlvbiBnYXAgaXMgYSB0ZXh0IGlucHV0IGluIHRhYiBvcmRlciwgbGFiZWxlZCB3aXRoIGl0cyAnICtcbiAgICAgICAgJ3Bvc2l0aW9uIChcImdhcCAxIG9mIDIgaW4gcHJvYmxlbSAzXCIpLiBWYWx1ZXMgdHlwZSBhcyBwbGFpbiB0ZXh0OyAnICtcbiAgICAgICAgJ3ZlcmRpY3RzIGFyZSBhbm5vdW5jZWQgdmlhIHRoZSBzaGFyZWQgc3RhdGUtcGlsbCBhcmlhLWxpdmUgcmVnaW9uLicsXG4gICAgfSxcbiAgfSxcblxuICBpbWFnZToge1xuICAgIHR5cGU6ICdpbWFnZScsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ2ltYWdlJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICdmaWd1cmUnIH0sXG4gIH0sXG5cbiAgY2FsbG91dDoge1xuICAgIHR5cGU6ICdjYWxsb3V0JyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnY2FsbG91dCcsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAndmFyaWFudC1ib3JkZXItYm94JyB9LFxuICB9LFxuXG4gIHByb2JsZW06IHtcbiAgICB0eXBlOiAncHJvYmxlbScsXG4gICAgLy8gTnVtYmVyZWQgbGVnYWN5IHByb3NlIHByb2JsZW07IGNhcnJpZXMgYSBzb2x1dGlvbiBidXQgbm8gYXV0by1ncmFkZWRcbiAgICAvLyByZXNwb25zZSAoaXNHcmFkZWFibGU6IGZhbHNlKSBcdTIxOTIgc3RhdGljIGZhbWlseSwgbm8gc3RhdGUgY2hyb21lLiBTY2hlbWFcbiAgICAvLyBvcnBoYW46IG5vIGVkaXRvciBOb2RlVmlldzsgc3RpbGwgcmVuZGVyYWJsZSwgc28gaXQga2VlcHMgYW4gZW50cnkuXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAncHJvYmxlbScsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFsnc29sdXRpb24nXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdwcm9zZScgfSxcbiAgfSxcblxuICBmaWxsX2luX2JsYW5rOiB7XG4gICAgdHlwZTogJ2ZpbGxfaW5fYmxhbmsnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ2ZpbGxfaW5fYmxhbmsnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbJ3NvbHV0aW9uJ10sIGlubGluZUJsYW5rU2VjcmV0czogdHJ1ZSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICd1bmRlcmxpbmUtYmxhbmtzJywgYW5zd2VyS2V5VmFyaWFudDogdHJ1ZSB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnRWFjaCBibGFuayBpcyBhIHRleHQgaW5wdXQgaW4gdGFiIG9yZGVyIHdpdGggYSBsYWJlbCBuYW1pbmcgaXRzICcgK1xuICAgICAgICAncHJvYmxlbSBhbmQgc3ViLXBhcnQgKFwiYmxhbmsgKGEpLCBwcm9ibGVtIDNcIikuIEhpbnQgYW5kIG1pc3Rha2UgJyArXG4gICAgICAgICdhZmZvcmRhbmNlcyBhcmUgYnV0dG9ucyByZWFjaGFibGUgYnkgVGFiOyB0aGUgb3BlbmVkIHBvcG92ZXIgdHJhcHMgJyArXG4gICAgICAgICdubyBmb2N1cyBhbmQgY2xvc2VzIG9uIEVzY2FwZS4gVmVyZGljdHMgYW5ub3VuY2UgdmlhIGFyaWEtbGl2ZS4nLFxuICAgIH0sXG4gIH0sXG5cbiAgYnVsbGV0X2xpc3Q6IHtcbiAgICB0eXBlOiAnYnVsbGV0X2xpc3QnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdidWxsZXRfbGlzdCcsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAncHJvc2UnIH0sXG4gIH0sXG5cbiAgb3JkZXJlZF9saXN0OiB7XG4gICAgdHlwZTogJ29yZGVyZWRfbGlzdCcsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ29yZGVyZWRfbGlzdCcsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAncHJvc2UnIH0sXG4gIH0sXG5cbiAgaW50ZXJhY3RpdmVfZ3JhcGg6IHtcbiAgICB0eXBlOiAnaW50ZXJhY3RpdmVfZ3JhcGgnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLCAvLyBkaXNwbGF5IHZhcmlhbnQgcmVzb2x2ZXMgc3RhdGljIHZpYSBmYW1pbHlPZigpXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJywgLy8gZGlzcGxheSB2YXJpYW50IHJlc29sdmVzIGNvbnRlbnQgdmlhIGNhdGVnb3J5T2YoKVxuICAgIG51bWJlcmVkOiAnd2hlbl9ncmFkYWJsZScsXG4gICAgYW5hbHl0aWNzS2V5OiAnaW50ZXJhY3RpdmVfZ3JhcGgnLFxuICAgIHZhcmlhbnRzOiBbXG4gICAgICAncGxvdF9wb2ludCcsXG4gICAgICAncGxvdF9mdW5jdGlvbicsXG4gICAgICAnc2hhZGVfcmVnaW9uJyxcbiAgICAgICdncmFwaF9pbmVxdWFsaXR5JyxcbiAgICAgICdwbG90X3JheScsXG4gICAgICAncGxvdF9zZWdtZW50JyxcbiAgICAgICdkaXNwbGF5JyxcbiAgICBdLFxuICAgIHNhbml0aXplOiB7XG4gICAgICAvLyBWYXJpYW50LXNjb3BlZCBrZXlzOiBwYXRocyB0aGF0IGRvbid0IGV4aXN0IG9uIGFuIGluc3RhbmNlJ3NcbiAgICAgIC8vIGludGVyYWN0aW9uIHNpbXBseSBkb24ndCBtYXRjaC4gYGFsbG93Tm9Tb2x1dGlvbmAgU1VSVklWRVMgKGl0IHJlbmRlcnNcbiAgICAgIC8vIHRoZSBcIm5vIHNvbHV0aW9uXCIgY29udHJvbCk7IGBub1NvbHV0aW9uQ29ycmVjdGAgaXMgdGhlIGFuc3dlci5cbiAgICAgIHN0cmlwOiBbXG4gICAgICAgICdpbnRlcmFjdGlvbi5jb3JyZWN0UG9pbnRzJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLnRvbGVyYW5jZScsXG4gICAgICAgICdpbnRlcmFjdGlvbi5tb2RlbHMnLFxuICAgICAgICAnaW50ZXJhY3Rpb24uZG9tYWlucycsXG4gICAgICAgICdpbnRlcmFjdGlvbi5yZWdpb25zJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLmluZXF1YWxpdGllcycsXG4gICAgICAgICdpbnRlcmFjdGlvbi5yYXlzJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLnNlZ21lbnRzJyxcbiAgICAgICAgJ21pc3Rha2VGZWVkYmFjaycsXG4gICAgICAgICdzb2x1dGlvbicsXG4gICAgICAgICdub1NvbHV0aW9uQ29ycmVjdCcsXG4gICAgICAgICdwYXJ0aWFsQ3JlZGl0JyxcbiAgICAgICAgJ2J1aWx0aW5GZWVkYmFjaycsXG4gICAgICBdLFxuICAgIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3N0YXRpYy1zdmcnLCBhbnN3ZXJLZXlWYXJpYW50OiB0cnVlIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdUaGUgY2FudmFzIGlzIGZvY3VzYWJsZTsgaGFuZGxlcyBtb3ZlIGJ5IGFycm93IGtleXMgd2l0aCBwb3NpdGlvbiAnICtcbiAgICAgICAgJ25hcnJhdGlvbiB0byBhIHZpc3VhbGx5LWhpZGRlbiBhcmlhLWxpdmUgcmVnaW9uIChhIHZpc2libGUgcmVhZG91dCAnICtcbiAgICAgICAgJ3dvdWxkIGhhbmQgb3ZlciB0aGUgYW5zd2VyIFx1MjAxNCByZWFkaW5nIHRoZSBncmlkIGlzIHRoZSBza2lsbCkuICcgK1xuICAgICAgICAnUG9zdC1jaGVjayByZXN1bHRzIGFyZSB2aXNpYmxlIHRleHQuIFRvdWNoIHRhcmdldHMgbWVldCA0NHB4LicsXG4gICAgfSxcbiAgfSxcblxuICBtdWx0aXBsZV9jaG9pY2U6IHtcbiAgICB0eXBlOiAnbXVsdGlwbGVfY2hvaWNlJyxcbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdtdWx0aXBsZV9jaG9pY2UnLFxuICAgIHNhbml0aXplOiB7XG4gICAgICAvLyBQZXItY2hvaWNlIGZlZWRiYWNrIHJldHVybnMgdmlhIHRoZSBjaGVjayBSUEMgKDIuMUEpLCBsaWtlIGJsYW5rcycuXG4gICAgICBzdHJpcDogWydjaG9pY2VzW10uY29ycmVjdCcsICdjaG9pY2VzW10uZmVlZGJhY2snLCAnc29sdXRpb24nXSxcbiAgICB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdjaG9pY2UtbGV0dGVycycsIGFuc3dlcktleVZhcmlhbnQ6IHRydWUgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ05hdGl2ZSByYWRpbyAoc2luZ2xlKSAvIGNoZWNrYm94IChtdWx0aSkgaW5wdXRzIGdyb3VwZWQgaW4gYSAnICtcbiAgICAgICAgJ2ZpZWxkc2V0IHdob3NlIGxlZ2VuZCBpcyB0aGUgcHJvbXB0OyBmdWxsIGxhYmVsIGNsaWNrIHRhcmdldHMuICcgK1xuICAgICAgICAnU3RhbmRhcmQgYXJyb3cta2V5IHJhZGlvIGJlaGF2aW9yOyB2ZXJkaWN0cyBhbm5vdW5jZSB2aWEgYXJpYS1saXZlLicsXG4gICAgfSxcbiAgfSxcblxuICBtYXRjaGluZzoge1xuICAgIHR5cGU6ICdtYXRjaGluZycsXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAnbWF0Y2hpbmcnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbJ2tleScsICdzb2x1dGlvbiddIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ2xldHRlci1iYW5rJywgYW5zd2VyS2V5VmFyaWFudDogdHJ1ZSB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnUG9pbnRlciBkcmFnIHdpdGggYSBrZXlib2FyZCBzZWxlY3QtdGhlbi1wbGFjZSBncmFtbWFyIHVuZGVybmVhdGg6ICcgK1xuICAgICAgICAndGFyZ2V0IGNhcmRzIGFyZSBmb2N1c2FibGUsIFNwYWNlL0VudGVyIGxpZnRzLCBhcnJvd3MgY2hvb3NlIGEgZG9jaywgJyArXG4gICAgICAgICdTcGFjZS9FbnRlciBwbGFjZXMsIEVzY2FwZSBjYW5jZWxzLiBFdmVyeSBtb3ZlIG5hcnJhdGVzIHRvIGEgJyArXG4gICAgICAgICd2aXN1YWxseS1oaWRkZW4gYXJpYS1saXZlIHJlZ2lvbiAoXCJDYXJkIEIgcGxhY2VkIG9uIGl0ZW0gMlwiKS4nLFxuICAgIH0sXG4gIH0sXG5cbiAgb3JkZXJpbmc6IHtcbiAgICB0eXBlOiAnb3JkZXJpbmcnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ29yZGVyaW5nJyxcbiAgICBzYW5pdGl6ZToge1xuICAgICAgc3RyaXA6IFsnc29sdXRpb24nXSxcbiAgICAgIC8vIFRoZSBhdXRob3JlZCBpdGVtcyBvcmRlciBJUyB0aGUga2V5IFx1MjAxNCB0aGUgc2VydmVyIHNlcnZlcyBhIHNodWZmbGVcbiAgICAgIC8vIChzdGFibGUgcGVyIHZlcnNpb24gKyBzdHVkZW50IHNvIHJlbG9hZHMgZG9uJ3QgcmVzaHVmZmxlKS5cbiAgICAgIHNlcnZlU2h1ZmZsZWQ6IFsnaXRlbXMnXSxcbiAgICB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdudW1iZXItYm94ZXMnLCBhbnN3ZXJLZXlWYXJpYW50OiB0cnVlIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdSb3dzIGFyZSBmb2N1c2FibGUgYW5kIHJlb3JkZXIgdmlhIHRoZSBzaGFyZWQgbGlmdCBncmFtbWFyOiAnICtcbiAgICAgICAgJ1NwYWNlL0VudGVyIGxpZnRzLCBhcnJvd3MgbW92ZSB0aGUgcm93LCBTcGFjZS9FbnRlciBkcm9wcywgRXNjYXBlICcgK1xuICAgICAgICAnY2FuY2VsczsgcG9zaXRpb25zIG5hcnJhdGUgdG8gYSB2aXN1YWxseS1oaWRkZW4gYXJpYS1saXZlIHJlZ2lvbi4nLFxuICAgIH0sXG4gIH0sXG5cbiAgbnVtYmVyX2xpbmU6IHtcbiAgICB0eXBlOiAnbnVtYmVyX2xpbmUnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ251bWJlcl9saW5lJyxcbiAgICB2YXJpYW50czogWydwbG90X3BvaW50JywgJ3Bsb3RfaW50ZXJ2YWwnXSxcbiAgICBzYW5pdGl6ZToge1xuICAgICAgc3RyaXA6IFtcbiAgICAgICAgJ2ludGVyYWN0aW9uLmNvcnJlY3RQb2ludHMnLFxuICAgICAgICAnaW50ZXJhY3Rpb24udG9sZXJhbmNlJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLmNvcnJlY3RJbnRlcnZhbCcsXG4gICAgICAgICdzb2x1dGlvbicsXG4gICAgICBdLFxuICAgIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3N0YXRpYy1zdmcnLCBhbnN3ZXJLZXlWYXJpYW50OiB0cnVlIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdUaGUgbGluZSBpcyBmb2N1c2FibGU7IHBvaW50cy9pbnRlcnZhbCBlbmRwb2ludHMgbW92ZSBieSBhcnJvdyBrZXlzICcgK1xuICAgICAgICAnd2l0aCB2YWx1ZSBuYXJyYXRpb24gdG8gYSB2aXN1YWxseS1oaWRkZW4gYXJpYS1saXZlIHJlZ2lvbiAodmlzaWJsZSAnICtcbiAgICAgICAgJ3JlYWRvdXQgd291bGQgcmV2ZWFsIHRoZSBhbnN3ZXIpLiBQb3N0LWNoZWNrIHJlc3VsdHMgYXJlIHZpc2libGUuJyxcbiAgICB9LFxuICB9LFxuXG4gIGRhdGFfcGxvdDoge1xuICAgIHR5cGU6ICdkYXRhX3Bsb3QnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLCAvLyBkaXNwbGF5IHZhcmlhbnQgcmVzb2x2ZXMgc3RhdGljIHZpYSBmYW1pbHlPZigpXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJywgLy8gZGlzcGxheSB2YXJpYW50IHJlc29sdmVzIGNvbnRlbnQgdmlhIGNhdGVnb3J5T2YoKVxuICAgIG51bWJlcmVkOiAnd2hlbl9ncmFkYWJsZScsXG4gICAgYW5hbHl0aWNzS2V5OiAnZGF0YV9wbG90JyxcbiAgICB2YXJpYW50czogWydkaXNwbGF5JywgJ2J1aWxkX2RvdHBsb3QnLCAnYnVpbGRfaGlzdG9ncmFtJywgJ2J1aWxkX2JveHBsb3QnXSxcbiAgICBzYW5pdGl6ZToge1xuICAgICAgc3RyaXA6IFsnc29sdXRpb24nLCAnaW50ZXJhY3Rpb24udG9sZXJhbmNlJ10sXG4gICAgICBkZXJpdmFibGVGcm9tU2VydmVkOlxuICAgICAgICAnVGhlIGRhdGEgc2V0IGlzIHRoZSB3b3JraW5nIG1hdGVyaWFsIHRoZSBzdHVkZW50IGJ1aWxkcyB0aGUgY2hhcnQgJyArXG4gICAgICAgICdGUk9NLCBhbmQgdGhlIGNvcnJlY3QgY2hhcnQgaXMgY29tcHV0ZWQgZnJvbSBpdCBcdTIwMTQgd2l0aGhvbGRpbmcgdGhlICcgK1xuICAgICAgICAnZGF0YSB3b3VsZCByZW1vdmUgdGhlIHRhc2suIFNlcnZlci1hdXRob3JpdGF0aXZlIGdyYWRpbmcgc3RpbGwgZ2F0ZXMgJyArXG4gICAgICAgICd2ZXJkaWN0czsgdGhlIGxlYWsgdGVzdHMgd2hpdGVsaXN0IGBkYXRhYCBmb3IgdGhpcyBibG9jayBleHBsaWNpdGx5LicsXG4gICAgfSxcbiAgICAvLyBGYWl0aGZ1bCBvZGRpdHk6IE5PVCBpbiB0aGUgY3VycmVudCBicmVhay1pbnNpZGU6YXZvaWQgbGlzdCAodW5saWtlIHRoZVxuICAgIC8vIGdyYXBoIGFuZCBudW1iZXItbGluZSBjYW52YXNlcykuIFQ4IGRlY2lkZXM7IHJlZ2lzdHJ5IHJlY29yZHMgd2hhdCBpcy5cbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICdzdGF0aWMtc3ZnJywgYW5zd2VyS2V5VmFyaWFudDogdHJ1ZSB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnQ2hhcnQtYnVpbGRpbmcgY29udHJvbHMgYXJlIGZvY3VzYWJsZTsgZG90cy9iYXJzL2JveCBoYW5kbGVzIGFkanVzdCAnICtcbiAgICAgICAgJ2J5IGFycm93IGtleXMgd2l0aCB2YWx1ZSBuYXJyYXRpb24gdG8gYSB2aXN1YWxseS1oaWRkZW4gYXJpYS1saXZlICcgK1xuICAgICAgICAncmVnaW9uLiBQb3N0LWNoZWNrIHJlc3VsdHMgYXJlIHZpc2libGUgdGV4dC4nLFxuICAgIH0sXG4gIH0sXG5cbiAgbGVhcm5pbmdfb2JqZWN0aXZlczoge1xuICAgIHR5cGU6ICdsZWFybmluZ19vYmplY3RpdmVzJyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnbGVhcm5pbmdfb2JqZWN0aXZlcycsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ2JvcmRlcmVkLWJveCcgfSxcbiAgfSxcblxuICB3b3JrZWRfZXhhbXBsZToge1xuICAgIHR5cGU6ICd3b3JrZWRfZXhhbXBsZScsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ3dvcmtlZF9leGFtcGxlJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10sIGNoaWxkQmxvY2tzOiBbJ2NvbnRlbnQnXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdib3JkZXJlZC1ib3gnIH0sXG4gIH0sXG5cbiAgZmFkZWRfd29ya2VkX2V4YW1wbGU6IHtcbiAgICB0eXBlOiAnZmFkZWRfd29ya2VkX2V4YW1wbGUnLFxuICAgIC8vIFRoZSBib3ggY291bnRzIGFzIE9ORSBudW1iZXJlZCBwcm9ibGVtOyBncmFkaW5nIHJpZGVzIGl0cyBjaGlsZFxuICAgIC8vIGZpbGxfaW5fYmxhbmsgc3RlcHMsIGVhY2ggc2FuaXRpemVkIGJ5IGl0cyBvd24gZW50cnkgdmlhIGNoaWxkQmxvY2tzLlxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnc2NhZmZvbGQnLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdmYWRlZF93b3JrZWRfZXhhbXBsZScsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdLCBjaGlsZEJsb2NrczogWydjb250ZW50J10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnYm9yZGVyZWQtYm94JyB9LFxuICB9LFxuXG4gIHNlbGZfZXhwbGFuYXRpb246IHtcbiAgICB0eXBlOiAnc2VsZl9leHBsYW5hdGlvbicsXG4gICAgZmFtaWx5OiAncmVjb3JkZWQnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnc2VsZl9leHBsYW5hdGlvbicsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgLy8gVGhlIGN1cnJlbnQgYXZvaWQgcmlkZXMgdGhlIHRleHRhcmVhLCBub3QgdGhlIGJsb2NrIFx1MjAxNCBhIGxvbmcgcHJvbXB0IGNhblxuICAgIC8vIHNwbGl0IGZyb20gaXRzIHdyaXRpbmcgYm94IHRvZGF5LiBGYWl0aGZ1bDsgVDggZGVjaWRlcy5cbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICd3cml0aW5nLWJveCcgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ0EgbGFiZWxlZCB0ZXh0YXJlYSBpbiB0YWIgb3JkZXIuIE9uIGNoZWNrIHRoZSBibG9jayBhbm5vdW5jZXMgJyArXG4gICAgICAgICdcIlJlY29yZGVkIFx1MjAxNCB5b3VyIHRlYWNoZXIgd2lsbCByZXZpZXdcIiB2aWEgYXJpYS1saXZlOyBuZXZlciBhIHZlcmRpY3QuJyxcbiAgICB9LFxuICB9LFxuXG4gIHNob3J0X2Fuc3dlcjoge1xuICAgIHR5cGU6ICdzaG9ydF9hbnN3ZXInLFxuICAgIGZhbWlseTogJ3JlY29yZGVkJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ3Nob3J0X2Fuc3dlcicsXG4gICAgLy8gUnVicmljcyBhcmUgdGVhY2hlci1zaWRlIGRhdGEgXHUyMDE0IGFscmVhZHkgY29ycmVjdGx5IHdpdGhoZWxkIGZyb20gc3R1ZGVudFxuICAgIC8vIEhUTUwgdG9kYXk7IHRoZSByZWdpc3RyeSBtYWtlcyB0aGF0IGEgZGVjbGFyZWQgaW52YXJpYW50LlxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbJ3J1YnJpYyddIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAnd3JpdGluZy1ib3gnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdBIGxhYmVsZWQgdGV4dGFyZWEgaW4gdGFiIG9yZGVyLiBSZWNvcmRlZCBzdGF0ZSBhbm5vdW5jZXMgdmlhICcgK1xuICAgICAgICAnYXJpYS1saXZlOyB0ZWFjaGVyIGZlZWRiYWNrLCBvbmNlIHJlbGVhc2VkLCByZW5kZXJzIGFzIGEgbGFiZWxlZCAnICtcbiAgICAgICAgJ3JlZ2lvbiBhbm5vdW5jZWQgb24gYXJyaXZhbC4nLFxuICAgIH0sXG4gIH0sXG5cbiAgZXNzYXk6IHtcbiAgICB0eXBlOiAnZXNzYXknLFxuICAgIGZhbWlseTogJ3JlY29yZGVkJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ2Vzc2F5JyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogWydydWJyaWMnXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ3dyaXRpbmctYm94JyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnQSBsYWJlbGVkIHRleHRhcmVhIGluIHRhYiBvcmRlci4gVGhlIGxpdmUgd29yZCBjb3VudGVyIGlzICcgK1xuICAgICAgICAnYXJpYS1saXZlPXBvbGl0ZSBhbmQgZGVib3VuY2VkIHNvIGl0IG5ldmVyIGNoYXR0ZXJzIHBlciBrZXlzdHJva2UuICcgK1xuICAgICAgICAnUmVjb3JkZWQgc3RhdGUgYW5kIHJlbGVhc2VkIHRlYWNoZXIgZmVlZGJhY2sgYW5ub3VuY2UgdmlhIGFyaWEtbGl2ZS4nLFxuICAgIH0sXG4gIH0sXG5cbiAgZ3JhcGhfZmlndXJlOiB7XG4gICAgdHlwZTogJ2dyYXBoX2ZpZ3VyZScsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ2dyYXBoX2ZpZ3VyZScsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAnZmlndXJlJyB9LFxuICB9LFxufTtcblxuLyoqIEV2ZXJ5IHJlZ2lzdGVyZWQgdHlwZSwgaW4gcmVnaXN0cnkgZGVjbGFyYXRpb24gb3JkZXIuICovXG5leHBvcnQgY29uc3QgcmVnaXN0ZXJlZEJsb2NrVHlwZXMgPSBPYmplY3Qua2V5cyhibG9ja1JlZ2lzdHJ5KSBhcyBCbG9ja1R5cGVbXTtcblxuLyoqIFJlc29sdmUgYW4gSU5TVEFOQ0UncyBjaGVja2VkLXN0YXRlIGZhbWlseS4gQSB0eXBlJ3MgZGVjbGFyZWQgZmFtaWx5IGlzXG4gKiBtYXhpbWFsOyB1bmdyYWRhYmxlIGluc3RhbmNlcyBvZiBncmFkYWJsZSB0eXBlcyAoZGlzcGxheSBncmFwaC9kYXRhIHBsb3QsXG4gKiBwcm9tcHRsZXNzIG1hdGggYmxvY2spIHJlc29sdmUgdG8gc3RhdGljIFx1MjAxNCBvbmUgcnVsZSBlbmdpbmUsIGlzR3JhZGVhYmxlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZhbWlseU9mKGJsb2NrOiBCbG9jayk6IENoZWNrZWRTdGF0ZUZhbWlseSB7XG4gIGNvbnN0IGVudHJ5ID0gYmxvY2tSZWdpc3RyeVtibG9jay50eXBlXTtcbiAgaWYgKGVudHJ5LmZhbWlseSA9PT0gJ3N0YXRpYycpIHJldHVybiAnc3RhdGljJztcbiAgcmV0dXJuIGlzR3JhZGVhYmxlKGJsb2NrKSA/IGVudHJ5LmZhbWlseSA6ICdzdGF0aWMnO1xufVxuXG4vKiogUmVzb2x2ZSBhbiBJTlNUQU5DRSdzIGNhdGVnb3J5OiBhIGRpc3BsYXktbW9kZSBncmFwaC9kYXRhIHBsb3Qgc2VydmVzIGFzXG4gKiBjb250ZW50LCBtYXRjaGluZyB0aGUgcmVuZGVyZXIncyBkYXRhLWJsb2NrLWNhdGVnb3J5IGVtaXNzaW9uLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhdGVnb3J5T2YoYmxvY2s6IEJsb2NrKTogQmxvY2tDYXRlZ29yeSB7XG4gIGNvbnN0IGVudHJ5ID0gYmxvY2tSZWdpc3RyeVtibG9jay50eXBlXTtcbiAgaWYgKGVudHJ5LmNhdGVnb3J5ID09PSAncXVlc3Rpb24nICYmIGVudHJ5Lm51bWJlcmVkID09PSAnd2hlbl9ncmFkYWJsZScpIHtcbiAgICByZXR1cm4gaXNHcmFkZWFibGUoYmxvY2spID8gJ3F1ZXN0aW9uJyA6ICdjb250ZW50JztcbiAgfVxuICByZXR1cm4gZW50cnkuY2F0ZWdvcnk7XG59XG5cbi8qKiBDZW5zdXMga2V5IGZvciBhbiBpbnN0YW5jZSAoUDNBKTogdGhlIGFuYWx5dGljcyBrZXksIHdpdGggdGhlIGludGVyYWN0aW9uXG4gKiB2YXJpYW50IGFwcGVuZGVkIGZvciB0aGUgYmxvY2tzIHRoYXQgaGF2ZSBvbmUgXHUyMDE0IGBkYXRhX3Bsb3QuYnVpbGRfaGlzdG9ncmFtYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjZW5zdXNLZXlPZihibG9jazogQmxvY2spOiBzdHJpbmcge1xuICBjb25zdCBlbnRyeSA9IGJsb2NrUmVnaXN0cnlbYmxvY2sudHlwZV07XG4gIGlmICgnaW50ZXJhY3Rpb24nIGluIGJsb2NrICYmIGVudHJ5LnZhcmlhbnRzKSB7XG4gICAgcmV0dXJuIGAke2VudHJ5LmFuYWx5dGljc0tleX0uJHtibG9jay5pbnRlcmFjdGlvbi50eXBlfWA7XG4gIH1cbiAgcmV0dXJuIGVudHJ5LmFuYWx5dGljc0tleTtcbn1cblxuLyoqIFdoZXRoZXIgYW4gSU5TVEFOQ0UgZHJhd3MgYSBwcm9ibGVtIG51bWJlciAoZGVsZWdhdGVzIHRvIHRoZSBzY2hlbWEgcnVsZVxuICogZW5naW5lIFx1MjAxNCByZS1leHBvcnRlZCBoZXJlIHNvIHZpZXdlciBjb2RlIGhhcyBvbmUgaW1wb3J0IHN1cmZhY2UpLiAqL1xuZXhwb3J0IHsgaXNQYWdlTnVtYmVyZWQgfTtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2FuaXRpemUvc2FuaXRpemUudHMgXHUyMDE0IHRoZSBhbnN3ZXIta2V5IHNhbml0aXplciAoUzIvVDMsIHJ1bGluZyBUVjQtQSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIEdFTkVSSUMgc3RyaXAgdHJhbnNmb3JtIGRyaXZlbiBlbnRpcmVseSBieSB0aGUgcmVnaXN0cnkncyBTYW5pdGl6ZVNwZWNcbi8vIGRlY2xhcmF0aW9ucyBcdTIwMTQgaXQgaG9sZHMgbm8gcGVyLXR5cGUga25vd2xlZGdlIG9mIGl0cyBvd24gKHJ1bGluZyBRMUE6IHRoZVxuLy8gcmVnaXN0cnkgZGVjbGFyZXMsIHRyYW5zZm9ybXMgb2JleSkuIFJ1bnMgc2VydmVyLXNpZGUgaW4gdGhlIGdldC1hY3Rpdml0eVxuLy8gRWRnZSBGdW5jdGlvbiwgY29tcG9zZWQgd2l0aCB1cGdyYWRlLW9uLXJlYWQ7IHRoZSBvdXRwdXQgaXMgd2hhdCB0aGUgZHVyYWJsZVxuLy8gcGVyLXZlcnNpb24gY2FjaGUgc3RvcmVzIGFuZCB0aGUgdmlld2VyIHJlY2VpdmVzLiBBbnN3ZXJzIE5FVkVSIHJlYWNoIGFcbi8vIHN0dWRlbnQgY2xpZW50IChydWxpbmcgUTJCKSBcdTIwMTQgdGhlIHdpcmUtbGV2ZWwgbGVhayB0ZXN0cyBpblxuLy8gdGVzdHMvc2FuaXRpemUudGVzdC50cyBhc3NlcnQgdGhlIG91dGNvbWUsIG5vdCB0aGUgbWVjaGFuaXNtLlxuLy9cbi8vIFRocmVlIGxheWVycywgaW4gb3JkZXIsIHBlciBibG9jazpcbi8vICAgMS4gRGVjbGFyZWQgc3RyaXBzIFx1MjAxNCB0aGUgZW50cnkncyBgc3RyaXBgIHBhdGhzLCBpbiB0aGUgdGlueSBncmFtbWFyXG4vLyAgICAgIHR5cGVzLnRzIGRvY3VtZW50cyAoJ2ZpZWxkJywgJ2ZpZWxkW10uc3ViJywgJ2ludGVyYWN0aW9uLmZpZWxkJykuXG4vLyAgIDIuIENoaWxkIHJlY3Vyc2lvbiBcdTIwMTQgYGNoaWxkQmxvY2tzYCBmaWVsZHMgcmUtZW50ZXIgdGhlIHNhbml0aXplciwgc28gYVxuLy8gICAgICBmaWxsX2luX2JsYW5rIG5lc3RlZCBpbiBhIHdvcmtlZCBleGFtcGxlIGlzIHN0cmlwcGVkIGJ5IElUUyBPV04gZW50cnkuXG4vLyAgIDMuIEluLWJhbmQgZGVlcCB3YWxrIFx1MjAxNCBCbGFua1Rva2VuIGFuZCBNYXRoUHJvbXB0IHNlY3JldHMgYXJlIHN0cmlwcGVkIGZyb21cbi8vICAgICAgZXZlcnkgb2JqZWN0IHRoZSBibG9jayBjYXJyaWVzLCBVTkNPTkRJVElPTkFMTFkgKG5vdCBnYXRlZCBvbiB0aGVcbi8vICAgICAgZW50cnkncyBgaW5saW5lQmxhbmtTZWNyZXRzYCBmbGFnKS4gRGVmZW5zZSBpbiBkZXB0aDogdGhlIHNjaGVtYSBhZG1pdHNcbi8vICAgICAgYSBwcm9tcHRlZCBtYXRoX2lubGluZSBpbnNpZGUgYW55IGNvbnRlbnQgYXJyYXkgXHUyMDE0IGEgcGFyYWdyYXBoLCBhIGhpbnQsXG4vLyAgICAgIGEgbGlzdCBpdGVtIFx1MjAxNCBhbmQgYSBkZWNsYXJhdGlvbiBtaXNzIHRoZXJlIG11c3Qgbm90IGJlY29tZSBhIHNpbGVudFxuLy8gICAgICBsZWFrLiBUaGUgZmxhZyBzdGF5cyBkZWNsYXJhdGl2ZSAoc2VlIHR5cGVzLnRzKS5cbi8vXG4vLyBXaGF0IHNhbml0aXplIGRvZXMgTk9UIGRvOiB0aGUgcGVyLXN0dWRlbnQgYHNlcnZlU2h1ZmZsZWRgIHJlb3JkZXIuIFRoYXQgaXNcbi8vIHNlcnZlLXRpbWUgd29yayAoc2h1ZmZsZS50cykgcHJlY2lzZWx5IHNvIFRISVMgb3V0cHV0IGlzIGNhY2hlYWJsZSBwZXJcbi8vIHZlcnNpb24gXHUyMDE0IHRoZSBvcmRlciBzZWNyZXQgY2FuJ3QgYmUgaGFuZGxlZCBieSBhIHN0cmlwLCBhbmQgdGhlIHNodWZmbGVcbi8vIGNhbid0IGJlIGhhbmRsZWQgYnkgdGhlIGNhY2hlLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHR5cGUgeyBBY3Rpdml0eURvY3VtZW50LCBCbG9jayB9IGZyb20gJ0BhY3Rpdml0eS9zY2hlbWEnO1xuaW1wb3J0IHtcbiAgQkxBTktfU0VDUkVUX0ZJRUxEUyxcbiAgTUFUSF9QUk9NUFRfU0VDUkVUX0ZJRUxEUyxcbiAgYmxvY2tSZWdpc3RyeSxcbiAgcmVnaXN0ZXJlZEJsb2NrVHlwZXMsXG59IGZyb20gJy4uL3JlZ2lzdHJ5L3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB0eXBlIHtcbiAgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCxcbiAgU2FuaXRpemVkQmxvY2ssXG59IGZyb20gJy4vc2FuaXRpemVkLXR5cGVzLmpzJztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNhbml0aXplciByZXZpc2lvbiBcdTIwMTQgdGhlIGR1cmFibGUgY2FjaGUncyBpbnZhbGlkYXRpb24ga2V5XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHJlYWQgY2FjaGUgc3RvcmVzIHNhbml0aXplZCBvdXRwdXQgcGVyICh2ZXJzaW9uX2lkLCBTQU5JVElaRVJfUkVWKS4gVGhlXG4vLyByZXYgaXMgQ09NUFVURUQgZnJvbSB0aGUgcmVnaXN0cnkncyBzYW5pdGl6ZSBkZWNsYXJhdGlvbnMgKyB0aGUgc2VjcmV0LWZpZWxkXG4vLyBsaXN0cywgc28gY2hhbmdpbmcgYW55IHNwZWMgYXV0b21hdGljYWxseSBvcnBoYW5zIGV2ZXJ5IHN0YWxlIGNhY2hlIHJvdyBcdTIwMTQgYVxuLy8gc2FuaXRpemVyIGZpeCB0aGF0IHJlcXVpcmVkIGEgaGFuZC1idW1wZWQgY29uc3RhbnQgdG8gdGFrZSBlZmZlY3QgaXMgZXhhY3RseVxuLy8gdGhlIGZvcmdldHRhYmxlLXN0ZXAgY2xhc3MgdGhpcyByZXBvIGRvY3VtZW50cyAoZ3JhcGgta2l0IG1hbmlmZXN0LCAwMDE1J3Ncbi8vIGdyYW50IHN0YW56YXMpLiBCdW1wIFNBTklUSVpFUl9BTEdPX1JFViBieSBoYW5kIE9OTFkgd2hlbiB0aGUgdHJhbnNmb3JtXG4vLyBsb2dpYyBpdHNlbGYgY2hhbmdlcyBpbiBhIHdheSB0aGUgZGVjbGFyYXRpb25zIGRvbid0IGNhcHR1cmUuXG5cbmV4cG9ydCBjb25zdCBTQU5JVElaRVJfQUxHT19SRVYgPSAxO1xuXG4vKiogRk5WLTFhIDMyLWJpdCwgaGV4LiBUaW55LCBkZXBlbmRlbmN5LWZyZWUsIHN0YWJsZSBhY3Jvc3MgSlMgcnVudGltZXMgXHUyMDE0XG4gKiB0aGlzIGlzIGEgY2FjaGUtYnVzdGluZyBmaW5nZXJwcmludCwgbm90IHNlY3VyaXR5IG1hdGVyaWFsLiAqL1xuZnVuY3Rpb24gZm52MWEodGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IGhhc2ggPSAweDgxMWM5ZGM1O1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRleHQubGVuZ3RoOyBpKyspIHtcbiAgICBoYXNoIF49IHRleHQuY2hhckNvZGVBdChpKTtcbiAgICBoYXNoID0gTWF0aC5pbXVsKGhhc2gsIDB4MDEwMDAxOTMpO1xuICB9XG4gIHJldHVybiAoaGFzaCA+Pj4gMCkudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDgsICcwJyk7XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVTYW5pdGl6ZXJSZXYoKTogc3RyaW5nIHtcbiAgY29uc3Qgc3BlY3MgPSBbLi4ucmVnaXN0ZXJlZEJsb2NrVHlwZXNdXG4gICAgLnNvcnQoKVxuICAgIC5tYXAoKHR5cGUpID0+IFt0eXBlLCBibG9ja1JlZ2lzdHJ5W3R5cGVdLnNhbml0aXplXSk7XG4gIGNvbnN0IG1hdGVyaWFsID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgIGFsZ286IFNBTklUSVpFUl9BTEdPX1JFVixcbiAgICBibGFuazogQkxBTktfU0VDUkVUX0ZJRUxEUyxcbiAgICBwcm9tcHQ6IE1BVEhfUFJPTVBUX1NFQ1JFVF9GSUVMRFMsXG4gICAgc3BlY3MsXG4gIH0pO1xuICByZXR1cm4gYCR7U0FOSVRJWkVSX0FMR09fUkVWfS0ke2ZudjFhKG1hdGVyaWFsKX1gO1xufVxuXG4vKiogVGhlIGNhY2hlIGtleSBjb21wb25lbnQuIFN0YWJsZSBmb3IgYSBnaXZlbiByZWdpc3RyeSArIGFsZ29yaXRobTsgY2hhbmdlc1xuICogd2hlbmV2ZXIgYW55IHNhbml0aXplIGRlY2xhcmF0aW9uIGNoYW5nZXMuICovXG5leHBvcnQgY29uc3QgU0FOSVRJWkVSX1JFViA9IGNvbXB1dGVTYW5pdGl6ZXJSZXYoKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzdHJpcCBncmFtbWFyIChleGFjdGx5IHdoYXQgdHlwZXMudHMgZG9jdW1lbnRzIFx1MjAxNCBub3RoaW5nIG1vcmUpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBhcHBseVN0cmlwUGF0aChibG9jazogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIHBhdGg6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBhcnJheUlkeCA9IHBhdGguaW5kZXhPZignW10uJyk7XG4gIGlmIChhcnJheUlkeCAhPT0gLTEpIHtcbiAgICAvLyAnZmllbGRbXS5zdWInIFx1MjAxNCBkZWxldGUgYHN1YmAgZnJvbSBldmVyeSBlbGVtZW50IG9mIGFycmF5IGBmaWVsZGAuXG4gICAgY29uc3QgZmllbGQgPSBwYXRoLnNsaWNlKDAsIGFycmF5SWR4KTtcbiAgICBjb25zdCBzdWIgPSBwYXRoLnNsaWNlKGFycmF5SWR4ICsgMyk7XG4gICAgY29uc3QgYXJyID0gYmxvY2tbZmllbGRdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgIGZvciAoY29uc3QgZWwgb2YgYXJyKSB7XG4gICAgICAgIGlmIChlbCAhPT0gbnVsbCAmJiB0eXBlb2YgZWwgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgZGVsZXRlIChlbCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilbc3ViXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgZG90SWR4ID0gcGF0aC5pbmRleE9mKCcuJyk7XG4gIGlmIChkb3RJZHggIT09IC0xKSB7XG4gICAgLy8gJ3BhcmVudC5maWVsZCcgXHUyMDE0IGRlbGV0ZSBgZmllbGRgIGZyb20gdGhlIG5lc3RlZCBvYmplY3Qgd2hlbiBwcmVzZW50LlxuICAgIC8vIFZhcmlhbnQtc2NvcGVkIGtleXMgc2ltcGx5IGRvbid0IG1hdGNoIG9uIG90aGVyIHZhcmlhbnRzLlxuICAgIGNvbnN0IHBhcmVudCA9IGJsb2NrW3BhdGguc2xpY2UoMCwgZG90SWR4KV07XG4gICAgaWYgKHBhcmVudCAhPT0gbnVsbCAmJiB0eXBlb2YgcGFyZW50ID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShwYXJlbnQpKSB7XG4gICAgICBkZWxldGUgKHBhcmVudCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilbcGF0aC5zbGljZShkb3RJZHggKyAxKV07XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuICAvLyAnZmllbGQnIFx1MjAxNCBkZWxldGUgdGhlIGJsb2NrJ3MgdG9wLWxldmVsIGZpZWxkLlxuICBkZWxldGUgYmxvY2tbcGF0aF07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBJbi1iYW5kIHNlY3JldHMgXHUyMDE0IHRoZSB1bmNvbmRpdGlvbmFsIGRlZXAgd2FsayAobGF5ZXIgMylcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IFBST01QVF9DQVJSSUVSX1RZUEVTID0gbmV3IFNldChbJ21hdGhfaW5saW5lJywgJ21hdGhfYmxvY2snXSk7XG5cbmZ1bmN0aW9uIHN0cmlwSW5CYW5kU2VjcmV0cyh2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBmb3IgKGNvbnN0IGVsIG9mIHZhbHVlKSBzdHJpcEluQmFuZFNlY3JldHMoZWwpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodmFsdWUgPT09IG51bGwgfHwgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JykgcmV0dXJuO1xuICBjb25zdCBvYmogPSB2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICBpZiAob2JqLnR5cGUgPT09ICdibGFuaycpIHtcbiAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIEJMQU5LX1NFQ1JFVF9GSUVMRFMpIGRlbGV0ZSBvYmpbZmllbGRdO1xuICB9XG4gIGlmIChcbiAgICB0eXBlb2Ygb2JqLnR5cGUgPT09ICdzdHJpbmcnICYmXG4gICAgUFJPTVBUX0NBUlJJRVJfVFlQRVMuaGFzKG9iai50eXBlKSAmJlxuICAgIEFycmF5LmlzQXJyYXkob2JqLnByb21wdHMpXG4gICkge1xuICAgIGZvciAoY29uc3QgcHJvbXB0IG9mIG9iai5wcm9tcHRzKSB7XG4gICAgICBpZiAocHJvbXB0ICE9PSBudWxsICYmIHR5cGVvZiBwcm9tcHQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgZmllbGQgb2YgTUFUSF9QUk9NUFRfU0VDUkVUX0ZJRUxEUykge1xuICAgICAgICAgIGRlbGV0ZSAocHJvbXB0IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVtmaWVsZF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMob2JqKSkgc3RyaXBJbkJhbmRTZWNyZXRzKG9ialtrZXldKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFBlci1ibG9jayBzYW5pdGl6ZVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIE11dGF0aW5nIGNvcmUgXHUyMDE0IG9wZXJhdGVzIG9uIGFuIGFscmVhZHktY2xvbmVkIGJsb2NrLiAqL1xuZnVuY3Rpb24gc2FuaXRpemVCbG9ja011dChibG9jazogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkIHtcbiAgY29uc3QgdHlwZSA9IGJsb2NrLnR5cGU7XG4gIGNvbnN0IGVudHJ5ID1cbiAgICB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgJiYgdHlwZSBpbiBibG9ja1JlZ2lzdHJ5XG4gICAgICA/IGJsb2NrUmVnaXN0cnlbdHlwZSBhcyBrZXlvZiB0eXBlb2YgYmxvY2tSZWdpc3RyeV1cbiAgICAgIDogdW5kZWZpbmVkO1xuICBpZiAoIWVudHJ5KSB7XG4gICAgLy8gQSB2YWxpZGF0ZWQgQWN0aXZpdHlEb2N1bWVudCBjYW4ndCBnZXQgaGVyZSAodGhlIHJlZ2lzdHJ5IGNvdmVyYWdlIGd1YXJkXG4gICAgLy8gcHJvdmVzIGV4YWN0IGFncmVlbWVudCB3aXRoIHRoZSBCbG9jayB1bmlvbikgXHUyMDE0IGJ1dCB0aGUgc2FuaXRpemVyIHNpdHMgb25cbiAgICAvLyB0aGUgd2lyZSBib3VuZGFyeSwgc28gYW4gdW5rbm93biB0eXBlIGZhaWxzIENMT1NFRCwgbmV2ZXIgcGFzc2VzIHRocm91Z2guXG4gICAgdGhyb3cgbmV3IEVycm9yKGBzYW5pdGl6ZTogdW5rbm93biBibG9jayB0eXBlICR7U3RyaW5nKHR5cGUpfWApO1xuICB9XG5cbiAgZm9yIChjb25zdCBwYXRoIG9mIGVudHJ5LnNhbml0aXplLnN0cmlwKSBhcHBseVN0cmlwUGF0aChibG9jaywgcGF0aCk7XG5cbiAgZm9yIChjb25zdCBmaWVsZCBvZiBlbnRyeS5zYW5pdGl6ZS5jaGlsZEJsb2NrcyA/PyBbXSkge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gYmxvY2tbZmllbGRdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSkge1xuICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikge1xuICAgICAgICBpZiAoY2hpbGQgIT09IG51bGwgJiYgdHlwZW9mIGNoaWxkID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHNhbml0aXplQmxvY2tNdXQoY2hpbGQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RyaXBJbkJhbmRTZWNyZXRzKGJsb2NrKTtcbn1cblxuLyoqIFNhbml0aXplIE9ORSBibG9jayAocHVyZSkuIEV4cG9zZWQgZm9yIHRlc3RzIGFuZCBwZXItYmxvY2sgdG9vbGluZzsgdGhlXG4gKiBkb2N1bWVudC1sZXZlbCBlbnRyeSBwb2ludCBiZWxvdyBpcyB3aGF0IHRoZSByZWFkIEFQSSB1c2VzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplQmxvY2soYmxvY2s6IEJsb2NrKTogU2FuaXRpemVkQmxvY2sge1xuICBjb25zdCBjbG9uZSA9IHN0cnVjdHVyZWRDbG9uZShibG9jaykgYXMgdW5rbm93biBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgc2FuaXRpemVCbG9ja011dChjbG9uZSk7XG4gIHJldHVybiBjbG9uZSBhcyB1bmtub3duIGFzIFNhbml0aXplZEJsb2NrO1xufVxuXG4vKipcbiAqIFNhbml0aXplIGEgZnVsbCB1cGdyYWRlZCBkb2N1bWVudCAocHVyZSkuIEV2ZXJ5IGJvZHkgYmxvY2sgZ29lcyB0aHJvdWdoIGl0c1xuICogcmVnaXN0cnkgZW50cnk7IHRoZSBpbi1iYW5kIGRlZXAgd2FsayB0aGVuIGNvdmVycyB0aGUgcmVzdCBvZiB0aGUgZG9jdW1lbnRcbiAqIChyZWZlcmVuY2UgcGFuZWwsIG1ldGEpIGFzIGRlZmVuc2UgaW4gZGVwdGggXHUyMDE0IHRob3NlIHN1cmZhY2VzIGNhcnJ5IG5vXG4gKiBkZWNsYXJlZCBhbnN3ZXIga2V5cywgYnV0IGEgcHJvbXB0ZWQgbWF0aCBub2RlIG11c3Qgbm90IGxlYWsgZnJvbSBhbnl3aGVyZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplQWN0aXZpdHlEb2N1bWVudChcbiAgZG9jOiBBY3Rpdml0eURvY3VtZW50LFxuKTogU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCB7XG4gIGNvbnN0IGNsb25lID0gc3RydWN0dXJlZENsb25lKGRvYykgYXMgdW5rbm93biBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiAmIHtcbiAgICBzZWN0aW9uczogQXJyYXk8e1xuICAgICAgcm93czogQXJyYXk8eyBjb2x1bW5zOiBBcnJheTx7IGJsb2NrczogdW5rbm93bltdIH0+IH0+O1xuICAgIH0+O1xuICB9O1xuICBmb3IgKGNvbnN0IHNlY3Rpb24gb2YgY2xvbmUuc2VjdGlvbnMpIHtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiBzZWN0aW9uLnJvd3MpIHtcbiAgICAgIGZvciAoY29uc3QgY29sdW1uIG9mIHJvdy5jb2x1bW5zKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgY29sdW1uLmJsb2Nrcykge1xuICAgICAgICAgIGlmIChibG9jayAhPT0gbnVsbCAmJiB0eXBlb2YgYmxvY2sgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBzYW5pdGl6ZUJsb2NrTXV0KGJsb2NrIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gRXZlcnl0aGluZyBvdXRzaWRlIHRoZSBib2R5IGJsb2NrcyAobWV0YSwgcmVmZXJlbmNlUGFuZWwpIFx1MjAxNCBpbi1iYW5kXG4gIC8vIHNlY3JldHMgb25seTsgdGhlcmUgYXJlIG5vIGRlY2xhcmVkIHN0cmlwcyBvdXRzaWRlIGJsb2Nrcy5cbiAgc3RyaXBJbkJhbmRTZWNyZXRzKGNsb25lKTtcbiAgcmV0dXJuIGNsb25lIGFzIHVua25vd24gYXMgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudDtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2FuaXRpemUvc2h1ZmZsZS50cyBcdTIwMTQgc2VydmUtdGltZSBkZXRlcm1pbmlzdGljIHNodWZmbGVzIChTMiwgU2FuaXRpemVTcGVjKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSByZWdpc3RyeSdzIGBzZXJ2ZVNodWZmbGVkYCBtYXJrcyBhcnJheXMgd2hvc2UgQVVUSE9SRUQgT1JERVIgaXMgdGhlXG4vLyBhbnN3ZXIga2V5IChvcmRlcmluZy5pdGVtcykgXHUyMDE0IGEgc3RyaXAgY2FuJ3QgaGVscCB3aGVuIHRoZSBvcmRlciBpdHNlbGYgaXNcbi8vIHRoZSBzZWNyZXQsIHNvIHRoZSBzZXJ2ZXIgc2VydmVzIGEgcGVybXV0YXRpb24uIFJlcXVpcmVtZW50cyBmcm9tIHRoZSBzcGVjOlxuLy9cbi8vICAgLSBEZXRlcm1pbmlzdGljIHBlciAodmVyc2lvbiwgc3R1ZGVudCk6IHRoZSByZWFkIEFQSSBzZWVkcyB3aXRoXG4vLyAgICAgYCR7dmVyc2lvbl9pZH06JHt1c2VyX2lkfWAsIHNvIGEgcmVsb2FkIChvciBhbiBIVFRQLWNhY2hlIG1pc3MpIHNlcnZlc1xuLy8gICAgIHRoZSBTQU1FIG9yZGVyIFx1MjAxNCB0aGUgc3R1ZGVudCdzIHNjcmVlbiBuZXZlciByZXNodWZmbGVzIHVuZGVyIHRoZW0uXG4vLyAgIC0gQXBwbGllZCBhdCBTRVJWRSB0aW1lLCBhZnRlciB0aGUgcGVyLXZlcnNpb24gY2FjaGU6IHRoZSBjYWNoZWQgYXJ0aWZhY3Rcbi8vICAgICBpcyBzdHVkZW50LWluZGVwZW5kZW50ICh0aGF0J3Mgd2hhdCBtYWtlcyBpdCBjYWNoZWFibGUpOyB0aGlzIHRyYW5zZm9ybVxuLy8gICAgIGlzIGNoZWFwIGVub3VnaCB0byBydW4gcGVyIHJlcXVlc3QuXG4vLyAgIC0gUGVyLWJsb2NrIHN1Yi1zZWVkaW5nOiB0d28gb3JkZXJpbmcgYmxvY2tzIGluIG9uZSBhY3Rpdml0eSBnZXRcbi8vICAgICBpbmRlcGVuZGVudCBwZXJtdXRhdGlvbnMgKGJsb2NrIGlkICsgZmllbGQgam9pbiB0aGUgc2VlZCkuXG4vL1xuLy8gR3JhZGluZyBpcyBvcmRlci1pbmRlcGVuZGVudCAocmVzcG9uc2VzIHJlZmVyZW5jZSBpdGVtIGlkcywgYW5kIHRoZSBzZXJ2ZXJcbi8vIGdyYWRlcyBhZ2FpbnN0IHRoZSBhdXRob3JlZCBrZXkpLCBzbyB0aGUgcGVybXV0YXRpb24gaXMgcHJlc2VudGF0aW9uLW9ubHkgXHUyMDE0XG4vLyBidXQgaXRzIHN0YWJpbGl0eSBpcyBhIFVYIGNvbnRyYWN0LCBub3QgYSBuaWNldHkuXG4vL1xuLy8gVGhlIFBSTkcgaXMgYSBzZWVkZWQgeG9yc2hpZnQtc3R5bGUgZ2VuZXJhdG9yIChtdWxiZXJyeTMyKSBvdmVyIGFuIEZOVi0xYVxuLy8gc2VlZCBcdTIwMTQgZGV0ZXJtaW5pc3RpYyBhY3Jvc3MgSlMgcnVudGltZXMsIGRlcGVuZGVuY3ktZnJlZS4gTm90IGNyeXB0b2dyYXBoaWMsXG4vLyBkZWxpYmVyYXRlbHk6IHRoZSB0aHJlYXQgbW9kZWwgaXMgXCJkb24ndCBzZXJ2ZSB0aGUgYXV0aG9yZWQgb3JkZXIsXCIgbm90XG4vLyBcIm1ha2UgdGhlIHBlcm11dGF0aW9uIHVucHJlZGljdGFibGUgdG8gYSBkZXRlcm1pbmVkIHN0dWRlbnQgd2l0aCBhIGRlYnVnZ2VyXCJcbi8vICh0aGUgYW5zd2VyIGtleSBuZXZlciBsZWF2ZXMgdGhlIHNlcnZlciBlaXRoZXIgd2F5KS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IGJsb2NrUmVnaXN0cnkgfSBmcm9tICcuLi9yZWdpc3RyeS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgdHlwZSB7IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQgfSBmcm9tICcuL3Nhbml0aXplZC10eXBlcy5qcyc7XG5cbi8qKiBGTlYtMWEgMzItYml0IG92ZXIgYSBzdHJpbmcgXHUyMTkyIHVpbnQzMiBzZWVkLiAqL1xuZnVuY3Rpb24gc2VlZEZyb20odGV4dDogc3RyaW5nKTogbnVtYmVyIHtcbiAgbGV0IGhhc2ggPSAweDgxMWM5ZGM1O1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRleHQubGVuZ3RoOyBpKyspIHtcbiAgICBoYXNoIF49IHRleHQuY2hhckNvZGVBdChpKTtcbiAgICBoYXNoID0gTWF0aC5pbXVsKGhhc2gsIDB4MDEwMDAxOTMpO1xuICB9XG4gIHJldHVybiBoYXNoID4+PiAwO1xufVxuXG4vKiogbXVsYmVycnkzMiBcdTIwMTQgdGlueSBkZXRlcm1pbmlzdGljIFBSTkcsIHVuaWZvcm0gZW5vdWdoIGZvciBhIHNodWZmbGUuICovXG5mdW5jdGlvbiBtdWxiZXJyeTMyKHNlZWQ6IG51bWJlcik6ICgpID0+IG51bWJlciB7XG4gIGxldCBhID0gc2VlZCA+Pj4gMDtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBhID0gKGEgKyAweDZkMmI3OWY1KSA+Pj4gMDtcbiAgICBsZXQgdCA9IGE7XG4gICAgdCA9IE1hdGguaW11bCh0IF4gKHQgPj4+IDE1KSwgdCB8IDEpO1xuICAgIHQgXj0gdCArIE1hdGguaW11bCh0IF4gKHQgPj4+IDcpLCB0IHwgNjEpO1xuICAgIHJldHVybiAoKHQgXiAodCA+Pj4gMTQpKSA+Pj4gMCkgLyA0Mjk0OTY3Mjk2O1xuICB9O1xufVxuXG4vKiogRmlzaGVyXHUyMDEzWWF0ZXMgd2l0aCBhIHNlZWRlZCBQUk5HIChwdXJlIFx1MjAxNCByZXR1cm5zIGEgbmV3IGFycmF5KS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWVkZWRTaHVmZmxlPFQ+KGl0ZW1zOiByZWFkb25seSBUW10sIHNlZWRLZXk6IHN0cmluZyk6IFRbXSB7XG4gIGNvbnN0IG91dCA9IFsuLi5pdGVtc107XG4gIGNvbnN0IG5leHQgPSBtdWxiZXJyeTMyKHNlZWRGcm9tKHNlZWRLZXkpKTtcbiAgZm9yIChsZXQgaSA9IG91dC5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgY29uc3QgaiA9IE1hdGguZmxvb3IobmV4dCgpICogKGkgKyAxKSk7XG4gICAgY29uc3QgYSA9IG91dFtpXSE7XG4gICAgb3V0W2ldID0gb3V0W2pdITtcbiAgICBvdXRbal0gPSBhO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQXBwbHkgZXZlcnkgcmVnaXN0cnktZGVjbGFyZWQgYHNlcnZlU2h1ZmZsZWRgIHJlb3JkZXIgdG8gYSBTQU5JVElaRURcbiAqIGRvY3VtZW50IChwdXJlIFx1MjAxNCB0aGUgaW5wdXQsIHR5cGljYWxseSB0aGUgc2hhcmVkIGNhY2hlZCBhcnRpZmFjdCwgaXMgbm90XG4gKiBtdXRhdGVkKS4gYHNlZWRLZXlgIGlzIHRoZSBwZXItKHZlcnNpb24sIHN0dWRlbnQpIGlkZW50aXR5OyBlYWNoIHNodWZmbGVkXG4gKiBhcnJheSBpcyBzdWItc2VlZGVkIHdpdGggdGhlIGJsb2NrIGlkIGFuZCBmaWVsZCBuYW1lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlTZXJ2ZVNodWZmbGVzKFxuICBkb2M6IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQsXG4gIHNlZWRLZXk6IHN0cmluZyxcbik6IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQge1xuICBjb25zdCBjbG9uZSA9IHN0cnVjdHVyZWRDbG9uZShkb2MpIGFzIHVua25vd24gYXMge1xuICAgIHNlY3Rpb25zOiBBcnJheTx7XG4gICAgICByb3dzOiBBcnJheTx7IGNvbHVtbnM6IEFycmF5PHsgYmxvY2tzOiB1bmtub3duW10gfT4gfT47XG4gICAgfT47XG4gIH07XG5cbiAgY29uc3Qgc2h1ZmZsZUJsb2NrID0gKGJsb2NrOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHR5cGUgPSBibG9jay50eXBlO1xuICAgIGNvbnN0IGVudHJ5ID1cbiAgICAgIHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyAmJiB0eXBlIGluIGJsb2NrUmVnaXN0cnlcbiAgICAgICAgPyBibG9ja1JlZ2lzdHJ5W3R5cGUgYXMga2V5b2YgdHlwZW9mIGJsb2NrUmVnaXN0cnldXG4gICAgICAgIDogdW5kZWZpbmVkO1xuICAgIGlmICghZW50cnkpIHJldHVybjsgLy8gc2FuaXRpemUgYWxyZWFkeSBmYWlsZWQgY2xvc2VkIG9uIHVua25vd24gdHlwZXNcbiAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGVudHJ5LnNhbml0aXplLnNlcnZlU2h1ZmZsZWQgPz8gW10pIHtcbiAgICAgIGNvbnN0IGFyciA9IGJsb2NrW2ZpZWxkXTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgICAgYmxvY2tbZmllbGRdID0gc2VlZGVkU2h1ZmZsZShcbiAgICAgICAgICBhcnIsXG4gICAgICAgICAgYCR7c2VlZEtleX06JHtTdHJpbmcoYmxvY2suaWQgPz8gJycpfToke2ZpZWxkfWAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFJlY3Vyc2Ugd2hlcmUgdGhlIHJlZ2lzdHJ5IGRlY2xhcmVzIG5lc3RlZCBibG9ja3MsIG1pcnJvcmluZyBzYW5pdGl6ZS5cbiAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGVudHJ5LnNhbml0aXplLmNoaWxkQmxvY2tzID8/IFtdKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IGJsb2NrW2ZpZWxkXTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgICAgICAgaWYgKGNoaWxkICE9PSBudWxsICYmIHR5cGVvZiBjaGlsZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHNodWZmbGVCbG9jayhjaGlsZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBjbG9uZS5zZWN0aW9ucykge1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHNlY3Rpb24ucm93cykge1xuICAgICAgZm9yIChjb25zdCBjb2x1bW4gb2Ygcm93LmNvbHVtbnMpIHtcbiAgICAgICAgZm9yIChjb25zdCBibG9jayBvZiBjb2x1bW4uYmxvY2tzKSB7XG4gICAgICAgICAgaWYgKGJsb2NrICE9PSBudWxsICYmIHR5cGVvZiBibG9jayA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHNodWZmbGVCbG9jayhibG9jayBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjbG9uZSBhcyB1bmtub3duIGFzIFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQ7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQU8sSUFBSTtBQUFBLENBQ1YsU0FBVUEsT0FBTTtBQUNiLEVBQUFBLE1BQUssY0FBYyxDQUFDLE1BQU07QUFBQSxFQUFFO0FBQzVCLFdBQVMsU0FBUyxNQUFNO0FBQUEsRUFBRTtBQUMxQixFQUFBQSxNQUFLLFdBQVc7QUFDaEIsV0FBUyxZQUFZLElBQUk7QUFDckIsVUFBTSxJQUFJLE1BQU07QUFBQSxFQUNwQjtBQUNBLEVBQUFBLE1BQUssY0FBYztBQUNuQixFQUFBQSxNQUFLLGNBQWMsQ0FBQyxVQUFVO0FBQzFCLFVBQU0sTUFBTSxDQUFDO0FBQ2IsZUFBVyxRQUFRLE9BQU87QUFDdEIsVUFBSSxJQUFJLElBQUk7QUFBQSxJQUNoQjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBQ0EsRUFBQUEsTUFBSyxxQkFBcUIsQ0FBQyxRQUFRO0FBQy9CLFVBQU0sWUFBWUEsTUFBSyxXQUFXLEdBQUcsRUFBRSxPQUFPLENBQUMsTUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsTUFBTSxRQUFRO0FBQ3BGLFVBQU0sV0FBVyxDQUFDO0FBQ2xCLGVBQVcsS0FBSyxXQUFXO0FBQ3ZCLGVBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQztBQUFBLElBQ3ZCO0FBQ0EsV0FBT0EsTUFBSyxhQUFhLFFBQVE7QUFBQSxFQUNyQztBQUNBLEVBQUFBLE1BQUssZUFBZSxDQUFDLFFBQVE7QUFDekIsV0FBT0EsTUFBSyxXQUFXLEdBQUcsRUFBRSxJQUFJLFNBQVUsR0FBRztBQUN6QyxhQUFPLElBQUksQ0FBQztBQUFBLElBQ2hCLENBQUM7QUFBQSxFQUNMO0FBQ0EsRUFBQUEsTUFBSyxhQUFhLE9BQU8sT0FBTyxTQUFTLGFBQ25DLENBQUMsUUFBUSxPQUFPLEtBQUssR0FBRyxJQUN4QixDQUFDLFdBQVc7QUFDVixVQUFNLE9BQU8sQ0FBQztBQUNkLGVBQVcsT0FBTyxRQUFRO0FBQ3RCLFVBQUksT0FBTyxVQUFVLGVBQWUsS0FBSyxRQUFRLEdBQUcsR0FBRztBQUNuRCxhQUFLLEtBQUssR0FBRztBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBQ0osRUFBQUEsTUFBSyxPQUFPLENBQUMsS0FBSyxZQUFZO0FBQzFCLGVBQVcsUUFBUSxLQUFLO0FBQ3BCLFVBQUksUUFBUSxJQUFJO0FBQ1osZUFBTztBQUFBLElBQ2Y7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUNBLEVBQUFBLE1BQUssWUFBWSxPQUFPLE9BQU8sY0FBYyxhQUN2QyxDQUFDLFFBQVEsT0FBTyxVQUFVLEdBQUcsSUFDN0IsQ0FBQyxRQUFRLE9BQU8sUUFBUSxZQUFZLE9BQU8sU0FBUyxHQUFHLEtBQUssS0FBSyxNQUFNLEdBQUcsTUFBTTtBQUN0RixXQUFTLFdBQVcsT0FBTyxZQUFZLE9BQU87QUFDMUMsV0FBTyxNQUFNLElBQUksQ0FBQyxRQUFTLE9BQU8sUUFBUSxXQUFXLElBQUksR0FBRyxNQUFNLEdBQUksRUFBRSxLQUFLLFNBQVM7QUFBQSxFQUMxRjtBQUNBLEVBQUFBLE1BQUssYUFBYTtBQUNsQixFQUFBQSxNQUFLLHdCQUF3QixDQUFDLEdBQUcsVUFBVTtBQUN2QyxRQUFJLE9BQU8sVUFBVSxVQUFVO0FBQzNCLGFBQU8sTUFBTSxTQUFTO0FBQUEsSUFDMUI7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUNKLEdBQUcsU0FBUyxPQUFPLENBQUMsRUFBRTtBQUNmLElBQUk7QUFBQSxDQUNWLFNBQVVDLGFBQVk7QUFDbkIsRUFBQUEsWUFBVyxjQUFjLENBQUMsT0FBTyxXQUFXO0FBQ3hDLFdBQU87QUFBQSxNQUNILEdBQUc7QUFBQSxNQUNILEdBQUc7QUFBQTtBQUFBLElBQ1A7QUFBQSxFQUNKO0FBQ0osR0FBRyxlQUFlLGFBQWEsQ0FBQyxFQUFFO0FBQzNCLElBQU0sZ0JBQWdCLEtBQUssWUFBWTtBQUFBLEVBQzFDO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNKLENBQUM7QUFDTSxJQUFNLGdCQUFnQixDQUFDLFNBQVM7QUFDbkMsUUFBTSxJQUFJLE9BQU87QUFDakIsVUFBUSxHQUFHO0FBQUEsSUFDUCxLQUFLO0FBQ0QsYUFBTyxjQUFjO0FBQUEsSUFDekIsS0FBSztBQUNELGFBQU8sY0FBYztBQUFBLElBQ3pCLEtBQUs7QUFDRCxhQUFPLE9BQU8sTUFBTSxJQUFJLElBQUksY0FBYyxNQUFNLGNBQWM7QUFBQSxJQUNsRSxLQUFLO0FBQ0QsYUFBTyxjQUFjO0FBQUEsSUFDekIsS0FBSztBQUNELGFBQU8sY0FBYztBQUFBLElBQ3pCLEtBQUs7QUFDRCxhQUFPLGNBQWM7QUFBQSxJQUN6QixLQUFLO0FBQ0QsYUFBTyxjQUFjO0FBQUEsSUFDekIsS0FBSztBQUNELFVBQUksTUFBTSxRQUFRLElBQUksR0FBRztBQUNyQixlQUFPLGNBQWM7QUFBQSxNQUN6QjtBQUNBLFVBQUksU0FBUyxNQUFNO0FBQ2YsZUFBTyxjQUFjO0FBQUEsTUFDekI7QUFDQSxVQUFJLEtBQUssUUFBUSxPQUFPLEtBQUssU0FBUyxjQUFjLEtBQUssU0FBUyxPQUFPLEtBQUssVUFBVSxZQUFZO0FBQ2hHLGVBQU8sY0FBYztBQUFBLE1BQ3pCO0FBQ0EsVUFBSSxPQUFPLFFBQVEsZUFBZSxnQkFBZ0IsS0FBSztBQUNuRCxlQUFPLGNBQWM7QUFBQSxNQUN6QjtBQUNBLFVBQUksT0FBTyxRQUFRLGVBQWUsZ0JBQWdCLEtBQUs7QUFDbkQsZUFBTyxjQUFjO0FBQUEsTUFDekI7QUFDQSxVQUFJLE9BQU8sU0FBUyxlQUFlLGdCQUFnQixNQUFNO0FBQ3JELGVBQU8sY0FBYztBQUFBLE1BQ3pCO0FBQ0EsYUFBTyxjQUFjO0FBQUEsSUFDekI7QUFDSSxhQUFPLGNBQWM7QUFBQSxFQUM3QjtBQUNKOzs7QUNuSU8sSUFBTSxlQUFlLEtBQUssWUFBWTtBQUFBLEVBQ3pDO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0osQ0FBQztBQUNNLElBQU0sZ0JBQWdCLENBQUMsUUFBUTtBQUNsQyxRQUFNLE9BQU8sS0FBSyxVQUFVLEtBQUssTUFBTSxDQUFDO0FBQ3hDLFNBQU8sS0FBSyxRQUFRLGVBQWUsS0FBSztBQUM1QztBQUNPLElBQU0sV0FBTixNQUFNLGtCQUFpQixNQUFNO0FBQUEsRUFDaEMsSUFBSSxTQUFTO0FBQ1QsV0FBTyxLQUFLO0FBQUEsRUFDaEI7QUFBQSxFQUNBLFlBQVksUUFBUTtBQUNoQixVQUFNO0FBQ04sU0FBSyxTQUFTLENBQUM7QUFDZixTQUFLLFdBQVcsQ0FBQyxRQUFRO0FBQ3JCLFdBQUssU0FBUyxDQUFDLEdBQUcsS0FBSyxRQUFRLEdBQUc7QUFBQSxJQUN0QztBQUNBLFNBQUssWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNO0FBQzVCLFdBQUssU0FBUyxDQUFDLEdBQUcsS0FBSyxRQUFRLEdBQUcsSUFBSTtBQUFBLElBQzFDO0FBQ0EsVUFBTSxjQUFjLFdBQVc7QUFDL0IsUUFBSSxPQUFPLGdCQUFnQjtBQUV2QixhQUFPLGVBQWUsTUFBTSxXQUFXO0FBQUEsSUFDM0MsT0FDSztBQUNELFdBQUssWUFBWTtBQUFBLElBQ3JCO0FBQ0EsU0FBSyxPQUFPO0FBQ1osU0FBSyxTQUFTO0FBQUEsRUFDbEI7QUFBQSxFQUNBLE9BQU8sU0FBUztBQUNaLFVBQU0sU0FBUyxXQUNYLFNBQVUsT0FBTztBQUNiLGFBQU8sTUFBTTtBQUFBLElBQ2pCO0FBQ0osVUFBTSxjQUFjLEVBQUUsU0FBUyxDQUFDLEVBQUU7QUFDbEMsVUFBTSxlQUFlLENBQUMsVUFBVTtBQUM1QixpQkFBVyxTQUFTLE1BQU0sUUFBUTtBQUM5QixZQUFJLE1BQU0sU0FBUyxpQkFBaUI7QUFDaEMsZ0JBQU0sWUFBWSxJQUFJLFlBQVk7QUFBQSxRQUN0QyxXQUNTLE1BQU0sU0FBUyx1QkFBdUI7QUFDM0MsdUJBQWEsTUFBTSxlQUFlO0FBQUEsUUFDdEMsV0FDUyxNQUFNLFNBQVMscUJBQXFCO0FBQ3pDLHVCQUFhLE1BQU0sY0FBYztBQUFBLFFBQ3JDLFdBQ1MsTUFBTSxLQUFLLFdBQVcsR0FBRztBQUM5QixzQkFBWSxRQUFRLEtBQUssT0FBTyxLQUFLLENBQUM7QUFBQSxRQUMxQyxPQUNLO0FBQ0QsY0FBSSxPQUFPO0FBQ1gsY0FBSSxJQUFJO0FBQ1IsaUJBQU8sSUFBSSxNQUFNLEtBQUssUUFBUTtBQUMxQixrQkFBTSxLQUFLLE1BQU0sS0FBSyxDQUFDO0FBQ3ZCLGtCQUFNLFdBQVcsTUFBTSxNQUFNLEtBQUssU0FBUztBQUMzQyxnQkFBSSxDQUFDLFVBQVU7QUFDWCxtQkFBSyxFQUFFLElBQUksS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsRUFBRTtBQUFBLFlBUXpDLE9BQ0s7QUFDRCxtQkFBSyxFQUFFLElBQUksS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsRUFBRTtBQUNyQyxtQkFBSyxFQUFFLEVBQUUsUUFBUSxLQUFLLE9BQU8sS0FBSyxDQUFDO0FBQUEsWUFDdkM7QUFDQSxtQkFBTyxLQUFLLEVBQUU7QUFDZDtBQUFBLFVBQ0o7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFDQSxpQkFBYSxJQUFJO0FBQ2pCLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxPQUFPLE9BQU8sT0FBTztBQUNqQixRQUFJLEVBQUUsaUJBQWlCLFlBQVc7QUFDOUIsWUFBTSxJQUFJLE1BQU0sbUJBQW1CLEtBQUssRUFBRTtBQUFBLElBQzlDO0FBQUEsRUFDSjtBQUFBLEVBQ0EsV0FBVztBQUNQLFdBQU8sS0FBSztBQUFBLEVBQ2hCO0FBQUEsRUFDQSxJQUFJLFVBQVU7QUFDVixXQUFPLEtBQUssVUFBVSxLQUFLLFFBQVEsS0FBSyx1QkFBdUIsQ0FBQztBQUFBLEVBQ3BFO0FBQUEsRUFDQSxJQUFJLFVBQVU7QUFDVixXQUFPLEtBQUssT0FBTyxXQUFXO0FBQUEsRUFDbEM7QUFBQSxFQUNBLFFBQVEsU0FBUyxDQUFDLFVBQVUsTUFBTSxTQUFTO0FBQ3ZDLFVBQU0sY0FBYyxDQUFDO0FBQ3JCLFVBQU0sYUFBYSxDQUFDO0FBQ3BCLGVBQVcsT0FBTyxLQUFLLFFBQVE7QUFDM0IsVUFBSSxJQUFJLEtBQUssU0FBUyxHQUFHO0FBQ3JCLGNBQU0sVUFBVSxJQUFJLEtBQUssQ0FBQztBQUMxQixvQkFBWSxPQUFPLElBQUksWUFBWSxPQUFPLEtBQUssQ0FBQztBQUNoRCxvQkFBWSxPQUFPLEVBQUUsS0FBSyxPQUFPLEdBQUcsQ0FBQztBQUFBLE1BQ3pDLE9BQ0s7QUFDRCxtQkFBVyxLQUFLLE9BQU8sR0FBRyxDQUFDO0FBQUEsTUFDL0I7QUFBQSxJQUNKO0FBQ0EsV0FBTyxFQUFFLFlBQVksWUFBWTtBQUFBLEVBQ3JDO0FBQUEsRUFDQSxJQUFJLGFBQWE7QUFDYixXQUFPLEtBQUssUUFBUTtBQUFBLEVBQ3hCO0FBQ0o7QUFDQSxTQUFTLFNBQVMsQ0FBQyxXQUFXO0FBQzFCLFFBQU0sUUFBUSxJQUFJLFNBQVMsTUFBTTtBQUNqQyxTQUFPO0FBQ1g7OztBQ2xJQSxJQUFNLFdBQVcsQ0FBQyxPQUFPLFNBQVM7QUFDOUIsTUFBSTtBQUNKLFVBQVEsTUFBTSxNQUFNO0FBQUEsSUFDaEIsS0FBSyxhQUFhO0FBQ2QsVUFBSSxNQUFNLGFBQWEsY0FBYyxXQUFXO0FBQzVDLGtCQUFVO0FBQUEsTUFDZCxPQUNLO0FBQ0Qsa0JBQVUsWUFBWSxNQUFNLFFBQVEsY0FBYyxNQUFNLFFBQVE7QUFBQSxNQUNwRTtBQUNBO0FBQUEsSUFDSixLQUFLLGFBQWE7QUFDZCxnQkFBVSxtQ0FBbUMsS0FBSyxVQUFVLE1BQU0sVUFBVSxLQUFLLHFCQUFxQixDQUFDO0FBQ3ZHO0FBQUEsSUFDSixLQUFLLGFBQWE7QUFDZCxnQkFBVSxrQ0FBa0MsS0FBSyxXQUFXLE1BQU0sTUFBTSxJQUFJLENBQUM7QUFDN0U7QUFBQSxJQUNKLEtBQUssYUFBYTtBQUNkLGdCQUFVO0FBQ1Y7QUFBQSxJQUNKLEtBQUssYUFBYTtBQUNkLGdCQUFVLHlDQUF5QyxLQUFLLFdBQVcsTUFBTSxPQUFPLENBQUM7QUFDakY7QUFBQSxJQUNKLEtBQUssYUFBYTtBQUNkLGdCQUFVLGdDQUFnQyxLQUFLLFdBQVcsTUFBTSxPQUFPLENBQUMsZUFBZSxNQUFNLFFBQVE7QUFDckc7QUFBQSxJQUNKLEtBQUssYUFBYTtBQUNkLGdCQUFVO0FBQ1Y7QUFBQSxJQUNKLEtBQUssYUFBYTtBQUNkLGdCQUFVO0FBQ1Y7QUFBQSxJQUNKLEtBQUssYUFBYTtBQUNkLGdCQUFVO0FBQ1Y7QUFBQSxJQUNKLEtBQUssYUFBYTtBQUNkLFVBQUksT0FBTyxNQUFNLGVBQWUsVUFBVTtBQUN0QyxZQUFJLGNBQWMsTUFBTSxZQUFZO0FBQ2hDLG9CQUFVLGdDQUFnQyxNQUFNLFdBQVcsUUFBUTtBQUNuRSxjQUFJLE9BQU8sTUFBTSxXQUFXLGFBQWEsVUFBVTtBQUMvQyxzQkFBVSxHQUFHLE9BQU8sc0RBQXNELE1BQU0sV0FBVyxRQUFRO0FBQUEsVUFDdkc7QUFBQSxRQUNKLFdBQ1MsZ0JBQWdCLE1BQU0sWUFBWTtBQUN2QyxvQkFBVSxtQ0FBbUMsTUFBTSxXQUFXLFVBQVU7QUFBQSxRQUM1RSxXQUNTLGNBQWMsTUFBTSxZQUFZO0FBQ3JDLG9CQUFVLGlDQUFpQyxNQUFNLFdBQVcsUUFBUTtBQUFBLFFBQ3hFLE9BQ0s7QUFDRCxlQUFLLFlBQVksTUFBTSxVQUFVO0FBQUEsUUFDckM7QUFBQSxNQUNKLFdBQ1MsTUFBTSxlQUFlLFNBQVM7QUFDbkMsa0JBQVUsV0FBVyxNQUFNLFVBQVU7QUFBQSxNQUN6QyxPQUNLO0FBQ0Qsa0JBQVU7QUFBQSxNQUNkO0FBQ0E7QUFBQSxJQUNKLEtBQUssYUFBYTtBQUNkLFVBQUksTUFBTSxTQUFTO0FBQ2Ysa0JBQVUsc0JBQXNCLE1BQU0sUUFBUSxZQUFZLE1BQU0sWUFBWSxhQUFhLFdBQVcsSUFBSSxNQUFNLE9BQU87QUFBQSxlQUNoSCxNQUFNLFNBQVM7QUFDcEIsa0JBQVUsdUJBQXVCLE1BQU0sUUFBUSxZQUFZLE1BQU0sWUFBWSxhQUFhLE1BQU0sSUFBSSxNQUFNLE9BQU87QUFBQSxlQUM1RyxNQUFNLFNBQVM7QUFDcEIsa0JBQVUsa0JBQWtCLE1BQU0sUUFBUSxzQkFBc0IsTUFBTSxZQUFZLDhCQUE4QixlQUFlLEdBQUcsTUFBTSxPQUFPO0FBQUEsZUFDMUksTUFBTSxTQUFTO0FBQ3BCLGtCQUFVLGtCQUFrQixNQUFNLFFBQVEsc0JBQXNCLE1BQU0sWUFBWSw4QkFBOEIsZUFBZSxHQUFHLE1BQU0sT0FBTztBQUFBLGVBQzFJLE1BQU0sU0FBUztBQUNwQixrQkFBVSxnQkFBZ0IsTUFBTSxRQUFRLHNCQUFzQixNQUFNLFlBQVksOEJBQThCLGVBQWUsR0FBRyxJQUFJLEtBQUssT0FBTyxNQUFNLE9BQU8sQ0FBQyxDQUFDO0FBQUE7QUFFL0osa0JBQVU7QUFDZDtBQUFBLElBQ0osS0FBSyxhQUFhO0FBQ2QsVUFBSSxNQUFNLFNBQVM7QUFDZixrQkFBVSxzQkFBc0IsTUFBTSxRQUFRLFlBQVksTUFBTSxZQUFZLFlBQVksV0FBVyxJQUFJLE1BQU0sT0FBTztBQUFBLGVBQy9HLE1BQU0sU0FBUztBQUNwQixrQkFBVSx1QkFBdUIsTUFBTSxRQUFRLFlBQVksTUFBTSxZQUFZLFlBQVksT0FBTyxJQUFJLE1BQU0sT0FBTztBQUFBLGVBQzVHLE1BQU0sU0FBUztBQUNwQixrQkFBVSxrQkFBa0IsTUFBTSxRQUFRLFlBQVksTUFBTSxZQUFZLDBCQUEwQixXQUFXLElBQUksTUFBTSxPQUFPO0FBQUEsZUFDekgsTUFBTSxTQUFTO0FBQ3BCLGtCQUFVLGtCQUFrQixNQUFNLFFBQVEsWUFBWSxNQUFNLFlBQVksMEJBQTBCLFdBQVcsSUFBSSxNQUFNLE9BQU87QUFBQSxlQUN6SCxNQUFNLFNBQVM7QUFDcEIsa0JBQVUsZ0JBQWdCLE1BQU0sUUFBUSxZQUFZLE1BQU0sWUFBWSw2QkFBNkIsY0FBYyxJQUFJLElBQUksS0FBSyxPQUFPLE1BQU0sT0FBTyxDQUFDLENBQUM7QUFBQTtBQUVwSixrQkFBVTtBQUNkO0FBQUEsSUFDSixLQUFLLGFBQWE7QUFDZCxnQkFBVTtBQUNWO0FBQUEsSUFDSixLQUFLLGFBQWE7QUFDZCxnQkFBVTtBQUNWO0FBQUEsSUFDSixLQUFLLGFBQWE7QUFDZCxnQkFBVSxnQ0FBZ0MsTUFBTSxVQUFVO0FBQzFEO0FBQUEsSUFDSixLQUFLLGFBQWE7QUFDZCxnQkFBVTtBQUNWO0FBQUEsSUFDSjtBQUNJLGdCQUFVLEtBQUs7QUFDZixXQUFLLFlBQVksS0FBSztBQUFBLEVBQzlCO0FBQ0EsU0FBTyxFQUFFLFFBQVE7QUFDckI7QUFDQSxJQUFPLGFBQVE7OztBQzNHZixJQUFJLG1CQUFtQjtBQUVoQixTQUFTLFlBQVksS0FBSztBQUM3QixxQkFBbUI7QUFDdkI7QUFDTyxTQUFTLGNBQWM7QUFDMUIsU0FBTztBQUNYOzs7QUNOTyxJQUFNLFlBQVksQ0FBQyxXQUFXO0FBQ2pDLFFBQU0sRUFBRSxNQUFNLE1BQU0sV0FBVyxVQUFVLElBQUk7QUFDN0MsUUFBTSxXQUFXLENBQUMsR0FBRyxNQUFNLEdBQUksVUFBVSxRQUFRLENBQUMsQ0FBRTtBQUNwRCxRQUFNLFlBQVk7QUFBQSxJQUNkLEdBQUc7QUFBQSxJQUNILE1BQU07QUFBQSxFQUNWO0FBQ0EsTUFBSSxVQUFVLFlBQVksUUFBVztBQUNqQyxXQUFPO0FBQUEsTUFDSCxHQUFHO0FBQUEsTUFDSCxNQUFNO0FBQUEsTUFDTixTQUFTLFVBQVU7QUFBQSxJQUN2QjtBQUFBLEVBQ0o7QUFDQSxNQUFJLGVBQWU7QUFDbkIsUUFBTSxPQUFPLFVBQ1IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFDakIsTUFBTSxFQUNOLFFBQVE7QUFDYixhQUFXLE9BQU8sTUFBTTtBQUNwQixtQkFBZSxJQUFJLFdBQVcsRUFBRSxNQUFNLGNBQWMsYUFBYSxDQUFDLEVBQUU7QUFBQSxFQUN4RTtBQUNBLFNBQU87QUFBQSxJQUNILEdBQUc7QUFBQSxJQUNILE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxFQUNiO0FBQ0o7QUFDTyxJQUFNLGFBQWEsQ0FBQztBQUNwQixTQUFTLGtCQUFrQixLQUFLLFdBQVc7QUFDOUMsUUFBTSxjQUFjLFlBQVk7QUFDaEMsUUFBTSxRQUFRLFVBQVU7QUFBQSxJQUNwQjtBQUFBLElBQ0EsTUFBTSxJQUFJO0FBQUEsSUFDVixNQUFNLElBQUk7QUFBQSxJQUNWLFdBQVc7QUFBQSxNQUNQLElBQUksT0FBTztBQUFBO0FBQUEsTUFDWCxJQUFJO0FBQUE7QUFBQSxNQUNKO0FBQUE7QUFBQSxNQUNBLGdCQUFnQixhQUFrQixTQUFZO0FBQUE7QUFBQSxJQUNsRCxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQUEsRUFDdkIsQ0FBQztBQUNELE1BQUksT0FBTyxPQUFPLEtBQUssS0FBSztBQUNoQztBQUNPLElBQU0sY0FBTixNQUFNLGFBQVk7QUFBQSxFQUNyQixjQUFjO0FBQ1YsU0FBSyxRQUFRO0FBQUEsRUFDakI7QUFBQSxFQUNBLFFBQVE7QUFDSixRQUFJLEtBQUssVUFBVTtBQUNmLFdBQUssUUFBUTtBQUFBLEVBQ3JCO0FBQUEsRUFDQSxRQUFRO0FBQ0osUUFBSSxLQUFLLFVBQVU7QUFDZixXQUFLLFFBQVE7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsT0FBTyxXQUFXLFFBQVEsU0FBUztBQUMvQixVQUFNLGFBQWEsQ0FBQztBQUNwQixlQUFXLEtBQUssU0FBUztBQUNyQixVQUFJLEVBQUUsV0FBVztBQUNiLGVBQU87QUFDWCxVQUFJLEVBQUUsV0FBVztBQUNiLGVBQU8sTUFBTTtBQUNqQixpQkFBVyxLQUFLLEVBQUUsS0FBSztBQUFBLElBQzNCO0FBQ0EsV0FBTyxFQUFFLFFBQVEsT0FBTyxPQUFPLE9BQU8sV0FBVztBQUFBLEVBQ3JEO0FBQUEsRUFDQSxhQUFhLGlCQUFpQixRQUFRLE9BQU87QUFDekMsVUFBTSxZQUFZLENBQUM7QUFDbkIsZUFBVyxRQUFRLE9BQU87QUFDdEIsWUFBTSxNQUFNLE1BQU0sS0FBSztBQUN2QixZQUFNLFFBQVEsTUFBTSxLQUFLO0FBQ3pCLGdCQUFVLEtBQUs7QUFBQSxRQUNYO0FBQUEsUUFDQTtBQUFBLE1BQ0osQ0FBQztBQUFBLElBQ0w7QUFDQSxXQUFPLGFBQVksZ0JBQWdCLFFBQVEsU0FBUztBQUFBLEVBQ3hEO0FBQUEsRUFDQSxPQUFPLGdCQUFnQixRQUFRLE9BQU87QUFDbEMsVUFBTSxjQUFjLENBQUM7QUFDckIsZUFBVyxRQUFRLE9BQU87QUFDdEIsWUFBTSxFQUFFLEtBQUssTUFBTSxJQUFJO0FBQ3ZCLFVBQUksSUFBSSxXQUFXO0FBQ2YsZUFBTztBQUNYLFVBQUksTUFBTSxXQUFXO0FBQ2pCLGVBQU87QUFDWCxVQUFJLElBQUksV0FBVztBQUNmLGVBQU8sTUFBTTtBQUNqQixVQUFJLE1BQU0sV0FBVztBQUNqQixlQUFPLE1BQU07QUFDakIsVUFBSSxJQUFJLFVBQVUsZ0JBQWdCLE9BQU8sTUFBTSxVQUFVLGVBQWUsS0FBSyxZQUFZO0FBQ3JGLG9CQUFZLElBQUksS0FBSyxJQUFJLE1BQU07QUFBQSxNQUNuQztBQUFBLElBQ0o7QUFDQSxXQUFPLEVBQUUsUUFBUSxPQUFPLE9BQU8sT0FBTyxZQUFZO0FBQUEsRUFDdEQ7QUFDSjtBQUNPLElBQU0sVUFBVSxPQUFPLE9BQU87QUFBQSxFQUNqQyxRQUFRO0FBQ1osQ0FBQztBQUNNLElBQU0sUUFBUSxDQUFDLFdBQVcsRUFBRSxRQUFRLFNBQVMsTUFBTTtBQUNuRCxJQUFNLEtBQUssQ0FBQyxXQUFXLEVBQUUsUUFBUSxTQUFTLE1BQU07QUFDaEQsSUFBTSxZQUFZLENBQUMsTUFBTSxFQUFFLFdBQVc7QUFDdEMsSUFBTSxVQUFVLENBQUMsTUFBTSxFQUFFLFdBQVc7QUFDcEMsSUFBTSxVQUFVLENBQUMsTUFBTSxFQUFFLFdBQVc7QUFDcEMsSUFBTSxVQUFVLENBQUMsTUFBTSxPQUFPLFlBQVksZUFBZSxhQUFhOzs7QUM1R3RFLElBQUk7QUFBQSxDQUNWLFNBQVVDLFlBQVc7QUFDbEIsRUFBQUEsV0FBVSxXQUFXLENBQUMsWUFBWSxPQUFPLFlBQVksV0FBVyxFQUFFLFFBQVEsSUFBSSxXQUFXLENBQUM7QUFFMUYsRUFBQUEsV0FBVSxXQUFXLENBQUMsWUFBWSxPQUFPLFlBQVksV0FBVyxVQUFVLFNBQVM7QUFDdkYsR0FBRyxjQUFjLFlBQVksQ0FBQyxFQUFFOzs7QUNBaEMsSUFBTSxxQkFBTixNQUF5QjtBQUFBLEVBQ3JCLFlBQVksUUFBUSxPQUFPLE1BQU0sS0FBSztBQUNsQyxTQUFLLGNBQWMsQ0FBQztBQUNwQixTQUFLLFNBQVM7QUFDZCxTQUFLLE9BQU87QUFDWixTQUFLLFFBQVE7QUFDYixTQUFLLE9BQU87QUFBQSxFQUNoQjtBQUFBLEVBQ0EsSUFBSSxPQUFPO0FBQ1AsUUFBSSxDQUFDLEtBQUssWUFBWSxRQUFRO0FBQzFCLFVBQUksTUFBTSxRQUFRLEtBQUssSUFBSSxHQUFHO0FBQzFCLGFBQUssWUFBWSxLQUFLLEdBQUcsS0FBSyxPQUFPLEdBQUcsS0FBSyxJQUFJO0FBQUEsTUFDckQsT0FDSztBQUNELGFBQUssWUFBWSxLQUFLLEdBQUcsS0FBSyxPQUFPLEtBQUssSUFBSTtBQUFBLE1BQ2xEO0FBQUEsSUFDSjtBQUNBLFdBQU8sS0FBSztBQUFBLEVBQ2hCO0FBQ0o7QUFDQSxJQUFNLGVBQWUsQ0FBQyxLQUFLLFdBQVc7QUFDbEMsTUFBSSxRQUFRLE1BQU0sR0FBRztBQUNqQixXQUFPLEVBQUUsU0FBUyxNQUFNLE1BQU0sT0FBTyxNQUFNO0FBQUEsRUFDL0MsT0FDSztBQUNELFFBQUksQ0FBQyxJQUFJLE9BQU8sT0FBTyxRQUFRO0FBQzNCLFlBQU0sSUFBSSxNQUFNLDJDQUEyQztBQUFBLElBQy9EO0FBQ0EsV0FBTztBQUFBLE1BQ0gsU0FBUztBQUFBLE1BQ1QsSUFBSSxRQUFRO0FBQ1IsWUFBSSxLQUFLO0FBQ0wsaUJBQU8sS0FBSztBQUNoQixjQUFNLFFBQVEsSUFBSSxTQUFTLElBQUksT0FBTyxNQUFNO0FBQzVDLGFBQUssU0FBUztBQUNkLGVBQU8sS0FBSztBQUFBLE1BQ2hCO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFDSjtBQUNBLFNBQVMsb0JBQW9CLFFBQVE7QUFDakMsTUFBSSxDQUFDO0FBQ0QsV0FBTyxDQUFDO0FBQ1osUUFBTSxFQUFFLFVBQUFDLFdBQVUsb0JBQW9CLGdCQUFnQixZQUFZLElBQUk7QUFDdEUsTUFBSUEsY0FBYSxzQkFBc0IsaUJBQWlCO0FBQ3BELFVBQU0sSUFBSSxNQUFNLDBGQUEwRjtBQUFBLEVBQzlHO0FBQ0EsTUFBSUE7QUFDQSxXQUFPLEVBQUUsVUFBVUEsV0FBVSxZQUFZO0FBQzdDLFFBQU0sWUFBWSxDQUFDLEtBQUssUUFBUTtBQUM1QixVQUFNLEVBQUUsUUFBUSxJQUFJO0FBQ3BCLFFBQUksSUFBSSxTQUFTLHNCQUFzQjtBQUNuQyxhQUFPLEVBQUUsU0FBUyxXQUFXLElBQUksYUFBYTtBQUFBLElBQ2xEO0FBQ0EsUUFBSSxPQUFPLElBQUksU0FBUyxhQUFhO0FBQ2pDLGFBQU8sRUFBRSxTQUFTLFdBQVcsa0JBQWtCLElBQUksYUFBYTtBQUFBLElBQ3BFO0FBQ0EsUUFBSSxJQUFJLFNBQVM7QUFDYixhQUFPLEVBQUUsU0FBUyxJQUFJLGFBQWE7QUFDdkMsV0FBTyxFQUFFLFNBQVMsV0FBVyxzQkFBc0IsSUFBSSxhQUFhO0FBQUEsRUFDeEU7QUFDQSxTQUFPLEVBQUUsVUFBVSxXQUFXLFlBQVk7QUFDOUM7QUFDTyxJQUFNLFVBQU4sTUFBYztBQUFBLEVBQ2pCLElBQUksY0FBYztBQUNkLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFBQSxFQUNBLFNBQVMsT0FBTztBQUNaLFdBQU8sY0FBYyxNQUFNLElBQUk7QUFBQSxFQUNuQztBQUFBLEVBQ0EsZ0JBQWdCLE9BQU8sS0FBSztBQUN4QixXQUFRLE9BQU87QUFBQSxNQUNYLFFBQVEsTUFBTSxPQUFPO0FBQUEsTUFDckIsTUFBTSxNQUFNO0FBQUEsTUFDWixZQUFZLGNBQWMsTUFBTSxJQUFJO0FBQUEsTUFDcEMsZ0JBQWdCLEtBQUssS0FBSztBQUFBLE1BQzFCLE1BQU0sTUFBTTtBQUFBLE1BQ1osUUFBUSxNQUFNO0FBQUEsSUFDbEI7QUFBQSxFQUNKO0FBQUEsRUFDQSxvQkFBb0IsT0FBTztBQUN2QixXQUFPO0FBQUEsTUFDSCxRQUFRLElBQUksWUFBWTtBQUFBLE1BQ3hCLEtBQUs7QUFBQSxRQUNELFFBQVEsTUFBTSxPQUFPO0FBQUEsUUFDckIsTUFBTSxNQUFNO0FBQUEsUUFDWixZQUFZLGNBQWMsTUFBTSxJQUFJO0FBQUEsUUFDcEMsZ0JBQWdCLEtBQUssS0FBSztBQUFBLFFBQzFCLE1BQU0sTUFBTTtBQUFBLFFBQ1osUUFBUSxNQUFNO0FBQUEsTUFDbEI7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0EsV0FBVyxPQUFPO0FBQ2QsVUFBTSxTQUFTLEtBQUssT0FBTyxLQUFLO0FBQ2hDLFFBQUksUUFBUSxNQUFNLEdBQUc7QUFDakIsWUFBTSxJQUFJLE1BQU0sd0NBQXdDO0FBQUEsSUFDNUQ7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsWUFBWSxPQUFPO0FBQ2YsVUFBTSxTQUFTLEtBQUssT0FBTyxLQUFLO0FBQ2hDLFdBQU8sUUFBUSxRQUFRLE1BQU07QUFBQSxFQUNqQztBQUFBLEVBQ0EsTUFBTSxNQUFNLFFBQVE7QUFDaEIsVUFBTSxTQUFTLEtBQUssVUFBVSxNQUFNLE1BQU07QUFDMUMsUUFBSSxPQUFPO0FBQ1AsYUFBTyxPQUFPO0FBQ2xCLFVBQU0sT0FBTztBQUFBLEVBQ2pCO0FBQUEsRUFDQSxVQUFVLE1BQU0sUUFBUTtBQUNwQixVQUFNLE1BQU07QUFBQSxNQUNSLFFBQVE7QUFBQSxRQUNKLFFBQVEsQ0FBQztBQUFBLFFBQ1QsT0FBTyxRQUFRLFNBQVM7QUFBQSxRQUN4QixvQkFBb0IsUUFBUTtBQUFBLE1BQ2hDO0FBQUEsTUFDQSxNQUFNLFFBQVEsUUFBUSxDQUFDO0FBQUEsTUFDdkIsZ0JBQWdCLEtBQUssS0FBSztBQUFBLE1BQzFCLFFBQVE7QUFBQSxNQUNSO0FBQUEsTUFDQSxZQUFZLGNBQWMsSUFBSTtBQUFBLElBQ2xDO0FBQ0EsVUFBTSxTQUFTLEtBQUssV0FBVyxFQUFFLE1BQU0sTUFBTSxJQUFJLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFDcEUsV0FBTyxhQUFhLEtBQUssTUFBTTtBQUFBLEVBQ25DO0FBQUEsRUFDQSxZQUFZLE1BQU07QUFDZCxVQUFNLE1BQU07QUFBQSxNQUNSLFFBQVE7QUFBQSxRQUNKLFFBQVEsQ0FBQztBQUFBLFFBQ1QsT0FBTyxDQUFDLENBQUMsS0FBSyxXQUFXLEVBQUU7QUFBQSxNQUMvQjtBQUFBLE1BQ0EsTUFBTSxDQUFDO0FBQUEsTUFDUCxnQkFBZ0IsS0FBSyxLQUFLO0FBQUEsTUFDMUIsUUFBUTtBQUFBLE1BQ1I7QUFBQSxNQUNBLFlBQVksY0FBYyxJQUFJO0FBQUEsSUFDbEM7QUFDQSxRQUFJLENBQUMsS0FBSyxXQUFXLEVBQUUsT0FBTztBQUMxQixVQUFJO0FBQ0EsY0FBTSxTQUFTLEtBQUssV0FBVyxFQUFFLE1BQU0sTUFBTSxDQUFDLEdBQUcsUUFBUSxJQUFJLENBQUM7QUFDOUQsZUFBTyxRQUFRLE1BQU0sSUFDZjtBQUFBLFVBQ0UsT0FBTyxPQUFPO0FBQUEsUUFDbEIsSUFDRTtBQUFBLFVBQ0UsUUFBUSxJQUFJLE9BQU87QUFBQSxRQUN2QjtBQUFBLE1BQ1IsU0FDTyxLQUFLO0FBQ1IsWUFBSSxLQUFLLFNBQVMsWUFBWSxHQUFHLFNBQVMsYUFBYSxHQUFHO0FBQ3RELGVBQUssV0FBVyxFQUFFLFFBQVE7QUFBQSxRQUM5QjtBQUNBLFlBQUksU0FBUztBQUFBLFVBQ1QsUUFBUSxDQUFDO0FBQUEsVUFDVCxPQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQ0EsV0FBTyxLQUFLLFlBQVksRUFBRSxNQUFNLE1BQU0sQ0FBQyxHQUFHLFFBQVEsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLFdBQVcsUUFBUSxNQUFNLElBQ2xGO0FBQUEsTUFDRSxPQUFPLE9BQU87QUFBQSxJQUNsQixJQUNFO0FBQUEsTUFDRSxRQUFRLElBQUksT0FBTztBQUFBLElBQ3ZCLENBQUM7QUFBQSxFQUNUO0FBQUEsRUFDQSxNQUFNLFdBQVcsTUFBTSxRQUFRO0FBQzNCLFVBQU0sU0FBUyxNQUFNLEtBQUssZUFBZSxNQUFNLE1BQU07QUFDckQsUUFBSSxPQUFPO0FBQ1AsYUFBTyxPQUFPO0FBQ2xCLFVBQU0sT0FBTztBQUFBLEVBQ2pCO0FBQUEsRUFDQSxNQUFNLGVBQWUsTUFBTSxRQUFRO0FBQy9CLFVBQU0sTUFBTTtBQUFBLE1BQ1IsUUFBUTtBQUFBLFFBQ0osUUFBUSxDQUFDO0FBQUEsUUFDVCxvQkFBb0IsUUFBUTtBQUFBLFFBQzVCLE9BQU87QUFBQSxNQUNYO0FBQUEsTUFDQSxNQUFNLFFBQVEsUUFBUSxDQUFDO0FBQUEsTUFDdkIsZ0JBQWdCLEtBQUssS0FBSztBQUFBLE1BQzFCLFFBQVE7QUFBQSxNQUNSO0FBQUEsTUFDQSxZQUFZLGNBQWMsSUFBSTtBQUFBLElBQ2xDO0FBQ0EsVUFBTSxtQkFBbUIsS0FBSyxPQUFPLEVBQUUsTUFBTSxNQUFNLElBQUksTUFBTSxRQUFRLElBQUksQ0FBQztBQUMxRSxVQUFNLFNBQVMsT0FBTyxRQUFRLGdCQUFnQixJQUFJLG1CQUFtQixRQUFRLFFBQVEsZ0JBQWdCO0FBQ3JHLFdBQU8sYUFBYSxLQUFLLE1BQU07QUFBQSxFQUNuQztBQUFBLEVBQ0EsT0FBTyxPQUFPLFNBQVM7QUFDbkIsVUFBTSxxQkFBcUIsQ0FBQyxRQUFRO0FBQ2hDLFVBQUksT0FBTyxZQUFZLFlBQVksT0FBTyxZQUFZLGFBQWE7QUFDL0QsZUFBTyxFQUFFLFFBQVE7QUFBQSxNQUNyQixXQUNTLE9BQU8sWUFBWSxZQUFZO0FBQ3BDLGVBQU8sUUFBUSxHQUFHO0FBQUEsTUFDdEIsT0FDSztBQUNELGVBQU87QUFBQSxNQUNYO0FBQUEsSUFDSjtBQUNBLFdBQU8sS0FBSyxZQUFZLENBQUMsS0FBSyxRQUFRO0FBQ2xDLFlBQU0sU0FBUyxNQUFNLEdBQUc7QUFDeEIsWUFBTSxXQUFXLE1BQU0sSUFBSSxTQUFTO0FBQUEsUUFDaEMsTUFBTSxhQUFhO0FBQUEsUUFDbkIsR0FBRyxtQkFBbUIsR0FBRztBQUFBLE1BQzdCLENBQUM7QUFDRCxVQUFJLE9BQU8sWUFBWSxlQUFlLGtCQUFrQixTQUFTO0FBQzdELGVBQU8sT0FBTyxLQUFLLENBQUMsU0FBUztBQUN6QixjQUFJLENBQUMsTUFBTTtBQUNQLHFCQUFTO0FBQ1QsbUJBQU87QUFBQSxVQUNYLE9BQ0s7QUFDRCxtQkFBTztBQUFBLFVBQ1g7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMO0FBQ0EsVUFBSSxDQUFDLFFBQVE7QUFDVCxpQkFBUztBQUNULGVBQU87QUFBQSxNQUNYLE9BQ0s7QUFDRCxlQUFPO0FBQUEsTUFDWDtBQUFBLElBQ0osQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFdBQVcsT0FBTyxnQkFBZ0I7QUFDOUIsV0FBTyxLQUFLLFlBQVksQ0FBQyxLQUFLLFFBQVE7QUFDbEMsVUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHO0FBQ2IsWUFBSSxTQUFTLE9BQU8sbUJBQW1CLGFBQWEsZUFBZSxLQUFLLEdBQUcsSUFBSSxjQUFjO0FBQzdGLGVBQU87QUFBQSxNQUNYLE9BQ0s7QUFDRCxlQUFPO0FBQUEsTUFDWDtBQUFBLElBQ0osQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFlBQVksWUFBWTtBQUNwQixXQUFPLElBQUksV0FBVztBQUFBLE1BQ2xCLFFBQVE7QUFBQSxNQUNSLFVBQVUsc0JBQXNCO0FBQUEsTUFDaEMsUUFBUSxFQUFFLE1BQU0sY0FBYyxXQUFXO0FBQUEsSUFDN0MsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFlBQVksWUFBWTtBQUNwQixXQUFPLEtBQUssWUFBWSxVQUFVO0FBQUEsRUFDdEM7QUFBQSxFQUNBLFlBQVksS0FBSztBQUViLFNBQUssTUFBTSxLQUFLO0FBQ2hCLFNBQUssT0FBTztBQUNaLFNBQUssUUFBUSxLQUFLLE1BQU0sS0FBSyxJQUFJO0FBQ2pDLFNBQUssWUFBWSxLQUFLLFVBQVUsS0FBSyxJQUFJO0FBQ3pDLFNBQUssYUFBYSxLQUFLLFdBQVcsS0FBSyxJQUFJO0FBQzNDLFNBQUssaUJBQWlCLEtBQUssZUFBZSxLQUFLLElBQUk7QUFDbkQsU0FBSyxNQUFNLEtBQUssSUFBSSxLQUFLLElBQUk7QUFDN0IsU0FBSyxTQUFTLEtBQUssT0FBTyxLQUFLLElBQUk7QUFDbkMsU0FBSyxhQUFhLEtBQUssV0FBVyxLQUFLLElBQUk7QUFDM0MsU0FBSyxjQUFjLEtBQUssWUFBWSxLQUFLLElBQUk7QUFDN0MsU0FBSyxXQUFXLEtBQUssU0FBUyxLQUFLLElBQUk7QUFDdkMsU0FBSyxXQUFXLEtBQUssU0FBUyxLQUFLLElBQUk7QUFDdkMsU0FBSyxVQUFVLEtBQUssUUFBUSxLQUFLLElBQUk7QUFDckMsU0FBSyxRQUFRLEtBQUssTUFBTSxLQUFLLElBQUk7QUFDakMsU0FBSyxVQUFVLEtBQUssUUFBUSxLQUFLLElBQUk7QUFDckMsU0FBSyxLQUFLLEtBQUssR0FBRyxLQUFLLElBQUk7QUFDM0IsU0FBSyxNQUFNLEtBQUssSUFBSSxLQUFLLElBQUk7QUFDN0IsU0FBSyxZQUFZLEtBQUssVUFBVSxLQUFLLElBQUk7QUFDekMsU0FBSyxRQUFRLEtBQUssTUFBTSxLQUFLLElBQUk7QUFDakMsU0FBSyxVQUFVLEtBQUssUUFBUSxLQUFLLElBQUk7QUFDckMsU0FBSyxRQUFRLEtBQUssTUFBTSxLQUFLLElBQUk7QUFDakMsU0FBSyxXQUFXLEtBQUssU0FBUyxLQUFLLElBQUk7QUFDdkMsU0FBSyxPQUFPLEtBQUssS0FBSyxLQUFLLElBQUk7QUFDL0IsU0FBSyxXQUFXLEtBQUssU0FBUyxLQUFLLElBQUk7QUFDdkMsU0FBSyxhQUFhLEtBQUssV0FBVyxLQUFLLElBQUk7QUFDM0MsU0FBSyxhQUFhLEtBQUssV0FBVyxLQUFLLElBQUk7QUFDM0MsU0FBSyxXQUFXLElBQUk7QUFBQSxNQUNoQixTQUFTO0FBQUEsTUFDVCxRQUFRO0FBQUEsTUFDUixVQUFVLENBQUMsU0FBUyxLQUFLLFdBQVcsRUFBRSxJQUFJO0FBQUEsSUFDOUM7QUFBQSxFQUNKO0FBQUEsRUFDQSxXQUFXO0FBQ1AsV0FBTyxZQUFZLE9BQU8sTUFBTSxLQUFLLElBQUk7QUFBQSxFQUM3QztBQUFBLEVBQ0EsV0FBVztBQUNQLFdBQU8sWUFBWSxPQUFPLE1BQU0sS0FBSyxJQUFJO0FBQUEsRUFDN0M7QUFBQSxFQUNBLFVBQVU7QUFDTixXQUFPLEtBQUssU0FBUyxFQUFFLFNBQVM7QUFBQSxFQUNwQztBQUFBLEVBQ0EsUUFBUTtBQUNKLFdBQU8sU0FBUyxPQUFPLElBQUk7QUFBQSxFQUMvQjtBQUFBLEVBQ0EsVUFBVTtBQUNOLFdBQU8sV0FBVyxPQUFPLE1BQU0sS0FBSyxJQUFJO0FBQUEsRUFDNUM7QUFBQSxFQUNBLEdBQUcsUUFBUTtBQUNQLFdBQU8sU0FBUyxPQUFPLENBQUMsTUFBTSxNQUFNLEdBQUcsS0FBSyxJQUFJO0FBQUEsRUFDcEQ7QUFBQSxFQUNBLElBQUksVUFBVTtBQUNWLFdBQU8sZ0JBQWdCLE9BQU8sTUFBTSxVQUFVLEtBQUssSUFBSTtBQUFBLEVBQzNEO0FBQUEsRUFDQSxVQUFVLFdBQVc7QUFDakIsV0FBTyxJQUFJLFdBQVc7QUFBQSxNQUNsQixHQUFHLG9CQUFvQixLQUFLLElBQUk7QUFBQSxNQUNoQyxRQUFRO0FBQUEsTUFDUixVQUFVLHNCQUFzQjtBQUFBLE1BQ2hDLFFBQVEsRUFBRSxNQUFNLGFBQWEsVUFBVTtBQUFBLElBQzNDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxRQUFRLEtBQUs7QUFDVCxVQUFNLG1CQUFtQixPQUFPLFFBQVEsYUFBYSxNQUFNLE1BQU07QUFDakUsV0FBTyxJQUFJLFdBQVc7QUFBQSxNQUNsQixHQUFHLG9CQUFvQixLQUFLLElBQUk7QUFBQSxNQUNoQyxXQUFXO0FBQUEsTUFDWCxjQUFjO0FBQUEsTUFDZCxVQUFVLHNCQUFzQjtBQUFBLElBQ3BDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxRQUFRO0FBQ0osV0FBTyxJQUFJLFdBQVc7QUFBQSxNQUNsQixVQUFVLHNCQUFzQjtBQUFBLE1BQ2hDLE1BQU07QUFBQSxNQUNOLEdBQUcsb0JBQW9CLEtBQUssSUFBSTtBQUFBLElBQ3BDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxNQUFNLEtBQUs7QUFDUCxVQUFNLGlCQUFpQixPQUFPLFFBQVEsYUFBYSxNQUFNLE1BQU07QUFDL0QsV0FBTyxJQUFJLFNBQVM7QUFBQSxNQUNoQixHQUFHLG9CQUFvQixLQUFLLElBQUk7QUFBQSxNQUNoQyxXQUFXO0FBQUEsTUFDWCxZQUFZO0FBQUEsTUFDWixVQUFVLHNCQUFzQjtBQUFBLElBQ3BDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxTQUFTLGFBQWE7QUFDbEIsVUFBTSxPQUFPLEtBQUs7QUFDbEIsV0FBTyxJQUFJLEtBQUs7QUFBQSxNQUNaLEdBQUcsS0FBSztBQUFBLE1BQ1I7QUFBQSxJQUNKLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxLQUFLLFFBQVE7QUFDVCxXQUFPLFlBQVksT0FBTyxNQUFNLE1BQU07QUFBQSxFQUMxQztBQUFBLEVBQ0EsV0FBVztBQUNQLFdBQU8sWUFBWSxPQUFPLElBQUk7QUFBQSxFQUNsQztBQUFBLEVBQ0EsYUFBYTtBQUNULFdBQU8sS0FBSyxVQUFVLE1BQVMsRUFBRTtBQUFBLEVBQ3JDO0FBQUEsRUFDQSxhQUFhO0FBQ1QsV0FBTyxLQUFLLFVBQVUsSUFBSSxFQUFFO0FBQUEsRUFDaEM7QUFDSjtBQUNBLElBQU0sWUFBWTtBQUNsQixJQUFNLGFBQWE7QUFDbkIsSUFBTSxZQUFZO0FBR2xCLElBQU0sWUFBWTtBQUNsQixJQUFNLGNBQWM7QUFDcEIsSUFBTSxXQUFXO0FBQ2pCLElBQU0sZ0JBQWdCO0FBYXRCLElBQU0sYUFBYTtBQUluQixJQUFNLGNBQWM7QUFDcEIsSUFBSTtBQUVKLElBQU0sWUFBWTtBQUNsQixJQUFNLGdCQUFnQjtBQUd0QixJQUFNLFlBQVk7QUFDbEIsSUFBTSxnQkFBZ0I7QUFFdEIsSUFBTSxjQUFjO0FBRXBCLElBQU0saUJBQWlCO0FBTXZCLElBQU0sa0JBQWtCO0FBQ3hCLElBQU0sWUFBWSxJQUFJLE9BQU8sSUFBSSxlQUFlLEdBQUc7QUFDbkQsU0FBUyxnQkFBZ0IsTUFBTTtBQUMzQixNQUFJLHFCQUFxQjtBQUN6QixNQUFJLEtBQUssV0FBVztBQUNoQix5QkFBcUIsR0FBRyxrQkFBa0IsVUFBVSxLQUFLLFNBQVM7QUFBQSxFQUN0RSxXQUNTLEtBQUssYUFBYSxNQUFNO0FBQzdCLHlCQUFxQixHQUFHLGtCQUFrQjtBQUFBLEVBQzlDO0FBQ0EsUUFBTSxvQkFBb0IsS0FBSyxZQUFZLE1BQU07QUFDakQsU0FBTyw4QkFBOEIsa0JBQWtCLElBQUksaUJBQWlCO0FBQ2hGO0FBQ0EsU0FBUyxVQUFVLE1BQU07QUFDckIsU0FBTyxJQUFJLE9BQU8sSUFBSSxnQkFBZ0IsSUFBSSxDQUFDLEdBQUc7QUFDbEQ7QUFFTyxTQUFTLGNBQWMsTUFBTTtBQUNoQyxNQUFJLFFBQVEsR0FBRyxlQUFlLElBQUksZ0JBQWdCLElBQUksQ0FBQztBQUN2RCxRQUFNLE9BQU8sQ0FBQztBQUNkLE9BQUssS0FBSyxLQUFLLFFBQVEsT0FBTyxHQUFHO0FBQ2pDLE1BQUksS0FBSztBQUNMLFNBQUssS0FBSyxzQkFBc0I7QUFDcEMsVUFBUSxHQUFHLEtBQUssSUFBSSxLQUFLLEtBQUssR0FBRyxDQUFDO0FBQ2xDLFNBQU8sSUFBSSxPQUFPLElBQUksS0FBSyxHQUFHO0FBQ2xDO0FBQ0EsU0FBUyxVQUFVLElBQUksU0FBUztBQUM1QixPQUFLLFlBQVksUUFBUSxDQUFDLFlBQVksVUFBVSxLQUFLLEVBQUUsR0FBRztBQUN0RCxXQUFPO0FBQUEsRUFDWDtBQUNBLE9BQUssWUFBWSxRQUFRLENBQUMsWUFBWSxVQUFVLEtBQUssRUFBRSxHQUFHO0FBQ3RELFdBQU87QUFBQSxFQUNYO0FBQ0EsU0FBTztBQUNYO0FBQ0EsU0FBUyxXQUFXLEtBQUssS0FBSztBQUMxQixNQUFJLENBQUMsU0FBUyxLQUFLLEdBQUc7QUFDbEIsV0FBTztBQUNYLE1BQUk7QUFDQSxVQUFNLENBQUMsTUFBTSxJQUFJLElBQUksTUFBTSxHQUFHO0FBQzlCLFFBQUksQ0FBQztBQUNELGFBQU87QUFFWCxVQUFNLFNBQVMsT0FDVixRQUFRLE1BQU0sR0FBRyxFQUNqQixRQUFRLE1BQU0sR0FBRyxFQUNqQixPQUFPLE9BQU8sVUFBVyxJQUFLLE9BQU8sU0FBUyxLQUFNLEdBQUksR0FBRztBQUNoRSxVQUFNLFVBQVUsS0FBSyxNQUFNLEtBQUssTUFBTSxDQUFDO0FBQ3ZDLFFBQUksT0FBTyxZQUFZLFlBQVksWUFBWTtBQUMzQyxhQUFPO0FBQ1gsUUFBSSxTQUFTLFdBQVcsU0FBUyxRQUFRO0FBQ3JDLGFBQU87QUFDWCxRQUFJLENBQUMsUUFBUTtBQUNULGFBQU87QUFDWCxRQUFJLE9BQU8sUUFBUSxRQUFRO0FBQ3ZCLGFBQU87QUFDWCxXQUFPO0FBQUEsRUFDWCxRQUNNO0FBQ0YsV0FBTztBQUFBLEVBQ1g7QUFDSjtBQUNBLFNBQVMsWUFBWSxJQUFJLFNBQVM7QUFDOUIsT0FBSyxZQUFZLFFBQVEsQ0FBQyxZQUFZLGNBQWMsS0FBSyxFQUFFLEdBQUc7QUFDMUQsV0FBTztBQUFBLEVBQ1g7QUFDQSxPQUFLLFlBQVksUUFBUSxDQUFDLFlBQVksY0FBYyxLQUFLLEVBQUUsR0FBRztBQUMxRCxXQUFPO0FBQUEsRUFDWDtBQUNBLFNBQU87QUFDWDtBQUNPLElBQU0sWUFBTixNQUFNLG1CQUFrQixRQUFRO0FBQUEsRUFDbkMsT0FBTyxPQUFPO0FBQ1YsUUFBSSxLQUFLLEtBQUssUUFBUTtBQUNsQixZQUFNLE9BQU8sT0FBTyxNQUFNLElBQUk7QUFBQSxJQUNsQztBQUNBLFVBQU0sYUFBYSxLQUFLLFNBQVMsS0FBSztBQUN0QyxRQUFJLGVBQWUsY0FBYyxRQUFRO0FBQ3JDLFlBQU1DLE9BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0Qyx3QkFBa0JBLE1BQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVQSxLQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsVUFBTSxTQUFTLElBQUksWUFBWTtBQUMvQixRQUFJLE1BQU07QUFDVixlQUFXLFNBQVMsS0FBSyxLQUFLLFFBQVE7QUFDbEMsVUFBSSxNQUFNLFNBQVMsT0FBTztBQUN0QixZQUFJLE1BQU0sS0FBSyxTQUFTLE1BQU0sT0FBTztBQUNqQyxnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixNQUFNLGFBQWE7QUFBQSxZQUNuQixTQUFTLE1BQU07QUFBQSxZQUNmLE1BQU07QUFBQSxZQUNOLFdBQVc7QUFBQSxZQUNYLE9BQU87QUFBQSxZQUNQLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLE9BQU87QUFDM0IsWUFBSSxNQUFNLEtBQUssU0FBUyxNQUFNLE9BQU87QUFDakMsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsTUFBTSxhQUFhO0FBQUEsWUFDbkIsU0FBUyxNQUFNO0FBQUEsWUFDZixNQUFNO0FBQUEsWUFDTixXQUFXO0FBQUEsWUFDWCxPQUFPO0FBQUEsWUFDUCxTQUFTLE1BQU07QUFBQSxVQUNuQixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixXQUNTLE1BQU0sU0FBUyxVQUFVO0FBQzlCLGNBQU0sU0FBUyxNQUFNLEtBQUssU0FBUyxNQUFNO0FBQ3pDLGNBQU0sV0FBVyxNQUFNLEtBQUssU0FBUyxNQUFNO0FBQzNDLFlBQUksVUFBVSxVQUFVO0FBQ3BCLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyxjQUFJLFFBQVE7QUFDUiw4QkFBa0IsS0FBSztBQUFBLGNBQ25CLE1BQU0sYUFBYTtBQUFBLGNBQ25CLFNBQVMsTUFBTTtBQUFBLGNBQ2YsTUFBTTtBQUFBLGNBQ04sV0FBVztBQUFBLGNBQ1gsT0FBTztBQUFBLGNBQ1AsU0FBUyxNQUFNO0FBQUEsWUFDbkIsQ0FBQztBQUFBLFVBQ0wsV0FDUyxVQUFVO0FBQ2YsOEJBQWtCLEtBQUs7QUFBQSxjQUNuQixNQUFNLGFBQWE7QUFBQSxjQUNuQixTQUFTLE1BQU07QUFBQSxjQUNmLE1BQU07QUFBQSxjQUNOLFdBQVc7QUFBQSxjQUNYLE9BQU87QUFBQSxjQUNQLFNBQVMsTUFBTTtBQUFBLFlBQ25CLENBQUM7QUFBQSxVQUNMO0FBQ0EsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixXQUNTLE1BQU0sU0FBUyxTQUFTO0FBQzdCLFlBQUksQ0FBQyxXQUFXLEtBQUssTUFBTSxJQUFJLEdBQUc7QUFDOUIsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsWUFBWTtBQUFBLFlBQ1osTUFBTSxhQUFhO0FBQUEsWUFDbkIsU0FBUyxNQUFNO0FBQUEsVUFDbkIsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osV0FDUyxNQUFNLFNBQVMsU0FBUztBQUM3QixZQUFJLENBQUMsWUFBWTtBQUNiLHVCQUFhLElBQUksT0FBTyxhQUFhLEdBQUc7QUFBQSxRQUM1QztBQUNBLFlBQUksQ0FBQyxXQUFXLEtBQUssTUFBTSxJQUFJLEdBQUc7QUFDOUIsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsWUFBWTtBQUFBLFlBQ1osTUFBTSxhQUFhO0FBQUEsWUFDbkIsU0FBUyxNQUFNO0FBQUEsVUFDbkIsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osV0FDUyxNQUFNLFNBQVMsUUFBUTtBQUM1QixZQUFJLENBQUMsVUFBVSxLQUFLLE1BQU0sSUFBSSxHQUFHO0FBQzdCLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLFlBQVk7QUFBQSxZQUNaLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLFVBQVU7QUFDOUIsWUFBSSxDQUFDLFlBQVksS0FBSyxNQUFNLElBQUksR0FBRztBQUMvQixnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixZQUFZO0FBQUEsWUFDWixNQUFNLGFBQWE7QUFBQSxZQUNuQixTQUFTLE1BQU07QUFBQSxVQUNuQixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixXQUNTLE1BQU0sU0FBUyxRQUFRO0FBQzVCLFlBQUksQ0FBQyxVQUFVLEtBQUssTUFBTSxJQUFJLEdBQUc7QUFDN0IsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsWUFBWTtBQUFBLFlBQ1osTUFBTSxhQUFhO0FBQUEsWUFDbkIsU0FBUyxNQUFNO0FBQUEsVUFDbkIsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osV0FDUyxNQUFNLFNBQVMsU0FBUztBQUM3QixZQUFJLENBQUMsV0FBVyxLQUFLLE1BQU0sSUFBSSxHQUFHO0FBQzlCLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLFlBQVk7QUFBQSxZQUNaLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLFFBQVE7QUFDNUIsWUFBSSxDQUFDLFVBQVUsS0FBSyxNQUFNLElBQUksR0FBRztBQUM3QixnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixZQUFZO0FBQUEsWUFDWixNQUFNLGFBQWE7QUFBQSxZQUNuQixTQUFTLE1BQU07QUFBQSxVQUNuQixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixXQUNTLE1BQU0sU0FBUyxPQUFPO0FBQzNCLFlBQUk7QUFDQSxjQUFJLElBQUksTUFBTSxJQUFJO0FBQUEsUUFDdEIsUUFDTTtBQUNGLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLFlBQVk7QUFBQSxZQUNaLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLFNBQVM7QUFDN0IsY0FBTSxNQUFNLFlBQVk7QUFDeEIsY0FBTSxhQUFhLE1BQU0sTUFBTSxLQUFLLE1BQU0sSUFBSTtBQUM5QyxZQUFJLENBQUMsWUFBWTtBQUNiLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLFlBQVk7QUFBQSxZQUNaLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLFFBQVE7QUFDNUIsY0FBTSxPQUFPLE1BQU0sS0FBSyxLQUFLO0FBQUEsTUFDakMsV0FDUyxNQUFNLFNBQVMsWUFBWTtBQUNoQyxZQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsTUFBTSxPQUFPLE1BQU0sUUFBUSxHQUFHO0FBQ25ELGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFlBQVksRUFBRSxVQUFVLE1BQU0sT0FBTyxVQUFVLE1BQU0sU0FBUztBQUFBLFlBQzlELFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLGVBQWU7QUFDbkMsY0FBTSxPQUFPLE1BQU0sS0FBSyxZQUFZO0FBQUEsTUFDeEMsV0FDUyxNQUFNLFNBQVMsZUFBZTtBQUNuQyxjQUFNLE9BQU8sTUFBTSxLQUFLLFlBQVk7QUFBQSxNQUN4QyxXQUNTLE1BQU0sU0FBUyxjQUFjO0FBQ2xDLFlBQUksQ0FBQyxNQUFNLEtBQUssV0FBVyxNQUFNLEtBQUssR0FBRztBQUNyQyxnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixNQUFNLGFBQWE7QUFBQSxZQUNuQixZQUFZLEVBQUUsWUFBWSxNQUFNLE1BQU07QUFBQSxZQUN0QyxTQUFTLE1BQU07QUFBQSxVQUNuQixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixXQUNTLE1BQU0sU0FBUyxZQUFZO0FBQ2hDLFlBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxNQUFNLEtBQUssR0FBRztBQUNuQyxnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixNQUFNLGFBQWE7QUFBQSxZQUNuQixZQUFZLEVBQUUsVUFBVSxNQUFNLE1BQU07QUFBQSxZQUNwQyxTQUFTLE1BQU07QUFBQSxVQUNuQixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixXQUNTLE1BQU0sU0FBUyxZQUFZO0FBQ2hDLGNBQU0sUUFBUSxjQUFjLEtBQUs7QUFDakMsWUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNLElBQUksR0FBRztBQUN6QixnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixNQUFNLGFBQWE7QUFBQSxZQUNuQixZQUFZO0FBQUEsWUFDWixTQUFTLE1BQU07QUFBQSxVQUNuQixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixXQUNTLE1BQU0sU0FBUyxRQUFRO0FBQzVCLGNBQU0sUUFBUTtBQUNkLFlBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxJQUFJLEdBQUc7QUFDekIsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsTUFBTSxhQUFhO0FBQUEsWUFDbkIsWUFBWTtBQUFBLFlBQ1osU0FBUyxNQUFNO0FBQUEsVUFDbkIsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osV0FDUyxNQUFNLFNBQVMsUUFBUTtBQUM1QixjQUFNLFFBQVEsVUFBVSxLQUFLO0FBQzdCLFlBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxJQUFJLEdBQUc7QUFDekIsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsTUFBTSxhQUFhO0FBQUEsWUFDbkIsWUFBWTtBQUFBLFlBQ1osU0FBUyxNQUFNO0FBQUEsVUFDbkIsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osV0FDUyxNQUFNLFNBQVMsWUFBWTtBQUNoQyxZQUFJLENBQUMsY0FBYyxLQUFLLE1BQU0sSUFBSSxHQUFHO0FBQ2pDLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLFlBQVk7QUFBQSxZQUNaLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLE1BQU07QUFDMUIsWUFBSSxDQUFDLFVBQVUsTUFBTSxNQUFNLE1BQU0sT0FBTyxHQUFHO0FBQ3ZDLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLFlBQVk7QUFBQSxZQUNaLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLE9BQU87QUFDM0IsWUFBSSxDQUFDLFdBQVcsTUFBTSxNQUFNLE1BQU0sR0FBRyxHQUFHO0FBQ3BDLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLFlBQVk7QUFBQSxZQUNaLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLFFBQVE7QUFDNUIsWUFBSSxDQUFDLFlBQVksTUFBTSxNQUFNLE1BQU0sT0FBTyxHQUFHO0FBQ3pDLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLFlBQVk7QUFBQSxZQUNaLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLFVBQVU7QUFDOUIsWUFBSSxDQUFDLFlBQVksS0FBSyxNQUFNLElBQUksR0FBRztBQUMvQixnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixZQUFZO0FBQUEsWUFDWixNQUFNLGFBQWE7QUFBQSxZQUNuQixTQUFTLE1BQU07QUFBQSxVQUNuQixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixXQUNTLE1BQU0sU0FBUyxhQUFhO0FBQ2pDLFlBQUksQ0FBQyxlQUFlLEtBQUssTUFBTSxJQUFJLEdBQUc7QUFDbEMsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsWUFBWTtBQUFBLFlBQ1osTUFBTSxhQUFhO0FBQUEsWUFDbkIsU0FBUyxNQUFNO0FBQUEsVUFDbkIsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osT0FDSztBQUNELGFBQUssWUFBWSxLQUFLO0FBQUEsTUFDMUI7QUFBQSxJQUNKO0FBQ0EsV0FBTyxFQUFFLFFBQVEsT0FBTyxPQUFPLE9BQU8sTUFBTSxLQUFLO0FBQUEsRUFDckQ7QUFBQSxFQUNBLE9BQU8sT0FBTyxZQUFZLFNBQVM7QUFDL0IsV0FBTyxLQUFLLFdBQVcsQ0FBQyxTQUFTLE1BQU0sS0FBSyxJQUFJLEdBQUc7QUFBQSxNQUMvQztBQUFBLE1BQ0EsTUFBTSxhQUFhO0FBQUEsTUFDbkIsR0FBRyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ2pDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxVQUFVLE9BQU87QUFDYixXQUFPLElBQUksV0FBVTtBQUFBLE1BQ2pCLEdBQUcsS0FBSztBQUFBLE1BQ1IsUUFBUSxDQUFDLEdBQUcsS0FBSyxLQUFLLFFBQVEsS0FBSztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxNQUFNLFNBQVM7QUFDWCxXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sU0FBUyxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQzNFO0FBQUEsRUFDQSxJQUFJLFNBQVM7QUFDVCxXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sT0FBTyxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQ3pFO0FBQUEsRUFDQSxNQUFNLFNBQVM7QUFDWCxXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sU0FBUyxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQzNFO0FBQUEsRUFDQSxLQUFLLFNBQVM7QUFDVixXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sUUFBUSxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQzFFO0FBQUEsRUFDQSxPQUFPLFNBQVM7QUFDWixXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sVUFBVSxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQzVFO0FBQUEsRUFDQSxLQUFLLFNBQVM7QUFDVixXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sUUFBUSxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQzFFO0FBQUEsRUFDQSxNQUFNLFNBQVM7QUFDWCxXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sU0FBUyxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQzNFO0FBQUEsRUFDQSxLQUFLLFNBQVM7QUFDVixXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sUUFBUSxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQzFFO0FBQUEsRUFDQSxPQUFPLFNBQVM7QUFDWixXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sVUFBVSxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQzVFO0FBQUEsRUFDQSxVQUFVLFNBQVM7QUFFZixXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOLEdBQUcsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUNqQyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsSUFBSSxTQUFTO0FBQ1QsV0FBTyxLQUFLLFVBQVUsRUFBRSxNQUFNLE9BQU8sR0FBRyxVQUFVLFNBQVMsT0FBTyxFQUFFLENBQUM7QUFBQSxFQUN6RTtBQUFBLEVBQ0EsR0FBRyxTQUFTO0FBQ1IsV0FBTyxLQUFLLFVBQVUsRUFBRSxNQUFNLE1BQU0sR0FBRyxVQUFVLFNBQVMsT0FBTyxFQUFFLENBQUM7QUFBQSxFQUN4RTtBQUFBLEVBQ0EsS0FBSyxTQUFTO0FBQ1YsV0FBTyxLQUFLLFVBQVUsRUFBRSxNQUFNLFFBQVEsR0FBRyxVQUFVLFNBQVMsT0FBTyxFQUFFLENBQUM7QUFBQSxFQUMxRTtBQUFBLEVBQ0EsU0FBUyxTQUFTO0FBQ2QsUUFBSSxPQUFPLFlBQVksVUFBVTtBQUM3QixhQUFPLEtBQUssVUFBVTtBQUFBLFFBQ2xCLE1BQU07QUFBQSxRQUNOLFdBQVc7QUFBQSxRQUNYLFFBQVE7QUFBQSxRQUNSLE9BQU87QUFBQSxRQUNQLFNBQVM7QUFBQSxNQUNiLENBQUM7QUFBQSxJQUNMO0FBQ0EsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixXQUFXLE9BQU8sU0FBUyxjQUFjLGNBQWMsT0FBTyxTQUFTO0FBQUEsTUFDdkUsUUFBUSxTQUFTLFVBQVU7QUFBQSxNQUMzQixPQUFPLFNBQVMsU0FBUztBQUFBLE1BQ3pCLEdBQUcsVUFBVSxTQUFTLFNBQVMsT0FBTztBQUFBLElBQzFDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxLQUFLLFNBQVM7QUFDVixXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sUUFBUSxRQUFRLENBQUM7QUFBQSxFQUNuRDtBQUFBLEVBQ0EsS0FBSyxTQUFTO0FBQ1YsUUFBSSxPQUFPLFlBQVksVUFBVTtBQUM3QixhQUFPLEtBQUssVUFBVTtBQUFBLFFBQ2xCLE1BQU07QUFBQSxRQUNOLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxNQUNiLENBQUM7QUFBQSxJQUNMO0FBQ0EsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixXQUFXLE9BQU8sU0FBUyxjQUFjLGNBQWMsT0FBTyxTQUFTO0FBQUEsTUFDdkUsR0FBRyxVQUFVLFNBQVMsU0FBUyxPQUFPO0FBQUEsSUFDMUMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFNBQVMsU0FBUztBQUNkLFdBQU8sS0FBSyxVQUFVLEVBQUUsTUFBTSxZQUFZLEdBQUcsVUFBVSxTQUFTLE9BQU8sRUFBRSxDQUFDO0FBQUEsRUFDOUU7QUFBQSxFQUNBLE1BQU0sT0FBTyxTQUFTO0FBQ2xCLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ047QUFBQSxNQUNBLEdBQUcsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUNqQyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsU0FBUyxPQUFPLFNBQVM7QUFDckIsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTjtBQUFBLE1BQ0EsVUFBVSxTQUFTO0FBQUEsTUFDbkIsR0FBRyxVQUFVLFNBQVMsU0FBUyxPQUFPO0FBQUEsSUFDMUMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFdBQVcsT0FBTyxTQUFTO0FBQ3ZCLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ047QUFBQSxNQUNBLEdBQUcsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUNqQyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsU0FBUyxPQUFPLFNBQVM7QUFDckIsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTjtBQUFBLE1BQ0EsR0FBRyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ2pDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxJQUFJLFdBQVcsU0FBUztBQUNwQixXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxNQUNQLEdBQUcsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUNqQyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsSUFBSSxXQUFXLFNBQVM7QUFDcEIsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsTUFDUCxHQUFHLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDakMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLE9BQU8sS0FBSyxTQUFTO0FBQ2pCLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLE1BQ1AsR0FBRyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ2pDLENBQUM7QUFBQSxFQUNMO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJQSxTQUFTLFNBQVM7QUFDZCxXQUFPLEtBQUssSUFBSSxHQUFHLFVBQVUsU0FBUyxPQUFPLENBQUM7QUFBQSxFQUNsRDtBQUFBLEVBQ0EsT0FBTztBQUNILFdBQU8sSUFBSSxXQUFVO0FBQUEsTUFDakIsR0FBRyxLQUFLO0FBQUEsTUFDUixRQUFRLENBQUMsR0FBRyxLQUFLLEtBQUssUUFBUSxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBQUEsSUFDbEQsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLGNBQWM7QUFDVixXQUFPLElBQUksV0FBVTtBQUFBLE1BQ2pCLEdBQUcsS0FBSztBQUFBLE1BQ1IsUUFBUSxDQUFDLEdBQUcsS0FBSyxLQUFLLFFBQVEsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUFBLElBQ3pELENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxjQUFjO0FBQ1YsV0FBTyxJQUFJLFdBQVU7QUFBQSxNQUNqQixHQUFHLEtBQUs7QUFBQSxNQUNSLFFBQVEsQ0FBQyxHQUFHLEtBQUssS0FBSyxRQUFRLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFBQSxJQUN6RCxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsSUFBSSxhQUFhO0FBQ2IsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLFVBQVU7QUFBQSxFQUNqRTtBQUFBLEVBQ0EsSUFBSSxTQUFTO0FBQ1QsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLE1BQU07QUFBQSxFQUM3RDtBQUFBLEVBQ0EsSUFBSSxTQUFTO0FBQ1QsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLE1BQU07QUFBQSxFQUM3RDtBQUFBLEVBQ0EsSUFBSSxhQUFhO0FBQ2IsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLFVBQVU7QUFBQSxFQUNqRTtBQUFBLEVBQ0EsSUFBSSxVQUFVO0FBQ1YsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLE9BQU87QUFBQSxFQUM5RDtBQUFBLEVBQ0EsSUFBSSxRQUFRO0FBQ1IsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLEtBQUs7QUFBQSxFQUM1RDtBQUFBLEVBQ0EsSUFBSSxVQUFVO0FBQ1YsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLE9BQU87QUFBQSxFQUM5RDtBQUFBLEVBQ0EsSUFBSSxTQUFTO0FBQ1QsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLE1BQU07QUFBQSxFQUM3RDtBQUFBLEVBQ0EsSUFBSSxXQUFXO0FBQ1gsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLFFBQVE7QUFBQSxFQUMvRDtBQUFBLEVBQ0EsSUFBSSxTQUFTO0FBQ1QsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLE1BQU07QUFBQSxFQUM3RDtBQUFBLEVBQ0EsSUFBSSxVQUFVO0FBQ1YsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLE9BQU87QUFBQSxFQUM5RDtBQUFBLEVBQ0EsSUFBSSxTQUFTO0FBQ1QsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLE1BQU07QUFBQSxFQUM3RDtBQUFBLEVBQ0EsSUFBSSxPQUFPO0FBQ1AsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLElBQUk7QUFBQSxFQUMzRDtBQUFBLEVBQ0EsSUFBSSxTQUFTO0FBQ1QsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLE1BQU07QUFBQSxFQUM3RDtBQUFBLEVBQ0EsSUFBSSxXQUFXO0FBQ1gsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLFFBQVE7QUFBQSxFQUMvRDtBQUFBLEVBQ0EsSUFBSSxjQUFjO0FBRWQsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLFdBQVc7QUFBQSxFQUNsRTtBQUFBLEVBQ0EsSUFBSSxZQUFZO0FBQ1osUUFBSSxNQUFNO0FBQ1YsZUFBVyxNQUFNLEtBQUssS0FBSyxRQUFRO0FBQy9CLFVBQUksR0FBRyxTQUFTLE9BQU87QUFDbkIsWUFBSSxRQUFRLFFBQVEsR0FBRyxRQUFRO0FBQzNCLGdCQUFNLEdBQUc7QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsSUFBSSxZQUFZO0FBQ1osUUFBSSxNQUFNO0FBQ1YsZUFBVyxNQUFNLEtBQUssS0FBSyxRQUFRO0FBQy9CLFVBQUksR0FBRyxTQUFTLE9BQU87QUFDbkIsWUFBSSxRQUFRLFFBQVEsR0FBRyxRQUFRO0FBQzNCLGdCQUFNLEdBQUc7QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUNKO0FBQ0EsVUFBVSxTQUFTLENBQUMsV0FBVztBQUMzQixTQUFPLElBQUksVUFBVTtBQUFBLElBQ2pCLFFBQVEsQ0FBQztBQUFBLElBQ1QsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxRQUFRLFFBQVEsVUFBVTtBQUFBLElBQzFCLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFFQSxTQUFTLG1CQUFtQixLQUFLLE1BQU07QUFDbkMsUUFBTSxlQUFlLElBQUksU0FBUyxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxJQUFJO0FBQ3pELFFBQU0sZ0JBQWdCLEtBQUssU0FBUyxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxJQUFJO0FBQzNELFFBQU0sV0FBVyxjQUFjLGVBQWUsY0FBYztBQUM1RCxRQUFNLFNBQVMsT0FBTyxTQUFTLElBQUksUUFBUSxRQUFRLEVBQUUsUUFBUSxLQUFLLEVBQUUsQ0FBQztBQUNyRSxRQUFNLFVBQVUsT0FBTyxTQUFTLEtBQUssUUFBUSxRQUFRLEVBQUUsUUFBUSxLQUFLLEVBQUUsQ0FBQztBQUN2RSxTQUFRLFNBQVMsVUFBVyxNQUFNO0FBQ3RDO0FBQ08sSUFBTSxZQUFOLE1BQU0sbUJBQWtCLFFBQVE7QUFBQSxFQUNuQyxjQUFjO0FBQ1YsVUFBTSxHQUFHLFNBQVM7QUFDbEIsU0FBSyxNQUFNLEtBQUs7QUFDaEIsU0FBSyxNQUFNLEtBQUs7QUFDaEIsU0FBSyxPQUFPLEtBQUs7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsT0FBTyxPQUFPO0FBQ1YsUUFBSSxLQUFLLEtBQUssUUFBUTtBQUNsQixZQUFNLE9BQU8sT0FBTyxNQUFNLElBQUk7QUFBQSxJQUNsQztBQUNBLFVBQU0sYUFBYSxLQUFLLFNBQVMsS0FBSztBQUN0QyxRQUFJLGVBQWUsY0FBYyxRQUFRO0FBQ3JDLFlBQU1BLE9BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0Qyx3QkFBa0JBLE1BQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVQSxLQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsUUFBSSxNQUFNO0FBQ1YsVUFBTSxTQUFTLElBQUksWUFBWTtBQUMvQixlQUFXLFNBQVMsS0FBSyxLQUFLLFFBQVE7QUFDbEMsVUFBSSxNQUFNLFNBQVMsT0FBTztBQUN0QixZQUFJLENBQUMsS0FBSyxVQUFVLE1BQU0sSUFBSSxHQUFHO0FBQzdCLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFVBQVU7QUFBQSxZQUNWLFVBQVU7QUFBQSxZQUNWLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLE9BQU87QUFDM0IsY0FBTSxXQUFXLE1BQU0sWUFBWSxNQUFNLE9BQU8sTUFBTSxRQUFRLE1BQU0sUUFBUSxNQUFNO0FBQ2xGLFlBQUksVUFBVTtBQUNWLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFNBQVMsTUFBTTtBQUFBLFlBQ2YsTUFBTTtBQUFBLFlBQ04sV0FBVyxNQUFNO0FBQUEsWUFDakIsT0FBTztBQUFBLFlBQ1AsU0FBUyxNQUFNO0FBQUEsVUFDbkIsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osV0FDUyxNQUFNLFNBQVMsT0FBTztBQUMzQixjQUFNLFNBQVMsTUFBTSxZQUFZLE1BQU0sT0FBTyxNQUFNLFFBQVEsTUFBTSxRQUFRLE1BQU07QUFDaEYsWUFBSSxRQUFRO0FBQ1IsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsTUFBTSxhQUFhO0FBQUEsWUFDbkIsU0FBUyxNQUFNO0FBQUEsWUFDZixNQUFNO0FBQUEsWUFDTixXQUFXLE1BQU07QUFBQSxZQUNqQixPQUFPO0FBQUEsWUFDUCxTQUFTLE1BQU07QUFBQSxVQUNuQixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixXQUNTLE1BQU0sU0FBUyxjQUFjO0FBQ2xDLFlBQUksbUJBQW1CLE1BQU0sTUFBTSxNQUFNLEtBQUssTUFBTSxHQUFHO0FBQ25ELGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFlBQVksTUFBTTtBQUFBLFlBQ2xCLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLFVBQVU7QUFDOUIsWUFBSSxDQUFDLE9BQU8sU0FBUyxNQUFNLElBQUksR0FBRztBQUM5QixnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixNQUFNLGFBQWE7QUFBQSxZQUNuQixTQUFTLE1BQU07QUFBQSxVQUNuQixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixPQUNLO0FBQ0QsYUFBSyxZQUFZLEtBQUs7QUFBQSxNQUMxQjtBQUFBLElBQ0o7QUFDQSxXQUFPLEVBQUUsUUFBUSxPQUFPLE9BQU8sT0FBTyxNQUFNLEtBQUs7QUFBQSxFQUNyRDtBQUFBLEVBQ0EsSUFBSSxPQUFPLFNBQVM7QUFDaEIsV0FBTyxLQUFLLFNBQVMsT0FBTyxPQUFPLE1BQU0sVUFBVSxTQUFTLE9BQU8sQ0FBQztBQUFBLEVBQ3hFO0FBQUEsRUFDQSxHQUFHLE9BQU8sU0FBUztBQUNmLFdBQU8sS0FBSyxTQUFTLE9BQU8sT0FBTyxPQUFPLFVBQVUsU0FBUyxPQUFPLENBQUM7QUFBQSxFQUN6RTtBQUFBLEVBQ0EsSUFBSSxPQUFPLFNBQVM7QUFDaEIsV0FBTyxLQUFLLFNBQVMsT0FBTyxPQUFPLE1BQU0sVUFBVSxTQUFTLE9BQU8sQ0FBQztBQUFBLEVBQ3hFO0FBQUEsRUFDQSxHQUFHLE9BQU8sU0FBUztBQUNmLFdBQU8sS0FBSyxTQUFTLE9BQU8sT0FBTyxPQUFPLFVBQVUsU0FBUyxPQUFPLENBQUM7QUFBQSxFQUN6RTtBQUFBLEVBQ0EsU0FBUyxNQUFNLE9BQU8sV0FBVyxTQUFTO0FBQ3RDLFdBQU8sSUFBSSxXQUFVO0FBQUEsTUFDakIsR0FBRyxLQUFLO0FBQUEsTUFDUixRQUFRO0FBQUEsUUFDSixHQUFHLEtBQUssS0FBSztBQUFBLFFBQ2I7QUFBQSxVQUNJO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxRQUN2QztBQUFBLE1BQ0o7QUFBQSxJQUNKLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxVQUFVLE9BQU87QUFDYixXQUFPLElBQUksV0FBVTtBQUFBLE1BQ2pCLEdBQUcsS0FBSztBQUFBLE1BQ1IsUUFBUSxDQUFDLEdBQUcsS0FBSyxLQUFLLFFBQVEsS0FBSztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxJQUFJLFNBQVM7QUFDVCxXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsU0FBUyxTQUFTO0FBQ2QsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsTUFDUCxXQUFXO0FBQUEsTUFDWCxTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFNBQVMsU0FBUztBQUNkLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLE1BQ1AsV0FBVztBQUFBLE1BQ1gsU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxZQUFZLFNBQVM7QUFDakIsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsTUFDUCxXQUFXO0FBQUEsTUFDWCxTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFlBQVksU0FBUztBQUNqQixXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxNQUNQLFdBQVc7QUFBQSxNQUNYLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsV0FBVyxPQUFPLFNBQVM7QUFDdkIsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTjtBQUFBLE1BQ0EsU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxPQUFPLFNBQVM7QUFDWixXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsS0FBSyxTQUFTO0FBQ1YsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixXQUFXO0FBQUEsTUFDWCxPQUFPLE9BQU87QUFBQSxNQUNkLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUN2QyxDQUFDLEVBQUUsVUFBVTtBQUFBLE1BQ1QsTUFBTTtBQUFBLE1BQ04sV0FBVztBQUFBLE1BQ1gsT0FBTyxPQUFPO0FBQUEsTUFDZCxTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLElBQUksV0FBVztBQUNYLFFBQUksTUFBTTtBQUNWLGVBQVcsTUFBTSxLQUFLLEtBQUssUUFBUTtBQUMvQixVQUFJLEdBQUcsU0FBUyxPQUFPO0FBQ25CLFlBQUksUUFBUSxRQUFRLEdBQUcsUUFBUTtBQUMzQixnQkFBTSxHQUFHO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUNBLElBQUksV0FBVztBQUNYLFFBQUksTUFBTTtBQUNWLGVBQVcsTUFBTSxLQUFLLEtBQUssUUFBUTtBQUMvQixVQUFJLEdBQUcsU0FBUyxPQUFPO0FBQ25CLFlBQUksUUFBUSxRQUFRLEdBQUcsUUFBUTtBQUMzQixnQkFBTSxHQUFHO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUNBLElBQUksUUFBUTtBQUNSLFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxTQUFVLEdBQUcsU0FBUyxnQkFBZ0IsS0FBSyxVQUFVLEdBQUcsS0FBSyxDQUFFO0FBQUEsRUFDdEg7QUFBQSxFQUNBLElBQUksV0FBVztBQUNYLFFBQUksTUFBTTtBQUNWLFFBQUksTUFBTTtBQUNWLGVBQVcsTUFBTSxLQUFLLEtBQUssUUFBUTtBQUMvQixVQUFJLEdBQUcsU0FBUyxZQUFZLEdBQUcsU0FBUyxTQUFTLEdBQUcsU0FBUyxjQUFjO0FBQ3ZFLGVBQU87QUFBQSxNQUNYLFdBQ1MsR0FBRyxTQUFTLE9BQU87QUFDeEIsWUFBSSxRQUFRLFFBQVEsR0FBRyxRQUFRO0FBQzNCLGdCQUFNLEdBQUc7QUFBQSxNQUNqQixXQUNTLEdBQUcsU0FBUyxPQUFPO0FBQ3hCLFlBQUksUUFBUSxRQUFRLEdBQUcsUUFBUTtBQUMzQixnQkFBTSxHQUFHO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQ0EsV0FBTyxPQUFPLFNBQVMsR0FBRyxLQUFLLE9BQU8sU0FBUyxHQUFHO0FBQUEsRUFDdEQ7QUFDSjtBQUNBLFVBQVUsU0FBUyxDQUFDLFdBQVc7QUFDM0IsU0FBTyxJQUFJLFVBQVU7QUFBQSxJQUNqQixRQUFRLENBQUM7QUFBQSxJQUNULFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsUUFBUSxRQUFRLFVBQVU7QUFBQSxJQUMxQixHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxZQUFOLE1BQU0sbUJBQWtCLFFBQVE7QUFBQSxFQUNuQyxjQUFjO0FBQ1YsVUFBTSxHQUFHLFNBQVM7QUFDbEIsU0FBSyxNQUFNLEtBQUs7QUFDaEIsU0FBSyxNQUFNLEtBQUs7QUFBQSxFQUNwQjtBQUFBLEVBQ0EsT0FBTyxPQUFPO0FBQ1YsUUFBSSxLQUFLLEtBQUssUUFBUTtBQUNsQixVQUFJO0FBQ0EsY0FBTSxPQUFPLE9BQU8sTUFBTSxJQUFJO0FBQUEsTUFDbEMsUUFDTTtBQUNGLGVBQU8sS0FBSyxpQkFBaUIsS0FBSztBQUFBLE1BQ3RDO0FBQUEsSUFDSjtBQUNBLFVBQU0sYUFBYSxLQUFLLFNBQVMsS0FBSztBQUN0QyxRQUFJLGVBQWUsY0FBYyxRQUFRO0FBQ3JDLGFBQU8sS0FBSyxpQkFBaUIsS0FBSztBQUFBLElBQ3RDO0FBQ0EsUUFBSSxNQUFNO0FBQ1YsVUFBTSxTQUFTLElBQUksWUFBWTtBQUMvQixlQUFXLFNBQVMsS0FBSyxLQUFLLFFBQVE7QUFDbEMsVUFBSSxNQUFNLFNBQVMsT0FBTztBQUN0QixjQUFNLFdBQVcsTUFBTSxZQUFZLE1BQU0sT0FBTyxNQUFNLFFBQVEsTUFBTSxRQUFRLE1BQU07QUFDbEYsWUFBSSxVQUFVO0FBQ1YsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsTUFBTSxhQUFhO0FBQUEsWUFDbkIsTUFBTTtBQUFBLFlBQ04sU0FBUyxNQUFNO0FBQUEsWUFDZixXQUFXLE1BQU07QUFBQSxZQUNqQixTQUFTLE1BQU07QUFBQSxVQUNuQixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixXQUNTLE1BQU0sU0FBUyxPQUFPO0FBQzNCLGNBQU0sU0FBUyxNQUFNLFlBQVksTUFBTSxPQUFPLE1BQU0sUUFBUSxNQUFNLFFBQVEsTUFBTTtBQUNoRixZQUFJLFFBQVE7QUFDUixnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixNQUFNLGFBQWE7QUFBQSxZQUNuQixNQUFNO0FBQUEsWUFDTixTQUFTLE1BQU07QUFBQSxZQUNmLFdBQVcsTUFBTTtBQUFBLFlBQ2pCLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLGNBQWM7QUFDbEMsWUFBSSxNQUFNLE9BQU8sTUFBTSxVQUFVLE9BQU8sQ0FBQyxHQUFHO0FBQ3hDLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFlBQVksTUFBTTtBQUFBLFlBQ2xCLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLE9BQ0s7QUFDRCxhQUFLLFlBQVksS0FBSztBQUFBLE1BQzFCO0FBQUEsSUFDSjtBQUNBLFdBQU8sRUFBRSxRQUFRLE9BQU8sT0FBTyxPQUFPLE1BQU0sS0FBSztBQUFBLEVBQ3JEO0FBQUEsRUFDQSxpQkFBaUIsT0FBTztBQUNwQixVQUFNLE1BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0QyxzQkFBa0IsS0FBSztBQUFBLE1BQ25CLE1BQU0sYUFBYTtBQUFBLE1BQ25CLFVBQVUsY0FBYztBQUFBLE1BQ3hCLFVBQVUsSUFBSTtBQUFBLElBQ2xCLENBQUM7QUFDRCxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsSUFBSSxPQUFPLFNBQVM7QUFDaEIsV0FBTyxLQUFLLFNBQVMsT0FBTyxPQUFPLE1BQU0sVUFBVSxTQUFTLE9BQU8sQ0FBQztBQUFBLEVBQ3hFO0FBQUEsRUFDQSxHQUFHLE9BQU8sU0FBUztBQUNmLFdBQU8sS0FBSyxTQUFTLE9BQU8sT0FBTyxPQUFPLFVBQVUsU0FBUyxPQUFPLENBQUM7QUFBQSxFQUN6RTtBQUFBLEVBQ0EsSUFBSSxPQUFPLFNBQVM7QUFDaEIsV0FBTyxLQUFLLFNBQVMsT0FBTyxPQUFPLE1BQU0sVUFBVSxTQUFTLE9BQU8sQ0FBQztBQUFBLEVBQ3hFO0FBQUEsRUFDQSxHQUFHLE9BQU8sU0FBUztBQUNmLFdBQU8sS0FBSyxTQUFTLE9BQU8sT0FBTyxPQUFPLFVBQVUsU0FBUyxPQUFPLENBQUM7QUFBQSxFQUN6RTtBQUFBLEVBQ0EsU0FBUyxNQUFNLE9BQU8sV0FBVyxTQUFTO0FBQ3RDLFdBQU8sSUFBSSxXQUFVO0FBQUEsTUFDakIsR0FBRyxLQUFLO0FBQUEsTUFDUixRQUFRO0FBQUEsUUFDSixHQUFHLEtBQUssS0FBSztBQUFBLFFBQ2I7QUFBQSxVQUNJO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxRQUN2QztBQUFBLE1BQ0o7QUFBQSxJQUNKLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxVQUFVLE9BQU87QUFDYixXQUFPLElBQUksV0FBVTtBQUFBLE1BQ2pCLEdBQUcsS0FBSztBQUFBLE1BQ1IsUUFBUSxDQUFDLEdBQUcsS0FBSyxLQUFLLFFBQVEsS0FBSztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxTQUFTLFNBQVM7QUFDZCxXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOLE9BQU8sT0FBTyxDQUFDO0FBQUEsTUFDZixXQUFXO0FBQUEsTUFDWCxTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFNBQVMsU0FBUztBQUNkLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ04sT0FBTyxPQUFPLENBQUM7QUFBQSxNQUNmLFdBQVc7QUFBQSxNQUNYLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsWUFBWSxTQUFTO0FBQ2pCLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ04sT0FBTyxPQUFPLENBQUM7QUFBQSxNQUNmLFdBQVc7QUFBQSxNQUNYLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsWUFBWSxTQUFTO0FBQ2pCLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ04sT0FBTyxPQUFPLENBQUM7QUFBQSxNQUNmLFdBQVc7QUFBQSxNQUNYLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsV0FBVyxPQUFPLFNBQVM7QUFDdkIsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTjtBQUFBLE1BQ0EsU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxJQUFJLFdBQVc7QUFDWCxRQUFJLE1BQU07QUFDVixlQUFXLE1BQU0sS0FBSyxLQUFLLFFBQVE7QUFDL0IsVUFBSSxHQUFHLFNBQVMsT0FBTztBQUNuQixZQUFJLFFBQVEsUUFBUSxHQUFHLFFBQVE7QUFDM0IsZ0JBQU0sR0FBRztBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxJQUFJLFdBQVc7QUFDWCxRQUFJLE1BQU07QUFDVixlQUFXLE1BQU0sS0FBSyxLQUFLLFFBQVE7QUFDL0IsVUFBSSxHQUFHLFNBQVMsT0FBTztBQUNuQixZQUFJLFFBQVEsUUFBUSxHQUFHLFFBQVE7QUFDM0IsZ0JBQU0sR0FBRztBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBQ0o7QUFDQSxVQUFVLFNBQVMsQ0FBQyxXQUFXO0FBQzNCLFNBQU8sSUFBSSxVQUFVO0FBQUEsSUFDakIsUUFBUSxDQUFDO0FBQUEsSUFDVCxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLFFBQVEsUUFBUSxVQUFVO0FBQUEsSUFDMUIsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sYUFBTixjQUF5QixRQUFRO0FBQUEsRUFDcEMsT0FBTyxPQUFPO0FBQ1YsUUFBSSxLQUFLLEtBQUssUUFBUTtBQUNsQixZQUFNLE9BQU8sUUFBUSxNQUFNLElBQUk7QUFBQSxJQUNuQztBQUNBLFVBQU0sYUFBYSxLQUFLLFNBQVMsS0FBSztBQUN0QyxRQUFJLGVBQWUsY0FBYyxTQUFTO0FBQ3RDLFlBQU0sTUFBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ3RDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVSxJQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsV0FBTyxHQUFHLE1BQU0sSUFBSTtBQUFBLEVBQ3hCO0FBQ0o7QUFDQSxXQUFXLFNBQVMsQ0FBQyxXQUFXO0FBQzVCLFNBQU8sSUFBSSxXQUFXO0FBQUEsSUFDbEIsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxRQUFRLFFBQVEsVUFBVTtBQUFBLElBQzFCLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLFVBQU4sTUFBTSxpQkFBZ0IsUUFBUTtBQUFBLEVBQ2pDLE9BQU8sT0FBTztBQUNWLFFBQUksS0FBSyxLQUFLLFFBQVE7QUFDbEIsWUFBTSxPQUFPLElBQUksS0FBSyxNQUFNLElBQUk7QUFBQSxJQUNwQztBQUNBLFVBQU0sYUFBYSxLQUFLLFNBQVMsS0FBSztBQUN0QyxRQUFJLGVBQWUsY0FBYyxNQUFNO0FBQ25DLFlBQU1BLE9BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0Qyx3QkFBa0JBLE1BQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVQSxLQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsUUFBSSxPQUFPLE1BQU0sTUFBTSxLQUFLLFFBQVEsQ0FBQyxHQUFHO0FBQ3BDLFlBQU1BLE9BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0Qyx3QkFBa0JBLE1BQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxNQUN2QixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxVQUFNLFNBQVMsSUFBSSxZQUFZO0FBQy9CLFFBQUksTUFBTTtBQUNWLGVBQVcsU0FBUyxLQUFLLEtBQUssUUFBUTtBQUNsQyxVQUFJLE1BQU0sU0FBUyxPQUFPO0FBQ3RCLFlBQUksTUFBTSxLQUFLLFFBQVEsSUFBSSxNQUFNLE9BQU87QUFDcEMsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsTUFBTSxhQUFhO0FBQUEsWUFDbkIsU0FBUyxNQUFNO0FBQUEsWUFDZixXQUFXO0FBQUEsWUFDWCxPQUFPO0FBQUEsWUFDUCxTQUFTLE1BQU07QUFBQSxZQUNmLE1BQU07QUFBQSxVQUNWLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLE9BQU87QUFDM0IsWUFBSSxNQUFNLEtBQUssUUFBUSxJQUFJLE1BQU0sT0FBTztBQUNwQyxnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixNQUFNLGFBQWE7QUFBQSxZQUNuQixTQUFTLE1BQU07QUFBQSxZQUNmLFdBQVc7QUFBQSxZQUNYLE9BQU87QUFBQSxZQUNQLFNBQVMsTUFBTTtBQUFBLFlBQ2YsTUFBTTtBQUFBLFVBQ1YsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osT0FDSztBQUNELGFBQUssWUFBWSxLQUFLO0FBQUEsTUFDMUI7QUFBQSxJQUNKO0FBQ0EsV0FBTztBQUFBLE1BQ0gsUUFBUSxPQUFPO0FBQUEsTUFDZixPQUFPLElBQUksS0FBSyxNQUFNLEtBQUssUUFBUSxDQUFDO0FBQUEsSUFDeEM7QUFBQSxFQUNKO0FBQUEsRUFDQSxVQUFVLE9BQU87QUFDYixXQUFPLElBQUksU0FBUTtBQUFBLE1BQ2YsR0FBRyxLQUFLO0FBQUEsTUFDUixRQUFRLENBQUMsR0FBRyxLQUFLLEtBQUssUUFBUSxLQUFLO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLElBQUksU0FBUyxTQUFTO0FBQ2xCLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ04sT0FBTyxRQUFRLFFBQVE7QUFBQSxNQUN2QixTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLElBQUksU0FBUyxTQUFTO0FBQ2xCLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ04sT0FBTyxRQUFRLFFBQVE7QUFBQSxNQUN2QixTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLElBQUksVUFBVTtBQUNWLFFBQUksTUFBTTtBQUNWLGVBQVcsTUFBTSxLQUFLLEtBQUssUUFBUTtBQUMvQixVQUFJLEdBQUcsU0FBUyxPQUFPO0FBQ25CLFlBQUksUUFBUSxRQUFRLEdBQUcsUUFBUTtBQUMzQixnQkFBTSxHQUFHO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQ0EsV0FBTyxPQUFPLE9BQU8sSUFBSSxLQUFLLEdBQUcsSUFBSTtBQUFBLEVBQ3pDO0FBQUEsRUFDQSxJQUFJLFVBQVU7QUFDVixRQUFJLE1BQU07QUFDVixlQUFXLE1BQU0sS0FBSyxLQUFLLFFBQVE7QUFDL0IsVUFBSSxHQUFHLFNBQVMsT0FBTztBQUNuQixZQUFJLFFBQVEsUUFBUSxHQUFHLFFBQVE7QUFDM0IsZ0JBQU0sR0FBRztBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUNBLFdBQU8sT0FBTyxPQUFPLElBQUksS0FBSyxHQUFHLElBQUk7QUFBQSxFQUN6QztBQUNKO0FBQ0EsUUFBUSxTQUFTLENBQUMsV0FBVztBQUN6QixTQUFPLElBQUksUUFBUTtBQUFBLElBQ2YsUUFBUSxDQUFDO0FBQUEsSUFDVCxRQUFRLFFBQVEsVUFBVTtBQUFBLElBQzFCLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sWUFBTixjQUF3QixRQUFRO0FBQUEsRUFDbkMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxhQUFhLEtBQUssU0FBUyxLQUFLO0FBQ3RDLFFBQUksZUFBZSxjQUFjLFFBQVE7QUFDckMsWUFBTSxNQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDdEMsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVLElBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxXQUFPLEdBQUcsTUFBTSxJQUFJO0FBQUEsRUFDeEI7QUFDSjtBQUNBLFVBQVUsU0FBUyxDQUFDLFdBQVc7QUFDM0IsU0FBTyxJQUFJLFVBQVU7QUFBQSxJQUNqQixVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLGVBQU4sY0FBMkIsUUFBUTtBQUFBLEVBQ3RDLE9BQU8sT0FBTztBQUNWLFVBQU0sYUFBYSxLQUFLLFNBQVMsS0FBSztBQUN0QyxRQUFJLGVBQWUsY0FBYyxXQUFXO0FBQ3hDLFlBQU0sTUFBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ3RDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVSxJQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsV0FBTyxHQUFHLE1BQU0sSUFBSTtBQUFBLEVBQ3hCO0FBQ0o7QUFDQSxhQUFhLFNBQVMsQ0FBQyxXQUFXO0FBQzlCLFNBQU8sSUFBSSxhQUFhO0FBQUEsSUFDcEIsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxVQUFOLGNBQXNCLFFBQVE7QUFBQSxFQUNqQyxPQUFPLE9BQU87QUFDVixVQUFNLGFBQWEsS0FBSyxTQUFTLEtBQUs7QUFDdEMsUUFBSSxlQUFlLGNBQWMsTUFBTTtBQUNuQyxZQUFNLE1BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0Qyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVUsSUFBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFdBQU8sR0FBRyxNQUFNLElBQUk7QUFBQSxFQUN4QjtBQUNKO0FBQ0EsUUFBUSxTQUFTLENBQUMsV0FBVztBQUN6QixTQUFPLElBQUksUUFBUTtBQUFBLElBQ2YsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxTQUFOLGNBQXFCLFFBQVE7QUFBQSxFQUNoQyxjQUFjO0FBQ1YsVUFBTSxHQUFHLFNBQVM7QUFFbEIsU0FBSyxPQUFPO0FBQUEsRUFDaEI7QUFBQSxFQUNBLE9BQU8sT0FBTztBQUNWLFdBQU8sR0FBRyxNQUFNLElBQUk7QUFBQSxFQUN4QjtBQUNKO0FBQ0EsT0FBTyxTQUFTLENBQUMsV0FBVztBQUN4QixTQUFPLElBQUksT0FBTztBQUFBLElBQ2QsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxhQUFOLGNBQXlCLFFBQVE7QUFBQSxFQUNwQyxjQUFjO0FBQ1YsVUFBTSxHQUFHLFNBQVM7QUFFbEIsU0FBSyxXQUFXO0FBQUEsRUFDcEI7QUFBQSxFQUNBLE9BQU8sT0FBTztBQUNWLFdBQU8sR0FBRyxNQUFNLElBQUk7QUFBQSxFQUN4QjtBQUNKO0FBQ0EsV0FBVyxTQUFTLENBQUMsV0FBVztBQUM1QixTQUFPLElBQUksV0FBVztBQUFBLElBQ2xCLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sV0FBTixjQUF1QixRQUFRO0FBQUEsRUFDbEMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxNQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDdEMsc0JBQWtCLEtBQUs7QUFBQSxNQUNuQixNQUFNLGFBQWE7QUFBQSxNQUNuQixVQUFVLGNBQWM7QUFBQSxNQUN4QixVQUFVLElBQUk7QUFBQSxJQUNsQixDQUFDO0FBQ0QsV0FBTztBQUFBLEVBQ1g7QUFDSjtBQUNBLFNBQVMsU0FBUyxDQUFDLFdBQVc7QUFDMUIsU0FBTyxJQUFJLFNBQVM7QUFBQSxJQUNoQixVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLFVBQU4sY0FBc0IsUUFBUTtBQUFBLEVBQ2pDLE9BQU8sT0FBTztBQUNWLFVBQU0sYUFBYSxLQUFLLFNBQVMsS0FBSztBQUN0QyxRQUFJLGVBQWUsY0FBYyxXQUFXO0FBQ3hDLFlBQU0sTUFBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ3RDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVSxJQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsV0FBTyxHQUFHLE1BQU0sSUFBSTtBQUFBLEVBQ3hCO0FBQ0o7QUFDQSxRQUFRLFNBQVMsQ0FBQyxXQUFXO0FBQ3pCLFNBQU8sSUFBSSxRQUFRO0FBQUEsSUFDZixVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLFdBQU4sTUFBTSxrQkFBaUIsUUFBUTtBQUFBLEVBQ2xDLE9BQU8sT0FBTztBQUNWLFVBQU0sRUFBRSxLQUFLLE9BQU8sSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBQ3RELFVBQU0sTUFBTSxLQUFLO0FBQ2pCLFFBQUksSUFBSSxlQUFlLGNBQWMsT0FBTztBQUN4Qyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVUsSUFBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFFBQUksSUFBSSxnQkFBZ0IsTUFBTTtBQUMxQixZQUFNLFNBQVMsSUFBSSxLQUFLLFNBQVMsSUFBSSxZQUFZO0FBQ2pELFlBQU0sV0FBVyxJQUFJLEtBQUssU0FBUyxJQUFJLFlBQVk7QUFDbkQsVUFBSSxVQUFVLFVBQVU7QUFDcEIsMEJBQWtCLEtBQUs7QUFBQSxVQUNuQixNQUFNLFNBQVMsYUFBYSxVQUFVLGFBQWE7QUFBQSxVQUNuRCxTQUFVLFdBQVcsSUFBSSxZQUFZLFFBQVE7QUFBQSxVQUM3QyxTQUFVLFNBQVMsSUFBSSxZQUFZLFFBQVE7QUFBQSxVQUMzQyxNQUFNO0FBQUEsVUFDTixXQUFXO0FBQUEsVUFDWCxPQUFPO0FBQUEsVUFDUCxTQUFTLElBQUksWUFBWTtBQUFBLFFBQzdCLENBQUM7QUFDRCxlQUFPLE1BQU07QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFDQSxRQUFJLElBQUksY0FBYyxNQUFNO0FBQ3hCLFVBQUksSUFBSSxLQUFLLFNBQVMsSUFBSSxVQUFVLE9BQU87QUFDdkMsMEJBQWtCLEtBQUs7QUFBQSxVQUNuQixNQUFNLGFBQWE7QUFBQSxVQUNuQixTQUFTLElBQUksVUFBVTtBQUFBLFVBQ3ZCLE1BQU07QUFBQSxVQUNOLFdBQVc7QUFBQSxVQUNYLE9BQU87QUFBQSxVQUNQLFNBQVMsSUFBSSxVQUFVO0FBQUEsUUFDM0IsQ0FBQztBQUNELGVBQU8sTUFBTTtBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUNBLFFBQUksSUFBSSxjQUFjLE1BQU07QUFDeEIsVUFBSSxJQUFJLEtBQUssU0FBUyxJQUFJLFVBQVUsT0FBTztBQUN2QywwQkFBa0IsS0FBSztBQUFBLFVBQ25CLE1BQU0sYUFBYTtBQUFBLFVBQ25CLFNBQVMsSUFBSSxVQUFVO0FBQUEsVUFDdkIsTUFBTTtBQUFBLFVBQ04sV0FBVztBQUFBLFVBQ1gsT0FBTztBQUFBLFVBQ1AsU0FBUyxJQUFJLFVBQVU7QUFBQSxRQUMzQixDQUFDO0FBQ0QsZUFBTyxNQUFNO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQ0EsUUFBSSxJQUFJLE9BQU8sT0FBTztBQUNsQixhQUFPLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sTUFBTTtBQUM5QyxlQUFPLElBQUksS0FBSyxZQUFZLElBQUksbUJBQW1CLEtBQUssTUFBTSxJQUFJLE1BQU0sQ0FBQyxDQUFDO0FBQUEsTUFDOUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDQyxZQUFXO0FBQ2pCLGVBQU8sWUFBWSxXQUFXLFFBQVFBLE9BQU07QUFBQSxNQUNoRCxDQUFDO0FBQUEsSUFDTDtBQUNBLFVBQU0sU0FBUyxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sTUFBTTtBQUMxQyxhQUFPLElBQUksS0FBSyxXQUFXLElBQUksbUJBQW1CLEtBQUssTUFBTSxJQUFJLE1BQU0sQ0FBQyxDQUFDO0FBQUEsSUFDN0UsQ0FBQztBQUNELFdBQU8sWUFBWSxXQUFXLFFBQVEsTUFBTTtBQUFBLEVBQ2hEO0FBQUEsRUFDQSxJQUFJLFVBQVU7QUFDVixXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQUEsRUFDQSxJQUFJLFdBQVcsU0FBUztBQUNwQixXQUFPLElBQUksVUFBUztBQUFBLE1BQ2hCLEdBQUcsS0FBSztBQUFBLE1BQ1IsV0FBVyxFQUFFLE9BQU8sV0FBVyxTQUFTLFVBQVUsU0FBUyxPQUFPLEVBQUU7QUFBQSxJQUN4RSxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsSUFBSSxXQUFXLFNBQVM7QUFDcEIsV0FBTyxJQUFJLFVBQVM7QUFBQSxNQUNoQixHQUFHLEtBQUs7QUFBQSxNQUNSLFdBQVcsRUFBRSxPQUFPLFdBQVcsU0FBUyxVQUFVLFNBQVMsT0FBTyxFQUFFO0FBQUEsSUFDeEUsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLE9BQU8sS0FBSyxTQUFTO0FBQ2pCLFdBQU8sSUFBSSxVQUFTO0FBQUEsTUFDaEIsR0FBRyxLQUFLO0FBQUEsTUFDUixhQUFhLEVBQUUsT0FBTyxLQUFLLFNBQVMsVUFBVSxTQUFTLE9BQU8sRUFBRTtBQUFBLElBQ3BFLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxTQUFTLFNBQVM7QUFDZCxXQUFPLEtBQUssSUFBSSxHQUFHLE9BQU87QUFBQSxFQUM5QjtBQUNKO0FBQ0EsU0FBUyxTQUFTLENBQUMsUUFBUSxXQUFXO0FBQ2xDLFNBQU8sSUFBSSxTQUFTO0FBQUEsSUFDaEIsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ0EsU0FBUyxlQUFlLFFBQVE7QUFDNUIsTUFBSSxrQkFBa0IsV0FBVztBQUM3QixVQUFNLFdBQVcsQ0FBQztBQUNsQixlQUFXLE9BQU8sT0FBTyxPQUFPO0FBQzVCLFlBQU0sY0FBYyxPQUFPLE1BQU0sR0FBRztBQUNwQyxlQUFTLEdBQUcsSUFBSSxZQUFZLE9BQU8sZUFBZSxXQUFXLENBQUM7QUFBQSxJQUNsRTtBQUNBLFdBQU8sSUFBSSxVQUFVO0FBQUEsTUFDakIsR0FBRyxPQUFPO0FBQUEsTUFDVixPQUFPLE1BQU07QUFBQSxJQUNqQixDQUFDO0FBQUEsRUFDTCxXQUNTLGtCQUFrQixVQUFVO0FBQ2pDLFdBQU8sSUFBSSxTQUFTO0FBQUEsTUFDaEIsR0FBRyxPQUFPO0FBQUEsTUFDVixNQUFNLGVBQWUsT0FBTyxPQUFPO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0wsV0FDUyxrQkFBa0IsYUFBYTtBQUNwQyxXQUFPLFlBQVksT0FBTyxlQUFlLE9BQU8sT0FBTyxDQUFDLENBQUM7QUFBQSxFQUM3RCxXQUNTLGtCQUFrQixhQUFhO0FBQ3BDLFdBQU8sWUFBWSxPQUFPLGVBQWUsT0FBTyxPQUFPLENBQUMsQ0FBQztBQUFBLEVBQzdELFdBQ1Msa0JBQWtCLFVBQVU7QUFDakMsV0FBTyxTQUFTLE9BQU8sT0FBTyxNQUFNLElBQUksQ0FBQyxTQUFTLGVBQWUsSUFBSSxDQUFDLENBQUM7QUFBQSxFQUMzRSxPQUNLO0FBQ0QsV0FBTztBQUFBLEVBQ1g7QUFDSjtBQUNPLElBQU0sWUFBTixNQUFNLG1CQUFrQixRQUFRO0FBQUEsRUFDbkMsY0FBYztBQUNWLFVBQU0sR0FBRyxTQUFTO0FBQ2xCLFNBQUssVUFBVTtBQUtmLFNBQUssWUFBWSxLQUFLO0FBcUN0QixTQUFLLFVBQVUsS0FBSztBQUFBLEVBQ3hCO0FBQUEsRUFDQSxhQUFhO0FBQ1QsUUFBSSxLQUFLLFlBQVk7QUFDakIsYUFBTyxLQUFLO0FBQ2hCLFVBQU0sUUFBUSxLQUFLLEtBQUssTUFBTTtBQUM5QixVQUFNLE9BQU8sS0FBSyxXQUFXLEtBQUs7QUFDbEMsU0FBSyxVQUFVLEVBQUUsT0FBTyxLQUFLO0FBQzdCLFdBQU8sS0FBSztBQUFBLEVBQ2hCO0FBQUEsRUFDQSxPQUFPLE9BQU87QUFDVixVQUFNLGFBQWEsS0FBSyxTQUFTLEtBQUs7QUFDdEMsUUFBSSxlQUFlLGNBQWMsUUFBUTtBQUNyQyxZQUFNRCxPQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDdEMsd0JBQWtCQSxNQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVUEsS0FBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFVBQU0sRUFBRSxRQUFRLElBQUksSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBQ3RELFVBQU0sRUFBRSxPQUFPLE1BQU0sVUFBVSxJQUFJLEtBQUssV0FBVztBQUNuRCxVQUFNLFlBQVksQ0FBQztBQUNuQixRQUFJLEVBQUUsS0FBSyxLQUFLLG9CQUFvQixZQUFZLEtBQUssS0FBSyxnQkFBZ0IsVUFBVTtBQUNoRixpQkFBVyxPQUFPLElBQUksTUFBTTtBQUN4QixZQUFJLENBQUMsVUFBVSxTQUFTLEdBQUcsR0FBRztBQUMxQixvQkFBVSxLQUFLLEdBQUc7QUFBQSxRQUN0QjtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQ0EsVUFBTSxRQUFRLENBQUM7QUFDZixlQUFXLE9BQU8sV0FBVztBQUN6QixZQUFNLGVBQWUsTUFBTSxHQUFHO0FBQzlCLFlBQU0sUUFBUSxJQUFJLEtBQUssR0FBRztBQUMxQixZQUFNLEtBQUs7QUFBQSxRQUNQLEtBQUssRUFBRSxRQUFRLFNBQVMsT0FBTyxJQUFJO0FBQUEsUUFDbkMsT0FBTyxhQUFhLE9BQU8sSUFBSSxtQkFBbUIsS0FBSyxPQUFPLElBQUksTUFBTSxHQUFHLENBQUM7QUFBQSxRQUM1RSxXQUFXLE9BQU8sSUFBSTtBQUFBLE1BQzFCLENBQUM7QUFBQSxJQUNMO0FBQ0EsUUFBSSxLQUFLLEtBQUssb0JBQW9CLFVBQVU7QUFDeEMsWUFBTSxjQUFjLEtBQUssS0FBSztBQUM5QixVQUFJLGdCQUFnQixlQUFlO0FBQy9CLG1CQUFXLE9BQU8sV0FBVztBQUN6QixnQkFBTSxLQUFLO0FBQUEsWUFDUCxLQUFLLEVBQUUsUUFBUSxTQUFTLE9BQU8sSUFBSTtBQUFBLFlBQ25DLE9BQU8sRUFBRSxRQUFRLFNBQVMsT0FBTyxJQUFJLEtBQUssR0FBRyxFQUFFO0FBQUEsVUFDbkQsQ0FBQztBQUFBLFFBQ0w7QUFBQSxNQUNKLFdBQ1MsZ0JBQWdCLFVBQVU7QUFDL0IsWUFBSSxVQUFVLFNBQVMsR0FBRztBQUN0Qiw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLE1BQU0sYUFBYTtBQUFBLFlBQ25CLE1BQU07QUFBQSxVQUNWLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsZ0JBQWdCLFNBQVM7QUFBQSxNQUNsQyxPQUNLO0FBQ0QsY0FBTSxJQUFJLE1BQU0sc0RBQXNEO0FBQUEsTUFDMUU7QUFBQSxJQUNKLE9BQ0s7QUFFRCxZQUFNLFdBQVcsS0FBSyxLQUFLO0FBQzNCLGlCQUFXLE9BQU8sV0FBVztBQUN6QixjQUFNLFFBQVEsSUFBSSxLQUFLLEdBQUc7QUFDMUIsY0FBTSxLQUFLO0FBQUEsVUFDUCxLQUFLLEVBQUUsUUFBUSxTQUFTLE9BQU8sSUFBSTtBQUFBLFVBQ25DLE9BQU8sU0FBUztBQUFBLFlBQU8sSUFBSSxtQkFBbUIsS0FBSyxPQUFPLElBQUksTUFBTSxHQUFHO0FBQUE7QUFBQSxVQUN2RTtBQUFBLFVBQ0EsV0FBVyxPQUFPLElBQUk7QUFBQSxRQUMxQixDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0o7QUFDQSxRQUFJLElBQUksT0FBTyxPQUFPO0FBQ2xCLGFBQU8sUUFBUSxRQUFRLEVBQ2xCLEtBQUssWUFBWTtBQUNsQixjQUFNLFlBQVksQ0FBQztBQUNuQixtQkFBVyxRQUFRLE9BQU87QUFDdEIsZ0JBQU0sTUFBTSxNQUFNLEtBQUs7QUFDdkIsZ0JBQU0sUUFBUSxNQUFNLEtBQUs7QUFDekIsb0JBQVUsS0FBSztBQUFBLFlBQ1g7QUFBQSxZQUNBO0FBQUEsWUFDQSxXQUFXLEtBQUs7QUFBQSxVQUNwQixDQUFDO0FBQUEsUUFDTDtBQUNBLGVBQU87QUFBQSxNQUNYLENBQUMsRUFDSSxLQUFLLENBQUMsY0FBYztBQUNyQixlQUFPLFlBQVksZ0JBQWdCLFFBQVEsU0FBUztBQUFBLE1BQ3hELENBQUM7QUFBQSxJQUNMLE9BQ0s7QUFDRCxhQUFPLFlBQVksZ0JBQWdCLFFBQVEsS0FBSztBQUFBLElBQ3BEO0FBQUEsRUFDSjtBQUFBLEVBQ0EsSUFBSSxRQUFRO0FBQ1IsV0FBTyxLQUFLLEtBQUssTUFBTTtBQUFBLEVBQzNCO0FBQUEsRUFDQSxPQUFPLFNBQVM7QUFDWixjQUFVO0FBQ1YsV0FBTyxJQUFJLFdBQVU7QUFBQSxNQUNqQixHQUFHLEtBQUs7QUFBQSxNQUNSLGFBQWE7QUFBQSxNQUNiLEdBQUksWUFBWSxTQUNWO0FBQUEsUUFDRSxVQUFVLENBQUMsT0FBTyxRQUFRO0FBQ3RCLGdCQUFNLGVBQWUsS0FBSyxLQUFLLFdBQVcsT0FBTyxHQUFHLEVBQUUsV0FBVyxJQUFJO0FBQ3JFLGNBQUksTUFBTSxTQUFTO0FBQ2YsbUJBQU87QUFBQSxjQUNILFNBQVMsVUFBVSxTQUFTLE9BQU8sRUFBRSxXQUFXO0FBQUEsWUFDcEQ7QUFDSixpQkFBTztBQUFBLFlBQ0gsU0FBUztBQUFBLFVBQ2I7QUFBQSxRQUNKO0FBQUEsTUFDSixJQUNFLENBQUM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxRQUFRO0FBQ0osV0FBTyxJQUFJLFdBQVU7QUFBQSxNQUNqQixHQUFHLEtBQUs7QUFBQSxNQUNSLGFBQWE7QUFBQSxJQUNqQixDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsY0FBYztBQUNWLFdBQU8sSUFBSSxXQUFVO0FBQUEsTUFDakIsR0FBRyxLQUFLO0FBQUEsTUFDUixhQUFhO0FBQUEsSUFDakIsQ0FBQztBQUFBLEVBQ0w7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFrQkEsT0FBTyxjQUFjO0FBQ2pCLFdBQU8sSUFBSSxXQUFVO0FBQUEsTUFDakIsR0FBRyxLQUFLO0FBQUEsTUFDUixPQUFPLE9BQU87QUFBQSxRQUNWLEdBQUcsS0FBSyxLQUFLLE1BQU07QUFBQSxRQUNuQixHQUFHO0FBQUEsTUFDUDtBQUFBLElBQ0osQ0FBQztBQUFBLEVBQ0w7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNQSxNQUFNLFNBQVM7QUFDWCxVQUFNLFNBQVMsSUFBSSxXQUFVO0FBQUEsTUFDekIsYUFBYSxRQUFRLEtBQUs7QUFBQSxNQUMxQixVQUFVLFFBQVEsS0FBSztBQUFBLE1BQ3ZCLE9BQU8sT0FBTztBQUFBLFFBQ1YsR0FBRyxLQUFLLEtBQUssTUFBTTtBQUFBLFFBQ25CLEdBQUcsUUFBUSxLQUFLLE1BQU07QUFBQSxNQUMxQjtBQUFBLE1BQ0EsVUFBVSxzQkFBc0I7QUFBQSxJQUNwQyxDQUFDO0FBQ0QsV0FBTztBQUFBLEVBQ1g7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFvQ0EsT0FBTyxLQUFLLFFBQVE7QUFDaEIsV0FBTyxLQUFLLFFBQVEsRUFBRSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUM7QUFBQSxFQUN6QztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBc0JBLFNBQVMsT0FBTztBQUNaLFdBQU8sSUFBSSxXQUFVO0FBQUEsTUFDakIsR0FBRyxLQUFLO0FBQUEsTUFDUixVQUFVO0FBQUEsSUFDZCxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsS0FBSyxNQUFNO0FBQ1AsVUFBTSxRQUFRLENBQUM7QUFDZixlQUFXLE9BQU8sS0FBSyxXQUFXLElBQUksR0FBRztBQUNyQyxVQUFJLEtBQUssR0FBRyxLQUFLLEtBQUssTUFBTSxHQUFHLEdBQUc7QUFDOUIsY0FBTSxHQUFHLElBQUksS0FBSyxNQUFNLEdBQUc7QUFBQSxNQUMvQjtBQUFBLElBQ0o7QUFDQSxXQUFPLElBQUksV0FBVTtBQUFBLE1BQ2pCLEdBQUcsS0FBSztBQUFBLE1BQ1IsT0FBTyxNQUFNO0FBQUEsSUFDakIsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLEtBQUssTUFBTTtBQUNQLFVBQU0sUUFBUSxDQUFDO0FBQ2YsZUFBVyxPQUFPLEtBQUssV0FBVyxLQUFLLEtBQUssR0FBRztBQUMzQyxVQUFJLENBQUMsS0FBSyxHQUFHLEdBQUc7QUFDWixjQUFNLEdBQUcsSUFBSSxLQUFLLE1BQU0sR0FBRztBQUFBLE1BQy9CO0FBQUEsSUFDSjtBQUNBLFdBQU8sSUFBSSxXQUFVO0FBQUEsTUFDakIsR0FBRyxLQUFLO0FBQUEsTUFDUixPQUFPLE1BQU07QUFBQSxJQUNqQixDQUFDO0FBQUEsRUFDTDtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSUEsY0FBYztBQUNWLFdBQU8sZUFBZSxJQUFJO0FBQUEsRUFDOUI7QUFBQSxFQUNBLFFBQVEsTUFBTTtBQUNWLFVBQU0sV0FBVyxDQUFDO0FBQ2xCLGVBQVcsT0FBTyxLQUFLLFdBQVcsS0FBSyxLQUFLLEdBQUc7QUFDM0MsWUFBTSxjQUFjLEtBQUssTUFBTSxHQUFHO0FBQ2xDLFVBQUksUUFBUSxDQUFDLEtBQUssR0FBRyxHQUFHO0FBQ3BCLGlCQUFTLEdBQUcsSUFBSTtBQUFBLE1BQ3BCLE9BQ0s7QUFDRCxpQkFBUyxHQUFHLElBQUksWUFBWSxTQUFTO0FBQUEsTUFDekM7QUFBQSxJQUNKO0FBQ0EsV0FBTyxJQUFJLFdBQVU7QUFBQSxNQUNqQixHQUFHLEtBQUs7QUFBQSxNQUNSLE9BQU8sTUFBTTtBQUFBLElBQ2pCLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxTQUFTLE1BQU07QUFDWCxVQUFNLFdBQVcsQ0FBQztBQUNsQixlQUFXLE9BQU8sS0FBSyxXQUFXLEtBQUssS0FBSyxHQUFHO0FBQzNDLFVBQUksUUFBUSxDQUFDLEtBQUssR0FBRyxHQUFHO0FBQ3BCLGlCQUFTLEdBQUcsSUFBSSxLQUFLLE1BQU0sR0FBRztBQUFBLE1BQ2xDLE9BQ0s7QUFDRCxjQUFNLGNBQWMsS0FBSyxNQUFNLEdBQUc7QUFDbEMsWUFBSSxXQUFXO0FBQ2YsZUFBTyxvQkFBb0IsYUFBYTtBQUNwQyxxQkFBVyxTQUFTLEtBQUs7QUFBQSxRQUM3QjtBQUNBLGlCQUFTLEdBQUcsSUFBSTtBQUFBLE1BQ3BCO0FBQUEsSUFDSjtBQUNBLFdBQU8sSUFBSSxXQUFVO0FBQUEsTUFDakIsR0FBRyxLQUFLO0FBQUEsTUFDUixPQUFPLE1BQU07QUFBQSxJQUNqQixDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsUUFBUTtBQUNKLFdBQU8sY0FBYyxLQUFLLFdBQVcsS0FBSyxLQUFLLENBQUM7QUFBQSxFQUNwRDtBQUNKO0FBQ0EsVUFBVSxTQUFTLENBQUMsT0FBTyxXQUFXO0FBQ2xDLFNBQU8sSUFBSSxVQUFVO0FBQUEsSUFDakIsT0FBTyxNQUFNO0FBQUEsSUFDYixhQUFhO0FBQUEsSUFDYixVQUFVLFNBQVMsT0FBTztBQUFBLElBQzFCLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNBLFVBQVUsZUFBZSxDQUFDLE9BQU8sV0FBVztBQUN4QyxTQUFPLElBQUksVUFBVTtBQUFBLElBQ2pCLE9BQU8sTUFBTTtBQUFBLElBQ2IsYUFBYTtBQUFBLElBQ2IsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUMxQixVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDQSxVQUFVLGFBQWEsQ0FBQyxPQUFPLFdBQVc7QUFDdEMsU0FBTyxJQUFJLFVBQVU7QUFBQSxJQUNqQjtBQUFBLElBQ0EsYUFBYTtBQUFBLElBQ2IsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUMxQixVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLFdBQU4sY0FBdUIsUUFBUTtBQUFBLEVBQ2xDLE9BQU8sT0FBTztBQUNWLFVBQU0sRUFBRSxJQUFJLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUM5QyxVQUFNLFVBQVUsS0FBSyxLQUFLO0FBQzFCLGFBQVMsY0FBYyxTQUFTO0FBRTVCLGlCQUFXLFVBQVUsU0FBUztBQUMxQixZQUFJLE9BQU8sT0FBTyxXQUFXLFNBQVM7QUFDbEMsaUJBQU8sT0FBTztBQUFBLFFBQ2xCO0FBQUEsTUFDSjtBQUNBLGlCQUFXLFVBQVUsU0FBUztBQUMxQixZQUFJLE9BQU8sT0FBTyxXQUFXLFNBQVM7QUFFbEMsY0FBSSxPQUFPLE9BQU8sS0FBSyxHQUFHLE9BQU8sSUFBSSxPQUFPLE1BQU07QUFDbEQsaUJBQU8sT0FBTztBQUFBLFFBQ2xCO0FBQUEsTUFDSjtBQUVBLFlBQU0sY0FBYyxRQUFRLElBQUksQ0FBQyxXQUFXLElBQUksU0FBUyxPQUFPLElBQUksT0FBTyxNQUFNLENBQUM7QUFDbEYsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQjtBQUFBLE1BQ0osQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsUUFBSSxJQUFJLE9BQU8sT0FBTztBQUNsQixhQUFPLFFBQVEsSUFBSSxRQUFRLElBQUksT0FBTyxXQUFXO0FBQzdDLGNBQU0sV0FBVztBQUFBLFVBQ2IsR0FBRztBQUFBLFVBQ0gsUUFBUTtBQUFBLFlBQ0osR0FBRyxJQUFJO0FBQUEsWUFDUCxRQUFRLENBQUM7QUFBQSxVQUNiO0FBQUEsVUFDQSxRQUFRO0FBQUEsUUFDWjtBQUNBLGVBQU87QUFBQSxVQUNILFFBQVEsTUFBTSxPQUFPLFlBQVk7QUFBQSxZQUM3QixNQUFNLElBQUk7QUFBQSxZQUNWLE1BQU0sSUFBSTtBQUFBLFlBQ1YsUUFBUTtBQUFBLFVBQ1osQ0FBQztBQUFBLFVBQ0QsS0FBSztBQUFBLFFBQ1Q7QUFBQSxNQUNKLENBQUMsQ0FBQyxFQUFFLEtBQUssYUFBYTtBQUFBLElBQzFCLE9BQ0s7QUFDRCxVQUFJLFFBQVE7QUFDWixZQUFNLFNBQVMsQ0FBQztBQUNoQixpQkFBVyxVQUFVLFNBQVM7QUFDMUIsY0FBTSxXQUFXO0FBQUEsVUFDYixHQUFHO0FBQUEsVUFDSCxRQUFRO0FBQUEsWUFDSixHQUFHLElBQUk7QUFBQSxZQUNQLFFBQVEsQ0FBQztBQUFBLFVBQ2I7QUFBQSxVQUNBLFFBQVE7QUFBQSxRQUNaO0FBQ0EsY0FBTSxTQUFTLE9BQU8sV0FBVztBQUFBLFVBQzdCLE1BQU0sSUFBSTtBQUFBLFVBQ1YsTUFBTSxJQUFJO0FBQUEsVUFDVixRQUFRO0FBQUEsUUFDWixDQUFDO0FBQ0QsWUFBSSxPQUFPLFdBQVcsU0FBUztBQUMzQixpQkFBTztBQUFBLFFBQ1gsV0FDUyxPQUFPLFdBQVcsV0FBVyxDQUFDLE9BQU87QUFDMUMsa0JBQVEsRUFBRSxRQUFRLEtBQUssU0FBUztBQUFBLFFBQ3BDO0FBQ0EsWUFBSSxTQUFTLE9BQU8sT0FBTyxRQUFRO0FBQy9CLGlCQUFPLEtBQUssU0FBUyxPQUFPLE1BQU07QUFBQSxRQUN0QztBQUFBLE1BQ0o7QUFDQSxVQUFJLE9BQU87QUFDUCxZQUFJLE9BQU8sT0FBTyxLQUFLLEdBQUcsTUFBTSxJQUFJLE9BQU8sTUFBTTtBQUNqRCxlQUFPLE1BQU07QUFBQSxNQUNqQjtBQUNBLFlBQU0sY0FBYyxPQUFPLElBQUksQ0FBQ0UsWUFBVyxJQUFJLFNBQVNBLE9BQU0sQ0FBQztBQUMvRCx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CO0FBQUEsTUFDSixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFBQSxFQUNKO0FBQUEsRUFDQSxJQUFJLFVBQVU7QUFDVixXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQ0o7QUFDQSxTQUFTLFNBQVMsQ0FBQyxPQUFPLFdBQVc7QUFDakMsU0FBTyxJQUFJLFNBQVM7QUFBQSxJQUNoQixTQUFTO0FBQUEsSUFDVCxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFRQSxJQUFNLG1CQUFtQixDQUFDLFNBQVM7QUFDL0IsTUFBSSxnQkFBZ0IsU0FBUztBQUN6QixXQUFPLGlCQUFpQixLQUFLLE1BQU07QUFBQSxFQUN2QyxXQUNTLGdCQUFnQixZQUFZO0FBQ2pDLFdBQU8saUJBQWlCLEtBQUssVUFBVSxDQUFDO0FBQUEsRUFDNUMsV0FDUyxnQkFBZ0IsWUFBWTtBQUNqQyxXQUFPLENBQUMsS0FBSyxLQUFLO0FBQUEsRUFDdEIsV0FDUyxnQkFBZ0IsU0FBUztBQUM5QixXQUFPLEtBQUs7QUFBQSxFQUNoQixXQUNTLGdCQUFnQixlQUFlO0FBRXBDLFdBQU8sS0FBSyxhQUFhLEtBQUssSUFBSTtBQUFBLEVBQ3RDLFdBQ1MsZ0JBQWdCLFlBQVk7QUFDakMsV0FBTyxpQkFBaUIsS0FBSyxLQUFLLFNBQVM7QUFBQSxFQUMvQyxXQUNTLGdCQUFnQixjQUFjO0FBQ25DLFdBQU8sQ0FBQyxNQUFTO0FBQUEsRUFDckIsV0FDUyxnQkFBZ0IsU0FBUztBQUM5QixXQUFPLENBQUMsSUFBSTtBQUFBLEVBQ2hCLFdBQ1MsZ0JBQWdCLGFBQWE7QUFDbEMsV0FBTyxDQUFDLFFBQVcsR0FBRyxpQkFBaUIsS0FBSyxPQUFPLENBQUMsQ0FBQztBQUFBLEVBQ3pELFdBQ1MsZ0JBQWdCLGFBQWE7QUFDbEMsV0FBTyxDQUFDLE1BQU0sR0FBRyxpQkFBaUIsS0FBSyxPQUFPLENBQUMsQ0FBQztBQUFBLEVBQ3BELFdBQ1MsZ0JBQWdCLFlBQVk7QUFDakMsV0FBTyxpQkFBaUIsS0FBSyxPQUFPLENBQUM7QUFBQSxFQUN6QyxXQUNTLGdCQUFnQixhQUFhO0FBQ2xDLFdBQU8saUJBQWlCLEtBQUssT0FBTyxDQUFDO0FBQUEsRUFDekMsV0FDUyxnQkFBZ0IsVUFBVTtBQUMvQixXQUFPLGlCQUFpQixLQUFLLEtBQUssU0FBUztBQUFBLEVBQy9DLE9BQ0s7QUFDRCxXQUFPLENBQUM7QUFBQSxFQUNaO0FBQ0o7QUFDTyxJQUFNLHdCQUFOLE1BQU0sK0JBQThCLFFBQVE7QUFBQSxFQUMvQyxPQUFPLE9BQU87QUFDVixVQUFNLEVBQUUsSUFBSSxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFDOUMsUUFBSSxJQUFJLGVBQWUsY0FBYyxRQUFRO0FBQ3pDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVSxJQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsVUFBTSxnQkFBZ0IsS0FBSztBQUMzQixVQUFNLHFCQUFxQixJQUFJLEtBQUssYUFBYTtBQUNqRCxVQUFNLFNBQVMsS0FBSyxXQUFXLElBQUksa0JBQWtCO0FBQ3JELFFBQUksQ0FBQyxRQUFRO0FBQ1Qsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixTQUFTLE1BQU0sS0FBSyxLQUFLLFdBQVcsS0FBSyxDQUFDO0FBQUEsUUFDMUMsTUFBTSxDQUFDLGFBQWE7QUFBQSxNQUN4QixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxRQUFJLElBQUksT0FBTyxPQUFPO0FBQ2xCLGFBQU8sT0FBTyxZQUFZO0FBQUEsUUFDdEIsTUFBTSxJQUFJO0FBQUEsUUFDVixNQUFNLElBQUk7QUFBQSxRQUNWLFFBQVE7QUFBQSxNQUNaLENBQUM7QUFBQSxJQUNMLE9BQ0s7QUFDRCxhQUFPLE9BQU8sV0FBVztBQUFBLFFBQ3JCLE1BQU0sSUFBSTtBQUFBLFFBQ1YsTUFBTSxJQUFJO0FBQUEsUUFDVixRQUFRO0FBQUEsTUFDWixDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0o7QUFBQSxFQUNBLElBQUksZ0JBQWdCO0FBQ2hCLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFBQSxFQUNBLElBQUksVUFBVTtBQUNWLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFBQSxFQUNBLElBQUksYUFBYTtBQUNiLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFTQSxPQUFPLE9BQU8sZUFBZSxTQUFTLFFBQVE7QUFFMUMsVUFBTSxhQUFhLG9CQUFJLElBQUk7QUFFM0IsZUFBVyxRQUFRLFNBQVM7QUFDeEIsWUFBTSxzQkFBc0IsaUJBQWlCLEtBQUssTUFBTSxhQUFhLENBQUM7QUFDdEUsVUFBSSxDQUFDLG9CQUFvQixRQUFRO0FBQzdCLGNBQU0sSUFBSSxNQUFNLG1DQUFtQyxhQUFhLG1EQUFtRDtBQUFBLE1BQ3ZIO0FBQ0EsaUJBQVcsU0FBUyxxQkFBcUI7QUFDckMsWUFBSSxXQUFXLElBQUksS0FBSyxHQUFHO0FBQ3ZCLGdCQUFNLElBQUksTUFBTSwwQkFBMEIsT0FBTyxhQUFhLENBQUMsd0JBQXdCLE9BQU8sS0FBSyxDQUFDLEVBQUU7QUFBQSxRQUMxRztBQUNBLG1CQUFXLElBQUksT0FBTyxJQUFJO0FBQUEsTUFDOUI7QUFBQSxJQUNKO0FBQ0EsV0FBTyxJQUFJLHVCQUFzQjtBQUFBLE1BQzdCLFVBQVUsc0JBQXNCO0FBQUEsTUFDaEM7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0EsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLElBQ2pDLENBQUM7QUFBQSxFQUNMO0FBQ0o7QUFDQSxTQUFTLFlBQVksR0FBRyxHQUFHO0FBQ3ZCLFFBQU0sUUFBUSxjQUFjLENBQUM7QUFDN0IsUUFBTSxRQUFRLGNBQWMsQ0FBQztBQUM3QixNQUFJLE1BQU0sR0FBRztBQUNULFdBQU8sRUFBRSxPQUFPLE1BQU0sTUFBTSxFQUFFO0FBQUEsRUFDbEMsV0FDUyxVQUFVLGNBQWMsVUFBVSxVQUFVLGNBQWMsUUFBUTtBQUN2RSxVQUFNLFFBQVEsS0FBSyxXQUFXLENBQUM7QUFDL0IsVUFBTSxhQUFhLEtBQUssV0FBVyxDQUFDLEVBQUUsT0FBTyxDQUFDLFFBQVEsTUFBTSxRQUFRLEdBQUcsTUFBTSxFQUFFO0FBQy9FLFVBQU0sU0FBUyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUU7QUFDNUIsZUFBVyxPQUFPLFlBQVk7QUFDMUIsWUFBTSxjQUFjLFlBQVksRUFBRSxHQUFHLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFDOUMsVUFBSSxDQUFDLFlBQVksT0FBTztBQUNwQixlQUFPLEVBQUUsT0FBTyxNQUFNO0FBQUEsTUFDMUI7QUFDQSxhQUFPLEdBQUcsSUFBSSxZQUFZO0FBQUEsSUFDOUI7QUFDQSxXQUFPLEVBQUUsT0FBTyxNQUFNLE1BQU0sT0FBTztBQUFBLEVBQ3ZDLFdBQ1MsVUFBVSxjQUFjLFNBQVMsVUFBVSxjQUFjLE9BQU87QUFDckUsUUFBSSxFQUFFLFdBQVcsRUFBRSxRQUFRO0FBQ3ZCLGFBQU8sRUFBRSxPQUFPLE1BQU07QUFBQSxJQUMxQjtBQUNBLFVBQU0sV0FBVyxDQUFDO0FBQ2xCLGFBQVMsUUFBUSxHQUFHLFFBQVEsRUFBRSxRQUFRLFNBQVM7QUFDM0MsWUFBTSxRQUFRLEVBQUUsS0FBSztBQUNyQixZQUFNLFFBQVEsRUFBRSxLQUFLO0FBQ3JCLFlBQU0sY0FBYyxZQUFZLE9BQU8sS0FBSztBQUM1QyxVQUFJLENBQUMsWUFBWSxPQUFPO0FBQ3BCLGVBQU8sRUFBRSxPQUFPLE1BQU07QUFBQSxNQUMxQjtBQUNBLGVBQVMsS0FBSyxZQUFZLElBQUk7QUFBQSxJQUNsQztBQUNBLFdBQU8sRUFBRSxPQUFPLE1BQU0sTUFBTSxTQUFTO0FBQUEsRUFDekMsV0FDUyxVQUFVLGNBQWMsUUFBUSxVQUFVLGNBQWMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHO0FBQ2hGLFdBQU8sRUFBRSxPQUFPLE1BQU0sTUFBTSxFQUFFO0FBQUEsRUFDbEMsT0FDSztBQUNELFdBQU8sRUFBRSxPQUFPLE1BQU07QUFBQSxFQUMxQjtBQUNKO0FBQ08sSUFBTSxrQkFBTixjQUE4QixRQUFRO0FBQUEsRUFDekMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxFQUFFLFFBQVEsSUFBSSxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFDdEQsVUFBTSxlQUFlLENBQUMsWUFBWSxnQkFBZ0I7QUFDOUMsVUFBSSxVQUFVLFVBQVUsS0FBSyxVQUFVLFdBQVcsR0FBRztBQUNqRCxlQUFPO0FBQUEsTUFDWDtBQUNBLFlBQU0sU0FBUyxZQUFZLFdBQVcsT0FBTyxZQUFZLEtBQUs7QUFDOUQsVUFBSSxDQUFDLE9BQU8sT0FBTztBQUNmLDBCQUFrQixLQUFLO0FBQUEsVUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDdkIsQ0FBQztBQUNELGVBQU87QUFBQSxNQUNYO0FBQ0EsVUFBSSxRQUFRLFVBQVUsS0FBSyxRQUFRLFdBQVcsR0FBRztBQUM3QyxlQUFPLE1BQU07QUFBQSxNQUNqQjtBQUNBLGFBQU8sRUFBRSxRQUFRLE9BQU8sT0FBTyxPQUFPLE9BQU8sS0FBSztBQUFBLElBQ3REO0FBQ0EsUUFBSSxJQUFJLE9BQU8sT0FBTztBQUNsQixhQUFPLFFBQVEsSUFBSTtBQUFBLFFBQ2YsS0FBSyxLQUFLLEtBQUssWUFBWTtBQUFBLFVBQ3ZCLE1BQU0sSUFBSTtBQUFBLFVBQ1YsTUFBTSxJQUFJO0FBQUEsVUFDVixRQUFRO0FBQUEsUUFDWixDQUFDO0FBQUEsUUFDRCxLQUFLLEtBQUssTUFBTSxZQUFZO0FBQUEsVUFDeEIsTUFBTSxJQUFJO0FBQUEsVUFDVixNQUFNLElBQUk7QUFBQSxVQUNWLFFBQVE7QUFBQSxRQUNaLENBQUM7QUFBQSxNQUNMLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxNQUFNLEtBQUssTUFBTSxhQUFhLE1BQU0sS0FBSyxDQUFDO0FBQUEsSUFDeEQsT0FDSztBQUNELGFBQU8sYUFBYSxLQUFLLEtBQUssS0FBSyxXQUFXO0FBQUEsUUFDMUMsTUFBTSxJQUFJO0FBQUEsUUFDVixNQUFNLElBQUk7QUFBQSxRQUNWLFFBQVE7QUFBQSxNQUNaLENBQUMsR0FBRyxLQUFLLEtBQUssTUFBTSxXQUFXO0FBQUEsUUFDM0IsTUFBTSxJQUFJO0FBQUEsUUFDVixNQUFNLElBQUk7QUFBQSxRQUNWLFFBQVE7QUFBQSxNQUNaLENBQUMsQ0FBQztBQUFBLElBQ047QUFBQSxFQUNKO0FBQ0o7QUFDQSxnQkFBZ0IsU0FBUyxDQUFDLE1BQU0sT0FBTyxXQUFXO0FBQzlDLFNBQU8sSUFBSSxnQkFBZ0I7QUFBQSxJQUN2QjtBQUFBLElBQ0E7QUFBQSxJQUNBLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUVPLElBQU0sV0FBTixNQUFNLGtCQUFpQixRQUFRO0FBQUEsRUFDbEMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxFQUFFLFFBQVEsSUFBSSxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFDdEQsUUFBSSxJQUFJLGVBQWUsY0FBYyxPQUFPO0FBQ3hDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVSxJQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsUUFBSSxJQUFJLEtBQUssU0FBUyxLQUFLLEtBQUssTUFBTSxRQUFRO0FBQzFDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsU0FBUyxLQUFLLEtBQUssTUFBTTtBQUFBLFFBQ3pCLFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxRQUNQLE1BQU07QUFBQSxNQUNWLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFVBQU0sT0FBTyxLQUFLLEtBQUs7QUFDdkIsUUFBSSxDQUFDLFFBQVEsSUFBSSxLQUFLLFNBQVMsS0FBSyxLQUFLLE1BQU0sUUFBUTtBQUNuRCx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFNBQVMsS0FBSyxLQUFLLE1BQU07QUFBQSxRQUN6QixXQUFXO0FBQUEsUUFDWCxPQUFPO0FBQUEsUUFDUCxNQUFNO0FBQUEsTUFDVixDQUFDO0FBQ0QsYUFBTyxNQUFNO0FBQUEsSUFDakI7QUFDQSxVQUFNLFFBQVEsQ0FBQyxHQUFHLElBQUksSUFBSSxFQUNyQixJQUFJLENBQUMsTUFBTSxjQUFjO0FBQzFCLFlBQU0sU0FBUyxLQUFLLEtBQUssTUFBTSxTQUFTLEtBQUssS0FBSyxLQUFLO0FBQ3ZELFVBQUksQ0FBQztBQUNELGVBQU87QUFDWCxhQUFPLE9BQU8sT0FBTyxJQUFJLG1CQUFtQixLQUFLLE1BQU0sSUFBSSxNQUFNLFNBQVMsQ0FBQztBQUFBLElBQy9FLENBQUMsRUFDSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUN0QixRQUFJLElBQUksT0FBTyxPQUFPO0FBQ2xCLGFBQU8sUUFBUSxJQUFJLEtBQUssRUFBRSxLQUFLLENBQUMsWUFBWTtBQUN4QyxlQUFPLFlBQVksV0FBVyxRQUFRLE9BQU87QUFBQSxNQUNqRCxDQUFDO0FBQUEsSUFDTCxPQUNLO0FBQ0QsYUFBTyxZQUFZLFdBQVcsUUFBUSxLQUFLO0FBQUEsSUFDL0M7QUFBQSxFQUNKO0FBQUEsRUFDQSxJQUFJLFFBQVE7QUFDUixXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQUEsRUFDQSxLQUFLLE1BQU07QUFDUCxXQUFPLElBQUksVUFBUztBQUFBLE1BQ2hCLEdBQUcsS0FBSztBQUFBLE1BQ1I7QUFBQSxJQUNKLENBQUM7QUFBQSxFQUNMO0FBQ0o7QUFDQSxTQUFTLFNBQVMsQ0FBQyxTQUFTLFdBQVc7QUFDbkMsTUFBSSxDQUFDLE1BQU0sUUFBUSxPQUFPLEdBQUc7QUFDekIsVUFBTSxJQUFJLE1BQU0sdURBQXVEO0FBQUEsRUFDM0U7QUFDQSxTQUFPLElBQUksU0FBUztBQUFBLElBQ2hCLE9BQU87QUFBQSxJQUNQLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsTUFBTTtBQUFBLElBQ04sR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sWUFBTixNQUFNLG1CQUFrQixRQUFRO0FBQUEsRUFDbkMsSUFBSSxZQUFZO0FBQ1osV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsSUFBSSxjQUFjO0FBQ2QsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsT0FBTyxPQUFPO0FBQ1YsVUFBTSxFQUFFLFFBQVEsSUFBSSxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFDdEQsUUFBSSxJQUFJLGVBQWUsY0FBYyxRQUFRO0FBQ3pDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVSxJQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsVUFBTSxRQUFRLENBQUM7QUFDZixVQUFNLFVBQVUsS0FBSyxLQUFLO0FBQzFCLFVBQU0sWUFBWSxLQUFLLEtBQUs7QUFDNUIsZUFBVyxPQUFPLElBQUksTUFBTTtBQUN4QixZQUFNLEtBQUs7QUFBQSxRQUNQLEtBQUssUUFBUSxPQUFPLElBQUksbUJBQW1CLEtBQUssS0FBSyxJQUFJLE1BQU0sR0FBRyxDQUFDO0FBQUEsUUFDbkUsT0FBTyxVQUFVLE9BQU8sSUFBSSxtQkFBbUIsS0FBSyxJQUFJLEtBQUssR0FBRyxHQUFHLElBQUksTUFBTSxHQUFHLENBQUM7QUFBQSxRQUNqRixXQUFXLE9BQU8sSUFBSTtBQUFBLE1BQzFCLENBQUM7QUFBQSxJQUNMO0FBQ0EsUUFBSSxJQUFJLE9BQU8sT0FBTztBQUNsQixhQUFPLFlBQVksaUJBQWlCLFFBQVEsS0FBSztBQUFBLElBQ3JELE9BQ0s7QUFDRCxhQUFPLFlBQVksZ0JBQWdCLFFBQVEsS0FBSztBQUFBLElBQ3BEO0FBQUEsRUFDSjtBQUFBLEVBQ0EsSUFBSSxVQUFVO0FBQ1YsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsT0FBTyxPQUFPLE9BQU8sUUFBUSxPQUFPO0FBQ2hDLFFBQUksa0JBQWtCLFNBQVM7QUFDM0IsYUFBTyxJQUFJLFdBQVU7QUFBQSxRQUNqQixTQUFTO0FBQUEsUUFDVCxXQUFXO0FBQUEsUUFDWCxVQUFVLHNCQUFzQjtBQUFBLFFBQ2hDLEdBQUcsb0JBQW9CLEtBQUs7QUFBQSxNQUNoQyxDQUFDO0FBQUEsSUFDTDtBQUNBLFdBQU8sSUFBSSxXQUFVO0FBQUEsTUFDakIsU0FBUyxVQUFVLE9BQU87QUFBQSxNQUMxQixXQUFXO0FBQUEsTUFDWCxVQUFVLHNCQUFzQjtBQUFBLE1BQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxJQUNqQyxDQUFDO0FBQUEsRUFDTDtBQUNKO0FBQ08sSUFBTSxTQUFOLGNBQXFCLFFBQVE7QUFBQSxFQUNoQyxJQUFJLFlBQVk7QUFDWixXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQUEsRUFDQSxJQUFJLGNBQWM7QUFDZCxXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQUEsRUFDQSxPQUFPLE9BQU87QUFDVixVQUFNLEVBQUUsUUFBUSxJQUFJLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUN0RCxRQUFJLElBQUksZUFBZSxjQUFjLEtBQUs7QUFDdEMsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVLElBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxVQUFNLFVBQVUsS0FBSyxLQUFLO0FBQzFCLFVBQU0sWUFBWSxLQUFLLEtBQUs7QUFDNUIsVUFBTSxRQUFRLENBQUMsR0FBRyxJQUFJLEtBQUssUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLEdBQUcsVUFBVTtBQUMvRCxhQUFPO0FBQUEsUUFDSCxLQUFLLFFBQVEsT0FBTyxJQUFJLG1CQUFtQixLQUFLLEtBQUssSUFBSSxNQUFNLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQztBQUFBLFFBQzlFLE9BQU8sVUFBVSxPQUFPLElBQUksbUJBQW1CLEtBQUssT0FBTyxJQUFJLE1BQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxDQUFDO0FBQUEsTUFDMUY7QUFBQSxJQUNKLENBQUM7QUFDRCxRQUFJLElBQUksT0FBTyxPQUFPO0FBQ2xCLFlBQU0sV0FBVyxvQkFBSSxJQUFJO0FBQ3pCLGFBQU8sUUFBUSxRQUFRLEVBQUUsS0FBSyxZQUFZO0FBQ3RDLG1CQUFXLFFBQVEsT0FBTztBQUN0QixnQkFBTSxNQUFNLE1BQU0sS0FBSztBQUN2QixnQkFBTSxRQUFRLE1BQU0sS0FBSztBQUN6QixjQUFJLElBQUksV0FBVyxhQUFhLE1BQU0sV0FBVyxXQUFXO0FBQ3hELG1CQUFPO0FBQUEsVUFDWDtBQUNBLGNBQUksSUFBSSxXQUFXLFdBQVcsTUFBTSxXQUFXLFNBQVM7QUFDcEQsbUJBQU8sTUFBTTtBQUFBLFVBQ2pCO0FBQ0EsbUJBQVMsSUFBSSxJQUFJLE9BQU8sTUFBTSxLQUFLO0FBQUEsUUFDdkM7QUFDQSxlQUFPLEVBQUUsUUFBUSxPQUFPLE9BQU8sT0FBTyxTQUFTO0FBQUEsTUFDbkQsQ0FBQztBQUFBLElBQ0wsT0FDSztBQUNELFlBQU0sV0FBVyxvQkFBSSxJQUFJO0FBQ3pCLGlCQUFXLFFBQVEsT0FBTztBQUN0QixjQUFNLE1BQU0sS0FBSztBQUNqQixjQUFNLFFBQVEsS0FBSztBQUNuQixZQUFJLElBQUksV0FBVyxhQUFhLE1BQU0sV0FBVyxXQUFXO0FBQ3hELGlCQUFPO0FBQUEsUUFDWDtBQUNBLFlBQUksSUFBSSxXQUFXLFdBQVcsTUFBTSxXQUFXLFNBQVM7QUFDcEQsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQ0EsaUJBQVMsSUFBSSxJQUFJLE9BQU8sTUFBTSxLQUFLO0FBQUEsTUFDdkM7QUFDQSxhQUFPLEVBQUUsUUFBUSxPQUFPLE9BQU8sT0FBTyxTQUFTO0FBQUEsSUFDbkQ7QUFBQSxFQUNKO0FBQ0o7QUFDQSxPQUFPLFNBQVMsQ0FBQyxTQUFTLFdBQVcsV0FBVztBQUM1QyxTQUFPLElBQUksT0FBTztBQUFBLElBQ2Q7QUFBQSxJQUNBO0FBQUEsSUFDQSxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLFNBQU4sTUFBTSxnQkFBZSxRQUFRO0FBQUEsRUFDaEMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxFQUFFLFFBQVEsSUFBSSxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFDdEQsUUFBSSxJQUFJLGVBQWUsY0FBYyxLQUFLO0FBQ3RDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVSxJQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsVUFBTSxNQUFNLEtBQUs7QUFDakIsUUFBSSxJQUFJLFlBQVksTUFBTTtBQUN0QixVQUFJLElBQUksS0FBSyxPQUFPLElBQUksUUFBUSxPQUFPO0FBQ25DLDBCQUFrQixLQUFLO0FBQUEsVUFDbkIsTUFBTSxhQUFhO0FBQUEsVUFDbkIsU0FBUyxJQUFJLFFBQVE7QUFBQSxVQUNyQixNQUFNO0FBQUEsVUFDTixXQUFXO0FBQUEsVUFDWCxPQUFPO0FBQUEsVUFDUCxTQUFTLElBQUksUUFBUTtBQUFBLFFBQ3pCLENBQUM7QUFDRCxlQUFPLE1BQU07QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFDQSxRQUFJLElBQUksWUFBWSxNQUFNO0FBQ3RCLFVBQUksSUFBSSxLQUFLLE9BQU8sSUFBSSxRQUFRLE9BQU87QUFDbkMsMEJBQWtCLEtBQUs7QUFBQSxVQUNuQixNQUFNLGFBQWE7QUFBQSxVQUNuQixTQUFTLElBQUksUUFBUTtBQUFBLFVBQ3JCLE1BQU07QUFBQSxVQUNOLFdBQVc7QUFBQSxVQUNYLE9BQU87QUFBQSxVQUNQLFNBQVMsSUFBSSxRQUFRO0FBQUEsUUFDekIsQ0FBQztBQUNELGVBQU8sTUFBTTtBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUNBLFVBQU0sWUFBWSxLQUFLLEtBQUs7QUFDNUIsYUFBUyxZQUFZQyxXQUFVO0FBQzNCLFlBQU0sWUFBWSxvQkFBSSxJQUFJO0FBQzFCLGlCQUFXLFdBQVdBLFdBQVU7QUFDNUIsWUFBSSxRQUFRLFdBQVc7QUFDbkIsaUJBQU87QUFDWCxZQUFJLFFBQVEsV0FBVztBQUNuQixpQkFBTyxNQUFNO0FBQ2pCLGtCQUFVLElBQUksUUFBUSxLQUFLO0FBQUEsTUFDL0I7QUFDQSxhQUFPLEVBQUUsUUFBUSxPQUFPLE9BQU8sT0FBTyxVQUFVO0FBQUEsSUFDcEQ7QUFDQSxVQUFNLFdBQVcsQ0FBQyxHQUFHLElBQUksS0FBSyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxNQUFNLFVBQVUsT0FBTyxJQUFJLG1CQUFtQixLQUFLLE1BQU0sSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3pILFFBQUksSUFBSSxPQUFPLE9BQU87QUFDbEIsYUFBTyxRQUFRLElBQUksUUFBUSxFQUFFLEtBQUssQ0FBQ0EsY0FBYSxZQUFZQSxTQUFRLENBQUM7QUFBQSxJQUN6RSxPQUNLO0FBQ0QsYUFBTyxZQUFZLFFBQVE7QUFBQSxJQUMvQjtBQUFBLEVBQ0o7QUFBQSxFQUNBLElBQUksU0FBUyxTQUFTO0FBQ2xCLFdBQU8sSUFBSSxRQUFPO0FBQUEsTUFDZCxHQUFHLEtBQUs7QUFBQSxNQUNSLFNBQVMsRUFBRSxPQUFPLFNBQVMsU0FBUyxVQUFVLFNBQVMsT0FBTyxFQUFFO0FBQUEsSUFDcEUsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLElBQUksU0FBUyxTQUFTO0FBQ2xCLFdBQU8sSUFBSSxRQUFPO0FBQUEsTUFDZCxHQUFHLEtBQUs7QUFBQSxNQUNSLFNBQVMsRUFBRSxPQUFPLFNBQVMsU0FBUyxVQUFVLFNBQVMsT0FBTyxFQUFFO0FBQUEsSUFDcEUsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLEtBQUssTUFBTSxTQUFTO0FBQ2hCLFdBQU8sS0FBSyxJQUFJLE1BQU0sT0FBTyxFQUFFLElBQUksTUFBTSxPQUFPO0FBQUEsRUFDcEQ7QUFBQSxFQUNBLFNBQVMsU0FBUztBQUNkLFdBQU8sS0FBSyxJQUFJLEdBQUcsT0FBTztBQUFBLEVBQzlCO0FBQ0o7QUFDQSxPQUFPLFNBQVMsQ0FBQyxXQUFXLFdBQVc7QUFDbkMsU0FBTyxJQUFJLE9BQU87QUFBQSxJQUNkO0FBQUEsSUFDQSxTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLGNBQU4sTUFBTSxxQkFBb0IsUUFBUTtBQUFBLEVBQ3JDLGNBQWM7QUFDVixVQUFNLEdBQUcsU0FBUztBQUNsQixTQUFLLFdBQVcsS0FBSztBQUFBLEVBQ3pCO0FBQUEsRUFDQSxPQUFPLE9BQU87QUFDVixVQUFNLEVBQUUsSUFBSSxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFDOUMsUUFBSSxJQUFJLGVBQWUsY0FBYyxVQUFVO0FBQzNDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVSxJQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsYUFBUyxjQUFjLE1BQU0sT0FBTztBQUNoQyxhQUFPLFVBQVU7QUFBQSxRQUNiLE1BQU07QUFBQSxRQUNOLE1BQU0sSUFBSTtBQUFBLFFBQ1YsV0FBVyxDQUFDLElBQUksT0FBTyxvQkFBb0IsSUFBSSxnQkFBZ0IsWUFBWSxHQUFHLFVBQWUsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUFBLFFBQ2hILFdBQVc7QUFBQSxVQUNQLE1BQU0sYUFBYTtBQUFBLFVBQ25CLGdCQUFnQjtBQUFBLFFBQ3BCO0FBQUEsTUFDSixDQUFDO0FBQUEsSUFDTDtBQUNBLGFBQVMsaUJBQWlCLFNBQVMsT0FBTztBQUN0QyxhQUFPLFVBQVU7QUFBQSxRQUNiLE1BQU07QUFBQSxRQUNOLE1BQU0sSUFBSTtBQUFBLFFBQ1YsV0FBVyxDQUFDLElBQUksT0FBTyxvQkFBb0IsSUFBSSxnQkFBZ0IsWUFBWSxHQUFHLFVBQWUsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUFBLFFBQ2hILFdBQVc7QUFBQSxVQUNQLE1BQU0sYUFBYTtBQUFBLFVBQ25CLGlCQUFpQjtBQUFBLFFBQ3JCO0FBQUEsTUFDSixDQUFDO0FBQUEsSUFDTDtBQUNBLFVBQU0sU0FBUyxFQUFFLFVBQVUsSUFBSSxPQUFPLG1CQUFtQjtBQUN6RCxVQUFNLEtBQUssSUFBSTtBQUNmLFFBQUksS0FBSyxLQUFLLG1CQUFtQixZQUFZO0FBSXpDLFlBQU0sS0FBSztBQUNYLGFBQU8sR0FBRyxrQkFBbUIsTUFBTTtBQUMvQixjQUFNLFFBQVEsSUFBSSxTQUFTLENBQUMsQ0FBQztBQUM3QixjQUFNLGFBQWEsTUFBTSxHQUFHLEtBQUssS0FBSyxXQUFXLE1BQU0sTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNO0FBQ3hFLGdCQUFNLFNBQVMsY0FBYyxNQUFNLENBQUMsQ0FBQztBQUNyQyxnQkFBTTtBQUFBLFFBQ1YsQ0FBQztBQUNELGNBQU0sU0FBUyxNQUFNLFFBQVEsTUFBTSxJQUFJLE1BQU0sVUFBVTtBQUN2RCxjQUFNLGdCQUFnQixNQUFNLEdBQUcsS0FBSyxRQUFRLEtBQUssS0FDNUMsV0FBVyxRQUFRLE1BQU0sRUFDekIsTUFBTSxDQUFDLE1BQU07QUFDZCxnQkFBTSxTQUFTLGlCQUFpQixRQUFRLENBQUMsQ0FBQztBQUMxQyxnQkFBTTtBQUFBLFFBQ1YsQ0FBQztBQUNELGVBQU87QUFBQSxNQUNYLENBQUM7QUFBQSxJQUNMLE9BQ0s7QUFJRCxZQUFNLEtBQUs7QUFDWCxhQUFPLEdBQUcsWUFBYSxNQUFNO0FBQ3pCLGNBQU0sYUFBYSxHQUFHLEtBQUssS0FBSyxVQUFVLE1BQU0sTUFBTTtBQUN0RCxZQUFJLENBQUMsV0FBVyxTQUFTO0FBQ3JCLGdCQUFNLElBQUksU0FBUyxDQUFDLGNBQWMsTUFBTSxXQUFXLEtBQUssQ0FBQyxDQUFDO0FBQUEsUUFDOUQ7QUFDQSxjQUFNLFNBQVMsUUFBUSxNQUFNLElBQUksTUFBTSxXQUFXLElBQUk7QUFDdEQsY0FBTSxnQkFBZ0IsR0FBRyxLQUFLLFFBQVEsVUFBVSxRQUFRLE1BQU07QUFDOUQsWUFBSSxDQUFDLGNBQWMsU0FBUztBQUN4QixnQkFBTSxJQUFJLFNBQVMsQ0FBQyxpQkFBaUIsUUFBUSxjQUFjLEtBQUssQ0FBQyxDQUFDO0FBQUEsUUFDdEU7QUFDQSxlQUFPLGNBQWM7QUFBQSxNQUN6QixDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0o7QUFBQSxFQUNBLGFBQWE7QUFDVCxXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQUEsRUFDQSxhQUFhO0FBQ1QsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsUUFBUSxPQUFPO0FBQ1gsV0FBTyxJQUFJLGFBQVk7QUFBQSxNQUNuQixHQUFHLEtBQUs7QUFBQSxNQUNSLE1BQU0sU0FBUyxPQUFPLEtBQUssRUFBRSxLQUFLLFdBQVcsT0FBTyxDQUFDO0FBQUEsSUFDekQsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFFBQVEsWUFBWTtBQUNoQixXQUFPLElBQUksYUFBWTtBQUFBLE1BQ25CLEdBQUcsS0FBSztBQUFBLE1BQ1IsU0FBUztBQUFBLElBQ2IsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFVBQVUsTUFBTTtBQUNaLFVBQU0sZ0JBQWdCLEtBQUssTUFBTSxJQUFJO0FBQ3JDLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxnQkFBZ0IsTUFBTTtBQUNsQixVQUFNLGdCQUFnQixLQUFLLE1BQU0sSUFBSTtBQUNyQyxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsT0FBTyxPQUFPLE1BQU0sU0FBUyxRQUFRO0FBQ2pDLFdBQU8sSUFBSSxhQUFZO0FBQUEsTUFDbkIsTUFBTyxPQUFPLE9BQU8sU0FBUyxPQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUssV0FBVyxPQUFPLENBQUM7QUFBQSxNQUNqRSxTQUFTLFdBQVcsV0FBVyxPQUFPO0FBQUEsTUFDdEMsVUFBVSxzQkFBc0I7QUFBQSxNQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsSUFDakMsQ0FBQztBQUFBLEVBQ0w7QUFDSjtBQUNPLElBQU0sVUFBTixjQUFzQixRQUFRO0FBQUEsRUFDakMsSUFBSSxTQUFTO0FBQ1QsV0FBTyxLQUFLLEtBQUssT0FBTztBQUFBLEVBQzVCO0FBQUEsRUFDQSxPQUFPLE9BQU87QUFDVixVQUFNLEVBQUUsSUFBSSxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFDOUMsVUFBTSxhQUFhLEtBQUssS0FBSyxPQUFPO0FBQ3BDLFdBQU8sV0FBVyxPQUFPLEVBQUUsTUFBTSxJQUFJLE1BQU0sTUFBTSxJQUFJLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFBQSxFQUM1RTtBQUNKO0FBQ0EsUUFBUSxTQUFTLENBQUMsUUFBUSxXQUFXO0FBQ2pDLFNBQU8sSUFBSSxRQUFRO0FBQUEsSUFDZjtBQUFBLElBQ0EsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxhQUFOLGNBQXlCLFFBQVE7QUFBQSxFQUNwQyxPQUFPLE9BQU87QUFDVixRQUFJLE1BQU0sU0FBUyxLQUFLLEtBQUssT0FBTztBQUNoQyxZQUFNLE1BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0Qyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLFVBQVUsSUFBSTtBQUFBLFFBQ2QsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxLQUFLLEtBQUs7QUFBQSxNQUN4QixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxXQUFPLEVBQUUsUUFBUSxTQUFTLE9BQU8sTUFBTSxLQUFLO0FBQUEsRUFDaEQ7QUFBQSxFQUNBLElBQUksUUFBUTtBQUNSLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFDSjtBQUNBLFdBQVcsU0FBUyxDQUFDLE9BQU8sV0FBVztBQUNuQyxTQUFPLElBQUksV0FBVztBQUFBLElBQ2xCO0FBQUEsSUFDQSxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDQSxTQUFTLGNBQWMsUUFBUSxRQUFRO0FBQ25DLFNBQU8sSUFBSSxRQUFRO0FBQUEsSUFDZjtBQUFBLElBQ0EsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxVQUFOLE1BQU0saUJBQWdCLFFBQVE7QUFBQSxFQUNqQyxPQUFPLE9BQU87QUFDVixRQUFJLE9BQU8sTUFBTSxTQUFTLFVBQVU7QUFDaEMsWUFBTSxNQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDdEMsWUFBTSxpQkFBaUIsS0FBSyxLQUFLO0FBQ2pDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsVUFBVSxLQUFLLFdBQVcsY0FBYztBQUFBLFFBQ3hDLFVBQVUsSUFBSTtBQUFBLFFBQ2QsTUFBTSxhQUFhO0FBQUEsTUFDdkIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsUUFBSSxDQUFDLEtBQUssUUFBUTtBQUNkLFdBQUssU0FBUyxJQUFJLElBQUksS0FBSyxLQUFLLE1BQU07QUFBQSxJQUMxQztBQUNBLFFBQUksQ0FBQyxLQUFLLE9BQU8sSUFBSSxNQUFNLElBQUksR0FBRztBQUM5QixZQUFNLE1BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0QyxZQUFNLGlCQUFpQixLQUFLLEtBQUs7QUFDakMsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixVQUFVLElBQUk7QUFBQSxRQUNkLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFNBQVM7QUFBQSxNQUNiLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFdBQU8sR0FBRyxNQUFNLElBQUk7QUFBQSxFQUN4QjtBQUFBLEVBQ0EsSUFBSSxVQUFVO0FBQ1YsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsSUFBSSxPQUFPO0FBQ1AsVUFBTSxhQUFhLENBQUM7QUFDcEIsZUFBVyxPQUFPLEtBQUssS0FBSyxRQUFRO0FBQ2hDLGlCQUFXLEdBQUcsSUFBSTtBQUFBLElBQ3RCO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUNBLElBQUksU0FBUztBQUNULFVBQU0sYUFBYSxDQUFDO0FBQ3BCLGVBQVcsT0FBTyxLQUFLLEtBQUssUUFBUTtBQUNoQyxpQkFBVyxHQUFHLElBQUk7QUFBQSxJQUN0QjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxJQUFJLE9BQU87QUFDUCxVQUFNLGFBQWEsQ0FBQztBQUNwQixlQUFXLE9BQU8sS0FBSyxLQUFLLFFBQVE7QUFDaEMsaUJBQVcsR0FBRyxJQUFJO0FBQUEsSUFDdEI7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsUUFBUSxRQUFRLFNBQVMsS0FBSyxNQUFNO0FBQ2hDLFdBQU8sU0FBUSxPQUFPLFFBQVE7QUFBQSxNQUMxQixHQUFHLEtBQUs7QUFBQSxNQUNSLEdBQUc7QUFBQSxJQUNQLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxRQUFRLFFBQVEsU0FBUyxLQUFLLE1BQU07QUFDaEMsV0FBTyxTQUFRLE9BQU8sS0FBSyxRQUFRLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxTQUFTLEdBQUcsQ0FBQyxHQUFHO0FBQUEsTUFDdkUsR0FBRyxLQUFLO0FBQUEsTUFDUixHQUFHO0FBQUEsSUFDUCxDQUFDO0FBQUEsRUFDTDtBQUNKO0FBQ0EsUUFBUSxTQUFTO0FBQ1YsSUFBTSxnQkFBTixjQUE0QixRQUFRO0FBQUEsRUFDdkMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxtQkFBbUIsS0FBSyxtQkFBbUIsS0FBSyxLQUFLLE1BQU07QUFDakUsVUFBTSxNQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDdEMsUUFBSSxJQUFJLGVBQWUsY0FBYyxVQUFVLElBQUksZUFBZSxjQUFjLFFBQVE7QUFDcEYsWUFBTSxpQkFBaUIsS0FBSyxhQUFhLGdCQUFnQjtBQUN6RCx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLFVBQVUsS0FBSyxXQUFXLGNBQWM7QUFBQSxRQUN4QyxVQUFVLElBQUk7QUFBQSxRQUNkLE1BQU0sYUFBYTtBQUFBLE1BQ3ZCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFFBQUksQ0FBQyxLQUFLLFFBQVE7QUFDZCxXQUFLLFNBQVMsSUFBSSxJQUFJLEtBQUssbUJBQW1CLEtBQUssS0FBSyxNQUFNLENBQUM7QUFBQSxJQUNuRTtBQUNBLFFBQUksQ0FBQyxLQUFLLE9BQU8sSUFBSSxNQUFNLElBQUksR0FBRztBQUM5QixZQUFNLGlCQUFpQixLQUFLLGFBQWEsZ0JBQWdCO0FBQ3pELHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsVUFBVSxJQUFJO0FBQUEsUUFDZCxNQUFNLGFBQWE7QUFBQSxRQUNuQixTQUFTO0FBQUEsTUFDYixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxXQUFPLEdBQUcsTUFBTSxJQUFJO0FBQUEsRUFDeEI7QUFBQSxFQUNBLElBQUksT0FBTztBQUNQLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFDSjtBQUNBLGNBQWMsU0FBUyxDQUFDLFFBQVEsV0FBVztBQUN2QyxTQUFPLElBQUksY0FBYztBQUFBLElBQ3JCO0FBQUEsSUFDQSxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLGFBQU4sY0FBeUIsUUFBUTtBQUFBLEVBQ3BDLFNBQVM7QUFDTCxXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQUEsRUFDQSxPQUFPLE9BQU87QUFDVixVQUFNLEVBQUUsSUFBSSxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFDOUMsUUFBSSxJQUFJLGVBQWUsY0FBYyxXQUFXLElBQUksT0FBTyxVQUFVLE9BQU87QUFDeEUsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVLElBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxVQUFNLGNBQWMsSUFBSSxlQUFlLGNBQWMsVUFBVSxJQUFJLE9BQU8sUUFBUSxRQUFRLElBQUksSUFBSTtBQUNsRyxXQUFPLEdBQUcsWUFBWSxLQUFLLENBQUMsU0FBUztBQUNqQyxhQUFPLEtBQUssS0FBSyxLQUFLLFdBQVcsTUFBTTtBQUFBLFFBQ25DLE1BQU0sSUFBSTtBQUFBLFFBQ1YsVUFBVSxJQUFJLE9BQU87QUFBQSxNQUN6QixDQUFDO0FBQUEsSUFDTCxDQUFDLENBQUM7QUFBQSxFQUNOO0FBQ0o7QUFDQSxXQUFXLFNBQVMsQ0FBQyxRQUFRLFdBQVc7QUFDcEMsU0FBTyxJQUFJLFdBQVc7QUFBQSxJQUNsQixNQUFNO0FBQUEsSUFDTixVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLGFBQU4sY0FBeUIsUUFBUTtBQUFBLEVBQ3BDLFlBQVk7QUFDUixXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQUEsRUFDQSxhQUFhO0FBQ1QsV0FBTyxLQUFLLEtBQUssT0FBTyxLQUFLLGFBQWEsc0JBQXNCLGFBQzFELEtBQUssS0FBSyxPQUFPLFdBQVcsSUFDNUIsS0FBSyxLQUFLO0FBQUEsRUFDcEI7QUFBQSxFQUNBLE9BQU8sT0FBTztBQUNWLFVBQU0sRUFBRSxRQUFRLElBQUksSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBQ3RELFVBQU0sU0FBUyxLQUFLLEtBQUssVUFBVTtBQUNuQyxVQUFNLFdBQVc7QUFBQSxNQUNiLFVBQVUsQ0FBQyxRQUFRO0FBQ2YsMEJBQWtCLEtBQUssR0FBRztBQUMxQixZQUFJLElBQUksT0FBTztBQUNYLGlCQUFPLE1BQU07QUFBQSxRQUNqQixPQUNLO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSjtBQUFBLE1BQ0EsSUFBSSxPQUFPO0FBQ1AsZUFBTyxJQUFJO0FBQUEsTUFDZjtBQUFBLElBQ0o7QUFDQSxhQUFTLFdBQVcsU0FBUyxTQUFTLEtBQUssUUFBUTtBQUNuRCxRQUFJLE9BQU8sU0FBUyxjQUFjO0FBQzlCLFlBQU0sWUFBWSxPQUFPLFVBQVUsSUFBSSxNQUFNLFFBQVE7QUFDckQsVUFBSSxJQUFJLE9BQU8sT0FBTztBQUNsQixlQUFPLFFBQVEsUUFBUSxTQUFTLEVBQUUsS0FBSyxPQUFPQyxlQUFjO0FBQ3hELGNBQUksT0FBTyxVQUFVO0FBQ2pCLG1CQUFPO0FBQ1gsZ0JBQU0sU0FBUyxNQUFNLEtBQUssS0FBSyxPQUFPLFlBQVk7QUFBQSxZQUM5QyxNQUFNQTtBQUFBLFlBQ04sTUFBTSxJQUFJO0FBQUEsWUFDVixRQUFRO0FBQUEsVUFDWixDQUFDO0FBQ0QsY0FBSSxPQUFPLFdBQVc7QUFDbEIsbUJBQU87QUFDWCxjQUFJLE9BQU8sV0FBVztBQUNsQixtQkFBTyxNQUFNLE9BQU8sS0FBSztBQUM3QixjQUFJLE9BQU8sVUFBVTtBQUNqQixtQkFBTyxNQUFNLE9BQU8sS0FBSztBQUM3QixpQkFBTztBQUFBLFFBQ1gsQ0FBQztBQUFBLE1BQ0wsT0FDSztBQUNELFlBQUksT0FBTyxVQUFVO0FBQ2pCLGlCQUFPO0FBQ1gsY0FBTSxTQUFTLEtBQUssS0FBSyxPQUFPLFdBQVc7QUFBQSxVQUN2QyxNQUFNO0FBQUEsVUFDTixNQUFNLElBQUk7QUFBQSxVQUNWLFFBQVE7QUFBQSxRQUNaLENBQUM7QUFDRCxZQUFJLE9BQU8sV0FBVztBQUNsQixpQkFBTztBQUNYLFlBQUksT0FBTyxXQUFXO0FBQ2xCLGlCQUFPLE1BQU0sT0FBTyxLQUFLO0FBQzdCLFlBQUksT0FBTyxVQUFVO0FBQ2pCLGlCQUFPLE1BQU0sT0FBTyxLQUFLO0FBQzdCLGVBQU87QUFBQSxNQUNYO0FBQUEsSUFDSjtBQUNBLFFBQUksT0FBTyxTQUFTLGNBQWM7QUFDOUIsWUFBTSxvQkFBb0IsQ0FBQyxRQUFRO0FBQy9CLGNBQU0sU0FBUyxPQUFPLFdBQVcsS0FBSyxRQUFRO0FBQzlDLFlBQUksSUFBSSxPQUFPLE9BQU87QUFDbEIsaUJBQU8sUUFBUSxRQUFRLE1BQU07QUFBQSxRQUNqQztBQUNBLFlBQUksa0JBQWtCLFNBQVM7QUFDM0IsZ0JBQU0sSUFBSSxNQUFNLDJGQUEyRjtBQUFBLFFBQy9HO0FBQ0EsZUFBTztBQUFBLE1BQ1g7QUFDQSxVQUFJLElBQUksT0FBTyxVQUFVLE9BQU87QUFDNUIsY0FBTSxRQUFRLEtBQUssS0FBSyxPQUFPLFdBQVc7QUFBQSxVQUN0QyxNQUFNLElBQUk7QUFBQSxVQUNWLE1BQU0sSUFBSTtBQUFBLFVBQ1YsUUFBUTtBQUFBLFFBQ1osQ0FBQztBQUNELFlBQUksTUFBTSxXQUFXO0FBQ2pCLGlCQUFPO0FBQ1gsWUFBSSxNQUFNLFdBQVc7QUFDakIsaUJBQU8sTUFBTTtBQUVqQiwwQkFBa0IsTUFBTSxLQUFLO0FBQzdCLGVBQU8sRUFBRSxRQUFRLE9BQU8sT0FBTyxPQUFPLE1BQU0sTUFBTTtBQUFBLE1BQ3RELE9BQ0s7QUFDRCxlQUFPLEtBQUssS0FBSyxPQUFPLFlBQVksRUFBRSxNQUFNLElBQUksTUFBTSxNQUFNLElBQUksTUFBTSxRQUFRLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxVQUFVO0FBQ2pHLGNBQUksTUFBTSxXQUFXO0FBQ2pCLG1CQUFPO0FBQ1gsY0FBSSxNQUFNLFdBQVc7QUFDakIsbUJBQU8sTUFBTTtBQUNqQixpQkFBTyxrQkFBa0IsTUFBTSxLQUFLLEVBQUUsS0FBSyxNQUFNO0FBQzdDLG1CQUFPLEVBQUUsUUFBUSxPQUFPLE9BQU8sT0FBTyxNQUFNLE1BQU07QUFBQSxVQUN0RCxDQUFDO0FBQUEsUUFDTCxDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0o7QUFDQSxRQUFJLE9BQU8sU0FBUyxhQUFhO0FBQzdCLFVBQUksSUFBSSxPQUFPLFVBQVUsT0FBTztBQUM1QixjQUFNLE9BQU8sS0FBSyxLQUFLLE9BQU8sV0FBVztBQUFBLFVBQ3JDLE1BQU0sSUFBSTtBQUFBLFVBQ1YsTUFBTSxJQUFJO0FBQUEsVUFDVixRQUFRO0FBQUEsUUFDWixDQUFDO0FBQ0QsWUFBSSxDQUFDLFFBQVEsSUFBSTtBQUNiLGlCQUFPO0FBQ1gsY0FBTSxTQUFTLE9BQU8sVUFBVSxLQUFLLE9BQU8sUUFBUTtBQUNwRCxZQUFJLGtCQUFrQixTQUFTO0FBQzNCLGdCQUFNLElBQUksTUFBTSxpR0FBaUc7QUFBQSxRQUNySDtBQUNBLGVBQU8sRUFBRSxRQUFRLE9BQU8sT0FBTyxPQUFPLE9BQU87QUFBQSxNQUNqRCxPQUNLO0FBQ0QsZUFBTyxLQUFLLEtBQUssT0FBTyxZQUFZLEVBQUUsTUFBTSxJQUFJLE1BQU0sTUFBTSxJQUFJLE1BQU0sUUFBUSxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsU0FBUztBQUNoRyxjQUFJLENBQUMsUUFBUSxJQUFJO0FBQ2IsbUJBQU87QUFDWCxpQkFBTyxRQUFRLFFBQVEsT0FBTyxVQUFVLEtBQUssT0FBTyxRQUFRLENBQUMsRUFBRSxLQUFLLENBQUMsWUFBWTtBQUFBLFlBQzdFLFFBQVEsT0FBTztBQUFBLFlBQ2YsT0FBTztBQUFBLFVBQ1gsRUFBRTtBQUFBLFFBQ04sQ0FBQztBQUFBLE1BQ0w7QUFBQSxJQUNKO0FBQ0EsU0FBSyxZQUFZLE1BQU07QUFBQSxFQUMzQjtBQUNKO0FBQ0EsV0FBVyxTQUFTLENBQUMsUUFBUSxRQUFRLFdBQVc7QUFDNUMsU0FBTyxJQUFJLFdBQVc7QUFBQSxJQUNsQjtBQUFBLElBQ0EsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQztBQUFBLElBQ0EsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNBLFdBQVcsdUJBQXVCLENBQUMsWUFBWSxRQUFRLFdBQVc7QUFDOUQsU0FBTyxJQUFJLFdBQVc7QUFBQSxJQUNsQjtBQUFBLElBQ0EsUUFBUSxFQUFFLE1BQU0sY0FBYyxXQUFXLFdBQVc7QUFBQSxJQUNwRCxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFFTyxJQUFNLGNBQU4sY0FBMEIsUUFBUTtBQUFBLEVBQ3JDLE9BQU8sT0FBTztBQUNWLFVBQU0sYUFBYSxLQUFLLFNBQVMsS0FBSztBQUN0QyxRQUFJLGVBQWUsY0FBYyxXQUFXO0FBQ3hDLGFBQU8sR0FBRyxNQUFTO0FBQUEsSUFDdkI7QUFDQSxXQUFPLEtBQUssS0FBSyxVQUFVLE9BQU8sS0FBSztBQUFBLEVBQzNDO0FBQUEsRUFDQSxTQUFTO0FBQ0wsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUNKO0FBQ0EsWUFBWSxTQUFTLENBQUMsTUFBTSxXQUFXO0FBQ25DLFNBQU8sSUFBSSxZQUFZO0FBQUEsSUFDbkIsV0FBVztBQUFBLElBQ1gsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxjQUFOLGNBQTBCLFFBQVE7QUFBQSxFQUNyQyxPQUFPLE9BQU87QUFDVixVQUFNLGFBQWEsS0FBSyxTQUFTLEtBQUs7QUFDdEMsUUFBSSxlQUFlLGNBQWMsTUFBTTtBQUNuQyxhQUFPLEdBQUcsSUFBSTtBQUFBLElBQ2xCO0FBQ0EsV0FBTyxLQUFLLEtBQUssVUFBVSxPQUFPLEtBQUs7QUFBQSxFQUMzQztBQUFBLEVBQ0EsU0FBUztBQUNMLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFDSjtBQUNBLFlBQVksU0FBUyxDQUFDLE1BQU0sV0FBVztBQUNuQyxTQUFPLElBQUksWUFBWTtBQUFBLElBQ25CLFdBQVc7QUFBQSxJQUNYLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sYUFBTixjQUF5QixRQUFRO0FBQUEsRUFDcEMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxFQUFFLElBQUksSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBQzlDLFFBQUksT0FBTyxJQUFJO0FBQ2YsUUFBSSxJQUFJLGVBQWUsY0FBYyxXQUFXO0FBQzVDLGFBQU8sS0FBSyxLQUFLLGFBQWE7QUFBQSxJQUNsQztBQUNBLFdBQU8sS0FBSyxLQUFLLFVBQVUsT0FBTztBQUFBLE1BQzlCO0FBQUEsTUFDQSxNQUFNLElBQUk7QUFBQSxNQUNWLFFBQVE7QUFBQSxJQUNaLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxnQkFBZ0I7QUFDWixXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQ0o7QUFDQSxXQUFXLFNBQVMsQ0FBQyxNQUFNLFdBQVc7QUFDbEMsU0FBTyxJQUFJLFdBQVc7QUFBQSxJQUNsQixXQUFXO0FBQUEsSUFDWCxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLGNBQWMsT0FBTyxPQUFPLFlBQVksYUFBYSxPQUFPLFVBQVUsTUFBTSxPQUFPO0FBQUEsSUFDbkYsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sV0FBTixjQUF1QixRQUFRO0FBQUEsRUFDbEMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxFQUFFLElBQUksSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBRTlDLFVBQU0sU0FBUztBQUFBLE1BQ1gsR0FBRztBQUFBLE1BQ0gsUUFBUTtBQUFBLFFBQ0osR0FBRyxJQUFJO0FBQUEsUUFDUCxRQUFRLENBQUM7QUFBQSxNQUNiO0FBQUEsSUFDSjtBQUNBLFVBQU0sU0FBUyxLQUFLLEtBQUssVUFBVSxPQUFPO0FBQUEsTUFDdEMsTUFBTSxPQUFPO0FBQUEsTUFDYixNQUFNLE9BQU87QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNKLEdBQUc7QUFBQSxNQUNQO0FBQUEsSUFDSixDQUFDO0FBQ0QsUUFBSSxRQUFRLE1BQU0sR0FBRztBQUNqQixhQUFPLE9BQU8sS0FBSyxDQUFDQyxZQUFXO0FBQzNCLGVBQU87QUFBQSxVQUNILFFBQVE7QUFBQSxVQUNSLE9BQU9BLFFBQU8sV0FBVyxVQUNuQkEsUUFBTyxRQUNQLEtBQUssS0FBSyxXQUFXO0FBQUEsWUFDbkIsSUFBSSxRQUFRO0FBQ1IscUJBQU8sSUFBSSxTQUFTLE9BQU8sT0FBTyxNQUFNO0FBQUEsWUFDNUM7QUFBQSxZQUNBLE9BQU8sT0FBTztBQUFBLFVBQ2xCLENBQUM7QUFBQSxRQUNUO0FBQUEsTUFDSixDQUFDO0FBQUEsSUFDTCxPQUNLO0FBQ0QsYUFBTztBQUFBLFFBQ0gsUUFBUTtBQUFBLFFBQ1IsT0FBTyxPQUFPLFdBQVcsVUFDbkIsT0FBTyxRQUNQLEtBQUssS0FBSyxXQUFXO0FBQUEsVUFDbkIsSUFBSSxRQUFRO0FBQ1IsbUJBQU8sSUFBSSxTQUFTLE9BQU8sT0FBTyxNQUFNO0FBQUEsVUFDNUM7QUFBQSxVQUNBLE9BQU8sT0FBTztBQUFBLFFBQ2xCLENBQUM7QUFBQSxNQUNUO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBLGNBQWM7QUFDVixXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQ0o7QUFDQSxTQUFTLFNBQVMsQ0FBQyxNQUFNLFdBQVc7QUFDaEMsU0FBTyxJQUFJLFNBQVM7QUFBQSxJQUNoQixXQUFXO0FBQUEsSUFDWCxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLFlBQVksT0FBTyxPQUFPLFVBQVUsYUFBYSxPQUFPLFFBQVEsTUFBTSxPQUFPO0FBQUEsSUFDN0UsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sU0FBTixjQUFxQixRQUFRO0FBQUEsRUFDaEMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxhQUFhLEtBQUssU0FBUyxLQUFLO0FBQ3RDLFFBQUksZUFBZSxjQUFjLEtBQUs7QUFDbEMsWUFBTSxNQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDdEMsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVLElBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxXQUFPLEVBQUUsUUFBUSxTQUFTLE9BQU8sTUFBTSxLQUFLO0FBQUEsRUFDaEQ7QUFDSjtBQUNBLE9BQU8sU0FBUyxDQUFDLFdBQVc7QUFDeEIsU0FBTyxJQUFJLE9BQU87QUFBQSxJQUNkLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sUUFBUSxPQUFPLFdBQVc7QUFDaEMsSUFBTSxhQUFOLGNBQXlCLFFBQVE7QUFBQSxFQUNwQyxPQUFPLE9BQU87QUFDVixVQUFNLEVBQUUsSUFBSSxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFDOUMsVUFBTSxPQUFPLElBQUk7QUFDakIsV0FBTyxLQUFLLEtBQUssS0FBSyxPQUFPO0FBQUEsTUFDekI7QUFBQSxNQUNBLE1BQU0sSUFBSTtBQUFBLE1BQ1YsUUFBUTtBQUFBLElBQ1osQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFNBQVM7QUFDTCxXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQ0o7QUFDTyxJQUFNLGNBQU4sTUFBTSxxQkFBb0IsUUFBUTtBQUFBLEVBQ3JDLE9BQU8sT0FBTztBQUNWLFVBQU0sRUFBRSxRQUFRLElBQUksSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBQ3RELFFBQUksSUFBSSxPQUFPLE9BQU87QUFDbEIsWUFBTSxjQUFjLFlBQVk7QUFDNUIsY0FBTSxXQUFXLE1BQU0sS0FBSyxLQUFLLEdBQUcsWUFBWTtBQUFBLFVBQzVDLE1BQU0sSUFBSTtBQUFBLFVBQ1YsTUFBTSxJQUFJO0FBQUEsVUFDVixRQUFRO0FBQUEsUUFDWixDQUFDO0FBQ0QsWUFBSSxTQUFTLFdBQVc7QUFDcEIsaUJBQU87QUFDWCxZQUFJLFNBQVMsV0FBVyxTQUFTO0FBQzdCLGlCQUFPLE1BQU07QUFDYixpQkFBTyxNQUFNLFNBQVMsS0FBSztBQUFBLFFBQy9CLE9BQ0s7QUFDRCxpQkFBTyxLQUFLLEtBQUssSUFBSSxZQUFZO0FBQUEsWUFDN0IsTUFBTSxTQUFTO0FBQUEsWUFDZixNQUFNLElBQUk7QUFBQSxZQUNWLFFBQVE7QUFBQSxVQUNaLENBQUM7QUFBQSxRQUNMO0FBQUEsTUFDSjtBQUNBLGFBQU8sWUFBWTtBQUFBLElBQ3ZCLE9BQ0s7QUFDRCxZQUFNLFdBQVcsS0FBSyxLQUFLLEdBQUcsV0FBVztBQUFBLFFBQ3JDLE1BQU0sSUFBSTtBQUFBLFFBQ1YsTUFBTSxJQUFJO0FBQUEsUUFDVixRQUFRO0FBQUEsTUFDWixDQUFDO0FBQ0QsVUFBSSxTQUFTLFdBQVc7QUFDcEIsZUFBTztBQUNYLFVBQUksU0FBUyxXQUFXLFNBQVM7QUFDN0IsZUFBTyxNQUFNO0FBQ2IsZUFBTztBQUFBLFVBQ0gsUUFBUTtBQUFBLFVBQ1IsT0FBTyxTQUFTO0FBQUEsUUFDcEI7QUFBQSxNQUNKLE9BQ0s7QUFDRCxlQUFPLEtBQUssS0FBSyxJQUFJLFdBQVc7QUFBQSxVQUM1QixNQUFNLFNBQVM7QUFBQSxVQUNmLE1BQU0sSUFBSTtBQUFBLFVBQ1YsUUFBUTtBQUFBLFFBQ1osQ0FBQztBQUFBLE1BQ0w7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0EsT0FBTyxPQUFPLEdBQUcsR0FBRztBQUNoQixXQUFPLElBQUksYUFBWTtBQUFBLE1BQ25CLElBQUk7QUFBQSxNQUNKLEtBQUs7QUFBQSxNQUNMLFVBQVUsc0JBQXNCO0FBQUEsSUFDcEMsQ0FBQztBQUFBLEVBQ0w7QUFDSjtBQUNPLElBQU0sY0FBTixjQUEwQixRQUFRO0FBQUEsRUFDckMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxTQUFTLEtBQUssS0FBSyxVQUFVLE9BQU8sS0FBSztBQUMvQyxVQUFNLFNBQVMsQ0FBQyxTQUFTO0FBQ3JCLFVBQUksUUFBUSxJQUFJLEdBQUc7QUFDZixhQUFLLFFBQVEsT0FBTyxPQUFPLEtBQUssS0FBSztBQUFBLE1BQ3pDO0FBQ0EsYUFBTztBQUFBLElBQ1g7QUFDQSxXQUFPLFFBQVEsTUFBTSxJQUFJLE9BQU8sS0FBSyxDQUFDLFNBQVMsT0FBTyxJQUFJLENBQUMsSUFBSSxPQUFPLE1BQU07QUFBQSxFQUNoRjtBQUFBLEVBQ0EsU0FBUztBQUNMLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFDSjtBQUNBLFlBQVksU0FBUyxDQUFDLE1BQU0sV0FBVztBQUNuQyxTQUFPLElBQUksWUFBWTtBQUFBLElBQ25CLFdBQVc7QUFBQSxJQUNYLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQVFBLFNBQVMsWUFBWSxRQUFRLE1BQU07QUFDL0IsUUFBTSxJQUFJLE9BQU8sV0FBVyxhQUFhLE9BQU8sSUFBSSxJQUFJLE9BQU8sV0FBVyxXQUFXLEVBQUUsU0FBUyxPQUFPLElBQUk7QUFDM0csUUFBTSxLQUFLLE9BQU8sTUFBTSxXQUFXLEVBQUUsU0FBUyxFQUFFLElBQUk7QUFDcEQsU0FBTztBQUNYO0FBQ08sU0FBUyxPQUFPLE9BQU8sVUFBVSxDQUFDLEdBV3pDLE9BQU87QUFDSCxNQUFJO0FBQ0EsV0FBTyxPQUFPLE9BQU8sRUFBRSxZQUFZLENBQUMsTUFBTSxRQUFRO0FBQzlDLFlBQU0sSUFBSSxNQUFNLElBQUk7QUFDcEIsVUFBSSxhQUFhLFNBQVM7QUFDdEIsZUFBTyxFQUFFLEtBQUssQ0FBQ0MsT0FBTTtBQUNqQixjQUFJLENBQUNBLElBQUc7QUFDSixrQkFBTSxTQUFTLFlBQVksU0FBUyxJQUFJO0FBQ3hDLGtCQUFNLFNBQVMsT0FBTyxTQUFTLFNBQVM7QUFDeEMsZ0JBQUksU0FBUyxFQUFFLE1BQU0sVUFBVSxHQUFHLFFBQVEsT0FBTyxPQUFPLENBQUM7QUFBQSxVQUM3RDtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0w7QUFDQSxVQUFJLENBQUMsR0FBRztBQUNKLGNBQU0sU0FBUyxZQUFZLFNBQVMsSUFBSTtBQUN4QyxjQUFNLFNBQVMsT0FBTyxTQUFTLFNBQVM7QUFDeEMsWUFBSSxTQUFTLEVBQUUsTUFBTSxVQUFVLEdBQUcsUUFBUSxPQUFPLE9BQU8sQ0FBQztBQUFBLE1BQzdEO0FBQ0E7QUFBQSxJQUNKLENBQUM7QUFDTCxTQUFPLE9BQU8sT0FBTztBQUN6QjtBQUVPLElBQU0sT0FBTztBQUFBLEVBQ2hCLFFBQVEsVUFBVTtBQUN0QjtBQUNPLElBQUk7QUFBQSxDQUNWLFNBQVVDLHdCQUF1QjtBQUM5QixFQUFBQSx1QkFBc0IsV0FBVyxJQUFJO0FBQ3JDLEVBQUFBLHVCQUFzQixXQUFXLElBQUk7QUFDckMsRUFBQUEsdUJBQXNCLFFBQVEsSUFBSTtBQUNsQyxFQUFBQSx1QkFBc0IsV0FBVyxJQUFJO0FBQ3JDLEVBQUFBLHVCQUFzQixZQUFZLElBQUk7QUFDdEMsRUFBQUEsdUJBQXNCLFNBQVMsSUFBSTtBQUNuQyxFQUFBQSx1QkFBc0IsV0FBVyxJQUFJO0FBQ3JDLEVBQUFBLHVCQUFzQixjQUFjLElBQUk7QUFDeEMsRUFBQUEsdUJBQXNCLFNBQVMsSUFBSTtBQUNuQyxFQUFBQSx1QkFBc0IsUUFBUSxJQUFJO0FBQ2xDLEVBQUFBLHVCQUFzQixZQUFZLElBQUk7QUFDdEMsRUFBQUEsdUJBQXNCLFVBQVUsSUFBSTtBQUNwQyxFQUFBQSx1QkFBc0IsU0FBUyxJQUFJO0FBQ25DLEVBQUFBLHVCQUFzQixVQUFVLElBQUk7QUFDcEMsRUFBQUEsdUJBQXNCLFdBQVcsSUFBSTtBQUNyQyxFQUFBQSx1QkFBc0IsVUFBVSxJQUFJO0FBQ3BDLEVBQUFBLHVCQUFzQix1QkFBdUIsSUFBSTtBQUNqRCxFQUFBQSx1QkFBc0IsaUJBQWlCLElBQUk7QUFDM0MsRUFBQUEsdUJBQXNCLFVBQVUsSUFBSTtBQUNwQyxFQUFBQSx1QkFBc0IsV0FBVyxJQUFJO0FBQ3JDLEVBQUFBLHVCQUFzQixRQUFRLElBQUk7QUFDbEMsRUFBQUEsdUJBQXNCLFFBQVEsSUFBSTtBQUNsQyxFQUFBQSx1QkFBc0IsYUFBYSxJQUFJO0FBQ3ZDLEVBQUFBLHVCQUFzQixTQUFTLElBQUk7QUFDbkMsRUFBQUEsdUJBQXNCLFlBQVksSUFBSTtBQUN0QyxFQUFBQSx1QkFBc0IsU0FBUyxJQUFJO0FBQ25DLEVBQUFBLHVCQUFzQixZQUFZLElBQUk7QUFDdEMsRUFBQUEsdUJBQXNCLGVBQWUsSUFBSTtBQUN6QyxFQUFBQSx1QkFBc0IsYUFBYSxJQUFJO0FBQ3ZDLEVBQUFBLHVCQUFzQixhQUFhLElBQUk7QUFDdkMsRUFBQUEsdUJBQXNCLFlBQVksSUFBSTtBQUN0QyxFQUFBQSx1QkFBc0IsVUFBVSxJQUFJO0FBQ3BDLEVBQUFBLHVCQUFzQixZQUFZLElBQUk7QUFDdEMsRUFBQUEsdUJBQXNCLFlBQVksSUFBSTtBQUN0QyxFQUFBQSx1QkFBc0IsYUFBYSxJQUFJO0FBQ3ZDLEVBQUFBLHVCQUFzQixhQUFhLElBQUk7QUFDM0MsR0FBRywwQkFBMEIsd0JBQXdCLENBQUMsRUFBRTtBQUt4RCxJQUFNLGlCQUFpQixDQUV2QixLQUFLLFNBQVM7QUFBQSxFQUNWLFNBQVMseUJBQXlCLElBQUksSUFBSTtBQUM5QyxNQUFNLE9BQU8sQ0FBQyxTQUFTLGdCQUFnQixLQUFLLE1BQU07QUFDbEQsSUFBTSxhQUFhLFVBQVU7QUFDN0IsSUFBTSxhQUFhLFVBQVU7QUFDN0IsSUFBTSxVQUFVLE9BQU87QUFDdkIsSUFBTSxhQUFhLFVBQVU7QUFDN0IsSUFBTSxjQUFjLFdBQVc7QUFDL0IsSUFBTSxXQUFXLFFBQVE7QUFDekIsSUFBTSxhQUFhLFVBQVU7QUFDN0IsSUFBTSxnQkFBZ0IsYUFBYTtBQUNuQyxJQUFNLFdBQVcsUUFBUTtBQUN6QixJQUFNLFVBQVUsT0FBTztBQUN2QixJQUFNLGNBQWMsV0FBVztBQUMvQixJQUFNLFlBQVksU0FBUztBQUMzQixJQUFNLFdBQVcsUUFBUTtBQUN6QixJQUFNLFlBQVksU0FBUztBQUMzQixJQUFNLGFBQWEsVUFBVTtBQUM3QixJQUFNLG1CQUFtQixVQUFVO0FBQ25DLElBQU0sWUFBWSxTQUFTO0FBQzNCLElBQU0seUJBQXlCLHNCQUFzQjtBQUNyRCxJQUFNLG1CQUFtQixnQkFBZ0I7QUFDekMsSUFBTSxZQUFZLFNBQVM7QUFDM0IsSUFBTSxhQUFhLFVBQVU7QUFDN0IsSUFBTSxVQUFVLE9BQU87QUFDdkIsSUFBTSxVQUFVLE9BQU87QUFDdkIsSUFBTSxlQUFlLFlBQVk7QUFDakMsSUFBTSxXQUFXLFFBQVE7QUFDekIsSUFBTSxjQUFjLFdBQVc7QUFDL0IsSUFBTSxXQUFXLFFBQVE7QUFDekIsSUFBTSxpQkFBaUIsY0FBYztBQUNyQyxJQUFNLGNBQWMsV0FBVztBQUMvQixJQUFNLGNBQWMsV0FBVztBQUMvQixJQUFNLGVBQWUsWUFBWTtBQUNqQyxJQUFNLGVBQWUsWUFBWTtBQUNqQyxJQUFNLGlCQUFpQixXQUFXO0FBQ2xDLElBQU0sZUFBZSxZQUFZO0FBQ2pDLElBQU0sVUFBVSxNQUFNLFdBQVcsRUFBRSxTQUFTO0FBQzVDLElBQU0sVUFBVSxNQUFNLFdBQVcsRUFBRSxTQUFTO0FBQzVDLElBQU0sV0FBVyxNQUFNLFlBQVksRUFBRSxTQUFTO0FBQ3ZDLElBQU0sU0FBUztBQUFBLEVBQ2xCLFFBQVMsQ0FBQyxRQUFRLFVBQVUsT0FBTyxFQUFFLEdBQUcsS0FBSyxRQUFRLEtBQUssQ0FBQztBQUFBLEVBQzNELFFBQVMsQ0FBQyxRQUFRLFVBQVUsT0FBTyxFQUFFLEdBQUcsS0FBSyxRQUFRLEtBQUssQ0FBQztBQUFBLEVBQzNELFNBQVUsQ0FBQyxRQUFRLFdBQVcsT0FBTztBQUFBLElBQ2pDLEdBQUc7QUFBQSxJQUNILFFBQVE7QUFBQSxFQUNaLENBQUM7QUFBQSxFQUNELFFBQVMsQ0FBQyxRQUFRLFVBQVUsT0FBTyxFQUFFLEdBQUcsS0FBSyxRQUFRLEtBQUssQ0FBQztBQUFBLEVBQzNELE1BQU8sQ0FBQyxRQUFRLFFBQVEsT0FBTyxFQUFFLEdBQUcsS0FBSyxRQUFRLEtBQUssQ0FBQztBQUMzRDtBQUVPLElBQU0sUUFBUTs7O0FDamxIZCxJQUFNLGFBQWEsaUJBQUUsS0FBSyxDQUFDLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFLckQsSUFBTSxxQkFBcUIsaUJBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUtqRCxJQUFNLGVBQWU7QUFBQSxFQUMxQixPQUFPLG1CQUFtQixTQUFTO0FBQUEsRUFDbkMsT0FBTyxXQUFXLFNBQVM7QUFDN0I7OztBQy9CQSxJQUFNLGVBQWU7QUFDZCxJQUFNLFdBQVcsaUJBQ3JCLE9BQU87QUFBQSxFQUNOLEdBQUcsaUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQztBQUFBLEVBQ3pCLEdBQUcsaUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQztBQUFBLEVBQ3pCLEdBQUcsaUJBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEVBQ3pCLEdBQUcsaUJBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUMzQixDQUFDLEVBQ0E7QUFBQSxFQUNDLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLElBQUksZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLEtBQUssSUFBSTtBQUFBLEVBQ3pELEVBQUUsU0FBUyx1RUFBNkQ7QUFDMUU7QUFRSyxJQUFNLGFBQWEsaUJBQUUsT0FBTztBQUFBLEVBQ2pDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsT0FBTztBQUFBLEVBQ3ZCLEtBQUssaUJBQUUsT0FBTyxFQUFFLElBQUk7QUFBQTtBQUFBO0FBQUEsRUFHcEIsS0FBSyxpQkFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFO0FBQUEsRUFDMUIsU0FBUyxpQkFBRSxPQUFPLEVBQUUsU0FBUztBQUFBO0FBQUE7QUFBQSxFQUc3QixHQUFHO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQVFILE1BQU0sU0FBUyxTQUFTO0FBQUEsRUFDeEIsV0FBVyxpQkFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFDNUMsQ0FBQzs7O0FDakJNLElBQU0sYUFBYSxpQkFBRSxPQUFPO0FBQUEsRUFDakMsTUFBTSxpQkFBRSxPQUFPO0FBQUEsRUFDZixNQUFNLGlCQUFFLE9BQU87QUFBQSxFQUNmLE1BQU0saUJBQUUsT0FBTztBQUFBLEVBQ2YsTUFBTSxpQkFBRSxPQUFPO0FBQUEsRUFDZixXQUFXLGlCQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDMUMsV0FBVyxpQkFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQztBQUFBLEVBQzFDLFVBQVUsaUJBQUUsUUFBUSxFQUFFLFFBQVEsSUFBSTtBQUFBO0FBQUE7QUFBQSxFQUdsQyxZQUFZLGlCQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFDdEMsQ0FBQztBQVNNLElBQU0sZ0JBQWdCLGlCQUFFLEtBQUssQ0FBQyxRQUFRLFFBQVEsQ0FBQztBQUsvQyxJQUFNLGNBQWMsaUJBQUUsT0FBTztBQUFBLEVBQ2xDLEtBQUssaUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQSxFQUN6QixVQUFVLGNBQWMsU0FBUztBQUFBLEVBQ2pDLEtBQUssaUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQSxFQUN6QixVQUFVLGNBQWMsU0FBUztBQUNuQyxDQUFDO0FBYU0sSUFBTSxjQUFjLGlCQUFFLE9BQU87QUFBQSxFQUNsQyxRQUFRLGlCQUFFLFFBQVEsUUFBUTtBQUFBLEVBQzFCLE9BQU8saUJBQUUsT0FBTztBQUFBLEVBQ2hCLFdBQVcsaUJBQUUsT0FBTztBQUFBLEVBQ3BCLGdCQUFnQixpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUFBLEVBQ3BELG9CQUFvQixpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUMxRCxDQUFDO0FBR00sSUFBTSxpQkFBaUIsaUJBQUUsT0FBTztBQUFBLEVBQ3JDLFFBQVEsaUJBQUUsUUFBUSxXQUFXO0FBQUEsRUFDN0IsR0FBRyxpQkFBRSxPQUFPO0FBQUEsRUFDWixHQUFHLGlCQUFFLE9BQU87QUFBQSxFQUNaLEdBQUcsaUJBQUUsT0FBTztBQUFBLEVBQ1osWUFBWSxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUFBLEVBQ2hELFlBQVksaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFBQSxFQUNoRCxZQUFZLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQ2xELENBQUM7QUFHTSxJQUFNLG1CQUFtQixpQkFBRSxPQUFPO0FBQUEsRUFDdkMsUUFBUSxpQkFBRSxRQUFRLGFBQWE7QUFBQSxFQUMvQixHQUFHLGlCQUFFLE9BQU87QUFBQSxFQUNaLEdBQUcsaUJBQUUsT0FBTztBQUFBLEVBQ1osWUFBWSxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUFBLEVBQ2hELFlBQVksaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFDbEQsQ0FBQztBQUdNLElBQU0sbUJBQW1CLGlCQUFFLE9BQU87QUFBQSxFQUN2QyxRQUFRLGlCQUFFLFFBQVEsYUFBYTtBQUFBLEVBQy9CLEdBQUcsaUJBQUUsT0FBTztBQUFBLEVBQ1osR0FBRyxpQkFBRSxPQUFPO0FBQUEsRUFDWixZQUFZLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQUEsRUFDaEQsWUFBWSxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUNsRCxDQUFDO0FBT00sSUFBTSxnQkFBZ0IsaUJBQUUsT0FBTztBQUFBLEVBQ3BDLFFBQVEsaUJBQUUsUUFBUSxVQUFVO0FBQUEsRUFDNUIsR0FBRyxpQkFBRSxPQUFPO0FBQUEsRUFDWixZQUFZLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQ2xELENBQUM7QUFLTSxJQUFNLGdCQUFnQixpQkFBRSxtQkFBbUIsVUFBVTtBQUFBLEVBQzFEO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFZTSxJQUFNLGdCQUFnQixpQkFBRSxLQUFLO0FBQUEsRUFDbEM7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQUdELElBQU0sZ0JBQWdCLGlCQUFFLE9BQU87QUFBQSxFQUM3QixNQUFNLGlCQUFFLFFBQVEsT0FBTztBQUFBLEVBQ3ZCLElBQUksaUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQztBQUFBLEVBQ3BDLE9BQU8saUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQTtBQUFBLEVBRTNCLE9BQU8sY0FBYyxTQUFTO0FBQUEsRUFDOUIsT0FBTyxjQUFjLFNBQVM7QUFDaEMsQ0FBQztBQUNELElBQU0sZ0JBQWdCLGlCQUFFLE9BQU87QUFBQSxFQUM3QixNQUFNLGlCQUFFLFFBQVEsT0FBTztBQUFBLEVBQ3ZCLE9BQU87QUFBQTtBQUFBO0FBQUEsRUFHUCxPQUFPLGlCQUFFLEtBQUssQ0FBQyxTQUFTLFFBQVEsQ0FBQyxFQUFFLFNBQVM7QUFBQSxFQUM1QyxPQUFPLGlCQUFFLEtBQUssQ0FBQyxTQUFTLFNBQVMsUUFBUSxPQUFPLENBQUMsRUFBRSxTQUFTO0FBQUEsRUFDNUQsUUFBUSxZQUFZLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNN0IsUUFBUSxpQkFBRSxRQUFRLEVBQUUsU0FBUztBQUFBLEVBQzdCLE9BQU8sY0FBYyxTQUFTO0FBQ2hDLENBQUM7QUFJRCxJQUFNLHFCQUFxQixpQkFBRSxPQUFPO0FBQUEsRUFDbEMsTUFBTSxpQkFBRSxRQUFRLFlBQVk7QUFBQSxFQUM1QixZQUFZLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUM7QUFBQSxFQUM1QixPQUFPLGlCQUFFLEtBQUssQ0FBQyxTQUFTLFFBQVEsQ0FBQyxFQUFFLFNBQVM7QUFBQTtBQUFBLEVBRTVDLFFBQVEsaUJBQUUsUUFBUSxFQUFFLFNBQVM7QUFBQSxFQUM3QixPQUFPLGNBQWMsU0FBUztBQUNoQyxDQUFDO0FBQ0QsSUFBTSxrQkFBa0IsaUJBQUUsT0FBTztBQUFBLEVBQy9CLE1BQU0saUJBQUUsUUFBUSxTQUFTO0FBQUEsRUFDekIsTUFBTSxpQkFBRSxNQUFNLENBQUMsaUJBQUUsT0FBTyxHQUFHLGlCQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQUEsRUFDdEMsSUFBSSxpQkFBRSxNQUFNLENBQUMsaUJBQUUsT0FBTyxHQUFHLGlCQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQUE7QUFBQSxFQUVwQyxXQUFXLGlCQUFFLE1BQU0sQ0FBQyxlQUFlLGFBQWEsQ0FBQyxFQUFFLFNBQVM7QUFBQSxFQUM1RCxPQUFPLGNBQWMsU0FBUztBQUNoQyxDQUFDO0FBSUQsSUFBTSxjQUFjLGlCQUFFLE9BQU87QUFBQSxFQUMzQixNQUFNLGlCQUFFLFFBQVEsS0FBSztBQUFBLEVBQ3JCLE1BQU0saUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQztBQUFBLEVBQ3RDLFNBQVMsaUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQztBQUFBLEVBQ3pDLFdBQVcsY0FBYyxTQUFTO0FBQUE7QUFBQSxFQUVsQyxRQUFRLGlCQUFFLFFBQVEsRUFBRSxTQUFTO0FBQUEsRUFDN0IsT0FBTyxjQUFjLFNBQVM7QUFDaEMsQ0FBQztBQUNELElBQU0sa0JBQWtCLGlCQUFFLE9BQU87QUFBQSxFQUMvQixNQUFNLGlCQUFFLFFBQVEsU0FBUztBQUFBLEVBQ3pCLFVBQVUsaUJBQUUsTUFBTSxpQkFBRSxNQUFNLENBQUMsaUJBQUUsT0FBTyxHQUFHLGlCQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxFQUMxRCxRQUFRLGlCQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFBQSxFQUNoQyxPQUFPLGNBQWMsU0FBUztBQUNoQyxDQUFDO0FBQ00sSUFBTSxXQUFXLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDbkQ7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7OztBQ25NTSxJQUFNLG1CQUFtQixpQkFBRSxPQUFPO0FBQUEsRUFDdkMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxjQUFjO0FBQUEsRUFDOUIsTUFBTTtBQUFBLEVBQ04sV0FBVyxpQkFBRSxNQUFNLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN6QyxDQUFDOzs7QUNVRCxJQUFNLFdBQVcsaUJBQUUsT0FBTyxFQUFFLE1BQU0saUJBQUUsUUFBUSxNQUFNLEVBQUUsQ0FBQztBQUNyRCxJQUFNLGFBQWEsaUJBQUUsT0FBTyxFQUFFLE1BQU0saUJBQUUsUUFBUSxRQUFRLEVBQUUsQ0FBQztBQUN6RCxJQUFNLGdCQUFnQixpQkFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBRSxRQUFRLFdBQVcsRUFBRSxDQUFDO0FBQy9ELElBQU0sV0FBVyxpQkFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBRSxRQUFRLE1BQU0sRUFBRSxDQUFDO0FBQ3JELElBQU0sZ0JBQWdCLGlCQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFFLFFBQVEsV0FBVyxFQUFFLENBQUM7QUFDL0QsSUFBTSxrQkFBa0IsaUJBQUUsT0FBTyxFQUFFLE1BQU0saUJBQUUsUUFBUSxhQUFhLEVBQUUsQ0FBQztBQUtuRSxJQUFNLGFBQWEsaUJBQUUsbUJBQW1CLFFBQVE7QUFBQSxFQUM5QztBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQVdNLElBQU0sYUFBYSxpQkFBRSxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTWpDLElBQUksaUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQztBQUFBLEVBQ3BCLFFBQVEsaUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQztBQUFBO0FBQUEsRUFFeEIsbUJBQW1CLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQTtBQUFBO0FBQUEsRUFHakQsYUFBYSxpQkFBRSxLQUFLLENBQUMsU0FBUyxZQUFZLENBQUMsRUFBRSxTQUFTO0FBQUE7QUFBQSxFQUV0RCxXQUFXLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxTQUFTO0FBQ3hDLENBQUM7QUFPTSxJQUFNLGlCQUFpQixpQkFBRSxPQUFPO0FBQUEsRUFDckMsTUFBTSxpQkFBRSxRQUFRLGFBQWE7QUFBQSxFQUM3QixPQUFPLGlCQUFFLE9BQU87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNaEIsU0FBUyxpQkFBRSxNQUFNLFVBQVUsRUFBRSxTQUFTO0FBQ3hDLENBQUM7QUFPTSxJQUFNLGdCQUFnQixpQkFBRSxPQUFPO0FBQUEsRUFDcEMsTUFBTSxpQkFBRSxRQUFRLFlBQVk7QUFDOUIsQ0FBQztBQVNELElBQU0sd0JBQXdCLGlCQUFFLE9BQU87QUFBQSxFQUNyQyxNQUFNLGlCQUFFLFFBQVEsTUFBTTtBQUFBLEVBQ3RCLE1BQU0saUJBQUUsT0FBTztBQUFBLEVBQ2YsT0FBTyxpQkFBRSxNQUFNLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBQ00sSUFBTSwwQkFBMEIsaUJBQUUsbUJBQW1CLFFBQVE7QUFBQSxFQUNsRTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQTBDRCxJQUFNLG9CQUFvQixpQkFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVM7QUFpQ3JELElBQU0sMkJBQTJCLGlCQUFFLE9BQU87QUFBQSxFQUN4QyxJQUFJO0FBQUEsRUFDSixNQUFNLGlCQUFFLFFBQVEsV0FBVztBQUFBLEVBQzNCLFNBQVMsaUJBQUUsTUFBTSx1QkFBdUIsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN0RCxDQUFDO0FBSUQsSUFBTSx5QkFBeUIsaUJBQUUsT0FBTztBQUFBLEVBQ3RDLElBQUk7QUFBQSxFQUNKLE1BQU0saUJBQUUsUUFBUSxTQUFTO0FBQUEsRUFDekIsT0FBTyxpQkFBRSxNQUFNLENBQUMsaUJBQUUsUUFBUSxDQUFDLEdBQUcsaUJBQUUsUUFBUSxDQUFDLEdBQUcsaUJBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUFBLEVBQ3pELFNBQVMsaUJBQUUsTUFBTSx1QkFBdUIsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN0RCxDQUFDO0FBUUQsSUFBTSxzQkFBc0IsaUJBQUUsT0FBTztBQUFBLEVBQ25DLElBQUk7QUFBQSxFQUNKLE1BQU0saUJBQUUsUUFBUSxZQUFZO0FBQUEsRUFDNUIsT0FBTyxpQkFBRSxPQUFPO0FBQUEsRUFDaEIsR0FBRztBQUNMLENBQUM7QUFPRCxJQUFNLHVCQUF1QixpQkFBRSxPQUFPO0FBQUEsRUFDcEMsSUFBSTtBQUFBLEVBQ0osTUFBTSxpQkFBRSxRQUFRLE9BQU87QUFBQSxFQUN2QixLQUFLLGlCQUFFLE9BQU87QUFBQSxFQUNkLEtBQUssaUJBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRTtBQUFBLEVBQzFCLEdBQUc7QUFBQSxFQUNILE1BQU0sU0FBUyxTQUFTO0FBQUEsRUFDeEIsV0FBVyxpQkFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFDNUMsQ0FBQztBQXNCTSxJQUFNLHFCQUlULGlCQUFFO0FBQUEsRUFBSyxNQUNULGlCQUFFLE9BQU87QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLFNBQVMsaUJBQUUsTUFBTSx1QkFBdUIsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUFBLElBQ3BELFVBQVUsaUJBQ1AsTUFBTSxpQkFBRSxNQUFNLENBQUMsMkJBQTJCLDBCQUEwQixDQUFDLENBQUMsRUFDdEUsU0FBUztBQUFBLEVBQ2QsQ0FBQztBQUNIO0FBRU8sSUFBTSw0QkFBNEIsaUJBQUUsT0FBTztBQUFBLEVBQ2hELElBQUk7QUFBQSxFQUNKLE1BQU0saUJBQUUsUUFBUSxhQUFhO0FBQUEsRUFDN0IsT0FBTyxpQkFBRSxNQUFNLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFFTSxJQUFNLDZCQUE2QixpQkFBRSxPQUFPO0FBQUEsRUFDakQsSUFBSTtBQUFBLEVBQ0osTUFBTSxpQkFBRSxRQUFRLGNBQWM7QUFBQSxFQUM5QixPQUFPLGlCQUFFLE1BQU0sa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQWlCTSxJQUFNLGtCQUlULGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDL0I7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBZU0sSUFBTSxpQkFBaUIsaUJBQUUsT0FBTztBQUFBLEVBQ3JDLE1BQU0saUJBQUUsUUFBUSxZQUFZO0FBQUEsRUFDNUIsU0FBUyxpQkFBRSxNQUFNLGVBQWUsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUFBLEVBQzVDLGFBQWEsaUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFDbkMsQ0FBQztBQWlCTSxTQUFTLHNCQUFzQixHQUFxQztBQUN6RSxNQUFJLFVBQVUsRUFBRTtBQUNoQixRQUFNLE9BQU8sRUFBRSxHQUFHLEVBQUU7QUFHcEIsTUFBSSxPQUFPLEtBQUssZUFBZSxZQUFZLFlBQVksUUFBVztBQUNoRSxVQUFNLE9BQU8sS0FBSztBQUNsQixjQUFVLE9BQU8sQ0FBQyxFQUFFLE1BQU0sUUFBUSxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQUEsRUFDL0M7QUFDQSxTQUFPLEtBQUs7QUFPWixRQUFNLGVBQWUsQ0FBQyxRQUFRLGVBQWUsWUFBWTtBQUN6RCxNQUFJLE1BQU0sUUFBUSxPQUFPLEtBQUssUUFBUSxTQUFTLEdBQUc7QUFDaEQsVUFBTSxRQUFRLFFBQVEsQ0FBQztBQUN2QixRQUFJLE9BQU8sT0FBTyxTQUFTLFlBQVksYUFBYSxTQUFTLE1BQU0sSUFBSSxHQUFHO0FBQ3hFLGdCQUFVLENBQUMsRUFBRSxNQUFNLGFBQWEsUUFBUSxDQUFDO0FBQUEsSUFDM0M7QUFBQSxFQUNGO0FBS0EsUUFBTSxRQUFRLEtBQUs7QUFDbkIsU0FBTyxLQUFLO0FBQ1osTUFBSSxVQUFVLFFBQVEsT0FBTyxVQUFVLFVBQVU7QUFDL0MsVUFBTSxFQUFFLEtBQUssSUFBSSxJQUFJO0FBQ3JCLFFBQUksT0FBTyxRQUFRLFlBQVksS0FBSztBQUNsQyxZQUFNLFNBQVMsTUFBTSxRQUFRLE9BQU8sSUFBSSxDQUFDLEdBQUcsT0FBTyxJQUFJLENBQUM7QUFDeEQsYUFBTyxLQUFLO0FBQUEsUUFDVixNQUFNO0FBQUEsUUFDTjtBQUFBLFFBQ0EsS0FBSyxPQUFPLFFBQVEsV0FBVyxNQUFNO0FBQUEsTUFDdkMsQ0FBQztBQUNELGdCQUFVO0FBQUEsSUFDWjtBQUFBLEVBQ0Y7QUFFQSxTQUFPLEVBQUUsR0FBRyxNQUFNLFNBQVMsV0FBVyxDQUFDLEVBQUU7QUFDM0M7QUFFTyxJQUFNLE9BQU8saUJBQUU7QUFBQSxFQUNwQixDQUFDLE1BQU07QUFFTCxRQUFJLE9BQU8sTUFBTSxTQUFVLFFBQU8sRUFBRSxNQUFNLEVBQUU7QUFDNUMsUUFDRSxNQUFNLFFBQ04sT0FBTyxNQUFNLFlBQ1osRUFBeUIsU0FBUyxjQUNuQztBQUNBLGFBQU8sc0JBQXNCLENBQTRCO0FBQUEsSUFDM0Q7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsaUJBQUUsbUJBQW1CLFFBQVE7QUFBQSxJQUMzQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0YsQ0FBQztBQUNIO0FBTU8sSUFBTSxXQUFXLGlCQUFFLE9BQU87QUFBQSxFQUMvQixNQUFNLGlCQUFFLFFBQVEsTUFBTTtBQUFBLEVBQ3RCLE1BQU0saUJBQUUsT0FBTztBQUFBO0FBQUEsRUFFZixPQUFPLGlCQUFFLE1BQU0sSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFPTSxJQUFNLGFBQWEsaUJBQUUsbUJBQW1CLFFBQVE7QUFBQSxFQUNyRDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQXFCTSxJQUFNLGFBQWEsaUJBQUUsT0FBTztBQUFBLEVBQ2pDLE1BQU0saUJBQUUsUUFBUSxPQUFPO0FBQUEsRUFDdkIsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLFFBQVEsaUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQztBQUFBO0FBQUEsRUFFeEIsbUJBQW1CLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQSxFQUNqRCxPQUFPLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUEsRUFHNUMsTUFBTSxpQkFBRSxNQUFNLFVBQVUsRUFBRSxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTW5DLGlCQUFpQixpQkFBRSxNQUFNLGlCQUFFLE9BQU87QUFBQSxJQUNoQyxPQUFPLGlCQUFFLE9BQU87QUFBQSxJQUNoQixVQUFVLGlCQUFFLE1BQU0sVUFBVTtBQUFBLEVBQzlCLENBQUMsQ0FBQyxFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBY2IsNkJBQTZCLGlCQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBV3RELFlBQVksaUJBQUUsS0FBSyxDQUFDLFFBQVEsV0FBVyxNQUFNLENBQUMsRUFBRSxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJekQsV0FBVyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSXRDLGFBQWEsaUJBQUUsS0FBSyxDQUFDLFNBQVMsWUFBWSxDQUFDLEVBQUUsU0FBUztBQUN4RCxDQUFDO0FBTU0sSUFBTSxvQkFBb0IsaUJBQUUsbUJBQW1CLFFBQVE7QUFBQSxFQUM1RDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7OztBQzlnQk0sSUFBTSxpQkFBaUIsaUJBQUUsT0FBTztBQUFBLEVBQ3JDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsV0FBVztBQUFBLEVBQzNCLFNBQVMsaUJBQUUsTUFBTSxVQUFVO0FBQzdCLENBQUM7OztBQ0ZNLElBQU0sZUFBZSxpQkFBRSxNQUFNLENBQUMsaUJBQUUsUUFBUSxDQUFDLEdBQUcsaUJBQUUsUUFBUSxDQUFDLEdBQUcsaUJBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUd2RSxJQUFNLGVBQWUsaUJBQUUsT0FBTztBQUFBLEVBQ25DLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsU0FBUztBQUFBLEVBQ3pCLE9BQU87QUFBQSxFQUNQLFNBQVMsaUJBQUUsTUFBTSxVQUFVO0FBQzdCLENBQUM7OztBQ2dCTSxJQUFNLGFBQWEsaUJBQUUsbUJBQW1CLFFBQVE7QUFBQSxFQUNyRCxpQkFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBRSxRQUFRLE1BQU0sRUFBRSxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBR3BDLGlCQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFFLFFBQVEsUUFBUSxHQUFHLE1BQU0saUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUM7QUFBQSxFQUMvRCxpQkFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBRSxRQUFRLE1BQU0sRUFBRSxDQUFDO0FBQ3RDLENBQUM7QUFNTSxJQUFNLGNBQWM7QUFBQSxFQUN6QixPQUFPLFdBQVcsU0FBUztBQUM3Qjs7O0FDbkNPLElBQU0sWUFBWSxpQkFBRSxPQUFPO0FBQUEsRUFDaEMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxZQUFZO0FBQUEsRUFDNUIsT0FBTyxpQkFBRSxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJaEIsU0FBUyxpQkFBRSxNQUFNLFVBQVUsRUFBRSxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJdEMsVUFBVSxpQkFBRSxNQUFNLFVBQVUsRUFBRSxTQUFTO0FBQUE7QUFBQSxFQUV2QyxHQUFHO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJSCxHQUFHO0FBQ0wsQ0FBQzs7O0FDcEJNLElBQU0saUJBQWlCLGlCQUFFLEtBQUssQ0FBQyxRQUFRLFdBQVcsV0FBVyxNQUFNLENBQUM7QUFHcEUsSUFBTSxlQUFlLGlCQUFFLE9BQU87QUFBQSxFQUNuQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLFNBQVM7QUFBQSxFQUN6QixTQUFTO0FBQUEsRUFDVCxTQUFTLGlCQUFFLE1BQU0sVUFBVTtBQUM3QixDQUFDOzs7QUNJTSxJQUFNLGVBQWUsaUJBQUUsT0FBTztBQUFBLEVBQ25DLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNlLE1BQU0saUJBQUUsUUFBUSxTQUFTO0FBQUEsRUFDekIsUUFBUSxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQUEsRUFDN0MsU0FBUyxpQkFBRSxNQUFNLFVBQVU7QUFBQSxFQUMzQixVQUFVLGlCQUFFLE1BQU0sVUFBVSxFQUFFLFNBQVM7QUFBQSxFQUN2QyxRQUFRLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDM0UsQ0FBQzs7O0FDU00sSUFBTSxtQkFBbUIsaUJBQUUsT0FBTztBQUFBLEVBQ3ZDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNtQixNQUFNLGlCQUFFLFFBQVEsZUFBZTtBQUFBLEVBQy9CLFFBQVEsaUJBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUztBQUFBLEVBQzdDLFNBQVMsaUJBQUUsTUFBTSxpQkFBaUI7QUFBQSxFQUNsQyxVQUFVLGlCQUFFLE1BQU0sVUFBVSxFQUFFLFNBQVM7QUFBQSxFQUN2QyxxQkFBcUIsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQzlDLFFBQVEsaUJBQUUsTUFBTSxpQkFBRSxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUFBLEVBQ3RDLFdBQVcsaUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUEsRUFHdEMsR0FBRztBQUM1QyxDQUFDOzs7QUNGTSxJQUFNLFdBQXVELGlCQUFFO0FBQUEsRUFBSyxNQUMzRSxpQkFBRSxPQUFPO0FBQUEsSUFDTCxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsSUFDZixTQUFTLGlCQUFFLE1BQU0sVUFBVTtBQUFBLElBQzNCLFVBQVUsaUJBQ1QsTUFBTSxpQkFBRSxNQUFNLENBQUMsaUJBQWlCLGdCQUFnQixDQUFDLENBQUMsRUFDbEQsU0FBUztBQUFBLEVBQ25CLENBQUM7QUFDRDtBQUVPLElBQU0sa0JBQWtCLGlCQUFFLE9BQU87QUFBQSxFQUNwQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDZ0IsTUFBTSxpQkFBRSxRQUFRLGFBQWE7QUFBQSxFQUM3QixPQUFPLGlCQUFFLE1BQU0sUUFBUTtBQUMvRCxDQUFDO0FBRU0sSUFBTSxtQkFBbUIsaUJBQUUsT0FBTztBQUFBLEVBQ3JDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNpQixNQUFNLGlCQUFFLFFBQVEsY0FBYztBQUFBLEVBQzlCLE9BQU8saUJBQUUsTUFBTSxRQUFRO0FBQ2hFLENBQUM7OztBQ1RNLElBQU0sbUJBQW1CLGlCQUFFLE9BQU87QUFBQSxFQUN2QyxNQUFNLGlCQUFFLFFBQVEsWUFBWTtBQUFBO0FBQUE7QUFBQSxFQUc1QixlQUFlLGlCQUFFLE1BQU0saUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBRy9ELFdBQVcsaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFDakQsQ0FBQztBQWtCTSxJQUFNLHNCQUFzQixpQkFBRSxPQUFPO0FBQUEsRUFDMUMsTUFBTSxpQkFBRSxRQUFRLGVBQWU7QUFBQSxFQUMvQixRQUFRLGlCQUFFLE1BQU0sYUFBYSxFQUFFLElBQUksQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU1wQyxTQUFTLGlCQUFFLE1BQU0sWUFBWSxTQUFTLENBQUMsRUFBRSxTQUFTO0FBQ3BELENBQUM7QUFXTSxJQUFNLGVBQWUsaUJBQUUsT0FBTztBQUFBLEVBQ25DLGlCQUFpQixpQkFBRSxNQUFNLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxPQUFPLEdBQUcsaUJBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBO0FBQUE7QUFBQSxFQUdqRSxZQUFZLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxRQUFRLEdBQUc7QUFDbEQsQ0FBQztBQUtNLElBQU0sb0JBQW9CLGlCQUFFLE9BQU87QUFBQSxFQUN4QyxNQUFNLGlCQUFFLFFBQVEsY0FBYztBQUFBLEVBQzlCLFNBQVMsaUJBQUUsTUFBTSxZQUFZLEVBQUUsSUFBSSxDQUFDO0FBQ3RDLENBQUM7QUFTTSxJQUFNLGlCQUFpQixpQkFBRSxLQUFLLENBQUMsU0FBUyxTQUFTLFFBQVEsT0FBTyxDQUFDO0FBR2pFLElBQU0sbUJBQW1CLGlCQUFFLE9BQU87QUFBQSxFQUN2QyxVQUFVO0FBQUE7QUFBQSxFQUVWLFFBQVEsaUJBQUUsUUFBUTtBQUFBLEVBQ2xCLFdBQVc7QUFDYixDQUFDO0FBS00sSUFBTSx3QkFBd0IsaUJBQUUsT0FBTztBQUFBLEVBQzVDLE1BQU0saUJBQUUsUUFBUSxrQkFBa0I7QUFBQSxFQUNsQyxjQUFjLGlCQUFFLE1BQU0sZ0JBQWdCLEVBQUUsSUFBSSxDQUFDO0FBQy9DLENBQUM7QUFlTSxJQUFNLHFCQUFxQixpQkFBRSxPQUFPO0FBQUEsRUFDekMsTUFBTSxpQkFBRSxRQUFRLFNBQVM7QUFBQSxFQUN6QixXQUFXLGlCQUFFLE1BQU0sUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFZTSxJQUFNLFlBQVksaUJBQUUsT0FBTztBQUFBO0FBQUEsRUFFaEMsTUFBTSxpQkFBRSxNQUFNLENBQUMsaUJBQUUsT0FBTyxHQUFHLGlCQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBR3RDLFNBQVMsaUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQztBQUFBLEVBQ3pDLFdBQVcsY0FBYyxRQUFRLFFBQVE7QUFBQTtBQUFBO0FBQUEsRUFHekMsV0FBVyxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsSUFBSTtBQUNsRCxDQUFDO0FBR00sSUFBTSxpQkFBaUIsaUJBQUUsT0FBTztBQUFBLEVBQ3JDLE1BQU0saUJBQUUsUUFBUSxVQUFVO0FBQUEsRUFDMUIsTUFBTSxpQkFBRSxNQUFNLFNBQVMsRUFBRSxJQUFJLENBQUM7QUFDaEMsQ0FBQztBQUdNLElBQU0sZ0JBQWdCLGlCQUFFLE9BQU87QUFBQSxFQUNwQyxNQUFNLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxPQUFPLEdBQUcsaUJBQUUsT0FBTyxDQUFDLENBQUM7QUFBQSxFQUN0QyxJQUFJLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxPQUFPLEdBQUcsaUJBQUUsT0FBTyxDQUFDLENBQUM7QUFBQTtBQUFBO0FBQUEsRUFHcEMsV0FBVyxpQkFBRSxNQUFNLENBQUMsZUFBZSxhQUFhLENBQUMsRUFBRSxRQUFRLENBQUMsVUFBVSxRQUFRLENBQUM7QUFBQSxFQUMvRSxXQUFXLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxJQUFJO0FBQ2xELENBQUM7QUFHTSxJQUFNLHFCQUFxQixpQkFBRSxPQUFPO0FBQUEsRUFDekMsTUFBTSxpQkFBRSxRQUFRLGNBQWM7QUFBQSxFQUM5QixVQUFVLGlCQUFFLE1BQU0sYUFBYSxFQUFFLElBQUksQ0FBQztBQUN4QyxDQUFDO0FBT00sSUFBTSxtQkFBbUIsaUJBQUUsbUJBQW1CLFFBQVE7QUFBQSxFQUMzRDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFPTSxJQUFNLHdCQUF3QixpQkFBRSxPQUFPO0FBQUEsRUFDNUMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxtQkFBbUI7QUFBQSxFQUNuQyxRQUFRLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFBQSxFQUM3QyxHQUFHO0FBQUEsRUFDSCxRQUFRLGlCQUFFLE1BQU0sVUFBVTtBQUFBLEVBQzFCLFlBQVk7QUFBQSxFQUNaLGFBQWE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNYixlQUFlLGlCQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBS3hDLGlCQUFpQixpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJMUMsbUJBQW1CLGlCQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNNUMsaUJBQWlCLGlCQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBUXpDLGlCQUFpQixpQkFBRSxNQUFNLGlCQUFFLE9BQU87QUFBQSxJQUNoQyxPQUFPLGlCQUFFLE9BQU87QUFBQSxJQUNoQixVQUFVLGlCQUFFLE1BQU0sVUFBVTtBQUFBLEVBQzlCLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQUEsRUFDZCxVQUFVLGlCQUFFLE1BQU0sVUFBVSxFQUFFLFNBQVM7QUFBQSxFQUN2QyxxQkFBcUIsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQzlDLFFBQVEsaUJBQUUsTUFBTSxpQkFBRSxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSXRDLEdBQUc7QUFDTCxDQUFDOzs7QUM3T00sSUFBTSxjQUFjLGlCQUFFLE9BQU87QUFBQSxFQUNsQyxLQUFLLGlCQUFFLE9BQU8sRUFBRSxJQUFJO0FBQUEsRUFDcEIsS0FBSyxpQkFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFO0FBQzVCLENBQUM7QUFRTSxJQUFNLGNBQWMsaUJBQUUsT0FBTztBQUFBLEVBQ2xDLE1BQU07QUFBQSxFQUNOLFdBQVcsaUJBQUUsTUFBTSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDekMsQ0FBQztBQUdNLElBQU0sdUJBQXVCLGlCQUFFLE9BQU87QUFBQSxFQUMzQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUE7QUFBQTtBQUFBLEVBR3BCLFNBQVMsaUJBQUUsTUFBTSxVQUFVO0FBQUEsRUFDM0IsU0FBUyxpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUE7QUFBQTtBQUFBLEVBR2xDLFVBQVUsaUJBQUUsTUFBTSxVQUFVLEVBQUUsU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSXZDLE9BQU8sWUFBWSxTQUFTO0FBQUEsRUFDNUIsT0FBTyxZQUFZLFNBQVM7QUFDOUIsQ0FBQztBQUdNLElBQU0sc0JBQXNCLGlCQUFFLE9BQU87QUFBQSxFQUMxQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLGlCQUFpQjtBQUFBLEVBQ2pDLFFBQVEsaUJBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUztBQUFBLEVBQzdDLEdBQUc7QUFBQTtBQUFBLEVBRUgsUUFBUSxpQkFBRSxNQUFNLFVBQVU7QUFBQSxFQUMxQixTQUFTLGlCQUFFLE1BQU0sb0JBQW9CLEVBQUUsSUFBSSxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBRzVDLGFBQWEsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBO0FBQUE7QUFBQSxFQUd0QyxVQUFVLGlCQUFFLE1BQU0sVUFBVSxFQUFFLFNBQVM7QUFBQSxFQUN2QyxxQkFBcUIsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQzlDLFFBQVEsaUJBQUUsTUFBTSxpQkFBRSxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSXRDLFdBQVcsaUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLFNBQVM7QUFDeEMsQ0FBQzs7O0FDckRNLElBQU0sZUFBZSxpQkFBRSxPQUFPO0FBQUEsRUFDbkMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBO0FBQUE7QUFBQSxFQUdwQixTQUFTLGlCQUFFLE1BQU0sVUFBVTtBQUFBO0FBQUE7QUFBQSxFQUczQixPQUFPLFlBQVksU0FBUztBQUFBLEVBQzVCLE9BQU8sWUFBWSxTQUFTO0FBQzlCLENBQUM7QUFHTSxJQUFNLGlCQUFpQixpQkFBRSxPQUFPO0FBQUEsRUFDckMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLFNBQVMsaUJBQUUsTUFBTSxVQUFVO0FBQUEsRUFDM0IsT0FBTyxZQUFZLFNBQVM7QUFBQSxFQUM1QixPQUFPLFlBQVksU0FBUztBQUM5QixDQUFDO0FBR00sSUFBTSxnQkFBZ0IsaUJBQUUsT0FBTztBQUFBLEVBQ3BDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsVUFBVTtBQUFBLEVBQzFCLFFBQVEsaUJBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUztBQUFBLEVBQzdDLEdBQUc7QUFBQTtBQUFBLEVBRUgsUUFBUSxpQkFBRSxNQUFNLFVBQVU7QUFBQTtBQUFBLEVBRTFCLE9BQU8saUJBQUUsTUFBTSxZQUFZLEVBQUUsSUFBSSxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBR2xDLFNBQVMsaUJBQUUsTUFBTSxjQUFjLEVBQUUsSUFBSSxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBR3RDLEtBQUssaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGlCQUFFLE9BQU8sRUFBRSxLQUFLLENBQUM7QUFBQTtBQUFBO0FBQUEsRUFHbEQsa0JBQWtCLGlCQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFBQTtBQUFBLEVBRTNDLFVBQVUsaUJBQUUsTUFBTSxVQUFVLEVBQUUsU0FBUztBQUFBLEVBQ3ZDLHFCQUFxQixpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUEsRUFDOUMsUUFBUSxpQkFBRSxNQUFNLGlCQUFFLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQUEsRUFDdEMsV0FBVyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsU0FBUztBQUN4QyxDQUFDOzs7QUN4RE0sSUFBTSxlQUFlLGlCQUFFLE9BQU87QUFBQSxFQUNuQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUE7QUFBQTtBQUFBLEVBR3BCLFNBQVMsaUJBQUUsTUFBTSxVQUFVO0FBQzdCLENBQUM7QUFHTSxJQUFNLGdCQUFnQixpQkFBRSxPQUFPO0FBQUEsRUFDcEMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxVQUFVO0FBQUEsRUFDMUIsUUFBUSxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQUEsRUFDN0MsR0FBRztBQUFBO0FBQUEsRUFFSCxRQUFRLGlCQUFFLE1BQU0sVUFBVTtBQUFBO0FBQUE7QUFBQSxFQUcxQixPQUFPLGlCQUFFLE1BQU0sWUFBWSxFQUFFLElBQUksQ0FBQztBQUFBO0FBQUEsRUFFbEMsVUFBVSxpQkFBRSxNQUFNLFVBQVUsRUFBRSxTQUFTO0FBQUEsRUFDdkMscUJBQXFCLGlCQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUM5QyxRQUFRLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQSxFQUN0QyxXQUFXLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxTQUFTO0FBQ3hDLENBQUM7OztBQ2JNLElBQU0sbUJBQW1CLGlCQUFFLE9BQU87QUFBQSxFQUN2QyxLQUFLLGlCQUFFLE9BQU87QUFBQSxFQUNkLEtBQUssaUJBQUUsT0FBTztBQUFBO0FBQUEsRUFFZCxVQUFVLGlCQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBR3pDLG1CQUFtQixpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUkzRCxZQUFZLGlCQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFDdEMsQ0FBQztBQU9NLElBQU0sNkJBQTZCLGlCQUFFLE9BQU87QUFBQSxFQUNqRCxNQUFNLGlCQUFFLFFBQVEsWUFBWTtBQUFBO0FBQUEsRUFFNUIsZUFBZSxpQkFBRSxNQUFNLGlCQUFFLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBO0FBQUEsRUFFeEMsV0FBVyxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUNqRCxDQUFDO0FBYU0sSUFBTSxxQkFBcUIsaUJBQUUsT0FBTztBQUFBLEVBQ3pDLEtBQUssaUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQSxFQUN6QixVQUFVLGNBQWMsU0FBUztBQUFBLEVBQ2pDLEtBQUssaUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQSxFQUN6QixVQUFVLGNBQWMsU0FBUztBQUNuQyxDQUFDO0FBR00sSUFBTSxnQ0FBZ0MsaUJBQUUsT0FBTztBQUFBLEVBQ3BELE1BQU0saUJBQUUsUUFBUSxlQUFlO0FBQUEsRUFDL0IsaUJBQWlCO0FBQUE7QUFBQSxFQUVqQixXQUFXLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQ2pELENBQUM7QUFRTSxJQUFNLHdCQUF3QixpQkFBRSxtQkFBbUIsUUFBUTtBQUFBLEVBQ2hFO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFVTSxJQUFNLGtCQUFrQixpQkFBRSxPQUFPO0FBQUEsRUFDdEMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxhQUFhO0FBQUEsRUFDN0IsUUFBUSxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQUEsRUFDN0MsR0FBRztBQUFBLEVBQ0gsUUFBUSxpQkFBRSxNQUFNLFVBQVU7QUFBQSxFQUMxQixRQUFRO0FBQUEsRUFDUixhQUFhO0FBQUEsRUFDYixVQUFVLGlCQUFFLE1BQU0sVUFBVSxFQUFFLFNBQVM7QUFBQSxFQUN2QyxxQkFBcUIsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQzlDLFFBQVEsaUJBQUUsTUFBTSxpQkFBRSxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUFBO0FBQUE7QUFBQSxFQUd0QyxHQUFHO0FBQ0wsQ0FBQzs7O0FDekVNLElBQU0saUJBQWlCLGlCQUFpQixPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJcEQsVUFBVSxpQkFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUl6QyxjQUFjLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFDckQsQ0FBQztBQUtNLElBQU0sZ0JBQWdCLGlCQUFFLEtBQUssQ0FBQyxXQUFXLGFBQWEsU0FBUyxDQUFDO0FBU2hFLElBQU0sNkJBQTZCLGlCQUFFLE9BQU87QUFBQSxFQUNqRCxNQUFNLGlCQUFFLFFBQVEsU0FBUztBQUFBLEVBQ3pCLE9BQU87QUFDVCxDQUFDO0FBWU0sSUFBTSw2QkFBNkIsaUJBQUUsT0FBTztBQUFBLEVBQ2pELE1BQU0saUJBQUUsUUFBUSxlQUFlO0FBQ2pDLENBQUM7QUFVTSxJQUFNLCtCQUErQixpQkFBRSxPQUFPO0FBQUEsRUFDbkQsTUFBTSxpQkFBRSxRQUFRLGlCQUFpQjtBQUNuQyxDQUFDO0FBWU0sSUFBTSw2QkFBNkIsaUJBQUUsT0FBTztBQUFBLEVBQ2pELE1BQU0saUJBQUUsUUFBUSxlQUFlO0FBQUE7QUFBQTtBQUFBLEVBRy9CLFdBQVcsaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFDakQsQ0FBQztBQVFNLElBQU0sc0JBQXNCLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDOUQ7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBV00sSUFBTSxnQkFBZ0IsaUJBQUUsT0FBTztBQUFBLEVBQ3BDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsV0FBVztBQUFBLEVBQzNCLFFBQVEsaUJBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUztBQUFBLEVBQzdDLEdBQUc7QUFBQSxFQUNILFFBQVEsaUJBQUUsTUFBTSxVQUFVO0FBQUE7QUFBQTtBQUFBLEVBRzFCLE1BQU0saUJBQUUsTUFBTSxpQkFBRSxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxFQUMvQixRQUFRO0FBQUEsRUFDUixhQUFhO0FBQUEsRUFDYixVQUFVLGlCQUFFLE1BQU0sVUFBVSxFQUFFLFNBQVM7QUFBQSxFQUN2QyxxQkFBcUIsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQzlDLFFBQVEsaUJBQUUsTUFBTSxpQkFBRSxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUFBO0FBQUE7QUFBQSxFQUd0QyxHQUFHO0FBQ0wsQ0FBQzs7O0FDcklNLElBQU0sMEJBQTBCLGlCQUFFLE9BQU87QUFBQSxFQUM5QyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLHFCQUFxQjtBQUFBLEVBQ3JDLE9BQU8saUJBQUUsT0FBTztBQUFBLEVBQ2hCLE9BQU8saUJBQUUsTUFBTSxpQkFBRSxNQUFNLFVBQVUsQ0FBQztBQUNwQyxDQUFDOzs7QUNNTSxJQUFNLHFCQUFxQixpQkFBRSxtQkFBbUIsUUFBUTtBQUFBLEVBQzdEO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBR00sSUFBTSxxQkFBcUIsaUJBQUUsT0FBTztBQUFBLEVBQ3pDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsZ0JBQWdCO0FBQUEsRUFDaEMsT0FBTyxpQkFBRSxPQUFPO0FBQUEsRUFDaEIsU0FBUyxpQkFBRSxNQUFNLGtCQUFrQjtBQUNyQyxDQUFDOzs7QUNSTSxJQUFNLDBCQUEwQixpQkFBRSxtQkFBbUIsUUFBUTtBQUFBLEVBQ2xFO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQUdNLElBQU0sMEJBQTBCLGlCQUFFLE9BQU87QUFBQSxFQUM5QyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLHNCQUFzQjtBQUFBLEVBQ3RDLE9BQU8saUJBQUUsT0FBTztBQUFBLEVBQ2hCLFNBQVMsaUJBQUUsTUFBTSx1QkFBdUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNeEMsZ0JBQWdCLGlCQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFDMUMsQ0FBQzs7O0FDdENNLElBQU0sdUJBQXVCLGlCQUFFLE9BQU87QUFBQSxFQUMzQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLGtCQUFrQjtBQUFBLEVBQ2xDLFFBQVEsaUJBQUUsTUFBTSxVQUFVO0FBQUEsRUFDMUIsYUFBYSxpQkFBRSxPQUFPLEVBQUUsU0FBUztBQUNuQyxDQUFDOzs7QUNITSxJQUFNLGtCQUFrQixpQkFBRSxPQUFPO0FBQUEsRUFDdEMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE9BQU8saUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQztBQUFBLEVBQ3ZCLFdBQVcsaUJBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxPQUFPO0FBQUEsRUFDeEMsYUFBYSxpQkFBRSxPQUFPLEVBQUUsU0FBUztBQUNuQyxDQUFDO0FBVU0sSUFBTSxTQUFTLGlCQUFFLE9BQU87QUFBQSxFQUM3QixVQUFVLGlCQUFFLE1BQU0sZUFBZSxFQUFFLElBQUksQ0FBQztBQUMxQyxDQUFDO0FBR00sSUFBTSxtQkFBbUIsaUJBQUUsT0FBTztBQUFBLEVBQ3ZDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsY0FBYztBQUFBLEVBQzlCLFFBQVEsaUJBQUUsTUFBTSxVQUFVO0FBQUEsRUFDMUIsYUFBYSxpQkFBRSxPQUFPLEVBQUUsU0FBUztBQUFBLEVBQ2pDLFFBQVEsT0FBTyxTQUFTO0FBQzFCLENBQUM7QUFHTSxJQUFNLGdCQUFnQixpQkFDMUIsT0FBTztBQUFBLEVBQ04sS0FBSyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQUEsRUFDMUMsS0FBSyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQzVDLENBQUMsRUFHQTtBQUFBLEVBQ0MsQ0FBQyxNQUFNLEVBQUUsUUFBUSxVQUFhLEVBQUUsUUFBUSxVQUFhLEVBQUUsT0FBTyxFQUFFO0FBQUEsRUFDaEUsRUFBRSxTQUFTLHVDQUFrQztBQUMvQztBQUdLLElBQU0sYUFBYSxpQkFBRSxPQUFPO0FBQUEsRUFDakMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxPQUFPO0FBQUEsRUFDdkIsUUFBUSxpQkFBRSxNQUFNLFVBQVU7QUFBQSxFQUMxQixhQUFhLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUEsRUFDakMsZUFBZSxjQUFjLFNBQVM7QUFBQSxFQUN0QyxRQUFRLE9BQU8sU0FBUztBQUMxQixDQUFDOzs7QUMxQ00sSUFBTSxRQUFRLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDaEQ7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDOzs7QUNmTSxJQUFNLGtCQUFrQixpQkFBRSxLQUFLLENBQUMsV0FBVyxNQUFNLEtBQUssQ0FBQztBQUd2RCxJQUFNLFNBQVMsaUJBQUUsT0FBTztBQUFBLEVBQzdCLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQTtBQUFBLEVBRXBCLE9BQU8saUJBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQUE7QUFBQSxFQUV0QyxXQUFXLGlCQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSTFDLFFBQVEsaUJBQUUsTUFBTSxLQUFLLEVBQUUsSUFBSSxDQUFDO0FBQzlCLENBQUM7QUFPTSxJQUFNLE1BQU0saUJBQUUsT0FBTztBQUFBLEVBQzFCLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixTQUFTLGlCQUFFLE1BQU0sTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEVBQ3JDLFdBQVcsZ0JBQWdCLFFBQVEsU0FBUztBQUM5QyxDQUFDOzs7QUM5Qk0sSUFBTSxVQUFVLGlCQUFFLE9BQU87QUFBQSxFQUM5QixJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDVSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUEsRUFDM0IsY0FBYyxpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUEsRUFDdkMsTUFBTSxpQkFBRSxNQUFNLEdBQUc7QUFDakQsQ0FBQztBQXFFTSxJQUFNLGNBQWMsaUJBQUUsT0FBTztBQUFBLEVBQ2xDLE1BQU0saUJBQUUsUUFBUSxFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQ0ksTUFBTSxpQkFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDOUIsUUFBUSxpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUEsRUFDakMsT0FBTyxpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUEsRUFDaEMsT0FBTyxpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUEsRUFDaEMsUUFBUSxpQkFBRSxNQUFNLGlCQUFFLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzFFLENBQUM7QUFxRE0sSUFBTSxjQUFjLGlCQUFFLE9BQU87QUFBQSxFQUNsQyxXQUFXLGlCQUFFLEtBQUssQ0FBQyxVQUFVLElBQUksQ0FBQyxFQUFFLFFBQVEsUUFBUTtBQUFBLEVBQ2pCLFNBQVMsaUJBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxRQUFRLENBQUM7QUFBQSxFQUNqRCxXQUFXLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxRQUFRLENBQUM7QUFBQSxFQUN0QyxVQUFVLGlCQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFO0FBQUEsRUFDMUMsZ0JBQWdCLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxRQUFRLENBQUM7QUFBQSxFQUMzQyxRQUFRLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxRQUFRLEdBQUc7QUFBQSxFQUNyQyxXQUFXLGlCQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUNwQyxxQkFBcUIsaUJBQUUsUUFBUSxFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQzdDLHlCQUF5QixpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUEsRUFDbEQsUUFBUSxZQUFZLFFBQVEsQ0FBQyxDQUFDO0FBQ25FLENBQUM7QUEyQk0sSUFBTSxlQUFlLGlCQUFFLEtBQUs7QUFBQSxFQUNqQztBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBR00sSUFBTSxhQUFhLGlCQUFFLE9BQU87QUFBQSxFQUNqQyxNQUFNLGFBQWEsUUFBUSxTQUFTO0FBQUEsRUFDRCxVQUFVLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUU7QUFDcEYsQ0FBQztBQUdNLElBQU0sZUFBZSxpQkFBRSxPQUFPO0FBQUEsRUFDbkMsT0FBTyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDO0FBQUEsRUFDWSxRQUFRLGlCQUFFLE9BQU8sRUFBRSxRQUFRLFlBQVk7QUFBQSxFQUN2QyxNQUFNLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUEsRUFDMUIsZ0JBQWdCLGlCQUFFLEtBQUssQ0FBQyxVQUFVLFVBQVUsTUFBTSxDQUFDLEVBQUUsUUFBUSxNQUFNO0FBQUEsRUFDbkUsY0FBYyxpQkFBRSxLQUFLLENBQUMsUUFBUSxRQUFRLENBQUMsRUFBRSxRQUFRLE1BQU07QUFBQSxFQUN2RCxhQUFhLGlCQUFFLEtBQUssQ0FBQyxRQUFRLFVBQVUsT0FBTyxDQUFDLEVBQUUsUUFBUSxNQUFNO0FBQUEsRUFDL0QsY0FBYyxpQkFBRSxLQUFLLENBQUMsYUFBYSxlQUFlLFdBQVcsUUFBUSxDQUFDLEVBQUUsUUFBUSxXQUFXO0FBQUEsRUFDM0YsZ0JBQWdCLGlCQUFFLEtBQUssQ0FBQyxhQUFhLFVBQVUsQ0FBQyxFQUFFLFFBQVEsVUFBVTtBQUFBLEVBQ3BFLFFBQVEsaUJBQUUsTUFBTSxpQkFBRSxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUFBLEVBQ3RDLE9BQU8sWUFBWSxRQUFRLENBQUMsQ0FBQztBQUFBLEVBQzdCLFlBQVksV0FBVyxTQUFTO0FBQ3JFLENBQUM7QUFxQk0sSUFBTSxpQkFBaUIsaUJBQUUsT0FBTztBQUFBLEVBQ3JDLE9BQU8saUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQSxFQUNVLFFBQVEsaUJBQUUsTUFBTSxLQUFLO0FBQzVELENBQUM7QUErQk0sSUFBTSxrQkFBa0IsaUJBQUUsS0FBSztBQUFBLEVBQ3BDO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQUdNLElBQU0seUJBQXlCLGlCQUFFLE9BQU87QUFBQSxFQUM3QyxNQUFNLGlCQUFFLEtBQUssQ0FBQyxjQUFjLFVBQVUsQ0FBQyxFQUFFLFFBQVEsWUFBWTtBQUFBLEVBQzdELFdBQVcsaUJBQUUsUUFBUSxFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQ25DLGFBQWEsaUJBQUUsUUFBUSxFQUFFLFFBQVEsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSXJDLG1CQUFtQixpQkFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDM0MseUJBQXlCLGlCQUN0QixNQUFNLGVBQWUsRUFDckIsUUFBUSxDQUFDLFVBQVUsYUFBYSxlQUFlLGFBQWEsQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSWhFLGdCQUFnQixpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLFNBQVM7QUFDM0QsQ0FBQztBQUdNLElBQU0saUJBQWlCLGlCQUFFLE9BQU87QUFBQSxFQUNyQyxTQUFTLGlCQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUNsQyxjQUFjLHVCQUF1QixRQUFRLENBQUMsQ0FBQztBQUNqRCxDQUFDO0FBZU0sSUFBTSxtQkFDWCxpQkFBRSxPQUFPO0FBQUEsRUFDUCxlQUFlLGlCQUFFLFFBQVEsQ0FBQztBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFVBQVUsaUJBQUUsTUFBTSxPQUFPO0FBQUEsRUFDekIsZ0JBQWdCLGVBQWUsU0FBUztBQUFBLEVBQ3hDLFlBQVksZUFBZSxTQUFTO0FBQ3RDLENBQUM7OztBQzFUSSxJQUFNLDBCQUEwQjtBQUtoQyxJQUFNLGVBQU4sY0FBMkIsTUFBTTtBQUFBLEVBQ3RDLFlBQ0UsU0FFUyxlQUNUO0FBQ0EsVUFBTSxPQUFPO0FBRko7QUFHVCxTQUFLLE9BQU87QUFBQSxFQUNkO0FBQ0Y7QUFZQSxJQUFNLFdBQW1DLENBQUM7QUFnQm5DLFNBQVMsd0JBQXdCLEtBQTZCO0FBQ25FLE1BQUksUUFBUSxRQUFRLE9BQU8sUUFBUSxZQUFZLE1BQU0sUUFBUSxHQUFHLEdBQUc7QUFDakUsVUFBTSxJQUFJLGFBQWEsaUNBQWlDO0FBQUEsRUFDMUQ7QUFDQSxRQUFNLFNBQVM7QUFDZixRQUFNLFVBQVUsT0FBTztBQUN2QixNQUFJLE9BQU8sWUFBWSxZQUFZLENBQUMsT0FBTyxVQUFVLE9BQU8sR0FBRztBQUM3RCxVQUFNLElBQUksYUFBYSw2Q0FBNkM7QUFBQSxFQUN0RTtBQUNBLE1BQUksVUFBVSx5QkFBeUI7QUFFckMsVUFBTSxJQUFJO0FBQUEsTUFDUix3QkFBd0IsT0FBTywrQkFDMUIsdUJBQXVCO0FBQUEsTUFDNUI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLE1BQUksVUFBVTtBQUNkLE1BQUksS0FBSztBQUNULFNBQU8sS0FBSyx5QkFBeUI7QUFDbkMsVUFBTSxPQUFPLFNBQVMsS0FBSyxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUU7QUFDL0MsUUFBSSxDQUFDLE1BQU07QUFFVCxZQUFNLElBQUk7QUFBQSxRQUNSLHNDQUFzQyxFQUFFO0FBQUEsUUFDeEM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUNBLGNBQVUsS0FBSyxJQUFJLE9BQU87QUFDMUIsVUFBTTtBQUFBLEVBQ1I7QUFFQSxRQUFNLFNBQVMsaUJBQWlCLFVBQVUsT0FBTztBQUNqRCxNQUFJLENBQUMsT0FBTyxTQUFTO0FBQ25CLFVBQU0sSUFBSTtBQUFBLE1BQ1IsOENBQThDLEVBQUUsT0FDOUMsT0FBTyxNQUFNLE9BQ1YsTUFBTSxHQUFHLENBQUMsRUFDVixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsS0FBSyxLQUFLLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQzlDLEtBQUssSUFBSTtBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLFNBQU8sRUFBRSxLQUFLLE9BQU8sTUFBTSxtQkFBbUIsUUFBUTtBQUN4RDs7O0FDOUJPLElBQU0sa0JBQWtCLGlCQUFFLEtBQUssQ0FBQyxVQUFVLFlBQVksU0FBUyxDQUFDO0FBU2hFLElBQU0sZ0JBQWdCLGlCQUFFLE9BQU87QUFBQSxFQUNwQyxRQUFRLGlCQUFFLE9BQU87QUFBQSxFQUNtQixTQUFTLGlCQUFFLFFBQVE7QUFBQSxFQUNuQixZQUFZLGdCQUFnQixTQUFTO0FBQzNFLENBQUM7QUFXTSxJQUFNLGdCQUFnQixpQkFBRSxPQUFPO0FBQUEsRUFDcEMsTUFBTSxpQkFBRSxRQUFRLFlBQVk7QUFBQTtBQUFBO0FBQUEsRUFHNUIsZUFBZSxpQkFBRSxNQUFNLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxPQUFPLEdBQUcsaUJBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUFBLEVBQ3hELFNBQVMsaUJBQUUsUUFBUTtBQUFBLEVBQ25CLFlBQVksZ0JBQWdCLFNBQVM7QUFDdkMsQ0FBQztBQU9NLElBQU0sbUJBQW1CLGlCQUFFLE9BQU87QUFBQSxFQUN2QyxNQUFNLGlCQUFFLFFBQVEsZUFBZTtBQUFBLEVBQy9CLGVBQWUsaUJBQUUsTUFBTSxpQkFBRSxNQUFNLENBQUMsaUJBQUUsT0FBTyxHQUFHLGlCQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFBQSxFQUN4RCxTQUFTLGlCQUFFLFFBQVE7QUFBQSxFQUNuQixZQUFZLGdCQUFnQixTQUFTO0FBQ3ZDLENBQUM7QUFJTSxJQUFNLGlCQUFpQixpQkFBRSxPQUFPO0FBQUEsRUFDckMsTUFBTSxpQkFBRSxRQUFRLGNBQWM7QUFBQSxFQUM5QixlQUFlLGlCQUFFLE1BQU0saUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQUEsRUFDeEQsU0FBUyxpQkFBRSxRQUFRO0FBQUEsRUFDbkIsWUFBWSxnQkFBZ0IsU0FBUztBQUN2QyxDQUFDO0FBS00sSUFBTSxxQkFBcUIsaUJBQUUsT0FBTztBQUFBLEVBQ3pDLE1BQU0saUJBQUUsUUFBUSxrQkFBa0I7QUFBQSxFQUNsQyxlQUFlLGlCQUFFLE1BQU0saUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQUEsRUFDeEQsUUFBUSxpQkFBRSxRQUFRO0FBQUEsRUFDbEIsTUFBTSxpQkFBRSxLQUFLLENBQUMsU0FBUyxTQUFTLFFBQVEsT0FBTyxDQUFDO0FBQUEsRUFDaEQsU0FBUyxpQkFBRSxRQUFRO0FBQUEsRUFDbkIsWUFBWSxnQkFBZ0IsU0FBUztBQUN2QyxDQUFDO0FBUU0sSUFBTSxjQUFjLGlCQUFFLE9BQU87QUFBQSxFQUNsQyxNQUFNLGlCQUFFLFFBQVEsVUFBVTtBQUFBLEVBQzFCLGVBQWUsaUJBQUUsTUFBTSxpQkFBRSxNQUFNLENBQUMsaUJBQUUsT0FBTyxHQUFHLGlCQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUl4RCxPQUFPLGlCQUFFLEtBQUssQ0FBQyxnQkFBZ0IsZ0JBQWdCLFNBQVMsQ0FBQyxFQUFFLFNBQVM7QUFBQSxFQUNwRSxXQUFXLGlCQUFFLEtBQUssQ0FBQyxRQUFRLFFBQVEsQ0FBQztBQUFBLEVBQ3BDLFNBQVMsaUJBQUUsUUFBUTtBQUFBLEVBQ25CLFlBQVksZ0JBQWdCLFNBQVM7QUFDdkMsQ0FBQztBQUdNLElBQU0sa0JBQWtCLGlCQUFFLE9BQU87QUFBQSxFQUN0QyxNQUFNLGlCQUFFLFFBQVEsY0FBYztBQUFBLEVBQzlCLGVBQWUsaUJBQUUsTUFBTSxpQkFBRSxNQUFNLENBQUMsaUJBQUUsT0FBTyxHQUFHLGlCQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFBQSxFQUN4RCxPQUFPLGlCQUFFLEtBQUssQ0FBQyxnQkFBZ0IsZ0JBQWdCLFNBQVMsQ0FBQyxFQUFFLFNBQVM7QUFBQSxFQUNwRSxXQUFXLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxLQUFLLENBQUMsUUFBUSxRQUFRLENBQUMsR0FBRyxpQkFBRSxLQUFLLENBQUMsUUFBUSxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQUEsRUFDM0UsU0FBUyxpQkFBRSxRQUFRO0FBQUEsRUFDbkIsWUFBWSxnQkFBZ0IsU0FBUztBQUN2QyxDQUFDO0FBaUJNLElBQU0sMkJBQTJCLGlCQUFFLE9BQU87QUFBQSxFQUMvQyxNQUFNLGlCQUFFLFFBQVEseUJBQXlCO0FBQUE7QUFBQTtBQUFBLEVBR3pDLE9BQU8saUJBQUUsTUFBTSxrQkFBa0IsRUFBRSxJQUFJLENBQUM7QUFBQSxFQUN4QyxTQUFTLGlCQUFFLFFBQVE7QUFBQSxFQUNuQixZQUFZLGdCQUFnQixTQUFTO0FBQ3ZDLENBQUM7QUFZTSxJQUFNLHlCQUF5QixpQkFBRSxPQUFPO0FBQUEsRUFDN0MsTUFBTSxpQkFBRSxRQUFRLHNCQUFzQjtBQUFBO0FBQUE7QUFBQSxFQUd0QyxPQUFPLGlCQUFFLE1BQU0sZ0JBQWdCLEVBQUUsSUFBSSxDQUFDO0FBQUEsRUFDdEMsU0FBUyxpQkFBRSxRQUFRO0FBQUEsRUFDbkIsWUFBWSxnQkFBZ0IsU0FBUztBQUN2QyxDQUFDO0FBR00sSUFBTSxnQkFBZ0IsaUJBQUUsbUJBQW1CLFFBQVE7QUFBQSxFQUN4RDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFRRCxJQUFNLFdBQVc7QUFBQSxFQUNmLFlBQVksaUJBQUUsUUFBUSxFQUFFLFNBQVM7QUFBQSxFQUNqQyxRQUFRLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsU0FBUztBQUFBLEVBQzFDLE9BQU8saUJBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQUE7QUFBQTtBQUFBLEVBR3RDLFFBQVEsaUJBQ0wsT0FBTztBQUFBLElBQ04sTUFBTSxpQkFBRSxPQUFPLEVBQUUsU0FBUztBQUFBLElBQzFCLFVBQVUsaUJBQUUsS0FBSyxDQUFDLFFBQVEsUUFBUSxDQUFDLEVBQUUsU0FBUztBQUFBLElBQzlDLE1BQU0saUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQSxJQUMxQixVQUFVLGlCQUFFLEtBQUssQ0FBQyxRQUFRLFFBQVEsQ0FBQyxFQUFFLFNBQVM7QUFBQSxFQUNoRCxDQUFDLEVBQ0EsU0FBUztBQUNkO0FBQ08sSUFBTSxrQkFBa0IsaUJBQUUsbUJBQW1CLFFBQVE7QUFBQSxFQUMxRCxjQUFjLE9BQU8sUUFBUTtBQUFBLEVBQzdCLGlCQUFpQixPQUFPLFFBQVE7QUFBQSxFQUNoQyxlQUFlLE9BQU8sUUFBUTtBQUFBLEVBQzlCLG1CQUFtQixPQUFPLFFBQVE7QUFBQSxFQUNsQyxZQUFZLE9BQU8sUUFBUTtBQUFBLEVBQzNCLGdCQUFnQixPQUFPLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUkvQix5QkFBeUIsT0FBTyxRQUFRO0FBQUEsRUFDeEMsdUJBQXVCLE9BQU8sUUFBUTtBQUN4QyxDQUFDO0FBT00sSUFBTSxtQkFBbUIsaUJBQUUsT0FBTztBQUFBLEVBQ3ZDLFdBQVcsaUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQTtBQUFBLEVBQ1EsT0FBTyxpQkFBRSxPQUFPLEVBQUUsWUFBWTtBQUFBO0FBQUEsRUFDOUIsT0FBTyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVM7QUFDMUUsQ0FBQztBQTBCRCxJQUFNLGVBQWUsaUJBQ2xCLE9BQU8sRUFDUDtBQUFBLEVBQ0MsQ0FBQyxNQUNDLGtFQUFrRSxLQUFLLENBQUMsS0FDeEUsbUJBQW1CLEtBQUssQ0FBQztBQUFBLEVBQzNCLEVBQUUsU0FBUyx3REFBd0Q7QUFDckU7QUFLSyxJQUFNLHdCQUF3QixpQkFBRSxPQUFPO0FBQUEsRUFDNUMsZUFBZSxpQkFBRSxRQUFRLENBQUM7QUFBQSxFQUNrQixRQUFRLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxpQkFBRSxPQUFPO0FBQUEsSUFDM0MsUUFBUSxpQkFBRSxPQUFPO0FBQUEsSUFDMEIsU0FBUyxpQkFBRSxRQUFRO0FBQUEsRUFDaEUsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFNTSxJQUFNLHdCQUF3QixpQkFBRSxPQUFPO0FBQUEsRUFDNUMsZUFBZSxpQkFBRSxRQUFRLENBQUM7QUFBQSxFQUNrQixRQUFRLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxhQUFhO0FBQUEsRUFDakQsbUJBQW1CLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxnQkFBZ0IsRUFBRSxTQUFTO0FBQ3hILENBQUM7QUFPTSxJQUFNLHdCQUF3QixpQkFBRSxPQUFPO0FBQUEsRUFDNUMsZUFBZSxpQkFBRSxRQUFRLENBQUM7QUFBQSxFQUMxQixRQUFRLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxhQUFhO0FBQUEsRUFDakQsbUJBQW1CLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxnQkFBZ0IsRUFBRSxTQUFTO0FBQUEsRUFDMUUsZ0JBQWdCLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxhQUFhLEVBQUUsU0FBUztBQUN0RSxDQUFDO0FBT00sSUFBTSx3QkFBd0IsaUJBQUUsT0FBTztBQUFBLEVBQzVDLGVBQWUsaUJBQUUsUUFBUSxDQUFDO0FBQUEsRUFDMUIsUUFBUSxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsYUFBYTtBQUFBLEVBQ2pELG1CQUFtQixpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsZ0JBQWdCLEVBQUUsU0FBUztBQUFBLEVBQzFFLGdCQUFnQixpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsZUFBZSxFQUFFLFNBQVM7QUFDeEUsQ0FBQztBQVdNLElBQU0saUJBQWlCLGlCQUFFLE9BQU87QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUlyQyxVQUFVLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEVBQzFDLFNBQVMsaUJBQUUsUUFBUTtBQUFBLEVBQ25CLFlBQVksZ0JBQWdCLFNBQVM7QUFDdkMsQ0FBQztBQU9NLElBQU0sd0JBQXdCLGlCQUFFLE9BQU87QUFBQSxFQUM1QyxlQUFlLGlCQUFFLFFBQVEsQ0FBQztBQUFBLEVBQzFCLFFBQVEsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGFBQWE7QUFBQSxFQUNqRCxtQkFBbUIsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGdCQUFnQixFQUFFLFNBQVM7QUFBQSxFQUMxRSxnQkFBZ0IsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGVBQWUsRUFBRSxTQUFTO0FBQUEsRUFDdEUsU0FBUyxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsY0FBYyxFQUFFLFNBQVM7QUFDaEUsQ0FBQztBQVNNLElBQU0sZ0JBQWdCLGlCQUFFLE9BQU87QUFBQTtBQUFBO0FBQUEsRUFHcEMsT0FBTyxpQkFDSixPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsaUJBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUMzQyxPQUFPLENBQUMsVUFBVSxPQUFPLEtBQUssS0FBSyxFQUFFLFNBQVMsR0FBRztBQUFBLElBQ2hELFNBQVM7QUFBQSxFQUNYLENBQUM7QUFBQSxFQUNILFNBQVMsaUJBQUUsUUFBUTtBQUFBLEVBQ25CLFFBQVEsaUJBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxZQUFZO0FBQUEsRUFDckMsT0FBTyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVM7QUFBQSxFQUNqQyxZQUFZLGdCQUFnQixTQUFTO0FBQ3ZDLENBQUM7QUFRTSxJQUFNLGdCQUFnQixpQkFBRSxPQUFPO0FBQUEsRUFDcEMsT0FBTyxpQkFBRSxNQUFNLGlCQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxFQUN2QyxTQUFTLGlCQUFFLFFBQVE7QUFBQSxFQUNuQixZQUFZLGdCQUFnQixTQUFTO0FBQ3ZDLENBQUM7QUFRTSxJQUFNLDBCQUEwQixpQkFBRSxPQUFPO0FBQUEsRUFDOUMsTUFBTSxpQkFBRSxRQUFRLFlBQVk7QUFBQTtBQUFBO0FBQUEsRUFHNUIsZUFBZSxpQkFBRSxNQUFNLGlCQUFFLE9BQU8sQ0FBQztBQUFBLEVBQ2pDLFNBQVMsaUJBQUUsUUFBUTtBQUFBLEVBQ25CLFlBQVksZ0JBQWdCLFNBQVM7QUFDdkMsQ0FBQztBQU1NLElBQU0sNkJBQTZCLGlCQUFFLE9BQU87QUFBQSxFQUNqRCxNQUFNLGlCQUFFLFFBQVEsZUFBZTtBQUFBLEVBQy9CLEtBQUssaUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQSxFQUN6QixVQUFVLGlCQUFFLEtBQUssQ0FBQyxRQUFRLFFBQVEsQ0FBQyxFQUFFLFNBQVM7QUFBQSxFQUM5QyxLQUFLLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUEsRUFDekIsVUFBVSxpQkFBRSxLQUFLLENBQUMsUUFBUSxRQUFRLENBQUMsRUFBRSxTQUFTO0FBQUEsRUFDOUMsU0FBUyxpQkFBRSxRQUFRO0FBQUEsRUFDbkIsWUFBWSxnQkFBZ0IsU0FBUztBQUN2QyxDQUFDO0FBS00sSUFBTSxxQkFBcUIsaUJBQUUsbUJBQW1CLFFBQVE7QUFBQSxFQUM3RDtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBVU0sSUFBTSwwQkFBMEIsaUJBQUUsT0FBTztBQUFBLEVBQzlDLE1BQU0saUJBQUUsUUFBUSxlQUFlO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJL0IsZUFBZSxpQkFBRSxNQUFNLGlCQUFFLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEVBQ3hDLFNBQVMsaUJBQUUsUUFBUTtBQUFBLEVBQ25CLFlBQVksZ0JBQWdCLFNBQVM7QUFDdkMsQ0FBQztBQUtNLElBQU0sNEJBQTRCLGlCQUFFLE9BQU87QUFBQSxFQUNoRCxNQUFNLGlCQUFFLFFBQVEsaUJBQWlCO0FBQUEsRUFDakMsYUFBYSxpQkFBRSxNQUFNLGlCQUFFLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEVBQ3RDLFNBQVMsaUJBQUUsUUFBUTtBQUFBLEVBQ25CLFlBQVksZ0JBQWdCLFNBQVM7QUFDdkMsQ0FBQztBQU1NLElBQU0sMEJBQTBCLGlCQUFFLE9BQU87QUFBQSxFQUM5QyxNQUFNLGlCQUFFLFFBQVEsZUFBZTtBQUFBLEVBQy9CLGFBQWEsaUJBQUUsT0FBTztBQUFBLElBQ3BCLEtBQUssaUJBQUUsT0FBTztBQUFBLElBQ2QsSUFBSSxpQkFBRSxPQUFPO0FBQUEsSUFDYixRQUFRLGlCQUFFLE9BQU87QUFBQSxJQUNqQixJQUFJLGlCQUFFLE9BQU87QUFBQSxJQUNiLEtBQUssaUJBQUUsT0FBTztBQUFBLEVBQ2hCLENBQUM7QUFBQSxFQUNELFNBQVMsaUJBQUUsUUFBUTtBQUFBLEVBQ25CLFlBQVksZ0JBQWdCLFNBQVM7QUFDdkMsQ0FBQztBQVFNLElBQU0sbUJBQW1CLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDM0Q7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFPTSxJQUFNLHdCQUF3QixpQkFBRSxPQUFPO0FBQUEsRUFDNUMsZUFBZSxpQkFBRSxRQUFRLENBQUM7QUFBQSxFQUMxQixRQUFRLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxhQUFhO0FBQUEsRUFDakQsbUJBQW1CLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxnQkFBZ0IsRUFBRSxTQUFTO0FBQUEsRUFDMUUsZ0JBQWdCLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxlQUFlLEVBQUUsU0FBUztBQUFBLEVBQ3RFLFNBQVMsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGNBQWMsRUFBRSxTQUFTO0FBQUEsRUFDOUQsU0FBUyxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsYUFBYSxFQUFFLFNBQVM7QUFBQSxFQUM3RCxXQUFXLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxhQUFhLEVBQUUsU0FBUztBQUNqRSxDQUFDO0FBT00sSUFBTSx3QkFBd0IsaUJBQUUsT0FBTztBQUFBLEVBQzVDLGVBQWUsaUJBQUUsUUFBUSxDQUFDO0FBQUEsRUFDMUIsUUFBUSxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsYUFBYTtBQUFBLEVBQ2pELG1CQUFtQixpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsZ0JBQWdCLEVBQUUsU0FBUztBQUFBLEVBQzFFLGdCQUFnQixpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsZUFBZSxFQUFFLFNBQVM7QUFBQSxFQUN0RSxTQUFTLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxjQUFjLEVBQUUsU0FBUztBQUFBLEVBQzlELFNBQVMsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGFBQWEsRUFBRSxTQUFTO0FBQUEsRUFDN0QsV0FBVyxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsYUFBYSxFQUFFLFNBQVM7QUFBQSxFQUMvRCxxQkFBcUIsaUJBQ2xCLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxrQkFBa0IsRUFDNUMsU0FBUztBQUNkLENBQUM7QUFVTSxJQUFNLGVBQWUsaUJBQUUsT0FBTztBQUFBLEVBQ25DLE1BQU0saUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQztBQUN4QixDQUFDO0FBT00sSUFBTSx3QkFBd0IsaUJBQUUsT0FBTztBQUFBLEVBQzVDLGVBQWUsaUJBQUUsUUFBUSxDQUFDO0FBQUEsRUFDMUIsUUFBUSxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsYUFBYTtBQUFBLEVBQ2pELG1CQUFtQixpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsZ0JBQWdCLEVBQUUsU0FBUztBQUFBLEVBQzFFLGdCQUFnQixpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsZUFBZSxFQUFFLFNBQVM7QUFBQSxFQUN0RSxTQUFTLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxjQUFjLEVBQUUsU0FBUztBQUFBLEVBQzlELFNBQVMsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGFBQWEsRUFBRSxTQUFTO0FBQUEsRUFDN0QsV0FBVyxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsYUFBYSxFQUFFLFNBQVM7QUFBQSxFQUMvRCxxQkFBcUIsaUJBQ2xCLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxrQkFBa0IsRUFDNUMsU0FBUztBQUFBLEVBQ1osbUJBQW1CLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxnQkFBZ0IsRUFBRSxTQUFTO0FBQzVFLENBQUM7QUFRTSxJQUFNLHNCQUFzQixpQkFBRSxPQUFPO0FBQUEsRUFDMUMsZUFBZSxpQkFBRSxRQUFRLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSzFCLFFBQVEsaUJBQUUsT0FBTyxjQUFjLGFBQWE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUk1QyxtQkFBbUIsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGdCQUFnQixFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSzFFLGdCQUFnQixpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsZUFBZSxFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUEsRUFHdEUsU0FBUyxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsY0FBYyxFQUFFLFNBQVM7QUFBQTtBQUFBLEVBRTlELFNBQVMsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGFBQWEsRUFBRSxTQUFTO0FBQUE7QUFBQSxFQUU3RCxXQUFXLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxhQUFhLEVBQUUsU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLL0QscUJBQXFCLGlCQUNsQixPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsa0JBQWtCLEVBQzVDLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUlaLG1CQUFtQixpQkFDaEIsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGdCQUFnQixFQUMxQyxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJWixlQUFlLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxZQUFZLEVBQUUsU0FBUztBQUNwRSxDQUFDOzs7QUN4a0JNLElBQU0sc0JBQXNCO0FBQUEsRUFDakM7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0Y7QUFTTyxJQUFNLDRCQUE0QjtBQUFBLEVBQ3ZDO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0Y7QUFFTyxJQUFNLGdCQUErQjtBQUFBLEVBQzFDLFdBQVc7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUFBLElBQ3RCLE9BQU8sRUFBRSxhQUFhLFFBQVEsV0FBVyxRQUFRO0FBQUEsRUFDbkQ7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUFBLElBQ3RCLE9BQU8sRUFBRSxhQUFhLFFBQVEsV0FBVyxTQUFTLGNBQWMsS0FBSztBQUFBLEVBQ3ZFO0FBQUEsRUFFQSxZQUFZO0FBQUEsSUFDVixNQUFNO0FBQUE7QUFBQTtBQUFBLElBR04sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVUsR0FBRyxvQkFBb0IsS0FBSztBQUFBO0FBQUE7QUFBQTtBQUFBLElBSTFELE9BQU8sRUFBRSxhQUFhLFFBQVEsV0FBVyxtQkFBbUI7QUFBQSxJQUM1RCxNQUFNO0FBQUEsTUFDSixPQUNFO0FBQUEsSUFHSjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE9BQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUFBLElBQ3RCLE9BQU8sRUFBRSxhQUFhLFFBQVEsV0FBVyxTQUFTO0FBQUEsRUFDcEQ7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUFBLElBQ3RCLE9BQU8sRUFBRSxhQUFhLFFBQVEsV0FBVyxxQkFBcUI7QUFBQSxFQUNoRTtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSU4sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUU7QUFBQSxJQUNoQyxPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsUUFBUTtBQUFBLEVBQ3BEO0FBQUEsRUFFQSxlQUFlO0FBQUEsSUFDYixNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVUsR0FBRyxvQkFBb0IsS0FBSztBQUFBLElBQzFELE9BQU8sRUFBRSxhQUFhLFNBQVMsV0FBVyxvQkFBb0Isa0JBQWtCLEtBQUs7QUFBQSxJQUNyRixNQUFNO0FBQUEsTUFDSixPQUNFO0FBQUEsSUFJSjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLGFBQWE7QUFBQSxJQUNYLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUFBLElBQ3RCLE9BQU8sRUFBRSxhQUFhLFFBQVEsV0FBVyxRQUFRO0FBQUEsRUFDbkQ7QUFBQSxFQUVBLGNBQWM7QUFBQSxJQUNaLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUFBLElBQ3RCLE9BQU8sRUFBRSxhQUFhLFFBQVEsV0FBVyxRQUFRO0FBQUEsRUFDbkQ7QUFBQSxFQUVBLG1CQUFtQjtBQUFBLElBQ2pCLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUlSLE9BQU87QUFBQSxRQUNMO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU8sRUFBRSxhQUFhLFNBQVMsV0FBVyxjQUFjLGtCQUFrQixLQUFLO0FBQUEsSUFDL0UsTUFBTTtBQUFBLE1BQ0osT0FDRTtBQUFBLElBSUo7QUFBQSxFQUNGO0FBQUEsRUFFQSxpQkFBaUI7QUFBQSxJQUNmLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVU7QUFBQTtBQUFBLE1BRVIsT0FBTyxDQUFDLHFCQUFxQixzQkFBc0IsVUFBVTtBQUFBLElBQy9EO0FBQUEsSUFDQSxPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsa0JBQWtCLGtCQUFrQixLQUFLO0FBQUEsSUFDbkYsTUFBTTtBQUFBLE1BQ0osT0FDRTtBQUFBLElBR0o7QUFBQSxFQUNGO0FBQUEsRUFFQSxVQUFVO0FBQUEsSUFDUixNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLEVBQUUsT0FBTyxDQUFDLE9BQU8sVUFBVSxFQUFFO0FBQUEsSUFDdkMsT0FBTyxFQUFFLGFBQWEsU0FBUyxXQUFXLGVBQWUsa0JBQWtCLEtBQUs7QUFBQSxJQUNoRixNQUFNO0FBQUEsTUFDSixPQUNFO0FBQUEsSUFJSjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLFVBQVU7QUFBQSxJQUNSLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVU7QUFBQSxNQUNSLE9BQU8sQ0FBQyxVQUFVO0FBQUE7QUFBQTtBQUFBLE1BR2xCLGVBQWUsQ0FBQyxPQUFPO0FBQUEsSUFDekI7QUFBQSxJQUNBLE9BQU8sRUFBRSxhQUFhLFNBQVMsV0FBVyxnQkFBZ0Isa0JBQWtCLEtBQUs7QUFBQSxJQUNqRixNQUFNO0FBQUEsTUFDSixPQUNFO0FBQUEsSUFHSjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLGFBQWE7QUFBQSxJQUNYLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsQ0FBQyxjQUFjLGVBQWU7QUFBQSxJQUN4QyxVQUFVO0FBQUEsTUFDUixPQUFPO0FBQUEsUUFDTDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsY0FBYyxrQkFBa0IsS0FBSztBQUFBLElBQy9FLE1BQU07QUFBQSxNQUNKLE9BQ0U7QUFBQSxJQUdKO0FBQUEsRUFDRjtBQUFBLEVBRUEsV0FBVztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUE7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsQ0FBQyxXQUFXLGlCQUFpQixtQkFBbUIsZUFBZTtBQUFBLElBQ3pFLFVBQVU7QUFBQSxNQUNSLE9BQU8sQ0FBQyxZQUFZLHVCQUF1QjtBQUFBLE1BQzNDLHFCQUNFO0FBQUEsSUFJSjtBQUFBO0FBQUE7QUFBQSxJQUdBLE9BQU8sRUFBRSxhQUFhLFFBQVEsV0FBVyxjQUFjLGtCQUFrQixLQUFLO0FBQUEsSUFDOUUsTUFBTTtBQUFBLE1BQ0osT0FDRTtBQUFBLElBR0o7QUFBQSxFQUNGO0FBQUEsRUFFQSxxQkFBcUI7QUFBQSxJQUNuQixNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUU7QUFBQSxJQUN0QixPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsZUFBZTtBQUFBLEVBQzNEO0FBQUEsRUFFQSxnQkFBZ0I7QUFBQSxJQUNkLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsR0FBRyxhQUFhLENBQUMsU0FBUyxFQUFFO0FBQUEsSUFDaEQsT0FBTyxFQUFFLGFBQWEsU0FBUyxXQUFXLGVBQWU7QUFBQSxFQUMzRDtBQUFBLEVBRUEsc0JBQXNCO0FBQUEsSUFDcEIsTUFBTTtBQUFBO0FBQUE7QUFBQSxJQUdOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsR0FBRyxhQUFhLENBQUMsU0FBUyxFQUFFO0FBQUEsSUFDaEQsT0FBTyxFQUFFLGFBQWEsU0FBUyxXQUFXLGVBQWU7QUFBQSxFQUMzRDtBQUFBLEVBRUEsa0JBQWtCO0FBQUEsSUFDaEIsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFO0FBQUE7QUFBQTtBQUFBLElBR3RCLE9BQU8sRUFBRSxhQUFhLFFBQVEsV0FBVyxjQUFjO0FBQUEsSUFDdkQsTUFBTTtBQUFBLE1BQ0osT0FDRTtBQUFBLElBRUo7QUFBQSxFQUNGO0FBQUEsRUFFQSxjQUFjO0FBQUEsSUFDWixNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUE7QUFBQTtBQUFBLElBR2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUU7QUFBQSxJQUM5QixPQUFPLEVBQUUsYUFBYSxRQUFRLFdBQVcsY0FBYztBQUFBLElBQ3ZELE1BQU07QUFBQSxNQUNKLE9BQ0U7QUFBQSxJQUdKO0FBQUEsRUFDRjtBQUFBLEVBRUEsT0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUU7QUFBQSxJQUM5QixPQUFPLEVBQUUsYUFBYSxRQUFRLFdBQVcsY0FBYztBQUFBLElBQ3ZELE1BQU07QUFBQSxNQUNKLE9BQ0U7QUFBQSxJQUdKO0FBQUEsRUFDRjtBQUFBLEVBRUEsY0FBYztBQUFBLElBQ1osTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFO0FBQUEsSUFDdEIsT0FBTyxFQUFFLGFBQWEsUUFBUSxXQUFXLFNBQVM7QUFBQSxFQUNwRDtBQUNGO0FBR08sSUFBTSx1QkFBdUIsT0FBTyxLQUFLLGFBQWE7OztBQ2xZdEQsSUFBTSxxQkFBcUI7QUFJbEMsU0FBUyxNQUFNLE1BQXNCO0FBQ25DLE1BQUksT0FBTztBQUNYLFdBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLEtBQUs7QUFDcEMsWUFBUSxLQUFLLFdBQVcsQ0FBQztBQUN6QixXQUFPLEtBQUssS0FBSyxNQUFNLFFBQVU7QUFBQSxFQUNuQztBQUNBLFVBQVEsU0FBUyxHQUFHLFNBQVMsRUFBRSxFQUFFLFNBQVMsR0FBRyxHQUFHO0FBQ2xEO0FBRUEsU0FBUyxzQkFBOEI7QUFDckMsUUFBTSxRQUFRLENBQUMsR0FBRyxvQkFBb0IsRUFDbkMsS0FBSyxFQUNMLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxjQUFjLElBQUksRUFBRSxRQUFRLENBQUM7QUFDckQsUUFBTSxXQUFXLEtBQUssVUFBVTtBQUFBLElBQzlCLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSO0FBQUEsRUFDRixDQUFDO0FBQ0QsU0FBTyxHQUFHLGtCQUFrQixJQUFJLE1BQU0sUUFBUSxDQUFDO0FBQ2pEO0FBSU8sSUFBTSxnQkFBZ0Isb0JBQW9CO0FBTWpELFNBQVMsZUFBZSxPQUFnQyxNQUFvQjtBQUMxRSxRQUFNLFdBQVcsS0FBSyxRQUFRLEtBQUs7QUFDbkMsTUFBSSxhQUFhLElBQUk7QUFFbkIsVUFBTSxRQUFRLEtBQUssTUFBTSxHQUFHLFFBQVE7QUFDcEMsVUFBTSxNQUFNLEtBQUssTUFBTSxXQUFXLENBQUM7QUFDbkMsVUFBTSxNQUFNLE1BQU0sS0FBSztBQUN2QixRQUFJLE1BQU0sUUFBUSxHQUFHLEdBQUc7QUFDdEIsaUJBQVcsTUFBTSxLQUFLO0FBQ3BCLFlBQUksT0FBTyxRQUFRLE9BQU8sT0FBTyxVQUFVO0FBQ3pDLGlCQUFRLEdBQStCLEdBQUc7QUFBQSxRQUM1QztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQ0E7QUFBQSxFQUNGO0FBQ0EsUUFBTSxTQUFTLEtBQUssUUFBUSxHQUFHO0FBQy9CLE1BQUksV0FBVyxJQUFJO0FBR2pCLFVBQU0sU0FBUyxNQUFNLEtBQUssTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUMxQyxRQUFJLFdBQVcsUUFBUSxPQUFPLFdBQVcsWUFBWSxDQUFDLE1BQU0sUUFBUSxNQUFNLEdBQUc7QUFDM0UsYUFBUSxPQUFtQyxLQUFLLE1BQU0sU0FBUyxDQUFDLENBQUM7QUFBQSxJQUNuRTtBQUNBO0FBQUEsRUFDRjtBQUVBLFNBQU8sTUFBTSxJQUFJO0FBQ25CO0FBTUEsSUFBTSx1QkFBdUIsb0JBQUksSUFBSSxDQUFDLGVBQWUsWUFBWSxDQUFDO0FBRWxFLFNBQVMsbUJBQW1CLE9BQXNCO0FBQ2hELE1BQUksTUFBTSxRQUFRLEtBQUssR0FBRztBQUN4QixlQUFXLE1BQU0sTUFBTyxvQkFBbUIsRUFBRTtBQUM3QztBQUFBLEVBQ0Y7QUFDQSxNQUFJLFVBQVUsUUFBUSxPQUFPLFVBQVUsU0FBVTtBQUNqRCxRQUFNLE1BQU07QUFFWixNQUFJLElBQUksU0FBUyxTQUFTO0FBQ3hCLGVBQVcsU0FBUyxvQkFBcUIsUUFBTyxJQUFJLEtBQUs7QUFBQSxFQUMzRDtBQUNBLE1BQ0UsT0FBTyxJQUFJLFNBQVMsWUFDcEIscUJBQXFCLElBQUksSUFBSSxJQUFJLEtBQ2pDLE1BQU0sUUFBUSxJQUFJLE9BQU8sR0FDekI7QUFDQSxlQUFXLFVBQVUsSUFBSSxTQUFTO0FBQ2hDLFVBQUksV0FBVyxRQUFRLE9BQU8sV0FBVyxVQUFVO0FBQ2pELG1CQUFXLFNBQVMsMkJBQTJCO0FBQzdDLGlCQUFRLE9BQW1DLEtBQUs7QUFBQSxRQUNsRDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLGFBQVcsT0FBTyxPQUFPLEtBQUssR0FBRyxFQUFHLG9CQUFtQixJQUFJLEdBQUcsQ0FBQztBQUNqRTtBQU9BLFNBQVMsaUJBQWlCLE9BQXNDO0FBQzlELFFBQU0sT0FBTyxNQUFNO0FBQ25CLFFBQU0sUUFDSixPQUFPLFNBQVMsWUFBWSxRQUFRLGdCQUNoQyxjQUFjLElBQWtDLElBQ2hEO0FBQ04sTUFBSSxDQUFDLE9BQU87QUFJVixVQUFNLElBQUksTUFBTSxnQ0FBZ0MsT0FBTyxJQUFJLENBQUMsRUFBRTtBQUFBLEVBQ2hFO0FBRUEsYUFBVyxRQUFRLE1BQU0sU0FBUyxNQUFPLGdCQUFlLE9BQU8sSUFBSTtBQUVuRSxhQUFXLFNBQVMsTUFBTSxTQUFTLGVBQWUsQ0FBQyxHQUFHO0FBQ3BELFVBQU0sV0FBVyxNQUFNLEtBQUs7QUFDNUIsUUFBSSxNQUFNLFFBQVEsUUFBUSxHQUFHO0FBQzNCLGlCQUFXLFNBQVMsVUFBVTtBQUM1QixZQUFJLFVBQVUsUUFBUSxPQUFPLFVBQVUsVUFBVTtBQUMvQywyQkFBaUIsS0FBZ0M7QUFBQSxRQUNuRDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLHFCQUFtQixLQUFLO0FBQzFCO0FBSU8sU0FBUyxjQUFjLE9BQThCO0FBQzFELFFBQU0sUUFBUSxnQkFBZ0IsS0FBSztBQUNuQyxtQkFBaUIsS0FBSztBQUN0QixTQUFPO0FBQ1Q7QUFRTyxTQUFTLHlCQUNkLEtBQzJCO0FBQzNCLFFBQU0sUUFBUSxnQkFBZ0IsR0FBRztBQUtqQyxhQUFXLFdBQVcsTUFBTSxVQUFVO0FBQ3BDLGVBQVcsT0FBTyxRQUFRLE1BQU07QUFDOUIsaUJBQVcsVUFBVSxJQUFJLFNBQVM7QUFDaEMsbUJBQVcsU0FBUyxPQUFPLFFBQVE7QUFDakMsY0FBSSxVQUFVLFFBQVEsT0FBTyxVQUFVLFVBQVU7QUFDL0MsNkJBQWlCLEtBQWdDO0FBQUEsVUFDbkQ7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBR0EscUJBQW1CLEtBQUs7QUFDeEIsU0FBTztBQUNUOzs7QUM3TEEsU0FBUyxTQUFTLE1BQXNCO0FBQ3RDLE1BQUksT0FBTztBQUNYLFdBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLEtBQUs7QUFDcEMsWUFBUSxLQUFLLFdBQVcsQ0FBQztBQUN6QixXQUFPLEtBQUssS0FBSyxNQUFNLFFBQVU7QUFBQSxFQUNuQztBQUNBLFNBQU8sU0FBUztBQUNsQjtBQUdBLFNBQVMsV0FBVyxNQUE0QjtBQUM5QyxNQUFJLElBQUksU0FBUztBQUNqQixTQUFPLE1BQU07QUFDWCxRQUFLLElBQUksZUFBZ0I7QUFDekIsUUFBSSxJQUFJO0FBQ1IsUUFBSSxLQUFLLEtBQUssSUFBSyxNQUFNLElBQUssSUFBSSxDQUFDO0FBQ25DLFNBQUssSUFBSSxLQUFLLEtBQUssSUFBSyxNQUFNLEdBQUksSUFBSSxFQUFFO0FBQ3hDLGFBQVMsSUFBSyxNQUFNLFFBQVMsS0FBSztBQUFBLEVBQ3BDO0FBQ0Y7QUFHTyxTQUFTLGNBQWlCLE9BQXFCLFNBQXNCO0FBQzFFLFFBQU0sTUFBTSxDQUFDLEdBQUcsS0FBSztBQUNyQixRQUFNLE9BQU8sV0FBVyxTQUFTLE9BQU8sQ0FBQztBQUN6QyxXQUFTLElBQUksSUFBSSxTQUFTLEdBQUcsSUFBSSxHQUFHLEtBQUs7QUFDdkMsVUFBTSxJQUFJLEtBQUssTUFBTSxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQ3JDLFVBQU0sSUFBSSxJQUFJLENBQUM7QUFDZixRQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDZCxRQUFJLENBQUMsSUFBSTtBQUFBLEVBQ1g7QUFDQSxTQUFPO0FBQ1Q7QUFRTyxTQUFTLG1CQUNkLEtBQ0EsU0FDMkI7QUFDM0IsUUFBTSxRQUFRLGdCQUFnQixHQUFHO0FBTWpDLFFBQU0sZUFBZSxDQUFDLFVBQXlDO0FBQzdELFVBQU0sT0FBTyxNQUFNO0FBQ25CLFVBQU0sUUFDSixPQUFPLFNBQVMsWUFBWSxRQUFRLGdCQUNoQyxjQUFjLElBQWtDLElBQ2hEO0FBQ04sUUFBSSxDQUFDLE1BQU87QUFDWixlQUFXLFNBQVMsTUFBTSxTQUFTLGlCQUFpQixDQUFDLEdBQUc7QUFDdEQsWUFBTSxNQUFNLE1BQU0sS0FBSztBQUN2QixVQUFJLE1BQU0sUUFBUSxHQUFHLEdBQUc7QUFDdEIsY0FBTSxLQUFLLElBQUk7QUFBQSxVQUNiO0FBQUEsVUFDQSxHQUFHLE9BQU8sSUFBSSxPQUFPLE1BQU0sTUFBTSxFQUFFLENBQUMsSUFBSSxLQUFLO0FBQUEsUUFDL0M7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUVBLGVBQVcsU0FBUyxNQUFNLFNBQVMsZUFBZSxDQUFDLEdBQUc7QUFDcEQsWUFBTSxXQUFXLE1BQU0sS0FBSztBQUM1QixVQUFJLE1BQU0sUUFBUSxRQUFRLEdBQUc7QUFDM0IsbUJBQVcsU0FBUyxVQUFVO0FBQzVCLGNBQUksVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVO0FBQy9DLHlCQUFhLEtBQWdDO0FBQUEsVUFDL0M7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsYUFBVyxXQUFXLE1BQU0sVUFBVTtBQUNwQyxlQUFXLE9BQU8sUUFBUSxNQUFNO0FBQzlCLGlCQUFXLFVBQVUsSUFBSSxTQUFTO0FBQ2hDLG1CQUFXLFNBQVMsT0FBTyxRQUFRO0FBQ2pDLGNBQUksVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVO0FBQy9DLHlCQUFhLEtBQWdDO0FBQUEsVUFDL0M7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0EsU0FBTztBQUNUOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgIm9iamVjdFV0aWwiLCAiZXJyb3JVdGlsIiwgImVycm9yTWFwIiwgImN0eCIsICJyZXN1bHQiLCAiaXNzdWVzIiwgImVsZW1lbnRzIiwgInByb2Nlc3NlZCIsICJyZXN1bHQiLCAiciIsICJab2RGaXJzdFBhcnR5VHlwZUtpbmQiXQp9Cg==
