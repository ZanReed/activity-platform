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
var CubicModel = external_exports.object({
  family: external_exports.literal("cubic"),
  a: external_exports.number(),
  b: external_exports.number(),
  c: external_exports.number(),
  d: external_exports.number(),
  aTolerance: external_exports.number().nonnegative().default(0.1),
  bTolerance: external_exports.number().nonnegative().default(0.1),
  cTolerance: external_exports.number().nonnegative().default(0.1),
  dTolerance: external_exports.number().nonnegative().default(0.1)
});
var QuarticModel = external_exports.object({
  family: external_exports.literal("quartic"),
  a: external_exports.number(),
  b: external_exports.number(),
  c: external_exports.number(),
  d: external_exports.number(),
  e: external_exports.number(),
  aTolerance: external_exports.number().nonnegative().default(0.1),
  bTolerance: external_exports.number().nonnegative().default(0.1),
  cTolerance: external_exports.number().nonnegative().default(0.1),
  dTolerance: external_exports.number().nonnegative().default(0.1),
  eTolerance: external_exports.number().nonnegative().default(0.1)
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
  CubicModel,
  QuarticModel,
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
var MisconceptionId = external_exports.string().min(1).max(120);
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
  // `misconceptionId` binds the anticipated mistake to a named misconception
  // (an opaque `mis.*` tag — the taxonomy lives in the author's catalogue
  // project, not here). The grader returns it on the check verdict, and the
  // stored verdicts row is what makes the aggregate signal queryable.
  mistakeFeedback: external_exports.array(external_exports.object({
    match: external_exports.string(),
    feedback: external_exports.array(InlineNode),
    misconceptionId: MisconceptionId.optional()
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
  // `misconceptionId` binds the entry to a named misconception (opaque
  // `mis.*` tag), same contract as BlankToken.mistakeFeedback.
  mistakeFeedback: external_exports.array(external_exports.object({
    match: external_exports.string(),
    feedback: external_exports.array(InlineNode),
    misconceptionId: MisconceptionId.optional()
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
  // Binds a distractor to a named misconception (opaque `mis.*` tag; the
  // taxonomy lives in the author's catalogue project). Returned on the check
  // verdict when the student selects this choice and it is wrong; the stored
  // verdicts row carries the aggregate signal. Meaningless on a correct
  // choice — the grader never emits it for one.
  misconceptionId: MisconceptionId.optional(),
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
      // misconceptionId is server-side metadata (a distractor→registry
      // binding); a pre-check client could otherwise read which wrong
      // answers were anticipated.
      strip: [
        "choices[].correct",
        "choices[].feedback",
        "choices[].misconceptionId",
        "solution"
      ]
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
  "cubic",
  "quartic"
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
          correct: c.correct === true,
          ...Array.isArray(c.feedback) ? { feedback: c.feedback } : {},
          ...typeof c.misconceptionId === "string" && c.misconceptionId ? { misconceptionId: c.misconceptionId } : {}
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvZXh0ZXJuYWwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvaGVscGVycy91dGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL1pvZEVycm9yLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2xvY2FsZXMvZW4uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvZXJyb3JzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2hlbHBlcnMvcGFyc2VVdGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2hlbHBlcnMvZXJyb3JVdGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL3R5cGVzLmpzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvc2l6aW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2ltYWdlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvZ3JhcGgtcHJpbWl0aXZlcy50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9ncmFwaC1maWd1cmUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9pbmxpbmUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvcGFyYWdyYXBoLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2hlYWRpbmcudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9sYWJlbC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9tYXRoLWJsb2NrLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2NhbGxvdXQudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvcHJvYmxlbS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9maWxsLWluLWJsYW5rLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2xpc3QudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvaW50ZXJhY3RpdmUtZ3JhcGgudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvbXVsdGlwbGUtY2hvaWNlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL21hdGNoaW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL29yZGVyaW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL251bWJlci1saW5lLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2RhdGEtcGxvdC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9sZWFybmluZy1vYmplY3RpdmVzLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL3dvcmtlZC1leGFtcGxlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2ZhZGVkLXdvcmtlZC1leGFtcGxlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL3NlbGYtZXhwbGFuYXRpb24udHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvZnJlZS1yZXNwb25zZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy90YWJsZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9pbmRleC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2xheW91dC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2RvY3VtZW50LnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvdXBncmFkZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3JlZ2lzdHJ5L3JlZ2lzdHJ5LnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2FuaXRpemUvcHJvbXB0Q2FycmllcnMudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9zYW5pdGl6ZS9zYW5pdGl6ZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3Nhbml0aXplL3NodWZmbGUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9jb250YWluZXIvYmxvY2tJbmRleC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3NlcnZlci9ncmFkaW5nL3dhbGsudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9jZW5zdXMvY2Vuc3VzLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2FuaXRpemUvc2VydmVTZWVkLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2VydmVyL2p3dC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3NlcnZlci91dWlkLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2VydmVyL2dldC1hY3Rpdml0eS1oYW5kbGVyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgKiBmcm9tIFwiLi9lcnJvcnMuanNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2hlbHBlcnMvcGFyc2VVdGlsLmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9oZWxwZXJzL3R5cGVBbGlhc2VzLmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9oZWxwZXJzL3V0aWwuanNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3R5cGVzLmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9ab2RFcnJvci5qc1wiO1xuIiwgImV4cG9ydCB2YXIgdXRpbDtcbihmdW5jdGlvbiAodXRpbCkge1xuICAgIHV0aWwuYXNzZXJ0RXF1YWwgPSAoXykgPT4geyB9O1xuICAgIGZ1bmN0aW9uIGFzc2VydElzKF9hcmcpIHsgfVxuICAgIHV0aWwuYXNzZXJ0SXMgPSBhc3NlcnRJcztcbiAgICBmdW5jdGlvbiBhc3NlcnROZXZlcihfeCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB9XG4gICAgdXRpbC5hc3NlcnROZXZlciA9IGFzc2VydE5ldmVyO1xuICAgIHV0aWwuYXJyYXlUb0VudW0gPSAoaXRlbXMpID0+IHtcbiAgICAgICAgY29uc3Qgb2JqID0ge307XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xuICAgICAgICAgICAgb2JqW2l0ZW1dID0gaXRlbTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH07XG4gICAgdXRpbC5nZXRWYWxpZEVudW1WYWx1ZXMgPSAob2JqKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbGlkS2V5cyA9IHV0aWwub2JqZWN0S2V5cyhvYmopLmZpbHRlcigoaykgPT4gdHlwZW9mIG9ialtvYmpba11dICE9PSBcIm51bWJlclwiKTtcbiAgICAgICAgY29uc3QgZmlsdGVyZWQgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIHZhbGlkS2V5cykge1xuICAgICAgICAgICAgZmlsdGVyZWRba10gPSBvYmpba107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHV0aWwub2JqZWN0VmFsdWVzKGZpbHRlcmVkKTtcbiAgICB9O1xuICAgIHV0aWwub2JqZWN0VmFsdWVzID0gKG9iaikgPT4ge1xuICAgICAgICByZXR1cm4gdXRpbC5vYmplY3RLZXlzKG9iaikubWFwKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqW2VdO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHV0aWwub2JqZWN0S2V5cyA9IHR5cGVvZiBPYmplY3Qua2V5cyA9PT0gXCJmdW5jdGlvblwiIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFuL2JhblxuICAgICAgICA/IChvYmopID0+IE9iamVjdC5rZXlzKG9iaikgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYW4vYmFuXG4gICAgICAgIDogKG9iamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qga2V5cyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgICAgIH07XG4gICAgdXRpbC5maW5kID0gKGFyciwgY2hlY2tlcikgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgYXJyKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2tlcihpdGVtKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG4gICAgdXRpbC5pc0ludGVnZXIgPSB0eXBlb2YgTnVtYmVyLmlzSW50ZWdlciA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgID8gKHZhbCkgPT4gTnVtYmVyLmlzSW50ZWdlcih2YWwpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFuL2JhblxuICAgICAgICA6ICh2YWwpID0+IHR5cGVvZiB2YWwgPT09IFwibnVtYmVyXCIgJiYgTnVtYmVyLmlzRmluaXRlKHZhbCkgJiYgTWF0aC5mbG9vcih2YWwpID09PSB2YWw7XG4gICAgZnVuY3Rpb24gam9pblZhbHVlcyhhcnJheSwgc2VwYXJhdG9yID0gXCIgfCBcIikge1xuICAgICAgICByZXR1cm4gYXJyYXkubWFwKCh2YWwpID0+ICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiID8gYCcke3ZhbH0nYCA6IHZhbCkpLmpvaW4oc2VwYXJhdG9yKTtcbiAgICB9XG4gICAgdXRpbC5qb2luVmFsdWVzID0gam9pblZhbHVlcztcbiAgICB1dGlsLmpzb25TdHJpbmdpZnlSZXBsYWNlciA9IChfLCB2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJpZ2ludFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbn0pKHV0aWwgfHwgKHV0aWwgPSB7fSkpO1xuZXhwb3J0IHZhciBvYmplY3RVdGlsO1xuKGZ1bmN0aW9uIChvYmplY3RVdGlsKSB7XG4gICAgb2JqZWN0VXRpbC5tZXJnZVNoYXBlcyA9IChmaXJzdCwgc2Vjb25kKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5maXJzdCxcbiAgICAgICAgICAgIC4uLnNlY29uZCwgLy8gc2Vjb25kIG92ZXJ3cml0ZXMgZmlyc3RcbiAgICAgICAgfTtcbiAgICB9O1xufSkob2JqZWN0VXRpbCB8fCAob2JqZWN0VXRpbCA9IHt9KSk7XG5leHBvcnQgY29uc3QgWm9kUGFyc2VkVHlwZSA9IHV0aWwuYXJyYXlUb0VudW0oW1xuICAgIFwic3RyaW5nXCIsXG4gICAgXCJuYW5cIixcbiAgICBcIm51bWJlclwiLFxuICAgIFwiaW50ZWdlclwiLFxuICAgIFwiZmxvYXRcIixcbiAgICBcImJvb2xlYW5cIixcbiAgICBcImRhdGVcIixcbiAgICBcImJpZ2ludFwiLFxuICAgIFwic3ltYm9sXCIsXG4gICAgXCJmdW5jdGlvblwiLFxuICAgIFwidW5kZWZpbmVkXCIsXG4gICAgXCJudWxsXCIsXG4gICAgXCJhcnJheVwiLFxuICAgIFwib2JqZWN0XCIsXG4gICAgXCJ1bmtub3duXCIsXG4gICAgXCJwcm9taXNlXCIsXG4gICAgXCJ2b2lkXCIsXG4gICAgXCJuZXZlclwiLFxuICAgIFwibWFwXCIsXG4gICAgXCJzZXRcIixcbl0pO1xuZXhwb3J0IGNvbnN0IGdldFBhcnNlZFR5cGUgPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IHQgPSB0eXBlb2YgZGF0YTtcbiAgICBzd2l0Y2ggKHQpIHtcbiAgICAgICAgY2FzZSBcInVuZGVmaW5lZFwiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkO1xuICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5zdHJpbmc7XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIuaXNOYU4oZGF0YSkgPyBab2RQYXJzZWRUeXBlLm5hbiA6IFpvZFBhcnNlZFR5cGUubnVtYmVyO1xuICAgICAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuYm9vbGVhbjtcbiAgICAgICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5mdW5jdGlvbjtcbiAgICAgICAgY2FzZSBcImJpZ2ludFwiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuYmlnaW50O1xuICAgICAgICBjYXNlIFwic3ltYm9sXCI6XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5zeW1ib2w7XG4gICAgICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuYXJyYXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLm51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YS50aGVuICYmIHR5cGVvZiBkYXRhLnRoZW4gPT09IFwiZnVuY3Rpb25cIiAmJiBkYXRhLmNhdGNoICYmIHR5cGVvZiBkYXRhLmNhdGNoID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5wcm9taXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBNYXAgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLm1hcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgU2V0ICE9PSBcInVuZGVmaW5lZFwiICYmIGRhdGEgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5zZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIERhdGUgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5kYXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUub2JqZWN0O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUudW5rbm93bjtcbiAgICB9XG59O1xuIiwgImltcG9ydCB7IHV0aWwgfSBmcm9tIFwiLi9oZWxwZXJzL3V0aWwuanNcIjtcbmV4cG9ydCBjb25zdCBab2RJc3N1ZUNvZGUgPSB1dGlsLmFycmF5VG9FbnVtKFtcbiAgICBcImludmFsaWRfdHlwZVwiLFxuICAgIFwiaW52YWxpZF9saXRlcmFsXCIsXG4gICAgXCJjdXN0b21cIixcbiAgICBcImludmFsaWRfdW5pb25cIixcbiAgICBcImludmFsaWRfdW5pb25fZGlzY3JpbWluYXRvclwiLFxuICAgIFwiaW52YWxpZF9lbnVtX3ZhbHVlXCIsXG4gICAgXCJ1bnJlY29nbml6ZWRfa2V5c1wiLFxuICAgIFwiaW52YWxpZF9hcmd1bWVudHNcIixcbiAgICBcImludmFsaWRfcmV0dXJuX3R5cGVcIixcbiAgICBcImludmFsaWRfZGF0ZVwiLFxuICAgIFwiaW52YWxpZF9zdHJpbmdcIixcbiAgICBcInRvb19zbWFsbFwiLFxuICAgIFwidG9vX2JpZ1wiLFxuICAgIFwiaW52YWxpZF9pbnRlcnNlY3Rpb25fdHlwZXNcIixcbiAgICBcIm5vdF9tdWx0aXBsZV9vZlwiLFxuICAgIFwibm90X2Zpbml0ZVwiLFxuXSk7XG5leHBvcnQgY29uc3QgcXVvdGVsZXNzSnNvbiA9IChvYmopID0+IHtcbiAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkob2JqLCBudWxsLCAyKTtcbiAgICByZXR1cm4ganNvbi5yZXBsYWNlKC9cIihbXlwiXSspXCI6L2csIFwiJDE6XCIpO1xufTtcbmV4cG9ydCBjbGFzcyBab2RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBnZXQgZXJyb3JzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc3N1ZXM7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGlzc3Vlcykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmlzc3VlcyA9IFtdO1xuICAgICAgICB0aGlzLmFkZElzc3VlID0gKHN1YikgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc3N1ZXMgPSBbLi4udGhpcy5pc3N1ZXMsIHN1Yl07XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkSXNzdWVzID0gKHN1YnMgPSBbXSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc3N1ZXMgPSBbLi4udGhpcy5pc3N1ZXMsIC4uLnN1YnNdO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBhY3R1YWxQcm90byA9IG5ldy50YXJnZXQucHJvdG90eXBlO1xuICAgICAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgYmFuL2JhblxuICAgICAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIGFjdHVhbFByb3RvKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX19wcm90b19fID0gYWN0dWFsUHJvdG87XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5uYW1lID0gXCJab2RFcnJvclwiO1xuICAgICAgICB0aGlzLmlzc3VlcyA9IGlzc3VlcztcbiAgICB9XG4gICAgZm9ybWF0KF9tYXBwZXIpIHtcbiAgICAgICAgY29uc3QgbWFwcGVyID0gX21hcHBlciB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGlzc3VlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzc3VlLm1lc3NhZ2U7XG4gICAgICAgICAgICB9O1xuICAgICAgICBjb25zdCBmaWVsZEVycm9ycyA9IHsgX2Vycm9yczogW10gfTtcbiAgICAgICAgY29uc3QgcHJvY2Vzc0Vycm9yID0gKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGlzc3VlIG9mIGVycm9yLmlzc3Vlcykge1xuICAgICAgICAgICAgICAgIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfdW5pb25cIikge1xuICAgICAgICAgICAgICAgICAgICBpc3N1ZS51bmlvbkVycm9ycy5tYXAocHJvY2Vzc0Vycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUuY29kZSA9PT0gXCJpbnZhbGlkX3JldHVybl90eXBlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0Vycm9yKGlzc3VlLnJldHVyblR5cGVFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLmNvZGUgPT09IFwiaW52YWxpZF9hcmd1bWVudHNcIikge1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzRXJyb3IoaXNzdWUuYXJndW1lbnRzRXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS5wYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBmaWVsZEVycm9ycy5fZXJyb3JzLnB1c2gobWFwcGVyKGlzc3VlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VyciA9IGZpZWxkRXJyb3JzO1xuICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgaXNzdWUucGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gaXNzdWUucGF0aFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRlcm1pbmFsID0gaSA9PT0gaXNzdWUucGF0aC5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0ZXJtaW5hbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJbZWxdID0gY3VycltlbF0gfHwgeyBfZXJyb3JzOiBbXSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmICh0eXBlb2YgZWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGN1cnJbZWxdID0gY3VycltlbF0gfHwgeyBfZXJyb3JzOiBbXSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIH0gZWxzZSBpZiAodHlwZW9mIGVsID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBjb25zdCBlcnJvckFycmF5OiBhbnkgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGVycm9yQXJyYXkuX2Vycm9ycyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgY3VycltlbF0gPSBjdXJyW2VsXSB8fCBlcnJvckFycmF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJbZWxdID0gY3VycltlbF0gfHwgeyBfZXJyb3JzOiBbXSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJbZWxdLl9lcnJvcnMucHVzaChtYXBwZXIoaXNzdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnIgPSBjdXJyW2VsXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcHJvY2Vzc0Vycm9yKHRoaXMpO1xuICAgICAgICByZXR1cm4gZmllbGRFcnJvcnM7XG4gICAgfVxuICAgIHN0YXRpYyBhc3NlcnQodmFsdWUpIHtcbiAgICAgICAgaWYgKCEodmFsdWUgaW5zdGFuY2VvZiBab2RFcnJvcikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IGEgWm9kRXJyb3I6ICR7dmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lc3NhZ2U7XG4gICAgfVxuICAgIGdldCBtZXNzYWdlKCkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5pc3N1ZXMsIHV0aWwuanNvblN0cmluZ2lmeVJlcGxhY2VyLCAyKTtcbiAgICB9XG4gICAgZ2V0IGlzRW1wdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzc3Vlcy5sZW5ndGggPT09IDA7XG4gICAgfVxuICAgIGZsYXR0ZW4obWFwcGVyID0gKGlzc3VlKSA9PiBpc3N1ZS5tZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IGZpZWxkRXJyb3JzID0ge307XG4gICAgICAgIGNvbnN0IGZvcm1FcnJvcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBzdWIgb2YgdGhpcy5pc3N1ZXMpIHtcbiAgICAgICAgICAgIGlmIChzdWIucGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlyc3RFbCA9IHN1Yi5wYXRoWzBdO1xuICAgICAgICAgICAgICAgIGZpZWxkRXJyb3JzW2ZpcnN0RWxdID0gZmllbGRFcnJvcnNbZmlyc3RFbF0gfHwgW107XG4gICAgICAgICAgICAgICAgZmllbGRFcnJvcnNbZmlyc3RFbF0ucHVzaChtYXBwZXIoc3ViKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3JtRXJyb3JzLnB1c2gobWFwcGVyKHN1YikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IGZvcm1FcnJvcnMsIGZpZWxkRXJyb3JzIH07XG4gICAgfVxuICAgIGdldCBmb3JtRXJyb3JzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mbGF0dGVuKCk7XG4gICAgfVxufVxuWm9kRXJyb3IuY3JlYXRlID0gKGlzc3VlcykgPT4ge1xuICAgIGNvbnN0IGVycm9yID0gbmV3IFpvZEVycm9yKGlzc3Vlcyk7XG4gICAgcmV0dXJuIGVycm9yO1xufTtcbiIsICJpbXBvcnQgeyBab2RJc3N1ZUNvZGUgfSBmcm9tIFwiLi4vWm9kRXJyb3IuanNcIjtcbmltcG9ydCB7IHV0aWwsIFpvZFBhcnNlZFR5cGUgfSBmcm9tIFwiLi4vaGVscGVycy91dGlsLmpzXCI7XG5jb25zdCBlcnJvck1hcCA9IChpc3N1ZSwgX2N0eCkgPT4ge1xuICAgIGxldCBtZXNzYWdlO1xuICAgIHN3aXRjaCAoaXNzdWUuY29kZSkge1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGU6XG4gICAgICAgICAgICBpZiAoaXNzdWUucmVjZWl2ZWQgPT09IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiUmVxdWlyZWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgRXhwZWN0ZWQgJHtpc3N1ZS5leHBlY3RlZH0sIHJlY2VpdmVkICR7aXNzdWUucmVjZWl2ZWR9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX2xpdGVyYWw6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgbGl0ZXJhbCB2YWx1ZSwgZXhwZWN0ZWQgJHtKU09OLnN0cmluZ2lmeShpc3N1ZS5leHBlY3RlZCwgdXRpbC5qc29uU3RyaW5naWZ5UmVwbGFjZXIpfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUudW5yZWNvZ25pemVkX2tleXM6XG4gICAgICAgICAgICBtZXNzYWdlID0gYFVucmVjb2duaXplZCBrZXkocykgaW4gb2JqZWN0OiAke3V0aWwuam9pblZhbHVlcyhpc3N1ZS5rZXlzLCBcIiwgXCIpfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dGA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbl9kaXNjcmltaW5hdG9yOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGRpc2NyaW1pbmF0b3IgdmFsdWUuIEV4cGVjdGVkICR7dXRpbC5qb2luVmFsdWVzKGlzc3VlLm9wdGlvbnMpfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9lbnVtX3ZhbHVlOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGVudW0gdmFsdWUuIEV4cGVjdGVkICR7dXRpbC5qb2luVmFsdWVzKGlzc3VlLm9wdGlvbnMpfSwgcmVjZWl2ZWQgJyR7aXNzdWUucmVjZWl2ZWR9J2A7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9hcmd1bWVudHM6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgZnVuY3Rpb24gYXJndW1lbnRzYDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX3JldHVybl90eXBlOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGZ1bmN0aW9uIHJldHVybiB0eXBlYDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX2RhdGU6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgZGF0ZWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmc6XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlzc3VlLnZhbGlkYXRpb24gPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoXCJpbmNsdWRlc1wiIGluIGlzc3VlLnZhbGlkYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGlucHV0OiBtdXN0IGluY2x1ZGUgXCIke2lzc3VlLnZhbGlkYXRpb24uaW5jbHVkZXN9XCJgO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlzc3VlLnZhbGlkYXRpb24ucG9zaXRpb24gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgJHttZXNzYWdlfSBhdCBvbmUgb3IgbW9yZSBwb3NpdGlvbnMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvICR7aXNzdWUudmFsaWRhdGlvbi5wb3NpdGlvbn1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFwic3RhcnRzV2l0aFwiIGluIGlzc3VlLnZhbGlkYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGlucHV0OiBtdXN0IHN0YXJ0IHdpdGggXCIke2lzc3VlLnZhbGlkYXRpb24uc3RhcnRzV2l0aH1cImA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFwiZW5kc1dpdGhcIiBpbiBpc3N1ZS52YWxpZGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dDogbXVzdCBlbmQgd2l0aCBcIiR7aXNzdWUudmFsaWRhdGlvbi5lbmRzV2l0aH1cImA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGlzc3VlLnZhbGlkYXRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnZhbGlkYXRpb24gIT09IFwicmVnZXhcIikge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCAke2lzc3VlLnZhbGlkYXRpb259YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkludmFsaWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS50b29fc21hbGw6XG4gICAgICAgICAgICBpZiAoaXNzdWUudHlwZSA9PT0gXCJhcnJheVwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgQXJyYXkgbXVzdCBjb250YWluICR7aXNzdWUuZXhhY3QgPyBcImV4YWN0bHlcIiA6IGlzc3VlLmluY2x1c2l2ZSA/IGBhdCBsZWFzdGAgOiBgbW9yZSB0aGFuYH0gJHtpc3N1ZS5taW5pbXVtfSBlbGVtZW50KHMpYDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwic3RyaW5nXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBTdHJpbmcgbXVzdCBjb250YWluICR7aXNzdWUuZXhhY3QgPyBcImV4YWN0bHlcIiA6IGlzc3VlLmluY2x1c2l2ZSA/IGBhdCBsZWFzdGAgOiBgb3ZlcmB9ICR7aXNzdWUubWluaW11bX0gY2hhcmFjdGVyKHMpYDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwibnVtYmVyXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBOdW1iZXIgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHkgZXF1YWwgdG8gYCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gYCA6IGBncmVhdGVyIHRoYW4gYH0ke2lzc3VlLm1pbmltdW19YDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwiYmlnaW50XCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBOdW1iZXIgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHkgZXF1YWwgdG8gYCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gYCA6IGBncmVhdGVyIHRoYW4gYH0ke2lzc3VlLm1pbmltdW19YDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwiZGF0ZVwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgRGF0ZSBtdXN0IGJlICR7aXNzdWUuZXhhY3QgPyBgZXhhY3RseSBlcXVhbCB0byBgIDogaXNzdWUuaW5jbHVzaXZlID8gYGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBgIDogYGdyZWF0ZXIgdGhhbiBgfSR7bmV3IERhdGUoTnVtYmVyKGlzc3VlLm1pbmltdW0pKX1gO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkludmFsaWQgaW5wdXRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS50b29fYmlnOlxuICAgICAgICAgICAgaWYgKGlzc3VlLnR5cGUgPT09IFwiYXJyYXlcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEFycmF5IG11c3QgY29udGFpbiAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYGF0IG1vc3RgIDogYGxlc3MgdGhhbmB9ICR7aXNzdWUubWF4aW11bX0gZWxlbWVudChzKWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcInN0cmluZ1wiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgU3RyaW5nIG11c3QgY29udGFpbiAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYGF0IG1vc3RgIDogYHVuZGVyYH0gJHtpc3N1ZS5tYXhpbXVtfSBjaGFyYWN0ZXIocylgO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJudW1iZXJcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYE51bWJlciBtdXN0IGJlICR7aXNzdWUuZXhhY3QgPyBgZXhhY3RseWAgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgbGVzcyB0aGFuIG9yIGVxdWFsIHRvYCA6IGBsZXNzIHRoYW5gfSAke2lzc3VlLm1heGltdW19YDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwiYmlnaW50XCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBCaWdJbnQgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYGxlc3MgdGhhbiBvciBlcXVhbCB0b2AgOiBgbGVzcyB0aGFuYH0gJHtpc3N1ZS5tYXhpbXVtfWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcImRhdGVcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYERhdGUgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYHNtYWxsZXIgdGhhbiBvciBlcXVhbCB0b2AgOiBgc21hbGxlciB0aGFuYH0gJHtuZXcgRGF0ZShOdW1iZXIoaXNzdWUubWF4aW11bSkpfWA7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiSW52YWxpZCBpbnB1dFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmN1c3RvbTpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dGA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9pbnRlcnNlY3Rpb25fdHlwZXM6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludGVyc2VjdGlvbiByZXN1bHRzIGNvdWxkIG5vdCBiZSBtZXJnZWRgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLm5vdF9tdWx0aXBsZV9vZjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgTnVtYmVyIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAke2lzc3VlLm11bHRpcGxlT2Z9YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5ub3RfZmluaXRlOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiTnVtYmVyIG11c3QgYmUgZmluaXRlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBfY3R4LmRlZmF1bHRFcnJvcjtcbiAgICAgICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoaXNzdWUpO1xuICAgIH1cbiAgICByZXR1cm4geyBtZXNzYWdlIH07XG59O1xuZXhwb3J0IGRlZmF1bHQgZXJyb3JNYXA7XG4iLCAiaW1wb3J0IGRlZmF1bHRFcnJvck1hcCBmcm9tIFwiLi9sb2NhbGVzL2VuLmpzXCI7XG5sZXQgb3ZlcnJpZGVFcnJvck1hcCA9IGRlZmF1bHRFcnJvck1hcDtcbmV4cG9ydCB7IGRlZmF1bHRFcnJvck1hcCB9O1xuZXhwb3J0IGZ1bmN0aW9uIHNldEVycm9yTWFwKG1hcCkge1xuICAgIG92ZXJyaWRlRXJyb3JNYXAgPSBtYXA7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0RXJyb3JNYXAoKSB7XG4gICAgcmV0dXJuIG92ZXJyaWRlRXJyb3JNYXA7XG59XG4iLCAiaW1wb3J0IHsgZ2V0RXJyb3JNYXAgfSBmcm9tIFwiLi4vZXJyb3JzLmpzXCI7XG5pbXBvcnQgZGVmYXVsdEVycm9yTWFwIGZyb20gXCIuLi9sb2NhbGVzL2VuLmpzXCI7XG5leHBvcnQgY29uc3QgbWFrZUlzc3VlID0gKHBhcmFtcykgPT4ge1xuICAgIGNvbnN0IHsgZGF0YSwgcGF0aCwgZXJyb3JNYXBzLCBpc3N1ZURhdGEgfSA9IHBhcmFtcztcbiAgICBjb25zdCBmdWxsUGF0aCA9IFsuLi5wYXRoLCAuLi4oaXNzdWVEYXRhLnBhdGggfHwgW10pXTtcbiAgICBjb25zdCBmdWxsSXNzdWUgPSB7XG4gICAgICAgIC4uLmlzc3VlRGF0YSxcbiAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgfTtcbiAgICBpZiAoaXNzdWVEYXRhLm1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uaXNzdWVEYXRhLFxuICAgICAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgICAgICAgICBtZXNzYWdlOiBpc3N1ZURhdGEubWVzc2FnZSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgbGV0IGVycm9yTWVzc2FnZSA9IFwiXCI7XG4gICAgY29uc3QgbWFwcyA9IGVycm9yTWFwc1xuICAgICAgICAuZmlsdGVyKChtKSA9PiAhIW0pXG4gICAgICAgIC5zbGljZSgpXG4gICAgICAgIC5yZXZlcnNlKCk7XG4gICAgZm9yIChjb25zdCBtYXAgb2YgbWFwcykge1xuICAgICAgICBlcnJvck1lc3NhZ2UgPSBtYXAoZnVsbElzc3VlLCB7IGRhdGEsIGRlZmF1bHRFcnJvcjogZXJyb3JNZXNzYWdlIH0pLm1lc3NhZ2U7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIC4uLmlzc3VlRGF0YSxcbiAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgICAgIG1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICB9O1xufTtcbmV4cG9ydCBjb25zdCBFTVBUWV9QQVRIID0gW107XG5leHBvcnQgZnVuY3Rpb24gYWRkSXNzdWVUb0NvbnRleHQoY3R4LCBpc3N1ZURhdGEpIHtcbiAgICBjb25zdCBvdmVycmlkZU1hcCA9IGdldEVycm9yTWFwKCk7XG4gICAgY29uc3QgaXNzdWUgPSBtYWtlSXNzdWUoe1xuICAgICAgICBpc3N1ZURhdGE6IGlzc3VlRGF0YSxcbiAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICBlcnJvck1hcHM6IFtcbiAgICAgICAgICAgIGN0eC5jb21tb24uY29udGV4dHVhbEVycm9yTWFwLCAvLyBjb250ZXh0dWFsIGVycm9yIG1hcCBpcyBmaXJzdCBwcmlvcml0eVxuICAgICAgICAgICAgY3R4LnNjaGVtYUVycm9yTWFwLCAvLyB0aGVuIHNjaGVtYS1ib3VuZCBtYXAgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgICBvdmVycmlkZU1hcCwgLy8gdGhlbiBnbG9iYWwgb3ZlcnJpZGUgbWFwXG4gICAgICAgICAgICBvdmVycmlkZU1hcCA9PT0gZGVmYXVsdEVycm9yTWFwID8gdW5kZWZpbmVkIDogZGVmYXVsdEVycm9yTWFwLCAvLyB0aGVuIGdsb2JhbCBkZWZhdWx0IG1hcFxuICAgICAgICBdLmZpbHRlcigoeCkgPT4gISF4KSxcbiAgICB9KTtcbiAgICBjdHguY29tbW9uLmlzc3Vlcy5wdXNoKGlzc3VlKTtcbn1cbmV4cG9ydCBjbGFzcyBQYXJzZVN0YXR1cyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSBcInZhbGlkXCI7XG4gICAgfVxuICAgIGRpcnR5KCkge1xuICAgICAgICBpZiAodGhpcy52YWx1ZSA9PT0gXCJ2YWxpZFwiKVxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFwiZGlydHlcIjtcbiAgICB9XG4gICAgYWJvcnQoKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlICE9PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBcImFib3J0ZWRcIjtcbiAgICB9XG4gICAgc3RhdGljIG1lcmdlQXJyYXkoc3RhdHVzLCByZXN1bHRzKSB7XG4gICAgICAgIGNvbnN0IGFycmF5VmFsdWUgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBzIG9mIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmIChzLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICBpZiAocy5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIGFycmF5VmFsdWUucHVzaChzLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGFycmF5VmFsdWUgfTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIG1lcmdlT2JqZWN0QXN5bmMoc3RhdHVzLCBwYWlycykge1xuICAgICAgICBjb25zdCBzeW5jUGFpcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHBhaXJzKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBwYWlyLmtleTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgcGFpci52YWx1ZTtcbiAgICAgICAgICAgIHN5bmNQYWlycy5wdXNoKHtcbiAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VPYmplY3RTeW5jKHN0YXR1cywgc3luY1BhaXJzKTtcbiAgICB9XG4gICAgc3RhdGljIG1lcmdlT2JqZWN0U3luYyhzdGF0dXMsIHBhaXJzKSB7XG4gICAgICAgIGNvbnN0IGZpbmFsT2JqZWN0ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgY29uc3QgeyBrZXksIHZhbHVlIH0gPSBwYWlyO1xuICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgaWYgKHZhbHVlLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICBpZiAoa2V5LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgaWYgKHZhbHVlLnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgaWYgKGtleS52YWx1ZSAhPT0gXCJfX3Byb3RvX19cIiAmJiAodHlwZW9mIHZhbHVlLnZhbHVlICE9PSBcInVuZGVmaW5lZFwiIHx8IHBhaXIuYWx3YXlzU2V0KSkge1xuICAgICAgICAgICAgICAgIGZpbmFsT2JqZWN0W2tleS52YWx1ZV0gPSB2YWx1ZS52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGZpbmFsT2JqZWN0IH07XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IElOVkFMSUQgPSBPYmplY3QuZnJlZXplKHtcbiAgICBzdGF0dXM6IFwiYWJvcnRlZFwiLFxufSk7XG5leHBvcnQgY29uc3QgRElSVFkgPSAodmFsdWUpID0+ICh7IHN0YXR1czogXCJkaXJ0eVwiLCB2YWx1ZSB9KTtcbmV4cG9ydCBjb25zdCBPSyA9ICh2YWx1ZSkgPT4gKHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlIH0pO1xuZXhwb3J0IGNvbnN0IGlzQWJvcnRlZCA9ICh4KSA9PiB4LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCI7XG5leHBvcnQgY29uc3QgaXNEaXJ0eSA9ICh4KSA9PiB4LnN0YXR1cyA9PT0gXCJkaXJ0eVwiO1xuZXhwb3J0IGNvbnN0IGlzVmFsaWQgPSAoeCkgPT4geC5zdGF0dXMgPT09IFwidmFsaWRcIjtcbmV4cG9ydCBjb25zdCBpc0FzeW5jID0gKHgpID0+IHR5cGVvZiBQcm9taXNlICE9PSBcInVuZGVmaW5lZFwiICYmIHggaW5zdGFuY2VvZiBQcm9taXNlO1xuIiwgImV4cG9ydCB2YXIgZXJyb3JVdGlsO1xuKGZ1bmN0aW9uIChlcnJvclV0aWwpIHtcbiAgICBlcnJvclV0aWwuZXJyVG9PYmogPSAobWVzc2FnZSkgPT4gdHlwZW9mIG1lc3NhZ2UgPT09IFwic3RyaW5nXCIgPyB7IG1lc3NhZ2UgfSA6IG1lc3NhZ2UgfHwge307XG4gICAgLy8gYmlvbWUtaWdub3JlIGxpbnQ6XG4gICAgZXJyb3JVdGlsLnRvU3RyaW5nID0gKG1lc3NhZ2UpID0+IHR5cGVvZiBtZXNzYWdlID09PSBcInN0cmluZ1wiID8gbWVzc2FnZSA6IG1lc3NhZ2U/Lm1lc3NhZ2U7XG59KShlcnJvclV0aWwgfHwgKGVycm9yVXRpbCA9IHt9KSk7XG4iLCAiaW1wb3J0IHsgWm9kRXJyb3IsIFpvZElzc3VlQ29kZSwgfSBmcm9tIFwiLi9ab2RFcnJvci5qc1wiO1xuaW1wb3J0IHsgZGVmYXVsdEVycm9yTWFwLCBnZXRFcnJvck1hcCB9IGZyb20gXCIuL2Vycm9ycy5qc1wiO1xuaW1wb3J0IHsgZXJyb3JVdGlsIH0gZnJvbSBcIi4vaGVscGVycy9lcnJvclV0aWwuanNcIjtcbmltcG9ydCB7IERJUlRZLCBJTlZBTElELCBPSywgUGFyc2VTdGF0dXMsIGFkZElzc3VlVG9Db250ZXh0LCBpc0Fib3J0ZWQsIGlzQXN5bmMsIGlzRGlydHksIGlzVmFsaWQsIG1ha2VJc3N1ZSwgfSBmcm9tIFwiLi9oZWxwZXJzL3BhcnNlVXRpbC5qc1wiO1xuaW1wb3J0IHsgdXRpbCwgWm9kUGFyc2VkVHlwZSwgZ2V0UGFyc2VkVHlwZSB9IGZyb20gXCIuL2hlbHBlcnMvdXRpbC5qc1wiO1xuY2xhc3MgUGFyc2VJbnB1dExhenlQYXRoIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIHZhbHVlLCBwYXRoLCBrZXkpIHtcbiAgICAgICAgdGhpcy5fY2FjaGVkUGF0aCA9IFtdO1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgdGhpcy5kYXRhID0gdmFsdWU7XG4gICAgICAgIHRoaXMuX3BhdGggPSBwYXRoO1xuICAgICAgICB0aGlzLl9rZXkgPSBrZXk7XG4gICAgfVxuICAgIGdldCBwYXRoKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlZFBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLl9rZXkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVkUGF0aC5wdXNoKC4uLnRoaXMuX3BhdGgsIC4uLnRoaXMuX2tleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZWRQYXRoLnB1c2goLi4udGhpcy5fcGF0aCwgdGhpcy5fa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkUGF0aDtcbiAgICB9XG59XG5jb25zdCBoYW5kbGVSZXN1bHQgPSAoY3R4LCByZXN1bHQpID0+IHtcbiAgICBpZiAoaXNWYWxpZChyZXN1bHQpKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdC52YWx1ZSB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKCFjdHguY29tbW9uLmlzc3Vlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlZhbGlkYXRpb24gZmFpbGVkIGJ1dCBubyBpc3N1ZXMgZGV0ZWN0ZWQuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGdldCBlcnJvcigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9lcnJvcjtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBab2RFcnJvcihjdHguY29tbW9uLmlzc3Vlcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZXJyb3I7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cbn07XG5mdW5jdGlvbiBwcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcykge1xuICAgIGlmICghcGFyYW1zKVxuICAgICAgICByZXR1cm4ge307XG4gICAgY29uc3QgeyBlcnJvck1hcCwgaW52YWxpZF90eXBlX2Vycm9yLCByZXF1aXJlZF9lcnJvciwgZGVzY3JpcHRpb24gfSA9IHBhcmFtcztcbiAgICBpZiAoZXJyb3JNYXAgJiYgKGludmFsaWRfdHlwZV9lcnJvciB8fCByZXF1aXJlZF9lcnJvcikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCB1c2UgXCJpbnZhbGlkX3R5cGVfZXJyb3JcIiBvciBcInJlcXVpcmVkX2Vycm9yXCIgaW4gY29uanVuY3Rpb24gd2l0aCBjdXN0b20gZXJyb3IgbWFwLmApO1xuICAgIH1cbiAgICBpZiAoZXJyb3JNYXApXG4gICAgICAgIHJldHVybiB7IGVycm9yTWFwOiBlcnJvck1hcCwgZGVzY3JpcHRpb24gfTtcbiAgICBjb25zdCBjdXN0b21NYXAgPSAoaXNzLCBjdHgpID0+IHtcbiAgICAgICAgY29uc3QgeyBtZXNzYWdlIH0gPSBwYXJhbXM7XG4gICAgICAgIGlmIChpc3MuY29kZSA9PT0gXCJpbnZhbGlkX2VudW1fdmFsdWVcIikge1xuICAgICAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogbWVzc2FnZSA/PyBjdHguZGVmYXVsdEVycm9yIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBjdHguZGF0YSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogbWVzc2FnZSA/PyByZXF1aXJlZF9lcnJvciA/PyBjdHguZGVmYXVsdEVycm9yIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzcy5jb2RlICE9PSBcImludmFsaWRfdHlwZVwiKVxuICAgICAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogY3R4LmRlZmF1bHRFcnJvciB9O1xuICAgICAgICByZXR1cm4geyBtZXNzYWdlOiBtZXNzYWdlID8/IGludmFsaWRfdHlwZV9lcnJvciA/PyBjdHguZGVmYXVsdEVycm9yIH07XG4gICAgfTtcbiAgICByZXR1cm4geyBlcnJvck1hcDogY3VzdG9tTWFwLCBkZXNjcmlwdGlvbiB9O1xufVxuZXhwb3J0IGNsYXNzIFpvZFR5cGUge1xuICAgIGdldCBkZXNjcmlwdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5kZXNjcmlwdGlvbjtcbiAgICB9XG4gICAgX2dldFR5cGUoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIGdldFBhcnNlZFR5cGUoaW5wdXQuZGF0YSk7XG4gICAgfVxuICAgIF9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KSB7XG4gICAgICAgIHJldHVybiAoY3R4IHx8IHtcbiAgICAgICAgICAgIGNvbW1vbjogaW5wdXQucGFyZW50LmNvbW1vbixcbiAgICAgICAgICAgIGRhdGE6IGlucHV0LmRhdGEsXG4gICAgICAgICAgICBwYXJzZWRUeXBlOiBnZXRQYXJzZWRUeXBlKGlucHV0LmRhdGEpLFxuICAgICAgICAgICAgc2NoZW1hRXJyb3JNYXA6IHRoaXMuX2RlZi5lcnJvck1hcCxcbiAgICAgICAgICAgIHBhdGg6IGlucHV0LnBhdGgsXG4gICAgICAgICAgICBwYXJlbnQ6IGlucHV0LnBhcmVudCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1czogbmV3IFBhcnNlU3RhdHVzKCksXG4gICAgICAgICAgICBjdHg6IHtcbiAgICAgICAgICAgICAgICBjb21tb246IGlucHV0LnBhcmVudC5jb21tb24sXG4gICAgICAgICAgICAgICAgZGF0YTogaW5wdXQuZGF0YSxcbiAgICAgICAgICAgICAgICBwYXJzZWRUeXBlOiBnZXRQYXJzZWRUeXBlKGlucHV0LmRhdGEpLFxuICAgICAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICAgICAgcGF0aDogaW5wdXQucGF0aCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGlucHV0LnBhcmVudCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIF9wYXJzZVN5bmMoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcGFyc2UoaW5wdXQpO1xuICAgICAgICBpZiAoaXNBc3luYyhyZXN1bHQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTeW5jaHJvbm91cyBwYXJzZSBlbmNvdW50ZXJlZCBwcm9taXNlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBfcGFyc2VBc3luYyhpbnB1dCkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wYXJzZShpbnB1dCk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzdWx0KTtcbiAgICB9XG4gICAgcGFyc2UoZGF0YSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuc2FmZVBhcnNlKGRhdGEsIHBhcmFtcyk7XG4gICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcylcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuZGF0YTtcbiAgICAgICAgdGhyb3cgcmVzdWx0LmVycm9yO1xuICAgIH1cbiAgICBzYWZlUGFyc2UoZGF0YSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgYXN5bmM6IHBhcmFtcz8uYXN5bmMgPz8gZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGV4dHVhbEVycm9yTWFwOiBwYXJhbXM/LmVycm9yTWFwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IHBhcmFtcz8ucGF0aCB8fCBbXSxcbiAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGFyc2VkVHlwZTogZ2V0UGFyc2VkVHlwZShkYXRhKSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcGFyc2VTeW5jKHsgZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pO1xuICAgICAgICByZXR1cm4gaGFuZGxlUmVzdWx0KGN0eCwgcmVzdWx0KTtcbiAgICB9XG4gICAgXCJ+dmFsaWRhdGVcIihkYXRhKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgYXN5bmM6ICEhdGhpc1tcIn5zdGFuZGFyZFwiXS5hc3luYyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBbXSxcbiAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGFyc2VkVHlwZTogZ2V0UGFyc2VkVHlwZShkYXRhKSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCF0aGlzW1wifnN0YW5kYXJkXCJdLmFzeW5jKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3BhcnNlU3luYyh7IGRhdGEsIHBhdGg6IFtdLCBwYXJlbnQ6IGN0eCB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNWYWxpZChyZXN1bHQpXG4gICAgICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzc3VlczogY3R4LmNvbW1vbi5pc3N1ZXMsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycj8ubWVzc2FnZT8udG9Mb3dlckNhc2UoKT8uaW5jbHVkZXMoXCJlbmNvdW50ZXJlZFwiKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW1wifnN0YW5kYXJkXCJdLmFzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3R4LmNvbW1vbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgYXN5bmM6IHRydWUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fcGFyc2VBc3luYyh7IGRhdGEsIHBhdGg6IFtdLCBwYXJlbnQ6IGN0eCB9KS50aGVuKChyZXN1bHQpID0+IGlzVmFsaWQocmVzdWx0KVxuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogY3R4LmNvbW1vbi5pc3N1ZXMsXG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMgcGFyc2VBc3luYyhkYXRhLCBwYXJhbXMpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zYWZlUGFyc2VBc3luYyhkYXRhLCBwYXJhbXMpO1xuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LmRhdGE7XG4gICAgICAgIHRocm93IHJlc3VsdC5lcnJvcjtcbiAgICB9XG4gICAgYXN5bmMgc2FmZVBhcnNlQXN5bmMoZGF0YSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgY29udGV4dHVhbEVycm9yTWFwOiBwYXJhbXM/LmVycm9yTWFwLFxuICAgICAgICAgICAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IHBhcmFtcz8ucGF0aCB8fCBbXSxcbiAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGFyc2VkVHlwZTogZ2V0UGFyc2VkVHlwZShkYXRhKSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgbWF5YmVBc3luY1Jlc3VsdCA9IHRoaXMuX3BhcnNlKHsgZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCAoaXNBc3luYyhtYXliZUFzeW5jUmVzdWx0KSA/IG1heWJlQXN5bmNSZXN1bHQgOiBQcm9taXNlLnJlc29sdmUobWF5YmVBc3luY1Jlc3VsdCkpO1xuICAgICAgICByZXR1cm4gaGFuZGxlUmVzdWx0KGN0eCwgcmVzdWx0KTtcbiAgICB9XG4gICAgcmVmaW5lKGNoZWNrLCBtZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IGdldElzc3VlUHJvcGVydGllcyA9ICh2YWwpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgbWVzc2FnZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IG1lc3NhZ2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBtZXNzYWdlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZSh2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZpbmVtZW50KCh2YWwsIGN0eCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gY2hlY2sodmFsKTtcbiAgICAgICAgICAgIGNvbnN0IHNldEVycm9yID0gKCkgPT4gY3R4LmFkZElzc3VlKHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuY3VzdG9tLFxuICAgICAgICAgICAgICAgIC4uLmdldElzc3VlUHJvcGVydGllcyh2YWwpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIFByb21pc2UgIT09IFwidW5kZWZpbmVkXCIgJiYgcmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBzZXRFcnJvcigpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVmaW5lbWVudChjaGVjaywgcmVmaW5lbWVudERhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmluZW1lbnQoKHZhbCwgY3R4KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWNoZWNrKHZhbCkpIHtcbiAgICAgICAgICAgICAgICBjdHguYWRkSXNzdWUodHlwZW9mIHJlZmluZW1lbnREYXRhID09PSBcImZ1bmN0aW9uXCIgPyByZWZpbmVtZW50RGF0YSh2YWwsIGN0eCkgOiByZWZpbmVtZW50RGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfcmVmaW5lbWVudChyZWZpbmVtZW50KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRWZmZWN0cyh7XG4gICAgICAgICAgICBzY2hlbWE6IHRoaXMsXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVmZmVjdHMsXG4gICAgICAgICAgICBlZmZlY3Q6IHsgdHlwZTogXCJyZWZpbmVtZW50XCIsIHJlZmluZW1lbnQgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN1cGVyUmVmaW5lKHJlZmluZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmluZW1lbnQocmVmaW5lbWVudCk7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGRlZikge1xuICAgICAgICAvKiogQWxpYXMgb2Ygc2FmZVBhcnNlQXN5bmMgKi9cbiAgICAgICAgdGhpcy5zcGEgPSB0aGlzLnNhZmVQYXJzZUFzeW5jO1xuICAgICAgICB0aGlzLl9kZWYgPSBkZWY7XG4gICAgICAgIHRoaXMucGFyc2UgPSB0aGlzLnBhcnNlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc2FmZVBhcnNlID0gdGhpcy5zYWZlUGFyc2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5wYXJzZUFzeW5jID0gdGhpcy5wYXJzZUFzeW5jLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc2FmZVBhcnNlQXN5bmMgPSB0aGlzLnNhZmVQYXJzZUFzeW5jLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc3BhID0gdGhpcy5zcGEuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5yZWZpbmUgPSB0aGlzLnJlZmluZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnJlZmluZW1lbnQgPSB0aGlzLnJlZmluZW1lbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zdXBlclJlZmluZSA9IHRoaXMuc3VwZXJSZWZpbmUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5vcHRpb25hbCA9IHRoaXMub3B0aW9uYWwuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5udWxsYWJsZSA9IHRoaXMubnVsbGFibGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5udWxsaXNoID0gdGhpcy5udWxsaXNoLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYXJyYXkgPSB0aGlzLmFycmF5LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucHJvbWlzZSA9IHRoaXMucHJvbWlzZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9yID0gdGhpcy5vci5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmFuZCA9IHRoaXMuYW5kLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtID0gdGhpcy50cmFuc2Zvcm0uYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5icmFuZCA9IHRoaXMuYnJhbmQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5kZWZhdWx0ID0gdGhpcy5kZWZhdWx0LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuY2F0Y2ggPSB0aGlzLmNhdGNoLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZGVzY3JpYmUgPSB0aGlzLmRlc2NyaWJlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucGlwZSA9IHRoaXMucGlwZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnJlYWRvbmx5ID0gdGhpcy5yZWFkb25seS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmlzTnVsbGFibGUgPSB0aGlzLmlzTnVsbGFibGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5pc09wdGlvbmFsID0gdGhpcy5pc09wdGlvbmFsLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXNbXCJ+c3RhbmRhcmRcIl0gPSB7XG4gICAgICAgICAgICB2ZXJzaW9uOiAxLFxuICAgICAgICAgICAgdmVuZG9yOiBcInpvZFwiLFxuICAgICAgICAgICAgdmFsaWRhdGU6IChkYXRhKSA9PiB0aGlzW1wifnZhbGlkYXRlXCJdKGRhdGEpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBvcHRpb25hbCgpIHtcbiAgICAgICAgcmV0dXJuIFpvZE9wdGlvbmFsLmNyZWF0ZSh0aGlzLCB0aGlzLl9kZWYpO1xuICAgIH1cbiAgICBudWxsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIFpvZE51bGxhYmxlLmNyZWF0ZSh0aGlzLCB0aGlzLl9kZWYpO1xuICAgIH1cbiAgICBudWxsaXNoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5udWxsYWJsZSgpLm9wdGlvbmFsKCk7XG4gICAgfVxuICAgIGFycmF5KCkge1xuICAgICAgICByZXR1cm4gWm9kQXJyYXkuY3JlYXRlKHRoaXMpO1xuICAgIH1cbiAgICBwcm9taXNlKCkge1xuICAgICAgICByZXR1cm4gWm9kUHJvbWlzZS5jcmVhdGUodGhpcywgdGhpcy5fZGVmKTtcbiAgICB9XG4gICAgb3Iob3B0aW9uKSB7XG4gICAgICAgIHJldHVybiBab2RVbmlvbi5jcmVhdGUoW3RoaXMsIG9wdGlvbl0sIHRoaXMuX2RlZik7XG4gICAgfVxuICAgIGFuZChpbmNvbWluZykge1xuICAgICAgICByZXR1cm4gWm9kSW50ZXJzZWN0aW9uLmNyZWF0ZSh0aGlzLCBpbmNvbWluZywgdGhpcy5fZGVmKTtcbiAgICB9XG4gICAgdHJhbnNmb3JtKHRyYW5zZm9ybSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEVmZmVjdHMoe1xuICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyh0aGlzLl9kZWYpLFxuICAgICAgICAgICAgc2NoZW1hOiB0aGlzLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFZmZlY3RzLFxuICAgICAgICAgICAgZWZmZWN0OiB7IHR5cGU6IFwidHJhbnNmb3JtXCIsIHRyYW5zZm9ybSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZGVmYXVsdChkZWYpIHtcbiAgICAgICAgY29uc3QgZGVmYXVsdFZhbHVlRnVuYyA9IHR5cGVvZiBkZWYgPT09IFwiZnVuY3Rpb25cIiA/IGRlZiA6ICgpID0+IGRlZjtcbiAgICAgICAgcmV0dXJuIG5ldyBab2REZWZhdWx0KHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXModGhpcy5fZGVmKSxcbiAgICAgICAgICAgIGlubmVyVHlwZTogdGhpcyxcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogZGVmYXVsdFZhbHVlRnVuYyxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRGVmYXVsdCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGJyYW5kKCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEJyYW5kZWQoe1xuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RCcmFuZGVkLFxuICAgICAgICAgICAgdHlwZTogdGhpcyxcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXModGhpcy5fZGVmKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNhdGNoKGRlZikge1xuICAgICAgICBjb25zdCBjYXRjaFZhbHVlRnVuYyA9IHR5cGVvZiBkZWYgPT09IFwiZnVuY3Rpb25cIiA/IGRlZiA6ICgpID0+IGRlZjtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RDYXRjaCh7XG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHRoaXMuX2RlZiksXG4gICAgICAgICAgICBpbm5lclR5cGU6IHRoaXMsXG4gICAgICAgICAgICBjYXRjaFZhbHVlOiBjYXRjaFZhbHVlRnVuYyxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQ2F0Y2gsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBkZXNjcmliZShkZXNjcmlwdGlvbikge1xuICAgICAgICBjb25zdCBUaGlzID0gdGhpcy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgcmV0dXJuIG5ldyBUaGlzKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcGlwZSh0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuIFpvZFBpcGVsaW5lLmNyZWF0ZSh0aGlzLCB0YXJnZXQpO1xuICAgIH1cbiAgICByZWFkb25seSgpIHtcbiAgICAgICAgcmV0dXJuIFpvZFJlYWRvbmx5LmNyZWF0ZSh0aGlzKTtcbiAgICB9XG4gICAgaXNPcHRpb25hbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FmZVBhcnNlKHVuZGVmaW5lZCkuc3VjY2VzcztcbiAgICB9XG4gICAgaXNOdWxsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FmZVBhcnNlKG51bGwpLnN1Y2Nlc3M7XG4gICAgfVxufVxuY29uc3QgY3VpZFJlZ2V4ID0gL15jW15cXHMtXXs4LH0kL2k7XG5jb25zdCBjdWlkMlJlZ2V4ID0gL15bMC05YS16XSskLztcbmNvbnN0IHVsaWRSZWdleCA9IC9eWzAtOUEtSEpLTU5QLVRWLVpdezI2fSQvaTtcbi8vIGNvbnN0IHV1aWRSZWdleCA9XG4vLyAgIC9eKFthLWYwLTldezh9LVthLWYwLTldezR9LVsxLTVdW2EtZjAtOV17M30tW2EtZjAtOV17NH0tW2EtZjAtOV17MTJ9fDAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCkkL2k7XG5jb25zdCB1dWlkUmVnZXggPSAvXlswLTlhLWZBLUZdezh9XFxiLVswLTlhLWZBLUZdezR9XFxiLVswLTlhLWZBLUZdezR9XFxiLVswLTlhLWZBLUZdezR9XFxiLVswLTlhLWZBLUZdezEyfSQvaTtcbmNvbnN0IG5hbm9pZFJlZ2V4ID0gL15bYS16MC05Xy1dezIxfSQvaTtcbmNvbnN0IGp3dFJlZ2V4ID0gL15bQS1aYS16MC05LV9dK1xcLltBLVphLXowLTktX10rXFwuW0EtWmEtejAtOS1fXSokLztcbmNvbnN0IGR1cmF0aW9uUmVnZXggPSAvXlstK10/UCg/ISQpKD86KD86Wy0rXT9cXGQrWSl8KD86Wy0rXT9cXGQrWy4sXVxcZCtZJCkpPyg/Oig/OlstK10/XFxkK00pfCg/OlstK10/XFxkK1suLF1cXGQrTSQpKT8oPzooPzpbLStdP1xcZCtXKXwoPzpbLStdP1xcZCtbLixdXFxkK1ckKSk/KD86KD86Wy0rXT9cXGQrRCl8KD86Wy0rXT9cXGQrWy4sXVxcZCtEJCkpPyg/OlQoPz1bXFxkKy1dKSg/Oig/OlstK10/XFxkK0gpfCg/OlstK10/XFxkK1suLF1cXGQrSCQpKT8oPzooPzpbLStdP1xcZCtNKXwoPzpbLStdP1xcZCtbLixdXFxkK00kKSk/KD86Wy0rXT9cXGQrKD86Wy4sXVxcZCspP1MpPyk/PyQvO1xuLy8gZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNDYxODEvMTU1MDE1NVxuLy8gb2xkIHZlcnNpb246IHRvbyBzbG93LCBkaWRuJ3Qgc3VwcG9ydCB1bmljb2RlXG4vLyBjb25zdCBlbWFpbFJlZ2V4ID0gL14oKChbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkrKFxcLihbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkrKSopfCgoXFx4MjIpKCgoKFxceDIwfFxceDA5KSooXFx4MGRcXHgwYSkpPyhcXHgyMHxcXHgwOSkrKT8oKFtcXHgwMS1cXHgwOFxceDBiXFx4MGNcXHgwZS1cXHgxZlxceDdmXXxcXHgyMXxbXFx4MjMtXFx4NWJdfFtcXHg1ZC1cXHg3ZV18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfChcXFxcKFtcXHgwMS1cXHgwOVxceDBiXFx4MGNcXHgwZC1cXHg3Zl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSkpKigoKFxceDIwfFxceDA5KSooXFx4MGRcXHgwYSkpPyhcXHgyMHxcXHgwOSkrKT8oXFx4MjIpKSlAKCgoW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLikrKChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpJC9pO1xuLy9vbGQgZW1haWwgcmVnZXhcbi8vIGNvbnN0IGVtYWlsUmVnZXggPSAvXigoW148PigpW1xcXS4sOzpcXHNAXCJdKyhcXC5bXjw+KClbXFxdLiw7Olxcc0BcIl0rKSopfChcIi4rXCIpKUAoKD8hLSkoW148PigpW1xcXS4sOzpcXHNAXCJdK1xcLikrW148PigpW1xcXS4sOzpcXHNAXCJdezEsfSlbXi08PigpW1xcXS4sOzpcXHNAXCJdJC9pO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4vLyBjb25zdCBlbWFpbFJlZ2V4ID1cbi8vICAgL14oKFtePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoXFxbKCgoMjVbMC01XSl8KDJbMC00XVswLTldKXwoMVswLTldezJ9KXwoWzAtOV17MSwyfSkpXFwuKXszfSgoMjVbMC01XSl8KDJbMC00XVswLTldKXwoMVswLTldezJ9KXwoWzAtOV17MSwyfSkpXFxdKXwoXFxbSVB2NjooKFthLWYwLTldezEsNH06KXs3fXw6OihbYS1mMC05XXsxLDR9Oil7MCw2fXwoW2EtZjAtOV17MSw0fTopezF9OihbYS1mMC05XXsxLDR9Oil7MCw1fXwoW2EtZjAtOV17MSw0fTopezJ9OihbYS1mMC05XXsxLDR9Oil7MCw0fXwoW2EtZjAtOV17MSw0fTopezN9OihbYS1mMC05XXsxLDR9Oil7MCwzfXwoW2EtZjAtOV17MSw0fTopezR9OihbYS1mMC05XXsxLDR9Oil7MCwyfXwoW2EtZjAtOV17MSw0fTopezV9OihbYS1mMC05XXsxLDR9Oil7MCwxfSkoW2EtZjAtOV17MSw0fXwoKCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSlcXC4pezN9KCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSkpXFxdKXwoW0EtWmEtejAtOV0oW0EtWmEtejAtOS1dKltBLVphLXowLTldKSooXFwuW0EtWmEtel17Mix9KSspKSQvO1xuLy8gY29uc3QgZW1haWxSZWdleCA9XG4vLyAgIC9eW2EtekEtWjAtOVxcLlxcIVxcI1xcJFxcJVxcJlxcJ1xcKlxcK1xcL1xcPVxcP1xcXlxcX1xcYFxce1xcfFxcfVxcflxcLV0rQFthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykqJC87XG4vLyBjb25zdCBlbWFpbFJlZ2V4ID1cbi8vICAgL14oPzpbYS16MC05ISMkJSYnKisvPT9eX2B7fH1+LV0rKD86XFwuW2EtejAtOSEjJCUmJyorLz0/Xl9ge3x9fi1dKykqfFwiKD86W1xceDAxLVxceDA4XFx4MGJcXHgwY1xceDBlLVxceDFmXFx4MjFcXHgyMy1cXHg1YlxceDVkLVxceDdmXXxcXFxcW1xceDAxLVxceDA5XFx4MGJcXHgwY1xceDBlLVxceDdmXSkqXCIpQCg/Oig/OlthLXowLTldKD86W2EtejAtOS1dKlthLXowLTldKT9cXC4pK1thLXowLTldKD86W2EtejAtOS1dKlthLXowLTldKT98XFxbKD86KD86MjVbMC01XXwyWzAtNF1bMC05XXxbMDFdP1swLTldWzAtOV0/KVxcLil7M30oPzoyNVswLTVdfDJbMC00XVswLTldfFswMV0/WzAtOV1bMC05XT98W2EtejAtOS1dKlthLXowLTldOig/OltcXHgwMS1cXHgwOFxceDBiXFx4MGNcXHgwZS1cXHgxZlxceDIxLVxceDVhXFx4NTMtXFx4N2ZdfFxcXFxbXFx4MDEtXFx4MDlcXHgwYlxceDBjXFx4MGUtXFx4N2ZdKSspXFxdKSQvaTtcbmNvbnN0IGVtYWlsUmVnZXggPSAvXig/IVxcLikoPyEuKlxcLlxcLikoW0EtWjAtOV8nK1xcLVxcLl0qKVtBLVowLTlfKy1dQChbQS1aMC05XVtBLVowLTlcXC1dKlxcLikrW0EtWl17Mix9JC9pO1xuLy8gY29uc3QgZW1haWxSZWdleCA9XG4vLyAgIC9eW2EtejAtOS4hIyQlJlx1MjAxOSorLz0/Xl9ge3x9fi1dK0BbYS16MC05LV0rKD86XFwuW2EtejAtOVxcLV0rKSokL2k7XG4vLyBmcm9tIGh0dHBzOi8vdGhla2V2aW5zY290dC5jb20vZW1vamlzLWluLWphdmFzY3JpcHQvI3dyaXRpbmctYS1yZWd1bGFyLWV4cHJlc3Npb25cbmNvbnN0IF9lbW9qaVJlZ2V4ID0gYF4oXFxcXHB7RXh0ZW5kZWRfUGljdG9ncmFwaGljfXxcXFxccHtFbW9qaV9Db21wb25lbnR9KSskYDtcbmxldCBlbW9qaVJlZ2V4O1xuLy8gZmFzdGVyLCBzaW1wbGVyLCBzYWZlclxuY29uc3QgaXB2NFJlZ2V4ID0gL14oPzooPzoyNVswLTVdfDJbMC00XVswLTldfDFbMC05XVswLTldfFsxLTldWzAtOV18WzAtOV0pXFwuKXszfSg/OjI1WzAtNV18MlswLTRdWzAtOV18MVswLTldWzAtOV18WzEtOV1bMC05XXxbMC05XSkkLztcbmNvbnN0IGlwdjRDaWRyUmVnZXggPSAvXig/Oig/OjI1WzAtNV18MlswLTRdWzAtOV18MVswLTldWzAtOV18WzEtOV1bMC05XXxbMC05XSlcXC4pezN9KD86MjVbMC01XXwyWzAtNF1bMC05XXwxWzAtOV1bMC05XXxbMS05XVswLTldfFswLTldKVxcLygzWzAtMl18WzEyXT9bMC05XSkkLztcbi8vIGNvbnN0IGlwdjZSZWdleCA9XG4vLyAvXigoW2EtZjAtOV17MSw0fTopezd9fDo6KFthLWYwLTldezEsNH06KXswLDZ9fChbYS1mMC05XXsxLDR9Oil7MX06KFthLWYwLTldezEsNH06KXswLDV9fChbYS1mMC05XXsxLDR9Oil7Mn06KFthLWYwLTldezEsNH06KXswLDR9fChbYS1mMC05XXsxLDR9Oil7M306KFthLWYwLTldezEsNH06KXswLDN9fChbYS1mMC05XXsxLDR9Oil7NH06KFthLWYwLTldezEsNH06KXswLDJ9fChbYS1mMC05XXsxLDR9Oil7NX06KFthLWYwLTldezEsNH06KXswLDF9KShbYS1mMC05XXsxLDR9fCgoKDI1WzAtNV0pfCgyWzAtNF1bMC05XSl8KDFbMC05XXsyfSl8KFswLTldezEsMn0pKVxcLil7M30oKDI1WzAtNV0pfCgyWzAtNF1bMC05XSl8KDFbMC05XXsyfSl8KFswLTldezEsMn0pKSkkLztcbmNvbnN0IGlwdjZSZWdleCA9IC9eKChbMC05YS1mQS1GXXsxLDR9Oil7Nyw3fVswLTlhLWZBLUZdezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDd9OnwoWzAtOWEtZkEtRl17MSw0fTopezEsNn06WzAtOWEtZkEtRl17MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsNX0oOlswLTlhLWZBLUZdezEsNH0pezEsMn18KFswLTlhLWZBLUZdezEsNH06KXsxLDR9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDN9fChbMC05YS1mQS1GXXsxLDR9Oil7MSwzfSg6WzAtOWEtZkEtRl17MSw0fSl7MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsMn0oOlswLTlhLWZBLUZdezEsNH0pezEsNX18WzAtOWEtZkEtRl17MSw0fTooKDpbMC05YS1mQS1GXXsxLDR9KXsxLDZ9KXw6KCg6WzAtOWEtZkEtRl17MSw0fSl7MSw3fXw6KXxmZTgwOig6WzAtOWEtZkEtRl17MCw0fSl7MCw0fSVbMC05YS16QS1aXXsxLH18OjooZmZmZig6MHsxLDR9KXswLDF9Oil7MCwxfSgoMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pXFwuKXszLDN9KDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKXwoWzAtOWEtZkEtRl17MSw0fTopezEsNH06KCgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSlcXC4pezMsM30oMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pKSQvO1xuY29uc3QgaXB2NkNpZHJSZWdleCA9IC9eKChbMC05YS1mQS1GXXsxLDR9Oil7Nyw3fVswLTlhLWZBLUZdezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDd9OnwoWzAtOWEtZkEtRl17MSw0fTopezEsNn06WzAtOWEtZkEtRl17MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsNX0oOlswLTlhLWZBLUZdezEsNH0pezEsMn18KFswLTlhLWZBLUZdezEsNH06KXsxLDR9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDN9fChbMC05YS1mQS1GXXsxLDR9Oil7MSwzfSg6WzAtOWEtZkEtRl17MSw0fSl7MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsMn0oOlswLTlhLWZBLUZdezEsNH0pezEsNX18WzAtOWEtZkEtRl17MSw0fTooKDpbMC05YS1mQS1GXXsxLDR9KXsxLDZ9KXw6KCg6WzAtOWEtZkEtRl17MSw0fSl7MSw3fXw6KXxmZTgwOig6WzAtOWEtZkEtRl17MCw0fSl7MCw0fSVbMC05YS16QS1aXXsxLH18OjooZmZmZig6MHsxLDR9KXswLDF9Oil7MCwxfSgoMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pXFwuKXszLDN9KDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKXwoWzAtOWEtZkEtRl17MSw0fTopezEsNH06KCgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSlcXC4pezMsM30oMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pKVxcLygxMlswLThdfDFbMDFdWzAtOV18WzEtOV0/WzAtOV0pJC87XG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83ODYwMzkyL2RldGVybWluZS1pZi1zdHJpbmctaXMtaW4tYmFzZTY0LXVzaW5nLWphdmFzY3JpcHRcbmNvbnN0IGJhc2U2NFJlZ2V4ID0gL14oWzAtOWEtekEtWisvXXs0fSkqKChbMC05YS16QS1aKy9dezJ9PT0pfChbMC05YS16QS1aKy9dezN9PSkpPyQvO1xuLy8gaHR0cHM6Ly9iYXNlNjQuZ3VydS9zdGFuZGFyZHMvYmFzZTY0dXJsXG5jb25zdCBiYXNlNjR1cmxSZWdleCA9IC9eKFswLTlhLXpBLVotX117NH0pKigoWzAtOWEtekEtWi1fXXsyfSg9PSk/KXwoWzAtOWEtekEtWi1fXXszfSg9KT8pKT8kLztcbi8vIHNpbXBsZVxuLy8gY29uc3QgZGF0ZVJlZ2V4U291cmNlID0gYFxcXFxkezR9LVxcXFxkezJ9LVxcXFxkezJ9YDtcbi8vIG5vIGxlYXAgeWVhciB2YWxpZGF0aW9uXG4vLyBjb25zdCBkYXRlUmVnZXhTb3VyY2UgPSBgXFxcXGR7NH0tKCgwWzEzNTc4XXwxMHwxMiktMzF8KDBbMTMtOV18MVswLTJdKS0zMHwoMFsxLTldfDFbMC0yXSktKDBbMS05XXwxXFxcXGR8MlxcXFxkKSlgO1xuLy8gd2l0aCBsZWFwIHllYXIgdmFsaWRhdGlvblxuY29uc3QgZGF0ZVJlZ2V4U291cmNlID0gYCgoXFxcXGRcXFxcZFsyNDY4XVswNDhdfFxcXFxkXFxcXGRbMTM1NzldWzI2XXxcXFxcZFxcXFxkMFs0OF18WzAyNDY4XVswNDhdMDB8WzEzNTc5XVsyNl0wMCktMDItMjl8XFxcXGR7NH0tKCgwWzEzNTc4XXwxWzAyXSktKDBbMS05XXxbMTJdXFxcXGR8M1swMV0pfCgwWzQ2OV18MTEpLSgwWzEtOV18WzEyXVxcXFxkfDMwKXwoMDIpLSgwWzEtOV18MVxcXFxkfDJbMC04XSkpKWA7XG5jb25zdCBkYXRlUmVnZXggPSBuZXcgUmVnRXhwKGBeJHtkYXRlUmVnZXhTb3VyY2V9JGApO1xuZnVuY3Rpb24gdGltZVJlZ2V4U291cmNlKGFyZ3MpIHtcbiAgICBsZXQgc2Vjb25kc1JlZ2V4U291cmNlID0gYFswLTVdXFxcXGRgO1xuICAgIGlmIChhcmdzLnByZWNpc2lvbikge1xuICAgICAgICBzZWNvbmRzUmVnZXhTb3VyY2UgPSBgJHtzZWNvbmRzUmVnZXhTb3VyY2V9XFxcXC5cXFxcZHske2FyZ3MucHJlY2lzaW9ufX1gO1xuICAgIH1cbiAgICBlbHNlIGlmIChhcmdzLnByZWNpc2lvbiA9PSBudWxsKSB7XG4gICAgICAgIHNlY29uZHNSZWdleFNvdXJjZSA9IGAke3NlY29uZHNSZWdleFNvdXJjZX0oXFxcXC5cXFxcZCspP2A7XG4gICAgfVxuICAgIGNvbnN0IHNlY29uZHNRdWFudGlmaWVyID0gYXJncy5wcmVjaXNpb24gPyBcIitcIiA6IFwiP1wiOyAvLyByZXF1aXJlIHNlY29uZHMgaWYgcHJlY2lzaW9uIGlzIG5vbnplcm9cbiAgICByZXR1cm4gYChbMDFdXFxcXGR8MlswLTNdKTpbMC01XVxcXFxkKDoke3NlY29uZHNSZWdleFNvdXJjZX0pJHtzZWNvbmRzUXVhbnRpZmllcn1gO1xufVxuZnVuY3Rpb24gdGltZVJlZ2V4KGFyZ3MpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXiR7dGltZVJlZ2V4U291cmNlKGFyZ3MpfSRgKTtcbn1cbi8vIEFkYXB0ZWQgZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzE0MzIzMVxuZXhwb3J0IGZ1bmN0aW9uIGRhdGV0aW1lUmVnZXgoYXJncykge1xuICAgIGxldCByZWdleCA9IGAke2RhdGVSZWdleFNvdXJjZX1UJHt0aW1lUmVnZXhTb3VyY2UoYXJncyl9YDtcbiAgICBjb25zdCBvcHRzID0gW107XG4gICAgb3B0cy5wdXNoKGFyZ3MubG9jYWwgPyBgWj9gIDogYFpgKTtcbiAgICBpZiAoYXJncy5vZmZzZXQpXG4gICAgICAgIG9wdHMucHVzaChgKFsrLV1cXFxcZHsyfTo/XFxcXGR7Mn0pYCk7XG4gICAgcmVnZXggPSBgJHtyZWdleH0oJHtvcHRzLmpvaW4oXCJ8XCIpfSlgO1xuICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHtyZWdleH0kYCk7XG59XG5mdW5jdGlvbiBpc1ZhbGlkSVAoaXAsIHZlcnNpb24pIHtcbiAgICBpZiAoKHZlcnNpb24gPT09IFwidjRcIiB8fCAhdmVyc2lvbikgJiYgaXB2NFJlZ2V4LnRlc3QoaXApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoKHZlcnNpb24gPT09IFwidjZcIiB8fCAhdmVyc2lvbikgJiYgaXB2NlJlZ2V4LnRlc3QoaXApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBpc1ZhbGlkSldUKGp3dCwgYWxnKSB7XG4gICAgaWYgKCFqd3RSZWdleC50ZXN0KGp3dCkpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBbaGVhZGVyXSA9IGp3dC5zcGxpdChcIi5cIik7XG4gICAgICAgIGlmICghaGVhZGVyKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyBDb252ZXJ0IGJhc2U2NHVybCB0byBiYXNlNjRcbiAgICAgICAgY29uc3QgYmFzZTY0ID0gaGVhZGVyXG4gICAgICAgICAgICAucmVwbGFjZSgvLS9nLCBcIitcIilcbiAgICAgICAgICAgIC5yZXBsYWNlKC9fL2csIFwiL1wiKVxuICAgICAgICAgICAgLnBhZEVuZChoZWFkZXIubGVuZ3RoICsgKCg0IC0gKGhlYWRlci5sZW5ndGggJSA0KSkgJSA0KSwgXCI9XCIpO1xuICAgICAgICBjb25zdCBkZWNvZGVkID0gSlNPTi5wYXJzZShhdG9iKGJhc2U2NCkpO1xuICAgICAgICBpZiAodHlwZW9mIGRlY29kZWQgIT09IFwib2JqZWN0XCIgfHwgZGVjb2RlZCA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKFwidHlwXCIgaW4gZGVjb2RlZCAmJiBkZWNvZGVkPy50eXAgIT09IFwiSldUXCIpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICghZGVjb2RlZC5hbGcpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChhbGcgJiYgZGVjb2RlZC5hbGcgIT09IGFsZylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGlzVmFsaWRDaWRyKGlwLCB2ZXJzaW9uKSB7XG4gICAgaWYgKCh2ZXJzaW9uID09PSBcInY0XCIgfHwgIXZlcnNpb24pICYmIGlwdjRDaWRyUmVnZXgudGVzdChpcCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICgodmVyc2lvbiA9PT0gXCJ2NlwiIHx8ICF2ZXJzaW9uKSAmJiBpcHY2Q2lkclJlZ2V4LnRlc3QoaXApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5leHBvcnQgY2xhc3MgWm9kU3RyaW5nIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY29lcmNlKSB7XG4gICAgICAgICAgICBpbnB1dC5kYXRhID0gU3RyaW5nKGlucHV0LmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuc3RyaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLnN0cmluZyxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IG5ldyBQYXJzZVN0YXR1cygpO1xuICAgICAgICBsZXQgY3R4ID0gdW5kZWZpbmVkO1xuICAgICAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaGVjay5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEubGVuZ3RoIDwgY2hlY2sudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEubGVuZ3RoID4gY2hlY2sudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJsZW5ndGhcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb0JpZyA9IGlucHV0LmRhdGEubGVuZ3RoID4gY2hlY2sudmFsdWU7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBpbnB1dC5kYXRhLmxlbmd0aCA8IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29CaWcgfHwgdG9vU21hbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b29CaWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0b29TbWFsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJlbWFpbFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlbWFpbFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJlbWFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZW1vamlcIikge1xuICAgICAgICAgICAgICAgIGlmICghZW1vamlSZWdleCkge1xuICAgICAgICAgICAgICAgICAgICBlbW9qaVJlZ2V4ID0gbmV3IFJlZ0V4cChfZW1vamlSZWdleCwgXCJ1XCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWVtb2ppUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImVtb2ppXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ1dWlkXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXV1aWRSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwidXVpZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibmFub2lkXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW5hbm9pZFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJuYW5vaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImN1aWRcIikge1xuICAgICAgICAgICAgICAgIGlmICghY3VpZFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJjdWlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJjdWlkMlwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjdWlkMlJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJjdWlkMlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwidWxpZFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF1bGlkUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcInVsaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInVybFwiKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgbmV3IFVSTChpbnB1dC5kYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcInVybFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwicmVnZXhcIikge1xuICAgICAgICAgICAgICAgIGNoZWNrLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgdGVzdFJlc3VsdCA9IGNoZWNrLnJlZ2V4LnRlc3QoaW5wdXQuZGF0YSk7XG4gICAgICAgICAgICAgICAgaWYgKCF0ZXN0UmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwicmVnZXhcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInRyaW1cIikge1xuICAgICAgICAgICAgICAgIGlucHV0LmRhdGEgPSBpbnB1dC5kYXRhLnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiaW5jbHVkZXNcIikge1xuICAgICAgICAgICAgICAgIGlmICghaW5wdXQuZGF0YS5pbmNsdWRlcyhjaGVjay52YWx1ZSwgY2hlY2sucG9zaXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHsgaW5jbHVkZXM6IGNoZWNrLnZhbHVlLCBwb3NpdGlvbjogY2hlY2sucG9zaXRpb24gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInRvTG93ZXJDYXNlXCIpIHtcbiAgICAgICAgICAgICAgICBpbnB1dC5kYXRhID0gaW5wdXQuZGF0YS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ0b1VwcGVyQ2FzZVwiKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQuZGF0YSA9IGlucHV0LmRhdGEudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwic3RhcnRzV2l0aFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpbnB1dC5kYXRhLnN0YXJ0c1dpdGgoY2hlY2sudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHsgc3RhcnRzV2l0aDogY2hlY2sudmFsdWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImVuZHNXaXRoXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0LmRhdGEuZW5kc1dpdGgoY2hlY2sudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHsgZW5kc1dpdGg6IGNoZWNrLnZhbHVlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJkYXRldGltZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVnZXggPSBkYXRldGltZVJlZ2V4KGNoZWNrKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJkYXRldGltZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZGF0ZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVnZXggPSBkYXRlUmVnZXg7XG4gICAgICAgICAgICAgICAgaWYgKCFyZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwidGltZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVnZXggPSB0aW1lUmVnZXgoY2hlY2spO1xuICAgICAgICAgICAgICAgIGlmICghcmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcInRpbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImR1cmF0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWR1cmF0aW9uUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImR1cmF0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJpcFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkSVAoaW5wdXQuZGF0YSwgY2hlY2sudmVyc2lvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJpcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiand0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzVmFsaWRKV1QoaW5wdXQuZGF0YSwgY2hlY2suYWxnKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImp3dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiY2lkclwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkQ2lkcihpbnB1dC5kYXRhLCBjaGVjay52ZXJzaW9uKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImNpZHJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImJhc2U2NFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFiYXNlNjRSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiYmFzZTY0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJiYXNlNjR1cmxcIikge1xuICAgICAgICAgICAgICAgIGlmICghYmFzZTY0dXJsUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImJhc2U2NHVybFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoY2hlY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogaW5wdXQuZGF0YSB9O1xuICAgIH1cbiAgICBfcmVnZXgocmVnZXgsIHZhbGlkYXRpb24sIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVmaW5lbWVudCgoZGF0YSkgPT4gcmVnZXgudGVzdChkYXRhKSwge1xuICAgICAgICAgICAgdmFsaWRhdGlvbixcbiAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9hZGRDaGVjayhjaGVjaykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFN0cmluZyh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCBjaGVja10sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbWFpbChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiZW1haWxcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICB1cmwobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcInVybFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIGVtb2ppKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJlbW9qaVwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIHV1aWQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcInV1aWRcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBuYW5vaWQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcIm5hbm9pZFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIGN1aWQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImN1aWRcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBjdWlkMihtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiY3VpZDJcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICB1bGlkKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJ1bGlkXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgYmFzZTY0KG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJiYXNlNjRcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBiYXNlNjR1cmwobWVzc2FnZSkge1xuICAgICAgICAvLyBiYXNlNjR1cmwgZW5jb2RpbmcgaXMgYSBtb2RpZmljYXRpb24gb2YgYmFzZTY0IHRoYXQgY2FuIHNhZmVseSBiZSB1c2VkIGluIFVSTHMgYW5kIGZpbGVuYW1lc1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJiYXNlNjR1cmxcIixcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGp3dChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiand0XCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihvcHRpb25zKSB9KTtcbiAgICB9XG4gICAgaXAob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImlwXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihvcHRpb25zKSB9KTtcbiAgICB9XG4gICAgY2lkcihvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiY2lkclwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucykgfSk7XG4gICAgfVxuICAgIGRhdGV0aW1lKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAgICAgIGtpbmQ6IFwiZGF0ZXRpbWVcIixcbiAgICAgICAgICAgICAgICBwcmVjaXNpb246IG51bGwsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBsb2NhbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogb3B0aW9ucyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImRhdGV0aW1lXCIsXG4gICAgICAgICAgICBwcmVjaXNpb246IHR5cGVvZiBvcHRpb25zPy5wcmVjaXNpb24gPT09IFwidW5kZWZpbmVkXCIgPyBudWxsIDogb3B0aW9ucz8ucHJlY2lzaW9uLFxuICAgICAgICAgICAgb2Zmc2V0OiBvcHRpb25zPy5vZmZzZXQgPz8gZmFsc2UsXG4gICAgICAgICAgICBsb2NhbDogb3B0aW9ucz8ubG9jYWwgPz8gZmFsc2UsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucz8ubWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBkYXRlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJkYXRlXCIsIG1lc3NhZ2UgfSk7XG4gICAgfVxuICAgIHRpbWUob3B0aW9ucykge1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICAgICAga2luZDogXCJ0aW1lXCIsXG4gICAgICAgICAgICAgICAgcHJlY2lzaW9uOiBudWxsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG9wdGlvbnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJ0aW1lXCIsXG4gICAgICAgICAgICBwcmVjaXNpb246IHR5cGVvZiBvcHRpb25zPy5wcmVjaXNpb24gPT09IFwidW5kZWZpbmVkXCIgPyBudWxsIDogb3B0aW9ucz8ucHJlY2lzaW9uLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG9wdGlvbnM/Lm1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZHVyYXRpb24obWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImR1cmF0aW9uXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgcmVnZXgocmVnZXgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwicmVnZXhcIixcbiAgICAgICAgICAgIHJlZ2V4OiByZWdleCxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGluY2x1ZGVzKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImluY2x1ZGVzXCIsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBwb3NpdGlvbjogb3B0aW9ucz8ucG9zaXRpb24sXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucz8ubWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdGFydHNXaXRoKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcInN0YXJ0c1dpdGhcIixcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVuZHNXaXRoKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImVuZHNXaXRoXCIsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtaW4obWluTGVuZ3RoLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IG1pbkxlbmd0aCxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1heChtYXhMZW5ndGgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICB2YWx1ZTogbWF4TGVuZ3RoLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbGVuZ3RoKGxlbiwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJsZW5ndGhcIixcbiAgICAgICAgICAgIHZhbHVlOiBsZW4sXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFcXVpdmFsZW50IHRvIGAubWluKDEpYFxuICAgICAqL1xuICAgIG5vbmVtcHR5KG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluKDEsIGVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSk7XG4gICAgfVxuICAgIHRyaW0oKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kU3RyaW5nKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogWy4uLnRoaXMuX2RlZi5jaGVja3MsIHsga2luZDogXCJ0cmltXCIgfV0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB0b0xvd2VyQ2FzZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTdHJpbmcoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgeyBraW5kOiBcInRvTG93ZXJDYXNlXCIgfV0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB0b1VwcGVyQ2FzZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTdHJpbmcoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgeyBraW5kOiBcInRvVXBwZXJDYXNlXCIgfV0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQgaXNEYXRldGltZSgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJkYXRldGltZVwiKTtcbiAgICB9XG4gICAgZ2V0IGlzRGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJkYXRlXCIpO1xuICAgIH1cbiAgICBnZXQgaXNUaW1lKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcInRpbWVcIik7XG4gICAgfVxuICAgIGdldCBpc0R1cmF0aW9uKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImR1cmF0aW9uXCIpO1xuICAgIH1cbiAgICBnZXQgaXNFbWFpbCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJlbWFpbFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzVVJMKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcInVybFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzRW1vamkoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiZW1vamlcIik7XG4gICAgfVxuICAgIGdldCBpc1VVSUQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwidXVpZFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzTkFOT0lEKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcIm5hbm9pZFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzQ1VJRCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJjdWlkXCIpO1xuICAgIH1cbiAgICBnZXQgaXNDVUlEMigpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJjdWlkMlwiKTtcbiAgICB9XG4gICAgZ2V0IGlzVUxJRCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJ1bGlkXCIpO1xuICAgIH1cbiAgICBnZXQgaXNJUCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJpcFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzQ0lEUigpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJjaWRyXCIpO1xuICAgIH1cbiAgICBnZXQgaXNCYXNlNjQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiYmFzZTY0XCIpO1xuICAgIH1cbiAgICBnZXQgaXNCYXNlNjR1cmwoKSB7XG4gICAgICAgIC8vIGJhc2U2NHVybCBlbmNvZGluZyBpcyBhIG1vZGlmaWNhdGlvbiBvZiBiYXNlNjQgdGhhdCBjYW4gc2FmZWx5IGJlIHVzZWQgaW4gVVJMcyBhbmQgZmlsZW5hbWVzXG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiYmFzZTY0dXJsXCIpO1xuICAgIH1cbiAgICBnZXQgbWluTGVuZ3RoKCkge1xuICAgICAgICBsZXQgbWluID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChtaW4gPT09IG51bGwgfHwgY2gudmFsdWUgPiBtaW4pXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtaW47XG4gICAgfVxuICAgIGdldCBtYXhMZW5ndGgoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9XG59XG5ab2RTdHJpbmcuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kU3RyaW5nKHtcbiAgICAgICAgY2hlY2tzOiBbXSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RTdHJpbmcsXG4gICAgICAgIGNvZXJjZTogcGFyYW1zPy5jb2VyY2UgPz8gZmFsc2UsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zOTY2NDg0L3doeS1kb2VzLW1vZHVsdXMtb3BlcmF0b3ItcmV0dXJuLWZyYWN0aW9uYWwtbnVtYmVyLWluLWphdmFzY3JpcHQvMzE3MTEwMzQjMzE3MTEwMzRcbmZ1bmN0aW9uIGZsb2F0U2FmZVJlbWFpbmRlcih2YWwsIHN0ZXApIHtcbiAgICBjb25zdCB2YWxEZWNDb3VudCA9ICh2YWwudG9TdHJpbmcoKS5zcGxpdChcIi5cIilbMV0gfHwgXCJcIikubGVuZ3RoO1xuICAgIGNvbnN0IHN0ZXBEZWNDb3VudCA9IChzdGVwLnRvU3RyaW5nKCkuc3BsaXQoXCIuXCIpWzFdIHx8IFwiXCIpLmxlbmd0aDtcbiAgICBjb25zdCBkZWNDb3VudCA9IHZhbERlY0NvdW50ID4gc3RlcERlY0NvdW50ID8gdmFsRGVjQ291bnQgOiBzdGVwRGVjQ291bnQ7XG4gICAgY29uc3QgdmFsSW50ID0gTnVtYmVyLnBhcnNlSW50KHZhbC50b0ZpeGVkKGRlY0NvdW50KS5yZXBsYWNlKFwiLlwiLCBcIlwiKSk7XG4gICAgY29uc3Qgc3RlcEludCA9IE51bWJlci5wYXJzZUludChzdGVwLnRvRml4ZWQoZGVjQ291bnQpLnJlcGxhY2UoXCIuXCIsIFwiXCIpKTtcbiAgICByZXR1cm4gKHZhbEludCAlIHN0ZXBJbnQpIC8gMTAgKiogZGVjQ291bnQ7XG59XG5leHBvcnQgY2xhc3MgWm9kTnVtYmVyIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMubWluID0gdGhpcy5ndGU7XG4gICAgICAgIHRoaXMubWF4ID0gdGhpcy5sdGU7XG4gICAgICAgIHRoaXMuc3RlcCA9IHRoaXMubXVsdGlwbGVPZjtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY29lcmNlKSB7XG4gICAgICAgICAgICBpbnB1dC5kYXRhID0gTnVtYmVyKGlucHV0LmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUubnVtYmVyKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm51bWJlcixcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjdHggPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IG5ldyBQYXJzZVN0YXR1cygpO1xuICAgICAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaGVjay5raW5kID09PSBcImludFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF1dGlsLmlzSW50ZWdlcihpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFwiaW50ZWdlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IFwiZmxvYXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBjaGVjay5pbmNsdXNpdmUgPyBpbnB1dC5kYXRhIDwgY2hlY2sudmFsdWUgOiBpbnB1dC5kYXRhIDw9IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29TbWFsbCkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiBjaGVjay5pbmNsdXNpdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb0JpZyA9IGNoZWNrLmluY2x1c2l2ZSA/IGlucHV0LmRhdGEgPiBjaGVjay52YWx1ZSA6IGlucHV0LmRhdGEgPj0gY2hlY2sudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHRvb0JpZykge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogY2hlY2suaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZsb2F0U2FmZVJlbWFpbmRlcihpbnB1dC5kYXRhLCBjaGVjay52YWx1ZSkgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLm5vdF9tdWx0aXBsZV9vZixcbiAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpcGxlT2Y6IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZmluaXRlXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUubm90X2Zpbml0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGNoZWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGlucHV0LmRhdGEgfTtcbiAgICB9XG4gICAgZ3RlKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWluXCIsIHZhbHVlLCB0cnVlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBndCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1pblwiLCB2YWx1ZSwgZmFsc2UsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIGx0ZSh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1heFwiLCB2YWx1ZSwgdHJ1ZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgbHQodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtYXhcIiwgdmFsdWUsIGZhbHNlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBzZXRMaW1pdChraW5kLCB2YWx1ZSwgaW5jbHVzaXZlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kTnVtYmVyKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogW1xuICAgICAgICAgICAgICAgIC4uLnRoaXMuX2RlZi5jaGVja3MsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBraW5kLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfYWRkQ2hlY2soY2hlY2spIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2ROdW1iZXIoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgY2hlY2tdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW50KG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwiaW50XCIsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IGZhbHNlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbmVnYXRpdmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtYXhcIixcbiAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbnBvc2l0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbm5lZ2F0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG11bHRpcGxlT2YodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibXVsdGlwbGVPZlwiLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZmluaXRlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwiZmluaXRlXCIsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzYWZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0IG1pblZhbHVlKCkge1xuICAgICAgICBsZXQgbWluID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChtaW4gPT09IG51bGwgfHwgY2gudmFsdWUgPiBtaW4pXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtaW47XG4gICAgfVxuICAgIGdldCBtYXhWYWx1ZSgpIHtcbiAgICAgICAgbGV0IG1heCA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWF4ID09PSBudWxsIHx8IGNoLnZhbHVlIDwgbWF4KVxuICAgICAgICAgICAgICAgICAgICBtYXggPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF4O1xuICAgIH1cbiAgICBnZXQgaXNJbnQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiaW50XCIgfHwgKGNoLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiICYmIHV0aWwuaXNJbnRlZ2VyKGNoLnZhbHVlKSkpO1xuICAgIH1cbiAgICBnZXQgaXNGaW5pdGUoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBsZXQgbWluID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJmaW5pdGVcIiB8fCBjaC5raW5kID09PSBcImludFwiIHx8IGNoLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaC5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pbiA9PT0gbnVsbCB8fCBjaC52YWx1ZSA+IG1pbilcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZShtaW4pICYmIE51bWJlci5pc0Zpbml0ZShtYXgpO1xuICAgIH1cbn1cblpvZE51bWJlci5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2ROdW1iZXIoe1xuICAgICAgICBjaGVja3M6IFtdLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE51bWJlcixcbiAgICAgICAgY29lcmNlOiBwYXJhbXM/LmNvZXJjZSB8fCBmYWxzZSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RCaWdJbnQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5taW4gPSB0aGlzLmd0ZTtcbiAgICAgICAgdGhpcy5tYXggPSB0aGlzLmx0ZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY29lcmNlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlucHV0LmRhdGEgPSBCaWdJbnQoaW5wdXQuZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldEludmFsaWRJbnB1dChpbnB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5iaWdpbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRJbnZhbGlkSW5wdXQoaW5wdXQpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjdHggPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IG5ldyBQYXJzZVN0YXR1cygpO1xuICAgICAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaGVjay5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBjaGVjay5pbmNsdXNpdmUgPyBpbnB1dC5kYXRhIDwgY2hlY2sudmFsdWUgOiBpbnB1dC5kYXRhIDw9IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29TbWFsbCkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJiaWdpbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiBjaGVjay5pbmNsdXNpdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb0JpZyA9IGNoZWNrLmluY2x1c2l2ZSA/IGlucHV0LmRhdGEgPiBjaGVjay52YWx1ZSA6IGlucHV0LmRhdGEgPj0gY2hlY2sudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHRvb0JpZykge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYmlnaW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogY2hlY2suaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEgJSBjaGVjay52YWx1ZSAhPT0gQmlnSW50KDApKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5ub3RfbXVsdGlwbGVfb2YsXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZU9mOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGNoZWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGlucHV0LmRhdGEgfTtcbiAgICB9XG4gICAgX2dldEludmFsaWRJbnB1dChpbnB1dCkge1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmJpZ2ludCxcbiAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgIH1cbiAgICBndGUodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtaW5cIiwgdmFsdWUsIHRydWUsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIGd0KHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWluXCIsIHZhbHVlLCBmYWxzZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgbHRlKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWF4XCIsIHZhbHVlLCB0cnVlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBsdCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1heFwiLCB2YWx1ZSwgZmFsc2UsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIHNldExpbWl0KGtpbmQsIHZhbHVlLCBpbmNsdXNpdmUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RCaWdJbnQoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbXG4gICAgICAgICAgICAgICAgLi4udGhpcy5fZGVmLmNoZWNrcyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtpbmQsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9hZGRDaGVjayhjaGVjaykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEJpZ0ludCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCBjaGVja10sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBuZWdhdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBub25wb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbm5lZ2F0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICB2YWx1ZTogQmlnSW50KDApLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbXVsdGlwbGVPZih2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtdWx0aXBsZU9mXCIsXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldCBtaW5WYWx1ZSgpIHtcbiAgICAgICAgbGV0IG1pbiA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWluID09PSBudWxsIHx8IGNoLnZhbHVlID4gbWluKVxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWluO1xuICAgIH1cbiAgICBnZXQgbWF4VmFsdWUoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9XG59XG5ab2RCaWdJbnQuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kQmlnSW50KHtcbiAgICAgICAgY2hlY2tzOiBbXSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RCaWdJbnQsXG4gICAgICAgIGNvZXJjZTogcGFyYW1zPy5jb2VyY2UgPz8gZmFsc2UsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kQm9vbGVhbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5fZGVmLmNvZXJjZSkge1xuICAgICAgICAgICAgaW5wdXQuZGF0YSA9IEJvb2xlYW4oaW5wdXQuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5ib29sZWFuKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmJvb2xlYW4sXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuWm9kQm9vbGVhbi5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RCb29sZWFuKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RCb29sZWFuLFxuICAgICAgICBjb2VyY2U6IHBhcmFtcz8uY29lcmNlIHx8IGZhbHNlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZERhdGUgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RlZi5jb2VyY2UpIHtcbiAgICAgICAgICAgIGlucHV0LmRhdGEgPSBuZXcgRGF0ZShpbnB1dC5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLmRhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuZGF0ZSxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmIChOdW1iZXIuaXNOYU4oaW5wdXQuZGF0YS5nZXRUaW1lKCkpKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9kYXRlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdGF0dXMgPSBuZXcgUGFyc2VTdGF0dXMoKTtcbiAgICAgICAgbGV0IGN0eCA9IHVuZGVmaW5lZDtcbiAgICAgICAgZm9yIChjb25zdCBjaGVjayBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2sua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5kYXRhLmdldFRpbWUoKSA8IGNoZWNrLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuZGF0YS5nZXRUaW1lKCkgPiBjaGVjay52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdXRpbC5hc3NlcnROZXZlcihjaGVjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLnZhbHVlLFxuICAgICAgICAgICAgdmFsdWU6IG5ldyBEYXRlKGlucHV0LmRhdGEuZ2V0VGltZSgpKSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgX2FkZENoZWNrKGNoZWNrKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRGF0ZSh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCBjaGVja10sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtaW4obWluRGF0ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtaW5cIixcbiAgICAgICAgICAgIHZhbHVlOiBtaW5EYXRlLmdldFRpbWUoKSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1heChtYXhEYXRlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IG1heERhdGUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0IG1pbkRhdGUoKSB7XG4gICAgICAgIGxldCBtaW4gPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pbiA9PT0gbnVsbCB8fCBjaC52YWx1ZSA+IG1pbilcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pbiAhPSBudWxsID8gbmV3IERhdGUobWluKSA6IG51bGw7XG4gICAgfVxuICAgIGdldCBtYXhEYXRlKCkge1xuICAgICAgICBsZXQgbWF4ID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGlmIChtYXggPT09IG51bGwgfHwgY2gudmFsdWUgPCBtYXgpXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXggIT0gbnVsbCA/IG5ldyBEYXRlKG1heCkgOiBudWxsO1xuICAgIH1cbn1cblpvZERhdGUuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kRGF0ZSh7XG4gICAgICAgIGNoZWNrczogW10sXG4gICAgICAgIGNvZXJjZTogcGFyYW1zPy5jb2VyY2UgfHwgZmFsc2UsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRGF0ZSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RTeW1ib2wgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5zeW1ib2wpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuc3ltYm9sLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZFN5bWJvbC5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RTeW1ib2woe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFN5bWJvbCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RVbmRlZmluZWQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS51bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZFVuZGVmaW5lZC5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RVbmRlZmluZWQoe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFVuZGVmaW5lZCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2ROdWxsIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUubnVsbCkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5udWxsLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZE51bGwuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTnVsbCh7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTnVsbCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RBbnkgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgLy8gdG8gcHJldmVudCBpbnN0YW5jZXMgb2Ygb3RoZXIgY2xhc3NlcyBmcm9tIGV4dGVuZGluZyBab2RBbnkuIHRoaXMgY2F1c2VzIGlzc3VlcyB3aXRoIGNhdGNoYWxsIGluIFpvZE9iamVjdC5cbiAgICAgICAgdGhpcy5fYW55ID0gdHJ1ZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG59XG5ab2RBbnkuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kQW55KHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RBbnksXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kVW5rbm93biBleHRlbmRzIFpvZFR5cGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICAvLyByZXF1aXJlZFxuICAgICAgICB0aGlzLl91bmtub3duID0gdHJ1ZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG59XG5ab2RVbmtub3duLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFVua25vd24oe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFVua25vd24sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kTmV2ZXIgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5uZXZlcixcbiAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgIH1cbn1cblpvZE5ldmVyLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE5ldmVyKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2ROZXZlcixcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RWb2lkIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLnZvaWQsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuWm9kVm9pZC5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RWb2lkKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RWb2lkLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZEFycmF5IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4LCBzdGF0dXMgfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGRlZiA9IHRoaXMuX2RlZjtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLmFycmF5KSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmFycmF5LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZi5leGFjdExlbmd0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgdG9vQmlnID0gY3R4LmRhdGEubGVuZ3RoID4gZGVmLmV4YWN0TGVuZ3RoLnZhbHVlO1xuICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBjdHguZGF0YS5sZW5ndGggPCBkZWYuZXhhY3RMZW5ndGgudmFsdWU7XG4gICAgICAgICAgICBpZiAodG9vQmlnIHx8IHRvb1NtYWxsKSB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IHRvb0JpZyA/IFpvZElzc3VlQ29kZS50b29fYmlnIDogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgbWluaW11bTogKHRvb1NtYWxsID8gZGVmLmV4YWN0TGVuZ3RoLnZhbHVlIDogdW5kZWZpbmVkKSxcbiAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogKHRvb0JpZyA/IGRlZi5leGFjdExlbmd0aC52YWx1ZSA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGVmLmV4YWN0TGVuZ3RoLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZi5taW5MZW5ndGggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjdHguZGF0YS5sZW5ndGggPCBkZWYubWluTGVuZ3RoLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGRlZi5taW5MZW5ndGgudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5taW5MZW5ndGgubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVmLm1heExlbmd0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGN0eC5kYXRhLmxlbmd0aCA+IGRlZi5tYXhMZW5ndGgudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgIG1heGltdW06IGRlZi5tYXhMZW5ndGgudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5tYXhMZW5ndGgubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFsuLi5jdHguZGF0YV0ubWFwKChpdGVtLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZi50eXBlLl9wYXJzZUFzeW5jKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBpdGVtLCBjdHgucGF0aCwgaSkpO1xuICAgICAgICAgICAgfSkpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgcmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFsuLi5jdHguZGF0YV0ubWFwKChpdGVtLCBpKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZGVmLnR5cGUuX3BhcnNlU3luYyhuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgaXRlbSwgY3R4LnBhdGgsIGkpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgcmVzdWx0KTtcbiAgICB9XG4gICAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudHlwZTtcbiAgICB9XG4gICAgbWluKG1pbkxlbmd0aCwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEFycmF5KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIG1pbkxlbmd0aDogeyB2YWx1ZTogbWluTGVuZ3RoLCBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1heChtYXhMZW5ndGgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RBcnJheSh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBtYXhMZW5ndGg6IHsgdmFsdWU6IG1heExlbmd0aCwgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBsZW5ndGgobGVuLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQXJyYXkoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgZXhhY3RMZW5ndGg6IHsgdmFsdWU6IGxlbiwgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBub25lbXB0eShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbigxLCBtZXNzYWdlKTtcbiAgICB9XG59XG5ab2RBcnJheS5jcmVhdGUgPSAoc2NoZW1hLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEFycmF5KHtcbiAgICAgICAgdHlwZTogc2NoZW1hLFxuICAgICAgICBtaW5MZW5ndGg6IG51bGwsXG4gICAgICAgIG1heExlbmd0aDogbnVsbCxcbiAgICAgICAgZXhhY3RMZW5ndGg6IG51bGwsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQXJyYXksXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5mdW5jdGlvbiBkZWVwUGFydGlhbGlmeShzY2hlbWEpIHtcbiAgICBpZiAoc2NoZW1hIGluc3RhbmNlb2YgWm9kT2JqZWN0KSB7XG4gICAgICAgIGNvbnN0IG5ld1NoYXBlID0ge307XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNjaGVtYS5zaGFwZSkge1xuICAgICAgICAgICAgY29uc3QgZmllbGRTY2hlbWEgPSBzY2hlbWEuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIG5ld1NoYXBlW2tleV0gPSBab2RPcHRpb25hbC5jcmVhdGUoZGVlcFBhcnRpYWxpZnkoZmllbGRTY2hlbWEpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi5zY2hlbWEuX2RlZixcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiBuZXdTaGFwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHNjaGVtYSBpbnN0YW5jZW9mIFpvZEFycmF5KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQXJyYXkoe1xuICAgICAgICAgICAgLi4uc2NoZW1hLl9kZWYsXG4gICAgICAgICAgICB0eXBlOiBkZWVwUGFydGlhbGlmeShzY2hlbWEuZWxlbWVudCksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2RPcHRpb25hbCkge1xuICAgICAgICByZXR1cm4gWm9kT3B0aW9uYWwuY3JlYXRlKGRlZXBQYXJ0aWFsaWZ5KHNjaGVtYS51bndyYXAoKSkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2ROdWxsYWJsZSkge1xuICAgICAgICByZXR1cm4gWm9kTnVsbGFibGUuY3JlYXRlKGRlZXBQYXJ0aWFsaWZ5KHNjaGVtYS51bndyYXAoKSkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2RUdXBsZSkge1xuICAgICAgICByZXR1cm4gWm9kVHVwbGUuY3JlYXRlKHNjaGVtYS5pdGVtcy5tYXAoKGl0ZW0pID0+IGRlZXBQYXJ0aWFsaWZ5KGl0ZW0pKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gc2NoZW1hO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RPYmplY3QgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5fY2FjaGVkID0gbnVsbDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBkZXByZWNhdGVkIEluIG1vc3QgY2FzZXMsIHRoaXMgaXMgbm8gbG9uZ2VyIG5lZWRlZCAtIHVua25vd24gcHJvcGVydGllcyBhcmUgbm93IHNpbGVudGx5IHN0cmlwcGVkLlxuICAgICAgICAgKiBJZiB5b3Ugd2FudCB0byBwYXNzIHRocm91Z2ggdW5rbm93biBwcm9wZXJ0aWVzLCB1c2UgYC5wYXNzdGhyb3VnaCgpYCBpbnN0ZWFkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ub25zdHJpY3QgPSB0aGlzLnBhc3N0aHJvdWdoO1xuICAgICAgICAvLyBleHRlbmQ8XG4gICAgICAgIC8vICAgQXVnbWVudGF0aW9uIGV4dGVuZHMgWm9kUmF3U2hhcGUsXG4gICAgICAgIC8vICAgTmV3T3V0cHV0IGV4dGVuZHMgdXRpbC5mbGF0dGVuPHtcbiAgICAgICAgLy8gICAgIFtrIGluIGtleW9mIEF1Z21lbnRhdGlvbiB8IGtleW9mIE91dHB1dF06IGsgZXh0ZW5kcyBrZXlvZiBBdWdtZW50YXRpb25cbiAgICAgICAgLy8gICAgICAgPyBBdWdtZW50YXRpb25ba11bXCJfb3V0cHV0XCJdXG4gICAgICAgIC8vICAgICAgIDogayBleHRlbmRzIGtleW9mIE91dHB1dFxuICAgICAgICAvLyAgICAgICA/IE91dHB1dFtrXVxuICAgICAgICAvLyAgICAgICA6IG5ldmVyO1xuICAgICAgICAvLyAgIH0+LFxuICAgICAgICAvLyAgIE5ld0lucHV0IGV4dGVuZHMgdXRpbC5mbGF0dGVuPHtcbiAgICAgICAgLy8gICAgIFtrIGluIGtleW9mIEF1Z21lbnRhdGlvbiB8IGtleW9mIElucHV0XTogayBleHRlbmRzIGtleW9mIEF1Z21lbnRhdGlvblxuICAgICAgICAvLyAgICAgICA/IEF1Z21lbnRhdGlvbltrXVtcIl9pbnB1dFwiXVxuICAgICAgICAvLyAgICAgICA6IGsgZXh0ZW5kcyBrZXlvZiBJbnB1dFxuICAgICAgICAvLyAgICAgICA/IElucHV0W2tdXG4gICAgICAgIC8vICAgICAgIDogbmV2ZXI7XG4gICAgICAgIC8vICAgfT5cbiAgICAgICAgLy8gPihcbiAgICAgICAgLy8gICBhdWdtZW50YXRpb246IEF1Z21lbnRhdGlvblxuICAgICAgICAvLyApOiBab2RPYmplY3Q8XG4gICAgICAgIC8vICAgZXh0ZW5kU2hhcGU8VCwgQXVnbWVudGF0aW9uPixcbiAgICAgICAgLy8gICBVbmtub3duS2V5cyxcbiAgICAgICAgLy8gICBDYXRjaGFsbCxcbiAgICAgICAgLy8gICBOZXdPdXRwdXQsXG4gICAgICAgIC8vICAgTmV3SW5wdXRcbiAgICAgICAgLy8gPiB7XG4gICAgICAgIC8vICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAvLyAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAvLyAgICAgc2hhcGU6ICgpID0+ICh7XG4gICAgICAgIC8vICAgICAgIC4uLnRoaXMuX2RlZi5zaGFwZSgpLFxuICAgICAgICAvLyAgICAgICAuLi5hdWdtZW50YXRpb24sXG4gICAgICAgIC8vICAgICB9KSxcbiAgICAgICAgLy8gICB9KSBhcyBhbnk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBkZXByZWNhdGVkIFVzZSBgLmV4dGVuZGAgaW5zdGVhZFxuICAgICAgICAgKiAgKi9cbiAgICAgICAgdGhpcy5hdWdtZW50ID0gdGhpcy5leHRlbmQ7XG4gICAgfVxuICAgIF9nZXRDYWNoZWQoKSB7XG4gICAgICAgIGlmICh0aGlzLl9jYWNoZWQgIT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkO1xuICAgICAgICBjb25zdCBzaGFwZSA9IHRoaXMuX2RlZi5zaGFwZSgpO1xuICAgICAgICBjb25zdCBrZXlzID0gdXRpbC5vYmplY3RLZXlzKHNoYXBlKTtcbiAgICAgICAgdGhpcy5fY2FjaGVkID0geyBzaGFwZSwga2V5cyB9O1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5vYmplY3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUub2JqZWN0LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3QgeyBzaGFwZSwga2V5czogc2hhcGVLZXlzIH0gPSB0aGlzLl9nZXRDYWNoZWQoKTtcbiAgICAgICAgY29uc3QgZXh0cmFLZXlzID0gW107XG4gICAgICAgIGlmICghKHRoaXMuX2RlZi5jYXRjaGFsbCBpbnN0YW5jZW9mIFpvZE5ldmVyICYmIHRoaXMuX2RlZi51bmtub3duS2V5cyA9PT0gXCJzdHJpcFwiKSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gY3R4LmRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNoYXBlS2V5cy5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dHJhS2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhaXJzID0gW107XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHNoYXBlS2V5cykge1xuICAgICAgICAgICAgY29uc3Qga2V5VmFsaWRhdG9yID0gc2hhcGVba2V5XTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY3R4LmRhdGFba2V5XTtcbiAgICAgICAgICAgIHBhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgIGtleTogeyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGtleSB9LFxuICAgICAgICAgICAgICAgIHZhbHVlOiBrZXlWYWxpZGF0b3IuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCB2YWx1ZSwgY3R4LnBhdGgsIGtleSkpLFxuICAgICAgICAgICAgICAgIGFsd2F5c1NldDoga2V5IGluIGN0eC5kYXRhLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2RlZi5jYXRjaGFsbCBpbnN0YW5jZW9mIFpvZE5ldmVyKSB7XG4gICAgICAgICAgICBjb25zdCB1bmtub3duS2V5cyA9IHRoaXMuX2RlZi51bmtub3duS2V5cztcbiAgICAgICAgICAgIGlmICh1bmtub3duS2V5cyA9PT0gXCJwYXNzdGhyb3VnaFwiKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgZXh0cmFLZXlzKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiB7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZToga2V5IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogeyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGN0eC5kYXRhW2tleV0gfSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodW5rbm93bktleXMgPT09IFwic3RyaWN0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXh0cmFLZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudW5yZWNvZ25pemVkX2tleXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlzOiBleHRyYUtleXMsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh1bmtub3duS2V5cyA9PT0gXCJzdHJpcFwiKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludGVybmFsIFpvZE9iamVjdCBlcnJvcjogaW52YWxpZCB1bmtub3duS2V5cyB2YWx1ZS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHJ1biBjYXRjaGFsbCB2YWxpZGF0aW9uXG4gICAgICAgICAgICBjb25zdCBjYXRjaGFsbCA9IHRoaXMuX2RlZi5jYXRjaGFsbDtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGV4dHJhS2V5cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY3R4LmRhdGFba2V5XTtcbiAgICAgICAgICAgICAgICBwYWlycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiB7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZToga2V5IH0sXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjYXRjaGFsbC5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIHZhbHVlLCBjdHgucGF0aCwga2V5KSAvLywgY3R4LmNoaWxkKGtleSksIHZhbHVlLCBnZXRQYXJzZWRUeXBlKHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBhbHdheXNTZXQ6IGtleSBpbiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgICAgICAgLnRoZW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN5bmNQYWlycyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBwYWlyLmtleTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBhd2FpdCBwYWlyLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBzeW5jUGFpcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsd2F5c1NldDogcGFpci5hbHdheXNTZXQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gc3luY1BhaXJzO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbigoc3luY1BhaXJzKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFBhcnNlU3RhdHVzLm1lcmdlT2JqZWN0U3luYyhzdGF0dXMsIHN5bmNQYWlycyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZU9iamVjdFN5bmMoc3RhdHVzLCBwYWlycyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IHNoYXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnNoYXBlKCk7XG4gICAgfVxuICAgIHN0cmljdChtZXNzYWdlKSB7XG4gICAgICAgIGVycm9yVXRpbC5lcnJUb09iajtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgdW5rbm93bktleXM6IFwic3RyaWN0XCIsXG4gICAgICAgICAgICAuLi4obWVzc2FnZSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWFwOiAoaXNzdWUsIGN0eCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVmYXVsdEVycm9yID0gdGhpcy5fZGVmLmVycm9yTWFwPy4oaXNzdWUsIGN0eCkubWVzc2FnZSA/PyBjdHguZGVmYXVsdEVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzc3VlLmNvZGUgPT09IFwidW5yZWNvZ25pemVkX2tleXNcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkubWVzc2FnZSA/PyBkZWZhdWx0RXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGVmYXVsdEVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgOiB7fSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdHJpcCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgdW5rbm93bktleXM6IFwic3RyaXBcIixcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBhc3N0aHJvdWdoKCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICB1bmtub3duS2V5czogXCJwYXNzdGhyb3VnaFwiLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gY29uc3QgQXVnbWVudEZhY3RvcnkgPVxuICAgIC8vICAgPERlZiBleHRlbmRzIFpvZE9iamVjdERlZj4oZGVmOiBEZWYpID0+XG4gICAgLy8gICA8QXVnbWVudGF0aW9uIGV4dGVuZHMgWm9kUmF3U2hhcGU+KFxuICAgIC8vICAgICBhdWdtZW50YXRpb246IEF1Z21lbnRhdGlvblxuICAgIC8vICAgKTogWm9kT2JqZWN0PFxuICAgIC8vICAgICBleHRlbmRTaGFwZTxSZXR1cm5UeXBlPERlZltcInNoYXBlXCJdPiwgQXVnbWVudGF0aW9uPixcbiAgICAvLyAgICAgRGVmW1widW5rbm93bktleXNcIl0sXG4gICAgLy8gICAgIERlZltcImNhdGNoYWxsXCJdXG4gICAgLy8gICA+ID0+IHtcbiAgICAvLyAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgIC8vICAgICAgIC4uLmRlZixcbiAgICAvLyAgICAgICBzaGFwZTogKCkgPT4gKHtcbiAgICAvLyAgICAgICAgIC4uLmRlZi5zaGFwZSgpLFxuICAgIC8vICAgICAgICAgLi4uYXVnbWVudGF0aW9uLFxuICAgIC8vICAgICAgIH0pLFxuICAgIC8vICAgICB9KSBhcyBhbnk7XG4gICAgLy8gICB9O1xuICAgIGV4dGVuZChhdWdtZW50YXRpb24pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+ICh7XG4gICAgICAgICAgICAgICAgLi4udGhpcy5fZGVmLnNoYXBlKCksXG4gICAgICAgICAgICAgICAgLi4uYXVnbWVudGF0aW9uLFxuICAgICAgICAgICAgfSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcmlvciB0byB6b2RAMS4wLjEyIHRoZXJlIHdhcyBhIGJ1ZyBpbiB0aGVcbiAgICAgKiBpbmZlcnJlZCB0eXBlIG9mIG1lcmdlZCBvYmplY3RzLiBQbGVhc2VcbiAgICAgKiB1cGdyYWRlIGlmIHlvdSBhcmUgZXhwZXJpZW5jaW5nIGlzc3Vlcy5cbiAgICAgKi9cbiAgICBtZXJnZShtZXJnaW5nKSB7XG4gICAgICAgIGNvbnN0IG1lcmdlZCA9IG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgdW5rbm93bktleXM6IG1lcmdpbmcuX2RlZi51bmtub3duS2V5cyxcbiAgICAgICAgICAgIGNhdGNoYWxsOiBtZXJnaW5nLl9kZWYuY2F0Y2hhbGwsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi50aGlzLl9kZWYuc2hhcGUoKSxcbiAgICAgICAgICAgICAgICAuLi5tZXJnaW5nLl9kZWYuc2hhcGUoKSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbWVyZ2VkO1xuICAgIH1cbiAgICAvLyBtZXJnZTxcbiAgICAvLyAgIEluY29taW5nIGV4dGVuZHMgQW55Wm9kT2JqZWN0LFxuICAgIC8vICAgQXVnbWVudGF0aW9uIGV4dGVuZHMgSW5jb21pbmdbXCJzaGFwZVwiXSxcbiAgICAvLyAgIE5ld091dHB1dCBleHRlbmRzIHtcbiAgICAvLyAgICAgW2sgaW4ga2V5b2YgQXVnbWVudGF0aW9uIHwga2V5b2YgT3V0cHV0XTogayBleHRlbmRzIGtleW9mIEF1Z21lbnRhdGlvblxuICAgIC8vICAgICAgID8gQXVnbWVudGF0aW9uW2tdW1wiX291dHB1dFwiXVxuICAgIC8vICAgICAgIDogayBleHRlbmRzIGtleW9mIE91dHB1dFxuICAgIC8vICAgICAgID8gT3V0cHV0W2tdXG4gICAgLy8gICAgICAgOiBuZXZlcjtcbiAgICAvLyAgIH0sXG4gICAgLy8gICBOZXdJbnB1dCBleHRlbmRzIHtcbiAgICAvLyAgICAgW2sgaW4ga2V5b2YgQXVnbWVudGF0aW9uIHwga2V5b2YgSW5wdXRdOiBrIGV4dGVuZHMga2V5b2YgQXVnbWVudGF0aW9uXG4gICAgLy8gICAgICAgPyBBdWdtZW50YXRpb25ba11bXCJfaW5wdXRcIl1cbiAgICAvLyAgICAgICA6IGsgZXh0ZW5kcyBrZXlvZiBJbnB1dFxuICAgIC8vICAgICAgID8gSW5wdXRba11cbiAgICAvLyAgICAgICA6IG5ldmVyO1xuICAgIC8vICAgfVxuICAgIC8vID4oXG4gICAgLy8gICBtZXJnaW5nOiBJbmNvbWluZ1xuICAgIC8vICk6IFpvZE9iamVjdDxcbiAgICAvLyAgIGV4dGVuZFNoYXBlPFQsIFJldHVyblR5cGU8SW5jb21pbmdbXCJfZGVmXCJdW1wic2hhcGVcIl0+PixcbiAgICAvLyAgIEluY29taW5nW1wiX2RlZlwiXVtcInVua25vd25LZXlzXCJdLFxuICAgIC8vICAgSW5jb21pbmdbXCJfZGVmXCJdW1wiY2F0Y2hhbGxcIl0sXG4gICAgLy8gICBOZXdPdXRwdXQsXG4gICAgLy8gICBOZXdJbnB1dFxuICAgIC8vID4ge1xuICAgIC8vICAgY29uc3QgbWVyZ2VkOiBhbnkgPSBuZXcgWm9kT2JqZWN0KHtcbiAgICAvLyAgICAgdW5rbm93bktleXM6IG1lcmdpbmcuX2RlZi51bmtub3duS2V5cyxcbiAgICAvLyAgICAgY2F0Y2hhbGw6IG1lcmdpbmcuX2RlZi5jYXRjaGFsbCxcbiAgICAvLyAgICAgc2hhcGU6ICgpID0+XG4gICAgLy8gICAgICAgb2JqZWN0VXRpbC5tZXJnZVNoYXBlcyh0aGlzLl9kZWYuc2hhcGUoKSwgbWVyZ2luZy5fZGVmLnNoYXBlKCkpLFxuICAgIC8vICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9iamVjdCxcbiAgICAvLyAgIH0pIGFzIGFueTtcbiAgICAvLyAgIHJldHVybiBtZXJnZWQ7XG4gICAgLy8gfVxuICAgIHNldEtleShrZXksIHNjaGVtYSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdWdtZW50KHsgW2tleV06IHNjaGVtYSB9KTtcbiAgICB9XG4gICAgLy8gbWVyZ2U8SW5jb21pbmcgZXh0ZW5kcyBBbnlab2RPYmplY3Q+KFxuICAgIC8vICAgbWVyZ2luZzogSW5jb21pbmdcbiAgICAvLyApOiAvL1pvZE9iamVjdDxUICYgSW5jb21pbmdbXCJfc2hhcGVcIl0sIFVua25vd25LZXlzLCBDYXRjaGFsbD4gPSAobWVyZ2luZykgPT4ge1xuICAgIC8vIFpvZE9iamVjdDxcbiAgICAvLyAgIGV4dGVuZFNoYXBlPFQsIFJldHVyblR5cGU8SW5jb21pbmdbXCJfZGVmXCJdW1wic2hhcGVcIl0+PixcbiAgICAvLyAgIEluY29taW5nW1wiX2RlZlwiXVtcInVua25vd25LZXlzXCJdLFxuICAgIC8vICAgSW5jb21pbmdbXCJfZGVmXCJdW1wiY2F0Y2hhbGxcIl1cbiAgICAvLyA+IHtcbiAgICAvLyAgIC8vIGNvbnN0IG1lcmdlZFNoYXBlID0gb2JqZWN0VXRpbC5tZXJnZVNoYXBlcyhcbiAgICAvLyAgIC8vICAgdGhpcy5fZGVmLnNoYXBlKCksXG4gICAgLy8gICAvLyAgIG1lcmdpbmcuX2RlZi5zaGFwZSgpXG4gICAgLy8gICAvLyApO1xuICAgIC8vICAgY29uc3QgbWVyZ2VkOiBhbnkgPSBuZXcgWm9kT2JqZWN0KHtcbiAgICAvLyAgICAgdW5rbm93bktleXM6IG1lcmdpbmcuX2RlZi51bmtub3duS2V5cyxcbiAgICAvLyAgICAgY2F0Y2hhbGw6IG1lcmdpbmcuX2RlZi5jYXRjaGFsbCxcbiAgICAvLyAgICAgc2hhcGU6ICgpID0+XG4gICAgLy8gICAgICAgb2JqZWN0VXRpbC5tZXJnZVNoYXBlcyh0aGlzLl9kZWYuc2hhcGUoKSwgbWVyZ2luZy5fZGVmLnNoYXBlKCkpLFxuICAgIC8vICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9iamVjdCxcbiAgICAvLyAgIH0pIGFzIGFueTtcbiAgICAvLyAgIHJldHVybiBtZXJnZWQ7XG4gICAgLy8gfVxuICAgIGNhdGNoYWxsKGluZGV4KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNhdGNoYWxsOiBpbmRleCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBpY2sobWFzaykge1xuICAgICAgICBjb25zdCBzaGFwZSA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB1dGlsLm9iamVjdEtleXMobWFzaykpIHtcbiAgICAgICAgICAgIGlmIChtYXNrW2tleV0gJiYgdGhpcy5zaGFwZVtrZXldKSB7XG4gICAgICAgICAgICAgICAgc2hhcGVba2V5XSA9IHRoaXMuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gc2hhcGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBvbWl0KG1hc2spIHtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdXRpbC5vYmplY3RLZXlzKHRoaXMuc2hhcGUpKSB7XG4gICAgICAgICAgICBpZiAoIW1hc2tba2V5XSkge1xuICAgICAgICAgICAgICAgIHNoYXBlW2tleV0gPSB0aGlzLnNoYXBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+IHNoYXBlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICBkZWVwUGFydGlhbCgpIHtcbiAgICAgICAgcmV0dXJuIGRlZXBQYXJ0aWFsaWZ5KHRoaXMpO1xuICAgIH1cbiAgICBwYXJ0aWFsKG1hc2spIHtcbiAgICAgICAgY29uc3QgbmV3U2hhcGUgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdXRpbC5vYmplY3RLZXlzKHRoaXMuc2hhcGUpKSB7XG4gICAgICAgICAgICBjb25zdCBmaWVsZFNjaGVtYSA9IHRoaXMuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIGlmIChtYXNrICYmICFtYXNrW2tleV0pIHtcbiAgICAgICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gZmllbGRTY2hlbWE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gZmllbGRTY2hlbWEub3B0aW9uYWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gbmV3U2hhcGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXF1aXJlZChtYXNrKSB7XG4gICAgICAgIGNvbnN0IG5ld1NoYXBlID0ge307XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHV0aWwub2JqZWN0S2V5cyh0aGlzLnNoYXBlKSkge1xuICAgICAgICAgICAgaWYgKG1hc2sgJiYgIW1hc2tba2V5XSkge1xuICAgICAgICAgICAgICAgIG5ld1NoYXBlW2tleV0gPSB0aGlzLnNoYXBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWVsZFNjaGVtYSA9IHRoaXMuc2hhcGVba2V5XTtcbiAgICAgICAgICAgICAgICBsZXQgbmV3RmllbGQgPSBmaWVsZFNjaGVtYTtcbiAgICAgICAgICAgICAgICB3aGlsZSAobmV3RmllbGQgaW5zdGFuY2VvZiBab2RPcHRpb25hbCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdGaWVsZCA9IG5ld0ZpZWxkLl9kZWYuaW5uZXJUeXBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gbmV3RmllbGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+IG5ld1NoYXBlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAga2V5b2YoKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVab2RFbnVtKHV0aWwub2JqZWN0S2V5cyh0aGlzLnNoYXBlKSk7XG4gICAgfVxufVxuWm9kT2JqZWN0LmNyZWF0ZSA9IChzaGFwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICBzaGFwZTogKCkgPT4gc2hhcGUsXG4gICAgICAgIHVua25vd25LZXlzOiBcInN0cmlwXCIsXG4gICAgICAgIGNhdGNoYWxsOiBab2ROZXZlci5jcmVhdGUoKSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5ab2RPYmplY3Quc3RyaWN0Q3JlYXRlID0gKHNoYXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgIHNoYXBlOiAoKSA9PiBzaGFwZSxcbiAgICAgICAgdW5rbm93bktleXM6IFwic3RyaWN0XCIsXG4gICAgICAgIGNhdGNoYWxsOiBab2ROZXZlci5jcmVhdGUoKSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5ab2RPYmplY3QubGF6eWNyZWF0ZSA9IChzaGFwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICBzaGFwZSxcbiAgICAgICAgdW5rbm93bktleXM6IFwic3RyaXBcIixcbiAgICAgICAgY2F0Y2hhbGw6IFpvZE5ldmVyLmNyZWF0ZSgpLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9iamVjdCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RVbmlvbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX2RlZi5vcHRpb25zO1xuICAgICAgICBmdW5jdGlvbiBoYW5kbGVSZXN1bHRzKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIC8vIHJldHVybiBmaXJzdCBpc3N1ZS1mcmVlIHZhbGlkYXRpb24gaWYgaXQgZXhpc3RzXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5yZXN1bHQuc3RhdHVzID09PSBcInZhbGlkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQucmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCBpc3N1ZXMgZnJvbSBkaXJ0eSBvcHRpb25cbiAgICAgICAgICAgICAgICAgICAgY3R4LmNvbW1vbi5pc3N1ZXMucHVzaCguLi5yZXN1bHQuY3R4LmNvbW1vbi5pc3N1ZXMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LnJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZXR1cm4gaW52YWxpZFxuICAgICAgICAgICAgY29uc3QgdW5pb25FcnJvcnMgPSByZXN1bHRzLm1hcCgocmVzdWx0KSA9PiBuZXcgWm9kRXJyb3IocmVzdWx0LmN0eC5jb21tb24uaXNzdWVzKSk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbixcbiAgICAgICAgICAgICAgICB1bmlvbkVycm9ycyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChvcHRpb25zLm1hcChhc3luYyAob3B0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRDdHggPSB7XG4gICAgICAgICAgICAgICAgICAgIC4uLmN0eCxcbiAgICAgICAgICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5jdHguY29tbW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBudWxsLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBhd2FpdCBvcHRpb24uX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogY2hpbGRDdHgsXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBjdHg6IGNoaWxkQ3R4LFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSkudGhlbihoYW5kbGVSZXN1bHRzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBkaXJ0eSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGNvbnN0IGlzc3VlcyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2Ygb3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkQ3R4ID0ge1xuICAgICAgICAgICAgICAgICAgICAuLi5jdHgsXG4gICAgICAgICAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uY3R4LmNvbW1vbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogbnVsbCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG9wdGlvbi5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGNoaWxkQ3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBcInZhbGlkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiICYmICFkaXJ0eSkge1xuICAgICAgICAgICAgICAgICAgICBkaXJ0eSA9IHsgcmVzdWx0LCBjdHg6IGNoaWxkQ3R4IH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjaGlsZEN0eC5jb21tb24uaXNzdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBpc3N1ZXMucHVzaChjaGlsZEN0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGlydHkpIHtcbiAgICAgICAgICAgICAgICBjdHguY29tbW9uLmlzc3Vlcy5wdXNoKC4uLmRpcnR5LmN0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlydHkucmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdW5pb25FcnJvcnMgPSBpc3N1ZXMubWFwKChpc3N1ZXMpID0+IG5ldyBab2RFcnJvcihpc3N1ZXMpKTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3VuaW9uLFxuICAgICAgICAgICAgICAgIHVuaW9uRXJyb3JzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgb3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vcHRpb25zO1xuICAgIH1cbn1cblpvZFVuaW9uLmNyZWF0ZSA9ICh0eXBlcywgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RVbmlvbih7XG4gICAgICAgIG9wdGlvbnM6IHR5cGVzLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFVuaW9uLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vLy8vLy8vL1xuLy8vLy8vLy8vLyAgICAgIFpvZERpc2NyaW1pbmF0ZWRVbmlvbiAgICAgIC8vLy8vLy8vLy9cbi8vLy8vLy8vLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmNvbnN0IGdldERpc2NyaW1pbmF0b3IgPSAodHlwZSkgPT4ge1xuICAgIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTGF6eSkge1xuICAgICAgICByZXR1cm4gZ2V0RGlzY3JpbWluYXRvcih0eXBlLnNjaGVtYSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RFZmZlY3RzKSB7XG4gICAgICAgIHJldHVybiBnZXREaXNjcmltaW5hdG9yKHR5cGUuaW5uZXJUeXBlKCkpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTGl0ZXJhbCkge1xuICAgICAgICByZXR1cm4gW3R5cGUudmFsdWVdO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kRW51bSkge1xuICAgICAgICByZXR1cm4gdHlwZS5vcHRpb25zO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTmF0aXZlRW51bSkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgYmFuL2JhblxuICAgICAgICByZXR1cm4gdXRpbC5vYmplY3RWYWx1ZXModHlwZS5lbnVtKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZERlZmF1bHQpIHtcbiAgICAgICAgcmV0dXJuIGdldERpc2NyaW1pbmF0b3IodHlwZS5fZGVmLmlubmVyVHlwZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RVbmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIFt1bmRlZmluZWRdO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTnVsbCkge1xuICAgICAgICByZXR1cm4gW251bGxdO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kT3B0aW9uYWwpIHtcbiAgICAgICAgcmV0dXJuIFt1bmRlZmluZWQsIC4uLmdldERpc2NyaW1pbmF0b3IodHlwZS51bndyYXAoKSldO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTnVsbGFibGUpIHtcbiAgICAgICAgcmV0dXJuIFtudWxsLCAuLi5nZXREaXNjcmltaW5hdG9yKHR5cGUudW53cmFwKCkpXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZEJyYW5kZWQpIHtcbiAgICAgICAgcmV0dXJuIGdldERpc2NyaW1pbmF0b3IodHlwZS51bndyYXAoKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RSZWFkb25seSkge1xuICAgICAgICByZXR1cm4gZ2V0RGlzY3JpbWluYXRvcih0eXBlLnVud3JhcCgpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZENhdGNoKSB7XG4gICAgICAgIHJldHVybiBnZXREaXNjcmltaW5hdG9yKHR5cGUuX2RlZi5pbm5lclR5cGUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbn07XG5leHBvcnQgY2xhc3MgWm9kRGlzY3JpbWluYXRlZFVuaW9uIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUub2JqZWN0KSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm9iamVjdCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRpc2NyaW1pbmF0b3IgPSB0aGlzLmRpc2NyaW1pbmF0b3I7XG4gICAgICAgIGNvbnN0IGRpc2NyaW1pbmF0b3JWYWx1ZSA9IGN0eC5kYXRhW2Rpc2NyaW1pbmF0b3JdO1xuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLm9wdGlvbnNNYXAuZ2V0KGRpc2NyaW1pbmF0b3JWYWx1ZSk7XG4gICAgICAgIGlmICghb3B0aW9uKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbl9kaXNjcmltaW5hdG9yLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IEFycmF5LmZyb20odGhpcy5vcHRpb25zTWFwLmtleXMoKSksXG4gICAgICAgICAgICAgICAgcGF0aDogW2Rpc2NyaW1pbmF0b3JdLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb24uX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgZGlzY3JpbWluYXRvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5kaXNjcmltaW5hdG9yO1xuICAgIH1cbiAgICBnZXQgb3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vcHRpb25zO1xuICAgIH1cbiAgICBnZXQgb3B0aW9uc01hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vcHRpb25zTWFwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGUgY29uc3RydWN0b3Igb2YgdGhlIGRpc2NyaW1pbmF0ZWQgdW5pb24gc2NoZW1hLiBJdHMgYmVoYXZpb3VyIGlzIHZlcnkgc2ltaWxhciB0byB0aGF0IG9mIHRoZSBub3JtYWwgei51bmlvbigpIGNvbnN0cnVjdG9yLlxuICAgICAqIEhvd2V2ZXIsIGl0IG9ubHkgYWxsb3dzIGEgdW5pb24gb2Ygb2JqZWN0cywgYWxsIG9mIHdoaWNoIG5lZWQgdG8gc2hhcmUgYSBkaXNjcmltaW5hdG9yIHByb3BlcnR5LiBUaGlzIHByb3BlcnR5IG11c3RcbiAgICAgKiBoYXZlIGEgZGlmZmVyZW50IHZhbHVlIGZvciBlYWNoIG9iamVjdCBpbiB0aGUgdW5pb24uXG4gICAgICogQHBhcmFtIGRpc2NyaW1pbmF0b3IgdGhlIG5hbWUgb2YgdGhlIGRpc2NyaW1pbmF0b3IgcHJvcGVydHlcbiAgICAgKiBAcGFyYW0gdHlwZXMgYW4gYXJyYXkgb2Ygb2JqZWN0IHNjaGVtYXNcbiAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZShkaXNjcmltaW5hdG9yLCBvcHRpb25zLCBwYXJhbXMpIHtcbiAgICAgICAgLy8gR2V0IGFsbCB0aGUgdmFsaWQgZGlzY3JpbWluYXRvciB2YWx1ZXNcbiAgICAgICAgY29uc3Qgb3B0aW9uc01hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgLy8gdHJ5IHtcbiAgICAgICAgZm9yIChjb25zdCB0eXBlIG9mIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpc2NyaW1pbmF0b3JWYWx1ZXMgPSBnZXREaXNjcmltaW5hdG9yKHR5cGUuc2hhcGVbZGlzY3JpbWluYXRvcl0pO1xuICAgICAgICAgICAgaWYgKCFkaXNjcmltaW5hdG9yVmFsdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQSBkaXNjcmltaW5hdG9yIHZhbHVlIGZvciBrZXkgXFxgJHtkaXNjcmltaW5hdG9yfVxcYCBjb3VsZCBub3QgYmUgZXh0cmFjdGVkIGZyb20gYWxsIHNjaGVtYSBvcHRpb25zYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIGRpc2NyaW1pbmF0b3JWYWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9uc01hcC5oYXModmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRGlzY3JpbWluYXRvciBwcm9wZXJ0eSAke1N0cmluZyhkaXNjcmltaW5hdG9yKX0gaGFzIGR1cGxpY2F0ZSB2YWx1ZSAke1N0cmluZyh2YWx1ZSl9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9wdGlvbnNNYXAuc2V0KHZhbHVlLCB0eXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZERpc2NyaW1pbmF0ZWRVbmlvbih7XG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZERpc2NyaW1pbmF0ZWRVbmlvbixcbiAgICAgICAgICAgIGRpc2NyaW1pbmF0b3IsXG4gICAgICAgICAgICBvcHRpb25zLFxuICAgICAgICAgICAgb3B0aW9uc01hcCxcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZnVuY3Rpb24gbWVyZ2VWYWx1ZXMoYSwgYikge1xuICAgIGNvbnN0IGFUeXBlID0gZ2V0UGFyc2VkVHlwZShhKTtcbiAgICBjb25zdCBiVHlwZSA9IGdldFBhcnNlZFR5cGUoYik7XG4gICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIGRhdGE6IGEgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYVR5cGUgPT09IFpvZFBhcnNlZFR5cGUub2JqZWN0ICYmIGJUeXBlID09PSBab2RQYXJzZWRUeXBlLm9iamVjdCkge1xuICAgICAgICBjb25zdCBiS2V5cyA9IHV0aWwub2JqZWN0S2V5cyhiKTtcbiAgICAgICAgY29uc3Qgc2hhcmVkS2V5cyA9IHV0aWwub2JqZWN0S2V5cyhhKS5maWx0ZXIoKGtleSkgPT4gYktleXMuaW5kZXhPZihrZXkpICE9PSAtMSk7XG4gICAgICAgIGNvbnN0IG5ld09iaiA9IHsgLi4uYSwgLi4uYiB9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBzaGFyZWRLZXlzKSB7XG4gICAgICAgICAgICBjb25zdCBzaGFyZWRWYWx1ZSA9IG1lcmdlVmFsdWVzKGFba2V5XSwgYltrZXldKTtcbiAgICAgICAgICAgIGlmICghc2hhcmVkVmFsdWUudmFsaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld09ialtrZXldID0gc2hhcmVkVmFsdWUuZGF0YTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgZGF0YTogbmV3T2JqIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKGFUeXBlID09PSBab2RQYXJzZWRUeXBlLmFycmF5ICYmIGJUeXBlID09PSBab2RQYXJzZWRUeXBlLmFycmF5KSB7XG4gICAgICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ld0FycmF5ID0gW107XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgaXRlbUEgPSBhW2luZGV4XTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1CID0gYltpbmRleF07XG4gICAgICAgICAgICBjb25zdCBzaGFyZWRWYWx1ZSA9IG1lcmdlVmFsdWVzKGl0ZW1BLCBpdGVtQik7XG4gICAgICAgICAgICBpZiAoIXNoYXJlZFZhbHVlLnZhbGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdBcnJheS5wdXNoKHNoYXJlZFZhbHVlLmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBuZXdBcnJheSB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChhVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS5kYXRlICYmIGJUeXBlID09PSBab2RQYXJzZWRUeXBlLmRhdGUgJiYgK2EgPT09ICtiKSB7XG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBhIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UgfTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgWm9kSW50ZXJzZWN0aW9uIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGhhbmRsZVBhcnNlZCA9IChwYXJzZWRMZWZ0LCBwYXJzZWRSaWdodCkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzQWJvcnRlZChwYXJzZWRMZWZ0KSB8fCBpc0Fib3J0ZWQocGFyc2VkUmlnaHQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtZXJnZWQgPSBtZXJnZVZhbHVlcyhwYXJzZWRMZWZ0LnZhbHVlLCBwYXJzZWRSaWdodC52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoIW1lcmdlZC52YWxpZCkge1xuICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9pbnRlcnNlY3Rpb25fdHlwZXMsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNEaXJ0eShwYXJzZWRMZWZ0KSB8fCBpc0RpcnR5KHBhcnNlZFJpZ2h0KSkge1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBtZXJnZWQuZGF0YSB9O1xuICAgICAgICB9O1xuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWYubGVmdC5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgdGhpcy5fZGVmLnJpZ2h0Ll9wYXJzZUFzeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0pLnRoZW4oKFtsZWZ0LCByaWdodF0pID0+IGhhbmRsZVBhcnNlZChsZWZ0LCByaWdodCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZVBhcnNlZCh0aGlzLl9kZWYubGVmdC5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgIH0pLCB0aGlzLl9kZWYucmlnaHQuX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5ab2RJbnRlcnNlY3Rpb24uY3JlYXRlID0gKGxlZnQsIHJpZ2h0LCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEludGVyc2VjdGlvbih7XG4gICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgIHJpZ2h0OiByaWdodCxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RJbnRlcnNlY3Rpb24sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG4vLyB0eXBlIFpvZFR1cGxlSXRlbXMgPSBbWm9kVHlwZUFueSwgLi4uWm9kVHlwZUFueVtdXTtcbmV4cG9ydCBjbGFzcyBab2RUdXBsZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuYXJyYXkpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuYXJyYXksXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmRhdGEubGVuZ3RoIDwgdGhpcy5fZGVmLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICBtaW5pbXVtOiB0aGlzLl9kZWYuaXRlbXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN0ID0gdGhpcy5fZGVmLnJlc3Q7XG4gICAgICAgIGlmICghcmVzdCAmJiBjdHguZGF0YS5sZW5ndGggPiB0aGlzLl9kZWYuaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICBtYXhpbXVtOiB0aGlzLl9kZWYuaXRlbXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpdGVtcyA9IFsuLi5jdHguZGF0YV1cbiAgICAgICAgICAgIC5tYXAoKGl0ZW0sIGl0ZW1JbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2NoZW1hID0gdGhpcy5fZGVmLml0ZW1zW2l0ZW1JbmRleF0gfHwgdGhpcy5fZGVmLnJlc3Q7XG4gICAgICAgICAgICBpZiAoIXNjaGVtYSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBzY2hlbWEuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBpdGVtLCBjdHgucGF0aCwgaXRlbUluZGV4KSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuZmlsdGVyKCh4KSA9PiAhIXgpOyAvLyBmaWx0ZXIgbnVsbHNcbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChpdGVtcykudGhlbigocmVzdWx0cykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgcmVzdWx0cyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgaXRlbXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBpdGVtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pdGVtcztcbiAgICB9XG4gICAgcmVzdChyZXN0KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kVHVwbGUoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgcmVzdCxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuWm9kVHVwbGUuY3JlYXRlID0gKHNjaGVtYXMsIHBhcmFtcykgPT4ge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShzY2hlbWFzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGFuIGFycmF5IG9mIHNjaGVtYXMgdG8gei50dXBsZShbIC4uLiBdKVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBab2RUdXBsZSh7XG4gICAgICAgIGl0ZW1zOiBzY2hlbWFzLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFR1cGxlLFxuICAgICAgICByZXN0OiBudWxsLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZFJlY29yZCBleHRlbmRzIFpvZFR5cGUge1xuICAgIGdldCBrZXlTY2hlbWEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYua2V5VHlwZTtcbiAgICB9XG4gICAgZ2V0IHZhbHVlU2NoZW1hKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5vYmplY3QpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUub2JqZWN0LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFpcnMgPSBbXTtcbiAgICAgICAgY29uc3Qga2V5VHlwZSA9IHRoaXMuX2RlZi5rZXlUeXBlO1xuICAgICAgICBjb25zdCB2YWx1ZVR5cGUgPSB0aGlzLl9kZWYudmFsdWVUeXBlO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBjdHguZGF0YSkge1xuICAgICAgICAgICAgcGFpcnMucHVzaCh7XG4gICAgICAgICAgICAgICAga2V5OiBrZXlUeXBlLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwga2V5LCBjdHgucGF0aCwga2V5KSksXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlVHlwZS5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIGN0eC5kYXRhW2tleV0sIGN0eC5wYXRoLCBrZXkpKSxcbiAgICAgICAgICAgICAgICBhbHdheXNTZXQ6IGtleSBpbiBjdHguZGF0YSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VPYmplY3RBc3luYyhzdGF0dXMsIHBhaXJzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZU9iamVjdFN5bmMoc3RhdHVzLCBwYWlycyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWVUeXBlO1xuICAgIH1cbiAgICBzdGF0aWMgY3JlYXRlKGZpcnN0LCBzZWNvbmQsIHRoaXJkKSB7XG4gICAgICAgIGlmIChzZWNvbmQgaW5zdGFuY2VvZiBab2RUeXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFpvZFJlY29yZCh7XG4gICAgICAgICAgICAgICAga2V5VHlwZTogZmlyc3QsXG4gICAgICAgICAgICAgICAgdmFsdWVUeXBlOiBzZWNvbmQsXG4gICAgICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RSZWNvcmQsXG4gICAgICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyh0aGlyZCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZFJlY29yZCh7XG4gICAgICAgICAgICBrZXlUeXBlOiBab2RTdHJpbmcuY3JlYXRlKCksXG4gICAgICAgICAgICB2YWx1ZVR5cGU6IGZpcnN0LFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RSZWNvcmQsXG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHNlY29uZCksXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RNYXAgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBnZXQga2V5U2NoZW1hKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmtleVR5cGU7XG4gICAgfVxuICAgIGdldCB2YWx1ZVNjaGVtYSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi52YWx1ZVR5cGU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUubWFwKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm1hcCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleVR5cGUgPSB0aGlzLl9kZWYua2V5VHlwZTtcbiAgICAgICAgY29uc3QgdmFsdWVUeXBlID0gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICAgICAgY29uc3QgcGFpcnMgPSBbLi4uY3R4LmRhdGEuZW50cmllcygpXS5tYXAoKFtrZXksIHZhbHVlXSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAga2V5OiBrZXlUeXBlLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwga2V5LCBjdHgucGF0aCwgW2luZGV4LCBcImtleVwiXSkpLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVR5cGUuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCB2YWx1ZSwgY3R4LnBhdGgsIFtpbmRleCwgXCJ2YWx1ZVwiXSkpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICBjb25zdCBmaW5hbE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgcGFpci5rZXk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgcGFpci52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiYWJvcnRlZFwiIHx8IHZhbHVlLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkuc3RhdHVzID09PSBcImRpcnR5XCIgfHwgdmFsdWUuc3RhdHVzID09PSBcImRpcnR5XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsTWFwLnNldChrZXkudmFsdWUsIHZhbHVlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBmaW5hbE1hcCB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBmaW5hbE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IHBhaXIua2V5O1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFpci52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIgfHwgdmFsdWUuc3RhdHVzID09PSBcImFib3J0ZWRcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiZGlydHlcIiB8fCB2YWx1ZS5zdGF0dXMgPT09IFwiZGlydHlcIikge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxNYXAuc2V0KGtleS52YWx1ZSwgdmFsdWUudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBmaW5hbE1hcCB9O1xuICAgICAgICB9XG4gICAgfVxufVxuWm9kTWFwLmNyZWF0ZSA9IChrZXlUeXBlLCB2YWx1ZVR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTWFwKHtcbiAgICAgICAgdmFsdWVUeXBlLFxuICAgICAgICBrZXlUeXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE1hcCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RTZXQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLnNldCkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5zZXQsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZWYgPSB0aGlzLl9kZWY7XG4gICAgICAgIGlmIChkZWYubWluU2l6ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGN0eC5kYXRhLnNpemUgPCBkZWYubWluU2l6ZS52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBkZWYubWluU2l6ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzZXRcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5taW5TaXplLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZi5tYXhTaXplICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoY3R4LmRhdGEuc2l6ZSA+IGRlZi5tYXhTaXplLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBkZWYubWF4U2l6ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzZXRcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5tYXhTaXplLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWVUeXBlID0gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICAgICAgZnVuY3Rpb24gZmluYWxpemVTZXQoZWxlbWVudHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZFNldCA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICBwYXJzZWRTZXQuYWRkKGVsZW1lbnQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBwYXJzZWRTZXQgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IFsuLi5jdHguZGF0YS52YWx1ZXMoKV0ubWFwKChpdGVtLCBpKSA9PiB2YWx1ZVR5cGUuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBpdGVtLCBjdHgucGF0aCwgaSkpKTtcbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChlbGVtZW50cykudGhlbigoZWxlbWVudHMpID0+IGZpbmFsaXplU2V0KGVsZW1lbnRzKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmluYWxpemVTZXQoZWxlbWVudHMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIG1pbihtaW5TaXplLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kU2V0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIG1pblNpemU6IHsgdmFsdWU6IG1pblNpemUsIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbWF4KG1heFNpemUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTZXQoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgbWF4U2l6ZTogeyB2YWx1ZTogbWF4U2l6ZSwgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzaXplKHNpemUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluKHNpemUsIG1lc3NhZ2UpLm1heChzaXplLCBtZXNzYWdlKTtcbiAgICB9XG4gICAgbm9uZW1wdHkobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5taW4oMSwgbWVzc2FnZSk7XG4gICAgfVxufVxuWm9kU2V0LmNyZWF0ZSA9ICh2YWx1ZVR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kU2V0KHtcbiAgICAgICAgdmFsdWVUeXBlLFxuICAgICAgICBtaW5TaXplOiBudWxsLFxuICAgICAgICBtYXhTaXplOiBudWxsLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFNldCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RGdW5jdGlvbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnZhbGlkYXRlID0gdGhpcy5pbXBsZW1lbnQ7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLmZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gbWFrZUFyZ3NJc3N1ZShhcmdzLCBlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIG1ha2VJc3N1ZSh7XG4gICAgICAgICAgICAgICAgZGF0YTogYXJncyxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBlcnJvck1hcHM6IFtjdHguY29tbW9uLmNvbnRleHR1YWxFcnJvck1hcCwgY3R4LnNjaGVtYUVycm9yTWFwLCBnZXRFcnJvck1hcCgpLCBkZWZhdWx0RXJyb3JNYXBdLmZpbHRlcigoeCkgPT4gISF4KSxcbiAgICAgICAgICAgICAgICBpc3N1ZURhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfYXJndW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHNFcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VSZXR1cm5zSXNzdWUocmV0dXJucywgZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBtYWtlSXNzdWUoe1xuICAgICAgICAgICAgICAgIGRhdGE6IHJldHVybnMsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgZXJyb3JNYXBzOiBbY3R4LmNvbW1vbi5jb250ZXh0dWFsRXJyb3JNYXAsIGN0eC5zY2hlbWFFcnJvck1hcCwgZ2V0RXJyb3JNYXAoKSwgZGVmYXVsdEVycm9yTWFwXS5maWx0ZXIoKHgpID0+ICEheCksXG4gICAgICAgICAgICAgICAgaXNzdWVEYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3JldHVybl90eXBlLFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5UeXBlRXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJhbXMgPSB7IGVycm9yTWFwOiBjdHguY29tbW9uLmNvbnRleHR1YWxFcnJvck1hcCB9O1xuICAgICAgICBjb25zdCBmbiA9IGN0eC5kYXRhO1xuICAgICAgICBpZiAodGhpcy5fZGVmLnJldHVybnMgaW5zdGFuY2VvZiBab2RQcm9taXNlKSB7XG4gICAgICAgICAgICAvLyBXb3VsZCBsb3ZlIGEgd2F5IHRvIGF2b2lkIGRpc2FibGluZyB0aGlzIHJ1bGUsIGJ1dCB3ZSBuZWVkXG4gICAgICAgICAgICAvLyBhbiBhbGlhcyAodXNpbmcgYW4gYXJyb3cgZnVuY3Rpb24gd2FzIHdoYXQgY2F1c2VkIDI2NTEpLlxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG4gICAgICAgICAgICBjb25zdCBtZSA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4gT0soYXN5bmMgZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBab2RFcnJvcihbXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkQXJncyA9IGF3YWl0IG1lLl9kZWYuYXJncy5wYXJzZUFzeW5jKGFyZ3MsIHBhcmFtcykuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IuYWRkSXNzdWUobWFrZUFyZ3NJc3N1ZShhcmdzLCBlKSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFJlZmxlY3QuYXBwbHkoZm4sIHRoaXMsIHBhcnNlZEFyZ3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZFJldHVybnMgPSBhd2FpdCBtZS5fZGVmLnJldHVybnMuX2RlZi50eXBlXG4gICAgICAgICAgICAgICAgICAgIC5wYXJzZUFzeW5jKHJlc3VsdCwgcGFyYW1zKVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IuYWRkSXNzdWUobWFrZVJldHVybnNJc3N1ZShyZXN1bHQsIGUpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlZFJldHVybnM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFdvdWxkIGxvdmUgYSB3YXkgdG8gYXZvaWQgZGlzYWJsaW5nIHRoaXMgcnVsZSwgYnV0IHdlIG5lZWRcbiAgICAgICAgICAgIC8vIGFuIGFsaWFzICh1c2luZyBhbiBhcnJvdyBmdW5jdGlvbiB3YXMgd2hhdCBjYXVzZWQgMjY1MSkuXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcbiAgICAgICAgICAgIGNvbnN0IG1lID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiBPSyhmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZEFyZ3MgPSBtZS5fZGVmLmFyZ3Muc2FmZVBhcnNlKGFyZ3MsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJzZWRBcmdzLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFpvZEVycm9yKFttYWtlQXJnc0lzc3VlKGFyZ3MsIHBhcnNlZEFyZ3MuZXJyb3IpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IFJlZmxlY3QuYXBwbHkoZm4sIHRoaXMsIHBhcnNlZEFyZ3MuZGF0YSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkUmV0dXJucyA9IG1lLl9kZWYucmV0dXJucy5zYWZlUGFyc2UocmVzdWx0LCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIGlmICghcGFyc2VkUmV0dXJucy5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBab2RFcnJvcihbbWFrZVJldHVybnNJc3N1ZShyZXN1bHQsIHBhcnNlZFJldHVybnMuZXJyb3IpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZWRSZXR1cm5zLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwYXJhbWV0ZXJzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmFyZ3M7XG4gICAgfVxuICAgIHJldHVyblR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYucmV0dXJucztcbiAgICB9XG4gICAgYXJncyguLi5pdGVtcykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEZ1bmN0aW9uKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGFyZ3M6IFpvZFR1cGxlLmNyZWF0ZShpdGVtcykucmVzdChab2RVbmtub3duLmNyZWF0ZSgpKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybnMocmV0dXJuVHlwZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEZ1bmN0aW9uKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHJldHVybnM6IHJldHVyblR5cGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbXBsZW1lbnQoZnVuYykge1xuICAgICAgICBjb25zdCB2YWxpZGF0ZWRGdW5jID0gdGhpcy5wYXJzZShmdW5jKTtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlZEZ1bmM7XG4gICAgfVxuICAgIHN0cmljdEltcGxlbWVudChmdW5jKSB7XG4gICAgICAgIGNvbnN0IHZhbGlkYXRlZEZ1bmMgPSB0aGlzLnBhcnNlKGZ1bmMpO1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVkRnVuYztcbiAgICB9XG4gICAgc3RhdGljIGNyZWF0ZShhcmdzLCByZXR1cm5zLCBwYXJhbXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RGdW5jdGlvbih7XG4gICAgICAgICAgICBhcmdzOiAoYXJncyA/IGFyZ3MgOiBab2RUdXBsZS5jcmVhdGUoW10pLnJlc3QoWm9kVW5rbm93bi5jcmVhdGUoKSkpLFxuICAgICAgICAgICAgcmV0dXJuczogcmV0dXJucyB8fCBab2RVbmtub3duLmNyZWF0ZSgpLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RGdW5jdGlvbixcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFpvZExhenkgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBnZXQgc2NoZW1hKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmdldHRlcigpO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGxhenlTY2hlbWEgPSB0aGlzLl9kZWYuZ2V0dGVyKCk7XG4gICAgICAgIHJldHVybiBsYXp5U2NoZW1hLl9wYXJzZSh7IGRhdGE6IGN0eC5kYXRhLCBwYXRoOiBjdHgucGF0aCwgcGFyZW50OiBjdHggfSk7XG4gICAgfVxufVxuWm9kTGF6eS5jcmVhdGUgPSAoZ2V0dGVyLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZExhenkoe1xuICAgICAgICBnZXR0ZXI6IGdldHRlcixcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RMYXp5LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZExpdGVyYWwgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgaWYgKGlucHV0LmRhdGEgIT09IHRoaXMuX2RlZi52YWx1ZSkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX2xpdGVyYWwsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IHRoaXMuX2RlZi52YWx1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlOiBpbnB1dC5kYXRhIH07XG4gICAgfVxuICAgIGdldCB2YWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi52YWx1ZTtcbiAgICB9XG59XG5ab2RMaXRlcmFsLmNyZWF0ZSA9ICh2YWx1ZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RMaXRlcmFsKHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZExpdGVyYWwsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5mdW5jdGlvbiBjcmVhdGVab2RFbnVtKHZhbHVlcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBab2RFbnVtKHtcbiAgICAgICAgdmFsdWVzLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVudW0sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbmV4cG9ydCBjbGFzcyBab2RFbnVtIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQuZGF0YSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWRWYWx1ZXMgPSB0aGlzLl9kZWYudmFsdWVzO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IHV0aWwuam9pblZhbHVlcyhleHBlY3RlZFZhbHVlcyksXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fY2FjaGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlID0gbmV3IFNldCh0aGlzLl9kZWYudmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlLmhhcyhpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWRWYWx1ZXMgPSB0aGlzLl9kZWYudmFsdWVzO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX2VudW1fdmFsdWUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogZXhwZWN0ZWRWYWx1ZXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG4gICAgZ2V0IG9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWVzO1xuICAgIH1cbiAgICBnZXQgZW51bSgpIHtcbiAgICAgICAgY29uc3QgZW51bVZhbHVlcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHZhbCBvZiB0aGlzLl9kZWYudmFsdWVzKSB7XG4gICAgICAgICAgICBlbnVtVmFsdWVzW3ZhbF0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVudW1WYWx1ZXM7XG4gICAgfVxuICAgIGdldCBWYWx1ZXMoKSB7XG4gICAgICAgIGNvbnN0IGVudW1WYWx1ZXMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCB2YWwgb2YgdGhpcy5fZGVmLnZhbHVlcykge1xuICAgICAgICAgICAgZW51bVZhbHVlc1t2YWxdID0gdmFsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbnVtVmFsdWVzO1xuICAgIH1cbiAgICBnZXQgRW51bSgpIHtcbiAgICAgICAgY29uc3QgZW51bVZhbHVlcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHZhbCBvZiB0aGlzLl9kZWYudmFsdWVzKSB7XG4gICAgICAgICAgICBlbnVtVmFsdWVzW3ZhbF0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVudW1WYWx1ZXM7XG4gICAgfVxuICAgIGV4dHJhY3QodmFsdWVzLCBuZXdEZWYgPSB0aGlzLl9kZWYpIHtcbiAgICAgICAgcmV0dXJuIFpvZEVudW0uY3JlYXRlKHZhbHVlcywge1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgLi4ubmV3RGVmLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZXhjbHVkZSh2YWx1ZXMsIG5ld0RlZiA9IHRoaXMuX2RlZikge1xuICAgICAgICByZXR1cm4gWm9kRW51bS5jcmVhdGUodGhpcy5vcHRpb25zLmZpbHRlcigob3B0KSA9PiAhdmFsdWVzLmluY2x1ZGVzKG9wdCkpLCB7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICAuLi5uZXdEZWYsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblpvZEVudW0uY3JlYXRlID0gY3JlYXRlWm9kRW51bTtcbmV4cG9ydCBjbGFzcyBab2ROYXRpdmVFbnVtIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IG5hdGl2ZUVudW1WYWx1ZXMgPSB1dGlsLmdldFZhbGlkRW51bVZhbHVlcyh0aGlzLl9kZWYudmFsdWVzKTtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuc3RyaW5nICYmIGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLm51bWJlcikge1xuICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWRWYWx1ZXMgPSB1dGlsLm9iamVjdFZhbHVlcyhuYXRpdmVFbnVtVmFsdWVzKTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiB1dGlsLmpvaW5WYWx1ZXMoZXhwZWN0ZWRWYWx1ZXMpLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZSA9IG5ldyBTZXQodXRpbC5nZXRWYWxpZEVudW1WYWx1ZXModGhpcy5fZGVmLnZhbHVlcykpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fY2FjaGUuaGFzKGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICBjb25zdCBleHBlY3RlZFZhbHVlcyA9IHV0aWwub2JqZWN0VmFsdWVzKG5hdGl2ZUVudW1WYWx1ZXMpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX2VudW1fdmFsdWUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogZXhwZWN0ZWRWYWx1ZXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG4gICAgZ2V0IGVudW0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWVzO1xuICAgIH1cbn1cblpvZE5hdGl2ZUVudW0uY3JlYXRlID0gKHZhbHVlcywgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2ROYXRpdmVFbnVtKHtcbiAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTmF0aXZlRW51bSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RQcm9taXNlIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgdW53cmFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnR5cGU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLnByb21pc2UgJiYgY3R4LmNvbW1vbi5hc3luYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUucHJvbWlzZSxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb21pc2lmaWVkID0gY3R4LnBhcnNlZFR5cGUgPT09IFpvZFBhcnNlZFR5cGUucHJvbWlzZSA/IGN0eC5kYXRhIDogUHJvbWlzZS5yZXNvbHZlKGN0eC5kYXRhKTtcbiAgICAgICAgcmV0dXJuIE9LKHByb21pc2lmaWVkLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kZWYudHlwZS5wYXJzZUFzeW5jKGRhdGEsIHtcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBlcnJvck1hcDogY3R4LmNvbW1vbi5jb250ZXh0dWFsRXJyb3JNYXAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkpO1xuICAgIH1cbn1cblpvZFByb21pc2UuY3JlYXRlID0gKHNjaGVtYSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RQcm9taXNlKHtcbiAgICAgICAgdHlwZTogc2NoZW1hLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFByb21pc2UsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kRWZmZWN0cyBleHRlbmRzIFpvZFR5cGUge1xuICAgIGlubmVyVHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zY2hlbWE7XG4gICAgfVxuICAgIHNvdXJjZVR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuc2NoZW1hLl9kZWYudHlwZU5hbWUgPT09IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFZmZlY3RzXG4gICAgICAgICAgICA/IHRoaXMuX2RlZi5zY2hlbWEuc291cmNlVHlwZSgpXG4gICAgICAgICAgICA6IHRoaXMuX2RlZi5zY2hlbWE7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCBlZmZlY3QgPSB0aGlzLl9kZWYuZWZmZWN0IHx8IG51bGw7XG4gICAgICAgIGNvbnN0IGNoZWNrQ3R4ID0ge1xuICAgICAgICAgICAgYWRkSXNzdWU6IChhcmcpID0+IHtcbiAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIGFyZyk7XG4gICAgICAgICAgICAgICAgaWYgKGFyZy5mYXRhbCkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXQgcGF0aCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3R4LnBhdGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICBjaGVja0N0eC5hZGRJc3N1ZSA9IGNoZWNrQ3R4LmFkZElzc3VlLmJpbmQoY2hlY2tDdHgpO1xuICAgICAgICBpZiAoZWZmZWN0LnR5cGUgPT09IFwicHJlcHJvY2Vzc1wiKSB7XG4gICAgICAgICAgICBjb25zdCBwcm9jZXNzZWQgPSBlZmZlY3QudHJhbnNmb3JtKGN0eC5kYXRhLCBjaGVja0N0eCk7XG4gICAgICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocHJvY2Vzc2VkKS50aGVuKGFzeW5jIChwcm9jZXNzZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cy52YWx1ZSA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fZGVmLnNjaGVtYS5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBwcm9jZXNzZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gRElSVFkocmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cy52YWx1ZSA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERJUlRZKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzLnZhbHVlID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fZGVmLnNjaGVtYS5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcHJvY2Vzc2VkLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRElSVFkocmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzLnZhbHVlID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBESVJUWShyZXN1bHQudmFsdWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVmZmVjdC50eXBlID09PSBcInJlZmluZW1lbnRcIikge1xuICAgICAgICAgICAgY29uc3QgZXhlY3V0ZVJlZmluZW1lbnQgPSAoYWNjKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZWZmZWN0LnJlZmluZW1lbnQoYWNjLCBjaGVja0N0eCk7XG4gICAgICAgICAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luYyByZWZpbmVtZW50IGVuY291bnRlcmVkIGR1cmluZyBzeW5jaHJvbm91cyBwYXJzZSBvcGVyYXRpb24uIFVzZSAucGFyc2VBc3luYyBpbnN0ZWFkLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbm5lciA9IHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGlubmVyLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgIGlmIChpbm5lci5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHZhbHVlIGlzIGlnbm9yZWRcbiAgICAgICAgICAgICAgICBleGVjdXRlUmVmaW5lbWVudChpbm5lci52YWx1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBpbm5lci52YWx1ZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlQXN5bmMoeyBkYXRhOiBjdHguZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pLnRoZW4oKGlubmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbm5lci5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbm5lci5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXhlY3V0ZVJlZmluZW1lbnQoaW5uZXIudmFsdWUpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBpbm5lci52YWx1ZSB9O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZWZmZWN0LnR5cGUgPT09IFwidHJhbnNmb3JtXCIpIHtcbiAgICAgICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhc2UgPSB0aGlzLl9kZWYuc2NoZW1hLl9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZChiYXNlKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZWZmZWN0LnRyYW5zZm9ybShiYXNlLnZhbHVlLCBjaGVja0N0eCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3luY2hyb25vdXMgdHJhbnNmb3JtIGVuY291bnRlcmVkIGR1cmluZyBzeW5jaHJvbm91cyBwYXJzZSBvcGVyYXRpb24uIFVzZSAucGFyc2VBc3luYyBpbnN0ZWFkLmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IHJlc3VsdCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlQXN5bmMoeyBkYXRhOiBjdHguZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pLnRoZW4oKGJhc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKGJhc2UpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZWZmZWN0LnRyYW5zZm9ybShiYXNlLnZhbHVlLCBjaGVja0N0eCkpLnRoZW4oKHJlc3VsdCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoZWZmZWN0KTtcbiAgICB9XG59XG5ab2RFZmZlY3RzLmNyZWF0ZSA9IChzY2hlbWEsIGVmZmVjdCwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RFZmZlY3RzKHtcbiAgICAgICAgc2NoZW1hLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVmZmVjdHMsXG4gICAgICAgIGVmZmVjdCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcblpvZEVmZmVjdHMuY3JlYXRlV2l0aFByZXByb2Nlc3MgPSAocHJlcHJvY2Vzcywgc2NoZW1hLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEVmZmVjdHMoe1xuICAgICAgICBzY2hlbWEsXG4gICAgICAgIGVmZmVjdDogeyB0eXBlOiBcInByZXByb2Nlc3NcIiwgdHJhbnNmb3JtOiBwcmVwcm9jZXNzIH0sXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRWZmZWN0cyxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCB7IFpvZEVmZmVjdHMgYXMgWm9kVHJhbnNmb3JtZXIgfTtcbmV4cG9ydCBjbGFzcyBab2RPcHRpb25hbCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlID09PSBab2RQYXJzZWRUeXBlLnVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIE9LKHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKGlucHV0KTtcbiAgICB9XG4gICAgdW53cmFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmlubmVyVHlwZTtcbiAgICB9XG59XG5ab2RPcHRpb25hbC5jcmVhdGUgPSAodHlwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RPcHRpb25hbCh7XG4gICAgICAgIGlubmVyVHlwZTogdHlwZSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPcHRpb25hbCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2ROdWxsYWJsZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlID09PSBab2RQYXJzZWRUeXBlLm51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBPSyhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmlubmVyVHlwZS5fcGFyc2UoaW5wdXQpO1xuICAgIH1cbiAgICB1bndyYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlO1xuICAgIH1cbn1cblpvZE51bGxhYmxlLmNyZWF0ZSA9ICh0eXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE51bGxhYmxlKHtcbiAgICAgICAgaW5uZXJUeXBlOiB0eXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE51bGxhYmxlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZERlZmF1bHQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGxldCBkYXRhID0gY3R4LmRhdGE7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS51bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9kZWYuZGVmYXVsdFZhbHVlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKHtcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVtb3ZlRGVmYXVsdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuWm9kRGVmYXVsdC5jcmVhdGUgPSAodHlwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2REZWZhdWx0KHtcbiAgICAgICAgaW5uZXJUeXBlOiB0eXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZERlZmF1bHQsXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdHlwZW9mIHBhcmFtcy5kZWZhdWx0ID09PSBcImZ1bmN0aW9uXCIgPyBwYXJhbXMuZGVmYXVsdCA6ICgpID0+IHBhcmFtcy5kZWZhdWx0LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZENhdGNoIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICAvLyBuZXdDdHggaXMgdXNlZCB0byBub3QgY29sbGVjdCBpc3N1ZXMgZnJvbSBpbm5lciB0eXBlcyBpbiBjdHhcbiAgICAgICAgY29uc3QgbmV3Q3R4ID0ge1xuICAgICAgICAgICAgLi4uY3R4LFxuICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgLi4uY3R4LmNvbW1vbixcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fZGVmLmlubmVyVHlwZS5fcGFyc2Uoe1xuICAgICAgICAgICAgZGF0YTogbmV3Q3R4LmRhdGEsXG4gICAgICAgICAgICBwYXRoOiBuZXdDdHgucGF0aCxcbiAgICAgICAgICAgIHBhcmVudDoge1xuICAgICAgICAgICAgICAgIC4uLm5ld0N0eCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaXNBc3luYyhyZXN1bHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogXCJ2YWxpZFwiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmVzdWx0LnN0YXR1cyA9PT0gXCJ2YWxpZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHJlc3VsdC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLl9kZWYuY2F0Y2hWYWx1ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0IGVycm9yKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFpvZEVycm9yKG5ld0N0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBuZXdDdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcInZhbGlkXCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC5zdGF0dXMgPT09IFwidmFsaWRcIlxuICAgICAgICAgICAgICAgICAgICA/IHJlc3VsdC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICA6IHRoaXMuX2RlZi5jYXRjaFZhbHVlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldCBlcnJvcigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFpvZEVycm9yKG5ld0N0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogbmV3Q3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZW1vdmVDYXRjaCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuWm9kQ2F0Y2guY3JlYXRlID0gKHR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kQ2F0Y2goe1xuICAgICAgICBpbm5lclR5cGU6IHR5cGUsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQ2F0Y2gsXG4gICAgICAgIGNhdGNoVmFsdWU6IHR5cGVvZiBwYXJhbXMuY2F0Y2ggPT09IFwiZnVuY3Rpb25cIiA/IHBhcmFtcy5jYXRjaCA6ICgpID0+IHBhcmFtcy5jYXRjaCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2ROYU4gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5uYW4pIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUubmFuLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlOiBpbnB1dC5kYXRhIH07XG4gICAgfVxufVxuWm9kTmFOLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE5hTih7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTmFOLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNvbnN0IEJSQU5EID0gU3ltYm9sKFwiem9kX2JyYW5kXCIpO1xuZXhwb3J0IGNsYXNzIFpvZEJyYW5kZWQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBjdHguZGF0YTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi50eXBlLl9wYXJzZSh7XG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHVud3JhcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi50eXBlO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RQaXBlbGluZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlQXN5bmMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5SZXN1bHQgPSBhd2FpdCB0aGlzLl9kZWYuaW4uX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChpblJlc3VsdC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICBpZiAoaW5SZXN1bHQuc3RhdHVzID09PSBcImRpcnR5XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBESVJUWShpblJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGVmLm91dC5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBpblJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlQXN5bmMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGluUmVzdWx0ID0gdGhpcy5fZGVmLmluLl9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoaW5SZXN1bHQuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgIGlmIChpblJlc3VsdC5zdGF0dXMgPT09IFwiZGlydHlcIikge1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogXCJkaXJ0eVwiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogaW5SZXN1bHQudmFsdWUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9kZWYub3V0Ll9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBpblJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBjcmVhdGUoYSwgYikge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFBpcGVsaW5lKHtcbiAgICAgICAgICAgIGluOiBhLFxuICAgICAgICAgICAgb3V0OiBiLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RQaXBlbGluZSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFpvZFJlYWRvbmx5IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKGlucHV0KTtcbiAgICAgICAgY29uc3QgZnJlZXplID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChpc1ZhbGlkKGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YS52YWx1ZSA9IE9iamVjdC5mcmVlemUoZGF0YS52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGlzQXN5bmMocmVzdWx0KSA/IHJlc3VsdC50aGVuKChkYXRhKSA9PiBmcmVlemUoZGF0YSkpIDogZnJlZXplKHJlc3VsdCk7XG4gICAgfVxuICAgIHVud3JhcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuWm9kUmVhZG9ubHkuY3JlYXRlID0gKHR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kUmVhZG9ubHkoe1xuICAgICAgICBpbm5lclR5cGU6IHR5cGUsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kUmVhZG9ubHksXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgICAgICAgICAgICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgei5jdXN0b20gICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgICAgICAgICAgICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBjbGVhblBhcmFtcyhwYXJhbXMsIGRhdGEpIHtcbiAgICBjb25zdCBwID0gdHlwZW9mIHBhcmFtcyA9PT0gXCJmdW5jdGlvblwiID8gcGFyYW1zKGRhdGEpIDogdHlwZW9mIHBhcmFtcyA9PT0gXCJzdHJpbmdcIiA/IHsgbWVzc2FnZTogcGFyYW1zIH0gOiBwYXJhbXM7XG4gICAgY29uc3QgcDIgPSB0eXBlb2YgcCA9PT0gXCJzdHJpbmdcIiA/IHsgbWVzc2FnZTogcCB9IDogcDtcbiAgICByZXR1cm4gcDI7XG59XG5leHBvcnQgZnVuY3Rpb24gY3VzdG9tKGNoZWNrLCBfcGFyYW1zID0ge30sIFxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICpcbiAqIFBhc3MgYGZhdGFsYCBpbnRvIHRoZSBwYXJhbXMgb2JqZWN0IGluc3RlYWQ6XG4gKlxuICogYGBgdHNcbiAqIHouc3RyaW5nKCkuY3VzdG9tKCh2YWwpID0+IHZhbC5sZW5ndGggPiA1LCB7IGZhdGFsOiBmYWxzZSB9KVxuICogYGBgXG4gKlxuICovXG5mYXRhbCkge1xuICAgIGlmIChjaGVjaylcbiAgICAgICAgcmV0dXJuIFpvZEFueS5jcmVhdGUoKS5zdXBlclJlZmluZSgoZGF0YSwgY3R4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByID0gY2hlY2soZGF0YSk7XG4gICAgICAgICAgICBpZiAociBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gci50aGVuKChyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gY2xlYW5QYXJhbXMoX3BhcmFtcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBfZmF0YWwgPSBwYXJhbXMuZmF0YWwgPz8gZmF0YWwgPz8gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5hZGRJc3N1ZSh7IGNvZGU6IFwiY3VzdG9tXCIsIC4uLnBhcmFtcywgZmF0YWw6IF9mYXRhbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFyKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gY2xlYW5QYXJhbXMoX3BhcmFtcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgY29uc3QgX2ZhdGFsID0gcGFyYW1zLmZhdGFsID8/IGZhdGFsID8/IHRydWU7XG4gICAgICAgICAgICAgICAgY3R4LmFkZElzc3VlKHsgY29kZTogXCJjdXN0b21cIiwgLi4ucGFyYW1zLCBmYXRhbDogX2ZhdGFsIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9KTtcbiAgICByZXR1cm4gWm9kQW55LmNyZWF0ZSgpO1xufVxuZXhwb3J0IHsgWm9kVHlwZSBhcyBTY2hlbWEsIFpvZFR5cGUgYXMgWm9kU2NoZW1hIH07XG5leHBvcnQgY29uc3QgbGF0ZSA9IHtcbiAgICBvYmplY3Q6IFpvZE9iamVjdC5sYXp5Y3JlYXRlLFxufTtcbmV4cG9ydCB2YXIgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kO1xuKGZ1bmN0aW9uIChab2RGaXJzdFBhcnR5VHlwZUtpbmQpIHtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RTdHJpbmdcIl0gPSBcIlpvZFN0cmluZ1wiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE51bWJlclwiXSA9IFwiWm9kTnVtYmVyXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTmFOXCJdID0gXCJab2ROYU5cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RCaWdJbnRcIl0gPSBcIlpvZEJpZ0ludFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEJvb2xlYW5cIl0gPSBcIlpvZEJvb2xlYW5cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2REYXRlXCJdID0gXCJab2REYXRlXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kU3ltYm9sXCJdID0gXCJab2RTeW1ib2xcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RVbmRlZmluZWRcIl0gPSBcIlpvZFVuZGVmaW5lZFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE51bGxcIl0gPSBcIlpvZE51bGxcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RBbnlcIl0gPSBcIlpvZEFueVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFVua25vd25cIl0gPSBcIlpvZFVua25vd25cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2ROZXZlclwiXSA9IFwiWm9kTmV2ZXJcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RWb2lkXCJdID0gXCJab2RWb2lkXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kQXJyYXlcIl0gPSBcIlpvZEFycmF5XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kT2JqZWN0XCJdID0gXCJab2RPYmplY3RcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RVbmlvblwiXSA9IFwiWm9kVW5pb25cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2REaXNjcmltaW5hdGVkVW5pb25cIl0gPSBcIlpvZERpc2NyaW1pbmF0ZWRVbmlvblwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEludGVyc2VjdGlvblwiXSA9IFwiWm9kSW50ZXJzZWN0aW9uXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kVHVwbGVcIl0gPSBcIlpvZFR1cGxlXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kUmVjb3JkXCJdID0gXCJab2RSZWNvcmRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RNYXBcIl0gPSBcIlpvZE1hcFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFNldFwiXSA9IFwiWm9kU2V0XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kRnVuY3Rpb25cIl0gPSBcIlpvZEZ1bmN0aW9uXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTGF6eVwiXSA9IFwiWm9kTGF6eVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZExpdGVyYWxcIl0gPSBcIlpvZExpdGVyYWxcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RFbnVtXCJdID0gXCJab2RFbnVtXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kRWZmZWN0c1wiXSA9IFwiWm9kRWZmZWN0c1wiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE5hdGl2ZUVudW1cIl0gPSBcIlpvZE5hdGl2ZUVudW1cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RPcHRpb25hbFwiXSA9IFwiWm9kT3B0aW9uYWxcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2ROdWxsYWJsZVwiXSA9IFwiWm9kTnVsbGFibGVcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2REZWZhdWx0XCJdID0gXCJab2REZWZhdWx0XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kQ2F0Y2hcIl0gPSBcIlpvZENhdGNoXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kUHJvbWlzZVwiXSA9IFwiWm9kUHJvbWlzZVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEJyYW5kZWRcIl0gPSBcIlpvZEJyYW5kZWRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RQaXBlbGluZVwiXSA9IFwiWm9kUGlwZWxpbmVcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RSZWFkb25seVwiXSA9IFwiWm9kUmVhZG9ubHlcIjtcbn0pKFpvZEZpcnN0UGFydHlUeXBlS2luZCB8fCAoWm9kRmlyc3RQYXJ0eVR5cGVLaW5kID0ge30pKTtcbi8vIHJlcXVpcmVzIFRTIDQuNCtcbmNsYXNzIENsYXNzIHtcbiAgICBjb25zdHJ1Y3RvciguLi5fKSB7IH1cbn1cbmNvbnN0IGluc3RhbmNlT2ZUeXBlID0gKFxuLy8gY29uc3QgaW5zdGFuY2VPZlR5cGUgPSA8VCBleHRlbmRzIG5ldyAoLi4uYXJnczogYW55W10pID0+IGFueT4oXG5jbHMsIHBhcmFtcyA9IHtcbiAgICBtZXNzYWdlOiBgSW5wdXQgbm90IGluc3RhbmNlIG9mICR7Y2xzLm5hbWV9YCxcbn0pID0+IGN1c3RvbSgoZGF0YSkgPT4gZGF0YSBpbnN0YW5jZW9mIGNscywgcGFyYW1zKTtcbmNvbnN0IHN0cmluZ1R5cGUgPSBab2RTdHJpbmcuY3JlYXRlO1xuY29uc3QgbnVtYmVyVHlwZSA9IFpvZE51bWJlci5jcmVhdGU7XG5jb25zdCBuYW5UeXBlID0gWm9kTmFOLmNyZWF0ZTtcbmNvbnN0IGJpZ0ludFR5cGUgPSBab2RCaWdJbnQuY3JlYXRlO1xuY29uc3QgYm9vbGVhblR5cGUgPSBab2RCb29sZWFuLmNyZWF0ZTtcbmNvbnN0IGRhdGVUeXBlID0gWm9kRGF0ZS5jcmVhdGU7XG5jb25zdCBzeW1ib2xUeXBlID0gWm9kU3ltYm9sLmNyZWF0ZTtcbmNvbnN0IHVuZGVmaW5lZFR5cGUgPSBab2RVbmRlZmluZWQuY3JlYXRlO1xuY29uc3QgbnVsbFR5cGUgPSBab2ROdWxsLmNyZWF0ZTtcbmNvbnN0IGFueVR5cGUgPSBab2RBbnkuY3JlYXRlO1xuY29uc3QgdW5rbm93blR5cGUgPSBab2RVbmtub3duLmNyZWF0ZTtcbmNvbnN0IG5ldmVyVHlwZSA9IFpvZE5ldmVyLmNyZWF0ZTtcbmNvbnN0IHZvaWRUeXBlID0gWm9kVm9pZC5jcmVhdGU7XG5jb25zdCBhcnJheVR5cGUgPSBab2RBcnJheS5jcmVhdGU7XG5jb25zdCBvYmplY3RUeXBlID0gWm9kT2JqZWN0LmNyZWF0ZTtcbmNvbnN0IHN0cmljdE9iamVjdFR5cGUgPSBab2RPYmplY3Quc3RyaWN0Q3JlYXRlO1xuY29uc3QgdW5pb25UeXBlID0gWm9kVW5pb24uY3JlYXRlO1xuY29uc3QgZGlzY3JpbWluYXRlZFVuaW9uVHlwZSA9IFpvZERpc2NyaW1pbmF0ZWRVbmlvbi5jcmVhdGU7XG5jb25zdCBpbnRlcnNlY3Rpb25UeXBlID0gWm9kSW50ZXJzZWN0aW9uLmNyZWF0ZTtcbmNvbnN0IHR1cGxlVHlwZSA9IFpvZFR1cGxlLmNyZWF0ZTtcbmNvbnN0IHJlY29yZFR5cGUgPSBab2RSZWNvcmQuY3JlYXRlO1xuY29uc3QgbWFwVHlwZSA9IFpvZE1hcC5jcmVhdGU7XG5jb25zdCBzZXRUeXBlID0gWm9kU2V0LmNyZWF0ZTtcbmNvbnN0IGZ1bmN0aW9uVHlwZSA9IFpvZEZ1bmN0aW9uLmNyZWF0ZTtcbmNvbnN0IGxhenlUeXBlID0gWm9kTGF6eS5jcmVhdGU7XG5jb25zdCBsaXRlcmFsVHlwZSA9IFpvZExpdGVyYWwuY3JlYXRlO1xuY29uc3QgZW51bVR5cGUgPSBab2RFbnVtLmNyZWF0ZTtcbmNvbnN0IG5hdGl2ZUVudW1UeXBlID0gWm9kTmF0aXZlRW51bS5jcmVhdGU7XG5jb25zdCBwcm9taXNlVHlwZSA9IFpvZFByb21pc2UuY3JlYXRlO1xuY29uc3QgZWZmZWN0c1R5cGUgPSBab2RFZmZlY3RzLmNyZWF0ZTtcbmNvbnN0IG9wdGlvbmFsVHlwZSA9IFpvZE9wdGlvbmFsLmNyZWF0ZTtcbmNvbnN0IG51bGxhYmxlVHlwZSA9IFpvZE51bGxhYmxlLmNyZWF0ZTtcbmNvbnN0IHByZXByb2Nlc3NUeXBlID0gWm9kRWZmZWN0cy5jcmVhdGVXaXRoUHJlcHJvY2VzcztcbmNvbnN0IHBpcGVsaW5lVHlwZSA9IFpvZFBpcGVsaW5lLmNyZWF0ZTtcbmNvbnN0IG9zdHJpbmcgPSAoKSA9PiBzdHJpbmdUeXBlKCkub3B0aW9uYWwoKTtcbmNvbnN0IG9udW1iZXIgPSAoKSA9PiBudW1iZXJUeXBlKCkub3B0aW9uYWwoKTtcbmNvbnN0IG9ib29sZWFuID0gKCkgPT4gYm9vbGVhblR5cGUoKS5vcHRpb25hbCgpO1xuZXhwb3J0IGNvbnN0IGNvZXJjZSA9IHtcbiAgICBzdHJpbmc6ICgoYXJnKSA9PiBab2RTdHJpbmcuY3JlYXRlKHsgLi4uYXJnLCBjb2VyY2U6IHRydWUgfSkpLFxuICAgIG51bWJlcjogKChhcmcpID0+IFpvZE51bWJlci5jcmVhdGUoeyAuLi5hcmcsIGNvZXJjZTogdHJ1ZSB9KSksXG4gICAgYm9vbGVhbjogKChhcmcpID0+IFpvZEJvb2xlYW4uY3JlYXRlKHtcbiAgICAgICAgLi4uYXJnLFxuICAgICAgICBjb2VyY2U6IHRydWUsXG4gICAgfSkpLFxuICAgIGJpZ2ludDogKChhcmcpID0+IFpvZEJpZ0ludC5jcmVhdGUoeyAuLi5hcmcsIGNvZXJjZTogdHJ1ZSB9KSksXG4gICAgZGF0ZTogKChhcmcpID0+IFpvZERhdGUuY3JlYXRlKHsgLi4uYXJnLCBjb2VyY2U6IHRydWUgfSkpLFxufTtcbmV4cG9ydCB7IGFueVR5cGUgYXMgYW55LCBhcnJheVR5cGUgYXMgYXJyYXksIGJpZ0ludFR5cGUgYXMgYmlnaW50LCBib29sZWFuVHlwZSBhcyBib29sZWFuLCBkYXRlVHlwZSBhcyBkYXRlLCBkaXNjcmltaW5hdGVkVW5pb25UeXBlIGFzIGRpc2NyaW1pbmF0ZWRVbmlvbiwgZWZmZWN0c1R5cGUgYXMgZWZmZWN0LCBlbnVtVHlwZSBhcyBlbnVtLCBmdW5jdGlvblR5cGUgYXMgZnVuY3Rpb24sIGluc3RhbmNlT2ZUeXBlIGFzIGluc3RhbmNlb2YsIGludGVyc2VjdGlvblR5cGUgYXMgaW50ZXJzZWN0aW9uLCBsYXp5VHlwZSBhcyBsYXp5LCBsaXRlcmFsVHlwZSBhcyBsaXRlcmFsLCBtYXBUeXBlIGFzIG1hcCwgbmFuVHlwZSBhcyBuYW4sIG5hdGl2ZUVudW1UeXBlIGFzIG5hdGl2ZUVudW0sIG5ldmVyVHlwZSBhcyBuZXZlciwgbnVsbFR5cGUgYXMgbnVsbCwgbnVsbGFibGVUeXBlIGFzIG51bGxhYmxlLCBudW1iZXJUeXBlIGFzIG51bWJlciwgb2JqZWN0VHlwZSBhcyBvYmplY3QsIG9ib29sZWFuLCBvbnVtYmVyLCBvcHRpb25hbFR5cGUgYXMgb3B0aW9uYWwsIG9zdHJpbmcsIHBpcGVsaW5lVHlwZSBhcyBwaXBlbGluZSwgcHJlcHJvY2Vzc1R5cGUgYXMgcHJlcHJvY2VzcywgcHJvbWlzZVR5cGUgYXMgcHJvbWlzZSwgcmVjb3JkVHlwZSBhcyByZWNvcmQsIHNldFR5cGUgYXMgc2V0LCBzdHJpY3RPYmplY3RUeXBlIGFzIHN0cmljdE9iamVjdCwgc3RyaW5nVHlwZSBhcyBzdHJpbmcsIHN5bWJvbFR5cGUgYXMgc3ltYm9sLCBlZmZlY3RzVHlwZSBhcyB0cmFuc2Zvcm1lciwgdHVwbGVUeXBlIGFzIHR1cGxlLCB1bmRlZmluZWRUeXBlIGFzIHVuZGVmaW5lZCwgdW5pb25UeXBlIGFzIHVuaW9uLCB1bmtub3duVHlwZSBhcyB1bmtub3duLCB2b2lkVHlwZSBhcyB2b2lkLCB9O1xuZXhwb3J0IGNvbnN0IE5FVkVSID0gSU5WQUxJRDtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2l6aW5nLnRzIFx1MjAxNCBTaGFyZWQgcGVyLWJsb2NrIHNpemluZyBmcmFnbWVudCAodmFyaWFibGUgYmxvY2sgc2l6aW5nLCBEcm9wIDEpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gT25lIHVuaWZpZWQgbWVjaGFuaXNtIGZvciBcInRoaXMgYmxvY2sgcmVuZGVycyBuYXJyb3dlciB0aGFuIGl0cyBjb250YWluZXJcIjpcbi8vIGFuIG9wdGlvbmFsIHdpZHRoIEZSQUNUSU9OIHBsdXMgYW4gb3B0aW9uYWwgYWxpZ25tZW50LiBBcHBsaWVkIHRvZGF5IHRvXG4vLyBJbWFnZUJsb2NrIGFuZCBNYXRoQmxvY2sgKHRoZSBzaXphYmxlIHNldCB3aXRoIGEgcmVhbCBhdXRob3Jpbmcgc3VyZmFjZSk7XG4vLyBleHRlbmRzIHRvIG90aGVyIGJsb2NrcyBhZGRpdGl2ZWx5IHdoZW4gdGhlaXIgZWRpdGluZyBVSSBsYW5kcy4gRGVzaWduOlxuLy8gZG9jcy9kZXNpZ24vdmFyaWFibGUtYmxvY2stc2l6aW5nLm1kLlxuLy9cbi8vIFJlZmxvdy1zYWZlIGJ5IGNvbnN0cnVjdGlvbjogd2lkdGggaXMgcmVsYXRpdmUgKGEgZnJhY3Rpb24gb2Ygd2hhdGV2ZXJcbi8vIGNvbnRhaW5lciB0aGUgYmxvY2sgc2l0cyBpbiBcdTIwMTQgcGFnZSBvciBjb2x1bW4gY2VsbCksIG5ldmVyIGFic29sdXRlIHBpeGVscyxcbi8vIGFuZCBhIG5hcnJvd2VkIGJsb2NrIHN0YXlzIGluIG5vcm1hbCBmbG93IChubyB3cmFwLWFyb3VuZC9mbG9hdCksIHNvIHByaW50XG4vLyBwYWdpbmF0aW9uIGFuZCB0aGUgZm9sZGFibGUncyBoZWlnaHQgbWVhc3VyZW1lbnQga2VlcCB3b3JraW5nLlxuLy9cbi8vIHdpZHRoIFx1MjAxNCBmcmFjdGlvbiBvZiB0aGUgY29udGFpbmVyJ3MgY29udGVudCB3aWR0aCwgaW4gKDAsIDFdLiBBYnNlbnQgPSBmdWxsXG4vLyB3aWR0aCAodG9kYXkncyBiZWhhdmlvcikuIFRoZSBlZGl0b3IgVUkgc25hcHMgdG8gY2xlYW4gc3RvcHMgKDI1LzMzLzUwLzY2L1xuLy8gNzUvMTAwJSkgYnV0IHRoZSBzY2hlbWEgYWNjZXB0cyBhbnkgZnJhY3Rpb24gc28gZmluZS1ncmFpbmVkIGRyYWdzIHZhbGlkYXRlLlxuLy9cbi8vIGFsaWduIFx1MjAxNCB3aGVyZSB0aGUgbmFycm93ZWQgYmxvY2sgc2l0cyBob3Jpem9udGFsbHkuIEFic2VudCA9IGNlbnRlciAodGhlXG4vLyBuYXR1cmFsIHJlYWQgZm9yIGZpZ3VyZXMgb24gYSB3b3Jrc2hlZXQpOyBvbmx5IG1lYW5pbmdmdWwgd2hlbiB3aWR0aCBpc1xuLy8gcHJlc2VudCwgYW5kIHRoZSByZW5kZXJlciBpZ25vcmVzIGl0IG90aGVyd2lzZS4gU3RvcmVkIG9ubHkgd2hlbiB3aWR0aCBpc1xuLy8gc2V0IGFuZCB0aGUgdmFsdWUgaXMgJ2xlZnQnLydyaWdodCcsIHNvIHJvdW5kLXRyaXAgZXF1YWxpdHkgaG9sZHMgZm9yIHRoZVxuLy8gZGVmYXVsdCBjYXNlLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5cbmV4cG9ydCBjb25zdCBCbG9ja0FsaWduID0gei5lbnVtKFsnbGVmdCcsICdjZW50ZXInLCAncmlnaHQnXSk7XG5leHBvcnQgdHlwZSBCbG9ja0FsaWduID0gei5pbmZlcjx0eXBlb2YgQmxvY2tBbGlnbj47XG5cbi8vIEZyYWN0aW9uIG9mIGNvbnRhaW5lciB3aWR0aC4gZ3QoMCkgbm90IG1pbigwKSBcdTIwMTQgYSB6ZXJvLXdpZHRoIGJsb2NrIGlzIGFcbi8vIGhpZGRlbiBibG9jaywgd2hpY2ggaXMgYSBkaWZmZXJlbnQgKG5vbmV4aXN0ZW50KSBmZWF0dXJlLlxuZXhwb3J0IGNvbnN0IEJsb2NrV2lkdGhGcmFjdGlvbiA9IHoubnVtYmVyKCkuZ3QoMCkubWF4KDEpO1xuXG4vLyBTcHJlYWQgaW50byBhIGJsb2NrJ3Mgei5vYmplY3Qoey4uLn0pIHNoYXBlLiBBIHBsYWluIG9iamVjdCAobm90IGEgWm9kXG4vLyBzY2hlbWEpIHNvIGVhY2ggYmxvY2sga2VlcHMgYSBmbGF0IGZpZWxkIGxpc3QgYW5kIGRpc2NyaW1pbmF0ZWRVbmlvbiBrZWVwc1xuLy8gd29ya2luZyB1bnRvdWNoZWQuXG5leHBvcnQgY29uc3Qgc2l6aW5nRmllbGRzID0ge1xuICB3aWR0aDogQmxvY2tXaWR0aEZyYWN0aW9uLm9wdGlvbmFsKCksXG4gIGFsaWduOiBCbG9ja0FsaWduLm9wdGlvbmFsKCksXG59O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgc2l6aW5nRmllbGRzIH0gZnJvbSAnLi4vc2l6aW5nLmpzJztcblxuLy8gQSBjcm9wIHdpbmRvdzogdGhlIHZpc2libGUgcmVjdGFuZ2xlIGluc2lkZSB0aGUgc291cmNlIGltYWdlLCBhcyBmcmFjdGlvbnMgb2Zcbi8vIHRoZSBzb3VyY2UncyBvd24gd2lkdGgvaGVpZ2h0LiB4LHkgPSB0b3AtbGVmdCBvZiB0aGUgd2luZG93OyB3LGggPSBpdHMgc2l6ZS5cbi8vIFRoZSB3aW5kb3cgbXVzdCBzdGF5IGluc2lkZSB0aGUgc291cmNlICh4K3cgXHUyMjY0IDEsIHkraCBcdTIyNjQgMSkuIEEgdGlueSBlcHNpbG9uXG4vLyBhYnNvcmJzIGZsb2F0IGVycm9yIGZyb20gdGhlIGVkaXRvcidzIHB4XHUyMTkyZnJhY3Rpb24gbWF0aC4gVGhlIHJlbmRlcmVyIGlzIHB1cmVcbi8vIChubyBpbWFnZSBkaW1lbnNpb25zKSwgc28gdGhlIGNyb3AgcGl4ZWwgYXNwZWN0IGlzIGRlcml2ZWQgZnJvbSB0aGUgc2VwYXJhdGVseVxuLy8gc3RvcmVkIGBzcmNBc3BlY3RgIChzZWUgSW1hZ2VCbG9jaykuIERlc2lnbjogZG9jcy9kZXNpZ24vaW1hZ2UtY3JvcC5tZC5cbmNvbnN0IENST1BfRVBTSUxPTiA9IDFlLTY7XG5leHBvcnQgY29uc3QgQ3JvcFJlY3QgPSB6XG4gIC5vYmplY3Qoe1xuICAgIHg6IHoubnVtYmVyKCkubWluKDApLmx0KDEpLFxuICAgIHk6IHoubnVtYmVyKCkubWluKDApLmx0KDEpLFxuICAgIHc6IHoubnVtYmVyKCkuZ3QoMCkubWF4KDEpLFxuICAgIGg6IHoubnVtYmVyKCkuZ3QoMCkubWF4KDEpLFxuICB9KVxuICAucmVmaW5lKFxuICAgIChjKSA9PiBjLnggKyBjLncgPD0gMSArIENST1BfRVBTSUxPTiAmJiBjLnkgKyBjLmggPD0gMSArIENST1BfRVBTSUxPTixcbiAgICB7IG1lc3NhZ2U6ICdjcm9wIHdpbmRvdyBtdXN0IHN0YXkgd2l0aGluIHRoZSBzb3VyY2UgKHgrdyBcdTIyNjQgMSwgeStoIFx1MjI2NCAxKScgfSxcbiAgKTtcbmV4cG9ydCB0eXBlIENyb3BSZWN0ID0gei5pbmZlcjx0eXBlb2YgQ3JvcFJlY3Q+O1xuXG4vLyBQaGFzZSAxOiBVUkwtb25seS4gTm8gdXBsb2FkIHBpcGVsaW5lOyB0ZWFjaGVycyBwYXN0ZSBhIHB1YmxpYyBVUkwuXG4vLyBQaGFzZSAyKzogYSBzZXBhcmF0ZSB2YXJpYW50IHdpdGggYSBTdXBhYmFzZSBTdG9yYWdlIHVwbG9hZCwgd2l0aCBzcmNcbi8vIHBvaW50aW5nIHRvIGEgc2lnbmVkIFVSTC4gU2NoZW1hIGlzIGZvcndhcmQtY29tcGF0aWJsZSBcdTIwMTQgYWRkaW5nIGEgbmV3XG4vLyBgc291cmNlYCBkaXNjcmltaW5hdG9yIGZpZWxkIGxhdGVyIGlzIG5vbi1icmVha2luZyBpZiBleGlzdGluZyByb3dzIGFyZVxuLy8gdHJlYXRlZCBhcyBgc291cmNlOiAndXJsJ2AgYnkgZGVmYXVsdC5cbmV4cG9ydCBjb25zdCBJbWFnZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnaW1hZ2UnKSxcbiAgc3JjOiB6LnN0cmluZygpLnVybCgpLFxuICAvLyBhbHQgaXMgcmVxdWlyZWQgZm9yIGFjY2Vzc2liaWxpdHkgYnV0IGRlZmF1bHRzIHRvIGVtcHR5IHN0cmluZyBmb3JcbiAgLy8gZGVjb3JhdGl2ZSBpbWFnZXMuIEVkaXRvcnMgc2hvdWxkIHdhcm4gKG5vdCBibG9jaykgb24gZW1wdHkgYWx0LlxuICBhbHQ6IHouc3RyaW5nKCkuZGVmYXVsdCgnJyksXG4gIGNhcHRpb246IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgLy8gVmFyaWFibGUgYmxvY2sgc2l6aW5nOiBvcHRpb25hbCB3aWR0aCBmcmFjdGlvbiArIGFsaWdubWVudCAoc2l6aW5nLnRzKS5cbiAgLy8gVGhpcyBJUyB0aGUgaW1hZ2UgZGlzcGxheS1zaXplIG1lY2hhbmlzbSBcdTIwMTQgbm8gc2VwYXJhdGUgaW50cmluc2ljIHNpemUuXG4gIC4uLnNpemluZ0ZpZWxkcyxcbiAgLy8gQ3JvcCAocmVmcmFtZSkgXHUyMDE0IHRoZSB2aXNpYmxlIHN1Yi1yZWN0YW5nbGUgb2YgdGhlIHNvdXJjZSAoZG9jcy9kZXNpZ24vXG4gIC8vIGltYWdlLWNyb3AubWQpLiBgc3JjQXNwZWN0YCAodGhlIHNvdXJjZSdzIG5hdHVyYWwgVy9IIHJhdGlvKSBsZXRzIHRoZSBwdXJlXG4gIC8vIHJlbmRlcmVyIGRlcml2ZSB0aGUgY3JvcCBwaXhlbCBhc3BlY3QgQSA9IHNyY0FzcGVjdFx1MDBCNyh3L2gpIHdpdGhvdXQgcmVhZGluZ1xuICAvLyBpbWFnZSBkaW1lbnNpb25zLiBTdG9yZWQgQk9USC1PUi1ORUlUSEVSOiBhbiB1bmNyb3BwZWQgaW1hZ2UgY2Fycmllc1xuICAvLyBuZWl0aGVyIChieXRlLWlkZW50aWNhbCB0byB0b2RheSkuIFRoZSBwYWlyaW5nIGlzIGVuZm9yY2VkIGluIHRoZSBlZGl0b3IgK1xuICAvLyBzZXJpYWxpemUgKG5vdCBhIHNjaGVtYSAucmVmaW5lIFx1MjAxNCBJbWFnZUJsb2NrIGlzIGEgZGlzY3JpbWluYXRlZFVuaW9uIG1lbWJlclxuICAvLyBhbmQgcmVmaW5lZCBvYmplY3RzIGNhbid0IGJlIGRpc2NyaW1pbmF0ZWQpOyBzZWUgc2VyaWFsaXplLnRzICsgQ1ItSU5WLWJvdGguXG4gIGNyb3A6IENyb3BSZWN0Lm9wdGlvbmFsKCksXG4gIHNyY0FzcGVjdDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIEltYWdlQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBJbWFnZUJsb2NrPjtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gZ3JhcGgtcHJpbWl0aXZlcy50cyBcdTIwMTQgY29vcmRpbmF0ZS1wbGFuZSBwcmltaXRpdmVzLCBkZXBlbmRlbmN5LWZyZWVcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgYXhpcyAvIGZ1bmN0aW9uLW1vZGVsIC8gZHJhd2FibGUgdm9jYWJ1bGFyeSBzaGFyZWQgYnkgZXZlcnkgZ3JhcGgtc2hhcGVkXG4vLyBzdXJmYWNlOiBpbnRlcmFjdGl2ZV9ncmFwaCAodGhlIGdyYWRlZCBibG9jayksIGdyYXBoX2ZpZ3VyZSAodGhlIHN0YXRpY1xuLy8gcGljdHVyZSksIG11bHRpcGxlX2Nob2ljZSBjaG9pY2UgZmlndXJlcywgbWF0Y2hpbmcgc2lkZXMsIG51bWJlcl9saW5lXG4vLyAoRW5kcG9pbnRTdHlsZSksIGFuZCBkYXRhX3Bsb3QuXG4vL1xuLy8gVGhlc2Ugc2NoZW1hcyBsaXZlIEhFUkUsIGluIGEgbGVhZiBtb2R1bGUgdGhhdCBpbXBvcnRzIG5vdGhpbmcgYnV0IHpvZCxcbi8vIHJhdGhlciB0aGFuIGluIGJsb2Nrcy9pbnRlcmFjdGl2ZS1ncmFwaC50cyB3aGVyZSB0aGV5IGdyZXcgdXAuIFRoZSByZWFzb24gaXNcbi8vIGEgaGFyZCBvbmUsIG5vdCB0aWRpbmVzczogaW50ZXJhY3RpdmUtZ3JhcGgudHMgaW1wb3J0cyBJbmxpbmVOb2RlIGZyb21cbi8vIGlubGluZS50cyAoaXRzIHByb21wdC9mZWVkYmFjay9zb2x1dGlvbiBmaWVsZHMpLCBzbyBhbnl0aGluZyByZWFjaGluZyB0aGVzZVxuLy8gcHJpbWl0aXZlcyBUSFJPVUdIIGl0IGluaGVyaXRzIGEgZGVwZW5kZW5jeSBvbiBpbmxpbmUudHMuIFdoZW4gaW5saW5lLnRzXG4vLyBpdHNlbGYgbmVlZHMgdGhlbSBcdTIwMTQgRGVmaW5pdGlvbkJsb2NrIGFkbWl0cyBhIGdyYXBoX2ZpZ3VyZSwgc2VlIGlubGluZS50cyBcdTIwMTRcbi8vIHRoYXQgY2xvc2VzIHRoZSBjeWNsZSBpbmxpbmUudHMgLT4gZ3JhcGgtZmlndXJlLnRzIC0+IGludGVyYWN0aXZlLWdyYXBoLnRzIC0+XG4vLyBpbmxpbmUudHMsIGFuZCB0aGUgY3ljbGUgaXMgZmF0YWwgcmF0aGVyIHRoYW4gY29zbWV0aWM6IGludGVyYWN0aXZlLWdyYXBoLnRzXG4vLyBldmFsdWF0ZXMgYHouYXJyYXkoSW5saW5lTm9kZSlgIGF0IG1vZHVsZSBzY29wZSwgc28gYSBwYXJ0aWFsbHktaW5pdGlhbGl6ZWRcbi8vIGlubGluZS5qcyB0aHJvd3MgYSBURFogUmVmZXJlbmNlRXJyb3IgYXQgaW1wb3J0IHRpbWUuXG4vL1xuLy8gYmxvY2tzL2ludGVyYWN0aXZlLWdyYXBoLnRzIHJlLWV4cG9ydHMgZXZlcnl0aGluZyBoZXJlLCBzbyBldmVyeSBleGlzdGluZ1xuLy8gaW1wb3J0ZXIga2VlcHMgaXRzIGN1cnJlbnQgaW1wb3J0IHBhdGggYW5kIGlkZW50aXR5IFx1MjAxNCBub3RoaW5nIG1vdmVkIGZyb20gYVxuLy8gY29uc3VtZXIncyBwb2ludCBvZiB2aWV3LiBOZXcgaW5saW5lLXJlYWNoYWJsZSBjb2RlIChncmFwaC1maWd1cmUudHMpIGltcG9ydHNcbi8vIGZyb20gdGhpcyBtb2R1bGUgZGlyZWN0bHkuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcblxuLy8gLS0tLSBBeGlzIGNvbmZpZ3VyYXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBjb29yZGluYXRlIHBsYW5lIHRoZSBzdHVkZW50IHdvcmtzIGluLiBHcmFwaCB1bml0cyB0aHJvdWdob3V0IFx1MjAxNCB0b2xlcmFuY2Vcbi8vIGFuZCBncmlkIHN0ZXBzIGFyZSBpbiB0aGUgc2FtZSB1bml0cywgbmV2ZXIgcGl4ZWxzLCBzbyBhIHB1Ymxpc2hlZCBwYWdlIHRoYXRcbi8vIHJlLWxheXMtb3V0IGF0IGEgZGlmZmVyZW50IHNpemUgc3RpbGwgc2NvcmVzIGlkZW50aWNhbGx5LlxuZXhwb3J0IGNvbnN0IEF4aXNDb25maWcgPSB6Lm9iamVjdCh7XG4gIHhNaW46IHoubnVtYmVyKCksXG4gIHhNYXg6IHoubnVtYmVyKCksXG4gIHlNaW46IHoubnVtYmVyKCksXG4gIHlNYXg6IHoubnVtYmVyKCksXG4gIHhHcmlkU3RlcDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLmRlZmF1bHQoMSksXG4gIHlHcmlkU3RlcDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLmRlZmF1bHQoMSksXG4gIHNob3dHcmlkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAvLyBXaGVuIHRydWUsIGEgZHJhZ2dlZCBoYW5kbGUgc25hcHMgdG8gdGhlIG5lYXJlc3QgZ3JpZCBpbnRlcnNlY3Rpb24uIEtleWJvYXJkXG4gIC8vIG51ZGdlIGFsd2F5cyBtb3ZlcyBieSBvbmUgZ3JpZCBzdGVwIHJlZ2FyZGxlc3MgKFNoaWZ0ID0gMC4xIHN0ZXAsIGZpbmUpLlxuICBzbmFwVG9HcmlkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxufSk7XG5leHBvcnQgdHlwZSBBeGlzQ29uZmlnID0gei5pbmZlcjx0eXBlb2YgQXhpc0NvbmZpZz47XG5cbi8vIC0tLS0gRW5kcG9pbnQgc3R5bGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBvcGVuID0gaG9sbG93IGRvdCwgdmFsdWUgRVhDTFVERUQgKGEgc3RyaWN0IGluZXF1YWxpdHkgYm91bmRhcnksIGFuIG9wZW5cbi8vIGludGVydmFsIGVuZCk7IGNsb3NlZCA9IGZpbGxlZCBkb3QsIHZhbHVlIElOQ0xVREVELiBBIHNoYXJlZCB2b2NhYnVsYXJ5IHVzZWRcbi8vIGJ5IGluZXF1YWxpdHkgYm91bmRhcmllcyAoRHJvcCA0OiBzdHJpY3QgXHUyMTkyIG9wZW4pLCBkb21haW4tcmVzdHJpY3RlZCByYXlzIGFuZFxuLy8gc2VnbWVudHMgKERyb3AgNiksIGRpc3BsYXkgc2VnbWVudHMsIGFuZCB0aGUgZnV0dXJlIG51bWJlci1saW5lIGZhbWlseS4gQWRkZWRcbi8vIGFzIGEgZm91bmRhdGlvbiBub3cgKERyb3AgMik7IGNvbnN1bWVycyByZW5kZXIvc2NvcmUgaXQgaW4gdGhlaXIgb3duIGRyb3BzLlxuZXhwb3J0IGNvbnN0IEVuZHBvaW50U3R5bGUgPSB6LmVudW0oWydvcGVuJywgJ2Nsb3NlZCddKTtcbmV4cG9ydCB0eXBlIEVuZHBvaW50U3R5bGUgPSB6LmluZmVyPHR5cGVvZiBFbmRwb2ludFN0eWxlPjtcblxuLy8gRG9tYWluIHJlc3RyaWN0aW9uIG9uIGEgZHJhd24gY3VydmUgKERyb3AgNS82KTogcmF5cyBhbmQgc2VnbWVudHMgb2YgYVxuLy8gZnVuY3Rpb24uIFN0eWxlcyBtYXJrIHdoZXRoZXIgZWFjaCBlbmRwb2ludCBpcyBpbmNsdWRlZCAoY2xvc2VkKSBvciBub3QuXG5leHBvcnQgY29uc3QgQ3VydmVEb21haW4gPSB6Lm9iamVjdCh7XG4gIG1pbjogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBtaW5TdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxuICBtYXg6IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgbWF4U3R5bGU6IEVuZHBvaW50U3R5bGUub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ3VydmVEb21haW4gPSB6LmluZmVyPHR5cGVvZiBDdXJ2ZURvbWFpbj47XG5cbi8vIC0tLS0gRnVuY3Rpb24gbW9kZWxzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFYWNoIGZhbWlseSBjYXJyaWVzIGl0cyBwYXJhbWV0ZXJzICsgYSBwZXItcGFyYW1ldGVyIHRvbGVyYW5jZSwgYW5kIGl0c1xuLy8gcGFyYW1ldGVyIG5hbWVzIE1BVENIIHRoZSBraXQncyByZWdyZXNzaW9uIGZpdHRlcnMgKGdyYXBoLWtpdCBmaXRMaW5lYXIgL1xuLy8gZml0UXVhZHJhdGljIC8gZml0RXhwb25lbnRpYWwgLyBmaXRMb2dhcml0aG1pYykgc28gYSBmaXR0ZWQgY3VydmUgc2NvcmVzXG4vLyBhZ2FpbnN0IHRoZSBrZXkgd2l0aCBubyB0cmFuc2xhdGlvbi4gRm9ybXM6XG4vLyAgIGxpbmVhciAgICAgICB5ID0gc2xvcGVcdTAwQjd4ICsgaW50ZXJjZXB0XG4vLyAgIHF1YWRyYXRpYyAgICB5ID0gYVx1MDBCN3hcdTAwQjIgKyBiXHUwMEI3eCArIGNcbi8vICAgY3ViaWMgICAgICAgIHkgPSBhXHUwMEI3eFx1MDBCMyArIGJcdTAwQjd4XHUwMEIyICsgY1x1MDBCN3ggKyBkXG4vLyAgIHF1YXJ0aWMgICAgICB5ID0gYVx1MDBCN3hcdTIwNzQgKyBiXHUwMEI3eFx1MDBCMyArIGNcdTAwQjd4XHUwMEIyICsgZFx1MDBCN3ggKyBlXG4vLyAgIGV4cG9uZW50aWFsICB5ID0gYVx1MDBCN2JcdTAyRTMgICAgICAgICAgICAoYiA+IDApXG4vLyAgIGxvZ2FyaXRobWljICB5ID0gYSArIGJcdTAwQjdsbih4KSAgICAgKHggPiAwKVxuLy8gICB2ZXJ0aWNhbCAgICAgeCA9IGsgICAgICAgICAgICAgICAoTk9UIGEgeSA9IGYoeCkgY3VydmUgXHUyMDE0IHNjb3JlZCBvbiB4KVxuZXhwb3J0IGNvbnN0IExpbmVhck1vZGVsID0gei5vYmplY3Qoe1xuICBmYW1pbHk6IHoubGl0ZXJhbCgnbGluZWFyJyksXG4gIHNsb3BlOiB6Lm51bWJlcigpLFxuICBpbnRlcmNlcHQ6IHoubnVtYmVyKCksXG4gIHNsb3BlVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBpbnRlcmNlcHRUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIExpbmVhck1vZGVsID0gei5pbmZlcjx0eXBlb2YgTGluZWFyTW9kZWw+O1xuXG5leHBvcnQgY29uc3QgUXVhZHJhdGljTW9kZWwgPSB6Lm9iamVjdCh7XG4gIGZhbWlseTogei5saXRlcmFsKCdxdWFkcmF0aWMnKSxcbiAgYTogei5udW1iZXIoKSxcbiAgYjogei5udW1iZXIoKSxcbiAgYzogei5udW1iZXIoKSxcbiAgYVRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgYlRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgY1RvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgUXVhZHJhdGljTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBRdWFkcmF0aWNNb2RlbD47XG5cbmV4cG9ydCBjb25zdCBDdWJpY01vZGVsID0gei5vYmplY3Qoe1xuICBmYW1pbHk6IHoubGl0ZXJhbCgnY3ViaWMnKSxcbiAgYTogei5udW1iZXIoKSxcbiAgYjogei5udW1iZXIoKSxcbiAgYzogei5udW1iZXIoKSxcbiAgZDogei5udW1iZXIoKSxcbiAgYVRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgYlRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgY1RvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgZFRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ3ViaWNNb2RlbCA9IHouaW5mZXI8dHlwZW9mIEN1YmljTW9kZWw+O1xuXG5leHBvcnQgY29uc3QgUXVhcnRpY01vZGVsID0gei5vYmplY3Qoe1xuICBmYW1pbHk6IHoubGl0ZXJhbCgncXVhcnRpYycpLFxuICBhOiB6Lm51bWJlcigpLFxuICBiOiB6Lm51bWJlcigpLFxuICBjOiB6Lm51bWJlcigpLFxuICBkOiB6Lm51bWJlcigpLFxuICBlOiB6Lm51bWJlcigpLFxuICBhVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBiVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBjVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBkVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBlVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxufSk7XG5leHBvcnQgdHlwZSBRdWFydGljTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBRdWFydGljTW9kZWw+O1xuXG5leHBvcnQgY29uc3QgRXhwb25lbnRpYWxNb2RlbCA9IHoub2JqZWN0KHtcbiAgZmFtaWx5OiB6LmxpdGVyYWwoJ2V4cG9uZW50aWFsJyksXG4gIGE6IHoubnVtYmVyKCksXG4gIGI6IHoubnVtYmVyKCksXG4gIGFUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG4gIGJUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIEV4cG9uZW50aWFsTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBFeHBvbmVudGlhbE1vZGVsPjtcblxuZXhwb3J0IGNvbnN0IExvZ2FyaXRobWljTW9kZWwgPSB6Lm9iamVjdCh7XG4gIGZhbWlseTogei5saXRlcmFsKCdsb2dhcml0aG1pYycpLFxuICBhOiB6Lm51bWJlcigpLFxuICBiOiB6Lm51bWJlcigpLFxuICBhVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBiVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxufSk7XG5leHBvcnQgdHlwZSBMb2dhcml0aG1pY01vZGVsID0gei5pbmZlcjx0eXBlb2YgTG9nYXJpdGhtaWNNb2RlbD47XG5cbi8vIEEgdmVydGljYWwgbGluZSB4ID0gay4gSXQgaGFzIG5vIHkgPSBmKHgpIHJlcHJlc2VudGF0aW9uIChpbmZpbml0ZSBzbG9wZSksIHNvXG4vLyBpdCBjYW4ndCByaWRlIHRoZSByZWdyZXNzaW9uIGZpdHRlcnMgXHUyMDE0IHRoZSBraXQgc2NvcmVzIGl0IGRpcmVjdGx5IG9uIHRoZVxuLy8gc3R1ZGVudCdzIHguIEtlcHQgaW4gRnVuY3Rpb25Nb2RlbCAobm90IGEgc2VwYXJhdGUgaW50ZXJhY3Rpb24pIHNvIGF1dGhvcmluZyBhXG4vLyB2ZXJ0aWNhbCBsaW5lIGlzIHRoZSBzYW1lIFwidHlwZSBhbiBlcXVhdGlvblwiIGZsb3cgYXMgYW55IG90aGVyIGZhbWlseS5cbmV4cG9ydCBjb25zdCBWZXJ0aWNhbE1vZGVsID0gei5vYmplY3Qoe1xuICBmYW1pbHk6IHoubGl0ZXJhbCgndmVydGljYWwnKSxcbiAgeDogei5udW1iZXIoKSxcbiAgeFRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgVmVydGljYWxNb2RlbCA9IHouaW5mZXI8dHlwZW9mIFZlcnRpY2FsTW9kZWw+O1xuXG4vLyBEaXNjcmltaW5hdGVkIG9uIGBmYW1pbHlgIHNvIGNvbnN1bWVycyBicmFuY2ggdW5pZm9ybWx5LiBHcm93aW5nIGEgZmFtaWx5IGlzIGFcbi8vIG5ldyBtZW1iZXIgaGVyZSArIGEgbmV3IGZpdC9zY29yZSBicmFuY2ggaW4gdGhlIGtpdCBcdTIwMTQgbm8gb3RoZXIgYmxvY2sgdG91Y2hlZC5cbmV4cG9ydCBjb25zdCBGdW5jdGlvbk1vZGVsID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ2ZhbWlseScsIFtcbiAgTGluZWFyTW9kZWwsXG4gIFF1YWRyYXRpY01vZGVsLFxuICBDdWJpY01vZGVsLFxuICBRdWFydGljTW9kZWwsXG4gIEV4cG9uZW50aWFsTW9kZWwsXG4gIExvZ2FyaXRobWljTW9kZWwsXG4gIFZlcnRpY2FsTW9kZWwsXG5dKTtcbmV4cG9ydCB0eXBlIEZ1bmN0aW9uTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBGdW5jdGlvbk1vZGVsPjtcblxuLy8gLS0tLSBEcmF3YWJsZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGBEcmF3YWJsZWAgaXMgZGlzY3JpbWluYXRlZCBvbiBga2luZGAuIGBjdXJ2ZWAgUkVVU0VTIEZ1bmN0aW9uTW9kZWwsIHNvIHRoZVxuLy8gZGF5IHF1YWRyYXRpYy9leHBvbmVudGlhbC9sb2dhcml0aG1pYyBsYW5kIHRoZXkgbGlnaHQgdXAgaGVyZSBBTkQgaW5cbi8vIHBsb3RfZnVuY3Rpb24gYXQgb25jZS4gQSBgbGFiZWxgIHRleHQtYW5ub3RhdGlvbiBkcmF3YWJsZSBpcyBkZWxpYmVyYXRlbHlcbi8vIGRlZmVycmVkIChwb2ludC5sYWJlbCBjb3ZlcnMgdGhlIGNvbW1vbiBjYXNlKSBcdTIwMTQgWUFHTkksIGFkZGl0aXZlIHdoZW4gbmVlZGVkLlxuLy8gQXV0aG9yZWQgcGVyLWRyYXdhYmxlIGNvbG9yLiBTdG9yZWQgYXMgYSBwYWxldHRlIEtFWSAobm90IGEgaGV4KSBzbyBjb2xvcnNcbi8vIHN0YXkgc2VtYW50aWM7IHRoZSBrZXkgbGlzdCBpcyBkZWZpbmVkIEhFUkUgKGRlcGVuZGVuY3ktZnJlZSkgYW5kIHRoZSBrZXkgLT5cbi8vIGhleCBtYXAgbGl2ZXMgaW4gQGFjdGl2aXR5L2dyYXBoLWtpdCdzIERSQVdBQkxFX1BBTEVUVEUuIEEgZHJpZnQgZ3VhcmQgdGVzdFxuLy8ga2VlcHMgdGhlIHR3byBsaXN0cyBpbiBsb2Nrc3RlcC4gT3B0aW9uYWw6IGFic2VudCA9IHRoZSBzaGFyZWQgZGVmYXVsdCBjb2xvci5cbmV4cG9ydCBjb25zdCBEcmF3YWJsZUNvbG9yID0gei5lbnVtKFtcbiAgJ2JsdWUnLFxuICAnaW5kaWdvJyxcbiAgJ3RlYWwnLFxuICAnZ3JlZW4nLFxuICAnYW1iZXInLFxuICAncmVkJyxcbiAgJ3Zpb2xldCcsXG4gICdzbGF0ZScsXG5dKTtcbmV4cG9ydCB0eXBlIERyYXdhYmxlQ29sb3JUID0gei5pbmZlcjx0eXBlb2YgRHJhd2FibGVDb2xvcj47XG5cbmNvbnN0IFBvaW50RHJhd2FibGUgPSB6Lm9iamVjdCh7XG4gIGtpbmQ6IHoubGl0ZXJhbCgncG9pbnQnKSxcbiAgYXQ6IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgbGFiZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgLy8gb3BlbiA9IGhvbGxvdyAoZXhjbHVkZWQpLCBjbG9zZWQgPSBmaWxsZWQuIERlZmF1bHQgY2xvc2VkLlxuICBzdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxuICBjb2xvcjogRHJhd2FibGVDb2xvci5vcHRpb25hbCgpLFxufSk7XG5jb25zdCBDdXJ2ZURyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ2N1cnZlJyksXG4gIG1vZGVsOiBGdW5jdGlvbk1vZGVsLFxuICAvLyBEcm9wIDU6IGRhc2hlZCBib3VuZGFyeSArIGhhbGYtcGxhbmUgc2hhZGluZyB0dXJuIGEgZGlzcGxheSBjdXJ2ZSBpbnRvIGFcbiAgLy8gcGljdHVyZWQgaW5lcXVhbGl0eTsgZG9tYWluIHJlc3RyaWN0cyBpdCB0byBhIHJheS9zZWdtZW50LlxuICBzdHlsZTogei5lbnVtKFsnc29saWQnLCAnZGFzaGVkJ10pLm9wdGlvbmFsKCksXG4gIHNoYWRlOiB6LmVudW0oWydhYm92ZScsICdiZWxvdycsICdsZWZ0JywgJ3JpZ2h0J10pLm9wdGlvbmFsKCksXG4gIGRvbWFpbjogQ3VydmVEb21haW4ub3B0aW9uYWwoKSxcbiAgLy8gQ29udGludWF0aW9uIGFycm93aGVhZHMgb24gVU5CT1VOREVEIGVuZHMgKHRleHRib29rIGNvbnZlbnRpb246IGFycm93ID1cbiAgLy8gXCJrZWVwcyBnb2luZ1wiLCBkb3QgPSBcInN0b3BzIGhlcmVcIikuIERyYXduIHdoZXJlIHRoZSBjdXJ2ZSBleGl0cyB0aGUgdmlzaWJsZVxuICAvLyB3aW5kb3c7IGFuIGF1dGhvcmVkIGRvbWFpbiBib3VuZCBzdXBwcmVzc2VzIHRoYXQgZW5kJ3MgYXJyb3cgKGl0IGdldHMgdGhlXG4gIC8vIG9wZW4vY2xvc2VkIGRvdCBpbnN0ZWFkKS4gdW5kZWZpbmVkID0gdHJ1ZSBcdTIwMTQgYXJyb3dzIGFyZSB0aGUgY29udmVudGlvbixcbiAgLy8gdGhpcyBmbGFnIGlzIHRoZSBvcHQtb3V0IChhdXRob3IgY2FsbCAyMDI2LTA3LTEwKS5cbiAgYXJyb3dzOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICBjb2xvcjogRHJhd2FibGVDb2xvci5vcHRpb25hbCgpLFxufSk7XG5cbi8vIERyb3AgNTogcGxvdCBBTlkgcGFyc2VhYmxlIGZvcm11bGEgKHNpbih4KSwgcmF0aW9uYWxzLCBcdTIwMjYpIGJ5IHNhbXBsaW5nIFx1MjAxNCB0aGVcbi8vIGVzY2FwZSBoYXRjaCB0aGUgZ3JhZGVkIGZhbWlsaWVzIGRlbGliZXJhdGVseSBkb24ndCBjb3Zlci4gRGlzcGxheS1vbmx5LlxuY29uc3QgRXhwcmVzc2lvbkRyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ2V4cHJlc3Npb24nKSxcbiAgZXhwcmVzc2lvbjogei5zdHJpbmcoKS5taW4oMSksXG4gIHN0eWxlOiB6LmVudW0oWydzb2xpZCcsICdkYXNoZWQnXSkub3B0aW9uYWwoKSxcbiAgLy8gQ29udGludWF0aW9uIGFycm93aGVhZHMgYXQgYm90aCB3aW5kb3cgZXhpdHMgKHNlZSBDdXJ2ZURyYXdhYmxlLmFycm93cykuXG4gIGFycm93czogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgY29sb3I6IERyYXdhYmxlQ29sb3Iub3B0aW9uYWwoKSxcbn0pO1xuY29uc3QgU2VnbWVudERyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ3NlZ21lbnQnKSxcbiAgZnJvbTogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICB0bzogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICAvLyBEcm9wIDU6IG9wZW4vY2xvc2VkIGVuZHBvaW50IGRvdHMgKFtmcm9tLCB0b10pLiBEZWZhdWx0IGNsb3NlZC5cbiAgZW5kcG9pbnRzOiB6LnR1cGxlKFtFbmRwb2ludFN0eWxlLCBFbmRwb2ludFN0eWxlXSkub3B0aW9uYWwoKSxcbiAgY29sb3I6IERyYXdhYmxlQ29sb3Iub3B0aW9uYWwoKSxcbn0pO1xuXG4vLyBEcm9wIDU6IGEgcmF5IFx1MjAxNCBzdGFydHMgYXQgYGZyb21gIChvcGVuL2Nsb3NlZCksIHBhc3NlcyB0aHJvdWdoIGB0aHJvdWdoYCxcbi8vIHJ1bnMgdG8gdGhlIHdpbmRvdyBlZGdlLiBUaGUgcGh5c2ljcy1jbGFzcyBzdGFwbGUuXG5jb25zdCBSYXlEcmF3YWJsZSA9IHoub2JqZWN0KHtcbiAga2luZDogei5saXRlcmFsKCdyYXknKSxcbiAgZnJvbTogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICB0aHJvdWdoOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIGZyb21TdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxuICAvLyBDb250aW51YXRpb24gYXJyb3doZWFkIG9uIHRoZSB1bmJvdW5kZWQgZW5kIChzZWUgQ3VydmVEcmF3YWJsZS5hcnJvd3MpLlxuICBhcnJvd3M6IHouYm9vbGVhbigpLm9wdGlvbmFsKCksXG4gIGNvbG9yOiBEcmF3YWJsZUNvbG9yLm9wdGlvbmFsKCksXG59KTtcbmNvbnN0IFBvbHlnb25EcmF3YWJsZSA9IHoub2JqZWN0KHtcbiAga2luZDogei5saXRlcmFsKCdwb2x5Z29uJyksXG4gIHZlcnRpY2VzOiB6LmFycmF5KHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSkubWluKDMpLFxuICBmaWxsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gIGNvbG9yOiBEcmF3YWJsZUNvbG9yLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCBjb25zdCBEcmF3YWJsZSA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCdraW5kJywgW1xuICBQb2ludERyYXdhYmxlLFxuICBDdXJ2ZURyYXdhYmxlLFxuICBFeHByZXNzaW9uRHJhd2FibGUsXG4gIFNlZ21lbnREcmF3YWJsZSxcbiAgUmF5RHJhd2FibGUsXG4gIFBvbHlnb25EcmF3YWJsZSxcbl0pO1xuZXhwb3J0IHR5cGUgRHJhd2FibGUgPSB6LmluZmVyPHR5cGVvZiBEcmF3YWJsZT47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG4vLyBGcm9tIHRoZSBsZWFmIHByaW1pdGl2ZXMgbW9kdWxlLCBOT1QgZnJvbSAuL2ludGVyYWN0aXZlLWdyYXBoLmpzIFx1MjAxNCB0aGF0IGZpbGVcbi8vIGltcG9ydHMgaW5saW5lLnRzLCBhbmQgaW5saW5lLnRzIGltcG9ydHMgVEhJUyBvbmUgKGEgZGVmaW5pdGlvbiBtYXkgY29udGFpbiBhXG4vLyBncmFwaCBmaWd1cmUpLCBzbyByb3V0aW5nIHRocm91Z2ggaXQgd291bGQgY2xvc2UgYSBmYXRhbCBtb2R1bGUgY3ljbGUuIFNlZVxuLy8gLi4vZ3JhcGgtcHJpbWl0aXZlcy50cy5cbmltcG9ydCB7IEF4aXNDb25maWcsIERyYXdhYmxlIH0gZnJvbSAnLi4vZ3JhcGgtcHJpbWl0aXZlcy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBHcmFwaEZpZ3VyZUJsb2NrIFx1MjAxNCBhIHN0YXRpYyBjb29yZGluYXRlLXBsYW5lIHBpY3R1cmUgKG5ldmVyIGludGVyYWN0aXZlKS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIHB1cmUgQ09OVEVOVCBibG9jayAoZGF0YS1ibG9jay1jYXRlZ29yeT1cImNvbnRlbnRcIik6IG5vbi1pbnRlcmFjdGl2ZSxcbi8vIG5vbi1udW1iZXJlZCwgbm8gcnVudGltZSB3aXJpbmcsIG5vIHN1Ym1pc3Npb24gd2lyZSBpbXBhY3QuIFRoZSBzdGFuZGFsb25lXG4vLyBwcm9tb3Rpb24gb2YgdGhlIE1DL21hdGNoaW5nIENob2ljZUdyYXBoIGZpZ3VyZSAoeyBheGlzLCBkcmF3YWJsZXMgfSkgdG8gYVxuLy8gYmxvY2ssIGJ1aWx0IGZvciB0aGUgcmVmZXJlbmNlIHBhbmVsIFx1MjAxNCBcInRoZXNlIHR3byBsaW5lcyBhcmUgcGFyYWxsZWxcIi1zdHlsZVxuLy8gcGljdHVyZXMgb24gYSBmb3JtdWxhIHNoZWV0LlxuLy9cbi8vIFJlbmRlcmVkIHNlcnZlci1zaWRlIGFzIGlubGluZSBTVkcgYnkgdGhlIHJlbmRlcmVyJ3MgZ3JhcGgtc3ZnIGVuZ2luZSwgbmV2ZXJcbi8vIHRoZSBpbnRlcmFjdGl2ZSBraXQgXHUyMDE0IHNvIGl0IHdvcmtzIG9uIHBhcGVyLCBpbiB0aGUgcHJpbnQgYm94LCBhbmQgaW4gdGhlXG4vLyBmbG9hdGluZyBwYW5lbCB3aXRoIHplcm8gSlMuIENvbnNlcXVlbmNlIChzYW1lIGFzIENob2ljZUdyYXBoKTogYGV4cHJlc3Npb25gXG4vLyBkcmF3YWJsZXMgbmVlZCB0aGUga2l0J3MgZm9ybXVsYSBwYXJzZXIgYW5kIGFyZSBOT1QgZHJhd247IGF1dGhvcmluZ1xuLy8gc3VyZmFjZXMgZG9uJ3Qgb2ZmZXIgdGhlbSBoZXJlLlxuLy9cbi8vIERlbGliZXJhdGVseSBOT1QgYSBkaXNwbGF5LW1vZGUgaW50ZXJhY3RpdmVfZ3JhcGg6IHRoYXQgYmxvY2sgaXMgYSBudW1iZXJlZC1cbi8vIHF1ZXN0aW9uIGZhbWlseSB3aXRoIHByb21wdC9zb2x1dGlvbi9jb25maWRlbmNlIGNocm9tZSBhbmQga2l0IGh5ZHJhdGlvbi5cbi8vIFRoaXMgb25lIGNhbiBuZXZlciBhY2NlcHQgc3R1ZGVudCBpbnB1dCBieSBjb25zdHJ1Y3Rpb24sIHdoaWNoIGlzIHRoZVxuLy8gcmVmZXJlbmNlIHBhbmVsJ3MgY29udHJhY3QuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgY29uc3QgR3JhcGhGaWd1cmVCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2dyYXBoX2ZpZ3VyZScpLFxuICBheGlzOiBBeGlzQ29uZmlnLFxuICBkcmF3YWJsZXM6IHouYXJyYXkoRHJhd2FibGUpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBHcmFwaEZpZ3VyZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgR3JhcGhGaWd1cmVCbG9jaz47XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGlubGluZS50cyBcdTIwMTQgSW5saW5lIGNvbnRlbnQgbm9kZXNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBJbmxpbmUgbm9kZXMgYXJlIHRoZSBhdG9tcyBpbnNpZGUgYSBibG9jaydzIGBjb250ZW50YCBhcnJheS4gTW9zdCBibG9ja3Ncbi8vIGFjY2VwdCB0aGUgSW5saW5lTm9kZSB1bmlvbiAodGV4dCArIGlubGluZSBtYXRoKS4gVGhlIGZpbGxfaW5fYmxhbmsgYmxvY2tcbi8vIGlzIHNwZWNpYWw6IGl0IGFjY2VwdHMgYW4gZXh0ZW5kZWQgdW5pb24gdGhhdCBhbHNvIGluY2x1ZGVzIEJsYW5rVG9rZW4uXG4vL1xuLy8gRGlzY3JpbWluYXRpb246IGV2ZXJ5IGlubGluZSBub2RlIGhhcyBhIGB0eXBlYCBsaXRlcmFsLiBab2Qnc1xuLy8gZGlzY3JpbWluYXRlZFVuaW9uIGtleXMgb24gaXQsIHdoaWNoIGdpdmVzIHVzIG5hcnJvdyB0eXBlcyBhZnRlciBwYXJzaW5nXG4vLyBhbmQgY2xlYXIgZXJyb3IgbWVzc2FnZXMgb24gbWFsZm9ybWVkIGRhdGEuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbi8vIEJvdGggaW1wb3J0cyBhcmUgTEVBRi1TQUZFIFx1MjAxNCBuZWl0aGVyIG1vZHVsZSBpbXBvcnRzIGlubGluZS50cywgc28gbmVpdGhlclxuLy8gY3JlYXRlcyBhIGN5Y2xlLiBzaXppbmcuanMgYW5kIGJsb2Nrcy9pbWFnZS5qcydzIENyb3BSZWN0IGFyZSB6b2Qtb25seTtcbi8vIGJsb2Nrcy9ncmFwaC1maWd1cmUuanMgcmVhY2hlcyBpdHMgYXhpcy9kcmF3YWJsZSBwcmltaXRpdmVzIHZpYSB0aGUgbGVhZlxuLy8gZ3JhcGgtcHJpbWl0aXZlcy50cyBwcmVjaXNlbHkgc28gdGhhdCB0aGlzIGltcG9ydCBpcyBwb3NzaWJsZS4gRG8gbm90IHN3YXBcbi8vIGVpdGhlciBmb3IgYSBibG9ja3MvIG1vZHVsZSB0aGF0IGNhcnJpZXMgSW5saW5lTm9kZS5cbmltcG9ydCB7IHNpemluZ0ZpZWxkcywgdHlwZSBCbG9ja0FsaWduIH0gZnJvbSAnLi9zaXppbmcuanMnO1xuaW1wb3J0IHsgQ3JvcFJlY3QgfSBmcm9tICcuL2Jsb2Nrcy9pbWFnZS5qcyc7XG5pbXBvcnQgeyBHcmFwaEZpZ3VyZUJsb2NrIH0gZnJvbSAnLi9ibG9ja3MvZ3JhcGgtZmlndXJlLmpzJztcblxuLy8gLS0tLSBNYXJrcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE1hcmtzIGFyZSBmb3JtYXR0aW5nIGFwcGxpZWQgdG8gYSBydW4gb2YgdGV4dCBcdTIwMTQgbm90IG5lc3RlZCBlbGVtZW50cyAobm9cbi8vIDxlbT48c3Ryb25nPi4uLjwvc3Ryb25nPjwvZW0+IHN0cnVjdHVyZSk7IGEgc2luZ2xlIFRleHROb2RlIGNhbiBjYXJyeVxuLy8gc2V2ZXJhbC4gT3JkZXIgZG9lc24ndCBtYXR0ZXIgXHUyMDE0IHJlbmRlciBvdXRwdXQgaXMgY2Fub25pY2FsaXplZC5cbi8vXG4vLyBFYWNoIG1hcmsgaXMgYW4gT0JKRUNUIHdpdGggYSBgdHlwZWAgZGlzY3JpbWluYW50LiBTaW1wbGUgbWFya3MgKGJvbGQsIGV0Yy4pXG4vLyBjYXJyeSBvbmx5IGB0eXBlYDsgYXR0cmlidXRlLWNhcnJ5aW5nIG1hcmtzIChlLmcuIGBkZWZpbml0aW9uYCkgaGFuZyB0aGVpclxuLy8gZGF0YSBvZmYgdGhlIHNhbWUgb2JqZWN0LiBMZWdhY3kgZG9jdW1lbnRzIHN0b3JlZCBtYXJrcyBhcyBiYXJlIHN0cmluZ3Ncbi8vICgnYm9sZCcpOyB0aGUgcHJlcHJvY2VzcyBiZWxvdyB1cGdyYWRlcyB0aG9zZSB0byB0aGUgb2JqZWN0IGZvcm0gb24gcmVhZCwgc29cbi8vIG9sZCBhY3Rpdml0aWVzIGtlZXAgcGFyc2luZyB3aXRob3V0IGEgc2NoZW1hVmVyc2lvbiBidW1wLiBOZXcgY29kZSBhbHdheXNcbi8vIHdyaXRlcyB0aGUgb2JqZWN0IGZvcm0uXG5leHBvcnQgY29uc3QgU0lNUExFX01BUktfVFlQRVMgPSBbXG4gICdib2xkJyxcbiAgJ2l0YWxpYycsXG4gICd1bmRlcmxpbmUnLFxuICAnY29kZScsXG4gICdzdWJzY3JpcHQnLFxuICAnc3VwZXJzY3JpcHQnLFxuXSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIFNpbXBsZU1hcmtUeXBlID0gKHR5cGVvZiBTSU1QTEVfTUFSS19UWVBFUylbbnVtYmVyXTtcblxuY29uc3QgQm9sZE1hcmsgPSB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnYm9sZCcpIH0pO1xuY29uc3QgSXRhbGljTWFyayA9IHoub2JqZWN0KHsgdHlwZTogei5saXRlcmFsKCdpdGFsaWMnKSB9KTtcbmNvbnN0IFVuZGVybGluZU1hcmsgPSB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgndW5kZXJsaW5lJykgfSk7XG5jb25zdCBDb2RlTWFyayA9IHoub2JqZWN0KHsgdHlwZTogei5saXRlcmFsKCdjb2RlJykgfSk7XG5jb25zdCBTdWJzY3JpcHRNYXJrID0gei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ3N1YnNjcmlwdCcpIH0pO1xuY29uc3QgU3VwZXJzY3JpcHRNYXJrID0gei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ3N1cGVyc2NyaXB0JykgfSk7XG5cbi8vIFRoZSBhdHRyaWJ1dGUtZnJlZSBtYXJrcyBhcyBhIHVuaW9uLiBEZWZpbml0aW9uIGNvbnRlbnQgKGJlbG93KSBhbGxvd3Mgb25seVxuLy8gdGhlc2UgXHUyMDE0IGEgZGVmaW5pdGlvbiBjYW4gYmUgZm9ybWF0dGVkIGJ1dCBjYW5ub3QgaXRzZWxmIGNvbnRhaW4gYSBuZXN0ZWRcbi8vIGRlZmluaXRpb24sIHdoaWNoIGFsc28ga2VlcHMgdGhlIHNjaGVtYSBub24tcmVjdXJzaXZlLlxuY29uc3QgU2ltcGxlTWFyayA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBCb2xkTWFyayxcbiAgSXRhbGljTWFyayxcbiAgVW5kZXJsaW5lTWFyayxcbiAgQ29kZU1hcmssXG4gIFN1YnNjcmlwdE1hcmssXG4gIFN1cGVyc2NyaXB0TWFyayxcbl0pO1xuXG4vLyAtLS0tIE1hdGggcHJvbXB0IChNb2RlbCBBOiBpbi1lcXVhdGlvbiBibGFuaykgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBncmFkZWFibGUgZ2FwIElOU0lERSBhIHJlbmRlcmVkIGVxdWF0aW9uIFx1MjAxNCB0aGUgTWF0aExpdmUgYFxccGxhY2Vob2xkZXJbaWRde31gXG4vLyBmZWF0dXJlLiBgaWRgIG1hdGNoZXMgdGhlIHBsYWNlaG9sZGVyIG1hcmtlciBpbiB0aGUgb3duaW5nIG5vZGUncyBgbGF0ZXhgOyB0aGVcbi8vIHN0dWRlbnQncyB0eXBlZCBtYXRoIGV4cHJlc3Npb24gaXMgZ3JhZGVkIGV4YWN0bHkgbGlrZSBhICdtYXRoJyBmaWxsLWluLWJsYW5rXG4vLyAobnVtZXJpYy1zYW1wbGluZyBlcXVpdmFsZW5jZSwgMmEgXHUyMjYxIGErYSBcdTIyNjEgYSoyKS4gTW9kZWwgQSByZXVzZXMgdGhlIGV4aXN0aW5nXG4vLyBgc3VibWlzc2lvbnMucmVzcG9uc2VzLmJsYW5rc2AgbWFwIGtleWVkIGJ5IHRoaXMgaWQsIHNvIHByb21wdHMgbmVlZCBOTyBuZXdcbi8vIHdpcmUgc2hhcGUuIEEgZ2FwIGlzIGluaGVyZW50bHkgYSBtYXRoIGFuc3dlciwgc28gdGhlcmUgaXMgbm8gYGFuc3dlclR5cGVgXG4vLyBoZXJlIFx1MjAxNCBgZXF1aXZhbGVuY2VgICsgYHRvbGVyYW5jZWAgYXJlIHRoZSBzYW1lIGdyYWRpbmcga25vYnMgYSAnbWF0aCdcbi8vIEJsYW5rVG9rZW4gY2FycmllcywgcmV1c2VkIHZlcmJhdGltLiBTZWUgZG9jcy9kZXNpZ24vbWF0aC1ibGFua3MubWQgKE1vZGVsIEEpLlxuZXhwb3J0IGNvbnN0IE1hdGhQcm9tcHQgPSB6Lm9iamVjdCh7XG4gIC8vIE1hdGNoZXMgdGhlIGBcXHBsYWNlaG9sZGVyW2lkXXt9YCBtYXJrZXIgaW4gdGhlIG93bmluZyBub2RlJ3MgbGF0ZXguIE5PVCBhXG4gIC8vIHV1aWQ6IE1hdGhMaXZlIHBsYWNlaG9sZGVyIGlkcyBtYXkgbm90IGNvbnRhaW4gc3BhY2VzL3NwZWNpYWwgY2hhcmFjdGVyc1xuICAvLyAodXVpZCBoeXBoZW5zIGFyZSB1bnNhZmUpLCBzbyB0aGUgZWRpdG9yIG1pbnRzIGEgTWF0aExpdmUtc2FmZSB0b2tlbi5cbiAgLy8gRG9jdW1lbnQtd2lkZSB1bmlxdWVuZXNzIChpdCBrZXlzIGludG8gdGhlIGJsYW5rcyBtYXApIGlzIGFuIGF1dGhvcmluZy10aW1lXG4gIC8vIGludmFyaWFudCwgbm90IGEgc2NoZW1hIGNvbnN0cmFpbnQuXG4gIGlkOiB6LnN0cmluZygpLm1pbigxKSxcbiAgYW5zd2VyOiB6LnN0cmluZygpLm1pbigxKSxcbiAgLy8gQWx0ZXJuYXRpdmUgYWNjZXB0YWJsZSBmb3JtcyAoXCJhbHNvIGFjY2VwdFwiKS4gRW1wdHkgYXJyYXkgaXMgdGhlIGNvbW1vbiBjYXNlLlxuICBhY2NlcHRhYmxlQW5zd2Vyczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgLy8gRXF1aXZhbGVuY2UgbW9kZTogJ3ZhbHVlJyAoZGVmYXVsdCwgYW55IGV4cHJlc3Npb24gdGhhdCBldmFsdWF0ZXMgZXF1YWwpIG9yXG4gIC8vICdleGFjdC1mb3JtJyAobm9ybWFsaXplZC1zdHJpbmcgbWF0Y2gpLiBBYnNlbnQgPSAndmFsdWUnLiBNaXJyb3JzIEJsYW5rVG9rZW4uXG4gIGVxdWl2YWxlbmNlOiB6LmVudW0oWyd2YWx1ZScsICdleGFjdC1mb3JtJ10pLm9wdGlvbmFsKCksXG4gIC8vIEFic29sdXRlIHNhbXBsaW5nIHRvbGVyYW5jZS4gQWJzZW50ID0gbm8gZXh0cmEgc2xhY2suIE1pcnJvcnMgQmxhbmtUb2tlbi5cbiAgdG9sZXJhbmNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNYXRoUHJvbXB0ID0gei5pbmZlcjx0eXBlb2YgTWF0aFByb21wdD47XG5cbi8vIC0tLS0gSW5saW5lIG1hdGggLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBMYVRlWCBzb3VyY2UgZm9yIEthVGVYLiBTdG9yZWQgdmVyYmF0aW07IHJlbmRlcmVkIGF0IHJlbmRlciB0aW1lLiBUaGVcbi8vIHJlbmRlcmVyIGlzIHRvbGVyYW50IG9mIGludmFsaWQgTGFUZVggKHJlbmRlcnMgYW4gZXJyb3IgaW5kaWNhdG9yIHJhdGhlclxuLy8gdGhhbiBjcmFzaGluZykgc28gc2F2aW5nIGEgZG9jIHdpdGggYnJva2VuIG1hdGggZG9lc24ndCBsb2NrIHRoZSBlZGl0b3IuXG5leHBvcnQgY29uc3QgSW5saW5lTWF0aE5vZGUgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnbWF0aF9pbmxpbmUnKSxcbiAgbGF0ZXg6IHouc3RyaW5nKCksXG4gIC8vIE1vZGVsIEE6IG9wdGlvbmFsIGluLWVxdWF0aW9uIGdyYWRlYWJsZSBnYXBzIChcdTAwQTdNYXRoUHJvbXB0KS4gT3B0aW9uYWwgd2l0aFxuICAvLyBOTyBkZWZhdWx0IHNvIGEgbWF0aCBub2RlIGF1dGhvcmVkIGJlZm9yZSBNb2RlbCBBIFx1MjAxNCBvciBvbmUgd2l0aCBubyBnYXBzIFx1MjAxNFxuICAvLyByZS1zZXJpYWxpemVzIEJZVEUtSURFTlRJQ0FMTFkgKGEgYC5kZWZhdWx0KFtdKWAgd291bGQgbWF0ZXJpYWxpemUgYHByb21wdHM6XG4gIC8vIFtdYCBvbiBldmVyeSBsZWdhY3kgbm9kZSkuIFNhbWUgb3B0aW9uYWwtbm8tZGVmYXVsdCBkaXNjaXBsaW5lIGFzXG4gIC8vIEJsYW5rVG9rZW4uYW5zd2VyVHlwZS90b2xlcmFuY2UuIFNlZSBkb2NzL2Rlc2lnbi9tYXRoLWJsYW5rcy5tZCAoTW9kZWwgQSkuXG4gIHByb21wdHM6IHouYXJyYXkoTWF0aFByb21wdCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgSW5saW5lTWF0aE5vZGUgPSB6LmluZmVyPHR5cGVvZiBJbmxpbmVNYXRoTm9kZT47XG5cbi8vIC0tLS0gSGFyZCBicmVhayAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIHNvZnQgbGluZSBicmVhayBpbnNpZGUgYSBibG9jayAoVGlwdGFwJ3MgaGFyZEJyZWFrIC8gU2hpZnQrRW50ZXIpLCBhc1xuLy8gb3Bwb3NlZCB0byBhIG5ldyBibG9jay4gQ2FycmllcyBubyBkYXRhIFx1MjAxNCBpdCByZW5kZXJzIGFzIDxicj4uIFdpdGhvdXQgdGhpc1xuLy8gbm9kZSB0aGUgYnJlYWsgaXMgZHJvcHBlZCBvbiBzZXJpYWxpemUgYW5kIGFkamFjZW50IHRleHQgcnVucyBjb25jYXRlbmF0ZS5cbmV4cG9ydCBjb25zdCBIYXJkQnJlYWtOb2RlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2hhcmRfYnJlYWsnKSxcbn0pO1xuZXhwb3J0IHR5cGUgSGFyZEJyZWFrTm9kZSA9IHouaW5mZXI8dHlwZW9mIEhhcmRCcmVha05vZGU+O1xuXG4vLyAtLS0tIERlZmluaXRpb24gY29udGVudCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHJpY2ggY29udGVudCBzaG93biBpbiBhIGRlZmluaXRpb24ncyBwb3BvdmVyOiBmb3JtYXR0ZWQgdGV4dCArIGlubGluZVxuLy8gbWF0aCAodGhlIHNhbWUgYWxwaGFiZXQgdGhlIGJsYW5rIGhpbnQgdXNlcyksIGF1dGhvcmVkIHZpYSB0aGUgc2hhcmVkXG4vLyBJbmxpbmVSaWNoVGV4dEVkaXRvci4gQSBkZWZpbml0aW9uJ3MgdGV4dCBydW4gY2FycmllcyBTaW1wbGVNYXJrIG9ubHkgXHUyMDE0IG5vXG4vLyBuZXN0ZWQgZGVmaW5pdGlvbnMgXHUyMDE0IHdoaWNoIGFsc28gYnJlYWtzIHRoZSByZWN1cnNpb24gdGhhdCByZXVzaW5nIElubGluZU5vZGVcbi8vIGhlcmUgd291bGQgY3JlYXRlIChEZWZpbml0aW9uTWFyayBcdTIxOTIgY29udGVudCBcdTIxOTIgdGV4dCBcdTIxOTIgbWFya3MgXHUyMTkyIERlZmluaXRpb25NYXJrKS5cbmNvbnN0IERlZmluaXRpb25Db250ZW50VGV4dCA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCd0ZXh0JyksXG4gIHRleHQ6IHouc3RyaW5nKCksXG4gIG1hcmtzOiB6LmFycmF5KFNpbXBsZU1hcmspLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgY29uc3QgRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmUgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgRGVmaW5pdGlvbkNvbnRlbnRUZXh0LFxuICBJbmxpbmVNYXRoTm9kZSxcbiAgSGFyZEJyZWFrTm9kZSxcbl0pO1xuZXhwb3J0IHR5cGUgRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmUgPSB6LmluZmVyPHR5cGVvZiBEZWZpbml0aW9uQ29udGVudElubGluZT47XG5cbi8vIC0tLS0gRGVmaW5pdGlvbiBibG9ja3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIGRlZmluaXRpb24ncyBjb250ZW50IGlzIGEgQkxPQ0sgc2VxdWVuY2UsIHNvIGEgdm9jYWJ1bGFyeSBwb3BvdmVyIGNhbiBob2xkXG4vLyB3aGF0IGEgcmVmZXJlbmNlIHNoZWV0IGhvbGRzOiBhIGRpc3BsYXkgZXF1YXRpb24sIGEgc2hvcnQgcHJvcGVydHkgbGlzdCwgYVxuLy8gZmlndXJlLiBTZWUgZG9jcy9kZXNpZ24vZGVmaW5pdGlvbi1yaWNoLWNvbnRlbnQubWQuXG4vL1xuLy8gVGhlIHVuaW9uIGlzIGEgY3VyYXRlZCBzdWJzZXQgb2YgdGhlIHJlZmVyZW5jZSBwYW5lbCdzIGNvbnRlbnQgYmxvY2tzLCBhbmRcbi8vIGV2ZXJ5IHRleHQtYmVhcmluZyBtZW1iZXIgaXMgZGVmaW5lZCBMT0NBTExZIG92ZXIgRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmVcbi8vIHJhdGhlciB0aGFuIHJldXNpbmcgaXRzIGJsb2Nrcy8gc2libGluZy4gVGhhdCBpcyB3aGF0IGtlZXBzIHRoZSBzY2hlbWFcbi8vIE5PTi1SRUNVUlNJVkU6IGJsb2Nrcy9wYXJhZ3JhcGgudHMgYW5kIGZyaWVuZHMgY2FycnkgSW5saW5lTm9kZSwgd2hvc2Vcbi8vIFRleHROb2RlIGNhcnJpZXMgTWFyaywgd2hpY2ggaW5jbHVkZXMgRGVmaW5pdGlvbk1hcmsgXHUyMDE0IHNvIHJldXNpbmcgdGhlbSB3b3VsZFxuLy8gY2xvc2UgdGhlIGN5Y2xlIERlZmluaXRpb25NYXJrIC0+IGJsb2NrIC0+IHRleHQgLT4gbWFyayAtPiBEZWZpbml0aW9uTWFyayBhbmRcbi8vIGFkbWl0IGRlZmluaXRpb25zIG5lc3RlZCBpbnNpZGUgZGVmaW5pdGlvbnMgYXQgYXJiaXRyYXJ5IGRlcHRoLiBJdCB3b3VsZCBhbHNvXG4vLyBsYW5kIG9uIHRoZSBzYW1lIHRzYyBkZWNsYXJhdGlvbi1zZXJpYWxpemF0aW9uIGxpbWl0IChUUzcwNTYpIHRoYXQgYWxyZWFkeVxuLy8gZm9yY2VkIHRoZSBoYW5kLXdyaXR0ZW4gYGludGVyZmFjZSBBY3Rpdml0eURvY3VtZW50YCBpbiBkb2N1bWVudC50cy5cbi8vXG4vLyBFeGNsdWRlZCBvbiBwdXJwb3NlIChhdXRob3IgcnVsaW5ncywgZGVzaWduIGRvYyBEMi9EMyk6IGNvbHVtbnMgKHVucmVhZGFibGVcbi8vIGluIGEgfjI4cmVtIHBvcG92ZXIgXHUyMDE0IGEgZGVmaW5pdGlvbiB0aGF0IG5lZWRzIHR3by1jb2x1bW4gbGF5b3V0IElTIHRoZVxuLy8gcmVmZXJlbmNlIHBhbmVsKSwgY2FsbG91dCAoYSBub3RlIGJveCBpbnNpZGUgYSBub3RlIGJveCksIGFuZCBldmVyeVxuLy8gcXVlc3Rpb24vaW50ZXJhY3RpdmUgYmxvY2sgKGEgZGVmaW5pdGlvbiBpcyBuZXZlciBncmFkZWFibGUpLlxuLy9cbi8vIGBpZGAgaXMgT1BUSU9OQUwgb24gdGhlIGxvY2FsbHktZGVmaW5lZCBtZW1iZXJzLCB1bmxpa2UgZXZlcnkgYmxvY2tzLyBzaWJsaW5nXG4vLyB3aGVyZSBpdCBpcyBhIHJlcXVpcmVkIHV1aWQuIFR3byByZWFzb25zOiBub3RoaW5nIGFkZHJlc3NlcyBhIGRlZmluaXRpb24gYmxvY2tcbi8vIChpdCBpcyBuZXZlciBzY29yZWQsIG5ldmVyIGEgc3VibWlzc2lvbiBrZXksIG5ldmVyIGEgcnVudGltZSByZWYgXHUyMDE0IG9ubHkgdGhlXG4vLyBlZGl0b3Igd2FudHMgaXQsIGFuZCB0aGUgZWRpdG9yIGFsd2F5cyBtaW50cyBvbmUpLCBhbmQgdGhlIGxlZ2FjeSB1cGdyYWRlcyBpblxuLy8gdGhlIE1hcmsgcHJlcHJvY2VzcyBiZWxvdyBtdXN0IGJlIERFVEVSTUlOSVNUSUMuIEEgcmVxdWlyZWQgdXVpZCB3b3VsZCBmb3JjZVxuLy8gY3J5cHRvLnJhbmRvbVVVSUQoKSBhdCBwYXJzZSB0aW1lLCBzbyBwYXJzaW5nIG9uZSBzdG9yZWQgZG9jdW1lbnQgdHdpY2Ugd291bGRcbi8vIHlpZWxkIGRpZmZlcmVudCBpZHMgYW5kIGJyZWFrIHJlLXNlcmlhbGl6YXRpb24gYnl0ZS1pZGVudGl0eS5cblxuLy8gRXZlcnkgc2NoZW1hIGJlbG93IGNhcnJpZXMgYW4gRVhQTElDSVQgaW50ZXJmYWNlICsgYHouWm9kVHlwZTxcdTIwMjY+YCBhbm5vdGF0aW9uXG4vLyByYXRoZXIgdGhhbiByZWx5aW5nIG9uIHouaW5mZXIuIFRoaXMgaXMgbm90IHN0eWxlOiB3aXRob3V0IGl0LCBhZGRpbmcgYVxuLy8gNy1tZW1iZXIgYmxvY2sgdW5pb24gaW5zaWRlIGEgbWFyayB0aGF0IGV2ZXJ5IGJsb2NrJ3MgaW5saW5lIGNvbnRlbnQgY2FuXG4vLyByZWFjaCBvdmVyZmxvd3MgdHNjJ3MgZGVjbGFyYXRpb24tc2VyaWFsaXphdGlvbiBsaW1pdCBhbmQgZmFpbHMgdGhlIGJ1aWxkIHdpdGhcbi8vIFRTNzA1NiBpbiBmaXZlIGRvd25zdHJlYW0gZmlsZXMgKGJsb2Nrcy9pbmRleC50cydzIEJsb2NrLCBkb2N1bWVudC50cyxcbi8vIGxheW91dC50cykuIE5hbWluZyB0aGUgdHlwZXMgc3RvcHMgdGhlIHN0cnVjdHVyYWwgZXhwYW5zaW9uIGF0IHRoaXMgYm91bmRhcnkgXHUyMDE0XG4vLyB0aGUgc2FtZSByZW1lZHkgYGludGVyZmFjZSBBY3Rpdml0eURvY3VtZW50YCBhbHJlYWR5IGFwcGxpZXMgaW4gZG9jdW1lbnQudHMuXG4vLyBUaGUgYW5ub3RhdGlvbnMgYXJlIGNoZWNrZWQgYWdhaW5zdCB0aGUgb2JqZWN0IHNjaGVtYXMsIHNvIG5vdGhpbmcgaGVyZSBsb3Nlc1xuLy8gdHlwZSBzYWZldHksIGFuZCB0aGUgcnVudGltZSBvYmplY3RzIGFyZSB1bnRvdWNoZWQgKGEgZGlzY3JpbWluYXRlZFVuaW9uIHN0aWxsXG4vLyBwYXJzZXMgYXMgYSBkaXNjcmltaW5hdGVkVW5pb24pLlxuXG5jb25zdCBEZWZpbml0aW9uQmxvY2tJZCA9IHouc3RyaW5nKCkudXVpZCgpLm9wdGlvbmFsKCk7XG5cbi8vIFNoYXJlZCBzaXppbmcgZnJhZ21lbnQsIHNwZWxsZWQgb3V0IGZvciB0aGUgaW50ZXJmYWNlcyBhYm92ZS5cbmludGVyZmFjZSBEZWZpbml0aW9uU2l6aW5nIHtcbiAgd2lkdGg/OiBudW1iZXI7XG4gIGFsaWduPzogQmxvY2tBbGlnbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZWZpbml0aW9uUGFyYWdyYXBoQmxvY2sge1xuICBpZD86IHN0cmluZztcbiAgdHlwZTogJ3BhcmFncmFwaCc7XG4gIGNvbnRlbnQ6IERlZmluaXRpb25Db250ZW50SW5saW5lW107XG59XG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25IZWFkaW5nQmxvY2sge1xuICBpZD86IHN0cmluZztcbiAgdHlwZTogJ2hlYWRpbmcnO1xuICBsZXZlbDogMSB8IDIgfCAzO1xuICBjb250ZW50OiBEZWZpbml0aW9uQ29udGVudElubGluZVtdO1xufVxuZXhwb3J0IGludGVyZmFjZSBEZWZpbml0aW9uTWF0aEJsb2NrIGV4dGVuZHMgRGVmaW5pdGlvblNpemluZyB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAnbWF0aF9ibG9jayc7XG4gIGxhdGV4OiBzdHJpbmc7XG59XG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25JbWFnZUJsb2NrIGV4dGVuZHMgRGVmaW5pdGlvblNpemluZyB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAnaW1hZ2UnO1xuICBzcmM6IHN0cmluZztcbiAgYWx0OiBzdHJpbmc7XG4gIGNyb3A/OiBDcm9wUmVjdDtcbiAgc3JjQXNwZWN0PzogbnVtYmVyO1xufVxuXG5jb25zdCBEZWZpbml0aW9uUGFyYWdyYXBoQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgdHlwZTogei5saXRlcmFsKCdwYXJhZ3JhcGgnKSxcbiAgY29udGVudDogei5hcnJheShEZWZpbml0aW9uQ29udGVudElubGluZSkuZGVmYXVsdChbXSksXG59KTtcblxuLy8gU2FtZSB0aHJlZS1sZXZlbCBjYXAgYXMgSGVhZGluZ0Jsb2NrLiBUaGUgcG9wb3ZlciBzdHlsZXNoZWV0IHNjb3BlcyB0aGVzZVxuLy8gZG93biBzbyBhIHBhbmVsLXNjYWxlIGgxIHJlYWRzIGNvcnJlY3RseSBhdCBwb3BvdmVyIHNjYWxlLlxuY29uc3QgRGVmaW5pdGlvbkhlYWRpbmdCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IERlZmluaXRpb25CbG9ja0lkLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2hlYWRpbmcnKSxcbiAgbGV2ZWw6IHoudW5pb24oW3oubGl0ZXJhbCgxKSwgei5saXRlcmFsKDIpLCB6LmxpdGVyYWwoMyldKSxcbiAgY29udGVudDogei5hcnJheShEZWZpbml0aW9uQ29udGVudElubGluZSkuZGVmYXVsdChbXSksXG59KTtcblxuLy8gRGlzcGxheSBtYXRoLiBBIGRlZmluaXRpb24tbG9jYWwgc2hhcGUgcmF0aGVyIHRoYW4gYmxvY2tzL21hdGgtYmxvY2sudHMnc1xuLy8gTWF0aEJsb2NrLCB3aGljaCBjYXJyaWVzIGBwcm9tcHRzYCAoaW4tZXF1YXRpb24gZ3JhZGVhYmxlIGdhcHMpIGFuZFxuLy8gYHNvbHV0aW9uOiBJbmxpbmVOb2RlW11gIFx1MjAxNCB0aGUgZmlyc3QgaXMgbWVhbmluZ2xlc3MgaGVyZSAoYSBkZWZpbml0aW9uIGlzXG4vLyBuZXZlciBncmFkZWFibGUsIHRoZSBzYW1lIHBvc3R1cmUgdGhlIHJlZmVyZW5jZSBwYW5lbCBhbHJlYWR5IHRha2VzKSBhbmQgdGhlXG4vLyBzZWNvbmQgaXMgZXhhY3RseSB0aGUgcmVjdXJzaXZlIGVkZ2UgZGVzY3JpYmVkIGFib3ZlLiBTaXppbmcgcmlkZXMgYWxvbmc7XG4vLyBsYWJlbEZpZWxkcyBkbyBub3QgKGEgZGVmaW5pdGlvbiBibG9jayBpcyBuZXZlciBudW1iZXJlZCkuXG5jb25zdCBEZWZpbml0aW9uTWF0aEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogRGVmaW5pdGlvbkJsb2NrSWQsXG4gIHR5cGU6IHoubGl0ZXJhbCgnbWF0aF9ibG9jaycpLFxuICBsYXRleDogei5zdHJpbmcoKSxcbiAgLi4uc2l6aW5nRmllbGRzLFxufSk7XG5cbi8vIElsbHVzdHJhdGl2ZSBpbWFnZS4gRGVmaW5pdGlvbi1sb2NhbCBmb3IgdGhlIG9wdGlvbmFsLWlkIHJlYXNvbiBhYm92ZSwgYnV0IGl0XG4vLyByZXVzZXMgdGhlIHNoYXJlZCBzaXppbmcgKyBjcm9wIHZvY2FidWxhcnkgdmVyYmF0aW0sIHNvIHJlZnJhbWluZyBhIHRleHRib29rXG4vLyBmaWd1cmUgZG93biB0byB0aGUgcmVsZXZhbnQgY29ybmVyIHdvcmtzIGV4YWN0bHkgYXMgaXQgZG9lcyBpbiB0aGUgYm9keS5cbi8vIGBjYXB0aW9uYCBpcyBkZWxpYmVyYXRlbHkgYWJzZW50IChZQUdOSSBcdTIwMTQgYWx0IGNvdmVycyBhY2Nlc3NpYmlsaXR5LCBhbmQgYVxuLy8gY2FwdGlvbmVkIGZpZ3VyZSBpbiBhIHBvcG92ZXIgaXMgdGhlIHJlZmVyZW5jZSBwYW5lbCdzIGpvYik7IGFkZGl0aXZlIGxhdGVyLlxuY29uc3QgRGVmaW5pdGlvbkltYWdlQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgdHlwZTogei5saXRlcmFsKCdpbWFnZScpLFxuICBzcmM6IHouc3RyaW5nKCksXG4gIGFsdDogei5zdHJpbmcoKS5kZWZhdWx0KCcnKSxcbiAgLi4uc2l6aW5nRmllbGRzLFxuICBjcm9wOiBDcm9wUmVjdC5vcHRpb25hbCgpLFxuICBzcmNBc3BlY3Q6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxufSk7XG5cbi8vIE5lc3RlZCBsaXN0cywgbWlycm9yaW5nIGJsb2Nrcy9saXN0LnRzJ3Mgc2hhcGUgc28gVGFiLXRvLWluZGVudCBpbiB0aGVcbi8vIGRlZmluaXRpb24gZGlhbG9nIHJvdW5kLXRyaXBzLiBTYW1lIHJlY3Vyc2lvbiBtZWNoYW5pYzogb25seSB0aGUgY3ljbGljIGVkZ2Vcbi8vIChpdGVtIC0+IGxpc3QgLT4gaXRlbSkgaXMgei5sYXp5KCksIGxlYXZpbmcgdGhlIGxpc3QgYmxvY2tzIGFzIHBsYWluXG4vLyB6Lm9iamVjdHMgc28gdGhleSBzdGF5IHVzYWJsZSBhcyBkaXNjcmltaW5hdGVkVW5pb24gbWVtYmVycyBiZWxvdy5cbmV4cG9ydCBpbnRlcmZhY2UgRGVmaW5pdGlvbkxpc3RJdGVtIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIGNvbnRlbnQ6IERlZmluaXRpb25Db250ZW50SW5saW5lW107XG4gIGNoaWxkcmVuPzogQXJyYXk8RGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jayB8IERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrPjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jayB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAnYnVsbGV0X2xpc3QnO1xuICBpdGVtczogRGVmaW5pdGlvbkxpc3RJdGVtW107XG59XG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIHR5cGU6ICdvcmRlcmVkX2xpc3QnO1xuICBpdGVtczogRGVmaW5pdGlvbkxpc3RJdGVtW107XG59XG5cbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uTGlzdEl0ZW06IHouWm9kVHlwZTxcbiAgRGVmaW5pdGlvbkxpc3RJdGVtLFxuICB6LlpvZFR5cGVEZWYsXG4gIHVua25vd25cbj4gPSB6LmxhenkoKCkgPT5cbiAgei5vYmplY3Qoe1xuICAgIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgICBjb250ZW50OiB6LmFycmF5KERlZmluaXRpb25Db250ZW50SW5saW5lKS5kZWZhdWx0KFtdKSxcbiAgICBjaGlsZHJlbjogelxuICAgICAgLmFycmF5KHoudW5pb24oW0RlZmluaXRpb25CdWxsZXRMaXN0QmxvY2ssIERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrXSkpXG4gICAgICAub3B0aW9uYWwoKSxcbiAgfSksXG4pO1xuXG5leHBvcnQgY29uc3QgRGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IERlZmluaXRpb25CbG9ja0lkLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2J1bGxldF9saXN0JyksXG4gIGl0ZW1zOiB6LmFycmF5KERlZmluaXRpb25MaXN0SXRlbSkuZGVmYXVsdChbXSksXG59KTtcblxuZXhwb3J0IGNvbnN0IERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogRGVmaW5pdGlvbkJsb2NrSWQsXG4gIHR5cGU6IHoubGl0ZXJhbCgnb3JkZXJlZF9saXN0JyksXG4gIGl0ZW1zOiB6LmFycmF5KERlZmluaXRpb25MaXN0SXRlbSkuZGVmYXVsdChbXSksXG59KTtcblxuLy8gR3JhcGhGaWd1cmVCbG9jayBpcyB0aGUgT05FIG1lbWJlciByZXVzZWQgdmVyYmF0aW06IGl0IGlzIGFscmVhZHkgaW5saW5lLWZyZWVcbi8vIChheGlzICsgZHJhd2FibGVzIG9ubHkpLCBzbyBpdCBpbnRyb2R1Y2VzIG5vIGN5Y2xlLCBhbmQgaXQgaGFzIG5vIGxlZ2FjeVxuLy8gdXBncmFkZSBwYXRoIHRoYXQgd291bGQgbmVlZCB0byBtaW50IGl0cyByZXF1aXJlZCB1dWlkLiBJbXBvcnRpbmcgaXQgaXMgc2FmZVxuLy8gb25seSBiZWNhdXNlIGl0cyBvd24gZ3JhcGggcHJpbWl0aXZlcyBub3cgY29tZSBmcm9tIHRoZSBsZWFmXG4vLyBncmFwaC1wcmltaXRpdmVzLnRzIHJhdGhlciB0aGFuIHRocm91Z2ggYmxvY2tzL2ludGVyYWN0aXZlLWdyYXBoLnRzIFx1MjAxNCBzZWUgdGhlXG4vLyBoZWFkZXIgY29tbWVudCB0aGVyZS5cbmV4cG9ydCB0eXBlIERlZmluaXRpb25CbG9jayA9XG4gIHwgRGVmaW5pdGlvblBhcmFncmFwaEJsb2NrXG4gIHwgRGVmaW5pdGlvbkhlYWRpbmdCbG9ja1xuICB8IERlZmluaXRpb25NYXRoQmxvY2tcbiAgfCBEZWZpbml0aW9uSW1hZ2VCbG9ja1xuICB8IERlZmluaXRpb25CdWxsZXRMaXN0QmxvY2tcbiAgfCBEZWZpbml0aW9uT3JkZXJlZExpc3RCbG9ja1xuICB8IEdyYXBoRmlndXJlQmxvY2s7XG5cbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uQmxvY2s6IHouWm9kVHlwZTxcbiAgRGVmaW5pdGlvbkJsb2NrLFxuICB6LlpvZFR5cGVEZWYsXG4gIHVua25vd25cbj4gPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgRGVmaW5pdGlvblBhcmFncmFwaEJsb2NrLFxuICBEZWZpbml0aW9uSGVhZGluZ0Jsb2NrLFxuICBEZWZpbml0aW9uTWF0aEJsb2NrLFxuICBEZWZpbml0aW9uSW1hZ2VCbG9jayxcbiAgRGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jayxcbiAgRGVmaW5pdGlvbk9yZGVyZWRMaXN0QmxvY2ssXG4gIEdyYXBoRmlndXJlQmxvY2ssXG5dKTtcblxuLy8gRGVmaW5pdGlvbk1hcmsgXHUyMDE0IGlubGluZSB2b2NhYnVsYXJ5IGRlZmluaXRpb24gKFBoYXNlIDIpLiBgY29udGVudGAgaXMgdGhlXG4vLyByaWNoIGRlZmluaXRpb24gc2hvd24gaW4gdGhlIHB1Ymxpc2hlZC1wYWdlIHBvcG92ZXIsIG5vdyBhIGJsb2NrIHNlcXVlbmNlXG4vLyAoc2VlIERlZmluaXRpb25CbG9jayBhYm92ZSkuIGBnbG9zc2FyeUtleWAgaXMgcmVzZXJ2ZWQgZm9yIHRoZSBQaGFzZSA0IHRlbmFudFxuLy8gZ2xvc3Nhcnkgc3RvcmUgKHJlc29sdmVkIGF0IHB1Ymxpc2gpIGFuZCBpcyB1bnVzZWQgaW4gUGhhc2UgMi4gVGhlIHJlbmRlcmVyXG4vLyBlbWl0cyBgPHNwYW4gY2xhc3M9XCJkZWZpbml0aW9uXCIgXHUyMDI2PmAgcGx1cyBhIGhpZGRlbiA8dGVtcGxhdGU+IGNhcnJ5aW5nIHRoZVxuLy8gcmVuZGVyZWQgY29udGVudDsgc2VlIFJVTlRJTUUubWQsIGRvY3MvZGVzaWduL3ZvY2FidWxhcnktZGVmaW5pdGlvbnMubWQsIGFuZFxuLy8gZG9jcy9kZXNpZ24vZGVmaW5pdGlvbi1yaWNoLWNvbnRlbnQubWQuXG4vLyBOT1QgYW5ub3RhdGVkIGFzIHouWm9kVHlwZSwgdW5saWtlIERlZmluaXRpb25CbG9jayBhYm92ZTogdGhpcyBzY2hlbWEgaXMgYVxuLy8gbWVtYmVyIG9mIHRoZSBgTWFya2AgZGlzY3JpbWluYXRlZFVuaW9uIGJlbG93LCBhbmQgei5kaXNjcmltaW5hdGVkVW5pb24gbmVlZHNcbi8vIHJlYWwgWm9kT2JqZWN0cyB0byBpbnRyb3NwZWN0IHRoZSBgdHlwZWAgZGlzY3JpbWluYXRvci4gVGhlIG5hbWVkXG4vLyBEZWZpbml0aW9uQmxvY2sgYWxpYXMgaXMgd2hhdCBrZWVwcyB0aGUgaW5mZXJyZWQgdHlwZSBoZXJlIHNtYWxsIGVub3VnaCBcdTIwMTQgdGhlXG4vLyBzYW1lIHJlYXNvbiBsaXN0LnRzIGtlZXBzIGl0cyBsaXN0IGJsb2NrcyBhcyBwbGFpbiB6Lm9iamVjdHMgYW5kIHB1dHMgdGhlXG4vLyB6LmxhenkoKSBvbmx5IG9uIHRoZSBjeWNsaWMgZWRnZS5cbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uTWFyayA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdkZWZpbml0aW9uJyksXG4gIGNvbnRlbnQ6IHouYXJyYXkoRGVmaW5pdGlvbkJsb2NrKS5kZWZhdWx0KFtdKSxcbiAgZ2xvc3NhcnlLZXk6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGVmaW5pdGlvbk1hcmsgPSB6LmluZmVyPHR5cGVvZiBEZWZpbml0aW9uTWFyaz47XG5cbi8vIEEgZGVmaW5pdGlvbidzIGNvbnRlbnQgaXMgYSBibG9jayBhcnJheSB0b2RheSwgYnV0IHR3byBvbGRlciBzaGFwZXMgYXJlIHN0aWxsXG4vLyBvdXQgdGhlcmUgaW4gc3RvcmVkIGRvY3VtZW50cy4gQm90aCB1cGdyYWRlcyBiZWxvdyBhcmUgcHVyZSwgZGV0ZXJtaW5pc3RpY1xuLy8gcmVhZC10aW1lIHJld3JpdGVzIFx1MjAxNCB0aGV5IG1pbnQgbm8gaWRzIGFuZCBubyByYW5kb21uZXNzLCBzbyBwYXJzaW5nIHRoZSBzYW1lXG4vLyBzdG9yZWQgZG9jdW1lbnQgdHdpY2UgeWllbGRzIGlkZW50aWNhbCBvdXRwdXQuXG4vL1xuLy8gVGhleSBDT01QT1NFLCBvbGRlc3QgZmlyc3QsIGJlY2F1c2UgYSBkb2N1bWVudCBjYW4gY2FycnkgdGhlIG9sZGVzdCBzaGFwZTpcbi8vICAgdjEgIHsgZGVmaW5pdGlvbjogJ2Egc3RyaW5nJyB9ICAgICAgICAgICAgICAgICAgICAocHJlLXJpY2gtY29udGVudClcbi8vICAgdjIgIHsgY29udGVudDogW2lubGluZVx1MjAyNl0sIGltYWdlPzoge3NyYywgYWx0fSB9ICAgIChQaGFzZSAyIHJpY2ggaW5saW5lKVxuLy8gICB2MyAgeyBjb250ZW50OiBbYmxvY2tcdTIwMjZdIH0gICAgICAgICAgICAgICAgICAgICAgICAgKGN1cnJlbnQpXG4vLyBzbyB2MSBcdTIxOTIgdjIgXHUyMTkyIHYzIG11c3QgcnVuIGluIHNlcXVlbmNlIG9uIGEgc2luZ2xlIG1hcmsuXG4vLyBFeHBvcnRlZCBiZWNhdXNlIHRoZSBhcHAncyBzZXJpYWxpemVyIG5lZWRzIHRoZSBJREVOVElDQUwgbm9ybWFsaXphdGlvbiB3aGVuXG4vLyBpdCByZWFkcyBhIGRlZmluaXRpb24gbWFyaydzIFRpcHRhcCBhdHRycyBcdTIwMTQgYW4gZWRpdG9yIHNlc3Npb24gb3BlbmVkIGJlZm9yZVxuLy8gdGhlIGJsb2NrIG1pZ3JhdGlvbiBzdGlsbCBjYXJyaWVzIHRoZSB2MiBhdHRyIHNoYXBlLiBPbmUgaW1wbGVtZW50YXRpb24sIHNvXG4vLyB0aGUgc2NoZW1hIGFuZCB0aGUgc2VyaWFsaXplciBjYW5ub3QgZHJpZnQgYXBhcnQgb24gd2hhdCBhbiBvbGQgbWFyayBtZWFucy5cbmV4cG9ydCBmdW5jdGlvbiB1cGdyYWRlRGVmaW5pdGlvbk1hcmsobTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB1bmtub3duIHtcbiAgbGV0IGNvbnRlbnQgPSBtLmNvbnRlbnQ7XG4gIGNvbnN0IHJlc3QgPSB7IC4uLm0gfTtcblxuICAvLyB2MSBcdTIxOTIgdjI6IGEgcGxhaW4gYGRlZmluaXRpb25gIHN0cmluZyBiZWNvbWVzIGEgc2luZ2xlIGlubGluZSB0ZXh0IHJ1bi5cbiAgaWYgKHR5cGVvZiByZXN0LmRlZmluaXRpb24gPT09ICdzdHJpbmcnICYmIGNvbnRlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHRleHQgPSByZXN0LmRlZmluaXRpb247XG4gICAgY29udGVudCA9IHRleHQgPyBbeyB0eXBlOiAndGV4dCcsIHRleHQgfV0gOiBbXTtcbiAgfVxuICBkZWxldGUgcmVzdC5kZWZpbml0aW9uO1xuXG4gIC8vIHYyIFx1MjE5MiB2MzogYW4gSU5MSU5FIGNvbnRlbnQgYXJyYXkgYmVjb21lcyBvbmUgcGFyYWdyYXBoIGJsb2NrLiBEZXRlY3RlZCBieVxuICAvLyBzaGFwZSwgbm90IGJ5IGEgdmVyc2lvbiBmaWVsZCBcdTIwMTQgYW4gaW5saW5lIG5vZGUgaXMgYSB0ZXh0IC8gbWF0aF9pbmxpbmUgL1xuICAvLyBoYXJkX2JyZWFrLCBub25lIG9mIHdoaWNoIGlzIGEgYmxvY2sgYHR5cGVgLCBzbyB0aGUgZmlyc3QgZWxlbWVudFxuICAvLyBkaXNjcmltaW5hdGVzIHVuYW1iaWd1b3VzbHkuIEFuIGVtcHR5IGFycmF5IGlzIGFscmVhZHkgdmFsaWQgYXQgYm90aFxuICAvLyB2ZXJzaW9ucyBhbmQgaXMgbGVmdCBhbG9uZS5cbiAgY29uc3QgSU5MSU5FX1RZUEVTID0gWyd0ZXh0JywgJ21hdGhfaW5saW5lJywgJ2hhcmRfYnJlYWsnXTtcbiAgaWYgKEFycmF5LmlzQXJyYXkoY29udGVudCkgJiYgY29udGVudC5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZmlyc3QgPSBjb250ZW50WzBdIGFzIHsgdHlwZT86IHVua25vd24gfSB8IHVuZGVmaW5lZDtcbiAgICBpZiAodHlwZW9mIGZpcnN0Py50eXBlID09PSAnc3RyaW5nJyAmJiBJTkxJTkVfVFlQRVMuaW5jbHVkZXMoZmlyc3QudHlwZSkpIHtcbiAgICAgIGNvbnRlbnQgPSBbeyB0eXBlOiAncGFyYWdyYXBoJywgY29udGVudCB9XTtcbiAgICB9XG4gIH1cblxuICAvLyB2MiBcdTIxOTIgdjMgKEQ3KTogdGhlIHNlcGFyYXRlIGBpbWFnZWAgYXR0ciBiZWNvbWVzIGEgdHJhaWxpbmcgaW1hZ2UgYmxvY2ssIHNvXG4gIC8vIHRoZXJlIGlzIGV4YWN0bHkgb25lIHdheSB0byBleHByZXNzIGFuIGltYWdlIGluIGEgZGVmaW5pdGlvbi4gQXBwZW5kZWRcbiAgLy8gQUZURVIgdGhlIHRleHQsIG1hdGNoaW5nIHdoZXJlIHRoZSBvbGQgcG9wb3ZlciByZW5kZXJlZCBpdC5cbiAgY29uc3QgaW1hZ2UgPSByZXN0LmltYWdlO1xuICBkZWxldGUgcmVzdC5pbWFnZTtcbiAgaWYgKGltYWdlICE9PSBudWxsICYmIHR5cGVvZiBpbWFnZSA9PT0gJ29iamVjdCcpIHtcbiAgICBjb25zdCB7IHNyYywgYWx0IH0gPSBpbWFnZSBhcyB7IHNyYz86IHVua25vd247IGFsdD86IHVua25vd24gfTtcbiAgICBpZiAodHlwZW9mIHNyYyA9PT0gJ3N0cmluZycgJiYgc3JjKSB7XG4gICAgICBjb25zdCBibG9ja3MgPSBBcnJheS5pc0FycmF5KGNvbnRlbnQpID8gWy4uLmNvbnRlbnRdIDogW107XG4gICAgICBibG9ja3MucHVzaCh7XG4gICAgICAgIHR5cGU6ICdpbWFnZScsXG4gICAgICAgIHNyYyxcbiAgICAgICAgYWx0OiB0eXBlb2YgYWx0ID09PSAnc3RyaW5nJyA/IGFsdCA6ICcnLFxuICAgICAgfSk7XG4gICAgICBjb250ZW50ID0gYmxvY2tzO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IC4uLnJlc3QsIGNvbnRlbnQ6IGNvbnRlbnQgPz8gW10gfTtcbn1cblxuZXhwb3J0IGNvbnN0IE1hcmsgPSB6LnByZXByb2Nlc3MoXG4gIChtKSA9PiB7XG4gICAgLy8gTGVnYWN5OiBtYXJrcyB3ZXJlIGJhcmUgc3RyaW5ncyAoJ2JvbGQnKS5cbiAgICBpZiAodHlwZW9mIG0gPT09ICdzdHJpbmcnKSByZXR1cm4geyB0eXBlOiBtIH07XG4gICAgaWYgKFxuICAgICAgbSAhPT0gbnVsbCAmJlxuICAgICAgdHlwZW9mIG0gPT09ICdvYmplY3QnICYmXG4gICAgICAobSBhcyB7IHR5cGU/OiB1bmtub3duIH0pLnR5cGUgPT09ICdkZWZpbml0aW9uJ1xuICAgICkge1xuICAgICAgcmV0dXJuIHVwZ3JhZGVEZWZpbml0aW9uTWFyayhtIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICB9XG4gICAgcmV0dXJuIG07XG4gIH0sXG4gIHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICAgIEJvbGRNYXJrLFxuICAgIEl0YWxpY01hcmssXG4gICAgVW5kZXJsaW5lTWFyayxcbiAgICBDb2RlTWFyayxcbiAgICBTdWJzY3JpcHRNYXJrLFxuICAgIFN1cGVyc2NyaXB0TWFyayxcbiAgICBEZWZpbml0aW9uTWFyayxcbiAgXSksXG4pO1xuZXhwb3J0IHR5cGUgTWFyayA9IHouaW5mZXI8dHlwZW9mIE1hcms+O1xuLy8gVGhlIHNldCBvZiBtYXJrIGB0eXBlYCBkaXNjcmltaW5hbnRzLCBmb3IgY2FsbGVycyB0aGF0IGFsbG93LWxpc3QgYnkgbmFtZS5cbmV4cG9ydCB0eXBlIE1hcmtUeXBlID0gTWFya1sndHlwZSddO1xuXG4vLyAtLS0tIFRleHQgbm9kZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGNvbnN0IFRleHROb2RlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3RleHQnKSxcbiAgdGV4dDogei5zdHJpbmcoKSxcbiAgLy8gRGVmYXVsdCB0byBlbXB0eSBtYXJrcyBhcnJheSBzbyBjYWxsZXJzIGRvbid0IG5lZWQgdG8gc3BlY2lmeSB3aGVuIG5vbmUuXG4gIG1hcmtzOiB6LmFycmF5KE1hcmspLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBUZXh0Tm9kZSA9IHouaW5mZXI8dHlwZW9mIFRleHROb2RlPjtcblxuLy8gLS0tLSBNaXNjb25jZXB0aW9uIGJpbmRpbmcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEFuIG9wYXF1ZSB0YWcgYmluZGluZyBhbiBhbnRpY2lwYXRlZCB3cm9uZyBhbnN3ZXIgdG8gYSBuYW1lZCBtaXNjb25jZXB0aW9uIGluXG4vLyB0aGUgQVVUSE9SJ1MgcmVnaXN0cnkgKHdoaWNoIGxpdmVzIGluIHRoZWlyIGNhdGFsb2d1ZSBwcm9qZWN0LCBub3QgaGVyZSBcdTIwMTQgdGhlXG4vLyBwbGF0Zm9ybSBkZWxpYmVyYXRlbHkgZG9lcyBub3Qgb3duIHRoZSB0YXhvbm9teSkuIEJvdW5kZWQgaW4gU0hBUEUsIG5ldmVyIGluXG4vLyBtZWFuaW5nOiB0aGUgbGVuZ3RoIGNhcCBrZWVwcyBhIHBhc3RlZCBwYXJhZ3JhcGggb3V0IG9mIGV2ZXJ5IHN0b3JlZCBjaGVja1xuLy8gcm93LCBzaW5jZSBkb2N1bWVudHMgcmVhY2ggdGhpcyBzY2hlbWEgZnJvbSB0aGUgaW1wb3J0ZXIsIHRoZSBlZGl0b3IsIEFORCByYXdcbi8vIHN0b3JlZCBqc29uYiwgYW5kIG9ubHkgdGhpcyBsYXllciBzZWVzIGFsbCB0aHJlZS4gUGF0dGVybiB2YWxpZGF0aW9uIGlzIHRoZVxuLy8gSU1QT1JURVIncyBqb2IgKGEgd2FybmluZywgbmV2ZXIgYW4gZXJyb3IpIHNvIGEgZnV0dXJlIGBza2lsbC4qYCB0YXhvbm9teVxuLy8gbmVlZHMgbm8gcGxhdGZvcm0gY2hhbmdlLlxuZXhwb3J0IGNvbnN0IE1pc2NvbmNlcHRpb25JZCA9IHouc3RyaW5nKCkubWluKDEpLm1heCgxMjApO1xuZXhwb3J0IHR5cGUgTWlzY29uY2VwdGlvbklkID0gei5pbmZlcjx0eXBlb2YgTWlzY29uY2VwdGlvbklkPjtcblxuLy8gLS0tLSBJbmxpbmVOb2RlIHVuaW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIElubGluZU5vZGUgaXMgdGhlIHN0YW5kYXJkIGlubGluZSBhbHBoYWJldC4gVXNlZCBieSBhbGwgYmxvY2tzIGV4Y2VwdFxuLy8gZmlsbF9pbl9ibGFuay4gRGVmaW5lZCBiZWZvcmUgQmxhbmtUb2tlbiBiZWNhdXNlIHRoZSBibGFuaydzIHJpY2ggZmVlZGJhY2tcbi8vIGZpZWxkcyAoaGludCwgbWlzdGFrZUZlZWRiYWNrKSByZXVzZSB0aGlzIHVuaW9uLlxuZXhwb3J0IGNvbnN0IElubGluZU5vZGUgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgVGV4dE5vZGUsXG4gIElubGluZU1hdGhOb2RlLFxuICBIYXJkQnJlYWtOb2RlLFxuXSk7XG5leHBvcnQgdHlwZSBJbmxpbmVOb2RlID0gei5pbmZlcjx0eXBlb2YgSW5saW5lTm9kZT47XG5cbi8vIC0tLS0gQmxhbmsgdG9rZW4gKGZpbGwtaW4tdGhlLWJsYW5rIG9ubHkpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCbGFua3MgbGl2ZSBJTlNJREUgdGhlIGlubGluZSBjb250ZW50IHN0cmVhbSBvZiBhIGZpbGxfaW5fYmxhbmsgYmxvY2sgXHUyMDE0XG4vLyBzdHVkZW50cyBzZWUgYSBwcm9tcHQgd2l0aCBvbmUgb3IgbW9yZSBpbmxpbmUgYmxhbmtzLiBFYWNoIGJsYW5rIGhhcyBhXG4vLyBzdGFibGUgaWQgKHJlZmVyZW5jZWQgaW4gc3VibWlzc2lvbnMucmVzcG9uc2VzLmJsYW5rc1s8aWQ+XSkgYW5kIGFuIGFuc3dlclxuLy8ga2V5LlxuLy9cbi8vIHdpZHRoIGlzIGluIENTUyBjaGFycyAoYGNoYCB1bml0cykgXHUyMDE0IHVzZWQgdG8gc2l6ZSB0aGUgaW5wdXQuIE9wdGlvbmFsXG4vLyBiZWNhdXNlIHRoZSByZW5kZXJlciBoYXMgYSBzZW5zaWJsZSBkZWZhdWx0ICh+NiBjaGFycykuXG4vL1xuLy8gaGludCBhbmQgbWlzdGFrZUZlZWRiYWNrIGFyZSB0aGUgcGVyLWJsYW5rIGZlZWRiYWNrIGxheWVycyAoYmxvY2stbGV2ZWxcbi8vIGZpZWxkcyBcdTIwMTQgc29sdXRpb24sIHNraWxscyBcdTIwMTQgbGl2ZSBvbiBGaWxsSW5CbGFua0Jsb2NrKS5cbi8vIEJvdGggY2FycnkgcmljaCBpbmxpbmUgY29udGVudCAoSW5saW5lTm9kZVtdOiBmb3JtYXR0ZWQgdGV4dCArIGlubGluZSBtYXRoKVxuLy8gc28gZmVlZGJhY2sgY2FuIGluY2x1ZGUgdGhlIHNhbWUgZm9ybWF0dGluZyBhbmQgbWF0aCBhcyBwcm9ibGVtIHByb3NlLlxuLy8gVGhlIHJ1bnRpbWUgcmVhZHMgYm90aCBhdCBpbml0IGJ1dCBkb2VzIE5PVCBpbmplY3QgYW55dGhpbmcgaW50byB0aGUgRE9NXG4vLyB1bnRpbCB0aGUgc3R1ZGVudCBjbGlja3MgXCJDaGVjayB0aGlzIHNlY3Rpb24uXCIgT24gYSB3cm9uZyBhbnN3ZXIsIHRoZVxuLy8gcnVudGltZSBmaXJzdCBsb29rcyBmb3IgYSBtYXRjaGluZyBtaXN0YWtlRmVlZGJhY2sgZW50cnkgKGV4YWN0IHN0cmluZ1xuLy8gbWF0Y2ggZm9yIFBoYXNlIDEpOyBpZiBub25lIG1hdGNoZXMsIGl0IGZhbGxzIGJhY2sgdG8gaGludDsgaWYgaGludCBpc1xuLy8gYWxzbyBhYnNlbnQsIGl0IHNob3dzIHRoZSBnZW5lcmljIFx1MjcxNy5cbmV4cG9ydCBjb25zdCBCbGFua1Rva2VuID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2JsYW5rJyksXG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgYW5zd2VyOiB6LnN0cmluZygpLm1pbigxKSxcbiAgLy8gQWx0ZXJuYXRpdmUgY29ycmVjdCBhbnN3ZXJzLiBFbXB0eSBhcnJheSBpcyB0aGUgY29tbW9uIGNhc2UuXG4gIGFjY2VwdGFibGVBbnN3ZXJzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICB3aWR0aDogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC8vIE9wdGlvbmFsIHRlYWNoZXItYXV0aG9yZWQgbnVkZ2Ugc2hvd24gd2hlbiB0aGlzIGJsYW5rIGlzIHdyb25nIGFuZCBub1xuICAvLyBtaXN0YWtlRmVlZGJhY2sgZW50cnkgbWF0Y2hlcy4gUmljaCBpbmxpbmUgY29udGVudCAoZm9ybWF0dGVkIHRleHQgKyBtYXRoKS5cbiAgaGludDogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICAvLyBPcHRpb25hbCBsaXN0IG9mIGFudGljaXBhdGVkIHdyb25nIGFuc3dlcnMgcGFpcmVkIHdpdGggc3BlY2lmaWMgZmVlZGJhY2suXG4gIC8vIElmIHRoZSBzdHVkZW50J3Mgd3JvbmcgYW5zd2VyIG1hdGNoZXMgYSBgbWF0Y2hgIHN0cmluZyAoUGhhc2UgMTogZXhhY3RcbiAgLy8gbWF0Y2g7IHRoZSBzdHJhdGVneS1kaXNwYXRjaCBob29rIGluIHRoZSBydW50aW1lIHN1cHBvcnRzIHNtYXJ0ZXJcbiAgLy8gbWF0Y2hpbmcgbGF0ZXIpLCB0aGUgY29ycmVzcG9uZGluZyBmZWVkYmFjayBpcyBzaG93biBpbnN0ZWFkIG9mIHRoZVxuICAvLyBnZW5lcmljIGhpbnQuIEZpcnN0IG1hdGNoIHdpbnMuIGBmZWVkYmFja2AgaXMgcmljaCBpbmxpbmUgY29udGVudC5cbiAgLy8gYG1pc2NvbmNlcHRpb25JZGAgYmluZHMgdGhlIGFudGljaXBhdGVkIG1pc3Rha2UgdG8gYSBuYW1lZCBtaXNjb25jZXB0aW9uXG4gIC8vIChhbiBvcGFxdWUgYG1pcy4qYCB0YWcgXHUyMDE0IHRoZSB0YXhvbm9teSBsaXZlcyBpbiB0aGUgYXV0aG9yJ3MgY2F0YWxvZ3VlXG4gIC8vIHByb2plY3QsIG5vdCBoZXJlKS4gVGhlIGdyYWRlciByZXR1cm5zIGl0IG9uIHRoZSBjaGVjayB2ZXJkaWN0LCBhbmQgdGhlXG4gIC8vIHN0b3JlZCB2ZXJkaWN0cyByb3cgaXMgd2hhdCBtYWtlcyB0aGUgYWdncmVnYXRlIHNpZ25hbCBxdWVyeWFibGUuXG4gIG1pc3Rha2VGZWVkYmFjazogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgbWF0Y2g6IHouc3RyaW5nKCksXG4gICAgZmVlZGJhY2s6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gICAgbWlzY29uY2VwdGlvbklkOiBNaXNjb25jZXB0aW9uSWQub3B0aW9uYWwoKSxcbiAgfSkpLm9wdGlvbmFsKCksXG4gIC8vIE9yZGVyLWluZGVwZW5kZW50IGFuc3dlciBncm91cGluZy4gV2hlbiB0cnVlLCB0aGlzIGJsYW5rJ3MgYW5zd2VyIGlzXG4gIC8vIGludGVyY2hhbmdlYWJsZSB3aXRoIHRoZSBibGFuayBpbW1lZGlhdGVseSBiZWZvcmUgaXQgKGluIGRvY3VtZW50IG9yZGVyLFxuICAvLyB3aXRoaW4gdGhlIHNhbWUgYmxvY2spIFx1MjAxNCBlLmcuIGZhY3RvcmluZyBgKHggKyBcdTI2MTApKHggKyBcdTI2MTApYCB3aGVyZSAoMiwzKSBhbmRcbiAgLy8gKDMsMikgYXJlIGJvdGggY29ycmVjdCBidXQgKDIsMikgaXMgbm90LiBBIFwiZ3JvdXBcIiBpcyBhIG1heGltYWwgcnVuIG9mXG4gIC8vIGFkamFjZW50IGJsYW5rcyBlYWNoIGZsYWdnZWQgaGVyZTsgdGhlIHJlbmRlcmVyIGNvbXBpbGVzIHJ1bnMgaW50byBhXG4gIC8vIHNoYXJlZCBgZGF0YS1ibGFuay1ncm91cGAgaWQsIGFuZCB0aGUgcnVudGltZSBzY29yZXMgdGhlIGdyb3VwIHdpdGhcbiAgLy8gY29uc3VtZS1vbmNlIG1hdGNoaW5nIChlYWNoIGNvcnJlY3QgYW5zd2VyIGNhbiBzYXRpc2Z5IG9ubHkgb25lIGJsYW5rKS5cbiAgLy9cbiAgLy8gVGhpcyBib29sZWFuIGlzIGF1dGhvcmluZyAqc3VnYXIqOiB0aGUgZ2VuZXJhbCBtb2RlbCBsaXZlcyBpbiB0aGUgcnVudGltZVxuICAvLyBkYXRhLWF0dHJpYnV0ZSBjb250cmFjdCAoZ3JvdXAgaWRzKSwgc28gcmljaGVyIGdyb3VwaW5nIChub24tYWRqYWNlbnQsXG4gIC8vIGNyb3NzLWJsb2NrKSBjYW4gYmUgYWRkZWQgbGF0ZXIgYXMgYW4gYWRkaXRpdmUgYGdyb3VwYCBmaWVsZCB3aXRob3V0IGFcbiAgLy8gYnJlYWtpbmcgY2hhbmdlLiBUaGUgZmlyc3QgYmxhbmsgaW4gYSBibG9jayBpZ25vcmVzIHRoaXMgZmxhZyAobm9cbiAgLy8gcHJldmlvdXMgYmxhbmsgdG8gZ3JvdXAgd2l0aCkuXG4gIGludGVyY2hhbmdlYWJsZVdpdGhQcmV2aW91czogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIEFuc3dlciBpbnRlcnByZXRhdGlvbiBtb2RlLiBBYnNlbnQgKD0gJ3RleHQnKSBrZWVwcyB0aGUgUGhhc2UgMSBiZWhhdmlvcjpcbiAgLy8gZXhhY3Qgc3RyaW5nIG1hdGNoIGFnYWluc3QgYW5zd2VyICsgYWNjZXB0YWJsZUFuc3dlcnMuICdudW1lcmljJyB0ZWxscyB0aGVcbiAgLy8gcnVudGltZSB0byBwYXJzZSBCT1RIIHRoZSB0eXBlZCB2YWx1ZSBhbmQgZWFjaCBrZXkgZW50cnkgbnVtZXJpY2FsbHlcbiAgLy8gKGRlY2ltYWxzLCBmcmFjdGlvbnMgbGlrZSAzLzIsIG1peGVkIG51bWJlcnMgbGlrZSBcIjEgMS8yXCIsIGNvbW1hXG4gIC8vIHNlcGFyYXRvcnMsIGEgbGVhZGluZyAkKSBhbmQgY29tcGFyZSB3aXRoaW4gYHRvbGVyYW5jZWAgXHUyMDE0IHNvIDAuNSwgMS8yLFxuICAvLyBhbmQgLjUwIGFsbCBzYXRpc2Z5IGFuIGFuc3dlciBvZiBcIjEvMlwiLiBPcHRpb25hbCByYXRoZXIgdGhhbiBkZWZhdWx0ZWQgc29cbiAgLy8gZG9jdW1lbnRzIHN0b3JlZCBiZWZvcmUgdGhpcyBmaWVsZCBleGlzdGVkIHJlLXNlcmlhbGl6ZSBieXRlLWlkZW50aWNhbGx5LlxuICAvLyAnbWF0aCcgKE1vZGVsIEIgbWF0aCBibGFua3MpIGdyYWRlcyB0aGUgdHlwZWQgdmFsdWUgYXMgYSBtYXRoIEVYUFJFU1NJT046XG4gIC8vIHRoZSBydW50aW1lIGxhenktbG9hZHMgdGhlIGdyYXBoLWtpdCBhbmQgY29tcGFyZXMgYnkgbnVtZXJpYy1zYW1wbGluZ1xuICAvLyBlcXVpdmFsZW5jZSAoMmEgXHUyMjYxIGErYSBcdTIyNjEgYSoyKSwgTk9UIHN0cmluZyBtYXRjaC4gU2VlIGRvY3MvZGVzaWduL21hdGgtYmxhbmtzLm1kLlxuICBhbnN3ZXJUeXBlOiB6LmVudW0oWyd0ZXh0JywgJ251bWVyaWMnLCAnbWF0aCddKS5vcHRpb25hbCgpLFxuICAvLyBBYnNvbHV0ZSBjb21wYXJpc29uIHRvbGVyYW5jZS4gRm9yICdudW1lcmljJzogfHR5cGVkIC0ga2V5fCA8PSB0b2xlcmFuY2UuXG4gIC8vIEZvciAnbWF0aCc6IHRoZSBhYnNvbHV0ZSB0b2xlcmFuY2UgcGFzc2VkIHRvIHRoZSBzYW1wbGluZyBjb21wYXJpc29uLlxuICAvLyBBYnNlbnQgPSBleGFjdCBlcXVhbGl0eSAobnVtZXJpYykgLyBubyBleHRyYSBzbGFjayAobWF0aCkuXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbiAgLy8gRXF1aXZhbGVuY2UgbW9kZSBmb3IgJ21hdGgnIGJsYW5rczogJ3ZhbHVlJyAoZGVmYXVsdCwgYW55IGV4cHJlc3Npb24gdGhhdFxuICAvLyBldmFsdWF0ZXMgZXF1YWwpIG9yICdleGFjdC1mb3JtJyAobm9ybWFsaXplZC1zdHJpbmcgbWF0Y2ggXHUyMDE0IFwid3JpdGUgaXQgaW5cbiAgLy8gdGhpcyBmb3JtXCIpLiBPbmx5IG1lYW5pbmdmdWwgd2hlbiBhbnN3ZXJUeXBlIGlzICdtYXRoJzsgYWJzZW50ID0gJ3ZhbHVlJy5cbiAgZXF1aXZhbGVuY2U6IHouZW51bShbJ3ZhbHVlJywgJ2V4YWN0LWZvcm0nXSkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQmxhbmtUb2tlbiA9IHouaW5mZXI8dHlwZW9mIEJsYW5rVG9rZW4+O1xuXG4vLyAtLS0tIEZpbGxJbkJsYW5rSW5saW5lIHVuaW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRmlsbEluQmxhbmtJbmxpbmUgaXMgdGhlIGV4dGVuZGVkIGFscGhhYmV0IGZvciBmaWxsX2luX2JsYW5rIGJsb2NrcyBvbmx5LlxuLy8gSW5jbHVkZXMgQmxhbmtUb2tlbiBpbiBhZGRpdGlvbiB0byB0aGUgc3RhbmRhcmQgaW5saW5lIG5vZGVzLlxuZXhwb3J0IGNvbnN0IEZpbGxJbkJsYW5rSW5saW5lID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFRleHROb2RlLFxuICBJbmxpbmVNYXRoTm9kZSxcbiAgSGFyZEJyZWFrTm9kZSxcbiAgQmxhbmtUb2tlbixcbl0pO1xuZXhwb3J0IHR5cGUgRmlsbEluQmxhbmtJbmxpbmUgPSB6LmluZmVyPHR5cGVvZiBGaWxsSW5CbGFua0lubGluZT47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuZXhwb3J0IGNvbnN0IFBhcmFncmFwaEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgncGFyYWdyYXBoJyksXG4gIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG59KTtcbmV4cG9ydCB0eXBlIFBhcmFncmFwaEJsb2NrID0gei5pbmZlcjx0eXBlb2YgUGFyYWdyYXBoQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vIFRocmVlIGxldmVscyBpcyBhIGRlbGliZXJhdGUgY29uc3RyYWludC4gV29ya3NoZWV0cyBkb24ndCBuZWVkIGRlZXBlclxuLy8gaGllcmFyY2h5IGFuZCBjYXBwaW5nIGl0IGF0IDMga2VlcHMgdGhlIHZpc3VhbCBoaWVyYXJjaHkgbWVhbmluZ2Z1bC5cbmV4cG9ydCBjb25zdCBIZWFkaW5nTGV2ZWwgPSB6LnVuaW9uKFt6LmxpdGVyYWwoMSksIHoubGl0ZXJhbCgyKSwgei5saXRlcmFsKDMpXSk7XG5leHBvcnQgdHlwZSBIZWFkaW5nTGV2ZWwgPSB6LmluZmVyPHR5cGVvZiBIZWFkaW5nTGV2ZWw+O1xuXG5leHBvcnQgY29uc3QgSGVhZGluZ0Jsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnaGVhZGluZycpLFxuICBsZXZlbDogSGVhZGluZ0xldmVsLFxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxufSk7XG5leHBvcnQgdHlwZSBIZWFkaW5nQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBIZWFkaW5nQmxvY2s+O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBsYWJlbC50cyBcdTIwMTQgU2hhcmVkIHBlci1ibG9jayBkaXNwbGF5LWxhYmVsIGZyYWdtZW50IChudW1iZXJpbmcvbGFiZWwgZGVjb3VwbGUpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRGVjb3VwbGVzIFwiaXMgdGhpcyBncmFkZWFibGU/XCIgZnJvbSBcImRvZXMgaXQgd2VhciBhIHByb2JsZW0gbnVtYmVyP1wiLiBBXG4vLyBncmFkZWFibGUgYmxvY2sgaXMgYWx3YXlzIHNjb3JlZCBhbmQgYWx3YXlzIHJldmlld2FibGU7IHRoaXMgZmllbGQgY29udHJvbHNcbi8vIG9ubHkgd2hhdCBzaG93cyBvbiB0aGUgcGFnZTpcbi8vXG4vLyAgIGF1dG8gICBcdTIwMTQgdGhlIGRlZmF1bHQ6IGEgbnVtYmVyZWQgcHJvYmxlbSwgY29uc3VtaW5nIG9uZSBzbG90IG9mIHRoZVxuLy8gICAgICAgICAgICBkb2N1bWVudC13aWRlIHNlcXVlbmNlICh0b2RheSdzIGJlaGF2aW9yIGZvciBldmVyeSBncmFkZWFibGUgYmxvY2spLlxuLy8gICBjdXN0b20gXHUyMDE0IHNob3cgYXV0aG9yZWQgdGV4dCAoXCJXYXJtLXVwXCIsIFwiQ2hhbGxlbmdlXCIpIGluc3RlYWQgb2YgYSBudW1iZXIsXG4vLyAgICAgICAgICAgIGFuZCBET04nVCBjb25zdW1lIGEgc2VxdWVuY2Ugc2xvdCAob3V0LW9mLXNlcXVlbmNlIGxhYmVsKS5cbi8vICAgbm9uZSAgIFx1MjAxNCBzaG93IG5vdGhpbmc7IERPTidUIGNvbnN1bWUgYSBzbG90LiBUaGUgbm90ZXMga2V5d29yZC1ibGFuayBjYXNlOlxuLy8gICAgICAgICAgICBhIGdyYWRlYWJsZSBnYXAgdGhhdCBrZWVwcyBzdHVkZW50cyByZWFkaW5nIHdpdGhvdXQgbG9va2luZyBsaWtlIGFcbi8vICAgICAgICAgICAgcXVpeiBxdWVzdGlvbi4gU3RpbGwgc2NvcmVkLCBzdGlsbCBpbiB0aGUgdGVhY2hlcidzIHJlc3VsdHMgdmlld1xuLy8gICAgICAgICAgICAobG9jYXRlZCBieSBpdHMgc3Vycm91bmRpbmcgdGV4dCwgbm90IGEgbnVtYmVyKS5cbi8vXG4vLyBPcHRpb25hbCB3aXRoIE5PIGRlZmF1bHQsIGV4YWN0bHkgbGlrZSBzaXppbmdGaWVsZHMgYW5kIG1hdGhfYmxvY2sucHJvbXB0czpcbi8vIGFuIGFic2VudCBgbGFiZWxgIG1lYW5zIGBhdXRvYCwgc28gYSBibG9jayBhdXRob3JlZCBiZWZvcmUgdGhpcyBmZWF0dXJlIFx1MjAxNCBvclxuLy8gb25lIGxlZnQgYXQgdGhlIGRlZmF1bHQgXHUyMDE0IHJlLXNlcmlhbGl6ZXMgQllURS1JREVOVElDQUxMWS4gVGhlIHJlbmRlcmVyIGFuZFxuLy8gZWRpdG9yIHRyZWF0IGB1bmRlZmluZWRgIGFuZCBge21vZGU6J2F1dG8nfWAgaWRlbnRpY2FsbHkuXG4vL1xuLy8gVGhlIHBlci1ibG9jayBtYW51YWwgaW50ZWdlciBgbnVtYmVyYCBvdmVycmlkZSBpcyBvcnRob2dvbmFsIGFuZCBzdGlsbCBsaXZlc1xuLy8gb24gdGhlIGluZGl2aWR1YWwgYmxvY2tzOiBpdCByZWxhYmVscyB0aGUgc2hvd24gaW50ZWdlciB3aGlsZSBTVEFZSU5HIGluXG4vLyBzZXF1ZW5jZSwgYW5kIGl0IGFwcGxpZXMgb25seSB3aGVuIHRoZSBsYWJlbCBtb2RlIGlzIGF1dG8gKGN1c3RvbS9ub25lIHdpbikuXG4vLyBTZWUgZG9jcy9kZXNpZ24gKyBibG9jay1wcmVkaWNhdGVzLnRzLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5cbmV4cG9ydCBjb25zdCBCbG9ja0xhYmVsID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ21vZGUnLCBbXG4gIHoub2JqZWN0KHsgbW9kZTogei5saXRlcmFsKCdhdXRvJykgfSksXG4gIC8vIG1pbigxKTogYW4gZW1wdHkgY3VzdG9tIGxhYmVsIGlzIG1lYW5pbmdsZXNzIFx1MjAxNCBhdXRob3IgZWl0aGVyIHdhbnRzIHRleHQgb3JcbiAgLy8gd2FudHMgYG5vbmVgLiBLZWVwcyByb3VuZC10cmlwIGhvbmVzdCAobm8gZW1wdHktc3RyaW5nIGdob3N0cykuXG4gIHoub2JqZWN0KHsgbW9kZTogei5saXRlcmFsKCdjdXN0b20nKSwgdGV4dDogei5zdHJpbmcoKS5taW4oMSkgfSksXG4gIHoub2JqZWN0KHsgbW9kZTogei5saXRlcmFsKCdub25lJykgfSksXG5dKTtcbmV4cG9ydCB0eXBlIEJsb2NrTGFiZWwgPSB6LmluZmVyPHR5cGVvZiBCbG9ja0xhYmVsPjtcblxuLy8gU3ByZWFkIGludG8gYSBncmFkZWFibGUgYmxvY2sncyB6Lm9iamVjdCh7Li4ufSkgc2hhcGUuIFBsYWluIG9iamVjdCAobm90IGEgWm9kXG4vLyBzY2hlbWEpIHNvIGVhY2ggYmxvY2sga2VlcHMgYSBmbGF0IGZpZWxkIGxpc3QgYW5kIGRpc2NyaW1pbmF0ZWRVbmlvbiBrZWVwc1xuLy8gd29ya2luZywgbWlycm9yaW5nIHNpemluZ0ZpZWxkcy5cbmV4cG9ydCBjb25zdCBsYWJlbEZpZWxkcyA9IHtcbiAgbGFiZWw6IEJsb2NrTGFiZWwub3B0aW9uYWwoKSxcbn07XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBzaXppbmdGaWVsZHMgfSBmcm9tICcuLi9zaXppbmcuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5pbXBvcnQgeyBNYXRoUHJvbXB0LCBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gRGlzcGxheSBtYXRoIChjZW50ZXJlZCwgZnVsbCB3aWR0aCBieSBkZWZhdWx0KS4gSW5saW5lIG1hdGggaXMgaW4gaW5saW5lLnRzXG4vLyBhcyBJbmxpbmVNYXRoTm9kZS4gVGhleSdyZSBzZXBhcmF0ZSBub2RlIHR5cGVzIGJlY2F1c2UgdGhleSByZW5kZXJcbi8vIGRpZmZlcmVudGx5IGFuZCBoYXZlIGRpZmZlcmVudCBzZW1hbnRpYyBtZWFuaW5nLlxuZXhwb3J0IGNvbnN0IE1hdGhCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ21hdGhfYmxvY2snKSxcbiAgbGF0ZXg6IHouc3RyaW5nKCksXG4gIC8vIE1vZGVsIEE6IG9wdGlvbmFsIGluLWVxdWF0aW9uIGdyYWRlYWJsZSBnYXBzIChcdTAwQTdNYXRoUHJvbXB0LCBpbmxpbmUudHMpLlxuICAvLyBPcHRpb25hbCB3aXRoIE5PIGRlZmF1bHQgc28gYSBtYXRoIGJsb2NrIGF1dGhvcmVkIGJlZm9yZSBNb2RlbCBBIFx1MjAxNCBvciBvbmVcbiAgLy8gd2l0aCBubyBnYXBzIFx1MjAxNCByZS1zZXJpYWxpemVzIEJZVEUtSURFTlRJQ0FMTFkuIFNlZSBkb2NzL2Rlc2lnbi9tYXRoLWJsYW5rcy5tZC5cbiAgcHJvbXB0czogei5hcnJheShNYXRoUHJvbXB0KS5vcHRpb25hbCgpLFxuICAvLyBXb3JrZWQgZXhwbGFuYXRpb24gcmV2ZWFsZWQgcG9zdC1jaGVjaywgbWlycm9yaW5nIEZpbGxJbkJsYW5rQmxvY2suc29sdXRpb24uXG4gIC8vIE9wdGlvbmFsOyBvbmx5IG1lYW5pbmdmdWwgb24gYSBnYXAtYmVhcmluZyBlcXVhdGlvbi4gTmV2ZXIgbGVha3MgdGhlIGdhcFxuICAvLyBhbnN3ZXIgZGlyZWN0bHkgKHRoZSBzYW5jdGlvbmVkIHJldmVhbCwgcGVyIHRoZSBydW50aW1lJ3Mgbm8tbGVhayBzdGFuY2UpLlxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICAvLyBWYXJpYWJsZSBibG9jayBzaXppbmc6IG9wdGlvbmFsIHdpZHRoIGZyYWN0aW9uICsgYWxpZ25tZW50IChzaXppbmcudHMpLlxuICAuLi5zaXppbmdGaWVsZHMsXG4gIC8vIFBlci1ibG9jayBkaXNwbGF5IGxhYmVsIFx1MjAxNCBhIGdhcC1iZWFyaW5nIGVxdWF0aW9uIGlzIGEgbnVtYmVyZWQgcHJvYmxlbSBieVxuICAvLyBkZWZhdWx0OyBjdXN0b20vbm9uZSBvcHQgb3V0IChudW1iZXJpbmcvbGFiZWwgZGVjb3VwbGUpLiBJbmVydCBvbiBhXG4gIC8vIHByb21wdC1mcmVlIGRpc3BsYXkgZXF1YXRpb24gKGl0J3MgbmV2ZXIgbnVtYmVyZWQgcmVnYXJkbGVzcykuIFNlZSBsYWJlbC50cy5cbiAgLi4ubGFiZWxGaWVsZHMsXG59KTtcbmV4cG9ydCB0eXBlIE1hdGhCbG9jayA9IHouaW5mZXI8dHlwZW9mIE1hdGhCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gRm91ciB2YXJpYW50cyBpcyBhIGRlbGliZXJhdGUgY29uc3RyYWludC4gTW9yZSB0aGFuIHRoaXMgYW5kIHN0eWxpbmdcbi8vIGJlY29tZXMgaW5jb25zaXN0ZW50IGFjcm9zcyB3b3Jrc2hlZXRzLiBBZGRpbmcgYSBuZXcgdmFyaWFudCBsYXRlciBpcyBhXG4vLyBicmVha2luZyBzY2hlbWEgY2hhbmdlIFx1MjAxNCBjb25zaWRlciB0aGF0IGJlZm9yZSBleHRlbmRpbmcuXG5leHBvcnQgY29uc3QgQ2FsbG91dFZhcmlhbnQgPSB6LmVudW0oWydpbmZvJywgJ3dhcm5pbmcnLCAnc3VjY2VzcycsICdub3RlJ10pO1xuZXhwb3J0IHR5cGUgQ2FsbG91dFZhcmlhbnQgPSB6LmluZmVyPHR5cGVvZiBDYWxsb3V0VmFyaWFudD47XG5cbmV4cG9ydCBjb25zdCBDYWxsb3V0QmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdjYWxsb3V0JyksXG4gIHZhcmlhbnQ6IENhbGxvdXRWYXJpYW50LFxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxufSk7XG5leHBvcnQgdHlwZSBDYWxsb3V0QmxvY2sgPSB6LmluZmVyPHR5cGVvZiBDYWxsb3V0QmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBcdTI2QjAgVE9NQlNUT05FIFx1MjAxNCBgcHJvYmxlbWAgSVMgREVBRC4gRG8gbm90IGJ1aWxkIG9uIGl0LiAoUnVsaW5nIEUxLCAyMDI2LTA4LTE5KVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBibG9jayBzdGlsbCBwYXJzZXMsIGJlY2F1c2UgZG9jdW1lbnRzIGluIHRoZSBkYXRhYmFzZSBtYXkgY29udGFpbiBvbmUgYW5kXG4vLyB0aGUgc2NoZW1hIGlzIHRoZSB0aGluZyB0aGF0IG11c3Qga2VlcCByZWFkaW5nIHRoZW0uIE5PVEhJTkcgRUxTRSBhYm91dCBpdCBpc1xuLy8gYWxpdmU6XG4vL1xuLy8gICAtIFRoZSBFRElUT1IgQ0FOTk9UIEhPTEQgT05FLiBzZXJpYWxpemUudHMncyBhY3Rpdml0eUJsb2NrVG9UaXB0YXAgaGFzIG5vXG4vLyAgICAgYHByb2JsZW1gIG1hcHBpbmcgYW5kIHJldHVybnMgbnVsbCwgc28gYW4gaW1wb3J0ZWQgb3IgaGFuZC1pbnNlcnRlZFxuLy8gICAgIHByb2JsZW0gaXMgZHJvcHBlZCBmcm9tIHRoZSBlZGl0b3IgdmlldyBhbmQgREVMRVRFRCBieSB0aGUgZmlyc3Rcbi8vICAgICBhdXRvc2F2ZS4gVGhpcyBpcyBub3QgYSBnYXAgdG8gZmlsbDsgaXQgaXMgd2h5IHRoZSBibG9jayBpcyBkZWFkLlxuLy8gICAtIFRoZXJlIGlzIG5vIGltcG9ydGVyIGZlbmNlLCBubyBpbnNlcnQgYWZmb3JkYW5jZSwgYW5kIG5vIGVkaXRvciBOb2RlVmlldy5cbi8vICAgLSBUaGUgdmlld2VyJ3MgUHJvYmxlbS50c3ggcmVuZGVycyBpdCByZWFkLW9ubHkgZm9yIHRoZSBkb2N1bWVudHMgdGhhdFxuLy8gICAgIGFscmVhZHkgaGF2ZSBvbmUsIGFuZCB0aGF0IGlzIGl0cyBlbnRpcmUgcmVtYWluaW5nIGpvYi5cbi8vXG4vLyBUaGUgYW5zd2VyLWtleSBkZXNpZ24gcGFzcyAoZG9jcy9kZXNpZ24vcHJvYmxlbS1hbnN3ZXIta2V5Lm1kKSBvcGVuZWQgYnlcbi8vIHByb3Bvc2luZyB0byBSRVZJVkUgdGhpcyBibG9jayBhcyB0aGUgaG9tZSBvZiBwYXBlciBwcm9ibGVtcy4gVGhlIHNjb3BlIGdhdGVcbi8vIG92ZXJ0dXJuZWQgdGhhdCBwcmVtaXNlIG9uIHRoZSBldmlkZW5jZSBhYm92ZTogcGFwZXIgcHJvYmxlbXMgc2hpcCBvblxuLy8gc2hvcnRfYW5zd2VyL2Vzc2F5LCB3aGljaCBoYXZlIHRoZSBlZGl0b3IsIHRoZSBmZW5jZXMsIHRoZSB2aWV3ZXIsIGFuZCAwMDM0J3Ncbi8vIGdyYWRpbmcgcXVldWUgdGhhdCBgcHJvYmxlbWAgbmV2ZXIgaGFkLiBGdWxsIFJFTU9WQUwgb2YgdGhlIHR5cGUgKHdpdGggdGhlXG4vLyBQNSBjbGFpbXMtZ3JlcCBvdmVyIGV2ZXJ5IGNvbW1lbnQgdGhhdCBjaXRlcyBpdCkgaXMgYSByZWNvcmRlZCBUT0RPLCBub3QgcGFydFxuLy8gb2YgdGhhdCBzbGljZSBcdTIwMTQgcmVtb3ZpbmcgYSBwYXJzZWFibGUgc2hhcGUgaXMgYSBtaWdyYXRpb24gcXVlc3Rpb24uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyBBdXRvLW51bWJlcmVkIGF0IHJlbmRlciB0aW1lIGJ5IHdhbGtpbmcgdGhlIGRvY3VtZW50IGFuZCBjb3VudGluZyBwcm9ibGVtXG4vLyBibG9ja3MgaW4gb3JkZXIuIFRoZSBvcHRpb25hbCBgbnVtYmVyYCBmaWVsZCBvdmVycmlkZXMgdGhlIGF1dG8tbnVtYmVyXG4vLyAocmFyZSBjYXNlcyBsaWtlIFwiUHJvYmxlbSA1YVwiIG9yIGhhbmQtbnVtYmVyZWQgbGVnYWN5IHdvcmtzaGVldHMpLlxuLy9cbi8vIHNvbHV0aW9uOiBvcHRpb25hbCB3b3JrZWQgZXhwbGFuYXRpb24gc2hvd24gdG8gYWxsIHN0dWRlbnRzIGFmdGVyIHRoZVxuLy8gc2VjdGlvbiBpcyBjaGVja2VkIChvciBhZnRlciBmaW5hbCBzdWJtaXQgaW4gc2luZ2xlLW1vZGUgYWN0aXZpdGllcyksXG4vLyByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhleSBhbnN3ZXJlZCBjb3JyZWN0bHkuIERpZmZlcmVudCBmcm9tIGhpbnQgXHUyMDE0XG4vLyBoaW50cyBudWRnZSBkdXJpbmcgdGhlIGF0dGVtcHQ7IHNvbHV0aW9ucyBleHBsYWluIGFmdGVyLiBUaGUgcnVudGltZVxuLy8gcmVhZHMgdGhpcyBvbiBpbml0IGJ1dCBkb2VzIE5PVCBpbmplY3QgaXQgaW50byB0aGUgRE9NIHVudGlsIGFmdGVyXG4vLyBjaGVjayAoUGhhc2UgMSBzZWN1cml0eSBjZWlsaW5nIFx1MjAxNCBkb24ndCBtYWtlIHRoZSBsZWFrIHdvcnNlKS5cbi8vXG4vLyBza2lsbHM6IG9wdGlvbmFsIGFycmF5IG9mIHVuaXZlcnNhbCBza2lsbCB0YWdzIHRoaXMgcHJvYmxlbSB0YXJnZXRzLlxuLy8gQWN0aXZpdHktbGV2ZWwgc2tpbGxzIGxpdmUgb24gQWN0aXZpdHlNZXRhOyB0aGlzIGZpZWxkIGNhcHR1cmVzXG4vLyBwcm9ibGVtLWxldmVsIGdyYW51bGFyaXR5IGZvciBmdXR1cmUgcGVyLXNraWxsIGFuYWx5dGljcy4gRWRpdG9yIFVJIGlzXG4vLyBQaGFzZSAyOyB0aGUgZmllbGQgZXhpc3RzIGluIFBoYXNlIDEgc28gYW5hbHl0aWNzIGNhbiByZWFjaCBiYWNrLlxuZXhwb3J0IGNvbnN0IFByb2JsZW1CbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHoubGl0ZXJhbCgncHJvYmxlbScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbn0pO1xuZXhwb3J0IHR5cGUgUHJvYmxlbUJsb2NrID0gei5pbmZlcjx0eXBlb2YgUHJvYmxlbUJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IEZpbGxJbkJsYW5rSW5saW5lLCBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuXG4vLyBUaGUgYXJjaGl0ZWN0dXJhbGx5IGludGVyZXN0aW5nIGJsb2NrLiBjb250ZW50IGlzIGFuIGFycmF5IG9mIGlubGluZSBub2Rlc1xuLy8gdGhhdCBtYXkgaW5jbHVkZSBCbGFua1Rva2VuIFx1MjAxNCBzdHVkZW50cyBzZWUgcHJvc2Ugd2l0aCBlZGl0YWJsZSBibGFua3MuXG4vLyBFYWNoIGJsYW5rJ3MgaWQgaXMgYSBzdGFibGUgcmVmZXJlbmNlIHVzZWQgaW4gc3VibWlzc2lvbnMucmVzcG9uc2VzLCBzb1xuLy8gcmVvcmRlcmluZyBibG9ja3MgZG9lc24ndCBicmVhayBncmFkaW5nIG9uIHBhc3Qgc3VibWlzc2lvbnMuXG4vL1xuLy8gYXV0by1udW1iZXJlZCBsaWtlIFByb2JsZW1CbG9jayBmb3IgdGhlIHByb2JsZW0gaGVhZGVyIChlLmcuLCBcIlByb2JsZW0gM1wiKS5cbi8vIFdoeSBub3QganVzdCB1c2UgUHJvYmxlbUJsb2NrPyBUaGV5IGhhdmUgZGlmZmVyZW50IHJlbmRlcmluZyBhbmQgZGlmZmVyZW50XG4vLyBzdHVkZW50IGludGVyYWN0aW9uOyBjb25mbGF0aW5nIHRoZW0gd291bGQgZm9yY2UgZXZlcnkgcHJvYmxlbSB0byBlaXRoZXJcbi8vIGhhdmUgb3Igbm90IGhhdmUgYmxhbmtzLCBpbnN0ZWFkIG9mIGJlaW5nIGEgcGVyLXByb2JsZW0gZGVjaXNpb24uXG4vL1xuLy8gUGVyLWJsYW5rIGZpZWxkcyAoaGludCwgbWlzdGFrZUZlZWRiYWNrKSBsaXZlIG9uIEJsYW5rVG9rZW4gaW4gaW5saW5lLnRzLlxuLy8gUGVyLWJsb2NrIGZpZWxkcyBiZWxvdzpcbi8vICAgLSBzb2x1dGlvbjogb25lIHdvcmtlZCBleHBsYW5hdGlvbiBmb3IgdGhlIHdob2xlIHByb2JsZW0gKGEgXCJzaW1wbGlmeVxuLy8gICAgIF9feFx1MDBCMiArIF9feCAtIDEyXCIgcHJvbXB0IGhhcyBvbmUgc29sdXRpb24gY292ZXJpbmcgYWxsIGJsYW5rcywgbm90IG9uZVxuLy8gICAgIHBlciBibGFuaykuIFNob3duIHBvc3QtY2hlY2sgcmVnYXJkbGVzcyBvZiBjb3JyZWN0bmVzcy5cbi8vICAgLSBza2lsbHM6IHVuaXZlcnNhbCBza2lsbCB0YWdzIChzZWUgQWN0aXZpdHlNZXRhLnNraWxscykuIEVkaXRvciBVSSBmb3Jcbi8vICAgICB0aGlzIGZpZWxkIGlzIFBoYXNlIDI7IGZpZWxkIGV4aXN0cyBpbiBQaGFzZSAxIHNvIHBlci1za2lsbCBhbmFseXRpY3Ncbi8vICAgICBjYW4gcmVhY2ggYmFjayB0byBQaGFzZSAxIHByb2JsZW1zIHdoZW4gdGhlIGVkaXRvciBsYW5kcy5cbi8vICAgLSB3b3JrU3BhY2U6IHBlci1wcm9ibGVtIG92ZXJyaWRlIChpbiByZW0pIGZvciB0aGUgYmxhbmsgd29ya2luZyBzcGFjZVxuLy8gICAgIHByaW50ZWQgYmVsb3cgdGhpcyBwcm9ibGVtLiBPcHRpb25hbCB3aXRoIE5PIGRlZmF1bHQgb24gcHVycG9zZTogYW5cbi8vICAgICBhYnNlbnQgdmFsdWUgbWVhbnMgXCJpbmhlcml0IHRoZSBhY3Rpdml0eS1sZXZlbCBwcmludC53b3JrU3BhY2VcIiwgd2hpY2hcbi8vICAgICBpcyBleGFjdGx5IHRoZSBDU1MtY3VzdG9tLXByb3BlcnR5IGluaGVyaXRhbmNlIHRoZSByZW5kZXJlciByZWxpZXMgb25cbi8vICAgICAodGhlIGJsb2NrIHNldHMgaXRzIG93biAtLXByaW50LXdvcmstc3BhY2Ugb25seSB3aGVuIHRoaXMgaXMgcHJlc2VudCkuXG4vLyAgICAgQSBkZWZhdWx0IGhlcmUgd291bGQgcGluIGV2ZXJ5IGJsb2NrIHRvIGEgY29uY3JldGUgdmFsdWUgYW5kIGRlZmVhdFxuLy8gICAgIHRoYXQgaW5oZXJpdGFuY2UuIFByaW50LW9ubHk7IGlnbm9yZWQgb24gc2NyZWVuLlxuZXhwb3J0IGNvbnN0IEZpbGxJbkJsYW5rQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogei5saXRlcmFsKCdmaWxsX2luX2JsYW5rJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHouYXJyYXkoRmlsbEluQmxhbmtJbmxpbmUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtTcGFjZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGVyLWJsb2NrIGRpc3BsYXkgbGFiZWwgKGF1dG8vY3VzdG9tL25vbmUpLiBBYnNlbnQgPSBhdXRvID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdG9kYXkncyBudW1iZXJlZCBiZWhhdmlvci4gU2VlIGxhYmVsLnRzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5sYWJlbEZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgRmlsbEluQmxhbmtCbG9jayA9IHouaW5mZXI8dHlwZW9mIEZpbGxJbkJsYW5rQmxvY2s+O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBsaXN0LnRzIFx1MjAxNCBCdWxsZXQgYW5kIG9yZGVyZWQgbGlzdCBibG9ja3Ncbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBMaXN0cyBuZXN0LiBBIExpc3RJdGVtIGhvbGRzIGlubGluZSBjb250ZW50IHBsdXMgYW4gb3B0aW9uYWwgYGNoaWxkcmVuYFxuLy8gYXJyYXkgb2YgbmVzdGVkIGxpc3QgYmxvY2tzOyBidWxsZXQgYW5kIG9yZGVyZWQgbGlzdHMgY2FuIG1peCBmcmVlbHkgYXRcbi8vIGFueSBkZXB0aC4gVGhpcyBtaXJyb3JzIFRpcHRhcCdzIGxpc3RJdGVtID4gcGFyYWdyYXBoICsgKGJ1bGxldExpc3QgfFxuLy8gb3JkZXJlZExpc3QpIHNoYXBlIGVuZC10by1lbmQsIHNvIFRhYi10by1pbmRlbnQgaW4gdGhlIGVkaXRvciBwcmVzZXJ2ZXNcbi8vIGhpZXJhcmNoeSB0aHJvdWdoIGF1dG9zYXZlLlxuLy9cbi8vIFJlY3Vyc2lvbiBtZWNoYW5pYzogb25seSB0aGUgY3ljbGljIGVkZ2UgKExpc3RJdGVtLmNoaWxkcmVuIFx1MjE5MiBsaXN0IGJsb2NrIFx1MjE5MlxuLy8gTGlzdEl0ZW0pIG5lZWRzIHoubGF6eSgpLiBCdWxsZXRMaXN0QmxvY2sgYW5kIE9yZGVyZWRMaXN0QmxvY2sgYXJlIHBsYWluXG4vLyB6Lm9iamVjdHMsIHdoaWNoIGtlZXBzIHRoZW0gdXNhYmxlIGFzIG1lbWJlcnMgb2Ygei5kaXNjcmltaW5hdGVkVW5pb24gaW5cbi8vIGJsb2Nrcy9pbmRleC50cy4gRGlzY3JpbWluYXRlZCB1bmlvbnMgbmVlZCBab2RPYmplY3RzIHRvIGludHJvc3BlY3QgdGhlXG4vLyBgdHlwZWAgZGlzY3JpbWluYXRvcjsgYSB0b3AtbGV2ZWwgei5sYXp5KCkgd3JhcHBlciB3b3VsZCBkZWZlYXQgdGhhdC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vIC0tLS0gVHlwZVNjcmlwdCBpbnRlcmZhY2VzIChmb3J3YXJkIGRlY2xhcmF0aW9ucyBmb3IgdGhlIHJlY3Vyc2l2ZSB0eXBlcykgLS0tXG5cbmV4cG9ydCBpbnRlcmZhY2UgTGlzdEl0ZW0ge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY29udGVudDogei5pbmZlcjx0eXBlb2YgSW5saW5lTm9kZT5bXTtcbiAgICBjaGlsZHJlbj86IEFycmF5PEJ1bGxldExpc3RCbG9jayB8IE9yZGVyZWRMaXN0QmxvY2s+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1bGxldExpc3RCbG9jayB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB0eXBlOiAnYnVsbGV0X2xpc3QnO1xuICAgIGl0ZW1zOiBMaXN0SXRlbVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE9yZGVyZWRMaXN0QmxvY2sge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgdHlwZTogJ29yZGVyZWRfbGlzdCc7XG4gICAgaXRlbXM6IExpc3RJdGVtW107XG59XG5cbi8vIC0tLS0gWm9kIHNjaGVtYXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIExhenkgYmVjYXVzZSBMaXN0SXRlbS5jaGlsZHJlbiByZWZlcnMgdG8gdGhlIGxpc3QgYmxvY2tzLCB3aGljaCByZWZlciBiYWNrXG4vLyB0byBMaXN0SXRlbS4gVGhlIGFycm93IGJvZHkgb25seSBydW5zIGF0IHBhcnNlIHRpbWUsIGJ5IHdoaWNoIHBvaW50IGFsbFxuLy8gdGhyZWUgZXhwb3J0cyBhcmUgYm91bmQuXG5leHBvcnQgY29uc3QgTGlzdEl0ZW06IHouWm9kVHlwZTxMaXN0SXRlbSwgei5ab2RUeXBlRGVmLCB1bmtub3duPiA9IHoubGF6eSgoKSA9Plxuei5vYmplY3Qoe1xuICAgIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgICAgICAgIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gICAgICAgICBjaGlsZHJlbjogelxuICAgICAgICAgLmFycmF5KHoudW5pb24oW0J1bGxldExpc3RCbG9jaywgT3JkZXJlZExpc3RCbG9ja10pKVxuICAgICAgICAgLm9wdGlvbmFsKCksXG59KSxcbik7XG5cbmV4cG9ydCBjb25zdCBCdWxsZXRMaXN0QmxvY2sgPSB6Lm9iamVjdCh7XG4gICAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHoubGl0ZXJhbCgnYnVsbGV0X2xpc3QnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogei5hcnJheShMaXN0SXRlbSksXG59KTtcblxuZXhwb3J0IGNvbnN0IE9yZGVyZWRMaXN0QmxvY2sgPSB6Lm9iamVjdCh7XG4gICAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB6LmxpdGVyYWwoJ29yZGVyZWRfbGlzdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogei5hcnJheShMaXN0SXRlbSksXG59KTtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUsIE1pc2NvbmNlcHRpb25JZCB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcbmltcG9ydCB7IHNpemluZ0ZpZWxkcyB9IGZyb20gJy4uL3NpemluZy5qcyc7XG5pbXBvcnQge1xuICBBeGlzQ29uZmlnLFxuICBDdXJ2ZURvbWFpbixcbiAgRHJhd2FibGUsXG4gIEVuZHBvaW50U3R5bGUsXG4gIEZ1bmN0aW9uTW9kZWwsXG59IGZyb20gJy4uL2dyYXBoLXByaW1pdGl2ZXMuanMnO1xuXG4vLyBUaGUgY29vcmRpbmF0ZS1wbGFuZSBwcmltaXRpdmVzIChBeGlzQ29uZmlnLCBFbmRwb2ludFN0eWxlLCBDdXJ2ZURvbWFpbiwgdGhlXG4vLyBGdW5jdGlvbk1vZGVsIGZhbWlseSwgRHJhd2FibGVDb2xvciwgRHJhd2FibGUpIE1PVkVEIHRvIC4uL2dyYXBoLXByaW1pdGl2ZXMudHNcbi8vIFx1MjAxNCBhIGxlYWYgbW9kdWxlIHRoYXQgaW1wb3J0cyBub3RoaW5nIGJ1dCB6b2QuIFRoZXkgYXJlIHJlLWV4cG9ydGVkIGhlcmUsIHdpdGhcbi8vIGlkZW50aWNhbCBpZGVudGl0aWVzLCBzbyBldmVyeSBleGlzdGluZyBpbXBvcnQgcGF0aCBrZWVwcyB3b3JraW5nLlxuLy9cbi8vIFdoeSB0aGV5IG1vdmVkOiB0aGlzIGZpbGUgaW1wb3J0cyBJbmxpbmVOb2RlLCBzbyByZWFjaGluZyB0aGUgcHJpbWl0aXZlc1xuLy8gdGhyb3VnaCBpdCBkcmFncyBpbiBpbmxpbmUudHMuIGlubGluZS50cyBub3cgbmVlZHMgZ3JhcGhfZmlndXJlIChhIGRlZmluaXRpb25cbi8vIG1heSBjb250YWluIG9uZSksIHdoaWNoIHdvdWxkIGNsb3NlIHRoZSBjeWNsZSBpbmxpbmUgLT4gZ3JhcGgtZmlndXJlIC0+XG4vLyBpbnRlcmFjdGl2ZS1ncmFwaCAtPiBpbmxpbmUuIFRoYXQgY3ljbGUgaXMgZmF0YWwsIG5vdCBjb3NtZXRpYzogdGhlXG4vLyBgei5hcnJheShJbmxpbmVOb2RlKWAgY2FsbHMgYmVsb3cgcnVuIGF0IG1vZHVsZSBzY29wZSBhbmQgd291bGQgaGl0IGEgVERaXG4vLyBSZWZlcmVuY2VFcnJvciBvbiBhIHBhcnRpYWxseS1pbml0aWFsaXplZCBpbmxpbmUuanMuIFNlZSBncmFwaC1wcmltaXRpdmVzLnRzLlxuZXhwb3J0IHtcbiAgQXhpc0NvbmZpZyxcbiAgRW5kcG9pbnRTdHlsZSxcbiAgQ3VydmVEb21haW4sXG4gIExpbmVhck1vZGVsLFxuICBRdWFkcmF0aWNNb2RlbCxcbiAgQ3ViaWNNb2RlbCxcbiAgUXVhcnRpY01vZGVsLFxuICBFeHBvbmVudGlhbE1vZGVsLFxuICBMb2dhcml0aG1pY01vZGVsLFxuICBWZXJ0aWNhbE1vZGVsLFxuICBGdW5jdGlvbk1vZGVsLFxuICBEcmF3YWJsZUNvbG9yLFxuICBEcmF3YWJsZSxcbn0gZnJvbSAnLi4vZ3JhcGgtcHJpbWl0aXZlcy5qcyc7XG5leHBvcnQgdHlwZSB7IERyYXdhYmxlQ29sb3JUIH0gZnJvbSAnLi4vZ3JhcGgtcHJpbWl0aXZlcy5qcyc7XG5cbi8vIFRoZSBpbnRlcmFjdGl2ZSBncmFwaCBibG9jayAoUGhhc2UgMi43LCBTdGFnZSA1KS4gVW5saWtlIGV2ZXJ5IG90aGVyIGJsb2NrLFxuLy8gdGhlIHN0dWRlbnQncyBhbnN3ZXIgaXMgR0VPTUVUUklDIFx1MjAxNCBhIHBvaW50IHRoZXkgcGxvdCBvbiBhIGNvb3JkaW5hdGUgcGxhbmUgXHUyMDE0XG4vLyBub3QgdGV4dC4gVGhyZWUgc3RydWN0dXJhbCBjb25zZXF1ZW5jZXMgKHNlZSBkb2NzL2Rlc2lnbi9pbnRlcmFjdGl2ZS1ncmFwaC1cbi8vIGJsb2NrLm1kKTogdGhlIGFuc3dlciBpcyBhIHN0cnVjdHVyZWQgdmFsdWUgKGl0cyBvd24gc3VibWlzc2lvbiBtYXAsIG5vdCB0aGVcbi8vIGJsYW5rcyBtYXApLCBzY29yaW5nIGlzIHRvbGVyYW5jZS1iYXNlZCBnZW9tZXRyaWMgY29tcGFyaXNvbiAodGhlIGdyYXBoLWtpdFxuLy8gc2NvcmVzIGl0LCBub3QgdGhlIHJ1bnRpbWUncyBzdHJpbmcgc3RyYXRlZ2llcyksIGFuZCB0aGUgd2lkZ2V0IGlzIGxhcmdlXG4vLyAoSlNYR3JhcGggcmlkZXMgdGhlIGxhenktbG9hZGVkIEBhY3Rpdml0eS9ncmFwaC1raXQsIG5ldmVyIHRoZSBiYXNlIHJ1bnRpbWUpLlxuLy9cbi8vIFNsaWNlIDEgKDIuN2EpIHNoaXBzIE9ORSBpbnRlcmFjdGlvbiBcdTIwMTQgcGxvdF9wb2ludC4gVGhlIGludGVyYWN0aW9uIGlzIGFcbi8vIGRpc2NyaW1pbmF0ZWQgdW5pb24gZnJvbSBkYXkgb25lIHNvIHBsb3RfbGluZSAoMi43YikgYW5kIHNoYWRlX3JlZ2lvbiAoMi43Yylcbi8vIGFyZSBlYWNoIGEgbmV3IHZhcmlhbnQgKyBhIG5ldyBzY29yaW5nIHN0cmF0ZWd5IHdpdGggTk8gc2NoZW1hIG1pZ3JhdGlvbiBhbmRcbi8vIG5vIGNoYW5nZSB0byBhbnkgb3RoZXIgYmxvY2sgdHlwZSBcdTIwMTQgZXhhY3RseSBob3cgdGhlIHRvcC1sZXZlbCBCbG9jayB1bmlvblxuLy8gZ3Jvd3MuXG5cbi8vIC0tLS0gSW50ZXJhY3Rpb24gdmFyaWFudHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFYWNoIHZhcmlhbnQgY2FycmllcyBpdHMgT1dOIGFuc3dlciBrZXkgKyB0b2xlcmFuY2UuIHBsb3RfcG9pbnQgaXMgdGhlIG9ubHlcbi8vIHZhcmlhbnQgaW4gc2xpY2UgMTsgdGhlIHVuaW9uIHNoYXBlIGlzIGhlcmUgc28gdGhlIG5leHQgdmFyaWFudHMgc2xvdCBpbi5cbmV4cG9ydCBjb25zdCBQb2ludEludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3RfcG9pbnQnKSxcbiAgLy8gT25lIG9yIG1vcmUgY29ycmVjdCBwb2ludHM7IHRoZSBzdHVkZW50IG11c3QgcGxvdCBhbGwgb2YgdGhlbS4gQSBzaW5nbGVcbiAgLy8gcG9pbnQgaXMgdGhlIGNvbW1vbiBjYXNlOyBtdWx0aXBsZSBzdXBwb3J0cyBlLmcuIFwicGxvdCB0aGUgdHdvIHJvb3RzLlwiXG4gIGNvcnJlY3RQb2ludHM6IHouYXJyYXkoei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pKS5taW4oMSksXG4gIC8vIFBlci1wb2ludCB0b2xlcmFuY2UgaW4gZ3JhcGggdW5pdHMgKGEgRXVjbGlkZWFuL2VhY2gtYXhpcyByYWRpdXMsIGFwcGxpZWRcbiAgLy8gYnkgdGhlIGtpdCdzIHNjb3JlcikuIDAuMSBkZWZhdWx0IHN1aXRzIGEgc25hcC10by1ncmlkIHNpbmdsZSBwb2ludC5cbiAgdG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxufSk7XG5leHBvcnQgdHlwZSBQb2ludEludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgUG9pbnRJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gcGxvdF9mdW5jdGlvbjogcGxvdCBhIGN1cnZlIG9mIGEgZ2l2ZW4gZmFtaWx5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHN0dWRlbnQgcGxhY2VzIE4gcG9pbnRzIGFuZCB0aGUgd2lkZ2V0IGZpdHMgKyBkcmF3cyBhIGN1cnZlIFRIUk9VR0ggdGhlbVxuLy8gKE4gPSB0aGUgZmFtaWx5J3MgcGFyYW1ldGVyIGNvdW50OiBsaW5lYXIgMiwgcXVhZHJhdGljIDMsIGV4cG9uZW50aWFsIDIsXG4vLyBsb2dhcml0aG1pYyAyKS4gU2NvcmVkIG9uIHRoZSBmaXR0ZWQgY3VydmUncyBQQVJBTUVURVJTIChub3QgdGhlIGV4YWN0IHBvaW50XG4vLyBwb3NpdGlvbnMpLCBzbyBhbnkgcG9pbnRzIG9uIHRoZSBjb3JyZWN0IGN1cnZlIGFyZSBhY2NlcHRlZC4gVGhlIHBhcmFtZXRlcnNcbi8vIGNvbWUgZnJvbSB0aGUgU0FNRSByZWdyZXNzaW9uIGZpdCBlbmdpbmUgdGhlIGNhbGN1bGF0b3IgdXNlcyAoZml0TGluZWFyLCBcdTIwMjYpLlxuLy9cbi8vIGBtb2RlbGAgaXMgYSBkaXNjcmltaW5hdGVkIHVuaW9uIG9uIGBmYW1pbHlgIChGdW5jdGlvbk1vZGVsLCBub3cgaW5cbi8vIC4uL2dyYXBoLXByaW1pdGl2ZXMudHMgYW5kIHJlLWV4cG9ydGVkIGFib3ZlKTogbGluZWFyLCBxdWFkcmF0aWMsIGV4cG9uZW50aWFsLFxuLy8gbG9nYXJpdGhtaWMsIHZlcnRpY2FsLiBHcm93aW5nIGEgZmFtaWx5IGlzIGEgbmV3IG1lbWJlciB0aGVyZSArIGEgbmV3IGZpdFxuLy8gYnJhbmNoIGluIHRoZSBraXQncyBzY29yZXIgXHUyMDE0IGFkZGl0aXZlLCBub3QgYSByZXdyaXRlLlxuXG4vLyBwbG90X2Z1bmN0aW9uIGNhcnJpZXMgYW4gQVJSQVkgb2YgY3VydmVzIChzaGlwcyBhcyBvbmUpLiBPbmUgY3VydmUgaXMgdGhlXG4vLyBjb21tb24gY2FzZTsgbXVsdGlwbGUgaXMgYSBzeXN0ZW0gb2YgZXF1YXRpb25zIChcImdyYXBoIGJvdGggbGluZXNcIiksIHNjb3JlZFxuLy8gYXMgb25lIG9iamVjdCBlYWNoIFx1MjAxNCBzbyBzeXN0ZW1zIGFyZSBhZGRpdGl2ZSwgbm90IGEgcmVzaGFwZSAoRHJvcCAyIGRlY2lzaW9uKS5cbmV4cG9ydCBjb25zdCBGdW5jdGlvbkludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3RfZnVuY3Rpb24nKSxcbiAgbW9kZWxzOiB6LmFycmF5KEZ1bmN0aW9uTW9kZWwpLm1pbigxKSxcbiAgLy8gRHJvcCA2OiBvcHRpb25hbCBwZXItY3VydmUgZG9tYWluIHJlc3RyaWN0aW9ucyAoXCJncmFwaCB5ID0gMnggKyAzIGZvclxuICAvLyB4ID49IDBcIiksIHBhcmFsbGVsIHRvIG1vZGVscyBieSBpbmRleC4gVGhlIGZyZWVmb3JtIHBhcnNlciBmaWxscyB0aGVzZSBmcm9tXG4gIC8vIGEgYGZvciBcdTIwMjZgIGNsYXVzZTsgdGhlIHdpZGdldCdzIGVuZHBvaW50LWRyYWcgVVggaXMgdGhlIHBsYW5uZWQgZm9sbG93LXVwIFx1MjAxNFxuICAvLyB1bnRpbCBpdCBsYW5kcywgdGhlIGRvbWFpbiBpcyBhdXRob3JpbmcgbWV0YWRhdGEgZHJhd24gb24gdGhlIGtleSwgYW5kXG4gIC8vIHNjb3JpbmcgcmVtYWlucyBvbiB0aGUgY3VydmUgcGFyYW1ldGVycy5cbiAgZG9tYWluczogei5hcnJheShDdXJ2ZURvbWFpbi5udWxsYWJsZSgpKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBGdW5jdGlvbkludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgRnVuY3Rpb25JbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gc2hhZGVfcmVnaW9uOiBzaGFkZSBhIHBvbHlnb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzdHVkZW50IGRyYWdzIHRoZSB2ZXJ0aWNlcyBvZiBhIHBvbHlnb24gKG9uZSBoYW5kbGUgcGVyIHZlcnRleCkgdG8gY292ZXIgYVxuLy8gdGFyZ2V0IHJlZ2lvbiwgd2hpY2ggaXMgc2hhZGVkIGFzIHRoZXkgbW92ZS4gU2NvcmVkIGJ5IEFSRUEgT1ZFUkxBUCB3aXRoIHRoZVxuLy8gY29ycmVjdCBwb2x5Z29uIChpbnRlcnNlY3Rpb24tb3Zlci11bmlvbiBcdTIyNjUgbWluT3ZlcmxhcCksIHNvIHRoZSBleGFjdCB2ZXJ0ZXhcbi8vIHBvc2l0aW9ucyBkb24ndCBtYXR0ZXIgXHUyMDE0IG9ubHkgdGhhdCB0aGUgc2hhZGVkIHJlZ2lvbiBtYXRjaGVzLiBBIHBvbHlnb24sIG5vdCBhXG4vLyBjdXJ2ZSwgc28gaXQncyBpdHMgb3duIGludGVyYWN0aW9uIChub3QgYSBwbG90X2Z1bmN0aW9uIGZhbWlseSkuXG4vLyBPbmUgdGFyZ2V0IHBvbHlnb246IHZlcnRpY2VzIGluIG9yZGVyIChtaW4gMykgKyB0aGUgbWluaW11bSBpbnRlcnNlY3Rpb24tb3Zlci1cbi8vIHVuaW9uIHdpdGggdGhlIHN0dWRlbnQncyBwb2x5Z29uIHRvIGNvdW50IGFzIGNvcnJlY3QuXG5leHBvcnQgY29uc3QgUmVnaW9uQW5zd2VyID0gei5vYmplY3Qoe1xuICBjb3JyZWN0VmVydGljZXM6IHouYXJyYXkoei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pKS5taW4oMyksXG4gIC8vIDAuOSBpcyBzdHJpY3QgKG5lYXItZXhhY3Qgb24gYSBzbmFwcGVkIGdyaWQpOyBsb3dlciBpdCBmb3IgaGFuZC1kcmFnZ2VkIC9cbiAgLy8gYXBwcm94aW1hdGUgcmVnaW9ucy5cbiAgbWluT3ZlcmxhcDogei5udW1iZXIoKS5taW4oMCkubWF4KDEpLmRlZmF1bHQoMC45KSxcbn0pO1xuZXhwb3J0IHR5cGUgUmVnaW9uQW5zd2VyID0gei5pbmZlcjx0eXBlb2YgUmVnaW9uQW5zd2VyPjtcblxuLy8gc2hhZGVfcmVnaW9uIGNhcnJpZXMgYW4gQVJSQVkgb2YgdGFyZ2V0IHBvbHlnb25zIChzaGlwcyBhcyBvbmUpLCBlYWNoIHNjb3JlZFxuLy8gYXMgb25lIG9iamVjdCBcdTIwMTQgc28gXCJzaGFkZSBib3RoIHJlZ2lvbnNcIiBpcyBhZGRpdGl2ZSwgbWF0Y2hpbmcgcGxvdF9mdW5jdGlvbi5cbmV4cG9ydCBjb25zdCBSZWdpb25JbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdzaGFkZV9yZWdpb24nKSxcbiAgcmVnaW9uczogei5hcnJheShSZWdpb25BbnN3ZXIpLm1pbigxKSxcbn0pO1xuZXhwb3J0IHR5cGUgUmVnaW9uSW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBSZWdpb25JbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gZ3JhcGhfaW5lcXVhbGl0eTogZ3JhcGggYW4gaW5lcXVhbGl0eSAoRHJvcCA0KSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzdHVkZW50IHBsYWNlcyB0aGUgYm91bmRhcnkgKHNhbWUgaGFuZGxlcyBhcyBwbG90X2Z1bmN0aW9uKSwgdG9nZ2xlcyB0aGVcbi8vIGxpbmUgZG90dGVkIChzdHJpY3QpIG9yIHNvbGlkIChpbmNsdXNpdmUpLCBhbmQgY2xpY2tzIGEgc2lkZSB0byBzaGFkZS4gQWxsXG4vLyB0aHJlZSBhcmUgZ3JhZGVkIFx1MjAxNCBjaG9vc2luZyB0aGVtIElTIHRoZSBza2lsbC4gVGhlIGJvdW5kYXJ5IGlzIGEgRnVuY3Rpb25Nb2RlbCxcbi8vIHNvIHF1YWRyYXRpYyBpbmVxdWFsaXRpZXMgKHkgPiB4XHUwMEIyKSB3b3JrIHRoZSBkYXkgdGhlIGZhbWlseSBkb2VzOyBhIHZlcnRpY2FsXG4vLyBib3VuZGFyeSAoeCA+IDMpIHNoYWRlcyBsZWZ0L3JpZ2h0IGluc3RlYWQgb2YgYWJvdmUvYmVsb3cuXG5leHBvcnQgY29uc3QgU2hhZGVTaWRlVmFsdWUgPSB6LmVudW0oWydhYm92ZScsICdiZWxvdycsICdsZWZ0JywgJ3JpZ2h0J10pO1xuZXhwb3J0IHR5cGUgU2hhZGVTaWRlVmFsdWUgPSB6LmluZmVyPHR5cGVvZiBTaGFkZVNpZGVWYWx1ZT47XG5cbmV4cG9ydCBjb25zdCBJbmVxdWFsaXR5QW5zd2VyID0gei5vYmplY3Qoe1xuICBib3VuZGFyeTogRnVuY3Rpb25Nb2RlbCxcbiAgLy8gdHJ1ZSA9IHN0cmljdCAoPCAvID4sIGRvdHRlZCBib3VuZGFyeSk7IGZhbHNlID0gaW5jbHVzaXZlIChcdTIyNjQgLyBcdTIyNjUsIHNvbGlkKS5cbiAgc3RyaWN0OiB6LmJvb2xlYW4oKSxcbiAgc2hhZGVTaWRlOiBTaGFkZVNpZGVWYWx1ZSxcbn0pO1xuZXhwb3J0IHR5cGUgSW5lcXVhbGl0eUFuc3dlciA9IHouaW5mZXI8dHlwZW9mIEluZXF1YWxpdHlBbnN3ZXI+O1xuXG4vLyBBbiBBUlJBWSBvZiBpbmVxdWFsaXRpZXMgKHNoaXBzIGFzIG9uZSk7IHN5c3RlbXMgKFwic2hhZGUgd2hlcmUgQk9USCBob2xkXCIpXG4vLyBiZWNvbWUgYWRkaXRpdmUgbWVtYmVycywgbWF0Y2hpbmcgcGxvdF9mdW5jdGlvbi9zaGFkZV9yZWdpb24uXG5leHBvcnQgY29uc3QgSW5lcXVhbGl0eUludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2dyYXBoX2luZXF1YWxpdHknKSxcbiAgaW5lcXVhbGl0aWVzOiB6LmFycmF5KEluZXF1YWxpdHlBbnN3ZXIpLm1pbigxKSxcbn0pO1xuZXhwb3J0IHR5cGUgSW5lcXVhbGl0eUludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgSW5lcXVhbGl0eUludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBkaXNwbGF5OiBhIHN0YXRpYyAodW5ncmFkZWQpIGdyYXBoIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgYmxvY2sgZHJhd3MgYSBmaXhlZCBwaWN0dXJlIFx1MjAxNCBwb2ludHMsIGN1cnZlcywgc2VnbWVudHMsIGZpbGxlZCBwb2x5Z29ucyBcdTIwMTRcbi8vIGFuZCBjb2xsZWN0cyBOTyBhbnN3ZXIuIFR3byBqb2JzIGZyb20gb25lIHNoYXBlOiBhIHN0aW11bHVzIGEgZ3JhZGVkIHF1ZXN0aW9uXG4vLyByZWZlcnMgdG8gKFwidXNpbmcgdGhlIGdyYXBoIGJlbG93LCBcdTIwMjZcIiksIGFuZCBhIHN0YW5kYWxvbmUgZXhlbXBsYXIgd2l0aCBub1xuLy8gcXVlc3Rpb24gYXQgYWxsIChhbiBlbXB0eSBwcm9tcHQpLiBCZWNhdXNlIGBkaXNwbGF5YCBpcyBqdXN0IGFub3RoZXIgbWVtYmVyIG9mXG4vLyB0aGUgYHR5cGVgIHVuaW9uLCBhIHN0aW11bHVzLXdpdGgtYW4tYW5zd2VyIGxhdGVyIGlzIGFkZGl0aXZlIFx1MjAxNCBhIG5ldyBhbnN3ZXJcbi8vIGZpZWxkIGJlc2lkZSB0aGUgZHJhd2FibGVzIFx1MjAxNCBub3QgYSBuZXcgYmxvY2sgZmFtaWx5LlxuLy9cbi8vIGBEcmF3YWJsZWAgKHRoZSBwb2ludCAvIGN1cnZlIC8gZXhwcmVzc2lvbiAvIHNlZ21lbnQgLyByYXkgLyBwb2x5Z29uIHVuaW9uLFxuLy8gZGlzY3JpbWluYXRlZCBvbiBga2luZGApIGFuZCBpdHMgYERyYXdhYmxlQ29sb3JgIHBhbGV0dGUga2V5cyBub3cgbGl2ZSBpblxuLy8gLi4vZ3JhcGgtcHJpbWl0aXZlcy50cyBhbmQgYXJlIHJlLWV4cG9ydGVkIGFib3ZlLlxuXG5leHBvcnQgY29uc3QgRGlzcGxheUludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2Rpc3BsYXknKSxcbiAgZHJhd2FibGVzOiB6LmFycmF5KERyYXdhYmxlKS5kZWZhdWx0KFtdKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGlzcGxheUludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgRGlzcGxheUludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBwbG90X3JheSAvIHBsb3Rfc2VnbWVudDogZHJhdyBhIHJheSBvciBzZWdtZW50IGRpcmVjdGx5IC0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRmlyc3QtY2xhc3MgcmVwbGFjZW1lbnRzIGZvciB0aGUgZG9tYWluLWdsaWRlciBhcHByb2FjaCAod2hpY2ggYXNrZWQgc3R1ZGVudHNcbi8vIHRvIGRlZmluZSBhbiBpbmZpbml0ZSBsaW5lLCB0aGVuIG1hcmsgZW5kcG9pbnRzIG9uIGl0IHdpdGggc2VwYXJhdGUgY29udHJvbHMgXHUyMDE0XG4vLyB0aGUgZHJhd24gbGluZSBuZXZlciBldmVuIGNsaXBwZWQpLiBIZXJlIHRoZSBzdHVkZW50IGRyYWdzIFRXTyBoYW5kbGVzIFx1MjAxNCB0aGVcbi8vIGVuZHBvaW50KHMpIFx1MjAxNCBhbmQgdGhlIHdpZGdldCBkcmF3cyBhbiBBQ1RVQUwgcmF5L3NlZ21lbnQgdGhyb3VnaCB0aGVtXG4vLyAoSlNYR3JhcGggc3RyYWlnaHRGaXJzdC9zdHJhaWdodExhc3QpLCB3aXRoIG9wZW4vY2xvc2VkIGVuZHBvaW50IHBpbGxzLlxuLy8gQXJyYXlzLW9mLW9uZSBsaWtlIG1vZGVscy9yZWdpb25zL2luZXF1YWxpdGllcywgc28gc3lzdGVtcyBzdGF5IGFkZGl0aXZlLlxuLy8gKHBsb3RfZnVuY3Rpb24ncyBkb21haW5zW10gcmVtYWlucyBzY29yZWQgZm9yIGFscmVhZHktcHVibGlzaGVkIHBhZ2VzLCBidXRcbi8vIGF1dGhvcmluZyBzdGVlcnMgaGVyZSBub3cuKVxuZXhwb3J0IGNvbnN0IFJheUFuc3dlciA9IHoub2JqZWN0KHtcbiAgLy8gVGhlIHJheSdzIGVuZHBvaW50IChzY29yZWQgb24gcG9zaXRpb24gKyBvcGVuL2Nsb3NlZCBzdHlsZSkuXG4gIGZyb206IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgLy8gQW55IHNlY29uZCBwb2ludCBPTiB0aGUgcmF5IFx1MjAxNCBuYW1lcyB0aGUgZGlyZWN0aW9uOyB0aGUgc3R1ZGVudCdzIHRocm91Z2hcbiAgLy8gaGFuZGxlIG1heSBzaXQgYW55d2hlcmUgYWxvbmcgdGhlIGNvcnJlY3QgcmF5LlxuICB0aHJvdWdoOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIGZyb21TdHlsZTogRW5kcG9pbnRTdHlsZS5kZWZhdWx0KCdjbG9zZWQnKSxcbiAgLy8gRW5kcG9pbnQgcG9zaXRpb24gdG9sZXJhbmNlIGluIGdyYXBoIHVuaXRzIChtYXRjaGVzIHRoZSBkb21haW4tZ2xpZGVyXG4gIC8vIGRlZmF1bHQpLiBEaXJlY3Rpb24gaXMgc2NvcmVkIGJ5IHVuaXQtdmVjdG9yIGFsaWdubWVudCBraXQtc2lkZS5cbiAgdG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjI1KSxcbn0pO1xuZXhwb3J0IHR5cGUgUmF5QW5zd2VyID0gei5pbmZlcjx0eXBlb2YgUmF5QW5zd2VyPjtcblxuZXhwb3J0IGNvbnN0IFJheUludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3RfcmF5JyksXG4gIHJheXM6IHouYXJyYXkoUmF5QW5zd2VyKS5taW4oMSksXG59KTtcbmV4cG9ydCB0eXBlIFJheUludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgUmF5SW50ZXJhY3Rpb24+O1xuXG5leHBvcnQgY29uc3QgU2VnbWVudEFuc3dlciA9IHoub2JqZWN0KHtcbiAgZnJvbTogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICB0bzogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICAvLyBbZnJvbS1lbmRwb2ludCBzdHlsZSwgdG8tZW5kcG9pbnQgc3R5bGVdLiBTY29yZWQgb3JkZXItaW5kZXBlbmRlbnRseSBcdTIwMTRcbiAgLy8gdGhlIHN0dWRlbnQgbWF5IGRyYXcgdGhlIHNlZ21lbnQgaW4gZWl0aGVyIGRpcmVjdGlvbi5cbiAgZW5kcG9pbnRzOiB6LnR1cGxlKFtFbmRwb2ludFN0eWxlLCBFbmRwb2ludFN0eWxlXSkuZGVmYXVsdChbJ2Nsb3NlZCcsICdjbG9zZWQnXSksXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4yNSksXG59KTtcbmV4cG9ydCB0eXBlIFNlZ21lbnRBbnN3ZXIgPSB6LmluZmVyPHR5cGVvZiBTZWdtZW50QW5zd2VyPjtcblxuZXhwb3J0IGNvbnN0IFNlZ21lbnRJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X3NlZ21lbnQnKSxcbiAgc2VnbWVudHM6IHouYXJyYXkoU2VnbWVudEFuc3dlcikubWluKDEpLFxufSk7XG5leHBvcnQgdHlwZSBTZWdtZW50SW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBTZWdtZW50SW50ZXJhY3Rpb24+O1xuXG4vLyBUaGUgaW50ZXJhY3Rpb24gdW5pb24uIHBsb3RfcG9pbnQgKyBwbG90X2Z1bmN0aW9uICsgc2hhZGVfcmVnaW9uIGFyZSBncmFkZWQ7XG4vLyBkaXNwbGF5IGlzIHRoZSB1bmdyYWRlZCBzdGF0aWMgZ3JhcGguIE1vcmUgYXJlIGZ1dHVyZSBtZW1iZXJzLiBLZXB0XG4vLyBkaXNjcmltaW5hdGVkIG9uIGB0eXBlYCBzbyB0aGUgd2lyZSBmb3JtYXQgYWx3YXlzIGNhcnJpZXMgaXQgYW5kIGNvbnN1bWVyc1xuLy8gYnJhbmNoIHVuaWZvcm1seS5cbmV4cG9ydCBjb25zdCBHcmFwaEludGVyYWN0aW9uID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFBvaW50SW50ZXJhY3Rpb24sXG4gIEZ1bmN0aW9uSW50ZXJhY3Rpb24sXG4gIFJlZ2lvbkludGVyYWN0aW9uLFxuICBJbmVxdWFsaXR5SW50ZXJhY3Rpb24sXG4gIFJheUludGVyYWN0aW9uLFxuICBTZWdtZW50SW50ZXJhY3Rpb24sXG4gIERpc3BsYXlJbnRlcmFjdGlvbixcbl0pO1xuZXhwb3J0IHR5cGUgR3JhcGhJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIEdyYXBoSW50ZXJhY3Rpb24+O1xuXG4vLyAtLS0tIFRoZSBibG9jayAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQXV0by1udW1iZXJlZCBsaWtlIFByb2JsZW1CbG9jayAvIEZpbGxJbkJsYW5rQmxvY2suIHNraWxscyBmb2xsb3dzIHRoZSBzYW1lXG4vLyBvcHQtaW4gcGF0dGVybiBGaWxsSW5CbGFua0Jsb2NrIGVzdGFibGlzaGVkOyBzb2x1dGlvbiBpcyBzaG93biBwb3N0LWNoZWNrXG4vLyByZWdhcmRsZXNzIG9mIGNvcnJlY3RuZXNzLlxuZXhwb3J0IGNvbnN0IEludGVyYWN0aXZlR3JhcGhCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2ludGVyYWN0aXZlX2dyYXBoJyksXG4gIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC4uLmxhYmVsRmllbGRzLFxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGF4aXNDb25maWc6IEF4aXNDb25maWcsXG4gIGludGVyYWN0aW9uOiBHcmFwaEludGVyYWN0aW9uLFxuICAvLyBXaGVuIHRydWUsIHRoZSBzdHVkZW50IGdldHMgYSBcImNhbm5vdCBiZSBncmFwaGVkIC8gbm8gc29sdXRpb25cIiBjaG9pY2UsIGFuZFxuICAvLyB0aGUgYW5zd2VyIGtleSBtYXkgbWFyayBUSEFUIGFzIHRoZSBjb3JyZWN0IGFuc3dlciAodHJpY2sgcXVlc3Rpb25zKS4gVGhlXG4gIC8vIGZsYWcgbGFuZHMgaGVyZSAoRHJvcCAyKTsgdGhlIHN0dWRlbnQgY29udHJvbCArIG5vLXNvbHV0aW9uIHJlc3BvbnNlIHJpZGUgdGhlXG4gIC8vIERyb3AgNCB3aXJlIGJ1bXAuXG4gIGFsbG93Tm9Tb2x1dGlvbjogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIFRyaWNrIHF1ZXN0aW9uczogd2hlbiB0cnVlIChyZXF1aXJlcyBhbGxvd05vU29sdXRpb24pLCBcIm5vIHNvbHV0aW9uXCIgSVMgdGhlXG4gIC8vIGNvcnJlY3QgYW5zd2VyIGFuZCB0aGUgZHJhd24gYW5zd2VyIGtleSBpcyBhIGRlY295LiBBIHN0dWRlbnQgd2hvIHNlbGVjdHNcbiAgLy8gbm8tc29sdXRpb24gaXMgY29ycmVjdDsgb25lIHdobyBkcmF3cyBhbnl0aGluZyBpcyBub3QuXG4gIG5vU29sdXRpb25Db3JyZWN0OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgLy8gQnVpbHQtaW4gbWlzdGFrZSBjbGFzc2lmaWVycyAoc3dhcHBlZCBjb29yZGluYXRlcywgc3dhcHBlZCBzbG9wZS9pbnRlcmNlcHQsXG4gIC8vIHJpZ2h0LWJvdW5kYXJ5LXdyb25nLXNpZGUsIFx1MjAyNikgc2hvdyBhIHRhcmdldGVkIG51ZGdlIGluc3RlYWQgb2YgdGhlIGdlbmVyaWNcbiAgLy8gXCJOb3QgcXVpdGVcIiBhZnRlciBhIGNoZWNrLiBEZWZhdWx0IE9OOyBhIHRlYWNoZXIgY2FuIHN3aXRjaCB0aGVtIG9mZi4gVGhlXG4gIC8vIGNsYXNzaWZpZXIgY2F0YWxvZ3VlICsgbWVzc2FnZXMgbGl2ZSBraXQtc2lkZSAoZ3JhcGgtc2NvcmUudHMpIFx1MjAxNCB0aGlzIGZsYWdcbiAgLy8gb25seSBnYXRlcyB0aGVtLlxuICBidWlsdGluRmVlZGJhY2s6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gIC8vIEF1dGhvcmVkIGFudGljaXBhdGVkIG1pc3Rha2VzIFx1MjAxNCB0aGUgZ3JhcGggdHdpbiBvZiBCbGFua1Rva2VuLm1pc3Rha2VGZWVkYmFjay5cbiAgLy8gYG1hdGNoYCBpcyBhIGZyZWVmb3JtIGdyYXBoIGFuc3dlciBpbiB0aGUgU0FNRSBzeW50YXggdGhlIGF1dGhvcmluZyBmb3JtdWxhXG4gIC8vIGZpZWxkIGFjY2VwdHMgKFwiKDQsIDMpXCIsIFwieSA9IHggKyAyXCIsIFwieSA8IDJ4ICsgMVwiKTsgdGhlIGtpdCBwYXJzZXMgaXQgd2l0aFxuICAvLyB0aGUgc2FtZSBwYXJzZXIgYW5kIGNvbXBhcmVzIGFnYWluc3QgdGhlIHN0dWRlbnQncyBhbnN3ZXIgd2l0aCB0aGUgc2FtZVxuICAvLyB0b2xlcmFuY2VzIGFzIHNjb3JpbmcuIEZpcnN0IG1hdGNoIHdpbnMsIGFuZCBhbiBhdXRob3JlZCBtYXRjaCBiZWF0cyBhXG4gIC8vIGJ1aWx0LWluIGNsYXNzaWZpZXIuIGBmZWVkYmFja2AgaXMgcmljaCBpbmxpbmUgY29udGVudCwgc2hvd24gKHBvc3QtY2hlY2tcbiAgLy8gb25seSkgaW4gdGhlIGJsb2NrJ3MgZmVlZGJhY2sgbGluZS5cbiAgLy8gYG1pc2NvbmNlcHRpb25JZGAgYmluZHMgdGhlIGVudHJ5IHRvIGEgbmFtZWQgbWlzY29uY2VwdGlvbiAob3BhcXVlXG4gIC8vIGBtaXMuKmAgdGFnKSwgc2FtZSBjb250cmFjdCBhcyBCbGFua1Rva2VuLm1pc3Rha2VGZWVkYmFjay5cbiAgbWlzdGFrZUZlZWRiYWNrOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICBtYXRjaDogei5zdHJpbmcoKSxcbiAgICBmZWVkYmFjazogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgICBtaXNjb25jZXB0aW9uSWQ6IE1pc2NvbmNlcHRpb25JZC5vcHRpb25hbCgpLFxuICB9KSkuZGVmYXVsdChbXSksXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgLy8gVmFyaWFibGUgYmxvY2sgc2l6aW5nOiBvcHRpb25hbCB3aWR0aCBmcmFjdGlvbiArIGFsaWdubWVudCAoc2l6aW5nLnRzKS5cbiAgLy8gQXV0aG9yLXNldCBkaXNwbGF5IGZvb3RwcmludCBmb3IgdGhlIGZpZ3VyZTsgcmVuZGVyZXIgaG9ub3JzIGl0IHZpYSB0aGVcbiAgLy8gc2hhcmVkIC5ibG9jay1zaXplZCBwYXRoLiBBZGRpdGl2ZS9vcHRpb25hbCBcdTIwMTQgbm8gc2NoZW1hVmVyc2lvbiBidW1wLlxuICAuLi5zaXppbmdGaWVsZHMsXG59KTtcbmV4cG9ydCB0eXBlIEludGVyYWN0aXZlR3JhcGhCbG9jayA9IHouaW5mZXI8dHlwZW9mIEludGVyYWN0aXZlR3JhcGhCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlLCBNaXNjb25jZXB0aW9uSWQgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5pbXBvcnQgeyBBeGlzQ29uZmlnLCBEcmF3YWJsZSB9IGZyb20gJy4vaW50ZXJhY3RpdmUtZ3JhcGguanMnO1xuXG4vLyBNdWx0aXBsZS1jaG9pY2UgcXVlc3Rpb24gYmxvY2suIE9uZSBwcm9tcHQsIDIrIGNob2ljZXMsIHJhZGlvIChzaW5nbGUpIG9yXG4vLyBjaGVja2JveCAoXCJzZWxlY3QgYWxsIHRoYXQgYXBwbHlcIikgdmlhIG11bHRpU2VsZWN0LiBTY29yZWQgYWxsLW9yLW5vdGhpbmc6XG4vLyB0aGUgc2VsZWN0ZWQgc2V0IG11c3QgZXF1YWwgdGhlIGNvcnJlY3Qgc2V0IChwZXItY2hvaWNlIHBhcnRpYWwgY3JlZGl0LCBpZlxuLy8gZXZlciB3YW50ZWQsIGlzIGEgZnV0dXJlIGFkZGl0aXZlIGZsYWcpLlxuLy9cbi8vIENob2ljZSBjb250ZW50IGlzIHJpY2ggaW5saW5lIChmb3JtYXR0ZWQgdGV4dCArIGlubGluZSBtYXRoKSBcdTIwMTQgdGhlIHNhbWVcbi8vIGFscGhhYmV0IGFzIHByb2JsZW0gcHJvc2UsIHNvIG1hdGggYW5zd2VyIGNob2ljZXMgcmVuZGVyIHByb3Blcmx5LiBSaWNoZXJcbi8vIGNob2ljZXMgYXJlIEFERElUSVZFIEZJRUxEUyBvbiBNdWx0aXBsZUNob2ljZU9wdGlvbiwgbm90IGEgdW5pb24gcmV3b3JrIFx1MjAxNFxuLy8gZGVjaWRlZCBhdCBkZXNpZ24gdGltZSwgZXhlcmNpc2VkIDIwMjYtMDctMTAgd2hlbiB0aGUgb3B0aW9uYWwgYGltYWdlYCBhbmRcbi8vIGBncmFwaGAgZmlndXJlcyBsYW5kZWQgd2l0aG91dCBhIHNjaGVtYVZlcnNpb24gYnVtcC5cbi8vXG4vLyBQZXItY2hvaWNlIGBmZWVkYmFja2AgaXMgdGhlIE1DIGFuYWxvZ3VlIG9mIGEgYmxhbmsncyBtaXN0YWtlRmVlZGJhY2s6XG4vLyBkaXN0cmFjdG9ycyBhcmUgdXN1YWxseSBhdXRob3JlZCBCRUNBVVNFIHRoZXkncmUgYW50aWNpcGF0ZWQgbWlzdGFrZXMsIHNvXG4vLyBlYWNoIGNob2ljZSBjYW4gY2FycnkgYW4gZXhwbGFuYXRpb24gc2hvd24gcG9zdC1jaGVjayB3aGVuIGl0IHdhcyBzZWxlY3RlZC5cbi8vXG4vLyBCbG9jay1sZXZlbCBmaWVsZHMgbWlycm9yIEZpbGxJbkJsYW5rQmxvY2sgZm9yIHBhcml0eSAoc29sdXRpb24sIHNraWxscyxcbi8vIHdvcmtTcGFjZSkgXHUyMDE0IG9uZSBwcm9ibGVtIGNocm9tZSwgb25lIHJ1bnRpbWUgdHJlYXRtZW50LCBvbmUgZGFzaGJvYXJkIHJvd1xuLy8gc2hhcGUuXG4vL1xuLy8gRGVsaWJlcmF0ZWx5IE5PVCBzY2hlbWEtZW5mb3JjZWQ6IFwiYXQgbGVhc3Qgb25lIGNob2ljZSBpcyBtYXJrZWQgY29ycmVjdC5cIlxuLy8gQSBtaWQtZWRpdCBkcmFmdCAodGVhY2hlciBoYXNuJ3QgcGlja2VkIHRoZSByaWdodCBhbnN3ZXIgeWV0KSBtdXN0IHN0aWxsXG4vLyBhdXRvc2F2ZTsgdGhlIGVkaXRvciBzdXJmYWNlcyB0aGUgd2FybmluZyBpbnN0ZWFkLiBBIHplcm8tY29ycmVjdCBibG9jayBpc1xuLy8gd2VsbC1kZWZpbmVkIGF0IHJ1bnRpbWUgKG11bHRpLXNlbGVjdDogc2VsZWN0aW5nIG5vdGhpbmcgaXMuLi4gc3RpbGwgYW5cbi8vIG9taXNzaW9uOyBub3RoaW5nIHNjb3JlcyBjb3JyZWN0KSBcdTIwMTQgd3JvbmcgYXV0aG9yaW5nLCBub3QgYSBjcmFzaC5cblxuLy8gT3B0aW9uYWwgaWxsdXN0cmF0aXZlIGltYWdlIG9uIGEgY2hvaWNlIChcIndoaWNoIGRpYWdyYW0gc2hvd3NcdTIwMjZcIikuIE1pcnJvcnNcbi8vIERlZmluaXRpb25JbWFnZSAvIFBoYXNlLTEgSW1hZ2VCbG9jazogVVJMLW9ubHksIG5vIHVwbG9hZCBwaXBlbGluZTsgYWx0XG4vLyByZXF1aXJlZCBidXQgZGVmYXVsdGluZyB0byAnJyBmb3IgZGVjb3JhdGl2ZSBmaWd1cmVzIChlZGl0b3Igd2FybnMpLlxuZXhwb3J0IGNvbnN0IENob2ljZUltYWdlID0gei5vYmplY3Qoe1xuICBzcmM6IHouc3RyaW5nKCkudXJsKCksXG4gIGFsdDogei5zdHJpbmcoKS5kZWZhdWx0KCcnKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ2hvaWNlSW1hZ2UgPSB6LmluZmVyPHR5cGVvZiBDaG9pY2VJbWFnZT47XG5cbi8vIE9wdGlvbmFsIHN0YXRpYyBncmFwaCBvbiBhIGNob2ljZSAoXCJ3aGljaCBncmFwaCBzaG93c1x1MjAyNlwiKS4gUmV1c2VzIHRoZVxuLy8gaW50ZXJhY3RpdmUtZ3JhcGggdm9jYWJ1bGFyeSAoQXhpc0NvbmZpZyArIGRpc3BsYXkgRHJhd2FibGVzKSBidXQgaXNcbi8vIGRyYXduIGFzIGlubGluZSBTVkcgYnkgZ3JhcGgta2l0J3Mga2l0LWZyZWUgYHN0YXRpYy1zdmdgIGVuZ2luZSBcdTIwMTQgbmV2ZXIgdGhlXG4vLyBpbnRlcmFjdGl2ZSBraXQuIFRoZSB2aWV3ZXIgcmVuZGVycyBpdCBpbiBgYmxvY2tzL0Nob2ljZUZpZ3VyZS50c3hgLCB3aGljaFxuLy8gaW1wb3J0cyB0aGF0IGVuZ2luZSBMQVpJTFkgKG11bHRpcGxlX2Nob2ljZSBpcyBhbiBlYWdlciBiaW5kaW5nLCBzbyBhIHN0YXRpY1xuLy8gaW1wb3J0IHdvdWxkIHB1dCB0aGUgZW5naW5lIGluIHRoZSBzdHVkZW50IHNoZWxsKS4gQ29uc2VxdWVuY2U6IGBleHByZXNzaW9uYFxuLy8gZHJhd2FibGVzIG5lZWQgdGhlIGtpdCdzIHBhcnNlciBhbmQgYXJlIE5PVCBkcmF3bjsgdGhlIGVkaXRvciBkb2Vzbid0IG9mZmVyXG4vLyB0aGVtIGhlcmUuICooVW50aWwgMjAyNi0wOC0yMiB0aGlzIHNhaWQgXCJ0aGUgcmVuZGVyZXIncyBncmFwaC1zdmcgZW5naW5lXCIgXHUyMDE0XG4vLyBhIHBhY2thZ2UgZGVsZXRlZCBhdCBTOSBEcm9wIDQsIHdoaWNoIGlzIHdoeSBub3RoaW5nIHJlbmRlcmVkIHRoZXNlIGZvclxuLy8gZWlnaHQgZGF5cyB3aGlsZSB0aGUgZmllbGQsIHRoZSBlZGl0b3IgY29udHJvbCBhbmQgdGhlIGltcG9ydGVyIGFsbCBsaXZlZFxuLy8gb24uIFNlZSBkb2NzL2Rlc2lnbi9jaG9pY2UtZmlndXJlcy1hbmQtbmVzdGVkLWxpc3RzLm1kLikqXG5leHBvcnQgY29uc3QgQ2hvaWNlR3JhcGggPSB6Lm9iamVjdCh7XG4gIGF4aXM6IEF4aXNDb25maWcsXG4gIGRyYXdhYmxlczogei5hcnJheShEcmF3YWJsZSkuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCB0eXBlIENob2ljZUdyYXBoID0gei5pbmZlcjx0eXBlb2YgQ2hvaWNlR3JhcGg+O1xuXG5leHBvcnQgY29uc3QgTXVsdGlwbGVDaG9pY2VPcHRpb24gPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgLy8gUmljaCBpbmxpbmUgY29udGVudCAoZm9ybWF0dGVkIHRleHQgKyBpbmxpbmUgbWF0aCkuIE5vbi1lbXB0eSBpcyBhblxuICAvLyBlZGl0b3IgY29uY2Vybiwgbm90IGEgc2NoZW1hIG9uZSAobWlkLWVkaXQgZHJhZnRzIG11c3Qgc2F2ZSkuXG4gIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAvLyBPcHRpb25hbCBwZXItY2hvaWNlIGV4cGxhbmF0aW9uLCByZXZlYWxlZCBwb3N0LWNoZWNrIHdoZW4gdGhpcyBjaG9pY2Ugd2FzXG4gIC8vIHNlbGVjdGVkLiBSaWNoIGlubGluZSBjb250ZW50LCBsaWtlIGJsYW5rIG1pc3Rha2VGZWVkYmFjayBlbnRyaWVzLlxuICBmZWVkYmFjazogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICAvLyBCaW5kcyBhIGRpc3RyYWN0b3IgdG8gYSBuYW1lZCBtaXNjb25jZXB0aW9uIChvcGFxdWUgYG1pcy4qYCB0YWc7IHRoZVxuICAvLyB0YXhvbm9teSBsaXZlcyBpbiB0aGUgYXV0aG9yJ3MgY2F0YWxvZ3VlIHByb2plY3QpLiBSZXR1cm5lZCBvbiB0aGUgY2hlY2tcbiAgLy8gdmVyZGljdCB3aGVuIHRoZSBzdHVkZW50IHNlbGVjdHMgdGhpcyBjaG9pY2UgYW5kIGl0IGlzIHdyb25nOyB0aGUgc3RvcmVkXG4gIC8vIHZlcmRpY3RzIHJvdyBjYXJyaWVzIHRoZSBhZ2dyZWdhdGUgc2lnbmFsLiBNZWFuaW5nbGVzcyBvbiBhIGNvcnJlY3RcbiAgLy8gY2hvaWNlIFx1MjAxNCB0aGUgZ3JhZGVyIG5ldmVyIGVtaXRzIGl0IGZvciBvbmUuXG4gIG1pc2NvbmNlcHRpb25JZDogTWlzY29uY2VwdGlvbklkLm9wdGlvbmFsKCksXG4gIC8vIE9wdGlvbmFsIGZpZ3VyZSBiZWxvdyB0aGUgY2hvaWNlIHRleHQgXHUyMDE0IHRoZSBhZGRpdGl2ZSB3aWRlbmluZyB0aGUgaGVhZGVyXG4gIC8vIGNvbW1lbnQgcmVzZXJ2ZWQuIEJvdGggbWF5IHRlY2huaWNhbGx5IGNvZXhpc3QgKGltYWdlIHJlbmRlcnMgZmlyc3QpO1xuICAvLyB0aGUgZWRpdG9yIFVJIHRyZWF0cyB0aGVtIGFzIGEgc2luZ2xlIGZpZ3VyZSBzbG90LlxuICBpbWFnZTogQ2hvaWNlSW1hZ2Uub3B0aW9uYWwoKSxcbiAgZ3JhcGg6IENob2ljZUdyYXBoLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE11bHRpcGxlQ2hvaWNlT3B0aW9uID0gei5pbmZlcjx0eXBlb2YgTXVsdGlwbGVDaG9pY2VPcHRpb24+O1xuXG5leHBvcnQgY29uc3QgTXVsdGlwbGVDaG9pY2VCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ211bHRpcGxlX2Nob2ljZScpLFxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAuLi5sYWJlbEZpZWxkcyxcbiAgLy8gVGhlIHF1ZXN0aW9uIHByb3NlIChyaWNoIGlubGluZSBjb250ZW50LCBsaWtlIGEgcHJvYmxlbSBzdGF0ZW1lbnQpLlxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGNob2ljZXM6IHouYXJyYXkoTXVsdGlwbGVDaG9pY2VPcHRpb24pLm1pbigyKSxcbiAgLy8gZmFsc2UgPSBzaW5nbGUgYW5zd2VyIChyYWRpb3MsIGV4YWN0bHkgb25lIHNlbGVjdGFibGUpOyB0cnVlID0gXCJzZWxlY3RcbiAgLy8gYWxsIHRoYXQgYXBwbHlcIiAoY2hlY2tib3hlcykuIFNjb3JpbmcgaXMgc2V0IGVxdWFsaXR5IGVpdGhlciB3YXkuXG4gIG11bHRpU2VsZWN0OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgLy8gS2VlcCB0aGUgYXV0aG9yZWQgY2hvaWNlIG9yZGVyIG9uIHBhcGVyIChTNS41IEQxN0EpLiBQcmludGVkIFZFUlNJT05TXG4gIC8vIHNodWZmbGUgY2hvaWNlcyB0byBkaXNjb3VyYWdlIGNvcHlpbmcsIHdoaWNoIGlzIHdyb25nIGZvciBhIHF1ZXN0aW9uIHdob3NlXG4gIC8vIG9yZGVyIGNhcnJpZXMgbWVhbmluZyBcdTIwMTQgXCJhbGwgb2YgdGhlIGFib3ZlXCIgaGFzIHRvIHN0YXkgbGFzdCwgYW5kIFwiYm90aCBBXG4gIC8vIGFuZCBCXCIgbmFtZXMgcG9zaXRpb25zIG91dHJpZ2h0LiBPcHRpb25hbCB3aXRoIG5vIGRlZmF1bHQgc28gYSBkb2N1bWVudFxuICAvLyB3cml0dGVuIGJlZm9yZSB0aGlzIHJlLXNlcmlhbGl6ZXMgYnl0ZS1pZGVudGljYWxseTsgYWJzZW50IG1lYW5zIHNodWZmbGUsXG4gIC8vIHdoaWNoIGlzIHRoZSByaWdodCBkZWZhdWx0IGZvciB0aGUgb3ZlcndoZWxtaW5nIG1ham9yaXR5IG9mIHF1ZXN0aW9ucy5cbiAgbG9ja0Nob2ljZU9yZGVyOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICAvLyBXb3JrZWQgZXhwbGFuYXRpb24gZm9yIHRoZSB3aG9sZSBwcm9ibGVtLCByZXZlYWxlZCBwb3N0LWNoZWNrIHJlZ2FyZGxlc3NcbiAgLy8gb2YgY29ycmVjdG5lc3MgKHNhbWUgY29udHJhY3QgYXMgRmlsbEluQmxhbmtCbG9jay5zb2x1dGlvbikuXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgLy8gUGVyLXByb2JsZW0gcHJpbnQgd29yay1zcGFjZSBvdmVycmlkZSAocmVtKTsgYWJzZW50ID0gaW5oZXJpdCB0aGVcbiAgLy8gYWN0aXZpdHktbGV2ZWwgZGVmYXVsdCAoc2VlIEZpbGxJbkJsYW5rQmxvY2sud29ya1NwYWNlIGZvciB0aGUgQ1NTXG4gIC8vIGN1c3RvbS1wcm9wZXJ0eSByZWFzb25pbmcpLlxuICB3b3JrU3BhY2U6IHoubnVtYmVyKCkubWluKDApLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE11bHRpcGxlQ2hvaWNlQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBNdWx0aXBsZUNob2ljZUJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5pbXBvcnQgeyBDaG9pY2VJbWFnZSwgQ2hvaWNlR3JhcGggfSBmcm9tICcuL211bHRpcGxlLWNob2ljZS5qcyc7XG5cbi8vIE1hdGNoaW5nIHF1ZXN0aW9uIGJsb2NrLiBUd28gY29sdW1uczogbGVmdCBcIml0ZW1zXCIgKHN0ZW1zLCBkb2N1bWVudCBvcmRlcilcbi8vIGFuZCByaWdodCBcInRhcmdldHNcIiAobGV0dGVyZWQgQSwgQiwgQ1x1MjAyNiwgc2h1ZmZsZWQgYXQgcHVibGlzaCB0aW1lKS4gVGhlXG4vLyBzdHVkZW50IGRyYWdzIGEgdGFyZ2V0IGNhcmQgb250byBhbiBpdGVtOyB0aGUgY2FyZCBkb2NrcyBuZXh0IHRvIHRoZSBzdGVtLlxuLy8gRGVzaWduOiBkb2NzL2Rlc2lnbi9tYXRjaGluZy1vcmRlcmluZy1xdWVzdGlvbnMubWQgKGRlY2lkZWQgMjAyNi0wNy0xMCkuXG4vL1xuLy8gRGlzdHJhY3RvcnM6IHRhcmdldHMgbWF5IGV4Y2VlZCBpdGVtcyBcdTIwMTQgYW4gdW5tYXRjaGVkIHRhcmdldCBpcyBzaW1wbHlcbi8vIHJlZmVyZW5jZWQgYnkgbm8ga2V5IGVudHJ5LiBTZXZlcmFsIGl0ZW1zIG1heSBzaGFyZSBvbmUgdGFyZ2V0XG4vLyAoXCJjYXRlZ29yaXphdGlvbi1saXRlXCI6IGNsYXNzaWZ5IGVhY2ggZXhwcmVzc2lvbiBhcyBsaW5lYXIvcXVhZHJhdGljL1xuLy8gZXhwb25lbnRpYWwpIFx1MjAxNCBhbHdheXMgYWxsb3dlZDsgdGhlIGFsbG93VGFyZ2V0UmV1c2UgZ2F0ZSB3YXMgZGVsZXRlZFxuLy8gMjAyNi0wOC0yNCBhZnRlciBzaGlwcGluZyBpbmVydCBpbiBib3RoIGRpcmVjdGlvbnMuXG4vL1xuLy8gU2NvcmVkIFBFUiBQQUlSIChlYXJuZWQvdG90YWwgXHUyMDE0IHRoZSBmcmFjdGlvbmFsIENoZWNrcG9pbnRSZXN1bHQgcHJlY2VkZW50XG4vLyBmcm9tIHdpcmUgdjQpOiBlYWNoIGl0ZW0gaXMgb25lIHBvaW50LCBjb3JyZWN0IHdoZW4gdGhlIHN0dWRlbnQncyB0YXJnZXRcbi8vIGZvciBpdCBlcXVhbHMga2V5W2l0ZW1JZF0uIEJsb2NrIGBjb3JyZWN0YCA9IGV2ZXJ5IHBhaXIgcmlnaHQuIE5vIGJpcGFydGl0ZVxuLy8gbWFjaGluZXJ5IFx1MjAxNCB0aGUgc3R1ZGVudCdzIHBhaXJpbmcgSVMgdGhlIGFzc2lnbm1lbnQgKGNvbnRyYXN0IGJsYW5rIGdyb3Vwcyxcbi8vIHdoZXJlIHR5cGVkIHZhbHVlcyBtdXN0IGJlIG1hdGNoZWQgdG8gc2xvdHMpLlxuLy9cbi8vIEZpZ3VyZXM6IGl0ZW1zIGFuZCB0YXJnZXRzIGJvdGggdGFrZSB0aGUgb3B0aW9uYWwgaW1hZ2UvZ3JhcGggZmlndXJlIHNsb3Rcbi8vIHNoaXBwZWQgZm9yIE1DIGNob2ljZXMgKENob2ljZUltYWdlL0Nob2ljZUdyYXBoIFx1MjAxNCBVUkwtb25seSBpbWFnZTsgc3RhdGljXG4vLyBncmFwaCB2aWEgdGhlIHJlbmRlcmVyJ3Mga2l0LWZyZWUgU1ZHIGVuZ2luZSwgc28gYGV4cHJlc3Npb25gIGRyYXdhYmxlcyBhcmVcbi8vIGV4Y2x1ZGVkIHRoZXJlIGFuZCB0aGUgZWRpdG9yIGRvZXNuJ3Qgb2ZmZXIgdGhlbSkuIFwiTWF0Y2ggdGhlIGdyYXBoIHRvIGl0c1xuLy8gZXF1YXRpb25cIiBpcyB0aGUgbWFycXVlZSBjYXNlLlxuLy9cbi8vIERlbGliZXJhdGVseSBOT1Qgc2NoZW1hLWVuZm9yY2VkOiBcImtleSBjb3ZlcnMgZXZlcnkgaXRlbVwiIC8gXCJrZXkgcmVmZXJlbmNlc1xuLy8gcmVhbCB0YXJnZXRzLlwiIEEgbWlkLWVkaXQgZHJhZnQgKHRlYWNoZXIgc3RpbGwgYXNzaWduaW5nIGFuc3dlcnMpIG11c3Rcbi8vIGF1dG9zYXZlOyB0aGUgZWRpdG9yIHN1cmZhY2VzIHRoZSB3YXJuaW5nIGluc3RlYWQgKHRoZSBNQyB6ZXJvLWNvcnJlY3Rcbi8vIHByZWNlZGVudCkuIFRoZSBydW50aW1lIHRyZWF0cyBhbiBpdGVtIG1pc3NpbmcgZnJvbSB0aGUga2V5IGFzIG5ldmVyXG4vLyBjb3JyZWN0IFx1MjAxNCB3cm9uZyBhdXRob3JpbmcsIG5vdCBhIGNyYXNoLlxuXG5leHBvcnQgY29uc3QgTWF0Y2hpbmdJdGVtID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIC8vIFJpY2ggaW5saW5lIGNvbnRlbnQgKGZvcm1hdHRlZCB0ZXh0ICsgaW5saW5lIG1hdGgpLiBOb24tZW1wdHkgaXMgYW5cbiAgLy8gZWRpdG9yIGNvbmNlcm4sIG5vdCBhIHNjaGVtYSBvbmUgKG1pZC1lZGl0IGRyYWZ0cyBtdXN0IHNhdmUpLlxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxuICAvLyBPcHRpb25hbCBmaWd1cmUgYmVsb3cgdGhlIGl0ZW0gdGV4dCAoc2FtZSBzaW5nbGUtZmlndXJlLXNsb3QgdHJlYXRtZW50XG4gIC8vIGFzIE1DIGNob2ljZXM7IGltYWdlIHJlbmRlcnMgZmlyc3QgaWYgYm90aCBhcmUgc29tZWhvdyBzZXQpLlxuICBpbWFnZTogQ2hvaWNlSW1hZ2Uub3B0aW9uYWwoKSxcbiAgZ3JhcGg6IENob2ljZUdyYXBoLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE1hdGNoaW5nSXRlbSA9IHouaW5mZXI8dHlwZW9mIE1hdGNoaW5nSXRlbT47XG5cbmV4cG9ydCBjb25zdCBNYXRjaGluZ1RhcmdldCA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxuICBpbWFnZTogQ2hvaWNlSW1hZ2Uub3B0aW9uYWwoKSxcbiAgZ3JhcGg6IENob2ljZUdyYXBoLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE1hdGNoaW5nVGFyZ2V0ID0gei5pbmZlcjx0eXBlb2YgTWF0Y2hpbmdUYXJnZXQ+O1xuXG5leHBvcnQgY29uc3QgTWF0Y2hpbmdCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ21hdGNoaW5nJyksXG4gIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC4uLmxhYmVsRmllbGRzLFxuICAvLyBUaGUgcXVlc3Rpb24gcHJvc2UgKHJpY2ggaW5saW5lIGNvbnRlbnQsIGxpa2UgYSBwcm9ibGVtIHN0YXRlbWVudCkuXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgLy8gTGVmdCBjb2x1bW4sIGRvY3VtZW50IG9yZGVyLlxuICBpdGVtczogei5hcnJheShNYXRjaGluZ0l0ZW0pLm1pbigyKSxcbiAgLy8gUmlnaHQgY29sdW1uOyBtYXkgZXhjZWVkIGl0ZW1zIChleHRyYSB0YXJnZXRzIGFyZSBkaXN0cmFjdG9ycykuIExldHRlcnNcbiAgLy8gYXJlIGFzc2lnbmVkIGJ5IHBvc2l0aW9uIEFGVEVSIHRoZSBwdWJsaXNoLXRpbWUgc2h1ZmZsZSwgbmV2ZXIgYXV0aG9yZWQuXG4gIHRhcmdldHM6IHouYXJyYXkoTWF0Y2hpbmdUYXJnZXQpLm1pbigyKSxcbiAgLy8gVGhlIGNvcnJlY3QgcGFpcmluZzogaXRlbSBpZCBcdTIxOTIgdGFyZ2V0IGlkLiBQYXJ0aWFsIGR1cmluZyBhdXRob3JpbmcgKHNlZVxuICAvLyBoZWFkZXIpOyBtYW55LXRvLW9uZSBpcyBhbGxvd2VkICh0aGUgZ3JhZGVyJ3MgaXRlbVx1MjE5MnRhcmdldCBrZXkgc2NvcmVzIGl0XG4gIC8vIG5hdHVyYWxseSwgYW5kIHRoZSB2aWV3ZXIgbmV2ZXIgcmVzdHJpY3RlZCBkb2NraW5nIGEgdGFyZ2V0IHR3aWNlKS5cbiAga2V5OiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgei5zdHJpbmcoKS51dWlkKCkpLFxuICAvLyBNQy1wYXJpdHkgcHJvYmxlbSBjaHJvbWUgKG9uZSBwcm9ibGVtIHNoYXBlLCBvbmUgZGFzaGJvYXJkIHJvdyBzaGFwZSkuXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgd29ya1NwYWNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNYXRjaGluZ0Jsb2NrID0gei5pbmZlcjx0eXBlb2YgTWF0Y2hpbmdCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuXG4vLyBPcmRlcmluZyAvIHNlcXVlbmNpbmcgcXVlc3Rpb24gYmxvY2suIFRoZSBBVVRIT1JFRCBvcmRlciBvZiBgaXRlbXNgIElTIHRoZVxuLy8gY29ycmVjdCBvcmRlcjsgc3R1ZGVudHMgc2VlIHRoZSBsaXN0IHNodWZmbGVkIGF0IHB1Ymxpc2ggdGltZSBhbmQgZHJhZyBpdFxuLy8gYmFjayBpbnRvIHNlcXVlbmNlLiBEZXNpZ246IGRvY3MvZGVzaWduL21hdGNoaW5nLW9yZGVyaW5nLXF1ZXN0aW9ucy5tZFxuLy8gKGRlY2lkZWQgMjAyNi0wNy0xMCkuXG4vL1xuLy8gU2NvcmVkIEFMTC1PUi1OT1RISU5HIG9uIGV4YWN0IHNlcXVlbmNlIGVxdWFsaXR5IChhdXRob3IgY2FsbDogcGFydGlhbC1cbi8vIGNyZWRpdCBtZXRyaWNzIGZvciBvcmRlcmluZ3MgYXJlIGVpdGhlciBtaXNsZWFkaW5nIFx1MjAxNCBwb3NpdGlvbiBtYXRjaGVzXG4vLyBwdW5pc2ggYW4gb2ZmLWJ5LW9uZSBzaGlmdCBhYnN1cmRseSBcdTIwMTQgb3Igb3BhcXVlIHRvIHRlYWNoZXJzOyByZXZpc2l0IG9ubHlcbi8vIG9uIG9ic2VydmVkIGRlbWFuZCkuIEludGVyY2hhbmdlYWJsZSBhZGphY2VudCBpdGVtczogWUFHTkksIGFkZGl0aXZlIGxhdGVyLlxuLy9cbi8vIEFuIHVudG91Y2hlZCBsaXN0IGlzIGFuIE9NSVNTSU9OLCBub3QgYW4gYW5zd2VyOiBhIHNodWZmbGVkIGxpc3QgaXMgYWx3YXlzXG4vLyAqc29tZSogc2VxdWVuY2UsIHNvIHRoZSBydW50aW1lIG9ubHkgcmVjb3JkcyBhIHJlc3BvbnNlIG9uY2UgdGhlIHN0dWRlbnRcbi8vIGhhcyBtb3ZlZCBzb21ldGhpbmcuXG4vL1xuLy8gTm8gZmlndXJlIHNsb3Qgb24gaXRlbXMgaW4gdjEgKG5vIGNsZWFyIHVzZSBjYXNlIHlldDsgYWRkaXRpdmUgbGF0ZXIgXHUyMDE0XG4vLyB0aGUgTUMvbWF0Y2hpbmcgQ2hvaWNlSW1hZ2UvQ2hvaWNlR3JhcGggcGF0dGVybiBpcyBzaXR0aW5nIHRoZXJlKS5cblxuZXhwb3J0IGNvbnN0IE9yZGVyaW5nSXRlbSA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAvLyBSaWNoIGlubGluZSBjb250ZW50IChmb3JtYXR0ZWQgdGV4dCArIGlubGluZSBtYXRoKS4gTm9uLWVtcHR5IGlzIGFuXG4gIC8vIGVkaXRvciBjb25jZXJuLCBub3QgYSBzY2hlbWEgb25lIChtaWQtZWRpdCBkcmFmdHMgbXVzdCBzYXZlKS5cbiAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbn0pO1xuZXhwb3J0IHR5cGUgT3JkZXJpbmdJdGVtID0gei5pbmZlcjx0eXBlb2YgT3JkZXJpbmdJdGVtPjtcblxuZXhwb3J0IGNvbnN0IE9yZGVyaW5nQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdvcmRlcmluZycpLFxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAuLi5sYWJlbEZpZWxkcyxcbiAgLy8gVGhlIHF1ZXN0aW9uIHByb3NlIChyaWNoIGlubGluZSBjb250ZW50LCBsaWtlIGEgcHJvYmxlbSBzdGF0ZW1lbnQpLlxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIC8vIEF1dGhvcmVkIG9yZGVyID0gY29ycmVjdCBvcmRlci4gVGhlIHJlbmRlcmVyIHNodWZmbGVzIGRldGVybWluaXN0aWNhbGx5XG4gIC8vIChzZWVkZWQgYnkgYmxvY2sgaWQpIGZvciB0aGUgc3R1ZGVudC1mYWNpbmcgYXJyYW5nZW1lbnQuXG4gIGl0ZW1zOiB6LmFycmF5KE9yZGVyaW5nSXRlbSkubWluKDIpLFxuICAvLyBNQy1wYXJpdHkgcHJvYmxlbSBjaHJvbWUgKG9uZSBwcm9ibGVtIHNoYXBlLCBvbmUgZGFzaGJvYXJkIHJvdyBzaGFwZSkuXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgd29ya1NwYWNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBPcmRlcmluZ0Jsb2NrID0gei5pbmZlcjx0eXBlb2YgT3JkZXJpbmdCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuaW1wb3J0IHsgRW5kcG9pbnRTdHlsZSB9IGZyb20gJy4vaW50ZXJhY3RpdmUtZ3JhcGguanMnO1xuaW1wb3J0IHsgc2l6aW5nRmllbGRzIH0gZnJvbSAnLi4vc2l6aW5nLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIG51bWJlci1saW5lLnRzIFx1MjAxNCB0aGUgbnVtYmVyX2xpbmUgYmxvY2sgKDEtRCBncmFkZWQsIEstOCAvIGVhcmx5IGFsZ2VicmEpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIDEtRCBzaWJsaW5nIG9mIGludGVyYWN0aXZlX2dyYXBoLiBUaGUgc3R1ZGVudCdzIGFuc3dlciBpcyBHRU9NRVRSSUMgXHUyMDE0IGFcbi8vIHBvaW50IChvciBzZXZlcmFsKSBwbG90dGVkIG9uIGEgc2luZ2xlIG51bWJlciBsaW5lLCBvciBhbiBpbnRlcnZhbC9yYXkgd2l0aFxuLy8gb3Blbi9jbG9zZWQgZW5kcG9pbnRzIChcImdyYXBoIHggPj0gLTJcIikuIFNhbWUgdGhyZWUgc3RydWN0dXJhbCBjb25zZXF1ZW5jZXNcbi8vIGFzIHRoZSBncmFwaCBibG9jayAoc2VlIGRvY3MvZGVzaWduL251bWJlci1saW5lLWJsb2NrLm1kKTogYSBzdHJ1Y3R1cmVkXG4vLyBhbnN3ZXIgd2l0aCBpdHMgT1dOIHN1Ym1pc3Npb24gbWFwIChudW1iZXJMaW5lUmVzcG9uc2VzLCBub3QgdGhlIGJsYW5rcyBtYXApLFxuLy8gdG9sZXJhbmNlLWJhc2VkIGdlb21ldHJpYyBzY29yaW5nIGRvbmUgYnkgdGhlIGxhenkgZ3JhcGgta2l0IChub3QgdGhlXG4vLyBydW50aW1lJ3Mgc3RyaW5nIHN0cmF0ZWdpZXMpLCBhbmQgYSB3aWRnZXQgdGhhdCByaWRlcyBAYWN0aXZpdHkvZ3JhcGgta2l0LlxuLy9cbi8vIEEgU0VQQVJBVEUgYmxvY2sgZmFtaWx5LCBub3QgYSBHcmFwaEludGVyYWN0aW9uIHZhcmlhbnQgKGF1dGhvciBjYWxsLCBTVEFURVxuLy8gMjAyNi0wNy0xMCk6IG51bWJlciBsaW5lcyBhcmUgMS1EIGFuZCBtdXN0IG5vdCBiZSBmb3JjZWQgdW5kZXIgdGhlIGdyYXBoXG4vLyBibG9jaydzIDItRCBBeGlzQ29uZmlnLiBFbmRwb2ludFN0eWxlIGlzIHNoYXJlZCBmcm9tIGludGVyYWN0aXZlLWdyYXBoLnRzIFx1MjAxNFxuLy8gaXQgd2FzIHJlc2VydmVkIHRoZXJlIFwiZm9yIHRoZSBmdXR1cmUgbnVtYmVyLWxpbmUgZmFtaWx5XCIgZnJvbSBEcm9wIDIuXG4vL1xuLy8gU2xpY2UgMSBzaGlwcyBUV08gaW50ZXJhY3Rpb25zIChwbG90X3BvaW50LCBwbG90X2ludGVydmFsKSwgZGlzY3JpbWluYXRlZCBvblxuLy8gYHR5cGVgIGZyb20gZGF5IG9uZSBzbyBwbG90X3JheSAvIGRpc3BsYXkgc2xvdCBpbiBhZGRpdGl2ZWx5IGxhdGVyLCBleGFjdGx5XG4vLyBob3cgR3JhcGhJbnRlcmFjdGlvbiBncm93cy5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIC0tLS0gTGluZSBjb25maWd1cmF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgMS1EIGFuYWxvZ3VlIG9mIEF4aXNDb25maWcuIExpbmUgdW5pdHMgdGhyb3VnaG91dCBcdTIwMTQgdG9sZXJhbmNlIGFuZCB0aWNrXG4vLyBzdGVwcyBhcmUgaW4gdGhlIHNhbWUgdW5pdHMsIG5ldmVyIHBpeGVscywgc28gYSBwYWdlIHRoYXQgcmUtbGF5cy1vdXQgYXQgYVxuLy8gZGlmZmVyZW50IHdpZHRoIHN0aWxsIHNjb3JlcyBpZGVudGljYWxseS5cbmV4cG9ydCBjb25zdCBOdW1iZXJMaW5lQ29uZmlnID0gei5vYmplY3Qoe1xuICBtaW46IHoubnVtYmVyKCksXG4gIG1heDogei5udW1iZXIoKSxcbiAgLy8gU3BhY2luZyBiZXR3ZWVuIExBQkVMRUQgdGlja3MgKGxpbmUgdW5pdHMpLlxuICB0aWNrU3RlcDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLmRlZmF1bHQoMSksXG4gIC8vIFVubGFiZWxlZCBtaW5vciB0aWNrcyBkcmF3biBiZXR3ZWVuIGVhY2ggcGFpciBvZiBsYWJlbGVkIHRpY2tzICgwID0gbm9uZSkuXG4gIC8vIFZpc3VhbCBvbmx5IFx1MjAxNCBuZXZlciBzY29yZWQuXG4gIG1pbm9yVGlja3NQZXJTdGVwOiB6Lm51bWJlcigpLmludCgpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwKSxcbiAgLy8gV2hlbiB0cnVlLCBhIGRyYWdnZWQgaGFuZGxlIHNuYXBzIHRvIHRoZSBuZWFyZXN0IHRpY2sgKG1pbm9yIGlmIHByZXNlbnQsXG4gIC8vIGVsc2UgdGhlIGxhYmVsZWQgc3RlcCkuIEtleWJvYXJkIG51ZGdlIGFsd2F5cyBtb3ZlcyBieSBvbmUgdGljayByZWdhcmRsZXNzXG4gIC8vIChTaGlmdCA9IGZpbmUsIG9uZS10ZW50aCBvZiBhIHRpY2spLlxuICBzbmFwVG9UaWNrOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxufSk7XG5leHBvcnQgdHlwZSBOdW1iZXJMaW5lQ29uZmlnID0gei5pbmZlcjx0eXBlb2YgTnVtYmVyTGluZUNvbmZpZz47XG5cbi8vIC0tLS0gSW50ZXJhY3Rpb24gdmFyaWFudHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBwbG90X3BvaW50OiB0aGUgc3R1ZGVudCBwbGFjZXMgb25lIG9yIG1vcmUgcG9pbnRzIG9uIHRoZSBsaW5lLiBNdWx0aS1wb2ludFxuLy8gKFwicGxvdCAtMiBhbmQgNVwiKSBpcyBzY29yZWQgY29uc3VtZS1vbmNlLCBhbGwtb3Itbm90aGluZyBcdTIwMTQgZXZlcnkgY29ycmVjdFxuLy8gcG9zaXRpb24gbXVzdCBiZSBtYXRjaGVkIChtaXJyb3JzIHRoZSBncmFwaCBibG9jaydzIE4taGFuZGxlIHBsb3RfcG9pbnQpLlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3RfcG9pbnQnKSxcbiAgLy8gQ29ycmVjdCBwb3NpdGlvbnMgaW4gbGluZSB1bml0cy4gQSBzaW5nbGUgcG9pbnQgaXMgdGhlIGNvbW1vbiBjYXNlLlxuICBjb3JyZWN0UG9pbnRzOiB6LmFycmF5KHoubnVtYmVyKCkpLm1pbigxKSxcbiAgLy8gTWF0Y2ggcmFkaXVzIGluIGxpbmUgdW5pdHMgKGEgcG9pbnQgaXMgY29ycmVjdCB3aXRoaW4gKy8tIHRvbGVyYW5jZSkuXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZVBvaW50SW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgTnVtYmVyTGluZVBvaW50SW50ZXJhY3Rpb25cbj47XG5cbi8vIEFuIGludGVydmFsIG9yIHJheSBvbiB0aGUgbGluZS4gQSBwcmVzZW50IGJvdW5kIGNhcnJpZXMgYW4gb3Blbi9jbG9zZWQgc3R5bGVcbi8vICh0aGUgaW5lcXVhbGl0eSBkaXN0aW5jdGlvbjogeCA+IDMgb3BlbiB2cyB4ID49IDMgY2xvc2VkKS4gQW4gQUJTRU5UIGJvdW5kIGlzXG4vLyB1bmJvdW5kZWQgdGhhdCBkaXJlY3Rpb24gXHUyMDE0IHNvIGEgcmF5IGlzIGp1c3QgYW4gaW50ZXJ2YWwgd2l0aCBvbmUgc2lkZSBvbWl0dGVkXG4vLyAoXCJ4ID49IDNcIiA9IG1pbiAzIGNsb3NlZCwgbm8gbWF4OyBcInggPCA1XCIgPSBtYXggNSBvcGVuLCBubyBtaW4pLiBUaGUgc2hhZGVkXG4vLyByZWdpb24gaXMgdW5hbWJpZ3VvdXMgZnJvbSB3aGljaCBib3VuZHMgYXJlIHByZXNlbnQsIHNvIG5vIHNlcGFyYXRlIHNpZGUgZmxhZ1xuLy8gaXMgbmVlZGVkICh1bmxpa2UgdGhlIDItRCBncmFwaCBpbmVxdWFsaXR5KS4gQXQgbGVhc3Qgb25lIGJvdW5kIG11c3QgYmVcbi8vIHByZXNlbnQgKGEgdHdvLXNpZGVkLXVuYm91bmRlZCBpbnRlcnZhbCBpcyB0aGUgd2hvbGUgbGluZSBcdTIwMTQgbWVhbmluZ2xlc3MpOyB0aGVcbi8vIGZhY3RvcnkgKyBhdXRob3IgVUkgZ3VhcmFudGVlIGl0IGFuZCB0aGUgc2NvcmVyIGFzc3VtZXMgaXQuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUludGVydmFsID0gei5vYmplY3Qoe1xuICBtaW46IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgbWluU3R5bGU6IEVuZHBvaW50U3R5bGUub3B0aW9uYWwoKSxcbiAgbWF4OiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIG1heFN0eWxlOiBFbmRwb2ludFN0eWxlLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVJbnRlcnZhbCA9IHouaW5mZXI8dHlwZW9mIE51bWJlckxpbmVJbnRlcnZhbD47XG5cbmV4cG9ydCBjb25zdCBOdW1iZXJMaW5lSW50ZXJ2YWxJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X2ludGVydmFsJyksXG4gIGNvcnJlY3RJbnRlcnZhbDogTnVtYmVyTGluZUludGVydmFsLFxuICAvLyBNYXRjaCByYWRpdXMgaW4gbGluZSB1bml0cywgYXBwbGllZCB0byBlYWNoIHByZXNlbnQgZW5kcG9pbnQuXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb25cbj47XG5cbi8vIERpc2NyaW1pbmF0ZWQgb24gYHR5cGVgIHNvIGNvbnN1bWVycyBicmFuY2ggdW5pZm9ybWx5IGFuZCB0aGUgd2lyZSBmb3JtYXRcbi8vIGFsd2F5cyBjYXJyaWVzIGl0LiBHcm93aW5nIGEgdmFyaWFudCBpcyBhIG5ldyBtZW1iZXIgaGVyZSArIGEgbmV3IHNjb3JlclxuLy8gYnJhbmNoIGluIHRoZSBraXQgXHUyMDE0IG5vIG90aGVyIGJsb2NrIHRvdWNoZWQuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUludGVyYWN0aW9uID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uLFxuICBOdW1iZXJMaW5lSW50ZXJ2YWxJbnRlcmFjdGlvbixcbl0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZUludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgTnVtYmVyTGluZUludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBUaGUgYmxvY2sgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEF1dG8tbnVtYmVyZWQgbGlrZSB0aGUgb3RoZXIgcXVlc3Rpb24gYmxvY2tzLiBza2lsbHMgKyBzb2x1dGlvbiBmb2xsb3cgdGhlXG4vLyBzYW1lIG9wdC1pbiBwYXR0ZXJucyBGaWxsSW5CbGFua0Jsb2NrIC8gSW50ZXJhY3RpdmVHcmFwaCBlc3RhYmxpc2hlZC5cbi8vIERlbGliZXJhdGVseSBMRUFOIGZvciBzbGljZSAxIChubyBhbGxvd05vU29sdXRpb24gLyBtaXN0YWtlRmVlZGJhY2spIFx1MjAxNFxuLy8gYWxsLW9yLW5vdGhpbmcgc2NvcmluZyAoZGVzaWduIGRlY2lzaW9uIDYpOyB0aG9zZSBmaWVsZHMgYXJlIGFkZGl0aXZlIGxhdGVyXG4vLyBpZiBhc2tlZCBmb3IgKFlBR05JKSwgZXhhY3RseSBhcyB0aGUgZ3JhcGggYmxvY2sgcmVzZXJ2ZWQgdGhlbSBhY3Jvc3MgZHJvcHMuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnbnVtYmVyX2xpbmUnKSxcbiAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLi4ubGFiZWxGaWVsZHMsXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgY29uZmlnOiBOdW1iZXJMaW5lQ29uZmlnLFxuICBpbnRlcmFjdGlvbjogTnVtYmVyTGluZUludGVyYWN0aW9uLFxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIC8vIFZhcmlhYmxlIGJsb2NrIHNpemluZzogb3B0aW9uYWwgd2lkdGggZnJhY3Rpb24gKyBhbGlnbm1lbnQgKHNpemluZy50cykuXG4gIC8vIEFkZGl0aXZlL29wdGlvbmFsIFx1MjAxNCBubyBzY2hlbWFWZXJzaW9uIGJ1bXAuXG4gIC4uLnNpemluZ0ZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgTnVtYmVyTGluZUJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5pbXBvcnQgeyBOdW1iZXJMaW5lQ29uZmlnIH0gZnJvbSAnLi9udW1iZXItbGluZS5qcyc7XG5pbXBvcnQgeyBzaXppbmdGaWVsZHMgfSBmcm9tICcuLi9zaXppbmcuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gZGF0YS1wbG90LnRzIFx1MjAxNCB0aGUgZGF0YV9wbG90IGJsb2NrIChzdGF0aXN0aWNzIGNoYXJ0cylcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc3RhdGlzdGljcyBzaWJsaW5nIG9mIGludGVyYWN0aXZlX2dyYXBoICgyLUQgZnVuY3Rpb25zKSBhbmQgbnVtYmVyX2xpbmVcbi8vICgxLUQgZ2VvbWV0cnkpLiBBIGRhdGFfcGxvdCByZW5kZXJzIGEgZG90IHBsb3QsIGhpc3RvZ3JhbSwgb3IgYm94IHBsb3QgZnJvbSBhXG4vLyBkYXRhc2V0IFx1MjAxNCBlaXRoZXIgYXMgYSBzdGF0aWMgU1RJTVVMVVMgdGhlIHN0dWRlbnQgcmVhZHMgKFwid2hhdCBpcyB0aGUgbWVkaWFuXG4vLyBvZiB0aGlzIGJveCBwbG90P1wiLCBwYWlyZWQgd2l0aCBhIHNpYmxpbmcgbnVtZXJpYy9NQyBibG9jaykgb3IgYXMgYSBncmFkZWRcbi8vIENPTlNUUlVDVElPTiB0aGUgc3R1ZGVudCBidWlsZHMgKFwibWFrZSBhIGRvdCBwbG90IG9mIHRoZXNlIHZhbHVlc1wiKS5cbi8vXG4vLyBBIFNFUEFSQVRFIGJsb2NrIGZhbWlseSwgbm90IGEgR3JhcGhJbnRlcmFjdGlvbiB2YXJpYW50ICh0YXhvbm9teSBmaXhlZFxuLy8gMjAyNi0wNy0xMCwgU1RBVEUpOiBzdGF0cyBjaGFydHMgYXJlIHRoZWlyIG93biBzaGFwZSBhbmQgbXVzdCBub3QgYmUgZm9yY2VkXG4vLyB1bmRlciB0aGUgZ3JhcGggYmxvY2sncyAyLUQgQXhpc0NvbmZpZy4gRGVzaWduICsgOSBkZWNpc2lvbnMgaW5cbi8vIGRvY3MvZGVzaWduL2RhdGEtcGxvdC1ibG9jay5tZCAoYXV0aG9yIGFwcHJvdmVkIHRoZSByZWNvbW1lbmRlZCBhbnN3ZXJzKS5cbi8vXG4vLyBUSEUgQU5TV0VSIElTIENPTVBVVEVEIEZST00gVEhFIERBVEEgKGRlc2lnbiBkZWNpc2lvbiAzYSk6IGEgZG90IHBsb3QsXG4vLyBoaXN0b2dyYW0sIGFuZCBib3ggcGxvdCBhcmUgZWFjaCBhIGRldGVybWluaXN0aWMgZnVuY3Rpb24gb2YgYGRhdGFgLCBzbyB0aGVcbi8vIGF1dGhvciBlbnRlcnMgdGhlIHJhdyBkYXRhc2V0IE9OQ0UgYW5kIHRoZSBjb3JyZWN0IHBsb3QgaXMgZGVyaXZlZCBieSB0aGUga2l0XG4vLyBzY29yZXIgXHUyMDE0IHRoZXJlIGlzIG5vIHNlcGFyYXRlbHktYXV0aG9yZWQgYW5zd2VyIGtleSB0byBkcmlmdCBmcm9tIHRoZSBkYXRhLlxuLy8gVGhlIHNhbWUgYGRhdGFgIHJlbmRlcnMgdGhlIGNoYXJ0IGluIGRpc3BsYXkgbW9kZSBhbmQgaXMgdGhlIHNvdXJjZSB0aGVcbi8vIHN0dWRlbnQgcGxvdHMgKGFuZCB0aGUga2V5IGl0J3Mgc2NvcmVkIGFnYWluc3QpIGluIGJ1aWxkIG1vZGUuXG4vL1xuLy8gU2xpY2UgMSBzaGlwcyBUV08gaW50ZXJhY3Rpb25zIFx1MjAxNCBgZGlzcGxheWAgKGFsbCB0aHJlZSBjaGFydCB0eXBlcywgdW5ncmFkZWRcbi8vIHN0aW11bHVzKSBhbmQgYGJ1aWxkX2RvdHBsb3RgICh0aGUgc2ltcGxlc3QgZ3JhZGVkIGNvbnN0cnVjdGlvbikgXHUyMDE0XG4vLyBkaXNjcmltaW5hdGVkIG9uIGB0eXBlYCBmcm9tIGRheSBvbmUgc28gYGJ1aWxkX2hpc3RvZ3JhbWAgLyBgYnVpbGRfYm94cGxvdGBcbi8vIHNsb3QgaW4gYWRkaXRpdmVseSBsYXRlciwgZXhhY3RseSBob3cgR3JhcGhJbnRlcmFjdGlvbiBhbmQgTnVtYmVyTGluZUludGVyYWN0aW9uXG4vLyBncm93LiBTYW1lIHRocmVlIHN0cnVjdHVyYWwgY29uc2VxdWVuY2VzIGFzIHRoZSBncmFwaC9udW1iZXItbGluZSBibG9ja3M6IGFcbi8vIHN0cnVjdHVyZWQgYW5zd2VyIHdpdGggaXRzIE9XTiBzdWJtaXNzaW9uIG1hcCAoZGF0YVBsb3RSZXNwb25zZXMsIG5vdCB0aGVcbi8vIGJsYW5rcyBtYXApLCBmcmVxdWVuY3kvc3VtbWFyeSBzY29yaW5nIGRvbmUgYnkgdGhlIGxhenkgZ3JhcGgta2l0IChub3QgdGhlXG4vLyBydW50aW1lJ3Mgc3RyaW5nIHN0cmF0ZWdpZXMpLCBhbmQgYSB3aWRnZXQgdGhhdCByaWRlcyBAYWN0aXZpdHkvZ3JhcGgta2l0LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gLS0tLSBDaGFydCBjb25maWd1cmF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBudW1lcmljIGF4aXMgaXMgcmV1c2VkIFZFUkJBVElNIGZyb20gTnVtYmVyTGluZUNvbmZpZyAoZGVzaWduIGRlY2lzaW9uIDUpOlxuLy8gYSBkb3QgcGxvdCBzdGFja3MgZG90cyBhYm92ZSB0aGVpciB2YWx1ZSBvbiBhIDEtRCBudW1iZXIgbGluZSwgYW5kIGEgYm94IHBsb3Rcbi8vIHNpdHMgb24gdGhhdCBzYW1lIGF4aXMsIHNvIHRoZSB0aWNrL21pbm9yL3NuYXAgc2VtYW50aWNzIGFyZSBpZGVudGljYWwuIFRoZVxuLy8gaGlzdG9ncmFtLW9ubHkgZXh0cmFzIChlcXVhbC13aWR0aCBiaW5zICsgYW4gb3B0aW9uYWwgeS1zY2FsZSBjZWlsaW5nKSBhcmVcbi8vIGNvbnN1bHRlZCBvbmx5IHdoZW4gdGhlIGNoYXJ0IGlzIGEgaGlzdG9ncmFtOyB1bmVxdWFsLWJpbiBgYmluRWRnZXNgIGlzIGFcbi8vIGRvY3VtZW50ZWQgbGF0ZXIgbGV2ZXIgKFlBR05JIGluIHNsaWNlIDEpLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90Q29uZmlnID0gTnVtYmVyTGluZUNvbmZpZy5leHRlbmQoe1xuICAvLyBFcXVhbC13aWR0aCBiaW4gc2l6ZSBzcGFubmluZyBbbWluLCBtYXhdOyBvbmx5IHJlYWQgd2hlbiBjaGFydCA9PVxuICAvLyAnaGlzdG9ncmFtJy4gQWJzZW50IFx1MjE5MiB0aGUgaGlzdG9ncmFtIGZhbGxzIGJhY2sgdG8gYHRpY2tTdGVwYCBhcyB0aGUgYmluXG4gIC8vIHdpZHRoLiBQb3NpdGl2ZS5cbiAgYmluV2lkdGg6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAvLyBGaXhlZCBjZWlsaW5nIGZvciB0aGUgaGlzdG9ncmFtL2RvdC1wbG90IHZlcnRpY2FsIHNjYWxlLiBBYnNlbnQgXHUyMTkyIHRoZVxuICAvLyBzY2FsZSBhdXRvLWZpdHMgdGhlIHRhbGxlc3QgYmFyL3N0YWNrIGZyb20gYGRhdGFgLiBBIGZpeGVkIHZhbHVlIGtlZXBzXG4gIC8vIHNldmVyYWwgcGxvdHMgb24gYSBwYWdlIHZpc3VhbGx5IGNvbXBhcmFibGUuIFBvc2l0aXZlIGludGVnZXIgKGZyZXF1ZW5jeSkuXG4gIG1heEZyZXF1ZW5jeTogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIERhdGFQbG90Q29uZmlnID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3RDb25maWc+O1xuXG4vLyBUaGUgY2hhcnQgc2hhcGUuIFNoYXJlZCBieSB0aGUgYGRpc3BsYXlgIG1lbWJlciAod2hpY2ggb25lIHRvIHJlbmRlcikgYW5kXG4vLyBpbXBsaWVkIGJ5IGVhY2ggYGJ1aWxkXypgIG1lbWJlci4gTmFtZWQgYnkgc2hhcGUsIG5vdCBieSBncmFkZSBiYW5kLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90Q2hhcnQgPSB6LmVudW0oWydkb3RwbG90JywgJ2hpc3RvZ3JhbScsICdib3hwbG90J10pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RDaGFydCA9IHouaW5mZXI8dHlwZW9mIERhdGFQbG90Q2hhcnQ+O1xuXG4vLyAtLS0tIEludGVyYWN0aW9uIHZhcmlhbnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gZGlzcGxheTogYSBzdGF0aWMsIHVuZ3JhZGVkIGNoYXJ0IG9mIGBkYXRhYCBcdTIwMTQgYSBzdGltdWx1cyB0aGUgc3R1ZGVudCByZWFkcy5cbi8vIExpa2UgaW50ZXJhY3RpdmVfZ3JhcGgncyBgZGlzcGxheWAgbWVtYmVyIGl0IHB1bGxzIG5vIHByb2JsZW0gbnVtYmVyLCBpc1xuLy8gbmV2ZXIgc2NvcmVkLCBhbmQgbmV2ZXIgam9pbnMgdGhlIHN1Ym1pc3Npb24gcGF5bG9hZDsgYSBcInJlYWQgdGhpcyBjaGFydCB0aGVuXG4vLyBhbnN3ZXJcIiB0YXNrIGNvbXBvc2VzIGEgZGlzcGxheSBkYXRhX3Bsb3Qgd2l0aCBhIHNpYmxpbmcgbnVtZXJpYy9NQyBibG9ja1xuLy8gKHRoZSBwYXR0ZXJuIHRoYXQgcmVwbGFjZWQgdGhlIHJldGlyZWQgYW5zd2VyLXN1cmZhY2UtYXMtYS1maWVsZCBzZWFtKS5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdERpc3BsYXlJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdkaXNwbGF5JyksXG4gIGNoYXJ0OiBEYXRhUGxvdENoYXJ0LFxufSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdERpc3BsYXlJbnRlcmFjdGlvbiA9IHouaW5mZXI8XG4gIHR5cGVvZiBEYXRhUGxvdERpc3BsYXlJbnRlcmFjdGlvblxuPjtcblxuLy8gYnVpbGRfZG90cGxvdDogdGhlIHN0dWRlbnQgc3RhY2tzIGRvdHMgYWJvdmUgdGhlIGF4aXMgdG8gcmVwcm9kdWNlIHRoZVxuLy8gZnJlcXVlbmN5IGRpc3RyaWJ1dGlvbiBvZiBgZGF0YWAuIFNjb3JlZCBhbGwtb3Itbm90aGluZyBvbiBmcmVxdWVuY3ktbWFwXG4vLyBlcXVhbGl0eSAoZGVzaWduIGRlY2lzaW9uIDgpIFx1MjAxNCBkb3QgdmFsdWVzIGFyZSBkaXNjcmV0ZSAodGhlIHdpZGdldCBzbmFwcyBlYWNoXG4vLyBkb3QgdG8gYSB0aWNrKSwgc28gdGhlIGNvbXBhcmlzb24gaXMgZXhhY3QsIG5vIHRvbGVyYW5jZSBmaWVsZC4gVGhlIGNvcnJlY3Rcbi8vIGRpc3RyaWJ1dGlvbiBpcyBDT01QVVRFRCBmcm9tIGBkYXRhYCAoZGVjaXNpb24gM2EpOyBub3RoaW5nIHRvIGF1dGhvciBoZXJlXG4vLyBiZXlvbmQgdGhlIGRhdGFzZXQgaXRzZWxmLCBzbyB0aGlzIGlzIGEgYmFyZSBtYXJrZXIgdmFyaWFudCB0aGF0IGdyb3dzXG4vLyBidWlsZF9oaXN0b2dyYW0gLyBidWlsZF9ib3hwbG90IHNpYmxpbmdzIGxhdGVyLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90RG90cGxvdEludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2J1aWxkX2RvdHBsb3QnKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3REb3RwbG90SW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgRGF0YVBsb3REb3RwbG90SW50ZXJhY3Rpb25cbj47XG5cbi8vIGJ1aWxkX2hpc3RvZ3JhbTogdGhlIHN0dWRlbnQgc2V0cyBlYWNoIGJhcidzIGZyZXF1ZW5jeSB0byByZXByb2R1Y2UgdGhlXG4vLyBoaXN0b2dyYW0gb2YgYGRhdGFgIChiaW5uZWQgYnkgY29uZmlnLmJpbldpZHRoIG92ZXIgW21pbixtYXhdKS4gU2NvcmVkXG4vLyBhbGwtb3Itbm90aGluZyBvbiBleGFjdCBwZXItYmluIGludGVnZXItZnJlcXVlbmN5IGVxdWFsaXR5IChhIGJhciBpcyBhIHdob2xlXG4vLyBjb3VudCBcdTIwMTQgbm8gdG9sZXJhbmNlKSwgdGhlIGZyZXF1ZW5jeS1kaXN0cmlidXRpb24gdHdpbiBvZiBidWlsZF9kb3RwbG90LiBUaGVcbi8vIGNvcnJlY3QgaGVpZ2h0cyBhcmUgQ09NUFVURUQgZnJvbSBgZGF0YWAsIHNvIHRoaXMgdG9vIGlzIGEgYmFyZSBtYXJrZXIgdmFyaWFudC5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdEhpc3RvZ3JhbUludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2J1aWxkX2hpc3RvZ3JhbScpLFxufSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdEhpc3RvZ3JhbUludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIERhdGFQbG90SGlzdG9ncmFtSW50ZXJhY3Rpb25cbj47XG5cbi8vIGJ1aWxkX2JveHBsb3Q6IHRoZSBzdHVkZW50IGRyYWdzIHRoZSBmaXZlLW51bWJlci1zdW1tYXJ5IGhhbmRsZXMgKG1pbiwgUTEsXG4vLyBtZWRpYW4sIFEzLCBtYXgpIHRvIGJ1aWxkIHRoZSBib3ggKyB3aGlza2VycyBvZiBgZGF0YWAuIFNjb3JlZCBhbGwtb3Itbm90aGluZ1xuLy8gd2l0aCBlYWNoIGhhbmRsZSB3aXRoaW4gYHRvbGVyYW5jZWAgbGluZSB1bml0cyBvZiB0aGUgY29tcHV0ZWQgc3VtbWFyeS4gVW5saWtlXG4vLyB0aGUgZnJlcXVlbmN5IGJ1aWxkcyB0aGlzIGNhcnJpZXMgYSB0b2xlcmFuY2UgYmVjYXVzZSBib3ggcG9zaXRpb25zIGFyZVxuLy8gY29udGludW91cyBhbmQgdGhlIHR3byBjb21tb24gcXVhcnRpbGUgbWV0aG9kcyBjYW4gZGlmZmVyIGJ5IGEgZGF0YSBwb2ludCBvblxuLy8gZXZlbi1sZW5ndGggc2V0cyBcdTIwMTQgdGhlIGtleSB1c2VzIHRoZSBUSS04NCBleGNsdXNpdmUtbWVkaWFuIG1ldGhvZCAobG9ja2VkLFxuLy8gZGVzaWduIGRlY2lzaW9uIDQpIGFuZCB0aGUgdG9sZXJhbmNlIGFic29yYnMgdGhlIGFkamFjZW50LW1ldGhvZCBhbnN3ZXIuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RCb3hwbG90SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnYnVpbGRfYm94cGxvdCcpLFxuICAvLyBNYXRjaCByYWRpdXMgaW4gbGluZSB1bml0cywgYXBwbGllZCB0byBlYWNoIG9mIHRoZSBmaXZlIGhhbmRsZXMuIERlZmF1bHRcbiAgLy8gaGFsZiBhIHVuaXQgdGljay5cbiAgdG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjUpLFxufSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdEJveHBsb3RJbnRlcmFjdGlvbiA9IHouaW5mZXI8XG4gIHR5cGVvZiBEYXRhUGxvdEJveHBsb3RJbnRlcmFjdGlvblxuPjtcblxuLy8gRGlzY3JpbWluYXRlZCBvbiBgdHlwZWAgc28gY29uc3VtZXJzIGJyYW5jaCB1bmlmb3JtbHkgYW5kIHRoZSB3aXJlIGZvcm1hdFxuLy8gYWx3YXlzIGNhcnJpZXMgaXQuIEdyb3dpbmcgYSB2YXJpYW50IGlzIGEgbmV3IG1lbWJlciBoZXJlICsgYSBuZXcgc2NvcmVyXG4vLyBicmFuY2ggaW4gdGhlIGtpdCBcdTIwMTQgbm8gb3RoZXIgYmxvY2sgdG91Y2hlZC5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdEludGVyYWN0aW9uID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIERhdGFQbG90RGlzcGxheUludGVyYWN0aW9uLFxuICBEYXRhUGxvdERvdHBsb3RJbnRlcmFjdGlvbixcbiAgRGF0YVBsb3RIaXN0b2dyYW1JbnRlcmFjdGlvbixcbiAgRGF0YVBsb3RCb3hwbG90SW50ZXJhY3Rpb24sXG5dKTtcbmV4cG9ydCB0eXBlIERhdGFQbG90SW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBEYXRhUGxvdEludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBUaGUgYmxvY2sgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEF1dG8tbnVtYmVyZWQgbGlrZSB0aGUgb3RoZXIgcXVlc3Rpb24gYmxvY2tzIFdIRU4gR1JBREVEIFx1MjAxNCBhIGBkaXNwbGF5YFxuLy8gZGF0YV9wbG90IHB1bGxzIG5vIG51bWJlciAodGhlIHJlbmRlcmVyJ3MgaXNOdW1iZXJlZEJsb2NrIHJldHVybnMgZmFsc2UgZm9yXG4vLyBpdCwgZXhhY3RseSBhcyBpdCBkb2VzIGZvciBhIGRpc3BsYXkgaW50ZXJhY3RpdmVfZ3JhcGgpLiBza2lsbHMgKyBzb2x1dGlvblxuLy8gZm9sbG93IHRoZSBzYW1lIG9wdC1pbiBwYXR0ZXJucyB0aGUgZ3JhcGggLyBudW1iZXItbGluZSBibG9ja3MgZXN0YWJsaXNoZWQsXG4vLyBhbmQgKGxpa2UgdGhlbSkgbWF0dGVyIG9ubHkgaW4gYnVpbGQgbW9kZS4gRGVsaWJlcmF0ZWx5IExFQU4gZm9yIHNsaWNlIDFcbi8vIChubyBtaXN0YWtlRmVlZGJhY2spIFx1MjAxNCBhbGwtb3Itbm90aGluZyBzY29yaW5nIChkZWNpc2lvbiA4KTsgdGhvc2UgZmllbGRzXG4vLyBhcmUgYWRkaXRpdmUgbGF0ZXIgaWYgYXNrZWQgZm9yIChZQUdOSSkuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2RhdGFfcGxvdCcpLFxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAuLi5sYWJlbEZpZWxkcyxcbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICAvLyBUaGUgZGF0YXNldC4gU2luZ2xlIHNvdXJjZSBvZiB0cnV0aDogdGhlIGNoYXJ0IGlzIGRyYXduIGZyb20gaXQgYW5kLCBpblxuICAvLyBidWlsZCBtb2RlLCB0aGUgY29ycmVjdCBhbnN3ZXIgaXMgZGVyaXZlZCBmcm9tIGl0LiBOb24tZW1wdHkuXG4gIGRhdGE6IHouYXJyYXkoei5udW1iZXIoKSkubWluKDEpLFxuICBjb25maWc6IERhdGFQbG90Q29uZmlnLFxuICBpbnRlcmFjdGlvbjogRGF0YVBsb3RJbnRlcmFjdGlvbixcbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICAvLyBWYXJpYWJsZSBibG9jayBzaXppbmc6IG9wdGlvbmFsIHdpZHRoIGZyYWN0aW9uICsgYWxpZ25tZW50IChzaXppbmcudHMpLlxuICAvLyBBZGRpdGl2ZS9vcHRpb25hbCBcdTIwMTQgbm8gc2NoZW1hVmVyc2lvbiBidW1wLlxuICAuLi5zaXppbmdGaWVsZHMsXG59KTtcbmV4cG9ydCB0eXBlIERhdGFQbG90QmxvY2sgPSB6LmluZmVyPHR5cGVvZiBEYXRhUGxvdEJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTGVhcm5pbmdPYmplY3RpdmVzQmxvY2sgXHUyMDE0IGEgdGl0bGVkIGxpc3Qgb2YgbGVhcm5pbmcgb2JqZWN0aXZlcy5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIHB1cmUgQ09OVEVOVCBibG9jayAoZGF0YS1ibG9jay1jYXRlZ29yeT1cImNvbnRlbnRcIik6IG5vbi1pbnRlcmFjdGl2ZSxcbi8vIG5vbi1udW1iZXJlZCwgbm8gcnVudGltZSB3aXJpbmcsIG5vIHN1Ym1pc3Npb24gd2lyZSBpbXBhY3QuIFBlZGFnb2dpY2FsbHkgaXRcbi8vIGZyb250cyBhbiBhY3Rpdml0eSAob3IgYSBzZWN0aW9uKSB3aXRoIHRoZSBcInN0dWRlbnRzIHdpbGwgYmUgYWJsZSB0b1x1MjAyNlwiIGdvYWxzXG4vLyB0aGF0IFN3ZWxsZXItc3R5bGUgc2NhZmZvbGRpbmcgaXMgYnVpbHQgYXJvdW5kLlxuLy9cbi8vIFNoYXBlOiBhbiBlZGl0YWJsZSBgdGl0bGVgIChkZWZhdWx0ZWQsIGJ1dCB0aGUgdGVhY2hlciBjYW4gcmVuYW1lIGl0KSBwbHVzIGFcbi8vIGxpc3Qgb2YgYGl0ZW1zYCwgZWFjaCBhIHJpY2ggaW5saW5lIHJ1biAodGV4dCArIGlubGluZSBtYXRoICsgbWFya3MpIFx1MjAxNCB0aGVcbi8vIHNhbWUgYWxwaGFiZXQgcGFyYWdyYXBocyB1c2UuIEl0ZW1zIG1hcCAxOjEgdG8gZWRpdGFibGUgcGFyYWdyYXBocyBpbiB0aGVcbi8vIGVkaXRvciBOb2RlVmlldzsgdGhlIHJlbmRlcmVyIGVtaXRzIHRoZW0gYXMgYSA8dWw+LlxuLy9cbi8vIGBpdGVtc2AgbWF5IGJlIGVtcHR5OiB0aGUgZWRpdG9yJ3MgY29udGVudCBzcGVjIGtlZXBzIGF0IGxlYXN0IG9uZSBwYXJhZ3JhcGhcbi8vIGxpdmUsIGJ1dCBhIHNlcmlhbGl6ZWQgcm91bmQtdHJpcCBjYW4gbGVnaXRpbWF0ZWx5IHByb2R1Y2UgYW4gZW1wdHkgbGlzdFxuLy8gKGUuZy4gZXZlcnkgaXRlbSBjbGVhcmVkKSwgYW5kIHRoYXQgbXVzdCBub3QgZmFpbCBwdWJsaXNoIHZhbGlkYXRpb24uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgY29uc3QgTGVhcm5pbmdPYmplY3RpdmVzQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdsZWFybmluZ19vYmplY3RpdmVzJyksXG4gIHRpdGxlOiB6LnN0cmluZygpLFxuICBpdGVtczogei5hcnJheSh6LmFycmF5KElubGluZU5vZGUpKSxcbn0pO1xuZXhwb3J0IHR5cGUgTGVhcm5pbmdPYmplY3RpdmVzQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBMZWFybmluZ09iamVjdGl2ZXNCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBQYXJhZ3JhcGhCbG9jayB9IGZyb20gJy4vcGFyYWdyYXBoLmpzJztcbmltcG9ydCB7IEhlYWRpbmdCbG9jayB9IGZyb20gJy4vaGVhZGluZy5qcyc7XG5pbXBvcnQgeyBNYXRoQmxvY2sgfSBmcm9tICcuL21hdGgtYmxvY2suanMnO1xuaW1wb3J0IHsgSW1hZ2VCbG9jayB9IGZyb20gJy4vaW1hZ2UuanMnO1xuaW1wb3J0IHsgQnVsbGV0TGlzdEJsb2NrLCBPcmRlcmVkTGlzdEJsb2NrIH0gZnJvbSAnLi9saXN0LmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFdvcmtlZEV4YW1wbGVCbG9jayBcdTIwMTQgYSB0aXRsZWQsIGJveGVkIGZ1bGx5LXdvcmtlZCBleGFtcGxlIHRvIHN0dWR5LlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEEgcHVyZSBDT05URU5UIGJsb2NrIChkYXRhLWJsb2NrLWNhdGVnb3J5PVwiY29udGVudFwiKTogbm9uLWludGVyYWN0aXZlLFxuLy8gbm9uLW51bWJlcmVkLCBubyBydW50aW1lIHdpcmluZywgbm8gc3VibWlzc2lvbiB3aXJlIGltcGFjdC4gRHJhd3Mgb25cbi8vIFN3ZWxsZXIncyBjb2duaXRpdmUtbG9hZCB0aGVvcnkgXHUyMDE0IGEgd29ya2VkIGV4YW1wbGUgYSBzdHVkZW50IHJlYWRzIGJlZm9yZVxuLy8gYXR0ZW1wdGluZyB0aGUgYW5hbG9nb3VzIHByb2JsZW0uXG4vL1xuLy8gVW5saWtlIGEgY2FsbG91dCAoaW5saW5lLW9ubHkgYm9keSksIGEgd29ya2VkIGV4YW1wbGUgaG9sZHMgTkVTVEVEIEJMT0NLXG4vLyBjb250ZW50IHNvIGEgbXVsdGktc3RlcCwgbWF0aC1oZWF2eSBzb2x1dGlvbiByZW5kZXJzIHByb3Blcmx5OiBwYXJhZ3JhcGhzLFxuLy8gYmxvY2sgbWF0aCwgbGlzdHMsIGFuZCBpbWFnZXMuIFRoZSBjaGlsZCB1bmlvbiBpcyBkZWxpYmVyYXRlbHkgYSBjdXJhdGVkXG4vLyBzdWJzZXQgb2YgdGhlIEJsb2NrIHVuaW9uIFx1MjAxNCBsZWFmIENPTlRFTlQgYmxvY2tzIG9ubHkuIEl0IGV4Y2x1ZGVzOlxuLy8gICAtIHF1ZXN0aW9uIGJsb2NrcyAoYSB3b3JrZWQgZXhhbXBsZSBpcyBjb250ZW50LCBuZXZlciBzY29yZWQpLFxuLy8gICAtIGNvbHVtbnMgYW5kIHdvcmtlZF9leGFtcGxlIGl0c2VsZiAoc28gbmVzdGluZyB0ZXJtaW5hdGVzIFx1MjAxNCBubyByZWN1cnNpb24sXG4vLyAgICAgdGhlIHNhbWUgZGlzY2lwbGluZSBhcyBDb2x1bW5DZWxsQmxvY2sgZm9yYmlkZGluZyBjb2x1bW5zLWluLWNvbHVtbnMpLlxuLy8gVGhpcyBhbHNvIGtlZXBzIHRoZSBkYXNoYm9hcmQgaW5kZXggdW50b3VjaGVkOiBhIHdvcmtlZCBleGFtcGxlIGNhbiBuZXZlclxuLy8gY29udGFpbiBhIHF1ZXN0aW9uLCBzbyBidWlsZEFjdGl2aXR5SW5kZXggbmV2ZXIgbmVlZHMgdG8gcmVjdXJzZSBpbnRvIGl0LlxuLy9cbi8vIFRoZSBzdWJzZXQgbWF0Y2hlcyB0aGUgZWRpdG9yLW1hcHBhYmxlIGNvbnRlbnQgbm9kZXMgMToxIChXb3JrZWRFeGFtcGxlLnRzJ3Ncbi8vIGNvbnRlbnQgZXhwcmVzc2lvbiksIHNvIHNlcmlhbGl6ZSByb3VuZC10cmlwcyB3aXRob3V0IHNpbGVudGx5IGRyb3BwaW5nIGFcbi8vIGNoaWxkLiBgY29udGVudGAgbWF5IGJlIGVtcHR5IGZvciB0aGUgc2FtZSByZWFzb24gTGVhcm5pbmdPYmplY3RpdmVzLml0ZW1zXG4vLyBtYXkgYmUgXHUyMDE0IGFuIGFsbC11bm1hcHBhYmxlIHJvdW5kIHRyaXAgKGUuZy4gYSBzaW5nbGUgZW1wdHkgaW1hZ2UpIG11c3Qgbm90XG4vLyBmYWlsIHB1Ymxpc2ggdmFsaWRhdGlvbi5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBjb25zdCBXb3JrZWRFeGFtcGxlQ2hpbGQgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgUGFyYWdyYXBoQmxvY2ssXG4gIEhlYWRpbmdCbG9jayxcbiAgTWF0aEJsb2NrLFxuICBJbWFnZUJsb2NrLFxuICBCdWxsZXRMaXN0QmxvY2ssXG4gIE9yZGVyZWRMaXN0QmxvY2ssXG5dKTtcbmV4cG9ydCB0eXBlIFdvcmtlZEV4YW1wbGVDaGlsZCA9IHouaW5mZXI8dHlwZW9mIFdvcmtlZEV4YW1wbGVDaGlsZD47XG5cbmV4cG9ydCBjb25zdCBXb3JrZWRFeGFtcGxlQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCd3b3JrZWRfZXhhbXBsZScpLFxuICB0aXRsZTogei5zdHJpbmcoKSxcbiAgY29udGVudDogei5hcnJheShXb3JrZWRFeGFtcGxlQ2hpbGQpLFxufSk7XG5leHBvcnQgdHlwZSBXb3JrZWRFeGFtcGxlQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBXb3JrZWRFeGFtcGxlQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgUGFyYWdyYXBoQmxvY2sgfSBmcm9tICcuL3BhcmFncmFwaC5qcyc7XG5pbXBvcnQgeyBIZWFkaW5nQmxvY2sgfSBmcm9tICcuL2hlYWRpbmcuanMnO1xuaW1wb3J0IHsgTWF0aEJsb2NrIH0gZnJvbSAnLi9tYXRoLWJsb2NrLmpzJztcbmltcG9ydCB7IEltYWdlQmxvY2sgfSBmcm9tICcuL2ltYWdlLmpzJztcbmltcG9ydCB7IEJ1bGxldExpc3RCbG9jaywgT3JkZXJlZExpc3RCbG9jayB9IGZyb20gJy4vbGlzdC5qcyc7XG5pbXBvcnQgeyBGaWxsSW5CbGFua0Jsb2NrIH0gZnJvbSAnLi9maWxsLWluLWJsYW5rLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRmFkZWRXb3JrZWRFeGFtcGxlQmxvY2sgXHUyMDE0IGEgc2NhZmZvbGRlZCAoXCJmYWRlZFwiKSB3b3JrZWQgZXhhbXBsZS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgaW50ZXJhY3RpdmUgc2libGluZyBvZiB3b3JrZWRfZXhhbXBsZSAoUmVua2wvQXRraW5zb24gY29tcGxldGlvblxuLy8gcHJvYmxlbXMpOiBlYXJseSBzdGVwcyBhcmUgZnVsbHkgc2hvd24sIGxhdGVyIHN0ZXBzIGFyZSBGQURFRCBcdTIwMTQgdGhlIHN0dWRlbnRcbi8vIGZpbGxzIHRoZW0gaW4uIFN0cnVjdHVyYWxseSBpdCdzIGEgd29ya2VkX2V4YW1wbGUgZnJhbWUgd2hvc2UgY2hpbGQgdW5pb25cbi8vIEFMU08gYWRtaXRzIGZpbGxfaW5fYmxhbmsgYmxvY2tzOiBhIHNob3duIHN0ZXAgaXMgYSBwYXJhZ3JhcGggLyBibG9jayBtYXRoIC9cbi8vIGxpc3QgLyBpbWFnZTsgYSBmYWRlZCBzdGVwIGlzIGEgZmlsbF9pbl9ibGFuayBibG9jayBjYXJyeWluZyB0aGUgYmxhbmtzLlxuLy9cbi8vIFJldXNlIG92ZXIgcmVpbnZlbnRpb24gKGRlY2lkZWQgYXQgZGVzaWduLCAyMDI2LTA3LTEyKTpcbi8vICAgLSBUaGUgZmFkZWQgc3RlcHMgQVJFIGZpbGxfaW5fYmxhbmsgYmxvY2tzLCBzbyB0aGUgcnVudGltZSBzY29yZXMgdGhlbSB3aXRoXG4vLyAgICAgWkVSTyBuZXcgcnVudGltZSBjb2RlIFx1MjAxNCBpbml0LnRzIGFscmVhZHkgc2NhbnMgZWFjaCAuYWN0aXZpdHktc2VjdGlvbiBmb3Jcbi8vICAgICBgW2RhdGEtYmxvY2stdHlwZT1cImZpbGxfaW5fYmxhbmtcIl1gIGFuZCBmaW5kcyBORVNURUQgb25lcy4gVGhleSByaWRlIHRoZVxuLy8gICAgIGV4aXN0aW5nIEJsYW5rUmVzcG9uc2UgbWFwLCBzbyB0aGVyZSBpcyBOTyBzdWJtaXNzaW9uIHdpcmUvc3RvcmFnZSBidW1wLlxuLy8gICAtIFNjb3JpbmcgcmlkZXMgdGhlIGNoaWxkIGJsYW5rczsgdGhpcyBmcmFtZSByZWFkcyBubyB0eXBlLXNwZWNpZmljXG4vLyAgICAgYXR0cmlidXRlcyBpdHNlbGYgXHUyMTkyIGl0IGlzIGEgQ09OVEFJTkVSIChsaWtlIGBwcm9ibGVtYCksIG5vdCBJTlRFUkFDVElWRS5cbi8vICAgLSBOdW1iZXJpbmcgKHJldmlzZWQgMjAyNi0wNy0xMyk6IHRoZSBXSE9MRSBib3ggaXMgb25lIG51bWJlcmVkIHByb2JsZW0gXHUyMDE0XG4vLyAgICAgaXRzIG51bWJlciBsZWFkcyB0aGUgdGl0bGUsIGFuZCB0aGUgZmFkZWQgZmlsbF9pbl9ibGFuayBzdGVwcyBhcmUgbGV0dGVyZWRcbi8vICAgICAoYSkvKGIpXHUyMDI2IExPQ0FMTFkgKHNob3dTdGVwTGFiZWxzIHRvZ2dsZXMgdGhlbSBvZmYpLCBzbyB0aGV5IG5vIGxvbmdlclxuLy8gICAgIGNvbnN1bWUgd29ya3NoZWV0IHByb2JsZW0gbnVtYmVycy4gU2VlIHJlbmRlckZhZGVkV29ya2VkRXhhbXBsZSBhbmQgdGhlXG4vLyAgICAgZWRpdG9yJ3MgcHJvYmxlbU51bWJlckF0ICh3aGljaCB0cmVhdHMgdGhlIGJveCBhcyBhdG9taWMpLiBUaGlzIHJldmVyc2VkXG4vLyAgICAgdGhlIG9yaWdpbmFsIFwic3RlcHMgbnVtYmVyIGFzIG9yZGluYXJ5IHByb2JsZW1zXCIgY2hvaWNlLCB3aGljaCB3YXN0ZWRcbi8vICAgICB3cml0aW5nL3ByaW50IHdpZHRoIGFuZCBwb2xsdXRlZCB0aGUgd29ya3NoZWV0J3MgbnVtYmVyaW5nLlxuLy9cbi8vIFRoZSBjaGlsZCB1bmlvbiBzdGlsbCBleGNsdWRlcyBxdWVzdGlvbnMgT1RIRVIgdGhhbiBmaWxsX2luX2JsYW5rLCBwbHVzXG4vLyBjb2x1bW5zIC8gd29ya2VkX2V4YW1wbGUgLyBmYWRlZF93b3JrZWRfZXhhbXBsZSBpdHNlbGYgXHUyMDE0IHNvIG5lc3Rpbmdcbi8vIHRlcm1pbmF0ZXMgYW5kIHRoZSBkYXNoYm9hcmQgaW5kZXggcmVjdXJzZXMgb25seSBvbmUgcHJlZGljdGFibGUgbGV2ZWwuXG4vLyBgY29udGVudGAgbWF5IGJlIGVtcHR5IGZvciB0aGUgc2FtZSByb3VuZC10cmlwLXNhZmV0eSByZWFzb24gYXNcbi8vIHdvcmtlZF9leGFtcGxlLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IEZhZGVkV29ya2VkRXhhbXBsZUNoaWxkID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFBhcmFncmFwaEJsb2NrLFxuICBIZWFkaW5nQmxvY2ssXG4gIE1hdGhCbG9jayxcbiAgSW1hZ2VCbG9jayxcbiAgQnVsbGV0TGlzdEJsb2NrLFxuICBPcmRlcmVkTGlzdEJsb2NrLFxuICBGaWxsSW5CbGFua0Jsb2NrLFxuXSk7XG5leHBvcnQgdHlwZSBGYWRlZFdvcmtlZEV4YW1wbGVDaGlsZCA9IHouaW5mZXI8dHlwZW9mIEZhZGVkV29ya2VkRXhhbXBsZUNoaWxkPjtcblxuZXhwb3J0IGNvbnN0IEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnZmFkZWRfd29ya2VkX2V4YW1wbGUnKSxcbiAgdGl0bGU6IHouc3RyaW5nKCksXG4gIGNvbnRlbnQ6IHouYXJyYXkoRmFkZWRXb3JrZWRFeGFtcGxlQ2hpbGQpLFxuICAvLyBUaGUgd2hvbGUgYm94IGlzIE9ORSBudW1iZXJlZCBwcm9ibGVtIChpdHMgbnVtYmVyIGxlYWRzIHRoZSB0aXRsZSk7IHRoZVxuICAvLyBmYWRlZCBmaWxsX2luX2JsYW5rIHN0ZXBzIGFyZSBsZXR0ZXJlZCAoYSksIChiKVx1MjAyNiBXSVRISU4gdGhlIGJveCBpbnN0ZWFkIG9mXG4gIC8vIGNvbnN1bWluZyB3b3Jrc2hlZXQgcHJvYmxlbSBudW1iZXJzLiBzaG93U3RlcExhYmVscyB0b2dnbGVzIHRob3NlIGxldHRlcnNcbiAgLy8gb2ZmIHBlciBib3ggKGJhcmUgYmxhbmtzLCBubyBndXR0ZXIpIGZvciB0ZWFjaGVycyB3aG8gd2FudCBtYXhpbXVtIHdyaXRpbmdcbiAgLy8gcm9vbS4gRGVmYXVsdGVkIHNvIHByZS1leGlzdGluZyBkb2N1bWVudHMgKG5vIGZpZWxkKSByZW5kZXIgbGFiZWxsZWQuXG4gIHNob3dTdGVwTGFiZWxzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAvLyBUaGUgYm94J3MgT1dOIHBhZ2UgbGFiZWwgKHZpZXdlci1udW1iZXJpbmcgTjYpLiBJdCBoYXMgYWx3YXlzIGJlZW4gb25lXG4gIC8vIG51bWJlcmVkIHByb2JsZW07IHRoaXMgaXMgd2hhdCBsZXRzIGEgdGVhY2hlciByZWxhYmVsIGl0IChcIldhcm0tdXBcIikgb3JcbiAgLy8gdW5udW1iZXIgaXQsIHRoZSBzYW1lIHZvY2FidWxhcnkgZXZlcnkgb3RoZXIgbnVtYmVyZWQgdHlwZSBhbHJlYWR5IGhhZC5cbiAgLy8gRGlzdGluY3QgZnJvbSBzaG93U3RlcExhYmVscywgd2hpY2ggZ292ZXJucyB0aGUgKGEpLyhiKSBsZXR0ZXJzIElOU0lERSB0aGVcbiAgLy8gYm94IFx1MjAxNCB0aGF0IG9uZSBpcyBhYm91dCB0aGUgc3RlcHMsIHRoaXMgb25lIGlzIGFib3V0IHRoZSBib3guXG4gIC4uLmxhYmVsRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBGYWRlZFdvcmtlZEV4YW1wbGVCbG9jayA9IHouaW5mZXI8dHlwZW9mIEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gU2VsZkV4cGxhbmF0aW9uQmxvY2sgXHUyMDE0IGFuIHVuZ3JhZGVkIGZyZWUtdGV4dCByZWZsZWN0aW9uIHByb21wdC5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBNZXRhY29nbml0aXZlIHNlbGYtZXhwbGFuYXRpb24gKENoaSBldCBhbC4pOiB0aGUgc3R1ZGVudCB3cml0ZXMgV0hZLCBpbiB0aGVpclxuLy8gb3duIHdvcmRzLiBEZWxpYmVyYXRlbHkgVU5HUkFERUQgKGF1dGhvciBkZWNpc2lvbiwgMjAyNi0wNy0xMikgXHUyMDE0IHRoZSBydW50aW1lXG4vLyBjYXB0dXJlcyB0aGUgdGV4dCBhbmQgdGhlIHRlYWNoZXIgZGFzaGJvYXJkIHNob3dzIGl0IHJhdzsgdGhlcmUgaXMgbm8gYW5zd2VyXG4vLyBrZXksIG5vIGNvcnJlY3QvaW5jb3JyZWN0LCBhbmQgaXQgbmV2ZXIgY29udHJpYnV0ZXMgdG8gdGhlIHNjb3JlLiBUaGlzIGtlZXBzXG4vLyBpdCBjbGVhciBvZiBQaGFzZSAyLjYgcnVicmljIGdyYWRpbmcuXG4vL1xuLy8gSXQgaXMgdGhlIEZJUlNUIGZyZWUtdGV4dCByZXNwb25zZSB0eXBlLCBzbyBpdCBpbnRyb2R1Y2VzIHRoZSBgZnJlZVJlc3BvbnNlc2Bcbi8vIG1hcCBvbiBTdWJtaXNzaW9uUmVzcG9uc2VzICh3aXJlIHY4IFx1MjE5MiB2OSkgXHUyMDE0IHRoZSBtYXAgbmFtZSB0aGUgc2NoZW1hIHJlc2VydmVkXG4vLyBmb3IgZXhhY3RseSB0aGlzIHNoYXBlLiBQaGFzZSAyLjYgc2hvcnRfYW5zd2VyIC8gZXNzYXkgcmV1c2UgdGhlIHNhbWUgbWFwIChhXG4vLyBzdHJpbmcgcGVyIGJsb2NrKSB3aXRoIG5vIGZ1cnRoZXIgd2lyZSBidW1wOyBncmFkaW5nLCB3aGVuIGl0IGxhbmRzLCBsaXZlcyBpblxuLy8gYSBzZXBhcmF0ZSB0YWJsZSwgbm90IGluIHRoZSByZXNwb25zZSBzaGFwZS5cbi8vXG4vLyBTaGFwZTogYSBgcHJvbXB0YCAocmljaCBpbmxpbmUgXHUyMDE0IHRleHQgKyBpbmxpbmUgbWF0aCArIG1hcmtzLCBsaWtlIGV2ZXJ5IG90aGVyXG4vLyBxdWVzdGlvbiBwcm9tcHQpIHBsdXMgYW4gb3B0aW9uYWwgYHBsYWNlaG9sZGVyYCAoYSBzZW50ZW5jZS1zdGFydGVyIC8gaGludFxuLy8gc2hvd24gaW4gdGhlIGVtcHR5IHRleHRhcmVhKS4gTm8gYW5zd2VyIGtleS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBjb25zdCBTZWxmRXhwbGFuYXRpb25CbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ3NlbGZfZXhwbGFuYXRpb24nKSxcbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICBwbGFjZWhvbGRlcjogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBTZWxmRXhwbGFuYXRpb25CbG9jayA9IHouaW5mZXI8dHlwZW9mIFNlbGZFeHBsYW5hdGlvbkJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBmcmVlLXJlc3BvbnNlLnRzIFx1MjAxNCBzaG9ydF9hbnN3ZXIgKyBlc3NheSAobWFudWFsbHktZ3JhZGVkIGZyZWUgdGV4dClcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgUGhhc2UgMi42IGdyYWRlZCBmcmVlLXRleHQgc2libGluZ3Mgb2Ygc2VsZl9leHBsYW5hdGlvbi4gQWxsIHRocmVlIHdyaXRlXG4vLyB0aGVpciBzdHVkZW50IHRleHQgaW50byB0aGUgU0FNRSBgZnJlZVJlc3BvbnNlc2AgbWFwICh3aXJlIHY5KSBcdTIwMTQgdGhlIHJlc3BvbnNlXG4vLyBzaGFwZSBpcyBpZGVudGljYWwgKGEgc3RyaW5nKTsgd2hhdCBkaWZmZXJzIGlzIGludGVudCArIGdyYWRpbmc6XG4vLyAgIC0gc2VsZl9leHBsYW5hdGlvbiBcdTIwMTQgdW5ncmFkZWQgcmVmbGVjdGlvbiAoYWxyZWFkeSBzaGlwcGVkKS5cbi8vICAgLSBzaG9ydF9hbnN3ZXIgICAgIFx1MjAxNCBhIGJyaWVmIGdyYWRlZCByZXNwb25zZSAobWFudWFsIHJ1YnJpYyBncmFkaW5nLCAyLjYpLlxuLy8gICAtIGVzc2F5ICAgICAgICAgICAgXHUyMDE0IGEgbG9uZyBncmFkZWQgcmVzcG9uc2U7IGFkZHMgb3B0aW9uYWwgd29yZC1jb3VudFxuLy8gICAgICAgICAgICAgICAgICAgICAgICBndWlkYW5jZSAoYSB0YXJnZXQgcmFuZ2Ugc2hvd24gYXMgYSBsaXZlIGNvdW50ZXIpLlxuLy8gR3JhZGluZyBpdHNlbGYgbGl2ZXMgaW4gYSBzZXBhcmF0ZSBgZ3JhZGVzYCB0YWJsZSAoUGhhc2UgMi42IGxhdGVyIHNsaWNlcyksXG4vLyBuZXZlciBpbiB0aGUgc3VibWlzc2lvbiBqc29uYiBcdTIwMTQgZ3JhZGVzIGFyZSBtdXRhYmxlLCBzdWJtaXNzaW9ucyBhcmUgbm90LiBUaGVzZVxuLy8gYmxvY2tzIGFyZSBuZXZlciBBVVRPLXNjb3JlZCBieSB0aGUgcnVudGltZS5cbi8vXG4vLyBcdTI2QTAgQU1FTkRFRCAyMDI2LTA4LTIwIChhbnN3ZXIta2V5IHNsaWNlLCBydWxpbmcgRTIgXHUyMDE0IHRoaXMgY29tbWVudCBpcyBhbWVuZGVkXG4vLyBpbiB0aGUgY29tbWl0IHRoYXQgY2hhbmdlcyB3aGF0IGl0IGRlc2NyaWJlcywgUDUpLiBUaGUgbGluZSBhYm92ZSB1c2VkIHRvXG4vLyByZWFkIFwiY2FycnkgTk8gYW5zd2VyIGtleVwiLiBUaGV5IG5vdyBNQVkgY2Fycnkgb25lLCBhbmQgdGhlIGRpc3RpbmN0aW9uIHRoYXRcbi8vIHJlcGxhY2VkIGl0IGlzIHRoZSBsb2FkLWJlYXJpbmcgb25lOlxuLy9cbi8vICAgYW5zd2VyICAgXHUyMDE0IHRoZSBjYW5vbmljYWwgYW5zd2VyIC8gbWFya2luZyBndWlkZS4gVGVhY2hlci1vbmx5IG1hdGVyaWFsLCBvblxuLy8gICAgICAgICAgICAgIEVWRVJZIGNoYW5uZWw6IHRoZSByZWdpc3RyeSBzdHJpcHMgaXQgZnJvbSB0aGUgc2VydmVkIGRvY3VtZW50XG4vLyAgICAgICAgICAgICAgYW5kIG5vdGhpbmcgZXZlciByZXR1cm5zIGl0IHRvIGEgc3R1ZGVudC4gSXQgZXhpc3RzIHNvIHRoZVxuLy8gICAgICAgICAgICAgIHByaW50ZWQgYW5zd2VyIGtleSBoYXMgc29tZXRoaW5nIHRvIHByaW50IChhbmQgc28gdGhlIGZ1dHVyZVxuLy8gICAgICAgICAgICAgIHNjYW4tZ3JhZGluZyBhcmMgaGFzIGEga2V5IHRvIGdyYWRlIGEgcGhvdG8gYWdhaW5zdCkuIEEgYmxvY2tcbi8vICAgICAgICAgICAgICB0aGF0IGlzIG1hbnVhbGx5IGdyYWRlZCBzdGlsbCBIQVMgYSByaWdodCBhbnN3ZXI7IHdoYXQgaXQgbGFja3Ncbi8vICAgICAgICAgICAgICBpcyBhIG1hY2hpbmUgdGhhdCBjYW4gcmVjb2duaXNlIG9uZS5cbi8vICAgc29sdXRpb24gXHUyMDE0IHRoZSBwb3N0LWNoZWNrIGV4cGxhbmF0aW9uLCBpZGVudGljYWwgaW4ga2luZCBhbmQgaW4gcmVsZWFzZVxuLy8gICAgICAgICAgICAgIHJ1bGUgdG8gZXZlcnkgb3RoZXIgYmxvY2sncyBgc29sdXRpb25gOiBzdHJpcHBlZCBmcm9tIHRoZSByZWFkXG4vLyAgICAgICAgICAgICAgcGF0aCwgcmV0dXJuZWQgYnkgdGhlIGNoZWNrIHJlc3BvbnNlIGFmdGVyIHRoZSBzZWN0aW9uIGlzXG4vLyAgICAgICAgICAgICAgY2hlY2tlZCAod2Fsay50cyBjb2xsZWN0cyBpdCBHRU5FUklDQUxMWSwgc28gbm8gZ3JhZGluZy1lbmdpbmVcbi8vICAgICAgICAgICAgICBjb2RlIHdhcyBhZGRlZCBmb3IgdGhpcyksIGFuZCByZXZlYWxlZCBieSB0aGUgY29tcG9uZW50LlxuLy9cbi8vIEJvdGggYXJlIElubGluZU5vZGVbXSBcdTIwMTQgYSB3b3JrZWQgYW5zd2VyIHdhbnRzIGZvcm1hdHRpbmcgYW5kIGlubGluZSBtYXRoLCBhbmRcbi8vIGEgbXVsdGktbGluZSBvbmUgYXJyaXZlcyBmcm9tIHRoZSBpbXBvcnRlciBhcyBoYXJkIGJyZWFrcy4gQm90aCBhcmUgT1BUSU9OQUw6XG4vLyBhbiB1bmFuc3dlcmVkIGZyZWUtcmVzcG9uc2UgYmxvY2sgaXMgc3RpbGwgYSB2YWxpZCBibG9jaywgYW5kIHRoZSBhbnN3ZXIga2V5XG4vLyBwcmludHMgXCJtYW51YWxseSBncmFkZWQgXHUyMDE0IHNlZSBydWJyaWNcIiBmb3IgaXQgKHRoZSBleHRyYWN0b3IncyBmYWxsYmFjayBjaGFpblxuLy8gaXMgYW5zd2VyIFx1MjE5MiBzb2x1dGlvbiBcdTIxOTIgdGhhdCBwaHJhc2U7IHNlZSB2aWV3ZXIvc3JjL2Fuc3dlci1rZXkvZXh0cmFjdC50cykuXG4vL1xuLy8gRTgncyBjb252ZW50aW9uLCByZWNvcmRlZCBiZWNhdXNlIGl0IGlzIE5PVCBzY2hlbWE6IGBhbnN3ZXJgIGNhcnJpZXMgV0hBVCBpc1xuLy8gY29ycmVjdDsgYSBgcnVicmljYCBjYXJyaWVzIEhPVyBNQU5ZIHBvaW50cyAocGVyLWNyaXRlcmlvbiBtYXhQb2ludHMpIHdoZW4gYVxuLy8gcXVlc3Rpb24gaXMgd29ydGggbW9yZSB0aGFuIG9uZTsgbm8gcnVicmljID0gYSAxLXBvaW50IHF1ZXN0aW9uLiBUaGVyZSBpc1xuLy8gZGVsaWJlcmF0ZWx5IG5vIHBvaW50cyBmaWVsZCBoZXJlIFx1MjAxNCB0aGUgZnVsbCBtYXJraW5nIGNvbnRyYWN0IGJlbG9uZ3MgdG9cbi8vIGRvY3MvZGVzaWduL3Bob3RvLWdyYWRpbmcubWQncyBvd24gZGVzaWduIHBhc3MuXG4vL1xuLy8gd29yZENvdW50SGludCAoZXNzYXkgb25seSk6IGFuIG9wdGlvbmFsIHttaW4/LCBtYXg/fSB0YXJnZXQuIFRoZSByZW5kZXJlclxuLy8gc2hvd3MgYSBsaXZlIHdvcmQgY291bnRlcjsgdGhlIGNvdW50IGl0c2VsZiBpcyBjb21wdXRlZC1vbi1yZWFkIChuZXZlciBzdG9yZWRcbi8vIGluIHRoZSB3aXJlIFx1MjAxNCBpdCdzIGRlcml2YWJsZSBmcm9tIHRoZSB0ZXh0KSwgc28gdGhpcyBpcyBkaXNwbGF5IGd1aWRhbmNlIG9ubHkuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyBPbmUgcnVicmljIGNyaXRlcmlvbjogYSBsYWJlbCAoXCJUaGVzaXMgY2xhcml0eVwiKSwgdGhlIHBvaW50cyBpdCdzIHdvcnRoLCBhbmRcbi8vIGFuIG9wdGlvbmFsIGRlc2NyaXB0aW9uIG9mIHdoYXQgZnVsbCBjcmVkaXQgbG9va3MgbGlrZS4gTGV2ZWxlZCBkZXNjcmlwdG9yXG4vLyBncmlkcyAoNC8zLzIvMSBjb2x1bW5zKSBhcmUgYSBmdXR1cmUgQURESVRJVkUgZXh0ZW5zaW9uIG9mIHRoaXMgc2hhcGUuXG5leHBvcnQgY29uc3QgUnVicmljQ3JpdGVyaW9uID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIGxhYmVsOiB6LnN0cmluZygpLm1pbigxKSxcbiAgbWF4UG9pbnRzOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkuZmluaXRlKCksXG4gIGRlc2NyaXB0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFJ1YnJpY0NyaXRlcmlvbiA9IHouaW5mZXI8dHlwZW9mIFJ1YnJpY0NyaXRlcmlvbj47XG5cbi8vIEEgYmxvY2sncyBncmFkaW5nIHJ1YnJpYy4gTGl2ZXMgSU4gdGhlIGRvY3VtZW50IChhdXRob3IgZGVjaXNpb24gMjAyNi0wNy0xMyxcbi8vIGRvY3MvZGVzaWduL21hbnVhbC1ncmFkaW5nLm1kKTogc3VibWlzc2lvbnMgcGluIHRvIGFjdGl2aXR5X3ZlcnNpb25zLCBzbyB0aGVcbi8vIGdyYWRpbmcgVUkgcmVhZHMgdGhlIGV4YWN0IHJ1YnJpYyB0aGUgc3R1ZGVudCB3YXMgYXNzZXNzZWQgYWdhaW5zdCBcdTIwMTQgdmVyc2lvblxuLy8gcGlubmluZyBJUyB0aGUgXCJydWJyaWMgZWRpdHMgYXBwbHkgcHJvc3BlY3RpdmVseVwiIG1lY2hhbmlzbS4gVGhlIHJlbmRlcmVyXG4vLyBuZXZlciBlbWl0cyBpdCAodGVhY2hlci1zaWRlIGRhdGE7IHN0YXlzIG91dCBvZiBzdHVkZW50IEhUTUwpLiBHcmFkZXNcbi8vIHRoZW1zZWx2ZXMgYXJlIG11dGFibGUgYW5kIGxpdmUgaW4gdGhlIGBncmFkZXNgIFRBQkxFLCBrZXllZCBieVxuLy8gKHN1Ym1pc3Npb25faWQsIGJsb2NrX2lkKSArIGNyaXRlcmlvbiBpZC5cbmV4cG9ydCBjb25zdCBSdWJyaWMgPSB6Lm9iamVjdCh7XG4gIGNyaXRlcmlhOiB6LmFycmF5KFJ1YnJpY0NyaXRlcmlvbikubWluKDEpLFxufSk7XG5leHBvcnQgdHlwZSBSdWJyaWMgPSB6LmluZmVyPHR5cGVvZiBSdWJyaWM+O1xuXG4vLyBUaGUgdHdvIHRlYWNoZXItb25seSBhbnN3ZXIgZmllbGRzIGJvdGggYmxvY2tzIGNhcnJ5IChydWxpbmcgRTIgKyBFNCdzXG4vLyBwYXJpdHk6IG9uZSBzY2hlbWEgcm91bmQgZm9yIHRoZSBwYWlyLCBuZXZlciB0d28pLiBEZWNsYXJlZCBvbmNlIGhlcmUgc28gdGhlXG4vLyB0d28gYmxvY2sgc2hhcGVzIGNhbm5vdCBkcmlmdCBhcGFydCBmaWVsZC1ieS1maWVsZC5cbi8vXG4vLyBcdTI2QTAgQk9USCBCTE9DS1MgQUxTTyBDQVJSWSBgbGFiZWxGaWVsZHNgIHNpbmNlIHRoZSB2aWV3ZXItbnVtYmVyaW5nIHNsaWNlXG4vLyAocnVsaW5nIE42KS4gUnVsaW5nIEU3IG1hZGUgdGhlbSBwYWdlLW51bWJlcmVkLCBhbmQgdW50aWwgTjYgdGhleSB3ZXJlIHRoZVxuLy8gb25seSBudW1iZXJlZCB0eXBlcyB3aXRoIG5vIHdheSB0byBvcHQgb3V0IFx1MjAxNCBhIHRlYWNoZXIgY291bGQgbm90IG1hcmsgYVxuLy8gcmVmbGVjdGlvbi1zdHlsZSBzaG9ydCBhbnN3ZXIgYXMgdW5udW1iZXJlZCBldmVuIHRob3VnaCB0aGUgc2NoZW1hIGhhcyBoYWRcbi8vIHRoYXQgdm9jYWJ1bGFyeSAoYXV0byAvIGN1c3RvbSAvIG5vbmUpIHNpbmNlIHRoZSBudW1iZXJpbmctbGFiZWwgZGVjb3VwbGUuXG4vLyBUaGUgZmllbGQgaXMgTk9UIGVub3VnaCBvbiBpdHMgb3duOiBgbGFiZWxgIG9ubHkgc3Vydml2ZXMgYSBzYXZlIGlmIHRoZSB0eXBlXG4vLyBpcyBhbHNvIGluIHNlcmlhbGl6ZS50cydzIExBQkVMRURfQkxPQ0tfVFlQRVMsIGFuZCBvbmx5IHJlYWNoZXMgYW4gYXV0aG9yIGlmXG4vLyBibG9ja0NvbnRyb2xzLnRzIGF0dGFjaGVzIGBudW1iZXJpbmdHcm91cGAuIFNlZSB0aGUgcGxhbidzIGZvdXItbGluayBjaGFpblxuLy8gKGRvY3MvZGVzaWduL3ZpZXdlci1udW1iZXJpbmcubWQsIEQ4KSBcdTIwMTQgbGluayAxIGlzIGhlcmUuXG5jb25zdCBhbnN3ZXJGaWVsZHMgPSB7XG4gIC8qKiBUaGUgY2Fub25pY2FsIGFuc3dlciAvIG1hcmtpbmcgZ3VpZGUuIFRlYWNoZXItb25seSBvbiBldmVyeSBjaGFubmVsLiAqL1xuICBhbnN3ZXI6IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgLyoqIFRoZSBwb3N0LWNoZWNrIGV4cGxhbmF0aW9uIFx1MjAxNCBzYW1lIHJlbGVhc2UgcnVsZSBhcyBldmVyeSBvdGhlciBgc29sdXRpb25gLiAqL1xuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxufTtcblxuZXhwb3J0IGNvbnN0IFNob3J0QW5zd2VyQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdzaG9ydF9hbnN3ZXInKSxcbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICBwbGFjZWhvbGRlcjogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICBydWJyaWM6IFJ1YnJpYy5vcHRpb25hbCgpLFxuICAuLi5hbnN3ZXJGaWVsZHMsXG4gIC4uLmxhYmVsRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBTaG9ydEFuc3dlckJsb2NrID0gei5pbmZlcjx0eXBlb2YgU2hvcnRBbnN3ZXJCbG9jaz47XG5cbmV4cG9ydCBjb25zdCBXb3JkQ291bnRIaW50ID0gelxuICAub2JqZWN0KHtcbiAgICBtaW46IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAgIG1heDogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIH0pXG4gIC8vIEd1YXJkIGFnYWluc3QgYW4gaW52ZXJ0ZWQgcmFuZ2UgKG1pbiA+IG1heCkgXHUyMDE0IGEgbm9uc2Vuc2UgaGludCB0aGUgZWRpdG9yXG4gIC8vIHNob3VsZG4ndCBiZSBhYmxlIHRvIHByb2R1Y2UsIGJ1dCB2YWxpZGF0aW9uIGlzIHRoZSBzY2hlbWEncyBqb2IuXG4gIC5yZWZpbmUoXG4gICAgKGgpID0+IGgubWluID09PSB1bmRlZmluZWQgfHwgaC5tYXggPT09IHVuZGVmaW5lZCB8fCBoLm1pbiA8PSBoLm1heCxcbiAgICB7IG1lc3NhZ2U6ICd3b3JkQ291bnRIaW50Lm1pbiBtdXN0IGJlIFx1MjI2NCBtYXgnIH0sXG4gICk7XG5leHBvcnQgdHlwZSBXb3JkQ291bnRIaW50ID0gei5pbmZlcjx0eXBlb2YgV29yZENvdW50SGludD47XG5cbmV4cG9ydCBjb25zdCBFc3NheUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnZXNzYXknKSxcbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICBwbGFjZWhvbGRlcjogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICB3b3JkQ291bnRIaW50OiBXb3JkQ291bnRIaW50Lm9wdGlvbmFsKCksXG4gIHJ1YnJpYzogUnVicmljLm9wdGlvbmFsKCksXG4gIC4uLmFuc3dlckZpZWxkcyxcbiAgLi4ubGFiZWxGaWVsZHMsXG59KTtcbmV4cG9ydCB0eXBlIEVzc2F5QmxvY2sgPSB6LmluZmVyPHR5cGVvZiBFc3NheUJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IEZpbGxJbkJsYW5rSW5saW5lIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gVGFibGVCbG9jayBcdTIwMTQgYSByZWFsIHRhYmxlLCB3aG9zZSBjZWxscyBjYW4gaG9sZCBibGFua3MuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUGxhbiArIHJ1bGluZ3M6IGRvY3MvZGVzaWduL3RhYmxlLWJsb2NrLm1kIChlbmcgcmV2aWV3IDIwMjYtMDgtMjEpLlxuLy9cbi8vIFdIWSBUSElTIEVYSVNUUyBBVCBBTEwuIFRoZSBgYGBjb2x1bW5zIHdvcmthcm91bmQgUFJJTlRTIHNvbWV0aGluZyB0aGF0IGxvb2tzXG4vLyBsaWtlIGEgdGFibGUgYW5kIGlzIG5vdCBvbmU6IHRoZSBkaXZpZGVyIHJ1bGUgaXMgZHJhd24gcGVyIENPTFVNTixcbi8vIGluZGVwZW5kZW50bHksIHNvIHJvd3MgbGluZSB1cCBvbmx5IHdoaWxlIGV2ZXJ5IGNlbGwgaGFwcGVucyB0byBiZSBvbmUgbGluZVxuLy8gdGFsbC4gR2l2ZSBvbmUgY2VsbCBhIGxhYmVsIHRoYXQgd3JhcHMgYW5kIHRoZSB0d28gY29sdW1ucycgZGl2aWRlcnMgZGVzeW5jLFxuLy8gYmVjYXVzZSB0aGVyZSBpcyBubyByb3cgY29uY2VwdCBpbiB0aGUgRE9NIGhvbGRpbmcgYSByb3cgdG9nZXRoZXIuXG4vL1xuLy8gXHUyNkEwXHUyNkEwIFRIRSBPTkUgUlVMRSBUSEFUIE1BS0VTIFRIRSBXSE9MRSBERVNJR04gV09SSzogYFRhYmxlUm93YCBhbmQgYFRhYmxlQ2VsbGBcbi8vIENBUlJZIE5PIGB0eXBlYCBGSUVMRCwgQU5EIE1VU1QgTkVWRVIgR0FJTiBPTkUuXG4vL1xuLy8gRm91ciBzZXBhcmF0ZSB3YWxrcyBmaW5kIGJsYW5rcyBhbmQgbWF0aCBnYXBzIHN0cnVjdHVyYWxseSwgYXQgYW55IGRlcHRoIFx1MjAxNFxuLy8gdGhlIHNhbml0aXplcidzIGluLWJhbmQgc3RyaXAsIHRoZSBjbGllbnQncyBjaGVjay1wYXlsb2FkIGluZGV4XG4vLyAoY29udGFpbmVyL2Jsb2NrSW5kZXgudHMpLCB0aGUgc2VydmVyJ3MgZ3JhZGluZyBrZXlzXG4vLyAoc2VydmVyL2dyYWRpbmcvd2Fsay50cyksIGFuZCB0aGUgdGVhY2hlcidzIGFuc3dlciBrZXkgKGFuc3dlci1rZXkvZXh0cmFjdCkuXG4vLyBUaHJlZSBvZiB0aGVtIHN0b3AgZGVzY2VuZGluZyBhdCBgbG9va3NMaWtlQmxvY2tBcnJheWAsIHdoaWNoIGZpcmVzIG9uIGFueVxuLy8gYXJyYXkgd2hvc2UgZWxlbWVudHMgQUxMIGNhcnJ5IGJvdGggYSBzdHJpbmcgYGlkYCBhbmQgYSBzdHJpbmcgYHR5cGVgLiBSb3dzXG4vLyBhbmQgY2VsbHMgaGF2ZSBhbiBgaWRgIGFuZCBubyBgdHlwZWAsIHNvIHRob3NlIHdhbGtzIGRlc2NlbmQgaW50byB0aGVtIGFuZCBhXG4vLyBibGFuayBpbiBhIGNlbGwgaXMgZ3JhZGVkLCBjaGVja2VkIGFuZCBrZXllZCB3aXRoIFpFUk8gbmV3IGNvZGUuXG4vL1xuLy8gQWRkIGB0eXBlOiAndGFibGVfcm93J2AgXHUyMDE0IHRoZSBzaGFwZSBhIHNjaGVtYSBhdXRob3IgcmVhY2hlcyBmb3IgYnkgcmVmbGV4IFx1MjAxNFxuLy8gYW5kIHRocmVlIG9mIHRoZSBmb3VyIHdhbGtzIHNraXAgdGhlIGVudGlyZSB0YWJsZS4gVGhlIHNhbml0aXplciBkb2VzIE5PVFxuLy8gc3RvcCBhdCBibG9jayBhcnJheXMsIHNvIG5vdGhpbmcgbGVha3M7IHRoZSBhbnN3ZXIgaXMgc2ltcGx5IG5ldmVyIEdSQURFRC5cbi8vIHdhbGsudHMgY2FsbHMgdGhhdCBcInRoZSB3b3JzdCBraW5kXCIgb2YgZmFpbHVyZTogc3VibWl0dGVkLCBzdG9yZWQsIG5ldmVyXG4vLyBzY29yZWQuIFRoZSBndWFyZCBhZ2FpbnN0IGl0IGlzIGJvdW5kIHRvIHdhbGsgT1VUUFVUIChzZWUgdGhlIHF1YXJ0ZXQgaW5cbi8vIHZpZXdlci90ZXN0cyBhbmQgc2NoZW1hL3Rlc3RzL3RhYmxlLnRlc3QudHMpLCBuZXZlciB0byB0aGlzIGRlY2xhcmF0aW9uLlxuLy9cbi8vIEdSQURBQklMSVRZIElTIERFUklWRUQsIE5PVCBERUNMQVJFRC4gVGhlcmUgaXMgbm8gYGludGVyYWN0aXZlYCBmbGFnOiBhIHRhYmxlXG4vLyBpcyBhIHF1ZXN0aW9uIGV4YWN0bHkgd2hlbiBzb21lIGNlbGwgaG9sZHMgYSBibGFuayAoYGlzR3JhZGVhYmxlYCwgdGhlXG4vLyBtYXRoX2Jsb2NrIHByZWNlZGVudCkuIEEgZmxhZyBjYW4gZHJpZnQgZnJvbSBjb250ZW50IFx1MjAxNCBkZWxldGUgdGhlIGxhc3QgYmxhbmtcbi8vIGFuZCBhIHN0YWxlIGZsYWcgbGVhdmVzIGEgcGhhbnRvbSBudW1iZXJlZCBxdWVzdGlvbiBpbiB0aGUgY2hlY2sgcGF5bG9hZC5cbi8vXG4vLyBOVU1CRVJJTkcgZm9sbG93cyBmYWRlZF93b3JrZWRfZXhhbXBsZTogdGhlIHdob2xlIHRhYmxlIGlzIE9ORSBudW1iZXJlZFxuLy8gcHJvYmxlbSwgYW5kIGl0cyBibGFua3MgYXJlIGxldHRlcmVkIChhKSwgKGIpIFx1MjAyNiBpbiBSRUFESU5HIE9SREVSLiBUaGUgbGV0dGVyc1xuLy8gYXJlIGRlcml2ZWQgZnJvbSBwb3NpdGlvbiBhdCByZW5kZXIgdGltZSBhbmQgbmV2ZXIgc3RvcmVkIChgdGFibGVCbGFua0lkc2AgK1xuLy8gYHN0ZXBMZXR0ZXJgKSwgdGhlIHNhbWUgcnVsZSBmaWxsX2luX2JsYW5rJ3Mgc3ViLXBhcnRzIGFscmVhZHkgZm9sbG93LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFBlci1jb2x1bW4gcHJpbnQvc2NyZWVuIGFsaWdubWVudCwgc3RyYWlnaHQgZnJvbSBhIG1hcmtkb3duIGRlbGltaXRlciByb3cnc1xuICogY29sb25zIChgfC0tLTp8YCBcdTIxOTIgcmlnaHQpLiBSaWdodC1hbGlnbmVkIG51bWJlciBjb2x1bW5zIGFyZSB3aGF0IG1ha2VzIGFcbiAqIHRhYmxlIG9mIGZpZ3VyZXMgcmVhZGFibGUgb24gcGFwZXIsIHdoaWNoIGlzIHdoeSB0aGlzIGlzIGF1dGhvcmVkIGRhdGEgYW5kXG4gKiBub3QgYSBzdHlsZXNoZWV0IGRlY2lzaW9uLiAqL1xuZXhwb3J0IGNvbnN0IFRhYmxlQ29sdW1uQWxpZ24gPSB6LmVudW0oWydsZWZ0JywgJ2NlbnRlcicsICdyaWdodCddKTtcbmV4cG9ydCB0eXBlIFRhYmxlQ29sdW1uQWxpZ24gPSB6LmluZmVyPHR5cGVvZiBUYWJsZUNvbHVtbkFsaWduPjtcblxuLy8gTk8gYHR5cGVgIEZJRUxEIFx1MjAxNCBzZWUgdGhlIGhlYWRlci4gYGlkYCBpcyBmb3Igc3RhYmxlIGFkZHJlc3NpbmcgKFJlYWN0IGtleXMsXG4vLyBlZGl0b3IgaWRlbnRpdHkpOyBpdCBpcyBOT1QgYSByZXNwb25zZSBrZXkuIFRoZSByZXNwb25zZSBrZXlzIGFyZSB0aGUgYmxhbmtcbi8vIGlkcyBJTlNJREUgYGNvbnRlbnRgLCB3aGljaCBpcyB3aGF0IGxldHMgY2VsbCBibGFua3MgcmlkZSB0aGUgZXhpc3Rpbmdcbi8vIFN1Ym1pc3Npb25SZXNwb25zZXMuYmxhbmtzIG1hcCB3aXRoIG5vIHdpcmUtdmVyc2lvbiBidW1wLlxuZXhwb3J0IGNvbnN0IFRhYmxlQ2VsbCA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAvLyBUaGUgc2FtZSBpbmxpbmUgYWxwaGFiZXQgZmlsbF9pbl9ibGFuaydzIGJvZHkgdXNlczogdGV4dCB3aXRoIG1hcmtzLFxuICAvLyBpbmxpbmUgbWF0aCwgaGFyZCBicmVha3MsIGFuZCBibGFuayB0b2tlbnMuIERlbGliZXJhdGVseSBOT1QgYSBibG9jayBhcnJheTpcbiAgLy8gaXQga2VlcHMgZXZlcnkgY2VsbCB3YWxrYWJsZSwga2VlcHMgdGhlIHNjaGVtYSBub24tcmVjdXJzaXZlIChzZWUgdGhlXG4gIC8vIFRTNzA1NiBub3RlIGluIGlubGluZS50cyksIGFuZCBrZWVwcyBhIGNlbGwgYSBjZWxsIHJhdGhlciB0aGFuIGEgcGFnZS5cbiAgY29udGVudDogei5hcnJheShGaWxsSW5CbGFua0lubGluZSkuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCB0eXBlIFRhYmxlQ2VsbCA9IHouaW5mZXI8dHlwZW9mIFRhYmxlQ2VsbD47XG5cbi8vIE5PIGB0eXBlYCBGSUVMRCBcdTIwMTQgc2VlIHRoZSBoZWFkZXIuXG5leHBvcnQgY29uc3QgVGFibGVSb3cgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgY2VsbHM6IHouYXJyYXkoVGFibGVDZWxsKS5kZWZhdWx0KFtdKSxcbn0pO1xuZXhwb3J0IHR5cGUgVGFibGVSb3cgPSB6LmluZmVyPHR5cGVvZiBUYWJsZVJvdz47XG5cbmV4cG9ydCBjb25zdCBUYWJsZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgndGFibGUnKSxcbiAgLy8gQXV0by1hc3NpZ25lZCB3b3Jrc2hlZXQgbnVtYmVyLCBhcyBvbiBldmVyeSBudW1iZXJlZCBibG9jay4gUHJlc2VudCBvbmx5XG4gIC8vIHdoZW4gdGhlIHRhYmxlIGlzIGdyYWRhYmxlIChhIGJsYW5rbGVzcyB0YWJsZSBpcyBhIHN0aW11bHVzLCBub3QgYVxuICAvLyBxdWVzdGlvbikgXHUyMDE0IHJlc29sdmVkIGJ5IG51bWJlcmluZywgbm90IHN0b3JlZCBhdXRob3JpdHkuXG4gIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC8vIFdoaWNoIGF4aXMgY2FycmllcyB0aGUgaGVhZGVycy4gVHdvIGJvb2xlYW5zIHJhdGhlciB0aGFuIGEgcGVyLWNlbGwgZmxhZzpcbiAgLy8gYSBoZWFkZXIgY2VsbCBpbiB0aGUgTUlERExFIG9mIGEgdGFibGUgaXMgbm90IGEgdGhpbmcgdGhpcyB2b2NhYnVsYXJ5XG4gIC8vIHNob3VsZCBiZSBhYmxlIHRvIGV4cHJlc3MsIGFuZCB0aGUgYTExeSBzdG9yeSBuZWVkcyB0byBrbm93IHdoaWNoIGF4aXNcbiAgLy8gbmFtZXMgYSBjZWxsIChcIktpbG9ncmFtcyAyLCBDb3N0XCIgcmVhZHMgY29ycmVjdGx5IG9ubHkgaWYgd2Uga25vdyB3aGVyZSB0aGVcbiAgLy8gbGFiZWxzIGxpdmUpLiBgaGVhZGVyQ29sdW1uYCBpcyBub3QgZGVjb3JhdGlvbiBcdTIwMTQgYWxnZWJyYSB0YWJsZXMgYXJlIGFzXG4gIC8vIG9mdGVuIHRyYW5zcG9zZWQgKHggZG93biB0aGUgbGVmdCkgYXMgbm90LlxuICBoZWFkZXJSb3c6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gIGhlYWRlckNvbHVtbjogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIFBlci1jb2x1bW4gYWxpZ25tZW50LCBpbmRleC1hbGlnbmVkIHdpdGggZWFjaCByb3cncyBjZWxscy4gT3B0aW9uYWwgd2l0aCBOT1xuICAvLyBkZWZhdWx0IHNvIGEgdGFibGUgYXV0aG9yZWQgd2l0aG91dCBhbGlnbm1lbnQgcmUtc2VyaWFsaXplcyBieXRlLWlkZW50aWNhbGx5XG4gIC8vICh0aGUgc2FtZSBvcHRpb25hbC1uby1kZWZhdWx0IGRpc2NpcGxpbmUgYXMgQmxhbmtUb2tlbi5hbnN3ZXJUeXBlKS4gQSBzaG9ydFxuICAvLyBhcnJheSBpcyBmaW5lOiBjb2x1bW5zIHBhc3QgaXRzIGVuZCBmYWxsIGJhY2sgdG8gbGVmdC5cbiAgY29sdW1uQWxpZ25zOiB6LmFycmF5KFRhYmxlQ29sdW1uQWxpZ24pLm9wdGlvbmFsKCksXG4gIC8vIFRoZSAoYSkvKGIpIG1hcmtlcnMgb24gYmxhbmsgY2VsbHMuIE1pcnJvcnMgZmFkZWRfd29ya2VkX2V4YW1wbGUnc1xuICAvLyBzaG93U3RlcExhYmVscyBcdTIwMTQgb2ZmIGdpdmVzIGEgdGVhY2hlciBtYXhpbXVtIHdyaXRpbmcgcm9vbSBvbiBwYXBlci5cbiAgLy8gRGVmYXVsdGVkIHNvIGEgZG9jdW1lbnQgYXV0aG9yZWQgYmVmb3JlIHRoaXMgZmllbGQgcmVuZGVycyBsYWJlbGxlZC5cbiAgc2hvd0NlbGxMYWJlbHM6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gIHJvd3M6IHouYXJyYXkoVGFibGVSb3cpLmRlZmF1bHQoW10pLFxuICAvLyBUaGUgdGFibGUncyBvd24gcGFnZSBsYWJlbCAoYXV0by9jdXN0b20vbm9uZSksIGxpa2UgZXZlcnkgbnVtYmVyZWQgdHlwZS5cbiAgLi4ubGFiZWxGaWVsZHMsXG59KTtcbmV4cG9ydCB0eXBlIFRhYmxlQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBUYWJsZUJsb2NrPjtcblxuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBibG9ja3MvaW5kZXgudHMgXHUyMDE0IEJsb2NrIGRpc2NyaW1pbmF0ZWQgdW5pb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTaW5nbGUgc291cmNlIG9mIHRydXRoIGZvciBcIndoYXQgYmxvY2sgdHlwZXMgZXhpc3QgaW4gUGhhc2UgMS5cIiBBZGRpbmcgYVxuLy8gbmV3IGJsb2NrIHR5cGUgbWVhbnM6IG5ldyBmaWxlIHVuZGVyIGJsb2Nrcy8sIG5ldyBlbnRyeSBoZXJlLCBuZXcgZmFjdG9yeVxuLy8gaW4gZmFjdG9yaWVzLnRzLCBuZXcgcmVuZGVyZXIgaW4gQGFjdGl2aXR5L3JlbmRlcmVyL2Jsb2Nrcy8uIFRocmVlIHBsYWNlcyxcbi8vIGFsd2F5cyBpbiB0aGF0IG9yZGVyLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5cbmltcG9ydCB7IFBhcmFncmFwaEJsb2NrIH0gZnJvbSAnLi9wYXJhZ3JhcGguanMnO1xuaW1wb3J0IHsgSGVhZGluZ0Jsb2NrIH0gZnJvbSAnLi9oZWFkaW5nLmpzJztcbmltcG9ydCB7IE1hdGhCbG9jayB9IGZyb20gJy4vbWF0aC1ibG9jay5qcyc7XG5pbXBvcnQgeyBJbWFnZUJsb2NrLCBDcm9wUmVjdCB9IGZyb20gJy4vaW1hZ2UuanMnO1xuaW1wb3J0IHsgQ2FsbG91dEJsb2NrIH0gZnJvbSAnLi9jYWxsb3V0LmpzJztcbmltcG9ydCB7IFByb2JsZW1CbG9jayB9IGZyb20gJy4vcHJvYmxlbS5qcyc7XG5pbXBvcnQgeyBGaWxsSW5CbGFua0Jsb2NrIH0gZnJvbSAnLi9maWxsLWluLWJsYW5rLmpzJztcbmltcG9ydCB7IEJ1bGxldExpc3RCbG9jaywgT3JkZXJlZExpc3RCbG9jaywgTGlzdEl0ZW0gfSBmcm9tICcuL2xpc3QuanMnO1xuaW1wb3J0IHsgSW50ZXJhY3RpdmVHcmFwaEJsb2NrIH0gZnJvbSAnLi9pbnRlcmFjdGl2ZS1ncmFwaC5qcyc7XG5pbXBvcnQgeyBNdWx0aXBsZUNob2ljZUJsb2NrIH0gZnJvbSAnLi9tdWx0aXBsZS1jaG9pY2UuanMnO1xuaW1wb3J0IHsgTWF0Y2hpbmdCbG9jayB9IGZyb20gJy4vbWF0Y2hpbmcuanMnO1xuaW1wb3J0IHsgT3JkZXJpbmdCbG9jayB9IGZyb20gJy4vb3JkZXJpbmcuanMnO1xuaW1wb3J0IHsgTnVtYmVyTGluZUJsb2NrIH0gZnJvbSAnLi9udW1iZXItbGluZS5qcyc7XG5pbXBvcnQgeyBEYXRhUGxvdEJsb2NrIH0gZnJvbSAnLi9kYXRhLXBsb3QuanMnO1xuaW1wb3J0IHsgTGVhcm5pbmdPYmplY3RpdmVzQmxvY2sgfSBmcm9tICcuL2xlYXJuaW5nLW9iamVjdGl2ZXMuanMnO1xuaW1wb3J0IHsgV29ya2VkRXhhbXBsZUJsb2NrIH0gZnJvbSAnLi93b3JrZWQtZXhhbXBsZS5qcyc7XG5pbXBvcnQgeyBHcmFwaEZpZ3VyZUJsb2NrIH0gZnJvbSAnLi9ncmFwaC1maWd1cmUuanMnO1xuaW1wb3J0IHsgRmFkZWRXb3JrZWRFeGFtcGxlQmxvY2sgfSBmcm9tICcuL2ZhZGVkLXdvcmtlZC1leGFtcGxlLmpzJztcbmltcG9ydCB7IFNlbGZFeHBsYW5hdGlvbkJsb2NrIH0gZnJvbSAnLi9zZWxmLWV4cGxhbmF0aW9uLmpzJztcbmltcG9ydCB7IFNob3J0QW5zd2VyQmxvY2ssIEVzc2F5QmxvY2sgfSBmcm9tICcuL2ZyZWUtcmVzcG9uc2UuanMnO1xuaW1wb3J0IHsgVGFibGVCbG9jayB9IGZyb20gJy4vdGFibGUuanMnO1xuXG5leHBvcnQgY29uc3QgQmxvY2sgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgUGFyYWdyYXBoQmxvY2ssXG4gIEhlYWRpbmdCbG9jayxcbiAgTWF0aEJsb2NrLFxuICBJbWFnZUJsb2NrLFxuICBDYWxsb3V0QmxvY2ssXG4gIFByb2JsZW1CbG9jayxcbiAgRmlsbEluQmxhbmtCbG9jayxcbiAgQnVsbGV0TGlzdEJsb2NrLFxuICBPcmRlcmVkTGlzdEJsb2NrLFxuICBJbnRlcmFjdGl2ZUdyYXBoQmxvY2ssXG4gIE11bHRpcGxlQ2hvaWNlQmxvY2ssXG4gIE1hdGNoaW5nQmxvY2ssXG4gIE9yZGVyaW5nQmxvY2ssXG4gIE51bWJlckxpbmVCbG9jayxcbiAgRGF0YVBsb3RCbG9jayxcbiAgTGVhcm5pbmdPYmplY3RpdmVzQmxvY2ssXG4gIFdvcmtlZEV4YW1wbGVCbG9jayxcbiAgRmFkZWRXb3JrZWRFeGFtcGxlQmxvY2ssXG4gIFNlbGZFeHBsYW5hdGlvbkJsb2NrLFxuICBTaG9ydEFuc3dlckJsb2NrLFxuICBFc3NheUJsb2NrLFxuICBHcmFwaEZpZ3VyZUJsb2NrLFxuICBUYWJsZUJsb2NrLFxuXSk7XG5leHBvcnQgdHlwZSBCbG9jayA9IHouaW5mZXI8dHlwZW9mIEJsb2NrPjtcblxuLy8gTk9URTogbGF5b3V0IGlzIE5PVCBhIGJsb2NrLiBSb3dzL0NvbHVtbnMgKHBhY2thZ2VzL3NjaGVtYS9zcmMvbGF5b3V0LnRzKSBhcmVcbi8vIHRoZSBzdHJ1Y3R1cmFsIGNvbnRhaW5lciBBQk9WRSBibG9ja3MgXHUyMDE0IGEgQ29sdW1uIGhvbGRzIEJsb2NrW10sIG5ldmVyIHRoZVxuLy8gcmV2ZXJzZSBcdTIwMTQgc28gdGhlIEJsb2NrIHVuaW9uIGlzIGxlYWYgYmxvY2tzIG9ubHkgYW5kIGNhbiBuZXZlciBuZXN0IGEgcm93LlxuXG4vLyBSZS1leHBvcnQgaW5kaXZpZHVhbCBibG9jayB0eXBlcyBzbyBjb25zdW1lcnMgY2FuIGltcG9ydCB0aGVtIGJ5IG5hbWUuXG5leHBvcnQge1xuICBQYXJhZ3JhcGhCbG9jayxcbiAgSGVhZGluZ0Jsb2NrLFxuICBNYXRoQmxvY2ssXG4gIEltYWdlQmxvY2ssXG4gIENyb3BSZWN0LFxuICBDYWxsb3V0QmxvY2ssXG4gIFByb2JsZW1CbG9jayxcbiAgRmlsbEluQmxhbmtCbG9jayxcbiAgQnVsbGV0TGlzdEJsb2NrLFxuICBPcmRlcmVkTGlzdEJsb2NrLFxuICBMaXN0SXRlbSxcbiAgSW50ZXJhY3RpdmVHcmFwaEJsb2NrLFxufTtcbmV4cG9ydCB7XG4gIE11bHRpcGxlQ2hvaWNlQmxvY2ssXG4gIE11bHRpcGxlQ2hvaWNlT3B0aW9uLFxuICBDaG9pY2VJbWFnZSxcbiAgQ2hvaWNlR3JhcGgsXG59IGZyb20gJy4vbXVsdGlwbGUtY2hvaWNlLmpzJztcbmV4cG9ydCB7IE1hdGNoaW5nQmxvY2ssIE1hdGNoaW5nSXRlbSwgTWF0Y2hpbmdUYXJnZXQgfSBmcm9tICcuL21hdGNoaW5nLmpzJztcbmV4cG9ydCB7IE9yZGVyaW5nQmxvY2ssIE9yZGVyaW5nSXRlbSB9IGZyb20gJy4vb3JkZXJpbmcuanMnO1xuZXhwb3J0IHtcbiAgTnVtYmVyTGluZUJsb2NrLFxuICBOdW1iZXJMaW5lQ29uZmlnLFxuICBOdW1iZXJMaW5lSW50ZXJhY3Rpb24sXG4gIE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uLFxuICBOdW1iZXJMaW5lSW50ZXJ2YWxJbnRlcmFjdGlvbixcbiAgTnVtYmVyTGluZUludGVydmFsLFxufSBmcm9tICcuL251bWJlci1saW5lLmpzJztcbmV4cG9ydCB7XG4gIERhdGFQbG90QmxvY2ssXG4gIERhdGFQbG90Q29uZmlnLFxuICBEYXRhUGxvdENoYXJ0LFxuICBEYXRhUGxvdEludGVyYWN0aW9uLFxuICBEYXRhUGxvdERpc3BsYXlJbnRlcmFjdGlvbixcbiAgRGF0YVBsb3REb3RwbG90SW50ZXJhY3Rpb24sXG4gIERhdGFQbG90SGlzdG9ncmFtSW50ZXJhY3Rpb24sXG4gIERhdGFQbG90Qm94cGxvdEludGVyYWN0aW9uLFxufSBmcm9tICcuL2RhdGEtcGxvdC5qcyc7XG5leHBvcnQgeyBMZWFybmluZ09iamVjdGl2ZXNCbG9jayB9IGZyb20gJy4vbGVhcm5pbmctb2JqZWN0aXZlcy5qcyc7XG5leHBvcnQgeyBXb3JrZWRFeGFtcGxlQmxvY2ssIFdvcmtlZEV4YW1wbGVDaGlsZCB9IGZyb20gJy4vd29ya2VkLWV4YW1wbGUuanMnO1xuZXhwb3J0IHsgR3JhcGhGaWd1cmVCbG9jayB9IGZyb20gJy4vZ3JhcGgtZmlndXJlLmpzJztcbmV4cG9ydCB7XG4gIEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrLFxuICBGYWRlZFdvcmtlZEV4YW1wbGVDaGlsZCxcbn0gZnJvbSAnLi9mYWRlZC13b3JrZWQtZXhhbXBsZS5qcyc7XG5leHBvcnQgeyBTZWxmRXhwbGFuYXRpb25CbG9jayB9IGZyb20gJy4vc2VsZi1leHBsYW5hdGlvbi5qcyc7XG5leHBvcnQge1xuICBTaG9ydEFuc3dlckJsb2NrLFxuICBFc3NheUJsb2NrLFxuICBXb3JkQ291bnRIaW50LFxuICBSdWJyaWMsXG4gIFJ1YnJpY0NyaXRlcmlvbixcbn0gZnJvbSAnLi9mcmVlLXJlc3BvbnNlLmpzJztcbmV4cG9ydCB7XG4gIFRhYmxlQmxvY2ssXG4gIFRhYmxlUm93LFxuICBUYWJsZUNlbGwsXG4gIFRhYmxlQ29sdW1uQWxpZ24sXG59IGZyb20gJy4vdGFibGUuanMnO1xuLy8gRnJvbSB0aGUgem9kLWZyZWUgbW9kdWxlLCBOT1QgJy4vdGFibGUuanMnIFx1MjAxNCBzZWUgdGFibGUtYmxhbmstaWRzLnRzLiBSb3V0aW5nXG4vLyBpdCB0aHJvdWdoIHRoZSBzY2hlbWEgbW9kdWxlIHdvdWxkIHB1dCB6b2QgYmFjayBpbiB0aGUgc3R1ZGVudCBzaGVsbCBmb3Jcbi8vIGFueW9uZSB3aG8gcmVhY2hlcyB0aGlzIGJhcnJlbC5cbmV4cG9ydCB7IHRhYmxlQmxhbmtJZHMgfSBmcm9tICcuLi90YWJsZS1ibGFuay1pZHMuanMnO1xuZXhwb3J0IHR5cGUgeyBUYWJsZUJsYW5rU291cmNlIH0gZnJvbSAnLi4vdGFibGUtYmxhbmstaWRzLmpzJztcbmV4cG9ydCB7XG4gIEF4aXNDb25maWcsXG4gIFBvaW50SW50ZXJhY3Rpb24sXG4gIEZ1bmN0aW9uSW50ZXJhY3Rpb24sXG4gIEZ1bmN0aW9uTW9kZWwsXG4gIFJlZ2lvbkludGVyYWN0aW9uLFxuICBSYXlJbnRlcmFjdGlvbixcbiAgUmF5QW5zd2VyLFxuICBTZWdtZW50SW50ZXJhY3Rpb24sXG4gIFNlZ21lbnRBbnN3ZXIsXG4gIEVuZHBvaW50U3R5bGUsXG4gIERyYXdhYmxlLFxuICBEcmF3YWJsZUNvbG9yLFxuICBEaXNwbGF5SW50ZXJhY3Rpb24sXG4gIEdyYXBoSW50ZXJhY3Rpb24sXG59IGZyb20gJy4vaW50ZXJhY3RpdmUtZ3JhcGguanMnO1xuZXhwb3J0IHR5cGUgeyBIZWFkaW5nTGV2ZWwgfSBmcm9tICcuL2hlYWRpbmcuanMnO1xuZXhwb3J0IHR5cGUgeyBDYWxsb3V0VmFyaWFudCB9IGZyb20gJy4vY2FsbG91dC5qcyc7XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGxheW91dC50cyBcdTIwMTQgU3RydWN0dXJhbCBsYXlvdXQgbGF5ZXI6IFJvdyArIENvbHVtblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBkb2N1bWVudCBib2R5IGlzIGEgc3RhY2sgb2YgUk9XUy4gQSByb3cgbGF5cyBpdHMgY2hpbGQgY29sdW1ucyBzaWRlIGJ5XG4vLyBzaWRlOyBlYWNoIGNvbHVtbiBob2xkcyBpdHMgb3duIFNUQUNLIG9mIGJsb2NrcyAoYmxvY2srKS4gT25lIGNvbHVtbiBpcyB0aGVcbi8vIGlkZW50aXR5L2RlZmF1bHQgXHUyMDE0IGEgMS1jb2x1bW4gcm93IGlzIHRoZSBub3JtYWwgZnVsbC13aWR0aCB2ZXJ0aWNhbCBmbG93LCBhbmRcbi8vIFwiYWRkIGNvbHVtbnNcIiBzcGxpdHMgYSByb3cgaW50byBtb3JlIGNvbHVtbnMuIFRoaXMgcmVwbGFjZXMgdGhlIG9sZCBgY29sdW1uc2Bcbi8vIGJsb2NrIHR5cGU6IGxheW91dCBpcyBub3cgdGhlIHVuaXZlcnNhbCBjb250YWluZXIgaW5zdGVhZCBvZiBhbiBpbnNlcnRlZFxuLy8gYmxvY2ssIHdoaWNoIGlzIGhvdyBxdWFsaXR5IHByaW50IGVuZ2luZXMgKEluRGVzaWduLCBwcmludCBDU1MpIGFuZCB3ZWJcbi8vIGxheW91dCB0b29scyBtb2RlbCBhIGRvY3VtZW50LlxuLy9cbi8vIE5vIHJlY3Vyc2lvbjogYHJvd2AgYW5kIGBjb2x1bW5gIGFyZSBOT1QgbWVtYmVycyBvZiB0aGUgQmxvY2sgdW5pb24gKEJsb2NrIGlzXG4vLyBsZWFmIGJsb2NrcyBvbmx5KSwgc28gYSBDb2x1bW4ncyBgYmxvY2tzOiBCbG9ja1tdYCBjYW4gbmV2ZXIgY29udGFpbiBhIFJvdy5cbi8vIFRoZSBvbGQgY29sdW1ucy1pbi1jb2x1bW5zIGd1YXJkIChhbiBlbnVtZXJhdGVkIGNlbGwgdW5pb24pIGlzIHRoZXJlZm9yZSBhXG4vLyBzdHJ1Y3R1cmFsIGZhY3QgaGVyZSwgbm90IGFuIGVuZm9yY2VkIGV4Y2x1c2lvbi5cbi8vXG4vLyB3aWR0aCBpcyBhbiBvcHRpb25hbCB1bml0bGVzcyB3ZWlnaHQgcGVyIGNvbHVtbjogYSBjb2x1bW4gd2l0aCB3aWR0aCAyIGJlc2lkZVxuLy8gYSBjb2x1bW4gd2l0aCB3aWR0aCAxIHRha2VzIDIvMyBvZiB0aGUgcm93LiBBYnNlbnQgXHUyMTkyIGVxdWFsIHNwbGl0LiBUaGlzIGlzIHRoZVxuLy8gcmVhc29uIGxheW91dCBpcyBzdHJ1Y3R1cmFsIHJhdGhlciB0aGFuIGEgQ1NTIHRvZ2dsZSBcdTIwMTQgXCJ3aWRlIHdvcmtlZCBleGFtcGxlICtcbi8vIG5hcnJvdyBhbnN3ZXIgc3RyaXBcIiBuZWVkcyB1bmVxdWFsIHdpZHRocy5cbi8vXG4vLyBtaW5IZWlnaHQgaXMgYSByZXNlcnZlZCB3b3JrLXNwYWNlIGZsb29yIGluIHJlbS4gVGhlIGNlbGwgc3RpbGwgR1JPV1Mgd2l0aFxuLy8gY29udGVudCAoYSBmbG9vciwgbm90IGEgZml4ZWQgaGVpZ2h0IFx1MjAxNCBmaXhlZCBoZWlnaHRzIGJyZWFrIHByaW50IHJlZmxvdyBhbmRcbi8vIHRoZSBmb2xkYWJsZSdzIGhlaWdodCBtZWFzdXJlbWVudCkuIHJlbSBzbyB0aGUgcmVzZXJ2ZWQgc3BhY2Ugc2NhbGVzIHdpdGggdGhlXG4vLyBwcmludCBmb250LXNpemUgY29uZmlnLiBBYnNlbnQgPSBjb250ZW50LWRldGVybWluZWQgaGVpZ2h0LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5cbmltcG9ydCB7IEJsb2NrIH0gZnJvbSAnLi9ibG9ja3MvaW5kZXguanMnO1xuXG4vLyBncmlkTGluZXMgdHVybnMgYSByb3cgaW50byBhIHJ1bGVkIGdyaWQ6IGEgYm9yZGVyIGFyb3VuZCB0aGUgd2hvbGUgcm93LCBydWxlc1xuLy8gYmV0d2VlbiB0aGUgY2VsbHMsIGFuZCBydWxlcyBiZXR3ZWVuIHRoZSBzdGFja2VkIGJsb2NrcyB3aXRoaW4gYSBjZWxsLlxuLy8gRXNwZWNpYWxseSB1c2VmdWwgaW4gcHJpbnQgKGJveGVkIHJlZ2lvbnMgdG8gd3JpdGUgaW4gLyBjdXQgb3V0KS4gVHJpLXN0YXRlIHNvXG4vLyBhIHJvdyBjYW4gZGVmZXIgdG8gdGhlIGFjdGl2aXR5LXdpZGUgZGVmYXVsdDpcbi8vICAgJ2luaGVyaXQnIFx1MjAxNCBmb2xsb3cgbWV0YS5wcmludC5ncmlkTGluZXMgKHRoZSBhY3Rpdml0eSBkZWZhdWx0OyB0aGUgcmVuZGVyZXJcbi8vICAgICAgICAgICAgICAgcmVzb2x2ZXMgdGhpcykuIERlZmF1bHQsIHNvIGEgZnJlc2hseSBhdXRob3JlZCByb3cgdHJhY2tzIHRoZVxuLy8gICAgICAgICAgICAgICBhY3Rpdml0eSBzZXR0aW5nIHdpdGhvdXQgcGVyLXJvdyBmaWRkbGluZy5cbi8vICAgJ29uJyAgICAgIFx1MjAxNCBhbHdheXMgcnVsZWQsIHJlZ2FyZGxlc3Mgb2YgdGhlIGFjdGl2aXR5IGRlZmF1bHQuXG4vLyAgICdvZmYnICAgICBcdTIwMTQgbmV2ZXIgcnVsZWQsIHJlZ2FyZGxlc3Mgb2YgdGhlIGFjdGl2aXR5IGRlZmF1bHQuXG5leHBvcnQgY29uc3QgQ29sdW1uR3JpZExpbmVzID0gei5lbnVtKFsnaW5oZXJpdCcsICdvbicsICdvZmYnXSk7XG5leHBvcnQgdHlwZSBDb2x1bW5HcmlkTGluZXMgPSB6LmluZmVyPHR5cGVvZiBDb2x1bW5HcmlkTGluZXM+O1xuXG5leHBvcnQgY29uc3QgQ29sdW1uID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIC8vIFBlci1jb2x1bW4gd2lkdGggd2VpZ2h0IChmciB1bml0cykuIE9wdGlvbmFsOyBhYnNlbnQgPSBlcXVhbCBzcGxpdC5cbiAgd2lkdGg6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAvLyBSZXNlcnZlZCB3b3JrLXNwYWNlIGZsb29yIGluIHJlbSAoYSBtaW4taGVpZ2h0LCBub3QgYSBmaXhlZCBoZWlnaHQpLlxuICBtaW5IZWlnaHQ6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAvLyBBIGNvbHVtbiBob2xkcyBhIG5vbi1lbXB0eSBTVEFDSyBvZiBibG9ja3MgKGJsb2NrKykuIEEgY29sdW1uIGNhbiBob2xkIGFcbiAgLy8gaGVhZGluZyBmb2xsb3dlZCBieSBzZXZlcmFsIHByb2JsZW1zIFx1MjAxNCB0aGUgdGhpbmcgYSBkb2N1bWVudCB0b29sIG5lZWRzIGFuZFxuICAvLyBhIG9uZS1ibG9jay1wZXItcm93IG1vZGVsIGNhbid0IGV4cHJlc3MuXG4gIGJsb2Nrczogei5hcnJheShCbG9jaykubWluKDEpLFxufSk7XG5leHBvcnQgdHlwZSBDb2x1bW4gPSB6LmluZmVyPHR5cGVvZiBDb2x1bW4+O1xuXG4vLyAxLi42IGNvbHVtbnMuIFRoZSBlZGl0b3Igc3VyZmFjZXMgYSBub24tYmxvY2tpbmcgd2FybmluZyBhYm92ZSAzICh0b28gbmFycm93XG4vLyB0byByZWFkIG9uIHBhcGVyIG9yIGEgQ2hyb21lYm9vayksIGJ1dCB0aGUgc2NoZW1hIGFjY2VwdHMgdXAgdG8gNiBzbyBhblxuLy8gaW50ZW50aW9uYWwgZGVuc2UgbGF5b3V0IHN0aWxsIHZhbGlkYXRlcy4gT25lIGNvbHVtbiBpcyB0aGUgaWRlbnRpdHkgc3RhdGU6XG4vLyBhIGZ1bGwtd2lkdGggcm93IHRoYXQgXCJyZW1vdmUgY29sdW1uXCIgY2Fubm90IGRpc3NvbHZlIGJlbG93LlxuZXhwb3J0IGNvbnN0IFJvdyA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICBjb2x1bW5zOiB6LmFycmF5KENvbHVtbikubWluKDEpLm1heCg2KSxcbiAgZ3JpZExpbmVzOiBDb2x1bW5HcmlkTGluZXMuZGVmYXVsdCgnaW5oZXJpdCcpLFxufSk7XG5leHBvcnQgdHlwZSBSb3cgPSB6LmluZmVyPHR5cGVvZiBSb3c+O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBkb2N1bWVudC50cyBcdTIwMTQgVG9wLWxldmVsIEFjdGl2aXR5RG9jdW1lbnQgYW5kIFNlY3Rpb24gc2NoZW1hc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEFjdGl2aXR5RG9jdW1lbnQgaXMgd2hhdCBnZXRzIHN0b3JlZCBpbiBhY3Rpdml0aWVzLmRyYWZ0X2NvbnRlbnQgYW5kXG4vLyBhY3Rpdml0eV92ZXJzaW9ucy5jb250ZW50LiBUaGUgc2hhcGUgbGl2ZXMgaW4gdGhpcyBwYWNrYWdlIGFzIHRoZSBzaW5nbGVcbi8vIHNvdXJjZSBvZiB0cnV0aCBcdTIwMTQgdGhlIHJlbmRlcmVyIHBhcnNlcyBpdCwgdGhlIGVkaXRvciBwcm9kdWNlcyBpdCB2aWEgdGhlXG4vLyBzZXJpYWxpemUgbGF5ZXIsIHRoZSBkYXRhYmFzZSBzdG9yZXMgaXQgYXMganNvbmIuXG4vL1xuLy8gc2NoZW1hVmVyc2lvbiBpcyB0aGUgbWlncmF0aW9uIGFuY2hvci4gSXQgaXMgY3VycmVudGx5IDIuIFRoZSAxXHUyMTkyMiByZXNoYXBlXG4vLyAoYmxvY2stc3RyZWFtIHNlY3Rpb25zIFx1MjE5MiByb3dzLW9mLWNvbHVtbnMpIHdhcyBhIEdSRUVORklFTEQgSEFSRC1DVVQ6IHRoZXJlIHdhc1xuLy8gbm8gcHJvZHVjdGlvbiBkYXRhIHRvIHByZXNlcnZlLCBzbyB0aGVyZSBpcyBkZWxpYmVyYXRlbHkgTk8gbWlncmF0ZSgxXHUyMTkyMikgYW5kXG4vLyBOTyBtaWdyYXRlLW9uLXJlYWQgXHUyMDE0IHRoZSBwYXJzZXIgaXMgei5saXRlcmFsKDIpIGFuZCBSRUpFQ1RTIGEgdjEgZG9jdW1lbnRcbi8vIChhIHN0cmF5IHYxIGZhaWxzIGxvdWRseSBhdCBwYXJzZSByYXRoZXIgdGhhbiBtaXMtcGFyc2luZyBpbnRvIGdhcmJhZ2UpLlxuLy8gV2hlbiBhIEZVVFVSRSBzY2hlbWEgbmVlZHMgYSBub24tdHJpdmlhbCBtaWdyYXRpb24gYWdhaW5zdCByZWFsIHN0b3JlZCBkYXRhLFxuLy8gYnVtcCB0aGUgdmVyc2lvbiBhbmQgYWRkIGEgbWlncmF0ZShOIC0+IE4rMSkgdGhhdCBydW5zIG9uIHJlYWQgKG9sZFxuLy8gYWN0aXZpdHlfdmVyc2lvbnMgcm93cyBzdGF5IGF0IHRoZWlyIG9yaWdpbmFsIHNjaGVtYVZlcnNpb24gZm9yZXZlcjsgbWlncmF0ZVxuLy8gb24gcmVhZCwgbmV2ZXIgYnkgbXV0YXRpbmcgc3RvcmVkIHZlcnNpb25zKS4gVGhlIGdyZWVuZmllbGQgaGFyZC1jdXQgaXMgYVxuLy8gb25lLXRpbWUgZXhjZXB0aW9uLCBub3QgdGhlIGdlbmVyYWwgcG9saWN5LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBCbG9jayB9IGZyb20gJy4vYmxvY2tzL2luZGV4LmpzJztcbmltcG9ydCB7IFJvdyB9IGZyb20gJy4vbGF5b3V0LmpzJztcblxuLy8gU2VjdGlvbjogYSBjb2xsZWN0aW9uIG9mIFJPV1Mgd2l0aCBhbiBvcHRpb25hbCB0aXRsZS4gU2VjdGlvbnMgYXJlIHRoZVxuLy8gdmVydGljYWwgY2hlY2twb2ludCBwcmltaXRpdmU7IHJvd3MgYXJlIHRoZSBob3Jpem9udGFsLXNwbGl0IHByaW1pdGl2ZVxuLy8gKGxheW91dC50cykuIEEgc2VjdGlvbiBpcyB1c3VhbGx5IG9uZSAxLWNvbHVtbiByb3cgd2hvc2UgY29sdW1uIHN0YWNrcyBtYW55XG4vLyBibG9ja3M7IGEgY29sdW1uZWQgcmVnaW9uIGlzIGEgbXVsdGktY29sdW1uIHJvdy4gU2VjdGlvbnMgYXJlIG9yZ2FuaXphdGlvbmFsXG4vLyBvbmx5IFx1MjAxNCB0aGV5IGRvbid0IGNvbnN0cmFpbiBjb250ZW50IGJleW9uZCBob2xkaW5nIHJvd3MuXG4vL1xuLy8gaXNDaGVja3BvaW50IGlzIHRoZSBge2NoZWNrcG9pbnR9YCBtYXJrZXIsIGFuZCBpdCBpcyB3aGVyZSBDSEVDS0lORyBIQVBQRU5TXG4vLyAoYWN0aXZpdHkgZmxvdyBtb2RlcywgUjEpLiBBIGNoZWNrcG9pbnQgc2VjdGlvbidzIENoZWNrIGNvdmVycyBFVkVSWSBTRUNUSU9OXG4vLyBTSU5DRSBUSEUgUFJFVklPVVMgQ0hFQ0tQT0lOVCwgaW5jbHVzaXZlIFx1MjAxNCBub3QganVzdCBpdHNlbGYgXHUyMDE0IGFuZCBUSEUgRU5EIE9GXG4vLyBUSEUgQUNUSVZJVFkgSVMgQUxXQVlTIEEgQ0hFQ0tQT0lOVCwgc28gbm8gdHJhaWxpbmcgc2VjdGlvbiBpcyBldmVyIGxlZnRcbi8vIHVuLWNoZWNrYWJsZSBhbmQgYSBkb2N1bWVudCB3aXRoIG5vIG1hcmtlciBhdCBhbGwgZGVncmFkZXMgdG8gZXhhY3RseSBvbmVcbi8vIENoZWNrIGF0IHRoZSBlbmQuIElnbm9yZWQgZW50aXJlbHkgd2hlbiBzdWJtaXNzaW9uTW9kZSBpcyAnc2luZ2xlJy5cbi8vXG4vLyBUaGUgZm9sZCB0aGF0IHR1cm5zIHRoZXNlIGludG8gY2hlY2sgZ3JvdXBzIGlzXG4vLyBwYWNrYWdlcy92aWV3ZXIvc3JjL2NvbnRhaW5lci9jaGVja0dyb3Vwcy50czsgdGhlIGd1YXJkIHRoYXQgYmluZHMgaXQgdG9cbi8vIHJlbmRlcmVkIG91dHB1dCBpcyB0ZXN0cy9jb21wb25lbnRzL2NoZWNrLWdyb3Vwcy50ZXN0LnRzeCAoYSBDaGVjayBidXR0b25cbi8vIGV4aXN0cyBpbiB0aGUgRE9NIGZvciBldmVyeSBzZWN0aW9uLCBpbiBldmVyeSBtb2RlKS5cbmV4cG9ydCBjb25zdCBTZWN0aW9uID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQ2hlY2twb2ludDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd3M6IHouYXJyYXkoUm93KSxcbn0pO1xuZXhwb3J0IHR5cGUgU2VjdGlvbiA9IHouaW5mZXI8dHlwZW9mIFNlY3Rpb24+O1xuXG4vLyBNZXRhOiB0aGUgYWN0aXZpdHkncyB0aXRsZSwgY291cnNlLCB1bml0LCBldGMuIE5vdCB1c2VkIGluIHJlbmRlcmluZyBvZlxuLy8gdGhlIGJvZHkgXHUyMDE0IGRyaXZlcyB0aGUgcHVibGlzaGVkIEhUTUwncyA8dGl0bGU+IGFuZCBoZWFkZXIgYmFubmVyLlxuLy9cbi8vIHN1Ym1pc3Npb25Nb2RlIGNvbnRyb2xzIHRoZSBzdHVkZW50LWZhY2luZyBmbG93LiBUd28gcmVhbCBiZWhhdmlvdXJzIGFuZCBvbmVcbi8vIGF1dGhvcmluZyBjb252ZW5pZW5jZSAoYWN0aXZpdHkgZmxvdyBtb2RlcywgUjIpOlxuLy8gICAnZnJlZScgICAoZGVmYXVsdCkgXHUyMDE0IGNoZWNrcG9pbnRzIHBlciBSMTsgYSBncm91cCBtYXkgYmUgcmUtY2hlY2tlZCBmcmVlbHlcbi8vICAgJ2xvY2tlZCcgXHUyMDE0IGNoZWNrcG9pbnRzIHBlciBSMTsgYSBncm91cCdzIGlucHV0cyBGUkVFWkUgdGhlIG1vbWVudCBpdHNcbi8vICAgICAgICAgICAgICBjaGVjayBpcyBwcmVzc2VkLCBhbmQgdGhlIFNFUlZFUiByZWZ1c2VzIGEgc2Vjb25kIGNoZWNrIGZvciBhXG4vLyAgICAgICAgICAgICAgc2VjdGlvbiB0aGF0IGFscmVhZHkgaGFzIG9uZSAocmVjb3JkX2NoZWNrJ3MgcF9sb2NrZWQsIDAwNDAgXHUyMDE0XG4vLyAgICAgICAgICAgICAgZGVyaXZlZCBmcm9tIFRISVMgZmllbGQsIG5ldmVyIGZyb20gYW55dGhpbmcgdGhlIGNsaWVudCBzZW5kcykuXG4vLyAgICAgICAgICAgICAgXHUyNkEwIFRoZXJlIGlzIG5vIHVubG9jayBpbiB2MTogbm90IGZvciB0aGUgc3R1ZGVudCwgbm90IGZvciB0aGVcbi8vICAgICAgICAgICAgICB0ZWFjaGVyLiBBIHJlcHVibGlzaCBtaW50cyBhIG5ldyB2ZXJzaW9uIGFuZCByZXNldHMgZXZlcnlvbmUsXG4vLyAgICAgICAgICAgICAgYW5kIHRoYXQgaXMgdGhlIG9ubHkgdW5sb2NrIHRoZXJlIGlzLlxuLy8gICAnc2luZ2xlJyBcdTIwMTQgbm8gbWlkLWFjdGl2aXR5IGNoZWNrcG9pbnRzOyB0aGUgZW5kLW9mLWFjdGl2aXR5IENoZWNrIGlzIHRoZVxuLy8gICAgICAgICAgICAgIG9ubHkgb25lLiBSZWR1bmRhbnQgd2l0aCAnZnJlZScgKyBubyBtYXJrZXJzIHVuZGVyIFIxLCBhbmQga2VwdFxuLy8gICAgICAgICAgICAgIGJlY2F1c2UgaXQgc2F5cyB0aGUgaW50ZW50IHBsYWlubHkgYXQgYXV0aG9yaW5nIHRpbWUuXG4vL1xuLy8gYWN0aXZpdHlUeXBlIGlzIGEgTEFCRUwgKFI1KTogaXQgcmVuZGVycyBhcyB0ZXh0IGJlc2lkZSBjb3Vyc2UvdW5pdCwgb25cbi8vIHNjcmVlbiBhbmQgb24gcGFwZXIgXHUyMDE0IFwiRXhpdCB0aWNrZXRcIiAvIFwiV2FybS11cFwiIC8gXCJSZXZpZXdcIjsgJ3dvcmtzaGVldCcgaXNcbi8vIHRoZSB1bm1hcmtlZCBkZWZhdWx0IGFuZCByZW5kZXJzIG5vdGhpbmcuIEl0IGRyaXZlcyBubyBsYXlvdXQuIEl0IHVzZWQgdG9cbi8vIGNsYWltIGl0IGRpZCAoXCJhbiBleGl0X3RpY2tldCByZW5kZXJzIGFzIGEgc2luZ2xlLXBhZ2UgZm9jdXNlZCBsYXlvdXQ7IGFcbi8vIHdvcmtzaGVldCByZW5kZXJzIHdpdGggZnVsbCBzZWN0aW9uIG5hdmlnYXRpb25cIikgYW5kIHRoYXQgd2FzIG5ldmVyIGJ1aWx0IGluXG4vLyB0aGUgdmlld2VyLCB3aGljaCBoYXMgT05FIGxheW91dCBhbmQgbm8gc2VjdGlvbiBuYXZpZ2F0aW9uLiBJdCBpcyBhbHNvIE5PVFxuLy8gdGhlIGNhdGFsb2cgZmFjZXQgXHUyMDE0IHRoYXQgaXMgYHBlZGFnb2dpY2FsX3JvbGVgICgwMDM3KSwgYSBkaWZmZXJlbnQgYXhpcyBvblxuLy8gcHVycG9zZSAoc2VlIHBhY2thZ2VzL2FwcC9zcmMvbGliL3BlZGFnb2dpY2FsUm9sZS50cykuXG4vL1xuLy8gYW5zd2VyRmVlZGJhY2sgY29udHJvbHMgV0hFTiBhIGNvcnJlY3QvaW5jb3JyZWN0IHNpZ25hbCBiZWNvbWVzIHZpc2libGU6XG4vLyAgICdvbl9jaGVjaycgIFx1MjAxNCBoaWRkZW4gdW50aWwgdGhlIHN0dWRlbnQgY2hlY2tzLiBUSEUgT05MWSBMSVZFIFZBTFVFLCBhbmRcbi8vICAgICAgICAgICAgICAgICB0aGUgdHJlYXRtZW50IGZvciBhIG1pc3NpbmcgZmllbGQuXG4vLyAgICdpbW1lZGlhdGUnIFx1MjAxNCBSRVNFUlZFRCwgTk9UIFlFVCBBQ1RJVkUgKFIzLCBkZWZlcnJlZCB0byBpdHMgb3duIHNsaWNlKS5cbi8vICAgICAgICAgICAgICAgICBUaGUgZWRpdG9yIGdyZXlzIGl0LCB0aGUgaW1wb3J0ZXIgd2FybnMsIGFuZCB0aGUgdmlld2VyXG4vLyAgICAgICAgICAgICAgICAgdHJlYXRzIGl0IGFzICdvbl9jaGVjaycuIEl0IGlzIG5vdCBidWlsdCBiZWNhdXNlIG5vdGhpbmcgdG9cbi8vICAgICAgICAgICAgICAgICBoYW5nIGl0IG9uIGV4aXN0cyB5ZXQ6IGFsbCBlbGV2ZW4gaW5wdXQgY29tcG9uZW50cyB3cml0ZSB0b1xuLy8gICAgICAgICAgICAgICAgIHRoZSBzdG9yZSBwZXIga2V5c3Ryb2tlLCBzbyB0aGVyZSBpcyBubyBjb21taXQgc2VhbTsgb25seVxuLy8gICAgICAgICAgICAgICAgIHRoZSBzZXJ2ZXIgc2NvcmVycyBrbm93IHdoYXQgXCJhbnN3ZXJlZFwiIG1lYW5zICh0aGUgc2FuaXRpemVyXG4vLyAgICAgICAgICAgICAgICAgc3RyaXBzIHRoZSBleHBlY3RlZCBjb3VudCwgc28gdGhlIGNsaWVudCBjYW5ub3Qga25vdyBhblxuLy8gICAgICAgICAgICAgICAgIG9yZGVyaW5nIG9yIGEgZ3JhcGggaXMgY29tcGxldGUpOyBhbmQgdGhlIHJlLWZpcmUgcnVsZSBhZnRlclxuLy8gICAgICAgICAgICAgICAgIGEgY29ycmVjdGlvbiBpcyB1bmRlc2lnbmVkLiBgaW1tZWRpYXRlYCArIGBsb2NrZWRgIGlzXG4vLyAgICAgICAgICAgICAgICAgcmVmdXNlZCBhdCBhdXRob3JpbmcsIGJlY2F1c2UgdGhlIHNlcnZlciBjYW5ub3QgdGVsbCBhblxuLy8gICAgICAgICAgICAgICAgIGF1dG8tY2hlY2sgZnJvbSBhIHByZXNzLlxuLy9cbi8vIFx1MjZBMCBUSEUgT0xEIFwidGhlIHJ1bnRpbWUgZGVmYXVsdHMgYSBNSVNTSU5HIGFuc3dlckZlZWRiYWNrIHRvICdpbW1lZGlhdGUnXCJcbi8vIE5PVEUgSVMgREVBRCAoT1YjMjApLiBJdCBkZXNjcmliZWQgYHBhY2thZ2VzL3JlbmRlcmVyYCdzIHJ1bnRpbWUsIHdoaWNoIHdhc1xuLy8gZGVsZXRlZCBhdCBTOSBEcm9wIDQuIE1pc3NpbmcgbWVhbnMgJ29uX2NoZWNrJywgdGhlIHNhbWUgYXMgdGhlIHNjaGVtYVxuLy8gZGVmYXVsdCBcdTIwMTQgdGhlcmUgaXMgbm8gbG9uZ2VyIGEgYmFjay1jb21wYXQgZmFsbGJhY2sgdGhhdCBkaWZmZXJzLlxuLy9cbi8vIFx1MjZCMCByZXZpc2lvbk1vZGUgYW5kIGdyYWRpbmdNb2RlIHdlcmUgREVMRVRFRCBpbiB0aGUgYWN0aXZpdHktZmxvdy1tb2RlcyBzbGljZVxuLy8gKFI0LCAyMDI2LTA4LTI0KSBhbmQgbXVzdCBub3QgY29tZSBiYWNrIHNwZWN1bGF0aXZlbHkuIHJldmlzaW9uTW9kZSBnb3Zlcm5lZFxuLy8gXCJhZnRlciBmaW5hbCBzdWJtaXQsIG1heSB0aGUgc3R1ZGVudCByZXN1Ym1pdFwiIFx1MjAxNCBhbmQgdGhlcmUgaXMgbm8gc3VibWl0IGluXG4vLyB0aGUgdmlld2VyLCBzbyBpdCBoYWQgbm8gcmVmZXJlbnQ7IHJlLWNoZWNraW5nIGlzIHN1Ym1pc3Npb25Nb2RlJ3Mgam9iLlxuLy8gZ3JhZGluZ01vZGUgaXMgREVSSVZFRCwgbm90IGF1dGhvcmVkOiB0aGUgc2VydmVyIGFscmVhZHkgcmVjb3JkcyBmcmVlIHRleHQgYXNcbi8vIFwieW91ciB0ZWFjaGVyIHdpbGwgcmV2aWV3XCIgYW5kIGdyYWRlcyBldmVyeXRoaW5nIGVsc2UgcHVyZWx5IGZyb20gYmxvY2tcbi8vIHR5cGVzLCBzbyAnbWFudWFsJyBvbiBhbiBhbGwtTUMgYWN0aXZpdHkgd291bGQgYmUgYSBsaWUgYW5kICdhdXRvJyBvbiBhblxuLy8gZXNzYXkgd291bGQgYmUgaWdub3JlZC4gV2hlbiBwZXItYmxvY2sgZ3JhZGluZyBtZXRhZGF0YSBsYW5kcyAodGhlXG4vLyB0ZWFjaGVyLWdyYWRpbmcgc2xpY2UncyBvd24gZGVzaWduIHNheXMgaXQgbmVlZHMgaXQpLCBpdCBsYW5kcyBhdCB0aGUgQkxPQ0tcbi8vIGdyYWluLCBub3QgaGVyZS4gT2xkIHN0b3JlZCBkb2N1bWVudHMgY2FycnlpbmcgZWl0aGVyIGZpZWxkIHBhcnNlIGZpbmUgXHUyMDE0XG4vLyB6b2QgLm9iamVjdCgpIHN0cmlwcyB1bmtub3duIGtleXMsIHNvIHRoZXkgdmFuaXNoIG9uIHRoZSBuZXh0IHNhdmUuXG4vL1xuLy8gc2tpbGxzIGlzIGFuIGFycmF5IG9mIHVuaXZlcnNhbCBza2lsbCB0YWdzIGRlc2NyaWJpbmcgd2hhdCB0aGUgYWN0aXZpdHlcbi8vIHRlYWNoZXMuIEFjdGlvbi1vcmllbnRlZCwgZnJhbWV3b3JrLW5ldXRyYWw6IFwic2ltcGxpZnlpbmcgcmF0aW9uYWxcbi8vIGV4cHJlc3Npb25zXCIsIFwiZmFjdG9yaW5nIHF1YWRyYXRpY3NcIiwgXCJncmFwaGluZyBwYXJhYm9sYXNcIi4gQSB0ZWFjaGVyIHdob1xuLy8gd2FudHMgdG8gdXNlIFRFS1Mgb3IgQ0NTUyBjb2RlcyBjYW4gXHUyMDE0IHRoZSBmaWVsZCBkb2Vzbid0IHZhbGlkYXRlIGFnYWluc3Rcbi8vIGFueSBmcmFtZXdvcmsuIFBoYXNlIDUgbWFya2V0cGxhY2UgYWRkcyBjb250cm9sbGVkIHZvY2FidWxhcnkgb24gdG9wLlxuLy9cbi8vIHByaW50IGlzIHRoZSB0ZWFjaGVyLWNvbmZpZ3VyYWJsZSBwcmludCBsYXllciAoc2VlIFByaW50Q29uZmlnIGJlbG93KS4gSXRcbi8vIGlzIGFsd2F5cyBwcmVzZW50IGFmdGVyIHBhcnNlIChkZWZhdWx0IHt9KSwgc28gZXZlcnkgY29uc3VtZXIgY2FuIHJlYWRcbi8vIGRvYy5tZXRhLnByaW50Liogd2l0aG91dCBhbiB1bmRlZmluZWQgY2hlY2s7IGRvY3VtZW50cyBzdG9yZWQgYmVmb3JlIHRoaXNcbi8vIGZpZWxkIGV4aXN0ZWQgZ2V0IHRoZSBkZWZhdWx0cyBhcHBsaWVkIG9uIHJlYWQuIFRoZSBkZWZhdWx0cyBrZWVwIHRoZVxuLy8gU3RhZ2UgMTEgYmFzZWxpbmUgcGFnZSBnZW9tZXRyeSAoc2luZ2xlIGNvbHVtbiwgMC41aW4gbWFyZ2luLCBsZXR0ZXIpIGFuZFxuLy8gYWRkIHRoZSBwcmludCB0eXBvZ3JhcGh5IFN0YWdlIDExIGRlbGliZXJhdGVseSBkZWZlcnJlZCB0byB0aGlzIGZlYXR1cmVcbi8vICgxMXB0IGJvZHksIDFyZW0gcHJvYmxlbSBzcGFjaW5nKSBcdTIwMTQgc28gYSBmcmVzaGx5IHB1Ymxpc2hlZCBwYWdlIHByaW50cyBpbiBhXG4vLyBzZW5zaWJsZSBkZWZhdWx0IHN0eWxlLCBhbmQgdGhlIHRlYWNoZXIgdHVuZXMgZnJvbSB0aGVyZS5cblxuLy8gUHJpbnRIZWFkZXI6IHdoaWNoIGxhYmVsZWQgZmlsbC1pbiBsaW5lcyBhcHBlYXIgYXQgdGhlIHRvcCBvZiBhIHByaW50ZWRcbi8vIHNoZWV0LiBOYW1lICsgRGF0ZSBhcmUgdGhlIG5lYXItdW5pdmVyc2FsIHBhaXIsIHNvIHRoZXkgZGVmYXVsdCBvbjsgdGhlXG4vLyByZXN0IGRlZmF1bHQgb2ZmLiBjdXN0b20gaG9sZHMgZXh0cmEgdGVhY2hlci1hdXRob3JlZCBsYWJlbHMgKGUuZy5cbi8vIFwiQmxvY2tcIiwgXCJUZWFjaGVyXCIpIHJlbmRlcmVkIGFzIHRoZWlyIG93biBmaWxsLWluIGxpbmVzLiBUaGUgaGVhZGVyIGlzXG4vLyBwcmludC1vbmx5IFx1MjAxNCBpdCBuZXZlciBzaG93cyBvbiBzY3JlZW4gKHRoZSBvbi1zY3JlZW4gaWRlbnRpdHkgcHJvbXB0IGlzIHRoZVxuLy8gbGl2ZSBuYW1lIGZpZWxkKTsgc2VlIHJlbmRlclByaW50SGVhZGVyICsgdGhlIEBtZWRpYSBwcmludCBydWxlcy5cbmV4cG9ydCBjb25zdCBQcmludEhlYWRlciA9IHoub2JqZWN0KHtcbiAgbmFtZTogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGU6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2Q6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmU6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VzdG9tOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBQcmludEhlYWRlciA9IHouaW5mZXI8dHlwZW9mIFByaW50SGVhZGVyPjtcblxuLy8gUHJpbnRDb25maWc6IHRoZSB0ZWFjaGVyJ3MgcHJpbnQgc2V0dGluZ3MgZm9yIGFuIGFjdGl2aXR5LiBFdmVyeSBmaWVsZCBpc1xuLy8gZGVmYXVsdGVkIHNvIFByaW50Q29uZmlnLnBhcnNlKHt9KSB5aWVsZHMgYSBjb21wbGV0ZSwgYmFzZWxpbmUtZXF1aXZhbGVudFxuLy8gY29uZmlnIFx1MjAxNCB0aGF0IGlzIHdoYXQgQWN0aXZpdHlNZXRhLnByaW50IGZhbGxzIGJhY2sgdG8uXG4vL1xuLy8gICBwYXBlclNpemUgICAgICBcdTIwMTQgJ2xldHRlcicgfCAnYTQnLiBEcml2ZXMgdGhlIEBwYWdlIHNpemUga2V5d29yZC4gRGVmYXVsdFxuLy8gICAgICAgICAgICAgICAgICAgIGxldHRlciBmb3Igbm93IChOWi9BNCBpcyBhIG9uZS1saW5lIGZsaXAgbGF0ZXIpOyBlbWl0dGVkXG4vLyAgICAgICAgICAgICAgICAgICAgYXMgYSBMSVRFUkFMIEBwYWdlIHJ1bGUsIG5ldmVyIGEgQ1NTIHZhciwgYmVjYXVzZSBAcGFnZVxuLy8gICAgICAgICAgICAgICAgICAgIHJ1bGVzIGNhbm5vdCByZWxpYWJseSByZWFkIGN1c3RvbSBwcm9wZXJ0aWVzLlxuLy8gICBjb2x1bW5zICAgICAgICBcdTIwMTQgMS4uMy4gY29sdW1uLWNvdW50IGluIHByaW50OyAxIGlzIGEgbm8tb3AgKHNpbmdsZSBjb2wpLlxuLy8gICAgICAgICAgICAgICAgICAgIERPUk1BTlQ6IHRoZSBhdXRob3ItZmFjaW5nIGNvbnRyb2wgd2FzIHJldGlyZWQgd2hlblxuLy8gICAgICAgICAgICAgICAgICAgIHN0cnVjdHVyYWwgYXV0aG9yZWQgY29sdW1ucyAodGhlIFJvdy9Db2x1bW4gbGF5b3V0XG4vLyAgICAgICAgICAgICAgICAgICAgcHJpbWl0aXZlKSBsYW5kZWQgXHUyMDE0IGEgbXVsdGktY29sdW1uIHJvdyByZW5kZXJzIGNvbnNpc3RlbnRseVxuLy8gICAgICAgICAgICAgICAgICAgIG9uIHNjcmVlbiwgaW4gd29ya3NoZWV0IHByaW50LCBhbmQgaW5zaWRlIGEgZm9sZGFibGUsIHNvXG4vLyAgICAgICAgICAgICAgICAgICAgdGhpcyBwZXItbW9kZSBwcmludCBzZXR0aW5nIGJlY2FtZSByZWR1bmRhbnQuIFRoZSBmaWVsZCArXG4vLyAgICAgICAgICAgICAgICAgICAgaXRzIHJlbmRlcmVyIHZhci9DU1MgYXJlIGtlcHQgKG5vdCBkZWxldGVkKSBzbyB2YWx1ZXNcbi8vICAgICAgICAgICAgICAgICAgICBhbHJlYWR5IHNhdmVkIG9uIGV4aXN0aW5nIGFjdGl2aXRpZXMga2VlcCBwcmludGluZyBhc1xuLy8gICAgICAgICAgICAgICAgICAgIGF1dGhvcmVkLCBhbmQgc28gdGhlIGNvbnRyb2wgY2FuIGJlIHJlLWV4cG9zZWQgbGF0ZXIgd2l0aFxuLy8gICAgICAgICAgICAgICAgICAgIG5vIHNjaGVtYS9yZW5kZXJlciBjaGFuZ2UuIE5ldyBhY3Rpdml0aWVzIGRlZmF1bHQgdG8gMS5cbi8vICAgd29ya1NwYWNlICAgICAgXHUyMDE0IHJlbSBvZiBibGFuayBzcGFjZSBiZWxvdyBlYWNoIHByb2JsZW0gZm9yIGhhbmQtd29ya2luZy5cbi8vICAgICAgICAgICAgICAgICAgICBBY3Rpdml0eS1sZXZlbCBkZWZhdWx0OyBhIGZpbGwtaW4tYmxhbmsgYmxvY2sgbWF5IG92ZXJyaWRlXG4vLyAgICAgICAgICAgICAgICAgICAgaXQgcGVyLXByb2JsZW0gdmlhIEZpbGxJbkJsYW5rQmxvY2sud29ya1NwYWNlLlxuLy8gICBmb250U2l6ZSAgICAgICBcdTIwMTQgcHQuIEFwcGxpZWQgdG8gLmFjdGl2aXR5LWNvbnRhaW5lciBpbiBwcmludCBvbmx5LlxuLy8gICBwcm9ibGVtU3BhY2luZyBcdTIwMTQgcmVtIG9mIHZlcnRpY2FsIG1hcmdpbiBhcm91bmQgZWFjaCBwcm9ibGVtIGluIHByaW50LlxuLy8gICBtYXJnaW4gICAgICAgICBcdTIwMTQgaW5jaGVzLiBUaGUgQHBhZ2UgbWFyZ2luIChsaXRlcmFsLCBsaWtlIHBhcGVyU2l6ZSkuXG4vLyAgIGdyaWRMaW5lcyAgICAgIFx1MjAxNCBhY3Rpdml0eS13aWRlIGRlZmF1bHQgZm9yIHJ1bGVkIHJvd3MuIEEgUm93IHdpdGhcbi8vICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6J2luaGVyaXQnICh0aGUgcGVyLXJvdyBkZWZhdWx0KSByZXNvbHZlcyB0byB0aGlzO1xuLy8gICAgICAgICAgICAgICAgICAgICdvbicvJ29mZicgb24gYSByb3cgb3ZlcnJpZGUgaXQuIE9mZiBieSBkZWZhdWx0IFx1MjAxNCBydWxlZFxuLy8gICAgICAgICAgICAgICAgICAgIGdyaWRzIGFyZSBvcHQtaW4uXG4vLyAgIHByaW50UmVmZXJlbmNlUGFuZWwgXHUyMDE0IHdoZXRoZXIgdGhlIGFjdGl2aXR5J3MgcmVmZXJlbmNlIHBhbmVsIHByaW50cyBhcyBhXG4vLyAgICAgICAgICAgICAgICAgICAgYm94IGF0IHRoZSB0b3Agb2YgdGhlIHdvcmtzaGVldC4gT24gYnkgZGVmYXVsdDsgYSB0ZWFjaGVyXG4vLyAgICAgICAgICAgICAgICAgICAgd2l0aCBhIGNsYXNzIHNldCBvZiBjaGFydHMgY2FuIHR1cm4gaXQgb2ZmIHNvIGl0IGlzbid0XG4vLyAgICAgICAgICAgICAgICAgICAgcmVwcmludGVkIHBlciBhY3Rpdml0eS4gR2F0ZXMgUFJJTlQgYWxvbmUsIGFuZCBhcyBvZlxuLy8gICAgICAgICAgICAgICAgICAgIDIwMjYtMDgtMjMgdGhhdCBpcyB0cnVlIGFnYWluIHJhdGhlciB0aGFuIG1lcmVseSBjbGFpbWVkOlxuLy8gICAgICAgICAgICAgICAgICAgIHRoZSBwYW5lbCdzIFNDUkVFTiBzdXJmYWNlIGlzIGJhY2sgKGEgc3VtbW9uZWQgcGFuZWwgaW5cbi8vICAgICAgICAgICAgICAgICAgICB0aGUgdmlld2VyKSwgc28gdHVybmluZyB0aGlzIG9mZiBtZWFucyBzY3JlZW4tb25seSBpbnN0ZWFkXG4vLyAgICAgICAgICAgICAgICAgICAgb2YgaW52aXNpYmxlLWV2ZXJ5d2hlcmUuIEJldHdlZW4gUzkgRHJvcCA0IGFuZCB0aGF0IHNsaWNlXG4vLyAgICAgICAgICAgICAgICAgICAgcHJpbnQgV0FTIHRoZSBvbmx5IHN1cmZhY2UsIHdoaWNoIG1hZGUgdGhpcyBmbGFnIGEgdHJhcC5cbi8vICAgICAgICAgICAgICAgICAgICBSZWFkIGJ5IHRoZSB2aWV3ZXIncyBwcmludCBsYXllcjsgbm90IGEgY29udGFpbmVyIENTUyB2YXIuXG4vLyAgIHByaW50RGVmaW5pdGlvbkdsb3NzYXJ5IFx1MjAxNCB3aGV0aGVyIGlubGluZSB2b2NhYnVsYXJ5IGRlZmluaXRpb25zIHByaW50IGFzIGFcbi8vICAgICAgICAgICAgICAgICAgICBnbG9zc2FyeSBhcHBlbmRpeCBhdCB0aGUgRU5EIG9mIHRoZSB3b3Jrc2hlZXQuIE9GRiBieVxuLy8gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQsIHVubGlrZSBwcmludFJlZmVyZW5jZVBhbmVsOiBvbiBzY3JlZW4gYSBkZWZpbml0aW9uXG4vLyAgICAgICAgICAgICAgICAgICAgaXMgYSBwb3BvdmVyIGEgc3R1ZGVudCBvcGVucyBvbiBkZW1hbmQsIGFuZCBtb3N0IGFyZSBhXG4vLyAgICAgICAgICAgICAgICAgICAgc2hvcnQgZ2xvc3MgdGhhdCB3b3VsZCBvbmx5IHBhZCB0aGUgcHJpbnRvdXQuIEEgdGVhY2hlciB3aG9cbi8vICAgICAgICAgICAgICAgICAgICBoYXMgcHV0IGEgZm9ybXVsYSBvciBhIGRpYWdyYW0gaW4gYSBkZWZpbml0aW9uIHR1cm5zIHRoaXNcbi8vICAgICAgICAgICAgICAgICAgICBvbiBzbyBpdCBzdXJ2aXZlcyBvbiBwYXBlciAoZGVmaW5pdGlvbiBwb3BvdmVycyBhcmVcbi8vICAgICAgICAgICAgICAgICAgICBkaXNwbGF5Om5vbmUgaW4gcHJpbnQpLiBSZWFkIGJ5IHRoZSByZW5kZXJlciB0byBkZWNpZGVcbi8vICAgICAgICAgICAgICAgICAgICB3aGV0aGVyIHRvIGVtaXQgdGhlIGFwcGVuZGl4OyBub3QgYSBjb250YWluZXIgQ1NTIHZhci5cbi8vICAgaGVhZGVyICAgICAgICAgXHUyMDE0IHNlZSBQcmludEhlYWRlci5cbi8vXG4vLyBjb2x1bW5zL3dvcmtTcGFjZS9mb250U2l6ZS9wcm9ibGVtU3BhY2luZyByaWRlIGFzIC0tcHJpbnQtKiBDU1MgdmFycyBvbiB0aGVcbi8vIGNvbnRhaW5lciAobm9ybWFsIHNlbGVjdG9ycyBjYW4gcmVhZCB0aGVtKTsgcGFwZXJTaXplL21hcmdpbiBhcmUgZW1pdHRlZCBhc1xuLy8gYSBwZXItZG9jdW1lbnQgbGl0ZXJhbCBAcGFnZSBydWxlLiBncmlkTGluZXMgaXMgbm90IGEgY29udGFpbmVyIHZhciBcdTIwMTQgaXQgaXNcbi8vIHJlc29sdmVkIHBlciByb3cgYXQgcmVuZGVyIHRpbWUgKHNlZSByZW5kZXJSb3cpLlxuZXhwb3J0IGNvbnN0IFByaW50Q29uZmlnID0gei5vYmplY3Qoe1xuICBwYXBlclNpemU6IHouZW51bShbJ2xldHRlcicsICdhNCddKS5kZWZhdWx0KCdsZXR0ZXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5zOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoMykuZGVmYXVsdCgxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrU3BhY2U6IHoubnVtYmVyKCkubWluKDApLmRlZmF1bHQoMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5kZWZhdWx0KDExKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ibGVtU3BhY2luZzogei5udW1iZXIoKS5taW4oMCkuZGVmYXVsdCgxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46IHoubnVtYmVyKCkubWluKDApLmRlZmF1bHQoMC41KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaW50UmVmZXJlbmNlUGFuZWw6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpbnREZWZpbml0aW9uR2xvc3Nhcnk6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcjogUHJpbnRIZWFkZXIuZGVmYXVsdCh7fSksXG59KTtcbmV4cG9ydCB0eXBlIFByaW50Q29uZmlnID0gei5pbmZlcjx0eXBlb2YgUHJpbnRDb25maWc+O1xuXG4vLyBUeXBvZ3JhcGh5OiB0aGUgYWN0aXZpdHktd2lkZSBmb250ICsgYmFzZSBib2R5IHNpemUgKGF1dGhvci1hcHByb3ZlZFxuLy8gMjAyNi0wNy0wOCkuIE9ORSBmb250IGFuZCBPTkUgYmFzZSBzaXplIGZvciB0aGUgd2hvbGUgYWN0aXZpdHkgXHUyMDE0IHB1Ymxpc2hlZFxuLy8gcGFnZSwgZWRpdG9yIGNhbnZhcywgYW5kIHByaW50IHZpZXcgYWxsIHJlYWQgdGhlIHNhbWUgY29uZmlnIHNvIGF1dGhvcmluZyBpc1xuLy8gV1lTSVdZRy4gT3B0aW9uYWwgYW5kIGFkZGl0aXZlOiBkb2N1bWVudHMgc3RvcmVkIGJlZm9yZSB0aGlzIGZpZWxkIGV4aXN0ZWRcbi8vIHBhcnNlIHVuY2hhbmdlZCAobm8gc2NoZW1hVmVyc2lvbiBidW1wKSwgYW5kIHRoZSBlZGl0b3Igb21pdHMgdGhlIGZpZWxkXG4vLyBlbnRpcmVseSB3aGlsZSBpdCBob2xkcyB0aGUgZGVmYXVsdHMgc28gdW50b3VjaGVkIGRvY3VtZW50cyBzdGF5XG4vLyBzdHJ1Y3R1cmFsbHkgaWRlbnRpY2FsLlxuLy9cbi8vICAgZm9udCAgICAgXHUyMDE0IGFuIGlkIGludG8gdGhlIHJlbmRlcmVyJ3MgRk9OVF9SRUdJU1RSWSAodGhlIENTUyBzcGVjaWZpY3MgXHUyMDE0XG4vLyAgICAgICAgICAgICAgZmFtaWx5IG5hbWUsIGZhbGxiYWNrIHN0YWNrLCBXT0ZGMiBmaWxlcyBcdTIwMTQgbGl2ZSByZW5kZXJlci1zaWRlO1xuLy8gICAgICAgICAgICAgIHRoZSBzY2hlbWEgb25seSBjb25zdHJhaW5zIHRoZSBtZW51KS4gJ2RlZmF1bHQnID0gdGhlIGN1cnJlbnRcbi8vICAgICAgICAgICAgICBzeXN0ZW0gc3RhY2ssIG5vIGZvbnQgZG93bmxvYWQuIFRoZSBvdGhlciBmb3VyIGFyZSBTSUwgT0ZMXG4vLyAgICAgICAgICAgICAgZmFjZXMgc2VsZi1ob3N0ZWQgYXMgV09GRjIgb24gUjIgKG5vIEdvb2dsZSBDRE4gZGVwZW5kZW5jeSBvblxuLy8gICAgICAgICAgICAgIHB1Ymxpc2hlZCBwYWdlcykuXG4vLyAgIGZvbnRTaXplIFx1MjAxNCBiYXNlIEJPRFkgc2l6ZSBpbiBweCwgYXBwbGllZCBvbiBzY3JlZW4gdmlhXG4vLyAgICAgICAgICAgICAgLS1hY3Rpdml0eS1mb250LXNpemUuIFByaW50IGJvZHkgc2l6aW5nIHN0YXlzIG93bmVkIGJ5XG4vLyAgICAgICAgICAgICAgbWV0YS5wcmludC5mb250U2l6ZSAocHQpIFx1MjAxNCB0aGUgQG1lZGlhIHByaW50IHJ1bGUgb3ZlcnJpZGVzIHRoZVxuLy8gICAgICAgICAgICAgIHNjcmVlbiBzaXplLCBzbyB0aGUgdHdvIG5ldmVyIGZpZ2h0LiBIZWFkaW5ncyBhcmUgZW0tcmVsYXRpdmVcbi8vICAgICAgICAgICAgICBhbmQgc2NhbGUgb2ZmIHdoaWNoZXZlciBiYXNlIGlzIGluIGVmZmVjdC5cbi8vXG4vLyBQZXItc3BhbiBmb250L3NpemUgbWFya3MgYXJlIFBBUktFRCBidXQgZGVzaWduZWQgZm9yOiB0aGlzIGFjdGl2aXR5LXdpZGVcbi8vIGxheWVyIG9ubHkgc2V0cyBDU1MgdmFycyArIEBmb250LWZhY2UsIHNvIGEgZnV0dXJlIGB0ZXh0U3R5bGVgIG1hcmsgY2FuXG4vLyBzbG90IGluIGFkZGl0aXZlbHkgKHNwYW4tbGV2ZWwgaW5saW5lIHN0eWxlcyB3aW4gdGhlIGNhc2NhZGU7IHRoZVxuLy8gcmVuZGVyZXIncyBmb250RmFjZUNzcyBhbHJlYWR5IHRha2VzIGEgTElTVCBvZiBmYW1pbGllcyB0byBlbWJlZCkuXG5leHBvcnQgY29uc3QgQWN0aXZpdHlGb250ID0gei5lbnVtKFtcbiAgJ2RlZmF1bHQnLFxuICAnbGV4ZW5kJyxcbiAgJ2F0a2luc29uLWh5cGVybGVnaWJsZScsXG4gICdhbmRpa2EnLFxuICAnY29taWMtbmV1ZScsXG5dKTtcbmV4cG9ydCB0eXBlIEFjdGl2aXR5Rm9udCA9IHouaW5mZXI8dHlwZW9mIEFjdGl2aXR5Rm9udD47XG5cbmV4cG9ydCBjb25zdCBUeXBvZ3JhcGh5ID0gei5vYmplY3Qoe1xuICBmb250OiBBY3Rpdml0eUZvbnQuZGVmYXVsdCgnZGVmYXVsdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiB6Lm51bWJlcigpLm1pbigxMikubWF4KDI0KS5kZWZhdWx0KDE2KSxcbn0pO1xuZXhwb3J0IHR5cGUgVHlwb2dyYXBoeSA9IHouaW5mZXI8dHlwZW9mIFR5cG9ncmFwaHk+O1xuXG5leHBvcnQgY29uc3QgQWN0aXZpdHlNZXRhID0gei5vYmplY3Qoe1xuICB0aXRsZTogei5zdHJpbmcoKS5taW4oMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLm1pbigxKTogY291cnNlIGlzIHN0YW1wZWQgaW50byB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhY3Rpdml0aWVzLmNvdXJzZSBjb2x1bW4gYXQgcHVibGlzaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICgwMDM3LCB0YXhvbm9teSBSMSkgd2hlcmUgaXQgaXMgYG5vdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG51bGxgIFx1MjAxNCBhIGJsYW5rIGNvdXJzZSB3b3VsZCBwdWJsaXNoIGFuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW1wdHkgZmFjZXQgaW50byB0aGUgY2F0YWxvZy4gVGhlIGVkaXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhbGxzIGJhY2sgdG8gdGhlIGRlZmF1bHQgcmF0aGVyIHRoYW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBldmVyIHNlbmRpbmcgYSBibGFuayAoQWN0aXZpdHlFZGl0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzYXZlKCksIHNhbWUgZ3VhcmQgdGl0bGUgYWxyZWFkeSBoYXMpLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdXJzZTogei5zdHJpbmcoKS5taW4oMSkuZGVmYXVsdCgnQWxnZWJyYSBJSScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXNzaW9uTW9kZTogei5lbnVtKFsnc2luZ2xlJywgJ2xvY2tlZCcsICdmcmVlJ10pLmRlZmF1bHQoJ2ZyZWUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpdml0eVR5cGU6IHouZW51bShbJ3dvcmtzaGVldCcsICdleGl0X3RpY2tldCcsICd3YXJtX3VwJywgJ3JldmlldyddKS5kZWZhdWx0KCd3b3Jrc2hlZXQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXJGZWVkYmFjazogei5lbnVtKFsnaW1tZWRpYXRlJywgJ29uX2NoZWNrJ10pLmRlZmF1bHQoJ29uX2NoZWNrJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaW50OiBQcmludENvbmZpZy5kZWZhdWx0KHt9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBvZ3JhcGh5OiBUeXBvZ3JhcGh5Lm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIEFjdGl2aXR5TWV0YSA9IHouaW5mZXI8dHlwZW9mIEFjdGl2aXR5TWV0YT47XG5cbi8vIFRoZSB0b3AtbGV2ZWwgZG9jdW1lbnQuIEFsd2F5cyB2YWxpZGF0ZSB1c2VyLWZhY2luZyBpbnB1dCB0aHJvdWdoIHRoaXNcbi8vIGJlZm9yZSBzdG9yaW5nLiBUaGUgRWRnZSBGdW5jdGlvbnMgcGFyc2UgaW5jb21pbmcgZHJhZnRzIHdpdGggdGhpcyBzY2hlbWFcbi8vIGFuZCByZWplY3QgbWFsZm9ybWVkIGRvY3VtZW50cyB3aXRoIGEgNDAwLlxuLy8gUmVmZXJlbmNlUGFuZWw6IG9wdGlvbmFsIHN0aWNreS1zaWRlYmFyIGNvbnRlbnQgc3R1ZGVudHMgY29uc3VsdCB3aGlsZVxuLy8gd29ya2luZyBcdTIwMTQgZm9ybXVsYSBjaGFydHMsIHBlcmlvZGljIHRhYmxlcywgdm9jYWJ1bGFyeSBsaXN0cywgY29udmVyc2lvblxuLy8gdGFibGVzLCB1bml0LWNpcmNsZSBkaWFncmFtcywgc2VudGVuY2Utc3RlbSBwcm9tcHRzLCBmb3JlaWduLWxhbmd1YWdlXG4vLyB2ZXJiIHRhYmxlcywgcHJpbWFyeS1zb3VyY2UgZXhjZXJwdHMsIG1hcHMuIFRoZSBibG9ja3MgYXJyYXkgdXNlcyB0aGVcbi8vIHNhbWUgQmxvY2sgc2NoZW1hIGFzIHNlY3Rpb24gY29udGVudDsgbm8gbmV3IGJsb2NrIHR5cGVzIGFyZSBuZWVkZWRcbi8vIGZvciB0aGUgcGFuZWwuXG4vL1xuLy8gUGhhc2UgMTogdGhlIHNjaGVtYSBhY2NlcHRzIHRoZSBmaWVsZCBhcyBmb3J3YXJkLWNvbXBhdDsgdGhlIGVkaXRvclxuLy8gZG9lc24ndCBzdXJmYWNlIGl0LCBhbmQgdGhlIHJlbmRlcmVyIGlnbm9yZXMgaXQuIFBoYXNlIDIgd2lyZXMgdXAgdGhlXG4vLyBhdXRob3JpbmcgVUkgYW5kIHRoZSBzaWRlYmFyIGxheW91dCBpbiBwdWJsaXNoZWQgSFRNTC4gRmllbGQgaXNcbi8vIG9wdGlvbmFsIHdpdGggbm8gZGVmYXVsdCBvbiBBY3Rpdml0eURvY3VtZW50LCBzbyBleGlzdGluZyBzdG9yZWRcbi8vIGRvY3VtZW50cyBwYXJzZSBjbGVhbmx5LlxuLy9cbi8vIFJlbmRlcmVyIHdpbGwgdHJlYXQgcmVmZXJlbmNlIGNvbnRlbnQgYXMgZGF0YS1ibG9jay1jYXRlZ29yeT1cInNjYWZmb2xkXCJcbi8vIChQaGFzZSAyKykgXHUyMDE0IGRvZXNuJ3QgY29udHJpYnV0ZSB0byBzY29yaW5nIG9yIGNoZWNrcG9pbnQgYmVoYXZpb3IuXG5leHBvcnQgY29uc3QgUmVmZXJlbmNlUGFuZWwgPSB6Lm9iamVjdCh7XG4gIHRpdGxlOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBibG9ja3M6IHouYXJyYXkoQmxvY2spLFxufSk7XG5leHBvcnQgdHlwZSBSZWZlcmVuY2VQYW5lbCA9IHouaW5mZXI8dHlwZW9mIFJlZmVyZW5jZVBhbmVsPjtcblxuLy8gQ2FsY3VsYXRvciB0b29sOiBhbiBhY3Rpdml0eS1sZXZlbCBzY2FmZm9sZCwgYSBzaWJsaW5nIHRvIHRoZSByZWZlcmVuY2Vcbi8vIHBhbmVsIFx1MjAxNCBhIHRlYWNoZXItY29uZmlndXJhYmxlIG9uLXNjcmVlbiBjYWxjdWxhdG9yIGEgc3R1ZGVudCBzdW1tb25zIHdoaWxlXG4vLyB3b3JraW5nIChsaWtlIHRoZSBjYWxjdWxhdG9yIGFsbG93ZWQgb24gYSBkaWdpdGFsIFNBVCkuIEl0IGlzIE5FVkVSIHNjb3JlZCxcbi8vIHByb2R1Y2VzIG5vIHN1Ym1pc3Npb24sIGFuZCBjYXJyaWVzIG5vIGFuc3dlciBrZXk7IHRoZSByZW5kZXJlciB0cmVhdHMgaXQgYXNcbi8vIGRhdGEtYmxvY2stY2F0ZWdvcnk9XCJzY2FmZm9sZFwiIChvdXRzaWRlIGFueSAuYWN0aXZpdHktc2VjdGlvbiwgc28gdGhlIHNjb3Jpbmdcbi8vIHJ1bnRpbWUgbmV2ZXIgc2VlcyBpdCkuIEl0IHRyYXZlbHMgaW4gdGhlIHdpcmUgZm9ybWF0LCBjb25maWd1cmVkIG9uY2UgcGVyXG4vLyBhY3Rpdml0eSwgYW5kIGlzIG9wdGlvbmFsIHNvIGV4aXN0aW5nIHN0b3JlZCBkb2N1bWVudHMgcGFyc2UgdW5jaGFuZ2VkIFx1MjAxNCBub1xuLy8gc2NoZW1hVmVyc2lvbiBidW1wIChzYW1lIGZvcndhcmQtY29tcGF0IHN0b3J5IGFzIHJlZmVyZW5jZVBhbmVsL3ByaW50KS5cbi8vXG4vLyBSZXN0cmljdGlvbnMgYXJlIFBFUk1JU1NJVkUgYnkgZGVmYXVsdDogYW4gZW5hYmxlZC1idXQtdW5jb25maWd1cmVkXG4vLyBjYWxjdWxhdG9yIGlzIGEgZnVsbCB0b29sOyB0ZWFjaGVycyBvcHQgSU5UTyByZXN0cmljdGlvbnMsIG5ldmVyIG91dCBvZlxuLy8gY2FwYWJpbGl0eS4gTGF0ZXIgZmxhZ3MgKGxvY2tWaWV3cG9ydCwgYWxsb3dlZFJlZ3Jlc3Npb25Nb2RlbHMsXG4vLyBtYXhFeHByZXNzaW9uc1x1MjAyNikgYXJlIGFkZGVkIGFkZGl0aXZlbHkgYXMgZ3JhcGhpbmctdHJhY2sgc3RhZ2VzIGxhbmQgXHUyMDE0IGFsbFxuLy8gb3B0aW9uYWwvZGVmYXVsdGVkLCBzbyBzdGlsbCBubyBzY2hlbWFWZXJzaW9uIGJ1bXAuXG4vL1xuLy8gYG1vZGVgIGlzIHRoZSBjYXBhYmlsaXR5IGNlaWxpbmcuIFRoZSBlbnVtIGNhcnJpZXMgdGhlIGZ1bGwgY29udHJhY3Qgbm93LCBidXRcbi8vIHRoZSBkZWZhdWx0IGlzICdzY2llbnRpZmljJyBiZWNhdXNlIHRoYXQgaXMgdGhlIG9ubHkgY2FwYWJpbGl0eSBTdGFnZSAxXG4vLyBpbXBsZW1lbnRzIFx1MjAxNCBhbiBlbmFibGVkIGNhbGN1bGF0b3IgZG9lcyBleGFjdGx5IHdoYXQgaXMgYnVpbHQuIFRoZSBkZWZhdWx0XG4vLyBtYXkgZmxpcCB0byAnZ3JhcGhpbmcnIG9uY2UgdGhlIGJvYXJkIGxheWVyIGxhbmRzIChTdGFnZSAyKS5cbi8vIFN0YWdlIDM6IHdoaWNoIGZpdCBtb2RlbHMgdGhlIGdyYXBoaW5nIGNhbGN1bGF0b3IncyBkYXRhL3JlZ3Jlc3Npb24gcGFuZWxcbi8vIG9mZmVycy4gUGVybWlzc2l2ZSBkZWZhdWx0IChhbGwgdGhyZWUpOyBhbiBFTVBUWSBhcnJheSB0dXJucyByZWdyZXNzaW9uIG9mZlxuLy8gZW50aXJlbHkgKG5vIGRhdGEgcGFuZWwpLiBPbmx5IG1lYW5pbmdmdWwgdW5kZXIgbW9kZSAnZ3JhcGhpbmcnIFx1MjAxNCB0aGVcbi8vICdzY2llbnRpZmljJyBjZWlsaW5nIGFscmVhZHkgZXhjbHVkZXMgdGhlIGJvYXJkIHRoZSBmaXRzIGRyYXcgb24uXG4vLyAnbG9nYXJpdGhtaWMnIGpvaW5lZCAyMDI2LTA3LTExIChjYWxjdWxhdG9yLXBhcml0eSBiYXRjaCk6IHRoZSBraXQgY29tcHV0ZWRcbi8vIGxvZyBmaXRzIGFsbCBhbG9uZzsgdGhlIGVudW0gd2FzIHRoZSBvbmx5IGdhcC4gTk9URSBhIHN0b3JlZCBkb2MgdGhhdCBjYXJyaWVzXG4vLyB0aGUgZXhwbGljaXQgdGhyZWUtbW9kZWwgYXJyYXkgc3RheXMgdGhyZWUtbW9kZWwgKGluZGlzdGluZ3Vpc2hhYmxlIGZyb20gYVxuLy8gZGVsaWJlcmF0ZSByZXN0cmljdGlvbikgdW50aWwgdGhlIHRlYWNoZXIgdG91Y2hlcyB0aGUgY29uZmlnIFx1MjAxNCBhY2NlcHRlZCBhdFxuLy8gdGhlIGRlc2lnbiBwYXNzOyB0aGUgcGVybWlzc2l2ZSBkZWZhdWx0IG9ubHkgYXBwbGllcyB3aGVuIHRoZSBmaWVsZCBpcyBhYnNlbnQuXG5leHBvcnQgY29uc3QgUmVncmVzc2lvbk1vZGVsID0gei5lbnVtKFtcbiAgJ2xpbmVhcicsXG4gICdxdWFkcmF0aWMnLFxuICAnZXhwb25lbnRpYWwnLFxuICAnbG9nYXJpdGhtaWMnLFxuXSk7XG5leHBvcnQgdHlwZSBSZWdyZXNzaW9uTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBSZWdyZXNzaW9uTW9kZWw+O1xuXG5leHBvcnQgY29uc3QgQ2FsY3VsYXRvclJlc3RyaWN0aW9ucyA9IHoub2JqZWN0KHtcbiAgbW9kZTogei5lbnVtKFsnc2NpZW50aWZpYycsICdncmFwaGluZyddKS5kZWZhdWx0KCdzY2llbnRpZmljJyksXG4gIGFsbG93VHJpZzogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgYWxsb3dMb2dFeHA6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gIC8vIEluZXF1YWxpdHkgcm93cyBpbiB0aGUgZ3JhcGhpbmcgZXhwcmVzc2lvbiBsaXN0IChjYWxjdWxhdG9yLXBhcml0eSBiYXRjaCkuXG4gIC8vIEFkZGl0aXZlICsgZGVmYXVsdGVkIGxpa2UgdGhlIG90aGVyIGdhdGVzIFx1MjAxNCBubyBzY2hlbWFWZXJzaW9uIGJ1bXA7IHRoZSBraXRcbiAgLy8gcmVhZHMgYSBtaXNzaW5nIHZhbHVlIGFzIHBlcm1pc3NpdmUsIHNvIG9sZCBwdWJsaXNoZWQgcGFnZXMgc3RheSBmdWxsLXRvb2wuXG4gIGFsbG93SW5lcXVhbGl0aWVzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICBhbGxvd2VkUmVncmVzc2lvbk1vZGVsczogelxuICAgIC5hcnJheShSZWdyZXNzaW9uTW9kZWwpXG4gICAgLmRlZmF1bHQoWydsaW5lYXInLCAncXVhZHJhdGljJywgJ2V4cG9uZW50aWFsJywgJ2xvZ2FyaXRobWljJ10pLFxuICAvLyBTdGFnZSA0OiBjYXAgb24gdGhlIGdyYXBoaW5nIGV4cHJlc3Npb24gbGlzdC4gQUJTRU5UID0gdW5saW1pdGVkICh0aGVcbiAgLy8gcGVybWlzc2l2ZSBkZWZhdWx0IFx1MjAxNCBvcHRpb25hbCwgbm90IGRlZmF1bHRlZCwgc28gaXQgc3RheXMgb3V0IG9mIHN0b3JlZFxuICAvLyBkb2NzIHVubGVzcyBhIHRlYWNoZXIgc2V0cyBpdCkuIEdyYXBoaW5nIG1vZGUgb25seS5cbiAgbWF4RXhwcmVzc2lvbnM6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm1heCg1MCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ2FsY3VsYXRvclJlc3RyaWN0aW9ucyA9IHouaW5mZXI8dHlwZW9mIENhbGN1bGF0b3JSZXN0cmljdGlvbnM+O1xuXG5leHBvcnQgY29uc3QgQ2FsY3VsYXRvclRvb2wgPSB6Lm9iamVjdCh7XG4gIGVuYWJsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICByZXN0cmljdGlvbnM6IENhbGN1bGF0b3JSZXN0cmljdGlvbnMuZGVmYXVsdCh7fSksXG59KTtcbmV4cG9ydCB0eXBlIENhbGN1bGF0b3JUb29sID0gei5pbmZlcjx0eXBlb2YgQ2FsY3VsYXRvclRvb2w+O1xuXG4vLyBUaGUgZXhwbGljaXQgdHlwZSArIHouWm9kVHlwZSBhbm5vdGF0aW9uIChpbnN0ZWFkIG9mIHouaW5mZXIpIGV4aXN0cyBiZWNhdXNlXG4vLyB0aGUgZnVsbHkgaW5mZXJyZWQgZG9jdW1lbnQgdHlwZSBvdXRncmV3IHRzYydzIGRlY2xhcmF0aW9uLXNlcmlhbGl6YXRpb25cbi8vIGxpbWl0IChUUzcwNTYpIHdoZW4gdGhlIEJsb2NrIHVuaW9uIHJlYWNoZWQgMTQgbWVtYmVycy4gU3RydWN0dXJhbGx5XG4vLyBpZGVudGljYWwgdG8gd2hhdCBpbmZlcmVuY2UgcHJvZHVjZWQ7IG5vdGhpbmcgaGVyZSBsb3NlcyB0eXBlIHNhZmV0eSBcdTIwMTRcbi8vIHRoZSBhbm5vdGF0aW9uIGlzIGNoZWNrZWQgYWdhaW5zdCB0aGUgb2JqZWN0IHNjaGVtYS5cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZpdHlEb2N1bWVudCB7XG4gIHNjaGVtYVZlcnNpb246IDI7XG4gIG1ldGE6IEFjdGl2aXR5TWV0YTtcbiAgc2VjdGlvbnM6IFNlY3Rpb25bXTtcbiAgcmVmZXJlbmNlUGFuZWw/OiBSZWZlcmVuY2VQYW5lbDtcbiAgY2FsY3VsYXRvcj86IENhbGN1bGF0b3JUb29sO1xufVxuZXhwb3J0IGNvbnN0IEFjdGl2aXR5RG9jdW1lbnQ6IHouWm9kVHlwZTxBY3Rpdml0eURvY3VtZW50LCB6LlpvZFR5cGVEZWYsIHVua25vd24+ID1cbiAgei5vYmplY3Qoe1xuICAgIHNjaGVtYVZlcnNpb246IHoubGl0ZXJhbCgyKSxcbiAgICBtZXRhOiBBY3Rpdml0eU1ldGEsXG4gICAgc2VjdGlvbnM6IHouYXJyYXkoU2VjdGlvbiksXG4gICAgcmVmZXJlbmNlUGFuZWw6IFJlZmVyZW5jZVBhbmVsLm9wdGlvbmFsKCksXG4gICAgY2FsY3VsYXRvcjogQ2FsY3VsYXRvclRvb2wub3B0aW9uYWwoKSxcbiAgfSk7XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHVwZ3JhZGUudHMgXHUyMDE0IHNlcnZlci1zaWRlIHVwZ3JhZGUtb24tcmVhZCAoY29tcG9uZW50cy1hcy1kYXRhIHJ1bGluZyA0QSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgcmVhZCBBUEkgKFMyKSB1cGdyYWRlcyBldmVyeSBzdG9yZWQgYWN0aXZpdHlfdmVyc2lvbnMuY29udGVudCB0byB0aGVcbi8vIENVUlJFTlQgc2NoZW1hIGJlZm9yZSBzYW5pdGl6aW5nIGFuZCBzZXJ2aW5nIGl0LCBzbyB0aGUgdmlld2VyIG9ubHkgZXZlclxuLy8gc2VlcyB0aGUgbGF0ZXN0IHNoYXBlLiBUaGlzIG1vZHVsZSBpcyB0aGF0IHNlYW0uXG4vL1xuLy8gVGhlIGNoYWluIGlzIEVNUFRZIHRvZGF5LCBkZWxpYmVyYXRlbHk6IHNjaGVtYVZlcnNpb24gaXMgMiBhbmQgdGhlIDFcdTIxOTIyXG4vLyByZXNoYXBlIHdhcyBhIGdyZWVuZmllbGQgaGFyZC1jdXQgd2l0aCBubyBtaWdyYXRlIHBhdGggKGRvY3VtZW50LnRzIGhlYWRlciBcdTIwMTRcbi8vIGEgc3RyYXkgdjEgZmFpbHMgbG91ZGx5IHJhdGhlciB0aGFuIG1pcy1wYXJzaW5nKS4gV2hlbiBzY2hlbWFWZXJzaW9uIDNcbi8vIGxhbmRzLCBpdHMgbWlncmF0aW9uIGlzIG9uZSBwdXJlIGVudHJ5IGluIFVQR1JBREVTIGJlbG93OyBzdG9yZWQgcm93cyBzdGF5XG4vLyBhdCB0aGVpciBvcmlnaW5hbCB2ZXJzaW9uIGZvcmV2ZXIgYW5kIGFyZSB1cGdyYWRlZCBvbiByZWFkLCBuZXZlciBtdXRhdGVkLlxuLy9cbi8vIERpc3RpbmN0IGZyb20gdGhlIHR3byBvdGhlciBcInVwZ3JhZGVcIiBsYXllcnMsIG9uIHB1cnBvc2U6XG4vLyAgIC0gTWFyay9kZWZpbml0aW9uIGxlZ2FjeSBwcmVwcm9jZXNzaW5nIChpbmxpbmUudHMpIHJ1bnMgSU5TSURFXG4vLyAgICAgQWN0aXZpdHlEb2N1bWVudC5wYXJzZSBcdTIwMTQgYWRkaXRpdmUgc2hhcGUgZHJpZnQgd2l0aGluIG9uZSBzY2hlbWFWZXJzaW9uLlxuLy8gICAtIG1pZ3JhdGVTdWJtaXNzaW9uUmVzcG9uc2VzIChzdWJtaXNzaW9uLnRzKSBpcyB0aGUgU1VCTUlTU0lPTiB3aXJlJ3Ncbi8vICAgICBsYWRkZXIgXHUyMDE0IGEgZGlmZmVyZW50IGRvY3VtZW50IHdpdGggaXRzIG93biB2ZXJzaW9uaW5nLlxuLy8gVGhpcyBtb2R1bGUgb3ducyBvbmx5IHRoZSB0b3AtbGV2ZWwgQWN0aXZpdHlEb2N1bWVudCBzY2hlbWFWZXJzaW9uLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgQWN0aXZpdHlEb2N1bWVudCB9IGZyb20gJy4vZG9jdW1lbnQuanMnO1xuXG4vKiogVGhlIHNjaGVtYVZlcnNpb24gdGhpcyBidWlsZCBwYXJzZXMgYW5kIHNlcnZlcy4gR3VhcmQtdGVzdGVkIGFnYWluc3QgdGhlXG4gKiBBY3Rpdml0eURvY3VtZW50IGxpdGVyYWwgc28gdGhlIGNvbnN0YW50IGNhbid0IGRyaWZ0IGZyb20gdGhlIHBhcnNlci4gKi9cbmV4cG9ydCBjb25zdCBBQ1RJVklUWV9TQ0hFTUFfVkVSU0lPTiA9IDI7XG5cbi8qKiBUaHJvd24gd2hlbiBzdG9yZWQgY29udGVudCBjYW5ub3QgYmUgYnJvdWdodCB0byB0aGUgY3VycmVudCBzY2hlbWEuIFRoZVxuICogcmVhZCBBUEkgbWFwcyB0aGlzIHRvIGFuIGV4cGxpY2l0IGVycm9yIHN0YXRlIChmYWlsdXJlLW1vZGVzIHRhYmxlOiBcInVwZ3JhZGVcbiAqIGNoYWluIGJ1ZyBvbiBvbGQgdmVyc2lvblwiIFx1MjE5MiBjbGVhciBlcnJvciwgbmV2ZXIgYSB3aGl0ZSBzY3JlZW4pLiAqL1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIC8qKiBUaGUgc2NoZW1hVmVyc2lvbiB0aGUgc3RvcmVkIGRvY3VtZW50IGNsYWltZWQsIHdoZW4gcmVhZGFibGUuICovXG4gICAgcmVhZG9ubHkgc3RvcmVkVmVyc2lvbj86IG51bWJlcixcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ1VwZ3JhZGVFcnJvcic7XG4gIH1cbn1cblxuLyoqIE9uZSBzdGVwIG9mIHRoZSBjaGFpbjogYSBQVVJFIGpzb24gXHUyMTkyIGpzb24gcmV3cml0ZSBmcm9tIGBmcm9tYCB0byBgZnJvbSsxYC5cbiAqIE5vIEkvTywgbm8gcmFuZG9tbmVzcywgbm8gRGF0ZSBcdTIwMTQgdXBncmFkaW5nIHRoZSBzYW1lIHN0b3JlZCByb3cgdHdpY2UgbXVzdFxuICogeWllbGQgaWRlbnRpY2FsIG91dHB1dCAodGhlIHBlci12ZXJzaW9uIHJlYWQgY2FjaGUgZGVwZW5kcyBvbiBpdCkuICovXG5pbnRlcmZhY2UgVXBncmFkZVN0ZXAge1xuICByZWFkb25seSBmcm9tOiBudW1iZXI7XG4gIHJlYWRvbmx5IHJ1bjogKHJhdzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG4vLyBUaGUgY2hhaW4uIEFwcGVuZC1vbmx5OyBlYWNoIGVudHJ5IGJ1bXBzIGV4YWN0bHkgb25lIHZlcnNpb24uIEVtcHR5IHRvZGF5IFx1MjAxNFxuLy8gc2VlIHRoZSBoZWFkZXIgZm9yIHdoeSB2MSBkZWxpYmVyYXRlbHkgaGFzIG5vIGVudHJ5LlxuY29uc3QgVVBHUkFERVM6IHJlYWRvbmx5IFVwZ3JhZGVTdGVwW10gPSBbXTtcblxuZXhwb3J0IGludGVyZmFjZSBVcGdyYWRlUmVzdWx0IHtcbiAgLyoqIFRoZSBkb2N1bWVudCwgcGFyc2VkIGFuZCB2YWxpZGF0ZWQgYXQgdGhlIENVUlJFTlQgc2NoZW1hLiAqL1xuICBkb2M6IEFjdGl2aXR5RG9jdW1lbnQ7XG4gIC8qKiBUaGUgc2NoZW1hVmVyc2lvbiB0aGUgc3RvcmVkIGNvbnRlbnQgYXJyaXZlZCBhdCAoPT09IGN1cnJlbnQgd2hlbiBub1xuICAgKiBjaGFpbiBzdGVwIHJhbikuIENhbGxlcnMgbWF5IGxvZyBpdDsgdGhlIGNhY2hlIHN0b3JlcyB0aGUgdGFyZ2V0LiAqL1xuICBmcm9tU2NoZW1hVmVyc2lvbjogbnVtYmVyO1xufVxuXG4vKipcbiAqIEJyaW5nIHJhdyBzdG9yZWQgY29udGVudCAoYWN0aXZpdHlfdmVyc2lvbnMuY29udGVudCkgdG8gdGhlIGN1cnJlbnQgc2NoZW1hXG4gKiBhbmQgdmFsaWRhdGUgaXQuIFRocm93cyBVcGdyYWRlRXJyb3Igb24gYW55IGNvbnRlbnQgdGhpcyBidWlsZCBjYW5ub3Qgc2VydmVcbiAqIFx1MjAxNCBhbiB1bmtub3duL2Z1dHVyZSB2ZXJzaW9uLCBhIHZlcnNpb24gd2l0aCBubyBjaGFpbiBwYXRoLCBvciBjb250ZW50IHRoYXRcbiAqIGZhaWxzIHZhbGlkYXRpb24gYWZ0ZXIgdXBncmFkaW5nLiBOZXZlciByZXR1cm5zIGEgcGFydGlhbGx5LXVwZ3JhZGVkIGRvYy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZ3JhZGVBY3Rpdml0eURvY3VtZW50KHJhdzogdW5rbm93bik6IFVwZ3JhZGVSZXN1bHQge1xuICBpZiAocmF3ID09PSBudWxsIHx8IHR5cGVvZiByYXcgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkocmF3KSkge1xuICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoJ1N0b3JlZCBjb250ZW50IGlzIG5vdCBhbiBvYmplY3QnKTtcbiAgfVxuICBjb25zdCBzdG9yZWQgPSByYXcgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGNvbnN0IHZlcnNpb24gPSBzdG9yZWQuc2NoZW1hVmVyc2lvbjtcbiAgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcih2ZXJzaW9uKSkge1xuICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoJ1N0b3JlZCBjb250ZW50IGhhcyBubyBpbnRlZ2VyIHNjaGVtYVZlcnNpb24nKTtcbiAgfVxuICBpZiAodmVyc2lvbiA+IEFDVElWSVRZX1NDSEVNQV9WRVJTSU9OKSB7XG4gICAgLy8gQ29udGVudCB3cml0dGVuIGJ5IGEgTkVXRVIgYnVpbGQgdGhhbiB0aGlzIG9uZSAoZGVwbG95LW9yZGVyIHNsaXApLlxuICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoXG4gICAgICBgU3RvcmVkIHNjaGVtYVZlcnNpb24gJHt2ZXJzaW9ufSBpcyBuZXdlciB0aGFuIHRoaXMgYnVpbGQncyBgICtcbiAgICAgICAgYCR7QUNUSVZJVFlfU0NIRU1BX1ZFUlNJT059IFx1MjAxNCByZWZ1c2luZyB0byBndWVzc2AsXG4gICAgICB2ZXJzaW9uLFxuICAgICk7XG4gIH1cblxuICBsZXQgY3VycmVudCA9IHN0b3JlZDtcbiAgbGV0IGF0ID0gdmVyc2lvbjtcbiAgd2hpbGUgKGF0IDwgQUNUSVZJVFlfU0NIRU1BX1ZFUlNJT04pIHtcbiAgICBjb25zdCBzdGVwID0gVVBHUkFERVMuZmluZCgodSkgPT4gdS5mcm9tID09PSBhdCk7XG4gICAgaWYgKCFzdGVwKSB7XG4gICAgICAvLyB2MSBsYW5kcyBoZXJlIGJ5IGRlc2lnbiAoZ3JlZW5maWVsZCBoYXJkLWN1dDogbm8gbWlncmF0ZSgxXHUyMTkyMikpLlxuICAgICAgdGhyb3cgbmV3IFVwZ3JhZGVFcnJvcihcbiAgICAgICAgYE5vIHVwZ3JhZGUgcGF0aCBmcm9tIHNjaGVtYVZlcnNpb24gJHthdH0gXHUyMDE0IGNhbm5vdCBzZXJ2ZWAsXG4gICAgICAgIHZlcnNpb24sXG4gICAgICApO1xuICAgIH1cbiAgICBjdXJyZW50ID0gc3RlcC5ydW4oY3VycmVudCk7XG4gICAgYXQgKz0gMTtcbiAgfVxuXG4gIGNvbnN0IHBhcnNlZCA9IEFjdGl2aXR5RG9jdW1lbnQuc2FmZVBhcnNlKGN1cnJlbnQpO1xuICBpZiAoIXBhcnNlZC5zdWNjZXNzKSB7XG4gICAgdGhyb3cgbmV3IFVwZ3JhZGVFcnJvcihcbiAgICAgIGBDb250ZW50IGZhaWxlZCB2YWxpZGF0aW9uIGF0IHNjaGVtYVZlcnNpb24gJHthdH06IGAgK1xuICAgICAgICBwYXJzZWQuZXJyb3IuaXNzdWVzXG4gICAgICAgICAgLnNsaWNlKDAsIDMpXG4gICAgICAgICAgLm1hcCgoaSkgPT4gYCR7aS5wYXRoLmpvaW4oJy4nKX06ICR7aS5tZXNzYWdlfWApXG4gICAgICAgICAgLmpvaW4oJzsgJyksXG4gICAgICB2ZXJzaW9uLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHsgZG9jOiBwYXJzZWQuZGF0YSwgZnJvbVNjaGVtYVZlcnNpb246IHZlcnNpb24gfTtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gcmVnaXN0cnkvcmVnaXN0cnkudHMgXHUyMDE0IHRoZSBzaW5nbGUgYmxvY2sgcmVnaXN0cnkgKFMwLCBydWxpbmcgUTFBKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE9uZSBlbnRyeSBwZXIgc2NoZW1hIGJsb2NrIHR5cGUuIFRoZSBndWFyZCBzdWl0ZSAodGVzdHMvcmVnaXN0cnkudGVzdC50cylcbi8vIHByb3ZlczogY292ZXJhZ2UgaXMgZXhhY3QgYWdhaW5zdCB0aGUgQmxvY2sgdW5pb24sIG51bWJlcmluZyBkZWNsYXJhdGlvbnNcbi8vIGFncmVlIHdpdGggYmxvY2stcHJlZGljYXRlcy50cywgZmFtaWxpZXMgYWdyZWUgd2l0aCBpc0dyYWRlYWJsZSwgdmFyaWFudHNcbi8vIGFncmVlIHdpdGggdGhlIHNjaGVtYSdzIGludGVyYWN0aW9uIHVuaW9ucywgYW5kIGV2ZXJ5IGludGVyYWN0aXZlIGVudHJ5XG4vLyBjYXJyaWVzIGFuIGExMXkgc3RvcnkuIEFkZCBhIGJsb2NrIHR5cGUgdG8gdGhlIHNjaGVtYSBhbmQgdGhpcyBmaWxlIGZhaWxzIHRvXG4vLyBjb21waWxlIChCbG9ja1JlZ2lzdHJ5IGlzIGtleWVkIGJ5IHRoZSB1bmlvbikgXHUyMDE0IHRoYXQgaXMgdGhlIHBvaW50LlxuLy9cbi8vIFByaW50IGRlY2xhcmF0aW9ucyBzdGFydGVkIEZBSVRIRlVMIHRvIHRoZSBiYXNlbGluZSBwcmludCBsYXllclxuLy8gKHJlbmRlcmVyL3NyYy9ydW50aW1lL3N0eWxlcy50cyBAbWVkaWEgcHJpbnQpLCBpbmNsdWRpbmcgaXRzIGtub3duIG9kZGl0aWVzLFxuLy8gc28gdGhhdCBpbXByb3ZpbmcgdGhlbSB3b3VsZCBiZSBhIGRlbGliZXJhdGUgZGVjaXNpb24gcmF0aGVyIHRoYW4gYSBzaWxlbnRcbi8vIHJlZ2lzdHJ5IHNpZGUgZWZmZWN0LiBTNSAodGhlIHByaW50IHNsaWNlKSBJUyB0aGF0IGRlY2lzaW9uIHBvaW50LCBhbmQgaXRcbi8vIHJ1bGVkIChTNS1PVjYpOiBtYXRoX2Jsb2NrLCBkYXRhX3Bsb3QsIGFuZCBzZWxmX2V4cGxhbmF0aW9uIG5vdyBkZWNsYXJlXG4vLyBicmVhay1pbnNpZGU6IGF2b2lkIFx1MjAxNCBhIG51bWJlcmVkIGVxdWF0aW9uLCBhIGNoYXJ0LCBvciBhIHByb21wdCBzZXBhcmF0ZWRcbi8vIGZyb20gaXRzIHdyaXRpbmcgYm94IGlzIGEgcHJpbnQgYnVnIG9uIGFueSBzdXJmYWNlIFx1MjAxNCBhbmQgdGhlIGF1dGhvciBleHRlbmRlZFxuLy8gaXQgdG8gc2hvcnRfYW5zd2VyIGFuZCBlc3NheSwgdGhlIHR3byB1bm5hbWVkIHNpYmxpbmdzIHRoYXQgc2hhcmVcbi8vIHNlbGZfZXhwbGFuYXRpb24ncyB3cml0aW5nLWJveCBzdHJ1Y3R1cmUuIFRoZSBwYXJpdHkgZ2F0ZSBhc3NlcnRzXG4vLyBUSElTIHNwZWMgb24gYm90aCBzdXJmYWNlcyByYXRoZXIgdGhhbiBkaWZmaW5nIGFnYWluc3QgcmVuZGVyZXIgb3V0cHV0XG4vLyAocHJpbnRFeHBlY3RhdGlvbnMudHMpLCB3aGljaCBpcyBleGFjdGx5IHdoYXQgbWFrZXMgdGhlIGltcHJvdmVtZW50XG4vLyBleHByZXNzaWJsZTsgcHVibGlzaGVkIHBhZ2VzIGtlZXAgdGhlaXIgY3VycmVudCBiZWhhdmlvciB1bnRpbCB0aGV5IHJldGlyZS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7XG4gIGlzR3JhZGVhYmxlLFxuICBpc1BhZ2VOdW1iZXJlZCxcbiAgdHlwZSBCbG9jayxcbn0gZnJvbSAnQGFjdGl2aXR5L3NjaGVtYSc7XG5pbXBvcnQgdHlwZSB7XG4gIEJsb2NrQ2F0ZWdvcnksXG4gIEJsb2NrUmVnaXN0cnksXG4gIEJsb2NrVHlwZSxcbiAgQ2hlY2tlZFN0YXRlRmFtaWx5LFxufSBmcm9tICcuL3R5cGVzLmpzJztcblxuLyoqIEJsYW5rVG9rZW4gZmllbGRzIHN0cmlwcGVkIGZyb20gaW5saW5lIGNvbnRlbnQgd2hlcmV2ZXJcbiAqIFNhbml0aXplU3BlYy5pbmxpbmVCbGFua1NlY3JldHMgaXMgc2V0LiBgaGludGAgZGVsaWJlcmF0ZWx5IHN1cnZpdmVzIFx1MjAxNCBpdCBpc1xuICogYSBwcmUtY2hlY2sgYWZmb3JkYW5jZSB0aGUgc3R1ZGVudCBtYXkgb3BlbjsgcGVyLW1pc3Rha2UgZmVlZGJhY2sgaXNcbiAqIHJldHVybmVkIGJ5IHRoZSBjaGVjayBSUEMgKHJ1bGluZyAyLjFBKSwgc28gdGhlIHdob2xlIG1pc3Rha2VGZWVkYmFjayBhcnJheVxuICogKG1hdGNoIHN0cmluZ3MgQU5EIGZlZWRiYWNrIHRleHQpIHN0cmlwcy4gYGFuc3dlclR5cGVgIHN1cnZpdmVzOiBpdCBzaGFwZXNcbiAqIHRoZSBpbnB1dCAobnVtZXJpYyBrZXlib2FyZHMpLiAqL1xuZXhwb3J0IGNvbnN0IEJMQU5LX1NFQ1JFVF9GSUVMRFMgPSBbXG4gICdhbnN3ZXInLFxuICAnYWNjZXB0YWJsZUFuc3dlcnMnLFxuICAnbWlzdGFrZUZlZWRiYWNrJyxcbiAgJ3RvbGVyYW5jZScsXG4gICdlcXVpdmFsZW5jZScsXG5dIGFzIGNvbnN0O1xuXG4vKiogTWF0aFByb21wdCBmaWVsZHMgc3RyaXBwZWQgd2hlcmV2ZXIgYSBwcm9tcHRzIGFycmF5IGFwcGVhcnMgKG1hdGhfYmxvY2tcbiAqIGJsb2NrcyBBTkQgbWF0aF9pbmxpbmUgbm9kZXMpLiBUaGUgZ2FwIG1hcmtlcnMgaW4gdGhlIGxhdGV4IGFyZSB0aGUgZ2Fwc1xuICogdGhlbXNlbHZlcyAoYWxyZWFkeSBzZXJ2ZWQgZW1wdHkgdG9kYXkgXHUyMDE0IHNlcmlhbGl6ZS50cyBwcmVjZWRlbnQpOyB0aGVcbiAqIHByb21wdCdzIGFuc3dlci9ncmFkaW5nIGNvbmZpZyBpcyB0aGUgc2VjcmV0LiBgYWNjZXB0YWJsZUFuc3dlcnNgIHdhc1xuICogTUlTU0lORyBmcm9tIHRoZSBTMCBkZWNsYXJhdGlvbiAoXCJhbHNvIGFjY2VwdFwiIGFsdGVybmF0aXZlIGFuc3dlcnMgXHUyMDE0IGEgcmVhbFxuICoga2V5IGxlYWspIFx1MjAxNCBjYXVnaHQgYnkgUzIncyBjcm9zcy1jaGVjayBhZ2FpbnN0IHRoZSBNYXRoUHJvbXB0IHNjaGVtYSBhbmRcbiAqIGFkZGVkIGJlZm9yZSB0aGUgZmlyc3Qgc2FuaXRpemVkIGJ5dGUgd2FzIHNlcnZlZC4gKi9cbmV4cG9ydCBjb25zdCBNQVRIX1BST01QVF9TRUNSRVRfRklFTERTID0gW1xuICAnYW5zd2VyJyxcbiAgJ2FjY2VwdGFibGVBbnN3ZXJzJyxcbiAgJ2VxdWl2YWxlbmNlJyxcbiAgJ3RvbGVyYW5jZScsXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgYmxvY2tSZWdpc3RyeTogQmxvY2tSZWdpc3RyeSA9IHtcbiAgcGFyYWdyYXBoOiB7XG4gICAgdHlwZTogJ3BhcmFncmFwaCcsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ3BhcmFncmFwaCcsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAncHJvc2UnIH0sXG4gIH0sXG5cbiAgaGVhZGluZzoge1xuICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnaGVhZGluZycsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAncHJvc2UnLCBrZWVwV2l0aE5leHQ6IHRydWUgfSxcbiAgfSxcblxuICBtYXRoX2Jsb2NrOiB7XG4gICAgdHlwZTogJ21hdGhfYmxvY2snLFxuICAgIC8vIEdhcC1iZWFyaW5nIChNb2RlbCBBIHByb21wdHMpIFx1MjE5MiBhdXRvLWdyYWRhYmxlICsgbnVtYmVyZWQgKyBpbnRlcmFjdGl2ZTtcbiAgICAvLyBhIHBsYWluIGRpc3BsYXkgZXF1YXRpb24gcmVzb2x2ZXMgc3RhdGljIHRocm91Z2ggZmFtaWx5T2YoKS5cbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsIC8vIGZhaXRoZnVsOiByZW5kZXJlciBlbWl0cyBjb250ZW50IGV2ZW4gd2hlbiBnYXAtYmVhcmluZ1xuICAgIG51bWJlcmVkOiAnd2hlbl9ncmFkYWJsZScsXG4gICAgYW5hbHl0aWNzS2V5OiAnbWF0aF9ibG9jaycsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFsnc29sdXRpb24nXSwgaW5saW5lQmxhbmtTZWNyZXRzOiB0cnVlIH0sXG4gICAgLy8gV0FTIGEgZmFpdGhmdWwgb2RkaXR5IChhYnNlbnQgZnJvbSB0aGUgYmFzZWxpbmUgYnJlYWstaW5zaWRlOmF2b2lkIGxpc3QsXG4gICAgLy8gc28gYSBudW1iZXJlZCBkaXNwbGF5IGVxdWF0aW9uIGNvdWxkIHNwbGl0IGFjcm9zcyBhIHBhZ2UpLiBGSVhFRCBieVxuICAgIC8vIHJ1bGluZyBTNS1PVjYgXHUyMDE0IHN0aWxsIG5vdCBpbiB0aGUgc2hvd0Fuc3dlcnMgc2V0LCB3aGljaCBpcyB0aGUgc2VwYXJhdGVcbiAgICAvLyBhbnN3ZXIta2V5LXZhcmlhbnQgcXVlc3Rpb24gUzUuNSBvd25zLlxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICd1bmRlcmxpbmUtYmxhbmtzJyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnRWFjaCBpbi1lcXVhdGlvbiBnYXAgaXMgYSB0ZXh0IGlucHV0IGluIHRhYiBvcmRlciwgbGFiZWxlZCB3aXRoIGl0cyAnICtcbiAgICAgICAgJ3Bvc2l0aW9uIHdpdGhpbiB0aGUgZXF1YXRpb24gKFwiZ2FwIDEgb2YgMlwiKS4gVGhlIFBST0JMRU0gbnVtYmVyIGlzICcgK1xuICAgICAgICAnYW5ub3VuY2VkIG9uY2UgYnkgdGhlIGJsb2NrIHdyYXBwZXIsIHdoaWNoIGlzIGEgbGFiZWxsZWQgZ3JvdXAgXHUyMDE0IG5vdCAnICtcbiAgICAgICAgJ3JlcGVhdGVkIG9uIGV2ZXJ5IGdhcCAodmlld2VyLW51bWJlcmluZyBEMykuIFZhbHVlcyB0eXBlIGFzIHBsYWluIHRleHQ7ICcgK1xuICAgICAgICAndmVyZGljdHMgYXJlIGFubm91bmNlZCB2aWEgdGhlIHNoYXJlZCBzdGF0ZS1waWxsIGFyaWEtbGl2ZSByZWdpb24uJyxcbiAgICB9LFxuICB9LFxuXG4gIGltYWdlOiB7XG4gICAgdHlwZTogJ2ltYWdlJyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnaW1hZ2UnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ2ZpZ3VyZScgfSxcbiAgfSxcblxuICBjYWxsb3V0OiB7XG4gICAgdHlwZTogJ2NhbGxvdXQnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdjYWxsb3V0JyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICd2YXJpYW50LWJvcmRlci1ib3gnIH0sXG4gIH0sXG5cbiAgcHJvYmxlbToge1xuICAgIHR5cGU6ICdwcm9ibGVtJyxcbiAgICAvLyBOdW1iZXJlZCBsZWdhY3kgcHJvc2UgcHJvYmxlbTsgY2FycmllcyBhIHNvbHV0aW9uIGJ1dCBubyBhdXRvLWdyYWRlZFxuICAgIC8vIHJlc3BvbnNlIChpc0dyYWRlYWJsZTogZmFsc2UpIFx1MjE5MiBzdGF0aWMgZmFtaWx5LCBubyBzdGF0ZSBjaHJvbWUuIFNjaGVtYVxuICAgIC8vIG9ycGhhbjogbm8gZWRpdG9yIE5vZGVWaWV3OyBzdGlsbCByZW5kZXJhYmxlLCBzbyBpdCBrZWVwcyBhbiBlbnRyeS5cbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdwcm9ibGVtJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogWydzb2x1dGlvbiddIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3Byb3NlJyB9LFxuICB9LFxuXG4gIGZpbGxfaW5fYmxhbms6IHtcbiAgICB0eXBlOiAnZmlsbF9pbl9ibGFuaycsXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAnZmlsbF9pbl9ibGFuaycsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFsnc29sdXRpb24nXSwgaW5saW5lQmxhbmtTZWNyZXRzOiB0cnVlIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3VuZGVybGluZS1ibGFua3MnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdFYWNoIGJsYW5rIGlzIGEgdGV4dCBpbnB1dCBpbiB0YWIgb3JkZXIsIGxhYmVsZWQgd2l0aCBpdHMgc3ViLXBhcnQgJyArXG4gICAgICAgICdhbmQgcG9zaXRpb24gKFwiUGFydCBiLCBibGFuayAyIG9mIDNcIikgb24gYSBudW1iZXJlZCBtdWx0aS1ibGFuayAnICtcbiAgICAgICAgJ3Byb2JsZW0sIGFuZCBcIkJsYW5rIDIgb2YgM1wiIG90aGVyd2lzZS4gVGhlIFBST0JMRU0gbnVtYmVyIGlzICcgK1xuICAgICAgICAnYW5ub3VuY2VkIG9uY2UgYnkgdGhlIGJsb2NrIHdyYXBwZXIsIHdoaWNoIGlzIGEgbGFiZWxsZWQgZ3JvdXAsICcgK1xuICAgICAgICAncmF0aGVyIHRoYW4gcmVwZWF0ZWQgb24gZXZlcnkgYmxhbmsgKHZpZXdlci1udW1iZXJpbmcgRDMvTjcpLiAnICtcbiAgICAgICAgJ0hpbnQgYW5kIG1pc3Rha2UgJyArXG4gICAgICAgICdhZmZvcmRhbmNlcyBhcmUgYnV0dG9ucyByZWFjaGFibGUgYnkgVGFiOyB0aGUgb3BlbmVkIHBvcG92ZXIgdHJhcHMgJyArXG4gICAgICAgICdubyBmb2N1cyBhbmQgY2xvc2VzIG9uIEVzY2FwZS4gVmVyZGljdHMgYW5ub3VuY2UgdmlhIGFyaWEtbGl2ZS4nLFxuICAgIH0sXG4gIH0sXG5cbiAgYnVsbGV0X2xpc3Q6IHtcbiAgICB0eXBlOiAnYnVsbGV0X2xpc3QnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdidWxsZXRfbGlzdCcsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAncHJvc2UnIH0sXG4gIH0sXG5cbiAgb3JkZXJlZF9saXN0OiB7XG4gICAgdHlwZTogJ29yZGVyZWRfbGlzdCcsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ29yZGVyZWRfbGlzdCcsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAncHJvc2UnIH0sXG4gIH0sXG5cbiAgaW50ZXJhY3RpdmVfZ3JhcGg6IHtcbiAgICB0eXBlOiAnaW50ZXJhY3RpdmVfZ3JhcGgnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLCAvLyBkaXNwbGF5IHZhcmlhbnQgcmVzb2x2ZXMgc3RhdGljIHZpYSBmYW1pbHlPZigpXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJywgLy8gZGlzcGxheSB2YXJpYW50IHJlc29sdmVzIGNvbnRlbnQgdmlhIGNhdGVnb3J5T2YoKVxuICAgIG51bWJlcmVkOiAnd2hlbl9ncmFkYWJsZScsXG4gICAgYW5hbHl0aWNzS2V5OiAnaW50ZXJhY3RpdmVfZ3JhcGgnLFxuICAgIHZhcmlhbnRzOiBbXG4gICAgICAncGxvdF9wb2ludCcsXG4gICAgICAncGxvdF9mdW5jdGlvbicsXG4gICAgICAnc2hhZGVfcmVnaW9uJyxcbiAgICAgICdncmFwaF9pbmVxdWFsaXR5JyxcbiAgICAgICdwbG90X3JheScsXG4gICAgICAncGxvdF9zZWdtZW50JyxcbiAgICAgICdkaXNwbGF5JyxcbiAgICBdLFxuICAgIHNhbml0aXplOiB7XG4gICAgICAvLyBUaGUgd2lkZ2V0IG5lZWRzIGhhbmRsZSBjb3VudCAvIGZhbWlseSwgd2hpY2ggbGl2ZSBpbiB0aGUga2V5IHRoZVxuICAgICAgLy8gdmlld2VyIG5ldmVyIGdldHMuIERlcml2ZWQgKyB3aGl0ZWxpc3RlZDsgc2VlIFNhbml0aXplU3BlYy5cbiAgICAgIGRlcml2ZVF1ZXN0aW9uU2hhcGU6IHRydWUsXG4gICAgICAvLyBWYXJpYW50LXNjb3BlZCBrZXlzOiBwYXRocyB0aGF0IGRvbid0IGV4aXN0IG9uIGFuIGluc3RhbmNlJ3NcbiAgICAgIC8vIGludGVyYWN0aW9uIHNpbXBseSBkb24ndCBtYXRjaC4gYGFsbG93Tm9Tb2x1dGlvbmAgU1VSVklWRVMgKGl0IHJlbmRlcnNcbiAgICAgIC8vIHRoZSBcIm5vIHNvbHV0aW9uXCIgY29udHJvbCk7IGBub1NvbHV0aW9uQ29ycmVjdGAgaXMgdGhlIGFuc3dlci5cbiAgICAgIHN0cmlwOiBbXG4gICAgICAgICdpbnRlcmFjdGlvbi5jb3JyZWN0UG9pbnRzJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLnRvbGVyYW5jZScsXG4gICAgICAgICdpbnRlcmFjdGlvbi5tb2RlbHMnLFxuICAgICAgICAnaW50ZXJhY3Rpb24uZG9tYWlucycsXG4gICAgICAgICdpbnRlcmFjdGlvbi5yZWdpb25zJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLmluZXF1YWxpdGllcycsXG4gICAgICAgICdpbnRlcmFjdGlvbi5yYXlzJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLnNlZ21lbnRzJyxcbiAgICAgICAgJ21pc3Rha2VGZWVkYmFjaycsXG4gICAgICAgICdzb2x1dGlvbicsXG4gICAgICAgICdub1NvbHV0aW9uQ29ycmVjdCcsXG4gICAgICAgICdidWlsdGluRmVlZGJhY2snLFxuICAgICAgXSxcbiAgICB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdzdGF0aWMtc3ZnJyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnVGhlIGNhbnZhcyBpcyBmb2N1c2FibGU7IGhhbmRsZXMgbW92ZSBieSBhcnJvdyBrZXlzIHdpdGggcG9zaXRpb24gJyArXG4gICAgICAgICduYXJyYXRpb24gdG8gYSB2aXN1YWxseS1oaWRkZW4gYXJpYS1saXZlIHJlZ2lvbiAoYSB2aXNpYmxlIHJlYWRvdXQgJyArXG4gICAgICAgICd3b3VsZCBoYW5kIG92ZXIgdGhlIGFuc3dlciBcdTIwMTQgcmVhZGluZyB0aGUgZ3JpZCBpcyB0aGUgc2tpbGwpLiAnICtcbiAgICAgICAgJ1Bvc3QtY2hlY2sgcmVzdWx0cyBhcmUgdmlzaWJsZSB0ZXh0LiBUb3VjaCB0YXJnZXRzIG1lZXQgNDRweC4nLFxuICAgIH0sXG4gIH0sXG5cbiAgbXVsdGlwbGVfY2hvaWNlOiB7XG4gICAgdHlwZTogJ211bHRpcGxlX2Nob2ljZScsXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAnbXVsdGlwbGVfY2hvaWNlJyxcbiAgICBzYW5pdGl6ZToge1xuICAgICAgLy8gUGVyLWNob2ljZSBmZWVkYmFjayByZXR1cm5zIHZpYSB0aGUgY2hlY2sgUlBDICgyLjFBKSwgbGlrZSBibGFua3MnLlxuICAgICAgLy8gbWlzY29uY2VwdGlvbklkIGlzIHNlcnZlci1zaWRlIG1ldGFkYXRhIChhIGRpc3RyYWN0b3JcdTIxOTJyZWdpc3RyeVxuICAgICAgLy8gYmluZGluZyk7IGEgcHJlLWNoZWNrIGNsaWVudCBjb3VsZCBvdGhlcndpc2UgcmVhZCB3aGljaCB3cm9uZ1xuICAgICAgLy8gYW5zd2VycyB3ZXJlIGFudGljaXBhdGVkLlxuICAgICAgc3RyaXA6IFtcbiAgICAgICAgJ2Nob2ljZXNbXS5jb3JyZWN0JyxcbiAgICAgICAgJ2Nob2ljZXNbXS5mZWVkYmFjaycsXG4gICAgICAgICdjaG9pY2VzW10ubWlzY29uY2VwdGlvbklkJyxcbiAgICAgICAgJ3NvbHV0aW9uJyxcbiAgICAgIF0sXG4gICAgfSxcbiAgICBwcmludDoge1xuICAgICAgYnJlYWtJbnNpZGU6ICdhdm9pZCcsXG4gICAgICB0cmVhdG1lbnQ6ICdjaG9pY2UtbGV0dGVycycsXG4gICAgICAvLyBQcmludGVkIHZlcnNpb25zIHJlYXJyYW5nZSB0aGUgY2hvaWNlczsgYSBxdWVzdGlvbiB0aGF0IHNheXMgXCJhbGwgb2ZcbiAgICAgIC8vIHRoZSBhYm92ZVwiIG9wdHMgb3V0IHBlci1ibG9jayAoRDE3QSkuIE5PVCBzZXJ2ZVNodWZmbGVkOiB0aGUgc3R1ZGVudFxuICAgICAgLy8gc2NyZWVuIGtlZXBzIHRoZSBhdXRob3JlZCBvcmRlciwgYmVjYXVzZSB0aGUgYW5zd2VyIGlzIHRoZSBjaG9pY2UgaWRcbiAgICAgIC8vIGFuZCByZWFycmFuZ2luZyBpdCB0aGVyZSBidXlzIG5vdGhpbmcuXG4gICAgICBzaHVmZmxlZDogWydjaG9pY2VzJ10sXG4gICAgICBzaHVmZmxlTG9ja2VkQnk6ICdsb2NrQ2hvaWNlT3JkZXInLFxuICAgIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdOYXRpdmUgcmFkaW8gKHNpbmdsZSkgLyBjaGVja2JveCAobXVsdGkpIGlucHV0cyBncm91cGVkIGluIGEgJyArXG4gICAgICAgICdmaWVsZHNldCB3aG9zZSBsZWdlbmQgaXMgdGhlIHByb21wdDsgZnVsbCBsYWJlbCBjbGljayB0YXJnZXRzLiAnICtcbiAgICAgICAgJ1N0YW5kYXJkIGFycm93LWtleSByYWRpbyBiZWhhdmlvcjsgdmVyZGljdHMgYW5ub3VuY2UgdmlhIGFyaWEtbGl2ZS4nLFxuICAgIH0sXG4gIH0sXG5cbiAgbWF0Y2hpbmc6IHtcbiAgICB0eXBlOiAnbWF0Y2hpbmcnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ21hdGNoaW5nJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogWydrZXknLCAnc29sdXRpb24nXSB9LFxuICAgIC8vIEE5L0UzOiBjb25kaXRpb25hbCwgYW5kIGRlY2xhcmVkIGFzIHN1Y2ggXHUyMDE0IHRoZSBiYW5rIGRyb3BzIGl0c1xuICAgIC8vIHVuYnJlYWthYmlsaXR5IG9uY2UgaXQgaG9sZHMgZmlndXJlcy4gU2VlIFByaW50U3BlYy5icmVha0luc2lkZS5cbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkLXVubGVzcy1maWd1cmVzJywgdHJlYXRtZW50OiAnbGV0dGVyLWJhbmsnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdQb2ludGVyIGRyYWcgd2l0aCBhIGtleWJvYXJkIHNlbGVjdC10aGVuLXBsYWNlIGdyYW1tYXIgdW5kZXJuZWF0aDogJyArXG4gICAgICAgICd0YXJnZXQgY2FyZHMgYXJlIGZvY3VzYWJsZSwgU3BhY2UvRW50ZXIgbGlmdHMsIGFycm93cyBjaG9vc2UgYSBkb2NrLCAnICtcbiAgICAgICAgJ1NwYWNlL0VudGVyIHBsYWNlcywgRXNjYXBlIGNhbmNlbHMuIEV2ZXJ5IG1vdmUgbmFycmF0ZXMgdG8gYSAnICtcbiAgICAgICAgJ3Zpc3VhbGx5LWhpZGRlbiBhcmlhLWxpdmUgcmVnaW9uIChcIkNhcmQgQiBwbGFjZWQgb24gaXRlbSAyXCIpLicsXG4gICAgfSxcbiAgfSxcblxuICBvcmRlcmluZzoge1xuICAgIHR5cGU6ICdvcmRlcmluZycsXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAnb3JkZXJpbmcnLFxuICAgIHNhbml0aXplOiB7XG4gICAgICBzdHJpcDogWydzb2x1dGlvbiddLFxuICAgICAgLy8gVGhlIGF1dGhvcmVkIGl0ZW1zIG9yZGVyIElTIHRoZSBrZXkgXHUyMDE0IHRoZSBzZXJ2ZXIgc2VydmVzIGEgc2h1ZmZsZVxuICAgICAgLy8gKHN0YWJsZSBwZXIgdmVyc2lvbiArIHN0dWRlbnQgc28gcmVsb2FkcyBkb24ndCByZXNodWZmbGUpLlxuICAgICAgc2VydmVTaHVmZmxlZDogWydpdGVtcyddLFxuICAgIH0sXG4gICAgcHJpbnQ6IHtcbiAgICAgIGJyZWFrSW5zaWRlOiAnYXZvaWQnLFxuICAgICAgdHJlYXRtZW50OiAnbnVtYmVyLWJveGVzJyxcbiAgICAgIC8vIFRoZSBhdXRob3JlZCBvcmRlciBpcyB0aGUgYW5zd2VyLCBzbyBwYXBlciBtdXN0IG5ldmVyIHNob3cgaXQuIFRoZVxuICAgICAgLy8gc2VydmVyIGFscmVhZHkgc2h1ZmZsZXMgZm9yIHN0dWRlbnRzIChzZXJ2ZVNodWZmbGVkIGFib3ZlKTsgdGVhY2hlclxuICAgICAgLy8gcHJpbnQgZ2V0cyBpdHMgb3duLCBiZWNhdXNlIHRoYXQgcGF0aCBkZWxpYmVyYXRlbHkgZG9lcyBub3QgcnVuIHRoZVxuICAgICAgLy8gcGVyLXN0dWRlbnQgc2VydmUgc2h1ZmZsZS5cbiAgICAgIHNodWZmbGVkOiBbJ2l0ZW1zJ10sXG4gICAgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ1Jvd3MgYXJlIGZvY3VzYWJsZSBhbmQgcmVvcmRlciB2aWEgdGhlIHNoYXJlZCBsaWZ0IGdyYW1tYXI6ICcgK1xuICAgICAgICAnU3BhY2UvRW50ZXIgbGlmdHMsIGFycm93cyBtb3ZlIHRoZSByb3csIFNwYWNlL0VudGVyIGRyb3BzLCBFc2NhcGUgJyArXG4gICAgICAgICdjYW5jZWxzOyBwb3NpdGlvbnMgbmFycmF0ZSB0byBhIHZpc3VhbGx5LWhpZGRlbiBhcmlhLWxpdmUgcmVnaW9uLicsXG4gICAgfSxcbiAgfSxcblxuICBudW1iZXJfbGluZToge1xuICAgIHR5cGU6ICdudW1iZXJfbGluZScsXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAnbnVtYmVyX2xpbmUnLFxuICAgIHZhcmlhbnRzOiBbJ3Bsb3RfcG9pbnQnLCAncGxvdF9pbnRlcnZhbCddLFxuICAgIHNhbml0aXplOiB7XG4gICAgICAvLyBUaGUgd2lkZ2V0IG5lZWRzIGhhbmRsZSBjb3VudCAvIGZhbWlseSwgd2hpY2ggbGl2ZSBpbiB0aGUga2V5IHRoZVxuICAgICAgLy8gdmlld2VyIG5ldmVyIGdldHMuIERlcml2ZWQgKyB3aGl0ZWxpc3RlZDsgc2VlIFNhbml0aXplU3BlYy5cbiAgICAgIGRlcml2ZVF1ZXN0aW9uU2hhcGU6IHRydWUsXG4gICAgICBzdHJpcDogW1xuICAgICAgICAnaW50ZXJhY3Rpb24uY29ycmVjdFBvaW50cycsXG4gICAgICAgICdpbnRlcmFjdGlvbi50b2xlcmFuY2UnLFxuICAgICAgICAnaW50ZXJhY3Rpb24uY29ycmVjdEludGVydmFsJyxcbiAgICAgICAgJ3NvbHV0aW9uJyxcbiAgICAgIF0sXG4gICAgfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnc3RhdGljLXN2ZycgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ1RoZSBsaW5lIGlzIGZvY3VzYWJsZTsgcG9pbnRzL2ludGVydmFsIGVuZHBvaW50cyBtb3ZlIGJ5IGFycm93IGtleXMgJyArXG4gICAgICAgICd3aXRoIHZhbHVlIG5hcnJhdGlvbiB0byBhIHZpc3VhbGx5LWhpZGRlbiBhcmlhLWxpdmUgcmVnaW9uICh2aXNpYmxlICcgK1xuICAgICAgICAncmVhZG91dCB3b3VsZCByZXZlYWwgdGhlIGFuc3dlcikuIFBvc3QtY2hlY2sgcmVzdWx0cyBhcmUgdmlzaWJsZS4nLFxuICAgIH0sXG4gIH0sXG5cbiAgZGF0YV9wbG90OiB7XG4gICAgdHlwZTogJ2RhdGFfcGxvdCcsXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsIC8vIGRpc3BsYXkgdmFyaWFudCByZXNvbHZlcyBzdGF0aWMgdmlhIGZhbWlseU9mKClcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLCAvLyBkaXNwbGF5IHZhcmlhbnQgcmVzb2x2ZXMgY29udGVudCB2aWEgY2F0ZWdvcnlPZigpXG4gICAgbnVtYmVyZWQ6ICd3aGVuX2dyYWRhYmxlJyxcbiAgICBhbmFseXRpY3NLZXk6ICdkYXRhX3Bsb3QnLFxuICAgIHZhcmlhbnRzOiBbJ2Rpc3BsYXknLCAnYnVpbGRfZG90cGxvdCcsICdidWlsZF9oaXN0b2dyYW0nLCAnYnVpbGRfYm94cGxvdCddLFxuICAgIHNhbml0aXplOiB7XG4gICAgICAvLyBUaGUgd2lkZ2V0IG5lZWRzIGhhbmRsZSBjb3VudCAvIGZhbWlseSwgd2hpY2ggbGl2ZSBpbiB0aGUga2V5IHRoZVxuICAgICAgLy8gdmlld2VyIG5ldmVyIGdldHMuIERlcml2ZWQgKyB3aGl0ZWxpc3RlZDsgc2VlIFNhbml0aXplU3BlYy5cbiAgICAgIGRlcml2ZVF1ZXN0aW9uU2hhcGU6IHRydWUsXG4gICAgICBzdHJpcDogWydzb2x1dGlvbicsICdpbnRlcmFjdGlvbi50b2xlcmFuY2UnXSxcbiAgICAgIGRlcml2YWJsZUZyb21TZXJ2ZWQ6XG4gICAgICAgICdUaGUgZGF0YSBzZXQgaXMgdGhlIHdvcmtpbmcgbWF0ZXJpYWwgdGhlIHN0dWRlbnQgYnVpbGRzIHRoZSBjaGFydCAnICtcbiAgICAgICAgJ0ZST00sIGFuZCB0aGUgY29ycmVjdCBjaGFydCBpcyBjb21wdXRlZCBmcm9tIGl0IFx1MjAxNCB3aXRoaG9sZGluZyB0aGUgJyArXG4gICAgICAgICdkYXRhIHdvdWxkIHJlbW92ZSB0aGUgdGFzay4gU2VydmVyLWF1dGhvcml0YXRpdmUgZ3JhZGluZyBzdGlsbCBnYXRlcyAnICtcbiAgICAgICAgJ3ZlcmRpY3RzOyB0aGUgbGVhayB0ZXN0cyB3aGl0ZWxpc3QgYGRhdGFgIGZvciB0aGlzIGJsb2NrIGV4cGxpY2l0bHkuJyxcbiAgICB9LFxuICAgIC8vIFdBUyBhIGZhaXRoZnVsIG9kZGl0eSAoYWJzZW50IGZyb20gdGhlIGJhc2VsaW5lIGJyZWFrLWluc2lkZTphdm9pZCBsaXN0LFxuICAgIC8vIHVubGlrZSB0aGUgZ3JhcGggYW5kIG51bWJlci1saW5lIGNhbnZhc2VzKS4gRklYRUQgYnkgcnVsaW5nIFM1LU9WNiBcdTIwMTQgYVxuICAgIC8vIGNoYXJ0IHNwbGl0IGFjcm9zcyBhIHBhZ2UgYm91bmRhcnkgaXMgdW5yZWFkYWJsZS5cbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnc3RhdGljLXN2ZycgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ0NoYXJ0LWJ1aWxkaW5nIGNvbnRyb2xzIGFyZSBmb2N1c2FibGU7IGRvdHMvYmFycy9ib3ggaGFuZGxlcyBhZGp1c3QgJyArXG4gICAgICAgICdieSBhcnJvdyBrZXlzIHdpdGggdmFsdWUgbmFycmF0aW9uIHRvIGEgdmlzdWFsbHktaGlkZGVuIGFyaWEtbGl2ZSAnICtcbiAgICAgICAgJ3JlZ2lvbi4gUG9zdC1jaGVjayByZXN1bHRzIGFyZSB2aXNpYmxlIHRleHQuJyxcbiAgICB9LFxuICB9LFxuXG4gIGxlYXJuaW5nX29iamVjdGl2ZXM6IHtcbiAgICB0eXBlOiAnbGVhcm5pbmdfb2JqZWN0aXZlcycsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ2xlYXJuaW5nX29iamVjdGl2ZXMnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdib3JkZXJlZC1ib3gnIH0sXG4gIH0sXG5cbiAgd29ya2VkX2V4YW1wbGU6IHtcbiAgICB0eXBlOiAnd29ya2VkX2V4YW1wbGUnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICd3b3JrZWRfZXhhbXBsZScsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdLCBjaGlsZEJsb2NrczogWydjb250ZW50J10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnYm9yZGVyZWQtYm94JyB9LFxuICB9LFxuXG4gIGZhZGVkX3dvcmtlZF9leGFtcGxlOiB7XG4gICAgdHlwZTogJ2ZhZGVkX3dvcmtlZF9leGFtcGxlJyxcbiAgICAvLyBUaGUgYm94IGNvdW50cyBhcyBPTkUgbnVtYmVyZWQgcHJvYmxlbTsgZ3JhZGluZyByaWRlcyBpdHMgY2hpbGRcbiAgICAvLyBmaWxsX2luX2JsYW5rIHN0ZXBzLCBlYWNoIHNhbml0aXplZCBieSBpdHMgb3duIGVudHJ5IHZpYSBjaGlsZEJsb2Nrcy5cbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ3NjYWZmb2xkJyxcbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAnZmFkZWRfd29ya2VkX2V4YW1wbGUnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSwgY2hpbGRCbG9ja3M6IFsnY29udGVudCddIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ2JvcmRlcmVkLWJveCcgfSxcbiAgfSxcblxuICB0YWJsZToge1xuICAgIHR5cGU6ICd0YWJsZScsXG4gICAgLy8gRFVBTC1OQVRVUkVELCByZXNvbHZlZCBwZXIgaW5zdGFuY2UgcmF0aGVyIHRoYW4gZGVjbGFyZWQgcGVyIHR5cGU6IGFcbiAgICAvLyB0YWJsZSB3aG9zZSBjZWxscyBob2xkIGJsYW5rcyBpcyBhIHF1ZXN0aW9uOyBhIGJsYW5rbGVzcyBvbmUgaXMgYVxuICAgIC8vIHN0aW11bHVzIChhIHJhdGVzIGNoYXJ0IHRvIFJFQUQpLiBmYW1pbHlPZigpL2NhdGVnb3J5T2YoKSByb3V0ZSB0aHJvdWdoXG4gICAgLy8gaXNHcmFkZWFibGUsIHdoaWNoIGFuc3dlcnMgZnJvbSBDT05URU5UIFx1MjAxNCB0aGUgbWF0aF9ibG9jayBwcmVjZWRlbnQsIGFuZFxuICAgIC8vIHRoZSByZWFzb24gdGhlcmUgaXMgbm8gYXV0aG9yZWQgYGludGVyYWN0aXZlYCBmbGFnIHRvIGRyaWZ0LlxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICd3aGVuX2dyYWRhYmxlJyxcbiAgICBhbmFseXRpY3NLZXk6ICd0YWJsZScsXG4gICAgLy8gQ2VsbHMgYXJlIE5PVCBibG9ja3MsIHNvIGBjaGlsZEJsb2Nrc2Agd291bGQgYmUgYSBjYXRlZ29yeSBlcnJvciBoZXJlLlxuICAgIC8vIFRoZSBjZWxsIGJsYW5rcyBhcmUgaW4tYmFuZCBjb250ZW50IG9mIFRISVMgYmxvY2s6IHRoZSBkZWVwIHN0cmlwIHdhbGtzXG4gICAgLy8gdGhlbSB1bmNvbmRpdGlvbmFsbHkgKGl0IG5ldmVyIHN0b3BzIGF0IG5lc3RlZCBhcnJheXMpLCBhbmQgdGhpcyBmbGFnIGlzXG4gICAgLy8gdGhlIGRlY2xhcmF0aW9uICsgdGhlIHR5cGUgcHJvamVjdGlvbiB0aGF0IHNheXMgc28uXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdLCBpbmxpbmVCbGFua1NlY3JldHM6IHRydWUgfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnZGF0YS10YWJsZScgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ1RoZSB0YWJsZSBpcyBhIHJlYWwgPHRhYmxlPiB3aXRoIDx0aD4gY2VsbHMgb24gd2hpY2hldmVyIGF4aXMgdGhlICcgK1xuICAgICAgICAnYXV0aG9yIG1hcmtlZCAoaGVhZGVyUm93IC8gaGVhZGVyQ29sdW1uKSwgc28gYSBzY3JlZW4gcmVhZGVyICcgK1xuICAgICAgICAnYW5ub3VuY2VzIGEgYmxhbmsgY2VsbCB3aXRoIGl0cyByb3cgYW5kIGNvbHVtbiBoZWFkZXJzIFx1MjAxNCBcIktpbG9ncmFtcyAnICtcbiAgICAgICAgJzIsIENvc3QsIGJsYW5rXCIgXHUyMDE0IHdoaWNoIGlzIHRoZSBpbmZvcm1hdGlvbiBhIHNpZ2h0ZWQgc3R1ZGVudCByZWFkcyAnICtcbiAgICAgICAgJ29mZiB0aGUgZ3JpZC4gRWFjaCBibGFuayBpcyBhIHRleHQgaW5wdXQgaW4gdGFiIG9yZGVyLCByZWFkaW5nIG9yZGVyICcgK1xuICAgICAgICAnbGVmdCB0byByaWdodCB0aGVuIGRvd24uIE9uIGEgbXVsdGktYmxhbmsgdGFibGUgdGhlIGlucHV0IGFsc28gJyArXG4gICAgICAgICdjYXJyaWVzIGl0cyBzdWItcGFydCBsZXR0ZXIgKFwiUGFydCBiXCIpLCBtYXRjaGluZyB0aGUgKGIpIG1hcmtlciAnICtcbiAgICAgICAgJ3ByaW50ZWQgYmVzaWRlIGl0OyB0aGF0IG1hcmtlciBpcyBhcmlhLWhpZGRlbiBzbyBpdCBpcyBub3QgYW5ub3VuY2VkICcgK1xuICAgICAgICAndHdpY2UuIFRoZSBQUk9CTEVNIG51bWJlciBpcyBhbm5vdW5jZWQgb25jZSBieSB0aGUgYmxvY2sgd3JhcHBlciwgJyArXG4gICAgICAgICduZXZlciByZXBlYXRlZCBwZXIgY2VsbCAodmlld2VyLW51bWJlcmluZyBEMykuIFZlcmRpY3RzIGFubm91bmNlIHZpYSAnICtcbiAgICAgICAgJ3RoZSBzaGFyZWQgc3RhdGUtcGlsbCBhcmlhLWxpdmUgcmVnaW9uLicsXG4gICAgfSxcbiAgfSxcblxuICBzZWxmX2V4cGxhbmF0aW9uOiB7XG4gICAgdHlwZTogJ3NlbGZfZXhwbGFuYXRpb24nLFxuICAgIGZhbWlseTogJ3JlY29yZGVkJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ3NlbGZfZXhwbGFuYXRpb24nLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIC8vIFdBUyBhIGZhaXRoZnVsIG9kZGl0eTogdGhlIGJhc2VsaW5lIGF2b2lkIHJpZGVzIHRoZSB0ZXh0YXJlYSwgbm90IHRoZVxuICAgIC8vIGJsb2NrLCBzbyBhIGxvbmcgcHJvbXB0IGNvdWxkIHNlcGFyYXRlIGZyb20gaXRzIHdyaXRpbmcgYm94LiBGSVhFRCBieVxuICAgIC8vIHJ1bGluZyBTNS1PVjYgXHUyMDE0IGEgcHJvbXB0IG9uIG9uZSBwYWdlIGFuZCBpdHMgYW5zd2VyIHNwYWNlIG9uIHRoZSBuZXh0IGlzXG4gICAgLy8gdGhlIHNhbWUgZGVmZWN0IGNsYXNzIGFzIGEgc3BsaXQgZXF1YXRpb24uXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3dyaXRpbmctYm94JyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnQSBsYWJlbGVkIHRleHRhcmVhIGluIHRhYiBvcmRlci4gT24gY2hlY2sgdGhlIGJsb2NrIGFubm91bmNlcyAnICtcbiAgICAgICAgJ1wiUmVjb3JkZWQgXHUyMDE0IHlvdXIgdGVhY2hlciB3aWxsIHJldmlld1wiIHZpYSBhcmlhLWxpdmU7IG5ldmVyIGEgdmVyZGljdC4nLFxuICAgIH0sXG4gIH0sXG5cbiAgc2hvcnRfYW5zd2VyOiB7XG4gICAgdHlwZTogJ3Nob3J0X2Fuc3dlcicsXG4gICAgZmFtaWx5OiAncmVjb3JkZWQnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgLy8gV0FTICduZXZlcicgXHUyMDE0IGEgcHJlLXBhcGVyLWZpcnN0IGNob2ljZS4gUnVsaW5nIEU3ICgyMDI2LTA4LTE5KTogYSBncmFkZWRcbiAgICAvLyBxdWVzdGlvbiBhIHRlYWNoZXIgbWFya3Mgb24gcGFwZXIgbmVlZHMgYSBudW1iZXIsIGFuZCB0aGUgbnVtYmVyaW5nIHdhbGtcbiAgICAvLyB0aGF0IGFscmVhZHkgZXhpc3RzIGdpdmVzIHRoZSBzY2FuIGFyYyBpdHMgcGFwZXJcdTIxOTJibG9jayBtYXBwaW5nIGZvciBmcmVlLlxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdzaG9ydF9hbnN3ZXInLFxuICAgIC8vIFJ1YnJpY3MgYXJlIHRlYWNoZXItc2lkZSBkYXRhIFx1MjAxNCBhbHJlYWR5IGNvcnJlY3RseSB3aXRoaGVsZCBmcm9tIHN0dWRlbnRcbiAgICAvLyBIVE1MIHRvZGF5OyB0aGUgcmVnaXN0cnkgbWFrZXMgdGhhdCBhIGRlY2xhcmVkIGludmFyaWFudC5cbiAgICAvL1xuICAgIC8vIGBhbnN3ZXJgIGFuZCBgc29sdXRpb25gIGpvaW5lZCBpdCB3aXRoIHRoZSBhbnN3ZXIta2V5IHNsaWNlIChydWxpbmcgRTIvRTMpXG4gICAgLy8gYW5kIHRoZSBPUkRFUiBPRiBFVkVOVFMgbWF0dGVycyBtb3JlIHRoYW4gdGhlIGxpc3QgZG9lczogRTMgZGVjbGFyZXMgdGhlXG4gICAgLy8gYW50aS1sZWFrIGNoYWluIE9ORSBJTlNFUEFSQUJMRSBVTklUIFx1MjAxNCB0aGlzIHN0cmlwIGVudHJ5LCB0aGUgbGVha0ZpeHR1cmVcbiAgICAvLyBzZW50aW5lbCByb3cgdGhhdCBvYnNlcnZlcyBpdCwgdGhlIHNhbml0aXplIHVuaXQgYXNzZXJ0aW9uLCBhbmQgdGhlXG4gICAgLy8gc2NoZW1hLXZzLXJlZ2lzdHJ5IGNvbXBsZXRlbmVzcyBnYXRlIGFsbCBsYW5kIHRvZ2V0aGVyLiBBIHN0cmlwIGVudHJ5XG4gICAgLy8gd2l0aG91dCBpdHMgZml4dHVyZSByb3cgaXMgYSBjbGFpbSBub3RoaW5nIGNoZWNrcyAodGhlIFwicGFzc2luZyBiZWNhdXNlXG4gICAgLy8gb2Ygd2hhdCBpcyBhYnNlbnRcIiBjbGFzcyksIHdoaWNoIGlzIGV4YWN0bHkgaG93IGEga2V5IGxlYWtzIHF1aWV0bHkuXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFsncnVicmljJywgJ2Fuc3dlcicsICdzb2x1dGlvbiddIH0sXG4gICAgLy8gU2FtZSBmb3JtZXIgb2RkaXR5IGFzIHNlbGZfZXhwbGFuYXRpb24sIGFuZCBmaXhlZCB3aXRoIGl0OiB0aGUgYmFzZWxpbmVcbiAgICAvLyBhdm9pZCByaWRlcyB0aGUgdGV4dGFyZWEsIG5vdCB0aGUgYmxvY2ssIHNvIGEgcHJvbXB0IGNvdWxkIHByaW50IG9uIG9uZVxuICAgIC8vIHBhZ2Ugd2l0aCBpdHMgYW5zd2VyIHNwYWNlIG9uIHRoZSBuZXh0LiBTNS1PVjYgbmFtZWQgb25seSB0aGUgdGhyZWVcbiAgICAvLyB0eXBlcyBpdHMgY29tbWVudHMgZmxhZ2dlZDsgdGhlIGF1dGhvciBleHRlbmRlZCB0aGUgcnVsaW5nIHRvIHRoZSB0d29cbiAgICAvLyB1bm5hbWVkIHNpYmxpbmdzIG9mIHRoZSBzYW1lIGZhbWlseSByYXRoZXIgdGhhbiBsZWF2ZSB0aGUgZGVmZWN0IGluXG4gICAgLy8gcGxhY2UgZm9yIHRoZW0gKHRoZSBwbG90X3JheS9wbG90X3NlZ21lbnQgbGVzc29uOiBhdWRpdCB0aGUgZmFtaWx5KS5cbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnd3JpdGluZy1ib3gnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdBIGxhYmVsZWQgdGV4dGFyZWEgaW4gdGFiIG9yZGVyLiBSZWNvcmRlZCBzdGF0ZSBhbm5vdW5jZXMgdmlhICcgK1xuICAgICAgICAnYXJpYS1saXZlOyB0ZWFjaGVyIGZlZWRiYWNrLCBvbmNlIHJlbGVhc2VkLCByZW5kZXJzIGFzIGEgbGFiZWxlZCAnICtcbiAgICAgICAgJ3JlZ2lvbiBhbm5vdW5jZWQgb24gYXJyaXZhbC4nLFxuICAgIH0sXG4gIH0sXG5cbiAgZXNzYXk6IHtcbiAgICB0eXBlOiAnZXNzYXknLFxuICAgIGZhbWlseTogJ3JlY29yZGVkJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIC8vIE51bWJlcmVkIHdpdGggc2hvcnRfYW5zd2VyIFx1MjAxNCBzZWUgdGhlIG5vdGUgdGhlcmUgKHJ1bGluZyBFNykuXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ2Vzc2F5JyxcbiAgICAvLyBhbnN3ZXIgKyBzb2x1dGlvbiByaWRlIHRoZSBzYW1lIGFudGktbGVhayB1bml0IGFzIHNob3J0X2Fuc3dlcidzOyBFNCdzXG4gICAgLy8gcGFyaXR5IHJ1bGluZyBpcyB3aGF0IGtlZXBzIHRoZXNlIHR3byBsaXN0cyBpZGVudGljYWwuXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFsncnVicmljJywgJ2Fuc3dlcicsICdzb2x1dGlvbiddIH0sXG4gICAgLy8gRXh0ZW5kZWQgd2l0aCBzaG9ydF9hbnN3ZXIgKyBzZWxmX2V4cGxhbmF0aW9uIFx1MjAxNCBzZWUgdGhlIG5vdGUgdGhlcmUuXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3dyaXRpbmctYm94JyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnQSBsYWJlbGVkIHRleHRhcmVhIGluIHRhYiBvcmRlci4gVGhlIGxpdmUgd29yZCBjb3VudGVyIGlzICcgK1xuICAgICAgICAnYXJpYS1saXZlPXBvbGl0ZSBhbmQgZGVib3VuY2VkIHNvIGl0IG5ldmVyIGNoYXR0ZXJzIHBlciBrZXlzdHJva2UuICcgK1xuICAgICAgICAnUmVjb3JkZWQgc3RhdGUgYW5kIHJlbGVhc2VkIHRlYWNoZXIgZmVlZGJhY2sgYW5ub3VuY2UgdmlhIGFyaWEtbGl2ZS4nLFxuICAgIH0sXG4gIH0sXG5cbiAgZ3JhcGhfZmlndXJlOiB7XG4gICAgdHlwZTogJ2dyYXBoX2ZpZ3VyZScsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ2dyYXBoX2ZpZ3VyZScsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAnZmlndXJlJyB9LFxuICB9LFxufTtcblxuLyoqIEV2ZXJ5IHJlZ2lzdGVyZWQgdHlwZSwgaW4gcmVnaXN0cnkgZGVjbGFyYXRpb24gb3JkZXIuICovXG5leHBvcnQgY29uc3QgcmVnaXN0ZXJlZEJsb2NrVHlwZXMgPSBPYmplY3Qua2V5cyhibG9ja1JlZ2lzdHJ5KSBhcyBCbG9ja1R5cGVbXTtcblxuLyoqIFJlc29sdmUgYW4gSU5TVEFOQ0UncyBjaGVja2VkLXN0YXRlIGZhbWlseS4gQSB0eXBlJ3MgZGVjbGFyZWQgZmFtaWx5IGlzXG4gKiBtYXhpbWFsOyB1bmdyYWRhYmxlIGluc3RhbmNlcyBvZiBncmFkYWJsZSB0eXBlcyAoZGlzcGxheSBncmFwaC9kYXRhIHBsb3QsXG4gKiBwcm9tcHRsZXNzIG1hdGggYmxvY2spIHJlc29sdmUgdG8gc3RhdGljIFx1MjAxNCBvbmUgcnVsZSBlbmdpbmUsIGlzR3JhZGVhYmxlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZhbWlseU9mKGJsb2NrOiBCbG9jayk6IENoZWNrZWRTdGF0ZUZhbWlseSB7XG4gIGNvbnN0IGVudHJ5ID0gYmxvY2tSZWdpc3RyeVtibG9jay50eXBlXTtcbiAgaWYgKGVudHJ5LmZhbWlseSA9PT0gJ3N0YXRpYycpIHJldHVybiAnc3RhdGljJztcbiAgcmV0dXJuIGlzR3JhZGVhYmxlKGJsb2NrKSA/IGVudHJ5LmZhbWlseSA6ICdzdGF0aWMnO1xufVxuXG4vKiogUmVzb2x2ZSBhbiBJTlNUQU5DRSdzIGNhdGVnb3J5OiBhIGRpc3BsYXktbW9kZSBncmFwaC9kYXRhIHBsb3Qgc2VydmVzIGFzXG4gKiBjb250ZW50LCBtYXRjaGluZyB0aGUgcmVuZGVyZXIncyBkYXRhLWJsb2NrLWNhdGVnb3J5IGVtaXNzaW9uLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhdGVnb3J5T2YoYmxvY2s6IEJsb2NrKTogQmxvY2tDYXRlZ29yeSB7XG4gIGNvbnN0IGVudHJ5ID0gYmxvY2tSZWdpc3RyeVtibG9jay50eXBlXTtcbiAgaWYgKGVudHJ5LmNhdGVnb3J5ID09PSAncXVlc3Rpb24nICYmIGVudHJ5Lm51bWJlcmVkID09PSAnd2hlbl9ncmFkYWJsZScpIHtcbiAgICByZXR1cm4gaXNHcmFkZWFibGUoYmxvY2spID8gJ3F1ZXN0aW9uJyA6ICdjb250ZW50JztcbiAgfVxuICByZXR1cm4gZW50cnkuY2F0ZWdvcnk7XG59XG5cbi8qKiBDZW5zdXMga2V5IGZvciBhbiBpbnN0YW5jZSAoUDNBKTogdGhlIGFuYWx5dGljcyBrZXksIHdpdGggdGhlIGludGVyYWN0aW9uXG4gKiB2YXJpYW50IGFwcGVuZGVkIGZvciB0aGUgYmxvY2tzIHRoYXQgaGF2ZSBvbmUgXHUyMDE0IGBkYXRhX3Bsb3QuYnVpbGRfaGlzdG9ncmFtYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjZW5zdXNLZXlPZihibG9jazogQmxvY2spOiBzdHJpbmcge1xuICBjb25zdCBlbnRyeSA9IGJsb2NrUmVnaXN0cnlbYmxvY2sudHlwZV07XG4gIGlmICgnaW50ZXJhY3Rpb24nIGluIGJsb2NrICYmIGVudHJ5LnZhcmlhbnRzKSB7XG4gICAgcmV0dXJuIGAke2VudHJ5LmFuYWx5dGljc0tleX0uJHtibG9jay5pbnRlcmFjdGlvbi50eXBlfWA7XG4gIH1cbiAgcmV0dXJuIGVudHJ5LmFuYWx5dGljc0tleTtcbn1cblxuLyoqIFdoZXRoZXIgYW4gSU5TVEFOQ0UgZHJhd3MgYSBwcm9ibGVtIG51bWJlciAoZGVsZWdhdGVzIHRvIHRoZSBzY2hlbWEgcnVsZVxuICogZW5naW5lIFx1MjAxNCByZS1leHBvcnRlZCBoZXJlIHNvIHZpZXdlciBjb2RlIGhhcyBvbmUgaW1wb3J0IHN1cmZhY2UpLiAqL1xuZXhwb3J0IHsgaXNQYWdlTnVtYmVyZWQgfTtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gcHJvbXB0Q2FycmllcnMudHMgXHUyMDE0IHRoZSBPTkUgbGlzdCBvZiBpbmxpbmUgdHlwZXMgd2hvc2UgYHByb21wdHNgIGNhcnJ5IGtleXNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIG1hdGggbm9kZSdzIGBwcm9tcHRzYCBhcnJheSBob2xkcyBpbi1iYW5kIGFuc3dlciBtYXRlcmlhbCwgc28gYm90aCB0aGVcbi8vIHNhbml0aXplcidzIGRlZXAgc3RyaXAgKGxheWVyIDMpIGFuZCB0aGUgZ3JhZGluZyB3YWxrJ3Mga2V5IGNvbGxlY3Rpb24gbXVzdFxuLy8gYWdyZWUgb24gZXhhY3RseSB3aGljaCBub2RlIHR5cGVzIGNhcnJ5IHByb21wdHMuIFVudGlsIDIwMjYtMDgtMDYgdGhpcyBTZXRcbi8vIHdhcyBkZWNsYXJlZCB0d2ljZSB3aXRoIGlkZW50aWNhbCBjb250ZW50cyAoc2FuaXRpemUudHMgYW5kIGdyYWRpbmcvd2Fsay50c1xuLy8gXHUyMDE0IHM0LXJldHJvIGZpbmRpbmcgMTAsIGZpeGVkIGJ5IGVuZy1yZXZpZXcgQTcpOiB0d28gc3BlbGxpbmdzIG9mIGEgc2VjdXJpdHktXG4vLyByZWxldmFudCByb3N0ZXIsIGJvbmRlZCBieSBub3RoaW5nLiBBIHR5cGUgYWRkZWQgdG8gb25lIGFuZCBub3QgdGhlIG90aGVyXG4vLyB3b3VsZCBlaXRoZXIgbGVhayBhIHByb21wdCBrZXkgdG8gc3R1ZGVudHMgKHNhbml0aXplIHNpZGUgbWlzc2luZykgb3IgZ3JhZGVcbi8vIGFnYWluc3QgYSBrZXkgdGhlIHdpcmUgbmV2ZXIgY2FycmllZCAod2FsayBzaWRlIG1pc3NpbmcpIFx1MjAxNCBib3RoIHNpbGVudC5cbi8vXG4vLyBUaGlzIG1vZHVsZSBpcyBhIGRlcGVuZGVuY3ktZnJlZSBsZWFmIE9OIFBVUlBPU0U6IGl0IGlzIGltcG9ydGVkIGJ5IHRoZSByZWFkXG4vLyBidW5kbGUgKHZpYSBzYW5pdGl6ZS50cykgQU5EIHRoZSBncmFkaW5nIGJ1bmRsZSAodmlhIHdhbGsudHMpLCBzbyBpdCBtdXN0XG4vLyBuZXZlciBncm93IGFuIGltcG9ydCB0aGF0IGVpdGhlciBidW5kbGUgY2FuJ3QgYWZmb3JkLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLyoqIElubGluZSBub2RlIHR5cGVzIHdob3NlIGBwcm9tcHRzYCBhcnJheXMgY2FycnkgaW4tYmFuZCBhbnN3ZXIga2V5cy4gKi9cbmV4cG9ydCBjb25zdCBQUk9NUFRfQ0FSUklFUl9UWVBFUzogUmVhZG9ubHlTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoW1xuICAnbWF0aF9pbmxpbmUnLFxuICAnbWF0aF9ibG9jaycsXG5dKTtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2FuaXRpemUvc2FuaXRpemUudHMgXHUyMDE0IHRoZSBhbnN3ZXIta2V5IHNhbml0aXplciAoUzIvVDMsIHJ1bGluZyBUVjQtQSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIEdFTkVSSUMgc3RyaXAgdHJhbnNmb3JtIGRyaXZlbiBlbnRpcmVseSBieSB0aGUgcmVnaXN0cnkncyBTYW5pdGl6ZVNwZWNcbi8vIGRlY2xhcmF0aW9ucyBcdTIwMTQgaXQgaG9sZHMgbm8gcGVyLXR5cGUga25vd2xlZGdlIG9mIGl0cyBvd24gKHJ1bGluZyBRMUE6IHRoZVxuLy8gcmVnaXN0cnkgZGVjbGFyZXMsIHRyYW5zZm9ybXMgb2JleSkuIFJ1bnMgc2VydmVyLXNpZGUgaW4gdGhlIGdldC1hY3Rpdml0eVxuLy8gRWRnZSBGdW5jdGlvbiwgY29tcG9zZWQgd2l0aCB1cGdyYWRlLW9uLXJlYWQ7IHRoZSBvdXRwdXQgaXMgd2hhdCB0aGUgZHVyYWJsZVxuLy8gcGVyLXZlcnNpb24gY2FjaGUgc3RvcmVzIGFuZCB0aGUgdmlld2VyIHJlY2VpdmVzLiBBbnN3ZXJzIE5FVkVSIHJlYWNoIGFcbi8vIHN0dWRlbnQgY2xpZW50IChydWxpbmcgUTJCKSBcdTIwMTQgdGhlIHdpcmUtbGV2ZWwgbGVhayB0ZXN0cyBpblxuLy8gdGVzdHMvc2FuaXRpemUudGVzdC50cyBhc3NlcnQgdGhlIG91dGNvbWUsIG5vdCB0aGUgbWVjaGFuaXNtLlxuLy9cbi8vIFRocmVlIGxheWVycywgaW4gb3JkZXIsIHBlciBibG9jazpcbi8vICAgMS4gRGVjbGFyZWQgc3RyaXBzIFx1MjAxNCB0aGUgZW50cnkncyBgc3RyaXBgIHBhdGhzLCBpbiB0aGUgdGlueSBncmFtbWFyXG4vLyAgICAgIHR5cGVzLnRzIGRvY3VtZW50cyAoJ2ZpZWxkJywgJ2ZpZWxkW10uc3ViJywgJ2ludGVyYWN0aW9uLmZpZWxkJykuXG4vLyAgIDIuIENoaWxkIHJlY3Vyc2lvbiBcdTIwMTQgYGNoaWxkQmxvY2tzYCBmaWVsZHMgcmUtZW50ZXIgdGhlIHNhbml0aXplciwgc28gYVxuLy8gICAgICBmaWxsX2luX2JsYW5rIG5lc3RlZCBpbiBhIHdvcmtlZCBleGFtcGxlIGlzIHN0cmlwcGVkIGJ5IElUUyBPV04gZW50cnkuXG4vLyAgIDMuIEluLWJhbmQgZGVlcCB3YWxrIFx1MjAxNCBCbGFua1Rva2VuIGFuZCBNYXRoUHJvbXB0IHNlY3JldHMgYXJlIHN0cmlwcGVkIGZyb21cbi8vICAgICAgZXZlcnkgb2JqZWN0IHRoZSBibG9jayBjYXJyaWVzLCBVTkNPTkRJVElPTkFMTFkgKG5vdCBnYXRlZCBvbiB0aGVcbi8vICAgICAgZW50cnkncyBgaW5saW5lQmxhbmtTZWNyZXRzYCBmbGFnKS4gRGVmZW5zZSBpbiBkZXB0aDogdGhlIHNjaGVtYSBhZG1pdHNcbi8vICAgICAgYSBwcm9tcHRlZCBtYXRoX2lubGluZSBpbnNpZGUgYW55IGNvbnRlbnQgYXJyYXkgXHUyMDE0IGEgcGFyYWdyYXBoLCBhIGhpbnQsXG4vLyAgICAgIGEgbGlzdCBpdGVtIFx1MjAxNCBhbmQgYSBkZWNsYXJhdGlvbiBtaXNzIHRoZXJlIG11c3Qgbm90IGJlY29tZSBhIHNpbGVudFxuLy8gICAgICBsZWFrLiBUaGUgZmxhZyBzdGF5cyBkZWNsYXJhdGl2ZSAoc2VlIHR5cGVzLnRzKS5cbi8vXG4vLyBXaGF0IHNhbml0aXplIGRvZXMgTk9UIGRvOiB0aGUgcGVyLXN0dWRlbnQgYHNlcnZlU2h1ZmZsZWRgIHJlb3JkZXIuIFRoYXQgaXNcbi8vIHNlcnZlLXRpbWUgd29yayAoc2h1ZmZsZS50cykgcHJlY2lzZWx5IHNvIFRISVMgb3V0cHV0IGlzIGNhY2hlYWJsZSBwZXJcbi8vIHZlcnNpb24gXHUyMDE0IHRoZSBvcmRlciBzZWNyZXQgY2FuJ3QgYmUgaGFuZGxlZCBieSBhIHN0cmlwLCBhbmQgdGhlIHNodWZmbGVcbi8vIGNhbid0IGJlIGhhbmRsZWQgYnkgdGhlIGNhY2hlLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHR5cGUgeyBBY3Rpdml0eURvY3VtZW50LCBCbG9jayB9IGZyb20gJ0BhY3Rpdml0eS9zY2hlbWEnO1xuaW1wb3J0IHtcbiAgQkxBTktfU0VDUkVUX0ZJRUxEUyxcbiAgTUFUSF9QUk9NUFRfU0VDUkVUX0ZJRUxEUyxcbiAgYmxvY2tSZWdpc3RyeSxcbiAgcmVnaXN0ZXJlZEJsb2NrVHlwZXMsXG59IGZyb20gJy4uL3JlZ2lzdHJ5L3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IFBST01QVF9DQVJSSUVSX1RZUEVTIH0gZnJvbSAnLi9wcm9tcHRDYXJyaWVycy5qcyc7XG5pbXBvcnQgdHlwZSB7XG4gIFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQsXG4gIFNhbml0aXplZEJsb2NrLFxufSBmcm9tICcuL3Nhbml0aXplZC10eXBlcy5qcyc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTYW5pdGl6ZXIgcmV2aXNpb24gXHUyMDE0IHRoZSBkdXJhYmxlIGNhY2hlJ3MgaW52YWxpZGF0aW9uIGtleVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSByZWFkIGNhY2hlIHN0b3JlcyBzYW5pdGl6ZWQgb3V0cHV0IHBlciAodmVyc2lvbl9pZCwgU0FOSVRJWkVSX1JFVikuIFRoZVxuLy8gcmV2IGlzIENPTVBVVEVEIGZyb20gdGhlIHJlZ2lzdHJ5J3Mgc2FuaXRpemUgZGVjbGFyYXRpb25zICsgdGhlIHNlY3JldC1maWVsZFxuLy8gbGlzdHMsIHNvIGNoYW5naW5nIGFueSBzcGVjIGF1dG9tYXRpY2FsbHkgb3JwaGFucyBldmVyeSBzdGFsZSBjYWNoZSByb3cgXHUyMDE0IGFcbi8vIHNhbml0aXplciBmaXggdGhhdCByZXF1aXJlZCBhIGhhbmQtYnVtcGVkIGNvbnN0YW50IHRvIHRha2UgZWZmZWN0IGlzIGV4YWN0bHlcbi8vIHRoZSBmb3JnZXR0YWJsZS1zdGVwIGNsYXNzIHRoaXMgcmVwbyBkb2N1bWVudHMgKGdyYXBoLWtpdCBtYW5pZmVzdCwgMDAxNSdzXG4vLyBncmFudCBzdGFuemFzKS4gQnVtcCBTQU5JVElaRVJfQUxHT19SRVYgYnkgaGFuZCBPTkxZIHdoZW4gdGhlIHRyYW5zZm9ybVxuLy8gbG9naWMgaXRzZWxmIGNoYW5nZXMgaW4gYSB3YXkgdGhlIGRlY2xhcmF0aW9ucyBkb24ndCBjYXB0dXJlLlxuXG4vLyAxIC0+IDIgKDIwMjYtMDgtMjMpOiB0aGUgcGVyLWJsb2NrIHN0cmlwcyBiZWdhbiBjb3ZlcmluZyBgcmVmZXJlbmNlUGFuZWxgXG4vLyBhcyB3ZWxsIGFzIHRoZSBib2R5LiBUaGlzIGlzIEVYQUNUTFkgdGhlIGNhc2UgdGhlIG5vdGUgYWJvdmUgcmVzZXJ2ZXMgYSBoYW5kXG4vLyBidW1wIGZvciBcdTIwMTQgdGhlIHRyYW5zZm9ybSBjaGFuZ2VkIHdoaWxlIGV2ZXJ5IHNhbml0aXplIERFQ0xBUkFUSU9OIHN0YXllZFxuLy8gaWRlbnRpY2FsLCBzbyB0aGUgY29tcHV0ZWQgcmV2IHdvdWxkIG5vdCBoYXZlIG1vdmVkIGFuZCBldmVyeSBjYWNoZWQgcm93XG4vLyB3b3VsZCBoYXZlIGtlcHQgc2VydmluZyB0aGUgbGVhayBpdCB3YXMgd3JpdHRlbiB3aXRoLlxuZXhwb3J0IGNvbnN0IFNBTklUSVpFUl9BTEdPX1JFViA9IDI7XG5cbi8qKiBGTlYtMWEgMzItYml0LCBoZXguIFRpbnksIGRlcGVuZGVuY3ktZnJlZSwgc3RhYmxlIGFjcm9zcyBKUyBydW50aW1lcyBcdTIwMTRcbiAqIHRoaXMgaXMgYSBjYWNoZS1idXN0aW5nIGZpbmdlcnByaW50LCBub3Qgc2VjdXJpdHkgbWF0ZXJpYWwuICovXG5mdW5jdGlvbiBmbnYxYSh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgaGFzaCA9IDB4ODExYzlkYzU7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdGV4dC5sZW5ndGg7IGkrKykge1xuICAgIGhhc2ggXj0gdGV4dC5jaGFyQ29kZUF0KGkpO1xuICAgIGhhc2ggPSBNYXRoLmltdWwoaGFzaCwgMHgwMTAwMDE5Myk7XG4gIH1cbiAgcmV0dXJuIChoYXNoID4+PiAwKS50b1N0cmluZygxNikucGFkU3RhcnQoOCwgJzAnKTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVNhbml0aXplclJldigpOiBzdHJpbmcge1xuICBjb25zdCBzcGVjcyA9IFsuLi5yZWdpc3RlcmVkQmxvY2tUeXBlc11cbiAgICAuc29ydCgpXG4gICAgLm1hcCgodHlwZSkgPT4gW3R5cGUsIGJsb2NrUmVnaXN0cnlbdHlwZV0uc2FuaXRpemVdKTtcbiAgY29uc3QgbWF0ZXJpYWwgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgYWxnbzogU0FOSVRJWkVSX0FMR09fUkVWLFxuICAgIGJsYW5rOiBCTEFOS19TRUNSRVRfRklFTERTLFxuICAgIHByb21wdDogTUFUSF9QUk9NUFRfU0VDUkVUX0ZJRUxEUyxcbiAgICBzcGVjcyxcbiAgfSk7XG4gIHJldHVybiBgJHtTQU5JVElaRVJfQUxHT19SRVZ9LSR7Zm52MWEobWF0ZXJpYWwpfWA7XG59XG5cbi8qKiBUaGUgY2FjaGUga2V5IGNvbXBvbmVudC4gU3RhYmxlIGZvciBhIGdpdmVuIHJlZ2lzdHJ5ICsgYWxnb3JpdGhtOyBjaGFuZ2VzXG4gKiB3aGVuZXZlciBhbnkgc2FuaXRpemUgZGVjbGFyYXRpb24gY2hhbmdlcy4gKi9cbmV4cG9ydCBjb25zdCBTQU5JVElaRVJfUkVWID0gY29tcHV0ZVNhbml0aXplclJldigpO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHN0cmlwIGdyYW1tYXIgKGV4YWN0bHkgd2hhdCB0eXBlcy50cyBkb2N1bWVudHMgXHUyMDE0IG5vdGhpbmcgbW9yZSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIGFwcGx5U3RyaXBQYXRoKGJsb2NrOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgcGF0aDogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IGFycmF5SWR4ID0gcGF0aC5pbmRleE9mKCdbXS4nKTtcbiAgaWYgKGFycmF5SWR4ICE9PSAtMSkge1xuICAgIC8vICdmaWVsZFtdLnN1YicgXHUyMDE0IGRlbGV0ZSBgc3ViYCBmcm9tIGV2ZXJ5IGVsZW1lbnQgb2YgYXJyYXkgYGZpZWxkYC5cbiAgICBjb25zdCBmaWVsZCA9IHBhdGguc2xpY2UoMCwgYXJyYXlJZHgpO1xuICAgIGNvbnN0IHN1YiA9IHBhdGguc2xpY2UoYXJyYXlJZHggKyAzKTtcbiAgICBjb25zdCBhcnIgPSBibG9ja1tmaWVsZF07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgZm9yIChjb25zdCBlbCBvZiBhcnIpIHtcbiAgICAgICAgaWYgKGVsICE9PSBudWxsICYmIHR5cGVvZiBlbCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBkZWxldGUgKGVsIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVtzdWJdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBkb3RJZHggPSBwYXRoLmluZGV4T2YoJy4nKTtcbiAgaWYgKGRvdElkeCAhPT0gLTEpIHtcbiAgICAvLyAncGFyZW50LmZpZWxkJyBcdTIwMTQgZGVsZXRlIGBmaWVsZGAgZnJvbSB0aGUgbmVzdGVkIG9iamVjdCB3aGVuIHByZXNlbnQuXG4gICAgLy8gVmFyaWFudC1zY29wZWQga2V5cyBzaW1wbHkgZG9uJ3QgbWF0Y2ggb24gb3RoZXIgdmFyaWFudHMuXG4gICAgY29uc3QgcGFyZW50ID0gYmxvY2tbcGF0aC5zbGljZSgwLCBkb3RJZHgpXTtcbiAgICBpZiAocGFyZW50ICE9PSBudWxsICYmIHR5cGVvZiBwYXJlbnQgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHBhcmVudCkpIHtcbiAgICAgIGRlbGV0ZSAocGFyZW50IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVtwYXRoLnNsaWNlKGRvdElkeCArIDEpXTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vICdmaWVsZCcgXHUyMDE0IGRlbGV0ZSB0aGUgYmxvY2sncyB0b3AtbGV2ZWwgZmllbGQuXG4gIGRlbGV0ZSBibG9ja1twYXRoXTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEluLWJhbmQgc2VjcmV0cyBcdTIwMTQgdGhlIHVuY29uZGl0aW9uYWwgZGVlcCB3YWxrIChsYXllciAzKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFBST01QVF9DQVJSSUVSX1RZUEVTIGlzIHNpbmdsZS1zb3VyY2VkIChwcm9tcHRDYXJyaWVycy50cykgXHUyMDE0IHRoZSBncmFkaW5nXG4vLyB3YWxrIGNvbnN1bWVzIHRoZSBzYW1lIHJvc3RlciwgYW5kIHR3byBkZWNsYXJhdGlvbnMgZHJpZnRlZC1yaXNrIGEgc2lsZW50XG4vLyBsZWFrIG9yIGEgc2lsZW50IG1pcy1ncmFkZSAoQTcpLlxuXG5mdW5jdGlvbiBzdHJpcEluQmFuZFNlY3JldHModmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgZm9yIChjb25zdCBlbCBvZiB2YWx1ZSkgc3RyaXBJbkJhbmRTZWNyZXRzKGVsKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHJldHVybjtcbiAgY29uc3Qgb2JqID0gdmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgaWYgKG9iai50eXBlID09PSAnYmxhbmsnKSB7XG4gICAgZm9yIChjb25zdCBmaWVsZCBvZiBCTEFOS19TRUNSRVRfRklFTERTKSBkZWxldGUgb2JqW2ZpZWxkXTtcbiAgfVxuICBpZiAoXG4gICAgdHlwZW9mIG9iai50eXBlID09PSAnc3RyaW5nJyAmJlxuICAgIFBST01QVF9DQVJSSUVSX1RZUEVTLmhhcyhvYmoudHlwZSkgJiZcbiAgICBBcnJheS5pc0FycmF5KG9iai5wcm9tcHRzKVxuICApIHtcbiAgICBmb3IgKGNvbnN0IHByb21wdCBvZiBvYmoucHJvbXB0cykge1xuICAgICAgaWYgKHByb21wdCAhPT0gbnVsbCAmJiB0eXBlb2YgcHJvbXB0ID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIE1BVEhfUFJPTVBUX1NFQ1JFVF9GSUVMRFMpIHtcbiAgICAgICAgICBkZWxldGUgKHByb21wdCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilbZmllbGRdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG9iaikpIHN0cmlwSW5CYW5kU2VjcmV0cyhvYmpba2V5XSk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQZXItYmxvY2sgc2FuaXRpemVcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBNdXRhdGluZyBjb3JlIFx1MjAxNCBvcGVyYXRlcyBvbiBhbiBhbHJlYWR5LWNsb25lZCBibG9jay4gKi9cblxuLy8gLS0tLSBEZXJpdmVkIHF1ZXN0aW9uIHNoYXBlICh0aGUgb25lIEFERElUSVZFIHN0ZXApIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzYW5pdGl6ZXIncyBqb2IgaXMgcmVtb3ZhbDsgdGhpcyBpcyB0aGUgc2luZ2xlIGV4Y2VwdGlvbiwgYW5kIGl0IGlzXG4vLyBmZW5jZWQgYWNjb3JkaW5nbHkuXG4vL1xuLy8gV2h5IGl0IGV4aXN0czogdGhlIGdyYXBoIHdpZGdldHMgdGFrZSB0aGVpciBoYW5kbGUgY291bnQgYW5kIGN1cnZlIGZhbWlseVxuLy8gZnJvbSB0aGUgYW5zd2VyIGtleS4gVGhlIHZpZXdlciBuZXZlciByZWNlaXZlcyBhIGtleSwgc28gd2l0aG91dCB0aGlzIGFcbi8vIHNlcnZlZCBncmFwaCBxdWVzdGlvbiBjYW5ub3QgYmUgbGFpZCBvdXQgXHUyMDE0IHRoZXJlIGlzIG5vIHdheSB0byBrbm93IHdoZXRoZXJcbi8vIHRvIGRyYXcgb25lIGhhbmRsZSBvciB0aHJlZS5cbi8vXG4vLyBXaHkgaXQgaXMgc2FmZTogd2hhdCBsZWF2ZXMgaGVyZSBpcyBxdWVzdGlvbiBTSEFQRSwgd2hpY2ggdGhlIHN0dWRlbnQgY2FuXG4vLyBhbHJlYWR5IHNlZSAoaG93IG1hbnkgaGFuZGxlczsgd2hpY2ggZmFtaWx5J3MgY3VydmUgZm9sbG93cyB0aGVpciBkcmFncyksXG4vLyBuZXZlciB0aGUgY29vcmRpbmF0ZXMsIHRvbGVyYW5jZXMsIG9yIGNvZWZmaWNpZW50cyB0aGF0IG1ha2UgYW4gYW5zd2VyLiBUaGVcbi8vIGd1YXJhbnRlZSBpcyBTVFJVQ1RVUkFMIHJhdGhlciB0aGFuIGEgcHJvbWlzZSBhYm91dCB0aGlzIGNvZGU6IGV2ZXJ5IHZhbHVlXG4vLyBwYXNzZXMgYSB3aGl0ZWxpc3Qgb24gdGhlIHdheSBvdXQgXHUyMDE0IHNtYWxsIHBvc2l0aXZlIGludGVnZXJzLCBvciBhIGZhbWlseVxuLy8gbmFtZSBmcm9tIGEgY2xvc2VkIHNldCBcdTIwMTQgc28gYSBjb29yZGluYXRlIGNhbm5vdCB0cmF2ZWwgdGhpcyBwYXRoIGV2ZW4gaWYgYVxuLy8gZnV0dXJlIGVkaXQgdHJpZWQgdG8gc2VuZCBvbmUuIEFueXRoaW5nIGZhaWxpbmcgdGhlIHdoaXRlbGlzdCBpcyBkcm9wcGVkLFxuLy8gbm90IHBhc3NlZCB0aHJvdWdoIChmYWlsIGNsb3NlZCwgbGlrZSB0aGUgdW5rbm93bi1ibG9jay10eXBlIHRocm93KS5cblxuLyoqIFVwcGVyIGJvdW5kIG9uIGEgaGFuZGxlIGNvdW50LiBGYXIgYWJvdmUgYW55IHJlYWwgcXVlc3Rpb247IGV4aXN0cyBzbyBhXG4gKiBjb3JydXB0IG9yIGhvc3RpbGUgbGVuZ3RoIGNhbid0IGJlY29tZSBhbiBhYnN1cmQgYWxsb2NhdGlvbiBkb3duc3RyZWFtLiAqL1xuY29uc3QgTUFYX0hBTkRMRVMgPSAyNDtcblxuLyoqIEN1cnZlIGZhbWlsaWVzIHRoZSB3aWRnZXQgbGF5cyBvdXQuIENsb3NlZCBzZXQ6IGFuIHVucmVjb2duaXplZCBmYW1pbHkgaXNcbiAqIGRyb3BwZWQgYW5kIHRoZSB3aWRnZXQgZmFsbHMgYmFjayB0byBpdHMgb3duIGRlZmF1bHQuICovXG5jb25zdCBLTk9XTl9GQU1JTElFUzogUmVhZG9ubHlTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoW1xuICAnbGluZWFyJyxcbiAgJ3F1YWRyYXRpYycsXG4gICdleHBvbmVudGlhbCcsXG4gICdsb2dhcml0aG1pYycsXG4gICd2ZXJ0aWNhbCcsXG4gICdhYnNvbHV0ZScsXG4gICdzcXJ0JyxcbiAgJ2N1YmljJyxcbiAgJ3F1YXJ0aWMnLFxuXSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUXVlc3Rpb25TaGFwZSB7XG4gIGhhbmRsZUNvdW50PzogbnVtYmVyO1xuICBmYW1pbHk/OiBzdHJpbmc7XG4gIHZlcnRleENvdW50PzogbnVtYmVyO1xufVxuXG4vKiogQSBjb3VudCBzdXJ2aXZlcyBvbmx5IGFzIGEgc21hbGwgcG9zaXRpdmUgaW50ZWdlci4gKi9cbmZ1bmN0aW9uIHNhZmVDb3VudCh2YWx1ZTogdW5rbm93bik6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmXG4gICAgTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgJiZcbiAgICB2YWx1ZSA+IDAgJiZcbiAgICB2YWx1ZSA8PSBNQVhfSEFORExFU1xuICAgID8gdmFsdWVcbiAgICA6IHVuZGVmaW5lZDtcbn1cblxuLyoqIEEgZmFtaWx5IHN1cnZpdmVzIG9ubHkgaWYgaXQgaXMgYSBrbm93biBuYW1lLiAqL1xuZnVuY3Rpb24gc2FmZUZhbWlseSh2YWx1ZTogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIEtOT1dOX0ZBTUlMSUVTLmhhcyh2YWx1ZSlcbiAgICA/IHZhbHVlXG4gICAgOiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogRGVyaXZlIHRoZSBzZXJ2ZWQgcXVlc3Rpb24gc2hhcGUgZnJvbSBhbiBVTlNBTklUSVpFRCBibG9jayAoaXQgcmVhZHMgdGhlXG4gKiBhbnN3ZXIga2V5LCBzbyBpdCBtdXN0IHJ1biBiZWZvcmUgdGhlIHN0cmlwcykuIFJldHVybnMgdW5kZWZpbmVkIHdoZW4gdGhlcmVcbiAqIGlzIG5vdGhpbmcgdG8gc2F5IFx1MjAxNCBhIGRpc3BsYXktbW9kZSBncmFwaCB0YWtlcyBubyBpbnB1dCBhbmQgZ2V0cyBubyBzaGFwZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlcml2ZVF1ZXN0aW9uU2hhcGUoXG4gIGJsb2NrOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFF1ZXN0aW9uU2hhcGUgfCB1bmRlZmluZWQge1xuICBjb25zdCBpbnRlcmFjdGlvbiA9IGJsb2NrLmludGVyYWN0aW9uIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xuICBjb25zdCBraW5kID0gdHlwZW9mIGludGVyYWN0aW9uPy50eXBlID09PSAnc3RyaW5nJyA/IGludGVyYWN0aW9uLnR5cGUgOiBudWxsO1xuICBpZiAoIWtpbmQgfHwga2luZCA9PT0gJ2Rpc3BsYXknKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHNoYXBlOiBRdWVzdGlvblNoYXBlID0ge307XG5cbiAgLy8gUG9pbnQtc3R5bGUgaW50ZXJhY3Rpb25zOiBvbmUgaGFuZGxlIHBlciBhdXRob3JlZCB0YXJnZXQuIFRoaXMgbWlycm9yc1xuICAvLyBleGFjdGx5IHdoYXQgdGhlIGdyYWRlZCB3aWRnZXQgYWxyZWFkeSBkb2VzIHdpdGggdGhlIGtleVxuICAvLyAoY291bnQgPSBjb3JyZWN0UG9pbnRzLmxlbmd0aCksIHNvIGEgc3R1ZGVudCBzZWVzIHRoZSBzYW1lIHdpZGdldCBlaXRoZXJcbiAgLy8gd2F5IFx1MjAxNCB0aGUgbnVtYmVyIG9mIGhhbmRsZXMgaXMgbm90IHRoZSBzZWNyZXQsIHRoZWlyIHBvc2l0aW9ucyBhcmUuXG4gIGNvbnN0IHBvaW50cyA9IGludGVyYWN0aW9uPy5jb3JyZWN0UG9pbnRzO1xuICBpZiAoQXJyYXkuaXNBcnJheShwb2ludHMpKSB7XG4gICAgY29uc3QgY291bnQgPSBzYWZlQ291bnQocG9pbnRzLmxlbmd0aCk7XG4gICAgaWYgKGNvdW50ICE9PSB1bmRlZmluZWQpIHNoYXBlLmhhbmRsZUNvdW50ID0gY291bnQ7XG4gIH1cblxuICAvLyBDdXJ2ZSBmYW1pbGllczogdGhlIHNoYXBlIG9mIHRoZSBjdXJ2ZSB0aGF0IGZvbGxvd3MgdGhlIHN0dWRlbnQncyBkcmFncy5cbiAgY29uc3QgbW9kZWxzID0gaW50ZXJhY3Rpb24/Lm1vZGVscztcbiAgaWYgKEFycmF5LmlzQXJyYXkobW9kZWxzKSAmJiBtb2RlbHMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGZhbWlseSA9IHNhZmVGYW1pbHkoXG4gICAgICAobW9kZWxzWzBdIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbCk/LmZhbWlseSxcbiAgICApO1xuICAgIGlmIChmYW1pbHkgIT09IHVuZGVmaW5lZCkgc2hhcGUuZmFtaWx5ID0gZmFtaWx5O1xuICB9XG5cbiAgLy8gQW4gaW5lcXVhbGl0eSdzIGJvdW5kYXJ5IHJpZGVzIHRoZSBzYW1lIGZhbWlseSBtYWNoaW5lcnkuXG4gIGNvbnN0IGluZXF1YWxpdGllcyA9IGludGVyYWN0aW9uPy5pbmVxdWFsaXRpZXM7XG4gIGlmIChBcnJheS5pc0FycmF5KGluZXF1YWxpdGllcykgJiYgaW5lcXVhbGl0aWVzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBib3VuZGFyeSA9IChpbmVxdWFsaXRpZXNbMF0gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsKVxuICAgICAgPy5ib3VuZGFyeSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBmYW1pbHkgPSBzYWZlRmFtaWx5KGJvdW5kYXJ5Py5mYW1pbHkpO1xuICAgIGlmIChmYW1pbHkgIT09IHVuZGVmaW5lZCkgc2hhcGUuZmFtaWx5ID0gZmFtaWx5O1xuICB9XG5cbiAgLy8gUG9seWdvbiB2ZXJ0ZXggY291bnQgZm9yIHNoYWRlX3JlZ2lvbi5cbiAgY29uc3QgcmVnaW9ucyA9IGludGVyYWN0aW9uPy5yZWdpb25zO1xuICBpZiAoQXJyYXkuaXNBcnJheShyZWdpb25zKSAmJiByZWdpb25zLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCB2ZXJ0aWNlcyA9IChyZWdpb25zWzBdIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbClcbiAgICAgID8uY29ycmVjdFZlcnRpY2VzO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZlcnRpY2VzKSkge1xuICAgICAgY29uc3QgY291bnQgPSBzYWZlQ291bnQodmVydGljZXMubGVuZ3RoKTtcbiAgICAgIGlmIChjb3VudCAhPT0gdW5kZWZpbmVkKSBzaGFwZS52ZXJ0ZXhDb3VudCA9IGNvdW50O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBPYmplY3Qua2V5cyhzaGFwZSkubGVuZ3RoID4gMCA/IHNoYXBlIDogdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBzYW5pdGl6ZUJsb2NrTXV0KGJsb2NrOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICBjb25zdCB0eXBlID0gYmxvY2sudHlwZTtcbiAgY29uc3QgZW50cnkgPVxuICAgIHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyAmJiB0eXBlIGluIGJsb2NrUmVnaXN0cnlcbiAgICAgID8gYmxvY2tSZWdpc3RyeVt0eXBlIGFzIGtleW9mIHR5cGVvZiBibG9ja1JlZ2lzdHJ5XVxuICAgICAgOiB1bmRlZmluZWQ7XG4gIGlmICghZW50cnkpIHtcbiAgICAvLyBBIHZhbGlkYXRlZCBBY3Rpdml0eURvY3VtZW50IGNhbid0IGdldCBoZXJlICh0aGUgcmVnaXN0cnkgY292ZXJhZ2UgZ3VhcmRcbiAgICAvLyBwcm92ZXMgZXhhY3QgYWdyZWVtZW50IHdpdGggdGhlIEJsb2NrIHVuaW9uKSBcdTIwMTQgYnV0IHRoZSBzYW5pdGl6ZXIgc2l0cyBvblxuICAgIC8vIHRoZSB3aXJlIGJvdW5kYXJ5LCBzbyBhbiB1bmtub3duIHR5cGUgZmFpbHMgQ0xPU0VELCBuZXZlciBwYXNzZXMgdGhyb3VnaC5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYHNhbml0aXplOiB1bmtub3duIGJsb2NrIHR5cGUgJHtTdHJpbmcodHlwZSl9YCk7XG4gIH1cblxuICAvLyBEZXJpdmVkIHNoYXBlIGlzIGNvbXB1dGVkIEJFRk9SRSB0aGUgc3RyaXBzIChpdCByZWFkcyB0aGUgYW5zd2VyIGtleSkgYW5kXG4gIC8vIGF0dGFjaGVkIGFmdGVyLCBzbyB0aGUgc2VydmVkIGJsb2NrIGNhcnJpZXMgb25seSB0aGUgd2hpdGVsaXN0ZWQgcmVzdWx0LlxuICBjb25zdCBzaGFwZSA9IGVudHJ5LnNhbml0aXplLmRlcml2ZVF1ZXN0aW9uU2hhcGVcbiAgICA/IGRlcml2ZVF1ZXN0aW9uU2hhcGUoYmxvY2spXG4gICAgOiB1bmRlZmluZWQ7XG5cbiAgZm9yIChjb25zdCBwYXRoIG9mIGVudHJ5LnNhbml0aXplLnN0cmlwKSBhcHBseVN0cmlwUGF0aChibG9jaywgcGF0aCk7XG5cbiAgaWYgKHNoYXBlKSBibG9jay5xdWVzdGlvblNoYXBlID0gc2hhcGU7XG5cbiAgZm9yIChjb25zdCBmaWVsZCBvZiBlbnRyeS5zYW5pdGl6ZS5jaGlsZEJsb2NrcyA/PyBbXSkge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gYmxvY2tbZmllbGRdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSkge1xuICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikge1xuICAgICAgICBpZiAoY2hpbGQgIT09IG51bGwgJiYgdHlwZW9mIGNoaWxkID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHNhbml0aXplQmxvY2tNdXQoY2hpbGQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RyaXBJbkJhbmRTZWNyZXRzKGJsb2NrKTtcbn1cblxuLyoqXG4gKiBTYW5pdGl6ZSBhIGxvb3NlIElOTElORS1DT05URU5UIGFycmF5IHB1bGxlZCBvdXQgb2YgdGhlIHJhdyBkb2N1bWVudCAocHVyZSkuXG4gKlxuICogUzQncyBncmFkaW5nIFJQQyBpcyBhIHNlY29uZCBzZXJ2ZXJcdTIxOTJjbGllbnQgY2hhbm5lbDogaXQgcmV0dXJucyBhdXRob3JlZFxuICogYGZlZWRiYWNrYCBhbmQgYHNvbHV0aW9uYCBjb250ZW50IHRoYXQgdGhlIHJlYWQgQVBJIGRlbGliZXJhdGVseSBzdHJpcHBlZCBhbmRcbiAqIHRoZSBzZXJ2ZXIgcmVsZWFzZXMgb25seSBhZnRlciBhIGNoZWNrLiBUaG9zZSBhcmUgYElubGluZU5vZGVbXWAsIGFuZCBhblxuICogaW5saW5lIGFycmF5IGNhbiBjYXJyeSBpbi1iYW5kIHNlY3JldHMgXHUyMDE0IGEgcHJvbXB0ZWQgYG1hdGhfaW5saW5lYCBzaXR0aW5nXG4gKiBpbnNpZGUgYSBzb2x1dGlvbiBwYXJhZ3JhcGgsIG9yIGEgcGFzdGVkIGJsYW5rIHRva2VuIFx1MjAxNCBzbyBpdCBtdXN0IGdvIHRocm91Z2hcbiAqIHRoZSBTQU1FIHVuY29uZGl0aW9uYWwgZGVlcCB3YWxrIHRoZSBzZXJ2ZWQgZG9jdW1lbnQgZG9lcy4gV2l0aG91dCB0aGlzLCBhblxuICogYXV0aG9yZWQgc29sdXRpb24gY29udGFpbmluZyBhIGJsYW5rIHdvdWxkIGhhbmQgZXZlcnkgY2hlY2tpbmcgc3R1ZGVudCB0aGF0XG4gKiBibGFuaydzIGFuc3dlcnMsIHNpbGVudGx5LlxuICpcbiAqIFJldXNpbmcgYHN0cmlwSW5CYW5kU2VjcmV0c2AgcmF0aGVyIHRoYW4gcmVpbXBsZW1lbnRpbmcgaXQgaXMgdGhlIHBvaW50OiB0aGVcbiAqIHNlY3JldC1maWVsZCBsaXN0cyBsaXZlIGluIHRoZSByZWdpc3RyeSwgYW5kIGEgZnV0dXJlIGFkZGl0aW9uIHRvIHRoZW0gaGFzIHRvXG4gKiBwcm90ZWN0IGJvdGggY2hhbm5lbHMgYXV0b21hdGljYWxseSBvciBpdCBwcm90ZWN0cyBuZWl0aGVyLlxuICpcbiAqIFJldHVybnMgYSBjbG9uZTsgdGhlIGNhbGxlcidzIGFycmF5IGlzIG5ldmVyIG11dGF0ZWQgKGl0IGJlbG9uZ3MgdG8gdGhlXG4gKiBjYWNoZWQgcmF3IGRvY3VtZW50KS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplSW5saW5lQ29udGVudDxUPihub2RlczogVFtdKTogVFtdIHtcbiAgY29uc3QgY2xvbmUgPSBzdHJ1Y3R1cmVkQ2xvbmUobm9kZXMpO1xuICBzdHJpcEluQmFuZFNlY3JldHMoY2xvbmUpO1xuICByZXR1cm4gY2xvbmU7XG59XG5cbi8qKiBTYW5pdGl6ZSBPTkUgYmxvY2sgKHB1cmUpLiBFeHBvc2VkIGZvciB0ZXN0cyBhbmQgcGVyLWJsb2NrIHRvb2xpbmc7IHRoZVxuICogZG9jdW1lbnQtbGV2ZWwgZW50cnkgcG9pbnQgYmVsb3cgaXMgd2hhdCB0aGUgcmVhZCBBUEkgdXNlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUJsb2NrKGJsb2NrOiBCbG9jayk6IFNhbml0aXplZEJsb2NrIHtcbiAgY29uc3QgY2xvbmUgPSBzdHJ1Y3R1cmVkQ2xvbmUoYmxvY2spIGFzIHVua25vd24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIHNhbml0aXplQmxvY2tNdXQoY2xvbmUpO1xuICByZXR1cm4gY2xvbmUgYXMgdW5rbm93biBhcyBTYW5pdGl6ZWRCbG9jaztcbn1cblxuLyoqXG4gKiBTYW5pdGl6ZSBhIGZ1bGwgdXBncmFkZWQgZG9jdW1lbnQgKHB1cmUpLiBFdmVyeSBibG9jayB0aGUgZG9jdW1lbnQgc2hpcHMgXHUyMDE0XG4gKiBib2R5IEFORCByZWZlcmVuY2UgcGFuZWwgXHUyMDE0IGdvZXMgdGhyb3VnaCBpdHMgcmVnaXN0cnkgZW50cnk7IHRoZSBpbi1iYW5kIGRlZXBcbiAqIHdhbGsgdGhlbiBjb3ZlcnMgd2hhdGV2ZXIgaXMgbGVmdCAobWV0YSwgaW5saW5lIG5vZGVzIGFueXdoZXJlKSBhcyBkZWZlbnNlIGluXG4gKiBkZXB0aC5cbiAqXG4gKiBcdTI2QTAgVGhlIHJlZmVyZW5jZSBwYW5lbCB3YXMgTk9UIGluIHRoYXQgc2V0IHVudGlsIDIwMjYtMDgtMjMsIGFuZCB0aGUgY29tbWVudFxuICogaGVyZSBhc3NlcnRlZCB0aGUgcmVhc29uIGl0IGRpZCBub3QgbmVlZCB0byBiZTogXCJ0aG9zZSBzdXJmYWNlcyBjYXJyeSBub1xuICogZGVjbGFyZWQgYW5zd2VyIGtleXNcIi4gVGhhdCB3YXMgZmFsc2UuIGBSZWZlcmVuY2VQYW5lbC5ibG9ja3NgIGlzXG4gKiBgei5hcnJheShCbG9jaylgIFx1MjAxNCB0aGUgU0FNRSBmdWxsIHVuaW9uIGFzIHNlY3Rpb24gY29udGVudCwgbXVsdGlwbGUgY2hvaWNlXG4gKiBhbmQgbWF0Y2hpbmcgaW5jbHVkZWQgXHUyMDE0IHNvIGEga2V5LWJlYXJpbmcgYmxvY2sgaW4gYSBwYW5lbCByZWFjaGVkIHRoZSBzdHVkZW50XG4gKiB3aXRoIGl0cyBrZXkgaW50YWN0LCBiZWNhdXNlIHRoZSBkZWVwIHdhbGsgYmVsb3cga25vd3Mgb25seSBhYm91dCBibGFua3MgYW5kXG4gKiBtYXRoIHByb21wdHMuIFRoZSBsZWFrIGZpeHR1cmUgbm93IHBsYW50cyBldmVyeSBibG9jayB0eXBlIGluIHRoZSBwYW5lbCB0b28sXG4gKiBzbyB0aGlzIGlzIGEgd2lyZS1zY2FubmVkIHByb3BlcnR5IHJhdGhlciB0aGFuIGEgY2xhaW0gaW4gYSBjb21tZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVBY3Rpdml0eURvY3VtZW50KFxuICBkb2M6IEFjdGl2aXR5RG9jdW1lbnQsXG4pOiBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50IHtcbiAgY29uc3QgY2xvbmUgPSBzdHJ1Y3R1cmVkQ2xvbmUoZG9jKSBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+ICYge1xuICAgIHNlY3Rpb25zOiBBcnJheTx7XG4gICAgICByb3dzOiBBcnJheTx7IGNvbHVtbnM6IEFycmF5PHsgYmxvY2tzOiB1bmtub3duW10gfT4gfT47XG4gICAgfT47XG4gIH07XG4gIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBjbG9uZS5zZWN0aW9ucykge1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHNlY3Rpb24ucm93cykge1xuICAgICAgZm9yIChjb25zdCBjb2x1bW4gb2Ygcm93LmNvbHVtbnMpIHtcbiAgICAgICAgZm9yIChjb25zdCBibG9jayBvZiBjb2x1bW4uYmxvY2tzKSB7XG4gICAgICAgICAgaWYgKGJsb2NrICE9PSBudWxsICYmIHR5cGVvZiBibG9jayA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHNhbml0aXplQmxvY2tNdXQoYmxvY2sgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBUaGUgcmVmZXJlbmNlIHBhbmVsIHNoaXBzIHRoZSBzYW1lIEJsb2NrIHVuaW9uIHRoZSBib2R5IGRvZXMsIHNvIGl0IGdldHNcbiAgLy8gdGhlIHNhbWUgcGVyLWJsb2NrIHRyZWF0bWVudC4gU2NhZmZvbGQgYnkgaW50ZW50IGlzIG5vdCBzY2FmZm9sZCBieSBTQ0hFTUEuXG4gIGNvbnN0IHBhbmVsID0gY2xvbmUucmVmZXJlbmNlUGFuZWw7XG4gIGlmIChwYW5lbCAhPT0gbnVsbCAmJiB0eXBlb2YgcGFuZWwgPT09ICdvYmplY3QnKSB7XG4gICAgY29uc3QgcGFuZWxCbG9ja3MgPSAocGFuZWwgYXMgeyBibG9ja3M/OiB1bmtub3duIH0pLmJsb2NrcztcbiAgICBpZiAoQXJyYXkuaXNBcnJheShwYW5lbEJsb2NrcykpIHtcbiAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgcGFuZWxCbG9ja3MpIHtcbiAgICAgICAgaWYgKGJsb2NrICE9PSBudWxsICYmIHR5cGVvZiBibG9jayA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBzYW5pdGl6ZUJsb2NrTXV0KGJsb2NrIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBFdmVyeXRoaW5nIGVsc2UgKG1ldGEsIGFuZCBhbnkgaW5saW5lIG5vZGUgYW55d2hlcmUpIFx1MjAxNCBpbi1iYW5kIHNlY3JldHMuXG4gIHN0cmlwSW5CYW5kU2VjcmV0cyhjbG9uZSk7XG4gIHJldHVybiBjbG9uZSBhcyB1bmtub3duIGFzIFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQ7XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHNhbml0aXplL3NodWZmbGUudHMgXHUyMDE0IHNlcnZlLXRpbWUgZGV0ZXJtaW5pc3RpYyBzaHVmZmxlcyAoUzIsIFNhbml0aXplU3BlYylcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgcmVnaXN0cnkncyBgc2VydmVTaHVmZmxlZGAgbWFya3MgYXJyYXlzIHdob3NlIEFVVEhPUkVEIE9SREVSIGlzIHRoZVxuLy8gYW5zd2VyIGtleSAob3JkZXJpbmcuaXRlbXMpIFx1MjAxNCBhIHN0cmlwIGNhbid0IGhlbHAgd2hlbiB0aGUgb3JkZXIgaXRzZWxmIGlzXG4vLyB0aGUgc2VjcmV0LCBzbyB0aGUgc2VydmVyIHNlcnZlcyBhIHBlcm11dGF0aW9uLiBSZXF1aXJlbWVudHMgZnJvbSB0aGUgc3BlYzpcbi8vXG4vLyAgIC0gRGV0ZXJtaW5pc3RpYyBwZXIgKHZlcnNpb24sIHN0dWRlbnQpOiB0aGUgcmVhZCBBUEkgc2VlZHMgd2l0aFxuLy8gICAgIGAke3ZlcnNpb25faWR9OiR7dXNlcl9pZH1gLCBzbyBhIHJlbG9hZCAob3IgYW4gSFRUUC1jYWNoZSBtaXNzKSBzZXJ2ZXNcbi8vICAgICB0aGUgU0FNRSBvcmRlciBcdTIwMTQgdGhlIHN0dWRlbnQncyBzY3JlZW4gbmV2ZXIgcmVzaHVmZmxlcyB1bmRlciB0aGVtLlxuLy8gICAtIEFwcGxpZWQgYXQgU0VSVkUgdGltZSwgYWZ0ZXIgdGhlIHBlci12ZXJzaW9uIGNhY2hlOiB0aGUgY2FjaGVkIGFydGlmYWN0XG4vLyAgICAgaXMgc3R1ZGVudC1pbmRlcGVuZGVudCAodGhhdCdzIHdoYXQgbWFrZXMgaXQgY2FjaGVhYmxlKTsgdGhpcyB0cmFuc2Zvcm1cbi8vICAgICBpcyBjaGVhcCBlbm91Z2ggdG8gcnVuIHBlciByZXF1ZXN0LlxuLy8gICAtIFBlci1ibG9jayBzdWItc2VlZGluZzogdHdvIG9yZGVyaW5nIGJsb2NrcyBpbiBvbmUgYWN0aXZpdHkgZ2V0XG4vLyAgICAgaW5kZXBlbmRlbnQgcGVybXV0YXRpb25zIChibG9jayBpZCArIGZpZWxkIGpvaW4gdGhlIHNlZWQpLlxuLy9cbi8vIEdyYWRpbmcgaXMgb3JkZXItaW5kZXBlbmRlbnQgKHJlc3BvbnNlcyByZWZlcmVuY2UgaXRlbSBpZHMsIGFuZCB0aGUgc2VydmVyXG4vLyBncmFkZXMgYWdhaW5zdCB0aGUgYXV0aG9yZWQga2V5KSwgc28gdGhlIHBlcm11dGF0aW9uIGlzIHByZXNlbnRhdGlvbi1vbmx5IFx1MjAxNFxuLy8gYnV0IGl0cyBzdGFiaWxpdHkgaXMgYSBVWCBjb250cmFjdCwgbm90IGEgbmljZXR5LlxuLy9cbi8vIFRoZSBQUk5HIGlzIGEgc2VlZGVkIHhvcnNoaWZ0LXN0eWxlIGdlbmVyYXRvciAobXVsYmVycnkzMikgb3ZlciBhbiBGTlYtMWFcbi8vIHNlZWQgXHUyMDE0IGRldGVybWluaXN0aWMgYWNyb3NzIEpTIHJ1bnRpbWVzLCBkZXBlbmRlbmN5LWZyZWUuIE5vdCBjcnlwdG9ncmFwaGljLFxuLy8gZGVsaWJlcmF0ZWx5OiB0aGUgdGhyZWF0IG1vZGVsIGlzIFwiZG9uJ3Qgc2VydmUgdGhlIGF1dGhvcmVkIG9yZGVyLFwiIG5vdFxuLy8gXCJtYWtlIHRoZSBwZXJtdXRhdGlvbiB1bnByZWRpY3RhYmxlIHRvIGEgZGV0ZXJtaW5lZCBzdHVkZW50IHdpdGggYSBkZWJ1Z2dlclwiXG4vLyAodGhlIGFuc3dlciBrZXkgbmV2ZXIgbGVhdmVzIHRoZSBzZXJ2ZXIgZWl0aGVyIHdheSkuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyBibG9ja1JlZ2lzdHJ5IH0gZnJvbSAnLi4vcmVnaXN0cnkvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHR5cGUgeyBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50IH0gZnJvbSAnLi9zYW5pdGl6ZWQtdHlwZXMuanMnO1xuXG4vKiogRk5WLTFhIDMyLWJpdCBvdmVyIGEgc3RyaW5nIFx1MjE5MiB1aW50MzIgc2VlZC4gKi9cbmZ1bmN0aW9uIHNlZWRGcm9tKHRleHQ6IHN0cmluZyk6IG51bWJlciB7XG4gIGxldCBoYXNoID0gMHg4MTFjOWRjNTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0ZXh0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaGFzaCBePSB0ZXh0LmNoYXJDb2RlQXQoaSk7XG4gICAgaGFzaCA9IE1hdGguaW11bChoYXNoLCAweDAxMDAwMTkzKTtcbiAgfVxuICByZXR1cm4gaGFzaCA+Pj4gMDtcbn1cblxuLyoqIG11bGJlcnJ5MzIgXHUyMDE0IHRpbnkgZGV0ZXJtaW5pc3RpYyBQUk5HLCB1bmlmb3JtIGVub3VnaCBmb3IgYSBzaHVmZmxlLiAqL1xuZnVuY3Rpb24gbXVsYmVycnkzMihzZWVkOiBudW1iZXIpOiAoKSA9PiBudW1iZXIge1xuICBsZXQgYSA9IHNlZWQgPj4+IDA7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgYSA9IChhICsgMHg2ZDJiNzlmNSkgPj4+IDA7XG4gICAgbGV0IHQgPSBhO1xuICAgIHQgPSBNYXRoLmltdWwodCBeICh0ID4+PiAxNSksIHQgfCAxKTtcbiAgICB0IF49IHQgKyBNYXRoLmltdWwodCBeICh0ID4+PiA3KSwgdCB8IDYxKTtcbiAgICByZXR1cm4gKCh0IF4gKHQgPj4+IDE0KSkgPj4+IDApIC8gNDI5NDk2NzI5NjtcbiAgfTtcbn1cblxuLyoqXG4gKiBGaXNoZXJcdTIwMTNZYXRlcyB3aXRoIGEgc2VlZGVkIFBSTkcgKHB1cmUgXHUyMDE0IHJldHVybnMgYSBuZXcgYXJyYXkpLlxuICpcbiAqIE5FVkVSIFJFVFVSTlMgVEhFIElERU5USVRZIGZvciAyKyBpdGVtczsgaXQgcm90YXRlcyBieSBvbmUgaWYgdGhlIGRlYWwgbGFuZHNcbiAqIHRoZXJlLiBUaGlzIGlzIG5vdCB0aWRpbmVzcyBcdTIwMTQgaXQgaXMgdGhlIHdob2xlIHBvaW50IG9mIHNodWZmbGluZyB0aGVzZVxuICogZmllbGRzLiBUaGUgYXJyYXlzIHRoYXQgcmVhY2ggaGVyZSBhcmUgdGhlIG9uZXMgd2hvc2UgQVVUSE9SRUQgT1JERVIgSVMgVEhFXG4gKiBBTlNXRVIsIHNvIGFuIGlkZW50aXR5IGRlYWwgc2VydmVzIHRoZSBzdHVkZW50IGEgcHJlLXNvbHZlZCBxdWVzdGlvbi4gQSBmYWlyXG4gKiBzaHVmZmxlIGxhbmRzIG9uIGl0IDEvbiEgb2YgdGhlIHRpbWUsIHdoaWNoIHNvdW5kcyBuZWdsaWdpYmxlIHVudGlsIHlvdVxuICogbm90aWNlIHRoYXQgb3JkZXJpbmcgYmxvY2tzIGFyZSBhbGxvd2VkIGFzIGZldyBhcyB0d28gaXRlbXMgXHUyMDE0IG9uZSBjbGFzcyBpblxuICogdHdvLCBmb3IgdGhhdCBxdWVzdGlvbi4gVGhlIHJlbmRlcmVyIGhhcyBhbHdheXMgZ3VhcmFudGVlZCB0aGlzXG4gKiAocmVuZGVyZXIvc3JjL2Jsb2Nrcy9zaHVmZmxlLnRzKSBhbmQgdGhlIHZpZXdlciBtdXN0IG5vdCByZWdyZXNzIGl0IGF0XG4gKiBjdXRvdmVyLlxuICpcbiAqIFM0J3MgZ3JhZGluZyBrZWVwcyBpdHMgb3duIGRlZmVuc2l2ZSBndWFyZCBmb3IgdGhlIHNlcnZlZC1vcmRlci1lcXVhbHMtXG4gKiBhdXRob3JlZC1vcmRlciBjYXNlIChncmFkaW5nL2Nob2ljZXMudHMpIGFuZCBzaG91bGQga2VlcCBpdDogaXQgYWxzbyBjb3ZlcnNcbiAqIGRvY3VtZW50cyBzZXJ2ZWQgdW5zaHVmZmxlZCwgd2hpY2ggdGhpcyBjYW5ub3Qgc3BlYWsgZm9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VlZGVkU2h1ZmZsZTxUPihpdGVtczogcmVhZG9ubHkgVFtdLCBzZWVkS2V5OiBzdHJpbmcpOiBUW10ge1xuICBjb25zdCBvdXQgPSBbLi4uaXRlbXNdO1xuICBjb25zdCBuZXh0ID0gbXVsYmVycnkzMihzZWVkRnJvbShzZWVkS2V5KSk7XG4gIGZvciAobGV0IGkgPSBvdXQubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xuICAgIGNvbnN0IGogPSBNYXRoLmZsb29yKG5leHQoKSAqIChpICsgMSkpO1xuICAgIGNvbnN0IGEgPSBvdXRbaV0hO1xuICAgIG91dFtpXSA9IG91dFtqXSE7XG4gICAgb3V0W2pdID0gYTtcbiAgfVxuICBpZiAob3V0Lmxlbmd0aCA+IDEgJiYgb3V0LmV2ZXJ5KCh2YWx1ZSwgaSkgPT4gdmFsdWUgPT09IGl0ZW1zW2ldKSkge1xuICAgIG91dC5wdXNoKG91dC5zaGlmdCgpIGFzIFQpO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQXBwbHkgZXZlcnkgcmVnaXN0cnktZGVjbGFyZWQgYHNlcnZlU2h1ZmZsZWRgIHJlb3JkZXIgdG8gYSBTQU5JVElaRURcbiAqIGRvY3VtZW50IChwdXJlIFx1MjAxNCB0aGUgaW5wdXQsIHR5cGljYWxseSB0aGUgc2hhcmVkIGNhY2hlZCBhcnRpZmFjdCwgaXMgbm90XG4gKiBtdXRhdGVkKS4gYHNlZWRLZXlgIGlzIHRoZSBwZXItKHZlcnNpb24sIHN0dWRlbnQpIGlkZW50aXR5OyBlYWNoIHNodWZmbGVkXG4gKiBhcnJheSBpcyBzdWItc2VlZGVkIHdpdGggdGhlIGJsb2NrIGlkIGFuZCBmaWVsZCBuYW1lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlTZXJ2ZVNodWZmbGVzKFxuICBkb2M6IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQsXG4gIHNlZWRLZXk6IHN0cmluZyxcbik6IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQge1xuICBjb25zdCBjbG9uZSA9IHN0cnVjdHVyZWRDbG9uZShkb2MpIGFzIHVua25vd24gYXMge1xuICAgIHNlY3Rpb25zOiBBcnJheTx7XG4gICAgICByb3dzOiBBcnJheTx7IGNvbHVtbnM6IEFycmF5PHsgYmxvY2tzOiB1bmtub3duW10gfT4gfT47XG4gICAgfT47XG4gIH07XG5cbiAgY29uc3Qgc2h1ZmZsZUJsb2NrID0gKGJsb2NrOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHR5cGUgPSBibG9jay50eXBlO1xuICAgIGNvbnN0IGVudHJ5ID1cbiAgICAgIHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyAmJiB0eXBlIGluIGJsb2NrUmVnaXN0cnlcbiAgICAgICAgPyBibG9ja1JlZ2lzdHJ5W3R5cGUgYXMga2V5b2YgdHlwZW9mIGJsb2NrUmVnaXN0cnldXG4gICAgICAgIDogdW5kZWZpbmVkO1xuICAgIGlmICghZW50cnkpIHJldHVybjsgLy8gc2FuaXRpemUgYWxyZWFkeSBmYWlsZWQgY2xvc2VkIG9uIHVua25vd24gdHlwZXNcbiAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGVudHJ5LnNhbml0aXplLnNlcnZlU2h1ZmZsZWQgPz8gW10pIHtcbiAgICAgIGNvbnN0IGFyciA9IGJsb2NrW2ZpZWxkXTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgICAgYmxvY2tbZmllbGRdID0gc2VlZGVkU2h1ZmZsZShcbiAgICAgICAgICBhcnIsXG4gICAgICAgICAgYCR7c2VlZEtleX06JHtTdHJpbmcoYmxvY2suaWQgPz8gJycpfToke2ZpZWxkfWAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFJlY3Vyc2Ugd2hlcmUgdGhlIHJlZ2lzdHJ5IGRlY2xhcmVzIG5lc3RlZCBibG9ja3MsIG1pcnJvcmluZyBzYW5pdGl6ZS5cbiAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGVudHJ5LnNhbml0aXplLmNoaWxkQmxvY2tzID8/IFtdKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IGJsb2NrW2ZpZWxkXTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgICAgICAgaWYgKGNoaWxkICE9PSBudWxsICYmIHR5cGVvZiBjaGlsZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHNodWZmbGVCbG9jayhjaGlsZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBjbG9uZS5zZWN0aW9ucykge1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHNlY3Rpb24ucm93cykge1xuICAgICAgZm9yIChjb25zdCBjb2x1bW4gb2Ygcm93LmNvbHVtbnMpIHtcbiAgICAgICAgZm9yIChjb25zdCBibG9jayBvZiBjb2x1bW4uYmxvY2tzKSB7XG4gICAgICAgICAgaWYgKGJsb2NrICE9PSBudWxsICYmIHR5cGVvZiBibG9jayA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHNodWZmbGVCbG9jayhibG9jayBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjbG9uZSBhcyB1bmtub3duIGFzIFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQ7XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGNvbnRhaW5lci9ibG9ja0luZGV4LnRzIFx1MjAxNCBzZXJ2ZWQgZG9jdW1lbnQgXHUyMTkyIHBlci1zZWN0aW9uIHJlc3BvbnNlIGlkcyAoUzMgVjQpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHN0b3JlIGlzIGRlbGliZXJhdGVseSBkb2N1bWVudC1zaGFwZS1hZ25vc3RpYyAoc3RvcmUudHMpOiBpdCBob2xkc1xuLy8gaWQta2V5ZWQgcmVzcG9uc2UgbWFwcyBhbmQgaXMgVE9MRCB3aGljaCBpZHMgYmVsb25nIHRvIGEgc2VjdGlvbiBhdCBjaGVja1xuLy8gdGltZS4gVGhpcyBtb2R1bGUgaXMgd2hhdCB0ZWxscyBpdCBcdTIwMTQgb25lIHdhbGsgb3ZlciB0aGUgU0VSVkVEIChzYW5pdGl6ZWQpXG4vLyBkb2N1bWVudCBwcm9kdWNpbmcsIHBlciBzZWN0aW9uLCB0aGUgaXRlbSBpZHMgaW4gZWFjaCB3aXJlIGNhdGVnb3J5LlxuLy9cbi8vIFR3byBkZXNpZ24gcG9pbnRzIHdvcnRoIGtlZXBpbmc6XG4vL1xuLy8gIDEuIElOLUJBTkQgSURTIENPTUUgRlJPTSBBIERFRVAgV0FMSywgbm90IGEgcGVyLXR5cGUgZmllbGQgbGlzdC4gQSBibGFua1xuLy8gICAgIHRva2VuIGxpdmVzIGluIGZpbGxfaW5fYmxhbmsuY29udGVudCwgYnV0IGFsc28gaW5zaWRlIGFcbi8vICAgICBmYWRlZF93b3JrZWRfZXhhbXBsZSdzIG5lc3RlZCBzdGVwczsgYSBwcm9tcHRlZCBtYXRoX2lubGluZSBtYXkgYXBwZWFyIGluXG4vLyAgICAgQU5ZIGNvbnRlbnQgYXJyYXkgKHRoZSBzY2hlbWEgYWRtaXRzIGl0LCB3aGljaCBpcyBleGFjdGx5IHdoeSB0aGUgUzJcbi8vICAgICBzYW5pdGl6ZXIgc3RyaXBzIGluLWJhbmQgc2VjcmV0cyB1bmNvbmRpdGlvbmFsbHkgcmF0aGVyIHRoYW4gYnlcbi8vICAgICBkZWNsYXJhdGlvbikuIE1pcnJvcmluZyB0aGF0IHBvc3R1cmUgaGVyZSBtZWFucyBhIG5ldyBibG9jayB0eXBlIHRoYXRcbi8vICAgICBlbWJlZHMgYmxhbmtzIGlzIHdpcmVkIGludG8gY2hlY2tpbmcgdGhlIGRheSBpdCByZW5kZXJzLCB3aXRoIG5vIHJlZ2lzdHJ5XG4vLyAgICAgZWRpdCBcdTIwMTQgdGhlIGZhaWx1cmUgbW9kZSB0aGlzIGF2b2lkcyBpcyBhIHN0dWRlbnQncyBhbnN3ZXIgc2lsZW50bHkgbmV2ZXJcbi8vICAgICByZWFjaGluZyB0aGUgZ3JhZGVyLlxuLy9cbi8vICAyLiBVTlNVUFBPUlRFRCBJUyBSRUNPUkRFRCwgTkVWRVIgRFJPUFBFRC4gV2lyZSB2MiAoVjkpIGdhdmUgdGhlIGdyYXBoXG4vLyAgICAgZmFtaWx5IGl0cyBgZ3JhcGhzYCBjYXRlZ29yeSwgc28gYHVuc3VwcG9ydGVkYCBpcyBlbXB0eSB0b2RheSBcdTIwMTQgYnV0IHRoZVxuLy8gICAgIG1lY2hhbmlzbSBzdGF5cy4gSXQgaXMgdGhlIGhvbmVzdCBhbnN3ZXIgd2hlbmV2ZXIgYSBncmFkYWJsZSBibG9jayBoYXNcbi8vICAgICBubyB3YXkgdG8gcmVhY2ggdGhlIGdyYWRlciAoYSBmdXR1cmUgYmxvY2sgdHlwZSBhaGVhZCBvZiBpdHMgd2lyZVxuLy8gICAgIGJ1bXApLiBBIHNpbGVudCBvbWlzc2lvbiB3b3VsZCByZWFkIGFzIFwiYWxsIGNoZWNrZWRcIiB3aGlsZSBhIHN0dWRlbnQnc1xuLy8gICAgIHdvcmsgd2VudCB1bmdyYWRlZCwgd2hpY2ggaXMgdGhlIGZhaWx1cmUgdGhpcyBleGlzdHMgdG8gcHJldmVudC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IGZhbWlseU9mIH0gZnJvbSAnLi4vcmVnaXN0cnkvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHR5cGUgeyBCbG9ja1R5cGUgfSBmcm9tICcuLi9yZWdpc3RyeS90eXBlcy5qcyc7XG5pbXBvcnQgdHlwZSB7XG4gIFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQsXG4gIFNhbml0aXplZEJsb2NrLFxufSBmcm9tICcuLi9zYW5pdGl6ZS9zYW5pdGl6ZWQtdHlwZXMuanMnO1xuaW1wb3J0IHR5cGUgeyBTZWN0aW9uSXRlbUlkcyB9IGZyb20gJy4uL3N0b3JlL3N0b3JlLmpzJztcblxuLyoqIEJsb2NrIHR5cGVzIHdob3NlIHJlc3BvbnNlcyBoYXZlIG5vIHdpcmUtdjEgY2F0ZWdvcnkgKHNlZSBkZXNpZ24gcG9pbnQgMikuICovXG5jb25zdCBHUkFQSF9GQU1JTFk6IFJlYWRvbmx5U2V0PHN0cmluZz4gPSBuZXcgU2V0KFtcbiAgJ2ludGVyYWN0aXZlX2dyYXBoJyxcbiAgJ251bWJlcl9saW5lJyxcbiAgJ2RhdGFfcGxvdCcsXG5dKTtcblxuZXhwb3J0IGludGVyZmFjZSBTZWN0aW9uSW5kZXgge1xuICBzZWN0aW9uSWQ6IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSBhdXRob3JlZCBge2NoZWNrcG9pbnR9YCBtYXJrZXIsIGNhcnJpZWQgdGhyb3VnaCBmcm9tIHRoZSBzZXJ2ZWRcbiAgICogc2VjdGlvbiBzbyB0aGUgY2hlY2stZ3JvdXAgZm9sZCAoY2hlY2tHcm91cHMudHMpIG5ldmVyIG5lZWRzIGEgc2Vjb25kIHdhbGtcbiAgICogb2YgdGhlIGRvY3VtZW50IHRvIGFuc3dlciBcImRvZXMgY2hlY2tpbmcgc3RvcCBoZXJlP1wiICg1QSkuXG4gICAqL1xuICBpc0NoZWNrcG9pbnQ6IGJvb2xlYW47XG4gIC8qKiBJZHMgdG8gc2VuZCB3aGVuIGNoZWNraW5nIHRoaXMgc2VjdGlvbi4gKi9cbiAgaXRlbXM6IFNlY3Rpb25JdGVtSWRzO1xuICAvKiogQmxvY2sgaWRzIHByZXNlbnQgaW4gdGhpcyBzZWN0aW9uLCBkb2N1bWVudCBvcmRlciAoY29udGFpbmVycyBpbmNsdWRlZCkuICovXG4gIGJsb2NrSWRzOiBzdHJpbmdbXTtcbiAgLyoqIEdyYWRhYmxlIGJsb2NrIGlkcyB0aGlzIHdpcmUgdmVyc2lvbiBjYW5ub3QgY2FycnkgXHUyMDE0IHN1cmZhY2VkLCBub3QgaGlkZGVuLiAqL1xuICB1bnN1cHBvcnRlZDogc3RyaW5nW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRG9jdW1lbnRJbmRleCB7XG4gIHNlY3Rpb25zOiBTZWN0aW9uSW5kZXhbXTtcbiAgYnlTZWN0aW9uOiBSZWNvcmQ8c3RyaW5nLCBTZWN0aW9uSW5kZXg+O1xuICAvKiogRXZlcnkgZ3JhZGFibGUtYnV0LXVuY2FycnlhYmxlIGJsb2NrIGlkIGFjcm9zcyB0aGUgZG9jdW1lbnQuICovXG4gIHVuc3VwcG9ydGVkOiBzdHJpbmdbXTtcbn1cblxuLyoqIERlZXAtd2FsayBhbnkgdmFsdWUgZm9yIGluLWJhbmQgcmVzcG9uc2UgaWRzOiBibGFuayB0b2tlbnMgYW5kIG1hdGgtZ2FwXG4gKiBwcm9tcHRzLCB3aGVyZXZlciB0aGV5IHNpdC4gRG9lcyBOT1QgZGVzY2VuZCBpbnRvIG5lc3RlZCBCbG9jayBhcnJheXMgXHUyMDE0XG4gKiBjaGlsZCBibG9ja3MgYXJlIHZpc2l0ZWQgYnkgdGhlIGNhbGxlciBzbyB0aGVpciBvd24gaWRzIGF0dHJpYnV0ZSB0byB0aGVtLiAqL1xuZnVuY3Rpb24gY29sbGVjdEluQmFuZElkcyhcbiAgdmFsdWU6IHVua25vd24sXG4gIG91dDogc3RyaW5nW10sXG4gIGlzQ2hpbGRCbG9ja0FycmF5OiAodmFsdWU6IHVua25vd24pID0+IGJvb2xlYW4sXG4pOiB2b2lkIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgaWYgKGlzQ2hpbGRCbG9ja0FycmF5KHZhbHVlKSkgcmV0dXJuO1xuICAgIGZvciAoY29uc3QgaXRlbSBvZiB2YWx1ZSkgY29sbGVjdEluQmFuZElkcyhpdGVtLCBvdXQsIGlzQ2hpbGRCbG9ja0FycmF5KTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcgfHwgdmFsdWUgPT09IG51bGwpIHJldHVybjtcblxuICBjb25zdCBub2RlID0gdmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGlmIChub2RlLnR5cGUgPT09ICdibGFuaycgJiYgdHlwZW9mIG5vZGUuaWQgPT09ICdzdHJpbmcnKSB7XG4gICAgb3V0LnB1c2gobm9kZS5pZCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIEEgTWF0aFByb21wdCBjYXJyaWVyOiBgbGF0ZXhgICsgYHByb21wdHNgLiBNYXRjaGVkIFNUUlVDVFVSQUxMWSByYXRoZXJcbiAgLy8gdGhhbiBieSBub2RlIHR5cGUgYmVjYXVzZSB0aGUgc2FtZSBjYXJyaWVyIHNoYXBlIGlzIGJvdGggYW4gaW5saW5lXG4gIC8vIG1hdGhfaW5saW5lIG5vZGUgYW5kIGEgdG9wLWxldmVsIG1hdGhfYmxvY2sgXHUyMDE0IGFuZCB0aGUgc2NoZW1hIGFkbWl0cyBpdCBpblxuICAvLyBlaXRoZXIgcG9zaXRpb24gKHRoZSByZWFzb24gdGhlIFMyIHNhbml0aXplciB3YWxrcyB1bmNvbmRpdGlvbmFsbHkgdG9vKS5cbiAgaWYgKHR5cGVvZiBub2RlLmxhdGV4ID09PSAnc3RyaW5nJyAmJiBBcnJheS5pc0FycmF5KG5vZGUucHJvbXB0cykpIHtcbiAgICBmb3IgKGNvbnN0IHByb21wdCBvZiBub2RlLnByb21wdHMpIHtcbiAgICAgIGNvbnN0IGlkID0gKHByb21wdCBhcyB7IGlkPzogdW5rbm93biB9IHwgbnVsbCk/LmlkO1xuICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpIG91dC5wdXNoKGlkKTtcbiAgICB9XG4gICAgLy8gS2VlcCB3YWxraW5nIHNpYmxpbmdzOiBhIG1hdGhfYmxvY2sgYWxzbyBjYXJyaWVzIGNvbnRlbnQgZmllbGRzLlxuICB9XG4gIGZvciAoY29uc3QgY2hpbGQgb2YgT2JqZWN0LnZhbHVlcyhub2RlKSkge1xuICAgIGNvbGxlY3RJbkJhbmRJZHMoY2hpbGQsIG91dCwgaXNDaGlsZEJsb2NrQXJyYXkpO1xuICB9XG59XG5cbi8qKiBBIHZhbHVlIGlzIGEgY2hpbGQtYmxvY2sgYXJyYXkgaWYgaXQgbG9va3MgbGlrZSBCbG9ja1tdIChvYmplY3RzIGNhcnJ5aW5nIGFcbiAqIGB0eXBlYCB0aGUgcmVnaXN0cnkga25vd3MgQU5EIGFuIGBpZGApLiBTdHJ1Y3R1cmFsIHJhdGhlciB0aGFuXG4gKiByZWdpc3RyeS1kZWNsYXJlZCBzbyBhIGNvbnRhaW5lciB0aGF0IGZvcmdldHMgaXRzIGNoaWxkQmxvY2tzIGRlY2xhcmF0aW9uXG4gKiBzdGlsbCBjYW4ndCBnZXQgaXRzIGNoaWxkcmVuJ3MgaWRzIG1pcy1hdHRyaWJ1dGVkLlxuICpcbiAqIEV4cG9ydGVkIGJlY2F1c2UgdGhlIGFuc3dlci1rZXkgZXh0cmFjdGlvbiwgdGhlIGNlbnN1cywgQU5EIHRoZSBncmFkaW5nXG4gKiB3YWxrIChzaW5jZSBBMjQsIDIwMjYtMDgtMDYgXHUyMDE0IGl0IGNhcnJpZWQgYSBwcml2YXRlIGNvcHkgZm9yIGEgc2xpY2VcbiAqIGdlbmVyYXRpb24pIGFsbCBhbnN3ZXIgdGhlIHNhbWUgcXVlc3Rpb24gKFwiaXMgdGhpcyBhIG5lc3RlZCBibG9jaywgb3JcbiAqIGNvbnRlbnQgb2YgdGhpcyBvbmU/XCIpLiBUd28gY29waWVzIG9mIGEgc3VidGxlIGhldXJpc3RpYyBkcmlmdDsgdGhpcyBvbmVcbiAqIGlzIFRIRSBzb3VyY2UsIHdpdGggemVybyBjb3BpZXMgcmVtYWluaW5nLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvb2tzTGlrZUJsb2NrQXJyYXkodmFsdWU6IHVua25vd24pOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBBcnJheS5pc0FycmF5KHZhbHVlKSAmJlxuICAgIHZhbHVlLmxlbmd0aCA+IDAgJiZcbiAgICB2YWx1ZS5ldmVyeShcbiAgICAgIChpdGVtKSA9PlxuICAgICAgICB0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgaXRlbSAhPT0gbnVsbCAmJlxuICAgICAgICB0eXBlb2YgKGl0ZW0gYXMgeyBpZD86IHVua25vd24gfSkuaWQgPT09ICdzdHJpbmcnICYmXG4gICAgICAgIHR5cGVvZiAoaXRlbSBhcyB7IHR5cGU/OiB1bmtub3duIH0pLnR5cGUgPT09ICdzdHJpbmcnLFxuICAgICkgJiZcbiAgICAvLyBJbmxpbmUgbm9kZXMgY2FycnkgYHR5cGVgIGJ1dCBuZXZlciBgaWRgICsgYmxvY2staXNoIHNoYXBlIHRvZ2V0aGVyO1xuICAgIC8vIHJlcXVpcmUgYXQgbGVhc3Qgb25lIGtub3duIGNvbnRhaW5lci1pc2gga2V5IHRvIGF2b2lkIGZhbHNlIHBvc2l0aXZlcy5cbiAgICB2YWx1ZS5ldmVyeSgoaXRlbSkgPT4ge1xuICAgICAgY29uc3QgdCA9IChpdGVtIGFzIHsgdHlwZTogc3RyaW5nIH0pLnR5cGU7XG4gICAgICByZXR1cm4gdCAhPT0gJ3RleHQnICYmIHQgIT09ICdibGFuaycgJiYgdCAhPT0gJ21hdGhfaW5saW5lJyAmJiB0ICE9PSAnaGFyZF9icmVhayc7XG4gICAgfSlcbiAgKTtcbn1cblxuLyoqIE5lc3RlZCBibG9ja3MsIGZvdW5kIHN0cnVjdHVyYWxseSAoc2VlIGxvb2tzTGlrZUJsb2NrQXJyYXkpLiBHZW5lcmljIG92ZXIgdGhlXG4gKiBibG9jayBzaGFwZSBzbyB0aGUgc2VydmVkLWRvY3VtZW50IHdhbGsgaGVyZSBhbmQgdGhlIGF1dGhvcmVkLWRvY3VtZW50IHdhbGsgaW5cbiAqIHRoZSBhbnN3ZXIta2V5IGV4dHJhY3Rpb24gc2hhcmUgT05FIGRlZmluaXRpb24gb2YgXCJjaGlsZCBibG9ja1wiLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoaWxkQmxvY2tzT2Y8VCBleHRlbmRzIG9iamVjdD4oYmxvY2s6IFQpOiBUW10ge1xuICBjb25zdCBvdXQ6IFRbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHZhbHVlIG9mIE9iamVjdC52YWx1ZXMoYmxvY2sgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pKSB7XG4gICAgaWYgKGxvb2tzTGlrZUJsb2NrQXJyYXkodmFsdWUpKSBvdXQucHVzaCguLi4odmFsdWUgYXMgVFtdKSk7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gdmlzaXQoYmxvY2s6IFNhbml0aXplZEJsb2NrLCBpbmRleDogU2VjdGlvbkluZGV4KTogdm9pZCB7XG4gIGNvbnN0IHR5cGUgPSAoYmxvY2sgYXMgeyB0eXBlOiBzdHJpbmcgfSkudHlwZSBhcyBCbG9ja1R5cGU7XG4gIGNvbnN0IGlkID0gKGJsb2NrIGFzIHsgaWQ6IHN0cmluZyB9KS5pZDtcbiAgaW5kZXguYmxvY2tJZHMucHVzaChpZCk7XG5cbiAgLy8gSW4tYmFuZCBpZHMgKGJsYW5rcyArIG1hdGggZ2FwcykgYmVsb25nIHRvIFRISVMgYmxvY2ssIGF0IGFueSBkZXB0aFxuICAvLyBzaG9ydCBvZiBhIG5lc3RlZCBibG9jay5cbiAgY29uc3QgaW5CYW5kOiBzdHJpbmdbXSA9IFtdO1xuICBjb2xsZWN0SW5CYW5kSWRzKGJsb2NrLCBpbkJhbmQsIGxvb2tzTGlrZUJsb2NrQXJyYXkpO1xuICBpZiAoaW5CYW5kLmxlbmd0aCA+IDApIHtcbiAgICBpbmRleC5pdGVtcy5ibGFua3MgPSBbLi4uKGluZGV4Lml0ZW1zLmJsYW5rcyA/PyBbXSksIC4uLmluQmFuZF07XG4gIH1cblxuICAvLyBQZXItYmxvY2staWQgY2F0ZWdvcmllcy4gZmFtaWx5T2YgcmVzb2x2ZXMgZGlzcGxheS1tb2RlIGluc3RhbmNlcyB0b1xuICAvLyAnc3RhdGljJywgc28gYSBkaXNwbGF5IGdyYXBoIGNvbnRyaWJ1dGVzIG5vdGhpbmcgXHUyMDE0IGNvcnJlY3QsIGl0IHRha2VzIG5vXG4gIC8vIGlucHV0LlxuICBjb25zdCBmYW1pbHkgPSBmYW1pbHlPZihibG9jayBhcyBuZXZlcik7XG4gIGlmIChmYW1pbHkgIT09ICdzdGF0aWMnKSB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdtdWx0aXBsZV9jaG9pY2UnOlxuICAgICAgICBpbmRleC5pdGVtcy5jaG9pY2VzID0gWy4uLihpbmRleC5pdGVtcy5jaG9pY2VzID8/IFtdKSwgaWRdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ21hdGNoaW5nJzpcbiAgICAgICAgaW5kZXguaXRlbXMubWF0Y2hlcyA9IFsuLi4oaW5kZXguaXRlbXMubWF0Y2hlcyA/PyBbXSksIGlkXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdvcmRlcmluZyc6XG4gICAgICAgIGluZGV4Lml0ZW1zLm9yZGVyaW5ncyA9IFsuLi4oaW5kZXguaXRlbXMub3JkZXJpbmdzID8/IFtdKSwgaWRdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NlbGZfZXhwbGFuYXRpb24nOlxuICAgICAgY2FzZSAnc2hvcnRfYW5zd2VyJzpcbiAgICAgIGNhc2UgJ2Vzc2F5JzpcbiAgICAgICAgaW5kZXguaXRlbXMuZnJlZVRleHQgPSBbLi4uKGluZGV4Lml0ZW1zLmZyZWVUZXh0ID8/IFtdKSwgaWRdO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIFdpcmUgdjIgY2FycmllcyBnZW9tZXRyaWMgd29yayBmb3IgdGhlIHdob2xlIGdyYXBoIGZhbWlseTsgdGhlXG4gICAgICAgIC8vIHNlcnZlciBkaXNwYXRjaGVzIG9uIHRoZSBzZXJ2ZWQgaW50ZXJhY3Rpb24gdHlwZS5cbiAgICAgICAgaWYgKEdSQVBIX0ZBTUlMWS5oYXModHlwZSkpIHtcbiAgICAgICAgICBpbmRleC5pdGVtcy5ncmFwaHMgPSBbLi4uKGluZGV4Lml0ZW1zLmdyYXBocyA/PyBbXSksIGlkXTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkQmxvY2tzT2YoYmxvY2spKSB2aXNpdChjaGlsZCwgaW5kZXgpO1xufVxuXG4vKiogSW5kZXggYSBzZXJ2ZWQgZG9jdW1lbnQ6IHBlci1zZWN0aW9uIGNoZWNrIHBheWxvYWQgaWRzICsgdGhlIHVuc3VwcG9ydGVkXG4gKiByb3N0ZXIuIFB1cmU7IHNhZmUgdG8gcmVjb21wdXRlIG9uIGV2ZXJ5IHJlbmRlciAodGhlIGRvY3VtZW50IGlzIGltbXV0YWJsZVxuICogcGVyIHZlcnNpb24pLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluZGV4RG9jdW1lbnQoZG9jOiBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50KTogRG9jdW1lbnRJbmRleCB7XG4gIGNvbnN0IHNlY3Rpb25zOiBTZWN0aW9uSW5kZXhbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHNlY3Rpb24gb2YgZG9jLnNlY3Rpb25zKSB7XG4gICAgY29uc3QgaW5kZXg6IFNlY3Rpb25JbmRleCA9IHtcbiAgICAgIHNlY3Rpb25JZDogc2VjdGlvbi5pZCxcbiAgICAgIGlzQ2hlY2twb2ludDogc2VjdGlvbi5pc0NoZWNrcG9pbnQgPT09IHRydWUsXG4gICAgICBpdGVtczoge30sXG4gICAgICBibG9ja0lkczogW10sXG4gICAgICB1bnN1cHBvcnRlZDogW10sXG4gICAgfTtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiBzZWN0aW9uLnJvd3MpIHtcbiAgICAgIGZvciAoY29uc3QgY29sdW1uIG9mIHJvdy5jb2x1bW5zKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgY29sdW1uLmJsb2NrcykgdmlzaXQoYmxvY2ssIGluZGV4KTtcbiAgICAgIH1cbiAgICB9XG4gICAgc2VjdGlvbnMucHVzaChpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBzZWN0aW9ucyxcbiAgICBieVNlY3Rpb246IE9iamVjdC5mcm9tRW50cmllcyhzZWN0aW9ucy5tYXAoKHMpID0+IFtzLnNlY3Rpb25JZCwgc10pKSxcbiAgICB1bnN1cHBvcnRlZDogc2VjdGlvbnMuZmxhdE1hcCgocykgPT4gcy51bnN1cHBvcnRlZCksXG4gIH07XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGdyYWRpbmcvd2Fsay50cyBcdTIwMTQgcmF3IGRvY3VtZW50IFx1MjE5MiB0aGUgZ3JhZGFibGUgaW52ZW50b3J5IG9mIG9uZSBzZWN0aW9uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHNlcnZlcidzIGNvdW50ZXJwYXJ0IHRvIHRoZSB2aWV3ZXIncyBjb250YWluZXIvYmxvY2tJbmRleC50cy4gU2FtZSB3YWxrLFxuLy8gb3Bwb3NpdGUgc2lkZSBvZiB0aGUgd2lyZTogYmxvY2tJbmRleCB0ZWxscyB0aGUgQ0xJRU5UIHdoaWNoIGlkcyB0byBzZW5kLFxuLy8gdGhpcyB0ZWxscyB0aGUgU0VSVkVSIHdoYXQgZWFjaCBvZiB0aG9zZSBpZHMgaXMgd29ydGguIFRoZXkgbXVzdCBhZ3JlZSwgYW5kXG4vLyB0aGUgZ29sZGVuIGNvcnB1cyBwbHVzIHRoZSBjb25mb3JtYW5jZSBzdWl0ZSBhcmUgd2hhdCBob2xkIHRoZW0gdG9nZXRoZXIuXG4vL1xuLy8gVHdvIHByb3BlcnRpZXMgaW5oZXJpdGVkIGRlbGliZXJhdGVseSBmcm9tIGJsb2NrSW5kZXg6XG4vL1xuLy8gIDEuIElOLUJBTkQgSURTIENPTUUgRlJPTSBBIERFRVAgV0FMSywgbm90IGEgcGVyLXR5cGUgZmllbGQgbGlzdC4gQSBibGFua1xuLy8gICAgIGxpdmVzIGluIGZpbGxfaW5fYmxhbmsuY29udGVudCwgYnV0IGFsc28gaW5zaWRlIGEgZmFkZWRfd29ya2VkX2V4YW1wbGUnc1xuLy8gICAgIG5lc3RlZCBzdGVwcywgYW5kIGEgcHJvbXB0ZWQgbWF0aF9pbmxpbmUgbWF5IGFwcGVhciBpbiBBTlkgY29udGVudCBhcnJheS5cbi8vICAgICBXYWxraW5nIHVuY29uZGl0aW9uYWxseSBtZWFucyBhIG5ldyBibG9jayB0eXBlIHRoYXQgZW1iZWRzIGJsYW5rcyBpc1xuLy8gICAgIGdyYWRhYmxlIHRoZSBkYXkgaXQgcmVuZGVycywgd2l0aCBubyByZWdpc3RyeSBlZGl0LiBUaGUgZmFpbHVyZSB0aGlzXG4vLyAgICAgYXZvaWRzIGlzIHRoZSB3b3JzdCBraW5kOiBhIHN0dWRlbnQgYW5zd2VyIHRoYXQgaXMgc3VibWl0dGVkLCBzdG9yZWQsIGFuZFxuLy8gICAgIG5ldmVyIHNjb3JlZC5cbi8vXG4vLyAgMi4gQ09OVEFJTkVSUyBBVFRSSUJVVEUgVE8gVEhFIENISUxELiBBIGJsYW5rIGluc2lkZSBhIGZhZGVkIGV4YW1wbGUgYmVsb25nc1xuLy8gICAgIHRvIHRoYXQgZXhhbXBsZSdzIHN0ZXAsIG5vdCB0byB0aGUgY29udGFpbmVyLCBzbyBpZHMgbGluZSB1cCB3aXRoIHdoYXRcbi8vICAgICB0aGUgY2xpZW50IHNlbnQuXG4vL1xuLy8gVGhpcyB3YWxrIHJlYWRzIHRoZSBSQVcgZG9jdW1lbnQuIFRoYXQgaXMgd2hhdCBtYWtlcyBgb3JkZXJpbmdgIGdyYWRhYmxlIGF0XG4vLyBhbGwgKGl0cyBhdXRob3JlZCBpdGVtIG9yZGVyIElTIHRoZSBrZXkpIGFuZCB3aGF0IGdpdmVzIHRoZSBncmFkZXIgdGhlIGFuc3dlclxuLy8ga2V5cywgaGludHMsIGFuZCBzb2x1dGlvbnMgdGhlIHNlcnZlZCBkb2N1bWVudCBoYWQgc3RyaXBwZWQuXG4vL1xuLy8gTUFMRk9STUVELURPQ1VNRU5UIFBPU1RVUkUgKHJ1bGVkIEI4L0QxMCwgMjAyNi0wOC0wNjsgbGFuZGVkIHJlZC1ncmVlbik6XG4vLyB0aGUgd2FsayBjYXJyaWVzIGFuIElOVEVHUklUWSBHQVRFLiBUaGUgcnVsZSB0aGF0IGRlY2lkZXMgZXZlcnkgY2hlY2sgYmVsb3c6XG4vLyBhIGdyYWRlci1yZWFkIGZpZWxkIHRoYXQgaXMgUFJFU0VOVCB3aXRoIGEgc2hhcGUgdGhlIHNjaGVtYSBjYW5ub3QgYXV0aG9yIGlzXG4vLyBzdHJ1Y3R1cmFsbHkgYnJva2VuIFx1MjE5MiBNYWxmb3JtZWREb2N1bWVudEVycm9yICh0aGUgaGFuZGxlciBtYXBzIGl0IHRvIHRoZVxuLy8gd2lyZSBjb2RlIGBtYWxmb3JtZWRfZG9jdW1lbnRgLCB0aGUgY2xpZW50IHRvIGl0cyBvd24gbm9uLXJldHJ5YWJsZSBjb3B5KS5cbi8vIEEgZmllbGQgdGhhdCBpcyBBQlNFTlQsIG9yIGF1dGhvcmVkIGVtcHR5LCBncmFkZXMgZXhhY3RseSBhcyBpdCBhbHdheXMgaGFzIFx1MjAxNFxuLy8gYXV0aG9yZWQtZW1wdHkgaXMgYSB0ZWFjaGVyIG1pZC1lZGl0LCBub3QgY29ycnVwdGlvbiwgYW5kIHJlZnVzaW5nIGl0IHdvdWxkXG4vLyBicmVhayBsZWdpdGltYXRlIGRvY3VtZW50cy4gQmVmb3JlIHRoZSBnYXRlLCBldmVyeSBmaWVsZCB3YXMgc2lsZW50bHlcbi8vIG5hcnJvd2VkLCBzbyBhIGJyb2tlbiBibG9jayBwcm9kdWNlZCBhIE1BUksgKGdyYWRlZCBhZ2FpbnN0IGEgY29lcmNlZC1lbXB0eVxuLy8ga2V5KSBcdTIwMTQgYSBjb25maWRlbnQgd3JvbmcgdmVyZGljdCBub2JvZHkgY291bGQgc2VlIChzNC1hdWRpdCBtaXNzZWQtOSk7XG4vLyBzZXJ2ZXItYXV0aG9yaXRhdGl2ZSBncmFkaW5nIG1ha2VzIHRoYXQgd29yc2UgdGhhbiBhIHR5cGVkIGZhaWx1cmUuXG4vL1xuLy8gVHdvIGRlbGliZXJhdGUgc2NvcGUgZWRnZXM6XG4vLyAgICogVGhlIGdyYXBoIGZhbWlseSBpcyBOT1QgZ2F0ZWQgaGVyZS4gc2NvcmVHcmFwaEJsb2NrIGRpc3BhdGNoZXMgb24gdGhlXG4vLyAgICAgc2VydmVkIGludGVyYWN0aW9uIGFuZCBSRUZVU0VTIHdvcmsgdGhhdCBkaXNhZ3JlZXMgKG51bGwgXHUyMTkyIG5vIG1hcmspIFx1MjAxNFxuLy8gICAgIGl0IGFscmVhZHkgZmFpbHMgc2FmZSByYXRoZXIgdGhhbiBjb2VyY2luZywgd2hpY2ggaXMgdGhlIHByb3BlcnR5IHRoZVxuLy8gICAgIGdhdGUgZXhpc3RzIHRvIGFkZCBlbHNld2hlcmUuXG4vLyAgICogT24gdG9kYXkncyBoYW5kbGVyIHBhdGggdGhlIHVwZ3JhZGUgc3RlcCdzIFpvZCB2YWxpZGF0aW9uIG1lYW5zIG5vXG4vLyAgICAgU1RPUkFCTEUgZG9jdW1lbnQgcmVhY2hlcyB0aGlzIHdhbGsgYnJva2VuIFx1MjAxNCB0aGUgZ2F0ZSBpcyB0aGUgZW5naW5lJ3Ncbi8vICAgICBvd24gY29udHJhY3QgKGRlZmVuc2UgaW4gZGVwdGggYmVoaW5kIHRoZSBoYW5kbGVyJ3MgYGFzIG5ldmVyYCBjYXN0KSxcbi8vICAgICBzbyBzYWZldHkgc3RvcHMgZGVwZW5kaW5nIG9uIGV2ZXJ5IGNhbGxlciB2YWxpZGF0aW5nIGZpcnN0LiBTNydzIHJlYWxcbi8vICAgICBtYWxmb3JtZWQgY2FzZSAoc2NoZW1hVmVyc2lvbi0xIGRvY3VtZW50cykgaXMgcmVmdXNlZCB1cHN0cmVhbSBieSB0aGVcbi8vICAgICB1cGdyYWRlIHBhdGggaXRzZWxmLlxuLy9cbi8vIFRoZSBjZW5zdXMgKHJlYWQgcGF0aCkgb3B0cyBPVVQgdmlhIGB7IGludGVncml0eTogJ2NvZXJjZScgfWAgXHUyMDE0IGEgY2Vuc3VzZWRcbi8vIG1hbGZvcm1lZCBkb2N1bWVudCBtZXJlbHkgbWlzY291bnRzLCBhbmQgdGhlIHJlYWQgcGF0aCdzIHJ1bGVkIHBvc3R1cmUgaXNcbi8vIHdpdGhob2xkLWFuZC1zZXJ2ZSwgbm90IGZhaWwuIEdyYWRpbmcgYWx3YXlzIHJ1bnMgdGhlIGdhdGUuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQge1xuICBjaGlsZEJsb2Nrc09mLFxuICBsb29rc0xpa2VCbG9ja0FycmF5LFxufSBmcm9tICcuLi8uLi9jb250YWluZXIvYmxvY2tJbmRleC5qcyc7XG5pbXBvcnQgeyBQUk9NUFRfQ0FSUklFUl9UWVBFUyB9IGZyb20gJy4uLy4uL3Nhbml0aXplL3Byb21wdENhcnJpZXJzLmpzJztcbmltcG9ydCB0eXBlIHsgQmxhbmtLZXkgfSBmcm9tICcuL2JsYW5rcy5qcyc7XG5pbXBvcnQgdHlwZSB7IFJhd0dyYXBoQmxvY2sgfSBmcm9tICcuL2dyYXBocy5qcyc7XG5cbi8qKiBMb29zZWx5LXR5cGVkIHJhdyBibG9jazogdGhlIHNlcnZlciBkaXNwYXRjaGVzIG9uIGB0eXBlYCBzdHJpbmdzIGFuZCByZWFkc1xuICogZmllbGRzIHRoZSBzYW5pdGl6ZWQgdHlwZXMgZGVsaWJlcmF0ZWx5IGRvbid0IGFkbWl0LiAqL1xuZXhwb3J0IHR5cGUgUmF3QmxvY2sgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiAmIHsgaWQ/OiBzdHJpbmc7IHR5cGU/OiBzdHJpbmcgfTtcblxuLyoqIFN0cnVjdHVyYWxseSBicm9rZW4gZG9jdW1lbnQgKGVuZy1yZXZpZXcgQjgvRDEwKTogYSBncmFkZXItcmVhZCBmaWVsZCB3YXNcbiAqIHByZXNlbnQgd2l0aCBhIHNoYXBlIHRoZSBzY2hlbWEgY2Fubm90IGF1dGhvci4gVGhyb3duIGluc3RlYWQgb2YgZ3JhZGluZyxcbiAqIGJlY2F1c2UgYSBzaWxlbnRseSB3cm9uZyBtYXJrIGlzIHdvcnNlIHRoYW4gYSB0eXBlZCBmYWlsdXJlLiBUaGUgaGFuZGxlclxuICogbWFwcyB0aGlzIHRvIHRoZSB3aXJlIGNvZGUgYG1hbGZvcm1lZF9kb2N1bWVudGAuICovXG5leHBvcnQgY2xhc3MgTWFsZm9ybWVkRG9jdW1lbnRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgcmVhZG9ubHkgcHJvYmxlbXM6IHN0cmluZ1tdO1xuICBjb25zdHJ1Y3Rvcihwcm9ibGVtczogc3RyaW5nW10pIHtcbiAgICBzdXBlcihgU3RydWN0dXJhbGx5IGJyb2tlbiBkb2N1bWVudDogJHtwcm9ibGVtcy5qb2luKCc7ICcpfWApO1xuICAgIHRoaXMubmFtZSA9ICdNYWxmb3JtZWREb2N1bWVudEVycm9yJztcbiAgICB0aGlzLnByb2JsZW1zID0gcHJvYmxlbXM7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBHcmFkYWJsZUludmVudG9yeSB7XG4gIC8qKiBCbGFuayArIG1hdGgtZ2FwIGtleXMsIGluIGRvY3VtZW50IG9yZGVyLCBncm91cGVkIHBlciBvd25pbmcgYmxvY2sgc29cbiAgICogaW50ZXJjaGFuZ2VhYmxlIHJ1bnMgY2FuIGJlIHJlc29sdmVkIHdpdGhpbiB0aGVpciBibG9jay4gKi9cbiAgYmxhbmtHcm91cHNCeUJsb2NrOiBBcnJheTx7IGJsb2NrSWQ6IHN0cmluZzsga2V5czogQmxhbmtLZXlbXSB9PjtcbiAgbXVsdGlwbGVDaG9pY2U6IEFycmF5PHtcbiAgICBibG9ja0lkOiBzdHJpbmc7XG4gICAgY29ycmVjdElkczogc3RyaW5nW107XG4gICAgY2hvaWNlczogQXJyYXk8e1xuICAgICAgaWQ6IHN0cmluZztcbiAgICAgIGNvcnJlY3Q/OiBib29sZWFuO1xuICAgICAgZmVlZGJhY2s/OiB1bmtub3duW107XG4gICAgICBtaXNjb25jZXB0aW9uSWQ/OiBzdHJpbmc7XG4gICAgfT47XG4gIH0+O1xuICBtYXRjaGluZzogQXJyYXk8e1xuICAgIGJsb2NrSWQ6IHN0cmluZztcbiAgICBrZXk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gICAgaXRlbUlkczogc3RyaW5nW107XG4gIH0+O1xuICBvcmRlcmluZzogQXJyYXk8eyBibG9ja0lkOiBzdHJpbmc7IGF1dGhvcmVkT3JkZXI6IHN0cmluZ1tdIH0+O1xuICBncmFwaHM6IEFycmF5PHsgYmxvY2tJZDogc3RyaW5nOyBibG9jazogUmF3R3JhcGhCbG9jayB9PjtcbiAgLyoqIEV2ZXJ5IGZyZWUtdGV4dCBibG9jayBpbiB0aGUgc2VjdGlvbiBcdTIwMTQgcmVjb3JkZWQsIG5ldmVyIGp1ZGdlZC4gKi9cbiAgZnJlZVRleHQ6IHN0cmluZ1tdO1xuICAvKiogYmxvY2tJZCBcdTIxOTIgYXV0aG9yZWQgc29sdXRpb24gY29udGVudCwgZm9yIEVWRVJZIGJsb2NrIGluIHRoZSBzZWN0aW9uIHRoYXRcbiAgICogaGFzIG9uZS4gSW5jbHVkZXMgU1RBVElDIGJsb2NrcyAoYSBgcHJvYmxlbWAncyB3b3JrZWQgZXhwbGFuYXRpb24pLCB3aGljaFxuICAgKiBpcyB0aGUgd2hvbGUgcmVhc29uIHRoaXMgaXMgY29sbGVjdGVkIGJ5IHdhbGtpbmcgYmxvY2tzIHJhdGhlciB0aGFuIGJ5XG4gICAqIHdhbGtpbmcgdGhlIGJsb2NrcyB0aGF0IHByb2R1Y2VkIHJlc3BvbnNlcy4gKi9cbiAgc29sdXRpb25zOiBBcnJheTx7IGJsb2NrSWQ6IHN0cmluZzsgc29sdXRpb246IHVua25vd25bXSB9Pjtcbn1cblxuLy8gRXhwb3J0ZWQgZm9yIHRoZSByb3N0ZXItYm9uZCB0ZXN0IE9OTFkgKHJvc3RlckJvbmRzLnRlc3QudHMpIFx1MjAxNCB0aGVzZSB0d29cbi8vIFNldHMgcmVzdGF0ZSByZWdpc3RyeSBmYWN0cyAoZmFtaWx5ICdyZWNvcmRlZCc7IGRlcml2ZVF1ZXN0aW9uU2hhcGUpIHRoYXRcbi8vIHRoaXMgbW9kdWxlIGRlbGliZXJhdGVseSBkb2VzIG5vdCBpbXBvcnQgdGhlIHJlZ2lzdHJ5IHRvIGRlcml2ZSwgYW5kIGFcbi8vIGhhbmQtbGlzdCB0aGF0IHJlc3RhdGVzIGEgcmVnaXN0cnkgZmFjdCBpcyBhIGNsYWltIHRoYXQgbmVlZHMgYSBndWFyZCAoQTcsXG4vLyBwb2xpY3kgUDEwYikuIFByb2R1Y3Rpb24gY29kZSBtdXN0IGtlZXAgY29uc3VtaW5nIHRoZW0gZnJvbSBoZXJlLlxuZXhwb3J0IGNvbnN0IEZSRUVfVEVYVF9UWVBFUyA9IG5ldyBTZXQoW1xuICAnc2VsZl9leHBsYW5hdGlvbicsXG4gICdzaG9ydF9hbnN3ZXInLFxuICAnZXNzYXknLFxuXSk7XG5leHBvcnQgY29uc3QgR1JBUEhfVFlQRVMgPSBuZXcgU2V0KFtcbiAgJ2ludGVyYWN0aXZlX2dyYXBoJyxcbiAgJ251bWJlcl9saW5lJyxcbiAgJ2RhdGFfcGxvdCcsXG5dKTtcblxuLyoqIFByb2plY3QgYSByYXcgQmxhbmtUb2tlbiBvbnRvIHRoZSBncmFkaW5nIGtleSBzaGFwZS4gKi9cbmZ1bmN0aW9uIGJsYW5rVG9rZW5Ub0tleShub2RlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IEJsYW5rS2V5IHtcbiAgY29uc3QgYW5zd2VyID0gdHlwZW9mIG5vZGUuYW5zd2VyID09PSAnc3RyaW5nJyA/IG5vZGUuYW5zd2VyIDogJyc7XG4gIGNvbnN0IGFjY2VwdGFibGUgPSBBcnJheS5pc0FycmF5KG5vZGUuYWNjZXB0YWJsZUFuc3dlcnMpXG4gICAgPyAobm9kZS5hY2NlcHRhYmxlQW5zd2VycyBhcyB1bmtub3duW10pLmZpbHRlcihcbiAgICAgICAgKGEpOiBhIGlzIHN0cmluZyA9PiB0eXBlb2YgYSA9PT0gJ3N0cmluZycsXG4gICAgICApXG4gICAgOiBbXTtcbiAgY29uc3QgYW5zd2VyVHlwZSA9IG5vZGUuYW5zd2VyVHlwZTtcbiAgcmV0dXJuIHtcbiAgICBpZDogU3RyaW5nKG5vZGUuaWQgPz8gJycpLFxuICAgIC8vIGBhbnN3ZXJgIGZpcnN0LCB0aGVuIHRoZSBhbHRlcm5hdGVzIFx1MjAxNCBvbmUgbGlzdCwgbWF0Y2hpbmcgaG93IHRoZVxuICAgIC8vIHJlbmRlcmVyIGpvaW5zIHRoZW0gaW50byBkYXRhLWJsYW5rLWFuc3dlcnMuXG4gICAgYW5zd2VyczogW2Fuc3dlciwgLi4uYWNjZXB0YWJsZV0sXG4gICAgYW5zd2VyVHlwZTpcbiAgICAgIGFuc3dlclR5cGUgPT09ICdudW1lcmljJyB8fCBhbnN3ZXJUeXBlID09PSAnbWF0aCcgPyBhbnN3ZXJUeXBlIDogJ3RleHQnLFxuICAgIHRvbGVyYW5jZTogdHlwZW9mIG5vZGUudG9sZXJhbmNlID09PSAnbnVtYmVyJyA/IG5vZGUudG9sZXJhbmNlIDogMCxcbiAgICBlcXVpdmFsZW5jZTogbm9kZS5lcXVpdmFsZW5jZSA9PT0gJ2V4YWN0LWZvcm0nID8gJ2V4YWN0LWZvcm0nIDogJ3ZhbHVlJyxcbiAgICBtaXN0YWtlRmVlZGJhY2s6IEFycmF5LmlzQXJyYXkobm9kZS5taXN0YWtlRmVlZGJhY2spXG4gICAgICA/IChub2RlLm1pc3Rha2VGZWVkYmFjayBhcyBBcnJheTx7XG4gICAgICAgICAgbWF0Y2g6IHN0cmluZztcbiAgICAgICAgICBmZWVkYmFjazogdW5rbm93bltdO1xuICAgICAgICAgIG1pc2NvbmNlcHRpb25JZD86IHN0cmluZztcbiAgICAgICAgfT4pXG4gICAgICA6IFtdLFxuICAgIGhpbnQ6IEFycmF5LmlzQXJyYXkobm9kZS5oaW50KSA/IChub2RlLmhpbnQgYXMgdW5rbm93bltdKSA6IHVuZGVmaW5lZCxcbiAgICBpbnRlcmNoYW5nZWFibGVXaXRoUHJldmlvdXM6IG5vZGUuaW50ZXJjaGFuZ2VhYmxlV2l0aFByZXZpb3VzID09PSB0cnVlLFxuICB9O1xufVxuXG4vKiogUHJvamVjdCBhIHJhdyBNYXRoUHJvbXB0IG9udG8gdGhlIHNhbWUgc2hhcGUuIEEgZ2FwIGlzIEFMV0FZUyBncmFkZWQgYXMgYVxuICogbWF0aCBleHByZXNzaW9uIGFuZCBuZXZlciBjYXJyaWVzIGhpbnQvbWlzdGFrZUZlZWRiYWNrIFx1MjAxNCBhbmQgaXRzIGlkIGlzIG5vdCBhXG4gKiB1dWlkLCBidXQgaXQga2V5cyBpbnRvIHRoZSBzYW1lIGBibGFua3NgIHJlc3BvbnNlIG1hcC4gKi9cbmZ1bmN0aW9uIG1hdGhQcm9tcHRUb0tleShub2RlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IEJsYW5rS2V5IHtcbiAgY29uc3QgYW5zd2VyID0gdHlwZW9mIG5vZGUuYW5zd2VyID09PSAnc3RyaW5nJyA/IG5vZGUuYW5zd2VyIDogJyc7XG4gIGNvbnN0IGFjY2VwdGFibGUgPSBBcnJheS5pc0FycmF5KG5vZGUuYWNjZXB0YWJsZUFuc3dlcnMpXG4gICAgPyAobm9kZS5hY2NlcHRhYmxlQW5zd2VycyBhcyB1bmtub3duW10pLmZpbHRlcihcbiAgICAgICAgKGEpOiBhIGlzIHN0cmluZyA9PiB0eXBlb2YgYSA9PT0gJ3N0cmluZycsXG4gICAgICApXG4gICAgOiBbXTtcbiAgcmV0dXJuIHtcbiAgICBpZDogU3RyaW5nKG5vZGUuaWQgPz8gJycpLFxuICAgIGFuc3dlcnM6IFthbnN3ZXIsIC4uLmFjY2VwdGFibGVdLFxuICAgIGFuc3dlclR5cGU6ICdtYXRoJyxcbiAgICB0b2xlcmFuY2U6IHR5cGVvZiBub2RlLnRvbGVyYW5jZSA9PT0gJ251bWJlcicgPyBub2RlLnRvbGVyYW5jZSA6IDAsXG4gICAgZXF1aXZhbGVuY2U6IG5vZGUuZXF1aXZhbGVuY2UgPT09ICdleGFjdC1mb3JtJyA/ICdleGFjdC1mb3JtJyA6ICd2YWx1ZScsXG4gICAgbWlzdGFrZUZlZWRiYWNrOiBbXSxcbiAgICBoaW50OiB1bmRlZmluZWQsXG4gICAgLy8gQSBnYXAgbmV2ZXIgam9pbnMgYW4gaW50ZXJjaGFuZ2VhYmxlIHJ1bjogdGhlIGZsYWcgaXMgYSBCbGFua1Rva2VuIGZpZWxkLlxuICAgIGludGVyY2hhbmdlYWJsZVdpdGhQcmV2aW91czogZmFsc2UsXG4gIH07XG59XG5cbi8vIFBST01QVF9DQVJSSUVSX1RZUEVTIGlzIGltcG9ydGVkIGZyb20gc2FuaXRpemUvcHJvbXB0Q2FycmllcnMudHMgXHUyMDE0IHRoZSBPTkVcbi8vIGRlY2xhcmF0aW9uIGJvdGggdGhlIHNhbml0aXplcidzIGRlZXAgc3RyaXAgYW5kIHRoaXMgd2FsayBjb25zdW1lIChBNykuXG5cbi8vIC0tLS0gVGhlIGludGVncml0eSBnYXRlIChCOC9EMTApIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFYWNoIGhlbHBlciBiZWxvdyBBUFBFTkRTIHByb2JsZW1zIGFuZCBuZXZlciBjaGFuZ2VzIHdoYXQgaXMgY29sbGVjdGVkIFx1MjAxNCBpblxuLy8gJ2NvZXJjZScgbW9kZSB0aGUgaW52ZW50b3J5IG11c3Qgc3RheSBieXRlLWlkZW50aWNhbCB0byB0aGUgcHJlLWdhdGUgd2Fsayxcbi8vIGFuZCBpbiAndGhyb3cnIG1vZGUgdGhlIGNvbGxlY3RlZCBpbnZlbnRvcnkgaXMgZGlzY2FyZGVkIGFueXdheS4gRXZlcnlcbi8vIG1lc3NhZ2UgbGVhZHMgd2l0aCB0aGUgb3duaW5nIGJsb2NrIGlkOiB0aGUgZXJyb3IncyBwcm9ibGVtcyBsaXN0IGlzIHdoYXRcbi8vIHR1cm5zIFwiY2hlY2tpbmcgaXMgYnJva2VuXCIgaW50byBhIGZpbmRhYmxlIGRlZmVjdCBpbiBhbiBlZGdlIGxvZy5cblxuLyoqIFRoZSBhbnN3ZXJUeXBlIC8gZXF1aXZhbGVuY2Ugdm9jYWJ1bGFyaWVzIHRoZSBwcm9qZWN0aW9ucyBjb2VyY2UgdG93YXJkLlxuICogQSB2YWx1ZSBPVVRTSURFIHRoZW0gaXMgYSBzaGFwZSB0aGUgc2NoZW1hIGNhbm5vdCBhdXRob3IgXHUyMDE0IGNvZXJjaW5nIGl0XG4gKiBzaWxlbnRseSBjaGFuZ2VzIGdyYWRpbmcgc2VtYW50aWNzIChlLmcuIGEgbWF0aCBhbnN3ZXIgZ3JhZGVkIGJ5dGUtd2lzZSkuICovXG5jb25zdCBBTlNXRVJfVFlQRVMgPSBuZXcgU2V0KFsndGV4dCcsICdudW1lcmljJywgJ21hdGgnXSk7XG5jb25zdCBFUVVJVkFMRU5DRVMgPSBuZXcgU2V0KFsndmFsdWUnLCAnZXhhY3QtZm9ybSddKTtcblxuLyoqIHByZXNlbnQtd2l0aC10aGUtd3Jvbmctc2hhcGUsIHRoZSBydWxlJ3Mgb25lIHByZWRpY2F0ZTogYWJzZW50IGlzIGFsd2F5c1xuICogZmluZSAoYXV0aG9yZWQtZW1wdHkpLCBhIGJhZCBzaGFwZSBuZXZlciBpcy4gKi9cbmZ1bmN0aW9uIGJhZCh2YWx1ZTogdW5rbm93biwgb2s6ICh2OiB1bmtub3duKSA9PiBib29sZWFuKTogYm9vbGVhbiB7XG4gIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmICFvayh2YWx1ZSk7XG59XG5cbmNvbnN0IGlzU3RyaW5nID0gKHY6IHVua25vd24pID0+IHR5cGVvZiB2ID09PSAnc3RyaW5nJztcbmNvbnN0IGlzTnVtYmVyID0gKHY6IHVua25vd24pID0+IHR5cGVvZiB2ID09PSAnbnVtYmVyJztcbmNvbnN0IGlzQm9vbGVhbiA9ICh2OiB1bmtub3duKSA9PiB0eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nO1xuY29uc3QgaXNBcnJheVYgPSAodjogdW5rbm93bikgPT4gQXJyYXkuaXNBcnJheSh2KTtcbmNvbnN0IGlzUGxhaW5PYmplY3QgPSAodjogdW5rbm93bikgPT5cbiAgdiAhPT0gbnVsbCAmJiB0eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkodik7XG5cbi8qKiBNYXRjaGluZy9vcmRlcmluZyBpdGVtIGVudHJpZXM6IGBTdHJpbmcoaS5pZClgIG1pbnRlZCAndW5kZWZpbmVkJy1zdHlsZVxuICogaWRzIHRoZSBjbGllbnQgY291bGQgbmV2ZXIgc2VuZCBiYWNrLiBBbiBlbnRyeSB0aGF0IGV4aXN0cyBidXQgbGFja3MgaXRzXG4gKiBpZGVudGl0eSBpcyBicm9rZW4sIG5vdCBhdXRob3JlZC1lbXB0eSBcdTIwMTQgYW4gRU1QVFkgaXRlbXMgYXJyYXkgaXMgdGhlXG4gKiBhdXRob3JlZC1lbXB0eSBmb3JtIGFuZCBzdGF5cyBmaW5lLiAqL1xuZnVuY3Rpb24gY2hlY2tJdGVtSWRzKFxuICBpdGVtczogQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+LFxuICBibG9ja0lkOiBzdHJpbmcsXG4gIHByb2JsZW1zOiBzdHJpbmdbXSxcbik6IHZvaWQge1xuICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcbiAgICBpZiAoIWlzUGxhaW5PYmplY3QoaXRlbSkpIHtcbiAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7YmxvY2tJZH06IGFuIGl0ZW0gZW50cnkgdGhhdCBpcyBub3QgYW4gb2JqZWN0YCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaXRlbS5pZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7YmxvY2tJZH06IGFuIGl0ZW0gd2l0aG91dCBhIHN0cmluZyBpZGApO1xuICAgIH1cbiAgfVxufVxuXG4vKiogVGhlIGZpZWxkcyBibGFua1Rva2VuVG9LZXkgLyBtYXRoUHJvbXB0VG9LZXkgbmFycm93LCBjaGVja2VkIGluc3RlYWQgb2ZcbiAqIGNvZXJjZWQuIGBmb3JQcm9tcHRgIHNraXBzIHRoZSB0aHJlZSBCbGFua1Rva2VuLW9ubHkgZmllbGRzLiAqL1xuZnVuY3Rpb24gY2hlY2tLZXlGaWVsZHMoXG4gIG5vZGU6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuICB3aGVyZTogc3RyaW5nLFxuICBwcm9ibGVtczogc3RyaW5nW10sXG4gIGZvclByb21wdDogYm9vbGVhbixcbik6IHZvaWQge1xuICBpZiAoYmFkKG5vZGUuYW5zd2VyLCBpc1N0cmluZykpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogYW5zd2VyIGlzIG5vdCBhIHN0cmluZ2ApO1xuICB9XG4gIGlmIChiYWQobm9kZS5hY2NlcHRhYmxlQW5zd2VycywgaXNBcnJheVYpKSB7XG4gICAgcHJvYmxlbXMucHVzaChgJHt3aGVyZX06IGFjY2VwdGFibGVBbnN3ZXJzIGlzIG5vdCBhbiBhcnJheWApO1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkobm9kZS5hY2NlcHRhYmxlQW5zd2VycykpIHtcbiAgICAvLyBUaGUgcHJvamVjdGlvbiBGSUxURVJTIG5vbi1zdHJpbmcgZW50cmllcyBcdTIwMTQgYW4gYXV0aG9yZWQgYWx0ZXJuYXRlIHRoYXRcbiAgICAvLyBzaWxlbnRseSB2YW5pc2hlcyBtYXJrcyBhIGNvcnJlY3Qgc3R1ZGVudCB3cm9uZy5cbiAgICBpZiAoIW5vZGUuYWNjZXB0YWJsZUFuc3dlcnMuZXZlcnkoaXNTdHJpbmcpKSB7XG4gICAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogYWNjZXB0YWJsZUFuc3dlcnMgaGFzIGEgbm9uLXN0cmluZyBlbnRyeWApO1xuICAgIH1cbiAgfVxuICBpZiAoYmFkKG5vZGUuYW5zd2VyVHlwZSwgKHYpID0+IEFOU1dFUl9UWVBFUy5oYXModiBhcyBzdHJpbmcpKSkge1xuICAgIHByb2JsZW1zLnB1c2goYCR7d2hlcmV9OiBhbnN3ZXJUeXBlIGlzIG91dHNpZGUgdGhlIHZvY2FidWxhcnlgKTtcbiAgfVxuICBpZiAoYmFkKG5vZGUudG9sZXJhbmNlLCBpc051bWJlcikpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogdG9sZXJhbmNlIGlzIG5vdCBhIG51bWJlcmApO1xuICB9XG4gIGlmIChiYWQobm9kZS5lcXVpdmFsZW5jZSwgKHYpID0+IEVRVUlWQUxFTkNFUy5oYXModiBhcyBzdHJpbmcpKSkge1xuICAgIHByb2JsZW1zLnB1c2goYCR7d2hlcmV9OiBlcXVpdmFsZW5jZSBpcyBvdXRzaWRlIHRoZSB2b2NhYnVsYXJ5YCk7XG4gIH1cbiAgaWYgKGZvclByb21wdCkgcmV0dXJuO1xuICBpZiAoYmFkKG5vZGUubWlzdGFrZUZlZWRiYWNrLCBpc0FycmF5VikpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogbWlzdGFrZUZlZWRiYWNrIGlzIG5vdCBhbiBhcnJheWApO1xuICB9XG4gIGlmIChiYWQobm9kZS5oaW50LCBpc0FycmF5VikpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogaGludCBpcyBub3QgYW4gYXJyYXlgKTtcbiAgfVxuICBpZiAoYmFkKG5vZGUuaW50ZXJjaGFuZ2VhYmxlV2l0aFByZXZpb3VzLCBpc0Jvb2xlYW4pKSB7XG4gICAgLy8gYD09PSB0cnVlYCBuYXJyb3dpbmcgd291bGQgc2lsZW50bHkgZGVncmFkZSB0aGUgZ3JvdXAgdG8gcG9zaXRpb25hbFxuICAgIC8vIGdyYWRpbmcgXHUyMDE0IGEgc3dhcHBlZC1idXQtY29ycmVjdCBwYWlyIG1hcmtlZCB3cm9uZy5cbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogaW50ZXJjaGFuZ2VhYmxlV2l0aFByZXZpb3VzIGlzIG5vdCBhIGJvb2xlYW5gKTtcbiAgfVxufVxuXG4vKiogQ29sbGVjdCBpbi1iYW5kIGtleXMgKGJsYW5rcyArIG1hdGggZ2FwcykgYmVsb25naW5nIHRvIFRISVMgYmxvY2ssIGF0IGFueVxuICogZGVwdGggc2hvcnQgb2YgYSBuZXN0ZWQgY2hpbGQgYmxvY2suICovXG5mdW5jdGlvbiBjb2xsZWN0SW5CYW5kS2V5cyhcbiAgdmFsdWU6IHVua25vd24sXG4gIG91dDogQmxhbmtLZXlbXSxcbiAgaXNDaGlsZEJsb2NrQXJyYXk6ICh2YWx1ZTogdW5rbm93bikgPT4gYm9vbGVhbixcbiAgYmxvY2tJZDogc3RyaW5nLFxuICBwcm9ibGVtczogc3RyaW5nW10sXG4pOiB2b2lkIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgaWYgKGlzQ2hpbGRCbG9ja0FycmF5KHZhbHVlKSkgcmV0dXJuO1xuICAgIGZvciAoY29uc3QgaXRlbSBvZiB2YWx1ZSkge1xuICAgICAgY29sbGVjdEluQmFuZEtleXMoaXRlbSwgb3V0LCBpc0NoaWxkQmxvY2tBcnJheSwgYmxvY2tJZCwgcHJvYmxlbXMpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHJldHVybjtcbiAgY29uc3Qgbm9kZSA9IHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIGlmIChub2RlLnR5cGUgPT09ICdibGFuaycgJiYgdHlwZW9mIG5vZGUuaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgLy8gTm90IGV2ZW4gcmVjb2duaXplZCBhcyBhIGJsYW5rIFx1MjAxNCB0aGUgdHlwZWQgYW5zd2VyIHdvdWxkIHZhbmlzaC4gVGhlIGlkXG4gICAgLy8gaXMgdGhlIHRva2VuJ3MgaWRlbnRpdHksIHNvIGFuIGVudHJ5IHdpdGhvdXQgb25lIGlzIGJyb2tlbiwgbm90XG4gICAgLy8gYXV0aG9yZWQtZW1wdHkuIEZhbGxzIHRocm91Z2ggdG8gdGhlIGNoaWxkIHdhbGsgZXhhY3RseSBhcyB0aGVcbiAgICAvLyBwcmUtZ2F0ZSBjb2RlIGRpZCwgc28gJ2NvZXJjZScgbW9kZSBzdGF5cyBieXRlLWlkZW50aWNhbC5cbiAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2Jsb2NrSWR9OiBhIGJsYW5rIHRva2VuIHdpdGhvdXQgYSBzdHJpbmcgaWRgKTtcbiAgfVxuICBpZiAobm9kZS50eXBlID09PSAnYmxhbmsnICYmIHR5cGVvZiBub2RlLmlkID09PSAnc3RyaW5nJykge1xuICAgIGNoZWNrS2V5RmllbGRzKG5vZGUsIGBibG9jayAke2Jsb2NrSWR9OiBibGFuayAke25vZGUuaWR9YCwgcHJvYmxlbXMsIGZhbHNlKTtcbiAgICBvdXQucHVzaChibGFua1Rva2VuVG9LZXkobm9kZSkpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodHlwZW9mIG5vZGUudHlwZSA9PT0gJ3N0cmluZycgJiYgUFJPTVBUX0NBUlJJRVJfVFlQRVMuaGFzKG5vZGUudHlwZSkpIHtcbiAgICBpZiAoYmFkKG5vZGUucHJvbXB0cywgaXNBcnJheVYpKSB7XG4gICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2Jsb2NrSWR9OiBwcm9tcHRzIGlzIG5vdCBhbiBhcnJheWApO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShub2RlLnByb21wdHMpKSB7XG4gICAgICBmb3IgKGNvbnN0IHByb21wdCBvZiBub2RlLnByb21wdHMpIHtcbiAgICAgICAgaWYgKHByb21wdCA9PT0gbnVsbCB8fCB0eXBlb2YgcHJvbXB0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7YmxvY2tJZH06IGEgcHJvbXB0IGVudHJ5IHRoYXQgaXMgbm90IGFuIG9iamVjdGApO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHAgPSBwcm9tcHQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIGlmICh0eXBlb2YgcC5pZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2Jsb2NrSWR9OiBhIHByb21wdCB3aXRob3V0IGEgc3RyaW5nIGlkYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hlY2tLZXlGaWVsZHMocCwgYGJsb2NrICR7YmxvY2tJZH06IHByb21wdCAke3AuaWR9YCwgcHJvYmxlbXMsIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIG91dC5wdXNoKG1hdGhQcm9tcHRUb0tleShwKSk7XG4gICAgICB9XG4gICAgICAvLyBLZWVwIHdhbGtpbmcgc2libGluZ3M6IGEgbWF0aF9ibG9jayBjYXJyaWVzIGNvbnRlbnQgZmllbGRzIHRvby5cbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBjaGlsZCBvZiBPYmplY3QudmFsdWVzKG5vZGUpKSB7XG4gICAgY29sbGVjdEluQmFuZEtleXMoY2hpbGQsIG91dCwgaXNDaGlsZEJsb2NrQXJyYXksIGJsb2NrSWQsIHByb2JsZW1zKTtcbiAgfVxufVxuXG4vLyBsb29rc0xpa2VCbG9ja0FycmF5IC8gY2hpbGRCbG9ja3NPZiBhcmUgSU1QT1JURUQgZnJvbSBjb250YWluZXIvYmxvY2tJbmRleCBcdTIwMTRcbi8vIHRoaXMgZmlsZSBjYXJyaWVkIGEgcHJpdmF0ZSwgbG9naWNhbGx5LWlkZW50aWNhbCBjb3B5IG9mIHRoZSBzdWJ0bGVcbi8vIGhldXJpc3RpYyB1bnRpbCAyMDI2LTA4LTA2IChBMjQpLCBoZWRnZWQgXCJtaXJyb3JpbmcgYmxvY2tJbmRleCdzXCIgd2hpbGUgdGhlXG4vLyBzb3VyY2UgZmlsZSBjbGFpbWVkIFwidGhpcyBvbmUgaXMgdGhlIHNvdXJjZVwiOiB0aGUgY29weSB0aGF0IHdvdWxkIHNpbGVudGx5XG4vLyBkcmlmdCwgYW5kIGRyaWZ0ZWQgYXR0cmlidXRpb24gbWlzLWdyYWRlcyBpbnZpc2libHkuIFNhbWUgcGFja2FnZSwgYW5kIHRoZVxuLy8gY2Vuc3VzIGFscmVhZHkgaW1wb3J0cyBjaGlsZEJsb2Nrc09mIHNlcnZlci1zaWRlLCBzbyB0aGUgYnVuZGxlIGJvdW5kYXJ5XG4vLyB3YXMgcHJvdmVuIGJlZm9yZSB0aGlzIGpvaW5lZCBpdC5cblxuZnVuY3Rpb24gdmlzaXQoXG4gIGJsb2NrOiBSYXdCbG9jayxcbiAgaW52OiBHcmFkYWJsZUludmVudG9yeSxcbiAgcHJvYmxlbXM6IHN0cmluZ1tdLFxuKTogdm9pZCB7XG4gIGNvbnN0IGlkID0gdHlwZW9mIGJsb2NrLmlkID09PSAnc3RyaW5nJyA/IGJsb2NrLmlkIDogJyc7XG4gIGNvbnN0IHR5cGUgPSB0eXBlb2YgYmxvY2sudHlwZSA9PT0gJ3N0cmluZycgPyBibG9jay50eXBlIDogJyc7XG4gIGlmIChiYWQoYmxvY2suaWQsIGlzU3RyaW5nKSkge1xuICAgIC8vIFNraXBwZWQgZW50aXJlbHkgYnkgdGhlIHByZS1nYXRlIHdhbGs6IHRoZSBzdHVkZW50J3MgYW5zd2VyIGZvciBpdCB3YXNcbiAgICAvLyBzdWJtaXR0ZWQsIHN0b3JlZCwgYW5kIG5ldmVyIHNjb3JlZCBcdTIwMTQgdGhlIGV4YWN0IGZhaWx1cmUgdGhlIGRlZXAgd2Fsa1xuICAgIC8vIGV4aXN0cyB0byBwcmV2ZW50LlxuICAgIHByb2JsZW1zLnB1c2goYGEgYmxvY2sgd2hvc2UgaWQgaXMgbm90IGEgc3RyaW5nICgke0pTT04uc3RyaW5naWZ5KGJsb2NrLmlkKX0pYCk7XG4gIH1cbiAgaWYgKGJhZChibG9jay50eXBlLCBpc1N0cmluZykpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkIHx8ICc8bm8gaWQ+J306IHR5cGUgaXMgbm90IGEgc3RyaW5nYCk7XG4gIH1cbiAgaWYgKGJhZChibG9jay5zb2x1dGlvbiwgaXNBcnJheVYpKSB7XG4gICAgLy8gU2lsZW50bHkgZHJvcHBlZCBiZWZvcmU6IHRoZSBzZWN0aW9uIHNheXMgXCJjaGVja2VkXCIgYnV0IHRoZSB3b3JrZWRcbiAgICAvLyBleHBsYW5hdGlvbiBuZXZlciB1bmxvY2tzIFx1MjAxNCBhIGNvbnRlbnQgYnVnIGZyb20gdGhlIHN0dWRlbnQncyBzZWF0LlxuICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWQgfHwgJzxubyBpZD4nfTogc29sdXRpb24gaXMgbm90IGFuIGFycmF5YCk7XG4gIH1cbiAgaWYgKCFpZCkgcmV0dXJuO1xuXG4gIC8vIFNvbHV0aW9ucyBhcmUgY29sbGVjdGVkIGZvciBFVkVSWSBibG9jayB0aGF0IGhhcyBvbmUsIGluY2x1ZGluZyBzdGF0aWNzLlxuICAvLyBBIGdyYWRlciB0aGF0IHdhbGtlZCBvbmx5IHJlc3BvbmRpbmcgYmxvY2tzIHdvdWxkIG5ldmVyIHVubG9jayBhXG4gIC8vIGBwcm9ibGVtYCdzIHdvcmtlZCBzb2x1dGlvbiwgYW5kIHRvIGEgc3R1ZGVudCB0aGF0IHJlYWRzIGFzIGEgY29udGVudCBidWdcbiAgLy8gKHRoZSBzZWN0aW9uIHNheXMgXCJjaGVja2VkXCIgYnV0IG9uZSBib3ggc3RheXMgc2h1dCkuXG4gIGlmIChBcnJheS5pc0FycmF5KGJsb2NrLnNvbHV0aW9uKSAmJiBibG9jay5zb2x1dGlvbi5sZW5ndGggPiAwKSB7XG4gICAgaW52LnNvbHV0aW9ucy5wdXNoKHsgYmxvY2tJZDogaWQsIHNvbHV0aW9uOiBibG9jay5zb2x1dGlvbiBhcyB1bmtub3duW10gfSk7XG4gIH1cblxuICBjb25zdCBpbkJhbmQ6IEJsYW5rS2V5W10gPSBbXTtcbiAgY29sbGVjdEluQmFuZEtleXMoYmxvY2ssIGluQmFuZCwgbG9va3NMaWtlQmxvY2tBcnJheSwgaWQsIHByb2JsZW1zKTtcbiAgaWYgKGluQmFuZC5sZW5ndGggPiAwKSB7XG4gICAgaW52LmJsYW5rR3JvdXBzQnlCbG9jay5wdXNoKHsgYmxvY2tJZDogaWQsIGtleXM6IGluQmFuZCB9KTtcbiAgfVxuXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ211bHRpcGxlX2Nob2ljZSc6IHtcbiAgICAgIGlmIChiYWQoYmxvY2suY2hvaWNlcywgaXNBcnJheVYpKSB7XG4gICAgICAgIC8vIENvZXJjZWQgdG8gW10gYmVmb3JlOiB0aGUgc2VsZWN0aW9uIGdyYWRlZCBhZ2FpbnN0IGFuIEVNUFRZIGtleSBhbmRcbiAgICAgICAgLy8gdGhlIHN0dWRlbnQgd2FzIG1hcmtlZCB3cm9uZyB3aXRoIGNvbmZpZGVuY2UuXG4gICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBjaG9pY2VzIGlzIG5vdCBhbiBhcnJheWApO1xuICAgICAgfVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYmxvY2suY2hvaWNlcykpIHtcbiAgICAgICAgZm9yIChjb25zdCBjIG9mIGJsb2NrLmNob2ljZXMpIHtcbiAgICAgICAgICBpZiAoIWlzUGxhaW5PYmplY3QoYykpIHtcbiAgICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBhIGNob2ljZSBlbnRyeSB0aGF0IGlzIG5vdCBhbiBvYmplY3RgKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBjaG9pY2UgPSBjIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICAgIGlmICh0eXBlb2YgY2hvaWNlLmlkICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgLy8gU3RyaW5nKGMuaWQpIG1pbnRlZCBpZHMgdGhlIHNlcnZlZCBwYWdlIG5ldmVyIHJlbmRlcmVkLlxuICAgICAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGEgY2hvaWNlIHdpdGhvdXQgYSBzdHJpbmcgaWRgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGJhZChjaG9pY2UuY29ycmVjdCwgaXNCb29sZWFuKSkge1xuICAgICAgICAgICAgLy8gYD09PSB0cnVlYCBuYXJyb3dpbmcgc2lsZW50bHkgZW1wdGllZCB0aGUga2V5LlxuICAgICAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGEgY2hvaWNlIHdob3NlIGNvcnJlY3QgZmxhZyBpcyBub3QgYSBib29sZWFuYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChiYWQoY2hvaWNlLmZlZWRiYWNrLCBpc0FycmF5VikpIHtcbiAgICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBhIGNob2ljZSB3aG9zZSBmZWVkYmFjayBpcyBub3QgYW4gYXJyYXlgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGNob2ljZXMgPSBBcnJheS5pc0FycmF5KGJsb2NrLmNob2ljZXMpXG4gICAgICAgID8gKGJsb2NrLmNob2ljZXMgYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KVxuICAgICAgICA6IFtdO1xuICAgICAgaW52Lm11bHRpcGxlQ2hvaWNlLnB1c2goe1xuICAgICAgICBibG9ja0lkOiBpZCxcbiAgICAgICAgY29ycmVjdElkczogY2hvaWNlc1xuICAgICAgICAgIC5maWx0ZXIoKGMpID0+IGMuY29ycmVjdCA9PT0gdHJ1ZSlcbiAgICAgICAgICAubWFwKChjKSA9PiBTdHJpbmcoYy5pZCkpLFxuICAgICAgICBjaG9pY2VzOiBjaG9pY2VzLm1hcCgoYykgPT4gKHtcbiAgICAgICAgICBpZDogU3RyaW5nKGMuaWQpLFxuICAgICAgICAgIGNvcnJlY3Q6IGMuY29ycmVjdCA9PT0gdHJ1ZSxcbiAgICAgICAgICAuLi4oQXJyYXkuaXNBcnJheShjLmZlZWRiYWNrKVxuICAgICAgICAgICAgPyB7IGZlZWRiYWNrOiBjLmZlZWRiYWNrIGFzIHVua25vd25bXSB9XG4gICAgICAgICAgICA6IHt9KSxcbiAgICAgICAgICAuLi4odHlwZW9mIGMubWlzY29uY2VwdGlvbklkID09PSAnc3RyaW5nJyAmJiBjLm1pc2NvbmNlcHRpb25JZFxuICAgICAgICAgICAgPyB7IG1pc2NvbmNlcHRpb25JZDogYy5taXNjb25jZXB0aW9uSWQgfVxuICAgICAgICAgICAgOiB7fSksXG4gICAgICAgIH0pKSxcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgJ21hdGNoaW5nJzoge1xuICAgICAgaWYgKGJhZChibG9jay5pdGVtcywgaXNBcnJheVYpKSB7XG4gICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBpdGVtcyBpcyBub3QgYW4gYXJyYXlgKTtcbiAgICAgIH1cbiAgICAgIGlmIChiYWQoYmxvY2sua2V5LCBpc1BsYWluT2JqZWN0KSkge1xuICAgICAgICAvLyBUaGUgYmFyZSBjYXN0IHBhc3NlZCBhbnl0aGluZyB0aHJvdWdoOiBsb29rdXBzIG9uIGEgYnJva2VuIGtleVxuICAgICAgICAvLyByZXR1cm4gdW5kZWZpbmVkIGFuZCBldmVyeSBwbGFjZWQgcGFpciBpcyB3cm9uZy5cbiAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGtleSBpcyBub3QgYW4gb2JqZWN0YCk7XG4gICAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QoYmxvY2sua2V5KSkge1xuICAgICAgICBpZiAoIU9iamVjdC52YWx1ZXMoYmxvY2sua2V5IGFzIG9iamVjdCkuZXZlcnkoaXNTdHJpbmcpKSB7XG4gICAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGtleSBoYXMgYSBub24tc3RyaW5nIHRhcmdldGApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBpdGVtcyA9IEFycmF5LmlzQXJyYXkoYmxvY2suaXRlbXMpXG4gICAgICAgID8gKGJsb2NrLml0ZW1zIGFzIEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PilcbiAgICAgICAgOiBbXTtcbiAgICAgIGNoZWNrSXRlbUlkcyhpdGVtcywgaWQsIHByb2JsZW1zKTtcbiAgICAgIGludi5tYXRjaGluZy5wdXNoKHtcbiAgICAgICAgYmxvY2tJZDogaWQsXG4gICAgICAgIGtleTogKGJsb2NrLmtleSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSA/PyB7fSxcbiAgICAgICAgaXRlbUlkczogaXRlbXMubWFwKChpKSA9PiBTdHJpbmcoaS5pZCkpLFxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSAnb3JkZXJpbmcnOiB7XG4gICAgICBpZiAoYmFkKGJsb2NrLml0ZW1zLCBpc0FycmF5VikpIHtcbiAgICAgICAgLy8gYXV0aG9yZWRPcmRlciBjb2VyY2VkIHRvIFtdIGJlZm9yZTogYSBkZWxpYmVyYXRlIGFycmFuZ2VtZW50IGdyYWRlZFxuICAgICAgICAvLyBhZ2FpbnN0IGFuIGVtcHR5IGtleSBhbmQgd2FzIG1hcmtlZCB3cm9uZy5cbiAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGl0ZW1zIGlzIG5vdCBhbiBhcnJheWApO1xuICAgICAgfVxuICAgICAgY29uc3QgaXRlbXMgPSBBcnJheS5pc0FycmF5KGJsb2NrLml0ZW1zKVxuICAgICAgICA/IChibG9jay5pdGVtcyBhcyBBcnJheTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4pXG4gICAgICAgIDogW107XG4gICAgICBjaGVja0l0ZW1JZHMoaXRlbXMsIGlkLCBwcm9ibGVtcyk7XG4gICAgICAvLyBUaGUgYXV0aG9yZWQgb3JkZXIgSVMgdGhlIGtleSBcdTIwMTQgYXZhaWxhYmxlIG9ubHkgYmVjYXVzZSB0aGlzIHdhbGtzIHRoZVxuICAgICAgLy8gcmF3IGRvY3VtZW50IHJhdGhlciB0aGFuIHRoZSBzZXJ2ZWQgb25lLlxuICAgICAgaW52Lm9yZGVyaW5nLnB1c2goeyBibG9ja0lkOiBpZCwgYXV0aG9yZWRPcmRlcjogaXRlbXMubWFwKChpKSA9PiBTdHJpbmcoaS5pZCkpIH0pO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgLy8gQSB0YWJsZSBjb250cmlidXRlcyBOTyBwZXItdHlwZSBpbnZlbnRvcnk6IGl0cyBncmFkYWJsZSBjb250ZW50IGlzXG4gICAgICAvLyBibGFuayB0b2tlbnMsIGFscmVhZHkgY29sbGVjdGVkIChhbmQgZ2F0ZWQpIGJ5IHRoZSBpbi1iYW5kIHdhbGsgYWJvdmUsXG4gICAgICAvLyB3aGVyZXZlciBpbiB0aGUgY2VsbHMgdGhleSBzaXQuIFRoYXQgaXMgdGhlIHdob2xlIGRlc2lnbi5cbiAgICAgIC8vXG4gICAgICAvLyBXaGF0IHRoYXQgd2FsayBjYW5ub3Qgc2VlIGlzIGEgU0tFTEVUT04gcHJlc2VudCB3aXRoIHRoZSB3cm9uZyBzaGFwZS5cbiAgICAgIC8vIGByb3dzOiAnbm9wZSdgLCBvciBhIGBjZWxsc2Agb2JqZWN0LCBzaW1wbHkgeWllbGRzIG5vIGtleXMgXHUyMDE0IHNvIHRoZVxuICAgICAgLy8gc2VjdGlvbiBcImNoZWNrc1wiIHN1Y2Nlc3NmdWxseSB3aGlsZSB0aGUgc3R1ZGVudCdzIHRhYmxlIGFuc3dlcnMgZ29cbiAgICAgIC8vIHVuc2NvcmVkIGFuZCB1bnJlcG9ydGVkLiBUaGF0IGlzIHRoZSBzYW1lIHdvcnN0LWNhc2UgdGhlIHNlY3Rpb24tbGV2ZWxcbiAgICAgIC8vIHJvd3MgY2hlY2sgZ3VhcmRzIGFnYWluc3QsIG9uZSBsZXZlbCBkb3duLCBhbmQgdGhlIHJlYXNvbiB0aGlzIGNhc2VcbiAgICAgIC8vIGV4aXN0cyBhdCBhbGwgZGVzcGl0ZSBhZGRpbmcgbm90aGluZyB0byB0aGUgaW52ZW50b3J5LlxuICAgICAgaWYgKGJhZChibG9jay5yb3dzLCBpc0FycmF5VikpIHtcbiAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IHJvd3MgaXMgbm90IGFuIGFycmF5YCk7XG4gICAgICB9XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShibG9jay5yb3dzKSkge1xuICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiBibG9jay5yb3dzKSB7XG4gICAgICAgICAgaWYgKCFpc1BsYWluT2JqZWN0KHJvdykpIHtcbiAgICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBhIHJvdyB0aGF0IGlzIG5vdCBhbiBvYmplY3RgKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBjZWxscyA9IChyb3cgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmNlbGxzO1xuICAgICAgICAgIGlmIChiYWQoY2VsbHMsIGlzQXJyYXlWKSkge1xuICAgICAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGEgcm93IHdob3NlIGNlbGxzIGlzIG5vdCBhbiBhcnJheWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvciAoY29uc3QgY2VsbCBvZiBBcnJheS5pc0FycmF5KGNlbGxzKSA/IGNlbGxzIDogW10pIHtcbiAgICAgICAgICAgIGlmICghaXNQbGFpbk9iamVjdChjZWxsKSkge1xuICAgICAgICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkfTogYSBjZWxsIHRoYXQgaXMgbm90IGFuIG9iamVjdGApO1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiYWQoKGNlbGwgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmNvbnRlbnQsIGlzQXJyYXlWKSkge1xuICAgICAgICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkfTogYSBjZWxsIHdob3NlIGNvbnRlbnQgaXMgbm90IGFuIGFycmF5YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBkZWZhdWx0OlxuICAgICAgaWYgKEZSRUVfVEVYVF9UWVBFUy5oYXModHlwZSkpIHtcbiAgICAgICAgaW52LmZyZWVUZXh0LnB1c2goaWQpO1xuICAgICAgfSBlbHNlIGlmIChHUkFQSF9UWVBFUy5oYXModHlwZSkpIHtcbiAgICAgICAgaW52LmdyYXBocy5wdXNoKHsgYmxvY2tJZDogaWQsIGJsb2NrOiBibG9jayBhcyB1bmtub3duIGFzIFJhd0dyYXBoQmxvY2sgfSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgfVxuXG4gIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRCbG9ja3NPZihibG9jaykpIHZpc2l0KGNoaWxkLCBpbnYsIHByb2JsZW1zKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSYXdTZWN0aW9uIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIHJvd3M/OiBBcnJheTx7IGNvbHVtbnM/OiBBcnJheTx7IGJsb2Nrcz86IFJhd0Jsb2NrW10gfT4gfT47XG59XG5cbi8qKiBGaW5kIGEgc2VjdGlvbiBieSBpZCBpbiB0aGUgcmF3IGRvY3VtZW50LiBSZXR1cm5zIG51bGwgd2hlbiBhYnNlbnQgXHUyMDE0IHRoZVxuICogaGFuZGxlciB0dXJucyB0aGF0IGludG8gYSA0MDAgcmF0aGVyIHRoYW4gZ3JhZGluZyBub3RoaW5nIGFuZCByZXBvcnRpbmdcbiAqIHN1Y2Nlc3MuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZFNlY3Rpb24oXG4gIGRvYzogeyBzZWN0aW9ucz86IFJhd1NlY3Rpb25bXSB9LFxuICBzZWN0aW9uSWQ6IHN0cmluZyxcbik6IFJhd1NlY3Rpb24gfCBudWxsIHtcbiAgZm9yIChjb25zdCBzZWN0aW9uIG9mIGRvYy5zZWN0aW9ucyA/PyBbXSkge1xuICAgIGlmIChzZWN0aW9uLmlkID09PSBzZWN0aW9uSWQpIHJldHVybiBzZWN0aW9uO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdhbGtPcHRpb25zIHtcbiAgLyoqXG4gICAqICd0aHJvdycgKGRlZmF1bHQpOiB0aGUgQjgvRDEwIGludGVncml0eSBnYXRlIFx1MjAxNCBhIHN0cnVjdHVyYWxseSBicm9rZW5cbiAgICogZG9jdW1lbnQgcmFpc2VzIE1hbGZvcm1lZERvY3VtZW50RXJyb3IgaW5zdGVhZCBvZiBncmFkaW5nLiBUaGUgZGVmYXVsdCBvblxuICAgKiBwdXJwb3NlOiBhIG5ldyBjYWxsZXIgZ2V0cyB0aGUgZ2F0ZSB1bmxlc3MgaXQgYXJndWVzIGl0cyB3YXkgb3V0LlxuICAgKlxuICAgKiAnY29lcmNlJzogdGhlIHByZS1nYXRlIGRlZmVuc2l2ZSBuYXJyb3dpbmcsIGJ5dGUtaWRlbnRpY2FsIGludmVudG9yeS5cbiAgICogUmVzZXJ2ZWQgZm9yIHRoZSBSRUFEIHBhdGggKGNlbnN1cyksIHdob3NlIHJ1bGVkIGZhaWx1cmUgcG9zdHVyZSBpc1xuICAgKiB3aXRoaG9sZC1hbmQtc2VydmUgXHUyMDE0IGEgY2Vuc3VzZWQgbWFsZm9ybWVkIGRvY3VtZW50IG1lcmVseSBtaXNjb3VudHMsXG4gICAqIHdoZXJlIGEgZ3JhZGVkIG9uZSBtaW50cyBhIHdyb25nIG1hcmsuXG4gICAqL1xuICBpbnRlZ3JpdHk/OiAndGhyb3cnIHwgJ2NvZXJjZSc7XG59XG5cbi8qKiBCdWlsZCB0aGUgZ3JhZGFibGUgaW52ZW50b3J5IGZvciBvbmUgc2VjdGlvbiBvZiB0aGUgUkFXIGRvY3VtZW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVudG9yeVNlY3Rpb24oXG4gIHNlY3Rpb246IFJhd1NlY3Rpb24sXG4gIG9wdGlvbnM6IFdhbGtPcHRpb25zID0ge30sXG4pOiBHcmFkYWJsZUludmVudG9yeSB7XG4gIGNvbnN0IGludjogR3JhZGFibGVJbnZlbnRvcnkgPSB7XG4gICAgYmxhbmtHcm91cHNCeUJsb2NrOiBbXSxcbiAgICBtdWx0aXBsZUNob2ljZTogW10sXG4gICAgbWF0Y2hpbmc6IFtdLFxuICAgIG9yZGVyaW5nOiBbXSxcbiAgICBncmFwaHM6IFtdLFxuICAgIGZyZWVUZXh0OiBbXSxcbiAgICBzb2x1dGlvbnM6IFtdLFxuICB9O1xuICBjb25zdCBwcm9ibGVtczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVGhlIHNrZWxldG9uIHJ1bnMgdGhlIHNhbWUgcHJlc2VudC12cy1hYnNlbnQgcnVsZSBhcyB0aGUgYmxvY2tzOiByb3dzXG4gIC8vIGNvZXJjZWQgdG8gW10gaXMgdGhlIHdvcnN0IHNpbGVudCBvdXRjb21lIG9mIGFsbCBcdTIwMTQgdGhlIHdob2xlIHNlY3Rpb25cbiAgLy8gXCJjaGVja3NcIiBzdWNjZXNzZnVsbHkgd2l0aCB6ZXJvIGl0ZW1zLlxuICBjb25zdCByYXcgPSBzZWN0aW9uIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBpZiAoYmFkKHJhdy5yb3dzLCBpc0FycmF5VikpIHtcbiAgICBwcm9ibGVtcy5wdXNoKCdzZWN0aW9uOiByb3dzIGlzIG5vdCBhbiBhcnJheScpO1xuICB9XG4gIGZvciAoY29uc3Qgcm93IG9mIEFycmF5LmlzQXJyYXkocmF3LnJvd3MpID8gKHNlY3Rpb24ucm93cyA/PyBbXSkgOiBbXSkge1xuICAgIGlmICghaXNQbGFpbk9iamVjdChyb3cpKSB7XG4gICAgICBwcm9ibGVtcy5wdXNoKCdzZWN0aW9uOiBhIHJvdyB0aGF0IGlzIG5vdCBhbiBvYmplY3QnKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoYmFkKHJvdy5jb2x1bW5zLCBpc0FycmF5VikpIHtcbiAgICAgIHByb2JsZW1zLnB1c2goJ3NlY3Rpb246IGEgcm93IHdob3NlIGNvbHVtbnMgaXMgbm90IGFuIGFycmF5Jyk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgY29sdW1uIG9mIEFycmF5LmlzQXJyYXkocm93LmNvbHVtbnMpID8gcm93LmNvbHVtbnMgOiBbXSkge1xuICAgICAgaWYgKCFpc1BsYWluT2JqZWN0KGNvbHVtbikpIHtcbiAgICAgICAgcHJvYmxlbXMucHVzaCgnc2VjdGlvbjogYSBjb2x1bW4gdGhhdCBpcyBub3QgYW4gb2JqZWN0Jyk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKGJhZChjb2x1bW4uYmxvY2tzLCBpc0FycmF5VikpIHtcbiAgICAgICAgcHJvYmxlbXMucHVzaCgnc2VjdGlvbjogYSBjb2x1bW4gd2hvc2UgYmxvY2tzIGlzIG5vdCBhbiBhcnJheScpO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBibG9jayBvZiBBcnJheS5pc0FycmF5KGNvbHVtbi5ibG9ja3MpID8gY29sdW1uLmJsb2NrcyA6IFtdKSB7XG4gICAgICAgIGlmICghaXNQbGFpbk9iamVjdChibG9jaykpIHtcbiAgICAgICAgICBwcm9ibGVtcy5wdXNoKCdzZWN0aW9uOiBhIGJsb2NrcyBlbnRyeSB0aGF0IGlzIG5vdCBhbiBvYmplY3QnKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB2aXNpdChibG9jaywgaW52LCBwcm9ibGVtcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChwcm9ibGVtcy5sZW5ndGggPiAwICYmIG9wdGlvbnMuaW50ZWdyaXR5ICE9PSAnY29lcmNlJykge1xuICAgIHRocm93IG5ldyBNYWxmb3JtZWREb2N1bWVudEVycm9yKHByb2JsZW1zKTtcbiAgfVxuICByZXR1cm4gaW52O1xufVxuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBjZW5zdXMvY2Vuc3VzLnRzIFx1MjAxNCBhIHB1Ymxpc2hlZCB2ZXJzaW9uJ3MgYmxvY2sgY2Vuc3VzICsgaXRlbSBhdHRyaWJ1dGlvbiAoUzcpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUDNBJ3MgXCJwdWJsaXNoLXRpbWUgcmVnaXN0cnkgY2Vuc3VzXCIsIGJ1aWx0IHRoZSB3YXkgUzIgbWFkZSBwb3NzaWJsZTogdGhlXG4vLyBjZW5zdXMgaXMgREVSSVZFRCBmcm9tIHRoZSBzdG9yZWQgdmVyc2lvbiBzbmFwc2hvdCwgbmV2ZXIgd3JpdHRlbiBieVxuLy8gcHVibGlzaC1hY3Rpdml0eS4gRXZlcnkgcHVibGlzaGVkIHZlcnNpb24ncyBkb2N1bWVudCBhbHJlYWR5IGxpdmVzIGluXG4vLyBhY3Rpdml0eV92ZXJzaW9ucy5jb250ZW50IGZvcmV2ZXIsIHNvIHRoZSB0YWxseSBjYW4gYmUgY29tcHV0ZWQgd2hlbmV2ZXIgdGhlXG4vLyBkb2N1bWVudCBpcyBuZXh0IHJlYWQgXHUyMDE0IGFuZCBgcHVibGlzaC1hY3Rpdml0eWAsIHdoaWNoIFM5IHJld3JpdGVzLCBpcyBuZXZlclxuLy8gdG91Y2hlZCAodGhpcyBpcyB3aGF0IGRpc3NvbHZlZCBmaW5kaW5nIFI2KGIpOiBub3RoaW5nIGdldHMgd3JpdHRlbiB0d2ljZSkuXG4vLyBTYW1lIHBvc3R1cmUgYXMgMDAyNSdzIGRlcml2ZWQgc3R1ZGVudCBkb3JtYW5jeTogZG9uJ3QgbWFyayB3aGF0IHlvdSBjYW5cbi8vIGRlcml2ZS5cbi8vXG4vLyBUd28gcHJvZHVjdHMsIGJvdGggcGVyIHZlcnNpb246XG4vL1xuLy8gICBjb3VudHMgXHUyMDE0IGNlbnN1c0tleSBcdTIxOTIgaG93IG1hbnkgYmxvY2sgaW5zdGFuY2VzIG9mIHRoYXQga2luZCB0aGUgdmVyc2lvblxuLy8gICAgIGNvbnRhaW5zLiBUaGUga2V5IGNvbWVzIGZyb20gdGhlIHJlZ2lzdHJ5J3MgY2Vuc3VzS2V5T2YoKSwgc28gYVxuLy8gICAgIHZhcmlhbnQtY2FycnlpbmcgYmxvY2sgdGFsbGllcyBwZXIgdmFyaWFudCAoYGRhdGFfcGxvdC5idWlsZF9oaXN0b2dyYW1gKVxuLy8gICAgIGFuZCBhIG5ldyBibG9jayB0eXBlIGlzIGNvdW50ZWQgdGhlIGRheSBpdCByZWdpc3RlcnMuXG4vL1xuLy8gICBpdGVtcyBcdTIwMTQgZXZlcnkgUkVTUE9OU0UgaWQgaW4gdGhlIHZlcnNpb24gbWFwcGVkIHRvIHRoZSBjZW5zdXMga2V5IG9mIHRoZVxuLy8gICAgIGJsb2NrIGl0IGJlbG9uZ3MgdG8uIFRoaXMgaXMgd2hhdCBsZXRzIGFuIGFnZ3JlZ2F0ZSBvdmVyIHNlY3Rpb25fY2hlY2tzXG4vLyAgICAgc2F5IFwiMyBvZiA0IHdyb25nIGFuc3dlcnMgd2VyZSBvbiBmaWxsX2luX2JsYW5rXCIgXHUyMDE0IHZlcmRpY3RzIGFyZSBrZXllZCBieVxuLy8gICAgIGl0ZW0gaWQgKGJsYW5rL2dhcCBpZHMgZm9yIHRoZSBibGFua3MgY2F0ZWdvcnksIGJsb2NrIGlkcyBlbHNld2hlcmUpLCBhbmRcbi8vICAgICBub3RoaW5nIGVsc2UgaW4gdGhlIGRhdGFiYXNlIGtub3dzIHdoYXQgYW4gaXRlbSBpZCBJUy5cbi8vXG4vLyBXSFkgVEhFIElURU0gTUFQIFJFVVNFUyBUSEUgR1JBRElORyBXQUxLIChydWxpbmcgUzctNSkuIFRoZSBzZXQgb2YgaWRzIHRoYXRcbi8vIGNhbiBhcHBlYXIgaW4gYSB2ZXJkaWN0IG1hcCBpcyBkZWNpZGVkIGJ5IE9ORSB0aGluZzogd2hhdCB0aGUgZ3JhZGVyIGFjY2VwdHNcbi8vIChpbnZlbnRvcnlTZWN0aW9uLCBzZXJ2ZXIvZ3JhZGluZy93YWxrLnRzKS4gQSBzZWNvbmQgZW51bWVyYXRpb24gd3JpdHRlbiBoZXJlXG4vLyB3b3VsZCBkcmlmdCBmcm9tIGl0IFx1MjAxNCBhbmQgZHJpZnRlZCBhdHRyaWJ1dGlvbiBpcyBzaWxlbnQsIGNvdW50aW5nIGEgc3R1ZGVudCdzXG4vLyBhbnN3ZXIgdW5kZXIgdGhlIHdyb25nIGJsb2NrIHR5cGUgb3IgZHJvcHBpbmcgaXQuIFNvIHRoaXMgbW9kdWxlIG93bnMgbm8gaWRcbi8vIHJ1bGVzIGF0IGFsbDogaXQgYXNrcyB0aGUgZ3JhZGVyJ3MgaW52ZW50b3J5IGZvciB0aGUgaWRzIGFuZCBvbmx5IHN1cHBsaWVzXG4vLyB0aGUgaWQgXHUyMTkyIGNlbnN1cy1rZXkgam9pbi4gdGVzdHMvY2Vuc3VzLnRlc3QudHMgcGlucyB0aGUgZXF1YWxpdHkuXG4vL1xuLy8gQlVORExFIE5PVEU6IHdhbGsudHMgaW1wb3J0cyBpdHMgdHdvIGNvbGxhYm9yYXRvcnMgYXMgYGltcG9ydCB0eXBlYCBvbmx5LCBzb1xuLy8gcHVsbGluZyBpdCBpbiBoZXJlIGNvc3RzIHRoZSByZWFkIGJ1bmRsZSBub3RoaW5nIGF0IHJ1bnRpbWUgXHUyMDE0IG5vIG1hdGhqcywgbm9cbi8vIHNjb3JlcnMgKHRoZSBncmFwaC1raXQvc2NvcmVycyBkaXNjaXBsaW5lLCBjaGVja2VkIGJ5IHRoZSBidW5kbGUncyBzaXplXG4vLyBjZWlsaW5nIGFuZCBhIGdyZXAtYWJzZW5jZSB0ZXN0KS5cbi8vXG4vLyAgIGRvY3VtZW50IFx1MjUwMFx1MjUwMFx1MjVCQSBlYWNoQmxvY2sgKHJvd3NcdTIxOTJjb2x1bW5zXHUyMTkyYmxvY2tzLCBjaGlsZCBibG9ja3MsIHJlZmVyZW5jZVBhbmVsKVxuLy8gICAgICAgICAgICAgICAgICAgXHUyNTAyXG4vLyAgICAgICAgICAgICAgICAgICBcdTI1MUNcdTI1MDBcdTI1QkEgY291bnRzOiAgdGFsbHkgb2YgY2Vuc3VzS2V5T2YoYmxvY2spXG4vLyAgICAgICAgICAgICAgICAgICBcdTI1MTRcdTI1MDBcdTI1QkEgaW5kZXg6ICAgYmxvY2tJZCBcdTIxOTIgY2Vuc3VzS2V5XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjVCMlxuLy8gICBzZWN0aW9ucyBcdTI1MDBcdTI1MDBcdTI1QkEgaW52ZW50b3J5U2VjdGlvbiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MTggIChibGFuay9nYXAgaWRzLCBNQy9tYXRjaGluZy9vcmRlcmluZy9cbi8vICAgICAgICAgICAgICAgICh0aGUgZ3JhZGVyJ3Mgb3duICAgICAgIGdyYXBoL2ZyZWUtdGV4dCBibG9jayBpZHMpXG4vLyAgICAgICAgICAgICAgICAgYWNjZXB0ZWQtaWQgc2V0KSAgIFx1MjUwMFx1MjUwMFx1MjVCQSBpdGVtc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHR5cGUgeyBBY3Rpdml0eURvY3VtZW50LCBCbG9jayB9IGZyb20gJ0BhY3Rpdml0eS9zY2hlbWEnO1xuaW1wb3J0IHsgY2hpbGRCbG9ja3NPZiB9IGZyb20gJy4uL2NvbnRhaW5lci9ibG9ja0luZGV4LmpzJztcbmltcG9ydCB7IGJsb2NrUmVnaXN0cnksIGNlbnN1c0tleU9mIH0gZnJvbSAnLi4vcmVnaXN0cnkvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgaW52ZW50b3J5U2VjdGlvbiB9IGZyb20gJy4uL3NlcnZlci9ncmFkaW5nL3dhbGsuanMnO1xuaW1wb3J0IHR5cGUgeyBSYXdTZWN0aW9uIH0gZnJvbSAnLi4vc2VydmVyL2dyYWRpbmcvd2Fsay5qcyc7XG5cbi8qKiBDZW5zdXMga2V5IGZvciBhIGJsb2NrIHdob3NlIHR5cGUgdGhlIHJlZ2lzdHJ5IGRvZXNuJ3Qga25vdy4gVW5yZWFjaGFibGUgZm9yXG4gKiBhIHNjaGVtYS12YWxpZCBkb2N1bWVudCAodGhlIHJlZ2lzdHJ5IGNvbXBsZXRlbmVzcyBndWFyZCBtYWtlcyBldmVyeSBibG9ja1xuICogdHlwZSByZWdpc3RlcmVkKSwgYW5kIGRlbGliZXJhdGVseSBhIFZJU0lCTEUgYnVja2V0IHJhdGhlciB0aGFuIGEgdGhyb3c6IHRoaXNcbiAqIHJ1bnMgb24gdGhlIHJlYWQgcGF0aCwgd2hlcmUgdGhlIHJ1bGVkIHdyaXRlIG9yZGVyaW5nIG1lYW5zIGEgdGhyb3duIGNlbnN1c1xuICogd291bGQgY29zdCB0aGUgdmVyc2lvbiBpdHMgY2FjaGUgcm93IG9uIGV2ZXJ5IHJlYWQuIEEgc3VyZmFjZWQgYF91bmtub3duYFxuICogcm93IGlzIGEgYnVnIHJlcG9ydDsgYSBjcmFzaCBoZXJlIHdvdWxkIGJlIGEgc2lsZW50IHBlcmZvcm1hbmNlIGNsaWZmLiAqL1xuZXhwb3J0IGNvbnN0IFVOS05PV05fQ0VOU1VTX0tFWSA9ICdfdW5rbm93bic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2Vuc3VzQ291bnQge1xuICBjZW5zdXNLZXk6IHN0cmluZztcbiAgYmxvY2tDb3VudDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENlbnN1c0l0ZW0ge1xuICAvKiogVGhlIGlkIGEgdmVyZGljdCBtYXAgaXMga2V5ZWQgYnk6IGEgYmxhbmsgaWQsIGFuIGluLWVxdWF0aW9uIGdhcCBpZFxuICAgKiAoYGdgK2hleCksIG9yIGEgZ3JhZGFibGUvcmVjb3JkZWQgYmxvY2sgaWQuICovXG4gIGl0ZW1JZDogc3RyaW5nO1xuICBjZW5zdXNLZXk6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBWZXJzaW9uQ2Vuc3VzIHtcbiAgLyoqIERvY3VtZW50IG9yZGVyIG9mIGZpcnN0IGFwcGVhcmFuY2UuICovXG4gIGNvdW50czogQ2Vuc3VzQ291bnRbXTtcbiAgaXRlbXM6IENlbnN1c0l0ZW1bXTtcbn1cblxuLyoqIFRoZSByZWdpc3RyeSdzIGtleSBydWxlLCBndWFyZGVkIG9uIGl0cyBvbmUgcHJlY29uZGl0aW9uIChhIHJlZ2lzdGVyZWRcbiAqIHR5cGUpLiBUaGUgcnVsZSBpdHNlbGYgaXMgTk9UIHJlc3RhdGVkIGhlcmUgXHUyMDE0IGNlbnN1c0tleU9mIHN0YXlzIHRoZSBzb3VyY2UsXG4gKiB2YXJpYW50IHN1ZmZpeCBpbmNsdWRlZC4gKi9cbmZ1bmN0aW9uIHNhZmVDZW5zdXNLZXkoYmxvY2s6IEJsb2NrKTogc3RyaW5nIHtcbiAgY29uc3QgdHlwZSA9IChibG9jayBhcyB7IHR5cGU/OiB1bmtub3duIH0pLnR5cGU7XG4gIGlmICh0eXBlb2YgdHlwZSAhPT0gJ3N0cmluZycgfHwgISh0eXBlIGluIGJsb2NrUmVnaXN0cnkpKSB7XG4gICAgcmV0dXJuIFVOS05PV05fQ0VOU1VTX0tFWTtcbiAgfVxuICByZXR1cm4gY2Vuc3VzS2V5T2YoYmxvY2spO1xufVxuXG4vKiogVmlzaXQgYSBibG9jayBhbmQsIGRlcHRoLWZpcnN0LCBldmVyeSBibG9jayBuZXN0ZWQgaW5zaWRlIGl0LiBDaGlsZCBibG9ja3NcbiAqIGFyZSBmb3VuZCBTVFJVQ1RVUkFMTFkgdmlhIGJsb2NrSW5kZXgncyBjaGlsZEJsb2Nrc09mIFx1MjAxNCB0aGUgZG9jdW1lbnRlZCBzaW5nbGVcbiAqIGRlZmluaXRpb24gb2YgXCJpcyB0aGlzIGEgbmVzdGVkIGJsb2NrIG9yIGNvbnRlbnQgb2YgdGhpcyBvbmU/XCIsIHNoYXJlZCB3aXRoXG4gKiB0aGUgc2VydmVkLWRvY3VtZW50IGluZGV4IGFuZCB0aGUgYW5zd2VyLWtleSBleHRyYWN0aW9uLiBBIGZhZGVkIGV4YW1wbGUnc1xuICogc3RlcHMgdGhlcmVmb3JlIGNvdW50IGFzIHRoZW1zZWx2ZXMsIGV4YWN0bHkgYXMgdGhleSBncmFkZSBhcyB0aGVtc2VsdmVzLiAqL1xuZnVuY3Rpb24gdmlzaXREZWVwKGJsb2NrOiBCbG9jaywgdmlzaXQ6IChibG9jazogQmxvY2spID0+IHZvaWQpOiB2b2lkIHtcbiAgdmlzaXQoYmxvY2spO1xuICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkQmxvY2tzT2YoYmxvY2sgYXMgdW5rbm93biBhcyBvYmplY3QpKSB7XG4gICAgdmlzaXREZWVwKGNoaWxkIGFzIHVua25vd24gYXMgQmxvY2ssIHZpc2l0KTtcbiAgfVxufVxuXG4vKiogRXZlcnkgYmxvY2sgaW5zdGFuY2UgaW4gdGhlIGRvY3VtZW50LCBpbiBkb2N1bWVudCBvcmRlcjogc2VjdGlvbiBjb250ZW50XG4gKiBmaXJzdCAocm93cyBcdTIxOTIgY29sdW1ucyBcdTIxOTIgYmxvY2tzKSwgdGhlbiB0aGUgcmVmZXJlbmNlIHBhbmVsLiBUaGUgcGFuZWwgaXNcbiAqIHNjYWZmb2xkIFx1MjAxNCBpdCBpcyBuZXZlciBjaGVja2VkLCBzbyBpdCBjb250cmlidXRlcyBjb3VudHMgYW5kIG5vIGl0ZW1zIFx1MjAxNCBidXRcbiAqIGl0IElTIGF1dGhvcmVkIGNvbnRlbnQgYSB0ZWFjaGVyIGNob3NlLCBzbyBsZWF2aW5nIGl0IG91dCB3b3VsZCB1bmRlcmNvdW50XG4gKiB3aGF0IHRoZSBhY3Rpdml0eSBhY3R1YWxseSB1c2VzLiAqL1xuZnVuY3Rpb24gZWFjaEJsb2NrKGRvYzogQWN0aXZpdHlEb2N1bWVudCwgdmlzaXQ6IChibG9jazogQmxvY2spID0+IHZvaWQpOiB2b2lkIHtcbiAgZm9yIChjb25zdCBzZWN0aW9uIG9mIGRvYy5zZWN0aW9ucyA/PyBbXSkge1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHNlY3Rpb24ucm93cyA/PyBbXSkge1xuICAgICAgZm9yIChjb25zdCBjb2x1bW4gb2Ygcm93LmNvbHVtbnMgPz8gW10pIHtcbiAgICAgICAgZm9yIChjb25zdCBibG9jayBvZiBjb2x1bW4uYmxvY2tzID8/IFtdKSB2aXNpdERlZXAoYmxvY2ssIHZpc2l0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBibG9jayBvZiBkb2MucmVmZXJlbmNlUGFuZWw/LmJsb2NrcyA/PyBbXSkgdmlzaXREZWVwKGJsb2NrLCB2aXNpdCk7XG59XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgY2Vuc3VzIG9mIGFuIFVQR1JBREVEIGRvY3VtZW50IChwb3N0LXVwZ3JhZGUsIHByZS1zYW5pdGl6ZSkuXG4gKlxuICogUHJlLXNhbml0aXplIG9uIHB1cnBvc2U6IGBvcmRlcmluZ2AncyBhdXRob3JlZCBpdGVtIG9yZGVyIGFuZCB0aGUgYmxhbmtcbiAqIGFuc3dlciBrZXlzIGFyZSBnb25lIGZyb20gdGhlIHNlcnZlZCBhcnRpZmFjdCwgYW5kIHRoZSBncmFkaW5nIGludmVudG9yeSB0aGlzXG4gKiBqb2lucyBhZ2FpbnN0IHJlYWRzIHRoZSBzYW1lIHJhdyBzaGFwZSB0aGUgZ3JhZGVyIGRvZXMuIE5vdGhpbmcgZGVyaXZlZCBoZXJlXG4gKiBpcyBzZWNyZXQgXHUyMDE0IGEgY291bnQgb2YgYmxvY2sga2luZHMgYW5kIGEgbGlzdCBvZiByZXNwb25zZSBpZHMgdGhlIGNsaWVudFxuICogYWxyZWFkeSBob2xkcyBcdTIwMTQgc28gdGhlIG91dHB1dCBjcm9zc2VzIG5vIHNhbml0aXplciBib3VuZGFyeS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNlbnN1c09mRG9jdW1lbnQoZG9jOiBBY3Rpdml0eURvY3VtZW50KTogVmVyc2lvbkNlbnN1cyB7XG4gIGNvbnN0IGNvdW50cyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG4gIGNvbnN0IGtleUJ5QmxvY2tJZCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cbiAgZWFjaEJsb2NrKGRvYywgKGJsb2NrKSA9PiB7XG4gICAgY29uc3Qga2V5ID0gc2FmZUNlbnN1c0tleShibG9jayk7XG4gICAgY291bnRzLnNldChrZXksIChjb3VudHMuZ2V0KGtleSkgPz8gMCkgKyAxKTtcbiAgICBjb25zdCBpZCA9IChibG9jayBhcyB7IGlkPzogdW5rbm93biB9KS5pZDtcbiAgICBpZiAodHlwZW9mIGlkID09PSAnc3RyaW5nJykga2V5QnlCbG9ja0lkLnNldChpZCwga2V5KTtcbiAgfSk7XG5cbiAgY29uc3QgaXRlbXM6IENlbnN1c0l0ZW1bXSA9IFtdO1xuICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IHB1c2ggPSAoaXRlbUlkOiBzdHJpbmcsIGJsb2NrSWQ6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgIGlmICghaXRlbUlkIHx8IHNlZW4uaGFzKGl0ZW1JZCkpIHJldHVybjtcbiAgICBzZWVuLmFkZChpdGVtSWQpO1xuICAgIGl0ZW1zLnB1c2goe1xuICAgICAgaXRlbUlkLFxuICAgICAgY2Vuc3VzS2V5OiBrZXlCeUJsb2NrSWQuZ2V0KGJsb2NrSWQpID8/IFVOS05PV05fQ0VOU1VTX0tFWSxcbiAgICB9KTtcbiAgfTtcblxuICBmb3IgKGNvbnN0IHNlY3Rpb24gb2YgZG9jLnNlY3Rpb25zID8/IFtdKSB7XG4gICAgLy8gJ2NvZXJjZScgb3B0cyBPVVQgb2YgdGhlIEI4L0QxMCBpbnRlZ3JpdHkgZ2F0ZSwgZGVsaWJlcmF0ZWx5OiB0aGlzIGlzXG4gICAgLy8gdGhlIFJFQUQgcGF0aCwgd2hvc2UgcnVsZWQgZmFpbHVyZSBwb3N0dXJlIGlzIHdpdGhob2xkLWFuZC1zZXJ2ZSAodGhlXG4gICAgLy8gY2FjaGUtZmlsbCBjYWxsZXIgYWxyZWFkeSBmYWlscyBzYWZlKS4gQSBjZW5zdXNlZCBtYWxmb3JtZWQgZG9jdW1lbnRcbiAgICAvLyBtZXJlbHkgbWlzY291bnRzOyBvbmx5IEdSQURJTkcgb25lIG1pbnRzIGEgd3JvbmcgbWFyaywgc28gb25seSBncmFkaW5nXG4gICAgLy8gcnVucyB0aGUgZ2F0ZS5cbiAgICBjb25zdCBpbnYgPSBpbnZlbnRvcnlTZWN0aW9uKHNlY3Rpb24gYXMgdW5rbm93biBhcyBSYXdTZWN0aW9uLCB7XG4gICAgICBpbnRlZ3JpdHk6ICdjb2VyY2UnLFxuICAgIH0pO1xuICAgIC8vIEJsYW5rcyBhbmQgbWF0aCBnYXBzIGF0dHJpYnV0ZSB0byB0aGVpciBPV05JTkcgYmxvY2sgKHRoZSB3YWxrIGFscmVhZHlcbiAgICAvLyByZXNvbHZlcyBjb250YWluZXJzIHRvIHRoZSBjaGlsZCksIHdoaWNoIGlzIHdoeSBhIGJsYW5rIGluc2lkZSBhIGZhZGVkXG4gICAgLy8gZXhhbXBsZSBjb3VudHMgYXMgZmFkZWRfd29ya2VkX2V4YW1wbGUgYW5kIG5vdCBhcyBmaWxsX2luX2JsYW5rLlxuICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgaW52LmJsYW5rR3JvdXBzQnlCbG9jaykge1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgZ3JvdXAua2V5cykgcHVzaChrZXkuaWQsIGdyb3VwLmJsb2NrSWQpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IG1jIG9mIGludi5tdWx0aXBsZUNob2ljZSkgcHVzaChtYy5ibG9ja0lkLCBtYy5ibG9ja0lkKTtcbiAgICBmb3IgKGNvbnN0IG0gb2YgaW52Lm1hdGNoaW5nKSBwdXNoKG0uYmxvY2tJZCwgbS5ibG9ja0lkKTtcbiAgICBmb3IgKGNvbnN0IG8gb2YgaW52Lm9yZGVyaW5nKSBwdXNoKG8uYmxvY2tJZCwgby5ibG9ja0lkKTtcbiAgICBmb3IgKGNvbnN0IGcgb2YgaW52LmdyYXBocykgcHVzaChnLmJsb2NrSWQsIGcuYmxvY2tJZCk7XG4gICAgZm9yIChjb25zdCBpZCBvZiBpbnYuZnJlZVRleHQpIHB1c2goaWQsIGlkKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY291bnRzOiBbLi4uY291bnRzXS5tYXAoKFtjZW5zdXNLZXksIGJsb2NrQ291bnRdKSA9PiAoe1xuICAgICAgY2Vuc3VzS2V5LFxuICAgICAgYmxvY2tDb3VudCxcbiAgICB9KSksXG4gICAgaXRlbXMsXG4gIH07XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHNhbml0aXplL3NlcnZlU2VlZC50cyBcdTIwMTQgdGhlIE9ORSBzcGVsbGluZyBvZiB0aGUgc2VydmUtc2h1ZmZsZSBzZWVkIChHMSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc2VlZCB0aGF0IGRlY2lkZXMgd2hhdCBhcnJhbmdlbWVudCBlYWNoIHN0dWRlbnQgaXMgU0VSVkVEIFx1MjAxNCBhbmRcbi8vIHRoZXJlZm9yZSB3aGF0IHRoZSBncmFkZXIgbXVzdCByZWNvbXB1dGUgdG8gdGVsbCBcImFycmFuZ2VkIGRlbGliZXJhdGVseVwiXG4vLyBmcm9tIFwibmV2ZXIgdG91Y2hlZFwiICh0aGUgb3JkZXJpbmcgb21pc3Npb24gcnVsZSkuIFVudGlsIDIwMjYtMDgtMDYgdGhlXG4vLyBjb250cmFjdCBleGlzdGVkIGFzIHR3byBzcGVsbGluZ3MgYWdyZWVpbmcgYnkgbHVjazogdGhlIHJlYWQgcGF0aCBjb21wb3NlZFxuLy8gYCR7dmVyc2lvbklkfToke3VzZXJJZH1gIGlubGluZSB3aGlsZSB0aGUgZ3JhZGluZyBzaWRlIGhhZCBpdHMgb3duXG4vLyBzZXJ2ZVNlZWQoKSAoczItcmV0cm8gZmluZGluZyA3KS4gVHdvIHN0cmluZ3MgZHJpZnRpbmcgaGVyZSB3b3VsZCBzaWxlbnRseVxuLy8gbWlzLWdyYWRlIGEgc3Vic2V0IG9mIHN0dWRlbnRzIFx1MjAxNCBjbG9zZSB0byB1bmRpYWdub3NhYmxlIGZyb20gYSBidWcgcmVwb3J0LlxuLy9cbi8vIERlcGVuZGVuY3ktZnJlZSBsZWFmIE9OIFBVUlBPU0U6IGltcG9ydGVkIGJ5IHRoZSByZWFkIGJ1bmRsZSAodGhlIGhhbmRsZXIpXG4vLyBhbmQgdGhlIGdyYWRpbmcgYnVuZGxlIChzZXJ2ZWRPcmRlciksIHNvIGl0IG11c3QgbmV2ZXIgZ3JvdyBhbiBpbXBvcnQuXG4vL1xuLy8gTkIgdGhlIHNlZWRlZCBzaHVmZmxlIGJlaGluZCB0aGlzIHNlZWQgaXMgbG9hZC1iZWFyaW5nIGZvciBTNCdzIG9yZGVyaW5nXG4vLyBvbWlzc2lvbiBydWxlIGFuZCBjYXJyaWVzIGFuIHVuZXhwbGFpbmVkIG9uZS1vZmYgZmxha2UgaW4gU1RBVEUncyB3YXRjaFxuLy8gaXRlbXMgKHNhbml0aXplLnRlc3QgXCJkaWZmZXJzIGFjcm9zcyBzdHVkZW50c1wiLCAyMDI2LTA4LTAxLCAxLWluLTE0KSBcdTIwMTQgaWZcbi8vIHRoYXQgdGVzdCBtaXNiZWhhdmVzIGFmdGVyIGFueSBjaGFuZ2UgaGVyZSwgdHJlYXQgaXQgYXMgdGhlIHNlY29uZCBzaWdodGluZy5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBDb21wb3NlIHRoZSBzZWVkIHRoZSByZWFkIHBhdGggc2VydmVzIHdpdGggYW5kIHRoZSBncmFkZXIgcmVjb21wdXRlcyBmcm9tLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlcnZlU2VlZCh2ZXJzaW9uSWQ6IHN0cmluZywgc3R1ZGVudElkOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7dmVyc2lvbklkfToke3N0dWRlbnRJZH1gO1xufVxuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBzZXJ2ZXIvand0LnRzIFx1MjAxNCB0aGUgT05FIHVudmVyaWZpZWQgYHN1YmAgcmVhZGVyIChHMilcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWNvZGVkIFdJVEhPVVQgdmVyaWZpY2F0aW9uLCBkZWxpYmVyYXRlbHk6IGJ5IHRoZSB0aW1lIGVpdGhlciBoYW5kbGVyIGNhbGxzXG4vLyB0aGlzLCBpdHMgdXNlci1zY29wZWQgUlBDIGhhcyBhbHJlYWR5IHN1Y2NlZWRlZCwgd2hpY2ggbWVhbnMgUG9zdGdSRVNUXG4vLyB2ZXJpZmllZCB0aGUgdG9rZW4ncyBzaWduYXR1cmUuIFRoaXMgb25seSByZS1yZWFkcyB0aGUgYHN1YmAgY2xhaW0gXHUyMDE0IHRvIGtleVxuLy8gdGhlIHN0dWRlbnQncyBzZXJ2ZSBzaHVmZmxlIChyZWFkIHBhdGgpIGFuZCB0aGVpciBzZWN0aW9uX2NoZWNrcyByb3dcbi8vIChjaGVjayBwYXRoKS4gTkVWRVIgYW4gYXV0aG9yaXphdGlvbiBpbnB1dC5cbi8vXG4vLyBXYXMgcGFzdGVkIGJ5dGUtaWRlbnRpY2FsbHkgaW50byBib3RoIGhhbmRsZXJzIGFzIGp3dFN1YiAvIGp3dFN1YmplY3Rcbi8vIChzMi1yZXRybyBmaW5kaW5nIDgpOyBvbmUgY29weSwgb25lIG5hbWUsIHNpbmNlIDIwMjYtMDgtMDYuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vKiogVGhlIHRva2VuJ3MgYHN1YmAgY2xhaW0sIG9yIG51bGwgd2hlbiB0aGUgaGVhZGVyIGNhcnJpZXMgbm8gcmVhZGFibGUgSldULiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGp3dFN1YihhdXRoSGVhZGVyOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgdG9rZW4gPSBhdXRoSGVhZGVyLnJlcGxhY2UoL15CZWFyZXJcXHMrL2ksICcnKTtcbiAgY29uc3QgcGF5bG9hZCA9IHRva2VuLnNwbGl0KCcuJylbMV07XG4gIGlmICghcGF5bG9hZCkgcmV0dXJuIG51bGw7XG4gIHRyeSB7XG4gICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoXG4gICAgICBhdG9iKHBheWxvYWQucmVwbGFjZSgvLS9nLCAnKycpLnJlcGxhY2UoL18vZywgJy8nKSksXG4gICAgKSBhcyB7IHN1Yj86IHVua25vd24gfTtcbiAgICByZXR1cm4gdHlwZW9mIGpzb24uc3ViID09PSAnc3RyaW5nJyA/IGpzb24uc3ViIDogbnVsbDtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2VydmVyL3V1aWQudHMgXHUyMDE0IE9ORSBpZC1zaGFwZSBydWxlIGZvciB0aGUgQVBJIHN1cmZhY2UgKEcyKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRIRSBERUNJU0lPTiAoZW5nLXJldmlldyBHMiwgMjAyNi0wOC0wNik6IFNUUklDVCBldmVyeXdoZXJlIGluIHNoYXJlZCBzZXJ2ZXJcbi8vIHNvdXJjZS4gVVVJRF9SRSBleGlzdGVkIGF0IGZvdXIgc2l0ZXMgd2l0aCB0d28gc3RyaWN0bmVzc2VzIFx1MjAxNCB0aGUgcmVhZCBBUElcbi8vIGFjY2VwdGVkIGFueSBoZXggbmliYmxlcyB3aGlsZSB0aGUgY2hlY2sgQVBJIHJlcXVpcmVkIGEgcmVhbCB2ZXJzaW9uIG5pYmJsZVxuLy8gYW5kIFJGQyB2YXJpYW50IFx1MjAxNCBzbyB0aGUgc2FtZSBhY3Rpdml0eSBpZCBjb3VsZCBiZSB2YWxpZCBvbiBvbmUgZW5kcG9pbnQgYW5kXG4vLyByZWplY3RlZCBieSB0aGUgb3RoZXIsIHdpdGggbm8gcmVjb3JkZWQgd2h5IChzMi1hdWRpdCBjb3JyZWN0aW9ucyAzLzUpLlxuLy8gRXZlcnkgbGVnaXRpbWF0ZSBpZCBpcyBhIFBvc3RncmVzIGdlbl9yYW5kb21fdXVpZCgpICh2NCwgUkZDIHZhcmlhbnQpLCBzb1xuLy8gc3RyaWN0IGNvc3RzIG5vIHJlYWwgY2xpZW50IGFueXRoaW5nIGFuZCByZWplY3RzIGdhcmJhZ2UgZWFybGllci5cbi8vXG4vLyBUaGUgdHdvIHJlbWFpbmluZyBMT09TRSBjb3BpZXMgbGl2ZSBpbiBpbmdlc3Qtc3VibWlzc2lvbiBhbmQgZ2V0LWZlZWRiYWNrJ3Ncbi8vIERlbm8gZmlsZXMsIGRlbGliZXJhdGVseSB1bnRvdWNoZWQ6IGJvdGggZnVuY3Rpb25zIHNlcnZlIG9ubHkgdGhlIGFub255bW91c1xuLy8gcHVibGlzaGVkLXBhZ2Ugd2lyZSBhbmQgYXJlIGRlbGV0ZWQgYXQgUzkgKGN1dG92ZXIgY2hlY2tsaXN0IEMxNSkgXHUyMDE0XG4vLyB0aWdodGVuaW5nIGEgc3VyZmFjZSBzY2hlZHVsZWQgZm9yIGRlbW9saXRpb24gd291bGQgYnV5IHR3byByZWRlcGxveXMgb2YgYVxuLy8gZG9vbWVkIGZ1bmN0aW9uLiBUaGVpciBjb3BpZXMgY2FycnkgYSBwb2ludGVyIGhlcmUuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vKiogUkZDIDQxMjIgdjFcdTIwMTN2NSwgdmFyaWFudCAxMHh4IFx1MjAxNCB3aGF0IGdlbl9yYW5kb21fdXVpZCgpIGFuZCBldmVyeSBsZWdpdGltYXRlXG4gKiBjbGllbnQgaWQgYWN0dWFsbHkgbG9vayBsaWtlLiAqL1xuZXhwb3J0IGNvbnN0IFVVSURfUkUgPVxuICAvXlswLTlhLWZdezh9LVswLTlhLWZdezR9LVsxLTVdWzAtOWEtZl17M30tWzg5YWJdWzAtOWEtZl17M30tWzAtOWEtZl17MTJ9JC9pO1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBzZXJ2ZXIvZ2V0LWFjdGl2aXR5LWhhbmRsZXIudHMgXHUyMDE0IHRoZSBnZXQtYWN0aXZpdHkgcmVxdWVzdCBoYW5kbGVyIChTMilcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgZnVsbCBicmFuY2hpbmcgbG9naWMgb2YgdGhlIGdldC1hY3Rpdml0eSBFZGdlIEZ1bmN0aW9uLCBleHRyYWN0ZWQgaGVyZSBzb1xuLy8gaXQgbGl2ZXMgaW4gdGhlIFRFU1RFRCwgQ0ktZHJpZnQtZ3VhcmRlZCB2aWV3ZXItc2VydmVyIGJ1bmRsZSBpbnN0ZWFkIG9mIGluXG4vLyB1bnRlc3RhYmxlIERlbm8gZ2x1ZSAodGhlIFMyIHJldmlldyBmb3VuZCB0aGUgMzc0LWxpbmUgZnVuY3Rpb24gd2FzIHRoZSBtb3N0XG4vLyBicmFuY2gtaGVhdnkgaW4gdGhlIHJlcG8gd2l0aCB6ZXJvIGF1dG9tYXRlZCBjb3ZlcmFnZSkuIFRoZSBEZW5vIGVudHJ5IHBvaW50XG4vLyAoc3VwYWJhc2UvZnVuY3Rpb25zL2dldC1hY3Rpdml0eS9pbmRleC50cykgaXMgbm93IHRoaW4gd2lyaW5nOiBpdCByZWFkcyBlbnYsXG4vLyBidWlsZHMgdGhlIFN1cGFiYXNlIGNsaWVudHMgYmVoaW5kIHRoZSBgR2V0QWN0aXZpdHlEYmAgcG9ydCwgcGFzc2VzIHRoZVxuLy8gX3NoYXJlZC9jb3JzLnRzIGhlbHBlcnMgYmVoaW5kIHRoZSBgQ29yc0tpdGAgcG9ydCwgYW5kIHNlcnZlcyB0aGUgaGFuZGxlclxuLy8gdGhpcyBmYWN0b3J5IHJldHVybnMuIEV2ZXJ5dGhpbmcgb2JzZXJ2YWJsZSBcdTIwMTQgc3RhdHVzIGNvZGVzLCBlcnJvciBjb2Rlcyxcbi8vIGNhY2hlIGhlYWRlcnMsIHJlc3BvbnNlIGVudmVsb3BlcyBcdTIwMTQgaXMgZGVjaWRlZCBIRVJFIGFuZCBwaW5uZWQgYnlcbi8vIHRlc3RzL2dldC1hY3Rpdml0eS1oYW5kbGVyLnRlc3QudHMuXG4vL1xuLy8gVGhyZWUgR0VUIG1vZGVzIG9uIG9uZSBmdW5jdGlvbjpcbi8vXG4vLyAgIDEuIE1FVEEgKGFub255bW91cywgcmF0ZS1saW1pdGVkIFx1MjAxNCBydWxpbmcgMy4yQSk6XG4vLyAgICAgICAgR0VUID9hY3Rpdml0eV9pZD08dXVpZD4mbWV0YT0xXG4vLyAgICAgIFx1MjE5MiB7IHRpdGxlLCB0ZWFjaGVyX25hbWUgfSBhbmQgTk9USElORyBlbHNlIFx1MjAxNCB0aGUgcHJlLWF1dGggaW50ZXJzdGl0aWFsXG4vLyAgICAgICAgY29udHJhY3QgKFwiTXJzLiBKYWZhcmkncyAnTGluZWFyIFN5c3RlbXMnXCIgKyBcInVzZSB5b3VyIEBkaXN0cmljdC5vcmdcbi8vICAgICAgICBhY2NvdW50XCIpLiBTYW1lIGRhdGEgYW55IHB1Ymxpc2hlZCBwYWdlIGFscmVhZHkgc2hvd3MgcHVibGljbHkuXG4vL1xuLy8gICAxYi4gQ0xBU1MgTUVUQSAoYW5vbnltb3VzLCBzYW1lIGxpbWl0ZXIgXHUyMDE0IFM5IERyb3AgMiwgRC0zL0UtMik6XG4vLyAgICAgICAgR0VUID9qb2luX2NvZGU9PGNvZGU+Jm1ldGE9MVxuLy8gICAgICBcdTIxOTIgeyBjbGFzc19uYW1lIH0gYW5kIE5PVEhJTkcgZWxzZSBcdTIwMTQgdGhlIGpvaW4gZ2F0ZSdzIFwiSm9pbiA8Y2xhc3MgbmFtZT5cIlxuLy8gICAgICAgIGluc3RlYWQgb2YgdGhlIGJhcmUgY29kZS4gUmlkZXMgVEhJUyBicmFuY2ggcmF0aGVyIHRoYW4gYSBkaXJlY3QgYW5vblxuLy8gICAgICAgIFBvc3RnUkVTVCBncmFudCBzbyB0aGUgb25lIGFub255bW91cyBzdXJmYWNlIGtlZXBzIGl0cyByZXF1ZXN0XG4vLyAgICAgICAgc2hhcGluZyAoRS0yJ3MgcmVqZWN0aW9uIHJlYXNvbikuIEVudW1lcmF0aW9uIHBvc3R1cmUgcmVjb3JkZWQgaW5cbi8vICAgICAgICAwMDMwJ3MgaGVhZGVyIChPVi00KTogY29kZXMgXHUyMjQ4Ml4yOS43LCB0aGUgbGltaXRlciBpcyBvcHBvcnR1bmlzdGljXG4vLyAgICAgICAgbm90IGEgZ3VhcmFudGVlLCBwYXlvZmYgaXMgYSBjbGFzcyBuYW1lLCByZWNvdmVyeSBpcyBCMTRcbi8vICAgICAgICByZW1vdmUtYW5kLXJlZ2VuZXJhdGU7IHJldmlzaXQgdHJpZ2dlcnMgbmFtZWQgdGhlcmUuXG4vL1xuLy8gICAyLiBSRVNPTFZFIChhdXRoZW50aWNhdGVkKTpcbi8vICAgICAgICBHRVQgP2FjdGl2aXR5X2lkPTx1dWlkPlxuLy8gICAgICBcdTIxOTIgeyBhY3Rpdml0eV9pZCwgdmVyc2lvbl9pZCwgdmVyc2lvbl9udW0sIHRpdGxlIH0gZm9yIHRoZSBDVVJSRU5UXG4vLyAgICAgICAgcHVibGlzaGVkIHZlcnNpb24uIFNlcnZlZCBgbm8tY2FjaGVgIHNvIGEgcmVwdWJsaXNoIGlzIHZpc2libGUgb24gdGhlXG4vLyAgICAgICAgbmV4dCBvcGVuIChyZXZhbGlkYXRlLCBkb24ndCByZS1kb3dubG9hZCBcdTIwMTQgc2FtZSBwb3N0dXJlIGFzIHRoZSBSMlxuLy8gICAgICAgIGxpdmUgYWxpYXMpLlxuLy9cbi8vICAgMy4gQ09OVEVOVCAoYXV0aGVudGljYXRlZCk6XG4vLyAgICAgICAgR0VUID9hY3Rpdml0eV9pZD08dXVpZD4mdmVyc2lvbl9pZD08dXVpZD5cbi8vICAgICAgXHUyMTkyIHRoZSBVUEdSQURFRCAoNEEpICsgU0FOSVRJWkVEIChUVjQtQSkgZG9jdW1lbnQgZm9yIHRoYXQgdmVyc2lvbiwgcGx1c1xuLy8gICAgICAgIHBlci1zdHVkZW50IHNlcnZlLXRpbWUgc2h1ZmZsZXMuIFRoZSBVUkwgaXMgdmVyc2lvbi1rZXllZCwgc28gdGhlXG4vLyAgICAgICAgcmVzcG9uc2UgaXMgc2VydmVkIGBwcml2YXRlLCBtYXgtYWdlPTMxNTM2MDAwLCBpbW11dGFibGVgIFx1MjAxNCB0aGVcbi8vICAgICAgICBicm93c2VyIG5ldmVyIHJlZmV0Y2hlcyBhIHZlcnNpb24gaXQgaGFzLiBPbmx5IHRoZSBDVVJSRU5UIHZlcnNpb24gaXNcbi8vICAgICAgICBzZXJ2ZWQgKGEgc3RhbGUgdmVyc2lvbl9pZCA0MDRzIHdpdGggY29kZSAnc3RhbGVfdmVyc2lvbic7IHRoZSB2aWV3ZXJcbi8vICAgICAgICByZS1yZXNvbHZlcyksIHNvIGEgcmVwdWJsaXNoIGludmFsaWRhdGVzIGJ5IGNoYW5naW5nIHRoZSBVUkwsIG5ldmVyXG4vLyAgICAgICAgYnkgZXhwaXJpbmcgYSBjYWNoZS5cbi8vXG4vLyBQaXBlbGluZSAoY29udGVudCBtb2RlKTogZ2V0X3B1Ymxpc2hlZF9hY3Rpdml0eSBSUEMgYXMgdGhlIENBTExFUiAodGhlIERCXG4vLyBlbmZvcmNlcyBhdXRoICsgcHVibGlzaGVkLW9ubHk7IGRyYWZ0IGNvbnRlbnQgaXMgdW5yZWFjaGFibGUgaGVyZSkgXHUyMTkyXG4vLyBkdXJhYmxlIHBlci12ZXJzaW9uIGNhY2hlIGxvb2t1cCBpbiBhY3Rpdml0eV92ZXJzaW9uX3JlYWRzIGtleWVkIGJ5XG4vLyAodmVyc2lvbl9pZCwgU0FOSVRJWkVSX1JFVikgXHUyMTkyIG9uIG1pc3MgdGhlIGNhY2hlLWZpbGwgcGF0aCBiZWxvdyBcdTIxOTJcbi8vIGFwcGx5U2VydmVTaHVmZmxlcyBzZWVkZWQgYCR7dmVyc2lvbl9pZH06JHt1c2VyX2lkfWAgKGRldGVybWluaXN0aWM6IHJlbG9hZHNcbi8vIG5ldmVyIHJlc2h1ZmZsZTsgdGhlIGNhY2hlZCBhcnRpZmFjdCBzdGF5cyBzdHVkZW50LWluZGVwZW5kZW50KS5cbi8vXG4vLyAgIGNhY2hlIE1JU1MgXHUyNTAwXHUyNTAwXHUyNUJBIHJlYWRWZXJzaW9uIFx1MjUwMFx1MjUwMFx1MjVCQSB1cGdyYWRlIFx1MjUwMFx1MjUwMFx1MjVCQSBzYW5pdGl6ZVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyNTAyXG4vLyAgICAgICAgICAgICAgICAgICAgXHUyNTBDXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTE4XG4vLyAgICAgICAgICAgICAgICAgICAgXHUyNUJDXG4vLyAgICAgICAgICAgICAgd3JpdGVDZW5zdXMgKFM3KSBcdTI1MDBcdTI1MDBmYWlsc1x1MjUwMFx1MjUwMFx1MjVCQSBOTyBjYWNoZSByb3c6IG5leHQgcmVhZCByZXRyaWVzXG4vLyAgICAgICAgICAgICAgICAgICAgXHUyNTAyIG9rICAgICAgICAgICAgICAgICAgKHNlbGYtaGVhbGluZzsgc2VlIHRoZSBvcmRlcmluZ1xuLy8gICAgICAgICAgICAgICAgICAgIFx1MjVCQyAgICAgICAgICAgICAgICAgICAgICBub3RlIGF0IHRoZSBjYWxsIHNpdGUpXG4vLyAgICAgICAgICAgICAgdXBzZXJ0Q2FjaGUgXHUyNTAwXHUyNTAwXHUyNUJBIGRlbGV0ZVN0YWxlQ2FjaGUgKG9sZC1yZXYgR0MgZm9yIHRoaXMgdmVyc2lvbilcbi8vXG4vLyBUaGUgYW5hbHl0aWNzIHdyaXRlcyBhcmUgYSBTSURFLUNIQU5ORUw6IGV2ZXJ5IG9uZSBvZiB0aGVtIGNhbiBmYWlsIHdpdGhvdXRcbi8vIGNoYW5naW5nIHRoZSBzdHVkZW50J3MgcmVzcG9uc2UuIEEgY2FjaGUgSElUIGRvZXMgbm9uZSBvZiB0aGlzIHdvcmsuXG4vL1xuLy8gQWNjZXNzIHJ1bGUgKFMyIGRlY2lzaW9uIDIpOiBBTlkgYXV0aGVudGljYXRlZCB1c2VyIChzdHVkZW50IG9yIHRlYWNoZXIpIG1heVxuLy8gcmVhZCB0aGUgcHVibGlzaGVkIGN1cnJlbnQgdmVyc2lvbiBvZiBhIG5vbi1kZWxldGVkIGFjdGl2aXR5IFx1MjAxNCB0aGUgUjJcbi8vIGxpbmstc2hhcmUgbW9kZWwgYmVoaW5kIHNpZ24taW4uIENsYXNzZXMgZ2F0ZSBpZGVudGl0eSAodGhlIDEzKyBhc3NlcnRpb24pLFxuLy8gbm90IGFjdGl2aXR5IGFjY2Vzcy5cbi8vXG4vLyBLbm93biByZXNpZHVhbCAoZG9jdW1lbnRlZCwgYWNjZXB0ZWQpOiB0aGUgYnJvd3NlciBIVFRQIGNhY2hlIGlzIHBlclxuLy8gcHJvZmlsZSwgbm90IHBlciBhY2NvdW50LiBPbiBhIHNoYXJlZCBDaHJvbWVib29rIHByb2ZpbGUsIHN0dWRlbnQgQiBjYW4gYmVcbi8vIHNlcnZlZCBzdHVkZW50IEEncyBjYWNoZWQgY29udGVudCByZXNwb25zZSBcdTIwMTQgaWRlbnRpY2FsIGV4Y2VwdCB0aGUgb3JkZXJpbmdcbi8vIHBlcm11dGF0aW9uIChzZWVkZWQgcGVyIHN0dWRlbnQpLiBObyBrZXkgbWF0ZXJpYWwgZGlmZmVycywgYW5kIGdyYWRpbmdcbi8vIHJlZmVyZW5jZXMgaXRlbSBpZHMgKG9yZGVyLWluZGVwZW5kZW50KSwgc28gdGhlIHdvcnN0IGNhc2UgaXMgYSBjb3NtZXRpY1xuLy8gcGVybXV0YXRpb24gc3dhcDsgUzEncyBzaWduT3V0RXZlcnl0aGluZyBwdXJnZXMgdmlld2VyIFNUT1JBR0UsIG5vdCB0aGVcbi8vIEhUVFAgY2FjaGUsIGFuZCBwdXR0aW5nIHRoZSB1c2VyIGlkIGluIHRoZSBVUkwgdG8gc3BsaXQgY2FjaGUga2V5cyB3b3VsZFxuLy8gbGVhayBhbiBpZGVudGlmaWVyIGludG8gbG9ncyBmb3Igbm8gc2VjdXJpdHkgZ2Fpbi5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IFVwZ3JhZGVFcnJvciwgdXBncmFkZUFjdGl2aXR5RG9jdW1lbnQgfSBmcm9tICdAYWN0aXZpdHkvc2NoZW1hJztcbmltcG9ydCB7IGNlbnN1c09mRG9jdW1lbnQgfSBmcm9tICcuLi9jZW5zdXMvY2Vuc3VzLmpzJztcbmltcG9ydCB0eXBlIHsgVmVyc2lvbkNlbnN1cyB9IGZyb20gJy4uL2NlbnN1cy9jZW5zdXMuanMnO1xuaW1wb3J0IHsgU0FOSVRJWkVSX1JFViwgc2FuaXRpemVBY3Rpdml0eURvY3VtZW50IH0gZnJvbSAnLi4vc2FuaXRpemUvc2FuaXRpemUuanMnO1xuaW1wb3J0IHsgc2VydmVTZWVkIH0gZnJvbSAnLi4vc2FuaXRpemUvc2VydmVTZWVkLmpzJztcbmltcG9ydCB7IGp3dFN1YiB9IGZyb20gJy4vand0LmpzJztcbmltcG9ydCB7IFVVSURfUkUgfSBmcm9tICcuL3V1aWQuanMnO1xuaW1wb3J0IHsgYXBwbHlTZXJ2ZVNodWZmbGVzIH0gZnJvbSAnLi4vc2FuaXRpemUvc2h1ZmZsZS5qcyc7XG5pbXBvcnQgdHlwZSB7IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQgfSBmcm9tICcuLi9zYW5pdGl6ZS9zYW5pdGl6ZWQtdHlwZXMuanMnO1xuXG4vKiogQnVtcCB3aGVuIHRoZSByZXNwb25zZSBlbnZlbG9wZSBjaGFuZ2VzIHNoYXBlICh0aGUgZG9jIElOU0lERSBpdCBpc1xuICogdmVyc2lvbmVkIGJ5IHRoZSBzY2hlbWEgKyBTQU5JVElaRVJfUkVWLCBub3QgYnkgdGhpcykuICovXG5leHBvcnQgY29uc3QgQVBJX1ZFUlNJT04gPSAxO1xuXG4vLyBVVUlEX1JFIGlzIGltcG9ydGVkIChzZXJ2ZXIvdXVpZC50cywgRzIpOiB0aGlzIGZpbGUncyBsb29zZSBsb2NhbCBjb3B5XG4vLyBhY2NlcHRlZCBpZHMgdGhlIGNoZWNrIEFQSSByZWplY3RlZCBcdTIwMTQgb25lIHNoYXBlIHJ1bGUgbm93LCBzdHJpY3QuXG5cbi8vIC0tLS0gUG9ydHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgaGFuZGxlciBuZXZlciB0b3VjaGVzIHN1cGFiYXNlLWpzIG9yIERlbm8gZGlyZWN0bHk7IHRoZSBlbnRyeSBwb2ludFxuLy8gaW1wbGVtZW50cyB0aGVzZSBhZ2FpbnN0IHRoZSByZWFsIGNsaWVudHMsIHRlc3RzIGltcGxlbWVudCB0aGVtIHdpdGggZmFrZXMuXG5cbi8qKiBUaGUgYHsgZGF0YSwgZXJyb3IgfWAgc2hhcGUgZXZlcnkgc3VwYWJhc2UtanMgcXVlcnkgcmVzb2x2ZXMgdG8uICovXG5leHBvcnQgaW50ZXJmYWNlIERiUmVzdWx0PFQ+IHtcbiAgZGF0YTogVCB8IG51bGw7XG4gIGVycm9yOiB7IG1lc3NhZ2U/OiBzdHJpbmcgfSB8IG51bGw7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVibGlzaGVkQWN0aXZpdHlSb3cge1xuICB2ZXJzaW9uX2lkOiBzdHJpbmc7XG4gIHZlcnNpb25fbnVtOiBudW1iZXI7XG4gIHRpdGxlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2V0QWN0aXZpdHlEYiB7XG4gIC8qKiBgZ2V0X2FjdGl2aXR5X3B1YmxpY19tZXRhYCBSUEMgYXMgYW5vbiAocG9zdGdyZXMtb3duZWQgREVGSU5FUjsgMDAxN1xuICAgKiBkb2N1bWVudHMgdGhlIGRlbGliZXJhdGUgZ3JhbnQgXHUyMDE0IG9uZSBvZiBleGFjdGx5IFRXTyBhbm9uIFJQQ3Mgc2luY2VcbiAgICogMDAzMCwgd2l0aCBjbGFzc01ldGEncyBiZWxvdzsgdmVyaWZ5LTAwMTcgXHUwMEE3RCArIHZlcmlmeS0wMDI4IFx1MDBBN0EgYm90aCBwaW5cbiAgICogdGhlIHJvc3RlcikuICovXG4gIHB1YmxpY01ldGEoXG4gICAgYWN0aXZpdHlJZDogc3RyaW5nLFxuICApOiBQcm9taXNlPERiUmVzdWx0PHsgdGl0bGU6IHN0cmluZzsgdGVhY2hlcl9uYW1lOiBzdHJpbmcgfCBudWxsIH0+PjtcbiAgLyoqIGBnZXRfY2xhc3NfcHVibGljX21ldGFgIFJQQyBhcyBhbm9uICgwMDMwOyB0aGUgam9pbiBnYXRlJ3MgcHJlLWF1dGhcbiAgICogY2xhc3MtbmFtZSBsb29rdXAgXHUyMDE0IHRoZSByb3N0ZXIncyBTRUNPTkQgYW5vbiBSUEMsIGFzc2VydGVkIGluXG4gICAqIHZlcmlmeS0wMDI4IFx1MDBBN0EpLiAqL1xuICBjbGFzc01ldGEoam9pbkNvZGU6IHN0cmluZyk6IFByb21pc2U8RGJSZXN1bHQ8eyBuYW1lOiBzdHJpbmcgfT4+O1xuICAvKiogYGdldF9wdWJsaXNoZWRfYWN0aXZpdHlgIFJQQyBhcyB0aGUgQ0FMTEVSIChBdXRob3JpemF0aW9uIGhlYWRlciBwYXNzZWRcbiAgICogdGhyb3VnaCksIHNvIHRoZSBEQiBlbmZvcmNlcyBhdXRoICsgcHVibGlzaGVkLW9ubHkgXHUyMDE0IG5vdCB0aGlzIGhhbmRsZXIuICovXG4gIHB1Ymxpc2hlZEFjdGl2aXR5KFxuICAgIGF1dGhIZWFkZXI6IHN0cmluZyxcbiAgICBhY3Rpdml0eUlkOiBzdHJpbmcsXG4gICk6IFByb21pc2U8RGJSZXN1bHQ8UHVibGlzaGVkQWN0aXZpdHlSb3c+PjtcbiAgLyoqIENhY2hlIHJvdyBmcm9tIGFjdGl2aXR5X3ZlcnNpb25fcmVhZHMgKHNlcnZpY2Ugcm9sZSkuICovXG4gIHJlYWRDYWNoZShcbiAgICB2ZXJzaW9uSWQ6IHN0cmluZyxcbiAgICBzYW5pdGl6ZXJSZXY6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxEYlJlc3VsdDx7IGNvbnRlbnQ6IHVua25vd24gfT4+O1xuICAvKiogVmVyc2lvbiByb3cgZnJvbSBhY3Rpdml0eV92ZXJzaW9ucyAoc2VydmljZSByb2xlKS4gKi9cbiAgcmVhZFZlcnNpb24odmVyc2lvbklkOiBzdHJpbmcpOiBQcm9taXNlPERiUmVzdWx0PHsgY29udGVudDogdW5rbm93biB9Pj47XG4gIC8qKiBVcHNlcnQga2V5ZWQgKHZlcnNpb25faWQsIHNhbml0aXplcl9yZXYpIFx1MjAxNCBjb25jdXJyZW50IG1pc3NlcyB3cml0ZSB0aGVcbiAgICogc2FtZSBkZXRlcm1pbmlzdGljIGFydGlmYWN0LCBzbyBsYXN0LXdyaXRlLXdpbnMgaXMgaGFybWxlc3MuICovXG4gIHVwc2VydENhY2hlKHJvdzoge1xuICAgIHZlcnNpb25faWQ6IHN0cmluZztcbiAgICBzYW5pdGl6ZXJfcmV2OiBzdHJpbmc7XG4gICAgc2NoZW1hX3ZlcnNpb246IG51bWJlcjtcbiAgICBjb250ZW50OiB1bmtub3duO1xuICB9KTogUHJvbWlzZTx7IGVycm9yOiB7IG1lc3NhZ2U/OiBzdHJpbmcgfSB8IG51bGwgfT47XG4gIC8qKiBSZXBsYWNlIHRoaXMgdmVyc2lvbidzIGNlbnN1cyArIGl0ZW0tYXR0cmlidXRpb24gcm93cyAoUzcpLiBJZGVtcG90ZW50OlxuICAgKiB0aGUgY2Vuc3VzIGlzIGEgcHVyZSBmdW5jdGlvbiBvZiBhbiBpbW11dGFibGUgdmVyc2lvbiwgc28gYSByZS1ydW4gd3JpdGVzXG4gICAqIGlkZW50aWNhbCByb3dzLiAqL1xuICB3cml0ZUNlbnN1cyhcbiAgICB2ZXJzaW9uSWQ6IHN0cmluZyxcbiAgICBjZW5zdXM6IFZlcnNpb25DZW5zdXMsXG4gICk6IFByb21pc2U8eyBlcnJvcjogeyBtZXNzYWdlPzogc3RyaW5nIH0gfCBudWxsIH0+O1xuICAvKiogRGVsZXRlIHRoaXMgdmVyc2lvbidzIGNhY2hlIHJvd3Mgd3JpdHRlbiB1bmRlciBhbnkgT1RIRVIgc2FuaXRpemVyIHJldiBcdTIwMTRcbiAgICogdGhlIGV4YWN0IGhhbGYgb2YgdGhlIFI2KGEpIEdDLiBPbmx5IHRoaXMgY29kZSBrbm93cyB0aGUgY3VycmVudCByZXYsIHNvXG4gICAqIG9ubHkgdGhpcyBjb2RlIGNhbiBiZSBwcmVjaXNlIGFib3V0IGl0OyB0aGUgc2NoZWR1bGVkIGpvYiBzd2VlcHMgdGhlIHRhaWxcbiAgICogb2YgdmVyc2lvbnMgdGhhdCBhcmUgbmV2ZXIgcmVhZCBhZ2Fpbi4gKi9cbiAgZGVsZXRlU3RhbGVDYWNoZShcbiAgICB2ZXJzaW9uSWQ6IHN0cmluZyxcbiAgICBrZWVwUmV2OiBzdHJpbmcsXG4gICk6IFByb21pc2U8eyBlcnJvcjogeyBtZXNzYWdlPzogc3RyaW5nIH0gfCBudWxsIH0+O1xufVxuXG4vKiogVGhlIF9zaGFyZWQvY29ycy50cyBoZWxwZXIgc3VyZmFjZSAoZW52LXJlYWRpbmcsIHNvIGl0IHN0YXlzIERlbm8tc2lkZSkuICovXG5leHBvcnQgaW50ZXJmYWNlIENvcnNLaXQge1xuICBjb3JzSGVhZGVycyhyZXE6IFJlcXVlc3QpOiBIZWFkZXJzSW5pdDtcbiAgaGFuZGxlUHJlZmxpZ2h0KHJlcTogUmVxdWVzdCk6IFJlc3BvbnNlIHwgbnVsbDtcbiAganNvblJlc3BvbnNlKHJlcTogUmVxdWVzdCwgYm9keTogdW5rbm93biwgaW5pdD86IFJlc3BvbnNlSW5pdCk6IFJlc3BvbnNlO1xuICBlcnJvclJlc3BvbnNlKFxuICAgIHJlcTogUmVxdWVzdCxcbiAgICBzdGF0dXM6IG51bWJlcixcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgZGV0YWlscz86IHVua25vd24sXG4gICk6IFJlc3BvbnNlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEdldEFjdGl2aXR5SGFuZGxlckRlcHMge1xuICBkYjogR2V0QWN0aXZpdHlEYjtcbiAgY29yczogQ29yc0tpdDtcbiAgLyoqIEluamVjdGFibGUgY2xvY2sgZm9yIHRoZSByYXRlIGxpbWl0ZXIgKHRlc3RzKS4gRGVmYXVsdHMgdG8gRGF0ZS5ub3cuICovXG4gIG5vdz86ICgpID0+IG51bWJlcjtcbn1cblxuLy8gLS0tLSBNZXRhLWJyYW5jaCByYXRlIGxpbWl0aW5nIChwZXIgaXNvbGF0ZSBcdTIwMTQgTUVBU1VSRUQgQVMgTkVBUkxZIElORVJUKSAtLS0tXG4vLyBBIHNsaWRpbmcgb25lLW1pbnV0ZSB3aW5kb3cgcGVyIGNsaWVudCBJUC5cbi8vXG4vLyBSRUFEIFRISVMgQkVGT1JFIENIQU5HSU5HIFRIRSBUSFJFU0hPTEQgT1IgR0lWSU5HIFRISVMgU0hBUkVEIFNUQVRFLlxuLy9cbi8vICoqIEEgQ0xBU1NST09NIElTIE9ORSBJUC4gKiogRXZlcnkgc3R1ZGVudCBpbiBhIHNjaG9vbCBzaXRzIGJlaGluZCB0aGUgc2FtZVxuLy8gTkFULCBzbyBcIm9wZW4gdGhpcyBsaW5rIG5vd1wiIHByb2R1Y2VzIG9uZSBtZXRhIHJlcXVlc3QgcGVyIHN0dWRlbnQgXHUyMDE0IDMwK1xuLy8gd2l0aGluIHNlY29uZHMsIGh1bmRyZWRzIHBlciBtaW51dGUgYXQgYSBiZWxsIGNoYW5nZSBhY3Jvc3MgYSBjYW1wdXMgXHUyMDE0IGFsbFxuLy8gZnJvbSBhIFNJTkdMRSBhZGRyZXNzLiBBIHBlci1wZXJzb24gdGhyZXNob2xkIGlzIHRoZXJlZm9yZSBvZmYgYnkgfjIgb3JkZXJzXG4vLyBvZiBtYWduaXR1ZGUgYWdhaW5zdCB0aGUgcmVhbCB0b3BvbG9neSwgYW5kIHRoaXMgZW5kcG9pbnQgc2VydmVzIHRoZSBQUkUtQVVUSFxuLy8gaW50ZXJzdGl0aWFsOiBhIDQyOSBoZXJlIGlzIHRoZSBmaXJzdCBzY3JlZW4gYSBzdHVkZW50IGV2ZXIgc2VlcywgYmVmb3JlIHRoZXlcbi8vIGNhbiBldmVuIHNpZ24gaW4uIFRoZSBmYWlsdXJlIHdvdWxkIHByZXNlbnQgYXMgXCJzb21lIHN0dWRlbnRzIGNhbid0IG9wZW4gdGhlXG4vLyBhY3Rpdml0eSwgb3RoZXJzIGNhbiwgYXBwYXJlbnRseSBhdCByYW5kb21cIiBcdTIwMTQgbWlzZXJhYmxlIHRvIGRpYWdub3NlIG1pZC1jbGFzcy5cbi8vIFRoZSBjZWlsaW5nIGJlbG93IGlzIGRlbGliZXJhdGVseSBnZW5lcm91cyBmb3IgdGhhdCByZWFzb24uIFJBSVNJTkcgaXQgaXNcbi8vIHNhZmU7IExPV0VSSU5HIGl0IHRvd2FyZCBhIHBlci1wZXJzb24gbnVtYmVyIGlzIHRoZSBidWcuXG4vL1xuLy8gVGhpcyBjb25zdHJhaW50IGlzIG5vdCBzcGVjaWZpYyB0byB0aGlzIGZ1bmN0aW9uOiBwZXItSVAgbGltaXRpbmcgaXMgdGhlXG4vLyB3cm9uZyBwcmltaXRpdmUgYW55d2hlcmUgaW4gdGhpcyBwcm9kdWN0LCBiZWNhdXNlIG91ciB1c2VycyBhcnJpdmUgdGhpcnR5LWF0LVxuLy8gYS10aW1lIGZyb20gb25lIGFkZHJlc3MuIFNlZSBERUNJU0lPTlMubWQgXHUyMTkyIFwiUmVhZCBBUEkgUzJcIiAocmF0ZS1saW1pdFxuLy8gZmluZGluZykgYmVmb3JlIHJlYWNoaW5nIGZvciBJUC1iYXNlZCB0aHJvdHRsaW5nIGVsc2V3aGVyZS5cbi8vXG4vLyBNRUFTVVJFRCAyMDI2LTA3LTI4IG9uIHRoZSBsaXZlIGRlcGxveW1lbnQ6IDk1IHNlcXVlbnRpYWwgYW5vbnltb3VzIHJlcXVlc3RzXG4vLyBmcm9tIE9ORSBJUCBwcm9kdWNlZCBaRVJPIDQyOXMuIFN1cGFiYXNlJ3MgRWRnZSBSdW50aW1lIHJlY3ljbGVzIGlzb2xhdGVzXG4vLyBhZ2dyZXNzaXZlbHksIHNvIHRoaXMgcGVyLWhhbmRsZXIgTWFwIGlzIGVtcHR5IG9uIG1vc3QgcmVxdWVzdHMgXHUyMDE0IHRoZVxuLy8gZWZmZWN0aXZlIGxpbWl0IGlzIGZhciBsb29zZXIgdGhhbiB0aGUgY29uc3RhbnRzIGltcGx5LCBhbmQgb24gYSBkaXN0cmlidXRlZFxuLy8gYnVyc3QgaXQgaXMgbm8gbGltaXQgYXQgYWxsLiBTbyB0aGlzIGlzIG9wcG9ydHVuaXN0aWMgdGhyb3R0bGluZyBvZiBhIHNpbmdsZVxuLy8gaG90IGlzb2xhdGUsIE5PVCBhIGd1YXJhbnRlZSBcdTIwMTQgZG8gbm90IGRlc2NyaWJlIGl0IGFzIG9uZS5cbi8vXG4vLyBLZXB0IHJhdGhlciB0aGFuIGRlbGV0ZWQgYmVjYXVzZSBpdCBjb3N0cyBub3RoaW5nIGFuZCBkb2VzIGJsdW50IGEgcnVuYXdheVxuLy8gY2xpZW50LiBXaGF0IGl0IGd1YXJkcyBpcyB0aGUgdGl0bGUgKyB0ZWFjaGVyIGRpc3BsYXkgbmFtZSBvZiBhIFBVQkxJU0hFRFxuLy8gYWN0aXZpdHksIHRvIGEgY2FsbGVyIHdobyBhbHJlYWR5IGhvbGRzIGl0cyBVVUlEIFx1MjAxNCBkYXRhIGV2ZXJ5IHB1Ymxpc2hlZCBwYWdlXG4vLyBzaG93cyBwdWJsaWNseSB0b2RheSwgd2l0aCBVVUlEIGVudW1lcmF0aW9uIGluZmVhc2libGUuXG4vL1xuLy8gSWYgYSBSRUFMIGxpbWl0IGlzIGV2ZXIgbmVlZGVkICh0cmlnZ2VyOiB0aGlzIHJlc3BvbnNlIHN0YXJ0cyByZXR1cm5pbmdcbi8vIGFueXRoaW5nIHJpY2hlciB0aGFuIHRob3NlIHR3byBmaWVsZHMpLCBpdCBtdXN0IG1vdmUgdG8gc2hhcmVkIHN0YXRlIFx1MjAxNCBhXG4vLyBzbWFsbCBEQiBjb3VudGVyIHRhYmxlIFx1MjAxNCBiZWNhdXNlIG5vIGluLW1lbW9yeSBzY2hlbWUgY2FuIHdvcmsgaGVyZS4gUG9ydCB0aGVcbi8vIFNDSE9PTC1TQUZFIGNlaWxpbmcgd2l0aCBpdDsgZG8gbm90IHJlaW50cm9kdWNlIGEgcGVyLXBlcnNvbiBudW1iZXIuXG4vL1xuLy8gVGhlIGF1dGhlZCBicmFuY2hlcyBhcmUgTk9UIHJhdGUtbGltaXRlZCBoZXJlOyB0aGUgSldUIGlzIHRoZWlyIGdhdGUuXG5cbi8qKiBKb2luLWNvZGUgcmVxdWVzdCBzaGFwaW5nOiAwMDE0IG1pbnRzIDYgY2hhcnMgZnJvbSBhIDMxLWNoYXIgYWxwaGFiZXQsIGJ1dFxuICogdGhlIGdhdGUgaGVyZSBpcyBkZWxpYmVyYXRlbHkgbG9vc2VyIChhbnkgNFx1MjAxMzEyIGFscGhhbnVtZXJpY3MpIFx1MjAxNCB0aGUgUlBDJ3NcbiAqIG5vcm1hbGl6ZWQgbG9va3VwIGlzIHRoZSByZWFsIGp1ZGdlOyB0aGlzIG9ubHkgYm91bmNlcyBnYXJiYWdlIGJlZm9yZSBpdFxuICogY29zdHMgYSByb3VuZCB0cmlwLiBUaWdodGVuaW5nIHRoaXMgdG8gdG9kYXkncyBtaW50IGZvcm1hdCB3b3VsZCB0dXJuIGFcbiAqIGZ1dHVyZSBjb2RlLWZvcm1hdCBjaGFuZ2UgaW50byBhIHNpbGVudCA0MDAuICovXG5leHBvcnQgY29uc3QgSk9JTl9DT0RFX1JFID0gL15bQS1aYS16MC05XXs0LDEyfSQvO1xuXG5leHBvcnQgY29uc3QgTUVUQV9XSU5ET1dfTVMgPSA2MF8wMDA7XG4vKiogU2Nob29sLXNhZmUgY2VpbGluZzogc2l6ZWQgZm9yIGEgd2hvbGUgY2FtcHVzIGJlaGluZCBvbmUgTkFUIGF0IGEgYmVsbFxuICogY2hhbmdlLCBub3QgZm9yIG9uZSBwZXJzb24uIFNlZSB0aGUgdG9wb2xvZ3kgbm90ZSBhYm92ZS4gKi9cbmV4cG9ydCBjb25zdCBNRVRBX01BWF9QRVJfV0lORE9XID0gNjAwO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWV0YVJhdGVMaW1pdGVyKFxuICBub3c6ICgpID0+IG51bWJlciA9IERhdGUubm93LFxuKTogKGlwOiBzdHJpbmcpID0+IGJvb2xlYW4ge1xuICBjb25zdCBtZXRhSGl0cyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXJbXT4oKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIG1ldGFSYXRlTGltaXRlZChpcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdCA9IG5vdygpO1xuICAgIGNvbnN0IGhpdHMgPSAobWV0YUhpdHMuZ2V0KGlwKSA/PyBbXSkuZmlsdGVyKFxuICAgICAgKGhpdCkgPT4gdCAtIGhpdCA8IE1FVEFfV0lORE9XX01TLFxuICAgICk7XG4gICAgaWYgKGhpdHMubGVuZ3RoID49IE1FVEFfTUFYX1BFUl9XSU5ET1cpIHtcbiAgICAgIG1ldGFIaXRzLnNldChpcCwgaGl0cyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaGl0cy5wdXNoKHQpO1xuICAgIG1ldGFIaXRzLnNldChpcCwgaGl0cyk7XG4gICAgLy8gQm91bmQgdGhlIG1hcCBzbyBhIHNjYW4gYWNyb3NzIG1hbnkgSVBzIGNhbid0IGdyb3cgbWVtb3J5IHVuYm91bmRlZC5cbiAgICBpZiAobWV0YUhpdHMuc2l6ZSA+IDEwXzAwMCkgbWV0YUhpdHMuY2xlYXIoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG59XG5cbi8vIGp3dFN1YiBpcyBpbXBvcnRlZCAoc2VydmVyL2p3dC50cywgRzIpIFx1MjAxNCBpdCB3YXMgcGFzdGVkIGJ5dGUtaWRlbnRpY2FsbHlcbi8vIGludG8gYm90aCBoYW5kbGVyczsgc2VlIHRoYXQgbGVhZiBmb3IgdGhlIG5vLXZlcmlmaWNhdGlvbiByZWFzb25pbmcuXG5cbi8vIC0tLS0gVGhlIGhhbmRsZXIgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVHZXRBY3Rpdml0eUhhbmRsZXIoXG4gIGRlcHM6IEdldEFjdGl2aXR5SGFuZGxlckRlcHMsXG4pOiAocmVxOiBSZXF1ZXN0KSA9PiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIGNvbnN0IHsgZGIsIGNvcnMgfSA9IGRlcHM7XG4gIGNvbnN0IG1ldGFSYXRlTGltaXRlZCA9IGNyZWF0ZU1ldGFSYXRlTGltaXRlcihkZXBzLm5vdyA/PyBEYXRlLm5vdyk7XG5cbiAgcmV0dXJuIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldEFjdGl2aXR5KHJlcTogUmVxdWVzdCk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICBjb25zdCBwcmVmbGlnaHQgPSBjb3JzLmhhbmRsZVByZWZsaWdodChyZXEpO1xuICAgIGlmIChwcmVmbGlnaHQpIHJldHVybiBwcmVmbGlnaHQ7XG4gICAgaWYgKHJlcS5tZXRob2QgIT09ICdHRVQnKSB7XG4gICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDA1LCAnTWV0aG9kIG5vdCBhbGxvd2VkJyk7XG4gICAgfVxuXG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsKTtcbiAgICBjb25zdCBhY3Rpdml0eUlkID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ2FjdGl2aXR5X2lkJykgPz8gJyc7XG4gICAgY29uc3QgdmVyc2lvbklkID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ3ZlcnNpb25faWQnKTtcbiAgICBjb25zdCBtZXRhT25seSA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KCdtZXRhJykgPT09ICcxJztcbiAgICBjb25zdCBqb2luQ29kZSA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KCdqb2luX2NvZGUnKTtcblxuICAgIC8vIC0tLS0gMWIuIENMQVNTIE1FVEEgKGFub255bW91cykgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gSGFuZGxlZCBiZWZvcmUgdGhlIGFjdGl2aXR5X2lkIHNoYXBlIGNoZWNrOiB0aGlzIGJyYW5jaCBoYXMgbm9cbiAgICAvLyBhY3Rpdml0eS4gam9pbl9jb2RlIGV4aXN0cyBPTkxZIGFzIGEgbWV0YSBsb29rdXAgXHUyMDE0IGFueSBvdGhlciB1c2Ugb2YgdGhlXG4gICAgLy8gcGFyYW0gaXMgYSBtYWxmb3JtZWQgcmVxdWVzdCwgbm90IGEgbW9kZS5cbiAgICBpZiAoam9pbkNvZGUgIT09IG51bGwpIHtcbiAgICAgIGlmICghbWV0YU9ubHkpIHtcbiAgICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQwMCwgJ2pvaW5fY29kZSByZXF1aXJlcyBtZXRhPTEnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvZGUgPSBqb2luQ29kZS50cmltKCk7XG4gICAgICBpZiAoIUpPSU5fQ09ERV9SRS50ZXN0KGNvZGUpKSB7XG4gICAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDAsICdqb2luX2NvZGUgbXVzdCBiZSBhIGNsYXNzIGNvZGUnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGlwID1cbiAgICAgICAgcmVxLmhlYWRlcnMuZ2V0KCd4LWZvcndhcmRlZC1mb3InKT8uc3BsaXQoJywnKVswXT8udHJpbSgpID8/ICd1bmtub3duJztcbiAgICAgIC8vIFRoZSBTQU1FIGxpbWl0ZXIgaW5zdGFuY2UgYXMgdGhlIGFjdGl2aXR5IG1ldGEgYnJhbmNoIFx1MjAxNCBvbmUgYW5vbnltb3VzXG4gICAgICAvLyB3aW5kb3cgcGVyIElQIGFjcm9zcyBib3RoIGxvb2t1cHMgKFAzJ3MgbGl2ZW5lc3Mgcm93IGZpcmVzIGl0IGhlcmUpLlxuICAgICAgaWYgKG1ldGFSYXRlTGltaXRlZChpcCkpIHtcbiAgICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQyOSwgJ1RvbyBtYW55IHJlcXVlc3RzJyk7XG4gICAgICB9XG4gICAgICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBkYi5jbGFzc01ldGEoY29kZSk7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW2dldC1hY3Rpdml0eV0gY2xhc3MgbWV0YSBSUEMgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNTAwLCAnTG9va3VwIGZhaWxlZCcpO1xuICAgICAgfVxuICAgICAgLy8gTm8gcm93ID0gdW5rbm93biBvciBkZWxldGVkIGNsYXNzIFx1MjAxNCB0aGUgREVGSU5JVElWRSBuZWdhdGl2ZSBEUi02J3NcbiAgICAgIC8vIHByZS1PQXV0aCB3YXJuaW5nIGtleXMgb24gKG5ldHdvcmsgZmFpbHVyZSBhYm92ZSBpcyB0aGUgc2lsZW50IG9uZSkuXG4gICAgICBpZiAoIWRhdGEpIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDQsICdOb3QgYXZhaWxhYmxlJyk7XG4gICAgICByZXR1cm4gY29ycy5qc29uUmVzcG9uc2UoXG4gICAgICAgIHJlcSxcbiAgICAgICAgLy8gVGhlIHdpcmUtbGVhayBjb250cmFjdDogdGhlIGNsYXNzIE5BTUUgYW5kIG5vdGhpbmcgZWxzZS5cbiAgICAgICAgeyBhcGlfdmVyc2lvbjogQVBJX1ZFUlNJT04sIGNsYXNzX25hbWU6IGRhdGEubmFtZSB9LFxuICAgICAgICB7IGhlYWRlcnM6IHsgJ0NhY2hlLUNvbnRyb2wnOiAnbm8tY2FjaGUnIH0gfSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKCFVVUlEX1JFLnRlc3QoYWN0aXZpdHlJZCkpIHtcbiAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDAsICdhY3Rpdml0eV9pZCBtdXN0IGJlIGEgVVVJRCcpO1xuICAgIH1cblxuICAgIC8vIC0tLS0gMS4gTUVUQSAoYW5vbnltb3VzKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaWYgKG1ldGFPbmx5KSB7XG4gICAgICBjb25zdCBpcCA9XG4gICAgICAgIHJlcS5oZWFkZXJzLmdldCgneC1mb3J3YXJkZWQtZm9yJyk/LnNwbGl0KCcsJylbMF0/LnRyaW0oKSA/PyAndW5rbm93bic7XG4gICAgICBpZiAobWV0YVJhdGVMaW1pdGVkKGlwKSkge1xuICAgICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDI5LCAnVG9vIG1hbnkgcmVxdWVzdHMnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IGRiLnB1YmxpY01ldGEoYWN0aXZpdHlJZCk7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW2dldC1hY3Rpdml0eV0gbWV0YSBSUEMgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNTAwLCAnTG9va3VwIGZhaWxlZCcpO1xuICAgICAgfVxuICAgICAgaWYgKCFkYXRhKSByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDA0LCAnTm90IGF2YWlsYWJsZScpO1xuICAgICAgcmV0dXJuIGNvcnMuanNvblJlc3BvbnNlKFxuICAgICAgICByZXEsXG4gICAgICAgIHtcbiAgICAgICAgICBhcGlfdmVyc2lvbjogQVBJX1ZFUlNJT04sXG4gICAgICAgICAgdGl0bGU6IGRhdGEudGl0bGUsXG4gICAgICAgICAgdGVhY2hlcl9uYW1lOiBkYXRhLnRlYWNoZXJfbmFtZSxcbiAgICAgICAgfSxcbiAgICAgICAgeyBoZWFkZXJzOiB7ICdDYWNoZS1Db250cm9sJzogJ25vLWNhY2hlJyB9IH0sXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIC0tLS0gQXV0aCAocmVzb2x2ZSArIGNvbnRlbnQpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGNvbnN0IGF1dGhIZWFkZXIgPSByZXEuaGVhZGVycy5nZXQoJ0F1dGhvcml6YXRpb24nKTtcbiAgICBpZiAoIWF1dGhIZWFkZXIpIHtcbiAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDEsICdNaXNzaW5nIEF1dGhvcml6YXRpb24gaGVhZGVyJyk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBkYXRhOiBjdXJyZW50LCBlcnJvcjogcnBjRXJyb3IgfSA9IGF3YWl0IGRiLnB1Ymxpc2hlZEFjdGl2aXR5KFxuICAgICAgYXV0aEhlYWRlcixcbiAgICAgIGFjdGl2aXR5SWQsXG4gICAgKTtcbiAgICBpZiAocnBjRXJyb3IpIHtcbiAgICAgIGNvbnN0IG1zZyA9IHJwY0Vycm9yLm1lc3NhZ2UgPz8gJyc7XG4gICAgICAvLyBQb3N0Z1JFU1Qgc3VyZmFjZXMgYSBiYWQvZXhwaXJlZCBKV1QgYXMgYSA0MDEtY2xhc3MgZXJyb3I7IHRoZSBSUENcbiAgICAgIC8vIHJhaXNlcyAnTm90IGF2YWlsYWJsZScgZm9yIG1pc3NpbmcvdW5wdWJsaXNoZWQvZGVsZXRlZCBhY3Rpdml0aWVzLlxuICAgICAgY29uc3Qgc3RhdHVzID0gbXNnLmluY2x1ZGVzKCdOb3QgYXZhaWxhYmxlJylcbiAgICAgICAgPyA0MDRcbiAgICAgICAgOiAvSldUfHRva2VufGF1dGgvaS50ZXN0KG1zZylcbiAgICAgICAgICA/IDQwMVxuICAgICAgICAgIDogNTAwO1xuICAgICAgaWYgKHN0YXR1cyA9PT0gNTAwKSBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBSUEMgZXJyb3I6JywgcnBjRXJyb3IpO1xuICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShcbiAgICAgICAgcmVxLFxuICAgICAgICBzdGF0dXMsXG4gICAgICAgIHN0YXR1cyA9PT0gNDA0ID8gJ05vdCBhdmFpbGFibGUnIDogbXNnLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKCFjdXJyZW50KSByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDA0LCAnTm90IGF2YWlsYWJsZScpO1xuICAgIGNvbnN0IHJvdyA9IGN1cnJlbnQ7XG5cbiAgICAvLyAtLS0tIDIuIFJFU09MVkUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpZiAoIXZlcnNpb25JZCkge1xuICAgICAgcmV0dXJuIGNvcnMuanNvblJlc3BvbnNlKFxuICAgICAgICByZXEsXG4gICAgICAgIHtcbiAgICAgICAgICBhcGlfdmVyc2lvbjogQVBJX1ZFUlNJT04sXG4gICAgICAgICAgYWN0aXZpdHlfaWQ6IGFjdGl2aXR5SWQsXG4gICAgICAgICAgdmVyc2lvbl9pZDogcm93LnZlcnNpb25faWQsXG4gICAgICAgICAgdmVyc2lvbl9udW06IHJvdy52ZXJzaW9uX251bSxcbiAgICAgICAgICB0aXRsZTogcm93LnRpdGxlLFxuICAgICAgICB9LFxuICAgICAgICB7IGhlYWRlcnM6IHsgJ0NhY2hlLUNvbnRyb2wnOiAnbm8tY2FjaGUnIH0gfSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gLS0tLSAzLiBDT05URU5UIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaWYgKCFVVUlEX1JFLnRlc3QodmVyc2lvbklkKSkge1xuICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQwMCwgJ3ZlcnNpb25faWQgbXVzdCBiZSBhIFVVSUQnKTtcbiAgICB9XG4gICAgaWYgKHZlcnNpb25JZCAhPT0gcm93LnZlcnNpb25faWQpIHtcbiAgICAgIC8vIFJlcHVibGlzaGVkIHNpbmNlIHJlc29sdmUgXHUyMDE0IHRoZSB2aWV3ZXIgcmUtcmVzb2x2ZXMgYW5kIHJlZmV0Y2hlcy4gNDA0XG4gICAgICAvLyAobm90IDQwOSkgc28gbm8gc3RhbGUtVVJMIHJlc3BvbnNlIGlzIGV2ZXIgY2FjaGVhYmxlIGFzIGNvbnRlbnQuXG4gICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDA0LCAnTm90IHRoZSBjdXJyZW50IHZlcnNpb24nLCB7XG4gICAgICAgIGNvZGU6ICdzdGFsZV92ZXJzaW9uJyxcbiAgICAgICAgY3VycmVudF92ZXJzaW9uX2lkOiByb3cudmVyc2lvbl9pZCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIER1cmFibGUgcGVyLXZlcnNpb24gY2FjaGUgKGFjdGl2aXR5X3ZlcnNpb25fcmVhZHMsIHNlcnZpY2Utcm9sZSBvbmx5KS5cbiAgICBsZXQgc2FuaXRpemVkOiBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgY29uc3QgeyBkYXRhOiBjYWNoZWQsIGVycm9yOiBjYWNoZUVyciB9ID0gYXdhaXQgZGIucmVhZENhY2hlKFxuICAgICAgdmVyc2lvbklkLFxuICAgICAgU0FOSVRJWkVSX1JFVixcbiAgICApO1xuICAgIGlmIChjYWNoZUVycikge1xuICAgICAgLy8gQ2FjaGUgcmVhZCBmYWlsdXJlIGlzIG5vbi1mYXRhbCBcdTIwMTQgZmFsbCB0aHJvdWdoIHRvIHRoZSBzb3VyY2Ugb2YgdHJ1dGguXG4gICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBjYWNoZSByZWFkIGZhaWxlZDonLCBjYWNoZUVycik7XG4gICAgfVxuICAgIGlmIChjYWNoZWQpIHtcbiAgICAgIHNhbml0aXplZCA9IGNhY2hlZC5jb250ZW50IGFzIFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQ7XG4gICAgfVxuXG4gICAgaWYgKCFzYW5pdGl6ZWQpIHtcbiAgICAgIGNvbnN0IHsgZGF0YTogdmVyc2lvbiwgZXJyb3I6IHZFcnIgfSA9IGF3YWl0IGRiLnJlYWRWZXJzaW9uKHZlcnNpb25JZCk7XG4gICAgICBpZiAodkVyciB8fCAhdmVyc2lvbikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSB2ZXJzaW9uIHJlYWQgZmFpbGVkOicsIHZFcnIpO1xuICAgICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNTAwLCAnVmVyc2lvbiByZWFkIGZhaWxlZCcpO1xuICAgICAgfVxuICAgICAgbGV0IHVwZ3JhZGVkO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdXBncmFkZWQgPSB1cGdyYWRlQWN0aXZpdHlEb2N1bWVudCh2ZXJzaW9uLmNvbnRlbnQpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIFRoZSBleHBsaWNpdCBmYWlsdXJlIHN0YXRlIHRoZSBmYWlsdXJlLW1vZGVzIHRhYmxlIHByb21pc2VzIFx1MjAxNCBhXG4gICAgICAgIC8vIHNlcnZlZCA1MDAgd2l0aCBhIHJlYXNvbiwgbmV2ZXIgYSBtaXMtcGFyc2VkIGRvY3VtZW50LlxuICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSB1cGdyYWRlIGZhaWxlZDonLCBlcnIpO1xuICAgICAgICBjb25zdCBkZXRhaWwgPVxuICAgICAgICAgIGVyciBpbnN0YW5jZW9mIFVwZ3JhZGVFcnJvciA/IGVyci5tZXNzYWdlIDogJ1VwZ3JhZGUgZmFpbGVkJztcbiAgICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDUwMCwgJ0FjdGl2aXR5IGNvbnRlbnQgY2Fubm90IGJlIHNlcnZlZCcsIHtcbiAgICAgICAgICBjb2RlOiAndXBncmFkZV9mYWlsZWQnLFxuICAgICAgICAgIGRldGFpbCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUFjdGl2aXR5RG9jdW1lbnQodXBncmFkZWQuZG9jKTtcblxuICAgICAgLy8gLS0tLSBBbmFseXRpY3Mgc2lkZS1jaGFubmVsIChTNykgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIE9SREVSIElTIExPQUQtQkVBUklORzogY2Vuc3VzIEZJUlNULCBhbmQgdGhlIGNhY2hlIHJvdyBpcyB3cml0dGVuIG9ubHlcbiAgICAgIC8vIGlmIGl0IHN1Y2NlZWRlZCAocnVsaW5nIFM3LTkpLlxuICAgICAgLy9cbiAgICAgIC8vIFRoZSBjYWNoZSByb3cgaXMgd2hhdCBtYWtlcyBldmVyeSBsYXRlciByZWFkIGEgSElUIFx1MjAxNCBhbmQgYSBISVQgZG9lcyBub1xuICAgICAgLy8gYW5hbHl0aWNzIHdvcmsgYXQgYWxsLiBTbyB3cml0aW5nIHRoZSBjYWNoZSByb3cgYWZ0ZXIgYSBGQUlMRUQgY2Vuc3VzXG4gICAgICAvLyB3b3VsZCBzdHJhbmQgdGhpcyB2ZXJzaW9uIHdpdGggbm8gY2Vuc3VzIHVudGlsIHRoZSBuZXh0IFNBTklUSVpFUl9SRVZcbiAgICAgIC8vIGJ1bXAsIHdoaWxlIGV2ZXJ5IGNoZWNrIG9uIGl0IGFnZ3JlZ2F0ZWQgYXMgdW5hdHRyaWJ1dGVkLiBTaWxlbnQsIGFuZFxuICAgICAgLy8gcGVybWFuZW50LiBXaXRoaG9sZGluZyB0aGUgY2FjaGUgcm93IGluc3RlYWQgbWVhbnMgdGhlIG5leHQgcmVhZCBpc1xuICAgICAgLy8gYW5vdGhlciBtaXNzIHRoYXQgcmV0cmllcyBib3RoOiB0aGUgZmFpbHVyZSBzZWxmLWhlYWxzLCBhbmQgaXRzIG9ubHlcbiAgICAgIC8vIGNvc3QgaXMgcmVjb21wdXRpbmcgYSBkb2N1bWVudCB3ZSBhbHJlYWR5IGtub3cgaG93IHRvIHJlY29tcHV0ZS5cbiAgICAgIC8vXG4gICAgICAvLyBUaGUgY2Vuc3VzIGl0c2VsZiBpcyB0b3RhbCAobmV2ZXIgdGhyb3dzIFx1MjAxNCBzZWUgVU5LTk9XTl9DRU5TVVNfS0VZKSwgc29cbiAgICAgIC8vIHdoYXQgdGhpcyBvcmRlcmluZyBhY3R1YWxseSBndWFyZHMgYWdhaW5zdCBpcyBhIHRyYW5zaWVudCBEQiBmYWlsdXJlLFxuICAgICAgLy8gd2hpY2ggaXMgZXhhY3RseSB0aGUga2luZCB0aGF0IGEgcmV0cnkgZml4ZXMuXG4gICAgICBsZXQgY2Vuc3VzT2sgPSB0cnVlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBlcnJvcjogY2Vuc3VzRXJyIH0gPSBhd2FpdCBkYi53cml0ZUNlbnN1cyhcbiAgICAgICAgICB2ZXJzaW9uSWQsXG4gICAgICAgICAgY2Vuc3VzT2ZEb2N1bWVudCh1cGdyYWRlZC5kb2MpLFxuICAgICAgICApO1xuICAgICAgICBpZiAoY2Vuc3VzRXJyKSB7XG4gICAgICAgICAgY2Vuc3VzT2sgPSBmYWxzZTtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBjZW5zdXMgd3JpdGUgZmFpbGVkOicsIGNlbnN1c0Vycik7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjZW5zdXNPayA9IGZhbHNlO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBjZW5zdXMgdGhyZXc6JywgZXJyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNlbnN1c09rKSB7XG4gICAgICAgIGNvbnN0IHsgZXJyb3I6IHVwc2VydEVyciB9ID0gYXdhaXQgZGIudXBzZXJ0Q2FjaGUoe1xuICAgICAgICAgIHZlcnNpb25faWQ6IHZlcnNpb25JZCxcbiAgICAgICAgICBzYW5pdGl6ZXJfcmV2OiBTQU5JVElaRVJfUkVWLFxuICAgICAgICAgIHNjaGVtYV92ZXJzaW9uOiB1cGdyYWRlZC5kb2Muc2NoZW1hVmVyc2lvbixcbiAgICAgICAgICBjb250ZW50OiBzYW5pdGl6ZWQsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodXBzZXJ0RXJyKSB7XG4gICAgICAgICAgLy8gTm9uLWZhdGFsOiB0aGUgcmVzcG9uc2UgaXMgYWxyZWFkeSBjb21wdXRlZDsgdGhlIG5leHQgcmVxdWVzdFxuICAgICAgICAgIC8vIHJldHJpZXMuXG4gICAgICAgICAgY29uc29sZS5lcnJvcignW2dldC1hY3Rpdml0eV0gY2FjaGUgdXBzZXJ0IGZhaWxlZDonLCB1cHNlcnRFcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFRoaXMgdmVyc2lvbiBpcyBub3cgY2FjaGVkIHVuZGVyIHRoZSBDVVJSRU5UIHJldiwgc28gYW55IHJvdyBpdFxuICAgICAgICAgIC8vIGhhcyB1bmRlciBhbiBvbGRlciByZXYgaXMgZGVhZCB3ZWlnaHQgbm90aGluZyB3aWxsIGV2ZXIgcmVhZC5cbiAgICAgICAgICBjb25zdCB7IGVycm9yOiBnY0VyciB9ID0gYXdhaXQgZGIuZGVsZXRlU3RhbGVDYWNoZShcbiAgICAgICAgICAgIHZlcnNpb25JZCxcbiAgICAgICAgICAgIFNBTklUSVpFUl9SRVYsXG4gICAgICAgICAgKTtcbiAgICAgICAgICBpZiAoZ2NFcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIHN0YWxlLWNhY2hlIEdDIGZhaWxlZDonLCBnY0Vycik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdXNlcklkID0gand0U3ViKGF1dGhIZWFkZXIpID8/ICdhbm9ueW1vdXMnO1xuICAgIC8vIHNlcnZlU2VlZCwgaW1wb3J0ZWQgKEcxKTogdGhlIGdyYWRpbmcgc2lkZSByZWNvbXB1dGVzIHRoaXMgc3R1ZGVudCdzXG4gICAgLy8gYXJyYW5nZW1lbnQgZnJvbSB0aGUgU0FNRSBzeW1ib2wgXHUyMDE0IHR3byBzcGVsbGluZ3MgYWdyZWVpbmcgYnkgbHVjayB3YXNcbiAgICAvLyB0aGUgczIgcmV0cm8ncyBzaGFycGVzdCBzZWFtIGZpbmRpbmcuXG4gICAgY29uc3Qgc2VydmVkID0gYXBwbHlTZXJ2ZVNodWZmbGVzKHNhbml0aXplZCwgc2VydmVTZWVkKHZlcnNpb25JZCwgdXNlcklkKSk7XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxuICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBhcGlfdmVyc2lvbjogQVBJX1ZFUlNJT04sXG4gICAgICAgIGFjdGl2aXR5X2lkOiBhY3Rpdml0eUlkLFxuICAgICAgICB2ZXJzaW9uOiB7XG4gICAgICAgICAgaWQ6IHZlcnNpb25JZCxcbiAgICAgICAgICBudW06IHJvdy52ZXJzaW9uX251bSxcbiAgICAgICAgICBzY2hlbWFfdmVyc2lvbjogc2VydmVkLnNjaGVtYVZlcnNpb24sXG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlOiByb3cudGl0bGUsXG4gICAgICAgIGFjdGl2aXR5OiBzZXJ2ZWQsXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgc3RhdHVzOiAyMDAsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAuLi5jb3JzLmNvcnNIZWFkZXJzKHJlcSksXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAvLyBWZXJzaW9uLWtleWVkIFVSTCBcdTIxOTIgaW1tdXRhYmxlLiBwcml2YXRlOiBzdHVkZW50IGNvbnRlbnQgbmV2ZXIgbGFuZHNcbiAgICAgICAgICAvLyBpbiBzaGFyZWQgY2FjaGVzLiBBIHJlcHVibGlzaCBjaGFuZ2VzIHRoZSBVUkwgdmlhIHJlc29sdmUsIHNvIHRoaXNcbiAgICAgICAgICAvLyBuZXZlciBuZWVkcyB0byBleHBpcmUuXG4gICAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAncHJpdmF0ZSwgbWF4LWFnZT0zMTUzNjAwMCwgaW1tdXRhYmxlJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgKTtcbiAgfTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FB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LEVBQzlEO0FBQUEsRUFDQSxJQUFJLFNBQVM7QUFDVCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsTUFBTTtBQUFBLEVBQzdEO0FBQUEsRUFDQSxJQUFJLFdBQVc7QUFDWCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsUUFBUTtBQUFBLEVBQy9EO0FBQUEsRUFDQSxJQUFJLFNBQVM7QUFDVCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsTUFBTTtBQUFBLEVBQzdEO0FBQUEsRUFDQSxJQUFJLFVBQVU7QUFDVixXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsT0FBTztBQUFBLEVBQzlEO0FBQUEsRUFDQSxJQUFJLFNBQVM7QUFDVCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsTUFBTTtBQUFBLEVBQzdEO0FBQUEsRUFDQSxJQUFJLE9BQU87QUFDUCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsSUFBSTtBQUFBLEVBQzNEO0FBQUEsRUFDQSxJQUFJLFNBQVM7QUFDVCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsTUFBTTtBQUFBLEVBQzdEO0FBQUEsRUFDQSxJQUFJLFdBQVc7QUFDWCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsUUFBUTtBQUFBLEVBQy9EO0FBQUEsRUFDQSxJQUFJLGNBQWM7QUFFZCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsV0FBVztBQUFBLEVBQ2xFO0FBQUEsRUFDQSxJQUFJLFlBQVk7QUFDWixRQUFJLE1BQU07QUFDVixlQUFXLE1BQU0sS0FBSyxLQUFLLFFBQVE7QUFDL0IsVUFBSSxHQUFHLFNBQVMsT0FBTztBQUNuQixZQUFJLFFBQVEsUUFBUSxHQUFHLFFBQVE7QUFDM0IsZ0JBQU0sR0FBRztBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxJQUFJLFlBQVk7QUFDWixRQUFJLE1BQU07QUFDVixlQUFXLE1BQU0sS0FBSyxLQUFLLFFBQVE7QUFDL0IsVUFBSSxHQUFHLFNBQVMsT0FBTztBQUNuQixZQUFJLFFBQVEsUUFBUSxHQUFHLFFBQVE7QUFDM0IsZ0JBQU0sR0FBRztBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBQ0o7QUFDQSxVQUFVLFNBQVMsQ0FBQyxXQUFXO0FBQzNCLFNBQU8sSUFBSSxVQUFVO0FBQUEsSUFDakIsUUFBUSxDQUFDO0FBQUEsSUFDVCxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLFFBQVEsUUFBUSxVQUFVO0FBQUEsSUFDMUIsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUVBLFNBQVMsbUJBQW1CLEtBQUssTUFBTTtBQUNuQyxRQUFNLGVBQWUsSUFBSSxTQUFTLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxLQUFLLElBQUk7QUFDekQsUUFBTSxnQkFBZ0IsS0FBSyxTQUFTLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxLQUFLLElBQUk7QUFDM0QsUUFBTSxXQUFXLGNBQWMsZUFBZSxjQUFjO0FBQzVELFFBQU0sU0FBUyxPQUFPLFNBQVMsSUFBSSxRQUFRLFFBQVEsRUFBRSxRQUFRLEtBQUssRUFBRSxDQUFDO0FBQ3JFLFFBQU0sVUFBVSxPQUFPLFNBQVMsS0FBSyxRQUFRLFFBQVEsRUFBRSxRQUFRLEtBQUssRUFBRSxDQUFDO0FBQ3ZFLFNBQVEsU0FBUyxVQUFXLE1BQU07QUFDdEM7QUFDTyxJQUFNLFlBQU4sTUFBTSxtQkFBa0IsUUFBUTtBQUFBLEVBQ25DLGNBQWM7QUFDVixVQUFNLEdBQUcsU0FBUztBQUNsQixTQUFLLE1BQU0sS0FBSztBQUNoQixTQUFLLE1BQU0sS0FBSztBQUNoQixTQUFLLE9BQU8sS0FBSztBQUFBLEVBQ3JCO0FBQUEsRUFDQSxPQUFPLE9BQU87QUFDVixRQUFJLEtBQUssS0FBSyxRQUFRO0FBQ2xCLFlBQU0sT0FBTyxPQUFPLE1BQU0sSUFBSTtBQUFBLElBQ2xDO0FBQ0EsVUFBTSxhQUFhLEtBQUssU0FBUyxLQUFLO0FBQ3RDLFFBQUksZUFBZSxjQUFjLFFBQVE7QUFDckMsWUFBTUEsT0FBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ3RDLHdCQUFrQkEsTUFBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVVBLEtBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxRQUFJLE1BQU07QUFDVixVQUFNLFNBQVMsSUFBSSxZQUFZO0FBQy9CLGVBQVcsU0FBUyxLQUFLLEtBQUssUUFBUTtBQUNsQyxVQUFJLE1BQU0sU0FBUyxPQUFPO0FBQ3RCLFlBQUksQ0FBQyxLQUFLLFVBQVUsTUFBTSxJQUFJLEdBQUc7QUFDN0IsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsTUFBTSxhQUFhO0FBQUEsWUFDbkIsVUFBVTtBQUFBLFlBQ1YsVUFBVTtBQUFBLFlBQ1YsU0FBUyxNQUFNO0FBQUEsVUFDbkIsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osV0FDUyxNQUFNLFNBQVMsT0FBTztBQUMzQixjQUFNLFdBQVcsTUFBTSxZQUFZLE1BQU0sT0FBTyxNQUFNLFFBQVEsTUFBTSxRQUFRLE1BQU07QUFDbEYsWUFBSSxVQUFVO0FBQ1YsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsTUFBTSxhQUFhO0FBQUEsWUFDbkIsU0FBUyxNQUFNO0FBQUEsWUFDZixNQUFNO0FBQUEsWUFDTixXQUFXLE1BQU07QUFBQSxZQUNqQixPQUFPO0FBQUEsWUFDUCxTQUFTLE1BQU07QUFBQSxVQUNuQixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixXQUNTLE1BQU0sU0FBUyxPQUFPO0FBQzNCLGNBQU0sU0FBUyxNQUFNLFlBQVksTUFBTSxPQUFPLE1BQU0sUUFBUSxNQUFNLFFBQVEsTUFBTTtBQUNoRixZQUFJLFFBQVE7QUFDUixnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixNQUFNLGFBQWE7QUFBQSxZQUNuQixTQUFTLE1BQU07QUFBQSxZQUNmLE1BQU07QUFBQSxZQUNOLFdBQVcsTUFBTTtBQUFBLFlBQ2pCLE9BQU87QUFBQSxZQUNQLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLGNBQWM7QUFDbEMsWUFBSSxtQkFBbUIsTUFBTSxNQUFNLE1BQU0sS0FBSyxNQUFNLEdBQUc7QUFDbkQsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsTUFBTSxhQUFhO0FBQUEsWUFDbkIsWUFBWSxNQUFNO0FBQUEsWUFDbEIsU0FBUyxNQUFNO0FBQUEsVUFDbkIsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osV0FDUyxNQUFNLFNBQVMsVUFBVTtBQUM5QixZQUFJLENBQUMsT0FBTyxTQUFTLE1BQU0sSUFBSSxHQUFHO0FBQzlCLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLE9BQ0s7QUFDRCxhQUFLLFlBQVksS0FBSztBQUFBLE1BQzFCO0FBQUEsSUFDSjtBQUNBLFdBQU8sRUFBRSxRQUFRLE9BQU8sT0FBTyxPQUFPLE1BQU0sS0FBSztBQUFBLEVBQ3JEO0FBQUEsRUFDQSxJQUFJLE9BQU8sU0FBUztBQUNoQixXQUFPLEtBQUssU0FBUyxPQUFPLE9BQU8sTUFBTSxVQUFVLFNBQVMsT0FBTyxDQUFDO0FBQUEsRUFDeEU7QUFBQSxFQUNBLEdBQUcsT0FBTyxTQUFTO0FBQ2YsV0FBTyxLQUFLLFNBQVMsT0FBTyxPQUFPLE9BQU8sVUFBVSxTQUFTLE9BQU8sQ0FBQztBQUFBLEVBQ3pFO0FBQUEsRUFDQSxJQUFJLE9BQU8sU0FBUztBQUNoQixXQUFPLEtBQUssU0FBUyxPQUFPLE9BQU8sTUFBTSxVQUFVLFNBQVMsT0FBTyxDQUFDO0FBQUEsRUFDeEU7QUFBQSxFQUNBLEdBQUcsT0FBTyxTQUFTO0FBQ2YsV0FBTyxLQUFLLFNBQVMsT0FBTyxPQUFPLE9BQU8sVUFBVSxTQUFTLE9BQU8sQ0FBQztBQUFBLEVBQ3pFO0FBQUEsRUFDQSxTQUFTLE1BQU0sT0FBTyxXQUFXLFNBQVM7QUFDdEMsV0FBTyxJQUFJLFdBQVU7QUFBQSxNQUNqQixHQUFHLEtBQUs7QUFBQSxNQUNSLFFBQVE7QUFBQSxRQUNKLEdBQUcsS0FBSyxLQUFLO0FBQUEsUUFDYjtBQUFBLFVBQ0k7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0EsU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLFFBQ3ZDO0FBQUEsTUFDSjtBQUFBLElBQ0osQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFVBQVUsT0FBTztBQUNiLFdBQU8sSUFBSSxXQUFVO0FBQUEsTUFDakIsR0FBRyxLQUFLO0FBQUEsTUFDUixRQUFRLENBQUMsR0FBRyxLQUFLLEtBQUssUUFBUSxLQUFLO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLElBQUksU0FBUztBQUNULFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ04sU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxTQUFTLFNBQVM7QUFDZCxXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxNQUNQLFdBQVc7QUFBQSxNQUNYLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsU0FBUyxTQUFTO0FBQ2QsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsTUFDUCxXQUFXO0FBQUEsTUFDWCxTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFlBQVksU0FBUztBQUNqQixXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxNQUNQLFdBQVc7QUFBQSxNQUNYLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsWUFBWSxTQUFTO0FBQ2pCLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLE1BQ1AsV0FBVztBQUFBLE1BQ1gsU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxXQUFXLE9BQU8sU0FBUztBQUN2QixXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOO0FBQUEsTUFDQSxTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLE9BQU8sU0FBUztBQUNaLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ04sU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxLQUFLLFNBQVM7QUFDVixXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOLFdBQVc7QUFBQSxNQUNYLE9BQU8sT0FBTztBQUFBLE1BQ2QsU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ3ZDLENBQUMsRUFBRSxVQUFVO0FBQUEsTUFDVCxNQUFNO0FBQUEsTUFDTixXQUFXO0FBQUEsTUFDWCxPQUFPLE9BQU87QUFBQSxNQUNkLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsSUFBSSxXQUFXO0FBQ1gsUUFBSSxNQUFNO0FBQ1YsZUFBVyxNQUFNLEtBQUssS0FBSyxRQUFRO0FBQy9CLFVBQUksR0FBRyxTQUFTLE9BQU87QUFDbkIsWUFBSSxRQUFRLFFBQVEsR0FBRyxRQUFRO0FBQzNCLGdCQUFNLEdBQUc7QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsSUFBSSxXQUFXO0FBQ1gsUUFBSSxNQUFNO0FBQ1YsZUFBVyxNQUFNLEtBQUssS0FBSyxRQUFRO0FBQy9CLFVBQUksR0FBRyxTQUFTLE9BQU87QUFDbkIsWUFBSSxRQUFRLFFBQVEsR0FBRyxRQUFRO0FBQzNCLGdCQUFNLEdBQUc7QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsSUFBSSxRQUFRO0FBQ1IsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLFNBQVUsR0FBRyxTQUFTLGdCQUFnQixLQUFLLFVBQVUsR0FBRyxLQUFLLENBQUU7QUFBQSxFQUN0SDtBQUFBLEVBQ0EsSUFBSSxXQUFXO0FBQ1gsUUFBSSxNQUFNO0FBQ1YsUUFBSSxNQUFNO0FBQ1YsZUFBVyxNQUFNLEtBQUssS0FBSyxRQUFRO0FBQy9CLFVBQUksR0FBRyxTQUFTLFlBQVksR0FBRyxTQUFTLFNBQVMsR0FBRyxTQUFTLGNBQWM7QUFDdkUsZUFBTztBQUFBLE1BQ1gsV0FDUyxHQUFHLFNBQVMsT0FBTztBQUN4QixZQUFJLFFBQVEsUUFBUSxHQUFHLFFBQVE7QUFDM0IsZ0JBQU0sR0FBRztBQUFBLE1BQ2pCLFdBQ1MsR0FBRyxTQUFTLE9BQU87QUFDeEIsWUFBSSxRQUFRLFFBQVEsR0FBRyxRQUFRO0FBQzNCLGdCQUFNLEdBQUc7QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFDQSxXQUFPLE9BQU8sU0FBUyxHQUFHLEtBQUssT0FBTyxTQUFTLEdBQUc7QUFBQSxFQUN0RDtBQUNKO0FBQ0EsVUFBVSxTQUFTLENBQUMsV0FBVztBQUMzQixTQUFPLElBQUksVUFBVTtBQUFBLElBQ2pCLFFBQVEsQ0FBQztBQUFBLElBQ1QsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxRQUFRLFFBQVEsVUFBVTtBQUFBLElBQzFCLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLFlBQU4sTUFBTSxtQkFBa0IsUUFBUTtBQUFBLEVBQ25DLGNBQWM7QUFDVixVQUFNLEdBQUcsU0FBUztBQUNsQixTQUFLLE1BQU0sS0FBSztBQUNoQixTQUFLLE1BQU0sS0FBSztBQUFBLEVBQ3BCO0FBQUEsRUFDQSxPQUFPLE9BQU87QUFDVixRQUFJLEtBQUssS0FBSyxRQUFRO0FBQ2xCLFVBQUk7QUFDQSxjQUFNLE9BQU8sT0FBTyxNQUFNLElBQUk7QUFBQSxNQUNsQyxRQUNNO0FBQ0YsZUFBTyxLQUFLLGlCQUFpQixLQUFLO0FBQUEsTUFDdEM7QUFBQSxJQUNKO0FBQ0EsVUFBTSxhQUFhLEtBQUssU0FBUyxLQUFLO0FBQ3RDLFFBQUksZUFBZSxjQUFjLFFBQVE7QUFDckMsYUFBTyxLQUFLLGlCQUFpQixLQUFLO0FBQUEsSUFDdEM7QUFDQSxRQUFJLE1BQU07QUFDVixVQUFNLFNBQVMsSUFBSSxZQUFZO0FBQy9CLGVBQVcsU0FBUyxLQUFLLEtBQUssUUFBUTtBQUNsQyxVQUFJLE1BQU0sU0FBUyxPQUFPO0FBQ3RCLGNBQU0sV0FBVyxNQUFNLFlBQVksTUFBTSxPQUFPLE1BQU0sUUFBUSxNQUFNLFFBQVEsTUFBTTtBQUNsRixZQUFJLFVBQVU7QUFDVixnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixNQUFNLGFBQWE7QUFBQSxZQUNuQixNQUFNO0FBQUEsWUFDTixTQUFTLE1BQU07QUFBQSxZQUNmLFdBQVcsTUFBTTtBQUFBLFlBQ2pCLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLE9BQU87QUFDM0IsY0FBTSxTQUFTLE1BQU0sWUFBWSxNQUFNLE9BQU8sTUFBTSxRQUFRLE1BQU0sUUFBUSxNQUFNO0FBQ2hGLFlBQUksUUFBUTtBQUNSLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLE1BQU0sYUFBYTtBQUFBLFlBQ25CLE1BQU07QUFBQSxZQUNOLFNBQVMsTUFBTTtBQUFBLFlBQ2YsV0FBVyxNQUFNO0FBQUEsWUFDakIsU0FBUyxNQUFNO0FBQUEsVUFDbkIsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osV0FDUyxNQUFNLFNBQVMsY0FBYztBQUNsQyxZQUFJLE1BQU0sT0FBTyxNQUFNLFVBQVUsT0FBTyxDQUFDLEdBQUc7QUFDeEMsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsTUFBTSxhQUFhO0FBQUEsWUFDbkIsWUFBWSxNQUFNO0FBQUEsWUFDbEIsU0FBUyxNQUFNO0FBQUEsVUFDbkIsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osT0FDSztBQUNELGFBQUssWUFBWSxLQUFLO0FBQUEsTUFDMUI7QUFBQSxJQUNKO0FBQ0EsV0FBTyxFQUFFLFFBQVEsT0FBTyxPQUFPLE9BQU8sTUFBTSxLQUFLO0FBQUEsRUFDckQ7QUFBQSxFQUNBLGlCQUFpQixPQUFPO0FBQ3BCLFVBQU0sTUFBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ3RDLHNCQUFrQixLQUFLO0FBQUEsTUFDbkIsTUFBTSxhQUFhO0FBQUEsTUFDbkIsVUFBVSxjQUFjO0FBQUEsTUFDeEIsVUFBVSxJQUFJO0FBQUEsSUFDbEIsQ0FBQztBQUNELFdBQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxJQUFJLE9BQU8sU0FBUztBQUNoQixXQUFPLEtBQUssU0FBUyxPQUFPLE9BQU8sTUFBTSxVQUFVLFNBQVMsT0FBTyxDQUFDO0FBQUEsRUFDeEU7QUFBQSxFQUNBLEdBQUcsT0FBTyxTQUFTO0FBQ2YsV0FBTyxLQUFLLFNBQVMsT0FBTyxPQUFPLE9BQU8sVUFBVSxTQUFTLE9BQU8sQ0FBQztBQUFBLEVBQ3pFO0FBQUEsRUFDQSxJQUFJLE9BQU8sU0FBUztBQUNoQixXQUFPLEtBQUssU0FBUyxPQUFPLE9BQU8sTUFBTSxVQUFVLFNBQVMsT0FBTyxDQUFDO0FBQUEsRUFDeEU7QUFBQSxFQUNBLEdBQUcsT0FBTyxTQUFTO0FBQ2YsV0FBTyxLQUFLLFNBQVMsT0FBTyxPQUFPLE9BQU8sVUFBVSxTQUFTLE9BQU8sQ0FBQztBQUFBLEVBQ3pFO0FBQUEsRUFDQSxTQUFTLE1BQU0sT0FBTyxXQUFXLFNBQVM7QUFDdEMsV0FBTyxJQUFJLFdBQVU7QUFBQSxNQUNqQixHQUFHLEtBQUs7QUFBQSxNQUNSLFFBQVE7QUFBQSxRQUNKLEdBQUcsS0FBSyxLQUFLO0FBQUEsUUFDYjtBQUFBLFVBQ0k7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0EsU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLFFBQ3ZDO0FBQUEsTUFDSjtBQUFBLElBQ0osQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFVBQVUsT0FBTztBQUNiLFdBQU8sSUFBSSxXQUFVO0FBQUEsTUFDakIsR0FBRyxLQUFLO0FBQUEsTUFDUixRQUFRLENBQUMsR0FBRyxLQUFLLEtBQUssUUFBUSxLQUFLO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFNBQVMsU0FBUztBQUNkLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ04sT0FBTyxPQUFPLENBQUM7QUFBQSxNQUNmLFdBQVc7QUFBQSxNQUNYLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsU0FBUyxTQUFTO0FBQ2QsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixPQUFPLE9BQU8sQ0FBQztBQUFBLE1BQ2YsV0FBVztBQUFBLE1BQ1gsU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxZQUFZLFNBQVM7QUFDakIsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixPQUFPLE9BQU8sQ0FBQztBQUFBLE1BQ2YsV0FBVztBQUFBLE1BQ1gsU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxZQUFZLFNBQVM7QUFDakIsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixPQUFPLE9BQU8sQ0FBQztBQUFBLE1BQ2YsV0FBVztBQUFBLE1BQ1gsU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxXQUFXLE9BQU8sU0FBUztBQUN2QixXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOO0FBQUEsTUFDQSxTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLElBQUksV0FBVztBQUNYLFFBQUksTUFBTTtBQUNWLGVBQVcsTUFBTSxLQUFLLEtBQUssUUFBUTtBQUMvQixVQUFJLEdBQUcsU0FBUyxPQUFPO0FBQ25CLFlBQUksUUFBUSxRQUFRLEdBQUcsUUFBUTtBQUMzQixnQkFBTSxHQUFHO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUNBLElBQUksV0FBVztBQUNYLFFBQUksTUFBTTtBQUNWLGVBQVcsTUFBTSxLQUFLLEtBQUssUUFBUTtBQUMvQixVQUFJLEdBQUcsU0FBUyxPQUFPO0FBQ25CLFlBQUksUUFBUSxRQUFRLEdBQUcsUUFBUTtBQUMzQixnQkFBTSxHQUFHO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFDSjtBQUNBLFVBQVUsU0FBUyxDQUFDLFdBQVc7QUFDM0IsU0FBTyxJQUFJLFVBQVU7QUFBQSxJQUNqQixRQUFRLENBQUM7QUFBQSxJQUNULFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsUUFBUSxRQUFRLFVBQVU7QUFBQSxJQUMxQixHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxhQUFOLGNBQXlCLFFBQVE7QUFBQSxFQUNwQyxPQUFPLE9BQU87QUFDVixRQUFJLEtBQUssS0FBSyxRQUFRO0FBQ2xCLFlBQU0sT0FBTyxRQUFRLE1BQU0sSUFBSTtBQUFBLElBQ25DO0FBQ0EsVUFBTSxhQUFhLEtBQUssU0FBUyxLQUFLO0FBQ3RDLFFBQUksZUFBZSxjQUFjLFNBQVM7QUFDdEMsWUFBTSxNQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDdEMsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVLElBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxXQUFPLEdBQUcsTUFBTSxJQUFJO0FBQUEsRUFDeEI7QUFDSjtBQUNBLFdBQVcsU0FBUyxDQUFDLFdBQVc7QUFDNUIsU0FBTyxJQUFJLFdBQVc7QUFBQSxJQUNsQixVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLFFBQVEsUUFBUSxVQUFVO0FBQUEsSUFDMUIsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sVUFBTixNQUFNLGlCQUFnQixRQUFRO0FBQUEsRUFDakMsT0FBTyxPQUFPO0FBQ1YsUUFBSSxLQUFLLEtBQUssUUFBUTtBQUNsQixZQUFNLE9BQU8sSUFBSSxLQUFLLE1BQU0sSUFBSTtBQUFBLElBQ3BDO0FBQ0EsVUFBTSxhQUFhLEtBQUssU0FBUyxLQUFLO0FBQ3RDLFFBQUksZUFBZSxjQUFjLE1BQU07QUFDbkMsWUFBTUEsT0FBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ3RDLHdCQUFrQkEsTUFBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVVBLEtBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxRQUFJLE9BQU8sTUFBTSxNQUFNLEtBQUssUUFBUSxDQUFDLEdBQUc7QUFDcEMsWUFBTUEsT0FBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ3RDLHdCQUFrQkEsTUFBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLE1BQ3ZCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFVBQU0sU0FBUyxJQUFJLFlBQVk7QUFDL0IsUUFBSSxNQUFNO0FBQ1YsZUFBVyxTQUFTLEtBQUssS0FBSyxRQUFRO0FBQ2xDLFVBQUksTUFBTSxTQUFTLE9BQU87QUFDdEIsWUFBSSxNQUFNLEtBQUssUUFBUSxJQUFJLE1BQU0sT0FBTztBQUNwQyxnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixNQUFNLGFBQWE7QUFBQSxZQUNuQixTQUFTLE1BQU07QUFBQSxZQUNmLFdBQVc7QUFBQSxZQUNYLE9BQU87QUFBQSxZQUNQLFNBQVMsTUFBTTtBQUFBLFlBQ2YsTUFBTTtBQUFBLFVBQ1YsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osV0FDUyxNQUFNLFNBQVMsT0FBTztBQUMzQixZQUFJLE1BQU0sS0FBSyxRQUFRLElBQUksTUFBTSxPQUFPO0FBQ3BDLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFNBQVMsTUFBTTtBQUFBLFlBQ2YsV0FBVztBQUFBLFlBQ1gsT0FBTztBQUFBLFlBQ1AsU0FBUyxNQUFNO0FBQUEsWUFDZixNQUFNO0FBQUEsVUFDVixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixPQUNLO0FBQ0QsYUFBSyxZQUFZLEtBQUs7QUFBQSxNQUMxQjtBQUFBLElBQ0o7QUFDQSxXQUFPO0FBQUEsTUFDSCxRQUFRLE9BQU87QUFBQSxNQUNmLE9BQU8sSUFBSSxLQUFLLE1BQU0sS0FBSyxRQUFRLENBQUM7QUFBQSxJQUN4QztBQUFBLEVBQ0o7QUFBQSxFQUNBLFVBQVUsT0FBTztBQUNiLFdBQU8sSUFBSSxTQUFRO0FBQUEsTUFDZixHQUFHLEtBQUs7QUFBQSxNQUNSLFFBQVEsQ0FBQyxHQUFHLEtBQUssS0FBSyxRQUFRLEtBQUs7QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsSUFBSSxTQUFTLFNBQVM7QUFDbEIsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixPQUFPLFFBQVEsUUFBUTtBQUFBLE1BQ3ZCLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsSUFBSSxTQUFTLFNBQVM7QUFDbEIsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixPQUFPLFFBQVEsUUFBUTtBQUFBLE1BQ3ZCLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsSUFBSSxVQUFVO0FBQ1YsUUFBSSxNQUFNO0FBQ1YsZUFBVyxNQUFNLEtBQUssS0FBSyxRQUFRO0FBQy9CLFVBQUksR0FBRyxTQUFTLE9BQU87QUFDbkIsWUFBSSxRQUFRLFFBQVEsR0FBRyxRQUFRO0FBQzNCLGdCQUFNLEdBQUc7QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFDQSxXQUFPLE9BQU8sT0FBTyxJQUFJLEtBQUssR0FBRyxJQUFJO0FBQUEsRUFDekM7QUFBQSxFQUNBLElBQUksVUFBVTtBQUNWLFFBQUksTUFBTTtBQUNWLGVBQVcsTUFBTSxLQUFLLEtBQUssUUFBUTtBQUMvQixVQUFJLEdBQUcsU0FBUyxPQUFPO0FBQ25CLFlBQUksUUFBUSxRQUFRLEdBQUcsUUFBUTtBQUMzQixnQkFBTSxHQUFHO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQ0EsV0FBTyxPQUFPLE9BQU8sSUFBSSxLQUFLLEdBQUcsSUFBSTtBQUFBLEVBQ3pDO0FBQ0o7QUFDQSxRQUFRLFNBQVMsQ0FBQyxXQUFXO0FBQ3pCLFNBQU8sSUFBSSxRQUFRO0FBQUEsSUFDZixRQUFRLENBQUM7QUFBQSxJQUNULFFBQVEsUUFBUSxVQUFVO0FBQUEsSUFDMUIsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxZQUFOLGNBQXdCLFFBQVE7QUFBQSxFQUNuQyxPQUFPLE9BQU87QUFDVixVQUFNLGFBQWEsS0FBSyxTQUFTLEtBQUs7QUFDdEMsUUFBSSxlQUFlLGNBQWMsUUFBUTtBQUNyQyxZQUFNLE1BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0Qyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVUsSUFBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFdBQU8sR0FBRyxNQUFNLElBQUk7QUFBQSxFQUN4QjtBQUNKO0FBQ0EsVUFBVSxTQUFTLENBQUMsV0FBVztBQUMzQixTQUFPLElBQUksVUFBVTtBQUFBLElBQ2pCLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sZUFBTixjQUEyQixRQUFRO0FBQUEsRUFDdEMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxhQUFhLEtBQUssU0FBUyxLQUFLO0FBQ3RDLFFBQUksZUFBZSxjQUFjLFdBQVc7QUFDeEMsWUFBTSxNQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDdEMsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVLElBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxXQUFPLEdBQUcsTUFBTSxJQUFJO0FBQUEsRUFDeEI7QUFDSjtBQUNBLGFBQWEsU0FBUyxDQUFDLFdBQVc7QUFDOUIsU0FBTyxJQUFJLGFBQWE7QUFBQSxJQUNwQixVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLFVBQU4sY0FBc0IsUUFBUTtBQUFBLEVBQ2pDLE9BQU8sT0FBTztBQUNWLFVBQU0sYUFBYSxLQUFLLFNBQVMsS0FBSztBQUN0QyxRQUFJLGVBQWUsY0FBYyxNQUFNO0FBQ25DLFlBQU0sTUFBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ3RDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVSxJQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsV0FBTyxHQUFHLE1BQU0sSUFBSTtBQUFBLEVBQ3hCO0FBQ0o7QUFDQSxRQUFRLFNBQVMsQ0FBQyxXQUFXO0FBQ3pCLFNBQU8sSUFBSSxRQUFRO0FBQUEsSUFDZixVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLFNBQU4sY0FBcUIsUUFBUTtBQUFBLEVBQ2hDLGNBQWM7QUFDVixVQUFNLEdBQUcsU0FBUztBQUVsQixTQUFLLE9BQU87QUFBQSxFQUNoQjtBQUFBLEVBQ0EsT0FBTyxPQUFPO0FBQ1YsV0FBTyxHQUFHLE1BQU0sSUFBSTtBQUFBLEVBQ3hCO0FBQ0o7QUFDQSxPQUFPLFNBQVMsQ0FBQyxXQUFXO0FBQ3hCLFNBQU8sSUFBSSxPQUFPO0FBQUEsSUFDZCxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLGFBQU4sY0FBeUIsUUFBUTtBQUFBLEVBQ3BDLGNBQWM7QUFDVixVQUFNLEdBQUcsU0FBUztBQUVsQixTQUFLLFdBQVc7QUFBQSxFQUNwQjtBQUFBLEVBQ0EsT0FBTyxPQUFPO0FBQ1YsV0FBTyxHQUFHLE1BQU0sSUFBSTtBQUFBLEVBQ3hCO0FBQ0o7QUFDQSxXQUFXLFNBQVMsQ0FBQyxXQUFXO0FBQzVCLFNBQU8sSUFBSSxXQUFXO0FBQUEsSUFDbEIsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxXQUFOLGNBQXVCLFFBQVE7QUFBQSxFQUNsQyxPQUFPLE9BQU87QUFDVixVQUFNLE1BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0QyxzQkFBa0IsS0FBSztBQUFBLE1BQ25CLE1BQU0sYUFBYTtBQUFBLE1BQ25CLFVBQVUsY0FBYztBQUFBLE1BQ3hCLFVBQVUsSUFBSTtBQUFBLElBQ2xCLENBQUM7QUFDRCxXQUFPO0FBQUEsRUFDWDtBQUNKO0FBQ0EsU0FBUyxTQUFTLENBQUMsV0FBVztBQUMxQixTQUFPLElBQUksU0FBUztBQUFBLElBQ2hCLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sVUFBTixjQUFzQixRQUFRO0FBQUEsRUFDakMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxhQUFhLEtBQUssU0FBUyxLQUFLO0FBQ3RDLFFBQUksZUFBZSxjQUFjLFdBQVc7QUFDeEMsWUFBTSxNQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDdEMsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVLElBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxXQUFPLEdBQUcsTUFBTSxJQUFJO0FBQUEsRUFDeEI7QUFDSjtBQUNBLFFBQVEsU0FBUyxDQUFDLFdBQVc7QUFDekIsU0FBTyxJQUFJLFFBQVE7QUFBQSxJQUNmLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sV0FBTixNQUFNLGtCQUFpQixRQUFRO0FBQUEsRUFDbEMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxFQUFFLEtBQUssT0FBTyxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFDdEQsVUFBTSxNQUFNLEtBQUs7QUFDakIsUUFBSSxJQUFJLGVBQWUsY0FBYyxPQUFPO0FBQ3hDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVSxJQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsUUFBSSxJQUFJLGdCQUFnQixNQUFNO0FBQzFCLFlBQU0sU0FBUyxJQUFJLEtBQUssU0FBUyxJQUFJLFlBQVk7QUFDakQsWUFBTSxXQUFXLElBQUksS0FBSyxTQUFTLElBQUksWUFBWTtBQUNuRCxVQUFJLFVBQVUsVUFBVTtBQUNwQiwwQkFBa0IsS0FBSztBQUFBLFVBQ25CLE1BQU0sU0FBUyxhQUFhLFVBQVUsYUFBYTtBQUFBLFVBQ25ELFNBQVUsV0FBVyxJQUFJLFlBQVksUUFBUTtBQUFBLFVBQzdDLFNBQVUsU0FBUyxJQUFJLFlBQVksUUFBUTtBQUFBLFVBQzNDLE1BQU07QUFBQSxVQUNOLFdBQVc7QUFBQSxVQUNYLE9BQU87QUFBQSxVQUNQLFNBQVMsSUFBSSxZQUFZO0FBQUEsUUFDN0IsQ0FBQztBQUNELGVBQU8sTUFBTTtBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUNBLFFBQUksSUFBSSxjQUFjLE1BQU07QUFDeEIsVUFBSSxJQUFJLEtBQUssU0FBUyxJQUFJLFVBQVUsT0FBTztBQUN2QywwQkFBa0IsS0FBSztBQUFBLFVBQ25CLE1BQU0sYUFBYTtBQUFBLFVBQ25CLFNBQVMsSUFBSSxVQUFVO0FBQUEsVUFDdkIsTUFBTTtBQUFBLFVBQ04sV0FBVztBQUFBLFVBQ1gsT0FBTztBQUFBLFVBQ1AsU0FBUyxJQUFJLFVBQVU7QUFBQSxRQUMzQixDQUFDO0FBQ0QsZUFBTyxNQUFNO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQ0EsUUFBSSxJQUFJLGNBQWMsTUFBTTtBQUN4QixVQUFJLElBQUksS0FBSyxTQUFTLElBQUksVUFBVSxPQUFPO0FBQ3ZDLDBCQUFrQixLQUFLO0FBQUEsVUFDbkIsTUFBTSxhQUFhO0FBQUEsVUFDbkIsU0FBUyxJQUFJLFVBQVU7QUFBQSxVQUN2QixNQUFNO0FBQUEsVUFDTixXQUFXO0FBQUEsVUFDWCxPQUFPO0FBQUEsVUFDUCxTQUFTLElBQUksVUFBVTtBQUFBLFFBQzNCLENBQUM7QUFDRCxlQUFPLE1BQU07QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFDQSxRQUFJLElBQUksT0FBTyxPQUFPO0FBQ2xCLGFBQU8sUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxNQUFNO0FBQzlDLGVBQU8sSUFBSSxLQUFLLFlBQVksSUFBSSxtQkFBbUIsS0FBSyxNQUFNLElBQUksTUFBTSxDQUFDLENBQUM7QUFBQSxNQUM5RSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUNDLFlBQVc7QUFDakIsZUFBTyxZQUFZLFdBQVcsUUFBUUEsT0FBTTtBQUFBLE1BQ2hELENBQUM7QUFBQSxJQUNMO0FBQ0EsVUFBTSxTQUFTLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxNQUFNO0FBQzFDLGFBQU8sSUFBSSxLQUFLLFdBQVcsSUFBSSxtQkFBbUIsS0FBSyxNQUFNLElBQUksTUFBTSxDQUFDLENBQUM7QUFBQSxJQUM3RSxDQUFDO0FBQ0QsV0FBTyxZQUFZLFdBQVcsUUFBUSxNQUFNO0FBQUEsRUFDaEQ7QUFBQSxFQUNBLElBQUksVUFBVTtBQUNWLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFBQSxFQUNBLElBQUksV0FBVyxTQUFTO0FBQ3BCLFdBQU8sSUFBSSxVQUFTO0FBQUEsTUFDaEIsR0FBRyxLQUFLO0FBQUEsTUFDUixXQUFXLEVBQUUsT0FBTyxXQUFXLFNBQVMsVUFBVSxTQUFTLE9BQU8sRUFBRTtBQUFBLElBQ3hFLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxJQUFJLFdBQVcsU0FBUztBQUNwQixXQUFPLElBQUksVUFBUztBQUFBLE1BQ2hCLEdBQUcsS0FBSztBQUFBLE1BQ1IsV0FBVyxFQUFFLE9BQU8sV0FBVyxTQUFTLFVBQVUsU0FBUyxPQUFPLEVBQUU7QUFBQSxJQUN4RSxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsT0FBTyxLQUFLLFNBQVM7QUFDakIsV0FBTyxJQUFJLFVBQVM7QUFBQSxNQUNoQixHQUFHLEtBQUs7QUFBQSxNQUNSLGFBQWEsRUFBRSxPQUFPLEtBQUssU0FBUyxVQUFVLFNBQVMsT0FBTyxFQUFFO0FBQUEsSUFDcEUsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFNBQVMsU0FBUztBQUNkLFdBQU8sS0FBSyxJQUFJLEdBQUcsT0FBTztBQUFBLEVBQzlCO0FBQ0o7QUFDQSxTQUFTLFNBQVMsQ0FBQyxRQUFRLFdBQVc7QUFDbEMsU0FBTyxJQUFJLFNBQVM7QUFBQSxJQUNoQixNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsSUFDYixVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDQSxTQUFTLGVBQWUsUUFBUTtBQUM1QixNQUFJLGtCQUFrQixXQUFXO0FBQzdCLFVBQU0sV0FBVyxDQUFDO0FBQ2xCLGVBQVcsT0FBTyxPQUFPLE9BQU87QUFDNUIsWUFBTSxjQUFjLE9BQU8sTUFBTSxHQUFHO0FBQ3BDLGVBQVMsR0FBRyxJQUFJLFlBQVksT0FBTyxlQUFlLFdBQVcsQ0FBQztBQUFBLElBQ2xFO0FBQ0EsV0FBTyxJQUFJLFVBQVU7QUFBQSxNQUNqQixHQUFHLE9BQU87QUFBQSxNQUNWLE9BQU8sTUFBTTtBQUFBLElBQ2pCLENBQUM7QUFBQSxFQUNMLFdBQ1Msa0JBQWtCLFVBQVU7QUFDakMsV0FBTyxJQUFJLFNBQVM7QUFBQSxNQUNoQixHQUFHLE9BQU87QUFBQSxNQUNWLE1BQU0sZUFBZSxPQUFPLE9BQU87QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTCxXQUNTLGtCQUFrQixhQUFhO0FBQ3BDLFdBQU8sWUFBWSxPQUFPLGVBQWUsT0FBTyxPQUFPLENBQUMsQ0FBQztBQUFBLEVBQzdELFdBQ1Msa0JBQWtCLGFBQWE7QUFDcEMsV0FBTyxZQUFZLE9BQU8sZUFBZSxPQUFPLE9BQU8sQ0FBQyxDQUFDO0FBQUEsRUFDN0QsV0FDUyxrQkFBa0IsVUFBVTtBQUNqQyxXQUFPLFNBQVMsT0FBTyxPQUFPLE1BQU0sSUFBSSxDQUFDLFNBQVMsZUFBZSxJQUFJLENBQUMsQ0FBQztBQUFBLEVBQzNFLE9BQ0s7QUFDRCxXQUFPO0FBQUEsRUFDWDtBQUNKO0FBQ08sSUFBTSxZQUFOLE1BQU0sbUJBQWtCLFFBQVE7QUFBQSxFQUNuQyxjQUFjO0FBQ1YsVUFBTSxHQUFHLFNBQVM7QUFDbEIsU0FBSyxVQUFVO0FBS2YsU0FBSyxZQUFZLEtBQUs7QUFxQ3RCLFNBQUssVUFBVSxLQUFLO0FBQUEsRUFDeEI7QUFBQSxFQUNBLGFBQWE7QUFDVCxRQUFJLEtBQUssWUFBWTtBQUNqQixhQUFPLEtBQUs7QUFDaEIsVUFBTSxRQUFRLEtBQUssS0FBSyxNQUFNO0FBQzlCLFVBQU0sT0FBTyxLQUFLLFdBQVcsS0FBSztBQUNsQyxTQUFLLFVBQVUsRUFBRSxPQUFPLEtBQUs7QUFDN0IsV0FBTyxLQUFLO0FBQUEsRUFDaEI7QUFBQSxFQUNBLE9BQU8sT0FBTztBQUNWLFVBQU0sYUFBYSxLQUFLLFNBQVMsS0FBSztBQUN0QyxRQUFJLGVBQWUsY0FBYyxRQUFRO0FBQ3JDLFlBQU1ELE9BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0Qyx3QkFBa0JBLE1BQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVQSxLQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsVUFBTSxFQUFFLFFBQVEsSUFBSSxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFDdEQsVUFBTSxFQUFFLE9BQU8sTUFBTSxVQUFVLElBQUksS0FBSyxXQUFXO0FBQ25ELFVBQU0sWUFBWSxDQUFDO0FBQ25CLFFBQUksRUFBRSxLQUFLLEtBQUssb0JBQW9CLFlBQVksS0FBSyxLQUFLLGdCQUFnQixVQUFVO0FBQ2hGLGlCQUFXLE9BQU8sSUFBSSxNQUFNO0FBQ3hCLFlBQUksQ0FBQyxVQUFVLFNBQVMsR0FBRyxHQUFHO0FBQzFCLG9CQUFVLEtBQUssR0FBRztBQUFBLFFBQ3RCO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFDQSxVQUFNLFFBQVEsQ0FBQztBQUNmLGVBQVcsT0FBTyxXQUFXO0FBQ3pCLFlBQU0sZUFBZSxNQUFNLEdBQUc7QUFDOUIsWUFBTSxRQUFRLElBQUksS0FBSyxHQUFHO0FBQzFCLFlBQU0sS0FBSztBQUFBLFFBQ1AsS0FBSyxFQUFFLFFBQVEsU0FBUyxPQUFPLElBQUk7QUFBQSxRQUNuQyxPQUFPLGFBQWEsT0FBTyxJQUFJLG1CQUFtQixLQUFLLE9BQU8sSUFBSSxNQUFNLEdBQUcsQ0FBQztBQUFBLFFBQzVFLFdBQVcsT0FBTyxJQUFJO0FBQUEsTUFDMUIsQ0FBQztBQUFBLElBQ0w7QUFDQSxRQUFJLEtBQUssS0FBSyxvQkFBb0IsVUFBVTtBQUN4QyxZQUFNLGNBQWMsS0FBSyxLQUFLO0FBQzlCLFVBQUksZ0JBQWdCLGVBQWU7QUFDL0IsbUJBQVcsT0FBTyxXQUFXO0FBQ3pCLGdCQUFNLEtBQUs7QUFBQSxZQUNQLEtBQUssRUFBRSxRQUFRLFNBQVMsT0FBTyxJQUFJO0FBQUEsWUFDbkMsT0FBTyxFQUFFLFFBQVEsU0FBUyxPQUFPLElBQUksS0FBSyxHQUFHLEVBQUU7QUFBQSxVQUNuRCxDQUFDO0FBQUEsUUFDTDtBQUFBLE1BQ0osV0FDUyxnQkFBZ0IsVUFBVTtBQUMvQixZQUFJLFVBQVUsU0FBUyxHQUFHO0FBQ3RCLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsTUFBTSxhQUFhO0FBQUEsWUFDbkIsTUFBTTtBQUFBLFVBQ1YsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osV0FDUyxnQkFBZ0IsU0FBUztBQUFBLE1BQ2xDLE9BQ0s7QUFDRCxjQUFNLElBQUksTUFBTSxzREFBc0Q7QUFBQSxNQUMxRTtBQUFBLElBQ0osT0FDSztBQUVELFlBQU0sV0FBVyxLQUFLLEtBQUs7QUFDM0IsaUJBQVcsT0FBTyxXQUFXO0FBQ3pCLGNBQU0sUUFBUSxJQUFJLEtBQUssR0FBRztBQUMxQixjQUFNLEtBQUs7QUFBQSxVQUNQLEtBQUssRUFBRSxRQUFRLFNBQVMsT0FBTyxJQUFJO0FBQUEsVUFDbkMsT0FBTyxTQUFTO0FBQUEsWUFBTyxJQUFJLG1CQUFtQixLQUFLLE9BQU8sSUFBSSxNQUFNLEdBQUc7QUFBQTtBQUFBLFVBQ3ZFO0FBQUEsVUFDQSxXQUFXLE9BQU8sSUFBSTtBQUFBLFFBQzFCLENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSjtBQUNBLFFBQUksSUFBSSxPQUFPLE9BQU87QUFDbEIsYUFBTyxRQUFRLFFBQVEsRUFDbEIsS0FBSyxZQUFZO0FBQ2xCLGNBQU0sWUFBWSxDQUFDO0FBQ25CLG1CQUFXLFFBQVEsT0FBTztBQUN0QixnQkFBTSxNQUFNLE1BQU0sS0FBSztBQUN2QixnQkFBTSxRQUFRLE1BQU0sS0FBSztBQUN6QixvQkFBVSxLQUFLO0FBQUEsWUFDWDtBQUFBLFlBQ0E7QUFBQSxZQUNBLFdBQVcsS0FBSztBQUFBLFVBQ3BCLENBQUM7QUFBQSxRQUNMO0FBQ0EsZUFBTztBQUFBLE1BQ1gsQ0FBQyxFQUNJLEtBQUssQ0FBQyxjQUFjO0FBQ3JCLGVBQU8sWUFBWSxnQkFBZ0IsUUFBUSxTQUFTO0FBQUEsTUFDeEQsQ0FBQztBQUFBLElBQ0wsT0FDSztBQUNELGFBQU8sWUFBWSxnQkFBZ0IsUUFBUSxLQUFLO0FBQUEsSUFDcEQ7QUFBQSxFQUNKO0FBQUEsRUFDQSxJQUFJLFFBQVE7QUFDUixXQUFPLEtBQUssS0FBSyxNQUFNO0FBQUEsRUFDM0I7QUFBQSxFQUNBLE9BQU8sU0FBUztBQUNaLGNBQVU7QUFDVixXQUFPLElBQUksV0FBVTtBQUFBLE1BQ2pCLEdBQUcsS0FBSztBQUFBLE1BQ1IsYUFBYTtBQUFBLE1BQ2IsR0FBSSxZQUFZLFNBQ1Y7QUFBQSxRQUNFLFVBQVUsQ0FBQyxPQUFPLFFBQVE7QUFDdEIsZ0JBQU0sZUFBZSxLQUFLLEtBQUssV0FBVyxPQUFPLEdBQUcsRUFBRSxXQUFXLElBQUk7QUFDckUsY0FBSSxNQUFNLFNBQVM7QUFDZixtQkFBTztBQUFBLGNBQ0gsU0FBUyxVQUFVLFNBQVMsT0FBTyxFQUFFLFdBQVc7QUFBQSxZQUNwRDtBQUNKLGlCQUFPO0FBQUEsWUFDSCxTQUFTO0FBQUEsVUFDYjtBQUFBLFFBQ0o7QUFBQSxNQUNKLElBQ0UsQ0FBQztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFFBQVE7QUFDSixXQUFPLElBQUksV0FBVTtBQUFBLE1BQ2pCLEdBQUcsS0FBSztBQUFBLE1BQ1IsYUFBYTtBQUFBLElBQ2pCLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxjQUFjO0FBQ1YsV0FBTyxJQUFJLFdBQVU7QUFBQSxNQUNqQixHQUFHLEtBQUs7QUFBQSxNQUNSLGFBQWE7QUFBQSxJQUNqQixDQUFDO0FBQUEsRUFDTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQWtCQSxPQUFPLGNBQWM7QUFDakIsV0FBTyxJQUFJLFdBQVU7QUFBQSxNQUNqQixHQUFHLEtBQUs7QUFBQSxNQUNSLE9BQU8sT0FBTztBQUFBLFFBQ1YsR0FBRyxLQUFLLEtBQUssTUFBTTtBQUFBLFFBQ25CLEdBQUc7QUFBQSxNQUNQO0FBQUEsSUFDSixDQUFDO0FBQUEsRUFDTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU1BLE1BQU0sU0FBUztBQUNYLFVBQU0sU0FBUyxJQUFJLFdBQVU7QUFBQSxNQUN6QixhQUFhLFFBQVEsS0FBSztBQUFBLE1BQzFCLFVBQVUsUUFBUSxLQUFLO0FBQUEsTUFDdkIsT0FBTyxPQUFPO0FBQUEsUUFDVixHQUFHLEtBQUssS0FBSyxNQUFNO0FBQUEsUUFDbkIsR0FBRyxRQUFRLEtBQUssTUFBTTtBQUFBLE1BQzFCO0FBQUEsTUFDQSxVQUFVLHNCQUFzQjtBQUFBLElBQ3BDLENBQUM7QUFDRCxXQUFPO0FBQUEsRUFDWDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQW9DQSxPQUFPLEtBQUssUUFBUTtBQUNoQixXQUFPLEtBQUssUUFBUSxFQUFFLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQztBQUFBLEVBQ3pDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFzQkEsU0FBUyxPQUFPO0FBQ1osV0FBTyxJQUFJLFdBQVU7QUFBQSxNQUNqQixHQUFHLEtBQUs7QUFBQSxNQUNSLFVBQVU7QUFBQSxJQUNkLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxLQUFLLE1BQU07QUFDUCxVQUFNLFFBQVEsQ0FBQztBQUNmLGVBQVcsT0FBTyxLQUFLLFdBQVcsSUFBSSxHQUFHO0FBQ3JDLFVBQUksS0FBSyxHQUFHLEtBQUssS0FBSyxNQUFNLEdBQUcsR0FBRztBQUM5QixjQUFNLEdBQUcsSUFBSSxLQUFLLE1BQU0sR0FBRztBQUFBLE1BQy9CO0FBQUEsSUFDSjtBQUNBLFdBQU8sSUFBSSxXQUFVO0FBQUEsTUFDakIsR0FBRyxLQUFLO0FBQUEsTUFDUixPQUFPLE1BQU07QUFBQSxJQUNqQixDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsS0FBSyxNQUFNO0FBQ1AsVUFBTSxRQUFRLENBQUM7QUFDZixlQUFXLE9BQU8sS0FBSyxXQUFXLEtBQUssS0FBSyxHQUFHO0FBQzNDLFVBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRztBQUNaLGNBQU0sR0FBRyxJQUFJLEtBQUssTUFBTSxHQUFHO0FBQUEsTUFDL0I7QUFBQSxJQUNKO0FBQ0EsV0FBTyxJQUFJLFdBQVU7QUFBQSxNQUNqQixHQUFHLEtBQUs7QUFBQSxNQUNSLE9BQU8sTUFBTTtBQUFBLElBQ2pCLENBQUM7QUFBQSxFQUNMO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJQSxjQUFjO0FBQ1YsV0FBTyxlQUFlLElBQUk7QUFBQSxFQUM5QjtBQUFBLEVBQ0EsUUFBUSxNQUFNO0FBQ1YsVUFBTSxXQUFXLENBQUM7QUFDbEIsZUFBVyxPQUFPLEtBQUssV0FBVyxLQUFLLEtBQUssR0FBRztBQUMzQyxZQUFNLGNBQWMsS0FBSyxNQUFNLEdBQUc7QUFDbEMsVUFBSSxRQUFRLENBQUMsS0FBSyxHQUFHLEdBQUc7QUFDcEIsaUJBQVMsR0FBRyxJQUFJO0FBQUEsTUFDcEIsT0FDSztBQUNELGlCQUFTLEdBQUcsSUFBSSxZQUFZLFNBQVM7QUFBQSxNQUN6QztBQUFBLElBQ0o7QUFDQSxXQUFPLElBQUksV0FBVTtBQUFBLE1BQ2pCLEdBQUcsS0FBSztBQUFBLE1BQ1IsT0FBTyxNQUFNO0FBQUEsSUFDakIsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFNBQVMsTUFBTTtBQUNYLFVBQU0sV0FBVyxDQUFDO0FBQ2xCLGVBQVcsT0FBTyxLQUFLLFdBQVcsS0FBSyxLQUFLLEdBQUc7QUFDM0MsVUFBSSxRQUFRLENBQUMsS0FBSyxHQUFHLEdBQUc7QUFDcEIsaUJBQVMsR0FBRyxJQUFJLEtBQUssTUFBTSxHQUFHO0FBQUEsTUFDbEMsT0FDSztBQUNELGNBQU0sY0FBYyxLQUFLLE1BQU0sR0FBRztBQUNsQyxZQUFJLFdBQVc7QUFDZixlQUFPLG9CQUFvQixhQUFhO0FBQ3BDLHFCQUFXLFNBQVMsS0FBSztBQUFBLFFBQzdCO0FBQ0EsaUJBQVMsR0FBRyxJQUFJO0FBQUEsTUFDcEI7QUFBQSxJQUNKO0FBQ0EsV0FBTyxJQUFJLFdBQVU7QUFBQSxNQUNqQixHQUFHLEtBQUs7QUFBQSxNQUNSLE9BQU8sTUFBTTtBQUFBLElBQ2pCLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxRQUFRO0FBQ0osV0FBTyxjQUFjLEtBQUssV0FBVyxLQUFLLEtBQUssQ0FBQztBQUFBLEVBQ3BEO0FBQ0o7QUFDQSxVQUFVLFNBQVMsQ0FBQyxPQUFPLFdBQVc7QUFDbEMsU0FBTyxJQUFJLFVBQVU7QUFBQSxJQUNqQixPQUFPLE1BQU07QUFBQSxJQUNiLGFBQWE7QUFBQSxJQUNiLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDMUIsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ0EsVUFBVSxlQUFlLENBQUMsT0FBTyxXQUFXO0FBQ3hDLFNBQU8sSUFBSSxVQUFVO0FBQUEsSUFDakIsT0FBTyxNQUFNO0FBQUEsSUFDYixhQUFhO0FBQUEsSUFDYixVQUFVLFNBQVMsT0FBTztBQUFBLElBQzFCLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNBLFVBQVUsYUFBYSxDQUFDLE9BQU8sV0FBVztBQUN0QyxTQUFPLElBQUksVUFBVTtBQUFBLElBQ2pCO0FBQUEsSUFDQSxhQUFhO0FBQUEsSUFDYixVQUFVLFNBQVMsT0FBTztBQUFBLElBQzFCLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sV0FBTixjQUF1QixRQUFRO0FBQUEsRUFDbEMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxFQUFFLElBQUksSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBQzlDLFVBQU0sVUFBVSxLQUFLLEtBQUs7QUFDMUIsYUFBUyxjQUFjLFNBQVM7QUFFNUIsaUJBQVcsVUFBVSxTQUFTO0FBQzFCLFlBQUksT0FBTyxPQUFPLFdBQVcsU0FBUztBQUNsQyxpQkFBTyxPQUFPO0FBQUEsUUFDbEI7QUFBQSxNQUNKO0FBQ0EsaUJBQVcsVUFBVSxTQUFTO0FBQzFCLFlBQUksT0FBTyxPQUFPLFdBQVcsU0FBUztBQUVsQyxjQUFJLE9BQU8sT0FBTyxLQUFLLEdBQUcsT0FBTyxJQUFJLE9BQU8sTUFBTTtBQUNsRCxpQkFBTyxPQUFPO0FBQUEsUUFDbEI7QUFBQSxNQUNKO0FBRUEsWUFBTSxjQUFjLFFBQVEsSUFBSSxDQUFDLFdBQVcsSUFBSSxTQUFTLE9BQU8sSUFBSSxPQUFPLE1BQU0sQ0FBQztBQUNsRix3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CO0FBQUEsTUFDSixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxRQUFJLElBQUksT0FBTyxPQUFPO0FBQ2xCLGFBQU8sUUFBUSxJQUFJLFFBQVEsSUFBSSxPQUFPLFdBQVc7QUFDN0MsY0FBTSxXQUFXO0FBQUEsVUFDYixHQUFHO0FBQUEsVUFDSCxRQUFRO0FBQUEsWUFDSixHQUFHLElBQUk7QUFBQSxZQUNQLFFBQVEsQ0FBQztBQUFBLFVBQ2I7QUFBQSxVQUNBLFFBQVE7QUFBQSxRQUNaO0FBQ0EsZUFBTztBQUFBLFVBQ0gsUUFBUSxNQUFNLE9BQU8sWUFBWTtBQUFBLFlBQzdCLE1BQU0sSUFBSTtBQUFBLFlBQ1YsTUFBTSxJQUFJO0FBQUEsWUFDVixRQUFRO0FBQUEsVUFDWixDQUFDO0FBQUEsVUFDRCxLQUFLO0FBQUEsUUFDVDtBQUFBLE1BQ0osQ0FBQyxDQUFDLEVBQUUsS0FBSyxhQUFhO0FBQUEsSUFDMUIsT0FDSztBQUNELFVBQUksUUFBUTtBQUNaLFlBQU0sU0FBUyxDQUFDO0FBQ2hCLGlCQUFXLFVBQVUsU0FBUztBQUMxQixjQUFNLFdBQVc7QUFBQSxVQUNiLEdBQUc7QUFBQSxVQUNILFFBQVE7QUFBQSxZQUNKLEdBQUcsSUFBSTtBQUFBLFlBQ1AsUUFBUSxDQUFDO0FBQUEsVUFDYjtBQUFBLFVBQ0EsUUFBUTtBQUFBLFFBQ1o7QUFDQSxjQUFNLFNBQVMsT0FBTyxXQUFXO0FBQUEsVUFDN0IsTUFBTSxJQUFJO0FBQUEsVUFDVixNQUFNLElBQUk7QUFBQSxVQUNWLFFBQVE7QUFBQSxRQUNaLENBQUM7QUFDRCxZQUFJLE9BQU8sV0FBVyxTQUFTO0FBQzNCLGlCQUFPO0FBQUEsUUFDWCxXQUNTLE9BQU8sV0FBVyxXQUFXLENBQUMsT0FBTztBQUMxQyxrQkFBUSxFQUFFLFFBQVEsS0FBSyxTQUFTO0FBQUEsUUFDcEM7QUFDQSxZQUFJLFNBQVMsT0FBTyxPQUFPLFFBQVE7QUFDL0IsaUJBQU8sS0FBSyxTQUFTLE9BQU8sTUFBTTtBQUFBLFFBQ3RDO0FBQUEsTUFDSjtBQUNBLFVBQUksT0FBTztBQUNQLFlBQUksT0FBTyxPQUFPLEtBQUssR0FBRyxNQUFNLElBQUksT0FBTyxNQUFNO0FBQ2pELGVBQU8sTUFBTTtBQUFBLE1BQ2pCO0FBQ0EsWUFBTSxjQUFjLE9BQU8sSUFBSSxDQUFDRSxZQUFXLElBQUksU0FBU0EsT0FBTSxDQUFDO0FBQy9ELHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkI7QUFBQSxNQUNKLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFBQSxFQUNBLElBQUksVUFBVTtBQUNWLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFDSjtBQUNBLFNBQVMsU0FBUyxDQUFDLE9BQU8sV0FBVztBQUNqQyxTQUFPLElBQUksU0FBUztBQUFBLElBQ2hCLFNBQVM7QUFBQSxJQUNULFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQVFBLElBQU0sbUJBQW1CLENBQUMsU0FBUztBQUMvQixNQUFJLGdCQUFnQixTQUFTO0FBQ3pCLFdBQU8saUJBQWlCLEtBQUssTUFBTTtBQUFBLEVBQ3ZDLFdBQ1MsZ0JBQWdCLFlBQVk7QUFDakMsV0FBTyxpQkFBaUIsS0FBSyxVQUFVLENBQUM7QUFBQSxFQUM1QyxXQUNTLGdCQUFnQixZQUFZO0FBQ2pDLFdBQU8sQ0FBQyxLQUFLLEtBQUs7QUFBQSxFQUN0QixXQUNTLGdCQUFnQixTQUFTO0FBQzlCLFdBQU8sS0FBSztBQUFBLEVBQ2hCLFdBQ1MsZ0JBQWdCLGVBQWU7QUFFcEMsV0FBTyxLQUFLLGFBQWEsS0FBSyxJQUFJO0FBQUEsRUFDdEMsV0FDUyxnQkFBZ0IsWUFBWTtBQUNqQyxXQUFPLGlCQUFpQixLQUFLLEtBQUssU0FBUztBQUFBLEVBQy9DLFdBQ1MsZ0JBQWdCLGNBQWM7QUFDbkMsV0FBTyxDQUFDLE1BQVM7QUFBQSxFQUNyQixXQUNTLGdCQUFnQixTQUFTO0FBQzlCLFdBQU8sQ0FBQyxJQUFJO0FBQUEsRUFDaEIsV0FDUyxnQkFBZ0IsYUFBYTtBQUNsQyxXQUFPLENBQUMsUUFBVyxHQUFHLGlCQUFpQixLQUFLLE9BQU8sQ0FBQyxDQUFDO0FBQUEsRUFDekQsV0FDUyxnQkFBZ0IsYUFBYTtBQUNsQyxXQUFPLENBQUMsTUFBTSxHQUFHLGlCQUFpQixLQUFLLE9BQU8sQ0FBQyxDQUFDO0FBQUEsRUFDcEQsV0FDUyxnQkFBZ0IsWUFBWTtBQUNqQyxXQUFPLGlCQUFpQixLQUFLLE9BQU8sQ0FBQztBQUFBLEVBQ3pDLFdBQ1MsZ0JBQWdCLGFBQWE7QUFDbEMsV0FBTyxpQkFBaUIsS0FBSyxPQUFPLENBQUM7QUFBQSxFQUN6QyxXQUNTLGdCQUFnQixVQUFVO0FBQy9CLFdBQU8saUJBQWlCLEtBQUssS0FBSyxTQUFTO0FBQUEsRUFDL0MsT0FDSztBQUNELFdBQU8sQ0FBQztBQUFBLEVBQ1o7QUFDSjtBQUNPLElBQU0sd0JBQU4sTUFBTSwrQkFBOEIsUUFBUTtBQUFBLEVBQy9DLE9BQU8sT0FBTztBQUNWLFVBQU0sRUFBRSxJQUFJLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUM5QyxRQUFJLElBQUksZUFBZSxjQUFjLFFBQVE7QUFDekMsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVLElBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxVQUFNLGdCQUFnQixLQUFLO0FBQzNCLFVBQU0scUJBQXFCLElBQUksS0FBSyxhQUFhO0FBQ2pELFVBQU0sU0FBUyxLQUFLLFdBQVcsSUFBSSxrQkFBa0I7QUFDckQsUUFBSSxDQUFDLFFBQVE7QUFDVCx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFNBQVMsTUFBTSxLQUFLLEtBQUssV0FBVyxLQUFLLENBQUM7QUFBQSxRQUMxQyxNQUFNLENBQUMsYUFBYTtBQUFBLE1BQ3hCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFFBQUksSUFBSSxPQUFPLE9BQU87QUFDbEIsYUFBTyxPQUFPLFlBQVk7QUFBQSxRQUN0QixNQUFNLElBQUk7QUFBQSxRQUNWLE1BQU0sSUFBSTtBQUFBLFFBQ1YsUUFBUTtBQUFBLE1BQ1osQ0FBQztBQUFBLElBQ0wsT0FDSztBQUNELGFBQU8sT0FBTyxXQUFXO0FBQUEsUUFDckIsTUFBTSxJQUFJO0FBQUEsUUFDVixNQUFNLElBQUk7QUFBQSxRQUNWLFFBQVE7QUFBQSxNQUNaLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjtBQUFBLEVBQ0EsSUFBSSxnQkFBZ0I7QUFDaEIsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsSUFBSSxVQUFVO0FBQ1YsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsSUFBSSxhQUFhO0FBQ2IsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQVNBLE9BQU8sT0FBTyxlQUFlLFNBQVMsUUFBUTtBQUUxQyxVQUFNLGFBQWEsb0JBQUksSUFBSTtBQUUzQixlQUFXLFFBQVEsU0FBUztBQUN4QixZQUFNLHNCQUFzQixpQkFBaUIsS0FBSyxNQUFNLGFBQWEsQ0FBQztBQUN0RSxVQUFJLENBQUMsb0JBQW9CLFFBQVE7QUFDN0IsY0FBTSxJQUFJLE1BQU0sbUNBQW1DLGFBQWEsbURBQW1EO0FBQUEsTUFDdkg7QUFDQSxpQkFBVyxTQUFTLHFCQUFxQjtBQUNyQyxZQUFJLFdBQVcsSUFBSSxLQUFLLEdBQUc7QUFDdkIsZ0JBQU0sSUFBSSxNQUFNLDBCQUEwQixPQUFPLGFBQWEsQ0FBQyx3QkFBd0IsT0FBTyxLQUFLLENBQUMsRUFBRTtBQUFBLFFBQzFHO0FBQ0EsbUJBQVcsSUFBSSxPQUFPLElBQUk7QUFBQSxNQUM5QjtBQUFBLElBQ0o7QUFDQSxXQUFPLElBQUksdUJBQXNCO0FBQUEsTUFDN0IsVUFBVSxzQkFBc0I7QUFBQSxNQUNoQztBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQSxHQUFHLG9CQUFvQixNQUFNO0FBQUEsSUFDakMsQ0FBQztBQUFBLEVBQ0w7QUFDSjtBQUNBLFNBQVMsWUFBWSxHQUFHLEdBQUc7QUFDdkIsUUFBTSxRQUFRLGNBQWMsQ0FBQztBQUM3QixRQUFNLFFBQVEsY0FBYyxDQUFDO0FBQzdCLE1BQUksTUFBTSxHQUFHO0FBQ1QsV0FBTyxFQUFFLE9BQU8sTUFBTSxNQUFNLEVBQUU7QUFBQSxFQUNsQyxXQUNTLFVBQVUsY0FBYyxVQUFVLFVBQVUsY0FBYyxRQUFRO0FBQ3ZFLFVBQU0sUUFBUSxLQUFLLFdBQVcsQ0FBQztBQUMvQixVQUFNLGFBQWEsS0FBSyxXQUFXLENBQUMsRUFBRSxPQUFPLENBQUMsUUFBUSxNQUFNLFFBQVEsR0FBRyxNQUFNLEVBQUU7QUFDL0UsVUFBTSxTQUFTLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRTtBQUM1QixlQUFXLE9BQU8sWUFBWTtBQUMxQixZQUFNLGNBQWMsWUFBWSxFQUFFLEdBQUcsR0FBRyxFQUFFLEdBQUcsQ0FBQztBQUM5QyxVQUFJLENBQUMsWUFBWSxPQUFPO0FBQ3BCLGVBQU8sRUFBRSxPQUFPLE1BQU07QUFBQSxNQUMxQjtBQUNBLGFBQU8sR0FBRyxJQUFJLFlBQVk7QUFBQSxJQUM5QjtBQUNBLFdBQU8sRUFBRSxPQUFPLE1BQU0sTUFBTSxPQUFPO0FBQUEsRUFDdkMsV0FDUyxVQUFVLGNBQWMsU0FBUyxVQUFVLGNBQWMsT0FBTztBQUNyRSxRQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVE7QUFDdkIsYUFBTyxFQUFFLE9BQU8sTUFBTTtBQUFBLElBQzFCO0FBQ0EsVUFBTSxXQUFXLENBQUM7QUFDbEIsYUFBUyxRQUFRLEdBQUcsUUFBUSxFQUFFLFFBQVEsU0FBUztBQUMzQyxZQUFNLFFBQVEsRUFBRSxLQUFLO0FBQ3JCLFlBQU0sUUFBUSxFQUFFLEtBQUs7QUFDckIsWUFBTSxjQUFjLFlBQVksT0FBTyxLQUFLO0FBQzVDLFVBQUksQ0FBQyxZQUFZLE9BQU87QUFDcEIsZUFBTyxFQUFFLE9BQU8sTUFBTTtBQUFBLE1BQzFCO0FBQ0EsZUFBUyxLQUFLLFlBQVksSUFBSTtBQUFBLElBQ2xDO0FBQ0EsV0FBTyxFQUFFLE9BQU8sTUFBTSxNQUFNLFNBQVM7QUFBQSxFQUN6QyxXQUNTLFVBQVUsY0FBYyxRQUFRLFVBQVUsY0FBYyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUc7QUFDaEYsV0FBTyxFQUFFLE9BQU8sTUFBTSxNQUFNLEVBQUU7QUFBQSxFQUNsQyxPQUNLO0FBQ0QsV0FBTyxFQUFFLE9BQU8sTUFBTTtBQUFBLEVBQzFCO0FBQ0o7QUFDTyxJQUFNLGtCQUFOLGNBQThCLFFBQVE7QUFBQSxFQUN6QyxPQUFPLE9BQU87QUFDVixVQUFNLEVBQUUsUUFBUSxJQUFJLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUN0RCxVQUFNLGVBQWUsQ0FBQyxZQUFZLGdCQUFnQjtBQUM5QyxVQUFJLFVBQVUsVUFBVSxLQUFLLFVBQVUsV0FBVyxHQUFHO0FBQ2pELGVBQU87QUFBQSxNQUNYO0FBQ0EsWUFBTSxTQUFTLFlBQVksV0FBVyxPQUFPLFlBQVksS0FBSztBQUM5RCxVQUFJLENBQUMsT0FBTyxPQUFPO0FBQ2YsMEJBQWtCLEtBQUs7QUFBQSxVQUNuQixNQUFNLGFBQWE7QUFBQSxRQUN2QixDQUFDO0FBQ0QsZUFBTztBQUFBLE1BQ1g7QUFDQSxVQUFJLFFBQVEsVUFBVSxLQUFLLFFBQVEsV0FBVyxHQUFHO0FBQzdDLGVBQU8sTUFBTTtBQUFBLE1BQ2pCO0FBQ0EsYUFBTyxFQUFFLFFBQVEsT0FBTyxPQUFPLE9BQU8sT0FBTyxLQUFLO0FBQUEsSUFDdEQ7QUFDQSxRQUFJLElBQUksT0FBTyxPQUFPO0FBQ2xCLGFBQU8sUUFBUSxJQUFJO0FBQUEsUUFDZixLQUFLLEtBQUssS0FBSyxZQUFZO0FBQUEsVUFDdkIsTUFBTSxJQUFJO0FBQUEsVUFDVixNQUFNLElBQUk7QUFBQSxVQUNWLFFBQVE7QUFBQSxRQUNaLENBQUM7QUFBQSxRQUNELEtBQUssS0FBSyxNQUFNLFlBQVk7QUFBQSxVQUN4QixNQUFNLElBQUk7QUFBQSxVQUNWLE1BQU0sSUFBSTtBQUFBLFVBQ1YsUUFBUTtBQUFBLFFBQ1osQ0FBQztBQUFBLE1BQ0wsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLE1BQU0sS0FBSyxNQUFNLGFBQWEsTUFBTSxLQUFLLENBQUM7QUFBQSxJQUN4RCxPQUNLO0FBQ0QsYUFBTyxhQUFhLEtBQUssS0FBSyxLQUFLLFdBQVc7QUFBQSxRQUMxQyxNQUFNLElBQUk7QUFBQSxRQUNWLE1BQU0sSUFBSTtBQUFBLFFBQ1YsUUFBUTtBQUFBLE1BQ1osQ0FBQyxHQUFHLEtBQUssS0FBSyxNQUFNLFdBQVc7QUFBQSxRQUMzQixNQUFNLElBQUk7QUFBQSxRQUNWLE1BQU0sSUFBSTtBQUFBLFFBQ1YsUUFBUTtBQUFBLE1BQ1osQ0FBQyxDQUFDO0FBQUEsSUFDTjtBQUFBLEVBQ0o7QUFDSjtBQUNBLGdCQUFnQixTQUFTLENBQUMsTUFBTSxPQUFPLFdBQVc7QUFDOUMsU0FBTyxJQUFJLGdCQUFnQjtBQUFBLElBQ3ZCO0FBQUEsSUFDQTtBQUFBLElBQ0EsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBRU8sSUFBTSxXQUFOLE1BQU0sa0JBQWlCLFFBQVE7QUFBQSxFQUNsQyxPQUFPLE9BQU87QUFDVixVQUFNLEVBQUUsUUFBUSxJQUFJLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUN0RCxRQUFJLElBQUksZUFBZSxjQUFjLE9BQU87QUFDeEMsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVLElBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxRQUFJLElBQUksS0FBSyxTQUFTLEtBQUssS0FBSyxNQUFNLFFBQVE7QUFDMUMsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixTQUFTLEtBQUssS0FBSyxNQUFNO0FBQUEsUUFDekIsV0FBVztBQUFBLFFBQ1gsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLE1BQ1YsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsVUFBTSxPQUFPLEtBQUssS0FBSztBQUN2QixRQUFJLENBQUMsUUFBUSxJQUFJLEtBQUssU0FBUyxLQUFLLEtBQUssTUFBTSxRQUFRO0FBQ25ELHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsU0FBUyxLQUFLLEtBQUssTUFBTTtBQUFBLFFBQ3pCLFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxRQUNQLE1BQU07QUFBQSxNQUNWLENBQUM7QUFDRCxhQUFPLE1BQU07QUFBQSxJQUNqQjtBQUNBLFVBQU0sUUFBUSxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQ3JCLElBQUksQ0FBQyxNQUFNLGNBQWM7QUFDMUIsWUFBTSxTQUFTLEtBQUssS0FBSyxNQUFNLFNBQVMsS0FBSyxLQUFLLEtBQUs7QUFDdkQsVUFBSSxDQUFDO0FBQ0QsZUFBTztBQUNYLGFBQU8sT0FBTyxPQUFPLElBQUksbUJBQW1CLEtBQUssTUFBTSxJQUFJLE1BQU0sU0FBUyxDQUFDO0FBQUEsSUFDL0UsQ0FBQyxFQUNJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLFFBQUksSUFBSSxPQUFPLE9BQU87QUFDbEIsYUFBTyxRQUFRLElBQUksS0FBSyxFQUFFLEtBQUssQ0FBQyxZQUFZO0FBQ3hDLGVBQU8sWUFBWSxXQUFXLFFBQVEsT0FBTztBQUFBLE1BQ2pELENBQUM7QUFBQSxJQUNMLE9BQ0s7QUFDRCxhQUFPLFlBQVksV0FBVyxRQUFRLEtBQUs7QUFBQSxJQUMvQztBQUFBLEVBQ0o7QUFBQSxFQUNBLElBQUksUUFBUTtBQUNSLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFBQSxFQUNBLEtBQUssTUFBTTtBQUNQLFdBQU8sSUFBSSxVQUFTO0FBQUEsTUFDaEIsR0FBRyxLQUFLO0FBQUEsTUFDUjtBQUFBLElBQ0osQ0FBQztBQUFBLEVBQ0w7QUFDSjtBQUNBLFNBQVMsU0FBUyxDQUFDLFNBQVMsV0FBVztBQUNuQyxNQUFJLENBQUMsTUFBTSxRQUFRLE9BQU8sR0FBRztBQUN6QixVQUFNLElBQUksTUFBTSx1REFBdUQ7QUFBQSxFQUMzRTtBQUNBLFNBQU8sSUFBSSxTQUFTO0FBQUEsSUFDaEIsT0FBTztBQUFBLElBQ1AsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxNQUFNO0FBQUEsSUFDTixHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxZQUFOLE1BQU0sbUJBQWtCLFFBQVE7QUFBQSxFQUNuQyxJQUFJLFlBQVk7QUFDWixXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQUEsRUFDQSxJQUFJLGNBQWM7QUFDZCxXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQUEsRUFDQSxPQUFPLE9BQU87QUFDVixVQUFNLEVBQUUsUUFBUSxJQUFJLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUN0RCxRQUFJLElBQUksZUFBZSxjQUFjLFFBQVE7QUFDekMsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVLElBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxVQUFNLFFBQVEsQ0FBQztBQUNmLFVBQU0sVUFBVSxLQUFLLEtBQUs7QUFDMUIsVUFBTSxZQUFZLEtBQUssS0FBSztBQUM1QixlQUFXLE9BQU8sSUFBSSxNQUFNO0FBQ3hCLFlBQU0sS0FBSztBQUFBLFFBQ1AsS0FBSyxRQUFRLE9BQU8sSUFBSSxtQkFBbUIsS0FBSyxLQUFLLElBQUksTUFBTSxHQUFHLENBQUM7QUFBQSxRQUNuRSxPQUFPLFVBQVUsT0FBTyxJQUFJLG1CQUFtQixLQUFLLElBQUksS0FBSyxHQUFHLEdBQUcsSUFBSSxNQUFNLEdBQUcsQ0FBQztBQUFBLFFBQ2pGLFdBQVcsT0FBTyxJQUFJO0FBQUEsTUFDMUIsQ0FBQztBQUFBLElBQ0w7QUFDQSxRQUFJLElBQUksT0FBTyxPQUFPO0FBQ2xCLGFBQU8sWUFBWSxpQkFBaUIsUUFBUSxLQUFLO0FBQUEsSUFDckQsT0FDSztBQUNELGFBQU8sWUFBWSxnQkFBZ0IsUUFBUSxLQUFLO0FBQUEsSUFDcEQ7QUFBQSxFQUNKO0FBQUEsRUFDQSxJQUFJLFVBQVU7QUFDVixXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQUEsRUFDQSxPQUFPLE9BQU8sT0FBTyxRQUFRLE9BQU87QUFDaEMsUUFBSSxrQkFBa0IsU0FBUztBQUMzQixhQUFPLElBQUksV0FBVTtBQUFBLFFBQ2pCLFNBQVM7QUFBQSxRQUNULFdBQVc7QUFBQSxRQUNYLFVBQVUsc0JBQXNCO0FBQUEsUUFDaEMsR0FBRyxvQkFBb0IsS0FBSztBQUFBLE1BQ2hDLENBQUM7QUFBQSxJQUNMO0FBQ0EsV0FBTyxJQUFJLFdBQVU7QUFBQSxNQUNqQixTQUFTLFVBQVUsT0FBTztBQUFBLE1BQzFCLFdBQVc7QUFBQSxNQUNYLFVBQVUsc0JBQXNCO0FBQUEsTUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLElBQ2pDLENBQUM7QUFBQSxFQUNMO0FBQ0o7QUFDTyxJQUFNLFNBQU4sY0FBcUIsUUFBUTtBQUFBLEVBQ2hDLElBQUksWUFBWTtBQUNaLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFBQSxFQUNBLElBQUksY0FBYztBQUNkLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFBQSxFQUNBLE9BQU8sT0FBTztBQUNWLFVBQU0sRUFBRSxRQUFRLElBQUksSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBQ3RELFFBQUksSUFBSSxlQUFlLGNBQWMsS0FBSztBQUN0Qyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVUsSUFBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFVBQU0sVUFBVSxLQUFLLEtBQUs7QUFDMUIsVUFBTSxZQUFZLEtBQUssS0FBSztBQUM1QixVQUFNLFFBQVEsQ0FBQyxHQUFHLElBQUksS0FBSyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssR0FBRyxVQUFVO0FBQy9ELGFBQU87QUFBQSxRQUNILEtBQUssUUFBUSxPQUFPLElBQUksbUJBQW1CLEtBQUssS0FBSyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDO0FBQUEsUUFDOUUsT0FBTyxVQUFVLE9BQU8sSUFBSSxtQkFBbUIsS0FBSyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLENBQUM7QUFBQSxNQUMxRjtBQUFBLElBQ0osQ0FBQztBQUNELFFBQUksSUFBSSxPQUFPLE9BQU87QUFDbEIsWUFBTSxXQUFXLG9CQUFJLElBQUk7QUFDekIsYUFBTyxRQUFRLFFBQVEsRUFBRSxLQUFLLFlBQVk7QUFDdEMsbUJBQVcsUUFBUSxPQUFPO0FBQ3RCLGdCQUFNLE1BQU0sTUFBTSxLQUFLO0FBQ3ZCLGdCQUFNLFFBQVEsTUFBTSxLQUFLO0FBQ3pCLGNBQUksSUFBSSxXQUFXLGFBQWEsTUFBTSxXQUFXLFdBQVc7QUFDeEQsbUJBQU87QUFBQSxVQUNYO0FBQ0EsY0FBSSxJQUFJLFdBQVcsV0FBVyxNQUFNLFdBQVcsU0FBUztBQUNwRCxtQkFBTyxNQUFNO0FBQUEsVUFDakI7QUFDQSxtQkFBUyxJQUFJLElBQUksT0FBTyxNQUFNLEtBQUs7QUFBQSxRQUN2QztBQUNBLGVBQU8sRUFBRSxRQUFRLE9BQU8sT0FBTyxPQUFPLFNBQVM7QUFBQSxNQUNuRCxDQUFDO0FBQUEsSUFDTCxPQUNLO0FBQ0QsWUFBTSxXQUFXLG9CQUFJLElBQUk7QUFDekIsaUJBQVcsUUFBUSxPQUFPO0FBQ3RCLGNBQU0sTUFBTSxLQUFLO0FBQ2pCLGNBQU0sUUFBUSxLQUFLO0FBQ25CLFlBQUksSUFBSSxXQUFXLGFBQWEsTUFBTSxXQUFXLFdBQVc7QUFDeEQsaUJBQU87QUFBQSxRQUNYO0FBQ0EsWUFBSSxJQUFJLFdBQVcsV0FBVyxNQUFNLFdBQVcsU0FBUztBQUNwRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFDQSxpQkFBUyxJQUFJLElBQUksT0FBTyxNQUFNLEtBQUs7QUFBQSxNQUN2QztBQUNBLGFBQU8sRUFBRSxRQUFRLE9BQU8sT0FBTyxPQUFPLFNBQVM7QUFBQSxJQUNuRDtBQUFBLEVBQ0o7QUFDSjtBQUNBLE9BQU8sU0FBUyxDQUFDLFNBQVMsV0FBVyxXQUFXO0FBQzVDLFNBQU8sSUFBSSxPQUFPO0FBQUEsSUFDZDtBQUFBLElBQ0E7QUFBQSxJQUNBLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sU0FBTixNQUFNLGdCQUFlLFFBQVE7QUFBQSxFQUNoQyxPQUFPLE9BQU87QUFDVixVQUFNLEVBQUUsUUFBUSxJQUFJLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUN0RCxRQUFJLElBQUksZUFBZSxjQUFjLEtBQUs7QUFDdEMsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVLElBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxVQUFNLE1BQU0sS0FBSztBQUNqQixRQUFJLElBQUksWUFBWSxNQUFNO0FBQ3RCLFVBQUksSUFBSSxLQUFLLE9BQU8sSUFBSSxRQUFRLE9BQU87QUFDbkMsMEJBQWtCLEtBQUs7QUFBQSxVQUNuQixNQUFNLGFBQWE7QUFBQSxVQUNuQixTQUFTLElBQUksUUFBUTtBQUFBLFVBQ3JCLE1BQU07QUFBQSxVQUNOLFdBQVc7QUFBQSxVQUNYLE9BQU87QUFBQSxVQUNQLFNBQVMsSUFBSSxRQUFRO0FBQUEsUUFDekIsQ0FBQztBQUNELGVBQU8sTUFBTTtBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUNBLFFBQUksSUFBSSxZQUFZLE1BQU07QUFDdEIsVUFBSSxJQUFJLEtBQUssT0FBTyxJQUFJLFFBQVEsT0FBTztBQUNuQywwQkFBa0IsS0FBSztBQUFBLFVBQ25CLE1BQU0sYUFBYTtBQUFBLFVBQ25CLFNBQVMsSUFBSSxRQUFRO0FBQUEsVUFDckIsTUFBTTtBQUFBLFVBQ04sV0FBVztBQUFBLFVBQ1gsT0FBTztBQUFBLFVBQ1AsU0FBUyxJQUFJLFFBQVE7QUFBQSxRQUN6QixDQUFDO0FBQ0QsZUFBTyxNQUFNO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQ0EsVUFBTSxZQUFZLEtBQUssS0FBSztBQUM1QixhQUFTLFlBQVlDLFdBQVU7QUFDM0IsWUFBTSxZQUFZLG9CQUFJLElBQUk7QUFDMUIsaUJBQVcsV0FBV0EsV0FBVTtBQUM1QixZQUFJLFFBQVEsV0FBVztBQUNuQixpQkFBTztBQUNYLFlBQUksUUFBUSxXQUFXO0FBQ25CLGlCQUFPLE1BQU07QUFDakIsa0JBQVUsSUFBSSxRQUFRLEtBQUs7QUFBQSxNQUMvQjtBQUNBLGFBQU8sRUFBRSxRQUFRLE9BQU8sT0FBTyxPQUFPLFVBQVU7QUFBQSxJQUNwRDtBQUNBLFVBQU0sV0FBVyxDQUFDLEdBQUcsSUFBSSxLQUFLLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLE1BQU0sVUFBVSxPQUFPLElBQUksbUJBQW1CLEtBQUssTUFBTSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDekgsUUFBSSxJQUFJLE9BQU8sT0FBTztBQUNsQixhQUFPLFFBQVEsSUFBSSxRQUFRLEVBQUUsS0FBSyxDQUFDQSxjQUFhLFlBQVlBLFNBQVEsQ0FBQztBQUFBLElBQ3pFLE9BQ0s7QUFDRCxhQUFPLFlBQVksUUFBUTtBQUFBLElBQy9CO0FBQUEsRUFDSjtBQUFBLEVBQ0EsSUFBSSxTQUFTLFNBQVM7QUFDbEIsV0FBTyxJQUFJLFFBQU87QUFBQSxNQUNkLEdBQUcsS0FBSztBQUFBLE1BQ1IsU0FBUyxFQUFFLE9BQU8sU0FBUyxTQUFTLFVBQVUsU0FBUyxPQUFPLEVBQUU7QUFBQSxJQUNwRSxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsSUFBSSxTQUFTLFNBQVM7QUFDbEIsV0FBTyxJQUFJLFFBQU87QUFBQSxNQUNkLEdBQUcsS0FBSztBQUFBLE1BQ1IsU0FBUyxFQUFFLE9BQU8sU0FBUyxTQUFTLFVBQVUsU0FBUyxPQUFPLEVBQUU7QUFBQSxJQUNwRSxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsS0FBSyxNQUFNLFNBQVM7QUFDaEIsV0FBTyxLQUFLLElBQUksTUFBTSxPQUFPLEVBQUUsSUFBSSxNQUFNLE9BQU87QUFBQSxFQUNwRDtBQUFBLEVBQ0EsU0FBUyxTQUFTO0FBQ2QsV0FBTyxLQUFLLElBQUksR0FBRyxPQUFPO0FBQUEsRUFDOUI7QUFDSjtBQUNBLE9BQU8sU0FBUyxDQUFDLFdBQVcsV0FBVztBQUNuQyxTQUFPLElBQUksT0FBTztBQUFBLElBQ2Q7QUFBQSxJQUNBLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxJQUNULFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sY0FBTixNQUFNLHFCQUFvQixRQUFRO0FBQUEsRUFDckMsY0FBYztBQUNWLFVBQU0sR0FBRyxTQUFTO0FBQ2xCLFNBQUssV0FBVyxLQUFLO0FBQUEsRUFDekI7QUFBQSxFQUNBLE9BQU8sT0FBTztBQUNWLFVBQU0sRUFBRSxJQUFJLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUM5QyxRQUFJLElBQUksZUFBZSxjQUFjLFVBQVU7QUFDM0Msd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVLElBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxhQUFTLGNBQWMsTUFBTSxPQUFPO0FBQ2hDLGFBQU8sVUFBVTtBQUFBLFFBQ2IsTUFBTTtBQUFBLFFBQ04sTUFBTSxJQUFJO0FBQUEsUUFDVixXQUFXLENBQUMsSUFBSSxPQUFPLG9CQUFvQixJQUFJLGdCQUFnQixZQUFZLEdBQUcsVUFBZSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQUEsUUFDaEgsV0FBVztBQUFBLFVBQ1AsTUFBTSxhQUFhO0FBQUEsVUFDbkIsZ0JBQWdCO0FBQUEsUUFDcEI7QUFBQSxNQUNKLENBQUM7QUFBQSxJQUNMO0FBQ0EsYUFBUyxpQkFBaUIsU0FBUyxPQUFPO0FBQ3RDLGFBQU8sVUFBVTtBQUFBLFFBQ2IsTUFBTTtBQUFBLFFBQ04sTUFBTSxJQUFJO0FBQUEsUUFDVixXQUFXLENBQUMsSUFBSSxPQUFPLG9CQUFvQixJQUFJLGdCQUFnQixZQUFZLEdBQUcsVUFBZSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQUEsUUFDaEgsV0FBVztBQUFBLFVBQ1AsTUFBTSxhQUFhO0FBQUEsVUFDbkIsaUJBQWlCO0FBQUEsUUFDckI7QUFBQSxNQUNKLENBQUM7QUFBQSxJQUNMO0FBQ0EsVUFBTSxTQUFTLEVBQUUsVUFBVSxJQUFJLE9BQU8sbUJBQW1CO0FBQ3pELFVBQU0sS0FBSyxJQUFJO0FBQ2YsUUFBSSxLQUFLLEtBQUssbUJBQW1CLFlBQVk7QUFJekMsWUFBTSxLQUFLO0FBQ1gsYUFBTyxHQUFHLGtCQUFtQixNQUFNO0FBQy9CLGNBQU0sUUFBUSxJQUFJLFNBQVMsQ0FBQyxDQUFDO0FBQzdCLGNBQU0sYUFBYSxNQUFNLEdBQUcsS0FBSyxLQUFLLFdBQVcsTUFBTSxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07QUFDeEUsZ0JBQU0sU0FBUyxjQUFjLE1BQU0sQ0FBQyxDQUFDO0FBQ3JDLGdCQUFNO0FBQUEsUUFDVixDQUFDO0FBQ0QsY0FBTSxTQUFTLE1BQU0sUUFBUSxNQUFNLElBQUksTUFBTSxVQUFVO0FBQ3ZELGNBQU0sZ0JBQWdCLE1BQU0sR0FBRyxLQUFLLFFBQVEsS0FBSyxLQUM1QyxXQUFXLFFBQVEsTUFBTSxFQUN6QixNQUFNLENBQUMsTUFBTTtBQUNkLGdCQUFNLFNBQVMsaUJBQWlCLFFBQVEsQ0FBQyxDQUFDO0FBQzFDLGdCQUFNO0FBQUEsUUFDVixDQUFDO0FBQ0QsZUFBTztBQUFBLE1BQ1gsQ0FBQztBQUFBLElBQ0wsT0FDSztBQUlELFlBQU0sS0FBSztBQUNYLGFBQU8sR0FBRyxZQUFhLE1BQU07QUFDekIsY0FBTSxhQUFhLEdBQUcsS0FBSyxLQUFLLFVBQVUsTUFBTSxNQUFNO0FBQ3RELFlBQUksQ0FBQyxXQUFXLFNBQVM7QUFDckIsZ0JBQU0sSUFBSSxTQUFTLENBQUMsY0FBYyxNQUFNLFdBQVcsS0FBSyxDQUFDLENBQUM7QUFBQSxRQUM5RDtBQUNBLGNBQU0sU0FBUyxRQUFRLE1BQU0sSUFBSSxNQUFNLFdBQVcsSUFBSTtBQUN0RCxjQUFNLGdCQUFnQixHQUFHLEtBQUssUUFBUSxVQUFVLFFBQVEsTUFBTTtBQUM5RCxZQUFJLENBQUMsY0FBYyxTQUFTO0FBQ3hCLGdCQUFNLElBQUksU0FBUyxDQUFDLGlCQUFpQixRQUFRLGNBQWMsS0FBSyxDQUFDLENBQUM7QUFBQSxRQUN0RTtBQUNBLGVBQU8sY0FBYztBQUFBLE1BQ3pCLENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjtBQUFBLEVBQ0EsYUFBYTtBQUNULFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFBQSxFQUNBLGFBQWE7QUFDVCxXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQUEsRUFDQSxRQUFRLE9BQU87QUFDWCxXQUFPLElBQUksYUFBWTtBQUFBLE1BQ25CLEdBQUcsS0FBSztBQUFBLE1BQ1IsTUFBTSxTQUFTLE9BQU8sS0FBSyxFQUFFLEtBQUssV0FBVyxPQUFPLENBQUM7QUFBQSxJQUN6RCxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsUUFBUSxZQUFZO0FBQ2hCLFdBQU8sSUFBSSxhQUFZO0FBQUEsTUFDbkIsR0FBRyxLQUFLO0FBQUEsTUFDUixTQUFTO0FBQUEsSUFDYixDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsVUFBVSxNQUFNO0FBQ1osVUFBTSxnQkFBZ0IsS0FBSyxNQUFNLElBQUk7QUFDckMsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUNBLGdCQUFnQixNQUFNO0FBQ2xCLFVBQU0sZ0JBQWdCLEtBQUssTUFBTSxJQUFJO0FBQ3JDLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxPQUFPLE9BQU8sTUFBTSxTQUFTLFFBQVE7QUFDakMsV0FBTyxJQUFJLGFBQVk7QUFBQSxNQUNuQixNQUFPLE9BQU8sT0FBTyxTQUFTLE9BQU8sQ0FBQyxDQUFDLEVBQUUsS0FBSyxXQUFXLE9BQU8sQ0FBQztBQUFBLE1BQ2pFLFNBQVMsV0FBVyxXQUFXLE9BQU87QUFBQSxNQUN0QyxVQUFVLHNCQUFzQjtBQUFBLE1BQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxJQUNqQyxDQUFDO0FBQUEsRUFDTDtBQUNKO0FBQ08sSUFBTSxVQUFOLGNBQXNCLFFBQVE7QUFBQSxFQUNqQyxJQUFJLFNBQVM7QUFDVCxXQUFPLEtBQUssS0FBSyxPQUFPO0FBQUEsRUFDNUI7QUFBQSxFQUNBLE9BQU8sT0FBTztBQUNWLFVBQU0sRUFBRSxJQUFJLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUM5QyxVQUFNLGFBQWEsS0FBSyxLQUFLLE9BQU87QUFDcEMsV0FBTyxXQUFXLE9BQU8sRUFBRSxNQUFNLElBQUksTUFBTSxNQUFNLElBQUksTUFBTSxRQUFRLElBQUksQ0FBQztBQUFBLEVBQzVFO0FBQ0o7QUFDQSxRQUFRLFNBQVMsQ0FBQyxRQUFRLFdBQVc7QUFDakMsU0FBTyxJQUFJLFFBQVE7QUFBQSxJQUNmO0FBQUEsSUFDQSxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLGFBQU4sY0FBeUIsUUFBUTtBQUFBLEVBQ3BDLE9BQU8sT0FBTztBQUNWLFFBQUksTUFBTSxTQUFTLEtBQUssS0FBSyxPQUFPO0FBQ2hDLFlBQU0sTUFBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ3RDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsVUFBVSxJQUFJO0FBQUEsUUFDZCxNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLEtBQUssS0FBSztBQUFBLE1BQ3hCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFdBQU8sRUFBRSxRQUFRLFNBQVMsT0FBTyxNQUFNLEtBQUs7QUFBQSxFQUNoRDtBQUFBLEVBQ0EsSUFBSSxRQUFRO0FBQ1IsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUNKO0FBQ0EsV0FBVyxTQUFTLENBQUMsT0FBTyxXQUFXO0FBQ25DLFNBQU8sSUFBSSxXQUFXO0FBQUEsSUFDbEI7QUFBQSxJQUNBLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNBLFNBQVMsY0FBYyxRQUFRLFFBQVE7QUFDbkMsU0FBTyxJQUFJLFFBQVE7QUFBQSxJQUNmO0FBQUEsSUFDQSxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLFVBQU4sTUFBTSxpQkFBZ0IsUUFBUTtBQUFBLEVBQ2pDLE9BQU8sT0FBTztBQUNWLFFBQUksT0FBTyxNQUFNLFNBQVMsVUFBVTtBQUNoQyxZQUFNLE1BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0QyxZQUFNLGlCQUFpQixLQUFLLEtBQUs7QUFDakMsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixVQUFVLEtBQUssV0FBVyxjQUFjO0FBQUEsUUFDeEMsVUFBVSxJQUFJO0FBQUEsUUFDZCxNQUFNLGFBQWE7QUFBQSxNQUN2QixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxRQUFJLENBQUMsS0FBSyxRQUFRO0FBQ2QsV0FBSyxTQUFTLElBQUksSUFBSSxLQUFLLEtBQUssTUFBTTtBQUFBLElBQzFDO0FBQ0EsUUFBSSxDQUFDLEtBQUssT0FBTyxJQUFJLE1BQU0sSUFBSSxHQUFHO0FBQzlCLFlBQU0sTUFBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ3RDLFlBQU0saUJBQWlCLEtBQUssS0FBSztBQUNqQyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLFVBQVUsSUFBSTtBQUFBLFFBQ2QsTUFBTSxhQUFhO0FBQUEsUUFDbkIsU0FBUztBQUFBLE1BQ2IsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsV0FBTyxHQUFHLE1BQU0sSUFBSTtBQUFBLEVBQ3hCO0FBQUEsRUFDQSxJQUFJLFVBQVU7QUFDVixXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQUEsRUFDQSxJQUFJLE9BQU87QUFDUCxVQUFNLGFBQWEsQ0FBQztBQUNwQixlQUFXLE9BQU8sS0FBSyxLQUFLLFFBQVE7QUFDaEMsaUJBQVcsR0FBRyxJQUFJO0FBQUEsSUFDdEI7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsSUFBSSxTQUFTO0FBQ1QsVUFBTSxhQUFhLENBQUM7QUFDcEIsZUFBVyxPQUFPLEtBQUssS0FBSyxRQUFRO0FBQ2hDLGlCQUFXLEdBQUcsSUFBSTtBQUFBLElBQ3RCO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUNBLElBQUksT0FBTztBQUNQLFVBQU0sYUFBYSxDQUFDO0FBQ3BCLGVBQVcsT0FBTyxLQUFLLEtBQUssUUFBUTtBQUNoQyxpQkFBVyxHQUFHLElBQUk7QUFBQSxJQUN0QjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxRQUFRLFFBQVEsU0FBUyxLQUFLLE1BQU07QUFDaEMsV0FBTyxTQUFRLE9BQU8sUUFBUTtBQUFBLE1BQzFCLEdBQUcsS0FBSztBQUFBLE1BQ1IsR0FBRztBQUFBLElBQ1AsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFFBQVEsUUFBUSxTQUFTLEtBQUssTUFBTTtBQUNoQyxXQUFPLFNBQVEsT0FBTyxLQUFLLFFBQVEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLFNBQVMsR0FBRyxDQUFDLEdBQUc7QUFBQSxNQUN2RSxHQUFHLEtBQUs7QUFBQSxNQUNSLEdBQUc7QUFBQSxJQUNQLENBQUM7QUFBQSxFQUNMO0FBQ0o7QUFDQSxRQUFRLFNBQVM7QUFDVixJQUFNLGdCQUFOLGNBQTRCLFFBQVE7QUFBQSxFQUN2QyxPQUFPLE9BQU87QUFDVixVQUFNLG1CQUFtQixLQUFLLG1CQUFtQixLQUFLLEtBQUssTUFBTTtBQUNqRSxVQUFNLE1BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0QyxRQUFJLElBQUksZUFBZSxjQUFjLFVBQVUsSUFBSSxlQUFlLGNBQWMsUUFBUTtBQUNwRixZQUFNLGlCQUFpQixLQUFLLGFBQWEsZ0JBQWdCO0FBQ3pELHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsVUFBVSxLQUFLLFdBQVcsY0FBYztBQUFBLFFBQ3hDLFVBQVUsSUFBSTtBQUFBLFFBQ2QsTUFBTSxhQUFhO0FBQUEsTUFDdkIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsUUFBSSxDQUFDLEtBQUssUUFBUTtBQUNkLFdBQUssU0FBUyxJQUFJLElBQUksS0FBSyxtQkFBbUIsS0FBSyxLQUFLLE1BQU0sQ0FBQztBQUFBLElBQ25FO0FBQ0EsUUFBSSxDQUFDLEtBQUssT0FBTyxJQUFJLE1BQU0sSUFBSSxHQUFHO0FBQzlCLFlBQU0saUJBQWlCLEtBQUssYUFBYSxnQkFBZ0I7QUFDekQsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixVQUFVLElBQUk7QUFBQSxRQUNkLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFNBQVM7QUFBQSxNQUNiLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFdBQU8sR0FBRyxNQUFNLElBQUk7QUFBQSxFQUN4QjtBQUFBLEVBQ0EsSUFBSSxPQUFPO0FBQ1AsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUNKO0FBQ0EsY0FBYyxTQUFTLENBQUMsUUFBUSxXQUFXO0FBQ3ZDLFNBQU8sSUFBSSxjQUFjO0FBQUEsSUFDckI7QUFBQSxJQUNBLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sYUFBTixjQUF5QixRQUFRO0FBQUEsRUFDcEMsU0FBUztBQUNMLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFBQSxFQUNBLE9BQU8sT0FBTztBQUNWLFVBQU0sRUFBRSxJQUFJLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUM5QyxRQUFJLElBQUksZUFBZSxjQUFjLFdBQVcsSUFBSSxPQUFPLFVBQVUsT0FBTztBQUN4RSx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVUsSUFBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFVBQU0sY0FBYyxJQUFJLGVBQWUsY0FBYyxVQUFVLElBQUksT0FBTyxRQUFRLFFBQVEsSUFBSSxJQUFJO0FBQ2xHLFdBQU8sR0FBRyxZQUFZLEtBQUssQ0FBQyxTQUFTO0FBQ2pDLGFBQU8sS0FBSyxLQUFLLEtBQUssV0FBVyxNQUFNO0FBQUEsUUFDbkMsTUFBTSxJQUFJO0FBQUEsUUFDVixVQUFVLElBQUksT0FBTztBQUFBLE1BQ3pCLENBQUM7QUFBQSxJQUNMLENBQUMsQ0FBQztBQUFBLEVBQ047QUFDSjtBQUNBLFdBQVcsU0FBUyxDQUFDLFFBQVEsV0FBVztBQUNwQyxTQUFPLElBQUksV0FBVztBQUFBLElBQ2xCLE1BQU07QUFBQSxJQUNOLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sYUFBTixjQUF5QixRQUFRO0FBQUEsRUFDcEMsWUFBWTtBQUNSLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFBQSxFQUNBLGFBQWE7QUFDVCxXQUFPLEtBQUssS0FBSyxPQUFPLEtBQUssYUFBYSxzQkFBc0IsYUFDMUQsS0FBSyxLQUFLLE9BQU8sV0FBVyxJQUM1QixLQUFLLEtBQUs7QUFBQSxFQUNwQjtBQUFBLEVBQ0EsT0FBTyxPQUFPO0FBQ1YsVUFBTSxFQUFFLFFBQVEsSUFBSSxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFDdEQsVUFBTSxTQUFTLEtBQUssS0FBSyxVQUFVO0FBQ25DLFVBQU0sV0FBVztBQUFBLE1BQ2IsVUFBVSxDQUFDLFFBQVE7QUFDZiwwQkFBa0IsS0FBSyxHQUFHO0FBQzFCLFlBQUksSUFBSSxPQUFPO0FBQ1gsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCLE9BQ0s7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKO0FBQUEsTUFDQSxJQUFJLE9BQU87QUFDUCxlQUFPLElBQUk7QUFBQSxNQUNmO0FBQUEsSUFDSjtBQUNBLGFBQVMsV0FBVyxTQUFTLFNBQVMsS0FBSyxRQUFRO0FBQ25ELFFBQUksT0FBTyxTQUFTLGNBQWM7QUFDOUIsWUFBTSxZQUFZLE9BQU8sVUFBVSxJQUFJLE1BQU0sUUFBUTtBQUNyRCxVQUFJLElBQUksT0FBTyxPQUFPO0FBQ2xCLGVBQU8sUUFBUSxRQUFRLFNBQVMsRUFBRSxLQUFLLE9BQU9DLGVBQWM7QUFDeEQsY0FBSSxPQUFPLFVBQVU7QUFDakIsbUJBQU87QUFDWCxnQkFBTSxTQUFTLE1BQU0sS0FBSyxLQUFLLE9BQU8sWUFBWTtBQUFBLFlBQzlDLE1BQU1BO0FBQUEsWUFDTixNQUFNLElBQUk7QUFBQSxZQUNWLFFBQVE7QUFBQSxVQUNaLENBQUM7QUFDRCxjQUFJLE9BQU8sV0FBVztBQUNsQixtQkFBTztBQUNYLGNBQUksT0FBTyxXQUFXO0FBQ2xCLG1CQUFPLE1BQU0sT0FBTyxLQUFLO0FBQzdCLGNBQUksT0FBTyxVQUFVO0FBQ2pCLG1CQUFPLE1BQU0sT0FBTyxLQUFLO0FBQzdCLGlCQUFPO0FBQUEsUUFDWCxDQUFDO0FBQUEsTUFDTCxPQUNLO0FBQ0QsWUFBSSxPQUFPLFVBQVU7QUFDakIsaUJBQU87QUFDWCxjQUFNLFNBQVMsS0FBSyxLQUFLLE9BQU8sV0FBVztBQUFBLFVBQ3ZDLE1BQU07QUFBQSxVQUNOLE1BQU0sSUFBSTtBQUFBLFVBQ1YsUUFBUTtBQUFBLFFBQ1osQ0FBQztBQUNELFlBQUksT0FBTyxXQUFXO0FBQ2xCLGlCQUFPO0FBQ1gsWUFBSSxPQUFPLFdBQVc7QUFDbEIsaUJBQU8sTUFBTSxPQUFPLEtBQUs7QUFDN0IsWUFBSSxPQUFPLFVBQVU7QUFDakIsaUJBQU8sTUFBTSxPQUFPLEtBQUs7QUFDN0IsZUFBTztBQUFBLE1BQ1g7QUFBQSxJQUNKO0FBQ0EsUUFBSSxPQUFPLFNBQVMsY0FBYztBQUM5QixZQUFNLG9CQUFvQixDQUFDLFFBQVE7QUFDL0IsY0FBTSxTQUFTLE9BQU8sV0FBVyxLQUFLLFFBQVE7QUFDOUMsWUFBSSxJQUFJLE9BQU8sT0FBTztBQUNsQixpQkFBTyxRQUFRLFFBQVEsTUFBTTtBQUFBLFFBQ2pDO0FBQ0EsWUFBSSxrQkFBa0IsU0FBUztBQUMzQixnQkFBTSxJQUFJLE1BQU0sMkZBQTJGO0FBQUEsUUFDL0c7QUFDQSxlQUFPO0FBQUEsTUFDWDtBQUNBLFVBQUksSUFBSSxPQUFPLFVBQVUsT0FBTztBQUM1QixjQUFNLFFBQVEsS0FBSyxLQUFLLE9BQU8sV0FBVztBQUFBLFVBQ3RDLE1BQU0sSUFBSTtBQUFBLFVBQ1YsTUFBTSxJQUFJO0FBQUEsVUFDVixRQUFRO0FBQUEsUUFDWixDQUFDO0FBQ0QsWUFBSSxNQUFNLFdBQVc7QUFDakIsaUJBQU87QUFDWCxZQUFJLE1BQU0sV0FBVztBQUNqQixpQkFBTyxNQUFNO0FBRWpCLDBCQUFrQixNQUFNLEtBQUs7QUFDN0IsZUFBTyxFQUFFLFFBQVEsT0FBTyxPQUFPLE9BQU8sTUFBTSxNQUFNO0FBQUEsTUFDdEQsT0FDSztBQUNELGVBQU8sS0FBSyxLQUFLLE9BQU8sWUFBWSxFQUFFLE1BQU0sSUFBSSxNQUFNLE1BQU0sSUFBSSxNQUFNLFFBQVEsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLFVBQVU7QUFDakcsY0FBSSxNQUFNLFdBQVc7QUFDakIsbUJBQU87QUFDWCxjQUFJLE1BQU0sV0FBVztBQUNqQixtQkFBTyxNQUFNO0FBQ2pCLGlCQUFPLGtCQUFrQixNQUFNLEtBQUssRUFBRSxLQUFLLE1BQU07QUFDN0MsbUJBQU8sRUFBRSxRQUFRLE9BQU8sT0FBTyxPQUFPLE1BQU0sTUFBTTtBQUFBLFVBQ3RELENBQUM7QUFBQSxRQUNMLENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSjtBQUNBLFFBQUksT0FBTyxTQUFTLGFBQWE7QUFDN0IsVUFBSSxJQUFJLE9BQU8sVUFBVSxPQUFPO0FBQzVCLGNBQU0sT0FBTyxLQUFLLEtBQUssT0FBTyxXQUFXO0FBQUEsVUFDckMsTUFBTSxJQUFJO0FBQUEsVUFDVixNQUFNLElBQUk7QUFBQSxVQUNWLFFBQVE7QUFBQSxRQUNaLENBQUM7QUFDRCxZQUFJLENBQUMsUUFBUSxJQUFJO0FBQ2IsaUJBQU87QUFDWCxjQUFNLFNBQVMsT0FBTyxVQUFVLEtBQUssT0FBTyxRQUFRO0FBQ3BELFlBQUksa0JBQWtCLFNBQVM7QUFDM0IsZ0JBQU0sSUFBSSxNQUFNLGlHQUFpRztBQUFBLFFBQ3JIO0FBQ0EsZUFBTyxFQUFFLFFBQVEsT0FBTyxPQUFPLE9BQU8sT0FBTztBQUFBLE1BQ2pELE9BQ0s7QUFDRCxlQUFPLEtBQUssS0FBSyxPQUFPLFlBQVksRUFBRSxNQUFNLElBQUksTUFBTSxNQUFNLElBQUksTUFBTSxRQUFRLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxTQUFTO0FBQ2hHLGNBQUksQ0FBQyxRQUFRLElBQUk7QUFDYixtQkFBTztBQUNYLGlCQUFPLFFBQVEsUUFBUSxPQUFPLFVBQVUsS0FBSyxPQUFPLFFBQVEsQ0FBQyxFQUFFLEtBQUssQ0FBQyxZQUFZO0FBQUEsWUFDN0UsUUFBUSxPQUFPO0FBQUEsWUFDZixPQUFPO0FBQUEsVUFDWCxFQUFFO0FBQUEsUUFDTixDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0o7QUFDQSxTQUFLLFlBQVksTUFBTTtBQUFBLEVBQzNCO0FBQ0o7QUFDQSxXQUFXLFNBQVMsQ0FBQyxRQUFRLFFBQVEsV0FBVztBQUM1QyxTQUFPLElBQUksV0FBVztBQUFBLElBQ2xCO0FBQUEsSUFDQSxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDO0FBQUEsSUFDQSxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ0EsV0FBVyx1QkFBdUIsQ0FBQyxZQUFZLFFBQVEsV0FBVztBQUM5RCxTQUFPLElBQUksV0FBVztBQUFBLElBQ2xCO0FBQUEsSUFDQSxRQUFRLEVBQUUsTUFBTSxjQUFjLFdBQVcsV0FBVztBQUFBLElBQ3BELFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUVPLElBQU0sY0FBTixjQUEwQixRQUFRO0FBQUEsRUFDckMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxhQUFhLEtBQUssU0FBUyxLQUFLO0FBQ3RDLFFBQUksZUFBZSxjQUFjLFdBQVc7QUFDeEMsYUFBTyxHQUFHLE1BQVM7QUFBQSxJQUN2QjtBQUNBLFdBQU8sS0FBSyxLQUFLLFVBQVUsT0FBTyxLQUFLO0FBQUEsRUFDM0M7QUFBQSxFQUNBLFNBQVM7QUFDTCxXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQ0o7QUFDQSxZQUFZLFNBQVMsQ0FBQyxNQUFNLFdBQVc7QUFDbkMsU0FBTyxJQUFJLFlBQVk7QUFBQSxJQUNuQixXQUFXO0FBQUEsSUFDWCxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLGNBQU4sY0FBMEIsUUFBUTtBQUFBLEVBQ3JDLE9BQU8sT0FBTztBQUNWLFVBQU0sYUFBYSxLQUFLLFNBQVMsS0FBSztBQUN0QyxRQUFJLGVBQWUsY0FBYyxNQUFNO0FBQ25DLGFBQU8sR0FBRyxJQUFJO0FBQUEsSUFDbEI7QUFDQSxXQUFPLEtBQUssS0FBSyxVQUFVLE9BQU8sS0FBSztBQUFBLEVBQzNDO0FBQUEsRUFDQSxTQUFTO0FBQ0wsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUNKO0FBQ0EsWUFBWSxTQUFTLENBQUMsTUFBTSxXQUFXO0FBQ25DLFNBQU8sSUFBSSxZQUFZO0FBQUEsSUFDbkIsV0FBVztBQUFBLElBQ1gsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxhQUFOLGNBQXlCLFFBQVE7QUFBQSxFQUNwQyxPQUFPLE9BQU87QUFDVixVQUFNLEVBQUUsSUFBSSxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFDOUMsUUFBSSxPQUFPLElBQUk7QUFDZixRQUFJLElBQUksZUFBZSxjQUFjLFdBQVc7QUFDNUMsYUFBTyxLQUFLLEtBQUssYUFBYTtBQUFBLElBQ2xDO0FBQ0EsV0FBTyxLQUFLLEtBQUssVUFBVSxPQUFPO0FBQUEsTUFDOUI7QUFBQSxNQUNBLE1BQU0sSUFBSTtBQUFBLE1BQ1YsUUFBUTtBQUFBLElBQ1osQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLGdCQUFnQjtBQUNaLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFDSjtBQUNBLFdBQVcsU0FBUyxDQUFDLE1BQU0sV0FBVztBQUNsQyxTQUFPLElBQUksV0FBVztBQUFBLElBQ2xCLFdBQVc7QUFBQSxJQUNYLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsY0FBYyxPQUFPLE9BQU8sWUFBWSxhQUFhLE9BQU8sVUFBVSxNQUFNLE9BQU87QUFBQSxJQUNuRixHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxXQUFOLGNBQXVCLFFBQVE7QUFBQSxFQUNsQyxPQUFPLE9BQU87QUFDVixVQUFNLEVBQUUsSUFBSSxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFFOUMsVUFBTSxTQUFTO0FBQUEsTUFDWCxHQUFHO0FBQUEsTUFDSCxRQUFRO0FBQUEsUUFDSixHQUFHLElBQUk7QUFBQSxRQUNQLFFBQVEsQ0FBQztBQUFBLE1BQ2I7QUFBQSxJQUNKO0FBQ0EsVUFBTSxTQUFTLEtBQUssS0FBSyxVQUFVLE9BQU87QUFBQSxNQUN0QyxNQUFNLE9BQU87QUFBQSxNQUNiLE1BQU0sT0FBTztBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ0osR0FBRztBQUFBLE1BQ1A7QUFBQSxJQUNKLENBQUM7QUFDRCxRQUFJLFFBQVEsTUFBTSxHQUFHO0FBQ2pCLGFBQU8sT0FBTyxLQUFLLENBQUNDLFlBQVc7QUFDM0IsZUFBTztBQUFBLFVBQ0gsUUFBUTtBQUFBLFVBQ1IsT0FBT0EsUUFBTyxXQUFXLFVBQ25CQSxRQUFPLFFBQ1AsS0FBSyxLQUFLLFdBQVc7QUFBQSxZQUNuQixJQUFJLFFBQVE7QUFDUixxQkFBTyxJQUFJLFNBQVMsT0FBTyxPQUFPLE1BQU07QUFBQSxZQUM1QztBQUFBLFlBQ0EsT0FBTyxPQUFPO0FBQUEsVUFDbEIsQ0FBQztBQUFBLFFBQ1Q7QUFBQSxNQUNKLENBQUM7QUFBQSxJQUNMLE9BQ0s7QUFDRCxhQUFPO0FBQUEsUUFDSCxRQUFRO0FBQUEsUUFDUixPQUFPLE9BQU8sV0FBVyxVQUNuQixPQUFPLFFBQ1AsS0FBSyxLQUFLLFdBQVc7QUFBQSxVQUNuQixJQUFJLFFBQVE7QUFDUixtQkFBTyxJQUFJLFNBQVMsT0FBTyxPQUFPLE1BQU07QUFBQSxVQUM1QztBQUFBLFVBQ0EsT0FBTyxPQUFPO0FBQUEsUUFDbEIsQ0FBQztBQUFBLE1BQ1Q7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0EsY0FBYztBQUNWLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFDSjtBQUNBLFNBQVMsU0FBUyxDQUFDLE1BQU0sV0FBVztBQUNoQyxTQUFPLElBQUksU0FBUztBQUFBLElBQ2hCLFdBQVc7QUFBQSxJQUNYLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsWUFBWSxPQUFPLE9BQU8sVUFBVSxhQUFhLE9BQU8sUUFBUSxNQUFNLE9BQU87QUFBQSxJQUM3RSxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxTQUFOLGNBQXFCLFFBQVE7QUFBQSxFQUNoQyxPQUFPLE9BQU87QUFDVixVQUFNLGFBQWEsS0FBSyxTQUFTLEtBQUs7QUFDdEMsUUFBSSxlQUFlLGNBQWMsS0FBSztBQUNsQyxZQUFNLE1BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0Qyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVUsSUFBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFdBQU8sRUFBRSxRQUFRLFNBQVMsT0FBTyxNQUFNLEtBQUs7QUFBQSxFQUNoRDtBQUNKO0FBQ0EsT0FBTyxTQUFTLENBQUMsV0FBVztBQUN4QixTQUFPLElBQUksT0FBTztBQUFBLElBQ2QsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxRQUFRLE9BQU8sV0FBVztBQUNoQyxJQUFNLGFBQU4sY0FBeUIsUUFBUTtBQUFBLEVBQ3BDLE9BQU8sT0FBTztBQUNWLFVBQU0sRUFBRSxJQUFJLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUM5QyxVQUFNLE9BQU8sSUFBSTtBQUNqQixXQUFPLEtBQUssS0FBSyxLQUFLLE9BQU87QUFBQSxNQUN6QjtBQUFBLE1BQ0EsTUFBTSxJQUFJO0FBQUEsTUFDVixRQUFRO0FBQUEsSUFDWixDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsU0FBUztBQUNMLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFDSjtBQUNPLElBQU0sY0FBTixNQUFNLHFCQUFvQixRQUFRO0FBQUEsRUFDckMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxFQUFFLFFBQVEsSUFBSSxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFDdEQsUUFBSSxJQUFJLE9BQU8sT0FBTztBQUNsQixZQUFNLGNBQWMsWUFBWTtBQUM1QixjQUFNLFdBQVcsTUFBTSxLQUFLLEtBQUssR0FBRyxZQUFZO0FBQUEsVUFDNUMsTUFBTSxJQUFJO0FBQUEsVUFDVixNQUFNLElBQUk7QUFBQSxVQUNWLFFBQVE7QUFBQSxRQUNaLENBQUM7QUFDRCxZQUFJLFNBQVMsV0FBVztBQUNwQixpQkFBTztBQUNYLFlBQUksU0FBUyxXQUFXLFNBQVM7QUFDN0IsaUJBQU8sTUFBTTtBQUNiLGlCQUFPLE1BQU0sU0FBUyxLQUFLO0FBQUEsUUFDL0IsT0FDSztBQUNELGlCQUFPLEtBQUssS0FBSyxJQUFJLFlBQVk7QUFBQSxZQUM3QixNQUFNLFNBQVM7QUFBQSxZQUNmLE1BQU0sSUFBSTtBQUFBLFlBQ1YsUUFBUTtBQUFBLFVBQ1osQ0FBQztBQUFBLFFBQ0w7QUFBQSxNQUNKO0FBQ0EsYUFBTyxZQUFZO0FBQUEsSUFDdkIsT0FDSztBQUNELFlBQU0sV0FBVyxLQUFLLEtBQUssR0FBRyxXQUFXO0FBQUEsUUFDckMsTUFBTSxJQUFJO0FBQUEsUUFDVixNQUFNLElBQUk7QUFBQSxRQUNWLFFBQVE7QUFBQSxNQUNaLENBQUM7QUFDRCxVQUFJLFNBQVMsV0FBVztBQUNwQixlQUFPO0FBQ1gsVUFBSSxTQUFTLFdBQVcsU0FBUztBQUM3QixlQUFPLE1BQU07QUFDYixlQUFPO0FBQUEsVUFDSCxRQUFRO0FBQUEsVUFDUixPQUFPLFNBQVM7QUFBQSxRQUNwQjtBQUFBLE1BQ0osT0FDSztBQUNELGVBQU8sS0FBSyxLQUFLLElBQUksV0FBVztBQUFBLFVBQzVCLE1BQU0sU0FBUztBQUFBLFVBQ2YsTUFBTSxJQUFJO0FBQUEsVUFDVixRQUFRO0FBQUEsUUFDWixDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxPQUFPLE9BQU8sR0FBRyxHQUFHO0FBQ2hCLFdBQU8sSUFBSSxhQUFZO0FBQUEsTUFDbkIsSUFBSTtBQUFBLE1BQ0osS0FBSztBQUFBLE1BQ0wsVUFBVSxzQkFBc0I7QUFBQSxJQUNwQyxDQUFDO0FBQUEsRUFDTDtBQUNKO0FBQ08sSUFBTSxjQUFOLGNBQTBCLFFBQVE7QUFBQSxFQUNyQyxPQUFPLE9BQU87QUFDVixVQUFNLFNBQVMsS0FBSyxLQUFLLFVBQVUsT0FBTyxLQUFLO0FBQy9DLFVBQU0sU0FBUyxDQUFDLFNBQVM7QUFDckIsVUFBSSxRQUFRLElBQUksR0FBRztBQUNmLGFBQUssUUFBUSxPQUFPLE9BQU8sS0FBSyxLQUFLO0FBQUEsTUFDekM7QUFDQSxhQUFPO0FBQUEsSUFDWDtBQUNBLFdBQU8sUUFBUSxNQUFNLElBQUksT0FBTyxLQUFLLENBQUMsU0FBUyxPQUFPLElBQUksQ0FBQyxJQUFJLE9BQU8sTUFBTTtBQUFBLEVBQ2hGO0FBQUEsRUFDQSxTQUFTO0FBQ0wsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUNKO0FBQ0EsWUFBWSxTQUFTLENBQUMsTUFBTSxXQUFXO0FBQ25DLFNBQU8sSUFBSSxZQUFZO0FBQUEsSUFDbkIsV0FBVztBQUFBLElBQ1gsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBUUEsU0FBUyxZQUFZLFFBQVEsTUFBTTtBQUMvQixRQUFNLElBQUksT0FBTyxXQUFXLGFBQWEsT0FBTyxJQUFJLElBQUksT0FBTyxXQUFXLFdBQVcsRUFBRSxTQUFTLE9BQU8sSUFBSTtBQUMzRyxRQUFNLEtBQUssT0FBTyxNQUFNLFdBQVcsRUFBRSxTQUFTLEVBQUUsSUFBSTtBQUNwRCxTQUFPO0FBQ1g7QUFDTyxTQUFTLE9BQU8sT0FBTyxVQUFVLENBQUMsR0FXekMsT0FBTztBQUNILE1BQUk7QUFDQSxXQUFPLE9BQU8sT0FBTyxFQUFFLFlBQVksQ0FBQyxNQUFNLFFBQVE7QUFDOUMsWUFBTSxJQUFJLE1BQU0sSUFBSTtBQUNwQixVQUFJLGFBQWEsU0FBUztBQUN0QixlQUFPLEVBQUUsS0FBSyxDQUFDQyxPQUFNO0FBQ2pCLGNBQUksQ0FBQ0EsSUFBRztBQUNKLGtCQUFNLFNBQVMsWUFBWSxTQUFTLElBQUk7QUFDeEMsa0JBQU0sU0FBUyxPQUFPLFNBQVMsU0FBUztBQUN4QyxnQkFBSSxTQUFTLEVBQUUsTUFBTSxVQUFVLEdBQUcsUUFBUSxPQUFPLE9BQU8sQ0FBQztBQUFBLFVBQzdEO0FBQUEsUUFDSixDQUFDO0FBQUEsTUFDTDtBQUNBLFVBQUksQ0FBQyxHQUFHO0FBQ0osY0FBTSxTQUFTLFlBQVksU0FBUyxJQUFJO0FBQ3hDLGNBQU0sU0FBUyxPQUFPLFNBQVMsU0FBUztBQUN4QyxZQUFJLFNBQVMsRUFBRSxNQUFNLFVBQVUsR0FBRyxRQUFRLE9BQU8sT0FBTyxDQUFDO0FBQUEsTUFDN0Q7QUFDQTtBQUFBLElBQ0osQ0FBQztBQUNMLFNBQU8sT0FBTyxPQUFPO0FBQ3pCO0FBRU8sSUFBTSxPQUFPO0FBQUEsRUFDaEIsUUFBUSxVQUFVO0FBQ3RCO0FBQ08sSUFBSTtBQUFBLENBQ1YsU0FBVUMsd0JBQXVCO0FBQzlCLEVBQUFBLHVCQUFzQixXQUFXLElBQUk7QUFDckMsRUFBQUEsdUJBQXNCLFdBQVcsSUFBSTtBQUNyQyxFQUFBQSx1QkFBc0IsUUFBUSxJQUFJO0FBQ2xDLEVBQUFBLHVCQUFzQixXQUFXLElBQUk7QUFDckMsRUFBQUEsdUJBQXNCLFlBQVksSUFBSTtBQUN0QyxFQUFBQSx1QkFBc0IsU0FBUyxJQUFJO0FBQ25DLEVBQUFBLHVCQUFzQixXQUFXLElBQUk7QUFDckMsRUFBQUEsdUJBQXNCLGNBQWMsSUFBSTtBQUN4QyxFQUFBQSx1QkFBc0IsU0FBUyxJQUFJO0FBQ25DLEVBQUFBLHVCQUFzQixRQUFRLElBQUk7QUFDbEMsRUFBQUEsdUJBQXNCLFlBQVksSUFBSTtBQUN0QyxFQUFBQSx1QkFBc0IsVUFBVSxJQUFJO0FBQ3BDLEVBQUFBLHVCQUFzQixTQUFTLElBQUk7QUFDbkMsRUFBQUEsdUJBQXNCLFVBQVUsSUFBSTtBQUNwQyxFQUFBQSx1QkFBc0IsV0FBVyxJQUFJO0FBQ3JDLEVBQUFBLHVCQUFzQixVQUFVLElBQUk7QUFDcEMsRUFBQUEsdUJBQXNCLHVCQUF1QixJQUFJO0FBQ2pELEVBQUFBLHVCQUFzQixpQkFBaUIsSUFBSTtBQUMzQyxFQUFBQSx1QkFBc0IsVUFBVSxJQUFJO0FBQ3BDLEVBQUFBLHVCQUFzQixXQUFXLElBQUk7QUFDckMsRUFBQUEsdUJBQXNCLFFBQVEsSUFBSTtBQUNsQyxFQUFBQSx1QkFBc0IsUUFBUSxJQUFJO0FBQ2xDLEVBQUFBLHVCQUFzQixhQUFhLElBQUk7QUFDdkMsRUFBQUEsdUJBQXNCLFNBQVMsSUFBSTtBQUNuQyxFQUFBQSx1QkFBc0IsWUFBWSxJQUFJO0FBQ3RDLEVBQUFBLHVCQUFzQixTQUFTLElBQUk7QUFDbkMsRUFBQUEsdUJBQXNCLFlBQVksSUFBSTtBQUN0QyxFQUFBQSx1QkFBc0IsZUFBZSxJQUFJO0FBQ3pDLEVBQUFBLHVCQUFzQixhQUFhLElBQUk7QUFDdkMsRUFBQUEsdUJBQXNCLGFBQWEsSUFBSTtBQUN2QyxFQUFBQSx1QkFBc0IsWUFBWSxJQUFJO0FBQ3RDLEVBQUFBLHVCQUFzQixVQUFVLElBQUk7QUFDcEMsRUFBQUEsdUJBQXNCLFlBQVksSUFBSTtBQUN0QyxFQUFBQSx1QkFBc0IsWUFBWSxJQUFJO0FBQ3RDLEVBQUFBLHVCQUFzQixhQUFhLElBQUk7QUFDdkMsRUFBQUEsdUJBQXNCLGFBQWEsSUFBSTtBQUMzQyxHQUFHLDBCQUEwQix3QkFBd0IsQ0FBQyxFQUFFO0FBS3hELElBQU0saUJBQWlCLENBRXZCLEtBQUssU0FBUztBQUFBLEVBQ1YsU0FBUyx5QkFBeUIsSUFBSSxJQUFJO0FBQzlDLE1BQU0sT0FBTyxDQUFDLFNBQVMsZ0JBQWdCLEtBQUssTUFBTTtBQUNsRCxJQUFNLGFBQWEsVUFBVTtBQUM3QixJQUFNLGFBQWEsVUFBVTtBQUM3QixJQUFNLFVBQVUsT0FBTztBQUN2QixJQUFNLGFBQWEsVUFBVTtBQUM3QixJQUFNLGNBQWMsV0FBVztBQUMvQixJQUFNLFdBQVcsUUFBUTtBQUN6QixJQUFNLGFBQWEsVUFBVTtBQUM3QixJQUFNLGdCQUFnQixhQUFhO0FBQ25DLElBQU0sV0FBVyxRQUFRO0FBQ3pCLElBQU0sVUFBVSxPQUFPO0FBQ3ZCLElBQU0sY0FBYyxXQUFXO0FBQy9CLElBQU0sWUFBWSxTQUFTO0FBQzNCLElBQU0sV0FBVyxRQUFRO0FBQ3pCLElBQU0sWUFBWSxTQUFTO0FBQzNCLElBQU0sYUFBYSxVQUFVO0FBQzdCLElBQU0sbUJBQW1CLFVBQVU7QUFDbkMsSUFBTSxZQUFZLFNBQVM7QUFDM0IsSUFBTSx5QkFBeUIsc0JBQXNCO0FBQ3JELElBQU0sbUJBQW1CLGdCQUFnQjtBQUN6QyxJQUFNLFlBQVksU0FBUztBQUMzQixJQUFNLGFBQWEsVUFBVTtBQUM3QixJQUFNLFVBQVUsT0FBTztBQUN2QixJQUFNLFVBQVUsT0FBTztBQUN2QixJQUFNLGVBQWUsWUFBWTtBQUNqQyxJQUFNLFdBQVcsUUFBUTtBQUN6QixJQUFNLGNBQWMsV0FBVztBQUMvQixJQUFNLFdBQVcsUUFBUTtBQUN6QixJQUFNLGlCQUFpQixjQUFjO0FBQ3JDLElBQU0sY0FBYyxXQUFXO0FBQy9CLElBQU0sY0FBYyxXQUFXO0FBQy9CLElBQU0sZUFBZSxZQUFZO0FBQ2pDLElBQU0sZUFBZSxZQUFZO0FBQ2pDLElBQU0saUJBQWlCLFdBQVc7QUFDbEMsSUFBTSxlQUFlLFlBQVk7QUFDakMsSUFBTSxVQUFVLE1BQU0sV0FBVyxFQUFFLFNBQVM7QUFDNUMsSUFBTSxVQUFVLE1BQU0sV0FBVyxFQUFFLFNBQVM7QUFDNUMsSUFBTSxXQUFXLE1BQU0sWUFBWSxFQUFFLFNBQVM7QUFDdkMsSUFBTSxTQUFTO0FBQUEsRUFDbEIsUUFBUyxDQUFDLFFBQVEsVUFBVSxPQUFPLEVBQUUsR0FBRyxLQUFLLFFBQVEsS0FBSyxDQUFDO0FBQUEsRUFDM0QsUUFBUyxDQUFDLFFBQVEsVUFBVSxPQUFPLEVBQUUsR0FBRyxLQUFLLFFBQVEsS0FBSyxDQUFDO0FBQUEsRUFDM0QsU0FBVSxDQUFDLFFBQVEsV0FBVyxPQUFPO0FBQUEsSUFDakMsR0FBRztBQUFBLElBQ0gsUUFBUTtBQUFBLEVBQ1osQ0FBQztBQUFBLEVBQ0QsUUFBUyxDQUFDLFFBQVEsVUFBVSxPQUFPLEVBQUUsR0FBRyxLQUFLLFFBQVEsS0FBSyxDQUFDO0FBQUEsRUFDM0QsTUFBTyxDQUFDLFFBQVEsUUFBUSxPQUFPLEVBQUUsR0FBRyxLQUFLLFFBQVEsS0FBSyxDQUFDO0FBQzNEO0FBRU8sSUFBTSxRQUFROzs7QUNqbEhkLElBQU0sYUFBYSxpQkFBRSxLQUFLLENBQUMsUUFBUSxVQUFVLE9BQU8sQ0FBQztBQUtyRCxJQUFNLHFCQUFxQixpQkFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBS2pELElBQU0sZUFBZTtBQUFBLEVBQzFCLE9BQU8sbUJBQW1CLFNBQVM7QUFBQSxFQUNuQyxPQUFPLFdBQVcsU0FBUztBQUM3Qjs7O0FDL0JBLElBQU0sZUFBZTtBQUNkLElBQU0sV0FBVyxpQkFDckIsT0FBTztBQUFBLEVBQ04sR0FBRyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDO0FBQUEsRUFDekIsR0FBRyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDO0FBQUEsRUFDekIsR0FBRyxpQkFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsRUFDekIsR0FBRyxpQkFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQzNCLENBQUMsRUFDQTtBQUFBLEVBQ0MsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssSUFBSSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsS0FBSyxJQUFJO0FBQUEsRUFDekQsRUFBRSxTQUFTLHVFQUE2RDtBQUMxRTtBQVFLLElBQU0sYUFBYSxpQkFBRSxPQUFPO0FBQUEsRUFDakMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxPQUFPO0FBQUEsRUFDdkIsS0FBSyxpQkFBRSxPQUFPLEVBQUUsSUFBSTtBQUFBO0FBQUE7QUFBQSxFQUdwQixLQUFLLGlCQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUU7QUFBQSxFQUMxQixTQUFTLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUE7QUFBQTtBQUFBLEVBRzdCLEdBQUc7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBUUgsTUFBTSxTQUFTLFNBQVM7QUFBQSxFQUN4QixXQUFXLGlCQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUztBQUM1QyxDQUFDOzs7QUNqQk0sSUFBTSxhQUFhLGlCQUFFLE9BQU87QUFBQSxFQUNqQyxNQUFNLGlCQUFFLE9BQU87QUFBQSxFQUNmLE1BQU0saUJBQUUsT0FBTztBQUFBLEVBQ2YsTUFBTSxpQkFBRSxPQUFPO0FBQUEsRUFDZixNQUFNLGlCQUFFLE9BQU87QUFBQSxFQUNmLFdBQVcsaUJBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUM7QUFBQSxFQUMxQyxXQUFXLGlCQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDMUMsVUFBVSxpQkFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQUE7QUFBQTtBQUFBLEVBR2xDLFlBQVksaUJBQUUsUUFBUSxFQUFFLFFBQVEsSUFBSTtBQUN0QyxDQUFDO0FBU00sSUFBTSxnQkFBZ0IsaUJBQUUsS0FBSyxDQUFDLFFBQVEsUUFBUSxDQUFDO0FBSy9DLElBQU0sY0FBYyxpQkFBRSxPQUFPO0FBQUEsRUFDbEMsS0FBSyxpQkFBRSxPQUFPLEVBQUUsU0FBUztBQUFBLEVBQ3pCLFVBQVUsY0FBYyxTQUFTO0FBQUEsRUFDakMsS0FBSyxpQkFBRSxPQUFPLEVBQUUsU0FBUztBQUFBLEVBQ3pCLFVBQVUsY0FBYyxTQUFTO0FBQ25DLENBQUM7QUFlTSxJQUFNLGNBQWMsaUJBQUUsT0FBTztBQUFBLEVBQ2xDLFFBQVEsaUJBQUUsUUFBUSxRQUFRO0FBQUEsRUFDMUIsT0FBTyxpQkFBRSxPQUFPO0FBQUEsRUFDaEIsV0FBVyxpQkFBRSxPQUFPO0FBQUEsRUFDcEIsZ0JBQWdCLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQUEsRUFDcEQsb0JBQW9CLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQzFELENBQUM7QUFHTSxJQUFNLGlCQUFpQixpQkFBRSxPQUFPO0FBQUEsRUFDckMsUUFBUSxpQkFBRSxRQUFRLFdBQVc7QUFBQSxFQUM3QixHQUFHLGlCQUFFLE9BQU87QUFBQSxFQUNaLEdBQUcsaUJBQUUsT0FBTztBQUFBLEVBQ1osR0FBRyxpQkFBRSxPQUFPO0FBQUEsRUFDWixZQUFZLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQUEsRUFDaEQsWUFBWSxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUFBLEVBQ2hELFlBQVksaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFDbEQsQ0FBQztBQUdNLElBQU0sYUFBYSxpQkFBRSxPQUFPO0FBQUEsRUFDakMsUUFBUSxpQkFBRSxRQUFRLE9BQU87QUFBQSxFQUN6QixHQUFHLGlCQUFFLE9BQU87QUFBQSxFQUNaLEdBQUcsaUJBQUUsT0FBTztBQUFBLEVBQ1osR0FBRyxpQkFBRSxPQUFPO0FBQUEsRUFDWixHQUFHLGlCQUFFLE9BQU87QUFBQSxFQUNaLFlBQVksaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFBQSxFQUNoRCxZQUFZLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQUEsRUFDaEQsWUFBWSxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUFBLEVBQ2hELFlBQVksaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFDbEQsQ0FBQztBQUdNLElBQU0sZUFBZSxpQkFBRSxPQUFPO0FBQUEsRUFDbkMsUUFBUSxpQkFBRSxRQUFRLFNBQVM7QUFBQSxFQUMzQixHQUFHLGlCQUFFLE9BQU87QUFBQSxFQUNaLEdBQUcsaUJBQUUsT0FBTztBQUFBLEVBQ1osR0FBRyxpQkFBRSxPQUFPO0FBQUEsRUFDWixHQUFHLGlCQUFFLE9BQU87QUFBQSxFQUNaLEdBQUcsaUJBQUUsT0FBTztBQUFBLEVBQ1osWUFBWSxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUFBLEVBQ2hELFlBQVksaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFBQSxFQUNoRCxZQUFZLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQUEsRUFDaEQsWUFBWSxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUFBLEVBQ2hELFlBQVksaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFDbEQsQ0FBQztBQUdNLElBQU0sbUJBQW1CLGlCQUFFLE9BQU87QUFBQSxFQUN2QyxRQUFRLGlCQUFFLFFBQVEsYUFBYTtBQUFBLEVBQy9CLEdBQUcsaUJBQUUsT0FBTztBQUFBLEVBQ1osR0FBRyxpQkFBRSxPQUFPO0FBQUEsRUFDWixZQUFZLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQUEsRUFDaEQsWUFBWSxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUNsRCxDQUFDO0FBR00sSUFBTSxtQkFBbUIsaUJBQUUsT0FBTztBQUFBLEVBQ3ZDLFFBQVEsaUJBQUUsUUFBUSxhQUFhO0FBQUEsRUFDL0IsR0FBRyxpQkFBRSxPQUFPO0FBQUEsRUFDWixHQUFHLGlCQUFFLE9BQU87QUFBQSxFQUNaLFlBQVksaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFBQSxFQUNoRCxZQUFZLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQ2xELENBQUM7QUFPTSxJQUFNLGdCQUFnQixpQkFBRSxPQUFPO0FBQUEsRUFDcEMsUUFBUSxpQkFBRSxRQUFRLFVBQVU7QUFBQSxFQUM1QixHQUFHLGlCQUFFLE9BQU87QUFBQSxFQUNaLFlBQVksaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFDbEQsQ0FBQztBQUtNLElBQU0sZ0JBQWdCLGlCQUFFLG1CQUFtQixVQUFVO0FBQUEsRUFDMUQ7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBWU0sSUFBTSxnQkFBZ0IsaUJBQUUsS0FBSztBQUFBLEVBQ2xDO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFHRCxJQUFNLGdCQUFnQixpQkFBRSxPQUFPO0FBQUEsRUFDN0IsTUFBTSxpQkFBRSxRQUFRLE9BQU87QUFBQSxFQUN2QixJQUFJLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxPQUFPLEdBQUcsaUJBQUUsT0FBTyxDQUFDLENBQUM7QUFBQSxFQUNwQyxPQUFPLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUE7QUFBQSxFQUUzQixPQUFPLGNBQWMsU0FBUztBQUFBLEVBQzlCLE9BQU8sY0FBYyxTQUFTO0FBQ2hDLENBQUM7QUFDRCxJQUFNLGdCQUFnQixpQkFBRSxPQUFPO0FBQUEsRUFDN0IsTUFBTSxpQkFBRSxRQUFRLE9BQU87QUFBQSxFQUN2QixPQUFPO0FBQUE7QUFBQTtBQUFBLEVBR1AsT0FBTyxpQkFBRSxLQUFLLENBQUMsU0FBUyxRQUFRLENBQUMsRUFBRSxTQUFTO0FBQUEsRUFDNUMsT0FBTyxpQkFBRSxLQUFLLENBQUMsU0FBUyxTQUFTLFFBQVEsT0FBTyxDQUFDLEVBQUUsU0FBUztBQUFBLEVBQzVELFFBQVEsWUFBWSxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTTdCLFFBQVEsaUJBQUUsUUFBUSxFQUFFLFNBQVM7QUFBQSxFQUM3QixPQUFPLGNBQWMsU0FBUztBQUNoQyxDQUFDO0FBSUQsSUFBTSxxQkFBcUIsaUJBQUUsT0FBTztBQUFBLEVBQ2xDLE1BQU0saUJBQUUsUUFBUSxZQUFZO0FBQUEsRUFDNUIsWUFBWSxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDO0FBQUEsRUFDNUIsT0FBTyxpQkFBRSxLQUFLLENBQUMsU0FBUyxRQUFRLENBQUMsRUFBRSxTQUFTO0FBQUE7QUFBQSxFQUU1QyxRQUFRLGlCQUFFLFFBQVEsRUFBRSxTQUFTO0FBQUEsRUFDN0IsT0FBTyxjQUFjLFNBQVM7QUFDaEMsQ0FBQztBQUNELElBQU0sa0JBQWtCLGlCQUFFLE9BQU87QUFBQSxFQUMvQixNQUFNLGlCQUFFLFFBQVEsU0FBUztBQUFBLEVBQ3pCLE1BQU0saUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQztBQUFBLEVBQ3RDLElBQUksaUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQztBQUFBO0FBQUEsRUFFcEMsV0FBVyxpQkFBRSxNQUFNLENBQUMsZUFBZSxhQUFhLENBQUMsRUFBRSxTQUFTO0FBQUEsRUFDNUQsT0FBTyxjQUFjLFNBQVM7QUFDaEMsQ0FBQztBQUlELElBQU0sY0FBYyxpQkFBRSxPQUFPO0FBQUEsRUFDM0IsTUFBTSxpQkFBRSxRQUFRLEtBQUs7QUFBQSxFQUNyQixNQUFNLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxPQUFPLEdBQUcsaUJBQUUsT0FBTyxDQUFDLENBQUM7QUFBQSxFQUN0QyxTQUFTLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxPQUFPLEdBQUcsaUJBQUUsT0FBTyxDQUFDLENBQUM7QUFBQSxFQUN6QyxXQUFXLGNBQWMsU0FBUztBQUFBO0FBQUEsRUFFbEMsUUFBUSxpQkFBRSxRQUFRLEVBQUUsU0FBUztBQUFBLEVBQzdCLE9BQU8sY0FBYyxTQUFTO0FBQ2hDLENBQUM7QUFDRCxJQUFNLGtCQUFrQixpQkFBRSxPQUFPO0FBQUEsRUFDL0IsTUFBTSxpQkFBRSxRQUFRLFNBQVM7QUFBQSxFQUN6QixVQUFVLGlCQUFFLE1BQU0saUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsRUFDMUQsUUFBUSxpQkFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDaEMsT0FBTyxjQUFjLFNBQVM7QUFDaEMsQ0FBQztBQUNNLElBQU0sV0FBVyxpQkFBRSxtQkFBbUIsUUFBUTtBQUFBLEVBQ25EO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDOzs7QUNuT00sSUFBTSxtQkFBbUIsaUJBQUUsT0FBTztBQUFBLEVBQ3ZDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsY0FBYztBQUFBLEVBQzlCLE1BQU07QUFBQSxFQUNOLFdBQVcsaUJBQUUsTUFBTSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDekMsQ0FBQzs7O0FDVUQsSUFBTSxXQUFXLGlCQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFFLFFBQVEsTUFBTSxFQUFFLENBQUM7QUFDckQsSUFBTSxhQUFhLGlCQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFFLFFBQVEsUUFBUSxFQUFFLENBQUM7QUFDekQsSUFBTSxnQkFBZ0IsaUJBQUUsT0FBTyxFQUFFLE1BQU0saUJBQUUsUUFBUSxXQUFXLEVBQUUsQ0FBQztBQUMvRCxJQUFNLFdBQVcsaUJBQUUsT0FBTyxFQUFFLE1BQU0saUJBQUUsUUFBUSxNQUFNLEVBQUUsQ0FBQztBQUNyRCxJQUFNLGdCQUFnQixpQkFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBRSxRQUFRLFdBQVcsRUFBRSxDQUFDO0FBQy9ELElBQU0sa0JBQWtCLGlCQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFFLFFBQVEsYUFBYSxFQUFFLENBQUM7QUFLbkUsSUFBTSxhQUFhLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDOUM7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFXTSxJQUFNLGFBQWEsaUJBQUUsT0FBTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU1qQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUM7QUFBQSxFQUNwQixRQUFRLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUM7QUFBQTtBQUFBLEVBRXhCLG1CQUFtQixpQkFBRSxNQUFNLGlCQUFFLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBR2pELGFBQWEsaUJBQUUsS0FBSyxDQUFDLFNBQVMsWUFBWSxDQUFDLEVBQUUsU0FBUztBQUFBO0FBQUEsRUFFdEQsV0FBVyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsU0FBUztBQUN4QyxDQUFDO0FBT00sSUFBTSxpQkFBaUIsaUJBQUUsT0FBTztBQUFBLEVBQ3JDLE1BQU0saUJBQUUsUUFBUSxhQUFhO0FBQUEsRUFDN0IsT0FBTyxpQkFBRSxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTWhCLFNBQVMsaUJBQUUsTUFBTSxVQUFVLEVBQUUsU0FBUztBQUN4QyxDQUFDO0FBT00sSUFBTSxnQkFBZ0IsaUJBQUUsT0FBTztBQUFBLEVBQ3BDLE1BQU0saUJBQUUsUUFBUSxZQUFZO0FBQzlCLENBQUM7QUFTRCxJQUFNLHdCQUF3QixpQkFBRSxPQUFPO0FBQUEsRUFDckMsTUFBTSxpQkFBRSxRQUFRLE1BQU07QUFBQSxFQUN0QixNQUFNLGlCQUFFLE9BQU87QUFBQSxFQUNmLE9BQU8saUJBQUUsTUFBTSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQUNNLElBQU0sMEJBQTBCLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDbEU7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUEwQ0QsSUFBTSxvQkFBb0IsaUJBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTO0FBaUNyRCxJQUFNLDJCQUEyQixpQkFBRSxPQUFPO0FBQUEsRUFDeEMsSUFBSTtBQUFBLEVBQ0osTUFBTSxpQkFBRSxRQUFRLFdBQVc7QUFBQSxFQUMzQixTQUFTLGlCQUFFLE1BQU0sdUJBQXVCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdEQsQ0FBQztBQUlELElBQU0seUJBQXlCLGlCQUFFLE9BQU87QUFBQSxFQUN0QyxJQUFJO0FBQUEsRUFDSixNQUFNLGlCQUFFLFFBQVEsU0FBUztBQUFBLEVBQ3pCLE9BQU8saUJBQUUsTUFBTSxDQUFDLGlCQUFFLFFBQVEsQ0FBQyxHQUFHLGlCQUFFLFFBQVEsQ0FBQyxHQUFHLGlCQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFBQSxFQUN6RCxTQUFTLGlCQUFFLE1BQU0sdUJBQXVCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdEQsQ0FBQztBQVFELElBQU0sc0JBQXNCLGlCQUFFLE9BQU87QUFBQSxFQUNuQyxJQUFJO0FBQUEsRUFDSixNQUFNLGlCQUFFLFFBQVEsWUFBWTtBQUFBLEVBQzVCLE9BQU8saUJBQUUsT0FBTztBQUFBLEVBQ2hCLEdBQUc7QUFDTCxDQUFDO0FBT0QsSUFBTSx1QkFBdUIsaUJBQUUsT0FBTztBQUFBLEVBQ3BDLElBQUk7QUFBQSxFQUNKLE1BQU0saUJBQUUsUUFBUSxPQUFPO0FBQUEsRUFDdkIsS0FBSyxpQkFBRSxPQUFPO0FBQUEsRUFDZCxLQUFLLGlCQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUU7QUFBQSxFQUMxQixHQUFHO0FBQUEsRUFDSCxNQUFNLFNBQVMsU0FBUztBQUFBLEVBQ3hCLFdBQVcsaUJBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQzVDLENBQUM7QUFzQk0sSUFBTSxxQkFJVCxpQkFBRTtBQUFBLEVBQUssTUFDVCxpQkFBRSxPQUFPO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixTQUFTLGlCQUFFLE1BQU0sdUJBQXVCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQSxJQUNwRCxVQUFVLGlCQUNQLE1BQU0saUJBQUUsTUFBTSxDQUFDLDJCQUEyQiwwQkFBMEIsQ0FBQyxDQUFDLEVBQ3RFLFNBQVM7QUFBQSxFQUNkLENBQUM7QUFDSDtBQUVPLElBQU0sNEJBQTRCLGlCQUFFLE9BQU87QUFBQSxFQUNoRCxJQUFJO0FBQUEsRUFDSixNQUFNLGlCQUFFLFFBQVEsYUFBYTtBQUFBLEVBQzdCLE9BQU8saUJBQUUsTUFBTSxrQkFBa0IsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBRU0sSUFBTSw2QkFBNkIsaUJBQUUsT0FBTztBQUFBLEVBQ2pELElBQUk7QUFBQSxFQUNKLE1BQU0saUJBQUUsUUFBUSxjQUFjO0FBQUEsRUFDOUIsT0FBTyxpQkFBRSxNQUFNLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFpQk0sSUFBTSxrQkFJVCxpQkFBRSxtQkFBbUIsUUFBUTtBQUFBLEVBQy9CO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQWVNLElBQU0saUJBQWlCLGlCQUFFLE9BQU87QUFBQSxFQUNyQyxNQUFNLGlCQUFFLFFBQVEsWUFBWTtBQUFBLEVBQzVCLFNBQVMsaUJBQUUsTUFBTSxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQSxFQUM1QyxhQUFhLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQ25DLENBQUM7QUFpQk0sU0FBUyxzQkFBc0IsR0FBcUM7QUFDekUsTUFBSSxVQUFVLEVBQUU7QUFDaEIsUUFBTSxPQUFPLEVBQUUsR0FBRyxFQUFFO0FBR3BCLE1BQUksT0FBTyxLQUFLLGVBQWUsWUFBWSxZQUFZLFFBQVc7QUFDaEUsVUFBTSxPQUFPLEtBQUs7QUFDbEIsY0FBVSxPQUFPLENBQUMsRUFBRSxNQUFNLFFBQVEsS0FBSyxDQUFDLElBQUksQ0FBQztBQUFBLEVBQy9DO0FBQ0EsU0FBTyxLQUFLO0FBT1osUUFBTSxlQUFlLENBQUMsUUFBUSxlQUFlLFlBQVk7QUFDekQsTUFBSSxNQUFNLFFBQVEsT0FBTyxLQUFLLFFBQVEsU0FBUyxHQUFHO0FBQ2hELFVBQU0sUUFBUSxRQUFRLENBQUM7QUFDdkIsUUFBSSxPQUFPLE9BQU8sU0FBUyxZQUFZLGFBQWEsU0FBUyxNQUFNLElBQUksR0FBRztBQUN4RSxnQkFBVSxDQUFDLEVBQUUsTUFBTSxhQUFhLFFBQVEsQ0FBQztBQUFBLElBQzNDO0FBQUEsRUFDRjtBQUtBLFFBQU0sUUFBUSxLQUFLO0FBQ25CLFNBQU8sS0FBSztBQUNaLE1BQUksVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVO0FBQy9DLFVBQU0sRUFBRSxLQUFLLElBQUksSUFBSTtBQUNyQixRQUFJLE9BQU8sUUFBUSxZQUFZLEtBQUs7QUFDbEMsWUFBTSxTQUFTLE1BQU0sUUFBUSxPQUFPLElBQUksQ0FBQyxHQUFHLE9BQU8sSUFBSSxDQUFDO0FBQ3hELGFBQU8sS0FBSztBQUFBLFFBQ1YsTUFBTTtBQUFBLFFBQ047QUFBQSxRQUNBLEtBQUssT0FBTyxRQUFRLFdBQVcsTUFBTTtBQUFBLE1BQ3ZDLENBQUM7QUFDRCxnQkFBVTtBQUFBLElBQ1o7QUFBQSxFQUNGO0FBRUEsU0FBTyxFQUFFLEdBQUcsTUFBTSxTQUFTLFdBQVcsQ0FBQyxFQUFFO0FBQzNDO0FBRU8sSUFBTSxPQUFPLGlCQUFFO0FBQUEsRUFDcEIsQ0FBQyxNQUFNO0FBRUwsUUFBSSxPQUFPLE1BQU0sU0FBVSxRQUFPLEVBQUUsTUFBTSxFQUFFO0FBQzVDLFFBQ0UsTUFBTSxRQUNOLE9BQU8sTUFBTSxZQUNaLEVBQXlCLFNBQVMsY0FDbkM7QUFDQSxhQUFPLHNCQUFzQixDQUE0QjtBQUFBLElBQzNEO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsSUFDM0I7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGLENBQUM7QUFDSDtBQU1PLElBQU0sV0FBVyxpQkFBRSxPQUFPO0FBQUEsRUFDL0IsTUFBTSxpQkFBRSxRQUFRLE1BQU07QUFBQSxFQUN0QixNQUFNLGlCQUFFLE9BQU87QUFBQTtBQUFBLEVBRWYsT0FBTyxpQkFBRSxNQUFNLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBWU0sSUFBTSxrQkFBa0IsaUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLElBQUksR0FBRztBQU9qRCxJQUFNLGFBQWEsaUJBQUUsbUJBQW1CLFFBQVE7QUFBQSxFQUNyRDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQXFCTSxJQUFNLGFBQWEsaUJBQUUsT0FBTztBQUFBLEVBQ2pDLE1BQU0saUJBQUUsUUFBUSxPQUFPO0FBQUEsRUFDdkIsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLFFBQVEsaUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQztBQUFBO0FBQUEsRUFFeEIsbUJBQW1CLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQSxFQUNqRCxPQUFPLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUEsRUFHNUMsTUFBTSxpQkFBRSxNQUFNLFVBQVUsRUFBRSxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFVbkMsaUJBQWlCLGlCQUFFLE1BQU0saUJBQUUsT0FBTztBQUFBLElBQ2hDLE9BQU8saUJBQUUsT0FBTztBQUFBLElBQ2hCLFVBQVUsaUJBQUUsTUFBTSxVQUFVO0FBQUEsSUFDNUIsaUJBQWlCLGdCQUFnQixTQUFTO0FBQUEsRUFDNUMsQ0FBQyxDQUFDLEVBQUUsU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFjYiw2QkFBNkIsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFXdEQsWUFBWSxpQkFBRSxLQUFLLENBQUMsUUFBUSxXQUFXLE1BQU0sQ0FBQyxFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUl6RCxXQUFXLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJdEMsYUFBYSxpQkFBRSxLQUFLLENBQUMsU0FBUyxZQUFZLENBQUMsRUFBRSxTQUFTO0FBQ3hELENBQUM7QUFNTSxJQUFNLG9CQUFvQixpQkFBRSxtQkFBbUIsUUFBUTtBQUFBLEVBQzVEO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQzs7O0FDL2hCTSxJQUFNLGlCQUFpQixpQkFBRSxPQUFPO0FBQUEsRUFDckMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxXQUFXO0FBQUEsRUFDM0IsU0FBUyxpQkFBRSxNQUFNLFVBQVU7QUFDN0IsQ0FBQzs7O0FDRk0sSUFBTSxlQUFlLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxRQUFRLENBQUMsR0FBRyxpQkFBRSxRQUFRLENBQUMsR0FBRyxpQkFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBR3ZFLElBQU0sZUFBZSxpQkFBRSxPQUFPO0FBQUEsRUFDbkMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxTQUFTO0FBQUEsRUFDekIsT0FBTztBQUFBLEVBQ1AsU0FBUyxpQkFBRSxNQUFNLFVBQVU7QUFDN0IsQ0FBQzs7O0FDZ0JNLElBQU0sYUFBYSxpQkFBRSxtQkFBbUIsUUFBUTtBQUFBLEVBQ3JELGlCQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFFLFFBQVEsTUFBTSxFQUFFLENBQUM7QUFBQTtBQUFBO0FBQUEsRUFHcEMsaUJBQUUsT0FBTyxFQUFFLE1BQU0saUJBQUUsUUFBUSxRQUFRLEdBQUcsTUFBTSxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUFBLEVBQy9ELGlCQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFFLFFBQVEsTUFBTSxFQUFFLENBQUM7QUFDdEMsQ0FBQztBQU1NLElBQU0sY0FBYztBQUFBLEVBQ3pCLE9BQU8sV0FBVyxTQUFTO0FBQzdCOzs7QUNuQ08sSUFBTSxZQUFZLGlCQUFFLE9BQU87QUFBQSxFQUNoQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLFlBQVk7QUFBQSxFQUM1QixPQUFPLGlCQUFFLE9BQU87QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUloQixTQUFTLGlCQUFFLE1BQU0sVUFBVSxFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUl0QyxVQUFVLGlCQUFFLE1BQU0sVUFBVSxFQUFFLFNBQVM7QUFBQTtBQUFBLEVBRXZDLEdBQUc7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUlILEdBQUc7QUFDTCxDQUFDOzs7QUNwQk0sSUFBTSxpQkFBaUIsaUJBQUUsS0FBSyxDQUFDLFFBQVEsV0FBVyxXQUFXLE1BQU0sQ0FBQztBQUdwRSxJQUFNLGVBQWUsaUJBQUUsT0FBTztBQUFBLEVBQ25DLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsU0FBUztBQUFBLEVBQ3pCLFNBQVM7QUFBQSxFQUNULFNBQVMsaUJBQUUsTUFBTSxVQUFVO0FBQzdCLENBQUM7OztBQzRCTSxJQUFNLGVBQWUsaUJBQUUsT0FBTztBQUFBLEVBQ25DLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNlLE1BQU0saUJBQUUsUUFBUSxTQUFTO0FBQUEsRUFDekIsUUFBUSxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQUEsRUFDN0MsU0FBUyxpQkFBRSxNQUFNLFVBQVU7QUFBQSxFQUMzQixVQUFVLGlCQUFFLE1BQU0sVUFBVSxFQUFFLFNBQVM7QUFBQSxFQUN2QyxRQUFRLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDM0UsQ0FBQzs7O0FDcEJNLElBQU0sbUJBQW1CLGlCQUFFLE9BQU87QUFBQSxFQUN2QyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDbUIsTUFBTSxpQkFBRSxRQUFRLGVBQWU7QUFBQSxFQUMvQixRQUFRLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFBQSxFQUM3QyxTQUFTLGlCQUFFLE1BQU0saUJBQWlCO0FBQUEsRUFDbEMsVUFBVSxpQkFBRSxNQUFNLFVBQVUsRUFBRSxTQUFTO0FBQUEsRUFDdkMsUUFBUSxpQkFBRSxNQUFNLGlCQUFFLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQUEsRUFDdEMsV0FBVyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsU0FBUztBQUFBO0FBQUE7QUFBQSxFQUd0QyxHQUFHO0FBQzVDLENBQUM7OztBQ0lNLElBQU0sV0FBdUQsaUJBQUU7QUFBQSxFQUFLLE1BQzNFLGlCQUFFLE9BQU87QUFBQSxJQUNMLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxJQUNmLFNBQVMsaUJBQUUsTUFBTSxVQUFVO0FBQUEsSUFDM0IsVUFBVSxpQkFDVCxNQUFNLGlCQUFFLE1BQU0sQ0FBQyxpQkFBaUIsZ0JBQWdCLENBQUMsQ0FBQyxFQUNsRCxTQUFTO0FBQUEsRUFDbkIsQ0FBQztBQUNEO0FBRU8sSUFBTSxrQkFBa0IsaUJBQUUsT0FBTztBQUFBLEVBQ3BDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNnQixNQUFNLGlCQUFFLFFBQVEsYUFBYTtBQUFBLEVBQzdCLE9BQU8saUJBQUUsTUFBTSxRQUFRO0FBQy9ELENBQUM7QUFFTSxJQUFNLG1CQUFtQixpQkFBRSxPQUFPO0FBQUEsRUFDckMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ2lCLE1BQU0saUJBQUUsUUFBUSxjQUFjO0FBQUEsRUFDOUIsT0FBTyxpQkFBRSxNQUFNLFFBQVE7QUFDaEUsQ0FBQzs7O0FDUE0sSUFBTSxtQkFBbUIsaUJBQUUsT0FBTztBQUFBLEVBQ3ZDLE1BQU0saUJBQUUsUUFBUSxZQUFZO0FBQUE7QUFBQTtBQUFBLEVBRzVCLGVBQWUsaUJBQUUsTUFBTSxpQkFBRSxNQUFNLENBQUMsaUJBQUUsT0FBTyxHQUFHLGlCQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQTtBQUFBO0FBQUEsRUFHL0QsV0FBVyxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUNqRCxDQUFDO0FBa0JNLElBQU0sc0JBQXNCLGlCQUFFLE9BQU87QUFBQSxFQUMxQyxNQUFNLGlCQUFFLFFBQVEsZUFBZTtBQUFBLEVBQy9CLFFBQVEsaUJBQUUsTUFBTSxhQUFhLEVBQUUsSUFBSSxDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTXBDLFNBQVMsaUJBQUUsTUFBTSxZQUFZLFNBQVMsQ0FBQyxFQUFFLFNBQVM7QUFDcEQsQ0FBQztBQVdNLElBQU0sZUFBZSxpQkFBRSxPQUFPO0FBQUEsRUFDbkMsaUJBQWlCLGlCQUFFLE1BQU0saUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBR2pFLFlBQVksaUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLFFBQVEsR0FBRztBQUNsRCxDQUFDO0FBS00sSUFBTSxvQkFBb0IsaUJBQUUsT0FBTztBQUFBLEVBQ3hDLE1BQU0saUJBQUUsUUFBUSxjQUFjO0FBQUEsRUFDOUIsU0FBUyxpQkFBRSxNQUFNLFlBQVksRUFBRSxJQUFJLENBQUM7QUFDdEMsQ0FBQztBQVNNLElBQU0saUJBQWlCLGlCQUFFLEtBQUssQ0FBQyxTQUFTLFNBQVMsUUFBUSxPQUFPLENBQUM7QUFHakUsSUFBTSxtQkFBbUIsaUJBQUUsT0FBTztBQUFBLEVBQ3ZDLFVBQVU7QUFBQTtBQUFBLEVBRVYsUUFBUSxpQkFBRSxRQUFRO0FBQUEsRUFDbEIsV0FBVztBQUNiLENBQUM7QUFLTSxJQUFNLHdCQUF3QixpQkFBRSxPQUFPO0FBQUEsRUFDNUMsTUFBTSxpQkFBRSxRQUFRLGtCQUFrQjtBQUFBLEVBQ2xDLGNBQWMsaUJBQUUsTUFBTSxnQkFBZ0IsRUFBRSxJQUFJLENBQUM7QUFDL0MsQ0FBQztBQWVNLElBQU0scUJBQXFCLGlCQUFFLE9BQU87QUFBQSxFQUN6QyxNQUFNLGlCQUFFLFFBQVEsU0FBUztBQUFBLEVBQ3pCLFdBQVcsaUJBQUUsTUFBTSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDekMsQ0FBQztBQVlNLElBQU0sWUFBWSxpQkFBRSxPQUFPO0FBQUE7QUFBQSxFQUVoQyxNQUFNLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxPQUFPLEdBQUcsaUJBQUUsT0FBTyxDQUFDLENBQUM7QUFBQTtBQUFBO0FBQUEsRUFHdEMsU0FBUyxpQkFBRSxNQUFNLENBQUMsaUJBQUUsT0FBTyxHQUFHLGlCQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQUEsRUFDekMsV0FBVyxjQUFjLFFBQVEsUUFBUTtBQUFBO0FBQUE7QUFBQSxFQUd6QyxXQUFXLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxJQUFJO0FBQ2xELENBQUM7QUFHTSxJQUFNLGlCQUFpQixpQkFBRSxPQUFPO0FBQUEsRUFDckMsTUFBTSxpQkFBRSxRQUFRLFVBQVU7QUFBQSxFQUMxQixNQUFNLGlCQUFFLE1BQU0sU0FBUyxFQUFFLElBQUksQ0FBQztBQUNoQyxDQUFDO0FBR00sSUFBTSxnQkFBZ0IsaUJBQUUsT0FBTztBQUFBLEVBQ3BDLE1BQU0saUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQztBQUFBLEVBQ3RDLElBQUksaUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQztBQUFBO0FBQUE7QUFBQSxFQUdwQyxXQUFXLGlCQUFFLE1BQU0sQ0FBQyxlQUFlLGFBQWEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxVQUFVLFFBQVEsQ0FBQztBQUFBLEVBQy9FLFdBQVcsaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLElBQUk7QUFDbEQsQ0FBQztBQUdNLElBQU0scUJBQXFCLGlCQUFFLE9BQU87QUFBQSxFQUN6QyxNQUFNLGlCQUFFLFFBQVEsY0FBYztBQUFBLEVBQzlCLFVBQVUsaUJBQUUsTUFBTSxhQUFhLEVBQUUsSUFBSSxDQUFDO0FBQ3hDLENBQUM7QUFPTSxJQUFNLG1CQUFtQixpQkFBRSxtQkFBbUIsUUFBUTtBQUFBLEVBQzNEO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQU9NLElBQU0sd0JBQXdCLGlCQUFFLE9BQU87QUFBQSxFQUM1QyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLG1CQUFtQjtBQUFBLEVBQ25DLFFBQVEsaUJBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUztBQUFBLEVBQzdDLEdBQUc7QUFBQSxFQUNILFFBQVEsaUJBQUUsTUFBTSxVQUFVO0FBQUEsRUFDMUIsWUFBWTtBQUFBLEVBQ1osYUFBYTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLYixpQkFBaUIsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSTFDLG1CQUFtQixpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTTVDLGlCQUFpQixpQkFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFVekMsaUJBQWlCLGlCQUFFLE1BQU0saUJBQUUsT0FBTztBQUFBLElBQ2hDLE9BQU8saUJBQUUsT0FBTztBQUFBLElBQ2hCLFVBQVUsaUJBQUUsTUFBTSxVQUFVO0FBQUEsSUFDNUIsaUJBQWlCLGdCQUFnQixTQUFTO0FBQUEsRUFDNUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQSxFQUNkLFVBQVUsaUJBQUUsTUFBTSxVQUFVLEVBQUUsU0FBUztBQUFBLEVBQ3ZDLFFBQVEsaUJBQUUsTUFBTSxpQkFBRSxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSXRDLEdBQUc7QUFDTCxDQUFDOzs7QUMzT00sSUFBTSxjQUFjLGlCQUFFLE9BQU87QUFBQSxFQUNsQyxLQUFLLGlCQUFFLE9BQU8sRUFBRSxJQUFJO0FBQUEsRUFDcEIsS0FBSyxpQkFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFO0FBQzVCLENBQUM7QUFjTSxJQUFNLGNBQWMsaUJBQUUsT0FBTztBQUFBLEVBQ2xDLE1BQU07QUFBQSxFQUNOLFdBQVcsaUJBQUUsTUFBTSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDekMsQ0FBQztBQUdNLElBQU0sdUJBQXVCLGlCQUFFLE9BQU87QUFBQSxFQUMzQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUE7QUFBQTtBQUFBLEVBR3BCLFNBQVMsaUJBQUUsTUFBTSxVQUFVO0FBQUEsRUFDM0IsU0FBUyxpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUE7QUFBQTtBQUFBLEVBR2xDLFVBQVUsaUJBQUUsTUFBTSxVQUFVLEVBQUUsU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU12QyxpQkFBaUIsZ0JBQWdCLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUkxQyxPQUFPLFlBQVksU0FBUztBQUFBLEVBQzVCLE9BQU8sWUFBWSxTQUFTO0FBQzlCLENBQUM7QUFHTSxJQUFNLHNCQUFzQixpQkFBRSxPQUFPO0FBQUEsRUFDMUMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxpQkFBaUI7QUFBQSxFQUNqQyxRQUFRLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFBQSxFQUM3QyxHQUFHO0FBQUE7QUFBQSxFQUVILFFBQVEsaUJBQUUsTUFBTSxVQUFVO0FBQUEsRUFDMUIsU0FBUyxpQkFBRSxNQUFNLG9CQUFvQixFQUFFLElBQUksQ0FBQztBQUFBO0FBQUE7QUFBQSxFQUc1QyxhQUFhLGlCQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU90QyxpQkFBaUIsaUJBQUUsUUFBUSxFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUEsRUFHdEMsVUFBVSxpQkFBRSxNQUFNLFVBQVUsRUFBRSxTQUFTO0FBQUEsRUFDdkMsUUFBUSxpQkFBRSxNQUFNLGlCQUFFLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJdEMsV0FBVyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsU0FBUztBQUN4QyxDQUFDOzs7QUN2RU0sSUFBTSxlQUFlLGlCQUFFLE9BQU87QUFBQSxFQUNuQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUE7QUFBQTtBQUFBLEVBR3BCLFNBQVMsaUJBQUUsTUFBTSxVQUFVO0FBQUE7QUFBQTtBQUFBLEVBRzNCLE9BQU8sWUFBWSxTQUFTO0FBQUEsRUFDNUIsT0FBTyxZQUFZLFNBQVM7QUFDOUIsQ0FBQztBQUdNLElBQU0saUJBQWlCLGlCQUFFLE9BQU87QUFBQSxFQUNyQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsU0FBUyxpQkFBRSxNQUFNLFVBQVU7QUFBQSxFQUMzQixPQUFPLFlBQVksU0FBUztBQUFBLEVBQzVCLE9BQU8sWUFBWSxTQUFTO0FBQzlCLENBQUM7QUFHTSxJQUFNLGdCQUFnQixpQkFBRSxPQUFPO0FBQUEsRUFDcEMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxVQUFVO0FBQUEsRUFDMUIsUUFBUSxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQUEsRUFDN0MsR0FBRztBQUFBO0FBQUEsRUFFSCxRQUFRLGlCQUFFLE1BQU0sVUFBVTtBQUFBO0FBQUEsRUFFMUIsT0FBTyxpQkFBRSxNQUFNLFlBQVksRUFBRSxJQUFJLENBQUM7QUFBQTtBQUFBO0FBQUEsRUFHbEMsU0FBUyxpQkFBRSxNQUFNLGNBQWMsRUFBRSxJQUFJLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUl0QyxLQUFLLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDO0FBQUE7QUFBQSxFQUVsRCxVQUFVLGlCQUFFLE1BQU0sVUFBVSxFQUFFLFNBQVM7QUFBQSxFQUN2QyxRQUFRLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQSxFQUN0QyxXQUFXLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxTQUFTO0FBQ3hDLENBQUM7OztBQ3JETSxJQUFNLGVBQWUsaUJBQUUsT0FBTztBQUFBLEVBQ25DLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQTtBQUFBO0FBQUEsRUFHcEIsU0FBUyxpQkFBRSxNQUFNLFVBQVU7QUFDN0IsQ0FBQztBQUdNLElBQU0sZ0JBQWdCLGlCQUFFLE9BQU87QUFBQSxFQUNwQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLFVBQVU7QUFBQSxFQUMxQixRQUFRLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFBQSxFQUM3QyxHQUFHO0FBQUE7QUFBQSxFQUVILFFBQVEsaUJBQUUsTUFBTSxVQUFVO0FBQUE7QUFBQTtBQUFBLEVBRzFCLE9BQU8saUJBQUUsTUFBTSxZQUFZLEVBQUUsSUFBSSxDQUFDO0FBQUE7QUFBQSxFQUVsQyxVQUFVLGlCQUFFLE1BQU0sVUFBVSxFQUFFLFNBQVM7QUFBQSxFQUN2QyxRQUFRLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQSxFQUN0QyxXQUFXLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxTQUFTO0FBQ3hDLENBQUM7OztBQ1pNLElBQU0sbUJBQW1CLGlCQUFFLE9BQU87QUFBQSxFQUN2QyxLQUFLLGlCQUFFLE9BQU87QUFBQSxFQUNkLEtBQUssaUJBQUUsT0FBTztBQUFBO0FBQUEsRUFFZCxVQUFVLGlCQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBR3pDLG1CQUFtQixpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUkzRCxZQUFZLGlCQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFDdEMsQ0FBQztBQU9NLElBQU0sNkJBQTZCLGlCQUFFLE9BQU87QUFBQSxFQUNqRCxNQUFNLGlCQUFFLFFBQVEsWUFBWTtBQUFBO0FBQUEsRUFFNUIsZUFBZSxpQkFBRSxNQUFNLGlCQUFFLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBO0FBQUEsRUFFeEMsV0FBVyxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUNqRCxDQUFDO0FBYU0sSUFBTSxxQkFBcUIsaUJBQUUsT0FBTztBQUFBLEVBQ3pDLEtBQUssaUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQSxFQUN6QixVQUFVLGNBQWMsU0FBUztBQUFBLEVBQ2pDLEtBQUssaUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQSxFQUN6QixVQUFVLGNBQWMsU0FBUztBQUNuQyxDQUFDO0FBR00sSUFBTSxnQ0FBZ0MsaUJBQUUsT0FBTztBQUFBLEVBQ3BELE1BQU0saUJBQUUsUUFBUSxlQUFlO0FBQUEsRUFDL0IsaUJBQWlCO0FBQUE7QUFBQSxFQUVqQixXQUFXLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQ2pELENBQUM7QUFRTSxJQUFNLHdCQUF3QixpQkFBRSxtQkFBbUIsUUFBUTtBQUFBLEVBQ2hFO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFTTSxJQUFNLGtCQUFrQixpQkFBRSxPQUFPO0FBQUEsRUFDdEMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxhQUFhO0FBQUEsRUFDN0IsUUFBUSxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQUEsRUFDN0MsR0FBRztBQUFBLEVBQ0gsUUFBUSxpQkFBRSxNQUFNLFVBQVU7QUFBQSxFQUMxQixRQUFRO0FBQUEsRUFDUixhQUFhO0FBQUEsRUFDYixVQUFVLGlCQUFFLE1BQU0sVUFBVSxFQUFFLFNBQVM7QUFBQSxFQUN2QyxRQUFRLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQTtBQUFBO0FBQUEsRUFHdEMsR0FBRztBQUNMLENBQUM7OztBQ3ZFTSxJQUFNLGlCQUFpQixpQkFBaUIsT0FBTztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSXBELFVBQVUsaUJBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJekMsY0FBYyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQ3JELENBQUM7QUFLTSxJQUFNLGdCQUFnQixpQkFBRSxLQUFLLENBQUMsV0FBVyxhQUFhLFNBQVMsQ0FBQztBQVNoRSxJQUFNLDZCQUE2QixpQkFBRSxPQUFPO0FBQUEsRUFDakQsTUFBTSxpQkFBRSxRQUFRLFNBQVM7QUFBQSxFQUN6QixPQUFPO0FBQ1QsQ0FBQztBQVlNLElBQU0sNkJBQTZCLGlCQUFFLE9BQU87QUFBQSxFQUNqRCxNQUFNLGlCQUFFLFFBQVEsZUFBZTtBQUNqQyxDQUFDO0FBVU0sSUFBTSwrQkFBK0IsaUJBQUUsT0FBTztBQUFBLEVBQ25ELE1BQU0saUJBQUUsUUFBUSxpQkFBaUI7QUFDbkMsQ0FBQztBQVlNLElBQU0sNkJBQTZCLGlCQUFFLE9BQU87QUFBQSxFQUNqRCxNQUFNLGlCQUFFLFFBQVEsZUFBZTtBQUFBO0FBQUE7QUFBQSxFQUcvQixXQUFXLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQ2pELENBQUM7QUFRTSxJQUFNLHNCQUFzQixpQkFBRSxtQkFBbUIsUUFBUTtBQUFBLEVBQzlEO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQVdNLElBQU0sZ0JBQWdCLGlCQUFFLE9BQU87QUFBQSxFQUNwQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLFdBQVc7QUFBQSxFQUMzQixRQUFRLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFBQSxFQUM3QyxHQUFHO0FBQUEsRUFDSCxRQUFRLGlCQUFFLE1BQU0sVUFBVTtBQUFBO0FBQUE7QUFBQSxFQUcxQixNQUFNLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsRUFDL0IsUUFBUTtBQUFBLEVBQ1IsYUFBYTtBQUFBLEVBQ2IsVUFBVSxpQkFBRSxNQUFNLFVBQVUsRUFBRSxTQUFTO0FBQUEsRUFDdkMsUUFBUSxpQkFBRSxNQUFNLGlCQUFFLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBR3RDLEdBQUc7QUFDTCxDQUFDOzs7QUNwSU0sSUFBTSwwQkFBMEIsaUJBQUUsT0FBTztBQUFBLEVBQzlDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEscUJBQXFCO0FBQUEsRUFDckMsT0FBTyxpQkFBRSxPQUFPO0FBQUEsRUFDaEIsT0FBTyxpQkFBRSxNQUFNLGlCQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3BDLENBQUM7OztBQ01NLElBQU0scUJBQXFCLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDN0Q7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFHTSxJQUFNLHFCQUFxQixpQkFBRSxPQUFPO0FBQUEsRUFDekMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxnQkFBZ0I7QUFBQSxFQUNoQyxPQUFPLGlCQUFFLE9BQU87QUFBQSxFQUNoQixTQUFTLGlCQUFFLE1BQU0sa0JBQWtCO0FBQ3JDLENBQUM7OztBQ1BNLElBQU0sMEJBQTBCLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDbEU7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBR00sSUFBTSwwQkFBMEIsaUJBQUUsT0FBTztBQUFBLEVBQzlDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsc0JBQXNCO0FBQUEsRUFDdEMsT0FBTyxpQkFBRSxPQUFPO0FBQUEsRUFDaEIsU0FBUyxpQkFBRSxNQUFNLHVCQUF1QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU14QyxnQkFBZ0IsaUJBQUUsUUFBUSxFQUFFLFFBQVEsSUFBSTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU14QyxHQUFHO0FBQ0wsQ0FBQzs7O0FDN0NNLElBQU0sdUJBQXVCLGlCQUFFLE9BQU87QUFBQSxFQUMzQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLGtCQUFrQjtBQUFBLEVBQ2xDLFFBQVEsaUJBQUUsTUFBTSxVQUFVO0FBQUEsRUFDMUIsYUFBYSxpQkFBRSxPQUFPLEVBQUUsU0FBUztBQUNuQyxDQUFDOzs7QUM0Qk0sSUFBTSxrQkFBa0IsaUJBQUUsT0FBTztBQUFBLEVBQ3RDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixPQUFPLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUM7QUFBQSxFQUN2QixXQUFXLGlCQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTztBQUFBLEVBQ3hDLGFBQWEsaUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFDbkMsQ0FBQztBQVVNLElBQU0sU0FBUyxpQkFBRSxPQUFPO0FBQUEsRUFDN0IsVUFBVSxpQkFBRSxNQUFNLGVBQWUsRUFBRSxJQUFJLENBQUM7QUFDMUMsQ0FBQztBQWdCRCxJQUFNLGVBQWU7QUFBQTtBQUFBLEVBRW5CLFFBQVEsaUJBQUUsTUFBTSxVQUFVLEVBQUUsU0FBUztBQUFBO0FBQUEsRUFFckMsVUFBVSxpQkFBRSxNQUFNLFVBQVUsRUFBRSxTQUFTO0FBQ3pDO0FBRU8sSUFBTSxtQkFBbUIsaUJBQUUsT0FBTztBQUFBLEVBQ3ZDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsY0FBYztBQUFBLEVBQzlCLFFBQVEsaUJBQUUsTUFBTSxVQUFVO0FBQUEsRUFDMUIsYUFBYSxpQkFBRSxPQUFPLEVBQUUsU0FBUztBQUFBLEVBQ2pDLFFBQVEsT0FBTyxTQUFTO0FBQUEsRUFDeEIsR0FBRztBQUFBLEVBQ0gsR0FBRztBQUNMLENBQUM7QUFHTSxJQUFNLGdCQUFnQixpQkFDMUIsT0FBTztBQUFBLEVBQ04sS0FBSyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQUEsRUFDMUMsS0FBSyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQzVDLENBQUMsRUFHQTtBQUFBLEVBQ0MsQ0FBQyxNQUFNLEVBQUUsUUFBUSxVQUFhLEVBQUUsUUFBUSxVQUFhLEVBQUUsT0FBTyxFQUFFO0FBQUEsRUFDaEUsRUFBRSxTQUFTLHVDQUFrQztBQUMvQztBQUdLLElBQU0sYUFBYSxpQkFBRSxPQUFPO0FBQUEsRUFDakMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxPQUFPO0FBQUEsRUFDdkIsUUFBUSxpQkFBRSxNQUFNLFVBQVU7QUFBQSxFQUMxQixhQUFhLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUEsRUFDakMsZUFBZSxjQUFjLFNBQVM7QUFBQSxFQUN0QyxRQUFRLE9BQU8sU0FBUztBQUFBLEVBQ3hCLEdBQUc7QUFBQSxFQUNILEdBQUc7QUFDTCxDQUFDOzs7QUNoRk0sSUFBTSxtQkFBbUIsaUJBQUUsS0FBSyxDQUFDLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFPM0QsSUFBTSxZQUFZLGlCQUFFLE9BQU87QUFBQSxFQUNoQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUtwQixTQUFTLGlCQUFFLE1BQU0saUJBQWlCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQUlNLElBQU0sV0FBVyxpQkFBRSxPQUFPO0FBQUEsRUFDL0IsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE9BQU8saUJBQUUsTUFBTSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUdNLElBQU0sYUFBYSxpQkFBRSxPQUFPO0FBQUEsRUFDakMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJdkIsUUFBUSxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFPN0MsV0FBVyxpQkFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDbkMsY0FBYyxpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUt2QyxjQUFjLGlCQUFFLE1BQU0sZ0JBQWdCLEVBQUUsU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSWpELGdCQUFnQixpQkFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDeEMsTUFBTSxpQkFBRSxNQUFNLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUFBO0FBQUEsRUFFbEMsR0FBRztBQUNMLENBQUM7OztBQ25FTSxJQUFNLFFBQVEsaUJBQUUsbUJBQW1CLFFBQVE7QUFBQSxFQUNoRDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDOzs7QUNqQk0sSUFBTSxrQkFBa0IsaUJBQUUsS0FBSyxDQUFDLFdBQVcsTUFBTSxLQUFLLENBQUM7QUFHdkQsSUFBTSxTQUFTLGlCQUFFLE9BQU87QUFBQSxFQUM3QixJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUE7QUFBQSxFQUVwQixPQUFPLGlCQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUztBQUFBO0FBQUEsRUFFdEMsV0FBVyxpQkFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUkxQyxRQUFRLGlCQUFFLE1BQU0sS0FBSyxFQUFFLElBQUksQ0FBQztBQUM5QixDQUFDO0FBT00sSUFBTSxNQUFNLGlCQUFFLE9BQU87QUFBQSxFQUMxQixJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsU0FBUyxpQkFBRSxNQUFNLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxFQUNyQyxXQUFXLGdCQUFnQixRQUFRLFNBQVM7QUFDOUMsQ0FBQzs7O0FDdkJNLElBQU0sVUFBVSxpQkFBRSxPQUFPO0FBQUEsRUFDOUIsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ1UsT0FBTyxpQkFBRSxPQUFPLEVBQUUsU0FBUztBQUFBLEVBQzNCLGNBQWMsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQ3ZDLE1BQU0saUJBQUUsTUFBTSxHQUFHO0FBQ2pELENBQUM7QUFrRk0sSUFBTSxjQUFjLGlCQUFFLE9BQU87QUFBQSxFQUNsQyxNQUFNLGlCQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFBQSxFQUNJLE1BQU0saUJBQUUsUUFBUSxFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQzlCLFFBQVEsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQ2pDLE9BQU8saUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQ2hDLE9BQU8saUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQ2hDLFFBQVEsaUJBQUUsTUFBTSxpQkFBRSxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMxRSxDQUFDO0FBd0RNLElBQU0sY0FBYyxpQkFBRSxPQUFPO0FBQUEsRUFDbEMsV0FBVyxpQkFBRSxLQUFLLENBQUMsVUFBVSxJQUFJLENBQUMsRUFBRSxRQUFRLFFBQVE7QUFBQSxFQUNqQixTQUFTLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDakQsV0FBVyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDdEMsVUFBVSxpQkFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRTtBQUFBLEVBQzFDLGdCQUFnQixpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDM0MsUUFBUSxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsUUFBUSxHQUFHO0FBQUEsRUFDckMsV0FBVyxpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUEsRUFDcEMscUJBQXFCLGlCQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFBQSxFQUM3Qyx5QkFBeUIsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQ2xELFFBQVEsWUFBWSxRQUFRLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBMkJNLElBQU0sZUFBZSxpQkFBRSxLQUFLO0FBQUEsRUFDakM7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQUdNLElBQU0sYUFBYSxpQkFBRSxPQUFPO0FBQUEsRUFDakMsTUFBTSxhQUFhLFFBQVEsU0FBUztBQUFBLEVBQ0QsVUFBVSxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFO0FBQ3BGLENBQUM7QUFHTSxJQUFNLGVBQWUsaUJBQUUsT0FBTztBQUFBLEVBQ25DLE9BQU8saUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQVNZLFFBQVEsaUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLFFBQVEsWUFBWTtBQUFBLEVBQzlDLE1BQU0saUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQSxFQUMxQixnQkFBZ0IsaUJBQUUsS0FBSyxDQUFDLFVBQVUsVUFBVSxNQUFNLENBQUMsRUFBRSxRQUFRLE1BQU07QUFBQSxFQUNuRSxjQUFjLGlCQUFFLEtBQUssQ0FBQyxhQUFhLGVBQWUsV0FBVyxRQUFRLENBQUMsRUFBRSxRQUFRLFdBQVc7QUFBQSxFQUMzRixnQkFBZ0IsaUJBQUUsS0FBSyxDQUFDLGFBQWEsVUFBVSxDQUFDLEVBQUUsUUFBUSxVQUFVO0FBQUEsRUFDcEUsUUFBUSxpQkFBRSxNQUFNLGlCQUFFLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQUEsRUFDdEMsT0FBTyxZQUFZLFFBQVEsQ0FBQyxDQUFDO0FBQUEsRUFDN0IsWUFBWSxXQUFXLFNBQVM7QUFDckUsQ0FBQztBQXFCTSxJQUFNLGlCQUFpQixpQkFBRSxPQUFPO0FBQUEsRUFDckMsT0FBTyxpQkFBRSxPQUFPLEVBQUUsU0FBUztBQUFBLEVBQ1UsUUFBUSxpQkFBRSxNQUFNLEtBQUs7QUFDNUQsQ0FBQztBQStCTSxJQUFNLGtCQUFrQixpQkFBRSxLQUFLO0FBQUEsRUFDcEM7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBR00sSUFBTSx5QkFBeUIsaUJBQUUsT0FBTztBQUFBLEVBQzdDLE1BQU0saUJBQUUsS0FBSyxDQUFDLGNBQWMsVUFBVSxDQUFDLEVBQUUsUUFBUSxZQUFZO0FBQUEsRUFDN0QsV0FBVyxpQkFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDbkMsYUFBYSxpQkFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJckMsbUJBQW1CLGlCQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFBQSxFQUMzQyx5QkFBeUIsaUJBQ3RCLE1BQU0sZUFBZSxFQUNyQixRQUFRLENBQUMsVUFBVSxhQUFhLGVBQWUsYUFBYSxDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJaEUsZ0JBQWdCLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsU0FBUztBQUMzRCxDQUFDO0FBR00sSUFBTSxpQkFBaUIsaUJBQUUsT0FBTztBQUFBLEVBQ3JDLFNBQVMsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQ2xDLGNBQWMsdUJBQXVCLFFBQVEsQ0FBQyxDQUFDO0FBQ2pELENBQUM7QUFlTSxJQUFNLG1CQUNYLGlCQUFFLE9BQU87QUFBQSxFQUNQLGVBQWUsaUJBQUUsUUFBUSxDQUFDO0FBQUEsRUFDMUIsTUFBTTtBQUFBLEVBQ04sVUFBVSxpQkFBRSxNQUFNLE9BQU87QUFBQSxFQUN6QixnQkFBZ0IsZUFBZSxTQUFTO0FBQUEsRUFDeEMsWUFBWSxlQUFlLFNBQVM7QUFDdEMsQ0FBQzs7O0FDdlZJLElBQU0sMEJBQTBCO0FBS2hDLElBQU0sZUFBTixjQUEyQixNQUFNO0FBQUEsRUFDdEMsWUFDRSxTQUVTLGVBQ1Q7QUFDQSxVQUFNLE9BQU87QUFGSjtBQUdULFNBQUssT0FBTztBQUFBLEVBQ2Q7QUFDRjtBQVlBLElBQU0sV0FBbUMsQ0FBQztBQWdCbkMsU0FBUyx3QkFBd0IsS0FBNkI7QUFDbkUsTUFBSSxRQUFRLFFBQVEsT0FBTyxRQUFRLFlBQVksTUFBTSxRQUFRLEdBQUcsR0FBRztBQUNqRSxVQUFNLElBQUksYUFBYSxpQ0FBaUM7QUFBQSxFQUMxRDtBQUNBLFFBQU0sU0FBUztBQUNmLFFBQU0sVUFBVSxPQUFPO0FBQ3ZCLE1BQUksT0FBTyxZQUFZLFlBQVksQ0FBQyxPQUFPLFVBQVUsT0FBTyxHQUFHO0FBQzdELFVBQU0sSUFBSSxhQUFhLDZDQUE2QztBQUFBLEVBQ3RFO0FBQ0EsTUFBSSxVQUFVLHlCQUF5QjtBQUVyQyxVQUFNLElBQUk7QUFBQSxNQUNSLHdCQUF3QixPQUFPLCtCQUMxQix1QkFBdUI7QUFBQSxNQUM1QjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsTUFBSSxVQUFVO0FBQ2QsTUFBSSxLQUFLO0FBQ1QsU0FBTyxLQUFLLHlCQUF5QjtBQUNuQyxVQUFNLE9BQU8sU0FBUyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRTtBQUMvQyxRQUFJLENBQUMsTUFBTTtBQUVULFlBQU0sSUFBSTtBQUFBLFFBQ1Isc0NBQXNDLEVBQUU7QUFBQSxRQUN4QztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQ0EsY0FBVSxLQUFLLElBQUksT0FBTztBQUMxQixVQUFNO0FBQUEsRUFDUjtBQUVBLFFBQU0sU0FBUyxpQkFBaUIsVUFBVSxPQUFPO0FBQ2pELE1BQUksQ0FBQyxPQUFPLFNBQVM7QUFDbkIsVUFBTSxJQUFJO0FBQUEsTUFDUiw4Q0FBOEMsRUFBRSxPQUM5QyxPQUFPLE1BQU0sT0FDVixNQUFNLEdBQUcsQ0FBQyxFQUNWLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxLQUFLLEtBQUssR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFDOUMsS0FBSyxJQUFJO0FBQUEsTUFDZDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0EsU0FBTyxFQUFFLEtBQUssT0FBTyxNQUFNLG1CQUFtQixRQUFRO0FBQ3hEOzs7QUN0RU8sSUFBTSxzQkFBc0I7QUFBQSxFQUNqQztBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjtBQVNPLElBQU0sNEJBQTRCO0FBQUEsRUFDdkM7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjtBQUVPLElBQU0sZ0JBQStCO0FBQUEsRUFDMUMsV0FBVztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFO0FBQUEsSUFDdEIsT0FBTyxFQUFFLGFBQWEsUUFBUSxXQUFXLFFBQVE7QUFBQSxFQUNuRDtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFO0FBQUEsSUFDdEIsT0FBTyxFQUFFLGFBQWEsUUFBUSxXQUFXLFNBQVMsY0FBYyxLQUFLO0FBQUEsRUFDdkU7QUFBQSxFQUVBLFlBQVk7QUFBQSxJQUNWLE1BQU07QUFBQTtBQUFBO0FBQUEsSUFHTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUE7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVSxHQUFHLG9CQUFvQixLQUFLO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUsxRCxPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsbUJBQW1CO0FBQUEsSUFDN0QsTUFBTTtBQUFBLE1BQ0osT0FDRTtBQUFBLElBS0o7QUFBQSxFQUNGO0FBQUEsRUFFQSxPQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUU7QUFBQSxJQUN0QixPQUFPLEVBQUUsYUFBYSxRQUFRLFdBQVcsU0FBUztBQUFBLEVBQ3BEO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUU7QUFBQSxJQUN0QixPQUFPLEVBQUUsYUFBYSxRQUFRLFdBQVcscUJBQXFCO0FBQUEsRUFDaEU7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUlOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFO0FBQUEsSUFDaEMsT0FBTyxFQUFFLGFBQWEsU0FBUyxXQUFXLFFBQVE7QUFBQSxFQUNwRDtBQUFBLEVBRUEsZUFBZTtBQUFBLElBQ2IsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEdBQUcsb0JBQW9CLEtBQUs7QUFBQSxJQUMxRCxPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsbUJBQW1CO0FBQUEsSUFDN0QsTUFBTTtBQUFBLE1BQ0osT0FDRTtBQUFBLElBUUo7QUFBQSxFQUNGO0FBQUEsRUFFQSxhQUFhO0FBQUEsSUFDWCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUU7QUFBQSxJQUN0QixPQUFPLEVBQUUsYUFBYSxRQUFRLFdBQVcsUUFBUTtBQUFBLEVBQ25EO0FBQUEsRUFFQSxjQUFjO0FBQUEsSUFDWixNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUU7QUFBQSxJQUN0QixPQUFPLEVBQUUsYUFBYSxRQUFRLFdBQVcsUUFBUTtBQUFBLEVBQ25EO0FBQUEsRUFFQSxtQkFBbUI7QUFBQSxJQUNqQixNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxVQUFVO0FBQUE7QUFBQTtBQUFBLE1BR1IscUJBQXFCO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFJckIsT0FBTztBQUFBLFFBQ0w7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsYUFBYTtBQUFBLElBQ3ZELE1BQU07QUFBQSxNQUNKLE9BQ0U7QUFBQSxJQUlKO0FBQUEsRUFDRjtBQUFBLEVBRUEsaUJBQWlCO0FBQUEsSUFDZixNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtSLE9BQU87QUFBQSxRQUNMO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLGFBQWE7QUFBQSxNQUNiLFdBQVc7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS1gsVUFBVSxDQUFDLFNBQVM7QUFBQSxNQUNwQixpQkFBaUI7QUFBQSxJQUNuQjtBQUFBLElBQ0EsTUFBTTtBQUFBLE1BQ0osT0FDRTtBQUFBLElBR0o7QUFBQSxFQUNGO0FBQUEsRUFFQSxVQUFVO0FBQUEsSUFDUixNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLEVBQUUsT0FBTyxDQUFDLE9BQU8sVUFBVSxFQUFFO0FBQUE7QUFBQTtBQUFBLElBR3ZDLE9BQU8sRUFBRSxhQUFhLHdCQUF3QixXQUFXLGNBQWM7QUFBQSxJQUN2RSxNQUFNO0FBQUEsTUFDSixPQUNFO0FBQUEsSUFJSjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLFVBQVU7QUFBQSxJQUNSLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVU7QUFBQSxNQUNSLE9BQU8sQ0FBQyxVQUFVO0FBQUE7QUFBQTtBQUFBLE1BR2xCLGVBQWUsQ0FBQyxPQUFPO0FBQUEsSUFDekI7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLGFBQWE7QUFBQSxNQUNiLFdBQVc7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS1gsVUFBVSxDQUFDLE9BQU87QUFBQSxJQUNwQjtBQUFBLElBQ0EsTUFBTTtBQUFBLE1BQ0osT0FDRTtBQUFBLElBR0o7QUFBQSxFQUNGO0FBQUEsRUFFQSxhQUFhO0FBQUEsSUFDWCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLENBQUMsY0FBYyxlQUFlO0FBQUEsSUFDeEMsVUFBVTtBQUFBO0FBQUE7QUFBQSxNQUdSLHFCQUFxQjtBQUFBLE1BQ3JCLE9BQU87QUFBQSxRQUNMO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU8sRUFBRSxhQUFhLFNBQVMsV0FBVyxhQUFhO0FBQUEsSUFDdkQsTUFBTTtBQUFBLE1BQ0osT0FDRTtBQUFBLElBR0o7QUFBQSxFQUNGO0FBQUEsRUFFQSxXQUFXO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVSxDQUFDLFdBQVcsaUJBQWlCLG1CQUFtQixlQUFlO0FBQUEsSUFDekUsVUFBVTtBQUFBO0FBQUE7QUFBQSxNQUdSLHFCQUFxQjtBQUFBLE1BQ3JCLE9BQU8sQ0FBQyxZQUFZLHVCQUF1QjtBQUFBLE1BQzNDLHFCQUNFO0FBQUEsSUFJSjtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSUEsT0FBTyxFQUFFLGFBQWEsU0FBUyxXQUFXLGFBQWE7QUFBQSxJQUN2RCxNQUFNO0FBQUEsTUFDSixPQUNFO0FBQUEsSUFHSjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLHFCQUFxQjtBQUFBLElBQ25CLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUFBLElBQ3RCLE9BQU8sRUFBRSxhQUFhLFNBQVMsV0FBVyxlQUFlO0FBQUEsRUFDM0Q7QUFBQSxFQUVBLGdCQUFnQjtBQUFBLElBQ2QsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLGFBQWEsQ0FBQyxTQUFTLEVBQUU7QUFBQSxJQUNoRCxPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsZUFBZTtBQUFBLEVBQzNEO0FBQUEsRUFFQSxzQkFBc0I7QUFBQSxJQUNwQixNQUFNO0FBQUE7QUFBQTtBQUFBLElBR04sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLGFBQWEsQ0FBQyxTQUFTLEVBQUU7QUFBQSxJQUNoRCxPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsZUFBZTtBQUFBLEVBQzNEO0FBQUEsRUFFQSxPQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBTU4sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLZCxVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsb0JBQW9CLEtBQUs7QUFBQSxJQUNoRCxPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsYUFBYTtBQUFBLElBQ3ZELE1BQU07QUFBQSxNQUNKLE9BQ0U7QUFBQSxJQVdKO0FBQUEsRUFDRjtBQUFBLEVBRUEsa0JBQWtCO0FBQUEsSUFDaEIsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUt0QixPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsY0FBYztBQUFBLElBQ3hELE1BQU07QUFBQSxNQUNKLE9BQ0U7QUFBQSxJQUVKO0FBQUEsRUFDRjtBQUFBLEVBRUEsY0FBYztBQUFBLElBQ1osTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSVYsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFXZCxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVUsVUFBVSxVQUFVLEVBQUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQU9wRCxPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsY0FBYztBQUFBLElBQ3hELE1BQU07QUFBQSxNQUNKLE9BQ0U7QUFBQSxJQUdKO0FBQUEsRUFDRjtBQUFBLEVBRUEsT0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBO0FBQUEsSUFFVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUE7QUFBQTtBQUFBLElBR2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLFVBQVUsVUFBVSxFQUFFO0FBQUE7QUFBQSxJQUVwRCxPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsY0FBYztBQUFBLElBQ3hELE1BQU07QUFBQSxNQUNKLE9BQ0U7QUFBQSxJQUdKO0FBQUEsRUFDRjtBQUFBLEVBRUEsY0FBYztBQUFBLElBQ1osTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFO0FBQUEsSUFDdEIsT0FBTyxFQUFFLGFBQWEsUUFBUSxXQUFXLFNBQVM7QUFBQSxFQUNwRDtBQUNGO0FBR08sSUFBTSx1QkFBdUIsT0FBTyxLQUFLLGFBQWE7QUF1QnRELFNBQVMsWUFBWSxPQUFzQjtBQUNoRCxRQUFNLFFBQVEsY0FBYyxNQUFNLElBQUk7QUFDdEMsTUFBSSxpQkFBaUIsU0FBUyxNQUFNLFVBQVU7QUFDNUMsV0FBTyxHQUFHLE1BQU0sWUFBWSxJQUFJLE1BQU0sWUFBWSxJQUFJO0FBQUEsRUFDeEQ7QUFDQSxTQUFPLE1BQU07QUFDZjs7O0FDNWlCTyxJQUFNLHVCQUE0QyxvQkFBSSxJQUFJO0FBQUEsRUFDL0Q7QUFBQSxFQUNBO0FBQ0YsQ0FBQzs7O0FDcUNNLElBQU0scUJBQXFCO0FBSWxDLFNBQVMsTUFBTSxNQUFzQjtBQUNuQyxNQUFJLE9BQU87QUFDWCxXQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxLQUFLO0FBQ3BDLFlBQVEsS0FBSyxXQUFXLENBQUM7QUFDekIsV0FBTyxLQUFLLEtBQUssTUFBTSxRQUFVO0FBQUEsRUFDbkM7QUFDQSxVQUFRLFNBQVMsR0FBRyxTQUFTLEVBQUUsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNsRDtBQUVBLFNBQVMsc0JBQThCO0FBQ3JDLFFBQU0sUUFBUSxDQUFDLEdBQUcsb0JBQW9CLEVBQ25DLEtBQUssRUFDTCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sY0FBYyxJQUFJLEVBQUUsUUFBUSxDQUFDO0FBQ3JELFFBQU0sV0FBVyxLQUFLLFVBQVU7QUFBQSxJQUM5QixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsSUFDUjtBQUFBLEVBQ0YsQ0FBQztBQUNELFNBQU8sR0FBRyxrQkFBa0IsSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUNqRDtBQUlPLElBQU0sZ0JBQWdCLG9CQUFvQjtBQU1qRCxTQUFTLGVBQWUsT0FBZ0MsTUFBb0I7QUFDMUUsUUFBTSxXQUFXLEtBQUssUUFBUSxLQUFLO0FBQ25DLE1BQUksYUFBYSxJQUFJO0FBRW5CLFVBQU0sUUFBUSxLQUFLLE1BQU0sR0FBRyxRQUFRO0FBQ3BDLFVBQU0sTUFBTSxLQUFLLE1BQU0sV0FBVyxDQUFDO0FBQ25DLFVBQU0sTUFBTSxNQUFNLEtBQUs7QUFDdkIsUUFBSSxNQUFNLFFBQVEsR0FBRyxHQUFHO0FBQ3RCLGlCQUFXLE1BQU0sS0FBSztBQUNwQixZQUFJLE9BQU8sUUFBUSxPQUFPLE9BQU8sVUFBVTtBQUN6QyxpQkFBUSxHQUErQixHQUFHO0FBQUEsUUFDNUM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUNBO0FBQUEsRUFDRjtBQUNBLFFBQU0sU0FBUyxLQUFLLFFBQVEsR0FBRztBQUMvQixNQUFJLFdBQVcsSUFBSTtBQUdqQixVQUFNLFNBQVMsTUFBTSxLQUFLLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDMUMsUUFBSSxXQUFXLFFBQVEsT0FBTyxXQUFXLFlBQVksQ0FBQyxNQUFNLFFBQVEsTUFBTSxHQUFHO0FBQzNFLGFBQVEsT0FBbUMsS0FBSyxNQUFNLFNBQVMsQ0FBQyxDQUFDO0FBQUEsSUFDbkU7QUFDQTtBQUFBLEVBQ0Y7QUFFQSxTQUFPLE1BQU0sSUFBSTtBQUNuQjtBQVNBLFNBQVMsbUJBQW1CLE9BQXNCO0FBQ2hELE1BQUksTUFBTSxRQUFRLEtBQUssR0FBRztBQUN4QixlQUFXLE1BQU0sTUFBTyxvQkFBbUIsRUFBRTtBQUM3QztBQUFBLEVBQ0Y7QUFDQSxNQUFJLFVBQVUsUUFBUSxPQUFPLFVBQVUsU0FBVTtBQUNqRCxRQUFNLE1BQU07QUFFWixNQUFJLElBQUksU0FBUyxTQUFTO0FBQ3hCLGVBQVcsU0FBUyxvQkFBcUIsUUFBTyxJQUFJLEtBQUs7QUFBQSxFQUMzRDtBQUNBLE1BQ0UsT0FBTyxJQUFJLFNBQVMsWUFDcEIscUJBQXFCLElBQUksSUFBSSxJQUFJLEtBQ2pDLE1BQU0sUUFBUSxJQUFJLE9BQU8sR0FDekI7QUFDQSxlQUFXLFVBQVUsSUFBSSxTQUFTO0FBQ2hDLFVBQUksV0FBVyxRQUFRLE9BQU8sV0FBVyxVQUFVO0FBQ2pELG1CQUFXLFNBQVMsMkJBQTJCO0FBQzdDLGlCQUFRLE9BQW1DLEtBQUs7QUFBQSxRQUNsRDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLGFBQVcsT0FBTyxPQUFPLEtBQUssR0FBRyxFQUFHLG9CQUFtQixJQUFJLEdBQUcsQ0FBQztBQUNqRTtBQTRCQSxJQUFNLGNBQWM7QUFJcEIsSUFBTSxpQkFBc0Msb0JBQUksSUFBSTtBQUFBLEVBQ2xEO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBU0QsU0FBUyxVQUFVLE9BQW9DO0FBQ3JELFNBQU8sT0FBTyxVQUFVLFlBQ3RCLE9BQU8sVUFBVSxLQUFLLEtBQ3RCLFFBQVEsS0FDUixTQUFTLGNBQ1AsUUFDQTtBQUNOO0FBR0EsU0FBUyxXQUFXLE9BQW9DO0FBQ3RELFNBQU8sT0FBTyxVQUFVLFlBQVksZUFBZSxJQUFJLEtBQUssSUFDeEQsUUFDQTtBQUNOO0FBT08sU0FBUyxvQkFDZCxPQUMyQjtBQUMzQixRQUFNLGNBQWMsTUFBTTtBQUMxQixRQUFNLE9BQU8sT0FBTyxhQUFhLFNBQVMsV0FBVyxZQUFZLE9BQU87QUFDeEUsTUFBSSxDQUFDLFFBQVEsU0FBUyxVQUFXLFFBQU87QUFFeEMsUUFBTSxRQUF1QixDQUFDO0FBTTlCLFFBQU0sU0FBUyxhQUFhO0FBQzVCLE1BQUksTUFBTSxRQUFRLE1BQU0sR0FBRztBQUN6QixVQUFNLFFBQVEsVUFBVSxPQUFPLE1BQU07QUFDckMsUUFBSSxVQUFVLE9BQVcsT0FBTSxjQUFjO0FBQUEsRUFDL0M7QUFHQSxRQUFNLFNBQVMsYUFBYTtBQUM1QixNQUFJLE1BQU0sUUFBUSxNQUFNLEtBQUssT0FBTyxTQUFTLEdBQUc7QUFDOUMsVUFBTSxTQUFTO0FBQUEsTUFDWixPQUFPLENBQUMsR0FBc0M7QUFBQSxJQUNqRDtBQUNBLFFBQUksV0FBVyxPQUFXLE9BQU0sU0FBUztBQUFBLEVBQzNDO0FBR0EsUUFBTSxlQUFlLGFBQWE7QUFDbEMsTUFBSSxNQUFNLFFBQVEsWUFBWSxLQUFLLGFBQWEsU0FBUyxHQUFHO0FBQzFELFVBQU0sV0FBWSxhQUFhLENBQUMsR0FDNUI7QUFDSixVQUFNLFNBQVMsV0FBVyxVQUFVLE1BQU07QUFDMUMsUUFBSSxXQUFXLE9BQVcsT0FBTSxTQUFTO0FBQUEsRUFDM0M7QUFHQSxRQUFNLFVBQVUsYUFBYTtBQUM3QixNQUFJLE1BQU0sUUFBUSxPQUFPLEtBQUssUUFBUSxTQUFTLEdBQUc7QUFDaEQsVUFBTSxXQUFZLFFBQVEsQ0FBQyxHQUN2QjtBQUNKLFFBQUksTUFBTSxRQUFRLFFBQVEsR0FBRztBQUMzQixZQUFNLFFBQVEsVUFBVSxTQUFTLE1BQU07QUFDdkMsVUFBSSxVQUFVLE9BQVcsT0FBTSxjQUFjO0FBQUEsSUFDL0M7QUFBQSxFQUNGO0FBRUEsU0FBTyxPQUFPLEtBQUssS0FBSyxFQUFFLFNBQVMsSUFBSSxRQUFRO0FBQ2pEO0FBRUEsU0FBUyxpQkFBaUIsT0FBc0M7QUFDOUQsUUFBTSxPQUFPLE1BQU07QUFDbkIsUUFBTSxRQUNKLE9BQU8sU0FBUyxZQUFZLFFBQVEsZ0JBQ2hDLGNBQWMsSUFBa0MsSUFDaEQ7QUFDTixNQUFJLENBQUMsT0FBTztBQUlWLFVBQU0sSUFBSSxNQUFNLGdDQUFnQyxPQUFPLElBQUksQ0FBQyxFQUFFO0FBQUEsRUFDaEU7QUFJQSxRQUFNLFFBQVEsTUFBTSxTQUFTLHNCQUN6QixvQkFBb0IsS0FBSyxJQUN6QjtBQUVKLGFBQVcsUUFBUSxNQUFNLFNBQVMsTUFBTyxnQkFBZSxPQUFPLElBQUk7QUFFbkUsTUFBSSxNQUFPLE9BQU0sZ0JBQWdCO0FBRWpDLGFBQVcsU0FBUyxNQUFNLFNBQVMsZUFBZSxDQUFDLEdBQUc7QUFDcEQsVUFBTSxXQUFXLE1BQU0sS0FBSztBQUM1QixRQUFJLE1BQU0sUUFBUSxRQUFRLEdBQUc7QUFDM0IsaUJBQVcsU0FBUyxVQUFVO0FBQzVCLFlBQUksVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVO0FBQy9DLDJCQUFpQixLQUFnQztBQUFBLFFBQ25EO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEscUJBQW1CLEtBQUs7QUFDMUI7QUE2Qk8sU0FBUyxjQUFjLE9BQThCO0FBQzFELFFBQU0sUUFBUSxnQkFBZ0IsS0FBSztBQUNuQyxtQkFBaUIsS0FBSztBQUN0QixTQUFPO0FBQ1Q7QUFpQk8sU0FBUyx5QkFDZCxLQUMyQjtBQUMzQixRQUFNLFFBQVEsZ0JBQWdCLEdBQUc7QUFLakMsYUFBVyxXQUFXLE1BQU0sVUFBVTtBQUNwQyxlQUFXLE9BQU8sUUFBUSxNQUFNO0FBQzlCLGlCQUFXLFVBQVUsSUFBSSxTQUFTO0FBQ2hDLG1CQUFXLFNBQVMsT0FBTyxRQUFRO0FBQ2pDLGNBQUksVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVO0FBQy9DLDZCQUFpQixLQUFnQztBQUFBLFVBQ25EO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUdBLFFBQU0sUUFBUSxNQUFNO0FBQ3BCLE1BQUksVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVO0FBQy9DLFVBQU0sY0FBZSxNQUErQjtBQUNwRCxRQUFJLE1BQU0sUUFBUSxXQUFXLEdBQUc7QUFDOUIsaUJBQVcsU0FBUyxhQUFhO0FBQy9CLFlBQUksVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVO0FBQy9DLDJCQUFpQixLQUFnQztBQUFBLFFBQ25EO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEscUJBQW1CLEtBQUs7QUFDeEIsU0FBTztBQUNUOzs7QUM5V0EsU0FBUyxTQUFTLE1BQXNCO0FBQ3RDLE1BQUksT0FBTztBQUNYLFdBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLEtBQUs7QUFDcEMsWUFBUSxLQUFLLFdBQVcsQ0FBQztBQUN6QixXQUFPLEtBQUssS0FBSyxNQUFNLFFBQVU7QUFBQSxFQUNuQztBQUNBLFNBQU8sU0FBUztBQUNsQjtBQUdBLFNBQVMsV0FBVyxNQUE0QjtBQUM5QyxNQUFJLElBQUksU0FBUztBQUNqQixTQUFPLE1BQU07QUFDWCxRQUFLLElBQUksZUFBZ0I7QUFDekIsUUFBSSxJQUFJO0FBQ1IsUUFBSSxLQUFLLEtBQUssSUFBSyxNQUFNLElBQUssSUFBSSxDQUFDO0FBQ25DLFNBQUssSUFBSSxLQUFLLEtBQUssSUFBSyxNQUFNLEdBQUksSUFBSSxFQUFFO0FBQ3hDLGFBQVMsSUFBSyxNQUFNLFFBQVMsS0FBSztBQUFBLEVBQ3BDO0FBQ0Y7QUFtQk8sU0FBUyxjQUFpQixPQUFxQixTQUFzQjtBQUMxRSxRQUFNLE1BQU0sQ0FBQyxHQUFHLEtBQUs7QUFDckIsUUFBTSxPQUFPLFdBQVcsU0FBUyxPQUFPLENBQUM7QUFDekMsV0FBUyxJQUFJLElBQUksU0FBUyxHQUFHLElBQUksR0FBRyxLQUFLO0FBQ3ZDLFVBQU0sSUFBSSxLQUFLLE1BQU0sS0FBSyxLQUFLLElBQUksRUFBRTtBQUNyQyxVQUFNLElBQUksSUFBSSxDQUFDO0FBQ2YsUUFBSSxDQUFDLElBQUksSUFBSSxDQUFDO0FBQ2QsUUFBSSxDQUFDLElBQUk7QUFBQSxFQUNYO0FBQ0EsTUFBSSxJQUFJLFNBQVMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxPQUFPLE1BQU0sVUFBVSxNQUFNLENBQUMsQ0FBQyxHQUFHO0FBQ2pFLFFBQUksS0FBSyxJQUFJLE1BQU0sQ0FBTTtBQUFBLEVBQzNCO0FBQ0EsU0FBTztBQUNUO0FBUU8sU0FBUyxtQkFDZCxLQUNBLFNBQzJCO0FBQzNCLFFBQU0sUUFBUSxnQkFBZ0IsR0FBRztBQU1qQyxRQUFNLGVBQWUsQ0FBQyxVQUF5QztBQUM3RCxVQUFNLE9BQU8sTUFBTTtBQUNuQixVQUFNLFFBQ0osT0FBTyxTQUFTLFlBQVksUUFBUSxnQkFDaEMsY0FBYyxJQUFrQyxJQUNoRDtBQUNOLFFBQUksQ0FBQyxNQUFPO0FBQ1osZUFBVyxTQUFTLE1BQU0sU0FBUyxpQkFBaUIsQ0FBQyxHQUFHO0FBQ3RELFlBQU0sTUFBTSxNQUFNLEtBQUs7QUFDdkIsVUFBSSxNQUFNLFFBQVEsR0FBRyxHQUFHO0FBQ3RCLGNBQU0sS0FBSyxJQUFJO0FBQUEsVUFDYjtBQUFBLFVBQ0EsR0FBRyxPQUFPLElBQUksT0FBTyxNQUFNLE1BQU0sRUFBRSxDQUFDLElBQUksS0FBSztBQUFBLFFBQy9DO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFFQSxlQUFXLFNBQVMsTUFBTSxTQUFTLGVBQWUsQ0FBQyxHQUFHO0FBQ3BELFlBQU0sV0FBVyxNQUFNLEtBQUs7QUFDNUIsVUFBSSxNQUFNLFFBQVEsUUFBUSxHQUFHO0FBQzNCLG1CQUFXLFNBQVMsVUFBVTtBQUM1QixjQUFJLFVBQVUsUUFBUSxPQUFPLFVBQVUsVUFBVTtBQUMvQyx5QkFBYSxLQUFnQztBQUFBLFVBQy9DO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLGFBQVcsV0FBVyxNQUFNLFVBQVU7QUFDcEMsZUFBVyxPQUFPLFFBQVEsTUFBTTtBQUM5QixpQkFBVyxVQUFVLElBQUksU0FBUztBQUNoQyxtQkFBVyxTQUFTLE9BQU8sUUFBUTtBQUNqQyxjQUFJLFVBQVUsUUFBUSxPQUFPLFVBQVUsVUFBVTtBQUMvQyx5QkFBYSxLQUFnQztBQUFBLFVBQy9DO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLFNBQU87QUFDVDs7O0FDN0JPLFNBQVMsb0JBQW9CLE9BQXlCO0FBQzNELFNBQ0UsTUFBTSxRQUFRLEtBQUssS0FDbkIsTUFBTSxTQUFTLEtBQ2YsTUFBTTtBQUFBLElBQ0osQ0FBQyxTQUNDLE9BQU8sU0FBUyxZQUNoQixTQUFTLFFBQ1QsT0FBUSxLQUEwQixPQUFPLFlBQ3pDLE9BQVEsS0FBNEIsU0FBUztBQUFBLEVBQ2pEO0FBQUE7QUFBQSxFQUdBLE1BQU0sTUFBTSxDQUFDLFNBQVM7QUFDcEIsVUFBTSxJQUFLLEtBQTBCO0FBQ3JDLFdBQU8sTUFBTSxVQUFVLE1BQU0sV0FBVyxNQUFNLGlCQUFpQixNQUFNO0FBQUEsRUFDdkUsQ0FBQztBQUVMO0FBS08sU0FBUyxjQUFnQyxPQUFlO0FBQzdELFFBQU0sTUFBVyxDQUFDO0FBQ2xCLGFBQVcsU0FBUyxPQUFPLE9BQU8sS0FBZ0MsR0FBRztBQUNuRSxRQUFJLG9CQUFvQixLQUFLLEVBQUcsS0FBSSxLQUFLLEdBQUksS0FBYTtBQUFBLEVBQzVEO0FBQ0EsU0FBTztBQUNUOzs7QUN0RU8sSUFBTSx5QkFBTixjQUFxQyxNQUFNO0FBQUEsRUFDdkM7QUFBQSxFQUNULFlBQVksVUFBb0I7QUFDOUIsVUFBTSxpQ0FBaUMsU0FBUyxLQUFLLElBQUksQ0FBQyxFQUFFO0FBQzVELFNBQUssT0FBTztBQUNaLFNBQUssV0FBVztBQUFBLEVBQ2xCO0FBQ0Y7QUFxQ08sSUFBTSxrQkFBa0Isb0JBQUksSUFBSTtBQUFBLEVBQ3JDO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBQ00sSUFBTSxjQUFjLG9CQUFJLElBQUk7QUFBQSxFQUNqQztBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQUdELFNBQVMsZ0JBQWdCLE1BQXlDO0FBQ2hFLFFBQU0sU0FBUyxPQUFPLEtBQUssV0FBVyxXQUFXLEtBQUssU0FBUztBQUMvRCxRQUFNLGFBQWEsTUFBTSxRQUFRLEtBQUssaUJBQWlCLElBQ2xELEtBQUssa0JBQWdDO0FBQUEsSUFDcEMsQ0FBQyxNQUFtQixPQUFPLE1BQU07QUFBQSxFQUNuQyxJQUNBLENBQUM7QUFDTCxRQUFNLGFBQWEsS0FBSztBQUN4QixTQUFPO0FBQUEsSUFDTCxJQUFJLE9BQU8sS0FBSyxNQUFNLEVBQUU7QUFBQTtBQUFBO0FBQUEsSUFHeEIsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFVO0FBQUEsSUFDL0IsWUFDRSxlQUFlLGFBQWEsZUFBZSxTQUFTLGFBQWE7QUFBQSxJQUNuRSxXQUFXLE9BQU8sS0FBSyxjQUFjLFdBQVcsS0FBSyxZQUFZO0FBQUEsSUFDakUsYUFBYSxLQUFLLGdCQUFnQixlQUFlLGVBQWU7QUFBQSxJQUNoRSxpQkFBaUIsTUFBTSxRQUFRLEtBQUssZUFBZSxJQUM5QyxLQUFLLGtCQUtOLENBQUM7QUFBQSxJQUNMLE1BQU0sTUFBTSxRQUFRLEtBQUssSUFBSSxJQUFLLEtBQUssT0FBcUI7QUFBQSxJQUM1RCw2QkFBNkIsS0FBSyxnQ0FBZ0M7QUFBQSxFQUNwRTtBQUNGO0FBS0EsU0FBUyxnQkFBZ0IsTUFBeUM7QUFDaEUsUUFBTSxTQUFTLE9BQU8sS0FBSyxXQUFXLFdBQVcsS0FBSyxTQUFTO0FBQy9ELFFBQU0sYUFBYSxNQUFNLFFBQVEsS0FBSyxpQkFBaUIsSUFDbEQsS0FBSyxrQkFBZ0M7QUFBQSxJQUNwQyxDQUFDLE1BQW1CLE9BQU8sTUFBTTtBQUFBLEVBQ25DLElBQ0EsQ0FBQztBQUNMLFNBQU87QUFBQSxJQUNMLElBQUksT0FBTyxLQUFLLE1BQU0sRUFBRTtBQUFBLElBQ3hCLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBVTtBQUFBLElBQy9CLFlBQVk7QUFBQSxJQUNaLFdBQVcsT0FBTyxLQUFLLGNBQWMsV0FBVyxLQUFLLFlBQVk7QUFBQSxJQUNqRSxhQUFhLEtBQUssZ0JBQWdCLGVBQWUsZUFBZTtBQUFBLElBQ2hFLGlCQUFpQixDQUFDO0FBQUEsSUFDbEIsTUFBTTtBQUFBO0FBQUEsSUFFTiw2QkFBNkI7QUFBQSxFQUMvQjtBQUNGO0FBZUEsSUFBTSxlQUFlLG9CQUFJLElBQUksQ0FBQyxRQUFRLFdBQVcsTUFBTSxDQUFDO0FBQ3hELElBQU0sZUFBZSxvQkFBSSxJQUFJLENBQUMsU0FBUyxZQUFZLENBQUM7QUFJcEQsU0FBUyxJQUFJLE9BQWdCLElBQXNDO0FBQ2pFLFNBQU8sVUFBVSxVQUFhLENBQUMsR0FBRyxLQUFLO0FBQ3pDO0FBRUEsSUFBTSxXQUFXLENBQUMsTUFBZSxPQUFPLE1BQU07QUFDOUMsSUFBTSxXQUFXLENBQUMsTUFBZSxPQUFPLE1BQU07QUFDOUMsSUFBTSxZQUFZLENBQUMsTUFBZSxPQUFPLE1BQU07QUFDL0MsSUFBTSxXQUFXLENBQUMsTUFBZSxNQUFNLFFBQVEsQ0FBQztBQUNoRCxJQUFNLGdCQUFnQixDQUFDLE1BQ3JCLE1BQU0sUUFBUSxPQUFPLE1BQU0sWUFBWSxDQUFDLE1BQU0sUUFBUSxDQUFDO0FBTXpELFNBQVMsYUFDUCxPQUNBLFNBQ0EsVUFDTTtBQUNOLGFBQVcsUUFBUSxPQUFPO0FBQ3hCLFFBQUksQ0FBQyxjQUFjLElBQUksR0FBRztBQUN4QixlQUFTLEtBQUssU0FBUyxPQUFPLHVDQUF1QztBQUFBLElBQ3ZFLFdBQVcsT0FBTyxLQUFLLE9BQU8sVUFBVTtBQUN0QyxlQUFTLEtBQUssU0FBUyxPQUFPLCtCQUErQjtBQUFBLElBQy9EO0FBQUEsRUFDRjtBQUNGO0FBSUEsU0FBUyxlQUNQLE1BQ0EsT0FDQSxVQUNBLFdBQ007QUFDTixNQUFJLElBQUksS0FBSyxRQUFRLFFBQVEsR0FBRztBQUM5QixhQUFTLEtBQUssR0FBRyxLQUFLLDBCQUEwQjtBQUFBLEVBQ2xEO0FBQ0EsTUFBSSxJQUFJLEtBQUssbUJBQW1CLFFBQVEsR0FBRztBQUN6QyxhQUFTLEtBQUssR0FBRyxLQUFLLHFDQUFxQztBQUFBLEVBQzdELFdBQVcsTUFBTSxRQUFRLEtBQUssaUJBQWlCLEdBQUc7QUFHaEQsUUFBSSxDQUFDLEtBQUssa0JBQWtCLE1BQU0sUUFBUSxHQUFHO0FBQzNDLGVBQVMsS0FBSyxHQUFHLEtBQUssNENBQTRDO0FBQUEsSUFDcEU7QUFBQSxFQUNGO0FBQ0EsTUFBSSxJQUFJLEtBQUssWUFBWSxDQUFDLE1BQU0sYUFBYSxJQUFJLENBQVcsQ0FBQyxHQUFHO0FBQzlELGFBQVMsS0FBSyxHQUFHLEtBQUssd0NBQXdDO0FBQUEsRUFDaEU7QUFDQSxNQUFJLElBQUksS0FBSyxXQUFXLFFBQVEsR0FBRztBQUNqQyxhQUFTLEtBQUssR0FBRyxLQUFLLDZCQUE2QjtBQUFBLEVBQ3JEO0FBQ0EsTUFBSSxJQUFJLEtBQUssYUFBYSxDQUFDLE1BQU0sYUFBYSxJQUFJLENBQVcsQ0FBQyxHQUFHO0FBQy9ELGFBQVMsS0FBSyxHQUFHLEtBQUsseUNBQXlDO0FBQUEsRUFDakU7QUFDQSxNQUFJLFVBQVc7QUFDZixNQUFJLElBQUksS0FBSyxpQkFBaUIsUUFBUSxHQUFHO0FBQ3ZDLGFBQVMsS0FBSyxHQUFHLEtBQUssbUNBQW1DO0FBQUEsRUFDM0Q7QUFDQSxNQUFJLElBQUksS0FBSyxNQUFNLFFBQVEsR0FBRztBQUM1QixhQUFTLEtBQUssR0FBRyxLQUFLLHdCQUF3QjtBQUFBLEVBQ2hEO0FBQ0EsTUFBSSxJQUFJLEtBQUssNkJBQTZCLFNBQVMsR0FBRztBQUdwRCxhQUFTLEtBQUssR0FBRyxLQUFLLGdEQUFnRDtBQUFBLEVBQ3hFO0FBQ0Y7QUFJQSxTQUFTLGtCQUNQLE9BQ0EsS0FDQSxtQkFDQSxTQUNBLFVBQ007QUFDTixNQUFJLE1BQU0sUUFBUSxLQUFLLEdBQUc7QUFDeEIsUUFBSSxrQkFBa0IsS0FBSyxFQUFHO0FBQzlCLGVBQVcsUUFBUSxPQUFPO0FBQ3hCLHdCQUFrQixNQUFNLEtBQUssbUJBQW1CLFNBQVMsUUFBUTtBQUFBLElBQ25FO0FBQ0E7QUFBQSxFQUNGO0FBQ0EsTUFBSSxVQUFVLFFBQVEsT0FBTyxVQUFVLFNBQVU7QUFDakQsUUFBTSxPQUFPO0FBRWIsTUFBSSxLQUFLLFNBQVMsV0FBVyxPQUFPLEtBQUssT0FBTyxVQUFVO0FBS3hELGFBQVMsS0FBSyxTQUFTLE9BQU8scUNBQXFDO0FBQUEsRUFDckU7QUFDQSxNQUFJLEtBQUssU0FBUyxXQUFXLE9BQU8sS0FBSyxPQUFPLFVBQVU7QUFDeEQsbUJBQWUsTUFBTSxTQUFTLE9BQU8sV0FBVyxLQUFLLEVBQUUsSUFBSSxVQUFVLEtBQUs7QUFDMUUsUUFBSSxLQUFLLGdCQUFnQixJQUFJLENBQUM7QUFDOUI7QUFBQSxFQUNGO0FBQ0EsTUFBSSxPQUFPLEtBQUssU0FBUyxZQUFZLHFCQUFxQixJQUFJLEtBQUssSUFBSSxHQUFHO0FBQ3hFLFFBQUksSUFBSSxLQUFLLFNBQVMsUUFBUSxHQUFHO0FBQy9CLGVBQVMsS0FBSyxTQUFTLE9BQU8sMkJBQTJCO0FBQUEsSUFDM0Q7QUFDQSxRQUFJLE1BQU0sUUFBUSxLQUFLLE9BQU8sR0FBRztBQUMvQixpQkFBVyxVQUFVLEtBQUssU0FBUztBQUNqQyxZQUFJLFdBQVcsUUFBUSxPQUFPLFdBQVcsVUFBVTtBQUNqRCxtQkFBUyxLQUFLLFNBQVMsT0FBTyx3Q0FBd0M7QUFDdEU7QUFBQSxRQUNGO0FBQ0EsY0FBTSxJQUFJO0FBQ1YsWUFBSSxPQUFPLEVBQUUsT0FBTyxVQUFVO0FBQzVCLG1CQUFTLEtBQUssU0FBUyxPQUFPLGdDQUFnQztBQUFBLFFBQ2hFLE9BQU87QUFDTCx5QkFBZSxHQUFHLFNBQVMsT0FBTyxZQUFZLEVBQUUsRUFBRSxJQUFJLFVBQVUsSUFBSTtBQUFBLFFBQ3RFO0FBQ0EsWUFBSSxLQUFLLGdCQUFnQixDQUFDLENBQUM7QUFBQSxNQUM3QjtBQUFBLElBRUY7QUFBQSxFQUNGO0FBQ0EsYUFBVyxTQUFTLE9BQU8sT0FBTyxJQUFJLEdBQUc7QUFDdkMsc0JBQWtCLE9BQU8sS0FBSyxtQkFBbUIsU0FBUyxRQUFRO0FBQUEsRUFDcEU7QUFDRjtBQVVBLFNBQVMsTUFDUCxPQUNBLEtBQ0EsVUFDTTtBQUNOLFFBQU0sS0FBSyxPQUFPLE1BQU0sT0FBTyxXQUFXLE1BQU0sS0FBSztBQUNyRCxRQUFNLE9BQU8sT0FBTyxNQUFNLFNBQVMsV0FBVyxNQUFNLE9BQU87QUFDM0QsTUFBSSxJQUFJLE1BQU0sSUFBSSxRQUFRLEdBQUc7QUFJM0IsYUFBUyxLQUFLLHFDQUFxQyxLQUFLLFVBQVUsTUFBTSxFQUFFLENBQUMsR0FBRztBQUFBLEVBQ2hGO0FBQ0EsTUFBSSxJQUFJLE1BQU0sTUFBTSxRQUFRLEdBQUc7QUFDN0IsYUFBUyxLQUFLLFNBQVMsTUFBTSxTQUFTLHdCQUF3QjtBQUFBLEVBQ2hFO0FBQ0EsTUFBSSxJQUFJLE1BQU0sVUFBVSxRQUFRLEdBQUc7QUFHakMsYUFBUyxLQUFLLFNBQVMsTUFBTSxTQUFTLDRCQUE0QjtBQUFBLEVBQ3BFO0FBQ0EsTUFBSSxDQUFDLEdBQUk7QUFNVCxNQUFJLE1BQU0sUUFBUSxNQUFNLFFBQVEsS0FBSyxNQUFNLFNBQVMsU0FBUyxHQUFHO0FBQzlELFFBQUksVUFBVSxLQUFLLEVBQUUsU0FBUyxJQUFJLFVBQVUsTUFBTSxTQUFzQixDQUFDO0FBQUEsRUFDM0U7QUFFQSxRQUFNLFNBQXFCLENBQUM7QUFDNUIsb0JBQWtCLE9BQU8sUUFBUSxxQkFBcUIsSUFBSSxRQUFRO0FBQ2xFLE1BQUksT0FBTyxTQUFTLEdBQUc7QUFDckIsUUFBSSxtQkFBbUIsS0FBSyxFQUFFLFNBQVMsSUFBSSxNQUFNLE9BQU8sQ0FBQztBQUFBLEVBQzNEO0FBRUEsVUFBUSxNQUFNO0FBQUEsSUFDWixLQUFLLG1CQUFtQjtBQUN0QixVQUFJLElBQUksTUFBTSxTQUFTLFFBQVEsR0FBRztBQUdoQyxpQkFBUyxLQUFLLFNBQVMsRUFBRSwyQkFBMkI7QUFBQSxNQUN0RDtBQUNBLFVBQUksTUFBTSxRQUFRLE1BQU0sT0FBTyxHQUFHO0FBQ2hDLG1CQUFXLEtBQUssTUFBTSxTQUFTO0FBQzdCLGNBQUksQ0FBQyxjQUFjLENBQUMsR0FBRztBQUNyQixxQkFBUyxLQUFLLFNBQVMsRUFBRSx3Q0FBd0M7QUFDakU7QUFBQSxVQUNGO0FBQ0EsZ0JBQU0sU0FBUztBQUNmLGNBQUksT0FBTyxPQUFPLE9BQU8sVUFBVTtBQUVqQyxxQkFBUyxLQUFLLFNBQVMsRUFBRSxnQ0FBZ0M7QUFBQSxVQUMzRDtBQUNBLGNBQUksSUFBSSxPQUFPLFNBQVMsU0FBUyxHQUFHO0FBRWxDLHFCQUFTLEtBQUssU0FBUyxFQUFFLGdEQUFnRDtBQUFBLFVBQzNFO0FBQ0EsY0FBSSxJQUFJLE9BQU8sVUFBVSxRQUFRLEdBQUc7QUFDbEMscUJBQVMsS0FBSyxTQUFTLEVBQUUsMkNBQTJDO0FBQUEsVUFDdEU7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUNBLFlBQU0sVUFBVSxNQUFNLFFBQVEsTUFBTSxPQUFPLElBQ3RDLE1BQU0sVUFDUCxDQUFDO0FBQ0wsVUFBSSxlQUFlLEtBQUs7QUFBQSxRQUN0QixTQUFTO0FBQUEsUUFDVCxZQUFZLFFBQ1QsT0FBTyxDQUFDLE1BQU0sRUFBRSxZQUFZLElBQUksRUFDaEMsSUFBSSxDQUFDLE1BQU0sT0FBTyxFQUFFLEVBQUUsQ0FBQztBQUFBLFFBQzFCLFNBQVMsUUFBUSxJQUFJLENBQUMsT0FBTztBQUFBLFVBQzNCLElBQUksT0FBTyxFQUFFLEVBQUU7QUFBQSxVQUNmLFNBQVMsRUFBRSxZQUFZO0FBQUEsVUFDdkIsR0FBSSxNQUFNLFFBQVEsRUFBRSxRQUFRLElBQ3hCLEVBQUUsVUFBVSxFQUFFLFNBQXNCLElBQ3BDLENBQUM7QUFBQSxVQUNMLEdBQUksT0FBTyxFQUFFLG9CQUFvQixZQUFZLEVBQUUsa0JBQzNDLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLElBQ3JDLENBQUM7QUFBQSxRQUNQLEVBQUU7QUFBQSxNQUNKLENBQUM7QUFDRDtBQUFBLElBQ0Y7QUFBQSxJQUNBLEtBQUssWUFBWTtBQUNmLFVBQUksSUFBSSxNQUFNLE9BQU8sUUFBUSxHQUFHO0FBQzlCLGlCQUFTLEtBQUssU0FBUyxFQUFFLHlCQUF5QjtBQUFBLE1BQ3BEO0FBQ0EsVUFBSSxJQUFJLE1BQU0sS0FBSyxhQUFhLEdBQUc7QUFHakMsaUJBQVMsS0FBSyxTQUFTLEVBQUUsd0JBQXdCO0FBQUEsTUFDbkQsV0FBVyxjQUFjLE1BQU0sR0FBRyxHQUFHO0FBQ25DLFlBQUksQ0FBQyxPQUFPLE9BQU8sTUFBTSxHQUFhLEVBQUUsTUFBTSxRQUFRLEdBQUc7QUFDdkQsbUJBQVMsS0FBSyxTQUFTLEVBQUUsK0JBQStCO0FBQUEsUUFDMUQ7QUFBQSxNQUNGO0FBQ0EsWUFBTSxRQUFRLE1BQU0sUUFBUSxNQUFNLEtBQUssSUFDbEMsTUFBTSxRQUNQLENBQUM7QUFDTCxtQkFBYSxPQUFPLElBQUksUUFBUTtBQUNoQyxVQUFJLFNBQVMsS0FBSztBQUFBLFFBQ2hCLFNBQVM7QUFBQSxRQUNULEtBQU0sTUFBTSxPQUFrQyxDQUFDO0FBQUEsUUFDL0MsU0FBUyxNQUFNLElBQUksQ0FBQyxNQUFNLE9BQU8sRUFBRSxFQUFFLENBQUM7QUFBQSxNQUN4QyxDQUFDO0FBQ0Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxLQUFLLFlBQVk7QUFDZixVQUFJLElBQUksTUFBTSxPQUFPLFFBQVEsR0FBRztBQUc5QixpQkFBUyxLQUFLLFNBQVMsRUFBRSx5QkFBeUI7QUFBQSxNQUNwRDtBQUNBLFlBQU0sUUFBUSxNQUFNLFFBQVEsTUFBTSxLQUFLLElBQ2xDLE1BQU0sUUFDUCxDQUFDO0FBQ0wsbUJBQWEsT0FBTyxJQUFJLFFBQVE7QUFHaEMsVUFBSSxTQUFTLEtBQUssRUFBRSxTQUFTLElBQUksZUFBZSxNQUFNLElBQUksQ0FBQyxNQUFNLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2hGO0FBQUEsSUFDRjtBQUFBLElBQ0EsS0FBSyxTQUFTO0FBV1osVUFBSSxJQUFJLE1BQU0sTUFBTSxRQUFRLEdBQUc7QUFDN0IsaUJBQVMsS0FBSyxTQUFTLEVBQUUsd0JBQXdCO0FBQUEsTUFDbkQ7QUFDQSxVQUFJLE1BQU0sUUFBUSxNQUFNLElBQUksR0FBRztBQUM3QixtQkFBVyxPQUFPLE1BQU0sTUFBTTtBQUM1QixjQUFJLENBQUMsY0FBYyxHQUFHLEdBQUc7QUFDdkIscUJBQVMsS0FBSyxTQUFTLEVBQUUsK0JBQStCO0FBQ3hEO0FBQUEsVUFDRjtBQUNBLGdCQUFNLFFBQVMsSUFBZ0M7QUFDL0MsY0FBSSxJQUFJLE9BQU8sUUFBUSxHQUFHO0FBQ3hCLHFCQUFTLEtBQUssU0FBUyxFQUFFLHFDQUFxQztBQUM5RDtBQUFBLFVBQ0Y7QUFDQSxxQkFBVyxRQUFRLE1BQU0sUUFBUSxLQUFLLElBQUksUUFBUSxDQUFDLEdBQUc7QUFDcEQsZ0JBQUksQ0FBQyxjQUFjLElBQUksR0FBRztBQUN4Qix1QkFBUyxLQUFLLFNBQVMsRUFBRSxnQ0FBZ0M7QUFDekQ7QUFBQSxZQUNGO0FBQ0EsZ0JBQUksSUFBSyxLQUFpQyxTQUFTLFFBQVEsR0FBRztBQUM1RCx1QkFBUyxLQUFLLFNBQVMsRUFBRSx3Q0FBd0M7QUFBQSxZQUNuRTtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUNBO0FBQUEsSUFDRjtBQUFBLElBRUE7QUFDRSxVQUFJLGdCQUFnQixJQUFJLElBQUksR0FBRztBQUM3QixZQUFJLFNBQVMsS0FBSyxFQUFFO0FBQUEsTUFDdEIsV0FBVyxZQUFZLElBQUksSUFBSSxHQUFHO0FBQ2hDLFlBQUksT0FBTyxLQUFLLEVBQUUsU0FBUyxJQUFJLE1BQXlDLENBQUM7QUFBQSxNQUMzRTtBQUNBO0FBQUEsRUFDSjtBQUVBLGFBQVcsU0FBUyxjQUFjLEtBQUssRUFBRyxPQUFNLE9BQU8sS0FBSyxRQUFRO0FBQ3RFO0FBbUNPLFNBQVMsaUJBQ2QsU0FDQSxVQUF1QixDQUFDLEdBQ0w7QUFDbkIsUUFBTSxNQUF5QjtBQUFBLElBQzdCLG9CQUFvQixDQUFDO0FBQUEsSUFDckIsZ0JBQWdCLENBQUM7QUFBQSxJQUNqQixVQUFVLENBQUM7QUFBQSxJQUNYLFVBQVUsQ0FBQztBQUFBLElBQ1gsUUFBUSxDQUFDO0FBQUEsSUFDVCxVQUFVLENBQUM7QUFBQSxJQUNYLFdBQVcsQ0FBQztBQUFBLEVBQ2Q7QUFDQSxRQUFNLFdBQXFCLENBQUM7QUFJNUIsUUFBTSxNQUFNO0FBQ1osTUFBSSxJQUFJLElBQUksTUFBTSxRQUFRLEdBQUc7QUFDM0IsYUFBUyxLQUFLLCtCQUErQjtBQUFBLEVBQy9DO0FBQ0EsYUFBVyxPQUFPLE1BQU0sUUFBUSxJQUFJLElBQUksSUFBSyxRQUFRLFFBQVEsQ0FBQyxJQUFLLENBQUMsR0FBRztBQUNyRSxRQUFJLENBQUMsY0FBYyxHQUFHLEdBQUc7QUFDdkIsZUFBUyxLQUFLLHNDQUFzQztBQUNwRDtBQUFBLElBQ0Y7QUFDQSxRQUFJLElBQUksSUFBSSxTQUFTLFFBQVEsR0FBRztBQUM5QixlQUFTLEtBQUssOENBQThDO0FBQUEsSUFDOUQ7QUFDQSxlQUFXLFVBQVUsTUFBTSxRQUFRLElBQUksT0FBTyxJQUFJLElBQUksVUFBVSxDQUFDLEdBQUc7QUFDbEUsVUFBSSxDQUFDLGNBQWMsTUFBTSxHQUFHO0FBQzFCLGlCQUFTLEtBQUsseUNBQXlDO0FBQ3ZEO0FBQUEsTUFDRjtBQUNBLFVBQUksSUFBSSxPQUFPLFFBQVEsUUFBUSxHQUFHO0FBQ2hDLGlCQUFTLEtBQUssZ0RBQWdEO0FBQUEsTUFDaEU7QUFDQSxpQkFBVyxTQUFTLE1BQU0sUUFBUSxPQUFPLE1BQU0sSUFBSSxPQUFPLFNBQVMsQ0FBQyxHQUFHO0FBQ3JFLFlBQUksQ0FBQyxjQUFjLEtBQUssR0FBRztBQUN6QixtQkFBUyxLQUFLLCtDQUErQztBQUM3RDtBQUFBLFFBQ0Y7QUFDQSxjQUFNLE9BQU8sS0FBSyxRQUFRO0FBQUEsTUFDNUI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLE1BQUksU0FBUyxTQUFTLEtBQUssUUFBUSxjQUFjLFVBQVU7QUFDekQsVUFBTSxJQUFJLHVCQUF1QixRQUFRO0FBQUEsRUFDM0M7QUFDQSxTQUFPO0FBQ1Q7OztBQ3BoQk8sSUFBTSxxQkFBcUI7QUF1QmxDLFNBQVMsY0FBYyxPQUFzQjtBQUMzQyxRQUFNLE9BQVEsTUFBNkI7QUFDM0MsTUFBSSxPQUFPLFNBQVMsWUFBWSxFQUFFLFFBQVEsZ0JBQWdCO0FBQ3hELFdBQU87QUFBQSxFQUNUO0FBQ0EsU0FBTyxZQUFZLEtBQUs7QUFDMUI7QUFPQSxTQUFTLFVBQVUsT0FBY0MsUUFBcUM7QUFDcEUsRUFBQUEsT0FBTSxLQUFLO0FBQ1gsYUFBVyxTQUFTLGNBQWMsS0FBMEIsR0FBRztBQUM3RCxjQUFVLE9BQTJCQSxNQUFLO0FBQUEsRUFDNUM7QUFDRjtBQU9BLFNBQVMsVUFBVSxLQUF1QkEsUUFBcUM7QUFDN0UsYUFBVyxXQUFXLElBQUksWUFBWSxDQUFDLEdBQUc7QUFDeEMsZUFBVyxPQUFPLFFBQVEsUUFBUSxDQUFDLEdBQUc7QUFDcEMsaUJBQVcsVUFBVSxJQUFJLFdBQVcsQ0FBQyxHQUFHO0FBQ3RDLG1CQUFXLFNBQVMsT0FBTyxVQUFVLENBQUMsRUFBRyxXQUFVLE9BQU9BLE1BQUs7QUFBQSxNQUNqRTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0EsYUFBVyxTQUFTLElBQUksZ0JBQWdCLFVBQVUsQ0FBQyxFQUFHLFdBQVUsT0FBT0EsTUFBSztBQUM5RTtBQVdPLFNBQVMsaUJBQWlCLEtBQXNDO0FBQ3JFLFFBQU0sU0FBUyxvQkFBSSxJQUFvQjtBQUN2QyxRQUFNLGVBQWUsb0JBQUksSUFBb0I7QUFFN0MsWUFBVSxLQUFLLENBQUMsVUFBVTtBQUN4QixVQUFNLE1BQU0sY0FBYyxLQUFLO0FBQy9CLFdBQU8sSUFBSSxNQUFNLE9BQU8sSUFBSSxHQUFHLEtBQUssS0FBSyxDQUFDO0FBQzFDLFVBQU0sS0FBTSxNQUEyQjtBQUN2QyxRQUFJLE9BQU8sT0FBTyxTQUFVLGNBQWEsSUFBSSxJQUFJLEdBQUc7QUFBQSxFQUN0RCxDQUFDO0FBRUQsUUFBTSxRQUFzQixDQUFDO0FBQzdCLFFBQU0sT0FBTyxvQkFBSSxJQUFZO0FBQzdCLFFBQU0sT0FBTyxDQUFDLFFBQWdCLFlBQTBCO0FBQ3RELFFBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxNQUFNLEVBQUc7QUFDakMsU0FBSyxJQUFJLE1BQU07QUFDZixVQUFNLEtBQUs7QUFBQSxNQUNUO0FBQUEsTUFDQSxXQUFXLGFBQWEsSUFBSSxPQUFPLEtBQUs7QUFBQSxJQUMxQyxDQUFDO0FBQUEsRUFDSDtBQUVBLGFBQVcsV0FBVyxJQUFJLFlBQVksQ0FBQyxHQUFHO0FBTXhDLFVBQU0sTUFBTSxpQkFBaUIsU0FBa0M7QUFBQSxNQUM3RCxXQUFXO0FBQUEsSUFDYixDQUFDO0FBSUQsZUFBVyxTQUFTLElBQUksb0JBQW9CO0FBQzFDLGlCQUFXLE9BQU8sTUFBTSxLQUFNLE1BQUssSUFBSSxJQUFJLE1BQU0sT0FBTztBQUFBLElBQzFEO0FBQ0EsZUFBVyxNQUFNLElBQUksZUFBZ0IsTUFBSyxHQUFHLFNBQVMsR0FBRyxPQUFPO0FBQ2hFLGVBQVcsS0FBSyxJQUFJLFNBQVUsTUFBSyxFQUFFLFNBQVMsRUFBRSxPQUFPO0FBQ3ZELGVBQVcsS0FBSyxJQUFJLFNBQVUsTUFBSyxFQUFFLFNBQVMsRUFBRSxPQUFPO0FBQ3ZELGVBQVcsS0FBSyxJQUFJLE9BQVEsTUFBSyxFQUFFLFNBQVMsRUFBRSxPQUFPO0FBQ3JELGVBQVcsTUFBTSxJQUFJLFNBQVUsTUFBSyxJQUFJLEVBQUU7QUFBQSxFQUM1QztBQUVBLFNBQU87QUFBQSxJQUNMLFFBQVEsQ0FBQyxHQUFHLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxXQUFXLFVBQVUsT0FBTztBQUFBLE1BQ3BEO0FBQUEsTUFDQTtBQUFBLElBQ0YsRUFBRTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7OztBQzlKTyxTQUFTLFVBQVUsV0FBbUIsV0FBMkI7QUFDdEUsU0FBTyxHQUFHLFNBQVMsSUFBSSxTQUFTO0FBQ2xDOzs7QUNUTyxTQUFTLE9BQU8sWUFBbUM7QUFDeEQsUUFBTSxRQUFRLFdBQVcsUUFBUSxlQUFlLEVBQUU7QUFDbEQsUUFBTSxVQUFVLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNsQyxNQUFJLENBQUMsUUFBUyxRQUFPO0FBQ3JCLE1BQUk7QUFDRixVQUFNLE9BQU8sS0FBSztBQUFBLE1BQ2hCLEtBQUssUUFBUSxRQUFRLE1BQU0sR0FBRyxFQUFFLFFBQVEsTUFBTSxHQUFHLENBQUM7QUFBQSxJQUNwRDtBQUNBLFdBQU8sT0FBTyxLQUFLLFFBQVEsV0FBVyxLQUFLLE1BQU07QUFBQSxFQUNuRCxRQUFRO0FBQ04sV0FBTztBQUFBLEVBQ1Q7QUFDRjs7O0FDTk8sSUFBTSxVQUNYOzs7QUMwRUssSUFBTSxjQUFjO0FBd0lwQixJQUFNLGVBQWU7QUFFckIsSUFBTSxpQkFBaUI7QUFHdkIsSUFBTSxzQkFBc0I7QUFFNUIsU0FBUyxzQkFDZCxNQUFvQixLQUFLLEtBQ0E7QUFDekIsUUFBTSxXQUFXLG9CQUFJLElBQXNCO0FBQzNDLFNBQU8sU0FBUyxnQkFBZ0IsSUFBcUI7QUFDbkQsVUFBTSxJQUFJLElBQUk7QUFDZCxVQUFNLFFBQVEsU0FBUyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUc7QUFBQSxNQUNwQyxDQUFDLFFBQVEsSUFBSSxNQUFNO0FBQUEsSUFDckI7QUFDQSxRQUFJLEtBQUssVUFBVSxxQkFBcUI7QUFDdEMsZUFBUyxJQUFJLElBQUksSUFBSTtBQUNyQixhQUFPO0FBQUEsSUFDVDtBQUNBLFNBQUssS0FBSyxDQUFDO0FBQ1gsYUFBUyxJQUFJLElBQUksSUFBSTtBQUVyQixRQUFJLFNBQVMsT0FBTyxJQUFRLFVBQVMsTUFBTTtBQUMzQyxXQUFPO0FBQUEsRUFDVDtBQUNGO0FBT08sU0FBUyx5QkFDZCxNQUNxQztBQUNyQyxRQUFNLEVBQUUsSUFBSSxLQUFLLElBQUk7QUFDckIsUUFBTSxrQkFBa0Isc0JBQXNCLEtBQUssT0FBTyxLQUFLLEdBQUc7QUFFbEUsU0FBTyxlQUFlLGtCQUFrQixLQUFpQztBQUN2RSxVQUFNLFlBQVksS0FBSyxnQkFBZ0IsR0FBRztBQUMxQyxRQUFJLFVBQVcsUUFBTztBQUN0QixRQUFJLElBQUksV0FBVyxPQUFPO0FBQ3hCLGFBQU8sS0FBSyxjQUFjLEtBQUssS0FBSyxvQkFBb0I7QUFBQSxJQUMxRDtBQUVBLFVBQU0sTUFBTSxJQUFJLElBQUksSUFBSSxHQUFHO0FBQzNCLFVBQU0sYUFBYSxJQUFJLGFBQWEsSUFBSSxhQUFhLEtBQUs7QUFDMUQsVUFBTSxZQUFZLElBQUksYUFBYSxJQUFJLFlBQVk7QUFDbkQsVUFBTSxXQUFXLElBQUksYUFBYSxJQUFJLE1BQU0sTUFBTTtBQUNsRCxVQUFNLFdBQVcsSUFBSSxhQUFhLElBQUksV0FBVztBQU1qRCxRQUFJLGFBQWEsTUFBTTtBQUNyQixVQUFJLENBQUMsVUFBVTtBQUNiLGVBQU8sS0FBSyxjQUFjLEtBQUssS0FBSywyQkFBMkI7QUFBQSxNQUNqRTtBQUNBLFlBQU0sT0FBTyxTQUFTLEtBQUs7QUFDM0IsVUFBSSxDQUFDLGFBQWEsS0FBSyxJQUFJLEdBQUc7QUFDNUIsZUFBTyxLQUFLLGNBQWMsS0FBSyxLQUFLLGdDQUFnQztBQUFBLE1BQ3RFO0FBQ0EsWUFBTSxLQUNKLElBQUksUUFBUSxJQUFJLGlCQUFpQixHQUFHLE1BQU0sR0FBRyxFQUFFLENBQUMsR0FBRyxLQUFLLEtBQUs7QUFHL0QsVUFBSSxnQkFBZ0IsRUFBRSxHQUFHO0FBQ3ZCLGVBQU8sS0FBSyxjQUFjLEtBQUssS0FBSyxtQkFBbUI7QUFBQSxNQUN6RDtBQUNBLFlBQU0sRUFBRSxNQUFNLE1BQU0sSUFBSSxNQUFNLEdBQUcsVUFBVSxJQUFJO0FBQy9DLFVBQUksT0FBTztBQUNULGdCQUFRLE1BQU0sd0NBQXdDLEtBQUs7QUFDM0QsZUFBTyxLQUFLLGNBQWMsS0FBSyxLQUFLLGVBQWU7QUFBQSxNQUNyRDtBQUdBLFVBQUksQ0FBQyxLQUFNLFFBQU8sS0FBSyxjQUFjLEtBQUssS0FBSyxlQUFlO0FBQzlELGFBQU8sS0FBSztBQUFBLFFBQ1Y7QUFBQTtBQUFBLFFBRUEsRUFBRSxhQUFhLGFBQWEsWUFBWSxLQUFLLEtBQUs7QUFBQSxRQUNsRCxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsV0FBVyxFQUFFO0FBQUEsTUFDN0M7QUFBQSxJQUNGO0FBRUEsUUFBSSxDQUFDLFFBQVEsS0FBSyxVQUFVLEdBQUc7QUFDN0IsYUFBTyxLQUFLLGNBQWMsS0FBSyxLQUFLLDRCQUE0QjtBQUFBLElBQ2xFO0FBR0EsUUFBSSxVQUFVO0FBQ1osWUFBTSxLQUNKLElBQUksUUFBUSxJQUFJLGlCQUFpQixHQUFHLE1BQU0sR0FBRyxFQUFFLENBQUMsR0FBRyxLQUFLLEtBQUs7QUFDL0QsVUFBSSxnQkFBZ0IsRUFBRSxHQUFHO0FBQ3ZCLGVBQU8sS0FBSyxjQUFjLEtBQUssS0FBSyxtQkFBbUI7QUFBQSxNQUN6RDtBQUNBLFlBQU0sRUFBRSxNQUFNLE1BQU0sSUFBSSxNQUFNLEdBQUcsV0FBVyxVQUFVO0FBQ3RELFVBQUksT0FBTztBQUNULGdCQUFRLE1BQU0sa0NBQWtDLEtBQUs7QUFDckQsZUFBTyxLQUFLLGNBQWMsS0FBSyxLQUFLLGVBQWU7QUFBQSxNQUNyRDtBQUNBLFVBQUksQ0FBQyxLQUFNLFFBQU8sS0FBSyxjQUFjLEtBQUssS0FBSyxlQUFlO0FBQzlELGFBQU8sS0FBSztBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxhQUFhO0FBQUEsVUFDYixPQUFPLEtBQUs7QUFBQSxVQUNaLGNBQWMsS0FBSztBQUFBLFFBQ3JCO0FBQUEsUUFDQSxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsV0FBVyxFQUFFO0FBQUEsTUFDN0M7QUFBQSxJQUNGO0FBR0EsVUFBTSxhQUFhLElBQUksUUFBUSxJQUFJLGVBQWU7QUFDbEQsUUFBSSxDQUFDLFlBQVk7QUFDZixhQUFPLEtBQUssY0FBYyxLQUFLLEtBQUssOEJBQThCO0FBQUEsSUFDcEU7QUFFQSxVQUFNLEVBQUUsTUFBTSxTQUFTLE9BQU8sU0FBUyxJQUFJLE1BQU0sR0FBRztBQUFBLE1BQ2xEO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFDQSxRQUFJLFVBQVU7QUFDWixZQUFNLE1BQU0sU0FBUyxXQUFXO0FBR2hDLFlBQU0sU0FBUyxJQUFJLFNBQVMsZUFBZSxJQUN2QyxNQUNBLGtCQUFrQixLQUFLLEdBQUcsSUFDeEIsTUFDQTtBQUNOLFVBQUksV0FBVyxJQUFLLFNBQVEsTUFBTSw2QkFBNkIsUUFBUTtBQUN2RSxhQUFPLEtBQUs7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFFBQ0EsV0FBVyxNQUFNLGtCQUFrQjtBQUFBLE1BQ3JDO0FBQUEsSUFDRjtBQUNBLFFBQUksQ0FBQyxRQUFTLFFBQU8sS0FBSyxjQUFjLEtBQUssS0FBSyxlQUFlO0FBQ2pFLFVBQU0sTUFBTTtBQUdaLFFBQUksQ0FBQyxXQUFXO0FBQ2QsYUFBTyxLQUFLO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLGFBQWE7QUFBQSxVQUNiLGFBQWE7QUFBQSxVQUNiLFlBQVksSUFBSTtBQUFBLFVBQ2hCLGFBQWEsSUFBSTtBQUFBLFVBQ2pCLE9BQU8sSUFBSTtBQUFBLFFBQ2I7QUFBQSxRQUNBLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixXQUFXLEVBQUU7QUFBQSxNQUM3QztBQUFBLElBQ0Y7QUFHQSxRQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsR0FBRztBQUM1QixhQUFPLEtBQUssY0FBYyxLQUFLLEtBQUssMkJBQTJCO0FBQUEsSUFDakU7QUFDQSxRQUFJLGNBQWMsSUFBSSxZQUFZO0FBR2hDLGFBQU8sS0FBSyxjQUFjLEtBQUssS0FBSywyQkFBMkI7QUFBQSxRQUM3RCxNQUFNO0FBQUEsUUFDTixvQkFBb0IsSUFBSTtBQUFBLE1BQzFCLENBQUM7QUFBQSxJQUNIO0FBR0EsUUFBSSxZQUE4QztBQUNsRCxVQUFNLEVBQUUsTUFBTSxRQUFRLE9BQU8sU0FBUyxJQUFJLE1BQU0sR0FBRztBQUFBLE1BQ2pEO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFDQSxRQUFJLFVBQVU7QUFFWixjQUFRLE1BQU0scUNBQXFDLFFBQVE7QUFBQSxJQUM3RDtBQUNBLFFBQUksUUFBUTtBQUNWLGtCQUFZLE9BQU87QUFBQSxJQUNyQjtBQUVBLFFBQUksQ0FBQyxXQUFXO0FBQ2QsWUFBTSxFQUFFLE1BQU0sU0FBUyxPQUFPLEtBQUssSUFBSSxNQUFNLEdBQUcsWUFBWSxTQUFTO0FBQ3JFLFVBQUksUUFBUSxDQUFDLFNBQVM7QUFDcEIsZ0JBQVEsTUFBTSx1Q0FBdUMsSUFBSTtBQUN6RCxlQUFPLEtBQUssY0FBYyxLQUFLLEtBQUsscUJBQXFCO0FBQUEsTUFDM0Q7QUFDQSxVQUFJO0FBQ0osVUFBSTtBQUNGLG1CQUFXLHdCQUF3QixRQUFRLE9BQU87QUFBQSxNQUNwRCxTQUFTLEtBQUs7QUFHWixnQkFBUSxNQUFNLGtDQUFrQyxHQUFHO0FBQ25ELGNBQU0sU0FDSixlQUFlLGVBQWUsSUFBSSxVQUFVO0FBQzlDLGVBQU8sS0FBSyxjQUFjLEtBQUssS0FBSyxxQ0FBcUM7QUFBQSxVQUN2RSxNQUFNO0FBQUEsVUFDTjtBQUFBLFFBQ0YsQ0FBQztBQUFBLE1BQ0g7QUFDQSxrQkFBWSx5QkFBeUIsU0FBUyxHQUFHO0FBaUJqRCxVQUFJLFdBQVc7QUFDZixVQUFJO0FBQ0YsY0FBTSxFQUFFLE9BQU8sVUFBVSxJQUFJLE1BQU0sR0FBRztBQUFBLFVBQ3BDO0FBQUEsVUFDQSxpQkFBaUIsU0FBUyxHQUFHO0FBQUEsUUFDL0I7QUFDQSxZQUFJLFdBQVc7QUFDYixxQkFBVztBQUNYLGtCQUFRLE1BQU0sdUNBQXVDLFNBQVM7QUFBQSxRQUNoRTtBQUFBLE1BQ0YsU0FBUyxLQUFLO0FBQ1osbUJBQVc7QUFDWCxnQkFBUSxNQUFNLGdDQUFnQyxHQUFHO0FBQUEsTUFDbkQ7QUFFQSxVQUFJLFVBQVU7QUFDWixjQUFNLEVBQUUsT0FBTyxVQUFVLElBQUksTUFBTSxHQUFHLFlBQVk7QUFBQSxVQUNoRCxZQUFZO0FBQUEsVUFDWixlQUFlO0FBQUEsVUFDZixnQkFBZ0IsU0FBUyxJQUFJO0FBQUEsVUFDN0IsU0FBUztBQUFBLFFBQ1gsQ0FBQztBQUNELFlBQUksV0FBVztBQUdiLGtCQUFRLE1BQU0sdUNBQXVDLFNBQVM7QUFBQSxRQUNoRSxPQUFPO0FBR0wsZ0JBQU0sRUFBRSxPQUFPLE1BQU0sSUFBSSxNQUFNLEdBQUc7QUFBQSxZQUNoQztBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQ0EsY0FBSSxPQUFPO0FBQ1Qsb0JBQVEsTUFBTSx5Q0FBeUMsS0FBSztBQUFBLFVBQzlEO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsVUFBTSxTQUFTLE9BQU8sVUFBVSxLQUFLO0FBSXJDLFVBQU0sU0FBUyxtQkFBbUIsV0FBVyxVQUFVLFdBQVcsTUFBTSxDQUFDO0FBRXpFLFdBQU8sSUFBSTtBQUFBLE1BQ1QsS0FBSyxVQUFVO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixTQUFTO0FBQUEsVUFDUCxJQUFJO0FBQUEsVUFDSixLQUFLLElBQUk7QUFBQSxVQUNULGdCQUFnQixPQUFPO0FBQUEsUUFDekI7QUFBQSxRQUNBLE9BQU8sSUFBSTtBQUFBLFFBQ1gsVUFBVTtBQUFBLE1BQ1osQ0FBQztBQUFBLE1BQ0Q7QUFBQSxRQUNFLFFBQVE7QUFBQSxRQUNSLFNBQVM7QUFBQSxVQUNQLEdBQUcsS0FBSyxZQUFZLEdBQUc7QUFBQSxVQUN2QixnQkFBZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUloQixpQkFBaUI7QUFBQSxRQUNuQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgIm9iamVjdFV0aWwiLCAiZXJyb3JVdGlsIiwgImVycm9yTWFwIiwgImN0eCIsICJyZXN1bHQiLCAiaXNzdWVzIiwgImVsZW1lbnRzIiwgInByb2Nlc3NlZCIsICJyZXN1bHQiLCAiciIsICJab2RGaXJzdFBhcnR5VHlwZUtpbmQiLCAidmlzaXQiXQp9Cg==
