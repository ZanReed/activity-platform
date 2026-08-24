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
  // Keep the authored choice order on paper (S5.5 D17A). Printed VERSIONS
  // shuffle choices to discourage copying, which is wrong for a question whose
  // order carries meaning — "all of the above" has to stay last, and "both A
  // and B" names positions outright. Optional with no default so a document
  // written before this re-serializes byte-identically; absent means shuffle,
  // which is the right default for the overwhelming majority of questions.
  lockChoiceOrder: external_exports.boolean().optional(),
  // Worked explanation for the whole problem, revealed post-check regardless
  // of correctness (same contract as FillInBlankBlock.solution).
  solution: external_exports.array(InlineNode).optional(),
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
  // header); many-to-one is allowed (the grader's item→target key scores it
  // naturally, and the viewer never restricted docking a target twice).
  key: external_exports.record(external_exports.string().uuid(), external_exports.string().uuid()),
  // MC-parity problem chrome (one problem shape, one dashboard row shape).
  solution: external_exports.array(InlineNode).optional(),
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
  showStepLabels: external_exports.boolean().default(true),
  // The box's OWN page label (viewer-numbering N6). It has always been one
  // numbered problem; this is what lets a teacher relabel it ("Warm-up") or
  // unnumber it, the same vocabulary every other numbered type already had.
  // Distinct from showStepLabels, which governs the (a)/(b) letters INSIDE the
  // box — that one is about the steps, this one is about the box.
  ...labelFields
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
var answerFields = {
  /** The canonical answer / marking guide. Teacher-only on every channel. */
  answer: external_exports.array(InlineNode).optional(),
  /** The post-check explanation — same release rule as every other `solution`. */
  solution: external_exports.array(InlineNode).optional()
};
var ShortAnswerBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("short_answer"),
  prompt: external_exports.array(InlineNode),
  placeholder: external_exports.string().optional(),
  rubric: Rubric.optional(),
  ...answerFields,
  ...labelFields
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
  rubric: Rubric.optional(),
  ...answerFields,
  ...labelFields
});

// packages/schema/src/blocks/table.ts
var TableColumnAlign = external_exports.enum(["left", "center", "right"]);
var TableCell = external_exports.object({
  id: external_exports.string().uuid(),
  // The same inline alphabet fill_in_blank's body uses: text with marks,
  // inline math, hard breaks, and blank tokens. Deliberately NOT a block array:
  // it keeps every cell walkable, keeps the schema non-recursive (see the
  // TS7056 note in inline.ts), and keeps a cell a cell rather than a page.
  content: external_exports.array(FillInBlankInline).default([])
});
var TableRow = external_exports.object({
  id: external_exports.string().uuid(),
  cells: external_exports.array(TableCell).default([])
});
var TableBlock = external_exports.object({
  id: external_exports.string().uuid(),
  type: external_exports.literal("table"),
  // Auto-assigned worksheet number, as on every numbered block. Present only
  // when the table is gradable (a blankless table is a stimulus, not a
  // question) — resolved by numbering, not stored authority.
  number: external_exports.number().int().positive().optional(),
  // Which axis carries the headers. Two booleans rather than a per-cell flag:
  // a header cell in the MIDDLE of a table is not a thing this vocabulary
  // should be able to express, and the a11y story needs to know which axis
  // names a cell ("Kilograms 2, Cost" reads correctly only if we know where the
  // labels live). `headerColumn` is not decoration — algebra tables are as
  // often transposed (x down the left) as not.
  headerRow: external_exports.boolean().default(true),
  headerColumn: external_exports.boolean().default(false),
  // Per-column alignment, index-aligned with each row's cells. Optional with NO
  // default so a table authored without alignment re-serializes byte-identically
  // (the same optional-no-default discipline as BlankToken.answerType). A short
  // array is fine: columns past its end fall back to left.
  columnAligns: external_exports.array(TableColumnAlign).optional(),
  // The (a)/(b) markers on blank cells. Mirrors faded_worked_example's
  // showStepLabels — off gives a teacher maximum writing room on paper.
  // Defaulted so a document authored before this field renders labelled.
  showCellLabels: external_exports.boolean().default(true),
  rows: external_exports.array(TableRow).default([]),
  // The table's own page label (auto/custom/none), like every numbered type.
  ...labelFields
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
  GraphFigureBlock,
  TableBlock
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
  // .min(1): course is stamped into the
  // activities.course column at publish
  // (0037, taxonomy R1) where it is `not
  // null` — a blank course would publish an
  // empty facet into the catalog. The editor
  // falls back to the default rather than
  // ever sending a blank (ActivityEditor
  // save(), same guard title already has).
  course: external_exports.string().min(1).default("Algebra II"),
  unit: external_exports.string().optional(),
  submissionMode: external_exports.enum(["single", "locked", "free"]).default("free"),
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
    // WAS a faithful oddity (absent from the baseline break-inside:avoid list,
    // so a numbered display equation could split across a page). FIXED by
    // ruling S5-OV6 — still not in the showAnswers set, which is the separate
    // answer-key-variant question S5.5 owns.
    print: { breakInside: "avoid", treatment: "underline-blanks" },
    a11y: {
      story: 'Each in-equation gap is a text input in tab order, labeled with its position within the equation ("gap 1 of 2"). The PROBLEM number is announced once by the block wrapper, which is a labelled group \u2014 not repeated on every gap (viewer-numbering D3). Values type as plain text; verdicts are announced via the shared state-pill aria-live region.'
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
    print: { breakInside: "avoid", treatment: "underline-blanks" },
    a11y: {
      story: 'Each blank is a text input in tab order, labeled with its sub-part and position ("Part b, blank 2 of 3") on a numbered multi-blank problem, and "Blank 2 of 3" otherwise. The PROBLEM number is announced once by the block wrapper, which is a labelled group, rather than repeated on every blank (viewer-numbering D3/N7). Hint and mistake affordances are buttons reachable by Tab; the opened popover traps no focus and closes on Escape. Verdicts announce via aria-live.'
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
      // The widget needs handle count / family, which live in the key the
      // viewer never gets. Derived + whitelisted; see SanitizeSpec.
      deriveQuestionShape: true,
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
        "builtinFeedback"
      ]
    },
    print: { breakInside: "avoid", treatment: "static-svg" },
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
    print: {
      breakInside: "avoid",
      treatment: "choice-letters",
      // Printed versions rearrange the choices; a question that says "all of
      // the above" opts out per-block (D17A). NOT serveShuffled: the student
      // screen keeps the authored order, because the answer is the choice id
      // and rearranging it there buys nothing.
      shuffled: ["choices"],
      shuffleLockedBy: "lockChoiceOrder"
    },
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
    // A9/E3: conditional, and declared as such — the bank drops its
    // unbreakability once it holds figures. See PrintSpec.breakInside.
    print: { breakInside: "avoid-unless-figures", treatment: "letter-bank" },
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
    print: {
      breakInside: "avoid",
      treatment: "number-boxes",
      // The authored order is the answer, so paper must never show it. The
      // server already shuffles for students (serveShuffled above); teacher
      // print gets its own, because that path deliberately does not run the
      // per-student serve shuffle.
      shuffled: ["items"]
    },
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
      // The widget needs handle count / family, which live in the key the
      // viewer never gets. Derived + whitelisted; see SanitizeSpec.
      deriveQuestionShape: true,
      strip: [
        "interaction.correctPoints",
        "interaction.tolerance",
        "interaction.correctInterval",
        "solution"
      ]
    },
    print: { breakInside: "avoid", treatment: "static-svg" },
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
      // The widget needs handle count / family, which live in the key the
      // viewer never gets. Derived + whitelisted; see SanitizeSpec.
      deriveQuestionShape: true,
      strip: ["solution", "interaction.tolerance"],
      derivableFromServed: "The data set is the working material the student builds the chart FROM, and the correct chart is computed from it \u2014 withholding the data would remove the task. Server-authoritative grading still gates verdicts; the leak tests whitelist `data` for this block explicitly."
    },
    // WAS a faithful oddity (absent from the baseline break-inside:avoid list,
    // unlike the graph and number-line canvases). FIXED by ruling S5-OV6 — a
    // chart split across a page boundary is unreadable.
    print: { breakInside: "avoid", treatment: "static-svg" },
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
  table: {
    type: "table",
    // DUAL-NATURED, resolved per instance rather than declared per type: a
    // table whose cells hold blanks is a question; a blankless one is a
    // stimulus (a rates chart to READ). familyOf()/categoryOf() route through
    // isGradeable, which answers from CONTENT — the math_block precedent, and
    // the reason there is no authored `interactive` flag to drift.
    family: "auto_gradable",
    interactivity: "interactive",
    category: "question",
    numbered: "when_gradable",
    analyticsKey: "table",
    // Cells are NOT blocks, so `childBlocks` would be a category error here.
    // The cell blanks are in-band content of THIS block: the deep strip walks
    // them unconditionally (it never stops at nested arrays), and this flag is
    // the declaration + the type projection that says so.
    sanitize: { strip: [], inlineBlankSecrets: true },
    print: { breakInside: "avoid", treatment: "data-table" },
    a11y: {
      story: 'The table is a real <table> with <th> cells on whichever axis the author marked (headerRow / headerColumn), so a screen reader announces a blank cell with its row and column headers \u2014 "Kilograms 2, Cost, blank" \u2014 which is the information a sighted student reads off the grid. Each blank is a text input in tab order, reading order left to right then down. On a multi-blank table the input also carries its sub-part letter ("Part b"), matching the (b) marker printed beside it; that marker is aria-hidden so it is not announced twice. The PROBLEM number is announced once by the block wrapper, never repeated per cell (viewer-numbering D3). Verdicts announce via the shared state-pill aria-live region.'
    }
  },
  self_explanation: {
    type: "self_explanation",
    family: "recorded",
    interactivity: "interactive",
    category: "question",
    numbered: "never",
    analyticsKey: "self_explanation",
    sanitize: { strip: [] },
    // WAS a faithful oddity: the baseline avoid rides the textarea, not the
    // block, so a long prompt could separate from its writing box. FIXED by
    // ruling S5-OV6 — a prompt on one page and its answer space on the next is
    // the same defect class as a split equation.
    print: { breakInside: "avoid", treatment: "writing-box" },
    a11y: {
      story: 'A labeled textarea in tab order. On check the block announces "Recorded \u2014 your teacher will review" via aria-live; never a verdict.'
    }
  },
  short_answer: {
    type: "short_answer",
    family: "recorded",
    interactivity: "interactive",
    category: "question",
    // WAS 'never' — a pre-paper-first choice. Ruling E7 (2026-08-19): a graded
    // question a teacher marks on paper needs a number, and the numbering walk
    // that already exists gives the scan arc its paper→block mapping for free.
    numbered: "always",
    analyticsKey: "short_answer",
    // Rubrics are teacher-side data — already correctly withheld from student
    // HTML today; the registry makes that a declared invariant.
    //
    // `answer` and `solution` joined it with the answer-key slice (ruling E2/E3)
    // and the ORDER OF EVENTS matters more than the list does: E3 declares the
    // anti-leak chain ONE INSEPARABLE UNIT — this strip entry, the leakFixture
    // sentinel row that observes it, the sanitize unit assertion, and the
    // schema-vs-registry completeness gate all land together. A strip entry
    // without its fixture row is a claim nothing checks (the "passing because
    // of what is absent" class), which is exactly how a key leaks quietly.
    sanitize: { strip: ["rubric", "answer", "solution"] },
    // Same former oddity as self_explanation, and fixed with it: the baseline
    // avoid rides the textarea, not the block, so a prompt could print on one
    // page with its answer space on the next. S5-OV6 named only the three
    // types its comments flagged; the author extended the ruling to the two
    // unnamed siblings of the same family rather than leave the defect in
    // place for them (the plot_ray/plot_segment lesson: audit the family).
    print: { breakInside: "avoid", treatment: "writing-box" },
    a11y: {
      story: "A labeled textarea in tab order. Recorded state announces via aria-live; teacher feedback, once released, renders as a labeled region announced on arrival."
    }
  },
  essay: {
    type: "essay",
    family: "recorded",
    interactivity: "interactive",
    category: "question",
    // Numbered with short_answer — see the note there (ruling E7).
    numbered: "always",
    analyticsKey: "essay",
    // answer + solution ride the same anti-leak unit as short_answer's; E4's
    // parity ruling is what keeps these two lists identical.
    sanitize: { strip: ["rubric", "answer", "solution"] },
    // Extended with short_answer + self_explanation — see the note there.
    print: { breakInside: "avoid", treatment: "writing-box" },
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
function censusKeyOf(block) {
  const entry = blockRegistry[block.type];
  if ("interaction" in block && entry.variants) {
    return `${entry.analyticsKey}.${block.interaction.type}`;
  }
  return entry.analyticsKey;
}

// packages/viewer/src/sanitize/promptCarriers.ts
var PROMPT_CARRIER_TYPES = /* @__PURE__ */ new Set([
  "math_inline",
  "math_block"
]);

// packages/viewer/src/sanitize/sanitize.ts
var SANITIZER_ALGO_REV = 2;
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
var MAX_HANDLES = 24;
var KNOWN_FAMILIES = /* @__PURE__ */ new Set([
  "linear",
  "quadratic",
  "exponential",
  "logarithmic",
  "vertical",
  "absolute",
  "sqrt",
  "cubic"
]);
function safeCount(value) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= MAX_HANDLES ? value : void 0;
}
function safeFamily(value) {
  return typeof value === "string" && KNOWN_FAMILIES.has(value) ? value : void 0;
}
function deriveQuestionShape(block) {
  const interaction = block.interaction;
  const kind = typeof interaction?.type === "string" ? interaction.type : null;
  if (!kind || kind === "display") return void 0;
  const shape = {};
  const points = interaction?.correctPoints;
  if (Array.isArray(points)) {
    const count = safeCount(points.length);
    if (count !== void 0) shape.handleCount = count;
  }
  const models = interaction?.models;
  if (Array.isArray(models) && models.length > 0) {
    const family = safeFamily(
      models[0]?.family
    );
    if (family !== void 0) shape.family = family;
  }
  const inequalities = interaction?.inequalities;
  if (Array.isArray(inequalities) && inequalities.length > 0) {
    const boundary = inequalities[0]?.boundary;
    const family = safeFamily(boundary?.family);
    if (family !== void 0) shape.family = family;
  }
  const regions = interaction?.regions;
  if (Array.isArray(regions) && regions.length > 0) {
    const vertices = regions[0]?.correctVertices;
    if (Array.isArray(vertices)) {
      const count = safeCount(vertices.length);
      if (count !== void 0) shape.vertexCount = count;
    }
  }
  return Object.keys(shape).length > 0 ? shape : void 0;
}
function sanitizeBlockMut(block) {
  const type = block.type;
  const entry = typeof type === "string" && type in blockRegistry ? blockRegistry[type] : void 0;
  if (!entry) {
    throw new Error(`sanitize: unknown block type ${String(type)}`);
  }
  const shape = entry.sanitize.deriveQuestionShape ? deriveQuestionShape(block) : void 0;
  for (const path of entry.sanitize.strip) applyStripPath(block, path);
  if (shape) block.questionShape = shape;
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
  const panel = clone.referencePanel;
  if (panel !== null && typeof panel === "object") {
    const panelBlocks = panel.blocks;
    if (Array.isArray(panelBlocks)) {
      for (const block of panelBlocks) {
        if (block !== null && typeof block === "object") {
          sanitizeBlockMut(block);
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
  if (out.length > 1 && out.every((value, i) => value === items[i])) {
    out.push(out.shift());
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

// packages/viewer/src/container/blockIndex.ts
function looksLikeBlockArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(
    (item) => typeof item === "object" && item !== null && typeof item.id === "string" && typeof item.type === "string"
  ) && // Inline nodes carry `type` but never `id` + block-ish shape together;
  // require at least one known container-ish key to avoid false positives.
  value.every((item) => {
    const t = item.type;
    return t !== "text" && t !== "blank" && t !== "math_inline" && t !== "hard_break";
  });
}
function childBlocksOf(block) {
  const out = [];
  for (const value of Object.values(block)) {
    if (looksLikeBlockArray(value)) out.push(...value);
  }
  return out;
}

// packages/viewer/src/server/grading/walk.ts
var MalformedDocumentError = class extends Error {
  problems;
  constructor(problems) {
    super(`Structurally broken document: ${problems.join("; ")}`);
    this.name = "MalformedDocumentError";
    this.problems = problems;
  }
};
var FREE_TEXT_TYPES = /* @__PURE__ */ new Set([
  "self_explanation",
  "short_answer",
  "essay"
]);
var GRAPH_TYPES = /* @__PURE__ */ new Set([
  "interactive_graph",
  "number_line",
  "data_plot"
]);
function blankTokenToKey(node) {
  const answer = typeof node.answer === "string" ? node.answer : "";
  const acceptable = Array.isArray(node.acceptableAnswers) ? node.acceptableAnswers.filter(
    (a) => typeof a === "string"
  ) : [];
  const answerType = node.answerType;
  return {
    id: String(node.id ?? ""),
    // `answer` first, then the alternates — one list, matching how the
    // renderer joins them into data-blank-answers.
    answers: [answer, ...acceptable],
    answerType: answerType === "numeric" || answerType === "math" ? answerType : "text",
    tolerance: typeof node.tolerance === "number" ? node.tolerance : 0,
    equivalence: node.equivalence === "exact-form" ? "exact-form" : "value",
    mistakeFeedback: Array.isArray(node.mistakeFeedback) ? node.mistakeFeedback : [],
    hint: Array.isArray(node.hint) ? node.hint : void 0,
    interchangeableWithPrevious: node.interchangeableWithPrevious === true
  };
}
function mathPromptToKey(node) {
  const answer = typeof node.answer === "string" ? node.answer : "";
  const acceptable = Array.isArray(node.acceptableAnswers) ? node.acceptableAnswers.filter(
    (a) => typeof a === "string"
  ) : [];
  return {
    id: String(node.id ?? ""),
    answers: [answer, ...acceptable],
    answerType: "math",
    tolerance: typeof node.tolerance === "number" ? node.tolerance : 0,
    equivalence: node.equivalence === "exact-form" ? "exact-form" : "value",
    mistakeFeedback: [],
    hint: void 0,
    // A gap never joins an interchangeable run: the flag is a BlankToken field.
    interchangeableWithPrevious: false
  };
}
var ANSWER_TYPES = /* @__PURE__ */ new Set(["text", "numeric", "math"]);
var EQUIVALENCES = /* @__PURE__ */ new Set(["value", "exact-form"]);
function bad(value, ok) {
  return value !== void 0 && !ok(value);
}
var isString = (v) => typeof v === "string";
var isNumber = (v) => typeof v === "number";
var isBoolean = (v) => typeof v === "boolean";
var isArrayV = (v) => Array.isArray(v);
var isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
function checkItemIds(items, blockId, problems) {
  for (const item of items) {
    if (!isPlainObject(item)) {
      problems.push(`block ${blockId}: an item entry that is not an object`);
    } else if (typeof item.id !== "string") {
      problems.push(`block ${blockId}: an item without a string id`);
    }
  }
}
function checkKeyFields(node, where, problems, forPrompt) {
  if (bad(node.answer, isString)) {
    problems.push(`${where}: answer is not a string`);
  }
  if (bad(node.acceptableAnswers, isArrayV)) {
    problems.push(`${where}: acceptableAnswers is not an array`);
  } else if (Array.isArray(node.acceptableAnswers)) {
    if (!node.acceptableAnswers.every(isString)) {
      problems.push(`${where}: acceptableAnswers has a non-string entry`);
    }
  }
  if (bad(node.answerType, (v) => ANSWER_TYPES.has(v))) {
    problems.push(`${where}: answerType is outside the vocabulary`);
  }
  if (bad(node.tolerance, isNumber)) {
    problems.push(`${where}: tolerance is not a number`);
  }
  if (bad(node.equivalence, (v) => EQUIVALENCES.has(v))) {
    problems.push(`${where}: equivalence is outside the vocabulary`);
  }
  if (forPrompt) return;
  if (bad(node.mistakeFeedback, isArrayV)) {
    problems.push(`${where}: mistakeFeedback is not an array`);
  }
  if (bad(node.hint, isArrayV)) {
    problems.push(`${where}: hint is not an array`);
  }
  if (bad(node.interchangeableWithPrevious, isBoolean)) {
    problems.push(`${where}: interchangeableWithPrevious is not a boolean`);
  }
}
function collectInBandKeys(value, out, isChildBlockArray, blockId, problems) {
  if (Array.isArray(value)) {
    if (isChildBlockArray(value)) return;
    for (const item of value) {
      collectInBandKeys(item, out, isChildBlockArray, blockId, problems);
    }
    return;
  }
  if (value === null || typeof value !== "object") return;
  const node = value;
  if (node.type === "blank" && typeof node.id !== "string") {
    problems.push(`block ${blockId}: a blank token without a string id`);
  }
  if (node.type === "blank" && typeof node.id === "string") {
    checkKeyFields(node, `block ${blockId}: blank ${node.id}`, problems, false);
    out.push(blankTokenToKey(node));
    return;
  }
  if (typeof node.type === "string" && PROMPT_CARRIER_TYPES.has(node.type)) {
    if (bad(node.prompts, isArrayV)) {
      problems.push(`block ${blockId}: prompts is not an array`);
    }
    if (Array.isArray(node.prompts)) {
      for (const prompt of node.prompts) {
        if (prompt === null || typeof prompt !== "object") {
          problems.push(`block ${blockId}: a prompt entry that is not an object`);
          continue;
        }
        const p = prompt;
        if (typeof p.id !== "string") {
          problems.push(`block ${blockId}: a prompt without a string id`);
        } else {
          checkKeyFields(p, `block ${blockId}: prompt ${p.id}`, problems, true);
        }
        out.push(mathPromptToKey(p));
      }
    }
  }
  for (const child of Object.values(node)) {
    collectInBandKeys(child, out, isChildBlockArray, blockId, problems);
  }
}
function visit(block, inv, problems) {
  const id = typeof block.id === "string" ? block.id : "";
  const type = typeof block.type === "string" ? block.type : "";
  if (bad(block.id, isString)) {
    problems.push(`a block whose id is not a string (${JSON.stringify(block.id)})`);
  }
  if (bad(block.type, isString)) {
    problems.push(`block ${id || "<no id>"}: type is not a string`);
  }
  if (bad(block.solution, isArrayV)) {
    problems.push(`block ${id || "<no id>"}: solution is not an array`);
  }
  if (!id) return;
  if (Array.isArray(block.solution) && block.solution.length > 0) {
    inv.solutions.push({ blockId: id, solution: block.solution });
  }
  const inBand = [];
  collectInBandKeys(block, inBand, looksLikeBlockArray, id, problems);
  if (inBand.length > 0) {
    inv.blankGroupsByBlock.push({ blockId: id, keys: inBand });
  }
  switch (type) {
    case "multiple_choice": {
      if (bad(block.choices, isArrayV)) {
        problems.push(`block ${id}: choices is not an array`);
      }
      if (Array.isArray(block.choices)) {
        for (const c of block.choices) {
          if (!isPlainObject(c)) {
            problems.push(`block ${id}: a choice entry that is not an object`);
            continue;
          }
          const choice = c;
          if (typeof choice.id !== "string") {
            problems.push(`block ${id}: a choice without a string id`);
          }
          if (bad(choice.correct, isBoolean)) {
            problems.push(`block ${id}: a choice whose correct flag is not a boolean`);
          }
          if (bad(choice.feedback, isArrayV)) {
            problems.push(`block ${id}: a choice whose feedback is not an array`);
          }
        }
      }
      const choices = Array.isArray(block.choices) ? block.choices : [];
      inv.multipleChoice.push({
        blockId: id,
        correctIds: choices.filter((c) => c.correct === true).map((c) => String(c.id)),
        choices: choices.map((c) => ({
          id: String(c.id),
          ...Array.isArray(c.feedback) ? { feedback: c.feedback } : {}
        }))
      });
      break;
    }
    case "matching": {
      if (bad(block.items, isArrayV)) {
        problems.push(`block ${id}: items is not an array`);
      }
      if (bad(block.key, isPlainObject)) {
        problems.push(`block ${id}: key is not an object`);
      } else if (isPlainObject(block.key)) {
        if (!Object.values(block.key).every(isString)) {
          problems.push(`block ${id}: key has a non-string target`);
        }
      }
      const items = Array.isArray(block.items) ? block.items : [];
      checkItemIds(items, id, problems);
      inv.matching.push({
        blockId: id,
        key: block.key ?? {},
        itemIds: items.map((i) => String(i.id))
      });
      break;
    }
    case "ordering": {
      if (bad(block.items, isArrayV)) {
        problems.push(`block ${id}: items is not an array`);
      }
      const items = Array.isArray(block.items) ? block.items : [];
      checkItemIds(items, id, problems);
      inv.ordering.push({ blockId: id, authoredOrder: items.map((i) => String(i.id)) });
      break;
    }
    case "table": {
      if (bad(block.rows, isArrayV)) {
        problems.push(`block ${id}: rows is not an array`);
      }
      if (Array.isArray(block.rows)) {
        for (const row of block.rows) {
          if (!isPlainObject(row)) {
            problems.push(`block ${id}: a row that is not an object`);
            continue;
          }
          const cells = row.cells;
          if (bad(cells, isArrayV)) {
            problems.push(`block ${id}: a row whose cells is not an array`);
            continue;
          }
          for (const cell of Array.isArray(cells) ? cells : []) {
            if (!isPlainObject(cell)) {
              problems.push(`block ${id}: a cell that is not an object`);
              continue;
            }
            if (bad(cell.content, isArrayV)) {
              problems.push(`block ${id}: a cell whose content is not an array`);
            }
          }
        }
      }
      break;
    }
    default:
      if (FREE_TEXT_TYPES.has(type)) {
        inv.freeText.push(id);
      } else if (GRAPH_TYPES.has(type)) {
        inv.graphs.push({ blockId: id, block });
      }
      break;
  }
  for (const child of childBlocksOf(block)) visit(child, inv, problems);
}
function inventorySection(section, options = {}) {
  const inv = {
    blankGroupsByBlock: [],
    multipleChoice: [],
    matching: [],
    ordering: [],
    graphs: [],
    freeText: [],
    solutions: []
  };
  const problems = [];
  const raw = section;
  if (bad(raw.rows, isArrayV)) {
    problems.push("section: rows is not an array");
  }
  for (const row of Array.isArray(raw.rows) ? section.rows ?? [] : []) {
    if (!isPlainObject(row)) {
      problems.push("section: a row that is not an object");
      continue;
    }
    if (bad(row.columns, isArrayV)) {
      problems.push("section: a row whose columns is not an array");
    }
    for (const column of Array.isArray(row.columns) ? row.columns : []) {
      if (!isPlainObject(column)) {
        problems.push("section: a column that is not an object");
        continue;
      }
      if (bad(column.blocks, isArrayV)) {
        problems.push("section: a column whose blocks is not an array");
      }
      for (const block of Array.isArray(column.blocks) ? column.blocks : []) {
        if (!isPlainObject(block)) {
          problems.push("section: a blocks entry that is not an object");
          continue;
        }
        visit(block, inv, problems);
      }
    }
  }
  if (problems.length > 0 && options.integrity !== "coerce") {
    throw new MalformedDocumentError(problems);
  }
  return inv;
}

// packages/viewer/src/census/census.ts
var UNKNOWN_CENSUS_KEY = "_unknown";
function safeCensusKey(block) {
  const type = block.type;
  if (typeof type !== "string" || !(type in blockRegistry)) {
    return UNKNOWN_CENSUS_KEY;
  }
  return censusKeyOf(block);
}
function visitDeep(block, visit2) {
  visit2(block);
  for (const child of childBlocksOf(block)) {
    visitDeep(child, visit2);
  }
}
function eachBlock(doc, visit2) {
  for (const section of doc.sections ?? []) {
    for (const row of section.rows ?? []) {
      for (const column of row.columns ?? []) {
        for (const block of column.blocks ?? []) visitDeep(block, visit2);
      }
    }
  }
  for (const block of doc.referencePanel?.blocks ?? []) visitDeep(block, visit2);
}
function censusOfDocument(doc) {
  const counts = /* @__PURE__ */ new Map();
  const keyByBlockId = /* @__PURE__ */ new Map();
  eachBlock(doc, (block) => {
    const key = safeCensusKey(block);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    const id = block.id;
    if (typeof id === "string") keyByBlockId.set(id, key);
  });
  const items = [];
  const seen = /* @__PURE__ */ new Set();
  const push = (itemId, blockId) => {
    if (!itemId || seen.has(itemId)) return;
    seen.add(itemId);
    items.push({
      itemId,
      censusKey: keyByBlockId.get(blockId) ?? UNKNOWN_CENSUS_KEY
    });
  };
  for (const section of doc.sections ?? []) {
    const inv = inventorySection(section, {
      integrity: "coerce"
    });
    for (const group of inv.blankGroupsByBlock) {
      for (const key of group.keys) push(key.id, group.blockId);
    }
    for (const mc of inv.multipleChoice) push(mc.blockId, mc.blockId);
    for (const m of inv.matching) push(m.blockId, m.blockId);
    for (const o of inv.ordering) push(o.blockId, o.blockId);
    for (const g of inv.graphs) push(g.blockId, g.blockId);
    for (const id of inv.freeText) push(id, id);
  }
  return {
    counts: [...counts].map(([censusKey, blockCount]) => ({
      censusKey,
      blockCount
    })),
    items
  };
}

// packages/viewer/src/sanitize/serveSeed.ts
function serveSeed(versionId, studentId) {
  return `${versionId}:${studentId}`;
}

// packages/viewer/src/server/jwt.ts
function jwtSub(authHeader) {
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return typeof json.sub === "string" ? json.sub : null;
  } catch {
    return null;
  }
}

// packages/viewer/src/server/uuid.ts
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// packages/viewer/src/server/get-activity-handler.ts
var API_VERSION = 1;
var JOIN_CODE_RE = /^[A-Za-z0-9]{4,12}$/;
var META_WINDOW_MS = 6e4;
var META_MAX_PER_WINDOW = 600;
function createMetaRateLimiter(now = Date.now) {
  const metaHits = /* @__PURE__ */ new Map();
  return function metaRateLimited(ip) {
    const t = now();
    const hits = (metaHits.get(ip) ?? []).filter(
      (hit) => t - hit < META_WINDOW_MS
    );
    if (hits.length >= META_MAX_PER_WINDOW) {
      metaHits.set(ip, hits);
      return true;
    }
    hits.push(t);
    metaHits.set(ip, hits);
    if (metaHits.size > 1e4) metaHits.clear();
    return false;
  };
}
function createGetActivityHandler(deps) {
  const { db, cors } = deps;
  const metaRateLimited = createMetaRateLimiter(deps.now ?? Date.now);
  return async function handleGetActivity(req) {
    const preflight = cors.handlePreflight(req);
    if (preflight) return preflight;
    if (req.method !== "GET") {
      return cors.errorResponse(req, 405, "Method not allowed");
    }
    const url = new URL(req.url);
    const activityId = url.searchParams.get("activity_id") ?? "";
    const versionId = url.searchParams.get("version_id");
    const metaOnly = url.searchParams.get("meta") === "1";
    const joinCode = url.searchParams.get("join_code");
    if (joinCode !== null) {
      if (!metaOnly) {
        return cors.errorResponse(req, 400, "join_code requires meta=1");
      }
      const code = joinCode.trim();
      if (!JOIN_CODE_RE.test(code)) {
        return cors.errorResponse(req, 400, "join_code must be a class code");
      }
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      if (metaRateLimited(ip)) {
        return cors.errorResponse(req, 429, "Too many requests");
      }
      const { data, error } = await db.classMeta(code);
      if (error) {
        console.error("[get-activity] class meta RPC error:", error);
        return cors.errorResponse(req, 500, "Lookup failed");
      }
      if (!data) return cors.errorResponse(req, 404, "Not available");
      return cors.jsonResponse(
        req,
        // The wire-leak contract: the class NAME and nothing else.
        { api_version: API_VERSION, class_name: data.name },
        { headers: { "Cache-Control": "no-cache" } }
      );
    }
    if (!UUID_RE.test(activityId)) {
      return cors.errorResponse(req, 400, "activity_id must be a UUID");
    }
    if (metaOnly) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      if (metaRateLimited(ip)) {
        return cors.errorResponse(req, 429, "Too many requests");
      }
      const { data, error } = await db.publicMeta(activityId);
      if (error) {
        console.error("[get-activity] meta RPC error:", error);
        return cors.errorResponse(req, 500, "Lookup failed");
      }
      if (!data) return cors.errorResponse(req, 404, "Not available");
      return cors.jsonResponse(
        req,
        {
          api_version: API_VERSION,
          title: data.title,
          teacher_name: data.teacher_name
        },
        { headers: { "Cache-Control": "no-cache" } }
      );
    }
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return cors.errorResponse(req, 401, "Missing Authorization header");
    }
    const { data: current, error: rpcError } = await db.publishedActivity(
      authHeader,
      activityId
    );
    if (rpcError) {
      const msg = rpcError.message ?? "";
      const status = msg.includes("Not available") ? 404 : /JWT|token|auth/i.test(msg) ? 401 : 500;
      if (status === 500) console.error("[get-activity] RPC error:", rpcError);
      return cors.errorResponse(
        req,
        status,
        status === 404 ? "Not available" : msg
      );
    }
    if (!current) return cors.errorResponse(req, 404, "Not available");
    const row = current;
    if (!versionId) {
      return cors.jsonResponse(
        req,
        {
          api_version: API_VERSION,
          activity_id: activityId,
          version_id: row.version_id,
          version_num: row.version_num,
          title: row.title
        },
        { headers: { "Cache-Control": "no-cache" } }
      );
    }
    if (!UUID_RE.test(versionId)) {
      return cors.errorResponse(req, 400, "version_id must be a UUID");
    }
    if (versionId !== row.version_id) {
      return cors.errorResponse(req, 404, "Not the current version", {
        code: "stale_version",
        current_version_id: row.version_id
      });
    }
    let sanitized = null;
    const { data: cached, error: cacheErr } = await db.readCache(
      versionId,
      SANITIZER_REV
    );
    if (cacheErr) {
      console.error("[get-activity] cache read failed:", cacheErr);
    }
    if (cached) {
      sanitized = cached.content;
    }
    if (!sanitized) {
      const { data: version, error: vErr } = await db.readVersion(versionId);
      if (vErr || !version) {
        console.error("[get-activity] version read failed:", vErr);
        return cors.errorResponse(req, 500, "Version read failed");
      }
      let upgraded;
      try {
        upgraded = upgradeActivityDocument(version.content);
      } catch (err) {
        console.error("[get-activity] upgrade failed:", err);
        const detail = err instanceof UpgradeError ? err.message : "Upgrade failed";
        return cors.errorResponse(req, 500, "Activity content cannot be served", {
          code: "upgrade_failed",
          detail
        });
      }
      sanitized = sanitizeActivityDocument(upgraded.doc);
      let censusOk = true;
      try {
        const { error: censusErr } = await db.writeCensus(
          versionId,
          censusOfDocument(upgraded.doc)
        );
        if (censusErr) {
          censusOk = false;
          console.error("[get-activity] census write failed:", censusErr);
        }
      } catch (err) {
        censusOk = false;
        console.error("[get-activity] census threw:", err);
      }
      if (censusOk) {
        const { error: upsertErr } = await db.upsertCache({
          version_id: versionId,
          sanitizer_rev: SANITIZER_REV,
          schema_version: upgraded.doc.schemaVersion,
          content: sanitized
        });
        if (upsertErr) {
          console.error("[get-activity] cache upsert failed:", upsertErr);
        } else {
          const { error: gcErr } = await db.deleteStaleCache(
            versionId,
            SANITIZER_REV
          );
          if (gcErr) {
            console.error("[get-activity] stale-cache GC failed:", gcErr);
          }
        }
      }
    }
    const userId = jwtSub(authHeader) ?? "anonymous";
    const served = applyServeShuffles(sanitized, serveSeed(versionId, userId));
    return new Response(
      JSON.stringify({
        api_version: API_VERSION,
        activity_id: activityId,
        version: {
          id: versionId,
          num: row.version_num,
          schema_version: served.schemaVersion
        },
        title: row.title,
        activity: served
      }),
      {
        status: 200,
        headers: {
          ...cors.corsHeaders(req),
          "Content-Type": "application/json",
          // Version-keyed URL → immutable. private: student content never lands
          // in shared caches. A republish changes the URL via resolve, so this
          // never needs to expire.
          "Cache-Control": "private, max-age=31536000, immutable"
        }
      }
    );
  };
}
export {
  ACTIVITY_SCHEMA_VERSION,
  SANITIZER_REV,
  UNKNOWN_CENSUS_KEY,
  UpgradeError,
  applyServeShuffles,
  censusOfDocument,
  createGetActivityHandler,
  sanitizeActivityDocument,
  sanitizeBlock,
  seededShuffle,
  upgradeActivityDocument
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvZXh0ZXJuYWwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvaGVscGVycy91dGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL1pvZEVycm9yLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2xvY2FsZXMvZW4uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvZXJyb3JzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2hlbHBlcnMvcGFyc2VVdGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2hlbHBlcnMvZXJyb3JVdGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL3R5cGVzLmpzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvc2l6aW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2ltYWdlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvZ3JhcGgtcHJpbWl0aXZlcy50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9ncmFwaC1maWd1cmUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9pbmxpbmUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvcGFyYWdyYXBoLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2hlYWRpbmcudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9sYWJlbC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9tYXRoLWJsb2NrLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2NhbGxvdXQudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvcHJvYmxlbS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9maWxsLWluLWJsYW5rLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2xpc3QudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvaW50ZXJhY3RpdmUtZ3JhcGgudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvbXVsdGlwbGUtY2hvaWNlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL21hdGNoaW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL29yZGVyaW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL251bWJlci1saW5lLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2RhdGEtcGxvdC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9sZWFybmluZy1vYmplY3RpdmVzLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL3dvcmtlZC1leGFtcGxlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2ZhZGVkLXdvcmtlZC1leGFtcGxlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL3NlbGYtZXhwbGFuYXRpb24udHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvZnJlZS1yZXNwb25zZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy90YWJsZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9pbmRleC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2xheW91dC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2RvY3VtZW50LnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvdXBncmFkZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3JlZ2lzdHJ5L3JlZ2lzdHJ5LnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2FuaXRpemUvcHJvbXB0Q2FycmllcnMudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9zYW5pdGl6ZS9zYW5pdGl6ZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3Nhbml0aXplL3NodWZmbGUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9jb250YWluZXIvYmxvY2tJbmRleC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3NlcnZlci9ncmFkaW5nL3dhbGsudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9jZW5zdXMvY2Vuc3VzLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2FuaXRpemUvc2VydmVTZWVkLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2VydmVyL2p3dC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3NlcnZlci91dWlkLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2VydmVyL2dldC1hY3Rpdml0eS1oYW5kbGVyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgKiBmcm9tIFwiLi9lcnJvcnMuanNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2hlbHBlcnMvcGFyc2VVdGlsLmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9oZWxwZXJzL3R5cGVBbGlhc2VzLmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9oZWxwZXJzL3V0aWwuanNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3R5cGVzLmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9ab2RFcnJvci5qc1wiO1xuIiwgImV4cG9ydCB2YXIgdXRpbDtcbihmdW5jdGlvbiAodXRpbCkge1xuICAgIHV0aWwuYXNzZXJ0RXF1YWwgPSAoXykgPT4geyB9O1xuICAgIGZ1bmN0aW9uIGFzc2VydElzKF9hcmcpIHsgfVxuICAgIHV0aWwuYXNzZXJ0SXMgPSBhc3NlcnRJcztcbiAgICBmdW5jdGlvbiBhc3NlcnROZXZlcihfeCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB9XG4gICAgdXRpbC5hc3NlcnROZXZlciA9IGFzc2VydE5ldmVyO1xuICAgIHV0aWwuYXJyYXlUb0VudW0gPSAoaXRlbXMpID0+IHtcbiAgICAgICAgY29uc3Qgb2JqID0ge307XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xuICAgICAgICAgICAgb2JqW2l0ZW1dID0gaXRlbTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH07XG4gICAgdXRpbC5nZXRWYWxpZEVudW1WYWx1ZXMgPSAob2JqKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbGlkS2V5cyA9IHV0aWwub2JqZWN0S2V5cyhvYmopLmZpbHRlcigoaykgPT4gdHlwZW9mIG9ialtvYmpba11dICE9PSBcIm51bWJlclwiKTtcbiAgICAgICAgY29uc3QgZmlsdGVyZWQgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIHZhbGlkS2V5cykge1xuICAgICAgICAgICAgZmlsdGVyZWRba10gPSBvYmpba107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHV0aWwub2JqZWN0VmFsdWVzKGZpbHRlcmVkKTtcbiAgICB9O1xuICAgIHV0aWwub2JqZWN0VmFsdWVzID0gKG9iaikgPT4ge1xuICAgICAgICByZXR1cm4gdXRpbC5vYmplY3RLZXlzKG9iaikubWFwKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqW2VdO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHV0aWwub2JqZWN0S2V5cyA9IHR5cGVvZiBPYmplY3Qua2V5cyA9PT0gXCJmdW5jdGlvblwiIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFuL2JhblxuICAgICAgICA/IChvYmopID0+IE9iamVjdC5rZXlzKG9iaikgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYW4vYmFuXG4gICAgICAgIDogKG9iamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qga2V5cyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgICAgIH07XG4gICAgdXRpbC5maW5kID0gKGFyciwgY2hlY2tlcikgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgYXJyKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2tlcihpdGVtKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG4gICAgdXRpbC5pc0ludGVnZXIgPSB0eXBlb2YgTnVtYmVyLmlzSW50ZWdlciA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgID8gKHZhbCkgPT4gTnVtYmVyLmlzSW50ZWdlcih2YWwpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFuL2JhblxuICAgICAgICA6ICh2YWwpID0+IHR5cGVvZiB2YWwgPT09IFwibnVtYmVyXCIgJiYgTnVtYmVyLmlzRmluaXRlKHZhbCkgJiYgTWF0aC5mbG9vcih2YWwpID09PSB2YWw7XG4gICAgZnVuY3Rpb24gam9pblZhbHVlcyhhcnJheSwgc2VwYXJhdG9yID0gXCIgfCBcIikge1xuICAgICAgICByZXR1cm4gYXJyYXkubWFwKCh2YWwpID0+ICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiID8gYCcke3ZhbH0nYCA6IHZhbCkpLmpvaW4oc2VwYXJhdG9yKTtcbiAgICB9XG4gICAgdXRpbC5qb2luVmFsdWVzID0gam9pblZhbHVlcztcbiAgICB1dGlsLmpzb25TdHJpbmdpZnlSZXBsYWNlciA9IChfLCB2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJpZ2ludFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbn0pKHV0aWwgfHwgKHV0aWwgPSB7fSkpO1xuZXhwb3J0IHZhciBvYmplY3RVdGlsO1xuKGZ1bmN0aW9uIChvYmplY3RVdGlsKSB7XG4gICAgb2JqZWN0VXRpbC5tZXJnZVNoYXBlcyA9IChmaXJzdCwgc2Vjb25kKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5maXJzdCxcbiAgICAgICAgICAgIC4uLnNlY29uZCwgLy8gc2Vjb25kIG92ZXJ3cml0ZXMgZmlyc3RcbiAgICAgICAgfTtcbiAgICB9O1xufSkob2JqZWN0VXRpbCB8fCAob2JqZWN0VXRpbCA9IHt9KSk7XG5leHBvcnQgY29uc3QgWm9kUGFyc2VkVHlwZSA9IHV0aWwuYXJyYXlUb0VudW0oW1xuICAgIFwic3RyaW5nXCIsXG4gICAgXCJuYW5cIixcbiAgICBcIm51bWJlclwiLFxuICAgIFwiaW50ZWdlclwiLFxuICAgIFwiZmxvYXRcIixcbiAgICBcImJvb2xlYW5cIixcbiAgICBcImRhdGVcIixcbiAgICBcImJpZ2ludFwiLFxuICAgIFwic3ltYm9sXCIsXG4gICAgXCJmdW5jdGlvblwiLFxuICAgIFwidW5kZWZpbmVkXCIsXG4gICAgXCJudWxsXCIsXG4gICAgXCJhcnJheVwiLFxuICAgIFwib2JqZWN0XCIsXG4gICAgXCJ1bmtub3duXCIsXG4gICAgXCJwcm9taXNlXCIsXG4gICAgXCJ2b2lkXCIsXG4gICAgXCJuZXZlclwiLFxuICAgIFwibWFwXCIsXG4gICAgXCJzZXRcIixcbl0pO1xuZXhwb3J0IGNvbnN0IGdldFBhcnNlZFR5cGUgPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IHQgPSB0eXBlb2YgZGF0YTtcbiAgICBzd2l0Y2ggKHQpIHtcbiAgICAgICAgY2FzZSBcInVuZGVmaW5lZFwiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkO1xuICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5zdHJpbmc7XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIuaXNOYU4oZGF0YSkgPyBab2RQYXJzZWRUeXBlLm5hbiA6IFpvZFBhcnNlZFR5cGUubnVtYmVyO1xuICAgICAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuYm9vbGVhbjtcbiAgICAgICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5mdW5jdGlvbjtcbiAgICAgICAgY2FzZSBcImJpZ2ludFwiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuYmlnaW50O1xuICAgICAgICBjYXNlIFwic3ltYm9sXCI6XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5zeW1ib2w7XG4gICAgICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuYXJyYXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLm51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YS50aGVuICYmIHR5cGVvZiBkYXRhLnRoZW4gPT09IFwiZnVuY3Rpb25cIiAmJiBkYXRhLmNhdGNoICYmIHR5cGVvZiBkYXRhLmNhdGNoID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5wcm9taXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBNYXAgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLm1hcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgU2V0ICE9PSBcInVuZGVmaW5lZFwiICYmIGRhdGEgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5zZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIERhdGUgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5kYXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUub2JqZWN0O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUudW5rbm93bjtcbiAgICB9XG59O1xuIiwgImltcG9ydCB7IHV0aWwgfSBmcm9tIFwiLi9oZWxwZXJzL3V0aWwuanNcIjtcbmV4cG9ydCBjb25zdCBab2RJc3N1ZUNvZGUgPSB1dGlsLmFycmF5VG9FbnVtKFtcbiAgICBcImludmFsaWRfdHlwZVwiLFxuICAgIFwiaW52YWxpZF9saXRlcmFsXCIsXG4gICAgXCJjdXN0b21cIixcbiAgICBcImludmFsaWRfdW5pb25cIixcbiAgICBcImludmFsaWRfdW5pb25fZGlzY3JpbWluYXRvclwiLFxuICAgIFwiaW52YWxpZF9lbnVtX3ZhbHVlXCIsXG4gICAgXCJ1bnJlY29nbml6ZWRfa2V5c1wiLFxuICAgIFwiaW52YWxpZF9hcmd1bWVudHNcIixcbiAgICBcImludmFsaWRfcmV0dXJuX3R5cGVcIixcbiAgICBcImludmFsaWRfZGF0ZVwiLFxuICAgIFwiaW52YWxpZF9zdHJpbmdcIixcbiAgICBcInRvb19zbWFsbFwiLFxuICAgIFwidG9vX2JpZ1wiLFxuICAgIFwiaW52YWxpZF9pbnRlcnNlY3Rpb25fdHlwZXNcIixcbiAgICBcIm5vdF9tdWx0aXBsZV9vZlwiLFxuICAgIFwibm90X2Zpbml0ZVwiLFxuXSk7XG5leHBvcnQgY29uc3QgcXVvdGVsZXNzSnNvbiA9IChvYmopID0+IHtcbiAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkob2JqLCBudWxsLCAyKTtcbiAgICByZXR1cm4ganNvbi5yZXBsYWNlKC9cIihbXlwiXSspXCI6L2csIFwiJDE6XCIpO1xufTtcbmV4cG9ydCBjbGFzcyBab2RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBnZXQgZXJyb3JzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc3N1ZXM7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGlzc3Vlcykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmlzc3VlcyA9IFtdO1xuICAgICAgICB0aGlzLmFkZElzc3VlID0gKHN1YikgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc3N1ZXMgPSBbLi4udGhpcy5pc3N1ZXMsIHN1Yl07XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkSXNzdWVzID0gKHN1YnMgPSBbXSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc3N1ZXMgPSBbLi4udGhpcy5pc3N1ZXMsIC4uLnN1YnNdO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBhY3R1YWxQcm90byA9IG5ldy50YXJnZXQucHJvdG90eXBlO1xuICAgICAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgYmFuL2JhblxuICAgICAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIGFjdHVhbFByb3RvKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX19wcm90b19fID0gYWN0dWFsUHJvdG87XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5uYW1lID0gXCJab2RFcnJvclwiO1xuICAgICAgICB0aGlzLmlzc3VlcyA9IGlzc3VlcztcbiAgICB9XG4gICAgZm9ybWF0KF9tYXBwZXIpIHtcbiAgICAgICAgY29uc3QgbWFwcGVyID0gX21hcHBlciB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGlzc3VlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzc3VlLm1lc3NhZ2U7XG4gICAgICAgICAgICB9O1xuICAgICAgICBjb25zdCBmaWVsZEVycm9ycyA9IHsgX2Vycm9yczogW10gfTtcbiAgICAgICAgY29uc3QgcHJvY2Vzc0Vycm9yID0gKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGlzc3VlIG9mIGVycm9yLmlzc3Vlcykge1xuICAgICAgICAgICAgICAgIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfdW5pb25cIikge1xuICAgICAgICAgICAgICAgICAgICBpc3N1ZS51bmlvbkVycm9ycy5tYXAocHJvY2Vzc0Vycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUuY29kZSA9PT0gXCJpbnZhbGlkX3JldHVybl90eXBlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0Vycm9yKGlzc3VlLnJldHVyblR5cGVFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLmNvZGUgPT09IFwiaW52YWxpZF9hcmd1bWVudHNcIikge1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzRXJyb3IoaXNzdWUuYXJndW1lbnRzRXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS5wYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBmaWVsZEVycm9ycy5fZXJyb3JzLnB1c2gobWFwcGVyKGlzc3VlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VyciA9IGZpZWxkRXJyb3JzO1xuICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgaXNzdWUucGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gaXNzdWUucGF0aFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRlcm1pbmFsID0gaSA9PT0gaXNzdWUucGF0aC5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0ZXJtaW5hbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJbZWxdID0gY3VycltlbF0gfHwgeyBfZXJyb3JzOiBbXSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmICh0eXBlb2YgZWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGN1cnJbZWxdID0gY3VycltlbF0gfHwgeyBfZXJyb3JzOiBbXSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIH0gZWxzZSBpZiAodHlwZW9mIGVsID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBjb25zdCBlcnJvckFycmF5OiBhbnkgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGVycm9yQXJyYXkuX2Vycm9ycyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgY3VycltlbF0gPSBjdXJyW2VsXSB8fCBlcnJvckFycmF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJbZWxdID0gY3VycltlbF0gfHwgeyBfZXJyb3JzOiBbXSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJbZWxdLl9lcnJvcnMucHVzaChtYXBwZXIoaXNzdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnIgPSBjdXJyW2VsXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcHJvY2Vzc0Vycm9yKHRoaXMpO1xuICAgICAgICByZXR1cm4gZmllbGRFcnJvcnM7XG4gICAgfVxuICAgIHN0YXRpYyBhc3NlcnQodmFsdWUpIHtcbiAgICAgICAgaWYgKCEodmFsdWUgaW5zdGFuY2VvZiBab2RFcnJvcikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IGEgWm9kRXJyb3I6ICR7dmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lc3NhZ2U7XG4gICAgfVxuICAgIGdldCBtZXNzYWdlKCkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5pc3N1ZXMsIHV0aWwuanNvblN0cmluZ2lmeVJlcGxhY2VyLCAyKTtcbiAgICB9XG4gICAgZ2V0IGlzRW1wdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzc3Vlcy5sZW5ndGggPT09IDA7XG4gICAgfVxuICAgIGZsYXR0ZW4obWFwcGVyID0gKGlzc3VlKSA9PiBpc3N1ZS5tZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IGZpZWxkRXJyb3JzID0ge307XG4gICAgICAgIGNvbnN0IGZvcm1FcnJvcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBzdWIgb2YgdGhpcy5pc3N1ZXMpIHtcbiAgICAgICAgICAgIGlmIChzdWIucGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlyc3RFbCA9IHN1Yi5wYXRoWzBdO1xuICAgICAgICAgICAgICAgIGZpZWxkRXJyb3JzW2ZpcnN0RWxdID0gZmllbGRFcnJvcnNbZmlyc3RFbF0gfHwgW107XG4gICAgICAgICAgICAgICAgZmllbGRFcnJvcnNbZmlyc3RFbF0ucHVzaChtYXBwZXIoc3ViKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3JtRXJyb3JzLnB1c2gobWFwcGVyKHN1YikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IGZvcm1FcnJvcnMsIGZpZWxkRXJyb3JzIH07XG4gICAgfVxuICAgIGdldCBmb3JtRXJyb3JzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mbGF0dGVuKCk7XG4gICAgfVxufVxuWm9kRXJyb3IuY3JlYXRlID0gKGlzc3VlcykgPT4ge1xuICAgIGNvbnN0IGVycm9yID0gbmV3IFpvZEVycm9yKGlzc3Vlcyk7XG4gICAgcmV0dXJuIGVycm9yO1xufTtcbiIsICJpbXBvcnQgeyBab2RJc3N1ZUNvZGUgfSBmcm9tIFwiLi4vWm9kRXJyb3IuanNcIjtcbmltcG9ydCB7IHV0aWwsIFpvZFBhcnNlZFR5cGUgfSBmcm9tIFwiLi4vaGVscGVycy91dGlsLmpzXCI7XG5jb25zdCBlcnJvck1hcCA9IChpc3N1ZSwgX2N0eCkgPT4ge1xuICAgIGxldCBtZXNzYWdlO1xuICAgIHN3aXRjaCAoaXNzdWUuY29kZSkge1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGU6XG4gICAgICAgICAgICBpZiAoaXNzdWUucmVjZWl2ZWQgPT09IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiUmVxdWlyZWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgRXhwZWN0ZWQgJHtpc3N1ZS5leHBlY3RlZH0sIHJlY2VpdmVkICR7aXNzdWUucmVjZWl2ZWR9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX2xpdGVyYWw6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgbGl0ZXJhbCB2YWx1ZSwgZXhwZWN0ZWQgJHtKU09OLnN0cmluZ2lmeShpc3N1ZS5leHBlY3RlZCwgdXRpbC5qc29uU3RyaW5naWZ5UmVwbGFjZXIpfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUudW5yZWNvZ25pemVkX2tleXM6XG4gICAgICAgICAgICBtZXNzYWdlID0gYFVucmVjb2duaXplZCBrZXkocykgaW4gb2JqZWN0OiAke3V0aWwuam9pblZhbHVlcyhpc3N1ZS5rZXlzLCBcIiwgXCIpfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dGA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbl9kaXNjcmltaW5hdG9yOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGRpc2NyaW1pbmF0b3IgdmFsdWUuIEV4cGVjdGVkICR7dXRpbC5qb2luVmFsdWVzKGlzc3VlLm9wdGlvbnMpfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9lbnVtX3ZhbHVlOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGVudW0gdmFsdWUuIEV4cGVjdGVkICR7dXRpbC5qb2luVmFsdWVzKGlzc3VlLm9wdGlvbnMpfSwgcmVjZWl2ZWQgJyR7aXNzdWUucmVjZWl2ZWR9J2A7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9hcmd1bWVudHM6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgZnVuY3Rpb24gYXJndW1lbnRzYDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX3JldHVybl90eXBlOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGZ1bmN0aW9uIHJldHVybiB0eXBlYDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX2RhdGU6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgZGF0ZWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmc6XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlzc3VlLnZhbGlkYXRpb24gPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoXCJpbmNsdWRlc1wiIGluIGlzc3VlLnZhbGlkYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGlucHV0OiBtdXN0IGluY2x1ZGUgXCIke2lzc3VlLnZhbGlkYXRpb24uaW5jbHVkZXN9XCJgO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlzc3VlLnZhbGlkYXRpb24ucG9zaXRpb24gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgJHttZXNzYWdlfSBhdCBvbmUgb3IgbW9yZSBwb3NpdGlvbnMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvICR7aXNzdWUudmFsaWRhdGlvbi5wb3NpdGlvbn1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFwic3RhcnRzV2l0aFwiIGluIGlzc3VlLnZhbGlkYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGlucHV0OiBtdXN0IHN0YXJ0IHdpdGggXCIke2lzc3VlLnZhbGlkYXRpb24uc3RhcnRzV2l0aH1cImA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFwiZW5kc1dpdGhcIiBpbiBpc3N1ZS52YWxpZGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dDogbXVzdCBlbmQgd2l0aCBcIiR7aXNzdWUudmFsaWRhdGlvbi5lbmRzV2l0aH1cImA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGlzc3VlLnZhbGlkYXRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnZhbGlkYXRpb24gIT09IFwicmVnZXhcIikge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCAke2lzc3VlLnZhbGlkYXRpb259YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkludmFsaWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS50b29fc21hbGw6XG4gICAgICAgICAgICBpZiAoaXNzdWUudHlwZSA9PT0gXCJhcnJheVwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgQXJyYXkgbXVzdCBjb250YWluICR7aXNzdWUuZXhhY3QgPyBcImV4YWN0bHlcIiA6IGlzc3VlLmluY2x1c2l2ZSA/IGBhdCBsZWFzdGAgOiBgbW9yZSB0aGFuYH0gJHtpc3N1ZS5taW5pbXVtfSBlbGVtZW50KHMpYDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwic3RyaW5nXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBTdHJpbmcgbXVzdCBjb250YWluICR7aXNzdWUuZXhhY3QgPyBcImV4YWN0bHlcIiA6IGlzc3VlLmluY2x1c2l2ZSA/IGBhdCBsZWFzdGAgOiBgb3ZlcmB9ICR7aXNzdWUubWluaW11bX0gY2hhcmFjdGVyKHMpYDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwibnVtYmVyXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBOdW1iZXIgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHkgZXF1YWwgdG8gYCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gYCA6IGBncmVhdGVyIHRoYW4gYH0ke2lzc3VlLm1pbmltdW19YDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwiYmlnaW50XCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBOdW1iZXIgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHkgZXF1YWwgdG8gYCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gYCA6IGBncmVhdGVyIHRoYW4gYH0ke2lzc3VlLm1pbmltdW19YDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwiZGF0ZVwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgRGF0ZSBtdXN0IGJlICR7aXNzdWUuZXhhY3QgPyBgZXhhY3RseSBlcXVhbCB0byBgIDogaXNzdWUuaW5jbHVzaXZlID8gYGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBgIDogYGdyZWF0ZXIgdGhhbiBgfSR7bmV3IERhdGUoTnVtYmVyKGlzc3VlLm1pbmltdW0pKX1gO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkludmFsaWQgaW5wdXRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS50b29fYmlnOlxuICAgICAgICAgICAgaWYgKGlzc3VlLnR5cGUgPT09IFwiYXJyYXlcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEFycmF5IG11c3QgY29udGFpbiAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYGF0IG1vc3RgIDogYGxlc3MgdGhhbmB9ICR7aXNzdWUubWF4aW11bX0gZWxlbWVudChzKWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcInN0cmluZ1wiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgU3RyaW5nIG11c3QgY29udGFpbiAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYGF0IG1vc3RgIDogYHVuZGVyYH0gJHtpc3N1ZS5tYXhpbXVtfSBjaGFyYWN0ZXIocylgO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJudW1iZXJcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYE51bWJlciBtdXN0IGJlICR7aXNzdWUuZXhhY3QgPyBgZXhhY3RseWAgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgbGVzcyB0aGFuIG9yIGVxdWFsIHRvYCA6IGBsZXNzIHRoYW5gfSAke2lzc3VlLm1heGltdW19YDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwiYmlnaW50XCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBCaWdJbnQgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYGxlc3MgdGhhbiBvciBlcXVhbCB0b2AgOiBgbGVzcyB0aGFuYH0gJHtpc3N1ZS5tYXhpbXVtfWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcImRhdGVcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYERhdGUgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYHNtYWxsZXIgdGhhbiBvciBlcXVhbCB0b2AgOiBgc21hbGxlciB0aGFuYH0gJHtuZXcgRGF0ZShOdW1iZXIoaXNzdWUubWF4aW11bSkpfWA7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiSW52YWxpZCBpbnB1dFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmN1c3RvbTpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dGA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9pbnRlcnNlY3Rpb25fdHlwZXM6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludGVyc2VjdGlvbiByZXN1bHRzIGNvdWxkIG5vdCBiZSBtZXJnZWRgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLm5vdF9tdWx0aXBsZV9vZjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgTnVtYmVyIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAke2lzc3VlLm11bHRpcGxlT2Z9YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5ub3RfZmluaXRlOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiTnVtYmVyIG11c3QgYmUgZmluaXRlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBfY3R4LmRlZmF1bHRFcnJvcjtcbiAgICAgICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoaXNzdWUpO1xuICAgIH1cbiAgICByZXR1cm4geyBtZXNzYWdlIH07XG59O1xuZXhwb3J0IGRlZmF1bHQgZXJyb3JNYXA7XG4iLCAiaW1wb3J0IGRlZmF1bHRFcnJvck1hcCBmcm9tIFwiLi9sb2NhbGVzL2VuLmpzXCI7XG5sZXQgb3ZlcnJpZGVFcnJvck1hcCA9IGRlZmF1bHRFcnJvck1hcDtcbmV4cG9ydCB7IGRlZmF1bHRFcnJvck1hcCB9O1xuZXhwb3J0IGZ1bmN0aW9uIHNldEVycm9yTWFwKG1hcCkge1xuICAgIG92ZXJyaWRlRXJyb3JNYXAgPSBtYXA7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0RXJyb3JNYXAoKSB7XG4gICAgcmV0dXJuIG92ZXJyaWRlRXJyb3JNYXA7XG59XG4iLCAiaW1wb3J0IHsgZ2V0RXJyb3JNYXAgfSBmcm9tIFwiLi4vZXJyb3JzLmpzXCI7XG5pbXBvcnQgZGVmYXVsdEVycm9yTWFwIGZyb20gXCIuLi9sb2NhbGVzL2VuLmpzXCI7XG5leHBvcnQgY29uc3QgbWFrZUlzc3VlID0gKHBhcmFtcykgPT4ge1xuICAgIGNvbnN0IHsgZGF0YSwgcGF0aCwgZXJyb3JNYXBzLCBpc3N1ZURhdGEgfSA9IHBhcmFtcztcbiAgICBjb25zdCBmdWxsUGF0aCA9IFsuLi5wYXRoLCAuLi4oaXNzdWVEYXRhLnBhdGggfHwgW10pXTtcbiAgICBjb25zdCBmdWxsSXNzdWUgPSB7XG4gICAgICAgIC4uLmlzc3VlRGF0YSxcbiAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgfTtcbiAgICBpZiAoaXNzdWVEYXRhLm1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uaXNzdWVEYXRhLFxuICAgICAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgICAgICAgICBtZXNzYWdlOiBpc3N1ZURhdGEubWVzc2FnZSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgbGV0IGVycm9yTWVzc2FnZSA9IFwiXCI7XG4gICAgY29uc3QgbWFwcyA9IGVycm9yTWFwc1xuICAgICAgICAuZmlsdGVyKChtKSA9PiAhIW0pXG4gICAgICAgIC5zbGljZSgpXG4gICAgICAgIC5yZXZlcnNlKCk7XG4gICAgZm9yIChjb25zdCBtYXAgb2YgbWFwcykge1xuICAgICAgICBlcnJvck1lc3NhZ2UgPSBtYXAoZnVsbElzc3VlLCB7IGRhdGEsIGRlZmF1bHRFcnJvcjogZXJyb3JNZXNzYWdlIH0pLm1lc3NhZ2U7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIC4uLmlzc3VlRGF0YSxcbiAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgICAgIG1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICB9O1xufTtcbmV4cG9ydCBjb25zdCBFTVBUWV9QQVRIID0gW107XG5leHBvcnQgZnVuY3Rpb24gYWRkSXNzdWVUb0NvbnRleHQoY3R4LCBpc3N1ZURhdGEpIHtcbiAgICBjb25zdCBvdmVycmlkZU1hcCA9IGdldEVycm9yTWFwKCk7XG4gICAgY29uc3QgaXNzdWUgPSBtYWtlSXNzdWUoe1xuICAgICAgICBpc3N1ZURhdGE6IGlzc3VlRGF0YSxcbiAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICBlcnJvck1hcHM6IFtcbiAgICAgICAgICAgIGN0eC5jb21tb24uY29udGV4dHVhbEVycm9yTWFwLCAvLyBjb250ZXh0dWFsIGVycm9yIG1hcCBpcyBmaXJzdCBwcmlvcml0eVxuICAgICAgICAgICAgY3R4LnNjaGVtYUVycm9yTWFwLCAvLyB0aGVuIHNjaGVtYS1ib3VuZCBtYXAgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgICBvdmVycmlkZU1hcCwgLy8gdGhlbiBnbG9iYWwgb3ZlcnJpZGUgbWFwXG4gICAgICAgICAgICBvdmVycmlkZU1hcCA9PT0gZGVmYXVsdEVycm9yTWFwID8gdW5kZWZpbmVkIDogZGVmYXVsdEVycm9yTWFwLCAvLyB0aGVuIGdsb2JhbCBkZWZhdWx0IG1hcFxuICAgICAgICBdLmZpbHRlcigoeCkgPT4gISF4KSxcbiAgICB9KTtcbiAgICBjdHguY29tbW9uLmlzc3Vlcy5wdXNoKGlzc3VlKTtcbn1cbmV4cG9ydCBjbGFzcyBQYXJzZVN0YXR1cyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSBcInZhbGlkXCI7XG4gICAgfVxuICAgIGRpcnR5KCkge1xuICAgICAgICBpZiAodGhpcy52YWx1ZSA9PT0gXCJ2YWxpZFwiKVxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFwiZGlydHlcIjtcbiAgICB9XG4gICAgYWJvcnQoKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlICE9PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBcImFib3J0ZWRcIjtcbiAgICB9XG4gICAgc3RhdGljIG1lcmdlQXJyYXkoc3RhdHVzLCByZXN1bHRzKSB7XG4gICAgICAgIGNvbnN0IGFycmF5VmFsdWUgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBzIG9mIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmIChzLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICBpZiAocy5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIGFycmF5VmFsdWUucHVzaChzLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGFycmF5VmFsdWUgfTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIG1lcmdlT2JqZWN0QXN5bmMoc3RhdHVzLCBwYWlycykge1xuICAgICAgICBjb25zdCBzeW5jUGFpcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHBhaXJzKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBwYWlyLmtleTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgcGFpci52YWx1ZTtcbiAgICAgICAgICAgIHN5bmNQYWlycy5wdXNoKHtcbiAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VPYmplY3RTeW5jKHN0YXR1cywgc3luY1BhaXJzKTtcbiAgICB9XG4gICAgc3RhdGljIG1lcmdlT2JqZWN0U3luYyhzdGF0dXMsIHBhaXJzKSB7XG4gICAgICAgIGNvbnN0IGZpbmFsT2JqZWN0ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgY29uc3QgeyBrZXksIHZhbHVlIH0gPSBwYWlyO1xuICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgaWYgKHZhbHVlLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICBpZiAoa2V5LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgaWYgKHZhbHVlLnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgaWYgKGtleS52YWx1ZSAhPT0gXCJfX3Byb3RvX19cIiAmJiAodHlwZW9mIHZhbHVlLnZhbHVlICE9PSBcInVuZGVmaW5lZFwiIHx8IHBhaXIuYWx3YXlzU2V0KSkge1xuICAgICAgICAgICAgICAgIGZpbmFsT2JqZWN0W2tleS52YWx1ZV0gPSB2YWx1ZS52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGZpbmFsT2JqZWN0IH07XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IElOVkFMSUQgPSBPYmplY3QuZnJlZXplKHtcbiAgICBzdGF0dXM6IFwiYWJvcnRlZFwiLFxufSk7XG5leHBvcnQgY29uc3QgRElSVFkgPSAodmFsdWUpID0+ICh7IHN0YXR1czogXCJkaXJ0eVwiLCB2YWx1ZSB9KTtcbmV4cG9ydCBjb25zdCBPSyA9ICh2YWx1ZSkgPT4gKHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlIH0pO1xuZXhwb3J0IGNvbnN0IGlzQWJvcnRlZCA9ICh4KSA9PiB4LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCI7XG5leHBvcnQgY29uc3QgaXNEaXJ0eSA9ICh4KSA9PiB4LnN0YXR1cyA9PT0gXCJkaXJ0eVwiO1xuZXhwb3J0IGNvbnN0IGlzVmFsaWQgPSAoeCkgPT4geC5zdGF0dXMgPT09IFwidmFsaWRcIjtcbmV4cG9ydCBjb25zdCBpc0FzeW5jID0gKHgpID0+IHR5cGVvZiBQcm9taXNlICE9PSBcInVuZGVmaW5lZFwiICYmIHggaW5zdGFuY2VvZiBQcm9taXNlO1xuIiwgImV4cG9ydCB2YXIgZXJyb3JVdGlsO1xuKGZ1bmN0aW9uIChlcnJvclV0aWwpIHtcbiAgICBlcnJvclV0aWwuZXJyVG9PYmogPSAobWVzc2FnZSkgPT4gdHlwZW9mIG1lc3NhZ2UgPT09IFwic3RyaW5nXCIgPyB7IG1lc3NhZ2UgfSA6IG1lc3NhZ2UgfHwge307XG4gICAgLy8gYmlvbWUtaWdub3JlIGxpbnQ6XG4gICAgZXJyb3JVdGlsLnRvU3RyaW5nID0gKG1lc3NhZ2UpID0+IHR5cGVvZiBtZXNzYWdlID09PSBcInN0cmluZ1wiID8gbWVzc2FnZSA6IG1lc3NhZ2U/Lm1lc3NhZ2U7XG59KShlcnJvclV0aWwgfHwgKGVycm9yVXRpbCA9IHt9KSk7XG4iLCAiaW1wb3J0IHsgWm9kRXJyb3IsIFpvZElzc3VlQ29kZSwgfSBmcm9tIFwiLi9ab2RFcnJvci5qc1wiO1xuaW1wb3J0IHsgZGVmYXVsdEVycm9yTWFwLCBnZXRFcnJvck1hcCB9IGZyb20gXCIuL2Vycm9ycy5qc1wiO1xuaW1wb3J0IHsgZXJyb3JVdGlsIH0gZnJvbSBcIi4vaGVscGVycy9lcnJvclV0aWwuanNcIjtcbmltcG9ydCB7IERJUlRZLCBJTlZBTElELCBPSywgUGFyc2VTdGF0dXMsIGFkZElzc3VlVG9Db250ZXh0LCBpc0Fib3J0ZWQsIGlzQXN5bmMsIGlzRGlydHksIGlzVmFsaWQsIG1ha2VJc3N1ZSwgfSBmcm9tIFwiLi9oZWxwZXJzL3BhcnNlVXRpbC5qc1wiO1xuaW1wb3J0IHsgdXRpbCwgWm9kUGFyc2VkVHlwZSwgZ2V0UGFyc2VkVHlwZSB9IGZyb20gXCIuL2hlbHBlcnMvdXRpbC5qc1wiO1xuY2xhc3MgUGFyc2VJbnB1dExhenlQYXRoIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIHZhbHVlLCBwYXRoLCBrZXkpIHtcbiAgICAgICAgdGhpcy5fY2FjaGVkUGF0aCA9IFtdO1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgdGhpcy5kYXRhID0gdmFsdWU7XG4gICAgICAgIHRoaXMuX3BhdGggPSBwYXRoO1xuICAgICAgICB0aGlzLl9rZXkgPSBrZXk7XG4gICAgfVxuICAgIGdldCBwYXRoKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlZFBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLl9rZXkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVkUGF0aC5wdXNoKC4uLnRoaXMuX3BhdGgsIC4uLnRoaXMuX2tleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZWRQYXRoLnB1c2goLi4udGhpcy5fcGF0aCwgdGhpcy5fa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkUGF0aDtcbiAgICB9XG59XG5jb25zdCBoYW5kbGVSZXN1bHQgPSAoY3R4LCByZXN1bHQpID0+IHtcbiAgICBpZiAoaXNWYWxpZChyZXN1bHQpKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdC52YWx1ZSB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKCFjdHguY29tbW9uLmlzc3Vlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlZhbGlkYXRpb24gZmFpbGVkIGJ1dCBubyBpc3N1ZXMgZGV0ZWN0ZWQuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGdldCBlcnJvcigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9lcnJvcjtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBab2RFcnJvcihjdHguY29tbW9uLmlzc3Vlcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZXJyb3I7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cbn07XG5mdW5jdGlvbiBwcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcykge1xuICAgIGlmICghcGFyYW1zKVxuICAgICAgICByZXR1cm4ge307XG4gICAgY29uc3QgeyBlcnJvck1hcCwgaW52YWxpZF90eXBlX2Vycm9yLCByZXF1aXJlZF9lcnJvciwgZGVzY3JpcHRpb24gfSA9IHBhcmFtcztcbiAgICBpZiAoZXJyb3JNYXAgJiYgKGludmFsaWRfdHlwZV9lcnJvciB8fCByZXF1aXJlZF9lcnJvcikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCB1c2UgXCJpbnZhbGlkX3R5cGVfZXJyb3JcIiBvciBcInJlcXVpcmVkX2Vycm9yXCIgaW4gY29uanVuY3Rpb24gd2l0aCBjdXN0b20gZXJyb3IgbWFwLmApO1xuICAgIH1cbiAgICBpZiAoZXJyb3JNYXApXG4gICAgICAgIHJldHVybiB7IGVycm9yTWFwOiBlcnJvck1hcCwgZGVzY3JpcHRpb24gfTtcbiAgICBjb25zdCBjdXN0b21NYXAgPSAoaXNzLCBjdHgpID0+IHtcbiAgICAgICAgY29uc3QgeyBtZXNzYWdlIH0gPSBwYXJhbXM7XG4gICAgICAgIGlmIChpc3MuY29kZSA9PT0gXCJpbnZhbGlkX2VudW1fdmFsdWVcIikge1xuICAgICAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogbWVzc2FnZSA/PyBjdHguZGVmYXVsdEVycm9yIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBjdHguZGF0YSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogbWVzc2FnZSA/PyByZXF1aXJlZF9lcnJvciA/PyBjdHguZGVmYXVsdEVycm9yIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzcy5jb2RlICE9PSBcImludmFsaWRfdHlwZVwiKVxuICAgICAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogY3R4LmRlZmF1bHRFcnJvciB9O1xuICAgICAgICByZXR1cm4geyBtZXNzYWdlOiBtZXNzYWdlID8/IGludmFsaWRfdHlwZV9lcnJvciA/PyBjdHguZGVmYXVsdEVycm9yIH07XG4gICAgfTtcbiAgICByZXR1cm4geyBlcnJvck1hcDogY3VzdG9tTWFwLCBkZXNjcmlwdGlvbiB9O1xufVxuZXhwb3J0IGNsYXNzIFpvZFR5cGUge1xuICAgIGdldCBkZXNjcmlwdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5kZXNjcmlwdGlvbjtcbiAgICB9XG4gICAgX2dldFR5cGUoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIGdldFBhcnNlZFR5cGUoaW5wdXQuZGF0YSk7XG4gICAgfVxuICAgIF9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KSB7XG4gICAgICAgIHJldHVybiAoY3R4IHx8IHtcbiAgICAgICAgICAgIGNvbW1vbjogaW5wdXQucGFyZW50LmNvbW1vbixcbiAgICAgICAgICAgIGRhdGE6IGlucHV0LmRhdGEsXG4gICAgICAgICAgICBwYXJzZWRUeXBlOiBnZXRQYXJzZWRUeXBlKGlucHV0LmRhdGEpLFxuICAgICAgICAgICAgc2NoZW1hRXJyb3JNYXA6IHRoaXMuX2RlZi5lcnJvck1hcCxcbiAgICAgICAgICAgIHBhdGg6IGlucHV0LnBhdGgsXG4gICAgICAgICAgICBwYXJlbnQ6IGlucHV0LnBhcmVudCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1czogbmV3IFBhcnNlU3RhdHVzKCksXG4gICAgICAgICAgICBjdHg6IHtcbiAgICAgICAgICAgICAgICBjb21tb246IGlucHV0LnBhcmVudC5jb21tb24sXG4gICAgICAgICAgICAgICAgZGF0YTogaW5wdXQuZGF0YSxcbiAgICAgICAgICAgICAgICBwYXJzZWRUeXBlOiBnZXRQYXJzZWRUeXBlKGlucHV0LmRhdGEpLFxuICAgICAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICAgICAgcGF0aDogaW5wdXQucGF0aCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGlucHV0LnBhcmVudCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIF9wYXJzZVN5bmMoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcGFyc2UoaW5wdXQpO1xuICAgICAgICBpZiAoaXNBc3luYyhyZXN1bHQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTeW5jaHJvbm91cyBwYXJzZSBlbmNvdW50ZXJlZCBwcm9taXNlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBfcGFyc2VBc3luYyhpbnB1dCkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wYXJzZShpbnB1dCk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzdWx0KTtcbiAgICB9XG4gICAgcGFyc2UoZGF0YSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuc2FmZVBhcnNlKGRhdGEsIHBhcmFtcyk7XG4gICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcylcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuZGF0YTtcbiAgICAgICAgdGhyb3cgcmVzdWx0LmVycm9yO1xuICAgIH1cbiAgICBzYWZlUGFyc2UoZGF0YSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgYXN5bmM6IHBhcmFtcz8uYXN5bmMgPz8gZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGV4dHVhbEVycm9yTWFwOiBwYXJhbXM/LmVycm9yTWFwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IHBhcmFtcz8ucGF0aCB8fCBbXSxcbiAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGFyc2VkVHlwZTogZ2V0UGFyc2VkVHlwZShkYXRhKSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcGFyc2VTeW5jKHsgZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pO1xuICAgICAgICByZXR1cm4gaGFuZGxlUmVzdWx0KGN0eCwgcmVzdWx0KTtcbiAgICB9XG4gICAgXCJ+dmFsaWRhdGVcIihkYXRhKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgYXN5bmM6ICEhdGhpc1tcIn5zdGFuZGFyZFwiXS5hc3luYyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBbXSxcbiAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGFyc2VkVHlwZTogZ2V0UGFyc2VkVHlwZShkYXRhKSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCF0aGlzW1wifnN0YW5kYXJkXCJdLmFzeW5jKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3BhcnNlU3luYyh7IGRhdGEsIHBhdGg6IFtdLCBwYXJlbnQ6IGN0eCB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNWYWxpZChyZXN1bHQpXG4gICAgICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzc3VlczogY3R4LmNvbW1vbi5pc3N1ZXMsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycj8ubWVzc2FnZT8udG9Mb3dlckNhc2UoKT8uaW5jbHVkZXMoXCJlbmNvdW50ZXJlZFwiKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW1wifnN0YW5kYXJkXCJdLmFzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3R4LmNvbW1vbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgYXN5bmM6IHRydWUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fcGFyc2VBc3luYyh7IGRhdGEsIHBhdGg6IFtdLCBwYXJlbnQ6IGN0eCB9KS50aGVuKChyZXN1bHQpID0+IGlzVmFsaWQocmVzdWx0KVxuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogY3R4LmNvbW1vbi5pc3N1ZXMsXG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMgcGFyc2VBc3luYyhkYXRhLCBwYXJhbXMpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zYWZlUGFyc2VBc3luYyhkYXRhLCBwYXJhbXMpO1xuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LmRhdGE7XG4gICAgICAgIHRocm93IHJlc3VsdC5lcnJvcjtcbiAgICB9XG4gICAgYXN5bmMgc2FmZVBhcnNlQXN5bmMoZGF0YSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgY29udGV4dHVhbEVycm9yTWFwOiBwYXJhbXM/LmVycm9yTWFwLFxuICAgICAgICAgICAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IHBhcmFtcz8ucGF0aCB8fCBbXSxcbiAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGFyc2VkVHlwZTogZ2V0UGFyc2VkVHlwZShkYXRhKSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgbWF5YmVBc3luY1Jlc3VsdCA9IHRoaXMuX3BhcnNlKHsgZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCAoaXNBc3luYyhtYXliZUFzeW5jUmVzdWx0KSA/IG1heWJlQXN5bmNSZXN1bHQgOiBQcm9taXNlLnJlc29sdmUobWF5YmVBc3luY1Jlc3VsdCkpO1xuICAgICAgICByZXR1cm4gaGFuZGxlUmVzdWx0KGN0eCwgcmVzdWx0KTtcbiAgICB9XG4gICAgcmVmaW5lKGNoZWNrLCBtZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IGdldElzc3VlUHJvcGVydGllcyA9ICh2YWwpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgbWVzc2FnZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IG1lc3NhZ2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBtZXNzYWdlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZSh2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZpbmVtZW50KCh2YWwsIGN0eCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gY2hlY2sodmFsKTtcbiAgICAgICAgICAgIGNvbnN0IHNldEVycm9yID0gKCkgPT4gY3R4LmFkZElzc3VlKHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuY3VzdG9tLFxuICAgICAgICAgICAgICAgIC4uLmdldElzc3VlUHJvcGVydGllcyh2YWwpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIFByb21pc2UgIT09IFwidW5kZWZpbmVkXCIgJiYgcmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBzZXRFcnJvcigpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVmaW5lbWVudChjaGVjaywgcmVmaW5lbWVudERhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmluZW1lbnQoKHZhbCwgY3R4KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWNoZWNrKHZhbCkpIHtcbiAgICAgICAgICAgICAgICBjdHguYWRkSXNzdWUodHlwZW9mIHJlZmluZW1lbnREYXRhID09PSBcImZ1bmN0aW9uXCIgPyByZWZpbmVtZW50RGF0YSh2YWwsIGN0eCkgOiByZWZpbmVtZW50RGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfcmVmaW5lbWVudChyZWZpbmVtZW50KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRWZmZWN0cyh7XG4gICAgICAgICAgICBzY2hlbWE6IHRoaXMsXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVmZmVjdHMsXG4gICAgICAgICAgICBlZmZlY3Q6IHsgdHlwZTogXCJyZWZpbmVtZW50XCIsIHJlZmluZW1lbnQgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN1cGVyUmVmaW5lKHJlZmluZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmluZW1lbnQocmVmaW5lbWVudCk7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGRlZikge1xuICAgICAgICAvKiogQWxpYXMgb2Ygc2FmZVBhcnNlQXN5bmMgKi9cbiAgICAgICAgdGhpcy5zcGEgPSB0aGlzLnNhZmVQYXJzZUFzeW5jO1xuICAgICAgICB0aGlzLl9kZWYgPSBkZWY7XG4gICAgICAgIHRoaXMucGFyc2UgPSB0aGlzLnBhcnNlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc2FmZVBhcnNlID0gdGhpcy5zYWZlUGFyc2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5wYXJzZUFzeW5jID0gdGhpcy5wYXJzZUFzeW5jLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc2FmZVBhcnNlQXN5bmMgPSB0aGlzLnNhZmVQYXJzZUFzeW5jLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc3BhID0gdGhpcy5zcGEuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5yZWZpbmUgPSB0aGlzLnJlZmluZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnJlZmluZW1lbnQgPSB0aGlzLnJlZmluZW1lbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zdXBlclJlZmluZSA9IHRoaXMuc3VwZXJSZWZpbmUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5vcHRpb25hbCA9IHRoaXMub3B0aW9uYWwuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5udWxsYWJsZSA9IHRoaXMubnVsbGFibGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5udWxsaXNoID0gdGhpcy5udWxsaXNoLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYXJyYXkgPSB0aGlzLmFycmF5LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucHJvbWlzZSA9IHRoaXMucHJvbWlzZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9yID0gdGhpcy5vci5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmFuZCA9IHRoaXMuYW5kLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtID0gdGhpcy50cmFuc2Zvcm0uYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5icmFuZCA9IHRoaXMuYnJhbmQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5kZWZhdWx0ID0gdGhpcy5kZWZhdWx0LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuY2F0Y2ggPSB0aGlzLmNhdGNoLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZGVzY3JpYmUgPSB0aGlzLmRlc2NyaWJlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucGlwZSA9IHRoaXMucGlwZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnJlYWRvbmx5ID0gdGhpcy5yZWFkb25seS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmlzTnVsbGFibGUgPSB0aGlzLmlzTnVsbGFibGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5pc09wdGlvbmFsID0gdGhpcy5pc09wdGlvbmFsLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXNbXCJ+c3RhbmRhcmRcIl0gPSB7XG4gICAgICAgICAgICB2ZXJzaW9uOiAxLFxuICAgICAgICAgICAgdmVuZG9yOiBcInpvZFwiLFxuICAgICAgICAgICAgdmFsaWRhdGU6IChkYXRhKSA9PiB0aGlzW1wifnZhbGlkYXRlXCJdKGRhdGEpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBvcHRpb25hbCgpIHtcbiAgICAgICAgcmV0dXJuIFpvZE9wdGlvbmFsLmNyZWF0ZSh0aGlzLCB0aGlzLl9kZWYpO1xuICAgIH1cbiAgICBudWxsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIFpvZE51bGxhYmxlLmNyZWF0ZSh0aGlzLCB0aGlzLl9kZWYpO1xuICAgIH1cbiAgICBudWxsaXNoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5udWxsYWJsZSgpLm9wdGlvbmFsKCk7XG4gICAgfVxuICAgIGFycmF5KCkge1xuICAgICAgICByZXR1cm4gWm9kQXJyYXkuY3JlYXRlKHRoaXMpO1xuICAgIH1cbiAgICBwcm9taXNlKCkge1xuICAgICAgICByZXR1cm4gWm9kUHJvbWlzZS5jcmVhdGUodGhpcywgdGhpcy5fZGVmKTtcbiAgICB9XG4gICAgb3Iob3B0aW9uKSB7XG4gICAgICAgIHJldHVybiBab2RVbmlvbi5jcmVhdGUoW3RoaXMsIG9wdGlvbl0sIHRoaXMuX2RlZik7XG4gICAgfVxuICAgIGFuZChpbmNvbWluZykge1xuICAgICAgICByZXR1cm4gWm9kSW50ZXJzZWN0aW9uLmNyZWF0ZSh0aGlzLCBpbmNvbWluZywgdGhpcy5fZGVmKTtcbiAgICB9XG4gICAgdHJhbnNmb3JtKHRyYW5zZm9ybSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEVmZmVjdHMoe1xuICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyh0aGlzLl9kZWYpLFxuICAgICAgICAgICAgc2NoZW1hOiB0aGlzLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFZmZlY3RzLFxuICAgICAgICAgICAgZWZmZWN0OiB7IHR5cGU6IFwidHJhbnNmb3JtXCIsIHRyYW5zZm9ybSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZGVmYXVsdChkZWYpIHtcbiAgICAgICAgY29uc3QgZGVmYXVsdFZhbHVlRnVuYyA9IHR5cGVvZiBkZWYgPT09IFwiZnVuY3Rpb25cIiA/IGRlZiA6ICgpID0+IGRlZjtcbiAgICAgICAgcmV0dXJuIG5ldyBab2REZWZhdWx0KHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXModGhpcy5fZGVmKSxcbiAgICAgICAgICAgIGlubmVyVHlwZTogdGhpcyxcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogZGVmYXVsdFZhbHVlRnVuYyxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRGVmYXVsdCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGJyYW5kKCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEJyYW5kZWQoe1xuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RCcmFuZGVkLFxuICAgICAgICAgICAgdHlwZTogdGhpcyxcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXModGhpcy5fZGVmKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNhdGNoKGRlZikge1xuICAgICAgICBjb25zdCBjYXRjaFZhbHVlRnVuYyA9IHR5cGVvZiBkZWYgPT09IFwiZnVuY3Rpb25cIiA/IGRlZiA6ICgpID0+IGRlZjtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RDYXRjaCh7XG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHRoaXMuX2RlZiksXG4gICAgICAgICAgICBpbm5lclR5cGU6IHRoaXMsXG4gICAgICAgICAgICBjYXRjaFZhbHVlOiBjYXRjaFZhbHVlRnVuYyxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQ2F0Y2gsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBkZXNjcmliZShkZXNjcmlwdGlvbikge1xuICAgICAgICBjb25zdCBUaGlzID0gdGhpcy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgcmV0dXJuIG5ldyBUaGlzKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcGlwZSh0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuIFpvZFBpcGVsaW5lLmNyZWF0ZSh0aGlzLCB0YXJnZXQpO1xuICAgIH1cbiAgICByZWFkb25seSgpIHtcbiAgICAgICAgcmV0dXJuIFpvZFJlYWRvbmx5LmNyZWF0ZSh0aGlzKTtcbiAgICB9XG4gICAgaXNPcHRpb25hbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FmZVBhcnNlKHVuZGVmaW5lZCkuc3VjY2VzcztcbiAgICB9XG4gICAgaXNOdWxsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FmZVBhcnNlKG51bGwpLnN1Y2Nlc3M7XG4gICAgfVxufVxuY29uc3QgY3VpZFJlZ2V4ID0gL15jW15cXHMtXXs4LH0kL2k7XG5jb25zdCBjdWlkMlJlZ2V4ID0gL15bMC05YS16XSskLztcbmNvbnN0IHVsaWRSZWdleCA9IC9eWzAtOUEtSEpLTU5QLVRWLVpdezI2fSQvaTtcbi8vIGNvbnN0IHV1aWRSZWdleCA9XG4vLyAgIC9eKFthLWYwLTldezh9LVthLWYwLTldezR9LVsxLTVdW2EtZjAtOV17M30tW2EtZjAtOV17NH0tW2EtZjAtOV17MTJ9fDAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCkkL2k7XG5jb25zdCB1dWlkUmVnZXggPSAvXlswLTlhLWZBLUZdezh9XFxiLVswLTlhLWZBLUZdezR9XFxiLVswLTlhLWZBLUZdezR9XFxiLVswLTlhLWZBLUZdezR9XFxiLVswLTlhLWZBLUZdezEyfSQvaTtcbmNvbnN0IG5hbm9pZFJlZ2V4ID0gL15bYS16MC05Xy1dezIxfSQvaTtcbmNvbnN0IGp3dFJlZ2V4ID0gL15bQS1aYS16MC05LV9dK1xcLltBLVphLXowLTktX10rXFwuW0EtWmEtejAtOS1fXSokLztcbmNvbnN0IGR1cmF0aW9uUmVnZXggPSAvXlstK10/UCg/ISQpKD86KD86Wy0rXT9cXGQrWSl8KD86Wy0rXT9cXGQrWy4sXVxcZCtZJCkpPyg/Oig/OlstK10/XFxkK00pfCg/OlstK10/XFxkK1suLF1cXGQrTSQpKT8oPzooPzpbLStdP1xcZCtXKXwoPzpbLStdP1xcZCtbLixdXFxkK1ckKSk/KD86KD86Wy0rXT9cXGQrRCl8KD86Wy0rXT9cXGQrWy4sXVxcZCtEJCkpPyg/OlQoPz1bXFxkKy1dKSg/Oig/OlstK10/XFxkK0gpfCg/OlstK10/XFxkK1suLF1cXGQrSCQpKT8oPzooPzpbLStdP1xcZCtNKXwoPzpbLStdP1xcZCtbLixdXFxkK00kKSk/KD86Wy0rXT9cXGQrKD86Wy4sXVxcZCspP1MpPyk/PyQvO1xuLy8gZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNDYxODEvMTU1MDE1NVxuLy8gb2xkIHZlcnNpb246IHRvbyBzbG93LCBkaWRuJ3Qgc3VwcG9ydCB1bmljb2RlXG4vLyBjb25zdCBlbWFpbFJlZ2V4ID0gL14oKChbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkrKFxcLihbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkrKSopfCgoXFx4MjIpKCgoKFxceDIwfFxceDA5KSooXFx4MGRcXHgwYSkpPyhcXHgyMHxcXHgwOSkrKT8oKFtcXHgwMS1cXHgwOFxceDBiXFx4MGNcXHgwZS1cXHgxZlxceDdmXXxcXHgyMXxbXFx4MjMtXFx4NWJdfFtcXHg1ZC1cXHg3ZV18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfChcXFxcKFtcXHgwMS1cXHgwOVxceDBiXFx4MGNcXHgwZC1cXHg3Zl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSkpKigoKFxceDIwfFxceDA5KSooXFx4MGRcXHgwYSkpPyhcXHgyMHxcXHgwOSkrKT8oXFx4MjIpKSlAKCgoW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLikrKChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpJC9pO1xuLy9vbGQgZW1haWwgcmVnZXhcbi8vIGNvbnN0IGVtYWlsUmVnZXggPSAvXigoW148PigpW1xcXS4sOzpcXHNAXCJdKyhcXC5bXjw+KClbXFxdLiw7Olxcc0BcIl0rKSopfChcIi4rXCIpKUAoKD8hLSkoW148PigpW1xcXS4sOzpcXHNAXCJdK1xcLikrW148PigpW1xcXS4sOzpcXHNAXCJdezEsfSlbXi08PigpW1xcXS4sOzpcXHNAXCJdJC9pO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4vLyBjb25zdCBlbWFpbFJlZ2V4ID1cbi8vICAgL14oKFtePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoXFxbKCgoMjVbMC01XSl8KDJbMC00XVswLTldKXwoMVswLTldezJ9KXwoWzAtOV17MSwyfSkpXFwuKXszfSgoMjVbMC01XSl8KDJbMC00XVswLTldKXwoMVswLTldezJ9KXwoWzAtOV17MSwyfSkpXFxdKXwoXFxbSVB2NjooKFthLWYwLTldezEsNH06KXs3fXw6OihbYS1mMC05XXsxLDR9Oil7MCw2fXwoW2EtZjAtOV17MSw0fTopezF9OihbYS1mMC05XXsxLDR9Oil7MCw1fXwoW2EtZjAtOV17MSw0fTopezJ9OihbYS1mMC05XXsxLDR9Oil7MCw0fXwoW2EtZjAtOV17MSw0fTopezN9OihbYS1mMC05XXsxLDR9Oil7MCwzfXwoW2EtZjAtOV17MSw0fTopezR9OihbYS1mMC05XXsxLDR9Oil7MCwyfXwoW2EtZjAtOV17MSw0fTopezV9OihbYS1mMC05XXsxLDR9Oil7MCwxfSkoW2EtZjAtOV17MSw0fXwoKCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSlcXC4pezN9KCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSkpXFxdKXwoW0EtWmEtejAtOV0oW0EtWmEtejAtOS1dKltBLVphLXowLTldKSooXFwuW0EtWmEtel17Mix9KSspKSQvO1xuLy8gY29uc3QgZW1haWxSZWdleCA9XG4vLyAgIC9eW2EtekEtWjAtOVxcLlxcIVxcI1xcJFxcJVxcJlxcJ1xcKlxcK1xcL1xcPVxcP1xcXlxcX1xcYFxce1xcfFxcfVxcflxcLV0rQFthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykqJC87XG4vLyBjb25zdCBlbWFpbFJlZ2V4ID1cbi8vICAgL14oPzpbYS16MC05ISMkJSYnKisvPT9eX2B7fH1+LV0rKD86XFwuW2EtejAtOSEjJCUmJyorLz0/Xl9ge3x9fi1dKykqfFwiKD86W1xceDAxLVxceDA4XFx4MGJcXHgwY1xceDBlLVxceDFmXFx4MjFcXHgyMy1cXHg1YlxceDVkLVxceDdmXXxcXFxcW1xceDAxLVxceDA5XFx4MGJcXHgwY1xceDBlLVxceDdmXSkqXCIpQCg/Oig/OlthLXowLTldKD86W2EtejAtOS1dKlthLXowLTldKT9cXC4pK1thLXowLTldKD86W2EtejAtOS1dKlthLXowLTldKT98XFxbKD86KD86MjVbMC01XXwyWzAtNF1bMC05XXxbMDFdP1swLTldWzAtOV0/KVxcLil7M30oPzoyNVswLTVdfDJbMC00XVswLTldfFswMV0/WzAtOV1bMC05XT98W2EtejAtOS1dKlthLXowLTldOig/OltcXHgwMS1cXHgwOFxceDBiXFx4MGNcXHgwZS1cXHgxZlxceDIxLVxceDVhXFx4NTMtXFx4N2ZdfFxcXFxbXFx4MDEtXFx4MDlcXHgwYlxceDBjXFx4MGUtXFx4N2ZdKSspXFxdKSQvaTtcbmNvbnN0IGVtYWlsUmVnZXggPSAvXig/IVxcLikoPyEuKlxcLlxcLikoW0EtWjAtOV8nK1xcLVxcLl0qKVtBLVowLTlfKy1dQChbQS1aMC05XVtBLVowLTlcXC1dKlxcLikrW0EtWl17Mix9JC9pO1xuLy8gY29uc3QgZW1haWxSZWdleCA9XG4vLyAgIC9eW2EtejAtOS4hIyQlJlx1MjAxOSorLz0/Xl9ge3x9fi1dK0BbYS16MC05LV0rKD86XFwuW2EtejAtOVxcLV0rKSokL2k7XG4vLyBmcm9tIGh0dHBzOi8vdGhla2V2aW5zY290dC5jb20vZW1vamlzLWluLWphdmFzY3JpcHQvI3dyaXRpbmctYS1yZWd1bGFyLWV4cHJlc3Npb25cbmNvbnN0IF9lbW9qaVJlZ2V4ID0gYF4oXFxcXHB7RXh0ZW5kZWRfUGljdG9ncmFwaGljfXxcXFxccHtFbW9qaV9Db21wb25lbnR9KSskYDtcbmxldCBlbW9qaVJlZ2V4O1xuLy8gZmFzdGVyLCBzaW1wbGVyLCBzYWZlclxuY29uc3QgaXB2NFJlZ2V4ID0gL14oPzooPzoyNVswLTVdfDJbMC00XVswLTldfDFbMC05XVswLTldfFsxLTldWzAtOV18WzAtOV0pXFwuKXszfSg/OjI1WzAtNV18MlswLTRdWzAtOV18MVswLTldWzAtOV18WzEtOV1bMC05XXxbMC05XSkkLztcbmNvbnN0IGlwdjRDaWRyUmVnZXggPSAvXig/Oig/OjI1WzAtNV18MlswLTRdWzAtOV18MVswLTldWzAtOV18WzEtOV1bMC05XXxbMC05XSlcXC4pezN9KD86MjVbMC01XXwyWzAtNF1bMC05XXwxWzAtOV1bMC05XXxbMS05XVswLTldfFswLTldKVxcLygzWzAtMl18WzEyXT9bMC05XSkkLztcbi8vIGNvbnN0IGlwdjZSZWdleCA9XG4vLyAvXigoW2EtZjAtOV17MSw0fTopezd9fDo6KFthLWYwLTldezEsNH06KXswLDZ9fChbYS1mMC05XXsxLDR9Oil7MX06KFthLWYwLTldezEsNH06KXswLDV9fChbYS1mMC05XXsxLDR9Oil7Mn06KFthLWYwLTldezEsNH06KXswLDR9fChbYS1mMC05XXsxLDR9Oil7M306KFthLWYwLTldezEsNH06KXswLDN9fChbYS1mMC05XXsxLDR9Oil7NH06KFthLWYwLTldezEsNH06KXswLDJ9fChbYS1mMC05XXsxLDR9Oil7NX06KFthLWYwLTldezEsNH06KXswLDF9KShbYS1mMC05XXsxLDR9fCgoKDI1WzAtNV0pfCgyWzAtNF1bMC05XSl8KDFbMC05XXsyfSl8KFswLTldezEsMn0pKVxcLil7M30oKDI1WzAtNV0pfCgyWzAtNF1bMC05XSl8KDFbMC05XXsyfSl8KFswLTldezEsMn0pKSkkLztcbmNvbnN0IGlwdjZSZWdleCA9IC9eKChbMC05YS1mQS1GXXsxLDR9Oil7Nyw3fVswLTlhLWZBLUZdezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDd9OnwoWzAtOWEtZkEtRl17MSw0fTopezEsNn06WzAtOWEtZkEtRl17MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsNX0oOlswLTlhLWZBLUZdezEsNH0pezEsMn18KFswLTlhLWZBLUZdezEsNH06KXsxLDR9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDN9fChbMC05YS1mQS1GXXsxLDR9Oil7MSwzfSg6WzAtOWEtZkEtRl17MSw0fSl7MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsMn0oOlswLTlhLWZBLUZdezEsNH0pezEsNX18WzAtOWEtZkEtRl17MSw0fTooKDpbMC05YS1mQS1GXXsxLDR9KXsxLDZ9KXw6KCg6WzAtOWEtZkEtRl17MSw0fSl7MSw3fXw6KXxmZTgwOig6WzAtOWEtZkEtRl17MCw0fSl7MCw0fSVbMC05YS16QS1aXXsxLH18OjooZmZmZig6MHsxLDR9KXswLDF9Oil7MCwxfSgoMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pXFwuKXszLDN9KDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKXwoWzAtOWEtZkEtRl17MSw0fTopezEsNH06KCgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSlcXC4pezMsM30oMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pKSQvO1xuY29uc3QgaXB2NkNpZHJSZWdleCA9IC9eKChbMC05YS1mQS1GXXsxLDR9Oil7Nyw3fVswLTlhLWZBLUZdezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDd9OnwoWzAtOWEtZkEtRl17MSw0fTopezEsNn06WzAtOWEtZkEtRl17MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsNX0oOlswLTlhLWZBLUZdezEsNH0pezEsMn18KFswLTlhLWZBLUZdezEsNH06KXsxLDR9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDN9fChbMC05YS1mQS1GXXsxLDR9Oil7MSwzfSg6WzAtOWEtZkEtRl17MSw0fSl7MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsMn0oOlswLTlhLWZBLUZdezEsNH0pezEsNX18WzAtOWEtZkEtRl17MSw0fTooKDpbMC05YS1mQS1GXXsxLDR9KXsxLDZ9KXw6KCg6WzAtOWEtZkEtRl17MSw0fSl7MSw3fXw6KXxmZTgwOig6WzAtOWEtZkEtRl17MCw0fSl7MCw0fSVbMC05YS16QS1aXXsxLH18OjooZmZmZig6MHsxLDR9KXswLDF9Oil7MCwxfSgoMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pXFwuKXszLDN9KDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKXwoWzAtOWEtZkEtRl17MSw0fTopezEsNH06KCgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSlcXC4pezMsM30oMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pKVxcLygxMlswLThdfDFbMDFdWzAtOV18WzEtOV0/WzAtOV0pJC87XG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83ODYwMzkyL2RldGVybWluZS1pZi1zdHJpbmctaXMtaW4tYmFzZTY0LXVzaW5nLWphdmFzY3JpcHRcbmNvbnN0IGJhc2U2NFJlZ2V4ID0gL14oWzAtOWEtekEtWisvXXs0fSkqKChbMC05YS16QS1aKy9dezJ9PT0pfChbMC05YS16QS1aKy9dezN9PSkpPyQvO1xuLy8gaHR0cHM6Ly9iYXNlNjQuZ3VydS9zdGFuZGFyZHMvYmFzZTY0dXJsXG5jb25zdCBiYXNlNjR1cmxSZWdleCA9IC9eKFswLTlhLXpBLVotX117NH0pKigoWzAtOWEtekEtWi1fXXsyfSg9PSk/KXwoWzAtOWEtekEtWi1fXXszfSg9KT8pKT8kLztcbi8vIHNpbXBsZVxuLy8gY29uc3QgZGF0ZVJlZ2V4U291cmNlID0gYFxcXFxkezR9LVxcXFxkezJ9LVxcXFxkezJ9YDtcbi8vIG5vIGxlYXAgeWVhciB2YWxpZGF0aW9uXG4vLyBjb25zdCBkYXRlUmVnZXhTb3VyY2UgPSBgXFxcXGR7NH0tKCgwWzEzNTc4XXwxMHwxMiktMzF8KDBbMTMtOV18MVswLTJdKS0zMHwoMFsxLTldfDFbMC0yXSktKDBbMS05XXwxXFxcXGR8MlxcXFxkKSlgO1xuLy8gd2l0aCBsZWFwIHllYXIgdmFsaWRhdGlvblxuY29uc3QgZGF0ZVJlZ2V4U291cmNlID0gYCgoXFxcXGRcXFxcZFsyNDY4XVswNDhdfFxcXFxkXFxcXGRbMTM1NzldWzI2XXxcXFxcZFxcXFxkMFs0OF18WzAyNDY4XVswNDhdMDB8WzEzNTc5XVsyNl0wMCktMDItMjl8XFxcXGR7NH0tKCgwWzEzNTc4XXwxWzAyXSktKDBbMS05XXxbMTJdXFxcXGR8M1swMV0pfCgwWzQ2OV18MTEpLSgwWzEtOV18WzEyXVxcXFxkfDMwKXwoMDIpLSgwWzEtOV18MVxcXFxkfDJbMC04XSkpKWA7XG5jb25zdCBkYXRlUmVnZXggPSBuZXcgUmVnRXhwKGBeJHtkYXRlUmVnZXhTb3VyY2V9JGApO1xuZnVuY3Rpb24gdGltZVJlZ2V4U291cmNlKGFyZ3MpIHtcbiAgICBsZXQgc2Vjb25kc1JlZ2V4U291cmNlID0gYFswLTVdXFxcXGRgO1xuICAgIGlmIChhcmdzLnByZWNpc2lvbikge1xuICAgICAgICBzZWNvbmRzUmVnZXhTb3VyY2UgPSBgJHtzZWNvbmRzUmVnZXhTb3VyY2V9XFxcXC5cXFxcZHske2FyZ3MucHJlY2lzaW9ufX1gO1xuICAgIH1cbiAgICBlbHNlIGlmIChhcmdzLnByZWNpc2lvbiA9PSBudWxsKSB7XG4gICAgICAgIHNlY29uZHNSZWdleFNvdXJjZSA9IGAke3NlY29uZHNSZWdleFNvdXJjZX0oXFxcXC5cXFxcZCspP2A7XG4gICAgfVxuICAgIGNvbnN0IHNlY29uZHNRdWFudGlmaWVyID0gYXJncy5wcmVjaXNpb24gPyBcIitcIiA6IFwiP1wiOyAvLyByZXF1aXJlIHNlY29uZHMgaWYgcHJlY2lzaW9uIGlzIG5vbnplcm9cbiAgICByZXR1cm4gYChbMDFdXFxcXGR8MlswLTNdKTpbMC01XVxcXFxkKDoke3NlY29uZHNSZWdleFNvdXJjZX0pJHtzZWNvbmRzUXVhbnRpZmllcn1gO1xufVxuZnVuY3Rpb24gdGltZVJlZ2V4KGFyZ3MpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXiR7dGltZVJlZ2V4U291cmNlKGFyZ3MpfSRgKTtcbn1cbi8vIEFkYXB0ZWQgZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzE0MzIzMVxuZXhwb3J0IGZ1bmN0aW9uIGRhdGV0aW1lUmVnZXgoYXJncykge1xuICAgIGxldCByZWdleCA9IGAke2RhdGVSZWdleFNvdXJjZX1UJHt0aW1lUmVnZXhTb3VyY2UoYXJncyl9YDtcbiAgICBjb25zdCBvcHRzID0gW107XG4gICAgb3B0cy5wdXNoKGFyZ3MubG9jYWwgPyBgWj9gIDogYFpgKTtcbiAgICBpZiAoYXJncy5vZmZzZXQpXG4gICAgICAgIG9wdHMucHVzaChgKFsrLV1cXFxcZHsyfTo/XFxcXGR7Mn0pYCk7XG4gICAgcmVnZXggPSBgJHtyZWdleH0oJHtvcHRzLmpvaW4oXCJ8XCIpfSlgO1xuICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHtyZWdleH0kYCk7XG59XG5mdW5jdGlvbiBpc1ZhbGlkSVAoaXAsIHZlcnNpb24pIHtcbiAgICBpZiAoKHZlcnNpb24gPT09IFwidjRcIiB8fCAhdmVyc2lvbikgJiYgaXB2NFJlZ2V4LnRlc3QoaXApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoKHZlcnNpb24gPT09IFwidjZcIiB8fCAhdmVyc2lvbikgJiYgaXB2NlJlZ2V4LnRlc3QoaXApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBpc1ZhbGlkSldUKGp3dCwgYWxnKSB7XG4gICAgaWYgKCFqd3RSZWdleC50ZXN0KGp3dCkpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBbaGVhZGVyXSA9IGp3dC5zcGxpdChcIi5cIik7XG4gICAgICAgIGlmICghaGVhZGVyKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyBDb252ZXJ0IGJhc2U2NHVybCB0byBiYXNlNjRcbiAgICAgICAgY29uc3QgYmFzZTY0ID0gaGVhZGVyXG4gICAgICAgICAgICAucmVwbGFjZSgvLS9nLCBcIitcIilcbiAgICAgICAgICAgIC5yZXBsYWNlKC9fL2csIFwiL1wiKVxuICAgICAgICAgICAgLnBhZEVuZChoZWFkZXIubGVuZ3RoICsgKCg0IC0gKGhlYWRlci5sZW5ndGggJSA0KSkgJSA0KSwgXCI9XCIpO1xuICAgICAgICBjb25zdCBkZWNvZGVkID0gSlNPTi5wYXJzZShhdG9iKGJhc2U2NCkpO1xuICAgICAgICBpZiAodHlwZW9mIGRlY29kZWQgIT09IFwib2JqZWN0XCIgfHwgZGVjb2RlZCA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKFwidHlwXCIgaW4gZGVjb2RlZCAmJiBkZWNvZGVkPy50eXAgIT09IFwiSldUXCIpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICghZGVjb2RlZC5hbGcpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChhbGcgJiYgZGVjb2RlZC5hbGcgIT09IGFsZylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGlzVmFsaWRDaWRyKGlwLCB2ZXJzaW9uKSB7XG4gICAgaWYgKCh2ZXJzaW9uID09PSBcInY0XCIgfHwgIXZlcnNpb24pICYmIGlwdjRDaWRyUmVnZXgudGVzdChpcCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICgodmVyc2lvbiA9PT0gXCJ2NlwiIHx8ICF2ZXJzaW9uKSAmJiBpcHY2Q2lkclJlZ2V4LnRlc3QoaXApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5leHBvcnQgY2xhc3MgWm9kU3RyaW5nIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY29lcmNlKSB7XG4gICAgICAgICAgICBpbnB1dC5kYXRhID0gU3RyaW5nKGlucHV0LmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuc3RyaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLnN0cmluZyxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IG5ldyBQYXJzZVN0YXR1cygpO1xuICAgICAgICBsZXQgY3R4ID0gdW5kZWZpbmVkO1xuICAgICAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaGVjay5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEubGVuZ3RoIDwgY2hlY2sudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEubGVuZ3RoID4gY2hlY2sudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJsZW5ndGhcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb0JpZyA9IGlucHV0LmRhdGEubGVuZ3RoID4gY2hlY2sudmFsdWU7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBpbnB1dC5kYXRhLmxlbmd0aCA8IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29CaWcgfHwgdG9vU21hbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b29CaWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0b29TbWFsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJlbWFpbFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlbWFpbFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJlbWFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZW1vamlcIikge1xuICAgICAgICAgICAgICAgIGlmICghZW1vamlSZWdleCkge1xuICAgICAgICAgICAgICAgICAgICBlbW9qaVJlZ2V4ID0gbmV3IFJlZ0V4cChfZW1vamlSZWdleCwgXCJ1XCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWVtb2ppUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImVtb2ppXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ1dWlkXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXV1aWRSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwidXVpZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibmFub2lkXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW5hbm9pZFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJuYW5vaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImN1aWRcIikge1xuICAgICAgICAgICAgICAgIGlmICghY3VpZFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJjdWlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJjdWlkMlwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjdWlkMlJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJjdWlkMlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwidWxpZFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF1bGlkUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcInVsaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInVybFwiKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgbmV3IFVSTChpbnB1dC5kYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcInVybFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwicmVnZXhcIikge1xuICAgICAgICAgICAgICAgIGNoZWNrLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgdGVzdFJlc3VsdCA9IGNoZWNrLnJlZ2V4LnRlc3QoaW5wdXQuZGF0YSk7XG4gICAgICAgICAgICAgICAgaWYgKCF0ZXN0UmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwicmVnZXhcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInRyaW1cIikge1xuICAgICAgICAgICAgICAgIGlucHV0LmRhdGEgPSBpbnB1dC5kYXRhLnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiaW5jbHVkZXNcIikge1xuICAgICAgICAgICAgICAgIGlmICghaW5wdXQuZGF0YS5pbmNsdWRlcyhjaGVjay52YWx1ZSwgY2hlY2sucG9zaXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHsgaW5jbHVkZXM6IGNoZWNrLnZhbHVlLCBwb3NpdGlvbjogY2hlY2sucG9zaXRpb24gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInRvTG93ZXJDYXNlXCIpIHtcbiAgICAgICAgICAgICAgICBpbnB1dC5kYXRhID0gaW5wdXQuZGF0YS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ0b1VwcGVyQ2FzZVwiKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQuZGF0YSA9IGlucHV0LmRhdGEudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwic3RhcnRzV2l0aFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpbnB1dC5kYXRhLnN0YXJ0c1dpdGgoY2hlY2sudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHsgc3RhcnRzV2l0aDogY2hlY2sudmFsdWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImVuZHNXaXRoXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0LmRhdGEuZW5kc1dpdGgoY2hlY2sudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHsgZW5kc1dpdGg6IGNoZWNrLnZhbHVlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJkYXRldGltZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVnZXggPSBkYXRldGltZVJlZ2V4KGNoZWNrKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJkYXRldGltZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZGF0ZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVnZXggPSBkYXRlUmVnZXg7XG4gICAgICAgICAgICAgICAgaWYgKCFyZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwidGltZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVnZXggPSB0aW1lUmVnZXgoY2hlY2spO1xuICAgICAgICAgICAgICAgIGlmICghcmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcInRpbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImR1cmF0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWR1cmF0aW9uUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImR1cmF0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJpcFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkSVAoaW5wdXQuZGF0YSwgY2hlY2sudmVyc2lvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJpcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiand0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzVmFsaWRKV1QoaW5wdXQuZGF0YSwgY2hlY2suYWxnKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImp3dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiY2lkclwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkQ2lkcihpbnB1dC5kYXRhLCBjaGVjay52ZXJzaW9uKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImNpZHJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImJhc2U2NFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFiYXNlNjRSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiYmFzZTY0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJiYXNlNjR1cmxcIikge1xuICAgICAgICAgICAgICAgIGlmICghYmFzZTY0dXJsUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImJhc2U2NHVybFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoY2hlY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogaW5wdXQuZGF0YSB9O1xuICAgIH1cbiAgICBfcmVnZXgocmVnZXgsIHZhbGlkYXRpb24sIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVmaW5lbWVudCgoZGF0YSkgPT4gcmVnZXgudGVzdChkYXRhKSwge1xuICAgICAgICAgICAgdmFsaWRhdGlvbixcbiAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9hZGRDaGVjayhjaGVjaykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFN0cmluZyh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCBjaGVja10sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbWFpbChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiZW1haWxcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICB1cmwobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcInVybFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIGVtb2ppKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJlbW9qaVwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIHV1aWQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcInV1aWRcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBuYW5vaWQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcIm5hbm9pZFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIGN1aWQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImN1aWRcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBjdWlkMihtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiY3VpZDJcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICB1bGlkKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJ1bGlkXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgYmFzZTY0KG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJiYXNlNjRcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBiYXNlNjR1cmwobWVzc2FnZSkge1xuICAgICAgICAvLyBiYXNlNjR1cmwgZW5jb2RpbmcgaXMgYSBtb2RpZmljYXRpb24gb2YgYmFzZTY0IHRoYXQgY2FuIHNhZmVseSBiZSB1c2VkIGluIFVSTHMgYW5kIGZpbGVuYW1lc1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJiYXNlNjR1cmxcIixcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGp3dChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiand0XCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihvcHRpb25zKSB9KTtcbiAgICB9XG4gICAgaXAob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImlwXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihvcHRpb25zKSB9KTtcbiAgICB9XG4gICAgY2lkcihvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiY2lkclwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucykgfSk7XG4gICAgfVxuICAgIGRhdGV0aW1lKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAgICAgIGtpbmQ6IFwiZGF0ZXRpbWVcIixcbiAgICAgICAgICAgICAgICBwcmVjaXNpb246IG51bGwsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBsb2NhbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogb3B0aW9ucyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImRhdGV0aW1lXCIsXG4gICAgICAgICAgICBwcmVjaXNpb246IHR5cGVvZiBvcHRpb25zPy5wcmVjaXNpb24gPT09IFwidW5kZWZpbmVkXCIgPyBudWxsIDogb3B0aW9ucz8ucHJlY2lzaW9uLFxuICAgICAgICAgICAgb2Zmc2V0OiBvcHRpb25zPy5vZmZzZXQgPz8gZmFsc2UsXG4gICAgICAgICAgICBsb2NhbDogb3B0aW9ucz8ubG9jYWwgPz8gZmFsc2UsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucz8ubWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBkYXRlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJkYXRlXCIsIG1lc3NhZ2UgfSk7XG4gICAgfVxuICAgIHRpbWUob3B0aW9ucykge1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICAgICAga2luZDogXCJ0aW1lXCIsXG4gICAgICAgICAgICAgICAgcHJlY2lzaW9uOiBudWxsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG9wdGlvbnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJ0aW1lXCIsXG4gICAgICAgICAgICBwcmVjaXNpb246IHR5cGVvZiBvcHRpb25zPy5wcmVjaXNpb24gPT09IFwidW5kZWZpbmVkXCIgPyBudWxsIDogb3B0aW9ucz8ucHJlY2lzaW9uLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG9wdGlvbnM/Lm1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZHVyYXRpb24obWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImR1cmF0aW9uXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgcmVnZXgocmVnZXgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwicmVnZXhcIixcbiAgICAgICAgICAgIHJlZ2V4OiByZWdleCxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGluY2x1ZGVzKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImluY2x1ZGVzXCIsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBwb3NpdGlvbjogb3B0aW9ucz8ucG9zaXRpb24sXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucz8ubWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdGFydHNXaXRoKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcInN0YXJ0c1dpdGhcIixcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVuZHNXaXRoKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImVuZHNXaXRoXCIsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtaW4obWluTGVuZ3RoLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IG1pbkxlbmd0aCxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1heChtYXhMZW5ndGgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICB2YWx1ZTogbWF4TGVuZ3RoLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbGVuZ3RoKGxlbiwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJsZW5ndGhcIixcbiAgICAgICAgICAgIHZhbHVlOiBsZW4sXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFcXVpdmFsZW50IHRvIGAubWluKDEpYFxuICAgICAqL1xuICAgIG5vbmVtcHR5KG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluKDEsIGVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSk7XG4gICAgfVxuICAgIHRyaW0oKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kU3RyaW5nKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogWy4uLnRoaXMuX2RlZi5jaGVja3MsIHsga2luZDogXCJ0cmltXCIgfV0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB0b0xvd2VyQ2FzZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTdHJpbmcoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgeyBraW5kOiBcInRvTG93ZXJDYXNlXCIgfV0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB0b1VwcGVyQ2FzZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTdHJpbmcoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgeyBraW5kOiBcInRvVXBwZXJDYXNlXCIgfV0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQgaXNEYXRldGltZSgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJkYXRldGltZVwiKTtcbiAgICB9XG4gICAgZ2V0IGlzRGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJkYXRlXCIpO1xuICAgIH1cbiAgICBnZXQgaXNUaW1lKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcInRpbWVcIik7XG4gICAgfVxuICAgIGdldCBpc0R1cmF0aW9uKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImR1cmF0aW9uXCIpO1xuICAgIH1cbiAgICBnZXQgaXNFbWFpbCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJlbWFpbFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzVVJMKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcInVybFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzRW1vamkoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiZW1vamlcIik7XG4gICAgfVxuICAgIGdldCBpc1VVSUQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwidXVpZFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzTkFOT0lEKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcIm5hbm9pZFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzQ1VJRCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJjdWlkXCIpO1xuICAgIH1cbiAgICBnZXQgaXNDVUlEMigpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJjdWlkMlwiKTtcbiAgICB9XG4gICAgZ2V0IGlzVUxJRCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJ1bGlkXCIpO1xuICAgIH1cbiAgICBnZXQgaXNJUCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJpcFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzQ0lEUigpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJjaWRyXCIpO1xuICAgIH1cbiAgICBnZXQgaXNCYXNlNjQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiYmFzZTY0XCIpO1xuICAgIH1cbiAgICBnZXQgaXNCYXNlNjR1cmwoKSB7XG4gICAgICAgIC8vIGJhc2U2NHVybCBlbmNvZGluZyBpcyBhIG1vZGlmaWNhdGlvbiBvZiBiYXNlNjQgdGhhdCBjYW4gc2FmZWx5IGJlIHVzZWQgaW4gVVJMcyBhbmQgZmlsZW5hbWVzXG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiYmFzZTY0dXJsXCIpO1xuICAgIH1cbiAgICBnZXQgbWluTGVuZ3RoKCkge1xuICAgICAgICBsZXQgbWluID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChtaW4gPT09IG51bGwgfHwgY2gudmFsdWUgPiBtaW4pXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtaW47XG4gICAgfVxuICAgIGdldCBtYXhMZW5ndGgoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9XG59XG5ab2RTdHJpbmcuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kU3RyaW5nKHtcbiAgICAgICAgY2hlY2tzOiBbXSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RTdHJpbmcsXG4gICAgICAgIGNvZXJjZTogcGFyYW1zPy5jb2VyY2UgPz8gZmFsc2UsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zOTY2NDg0L3doeS1kb2VzLW1vZHVsdXMtb3BlcmF0b3ItcmV0dXJuLWZyYWN0aW9uYWwtbnVtYmVyLWluLWphdmFzY3JpcHQvMzE3MTEwMzQjMzE3MTEwMzRcbmZ1bmN0aW9uIGZsb2F0U2FmZVJlbWFpbmRlcih2YWwsIHN0ZXApIHtcbiAgICBjb25zdCB2YWxEZWNDb3VudCA9ICh2YWwudG9TdHJpbmcoKS5zcGxpdChcIi5cIilbMV0gfHwgXCJcIikubGVuZ3RoO1xuICAgIGNvbnN0IHN0ZXBEZWNDb3VudCA9IChzdGVwLnRvU3RyaW5nKCkuc3BsaXQoXCIuXCIpWzFdIHx8IFwiXCIpLmxlbmd0aDtcbiAgICBjb25zdCBkZWNDb3VudCA9IHZhbERlY0NvdW50ID4gc3RlcERlY0NvdW50ID8gdmFsRGVjQ291bnQgOiBzdGVwRGVjQ291bnQ7XG4gICAgY29uc3QgdmFsSW50ID0gTnVtYmVyLnBhcnNlSW50KHZhbC50b0ZpeGVkKGRlY0NvdW50KS5yZXBsYWNlKFwiLlwiLCBcIlwiKSk7XG4gICAgY29uc3Qgc3RlcEludCA9IE51bWJlci5wYXJzZUludChzdGVwLnRvRml4ZWQoZGVjQ291bnQpLnJlcGxhY2UoXCIuXCIsIFwiXCIpKTtcbiAgICByZXR1cm4gKHZhbEludCAlIHN0ZXBJbnQpIC8gMTAgKiogZGVjQ291bnQ7XG59XG5leHBvcnQgY2xhc3MgWm9kTnVtYmVyIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMubWluID0gdGhpcy5ndGU7XG4gICAgICAgIHRoaXMubWF4ID0gdGhpcy5sdGU7XG4gICAgICAgIHRoaXMuc3RlcCA9IHRoaXMubXVsdGlwbGVPZjtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY29lcmNlKSB7XG4gICAgICAgICAgICBpbnB1dC5kYXRhID0gTnVtYmVyKGlucHV0LmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUubnVtYmVyKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm51bWJlcixcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjdHggPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IG5ldyBQYXJzZVN0YXR1cygpO1xuICAgICAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaGVjay5raW5kID09PSBcImludFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF1dGlsLmlzSW50ZWdlcihpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFwiaW50ZWdlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IFwiZmxvYXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBjaGVjay5pbmNsdXNpdmUgPyBpbnB1dC5kYXRhIDwgY2hlY2sudmFsdWUgOiBpbnB1dC5kYXRhIDw9IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29TbWFsbCkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiBjaGVjay5pbmNsdXNpdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb0JpZyA9IGNoZWNrLmluY2x1c2l2ZSA/IGlucHV0LmRhdGEgPiBjaGVjay52YWx1ZSA6IGlucHV0LmRhdGEgPj0gY2hlY2sudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHRvb0JpZykge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogY2hlY2suaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZsb2F0U2FmZVJlbWFpbmRlcihpbnB1dC5kYXRhLCBjaGVjay52YWx1ZSkgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLm5vdF9tdWx0aXBsZV9vZixcbiAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpcGxlT2Y6IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZmluaXRlXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUubm90X2Zpbml0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGNoZWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGlucHV0LmRhdGEgfTtcbiAgICB9XG4gICAgZ3RlKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWluXCIsIHZhbHVlLCB0cnVlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBndCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1pblwiLCB2YWx1ZSwgZmFsc2UsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIGx0ZSh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1heFwiLCB2YWx1ZSwgdHJ1ZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgbHQodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtYXhcIiwgdmFsdWUsIGZhbHNlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBzZXRMaW1pdChraW5kLCB2YWx1ZSwgaW5jbHVzaXZlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kTnVtYmVyKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogW1xuICAgICAgICAgICAgICAgIC4uLnRoaXMuX2RlZi5jaGVja3MsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBraW5kLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfYWRkQ2hlY2soY2hlY2spIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2ROdW1iZXIoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgY2hlY2tdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW50KG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwiaW50XCIsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IGZhbHNlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbmVnYXRpdmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtYXhcIixcbiAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbnBvc2l0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbm5lZ2F0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG11bHRpcGxlT2YodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibXVsdGlwbGVPZlwiLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZmluaXRlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwiZmluaXRlXCIsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzYWZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0IG1pblZhbHVlKCkge1xuICAgICAgICBsZXQgbWluID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChtaW4gPT09IG51bGwgfHwgY2gudmFsdWUgPiBtaW4pXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtaW47XG4gICAgfVxuICAgIGdldCBtYXhWYWx1ZSgpIHtcbiAgICAgICAgbGV0IG1heCA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWF4ID09PSBudWxsIHx8IGNoLnZhbHVlIDwgbWF4KVxuICAgICAgICAgICAgICAgICAgICBtYXggPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF4O1xuICAgIH1cbiAgICBnZXQgaXNJbnQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiaW50XCIgfHwgKGNoLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiICYmIHV0aWwuaXNJbnRlZ2VyKGNoLnZhbHVlKSkpO1xuICAgIH1cbiAgICBnZXQgaXNGaW5pdGUoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBsZXQgbWluID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJmaW5pdGVcIiB8fCBjaC5raW5kID09PSBcImludFwiIHx8IGNoLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaC5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pbiA9PT0gbnVsbCB8fCBjaC52YWx1ZSA+IG1pbilcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZShtaW4pICYmIE51bWJlci5pc0Zpbml0ZShtYXgpO1xuICAgIH1cbn1cblpvZE51bWJlci5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2ROdW1iZXIoe1xuICAgICAgICBjaGVja3M6IFtdLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE51bWJlcixcbiAgICAgICAgY29lcmNlOiBwYXJhbXM/LmNvZXJjZSB8fCBmYWxzZSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RCaWdJbnQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5taW4gPSB0aGlzLmd0ZTtcbiAgICAgICAgdGhpcy5tYXggPSB0aGlzLmx0ZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY29lcmNlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlucHV0LmRhdGEgPSBCaWdJbnQoaW5wdXQuZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldEludmFsaWRJbnB1dChpbnB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5iaWdpbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRJbnZhbGlkSW5wdXQoaW5wdXQpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjdHggPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IG5ldyBQYXJzZVN0YXR1cygpO1xuICAgICAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaGVjay5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBjaGVjay5pbmNsdXNpdmUgPyBpbnB1dC5kYXRhIDwgY2hlY2sudmFsdWUgOiBpbnB1dC5kYXRhIDw9IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29TbWFsbCkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJiaWdpbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiBjaGVjay5pbmNsdXNpdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb0JpZyA9IGNoZWNrLmluY2x1c2l2ZSA/IGlucHV0LmRhdGEgPiBjaGVjay52YWx1ZSA6IGlucHV0LmRhdGEgPj0gY2hlY2sudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHRvb0JpZykge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYmlnaW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogY2hlY2suaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEgJSBjaGVjay52YWx1ZSAhPT0gQmlnSW50KDApKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5ub3RfbXVsdGlwbGVfb2YsXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZU9mOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGNoZWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGlucHV0LmRhdGEgfTtcbiAgICB9XG4gICAgX2dldEludmFsaWRJbnB1dChpbnB1dCkge1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmJpZ2ludCxcbiAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgIH1cbiAgICBndGUodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtaW5cIiwgdmFsdWUsIHRydWUsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIGd0KHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWluXCIsIHZhbHVlLCBmYWxzZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgbHRlKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWF4XCIsIHZhbHVlLCB0cnVlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBsdCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1heFwiLCB2YWx1ZSwgZmFsc2UsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIHNldExpbWl0KGtpbmQsIHZhbHVlLCBpbmNsdXNpdmUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RCaWdJbnQoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbXG4gICAgICAgICAgICAgICAgLi4udGhpcy5fZGVmLmNoZWNrcyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtpbmQsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9hZGRDaGVjayhjaGVjaykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEJpZ0ludCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCBjaGVja10sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBuZWdhdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBub25wb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbm5lZ2F0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICB2YWx1ZTogQmlnSW50KDApLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbXVsdGlwbGVPZih2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtdWx0aXBsZU9mXCIsXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldCBtaW5WYWx1ZSgpIHtcbiAgICAgICAgbGV0IG1pbiA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWluID09PSBudWxsIHx8IGNoLnZhbHVlID4gbWluKVxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWluO1xuICAgIH1cbiAgICBnZXQgbWF4VmFsdWUoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9XG59XG5ab2RCaWdJbnQuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kQmlnSW50KHtcbiAgICAgICAgY2hlY2tzOiBbXSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RCaWdJbnQsXG4gICAgICAgIGNvZXJjZTogcGFyYW1zPy5jb2VyY2UgPz8gZmFsc2UsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kQm9vbGVhbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5fZGVmLmNvZXJjZSkge1xuICAgICAgICAgICAgaW5wdXQuZGF0YSA9IEJvb2xlYW4oaW5wdXQuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5ib29sZWFuKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmJvb2xlYW4sXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuWm9kQm9vbGVhbi5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RCb29sZWFuKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RCb29sZWFuLFxuICAgICAgICBjb2VyY2U6IHBhcmFtcz8uY29lcmNlIHx8IGZhbHNlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZERhdGUgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RlZi5jb2VyY2UpIHtcbiAgICAgICAgICAgIGlucHV0LmRhdGEgPSBuZXcgRGF0ZShpbnB1dC5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLmRhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuZGF0ZSxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmIChOdW1iZXIuaXNOYU4oaW5wdXQuZGF0YS5nZXRUaW1lKCkpKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9kYXRlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdGF0dXMgPSBuZXcgUGFyc2VTdGF0dXMoKTtcbiAgICAgICAgbGV0IGN0eCA9IHVuZGVmaW5lZDtcbiAgICAgICAgZm9yIChjb25zdCBjaGVjayBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2sua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5kYXRhLmdldFRpbWUoKSA8IGNoZWNrLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuZGF0YS5nZXRUaW1lKCkgPiBjaGVjay52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdXRpbC5hc3NlcnROZXZlcihjaGVjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLnZhbHVlLFxuICAgICAgICAgICAgdmFsdWU6IG5ldyBEYXRlKGlucHV0LmRhdGEuZ2V0VGltZSgpKSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgX2FkZENoZWNrKGNoZWNrKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRGF0ZSh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCBjaGVja10sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtaW4obWluRGF0ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtaW5cIixcbiAgICAgICAgICAgIHZhbHVlOiBtaW5EYXRlLmdldFRpbWUoKSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1heChtYXhEYXRlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IG1heERhdGUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0IG1pbkRhdGUoKSB7XG4gICAgICAgIGxldCBtaW4gPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pbiA9PT0gbnVsbCB8fCBjaC52YWx1ZSA+IG1pbilcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pbiAhPSBudWxsID8gbmV3IERhdGUobWluKSA6IG51bGw7XG4gICAgfVxuICAgIGdldCBtYXhEYXRlKCkge1xuICAgICAgICBsZXQgbWF4ID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGlmIChtYXggPT09IG51bGwgfHwgY2gudmFsdWUgPCBtYXgpXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXggIT0gbnVsbCA/IG5ldyBEYXRlKG1heCkgOiBudWxsO1xuICAgIH1cbn1cblpvZERhdGUuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kRGF0ZSh7XG4gICAgICAgIGNoZWNrczogW10sXG4gICAgICAgIGNvZXJjZTogcGFyYW1zPy5jb2VyY2UgfHwgZmFsc2UsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRGF0ZSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RTeW1ib2wgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5zeW1ib2wpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuc3ltYm9sLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZFN5bWJvbC5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RTeW1ib2woe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFN5bWJvbCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RVbmRlZmluZWQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS51bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZFVuZGVmaW5lZC5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RVbmRlZmluZWQoe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFVuZGVmaW5lZCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2ROdWxsIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUubnVsbCkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5udWxsLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZE51bGwuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTnVsbCh7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTnVsbCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RBbnkgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgLy8gdG8gcHJldmVudCBpbnN0YW5jZXMgb2Ygb3RoZXIgY2xhc3NlcyBmcm9tIGV4dGVuZGluZyBab2RBbnkuIHRoaXMgY2F1c2VzIGlzc3VlcyB3aXRoIGNhdGNoYWxsIGluIFpvZE9iamVjdC5cbiAgICAgICAgdGhpcy5fYW55ID0gdHJ1ZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG59XG5ab2RBbnkuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kQW55KHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RBbnksXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kVW5rbm93biBleHRlbmRzIFpvZFR5cGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICAvLyByZXF1aXJlZFxuICAgICAgICB0aGlzLl91bmtub3duID0gdHJ1ZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG59XG5ab2RVbmtub3duLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFVua25vd24oe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFVua25vd24sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kTmV2ZXIgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5uZXZlcixcbiAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgIH1cbn1cblpvZE5ldmVyLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE5ldmVyKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2ROZXZlcixcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RWb2lkIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLnZvaWQsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuWm9kVm9pZC5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RWb2lkKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RWb2lkLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZEFycmF5IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4LCBzdGF0dXMgfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGRlZiA9IHRoaXMuX2RlZjtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLmFycmF5KSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmFycmF5LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZi5leGFjdExlbmd0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgdG9vQmlnID0gY3R4LmRhdGEubGVuZ3RoID4gZGVmLmV4YWN0TGVuZ3RoLnZhbHVlO1xuICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBjdHguZGF0YS5sZW5ndGggPCBkZWYuZXhhY3RMZW5ndGgudmFsdWU7XG4gICAgICAgICAgICBpZiAodG9vQmlnIHx8IHRvb1NtYWxsKSB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IHRvb0JpZyA/IFpvZElzc3VlQ29kZS50b29fYmlnIDogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgbWluaW11bTogKHRvb1NtYWxsID8gZGVmLmV4YWN0TGVuZ3RoLnZhbHVlIDogdW5kZWZpbmVkKSxcbiAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogKHRvb0JpZyA/IGRlZi5leGFjdExlbmd0aC52YWx1ZSA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGVmLmV4YWN0TGVuZ3RoLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZi5taW5MZW5ndGggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjdHguZGF0YS5sZW5ndGggPCBkZWYubWluTGVuZ3RoLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGRlZi5taW5MZW5ndGgudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5taW5MZW5ndGgubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVmLm1heExlbmd0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGN0eC5kYXRhLmxlbmd0aCA+IGRlZi5tYXhMZW5ndGgudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgIG1heGltdW06IGRlZi5tYXhMZW5ndGgudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5tYXhMZW5ndGgubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFsuLi5jdHguZGF0YV0ubWFwKChpdGVtLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZi50eXBlLl9wYXJzZUFzeW5jKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBpdGVtLCBjdHgucGF0aCwgaSkpO1xuICAgICAgICAgICAgfSkpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgcmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFsuLi5jdHguZGF0YV0ubWFwKChpdGVtLCBpKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZGVmLnR5cGUuX3BhcnNlU3luYyhuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgaXRlbSwgY3R4LnBhdGgsIGkpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgcmVzdWx0KTtcbiAgICB9XG4gICAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudHlwZTtcbiAgICB9XG4gICAgbWluKG1pbkxlbmd0aCwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEFycmF5KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIG1pbkxlbmd0aDogeyB2YWx1ZTogbWluTGVuZ3RoLCBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1heChtYXhMZW5ndGgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RBcnJheSh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBtYXhMZW5ndGg6IHsgdmFsdWU6IG1heExlbmd0aCwgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBsZW5ndGgobGVuLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQXJyYXkoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgZXhhY3RMZW5ndGg6IHsgdmFsdWU6IGxlbiwgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBub25lbXB0eShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbigxLCBtZXNzYWdlKTtcbiAgICB9XG59XG5ab2RBcnJheS5jcmVhdGUgPSAoc2NoZW1hLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEFycmF5KHtcbiAgICAgICAgdHlwZTogc2NoZW1hLFxuICAgICAgICBtaW5MZW5ndGg6IG51bGwsXG4gICAgICAgIG1heExlbmd0aDogbnVsbCxcbiAgICAgICAgZXhhY3RMZW5ndGg6IG51bGwsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQXJyYXksXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5mdW5jdGlvbiBkZWVwUGFydGlhbGlmeShzY2hlbWEpIHtcbiAgICBpZiAoc2NoZW1hIGluc3RhbmNlb2YgWm9kT2JqZWN0KSB7XG4gICAgICAgIGNvbnN0IG5ld1NoYXBlID0ge307XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNjaGVtYS5zaGFwZSkge1xuICAgICAgICAgICAgY29uc3QgZmllbGRTY2hlbWEgPSBzY2hlbWEuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIG5ld1NoYXBlW2tleV0gPSBab2RPcHRpb25hbC5jcmVhdGUoZGVlcFBhcnRpYWxpZnkoZmllbGRTY2hlbWEpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi5zY2hlbWEuX2RlZixcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiBuZXdTaGFwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHNjaGVtYSBpbnN0YW5jZW9mIFpvZEFycmF5KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQXJyYXkoe1xuICAgICAgICAgICAgLi4uc2NoZW1hLl9kZWYsXG4gICAgICAgICAgICB0eXBlOiBkZWVwUGFydGlhbGlmeShzY2hlbWEuZWxlbWVudCksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2RPcHRpb25hbCkge1xuICAgICAgICByZXR1cm4gWm9kT3B0aW9uYWwuY3JlYXRlKGRlZXBQYXJ0aWFsaWZ5KHNjaGVtYS51bndyYXAoKSkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2ROdWxsYWJsZSkge1xuICAgICAgICByZXR1cm4gWm9kTnVsbGFibGUuY3JlYXRlKGRlZXBQYXJ0aWFsaWZ5KHNjaGVtYS51bndyYXAoKSkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2RUdXBsZSkge1xuICAgICAgICByZXR1cm4gWm9kVHVwbGUuY3JlYXRlKHNjaGVtYS5pdGVtcy5tYXAoKGl0ZW0pID0+IGRlZXBQYXJ0aWFsaWZ5KGl0ZW0pKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gc2NoZW1hO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RPYmplY3QgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5fY2FjaGVkID0gbnVsbDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBkZXByZWNhdGVkIEluIG1vc3QgY2FzZXMsIHRoaXMgaXMgbm8gbG9uZ2VyIG5lZWRlZCAtIHVua25vd24gcHJvcGVydGllcyBhcmUgbm93IHNpbGVudGx5IHN0cmlwcGVkLlxuICAgICAgICAgKiBJZiB5b3Ugd2FudCB0byBwYXNzIHRocm91Z2ggdW5rbm93biBwcm9wZXJ0aWVzLCB1c2UgYC5wYXNzdGhyb3VnaCgpYCBpbnN0ZWFkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ub25zdHJpY3QgPSB0aGlzLnBhc3N0aHJvdWdoO1xuICAgICAgICAvLyBleHRlbmQ8XG4gICAgICAgIC8vICAgQXVnbWVudGF0aW9uIGV4dGVuZHMgWm9kUmF3U2hhcGUsXG4gICAgICAgIC8vICAgTmV3T3V0cHV0IGV4dGVuZHMgdXRpbC5mbGF0dGVuPHtcbiAgICAgICAgLy8gICAgIFtrIGluIGtleW9mIEF1Z21lbnRhdGlvbiB8IGtleW9mIE91dHB1dF06IGsgZXh0ZW5kcyBrZXlvZiBBdWdtZW50YXRpb25cbiAgICAgICAgLy8gICAgICAgPyBBdWdtZW50YXRpb25ba11bXCJfb3V0cHV0XCJdXG4gICAgICAgIC8vICAgICAgIDogayBleHRlbmRzIGtleW9mIE91dHB1dFxuICAgICAgICAvLyAgICAgICA/IE91dHB1dFtrXVxuICAgICAgICAvLyAgICAgICA6IG5ldmVyO1xuICAgICAgICAvLyAgIH0+LFxuICAgICAgICAvLyAgIE5ld0lucHV0IGV4dGVuZHMgdXRpbC5mbGF0dGVuPHtcbiAgICAgICAgLy8gICAgIFtrIGluIGtleW9mIEF1Z21lbnRhdGlvbiB8IGtleW9mIElucHV0XTogayBleHRlbmRzIGtleW9mIEF1Z21lbnRhdGlvblxuICAgICAgICAvLyAgICAgICA/IEF1Z21lbnRhdGlvbltrXVtcIl9pbnB1dFwiXVxuICAgICAgICAvLyAgICAgICA6IGsgZXh0ZW5kcyBrZXlvZiBJbnB1dFxuICAgICAgICAvLyAgICAgICA/IElucHV0W2tdXG4gICAgICAgIC8vICAgICAgIDogbmV2ZXI7XG4gICAgICAgIC8vICAgfT5cbiAgICAgICAgLy8gPihcbiAgICAgICAgLy8gICBhdWdtZW50YXRpb246IEF1Z21lbnRhdGlvblxuICAgICAgICAvLyApOiBab2RPYmplY3Q8XG4gICAgICAgIC8vICAgZXh0ZW5kU2hhcGU8VCwgQXVnbWVudGF0aW9uPixcbiAgICAgICAgLy8gICBVbmtub3duS2V5cyxcbiAgICAgICAgLy8gICBDYXRjaGFsbCxcbiAgICAgICAgLy8gICBOZXdPdXRwdXQsXG4gICAgICAgIC8vICAgTmV3SW5wdXRcbiAgICAgICAgLy8gPiB7XG4gICAgICAgIC8vICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAvLyAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAvLyAgICAgc2hhcGU6ICgpID0+ICh7XG4gICAgICAgIC8vICAgICAgIC4uLnRoaXMuX2RlZi5zaGFwZSgpLFxuICAgICAgICAvLyAgICAgICAuLi5hdWdtZW50YXRpb24sXG4gICAgICAgIC8vICAgICB9KSxcbiAgICAgICAgLy8gICB9KSBhcyBhbnk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBkZXByZWNhdGVkIFVzZSBgLmV4dGVuZGAgaW5zdGVhZFxuICAgICAgICAgKiAgKi9cbiAgICAgICAgdGhpcy5hdWdtZW50ID0gdGhpcy5leHRlbmQ7XG4gICAgfVxuICAgIF9nZXRDYWNoZWQoKSB7XG4gICAgICAgIGlmICh0aGlzLl9jYWNoZWQgIT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkO1xuICAgICAgICBjb25zdCBzaGFwZSA9IHRoaXMuX2RlZi5zaGFwZSgpO1xuICAgICAgICBjb25zdCBrZXlzID0gdXRpbC5vYmplY3RLZXlzKHNoYXBlKTtcbiAgICAgICAgdGhpcy5fY2FjaGVkID0geyBzaGFwZSwga2V5cyB9O1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5vYmplY3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUub2JqZWN0LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3QgeyBzaGFwZSwga2V5czogc2hhcGVLZXlzIH0gPSB0aGlzLl9nZXRDYWNoZWQoKTtcbiAgICAgICAgY29uc3QgZXh0cmFLZXlzID0gW107XG4gICAgICAgIGlmICghKHRoaXMuX2RlZi5jYXRjaGFsbCBpbnN0YW5jZW9mIFpvZE5ldmVyICYmIHRoaXMuX2RlZi51bmtub3duS2V5cyA9PT0gXCJzdHJpcFwiKSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gY3R4LmRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNoYXBlS2V5cy5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dHJhS2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhaXJzID0gW107XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHNoYXBlS2V5cykge1xuICAgICAgICAgICAgY29uc3Qga2V5VmFsaWRhdG9yID0gc2hhcGVba2V5XTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY3R4LmRhdGFba2V5XTtcbiAgICAgICAgICAgIHBhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgIGtleTogeyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGtleSB9LFxuICAgICAgICAgICAgICAgIHZhbHVlOiBrZXlWYWxpZGF0b3IuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCB2YWx1ZSwgY3R4LnBhdGgsIGtleSkpLFxuICAgICAgICAgICAgICAgIGFsd2F5c1NldDoga2V5IGluIGN0eC5kYXRhLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2RlZi5jYXRjaGFsbCBpbnN0YW5jZW9mIFpvZE5ldmVyKSB7XG4gICAgICAgICAgICBjb25zdCB1bmtub3duS2V5cyA9IHRoaXMuX2RlZi51bmtub3duS2V5cztcbiAgICAgICAgICAgIGlmICh1bmtub3duS2V5cyA9PT0gXCJwYXNzdGhyb3VnaFwiKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgZXh0cmFLZXlzKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiB7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZToga2V5IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogeyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGN0eC5kYXRhW2tleV0gfSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodW5rbm93bktleXMgPT09IFwic3RyaWN0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXh0cmFLZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudW5yZWNvZ25pemVkX2tleXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlzOiBleHRyYUtleXMsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh1bmtub3duS2V5cyA9PT0gXCJzdHJpcFwiKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludGVybmFsIFpvZE9iamVjdCBlcnJvcjogaW52YWxpZCB1bmtub3duS2V5cyB2YWx1ZS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHJ1biBjYXRjaGFsbCB2YWxpZGF0aW9uXG4gICAgICAgICAgICBjb25zdCBjYXRjaGFsbCA9IHRoaXMuX2RlZi5jYXRjaGFsbDtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGV4dHJhS2V5cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY3R4LmRhdGFba2V5XTtcbiAgICAgICAgICAgICAgICBwYWlycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiB7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZToga2V5IH0sXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjYXRjaGFsbC5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIHZhbHVlLCBjdHgucGF0aCwga2V5KSAvLywgY3R4LmNoaWxkKGtleSksIHZhbHVlLCBnZXRQYXJzZWRUeXBlKHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBhbHdheXNTZXQ6IGtleSBpbiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgICAgICAgLnRoZW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN5bmNQYWlycyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBwYWlyLmtleTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBhd2FpdCBwYWlyLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBzeW5jUGFpcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsd2F5c1NldDogcGFpci5hbHdheXNTZXQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gc3luY1BhaXJzO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbigoc3luY1BhaXJzKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFBhcnNlU3RhdHVzLm1lcmdlT2JqZWN0U3luYyhzdGF0dXMsIHN5bmNQYWlycyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZU9iamVjdFN5bmMoc3RhdHVzLCBwYWlycyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IHNoYXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnNoYXBlKCk7XG4gICAgfVxuICAgIHN0cmljdChtZXNzYWdlKSB7XG4gICAgICAgIGVycm9yVXRpbC5lcnJUb09iajtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgdW5rbm93bktleXM6IFwic3RyaWN0XCIsXG4gICAgICAgICAgICAuLi4obWVzc2FnZSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWFwOiAoaXNzdWUsIGN0eCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVmYXVsdEVycm9yID0gdGhpcy5fZGVmLmVycm9yTWFwPy4oaXNzdWUsIGN0eCkubWVzc2FnZSA/PyBjdHguZGVmYXVsdEVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzc3VlLmNvZGUgPT09IFwidW5yZWNvZ25pemVkX2tleXNcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkubWVzc2FnZSA/PyBkZWZhdWx0RXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGVmYXVsdEVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgOiB7fSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdHJpcCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgdW5rbm93bktleXM6IFwic3RyaXBcIixcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBhc3N0aHJvdWdoKCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICB1bmtub3duS2V5czogXCJwYXNzdGhyb3VnaFwiLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gY29uc3QgQXVnbWVudEZhY3RvcnkgPVxuICAgIC8vICAgPERlZiBleHRlbmRzIFpvZE9iamVjdERlZj4oZGVmOiBEZWYpID0+XG4gICAgLy8gICA8QXVnbWVudGF0aW9uIGV4dGVuZHMgWm9kUmF3U2hhcGU+KFxuICAgIC8vICAgICBhdWdtZW50YXRpb246IEF1Z21lbnRhdGlvblxuICAgIC8vICAgKTogWm9kT2JqZWN0PFxuICAgIC8vICAgICBleHRlbmRTaGFwZTxSZXR1cm5UeXBlPERlZltcInNoYXBlXCJdPiwgQXVnbWVudGF0aW9uPixcbiAgICAvLyAgICAgRGVmW1widW5rbm93bktleXNcIl0sXG4gICAgLy8gICAgIERlZltcImNhdGNoYWxsXCJdXG4gICAgLy8gICA+ID0+IHtcbiAgICAvLyAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgIC8vICAgICAgIC4uLmRlZixcbiAgICAvLyAgICAgICBzaGFwZTogKCkgPT4gKHtcbiAgICAvLyAgICAgICAgIC4uLmRlZi5zaGFwZSgpLFxuICAgIC8vICAgICAgICAgLi4uYXVnbWVudGF0aW9uLFxuICAgIC8vICAgICAgIH0pLFxuICAgIC8vICAgICB9KSBhcyBhbnk7XG4gICAgLy8gICB9O1xuICAgIGV4dGVuZChhdWdtZW50YXRpb24pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+ICh7XG4gICAgICAgICAgICAgICAgLi4udGhpcy5fZGVmLnNoYXBlKCksXG4gICAgICAgICAgICAgICAgLi4uYXVnbWVudGF0aW9uLFxuICAgICAgICAgICAgfSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcmlvciB0byB6b2RAMS4wLjEyIHRoZXJlIHdhcyBhIGJ1ZyBpbiB0aGVcbiAgICAgKiBpbmZlcnJlZCB0eXBlIG9mIG1lcmdlZCBvYmplY3RzLiBQbGVhc2VcbiAgICAgKiB1cGdyYWRlIGlmIHlvdSBhcmUgZXhwZXJpZW5jaW5nIGlzc3Vlcy5cbiAgICAgKi9cbiAgICBtZXJnZShtZXJnaW5nKSB7XG4gICAgICAgIGNvbnN0IG1lcmdlZCA9IG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgdW5rbm93bktleXM6IG1lcmdpbmcuX2RlZi51bmtub3duS2V5cyxcbiAgICAgICAgICAgIGNhdGNoYWxsOiBtZXJnaW5nLl9kZWYuY2F0Y2hhbGwsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi50aGlzLl9kZWYuc2hhcGUoKSxcbiAgICAgICAgICAgICAgICAuLi5tZXJnaW5nLl9kZWYuc2hhcGUoKSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbWVyZ2VkO1xuICAgIH1cbiAgICAvLyBtZXJnZTxcbiAgICAvLyAgIEluY29taW5nIGV4dGVuZHMgQW55Wm9kT2JqZWN0LFxuICAgIC8vICAgQXVnbWVudGF0aW9uIGV4dGVuZHMgSW5jb21pbmdbXCJzaGFwZVwiXSxcbiAgICAvLyAgIE5ld091dHB1dCBleHRlbmRzIHtcbiAgICAvLyAgICAgW2sgaW4ga2V5b2YgQXVnbWVudGF0aW9uIHwga2V5b2YgT3V0cHV0XTogayBleHRlbmRzIGtleW9mIEF1Z21lbnRhdGlvblxuICAgIC8vICAgICAgID8gQXVnbWVudGF0aW9uW2tdW1wiX291dHB1dFwiXVxuICAgIC8vICAgICAgIDogayBleHRlbmRzIGtleW9mIE91dHB1dFxuICAgIC8vICAgICAgID8gT3V0cHV0W2tdXG4gICAgLy8gICAgICAgOiBuZXZlcjtcbiAgICAvLyAgIH0sXG4gICAgLy8gICBOZXdJbnB1dCBleHRlbmRzIHtcbiAgICAvLyAgICAgW2sgaW4ga2V5b2YgQXVnbWVudGF0aW9uIHwga2V5b2YgSW5wdXRdOiBrIGV4dGVuZHMga2V5b2YgQXVnbWVudGF0aW9uXG4gICAgLy8gICAgICAgPyBBdWdtZW50YXRpb25ba11bXCJfaW5wdXRcIl1cbiAgICAvLyAgICAgICA6IGsgZXh0ZW5kcyBrZXlvZiBJbnB1dFxuICAgIC8vICAgICAgID8gSW5wdXRba11cbiAgICAvLyAgICAgICA6IG5ldmVyO1xuICAgIC8vICAgfVxuICAgIC8vID4oXG4gICAgLy8gICBtZXJnaW5nOiBJbmNvbWluZ1xuICAgIC8vICk6IFpvZE9iamVjdDxcbiAgICAvLyAgIGV4dGVuZFNoYXBlPFQsIFJldHVyblR5cGU8SW5jb21pbmdbXCJfZGVmXCJdW1wic2hhcGVcIl0+PixcbiAgICAvLyAgIEluY29taW5nW1wiX2RlZlwiXVtcInVua25vd25LZXlzXCJdLFxuICAgIC8vICAgSW5jb21pbmdbXCJfZGVmXCJdW1wiY2F0Y2hhbGxcIl0sXG4gICAgLy8gICBOZXdPdXRwdXQsXG4gICAgLy8gICBOZXdJbnB1dFxuICAgIC8vID4ge1xuICAgIC8vICAgY29uc3QgbWVyZ2VkOiBhbnkgPSBuZXcgWm9kT2JqZWN0KHtcbiAgICAvLyAgICAgdW5rbm93bktleXM6IG1lcmdpbmcuX2RlZi51bmtub3duS2V5cyxcbiAgICAvLyAgICAgY2F0Y2hhbGw6IG1lcmdpbmcuX2RlZi5jYXRjaGFsbCxcbiAgICAvLyAgICAgc2hhcGU6ICgpID0+XG4gICAgLy8gICAgICAgb2JqZWN0VXRpbC5tZXJnZVNoYXBlcyh0aGlzLl9kZWYuc2hhcGUoKSwgbWVyZ2luZy5fZGVmLnNoYXBlKCkpLFxuICAgIC8vICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9iamVjdCxcbiAgICAvLyAgIH0pIGFzIGFueTtcbiAgICAvLyAgIHJldHVybiBtZXJnZWQ7XG4gICAgLy8gfVxuICAgIHNldEtleShrZXksIHNjaGVtYSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdWdtZW50KHsgW2tleV06IHNjaGVtYSB9KTtcbiAgICB9XG4gICAgLy8gbWVyZ2U8SW5jb21pbmcgZXh0ZW5kcyBBbnlab2RPYmplY3Q+KFxuICAgIC8vICAgbWVyZ2luZzogSW5jb21pbmdcbiAgICAvLyApOiAvL1pvZE9iamVjdDxUICYgSW5jb21pbmdbXCJfc2hhcGVcIl0sIFVua25vd25LZXlzLCBDYXRjaGFsbD4gPSAobWVyZ2luZykgPT4ge1xuICAgIC8vIFpvZE9iamVjdDxcbiAgICAvLyAgIGV4dGVuZFNoYXBlPFQsIFJldHVyblR5cGU8SW5jb21pbmdbXCJfZGVmXCJdW1wic2hhcGVcIl0+PixcbiAgICAvLyAgIEluY29taW5nW1wiX2RlZlwiXVtcInVua25vd25LZXlzXCJdLFxuICAgIC8vICAgSW5jb21pbmdbXCJfZGVmXCJdW1wiY2F0Y2hhbGxcIl1cbiAgICAvLyA+IHtcbiAgICAvLyAgIC8vIGNvbnN0IG1lcmdlZFNoYXBlID0gb2JqZWN0VXRpbC5tZXJnZVNoYXBlcyhcbiAgICAvLyAgIC8vICAgdGhpcy5fZGVmLnNoYXBlKCksXG4gICAgLy8gICAvLyAgIG1lcmdpbmcuX2RlZi5zaGFwZSgpXG4gICAgLy8gICAvLyApO1xuICAgIC8vICAgY29uc3QgbWVyZ2VkOiBhbnkgPSBuZXcgWm9kT2JqZWN0KHtcbiAgICAvLyAgICAgdW5rbm93bktleXM6IG1lcmdpbmcuX2RlZi51bmtub3duS2V5cyxcbiAgICAvLyAgICAgY2F0Y2hhbGw6IG1lcmdpbmcuX2RlZi5jYXRjaGFsbCxcbiAgICAvLyAgICAgc2hhcGU6ICgpID0+XG4gICAgLy8gICAgICAgb2JqZWN0VXRpbC5tZXJnZVNoYXBlcyh0aGlzLl9kZWYuc2hhcGUoKSwgbWVyZ2luZy5fZGVmLnNoYXBlKCkpLFxuICAgIC8vICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9iamVjdCxcbiAgICAvLyAgIH0pIGFzIGFueTtcbiAgICAvLyAgIHJldHVybiBtZXJnZWQ7XG4gICAgLy8gfVxuICAgIGNhdGNoYWxsKGluZGV4KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNhdGNoYWxsOiBpbmRleCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBpY2sobWFzaykge1xuICAgICAgICBjb25zdCBzaGFwZSA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB1dGlsLm9iamVjdEtleXMobWFzaykpIHtcbiAgICAgICAgICAgIGlmIChtYXNrW2tleV0gJiYgdGhpcy5zaGFwZVtrZXldKSB7XG4gICAgICAgICAgICAgICAgc2hhcGVba2V5XSA9IHRoaXMuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gc2hhcGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBvbWl0KG1hc2spIHtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdXRpbC5vYmplY3RLZXlzKHRoaXMuc2hhcGUpKSB7XG4gICAgICAgICAgICBpZiAoIW1hc2tba2V5XSkge1xuICAgICAgICAgICAgICAgIHNoYXBlW2tleV0gPSB0aGlzLnNoYXBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+IHNoYXBlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICBkZWVwUGFydGlhbCgpIHtcbiAgICAgICAgcmV0dXJuIGRlZXBQYXJ0aWFsaWZ5KHRoaXMpO1xuICAgIH1cbiAgICBwYXJ0aWFsKG1hc2spIHtcbiAgICAgICAgY29uc3QgbmV3U2hhcGUgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdXRpbC5vYmplY3RLZXlzKHRoaXMuc2hhcGUpKSB7XG4gICAgICAgICAgICBjb25zdCBmaWVsZFNjaGVtYSA9IHRoaXMuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIGlmIChtYXNrICYmICFtYXNrW2tleV0pIHtcbiAgICAgICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gZmllbGRTY2hlbWE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gZmllbGRTY2hlbWEub3B0aW9uYWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gbmV3U2hhcGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXF1aXJlZChtYXNrKSB7XG4gICAgICAgIGNvbnN0IG5ld1NoYXBlID0ge307XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHV0aWwub2JqZWN0S2V5cyh0aGlzLnNoYXBlKSkge1xuICAgICAgICAgICAgaWYgKG1hc2sgJiYgIW1hc2tba2V5XSkge1xuICAgICAgICAgICAgICAgIG5ld1NoYXBlW2tleV0gPSB0aGlzLnNoYXBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWVsZFNjaGVtYSA9IHRoaXMuc2hhcGVba2V5XTtcbiAgICAgICAgICAgICAgICBsZXQgbmV3RmllbGQgPSBmaWVsZFNjaGVtYTtcbiAgICAgICAgICAgICAgICB3aGlsZSAobmV3RmllbGQgaW5zdGFuY2VvZiBab2RPcHRpb25hbCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdGaWVsZCA9IG5ld0ZpZWxkLl9kZWYuaW5uZXJUeXBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gbmV3RmllbGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+IG5ld1NoYXBlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAga2V5b2YoKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVab2RFbnVtKHV0aWwub2JqZWN0S2V5cyh0aGlzLnNoYXBlKSk7XG4gICAgfVxufVxuWm9kT2JqZWN0LmNyZWF0ZSA9IChzaGFwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICBzaGFwZTogKCkgPT4gc2hhcGUsXG4gICAgICAgIHVua25vd25LZXlzOiBcInN0cmlwXCIsXG4gICAgICAgIGNhdGNoYWxsOiBab2ROZXZlci5jcmVhdGUoKSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5ab2RPYmplY3Quc3RyaWN0Q3JlYXRlID0gKHNoYXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgIHNoYXBlOiAoKSA9PiBzaGFwZSxcbiAgICAgICAgdW5rbm93bktleXM6IFwic3RyaWN0XCIsXG4gICAgICAgIGNhdGNoYWxsOiBab2ROZXZlci5jcmVhdGUoKSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5ab2RPYmplY3QubGF6eWNyZWF0ZSA9IChzaGFwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICBzaGFwZSxcbiAgICAgICAgdW5rbm93bktleXM6IFwic3RyaXBcIixcbiAgICAgICAgY2F0Y2hhbGw6IFpvZE5ldmVyLmNyZWF0ZSgpLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9iamVjdCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RVbmlvbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX2RlZi5vcHRpb25zO1xuICAgICAgICBmdW5jdGlvbiBoYW5kbGVSZXN1bHRzKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIC8vIHJldHVybiBmaXJzdCBpc3N1ZS1mcmVlIHZhbGlkYXRpb24gaWYgaXQgZXhpc3RzXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5yZXN1bHQuc3RhdHVzID09PSBcInZhbGlkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQucmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCBpc3N1ZXMgZnJvbSBkaXJ0eSBvcHRpb25cbiAgICAgICAgICAgICAgICAgICAgY3R4LmNvbW1vbi5pc3N1ZXMucHVzaCguLi5yZXN1bHQuY3R4LmNvbW1vbi5pc3N1ZXMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LnJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZXR1cm4gaW52YWxpZFxuICAgICAgICAgICAgY29uc3QgdW5pb25FcnJvcnMgPSByZXN1bHRzLm1hcCgocmVzdWx0KSA9PiBuZXcgWm9kRXJyb3IocmVzdWx0LmN0eC5jb21tb24uaXNzdWVzKSk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbixcbiAgICAgICAgICAgICAgICB1bmlvbkVycm9ycyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChvcHRpb25zLm1hcChhc3luYyAob3B0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRDdHggPSB7XG4gICAgICAgICAgICAgICAgICAgIC4uLmN0eCxcbiAgICAgICAgICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5jdHguY29tbW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBudWxsLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBhd2FpdCBvcHRpb24uX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogY2hpbGRDdHgsXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBjdHg6IGNoaWxkQ3R4LFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSkudGhlbihoYW5kbGVSZXN1bHRzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBkaXJ0eSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGNvbnN0IGlzc3VlcyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2Ygb3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkQ3R4ID0ge1xuICAgICAgICAgICAgICAgICAgICAuLi5jdHgsXG4gICAgICAgICAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uY3R4LmNvbW1vbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogbnVsbCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG9wdGlvbi5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGNoaWxkQ3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBcInZhbGlkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiICYmICFkaXJ0eSkge1xuICAgICAgICAgICAgICAgICAgICBkaXJ0eSA9IHsgcmVzdWx0LCBjdHg6IGNoaWxkQ3R4IH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjaGlsZEN0eC5jb21tb24uaXNzdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBpc3N1ZXMucHVzaChjaGlsZEN0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGlydHkpIHtcbiAgICAgICAgICAgICAgICBjdHguY29tbW9uLmlzc3Vlcy5wdXNoKC4uLmRpcnR5LmN0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlydHkucmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdW5pb25FcnJvcnMgPSBpc3N1ZXMubWFwKChpc3N1ZXMpID0+IG5ldyBab2RFcnJvcihpc3N1ZXMpKTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3VuaW9uLFxuICAgICAgICAgICAgICAgIHVuaW9uRXJyb3JzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgb3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vcHRpb25zO1xuICAgIH1cbn1cblpvZFVuaW9uLmNyZWF0ZSA9ICh0eXBlcywgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RVbmlvbih7XG4gICAgICAgIG9wdGlvbnM6IHR5cGVzLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFVuaW9uLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vLy8vLy8vL1xuLy8vLy8vLy8vLyAgICAgIFpvZERpc2NyaW1pbmF0ZWRVbmlvbiAgICAgIC8vLy8vLy8vLy9cbi8vLy8vLy8vLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmNvbnN0IGdldERpc2NyaW1pbmF0b3IgPSAodHlwZSkgPT4ge1xuICAgIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTGF6eSkge1xuICAgICAgICByZXR1cm4gZ2V0RGlzY3JpbWluYXRvcih0eXBlLnNjaGVtYSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RFZmZlY3RzKSB7XG4gICAgICAgIHJldHVybiBnZXREaXNjcmltaW5hdG9yKHR5cGUuaW5uZXJUeXBlKCkpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTGl0ZXJhbCkge1xuICAgICAgICByZXR1cm4gW3R5cGUudmFsdWVdO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kRW51bSkge1xuICAgICAgICByZXR1cm4gdHlwZS5vcHRpb25zO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTmF0aXZlRW51bSkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgYmFuL2JhblxuICAgICAgICByZXR1cm4gdXRpbC5vYmplY3RWYWx1ZXModHlwZS5lbnVtKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZERlZmF1bHQpIHtcbiAgICAgICAgcmV0dXJuIGdldERpc2NyaW1pbmF0b3IodHlwZS5fZGVmLmlubmVyVHlwZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RVbmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIFt1bmRlZmluZWRdO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTnVsbCkge1xuICAgICAgICByZXR1cm4gW251bGxdO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kT3B0aW9uYWwpIHtcbiAgICAgICAgcmV0dXJuIFt1bmRlZmluZWQsIC4uLmdldERpc2NyaW1pbmF0b3IodHlwZS51bndyYXAoKSldO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTnVsbGFibGUpIHtcbiAgICAgICAgcmV0dXJuIFtudWxsLCAuLi5nZXREaXNjcmltaW5hdG9yKHR5cGUudW53cmFwKCkpXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZEJyYW5kZWQpIHtcbiAgICAgICAgcmV0dXJuIGdldERpc2NyaW1pbmF0b3IodHlwZS51bndyYXAoKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RSZWFkb25seSkge1xuICAgICAgICByZXR1cm4gZ2V0RGlzY3JpbWluYXRvcih0eXBlLnVud3JhcCgpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZENhdGNoKSB7XG4gICAgICAgIHJldHVybiBnZXREaXNjcmltaW5hdG9yKHR5cGUuX2RlZi5pbm5lclR5cGUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbn07XG5leHBvcnQgY2xhc3MgWm9kRGlzY3JpbWluYXRlZFVuaW9uIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUub2JqZWN0KSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm9iamVjdCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRpc2NyaW1pbmF0b3IgPSB0aGlzLmRpc2NyaW1pbmF0b3I7XG4gICAgICAgIGNvbnN0IGRpc2NyaW1pbmF0b3JWYWx1ZSA9IGN0eC5kYXRhW2Rpc2NyaW1pbmF0b3JdO1xuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLm9wdGlvbnNNYXAuZ2V0KGRpc2NyaW1pbmF0b3JWYWx1ZSk7XG4gICAgICAgIGlmICghb3B0aW9uKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbl9kaXNjcmltaW5hdG9yLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IEFycmF5LmZyb20odGhpcy5vcHRpb25zTWFwLmtleXMoKSksXG4gICAgICAgICAgICAgICAgcGF0aDogW2Rpc2NyaW1pbmF0b3JdLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb24uX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgZGlzY3JpbWluYXRvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5kaXNjcmltaW5hdG9yO1xuICAgIH1cbiAgICBnZXQgb3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vcHRpb25zO1xuICAgIH1cbiAgICBnZXQgb3B0aW9uc01hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vcHRpb25zTWFwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGUgY29uc3RydWN0b3Igb2YgdGhlIGRpc2NyaW1pbmF0ZWQgdW5pb24gc2NoZW1hLiBJdHMgYmVoYXZpb3VyIGlzIHZlcnkgc2ltaWxhciB0byB0aGF0IG9mIHRoZSBub3JtYWwgei51bmlvbigpIGNvbnN0cnVjdG9yLlxuICAgICAqIEhvd2V2ZXIsIGl0IG9ubHkgYWxsb3dzIGEgdW5pb24gb2Ygb2JqZWN0cywgYWxsIG9mIHdoaWNoIG5lZWQgdG8gc2hhcmUgYSBkaXNjcmltaW5hdG9yIHByb3BlcnR5LiBUaGlzIHByb3BlcnR5IG11c3RcbiAgICAgKiBoYXZlIGEgZGlmZmVyZW50IHZhbHVlIGZvciBlYWNoIG9iamVjdCBpbiB0aGUgdW5pb24uXG4gICAgICogQHBhcmFtIGRpc2NyaW1pbmF0b3IgdGhlIG5hbWUgb2YgdGhlIGRpc2NyaW1pbmF0b3IgcHJvcGVydHlcbiAgICAgKiBAcGFyYW0gdHlwZXMgYW4gYXJyYXkgb2Ygb2JqZWN0IHNjaGVtYXNcbiAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZShkaXNjcmltaW5hdG9yLCBvcHRpb25zLCBwYXJhbXMpIHtcbiAgICAgICAgLy8gR2V0IGFsbCB0aGUgdmFsaWQgZGlzY3JpbWluYXRvciB2YWx1ZXNcbiAgICAgICAgY29uc3Qgb3B0aW9uc01hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgLy8gdHJ5IHtcbiAgICAgICAgZm9yIChjb25zdCB0eXBlIG9mIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpc2NyaW1pbmF0b3JWYWx1ZXMgPSBnZXREaXNjcmltaW5hdG9yKHR5cGUuc2hhcGVbZGlzY3JpbWluYXRvcl0pO1xuICAgICAgICAgICAgaWYgKCFkaXNjcmltaW5hdG9yVmFsdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQSBkaXNjcmltaW5hdG9yIHZhbHVlIGZvciBrZXkgXFxgJHtkaXNjcmltaW5hdG9yfVxcYCBjb3VsZCBub3QgYmUgZXh0cmFjdGVkIGZyb20gYWxsIHNjaGVtYSBvcHRpb25zYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIGRpc2NyaW1pbmF0b3JWYWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9uc01hcC5oYXModmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRGlzY3JpbWluYXRvciBwcm9wZXJ0eSAke1N0cmluZyhkaXNjcmltaW5hdG9yKX0gaGFzIGR1cGxpY2F0ZSB2YWx1ZSAke1N0cmluZyh2YWx1ZSl9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9wdGlvbnNNYXAuc2V0KHZhbHVlLCB0eXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZERpc2NyaW1pbmF0ZWRVbmlvbih7XG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZERpc2NyaW1pbmF0ZWRVbmlvbixcbiAgICAgICAgICAgIGRpc2NyaW1pbmF0b3IsXG4gICAgICAgICAgICBvcHRpb25zLFxuICAgICAgICAgICAgb3B0aW9uc01hcCxcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZnVuY3Rpb24gbWVyZ2VWYWx1ZXMoYSwgYikge1xuICAgIGNvbnN0IGFUeXBlID0gZ2V0UGFyc2VkVHlwZShhKTtcbiAgICBjb25zdCBiVHlwZSA9IGdldFBhcnNlZFR5cGUoYik7XG4gICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIGRhdGE6IGEgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYVR5cGUgPT09IFpvZFBhcnNlZFR5cGUub2JqZWN0ICYmIGJUeXBlID09PSBab2RQYXJzZWRUeXBlLm9iamVjdCkge1xuICAgICAgICBjb25zdCBiS2V5cyA9IHV0aWwub2JqZWN0S2V5cyhiKTtcbiAgICAgICAgY29uc3Qgc2hhcmVkS2V5cyA9IHV0aWwub2JqZWN0S2V5cyhhKS5maWx0ZXIoKGtleSkgPT4gYktleXMuaW5kZXhPZihrZXkpICE9PSAtMSk7XG4gICAgICAgIGNvbnN0IG5ld09iaiA9IHsgLi4uYSwgLi4uYiB9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBzaGFyZWRLZXlzKSB7XG4gICAgICAgICAgICBjb25zdCBzaGFyZWRWYWx1ZSA9IG1lcmdlVmFsdWVzKGFba2V5XSwgYltrZXldKTtcbiAgICAgICAgICAgIGlmICghc2hhcmVkVmFsdWUudmFsaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld09ialtrZXldID0gc2hhcmVkVmFsdWUuZGF0YTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgZGF0YTogbmV3T2JqIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKGFUeXBlID09PSBab2RQYXJzZWRUeXBlLmFycmF5ICYmIGJUeXBlID09PSBab2RQYXJzZWRUeXBlLmFycmF5KSB7XG4gICAgICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ld0FycmF5ID0gW107XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgaXRlbUEgPSBhW2luZGV4XTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1CID0gYltpbmRleF07XG4gICAgICAgICAgICBjb25zdCBzaGFyZWRWYWx1ZSA9IG1lcmdlVmFsdWVzKGl0ZW1BLCBpdGVtQik7XG4gICAgICAgICAgICBpZiAoIXNoYXJlZFZhbHVlLnZhbGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdBcnJheS5wdXNoKHNoYXJlZFZhbHVlLmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBuZXdBcnJheSB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChhVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS5kYXRlICYmIGJUeXBlID09PSBab2RQYXJzZWRUeXBlLmRhdGUgJiYgK2EgPT09ICtiKSB7XG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBhIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UgfTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgWm9kSW50ZXJzZWN0aW9uIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGhhbmRsZVBhcnNlZCA9IChwYXJzZWRMZWZ0LCBwYXJzZWRSaWdodCkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzQWJvcnRlZChwYXJzZWRMZWZ0KSB8fCBpc0Fib3J0ZWQocGFyc2VkUmlnaHQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtZXJnZWQgPSBtZXJnZVZhbHVlcyhwYXJzZWRMZWZ0LnZhbHVlLCBwYXJzZWRSaWdodC52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoIW1lcmdlZC52YWxpZCkge1xuICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9pbnRlcnNlY3Rpb25fdHlwZXMsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNEaXJ0eShwYXJzZWRMZWZ0KSB8fCBpc0RpcnR5KHBhcnNlZFJpZ2h0KSkge1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBtZXJnZWQuZGF0YSB9O1xuICAgICAgICB9O1xuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWYubGVmdC5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgdGhpcy5fZGVmLnJpZ2h0Ll9wYXJzZUFzeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0pLnRoZW4oKFtsZWZ0LCByaWdodF0pID0+IGhhbmRsZVBhcnNlZChsZWZ0LCByaWdodCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZVBhcnNlZCh0aGlzLl9kZWYubGVmdC5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgIH0pLCB0aGlzLl9kZWYucmlnaHQuX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5ab2RJbnRlcnNlY3Rpb24uY3JlYXRlID0gKGxlZnQsIHJpZ2h0LCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEludGVyc2VjdGlvbih7XG4gICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgIHJpZ2h0OiByaWdodCxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RJbnRlcnNlY3Rpb24sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG4vLyB0eXBlIFpvZFR1cGxlSXRlbXMgPSBbWm9kVHlwZUFueSwgLi4uWm9kVHlwZUFueVtdXTtcbmV4cG9ydCBjbGFzcyBab2RUdXBsZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuYXJyYXkpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuYXJyYXksXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmRhdGEubGVuZ3RoIDwgdGhpcy5fZGVmLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICBtaW5pbXVtOiB0aGlzLl9kZWYuaXRlbXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN0ID0gdGhpcy5fZGVmLnJlc3Q7XG4gICAgICAgIGlmICghcmVzdCAmJiBjdHguZGF0YS5sZW5ndGggPiB0aGlzLl9kZWYuaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICBtYXhpbXVtOiB0aGlzLl9kZWYuaXRlbXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpdGVtcyA9IFsuLi5jdHguZGF0YV1cbiAgICAgICAgICAgIC5tYXAoKGl0ZW0sIGl0ZW1JbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2NoZW1hID0gdGhpcy5fZGVmLml0ZW1zW2l0ZW1JbmRleF0gfHwgdGhpcy5fZGVmLnJlc3Q7XG4gICAgICAgICAgICBpZiAoIXNjaGVtYSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBzY2hlbWEuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBpdGVtLCBjdHgucGF0aCwgaXRlbUluZGV4KSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuZmlsdGVyKCh4KSA9PiAhIXgpOyAvLyBmaWx0ZXIgbnVsbHNcbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChpdGVtcykudGhlbigocmVzdWx0cykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgcmVzdWx0cyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgaXRlbXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBpdGVtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pdGVtcztcbiAgICB9XG4gICAgcmVzdChyZXN0KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kVHVwbGUoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgcmVzdCxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuWm9kVHVwbGUuY3JlYXRlID0gKHNjaGVtYXMsIHBhcmFtcykgPT4ge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShzY2hlbWFzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGFuIGFycmF5IG9mIHNjaGVtYXMgdG8gei50dXBsZShbIC4uLiBdKVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBab2RUdXBsZSh7XG4gICAgICAgIGl0ZW1zOiBzY2hlbWFzLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFR1cGxlLFxuICAgICAgICByZXN0OiBudWxsLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZFJlY29yZCBleHRlbmRzIFpvZFR5cGUge1xuICAgIGdldCBrZXlTY2hlbWEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYua2V5VHlwZTtcbiAgICB9XG4gICAgZ2V0IHZhbHVlU2NoZW1hKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5vYmplY3QpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUub2JqZWN0LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFpcnMgPSBbXTtcbiAgICAgICAgY29uc3Qga2V5VHlwZSA9IHRoaXMuX2RlZi5rZXlUeXBlO1xuICAgICAgICBjb25zdCB2YWx1ZVR5cGUgPSB0aGlzLl9kZWYudmFsdWVUeXBlO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBjdHguZGF0YSkge1xuICAgICAgICAgICAgcGFpcnMucHVzaCh7XG4gICAgICAgICAgICAgICAga2V5OiBrZXlUeXBlLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwga2V5LCBjdHgucGF0aCwga2V5KSksXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlVHlwZS5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIGN0eC5kYXRhW2tleV0sIGN0eC5wYXRoLCBrZXkpKSxcbiAgICAgICAgICAgICAgICBhbHdheXNTZXQ6IGtleSBpbiBjdHguZGF0YSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VPYmplY3RBc3luYyhzdGF0dXMsIHBhaXJzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZU9iamVjdFN5bmMoc3RhdHVzLCBwYWlycyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWVUeXBlO1xuICAgIH1cbiAgICBzdGF0aWMgY3JlYXRlKGZpcnN0LCBzZWNvbmQsIHRoaXJkKSB7XG4gICAgICAgIGlmIChzZWNvbmQgaW5zdGFuY2VvZiBab2RUeXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFpvZFJlY29yZCh7XG4gICAgICAgICAgICAgICAga2V5VHlwZTogZmlyc3QsXG4gICAgICAgICAgICAgICAgdmFsdWVUeXBlOiBzZWNvbmQsXG4gICAgICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RSZWNvcmQsXG4gICAgICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyh0aGlyZCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZFJlY29yZCh7XG4gICAgICAgICAgICBrZXlUeXBlOiBab2RTdHJpbmcuY3JlYXRlKCksXG4gICAgICAgICAgICB2YWx1ZVR5cGU6IGZpcnN0LFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RSZWNvcmQsXG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHNlY29uZCksXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RNYXAgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBnZXQga2V5U2NoZW1hKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmtleVR5cGU7XG4gICAgfVxuICAgIGdldCB2YWx1ZVNjaGVtYSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi52YWx1ZVR5cGU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUubWFwKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm1hcCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleVR5cGUgPSB0aGlzLl9kZWYua2V5VHlwZTtcbiAgICAgICAgY29uc3QgdmFsdWVUeXBlID0gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICAgICAgY29uc3QgcGFpcnMgPSBbLi4uY3R4LmRhdGEuZW50cmllcygpXS5tYXAoKFtrZXksIHZhbHVlXSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAga2V5OiBrZXlUeXBlLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwga2V5LCBjdHgucGF0aCwgW2luZGV4LCBcImtleVwiXSkpLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVR5cGUuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCB2YWx1ZSwgY3R4LnBhdGgsIFtpbmRleCwgXCJ2YWx1ZVwiXSkpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICBjb25zdCBmaW5hbE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgcGFpci5rZXk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgcGFpci52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiYWJvcnRlZFwiIHx8IHZhbHVlLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkuc3RhdHVzID09PSBcImRpcnR5XCIgfHwgdmFsdWUuc3RhdHVzID09PSBcImRpcnR5XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsTWFwLnNldChrZXkudmFsdWUsIHZhbHVlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBmaW5hbE1hcCB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBmaW5hbE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IHBhaXIua2V5O1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFpci52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIgfHwgdmFsdWUuc3RhdHVzID09PSBcImFib3J0ZWRcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiZGlydHlcIiB8fCB2YWx1ZS5zdGF0dXMgPT09IFwiZGlydHlcIikge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxNYXAuc2V0KGtleS52YWx1ZSwgdmFsdWUudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBmaW5hbE1hcCB9O1xuICAgICAgICB9XG4gICAgfVxufVxuWm9kTWFwLmNyZWF0ZSA9IChrZXlUeXBlLCB2YWx1ZVR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTWFwKHtcbiAgICAgICAgdmFsdWVUeXBlLFxuICAgICAgICBrZXlUeXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE1hcCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RTZXQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLnNldCkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5zZXQsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZWYgPSB0aGlzLl9kZWY7XG4gICAgICAgIGlmIChkZWYubWluU2l6ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGN0eC5kYXRhLnNpemUgPCBkZWYubWluU2l6ZS52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBkZWYubWluU2l6ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzZXRcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5taW5TaXplLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZi5tYXhTaXplICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoY3R4LmRhdGEuc2l6ZSA+IGRlZi5tYXhTaXplLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBkZWYubWF4U2l6ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzZXRcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5tYXhTaXplLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWVUeXBlID0gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICAgICAgZnVuY3Rpb24gZmluYWxpemVTZXQoZWxlbWVudHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZFNldCA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICBwYXJzZWRTZXQuYWRkKGVsZW1lbnQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBwYXJzZWRTZXQgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IFsuLi5jdHguZGF0YS52YWx1ZXMoKV0ubWFwKChpdGVtLCBpKSA9PiB2YWx1ZVR5cGUuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBpdGVtLCBjdHgucGF0aCwgaSkpKTtcbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChlbGVtZW50cykudGhlbigoZWxlbWVudHMpID0+IGZpbmFsaXplU2V0KGVsZW1lbnRzKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmluYWxpemVTZXQoZWxlbWVudHMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIG1pbihtaW5TaXplLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kU2V0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIG1pblNpemU6IHsgdmFsdWU6IG1pblNpemUsIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbWF4KG1heFNpemUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTZXQoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgbWF4U2l6ZTogeyB2YWx1ZTogbWF4U2l6ZSwgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzaXplKHNpemUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluKHNpemUsIG1lc3NhZ2UpLm1heChzaXplLCBtZXNzYWdlKTtcbiAgICB9XG4gICAgbm9uZW1wdHkobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5taW4oMSwgbWVzc2FnZSk7XG4gICAgfVxufVxuWm9kU2V0LmNyZWF0ZSA9ICh2YWx1ZVR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kU2V0KHtcbiAgICAgICAgdmFsdWVUeXBlLFxuICAgICAgICBtaW5TaXplOiBudWxsLFxuICAgICAgICBtYXhTaXplOiBudWxsLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFNldCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RGdW5jdGlvbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnZhbGlkYXRlID0gdGhpcy5pbXBsZW1lbnQ7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLmZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gbWFrZUFyZ3NJc3N1ZShhcmdzLCBlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIG1ha2VJc3N1ZSh7XG4gICAgICAgICAgICAgICAgZGF0YTogYXJncyxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBlcnJvck1hcHM6IFtjdHguY29tbW9uLmNvbnRleHR1YWxFcnJvck1hcCwgY3R4LnNjaGVtYUVycm9yTWFwLCBnZXRFcnJvck1hcCgpLCBkZWZhdWx0RXJyb3JNYXBdLmZpbHRlcigoeCkgPT4gISF4KSxcbiAgICAgICAgICAgICAgICBpc3N1ZURhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfYXJndW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHNFcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VSZXR1cm5zSXNzdWUocmV0dXJucywgZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBtYWtlSXNzdWUoe1xuICAgICAgICAgICAgICAgIGRhdGE6IHJldHVybnMsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgZXJyb3JNYXBzOiBbY3R4LmNvbW1vbi5jb250ZXh0dWFsRXJyb3JNYXAsIGN0eC5zY2hlbWFFcnJvck1hcCwgZ2V0RXJyb3JNYXAoKSwgZGVmYXVsdEVycm9yTWFwXS5maWx0ZXIoKHgpID0+ICEheCksXG4gICAgICAgICAgICAgICAgaXNzdWVEYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3JldHVybl90eXBlLFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5UeXBlRXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJhbXMgPSB7IGVycm9yTWFwOiBjdHguY29tbW9uLmNvbnRleHR1YWxFcnJvck1hcCB9O1xuICAgICAgICBjb25zdCBmbiA9IGN0eC5kYXRhO1xuICAgICAgICBpZiAodGhpcy5fZGVmLnJldHVybnMgaW5zdGFuY2VvZiBab2RQcm9taXNlKSB7XG4gICAgICAgICAgICAvLyBXb3VsZCBsb3ZlIGEgd2F5IHRvIGF2b2lkIGRpc2FibGluZyB0aGlzIHJ1bGUsIGJ1dCB3ZSBuZWVkXG4gICAgICAgICAgICAvLyBhbiBhbGlhcyAodXNpbmcgYW4gYXJyb3cgZnVuY3Rpb24gd2FzIHdoYXQgY2F1c2VkIDI2NTEpLlxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG4gICAgICAgICAgICBjb25zdCBtZSA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4gT0soYXN5bmMgZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBab2RFcnJvcihbXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkQXJncyA9IGF3YWl0IG1lLl9kZWYuYXJncy5wYXJzZUFzeW5jKGFyZ3MsIHBhcmFtcykuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IuYWRkSXNzdWUobWFrZUFyZ3NJc3N1ZShhcmdzLCBlKSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFJlZmxlY3QuYXBwbHkoZm4sIHRoaXMsIHBhcnNlZEFyZ3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZFJldHVybnMgPSBhd2FpdCBtZS5fZGVmLnJldHVybnMuX2RlZi50eXBlXG4gICAgICAgICAgICAgICAgICAgIC5wYXJzZUFzeW5jKHJlc3VsdCwgcGFyYW1zKVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IuYWRkSXNzdWUobWFrZVJldHVybnNJc3N1ZShyZXN1bHQsIGUpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlZFJldHVybnM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFdvdWxkIGxvdmUgYSB3YXkgdG8gYXZvaWQgZGlzYWJsaW5nIHRoaXMgcnVsZSwgYnV0IHdlIG5lZWRcbiAgICAgICAgICAgIC8vIGFuIGFsaWFzICh1c2luZyBhbiBhcnJvdyBmdW5jdGlvbiB3YXMgd2hhdCBjYXVzZWQgMjY1MSkuXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcbiAgICAgICAgICAgIGNvbnN0IG1lID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiBPSyhmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZEFyZ3MgPSBtZS5fZGVmLmFyZ3Muc2FmZVBhcnNlKGFyZ3MsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJzZWRBcmdzLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFpvZEVycm9yKFttYWtlQXJnc0lzc3VlKGFyZ3MsIHBhcnNlZEFyZ3MuZXJyb3IpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IFJlZmxlY3QuYXBwbHkoZm4sIHRoaXMsIHBhcnNlZEFyZ3MuZGF0YSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkUmV0dXJucyA9IG1lLl9kZWYucmV0dXJucy5zYWZlUGFyc2UocmVzdWx0LCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIGlmICghcGFyc2VkUmV0dXJucy5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBab2RFcnJvcihbbWFrZVJldHVybnNJc3N1ZShyZXN1bHQsIHBhcnNlZFJldHVybnMuZXJyb3IpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZWRSZXR1cm5zLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwYXJhbWV0ZXJzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmFyZ3M7XG4gICAgfVxuICAgIHJldHVyblR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYucmV0dXJucztcbiAgICB9XG4gICAgYXJncyguLi5pdGVtcykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEZ1bmN0aW9uKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGFyZ3M6IFpvZFR1cGxlLmNyZWF0ZShpdGVtcykucmVzdChab2RVbmtub3duLmNyZWF0ZSgpKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybnMocmV0dXJuVHlwZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEZ1bmN0aW9uKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHJldHVybnM6IHJldHVyblR5cGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbXBsZW1lbnQoZnVuYykge1xuICAgICAgICBjb25zdCB2YWxpZGF0ZWRGdW5jID0gdGhpcy5wYXJzZShmdW5jKTtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlZEZ1bmM7XG4gICAgfVxuICAgIHN0cmljdEltcGxlbWVudChmdW5jKSB7XG4gICAgICAgIGNvbnN0IHZhbGlkYXRlZEZ1bmMgPSB0aGlzLnBhcnNlKGZ1bmMpO1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVkRnVuYztcbiAgICB9XG4gICAgc3RhdGljIGNyZWF0ZShhcmdzLCByZXR1cm5zLCBwYXJhbXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RGdW5jdGlvbih7XG4gICAgICAgICAgICBhcmdzOiAoYXJncyA/IGFyZ3MgOiBab2RUdXBsZS5jcmVhdGUoW10pLnJlc3QoWm9kVW5rbm93bi5jcmVhdGUoKSkpLFxuICAgICAgICAgICAgcmV0dXJuczogcmV0dXJucyB8fCBab2RVbmtub3duLmNyZWF0ZSgpLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RGdW5jdGlvbixcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFpvZExhenkgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBnZXQgc2NoZW1hKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmdldHRlcigpO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGxhenlTY2hlbWEgPSB0aGlzLl9kZWYuZ2V0dGVyKCk7XG4gICAgICAgIHJldHVybiBsYXp5U2NoZW1hLl9wYXJzZSh7IGRhdGE6IGN0eC5kYXRhLCBwYXRoOiBjdHgucGF0aCwgcGFyZW50OiBjdHggfSk7XG4gICAgfVxufVxuWm9kTGF6eS5jcmVhdGUgPSAoZ2V0dGVyLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZExhenkoe1xuICAgICAgICBnZXR0ZXI6IGdldHRlcixcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RMYXp5LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZExpdGVyYWwgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgaWYgKGlucHV0LmRhdGEgIT09IHRoaXMuX2RlZi52YWx1ZSkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX2xpdGVyYWwsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IHRoaXMuX2RlZi52YWx1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlOiBpbnB1dC5kYXRhIH07XG4gICAgfVxuICAgIGdldCB2YWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi52YWx1ZTtcbiAgICB9XG59XG5ab2RMaXRlcmFsLmNyZWF0ZSA9ICh2YWx1ZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RMaXRlcmFsKHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZExpdGVyYWwsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5mdW5jdGlvbiBjcmVhdGVab2RFbnVtKHZhbHVlcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBab2RFbnVtKHtcbiAgICAgICAgdmFsdWVzLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVudW0sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbmV4cG9ydCBjbGFzcyBab2RFbnVtIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQuZGF0YSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWRWYWx1ZXMgPSB0aGlzLl9kZWYudmFsdWVzO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IHV0aWwuam9pblZhbHVlcyhleHBlY3RlZFZhbHVlcyksXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fY2FjaGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlID0gbmV3IFNldCh0aGlzLl9kZWYudmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlLmhhcyhpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWRWYWx1ZXMgPSB0aGlzLl9kZWYudmFsdWVzO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX2VudW1fdmFsdWUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogZXhwZWN0ZWRWYWx1ZXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG4gICAgZ2V0IG9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWVzO1xuICAgIH1cbiAgICBnZXQgZW51bSgpIHtcbiAgICAgICAgY29uc3QgZW51bVZhbHVlcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHZhbCBvZiB0aGlzLl9kZWYudmFsdWVzKSB7XG4gICAgICAgICAgICBlbnVtVmFsdWVzW3ZhbF0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVudW1WYWx1ZXM7XG4gICAgfVxuICAgIGdldCBWYWx1ZXMoKSB7XG4gICAgICAgIGNvbnN0IGVudW1WYWx1ZXMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCB2YWwgb2YgdGhpcy5fZGVmLnZhbHVlcykge1xuICAgICAgICAgICAgZW51bVZhbHVlc1t2YWxdID0gdmFsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbnVtVmFsdWVzO1xuICAgIH1cbiAgICBnZXQgRW51bSgpIHtcbiAgICAgICAgY29uc3QgZW51bVZhbHVlcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHZhbCBvZiB0aGlzLl9kZWYudmFsdWVzKSB7XG4gICAgICAgICAgICBlbnVtVmFsdWVzW3ZhbF0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVudW1WYWx1ZXM7XG4gICAgfVxuICAgIGV4dHJhY3QodmFsdWVzLCBuZXdEZWYgPSB0aGlzLl9kZWYpIHtcbiAgICAgICAgcmV0dXJuIFpvZEVudW0uY3JlYXRlKHZhbHVlcywge1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgLi4ubmV3RGVmLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZXhjbHVkZSh2YWx1ZXMsIG5ld0RlZiA9IHRoaXMuX2RlZikge1xuICAgICAgICByZXR1cm4gWm9kRW51bS5jcmVhdGUodGhpcy5vcHRpb25zLmZpbHRlcigob3B0KSA9PiAhdmFsdWVzLmluY2x1ZGVzKG9wdCkpLCB7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICAuLi5uZXdEZWYsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblpvZEVudW0uY3JlYXRlID0gY3JlYXRlWm9kRW51bTtcbmV4cG9ydCBjbGFzcyBab2ROYXRpdmVFbnVtIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IG5hdGl2ZUVudW1WYWx1ZXMgPSB1dGlsLmdldFZhbGlkRW51bVZhbHVlcyh0aGlzLl9kZWYudmFsdWVzKTtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuc3RyaW5nICYmIGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLm51bWJlcikge1xuICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWRWYWx1ZXMgPSB1dGlsLm9iamVjdFZhbHVlcyhuYXRpdmVFbnVtVmFsdWVzKTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiB1dGlsLmpvaW5WYWx1ZXMoZXhwZWN0ZWRWYWx1ZXMpLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZSA9IG5ldyBTZXQodXRpbC5nZXRWYWxpZEVudW1WYWx1ZXModGhpcy5fZGVmLnZhbHVlcykpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fY2FjaGUuaGFzKGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICBjb25zdCBleHBlY3RlZFZhbHVlcyA9IHV0aWwub2JqZWN0VmFsdWVzKG5hdGl2ZUVudW1WYWx1ZXMpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX2VudW1fdmFsdWUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogZXhwZWN0ZWRWYWx1ZXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG4gICAgZ2V0IGVudW0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWVzO1xuICAgIH1cbn1cblpvZE5hdGl2ZUVudW0uY3JlYXRlID0gKHZhbHVlcywgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2ROYXRpdmVFbnVtKHtcbiAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTmF0aXZlRW51bSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RQcm9taXNlIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgdW53cmFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnR5cGU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLnByb21pc2UgJiYgY3R4LmNvbW1vbi5hc3luYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUucHJvbWlzZSxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb21pc2lmaWVkID0gY3R4LnBhcnNlZFR5cGUgPT09IFpvZFBhcnNlZFR5cGUucHJvbWlzZSA/IGN0eC5kYXRhIDogUHJvbWlzZS5yZXNvbHZlKGN0eC5kYXRhKTtcbiAgICAgICAgcmV0dXJuIE9LKHByb21pc2lmaWVkLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kZWYudHlwZS5wYXJzZUFzeW5jKGRhdGEsIHtcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBlcnJvck1hcDogY3R4LmNvbW1vbi5jb250ZXh0dWFsRXJyb3JNYXAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkpO1xuICAgIH1cbn1cblpvZFByb21pc2UuY3JlYXRlID0gKHNjaGVtYSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RQcm9taXNlKHtcbiAgICAgICAgdHlwZTogc2NoZW1hLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFByb21pc2UsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kRWZmZWN0cyBleHRlbmRzIFpvZFR5cGUge1xuICAgIGlubmVyVHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zY2hlbWE7XG4gICAgfVxuICAgIHNvdXJjZVR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuc2NoZW1hLl9kZWYudHlwZU5hbWUgPT09IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFZmZlY3RzXG4gICAgICAgICAgICA/IHRoaXMuX2RlZi5zY2hlbWEuc291cmNlVHlwZSgpXG4gICAgICAgICAgICA6IHRoaXMuX2RlZi5zY2hlbWE7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCBlZmZlY3QgPSB0aGlzLl9kZWYuZWZmZWN0IHx8IG51bGw7XG4gICAgICAgIGNvbnN0IGNoZWNrQ3R4ID0ge1xuICAgICAgICAgICAgYWRkSXNzdWU6IChhcmcpID0+IHtcbiAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIGFyZyk7XG4gICAgICAgICAgICAgICAgaWYgKGFyZy5mYXRhbCkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXQgcGF0aCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3R4LnBhdGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICBjaGVja0N0eC5hZGRJc3N1ZSA9IGNoZWNrQ3R4LmFkZElzc3VlLmJpbmQoY2hlY2tDdHgpO1xuICAgICAgICBpZiAoZWZmZWN0LnR5cGUgPT09IFwicHJlcHJvY2Vzc1wiKSB7XG4gICAgICAgICAgICBjb25zdCBwcm9jZXNzZWQgPSBlZmZlY3QudHJhbnNmb3JtKGN0eC5kYXRhLCBjaGVja0N0eCk7XG4gICAgICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocHJvY2Vzc2VkKS50aGVuKGFzeW5jIChwcm9jZXNzZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cy52YWx1ZSA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fZGVmLnNjaGVtYS5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBwcm9jZXNzZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gRElSVFkocmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cy52YWx1ZSA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERJUlRZKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzLnZhbHVlID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fZGVmLnNjaGVtYS5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcHJvY2Vzc2VkLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRElSVFkocmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzLnZhbHVlID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBESVJUWShyZXN1bHQudmFsdWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVmZmVjdC50eXBlID09PSBcInJlZmluZW1lbnRcIikge1xuICAgICAgICAgICAgY29uc3QgZXhlY3V0ZVJlZmluZW1lbnQgPSAoYWNjKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZWZmZWN0LnJlZmluZW1lbnQoYWNjLCBjaGVja0N0eCk7XG4gICAgICAgICAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luYyByZWZpbmVtZW50IGVuY291bnRlcmVkIGR1cmluZyBzeW5jaHJvbm91cyBwYXJzZSBvcGVyYXRpb24uIFVzZSAucGFyc2VBc3luYyBpbnN0ZWFkLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbm5lciA9IHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGlubmVyLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgIGlmIChpbm5lci5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHZhbHVlIGlzIGlnbm9yZWRcbiAgICAgICAgICAgICAgICBleGVjdXRlUmVmaW5lbWVudChpbm5lci52YWx1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBpbm5lci52YWx1ZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlQXN5bmMoeyBkYXRhOiBjdHguZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pLnRoZW4oKGlubmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbm5lci5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbm5lci5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXhlY3V0ZVJlZmluZW1lbnQoaW5uZXIudmFsdWUpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBpbm5lci52YWx1ZSB9O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZWZmZWN0LnR5cGUgPT09IFwidHJhbnNmb3JtXCIpIHtcbiAgICAgICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhc2UgPSB0aGlzLl9kZWYuc2NoZW1hLl9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZChiYXNlKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZWZmZWN0LnRyYW5zZm9ybShiYXNlLnZhbHVlLCBjaGVja0N0eCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3luY2hyb25vdXMgdHJhbnNmb3JtIGVuY291bnRlcmVkIGR1cmluZyBzeW5jaHJvbm91cyBwYXJzZSBvcGVyYXRpb24uIFVzZSAucGFyc2VBc3luYyBpbnN0ZWFkLmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IHJlc3VsdCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlQXN5bmMoeyBkYXRhOiBjdHguZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pLnRoZW4oKGJhc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKGJhc2UpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZWZmZWN0LnRyYW5zZm9ybShiYXNlLnZhbHVlLCBjaGVja0N0eCkpLnRoZW4oKHJlc3VsdCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoZWZmZWN0KTtcbiAgICB9XG59XG5ab2RFZmZlY3RzLmNyZWF0ZSA9IChzY2hlbWEsIGVmZmVjdCwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RFZmZlY3RzKHtcbiAgICAgICAgc2NoZW1hLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVmZmVjdHMsXG4gICAgICAgIGVmZmVjdCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcblpvZEVmZmVjdHMuY3JlYXRlV2l0aFByZXByb2Nlc3MgPSAocHJlcHJvY2Vzcywgc2NoZW1hLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEVmZmVjdHMoe1xuICAgICAgICBzY2hlbWEsXG4gICAgICAgIGVmZmVjdDogeyB0eXBlOiBcInByZXByb2Nlc3NcIiwgdHJhbnNmb3JtOiBwcmVwcm9jZXNzIH0sXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRWZmZWN0cyxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCB7IFpvZEVmZmVjdHMgYXMgWm9kVHJhbnNmb3JtZXIgfTtcbmV4cG9ydCBjbGFzcyBab2RPcHRpb25hbCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlID09PSBab2RQYXJzZWRUeXBlLnVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIE9LKHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKGlucHV0KTtcbiAgICB9XG4gICAgdW53cmFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmlubmVyVHlwZTtcbiAgICB9XG59XG5ab2RPcHRpb25hbC5jcmVhdGUgPSAodHlwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RPcHRpb25hbCh7XG4gICAgICAgIGlubmVyVHlwZTogdHlwZSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPcHRpb25hbCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2ROdWxsYWJsZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlID09PSBab2RQYXJzZWRUeXBlLm51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBPSyhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmlubmVyVHlwZS5fcGFyc2UoaW5wdXQpO1xuICAgIH1cbiAgICB1bndyYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlO1xuICAgIH1cbn1cblpvZE51bGxhYmxlLmNyZWF0ZSA9ICh0eXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE51bGxhYmxlKHtcbiAgICAgICAgaW5uZXJUeXBlOiB0eXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE51bGxhYmxlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZERlZmF1bHQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGxldCBkYXRhID0gY3R4LmRhdGE7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS51bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9kZWYuZGVmYXVsdFZhbHVlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKHtcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVtb3ZlRGVmYXVsdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuWm9kRGVmYXVsdC5jcmVhdGUgPSAodHlwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2REZWZhdWx0KHtcbiAgICAgICAgaW5uZXJUeXBlOiB0eXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZERlZmF1bHQsXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdHlwZW9mIHBhcmFtcy5kZWZhdWx0ID09PSBcImZ1bmN0aW9uXCIgPyBwYXJhbXMuZGVmYXVsdCA6ICgpID0+IHBhcmFtcy5kZWZhdWx0LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZENhdGNoIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICAvLyBuZXdDdHggaXMgdXNlZCB0byBub3QgY29sbGVjdCBpc3N1ZXMgZnJvbSBpbm5lciB0eXBlcyBpbiBjdHhcbiAgICAgICAgY29uc3QgbmV3Q3R4ID0ge1xuICAgICAgICAgICAgLi4uY3R4LFxuICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgLi4uY3R4LmNvbW1vbixcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fZGVmLmlubmVyVHlwZS5fcGFyc2Uoe1xuICAgICAgICAgICAgZGF0YTogbmV3Q3R4LmRhdGEsXG4gICAgICAgICAgICBwYXRoOiBuZXdDdHgucGF0aCxcbiAgICAgICAgICAgIHBhcmVudDoge1xuICAgICAgICAgICAgICAgIC4uLm5ld0N0eCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaXNBc3luYyhyZXN1bHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogXCJ2YWxpZFwiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmVzdWx0LnN0YXR1cyA9PT0gXCJ2YWxpZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHJlc3VsdC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLl9kZWYuY2F0Y2hWYWx1ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0IGVycm9yKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFpvZEVycm9yKG5ld0N0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBuZXdDdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcInZhbGlkXCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC5zdGF0dXMgPT09IFwidmFsaWRcIlxuICAgICAgICAgICAgICAgICAgICA/IHJlc3VsdC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICA6IHRoaXMuX2RlZi5jYXRjaFZhbHVlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldCBlcnJvcigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFpvZEVycm9yKG5ld0N0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogbmV3Q3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZW1vdmVDYXRjaCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuWm9kQ2F0Y2guY3JlYXRlID0gKHR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kQ2F0Y2goe1xuICAgICAgICBpbm5lclR5cGU6IHR5cGUsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQ2F0Y2gsXG4gICAgICAgIGNhdGNoVmFsdWU6IHR5cGVvZiBwYXJhbXMuY2F0Y2ggPT09IFwiZnVuY3Rpb25cIiA/IHBhcmFtcy5jYXRjaCA6ICgpID0+IHBhcmFtcy5jYXRjaCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2ROYU4gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5uYW4pIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUubmFuLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlOiBpbnB1dC5kYXRhIH07XG4gICAgfVxufVxuWm9kTmFOLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE5hTih7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTmFOLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNvbnN0IEJSQU5EID0gU3ltYm9sKFwiem9kX2JyYW5kXCIpO1xuZXhwb3J0IGNsYXNzIFpvZEJyYW5kZWQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBjdHguZGF0YTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi50eXBlLl9wYXJzZSh7XG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHVud3JhcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi50eXBlO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RQaXBlbGluZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlQXN5bmMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5SZXN1bHQgPSBhd2FpdCB0aGlzLl9kZWYuaW4uX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChpblJlc3VsdC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICBpZiAoaW5SZXN1bHQuc3RhdHVzID09PSBcImRpcnR5XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBESVJUWShpblJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGVmLm91dC5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBpblJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlQXN5bmMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGluUmVzdWx0ID0gdGhpcy5fZGVmLmluLl9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoaW5SZXN1bHQuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgIGlmIChpblJlc3VsdC5zdGF0dXMgPT09IFwiZGlydHlcIikge1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogXCJkaXJ0eVwiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogaW5SZXN1bHQudmFsdWUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9kZWYub3V0Ll9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBpblJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBjcmVhdGUoYSwgYikge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFBpcGVsaW5lKHtcbiAgICAgICAgICAgIGluOiBhLFxuICAgICAgICAgICAgb3V0OiBiLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RQaXBlbGluZSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFpvZFJlYWRvbmx5IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKGlucHV0KTtcbiAgICAgICAgY29uc3QgZnJlZXplID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChpc1ZhbGlkKGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YS52YWx1ZSA9IE9iamVjdC5mcmVlemUoZGF0YS52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGlzQXN5bmMocmVzdWx0KSA/IHJlc3VsdC50aGVuKChkYXRhKSA9PiBmcmVlemUoZGF0YSkpIDogZnJlZXplKHJlc3VsdCk7XG4gICAgfVxuICAgIHVud3JhcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuWm9kUmVhZG9ubHkuY3JlYXRlID0gKHR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kUmVhZG9ubHkoe1xuICAgICAgICBpbm5lclR5cGU6IHR5cGUsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kUmVhZG9ubHksXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgICAgICAgICAgICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgei5jdXN0b20gICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgICAgICAgICAgICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBjbGVhblBhcmFtcyhwYXJhbXMsIGRhdGEpIHtcbiAgICBjb25zdCBwID0gdHlwZW9mIHBhcmFtcyA9PT0gXCJmdW5jdGlvblwiID8gcGFyYW1zKGRhdGEpIDogdHlwZW9mIHBhcmFtcyA9PT0gXCJzdHJpbmdcIiA/IHsgbWVzc2FnZTogcGFyYW1zIH0gOiBwYXJhbXM7XG4gICAgY29uc3QgcDIgPSB0eXBlb2YgcCA9PT0gXCJzdHJpbmdcIiA/IHsgbWVzc2FnZTogcCB9IDogcDtcbiAgICByZXR1cm4gcDI7XG59XG5leHBvcnQgZnVuY3Rpb24gY3VzdG9tKGNoZWNrLCBfcGFyYW1zID0ge30sIFxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICpcbiAqIFBhc3MgYGZhdGFsYCBpbnRvIHRoZSBwYXJhbXMgb2JqZWN0IGluc3RlYWQ6XG4gKlxuICogYGBgdHNcbiAqIHouc3RyaW5nKCkuY3VzdG9tKCh2YWwpID0+IHZhbC5sZW5ndGggPiA1LCB7IGZhdGFsOiBmYWxzZSB9KVxuICogYGBgXG4gKlxuICovXG5mYXRhbCkge1xuICAgIGlmIChjaGVjaylcbiAgICAgICAgcmV0dXJuIFpvZEFueS5jcmVhdGUoKS5zdXBlclJlZmluZSgoZGF0YSwgY3R4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByID0gY2hlY2soZGF0YSk7XG4gICAgICAgICAgICBpZiAociBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gci50aGVuKChyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gY2xlYW5QYXJhbXMoX3BhcmFtcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBfZmF0YWwgPSBwYXJhbXMuZmF0YWwgPz8gZmF0YWwgPz8gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5hZGRJc3N1ZSh7IGNvZGU6IFwiY3VzdG9tXCIsIC4uLnBhcmFtcywgZmF0YWw6IF9mYXRhbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFyKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gY2xlYW5QYXJhbXMoX3BhcmFtcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgY29uc3QgX2ZhdGFsID0gcGFyYW1zLmZhdGFsID8/IGZhdGFsID8/IHRydWU7XG4gICAgICAgICAgICAgICAgY3R4LmFkZElzc3VlKHsgY29kZTogXCJjdXN0b21cIiwgLi4ucGFyYW1zLCBmYXRhbDogX2ZhdGFsIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9KTtcbiAgICByZXR1cm4gWm9kQW55LmNyZWF0ZSgpO1xufVxuZXhwb3J0IHsgWm9kVHlwZSBhcyBTY2hlbWEsIFpvZFR5cGUgYXMgWm9kU2NoZW1hIH07XG5leHBvcnQgY29uc3QgbGF0ZSA9IHtcbiAgICBvYmplY3Q6IFpvZE9iamVjdC5sYXp5Y3JlYXRlLFxufTtcbmV4cG9ydCB2YXIgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kO1xuKGZ1bmN0aW9uIChab2RGaXJzdFBhcnR5VHlwZUtpbmQpIHtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RTdHJpbmdcIl0gPSBcIlpvZFN0cmluZ1wiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE51bWJlclwiXSA9IFwiWm9kTnVtYmVyXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTmFOXCJdID0gXCJab2ROYU5cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RCaWdJbnRcIl0gPSBcIlpvZEJpZ0ludFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEJvb2xlYW5cIl0gPSBcIlpvZEJvb2xlYW5cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2REYXRlXCJdID0gXCJab2REYXRlXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kU3ltYm9sXCJdID0gXCJab2RTeW1ib2xcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RVbmRlZmluZWRcIl0gPSBcIlpvZFVuZGVmaW5lZFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE51bGxcIl0gPSBcIlpvZE51bGxcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RBbnlcIl0gPSBcIlpvZEFueVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFVua25vd25cIl0gPSBcIlpvZFVua25vd25cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2ROZXZlclwiXSA9IFwiWm9kTmV2ZXJcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RWb2lkXCJdID0gXCJab2RWb2lkXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kQXJyYXlcIl0gPSBcIlpvZEFycmF5XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kT2JqZWN0XCJdID0gXCJab2RPYmplY3RcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RVbmlvblwiXSA9IFwiWm9kVW5pb25cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2REaXNjcmltaW5hdGVkVW5pb25cIl0gPSBcIlpvZERpc2NyaW1pbmF0ZWRVbmlvblwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEludGVyc2VjdGlvblwiXSA9IFwiWm9kSW50ZXJzZWN0aW9uXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kVHVwbGVcIl0gPSBcIlpvZFR1cGxlXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kUmVjb3JkXCJdID0gXCJab2RSZWNvcmRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RNYXBcIl0gPSBcIlpvZE1hcFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFNldFwiXSA9IFwiWm9kU2V0XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kRnVuY3Rpb25cIl0gPSBcIlpvZEZ1bmN0aW9uXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTGF6eVwiXSA9IFwiWm9kTGF6eVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZExpdGVyYWxcIl0gPSBcIlpvZExpdGVyYWxcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RFbnVtXCJdID0gXCJab2RFbnVtXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kRWZmZWN0c1wiXSA9IFwiWm9kRWZmZWN0c1wiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE5hdGl2ZUVudW1cIl0gPSBcIlpvZE5hdGl2ZUVudW1cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RPcHRpb25hbFwiXSA9IFwiWm9kT3B0aW9uYWxcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2ROdWxsYWJsZVwiXSA9IFwiWm9kTnVsbGFibGVcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2REZWZhdWx0XCJdID0gXCJab2REZWZhdWx0XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kQ2F0Y2hcIl0gPSBcIlpvZENhdGNoXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kUHJvbWlzZVwiXSA9IFwiWm9kUHJvbWlzZVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEJyYW5kZWRcIl0gPSBcIlpvZEJyYW5kZWRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RQaXBlbGluZVwiXSA9IFwiWm9kUGlwZWxpbmVcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RSZWFkb25seVwiXSA9IFwiWm9kUmVhZG9ubHlcIjtcbn0pKFpvZEZpcnN0UGFydHlUeXBlS2luZCB8fCAoWm9kRmlyc3RQYXJ0eVR5cGVLaW5kID0ge30pKTtcbi8vIHJlcXVpcmVzIFRTIDQuNCtcbmNsYXNzIENsYXNzIHtcbiAgICBjb25zdHJ1Y3RvciguLi5fKSB7IH1cbn1cbmNvbnN0IGluc3RhbmNlT2ZUeXBlID0gKFxuLy8gY29uc3QgaW5zdGFuY2VPZlR5cGUgPSA8VCBleHRlbmRzIG5ldyAoLi4uYXJnczogYW55W10pID0+IGFueT4oXG5jbHMsIHBhcmFtcyA9IHtcbiAgICBtZXNzYWdlOiBgSW5wdXQgbm90IGluc3RhbmNlIG9mICR7Y2xzLm5hbWV9YCxcbn0pID0+IGN1c3RvbSgoZGF0YSkgPT4gZGF0YSBpbnN0YW5jZW9mIGNscywgcGFyYW1zKTtcbmNvbnN0IHN0cmluZ1R5cGUgPSBab2RTdHJpbmcuY3JlYXRlO1xuY29uc3QgbnVtYmVyVHlwZSA9IFpvZE51bWJlci5jcmVhdGU7XG5jb25zdCBuYW5UeXBlID0gWm9kTmFOLmNyZWF0ZTtcbmNvbnN0IGJpZ0ludFR5cGUgPSBab2RCaWdJbnQuY3JlYXRlO1xuY29uc3QgYm9vbGVhblR5cGUgPSBab2RCb29sZWFuLmNyZWF0ZTtcbmNvbnN0IGRhdGVUeXBlID0gWm9kRGF0ZS5jcmVhdGU7XG5jb25zdCBzeW1ib2xUeXBlID0gWm9kU3ltYm9sLmNyZWF0ZTtcbmNvbnN0IHVuZGVmaW5lZFR5cGUgPSBab2RVbmRlZmluZWQuY3JlYXRlO1xuY29uc3QgbnVsbFR5cGUgPSBab2ROdWxsLmNyZWF0ZTtcbmNvbnN0IGFueVR5cGUgPSBab2RBbnkuY3JlYXRlO1xuY29uc3QgdW5rbm93blR5cGUgPSBab2RVbmtub3duLmNyZWF0ZTtcbmNvbnN0IG5ldmVyVHlwZSA9IFpvZE5ldmVyLmNyZWF0ZTtcbmNvbnN0IHZvaWRUeXBlID0gWm9kVm9pZC5jcmVhdGU7XG5jb25zdCBhcnJheVR5cGUgPSBab2RBcnJheS5jcmVhdGU7XG5jb25zdCBvYmplY3RUeXBlID0gWm9kT2JqZWN0LmNyZWF0ZTtcbmNvbnN0IHN0cmljdE9iamVjdFR5cGUgPSBab2RPYmplY3Quc3RyaWN0Q3JlYXRlO1xuY29uc3QgdW5pb25UeXBlID0gWm9kVW5pb24uY3JlYXRlO1xuY29uc3QgZGlzY3JpbWluYXRlZFVuaW9uVHlwZSA9IFpvZERpc2NyaW1pbmF0ZWRVbmlvbi5jcmVhdGU7XG5jb25zdCBpbnRlcnNlY3Rpb25UeXBlID0gWm9kSW50ZXJzZWN0aW9uLmNyZWF0ZTtcbmNvbnN0IHR1cGxlVHlwZSA9IFpvZFR1cGxlLmNyZWF0ZTtcbmNvbnN0IHJlY29yZFR5cGUgPSBab2RSZWNvcmQuY3JlYXRlO1xuY29uc3QgbWFwVHlwZSA9IFpvZE1hcC5jcmVhdGU7XG5jb25zdCBzZXRUeXBlID0gWm9kU2V0LmNyZWF0ZTtcbmNvbnN0IGZ1bmN0aW9uVHlwZSA9IFpvZEZ1bmN0aW9uLmNyZWF0ZTtcbmNvbnN0IGxhenlUeXBlID0gWm9kTGF6eS5jcmVhdGU7XG5jb25zdCBsaXRlcmFsVHlwZSA9IFpvZExpdGVyYWwuY3JlYXRlO1xuY29uc3QgZW51bVR5cGUgPSBab2RFbnVtLmNyZWF0ZTtcbmNvbnN0IG5hdGl2ZUVudW1UeXBlID0gWm9kTmF0aXZlRW51bS5jcmVhdGU7XG5jb25zdCBwcm9taXNlVHlwZSA9IFpvZFByb21pc2UuY3JlYXRlO1xuY29uc3QgZWZmZWN0c1R5cGUgPSBab2RFZmZlY3RzLmNyZWF0ZTtcbmNvbnN0IG9wdGlvbmFsVHlwZSA9IFpvZE9wdGlvbmFsLmNyZWF0ZTtcbmNvbnN0IG51bGxhYmxlVHlwZSA9IFpvZE51bGxhYmxlLmNyZWF0ZTtcbmNvbnN0IHByZXByb2Nlc3NUeXBlID0gWm9kRWZmZWN0cy5jcmVhdGVXaXRoUHJlcHJvY2VzcztcbmNvbnN0IHBpcGVsaW5lVHlwZSA9IFpvZFBpcGVsaW5lLmNyZWF0ZTtcbmNvbnN0IG9zdHJpbmcgPSAoKSA9PiBzdHJpbmdUeXBlKCkub3B0aW9uYWwoKTtcbmNvbnN0IG9udW1iZXIgPSAoKSA9PiBudW1iZXJUeXBlKCkub3B0aW9uYWwoKTtcbmNvbnN0IG9ib29sZWFuID0gKCkgPT4gYm9vbGVhblR5cGUoKS5vcHRpb25hbCgpO1xuZXhwb3J0IGNvbnN0IGNvZXJjZSA9IHtcbiAgICBzdHJpbmc6ICgoYXJnKSA9PiBab2RTdHJpbmcuY3JlYXRlKHsgLi4uYXJnLCBjb2VyY2U6IHRydWUgfSkpLFxuICAgIG51bWJlcjogKChhcmcpID0+IFpvZE51bWJlci5jcmVhdGUoeyAuLi5hcmcsIGNvZXJjZTogdHJ1ZSB9KSksXG4gICAgYm9vbGVhbjogKChhcmcpID0+IFpvZEJvb2xlYW4uY3JlYXRlKHtcbiAgICAgICAgLi4uYXJnLFxuICAgICAgICBjb2VyY2U6IHRydWUsXG4gICAgfSkpLFxuICAgIGJpZ2ludDogKChhcmcpID0+IFpvZEJpZ0ludC5jcmVhdGUoeyAuLi5hcmcsIGNvZXJjZTogdHJ1ZSB9KSksXG4gICAgZGF0ZTogKChhcmcpID0+IFpvZERhdGUuY3JlYXRlKHsgLi4uYXJnLCBjb2VyY2U6IHRydWUgfSkpLFxufTtcbmV4cG9ydCB7IGFueVR5cGUgYXMgYW55LCBhcnJheVR5cGUgYXMgYXJyYXksIGJpZ0ludFR5cGUgYXMgYmlnaW50LCBib29sZWFuVHlwZSBhcyBib29sZWFuLCBkYXRlVHlwZSBhcyBkYXRlLCBkaXNjcmltaW5hdGVkVW5pb25UeXBlIGFzIGRpc2NyaW1pbmF0ZWRVbmlvbiwgZWZmZWN0c1R5cGUgYXMgZWZmZWN0LCBlbnVtVHlwZSBhcyBlbnVtLCBmdW5jdGlvblR5cGUgYXMgZnVuY3Rpb24sIGluc3RhbmNlT2ZUeXBlIGFzIGluc3RhbmNlb2YsIGludGVyc2VjdGlvblR5cGUgYXMgaW50ZXJzZWN0aW9uLCBsYXp5VHlwZSBhcyBsYXp5LCBsaXRlcmFsVHlwZSBhcyBsaXRlcmFsLCBtYXBUeXBlIGFzIG1hcCwgbmFuVHlwZSBhcyBuYW4sIG5hdGl2ZUVudW1UeXBlIGFzIG5hdGl2ZUVudW0sIG5ldmVyVHlwZSBhcyBuZXZlciwgbnVsbFR5cGUgYXMgbnVsbCwgbnVsbGFibGVUeXBlIGFzIG51bGxhYmxlLCBudW1iZXJUeXBlIGFzIG51bWJlciwgb2JqZWN0VHlwZSBhcyBvYmplY3QsIG9ib29sZWFuLCBvbnVtYmVyLCBvcHRpb25hbFR5cGUgYXMgb3B0aW9uYWwsIG9zdHJpbmcsIHBpcGVsaW5lVHlwZSBhcyBwaXBlbGluZSwgcHJlcHJvY2Vzc1R5cGUgYXMgcHJlcHJvY2VzcywgcHJvbWlzZVR5cGUgYXMgcHJvbWlzZSwgcmVjb3JkVHlwZSBhcyByZWNvcmQsIHNldFR5cGUgYXMgc2V0LCBzdHJpY3RPYmplY3RUeXBlIGFzIHN0cmljdE9iamVjdCwgc3RyaW5nVHlwZSBhcyBzdHJpbmcsIHN5bWJvbFR5cGUgYXMgc3ltYm9sLCBlZmZlY3RzVHlwZSBhcyB0cmFuc2Zvcm1lciwgdHVwbGVUeXBlIGFzIHR1cGxlLCB1bmRlZmluZWRUeXBlIGFzIHVuZGVmaW5lZCwgdW5pb25UeXBlIGFzIHVuaW9uLCB1bmtub3duVHlwZSBhcyB1bmtub3duLCB2b2lkVHlwZSBhcyB2b2lkLCB9O1xuZXhwb3J0IGNvbnN0IE5FVkVSID0gSU5WQUxJRDtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2l6aW5nLnRzIFx1MjAxNCBTaGFyZWQgcGVyLWJsb2NrIHNpemluZyBmcmFnbWVudCAodmFyaWFibGUgYmxvY2sgc2l6aW5nLCBEcm9wIDEpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gT25lIHVuaWZpZWQgbWVjaGFuaXNtIGZvciBcInRoaXMgYmxvY2sgcmVuZGVycyBuYXJyb3dlciB0aGFuIGl0cyBjb250YWluZXJcIjpcbi8vIGFuIG9wdGlvbmFsIHdpZHRoIEZSQUNUSU9OIHBsdXMgYW4gb3B0aW9uYWwgYWxpZ25tZW50LiBBcHBsaWVkIHRvZGF5IHRvXG4vLyBJbWFnZUJsb2NrIGFuZCBNYXRoQmxvY2sgKHRoZSBzaXphYmxlIHNldCB3aXRoIGEgcmVhbCBhdXRob3Jpbmcgc3VyZmFjZSk7XG4vLyBleHRlbmRzIHRvIG90aGVyIGJsb2NrcyBhZGRpdGl2ZWx5IHdoZW4gdGhlaXIgZWRpdGluZyBVSSBsYW5kcy4gRGVzaWduOlxuLy8gZG9jcy9kZXNpZ24vdmFyaWFibGUtYmxvY2stc2l6aW5nLm1kLlxuLy9cbi8vIFJlZmxvdy1zYWZlIGJ5IGNvbnN0cnVjdGlvbjogd2lkdGggaXMgcmVsYXRpdmUgKGEgZnJhY3Rpb24gb2Ygd2hhdGV2ZXJcbi8vIGNvbnRhaW5lciB0aGUgYmxvY2sgc2l0cyBpbiBcdTIwMTQgcGFnZSBvciBjb2x1bW4gY2VsbCksIG5ldmVyIGFic29sdXRlIHBpeGVscyxcbi8vIGFuZCBhIG5hcnJvd2VkIGJsb2NrIHN0YXlzIGluIG5vcm1hbCBmbG93IChubyB3cmFwLWFyb3VuZC9mbG9hdCksIHNvIHByaW50XG4vLyBwYWdpbmF0aW9uIGFuZCB0aGUgZm9sZGFibGUncyBoZWlnaHQgbWVhc3VyZW1lbnQga2VlcCB3b3JraW5nLlxuLy9cbi8vIHdpZHRoIFx1MjAxNCBmcmFjdGlvbiBvZiB0aGUgY29udGFpbmVyJ3MgY29udGVudCB3aWR0aCwgaW4gKDAsIDFdLiBBYnNlbnQgPSBmdWxsXG4vLyB3aWR0aCAodG9kYXkncyBiZWhhdmlvcikuIFRoZSBlZGl0b3IgVUkgc25hcHMgdG8gY2xlYW4gc3RvcHMgKDI1LzMzLzUwLzY2L1xuLy8gNzUvMTAwJSkgYnV0IHRoZSBzY2hlbWEgYWNjZXB0cyBhbnkgZnJhY3Rpb24gc28gZmluZS1ncmFpbmVkIGRyYWdzIHZhbGlkYXRlLlxuLy9cbi8vIGFsaWduIFx1MjAxNCB3aGVyZSB0aGUgbmFycm93ZWQgYmxvY2sgc2l0cyBob3Jpem9udGFsbHkuIEFic2VudCA9IGNlbnRlciAodGhlXG4vLyBuYXR1cmFsIHJlYWQgZm9yIGZpZ3VyZXMgb24gYSB3b3Jrc2hlZXQpOyBvbmx5IG1lYW5pbmdmdWwgd2hlbiB3aWR0aCBpc1xuLy8gcHJlc2VudCwgYW5kIHRoZSByZW5kZXJlciBpZ25vcmVzIGl0IG90aGVyd2lzZS4gU3RvcmVkIG9ubHkgd2hlbiB3aWR0aCBpc1xuLy8gc2V0IGFuZCB0aGUgdmFsdWUgaXMgJ2xlZnQnLydyaWdodCcsIHNvIHJvdW5kLXRyaXAgZXF1YWxpdHkgaG9sZHMgZm9yIHRoZVxuLy8gZGVmYXVsdCBjYXNlLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5cbmV4cG9ydCBjb25zdCBCbG9ja0FsaWduID0gei5lbnVtKFsnbGVmdCcsICdjZW50ZXInLCAncmlnaHQnXSk7XG5leHBvcnQgdHlwZSBCbG9ja0FsaWduID0gei5pbmZlcjx0eXBlb2YgQmxvY2tBbGlnbj47XG5cbi8vIEZyYWN0aW9uIG9mIGNvbnRhaW5lciB3aWR0aC4gZ3QoMCkgbm90IG1pbigwKSBcdTIwMTQgYSB6ZXJvLXdpZHRoIGJsb2NrIGlzIGFcbi8vIGhpZGRlbiBibG9jaywgd2hpY2ggaXMgYSBkaWZmZXJlbnQgKG5vbmV4aXN0ZW50KSBmZWF0dXJlLlxuZXhwb3J0IGNvbnN0IEJsb2NrV2lkdGhGcmFjdGlvbiA9IHoubnVtYmVyKCkuZ3QoMCkubWF4KDEpO1xuXG4vLyBTcHJlYWQgaW50byBhIGJsb2NrJ3Mgei5vYmplY3Qoey4uLn0pIHNoYXBlLiBBIHBsYWluIG9iamVjdCAobm90IGEgWm9kXG4vLyBzY2hlbWEpIHNvIGVhY2ggYmxvY2sga2VlcHMgYSBmbGF0IGZpZWxkIGxpc3QgYW5kIGRpc2NyaW1pbmF0ZWRVbmlvbiBrZWVwc1xuLy8gd29ya2luZyB1bnRvdWNoZWQuXG5leHBvcnQgY29uc3Qgc2l6aW5nRmllbGRzID0ge1xuICB3aWR0aDogQmxvY2tXaWR0aEZyYWN0aW9uLm9wdGlvbmFsKCksXG4gIGFsaWduOiBCbG9ja0FsaWduLm9wdGlvbmFsKCksXG59O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgc2l6aW5nRmllbGRzIH0gZnJvbSAnLi4vc2l6aW5nLmpzJztcblxuLy8gQSBjcm9wIHdpbmRvdzogdGhlIHZpc2libGUgcmVjdGFuZ2xlIGluc2lkZSB0aGUgc291cmNlIGltYWdlLCBhcyBmcmFjdGlvbnMgb2Zcbi8vIHRoZSBzb3VyY2UncyBvd24gd2lkdGgvaGVpZ2h0LiB4LHkgPSB0b3AtbGVmdCBvZiB0aGUgd2luZG93OyB3LGggPSBpdHMgc2l6ZS5cbi8vIFRoZSB3aW5kb3cgbXVzdCBzdGF5IGluc2lkZSB0aGUgc291cmNlICh4K3cgXHUyMjY0IDEsIHkraCBcdTIyNjQgMSkuIEEgdGlueSBlcHNpbG9uXG4vLyBhYnNvcmJzIGZsb2F0IGVycm9yIGZyb20gdGhlIGVkaXRvcidzIHB4XHUyMTkyZnJhY3Rpb24gbWF0aC4gVGhlIHJlbmRlcmVyIGlzIHB1cmVcbi8vIChubyBpbWFnZSBkaW1lbnNpb25zKSwgc28gdGhlIGNyb3AgcGl4ZWwgYXNwZWN0IGlzIGRlcml2ZWQgZnJvbSB0aGUgc2VwYXJhdGVseVxuLy8gc3RvcmVkIGBzcmNBc3BlY3RgIChzZWUgSW1hZ2VCbG9jaykuIERlc2lnbjogZG9jcy9kZXNpZ24vaW1hZ2UtY3JvcC5tZC5cbmNvbnN0IENST1BfRVBTSUxPTiA9IDFlLTY7XG5leHBvcnQgY29uc3QgQ3JvcFJlY3QgPSB6XG4gIC5vYmplY3Qoe1xuICAgIHg6IHoubnVtYmVyKCkubWluKDApLmx0KDEpLFxuICAgIHk6IHoubnVtYmVyKCkubWluKDApLmx0KDEpLFxuICAgIHc6IHoubnVtYmVyKCkuZ3QoMCkubWF4KDEpLFxuICAgIGg6IHoubnVtYmVyKCkuZ3QoMCkubWF4KDEpLFxuICB9KVxuICAucmVmaW5lKFxuICAgIChjKSA9PiBjLnggKyBjLncgPD0gMSArIENST1BfRVBTSUxPTiAmJiBjLnkgKyBjLmggPD0gMSArIENST1BfRVBTSUxPTixcbiAgICB7IG1lc3NhZ2U6ICdjcm9wIHdpbmRvdyBtdXN0IHN0YXkgd2l0aGluIHRoZSBzb3VyY2UgKHgrdyBcdTIyNjQgMSwgeStoIFx1MjI2NCAxKScgfSxcbiAgKTtcbmV4cG9ydCB0eXBlIENyb3BSZWN0ID0gei5pbmZlcjx0eXBlb2YgQ3JvcFJlY3Q+O1xuXG4vLyBQaGFzZSAxOiBVUkwtb25seS4gTm8gdXBsb2FkIHBpcGVsaW5lOyB0ZWFjaGVycyBwYXN0ZSBhIHB1YmxpYyBVUkwuXG4vLyBQaGFzZSAyKzogYSBzZXBhcmF0ZSB2YXJpYW50IHdpdGggYSBTdXBhYmFzZSBTdG9yYWdlIHVwbG9hZCwgd2l0aCBzcmNcbi8vIHBvaW50aW5nIHRvIGEgc2lnbmVkIFVSTC4gU2NoZW1hIGlzIGZvcndhcmQtY29tcGF0aWJsZSBcdTIwMTQgYWRkaW5nIGEgbmV3XG4vLyBgc291cmNlYCBkaXNjcmltaW5hdG9yIGZpZWxkIGxhdGVyIGlzIG5vbi1icmVha2luZyBpZiBleGlzdGluZyByb3dzIGFyZVxuLy8gdHJlYXRlZCBhcyBgc291cmNlOiAndXJsJ2AgYnkgZGVmYXVsdC5cbmV4cG9ydCBjb25zdCBJbWFnZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnaW1hZ2UnKSxcbiAgc3JjOiB6LnN0cmluZygpLnVybCgpLFxuICAvLyBhbHQgaXMgcmVxdWlyZWQgZm9yIGFjY2Vzc2liaWxpdHkgYnV0IGRlZmF1bHRzIHRvIGVtcHR5IHN0cmluZyBmb3JcbiAgLy8gZGVjb3JhdGl2ZSBpbWFnZXMuIEVkaXRvcnMgc2hvdWxkIHdhcm4gKG5vdCBibG9jaykgb24gZW1wdHkgYWx0LlxuICBhbHQ6IHouc3RyaW5nKCkuZGVmYXVsdCgnJyksXG4gIGNhcHRpb246IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgLy8gVmFyaWFibGUgYmxvY2sgc2l6aW5nOiBvcHRpb25hbCB3aWR0aCBmcmFjdGlvbiArIGFsaWdubWVudCAoc2l6aW5nLnRzKS5cbiAgLy8gVGhpcyBJUyB0aGUgaW1hZ2UgZGlzcGxheS1zaXplIG1lY2hhbmlzbSBcdTIwMTQgbm8gc2VwYXJhdGUgaW50cmluc2ljIHNpemUuXG4gIC4uLnNpemluZ0ZpZWxkcyxcbiAgLy8gQ3JvcCAocmVmcmFtZSkgXHUyMDE0IHRoZSB2aXNpYmxlIHN1Yi1yZWN0YW5nbGUgb2YgdGhlIHNvdXJjZSAoZG9jcy9kZXNpZ24vXG4gIC8vIGltYWdlLWNyb3AubWQpLiBgc3JjQXNwZWN0YCAodGhlIHNvdXJjZSdzIG5hdHVyYWwgVy9IIHJhdGlvKSBsZXRzIHRoZSBwdXJlXG4gIC8vIHJlbmRlcmVyIGRlcml2ZSB0aGUgY3JvcCBwaXhlbCBhc3BlY3QgQSA9IHNyY0FzcGVjdFx1MDBCNyh3L2gpIHdpdGhvdXQgcmVhZGluZ1xuICAvLyBpbWFnZSBkaW1lbnNpb25zLiBTdG9yZWQgQk9USC1PUi1ORUlUSEVSOiBhbiB1bmNyb3BwZWQgaW1hZ2UgY2Fycmllc1xuICAvLyBuZWl0aGVyIChieXRlLWlkZW50aWNhbCB0byB0b2RheSkuIFRoZSBwYWlyaW5nIGlzIGVuZm9yY2VkIGluIHRoZSBlZGl0b3IgK1xuICAvLyBzZXJpYWxpemUgKG5vdCBhIHNjaGVtYSAucmVmaW5lIFx1MjAxNCBJbWFnZUJsb2NrIGlzIGEgZGlzY3JpbWluYXRlZFVuaW9uIG1lbWJlclxuICAvLyBhbmQgcmVmaW5lZCBvYmplY3RzIGNhbid0IGJlIGRpc2NyaW1pbmF0ZWQpOyBzZWUgc2VyaWFsaXplLnRzICsgQ1ItSU5WLWJvdGguXG4gIGNyb3A6IENyb3BSZWN0Lm9wdGlvbmFsKCksXG4gIHNyY0FzcGVjdDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIEltYWdlQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBJbWFnZUJsb2NrPjtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gZ3JhcGgtcHJpbWl0aXZlcy50cyBcdTIwMTQgY29vcmRpbmF0ZS1wbGFuZSBwcmltaXRpdmVzLCBkZXBlbmRlbmN5LWZyZWVcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgYXhpcyAvIGZ1bmN0aW9uLW1vZGVsIC8gZHJhd2FibGUgdm9jYWJ1bGFyeSBzaGFyZWQgYnkgZXZlcnkgZ3JhcGgtc2hhcGVkXG4vLyBzdXJmYWNlOiBpbnRlcmFjdGl2ZV9ncmFwaCAodGhlIGdyYWRlZCBibG9jayksIGdyYXBoX2ZpZ3VyZSAodGhlIHN0YXRpY1xuLy8gcGljdHVyZSksIG11bHRpcGxlX2Nob2ljZSBjaG9pY2UgZmlndXJlcywgbWF0Y2hpbmcgc2lkZXMsIG51bWJlcl9saW5lXG4vLyAoRW5kcG9pbnRTdHlsZSksIGFuZCBkYXRhX3Bsb3QuXG4vL1xuLy8gVGhlc2Ugc2NoZW1hcyBsaXZlIEhFUkUsIGluIGEgbGVhZiBtb2R1bGUgdGhhdCBpbXBvcnRzIG5vdGhpbmcgYnV0IHpvZCxcbi8vIHJhdGhlciB0aGFuIGluIGJsb2Nrcy9pbnRlcmFjdGl2ZS1ncmFwaC50cyB3aGVyZSB0aGV5IGdyZXcgdXAuIFRoZSByZWFzb24gaXNcbi8vIGEgaGFyZCBvbmUsIG5vdCB0aWRpbmVzczogaW50ZXJhY3RpdmUtZ3JhcGgudHMgaW1wb3J0cyBJbmxpbmVOb2RlIGZyb21cbi8vIGlubGluZS50cyAoaXRzIHByb21wdC9mZWVkYmFjay9zb2x1dGlvbiBmaWVsZHMpLCBzbyBhbnl0aGluZyByZWFjaGluZyB0aGVzZVxuLy8gcHJpbWl0aXZlcyBUSFJPVUdIIGl0IGluaGVyaXRzIGEgZGVwZW5kZW5jeSBvbiBpbmxpbmUudHMuIFdoZW4gaW5saW5lLnRzXG4vLyBpdHNlbGYgbmVlZHMgdGhlbSBcdTIwMTQgRGVmaW5pdGlvbkJsb2NrIGFkbWl0cyBhIGdyYXBoX2ZpZ3VyZSwgc2VlIGlubGluZS50cyBcdTIwMTRcbi8vIHRoYXQgY2xvc2VzIHRoZSBjeWNsZSBpbmxpbmUudHMgLT4gZ3JhcGgtZmlndXJlLnRzIC0+IGludGVyYWN0aXZlLWdyYXBoLnRzIC0+XG4vLyBpbmxpbmUudHMsIGFuZCB0aGUgY3ljbGUgaXMgZmF0YWwgcmF0aGVyIHRoYW4gY29zbWV0aWM6IGludGVyYWN0aXZlLWdyYXBoLnRzXG4vLyBldmFsdWF0ZXMgYHouYXJyYXkoSW5saW5lTm9kZSlgIGF0IG1vZHVsZSBzY29wZSwgc28gYSBwYXJ0aWFsbHktaW5pdGlhbGl6ZWRcbi8vIGlubGluZS5qcyB0aHJvd3MgYSBURFogUmVmZXJlbmNlRXJyb3IgYXQgaW1wb3J0IHRpbWUuXG4vL1xuLy8gYmxvY2tzL2ludGVyYWN0aXZlLWdyYXBoLnRzIHJlLWV4cG9ydHMgZXZlcnl0aGluZyBoZXJlLCBzbyBldmVyeSBleGlzdGluZ1xuLy8gaW1wb3J0ZXIga2VlcHMgaXRzIGN1cnJlbnQgaW1wb3J0IHBhdGggYW5kIGlkZW50aXR5IFx1MjAxNCBub3RoaW5nIG1vdmVkIGZyb20gYVxuLy8gY29uc3VtZXIncyBwb2ludCBvZiB2aWV3LiBOZXcgaW5saW5lLXJlYWNoYWJsZSBjb2RlIChncmFwaC1maWd1cmUudHMpIGltcG9ydHNcbi8vIGZyb20gdGhpcyBtb2R1bGUgZGlyZWN0bHkuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcblxuLy8gLS0tLSBBeGlzIGNvbmZpZ3VyYXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBjb29yZGluYXRlIHBsYW5lIHRoZSBzdHVkZW50IHdvcmtzIGluLiBHcmFwaCB1bml0cyB0aHJvdWdob3V0IFx1MjAxNCB0b2xlcmFuY2Vcbi8vIGFuZCBncmlkIHN0ZXBzIGFyZSBpbiB0aGUgc2FtZSB1bml0cywgbmV2ZXIgcGl4ZWxzLCBzbyBhIHB1Ymxpc2hlZCBwYWdlIHRoYXRcbi8vIHJlLWxheXMtb3V0IGF0IGEgZGlmZmVyZW50IHNpemUgc3RpbGwgc2NvcmVzIGlkZW50aWNhbGx5LlxuZXhwb3J0IGNvbnN0IEF4aXNDb25maWcgPSB6Lm9iamVjdCh7XG4gIHhNaW46IHoubnVtYmVyKCksXG4gIHhNYXg6IHoubnVtYmVyKCksXG4gIHlNaW46IHoubnVtYmVyKCksXG4gIHlNYXg6IHoubnVtYmVyKCksXG4gIHhHcmlkU3RlcDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLmRlZmF1bHQoMSksXG4gIHlHcmlkU3RlcDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLmRlZmF1bHQoMSksXG4gIHNob3dHcmlkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAvLyBXaGVuIHRydWUsIGEgZHJhZ2dlZCBoYW5kbGUgc25hcHMgdG8gdGhlIG5lYXJlc3QgZ3JpZCBpbnRlcnNlY3Rpb24uIEtleWJvYXJkXG4gIC8vIG51ZGdlIGFsd2F5cyBtb3ZlcyBieSBvbmUgZ3JpZCBzdGVwIHJlZ2FyZGxlc3MgKFNoaWZ0ID0gMC4xIHN0ZXAsIGZpbmUpLlxuICBzbmFwVG9HcmlkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxufSk7XG5leHBvcnQgdHlwZSBBeGlzQ29uZmlnID0gei5pbmZlcjx0eXBlb2YgQXhpc0NvbmZpZz47XG5cbi8vIC0tLS0gRW5kcG9pbnQgc3R5bGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBvcGVuID0gaG9sbG93IGRvdCwgdmFsdWUgRVhDTFVERUQgKGEgc3RyaWN0IGluZXF1YWxpdHkgYm91bmRhcnksIGFuIG9wZW5cbi8vIGludGVydmFsIGVuZCk7IGNsb3NlZCA9IGZpbGxlZCBkb3QsIHZhbHVlIElOQ0xVREVELiBBIHNoYXJlZCB2b2NhYnVsYXJ5IHVzZWRcbi8vIGJ5IGluZXF1YWxpdHkgYm91bmRhcmllcyAoRHJvcCA0OiBzdHJpY3QgXHUyMTkyIG9wZW4pLCBkb21haW4tcmVzdHJpY3RlZCByYXlzIGFuZFxuLy8gc2VnbWVudHMgKERyb3AgNiksIGRpc3BsYXkgc2VnbWVudHMsIGFuZCB0aGUgZnV0dXJlIG51bWJlci1saW5lIGZhbWlseS4gQWRkZWRcbi8vIGFzIGEgZm91bmRhdGlvbiBub3cgKERyb3AgMik7IGNvbnN1bWVycyByZW5kZXIvc2NvcmUgaXQgaW4gdGhlaXIgb3duIGRyb3BzLlxuZXhwb3J0IGNvbnN0IEVuZHBvaW50U3R5bGUgPSB6LmVudW0oWydvcGVuJywgJ2Nsb3NlZCddKTtcbmV4cG9ydCB0eXBlIEVuZHBvaW50U3R5bGUgPSB6LmluZmVyPHR5cGVvZiBFbmRwb2ludFN0eWxlPjtcblxuLy8gRG9tYWluIHJlc3RyaWN0aW9uIG9uIGEgZHJhd24gY3VydmUgKERyb3AgNS82KTogcmF5cyBhbmQgc2VnbWVudHMgb2YgYVxuLy8gZnVuY3Rpb24uIFN0eWxlcyBtYXJrIHdoZXRoZXIgZWFjaCBlbmRwb2ludCBpcyBpbmNsdWRlZCAoY2xvc2VkKSBvciBub3QuXG5leHBvcnQgY29uc3QgQ3VydmVEb21haW4gPSB6Lm9iamVjdCh7XG4gIG1pbjogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBtaW5TdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxuICBtYXg6IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgbWF4U3R5bGU6IEVuZHBvaW50U3R5bGUub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ3VydmVEb21haW4gPSB6LmluZmVyPHR5cGVvZiBDdXJ2ZURvbWFpbj47XG5cbi8vIC0tLS0gRnVuY3Rpb24gbW9kZWxzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFYWNoIGZhbWlseSBjYXJyaWVzIGl0cyBwYXJhbWV0ZXJzICsgYSBwZXItcGFyYW1ldGVyIHRvbGVyYW5jZSwgYW5kIGl0c1xuLy8gcGFyYW1ldGVyIG5hbWVzIE1BVENIIHRoZSBraXQncyByZWdyZXNzaW9uIGZpdHRlcnMgKGdyYXBoLWtpdCBmaXRMaW5lYXIgL1xuLy8gZml0UXVhZHJhdGljIC8gZml0RXhwb25lbnRpYWwgLyBmaXRMb2dhcml0aG1pYykgc28gYSBmaXR0ZWQgY3VydmUgc2NvcmVzXG4vLyBhZ2FpbnN0IHRoZSBrZXkgd2l0aCBubyB0cmFuc2xhdGlvbi4gRm9ybXM6XG4vLyAgIGxpbmVhciAgICAgICB5ID0gc2xvcGVcdTAwQjd4ICsgaW50ZXJjZXB0XG4vLyAgIHF1YWRyYXRpYyAgICB5ID0gYVx1MDBCN3hcdTAwQjIgKyBiXHUwMEI3eCArIGNcbi8vICAgZXhwb25lbnRpYWwgIHkgPSBhXHUwMEI3Ylx1MDJFMyAgICAgICAgICAgIChiID4gMClcbi8vICAgbG9nYXJpdGhtaWMgIHkgPSBhICsgYlx1MDBCN2xuKHgpICAgICAoeCA+IDApXG4vLyAgIHZlcnRpY2FsICAgICB4ID0gayAgICAgICAgICAgICAgIChOT1QgYSB5ID0gZih4KSBjdXJ2ZSBcdTIwMTQgc2NvcmVkIG9uIHgpXG5leHBvcnQgY29uc3QgTGluZWFyTW9kZWwgPSB6Lm9iamVjdCh7XG4gIGZhbWlseTogei5saXRlcmFsKCdsaW5lYXInKSxcbiAgc2xvcGU6IHoubnVtYmVyKCksXG4gIGludGVyY2VwdDogei5udW1iZXIoKSxcbiAgc2xvcGVUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG4gIGludGVyY2VwdFRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgTGluZWFyTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBMaW5lYXJNb2RlbD47XG5cbmV4cG9ydCBjb25zdCBRdWFkcmF0aWNNb2RlbCA9IHoub2JqZWN0KHtcbiAgZmFtaWx5OiB6LmxpdGVyYWwoJ3F1YWRyYXRpYycpLFxuICBhOiB6Lm51bWJlcigpLFxuICBiOiB6Lm51bWJlcigpLFxuICBjOiB6Lm51bWJlcigpLFxuICBhVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBiVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBjVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxufSk7XG5leHBvcnQgdHlwZSBRdWFkcmF0aWNNb2RlbCA9IHouaW5mZXI8dHlwZW9mIFF1YWRyYXRpY01vZGVsPjtcblxuZXhwb3J0IGNvbnN0IEV4cG9uZW50aWFsTW9kZWwgPSB6Lm9iamVjdCh7XG4gIGZhbWlseTogei5saXRlcmFsKCdleHBvbmVudGlhbCcpLFxuICBhOiB6Lm51bWJlcigpLFxuICBiOiB6Lm51bWJlcigpLFxuICBhVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBiVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxufSk7XG5leHBvcnQgdHlwZSBFeHBvbmVudGlhbE1vZGVsID0gei5pbmZlcjx0eXBlb2YgRXhwb25lbnRpYWxNb2RlbD47XG5cbmV4cG9ydCBjb25zdCBMb2dhcml0aG1pY01vZGVsID0gei5vYmplY3Qoe1xuICBmYW1pbHk6IHoubGl0ZXJhbCgnbG9nYXJpdGhtaWMnKSxcbiAgYTogei5udW1iZXIoKSxcbiAgYjogei5udW1iZXIoKSxcbiAgYVRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgYlRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgTG9nYXJpdGhtaWNNb2RlbCA9IHouaW5mZXI8dHlwZW9mIExvZ2FyaXRobWljTW9kZWw+O1xuXG4vLyBBIHZlcnRpY2FsIGxpbmUgeCA9IGsuIEl0IGhhcyBubyB5ID0gZih4KSByZXByZXNlbnRhdGlvbiAoaW5maW5pdGUgc2xvcGUpLCBzb1xuLy8gaXQgY2FuJ3QgcmlkZSB0aGUgcmVncmVzc2lvbiBmaXR0ZXJzIFx1MjAxNCB0aGUga2l0IHNjb3JlcyBpdCBkaXJlY3RseSBvbiB0aGVcbi8vIHN0dWRlbnQncyB4LiBLZXB0IGluIEZ1bmN0aW9uTW9kZWwgKG5vdCBhIHNlcGFyYXRlIGludGVyYWN0aW9uKSBzbyBhdXRob3JpbmcgYVxuLy8gdmVydGljYWwgbGluZSBpcyB0aGUgc2FtZSBcInR5cGUgYW4gZXF1YXRpb25cIiBmbG93IGFzIGFueSBvdGhlciBmYW1pbHkuXG5leHBvcnQgY29uc3QgVmVydGljYWxNb2RlbCA9IHoub2JqZWN0KHtcbiAgZmFtaWx5OiB6LmxpdGVyYWwoJ3ZlcnRpY2FsJyksXG4gIHg6IHoubnVtYmVyKCksXG4gIHhUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIFZlcnRpY2FsTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBWZXJ0aWNhbE1vZGVsPjtcblxuLy8gRGlzY3JpbWluYXRlZCBvbiBgZmFtaWx5YCBzbyBjb25zdW1lcnMgYnJhbmNoIHVuaWZvcm1seS4gR3Jvd2luZyBhIGZhbWlseSBpcyBhXG4vLyBuZXcgbWVtYmVyIGhlcmUgKyBhIG5ldyBmaXQvc2NvcmUgYnJhbmNoIGluIHRoZSBraXQgXHUyMDE0IG5vIG90aGVyIGJsb2NrIHRvdWNoZWQuXG5leHBvcnQgY29uc3QgRnVuY3Rpb25Nb2RlbCA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCdmYW1pbHknLCBbXG4gIExpbmVhck1vZGVsLFxuICBRdWFkcmF0aWNNb2RlbCxcbiAgRXhwb25lbnRpYWxNb2RlbCxcbiAgTG9nYXJpdGhtaWNNb2RlbCxcbiAgVmVydGljYWxNb2RlbCxcbl0pO1xuZXhwb3J0IHR5cGUgRnVuY3Rpb25Nb2RlbCA9IHouaW5mZXI8dHlwZW9mIEZ1bmN0aW9uTW9kZWw+O1xuXG4vLyAtLS0tIERyYXdhYmxlcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gYERyYXdhYmxlYCBpcyBkaXNjcmltaW5hdGVkIG9uIGBraW5kYC4gYGN1cnZlYCBSRVVTRVMgRnVuY3Rpb25Nb2RlbCwgc28gdGhlXG4vLyBkYXkgcXVhZHJhdGljL2V4cG9uZW50aWFsL2xvZ2FyaXRobWljIGxhbmQgdGhleSBsaWdodCB1cCBoZXJlIEFORCBpblxuLy8gcGxvdF9mdW5jdGlvbiBhdCBvbmNlLiBBIGBsYWJlbGAgdGV4dC1hbm5vdGF0aW9uIGRyYXdhYmxlIGlzIGRlbGliZXJhdGVseVxuLy8gZGVmZXJyZWQgKHBvaW50LmxhYmVsIGNvdmVycyB0aGUgY29tbW9uIGNhc2UpIFx1MjAxNCBZQUdOSSwgYWRkaXRpdmUgd2hlbiBuZWVkZWQuXG4vLyBBdXRob3JlZCBwZXItZHJhd2FibGUgY29sb3IuIFN0b3JlZCBhcyBhIHBhbGV0dGUgS0VZIChub3QgYSBoZXgpIHNvIGNvbG9yc1xuLy8gc3RheSBzZW1hbnRpYzsgdGhlIGtleSBsaXN0IGlzIGRlZmluZWQgSEVSRSAoZGVwZW5kZW5jeS1mcmVlKSBhbmQgdGhlIGtleSAtPlxuLy8gaGV4IG1hcCBsaXZlcyBpbiBAYWN0aXZpdHkvZ3JhcGgta2l0J3MgRFJBV0FCTEVfUEFMRVRURS4gQSBkcmlmdCBndWFyZCB0ZXN0XG4vLyBrZWVwcyB0aGUgdHdvIGxpc3RzIGluIGxvY2tzdGVwLiBPcHRpb25hbDogYWJzZW50ID0gdGhlIHNoYXJlZCBkZWZhdWx0IGNvbG9yLlxuZXhwb3J0IGNvbnN0IERyYXdhYmxlQ29sb3IgPSB6LmVudW0oW1xuICAnYmx1ZScsXG4gICdpbmRpZ28nLFxuICAndGVhbCcsXG4gICdncmVlbicsXG4gICdhbWJlcicsXG4gICdyZWQnLFxuICAndmlvbGV0JyxcbiAgJ3NsYXRlJyxcbl0pO1xuZXhwb3J0IHR5cGUgRHJhd2FibGVDb2xvclQgPSB6LmluZmVyPHR5cGVvZiBEcmF3YWJsZUNvbG9yPjtcblxuY29uc3QgUG9pbnREcmF3YWJsZSA9IHoub2JqZWN0KHtcbiAga2luZDogei5saXRlcmFsKCdwb2ludCcpLFxuICBhdDogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICBsYWJlbDogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAvLyBvcGVuID0gaG9sbG93IChleGNsdWRlZCksIGNsb3NlZCA9IGZpbGxlZC4gRGVmYXVsdCBjbG9zZWQuXG4gIHN0eWxlOiBFbmRwb2ludFN0eWxlLm9wdGlvbmFsKCksXG4gIGNvbG9yOiBEcmF3YWJsZUNvbG9yLm9wdGlvbmFsKCksXG59KTtcbmNvbnN0IEN1cnZlRHJhd2FibGUgPSB6Lm9iamVjdCh7XG4gIGtpbmQ6IHoubGl0ZXJhbCgnY3VydmUnKSxcbiAgbW9kZWw6IEZ1bmN0aW9uTW9kZWwsXG4gIC8vIERyb3AgNTogZGFzaGVkIGJvdW5kYXJ5ICsgaGFsZi1wbGFuZSBzaGFkaW5nIHR1cm4gYSBkaXNwbGF5IGN1cnZlIGludG8gYVxuICAvLyBwaWN0dXJlZCBpbmVxdWFsaXR5OyBkb21haW4gcmVzdHJpY3RzIGl0IHRvIGEgcmF5L3NlZ21lbnQuXG4gIHN0eWxlOiB6LmVudW0oWydzb2xpZCcsICdkYXNoZWQnXSkub3B0aW9uYWwoKSxcbiAgc2hhZGU6IHouZW51bShbJ2Fib3ZlJywgJ2JlbG93JywgJ2xlZnQnLCAncmlnaHQnXSkub3B0aW9uYWwoKSxcbiAgZG9tYWluOiBDdXJ2ZURvbWFpbi5vcHRpb25hbCgpLFxuICAvLyBDb250aW51YXRpb24gYXJyb3doZWFkcyBvbiBVTkJPVU5ERUQgZW5kcyAodGV4dGJvb2sgY29udmVudGlvbjogYXJyb3cgPVxuICAvLyBcImtlZXBzIGdvaW5nXCIsIGRvdCA9IFwic3RvcHMgaGVyZVwiKS4gRHJhd24gd2hlcmUgdGhlIGN1cnZlIGV4aXRzIHRoZSB2aXNpYmxlXG4gIC8vIHdpbmRvdzsgYW4gYXV0aG9yZWQgZG9tYWluIGJvdW5kIHN1cHByZXNzZXMgdGhhdCBlbmQncyBhcnJvdyAoaXQgZ2V0cyB0aGVcbiAgLy8gb3Blbi9jbG9zZWQgZG90IGluc3RlYWQpLiB1bmRlZmluZWQgPSB0cnVlIFx1MjAxNCBhcnJvd3MgYXJlIHRoZSBjb252ZW50aW9uLFxuICAvLyB0aGlzIGZsYWcgaXMgdGhlIG9wdC1vdXQgKGF1dGhvciBjYWxsIDIwMjYtMDctMTApLlxuICBhcnJvd3M6IHouYm9vbGVhbigpLm9wdGlvbmFsKCksXG4gIGNvbG9yOiBEcmF3YWJsZUNvbG9yLm9wdGlvbmFsKCksXG59KTtcblxuLy8gRHJvcCA1OiBwbG90IEFOWSBwYXJzZWFibGUgZm9ybXVsYSAoc2luKHgpLCByYXRpb25hbHMsIFx1MjAyNikgYnkgc2FtcGxpbmcgXHUyMDE0IHRoZVxuLy8gZXNjYXBlIGhhdGNoIHRoZSBncmFkZWQgZmFtaWxpZXMgZGVsaWJlcmF0ZWx5IGRvbid0IGNvdmVyLiBEaXNwbGF5LW9ubHkuXG5jb25zdCBFeHByZXNzaW9uRHJhd2FibGUgPSB6Lm9iamVjdCh7XG4gIGtpbmQ6IHoubGl0ZXJhbCgnZXhwcmVzc2lvbicpLFxuICBleHByZXNzaW9uOiB6LnN0cmluZygpLm1pbigxKSxcbiAgc3R5bGU6IHouZW51bShbJ3NvbGlkJywgJ2Rhc2hlZCddKS5vcHRpb25hbCgpLFxuICAvLyBDb250aW51YXRpb24gYXJyb3doZWFkcyBhdCBib3RoIHdpbmRvdyBleGl0cyAoc2VlIEN1cnZlRHJhd2FibGUuYXJyb3dzKS5cbiAgYXJyb3dzOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICBjb2xvcjogRHJhd2FibGVDb2xvci5vcHRpb25hbCgpLFxufSk7XG5jb25zdCBTZWdtZW50RHJhd2FibGUgPSB6Lm9iamVjdCh7XG4gIGtpbmQ6IHoubGl0ZXJhbCgnc2VnbWVudCcpLFxuICBmcm9tOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIHRvOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIC8vIERyb3AgNTogb3Blbi9jbG9zZWQgZW5kcG9pbnQgZG90cyAoW2Zyb20sIHRvXSkuIERlZmF1bHQgY2xvc2VkLlxuICBlbmRwb2ludHM6IHoudHVwbGUoW0VuZHBvaW50U3R5bGUsIEVuZHBvaW50U3R5bGVdKS5vcHRpb25hbCgpLFxuICBjb2xvcjogRHJhd2FibGVDb2xvci5vcHRpb25hbCgpLFxufSk7XG5cbi8vIERyb3AgNTogYSByYXkgXHUyMDE0IHN0YXJ0cyBhdCBgZnJvbWAgKG9wZW4vY2xvc2VkKSwgcGFzc2VzIHRocm91Z2ggYHRocm91Z2hgLFxuLy8gcnVucyB0byB0aGUgd2luZG93IGVkZ2UuIFRoZSBwaHlzaWNzLWNsYXNzIHN0YXBsZS5cbmNvbnN0IFJheURyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ3JheScpLFxuICBmcm9tOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIHRocm91Z2g6IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgZnJvbVN0eWxlOiBFbmRwb2ludFN0eWxlLm9wdGlvbmFsKCksXG4gIC8vIENvbnRpbnVhdGlvbiBhcnJvd2hlYWQgb24gdGhlIHVuYm91bmRlZCBlbmQgKHNlZSBDdXJ2ZURyYXdhYmxlLmFycm93cykuXG4gIGFycm93czogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgY29sb3I6IERyYXdhYmxlQ29sb3Iub3B0aW9uYWwoKSxcbn0pO1xuY29uc3QgUG9seWdvbkRyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ3BvbHlnb24nKSxcbiAgdmVydGljZXM6IHouYXJyYXkoei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pKS5taW4oMyksXG4gIGZpbGxlZDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgY29sb3I6IERyYXdhYmxlQ29sb3Iub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IGNvbnN0IERyYXdhYmxlID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ2tpbmQnLCBbXG4gIFBvaW50RHJhd2FibGUsXG4gIEN1cnZlRHJhd2FibGUsXG4gIEV4cHJlc3Npb25EcmF3YWJsZSxcbiAgU2VnbWVudERyYXdhYmxlLFxuICBSYXlEcmF3YWJsZSxcbiAgUG9seWdvbkRyYXdhYmxlLFxuXSk7XG5leHBvcnQgdHlwZSBEcmF3YWJsZSA9IHouaW5mZXI8dHlwZW9mIERyYXdhYmxlPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbi8vIEZyb20gdGhlIGxlYWYgcHJpbWl0aXZlcyBtb2R1bGUsIE5PVCBmcm9tIC4vaW50ZXJhY3RpdmUtZ3JhcGguanMgXHUyMDE0IHRoYXQgZmlsZVxuLy8gaW1wb3J0cyBpbmxpbmUudHMsIGFuZCBpbmxpbmUudHMgaW1wb3J0cyBUSElTIG9uZSAoYSBkZWZpbml0aW9uIG1heSBjb250YWluIGFcbi8vIGdyYXBoIGZpZ3VyZSksIHNvIHJvdXRpbmcgdGhyb3VnaCBpdCB3b3VsZCBjbG9zZSBhIGZhdGFsIG1vZHVsZSBjeWNsZS4gU2VlXG4vLyAuLi9ncmFwaC1wcmltaXRpdmVzLnRzLlxuaW1wb3J0IHsgQXhpc0NvbmZpZywgRHJhd2FibGUgfSBmcm9tICcuLi9ncmFwaC1wcmltaXRpdmVzLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEdyYXBoRmlndXJlQmxvY2sgXHUyMDE0IGEgc3RhdGljIGNvb3JkaW5hdGUtcGxhbmUgcGljdHVyZSAobmV2ZXIgaW50ZXJhY3RpdmUpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEEgcHVyZSBDT05URU5UIGJsb2NrIChkYXRhLWJsb2NrLWNhdGVnb3J5PVwiY29udGVudFwiKTogbm9uLWludGVyYWN0aXZlLFxuLy8gbm9uLW51bWJlcmVkLCBubyBydW50aW1lIHdpcmluZywgbm8gc3VibWlzc2lvbiB3aXJlIGltcGFjdC4gVGhlIHN0YW5kYWxvbmVcbi8vIHByb21vdGlvbiBvZiB0aGUgTUMvbWF0Y2hpbmcgQ2hvaWNlR3JhcGggZmlndXJlICh7IGF4aXMsIGRyYXdhYmxlcyB9KSB0byBhXG4vLyBibG9jaywgYnVpbHQgZm9yIHRoZSByZWZlcmVuY2UgcGFuZWwgXHUyMDE0IFwidGhlc2UgdHdvIGxpbmVzIGFyZSBwYXJhbGxlbFwiLXN0eWxlXG4vLyBwaWN0dXJlcyBvbiBhIGZvcm11bGEgc2hlZXQuXG4vL1xuLy8gUmVuZGVyZWQgc2VydmVyLXNpZGUgYXMgaW5saW5lIFNWRyBieSB0aGUgcmVuZGVyZXIncyBncmFwaC1zdmcgZW5naW5lLCBuZXZlclxuLy8gdGhlIGludGVyYWN0aXZlIGtpdCBcdTIwMTQgc28gaXQgd29ya3Mgb24gcGFwZXIsIGluIHRoZSBwcmludCBib3gsIGFuZCBpbiB0aGVcbi8vIGZsb2F0aW5nIHBhbmVsIHdpdGggemVybyBKUy4gQ29uc2VxdWVuY2UgKHNhbWUgYXMgQ2hvaWNlR3JhcGgpOiBgZXhwcmVzc2lvbmBcbi8vIGRyYXdhYmxlcyBuZWVkIHRoZSBraXQncyBmb3JtdWxhIHBhcnNlciBhbmQgYXJlIE5PVCBkcmF3bjsgYXV0aG9yaW5nXG4vLyBzdXJmYWNlcyBkb24ndCBvZmZlciB0aGVtIGhlcmUuXG4vL1xuLy8gRGVsaWJlcmF0ZWx5IE5PVCBhIGRpc3BsYXktbW9kZSBpbnRlcmFjdGl2ZV9ncmFwaDogdGhhdCBibG9jayBpcyBhIG51bWJlcmVkLVxuLy8gcXVlc3Rpb24gZmFtaWx5IHdpdGggcHJvbXB0L3NvbHV0aW9uL2NvbmZpZGVuY2UgY2hyb21lIGFuZCBraXQgaHlkcmF0aW9uLlxuLy8gVGhpcyBvbmUgY2FuIG5ldmVyIGFjY2VwdCBzdHVkZW50IGlucHV0IGJ5IGNvbnN0cnVjdGlvbiwgd2hpY2ggaXMgdGhlXG4vLyByZWZlcmVuY2UgcGFuZWwncyBjb250cmFjdC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBjb25zdCBHcmFwaEZpZ3VyZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnZ3JhcGhfZmlndXJlJyksXG4gIGF4aXM6IEF4aXNDb25maWcsXG4gIGRyYXdhYmxlczogei5hcnJheShEcmF3YWJsZSkuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCB0eXBlIEdyYXBoRmlndXJlQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBHcmFwaEZpZ3VyZUJsb2NrPjtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gaW5saW5lLnRzIFx1MjAxNCBJbmxpbmUgY29udGVudCBub2Rlc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIElubGluZSBub2RlcyBhcmUgdGhlIGF0b21zIGluc2lkZSBhIGJsb2NrJ3MgYGNvbnRlbnRgIGFycmF5LiBNb3N0IGJsb2Nrc1xuLy8gYWNjZXB0IHRoZSBJbmxpbmVOb2RlIHVuaW9uICh0ZXh0ICsgaW5saW5lIG1hdGgpLiBUaGUgZmlsbF9pbl9ibGFuayBibG9ja1xuLy8gaXMgc3BlY2lhbDogaXQgYWNjZXB0cyBhbiBleHRlbmRlZCB1bmlvbiB0aGF0IGFsc28gaW5jbHVkZXMgQmxhbmtUb2tlbi5cbi8vXG4vLyBEaXNjcmltaW5hdGlvbjogZXZlcnkgaW5saW5lIG5vZGUgaGFzIGEgYHR5cGVgIGxpdGVyYWwuIFpvZCdzXG4vLyBkaXNjcmltaW5hdGVkVW5pb24ga2V5cyBvbiBpdCwgd2hpY2ggZ2l2ZXMgdXMgbmFycm93IHR5cGVzIGFmdGVyIHBhcnNpbmdcbi8vIGFuZCBjbGVhciBlcnJvciBtZXNzYWdlcyBvbiBtYWxmb3JtZWQgZGF0YS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuLy8gQm90aCBpbXBvcnRzIGFyZSBMRUFGLVNBRkUgXHUyMDE0IG5laXRoZXIgbW9kdWxlIGltcG9ydHMgaW5saW5lLnRzLCBzbyBuZWl0aGVyXG4vLyBjcmVhdGVzIGEgY3ljbGUuIHNpemluZy5qcyBhbmQgYmxvY2tzL2ltYWdlLmpzJ3MgQ3JvcFJlY3QgYXJlIHpvZC1vbmx5O1xuLy8gYmxvY2tzL2dyYXBoLWZpZ3VyZS5qcyByZWFjaGVzIGl0cyBheGlzL2RyYXdhYmxlIHByaW1pdGl2ZXMgdmlhIHRoZSBsZWFmXG4vLyBncmFwaC1wcmltaXRpdmVzLnRzIHByZWNpc2VseSBzbyB0aGF0IHRoaXMgaW1wb3J0IGlzIHBvc3NpYmxlLiBEbyBub3Qgc3dhcFxuLy8gZWl0aGVyIGZvciBhIGJsb2Nrcy8gbW9kdWxlIHRoYXQgY2FycmllcyBJbmxpbmVOb2RlLlxuaW1wb3J0IHsgc2l6aW5nRmllbGRzLCB0eXBlIEJsb2NrQWxpZ24gfSBmcm9tICcuL3NpemluZy5qcyc7XG5pbXBvcnQgeyBDcm9wUmVjdCB9IGZyb20gJy4vYmxvY2tzL2ltYWdlLmpzJztcbmltcG9ydCB7IEdyYXBoRmlndXJlQmxvY2sgfSBmcm9tICcuL2Jsb2Nrcy9ncmFwaC1maWd1cmUuanMnO1xuXG4vLyAtLS0tIE1hcmtzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gTWFya3MgYXJlIGZvcm1hdHRpbmcgYXBwbGllZCB0byBhIHJ1biBvZiB0ZXh0IFx1MjAxNCBub3QgbmVzdGVkIGVsZW1lbnRzIChub1xuLy8gPGVtPjxzdHJvbmc+Li4uPC9zdHJvbmc+PC9lbT4gc3RydWN0dXJlKTsgYSBzaW5nbGUgVGV4dE5vZGUgY2FuIGNhcnJ5XG4vLyBzZXZlcmFsLiBPcmRlciBkb2Vzbid0IG1hdHRlciBcdTIwMTQgcmVuZGVyIG91dHB1dCBpcyBjYW5vbmljYWxpemVkLlxuLy9cbi8vIEVhY2ggbWFyayBpcyBhbiBPQkpFQ1Qgd2l0aCBhIGB0eXBlYCBkaXNjcmltaW5hbnQuIFNpbXBsZSBtYXJrcyAoYm9sZCwgZXRjLilcbi8vIGNhcnJ5IG9ubHkgYHR5cGVgOyBhdHRyaWJ1dGUtY2FycnlpbmcgbWFya3MgKGUuZy4gYGRlZmluaXRpb25gKSBoYW5nIHRoZWlyXG4vLyBkYXRhIG9mZiB0aGUgc2FtZSBvYmplY3QuIExlZ2FjeSBkb2N1bWVudHMgc3RvcmVkIG1hcmtzIGFzIGJhcmUgc3RyaW5nc1xuLy8gKCdib2xkJyk7IHRoZSBwcmVwcm9jZXNzIGJlbG93IHVwZ3JhZGVzIHRob3NlIHRvIHRoZSBvYmplY3QgZm9ybSBvbiByZWFkLCBzb1xuLy8gb2xkIGFjdGl2aXRpZXMga2VlcCBwYXJzaW5nIHdpdGhvdXQgYSBzY2hlbWFWZXJzaW9uIGJ1bXAuIE5ldyBjb2RlIGFsd2F5c1xuLy8gd3JpdGVzIHRoZSBvYmplY3QgZm9ybS5cbmV4cG9ydCBjb25zdCBTSU1QTEVfTUFSS19UWVBFUyA9IFtcbiAgJ2JvbGQnLFxuICAnaXRhbGljJyxcbiAgJ3VuZGVybGluZScsXG4gICdjb2RlJyxcbiAgJ3N1YnNjcmlwdCcsXG4gICdzdXBlcnNjcmlwdCcsXG5dIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgU2ltcGxlTWFya1R5cGUgPSAodHlwZW9mIFNJTVBMRV9NQVJLX1RZUEVTKVtudW1iZXJdO1xuXG5jb25zdCBCb2xkTWFyayA9IHoub2JqZWN0KHsgdHlwZTogei5saXRlcmFsKCdib2xkJykgfSk7XG5jb25zdCBJdGFsaWNNYXJrID0gei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ2l0YWxpYycpIH0pO1xuY29uc3QgVW5kZXJsaW5lTWFyayA9IHoub2JqZWN0KHsgdHlwZTogei5saXRlcmFsKCd1bmRlcmxpbmUnKSB9KTtcbmNvbnN0IENvZGVNYXJrID0gei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ2NvZGUnKSB9KTtcbmNvbnN0IFN1YnNjcmlwdE1hcmsgPSB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnc3Vic2NyaXB0JykgfSk7XG5jb25zdCBTdXBlcnNjcmlwdE1hcmsgPSB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnc3VwZXJzY3JpcHQnKSB9KTtcblxuLy8gVGhlIGF0dHJpYnV0ZS1mcmVlIG1hcmtzIGFzIGEgdW5pb24uIERlZmluaXRpb24gY29udGVudCAoYmVsb3cpIGFsbG93cyBvbmx5XG4vLyB0aGVzZSBcdTIwMTQgYSBkZWZpbml0aW9uIGNhbiBiZSBmb3JtYXR0ZWQgYnV0IGNhbm5vdCBpdHNlbGYgY29udGFpbiBhIG5lc3RlZFxuLy8gZGVmaW5pdGlvbiwgd2hpY2ggYWxzbyBrZWVwcyB0aGUgc2NoZW1hIG5vbi1yZWN1cnNpdmUuXG5jb25zdCBTaW1wbGVNYXJrID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIEJvbGRNYXJrLFxuICBJdGFsaWNNYXJrLFxuICBVbmRlcmxpbmVNYXJrLFxuICBDb2RlTWFyayxcbiAgU3Vic2NyaXB0TWFyayxcbiAgU3VwZXJzY3JpcHRNYXJrLFxuXSk7XG5cbi8vIC0tLS0gTWF0aCBwcm9tcHQgKE1vZGVsIEE6IGluLWVxdWF0aW9uIGJsYW5rKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIGdyYWRlYWJsZSBnYXAgSU5TSURFIGEgcmVuZGVyZWQgZXF1YXRpb24gXHUyMDE0IHRoZSBNYXRoTGl2ZSBgXFxwbGFjZWhvbGRlcltpZF17fWBcbi8vIGZlYXR1cmUuIGBpZGAgbWF0Y2hlcyB0aGUgcGxhY2Vob2xkZXIgbWFya2VyIGluIHRoZSBvd25pbmcgbm9kZSdzIGBsYXRleGA7IHRoZVxuLy8gc3R1ZGVudCdzIHR5cGVkIG1hdGggZXhwcmVzc2lvbiBpcyBncmFkZWQgZXhhY3RseSBsaWtlIGEgJ21hdGgnIGZpbGwtaW4tYmxhbmtcbi8vIChudW1lcmljLXNhbXBsaW5nIGVxdWl2YWxlbmNlLCAyYSBcdTIyNjEgYSthIFx1MjI2MSBhKjIpLiBNb2RlbCBBIHJldXNlcyB0aGUgZXhpc3Rpbmdcbi8vIGBzdWJtaXNzaW9ucy5yZXNwb25zZXMuYmxhbmtzYCBtYXAga2V5ZWQgYnkgdGhpcyBpZCwgc28gcHJvbXB0cyBuZWVkIE5PIG5ld1xuLy8gd2lyZSBzaGFwZS4gQSBnYXAgaXMgaW5oZXJlbnRseSBhIG1hdGggYW5zd2VyLCBzbyB0aGVyZSBpcyBubyBgYW5zd2VyVHlwZWBcbi8vIGhlcmUgXHUyMDE0IGBlcXVpdmFsZW5jZWAgKyBgdG9sZXJhbmNlYCBhcmUgdGhlIHNhbWUgZ3JhZGluZyBrbm9icyBhICdtYXRoJ1xuLy8gQmxhbmtUb2tlbiBjYXJyaWVzLCByZXVzZWQgdmVyYmF0aW0uIFNlZSBkb2NzL2Rlc2lnbi9tYXRoLWJsYW5rcy5tZCAoTW9kZWwgQSkuXG5leHBvcnQgY29uc3QgTWF0aFByb21wdCA9IHoub2JqZWN0KHtcbiAgLy8gTWF0Y2hlcyB0aGUgYFxccGxhY2Vob2xkZXJbaWRde31gIG1hcmtlciBpbiB0aGUgb3duaW5nIG5vZGUncyBsYXRleC4gTk9UIGFcbiAgLy8gdXVpZDogTWF0aExpdmUgcGxhY2Vob2xkZXIgaWRzIG1heSBub3QgY29udGFpbiBzcGFjZXMvc3BlY2lhbCBjaGFyYWN0ZXJzXG4gIC8vICh1dWlkIGh5cGhlbnMgYXJlIHVuc2FmZSksIHNvIHRoZSBlZGl0b3IgbWludHMgYSBNYXRoTGl2ZS1zYWZlIHRva2VuLlxuICAvLyBEb2N1bWVudC13aWRlIHVuaXF1ZW5lc3MgKGl0IGtleXMgaW50byB0aGUgYmxhbmtzIG1hcCkgaXMgYW4gYXV0aG9yaW5nLXRpbWVcbiAgLy8gaW52YXJpYW50LCBub3QgYSBzY2hlbWEgY29uc3RyYWludC5cbiAgaWQ6IHouc3RyaW5nKCkubWluKDEpLFxuICBhbnN3ZXI6IHouc3RyaW5nKCkubWluKDEpLFxuICAvLyBBbHRlcm5hdGl2ZSBhY2NlcHRhYmxlIGZvcm1zIChcImFsc28gYWNjZXB0XCIpLiBFbXB0eSBhcnJheSBpcyB0aGUgY29tbW9uIGNhc2UuXG4gIGFjY2VwdGFibGVBbnN3ZXJzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICAvLyBFcXVpdmFsZW5jZSBtb2RlOiAndmFsdWUnIChkZWZhdWx0LCBhbnkgZXhwcmVzc2lvbiB0aGF0IGV2YWx1YXRlcyBlcXVhbCkgb3JcbiAgLy8gJ2V4YWN0LWZvcm0nIChub3JtYWxpemVkLXN0cmluZyBtYXRjaCkuIEFic2VudCA9ICd2YWx1ZScuIE1pcnJvcnMgQmxhbmtUb2tlbi5cbiAgZXF1aXZhbGVuY2U6IHouZW51bShbJ3ZhbHVlJywgJ2V4YWN0LWZvcm0nXSkub3B0aW9uYWwoKSxcbiAgLy8gQWJzb2x1dGUgc2FtcGxpbmcgdG9sZXJhbmNlLiBBYnNlbnQgPSBubyBleHRyYSBzbGFjay4gTWlycm9ycyBCbGFua1Rva2VuLlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubWluKDApLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE1hdGhQcm9tcHQgPSB6LmluZmVyPHR5cGVvZiBNYXRoUHJvbXB0PjtcblxuLy8gLS0tLSBJbmxpbmUgbWF0aCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIExhVGVYIHNvdXJjZSBmb3IgS2FUZVguIFN0b3JlZCB2ZXJiYXRpbTsgcmVuZGVyZWQgYXQgcmVuZGVyIHRpbWUuIFRoZVxuLy8gcmVuZGVyZXIgaXMgdG9sZXJhbnQgb2YgaW52YWxpZCBMYVRlWCAocmVuZGVycyBhbiBlcnJvciBpbmRpY2F0b3IgcmF0aGVyXG4vLyB0aGFuIGNyYXNoaW5nKSBzbyBzYXZpbmcgYSBkb2Mgd2l0aCBicm9rZW4gbWF0aCBkb2Vzbid0IGxvY2sgdGhlIGVkaXRvci5cbmV4cG9ydCBjb25zdCBJbmxpbmVNYXRoTm9kZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdtYXRoX2lubGluZScpLFxuICBsYXRleDogei5zdHJpbmcoKSxcbiAgLy8gTW9kZWwgQTogb3B0aW9uYWwgaW4tZXF1YXRpb24gZ3JhZGVhYmxlIGdhcHMgKFx1MDBBN01hdGhQcm9tcHQpLiBPcHRpb25hbCB3aXRoXG4gIC8vIE5PIGRlZmF1bHQgc28gYSBtYXRoIG5vZGUgYXV0aG9yZWQgYmVmb3JlIE1vZGVsIEEgXHUyMDE0IG9yIG9uZSB3aXRoIG5vIGdhcHMgXHUyMDE0XG4gIC8vIHJlLXNlcmlhbGl6ZXMgQllURS1JREVOVElDQUxMWSAoYSBgLmRlZmF1bHQoW10pYCB3b3VsZCBtYXRlcmlhbGl6ZSBgcHJvbXB0czpcbiAgLy8gW11gIG9uIGV2ZXJ5IGxlZ2FjeSBub2RlKS4gU2FtZSBvcHRpb25hbC1uby1kZWZhdWx0IGRpc2NpcGxpbmUgYXNcbiAgLy8gQmxhbmtUb2tlbi5hbnN3ZXJUeXBlL3RvbGVyYW5jZS4gU2VlIGRvY3MvZGVzaWduL21hdGgtYmxhbmtzLm1kIChNb2RlbCBBKS5cbiAgcHJvbXB0czogei5hcnJheShNYXRoUHJvbXB0KS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBJbmxpbmVNYXRoTm9kZSA9IHouaW5mZXI8dHlwZW9mIElubGluZU1hdGhOb2RlPjtcblxuLy8gLS0tLSBIYXJkIGJyZWFrIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEEgc29mdCBsaW5lIGJyZWFrIGluc2lkZSBhIGJsb2NrIChUaXB0YXAncyBoYXJkQnJlYWsgLyBTaGlmdCtFbnRlciksIGFzXG4vLyBvcHBvc2VkIHRvIGEgbmV3IGJsb2NrLiBDYXJyaWVzIG5vIGRhdGEgXHUyMDE0IGl0IHJlbmRlcnMgYXMgPGJyPi4gV2l0aG91dCB0aGlzXG4vLyBub2RlIHRoZSBicmVhayBpcyBkcm9wcGVkIG9uIHNlcmlhbGl6ZSBhbmQgYWRqYWNlbnQgdGV4dCBydW5zIGNvbmNhdGVuYXRlLlxuZXhwb3J0IGNvbnN0IEhhcmRCcmVha05vZGUgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnaGFyZF9icmVhaycpLFxufSk7XG5leHBvcnQgdHlwZSBIYXJkQnJlYWtOb2RlID0gei5pbmZlcjx0eXBlb2YgSGFyZEJyZWFrTm9kZT47XG5cbi8vIC0tLS0gRGVmaW5pdGlvbiBjb250ZW50IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgcmljaCBjb250ZW50IHNob3duIGluIGEgZGVmaW5pdGlvbidzIHBvcG92ZXI6IGZvcm1hdHRlZCB0ZXh0ICsgaW5saW5lXG4vLyBtYXRoICh0aGUgc2FtZSBhbHBoYWJldCB0aGUgYmxhbmsgaGludCB1c2VzKSwgYXV0aG9yZWQgdmlhIHRoZSBzaGFyZWRcbi8vIElubGluZVJpY2hUZXh0RWRpdG9yLiBBIGRlZmluaXRpb24ncyB0ZXh0IHJ1biBjYXJyaWVzIFNpbXBsZU1hcmsgb25seSBcdTIwMTQgbm9cbi8vIG5lc3RlZCBkZWZpbml0aW9ucyBcdTIwMTQgd2hpY2ggYWxzbyBicmVha3MgdGhlIHJlY3Vyc2lvbiB0aGF0IHJldXNpbmcgSW5saW5lTm9kZVxuLy8gaGVyZSB3b3VsZCBjcmVhdGUgKERlZmluaXRpb25NYXJrIFx1MjE5MiBjb250ZW50IFx1MjE5MiB0ZXh0IFx1MjE5MiBtYXJrcyBcdTIxOTIgRGVmaW5pdGlvbk1hcmspLlxuY29uc3QgRGVmaW5pdGlvbkNvbnRlbnRUZXh0ID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3RleHQnKSxcbiAgdGV4dDogei5zdHJpbmcoKSxcbiAgbWFya3M6IHouYXJyYXkoU2ltcGxlTWFyaykuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uQ29udGVudElubGluZSA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBEZWZpbml0aW9uQ29udGVudFRleHQsXG4gIElubGluZU1hdGhOb2RlLFxuICBIYXJkQnJlYWtOb2RlLFxuXSk7XG5leHBvcnQgdHlwZSBEZWZpbml0aW9uQ29udGVudElubGluZSA9IHouaW5mZXI8dHlwZW9mIERlZmluaXRpb25Db250ZW50SW5saW5lPjtcblxuLy8gLS0tLSBEZWZpbml0aW9uIGJsb2NrcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEEgZGVmaW5pdGlvbidzIGNvbnRlbnQgaXMgYSBCTE9DSyBzZXF1ZW5jZSwgc28gYSB2b2NhYnVsYXJ5IHBvcG92ZXIgY2FuIGhvbGRcbi8vIHdoYXQgYSByZWZlcmVuY2Ugc2hlZXQgaG9sZHM6IGEgZGlzcGxheSBlcXVhdGlvbiwgYSBzaG9ydCBwcm9wZXJ0eSBsaXN0LCBhXG4vLyBmaWd1cmUuIFNlZSBkb2NzL2Rlc2lnbi9kZWZpbml0aW9uLXJpY2gtY29udGVudC5tZC5cbi8vXG4vLyBUaGUgdW5pb24gaXMgYSBjdXJhdGVkIHN1YnNldCBvZiB0aGUgcmVmZXJlbmNlIHBhbmVsJ3MgY29udGVudCBibG9ja3MsIGFuZFxuLy8gZXZlcnkgdGV4dC1iZWFyaW5nIG1lbWJlciBpcyBkZWZpbmVkIExPQ0FMTFkgb3ZlciBEZWZpbml0aW9uQ29udGVudElubGluZVxuLy8gcmF0aGVyIHRoYW4gcmV1c2luZyBpdHMgYmxvY2tzLyBzaWJsaW5nLiBUaGF0IGlzIHdoYXQga2VlcHMgdGhlIHNjaGVtYVxuLy8gTk9OLVJFQ1VSU0lWRTogYmxvY2tzL3BhcmFncmFwaC50cyBhbmQgZnJpZW5kcyBjYXJyeSBJbmxpbmVOb2RlLCB3aG9zZVxuLy8gVGV4dE5vZGUgY2FycmllcyBNYXJrLCB3aGljaCBpbmNsdWRlcyBEZWZpbml0aW9uTWFyayBcdTIwMTQgc28gcmV1c2luZyB0aGVtIHdvdWxkXG4vLyBjbG9zZSB0aGUgY3ljbGUgRGVmaW5pdGlvbk1hcmsgLT4gYmxvY2sgLT4gdGV4dCAtPiBtYXJrIC0+IERlZmluaXRpb25NYXJrIGFuZFxuLy8gYWRtaXQgZGVmaW5pdGlvbnMgbmVzdGVkIGluc2lkZSBkZWZpbml0aW9ucyBhdCBhcmJpdHJhcnkgZGVwdGguIEl0IHdvdWxkIGFsc29cbi8vIGxhbmQgb24gdGhlIHNhbWUgdHNjIGRlY2xhcmF0aW9uLXNlcmlhbGl6YXRpb24gbGltaXQgKFRTNzA1NikgdGhhdCBhbHJlYWR5XG4vLyBmb3JjZWQgdGhlIGhhbmQtd3JpdHRlbiBgaW50ZXJmYWNlIEFjdGl2aXR5RG9jdW1lbnRgIGluIGRvY3VtZW50LnRzLlxuLy9cbi8vIEV4Y2x1ZGVkIG9uIHB1cnBvc2UgKGF1dGhvciBydWxpbmdzLCBkZXNpZ24gZG9jIEQyL0QzKTogY29sdW1ucyAodW5yZWFkYWJsZVxuLy8gaW4gYSB+MjhyZW0gcG9wb3ZlciBcdTIwMTQgYSBkZWZpbml0aW9uIHRoYXQgbmVlZHMgdHdvLWNvbHVtbiBsYXlvdXQgSVMgdGhlXG4vLyByZWZlcmVuY2UgcGFuZWwpLCBjYWxsb3V0IChhIG5vdGUgYm94IGluc2lkZSBhIG5vdGUgYm94KSwgYW5kIGV2ZXJ5XG4vLyBxdWVzdGlvbi9pbnRlcmFjdGl2ZSBibG9jayAoYSBkZWZpbml0aW9uIGlzIG5ldmVyIGdyYWRlYWJsZSkuXG4vL1xuLy8gYGlkYCBpcyBPUFRJT05BTCBvbiB0aGUgbG9jYWxseS1kZWZpbmVkIG1lbWJlcnMsIHVubGlrZSBldmVyeSBibG9ja3MvIHNpYmxpbmdcbi8vIHdoZXJlIGl0IGlzIGEgcmVxdWlyZWQgdXVpZC4gVHdvIHJlYXNvbnM6IG5vdGhpbmcgYWRkcmVzc2VzIGEgZGVmaW5pdGlvbiBibG9ja1xuLy8gKGl0IGlzIG5ldmVyIHNjb3JlZCwgbmV2ZXIgYSBzdWJtaXNzaW9uIGtleSwgbmV2ZXIgYSBydW50aW1lIHJlZiBcdTIwMTQgb25seSB0aGVcbi8vIGVkaXRvciB3YW50cyBpdCwgYW5kIHRoZSBlZGl0b3IgYWx3YXlzIG1pbnRzIG9uZSksIGFuZCB0aGUgbGVnYWN5IHVwZ3JhZGVzIGluXG4vLyB0aGUgTWFyayBwcmVwcm9jZXNzIGJlbG93IG11c3QgYmUgREVURVJNSU5JU1RJQy4gQSByZXF1aXJlZCB1dWlkIHdvdWxkIGZvcmNlXG4vLyBjcnlwdG8ucmFuZG9tVVVJRCgpIGF0IHBhcnNlIHRpbWUsIHNvIHBhcnNpbmcgb25lIHN0b3JlZCBkb2N1bWVudCB0d2ljZSB3b3VsZFxuLy8geWllbGQgZGlmZmVyZW50IGlkcyBhbmQgYnJlYWsgcmUtc2VyaWFsaXphdGlvbiBieXRlLWlkZW50aXR5LlxuXG4vLyBFdmVyeSBzY2hlbWEgYmVsb3cgY2FycmllcyBhbiBFWFBMSUNJVCBpbnRlcmZhY2UgKyBgei5ab2RUeXBlPFx1MjAyNj5gIGFubm90YXRpb25cbi8vIHJhdGhlciB0aGFuIHJlbHlpbmcgb24gei5pbmZlci4gVGhpcyBpcyBub3Qgc3R5bGU6IHdpdGhvdXQgaXQsIGFkZGluZyBhXG4vLyA3LW1lbWJlciBibG9jayB1bmlvbiBpbnNpZGUgYSBtYXJrIHRoYXQgZXZlcnkgYmxvY2sncyBpbmxpbmUgY29udGVudCBjYW5cbi8vIHJlYWNoIG92ZXJmbG93cyB0c2MncyBkZWNsYXJhdGlvbi1zZXJpYWxpemF0aW9uIGxpbWl0IGFuZCBmYWlscyB0aGUgYnVpbGQgd2l0aFxuLy8gVFM3MDU2IGluIGZpdmUgZG93bnN0cmVhbSBmaWxlcyAoYmxvY2tzL2luZGV4LnRzJ3MgQmxvY2ssIGRvY3VtZW50LnRzLFxuLy8gbGF5b3V0LnRzKS4gTmFtaW5nIHRoZSB0eXBlcyBzdG9wcyB0aGUgc3RydWN0dXJhbCBleHBhbnNpb24gYXQgdGhpcyBib3VuZGFyeSBcdTIwMTRcbi8vIHRoZSBzYW1lIHJlbWVkeSBgaW50ZXJmYWNlIEFjdGl2aXR5RG9jdW1lbnRgIGFscmVhZHkgYXBwbGllcyBpbiBkb2N1bWVudC50cy5cbi8vIFRoZSBhbm5vdGF0aW9ucyBhcmUgY2hlY2tlZCBhZ2FpbnN0IHRoZSBvYmplY3Qgc2NoZW1hcywgc28gbm90aGluZyBoZXJlIGxvc2VzXG4vLyB0eXBlIHNhZmV0eSwgYW5kIHRoZSBydW50aW1lIG9iamVjdHMgYXJlIHVudG91Y2hlZCAoYSBkaXNjcmltaW5hdGVkVW5pb24gc3RpbGxcbi8vIHBhcnNlcyBhcyBhIGRpc2NyaW1pbmF0ZWRVbmlvbikuXG5cbmNvbnN0IERlZmluaXRpb25CbG9ja0lkID0gei5zdHJpbmcoKS51dWlkKCkub3B0aW9uYWwoKTtcblxuLy8gU2hhcmVkIHNpemluZyBmcmFnbWVudCwgc3BlbGxlZCBvdXQgZm9yIHRoZSBpbnRlcmZhY2VzIGFib3ZlLlxuaW50ZXJmYWNlIERlZmluaXRpb25TaXppbmcge1xuICB3aWR0aD86IG51bWJlcjtcbiAgYWxpZ24/OiBCbG9ja0FsaWduO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25QYXJhZ3JhcGhCbG9jayB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAncGFyYWdyYXBoJztcbiAgY29udGVudDogRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmVbXTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRGVmaW5pdGlvbkhlYWRpbmdCbG9jayB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAnaGVhZGluZyc7XG4gIGxldmVsOiAxIHwgMiB8IDM7XG4gIGNvbnRlbnQ6IERlZmluaXRpb25Db250ZW50SW5saW5lW107XG59XG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25NYXRoQmxvY2sgZXh0ZW5kcyBEZWZpbml0aW9uU2l6aW5nIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIHR5cGU6ICdtYXRoX2Jsb2NrJztcbiAgbGF0ZXg6IHN0cmluZztcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRGVmaW5pdGlvbkltYWdlQmxvY2sgZXh0ZW5kcyBEZWZpbml0aW9uU2l6aW5nIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIHR5cGU6ICdpbWFnZSc7XG4gIHNyYzogc3RyaW5nO1xuICBhbHQ6IHN0cmluZztcbiAgY3JvcD86IENyb3BSZWN0O1xuICBzcmNBc3BlY3Q/OiBudW1iZXI7XG59XG5cbmNvbnN0IERlZmluaXRpb25QYXJhZ3JhcGhCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IERlZmluaXRpb25CbG9ja0lkLFxuICB0eXBlOiB6LmxpdGVyYWwoJ3BhcmFncmFwaCcpLFxuICBjb250ZW50OiB6LmFycmF5KERlZmluaXRpb25Db250ZW50SW5saW5lKS5kZWZhdWx0KFtdKSxcbn0pO1xuXG4vLyBTYW1lIHRocmVlLWxldmVsIGNhcCBhcyBIZWFkaW5nQmxvY2suIFRoZSBwb3BvdmVyIHN0eWxlc2hlZXQgc2NvcGVzIHRoZXNlXG4vLyBkb3duIHNvIGEgcGFuZWwtc2NhbGUgaDEgcmVhZHMgY29ycmVjdGx5IGF0IHBvcG92ZXIgc2NhbGUuXG5jb25zdCBEZWZpbml0aW9uSGVhZGluZ0Jsb2NrID0gei5vYmplY3Qoe1xuICBpZDogRGVmaW5pdGlvbkJsb2NrSWQsXG4gIHR5cGU6IHoubGl0ZXJhbCgnaGVhZGluZycpLFxuICBsZXZlbDogei51bmlvbihbei5saXRlcmFsKDEpLCB6LmxpdGVyYWwoMiksIHoubGl0ZXJhbCgzKV0pLFxuICBjb250ZW50OiB6LmFycmF5KERlZmluaXRpb25Db250ZW50SW5saW5lKS5kZWZhdWx0KFtdKSxcbn0pO1xuXG4vLyBEaXNwbGF5IG1hdGguIEEgZGVmaW5pdGlvbi1sb2NhbCBzaGFwZSByYXRoZXIgdGhhbiBibG9ja3MvbWF0aC1ibG9jay50cydzXG4vLyBNYXRoQmxvY2ssIHdoaWNoIGNhcnJpZXMgYHByb21wdHNgIChpbi1lcXVhdGlvbiBncmFkZWFibGUgZ2FwcykgYW5kXG4vLyBgc29sdXRpb246IElubGluZU5vZGVbXWAgXHUyMDE0IHRoZSBmaXJzdCBpcyBtZWFuaW5nbGVzcyBoZXJlIChhIGRlZmluaXRpb24gaXNcbi8vIG5ldmVyIGdyYWRlYWJsZSwgdGhlIHNhbWUgcG9zdHVyZSB0aGUgcmVmZXJlbmNlIHBhbmVsIGFscmVhZHkgdGFrZXMpIGFuZCB0aGVcbi8vIHNlY29uZCBpcyBleGFjdGx5IHRoZSByZWN1cnNpdmUgZWRnZSBkZXNjcmliZWQgYWJvdmUuIFNpemluZyByaWRlcyBhbG9uZztcbi8vIGxhYmVsRmllbGRzIGRvIG5vdCAoYSBkZWZpbml0aW9uIGJsb2NrIGlzIG5ldmVyIG51bWJlcmVkKS5cbmNvbnN0IERlZmluaXRpb25NYXRoQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgdHlwZTogei5saXRlcmFsKCdtYXRoX2Jsb2NrJyksXG4gIGxhdGV4OiB6LnN0cmluZygpLFxuICAuLi5zaXppbmdGaWVsZHMsXG59KTtcblxuLy8gSWxsdXN0cmF0aXZlIGltYWdlLiBEZWZpbml0aW9uLWxvY2FsIGZvciB0aGUgb3B0aW9uYWwtaWQgcmVhc29uIGFib3ZlLCBidXQgaXRcbi8vIHJldXNlcyB0aGUgc2hhcmVkIHNpemluZyArIGNyb3Agdm9jYWJ1bGFyeSB2ZXJiYXRpbSwgc28gcmVmcmFtaW5nIGEgdGV4dGJvb2tcbi8vIGZpZ3VyZSBkb3duIHRvIHRoZSByZWxldmFudCBjb3JuZXIgd29ya3MgZXhhY3RseSBhcyBpdCBkb2VzIGluIHRoZSBib2R5LlxuLy8gYGNhcHRpb25gIGlzIGRlbGliZXJhdGVseSBhYnNlbnQgKFlBR05JIFx1MjAxNCBhbHQgY292ZXJzIGFjY2Vzc2liaWxpdHksIGFuZCBhXG4vLyBjYXB0aW9uZWQgZmlndXJlIGluIGEgcG9wb3ZlciBpcyB0aGUgcmVmZXJlbmNlIHBhbmVsJ3Mgam9iKTsgYWRkaXRpdmUgbGF0ZXIuXG5jb25zdCBEZWZpbml0aW9uSW1hZ2VCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IERlZmluaXRpb25CbG9ja0lkLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2ltYWdlJyksXG4gIHNyYzogei5zdHJpbmcoKSxcbiAgYWx0OiB6LnN0cmluZygpLmRlZmF1bHQoJycpLFxuICAuLi5zaXppbmdGaWVsZHMsXG4gIGNyb3A6IENyb3BSZWN0Lm9wdGlvbmFsKCksXG4gIHNyY0FzcGVjdDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG59KTtcblxuLy8gTmVzdGVkIGxpc3RzLCBtaXJyb3JpbmcgYmxvY2tzL2xpc3QudHMncyBzaGFwZSBzbyBUYWItdG8taW5kZW50IGluIHRoZVxuLy8gZGVmaW5pdGlvbiBkaWFsb2cgcm91bmQtdHJpcHMuIFNhbWUgcmVjdXJzaW9uIG1lY2hhbmljOiBvbmx5IHRoZSBjeWNsaWMgZWRnZVxuLy8gKGl0ZW0gLT4gbGlzdCAtPiBpdGVtKSBpcyB6LmxhenkoKSwgbGVhdmluZyB0aGUgbGlzdCBibG9ja3MgYXMgcGxhaW5cbi8vIHoub2JqZWN0cyBzbyB0aGV5IHN0YXkgdXNhYmxlIGFzIGRpc2NyaW1pbmF0ZWRVbmlvbiBtZW1iZXJzIGJlbG93LlxuZXhwb3J0IGludGVyZmFjZSBEZWZpbml0aW9uTGlzdEl0ZW0ge1xuICBpZD86IHN0cmluZztcbiAgY29udGVudDogRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmVbXTtcbiAgY2hpbGRyZW4/OiBBcnJheTxEZWZpbml0aW9uQnVsbGV0TGlzdEJsb2NrIHwgRGVmaW5pdGlvbk9yZGVyZWRMaXN0QmxvY2s+O1xufVxuZXhwb3J0IGludGVyZmFjZSBEZWZpbml0aW9uQnVsbGV0TGlzdEJsb2NrIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIHR5cGU6ICdidWxsZXRfbGlzdCc7XG4gIGl0ZW1zOiBEZWZpbml0aW9uTGlzdEl0ZW1bXTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRGVmaW5pdGlvbk9yZGVyZWRMaXN0QmxvY2sge1xuICBpZD86IHN0cmluZztcbiAgdHlwZTogJ29yZGVyZWRfbGlzdCc7XG4gIGl0ZW1zOiBEZWZpbml0aW9uTGlzdEl0ZW1bXTtcbn1cblxuZXhwb3J0IGNvbnN0IERlZmluaXRpb25MaXN0SXRlbTogei5ab2RUeXBlPFxuICBEZWZpbml0aW9uTGlzdEl0ZW0sXG4gIHouWm9kVHlwZURlZixcbiAgdW5rbm93blxuPiA9IHoubGF6eSgoKSA9PlxuICB6Lm9iamVjdCh7XG4gICAgaWQ6IERlZmluaXRpb25CbG9ja0lkLFxuICAgIGNvbnRlbnQ6IHouYXJyYXkoRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmUpLmRlZmF1bHQoW10pLFxuICAgIGNoaWxkcmVuOiB6XG4gICAgICAuYXJyYXkoei51bmlvbihbRGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jaywgRGVmaW5pdGlvbk9yZGVyZWRMaXN0QmxvY2tdKSlcbiAgICAgIC5vcHRpb25hbCgpLFxuICB9KSxcbik7XG5cbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uQnVsbGV0TGlzdEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogRGVmaW5pdGlvbkJsb2NrSWQsXG4gIHR5cGU6IHoubGl0ZXJhbCgnYnVsbGV0X2xpc3QnKSxcbiAgaXRlbXM6IHouYXJyYXkoRGVmaW5pdGlvbkxpc3RJdGVtKS5kZWZhdWx0KFtdKSxcbn0pO1xuXG5leHBvcnQgY29uc3QgRGVmaW5pdGlvbk9yZGVyZWRMaXN0QmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgdHlwZTogei5saXRlcmFsKCdvcmRlcmVkX2xpc3QnKSxcbiAgaXRlbXM6IHouYXJyYXkoRGVmaW5pdGlvbkxpc3RJdGVtKS5kZWZhdWx0KFtdKSxcbn0pO1xuXG4vLyBHcmFwaEZpZ3VyZUJsb2NrIGlzIHRoZSBPTkUgbWVtYmVyIHJldXNlZCB2ZXJiYXRpbTogaXQgaXMgYWxyZWFkeSBpbmxpbmUtZnJlZVxuLy8gKGF4aXMgKyBkcmF3YWJsZXMgb25seSksIHNvIGl0IGludHJvZHVjZXMgbm8gY3ljbGUsIGFuZCBpdCBoYXMgbm8gbGVnYWN5XG4vLyB1cGdyYWRlIHBhdGggdGhhdCB3b3VsZCBuZWVkIHRvIG1pbnQgaXRzIHJlcXVpcmVkIHV1aWQuIEltcG9ydGluZyBpdCBpcyBzYWZlXG4vLyBvbmx5IGJlY2F1c2UgaXRzIG93biBncmFwaCBwcmltaXRpdmVzIG5vdyBjb21lIGZyb20gdGhlIGxlYWZcbi8vIGdyYXBoLXByaW1pdGl2ZXMudHMgcmF0aGVyIHRoYW4gdGhyb3VnaCBibG9ja3MvaW50ZXJhY3RpdmUtZ3JhcGgudHMgXHUyMDE0IHNlZSB0aGVcbi8vIGhlYWRlciBjb21tZW50IHRoZXJlLlxuZXhwb3J0IHR5cGUgRGVmaW5pdGlvbkJsb2NrID1cbiAgfCBEZWZpbml0aW9uUGFyYWdyYXBoQmxvY2tcbiAgfCBEZWZpbml0aW9uSGVhZGluZ0Jsb2NrXG4gIHwgRGVmaW5pdGlvbk1hdGhCbG9ja1xuICB8IERlZmluaXRpb25JbWFnZUJsb2NrXG4gIHwgRGVmaW5pdGlvbkJ1bGxldExpc3RCbG9ja1xuICB8IERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrXG4gIHwgR3JhcGhGaWd1cmVCbG9jaztcblxuZXhwb3J0IGNvbnN0IERlZmluaXRpb25CbG9jazogei5ab2RUeXBlPFxuICBEZWZpbml0aW9uQmxvY2ssXG4gIHouWm9kVHlwZURlZixcbiAgdW5rbm93blxuPiA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBEZWZpbml0aW9uUGFyYWdyYXBoQmxvY2ssXG4gIERlZmluaXRpb25IZWFkaW5nQmxvY2ssXG4gIERlZmluaXRpb25NYXRoQmxvY2ssXG4gIERlZmluaXRpb25JbWFnZUJsb2NrLFxuICBEZWZpbml0aW9uQnVsbGV0TGlzdEJsb2NrLFxuICBEZWZpbml0aW9uT3JkZXJlZExpc3RCbG9jayxcbiAgR3JhcGhGaWd1cmVCbG9jayxcbl0pO1xuXG4vLyBEZWZpbml0aW9uTWFyayBcdTIwMTQgaW5saW5lIHZvY2FidWxhcnkgZGVmaW5pdGlvbiAoUGhhc2UgMikuIGBjb250ZW50YCBpcyB0aGVcbi8vIHJpY2ggZGVmaW5pdGlvbiBzaG93biBpbiB0aGUgcHVibGlzaGVkLXBhZ2UgcG9wb3Zlciwgbm93IGEgYmxvY2sgc2VxdWVuY2Vcbi8vIChzZWUgRGVmaW5pdGlvbkJsb2NrIGFib3ZlKS4gYGdsb3NzYXJ5S2V5YCBpcyByZXNlcnZlZCBmb3IgdGhlIFBoYXNlIDQgdGVuYW50XG4vLyBnbG9zc2FyeSBzdG9yZSAocmVzb2x2ZWQgYXQgcHVibGlzaCkgYW5kIGlzIHVudXNlZCBpbiBQaGFzZSAyLiBUaGUgcmVuZGVyZXJcbi8vIGVtaXRzIGA8c3BhbiBjbGFzcz1cImRlZmluaXRpb25cIiBcdTIwMjY+YCBwbHVzIGEgaGlkZGVuIDx0ZW1wbGF0ZT4gY2FycnlpbmcgdGhlXG4vLyByZW5kZXJlZCBjb250ZW50OyBzZWUgUlVOVElNRS5tZCwgZG9jcy9kZXNpZ24vdm9jYWJ1bGFyeS1kZWZpbml0aW9ucy5tZCwgYW5kXG4vLyBkb2NzL2Rlc2lnbi9kZWZpbml0aW9uLXJpY2gtY29udGVudC5tZC5cbi8vIE5PVCBhbm5vdGF0ZWQgYXMgei5ab2RUeXBlLCB1bmxpa2UgRGVmaW5pdGlvbkJsb2NrIGFib3ZlOiB0aGlzIHNjaGVtYSBpcyBhXG4vLyBtZW1iZXIgb2YgdGhlIGBNYXJrYCBkaXNjcmltaW5hdGVkVW5pb24gYmVsb3csIGFuZCB6LmRpc2NyaW1pbmF0ZWRVbmlvbiBuZWVkc1xuLy8gcmVhbCBab2RPYmplY3RzIHRvIGludHJvc3BlY3QgdGhlIGB0eXBlYCBkaXNjcmltaW5hdG9yLiBUaGUgbmFtZWRcbi8vIERlZmluaXRpb25CbG9jayBhbGlhcyBpcyB3aGF0IGtlZXBzIHRoZSBpbmZlcnJlZCB0eXBlIGhlcmUgc21hbGwgZW5vdWdoIFx1MjAxNCB0aGVcbi8vIHNhbWUgcmVhc29uIGxpc3QudHMga2VlcHMgaXRzIGxpc3QgYmxvY2tzIGFzIHBsYWluIHoub2JqZWN0cyBhbmQgcHV0cyB0aGVcbi8vIHoubGF6eSgpIG9ubHkgb24gdGhlIGN5Y2xpYyBlZGdlLlxuZXhwb3J0IGNvbnN0IERlZmluaXRpb25NYXJrID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2RlZmluaXRpb24nKSxcbiAgY29udGVudDogei5hcnJheShEZWZpbml0aW9uQmxvY2spLmRlZmF1bHQoW10pLFxuICBnbG9zc2FyeUtleTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBEZWZpbml0aW9uTWFyayA9IHouaW5mZXI8dHlwZW9mIERlZmluaXRpb25NYXJrPjtcblxuLy8gQSBkZWZpbml0aW9uJ3MgY29udGVudCBpcyBhIGJsb2NrIGFycmF5IHRvZGF5LCBidXQgdHdvIG9sZGVyIHNoYXBlcyBhcmUgc3RpbGxcbi8vIG91dCB0aGVyZSBpbiBzdG9yZWQgZG9jdW1lbnRzLiBCb3RoIHVwZ3JhZGVzIGJlbG93IGFyZSBwdXJlLCBkZXRlcm1pbmlzdGljXG4vLyByZWFkLXRpbWUgcmV3cml0ZXMgXHUyMDE0IHRoZXkgbWludCBubyBpZHMgYW5kIG5vIHJhbmRvbW5lc3MsIHNvIHBhcnNpbmcgdGhlIHNhbWVcbi8vIHN0b3JlZCBkb2N1bWVudCB0d2ljZSB5aWVsZHMgaWRlbnRpY2FsIG91dHB1dC5cbi8vXG4vLyBUaGV5IENPTVBPU0UsIG9sZGVzdCBmaXJzdCwgYmVjYXVzZSBhIGRvY3VtZW50IGNhbiBjYXJyeSB0aGUgb2xkZXN0IHNoYXBlOlxuLy8gICB2MSAgeyBkZWZpbml0aW9uOiAnYSBzdHJpbmcnIH0gICAgICAgICAgICAgICAgICAgIChwcmUtcmljaC1jb250ZW50KVxuLy8gICB2MiAgeyBjb250ZW50OiBbaW5saW5lXHUyMDI2XSwgaW1hZ2U/OiB7c3JjLCBhbHR9IH0gICAgKFBoYXNlIDIgcmljaCBpbmxpbmUpXG4vLyAgIHYzICB7IGNvbnRlbnQ6IFtibG9ja1x1MjAyNl0gfSAgICAgICAgICAgICAgICAgICAgICAgICAoY3VycmVudClcbi8vIHNvIHYxIFx1MjE5MiB2MiBcdTIxOTIgdjMgbXVzdCBydW4gaW4gc2VxdWVuY2Ugb24gYSBzaW5nbGUgbWFyay5cbi8vIEV4cG9ydGVkIGJlY2F1c2UgdGhlIGFwcCdzIHNlcmlhbGl6ZXIgbmVlZHMgdGhlIElERU5USUNBTCBub3JtYWxpemF0aW9uIHdoZW5cbi8vIGl0IHJlYWRzIGEgZGVmaW5pdGlvbiBtYXJrJ3MgVGlwdGFwIGF0dHJzIFx1MjAxNCBhbiBlZGl0b3Igc2Vzc2lvbiBvcGVuZWQgYmVmb3JlXG4vLyB0aGUgYmxvY2sgbWlncmF0aW9uIHN0aWxsIGNhcnJpZXMgdGhlIHYyIGF0dHIgc2hhcGUuIE9uZSBpbXBsZW1lbnRhdGlvbiwgc29cbi8vIHRoZSBzY2hlbWEgYW5kIHRoZSBzZXJpYWxpemVyIGNhbm5vdCBkcmlmdCBhcGFydCBvbiB3aGF0IGFuIG9sZCBtYXJrIG1lYW5zLlxuZXhwb3J0IGZ1bmN0aW9uIHVwZ3JhZGVEZWZpbml0aW9uTWFyayhtOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHVua25vd24ge1xuICBsZXQgY29udGVudCA9IG0uY29udGVudDtcbiAgY29uc3QgcmVzdCA9IHsgLi4ubSB9O1xuXG4gIC8vIHYxIFx1MjE5MiB2MjogYSBwbGFpbiBgZGVmaW5pdGlvbmAgc3RyaW5nIGJlY29tZXMgYSBzaW5nbGUgaW5saW5lIHRleHQgcnVuLlxuICBpZiAodHlwZW9mIHJlc3QuZGVmaW5pdGlvbiA9PT0gJ3N0cmluZycgJiYgY29udGVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgdGV4dCA9IHJlc3QuZGVmaW5pdGlvbjtcbiAgICBjb250ZW50ID0gdGV4dCA/IFt7IHR5cGU6ICd0ZXh0JywgdGV4dCB9XSA6IFtdO1xuICB9XG4gIGRlbGV0ZSByZXN0LmRlZmluaXRpb247XG5cbiAgLy8gdjIgXHUyMTkyIHYzOiBhbiBJTkxJTkUgY29udGVudCBhcnJheSBiZWNvbWVzIG9uZSBwYXJhZ3JhcGggYmxvY2suIERldGVjdGVkIGJ5XG4gIC8vIHNoYXBlLCBub3QgYnkgYSB2ZXJzaW9uIGZpZWxkIFx1MjAxNCBhbiBpbmxpbmUgbm9kZSBpcyBhIHRleHQgLyBtYXRoX2lubGluZSAvXG4gIC8vIGhhcmRfYnJlYWssIG5vbmUgb2Ygd2hpY2ggaXMgYSBibG9jayBgdHlwZWAsIHNvIHRoZSBmaXJzdCBlbGVtZW50XG4gIC8vIGRpc2NyaW1pbmF0ZXMgdW5hbWJpZ3VvdXNseS4gQW4gZW1wdHkgYXJyYXkgaXMgYWxyZWFkeSB2YWxpZCBhdCBib3RoXG4gIC8vIHZlcnNpb25zIGFuZCBpcyBsZWZ0IGFsb25lLlxuICBjb25zdCBJTkxJTkVfVFlQRVMgPSBbJ3RleHQnLCAnbWF0aF9pbmxpbmUnLCAnaGFyZF9icmVhayddO1xuICBpZiAoQXJyYXkuaXNBcnJheShjb250ZW50KSAmJiBjb250ZW50Lmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBmaXJzdCA9IGNvbnRlbnRbMF0gYXMgeyB0eXBlPzogdW5rbm93biB9IHwgdW5kZWZpbmVkO1xuICAgIGlmICh0eXBlb2YgZmlyc3Q/LnR5cGUgPT09ICdzdHJpbmcnICYmIElOTElORV9UWVBFUy5pbmNsdWRlcyhmaXJzdC50eXBlKSkge1xuICAgICAgY29udGVudCA9IFt7IHR5cGU6ICdwYXJhZ3JhcGgnLCBjb250ZW50IH1dO1xuICAgIH1cbiAgfVxuXG4gIC8vIHYyIFx1MjE5MiB2MyAoRDcpOiB0aGUgc2VwYXJhdGUgYGltYWdlYCBhdHRyIGJlY29tZXMgYSB0cmFpbGluZyBpbWFnZSBibG9jaywgc29cbiAgLy8gdGhlcmUgaXMgZXhhY3RseSBvbmUgd2F5IHRvIGV4cHJlc3MgYW4gaW1hZ2UgaW4gYSBkZWZpbml0aW9uLiBBcHBlbmRlZFxuICAvLyBBRlRFUiB0aGUgdGV4dCwgbWF0Y2hpbmcgd2hlcmUgdGhlIG9sZCBwb3BvdmVyIHJlbmRlcmVkIGl0LlxuICBjb25zdCBpbWFnZSA9IHJlc3QuaW1hZ2U7XG4gIGRlbGV0ZSByZXN0LmltYWdlO1xuICBpZiAoaW1hZ2UgIT09IG51bGwgJiYgdHlwZW9mIGltYWdlID09PSAnb2JqZWN0Jykge1xuICAgIGNvbnN0IHsgc3JjLCBhbHQgfSA9IGltYWdlIGFzIHsgc3JjPzogdW5rbm93bjsgYWx0PzogdW5rbm93biB9O1xuICAgIGlmICh0eXBlb2Ygc3JjID09PSAnc3RyaW5nJyAmJiBzcmMpIHtcbiAgICAgIGNvbnN0IGJsb2NrcyA9IEFycmF5LmlzQXJyYXkoY29udGVudCkgPyBbLi4uY29udGVudF0gOiBbXTtcbiAgICAgIGJsb2Nrcy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgc3JjLFxuICAgICAgICBhbHQ6IHR5cGVvZiBhbHQgPT09ICdzdHJpbmcnID8gYWx0IDogJycsXG4gICAgICB9KTtcbiAgICAgIGNvbnRlbnQgPSBibG9ja3M7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgLi4ucmVzdCwgY29udGVudDogY29udGVudCA/PyBbXSB9O1xufVxuXG5leHBvcnQgY29uc3QgTWFyayA9IHoucHJlcHJvY2VzcyhcbiAgKG0pID0+IHtcbiAgICAvLyBMZWdhY3k6IG1hcmtzIHdlcmUgYmFyZSBzdHJpbmdzICgnYm9sZCcpLlxuICAgIGlmICh0eXBlb2YgbSA9PT0gJ3N0cmluZycpIHJldHVybiB7IHR5cGU6IG0gfTtcbiAgICBpZiAoXG4gICAgICBtICE9PSBudWxsICYmXG4gICAgICB0eXBlb2YgbSA9PT0gJ29iamVjdCcgJiZcbiAgICAgIChtIGFzIHsgdHlwZT86IHVua25vd24gfSkudHlwZSA9PT0gJ2RlZmluaXRpb24nXG4gICAgKSB7XG4gICAgICByZXR1cm4gdXBncmFkZURlZmluaXRpb25NYXJrKG0gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuICAgIH1cbiAgICByZXR1cm4gbTtcbiAgfSxcbiAgei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gICAgQm9sZE1hcmssXG4gICAgSXRhbGljTWFyayxcbiAgICBVbmRlcmxpbmVNYXJrLFxuICAgIENvZGVNYXJrLFxuICAgIFN1YnNjcmlwdE1hcmssXG4gICAgU3VwZXJzY3JpcHRNYXJrLFxuICAgIERlZmluaXRpb25NYXJrLFxuICBdKSxcbik7XG5leHBvcnQgdHlwZSBNYXJrID0gei5pbmZlcjx0eXBlb2YgTWFyaz47XG4vLyBUaGUgc2V0IG9mIG1hcmsgYHR5cGVgIGRpc2NyaW1pbmFudHMsIGZvciBjYWxsZXJzIHRoYXQgYWxsb3ctbGlzdCBieSBuYW1lLlxuZXhwb3J0IHR5cGUgTWFya1R5cGUgPSBNYXJrWyd0eXBlJ107XG5cbi8vIC0tLS0gVGV4dCBub2RlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnQgY29uc3QgVGV4dE5vZGUgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgndGV4dCcpLFxuICB0ZXh0OiB6LnN0cmluZygpLFxuICAvLyBEZWZhdWx0IHRvIGVtcHR5IG1hcmtzIGFycmF5IHNvIGNhbGxlcnMgZG9uJ3QgbmVlZCB0byBzcGVjaWZ5IHdoZW4gbm9uZS5cbiAgbWFya3M6IHouYXJyYXkoTWFyaykuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCB0eXBlIFRleHROb2RlID0gei5pbmZlcjx0eXBlb2YgVGV4dE5vZGU+O1xuXG4vLyAtLS0tIElubGluZU5vZGUgdW5pb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSW5saW5lTm9kZSBpcyB0aGUgc3RhbmRhcmQgaW5saW5lIGFscGhhYmV0LiBVc2VkIGJ5IGFsbCBibG9ja3MgZXhjZXB0XG4vLyBmaWxsX2luX2JsYW5rLiBEZWZpbmVkIGJlZm9yZSBCbGFua1Rva2VuIGJlY2F1c2UgdGhlIGJsYW5rJ3MgcmljaCBmZWVkYmFja1xuLy8gZmllbGRzIChoaW50LCBtaXN0YWtlRmVlZGJhY2spIHJldXNlIHRoaXMgdW5pb24uXG5leHBvcnQgY29uc3QgSW5saW5lTm9kZSA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBUZXh0Tm9kZSxcbiAgSW5saW5lTWF0aE5vZGUsXG4gIEhhcmRCcmVha05vZGUsXG5dKTtcbmV4cG9ydCB0eXBlIElubGluZU5vZGUgPSB6LmluZmVyPHR5cGVvZiBJbmxpbmVOb2RlPjtcblxuLy8gLS0tLSBCbGFuayB0b2tlbiAoZmlsbC1pbi10aGUtYmxhbmsgb25seSkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJsYW5rcyBsaXZlIElOU0lERSB0aGUgaW5saW5lIGNvbnRlbnQgc3RyZWFtIG9mIGEgZmlsbF9pbl9ibGFuayBibG9jayBcdTIwMTRcbi8vIHN0dWRlbnRzIHNlZSBhIHByb21wdCB3aXRoIG9uZSBvciBtb3JlIGlubGluZSBibGFua3MuIEVhY2ggYmxhbmsgaGFzIGFcbi8vIHN0YWJsZSBpZCAocmVmZXJlbmNlZCBpbiBzdWJtaXNzaW9ucy5yZXNwb25zZXMuYmxhbmtzWzxpZD5dKSBhbmQgYW4gYW5zd2VyXG4vLyBrZXkuXG4vL1xuLy8gd2lkdGggaXMgaW4gQ1NTIGNoYXJzIChgY2hgIHVuaXRzKSBcdTIwMTQgdXNlZCB0byBzaXplIHRoZSBpbnB1dC4gT3B0aW9uYWxcbi8vIGJlY2F1c2UgdGhlIHJlbmRlcmVyIGhhcyBhIHNlbnNpYmxlIGRlZmF1bHQgKH42IGNoYXJzKS5cbi8vXG4vLyBoaW50IGFuZCBtaXN0YWtlRmVlZGJhY2sgYXJlIHRoZSBwZXItYmxhbmsgZmVlZGJhY2sgbGF5ZXJzIChibG9jay1sZXZlbFxuLy8gZmllbGRzIFx1MjAxNCBzb2x1dGlvbiwgc2tpbGxzIFx1MjAxNCBsaXZlIG9uIEZpbGxJbkJsYW5rQmxvY2spLlxuLy8gQm90aCBjYXJyeSByaWNoIGlubGluZSBjb250ZW50IChJbmxpbmVOb2RlW106IGZvcm1hdHRlZCB0ZXh0ICsgaW5saW5lIG1hdGgpXG4vLyBzbyBmZWVkYmFjayBjYW4gaW5jbHVkZSB0aGUgc2FtZSBmb3JtYXR0aW5nIGFuZCBtYXRoIGFzIHByb2JsZW0gcHJvc2UuXG4vLyBUaGUgcnVudGltZSByZWFkcyBib3RoIGF0IGluaXQgYnV0IGRvZXMgTk9UIGluamVjdCBhbnl0aGluZyBpbnRvIHRoZSBET01cbi8vIHVudGlsIHRoZSBzdHVkZW50IGNsaWNrcyBcIkNoZWNrIHRoaXMgc2VjdGlvbi5cIiBPbiBhIHdyb25nIGFuc3dlciwgdGhlXG4vLyBydW50aW1lIGZpcnN0IGxvb2tzIGZvciBhIG1hdGNoaW5nIG1pc3Rha2VGZWVkYmFjayBlbnRyeSAoZXhhY3Qgc3RyaW5nXG4vLyBtYXRjaCBmb3IgUGhhc2UgMSk7IGlmIG5vbmUgbWF0Y2hlcywgaXQgZmFsbHMgYmFjayB0byBoaW50OyBpZiBoaW50IGlzXG4vLyBhbHNvIGFic2VudCwgaXQgc2hvd3MgdGhlIGdlbmVyaWMgXHUyNzE3LlxuZXhwb3J0IGNvbnN0IEJsYW5rVG9rZW4gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnYmxhbmsnKSxcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICBhbnN3ZXI6IHouc3RyaW5nKCkubWluKDEpLFxuICAvLyBBbHRlcm5hdGl2ZSBjb3JyZWN0IGFuc3dlcnMuIEVtcHR5IGFycmF5IGlzIHRoZSBjb21tb24gY2FzZS5cbiAgYWNjZXB0YWJsZUFuc3dlcnM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIHdpZHRoOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLy8gT3B0aW9uYWwgdGVhY2hlci1hdXRob3JlZCBudWRnZSBzaG93biB3aGVuIHRoaXMgYmxhbmsgaXMgd3JvbmcgYW5kIG5vXG4gIC8vIG1pc3Rha2VGZWVkYmFjayBlbnRyeSBtYXRjaGVzLiBSaWNoIGlubGluZSBjb250ZW50IChmb3JtYXR0ZWQgdGV4dCArIG1hdGgpLlxuICBoaW50OiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIC8vIE9wdGlvbmFsIGxpc3Qgb2YgYW50aWNpcGF0ZWQgd3JvbmcgYW5zd2VycyBwYWlyZWQgd2l0aCBzcGVjaWZpYyBmZWVkYmFjay5cbiAgLy8gSWYgdGhlIHN0dWRlbnQncyB3cm9uZyBhbnN3ZXIgbWF0Y2hlcyBhIGBtYXRjaGAgc3RyaW5nIChQaGFzZSAxOiBleGFjdFxuICAvLyBtYXRjaDsgdGhlIHN0cmF0ZWd5LWRpc3BhdGNoIGhvb2sgaW4gdGhlIHJ1bnRpbWUgc3VwcG9ydHMgc21hcnRlclxuICAvLyBtYXRjaGluZyBsYXRlciksIHRoZSBjb3JyZXNwb25kaW5nIGZlZWRiYWNrIGlzIHNob3duIGluc3RlYWQgb2YgdGhlXG4gIC8vIGdlbmVyaWMgaGludC4gRmlyc3QgbWF0Y2ggd2lucy4gYGZlZWRiYWNrYCBpcyByaWNoIGlubGluZSBjb250ZW50LlxuICBtaXN0YWtlRmVlZGJhY2s6IHouYXJyYXkoei5vYmplY3Qoe1xuICAgIG1hdGNoOiB6LnN0cmluZygpLFxuICAgIGZlZWRiYWNrOiB6LmFycmF5KElubGluZU5vZGUpLFxuICB9KSkub3B0aW9uYWwoKSxcbiAgLy8gT3JkZXItaW5kZXBlbmRlbnQgYW5zd2VyIGdyb3VwaW5nLiBXaGVuIHRydWUsIHRoaXMgYmxhbmsncyBhbnN3ZXIgaXNcbiAgLy8gaW50ZXJjaGFuZ2VhYmxlIHdpdGggdGhlIGJsYW5rIGltbWVkaWF0ZWx5IGJlZm9yZSBpdCAoaW4gZG9jdW1lbnQgb3JkZXIsXG4gIC8vIHdpdGhpbiB0aGUgc2FtZSBibG9jaykgXHUyMDE0IGUuZy4gZmFjdG9yaW5nIGAoeCArIFx1MjYxMCkoeCArIFx1MjYxMClgIHdoZXJlICgyLDMpIGFuZFxuICAvLyAoMywyKSBhcmUgYm90aCBjb3JyZWN0IGJ1dCAoMiwyKSBpcyBub3QuIEEgXCJncm91cFwiIGlzIGEgbWF4aW1hbCBydW4gb2ZcbiAgLy8gYWRqYWNlbnQgYmxhbmtzIGVhY2ggZmxhZ2dlZCBoZXJlOyB0aGUgcmVuZGVyZXIgY29tcGlsZXMgcnVucyBpbnRvIGFcbiAgLy8gc2hhcmVkIGBkYXRhLWJsYW5rLWdyb3VwYCBpZCwgYW5kIHRoZSBydW50aW1lIHNjb3JlcyB0aGUgZ3JvdXAgd2l0aFxuICAvLyBjb25zdW1lLW9uY2UgbWF0Y2hpbmcgKGVhY2ggY29ycmVjdCBhbnN3ZXIgY2FuIHNhdGlzZnkgb25seSBvbmUgYmxhbmspLlxuICAvL1xuICAvLyBUaGlzIGJvb2xlYW4gaXMgYXV0aG9yaW5nICpzdWdhcio6IHRoZSBnZW5lcmFsIG1vZGVsIGxpdmVzIGluIHRoZSBydW50aW1lXG4gIC8vIGRhdGEtYXR0cmlidXRlIGNvbnRyYWN0IChncm91cCBpZHMpLCBzbyByaWNoZXIgZ3JvdXBpbmcgKG5vbi1hZGphY2VudCxcbiAgLy8gY3Jvc3MtYmxvY2spIGNhbiBiZSBhZGRlZCBsYXRlciBhcyBhbiBhZGRpdGl2ZSBgZ3JvdXBgIGZpZWxkIHdpdGhvdXQgYVxuICAvLyBicmVha2luZyBjaGFuZ2UuIFRoZSBmaXJzdCBibGFuayBpbiBhIGJsb2NrIGlnbm9yZXMgdGhpcyBmbGFnIChub1xuICAvLyBwcmV2aW91cyBibGFuayB0byBncm91cCB3aXRoKS5cbiAgaW50ZXJjaGFuZ2VhYmxlV2l0aFByZXZpb3VzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgLy8gQW5zd2VyIGludGVycHJldGF0aW9uIG1vZGUuIEFic2VudCAoPSAndGV4dCcpIGtlZXBzIHRoZSBQaGFzZSAxIGJlaGF2aW9yOlxuICAvLyBleGFjdCBzdHJpbmcgbWF0Y2ggYWdhaW5zdCBhbnN3ZXIgKyBhY2NlcHRhYmxlQW5zd2Vycy4gJ251bWVyaWMnIHRlbGxzIHRoZVxuICAvLyBydW50aW1lIHRvIHBhcnNlIEJPVEggdGhlIHR5cGVkIHZhbHVlIGFuZCBlYWNoIGtleSBlbnRyeSBudW1lcmljYWxseVxuICAvLyAoZGVjaW1hbHMsIGZyYWN0aW9ucyBsaWtlIDMvMiwgbWl4ZWQgbnVtYmVycyBsaWtlIFwiMSAxLzJcIiwgY29tbWFcbiAgLy8gc2VwYXJhdG9ycywgYSBsZWFkaW5nICQpIGFuZCBjb21wYXJlIHdpdGhpbiBgdG9sZXJhbmNlYCBcdTIwMTQgc28gMC41LCAxLzIsXG4gIC8vIGFuZCAuNTAgYWxsIHNhdGlzZnkgYW4gYW5zd2VyIG9mIFwiMS8yXCIuIE9wdGlvbmFsIHJhdGhlciB0aGFuIGRlZmF1bHRlZCBzb1xuICAvLyBkb2N1bWVudHMgc3RvcmVkIGJlZm9yZSB0aGlzIGZpZWxkIGV4aXN0ZWQgcmUtc2VyaWFsaXplIGJ5dGUtaWRlbnRpY2FsbHkuXG4gIC8vICdtYXRoJyAoTW9kZWwgQiBtYXRoIGJsYW5rcykgZ3JhZGVzIHRoZSB0eXBlZCB2YWx1ZSBhcyBhIG1hdGggRVhQUkVTU0lPTjpcbiAgLy8gdGhlIHJ1bnRpbWUgbGF6eS1sb2FkcyB0aGUgZ3JhcGgta2l0IGFuZCBjb21wYXJlcyBieSBudW1lcmljLXNhbXBsaW5nXG4gIC8vIGVxdWl2YWxlbmNlICgyYSBcdTIyNjEgYSthIFx1MjI2MSBhKjIpLCBOT1Qgc3RyaW5nIG1hdGNoLiBTZWUgZG9jcy9kZXNpZ24vbWF0aC1ibGFua3MubWQuXG4gIGFuc3dlclR5cGU6IHouZW51bShbJ3RleHQnLCAnbnVtZXJpYycsICdtYXRoJ10pLm9wdGlvbmFsKCksXG4gIC8vIEFic29sdXRlIGNvbXBhcmlzb24gdG9sZXJhbmNlLiBGb3IgJ251bWVyaWMnOiB8dHlwZWQgLSBrZXl8IDw9IHRvbGVyYW5jZS5cbiAgLy8gRm9yICdtYXRoJzogdGhlIGFic29sdXRlIHRvbGVyYW5jZSBwYXNzZWQgdG8gdGhlIHNhbXBsaW5nIGNvbXBhcmlzb24uXG4gIC8vIEFic2VudCA9IGV4YWN0IGVxdWFsaXR5IChudW1lcmljKSAvIG5vIGV4dHJhIHNsYWNrIChtYXRoKS5cbiAgdG9sZXJhbmNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxuICAvLyBFcXVpdmFsZW5jZSBtb2RlIGZvciAnbWF0aCcgYmxhbmtzOiAndmFsdWUnIChkZWZhdWx0LCBhbnkgZXhwcmVzc2lvbiB0aGF0XG4gIC8vIGV2YWx1YXRlcyBlcXVhbCkgb3IgJ2V4YWN0LWZvcm0nIChub3JtYWxpemVkLXN0cmluZyBtYXRjaCBcdTIwMTQgXCJ3cml0ZSBpdCBpblxuICAvLyB0aGlzIGZvcm1cIikuIE9ubHkgbWVhbmluZ2Z1bCB3aGVuIGFuc3dlclR5cGUgaXMgJ21hdGgnOyBhYnNlbnQgPSAndmFsdWUnLlxuICBlcXVpdmFsZW5jZTogei5lbnVtKFsndmFsdWUnLCAnZXhhY3QtZm9ybSddKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBCbGFua1Rva2VuID0gei5pbmZlcjx0eXBlb2YgQmxhbmtUb2tlbj47XG5cbi8vIC0tLS0gRmlsbEluQmxhbmtJbmxpbmUgdW5pb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGaWxsSW5CbGFua0lubGluZSBpcyB0aGUgZXh0ZW5kZWQgYWxwaGFiZXQgZm9yIGZpbGxfaW5fYmxhbmsgYmxvY2tzIG9ubHkuXG4vLyBJbmNsdWRlcyBCbGFua1Rva2VuIGluIGFkZGl0aW9uIHRvIHRoZSBzdGFuZGFyZCBpbmxpbmUgbm9kZXMuXG5leHBvcnQgY29uc3QgRmlsbEluQmxhbmtJbmxpbmUgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgVGV4dE5vZGUsXG4gIElubGluZU1hdGhOb2RlLFxuICBIYXJkQnJlYWtOb2RlLFxuICBCbGFua1Rva2VuLFxuXSk7XG5leHBvcnQgdHlwZSBGaWxsSW5CbGFua0lubGluZSA9IHouaW5mZXI8dHlwZW9mIEZpbGxJbkJsYW5rSW5saW5lPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG5leHBvcnQgY29uc3QgUGFyYWdyYXBoQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdwYXJhZ3JhcGgnKSxcbiAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbn0pO1xuZXhwb3J0IHR5cGUgUGFyYWdyYXBoQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBQYXJhZ3JhcGhCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gVGhyZWUgbGV2ZWxzIGlzIGEgZGVsaWJlcmF0ZSBjb25zdHJhaW50LiBXb3Jrc2hlZXRzIGRvbid0IG5lZWQgZGVlcGVyXG4vLyBoaWVyYXJjaHkgYW5kIGNhcHBpbmcgaXQgYXQgMyBrZWVwcyB0aGUgdmlzdWFsIGhpZXJhcmNoeSBtZWFuaW5nZnVsLlxuZXhwb3J0IGNvbnN0IEhlYWRpbmdMZXZlbCA9IHoudW5pb24oW3oubGl0ZXJhbCgxKSwgei5saXRlcmFsKDIpLCB6LmxpdGVyYWwoMyldKTtcbmV4cG9ydCB0eXBlIEhlYWRpbmdMZXZlbCA9IHouaW5mZXI8dHlwZW9mIEhlYWRpbmdMZXZlbD47XG5cbmV4cG9ydCBjb25zdCBIZWFkaW5nQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdoZWFkaW5nJyksXG4gIGxldmVsOiBIZWFkaW5nTGV2ZWwsXG4gIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG59KTtcbmV4cG9ydCB0eXBlIEhlYWRpbmdCbG9jayA9IHouaW5mZXI8dHlwZW9mIEhlYWRpbmdCbG9jaz47XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGxhYmVsLnRzIFx1MjAxNCBTaGFyZWQgcGVyLWJsb2NrIGRpc3BsYXktbGFiZWwgZnJhZ21lbnQgKG51bWJlcmluZy9sYWJlbCBkZWNvdXBsZSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWNvdXBsZXMgXCJpcyB0aGlzIGdyYWRlYWJsZT9cIiBmcm9tIFwiZG9lcyBpdCB3ZWFyIGEgcHJvYmxlbSBudW1iZXI/XCIuIEFcbi8vIGdyYWRlYWJsZSBibG9jayBpcyBhbHdheXMgc2NvcmVkIGFuZCBhbHdheXMgcmV2aWV3YWJsZTsgdGhpcyBmaWVsZCBjb250cm9sc1xuLy8gb25seSB3aGF0IHNob3dzIG9uIHRoZSBwYWdlOlxuLy9cbi8vICAgYXV0byAgIFx1MjAxNCB0aGUgZGVmYXVsdDogYSBudW1iZXJlZCBwcm9ibGVtLCBjb25zdW1pbmcgb25lIHNsb3Qgb2YgdGhlXG4vLyAgICAgICAgICAgIGRvY3VtZW50LXdpZGUgc2VxdWVuY2UgKHRvZGF5J3MgYmVoYXZpb3IgZm9yIGV2ZXJ5IGdyYWRlYWJsZSBibG9jaykuXG4vLyAgIGN1c3RvbSBcdTIwMTQgc2hvdyBhdXRob3JlZCB0ZXh0IChcIldhcm0tdXBcIiwgXCJDaGFsbGVuZ2VcIikgaW5zdGVhZCBvZiBhIG51bWJlcixcbi8vICAgICAgICAgICAgYW5kIERPTidUIGNvbnN1bWUgYSBzZXF1ZW5jZSBzbG90IChvdXQtb2Ytc2VxdWVuY2UgbGFiZWwpLlxuLy8gICBub25lICAgXHUyMDE0IHNob3cgbm90aGluZzsgRE9OJ1QgY29uc3VtZSBhIHNsb3QuIFRoZSBub3RlcyBrZXl3b3JkLWJsYW5rIGNhc2U6XG4vLyAgICAgICAgICAgIGEgZ3JhZGVhYmxlIGdhcCB0aGF0IGtlZXBzIHN0dWRlbnRzIHJlYWRpbmcgd2l0aG91dCBsb29raW5nIGxpa2UgYVxuLy8gICAgICAgICAgICBxdWl6IHF1ZXN0aW9uLiBTdGlsbCBzY29yZWQsIHN0aWxsIGluIHRoZSB0ZWFjaGVyJ3MgcmVzdWx0cyB2aWV3XG4vLyAgICAgICAgICAgIChsb2NhdGVkIGJ5IGl0cyBzdXJyb3VuZGluZyB0ZXh0LCBub3QgYSBudW1iZXIpLlxuLy9cbi8vIE9wdGlvbmFsIHdpdGggTk8gZGVmYXVsdCwgZXhhY3RseSBsaWtlIHNpemluZ0ZpZWxkcyBhbmQgbWF0aF9ibG9jay5wcm9tcHRzOlxuLy8gYW4gYWJzZW50IGBsYWJlbGAgbWVhbnMgYGF1dG9gLCBzbyBhIGJsb2NrIGF1dGhvcmVkIGJlZm9yZSB0aGlzIGZlYXR1cmUgXHUyMDE0IG9yXG4vLyBvbmUgbGVmdCBhdCB0aGUgZGVmYXVsdCBcdTIwMTQgcmUtc2VyaWFsaXplcyBCWVRFLUlERU5USUNBTExZLiBUaGUgcmVuZGVyZXIgYW5kXG4vLyBlZGl0b3IgdHJlYXQgYHVuZGVmaW5lZGAgYW5kIGB7bW9kZTonYXV0byd9YCBpZGVudGljYWxseS5cbi8vXG4vLyBUaGUgcGVyLWJsb2NrIG1hbnVhbCBpbnRlZ2VyIGBudW1iZXJgIG92ZXJyaWRlIGlzIG9ydGhvZ29uYWwgYW5kIHN0aWxsIGxpdmVzXG4vLyBvbiB0aGUgaW5kaXZpZHVhbCBibG9ja3M6IGl0IHJlbGFiZWxzIHRoZSBzaG93biBpbnRlZ2VyIHdoaWxlIFNUQVlJTkcgaW5cbi8vIHNlcXVlbmNlLCBhbmQgaXQgYXBwbGllcyBvbmx5IHdoZW4gdGhlIGxhYmVsIG1vZGUgaXMgYXV0byAoY3VzdG9tL25vbmUgd2luKS5cbi8vIFNlZSBkb2NzL2Rlc2lnbiArIGJsb2NrLXByZWRpY2F0ZXMudHMuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcblxuZXhwb3J0IGNvbnN0IEJsb2NrTGFiZWwgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbignbW9kZScsIFtcbiAgei5vYmplY3QoeyBtb2RlOiB6LmxpdGVyYWwoJ2F1dG8nKSB9KSxcbiAgLy8gbWluKDEpOiBhbiBlbXB0eSBjdXN0b20gbGFiZWwgaXMgbWVhbmluZ2xlc3MgXHUyMDE0IGF1dGhvciBlaXRoZXIgd2FudHMgdGV4dCBvclxuICAvLyB3YW50cyBgbm9uZWAuIEtlZXBzIHJvdW5kLXRyaXAgaG9uZXN0IChubyBlbXB0eS1zdHJpbmcgZ2hvc3RzKS5cbiAgei5vYmplY3QoeyBtb2RlOiB6LmxpdGVyYWwoJ2N1c3RvbScpLCB0ZXh0OiB6LnN0cmluZygpLm1pbigxKSB9KSxcbiAgei5vYmplY3QoeyBtb2RlOiB6LmxpdGVyYWwoJ25vbmUnKSB9KSxcbl0pO1xuZXhwb3J0IHR5cGUgQmxvY2tMYWJlbCA9IHouaW5mZXI8dHlwZW9mIEJsb2NrTGFiZWw+O1xuXG4vLyBTcHJlYWQgaW50byBhIGdyYWRlYWJsZSBibG9jaydzIHoub2JqZWN0KHsuLi59KSBzaGFwZS4gUGxhaW4gb2JqZWN0IChub3QgYSBab2Rcbi8vIHNjaGVtYSkgc28gZWFjaCBibG9jayBrZWVwcyBhIGZsYXQgZmllbGQgbGlzdCBhbmQgZGlzY3JpbWluYXRlZFVuaW9uIGtlZXBzXG4vLyB3b3JraW5nLCBtaXJyb3Jpbmcgc2l6aW5nRmllbGRzLlxuZXhwb3J0IGNvbnN0IGxhYmVsRmllbGRzID0ge1xuICBsYWJlbDogQmxvY2tMYWJlbC5vcHRpb25hbCgpLFxufTtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IHNpemluZ0ZpZWxkcyB9IGZyb20gJy4uL3NpemluZy5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcbmltcG9ydCB7IE1hdGhQcm9tcHQsIElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG4vLyBEaXNwbGF5IG1hdGggKGNlbnRlcmVkLCBmdWxsIHdpZHRoIGJ5IGRlZmF1bHQpLiBJbmxpbmUgbWF0aCBpcyBpbiBpbmxpbmUudHNcbi8vIGFzIElubGluZU1hdGhOb2RlLiBUaGV5J3JlIHNlcGFyYXRlIG5vZGUgdHlwZXMgYmVjYXVzZSB0aGV5IHJlbmRlclxuLy8gZGlmZmVyZW50bHkgYW5kIGhhdmUgZGlmZmVyZW50IHNlbWFudGljIG1lYW5pbmcuXG5leHBvcnQgY29uc3QgTWF0aEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnbWF0aF9ibG9jaycpLFxuICBsYXRleDogei5zdHJpbmcoKSxcbiAgLy8gTW9kZWwgQTogb3B0aW9uYWwgaW4tZXF1YXRpb24gZ3JhZGVhYmxlIGdhcHMgKFx1MDBBN01hdGhQcm9tcHQsIGlubGluZS50cykuXG4gIC8vIE9wdGlvbmFsIHdpdGggTk8gZGVmYXVsdCBzbyBhIG1hdGggYmxvY2sgYXV0aG9yZWQgYmVmb3JlIE1vZGVsIEEgXHUyMDE0IG9yIG9uZVxuICAvLyB3aXRoIG5vIGdhcHMgXHUyMDE0IHJlLXNlcmlhbGl6ZXMgQllURS1JREVOVElDQUxMWS4gU2VlIGRvY3MvZGVzaWduL21hdGgtYmxhbmtzLm1kLlxuICBwcm9tcHRzOiB6LmFycmF5KE1hdGhQcm9tcHQpLm9wdGlvbmFsKCksXG4gIC8vIFdvcmtlZCBleHBsYW5hdGlvbiByZXZlYWxlZCBwb3N0LWNoZWNrLCBtaXJyb3JpbmcgRmlsbEluQmxhbmtCbG9jay5zb2x1dGlvbi5cbiAgLy8gT3B0aW9uYWw7IG9ubHkgbWVhbmluZ2Z1bCBvbiBhIGdhcC1iZWFyaW5nIGVxdWF0aW9uLiBOZXZlciBsZWFrcyB0aGUgZ2FwXG4gIC8vIGFuc3dlciBkaXJlY3RseSAodGhlIHNhbmN0aW9uZWQgcmV2ZWFsLCBwZXIgdGhlIHJ1bnRpbWUncyBuby1sZWFrIHN0YW5jZSkuXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIC8vIFZhcmlhYmxlIGJsb2NrIHNpemluZzogb3B0aW9uYWwgd2lkdGggZnJhY3Rpb24gKyBhbGlnbm1lbnQgKHNpemluZy50cykuXG4gIC4uLnNpemluZ0ZpZWxkcyxcbiAgLy8gUGVyLWJsb2NrIGRpc3BsYXkgbGFiZWwgXHUyMDE0IGEgZ2FwLWJlYXJpbmcgZXF1YXRpb24gaXMgYSBudW1iZXJlZCBwcm9ibGVtIGJ5XG4gIC8vIGRlZmF1bHQ7IGN1c3RvbS9ub25lIG9wdCBvdXQgKG51bWJlcmluZy9sYWJlbCBkZWNvdXBsZSkuIEluZXJ0IG9uIGFcbiAgLy8gcHJvbXB0LWZyZWUgZGlzcGxheSBlcXVhdGlvbiAoaXQncyBuZXZlciBudW1iZXJlZCByZWdhcmRsZXNzKS4gU2VlIGxhYmVsLnRzLlxuICAuLi5sYWJlbEZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgTWF0aEJsb2NrID0gei5pbmZlcjx0eXBlb2YgTWF0aEJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG4vLyBGb3VyIHZhcmlhbnRzIGlzIGEgZGVsaWJlcmF0ZSBjb25zdHJhaW50LiBNb3JlIHRoYW4gdGhpcyBhbmQgc3R5bGluZ1xuLy8gYmVjb21lcyBpbmNvbnNpc3RlbnQgYWNyb3NzIHdvcmtzaGVldHMuIEFkZGluZyBhIG5ldyB2YXJpYW50IGxhdGVyIGlzIGFcbi8vIGJyZWFraW5nIHNjaGVtYSBjaGFuZ2UgXHUyMDE0IGNvbnNpZGVyIHRoYXQgYmVmb3JlIGV4dGVuZGluZy5cbmV4cG9ydCBjb25zdCBDYWxsb3V0VmFyaWFudCA9IHouZW51bShbJ2luZm8nLCAnd2FybmluZycsICdzdWNjZXNzJywgJ25vdGUnXSk7XG5leHBvcnQgdHlwZSBDYWxsb3V0VmFyaWFudCA9IHouaW5mZXI8dHlwZW9mIENhbGxvdXRWYXJpYW50PjtcblxuZXhwb3J0IGNvbnN0IENhbGxvdXRCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2NhbGxvdXQnKSxcbiAgdmFyaWFudDogQ2FsbG91dFZhcmlhbnQsXG4gIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG59KTtcbmV4cG9ydCB0eXBlIENhbGxvdXRCbG9jayA9IHouaW5mZXI8dHlwZW9mIENhbGxvdXRCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFx1MjZCMCBUT01CU1RPTkUgXHUyMDE0IGBwcm9ibGVtYCBJUyBERUFELiBEbyBub3QgYnVpbGQgb24gaXQuIChSdWxpbmcgRTEsIDIwMjYtMDgtMTkpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGJsb2NrIHN0aWxsIHBhcnNlcywgYmVjYXVzZSBkb2N1bWVudHMgaW4gdGhlIGRhdGFiYXNlIG1heSBjb250YWluIG9uZSBhbmRcbi8vIHRoZSBzY2hlbWEgaXMgdGhlIHRoaW5nIHRoYXQgbXVzdCBrZWVwIHJlYWRpbmcgdGhlbS4gTk9USElORyBFTFNFIGFib3V0IGl0IGlzXG4vLyBhbGl2ZTpcbi8vXG4vLyAgIC0gVGhlIEVESVRPUiBDQU5OT1QgSE9MRCBPTkUuIHNlcmlhbGl6ZS50cydzIGFjdGl2aXR5QmxvY2tUb1RpcHRhcCBoYXMgbm9cbi8vICAgICBgcHJvYmxlbWAgbWFwcGluZyBhbmQgcmV0dXJucyBudWxsLCBzbyBhbiBpbXBvcnRlZCBvciBoYW5kLWluc2VydGVkXG4vLyAgICAgcHJvYmxlbSBpcyBkcm9wcGVkIGZyb20gdGhlIGVkaXRvciB2aWV3IGFuZCBERUxFVEVEIGJ5IHRoZSBmaXJzdFxuLy8gICAgIGF1dG9zYXZlLiBUaGlzIGlzIG5vdCBhIGdhcCB0byBmaWxsOyBpdCBpcyB3aHkgdGhlIGJsb2NrIGlzIGRlYWQuXG4vLyAgIC0gVGhlcmUgaXMgbm8gaW1wb3J0ZXIgZmVuY2UsIG5vIGluc2VydCBhZmZvcmRhbmNlLCBhbmQgbm8gZWRpdG9yIE5vZGVWaWV3LlxuLy8gICAtIFRoZSB2aWV3ZXIncyBQcm9ibGVtLnRzeCByZW5kZXJzIGl0IHJlYWQtb25seSBmb3IgdGhlIGRvY3VtZW50cyB0aGF0XG4vLyAgICAgYWxyZWFkeSBoYXZlIG9uZSwgYW5kIHRoYXQgaXMgaXRzIGVudGlyZSByZW1haW5pbmcgam9iLlxuLy9cbi8vIFRoZSBhbnN3ZXIta2V5IGRlc2lnbiBwYXNzIChkb2NzL2Rlc2lnbi9wcm9ibGVtLWFuc3dlci1rZXkubWQpIG9wZW5lZCBieVxuLy8gcHJvcG9zaW5nIHRvIFJFVklWRSB0aGlzIGJsb2NrIGFzIHRoZSBob21lIG9mIHBhcGVyIHByb2JsZW1zLiBUaGUgc2NvcGUgZ2F0ZVxuLy8gb3ZlcnR1cm5lZCB0aGF0IHByZW1pc2Ugb24gdGhlIGV2aWRlbmNlIGFib3ZlOiBwYXBlciBwcm9ibGVtcyBzaGlwIG9uXG4vLyBzaG9ydF9hbnN3ZXIvZXNzYXksIHdoaWNoIGhhdmUgdGhlIGVkaXRvciwgdGhlIGZlbmNlcywgdGhlIHZpZXdlciwgYW5kIDAwMzQnc1xuLy8gZ3JhZGluZyBxdWV1ZSB0aGF0IGBwcm9ibGVtYCBuZXZlciBoYWQuIEZ1bGwgUkVNT1ZBTCBvZiB0aGUgdHlwZSAod2l0aCB0aGVcbi8vIFA1IGNsYWltcy1ncmVwIG92ZXIgZXZlcnkgY29tbWVudCB0aGF0IGNpdGVzIGl0KSBpcyBhIHJlY29yZGVkIFRPRE8sIG5vdCBwYXJ0XG4vLyBvZiB0aGF0IHNsaWNlIFx1MjAxNCByZW1vdmluZyBhIHBhcnNlYWJsZSBzaGFwZSBpcyBhIG1pZ3JhdGlvbiBxdWVzdGlvbi5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIEF1dG8tbnVtYmVyZWQgYXQgcmVuZGVyIHRpbWUgYnkgd2Fsa2luZyB0aGUgZG9jdW1lbnQgYW5kIGNvdW50aW5nIHByb2JsZW1cbi8vIGJsb2NrcyBpbiBvcmRlci4gVGhlIG9wdGlvbmFsIGBudW1iZXJgIGZpZWxkIG92ZXJyaWRlcyB0aGUgYXV0by1udW1iZXJcbi8vIChyYXJlIGNhc2VzIGxpa2UgXCJQcm9ibGVtIDVhXCIgb3IgaGFuZC1udW1iZXJlZCBsZWdhY3kgd29ya3NoZWV0cykuXG4vL1xuLy8gc29sdXRpb246IG9wdGlvbmFsIHdvcmtlZCBleHBsYW5hdGlvbiBzaG93biB0byBhbGwgc3R1ZGVudHMgYWZ0ZXIgdGhlXG4vLyBzZWN0aW9uIGlzIGNoZWNrZWQgKG9yIGFmdGVyIGZpbmFsIHN1Ym1pdCBpbiBzaW5nbGUtbW9kZSBhY3Rpdml0aWVzKSxcbi8vIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGV5IGFuc3dlcmVkIGNvcnJlY3RseS4gRGlmZmVyZW50IGZyb20gaGludCBcdTIwMTRcbi8vIGhpbnRzIG51ZGdlIGR1cmluZyB0aGUgYXR0ZW1wdDsgc29sdXRpb25zIGV4cGxhaW4gYWZ0ZXIuIFRoZSBydW50aW1lXG4vLyByZWFkcyB0aGlzIG9uIGluaXQgYnV0IGRvZXMgTk9UIGluamVjdCBpdCBpbnRvIHRoZSBET00gdW50aWwgYWZ0ZXJcbi8vIGNoZWNrIChQaGFzZSAxIHNlY3VyaXR5IGNlaWxpbmcgXHUyMDE0IGRvbid0IG1ha2UgdGhlIGxlYWsgd29yc2UpLlxuLy9cbi8vIHNraWxsczogb3B0aW9uYWwgYXJyYXkgb2YgdW5pdmVyc2FsIHNraWxsIHRhZ3MgdGhpcyBwcm9ibGVtIHRhcmdldHMuXG4vLyBBY3Rpdml0eS1sZXZlbCBza2lsbHMgbGl2ZSBvbiBBY3Rpdml0eU1ldGE7IHRoaXMgZmllbGQgY2FwdHVyZXNcbi8vIHByb2JsZW0tbGV2ZWwgZ3JhbnVsYXJpdHkgZm9yIGZ1dHVyZSBwZXItc2tpbGwgYW5hbHl0aWNzLiBFZGl0b3IgVUkgaXNcbi8vIFBoYXNlIDI7IHRoZSBmaWVsZCBleGlzdHMgaW4gUGhhc2UgMSBzbyBhbmFseXRpY3MgY2FuIHJlYWNoIGJhY2suXG5leHBvcnQgY29uc3QgUHJvYmxlbUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogei5saXRlcmFsKCdwcm9ibGVtJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBQcm9ibGVtQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBQcm9ibGVtQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgRmlsbEluQmxhbmtJbmxpbmUsIElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5cbi8vIFRoZSBhcmNoaXRlY3R1cmFsbHkgaW50ZXJlc3RpbmcgYmxvY2suIGNvbnRlbnQgaXMgYW4gYXJyYXkgb2YgaW5saW5lIG5vZGVzXG4vLyB0aGF0IG1heSBpbmNsdWRlIEJsYW5rVG9rZW4gXHUyMDE0IHN0dWRlbnRzIHNlZSBwcm9zZSB3aXRoIGVkaXRhYmxlIGJsYW5rcy5cbi8vIEVhY2ggYmxhbmsncyBpZCBpcyBhIHN0YWJsZSByZWZlcmVuY2UgdXNlZCBpbiBzdWJtaXNzaW9ucy5yZXNwb25zZXMsIHNvXG4vLyByZW9yZGVyaW5nIGJsb2NrcyBkb2Vzbid0IGJyZWFrIGdyYWRpbmcgb24gcGFzdCBzdWJtaXNzaW9ucy5cbi8vXG4vLyBhdXRvLW51bWJlcmVkIGxpa2UgUHJvYmxlbUJsb2NrIGZvciB0aGUgcHJvYmxlbSBoZWFkZXIgKGUuZy4sIFwiUHJvYmxlbSAzXCIpLlxuLy8gV2h5IG5vdCBqdXN0IHVzZSBQcm9ibGVtQmxvY2s/IFRoZXkgaGF2ZSBkaWZmZXJlbnQgcmVuZGVyaW5nIGFuZCBkaWZmZXJlbnRcbi8vIHN0dWRlbnQgaW50ZXJhY3Rpb247IGNvbmZsYXRpbmcgdGhlbSB3b3VsZCBmb3JjZSBldmVyeSBwcm9ibGVtIHRvIGVpdGhlclxuLy8gaGF2ZSBvciBub3QgaGF2ZSBibGFua3MsIGluc3RlYWQgb2YgYmVpbmcgYSBwZXItcHJvYmxlbSBkZWNpc2lvbi5cbi8vXG4vLyBQZXItYmxhbmsgZmllbGRzIChoaW50LCBtaXN0YWtlRmVlZGJhY2spIGxpdmUgb24gQmxhbmtUb2tlbiBpbiBpbmxpbmUudHMuXG4vLyBQZXItYmxvY2sgZmllbGRzIGJlbG93OlxuLy8gICAtIHNvbHV0aW9uOiBvbmUgd29ya2VkIGV4cGxhbmF0aW9uIGZvciB0aGUgd2hvbGUgcHJvYmxlbSAoYSBcInNpbXBsaWZ5XG4vLyAgICAgX194XHUwMEIyICsgX194IC0gMTJcIiBwcm9tcHQgaGFzIG9uZSBzb2x1dGlvbiBjb3ZlcmluZyBhbGwgYmxhbmtzLCBub3Qgb25lXG4vLyAgICAgcGVyIGJsYW5rKS4gU2hvd24gcG9zdC1jaGVjayByZWdhcmRsZXNzIG9mIGNvcnJlY3RuZXNzLlxuLy8gICAtIHNraWxsczogdW5pdmVyc2FsIHNraWxsIHRhZ3MgKHNlZSBBY3Rpdml0eU1ldGEuc2tpbGxzKS4gRWRpdG9yIFVJIGZvclxuLy8gICAgIHRoaXMgZmllbGQgaXMgUGhhc2UgMjsgZmllbGQgZXhpc3RzIGluIFBoYXNlIDEgc28gcGVyLXNraWxsIGFuYWx5dGljc1xuLy8gICAgIGNhbiByZWFjaCBiYWNrIHRvIFBoYXNlIDEgcHJvYmxlbXMgd2hlbiB0aGUgZWRpdG9yIGxhbmRzLlxuLy8gICAtIHdvcmtTcGFjZTogcGVyLXByb2JsZW0gb3ZlcnJpZGUgKGluIHJlbSkgZm9yIHRoZSBibGFuayB3b3JraW5nIHNwYWNlXG4vLyAgICAgcHJpbnRlZCBiZWxvdyB0aGlzIHByb2JsZW0uIE9wdGlvbmFsIHdpdGggTk8gZGVmYXVsdCBvbiBwdXJwb3NlOiBhblxuLy8gICAgIGFic2VudCB2YWx1ZSBtZWFucyBcImluaGVyaXQgdGhlIGFjdGl2aXR5LWxldmVsIHByaW50LndvcmtTcGFjZVwiLCB3aGljaFxuLy8gICAgIGlzIGV4YWN0bHkgdGhlIENTUy1jdXN0b20tcHJvcGVydHkgaW5oZXJpdGFuY2UgdGhlIHJlbmRlcmVyIHJlbGllcyBvblxuLy8gICAgICh0aGUgYmxvY2sgc2V0cyBpdHMgb3duIC0tcHJpbnQtd29yay1zcGFjZSBvbmx5IHdoZW4gdGhpcyBpcyBwcmVzZW50KS5cbi8vICAgICBBIGRlZmF1bHQgaGVyZSB3b3VsZCBwaW4gZXZlcnkgYmxvY2sgdG8gYSBjb25jcmV0ZSB2YWx1ZSBhbmQgZGVmZWF0XG4vLyAgICAgdGhhdCBpbmhlcml0YW5jZS4gUHJpbnQtb25seTsgaWdub3JlZCBvbiBzY3JlZW4uXG5leHBvcnQgY29uc3QgRmlsbEluQmxhbmtCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB6LmxpdGVyYWwoJ2ZpbGxfaW5fYmxhbmsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogei5hcnJheShGaWxsSW5CbGFua0lubGluZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya1NwYWNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQZXItYmxvY2sgZGlzcGxheSBsYWJlbCAoYXV0by9jdXN0b20vbm9uZSkuIEFic2VudCA9IGF1dG8gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0b2RheSdzIG51bWJlcmVkIGJlaGF2aW9yLiBTZWUgbGFiZWwudHMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmxhYmVsRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBGaWxsSW5CbGFua0Jsb2NrID0gei5pbmZlcjx0eXBlb2YgRmlsbEluQmxhbmtCbG9jaz47XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGxpc3QudHMgXHUyMDE0IEJ1bGxldCBhbmQgb3JkZXJlZCBsaXN0IGJsb2Nrc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIExpc3RzIG5lc3QuIEEgTGlzdEl0ZW0gaG9sZHMgaW5saW5lIGNvbnRlbnQgcGx1cyBhbiBvcHRpb25hbCBgY2hpbGRyZW5gXG4vLyBhcnJheSBvZiBuZXN0ZWQgbGlzdCBibG9ja3M7IGJ1bGxldCBhbmQgb3JkZXJlZCBsaXN0cyBjYW4gbWl4IGZyZWVseSBhdFxuLy8gYW55IGRlcHRoLiBUaGlzIG1pcnJvcnMgVGlwdGFwJ3MgbGlzdEl0ZW0gPiBwYXJhZ3JhcGggKyAoYnVsbGV0TGlzdCB8XG4vLyBvcmRlcmVkTGlzdCkgc2hhcGUgZW5kLXRvLWVuZCwgc28gVGFiLXRvLWluZGVudCBpbiB0aGUgZWRpdG9yIHByZXNlcnZlc1xuLy8gaGllcmFyY2h5IHRocm91Z2ggYXV0b3NhdmUuXG4vL1xuLy8gUmVjdXJzaW9uIG1lY2hhbmljOiBvbmx5IHRoZSBjeWNsaWMgZWRnZSAoTGlzdEl0ZW0uY2hpbGRyZW4gXHUyMTkyIGxpc3QgYmxvY2sgXHUyMTkyXG4vLyBMaXN0SXRlbSkgbmVlZHMgei5sYXp5KCkuIEJ1bGxldExpc3RCbG9jayBhbmQgT3JkZXJlZExpc3RCbG9jayBhcmUgcGxhaW5cbi8vIHoub2JqZWN0cywgd2hpY2gga2VlcHMgdGhlbSB1c2FibGUgYXMgbWVtYmVycyBvZiB6LmRpc2NyaW1pbmF0ZWRVbmlvbiBpblxuLy8gYmxvY2tzL2luZGV4LnRzLiBEaXNjcmltaW5hdGVkIHVuaW9ucyBuZWVkIFpvZE9iamVjdHMgdG8gaW50cm9zcGVjdCB0aGVcbi8vIGB0eXBlYCBkaXNjcmltaW5hdG9yOyBhIHRvcC1sZXZlbCB6LmxhenkoKSB3cmFwcGVyIHdvdWxkIGRlZmVhdCB0aGF0LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gLS0tLSBUeXBlU2NyaXB0IGludGVyZmFjZXMgKGZvcndhcmQgZGVjbGFyYXRpb25zIGZvciB0aGUgcmVjdXJzaXZlIHR5cGVzKSAtLS1cblxuZXhwb3J0IGludGVyZmFjZSBMaXN0SXRlbSB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBjb250ZW50OiB6LmluZmVyPHR5cGVvZiBJbmxpbmVOb2RlPltdO1xuICAgIGNoaWxkcmVuPzogQXJyYXk8QnVsbGV0TGlzdEJsb2NrIHwgT3JkZXJlZExpc3RCbG9jaz47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnVsbGV0TGlzdEJsb2NrIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHR5cGU6ICdidWxsZXRfbGlzdCc7XG4gICAgaXRlbXM6IExpc3RJdGVtW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3JkZXJlZExpc3RCbG9jayB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB0eXBlOiAnb3JkZXJlZF9saXN0JztcbiAgICBpdGVtczogTGlzdEl0ZW1bXTtcbn1cblxuLy8gLS0tLSBab2Qgc2NoZW1hcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gTGF6eSBiZWNhdXNlIExpc3RJdGVtLmNoaWxkcmVuIHJlZmVycyB0byB0aGUgbGlzdCBibG9ja3MsIHdoaWNoIHJlZmVyIGJhY2tcbi8vIHRvIExpc3RJdGVtLiBUaGUgYXJyb3cgYm9keSBvbmx5IHJ1bnMgYXQgcGFyc2UgdGltZSwgYnkgd2hpY2ggcG9pbnQgYWxsXG4vLyB0aHJlZSBleHBvcnRzIGFyZSBib3VuZC5cbmV4cG9ydCBjb25zdCBMaXN0SXRlbTogei5ab2RUeXBlPExpc3RJdGVtLCB6LlpvZFR5cGVEZWYsIHVua25vd24+ID0gei5sYXp5KCgpID0+XG56Lm9iamVjdCh7XG4gICAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgICAgICAgIGNoaWxkcmVuOiB6XG4gICAgICAgICAuYXJyYXkoei51bmlvbihbQnVsbGV0TGlzdEJsb2NrLCBPcmRlcmVkTGlzdEJsb2NrXSkpXG4gICAgICAgICAub3B0aW9uYWwoKSxcbn0pLFxuKTtcblxuZXhwb3J0IGNvbnN0IEJ1bGxldExpc3RCbG9jayA9IHoub2JqZWN0KHtcbiAgICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogei5saXRlcmFsKCdidWxsZXRfbGlzdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiB6LmFycmF5KExpc3RJdGVtKSxcbn0pO1xuXG5leHBvcnQgY29uc3QgT3JkZXJlZExpc3RCbG9jayA9IHoub2JqZWN0KHtcbiAgICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHoubGl0ZXJhbCgnb3JkZXJlZF9saXN0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiB6LmFycmF5KExpc3RJdGVtKSxcbn0pO1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcbmltcG9ydCB7IHNpemluZ0ZpZWxkcyB9IGZyb20gJy4uL3NpemluZy5qcyc7XG5pbXBvcnQge1xuICBBeGlzQ29uZmlnLFxuICBDdXJ2ZURvbWFpbixcbiAgRHJhd2FibGUsXG4gIEVuZHBvaW50U3R5bGUsXG4gIEZ1bmN0aW9uTW9kZWwsXG59IGZyb20gJy4uL2dyYXBoLXByaW1pdGl2ZXMuanMnO1xuXG4vLyBUaGUgY29vcmRpbmF0ZS1wbGFuZSBwcmltaXRpdmVzIChBeGlzQ29uZmlnLCBFbmRwb2ludFN0eWxlLCBDdXJ2ZURvbWFpbiwgdGhlXG4vLyBGdW5jdGlvbk1vZGVsIGZhbWlseSwgRHJhd2FibGVDb2xvciwgRHJhd2FibGUpIE1PVkVEIHRvIC4uL2dyYXBoLXByaW1pdGl2ZXMudHNcbi8vIFx1MjAxNCBhIGxlYWYgbW9kdWxlIHRoYXQgaW1wb3J0cyBub3RoaW5nIGJ1dCB6b2QuIFRoZXkgYXJlIHJlLWV4cG9ydGVkIGhlcmUsIHdpdGhcbi8vIGlkZW50aWNhbCBpZGVudGl0aWVzLCBzbyBldmVyeSBleGlzdGluZyBpbXBvcnQgcGF0aCBrZWVwcyB3b3JraW5nLlxuLy9cbi8vIFdoeSB0aGV5IG1vdmVkOiB0aGlzIGZpbGUgaW1wb3J0cyBJbmxpbmVOb2RlLCBzbyByZWFjaGluZyB0aGUgcHJpbWl0aXZlc1xuLy8gdGhyb3VnaCBpdCBkcmFncyBpbiBpbmxpbmUudHMuIGlubGluZS50cyBub3cgbmVlZHMgZ3JhcGhfZmlndXJlIChhIGRlZmluaXRpb25cbi8vIG1heSBjb250YWluIG9uZSksIHdoaWNoIHdvdWxkIGNsb3NlIHRoZSBjeWNsZSBpbmxpbmUgLT4gZ3JhcGgtZmlndXJlIC0+XG4vLyBpbnRlcmFjdGl2ZS1ncmFwaCAtPiBpbmxpbmUuIFRoYXQgY3ljbGUgaXMgZmF0YWwsIG5vdCBjb3NtZXRpYzogdGhlXG4vLyBgei5hcnJheShJbmxpbmVOb2RlKWAgY2FsbHMgYmVsb3cgcnVuIGF0IG1vZHVsZSBzY29wZSBhbmQgd291bGQgaGl0IGEgVERaXG4vLyBSZWZlcmVuY2VFcnJvciBvbiBhIHBhcnRpYWxseS1pbml0aWFsaXplZCBpbmxpbmUuanMuIFNlZSBncmFwaC1wcmltaXRpdmVzLnRzLlxuZXhwb3J0IHtcbiAgQXhpc0NvbmZpZyxcbiAgRW5kcG9pbnRTdHlsZSxcbiAgQ3VydmVEb21haW4sXG4gIExpbmVhck1vZGVsLFxuICBRdWFkcmF0aWNNb2RlbCxcbiAgRXhwb25lbnRpYWxNb2RlbCxcbiAgTG9nYXJpdGhtaWNNb2RlbCxcbiAgVmVydGljYWxNb2RlbCxcbiAgRnVuY3Rpb25Nb2RlbCxcbiAgRHJhd2FibGVDb2xvcixcbiAgRHJhd2FibGUsXG59IGZyb20gJy4uL2dyYXBoLXByaW1pdGl2ZXMuanMnO1xuZXhwb3J0IHR5cGUgeyBEcmF3YWJsZUNvbG9yVCB9IGZyb20gJy4uL2dyYXBoLXByaW1pdGl2ZXMuanMnO1xuXG4vLyBUaGUgaW50ZXJhY3RpdmUgZ3JhcGggYmxvY2sgKFBoYXNlIDIuNywgU3RhZ2UgNSkuIFVubGlrZSBldmVyeSBvdGhlciBibG9jayxcbi8vIHRoZSBzdHVkZW50J3MgYW5zd2VyIGlzIEdFT01FVFJJQyBcdTIwMTQgYSBwb2ludCB0aGV5IHBsb3Qgb24gYSBjb29yZGluYXRlIHBsYW5lIFx1MjAxNFxuLy8gbm90IHRleHQuIFRocmVlIHN0cnVjdHVyYWwgY29uc2VxdWVuY2VzIChzZWUgZG9jcy9kZXNpZ24vaW50ZXJhY3RpdmUtZ3JhcGgtXG4vLyBibG9jay5tZCk6IHRoZSBhbnN3ZXIgaXMgYSBzdHJ1Y3R1cmVkIHZhbHVlIChpdHMgb3duIHN1Ym1pc3Npb24gbWFwLCBub3QgdGhlXG4vLyBibGFua3MgbWFwKSwgc2NvcmluZyBpcyB0b2xlcmFuY2UtYmFzZWQgZ2VvbWV0cmljIGNvbXBhcmlzb24gKHRoZSBncmFwaC1raXRcbi8vIHNjb3JlcyBpdCwgbm90IHRoZSBydW50aW1lJ3Mgc3RyaW5nIHN0cmF0ZWdpZXMpLCBhbmQgdGhlIHdpZGdldCBpcyBsYXJnZVxuLy8gKEpTWEdyYXBoIHJpZGVzIHRoZSBsYXp5LWxvYWRlZCBAYWN0aXZpdHkvZ3JhcGgta2l0LCBuZXZlciB0aGUgYmFzZSBydW50aW1lKS5cbi8vXG4vLyBTbGljZSAxICgyLjdhKSBzaGlwcyBPTkUgaW50ZXJhY3Rpb24gXHUyMDE0IHBsb3RfcG9pbnQuIFRoZSBpbnRlcmFjdGlvbiBpcyBhXG4vLyBkaXNjcmltaW5hdGVkIHVuaW9uIGZyb20gZGF5IG9uZSBzbyBwbG90X2xpbmUgKDIuN2IpIGFuZCBzaGFkZV9yZWdpb24gKDIuN2MpXG4vLyBhcmUgZWFjaCBhIG5ldyB2YXJpYW50ICsgYSBuZXcgc2NvcmluZyBzdHJhdGVneSB3aXRoIE5PIHNjaGVtYSBtaWdyYXRpb24gYW5kXG4vLyBubyBjaGFuZ2UgdG8gYW55IG90aGVyIGJsb2NrIHR5cGUgXHUyMDE0IGV4YWN0bHkgaG93IHRoZSB0b3AtbGV2ZWwgQmxvY2sgdW5pb25cbi8vIGdyb3dzLlxuXG4vLyAtLS0tIEludGVyYWN0aW9uIHZhcmlhbnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRWFjaCB2YXJpYW50IGNhcnJpZXMgaXRzIE9XTiBhbnN3ZXIga2V5ICsgdG9sZXJhbmNlLiBwbG90X3BvaW50IGlzIHRoZSBvbmx5XG4vLyB2YXJpYW50IGluIHNsaWNlIDE7IHRoZSB1bmlvbiBzaGFwZSBpcyBoZXJlIHNvIHRoZSBuZXh0IHZhcmlhbnRzIHNsb3QgaW4uXG5leHBvcnQgY29uc3QgUG9pbnRJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X3BvaW50JyksXG4gIC8vIE9uZSBvciBtb3JlIGNvcnJlY3QgcG9pbnRzOyB0aGUgc3R1ZGVudCBtdXN0IHBsb3QgYWxsIG9mIHRoZW0uIEEgc2luZ2xlXG4gIC8vIHBvaW50IGlzIHRoZSBjb21tb24gY2FzZTsgbXVsdGlwbGUgc3VwcG9ydHMgZS5nLiBcInBsb3QgdGhlIHR3byByb290cy5cIlxuICBjb3JyZWN0UG9pbnRzOiB6LmFycmF5KHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSkubWluKDEpLFxuICAvLyBQZXItcG9pbnQgdG9sZXJhbmNlIGluIGdyYXBoIHVuaXRzIChhIEV1Y2xpZGVhbi9lYWNoLWF4aXMgcmFkaXVzLCBhcHBsaWVkXG4gIC8vIGJ5IHRoZSBraXQncyBzY29yZXIpLiAwLjEgZGVmYXVsdCBzdWl0cyBhIHNuYXAtdG8tZ3JpZCBzaW5nbGUgcG9pbnQuXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgUG9pbnRJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIFBvaW50SW50ZXJhY3Rpb24+O1xuXG4vLyAtLS0tIHBsb3RfZnVuY3Rpb246IHBsb3QgYSBjdXJ2ZSBvZiBhIGdpdmVuIGZhbWlseSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzdHVkZW50IHBsYWNlcyBOIHBvaW50cyBhbmQgdGhlIHdpZGdldCBmaXRzICsgZHJhd3MgYSBjdXJ2ZSBUSFJPVUdIIHRoZW1cbi8vIChOID0gdGhlIGZhbWlseSdzIHBhcmFtZXRlciBjb3VudDogbGluZWFyIDIsIHF1YWRyYXRpYyAzLCBleHBvbmVudGlhbCAyLFxuLy8gbG9nYXJpdGhtaWMgMikuIFNjb3JlZCBvbiB0aGUgZml0dGVkIGN1cnZlJ3MgUEFSQU1FVEVSUyAobm90IHRoZSBleGFjdCBwb2ludFxuLy8gcG9zaXRpb25zKSwgc28gYW55IHBvaW50cyBvbiB0aGUgY29ycmVjdCBjdXJ2ZSBhcmUgYWNjZXB0ZWQuIFRoZSBwYXJhbWV0ZXJzXG4vLyBjb21lIGZyb20gdGhlIFNBTUUgcmVncmVzc2lvbiBmaXQgZW5naW5lIHRoZSBjYWxjdWxhdG9yIHVzZXMgKGZpdExpbmVhciwgXHUyMDI2KS5cbi8vXG4vLyBgbW9kZWxgIGlzIGEgZGlzY3JpbWluYXRlZCB1bmlvbiBvbiBgZmFtaWx5YCAoRnVuY3Rpb25Nb2RlbCwgbm93IGluXG4vLyAuLi9ncmFwaC1wcmltaXRpdmVzLnRzIGFuZCByZS1leHBvcnRlZCBhYm92ZSk6IGxpbmVhciwgcXVhZHJhdGljLCBleHBvbmVudGlhbCxcbi8vIGxvZ2FyaXRobWljLCB2ZXJ0aWNhbC4gR3Jvd2luZyBhIGZhbWlseSBpcyBhIG5ldyBtZW1iZXIgdGhlcmUgKyBhIG5ldyBmaXRcbi8vIGJyYW5jaCBpbiB0aGUga2l0J3Mgc2NvcmVyIFx1MjAxNCBhZGRpdGl2ZSwgbm90IGEgcmV3cml0ZS5cblxuLy8gcGxvdF9mdW5jdGlvbiBjYXJyaWVzIGFuIEFSUkFZIG9mIGN1cnZlcyAoc2hpcHMgYXMgb25lKS4gT25lIGN1cnZlIGlzIHRoZVxuLy8gY29tbW9uIGNhc2U7IG11bHRpcGxlIGlzIGEgc3lzdGVtIG9mIGVxdWF0aW9ucyAoXCJncmFwaCBib3RoIGxpbmVzXCIpLCBzY29yZWRcbi8vIGFzIG9uZSBvYmplY3QgZWFjaCBcdTIwMTQgc28gc3lzdGVtcyBhcmUgYWRkaXRpdmUsIG5vdCBhIHJlc2hhcGUgKERyb3AgMiBkZWNpc2lvbikuXG5leHBvcnQgY29uc3QgRnVuY3Rpb25JbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X2Z1bmN0aW9uJyksXG4gIG1vZGVsczogei5hcnJheShGdW5jdGlvbk1vZGVsKS5taW4oMSksXG4gIC8vIERyb3AgNjogb3B0aW9uYWwgcGVyLWN1cnZlIGRvbWFpbiByZXN0cmljdGlvbnMgKFwiZ3JhcGggeSA9IDJ4ICsgMyBmb3JcbiAgLy8geCA+PSAwXCIpLCBwYXJhbGxlbCB0byBtb2RlbHMgYnkgaW5kZXguIFRoZSBmcmVlZm9ybSBwYXJzZXIgZmlsbHMgdGhlc2UgZnJvbVxuICAvLyBhIGBmb3IgXHUyMDI2YCBjbGF1c2U7IHRoZSB3aWRnZXQncyBlbmRwb2ludC1kcmFnIFVYIGlzIHRoZSBwbGFubmVkIGZvbGxvdy11cCBcdTIwMTRcbiAgLy8gdW50aWwgaXQgbGFuZHMsIHRoZSBkb21haW4gaXMgYXV0aG9yaW5nIG1ldGFkYXRhIGRyYXduIG9uIHRoZSBrZXksIGFuZFxuICAvLyBzY29yaW5nIHJlbWFpbnMgb24gdGhlIGN1cnZlIHBhcmFtZXRlcnMuXG4gIGRvbWFpbnM6IHouYXJyYXkoQ3VydmVEb21haW4ubnVsbGFibGUoKSkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgRnVuY3Rpb25JbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIEZ1bmN0aW9uSW50ZXJhY3Rpb24+O1xuXG4vLyAtLS0tIHNoYWRlX3JlZ2lvbjogc2hhZGUgYSBwb2x5Z29uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc3R1ZGVudCBkcmFncyB0aGUgdmVydGljZXMgb2YgYSBwb2x5Z29uIChvbmUgaGFuZGxlIHBlciB2ZXJ0ZXgpIHRvIGNvdmVyIGFcbi8vIHRhcmdldCByZWdpb24sIHdoaWNoIGlzIHNoYWRlZCBhcyB0aGV5IG1vdmUuIFNjb3JlZCBieSBBUkVBIE9WRVJMQVAgd2l0aCB0aGVcbi8vIGNvcnJlY3QgcG9seWdvbiAoaW50ZXJzZWN0aW9uLW92ZXItdW5pb24gXHUyMjY1IG1pbk92ZXJsYXApLCBzbyB0aGUgZXhhY3QgdmVydGV4XG4vLyBwb3NpdGlvbnMgZG9uJ3QgbWF0dGVyIFx1MjAxNCBvbmx5IHRoYXQgdGhlIHNoYWRlZCByZWdpb24gbWF0Y2hlcy4gQSBwb2x5Z29uLCBub3QgYVxuLy8gY3VydmUsIHNvIGl0J3MgaXRzIG93biBpbnRlcmFjdGlvbiAobm90IGEgcGxvdF9mdW5jdGlvbiBmYW1pbHkpLlxuLy8gT25lIHRhcmdldCBwb2x5Z29uOiB2ZXJ0aWNlcyBpbiBvcmRlciAobWluIDMpICsgdGhlIG1pbmltdW0gaW50ZXJzZWN0aW9uLW92ZXItXG4vLyB1bmlvbiB3aXRoIHRoZSBzdHVkZW50J3MgcG9seWdvbiB0byBjb3VudCBhcyBjb3JyZWN0LlxuZXhwb3J0IGNvbnN0IFJlZ2lvbkFuc3dlciA9IHoub2JqZWN0KHtcbiAgY29ycmVjdFZlcnRpY2VzOiB6LmFycmF5KHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSkubWluKDMpLFxuICAvLyAwLjkgaXMgc3RyaWN0IChuZWFyLWV4YWN0IG9uIGEgc25hcHBlZCBncmlkKTsgbG93ZXIgaXQgZm9yIGhhbmQtZHJhZ2dlZCAvXG4gIC8vIGFwcHJveGltYXRlIHJlZ2lvbnMuXG4gIG1pbk92ZXJsYXA6IHoubnVtYmVyKCkubWluKDApLm1heCgxKS5kZWZhdWx0KDAuOSksXG59KTtcbmV4cG9ydCB0eXBlIFJlZ2lvbkFuc3dlciA9IHouaW5mZXI8dHlwZW9mIFJlZ2lvbkFuc3dlcj47XG5cbi8vIHNoYWRlX3JlZ2lvbiBjYXJyaWVzIGFuIEFSUkFZIG9mIHRhcmdldCBwb2x5Z29ucyAoc2hpcHMgYXMgb25lKSwgZWFjaCBzY29yZWRcbi8vIGFzIG9uZSBvYmplY3QgXHUyMDE0IHNvIFwic2hhZGUgYm90aCByZWdpb25zXCIgaXMgYWRkaXRpdmUsIG1hdGNoaW5nIHBsb3RfZnVuY3Rpb24uXG5leHBvcnQgY29uc3QgUmVnaW9uSW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnc2hhZGVfcmVnaW9uJyksXG4gIHJlZ2lvbnM6IHouYXJyYXkoUmVnaW9uQW5zd2VyKS5taW4oMSksXG59KTtcbmV4cG9ydCB0eXBlIFJlZ2lvbkludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgUmVnaW9uSW50ZXJhY3Rpb24+O1xuXG4vLyAtLS0tIGdyYXBoX2luZXF1YWxpdHk6IGdyYXBoIGFuIGluZXF1YWxpdHkgKERyb3AgNCkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc3R1ZGVudCBwbGFjZXMgdGhlIGJvdW5kYXJ5IChzYW1lIGhhbmRsZXMgYXMgcGxvdF9mdW5jdGlvbiksIHRvZ2dsZXMgdGhlXG4vLyBsaW5lIGRvdHRlZCAoc3RyaWN0KSBvciBzb2xpZCAoaW5jbHVzaXZlKSwgYW5kIGNsaWNrcyBhIHNpZGUgdG8gc2hhZGUuIEFsbFxuLy8gdGhyZWUgYXJlIGdyYWRlZCBcdTIwMTQgY2hvb3NpbmcgdGhlbSBJUyB0aGUgc2tpbGwuIFRoZSBib3VuZGFyeSBpcyBhIEZ1bmN0aW9uTW9kZWwsXG4vLyBzbyBxdWFkcmF0aWMgaW5lcXVhbGl0aWVzICh5ID4geFx1MDBCMikgd29yayB0aGUgZGF5IHRoZSBmYW1pbHkgZG9lczsgYSB2ZXJ0aWNhbFxuLy8gYm91bmRhcnkgKHggPiAzKSBzaGFkZXMgbGVmdC9yaWdodCBpbnN0ZWFkIG9mIGFib3ZlL2JlbG93LlxuZXhwb3J0IGNvbnN0IFNoYWRlU2lkZVZhbHVlID0gei5lbnVtKFsnYWJvdmUnLCAnYmVsb3cnLCAnbGVmdCcsICdyaWdodCddKTtcbmV4cG9ydCB0eXBlIFNoYWRlU2lkZVZhbHVlID0gei5pbmZlcjx0eXBlb2YgU2hhZGVTaWRlVmFsdWU+O1xuXG5leHBvcnQgY29uc3QgSW5lcXVhbGl0eUFuc3dlciA9IHoub2JqZWN0KHtcbiAgYm91bmRhcnk6IEZ1bmN0aW9uTW9kZWwsXG4gIC8vIHRydWUgPSBzdHJpY3QgKDwgLyA+LCBkb3R0ZWQgYm91bmRhcnkpOyBmYWxzZSA9IGluY2x1c2l2ZSAoXHUyMjY0IC8gXHUyMjY1LCBzb2xpZCkuXG4gIHN0cmljdDogei5ib29sZWFuKCksXG4gIHNoYWRlU2lkZTogU2hhZGVTaWRlVmFsdWUsXG59KTtcbmV4cG9ydCB0eXBlIEluZXF1YWxpdHlBbnN3ZXIgPSB6LmluZmVyPHR5cGVvZiBJbmVxdWFsaXR5QW5zd2VyPjtcblxuLy8gQW4gQVJSQVkgb2YgaW5lcXVhbGl0aWVzIChzaGlwcyBhcyBvbmUpOyBzeXN0ZW1zIChcInNoYWRlIHdoZXJlIEJPVEggaG9sZFwiKVxuLy8gYmVjb21lIGFkZGl0aXZlIG1lbWJlcnMsIG1hdGNoaW5nIHBsb3RfZnVuY3Rpb24vc2hhZGVfcmVnaW9uLlxuZXhwb3J0IGNvbnN0IEluZXF1YWxpdHlJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdncmFwaF9pbmVxdWFsaXR5JyksXG4gIGluZXF1YWxpdGllczogei5hcnJheShJbmVxdWFsaXR5QW5zd2VyKS5taW4oMSksXG59KTtcbmV4cG9ydCB0eXBlIEluZXF1YWxpdHlJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIEluZXF1YWxpdHlJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gZGlzcGxheTogYSBzdGF0aWMgKHVuZ3JhZGVkKSBncmFwaCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGJsb2NrIGRyYXdzIGEgZml4ZWQgcGljdHVyZSBcdTIwMTQgcG9pbnRzLCBjdXJ2ZXMsIHNlZ21lbnRzLCBmaWxsZWQgcG9seWdvbnMgXHUyMDE0XG4vLyBhbmQgY29sbGVjdHMgTk8gYW5zd2VyLiBUd28gam9icyBmcm9tIG9uZSBzaGFwZTogYSBzdGltdWx1cyBhIGdyYWRlZCBxdWVzdGlvblxuLy8gcmVmZXJzIHRvIChcInVzaW5nIHRoZSBncmFwaCBiZWxvdywgXHUyMDI2XCIpLCBhbmQgYSBzdGFuZGFsb25lIGV4ZW1wbGFyIHdpdGggbm9cbi8vIHF1ZXN0aW9uIGF0IGFsbCAoYW4gZW1wdHkgcHJvbXB0KS4gQmVjYXVzZSBgZGlzcGxheWAgaXMganVzdCBhbm90aGVyIG1lbWJlciBvZlxuLy8gdGhlIGB0eXBlYCB1bmlvbiwgYSBzdGltdWx1cy13aXRoLWFuLWFuc3dlciBsYXRlciBpcyBhZGRpdGl2ZSBcdTIwMTQgYSBuZXcgYW5zd2VyXG4vLyBmaWVsZCBiZXNpZGUgdGhlIGRyYXdhYmxlcyBcdTIwMTQgbm90IGEgbmV3IGJsb2NrIGZhbWlseS5cbi8vXG4vLyBgRHJhd2FibGVgICh0aGUgcG9pbnQgLyBjdXJ2ZSAvIGV4cHJlc3Npb24gLyBzZWdtZW50IC8gcmF5IC8gcG9seWdvbiB1bmlvbixcbi8vIGRpc2NyaW1pbmF0ZWQgb24gYGtpbmRgKSBhbmQgaXRzIGBEcmF3YWJsZUNvbG9yYCBwYWxldHRlIGtleXMgbm93IGxpdmUgaW5cbi8vIC4uL2dyYXBoLXByaW1pdGl2ZXMudHMgYW5kIGFyZSByZS1leHBvcnRlZCBhYm92ZS5cblxuZXhwb3J0IGNvbnN0IERpc3BsYXlJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdkaXNwbGF5JyksXG4gIGRyYXdhYmxlczogei5hcnJheShEcmF3YWJsZSkuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCB0eXBlIERpc3BsYXlJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIERpc3BsYXlJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gcGxvdF9yYXkgLyBwbG90X3NlZ21lbnQ6IGRyYXcgYSByYXkgb3Igc2VnbWVudCBkaXJlY3RseSAtLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZpcnN0LWNsYXNzIHJlcGxhY2VtZW50cyBmb3IgdGhlIGRvbWFpbi1nbGlkZXIgYXBwcm9hY2ggKHdoaWNoIGFza2VkIHN0dWRlbnRzXG4vLyB0byBkZWZpbmUgYW4gaW5maW5pdGUgbGluZSwgdGhlbiBtYXJrIGVuZHBvaW50cyBvbiBpdCB3aXRoIHNlcGFyYXRlIGNvbnRyb2xzIFx1MjAxNFxuLy8gdGhlIGRyYXduIGxpbmUgbmV2ZXIgZXZlbiBjbGlwcGVkKS4gSGVyZSB0aGUgc3R1ZGVudCBkcmFncyBUV08gaGFuZGxlcyBcdTIwMTQgdGhlXG4vLyBlbmRwb2ludChzKSBcdTIwMTQgYW5kIHRoZSB3aWRnZXQgZHJhd3MgYW4gQUNUVUFMIHJheS9zZWdtZW50IHRocm91Z2ggdGhlbVxuLy8gKEpTWEdyYXBoIHN0cmFpZ2h0Rmlyc3Qvc3RyYWlnaHRMYXN0KSwgd2l0aCBvcGVuL2Nsb3NlZCBlbmRwb2ludCBwaWxscy5cbi8vIEFycmF5cy1vZi1vbmUgbGlrZSBtb2RlbHMvcmVnaW9ucy9pbmVxdWFsaXRpZXMsIHNvIHN5c3RlbXMgc3RheSBhZGRpdGl2ZS5cbi8vIChwbG90X2Z1bmN0aW9uJ3MgZG9tYWluc1tdIHJlbWFpbnMgc2NvcmVkIGZvciBhbHJlYWR5LXB1Ymxpc2hlZCBwYWdlcywgYnV0XG4vLyBhdXRob3Jpbmcgc3RlZXJzIGhlcmUgbm93LilcbmV4cG9ydCBjb25zdCBSYXlBbnN3ZXIgPSB6Lm9iamVjdCh7XG4gIC8vIFRoZSByYXkncyBlbmRwb2ludCAoc2NvcmVkIG9uIHBvc2l0aW9uICsgb3Blbi9jbG9zZWQgc3R5bGUpLlxuICBmcm9tOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIC8vIEFueSBzZWNvbmQgcG9pbnQgT04gdGhlIHJheSBcdTIwMTQgbmFtZXMgdGhlIGRpcmVjdGlvbjsgdGhlIHN0dWRlbnQncyB0aHJvdWdoXG4gIC8vIGhhbmRsZSBtYXkgc2l0IGFueXdoZXJlIGFsb25nIHRoZSBjb3JyZWN0IHJheS5cbiAgdGhyb3VnaDogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICBmcm9tU3R5bGU6IEVuZHBvaW50U3R5bGUuZGVmYXVsdCgnY2xvc2VkJyksXG4gIC8vIEVuZHBvaW50IHBvc2l0aW9uIHRvbGVyYW5jZSBpbiBncmFwaCB1bml0cyAobWF0Y2hlcyB0aGUgZG9tYWluLWdsaWRlclxuICAvLyBkZWZhdWx0KS4gRGlyZWN0aW9uIGlzIHNjb3JlZCBieSB1bml0LXZlY3RvciBhbGlnbm1lbnQga2l0LXNpZGUuXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4yNSksXG59KTtcbmV4cG9ydCB0eXBlIFJheUFuc3dlciA9IHouaW5mZXI8dHlwZW9mIFJheUFuc3dlcj47XG5cbmV4cG9ydCBjb25zdCBSYXlJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X3JheScpLFxuICByYXlzOiB6LmFycmF5KFJheUFuc3dlcikubWluKDEpLFxufSk7XG5leHBvcnQgdHlwZSBSYXlJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIFJheUludGVyYWN0aW9uPjtcblxuZXhwb3J0IGNvbnN0IFNlZ21lbnRBbnN3ZXIgPSB6Lm9iamVjdCh7XG4gIGZyb206IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgdG86IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgLy8gW2Zyb20tZW5kcG9pbnQgc3R5bGUsIHRvLWVuZHBvaW50IHN0eWxlXS4gU2NvcmVkIG9yZGVyLWluZGVwZW5kZW50bHkgXHUyMDE0XG4gIC8vIHRoZSBzdHVkZW50IG1heSBkcmF3IHRoZSBzZWdtZW50IGluIGVpdGhlciBkaXJlY3Rpb24uXG4gIGVuZHBvaW50czogei50dXBsZShbRW5kcG9pbnRTdHlsZSwgRW5kcG9pbnRTdHlsZV0pLmRlZmF1bHQoWydjbG9zZWQnLCAnY2xvc2VkJ10pLFxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMjUpLFxufSk7XG5leHBvcnQgdHlwZSBTZWdtZW50QW5zd2VyID0gei5pbmZlcjx0eXBlb2YgU2VnbWVudEFuc3dlcj47XG5cbmV4cG9ydCBjb25zdCBTZWdtZW50SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9zZWdtZW50JyksXG4gIHNlZ21lbnRzOiB6LmFycmF5KFNlZ21lbnRBbnN3ZXIpLm1pbigxKSxcbn0pO1xuZXhwb3J0IHR5cGUgU2VnbWVudEludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgU2VnbWVudEludGVyYWN0aW9uPjtcblxuLy8gVGhlIGludGVyYWN0aW9uIHVuaW9uLiBwbG90X3BvaW50ICsgcGxvdF9mdW5jdGlvbiArIHNoYWRlX3JlZ2lvbiBhcmUgZ3JhZGVkO1xuLy8gZGlzcGxheSBpcyB0aGUgdW5ncmFkZWQgc3RhdGljIGdyYXBoLiBNb3JlIGFyZSBmdXR1cmUgbWVtYmVycy4gS2VwdFxuLy8gZGlzY3JpbWluYXRlZCBvbiBgdHlwZWAgc28gdGhlIHdpcmUgZm9ybWF0IGFsd2F5cyBjYXJyaWVzIGl0IGFuZCBjb25zdW1lcnNcbi8vIGJyYW5jaCB1bmlmb3JtbHkuXG5leHBvcnQgY29uc3QgR3JhcGhJbnRlcmFjdGlvbiA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBQb2ludEludGVyYWN0aW9uLFxuICBGdW5jdGlvbkludGVyYWN0aW9uLFxuICBSZWdpb25JbnRlcmFjdGlvbixcbiAgSW5lcXVhbGl0eUludGVyYWN0aW9uLFxuICBSYXlJbnRlcmFjdGlvbixcbiAgU2VnbWVudEludGVyYWN0aW9uLFxuICBEaXNwbGF5SW50ZXJhY3Rpb24sXG5dKTtcbmV4cG9ydCB0eXBlIEdyYXBoSW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBHcmFwaEludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBUaGUgYmxvY2sgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEF1dG8tbnVtYmVyZWQgbGlrZSBQcm9ibGVtQmxvY2sgLyBGaWxsSW5CbGFua0Jsb2NrLiBza2lsbHMgZm9sbG93cyB0aGUgc2FtZVxuLy8gb3B0LWluIHBhdHRlcm4gRmlsbEluQmxhbmtCbG9jayBlc3RhYmxpc2hlZDsgc29sdXRpb24gaXMgc2hvd24gcG9zdC1jaGVja1xuLy8gcmVnYXJkbGVzcyBvZiBjb3JyZWN0bmVzcy5cbmV4cG9ydCBjb25zdCBJbnRlcmFjdGl2ZUdyYXBoQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdpbnRlcmFjdGl2ZV9ncmFwaCcpLFxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAuLi5sYWJlbEZpZWxkcyxcbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICBheGlzQ29uZmlnOiBBeGlzQ29uZmlnLFxuICBpbnRlcmFjdGlvbjogR3JhcGhJbnRlcmFjdGlvbixcbiAgLy8gV2hlbiB0cnVlLCB0aGUgc3R1ZGVudCBnZXRzIGEgXCJjYW5ub3QgYmUgZ3JhcGhlZCAvIG5vIHNvbHV0aW9uXCIgY2hvaWNlLCBhbmRcbiAgLy8gdGhlIGFuc3dlciBrZXkgbWF5IG1hcmsgVEhBVCBhcyB0aGUgY29ycmVjdCBhbnN3ZXIgKHRyaWNrIHF1ZXN0aW9ucykuIFRoZVxuICAvLyBmbGFnIGxhbmRzIGhlcmUgKERyb3AgMik7IHRoZSBzdHVkZW50IGNvbnRyb2wgKyBuby1zb2x1dGlvbiByZXNwb25zZSByaWRlIHRoZVxuICAvLyBEcm9wIDQgd2lyZSBidW1wLlxuICBhbGxvd05vU29sdXRpb246IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAvLyBUcmljayBxdWVzdGlvbnM6IHdoZW4gdHJ1ZSAocmVxdWlyZXMgYWxsb3dOb1NvbHV0aW9uKSwgXCJubyBzb2x1dGlvblwiIElTIHRoZVxuICAvLyBjb3JyZWN0IGFuc3dlciBhbmQgdGhlIGRyYXduIGFuc3dlciBrZXkgaXMgYSBkZWNveS4gQSBzdHVkZW50IHdobyBzZWxlY3RzXG4gIC8vIG5vLXNvbHV0aW9uIGlzIGNvcnJlY3Q7IG9uZSB3aG8gZHJhd3MgYW55dGhpbmcgaXMgbm90LlxuICBub1NvbHV0aW9uQ29ycmVjdDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIEJ1aWx0LWluIG1pc3Rha2UgY2xhc3NpZmllcnMgKHN3YXBwZWQgY29vcmRpbmF0ZXMsIHN3YXBwZWQgc2xvcGUvaW50ZXJjZXB0LFxuICAvLyByaWdodC1ib3VuZGFyeS13cm9uZy1zaWRlLCBcdTIwMjYpIHNob3cgYSB0YXJnZXRlZCBudWRnZSBpbnN0ZWFkIG9mIHRoZSBnZW5lcmljXG4gIC8vIFwiTm90IHF1aXRlXCIgYWZ0ZXIgYSBjaGVjay4gRGVmYXVsdCBPTjsgYSB0ZWFjaGVyIGNhbiBzd2l0Y2ggdGhlbSBvZmYuIFRoZVxuICAvLyBjbGFzc2lmaWVyIGNhdGFsb2d1ZSArIG1lc3NhZ2VzIGxpdmUga2l0LXNpZGUgKGdyYXBoLXNjb3JlLnRzKSBcdTIwMTQgdGhpcyBmbGFnXG4gIC8vIG9ubHkgZ2F0ZXMgdGhlbS5cbiAgYnVpbHRpbkZlZWRiYWNrOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAvLyBBdXRob3JlZCBhbnRpY2lwYXRlZCBtaXN0YWtlcyBcdTIwMTQgdGhlIGdyYXBoIHR3aW4gb2YgQmxhbmtUb2tlbi5taXN0YWtlRmVlZGJhY2suXG4gIC8vIGBtYXRjaGAgaXMgYSBmcmVlZm9ybSBncmFwaCBhbnN3ZXIgaW4gdGhlIFNBTUUgc3ludGF4IHRoZSBhdXRob3JpbmcgZm9ybXVsYVxuICAvLyBmaWVsZCBhY2NlcHRzIChcIig0LCAzKVwiLCBcInkgPSB4ICsgMlwiLCBcInkgPCAyeCArIDFcIik7IHRoZSBraXQgcGFyc2VzIGl0IHdpdGhcbiAgLy8gdGhlIHNhbWUgcGFyc2VyIGFuZCBjb21wYXJlcyBhZ2FpbnN0IHRoZSBzdHVkZW50J3MgYW5zd2VyIHdpdGggdGhlIHNhbWVcbiAgLy8gdG9sZXJhbmNlcyBhcyBzY29yaW5nLiBGaXJzdCBtYXRjaCB3aW5zLCBhbmQgYW4gYXV0aG9yZWQgbWF0Y2ggYmVhdHMgYVxuICAvLyBidWlsdC1pbiBjbGFzc2lmaWVyLiBgZmVlZGJhY2tgIGlzIHJpY2ggaW5saW5lIGNvbnRlbnQsIHNob3duIChwb3N0LWNoZWNrXG4gIC8vIG9ubHkpIGluIHRoZSBibG9jaydzIGZlZWRiYWNrIGxpbmUuXG4gIG1pc3Rha2VGZWVkYmFjazogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgbWF0Y2g6IHouc3RyaW5nKCksXG4gICAgZmVlZGJhY2s6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIH0pKS5kZWZhdWx0KFtdKSxcbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICAvLyBWYXJpYWJsZSBibG9jayBzaXppbmc6IG9wdGlvbmFsIHdpZHRoIGZyYWN0aW9uICsgYWxpZ25tZW50IChzaXppbmcudHMpLlxuICAvLyBBdXRob3Itc2V0IGRpc3BsYXkgZm9vdHByaW50IGZvciB0aGUgZmlndXJlOyByZW5kZXJlciBob25vcnMgaXQgdmlhIHRoZVxuICAvLyBzaGFyZWQgLmJsb2NrLXNpemVkIHBhdGguIEFkZGl0aXZlL29wdGlvbmFsIFx1MjAxNCBubyBzY2hlbWFWZXJzaW9uIGJ1bXAuXG4gIC4uLnNpemluZ0ZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgSW50ZXJhY3RpdmVHcmFwaEJsb2NrID0gei5pbmZlcjx0eXBlb2YgSW50ZXJhY3RpdmVHcmFwaEJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5pbXBvcnQgeyBBeGlzQ29uZmlnLCBEcmF3YWJsZSB9IGZyb20gJy4vaW50ZXJhY3RpdmUtZ3JhcGguanMnO1xuXG4vLyBNdWx0aXBsZS1jaG9pY2UgcXVlc3Rpb24gYmxvY2suIE9uZSBwcm9tcHQsIDIrIGNob2ljZXMsIHJhZGlvIChzaW5nbGUpIG9yXG4vLyBjaGVja2JveCAoXCJzZWxlY3QgYWxsIHRoYXQgYXBwbHlcIikgdmlhIG11bHRpU2VsZWN0LiBTY29yZWQgYWxsLW9yLW5vdGhpbmc6XG4vLyB0aGUgc2VsZWN0ZWQgc2V0IG11c3QgZXF1YWwgdGhlIGNvcnJlY3Qgc2V0IChwZXItY2hvaWNlIHBhcnRpYWwgY3JlZGl0LCBpZlxuLy8gZXZlciB3YW50ZWQsIGlzIGEgZnV0dXJlIGFkZGl0aXZlIGZsYWcpLlxuLy9cbi8vIENob2ljZSBjb250ZW50IGlzIHJpY2ggaW5saW5lIChmb3JtYXR0ZWQgdGV4dCArIGlubGluZSBtYXRoKSBcdTIwMTQgdGhlIHNhbWVcbi8vIGFscGhhYmV0IGFzIHByb2JsZW0gcHJvc2UsIHNvIG1hdGggYW5zd2VyIGNob2ljZXMgcmVuZGVyIHByb3Blcmx5LiBSaWNoZXJcbi8vIGNob2ljZXMgYXJlIEFERElUSVZFIEZJRUxEUyBvbiBNdWx0aXBsZUNob2ljZU9wdGlvbiwgbm90IGEgdW5pb24gcmV3b3JrIFx1MjAxNFxuLy8gZGVjaWRlZCBhdCBkZXNpZ24gdGltZSwgZXhlcmNpc2VkIDIwMjYtMDctMTAgd2hlbiB0aGUgb3B0aW9uYWwgYGltYWdlYCBhbmRcbi8vIGBncmFwaGAgZmlndXJlcyBsYW5kZWQgd2l0aG91dCBhIHNjaGVtYVZlcnNpb24gYnVtcC5cbi8vXG4vLyBQZXItY2hvaWNlIGBmZWVkYmFja2AgaXMgdGhlIE1DIGFuYWxvZ3VlIG9mIGEgYmxhbmsncyBtaXN0YWtlRmVlZGJhY2s6XG4vLyBkaXN0cmFjdG9ycyBhcmUgdXN1YWxseSBhdXRob3JlZCBCRUNBVVNFIHRoZXkncmUgYW50aWNpcGF0ZWQgbWlzdGFrZXMsIHNvXG4vLyBlYWNoIGNob2ljZSBjYW4gY2FycnkgYW4gZXhwbGFuYXRpb24gc2hvd24gcG9zdC1jaGVjayB3aGVuIGl0IHdhcyBzZWxlY3RlZC5cbi8vXG4vLyBCbG9jay1sZXZlbCBmaWVsZHMgbWlycm9yIEZpbGxJbkJsYW5rQmxvY2sgZm9yIHBhcml0eSAoc29sdXRpb24sIHNraWxscyxcbi8vIHdvcmtTcGFjZSkgXHUyMDE0IG9uZSBwcm9ibGVtIGNocm9tZSwgb25lIHJ1bnRpbWUgdHJlYXRtZW50LCBvbmUgZGFzaGJvYXJkIHJvd1xuLy8gc2hhcGUuXG4vL1xuLy8gRGVsaWJlcmF0ZWx5IE5PVCBzY2hlbWEtZW5mb3JjZWQ6IFwiYXQgbGVhc3Qgb25lIGNob2ljZSBpcyBtYXJrZWQgY29ycmVjdC5cIlxuLy8gQSBtaWQtZWRpdCBkcmFmdCAodGVhY2hlciBoYXNuJ3QgcGlja2VkIHRoZSByaWdodCBhbnN3ZXIgeWV0KSBtdXN0IHN0aWxsXG4vLyBhdXRvc2F2ZTsgdGhlIGVkaXRvciBzdXJmYWNlcyB0aGUgd2FybmluZyBpbnN0ZWFkLiBBIHplcm8tY29ycmVjdCBibG9jayBpc1xuLy8gd2VsbC1kZWZpbmVkIGF0IHJ1bnRpbWUgKG11bHRpLXNlbGVjdDogc2VsZWN0aW5nIG5vdGhpbmcgaXMuLi4gc3RpbGwgYW5cbi8vIG9taXNzaW9uOyBub3RoaW5nIHNjb3JlcyBjb3JyZWN0KSBcdTIwMTQgd3JvbmcgYXV0aG9yaW5nLCBub3QgYSBjcmFzaC5cblxuLy8gT3B0aW9uYWwgaWxsdXN0cmF0aXZlIGltYWdlIG9uIGEgY2hvaWNlIChcIndoaWNoIGRpYWdyYW0gc2hvd3NcdTIwMjZcIikuIE1pcnJvcnNcbi8vIERlZmluaXRpb25JbWFnZSAvIFBoYXNlLTEgSW1hZ2VCbG9jazogVVJMLW9ubHksIG5vIHVwbG9hZCBwaXBlbGluZTsgYWx0XG4vLyByZXF1aXJlZCBidXQgZGVmYXVsdGluZyB0byAnJyBmb3IgZGVjb3JhdGl2ZSBmaWd1cmVzIChlZGl0b3Igd2FybnMpLlxuZXhwb3J0IGNvbnN0IENob2ljZUltYWdlID0gei5vYmplY3Qoe1xuICBzcmM6IHouc3RyaW5nKCkudXJsKCksXG4gIGFsdDogei5zdHJpbmcoKS5kZWZhdWx0KCcnKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ2hvaWNlSW1hZ2UgPSB6LmluZmVyPHR5cGVvZiBDaG9pY2VJbWFnZT47XG5cbi8vIE9wdGlvbmFsIHN0YXRpYyBncmFwaCBvbiBhIGNob2ljZSAoXCJ3aGljaCBncmFwaCBzaG93c1x1MjAyNlwiKS4gUmV1c2VzIHRoZVxuLy8gaW50ZXJhY3RpdmUtZ3JhcGggdm9jYWJ1bGFyeSAoQXhpc0NvbmZpZyArIGRpc3BsYXkgRHJhd2FibGVzKSBidXQgaXNcbi8vIGRyYXduIGFzIGlubGluZSBTVkcgYnkgZ3JhcGgta2l0J3Mga2l0LWZyZWUgYHN0YXRpYy1zdmdgIGVuZ2luZSBcdTIwMTQgbmV2ZXIgdGhlXG4vLyBpbnRlcmFjdGl2ZSBraXQuIFRoZSB2aWV3ZXIgcmVuZGVycyBpdCBpbiBgYmxvY2tzL0Nob2ljZUZpZ3VyZS50c3hgLCB3aGljaFxuLy8gaW1wb3J0cyB0aGF0IGVuZ2luZSBMQVpJTFkgKG11bHRpcGxlX2Nob2ljZSBpcyBhbiBlYWdlciBiaW5kaW5nLCBzbyBhIHN0YXRpY1xuLy8gaW1wb3J0IHdvdWxkIHB1dCB0aGUgZW5naW5lIGluIHRoZSBzdHVkZW50IHNoZWxsKS4gQ29uc2VxdWVuY2U6IGBleHByZXNzaW9uYFxuLy8gZHJhd2FibGVzIG5lZWQgdGhlIGtpdCdzIHBhcnNlciBhbmQgYXJlIE5PVCBkcmF3bjsgdGhlIGVkaXRvciBkb2Vzbid0IG9mZmVyXG4vLyB0aGVtIGhlcmUuICooVW50aWwgMjAyNi0wOC0yMiB0aGlzIHNhaWQgXCJ0aGUgcmVuZGVyZXIncyBncmFwaC1zdmcgZW5naW5lXCIgXHUyMDE0XG4vLyBhIHBhY2thZ2UgZGVsZXRlZCBhdCBTOSBEcm9wIDQsIHdoaWNoIGlzIHdoeSBub3RoaW5nIHJlbmRlcmVkIHRoZXNlIGZvclxuLy8gZWlnaHQgZGF5cyB3aGlsZSB0aGUgZmllbGQsIHRoZSBlZGl0b3IgY29udHJvbCBhbmQgdGhlIGltcG9ydGVyIGFsbCBsaXZlZFxuLy8gb24uIFNlZSBkb2NzL2Rlc2lnbi9jaG9pY2UtZmlndXJlcy1hbmQtbmVzdGVkLWxpc3RzLm1kLikqXG5leHBvcnQgY29uc3QgQ2hvaWNlR3JhcGggPSB6Lm9iamVjdCh7XG4gIGF4aXM6IEF4aXNDb25maWcsXG4gIGRyYXdhYmxlczogei5hcnJheShEcmF3YWJsZSkuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCB0eXBlIENob2ljZUdyYXBoID0gei5pbmZlcjx0eXBlb2YgQ2hvaWNlR3JhcGg+O1xuXG5leHBvcnQgY29uc3QgTXVsdGlwbGVDaG9pY2VPcHRpb24gPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgLy8gUmljaCBpbmxpbmUgY29udGVudCAoZm9ybWF0dGVkIHRleHQgKyBpbmxpbmUgbWF0aCkuIE5vbi1lbXB0eSBpcyBhblxuICAvLyBlZGl0b3IgY29uY2Vybiwgbm90IGEgc2NoZW1hIG9uZSAobWlkLWVkaXQgZHJhZnRzIG11c3Qgc2F2ZSkuXG4gIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAvLyBPcHRpb25hbCBwZXItY2hvaWNlIGV4cGxhbmF0aW9uLCByZXZlYWxlZCBwb3N0LWNoZWNrIHdoZW4gdGhpcyBjaG9pY2Ugd2FzXG4gIC8vIHNlbGVjdGVkLiBSaWNoIGlubGluZSBjb250ZW50LCBsaWtlIGJsYW5rIG1pc3Rha2VGZWVkYmFjayBlbnRyaWVzLlxuICBmZWVkYmFjazogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICAvLyBPcHRpb25hbCBmaWd1cmUgYmVsb3cgdGhlIGNob2ljZSB0ZXh0IFx1MjAxNCB0aGUgYWRkaXRpdmUgd2lkZW5pbmcgdGhlIGhlYWRlclxuICAvLyBjb21tZW50IHJlc2VydmVkLiBCb3RoIG1heSB0ZWNobmljYWxseSBjb2V4aXN0IChpbWFnZSByZW5kZXJzIGZpcnN0KTtcbiAgLy8gdGhlIGVkaXRvciBVSSB0cmVhdHMgdGhlbSBhcyBhIHNpbmdsZSBmaWd1cmUgc2xvdC5cbiAgaW1hZ2U6IENob2ljZUltYWdlLm9wdGlvbmFsKCksXG4gIGdyYXBoOiBDaG9pY2VHcmFwaC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNdWx0aXBsZUNob2ljZU9wdGlvbiA9IHouaW5mZXI8dHlwZW9mIE11bHRpcGxlQ2hvaWNlT3B0aW9uPjtcblxuZXhwb3J0IGNvbnN0IE11bHRpcGxlQ2hvaWNlQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdtdWx0aXBsZV9jaG9pY2UnKSxcbiAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLi4ubGFiZWxGaWVsZHMsXG4gIC8vIFRoZSBxdWVzdGlvbiBwcm9zZSAocmljaCBpbmxpbmUgY29udGVudCwgbGlrZSBhIHByb2JsZW0gc3RhdGVtZW50KS5cbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICBjaG9pY2VzOiB6LmFycmF5KE11bHRpcGxlQ2hvaWNlT3B0aW9uKS5taW4oMiksXG4gIC8vIGZhbHNlID0gc2luZ2xlIGFuc3dlciAocmFkaW9zLCBleGFjdGx5IG9uZSBzZWxlY3RhYmxlKTsgdHJ1ZSA9IFwic2VsZWN0XG4gIC8vIGFsbCB0aGF0IGFwcGx5XCIgKGNoZWNrYm94ZXMpLiBTY29yaW5nIGlzIHNldCBlcXVhbGl0eSBlaXRoZXIgd2F5LlxuICBtdWx0aVNlbGVjdDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIEtlZXAgdGhlIGF1dGhvcmVkIGNob2ljZSBvcmRlciBvbiBwYXBlciAoUzUuNSBEMTdBKS4gUHJpbnRlZCBWRVJTSU9OU1xuICAvLyBzaHVmZmxlIGNob2ljZXMgdG8gZGlzY291cmFnZSBjb3B5aW5nLCB3aGljaCBpcyB3cm9uZyBmb3IgYSBxdWVzdGlvbiB3aG9zZVxuICAvLyBvcmRlciBjYXJyaWVzIG1lYW5pbmcgXHUyMDE0IFwiYWxsIG9mIHRoZSBhYm92ZVwiIGhhcyB0byBzdGF5IGxhc3QsIGFuZCBcImJvdGggQVxuICAvLyBhbmQgQlwiIG5hbWVzIHBvc2l0aW9ucyBvdXRyaWdodC4gT3B0aW9uYWwgd2l0aCBubyBkZWZhdWx0IHNvIGEgZG9jdW1lbnRcbiAgLy8gd3JpdHRlbiBiZWZvcmUgdGhpcyByZS1zZXJpYWxpemVzIGJ5dGUtaWRlbnRpY2FsbHk7IGFic2VudCBtZWFucyBzaHVmZmxlLFxuICAvLyB3aGljaCBpcyB0aGUgcmlnaHQgZGVmYXVsdCBmb3IgdGhlIG92ZXJ3aGVsbWluZyBtYWpvcml0eSBvZiBxdWVzdGlvbnMuXG4gIGxvY2tDaG9pY2VPcmRlcjogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgLy8gV29ya2VkIGV4cGxhbmF0aW9uIGZvciB0aGUgd2hvbGUgcHJvYmxlbSwgcmV2ZWFsZWQgcG9zdC1jaGVjayByZWdhcmRsZXNzXG4gIC8vIG9mIGNvcnJlY3RuZXNzIChzYW1lIGNvbnRyYWN0IGFzIEZpbGxJbkJsYW5rQmxvY2suc29sdXRpb24pLlxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIC8vIFBlci1wcm9ibGVtIHByaW50IHdvcmstc3BhY2Ugb3ZlcnJpZGUgKHJlbSk7IGFic2VudCA9IGluaGVyaXQgdGhlXG4gIC8vIGFjdGl2aXR5LWxldmVsIGRlZmF1bHQgKHNlZSBGaWxsSW5CbGFua0Jsb2NrLndvcmtTcGFjZSBmb3IgdGhlIENTU1xuICAvLyBjdXN0b20tcHJvcGVydHkgcmVhc29uaW5nKS5cbiAgd29ya1NwYWNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNdWx0aXBsZUNob2ljZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgTXVsdGlwbGVDaG9pY2VCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuaW1wb3J0IHsgQ2hvaWNlSW1hZ2UsIENob2ljZUdyYXBoIH0gZnJvbSAnLi9tdWx0aXBsZS1jaG9pY2UuanMnO1xuXG4vLyBNYXRjaGluZyBxdWVzdGlvbiBibG9jay4gVHdvIGNvbHVtbnM6IGxlZnQgXCJpdGVtc1wiIChzdGVtcywgZG9jdW1lbnQgb3JkZXIpXG4vLyBhbmQgcmlnaHQgXCJ0YXJnZXRzXCIgKGxldHRlcmVkIEEsIEIsIENcdTIwMjYsIHNodWZmbGVkIGF0IHB1Ymxpc2ggdGltZSkuIFRoZVxuLy8gc3R1ZGVudCBkcmFncyBhIHRhcmdldCBjYXJkIG9udG8gYW4gaXRlbTsgdGhlIGNhcmQgZG9ja3MgbmV4dCB0byB0aGUgc3RlbS5cbi8vIERlc2lnbjogZG9jcy9kZXNpZ24vbWF0Y2hpbmctb3JkZXJpbmctcXVlc3Rpb25zLm1kIChkZWNpZGVkIDIwMjYtMDctMTApLlxuLy9cbi8vIERpc3RyYWN0b3JzOiB0YXJnZXRzIG1heSBleGNlZWQgaXRlbXMgXHUyMDE0IGFuIHVubWF0Y2hlZCB0YXJnZXQgaXMgc2ltcGx5XG4vLyByZWZlcmVuY2VkIGJ5IG5vIGtleSBlbnRyeS4gU2V2ZXJhbCBpdGVtcyBtYXkgc2hhcmUgb25lIHRhcmdldFxuLy8gKFwiY2F0ZWdvcml6YXRpb24tbGl0ZVwiOiBjbGFzc2lmeSBlYWNoIGV4cHJlc3Npb24gYXMgbGluZWFyL3F1YWRyYXRpYy9cbi8vIGV4cG9uZW50aWFsKSBcdTIwMTQgYWx3YXlzIGFsbG93ZWQ7IHRoZSBhbGxvd1RhcmdldFJldXNlIGdhdGUgd2FzIGRlbGV0ZWRcbi8vIDIwMjYtMDgtMjQgYWZ0ZXIgc2hpcHBpbmcgaW5lcnQgaW4gYm90aCBkaXJlY3Rpb25zLlxuLy9cbi8vIFNjb3JlZCBQRVIgUEFJUiAoZWFybmVkL3RvdGFsIFx1MjAxNCB0aGUgZnJhY3Rpb25hbCBDaGVja3BvaW50UmVzdWx0IHByZWNlZGVudFxuLy8gZnJvbSB3aXJlIHY0KTogZWFjaCBpdGVtIGlzIG9uZSBwb2ludCwgY29ycmVjdCB3aGVuIHRoZSBzdHVkZW50J3MgdGFyZ2V0XG4vLyBmb3IgaXQgZXF1YWxzIGtleVtpdGVtSWRdLiBCbG9jayBgY29ycmVjdGAgPSBldmVyeSBwYWlyIHJpZ2h0LiBObyBiaXBhcnRpdGVcbi8vIG1hY2hpbmVyeSBcdTIwMTQgdGhlIHN0dWRlbnQncyBwYWlyaW5nIElTIHRoZSBhc3NpZ25tZW50IChjb250cmFzdCBibGFuayBncm91cHMsXG4vLyB3aGVyZSB0eXBlZCB2YWx1ZXMgbXVzdCBiZSBtYXRjaGVkIHRvIHNsb3RzKS5cbi8vXG4vLyBGaWd1cmVzOiBpdGVtcyBhbmQgdGFyZ2V0cyBib3RoIHRha2UgdGhlIG9wdGlvbmFsIGltYWdlL2dyYXBoIGZpZ3VyZSBzbG90XG4vLyBzaGlwcGVkIGZvciBNQyBjaG9pY2VzIChDaG9pY2VJbWFnZS9DaG9pY2VHcmFwaCBcdTIwMTQgVVJMLW9ubHkgaW1hZ2U7IHN0YXRpY1xuLy8gZ3JhcGggdmlhIHRoZSByZW5kZXJlcidzIGtpdC1mcmVlIFNWRyBlbmdpbmUsIHNvIGBleHByZXNzaW9uYCBkcmF3YWJsZXMgYXJlXG4vLyBleGNsdWRlZCB0aGVyZSBhbmQgdGhlIGVkaXRvciBkb2Vzbid0IG9mZmVyIHRoZW0pLiBcIk1hdGNoIHRoZSBncmFwaCB0byBpdHNcbi8vIGVxdWF0aW9uXCIgaXMgdGhlIG1hcnF1ZWUgY2FzZS5cbi8vXG4vLyBEZWxpYmVyYXRlbHkgTk9UIHNjaGVtYS1lbmZvcmNlZDogXCJrZXkgY292ZXJzIGV2ZXJ5IGl0ZW1cIiAvIFwia2V5IHJlZmVyZW5jZXNcbi8vIHJlYWwgdGFyZ2V0cy5cIiBBIG1pZC1lZGl0IGRyYWZ0ICh0ZWFjaGVyIHN0aWxsIGFzc2lnbmluZyBhbnN3ZXJzKSBtdXN0XG4vLyBhdXRvc2F2ZTsgdGhlIGVkaXRvciBzdXJmYWNlcyB0aGUgd2FybmluZyBpbnN0ZWFkICh0aGUgTUMgemVyby1jb3JyZWN0XG4vLyBwcmVjZWRlbnQpLiBUaGUgcnVudGltZSB0cmVhdHMgYW4gaXRlbSBtaXNzaW5nIGZyb20gdGhlIGtleSBhcyBuZXZlclxuLy8gY29ycmVjdCBcdTIwMTQgd3JvbmcgYXV0aG9yaW5nLCBub3QgYSBjcmFzaC5cblxuZXhwb3J0IGNvbnN0IE1hdGNoaW5nSXRlbSA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAvLyBSaWNoIGlubGluZSBjb250ZW50IChmb3JtYXR0ZWQgdGV4dCArIGlubGluZSBtYXRoKS4gTm9uLWVtcHR5IGlzIGFuXG4gIC8vIGVkaXRvciBjb25jZXJuLCBub3QgYSBzY2hlbWEgb25lIChtaWQtZWRpdCBkcmFmdHMgbXVzdCBzYXZlKS5cbiAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgLy8gT3B0aW9uYWwgZmlndXJlIGJlbG93IHRoZSBpdGVtIHRleHQgKHNhbWUgc2luZ2xlLWZpZ3VyZS1zbG90IHRyZWF0bWVudFxuICAvLyBhcyBNQyBjaG9pY2VzOyBpbWFnZSByZW5kZXJzIGZpcnN0IGlmIGJvdGggYXJlIHNvbWVob3cgc2V0KS5cbiAgaW1hZ2U6IENob2ljZUltYWdlLm9wdGlvbmFsKCksXG4gIGdyYXBoOiBDaG9pY2VHcmFwaC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNYXRjaGluZ0l0ZW0gPSB6LmluZmVyPHR5cGVvZiBNYXRjaGluZ0l0ZW0+O1xuXG5leHBvcnQgY29uc3QgTWF0Y2hpbmdUYXJnZXQgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgaW1hZ2U6IENob2ljZUltYWdlLm9wdGlvbmFsKCksXG4gIGdyYXBoOiBDaG9pY2VHcmFwaC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNYXRjaGluZ1RhcmdldCA9IHouaW5mZXI8dHlwZW9mIE1hdGNoaW5nVGFyZ2V0PjtcblxuZXhwb3J0IGNvbnN0IE1hdGNoaW5nQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdtYXRjaGluZycpLFxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAuLi5sYWJlbEZpZWxkcyxcbiAgLy8gVGhlIHF1ZXN0aW9uIHByb3NlIChyaWNoIGlubGluZSBjb250ZW50LCBsaWtlIGEgcHJvYmxlbSBzdGF0ZW1lbnQpLlxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIC8vIExlZnQgY29sdW1uLCBkb2N1bWVudCBvcmRlci5cbiAgaXRlbXM6IHouYXJyYXkoTWF0Y2hpbmdJdGVtKS5taW4oMiksXG4gIC8vIFJpZ2h0IGNvbHVtbjsgbWF5IGV4Y2VlZCBpdGVtcyAoZXh0cmEgdGFyZ2V0cyBhcmUgZGlzdHJhY3RvcnMpLiBMZXR0ZXJzXG4gIC8vIGFyZSBhc3NpZ25lZCBieSBwb3NpdGlvbiBBRlRFUiB0aGUgcHVibGlzaC10aW1lIHNodWZmbGUsIG5ldmVyIGF1dGhvcmVkLlxuICB0YXJnZXRzOiB6LmFycmF5KE1hdGNoaW5nVGFyZ2V0KS5taW4oMiksXG4gIC8vIFRoZSBjb3JyZWN0IHBhaXJpbmc6IGl0ZW0gaWQgXHUyMTkyIHRhcmdldCBpZC4gUGFydGlhbCBkdXJpbmcgYXV0aG9yaW5nIChzZWVcbiAgLy8gaGVhZGVyKTsgbWFueS10by1vbmUgaXMgYWxsb3dlZCAodGhlIGdyYWRlcidzIGl0ZW1cdTIxOTJ0YXJnZXQga2V5IHNjb3JlcyBpdFxuICAvLyBuYXR1cmFsbHksIGFuZCB0aGUgdmlld2VyIG5ldmVyIHJlc3RyaWN0ZWQgZG9ja2luZyBhIHRhcmdldCB0d2ljZSkuXG4gIGtleTogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIHouc3RyaW5nKCkudXVpZCgpKSxcbiAgLy8gTUMtcGFyaXR5IHByb2JsZW0gY2hyb21lIChvbmUgcHJvYmxlbSBzaGFwZSwgb25lIGRhc2hib2FyZCByb3cgc2hhcGUpLlxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIHdvcmtTcGFjZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgTWF0Y2hpbmdCbG9jayA9IHouaW5mZXI8dHlwZW9mIE1hdGNoaW5nQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcblxuLy8gT3JkZXJpbmcgLyBzZXF1ZW5jaW5nIHF1ZXN0aW9uIGJsb2NrLiBUaGUgQVVUSE9SRUQgb3JkZXIgb2YgYGl0ZW1zYCBJUyB0aGVcbi8vIGNvcnJlY3Qgb3JkZXI7IHN0dWRlbnRzIHNlZSB0aGUgbGlzdCBzaHVmZmxlZCBhdCBwdWJsaXNoIHRpbWUgYW5kIGRyYWcgaXRcbi8vIGJhY2sgaW50byBzZXF1ZW5jZS4gRGVzaWduOiBkb2NzL2Rlc2lnbi9tYXRjaGluZy1vcmRlcmluZy1xdWVzdGlvbnMubWRcbi8vIChkZWNpZGVkIDIwMjYtMDctMTApLlxuLy9cbi8vIFNjb3JlZCBBTEwtT1ItTk9USElORyBvbiBleGFjdCBzZXF1ZW5jZSBlcXVhbGl0eSAoYXV0aG9yIGNhbGw6IHBhcnRpYWwtXG4vLyBjcmVkaXQgbWV0cmljcyBmb3Igb3JkZXJpbmdzIGFyZSBlaXRoZXIgbWlzbGVhZGluZyBcdTIwMTQgcG9zaXRpb24gbWF0Y2hlc1xuLy8gcHVuaXNoIGFuIG9mZi1ieS1vbmUgc2hpZnQgYWJzdXJkbHkgXHUyMDE0IG9yIG9wYXF1ZSB0byB0ZWFjaGVyczsgcmV2aXNpdCBvbmx5XG4vLyBvbiBvYnNlcnZlZCBkZW1hbmQpLiBJbnRlcmNoYW5nZWFibGUgYWRqYWNlbnQgaXRlbXM6IFlBR05JLCBhZGRpdGl2ZSBsYXRlci5cbi8vXG4vLyBBbiB1bnRvdWNoZWQgbGlzdCBpcyBhbiBPTUlTU0lPTiwgbm90IGFuIGFuc3dlcjogYSBzaHVmZmxlZCBsaXN0IGlzIGFsd2F5c1xuLy8gKnNvbWUqIHNlcXVlbmNlLCBzbyB0aGUgcnVudGltZSBvbmx5IHJlY29yZHMgYSByZXNwb25zZSBvbmNlIHRoZSBzdHVkZW50XG4vLyBoYXMgbW92ZWQgc29tZXRoaW5nLlxuLy9cbi8vIE5vIGZpZ3VyZSBzbG90IG9uIGl0ZW1zIGluIHYxIChubyBjbGVhciB1c2UgY2FzZSB5ZXQ7IGFkZGl0aXZlIGxhdGVyIFx1MjAxNFxuLy8gdGhlIE1DL21hdGNoaW5nIENob2ljZUltYWdlL0Nob2ljZUdyYXBoIHBhdHRlcm4gaXMgc2l0dGluZyB0aGVyZSkuXG5cbmV4cG9ydCBjb25zdCBPcmRlcmluZ0l0ZW0gPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgLy8gUmljaCBpbmxpbmUgY29udGVudCAoZm9ybWF0dGVkIHRleHQgKyBpbmxpbmUgbWF0aCkuIE5vbi1lbXB0eSBpcyBhblxuICAvLyBlZGl0b3IgY29uY2Vybiwgbm90IGEgc2NoZW1hIG9uZSAobWlkLWVkaXQgZHJhZnRzIG11c3Qgc2F2ZSkuXG4gIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG59KTtcbmV4cG9ydCB0eXBlIE9yZGVyaW5nSXRlbSA9IHouaW5mZXI8dHlwZW9mIE9yZGVyaW5nSXRlbT47XG5cbmV4cG9ydCBjb25zdCBPcmRlcmluZ0Jsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnb3JkZXJpbmcnKSxcbiAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLi4ubGFiZWxGaWVsZHMsXG4gIC8vIFRoZSBxdWVzdGlvbiBwcm9zZSAocmljaCBpbmxpbmUgY29udGVudCwgbGlrZSBhIHByb2JsZW0gc3RhdGVtZW50KS5cbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICAvLyBBdXRob3JlZCBvcmRlciA9IGNvcnJlY3Qgb3JkZXIuIFRoZSByZW5kZXJlciBzaHVmZmxlcyBkZXRlcm1pbmlzdGljYWxseVxuICAvLyAoc2VlZGVkIGJ5IGJsb2NrIGlkKSBmb3IgdGhlIHN0dWRlbnQtZmFjaW5nIGFycmFuZ2VtZW50LlxuICBpdGVtczogei5hcnJheShPcmRlcmluZ0l0ZW0pLm1pbigyKSxcbiAgLy8gTUMtcGFyaXR5IHByb2JsZW0gY2hyb21lIChvbmUgcHJvYmxlbSBzaGFwZSwgb25lIGRhc2hib2FyZCByb3cgc2hhcGUpLlxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIHdvcmtTcGFjZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgT3JkZXJpbmdCbG9jayA9IHouaW5mZXI8dHlwZW9mIE9yZGVyaW5nQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcbmltcG9ydCB7IEVuZHBvaW50U3R5bGUgfSBmcm9tICcuL2ludGVyYWN0aXZlLWdyYXBoLmpzJztcbmltcG9ydCB7IHNpemluZ0ZpZWxkcyB9IGZyb20gJy4uL3NpemluZy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBudW1iZXItbGluZS50cyBcdTIwMTQgdGhlIG51bWJlcl9saW5lIGJsb2NrICgxLUQgZ3JhZGVkLCBLLTggLyBlYXJseSBhbGdlYnJhKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSAxLUQgc2libGluZyBvZiBpbnRlcmFjdGl2ZV9ncmFwaC4gVGhlIHN0dWRlbnQncyBhbnN3ZXIgaXMgR0VPTUVUUklDIFx1MjAxNCBhXG4vLyBwb2ludCAob3Igc2V2ZXJhbCkgcGxvdHRlZCBvbiBhIHNpbmdsZSBudW1iZXIgbGluZSwgb3IgYW4gaW50ZXJ2YWwvcmF5IHdpdGhcbi8vIG9wZW4vY2xvc2VkIGVuZHBvaW50cyAoXCJncmFwaCB4ID49IC0yXCIpLiBTYW1lIHRocmVlIHN0cnVjdHVyYWwgY29uc2VxdWVuY2VzXG4vLyBhcyB0aGUgZ3JhcGggYmxvY2sgKHNlZSBkb2NzL2Rlc2lnbi9udW1iZXItbGluZS1ibG9jay5tZCk6IGEgc3RydWN0dXJlZFxuLy8gYW5zd2VyIHdpdGggaXRzIE9XTiBzdWJtaXNzaW9uIG1hcCAobnVtYmVyTGluZVJlc3BvbnNlcywgbm90IHRoZSBibGFua3MgbWFwKSxcbi8vIHRvbGVyYW5jZS1iYXNlZCBnZW9tZXRyaWMgc2NvcmluZyBkb25lIGJ5IHRoZSBsYXp5IGdyYXBoLWtpdCAobm90IHRoZVxuLy8gcnVudGltZSdzIHN0cmluZyBzdHJhdGVnaWVzKSwgYW5kIGEgd2lkZ2V0IHRoYXQgcmlkZXMgQGFjdGl2aXR5L2dyYXBoLWtpdC5cbi8vXG4vLyBBIFNFUEFSQVRFIGJsb2NrIGZhbWlseSwgbm90IGEgR3JhcGhJbnRlcmFjdGlvbiB2YXJpYW50IChhdXRob3IgY2FsbCwgU1RBVEVcbi8vIDIwMjYtMDctMTApOiBudW1iZXIgbGluZXMgYXJlIDEtRCBhbmQgbXVzdCBub3QgYmUgZm9yY2VkIHVuZGVyIHRoZSBncmFwaFxuLy8gYmxvY2sncyAyLUQgQXhpc0NvbmZpZy4gRW5kcG9pbnRTdHlsZSBpcyBzaGFyZWQgZnJvbSBpbnRlcmFjdGl2ZS1ncmFwaC50cyBcdTIwMTRcbi8vIGl0IHdhcyByZXNlcnZlZCB0aGVyZSBcImZvciB0aGUgZnV0dXJlIG51bWJlci1saW5lIGZhbWlseVwiIGZyb20gRHJvcCAyLlxuLy9cbi8vIFNsaWNlIDEgc2hpcHMgVFdPIGludGVyYWN0aW9ucyAocGxvdF9wb2ludCwgcGxvdF9pbnRlcnZhbCksIGRpc2NyaW1pbmF0ZWQgb25cbi8vIGB0eXBlYCBmcm9tIGRheSBvbmUgc28gcGxvdF9yYXkgLyBkaXNwbGF5IHNsb3QgaW4gYWRkaXRpdmVseSBsYXRlciwgZXhhY3RseVxuLy8gaG93IEdyYXBoSW50ZXJhY3Rpb24gZ3Jvd3MuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyAtLS0tIExpbmUgY29uZmlndXJhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIDEtRCBhbmFsb2d1ZSBvZiBBeGlzQ29uZmlnLiBMaW5lIHVuaXRzIHRocm91Z2hvdXQgXHUyMDE0IHRvbGVyYW5jZSBhbmQgdGlja1xuLy8gc3RlcHMgYXJlIGluIHRoZSBzYW1lIHVuaXRzLCBuZXZlciBwaXhlbHMsIHNvIGEgcGFnZSB0aGF0IHJlLWxheXMtb3V0IGF0IGFcbi8vIGRpZmZlcmVudCB3aWR0aCBzdGlsbCBzY29yZXMgaWRlbnRpY2FsbHkuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUNvbmZpZyA9IHoub2JqZWN0KHtcbiAgbWluOiB6Lm51bWJlcigpLFxuICBtYXg6IHoubnVtYmVyKCksXG4gIC8vIFNwYWNpbmcgYmV0d2VlbiBMQUJFTEVEIHRpY2tzIChsaW5lIHVuaXRzKS5cbiAgdGlja1N0ZXA6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5kZWZhdWx0KDEpLFxuICAvLyBVbmxhYmVsZWQgbWlub3IgdGlja3MgZHJhd24gYmV0d2VlbiBlYWNoIHBhaXIgb2YgbGFiZWxlZCB0aWNrcyAoMCA9IG5vbmUpLlxuICAvLyBWaXN1YWwgb25seSBcdTIwMTQgbmV2ZXIgc2NvcmVkLlxuICBtaW5vclRpY2tzUGVyU3RlcDogei5udW1iZXIoKS5pbnQoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMCksXG4gIC8vIFdoZW4gdHJ1ZSwgYSBkcmFnZ2VkIGhhbmRsZSBzbmFwcyB0byB0aGUgbmVhcmVzdCB0aWNrIChtaW5vciBpZiBwcmVzZW50LFxuICAvLyBlbHNlIHRoZSBsYWJlbGVkIHN0ZXApLiBLZXlib2FyZCBudWRnZSBhbHdheXMgbW92ZXMgYnkgb25lIHRpY2sgcmVnYXJkbGVzc1xuICAvLyAoU2hpZnQgPSBmaW5lLCBvbmUtdGVudGggb2YgYSB0aWNrKS5cbiAgc25hcFRvVGljazogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbn0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZUNvbmZpZyA9IHouaW5mZXI8dHlwZW9mIE51bWJlckxpbmVDb25maWc+O1xuXG4vLyAtLS0tIEludGVyYWN0aW9uIHZhcmlhbnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gcGxvdF9wb2ludDogdGhlIHN0dWRlbnQgcGxhY2VzIG9uZSBvciBtb3JlIHBvaW50cyBvbiB0aGUgbGluZS4gTXVsdGktcG9pbnRcbi8vIChcInBsb3QgLTIgYW5kIDVcIikgaXMgc2NvcmVkIGNvbnN1bWUtb25jZSwgYWxsLW9yLW5vdGhpbmcgXHUyMDE0IGV2ZXJ5IGNvcnJlY3Rcbi8vIHBvc2l0aW9uIG11c3QgYmUgbWF0Y2hlZCAobWlycm9ycyB0aGUgZ3JhcGggYmxvY2sncyBOLWhhbmRsZSBwbG90X3BvaW50KS5cbmV4cG9ydCBjb25zdCBOdW1iZXJMaW5lUG9pbnRJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X3BvaW50JyksXG4gIC8vIENvcnJlY3QgcG9zaXRpb25zIGluIGxpbmUgdW5pdHMuIEEgc2luZ2xlIHBvaW50IGlzIHRoZSBjb21tb24gY2FzZS5cbiAgY29ycmVjdFBvaW50czogei5hcnJheSh6Lm51bWJlcigpKS5taW4oMSksXG4gIC8vIE1hdGNoIHJhZGl1cyBpbiBsaW5lIHVuaXRzIChhIHBvaW50IGlzIGNvcnJlY3Qgd2l0aGluICsvLSB0b2xlcmFuY2UpLlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uXG4+O1xuXG4vLyBBbiBpbnRlcnZhbCBvciByYXkgb24gdGhlIGxpbmUuIEEgcHJlc2VudCBib3VuZCBjYXJyaWVzIGFuIG9wZW4vY2xvc2VkIHN0eWxlXG4vLyAodGhlIGluZXF1YWxpdHkgZGlzdGluY3Rpb246IHggPiAzIG9wZW4gdnMgeCA+PSAzIGNsb3NlZCkuIEFuIEFCU0VOVCBib3VuZCBpc1xuLy8gdW5ib3VuZGVkIHRoYXQgZGlyZWN0aW9uIFx1MjAxNCBzbyBhIHJheSBpcyBqdXN0IGFuIGludGVydmFsIHdpdGggb25lIHNpZGUgb21pdHRlZFxuLy8gKFwieCA+PSAzXCIgPSBtaW4gMyBjbG9zZWQsIG5vIG1heDsgXCJ4IDwgNVwiID0gbWF4IDUgb3Blbiwgbm8gbWluKS4gVGhlIHNoYWRlZFxuLy8gcmVnaW9uIGlzIHVuYW1iaWd1b3VzIGZyb20gd2hpY2ggYm91bmRzIGFyZSBwcmVzZW50LCBzbyBubyBzZXBhcmF0ZSBzaWRlIGZsYWdcbi8vIGlzIG5lZWRlZCAodW5saWtlIHRoZSAyLUQgZ3JhcGggaW5lcXVhbGl0eSkuIEF0IGxlYXN0IG9uZSBib3VuZCBtdXN0IGJlXG4vLyBwcmVzZW50IChhIHR3by1zaWRlZC11bmJvdW5kZWQgaW50ZXJ2YWwgaXMgdGhlIHdob2xlIGxpbmUgXHUyMDE0IG1lYW5pbmdsZXNzKTsgdGhlXG4vLyBmYWN0b3J5ICsgYXV0aG9yIFVJIGd1YXJhbnRlZSBpdCBhbmQgdGhlIHNjb3JlciBhc3N1bWVzIGl0LlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVJbnRlcnZhbCA9IHoub2JqZWN0KHtcbiAgbWluOiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIG1pblN0eWxlOiBFbmRwb2ludFN0eWxlLm9wdGlvbmFsKCksXG4gIG1heDogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBtYXhTdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBOdW1iZXJMaW5lSW50ZXJ2YWwgPSB6LmluZmVyPHR5cGVvZiBOdW1iZXJMaW5lSW50ZXJ2YWw+O1xuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9pbnRlcnZhbCcpLFxuICBjb3JyZWN0SW50ZXJ2YWw6IE51bWJlckxpbmVJbnRlcnZhbCxcbiAgLy8gTWF0Y2ggcmFkaXVzIGluIGxpbmUgdW5pdHMsIGFwcGxpZWQgdG8gZWFjaCBwcmVzZW50IGVuZHBvaW50LlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVJbnRlcnZhbEludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIE51bWJlckxpbmVJbnRlcnZhbEludGVyYWN0aW9uXG4+O1xuXG4vLyBEaXNjcmltaW5hdGVkIG9uIGB0eXBlYCBzbyBjb25zdW1lcnMgYnJhbmNoIHVuaWZvcm1seSBhbmQgdGhlIHdpcmUgZm9ybWF0XG4vLyBhbHdheXMgY2FycmllcyBpdC4gR3Jvd2luZyBhIHZhcmlhbnQgaXMgYSBuZXcgbWVtYmVyIGhlcmUgKyBhIG5ldyBzY29yZXJcbi8vIGJyYW5jaCBpbiB0aGUga2l0IFx1MjAxNCBubyBvdGhlciBibG9jayB0b3VjaGVkLlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVJbnRlcmFjdGlvbiA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBOdW1iZXJMaW5lUG9pbnRJbnRlcmFjdGlvbixcbiAgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb24sXG5dKTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIE51bWJlckxpbmVJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gVGhlIGJsb2NrIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBdXRvLW51bWJlcmVkIGxpa2UgdGhlIG90aGVyIHF1ZXN0aW9uIGJsb2Nrcy4gc2tpbGxzICsgc29sdXRpb24gZm9sbG93IHRoZVxuLy8gc2FtZSBvcHQtaW4gcGF0dGVybnMgRmlsbEluQmxhbmtCbG9jayAvIEludGVyYWN0aXZlR3JhcGggZXN0YWJsaXNoZWQuXG4vLyBEZWxpYmVyYXRlbHkgTEVBTiBmb3Igc2xpY2UgMSAobm8gYWxsb3dOb1NvbHV0aW9uIC8gbWlzdGFrZUZlZWRiYWNrKSBcdTIwMTRcbi8vIGFsbC1vci1ub3RoaW5nIHNjb3JpbmcgKGRlc2lnbiBkZWNpc2lvbiA2KTsgdGhvc2UgZmllbGRzIGFyZSBhZGRpdGl2ZSBsYXRlclxuLy8gaWYgYXNrZWQgZm9yIChZQUdOSSksIGV4YWN0bHkgYXMgdGhlIGdyYXBoIGJsb2NrIHJlc2VydmVkIHRoZW0gYWNyb3NzIGRyb3BzLlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ251bWJlcl9saW5lJyksXG4gIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC4uLmxhYmVsRmllbGRzLFxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGNvbmZpZzogTnVtYmVyTGluZUNvbmZpZyxcbiAgaW50ZXJhY3Rpb246IE51bWJlckxpbmVJbnRlcmFjdGlvbixcbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICAvLyBWYXJpYWJsZSBibG9jayBzaXppbmc6IG9wdGlvbmFsIHdpZHRoIGZyYWN0aW9uICsgYWxpZ25tZW50IChzaXppbmcudHMpLlxuICAvLyBBZGRpdGl2ZS9vcHRpb25hbCBcdTIwMTQgbm8gc2NoZW1hVmVyc2lvbiBidW1wLlxuICAuLi5zaXppbmdGaWVsZHMsXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVCbG9jayA9IHouaW5mZXI8dHlwZW9mIE51bWJlckxpbmVCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuaW1wb3J0IHsgTnVtYmVyTGluZUNvbmZpZyB9IGZyb20gJy4vbnVtYmVyLWxpbmUuanMnO1xuaW1wb3J0IHsgc2l6aW5nRmllbGRzIH0gZnJvbSAnLi4vc2l6aW5nLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGRhdGEtcGxvdC50cyBcdTIwMTQgdGhlIGRhdGFfcGxvdCBibG9jayAoc3RhdGlzdGljcyBjaGFydHMpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHN0YXRpc3RpY3Mgc2libGluZyBvZiBpbnRlcmFjdGl2ZV9ncmFwaCAoMi1EIGZ1bmN0aW9ucykgYW5kIG51bWJlcl9saW5lXG4vLyAoMS1EIGdlb21ldHJ5KS4gQSBkYXRhX3Bsb3QgcmVuZGVycyBhIGRvdCBwbG90LCBoaXN0b2dyYW0sIG9yIGJveCBwbG90IGZyb20gYVxuLy8gZGF0YXNldCBcdTIwMTQgZWl0aGVyIGFzIGEgc3RhdGljIFNUSU1VTFVTIHRoZSBzdHVkZW50IHJlYWRzIChcIndoYXQgaXMgdGhlIG1lZGlhblxuLy8gb2YgdGhpcyBib3ggcGxvdD9cIiwgcGFpcmVkIHdpdGggYSBzaWJsaW5nIG51bWVyaWMvTUMgYmxvY2spIG9yIGFzIGEgZ3JhZGVkXG4vLyBDT05TVFJVQ1RJT04gdGhlIHN0dWRlbnQgYnVpbGRzIChcIm1ha2UgYSBkb3QgcGxvdCBvZiB0aGVzZSB2YWx1ZXNcIikuXG4vL1xuLy8gQSBTRVBBUkFURSBibG9jayBmYW1pbHksIG5vdCBhIEdyYXBoSW50ZXJhY3Rpb24gdmFyaWFudCAodGF4b25vbXkgZml4ZWRcbi8vIDIwMjYtMDctMTAsIFNUQVRFKTogc3RhdHMgY2hhcnRzIGFyZSB0aGVpciBvd24gc2hhcGUgYW5kIG11c3Qgbm90IGJlIGZvcmNlZFxuLy8gdW5kZXIgdGhlIGdyYXBoIGJsb2NrJ3MgMi1EIEF4aXNDb25maWcuIERlc2lnbiArIDkgZGVjaXNpb25zIGluXG4vLyBkb2NzL2Rlc2lnbi9kYXRhLXBsb3QtYmxvY2subWQgKGF1dGhvciBhcHByb3ZlZCB0aGUgcmVjb21tZW5kZWQgYW5zd2VycykuXG4vL1xuLy8gVEhFIEFOU1dFUiBJUyBDT01QVVRFRCBGUk9NIFRIRSBEQVRBIChkZXNpZ24gZGVjaXNpb24gM2EpOiBhIGRvdCBwbG90LFxuLy8gaGlzdG9ncmFtLCBhbmQgYm94IHBsb3QgYXJlIGVhY2ggYSBkZXRlcm1pbmlzdGljIGZ1bmN0aW9uIG9mIGBkYXRhYCwgc28gdGhlXG4vLyBhdXRob3IgZW50ZXJzIHRoZSByYXcgZGF0YXNldCBPTkNFIGFuZCB0aGUgY29ycmVjdCBwbG90IGlzIGRlcml2ZWQgYnkgdGhlIGtpdFxuLy8gc2NvcmVyIFx1MjAxNCB0aGVyZSBpcyBubyBzZXBhcmF0ZWx5LWF1dGhvcmVkIGFuc3dlciBrZXkgdG8gZHJpZnQgZnJvbSB0aGUgZGF0YS5cbi8vIFRoZSBzYW1lIGBkYXRhYCByZW5kZXJzIHRoZSBjaGFydCBpbiBkaXNwbGF5IG1vZGUgYW5kIGlzIHRoZSBzb3VyY2UgdGhlXG4vLyBzdHVkZW50IHBsb3RzIChhbmQgdGhlIGtleSBpdCdzIHNjb3JlZCBhZ2FpbnN0KSBpbiBidWlsZCBtb2RlLlxuLy9cbi8vIFNsaWNlIDEgc2hpcHMgVFdPIGludGVyYWN0aW9ucyBcdTIwMTQgYGRpc3BsYXlgIChhbGwgdGhyZWUgY2hhcnQgdHlwZXMsIHVuZ3JhZGVkXG4vLyBzdGltdWx1cykgYW5kIGBidWlsZF9kb3RwbG90YCAodGhlIHNpbXBsZXN0IGdyYWRlZCBjb25zdHJ1Y3Rpb24pIFx1MjAxNFxuLy8gZGlzY3JpbWluYXRlZCBvbiBgdHlwZWAgZnJvbSBkYXkgb25lIHNvIGBidWlsZF9oaXN0b2dyYW1gIC8gYGJ1aWxkX2JveHBsb3RgXG4vLyBzbG90IGluIGFkZGl0aXZlbHkgbGF0ZXIsIGV4YWN0bHkgaG93IEdyYXBoSW50ZXJhY3Rpb24gYW5kIE51bWJlckxpbmVJbnRlcmFjdGlvblxuLy8gZ3Jvdy4gU2FtZSB0aHJlZSBzdHJ1Y3R1cmFsIGNvbnNlcXVlbmNlcyBhcyB0aGUgZ3JhcGgvbnVtYmVyLWxpbmUgYmxvY2tzOiBhXG4vLyBzdHJ1Y3R1cmVkIGFuc3dlciB3aXRoIGl0cyBPV04gc3VibWlzc2lvbiBtYXAgKGRhdGFQbG90UmVzcG9uc2VzLCBub3QgdGhlXG4vLyBibGFua3MgbWFwKSwgZnJlcXVlbmN5L3N1bW1hcnkgc2NvcmluZyBkb25lIGJ5IHRoZSBsYXp5IGdyYXBoLWtpdCAobm90IHRoZVxuLy8gcnVudGltZSdzIHN0cmluZyBzdHJhdGVnaWVzKSwgYW5kIGEgd2lkZ2V0IHRoYXQgcmlkZXMgQGFjdGl2aXR5L2dyYXBoLWtpdC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIC0tLS0gQ2hhcnQgY29uZmlndXJhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgbnVtZXJpYyBheGlzIGlzIHJldXNlZCBWRVJCQVRJTSBmcm9tIE51bWJlckxpbmVDb25maWcgKGRlc2lnbiBkZWNpc2lvbiA1KTpcbi8vIGEgZG90IHBsb3Qgc3RhY2tzIGRvdHMgYWJvdmUgdGhlaXIgdmFsdWUgb24gYSAxLUQgbnVtYmVyIGxpbmUsIGFuZCBhIGJveCBwbG90XG4vLyBzaXRzIG9uIHRoYXQgc2FtZSBheGlzLCBzbyB0aGUgdGljay9taW5vci9zbmFwIHNlbWFudGljcyBhcmUgaWRlbnRpY2FsLiBUaGVcbi8vIGhpc3RvZ3JhbS1vbmx5IGV4dHJhcyAoZXF1YWwtd2lkdGggYmlucyArIGFuIG9wdGlvbmFsIHktc2NhbGUgY2VpbGluZykgYXJlXG4vLyBjb25zdWx0ZWQgb25seSB3aGVuIHRoZSBjaGFydCBpcyBhIGhpc3RvZ3JhbTsgdW5lcXVhbC1iaW4gYGJpbkVkZ2VzYCBpcyBhXG4vLyBkb2N1bWVudGVkIGxhdGVyIGxldmVyIChZQUdOSSBpbiBzbGljZSAxKS5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdENvbmZpZyA9IE51bWJlckxpbmVDb25maWcuZXh0ZW5kKHtcbiAgLy8gRXF1YWwtd2lkdGggYmluIHNpemUgc3Bhbm5pbmcgW21pbiwgbWF4XTsgb25seSByZWFkIHdoZW4gY2hhcnQgPT1cbiAgLy8gJ2hpc3RvZ3JhbScuIEFic2VudCBcdTIxOTIgdGhlIGhpc3RvZ3JhbSBmYWxscyBiYWNrIHRvIGB0aWNrU3RlcGAgYXMgdGhlIGJpblxuICAvLyB3aWR0aC4gUG9zaXRpdmUuXG4gIGJpbldpZHRoOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLy8gRml4ZWQgY2VpbGluZyBmb3IgdGhlIGhpc3RvZ3JhbS9kb3QtcGxvdCB2ZXJ0aWNhbCBzY2FsZS4gQWJzZW50IFx1MjE5MiB0aGVcbiAgLy8gc2NhbGUgYXV0by1maXRzIHRoZSB0YWxsZXN0IGJhci9zdGFjayBmcm9tIGBkYXRhYC4gQSBmaXhlZCB2YWx1ZSBrZWVwc1xuICAvLyBzZXZlcmFsIHBsb3RzIG9uIGEgcGFnZSB2aXN1YWxseSBjb21wYXJhYmxlLiBQb3NpdGl2ZSBpbnRlZ2VyIChmcmVxdWVuY3kpLlxuICBtYXhGcmVxdWVuY3k6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdENvbmZpZyA9IHouaW5mZXI8dHlwZW9mIERhdGFQbG90Q29uZmlnPjtcblxuLy8gVGhlIGNoYXJ0IHNoYXBlLiBTaGFyZWQgYnkgdGhlIGBkaXNwbGF5YCBtZW1iZXIgKHdoaWNoIG9uZSB0byByZW5kZXIpIGFuZFxuLy8gaW1wbGllZCBieSBlYWNoIGBidWlsZF8qYCBtZW1iZXIuIE5hbWVkIGJ5IHNoYXBlLCBub3QgYnkgZ3JhZGUgYmFuZC5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdENoYXJ0ID0gei5lbnVtKFsnZG90cGxvdCcsICdoaXN0b2dyYW0nLCAnYm94cGxvdCddKTtcbmV4cG9ydCB0eXBlIERhdGFQbG90Q2hhcnQgPSB6LmluZmVyPHR5cGVvZiBEYXRhUGxvdENoYXJ0PjtcblxuLy8gLS0tLSBJbnRlcmFjdGlvbiB2YXJpYW50cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGRpc3BsYXk6IGEgc3RhdGljLCB1bmdyYWRlZCBjaGFydCBvZiBgZGF0YWAgXHUyMDE0IGEgc3RpbXVsdXMgdGhlIHN0dWRlbnQgcmVhZHMuXG4vLyBMaWtlIGludGVyYWN0aXZlX2dyYXBoJ3MgYGRpc3BsYXlgIG1lbWJlciBpdCBwdWxscyBubyBwcm9ibGVtIG51bWJlciwgaXNcbi8vIG5ldmVyIHNjb3JlZCwgYW5kIG5ldmVyIGpvaW5zIHRoZSBzdWJtaXNzaW9uIHBheWxvYWQ7IGEgXCJyZWFkIHRoaXMgY2hhcnQgdGhlblxuLy8gYW5zd2VyXCIgdGFzayBjb21wb3NlcyBhIGRpc3BsYXkgZGF0YV9wbG90IHdpdGggYSBzaWJsaW5nIG51bWVyaWMvTUMgYmxvY2tcbi8vICh0aGUgcGF0dGVybiB0aGF0IHJlcGxhY2VkIHRoZSByZXRpcmVkIGFuc3dlci1zdXJmYWNlLWFzLWEtZmllbGQgc2VhbSkuXG5leHBvcnQgY29uc3QgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnZGlzcGxheScpLFxuICBjaGFydDogRGF0YVBsb3RDaGFydCxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb25cbj47XG5cbi8vIGJ1aWxkX2RvdHBsb3Q6IHRoZSBzdHVkZW50IHN0YWNrcyBkb3RzIGFib3ZlIHRoZSBheGlzIHRvIHJlcHJvZHVjZSB0aGVcbi8vIGZyZXF1ZW5jeSBkaXN0cmlidXRpb24gb2YgYGRhdGFgLiBTY29yZWQgYWxsLW9yLW5vdGhpbmcgb24gZnJlcXVlbmN5LW1hcFxuLy8gZXF1YWxpdHkgKGRlc2lnbiBkZWNpc2lvbiA4KSBcdTIwMTQgZG90IHZhbHVlcyBhcmUgZGlzY3JldGUgKHRoZSB3aWRnZXQgc25hcHMgZWFjaFxuLy8gZG90IHRvIGEgdGljayksIHNvIHRoZSBjb21wYXJpc29uIGlzIGV4YWN0LCBubyB0b2xlcmFuY2UgZmllbGQuIFRoZSBjb3JyZWN0XG4vLyBkaXN0cmlidXRpb24gaXMgQ09NUFVURUQgZnJvbSBgZGF0YWAgKGRlY2lzaW9uIDNhKTsgbm90aGluZyB0byBhdXRob3IgaGVyZVxuLy8gYmV5b25kIHRoZSBkYXRhc2V0IGl0c2VsZiwgc28gdGhpcyBpcyBhIGJhcmUgbWFya2VyIHZhcmlhbnQgdGhhdCBncm93c1xuLy8gYnVpbGRfaGlzdG9ncmFtIC8gYnVpbGRfYm94cGxvdCBzaWJsaW5ncyBsYXRlci5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdERvdHBsb3RJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdidWlsZF9kb3RwbG90JyksXG59KTtcbmV4cG9ydCB0eXBlIERhdGFQbG90RG90cGxvdEludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIERhdGFQbG90RG90cGxvdEludGVyYWN0aW9uXG4+O1xuXG4vLyBidWlsZF9oaXN0b2dyYW06IHRoZSBzdHVkZW50IHNldHMgZWFjaCBiYXIncyBmcmVxdWVuY3kgdG8gcmVwcm9kdWNlIHRoZVxuLy8gaGlzdG9ncmFtIG9mIGBkYXRhYCAoYmlubmVkIGJ5IGNvbmZpZy5iaW5XaWR0aCBvdmVyIFttaW4sbWF4XSkuIFNjb3JlZFxuLy8gYWxsLW9yLW5vdGhpbmcgb24gZXhhY3QgcGVyLWJpbiBpbnRlZ2VyLWZyZXF1ZW5jeSBlcXVhbGl0eSAoYSBiYXIgaXMgYSB3aG9sZVxuLy8gY291bnQgXHUyMDE0IG5vIHRvbGVyYW5jZSksIHRoZSBmcmVxdWVuY3ktZGlzdHJpYnV0aW9uIHR3aW4gb2YgYnVpbGRfZG90cGxvdC4gVGhlXG4vLyBjb3JyZWN0IGhlaWdodHMgYXJlIENPTVBVVEVEIGZyb20gYGRhdGFgLCBzbyB0aGlzIHRvbyBpcyBhIGJhcmUgbWFya2VyIHZhcmlhbnQuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RIaXN0b2dyYW1JbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdidWlsZF9oaXN0b2dyYW0nKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RIaXN0b2dyYW1JbnRlcmFjdGlvbiA9IHouaW5mZXI8XG4gIHR5cGVvZiBEYXRhUGxvdEhpc3RvZ3JhbUludGVyYWN0aW9uXG4+O1xuXG4vLyBidWlsZF9ib3hwbG90OiB0aGUgc3R1ZGVudCBkcmFncyB0aGUgZml2ZS1udW1iZXItc3VtbWFyeSBoYW5kbGVzIChtaW4sIFExLFxuLy8gbWVkaWFuLCBRMywgbWF4KSB0byBidWlsZCB0aGUgYm94ICsgd2hpc2tlcnMgb2YgYGRhdGFgLiBTY29yZWQgYWxsLW9yLW5vdGhpbmdcbi8vIHdpdGggZWFjaCBoYW5kbGUgd2l0aGluIGB0b2xlcmFuY2VgIGxpbmUgdW5pdHMgb2YgdGhlIGNvbXB1dGVkIHN1bW1hcnkuIFVubGlrZVxuLy8gdGhlIGZyZXF1ZW5jeSBidWlsZHMgdGhpcyBjYXJyaWVzIGEgdG9sZXJhbmNlIGJlY2F1c2UgYm94IHBvc2l0aW9ucyBhcmVcbi8vIGNvbnRpbnVvdXMgYW5kIHRoZSB0d28gY29tbW9uIHF1YXJ0aWxlIG1ldGhvZHMgY2FuIGRpZmZlciBieSBhIGRhdGEgcG9pbnQgb25cbi8vIGV2ZW4tbGVuZ3RoIHNldHMgXHUyMDE0IHRoZSBrZXkgdXNlcyB0aGUgVEktODQgZXhjbHVzaXZlLW1lZGlhbiBtZXRob2QgKGxvY2tlZCxcbi8vIGRlc2lnbiBkZWNpc2lvbiA0KSBhbmQgdGhlIHRvbGVyYW5jZSBhYnNvcmJzIHRoZSBhZGphY2VudC1tZXRob2QgYW5zd2VyLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90Qm94cGxvdEludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2J1aWxkX2JveHBsb3QnKSxcbiAgLy8gTWF0Y2ggcmFkaXVzIGluIGxpbmUgdW5pdHMsIGFwcGxpZWQgdG8gZWFjaCBvZiB0aGUgZml2ZSBoYW5kbGVzLiBEZWZhdWx0XG4gIC8vIGhhbGYgYSB1bml0IHRpY2suXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC41KSxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RCb3hwbG90SW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgRGF0YVBsb3RCb3hwbG90SW50ZXJhY3Rpb25cbj47XG5cbi8vIERpc2NyaW1pbmF0ZWQgb24gYHR5cGVgIHNvIGNvbnN1bWVycyBicmFuY2ggdW5pZm9ybWx5IGFuZCB0aGUgd2lyZSBmb3JtYXRcbi8vIGFsd2F5cyBjYXJyaWVzIGl0LiBHcm93aW5nIGEgdmFyaWFudCBpcyBhIG5ldyBtZW1iZXIgaGVyZSArIGEgbmV3IHNjb3JlclxuLy8gYnJhbmNoIGluIHRoZSBraXQgXHUyMDE0IG5vIG90aGVyIGJsb2NrIHRvdWNoZWQuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RJbnRlcmFjdGlvbiA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBEYXRhUGxvdERpc3BsYXlJbnRlcmFjdGlvbixcbiAgRGF0YVBsb3REb3RwbG90SW50ZXJhY3Rpb24sXG4gIERhdGFQbG90SGlzdG9ncmFtSW50ZXJhY3Rpb24sXG4gIERhdGFQbG90Qm94cGxvdEludGVyYWN0aW9uLFxuXSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdEludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3RJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gVGhlIGJsb2NrIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBdXRvLW51bWJlcmVkIGxpa2UgdGhlIG90aGVyIHF1ZXN0aW9uIGJsb2NrcyBXSEVOIEdSQURFRCBcdTIwMTQgYSBgZGlzcGxheWBcbi8vIGRhdGFfcGxvdCBwdWxscyBubyBudW1iZXIgKHRoZSByZW5kZXJlcidzIGlzTnVtYmVyZWRCbG9jayByZXR1cm5zIGZhbHNlIGZvclxuLy8gaXQsIGV4YWN0bHkgYXMgaXQgZG9lcyBmb3IgYSBkaXNwbGF5IGludGVyYWN0aXZlX2dyYXBoKS4gc2tpbGxzICsgc29sdXRpb25cbi8vIGZvbGxvdyB0aGUgc2FtZSBvcHQtaW4gcGF0dGVybnMgdGhlIGdyYXBoIC8gbnVtYmVyLWxpbmUgYmxvY2tzIGVzdGFibGlzaGVkLFxuLy8gYW5kIChsaWtlIHRoZW0pIG1hdHRlciBvbmx5IGluIGJ1aWxkIG1vZGUuIERlbGliZXJhdGVseSBMRUFOIGZvciBzbGljZSAxXG4vLyAobm8gbWlzdGFrZUZlZWRiYWNrKSBcdTIwMTQgYWxsLW9yLW5vdGhpbmcgc2NvcmluZyAoZGVjaXNpb24gOCk7IHRob3NlIGZpZWxkc1xuLy8gYXJlIGFkZGl0aXZlIGxhdGVyIGlmIGFza2VkIGZvciAoWUFHTkkpLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90QmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdkYXRhX3Bsb3QnKSxcbiAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLi4ubGFiZWxGaWVsZHMsXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgLy8gVGhlIGRhdGFzZXQuIFNpbmdsZSBzb3VyY2Ugb2YgdHJ1dGg6IHRoZSBjaGFydCBpcyBkcmF3biBmcm9tIGl0IGFuZCwgaW5cbiAgLy8gYnVpbGQgbW9kZSwgdGhlIGNvcnJlY3QgYW5zd2VyIGlzIGRlcml2ZWQgZnJvbSBpdC4gTm9uLWVtcHR5LlxuICBkYXRhOiB6LmFycmF5KHoubnVtYmVyKCkpLm1pbigxKSxcbiAgY29uZmlnOiBEYXRhUGxvdENvbmZpZyxcbiAgaW50ZXJhY3Rpb246IERhdGFQbG90SW50ZXJhY3Rpb24sXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgLy8gVmFyaWFibGUgYmxvY2sgc2l6aW5nOiBvcHRpb25hbCB3aWR0aCBmcmFjdGlvbiArIGFsaWdubWVudCAoc2l6aW5nLnRzKS5cbiAgLy8gQWRkaXRpdmUvb3B0aW9uYWwgXHUyMDE0IG5vIHNjaGVtYVZlcnNpb24gYnVtcC5cbiAgLi4uc2l6aW5nRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdEJsb2NrID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3RCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrIFx1MjAxNCBhIHRpdGxlZCBsaXN0IG9mIGxlYXJuaW5nIG9iamVjdGl2ZXMuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBwdXJlIENPTlRFTlQgYmxvY2sgKGRhdGEtYmxvY2stY2F0ZWdvcnk9XCJjb250ZW50XCIpOiBub24taW50ZXJhY3RpdmUsXG4vLyBub24tbnVtYmVyZWQsIG5vIHJ1bnRpbWUgd2lyaW5nLCBubyBzdWJtaXNzaW9uIHdpcmUgaW1wYWN0LiBQZWRhZ29naWNhbGx5IGl0XG4vLyBmcm9udHMgYW4gYWN0aXZpdHkgKG9yIGEgc2VjdGlvbikgd2l0aCB0aGUgXCJzdHVkZW50cyB3aWxsIGJlIGFibGUgdG9cdTIwMjZcIiBnb2Fsc1xuLy8gdGhhdCBTd2VsbGVyLXN0eWxlIHNjYWZmb2xkaW5nIGlzIGJ1aWx0IGFyb3VuZC5cbi8vXG4vLyBTaGFwZTogYW4gZWRpdGFibGUgYHRpdGxlYCAoZGVmYXVsdGVkLCBidXQgdGhlIHRlYWNoZXIgY2FuIHJlbmFtZSBpdCkgcGx1cyBhXG4vLyBsaXN0IG9mIGBpdGVtc2AsIGVhY2ggYSByaWNoIGlubGluZSBydW4gKHRleHQgKyBpbmxpbmUgbWF0aCArIG1hcmtzKSBcdTIwMTQgdGhlXG4vLyBzYW1lIGFscGhhYmV0IHBhcmFncmFwaHMgdXNlLiBJdGVtcyBtYXAgMToxIHRvIGVkaXRhYmxlIHBhcmFncmFwaHMgaW4gdGhlXG4vLyBlZGl0b3IgTm9kZVZpZXc7IHRoZSByZW5kZXJlciBlbWl0cyB0aGVtIGFzIGEgPHVsPi5cbi8vXG4vLyBgaXRlbXNgIG1heSBiZSBlbXB0eTogdGhlIGVkaXRvcidzIGNvbnRlbnQgc3BlYyBrZWVwcyBhdCBsZWFzdCBvbmUgcGFyYWdyYXBoXG4vLyBsaXZlLCBidXQgYSBzZXJpYWxpemVkIHJvdW5kLXRyaXAgY2FuIGxlZ2l0aW1hdGVseSBwcm9kdWNlIGFuIGVtcHR5IGxpc3Rcbi8vIChlLmcuIGV2ZXJ5IGl0ZW0gY2xlYXJlZCksIGFuZCB0aGF0IG11c3Qgbm90IGZhaWwgcHVibGlzaCB2YWxpZGF0aW9uLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnbGVhcm5pbmdfb2JqZWN0aXZlcycpLFxuICB0aXRsZTogei5zdHJpbmcoKSxcbiAgaXRlbXM6IHouYXJyYXkoei5hcnJheShJbmxpbmVOb2RlKSksXG59KTtcbmV4cG9ydCB0eXBlIExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrID0gei5pbmZlcjx0eXBlb2YgTGVhcm5pbmdPYmplY3RpdmVzQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgUGFyYWdyYXBoQmxvY2sgfSBmcm9tICcuL3BhcmFncmFwaC5qcyc7XG5pbXBvcnQgeyBIZWFkaW5nQmxvY2sgfSBmcm9tICcuL2hlYWRpbmcuanMnO1xuaW1wb3J0IHsgTWF0aEJsb2NrIH0gZnJvbSAnLi9tYXRoLWJsb2NrLmpzJztcbmltcG9ydCB7IEltYWdlQmxvY2sgfSBmcm9tICcuL2ltYWdlLmpzJztcbmltcG9ydCB7IEJ1bGxldExpc3RCbG9jaywgT3JkZXJlZExpc3RCbG9jayB9IGZyb20gJy4vbGlzdC5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBXb3JrZWRFeGFtcGxlQmxvY2sgXHUyMDE0IGEgdGl0bGVkLCBib3hlZCBmdWxseS13b3JrZWQgZXhhbXBsZSB0byBzdHVkeS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIHB1cmUgQ09OVEVOVCBibG9jayAoZGF0YS1ibG9jay1jYXRlZ29yeT1cImNvbnRlbnRcIik6IG5vbi1pbnRlcmFjdGl2ZSxcbi8vIG5vbi1udW1iZXJlZCwgbm8gcnVudGltZSB3aXJpbmcsIG5vIHN1Ym1pc3Npb24gd2lyZSBpbXBhY3QuIERyYXdzIG9uXG4vLyBTd2VsbGVyJ3MgY29nbml0aXZlLWxvYWQgdGhlb3J5IFx1MjAxNCBhIHdvcmtlZCBleGFtcGxlIGEgc3R1ZGVudCByZWFkcyBiZWZvcmVcbi8vIGF0dGVtcHRpbmcgdGhlIGFuYWxvZ291cyBwcm9ibGVtLlxuLy9cbi8vIFVubGlrZSBhIGNhbGxvdXQgKGlubGluZS1vbmx5IGJvZHkpLCBhIHdvcmtlZCBleGFtcGxlIGhvbGRzIE5FU1RFRCBCTE9DS1xuLy8gY29udGVudCBzbyBhIG11bHRpLXN0ZXAsIG1hdGgtaGVhdnkgc29sdXRpb24gcmVuZGVycyBwcm9wZXJseTogcGFyYWdyYXBocyxcbi8vIGJsb2NrIG1hdGgsIGxpc3RzLCBhbmQgaW1hZ2VzLiBUaGUgY2hpbGQgdW5pb24gaXMgZGVsaWJlcmF0ZWx5IGEgY3VyYXRlZFxuLy8gc3Vic2V0IG9mIHRoZSBCbG9jayB1bmlvbiBcdTIwMTQgbGVhZiBDT05URU5UIGJsb2NrcyBvbmx5LiBJdCBleGNsdWRlczpcbi8vICAgLSBxdWVzdGlvbiBibG9ja3MgKGEgd29ya2VkIGV4YW1wbGUgaXMgY29udGVudCwgbmV2ZXIgc2NvcmVkKSxcbi8vICAgLSBjb2x1bW5zIGFuZCB3b3JrZWRfZXhhbXBsZSBpdHNlbGYgKHNvIG5lc3RpbmcgdGVybWluYXRlcyBcdTIwMTQgbm8gcmVjdXJzaW9uLFxuLy8gICAgIHRoZSBzYW1lIGRpc2NpcGxpbmUgYXMgQ29sdW1uQ2VsbEJsb2NrIGZvcmJpZGRpbmcgY29sdW1ucy1pbi1jb2x1bW5zKS5cbi8vIFRoaXMgYWxzbyBrZWVwcyB0aGUgZGFzaGJvYXJkIGluZGV4IHVudG91Y2hlZDogYSB3b3JrZWQgZXhhbXBsZSBjYW4gbmV2ZXJcbi8vIGNvbnRhaW4gYSBxdWVzdGlvbiwgc28gYnVpbGRBY3Rpdml0eUluZGV4IG5ldmVyIG5lZWRzIHRvIHJlY3Vyc2UgaW50byBpdC5cbi8vXG4vLyBUaGUgc3Vic2V0IG1hdGNoZXMgdGhlIGVkaXRvci1tYXBwYWJsZSBjb250ZW50IG5vZGVzIDE6MSAoV29ya2VkRXhhbXBsZS50cydzXG4vLyBjb250ZW50IGV4cHJlc3Npb24pLCBzbyBzZXJpYWxpemUgcm91bmQtdHJpcHMgd2l0aG91dCBzaWxlbnRseSBkcm9wcGluZyBhXG4vLyBjaGlsZC4gYGNvbnRlbnRgIG1heSBiZSBlbXB0eSBmb3IgdGhlIHNhbWUgcmVhc29uIExlYXJuaW5nT2JqZWN0aXZlcy5pdGVtc1xuLy8gbWF5IGJlIFx1MjAxNCBhbiBhbGwtdW5tYXBwYWJsZSByb3VuZCB0cmlwIChlLmcuIGEgc2luZ2xlIGVtcHR5IGltYWdlKSBtdXN0IG5vdFxuLy8gZmFpbCBwdWJsaXNoIHZhbGlkYXRpb24uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgY29uc3QgV29ya2VkRXhhbXBsZUNoaWxkID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFBhcmFncmFwaEJsb2NrLFxuICBIZWFkaW5nQmxvY2ssXG4gIE1hdGhCbG9jayxcbiAgSW1hZ2VCbG9jayxcbiAgQnVsbGV0TGlzdEJsb2NrLFxuICBPcmRlcmVkTGlzdEJsb2NrLFxuXSk7XG5leHBvcnQgdHlwZSBXb3JrZWRFeGFtcGxlQ2hpbGQgPSB6LmluZmVyPHR5cGVvZiBXb3JrZWRFeGFtcGxlQ2hpbGQ+O1xuXG5leHBvcnQgY29uc3QgV29ya2VkRXhhbXBsZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnd29ya2VkX2V4YW1wbGUnKSxcbiAgdGl0bGU6IHouc3RyaW5nKCksXG4gIGNvbnRlbnQ6IHouYXJyYXkoV29ya2VkRXhhbXBsZUNoaWxkKSxcbn0pO1xuZXhwb3J0IHR5cGUgV29ya2VkRXhhbXBsZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgV29ya2VkRXhhbXBsZUJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IFBhcmFncmFwaEJsb2NrIH0gZnJvbSAnLi9wYXJhZ3JhcGguanMnO1xuaW1wb3J0IHsgSGVhZGluZ0Jsb2NrIH0gZnJvbSAnLi9oZWFkaW5nLmpzJztcbmltcG9ydCB7IE1hdGhCbG9jayB9IGZyb20gJy4vbWF0aC1ibG9jay5qcyc7XG5pbXBvcnQgeyBJbWFnZUJsb2NrIH0gZnJvbSAnLi9pbWFnZS5qcyc7XG5pbXBvcnQgeyBCdWxsZXRMaXN0QmxvY2ssIE9yZGVyZWRMaXN0QmxvY2sgfSBmcm9tICcuL2xpc3QuanMnO1xuaW1wb3J0IHsgRmlsbEluQmxhbmtCbG9jayB9IGZyb20gJy4vZmlsbC1pbi1ibGFuay5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrIFx1MjAxNCBhIHNjYWZmb2xkZWQgKFwiZmFkZWRcIikgd29ya2VkIGV4YW1wbGUuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGludGVyYWN0aXZlIHNpYmxpbmcgb2Ygd29ya2VkX2V4YW1wbGUgKFJlbmtsL0F0a2luc29uIGNvbXBsZXRpb25cbi8vIHByb2JsZW1zKTogZWFybHkgc3RlcHMgYXJlIGZ1bGx5IHNob3duLCBsYXRlciBzdGVwcyBhcmUgRkFERUQgXHUyMDE0IHRoZSBzdHVkZW50XG4vLyBmaWxscyB0aGVtIGluLiBTdHJ1Y3R1cmFsbHkgaXQncyBhIHdvcmtlZF9leGFtcGxlIGZyYW1lIHdob3NlIGNoaWxkIHVuaW9uXG4vLyBBTFNPIGFkbWl0cyBmaWxsX2luX2JsYW5rIGJsb2NrczogYSBzaG93biBzdGVwIGlzIGEgcGFyYWdyYXBoIC8gYmxvY2sgbWF0aCAvXG4vLyBsaXN0IC8gaW1hZ2U7IGEgZmFkZWQgc3RlcCBpcyBhIGZpbGxfaW5fYmxhbmsgYmxvY2sgY2FycnlpbmcgdGhlIGJsYW5rcy5cbi8vXG4vLyBSZXVzZSBvdmVyIHJlaW52ZW50aW9uIChkZWNpZGVkIGF0IGRlc2lnbiwgMjAyNi0wNy0xMik6XG4vLyAgIC0gVGhlIGZhZGVkIHN0ZXBzIEFSRSBmaWxsX2luX2JsYW5rIGJsb2Nrcywgc28gdGhlIHJ1bnRpbWUgc2NvcmVzIHRoZW0gd2l0aFxuLy8gICAgIFpFUk8gbmV3IHJ1bnRpbWUgY29kZSBcdTIwMTQgaW5pdC50cyBhbHJlYWR5IHNjYW5zIGVhY2ggLmFjdGl2aXR5LXNlY3Rpb24gZm9yXG4vLyAgICAgYFtkYXRhLWJsb2NrLXR5cGU9XCJmaWxsX2luX2JsYW5rXCJdYCBhbmQgZmluZHMgTkVTVEVEIG9uZXMuIFRoZXkgcmlkZSB0aGVcbi8vICAgICBleGlzdGluZyBCbGFua1Jlc3BvbnNlIG1hcCwgc28gdGhlcmUgaXMgTk8gc3VibWlzc2lvbiB3aXJlL3N0b3JhZ2UgYnVtcC5cbi8vICAgLSBTY29yaW5nIHJpZGVzIHRoZSBjaGlsZCBibGFua3M7IHRoaXMgZnJhbWUgcmVhZHMgbm8gdHlwZS1zcGVjaWZpY1xuLy8gICAgIGF0dHJpYnV0ZXMgaXRzZWxmIFx1MjE5MiBpdCBpcyBhIENPTlRBSU5FUiAobGlrZSBgcHJvYmxlbWApLCBub3QgSU5URVJBQ1RJVkUuXG4vLyAgIC0gTnVtYmVyaW5nIChyZXZpc2VkIDIwMjYtMDctMTMpOiB0aGUgV0hPTEUgYm94IGlzIG9uZSBudW1iZXJlZCBwcm9ibGVtIFx1MjAxNFxuLy8gICAgIGl0cyBudW1iZXIgbGVhZHMgdGhlIHRpdGxlLCBhbmQgdGhlIGZhZGVkIGZpbGxfaW5fYmxhbmsgc3RlcHMgYXJlIGxldHRlcmVkXG4vLyAgICAgKGEpLyhiKVx1MjAyNiBMT0NBTExZIChzaG93U3RlcExhYmVscyB0b2dnbGVzIHRoZW0gb2ZmKSwgc28gdGhleSBubyBsb25nZXJcbi8vICAgICBjb25zdW1lIHdvcmtzaGVldCBwcm9ibGVtIG51bWJlcnMuIFNlZSByZW5kZXJGYWRlZFdvcmtlZEV4YW1wbGUgYW5kIHRoZVxuLy8gICAgIGVkaXRvcidzIHByb2JsZW1OdW1iZXJBdCAod2hpY2ggdHJlYXRzIHRoZSBib3ggYXMgYXRvbWljKS4gVGhpcyByZXZlcnNlZFxuLy8gICAgIHRoZSBvcmlnaW5hbCBcInN0ZXBzIG51bWJlciBhcyBvcmRpbmFyeSBwcm9ibGVtc1wiIGNob2ljZSwgd2hpY2ggd2FzdGVkXG4vLyAgICAgd3JpdGluZy9wcmludCB3aWR0aCBhbmQgcG9sbHV0ZWQgdGhlIHdvcmtzaGVldCdzIG51bWJlcmluZy5cbi8vXG4vLyBUaGUgY2hpbGQgdW5pb24gc3RpbGwgZXhjbHVkZXMgcXVlc3Rpb25zIE9USEVSIHRoYW4gZmlsbF9pbl9ibGFuaywgcGx1c1xuLy8gY29sdW1ucyAvIHdvcmtlZF9leGFtcGxlIC8gZmFkZWRfd29ya2VkX2V4YW1wbGUgaXRzZWxmIFx1MjAxNCBzbyBuZXN0aW5nXG4vLyB0ZXJtaW5hdGVzIGFuZCB0aGUgZGFzaGJvYXJkIGluZGV4IHJlY3Vyc2VzIG9ubHkgb25lIHByZWRpY3RhYmxlIGxldmVsLlxuLy8gYGNvbnRlbnRgIG1heSBiZSBlbXB0eSBmb3IgdGhlIHNhbWUgcm91bmQtdHJpcC1zYWZldHkgcmVhc29uIGFzXG4vLyB3b3JrZWRfZXhhbXBsZS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBjb25zdCBGYWRlZFdvcmtlZEV4YW1wbGVDaGlsZCA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBQYXJhZ3JhcGhCbG9jayxcbiAgSGVhZGluZ0Jsb2NrLFxuICBNYXRoQmxvY2ssXG4gIEltYWdlQmxvY2ssXG4gIEJ1bGxldExpc3RCbG9jayxcbiAgT3JkZXJlZExpc3RCbG9jayxcbiAgRmlsbEluQmxhbmtCbG9jayxcbl0pO1xuZXhwb3J0IHR5cGUgRmFkZWRXb3JrZWRFeGFtcGxlQ2hpbGQgPSB6LmluZmVyPHR5cGVvZiBGYWRlZFdvcmtlZEV4YW1wbGVDaGlsZD47XG5cbmV4cG9ydCBjb25zdCBGYWRlZFdvcmtlZEV4YW1wbGVCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2ZhZGVkX3dvcmtlZF9leGFtcGxlJyksXG4gIHRpdGxlOiB6LnN0cmluZygpLFxuICBjb250ZW50OiB6LmFycmF5KEZhZGVkV29ya2VkRXhhbXBsZUNoaWxkKSxcbiAgLy8gVGhlIHdob2xlIGJveCBpcyBPTkUgbnVtYmVyZWQgcHJvYmxlbSAoaXRzIG51bWJlciBsZWFkcyB0aGUgdGl0bGUpOyB0aGVcbiAgLy8gZmFkZWQgZmlsbF9pbl9ibGFuayBzdGVwcyBhcmUgbGV0dGVyZWQgKGEpLCAoYilcdTIwMjYgV0lUSElOIHRoZSBib3ggaW5zdGVhZCBvZlxuICAvLyBjb25zdW1pbmcgd29ya3NoZWV0IHByb2JsZW0gbnVtYmVycy4gc2hvd1N0ZXBMYWJlbHMgdG9nZ2xlcyB0aG9zZSBsZXR0ZXJzXG4gIC8vIG9mZiBwZXIgYm94IChiYXJlIGJsYW5rcywgbm8gZ3V0dGVyKSBmb3IgdGVhY2hlcnMgd2hvIHdhbnQgbWF4aW11bSB3cml0aW5nXG4gIC8vIHJvb20uIERlZmF1bHRlZCBzbyBwcmUtZXhpc3RpbmcgZG9jdW1lbnRzIChubyBmaWVsZCkgcmVuZGVyIGxhYmVsbGVkLlxuICBzaG93U3RlcExhYmVsczogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgLy8gVGhlIGJveCdzIE9XTiBwYWdlIGxhYmVsICh2aWV3ZXItbnVtYmVyaW5nIE42KS4gSXQgaGFzIGFsd2F5cyBiZWVuIG9uZVxuICAvLyBudW1iZXJlZCBwcm9ibGVtOyB0aGlzIGlzIHdoYXQgbGV0cyBhIHRlYWNoZXIgcmVsYWJlbCBpdCAoXCJXYXJtLXVwXCIpIG9yXG4gIC8vIHVubnVtYmVyIGl0LCB0aGUgc2FtZSB2b2NhYnVsYXJ5IGV2ZXJ5IG90aGVyIG51bWJlcmVkIHR5cGUgYWxyZWFkeSBoYWQuXG4gIC8vIERpc3RpbmN0IGZyb20gc2hvd1N0ZXBMYWJlbHMsIHdoaWNoIGdvdmVybnMgdGhlIChhKS8oYikgbGV0dGVycyBJTlNJREUgdGhlXG4gIC8vIGJveCBcdTIwMTQgdGhhdCBvbmUgaXMgYWJvdXQgdGhlIHN0ZXBzLCB0aGlzIG9uZSBpcyBhYm91dCB0aGUgYm94LlxuICAuLi5sYWJlbEZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgRmFkZWRXb3JrZWRFeGFtcGxlQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBGYWRlZFdvcmtlZEV4YW1wbGVCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFNlbGZFeHBsYW5hdGlvbkJsb2NrIFx1MjAxNCBhbiB1bmdyYWRlZCBmcmVlLXRleHQgcmVmbGVjdGlvbiBwcm9tcHQuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gTWV0YWNvZ25pdGl2ZSBzZWxmLWV4cGxhbmF0aW9uIChDaGkgZXQgYWwuKTogdGhlIHN0dWRlbnQgd3JpdGVzIFdIWSwgaW4gdGhlaXJcbi8vIG93biB3b3Jkcy4gRGVsaWJlcmF0ZWx5IFVOR1JBREVEIChhdXRob3IgZGVjaXNpb24sIDIwMjYtMDctMTIpIFx1MjAxNCB0aGUgcnVudGltZVxuLy8gY2FwdHVyZXMgdGhlIHRleHQgYW5kIHRoZSB0ZWFjaGVyIGRhc2hib2FyZCBzaG93cyBpdCByYXc7IHRoZXJlIGlzIG5vIGFuc3dlclxuLy8ga2V5LCBubyBjb3JyZWN0L2luY29ycmVjdCwgYW5kIGl0IG5ldmVyIGNvbnRyaWJ1dGVzIHRvIHRoZSBzY29yZS4gVGhpcyBrZWVwc1xuLy8gaXQgY2xlYXIgb2YgUGhhc2UgMi42IHJ1YnJpYyBncmFkaW5nLlxuLy9cbi8vIEl0IGlzIHRoZSBGSVJTVCBmcmVlLXRleHQgcmVzcG9uc2UgdHlwZSwgc28gaXQgaW50cm9kdWNlcyB0aGUgYGZyZWVSZXNwb25zZXNgXG4vLyBtYXAgb24gU3VibWlzc2lvblJlc3BvbnNlcyAod2lyZSB2OCBcdTIxOTIgdjkpIFx1MjAxNCB0aGUgbWFwIG5hbWUgdGhlIHNjaGVtYSByZXNlcnZlZFxuLy8gZm9yIGV4YWN0bHkgdGhpcyBzaGFwZS4gUGhhc2UgMi42IHNob3J0X2Fuc3dlciAvIGVzc2F5IHJldXNlIHRoZSBzYW1lIG1hcCAoYVxuLy8gc3RyaW5nIHBlciBibG9jaykgd2l0aCBubyBmdXJ0aGVyIHdpcmUgYnVtcDsgZ3JhZGluZywgd2hlbiBpdCBsYW5kcywgbGl2ZXMgaW5cbi8vIGEgc2VwYXJhdGUgdGFibGUsIG5vdCBpbiB0aGUgcmVzcG9uc2Ugc2hhcGUuXG4vL1xuLy8gU2hhcGU6IGEgYHByb21wdGAgKHJpY2ggaW5saW5lIFx1MjAxNCB0ZXh0ICsgaW5saW5lIG1hdGggKyBtYXJrcywgbGlrZSBldmVyeSBvdGhlclxuLy8gcXVlc3Rpb24gcHJvbXB0KSBwbHVzIGFuIG9wdGlvbmFsIGBwbGFjZWhvbGRlcmAgKGEgc2VudGVuY2Utc3RhcnRlciAvIGhpbnRcbi8vIHNob3duIGluIHRoZSBlbXB0eSB0ZXh0YXJlYSkuIE5vIGFuc3dlciBrZXkuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgY29uc3QgU2VsZkV4cGxhbmF0aW9uQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdzZWxmX2V4cGxhbmF0aW9uJyksXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgcGxhY2Vob2xkZXI6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgU2VsZkV4cGxhbmF0aW9uQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBTZWxmRXhwbGFuYXRpb25CbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gZnJlZS1yZXNwb25zZS50cyBcdTIwMTQgc2hvcnRfYW5zd2VyICsgZXNzYXkgKG1hbnVhbGx5LWdyYWRlZCBmcmVlIHRleHQpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIFBoYXNlIDIuNiBncmFkZWQgZnJlZS10ZXh0IHNpYmxpbmdzIG9mIHNlbGZfZXhwbGFuYXRpb24uIEFsbCB0aHJlZSB3cml0ZVxuLy8gdGhlaXIgc3R1ZGVudCB0ZXh0IGludG8gdGhlIFNBTUUgYGZyZWVSZXNwb25zZXNgIG1hcCAod2lyZSB2OSkgXHUyMDE0IHRoZSByZXNwb25zZVxuLy8gc2hhcGUgaXMgaWRlbnRpY2FsIChhIHN0cmluZyk7IHdoYXQgZGlmZmVycyBpcyBpbnRlbnQgKyBncmFkaW5nOlxuLy8gICAtIHNlbGZfZXhwbGFuYXRpb24gXHUyMDE0IHVuZ3JhZGVkIHJlZmxlY3Rpb24gKGFscmVhZHkgc2hpcHBlZCkuXG4vLyAgIC0gc2hvcnRfYW5zd2VyICAgICBcdTIwMTQgYSBicmllZiBncmFkZWQgcmVzcG9uc2UgKG1hbnVhbCBydWJyaWMgZ3JhZGluZywgMi42KS5cbi8vICAgLSBlc3NheSAgICAgICAgICAgIFx1MjAxNCBhIGxvbmcgZ3JhZGVkIHJlc3BvbnNlOyBhZGRzIG9wdGlvbmFsIHdvcmQtY291bnRcbi8vICAgICAgICAgICAgICAgICAgICAgICAgZ3VpZGFuY2UgKGEgdGFyZ2V0IHJhbmdlIHNob3duIGFzIGEgbGl2ZSBjb3VudGVyKS5cbi8vIEdyYWRpbmcgaXRzZWxmIGxpdmVzIGluIGEgc2VwYXJhdGUgYGdyYWRlc2AgdGFibGUgKFBoYXNlIDIuNiBsYXRlciBzbGljZXMpLFxuLy8gbmV2ZXIgaW4gdGhlIHN1Ym1pc3Npb24ganNvbmIgXHUyMDE0IGdyYWRlcyBhcmUgbXV0YWJsZSwgc3VibWlzc2lvbnMgYXJlIG5vdC4gVGhlc2Vcbi8vIGJsb2NrcyBhcmUgbmV2ZXIgQVVUTy1zY29yZWQgYnkgdGhlIHJ1bnRpbWUuXG4vL1xuLy8gXHUyNkEwIEFNRU5ERUQgMjAyNi0wOC0yMCAoYW5zd2VyLWtleSBzbGljZSwgcnVsaW5nIEUyIFx1MjAxNCB0aGlzIGNvbW1lbnQgaXMgYW1lbmRlZFxuLy8gaW4gdGhlIGNvbW1pdCB0aGF0IGNoYW5nZXMgd2hhdCBpdCBkZXNjcmliZXMsIFA1KS4gVGhlIGxpbmUgYWJvdmUgdXNlZCB0b1xuLy8gcmVhZCBcImNhcnJ5IE5PIGFuc3dlciBrZXlcIi4gVGhleSBub3cgTUFZIGNhcnJ5IG9uZSwgYW5kIHRoZSBkaXN0aW5jdGlvbiB0aGF0XG4vLyByZXBsYWNlZCBpdCBpcyB0aGUgbG9hZC1iZWFyaW5nIG9uZTpcbi8vXG4vLyAgIGFuc3dlciAgIFx1MjAxNCB0aGUgY2Fub25pY2FsIGFuc3dlciAvIG1hcmtpbmcgZ3VpZGUuIFRlYWNoZXItb25seSBtYXRlcmlhbCwgb25cbi8vICAgICAgICAgICAgICBFVkVSWSBjaGFubmVsOiB0aGUgcmVnaXN0cnkgc3RyaXBzIGl0IGZyb20gdGhlIHNlcnZlZCBkb2N1bWVudFxuLy8gICAgICAgICAgICAgIGFuZCBub3RoaW5nIGV2ZXIgcmV0dXJucyBpdCB0byBhIHN0dWRlbnQuIEl0IGV4aXN0cyBzbyB0aGVcbi8vICAgICAgICAgICAgICBwcmludGVkIGFuc3dlciBrZXkgaGFzIHNvbWV0aGluZyB0byBwcmludCAoYW5kIHNvIHRoZSBmdXR1cmVcbi8vICAgICAgICAgICAgICBzY2FuLWdyYWRpbmcgYXJjIGhhcyBhIGtleSB0byBncmFkZSBhIHBob3RvIGFnYWluc3QpLiBBIGJsb2NrXG4vLyAgICAgICAgICAgICAgdGhhdCBpcyBtYW51YWxseSBncmFkZWQgc3RpbGwgSEFTIGEgcmlnaHQgYW5zd2VyOyB3aGF0IGl0IGxhY2tzXG4vLyAgICAgICAgICAgICAgaXMgYSBtYWNoaW5lIHRoYXQgY2FuIHJlY29nbmlzZSBvbmUuXG4vLyAgIHNvbHV0aW9uIFx1MjAxNCB0aGUgcG9zdC1jaGVjayBleHBsYW5hdGlvbiwgaWRlbnRpY2FsIGluIGtpbmQgYW5kIGluIHJlbGVhc2Vcbi8vICAgICAgICAgICAgICBydWxlIHRvIGV2ZXJ5IG90aGVyIGJsb2NrJ3MgYHNvbHV0aW9uYDogc3RyaXBwZWQgZnJvbSB0aGUgcmVhZFxuLy8gICAgICAgICAgICAgIHBhdGgsIHJldHVybmVkIGJ5IHRoZSBjaGVjayByZXNwb25zZSBhZnRlciB0aGUgc2VjdGlvbiBpc1xuLy8gICAgICAgICAgICAgIGNoZWNrZWQgKHdhbGsudHMgY29sbGVjdHMgaXQgR0VORVJJQ0FMTFksIHNvIG5vIGdyYWRpbmctZW5naW5lXG4vLyAgICAgICAgICAgICAgY29kZSB3YXMgYWRkZWQgZm9yIHRoaXMpLCBhbmQgcmV2ZWFsZWQgYnkgdGhlIGNvbXBvbmVudC5cbi8vXG4vLyBCb3RoIGFyZSBJbmxpbmVOb2RlW10gXHUyMDE0IGEgd29ya2VkIGFuc3dlciB3YW50cyBmb3JtYXR0aW5nIGFuZCBpbmxpbmUgbWF0aCwgYW5kXG4vLyBhIG11bHRpLWxpbmUgb25lIGFycml2ZXMgZnJvbSB0aGUgaW1wb3J0ZXIgYXMgaGFyZCBicmVha3MuIEJvdGggYXJlIE9QVElPTkFMOlxuLy8gYW4gdW5hbnN3ZXJlZCBmcmVlLXJlc3BvbnNlIGJsb2NrIGlzIHN0aWxsIGEgdmFsaWQgYmxvY2ssIGFuZCB0aGUgYW5zd2VyIGtleVxuLy8gcHJpbnRzIFwibWFudWFsbHkgZ3JhZGVkIFx1MjAxNCBzZWUgcnVicmljXCIgZm9yIGl0ICh0aGUgZXh0cmFjdG9yJ3MgZmFsbGJhY2sgY2hhaW5cbi8vIGlzIGFuc3dlciBcdTIxOTIgc29sdXRpb24gXHUyMTkyIHRoYXQgcGhyYXNlOyBzZWUgdmlld2VyL3NyYy9hbnN3ZXIta2V5L2V4dHJhY3QudHMpLlxuLy9cbi8vIEU4J3MgY29udmVudGlvbiwgcmVjb3JkZWQgYmVjYXVzZSBpdCBpcyBOT1Qgc2NoZW1hOiBgYW5zd2VyYCBjYXJyaWVzIFdIQVQgaXNcbi8vIGNvcnJlY3Q7IGEgYHJ1YnJpY2AgY2FycmllcyBIT1cgTUFOWSBwb2ludHMgKHBlci1jcml0ZXJpb24gbWF4UG9pbnRzKSB3aGVuIGFcbi8vIHF1ZXN0aW9uIGlzIHdvcnRoIG1vcmUgdGhhbiBvbmU7IG5vIHJ1YnJpYyA9IGEgMS1wb2ludCBxdWVzdGlvbi4gVGhlcmUgaXNcbi8vIGRlbGliZXJhdGVseSBubyBwb2ludHMgZmllbGQgaGVyZSBcdTIwMTQgdGhlIGZ1bGwgbWFya2luZyBjb250cmFjdCBiZWxvbmdzIHRvXG4vLyBkb2NzL2Rlc2lnbi9waG90by1ncmFkaW5nLm1kJ3Mgb3duIGRlc2lnbiBwYXNzLlxuLy9cbi8vIHdvcmRDb3VudEhpbnQgKGVzc2F5IG9ubHkpOiBhbiBvcHRpb25hbCB7bWluPywgbWF4P30gdGFyZ2V0LiBUaGUgcmVuZGVyZXJcbi8vIHNob3dzIGEgbGl2ZSB3b3JkIGNvdW50ZXI7IHRoZSBjb3VudCBpdHNlbGYgaXMgY29tcHV0ZWQtb24tcmVhZCAobmV2ZXIgc3RvcmVkXG4vLyBpbiB0aGUgd2lyZSBcdTIwMTQgaXQncyBkZXJpdmFibGUgZnJvbSB0aGUgdGV4dCksIHNvIHRoaXMgaXMgZGlzcGxheSBndWlkYW5jZSBvbmx5LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gT25lIHJ1YnJpYyBjcml0ZXJpb246IGEgbGFiZWwgKFwiVGhlc2lzIGNsYXJpdHlcIiksIHRoZSBwb2ludHMgaXQncyB3b3J0aCwgYW5kXG4vLyBhbiBvcHRpb25hbCBkZXNjcmlwdGlvbiBvZiB3aGF0IGZ1bGwgY3JlZGl0IGxvb2tzIGxpa2UuIExldmVsZWQgZGVzY3JpcHRvclxuLy8gZ3JpZHMgKDQvMy8yLzEgY29sdW1ucykgYXJlIGEgZnV0dXJlIEFERElUSVZFIGV4dGVuc2lvbiBvZiB0aGlzIHNoYXBlLlxuZXhwb3J0IGNvbnN0IFJ1YnJpY0NyaXRlcmlvbiA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICBsYWJlbDogei5zdHJpbmcoKS5taW4oMSksXG4gIG1heFBvaW50czogei5udW1iZXIoKS5wb3NpdGl2ZSgpLmZpbml0ZSgpLFxuICBkZXNjcmlwdGlvbjogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBSdWJyaWNDcml0ZXJpb24gPSB6LmluZmVyPHR5cGVvZiBSdWJyaWNDcml0ZXJpb24+O1xuXG4vLyBBIGJsb2NrJ3MgZ3JhZGluZyBydWJyaWMuIExpdmVzIElOIHRoZSBkb2N1bWVudCAoYXV0aG9yIGRlY2lzaW9uIDIwMjYtMDctMTMsXG4vLyBkb2NzL2Rlc2lnbi9tYW51YWwtZ3JhZGluZy5tZCk6IHN1Ym1pc3Npb25zIHBpbiB0byBhY3Rpdml0eV92ZXJzaW9ucywgc28gdGhlXG4vLyBncmFkaW5nIFVJIHJlYWRzIHRoZSBleGFjdCBydWJyaWMgdGhlIHN0dWRlbnQgd2FzIGFzc2Vzc2VkIGFnYWluc3QgXHUyMDE0IHZlcnNpb25cbi8vIHBpbm5pbmcgSVMgdGhlIFwicnVicmljIGVkaXRzIGFwcGx5IHByb3NwZWN0aXZlbHlcIiBtZWNoYW5pc20uIFRoZSByZW5kZXJlclxuLy8gbmV2ZXIgZW1pdHMgaXQgKHRlYWNoZXItc2lkZSBkYXRhOyBzdGF5cyBvdXQgb2Ygc3R1ZGVudCBIVE1MKS4gR3JhZGVzXG4vLyB0aGVtc2VsdmVzIGFyZSBtdXRhYmxlIGFuZCBsaXZlIGluIHRoZSBgZ3JhZGVzYCBUQUJMRSwga2V5ZWQgYnlcbi8vIChzdWJtaXNzaW9uX2lkLCBibG9ja19pZCkgKyBjcml0ZXJpb24gaWQuXG5leHBvcnQgY29uc3QgUnVicmljID0gei5vYmplY3Qoe1xuICBjcml0ZXJpYTogei5hcnJheShSdWJyaWNDcml0ZXJpb24pLm1pbigxKSxcbn0pO1xuZXhwb3J0IHR5cGUgUnVicmljID0gei5pbmZlcjx0eXBlb2YgUnVicmljPjtcblxuLy8gVGhlIHR3byB0ZWFjaGVyLW9ubHkgYW5zd2VyIGZpZWxkcyBib3RoIGJsb2NrcyBjYXJyeSAocnVsaW5nIEUyICsgRTQnc1xuLy8gcGFyaXR5OiBvbmUgc2NoZW1hIHJvdW5kIGZvciB0aGUgcGFpciwgbmV2ZXIgdHdvKS4gRGVjbGFyZWQgb25jZSBoZXJlIHNvIHRoZVxuLy8gdHdvIGJsb2NrIHNoYXBlcyBjYW5ub3QgZHJpZnQgYXBhcnQgZmllbGQtYnktZmllbGQuXG4vL1xuLy8gXHUyNkEwIEJPVEggQkxPQ0tTIEFMU08gQ0FSUlkgYGxhYmVsRmllbGRzYCBzaW5jZSB0aGUgdmlld2VyLW51bWJlcmluZyBzbGljZVxuLy8gKHJ1bGluZyBONikuIFJ1bGluZyBFNyBtYWRlIHRoZW0gcGFnZS1udW1iZXJlZCwgYW5kIHVudGlsIE42IHRoZXkgd2VyZSB0aGVcbi8vIG9ubHkgbnVtYmVyZWQgdHlwZXMgd2l0aCBubyB3YXkgdG8gb3B0IG91dCBcdTIwMTQgYSB0ZWFjaGVyIGNvdWxkIG5vdCBtYXJrIGFcbi8vIHJlZmxlY3Rpb24tc3R5bGUgc2hvcnQgYW5zd2VyIGFzIHVubnVtYmVyZWQgZXZlbiB0aG91Z2ggdGhlIHNjaGVtYSBoYXMgaGFkXG4vLyB0aGF0IHZvY2FidWxhcnkgKGF1dG8gLyBjdXN0b20gLyBub25lKSBzaW5jZSB0aGUgbnVtYmVyaW5nLWxhYmVsIGRlY291cGxlLlxuLy8gVGhlIGZpZWxkIGlzIE5PVCBlbm91Z2ggb24gaXRzIG93bjogYGxhYmVsYCBvbmx5IHN1cnZpdmVzIGEgc2F2ZSBpZiB0aGUgdHlwZVxuLy8gaXMgYWxzbyBpbiBzZXJpYWxpemUudHMncyBMQUJFTEVEX0JMT0NLX1RZUEVTLCBhbmQgb25seSByZWFjaGVzIGFuIGF1dGhvciBpZlxuLy8gYmxvY2tDb250cm9scy50cyBhdHRhY2hlcyBgbnVtYmVyaW5nR3JvdXBgLiBTZWUgdGhlIHBsYW4ncyBmb3VyLWxpbmsgY2hhaW5cbi8vIChkb2NzL2Rlc2lnbi92aWV3ZXItbnVtYmVyaW5nLm1kLCBEOCkgXHUyMDE0IGxpbmsgMSBpcyBoZXJlLlxuY29uc3QgYW5zd2VyRmllbGRzID0ge1xuICAvKiogVGhlIGNhbm9uaWNhbCBhbnN3ZXIgLyBtYXJraW5nIGd1aWRlLiBUZWFjaGVyLW9ubHkgb24gZXZlcnkgY2hhbm5lbC4gKi9cbiAgYW5zd2VyOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIC8qKiBUaGUgcG9zdC1jaGVjayBleHBsYW5hdGlvbiBcdTIwMTQgc2FtZSByZWxlYXNlIHJ1bGUgYXMgZXZlcnkgb3RoZXIgYHNvbHV0aW9uYC4gKi9cbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbn07XG5cbmV4cG9ydCBjb25zdCBTaG9ydEFuc3dlckJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnc2hvcnRfYW5zd2VyJyksXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgcGxhY2Vob2xkZXI6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgcnVicmljOiBSdWJyaWMub3B0aW9uYWwoKSxcbiAgLi4uYW5zd2VyRmllbGRzLFxuICAuLi5sYWJlbEZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgU2hvcnRBbnN3ZXJCbG9jayA9IHouaW5mZXI8dHlwZW9mIFNob3J0QW5zd2VyQmxvY2s+O1xuXG5leHBvcnQgY29uc3QgV29yZENvdW50SGludCA9IHpcbiAgLm9iamVjdCh7XG4gICAgbWluOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgICBtYXg6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICB9KVxuICAvLyBHdWFyZCBhZ2FpbnN0IGFuIGludmVydGVkIHJhbmdlIChtaW4gPiBtYXgpIFx1MjAxNCBhIG5vbnNlbnNlIGhpbnQgdGhlIGVkaXRvclxuICAvLyBzaG91bGRuJ3QgYmUgYWJsZSB0byBwcm9kdWNlLCBidXQgdmFsaWRhdGlvbiBpcyB0aGUgc2NoZW1hJ3Mgam9iLlxuICAucmVmaW5lKFxuICAgIChoKSA9PiBoLm1pbiA9PT0gdW5kZWZpbmVkIHx8IGgubWF4ID09PSB1bmRlZmluZWQgfHwgaC5taW4gPD0gaC5tYXgsXG4gICAgeyBtZXNzYWdlOiAnd29yZENvdW50SGludC5taW4gbXVzdCBiZSBcdTIyNjQgbWF4JyB9LFxuICApO1xuZXhwb3J0IHR5cGUgV29yZENvdW50SGludCA9IHouaW5mZXI8dHlwZW9mIFdvcmRDb3VudEhpbnQ+O1xuXG5leHBvcnQgY29uc3QgRXNzYXlCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2Vzc2F5JyksXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgcGxhY2Vob2xkZXI6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgd29yZENvdW50SGludDogV29yZENvdW50SGludC5vcHRpb25hbCgpLFxuICBydWJyaWM6IFJ1YnJpYy5vcHRpb25hbCgpLFxuICAuLi5hbnN3ZXJGaWVsZHMsXG4gIC4uLmxhYmVsRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBFc3NheUJsb2NrID0gei5pbmZlcjx0eXBlb2YgRXNzYXlCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBGaWxsSW5CbGFua0lubGluZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFRhYmxlQmxvY2sgXHUyMDE0IGEgcmVhbCB0YWJsZSwgd2hvc2UgY2VsbHMgY2FuIGhvbGQgYmxhbmtzLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFBsYW4gKyBydWxpbmdzOiBkb2NzL2Rlc2lnbi90YWJsZS1ibG9jay5tZCAoZW5nIHJldmlldyAyMDI2LTA4LTIxKS5cbi8vXG4vLyBXSFkgVEhJUyBFWElTVFMgQVQgQUxMLiBUaGUgYGBgY29sdW1ucyB3b3JrYXJvdW5kIFBSSU5UUyBzb21ldGhpbmcgdGhhdCBsb29rc1xuLy8gbGlrZSBhIHRhYmxlIGFuZCBpcyBub3Qgb25lOiB0aGUgZGl2aWRlciBydWxlIGlzIGRyYXduIHBlciBDT0xVTU4sXG4vLyBpbmRlcGVuZGVudGx5LCBzbyByb3dzIGxpbmUgdXAgb25seSB3aGlsZSBldmVyeSBjZWxsIGhhcHBlbnMgdG8gYmUgb25lIGxpbmVcbi8vIHRhbGwuIEdpdmUgb25lIGNlbGwgYSBsYWJlbCB0aGF0IHdyYXBzIGFuZCB0aGUgdHdvIGNvbHVtbnMnIGRpdmlkZXJzIGRlc3luYyxcbi8vIGJlY2F1c2UgdGhlcmUgaXMgbm8gcm93IGNvbmNlcHQgaW4gdGhlIERPTSBob2xkaW5nIGEgcm93IHRvZ2V0aGVyLlxuLy9cbi8vIFx1MjZBMFx1MjZBMCBUSEUgT05FIFJVTEUgVEhBVCBNQUtFUyBUSEUgV0hPTEUgREVTSUdOIFdPUks6IGBUYWJsZVJvd2AgYW5kIGBUYWJsZUNlbGxgXG4vLyBDQVJSWSBOTyBgdHlwZWAgRklFTEQsIEFORCBNVVNUIE5FVkVSIEdBSU4gT05FLlxuLy9cbi8vIEZvdXIgc2VwYXJhdGUgd2Fsa3MgZmluZCBibGFua3MgYW5kIG1hdGggZ2FwcyBzdHJ1Y3R1cmFsbHksIGF0IGFueSBkZXB0aCBcdTIwMTRcbi8vIHRoZSBzYW5pdGl6ZXIncyBpbi1iYW5kIHN0cmlwLCB0aGUgY2xpZW50J3MgY2hlY2stcGF5bG9hZCBpbmRleFxuLy8gKGNvbnRhaW5lci9ibG9ja0luZGV4LnRzKSwgdGhlIHNlcnZlcidzIGdyYWRpbmcga2V5c1xuLy8gKHNlcnZlci9ncmFkaW5nL3dhbGsudHMpLCBhbmQgdGhlIHRlYWNoZXIncyBhbnN3ZXIga2V5IChhbnN3ZXIta2V5L2V4dHJhY3QpLlxuLy8gVGhyZWUgb2YgdGhlbSBzdG9wIGRlc2NlbmRpbmcgYXQgYGxvb2tzTGlrZUJsb2NrQXJyYXlgLCB3aGljaCBmaXJlcyBvbiBhbnlcbi8vIGFycmF5IHdob3NlIGVsZW1lbnRzIEFMTCBjYXJyeSBib3RoIGEgc3RyaW5nIGBpZGAgYW5kIGEgc3RyaW5nIGB0eXBlYC4gUm93c1xuLy8gYW5kIGNlbGxzIGhhdmUgYW4gYGlkYCBhbmQgbm8gYHR5cGVgLCBzbyB0aG9zZSB3YWxrcyBkZXNjZW5kIGludG8gdGhlbSBhbmQgYVxuLy8gYmxhbmsgaW4gYSBjZWxsIGlzIGdyYWRlZCwgY2hlY2tlZCBhbmQga2V5ZWQgd2l0aCBaRVJPIG5ldyBjb2RlLlxuLy9cbi8vIEFkZCBgdHlwZTogJ3RhYmxlX3JvdydgIFx1MjAxNCB0aGUgc2hhcGUgYSBzY2hlbWEgYXV0aG9yIHJlYWNoZXMgZm9yIGJ5IHJlZmxleCBcdTIwMTRcbi8vIGFuZCB0aHJlZSBvZiB0aGUgZm91ciB3YWxrcyBza2lwIHRoZSBlbnRpcmUgdGFibGUuIFRoZSBzYW5pdGl6ZXIgZG9lcyBOT1Rcbi8vIHN0b3AgYXQgYmxvY2sgYXJyYXlzLCBzbyBub3RoaW5nIGxlYWtzOyB0aGUgYW5zd2VyIGlzIHNpbXBseSBuZXZlciBHUkFERUQuXG4vLyB3YWxrLnRzIGNhbGxzIHRoYXQgXCJ0aGUgd29yc3Qga2luZFwiIG9mIGZhaWx1cmU6IHN1Ym1pdHRlZCwgc3RvcmVkLCBuZXZlclxuLy8gc2NvcmVkLiBUaGUgZ3VhcmQgYWdhaW5zdCBpdCBpcyBib3VuZCB0byB3YWxrIE9VVFBVVCAoc2VlIHRoZSBxdWFydGV0IGluXG4vLyB2aWV3ZXIvdGVzdHMgYW5kIHNjaGVtYS90ZXN0cy90YWJsZS50ZXN0LnRzKSwgbmV2ZXIgdG8gdGhpcyBkZWNsYXJhdGlvbi5cbi8vXG4vLyBHUkFEQUJJTElUWSBJUyBERVJJVkVELCBOT1QgREVDTEFSRUQuIFRoZXJlIGlzIG5vIGBpbnRlcmFjdGl2ZWAgZmxhZzogYSB0YWJsZVxuLy8gaXMgYSBxdWVzdGlvbiBleGFjdGx5IHdoZW4gc29tZSBjZWxsIGhvbGRzIGEgYmxhbmsgKGBpc0dyYWRlYWJsZWAsIHRoZVxuLy8gbWF0aF9ibG9jayBwcmVjZWRlbnQpLiBBIGZsYWcgY2FuIGRyaWZ0IGZyb20gY29udGVudCBcdTIwMTQgZGVsZXRlIHRoZSBsYXN0IGJsYW5rXG4vLyBhbmQgYSBzdGFsZSBmbGFnIGxlYXZlcyBhIHBoYW50b20gbnVtYmVyZWQgcXVlc3Rpb24gaW4gdGhlIGNoZWNrIHBheWxvYWQuXG4vL1xuLy8gTlVNQkVSSU5HIGZvbGxvd3MgZmFkZWRfd29ya2VkX2V4YW1wbGU6IHRoZSB3aG9sZSB0YWJsZSBpcyBPTkUgbnVtYmVyZWRcbi8vIHByb2JsZW0sIGFuZCBpdHMgYmxhbmtzIGFyZSBsZXR0ZXJlZCAoYSksIChiKSBcdTIwMjYgaW4gUkVBRElORyBPUkRFUi4gVGhlIGxldHRlcnNcbi8vIGFyZSBkZXJpdmVkIGZyb20gcG9zaXRpb24gYXQgcmVuZGVyIHRpbWUgYW5kIG5ldmVyIHN0b3JlZCAoYHRhYmxlQmxhbmtJZHNgICtcbi8vIGBzdGVwTGV0dGVyYCksIHRoZSBzYW1lIHJ1bGUgZmlsbF9pbl9ibGFuaydzIHN1Yi1wYXJ0cyBhbHJlYWR5IGZvbGxvdy5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBQZXItY29sdW1uIHByaW50L3NjcmVlbiBhbGlnbm1lbnQsIHN0cmFpZ2h0IGZyb20gYSBtYXJrZG93biBkZWxpbWl0ZXIgcm93J3NcbiAqIGNvbG9ucyAoYHwtLS06fGAgXHUyMTkyIHJpZ2h0KS4gUmlnaHQtYWxpZ25lZCBudW1iZXIgY29sdW1ucyBhcmUgd2hhdCBtYWtlcyBhXG4gKiB0YWJsZSBvZiBmaWd1cmVzIHJlYWRhYmxlIG9uIHBhcGVyLCB3aGljaCBpcyB3aHkgdGhpcyBpcyBhdXRob3JlZCBkYXRhIGFuZFxuICogbm90IGEgc3R5bGVzaGVldCBkZWNpc2lvbi4gKi9cbmV4cG9ydCBjb25zdCBUYWJsZUNvbHVtbkFsaWduID0gei5lbnVtKFsnbGVmdCcsICdjZW50ZXInLCAncmlnaHQnXSk7XG5leHBvcnQgdHlwZSBUYWJsZUNvbHVtbkFsaWduID0gei5pbmZlcjx0eXBlb2YgVGFibGVDb2x1bW5BbGlnbj47XG5cbi8vIE5PIGB0eXBlYCBGSUVMRCBcdTIwMTQgc2VlIHRoZSBoZWFkZXIuIGBpZGAgaXMgZm9yIHN0YWJsZSBhZGRyZXNzaW5nIChSZWFjdCBrZXlzLFxuLy8gZWRpdG9yIGlkZW50aXR5KTsgaXQgaXMgTk9UIGEgcmVzcG9uc2Uga2V5LiBUaGUgcmVzcG9uc2Uga2V5cyBhcmUgdGhlIGJsYW5rXG4vLyBpZHMgSU5TSURFIGBjb250ZW50YCwgd2hpY2ggaXMgd2hhdCBsZXRzIGNlbGwgYmxhbmtzIHJpZGUgdGhlIGV4aXN0aW5nXG4vLyBTdWJtaXNzaW9uUmVzcG9uc2VzLmJsYW5rcyBtYXAgd2l0aCBubyB3aXJlLXZlcnNpb24gYnVtcC5cbmV4cG9ydCBjb25zdCBUYWJsZUNlbGwgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgLy8gVGhlIHNhbWUgaW5saW5lIGFscGhhYmV0IGZpbGxfaW5fYmxhbmsncyBib2R5IHVzZXM6IHRleHQgd2l0aCBtYXJrcyxcbiAgLy8gaW5saW5lIG1hdGgsIGhhcmQgYnJlYWtzLCBhbmQgYmxhbmsgdG9rZW5zLiBEZWxpYmVyYXRlbHkgTk9UIGEgYmxvY2sgYXJyYXk6XG4gIC8vIGl0IGtlZXBzIGV2ZXJ5IGNlbGwgd2Fsa2FibGUsIGtlZXBzIHRoZSBzY2hlbWEgbm9uLXJlY3Vyc2l2ZSAoc2VlIHRoZVxuICAvLyBUUzcwNTYgbm90ZSBpbiBpbmxpbmUudHMpLCBhbmQga2VlcHMgYSBjZWxsIGEgY2VsbCByYXRoZXIgdGhhbiBhIHBhZ2UuXG4gIGNvbnRlbnQ6IHouYXJyYXkoRmlsbEluQmxhbmtJbmxpbmUpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBUYWJsZUNlbGwgPSB6LmluZmVyPHR5cGVvZiBUYWJsZUNlbGw+O1xuXG4vLyBOTyBgdHlwZWAgRklFTEQgXHUyMDE0IHNlZSB0aGUgaGVhZGVyLlxuZXhwb3J0IGNvbnN0IFRhYmxlUm93ID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIGNlbGxzOiB6LmFycmF5KFRhYmxlQ2VsbCkuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCB0eXBlIFRhYmxlUm93ID0gei5pbmZlcjx0eXBlb2YgVGFibGVSb3c+O1xuXG5leHBvcnQgY29uc3QgVGFibGVCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ3RhYmxlJyksXG4gIC8vIEF1dG8tYXNzaWduZWQgd29ya3NoZWV0IG51bWJlciwgYXMgb24gZXZlcnkgbnVtYmVyZWQgYmxvY2suIFByZXNlbnQgb25seVxuICAvLyB3aGVuIHRoZSB0YWJsZSBpcyBncmFkYWJsZSAoYSBibGFua2xlc3MgdGFibGUgaXMgYSBzdGltdWx1cywgbm90IGFcbiAgLy8gcXVlc3Rpb24pIFx1MjAxNCByZXNvbHZlZCBieSBudW1iZXJpbmcsIG5vdCBzdG9yZWQgYXV0aG9yaXR5LlxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAvLyBXaGljaCBheGlzIGNhcnJpZXMgdGhlIGhlYWRlcnMuIFR3byBib29sZWFucyByYXRoZXIgdGhhbiBhIHBlci1jZWxsIGZsYWc6XG4gIC8vIGEgaGVhZGVyIGNlbGwgaW4gdGhlIE1JRERMRSBvZiBhIHRhYmxlIGlzIG5vdCBhIHRoaW5nIHRoaXMgdm9jYWJ1bGFyeVxuICAvLyBzaG91bGQgYmUgYWJsZSB0byBleHByZXNzLCBhbmQgdGhlIGExMXkgc3RvcnkgbmVlZHMgdG8ga25vdyB3aGljaCBheGlzXG4gIC8vIG5hbWVzIGEgY2VsbCAoXCJLaWxvZ3JhbXMgMiwgQ29zdFwiIHJlYWRzIGNvcnJlY3RseSBvbmx5IGlmIHdlIGtub3cgd2hlcmUgdGhlXG4gIC8vIGxhYmVscyBsaXZlKS4gYGhlYWRlckNvbHVtbmAgaXMgbm90IGRlY29yYXRpb24gXHUyMDE0IGFsZ2VicmEgdGFibGVzIGFyZSBhc1xuICAvLyBvZnRlbiB0cmFuc3Bvc2VkICh4IGRvd24gdGhlIGxlZnQpIGFzIG5vdC5cbiAgaGVhZGVyUm93OiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICBoZWFkZXJDb2x1bW46IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAvLyBQZXItY29sdW1uIGFsaWdubWVudCwgaW5kZXgtYWxpZ25lZCB3aXRoIGVhY2ggcm93J3MgY2VsbHMuIE9wdGlvbmFsIHdpdGggTk9cbiAgLy8gZGVmYXVsdCBzbyBhIHRhYmxlIGF1dGhvcmVkIHdpdGhvdXQgYWxpZ25tZW50IHJlLXNlcmlhbGl6ZXMgYnl0ZS1pZGVudGljYWxseVxuICAvLyAodGhlIHNhbWUgb3B0aW9uYWwtbm8tZGVmYXVsdCBkaXNjaXBsaW5lIGFzIEJsYW5rVG9rZW4uYW5zd2VyVHlwZSkuIEEgc2hvcnRcbiAgLy8gYXJyYXkgaXMgZmluZTogY29sdW1ucyBwYXN0IGl0cyBlbmQgZmFsbCBiYWNrIHRvIGxlZnQuXG4gIGNvbHVtbkFsaWduczogei5hcnJheShUYWJsZUNvbHVtbkFsaWduKS5vcHRpb25hbCgpLFxuICAvLyBUaGUgKGEpLyhiKSBtYXJrZXJzIG9uIGJsYW5rIGNlbGxzLiBNaXJyb3JzIGZhZGVkX3dvcmtlZF9leGFtcGxlJ3NcbiAgLy8gc2hvd1N0ZXBMYWJlbHMgXHUyMDE0IG9mZiBnaXZlcyBhIHRlYWNoZXIgbWF4aW11bSB3cml0aW5nIHJvb20gb24gcGFwZXIuXG4gIC8vIERlZmF1bHRlZCBzbyBhIGRvY3VtZW50IGF1dGhvcmVkIGJlZm9yZSB0aGlzIGZpZWxkIHJlbmRlcnMgbGFiZWxsZWQuXG4gIHNob3dDZWxsTGFiZWxzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICByb3dzOiB6LmFycmF5KFRhYmxlUm93KS5kZWZhdWx0KFtdKSxcbiAgLy8gVGhlIHRhYmxlJ3Mgb3duIHBhZ2UgbGFiZWwgKGF1dG8vY3VzdG9tL25vbmUpLCBsaWtlIGV2ZXJ5IG51bWJlcmVkIHR5cGUuXG4gIC4uLmxhYmVsRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBUYWJsZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgVGFibGVCbG9jaz47XG5cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gYmxvY2tzL2luZGV4LnRzIFx1MjAxNCBCbG9jayBkaXNjcmltaW5hdGVkIHVuaW9uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2luZ2xlIHNvdXJjZSBvZiB0cnV0aCBmb3IgXCJ3aGF0IGJsb2NrIHR5cGVzIGV4aXN0IGluIFBoYXNlIDEuXCIgQWRkaW5nIGFcbi8vIG5ldyBibG9jayB0eXBlIG1lYW5zOiBuZXcgZmlsZSB1bmRlciBibG9ja3MvLCBuZXcgZW50cnkgaGVyZSwgbmV3IGZhY3Rvcnlcbi8vIGluIGZhY3Rvcmllcy50cywgbmV3IHJlbmRlcmVyIGluIEBhY3Rpdml0eS9yZW5kZXJlci9ibG9ja3MvLiBUaHJlZSBwbGFjZXMsXG4vLyBhbHdheXMgaW4gdGhhdCBvcmRlci5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG5pbXBvcnQgeyBQYXJhZ3JhcGhCbG9jayB9IGZyb20gJy4vcGFyYWdyYXBoLmpzJztcbmltcG9ydCB7IEhlYWRpbmdCbG9jayB9IGZyb20gJy4vaGVhZGluZy5qcyc7XG5pbXBvcnQgeyBNYXRoQmxvY2sgfSBmcm9tICcuL21hdGgtYmxvY2suanMnO1xuaW1wb3J0IHsgSW1hZ2VCbG9jaywgQ3JvcFJlY3QgfSBmcm9tICcuL2ltYWdlLmpzJztcbmltcG9ydCB7IENhbGxvdXRCbG9jayB9IGZyb20gJy4vY2FsbG91dC5qcyc7XG5pbXBvcnQgeyBQcm9ibGVtQmxvY2sgfSBmcm9tICcuL3Byb2JsZW0uanMnO1xuaW1wb3J0IHsgRmlsbEluQmxhbmtCbG9jayB9IGZyb20gJy4vZmlsbC1pbi1ibGFuay5qcyc7XG5pbXBvcnQgeyBCdWxsZXRMaXN0QmxvY2ssIE9yZGVyZWRMaXN0QmxvY2ssIExpc3RJdGVtIH0gZnJvbSAnLi9saXN0LmpzJztcbmltcG9ydCB7IEludGVyYWN0aXZlR3JhcGhCbG9jayB9IGZyb20gJy4vaW50ZXJhY3RpdmUtZ3JhcGguanMnO1xuaW1wb3J0IHsgTXVsdGlwbGVDaG9pY2VCbG9jayB9IGZyb20gJy4vbXVsdGlwbGUtY2hvaWNlLmpzJztcbmltcG9ydCB7IE1hdGNoaW5nQmxvY2sgfSBmcm9tICcuL21hdGNoaW5nLmpzJztcbmltcG9ydCB7IE9yZGVyaW5nQmxvY2sgfSBmcm9tICcuL29yZGVyaW5nLmpzJztcbmltcG9ydCB7IE51bWJlckxpbmVCbG9jayB9IGZyb20gJy4vbnVtYmVyLWxpbmUuanMnO1xuaW1wb3J0IHsgRGF0YVBsb3RCbG9jayB9IGZyb20gJy4vZGF0YS1wbG90LmpzJztcbmltcG9ydCB7IExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrIH0gZnJvbSAnLi9sZWFybmluZy1vYmplY3RpdmVzLmpzJztcbmltcG9ydCB7IFdvcmtlZEV4YW1wbGVCbG9jayB9IGZyb20gJy4vd29ya2VkLWV4YW1wbGUuanMnO1xuaW1wb3J0IHsgR3JhcGhGaWd1cmVCbG9jayB9IGZyb20gJy4vZ3JhcGgtZmlndXJlLmpzJztcbmltcG9ydCB7IEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrIH0gZnJvbSAnLi9mYWRlZC13b3JrZWQtZXhhbXBsZS5qcyc7XG5pbXBvcnQgeyBTZWxmRXhwbGFuYXRpb25CbG9jayB9IGZyb20gJy4vc2VsZi1leHBsYW5hdGlvbi5qcyc7XG5pbXBvcnQgeyBTaG9ydEFuc3dlckJsb2NrLCBFc3NheUJsb2NrIH0gZnJvbSAnLi9mcmVlLXJlc3BvbnNlLmpzJztcbmltcG9ydCB7IFRhYmxlQmxvY2sgfSBmcm9tICcuL3RhYmxlLmpzJztcblxuZXhwb3J0IGNvbnN0IEJsb2NrID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFBhcmFncmFwaEJsb2NrLFxuICBIZWFkaW5nQmxvY2ssXG4gIE1hdGhCbG9jayxcbiAgSW1hZ2VCbG9jayxcbiAgQ2FsbG91dEJsb2NrLFxuICBQcm9ibGVtQmxvY2ssXG4gIEZpbGxJbkJsYW5rQmxvY2ssXG4gIEJ1bGxldExpc3RCbG9jayxcbiAgT3JkZXJlZExpc3RCbG9jayxcbiAgSW50ZXJhY3RpdmVHcmFwaEJsb2NrLFxuICBNdWx0aXBsZUNob2ljZUJsb2NrLFxuICBNYXRjaGluZ0Jsb2NrLFxuICBPcmRlcmluZ0Jsb2NrLFxuICBOdW1iZXJMaW5lQmxvY2ssXG4gIERhdGFQbG90QmxvY2ssXG4gIExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrLFxuICBXb3JrZWRFeGFtcGxlQmxvY2ssXG4gIEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrLFxuICBTZWxmRXhwbGFuYXRpb25CbG9jayxcbiAgU2hvcnRBbnN3ZXJCbG9jayxcbiAgRXNzYXlCbG9jayxcbiAgR3JhcGhGaWd1cmVCbG9jayxcbiAgVGFibGVCbG9jayxcbl0pO1xuZXhwb3J0IHR5cGUgQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBCbG9jaz47XG5cbi8vIE5PVEU6IGxheW91dCBpcyBOT1QgYSBibG9jay4gUm93cy9Db2x1bW5zIChwYWNrYWdlcy9zY2hlbWEvc3JjL2xheW91dC50cykgYXJlXG4vLyB0aGUgc3RydWN0dXJhbCBjb250YWluZXIgQUJPVkUgYmxvY2tzIFx1MjAxNCBhIENvbHVtbiBob2xkcyBCbG9ja1tdLCBuZXZlciB0aGVcbi8vIHJldmVyc2UgXHUyMDE0IHNvIHRoZSBCbG9jayB1bmlvbiBpcyBsZWFmIGJsb2NrcyBvbmx5IGFuZCBjYW4gbmV2ZXIgbmVzdCBhIHJvdy5cblxuLy8gUmUtZXhwb3J0IGluZGl2aWR1YWwgYmxvY2sgdHlwZXMgc28gY29uc3VtZXJzIGNhbiBpbXBvcnQgdGhlbSBieSBuYW1lLlxuZXhwb3J0IHtcbiAgUGFyYWdyYXBoQmxvY2ssXG4gIEhlYWRpbmdCbG9jayxcbiAgTWF0aEJsb2NrLFxuICBJbWFnZUJsb2NrLFxuICBDcm9wUmVjdCxcbiAgQ2FsbG91dEJsb2NrLFxuICBQcm9ibGVtQmxvY2ssXG4gIEZpbGxJbkJsYW5rQmxvY2ssXG4gIEJ1bGxldExpc3RCbG9jayxcbiAgT3JkZXJlZExpc3RCbG9jayxcbiAgTGlzdEl0ZW0sXG4gIEludGVyYWN0aXZlR3JhcGhCbG9jayxcbn07XG5leHBvcnQge1xuICBNdWx0aXBsZUNob2ljZUJsb2NrLFxuICBNdWx0aXBsZUNob2ljZU9wdGlvbixcbiAgQ2hvaWNlSW1hZ2UsXG4gIENob2ljZUdyYXBoLFxufSBmcm9tICcuL211bHRpcGxlLWNob2ljZS5qcyc7XG5leHBvcnQgeyBNYXRjaGluZ0Jsb2NrLCBNYXRjaGluZ0l0ZW0sIE1hdGNoaW5nVGFyZ2V0IH0gZnJvbSAnLi9tYXRjaGluZy5qcyc7XG5leHBvcnQgeyBPcmRlcmluZ0Jsb2NrLCBPcmRlcmluZ0l0ZW0gfSBmcm9tICcuL29yZGVyaW5nLmpzJztcbmV4cG9ydCB7XG4gIE51bWJlckxpbmVCbG9jayxcbiAgTnVtYmVyTGluZUNvbmZpZyxcbiAgTnVtYmVyTGluZUludGVyYWN0aW9uLFxuICBOdW1iZXJMaW5lUG9pbnRJbnRlcmFjdGlvbixcbiAgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb24sXG4gIE51bWJlckxpbmVJbnRlcnZhbCxcbn0gZnJvbSAnLi9udW1iZXItbGluZS5qcyc7XG5leHBvcnQge1xuICBEYXRhUGxvdEJsb2NrLFxuICBEYXRhUGxvdENvbmZpZyxcbiAgRGF0YVBsb3RDaGFydCxcbiAgRGF0YVBsb3RJbnRlcmFjdGlvbixcbiAgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb24sXG4gIERhdGFQbG90RG90cGxvdEludGVyYWN0aW9uLFxuICBEYXRhUGxvdEhpc3RvZ3JhbUludGVyYWN0aW9uLFxuICBEYXRhUGxvdEJveHBsb3RJbnRlcmFjdGlvbixcbn0gZnJvbSAnLi9kYXRhLXBsb3QuanMnO1xuZXhwb3J0IHsgTGVhcm5pbmdPYmplY3RpdmVzQmxvY2sgfSBmcm9tICcuL2xlYXJuaW5nLW9iamVjdGl2ZXMuanMnO1xuZXhwb3J0IHsgV29ya2VkRXhhbXBsZUJsb2NrLCBXb3JrZWRFeGFtcGxlQ2hpbGQgfSBmcm9tICcuL3dvcmtlZC1leGFtcGxlLmpzJztcbmV4cG9ydCB7IEdyYXBoRmlndXJlQmxvY2sgfSBmcm9tICcuL2dyYXBoLWZpZ3VyZS5qcyc7XG5leHBvcnQge1xuICBGYWRlZFdvcmtlZEV4YW1wbGVCbG9jayxcbiAgRmFkZWRXb3JrZWRFeGFtcGxlQ2hpbGQsXG59IGZyb20gJy4vZmFkZWQtd29ya2VkLWV4YW1wbGUuanMnO1xuZXhwb3J0IHsgU2VsZkV4cGxhbmF0aW9uQmxvY2sgfSBmcm9tICcuL3NlbGYtZXhwbGFuYXRpb24uanMnO1xuZXhwb3J0IHtcbiAgU2hvcnRBbnN3ZXJCbG9jayxcbiAgRXNzYXlCbG9jayxcbiAgV29yZENvdW50SGludCxcbiAgUnVicmljLFxuICBSdWJyaWNDcml0ZXJpb24sXG59IGZyb20gJy4vZnJlZS1yZXNwb25zZS5qcyc7XG5leHBvcnQge1xuICBUYWJsZUJsb2NrLFxuICBUYWJsZVJvdyxcbiAgVGFibGVDZWxsLFxuICBUYWJsZUNvbHVtbkFsaWduLFxufSBmcm9tICcuL3RhYmxlLmpzJztcbi8vIEZyb20gdGhlIHpvZC1mcmVlIG1vZHVsZSwgTk9UICcuL3RhYmxlLmpzJyBcdTIwMTQgc2VlIHRhYmxlLWJsYW5rLWlkcy50cy4gUm91dGluZ1xuLy8gaXQgdGhyb3VnaCB0aGUgc2NoZW1hIG1vZHVsZSB3b3VsZCBwdXQgem9kIGJhY2sgaW4gdGhlIHN0dWRlbnQgc2hlbGwgZm9yXG4vLyBhbnlvbmUgd2hvIHJlYWNoZXMgdGhpcyBiYXJyZWwuXG5leHBvcnQgeyB0YWJsZUJsYW5rSWRzIH0gZnJvbSAnLi4vdGFibGUtYmxhbmstaWRzLmpzJztcbmV4cG9ydCB0eXBlIHsgVGFibGVCbGFua1NvdXJjZSB9IGZyb20gJy4uL3RhYmxlLWJsYW5rLWlkcy5qcyc7XG5leHBvcnQge1xuICBBeGlzQ29uZmlnLFxuICBQb2ludEludGVyYWN0aW9uLFxuICBGdW5jdGlvbkludGVyYWN0aW9uLFxuICBGdW5jdGlvbk1vZGVsLFxuICBSZWdpb25JbnRlcmFjdGlvbixcbiAgUmF5SW50ZXJhY3Rpb24sXG4gIFJheUFuc3dlcixcbiAgU2VnbWVudEludGVyYWN0aW9uLFxuICBTZWdtZW50QW5zd2VyLFxuICBFbmRwb2ludFN0eWxlLFxuICBEcmF3YWJsZSxcbiAgRHJhd2FibGVDb2xvcixcbiAgRGlzcGxheUludGVyYWN0aW9uLFxuICBHcmFwaEludGVyYWN0aW9uLFxufSBmcm9tICcuL2ludGVyYWN0aXZlLWdyYXBoLmpzJztcbmV4cG9ydCB0eXBlIHsgSGVhZGluZ0xldmVsIH0gZnJvbSAnLi9oZWFkaW5nLmpzJztcbmV4cG9ydCB0eXBlIHsgQ2FsbG91dFZhcmlhbnQgfSBmcm9tICcuL2NhbGxvdXQuanMnO1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBsYXlvdXQudHMgXHUyMDE0IFN0cnVjdHVyYWwgbGF5b3V0IGxheWVyOiBSb3cgKyBDb2x1bW5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgZG9jdW1lbnQgYm9keSBpcyBhIHN0YWNrIG9mIFJPV1MuIEEgcm93IGxheXMgaXRzIGNoaWxkIGNvbHVtbnMgc2lkZSBieVxuLy8gc2lkZTsgZWFjaCBjb2x1bW4gaG9sZHMgaXRzIG93biBTVEFDSyBvZiBibG9ja3MgKGJsb2NrKykuIE9uZSBjb2x1bW4gaXMgdGhlXG4vLyBpZGVudGl0eS9kZWZhdWx0IFx1MjAxNCBhIDEtY29sdW1uIHJvdyBpcyB0aGUgbm9ybWFsIGZ1bGwtd2lkdGggdmVydGljYWwgZmxvdywgYW5kXG4vLyBcImFkZCBjb2x1bW5zXCIgc3BsaXRzIGEgcm93IGludG8gbW9yZSBjb2x1bW5zLiBUaGlzIHJlcGxhY2VzIHRoZSBvbGQgYGNvbHVtbnNgXG4vLyBibG9jayB0eXBlOiBsYXlvdXQgaXMgbm93IHRoZSB1bml2ZXJzYWwgY29udGFpbmVyIGluc3RlYWQgb2YgYW4gaW5zZXJ0ZWRcbi8vIGJsb2NrLCB3aGljaCBpcyBob3cgcXVhbGl0eSBwcmludCBlbmdpbmVzIChJbkRlc2lnbiwgcHJpbnQgQ1NTKSBhbmQgd2ViXG4vLyBsYXlvdXQgdG9vbHMgbW9kZWwgYSBkb2N1bWVudC5cbi8vXG4vLyBObyByZWN1cnNpb246IGByb3dgIGFuZCBgY29sdW1uYCBhcmUgTk9UIG1lbWJlcnMgb2YgdGhlIEJsb2NrIHVuaW9uIChCbG9jayBpc1xuLy8gbGVhZiBibG9ja3Mgb25seSksIHNvIGEgQ29sdW1uJ3MgYGJsb2NrczogQmxvY2tbXWAgY2FuIG5ldmVyIGNvbnRhaW4gYSBSb3cuXG4vLyBUaGUgb2xkIGNvbHVtbnMtaW4tY29sdW1ucyBndWFyZCAoYW4gZW51bWVyYXRlZCBjZWxsIHVuaW9uKSBpcyB0aGVyZWZvcmUgYVxuLy8gc3RydWN0dXJhbCBmYWN0IGhlcmUsIG5vdCBhbiBlbmZvcmNlZCBleGNsdXNpb24uXG4vL1xuLy8gd2lkdGggaXMgYW4gb3B0aW9uYWwgdW5pdGxlc3Mgd2VpZ2h0IHBlciBjb2x1bW46IGEgY29sdW1uIHdpdGggd2lkdGggMiBiZXNpZGVcbi8vIGEgY29sdW1uIHdpdGggd2lkdGggMSB0YWtlcyAyLzMgb2YgdGhlIHJvdy4gQWJzZW50IFx1MjE5MiBlcXVhbCBzcGxpdC4gVGhpcyBpcyB0aGVcbi8vIHJlYXNvbiBsYXlvdXQgaXMgc3RydWN0dXJhbCByYXRoZXIgdGhhbiBhIENTUyB0b2dnbGUgXHUyMDE0IFwid2lkZSB3b3JrZWQgZXhhbXBsZSArXG4vLyBuYXJyb3cgYW5zd2VyIHN0cmlwXCIgbmVlZHMgdW5lcXVhbCB3aWR0aHMuXG4vL1xuLy8gbWluSGVpZ2h0IGlzIGEgcmVzZXJ2ZWQgd29yay1zcGFjZSBmbG9vciBpbiByZW0uIFRoZSBjZWxsIHN0aWxsIEdST1dTIHdpdGhcbi8vIGNvbnRlbnQgKGEgZmxvb3IsIG5vdCBhIGZpeGVkIGhlaWdodCBcdTIwMTQgZml4ZWQgaGVpZ2h0cyBicmVhayBwcmludCByZWZsb3cgYW5kXG4vLyB0aGUgZm9sZGFibGUncyBoZWlnaHQgbWVhc3VyZW1lbnQpLiByZW0gc28gdGhlIHJlc2VydmVkIHNwYWNlIHNjYWxlcyB3aXRoIHRoZVxuLy8gcHJpbnQgZm9udC1zaXplIGNvbmZpZy4gQWJzZW50ID0gY29udGVudC1kZXRlcm1pbmVkIGhlaWdodC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG5pbXBvcnQgeyBCbG9jayB9IGZyb20gJy4vYmxvY2tzL2luZGV4LmpzJztcblxuLy8gZ3JpZExpbmVzIHR1cm5zIGEgcm93IGludG8gYSBydWxlZCBncmlkOiBhIGJvcmRlciBhcm91bmQgdGhlIHdob2xlIHJvdywgcnVsZXNcbi8vIGJldHdlZW4gdGhlIGNlbGxzLCBhbmQgcnVsZXMgYmV0d2VlbiB0aGUgc3RhY2tlZCBibG9ja3Mgd2l0aGluIGEgY2VsbC5cbi8vIEVzcGVjaWFsbHkgdXNlZnVsIGluIHByaW50IChib3hlZCByZWdpb25zIHRvIHdyaXRlIGluIC8gY3V0IG91dCkuIFRyaS1zdGF0ZSBzb1xuLy8gYSByb3cgY2FuIGRlZmVyIHRvIHRoZSBhY3Rpdml0eS13aWRlIGRlZmF1bHQ6XG4vLyAgICdpbmhlcml0JyBcdTIwMTQgZm9sbG93IG1ldGEucHJpbnQuZ3JpZExpbmVzICh0aGUgYWN0aXZpdHkgZGVmYXVsdDsgdGhlIHJlbmRlcmVyXG4vLyAgICAgICAgICAgICAgIHJlc29sdmVzIHRoaXMpLiBEZWZhdWx0LCBzbyBhIGZyZXNobHkgYXV0aG9yZWQgcm93IHRyYWNrcyB0aGVcbi8vICAgICAgICAgICAgICAgYWN0aXZpdHkgc2V0dGluZyB3aXRob3V0IHBlci1yb3cgZmlkZGxpbmcuXG4vLyAgICdvbicgICAgICBcdTIwMTQgYWx3YXlzIHJ1bGVkLCByZWdhcmRsZXNzIG9mIHRoZSBhY3Rpdml0eSBkZWZhdWx0LlxuLy8gICAnb2ZmJyAgICAgXHUyMDE0IG5ldmVyIHJ1bGVkLCByZWdhcmRsZXNzIG9mIHRoZSBhY3Rpdml0eSBkZWZhdWx0LlxuZXhwb3J0IGNvbnN0IENvbHVtbkdyaWRMaW5lcyA9IHouZW51bShbJ2luaGVyaXQnLCAnb24nLCAnb2ZmJ10pO1xuZXhwb3J0IHR5cGUgQ29sdW1uR3JpZExpbmVzID0gei5pbmZlcjx0eXBlb2YgQ29sdW1uR3JpZExpbmVzPjtcblxuZXhwb3J0IGNvbnN0IENvbHVtbiA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAvLyBQZXItY29sdW1uIHdpZHRoIHdlaWdodCAoZnIgdW5pdHMpLiBPcHRpb25hbDsgYWJzZW50ID0gZXF1YWwgc3BsaXQuXG4gIHdpZHRoOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLy8gUmVzZXJ2ZWQgd29yay1zcGFjZSBmbG9vciBpbiByZW0gKGEgbWluLWhlaWdodCwgbm90IGEgZml4ZWQgaGVpZ2h0KS5cbiAgbWluSGVpZ2h0OiB6Lm51bWJlcigpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLy8gQSBjb2x1bW4gaG9sZHMgYSBub24tZW1wdHkgU1RBQ0sgb2YgYmxvY2tzIChibG9jayspLiBBIGNvbHVtbiBjYW4gaG9sZCBhXG4gIC8vIGhlYWRpbmcgZm9sbG93ZWQgYnkgc2V2ZXJhbCBwcm9ibGVtcyBcdTIwMTQgdGhlIHRoaW5nIGEgZG9jdW1lbnQgdG9vbCBuZWVkcyBhbmRcbiAgLy8gYSBvbmUtYmxvY2stcGVyLXJvdyBtb2RlbCBjYW4ndCBleHByZXNzLlxuICBibG9ja3M6IHouYXJyYXkoQmxvY2spLm1pbigxKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ29sdW1uID0gei5pbmZlcjx0eXBlb2YgQ29sdW1uPjtcblxuLy8gMS4uNiBjb2x1bW5zLiBUaGUgZWRpdG9yIHN1cmZhY2VzIGEgbm9uLWJsb2NraW5nIHdhcm5pbmcgYWJvdmUgMyAodG9vIG5hcnJvd1xuLy8gdG8gcmVhZCBvbiBwYXBlciBvciBhIENocm9tZWJvb2spLCBidXQgdGhlIHNjaGVtYSBhY2NlcHRzIHVwIHRvIDYgc28gYW5cbi8vIGludGVudGlvbmFsIGRlbnNlIGxheW91dCBzdGlsbCB2YWxpZGF0ZXMuIE9uZSBjb2x1bW4gaXMgdGhlIGlkZW50aXR5IHN0YXRlOlxuLy8gYSBmdWxsLXdpZHRoIHJvdyB0aGF0IFwicmVtb3ZlIGNvbHVtblwiIGNhbm5vdCBkaXNzb2x2ZSBiZWxvdy5cbmV4cG9ydCBjb25zdCBSb3cgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgY29sdW1uczogei5hcnJheShDb2x1bW4pLm1pbigxKS5tYXgoNiksXG4gIGdyaWRMaW5lczogQ29sdW1uR3JpZExpbmVzLmRlZmF1bHQoJ2luaGVyaXQnKSxcbn0pO1xuZXhwb3J0IHR5cGUgUm93ID0gei5pbmZlcjx0eXBlb2YgUm93PjtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gZG9jdW1lbnQudHMgXHUyMDE0IFRvcC1sZXZlbCBBY3Rpdml0eURvY3VtZW50IGFuZCBTZWN0aW9uIHNjaGVtYXNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBY3Rpdml0eURvY3VtZW50IGlzIHdoYXQgZ2V0cyBzdG9yZWQgaW4gYWN0aXZpdGllcy5kcmFmdF9jb250ZW50IGFuZFxuLy8gYWN0aXZpdHlfdmVyc2lvbnMuY29udGVudC4gVGhlIHNoYXBlIGxpdmVzIGluIHRoaXMgcGFja2FnZSBhcyB0aGUgc2luZ2xlXG4vLyBzb3VyY2Ugb2YgdHJ1dGggXHUyMDE0IHRoZSByZW5kZXJlciBwYXJzZXMgaXQsIHRoZSBlZGl0b3IgcHJvZHVjZXMgaXQgdmlhIHRoZVxuLy8gc2VyaWFsaXplIGxheWVyLCB0aGUgZGF0YWJhc2Ugc3RvcmVzIGl0IGFzIGpzb25iLlxuLy9cbi8vIHNjaGVtYVZlcnNpb24gaXMgdGhlIG1pZ3JhdGlvbiBhbmNob3IuIEl0IGlzIGN1cnJlbnRseSAyLiBUaGUgMVx1MjE5MjIgcmVzaGFwZVxuLy8gKGJsb2NrLXN0cmVhbSBzZWN0aW9ucyBcdTIxOTIgcm93cy1vZi1jb2x1bW5zKSB3YXMgYSBHUkVFTkZJRUxEIEhBUkQtQ1VUOiB0aGVyZSB3YXNcbi8vIG5vIHByb2R1Y3Rpb24gZGF0YSB0byBwcmVzZXJ2ZSwgc28gdGhlcmUgaXMgZGVsaWJlcmF0ZWx5IE5PIG1pZ3JhdGUoMVx1MjE5MjIpIGFuZFxuLy8gTk8gbWlncmF0ZS1vbi1yZWFkIFx1MjAxNCB0aGUgcGFyc2VyIGlzIHoubGl0ZXJhbCgyKSBhbmQgUkVKRUNUUyBhIHYxIGRvY3VtZW50XG4vLyAoYSBzdHJheSB2MSBmYWlscyBsb3VkbHkgYXQgcGFyc2UgcmF0aGVyIHRoYW4gbWlzLXBhcnNpbmcgaW50byBnYXJiYWdlKS5cbi8vIFdoZW4gYSBGVVRVUkUgc2NoZW1hIG5lZWRzIGEgbm9uLXRyaXZpYWwgbWlncmF0aW9uIGFnYWluc3QgcmVhbCBzdG9yZWQgZGF0YSxcbi8vIGJ1bXAgdGhlIHZlcnNpb24gYW5kIGFkZCBhIG1pZ3JhdGUoTiAtPiBOKzEpIHRoYXQgcnVucyBvbiByZWFkIChvbGRcbi8vIGFjdGl2aXR5X3ZlcnNpb25zIHJvd3Mgc3RheSBhdCB0aGVpciBvcmlnaW5hbCBzY2hlbWFWZXJzaW9uIGZvcmV2ZXI7IG1pZ3JhdGVcbi8vIG9uIHJlYWQsIG5ldmVyIGJ5IG11dGF0aW5nIHN0b3JlZCB2ZXJzaW9ucykuIFRoZSBncmVlbmZpZWxkIGhhcmQtY3V0IGlzIGFcbi8vIG9uZS10aW1lIGV4Y2VwdGlvbiwgbm90IHRoZSBnZW5lcmFsIHBvbGljeS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgQmxvY2sgfSBmcm9tICcuL2Jsb2Nrcy9pbmRleC5qcyc7XG5pbXBvcnQgeyBSb3cgfSBmcm9tICcuL2xheW91dC5qcyc7XG5cbi8vIFNlY3Rpb246IGEgY29sbGVjdGlvbiBvZiBST1dTIHdpdGggYW4gb3B0aW9uYWwgdGl0bGUuIFNlY3Rpb25zIGFyZSB0aGVcbi8vIHZlcnRpY2FsIGNoZWNrcG9pbnQgcHJpbWl0aXZlOyByb3dzIGFyZSB0aGUgaG9yaXpvbnRhbC1zcGxpdCBwcmltaXRpdmVcbi8vIChsYXlvdXQudHMpLiBBIHNlY3Rpb24gaXMgdXN1YWxseSBvbmUgMS1jb2x1bW4gcm93IHdob3NlIGNvbHVtbiBzdGFja3MgbWFueVxuLy8gYmxvY2tzOyBhIGNvbHVtbmVkIHJlZ2lvbiBpcyBhIG11bHRpLWNvbHVtbiByb3cuIFNlY3Rpb25zIGFyZSBvcmdhbml6YXRpb25hbFxuLy8gb25seSBcdTIwMTQgdGhleSBkb24ndCBjb25zdHJhaW4gY29udGVudCBiZXlvbmQgaG9sZGluZyByb3dzLlxuLy9cbi8vIGlzQ2hlY2twb2ludCBpcyB0aGUgYHtjaGVja3BvaW50fWAgbWFya2VyLCBhbmQgaXQgaXMgd2hlcmUgQ0hFQ0tJTkcgSEFQUEVOU1xuLy8gKGFjdGl2aXR5IGZsb3cgbW9kZXMsIFIxKS4gQSBjaGVja3BvaW50IHNlY3Rpb24ncyBDaGVjayBjb3ZlcnMgRVZFUlkgU0VDVElPTlxuLy8gU0lOQ0UgVEhFIFBSRVZJT1VTIENIRUNLUE9JTlQsIGluY2x1c2l2ZSBcdTIwMTQgbm90IGp1c3QgaXRzZWxmIFx1MjAxNCBhbmQgVEhFIEVORCBPRlxuLy8gVEhFIEFDVElWSVRZIElTIEFMV0FZUyBBIENIRUNLUE9JTlQsIHNvIG5vIHRyYWlsaW5nIHNlY3Rpb24gaXMgZXZlciBsZWZ0XG4vLyB1bi1jaGVja2FibGUgYW5kIGEgZG9jdW1lbnQgd2l0aCBubyBtYXJrZXIgYXQgYWxsIGRlZ3JhZGVzIHRvIGV4YWN0bHkgb25lXG4vLyBDaGVjayBhdCB0aGUgZW5kLiBJZ25vcmVkIGVudGlyZWx5IHdoZW4gc3VibWlzc2lvbk1vZGUgaXMgJ3NpbmdsZScuXG4vL1xuLy8gVGhlIGZvbGQgdGhhdCB0dXJucyB0aGVzZSBpbnRvIGNoZWNrIGdyb3VwcyBpc1xuLy8gcGFja2FnZXMvdmlld2VyL3NyYy9jb250YWluZXIvY2hlY2tHcm91cHMudHM7IHRoZSBndWFyZCB0aGF0IGJpbmRzIGl0IHRvXG4vLyByZW5kZXJlZCBvdXRwdXQgaXMgdGVzdHMvY29tcG9uZW50cy9jaGVjay1ncm91cHMudGVzdC50c3ggKGEgQ2hlY2sgYnV0dG9uXG4vLyBleGlzdHMgaW4gdGhlIERPTSBmb3IgZXZlcnkgc2VjdGlvbiwgaW4gZXZlcnkgbW9kZSkuXG5leHBvcnQgY29uc3QgU2VjdGlvbiA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0NoZWNrcG9pbnQ6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dzOiB6LmFycmF5KFJvdyksXG59KTtcbmV4cG9ydCB0eXBlIFNlY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBTZWN0aW9uPjtcblxuLy8gTWV0YTogdGhlIGFjdGl2aXR5J3MgdGl0bGUsIGNvdXJzZSwgdW5pdCwgZXRjLiBOb3QgdXNlZCBpbiByZW5kZXJpbmcgb2Zcbi8vIHRoZSBib2R5IFx1MjAxNCBkcml2ZXMgdGhlIHB1Ymxpc2hlZCBIVE1MJ3MgPHRpdGxlPiBhbmQgaGVhZGVyIGJhbm5lci5cbi8vXG4vLyBzdWJtaXNzaW9uTW9kZSBjb250cm9scyB0aGUgc3R1ZGVudC1mYWNpbmcgZmxvdy4gVHdvIHJlYWwgYmVoYXZpb3VycyBhbmQgb25lXG4vLyBhdXRob3JpbmcgY29udmVuaWVuY2UgKGFjdGl2aXR5IGZsb3cgbW9kZXMsIFIyKTpcbi8vICAgJ2ZyZWUnICAgKGRlZmF1bHQpIFx1MjAxNCBjaGVja3BvaW50cyBwZXIgUjE7IGEgZ3JvdXAgbWF5IGJlIHJlLWNoZWNrZWQgZnJlZWx5XG4vLyAgICdsb2NrZWQnIFx1MjAxNCBjaGVja3BvaW50cyBwZXIgUjE7IGEgZ3JvdXAncyBpbnB1dHMgRlJFRVpFIHRoZSBtb21lbnQgaXRzXG4vLyAgICAgICAgICAgICAgY2hlY2sgaXMgcHJlc3NlZCwgYW5kIHRoZSBTRVJWRVIgcmVmdXNlcyBhIHNlY29uZCBjaGVjayBmb3IgYVxuLy8gICAgICAgICAgICAgIHNlY3Rpb24gdGhhdCBhbHJlYWR5IGhhcyBvbmUgKHJlY29yZF9jaGVjaydzIHBfbG9ja2VkLCAwMDQwIFx1MjAxNFxuLy8gICAgICAgICAgICAgIGRlcml2ZWQgZnJvbSBUSElTIGZpZWxkLCBuZXZlciBmcm9tIGFueXRoaW5nIHRoZSBjbGllbnQgc2VuZHMpLlxuLy8gICAgICAgICAgICAgIFx1MjZBMCBUaGVyZSBpcyBubyB1bmxvY2sgaW4gdjE6IG5vdCBmb3IgdGhlIHN0dWRlbnQsIG5vdCBmb3IgdGhlXG4vLyAgICAgICAgICAgICAgdGVhY2hlci4gQSByZXB1Ymxpc2ggbWludHMgYSBuZXcgdmVyc2lvbiBhbmQgcmVzZXRzIGV2ZXJ5b25lLFxuLy8gICAgICAgICAgICAgIGFuZCB0aGF0IGlzIHRoZSBvbmx5IHVubG9jayB0aGVyZSBpcy5cbi8vICAgJ3NpbmdsZScgXHUyMDE0IG5vIG1pZC1hY3Rpdml0eSBjaGVja3BvaW50czsgdGhlIGVuZC1vZi1hY3Rpdml0eSBDaGVjayBpcyB0aGVcbi8vICAgICAgICAgICAgICBvbmx5IG9uZS4gUmVkdW5kYW50IHdpdGggJ2ZyZWUnICsgbm8gbWFya2VycyB1bmRlciBSMSwgYW5kIGtlcHRcbi8vICAgICAgICAgICAgICBiZWNhdXNlIGl0IHNheXMgdGhlIGludGVudCBwbGFpbmx5IGF0IGF1dGhvcmluZyB0aW1lLlxuLy9cbi8vIGFjdGl2aXR5VHlwZSBpcyBhIExBQkVMIChSNSk6IGl0IHJlbmRlcnMgYXMgdGV4dCBiZXNpZGUgY291cnNlL3VuaXQsIG9uXG4vLyBzY3JlZW4gYW5kIG9uIHBhcGVyIFx1MjAxNCBcIkV4aXQgdGlja2V0XCIgLyBcIldhcm0tdXBcIiAvIFwiUmV2aWV3XCI7ICd3b3Jrc2hlZXQnIGlzXG4vLyB0aGUgdW5tYXJrZWQgZGVmYXVsdCBhbmQgcmVuZGVycyBub3RoaW5nLiBJdCBkcml2ZXMgbm8gbGF5b3V0LiBJdCB1c2VkIHRvXG4vLyBjbGFpbSBpdCBkaWQgKFwiYW4gZXhpdF90aWNrZXQgcmVuZGVycyBhcyBhIHNpbmdsZS1wYWdlIGZvY3VzZWQgbGF5b3V0OyBhXG4vLyB3b3Jrc2hlZXQgcmVuZGVycyB3aXRoIGZ1bGwgc2VjdGlvbiBuYXZpZ2F0aW9uXCIpIGFuZCB0aGF0IHdhcyBuZXZlciBidWlsdCBpblxuLy8gdGhlIHZpZXdlciwgd2hpY2ggaGFzIE9ORSBsYXlvdXQgYW5kIG5vIHNlY3Rpb24gbmF2aWdhdGlvbi4gSXQgaXMgYWxzbyBOT1Rcbi8vIHRoZSBjYXRhbG9nIGZhY2V0IFx1MjAxNCB0aGF0IGlzIGBwZWRhZ29naWNhbF9yb2xlYCAoMDAzNyksIGEgZGlmZmVyZW50IGF4aXMgb25cbi8vIHB1cnBvc2UgKHNlZSBwYWNrYWdlcy9hcHAvc3JjL2xpYi9wZWRhZ29naWNhbFJvbGUudHMpLlxuLy9cbi8vIGFuc3dlckZlZWRiYWNrIGNvbnRyb2xzIFdIRU4gYSBjb3JyZWN0L2luY29ycmVjdCBzaWduYWwgYmVjb21lcyB2aXNpYmxlOlxuLy8gICAnb25fY2hlY2snICBcdTIwMTQgaGlkZGVuIHVudGlsIHRoZSBzdHVkZW50IGNoZWNrcy4gVEhFIE9OTFkgTElWRSBWQUxVRSwgYW5kXG4vLyAgICAgICAgICAgICAgICAgdGhlIHRyZWF0bWVudCBmb3IgYSBtaXNzaW5nIGZpZWxkLlxuLy8gICAnaW1tZWRpYXRlJyBcdTIwMTQgUkVTRVJWRUQsIE5PVCBZRVQgQUNUSVZFIChSMywgZGVmZXJyZWQgdG8gaXRzIG93biBzbGljZSkuXG4vLyAgICAgICAgICAgICAgICAgVGhlIGVkaXRvciBncmV5cyBpdCwgdGhlIGltcG9ydGVyIHdhcm5zLCBhbmQgdGhlIHZpZXdlclxuLy8gICAgICAgICAgICAgICAgIHRyZWF0cyBpdCBhcyAnb25fY2hlY2snLiBJdCBpcyBub3QgYnVpbHQgYmVjYXVzZSBub3RoaW5nIHRvXG4vLyAgICAgICAgICAgICAgICAgaGFuZyBpdCBvbiBleGlzdHMgeWV0OiBhbGwgZWxldmVuIGlucHV0IGNvbXBvbmVudHMgd3JpdGUgdG9cbi8vICAgICAgICAgICAgICAgICB0aGUgc3RvcmUgcGVyIGtleXN0cm9rZSwgc28gdGhlcmUgaXMgbm8gY29tbWl0IHNlYW07IG9ubHlcbi8vICAgICAgICAgICAgICAgICB0aGUgc2VydmVyIHNjb3JlcnMga25vdyB3aGF0IFwiYW5zd2VyZWRcIiBtZWFucyAodGhlIHNhbml0aXplclxuLy8gICAgICAgICAgICAgICAgIHN0cmlwcyB0aGUgZXhwZWN0ZWQgY291bnQsIHNvIHRoZSBjbGllbnQgY2Fubm90IGtub3cgYW5cbi8vICAgICAgICAgICAgICAgICBvcmRlcmluZyBvciBhIGdyYXBoIGlzIGNvbXBsZXRlKTsgYW5kIHRoZSByZS1maXJlIHJ1bGUgYWZ0ZXJcbi8vICAgICAgICAgICAgICAgICBhIGNvcnJlY3Rpb24gaXMgdW5kZXNpZ25lZC4gYGltbWVkaWF0ZWAgKyBgbG9ja2VkYCBpc1xuLy8gICAgICAgICAgICAgICAgIHJlZnVzZWQgYXQgYXV0aG9yaW5nLCBiZWNhdXNlIHRoZSBzZXJ2ZXIgY2Fubm90IHRlbGwgYW5cbi8vICAgICAgICAgICAgICAgICBhdXRvLWNoZWNrIGZyb20gYSBwcmVzcy5cbi8vXG4vLyBcdTI2QTAgVEhFIE9MRCBcInRoZSBydW50aW1lIGRlZmF1bHRzIGEgTUlTU0lORyBhbnN3ZXJGZWVkYmFjayB0byAnaW1tZWRpYXRlJ1wiXG4vLyBOT1RFIElTIERFQUQgKE9WIzIwKS4gSXQgZGVzY3JpYmVkIGBwYWNrYWdlcy9yZW5kZXJlcmAncyBydW50aW1lLCB3aGljaCB3YXNcbi8vIGRlbGV0ZWQgYXQgUzkgRHJvcCA0LiBNaXNzaW5nIG1lYW5zICdvbl9jaGVjaycsIHRoZSBzYW1lIGFzIHRoZSBzY2hlbWFcbi8vIGRlZmF1bHQgXHUyMDE0IHRoZXJlIGlzIG5vIGxvbmdlciBhIGJhY2stY29tcGF0IGZhbGxiYWNrIHRoYXQgZGlmZmVycy5cbi8vXG4vLyBcdTI2QjAgcmV2aXNpb25Nb2RlIGFuZCBncmFkaW5nTW9kZSB3ZXJlIERFTEVURUQgaW4gdGhlIGFjdGl2aXR5LWZsb3ctbW9kZXMgc2xpY2Vcbi8vIChSNCwgMjAyNi0wOC0yNCkgYW5kIG11c3Qgbm90IGNvbWUgYmFjayBzcGVjdWxhdGl2ZWx5LiByZXZpc2lvbk1vZGUgZ292ZXJuZWRcbi8vIFwiYWZ0ZXIgZmluYWwgc3VibWl0LCBtYXkgdGhlIHN0dWRlbnQgcmVzdWJtaXRcIiBcdTIwMTQgYW5kIHRoZXJlIGlzIG5vIHN1Ym1pdCBpblxuLy8gdGhlIHZpZXdlciwgc28gaXQgaGFkIG5vIHJlZmVyZW50OyByZS1jaGVja2luZyBpcyBzdWJtaXNzaW9uTW9kZSdzIGpvYi5cbi8vIGdyYWRpbmdNb2RlIGlzIERFUklWRUQsIG5vdCBhdXRob3JlZDogdGhlIHNlcnZlciBhbHJlYWR5IHJlY29yZHMgZnJlZSB0ZXh0IGFzXG4vLyBcInlvdXIgdGVhY2hlciB3aWxsIHJldmlld1wiIGFuZCBncmFkZXMgZXZlcnl0aGluZyBlbHNlIHB1cmVseSBmcm9tIGJsb2NrXG4vLyB0eXBlcywgc28gJ21hbnVhbCcgb24gYW4gYWxsLU1DIGFjdGl2aXR5IHdvdWxkIGJlIGEgbGllIGFuZCAnYXV0bycgb24gYW5cbi8vIGVzc2F5IHdvdWxkIGJlIGlnbm9yZWQuIFdoZW4gcGVyLWJsb2NrIGdyYWRpbmcgbWV0YWRhdGEgbGFuZHMgKHRoZVxuLy8gdGVhY2hlci1ncmFkaW5nIHNsaWNlJ3Mgb3duIGRlc2lnbiBzYXlzIGl0IG5lZWRzIGl0KSwgaXQgbGFuZHMgYXQgdGhlIEJMT0NLXG4vLyBncmFpbiwgbm90IGhlcmUuIE9sZCBzdG9yZWQgZG9jdW1lbnRzIGNhcnJ5aW5nIGVpdGhlciBmaWVsZCBwYXJzZSBmaW5lIFx1MjAxNFxuLy8gem9kIC5vYmplY3QoKSBzdHJpcHMgdW5rbm93biBrZXlzLCBzbyB0aGV5IHZhbmlzaCBvbiB0aGUgbmV4dCBzYXZlLlxuLy9cbi8vIHNraWxscyBpcyBhbiBhcnJheSBvZiB1bml2ZXJzYWwgc2tpbGwgdGFncyBkZXNjcmliaW5nIHdoYXQgdGhlIGFjdGl2aXR5XG4vLyB0ZWFjaGVzLiBBY3Rpb24tb3JpZW50ZWQsIGZyYW1ld29yay1uZXV0cmFsOiBcInNpbXBsaWZ5aW5nIHJhdGlvbmFsXG4vLyBleHByZXNzaW9uc1wiLCBcImZhY3RvcmluZyBxdWFkcmF0aWNzXCIsIFwiZ3JhcGhpbmcgcGFyYWJvbGFzXCIuIEEgdGVhY2hlciB3aG9cbi8vIHdhbnRzIHRvIHVzZSBURUtTIG9yIENDU1MgY29kZXMgY2FuIFx1MjAxNCB0aGUgZmllbGQgZG9lc24ndCB2YWxpZGF0ZSBhZ2FpbnN0XG4vLyBhbnkgZnJhbWV3b3JrLiBQaGFzZSA1IG1hcmtldHBsYWNlIGFkZHMgY29udHJvbGxlZCB2b2NhYnVsYXJ5IG9uIHRvcC5cbi8vXG4vLyBwcmludCBpcyB0aGUgdGVhY2hlci1jb25maWd1cmFibGUgcHJpbnQgbGF5ZXIgKHNlZSBQcmludENvbmZpZyBiZWxvdykuIEl0XG4vLyBpcyBhbHdheXMgcHJlc2VudCBhZnRlciBwYXJzZSAoZGVmYXVsdCB7fSksIHNvIGV2ZXJ5IGNvbnN1bWVyIGNhbiByZWFkXG4vLyBkb2MubWV0YS5wcmludC4qIHdpdGhvdXQgYW4gdW5kZWZpbmVkIGNoZWNrOyBkb2N1bWVudHMgc3RvcmVkIGJlZm9yZSB0aGlzXG4vLyBmaWVsZCBleGlzdGVkIGdldCB0aGUgZGVmYXVsdHMgYXBwbGllZCBvbiByZWFkLiBUaGUgZGVmYXVsdHMga2VlcCB0aGVcbi8vIFN0YWdlIDExIGJhc2VsaW5lIHBhZ2UgZ2VvbWV0cnkgKHNpbmdsZSBjb2x1bW4sIDAuNWluIG1hcmdpbiwgbGV0dGVyKSBhbmRcbi8vIGFkZCB0aGUgcHJpbnQgdHlwb2dyYXBoeSBTdGFnZSAxMSBkZWxpYmVyYXRlbHkgZGVmZXJyZWQgdG8gdGhpcyBmZWF0dXJlXG4vLyAoMTFwdCBib2R5LCAxcmVtIHByb2JsZW0gc3BhY2luZykgXHUyMDE0IHNvIGEgZnJlc2hseSBwdWJsaXNoZWQgcGFnZSBwcmludHMgaW4gYVxuLy8gc2Vuc2libGUgZGVmYXVsdCBzdHlsZSwgYW5kIHRoZSB0ZWFjaGVyIHR1bmVzIGZyb20gdGhlcmUuXG5cbi8vIFByaW50SGVhZGVyOiB3aGljaCBsYWJlbGVkIGZpbGwtaW4gbGluZXMgYXBwZWFyIGF0IHRoZSB0b3Agb2YgYSBwcmludGVkXG4vLyBzaGVldC4gTmFtZSArIERhdGUgYXJlIHRoZSBuZWFyLXVuaXZlcnNhbCBwYWlyLCBzbyB0aGV5IGRlZmF1bHQgb247IHRoZVxuLy8gcmVzdCBkZWZhdWx0IG9mZi4gY3VzdG9tIGhvbGRzIGV4dHJhIHRlYWNoZXItYXV0aG9yZWQgbGFiZWxzIChlLmcuXG4vLyBcIkJsb2NrXCIsIFwiVGVhY2hlclwiKSByZW5kZXJlZCBhcyB0aGVpciBvd24gZmlsbC1pbiBsaW5lcy4gVGhlIGhlYWRlciBpc1xuLy8gcHJpbnQtb25seSBcdTIwMTQgaXQgbmV2ZXIgc2hvd3Mgb24gc2NyZWVuICh0aGUgb24tc2NyZWVuIGlkZW50aXR5IHByb21wdCBpcyB0aGVcbi8vIGxpdmUgbmFtZSBmaWVsZCk7IHNlZSByZW5kZXJQcmludEhlYWRlciArIHRoZSBAbWVkaWEgcHJpbnQgcnVsZXMuXG5leHBvcnQgY29uc3QgUHJpbnRIZWFkZXIgPSB6Lm9iamVjdCh7XG4gIG5hbWU6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbTogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbn0pO1xuZXhwb3J0IHR5cGUgUHJpbnRIZWFkZXIgPSB6LmluZmVyPHR5cGVvZiBQcmludEhlYWRlcj47XG5cbi8vIFByaW50Q29uZmlnOiB0aGUgdGVhY2hlcidzIHByaW50IHNldHRpbmdzIGZvciBhbiBhY3Rpdml0eS4gRXZlcnkgZmllbGQgaXNcbi8vIGRlZmF1bHRlZCBzbyBQcmludENvbmZpZy5wYXJzZSh7fSkgeWllbGRzIGEgY29tcGxldGUsIGJhc2VsaW5lLWVxdWl2YWxlbnRcbi8vIGNvbmZpZyBcdTIwMTQgdGhhdCBpcyB3aGF0IEFjdGl2aXR5TWV0YS5wcmludCBmYWxscyBiYWNrIHRvLlxuLy9cbi8vICAgcGFwZXJTaXplICAgICAgXHUyMDE0ICdsZXR0ZXInIHwgJ2E0Jy4gRHJpdmVzIHRoZSBAcGFnZSBzaXplIGtleXdvcmQuIERlZmF1bHRcbi8vICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgZm9yIG5vdyAoTlovQTQgaXMgYSBvbmUtbGluZSBmbGlwIGxhdGVyKTsgZW1pdHRlZFxuLy8gICAgICAgICAgICAgICAgICAgIGFzIGEgTElURVJBTCBAcGFnZSBydWxlLCBuZXZlciBhIENTUyB2YXIsIGJlY2F1c2UgQHBhZ2Vcbi8vICAgICAgICAgICAgICAgICAgICBydWxlcyBjYW5ub3QgcmVsaWFibHkgcmVhZCBjdXN0b20gcHJvcGVydGllcy5cbi8vICAgY29sdW1ucyAgICAgICAgXHUyMDE0IDEuLjMuIGNvbHVtbi1jb3VudCBpbiBwcmludDsgMSBpcyBhIG5vLW9wIChzaW5nbGUgY29sKS5cbi8vICAgICAgICAgICAgICAgICAgICBET1JNQU5UOiB0aGUgYXV0aG9yLWZhY2luZyBjb250cm9sIHdhcyByZXRpcmVkIHdoZW5cbi8vICAgICAgICAgICAgICAgICAgICBzdHJ1Y3R1cmFsIGF1dGhvcmVkIGNvbHVtbnMgKHRoZSBSb3cvQ29sdW1uIGxheW91dFxuLy8gICAgICAgICAgICAgICAgICAgIHByaW1pdGl2ZSkgbGFuZGVkIFx1MjAxNCBhIG11bHRpLWNvbHVtbiByb3cgcmVuZGVycyBjb25zaXN0ZW50bHlcbi8vICAgICAgICAgICAgICAgICAgICBvbiBzY3JlZW4sIGluIHdvcmtzaGVldCBwcmludCwgYW5kIGluc2lkZSBhIGZvbGRhYmxlLCBzb1xuLy8gICAgICAgICAgICAgICAgICAgIHRoaXMgcGVyLW1vZGUgcHJpbnQgc2V0dGluZyBiZWNhbWUgcmVkdW5kYW50LiBUaGUgZmllbGQgK1xuLy8gICAgICAgICAgICAgICAgICAgIGl0cyByZW5kZXJlciB2YXIvQ1NTIGFyZSBrZXB0IChub3QgZGVsZXRlZCkgc28gdmFsdWVzXG4vLyAgICAgICAgICAgICAgICAgICAgYWxyZWFkeSBzYXZlZCBvbiBleGlzdGluZyBhY3Rpdml0aWVzIGtlZXAgcHJpbnRpbmcgYXNcbi8vICAgICAgICAgICAgICAgICAgICBhdXRob3JlZCwgYW5kIHNvIHRoZSBjb250cm9sIGNhbiBiZSByZS1leHBvc2VkIGxhdGVyIHdpdGhcbi8vICAgICAgICAgICAgICAgICAgICBubyBzY2hlbWEvcmVuZGVyZXIgY2hhbmdlLiBOZXcgYWN0aXZpdGllcyBkZWZhdWx0IHRvIDEuXG4vLyAgIHdvcmtTcGFjZSAgICAgIFx1MjAxNCByZW0gb2YgYmxhbmsgc3BhY2UgYmVsb3cgZWFjaCBwcm9ibGVtIGZvciBoYW5kLXdvcmtpbmcuXG4vLyAgICAgICAgICAgICAgICAgICAgQWN0aXZpdHktbGV2ZWwgZGVmYXVsdDsgYSBmaWxsLWluLWJsYW5rIGJsb2NrIG1heSBvdmVycmlkZVxuLy8gICAgICAgICAgICAgICAgICAgIGl0IHBlci1wcm9ibGVtIHZpYSBGaWxsSW5CbGFua0Jsb2NrLndvcmtTcGFjZS5cbi8vICAgZm9udFNpemUgICAgICAgXHUyMDE0IHB0LiBBcHBsaWVkIHRvIC5hY3Rpdml0eS1jb250YWluZXIgaW4gcHJpbnQgb25seS5cbi8vICAgcHJvYmxlbVNwYWNpbmcgXHUyMDE0IHJlbSBvZiB2ZXJ0aWNhbCBtYXJnaW4gYXJvdW5kIGVhY2ggcHJvYmxlbSBpbiBwcmludC5cbi8vICAgbWFyZ2luICAgICAgICAgXHUyMDE0IGluY2hlcy4gVGhlIEBwYWdlIG1hcmdpbiAobGl0ZXJhbCwgbGlrZSBwYXBlclNpemUpLlxuLy8gICBncmlkTGluZXMgICAgICBcdTIwMTQgYWN0aXZpdHktd2lkZSBkZWZhdWx0IGZvciBydWxlZCByb3dzLiBBIFJvdyB3aXRoXG4vLyAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOidpbmhlcml0JyAodGhlIHBlci1yb3cgZGVmYXVsdCkgcmVzb2x2ZXMgdG8gdGhpcztcbi8vICAgICAgICAgICAgICAgICAgICAnb24nLydvZmYnIG9uIGEgcm93IG92ZXJyaWRlIGl0LiBPZmYgYnkgZGVmYXVsdCBcdTIwMTQgcnVsZWRcbi8vICAgICAgICAgICAgICAgICAgICBncmlkcyBhcmUgb3B0LWluLlxuLy8gICBwcmludFJlZmVyZW5jZVBhbmVsIFx1MjAxNCB3aGV0aGVyIHRoZSBhY3Rpdml0eSdzIHJlZmVyZW5jZSBwYW5lbCBwcmludHMgYXMgYVxuLy8gICAgICAgICAgICAgICAgICAgIGJveCBhdCB0aGUgdG9wIG9mIHRoZSB3b3Jrc2hlZXQuIE9uIGJ5IGRlZmF1bHQ7IGEgdGVhY2hlclxuLy8gICAgICAgICAgICAgICAgICAgIHdpdGggYSBjbGFzcyBzZXQgb2YgY2hhcnRzIGNhbiB0dXJuIGl0IG9mZiBzbyBpdCBpc24ndFxuLy8gICAgICAgICAgICAgICAgICAgIHJlcHJpbnRlZCBwZXIgYWN0aXZpdHkuIEdhdGVzIFBSSU5UIGFsb25lLCBhbmQgYXMgb2Zcbi8vICAgICAgICAgICAgICAgICAgICAyMDI2LTA4LTIzIHRoYXQgaXMgdHJ1ZSBhZ2FpbiByYXRoZXIgdGhhbiBtZXJlbHkgY2xhaW1lZDpcbi8vICAgICAgICAgICAgICAgICAgICB0aGUgcGFuZWwncyBTQ1JFRU4gc3VyZmFjZSBpcyBiYWNrIChhIHN1bW1vbmVkIHBhbmVsIGluXG4vLyAgICAgICAgICAgICAgICAgICAgdGhlIHZpZXdlciksIHNvIHR1cm5pbmcgdGhpcyBvZmYgbWVhbnMgc2NyZWVuLW9ubHkgaW5zdGVhZFxuLy8gICAgICAgICAgICAgICAgICAgIG9mIGludmlzaWJsZS1ldmVyeXdoZXJlLiBCZXR3ZWVuIFM5IERyb3AgNCBhbmQgdGhhdCBzbGljZVxuLy8gICAgICAgICAgICAgICAgICAgIHByaW50IFdBUyB0aGUgb25seSBzdXJmYWNlLCB3aGljaCBtYWRlIHRoaXMgZmxhZyBhIHRyYXAuXG4vLyAgICAgICAgICAgICAgICAgICAgUmVhZCBieSB0aGUgdmlld2VyJ3MgcHJpbnQgbGF5ZXI7IG5vdCBhIGNvbnRhaW5lciBDU1MgdmFyLlxuLy8gICBwcmludERlZmluaXRpb25HbG9zc2FyeSBcdTIwMTQgd2hldGhlciBpbmxpbmUgdm9jYWJ1bGFyeSBkZWZpbml0aW9ucyBwcmludCBhcyBhXG4vLyAgICAgICAgICAgICAgICAgICAgZ2xvc3NhcnkgYXBwZW5kaXggYXQgdGhlIEVORCBvZiB0aGUgd29ya3NoZWV0LiBPRkYgYnlcbi8vICAgICAgICAgICAgICAgICAgICBkZWZhdWx0LCB1bmxpa2UgcHJpbnRSZWZlcmVuY2VQYW5lbDogb24gc2NyZWVuIGEgZGVmaW5pdGlvblxuLy8gICAgICAgICAgICAgICAgICAgIGlzIGEgcG9wb3ZlciBhIHN0dWRlbnQgb3BlbnMgb24gZGVtYW5kLCBhbmQgbW9zdCBhcmUgYVxuLy8gICAgICAgICAgICAgICAgICAgIHNob3J0IGdsb3NzIHRoYXQgd291bGQgb25seSBwYWQgdGhlIHByaW50b3V0LiBBIHRlYWNoZXIgd2hvXG4vLyAgICAgICAgICAgICAgICAgICAgaGFzIHB1dCBhIGZvcm11bGEgb3IgYSBkaWFncmFtIGluIGEgZGVmaW5pdGlvbiB0dXJucyB0aGlzXG4vLyAgICAgICAgICAgICAgICAgICAgb24gc28gaXQgc3Vydml2ZXMgb24gcGFwZXIgKGRlZmluaXRpb24gcG9wb3ZlcnMgYXJlXG4vLyAgICAgICAgICAgICAgICAgICAgZGlzcGxheTpub25lIGluIHByaW50KS4gUmVhZCBieSB0aGUgcmVuZGVyZXIgdG8gZGVjaWRlXG4vLyAgICAgICAgICAgICAgICAgICAgd2hldGhlciB0byBlbWl0IHRoZSBhcHBlbmRpeDsgbm90IGEgY29udGFpbmVyIENTUyB2YXIuXG4vLyAgIGhlYWRlciAgICAgICAgIFx1MjAxNCBzZWUgUHJpbnRIZWFkZXIuXG4vL1xuLy8gY29sdW1ucy93b3JrU3BhY2UvZm9udFNpemUvcHJvYmxlbVNwYWNpbmcgcmlkZSBhcyAtLXByaW50LSogQ1NTIHZhcnMgb24gdGhlXG4vLyBjb250YWluZXIgKG5vcm1hbCBzZWxlY3RvcnMgY2FuIHJlYWQgdGhlbSk7IHBhcGVyU2l6ZS9tYXJnaW4gYXJlIGVtaXR0ZWQgYXNcbi8vIGEgcGVyLWRvY3VtZW50IGxpdGVyYWwgQHBhZ2UgcnVsZS4gZ3JpZExpbmVzIGlzIG5vdCBhIGNvbnRhaW5lciB2YXIgXHUyMDE0IGl0IGlzXG4vLyByZXNvbHZlZCBwZXIgcm93IGF0IHJlbmRlciB0aW1lIChzZWUgcmVuZGVyUm93KS5cbmV4cG9ydCBjb25zdCBQcmludENvbmZpZyA9IHoub2JqZWN0KHtcbiAgcGFwZXJTaXplOiB6LmVudW0oWydsZXR0ZXInLCAnYTQnXSkuZGVmYXVsdCgnbGV0dGVyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uczogei5udW1iZXIoKS5pbnQoKS5taW4oMSkubWF4KDMpLmRlZmF1bHQoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya1NwYWNlOiB6Lm51bWJlcigpLm1pbigwKS5kZWZhdWx0KDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkuZGVmYXVsdCgxMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvYmxlbVNwYWNpbmc6IHoubnVtYmVyKCkubWluKDApLmRlZmF1bHQoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiB6Lm51bWJlcigpLm1pbigwKS5kZWZhdWx0KDAuNSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmludFJlZmVyZW5jZVBhbmVsOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaW50RGVmaW5pdGlvbkdsb3NzYXJ5OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXI6IFByaW50SGVhZGVyLmRlZmF1bHQoe30pLFxufSk7XG5leHBvcnQgdHlwZSBQcmludENvbmZpZyA9IHouaW5mZXI8dHlwZW9mIFByaW50Q29uZmlnPjtcblxuLy8gVHlwb2dyYXBoeTogdGhlIGFjdGl2aXR5LXdpZGUgZm9udCArIGJhc2UgYm9keSBzaXplIChhdXRob3ItYXBwcm92ZWRcbi8vIDIwMjYtMDctMDgpLiBPTkUgZm9udCBhbmQgT05FIGJhc2Ugc2l6ZSBmb3IgdGhlIHdob2xlIGFjdGl2aXR5IFx1MjAxNCBwdWJsaXNoZWRcbi8vIHBhZ2UsIGVkaXRvciBjYW52YXMsIGFuZCBwcmludCB2aWV3IGFsbCByZWFkIHRoZSBzYW1lIGNvbmZpZyBzbyBhdXRob3JpbmcgaXNcbi8vIFdZU0lXWUcuIE9wdGlvbmFsIGFuZCBhZGRpdGl2ZTogZG9jdW1lbnRzIHN0b3JlZCBiZWZvcmUgdGhpcyBmaWVsZCBleGlzdGVkXG4vLyBwYXJzZSB1bmNoYW5nZWQgKG5vIHNjaGVtYVZlcnNpb24gYnVtcCksIGFuZCB0aGUgZWRpdG9yIG9taXRzIHRoZSBmaWVsZFxuLy8gZW50aXJlbHkgd2hpbGUgaXQgaG9sZHMgdGhlIGRlZmF1bHRzIHNvIHVudG91Y2hlZCBkb2N1bWVudHMgc3RheVxuLy8gc3RydWN0dXJhbGx5IGlkZW50aWNhbC5cbi8vXG4vLyAgIGZvbnQgICAgIFx1MjAxNCBhbiBpZCBpbnRvIHRoZSByZW5kZXJlcidzIEZPTlRfUkVHSVNUUlkgKHRoZSBDU1Mgc3BlY2lmaWNzIFx1MjAxNFxuLy8gICAgICAgICAgICAgIGZhbWlseSBuYW1lLCBmYWxsYmFjayBzdGFjaywgV09GRjIgZmlsZXMgXHUyMDE0IGxpdmUgcmVuZGVyZXItc2lkZTtcbi8vICAgICAgICAgICAgICB0aGUgc2NoZW1hIG9ubHkgY29uc3RyYWlucyB0aGUgbWVudSkuICdkZWZhdWx0JyA9IHRoZSBjdXJyZW50XG4vLyAgICAgICAgICAgICAgc3lzdGVtIHN0YWNrLCBubyBmb250IGRvd25sb2FkLiBUaGUgb3RoZXIgZm91ciBhcmUgU0lMIE9GTFxuLy8gICAgICAgICAgICAgIGZhY2VzIHNlbGYtaG9zdGVkIGFzIFdPRkYyIG9uIFIyIChubyBHb29nbGUgQ0ROIGRlcGVuZGVuY3kgb25cbi8vICAgICAgICAgICAgICBwdWJsaXNoZWQgcGFnZXMpLlxuLy8gICBmb250U2l6ZSBcdTIwMTQgYmFzZSBCT0RZIHNpemUgaW4gcHgsIGFwcGxpZWQgb24gc2NyZWVuIHZpYVxuLy8gICAgICAgICAgICAgIC0tYWN0aXZpdHktZm9udC1zaXplLiBQcmludCBib2R5IHNpemluZyBzdGF5cyBvd25lZCBieVxuLy8gICAgICAgICAgICAgIG1ldGEucHJpbnQuZm9udFNpemUgKHB0KSBcdTIwMTQgdGhlIEBtZWRpYSBwcmludCBydWxlIG92ZXJyaWRlcyB0aGVcbi8vICAgICAgICAgICAgICBzY3JlZW4gc2l6ZSwgc28gdGhlIHR3byBuZXZlciBmaWdodC4gSGVhZGluZ3MgYXJlIGVtLXJlbGF0aXZlXG4vLyAgICAgICAgICAgICAgYW5kIHNjYWxlIG9mZiB3aGljaGV2ZXIgYmFzZSBpcyBpbiBlZmZlY3QuXG4vL1xuLy8gUGVyLXNwYW4gZm9udC9zaXplIG1hcmtzIGFyZSBQQVJLRUQgYnV0IGRlc2lnbmVkIGZvcjogdGhpcyBhY3Rpdml0eS13aWRlXG4vLyBsYXllciBvbmx5IHNldHMgQ1NTIHZhcnMgKyBAZm9udC1mYWNlLCBzbyBhIGZ1dHVyZSBgdGV4dFN0eWxlYCBtYXJrIGNhblxuLy8gc2xvdCBpbiBhZGRpdGl2ZWx5IChzcGFuLWxldmVsIGlubGluZSBzdHlsZXMgd2luIHRoZSBjYXNjYWRlOyB0aGVcbi8vIHJlbmRlcmVyJ3MgZm9udEZhY2VDc3MgYWxyZWFkeSB0YWtlcyBhIExJU1Qgb2YgZmFtaWxpZXMgdG8gZW1iZWQpLlxuZXhwb3J0IGNvbnN0IEFjdGl2aXR5Rm9udCA9IHouZW51bShbXG4gICdkZWZhdWx0JyxcbiAgJ2xleGVuZCcsXG4gICdhdGtpbnNvbi1oeXBlcmxlZ2libGUnLFxuICAnYW5kaWthJyxcbiAgJ2NvbWljLW5ldWUnLFxuXSk7XG5leHBvcnQgdHlwZSBBY3Rpdml0eUZvbnQgPSB6LmluZmVyPHR5cGVvZiBBY3Rpdml0eUZvbnQ+O1xuXG5leHBvcnQgY29uc3QgVHlwb2dyYXBoeSA9IHoub2JqZWN0KHtcbiAgZm9udDogQWN0aXZpdHlGb250LmRlZmF1bHQoJ2RlZmF1bHQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogei5udW1iZXIoKS5taW4oMTIpLm1heCgyNCkuZGVmYXVsdCgxNiksXG59KTtcbmV4cG9ydCB0eXBlIFR5cG9ncmFwaHkgPSB6LmluZmVyPHR5cGVvZiBUeXBvZ3JhcGh5PjtcblxuZXhwb3J0IGNvbnN0IEFjdGl2aXR5TWV0YSA9IHoub2JqZWN0KHtcbiAgdGl0bGU6IHouc3RyaW5nKCkubWluKDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC5taW4oMSk6IGNvdXJzZSBpcyBzdGFtcGVkIGludG8gdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWN0aXZpdGllcy5jb3Vyc2UgY29sdW1uIGF0IHB1Ymxpc2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAoMDAzNywgdGF4b25vbXkgUjEpIHdoZXJlIGl0IGlzIGBub3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBudWxsYCBcdTIwMTQgYSBibGFuayBjb3Vyc2Ugd291bGQgcHVibGlzaCBhblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtcHR5IGZhY2V0IGludG8gdGhlIGNhdGFsb2cuIFRoZSBlZGl0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmYWxscyBiYWNrIHRvIHRoZSBkZWZhdWx0IHJhdGhlciB0aGFuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXZlciBzZW5kaW5nIGEgYmxhbmsgKEFjdGl2aXR5RWRpdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2F2ZSgpLCBzYW1lIGd1YXJkIHRpdGxlIGFscmVhZHkgaGFzKS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3Vyc2U6IHouc3RyaW5nKCkubWluKDEpLmRlZmF1bHQoJ0FsZ2VicmEgSUknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml0OiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWlzc2lvbk1vZGU6IHouZW51bShbJ3NpbmdsZScsICdsb2NrZWQnLCAnZnJlZSddKS5kZWZhdWx0KCdmcmVlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZpdHlUeXBlOiB6LmVudW0oWyd3b3Jrc2hlZXQnLCAnZXhpdF90aWNrZXQnLCAnd2FybV91cCcsICdyZXZpZXcnXSkuZGVmYXVsdCgnd29ya3NoZWV0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyRmVlZGJhY2s6IHouZW51bShbJ2ltbWVkaWF0ZScsICdvbl9jaGVjayddKS5kZWZhdWx0KCdvbl9jaGVjaycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmludDogUHJpbnRDb25maWcuZGVmYXVsdCh7fSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwb2dyYXBoeTogVHlwb2dyYXBoeS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBBY3Rpdml0eU1ldGEgPSB6LmluZmVyPHR5cGVvZiBBY3Rpdml0eU1ldGE+O1xuXG4vLyBUaGUgdG9wLWxldmVsIGRvY3VtZW50LiBBbHdheXMgdmFsaWRhdGUgdXNlci1mYWNpbmcgaW5wdXQgdGhyb3VnaCB0aGlzXG4vLyBiZWZvcmUgc3RvcmluZy4gVGhlIEVkZ2UgRnVuY3Rpb25zIHBhcnNlIGluY29taW5nIGRyYWZ0cyB3aXRoIHRoaXMgc2NoZW1hXG4vLyBhbmQgcmVqZWN0IG1hbGZvcm1lZCBkb2N1bWVudHMgd2l0aCBhIDQwMC5cbi8vIFJlZmVyZW5jZVBhbmVsOiBvcHRpb25hbCBzdGlja3ktc2lkZWJhciBjb250ZW50IHN0dWRlbnRzIGNvbnN1bHQgd2hpbGVcbi8vIHdvcmtpbmcgXHUyMDE0IGZvcm11bGEgY2hhcnRzLCBwZXJpb2RpYyB0YWJsZXMsIHZvY2FidWxhcnkgbGlzdHMsIGNvbnZlcnNpb25cbi8vIHRhYmxlcywgdW5pdC1jaXJjbGUgZGlhZ3JhbXMsIHNlbnRlbmNlLXN0ZW0gcHJvbXB0cywgZm9yZWlnbi1sYW5ndWFnZVxuLy8gdmVyYiB0YWJsZXMsIHByaW1hcnktc291cmNlIGV4Y2VycHRzLCBtYXBzLiBUaGUgYmxvY2tzIGFycmF5IHVzZXMgdGhlXG4vLyBzYW1lIEJsb2NrIHNjaGVtYSBhcyBzZWN0aW9uIGNvbnRlbnQ7IG5vIG5ldyBibG9jayB0eXBlcyBhcmUgbmVlZGVkXG4vLyBmb3IgdGhlIHBhbmVsLlxuLy9cbi8vIFBoYXNlIDE6IHRoZSBzY2hlbWEgYWNjZXB0cyB0aGUgZmllbGQgYXMgZm9yd2FyZC1jb21wYXQ7IHRoZSBlZGl0b3Jcbi8vIGRvZXNuJ3Qgc3VyZmFjZSBpdCwgYW5kIHRoZSByZW5kZXJlciBpZ25vcmVzIGl0LiBQaGFzZSAyIHdpcmVzIHVwIHRoZVxuLy8gYXV0aG9yaW5nIFVJIGFuZCB0aGUgc2lkZWJhciBsYXlvdXQgaW4gcHVibGlzaGVkIEhUTUwuIEZpZWxkIGlzXG4vLyBvcHRpb25hbCB3aXRoIG5vIGRlZmF1bHQgb24gQWN0aXZpdHlEb2N1bWVudCwgc28gZXhpc3Rpbmcgc3RvcmVkXG4vLyBkb2N1bWVudHMgcGFyc2UgY2xlYW5seS5cbi8vXG4vLyBSZW5kZXJlciB3aWxsIHRyZWF0IHJlZmVyZW5jZSBjb250ZW50IGFzIGRhdGEtYmxvY2stY2F0ZWdvcnk9XCJzY2FmZm9sZFwiXG4vLyAoUGhhc2UgMispIFx1MjAxNCBkb2Vzbid0IGNvbnRyaWJ1dGUgdG8gc2NvcmluZyBvciBjaGVja3BvaW50IGJlaGF2aW9yLlxuZXhwb3J0IGNvbnN0IFJlZmVyZW5jZVBhbmVsID0gei5vYmplY3Qoe1xuICB0aXRsZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tzOiB6LmFycmF5KEJsb2NrKSxcbn0pO1xuZXhwb3J0IHR5cGUgUmVmZXJlbmNlUGFuZWwgPSB6LmluZmVyPHR5cGVvZiBSZWZlcmVuY2VQYW5lbD47XG5cbi8vIENhbGN1bGF0b3IgdG9vbDogYW4gYWN0aXZpdHktbGV2ZWwgc2NhZmZvbGQsIGEgc2libGluZyB0byB0aGUgcmVmZXJlbmNlXG4vLyBwYW5lbCBcdTIwMTQgYSB0ZWFjaGVyLWNvbmZpZ3VyYWJsZSBvbi1zY3JlZW4gY2FsY3VsYXRvciBhIHN0dWRlbnQgc3VtbW9ucyB3aGlsZVxuLy8gd29ya2luZyAobGlrZSB0aGUgY2FsY3VsYXRvciBhbGxvd2VkIG9uIGEgZGlnaXRhbCBTQVQpLiBJdCBpcyBORVZFUiBzY29yZWQsXG4vLyBwcm9kdWNlcyBubyBzdWJtaXNzaW9uLCBhbmQgY2FycmllcyBubyBhbnN3ZXIga2V5OyB0aGUgcmVuZGVyZXIgdHJlYXRzIGl0IGFzXG4vLyBkYXRhLWJsb2NrLWNhdGVnb3J5PVwic2NhZmZvbGRcIiAob3V0c2lkZSBhbnkgLmFjdGl2aXR5LXNlY3Rpb24sIHNvIHRoZSBzY29yaW5nXG4vLyBydW50aW1lIG5ldmVyIHNlZXMgaXQpLiBJdCB0cmF2ZWxzIGluIHRoZSB3aXJlIGZvcm1hdCwgY29uZmlndXJlZCBvbmNlIHBlclxuLy8gYWN0aXZpdHksIGFuZCBpcyBvcHRpb25hbCBzbyBleGlzdGluZyBzdG9yZWQgZG9jdW1lbnRzIHBhcnNlIHVuY2hhbmdlZCBcdTIwMTQgbm9cbi8vIHNjaGVtYVZlcnNpb24gYnVtcCAoc2FtZSBmb3J3YXJkLWNvbXBhdCBzdG9yeSBhcyByZWZlcmVuY2VQYW5lbC9wcmludCkuXG4vL1xuLy8gUmVzdHJpY3Rpb25zIGFyZSBQRVJNSVNTSVZFIGJ5IGRlZmF1bHQ6IGFuIGVuYWJsZWQtYnV0LXVuY29uZmlndXJlZFxuLy8gY2FsY3VsYXRvciBpcyBhIGZ1bGwgdG9vbDsgdGVhY2hlcnMgb3B0IElOVE8gcmVzdHJpY3Rpb25zLCBuZXZlciBvdXQgb2Zcbi8vIGNhcGFiaWxpdHkuIExhdGVyIGZsYWdzIChsb2NrVmlld3BvcnQsIGFsbG93ZWRSZWdyZXNzaW9uTW9kZWxzLFxuLy8gbWF4RXhwcmVzc2lvbnNcdTIwMjYpIGFyZSBhZGRlZCBhZGRpdGl2ZWx5IGFzIGdyYXBoaW5nLXRyYWNrIHN0YWdlcyBsYW5kIFx1MjAxNCBhbGxcbi8vIG9wdGlvbmFsL2RlZmF1bHRlZCwgc28gc3RpbGwgbm8gc2NoZW1hVmVyc2lvbiBidW1wLlxuLy9cbi8vIGBtb2RlYCBpcyB0aGUgY2FwYWJpbGl0eSBjZWlsaW5nLiBUaGUgZW51bSBjYXJyaWVzIHRoZSBmdWxsIGNvbnRyYWN0IG5vdywgYnV0XG4vLyB0aGUgZGVmYXVsdCBpcyAnc2NpZW50aWZpYycgYmVjYXVzZSB0aGF0IGlzIHRoZSBvbmx5IGNhcGFiaWxpdHkgU3RhZ2UgMVxuLy8gaW1wbGVtZW50cyBcdTIwMTQgYW4gZW5hYmxlZCBjYWxjdWxhdG9yIGRvZXMgZXhhY3RseSB3aGF0IGlzIGJ1aWx0LiBUaGUgZGVmYXVsdFxuLy8gbWF5IGZsaXAgdG8gJ2dyYXBoaW5nJyBvbmNlIHRoZSBib2FyZCBsYXllciBsYW5kcyAoU3RhZ2UgMikuXG4vLyBTdGFnZSAzOiB3aGljaCBmaXQgbW9kZWxzIHRoZSBncmFwaGluZyBjYWxjdWxhdG9yJ3MgZGF0YS9yZWdyZXNzaW9uIHBhbmVsXG4vLyBvZmZlcnMuIFBlcm1pc3NpdmUgZGVmYXVsdCAoYWxsIHRocmVlKTsgYW4gRU1QVFkgYXJyYXkgdHVybnMgcmVncmVzc2lvbiBvZmZcbi8vIGVudGlyZWx5IChubyBkYXRhIHBhbmVsKS4gT25seSBtZWFuaW5nZnVsIHVuZGVyIG1vZGUgJ2dyYXBoaW5nJyBcdTIwMTQgdGhlXG4vLyAnc2NpZW50aWZpYycgY2VpbGluZyBhbHJlYWR5IGV4Y2x1ZGVzIHRoZSBib2FyZCB0aGUgZml0cyBkcmF3IG9uLlxuLy8gJ2xvZ2FyaXRobWljJyBqb2luZWQgMjAyNi0wNy0xMSAoY2FsY3VsYXRvci1wYXJpdHkgYmF0Y2gpOiB0aGUga2l0IGNvbXB1dGVkXG4vLyBsb2cgZml0cyBhbGwgYWxvbmc7IHRoZSBlbnVtIHdhcyB0aGUgb25seSBnYXAuIE5PVEUgYSBzdG9yZWQgZG9jIHRoYXQgY2Fycmllc1xuLy8gdGhlIGV4cGxpY2l0IHRocmVlLW1vZGVsIGFycmF5IHN0YXlzIHRocmVlLW1vZGVsIChpbmRpc3Rpbmd1aXNoYWJsZSBmcm9tIGFcbi8vIGRlbGliZXJhdGUgcmVzdHJpY3Rpb24pIHVudGlsIHRoZSB0ZWFjaGVyIHRvdWNoZXMgdGhlIGNvbmZpZyBcdTIwMTQgYWNjZXB0ZWQgYXRcbi8vIHRoZSBkZXNpZ24gcGFzczsgdGhlIHBlcm1pc3NpdmUgZGVmYXVsdCBvbmx5IGFwcGxpZXMgd2hlbiB0aGUgZmllbGQgaXMgYWJzZW50LlxuZXhwb3J0IGNvbnN0IFJlZ3Jlc3Npb25Nb2RlbCA9IHouZW51bShbXG4gICdsaW5lYXInLFxuICAncXVhZHJhdGljJyxcbiAgJ2V4cG9uZW50aWFsJyxcbiAgJ2xvZ2FyaXRobWljJyxcbl0pO1xuZXhwb3J0IHR5cGUgUmVncmVzc2lvbk1vZGVsID0gei5pbmZlcjx0eXBlb2YgUmVncmVzc2lvbk1vZGVsPjtcblxuZXhwb3J0IGNvbnN0IENhbGN1bGF0b3JSZXN0cmljdGlvbnMgPSB6Lm9iamVjdCh7XG4gIG1vZGU6IHouZW51bShbJ3NjaWVudGlmaWMnLCAnZ3JhcGhpbmcnXSkuZGVmYXVsdCgnc2NpZW50aWZpYycpLFxuICBhbGxvd1RyaWc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gIGFsbG93TG9nRXhwOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAvLyBJbmVxdWFsaXR5IHJvd3MgaW4gdGhlIGdyYXBoaW5nIGV4cHJlc3Npb24gbGlzdCAoY2FsY3VsYXRvci1wYXJpdHkgYmF0Y2gpLlxuICAvLyBBZGRpdGl2ZSArIGRlZmF1bHRlZCBsaWtlIHRoZSBvdGhlciBnYXRlcyBcdTIwMTQgbm8gc2NoZW1hVmVyc2lvbiBidW1wOyB0aGUga2l0XG4gIC8vIHJlYWRzIGEgbWlzc2luZyB2YWx1ZSBhcyBwZXJtaXNzaXZlLCBzbyBvbGQgcHVibGlzaGVkIHBhZ2VzIHN0YXkgZnVsbC10b29sLlxuICBhbGxvd0luZXF1YWxpdGllczogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgYWxsb3dlZFJlZ3Jlc3Npb25Nb2RlbHM6IHpcbiAgICAuYXJyYXkoUmVncmVzc2lvbk1vZGVsKVxuICAgIC5kZWZhdWx0KFsnbGluZWFyJywgJ3F1YWRyYXRpYycsICdleHBvbmVudGlhbCcsICdsb2dhcml0aG1pYyddKSxcbiAgLy8gU3RhZ2UgNDogY2FwIG9uIHRoZSBncmFwaGluZyBleHByZXNzaW9uIGxpc3QuIEFCU0VOVCA9IHVubGltaXRlZCAodGhlXG4gIC8vIHBlcm1pc3NpdmUgZGVmYXVsdCBcdTIwMTQgb3B0aW9uYWwsIG5vdCBkZWZhdWx0ZWQsIHNvIGl0IHN0YXlzIG91dCBvZiBzdG9yZWRcbiAgLy8gZG9jcyB1bmxlc3MgYSB0ZWFjaGVyIHNldHMgaXQpLiBHcmFwaGluZyBtb2RlIG9ubHkuXG4gIG1heEV4cHJlc3Npb25zOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoNTApLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIENhbGN1bGF0b3JSZXN0cmljdGlvbnMgPSB6LmluZmVyPHR5cGVvZiBDYWxjdWxhdG9yUmVzdHJpY3Rpb25zPjtcblxuZXhwb3J0IGNvbnN0IENhbGN1bGF0b3JUb29sID0gei5vYmplY3Qoe1xuICBlbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgcmVzdHJpY3Rpb25zOiBDYWxjdWxhdG9yUmVzdHJpY3Rpb25zLmRlZmF1bHQoe30pLFxufSk7XG5leHBvcnQgdHlwZSBDYWxjdWxhdG9yVG9vbCA9IHouaW5mZXI8dHlwZW9mIENhbGN1bGF0b3JUb29sPjtcblxuLy8gVGhlIGV4cGxpY2l0IHR5cGUgKyB6LlpvZFR5cGUgYW5ub3RhdGlvbiAoaW5zdGVhZCBvZiB6LmluZmVyKSBleGlzdHMgYmVjYXVzZVxuLy8gdGhlIGZ1bGx5IGluZmVycmVkIGRvY3VtZW50IHR5cGUgb3V0Z3JldyB0c2MncyBkZWNsYXJhdGlvbi1zZXJpYWxpemF0aW9uXG4vLyBsaW1pdCAoVFM3MDU2KSB3aGVuIHRoZSBCbG9jayB1bmlvbiByZWFjaGVkIDE0IG1lbWJlcnMuIFN0cnVjdHVyYWxseVxuLy8gaWRlbnRpY2FsIHRvIHdoYXQgaW5mZXJlbmNlIHByb2R1Y2VkOyBub3RoaW5nIGhlcmUgbG9zZXMgdHlwZSBzYWZldHkgXHUyMDE0XG4vLyB0aGUgYW5ub3RhdGlvbiBpcyBjaGVja2VkIGFnYWluc3QgdGhlIG9iamVjdCBzY2hlbWEuXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2aXR5RG9jdW1lbnQge1xuICBzY2hlbWFWZXJzaW9uOiAyO1xuICBtZXRhOiBBY3Rpdml0eU1ldGE7XG4gIHNlY3Rpb25zOiBTZWN0aW9uW107XG4gIHJlZmVyZW5jZVBhbmVsPzogUmVmZXJlbmNlUGFuZWw7XG4gIGNhbGN1bGF0b3I/OiBDYWxjdWxhdG9yVG9vbDtcbn1cbmV4cG9ydCBjb25zdCBBY3Rpdml0eURvY3VtZW50OiB6LlpvZFR5cGU8QWN0aXZpdHlEb2N1bWVudCwgei5ab2RUeXBlRGVmLCB1bmtub3duPiA9XG4gIHoub2JqZWN0KHtcbiAgICBzY2hlbWFWZXJzaW9uOiB6LmxpdGVyYWwoMiksXG4gICAgbWV0YTogQWN0aXZpdHlNZXRhLFxuICAgIHNlY3Rpb25zOiB6LmFycmF5KFNlY3Rpb24pLFxuICAgIHJlZmVyZW5jZVBhbmVsOiBSZWZlcmVuY2VQYW5lbC5vcHRpb25hbCgpLFxuICAgIGNhbGN1bGF0b3I6IENhbGN1bGF0b3JUb29sLm9wdGlvbmFsKCksXG4gIH0pO1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyB1cGdyYWRlLnRzIFx1MjAxNCBzZXJ2ZXItc2lkZSB1cGdyYWRlLW9uLXJlYWQgKGNvbXBvbmVudHMtYXMtZGF0YSBydWxpbmcgNEEpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHJlYWQgQVBJIChTMikgdXBncmFkZXMgZXZlcnkgc3RvcmVkIGFjdGl2aXR5X3ZlcnNpb25zLmNvbnRlbnQgdG8gdGhlXG4vLyBDVVJSRU5UIHNjaGVtYSBiZWZvcmUgc2FuaXRpemluZyBhbmQgc2VydmluZyBpdCwgc28gdGhlIHZpZXdlciBvbmx5IGV2ZXJcbi8vIHNlZXMgdGhlIGxhdGVzdCBzaGFwZS4gVGhpcyBtb2R1bGUgaXMgdGhhdCBzZWFtLlxuLy9cbi8vIFRoZSBjaGFpbiBpcyBFTVBUWSB0b2RheSwgZGVsaWJlcmF0ZWx5OiBzY2hlbWFWZXJzaW9uIGlzIDIgYW5kIHRoZSAxXHUyMTkyMlxuLy8gcmVzaGFwZSB3YXMgYSBncmVlbmZpZWxkIGhhcmQtY3V0IHdpdGggbm8gbWlncmF0ZSBwYXRoIChkb2N1bWVudC50cyBoZWFkZXIgXHUyMDE0XG4vLyBhIHN0cmF5IHYxIGZhaWxzIGxvdWRseSByYXRoZXIgdGhhbiBtaXMtcGFyc2luZykuIFdoZW4gc2NoZW1hVmVyc2lvbiAzXG4vLyBsYW5kcywgaXRzIG1pZ3JhdGlvbiBpcyBvbmUgcHVyZSBlbnRyeSBpbiBVUEdSQURFUyBiZWxvdzsgc3RvcmVkIHJvd3Mgc3RheVxuLy8gYXQgdGhlaXIgb3JpZ2luYWwgdmVyc2lvbiBmb3JldmVyIGFuZCBhcmUgdXBncmFkZWQgb24gcmVhZCwgbmV2ZXIgbXV0YXRlZC5cbi8vXG4vLyBEaXN0aW5jdCBmcm9tIHRoZSB0d28gb3RoZXIgXCJ1cGdyYWRlXCIgbGF5ZXJzLCBvbiBwdXJwb3NlOlxuLy8gICAtIE1hcmsvZGVmaW5pdGlvbiBsZWdhY3kgcHJlcHJvY2Vzc2luZyAoaW5saW5lLnRzKSBydW5zIElOU0lERVxuLy8gICAgIEFjdGl2aXR5RG9jdW1lbnQucGFyc2UgXHUyMDE0IGFkZGl0aXZlIHNoYXBlIGRyaWZ0IHdpdGhpbiBvbmUgc2NoZW1hVmVyc2lvbi5cbi8vICAgLSBtaWdyYXRlU3VibWlzc2lvblJlc3BvbnNlcyAoc3VibWlzc2lvbi50cykgaXMgdGhlIFNVQk1JU1NJT04gd2lyZSdzXG4vLyAgICAgbGFkZGVyIFx1MjAxNCBhIGRpZmZlcmVudCBkb2N1bWVudCB3aXRoIGl0cyBvd24gdmVyc2lvbmluZy5cbi8vIFRoaXMgbW9kdWxlIG93bnMgb25seSB0aGUgdG9wLWxldmVsIEFjdGl2aXR5RG9jdW1lbnQgc2NoZW1hVmVyc2lvbi5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IEFjdGl2aXR5RG9jdW1lbnQgfSBmcm9tICcuL2RvY3VtZW50LmpzJztcblxuLyoqIFRoZSBzY2hlbWFWZXJzaW9uIHRoaXMgYnVpbGQgcGFyc2VzIGFuZCBzZXJ2ZXMuIEd1YXJkLXRlc3RlZCBhZ2FpbnN0IHRoZVxuICogQWN0aXZpdHlEb2N1bWVudCBsaXRlcmFsIHNvIHRoZSBjb25zdGFudCBjYW4ndCBkcmlmdCBmcm9tIHRoZSBwYXJzZXIuICovXG5leHBvcnQgY29uc3QgQUNUSVZJVFlfU0NIRU1BX1ZFUlNJT04gPSAyO1xuXG4vKiogVGhyb3duIHdoZW4gc3RvcmVkIGNvbnRlbnQgY2Fubm90IGJlIGJyb3VnaHQgdG8gdGhlIGN1cnJlbnQgc2NoZW1hLiBUaGVcbiAqIHJlYWQgQVBJIG1hcHMgdGhpcyB0byBhbiBleHBsaWNpdCBlcnJvciBzdGF0ZSAoZmFpbHVyZS1tb2RlcyB0YWJsZTogXCJ1cGdyYWRlXG4gKiBjaGFpbiBidWcgb24gb2xkIHZlcnNpb25cIiBcdTIxOTIgY2xlYXIgZXJyb3IsIG5ldmVyIGEgd2hpdGUgc2NyZWVuKS4gKi9cbmV4cG9ydCBjbGFzcyBVcGdyYWRlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAvKiogVGhlIHNjaGVtYVZlcnNpb24gdGhlIHN0b3JlZCBkb2N1bWVudCBjbGFpbWVkLCB3aGVuIHJlYWRhYmxlLiAqL1xuICAgIHJlYWRvbmx5IHN0b3JlZFZlcnNpb24/OiBudW1iZXIsXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9ICdVcGdyYWRlRXJyb3InO1xuICB9XG59XG5cbi8qKiBPbmUgc3RlcCBvZiB0aGUgY2hhaW46IGEgUFVSRSBqc29uIFx1MjE5MiBqc29uIHJld3JpdGUgZnJvbSBgZnJvbWAgdG8gYGZyb20rMWAuXG4gKiBObyBJL08sIG5vIHJhbmRvbW5lc3MsIG5vIERhdGUgXHUyMDE0IHVwZ3JhZGluZyB0aGUgc2FtZSBzdG9yZWQgcm93IHR3aWNlIG11c3RcbiAqIHlpZWxkIGlkZW50aWNhbCBvdXRwdXQgKHRoZSBwZXItdmVyc2lvbiByZWFkIGNhY2hlIGRlcGVuZHMgb24gaXQpLiAqL1xuaW50ZXJmYWNlIFVwZ3JhZGVTdGVwIHtcbiAgcmVhZG9ubHkgZnJvbTogbnVtYmVyO1xuICByZWFkb25seSBydW46IChyYXc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuLy8gVGhlIGNoYWluLiBBcHBlbmQtb25seTsgZWFjaCBlbnRyeSBidW1wcyBleGFjdGx5IG9uZSB2ZXJzaW9uLiBFbXB0eSB0b2RheSBcdTIwMTRcbi8vIHNlZSB0aGUgaGVhZGVyIGZvciB3aHkgdjEgZGVsaWJlcmF0ZWx5IGhhcyBubyBlbnRyeS5cbmNvbnN0IFVQR1JBREVTOiByZWFkb25seSBVcGdyYWRlU3RlcFtdID0gW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgVXBncmFkZVJlc3VsdCB7XG4gIC8qKiBUaGUgZG9jdW1lbnQsIHBhcnNlZCBhbmQgdmFsaWRhdGVkIGF0IHRoZSBDVVJSRU5UIHNjaGVtYS4gKi9cbiAgZG9jOiBBY3Rpdml0eURvY3VtZW50O1xuICAvKiogVGhlIHNjaGVtYVZlcnNpb24gdGhlIHN0b3JlZCBjb250ZW50IGFycml2ZWQgYXQgKD09PSBjdXJyZW50IHdoZW4gbm9cbiAgICogY2hhaW4gc3RlcCByYW4pLiBDYWxsZXJzIG1heSBsb2cgaXQ7IHRoZSBjYWNoZSBzdG9yZXMgdGhlIHRhcmdldC4gKi9cbiAgZnJvbVNjaGVtYVZlcnNpb246IG51bWJlcjtcbn1cblxuLyoqXG4gKiBCcmluZyByYXcgc3RvcmVkIGNvbnRlbnQgKGFjdGl2aXR5X3ZlcnNpb25zLmNvbnRlbnQpIHRvIHRoZSBjdXJyZW50IHNjaGVtYVxuICogYW5kIHZhbGlkYXRlIGl0LiBUaHJvd3MgVXBncmFkZUVycm9yIG9uIGFueSBjb250ZW50IHRoaXMgYnVpbGQgY2Fubm90IHNlcnZlXG4gKiBcdTIwMTQgYW4gdW5rbm93bi9mdXR1cmUgdmVyc2lvbiwgYSB2ZXJzaW9uIHdpdGggbm8gY2hhaW4gcGF0aCwgb3IgY29udGVudCB0aGF0XG4gKiBmYWlscyB2YWxpZGF0aW9uIGFmdGVyIHVwZ3JhZGluZy4gTmV2ZXIgcmV0dXJucyBhIHBhcnRpYWxseS11cGdyYWRlZCBkb2MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGdyYWRlQWN0aXZpdHlEb2N1bWVudChyYXc6IHVua25vd24pOiBVcGdyYWRlUmVzdWx0IHtcbiAgaWYgKHJhdyA9PT0gbnVsbCB8fCB0eXBlb2YgcmF3ICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHJhdykpIHtcbiAgICB0aHJvdyBuZXcgVXBncmFkZUVycm9yKCdTdG9yZWQgY29udGVudCBpcyBub3QgYW4gb2JqZWN0Jyk7XG4gIH1cbiAgY29uc3Qgc3RvcmVkID0gcmF3IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBjb25zdCB2ZXJzaW9uID0gc3RvcmVkLnNjaGVtYVZlcnNpb247XG4gIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIodmVyc2lvbikpIHtcbiAgICB0aHJvdyBuZXcgVXBncmFkZUVycm9yKCdTdG9yZWQgY29udGVudCBoYXMgbm8gaW50ZWdlciBzY2hlbWFWZXJzaW9uJyk7XG4gIH1cbiAgaWYgKHZlcnNpb24gPiBBQ1RJVklUWV9TQ0hFTUFfVkVSU0lPTikge1xuICAgIC8vIENvbnRlbnQgd3JpdHRlbiBieSBhIE5FV0VSIGJ1aWxkIHRoYW4gdGhpcyBvbmUgKGRlcGxveS1vcmRlciBzbGlwKS5cbiAgICB0aHJvdyBuZXcgVXBncmFkZUVycm9yKFxuICAgICAgYFN0b3JlZCBzY2hlbWFWZXJzaW9uICR7dmVyc2lvbn0gaXMgbmV3ZXIgdGhhbiB0aGlzIGJ1aWxkJ3MgYCArXG4gICAgICAgIGAke0FDVElWSVRZX1NDSEVNQV9WRVJTSU9OfSBcdTIwMTQgcmVmdXNpbmcgdG8gZ3Vlc3NgLFxuICAgICAgdmVyc2lvbixcbiAgICApO1xuICB9XG5cbiAgbGV0IGN1cnJlbnQgPSBzdG9yZWQ7XG4gIGxldCBhdCA9IHZlcnNpb247XG4gIHdoaWxlIChhdCA8IEFDVElWSVRZX1NDSEVNQV9WRVJTSU9OKSB7XG4gICAgY29uc3Qgc3RlcCA9IFVQR1JBREVTLmZpbmQoKHUpID0+IHUuZnJvbSA9PT0gYXQpO1xuICAgIGlmICghc3RlcCkge1xuICAgICAgLy8gdjEgbGFuZHMgaGVyZSBieSBkZXNpZ24gKGdyZWVuZmllbGQgaGFyZC1jdXQ6IG5vIG1pZ3JhdGUoMVx1MjE5MjIpKS5cbiAgICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoXG4gICAgICAgIGBObyB1cGdyYWRlIHBhdGggZnJvbSBzY2hlbWFWZXJzaW9uICR7YXR9IFx1MjAxNCBjYW5ub3Qgc2VydmVgLFxuICAgICAgICB2ZXJzaW9uLFxuICAgICAgKTtcbiAgICB9XG4gICAgY3VycmVudCA9IHN0ZXAucnVuKGN1cnJlbnQpO1xuICAgIGF0ICs9IDE7XG4gIH1cblxuICBjb25zdCBwYXJzZWQgPSBBY3Rpdml0eURvY3VtZW50LnNhZmVQYXJzZShjdXJyZW50KTtcbiAgaWYgKCFwYXJzZWQuc3VjY2Vzcykge1xuICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoXG4gICAgICBgQ29udGVudCBmYWlsZWQgdmFsaWRhdGlvbiBhdCBzY2hlbWFWZXJzaW9uICR7YXR9OiBgICtcbiAgICAgICAgcGFyc2VkLmVycm9yLmlzc3Vlc1xuICAgICAgICAgIC5zbGljZSgwLCAzKVxuICAgICAgICAgIC5tYXAoKGkpID0+IGAke2kucGF0aC5qb2luKCcuJyl9OiAke2kubWVzc2FnZX1gKVxuICAgICAgICAgIC5qb2luKCc7ICcpLFxuICAgICAgdmVyc2lvbixcbiAgICApO1xuICB9XG4gIHJldHVybiB7IGRvYzogcGFyc2VkLmRhdGEsIGZyb21TY2hlbWFWZXJzaW9uOiB2ZXJzaW9uIH07XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHJlZ2lzdHJ5L3JlZ2lzdHJ5LnRzIFx1MjAxNCB0aGUgc2luZ2xlIGJsb2NrIHJlZ2lzdHJ5IChTMCwgcnVsaW5nIFExQSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBPbmUgZW50cnkgcGVyIHNjaGVtYSBibG9jayB0eXBlLiBUaGUgZ3VhcmQgc3VpdGUgKHRlc3RzL3JlZ2lzdHJ5LnRlc3QudHMpXG4vLyBwcm92ZXM6IGNvdmVyYWdlIGlzIGV4YWN0IGFnYWluc3QgdGhlIEJsb2NrIHVuaW9uLCBudW1iZXJpbmcgZGVjbGFyYXRpb25zXG4vLyBhZ3JlZSB3aXRoIGJsb2NrLXByZWRpY2F0ZXMudHMsIGZhbWlsaWVzIGFncmVlIHdpdGggaXNHcmFkZWFibGUsIHZhcmlhbnRzXG4vLyBhZ3JlZSB3aXRoIHRoZSBzY2hlbWEncyBpbnRlcmFjdGlvbiB1bmlvbnMsIGFuZCBldmVyeSBpbnRlcmFjdGl2ZSBlbnRyeVxuLy8gY2FycmllcyBhbiBhMTF5IHN0b3J5LiBBZGQgYSBibG9jayB0eXBlIHRvIHRoZSBzY2hlbWEgYW5kIHRoaXMgZmlsZSBmYWlscyB0b1xuLy8gY29tcGlsZSAoQmxvY2tSZWdpc3RyeSBpcyBrZXllZCBieSB0aGUgdW5pb24pIFx1MjAxNCB0aGF0IGlzIHRoZSBwb2ludC5cbi8vXG4vLyBQcmludCBkZWNsYXJhdGlvbnMgc3RhcnRlZCBGQUlUSEZVTCB0byB0aGUgYmFzZWxpbmUgcHJpbnQgbGF5ZXJcbi8vIChyZW5kZXJlci9zcmMvcnVudGltZS9zdHlsZXMudHMgQG1lZGlhIHByaW50KSwgaW5jbHVkaW5nIGl0cyBrbm93biBvZGRpdGllcyxcbi8vIHNvIHRoYXQgaW1wcm92aW5nIHRoZW0gd291bGQgYmUgYSBkZWxpYmVyYXRlIGRlY2lzaW9uIHJhdGhlciB0aGFuIGEgc2lsZW50XG4vLyByZWdpc3RyeSBzaWRlIGVmZmVjdC4gUzUgKHRoZSBwcmludCBzbGljZSkgSVMgdGhhdCBkZWNpc2lvbiBwb2ludCwgYW5kIGl0XG4vLyBydWxlZCAoUzUtT1Y2KTogbWF0aF9ibG9jaywgZGF0YV9wbG90LCBhbmQgc2VsZl9leHBsYW5hdGlvbiBub3cgZGVjbGFyZVxuLy8gYnJlYWstaW5zaWRlOiBhdm9pZCBcdTIwMTQgYSBudW1iZXJlZCBlcXVhdGlvbiwgYSBjaGFydCwgb3IgYSBwcm9tcHQgc2VwYXJhdGVkXG4vLyBmcm9tIGl0cyB3cml0aW5nIGJveCBpcyBhIHByaW50IGJ1ZyBvbiBhbnkgc3VyZmFjZSBcdTIwMTQgYW5kIHRoZSBhdXRob3IgZXh0ZW5kZWRcbi8vIGl0IHRvIHNob3J0X2Fuc3dlciBhbmQgZXNzYXksIHRoZSB0d28gdW5uYW1lZCBzaWJsaW5ncyB0aGF0IHNoYXJlXG4vLyBzZWxmX2V4cGxhbmF0aW9uJ3Mgd3JpdGluZy1ib3ggc3RydWN0dXJlLiBUaGUgcGFyaXR5IGdhdGUgYXNzZXJ0c1xuLy8gVEhJUyBzcGVjIG9uIGJvdGggc3VyZmFjZXMgcmF0aGVyIHRoYW4gZGlmZmluZyBhZ2FpbnN0IHJlbmRlcmVyIG91dHB1dFxuLy8gKHByaW50RXhwZWN0YXRpb25zLnRzKSwgd2hpY2ggaXMgZXhhY3RseSB3aGF0IG1ha2VzIHRoZSBpbXByb3ZlbWVudFxuLy8gZXhwcmVzc2libGU7IHB1Ymxpc2hlZCBwYWdlcyBrZWVwIHRoZWlyIGN1cnJlbnQgYmVoYXZpb3IgdW50aWwgdGhleSByZXRpcmUuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQge1xuICBpc0dyYWRlYWJsZSxcbiAgaXNQYWdlTnVtYmVyZWQsXG4gIHR5cGUgQmxvY2ssXG59IGZyb20gJ0BhY3Rpdml0eS9zY2hlbWEnO1xuaW1wb3J0IHR5cGUge1xuICBCbG9ja0NhdGVnb3J5LFxuICBCbG9ja1JlZ2lzdHJ5LFxuICBCbG9ja1R5cGUsXG4gIENoZWNrZWRTdGF0ZUZhbWlseSxcbn0gZnJvbSAnLi90eXBlcy5qcyc7XG5cbi8qKiBCbGFua1Rva2VuIGZpZWxkcyBzdHJpcHBlZCBmcm9tIGlubGluZSBjb250ZW50IHdoZXJldmVyXG4gKiBTYW5pdGl6ZVNwZWMuaW5saW5lQmxhbmtTZWNyZXRzIGlzIHNldC4gYGhpbnRgIGRlbGliZXJhdGVseSBzdXJ2aXZlcyBcdTIwMTQgaXQgaXNcbiAqIGEgcHJlLWNoZWNrIGFmZm9yZGFuY2UgdGhlIHN0dWRlbnQgbWF5IG9wZW47IHBlci1taXN0YWtlIGZlZWRiYWNrIGlzXG4gKiByZXR1cm5lZCBieSB0aGUgY2hlY2sgUlBDIChydWxpbmcgMi4xQSksIHNvIHRoZSB3aG9sZSBtaXN0YWtlRmVlZGJhY2sgYXJyYXlcbiAqIChtYXRjaCBzdHJpbmdzIEFORCBmZWVkYmFjayB0ZXh0KSBzdHJpcHMuIGBhbnN3ZXJUeXBlYCBzdXJ2aXZlczogaXQgc2hhcGVzXG4gKiB0aGUgaW5wdXQgKG51bWVyaWMga2V5Ym9hcmRzKS4gKi9cbmV4cG9ydCBjb25zdCBCTEFOS19TRUNSRVRfRklFTERTID0gW1xuICAnYW5zd2VyJyxcbiAgJ2FjY2VwdGFibGVBbnN3ZXJzJyxcbiAgJ21pc3Rha2VGZWVkYmFjaycsXG4gICd0b2xlcmFuY2UnLFxuICAnZXF1aXZhbGVuY2UnLFxuXSBhcyBjb25zdDtcblxuLyoqIE1hdGhQcm9tcHQgZmllbGRzIHN0cmlwcGVkIHdoZXJldmVyIGEgcHJvbXB0cyBhcnJheSBhcHBlYXJzIChtYXRoX2Jsb2NrXG4gKiBibG9ja3MgQU5EIG1hdGhfaW5saW5lIG5vZGVzKS4gVGhlIGdhcCBtYXJrZXJzIGluIHRoZSBsYXRleCBhcmUgdGhlIGdhcHNcbiAqIHRoZW1zZWx2ZXMgKGFscmVhZHkgc2VydmVkIGVtcHR5IHRvZGF5IFx1MjAxNCBzZXJpYWxpemUudHMgcHJlY2VkZW50KTsgdGhlXG4gKiBwcm9tcHQncyBhbnN3ZXIvZ3JhZGluZyBjb25maWcgaXMgdGhlIHNlY3JldC4gYGFjY2VwdGFibGVBbnN3ZXJzYCB3YXNcbiAqIE1JU1NJTkcgZnJvbSB0aGUgUzAgZGVjbGFyYXRpb24gKFwiYWxzbyBhY2NlcHRcIiBhbHRlcm5hdGl2ZSBhbnN3ZXJzIFx1MjAxNCBhIHJlYWxcbiAqIGtleSBsZWFrKSBcdTIwMTQgY2F1Z2h0IGJ5IFMyJ3MgY3Jvc3MtY2hlY2sgYWdhaW5zdCB0aGUgTWF0aFByb21wdCBzY2hlbWEgYW5kXG4gKiBhZGRlZCBiZWZvcmUgdGhlIGZpcnN0IHNhbml0aXplZCBieXRlIHdhcyBzZXJ2ZWQuICovXG5leHBvcnQgY29uc3QgTUFUSF9QUk9NUFRfU0VDUkVUX0ZJRUxEUyA9IFtcbiAgJ2Fuc3dlcicsXG4gICdhY2NlcHRhYmxlQW5zd2VycycsXG4gICdlcXVpdmFsZW5jZScsXG4gICd0b2xlcmFuY2UnLFxuXSBhcyBjb25zdDtcblxuZXhwb3J0IGNvbnN0IGJsb2NrUmVnaXN0cnk6IEJsb2NrUmVnaXN0cnkgPSB7XG4gIHBhcmFncmFwaDoge1xuICAgIHR5cGU6ICdwYXJhZ3JhcGgnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdwYXJhZ3JhcGgnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ3Byb3NlJyB9LFxuICB9LFxuXG4gIGhlYWRpbmc6IHtcbiAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ2hlYWRpbmcnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ3Byb3NlJywga2VlcFdpdGhOZXh0OiB0cnVlIH0sXG4gIH0sXG5cbiAgbWF0aF9ibG9jazoge1xuICAgIHR5cGU6ICdtYXRoX2Jsb2NrJyxcbiAgICAvLyBHYXAtYmVhcmluZyAoTW9kZWwgQSBwcm9tcHRzKSBcdTIxOTIgYXV0by1ncmFkYWJsZSArIG51bWJlcmVkICsgaW50ZXJhY3RpdmU7XG4gICAgLy8gYSBwbGFpbiBkaXNwbGF5IGVxdWF0aW9uIHJlc29sdmVzIHN0YXRpYyB0aHJvdWdoIGZhbWlseU9mKCkuXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLCAvLyBmYWl0aGZ1bDogcmVuZGVyZXIgZW1pdHMgY29udGVudCBldmVuIHdoZW4gZ2FwLWJlYXJpbmdcbiAgICBudW1iZXJlZDogJ3doZW5fZ3JhZGFibGUnLFxuICAgIGFuYWx5dGljc0tleTogJ21hdGhfYmxvY2snLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbJ3NvbHV0aW9uJ10sIGlubGluZUJsYW5rU2VjcmV0czogdHJ1ZSB9LFxuICAgIC8vIFdBUyBhIGZhaXRoZnVsIG9kZGl0eSAoYWJzZW50IGZyb20gdGhlIGJhc2VsaW5lIGJyZWFrLWluc2lkZTphdm9pZCBsaXN0LFxuICAgIC8vIHNvIGEgbnVtYmVyZWQgZGlzcGxheSBlcXVhdGlvbiBjb3VsZCBzcGxpdCBhY3Jvc3MgYSBwYWdlKS4gRklYRUQgYnlcbiAgICAvLyBydWxpbmcgUzUtT1Y2IFx1MjAxNCBzdGlsbCBub3QgaW4gdGhlIHNob3dBbnN3ZXJzIHNldCwgd2hpY2ggaXMgdGhlIHNlcGFyYXRlXG4gICAgLy8gYW5zd2VyLWtleS12YXJpYW50IHF1ZXN0aW9uIFM1LjUgb3ducy5cbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAndW5kZXJsaW5lLWJsYW5rcycgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ0VhY2ggaW4tZXF1YXRpb24gZ2FwIGlzIGEgdGV4dCBpbnB1dCBpbiB0YWIgb3JkZXIsIGxhYmVsZWQgd2l0aCBpdHMgJyArXG4gICAgICAgICdwb3NpdGlvbiB3aXRoaW4gdGhlIGVxdWF0aW9uIChcImdhcCAxIG9mIDJcIikuIFRoZSBQUk9CTEVNIG51bWJlciBpcyAnICtcbiAgICAgICAgJ2Fubm91bmNlZCBvbmNlIGJ5IHRoZSBibG9jayB3cmFwcGVyLCB3aGljaCBpcyBhIGxhYmVsbGVkIGdyb3VwIFx1MjAxNCBub3QgJyArXG4gICAgICAgICdyZXBlYXRlZCBvbiBldmVyeSBnYXAgKHZpZXdlci1udW1iZXJpbmcgRDMpLiBWYWx1ZXMgdHlwZSBhcyBwbGFpbiB0ZXh0OyAnICtcbiAgICAgICAgJ3ZlcmRpY3RzIGFyZSBhbm5vdW5jZWQgdmlhIHRoZSBzaGFyZWQgc3RhdGUtcGlsbCBhcmlhLWxpdmUgcmVnaW9uLicsXG4gICAgfSxcbiAgfSxcblxuICBpbWFnZToge1xuICAgIHR5cGU6ICdpbWFnZScsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ2ltYWdlJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICdmaWd1cmUnIH0sXG4gIH0sXG5cbiAgY2FsbG91dDoge1xuICAgIHR5cGU6ICdjYWxsb3V0JyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnY2FsbG91dCcsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAndmFyaWFudC1ib3JkZXItYm94JyB9LFxuICB9LFxuXG4gIHByb2JsZW06IHtcbiAgICB0eXBlOiAncHJvYmxlbScsXG4gICAgLy8gTnVtYmVyZWQgbGVnYWN5IHByb3NlIHByb2JsZW07IGNhcnJpZXMgYSBzb2x1dGlvbiBidXQgbm8gYXV0by1ncmFkZWRcbiAgICAvLyByZXNwb25zZSAoaXNHcmFkZWFibGU6IGZhbHNlKSBcdTIxOTIgc3RhdGljIGZhbWlseSwgbm8gc3RhdGUgY2hyb21lLiBTY2hlbWFcbiAgICAvLyBvcnBoYW46IG5vIGVkaXRvciBOb2RlVmlldzsgc3RpbGwgcmVuZGVyYWJsZSwgc28gaXQga2VlcHMgYW4gZW50cnkuXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAncHJvYmxlbScsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFsnc29sdXRpb24nXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdwcm9zZScgfSxcbiAgfSxcblxuICBmaWxsX2luX2JsYW5rOiB7XG4gICAgdHlwZTogJ2ZpbGxfaW5fYmxhbmsnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ2ZpbGxfaW5fYmxhbmsnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbJ3NvbHV0aW9uJ10sIGlubGluZUJsYW5rU2VjcmV0czogdHJ1ZSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICd1bmRlcmxpbmUtYmxhbmtzJyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnRWFjaCBibGFuayBpcyBhIHRleHQgaW5wdXQgaW4gdGFiIG9yZGVyLCBsYWJlbGVkIHdpdGggaXRzIHN1Yi1wYXJ0ICcgK1xuICAgICAgICAnYW5kIHBvc2l0aW9uIChcIlBhcnQgYiwgYmxhbmsgMiBvZiAzXCIpIG9uIGEgbnVtYmVyZWQgbXVsdGktYmxhbmsgJyArXG4gICAgICAgICdwcm9ibGVtLCBhbmQgXCJCbGFuayAyIG9mIDNcIiBvdGhlcndpc2UuIFRoZSBQUk9CTEVNIG51bWJlciBpcyAnICtcbiAgICAgICAgJ2Fubm91bmNlZCBvbmNlIGJ5IHRoZSBibG9jayB3cmFwcGVyLCB3aGljaCBpcyBhIGxhYmVsbGVkIGdyb3VwLCAnICtcbiAgICAgICAgJ3JhdGhlciB0aGFuIHJlcGVhdGVkIG9uIGV2ZXJ5IGJsYW5rICh2aWV3ZXItbnVtYmVyaW5nIEQzL043KS4gJyArXG4gICAgICAgICdIaW50IGFuZCBtaXN0YWtlICcgK1xuICAgICAgICAnYWZmb3JkYW5jZXMgYXJlIGJ1dHRvbnMgcmVhY2hhYmxlIGJ5IFRhYjsgdGhlIG9wZW5lZCBwb3BvdmVyIHRyYXBzICcgK1xuICAgICAgICAnbm8gZm9jdXMgYW5kIGNsb3NlcyBvbiBFc2NhcGUuIFZlcmRpY3RzIGFubm91bmNlIHZpYSBhcmlhLWxpdmUuJyxcbiAgICB9LFxuICB9LFxuXG4gIGJ1bGxldF9saXN0OiB7XG4gICAgdHlwZTogJ2J1bGxldF9saXN0JyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnYnVsbGV0X2xpc3QnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ3Byb3NlJyB9LFxuICB9LFxuXG4gIG9yZGVyZWRfbGlzdDoge1xuICAgIHR5cGU6ICdvcmRlcmVkX2xpc3QnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdvcmRlcmVkX2xpc3QnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ3Byb3NlJyB9LFxuICB9LFxuXG4gIGludGVyYWN0aXZlX2dyYXBoOiB7XG4gICAgdHlwZTogJ2ludGVyYWN0aXZlX2dyYXBoJyxcbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJywgLy8gZGlzcGxheSB2YXJpYW50IHJlc29sdmVzIHN0YXRpYyB2aWEgZmFtaWx5T2YoKVxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsIC8vIGRpc3BsYXkgdmFyaWFudCByZXNvbHZlcyBjb250ZW50IHZpYSBjYXRlZ29yeU9mKClcbiAgICBudW1iZXJlZDogJ3doZW5fZ3JhZGFibGUnLFxuICAgIGFuYWx5dGljc0tleTogJ2ludGVyYWN0aXZlX2dyYXBoJyxcbiAgICB2YXJpYW50czogW1xuICAgICAgJ3Bsb3RfcG9pbnQnLFxuICAgICAgJ3Bsb3RfZnVuY3Rpb24nLFxuICAgICAgJ3NoYWRlX3JlZ2lvbicsXG4gICAgICAnZ3JhcGhfaW5lcXVhbGl0eScsXG4gICAgICAncGxvdF9yYXknLFxuICAgICAgJ3Bsb3Rfc2VnbWVudCcsXG4gICAgICAnZGlzcGxheScsXG4gICAgXSxcbiAgICBzYW5pdGl6ZToge1xuICAgICAgLy8gVGhlIHdpZGdldCBuZWVkcyBoYW5kbGUgY291bnQgLyBmYW1pbHksIHdoaWNoIGxpdmUgaW4gdGhlIGtleSB0aGVcbiAgICAgIC8vIHZpZXdlciBuZXZlciBnZXRzLiBEZXJpdmVkICsgd2hpdGVsaXN0ZWQ7IHNlZSBTYW5pdGl6ZVNwZWMuXG4gICAgICBkZXJpdmVRdWVzdGlvblNoYXBlOiB0cnVlLFxuICAgICAgLy8gVmFyaWFudC1zY29wZWQga2V5czogcGF0aHMgdGhhdCBkb24ndCBleGlzdCBvbiBhbiBpbnN0YW5jZSdzXG4gICAgICAvLyBpbnRlcmFjdGlvbiBzaW1wbHkgZG9uJ3QgbWF0Y2guIGBhbGxvd05vU29sdXRpb25gIFNVUlZJVkVTIChpdCByZW5kZXJzXG4gICAgICAvLyB0aGUgXCJubyBzb2x1dGlvblwiIGNvbnRyb2wpOyBgbm9Tb2x1dGlvbkNvcnJlY3RgIGlzIHRoZSBhbnN3ZXIuXG4gICAgICBzdHJpcDogW1xuICAgICAgICAnaW50ZXJhY3Rpb24uY29ycmVjdFBvaW50cycsXG4gICAgICAgICdpbnRlcmFjdGlvbi50b2xlcmFuY2UnLFxuICAgICAgICAnaW50ZXJhY3Rpb24ubW9kZWxzJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLmRvbWFpbnMnLFxuICAgICAgICAnaW50ZXJhY3Rpb24ucmVnaW9ucycsXG4gICAgICAgICdpbnRlcmFjdGlvbi5pbmVxdWFsaXRpZXMnLFxuICAgICAgICAnaW50ZXJhY3Rpb24ucmF5cycsXG4gICAgICAgICdpbnRlcmFjdGlvbi5zZWdtZW50cycsXG4gICAgICAgICdtaXN0YWtlRmVlZGJhY2snLFxuICAgICAgICAnc29sdXRpb24nLFxuICAgICAgICAnbm9Tb2x1dGlvbkNvcnJlY3QnLFxuICAgICAgICAnYnVpbHRpbkZlZWRiYWNrJyxcbiAgICAgIF0sXG4gICAgfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnc3RhdGljLXN2ZycgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ1RoZSBjYW52YXMgaXMgZm9jdXNhYmxlOyBoYW5kbGVzIG1vdmUgYnkgYXJyb3cga2V5cyB3aXRoIHBvc2l0aW9uICcgK1xuICAgICAgICAnbmFycmF0aW9uIHRvIGEgdmlzdWFsbHktaGlkZGVuIGFyaWEtbGl2ZSByZWdpb24gKGEgdmlzaWJsZSByZWFkb3V0ICcgK1xuICAgICAgICAnd291bGQgaGFuZCBvdmVyIHRoZSBhbnN3ZXIgXHUyMDE0IHJlYWRpbmcgdGhlIGdyaWQgaXMgdGhlIHNraWxsKS4gJyArXG4gICAgICAgICdQb3N0LWNoZWNrIHJlc3VsdHMgYXJlIHZpc2libGUgdGV4dC4gVG91Y2ggdGFyZ2V0cyBtZWV0IDQ0cHguJyxcbiAgICB9LFxuICB9LFxuXG4gIG11bHRpcGxlX2Nob2ljZToge1xuICAgIHR5cGU6ICdtdWx0aXBsZV9jaG9pY2UnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ211bHRpcGxlX2Nob2ljZScsXG4gICAgc2FuaXRpemU6IHtcbiAgICAgIC8vIFBlci1jaG9pY2UgZmVlZGJhY2sgcmV0dXJucyB2aWEgdGhlIGNoZWNrIFJQQyAoMi4xQSksIGxpa2UgYmxhbmtzJy5cbiAgICAgIHN0cmlwOiBbJ2Nob2ljZXNbXS5jb3JyZWN0JywgJ2Nob2ljZXNbXS5mZWVkYmFjaycsICdzb2x1dGlvbiddLFxuICAgIH0sXG4gICAgcHJpbnQ6IHtcbiAgICAgIGJyZWFrSW5zaWRlOiAnYXZvaWQnLFxuICAgICAgdHJlYXRtZW50OiAnY2hvaWNlLWxldHRlcnMnLFxuICAgICAgLy8gUHJpbnRlZCB2ZXJzaW9ucyByZWFycmFuZ2UgdGhlIGNob2ljZXM7IGEgcXVlc3Rpb24gdGhhdCBzYXlzIFwiYWxsIG9mXG4gICAgICAvLyB0aGUgYWJvdmVcIiBvcHRzIG91dCBwZXItYmxvY2sgKEQxN0EpLiBOT1Qgc2VydmVTaHVmZmxlZDogdGhlIHN0dWRlbnRcbiAgICAgIC8vIHNjcmVlbiBrZWVwcyB0aGUgYXV0aG9yZWQgb3JkZXIsIGJlY2F1c2UgdGhlIGFuc3dlciBpcyB0aGUgY2hvaWNlIGlkXG4gICAgICAvLyBhbmQgcmVhcnJhbmdpbmcgaXQgdGhlcmUgYnV5cyBub3RoaW5nLlxuICAgICAgc2h1ZmZsZWQ6IFsnY2hvaWNlcyddLFxuICAgICAgc2h1ZmZsZUxvY2tlZEJ5OiAnbG9ja0Nob2ljZU9yZGVyJyxcbiAgICB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnTmF0aXZlIHJhZGlvIChzaW5nbGUpIC8gY2hlY2tib3ggKG11bHRpKSBpbnB1dHMgZ3JvdXBlZCBpbiBhICcgK1xuICAgICAgICAnZmllbGRzZXQgd2hvc2UgbGVnZW5kIGlzIHRoZSBwcm9tcHQ7IGZ1bGwgbGFiZWwgY2xpY2sgdGFyZ2V0cy4gJyArXG4gICAgICAgICdTdGFuZGFyZCBhcnJvdy1rZXkgcmFkaW8gYmVoYXZpb3I7IHZlcmRpY3RzIGFubm91bmNlIHZpYSBhcmlhLWxpdmUuJyxcbiAgICB9LFxuICB9LFxuXG4gIG1hdGNoaW5nOiB7XG4gICAgdHlwZTogJ21hdGNoaW5nJyxcbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdtYXRjaGluZycsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFsna2V5JywgJ3NvbHV0aW9uJ10gfSxcbiAgICAvLyBBOS9FMzogY29uZGl0aW9uYWwsIGFuZCBkZWNsYXJlZCBhcyBzdWNoIFx1MjAxNCB0aGUgYmFuayBkcm9wcyBpdHNcbiAgICAvLyB1bmJyZWFrYWJpbGl0eSBvbmNlIGl0IGhvbGRzIGZpZ3VyZXMuIFNlZSBQcmludFNwZWMuYnJlYWtJbnNpZGUuXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZC11bmxlc3MtZmlndXJlcycsIHRyZWF0bWVudDogJ2xldHRlci1iYW5rJyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnUG9pbnRlciBkcmFnIHdpdGggYSBrZXlib2FyZCBzZWxlY3QtdGhlbi1wbGFjZSBncmFtbWFyIHVuZGVybmVhdGg6ICcgK1xuICAgICAgICAndGFyZ2V0IGNhcmRzIGFyZSBmb2N1c2FibGUsIFNwYWNlL0VudGVyIGxpZnRzLCBhcnJvd3MgY2hvb3NlIGEgZG9jaywgJyArXG4gICAgICAgICdTcGFjZS9FbnRlciBwbGFjZXMsIEVzY2FwZSBjYW5jZWxzLiBFdmVyeSBtb3ZlIG5hcnJhdGVzIHRvIGEgJyArXG4gICAgICAgICd2aXN1YWxseS1oaWRkZW4gYXJpYS1saXZlIHJlZ2lvbiAoXCJDYXJkIEIgcGxhY2VkIG9uIGl0ZW0gMlwiKS4nLFxuICAgIH0sXG4gIH0sXG5cbiAgb3JkZXJpbmc6IHtcbiAgICB0eXBlOiAnb3JkZXJpbmcnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ29yZGVyaW5nJyxcbiAgICBzYW5pdGl6ZToge1xuICAgICAgc3RyaXA6IFsnc29sdXRpb24nXSxcbiAgICAgIC8vIFRoZSBhdXRob3JlZCBpdGVtcyBvcmRlciBJUyB0aGUga2V5IFx1MjAxNCB0aGUgc2VydmVyIHNlcnZlcyBhIHNodWZmbGVcbiAgICAgIC8vIChzdGFibGUgcGVyIHZlcnNpb24gKyBzdHVkZW50IHNvIHJlbG9hZHMgZG9uJ3QgcmVzaHVmZmxlKS5cbiAgICAgIHNlcnZlU2h1ZmZsZWQ6IFsnaXRlbXMnXSxcbiAgICB9LFxuICAgIHByaW50OiB7XG4gICAgICBicmVha0luc2lkZTogJ2F2b2lkJyxcbiAgICAgIHRyZWF0bWVudDogJ251bWJlci1ib3hlcycsXG4gICAgICAvLyBUaGUgYXV0aG9yZWQgb3JkZXIgaXMgdGhlIGFuc3dlciwgc28gcGFwZXIgbXVzdCBuZXZlciBzaG93IGl0LiBUaGVcbiAgICAgIC8vIHNlcnZlciBhbHJlYWR5IHNodWZmbGVzIGZvciBzdHVkZW50cyAoc2VydmVTaHVmZmxlZCBhYm92ZSk7IHRlYWNoZXJcbiAgICAgIC8vIHByaW50IGdldHMgaXRzIG93biwgYmVjYXVzZSB0aGF0IHBhdGggZGVsaWJlcmF0ZWx5IGRvZXMgbm90IHJ1biB0aGVcbiAgICAgIC8vIHBlci1zdHVkZW50IHNlcnZlIHNodWZmbGUuXG4gICAgICBzaHVmZmxlZDogWydpdGVtcyddLFxuICAgIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdSb3dzIGFyZSBmb2N1c2FibGUgYW5kIHJlb3JkZXIgdmlhIHRoZSBzaGFyZWQgbGlmdCBncmFtbWFyOiAnICtcbiAgICAgICAgJ1NwYWNlL0VudGVyIGxpZnRzLCBhcnJvd3MgbW92ZSB0aGUgcm93LCBTcGFjZS9FbnRlciBkcm9wcywgRXNjYXBlICcgK1xuICAgICAgICAnY2FuY2VsczsgcG9zaXRpb25zIG5hcnJhdGUgdG8gYSB2aXN1YWxseS1oaWRkZW4gYXJpYS1saXZlIHJlZ2lvbi4nLFxuICAgIH0sXG4gIH0sXG5cbiAgbnVtYmVyX2xpbmU6IHtcbiAgICB0eXBlOiAnbnVtYmVyX2xpbmUnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ251bWJlcl9saW5lJyxcbiAgICB2YXJpYW50czogWydwbG90X3BvaW50JywgJ3Bsb3RfaW50ZXJ2YWwnXSxcbiAgICBzYW5pdGl6ZToge1xuICAgICAgLy8gVGhlIHdpZGdldCBuZWVkcyBoYW5kbGUgY291bnQgLyBmYW1pbHksIHdoaWNoIGxpdmUgaW4gdGhlIGtleSB0aGVcbiAgICAgIC8vIHZpZXdlciBuZXZlciBnZXRzLiBEZXJpdmVkICsgd2hpdGVsaXN0ZWQ7IHNlZSBTYW5pdGl6ZVNwZWMuXG4gICAgICBkZXJpdmVRdWVzdGlvblNoYXBlOiB0cnVlLFxuICAgICAgc3RyaXA6IFtcbiAgICAgICAgJ2ludGVyYWN0aW9uLmNvcnJlY3RQb2ludHMnLFxuICAgICAgICAnaW50ZXJhY3Rpb24udG9sZXJhbmNlJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLmNvcnJlY3RJbnRlcnZhbCcsXG4gICAgICAgICdzb2x1dGlvbicsXG4gICAgICBdLFxuICAgIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3N0YXRpYy1zdmcnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdUaGUgbGluZSBpcyBmb2N1c2FibGU7IHBvaW50cy9pbnRlcnZhbCBlbmRwb2ludHMgbW92ZSBieSBhcnJvdyBrZXlzICcgK1xuICAgICAgICAnd2l0aCB2YWx1ZSBuYXJyYXRpb24gdG8gYSB2aXN1YWxseS1oaWRkZW4gYXJpYS1saXZlIHJlZ2lvbiAodmlzaWJsZSAnICtcbiAgICAgICAgJ3JlYWRvdXQgd291bGQgcmV2ZWFsIHRoZSBhbnN3ZXIpLiBQb3N0LWNoZWNrIHJlc3VsdHMgYXJlIHZpc2libGUuJyxcbiAgICB9LFxuICB9LFxuXG4gIGRhdGFfcGxvdDoge1xuICAgIHR5cGU6ICdkYXRhX3Bsb3QnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLCAvLyBkaXNwbGF5IHZhcmlhbnQgcmVzb2x2ZXMgc3RhdGljIHZpYSBmYW1pbHlPZigpXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJywgLy8gZGlzcGxheSB2YXJpYW50IHJlc29sdmVzIGNvbnRlbnQgdmlhIGNhdGVnb3J5T2YoKVxuICAgIG51bWJlcmVkOiAnd2hlbl9ncmFkYWJsZScsXG4gICAgYW5hbHl0aWNzS2V5OiAnZGF0YV9wbG90JyxcbiAgICB2YXJpYW50czogWydkaXNwbGF5JywgJ2J1aWxkX2RvdHBsb3QnLCAnYnVpbGRfaGlzdG9ncmFtJywgJ2J1aWxkX2JveHBsb3QnXSxcbiAgICBzYW5pdGl6ZToge1xuICAgICAgLy8gVGhlIHdpZGdldCBuZWVkcyBoYW5kbGUgY291bnQgLyBmYW1pbHksIHdoaWNoIGxpdmUgaW4gdGhlIGtleSB0aGVcbiAgICAgIC8vIHZpZXdlciBuZXZlciBnZXRzLiBEZXJpdmVkICsgd2hpdGVsaXN0ZWQ7IHNlZSBTYW5pdGl6ZVNwZWMuXG4gICAgICBkZXJpdmVRdWVzdGlvblNoYXBlOiB0cnVlLFxuICAgICAgc3RyaXA6IFsnc29sdXRpb24nLCAnaW50ZXJhY3Rpb24udG9sZXJhbmNlJ10sXG4gICAgICBkZXJpdmFibGVGcm9tU2VydmVkOlxuICAgICAgICAnVGhlIGRhdGEgc2V0IGlzIHRoZSB3b3JraW5nIG1hdGVyaWFsIHRoZSBzdHVkZW50IGJ1aWxkcyB0aGUgY2hhcnQgJyArXG4gICAgICAgICdGUk9NLCBhbmQgdGhlIGNvcnJlY3QgY2hhcnQgaXMgY29tcHV0ZWQgZnJvbSBpdCBcdTIwMTQgd2l0aGhvbGRpbmcgdGhlICcgK1xuICAgICAgICAnZGF0YSB3b3VsZCByZW1vdmUgdGhlIHRhc2suIFNlcnZlci1hdXRob3JpdGF0aXZlIGdyYWRpbmcgc3RpbGwgZ2F0ZXMgJyArXG4gICAgICAgICd2ZXJkaWN0czsgdGhlIGxlYWsgdGVzdHMgd2hpdGVsaXN0IGBkYXRhYCBmb3IgdGhpcyBibG9jayBleHBsaWNpdGx5LicsXG4gICAgfSxcbiAgICAvLyBXQVMgYSBmYWl0aGZ1bCBvZGRpdHkgKGFic2VudCBmcm9tIHRoZSBiYXNlbGluZSBicmVhay1pbnNpZGU6YXZvaWQgbGlzdCxcbiAgICAvLyB1bmxpa2UgdGhlIGdyYXBoIGFuZCBudW1iZXItbGluZSBjYW52YXNlcykuIEZJWEVEIGJ5IHJ1bGluZyBTNS1PVjYgXHUyMDE0IGFcbiAgICAvLyBjaGFydCBzcGxpdCBhY3Jvc3MgYSBwYWdlIGJvdW5kYXJ5IGlzIHVucmVhZGFibGUuXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3N0YXRpYy1zdmcnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdDaGFydC1idWlsZGluZyBjb250cm9scyBhcmUgZm9jdXNhYmxlOyBkb3RzL2JhcnMvYm94IGhhbmRsZXMgYWRqdXN0ICcgK1xuICAgICAgICAnYnkgYXJyb3cga2V5cyB3aXRoIHZhbHVlIG5hcnJhdGlvbiB0byBhIHZpc3VhbGx5LWhpZGRlbiBhcmlhLWxpdmUgJyArXG4gICAgICAgICdyZWdpb24uIFBvc3QtY2hlY2sgcmVzdWx0cyBhcmUgdmlzaWJsZSB0ZXh0LicsXG4gICAgfSxcbiAgfSxcblxuICBsZWFybmluZ19vYmplY3RpdmVzOiB7XG4gICAgdHlwZTogJ2xlYXJuaW5nX29iamVjdGl2ZXMnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdsZWFybmluZ19vYmplY3RpdmVzJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnYm9yZGVyZWQtYm94JyB9LFxuICB9LFxuXG4gIHdvcmtlZF9leGFtcGxlOiB7XG4gICAgdHlwZTogJ3dvcmtlZF9leGFtcGxlJyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnd29ya2VkX2V4YW1wbGUnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSwgY2hpbGRCbG9ja3M6IFsnY29udGVudCddIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ2JvcmRlcmVkLWJveCcgfSxcbiAgfSxcblxuICBmYWRlZF93b3JrZWRfZXhhbXBsZToge1xuICAgIHR5cGU6ICdmYWRlZF93b3JrZWRfZXhhbXBsZScsXG4gICAgLy8gVGhlIGJveCBjb3VudHMgYXMgT05FIG51bWJlcmVkIHByb2JsZW07IGdyYWRpbmcgcmlkZXMgaXRzIGNoaWxkXG4gICAgLy8gZmlsbF9pbl9ibGFuayBzdGVwcywgZWFjaCBzYW5pdGl6ZWQgYnkgaXRzIG93biBlbnRyeSB2aWEgY2hpbGRCbG9ja3MuXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdzY2FmZm9sZCcsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ2ZhZGVkX3dvcmtlZF9leGFtcGxlJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10sIGNoaWxkQmxvY2tzOiBbJ2NvbnRlbnQnXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdib3JkZXJlZC1ib3gnIH0sXG4gIH0sXG5cbiAgdGFibGU6IHtcbiAgICB0eXBlOiAndGFibGUnLFxuICAgIC8vIERVQUwtTkFUVVJFRCwgcmVzb2x2ZWQgcGVyIGluc3RhbmNlIHJhdGhlciB0aGFuIGRlY2xhcmVkIHBlciB0eXBlOiBhXG4gICAgLy8gdGFibGUgd2hvc2UgY2VsbHMgaG9sZCBibGFua3MgaXMgYSBxdWVzdGlvbjsgYSBibGFua2xlc3Mgb25lIGlzIGFcbiAgICAvLyBzdGltdWx1cyAoYSByYXRlcyBjaGFydCB0byBSRUFEKS4gZmFtaWx5T2YoKS9jYXRlZ29yeU9mKCkgcm91dGUgdGhyb3VnaFxuICAgIC8vIGlzR3JhZGVhYmxlLCB3aGljaCBhbnN3ZXJzIGZyb20gQ09OVEVOVCBcdTIwMTQgdGhlIG1hdGhfYmxvY2sgcHJlY2VkZW50LCBhbmRcbiAgICAvLyB0aGUgcmVhc29uIHRoZXJlIGlzIG5vIGF1dGhvcmVkIGBpbnRlcmFjdGl2ZWAgZmxhZyB0byBkcmlmdC5cbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnd2hlbl9ncmFkYWJsZScsXG4gICAgYW5hbHl0aWNzS2V5OiAndGFibGUnLFxuICAgIC8vIENlbGxzIGFyZSBOT1QgYmxvY2tzLCBzbyBgY2hpbGRCbG9ja3NgIHdvdWxkIGJlIGEgY2F0ZWdvcnkgZXJyb3IgaGVyZS5cbiAgICAvLyBUaGUgY2VsbCBibGFua3MgYXJlIGluLWJhbmQgY29udGVudCBvZiBUSElTIGJsb2NrOiB0aGUgZGVlcCBzdHJpcCB3YWxrc1xuICAgIC8vIHRoZW0gdW5jb25kaXRpb25hbGx5IChpdCBuZXZlciBzdG9wcyBhdCBuZXN0ZWQgYXJyYXlzKSwgYW5kIHRoaXMgZmxhZyBpc1xuICAgIC8vIHRoZSBkZWNsYXJhdGlvbiArIHRoZSB0eXBlIHByb2plY3Rpb24gdGhhdCBzYXlzIHNvLlxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSwgaW5saW5lQmxhbmtTZWNyZXRzOiB0cnVlIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ2RhdGEtdGFibGUnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdUaGUgdGFibGUgaXMgYSByZWFsIDx0YWJsZT4gd2l0aCA8dGg+IGNlbGxzIG9uIHdoaWNoZXZlciBheGlzIHRoZSAnICtcbiAgICAgICAgJ2F1dGhvciBtYXJrZWQgKGhlYWRlclJvdyAvIGhlYWRlckNvbHVtbiksIHNvIGEgc2NyZWVuIHJlYWRlciAnICtcbiAgICAgICAgJ2Fubm91bmNlcyBhIGJsYW5rIGNlbGwgd2l0aCBpdHMgcm93IGFuZCBjb2x1bW4gaGVhZGVycyBcdTIwMTQgXCJLaWxvZ3JhbXMgJyArXG4gICAgICAgICcyLCBDb3N0LCBibGFua1wiIFx1MjAxNCB3aGljaCBpcyB0aGUgaW5mb3JtYXRpb24gYSBzaWdodGVkIHN0dWRlbnQgcmVhZHMgJyArXG4gICAgICAgICdvZmYgdGhlIGdyaWQuIEVhY2ggYmxhbmsgaXMgYSB0ZXh0IGlucHV0IGluIHRhYiBvcmRlciwgcmVhZGluZyBvcmRlciAnICtcbiAgICAgICAgJ2xlZnQgdG8gcmlnaHQgdGhlbiBkb3duLiBPbiBhIG11bHRpLWJsYW5rIHRhYmxlIHRoZSBpbnB1dCBhbHNvICcgK1xuICAgICAgICAnY2FycmllcyBpdHMgc3ViLXBhcnQgbGV0dGVyIChcIlBhcnQgYlwiKSwgbWF0Y2hpbmcgdGhlIChiKSBtYXJrZXIgJyArXG4gICAgICAgICdwcmludGVkIGJlc2lkZSBpdDsgdGhhdCBtYXJrZXIgaXMgYXJpYS1oaWRkZW4gc28gaXQgaXMgbm90IGFubm91bmNlZCAnICtcbiAgICAgICAgJ3R3aWNlLiBUaGUgUFJPQkxFTSBudW1iZXIgaXMgYW5ub3VuY2VkIG9uY2UgYnkgdGhlIGJsb2NrIHdyYXBwZXIsICcgK1xuICAgICAgICAnbmV2ZXIgcmVwZWF0ZWQgcGVyIGNlbGwgKHZpZXdlci1udW1iZXJpbmcgRDMpLiBWZXJkaWN0cyBhbm5vdW5jZSB2aWEgJyArXG4gICAgICAgICd0aGUgc2hhcmVkIHN0YXRlLXBpbGwgYXJpYS1saXZlIHJlZ2lvbi4nLFxuICAgIH0sXG4gIH0sXG5cbiAgc2VsZl9leHBsYW5hdGlvbjoge1xuICAgIHR5cGU6ICdzZWxmX2V4cGxhbmF0aW9uJyxcbiAgICBmYW1pbHk6ICdyZWNvcmRlZCcsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdzZWxmX2V4cGxhbmF0aW9uJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICAvLyBXQVMgYSBmYWl0aGZ1bCBvZGRpdHk6IHRoZSBiYXNlbGluZSBhdm9pZCByaWRlcyB0aGUgdGV4dGFyZWEsIG5vdCB0aGVcbiAgICAvLyBibG9jaywgc28gYSBsb25nIHByb21wdCBjb3VsZCBzZXBhcmF0ZSBmcm9tIGl0cyB3cml0aW5nIGJveC4gRklYRUQgYnlcbiAgICAvLyBydWxpbmcgUzUtT1Y2IFx1MjAxNCBhIHByb21wdCBvbiBvbmUgcGFnZSBhbmQgaXRzIGFuc3dlciBzcGFjZSBvbiB0aGUgbmV4dCBpc1xuICAgIC8vIHRoZSBzYW1lIGRlZmVjdCBjbGFzcyBhcyBhIHNwbGl0IGVxdWF0aW9uLlxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICd3cml0aW5nLWJveCcgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ0EgbGFiZWxlZCB0ZXh0YXJlYSBpbiB0YWIgb3JkZXIuIE9uIGNoZWNrIHRoZSBibG9jayBhbm5vdW5jZXMgJyArXG4gICAgICAgICdcIlJlY29yZGVkIFx1MjAxNCB5b3VyIHRlYWNoZXIgd2lsbCByZXZpZXdcIiB2aWEgYXJpYS1saXZlOyBuZXZlciBhIHZlcmRpY3QuJyxcbiAgICB9LFxuICB9LFxuXG4gIHNob3J0X2Fuc3dlcjoge1xuICAgIHR5cGU6ICdzaG9ydF9hbnN3ZXInLFxuICAgIGZhbWlseTogJ3JlY29yZGVkJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIC8vIFdBUyAnbmV2ZXInIFx1MjAxNCBhIHByZS1wYXBlci1maXJzdCBjaG9pY2UuIFJ1bGluZyBFNyAoMjAyNi0wOC0xOSk6IGEgZ3JhZGVkXG4gICAgLy8gcXVlc3Rpb24gYSB0ZWFjaGVyIG1hcmtzIG9uIHBhcGVyIG5lZWRzIGEgbnVtYmVyLCBhbmQgdGhlIG51bWJlcmluZyB3YWxrXG4gICAgLy8gdGhhdCBhbHJlYWR5IGV4aXN0cyBnaXZlcyB0aGUgc2NhbiBhcmMgaXRzIHBhcGVyXHUyMTkyYmxvY2sgbWFwcGluZyBmb3IgZnJlZS5cbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAnc2hvcnRfYW5zd2VyJyxcbiAgICAvLyBSdWJyaWNzIGFyZSB0ZWFjaGVyLXNpZGUgZGF0YSBcdTIwMTQgYWxyZWFkeSBjb3JyZWN0bHkgd2l0aGhlbGQgZnJvbSBzdHVkZW50XG4gICAgLy8gSFRNTCB0b2RheTsgdGhlIHJlZ2lzdHJ5IG1ha2VzIHRoYXQgYSBkZWNsYXJlZCBpbnZhcmlhbnQuXG4gICAgLy9cbiAgICAvLyBgYW5zd2VyYCBhbmQgYHNvbHV0aW9uYCBqb2luZWQgaXQgd2l0aCB0aGUgYW5zd2VyLWtleSBzbGljZSAocnVsaW5nIEUyL0UzKVxuICAgIC8vIGFuZCB0aGUgT1JERVIgT0YgRVZFTlRTIG1hdHRlcnMgbW9yZSB0aGFuIHRoZSBsaXN0IGRvZXM6IEUzIGRlY2xhcmVzIHRoZVxuICAgIC8vIGFudGktbGVhayBjaGFpbiBPTkUgSU5TRVBBUkFCTEUgVU5JVCBcdTIwMTQgdGhpcyBzdHJpcCBlbnRyeSwgdGhlIGxlYWtGaXh0dXJlXG4gICAgLy8gc2VudGluZWwgcm93IHRoYXQgb2JzZXJ2ZXMgaXQsIHRoZSBzYW5pdGl6ZSB1bml0IGFzc2VydGlvbiwgYW5kIHRoZVxuICAgIC8vIHNjaGVtYS12cy1yZWdpc3RyeSBjb21wbGV0ZW5lc3MgZ2F0ZSBhbGwgbGFuZCB0b2dldGhlci4gQSBzdHJpcCBlbnRyeVxuICAgIC8vIHdpdGhvdXQgaXRzIGZpeHR1cmUgcm93IGlzIGEgY2xhaW0gbm90aGluZyBjaGVja3MgKHRoZSBcInBhc3NpbmcgYmVjYXVzZVxuICAgIC8vIG9mIHdoYXQgaXMgYWJzZW50XCIgY2xhc3MpLCB3aGljaCBpcyBleGFjdGx5IGhvdyBhIGtleSBsZWFrcyBxdWlldGx5LlxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbJ3J1YnJpYycsICdhbnN3ZXInLCAnc29sdXRpb24nXSB9LFxuICAgIC8vIFNhbWUgZm9ybWVyIG9kZGl0eSBhcyBzZWxmX2V4cGxhbmF0aW9uLCBhbmQgZml4ZWQgd2l0aCBpdDogdGhlIGJhc2VsaW5lXG4gICAgLy8gYXZvaWQgcmlkZXMgdGhlIHRleHRhcmVhLCBub3QgdGhlIGJsb2NrLCBzbyBhIHByb21wdCBjb3VsZCBwcmludCBvbiBvbmVcbiAgICAvLyBwYWdlIHdpdGggaXRzIGFuc3dlciBzcGFjZSBvbiB0aGUgbmV4dC4gUzUtT1Y2IG5hbWVkIG9ubHkgdGhlIHRocmVlXG4gICAgLy8gdHlwZXMgaXRzIGNvbW1lbnRzIGZsYWdnZWQ7IHRoZSBhdXRob3IgZXh0ZW5kZWQgdGhlIHJ1bGluZyB0byB0aGUgdHdvXG4gICAgLy8gdW5uYW1lZCBzaWJsaW5ncyBvZiB0aGUgc2FtZSBmYW1pbHkgcmF0aGVyIHRoYW4gbGVhdmUgdGhlIGRlZmVjdCBpblxuICAgIC8vIHBsYWNlIGZvciB0aGVtICh0aGUgcGxvdF9yYXkvcGxvdF9zZWdtZW50IGxlc3NvbjogYXVkaXQgdGhlIGZhbWlseSkuXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3dyaXRpbmctYm94JyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnQSBsYWJlbGVkIHRleHRhcmVhIGluIHRhYiBvcmRlci4gUmVjb3JkZWQgc3RhdGUgYW5ub3VuY2VzIHZpYSAnICtcbiAgICAgICAgJ2FyaWEtbGl2ZTsgdGVhY2hlciBmZWVkYmFjaywgb25jZSByZWxlYXNlZCwgcmVuZGVycyBhcyBhIGxhYmVsZWQgJyArXG4gICAgICAgICdyZWdpb24gYW5ub3VuY2VkIG9uIGFycml2YWwuJyxcbiAgICB9LFxuICB9LFxuXG4gIGVzc2F5OiB7XG4gICAgdHlwZTogJ2Vzc2F5JyxcbiAgICBmYW1pbHk6ICdyZWNvcmRlZCcsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICAvLyBOdW1iZXJlZCB3aXRoIHNob3J0X2Fuc3dlciBcdTIwMTQgc2VlIHRoZSBub3RlIHRoZXJlIChydWxpbmcgRTcpLlxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdlc3NheScsXG4gICAgLy8gYW5zd2VyICsgc29sdXRpb24gcmlkZSB0aGUgc2FtZSBhbnRpLWxlYWsgdW5pdCBhcyBzaG9ydF9hbnN3ZXInczsgRTQnc1xuICAgIC8vIHBhcml0eSBydWxpbmcgaXMgd2hhdCBrZWVwcyB0aGVzZSB0d28gbGlzdHMgaWRlbnRpY2FsLlxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbJ3J1YnJpYycsICdhbnN3ZXInLCAnc29sdXRpb24nXSB9LFxuICAgIC8vIEV4dGVuZGVkIHdpdGggc2hvcnRfYW5zd2VyICsgc2VsZl9leHBsYW5hdGlvbiBcdTIwMTQgc2VlIHRoZSBub3RlIHRoZXJlLlxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICd3cml0aW5nLWJveCcgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ0EgbGFiZWxlZCB0ZXh0YXJlYSBpbiB0YWIgb3JkZXIuIFRoZSBsaXZlIHdvcmQgY291bnRlciBpcyAnICtcbiAgICAgICAgJ2FyaWEtbGl2ZT1wb2xpdGUgYW5kIGRlYm91bmNlZCBzbyBpdCBuZXZlciBjaGF0dGVycyBwZXIga2V5c3Ryb2tlLiAnICtcbiAgICAgICAgJ1JlY29yZGVkIHN0YXRlIGFuZCByZWxlYXNlZCB0ZWFjaGVyIGZlZWRiYWNrIGFubm91bmNlIHZpYSBhcmlhLWxpdmUuJyxcbiAgICB9LFxuICB9LFxuXG4gIGdyYXBoX2ZpZ3VyZToge1xuICAgIHR5cGU6ICdncmFwaF9maWd1cmUnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdncmFwaF9maWd1cmUnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ2ZpZ3VyZScgfSxcbiAgfSxcbn07XG5cbi8qKiBFdmVyeSByZWdpc3RlcmVkIHR5cGUsIGluIHJlZ2lzdHJ5IGRlY2xhcmF0aW9uIG9yZGVyLiAqL1xuZXhwb3J0IGNvbnN0IHJlZ2lzdGVyZWRCbG9ja1R5cGVzID0gT2JqZWN0LmtleXMoYmxvY2tSZWdpc3RyeSkgYXMgQmxvY2tUeXBlW107XG5cbi8qKiBSZXNvbHZlIGFuIElOU1RBTkNFJ3MgY2hlY2tlZC1zdGF0ZSBmYW1pbHkuIEEgdHlwZSdzIGRlY2xhcmVkIGZhbWlseSBpc1xuICogbWF4aW1hbDsgdW5ncmFkYWJsZSBpbnN0YW5jZXMgb2YgZ3JhZGFibGUgdHlwZXMgKGRpc3BsYXkgZ3JhcGgvZGF0YSBwbG90LFxuICogcHJvbXB0bGVzcyBtYXRoIGJsb2NrKSByZXNvbHZlIHRvIHN0YXRpYyBcdTIwMTQgb25lIHJ1bGUgZW5naW5lLCBpc0dyYWRlYWJsZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmYW1pbHlPZihibG9jazogQmxvY2spOiBDaGVja2VkU3RhdGVGYW1pbHkge1xuICBjb25zdCBlbnRyeSA9IGJsb2NrUmVnaXN0cnlbYmxvY2sudHlwZV07XG4gIGlmIChlbnRyeS5mYW1pbHkgPT09ICdzdGF0aWMnKSByZXR1cm4gJ3N0YXRpYyc7XG4gIHJldHVybiBpc0dyYWRlYWJsZShibG9jaykgPyBlbnRyeS5mYW1pbHkgOiAnc3RhdGljJztcbn1cblxuLyoqIFJlc29sdmUgYW4gSU5TVEFOQ0UncyBjYXRlZ29yeTogYSBkaXNwbGF5LW1vZGUgZ3JhcGgvZGF0YSBwbG90IHNlcnZlcyBhc1xuICogY29udGVudCwgbWF0Y2hpbmcgdGhlIHJlbmRlcmVyJ3MgZGF0YS1ibG9jay1jYXRlZ29yeSBlbWlzc2lvbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYXRlZ29yeU9mKGJsb2NrOiBCbG9jayk6IEJsb2NrQ2F0ZWdvcnkge1xuICBjb25zdCBlbnRyeSA9IGJsb2NrUmVnaXN0cnlbYmxvY2sudHlwZV07XG4gIGlmIChlbnRyeS5jYXRlZ29yeSA9PT0gJ3F1ZXN0aW9uJyAmJiBlbnRyeS5udW1iZXJlZCA9PT0gJ3doZW5fZ3JhZGFibGUnKSB7XG4gICAgcmV0dXJuIGlzR3JhZGVhYmxlKGJsb2NrKSA/ICdxdWVzdGlvbicgOiAnY29udGVudCc7XG4gIH1cbiAgcmV0dXJuIGVudHJ5LmNhdGVnb3J5O1xufVxuXG4vKiogQ2Vuc3VzIGtleSBmb3IgYW4gaW5zdGFuY2UgKFAzQSk6IHRoZSBhbmFseXRpY3Mga2V5LCB3aXRoIHRoZSBpbnRlcmFjdGlvblxuICogdmFyaWFudCBhcHBlbmRlZCBmb3IgdGhlIGJsb2NrcyB0aGF0IGhhdmUgb25lIFx1MjAxNCBgZGF0YV9wbG90LmJ1aWxkX2hpc3RvZ3JhbWAuICovXG5leHBvcnQgZnVuY3Rpb24gY2Vuc3VzS2V5T2YoYmxvY2s6IEJsb2NrKTogc3RyaW5nIHtcbiAgY29uc3QgZW50cnkgPSBibG9ja1JlZ2lzdHJ5W2Jsb2NrLnR5cGVdO1xuICBpZiAoJ2ludGVyYWN0aW9uJyBpbiBibG9jayAmJiBlbnRyeS52YXJpYW50cykge1xuICAgIHJldHVybiBgJHtlbnRyeS5hbmFseXRpY3NLZXl9LiR7YmxvY2suaW50ZXJhY3Rpb24udHlwZX1gO1xuICB9XG4gIHJldHVybiBlbnRyeS5hbmFseXRpY3NLZXk7XG59XG5cbi8qKiBXaGV0aGVyIGFuIElOU1RBTkNFIGRyYXdzIGEgcHJvYmxlbSBudW1iZXIgKGRlbGVnYXRlcyB0byB0aGUgc2NoZW1hIHJ1bGVcbiAqIGVuZ2luZSBcdTIwMTQgcmUtZXhwb3J0ZWQgaGVyZSBzbyB2aWV3ZXIgY29kZSBoYXMgb25lIGltcG9ydCBzdXJmYWNlKS4gKi9cbmV4cG9ydCB7IGlzUGFnZU51bWJlcmVkIH07XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHByb21wdENhcnJpZXJzLnRzIFx1MjAxNCB0aGUgT05FIGxpc3Qgb2YgaW5saW5lIHR5cGVzIHdob3NlIGBwcm9tcHRzYCBjYXJyeSBrZXlzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBtYXRoIG5vZGUncyBgcHJvbXB0c2AgYXJyYXkgaG9sZHMgaW4tYmFuZCBhbnN3ZXIgbWF0ZXJpYWwsIHNvIGJvdGggdGhlXG4vLyBzYW5pdGl6ZXIncyBkZWVwIHN0cmlwIChsYXllciAzKSBhbmQgdGhlIGdyYWRpbmcgd2FsaydzIGtleSBjb2xsZWN0aW9uIG11c3Rcbi8vIGFncmVlIG9uIGV4YWN0bHkgd2hpY2ggbm9kZSB0eXBlcyBjYXJyeSBwcm9tcHRzLiBVbnRpbCAyMDI2LTA4LTA2IHRoaXMgU2V0XG4vLyB3YXMgZGVjbGFyZWQgdHdpY2Ugd2l0aCBpZGVudGljYWwgY29udGVudHMgKHNhbml0aXplLnRzIGFuZCBncmFkaW5nL3dhbGsudHNcbi8vIFx1MjAxNCBzNC1yZXRybyBmaW5kaW5nIDEwLCBmaXhlZCBieSBlbmctcmV2aWV3IEE3KTogdHdvIHNwZWxsaW5ncyBvZiBhIHNlY3VyaXR5LVxuLy8gcmVsZXZhbnQgcm9zdGVyLCBib25kZWQgYnkgbm90aGluZy4gQSB0eXBlIGFkZGVkIHRvIG9uZSBhbmQgbm90IHRoZSBvdGhlclxuLy8gd291bGQgZWl0aGVyIGxlYWsgYSBwcm9tcHQga2V5IHRvIHN0dWRlbnRzIChzYW5pdGl6ZSBzaWRlIG1pc3NpbmcpIG9yIGdyYWRlXG4vLyBhZ2FpbnN0IGEga2V5IHRoZSB3aXJlIG5ldmVyIGNhcnJpZWQgKHdhbGsgc2lkZSBtaXNzaW5nKSBcdTIwMTQgYm90aCBzaWxlbnQuXG4vL1xuLy8gVGhpcyBtb2R1bGUgaXMgYSBkZXBlbmRlbmN5LWZyZWUgbGVhZiBPTiBQVVJQT1NFOiBpdCBpcyBpbXBvcnRlZCBieSB0aGUgcmVhZFxuLy8gYnVuZGxlICh2aWEgc2FuaXRpemUudHMpIEFORCB0aGUgZ3JhZGluZyBidW5kbGUgKHZpYSB3YWxrLnRzKSwgc28gaXQgbXVzdFxuLy8gbmV2ZXIgZ3JvdyBhbiBpbXBvcnQgdGhhdCBlaXRoZXIgYnVuZGxlIGNhbid0IGFmZm9yZC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBJbmxpbmUgbm9kZSB0eXBlcyB3aG9zZSBgcHJvbXB0c2AgYXJyYXlzIGNhcnJ5IGluLWJhbmQgYW5zd2VyIGtleXMuICovXG5leHBvcnQgY29uc3QgUFJPTVBUX0NBUlJJRVJfVFlQRVM6IFJlYWRvbmx5U2V0PHN0cmluZz4gPSBuZXcgU2V0KFtcbiAgJ21hdGhfaW5saW5lJyxcbiAgJ21hdGhfYmxvY2snLFxuXSk7XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHNhbml0aXplL3Nhbml0aXplLnRzIFx1MjAxNCB0aGUgYW5zd2VyLWtleSBzYW5pdGl6ZXIgKFMyL1QzLCBydWxpbmcgVFY0LUEpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBHRU5FUklDIHN0cmlwIHRyYW5zZm9ybSBkcml2ZW4gZW50aXJlbHkgYnkgdGhlIHJlZ2lzdHJ5J3MgU2FuaXRpemVTcGVjXG4vLyBkZWNsYXJhdGlvbnMgXHUyMDE0IGl0IGhvbGRzIG5vIHBlci10eXBlIGtub3dsZWRnZSBvZiBpdHMgb3duIChydWxpbmcgUTFBOiB0aGVcbi8vIHJlZ2lzdHJ5IGRlY2xhcmVzLCB0cmFuc2Zvcm1zIG9iZXkpLiBSdW5zIHNlcnZlci1zaWRlIGluIHRoZSBnZXQtYWN0aXZpdHlcbi8vIEVkZ2UgRnVuY3Rpb24sIGNvbXBvc2VkIHdpdGggdXBncmFkZS1vbi1yZWFkOyB0aGUgb3V0cHV0IGlzIHdoYXQgdGhlIGR1cmFibGVcbi8vIHBlci12ZXJzaW9uIGNhY2hlIHN0b3JlcyBhbmQgdGhlIHZpZXdlciByZWNlaXZlcy4gQW5zd2VycyBORVZFUiByZWFjaCBhXG4vLyBzdHVkZW50IGNsaWVudCAocnVsaW5nIFEyQikgXHUyMDE0IHRoZSB3aXJlLWxldmVsIGxlYWsgdGVzdHMgaW5cbi8vIHRlc3RzL3Nhbml0aXplLnRlc3QudHMgYXNzZXJ0IHRoZSBvdXRjb21lLCBub3QgdGhlIG1lY2hhbmlzbS5cbi8vXG4vLyBUaHJlZSBsYXllcnMsIGluIG9yZGVyLCBwZXIgYmxvY2s6XG4vLyAgIDEuIERlY2xhcmVkIHN0cmlwcyBcdTIwMTQgdGhlIGVudHJ5J3MgYHN0cmlwYCBwYXRocywgaW4gdGhlIHRpbnkgZ3JhbW1hclxuLy8gICAgICB0eXBlcy50cyBkb2N1bWVudHMgKCdmaWVsZCcsICdmaWVsZFtdLnN1YicsICdpbnRlcmFjdGlvbi5maWVsZCcpLlxuLy8gICAyLiBDaGlsZCByZWN1cnNpb24gXHUyMDE0IGBjaGlsZEJsb2Nrc2AgZmllbGRzIHJlLWVudGVyIHRoZSBzYW5pdGl6ZXIsIHNvIGFcbi8vICAgICAgZmlsbF9pbl9ibGFuayBuZXN0ZWQgaW4gYSB3b3JrZWQgZXhhbXBsZSBpcyBzdHJpcHBlZCBieSBJVFMgT1dOIGVudHJ5LlxuLy8gICAzLiBJbi1iYW5kIGRlZXAgd2FsayBcdTIwMTQgQmxhbmtUb2tlbiBhbmQgTWF0aFByb21wdCBzZWNyZXRzIGFyZSBzdHJpcHBlZCBmcm9tXG4vLyAgICAgIGV2ZXJ5IG9iamVjdCB0aGUgYmxvY2sgY2FycmllcywgVU5DT05ESVRJT05BTExZIChub3QgZ2F0ZWQgb24gdGhlXG4vLyAgICAgIGVudHJ5J3MgYGlubGluZUJsYW5rU2VjcmV0c2AgZmxhZykuIERlZmVuc2UgaW4gZGVwdGg6IHRoZSBzY2hlbWEgYWRtaXRzXG4vLyAgICAgIGEgcHJvbXB0ZWQgbWF0aF9pbmxpbmUgaW5zaWRlIGFueSBjb250ZW50IGFycmF5IFx1MjAxNCBhIHBhcmFncmFwaCwgYSBoaW50LFxuLy8gICAgICBhIGxpc3QgaXRlbSBcdTIwMTQgYW5kIGEgZGVjbGFyYXRpb24gbWlzcyB0aGVyZSBtdXN0IG5vdCBiZWNvbWUgYSBzaWxlbnRcbi8vICAgICAgbGVhay4gVGhlIGZsYWcgc3RheXMgZGVjbGFyYXRpdmUgKHNlZSB0eXBlcy50cykuXG4vL1xuLy8gV2hhdCBzYW5pdGl6ZSBkb2VzIE5PVCBkbzogdGhlIHBlci1zdHVkZW50IGBzZXJ2ZVNodWZmbGVkYCByZW9yZGVyLiBUaGF0IGlzXG4vLyBzZXJ2ZS10aW1lIHdvcmsgKHNodWZmbGUudHMpIHByZWNpc2VseSBzbyBUSElTIG91dHB1dCBpcyBjYWNoZWFibGUgcGVyXG4vLyB2ZXJzaW9uIFx1MjAxNCB0aGUgb3JkZXIgc2VjcmV0IGNhbid0IGJlIGhhbmRsZWQgYnkgYSBzdHJpcCwgYW5kIHRoZSBzaHVmZmxlXG4vLyBjYW4ndCBiZSBoYW5kbGVkIGJ5IHRoZSBjYWNoZS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB0eXBlIHsgQWN0aXZpdHlEb2N1bWVudCwgQmxvY2sgfSBmcm9tICdAYWN0aXZpdHkvc2NoZW1hJztcbmltcG9ydCB7XG4gIEJMQU5LX1NFQ1JFVF9GSUVMRFMsXG4gIE1BVEhfUFJPTVBUX1NFQ1JFVF9GSUVMRFMsXG4gIGJsb2NrUmVnaXN0cnksXG4gIHJlZ2lzdGVyZWRCbG9ja1R5cGVzLFxufSBmcm9tICcuLi9yZWdpc3RyeS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyBQUk9NUFRfQ0FSUklFUl9UWVBFUyB9IGZyb20gJy4vcHJvbXB0Q2FycmllcnMuanMnO1xuaW1wb3J0IHR5cGUge1xuICBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50LFxuICBTYW5pdGl6ZWRCbG9jayxcbn0gZnJvbSAnLi9zYW5pdGl6ZWQtdHlwZXMuanMnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2FuaXRpemVyIHJldmlzaW9uIFx1MjAxNCB0aGUgZHVyYWJsZSBjYWNoZSdzIGludmFsaWRhdGlvbiBrZXlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgcmVhZCBjYWNoZSBzdG9yZXMgc2FuaXRpemVkIG91dHB1dCBwZXIgKHZlcnNpb25faWQsIFNBTklUSVpFUl9SRVYpLiBUaGVcbi8vIHJldiBpcyBDT01QVVRFRCBmcm9tIHRoZSByZWdpc3RyeSdzIHNhbml0aXplIGRlY2xhcmF0aW9ucyArIHRoZSBzZWNyZXQtZmllbGRcbi8vIGxpc3RzLCBzbyBjaGFuZ2luZyBhbnkgc3BlYyBhdXRvbWF0aWNhbGx5IG9ycGhhbnMgZXZlcnkgc3RhbGUgY2FjaGUgcm93IFx1MjAxNCBhXG4vLyBzYW5pdGl6ZXIgZml4IHRoYXQgcmVxdWlyZWQgYSBoYW5kLWJ1bXBlZCBjb25zdGFudCB0byB0YWtlIGVmZmVjdCBpcyBleGFjdGx5XG4vLyB0aGUgZm9yZ2V0dGFibGUtc3RlcCBjbGFzcyB0aGlzIHJlcG8gZG9jdW1lbnRzIChncmFwaC1raXQgbWFuaWZlc3QsIDAwMTUnc1xuLy8gZ3JhbnQgc3RhbnphcykuIEJ1bXAgU0FOSVRJWkVSX0FMR09fUkVWIGJ5IGhhbmQgT05MWSB3aGVuIHRoZSB0cmFuc2Zvcm1cbi8vIGxvZ2ljIGl0c2VsZiBjaGFuZ2VzIGluIGEgd2F5IHRoZSBkZWNsYXJhdGlvbnMgZG9uJ3QgY2FwdHVyZS5cblxuLy8gMSAtPiAyICgyMDI2LTA4LTIzKTogdGhlIHBlci1ibG9jayBzdHJpcHMgYmVnYW4gY292ZXJpbmcgYHJlZmVyZW5jZVBhbmVsYFxuLy8gYXMgd2VsbCBhcyB0aGUgYm9keS4gVGhpcyBpcyBFWEFDVExZIHRoZSBjYXNlIHRoZSBub3RlIGFib3ZlIHJlc2VydmVzIGEgaGFuZFxuLy8gYnVtcCBmb3IgXHUyMDE0IHRoZSB0cmFuc2Zvcm0gY2hhbmdlZCB3aGlsZSBldmVyeSBzYW5pdGl6ZSBERUNMQVJBVElPTiBzdGF5ZWRcbi8vIGlkZW50aWNhbCwgc28gdGhlIGNvbXB1dGVkIHJldiB3b3VsZCBub3QgaGF2ZSBtb3ZlZCBhbmQgZXZlcnkgY2FjaGVkIHJvd1xuLy8gd291bGQgaGF2ZSBrZXB0IHNlcnZpbmcgdGhlIGxlYWsgaXQgd2FzIHdyaXR0ZW4gd2l0aC5cbmV4cG9ydCBjb25zdCBTQU5JVElaRVJfQUxHT19SRVYgPSAyO1xuXG4vKiogRk5WLTFhIDMyLWJpdCwgaGV4LiBUaW55LCBkZXBlbmRlbmN5LWZyZWUsIHN0YWJsZSBhY3Jvc3MgSlMgcnVudGltZXMgXHUyMDE0XG4gKiB0aGlzIGlzIGEgY2FjaGUtYnVzdGluZyBmaW5nZXJwcmludCwgbm90IHNlY3VyaXR5IG1hdGVyaWFsLiAqL1xuZnVuY3Rpb24gZm52MWEodGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IGhhc2ggPSAweDgxMWM5ZGM1O1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRleHQubGVuZ3RoOyBpKyspIHtcbiAgICBoYXNoIF49IHRleHQuY2hhckNvZGVBdChpKTtcbiAgICBoYXNoID0gTWF0aC5pbXVsKGhhc2gsIDB4MDEwMDAxOTMpO1xuICB9XG4gIHJldHVybiAoaGFzaCA+Pj4gMCkudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDgsICcwJyk7XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVTYW5pdGl6ZXJSZXYoKTogc3RyaW5nIHtcbiAgY29uc3Qgc3BlY3MgPSBbLi4ucmVnaXN0ZXJlZEJsb2NrVHlwZXNdXG4gICAgLnNvcnQoKVxuICAgIC5tYXAoKHR5cGUpID0+IFt0eXBlLCBibG9ja1JlZ2lzdHJ5W3R5cGVdLnNhbml0aXplXSk7XG4gIGNvbnN0IG1hdGVyaWFsID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgIGFsZ286IFNBTklUSVpFUl9BTEdPX1JFVixcbiAgICBibGFuazogQkxBTktfU0VDUkVUX0ZJRUxEUyxcbiAgICBwcm9tcHQ6IE1BVEhfUFJPTVBUX1NFQ1JFVF9GSUVMRFMsXG4gICAgc3BlY3MsXG4gIH0pO1xuICByZXR1cm4gYCR7U0FOSVRJWkVSX0FMR09fUkVWfS0ke2ZudjFhKG1hdGVyaWFsKX1gO1xufVxuXG4vKiogVGhlIGNhY2hlIGtleSBjb21wb25lbnQuIFN0YWJsZSBmb3IgYSBnaXZlbiByZWdpc3RyeSArIGFsZ29yaXRobTsgY2hhbmdlc1xuICogd2hlbmV2ZXIgYW55IHNhbml0aXplIGRlY2xhcmF0aW9uIGNoYW5nZXMuICovXG5leHBvcnQgY29uc3QgU0FOSVRJWkVSX1JFViA9IGNvbXB1dGVTYW5pdGl6ZXJSZXYoKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzdHJpcCBncmFtbWFyIChleGFjdGx5IHdoYXQgdHlwZXMudHMgZG9jdW1lbnRzIFx1MjAxNCBub3RoaW5nIG1vcmUpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBhcHBseVN0cmlwUGF0aChibG9jazogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIHBhdGg6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBhcnJheUlkeCA9IHBhdGguaW5kZXhPZignW10uJyk7XG4gIGlmIChhcnJheUlkeCAhPT0gLTEpIHtcbiAgICAvLyAnZmllbGRbXS5zdWInIFx1MjAxNCBkZWxldGUgYHN1YmAgZnJvbSBldmVyeSBlbGVtZW50IG9mIGFycmF5IGBmaWVsZGAuXG4gICAgY29uc3QgZmllbGQgPSBwYXRoLnNsaWNlKDAsIGFycmF5SWR4KTtcbiAgICBjb25zdCBzdWIgPSBwYXRoLnNsaWNlKGFycmF5SWR4ICsgMyk7XG4gICAgY29uc3QgYXJyID0gYmxvY2tbZmllbGRdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgIGZvciAoY29uc3QgZWwgb2YgYXJyKSB7XG4gICAgICAgIGlmIChlbCAhPT0gbnVsbCAmJiB0eXBlb2YgZWwgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgZGVsZXRlIChlbCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilbc3ViXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgZG90SWR4ID0gcGF0aC5pbmRleE9mKCcuJyk7XG4gIGlmIChkb3RJZHggIT09IC0xKSB7XG4gICAgLy8gJ3BhcmVudC5maWVsZCcgXHUyMDE0IGRlbGV0ZSBgZmllbGRgIGZyb20gdGhlIG5lc3RlZCBvYmplY3Qgd2hlbiBwcmVzZW50LlxuICAgIC8vIFZhcmlhbnQtc2NvcGVkIGtleXMgc2ltcGx5IGRvbid0IG1hdGNoIG9uIG90aGVyIHZhcmlhbnRzLlxuICAgIGNvbnN0IHBhcmVudCA9IGJsb2NrW3BhdGguc2xpY2UoMCwgZG90SWR4KV07XG4gICAgaWYgKHBhcmVudCAhPT0gbnVsbCAmJiB0eXBlb2YgcGFyZW50ID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShwYXJlbnQpKSB7XG4gICAgICBkZWxldGUgKHBhcmVudCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilbcGF0aC5zbGljZShkb3RJZHggKyAxKV07XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuICAvLyAnZmllbGQnIFx1MjAxNCBkZWxldGUgdGhlIGJsb2NrJ3MgdG9wLWxldmVsIGZpZWxkLlxuICBkZWxldGUgYmxvY2tbcGF0aF07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBJbi1iYW5kIHNlY3JldHMgXHUyMDE0IHRoZSB1bmNvbmRpdGlvbmFsIGRlZXAgd2FsayAobGF5ZXIgMylcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQUk9NUFRfQ0FSUklFUl9UWVBFUyBpcyBzaW5nbGUtc291cmNlZCAocHJvbXB0Q2FycmllcnMudHMpIFx1MjAxNCB0aGUgZ3JhZGluZ1xuLy8gd2FsayBjb25zdW1lcyB0aGUgc2FtZSByb3N0ZXIsIGFuZCB0d28gZGVjbGFyYXRpb25zIGRyaWZ0ZWQtcmlzayBhIHNpbGVudFxuLy8gbGVhayBvciBhIHNpbGVudCBtaXMtZ3JhZGUgKEE3KS5cblxuZnVuY3Rpb24gc3RyaXBJbkJhbmRTZWNyZXRzKHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIGZvciAoY29uc3QgZWwgb2YgdmFsdWUpIHN0cmlwSW5CYW5kU2VjcmV0cyhlbCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSByZXR1cm47XG4gIGNvbnN0IG9iaiA9IHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIGlmIChvYmoudHlwZSA9PT0gJ2JsYW5rJykge1xuICAgIGZvciAoY29uc3QgZmllbGQgb2YgQkxBTktfU0VDUkVUX0ZJRUxEUykgZGVsZXRlIG9ialtmaWVsZF07XG4gIH1cbiAgaWYgKFxuICAgIHR5cGVvZiBvYmoudHlwZSA9PT0gJ3N0cmluZycgJiZcbiAgICBQUk9NUFRfQ0FSUklFUl9UWVBFUy5oYXMob2JqLnR5cGUpICYmXG4gICAgQXJyYXkuaXNBcnJheShvYmoucHJvbXB0cylcbiAgKSB7XG4gICAgZm9yIChjb25zdCBwcm9tcHQgb2Ygb2JqLnByb21wdHMpIHtcbiAgICAgIGlmIChwcm9tcHQgIT09IG51bGwgJiYgdHlwZW9mIHByb21wdCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yIChjb25zdCBmaWVsZCBvZiBNQVRIX1BST01QVF9TRUNSRVRfRklFTERTKSB7XG4gICAgICAgICAgZGVsZXRlIChwcm9tcHQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW2ZpZWxkXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvYmopKSBzdHJpcEluQmFuZFNlY3JldHMob2JqW2tleV0pO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUGVyLWJsb2NrIHNhbml0aXplXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogTXV0YXRpbmcgY29yZSBcdTIwMTQgb3BlcmF0ZXMgb24gYW4gYWxyZWFkeS1jbG9uZWQgYmxvY2suICovXG5cbi8vIC0tLS0gRGVyaXZlZCBxdWVzdGlvbiBzaGFwZSAodGhlIG9uZSBBRERJVElWRSBzdGVwKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc2FuaXRpemVyJ3Mgam9iIGlzIHJlbW92YWw7IHRoaXMgaXMgdGhlIHNpbmdsZSBleGNlcHRpb24sIGFuZCBpdCBpc1xuLy8gZmVuY2VkIGFjY29yZGluZ2x5LlxuLy9cbi8vIFdoeSBpdCBleGlzdHM6IHRoZSBncmFwaCB3aWRnZXRzIHRha2UgdGhlaXIgaGFuZGxlIGNvdW50IGFuZCBjdXJ2ZSBmYW1pbHlcbi8vIGZyb20gdGhlIGFuc3dlciBrZXkuIFRoZSB2aWV3ZXIgbmV2ZXIgcmVjZWl2ZXMgYSBrZXksIHNvIHdpdGhvdXQgdGhpcyBhXG4vLyBzZXJ2ZWQgZ3JhcGggcXVlc3Rpb24gY2Fubm90IGJlIGxhaWQgb3V0IFx1MjAxNCB0aGVyZSBpcyBubyB3YXkgdG8ga25vdyB3aGV0aGVyXG4vLyB0byBkcmF3IG9uZSBoYW5kbGUgb3IgdGhyZWUuXG4vL1xuLy8gV2h5IGl0IGlzIHNhZmU6IHdoYXQgbGVhdmVzIGhlcmUgaXMgcXVlc3Rpb24gU0hBUEUsIHdoaWNoIHRoZSBzdHVkZW50IGNhblxuLy8gYWxyZWFkeSBzZWUgKGhvdyBtYW55IGhhbmRsZXM7IHdoaWNoIGZhbWlseSdzIGN1cnZlIGZvbGxvd3MgdGhlaXIgZHJhZ3MpLFxuLy8gbmV2ZXIgdGhlIGNvb3JkaW5hdGVzLCB0b2xlcmFuY2VzLCBvciBjb2VmZmljaWVudHMgdGhhdCBtYWtlIGFuIGFuc3dlci4gVGhlXG4vLyBndWFyYW50ZWUgaXMgU1RSVUNUVVJBTCByYXRoZXIgdGhhbiBhIHByb21pc2UgYWJvdXQgdGhpcyBjb2RlOiBldmVyeSB2YWx1ZVxuLy8gcGFzc2VzIGEgd2hpdGVsaXN0IG9uIHRoZSB3YXkgb3V0IFx1MjAxNCBzbWFsbCBwb3NpdGl2ZSBpbnRlZ2Vycywgb3IgYSBmYW1pbHlcbi8vIG5hbWUgZnJvbSBhIGNsb3NlZCBzZXQgXHUyMDE0IHNvIGEgY29vcmRpbmF0ZSBjYW5ub3QgdHJhdmVsIHRoaXMgcGF0aCBldmVuIGlmIGFcbi8vIGZ1dHVyZSBlZGl0IHRyaWVkIHRvIHNlbmQgb25lLiBBbnl0aGluZyBmYWlsaW5nIHRoZSB3aGl0ZWxpc3QgaXMgZHJvcHBlZCxcbi8vIG5vdCBwYXNzZWQgdGhyb3VnaCAoZmFpbCBjbG9zZWQsIGxpa2UgdGhlIHVua25vd24tYmxvY2stdHlwZSB0aHJvdykuXG5cbi8qKiBVcHBlciBib3VuZCBvbiBhIGhhbmRsZSBjb3VudC4gRmFyIGFib3ZlIGFueSByZWFsIHF1ZXN0aW9uOyBleGlzdHMgc28gYVxuICogY29ycnVwdCBvciBob3N0aWxlIGxlbmd0aCBjYW4ndCBiZWNvbWUgYW4gYWJzdXJkIGFsbG9jYXRpb24gZG93bnN0cmVhbS4gKi9cbmNvbnN0IE1BWF9IQU5ETEVTID0gMjQ7XG5cbi8qKiBDdXJ2ZSBmYW1pbGllcyB0aGUgd2lkZ2V0IGxheXMgb3V0LiBDbG9zZWQgc2V0OiBhbiB1bnJlY29nbml6ZWQgZmFtaWx5IGlzXG4gKiBkcm9wcGVkIGFuZCB0aGUgd2lkZ2V0IGZhbGxzIGJhY2sgdG8gaXRzIG93biBkZWZhdWx0LiAqL1xuY29uc3QgS05PV05fRkFNSUxJRVM6IFJlYWRvbmx5U2V0PHN0cmluZz4gPSBuZXcgU2V0KFtcbiAgJ2xpbmVhcicsXG4gICdxdWFkcmF0aWMnLFxuICAnZXhwb25lbnRpYWwnLFxuICAnbG9nYXJpdGhtaWMnLFxuICAndmVydGljYWwnLFxuICAnYWJzb2x1dGUnLFxuICAnc3FydCcsXG4gICdjdWJpYycsXG5dKTtcblxuZXhwb3J0IGludGVyZmFjZSBRdWVzdGlvblNoYXBlIHtcbiAgaGFuZGxlQ291bnQ/OiBudW1iZXI7XG4gIGZhbWlseT86IHN0cmluZztcbiAgdmVydGV4Q291bnQ/OiBudW1iZXI7XG59XG5cbi8qKiBBIGNvdW50IHN1cnZpdmVzIG9ubHkgYXMgYSBzbWFsbCBwb3NpdGl2ZSBpbnRlZ2VyLiAqL1xuZnVuY3Rpb24gc2FmZUNvdW50KHZhbHVlOiB1bmtub3duKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiZcbiAgICBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSAmJlxuICAgIHZhbHVlID4gMCAmJlxuICAgIHZhbHVlIDw9IE1BWF9IQU5ETEVTXG4gICAgPyB2YWx1ZVxuICAgIDogdW5kZWZpbmVkO1xufVxuXG4vKiogQSBmYW1pbHkgc3Vydml2ZXMgb25seSBpZiBpdCBpcyBhIGtub3duIG5hbWUuICovXG5mdW5jdGlvbiBzYWZlRmFtaWx5KHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgS05PV05fRkFNSUxJRVMuaGFzKHZhbHVlKVxuICAgID8gdmFsdWVcbiAgICA6IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBEZXJpdmUgdGhlIHNlcnZlZCBxdWVzdGlvbiBzaGFwZSBmcm9tIGFuIFVOU0FOSVRJWkVEIGJsb2NrIChpdCByZWFkcyB0aGVcbiAqIGFuc3dlciBrZXksIHNvIGl0IG11c3QgcnVuIGJlZm9yZSB0aGUgc3RyaXBzKS4gUmV0dXJucyB1bmRlZmluZWQgd2hlbiB0aGVyZVxuICogaXMgbm90aGluZyB0byBzYXkgXHUyMDE0IGEgZGlzcGxheS1tb2RlIGdyYXBoIHRha2VzIG5vIGlucHV0IGFuZCBnZXRzIG5vIHNoYXBlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVyaXZlUXVlc3Rpb25TaGFwZShcbiAgYmxvY2s6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogUXVlc3Rpb25TaGFwZSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGludGVyYWN0aW9uID0gYmxvY2suaW50ZXJhY3Rpb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XG4gIGNvbnN0IGtpbmQgPSB0eXBlb2YgaW50ZXJhY3Rpb24/LnR5cGUgPT09ICdzdHJpbmcnID8gaW50ZXJhY3Rpb24udHlwZSA6IG51bGw7XG4gIGlmICgha2luZCB8fCBraW5kID09PSAnZGlzcGxheScpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgY29uc3Qgc2hhcGU6IFF1ZXN0aW9uU2hhcGUgPSB7fTtcblxuICAvLyBQb2ludC1zdHlsZSBpbnRlcmFjdGlvbnM6IG9uZSBoYW5kbGUgcGVyIGF1dGhvcmVkIHRhcmdldC4gVGhpcyBtaXJyb3JzXG4gIC8vIGV4YWN0bHkgd2hhdCB0aGUgZ3JhZGVkIHdpZGdldCBhbHJlYWR5IGRvZXMgd2l0aCB0aGUga2V5XG4gIC8vIChjb3VudCA9IGNvcnJlY3RQb2ludHMubGVuZ3RoKSwgc28gYSBzdHVkZW50IHNlZXMgdGhlIHNhbWUgd2lkZ2V0IGVpdGhlclxuICAvLyB3YXkgXHUyMDE0IHRoZSBudW1iZXIgb2YgaGFuZGxlcyBpcyBub3QgdGhlIHNlY3JldCwgdGhlaXIgcG9zaXRpb25zIGFyZS5cbiAgY29uc3QgcG9pbnRzID0gaW50ZXJhY3Rpb24/LmNvcnJlY3RQb2ludHM7XG4gIGlmIChBcnJheS5pc0FycmF5KHBvaW50cykpIHtcbiAgICBjb25zdCBjb3VudCA9IHNhZmVDb3VudChwb2ludHMubGVuZ3RoKTtcbiAgICBpZiAoY291bnQgIT09IHVuZGVmaW5lZCkgc2hhcGUuaGFuZGxlQ291bnQgPSBjb3VudDtcbiAgfVxuXG4gIC8vIEN1cnZlIGZhbWlsaWVzOiB0aGUgc2hhcGUgb2YgdGhlIGN1cnZlIHRoYXQgZm9sbG93cyB0aGUgc3R1ZGVudCdzIGRyYWdzLlxuICBjb25zdCBtb2RlbHMgPSBpbnRlcmFjdGlvbj8ubW9kZWxzO1xuICBpZiAoQXJyYXkuaXNBcnJheShtb2RlbHMpICYmIG1vZGVscy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZmFtaWx5ID0gc2FmZUZhbWlseShcbiAgICAgIChtb2RlbHNbMF0gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsKT8uZmFtaWx5LFxuICAgICk7XG4gICAgaWYgKGZhbWlseSAhPT0gdW5kZWZpbmVkKSBzaGFwZS5mYW1pbHkgPSBmYW1pbHk7XG4gIH1cblxuICAvLyBBbiBpbmVxdWFsaXR5J3MgYm91bmRhcnkgcmlkZXMgdGhlIHNhbWUgZmFtaWx5IG1hY2hpbmVyeS5cbiAgY29uc3QgaW5lcXVhbGl0aWVzID0gaW50ZXJhY3Rpb24/LmluZXF1YWxpdGllcztcbiAgaWYgKEFycmF5LmlzQXJyYXkoaW5lcXVhbGl0aWVzKSAmJiBpbmVxdWFsaXRpZXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGJvdW5kYXJ5ID0gKGluZXF1YWxpdGllc1swXSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGwpXG4gICAgICA/LmJvdW5kYXJ5IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGZhbWlseSA9IHNhZmVGYW1pbHkoYm91bmRhcnk/LmZhbWlseSk7XG4gICAgaWYgKGZhbWlseSAhPT0gdW5kZWZpbmVkKSBzaGFwZS5mYW1pbHkgPSBmYW1pbHk7XG4gIH1cblxuICAvLyBQb2x5Z29uIHZlcnRleCBjb3VudCBmb3Igc2hhZGVfcmVnaW9uLlxuICBjb25zdCByZWdpb25zID0gaW50ZXJhY3Rpb24/LnJlZ2lvbnM7XG4gIGlmIChBcnJheS5pc0FycmF5KHJlZ2lvbnMpICYmIHJlZ2lvbnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IHZlcnRpY2VzID0gKHJlZ2lvbnNbMF0gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsKVxuICAgICAgPy5jb3JyZWN0VmVydGljZXM7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmVydGljZXMpKSB7XG4gICAgICBjb25zdCBjb3VudCA9IHNhZmVDb3VudCh2ZXJ0aWNlcy5sZW5ndGgpO1xuICAgICAgaWYgKGNvdW50ICE9PSB1bmRlZmluZWQpIHNoYXBlLnZlcnRleENvdW50ID0gY291bnQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5rZXlzKHNoYXBlKS5sZW5ndGggPiAwID8gc2hhcGUgOiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplQmxvY2tNdXQoYmxvY2s6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZCB7XG4gIGNvbnN0IHR5cGUgPSBibG9jay50eXBlO1xuICBjb25zdCBlbnRyeSA9XG4gICAgdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnICYmIHR5cGUgaW4gYmxvY2tSZWdpc3RyeVxuICAgICAgPyBibG9ja1JlZ2lzdHJ5W3R5cGUgYXMga2V5b2YgdHlwZW9mIGJsb2NrUmVnaXN0cnldXG4gICAgICA6IHVuZGVmaW5lZDtcbiAgaWYgKCFlbnRyeSkge1xuICAgIC8vIEEgdmFsaWRhdGVkIEFjdGl2aXR5RG9jdW1lbnQgY2FuJ3QgZ2V0IGhlcmUgKHRoZSByZWdpc3RyeSBjb3ZlcmFnZSBndWFyZFxuICAgIC8vIHByb3ZlcyBleGFjdCBhZ3JlZW1lbnQgd2l0aCB0aGUgQmxvY2sgdW5pb24pIFx1MjAxNCBidXQgdGhlIHNhbml0aXplciBzaXRzIG9uXG4gICAgLy8gdGhlIHdpcmUgYm91bmRhcnksIHNvIGFuIHVua25vd24gdHlwZSBmYWlscyBDTE9TRUQsIG5ldmVyIHBhc3NlcyB0aHJvdWdoLlxuICAgIHRocm93IG5ldyBFcnJvcihgc2FuaXRpemU6IHVua25vd24gYmxvY2sgdHlwZSAke1N0cmluZyh0eXBlKX1gKTtcbiAgfVxuXG4gIC8vIERlcml2ZWQgc2hhcGUgaXMgY29tcHV0ZWQgQkVGT1JFIHRoZSBzdHJpcHMgKGl0IHJlYWRzIHRoZSBhbnN3ZXIga2V5KSBhbmRcbiAgLy8gYXR0YWNoZWQgYWZ0ZXIsIHNvIHRoZSBzZXJ2ZWQgYmxvY2sgY2FycmllcyBvbmx5IHRoZSB3aGl0ZWxpc3RlZCByZXN1bHQuXG4gIGNvbnN0IHNoYXBlID0gZW50cnkuc2FuaXRpemUuZGVyaXZlUXVlc3Rpb25TaGFwZVxuICAgID8gZGVyaXZlUXVlc3Rpb25TaGFwZShibG9jaylcbiAgICA6IHVuZGVmaW5lZDtcblxuICBmb3IgKGNvbnN0IHBhdGggb2YgZW50cnkuc2FuaXRpemUuc3RyaXApIGFwcGx5U3RyaXBQYXRoKGJsb2NrLCBwYXRoKTtcblxuICBpZiAoc2hhcGUpIGJsb2NrLnF1ZXN0aW9uU2hhcGUgPSBzaGFwZTtcblxuICBmb3IgKGNvbnN0IGZpZWxkIG9mIGVudHJ5LnNhbml0aXplLmNoaWxkQmxvY2tzID8/IFtdKSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBibG9ja1tmaWVsZF07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChjaGlsZCAhPT0gbnVsbCAmJiB0eXBlb2YgY2hpbGQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgc2FuaXRpemVCbG9ja011dChjaGlsZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdHJpcEluQmFuZFNlY3JldHMoYmxvY2spO1xufVxuXG4vKipcbiAqIFNhbml0aXplIGEgbG9vc2UgSU5MSU5FLUNPTlRFTlQgYXJyYXkgcHVsbGVkIG91dCBvZiB0aGUgcmF3IGRvY3VtZW50IChwdXJlKS5cbiAqXG4gKiBTNCdzIGdyYWRpbmcgUlBDIGlzIGEgc2Vjb25kIHNlcnZlclx1MjE5MmNsaWVudCBjaGFubmVsOiBpdCByZXR1cm5zIGF1dGhvcmVkXG4gKiBgZmVlZGJhY2tgIGFuZCBgc29sdXRpb25gIGNvbnRlbnQgdGhhdCB0aGUgcmVhZCBBUEkgZGVsaWJlcmF0ZWx5IHN0cmlwcGVkIGFuZFxuICogdGhlIHNlcnZlciByZWxlYXNlcyBvbmx5IGFmdGVyIGEgY2hlY2suIFRob3NlIGFyZSBgSW5saW5lTm9kZVtdYCwgYW5kIGFuXG4gKiBpbmxpbmUgYXJyYXkgY2FuIGNhcnJ5IGluLWJhbmQgc2VjcmV0cyBcdTIwMTQgYSBwcm9tcHRlZCBgbWF0aF9pbmxpbmVgIHNpdHRpbmdcbiAqIGluc2lkZSBhIHNvbHV0aW9uIHBhcmFncmFwaCwgb3IgYSBwYXN0ZWQgYmxhbmsgdG9rZW4gXHUyMDE0IHNvIGl0IG11c3QgZ28gdGhyb3VnaFxuICogdGhlIFNBTUUgdW5jb25kaXRpb25hbCBkZWVwIHdhbGsgdGhlIHNlcnZlZCBkb2N1bWVudCBkb2VzLiBXaXRob3V0IHRoaXMsIGFuXG4gKiBhdXRob3JlZCBzb2x1dGlvbiBjb250YWluaW5nIGEgYmxhbmsgd291bGQgaGFuZCBldmVyeSBjaGVja2luZyBzdHVkZW50IHRoYXRcbiAqIGJsYW5rJ3MgYW5zd2Vycywgc2lsZW50bHkuXG4gKlxuICogUmV1c2luZyBgc3RyaXBJbkJhbmRTZWNyZXRzYCByYXRoZXIgdGhhbiByZWltcGxlbWVudGluZyBpdCBpcyB0aGUgcG9pbnQ6IHRoZVxuICogc2VjcmV0LWZpZWxkIGxpc3RzIGxpdmUgaW4gdGhlIHJlZ2lzdHJ5LCBhbmQgYSBmdXR1cmUgYWRkaXRpb24gdG8gdGhlbSBoYXMgdG9cbiAqIHByb3RlY3QgYm90aCBjaGFubmVscyBhdXRvbWF0aWNhbGx5IG9yIGl0IHByb3RlY3RzIG5laXRoZXIuXG4gKlxuICogUmV0dXJucyBhIGNsb25lOyB0aGUgY2FsbGVyJ3MgYXJyYXkgaXMgbmV2ZXIgbXV0YXRlZCAoaXQgYmVsb25ncyB0byB0aGVcbiAqIGNhY2hlZCByYXcgZG9jdW1lbnQpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVJbmxpbmVDb250ZW50PFQ+KG5vZGVzOiBUW10pOiBUW10ge1xuICBjb25zdCBjbG9uZSA9IHN0cnVjdHVyZWRDbG9uZShub2Rlcyk7XG4gIHN0cmlwSW5CYW5kU2VjcmV0cyhjbG9uZSk7XG4gIHJldHVybiBjbG9uZTtcbn1cblxuLyoqIFNhbml0aXplIE9ORSBibG9jayAocHVyZSkuIEV4cG9zZWQgZm9yIHRlc3RzIGFuZCBwZXItYmxvY2sgdG9vbGluZzsgdGhlXG4gKiBkb2N1bWVudC1sZXZlbCBlbnRyeSBwb2ludCBiZWxvdyBpcyB3aGF0IHRoZSByZWFkIEFQSSB1c2VzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplQmxvY2soYmxvY2s6IEJsb2NrKTogU2FuaXRpemVkQmxvY2sge1xuICBjb25zdCBjbG9uZSA9IHN0cnVjdHVyZWRDbG9uZShibG9jaykgYXMgdW5rbm93biBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgc2FuaXRpemVCbG9ja011dChjbG9uZSk7XG4gIHJldHVybiBjbG9uZSBhcyB1bmtub3duIGFzIFNhbml0aXplZEJsb2NrO1xufVxuXG4vKipcbiAqIFNhbml0aXplIGEgZnVsbCB1cGdyYWRlZCBkb2N1bWVudCAocHVyZSkuIEV2ZXJ5IGJsb2NrIHRoZSBkb2N1bWVudCBzaGlwcyBcdTIwMTRcbiAqIGJvZHkgQU5EIHJlZmVyZW5jZSBwYW5lbCBcdTIwMTQgZ29lcyB0aHJvdWdoIGl0cyByZWdpc3RyeSBlbnRyeTsgdGhlIGluLWJhbmQgZGVlcFxuICogd2FsayB0aGVuIGNvdmVycyB3aGF0ZXZlciBpcyBsZWZ0IChtZXRhLCBpbmxpbmUgbm9kZXMgYW55d2hlcmUpIGFzIGRlZmVuc2UgaW5cbiAqIGRlcHRoLlxuICpcbiAqIFx1MjZBMCBUaGUgcmVmZXJlbmNlIHBhbmVsIHdhcyBOT1QgaW4gdGhhdCBzZXQgdW50aWwgMjAyNi0wOC0yMywgYW5kIHRoZSBjb21tZW50XG4gKiBoZXJlIGFzc2VydGVkIHRoZSByZWFzb24gaXQgZGlkIG5vdCBuZWVkIHRvIGJlOiBcInRob3NlIHN1cmZhY2VzIGNhcnJ5IG5vXG4gKiBkZWNsYXJlZCBhbnN3ZXIga2V5c1wiLiBUaGF0IHdhcyBmYWxzZS4gYFJlZmVyZW5jZVBhbmVsLmJsb2Nrc2AgaXNcbiAqIGB6LmFycmF5KEJsb2NrKWAgXHUyMDE0IHRoZSBTQU1FIGZ1bGwgdW5pb24gYXMgc2VjdGlvbiBjb250ZW50LCBtdWx0aXBsZSBjaG9pY2VcbiAqIGFuZCBtYXRjaGluZyBpbmNsdWRlZCBcdTIwMTQgc28gYSBrZXktYmVhcmluZyBibG9jayBpbiBhIHBhbmVsIHJlYWNoZWQgdGhlIHN0dWRlbnRcbiAqIHdpdGggaXRzIGtleSBpbnRhY3QsIGJlY2F1c2UgdGhlIGRlZXAgd2FsayBiZWxvdyBrbm93cyBvbmx5IGFib3V0IGJsYW5rcyBhbmRcbiAqIG1hdGggcHJvbXB0cy4gVGhlIGxlYWsgZml4dHVyZSBub3cgcGxhbnRzIGV2ZXJ5IGJsb2NrIHR5cGUgaW4gdGhlIHBhbmVsIHRvbyxcbiAqIHNvIHRoaXMgaXMgYSB3aXJlLXNjYW5uZWQgcHJvcGVydHkgcmF0aGVyIHRoYW4gYSBjbGFpbSBpbiBhIGNvbW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUFjdGl2aXR5RG9jdW1lbnQoXG4gIGRvYzogQWN0aXZpdHlEb2N1bWVudCxcbik6IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQge1xuICBjb25zdCBjbG9uZSA9IHN0cnVjdHVyZWRDbG9uZShkb2MpIGFzIHVua25vd24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gJiB7XG4gICAgc2VjdGlvbnM6IEFycmF5PHtcbiAgICAgIHJvd3M6IEFycmF5PHsgY29sdW1uczogQXJyYXk8eyBibG9ja3M6IHVua25vd25bXSB9PiB9PjtcbiAgICB9PjtcbiAgfTtcbiAgZm9yIChjb25zdCBzZWN0aW9uIG9mIGNsb25lLnNlY3Rpb25zKSB7XG4gICAgZm9yIChjb25zdCByb3cgb2Ygc2VjdGlvbi5yb3dzKSB7XG4gICAgICBmb3IgKGNvbnN0IGNvbHVtbiBvZiByb3cuY29sdW1ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGJsb2NrIG9mIGNvbHVtbi5ibG9ja3MpIHtcbiAgICAgICAgICBpZiAoYmxvY2sgIT09IG51bGwgJiYgdHlwZW9mIGJsb2NrID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgc2FuaXRpemVCbG9ja011dChibG9jayBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vIFRoZSByZWZlcmVuY2UgcGFuZWwgc2hpcHMgdGhlIHNhbWUgQmxvY2sgdW5pb24gdGhlIGJvZHkgZG9lcywgc28gaXQgZ2V0c1xuICAvLyB0aGUgc2FtZSBwZXItYmxvY2sgdHJlYXRtZW50LiBTY2FmZm9sZCBieSBpbnRlbnQgaXMgbm90IHNjYWZmb2xkIGJ5IFNDSEVNQS5cbiAgY29uc3QgcGFuZWwgPSBjbG9uZS5yZWZlcmVuY2VQYW5lbDtcbiAgaWYgKHBhbmVsICE9PSBudWxsICYmIHR5cGVvZiBwYW5lbCA9PT0gJ29iamVjdCcpIHtcbiAgICBjb25zdCBwYW5lbEJsb2NrcyA9IChwYW5lbCBhcyB7IGJsb2Nrcz86IHVua25vd24gfSkuYmxvY2tzO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHBhbmVsQmxvY2tzKSkge1xuICAgICAgZm9yIChjb25zdCBibG9jayBvZiBwYW5lbEJsb2Nrcykge1xuICAgICAgICBpZiAoYmxvY2sgIT09IG51bGwgJiYgdHlwZW9mIGJsb2NrID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHNhbml0aXplQmxvY2tNdXQoYmxvY2sgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vIEV2ZXJ5dGhpbmcgZWxzZSAobWV0YSwgYW5kIGFueSBpbmxpbmUgbm9kZSBhbnl3aGVyZSkgXHUyMDE0IGluLWJhbmQgc2VjcmV0cy5cbiAgc3RyaXBJbkJhbmRTZWNyZXRzKGNsb25lKTtcbiAgcmV0dXJuIGNsb25lIGFzIHVua25vd24gYXMgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudDtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2FuaXRpemUvc2h1ZmZsZS50cyBcdTIwMTQgc2VydmUtdGltZSBkZXRlcm1pbmlzdGljIHNodWZmbGVzIChTMiwgU2FuaXRpemVTcGVjKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSByZWdpc3RyeSdzIGBzZXJ2ZVNodWZmbGVkYCBtYXJrcyBhcnJheXMgd2hvc2UgQVVUSE9SRUQgT1JERVIgaXMgdGhlXG4vLyBhbnN3ZXIga2V5IChvcmRlcmluZy5pdGVtcykgXHUyMDE0IGEgc3RyaXAgY2FuJ3QgaGVscCB3aGVuIHRoZSBvcmRlciBpdHNlbGYgaXNcbi8vIHRoZSBzZWNyZXQsIHNvIHRoZSBzZXJ2ZXIgc2VydmVzIGEgcGVybXV0YXRpb24uIFJlcXVpcmVtZW50cyBmcm9tIHRoZSBzcGVjOlxuLy9cbi8vICAgLSBEZXRlcm1pbmlzdGljIHBlciAodmVyc2lvbiwgc3R1ZGVudCk6IHRoZSByZWFkIEFQSSBzZWVkcyB3aXRoXG4vLyAgICAgYCR7dmVyc2lvbl9pZH06JHt1c2VyX2lkfWAsIHNvIGEgcmVsb2FkIChvciBhbiBIVFRQLWNhY2hlIG1pc3MpIHNlcnZlc1xuLy8gICAgIHRoZSBTQU1FIG9yZGVyIFx1MjAxNCB0aGUgc3R1ZGVudCdzIHNjcmVlbiBuZXZlciByZXNodWZmbGVzIHVuZGVyIHRoZW0uXG4vLyAgIC0gQXBwbGllZCBhdCBTRVJWRSB0aW1lLCBhZnRlciB0aGUgcGVyLXZlcnNpb24gY2FjaGU6IHRoZSBjYWNoZWQgYXJ0aWZhY3Rcbi8vICAgICBpcyBzdHVkZW50LWluZGVwZW5kZW50ICh0aGF0J3Mgd2hhdCBtYWtlcyBpdCBjYWNoZWFibGUpOyB0aGlzIHRyYW5zZm9ybVxuLy8gICAgIGlzIGNoZWFwIGVub3VnaCB0byBydW4gcGVyIHJlcXVlc3QuXG4vLyAgIC0gUGVyLWJsb2NrIHN1Yi1zZWVkaW5nOiB0d28gb3JkZXJpbmcgYmxvY2tzIGluIG9uZSBhY3Rpdml0eSBnZXRcbi8vICAgICBpbmRlcGVuZGVudCBwZXJtdXRhdGlvbnMgKGJsb2NrIGlkICsgZmllbGQgam9pbiB0aGUgc2VlZCkuXG4vL1xuLy8gR3JhZGluZyBpcyBvcmRlci1pbmRlcGVuZGVudCAocmVzcG9uc2VzIHJlZmVyZW5jZSBpdGVtIGlkcywgYW5kIHRoZSBzZXJ2ZXJcbi8vIGdyYWRlcyBhZ2FpbnN0IHRoZSBhdXRob3JlZCBrZXkpLCBzbyB0aGUgcGVybXV0YXRpb24gaXMgcHJlc2VudGF0aW9uLW9ubHkgXHUyMDE0XG4vLyBidXQgaXRzIHN0YWJpbGl0eSBpcyBhIFVYIGNvbnRyYWN0LCBub3QgYSBuaWNldHkuXG4vL1xuLy8gVGhlIFBSTkcgaXMgYSBzZWVkZWQgeG9yc2hpZnQtc3R5bGUgZ2VuZXJhdG9yIChtdWxiZXJyeTMyKSBvdmVyIGFuIEZOVi0xYVxuLy8gc2VlZCBcdTIwMTQgZGV0ZXJtaW5pc3RpYyBhY3Jvc3MgSlMgcnVudGltZXMsIGRlcGVuZGVuY3ktZnJlZS4gTm90IGNyeXB0b2dyYXBoaWMsXG4vLyBkZWxpYmVyYXRlbHk6IHRoZSB0aHJlYXQgbW9kZWwgaXMgXCJkb24ndCBzZXJ2ZSB0aGUgYXV0aG9yZWQgb3JkZXIsXCIgbm90XG4vLyBcIm1ha2UgdGhlIHBlcm11dGF0aW9uIHVucHJlZGljdGFibGUgdG8gYSBkZXRlcm1pbmVkIHN0dWRlbnQgd2l0aCBhIGRlYnVnZ2VyXCJcbi8vICh0aGUgYW5zd2VyIGtleSBuZXZlciBsZWF2ZXMgdGhlIHNlcnZlciBlaXRoZXIgd2F5KS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IGJsb2NrUmVnaXN0cnkgfSBmcm9tICcuLi9yZWdpc3RyeS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgdHlwZSB7IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQgfSBmcm9tICcuL3Nhbml0aXplZC10eXBlcy5qcyc7XG5cbi8qKiBGTlYtMWEgMzItYml0IG92ZXIgYSBzdHJpbmcgXHUyMTkyIHVpbnQzMiBzZWVkLiAqL1xuZnVuY3Rpb24gc2VlZEZyb20odGV4dDogc3RyaW5nKTogbnVtYmVyIHtcbiAgbGV0IGhhc2ggPSAweDgxMWM5ZGM1O1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRleHQubGVuZ3RoOyBpKyspIHtcbiAgICBoYXNoIF49IHRleHQuY2hhckNvZGVBdChpKTtcbiAgICBoYXNoID0gTWF0aC5pbXVsKGhhc2gsIDB4MDEwMDAxOTMpO1xuICB9XG4gIHJldHVybiBoYXNoID4+PiAwO1xufVxuXG4vKiogbXVsYmVycnkzMiBcdTIwMTQgdGlueSBkZXRlcm1pbmlzdGljIFBSTkcsIHVuaWZvcm0gZW5vdWdoIGZvciBhIHNodWZmbGUuICovXG5mdW5jdGlvbiBtdWxiZXJyeTMyKHNlZWQ6IG51bWJlcik6ICgpID0+IG51bWJlciB7XG4gIGxldCBhID0gc2VlZCA+Pj4gMDtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBhID0gKGEgKyAweDZkMmI3OWY1KSA+Pj4gMDtcbiAgICBsZXQgdCA9IGE7XG4gICAgdCA9IE1hdGguaW11bCh0IF4gKHQgPj4+IDE1KSwgdCB8IDEpO1xuICAgIHQgXj0gdCArIE1hdGguaW11bCh0IF4gKHQgPj4+IDcpLCB0IHwgNjEpO1xuICAgIHJldHVybiAoKHQgXiAodCA+Pj4gMTQpKSA+Pj4gMCkgLyA0Mjk0OTY3Mjk2O1xuICB9O1xufVxuXG4vKipcbiAqIEZpc2hlclx1MjAxM1lhdGVzIHdpdGggYSBzZWVkZWQgUFJORyAocHVyZSBcdTIwMTQgcmV0dXJucyBhIG5ldyBhcnJheSkuXG4gKlxuICogTkVWRVIgUkVUVVJOUyBUSEUgSURFTlRJVFkgZm9yIDIrIGl0ZW1zOyBpdCByb3RhdGVzIGJ5IG9uZSBpZiB0aGUgZGVhbCBsYW5kc1xuICogdGhlcmUuIFRoaXMgaXMgbm90IHRpZGluZXNzIFx1MjAxNCBpdCBpcyB0aGUgd2hvbGUgcG9pbnQgb2Ygc2h1ZmZsaW5nIHRoZXNlXG4gKiBmaWVsZHMuIFRoZSBhcnJheXMgdGhhdCByZWFjaCBoZXJlIGFyZSB0aGUgb25lcyB3aG9zZSBBVVRIT1JFRCBPUkRFUiBJUyBUSEVcbiAqIEFOU1dFUiwgc28gYW4gaWRlbnRpdHkgZGVhbCBzZXJ2ZXMgdGhlIHN0dWRlbnQgYSBwcmUtc29sdmVkIHF1ZXN0aW9uLiBBIGZhaXJcbiAqIHNodWZmbGUgbGFuZHMgb24gaXQgMS9uISBvZiB0aGUgdGltZSwgd2hpY2ggc291bmRzIG5lZ2xpZ2libGUgdW50aWwgeW91XG4gKiBub3RpY2UgdGhhdCBvcmRlcmluZyBibG9ja3MgYXJlIGFsbG93ZWQgYXMgZmV3IGFzIHR3byBpdGVtcyBcdTIwMTQgb25lIGNsYXNzIGluXG4gKiB0d28sIGZvciB0aGF0IHF1ZXN0aW9uLiBUaGUgcmVuZGVyZXIgaGFzIGFsd2F5cyBndWFyYW50ZWVkIHRoaXNcbiAqIChyZW5kZXJlci9zcmMvYmxvY2tzL3NodWZmbGUudHMpIGFuZCB0aGUgdmlld2VyIG11c3Qgbm90IHJlZ3Jlc3MgaXQgYXRcbiAqIGN1dG92ZXIuXG4gKlxuICogUzQncyBncmFkaW5nIGtlZXBzIGl0cyBvd24gZGVmZW5zaXZlIGd1YXJkIGZvciB0aGUgc2VydmVkLW9yZGVyLWVxdWFscy1cbiAqIGF1dGhvcmVkLW9yZGVyIGNhc2UgKGdyYWRpbmcvY2hvaWNlcy50cykgYW5kIHNob3VsZCBrZWVwIGl0OiBpdCBhbHNvIGNvdmVyc1xuICogZG9jdW1lbnRzIHNlcnZlZCB1bnNodWZmbGVkLCB3aGljaCB0aGlzIGNhbm5vdCBzcGVhayBmb3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWVkZWRTaHVmZmxlPFQ+KGl0ZW1zOiByZWFkb25seSBUW10sIHNlZWRLZXk6IHN0cmluZyk6IFRbXSB7XG4gIGNvbnN0IG91dCA9IFsuLi5pdGVtc107XG4gIGNvbnN0IG5leHQgPSBtdWxiZXJyeTMyKHNlZWRGcm9tKHNlZWRLZXkpKTtcbiAgZm9yIChsZXQgaSA9IG91dC5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgY29uc3QgaiA9IE1hdGguZmxvb3IobmV4dCgpICogKGkgKyAxKSk7XG4gICAgY29uc3QgYSA9IG91dFtpXSE7XG4gICAgb3V0W2ldID0gb3V0W2pdITtcbiAgICBvdXRbal0gPSBhO1xuICB9XG4gIGlmIChvdXQubGVuZ3RoID4gMSAmJiBvdXQuZXZlcnkoKHZhbHVlLCBpKSA9PiB2YWx1ZSA9PT0gaXRlbXNbaV0pKSB7XG4gICAgb3V0LnB1c2gob3V0LnNoaWZ0KCkgYXMgVCk7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBcHBseSBldmVyeSByZWdpc3RyeS1kZWNsYXJlZCBgc2VydmVTaHVmZmxlZGAgcmVvcmRlciB0byBhIFNBTklUSVpFRFxuICogZG9jdW1lbnQgKHB1cmUgXHUyMDE0IHRoZSBpbnB1dCwgdHlwaWNhbGx5IHRoZSBzaGFyZWQgY2FjaGVkIGFydGlmYWN0LCBpcyBub3RcbiAqIG11dGF0ZWQpLiBgc2VlZEtleWAgaXMgdGhlIHBlci0odmVyc2lvbiwgc3R1ZGVudCkgaWRlbnRpdHk7IGVhY2ggc2h1ZmZsZWRcbiAqIGFycmF5IGlzIHN1Yi1zZWVkZWQgd2l0aCB0aGUgYmxvY2sgaWQgYW5kIGZpZWxkIG5hbWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVNlcnZlU2h1ZmZsZXMoXG4gIGRvYzogU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCxcbiAgc2VlZEtleTogc3RyaW5nLFxuKTogU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCB7XG4gIGNvbnN0IGNsb25lID0gc3RydWN0dXJlZENsb25lKGRvYykgYXMgdW5rbm93biBhcyB7XG4gICAgc2VjdGlvbnM6IEFycmF5PHtcbiAgICAgIHJvd3M6IEFycmF5PHsgY29sdW1uczogQXJyYXk8eyBibG9ja3M6IHVua25vd25bXSB9PiB9PjtcbiAgICB9PjtcbiAgfTtcblxuICBjb25zdCBzaHVmZmxlQmxvY2sgPSAoYmxvY2s6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZCA9PiB7XG4gICAgY29uc3QgdHlwZSA9IGJsb2NrLnR5cGU7XG4gICAgY29uc3QgZW50cnkgPVxuICAgICAgdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnICYmIHR5cGUgaW4gYmxvY2tSZWdpc3RyeVxuICAgICAgICA/IGJsb2NrUmVnaXN0cnlbdHlwZSBhcyBrZXlvZiB0eXBlb2YgYmxvY2tSZWdpc3RyeV1cbiAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgaWYgKCFlbnRyeSkgcmV0dXJuOyAvLyBzYW5pdGl6ZSBhbHJlYWR5IGZhaWxlZCBjbG9zZWQgb24gdW5rbm93biB0eXBlc1xuICAgIGZvciAoY29uc3QgZmllbGQgb2YgZW50cnkuc2FuaXRpemUuc2VydmVTaHVmZmxlZCA/PyBbXSkge1xuICAgICAgY29uc3QgYXJyID0gYmxvY2tbZmllbGRdO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgICBibG9ja1tmaWVsZF0gPSBzZWVkZWRTaHVmZmxlKFxuICAgICAgICAgIGFycixcbiAgICAgICAgICBgJHtzZWVkS2V5fToke1N0cmluZyhibG9jay5pZCA/PyAnJyl9OiR7ZmllbGR9YCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVjdXJzZSB3aGVyZSB0aGUgcmVnaXN0cnkgZGVjbGFyZXMgbmVzdGVkIGJsb2NrcywgbWlycm9yaW5nIHNhbml0aXplLlxuICAgIGZvciAoY29uc3QgZmllbGQgb2YgZW50cnkuc2FuaXRpemUuY2hpbGRCbG9ja3MgPz8gW10pIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gYmxvY2tbZmllbGRdO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgICBpZiAoY2hpbGQgIT09IG51bGwgJiYgdHlwZW9mIGNoaWxkID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgc2h1ZmZsZUJsb2NrKGNoaWxkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZm9yIChjb25zdCBzZWN0aW9uIG9mIGNsb25lLnNlY3Rpb25zKSB7XG4gICAgZm9yIChjb25zdCByb3cgb2Ygc2VjdGlvbi5yb3dzKSB7XG4gICAgICBmb3IgKGNvbnN0IGNvbHVtbiBvZiByb3cuY29sdW1ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGJsb2NrIG9mIGNvbHVtbi5ibG9ja3MpIHtcbiAgICAgICAgICBpZiAoYmxvY2sgIT09IG51bGwgJiYgdHlwZW9mIGJsb2NrID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgc2h1ZmZsZUJsb2NrKGJsb2NrIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNsb25lIGFzIHVua25vd24gYXMgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudDtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gY29udGFpbmVyL2Jsb2NrSW5kZXgudHMgXHUyMDE0IHNlcnZlZCBkb2N1bWVudCBcdTIxOTIgcGVyLXNlY3Rpb24gcmVzcG9uc2UgaWRzIChTMyBWNClcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc3RvcmUgaXMgZGVsaWJlcmF0ZWx5IGRvY3VtZW50LXNoYXBlLWFnbm9zdGljIChzdG9yZS50cyk6IGl0IGhvbGRzXG4vLyBpZC1rZXllZCByZXNwb25zZSBtYXBzIGFuZCBpcyBUT0xEIHdoaWNoIGlkcyBiZWxvbmcgdG8gYSBzZWN0aW9uIGF0IGNoZWNrXG4vLyB0aW1lLiBUaGlzIG1vZHVsZSBpcyB3aGF0IHRlbGxzIGl0IFx1MjAxNCBvbmUgd2FsayBvdmVyIHRoZSBTRVJWRUQgKHNhbml0aXplZClcbi8vIGRvY3VtZW50IHByb2R1Y2luZywgcGVyIHNlY3Rpb24sIHRoZSBpdGVtIGlkcyBpbiBlYWNoIHdpcmUgY2F0ZWdvcnkuXG4vL1xuLy8gVHdvIGRlc2lnbiBwb2ludHMgd29ydGgga2VlcGluZzpcbi8vXG4vLyAgMS4gSU4tQkFORCBJRFMgQ09NRSBGUk9NIEEgREVFUCBXQUxLLCBub3QgYSBwZXItdHlwZSBmaWVsZCBsaXN0LiBBIGJsYW5rXG4vLyAgICAgdG9rZW4gbGl2ZXMgaW4gZmlsbF9pbl9ibGFuay5jb250ZW50LCBidXQgYWxzbyBpbnNpZGUgYVxuLy8gICAgIGZhZGVkX3dvcmtlZF9leGFtcGxlJ3MgbmVzdGVkIHN0ZXBzOyBhIHByb21wdGVkIG1hdGhfaW5saW5lIG1heSBhcHBlYXIgaW5cbi8vICAgICBBTlkgY29udGVudCBhcnJheSAodGhlIHNjaGVtYSBhZG1pdHMgaXQsIHdoaWNoIGlzIGV4YWN0bHkgd2h5IHRoZSBTMlxuLy8gICAgIHNhbml0aXplciBzdHJpcHMgaW4tYmFuZCBzZWNyZXRzIHVuY29uZGl0aW9uYWxseSByYXRoZXIgdGhhbiBieVxuLy8gICAgIGRlY2xhcmF0aW9uKS4gTWlycm9yaW5nIHRoYXQgcG9zdHVyZSBoZXJlIG1lYW5zIGEgbmV3IGJsb2NrIHR5cGUgdGhhdFxuLy8gICAgIGVtYmVkcyBibGFua3MgaXMgd2lyZWQgaW50byBjaGVja2luZyB0aGUgZGF5IGl0IHJlbmRlcnMsIHdpdGggbm8gcmVnaXN0cnlcbi8vICAgICBlZGl0IFx1MjAxNCB0aGUgZmFpbHVyZSBtb2RlIHRoaXMgYXZvaWRzIGlzIGEgc3R1ZGVudCdzIGFuc3dlciBzaWxlbnRseSBuZXZlclxuLy8gICAgIHJlYWNoaW5nIHRoZSBncmFkZXIuXG4vL1xuLy8gIDIuIFVOU1VQUE9SVEVEIElTIFJFQ09SREVELCBORVZFUiBEUk9QUEVELiBXaXJlIHYyIChWOSkgZ2F2ZSB0aGUgZ3JhcGhcbi8vICAgICBmYW1pbHkgaXRzIGBncmFwaHNgIGNhdGVnb3J5LCBzbyBgdW5zdXBwb3J0ZWRgIGlzIGVtcHR5IHRvZGF5IFx1MjAxNCBidXQgdGhlXG4vLyAgICAgbWVjaGFuaXNtIHN0YXlzLiBJdCBpcyB0aGUgaG9uZXN0IGFuc3dlciB3aGVuZXZlciBhIGdyYWRhYmxlIGJsb2NrIGhhc1xuLy8gICAgIG5vIHdheSB0byByZWFjaCB0aGUgZ3JhZGVyIChhIGZ1dHVyZSBibG9jayB0eXBlIGFoZWFkIG9mIGl0cyB3aXJlXG4vLyAgICAgYnVtcCkuIEEgc2lsZW50IG9taXNzaW9uIHdvdWxkIHJlYWQgYXMgXCJhbGwgY2hlY2tlZFwiIHdoaWxlIGEgc3R1ZGVudCdzXG4vLyAgICAgd29yayB3ZW50IHVuZ3JhZGVkLCB3aGljaCBpcyB0aGUgZmFpbHVyZSB0aGlzIGV4aXN0cyB0byBwcmV2ZW50LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgZmFtaWx5T2YgfSBmcm9tICcuLi9yZWdpc3RyeS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgdHlwZSB7IEJsb2NrVHlwZSB9IGZyb20gJy4uL3JlZ2lzdHJ5L3R5cGVzLmpzJztcbmltcG9ydCB0eXBlIHtcbiAgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCxcbiAgU2FuaXRpemVkQmxvY2ssXG59IGZyb20gJy4uL3Nhbml0aXplL3Nhbml0aXplZC10eXBlcy5qcyc7XG5pbXBvcnQgdHlwZSB7IFNlY3Rpb25JdGVtSWRzIH0gZnJvbSAnLi4vc3RvcmUvc3RvcmUuanMnO1xuXG4vKiogQmxvY2sgdHlwZXMgd2hvc2UgcmVzcG9uc2VzIGhhdmUgbm8gd2lyZS12MSBjYXRlZ29yeSAoc2VlIGRlc2lnbiBwb2ludCAyKS4gKi9cbmNvbnN0IEdSQVBIX0ZBTUlMWTogUmVhZG9ubHlTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoW1xuICAnaW50ZXJhY3RpdmVfZ3JhcGgnLFxuICAnbnVtYmVyX2xpbmUnLFxuICAnZGF0YV9wbG90Jyxcbl0pO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlY3Rpb25JbmRleCB7XG4gIHNlY3Rpb25JZDogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIGF1dGhvcmVkIGB7Y2hlY2twb2ludH1gIG1hcmtlciwgY2FycmllZCB0aHJvdWdoIGZyb20gdGhlIHNlcnZlZFxuICAgKiBzZWN0aW9uIHNvIHRoZSBjaGVjay1ncm91cCBmb2xkIChjaGVja0dyb3Vwcy50cykgbmV2ZXIgbmVlZHMgYSBzZWNvbmQgd2Fsa1xuICAgKiBvZiB0aGUgZG9jdW1lbnQgdG8gYW5zd2VyIFwiZG9lcyBjaGVja2luZyBzdG9wIGhlcmU/XCIgKDVBKS5cbiAgICovXG4gIGlzQ2hlY2twb2ludDogYm9vbGVhbjtcbiAgLyoqIElkcyB0byBzZW5kIHdoZW4gY2hlY2tpbmcgdGhpcyBzZWN0aW9uLiAqL1xuICBpdGVtczogU2VjdGlvbkl0ZW1JZHM7XG4gIC8qKiBCbG9jayBpZHMgcHJlc2VudCBpbiB0aGlzIHNlY3Rpb24sIGRvY3VtZW50IG9yZGVyIChjb250YWluZXJzIGluY2x1ZGVkKS4gKi9cbiAgYmxvY2tJZHM6IHN0cmluZ1tdO1xuICAvKiogR3JhZGFibGUgYmxvY2sgaWRzIHRoaXMgd2lyZSB2ZXJzaW9uIGNhbm5vdCBjYXJyeSBcdTIwMTQgc3VyZmFjZWQsIG5vdCBoaWRkZW4uICovXG4gIHVuc3VwcG9ydGVkOiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEb2N1bWVudEluZGV4IHtcbiAgc2VjdGlvbnM6IFNlY3Rpb25JbmRleFtdO1xuICBieVNlY3Rpb246IFJlY29yZDxzdHJpbmcsIFNlY3Rpb25JbmRleD47XG4gIC8qKiBFdmVyeSBncmFkYWJsZS1idXQtdW5jYXJyeWFibGUgYmxvY2sgaWQgYWNyb3NzIHRoZSBkb2N1bWVudC4gKi9cbiAgdW5zdXBwb3J0ZWQ6IHN0cmluZ1tdO1xufVxuXG4vKiogRGVlcC13YWxrIGFueSB2YWx1ZSBmb3IgaW4tYmFuZCByZXNwb25zZSBpZHM6IGJsYW5rIHRva2VucyBhbmQgbWF0aC1nYXBcbiAqIHByb21wdHMsIHdoZXJldmVyIHRoZXkgc2l0LiBEb2VzIE5PVCBkZXNjZW5kIGludG8gbmVzdGVkIEJsb2NrIGFycmF5cyBcdTIwMTRcbiAqIGNoaWxkIGJsb2NrcyBhcmUgdmlzaXRlZCBieSB0aGUgY2FsbGVyIHNvIHRoZWlyIG93biBpZHMgYXR0cmlidXRlIHRvIHRoZW0uICovXG5mdW5jdGlvbiBjb2xsZWN0SW5CYW5kSWRzKFxuICB2YWx1ZTogdW5rbm93bixcbiAgb3V0OiBzdHJpbmdbXSxcbiAgaXNDaGlsZEJsb2NrQXJyYXk6ICh2YWx1ZTogdW5rbm93bikgPT4gYm9vbGVhbixcbik6IHZvaWQge1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBpZiAoaXNDaGlsZEJsb2NrQXJyYXkodmFsdWUpKSByZXR1cm47XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHZhbHVlKSBjb2xsZWN0SW5CYW5kSWRzKGl0ZW0sIG91dCwgaXNDaGlsZEJsb2NrQXJyYXkpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JyB8fCB2YWx1ZSA9PT0gbnVsbCkgcmV0dXJuO1xuXG4gIGNvbnN0IG5vZGUgPSB2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgaWYgKG5vZGUudHlwZSA9PT0gJ2JsYW5rJyAmJiB0eXBlb2Ygbm9kZS5pZCA9PT0gJ3N0cmluZycpIHtcbiAgICBvdXQucHVzaChub2RlLmlkKTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gQSBNYXRoUHJvbXB0IGNhcnJpZXI6IGBsYXRleGAgKyBgcHJvbXB0c2AuIE1hdGNoZWQgU1RSVUNUVVJBTExZIHJhdGhlclxuICAvLyB0aGFuIGJ5IG5vZGUgdHlwZSBiZWNhdXNlIHRoZSBzYW1lIGNhcnJpZXIgc2hhcGUgaXMgYm90aCBhbiBpbmxpbmVcbiAgLy8gbWF0aF9pbmxpbmUgbm9kZSBhbmQgYSB0b3AtbGV2ZWwgbWF0aF9ibG9jayBcdTIwMTQgYW5kIHRoZSBzY2hlbWEgYWRtaXRzIGl0IGluXG4gIC8vIGVpdGhlciBwb3NpdGlvbiAodGhlIHJlYXNvbiB0aGUgUzIgc2FuaXRpemVyIHdhbGtzIHVuY29uZGl0aW9uYWxseSB0b28pLlxuICBpZiAodHlwZW9mIG5vZGUubGF0ZXggPT09ICdzdHJpbmcnICYmIEFycmF5LmlzQXJyYXkobm9kZS5wcm9tcHRzKSkge1xuICAgIGZvciAoY29uc3QgcHJvbXB0IG9mIG5vZGUucHJvbXB0cykge1xuICAgICAgY29uc3QgaWQgPSAocHJvbXB0IGFzIHsgaWQ/OiB1bmtub3duIH0gfCBudWxsKT8uaWQ7XG4gICAgICBpZiAodHlwZW9mIGlkID09PSAnc3RyaW5nJykgb3V0LnB1c2goaWQpO1xuICAgIH1cbiAgICAvLyBLZWVwIHdhbGtpbmcgc2libGluZ3M6IGEgbWF0aF9ibG9jayBhbHNvIGNhcnJpZXMgY29udGVudCBmaWVsZHMuXG4gIH1cbiAgZm9yIChjb25zdCBjaGlsZCBvZiBPYmplY3QudmFsdWVzKG5vZGUpKSB7XG4gICAgY29sbGVjdEluQmFuZElkcyhjaGlsZCwgb3V0LCBpc0NoaWxkQmxvY2tBcnJheSk7XG4gIH1cbn1cblxuLyoqIEEgdmFsdWUgaXMgYSBjaGlsZC1ibG9jayBhcnJheSBpZiBpdCBsb29rcyBsaWtlIEJsb2NrW10gKG9iamVjdHMgY2FycnlpbmcgYVxuICogYHR5cGVgIHRoZSByZWdpc3RyeSBrbm93cyBBTkQgYW4gYGlkYCkuIFN0cnVjdHVyYWwgcmF0aGVyIHRoYW5cbiAqIHJlZ2lzdHJ5LWRlY2xhcmVkIHNvIGEgY29udGFpbmVyIHRoYXQgZm9yZ2V0cyBpdHMgY2hpbGRCbG9ja3MgZGVjbGFyYXRpb25cbiAqIHN0aWxsIGNhbid0IGdldCBpdHMgY2hpbGRyZW4ncyBpZHMgbWlzLWF0dHJpYnV0ZWQuXG4gKlxuICogRXhwb3J0ZWQgYmVjYXVzZSB0aGUgYW5zd2VyLWtleSBleHRyYWN0aW9uLCB0aGUgY2Vuc3VzLCBBTkQgdGhlIGdyYWRpbmdcbiAqIHdhbGsgKHNpbmNlIEEyNCwgMjAyNi0wOC0wNiBcdTIwMTQgaXQgY2FycmllZCBhIHByaXZhdGUgY29weSBmb3IgYSBzbGljZVxuICogZ2VuZXJhdGlvbikgYWxsIGFuc3dlciB0aGUgc2FtZSBxdWVzdGlvbiAoXCJpcyB0aGlzIGEgbmVzdGVkIGJsb2NrLCBvclxuICogY29udGVudCBvZiB0aGlzIG9uZT9cIikuIFR3byBjb3BpZXMgb2YgYSBzdWJ0bGUgaGV1cmlzdGljIGRyaWZ0OyB0aGlzIG9uZVxuICogaXMgVEhFIHNvdXJjZSwgd2l0aCB6ZXJvIGNvcGllcyByZW1haW5pbmcuICovXG5leHBvcnQgZnVuY3Rpb24gbG9va3NMaWtlQmxvY2tBcnJheSh2YWx1ZTogdW5rbm93bik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIEFycmF5LmlzQXJyYXkodmFsdWUpICYmXG4gICAgdmFsdWUubGVuZ3RoID4gMCAmJlxuICAgIHZhbHVlLmV2ZXJ5KFxuICAgICAgKGl0ZW0pID0+XG4gICAgICAgIHR5cGVvZiBpdGVtID09PSAnb2JqZWN0JyAmJlxuICAgICAgICBpdGVtICE9PSBudWxsICYmXG4gICAgICAgIHR5cGVvZiAoaXRlbSBhcyB7IGlkPzogdW5rbm93biB9KS5pZCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgdHlwZW9mIChpdGVtIGFzIHsgdHlwZT86IHVua25vd24gfSkudHlwZSA9PT0gJ3N0cmluZycsXG4gICAgKSAmJlxuICAgIC8vIElubGluZSBub2RlcyBjYXJyeSBgdHlwZWAgYnV0IG5ldmVyIGBpZGAgKyBibG9jay1pc2ggc2hhcGUgdG9nZXRoZXI7XG4gICAgLy8gcmVxdWlyZSBhdCBsZWFzdCBvbmUga25vd24gY29udGFpbmVyLWlzaCBrZXkgdG8gYXZvaWQgZmFsc2UgcG9zaXRpdmVzLlxuICAgIHZhbHVlLmV2ZXJ5KChpdGVtKSA9PiB7XG4gICAgICBjb25zdCB0ID0gKGl0ZW0gYXMgeyB0eXBlOiBzdHJpbmcgfSkudHlwZTtcbiAgICAgIHJldHVybiB0ICE9PSAndGV4dCcgJiYgdCAhPT0gJ2JsYW5rJyAmJiB0ICE9PSAnbWF0aF9pbmxpbmUnICYmIHQgIT09ICdoYXJkX2JyZWFrJztcbiAgICB9KVxuICApO1xufVxuXG4vKiogTmVzdGVkIGJsb2NrcywgZm91bmQgc3RydWN0dXJhbGx5IChzZWUgbG9va3NMaWtlQmxvY2tBcnJheSkuIEdlbmVyaWMgb3ZlciB0aGVcbiAqIGJsb2NrIHNoYXBlIHNvIHRoZSBzZXJ2ZWQtZG9jdW1lbnQgd2FsayBoZXJlIGFuZCB0aGUgYXV0aG9yZWQtZG9jdW1lbnQgd2FsayBpblxuICogdGhlIGFuc3dlci1rZXkgZXh0cmFjdGlvbiBzaGFyZSBPTkUgZGVmaW5pdGlvbiBvZiBcImNoaWxkIGJsb2NrXCIuICovXG5leHBvcnQgZnVuY3Rpb24gY2hpbGRCbG9ja3NPZjxUIGV4dGVuZHMgb2JqZWN0PihibG9jazogVCk6IFRbXSB7XG4gIGNvbnN0IG91dDogVFtdID0gW107XG4gIGZvciAoY29uc3QgdmFsdWUgb2YgT2JqZWN0LnZhbHVlcyhibG9jayBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikpIHtcbiAgICBpZiAobG9va3NMaWtlQmxvY2tBcnJheSh2YWx1ZSkpIG91dC5wdXNoKC4uLih2YWx1ZSBhcyBUW10pKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiB2aXNpdChibG9jazogU2FuaXRpemVkQmxvY2ssIGluZGV4OiBTZWN0aW9uSW5kZXgpOiB2b2lkIHtcbiAgY29uc3QgdHlwZSA9IChibG9jayBhcyB7IHR5cGU6IHN0cmluZyB9KS50eXBlIGFzIEJsb2NrVHlwZTtcbiAgY29uc3QgaWQgPSAoYmxvY2sgYXMgeyBpZDogc3RyaW5nIH0pLmlkO1xuICBpbmRleC5ibG9ja0lkcy5wdXNoKGlkKTtcblxuICAvLyBJbi1iYW5kIGlkcyAoYmxhbmtzICsgbWF0aCBnYXBzKSBiZWxvbmcgdG8gVEhJUyBibG9jaywgYXQgYW55IGRlcHRoXG4gIC8vIHNob3J0IG9mIGEgbmVzdGVkIGJsb2NrLlxuICBjb25zdCBpbkJhbmQ6IHN0cmluZ1tdID0gW107XG4gIGNvbGxlY3RJbkJhbmRJZHMoYmxvY2ssIGluQmFuZCwgbG9va3NMaWtlQmxvY2tBcnJheSk7XG4gIGlmIChpbkJhbmQubGVuZ3RoID4gMCkge1xuICAgIGluZGV4Lml0ZW1zLmJsYW5rcyA9IFsuLi4oaW5kZXguaXRlbXMuYmxhbmtzID8/IFtdKSwgLi4uaW5CYW5kXTtcbiAgfVxuXG4gIC8vIFBlci1ibG9jay1pZCBjYXRlZ29yaWVzLiBmYW1pbHlPZiByZXNvbHZlcyBkaXNwbGF5LW1vZGUgaW5zdGFuY2VzIHRvXG4gIC8vICdzdGF0aWMnLCBzbyBhIGRpc3BsYXkgZ3JhcGggY29udHJpYnV0ZXMgbm90aGluZyBcdTIwMTQgY29ycmVjdCwgaXQgdGFrZXMgbm9cbiAgLy8gaW5wdXQuXG4gIGNvbnN0IGZhbWlseSA9IGZhbWlseU9mKGJsb2NrIGFzIG5ldmVyKTtcbiAgaWYgKGZhbWlseSAhPT0gJ3N0YXRpYycpIHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ211bHRpcGxlX2Nob2ljZSc6XG4gICAgICAgIGluZGV4Lml0ZW1zLmNob2ljZXMgPSBbLi4uKGluZGV4Lml0ZW1zLmNob2ljZXMgPz8gW10pLCBpZF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbWF0Y2hpbmcnOlxuICAgICAgICBpbmRleC5pdGVtcy5tYXRjaGVzID0gWy4uLihpbmRleC5pdGVtcy5tYXRjaGVzID8/IFtdKSwgaWRdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ29yZGVyaW5nJzpcbiAgICAgICAgaW5kZXguaXRlbXMub3JkZXJpbmdzID0gWy4uLihpbmRleC5pdGVtcy5vcmRlcmluZ3MgPz8gW10pLCBpZF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2VsZl9leHBsYW5hdGlvbic6XG4gICAgICBjYXNlICdzaG9ydF9hbnN3ZXInOlxuICAgICAgY2FzZSAnZXNzYXknOlxuICAgICAgICBpbmRleC5pdGVtcy5mcmVlVGV4dCA9IFsuLi4oaW5kZXguaXRlbXMuZnJlZVRleHQgPz8gW10pLCBpZF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gV2lyZSB2MiBjYXJyaWVzIGdlb21ldHJpYyB3b3JrIGZvciB0aGUgd2hvbGUgZ3JhcGggZmFtaWx5OyB0aGVcbiAgICAgICAgLy8gc2VydmVyIGRpc3BhdGNoZXMgb24gdGhlIHNlcnZlZCBpbnRlcmFjdGlvbiB0eXBlLlxuICAgICAgICBpZiAoR1JBUEhfRkFNSUxZLmhhcyh0eXBlKSkge1xuICAgICAgICAgIGluZGV4Lml0ZW1zLmdyYXBocyA9IFsuLi4oaW5kZXguaXRlbXMuZ3JhcGhzID8/IFtdKSwgaWRdO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRCbG9ja3NPZihibG9jaykpIHZpc2l0KGNoaWxkLCBpbmRleCk7XG59XG5cbi8qKiBJbmRleCBhIHNlcnZlZCBkb2N1bWVudDogcGVyLXNlY3Rpb24gY2hlY2sgcGF5bG9hZCBpZHMgKyB0aGUgdW5zdXBwb3J0ZWRcbiAqIHJvc3Rlci4gUHVyZTsgc2FmZSB0byByZWNvbXB1dGUgb24gZXZlcnkgcmVuZGVyICh0aGUgZG9jdW1lbnQgaXMgaW1tdXRhYmxlXG4gKiBwZXIgdmVyc2lvbikuICovXG5leHBvcnQgZnVuY3Rpb24gaW5kZXhEb2N1bWVudChkb2M6IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQpOiBEb2N1bWVudEluZGV4IHtcbiAgY29uc3Qgc2VjdGlvbnM6IFNlY3Rpb25JbmRleFtdID0gW107XG4gIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBkb2Muc2VjdGlvbnMpIHtcbiAgICBjb25zdCBpbmRleDogU2VjdGlvbkluZGV4ID0ge1xuICAgICAgc2VjdGlvbklkOiBzZWN0aW9uLmlkLFxuICAgICAgaXNDaGVja3BvaW50OiBzZWN0aW9uLmlzQ2hlY2twb2ludCA9PT0gdHJ1ZSxcbiAgICAgIGl0ZW1zOiB7fSxcbiAgICAgIGJsb2NrSWRzOiBbXSxcbiAgICAgIHVuc3VwcG9ydGVkOiBbXSxcbiAgICB9O1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHNlY3Rpb24ucm93cykge1xuICAgICAgZm9yIChjb25zdCBjb2x1bW4gb2Ygcm93LmNvbHVtbnMpIHtcbiAgICAgICAgZm9yIChjb25zdCBibG9jayBvZiBjb2x1bW4uYmxvY2tzKSB2aXNpdChibG9jaywgaW5kZXgpO1xuICAgICAgfVxuICAgIH1cbiAgICBzZWN0aW9ucy5wdXNoKGluZGV4KTtcbiAgfVxuICByZXR1cm4ge1xuICAgIHNlY3Rpb25zLFxuICAgIGJ5U2VjdGlvbjogT2JqZWN0LmZyb21FbnRyaWVzKHNlY3Rpb25zLm1hcCgocykgPT4gW3Muc2VjdGlvbklkLCBzXSkpLFxuICAgIHVuc3VwcG9ydGVkOiBzZWN0aW9ucy5mbGF0TWFwKChzKSA9PiBzLnVuc3VwcG9ydGVkKSxcbiAgfTtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gZ3JhZGluZy93YWxrLnRzIFx1MjAxNCByYXcgZG9jdW1lbnQgXHUyMTkyIHRoZSBncmFkYWJsZSBpbnZlbnRvcnkgb2Ygb25lIHNlY3Rpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc2VydmVyJ3MgY291bnRlcnBhcnQgdG8gdGhlIHZpZXdlcidzIGNvbnRhaW5lci9ibG9ja0luZGV4LnRzLiBTYW1lIHdhbGssXG4vLyBvcHBvc2l0ZSBzaWRlIG9mIHRoZSB3aXJlOiBibG9ja0luZGV4IHRlbGxzIHRoZSBDTElFTlQgd2hpY2ggaWRzIHRvIHNlbmQsXG4vLyB0aGlzIHRlbGxzIHRoZSBTRVJWRVIgd2hhdCBlYWNoIG9mIHRob3NlIGlkcyBpcyB3b3J0aC4gVGhleSBtdXN0IGFncmVlLCBhbmRcbi8vIHRoZSBnb2xkZW4gY29ycHVzIHBsdXMgdGhlIGNvbmZvcm1hbmNlIHN1aXRlIGFyZSB3aGF0IGhvbGQgdGhlbSB0b2dldGhlci5cbi8vXG4vLyBUd28gcHJvcGVydGllcyBpbmhlcml0ZWQgZGVsaWJlcmF0ZWx5IGZyb20gYmxvY2tJbmRleDpcbi8vXG4vLyAgMS4gSU4tQkFORCBJRFMgQ09NRSBGUk9NIEEgREVFUCBXQUxLLCBub3QgYSBwZXItdHlwZSBmaWVsZCBsaXN0LiBBIGJsYW5rXG4vLyAgICAgbGl2ZXMgaW4gZmlsbF9pbl9ibGFuay5jb250ZW50LCBidXQgYWxzbyBpbnNpZGUgYSBmYWRlZF93b3JrZWRfZXhhbXBsZSdzXG4vLyAgICAgbmVzdGVkIHN0ZXBzLCBhbmQgYSBwcm9tcHRlZCBtYXRoX2lubGluZSBtYXkgYXBwZWFyIGluIEFOWSBjb250ZW50IGFycmF5LlxuLy8gICAgIFdhbGtpbmcgdW5jb25kaXRpb25hbGx5IG1lYW5zIGEgbmV3IGJsb2NrIHR5cGUgdGhhdCBlbWJlZHMgYmxhbmtzIGlzXG4vLyAgICAgZ3JhZGFibGUgdGhlIGRheSBpdCByZW5kZXJzLCB3aXRoIG5vIHJlZ2lzdHJ5IGVkaXQuIFRoZSBmYWlsdXJlIHRoaXNcbi8vICAgICBhdm9pZHMgaXMgdGhlIHdvcnN0IGtpbmQ6IGEgc3R1ZGVudCBhbnN3ZXIgdGhhdCBpcyBzdWJtaXR0ZWQsIHN0b3JlZCwgYW5kXG4vLyAgICAgbmV2ZXIgc2NvcmVkLlxuLy9cbi8vICAyLiBDT05UQUlORVJTIEFUVFJJQlVURSBUTyBUSEUgQ0hJTEQuIEEgYmxhbmsgaW5zaWRlIGEgZmFkZWQgZXhhbXBsZSBiZWxvbmdzXG4vLyAgICAgdG8gdGhhdCBleGFtcGxlJ3Mgc3RlcCwgbm90IHRvIHRoZSBjb250YWluZXIsIHNvIGlkcyBsaW5lIHVwIHdpdGggd2hhdFxuLy8gICAgIHRoZSBjbGllbnQgc2VudC5cbi8vXG4vLyBUaGlzIHdhbGsgcmVhZHMgdGhlIFJBVyBkb2N1bWVudC4gVGhhdCBpcyB3aGF0IG1ha2VzIGBvcmRlcmluZ2AgZ3JhZGFibGUgYXRcbi8vIGFsbCAoaXRzIGF1dGhvcmVkIGl0ZW0gb3JkZXIgSVMgdGhlIGtleSkgYW5kIHdoYXQgZ2l2ZXMgdGhlIGdyYWRlciB0aGUgYW5zd2VyXG4vLyBrZXlzLCBoaW50cywgYW5kIHNvbHV0aW9ucyB0aGUgc2VydmVkIGRvY3VtZW50IGhhZCBzdHJpcHBlZC5cbi8vXG4vLyBNQUxGT1JNRUQtRE9DVU1FTlQgUE9TVFVSRSAocnVsZWQgQjgvRDEwLCAyMDI2LTA4LTA2OyBsYW5kZWQgcmVkLWdyZWVuKTpcbi8vIHRoZSB3YWxrIGNhcnJpZXMgYW4gSU5URUdSSVRZIEdBVEUuIFRoZSBydWxlIHRoYXQgZGVjaWRlcyBldmVyeSBjaGVjayBiZWxvdzpcbi8vIGEgZ3JhZGVyLXJlYWQgZmllbGQgdGhhdCBpcyBQUkVTRU5UIHdpdGggYSBzaGFwZSB0aGUgc2NoZW1hIGNhbm5vdCBhdXRob3IgaXNcbi8vIHN0cnVjdHVyYWxseSBicm9rZW4gXHUyMTkyIE1hbGZvcm1lZERvY3VtZW50RXJyb3IgKHRoZSBoYW5kbGVyIG1hcHMgaXQgdG8gdGhlXG4vLyB3aXJlIGNvZGUgYG1hbGZvcm1lZF9kb2N1bWVudGAsIHRoZSBjbGllbnQgdG8gaXRzIG93biBub24tcmV0cnlhYmxlIGNvcHkpLlxuLy8gQSBmaWVsZCB0aGF0IGlzIEFCU0VOVCwgb3IgYXV0aG9yZWQgZW1wdHksIGdyYWRlcyBleGFjdGx5IGFzIGl0IGFsd2F5cyBoYXMgXHUyMDE0XG4vLyBhdXRob3JlZC1lbXB0eSBpcyBhIHRlYWNoZXIgbWlkLWVkaXQsIG5vdCBjb3JydXB0aW9uLCBhbmQgcmVmdXNpbmcgaXQgd291bGRcbi8vIGJyZWFrIGxlZ2l0aW1hdGUgZG9jdW1lbnRzLiBCZWZvcmUgdGhlIGdhdGUsIGV2ZXJ5IGZpZWxkIHdhcyBzaWxlbnRseVxuLy8gbmFycm93ZWQsIHNvIGEgYnJva2VuIGJsb2NrIHByb2R1Y2VkIGEgTUFSSyAoZ3JhZGVkIGFnYWluc3QgYSBjb2VyY2VkLWVtcHR5XG4vLyBrZXkpIFx1MjAxNCBhIGNvbmZpZGVudCB3cm9uZyB2ZXJkaWN0IG5vYm9keSBjb3VsZCBzZWUgKHM0LWF1ZGl0IG1pc3NlZC05KTtcbi8vIHNlcnZlci1hdXRob3JpdGF0aXZlIGdyYWRpbmcgbWFrZXMgdGhhdCB3b3JzZSB0aGFuIGEgdHlwZWQgZmFpbHVyZS5cbi8vXG4vLyBUd28gZGVsaWJlcmF0ZSBzY29wZSBlZGdlczpcbi8vICAgKiBUaGUgZ3JhcGggZmFtaWx5IGlzIE5PVCBnYXRlZCBoZXJlLiBzY29yZUdyYXBoQmxvY2sgZGlzcGF0Y2hlcyBvbiB0aGVcbi8vICAgICBzZXJ2ZWQgaW50ZXJhY3Rpb24gYW5kIFJFRlVTRVMgd29yayB0aGF0IGRpc2FncmVlcyAobnVsbCBcdTIxOTIgbm8gbWFyaykgXHUyMDE0XG4vLyAgICAgaXQgYWxyZWFkeSBmYWlscyBzYWZlIHJhdGhlciB0aGFuIGNvZXJjaW5nLCB3aGljaCBpcyB0aGUgcHJvcGVydHkgdGhlXG4vLyAgICAgZ2F0ZSBleGlzdHMgdG8gYWRkIGVsc2V3aGVyZS5cbi8vICAgKiBPbiB0b2RheSdzIGhhbmRsZXIgcGF0aCB0aGUgdXBncmFkZSBzdGVwJ3MgWm9kIHZhbGlkYXRpb24gbWVhbnMgbm9cbi8vICAgICBTVE9SQUJMRSBkb2N1bWVudCByZWFjaGVzIHRoaXMgd2FsayBicm9rZW4gXHUyMDE0IHRoZSBnYXRlIGlzIHRoZSBlbmdpbmUnc1xuLy8gICAgIG93biBjb250cmFjdCAoZGVmZW5zZSBpbiBkZXB0aCBiZWhpbmQgdGhlIGhhbmRsZXIncyBgYXMgbmV2ZXJgIGNhc3QpLFxuLy8gICAgIHNvIHNhZmV0eSBzdG9wcyBkZXBlbmRpbmcgb24gZXZlcnkgY2FsbGVyIHZhbGlkYXRpbmcgZmlyc3QuIFM3J3MgcmVhbFxuLy8gICAgIG1hbGZvcm1lZCBjYXNlIChzY2hlbWFWZXJzaW9uLTEgZG9jdW1lbnRzKSBpcyByZWZ1c2VkIHVwc3RyZWFtIGJ5IHRoZVxuLy8gICAgIHVwZ3JhZGUgcGF0aCBpdHNlbGYuXG4vL1xuLy8gVGhlIGNlbnN1cyAocmVhZCBwYXRoKSBvcHRzIE9VVCB2aWEgYHsgaW50ZWdyaXR5OiAnY29lcmNlJyB9YCBcdTIwMTQgYSBjZW5zdXNlZFxuLy8gbWFsZm9ybWVkIGRvY3VtZW50IG1lcmVseSBtaXNjb3VudHMsIGFuZCB0aGUgcmVhZCBwYXRoJ3MgcnVsZWQgcG9zdHVyZSBpc1xuLy8gd2l0aGhvbGQtYW5kLXNlcnZlLCBub3QgZmFpbC4gR3JhZGluZyBhbHdheXMgcnVucyB0aGUgZ2F0ZS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7XG4gIGNoaWxkQmxvY2tzT2YsXG4gIGxvb2tzTGlrZUJsb2NrQXJyYXksXG59IGZyb20gJy4uLy4uL2NvbnRhaW5lci9ibG9ja0luZGV4LmpzJztcbmltcG9ydCB7IFBST01QVF9DQVJSSUVSX1RZUEVTIH0gZnJvbSAnLi4vLi4vc2FuaXRpemUvcHJvbXB0Q2FycmllcnMuanMnO1xuaW1wb3J0IHR5cGUgeyBCbGFua0tleSB9IGZyb20gJy4vYmxhbmtzLmpzJztcbmltcG9ydCB0eXBlIHsgUmF3R3JhcGhCbG9jayB9IGZyb20gJy4vZ3JhcGhzLmpzJztcblxuLyoqIExvb3NlbHktdHlwZWQgcmF3IGJsb2NrOiB0aGUgc2VydmVyIGRpc3BhdGNoZXMgb24gYHR5cGVgIHN0cmluZ3MgYW5kIHJlYWRzXG4gKiBmaWVsZHMgdGhlIHNhbml0aXplZCB0eXBlcyBkZWxpYmVyYXRlbHkgZG9uJ3QgYWRtaXQuICovXG5leHBvcnQgdHlwZSBSYXdCbG9jayA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+ICYgeyBpZD86IHN0cmluZzsgdHlwZT86IHN0cmluZyB9O1xuXG4vKiogU3RydWN0dXJhbGx5IGJyb2tlbiBkb2N1bWVudCAoZW5nLXJldmlldyBCOC9EMTApOiBhIGdyYWRlci1yZWFkIGZpZWxkIHdhc1xuICogcHJlc2VudCB3aXRoIGEgc2hhcGUgdGhlIHNjaGVtYSBjYW5ub3QgYXV0aG9yLiBUaHJvd24gaW5zdGVhZCBvZiBncmFkaW5nLFxuICogYmVjYXVzZSBhIHNpbGVudGx5IHdyb25nIG1hcmsgaXMgd29yc2UgdGhhbiBhIHR5cGVkIGZhaWx1cmUuIFRoZSBoYW5kbGVyXG4gKiBtYXBzIHRoaXMgdG8gdGhlIHdpcmUgY29kZSBgbWFsZm9ybWVkX2RvY3VtZW50YC4gKi9cbmV4cG9ydCBjbGFzcyBNYWxmb3JtZWREb2N1bWVudEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICByZWFkb25seSBwcm9ibGVtczogc3RyaW5nW107XG4gIGNvbnN0cnVjdG9yKHByb2JsZW1zOiBzdHJpbmdbXSkge1xuICAgIHN1cGVyKGBTdHJ1Y3R1cmFsbHkgYnJva2VuIGRvY3VtZW50OiAke3Byb2JsZW1zLmpvaW4oJzsgJyl9YCk7XG4gICAgdGhpcy5uYW1lID0gJ01hbGZvcm1lZERvY3VtZW50RXJyb3InO1xuICAgIHRoaXMucHJvYmxlbXMgPSBwcm9ibGVtcztcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEdyYWRhYmxlSW52ZW50b3J5IHtcbiAgLyoqIEJsYW5rICsgbWF0aC1nYXAga2V5cywgaW4gZG9jdW1lbnQgb3JkZXIsIGdyb3VwZWQgcGVyIG93bmluZyBibG9jayBzb1xuICAgKiBpbnRlcmNoYW5nZWFibGUgcnVucyBjYW4gYmUgcmVzb2x2ZWQgd2l0aGluIHRoZWlyIGJsb2NrLiAqL1xuICBibGFua0dyb3Vwc0J5QmxvY2s6IEFycmF5PHsgYmxvY2tJZDogc3RyaW5nOyBrZXlzOiBCbGFua0tleVtdIH0+O1xuICBtdWx0aXBsZUNob2ljZTogQXJyYXk8e1xuICAgIGJsb2NrSWQ6IHN0cmluZztcbiAgICBjb3JyZWN0SWRzOiBzdHJpbmdbXTtcbiAgICBjaG9pY2VzOiBBcnJheTx7IGlkOiBzdHJpbmc7IGZlZWRiYWNrPzogdW5rbm93bltdIH0+O1xuICB9PjtcbiAgbWF0Y2hpbmc6IEFycmF5PHtcbiAgICBibG9ja0lkOiBzdHJpbmc7XG4gICAga2V5OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICAgIGl0ZW1JZHM6IHN0cmluZ1tdO1xuICB9PjtcbiAgb3JkZXJpbmc6IEFycmF5PHsgYmxvY2tJZDogc3RyaW5nOyBhdXRob3JlZE9yZGVyOiBzdHJpbmdbXSB9PjtcbiAgZ3JhcGhzOiBBcnJheTx7IGJsb2NrSWQ6IHN0cmluZzsgYmxvY2s6IFJhd0dyYXBoQmxvY2sgfT47XG4gIC8qKiBFdmVyeSBmcmVlLXRleHQgYmxvY2sgaW4gdGhlIHNlY3Rpb24gXHUyMDE0IHJlY29yZGVkLCBuZXZlciBqdWRnZWQuICovXG4gIGZyZWVUZXh0OiBzdHJpbmdbXTtcbiAgLyoqIGJsb2NrSWQgXHUyMTkyIGF1dGhvcmVkIHNvbHV0aW9uIGNvbnRlbnQsIGZvciBFVkVSWSBibG9jayBpbiB0aGUgc2VjdGlvbiB0aGF0XG4gICAqIGhhcyBvbmUuIEluY2x1ZGVzIFNUQVRJQyBibG9ja3MgKGEgYHByb2JsZW1gJ3Mgd29ya2VkIGV4cGxhbmF0aW9uKSwgd2hpY2hcbiAgICogaXMgdGhlIHdob2xlIHJlYXNvbiB0aGlzIGlzIGNvbGxlY3RlZCBieSB3YWxraW5nIGJsb2NrcyByYXRoZXIgdGhhbiBieVxuICAgKiB3YWxraW5nIHRoZSBibG9ja3MgdGhhdCBwcm9kdWNlZCByZXNwb25zZXMuICovXG4gIHNvbHV0aW9uczogQXJyYXk8eyBibG9ja0lkOiBzdHJpbmc7IHNvbHV0aW9uOiB1bmtub3duW10gfT47XG59XG5cbi8vIEV4cG9ydGVkIGZvciB0aGUgcm9zdGVyLWJvbmQgdGVzdCBPTkxZIChyb3N0ZXJCb25kcy50ZXN0LnRzKSBcdTIwMTQgdGhlc2UgdHdvXG4vLyBTZXRzIHJlc3RhdGUgcmVnaXN0cnkgZmFjdHMgKGZhbWlseSAncmVjb3JkZWQnOyBkZXJpdmVRdWVzdGlvblNoYXBlKSB0aGF0XG4vLyB0aGlzIG1vZHVsZSBkZWxpYmVyYXRlbHkgZG9lcyBub3QgaW1wb3J0IHRoZSByZWdpc3RyeSB0byBkZXJpdmUsIGFuZCBhXG4vLyBoYW5kLWxpc3QgdGhhdCByZXN0YXRlcyBhIHJlZ2lzdHJ5IGZhY3QgaXMgYSBjbGFpbSB0aGF0IG5lZWRzIGEgZ3VhcmQgKEE3LFxuLy8gcG9saWN5IFAxMGIpLiBQcm9kdWN0aW9uIGNvZGUgbXVzdCBrZWVwIGNvbnN1bWluZyB0aGVtIGZyb20gaGVyZS5cbmV4cG9ydCBjb25zdCBGUkVFX1RFWFRfVFlQRVMgPSBuZXcgU2V0KFtcbiAgJ3NlbGZfZXhwbGFuYXRpb24nLFxuICAnc2hvcnRfYW5zd2VyJyxcbiAgJ2Vzc2F5Jyxcbl0pO1xuZXhwb3J0IGNvbnN0IEdSQVBIX1RZUEVTID0gbmV3IFNldChbXG4gICdpbnRlcmFjdGl2ZV9ncmFwaCcsXG4gICdudW1iZXJfbGluZScsXG4gICdkYXRhX3Bsb3QnLFxuXSk7XG5cbi8qKiBQcm9qZWN0IGEgcmF3IEJsYW5rVG9rZW4gb250byB0aGUgZ3JhZGluZyBrZXkgc2hhcGUuICovXG5mdW5jdGlvbiBibGFua1Rva2VuVG9LZXkobm9kZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBCbGFua0tleSB7XG4gIGNvbnN0IGFuc3dlciA9IHR5cGVvZiBub2RlLmFuc3dlciA9PT0gJ3N0cmluZycgPyBub2RlLmFuc3dlciA6ICcnO1xuICBjb25zdCBhY2NlcHRhYmxlID0gQXJyYXkuaXNBcnJheShub2RlLmFjY2VwdGFibGVBbnN3ZXJzKVxuICAgID8gKG5vZGUuYWNjZXB0YWJsZUFuc3dlcnMgYXMgdW5rbm93bltdKS5maWx0ZXIoXG4gICAgICAgIChhKTogYSBpcyBzdHJpbmcgPT4gdHlwZW9mIGEgPT09ICdzdHJpbmcnLFxuICAgICAgKVxuICAgIDogW107XG4gIGNvbnN0IGFuc3dlclR5cGUgPSBub2RlLmFuc3dlclR5cGU7XG4gIHJldHVybiB7XG4gICAgaWQ6IFN0cmluZyhub2RlLmlkID8/ICcnKSxcbiAgICAvLyBgYW5zd2VyYCBmaXJzdCwgdGhlbiB0aGUgYWx0ZXJuYXRlcyBcdTIwMTQgb25lIGxpc3QsIG1hdGNoaW5nIGhvdyB0aGVcbiAgICAvLyByZW5kZXJlciBqb2lucyB0aGVtIGludG8gZGF0YS1ibGFuay1hbnN3ZXJzLlxuICAgIGFuc3dlcnM6IFthbnN3ZXIsIC4uLmFjY2VwdGFibGVdLFxuICAgIGFuc3dlclR5cGU6XG4gICAgICBhbnN3ZXJUeXBlID09PSAnbnVtZXJpYycgfHwgYW5zd2VyVHlwZSA9PT0gJ21hdGgnID8gYW5zd2VyVHlwZSA6ICd0ZXh0JyxcbiAgICB0b2xlcmFuY2U6IHR5cGVvZiBub2RlLnRvbGVyYW5jZSA9PT0gJ251bWJlcicgPyBub2RlLnRvbGVyYW5jZSA6IDAsXG4gICAgZXF1aXZhbGVuY2U6IG5vZGUuZXF1aXZhbGVuY2UgPT09ICdleGFjdC1mb3JtJyA/ICdleGFjdC1mb3JtJyA6ICd2YWx1ZScsXG4gICAgbWlzdGFrZUZlZWRiYWNrOiBBcnJheS5pc0FycmF5KG5vZGUubWlzdGFrZUZlZWRiYWNrKVxuICAgICAgPyAobm9kZS5taXN0YWtlRmVlZGJhY2sgYXMgQXJyYXk8eyBtYXRjaDogc3RyaW5nOyBmZWVkYmFjazogdW5rbm93bltdIH0+KVxuICAgICAgOiBbXSxcbiAgICBoaW50OiBBcnJheS5pc0FycmF5KG5vZGUuaGludCkgPyAobm9kZS5oaW50IGFzIHVua25vd25bXSkgOiB1bmRlZmluZWQsXG4gICAgaW50ZXJjaGFuZ2VhYmxlV2l0aFByZXZpb3VzOiBub2RlLmludGVyY2hhbmdlYWJsZVdpdGhQcmV2aW91cyA9PT0gdHJ1ZSxcbiAgfTtcbn1cblxuLyoqIFByb2plY3QgYSByYXcgTWF0aFByb21wdCBvbnRvIHRoZSBzYW1lIHNoYXBlLiBBIGdhcCBpcyBBTFdBWVMgZ3JhZGVkIGFzIGFcbiAqIG1hdGggZXhwcmVzc2lvbiBhbmQgbmV2ZXIgY2FycmllcyBoaW50L21pc3Rha2VGZWVkYmFjayBcdTIwMTQgYW5kIGl0cyBpZCBpcyBub3QgYVxuICogdXVpZCwgYnV0IGl0IGtleXMgaW50byB0aGUgc2FtZSBgYmxhbmtzYCByZXNwb25zZSBtYXAuICovXG5mdW5jdGlvbiBtYXRoUHJvbXB0VG9LZXkobm9kZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBCbGFua0tleSB7XG4gIGNvbnN0IGFuc3dlciA9IHR5cGVvZiBub2RlLmFuc3dlciA9PT0gJ3N0cmluZycgPyBub2RlLmFuc3dlciA6ICcnO1xuICBjb25zdCBhY2NlcHRhYmxlID0gQXJyYXkuaXNBcnJheShub2RlLmFjY2VwdGFibGVBbnN3ZXJzKVxuICAgID8gKG5vZGUuYWNjZXB0YWJsZUFuc3dlcnMgYXMgdW5rbm93bltdKS5maWx0ZXIoXG4gICAgICAgIChhKTogYSBpcyBzdHJpbmcgPT4gdHlwZW9mIGEgPT09ICdzdHJpbmcnLFxuICAgICAgKVxuICAgIDogW107XG4gIHJldHVybiB7XG4gICAgaWQ6IFN0cmluZyhub2RlLmlkID8/ICcnKSxcbiAgICBhbnN3ZXJzOiBbYW5zd2VyLCAuLi5hY2NlcHRhYmxlXSxcbiAgICBhbnN3ZXJUeXBlOiAnbWF0aCcsXG4gICAgdG9sZXJhbmNlOiB0eXBlb2Ygbm9kZS50b2xlcmFuY2UgPT09ICdudW1iZXInID8gbm9kZS50b2xlcmFuY2UgOiAwLFxuICAgIGVxdWl2YWxlbmNlOiBub2RlLmVxdWl2YWxlbmNlID09PSAnZXhhY3QtZm9ybScgPyAnZXhhY3QtZm9ybScgOiAndmFsdWUnLFxuICAgIG1pc3Rha2VGZWVkYmFjazogW10sXG4gICAgaGludDogdW5kZWZpbmVkLFxuICAgIC8vIEEgZ2FwIG5ldmVyIGpvaW5zIGFuIGludGVyY2hhbmdlYWJsZSBydW46IHRoZSBmbGFnIGlzIGEgQmxhbmtUb2tlbiBmaWVsZC5cbiAgICBpbnRlcmNoYW5nZWFibGVXaXRoUHJldmlvdXM6IGZhbHNlLFxuICB9O1xufVxuXG4vLyBQUk9NUFRfQ0FSUklFUl9UWVBFUyBpcyBpbXBvcnRlZCBmcm9tIHNhbml0aXplL3Byb21wdENhcnJpZXJzLnRzIFx1MjAxNCB0aGUgT05FXG4vLyBkZWNsYXJhdGlvbiBib3RoIHRoZSBzYW5pdGl6ZXIncyBkZWVwIHN0cmlwIGFuZCB0aGlzIHdhbGsgY29uc3VtZSAoQTcpLlxuXG4vLyAtLS0tIFRoZSBpbnRlZ3JpdHkgZ2F0ZSAoQjgvRDEwKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRWFjaCBoZWxwZXIgYmVsb3cgQVBQRU5EUyBwcm9ibGVtcyBhbmQgbmV2ZXIgY2hhbmdlcyB3aGF0IGlzIGNvbGxlY3RlZCBcdTIwMTQgaW5cbi8vICdjb2VyY2UnIG1vZGUgdGhlIGludmVudG9yeSBtdXN0IHN0YXkgYnl0ZS1pZGVudGljYWwgdG8gdGhlIHByZS1nYXRlIHdhbGssXG4vLyBhbmQgaW4gJ3Rocm93JyBtb2RlIHRoZSBjb2xsZWN0ZWQgaW52ZW50b3J5IGlzIGRpc2NhcmRlZCBhbnl3YXkuIEV2ZXJ5XG4vLyBtZXNzYWdlIGxlYWRzIHdpdGggdGhlIG93bmluZyBibG9jayBpZDogdGhlIGVycm9yJ3MgcHJvYmxlbXMgbGlzdCBpcyB3aGF0XG4vLyB0dXJucyBcImNoZWNraW5nIGlzIGJyb2tlblwiIGludG8gYSBmaW5kYWJsZSBkZWZlY3QgaW4gYW4gZWRnZSBsb2cuXG5cbi8qKiBUaGUgYW5zd2VyVHlwZSAvIGVxdWl2YWxlbmNlIHZvY2FidWxhcmllcyB0aGUgcHJvamVjdGlvbnMgY29lcmNlIHRvd2FyZC5cbiAqIEEgdmFsdWUgT1VUU0lERSB0aGVtIGlzIGEgc2hhcGUgdGhlIHNjaGVtYSBjYW5ub3QgYXV0aG9yIFx1MjAxNCBjb2VyY2luZyBpdFxuICogc2lsZW50bHkgY2hhbmdlcyBncmFkaW5nIHNlbWFudGljcyAoZS5nLiBhIG1hdGggYW5zd2VyIGdyYWRlZCBieXRlLXdpc2UpLiAqL1xuY29uc3QgQU5TV0VSX1RZUEVTID0gbmV3IFNldChbJ3RleHQnLCAnbnVtZXJpYycsICdtYXRoJ10pO1xuY29uc3QgRVFVSVZBTEVOQ0VTID0gbmV3IFNldChbJ3ZhbHVlJywgJ2V4YWN0LWZvcm0nXSk7XG5cbi8qKiBwcmVzZW50LXdpdGgtdGhlLXdyb25nLXNoYXBlLCB0aGUgcnVsZSdzIG9uZSBwcmVkaWNhdGU6IGFic2VudCBpcyBhbHdheXNcbiAqIGZpbmUgKGF1dGhvcmVkLWVtcHR5KSwgYSBiYWQgc2hhcGUgbmV2ZXIgaXMuICovXG5mdW5jdGlvbiBiYWQodmFsdWU6IHVua25vd24sIG9rOiAodjogdW5rbm93bikgPT4gYm9vbGVhbik6IGJvb2xlYW4ge1xuICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiAhb2sodmFsdWUpO1xufVxuXG5jb25zdCBpc1N0cmluZyA9ICh2OiB1bmtub3duKSA9PiB0eXBlb2YgdiA9PT0gJ3N0cmluZyc7XG5jb25zdCBpc051bWJlciA9ICh2OiB1bmtub3duKSA9PiB0eXBlb2YgdiA9PT0gJ251bWJlcic7XG5jb25zdCBpc0Jvb2xlYW4gPSAodjogdW5rbm93bikgPT4gdHlwZW9mIHYgPT09ICdib29sZWFuJztcbmNvbnN0IGlzQXJyYXlWID0gKHY6IHVua25vd24pID0+IEFycmF5LmlzQXJyYXkodik7XG5jb25zdCBpc1BsYWluT2JqZWN0ID0gKHY6IHVua25vd24pID0+XG4gIHYgIT09IG51bGwgJiYgdHlwZW9mIHYgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHYpO1xuXG4vKiogTWF0Y2hpbmcvb3JkZXJpbmcgaXRlbSBlbnRyaWVzOiBgU3RyaW5nKGkuaWQpYCBtaW50ZWQgJ3VuZGVmaW5lZCctc3R5bGVcbiAqIGlkcyB0aGUgY2xpZW50IGNvdWxkIG5ldmVyIHNlbmQgYmFjay4gQW4gZW50cnkgdGhhdCBleGlzdHMgYnV0IGxhY2tzIGl0c1xuICogaWRlbnRpdHkgaXMgYnJva2VuLCBub3QgYXV0aG9yZWQtZW1wdHkgXHUyMDE0IGFuIEVNUFRZIGl0ZW1zIGFycmF5IGlzIHRoZVxuICogYXV0aG9yZWQtZW1wdHkgZm9ybSBhbmQgc3RheXMgZmluZS4gKi9cbmZ1bmN0aW9uIGNoZWNrSXRlbUlkcyhcbiAgaXRlbXM6IEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PixcbiAgYmxvY2tJZDogc3RyaW5nLFxuICBwcm9ibGVtczogc3RyaW5nW10sXG4pOiB2b2lkIHtcbiAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgaWYgKCFpc1BsYWluT2JqZWN0KGl0ZW0pKSB7XG4gICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2Jsb2NrSWR9OiBhbiBpdGVtIGVudHJ5IHRoYXQgaXMgbm90IGFuIG9iamVjdGApO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGl0ZW0uaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2Jsb2NrSWR9OiBhbiBpdGVtIHdpdGhvdXQgYSBzdHJpbmcgaWRgKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqIFRoZSBmaWVsZHMgYmxhbmtUb2tlblRvS2V5IC8gbWF0aFByb21wdFRvS2V5IG5hcnJvdywgY2hlY2tlZCBpbnN0ZWFkIG9mXG4gKiBjb2VyY2VkLiBgZm9yUHJvbXB0YCBza2lwcyB0aGUgdGhyZWUgQmxhbmtUb2tlbi1vbmx5IGZpZWxkcy4gKi9cbmZ1bmN0aW9uIGNoZWNrS2V5RmllbGRzKFxuICBub2RlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbiAgd2hlcmU6IHN0cmluZyxcbiAgcHJvYmxlbXM6IHN0cmluZ1tdLFxuICBmb3JQcm9tcHQ6IGJvb2xlYW4sXG4pOiB2b2lkIHtcbiAgaWYgKGJhZChub2RlLmFuc3dlciwgaXNTdHJpbmcpKSB7XG4gICAgcHJvYmxlbXMucHVzaChgJHt3aGVyZX06IGFuc3dlciBpcyBub3QgYSBzdHJpbmdgKTtcbiAgfVxuICBpZiAoYmFkKG5vZGUuYWNjZXB0YWJsZUFuc3dlcnMsIGlzQXJyYXlWKSkge1xuICAgIHByb2JsZW1zLnB1c2goYCR7d2hlcmV9OiBhY2NlcHRhYmxlQW5zd2VycyBpcyBub3QgYW4gYXJyYXlgKTtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG5vZGUuYWNjZXB0YWJsZUFuc3dlcnMpKSB7XG4gICAgLy8gVGhlIHByb2plY3Rpb24gRklMVEVSUyBub24tc3RyaW5nIGVudHJpZXMgXHUyMDE0IGFuIGF1dGhvcmVkIGFsdGVybmF0ZSB0aGF0XG4gICAgLy8gc2lsZW50bHkgdmFuaXNoZXMgbWFya3MgYSBjb3JyZWN0IHN0dWRlbnQgd3JvbmcuXG4gICAgaWYgKCFub2RlLmFjY2VwdGFibGVBbnN3ZXJzLmV2ZXJ5KGlzU3RyaW5nKSkge1xuICAgICAgcHJvYmxlbXMucHVzaChgJHt3aGVyZX06IGFjY2VwdGFibGVBbnN3ZXJzIGhhcyBhIG5vbi1zdHJpbmcgZW50cnlgKTtcbiAgICB9XG4gIH1cbiAgaWYgKGJhZChub2RlLmFuc3dlclR5cGUsICh2KSA9PiBBTlNXRVJfVFlQRVMuaGFzKHYgYXMgc3RyaW5nKSkpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogYW5zd2VyVHlwZSBpcyBvdXRzaWRlIHRoZSB2b2NhYnVsYXJ5YCk7XG4gIH1cbiAgaWYgKGJhZChub2RlLnRvbGVyYW5jZSwgaXNOdW1iZXIpKSB7XG4gICAgcHJvYmxlbXMucHVzaChgJHt3aGVyZX06IHRvbGVyYW5jZSBpcyBub3QgYSBudW1iZXJgKTtcbiAgfVxuICBpZiAoYmFkKG5vZGUuZXF1aXZhbGVuY2UsICh2KSA9PiBFUVVJVkFMRU5DRVMuaGFzKHYgYXMgc3RyaW5nKSkpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogZXF1aXZhbGVuY2UgaXMgb3V0c2lkZSB0aGUgdm9jYWJ1bGFyeWApO1xuICB9XG4gIGlmIChmb3JQcm9tcHQpIHJldHVybjtcbiAgaWYgKGJhZChub2RlLm1pc3Rha2VGZWVkYmFjaywgaXNBcnJheVYpKSB7XG4gICAgcHJvYmxlbXMucHVzaChgJHt3aGVyZX06IG1pc3Rha2VGZWVkYmFjayBpcyBub3QgYW4gYXJyYXlgKTtcbiAgfVxuICBpZiAoYmFkKG5vZGUuaGludCwgaXNBcnJheVYpKSB7XG4gICAgcHJvYmxlbXMucHVzaChgJHt3aGVyZX06IGhpbnQgaXMgbm90IGFuIGFycmF5YCk7XG4gIH1cbiAgaWYgKGJhZChub2RlLmludGVyY2hhbmdlYWJsZVdpdGhQcmV2aW91cywgaXNCb29sZWFuKSkge1xuICAgIC8vIGA9PT0gdHJ1ZWAgbmFycm93aW5nIHdvdWxkIHNpbGVudGx5IGRlZ3JhZGUgdGhlIGdyb3VwIHRvIHBvc2l0aW9uYWxcbiAgICAvLyBncmFkaW5nIFx1MjAxNCBhIHN3YXBwZWQtYnV0LWNvcnJlY3QgcGFpciBtYXJrZWQgd3JvbmcuXG4gICAgcHJvYmxlbXMucHVzaChgJHt3aGVyZX06IGludGVyY2hhbmdlYWJsZVdpdGhQcmV2aW91cyBpcyBub3QgYSBib29sZWFuYCk7XG4gIH1cbn1cblxuLyoqIENvbGxlY3QgaW4tYmFuZCBrZXlzIChibGFua3MgKyBtYXRoIGdhcHMpIGJlbG9uZ2luZyB0byBUSElTIGJsb2NrLCBhdCBhbnlcbiAqIGRlcHRoIHNob3J0IG9mIGEgbmVzdGVkIGNoaWxkIGJsb2NrLiAqL1xuZnVuY3Rpb24gY29sbGVjdEluQmFuZEtleXMoXG4gIHZhbHVlOiB1bmtub3duLFxuICBvdXQ6IEJsYW5rS2V5W10sXG4gIGlzQ2hpbGRCbG9ja0FycmF5OiAodmFsdWU6IHVua25vd24pID0+IGJvb2xlYW4sXG4gIGJsb2NrSWQ6IHN0cmluZyxcbiAgcHJvYmxlbXM6IHN0cmluZ1tdLFxuKTogdm9pZCB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIGlmIChpc0NoaWxkQmxvY2tBcnJheSh2YWx1ZSkpIHJldHVybjtcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdmFsdWUpIHtcbiAgICAgIGNvbGxlY3RJbkJhbmRLZXlzKGl0ZW0sIG91dCwgaXNDaGlsZEJsb2NrQXJyYXksIGJsb2NrSWQsIHByb2JsZW1zKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSByZXR1cm47XG4gIGNvbnN0IG5vZGUgPSB2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICBpZiAobm9kZS50eXBlID09PSAnYmxhbmsnICYmIHR5cGVvZiBub2RlLmlkICE9PSAnc3RyaW5nJykge1xuICAgIC8vIE5vdCBldmVuIHJlY29nbml6ZWQgYXMgYSBibGFuayBcdTIwMTQgdGhlIHR5cGVkIGFuc3dlciB3b3VsZCB2YW5pc2guIFRoZSBpZFxuICAgIC8vIGlzIHRoZSB0b2tlbidzIGlkZW50aXR5LCBzbyBhbiBlbnRyeSB3aXRob3V0IG9uZSBpcyBicm9rZW4sIG5vdFxuICAgIC8vIGF1dGhvcmVkLWVtcHR5LiBGYWxscyB0aHJvdWdoIHRvIHRoZSBjaGlsZCB3YWxrIGV4YWN0bHkgYXMgdGhlXG4gICAgLy8gcHJlLWdhdGUgY29kZSBkaWQsIHNvICdjb2VyY2UnIG1vZGUgc3RheXMgYnl0ZS1pZGVudGljYWwuXG4gICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtibG9ja0lkfTogYSBibGFuayB0b2tlbiB3aXRob3V0IGEgc3RyaW5nIGlkYCk7XG4gIH1cbiAgaWYgKG5vZGUudHlwZSA9PT0gJ2JsYW5rJyAmJiB0eXBlb2Ygbm9kZS5pZCA9PT0gJ3N0cmluZycpIHtcbiAgICBjaGVja0tleUZpZWxkcyhub2RlLCBgYmxvY2sgJHtibG9ja0lkfTogYmxhbmsgJHtub2RlLmlkfWAsIHByb2JsZW1zLCBmYWxzZSk7XG4gICAgb3V0LnB1c2goYmxhbmtUb2tlblRvS2V5KG5vZGUpKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHR5cGVvZiBub2RlLnR5cGUgPT09ICdzdHJpbmcnICYmIFBST01QVF9DQVJSSUVSX1RZUEVTLmhhcyhub2RlLnR5cGUpKSB7XG4gICAgaWYgKGJhZChub2RlLnByb21wdHMsIGlzQXJyYXlWKSkge1xuICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtibG9ja0lkfTogcHJvbXB0cyBpcyBub3QgYW4gYXJyYXlgKTtcbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobm9kZS5wcm9tcHRzKSkge1xuICAgICAgZm9yIChjb25zdCBwcm9tcHQgb2Ygbm9kZS5wcm9tcHRzKSB7XG4gICAgICAgIGlmIChwcm9tcHQgPT09IG51bGwgfHwgdHlwZW9mIHByb21wdCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2Jsb2NrSWR9OiBhIHByb21wdCBlbnRyeSB0aGF0IGlzIG5vdCBhbiBvYmplY3RgKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwID0gcHJvbXB0IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICBpZiAodHlwZW9mIHAuaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtibG9ja0lkfTogYSBwcm9tcHQgd2l0aG91dCBhIHN0cmluZyBpZGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNoZWNrS2V5RmllbGRzKHAsIGBibG9jayAke2Jsb2NrSWR9OiBwcm9tcHQgJHtwLmlkfWAsIHByb2JsZW1zLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBvdXQucHVzaChtYXRoUHJvbXB0VG9LZXkocCkpO1xuICAgICAgfVxuICAgICAgLy8gS2VlcCB3YWxraW5nIHNpYmxpbmdzOiBhIG1hdGhfYmxvY2sgY2FycmllcyBjb250ZW50IGZpZWxkcyB0b28uXG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgY2hpbGQgb2YgT2JqZWN0LnZhbHVlcyhub2RlKSkge1xuICAgIGNvbGxlY3RJbkJhbmRLZXlzKGNoaWxkLCBvdXQsIGlzQ2hpbGRCbG9ja0FycmF5LCBibG9ja0lkLCBwcm9ibGVtcyk7XG4gIH1cbn1cblxuLy8gbG9va3NMaWtlQmxvY2tBcnJheSAvIGNoaWxkQmxvY2tzT2YgYXJlIElNUE9SVEVEIGZyb20gY29udGFpbmVyL2Jsb2NrSW5kZXggXHUyMDE0XG4vLyB0aGlzIGZpbGUgY2FycmllZCBhIHByaXZhdGUsIGxvZ2ljYWxseS1pZGVudGljYWwgY29weSBvZiB0aGUgc3VidGxlXG4vLyBoZXVyaXN0aWMgdW50aWwgMjAyNi0wOC0wNiAoQTI0KSwgaGVkZ2VkIFwibWlycm9yaW5nIGJsb2NrSW5kZXgnc1wiIHdoaWxlIHRoZVxuLy8gc291cmNlIGZpbGUgY2xhaW1lZCBcInRoaXMgb25lIGlzIHRoZSBzb3VyY2VcIjogdGhlIGNvcHkgdGhhdCB3b3VsZCBzaWxlbnRseVxuLy8gZHJpZnQsIGFuZCBkcmlmdGVkIGF0dHJpYnV0aW9uIG1pcy1ncmFkZXMgaW52aXNpYmx5LiBTYW1lIHBhY2thZ2UsIGFuZCB0aGVcbi8vIGNlbnN1cyBhbHJlYWR5IGltcG9ydHMgY2hpbGRCbG9ja3NPZiBzZXJ2ZXItc2lkZSwgc28gdGhlIGJ1bmRsZSBib3VuZGFyeVxuLy8gd2FzIHByb3ZlbiBiZWZvcmUgdGhpcyBqb2luZWQgaXQuXG5cbmZ1bmN0aW9uIHZpc2l0KFxuICBibG9jazogUmF3QmxvY2ssXG4gIGludjogR3JhZGFibGVJbnZlbnRvcnksXG4gIHByb2JsZW1zOiBzdHJpbmdbXSxcbik6IHZvaWQge1xuICBjb25zdCBpZCA9IHR5cGVvZiBibG9jay5pZCA9PT0gJ3N0cmluZycgPyBibG9jay5pZCA6ICcnO1xuICBjb25zdCB0eXBlID0gdHlwZW9mIGJsb2NrLnR5cGUgPT09ICdzdHJpbmcnID8gYmxvY2sudHlwZSA6ICcnO1xuICBpZiAoYmFkKGJsb2NrLmlkLCBpc1N0cmluZykpIHtcbiAgICAvLyBTa2lwcGVkIGVudGlyZWx5IGJ5IHRoZSBwcmUtZ2F0ZSB3YWxrOiB0aGUgc3R1ZGVudCdzIGFuc3dlciBmb3IgaXQgd2FzXG4gICAgLy8gc3VibWl0dGVkLCBzdG9yZWQsIGFuZCBuZXZlciBzY29yZWQgXHUyMDE0IHRoZSBleGFjdCBmYWlsdXJlIHRoZSBkZWVwIHdhbGtcbiAgICAvLyBleGlzdHMgdG8gcHJldmVudC5cbiAgICBwcm9ibGVtcy5wdXNoKGBhIGJsb2NrIHdob3NlIGlkIGlzIG5vdCBhIHN0cmluZyAoJHtKU09OLnN0cmluZ2lmeShibG9jay5pZCl9KWApO1xuICB9XG4gIGlmIChiYWQoYmxvY2sudHlwZSwgaXNTdHJpbmcpKSB7XG4gICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZCB8fCAnPG5vIGlkPid9OiB0eXBlIGlzIG5vdCBhIHN0cmluZ2ApO1xuICB9XG4gIGlmIChiYWQoYmxvY2suc29sdXRpb24sIGlzQXJyYXlWKSkge1xuICAgIC8vIFNpbGVudGx5IGRyb3BwZWQgYmVmb3JlOiB0aGUgc2VjdGlvbiBzYXlzIFwiY2hlY2tlZFwiIGJ1dCB0aGUgd29ya2VkXG4gICAgLy8gZXhwbGFuYXRpb24gbmV2ZXIgdW5sb2NrcyBcdTIwMTQgYSBjb250ZW50IGJ1ZyBmcm9tIHRoZSBzdHVkZW50J3Mgc2VhdC5cbiAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkIHx8ICc8bm8gaWQ+J306IHNvbHV0aW9uIGlzIG5vdCBhbiBhcnJheWApO1xuICB9XG4gIGlmICghaWQpIHJldHVybjtcblxuICAvLyBTb2x1dGlvbnMgYXJlIGNvbGxlY3RlZCBmb3IgRVZFUlkgYmxvY2sgdGhhdCBoYXMgb25lLCBpbmNsdWRpbmcgc3RhdGljcy5cbiAgLy8gQSBncmFkZXIgdGhhdCB3YWxrZWQgb25seSByZXNwb25kaW5nIGJsb2NrcyB3b3VsZCBuZXZlciB1bmxvY2sgYVxuICAvLyBgcHJvYmxlbWAncyB3b3JrZWQgc29sdXRpb24sIGFuZCB0byBhIHN0dWRlbnQgdGhhdCByZWFkcyBhcyBhIGNvbnRlbnQgYnVnXG4gIC8vICh0aGUgc2VjdGlvbiBzYXlzIFwiY2hlY2tlZFwiIGJ1dCBvbmUgYm94IHN0YXlzIHNodXQpLlxuICBpZiAoQXJyYXkuaXNBcnJheShibG9jay5zb2x1dGlvbikgJiYgYmxvY2suc29sdXRpb24ubGVuZ3RoID4gMCkge1xuICAgIGludi5zb2x1dGlvbnMucHVzaCh7IGJsb2NrSWQ6IGlkLCBzb2x1dGlvbjogYmxvY2suc29sdXRpb24gYXMgdW5rbm93bltdIH0pO1xuICB9XG5cbiAgY29uc3QgaW5CYW5kOiBCbGFua0tleVtdID0gW107XG4gIGNvbGxlY3RJbkJhbmRLZXlzKGJsb2NrLCBpbkJhbmQsIGxvb2tzTGlrZUJsb2NrQXJyYXksIGlkLCBwcm9ibGVtcyk7XG4gIGlmIChpbkJhbmQubGVuZ3RoID4gMCkge1xuICAgIGludi5ibGFua0dyb3Vwc0J5QmxvY2sucHVzaCh7IGJsb2NrSWQ6IGlkLCBrZXlzOiBpbkJhbmQgfSk7XG4gIH1cblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdtdWx0aXBsZV9jaG9pY2UnOiB7XG4gICAgICBpZiAoYmFkKGJsb2NrLmNob2ljZXMsIGlzQXJyYXlWKSkge1xuICAgICAgICAvLyBDb2VyY2VkIHRvIFtdIGJlZm9yZTogdGhlIHNlbGVjdGlvbiBncmFkZWQgYWdhaW5zdCBhbiBFTVBUWSBrZXkgYW5kXG4gICAgICAgIC8vIHRoZSBzdHVkZW50IHdhcyBtYXJrZWQgd3Jvbmcgd2l0aCBjb25maWRlbmNlLlxuICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkfTogY2hvaWNlcyBpcyBub3QgYW4gYXJyYXlgKTtcbiAgICAgIH1cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGJsb2NrLmNob2ljZXMpKSB7XG4gICAgICAgIGZvciAoY29uc3QgYyBvZiBibG9jay5jaG9pY2VzKSB7XG4gICAgICAgICAgaWYgKCFpc1BsYWluT2JqZWN0KGMpKSB7XG4gICAgICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkfTogYSBjaG9pY2UgZW50cnkgdGhhdCBpcyBub3QgYW4gb2JqZWN0YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgY2hvaWNlID0gYyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgICBpZiAodHlwZW9mIGNob2ljZS5pZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIC8vIFN0cmluZyhjLmlkKSBtaW50ZWQgaWRzIHRoZSBzZXJ2ZWQgcGFnZSBuZXZlciByZW5kZXJlZC5cbiAgICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBhIGNob2ljZSB3aXRob3V0IGEgc3RyaW5nIGlkYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChiYWQoY2hvaWNlLmNvcnJlY3QsIGlzQm9vbGVhbikpIHtcbiAgICAgICAgICAgIC8vIGA9PT0gdHJ1ZWAgbmFycm93aW5nIHNpbGVudGx5IGVtcHRpZWQgdGhlIGtleS5cbiAgICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBhIGNob2ljZSB3aG9zZSBjb3JyZWN0IGZsYWcgaXMgbm90IGEgYm9vbGVhbmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYmFkKGNob2ljZS5mZWVkYmFjaywgaXNBcnJheVYpKSB7XG4gICAgICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkfTogYSBjaG9pY2Ugd2hvc2UgZmVlZGJhY2sgaXMgbm90IGFuIGFycmF5YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBjaG9pY2VzID0gQXJyYXkuaXNBcnJheShibG9jay5jaG9pY2VzKVxuICAgICAgICA/IChibG9jay5jaG9pY2VzIGFzIEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PilcbiAgICAgICAgOiBbXTtcbiAgICAgIGludi5tdWx0aXBsZUNob2ljZS5wdXNoKHtcbiAgICAgICAgYmxvY2tJZDogaWQsXG4gICAgICAgIGNvcnJlY3RJZHM6IGNob2ljZXNcbiAgICAgICAgICAuZmlsdGVyKChjKSA9PiBjLmNvcnJlY3QgPT09IHRydWUpXG4gICAgICAgICAgLm1hcCgoYykgPT4gU3RyaW5nKGMuaWQpKSxcbiAgICAgICAgY2hvaWNlczogY2hvaWNlcy5tYXAoKGMpID0+ICh7XG4gICAgICAgICAgaWQ6IFN0cmluZyhjLmlkKSxcbiAgICAgICAgICAuLi4oQXJyYXkuaXNBcnJheShjLmZlZWRiYWNrKVxuICAgICAgICAgICAgPyB7IGZlZWRiYWNrOiBjLmZlZWRiYWNrIGFzIHVua25vd25bXSB9XG4gICAgICAgICAgICA6IHt9KSxcbiAgICAgICAgfSkpLFxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSAnbWF0Y2hpbmcnOiB7XG4gICAgICBpZiAoYmFkKGJsb2NrLml0ZW1zLCBpc0FycmF5VikpIHtcbiAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGl0ZW1zIGlzIG5vdCBhbiBhcnJheWApO1xuICAgICAgfVxuICAgICAgaWYgKGJhZChibG9jay5rZXksIGlzUGxhaW5PYmplY3QpKSB7XG4gICAgICAgIC8vIFRoZSBiYXJlIGNhc3QgcGFzc2VkIGFueXRoaW5nIHRocm91Z2g6IGxvb2t1cHMgb24gYSBicm9rZW4ga2V5XG4gICAgICAgIC8vIHJldHVybiB1bmRlZmluZWQgYW5kIGV2ZXJ5IHBsYWNlZCBwYWlyIGlzIHdyb25nLlxuICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkfToga2V5IGlzIG5vdCBhbiBvYmplY3RgKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdChibG9jay5rZXkpKSB7XG4gICAgICAgIGlmICghT2JqZWN0LnZhbHVlcyhibG9jay5rZXkgYXMgb2JqZWN0KS5ldmVyeShpc1N0cmluZykpIHtcbiAgICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkfToga2V5IGhhcyBhIG5vbi1zdHJpbmcgdGFyZ2V0YCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGl0ZW1zID0gQXJyYXkuaXNBcnJheShibG9jay5pdGVtcylcbiAgICAgICAgPyAoYmxvY2suaXRlbXMgYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KVxuICAgICAgICA6IFtdO1xuICAgICAgY2hlY2tJdGVtSWRzKGl0ZW1zLCBpZCwgcHJvYmxlbXMpO1xuICAgICAgaW52Lm1hdGNoaW5nLnB1c2goe1xuICAgICAgICBibG9ja0lkOiBpZCxcbiAgICAgICAga2V5OiAoYmxvY2sua2V5IGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4pID8/IHt9LFxuICAgICAgICBpdGVtSWRzOiBpdGVtcy5tYXAoKGkpID0+IFN0cmluZyhpLmlkKSksXG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjYXNlICdvcmRlcmluZyc6IHtcbiAgICAgIGlmIChiYWQoYmxvY2suaXRlbXMsIGlzQXJyYXlWKSkge1xuICAgICAgICAvLyBhdXRob3JlZE9yZGVyIGNvZXJjZWQgdG8gW10gYmVmb3JlOiBhIGRlbGliZXJhdGUgYXJyYW5nZW1lbnQgZ3JhZGVkXG4gICAgICAgIC8vIGFnYWluc3QgYW4gZW1wdHkga2V5IGFuZCB3YXMgbWFya2VkIHdyb25nLlxuICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkfTogaXRlbXMgaXMgbm90IGFuIGFycmF5YCk7XG4gICAgICB9XG4gICAgICBjb25zdCBpdGVtcyA9IEFycmF5LmlzQXJyYXkoYmxvY2suaXRlbXMpXG4gICAgICAgID8gKGJsb2NrLml0ZW1zIGFzIEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PilcbiAgICAgICAgOiBbXTtcbiAgICAgIGNoZWNrSXRlbUlkcyhpdGVtcywgaWQsIHByb2JsZW1zKTtcbiAgICAgIC8vIFRoZSBhdXRob3JlZCBvcmRlciBJUyB0aGUga2V5IFx1MjAxNCBhdmFpbGFibGUgb25seSBiZWNhdXNlIHRoaXMgd2Fsa3MgdGhlXG4gICAgICAvLyByYXcgZG9jdW1lbnQgcmF0aGVyIHRoYW4gdGhlIHNlcnZlZCBvbmUuXG4gICAgICBpbnYub3JkZXJpbmcucHVzaCh7IGJsb2NrSWQ6IGlkLCBhdXRob3JlZE9yZGVyOiBpdGVtcy5tYXAoKGkpID0+IFN0cmluZyhpLmlkKSkgfSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSAndGFibGUnOiB7XG4gICAgICAvLyBBIHRhYmxlIGNvbnRyaWJ1dGVzIE5PIHBlci10eXBlIGludmVudG9yeTogaXRzIGdyYWRhYmxlIGNvbnRlbnQgaXNcbiAgICAgIC8vIGJsYW5rIHRva2VucywgYWxyZWFkeSBjb2xsZWN0ZWQgKGFuZCBnYXRlZCkgYnkgdGhlIGluLWJhbmQgd2FsayBhYm92ZSxcbiAgICAgIC8vIHdoZXJldmVyIGluIHRoZSBjZWxscyB0aGV5IHNpdC4gVGhhdCBpcyB0aGUgd2hvbGUgZGVzaWduLlxuICAgICAgLy9cbiAgICAgIC8vIFdoYXQgdGhhdCB3YWxrIGNhbm5vdCBzZWUgaXMgYSBTS0VMRVRPTiBwcmVzZW50IHdpdGggdGhlIHdyb25nIHNoYXBlLlxuICAgICAgLy8gYHJvd3M6ICdub3BlJ2AsIG9yIGEgYGNlbGxzYCBvYmplY3QsIHNpbXBseSB5aWVsZHMgbm8ga2V5cyBcdTIwMTQgc28gdGhlXG4gICAgICAvLyBzZWN0aW9uIFwiY2hlY2tzXCIgc3VjY2Vzc2Z1bGx5IHdoaWxlIHRoZSBzdHVkZW50J3MgdGFibGUgYW5zd2VycyBnb1xuICAgICAgLy8gdW5zY29yZWQgYW5kIHVucmVwb3J0ZWQuIFRoYXQgaXMgdGhlIHNhbWUgd29yc3QtY2FzZSB0aGUgc2VjdGlvbi1sZXZlbFxuICAgICAgLy8gcm93cyBjaGVjayBndWFyZHMgYWdhaW5zdCwgb25lIGxldmVsIGRvd24sIGFuZCB0aGUgcmVhc29uIHRoaXMgY2FzZVxuICAgICAgLy8gZXhpc3RzIGF0IGFsbCBkZXNwaXRlIGFkZGluZyBub3RoaW5nIHRvIHRoZSBpbnZlbnRvcnkuXG4gICAgICBpZiAoYmFkKGJsb2NrLnJvd3MsIGlzQXJyYXlWKSkge1xuICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkfTogcm93cyBpcyBub3QgYW4gYXJyYXlgKTtcbiAgICAgIH1cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGJsb2NrLnJvd3MpKSB7XG4gICAgICAgIGZvciAoY29uc3Qgcm93IG9mIGJsb2NrLnJvd3MpIHtcbiAgICAgICAgICBpZiAoIWlzUGxhaW5PYmplY3Qocm93KSkge1xuICAgICAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGEgcm93IHRoYXQgaXMgbm90IGFuIG9iamVjdGApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGNlbGxzID0gKHJvdyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuY2VsbHM7XG4gICAgICAgICAgaWYgKGJhZChjZWxscywgaXNBcnJheVYpKSB7XG4gICAgICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkfTogYSByb3cgd2hvc2UgY2VsbHMgaXMgbm90IGFuIGFycmF5YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIEFycmF5LmlzQXJyYXkoY2VsbHMpID8gY2VsbHMgOiBbXSkge1xuICAgICAgICAgICAgaWYgKCFpc1BsYWluT2JqZWN0KGNlbGwpKSB7XG4gICAgICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBhIGNlbGwgdGhhdCBpcyBub3QgYW4gb2JqZWN0YCk7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJhZCgoY2VsbCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuY29udGVudCwgaXNBcnJheVYpKSB7XG4gICAgICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBhIGNlbGwgd2hvc2UgY29udGVudCBpcyBub3QgYW4gYXJyYXlgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGRlZmF1bHQ6XG4gICAgICBpZiAoRlJFRV9URVhUX1RZUEVTLmhhcyh0eXBlKSkge1xuICAgICAgICBpbnYuZnJlZVRleHQucHVzaChpZCk7XG4gICAgICB9IGVsc2UgaWYgKEdSQVBIX1RZUEVTLmhhcyh0eXBlKSkge1xuICAgICAgICBpbnYuZ3JhcGhzLnB1c2goeyBibG9ja0lkOiBpZCwgYmxvY2s6IGJsb2NrIGFzIHVua25vd24gYXMgUmF3R3JhcGhCbG9jayB9KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZEJsb2Nrc09mKGJsb2NrKSkgdmlzaXQoY2hpbGQsIGludiwgcHJvYmxlbXMpO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJhd1NlY3Rpb24ge1xuICBpZD86IHN0cmluZztcbiAgcm93cz86IEFycmF5PHsgY29sdW1ucz86IEFycmF5PHsgYmxvY2tzPzogUmF3QmxvY2tbXSB9PiB9Pjtcbn1cblxuLyoqIEZpbmQgYSBzZWN0aW9uIGJ5IGlkIGluIHRoZSByYXcgZG9jdW1lbnQuIFJldHVybnMgbnVsbCB3aGVuIGFic2VudCBcdTIwMTQgdGhlXG4gKiBoYW5kbGVyIHR1cm5zIHRoYXQgaW50byBhIDQwMCByYXRoZXIgdGhhbiBncmFkaW5nIG5vdGhpbmcgYW5kIHJlcG9ydGluZ1xuICogc3VjY2Vzcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kU2VjdGlvbihcbiAgZG9jOiB7IHNlY3Rpb25zPzogUmF3U2VjdGlvbltdIH0sXG4gIHNlY3Rpb25JZDogc3RyaW5nLFxuKTogUmF3U2VjdGlvbiB8IG51bGwge1xuICBmb3IgKGNvbnN0IHNlY3Rpb24gb2YgZG9jLnNlY3Rpb25zID8/IFtdKSB7XG4gICAgaWYgKHNlY3Rpb24uaWQgPT09IHNlY3Rpb25JZCkgcmV0dXJuIHNlY3Rpb247XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV2Fsa09wdGlvbnMge1xuICAvKipcbiAgICogJ3Rocm93JyAoZGVmYXVsdCk6IHRoZSBCOC9EMTAgaW50ZWdyaXR5IGdhdGUgXHUyMDE0IGEgc3RydWN0dXJhbGx5IGJyb2tlblxuICAgKiBkb2N1bWVudCByYWlzZXMgTWFsZm9ybWVkRG9jdW1lbnRFcnJvciBpbnN0ZWFkIG9mIGdyYWRpbmcuIFRoZSBkZWZhdWx0IG9uXG4gICAqIHB1cnBvc2U6IGEgbmV3IGNhbGxlciBnZXRzIHRoZSBnYXRlIHVubGVzcyBpdCBhcmd1ZXMgaXRzIHdheSBvdXQuXG4gICAqXG4gICAqICdjb2VyY2UnOiB0aGUgcHJlLWdhdGUgZGVmZW5zaXZlIG5hcnJvd2luZywgYnl0ZS1pZGVudGljYWwgaW52ZW50b3J5LlxuICAgKiBSZXNlcnZlZCBmb3IgdGhlIFJFQUQgcGF0aCAoY2Vuc3VzKSwgd2hvc2UgcnVsZWQgZmFpbHVyZSBwb3N0dXJlIGlzXG4gICAqIHdpdGhob2xkLWFuZC1zZXJ2ZSBcdTIwMTQgYSBjZW5zdXNlZCBtYWxmb3JtZWQgZG9jdW1lbnQgbWVyZWx5IG1pc2NvdW50cyxcbiAgICogd2hlcmUgYSBncmFkZWQgb25lIG1pbnRzIGEgd3JvbmcgbWFyay5cbiAgICovXG4gIGludGVncml0eT86ICd0aHJvdycgfCAnY29lcmNlJztcbn1cblxuLyoqIEJ1aWxkIHRoZSBncmFkYWJsZSBpbnZlbnRvcnkgZm9yIG9uZSBzZWN0aW9uIG9mIHRoZSBSQVcgZG9jdW1lbnQuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZW50b3J5U2VjdGlvbihcbiAgc2VjdGlvbjogUmF3U2VjdGlvbixcbiAgb3B0aW9uczogV2Fsa09wdGlvbnMgPSB7fSxcbik6IEdyYWRhYmxlSW52ZW50b3J5IHtcbiAgY29uc3QgaW52OiBHcmFkYWJsZUludmVudG9yeSA9IHtcbiAgICBibGFua0dyb3Vwc0J5QmxvY2s6IFtdLFxuICAgIG11bHRpcGxlQ2hvaWNlOiBbXSxcbiAgICBtYXRjaGluZzogW10sXG4gICAgb3JkZXJpbmc6IFtdLFxuICAgIGdyYXBoczogW10sXG4gICAgZnJlZVRleHQ6IFtdLFxuICAgIHNvbHV0aW9uczogW10sXG4gIH07XG4gIGNvbnN0IHByb2JsZW1zOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBUaGUgc2tlbGV0b24gcnVucyB0aGUgc2FtZSBwcmVzZW50LXZzLWFic2VudCBydWxlIGFzIHRoZSBibG9ja3M6IHJvd3NcbiAgLy8gY29lcmNlZCB0byBbXSBpcyB0aGUgd29yc3Qgc2lsZW50IG91dGNvbWUgb2YgYWxsIFx1MjAxNCB0aGUgd2hvbGUgc2VjdGlvblxuICAvLyBcImNoZWNrc1wiIHN1Y2Nlc3NmdWxseSB3aXRoIHplcm8gaXRlbXMuXG4gIGNvbnN0IHJhdyA9IHNlY3Rpb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGlmIChiYWQocmF3LnJvd3MsIGlzQXJyYXlWKSkge1xuICAgIHByb2JsZW1zLnB1c2goJ3NlY3Rpb246IHJvd3MgaXMgbm90IGFuIGFycmF5Jyk7XG4gIH1cbiAgZm9yIChjb25zdCByb3cgb2YgQXJyYXkuaXNBcnJheShyYXcucm93cykgPyAoc2VjdGlvbi5yb3dzID8/IFtdKSA6IFtdKSB7XG4gICAgaWYgKCFpc1BsYWluT2JqZWN0KHJvdykpIHtcbiAgICAgIHByb2JsZW1zLnB1c2goJ3NlY3Rpb246IGEgcm93IHRoYXQgaXMgbm90IGFuIG9iamVjdCcpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChiYWQocm93LmNvbHVtbnMsIGlzQXJyYXlWKSkge1xuICAgICAgcHJvYmxlbXMucHVzaCgnc2VjdGlvbjogYSByb3cgd2hvc2UgY29sdW1ucyBpcyBub3QgYW4gYXJyYXknKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBjb2x1bW4gb2YgQXJyYXkuaXNBcnJheShyb3cuY29sdW1ucykgPyByb3cuY29sdW1ucyA6IFtdKSB7XG4gICAgICBpZiAoIWlzUGxhaW5PYmplY3QoY29sdW1uKSkge1xuICAgICAgICBwcm9ibGVtcy5wdXNoKCdzZWN0aW9uOiBhIGNvbHVtbiB0aGF0IGlzIG5vdCBhbiBvYmplY3QnKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAoYmFkKGNvbHVtbi5ibG9ja3MsIGlzQXJyYXlWKSkge1xuICAgICAgICBwcm9ibGVtcy5wdXNoKCdzZWN0aW9uOiBhIGNvbHVtbiB3aG9zZSBibG9ja3MgaXMgbm90IGFuIGFycmF5Jyk7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IGJsb2NrIG9mIEFycmF5LmlzQXJyYXkoY29sdW1uLmJsb2NrcykgPyBjb2x1bW4uYmxvY2tzIDogW10pIHtcbiAgICAgICAgaWYgKCFpc1BsYWluT2JqZWN0KGJsb2NrKSkge1xuICAgICAgICAgIHByb2JsZW1zLnB1c2goJ3NlY3Rpb246IGEgYmxvY2tzIGVudHJ5IHRoYXQgaXMgbm90IGFuIG9iamVjdCcpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHZpc2l0KGJsb2NrLCBpbnYsIHByb2JsZW1zKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKHByb2JsZW1zLmxlbmd0aCA+IDAgJiYgb3B0aW9ucy5pbnRlZ3JpdHkgIT09ICdjb2VyY2UnKSB7XG4gICAgdGhyb3cgbmV3IE1hbGZvcm1lZERvY3VtZW50RXJyb3IocHJvYmxlbXMpO1xuICB9XG4gIHJldHVybiBpbnY7XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGNlbnN1cy9jZW5zdXMudHMgXHUyMDE0IGEgcHVibGlzaGVkIHZlcnNpb24ncyBibG9jayBjZW5zdXMgKyBpdGVtIGF0dHJpYnV0aW9uIChTNylcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQM0EncyBcInB1Ymxpc2gtdGltZSByZWdpc3RyeSBjZW5zdXNcIiwgYnVpbHQgdGhlIHdheSBTMiBtYWRlIHBvc3NpYmxlOiB0aGVcbi8vIGNlbnN1cyBpcyBERVJJVkVEIGZyb20gdGhlIHN0b3JlZCB2ZXJzaW9uIHNuYXBzaG90LCBuZXZlciB3cml0dGVuIGJ5XG4vLyBwdWJsaXNoLWFjdGl2aXR5LiBFdmVyeSBwdWJsaXNoZWQgdmVyc2lvbidzIGRvY3VtZW50IGFscmVhZHkgbGl2ZXMgaW5cbi8vIGFjdGl2aXR5X3ZlcnNpb25zLmNvbnRlbnQgZm9yZXZlciwgc28gdGhlIHRhbGx5IGNhbiBiZSBjb21wdXRlZCB3aGVuZXZlciB0aGVcbi8vIGRvY3VtZW50IGlzIG5leHQgcmVhZCBcdTIwMTQgYW5kIGBwdWJsaXNoLWFjdGl2aXR5YCwgd2hpY2ggUzkgcmV3cml0ZXMsIGlzIG5ldmVyXG4vLyB0b3VjaGVkICh0aGlzIGlzIHdoYXQgZGlzc29sdmVkIGZpbmRpbmcgUjYoYik6IG5vdGhpbmcgZ2V0cyB3cml0dGVuIHR3aWNlKS5cbi8vIFNhbWUgcG9zdHVyZSBhcyAwMDI1J3MgZGVyaXZlZCBzdHVkZW50IGRvcm1hbmN5OiBkb24ndCBtYXJrIHdoYXQgeW91IGNhblxuLy8gZGVyaXZlLlxuLy9cbi8vIFR3byBwcm9kdWN0cywgYm90aCBwZXIgdmVyc2lvbjpcbi8vXG4vLyAgIGNvdW50cyBcdTIwMTQgY2Vuc3VzS2V5IFx1MjE5MiBob3cgbWFueSBibG9jayBpbnN0YW5jZXMgb2YgdGhhdCBraW5kIHRoZSB2ZXJzaW9uXG4vLyAgICAgY29udGFpbnMuIFRoZSBrZXkgY29tZXMgZnJvbSB0aGUgcmVnaXN0cnkncyBjZW5zdXNLZXlPZigpLCBzbyBhXG4vLyAgICAgdmFyaWFudC1jYXJyeWluZyBibG9jayB0YWxsaWVzIHBlciB2YXJpYW50IChgZGF0YV9wbG90LmJ1aWxkX2hpc3RvZ3JhbWApXG4vLyAgICAgYW5kIGEgbmV3IGJsb2NrIHR5cGUgaXMgY291bnRlZCB0aGUgZGF5IGl0IHJlZ2lzdGVycy5cbi8vXG4vLyAgIGl0ZW1zIFx1MjAxNCBldmVyeSBSRVNQT05TRSBpZCBpbiB0aGUgdmVyc2lvbiBtYXBwZWQgdG8gdGhlIGNlbnN1cyBrZXkgb2YgdGhlXG4vLyAgICAgYmxvY2sgaXQgYmVsb25ncyB0by4gVGhpcyBpcyB3aGF0IGxldHMgYW4gYWdncmVnYXRlIG92ZXIgc2VjdGlvbl9jaGVja3Ncbi8vICAgICBzYXkgXCIzIG9mIDQgd3JvbmcgYW5zd2VycyB3ZXJlIG9uIGZpbGxfaW5fYmxhbmtcIiBcdTIwMTQgdmVyZGljdHMgYXJlIGtleWVkIGJ5XG4vLyAgICAgaXRlbSBpZCAoYmxhbmsvZ2FwIGlkcyBmb3IgdGhlIGJsYW5rcyBjYXRlZ29yeSwgYmxvY2sgaWRzIGVsc2V3aGVyZSksIGFuZFxuLy8gICAgIG5vdGhpbmcgZWxzZSBpbiB0aGUgZGF0YWJhc2Uga25vd3Mgd2hhdCBhbiBpdGVtIGlkIElTLlxuLy9cbi8vIFdIWSBUSEUgSVRFTSBNQVAgUkVVU0VTIFRIRSBHUkFESU5HIFdBTEsgKHJ1bGluZyBTNy01KS4gVGhlIHNldCBvZiBpZHMgdGhhdFxuLy8gY2FuIGFwcGVhciBpbiBhIHZlcmRpY3QgbWFwIGlzIGRlY2lkZWQgYnkgT05FIHRoaW5nOiB3aGF0IHRoZSBncmFkZXIgYWNjZXB0c1xuLy8gKGludmVudG9yeVNlY3Rpb24sIHNlcnZlci9ncmFkaW5nL3dhbGsudHMpLiBBIHNlY29uZCBlbnVtZXJhdGlvbiB3cml0dGVuIGhlcmVcbi8vIHdvdWxkIGRyaWZ0IGZyb20gaXQgXHUyMDE0IGFuZCBkcmlmdGVkIGF0dHJpYnV0aW9uIGlzIHNpbGVudCwgY291bnRpbmcgYSBzdHVkZW50J3Ncbi8vIGFuc3dlciB1bmRlciB0aGUgd3JvbmcgYmxvY2sgdHlwZSBvciBkcm9wcGluZyBpdC4gU28gdGhpcyBtb2R1bGUgb3ducyBubyBpZFxuLy8gcnVsZXMgYXQgYWxsOiBpdCBhc2tzIHRoZSBncmFkZXIncyBpbnZlbnRvcnkgZm9yIHRoZSBpZHMgYW5kIG9ubHkgc3VwcGxpZXNcbi8vIHRoZSBpZCBcdTIxOTIgY2Vuc3VzLWtleSBqb2luLiB0ZXN0cy9jZW5zdXMudGVzdC50cyBwaW5zIHRoZSBlcXVhbGl0eS5cbi8vXG4vLyBCVU5ETEUgTk9URTogd2Fsay50cyBpbXBvcnRzIGl0cyB0d28gY29sbGFib3JhdG9ycyBhcyBgaW1wb3J0IHR5cGVgIG9ubHksIHNvXG4vLyBwdWxsaW5nIGl0IGluIGhlcmUgY29zdHMgdGhlIHJlYWQgYnVuZGxlIG5vdGhpbmcgYXQgcnVudGltZSBcdTIwMTQgbm8gbWF0aGpzLCBub1xuLy8gc2NvcmVycyAodGhlIGdyYXBoLWtpdC9zY29yZXJzIGRpc2NpcGxpbmUsIGNoZWNrZWQgYnkgdGhlIGJ1bmRsZSdzIHNpemVcbi8vIGNlaWxpbmcgYW5kIGEgZ3JlcC1hYnNlbmNlIHRlc3QpLlxuLy9cbi8vICAgZG9jdW1lbnQgXHUyNTAwXHUyNTAwXHUyNUJBIGVhY2hCbG9jayAocm93c1x1MjE5MmNvbHVtbnNcdTIxOTJibG9ja3MsIGNoaWxkIGJsb2NrcywgcmVmZXJlbmNlUGFuZWwpXG4vLyAgICAgICAgICAgICAgICAgICBcdTI1MDJcbi8vICAgICAgICAgICAgICAgICAgIFx1MjUxQ1x1MjUwMFx1MjVCQSBjb3VudHM6ICB0YWxseSBvZiBjZW5zdXNLZXlPZihibG9jaylcbi8vICAgICAgICAgICAgICAgICAgIFx1MjUxNFx1MjUwMFx1MjVCQSBpbmRleDogICBibG9ja0lkIFx1MjE5MiBjZW5zdXNLZXlcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyNUIyXG4vLyAgIHNlY3Rpb25zIFx1MjUwMFx1MjUwMFx1MjVCQSBpbnZlbnRvcnlTZWN0aW9uIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUxOCAgKGJsYW5rL2dhcCBpZHMsIE1DL21hdGNoaW5nL29yZGVyaW5nL1xuLy8gICAgICAgICAgICAgICAgKHRoZSBncmFkZXIncyBvd24gICAgICAgZ3JhcGgvZnJlZS10ZXh0IGJsb2NrIGlkcylcbi8vICAgICAgICAgICAgICAgICBhY2NlcHRlZC1pZCBzZXQpICAgXHUyNTAwXHUyNTAwXHUyNUJBIGl0ZW1zXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgdHlwZSB7IEFjdGl2aXR5RG9jdW1lbnQsIEJsb2NrIH0gZnJvbSAnQGFjdGl2aXR5L3NjaGVtYSc7XG5pbXBvcnQgeyBjaGlsZEJsb2Nrc09mIH0gZnJvbSAnLi4vY29udGFpbmVyL2Jsb2NrSW5kZXguanMnO1xuaW1wb3J0IHsgYmxvY2tSZWdpc3RyeSwgY2Vuc3VzS2V5T2YgfSBmcm9tICcuLi9yZWdpc3RyeS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyBpbnZlbnRvcnlTZWN0aW9uIH0gZnJvbSAnLi4vc2VydmVyL2dyYWRpbmcvd2Fsay5qcyc7XG5pbXBvcnQgdHlwZSB7IFJhd1NlY3Rpb24gfSBmcm9tICcuLi9zZXJ2ZXIvZ3JhZGluZy93YWxrLmpzJztcblxuLyoqIENlbnN1cyBrZXkgZm9yIGEgYmxvY2sgd2hvc2UgdHlwZSB0aGUgcmVnaXN0cnkgZG9lc24ndCBrbm93LiBVbnJlYWNoYWJsZSBmb3JcbiAqIGEgc2NoZW1hLXZhbGlkIGRvY3VtZW50ICh0aGUgcmVnaXN0cnkgY29tcGxldGVuZXNzIGd1YXJkIG1ha2VzIGV2ZXJ5IGJsb2NrXG4gKiB0eXBlIHJlZ2lzdGVyZWQpLCBhbmQgZGVsaWJlcmF0ZWx5IGEgVklTSUJMRSBidWNrZXQgcmF0aGVyIHRoYW4gYSB0aHJvdzogdGhpc1xuICogcnVucyBvbiB0aGUgcmVhZCBwYXRoLCB3aGVyZSB0aGUgcnVsZWQgd3JpdGUgb3JkZXJpbmcgbWVhbnMgYSB0aHJvd24gY2Vuc3VzXG4gKiB3b3VsZCBjb3N0IHRoZSB2ZXJzaW9uIGl0cyBjYWNoZSByb3cgb24gZXZlcnkgcmVhZC4gQSBzdXJmYWNlZCBgX3Vua25vd25gXG4gKiByb3cgaXMgYSBidWcgcmVwb3J0OyBhIGNyYXNoIGhlcmUgd291bGQgYmUgYSBzaWxlbnQgcGVyZm9ybWFuY2UgY2xpZmYuICovXG5leHBvcnQgY29uc3QgVU5LTk9XTl9DRU5TVVNfS0VZID0gJ191bmtub3duJztcblxuZXhwb3J0IGludGVyZmFjZSBDZW5zdXNDb3VudCB7XG4gIGNlbnN1c0tleTogc3RyaW5nO1xuICBibG9ja0NvdW50OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2Vuc3VzSXRlbSB7XG4gIC8qKiBUaGUgaWQgYSB2ZXJkaWN0IG1hcCBpcyBrZXllZCBieTogYSBibGFuayBpZCwgYW4gaW4tZXF1YXRpb24gZ2FwIGlkXG4gICAqIChgZ2AraGV4KSwgb3IgYSBncmFkYWJsZS9yZWNvcmRlZCBibG9jayBpZC4gKi9cbiAgaXRlbUlkOiBzdHJpbmc7XG4gIGNlbnN1c0tleTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZlcnNpb25DZW5zdXMge1xuICAvKiogRG9jdW1lbnQgb3JkZXIgb2YgZmlyc3QgYXBwZWFyYW5jZS4gKi9cbiAgY291bnRzOiBDZW5zdXNDb3VudFtdO1xuICBpdGVtczogQ2Vuc3VzSXRlbVtdO1xufVxuXG4vKiogVGhlIHJlZ2lzdHJ5J3Mga2V5IHJ1bGUsIGd1YXJkZWQgb24gaXRzIG9uZSBwcmVjb25kaXRpb24gKGEgcmVnaXN0ZXJlZFxuICogdHlwZSkuIFRoZSBydWxlIGl0c2VsZiBpcyBOT1QgcmVzdGF0ZWQgaGVyZSBcdTIwMTQgY2Vuc3VzS2V5T2Ygc3RheXMgdGhlIHNvdXJjZSxcbiAqIHZhcmlhbnQgc3VmZml4IGluY2x1ZGVkLiAqL1xuZnVuY3Rpb24gc2FmZUNlbnN1c0tleShibG9jazogQmxvY2spOiBzdHJpbmcge1xuICBjb25zdCB0eXBlID0gKGJsb2NrIGFzIHsgdHlwZT86IHVua25vd24gfSkudHlwZTtcbiAgaWYgKHR5cGVvZiB0eXBlICE9PSAnc3RyaW5nJyB8fCAhKHR5cGUgaW4gYmxvY2tSZWdpc3RyeSkpIHtcbiAgICByZXR1cm4gVU5LTk9XTl9DRU5TVVNfS0VZO1xuICB9XG4gIHJldHVybiBjZW5zdXNLZXlPZihibG9jayk7XG59XG5cbi8qKiBWaXNpdCBhIGJsb2NrIGFuZCwgZGVwdGgtZmlyc3QsIGV2ZXJ5IGJsb2NrIG5lc3RlZCBpbnNpZGUgaXQuIENoaWxkIGJsb2Nrc1xuICogYXJlIGZvdW5kIFNUUlVDVFVSQUxMWSB2aWEgYmxvY2tJbmRleCdzIGNoaWxkQmxvY2tzT2YgXHUyMDE0IHRoZSBkb2N1bWVudGVkIHNpbmdsZVxuICogZGVmaW5pdGlvbiBvZiBcImlzIHRoaXMgYSBuZXN0ZWQgYmxvY2sgb3IgY29udGVudCBvZiB0aGlzIG9uZT9cIiwgc2hhcmVkIHdpdGhcbiAqIHRoZSBzZXJ2ZWQtZG9jdW1lbnQgaW5kZXggYW5kIHRoZSBhbnN3ZXIta2V5IGV4dHJhY3Rpb24uIEEgZmFkZWQgZXhhbXBsZSdzXG4gKiBzdGVwcyB0aGVyZWZvcmUgY291bnQgYXMgdGhlbXNlbHZlcywgZXhhY3RseSBhcyB0aGV5IGdyYWRlIGFzIHRoZW1zZWx2ZXMuICovXG5mdW5jdGlvbiB2aXNpdERlZXAoYmxvY2s6IEJsb2NrLCB2aXNpdDogKGJsb2NrOiBCbG9jaykgPT4gdm9pZCk6IHZvaWQge1xuICB2aXNpdChibG9jayk7XG4gIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRCbG9ja3NPZihibG9jayBhcyB1bmtub3duIGFzIG9iamVjdCkpIHtcbiAgICB2aXNpdERlZXAoY2hpbGQgYXMgdW5rbm93biBhcyBCbG9jaywgdmlzaXQpO1xuICB9XG59XG5cbi8qKiBFdmVyeSBibG9jayBpbnN0YW5jZSBpbiB0aGUgZG9jdW1lbnQsIGluIGRvY3VtZW50IG9yZGVyOiBzZWN0aW9uIGNvbnRlbnRcbiAqIGZpcnN0IChyb3dzIFx1MjE5MiBjb2x1bW5zIFx1MjE5MiBibG9ja3MpLCB0aGVuIHRoZSByZWZlcmVuY2UgcGFuZWwuIFRoZSBwYW5lbCBpc1xuICogc2NhZmZvbGQgXHUyMDE0IGl0IGlzIG5ldmVyIGNoZWNrZWQsIHNvIGl0IGNvbnRyaWJ1dGVzIGNvdW50cyBhbmQgbm8gaXRlbXMgXHUyMDE0IGJ1dFxuICogaXQgSVMgYXV0aG9yZWQgY29udGVudCBhIHRlYWNoZXIgY2hvc2UsIHNvIGxlYXZpbmcgaXQgb3V0IHdvdWxkIHVuZGVyY291bnRcbiAqIHdoYXQgdGhlIGFjdGl2aXR5IGFjdHVhbGx5IHVzZXMuICovXG5mdW5jdGlvbiBlYWNoQmxvY2soZG9jOiBBY3Rpdml0eURvY3VtZW50LCB2aXNpdDogKGJsb2NrOiBCbG9jaykgPT4gdm9pZCk6IHZvaWQge1xuICBmb3IgKGNvbnN0IHNlY3Rpb24gb2YgZG9jLnNlY3Rpb25zID8/IFtdKSB7XG4gICAgZm9yIChjb25zdCByb3cgb2Ygc2VjdGlvbi5yb3dzID8/IFtdKSB7XG4gICAgICBmb3IgKGNvbnN0IGNvbHVtbiBvZiByb3cuY29sdW1ucyA/PyBbXSkge1xuICAgICAgICBmb3IgKGNvbnN0IGJsb2NrIG9mIGNvbHVtbi5ibG9ja3MgPz8gW10pIHZpc2l0RGVlcChibG9jaywgdmlzaXQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IGJsb2NrIG9mIGRvYy5yZWZlcmVuY2VQYW5lbD8uYmxvY2tzID8/IFtdKSB2aXNpdERlZXAoYmxvY2ssIHZpc2l0KTtcbn1cblxuLyoqXG4gKiBDb21wdXRlIHRoZSBjZW5zdXMgb2YgYW4gVVBHUkFERUQgZG9jdW1lbnQgKHBvc3QtdXBncmFkZSwgcHJlLXNhbml0aXplKS5cbiAqXG4gKiBQcmUtc2FuaXRpemUgb24gcHVycG9zZTogYG9yZGVyaW5nYCdzIGF1dGhvcmVkIGl0ZW0gb3JkZXIgYW5kIHRoZSBibGFua1xuICogYW5zd2VyIGtleXMgYXJlIGdvbmUgZnJvbSB0aGUgc2VydmVkIGFydGlmYWN0LCBhbmQgdGhlIGdyYWRpbmcgaW52ZW50b3J5IHRoaXNcbiAqIGpvaW5zIGFnYWluc3QgcmVhZHMgdGhlIHNhbWUgcmF3IHNoYXBlIHRoZSBncmFkZXIgZG9lcy4gTm90aGluZyBkZXJpdmVkIGhlcmVcbiAqIGlzIHNlY3JldCBcdTIwMTQgYSBjb3VudCBvZiBibG9jayBraW5kcyBhbmQgYSBsaXN0IG9mIHJlc3BvbnNlIGlkcyB0aGUgY2xpZW50XG4gKiBhbHJlYWR5IGhvbGRzIFx1MjAxNCBzbyB0aGUgb3V0cHV0IGNyb3NzZXMgbm8gc2FuaXRpemVyIGJvdW5kYXJ5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2Vuc3VzT2ZEb2N1bWVudChkb2M6IEFjdGl2aXR5RG9jdW1lbnQpOiBWZXJzaW9uQ2Vuc3VzIHtcbiAgY29uc3QgY291bnRzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgY29uc3Qga2V5QnlCbG9ja0lkID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICBlYWNoQmxvY2soZG9jLCAoYmxvY2spID0+IHtcbiAgICBjb25zdCBrZXkgPSBzYWZlQ2Vuc3VzS2V5KGJsb2NrKTtcbiAgICBjb3VudHMuc2V0KGtleSwgKGNvdW50cy5nZXQoa2V5KSA/PyAwKSArIDEpO1xuICAgIGNvbnN0IGlkID0gKGJsb2NrIGFzIHsgaWQ/OiB1bmtub3duIH0pLmlkO1xuICAgIGlmICh0eXBlb2YgaWQgPT09ICdzdHJpbmcnKSBrZXlCeUJsb2NrSWQuc2V0KGlkLCBrZXkpO1xuICB9KTtcblxuICBjb25zdCBpdGVtczogQ2Vuc3VzSXRlbVtdID0gW107XG4gIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3QgcHVzaCA9IChpdGVtSWQ6IHN0cmluZywgYmxvY2tJZDogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgaWYgKCFpdGVtSWQgfHwgc2Vlbi5oYXMoaXRlbUlkKSkgcmV0dXJuO1xuICAgIHNlZW4uYWRkKGl0ZW1JZCk7XG4gICAgaXRlbXMucHVzaCh7XG4gICAgICBpdGVtSWQsXG4gICAgICBjZW5zdXNLZXk6IGtleUJ5QmxvY2tJZC5nZXQoYmxvY2tJZCkgPz8gVU5LTk9XTl9DRU5TVVNfS0VZLFxuICAgIH0pO1xuICB9O1xuXG4gIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBkb2Muc2VjdGlvbnMgPz8gW10pIHtcbiAgICAvLyAnY29lcmNlJyBvcHRzIE9VVCBvZiB0aGUgQjgvRDEwIGludGVncml0eSBnYXRlLCBkZWxpYmVyYXRlbHk6IHRoaXMgaXNcbiAgICAvLyB0aGUgUkVBRCBwYXRoLCB3aG9zZSBydWxlZCBmYWlsdXJlIHBvc3R1cmUgaXMgd2l0aGhvbGQtYW5kLXNlcnZlICh0aGVcbiAgICAvLyBjYWNoZS1maWxsIGNhbGxlciBhbHJlYWR5IGZhaWxzIHNhZmUpLiBBIGNlbnN1c2VkIG1hbGZvcm1lZCBkb2N1bWVudFxuICAgIC8vIG1lcmVseSBtaXNjb3VudHM7IG9ubHkgR1JBRElORyBvbmUgbWludHMgYSB3cm9uZyBtYXJrLCBzbyBvbmx5IGdyYWRpbmdcbiAgICAvLyBydW5zIHRoZSBnYXRlLlxuICAgIGNvbnN0IGludiA9IGludmVudG9yeVNlY3Rpb24oc2VjdGlvbiBhcyB1bmtub3duIGFzIFJhd1NlY3Rpb24sIHtcbiAgICAgIGludGVncml0eTogJ2NvZXJjZScsXG4gICAgfSk7XG4gICAgLy8gQmxhbmtzIGFuZCBtYXRoIGdhcHMgYXR0cmlidXRlIHRvIHRoZWlyIE9XTklORyBibG9jayAodGhlIHdhbGsgYWxyZWFkeVxuICAgIC8vIHJlc29sdmVzIGNvbnRhaW5lcnMgdG8gdGhlIGNoaWxkKSwgd2hpY2ggaXMgd2h5IGEgYmxhbmsgaW5zaWRlIGEgZmFkZWRcbiAgICAvLyBleGFtcGxlIGNvdW50cyBhcyBmYWRlZF93b3JrZWRfZXhhbXBsZSBhbmQgbm90IGFzIGZpbGxfaW5fYmxhbmsuXG4gICAgZm9yIChjb25zdCBncm91cCBvZiBpbnYuYmxhbmtHcm91cHNCeUJsb2NrKSB7XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBncm91cC5rZXlzKSBwdXNoKGtleS5pZCwgZ3JvdXAuYmxvY2tJZCk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgbWMgb2YgaW52Lm11bHRpcGxlQ2hvaWNlKSBwdXNoKG1jLmJsb2NrSWQsIG1jLmJsb2NrSWQpO1xuICAgIGZvciAoY29uc3QgbSBvZiBpbnYubWF0Y2hpbmcpIHB1c2gobS5ibG9ja0lkLCBtLmJsb2NrSWQpO1xuICAgIGZvciAoY29uc3QgbyBvZiBpbnYub3JkZXJpbmcpIHB1c2goby5ibG9ja0lkLCBvLmJsb2NrSWQpO1xuICAgIGZvciAoY29uc3QgZyBvZiBpbnYuZ3JhcGhzKSBwdXNoKGcuYmxvY2tJZCwgZy5ibG9ja0lkKTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIGludi5mcmVlVGV4dCkgcHVzaChpZCwgaWQpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjb3VudHM6IFsuLi5jb3VudHNdLm1hcCgoW2NlbnN1c0tleSwgYmxvY2tDb3VudF0pID0+ICh7XG4gICAgICBjZW5zdXNLZXksXG4gICAgICBibG9ja0NvdW50LFxuICAgIH0pKSxcbiAgICBpdGVtcyxcbiAgfTtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2FuaXRpemUvc2VydmVTZWVkLnRzIFx1MjAxNCB0aGUgT05FIHNwZWxsaW5nIG9mIHRoZSBzZXJ2ZS1zaHVmZmxlIHNlZWQgKEcxKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzZWVkIHRoYXQgZGVjaWRlcyB3aGF0IGFycmFuZ2VtZW50IGVhY2ggc3R1ZGVudCBpcyBTRVJWRUQgXHUyMDE0IGFuZFxuLy8gdGhlcmVmb3JlIHdoYXQgdGhlIGdyYWRlciBtdXN0IHJlY29tcHV0ZSB0byB0ZWxsIFwiYXJyYW5nZWQgZGVsaWJlcmF0ZWx5XCJcbi8vIGZyb20gXCJuZXZlciB0b3VjaGVkXCIgKHRoZSBvcmRlcmluZyBvbWlzc2lvbiBydWxlKS4gVW50aWwgMjAyNi0wOC0wNiB0aGVcbi8vIGNvbnRyYWN0IGV4aXN0ZWQgYXMgdHdvIHNwZWxsaW5ncyBhZ3JlZWluZyBieSBsdWNrOiB0aGUgcmVhZCBwYXRoIGNvbXBvc2VkXG4vLyBgJHt2ZXJzaW9uSWR9OiR7dXNlcklkfWAgaW5saW5lIHdoaWxlIHRoZSBncmFkaW5nIHNpZGUgaGFkIGl0cyBvd25cbi8vIHNlcnZlU2VlZCgpIChzMi1yZXRybyBmaW5kaW5nIDcpLiBUd28gc3RyaW5ncyBkcmlmdGluZyBoZXJlIHdvdWxkIHNpbGVudGx5XG4vLyBtaXMtZ3JhZGUgYSBzdWJzZXQgb2Ygc3R1ZGVudHMgXHUyMDE0IGNsb3NlIHRvIHVuZGlhZ25vc2FibGUgZnJvbSBhIGJ1ZyByZXBvcnQuXG4vL1xuLy8gRGVwZW5kZW5jeS1mcmVlIGxlYWYgT04gUFVSUE9TRTogaW1wb3J0ZWQgYnkgdGhlIHJlYWQgYnVuZGxlICh0aGUgaGFuZGxlcilcbi8vIGFuZCB0aGUgZ3JhZGluZyBidW5kbGUgKHNlcnZlZE9yZGVyKSwgc28gaXQgbXVzdCBuZXZlciBncm93IGFuIGltcG9ydC5cbi8vXG4vLyBOQiB0aGUgc2VlZGVkIHNodWZmbGUgYmVoaW5kIHRoaXMgc2VlZCBpcyBsb2FkLWJlYXJpbmcgZm9yIFM0J3Mgb3JkZXJpbmdcbi8vIG9taXNzaW9uIHJ1bGUgYW5kIGNhcnJpZXMgYW4gdW5leHBsYWluZWQgb25lLW9mZiBmbGFrZSBpbiBTVEFURSdzIHdhdGNoXG4vLyBpdGVtcyAoc2FuaXRpemUudGVzdCBcImRpZmZlcnMgYWNyb3NzIHN0dWRlbnRzXCIsIDIwMjYtMDgtMDEsIDEtaW4tMTQpIFx1MjAxNCBpZlxuLy8gdGhhdCB0ZXN0IG1pc2JlaGF2ZXMgYWZ0ZXIgYW55IGNoYW5nZSBoZXJlLCB0cmVhdCBpdCBhcyB0aGUgc2Vjb25kIHNpZ2h0aW5nLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLyoqIENvbXBvc2UgdGhlIHNlZWQgdGhlIHJlYWQgcGF0aCBzZXJ2ZXMgd2l0aCBhbmQgdGhlIGdyYWRlciByZWNvbXB1dGVzIGZyb20uICovXG5leHBvcnQgZnVuY3Rpb24gc2VydmVTZWVkKHZlcnNpb25JZDogc3RyaW5nLCBzdHVkZW50SWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBgJHt2ZXJzaW9uSWR9OiR7c3R1ZGVudElkfWA7XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHNlcnZlci9qd3QudHMgXHUyMDE0IHRoZSBPTkUgdW52ZXJpZmllZCBgc3ViYCByZWFkZXIgKEcyKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERlY29kZWQgV0lUSE9VVCB2ZXJpZmljYXRpb24sIGRlbGliZXJhdGVseTogYnkgdGhlIHRpbWUgZWl0aGVyIGhhbmRsZXIgY2FsbHNcbi8vIHRoaXMsIGl0cyB1c2VyLXNjb3BlZCBSUEMgaGFzIGFscmVhZHkgc3VjY2VlZGVkLCB3aGljaCBtZWFucyBQb3N0Z1JFU1Rcbi8vIHZlcmlmaWVkIHRoZSB0b2tlbidzIHNpZ25hdHVyZS4gVGhpcyBvbmx5IHJlLXJlYWRzIHRoZSBgc3ViYCBjbGFpbSBcdTIwMTQgdG8ga2V5XG4vLyB0aGUgc3R1ZGVudCdzIHNlcnZlIHNodWZmbGUgKHJlYWQgcGF0aCkgYW5kIHRoZWlyIHNlY3Rpb25fY2hlY2tzIHJvd1xuLy8gKGNoZWNrIHBhdGgpLiBORVZFUiBhbiBhdXRob3JpemF0aW9uIGlucHV0LlxuLy9cbi8vIFdhcyBwYXN0ZWQgYnl0ZS1pZGVudGljYWxseSBpbnRvIGJvdGggaGFuZGxlcnMgYXMgand0U3ViIC8gand0U3ViamVjdFxuLy8gKHMyLXJldHJvIGZpbmRpbmcgOCk7IG9uZSBjb3B5LCBvbmUgbmFtZSwgc2luY2UgMjAyNi0wOC0wNi5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBUaGUgdG9rZW4ncyBgc3ViYCBjbGFpbSwgb3IgbnVsbCB3aGVuIHRoZSBoZWFkZXIgY2FycmllcyBubyByZWFkYWJsZSBKV1QuICovXG5leHBvcnQgZnVuY3Rpb24gand0U3ViKGF1dGhIZWFkZXI6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCB0b2tlbiA9IGF1dGhIZWFkZXIucmVwbGFjZSgvXkJlYXJlclxccysvaSwgJycpO1xuICBjb25zdCBwYXlsb2FkID0gdG9rZW4uc3BsaXQoJy4nKVsxXTtcbiAgaWYgKCFwYXlsb2FkKSByZXR1cm4gbnVsbDtcbiAgdHJ5IHtcbiAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShcbiAgICAgIGF0b2IocGF5bG9hZC5yZXBsYWNlKC8tL2csICcrJykucmVwbGFjZSgvXy9nLCAnLycpKSxcbiAgICApIGFzIHsgc3ViPzogdW5rbm93biB9O1xuICAgIHJldHVybiB0eXBlb2YganNvbi5zdWIgPT09ICdzdHJpbmcnID8ganNvbi5zdWIgOiBudWxsO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBzZXJ2ZXIvdXVpZC50cyBcdTIwMTQgT05FIGlkLXNoYXBlIHJ1bGUgZm9yIHRoZSBBUEkgc3VyZmFjZSAoRzIpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVEhFIERFQ0lTSU9OIChlbmctcmV2aWV3IEcyLCAyMDI2LTA4LTA2KTogU1RSSUNUIGV2ZXJ5d2hlcmUgaW4gc2hhcmVkIHNlcnZlclxuLy8gc291cmNlLiBVVUlEX1JFIGV4aXN0ZWQgYXQgZm91ciBzaXRlcyB3aXRoIHR3byBzdHJpY3RuZXNzZXMgXHUyMDE0IHRoZSByZWFkIEFQSVxuLy8gYWNjZXB0ZWQgYW55IGhleCBuaWJibGVzIHdoaWxlIHRoZSBjaGVjayBBUEkgcmVxdWlyZWQgYSByZWFsIHZlcnNpb24gbmliYmxlXG4vLyBhbmQgUkZDIHZhcmlhbnQgXHUyMDE0IHNvIHRoZSBzYW1lIGFjdGl2aXR5IGlkIGNvdWxkIGJlIHZhbGlkIG9uIG9uZSBlbmRwb2ludCBhbmRcbi8vIHJlamVjdGVkIGJ5IHRoZSBvdGhlciwgd2l0aCBubyByZWNvcmRlZCB3aHkgKHMyLWF1ZGl0IGNvcnJlY3Rpb25zIDMvNSkuXG4vLyBFdmVyeSBsZWdpdGltYXRlIGlkIGlzIGEgUG9zdGdyZXMgZ2VuX3JhbmRvbV91dWlkKCkgKHY0LCBSRkMgdmFyaWFudCksIHNvXG4vLyBzdHJpY3QgY29zdHMgbm8gcmVhbCBjbGllbnQgYW55dGhpbmcgYW5kIHJlamVjdHMgZ2FyYmFnZSBlYXJsaWVyLlxuLy9cbi8vIFRoZSB0d28gcmVtYWluaW5nIExPT1NFIGNvcGllcyBsaXZlIGluIGluZ2VzdC1zdWJtaXNzaW9uIGFuZCBnZXQtZmVlZGJhY2snc1xuLy8gRGVubyBmaWxlcywgZGVsaWJlcmF0ZWx5IHVudG91Y2hlZDogYm90aCBmdW5jdGlvbnMgc2VydmUgb25seSB0aGUgYW5vbnltb3VzXG4vLyBwdWJsaXNoZWQtcGFnZSB3aXJlIGFuZCBhcmUgZGVsZXRlZCBhdCBTOSAoY3V0b3ZlciBjaGVja2xpc3QgQzE1KSBcdTIwMTRcbi8vIHRpZ2h0ZW5pbmcgYSBzdXJmYWNlIHNjaGVkdWxlZCBmb3IgZGVtb2xpdGlvbiB3b3VsZCBidXkgdHdvIHJlZGVwbG95cyBvZiBhXG4vLyBkb29tZWQgZnVuY3Rpb24uIFRoZWlyIGNvcGllcyBjYXJyeSBhIHBvaW50ZXIgaGVyZS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBSRkMgNDEyMiB2MVx1MjAxM3Y1LCB2YXJpYW50IDEweHggXHUyMDE0IHdoYXQgZ2VuX3JhbmRvbV91dWlkKCkgYW5kIGV2ZXJ5IGxlZ2l0aW1hdGVcbiAqIGNsaWVudCBpZCBhY3R1YWxseSBsb29rIGxpa2UuICovXG5leHBvcnQgY29uc3QgVVVJRF9SRSA9XG4gIC9eWzAtOWEtZl17OH0tWzAtOWEtZl17NH0tWzEtNV1bMC05YS1mXXszfS1bODlhYl1bMC05YS1mXXszfS1bMC05YS1mXXsxMn0kL2k7XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHNlcnZlci9nZXQtYWN0aXZpdHktaGFuZGxlci50cyBcdTIwMTQgdGhlIGdldC1hY3Rpdml0eSByZXF1ZXN0IGhhbmRsZXIgKFMyKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBmdWxsIGJyYW5jaGluZyBsb2dpYyBvZiB0aGUgZ2V0LWFjdGl2aXR5IEVkZ2UgRnVuY3Rpb24sIGV4dHJhY3RlZCBoZXJlIHNvXG4vLyBpdCBsaXZlcyBpbiB0aGUgVEVTVEVELCBDSS1kcmlmdC1ndWFyZGVkIHZpZXdlci1zZXJ2ZXIgYnVuZGxlIGluc3RlYWQgb2YgaW5cbi8vIHVudGVzdGFibGUgRGVubyBnbHVlICh0aGUgUzIgcmV2aWV3IGZvdW5kIHRoZSAzNzQtbGluZSBmdW5jdGlvbiB3YXMgdGhlIG1vc3Rcbi8vIGJyYW5jaC1oZWF2eSBpbiB0aGUgcmVwbyB3aXRoIHplcm8gYXV0b21hdGVkIGNvdmVyYWdlKS4gVGhlIERlbm8gZW50cnkgcG9pbnRcbi8vIChzdXBhYmFzZS9mdW5jdGlvbnMvZ2V0LWFjdGl2aXR5L2luZGV4LnRzKSBpcyBub3cgdGhpbiB3aXJpbmc6IGl0IHJlYWRzIGVudixcbi8vIGJ1aWxkcyB0aGUgU3VwYWJhc2UgY2xpZW50cyBiZWhpbmQgdGhlIGBHZXRBY3Rpdml0eURiYCBwb3J0LCBwYXNzZXMgdGhlXG4vLyBfc2hhcmVkL2NvcnMudHMgaGVscGVycyBiZWhpbmQgdGhlIGBDb3JzS2l0YCBwb3J0LCBhbmQgc2VydmVzIHRoZSBoYW5kbGVyXG4vLyB0aGlzIGZhY3RvcnkgcmV0dXJucy4gRXZlcnl0aGluZyBvYnNlcnZhYmxlIFx1MjAxNCBzdGF0dXMgY29kZXMsIGVycm9yIGNvZGVzLFxuLy8gY2FjaGUgaGVhZGVycywgcmVzcG9uc2UgZW52ZWxvcGVzIFx1MjAxNCBpcyBkZWNpZGVkIEhFUkUgYW5kIHBpbm5lZCBieVxuLy8gdGVzdHMvZ2V0LWFjdGl2aXR5LWhhbmRsZXIudGVzdC50cy5cbi8vXG4vLyBUaHJlZSBHRVQgbW9kZXMgb24gb25lIGZ1bmN0aW9uOlxuLy9cbi8vICAgMS4gTUVUQSAoYW5vbnltb3VzLCByYXRlLWxpbWl0ZWQgXHUyMDE0IHJ1bGluZyAzLjJBKTpcbi8vICAgICAgICBHRVQgP2FjdGl2aXR5X2lkPTx1dWlkPiZtZXRhPTFcbi8vICAgICAgXHUyMTkyIHsgdGl0bGUsIHRlYWNoZXJfbmFtZSB9IGFuZCBOT1RISU5HIGVsc2UgXHUyMDE0IHRoZSBwcmUtYXV0aCBpbnRlcnN0aXRpYWxcbi8vICAgICAgICBjb250cmFjdCAoXCJNcnMuIEphZmFyaSdzICdMaW5lYXIgU3lzdGVtcydcIiArIFwidXNlIHlvdXIgQGRpc3RyaWN0Lm9yZ1xuLy8gICAgICAgIGFjY291bnRcIikuIFNhbWUgZGF0YSBhbnkgcHVibGlzaGVkIHBhZ2UgYWxyZWFkeSBzaG93cyBwdWJsaWNseS5cbi8vXG4vLyAgIDFiLiBDTEFTUyBNRVRBIChhbm9ueW1vdXMsIHNhbWUgbGltaXRlciBcdTIwMTQgUzkgRHJvcCAyLCBELTMvRS0yKTpcbi8vICAgICAgICBHRVQgP2pvaW5fY29kZT08Y29kZT4mbWV0YT0xXG4vLyAgICAgIFx1MjE5MiB7IGNsYXNzX25hbWUgfSBhbmQgTk9USElORyBlbHNlIFx1MjAxNCB0aGUgam9pbiBnYXRlJ3MgXCJKb2luIDxjbGFzcyBuYW1lPlwiXG4vLyAgICAgICAgaW5zdGVhZCBvZiB0aGUgYmFyZSBjb2RlLiBSaWRlcyBUSElTIGJyYW5jaCByYXRoZXIgdGhhbiBhIGRpcmVjdCBhbm9uXG4vLyAgICAgICAgUG9zdGdSRVNUIGdyYW50IHNvIHRoZSBvbmUgYW5vbnltb3VzIHN1cmZhY2Uga2VlcHMgaXRzIHJlcXVlc3Rcbi8vICAgICAgICBzaGFwaW5nIChFLTIncyByZWplY3Rpb24gcmVhc29uKS4gRW51bWVyYXRpb24gcG9zdHVyZSByZWNvcmRlZCBpblxuLy8gICAgICAgIDAwMzAncyBoZWFkZXIgKE9WLTQpOiBjb2RlcyBcdTIyNDgyXjI5LjcsIHRoZSBsaW1pdGVyIGlzIG9wcG9ydHVuaXN0aWNcbi8vICAgICAgICBub3QgYSBndWFyYW50ZWUsIHBheW9mZiBpcyBhIGNsYXNzIG5hbWUsIHJlY292ZXJ5IGlzIEIxNFxuLy8gICAgICAgIHJlbW92ZS1hbmQtcmVnZW5lcmF0ZTsgcmV2aXNpdCB0cmlnZ2VycyBuYW1lZCB0aGVyZS5cbi8vXG4vLyAgIDIuIFJFU09MVkUgKGF1dGhlbnRpY2F0ZWQpOlxuLy8gICAgICAgIEdFVCA/YWN0aXZpdHlfaWQ9PHV1aWQ+XG4vLyAgICAgIFx1MjE5MiB7IGFjdGl2aXR5X2lkLCB2ZXJzaW9uX2lkLCB2ZXJzaW9uX251bSwgdGl0bGUgfSBmb3IgdGhlIENVUlJFTlRcbi8vICAgICAgICBwdWJsaXNoZWQgdmVyc2lvbi4gU2VydmVkIGBuby1jYWNoZWAgc28gYSByZXB1Ymxpc2ggaXMgdmlzaWJsZSBvbiB0aGVcbi8vICAgICAgICBuZXh0IG9wZW4gKHJldmFsaWRhdGUsIGRvbid0IHJlLWRvd25sb2FkIFx1MjAxNCBzYW1lIHBvc3R1cmUgYXMgdGhlIFIyXG4vLyAgICAgICAgbGl2ZSBhbGlhcykuXG4vL1xuLy8gICAzLiBDT05URU5UIChhdXRoZW50aWNhdGVkKTpcbi8vICAgICAgICBHRVQgP2FjdGl2aXR5X2lkPTx1dWlkPiZ2ZXJzaW9uX2lkPTx1dWlkPlxuLy8gICAgICBcdTIxOTIgdGhlIFVQR1JBREVEICg0QSkgKyBTQU5JVElaRUQgKFRWNC1BKSBkb2N1bWVudCBmb3IgdGhhdCB2ZXJzaW9uLCBwbHVzXG4vLyAgICAgICAgcGVyLXN0dWRlbnQgc2VydmUtdGltZSBzaHVmZmxlcy4gVGhlIFVSTCBpcyB2ZXJzaW9uLWtleWVkLCBzbyB0aGVcbi8vICAgICAgICByZXNwb25zZSBpcyBzZXJ2ZWQgYHByaXZhdGUsIG1heC1hZ2U9MzE1MzYwMDAsIGltbXV0YWJsZWAgXHUyMDE0IHRoZVxuLy8gICAgICAgIGJyb3dzZXIgbmV2ZXIgcmVmZXRjaGVzIGEgdmVyc2lvbiBpdCBoYXMuIE9ubHkgdGhlIENVUlJFTlQgdmVyc2lvbiBpc1xuLy8gICAgICAgIHNlcnZlZCAoYSBzdGFsZSB2ZXJzaW9uX2lkIDQwNHMgd2l0aCBjb2RlICdzdGFsZV92ZXJzaW9uJzsgdGhlIHZpZXdlclxuLy8gICAgICAgIHJlLXJlc29sdmVzKSwgc28gYSByZXB1Ymxpc2ggaW52YWxpZGF0ZXMgYnkgY2hhbmdpbmcgdGhlIFVSTCwgbmV2ZXJcbi8vICAgICAgICBieSBleHBpcmluZyBhIGNhY2hlLlxuLy9cbi8vIFBpcGVsaW5lIChjb250ZW50IG1vZGUpOiBnZXRfcHVibGlzaGVkX2FjdGl2aXR5IFJQQyBhcyB0aGUgQ0FMTEVSICh0aGUgREJcbi8vIGVuZm9yY2VzIGF1dGggKyBwdWJsaXNoZWQtb25seTsgZHJhZnQgY29udGVudCBpcyB1bnJlYWNoYWJsZSBoZXJlKSBcdTIxOTJcbi8vIGR1cmFibGUgcGVyLXZlcnNpb24gY2FjaGUgbG9va3VwIGluIGFjdGl2aXR5X3ZlcnNpb25fcmVhZHMga2V5ZWQgYnlcbi8vICh2ZXJzaW9uX2lkLCBTQU5JVElaRVJfUkVWKSBcdTIxOTIgb24gbWlzcyB0aGUgY2FjaGUtZmlsbCBwYXRoIGJlbG93IFx1MjE5MlxuLy8gYXBwbHlTZXJ2ZVNodWZmbGVzIHNlZWRlZCBgJHt2ZXJzaW9uX2lkfToke3VzZXJfaWR9YCAoZGV0ZXJtaW5pc3RpYzogcmVsb2Fkc1xuLy8gbmV2ZXIgcmVzaHVmZmxlOyB0aGUgY2FjaGVkIGFydGlmYWN0IHN0YXlzIHN0dWRlbnQtaW5kZXBlbmRlbnQpLlxuLy9cbi8vICAgY2FjaGUgTUlTUyBcdTI1MDBcdTI1MDBcdTI1QkEgcmVhZFZlcnNpb24gXHUyNTAwXHUyNTAwXHUyNUJBIHVwZ3JhZGUgXHUyNTAwXHUyNTAwXHUyNUJBIHNhbml0aXplXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdTI1MDJcbi8vICAgICAgICAgICAgICAgICAgICBcdTI1MENcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MThcbi8vICAgICAgICAgICAgICAgICAgICBcdTI1QkNcbi8vICAgICAgICAgICAgICB3cml0ZUNlbnN1cyAoUzcpIFx1MjUwMFx1MjUwMGZhaWxzXHUyNTAwXHUyNTAwXHUyNUJBIE5PIGNhY2hlIHJvdzogbmV4dCByZWFkIHJldHJpZXNcbi8vICAgICAgICAgICAgICAgICAgICBcdTI1MDIgb2sgICAgICAgICAgICAgICAgICAoc2VsZi1oZWFsaW5nOyBzZWUgdGhlIG9yZGVyaW5nXG4vLyAgICAgICAgICAgICAgICAgICAgXHUyNUJDICAgICAgICAgICAgICAgICAgICAgIG5vdGUgYXQgdGhlIGNhbGwgc2l0ZSlcbi8vICAgICAgICAgICAgICB1cHNlcnRDYWNoZSBcdTI1MDBcdTI1MDBcdTI1QkEgZGVsZXRlU3RhbGVDYWNoZSAob2xkLXJldiBHQyBmb3IgdGhpcyB2ZXJzaW9uKVxuLy9cbi8vIFRoZSBhbmFseXRpY3Mgd3JpdGVzIGFyZSBhIFNJREUtQ0hBTk5FTDogZXZlcnkgb25lIG9mIHRoZW0gY2FuIGZhaWwgd2l0aG91dFxuLy8gY2hhbmdpbmcgdGhlIHN0dWRlbnQncyByZXNwb25zZS4gQSBjYWNoZSBISVQgZG9lcyBub25lIG9mIHRoaXMgd29yay5cbi8vXG4vLyBBY2Nlc3MgcnVsZSAoUzIgZGVjaXNpb24gMik6IEFOWSBhdXRoZW50aWNhdGVkIHVzZXIgKHN0dWRlbnQgb3IgdGVhY2hlcikgbWF5XG4vLyByZWFkIHRoZSBwdWJsaXNoZWQgY3VycmVudCB2ZXJzaW9uIG9mIGEgbm9uLWRlbGV0ZWQgYWN0aXZpdHkgXHUyMDE0IHRoZSBSMlxuLy8gbGluay1zaGFyZSBtb2RlbCBiZWhpbmQgc2lnbi1pbi4gQ2xhc3NlcyBnYXRlIGlkZW50aXR5ICh0aGUgMTMrIGFzc2VydGlvbiksXG4vLyBub3QgYWN0aXZpdHkgYWNjZXNzLlxuLy9cbi8vIEtub3duIHJlc2lkdWFsIChkb2N1bWVudGVkLCBhY2NlcHRlZCk6IHRoZSBicm93c2VyIEhUVFAgY2FjaGUgaXMgcGVyXG4vLyBwcm9maWxlLCBub3QgcGVyIGFjY291bnQuIE9uIGEgc2hhcmVkIENocm9tZWJvb2sgcHJvZmlsZSwgc3R1ZGVudCBCIGNhbiBiZVxuLy8gc2VydmVkIHN0dWRlbnQgQSdzIGNhY2hlZCBjb250ZW50IHJlc3BvbnNlIFx1MjAxNCBpZGVudGljYWwgZXhjZXB0IHRoZSBvcmRlcmluZ1xuLy8gcGVybXV0YXRpb24gKHNlZWRlZCBwZXIgc3R1ZGVudCkuIE5vIGtleSBtYXRlcmlhbCBkaWZmZXJzLCBhbmQgZ3JhZGluZ1xuLy8gcmVmZXJlbmNlcyBpdGVtIGlkcyAob3JkZXItaW5kZXBlbmRlbnQpLCBzbyB0aGUgd29yc3QgY2FzZSBpcyBhIGNvc21ldGljXG4vLyBwZXJtdXRhdGlvbiBzd2FwOyBTMSdzIHNpZ25PdXRFdmVyeXRoaW5nIHB1cmdlcyB2aWV3ZXIgU1RPUkFHRSwgbm90IHRoZVxuLy8gSFRUUCBjYWNoZSwgYW5kIHB1dHRpbmcgdGhlIHVzZXIgaWQgaW4gdGhlIFVSTCB0byBzcGxpdCBjYWNoZSBrZXlzIHdvdWxkXG4vLyBsZWFrIGFuIGlkZW50aWZpZXIgaW50byBsb2dzIGZvciBubyBzZWN1cml0eSBnYWluLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgVXBncmFkZUVycm9yLCB1cGdyYWRlQWN0aXZpdHlEb2N1bWVudCB9IGZyb20gJ0BhY3Rpdml0eS9zY2hlbWEnO1xuaW1wb3J0IHsgY2Vuc3VzT2ZEb2N1bWVudCB9IGZyb20gJy4uL2NlbnN1cy9jZW5zdXMuanMnO1xuaW1wb3J0IHR5cGUgeyBWZXJzaW9uQ2Vuc3VzIH0gZnJvbSAnLi4vY2Vuc3VzL2NlbnN1cy5qcyc7XG5pbXBvcnQgeyBTQU5JVElaRVJfUkVWLCBzYW5pdGl6ZUFjdGl2aXR5RG9jdW1lbnQgfSBmcm9tICcuLi9zYW5pdGl6ZS9zYW5pdGl6ZS5qcyc7XG5pbXBvcnQgeyBzZXJ2ZVNlZWQgfSBmcm9tICcuLi9zYW5pdGl6ZS9zZXJ2ZVNlZWQuanMnO1xuaW1wb3J0IHsgand0U3ViIH0gZnJvbSAnLi9qd3QuanMnO1xuaW1wb3J0IHsgVVVJRF9SRSB9IGZyb20gJy4vdXVpZC5qcyc7XG5pbXBvcnQgeyBhcHBseVNlcnZlU2h1ZmZsZXMgfSBmcm9tICcuLi9zYW5pdGl6ZS9zaHVmZmxlLmpzJztcbmltcG9ydCB0eXBlIHsgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCB9IGZyb20gJy4uL3Nhbml0aXplL3Nhbml0aXplZC10eXBlcy5qcyc7XG5cbi8qKiBCdW1wIHdoZW4gdGhlIHJlc3BvbnNlIGVudmVsb3BlIGNoYW5nZXMgc2hhcGUgKHRoZSBkb2MgSU5TSURFIGl0IGlzXG4gKiB2ZXJzaW9uZWQgYnkgdGhlIHNjaGVtYSArIFNBTklUSVpFUl9SRVYsIG5vdCBieSB0aGlzKS4gKi9cbmV4cG9ydCBjb25zdCBBUElfVkVSU0lPTiA9IDE7XG5cbi8vIFVVSURfUkUgaXMgaW1wb3J0ZWQgKHNlcnZlci91dWlkLnRzLCBHMik6IHRoaXMgZmlsZSdzIGxvb3NlIGxvY2FsIGNvcHlcbi8vIGFjY2VwdGVkIGlkcyB0aGUgY2hlY2sgQVBJIHJlamVjdGVkIFx1MjAxNCBvbmUgc2hhcGUgcnVsZSBub3csIHN0cmljdC5cblxuLy8gLS0tLSBQb3J0cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBoYW5kbGVyIG5ldmVyIHRvdWNoZXMgc3VwYWJhc2UtanMgb3IgRGVubyBkaXJlY3RseTsgdGhlIGVudHJ5IHBvaW50XG4vLyBpbXBsZW1lbnRzIHRoZXNlIGFnYWluc3QgdGhlIHJlYWwgY2xpZW50cywgdGVzdHMgaW1wbGVtZW50IHRoZW0gd2l0aCBmYWtlcy5cblxuLyoqIFRoZSBgeyBkYXRhLCBlcnJvciB9YCBzaGFwZSBldmVyeSBzdXBhYmFzZS1qcyBxdWVyeSByZXNvbHZlcyB0by4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGJSZXN1bHQ8VD4ge1xuICBkYXRhOiBUIHwgbnVsbDtcbiAgZXJyb3I6IHsgbWVzc2FnZT86IHN0cmluZyB9IHwgbnVsbDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQdWJsaXNoZWRBY3Rpdml0eVJvdyB7XG4gIHZlcnNpb25faWQ6IHN0cmluZztcbiAgdmVyc2lvbl9udW06IG51bWJlcjtcbiAgdGl0bGU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHZXRBY3Rpdml0eURiIHtcbiAgLyoqIGBnZXRfYWN0aXZpdHlfcHVibGljX21ldGFgIFJQQyBhcyBhbm9uIChwb3N0Z3Jlcy1vd25lZCBERUZJTkVSOyAwMDE3XG4gICAqIGRvY3VtZW50cyB0aGUgZGVsaWJlcmF0ZSBncmFudCBcdTIwMTQgb25lIG9mIGV4YWN0bHkgVFdPIGFub24gUlBDcyBzaW5jZVxuICAgKiAwMDMwLCB3aXRoIGNsYXNzTWV0YSdzIGJlbG93OyB2ZXJpZnktMDAxNyBcdTAwQTdEICsgdmVyaWZ5LTAwMjggXHUwMEE3QSBib3RoIHBpblxuICAgKiB0aGUgcm9zdGVyKS4gKi9cbiAgcHVibGljTWV0YShcbiAgICBhY3Rpdml0eUlkOiBzdHJpbmcsXG4gICk6IFByb21pc2U8RGJSZXN1bHQ8eyB0aXRsZTogc3RyaW5nOyB0ZWFjaGVyX25hbWU6IHN0cmluZyB8IG51bGwgfT4+O1xuICAvKiogYGdldF9jbGFzc19wdWJsaWNfbWV0YWAgUlBDIGFzIGFub24gKDAwMzA7IHRoZSBqb2luIGdhdGUncyBwcmUtYXV0aFxuICAgKiBjbGFzcy1uYW1lIGxvb2t1cCBcdTIwMTQgdGhlIHJvc3RlcidzIFNFQ09ORCBhbm9uIFJQQywgYXNzZXJ0ZWQgaW5cbiAgICogdmVyaWZ5LTAwMjggXHUwMEE3QSkuICovXG4gIGNsYXNzTWV0YShqb2luQ29kZTogc3RyaW5nKTogUHJvbWlzZTxEYlJlc3VsdDx7IG5hbWU6IHN0cmluZyB9Pj47XG4gIC8qKiBgZ2V0X3B1Ymxpc2hlZF9hY3Rpdml0eWAgUlBDIGFzIHRoZSBDQUxMRVIgKEF1dGhvcml6YXRpb24gaGVhZGVyIHBhc3NlZFxuICAgKiB0aHJvdWdoKSwgc28gdGhlIERCIGVuZm9yY2VzIGF1dGggKyBwdWJsaXNoZWQtb25seSBcdTIwMTQgbm90IHRoaXMgaGFuZGxlci4gKi9cbiAgcHVibGlzaGVkQWN0aXZpdHkoXG4gICAgYXV0aEhlYWRlcjogc3RyaW5nLFxuICAgIGFjdGl2aXR5SWQ6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxEYlJlc3VsdDxQdWJsaXNoZWRBY3Rpdml0eVJvdz4+O1xuICAvKiogQ2FjaGUgcm93IGZyb20gYWN0aXZpdHlfdmVyc2lvbl9yZWFkcyAoc2VydmljZSByb2xlKS4gKi9cbiAgcmVhZENhY2hlKFxuICAgIHZlcnNpb25JZDogc3RyaW5nLFxuICAgIHNhbml0aXplclJldjogc3RyaW5nLFxuICApOiBQcm9taXNlPERiUmVzdWx0PHsgY29udGVudDogdW5rbm93biB9Pj47XG4gIC8qKiBWZXJzaW9uIHJvdyBmcm9tIGFjdGl2aXR5X3ZlcnNpb25zIChzZXJ2aWNlIHJvbGUpLiAqL1xuICByZWFkVmVyc2lvbih2ZXJzaW9uSWQ6IHN0cmluZyk6IFByb21pc2U8RGJSZXN1bHQ8eyBjb250ZW50OiB1bmtub3duIH0+PjtcbiAgLyoqIFVwc2VydCBrZXllZCAodmVyc2lvbl9pZCwgc2FuaXRpemVyX3JldikgXHUyMDE0IGNvbmN1cnJlbnQgbWlzc2VzIHdyaXRlIHRoZVxuICAgKiBzYW1lIGRldGVybWluaXN0aWMgYXJ0aWZhY3QsIHNvIGxhc3Qtd3JpdGUtd2lucyBpcyBoYXJtbGVzcy4gKi9cbiAgdXBzZXJ0Q2FjaGUocm93OiB7XG4gICAgdmVyc2lvbl9pZDogc3RyaW5nO1xuICAgIHNhbml0aXplcl9yZXY6IHN0cmluZztcbiAgICBzY2hlbWFfdmVyc2lvbjogbnVtYmVyO1xuICAgIGNvbnRlbnQ6IHVua25vd247XG4gIH0pOiBQcm9taXNlPHsgZXJyb3I6IHsgbWVzc2FnZT86IHN0cmluZyB9IHwgbnVsbCB9PjtcbiAgLyoqIFJlcGxhY2UgdGhpcyB2ZXJzaW9uJ3MgY2Vuc3VzICsgaXRlbS1hdHRyaWJ1dGlvbiByb3dzIChTNykuIElkZW1wb3RlbnQ6XG4gICAqIHRoZSBjZW5zdXMgaXMgYSBwdXJlIGZ1bmN0aW9uIG9mIGFuIGltbXV0YWJsZSB2ZXJzaW9uLCBzbyBhIHJlLXJ1biB3cml0ZXNcbiAgICogaWRlbnRpY2FsIHJvd3MuICovXG4gIHdyaXRlQ2Vuc3VzKFxuICAgIHZlcnNpb25JZDogc3RyaW5nLFxuICAgIGNlbnN1czogVmVyc2lvbkNlbnN1cyxcbiAgKTogUHJvbWlzZTx7IGVycm9yOiB7IG1lc3NhZ2U/OiBzdHJpbmcgfSB8IG51bGwgfT47XG4gIC8qKiBEZWxldGUgdGhpcyB2ZXJzaW9uJ3MgY2FjaGUgcm93cyB3cml0dGVuIHVuZGVyIGFueSBPVEhFUiBzYW5pdGl6ZXIgcmV2IFx1MjAxNFxuICAgKiB0aGUgZXhhY3QgaGFsZiBvZiB0aGUgUjYoYSkgR0MuIE9ubHkgdGhpcyBjb2RlIGtub3dzIHRoZSBjdXJyZW50IHJldiwgc29cbiAgICogb25seSB0aGlzIGNvZGUgY2FuIGJlIHByZWNpc2UgYWJvdXQgaXQ7IHRoZSBzY2hlZHVsZWQgam9iIHN3ZWVwcyB0aGUgdGFpbFxuICAgKiBvZiB2ZXJzaW9ucyB0aGF0IGFyZSBuZXZlciByZWFkIGFnYWluLiAqL1xuICBkZWxldGVTdGFsZUNhY2hlKFxuICAgIHZlcnNpb25JZDogc3RyaW5nLFxuICAgIGtlZXBSZXY6IHN0cmluZyxcbiAgKTogUHJvbWlzZTx7IGVycm9yOiB7IG1lc3NhZ2U/OiBzdHJpbmcgfSB8IG51bGwgfT47XG59XG5cbi8qKiBUaGUgX3NoYXJlZC9jb3JzLnRzIGhlbHBlciBzdXJmYWNlIChlbnYtcmVhZGluZywgc28gaXQgc3RheXMgRGVuby1zaWRlKS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29yc0tpdCB7XG4gIGNvcnNIZWFkZXJzKHJlcTogUmVxdWVzdCk6IEhlYWRlcnNJbml0O1xuICBoYW5kbGVQcmVmbGlnaHQocmVxOiBSZXF1ZXN0KTogUmVzcG9uc2UgfCBudWxsO1xuICBqc29uUmVzcG9uc2UocmVxOiBSZXF1ZXN0LCBib2R5OiB1bmtub3duLCBpbml0PzogUmVzcG9uc2VJbml0KTogUmVzcG9uc2U7XG4gIGVycm9yUmVzcG9uc2UoXG4gICAgcmVxOiBSZXF1ZXN0LFxuICAgIHN0YXR1czogbnVtYmVyLFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBkZXRhaWxzPzogdW5rbm93bixcbiAgKTogUmVzcG9uc2U7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2V0QWN0aXZpdHlIYW5kbGVyRGVwcyB7XG4gIGRiOiBHZXRBY3Rpdml0eURiO1xuICBjb3JzOiBDb3JzS2l0O1xuICAvKiogSW5qZWN0YWJsZSBjbG9jayBmb3IgdGhlIHJhdGUgbGltaXRlciAodGVzdHMpLiBEZWZhdWx0cyB0byBEYXRlLm5vdy4gKi9cbiAgbm93PzogKCkgPT4gbnVtYmVyO1xufVxuXG4vLyAtLS0tIE1ldGEtYnJhbmNoIHJhdGUgbGltaXRpbmcgKHBlciBpc29sYXRlIFx1MjAxNCBNRUFTVVJFRCBBUyBORUFSTFkgSU5FUlQpIC0tLS1cbi8vIEEgc2xpZGluZyBvbmUtbWludXRlIHdpbmRvdyBwZXIgY2xpZW50IElQLlxuLy9cbi8vIFJFQUQgVEhJUyBCRUZPUkUgQ0hBTkdJTkcgVEhFIFRIUkVTSE9MRCBPUiBHSVZJTkcgVEhJUyBTSEFSRUQgU1RBVEUuXG4vL1xuLy8gKiogQSBDTEFTU1JPT00gSVMgT05FIElQLiAqKiBFdmVyeSBzdHVkZW50IGluIGEgc2Nob29sIHNpdHMgYmVoaW5kIHRoZSBzYW1lXG4vLyBOQVQsIHNvIFwib3BlbiB0aGlzIGxpbmsgbm93XCIgcHJvZHVjZXMgb25lIG1ldGEgcmVxdWVzdCBwZXIgc3R1ZGVudCBcdTIwMTQgMzArXG4vLyB3aXRoaW4gc2Vjb25kcywgaHVuZHJlZHMgcGVyIG1pbnV0ZSBhdCBhIGJlbGwgY2hhbmdlIGFjcm9zcyBhIGNhbXB1cyBcdTIwMTQgYWxsXG4vLyBmcm9tIGEgU0lOR0xFIGFkZHJlc3MuIEEgcGVyLXBlcnNvbiB0aHJlc2hvbGQgaXMgdGhlcmVmb3JlIG9mZiBieSB+MiBvcmRlcnNcbi8vIG9mIG1hZ25pdHVkZSBhZ2FpbnN0IHRoZSByZWFsIHRvcG9sb2d5LCBhbmQgdGhpcyBlbmRwb2ludCBzZXJ2ZXMgdGhlIFBSRS1BVVRIXG4vLyBpbnRlcnN0aXRpYWw6IGEgNDI5IGhlcmUgaXMgdGhlIGZpcnN0IHNjcmVlbiBhIHN0dWRlbnQgZXZlciBzZWVzLCBiZWZvcmUgdGhleVxuLy8gY2FuIGV2ZW4gc2lnbiBpbi4gVGhlIGZhaWx1cmUgd291bGQgcHJlc2VudCBhcyBcInNvbWUgc3R1ZGVudHMgY2FuJ3Qgb3BlbiB0aGVcbi8vIGFjdGl2aXR5LCBvdGhlcnMgY2FuLCBhcHBhcmVudGx5IGF0IHJhbmRvbVwiIFx1MjAxNCBtaXNlcmFibGUgdG8gZGlhZ25vc2UgbWlkLWNsYXNzLlxuLy8gVGhlIGNlaWxpbmcgYmVsb3cgaXMgZGVsaWJlcmF0ZWx5IGdlbmVyb3VzIGZvciB0aGF0IHJlYXNvbi4gUkFJU0lORyBpdCBpc1xuLy8gc2FmZTsgTE9XRVJJTkcgaXQgdG93YXJkIGEgcGVyLXBlcnNvbiBudW1iZXIgaXMgdGhlIGJ1Zy5cbi8vXG4vLyBUaGlzIGNvbnN0cmFpbnQgaXMgbm90IHNwZWNpZmljIHRvIHRoaXMgZnVuY3Rpb246IHBlci1JUCBsaW1pdGluZyBpcyB0aGVcbi8vIHdyb25nIHByaW1pdGl2ZSBhbnl3aGVyZSBpbiB0aGlzIHByb2R1Y3QsIGJlY2F1c2Ugb3VyIHVzZXJzIGFycml2ZSB0aGlydHktYXQtXG4vLyBhLXRpbWUgZnJvbSBvbmUgYWRkcmVzcy4gU2VlIERFQ0lTSU9OUy5tZCBcdTIxOTIgXCJSZWFkIEFQSSBTMlwiIChyYXRlLWxpbWl0XG4vLyBmaW5kaW5nKSBiZWZvcmUgcmVhY2hpbmcgZm9yIElQLWJhc2VkIHRocm90dGxpbmcgZWxzZXdoZXJlLlxuLy9cbi8vIE1FQVNVUkVEIDIwMjYtMDctMjggb24gdGhlIGxpdmUgZGVwbG95bWVudDogOTUgc2VxdWVudGlhbCBhbm9ueW1vdXMgcmVxdWVzdHNcbi8vIGZyb20gT05FIElQIHByb2R1Y2VkIFpFUk8gNDI5cy4gU3VwYWJhc2UncyBFZGdlIFJ1bnRpbWUgcmVjeWNsZXMgaXNvbGF0ZXNcbi8vIGFnZ3Jlc3NpdmVseSwgc28gdGhpcyBwZXItaGFuZGxlciBNYXAgaXMgZW1wdHkgb24gbW9zdCByZXF1ZXN0cyBcdTIwMTQgdGhlXG4vLyBlZmZlY3RpdmUgbGltaXQgaXMgZmFyIGxvb3NlciB0aGFuIHRoZSBjb25zdGFudHMgaW1wbHksIGFuZCBvbiBhIGRpc3RyaWJ1dGVkXG4vLyBidXJzdCBpdCBpcyBubyBsaW1pdCBhdCBhbGwuIFNvIHRoaXMgaXMgb3Bwb3J0dW5pc3RpYyB0aHJvdHRsaW5nIG9mIGEgc2luZ2xlXG4vLyBob3QgaXNvbGF0ZSwgTk9UIGEgZ3VhcmFudGVlIFx1MjAxNCBkbyBub3QgZGVzY3JpYmUgaXQgYXMgb25lLlxuLy9cbi8vIEtlcHQgcmF0aGVyIHRoYW4gZGVsZXRlZCBiZWNhdXNlIGl0IGNvc3RzIG5vdGhpbmcgYW5kIGRvZXMgYmx1bnQgYSBydW5hd2F5XG4vLyBjbGllbnQuIFdoYXQgaXQgZ3VhcmRzIGlzIHRoZSB0aXRsZSArIHRlYWNoZXIgZGlzcGxheSBuYW1lIG9mIGEgUFVCTElTSEVEXG4vLyBhY3Rpdml0eSwgdG8gYSBjYWxsZXIgd2hvIGFscmVhZHkgaG9sZHMgaXRzIFVVSUQgXHUyMDE0IGRhdGEgZXZlcnkgcHVibGlzaGVkIHBhZ2Vcbi8vIHNob3dzIHB1YmxpY2x5IHRvZGF5LCB3aXRoIFVVSUQgZW51bWVyYXRpb24gaW5mZWFzaWJsZS5cbi8vXG4vLyBJZiBhIFJFQUwgbGltaXQgaXMgZXZlciBuZWVkZWQgKHRyaWdnZXI6IHRoaXMgcmVzcG9uc2Ugc3RhcnRzIHJldHVybmluZ1xuLy8gYW55dGhpbmcgcmljaGVyIHRoYW4gdGhvc2UgdHdvIGZpZWxkcyksIGl0IG11c3QgbW92ZSB0byBzaGFyZWQgc3RhdGUgXHUyMDE0IGFcbi8vIHNtYWxsIERCIGNvdW50ZXIgdGFibGUgXHUyMDE0IGJlY2F1c2Ugbm8gaW4tbWVtb3J5IHNjaGVtZSBjYW4gd29yayBoZXJlLiBQb3J0IHRoZVxuLy8gU0NIT09MLVNBRkUgY2VpbGluZyB3aXRoIGl0OyBkbyBub3QgcmVpbnRyb2R1Y2UgYSBwZXItcGVyc29uIG51bWJlci5cbi8vXG4vLyBUaGUgYXV0aGVkIGJyYW5jaGVzIGFyZSBOT1QgcmF0ZS1saW1pdGVkIGhlcmU7IHRoZSBKV1QgaXMgdGhlaXIgZ2F0ZS5cblxuLyoqIEpvaW4tY29kZSByZXF1ZXN0IHNoYXBpbmc6IDAwMTQgbWludHMgNiBjaGFycyBmcm9tIGEgMzEtY2hhciBhbHBoYWJldCwgYnV0XG4gKiB0aGUgZ2F0ZSBoZXJlIGlzIGRlbGliZXJhdGVseSBsb29zZXIgKGFueSA0XHUyMDEzMTIgYWxwaGFudW1lcmljcykgXHUyMDE0IHRoZSBSUEMnc1xuICogbm9ybWFsaXplZCBsb29rdXAgaXMgdGhlIHJlYWwganVkZ2U7IHRoaXMgb25seSBib3VuY2VzIGdhcmJhZ2UgYmVmb3JlIGl0XG4gKiBjb3N0cyBhIHJvdW5kIHRyaXAuIFRpZ2h0ZW5pbmcgdGhpcyB0byB0b2RheSdzIG1pbnQgZm9ybWF0IHdvdWxkIHR1cm4gYVxuICogZnV0dXJlIGNvZGUtZm9ybWF0IGNoYW5nZSBpbnRvIGEgc2lsZW50IDQwMC4gKi9cbmV4cG9ydCBjb25zdCBKT0lOX0NPREVfUkUgPSAvXltBLVphLXowLTldezQsMTJ9JC87XG5cbmV4cG9ydCBjb25zdCBNRVRBX1dJTkRPV19NUyA9IDYwXzAwMDtcbi8qKiBTY2hvb2wtc2FmZSBjZWlsaW5nOiBzaXplZCBmb3IgYSB3aG9sZSBjYW1wdXMgYmVoaW5kIG9uZSBOQVQgYXQgYSBiZWxsXG4gKiBjaGFuZ2UsIG5vdCBmb3Igb25lIHBlcnNvbi4gU2VlIHRoZSB0b3BvbG9neSBub3RlIGFib3ZlLiAqL1xuZXhwb3J0IGNvbnN0IE1FVEFfTUFYX1BFUl9XSU5ET1cgPSA2MDA7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNZXRhUmF0ZUxpbWl0ZXIoXG4gIG5vdzogKCkgPT4gbnVtYmVyID0gRGF0ZS5ub3csXG4pOiAoaXA6IHN0cmluZykgPT4gYm9vbGVhbiB7XG4gIGNvbnN0IG1ldGFIaXRzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcltdPigpO1xuICByZXR1cm4gZnVuY3Rpb24gbWV0YVJhdGVMaW1pdGVkKGlwOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB0ID0gbm93KCk7XG4gICAgY29uc3QgaGl0cyA9IChtZXRhSGl0cy5nZXQoaXApID8/IFtdKS5maWx0ZXIoXG4gICAgICAoaGl0KSA9PiB0IC0gaGl0IDwgTUVUQV9XSU5ET1dfTVMsXG4gICAgKTtcbiAgICBpZiAoaGl0cy5sZW5ndGggPj0gTUVUQV9NQVhfUEVSX1dJTkRPVykge1xuICAgICAgbWV0YUhpdHMuc2V0KGlwLCBoaXRzKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBoaXRzLnB1c2godCk7XG4gICAgbWV0YUhpdHMuc2V0KGlwLCBoaXRzKTtcbiAgICAvLyBCb3VuZCB0aGUgbWFwIHNvIGEgc2NhbiBhY3Jvc3MgbWFueSBJUHMgY2FuJ3QgZ3JvdyBtZW1vcnkgdW5ib3VuZGVkLlxuICAgIGlmIChtZXRhSGl0cy5zaXplID4gMTBfMDAwKSBtZXRhSGl0cy5jbGVhcigpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbn1cblxuLy8gand0U3ViIGlzIGltcG9ydGVkIChzZXJ2ZXIvand0LnRzLCBHMikgXHUyMDE0IGl0IHdhcyBwYXN0ZWQgYnl0ZS1pZGVudGljYWxseVxuLy8gaW50byBib3RoIGhhbmRsZXJzOyBzZWUgdGhhdCBsZWFmIGZvciB0aGUgbm8tdmVyaWZpY2F0aW9uIHJlYXNvbmluZy5cblxuLy8gLS0tLSBUaGUgaGFuZGxlciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUdldEFjdGl2aXR5SGFuZGxlcihcbiAgZGVwczogR2V0QWN0aXZpdHlIYW5kbGVyRGVwcyxcbik6IChyZXE6IFJlcXVlc3QpID0+IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgY29uc3QgeyBkYiwgY29ycyB9ID0gZGVwcztcbiAgY29uc3QgbWV0YVJhdGVMaW1pdGVkID0gY3JlYXRlTWV0YVJhdGVMaW1pdGVyKGRlcHMubm93ID8/IERhdGUubm93KTtcblxuICByZXR1cm4gYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0QWN0aXZpdHkocmVxOiBSZXF1ZXN0KTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIGNvbnN0IHByZWZsaWdodCA9IGNvcnMuaGFuZGxlUHJlZmxpZ2h0KHJlcSk7XG4gICAgaWYgKHByZWZsaWdodCkgcmV0dXJuIHByZWZsaWdodDtcbiAgICBpZiAocmVxLm1ldGhvZCAhPT0gJ0dFVCcpIHtcbiAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDUsICdNZXRob2Qgbm90IGFsbG93ZWQnKTtcbiAgICB9XG5cbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHJlcS51cmwpO1xuICAgIGNvbnN0IGFjdGl2aXR5SWQgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgnYWN0aXZpdHlfaWQnKSA/PyAnJztcbiAgICBjb25zdCB2ZXJzaW9uSWQgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgndmVyc2lvbl9pZCcpO1xuICAgIGNvbnN0IG1ldGFPbmx5ID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ21ldGEnKSA9PT0gJzEnO1xuICAgIGNvbnN0IGpvaW5Db2RlID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ2pvaW5fY29kZScpO1xuXG4gICAgLy8gLS0tLSAxYi4gQ0xBU1MgTUVUQSAoYW5vbnltb3VzKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBIYW5kbGVkIGJlZm9yZSB0aGUgYWN0aXZpdHlfaWQgc2hhcGUgY2hlY2s6IHRoaXMgYnJhbmNoIGhhcyBub1xuICAgIC8vIGFjdGl2aXR5LiBqb2luX2NvZGUgZXhpc3RzIE9OTFkgYXMgYSBtZXRhIGxvb2t1cCBcdTIwMTQgYW55IG90aGVyIHVzZSBvZiB0aGVcbiAgICAvLyBwYXJhbSBpcyBhIG1hbGZvcm1lZCByZXF1ZXN0LCBub3QgYSBtb2RlLlxuICAgIGlmIChqb2luQ29kZSAhPT0gbnVsbCkge1xuICAgICAgaWYgKCFtZXRhT25seSkge1xuICAgICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDAwLCAnam9pbl9jb2RlIHJlcXVpcmVzIG1ldGE9MScpO1xuICAgICAgfVxuICAgICAgY29uc3QgY29kZSA9IGpvaW5Db2RlLnRyaW0oKTtcbiAgICAgIGlmICghSk9JTl9DT0RFX1JFLnRlc3QoY29kZSkpIHtcbiAgICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQwMCwgJ2pvaW5fY29kZSBtdXN0IGJlIGEgY2xhc3MgY29kZScpO1xuICAgICAgfVxuICAgICAgY29uc3QgaXAgPVxuICAgICAgICByZXEuaGVhZGVycy5nZXQoJ3gtZm9yd2FyZGVkLWZvcicpPy5zcGxpdCgnLCcpWzBdPy50cmltKCkgPz8gJ3Vua25vd24nO1xuICAgICAgLy8gVGhlIFNBTUUgbGltaXRlciBpbnN0YW5jZSBhcyB0aGUgYWN0aXZpdHkgbWV0YSBicmFuY2ggXHUyMDE0IG9uZSBhbm9ueW1vdXNcbiAgICAgIC8vIHdpbmRvdyBwZXIgSVAgYWNyb3NzIGJvdGggbG9va3VwcyAoUDMncyBsaXZlbmVzcyByb3cgZmlyZXMgaXQgaGVyZSkuXG4gICAgICBpZiAobWV0YVJhdGVMaW1pdGVkKGlwKSkge1xuICAgICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDI5LCAnVG9vIG1hbnkgcmVxdWVzdHMnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IGRiLmNsYXNzTWV0YShjb2RlKTtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBjbGFzcyBtZXRhIFJQQyBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA1MDAsICdMb29rdXAgZmFpbGVkJyk7XG4gICAgICB9XG4gICAgICAvLyBObyByb3cgPSB1bmtub3duIG9yIGRlbGV0ZWQgY2xhc3MgXHUyMDE0IHRoZSBERUZJTklUSVZFIG5lZ2F0aXZlIERSLTYnc1xuICAgICAgLy8gcHJlLU9BdXRoIHdhcm5pbmcga2V5cyBvbiAobmV0d29yayBmYWlsdXJlIGFib3ZlIGlzIHRoZSBzaWxlbnQgb25lKS5cbiAgICAgIGlmICghZGF0YSkgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQwNCwgJ05vdCBhdmFpbGFibGUnKTtcbiAgICAgIHJldHVybiBjb3JzLmpzb25SZXNwb25zZShcbiAgICAgICAgcmVxLFxuICAgICAgICAvLyBUaGUgd2lyZS1sZWFrIGNvbnRyYWN0OiB0aGUgY2xhc3MgTkFNRSBhbmQgbm90aGluZyBlbHNlLlxuICAgICAgICB7IGFwaV92ZXJzaW9uOiBBUElfVkVSU0lPTiwgY2xhc3NfbmFtZTogZGF0YS5uYW1lIH0sXG4gICAgICAgIHsgaGVhZGVyczogeyAnQ2FjaGUtQ29udHJvbCc6ICduby1jYWNoZScgfSB9LFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoIVVVSURfUkUudGVzdChhY3Rpdml0eUlkKSkge1xuICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQwMCwgJ2FjdGl2aXR5X2lkIG11c3QgYmUgYSBVVUlEJyk7XG4gICAgfVxuXG4gICAgLy8gLS0tLSAxLiBNRVRBIChhbm9ueW1vdXMpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpZiAobWV0YU9ubHkpIHtcbiAgICAgIGNvbnN0IGlwID1cbiAgICAgICAgcmVxLmhlYWRlcnMuZ2V0KCd4LWZvcndhcmRlZC1mb3InKT8uc3BsaXQoJywnKVswXT8udHJpbSgpID8/ICd1bmtub3duJztcbiAgICAgIGlmIChtZXRhUmF0ZUxpbWl0ZWQoaXApKSB7XG4gICAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MjksICdUb28gbWFueSByZXF1ZXN0cycpO1xuICAgICAgfVxuICAgICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgZGIucHVibGljTWV0YShhY3Rpdml0eUlkKTtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBtZXRhIFJQQyBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA1MDAsICdMb29rdXAgZmFpbGVkJyk7XG4gICAgICB9XG4gICAgICBpZiAoIWRhdGEpIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDQsICdOb3QgYXZhaWxhYmxlJyk7XG4gICAgICByZXR1cm4gY29ycy5qc29uUmVzcG9uc2UoXG4gICAgICAgIHJlcSxcbiAgICAgICAge1xuICAgICAgICAgIGFwaV92ZXJzaW9uOiBBUElfVkVSU0lPTixcbiAgICAgICAgICB0aXRsZTogZGF0YS50aXRsZSxcbiAgICAgICAgICB0ZWFjaGVyX25hbWU6IGRhdGEudGVhY2hlcl9uYW1lLFxuICAgICAgICB9LFxuICAgICAgICB7IGhlYWRlcnM6IHsgJ0NhY2hlLUNvbnRyb2wnOiAnbm8tY2FjaGUnIH0gfSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gLS0tLSBBdXRoIChyZXNvbHZlICsgY29udGVudCkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgY29uc3QgYXV0aEhlYWRlciA9IHJlcS5oZWFkZXJzLmdldCgnQXV0aG9yaXphdGlvbicpO1xuICAgIGlmICghYXV0aEhlYWRlcikge1xuICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQwMSwgJ01pc3NpbmcgQXV0aG9yaXphdGlvbiBoZWFkZXInKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGRhdGE6IGN1cnJlbnQsIGVycm9yOiBycGNFcnJvciB9ID0gYXdhaXQgZGIucHVibGlzaGVkQWN0aXZpdHkoXG4gICAgICBhdXRoSGVhZGVyLFxuICAgICAgYWN0aXZpdHlJZCxcbiAgICApO1xuICAgIGlmIChycGNFcnJvcikge1xuICAgICAgY29uc3QgbXNnID0gcnBjRXJyb3IubWVzc2FnZSA/PyAnJztcbiAgICAgIC8vIFBvc3RnUkVTVCBzdXJmYWNlcyBhIGJhZC9leHBpcmVkIEpXVCBhcyBhIDQwMS1jbGFzcyBlcnJvcjsgdGhlIFJQQ1xuICAgICAgLy8gcmFpc2VzICdOb3QgYXZhaWxhYmxlJyBmb3IgbWlzc2luZy91bnB1Ymxpc2hlZC9kZWxldGVkIGFjdGl2aXRpZXMuXG4gICAgICBjb25zdCBzdGF0dXMgPSBtc2cuaW5jbHVkZXMoJ05vdCBhdmFpbGFibGUnKVxuICAgICAgICA/IDQwNFxuICAgICAgICA6IC9KV1R8dG9rZW58YXV0aC9pLnRlc3QobXNnKVxuICAgICAgICAgID8gNDAxXG4gICAgICAgICAgOiA1MDA7XG4gICAgICBpZiAoc3RhdHVzID09PSA1MDApIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIFJQQyBlcnJvcjonLCBycGNFcnJvcik7XG4gICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKFxuICAgICAgICByZXEsXG4gICAgICAgIHN0YXR1cyxcbiAgICAgICAgc3RhdHVzID09PSA0MDQgPyAnTm90IGF2YWlsYWJsZScgOiBtc2csXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoIWN1cnJlbnQpIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDQsICdOb3QgYXZhaWxhYmxlJyk7XG4gICAgY29uc3Qgcm93ID0gY3VycmVudDtcblxuICAgIC8vIC0tLS0gMi4gUkVTT0xWRSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGlmICghdmVyc2lvbklkKSB7XG4gICAgICByZXR1cm4gY29ycy5qc29uUmVzcG9uc2UoXG4gICAgICAgIHJlcSxcbiAgICAgICAge1xuICAgICAgICAgIGFwaV92ZXJzaW9uOiBBUElfVkVSU0lPTixcbiAgICAgICAgICBhY3Rpdml0eV9pZDogYWN0aXZpdHlJZCxcbiAgICAgICAgICB2ZXJzaW9uX2lkOiByb3cudmVyc2lvbl9pZCxcbiAgICAgICAgICB2ZXJzaW9uX251bTogcm93LnZlcnNpb25fbnVtLFxuICAgICAgICAgIHRpdGxlOiByb3cudGl0bGUsXG4gICAgICAgIH0sXG4gICAgICAgIHsgaGVhZGVyczogeyAnQ2FjaGUtQ29udHJvbCc6ICduby1jYWNoZScgfSB9LFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyAtLS0tIDMuIENPTlRFTlQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpZiAoIVVVSURfUkUudGVzdCh2ZXJzaW9uSWQpKSB7XG4gICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDAwLCAndmVyc2lvbl9pZCBtdXN0IGJlIGEgVVVJRCcpO1xuICAgIH1cbiAgICBpZiAodmVyc2lvbklkICE9PSByb3cudmVyc2lvbl9pZCkge1xuICAgICAgLy8gUmVwdWJsaXNoZWQgc2luY2UgcmVzb2x2ZSBcdTIwMTQgdGhlIHZpZXdlciByZS1yZXNvbHZlcyBhbmQgcmVmZXRjaGVzLiA0MDRcbiAgICAgIC8vIChub3QgNDA5KSBzbyBubyBzdGFsZS1VUkwgcmVzcG9uc2UgaXMgZXZlciBjYWNoZWFibGUgYXMgY29udGVudC5cbiAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDQsICdOb3QgdGhlIGN1cnJlbnQgdmVyc2lvbicsIHtcbiAgICAgICAgY29kZTogJ3N0YWxlX3ZlcnNpb24nLFxuICAgICAgICBjdXJyZW50X3ZlcnNpb25faWQ6IHJvdy52ZXJzaW9uX2lkLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRHVyYWJsZSBwZXItdmVyc2lvbiBjYWNoZSAoYWN0aXZpdHlfdmVyc2lvbl9yZWFkcywgc2VydmljZS1yb2xlIG9ubHkpLlxuICAgIGxldCBzYW5pdGl6ZWQ6IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCB7IGRhdGE6IGNhY2hlZCwgZXJyb3I6IGNhY2hlRXJyIH0gPSBhd2FpdCBkYi5yZWFkQ2FjaGUoXG4gICAgICB2ZXJzaW9uSWQsXG4gICAgICBTQU5JVElaRVJfUkVWLFxuICAgICk7XG4gICAgaWYgKGNhY2hlRXJyKSB7XG4gICAgICAvLyBDYWNoZSByZWFkIGZhaWx1cmUgaXMgbm9uLWZhdGFsIFx1MjAxNCBmYWxsIHRocm91Z2ggdG8gdGhlIHNvdXJjZSBvZiB0cnV0aC5cbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIGNhY2hlIHJlYWQgZmFpbGVkOicsIGNhY2hlRXJyKTtcbiAgICB9XG4gICAgaWYgKGNhY2hlZCkge1xuICAgICAgc2FuaXRpemVkID0gY2FjaGVkLmNvbnRlbnQgYXMgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudDtcbiAgICB9XG5cbiAgICBpZiAoIXNhbml0aXplZCkge1xuICAgICAgY29uc3QgeyBkYXRhOiB2ZXJzaW9uLCBlcnJvcjogdkVyciB9ID0gYXdhaXQgZGIucmVhZFZlcnNpb24odmVyc2lvbklkKTtcbiAgICAgIGlmICh2RXJyIHx8ICF2ZXJzaW9uKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIHZlcnNpb24gcmVhZCBmYWlsZWQ6JywgdkVycik7XG4gICAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA1MDAsICdWZXJzaW9uIHJlYWQgZmFpbGVkJyk7XG4gICAgICB9XG4gICAgICBsZXQgdXBncmFkZWQ7XG4gICAgICB0cnkge1xuICAgICAgICB1cGdyYWRlZCA9IHVwZ3JhZGVBY3Rpdml0eURvY3VtZW50KHZlcnNpb24uY29udGVudCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gVGhlIGV4cGxpY2l0IGZhaWx1cmUgc3RhdGUgdGhlIGZhaWx1cmUtbW9kZXMgdGFibGUgcHJvbWlzZXMgXHUyMDE0IGFcbiAgICAgICAgLy8gc2VydmVkIDUwMCB3aXRoIGEgcmVhc29uLCBuZXZlciBhIG1pcy1wYXJzZWQgZG9jdW1lbnQuXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIHVwZ3JhZGUgZmFpbGVkOicsIGVycik7XG4gICAgICAgIGNvbnN0IGRldGFpbCA9XG4gICAgICAgICAgZXJyIGluc3RhbmNlb2YgVXBncmFkZUVycm9yID8gZXJyLm1lc3NhZ2UgOiAnVXBncmFkZSBmYWlsZWQnO1xuICAgICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNTAwLCAnQWN0aXZpdHkgY29udGVudCBjYW5ub3QgYmUgc2VydmVkJywge1xuICAgICAgICAgIGNvZGU6ICd1cGdyYWRlX2ZhaWxlZCcsXG4gICAgICAgICAgZGV0YWlsLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHNhbml0aXplZCA9IHNhbml0aXplQWN0aXZpdHlEb2N1bWVudCh1cGdyYWRlZC5kb2MpO1xuXG4gICAgICAvLyAtLS0tIEFuYWx5dGljcyBzaWRlLWNoYW5uZWwgKFM3KSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gT1JERVIgSVMgTE9BRC1CRUFSSU5HOiBjZW5zdXMgRklSU1QsIGFuZCB0aGUgY2FjaGUgcm93IGlzIHdyaXR0ZW4gb25seVxuICAgICAgLy8gaWYgaXQgc3VjY2VlZGVkIChydWxpbmcgUzctOSkuXG4gICAgICAvL1xuICAgICAgLy8gVGhlIGNhY2hlIHJvdyBpcyB3aGF0IG1ha2VzIGV2ZXJ5IGxhdGVyIHJlYWQgYSBISVQgXHUyMDE0IGFuZCBhIEhJVCBkb2VzIG5vXG4gICAgICAvLyBhbmFseXRpY3Mgd29yayBhdCBhbGwuIFNvIHdyaXRpbmcgdGhlIGNhY2hlIHJvdyBhZnRlciBhIEZBSUxFRCBjZW5zdXNcbiAgICAgIC8vIHdvdWxkIHN0cmFuZCB0aGlzIHZlcnNpb24gd2l0aCBubyBjZW5zdXMgdW50aWwgdGhlIG5leHQgU0FOSVRJWkVSX1JFVlxuICAgICAgLy8gYnVtcCwgd2hpbGUgZXZlcnkgY2hlY2sgb24gaXQgYWdncmVnYXRlZCBhcyB1bmF0dHJpYnV0ZWQuIFNpbGVudCwgYW5kXG4gICAgICAvLyBwZXJtYW5lbnQuIFdpdGhob2xkaW5nIHRoZSBjYWNoZSByb3cgaW5zdGVhZCBtZWFucyB0aGUgbmV4dCByZWFkIGlzXG4gICAgICAvLyBhbm90aGVyIG1pc3MgdGhhdCByZXRyaWVzIGJvdGg6IHRoZSBmYWlsdXJlIHNlbGYtaGVhbHMsIGFuZCBpdHMgb25seVxuICAgICAgLy8gY29zdCBpcyByZWNvbXB1dGluZyBhIGRvY3VtZW50IHdlIGFscmVhZHkga25vdyBob3cgdG8gcmVjb21wdXRlLlxuICAgICAgLy9cbiAgICAgIC8vIFRoZSBjZW5zdXMgaXRzZWxmIGlzIHRvdGFsIChuZXZlciB0aHJvd3MgXHUyMDE0IHNlZSBVTktOT1dOX0NFTlNVU19LRVkpLCBzb1xuICAgICAgLy8gd2hhdCB0aGlzIG9yZGVyaW5nIGFjdHVhbGx5IGd1YXJkcyBhZ2FpbnN0IGlzIGEgdHJhbnNpZW50IERCIGZhaWx1cmUsXG4gICAgICAvLyB3aGljaCBpcyBleGFjdGx5IHRoZSBraW5kIHRoYXQgYSByZXRyeSBmaXhlcy5cbiAgICAgIGxldCBjZW5zdXNPayA9IHRydWU7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7IGVycm9yOiBjZW5zdXNFcnIgfSA9IGF3YWl0IGRiLndyaXRlQ2Vuc3VzKFxuICAgICAgICAgIHZlcnNpb25JZCxcbiAgICAgICAgICBjZW5zdXNPZkRvY3VtZW50KHVwZ3JhZGVkLmRvYyksXG4gICAgICAgICk7XG4gICAgICAgIGlmIChjZW5zdXNFcnIpIHtcbiAgICAgICAgICBjZW5zdXNPayA9IGZhbHNlO1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIGNlbnN1cyB3cml0ZSBmYWlsZWQ6JywgY2Vuc3VzRXJyKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNlbnN1c09rID0gZmFsc2U7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIGNlbnN1cyB0aHJldzonLCBlcnIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY2Vuc3VzT2spIHtcbiAgICAgICAgY29uc3QgeyBlcnJvcjogdXBzZXJ0RXJyIH0gPSBhd2FpdCBkYi51cHNlcnRDYWNoZSh7XG4gICAgICAgICAgdmVyc2lvbl9pZDogdmVyc2lvbklkLFxuICAgICAgICAgIHNhbml0aXplcl9yZXY6IFNBTklUSVpFUl9SRVYsXG4gICAgICAgICAgc2NoZW1hX3ZlcnNpb246IHVwZ3JhZGVkLmRvYy5zY2hlbWFWZXJzaW9uLFxuICAgICAgICAgIGNvbnRlbnQ6IHNhbml0aXplZCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh1cHNlcnRFcnIpIHtcbiAgICAgICAgICAvLyBOb24tZmF0YWw6IHRoZSByZXNwb25zZSBpcyBhbHJlYWR5IGNvbXB1dGVkOyB0aGUgbmV4dCByZXF1ZXN0XG4gICAgICAgICAgLy8gcmV0cmllcy5cbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBjYWNoZSB1cHNlcnQgZmFpbGVkOicsIHVwc2VydEVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVGhpcyB2ZXJzaW9uIGlzIG5vdyBjYWNoZWQgdW5kZXIgdGhlIENVUlJFTlQgcmV2LCBzbyBhbnkgcm93IGl0XG4gICAgICAgICAgLy8gaGFzIHVuZGVyIGFuIG9sZGVyIHJldiBpcyBkZWFkIHdlaWdodCBub3RoaW5nIHdpbGwgZXZlciByZWFkLlxuICAgICAgICAgIGNvbnN0IHsgZXJyb3I6IGdjRXJyIH0gPSBhd2FpdCBkYi5kZWxldGVTdGFsZUNhY2hlKFxuICAgICAgICAgICAgdmVyc2lvbklkLFxuICAgICAgICAgICAgU0FOSVRJWkVSX1JFVixcbiAgICAgICAgICApO1xuICAgICAgICAgIGlmIChnY0Vycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW2dldC1hY3Rpdml0eV0gc3RhbGUtY2FjaGUgR0MgZmFpbGVkOicsIGdjRXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB1c2VySWQgPSBqd3RTdWIoYXV0aEhlYWRlcikgPz8gJ2Fub255bW91cyc7XG4gICAgLy8gc2VydmVTZWVkLCBpbXBvcnRlZCAoRzEpOiB0aGUgZ3JhZGluZyBzaWRlIHJlY29tcHV0ZXMgdGhpcyBzdHVkZW50J3NcbiAgICAvLyBhcnJhbmdlbWVudCBmcm9tIHRoZSBTQU1FIHN5bWJvbCBcdTIwMTQgdHdvIHNwZWxsaW5ncyBhZ3JlZWluZyBieSBsdWNrIHdhc1xuICAgIC8vIHRoZSBzMiByZXRybydzIHNoYXJwZXN0IHNlYW0gZmluZGluZy5cbiAgICBjb25zdCBzZXJ2ZWQgPSBhcHBseVNlcnZlU2h1ZmZsZXMoc2FuaXRpemVkLCBzZXJ2ZVNlZWQodmVyc2lvbklkLCB1c2VySWQpKTtcblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoXG4gICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGFwaV92ZXJzaW9uOiBBUElfVkVSU0lPTixcbiAgICAgICAgYWN0aXZpdHlfaWQ6IGFjdGl2aXR5SWQsXG4gICAgICAgIHZlcnNpb246IHtcbiAgICAgICAgICBpZDogdmVyc2lvbklkLFxuICAgICAgICAgIG51bTogcm93LnZlcnNpb25fbnVtLFxuICAgICAgICAgIHNjaGVtYV92ZXJzaW9uOiBzZXJ2ZWQuc2NoZW1hVmVyc2lvbixcbiAgICAgICAgfSxcbiAgICAgICAgdGl0bGU6IHJvdy50aXRsZSxcbiAgICAgICAgYWN0aXZpdHk6IHNlcnZlZCxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBzdGF0dXM6IDIwMCxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIC4uLmNvcnMuY29yc0hlYWRlcnMocmVxKSxcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIC8vIFZlcnNpb24ta2V5ZWQgVVJMIFx1MjE5MiBpbW11dGFibGUuIHByaXZhdGU6IHN0dWRlbnQgY29udGVudCBuZXZlciBsYW5kc1xuICAgICAgICAgIC8vIGluIHNoYXJlZCBjYWNoZXMuIEEgcmVwdWJsaXNoIGNoYW5nZXMgdGhlIFVSTCB2aWEgcmVzb2x2ZSwgc28gdGhpc1xuICAgICAgICAgIC8vIG5ldmVyIG5lZWRzIHRvIGV4cGlyZS5cbiAgICAgICAgICAnQ2FjaGUtQ29udHJvbCc6ICdwcml2YXRlLCBtYXgtYWdlPTMxNTM2MDAwLCBpbW11dGFibGUnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICApO1xuICB9O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFB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QUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxPQUFPO0FBQUEsRUFDOUQ7QUFBQSxFQUNBLElBQUksU0FBUztBQUNULFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxNQUFNO0FBQUEsRUFDN0Q7QUFBQSxFQUNBLElBQUksV0FBVztBQUNYLFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxRQUFRO0FBQUEsRUFDL0Q7QUFBQSxFQUNBLElBQUksU0FBUztBQUNULFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxNQUFNO0FBQUEsRUFDN0Q7QUFBQSxFQUNBLElBQUksVUFBVTtBQUNWLFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxPQUFPO0FBQUEsRUFDOUQ7QUFBQSxFQUNBLElBQUksU0FBUztBQUNULFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxNQUFNO0FBQUEsRUFDN0Q7QUFBQSxFQUNBLElBQUksT0FBTztBQUNQLFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxJQUFJO0FBQUEsRUFDM0Q7QUFBQSxFQUNBLElBQUksU0FBUztBQUNULFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxNQUFNO0FBQUEsRUFDN0Q7QUFBQSxFQUNBLElBQUksV0FBVztBQUNYLFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxRQUFRO0FBQUEsRUFDL0Q7QUFBQSxFQUNBLElBQUksY0FBYztBQUVkLFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdB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QUFLLFVBQVU7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLFNBQVM7QUFBQSxVQUNQLElBQUk7QUFBQSxVQUNKLEtBQUssSUFBSTtBQUFBLFVBQ1QsZ0JBQWdCLE9BQU87QUFBQSxRQUN6QjtBQUFBLFFBQ0EsT0FBTyxJQUFJO0FBQUEsUUFDWCxVQUFVO0FBQUEsTUFDWixDQUFDO0FBQUEsTUFDRDtBQUFBLFFBQ0UsUUFBUTtBQUFBLFFBQ1IsU0FBUztBQUFBLFVBQ1AsR0FBRyxLQUFLLFlBQVksR0FBRztBQUFBLFVBQ3ZCLGdCQUFnQjtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBSWhCLGlCQUFpQjtBQUFBLFFBQ25CO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbInV0aWwiLCAib2JqZWN0VXRpbCIsICJlcnJvclV0aWwiLCAiZXJyb3JNYXAiLCAiY3R4IiwgInJlc3VsdCIsICJpc3N1ZXMiLCAiZWxlbWVudHMiLCAicHJvY2Vzc2VkIiwgInJlc3VsdCIsICJyIiwgIlpvZEZpcnN0UGFydHlUeXBlS2luZCIsICJ2aXNpdCJdCn0K
