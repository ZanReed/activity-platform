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
        "partialCredit",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvZXh0ZXJuYWwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvaGVscGVycy91dGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL1pvZEVycm9yLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2xvY2FsZXMvZW4uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvZXJyb3JzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2hlbHBlcnMvcGFyc2VVdGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2hlbHBlcnMvZXJyb3JVdGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL3R5cGVzLmpzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvc2l6aW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2ltYWdlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvZ3JhcGgtcHJpbWl0aXZlcy50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9ncmFwaC1maWd1cmUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9pbmxpbmUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvcGFyYWdyYXBoLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2hlYWRpbmcudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9sYWJlbC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9tYXRoLWJsb2NrLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2NhbGxvdXQudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvcHJvYmxlbS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9maWxsLWluLWJsYW5rLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2xpc3QudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvaW50ZXJhY3RpdmUtZ3JhcGgudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvbXVsdGlwbGUtY2hvaWNlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL21hdGNoaW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL29yZGVyaW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL251bWJlci1saW5lLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2RhdGEtcGxvdC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9sZWFybmluZy1vYmplY3RpdmVzLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL3dvcmtlZC1leGFtcGxlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2ZhZGVkLXdvcmtlZC1leGFtcGxlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL3NlbGYtZXhwbGFuYXRpb24udHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvZnJlZS1yZXNwb25zZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy90YWJsZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9pbmRleC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2xheW91dC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2RvY3VtZW50LnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvdXBncmFkZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3JlZ2lzdHJ5L3JlZ2lzdHJ5LnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2FuaXRpemUvcHJvbXB0Q2FycmllcnMudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9zYW5pdGl6ZS9zYW5pdGl6ZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3Nhbml0aXplL3NodWZmbGUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9jb250YWluZXIvYmxvY2tJbmRleC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3NlcnZlci9ncmFkaW5nL3dhbGsudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9jZW5zdXMvY2Vuc3VzLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2FuaXRpemUvc2VydmVTZWVkLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2VydmVyL2p3dC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3NlcnZlci91dWlkLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2VydmVyL2dldC1hY3Rpdml0eS1oYW5kbGVyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgKiBmcm9tIFwiLi9lcnJvcnMuanNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2hlbHBlcnMvcGFyc2VVdGlsLmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9oZWxwZXJzL3R5cGVBbGlhc2VzLmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9oZWxwZXJzL3V0aWwuanNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3R5cGVzLmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9ab2RFcnJvci5qc1wiO1xuIiwgImV4cG9ydCB2YXIgdXRpbDtcbihmdW5jdGlvbiAodXRpbCkge1xuICAgIHV0aWwuYXNzZXJ0RXF1YWwgPSAoXykgPT4geyB9O1xuICAgIGZ1bmN0aW9uIGFzc2VydElzKF9hcmcpIHsgfVxuICAgIHV0aWwuYXNzZXJ0SXMgPSBhc3NlcnRJcztcbiAgICBmdW5jdGlvbiBhc3NlcnROZXZlcihfeCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB9XG4gICAgdXRpbC5hc3NlcnROZXZlciA9IGFzc2VydE5ldmVyO1xuICAgIHV0aWwuYXJyYXlUb0VudW0gPSAoaXRlbXMpID0+IHtcbiAgICAgICAgY29uc3Qgb2JqID0ge307XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xuICAgICAgICAgICAgb2JqW2l0ZW1dID0gaXRlbTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH07XG4gICAgdXRpbC5nZXRWYWxpZEVudW1WYWx1ZXMgPSAob2JqKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbGlkS2V5cyA9IHV0aWwub2JqZWN0S2V5cyhvYmopLmZpbHRlcigoaykgPT4gdHlwZW9mIG9ialtvYmpba11dICE9PSBcIm51bWJlclwiKTtcbiAgICAgICAgY29uc3QgZmlsdGVyZWQgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIHZhbGlkS2V5cykge1xuICAgICAgICAgICAgZmlsdGVyZWRba10gPSBvYmpba107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHV0aWwub2JqZWN0VmFsdWVzKGZpbHRlcmVkKTtcbiAgICB9O1xuICAgIHV0aWwub2JqZWN0VmFsdWVzID0gKG9iaikgPT4ge1xuICAgICAgICByZXR1cm4gdXRpbC5vYmplY3RLZXlzKG9iaikubWFwKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqW2VdO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHV0aWwub2JqZWN0S2V5cyA9IHR5cGVvZiBPYmplY3Qua2V5cyA9PT0gXCJmdW5jdGlvblwiIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFuL2JhblxuICAgICAgICA/IChvYmopID0+IE9iamVjdC5rZXlzKG9iaikgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYW4vYmFuXG4gICAgICAgIDogKG9iamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qga2V5cyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgICAgIH07XG4gICAgdXRpbC5maW5kID0gKGFyciwgY2hlY2tlcikgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgYXJyKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2tlcihpdGVtKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG4gICAgdXRpbC5pc0ludGVnZXIgPSB0eXBlb2YgTnVtYmVyLmlzSW50ZWdlciA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgID8gKHZhbCkgPT4gTnVtYmVyLmlzSW50ZWdlcih2YWwpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFuL2JhblxuICAgICAgICA6ICh2YWwpID0+IHR5cGVvZiB2YWwgPT09IFwibnVtYmVyXCIgJiYgTnVtYmVyLmlzRmluaXRlKHZhbCkgJiYgTWF0aC5mbG9vcih2YWwpID09PSB2YWw7XG4gICAgZnVuY3Rpb24gam9pblZhbHVlcyhhcnJheSwgc2VwYXJhdG9yID0gXCIgfCBcIikge1xuICAgICAgICByZXR1cm4gYXJyYXkubWFwKCh2YWwpID0+ICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiID8gYCcke3ZhbH0nYCA6IHZhbCkpLmpvaW4oc2VwYXJhdG9yKTtcbiAgICB9XG4gICAgdXRpbC5qb2luVmFsdWVzID0gam9pblZhbHVlcztcbiAgICB1dGlsLmpzb25TdHJpbmdpZnlSZXBsYWNlciA9IChfLCB2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJpZ2ludFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbn0pKHV0aWwgfHwgKHV0aWwgPSB7fSkpO1xuZXhwb3J0IHZhciBvYmplY3RVdGlsO1xuKGZ1bmN0aW9uIChvYmplY3RVdGlsKSB7XG4gICAgb2JqZWN0VXRpbC5tZXJnZVNoYXBlcyA9IChmaXJzdCwgc2Vjb25kKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5maXJzdCxcbiAgICAgICAgICAgIC4uLnNlY29uZCwgLy8gc2Vjb25kIG92ZXJ3cml0ZXMgZmlyc3RcbiAgICAgICAgfTtcbiAgICB9O1xufSkob2JqZWN0VXRpbCB8fCAob2JqZWN0VXRpbCA9IHt9KSk7XG5leHBvcnQgY29uc3QgWm9kUGFyc2VkVHlwZSA9IHV0aWwuYXJyYXlUb0VudW0oW1xuICAgIFwic3RyaW5nXCIsXG4gICAgXCJuYW5cIixcbiAgICBcIm51bWJlclwiLFxuICAgIFwiaW50ZWdlclwiLFxuICAgIFwiZmxvYXRcIixcbiAgICBcImJvb2xlYW5cIixcbiAgICBcImRhdGVcIixcbiAgICBcImJpZ2ludFwiLFxuICAgIFwic3ltYm9sXCIsXG4gICAgXCJmdW5jdGlvblwiLFxuICAgIFwidW5kZWZpbmVkXCIsXG4gICAgXCJudWxsXCIsXG4gICAgXCJhcnJheVwiLFxuICAgIFwib2JqZWN0XCIsXG4gICAgXCJ1bmtub3duXCIsXG4gICAgXCJwcm9taXNlXCIsXG4gICAgXCJ2b2lkXCIsXG4gICAgXCJuZXZlclwiLFxuICAgIFwibWFwXCIsXG4gICAgXCJzZXRcIixcbl0pO1xuZXhwb3J0IGNvbnN0IGdldFBhcnNlZFR5cGUgPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IHQgPSB0eXBlb2YgZGF0YTtcbiAgICBzd2l0Y2ggKHQpIHtcbiAgICAgICAgY2FzZSBcInVuZGVmaW5lZFwiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkO1xuICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5zdHJpbmc7XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIuaXNOYU4oZGF0YSkgPyBab2RQYXJzZWRUeXBlLm5hbiA6IFpvZFBhcnNlZFR5cGUubnVtYmVyO1xuICAgICAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuYm9vbGVhbjtcbiAgICAgICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5mdW5jdGlvbjtcbiAgICAgICAgY2FzZSBcImJpZ2ludFwiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuYmlnaW50O1xuICAgICAgICBjYXNlIFwic3ltYm9sXCI6XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5zeW1ib2w7XG4gICAgICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuYXJyYXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLm51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YS50aGVuICYmIHR5cGVvZiBkYXRhLnRoZW4gPT09IFwiZnVuY3Rpb25cIiAmJiBkYXRhLmNhdGNoICYmIHR5cGVvZiBkYXRhLmNhdGNoID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5wcm9taXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBNYXAgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLm1hcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgU2V0ICE9PSBcInVuZGVmaW5lZFwiICYmIGRhdGEgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5zZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIERhdGUgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5kYXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUub2JqZWN0O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUudW5rbm93bjtcbiAgICB9XG59O1xuIiwgImltcG9ydCB7IHV0aWwgfSBmcm9tIFwiLi9oZWxwZXJzL3V0aWwuanNcIjtcbmV4cG9ydCBjb25zdCBab2RJc3N1ZUNvZGUgPSB1dGlsLmFycmF5VG9FbnVtKFtcbiAgICBcImludmFsaWRfdHlwZVwiLFxuICAgIFwiaW52YWxpZF9saXRlcmFsXCIsXG4gICAgXCJjdXN0b21cIixcbiAgICBcImludmFsaWRfdW5pb25cIixcbiAgICBcImludmFsaWRfdW5pb25fZGlzY3JpbWluYXRvclwiLFxuICAgIFwiaW52YWxpZF9lbnVtX3ZhbHVlXCIsXG4gICAgXCJ1bnJlY29nbml6ZWRfa2V5c1wiLFxuICAgIFwiaW52YWxpZF9hcmd1bWVudHNcIixcbiAgICBcImludmFsaWRfcmV0dXJuX3R5cGVcIixcbiAgICBcImludmFsaWRfZGF0ZVwiLFxuICAgIFwiaW52YWxpZF9zdHJpbmdcIixcbiAgICBcInRvb19zbWFsbFwiLFxuICAgIFwidG9vX2JpZ1wiLFxuICAgIFwiaW52YWxpZF9pbnRlcnNlY3Rpb25fdHlwZXNcIixcbiAgICBcIm5vdF9tdWx0aXBsZV9vZlwiLFxuICAgIFwibm90X2Zpbml0ZVwiLFxuXSk7XG5leHBvcnQgY29uc3QgcXVvdGVsZXNzSnNvbiA9IChvYmopID0+IHtcbiAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkob2JqLCBudWxsLCAyKTtcbiAgICByZXR1cm4ganNvbi5yZXBsYWNlKC9cIihbXlwiXSspXCI6L2csIFwiJDE6XCIpO1xufTtcbmV4cG9ydCBjbGFzcyBab2RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBnZXQgZXJyb3JzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc3N1ZXM7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGlzc3Vlcykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmlzc3VlcyA9IFtdO1xuICAgICAgICB0aGlzLmFkZElzc3VlID0gKHN1YikgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc3N1ZXMgPSBbLi4udGhpcy5pc3N1ZXMsIHN1Yl07XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkSXNzdWVzID0gKHN1YnMgPSBbXSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc3N1ZXMgPSBbLi4udGhpcy5pc3N1ZXMsIC4uLnN1YnNdO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBhY3R1YWxQcm90byA9IG5ldy50YXJnZXQucHJvdG90eXBlO1xuICAgICAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgYmFuL2JhblxuICAgICAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIGFjdHVhbFByb3RvKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX19wcm90b19fID0gYWN0dWFsUHJvdG87XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5uYW1lID0gXCJab2RFcnJvclwiO1xuICAgICAgICB0aGlzLmlzc3VlcyA9IGlzc3VlcztcbiAgICB9XG4gICAgZm9ybWF0KF9tYXBwZXIpIHtcbiAgICAgICAgY29uc3QgbWFwcGVyID0gX21hcHBlciB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGlzc3VlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzc3VlLm1lc3NhZ2U7XG4gICAgICAgICAgICB9O1xuICAgICAgICBjb25zdCBmaWVsZEVycm9ycyA9IHsgX2Vycm9yczogW10gfTtcbiAgICAgICAgY29uc3QgcHJvY2Vzc0Vycm9yID0gKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGlzc3VlIG9mIGVycm9yLmlzc3Vlcykge1xuICAgICAgICAgICAgICAgIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfdW5pb25cIikge1xuICAgICAgICAgICAgICAgICAgICBpc3N1ZS51bmlvbkVycm9ycy5tYXAocHJvY2Vzc0Vycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUuY29kZSA9PT0gXCJpbnZhbGlkX3JldHVybl90eXBlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0Vycm9yKGlzc3VlLnJldHVyblR5cGVFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLmNvZGUgPT09IFwiaW52YWxpZF9hcmd1bWVudHNcIikge1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzRXJyb3IoaXNzdWUuYXJndW1lbnRzRXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS5wYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBmaWVsZEVycm9ycy5fZXJyb3JzLnB1c2gobWFwcGVyKGlzc3VlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VyciA9IGZpZWxkRXJyb3JzO1xuICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgaXNzdWUucGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gaXNzdWUucGF0aFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRlcm1pbmFsID0gaSA9PT0gaXNzdWUucGF0aC5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0ZXJtaW5hbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJbZWxdID0gY3VycltlbF0gfHwgeyBfZXJyb3JzOiBbXSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmICh0eXBlb2YgZWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGN1cnJbZWxdID0gY3VycltlbF0gfHwgeyBfZXJyb3JzOiBbXSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIH0gZWxzZSBpZiAodHlwZW9mIGVsID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBjb25zdCBlcnJvckFycmF5OiBhbnkgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGVycm9yQXJyYXkuX2Vycm9ycyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgY3VycltlbF0gPSBjdXJyW2VsXSB8fCBlcnJvckFycmF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJbZWxdID0gY3VycltlbF0gfHwgeyBfZXJyb3JzOiBbXSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJbZWxdLl9lcnJvcnMucHVzaChtYXBwZXIoaXNzdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnIgPSBjdXJyW2VsXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcHJvY2Vzc0Vycm9yKHRoaXMpO1xuICAgICAgICByZXR1cm4gZmllbGRFcnJvcnM7XG4gICAgfVxuICAgIHN0YXRpYyBhc3NlcnQodmFsdWUpIHtcbiAgICAgICAgaWYgKCEodmFsdWUgaW5zdGFuY2VvZiBab2RFcnJvcikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IGEgWm9kRXJyb3I6ICR7dmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lc3NhZ2U7XG4gICAgfVxuICAgIGdldCBtZXNzYWdlKCkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5pc3N1ZXMsIHV0aWwuanNvblN0cmluZ2lmeVJlcGxhY2VyLCAyKTtcbiAgICB9XG4gICAgZ2V0IGlzRW1wdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzc3Vlcy5sZW5ndGggPT09IDA7XG4gICAgfVxuICAgIGZsYXR0ZW4obWFwcGVyID0gKGlzc3VlKSA9PiBpc3N1ZS5tZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IGZpZWxkRXJyb3JzID0ge307XG4gICAgICAgIGNvbnN0IGZvcm1FcnJvcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBzdWIgb2YgdGhpcy5pc3N1ZXMpIHtcbiAgICAgICAgICAgIGlmIChzdWIucGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlyc3RFbCA9IHN1Yi5wYXRoWzBdO1xuICAgICAgICAgICAgICAgIGZpZWxkRXJyb3JzW2ZpcnN0RWxdID0gZmllbGRFcnJvcnNbZmlyc3RFbF0gfHwgW107XG4gICAgICAgICAgICAgICAgZmllbGRFcnJvcnNbZmlyc3RFbF0ucHVzaChtYXBwZXIoc3ViKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3JtRXJyb3JzLnB1c2gobWFwcGVyKHN1YikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IGZvcm1FcnJvcnMsIGZpZWxkRXJyb3JzIH07XG4gICAgfVxuICAgIGdldCBmb3JtRXJyb3JzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mbGF0dGVuKCk7XG4gICAgfVxufVxuWm9kRXJyb3IuY3JlYXRlID0gKGlzc3VlcykgPT4ge1xuICAgIGNvbnN0IGVycm9yID0gbmV3IFpvZEVycm9yKGlzc3Vlcyk7XG4gICAgcmV0dXJuIGVycm9yO1xufTtcbiIsICJpbXBvcnQgeyBab2RJc3N1ZUNvZGUgfSBmcm9tIFwiLi4vWm9kRXJyb3IuanNcIjtcbmltcG9ydCB7IHV0aWwsIFpvZFBhcnNlZFR5cGUgfSBmcm9tIFwiLi4vaGVscGVycy91dGlsLmpzXCI7XG5jb25zdCBlcnJvck1hcCA9IChpc3N1ZSwgX2N0eCkgPT4ge1xuICAgIGxldCBtZXNzYWdlO1xuICAgIHN3aXRjaCAoaXNzdWUuY29kZSkge1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGU6XG4gICAgICAgICAgICBpZiAoaXNzdWUucmVjZWl2ZWQgPT09IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiUmVxdWlyZWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgRXhwZWN0ZWQgJHtpc3N1ZS5leHBlY3RlZH0sIHJlY2VpdmVkICR7aXNzdWUucmVjZWl2ZWR9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX2xpdGVyYWw6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgbGl0ZXJhbCB2YWx1ZSwgZXhwZWN0ZWQgJHtKU09OLnN0cmluZ2lmeShpc3N1ZS5leHBlY3RlZCwgdXRpbC5qc29uU3RyaW5naWZ5UmVwbGFjZXIpfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUudW5yZWNvZ25pemVkX2tleXM6XG4gICAgICAgICAgICBtZXNzYWdlID0gYFVucmVjb2duaXplZCBrZXkocykgaW4gb2JqZWN0OiAke3V0aWwuam9pblZhbHVlcyhpc3N1ZS5rZXlzLCBcIiwgXCIpfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dGA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbl9kaXNjcmltaW5hdG9yOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGRpc2NyaW1pbmF0b3IgdmFsdWUuIEV4cGVjdGVkICR7dXRpbC5qb2luVmFsdWVzKGlzc3VlLm9wdGlvbnMpfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9lbnVtX3ZhbHVlOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGVudW0gdmFsdWUuIEV4cGVjdGVkICR7dXRpbC5qb2luVmFsdWVzKGlzc3VlLm9wdGlvbnMpfSwgcmVjZWl2ZWQgJyR7aXNzdWUucmVjZWl2ZWR9J2A7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9hcmd1bWVudHM6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgZnVuY3Rpb24gYXJndW1lbnRzYDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX3JldHVybl90eXBlOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGZ1bmN0aW9uIHJldHVybiB0eXBlYDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX2RhdGU6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgZGF0ZWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmc6XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlzc3VlLnZhbGlkYXRpb24gPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoXCJpbmNsdWRlc1wiIGluIGlzc3VlLnZhbGlkYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGlucHV0OiBtdXN0IGluY2x1ZGUgXCIke2lzc3VlLnZhbGlkYXRpb24uaW5jbHVkZXN9XCJgO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlzc3VlLnZhbGlkYXRpb24ucG9zaXRpb24gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgJHttZXNzYWdlfSBhdCBvbmUgb3IgbW9yZSBwb3NpdGlvbnMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvICR7aXNzdWUudmFsaWRhdGlvbi5wb3NpdGlvbn1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFwic3RhcnRzV2l0aFwiIGluIGlzc3VlLnZhbGlkYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGlucHV0OiBtdXN0IHN0YXJ0IHdpdGggXCIke2lzc3VlLnZhbGlkYXRpb24uc3RhcnRzV2l0aH1cImA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFwiZW5kc1dpdGhcIiBpbiBpc3N1ZS52YWxpZGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dDogbXVzdCBlbmQgd2l0aCBcIiR7aXNzdWUudmFsaWRhdGlvbi5lbmRzV2l0aH1cImA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGlzc3VlLnZhbGlkYXRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnZhbGlkYXRpb24gIT09IFwicmVnZXhcIikge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCAke2lzc3VlLnZhbGlkYXRpb259YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkludmFsaWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS50b29fc21hbGw6XG4gICAgICAgICAgICBpZiAoaXNzdWUudHlwZSA9PT0gXCJhcnJheVwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgQXJyYXkgbXVzdCBjb250YWluICR7aXNzdWUuZXhhY3QgPyBcImV4YWN0bHlcIiA6IGlzc3VlLmluY2x1c2l2ZSA/IGBhdCBsZWFzdGAgOiBgbW9yZSB0aGFuYH0gJHtpc3N1ZS5taW5pbXVtfSBlbGVtZW50KHMpYDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwic3RyaW5nXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBTdHJpbmcgbXVzdCBjb250YWluICR7aXNzdWUuZXhhY3QgPyBcImV4YWN0bHlcIiA6IGlzc3VlLmluY2x1c2l2ZSA/IGBhdCBsZWFzdGAgOiBgb3ZlcmB9ICR7aXNzdWUubWluaW11bX0gY2hhcmFjdGVyKHMpYDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwibnVtYmVyXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBOdW1iZXIgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHkgZXF1YWwgdG8gYCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gYCA6IGBncmVhdGVyIHRoYW4gYH0ke2lzc3VlLm1pbmltdW19YDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwiYmlnaW50XCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBOdW1iZXIgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHkgZXF1YWwgdG8gYCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gYCA6IGBncmVhdGVyIHRoYW4gYH0ke2lzc3VlLm1pbmltdW19YDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwiZGF0ZVwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgRGF0ZSBtdXN0IGJlICR7aXNzdWUuZXhhY3QgPyBgZXhhY3RseSBlcXVhbCB0byBgIDogaXNzdWUuaW5jbHVzaXZlID8gYGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBgIDogYGdyZWF0ZXIgdGhhbiBgfSR7bmV3IERhdGUoTnVtYmVyKGlzc3VlLm1pbmltdW0pKX1gO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkludmFsaWQgaW5wdXRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS50b29fYmlnOlxuICAgICAgICAgICAgaWYgKGlzc3VlLnR5cGUgPT09IFwiYXJyYXlcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEFycmF5IG11c3QgY29udGFpbiAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYGF0IG1vc3RgIDogYGxlc3MgdGhhbmB9ICR7aXNzdWUubWF4aW11bX0gZWxlbWVudChzKWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcInN0cmluZ1wiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgU3RyaW5nIG11c3QgY29udGFpbiAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYGF0IG1vc3RgIDogYHVuZGVyYH0gJHtpc3N1ZS5tYXhpbXVtfSBjaGFyYWN0ZXIocylgO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJudW1iZXJcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYE51bWJlciBtdXN0IGJlICR7aXNzdWUuZXhhY3QgPyBgZXhhY3RseWAgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgbGVzcyB0aGFuIG9yIGVxdWFsIHRvYCA6IGBsZXNzIHRoYW5gfSAke2lzc3VlLm1heGltdW19YDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwiYmlnaW50XCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBCaWdJbnQgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYGxlc3MgdGhhbiBvciBlcXVhbCB0b2AgOiBgbGVzcyB0aGFuYH0gJHtpc3N1ZS5tYXhpbXVtfWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcImRhdGVcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYERhdGUgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYHNtYWxsZXIgdGhhbiBvciBlcXVhbCB0b2AgOiBgc21hbGxlciB0aGFuYH0gJHtuZXcgRGF0ZShOdW1iZXIoaXNzdWUubWF4aW11bSkpfWA7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiSW52YWxpZCBpbnB1dFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmN1c3RvbTpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dGA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9pbnRlcnNlY3Rpb25fdHlwZXM6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludGVyc2VjdGlvbiByZXN1bHRzIGNvdWxkIG5vdCBiZSBtZXJnZWRgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLm5vdF9tdWx0aXBsZV9vZjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgTnVtYmVyIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAke2lzc3VlLm11bHRpcGxlT2Z9YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5ub3RfZmluaXRlOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiTnVtYmVyIG11c3QgYmUgZmluaXRlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBfY3R4LmRlZmF1bHRFcnJvcjtcbiAgICAgICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoaXNzdWUpO1xuICAgIH1cbiAgICByZXR1cm4geyBtZXNzYWdlIH07XG59O1xuZXhwb3J0IGRlZmF1bHQgZXJyb3JNYXA7XG4iLCAiaW1wb3J0IGRlZmF1bHRFcnJvck1hcCBmcm9tIFwiLi9sb2NhbGVzL2VuLmpzXCI7XG5sZXQgb3ZlcnJpZGVFcnJvck1hcCA9IGRlZmF1bHRFcnJvck1hcDtcbmV4cG9ydCB7IGRlZmF1bHRFcnJvck1hcCB9O1xuZXhwb3J0IGZ1bmN0aW9uIHNldEVycm9yTWFwKG1hcCkge1xuICAgIG92ZXJyaWRlRXJyb3JNYXAgPSBtYXA7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0RXJyb3JNYXAoKSB7XG4gICAgcmV0dXJuIG92ZXJyaWRlRXJyb3JNYXA7XG59XG4iLCAiaW1wb3J0IHsgZ2V0RXJyb3JNYXAgfSBmcm9tIFwiLi4vZXJyb3JzLmpzXCI7XG5pbXBvcnQgZGVmYXVsdEVycm9yTWFwIGZyb20gXCIuLi9sb2NhbGVzL2VuLmpzXCI7XG5leHBvcnQgY29uc3QgbWFrZUlzc3VlID0gKHBhcmFtcykgPT4ge1xuICAgIGNvbnN0IHsgZGF0YSwgcGF0aCwgZXJyb3JNYXBzLCBpc3N1ZURhdGEgfSA9IHBhcmFtcztcbiAgICBjb25zdCBmdWxsUGF0aCA9IFsuLi5wYXRoLCAuLi4oaXNzdWVEYXRhLnBhdGggfHwgW10pXTtcbiAgICBjb25zdCBmdWxsSXNzdWUgPSB7XG4gICAgICAgIC4uLmlzc3VlRGF0YSxcbiAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgfTtcbiAgICBpZiAoaXNzdWVEYXRhLm1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uaXNzdWVEYXRhLFxuICAgICAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgICAgICAgICBtZXNzYWdlOiBpc3N1ZURhdGEubWVzc2FnZSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgbGV0IGVycm9yTWVzc2FnZSA9IFwiXCI7XG4gICAgY29uc3QgbWFwcyA9IGVycm9yTWFwc1xuICAgICAgICAuZmlsdGVyKChtKSA9PiAhIW0pXG4gICAgICAgIC5zbGljZSgpXG4gICAgICAgIC5yZXZlcnNlKCk7XG4gICAgZm9yIChjb25zdCBtYXAgb2YgbWFwcykge1xuICAgICAgICBlcnJvck1lc3NhZ2UgPSBtYXAoZnVsbElzc3VlLCB7IGRhdGEsIGRlZmF1bHRFcnJvcjogZXJyb3JNZXNzYWdlIH0pLm1lc3NhZ2U7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIC4uLmlzc3VlRGF0YSxcbiAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgICAgIG1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICB9O1xufTtcbmV4cG9ydCBjb25zdCBFTVBUWV9QQVRIID0gW107XG5leHBvcnQgZnVuY3Rpb24gYWRkSXNzdWVUb0NvbnRleHQoY3R4LCBpc3N1ZURhdGEpIHtcbiAgICBjb25zdCBvdmVycmlkZU1hcCA9IGdldEVycm9yTWFwKCk7XG4gICAgY29uc3QgaXNzdWUgPSBtYWtlSXNzdWUoe1xuICAgICAgICBpc3N1ZURhdGE6IGlzc3VlRGF0YSxcbiAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICBlcnJvck1hcHM6IFtcbiAgICAgICAgICAgIGN0eC5jb21tb24uY29udGV4dHVhbEVycm9yTWFwLCAvLyBjb250ZXh0dWFsIGVycm9yIG1hcCBpcyBmaXJzdCBwcmlvcml0eVxuICAgICAgICAgICAgY3R4LnNjaGVtYUVycm9yTWFwLCAvLyB0aGVuIHNjaGVtYS1ib3VuZCBtYXAgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgICBvdmVycmlkZU1hcCwgLy8gdGhlbiBnbG9iYWwgb3ZlcnJpZGUgbWFwXG4gICAgICAgICAgICBvdmVycmlkZU1hcCA9PT0gZGVmYXVsdEVycm9yTWFwID8gdW5kZWZpbmVkIDogZGVmYXVsdEVycm9yTWFwLCAvLyB0aGVuIGdsb2JhbCBkZWZhdWx0IG1hcFxuICAgICAgICBdLmZpbHRlcigoeCkgPT4gISF4KSxcbiAgICB9KTtcbiAgICBjdHguY29tbW9uLmlzc3Vlcy5wdXNoKGlzc3VlKTtcbn1cbmV4cG9ydCBjbGFzcyBQYXJzZVN0YXR1cyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSBcInZhbGlkXCI7XG4gICAgfVxuICAgIGRpcnR5KCkge1xuICAgICAgICBpZiAodGhpcy52YWx1ZSA9PT0gXCJ2YWxpZFwiKVxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFwiZGlydHlcIjtcbiAgICB9XG4gICAgYWJvcnQoKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlICE9PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBcImFib3J0ZWRcIjtcbiAgICB9XG4gICAgc3RhdGljIG1lcmdlQXJyYXkoc3RhdHVzLCByZXN1bHRzKSB7XG4gICAgICAgIGNvbnN0IGFycmF5VmFsdWUgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBzIG9mIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmIChzLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICBpZiAocy5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIGFycmF5VmFsdWUucHVzaChzLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGFycmF5VmFsdWUgfTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIG1lcmdlT2JqZWN0QXN5bmMoc3RhdHVzLCBwYWlycykge1xuICAgICAgICBjb25zdCBzeW5jUGFpcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHBhaXJzKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBwYWlyLmtleTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgcGFpci52YWx1ZTtcbiAgICAgICAgICAgIHN5bmNQYWlycy5wdXNoKHtcbiAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VPYmplY3RTeW5jKHN0YXR1cywgc3luY1BhaXJzKTtcbiAgICB9XG4gICAgc3RhdGljIG1lcmdlT2JqZWN0U3luYyhzdGF0dXMsIHBhaXJzKSB7XG4gICAgICAgIGNvbnN0IGZpbmFsT2JqZWN0ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgY29uc3QgeyBrZXksIHZhbHVlIH0gPSBwYWlyO1xuICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgaWYgKHZhbHVlLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICBpZiAoa2V5LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgaWYgKHZhbHVlLnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgaWYgKGtleS52YWx1ZSAhPT0gXCJfX3Byb3RvX19cIiAmJiAodHlwZW9mIHZhbHVlLnZhbHVlICE9PSBcInVuZGVmaW5lZFwiIHx8IHBhaXIuYWx3YXlzU2V0KSkge1xuICAgICAgICAgICAgICAgIGZpbmFsT2JqZWN0W2tleS52YWx1ZV0gPSB2YWx1ZS52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGZpbmFsT2JqZWN0IH07XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IElOVkFMSUQgPSBPYmplY3QuZnJlZXplKHtcbiAgICBzdGF0dXM6IFwiYWJvcnRlZFwiLFxufSk7XG5leHBvcnQgY29uc3QgRElSVFkgPSAodmFsdWUpID0+ICh7IHN0YXR1czogXCJkaXJ0eVwiLCB2YWx1ZSB9KTtcbmV4cG9ydCBjb25zdCBPSyA9ICh2YWx1ZSkgPT4gKHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlIH0pO1xuZXhwb3J0IGNvbnN0IGlzQWJvcnRlZCA9ICh4KSA9PiB4LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCI7XG5leHBvcnQgY29uc3QgaXNEaXJ0eSA9ICh4KSA9PiB4LnN0YXR1cyA9PT0gXCJkaXJ0eVwiO1xuZXhwb3J0IGNvbnN0IGlzVmFsaWQgPSAoeCkgPT4geC5zdGF0dXMgPT09IFwidmFsaWRcIjtcbmV4cG9ydCBjb25zdCBpc0FzeW5jID0gKHgpID0+IHR5cGVvZiBQcm9taXNlICE9PSBcInVuZGVmaW5lZFwiICYmIHggaW5zdGFuY2VvZiBQcm9taXNlO1xuIiwgImV4cG9ydCB2YXIgZXJyb3JVdGlsO1xuKGZ1bmN0aW9uIChlcnJvclV0aWwpIHtcbiAgICBlcnJvclV0aWwuZXJyVG9PYmogPSAobWVzc2FnZSkgPT4gdHlwZW9mIG1lc3NhZ2UgPT09IFwic3RyaW5nXCIgPyB7IG1lc3NhZ2UgfSA6IG1lc3NhZ2UgfHwge307XG4gICAgLy8gYmlvbWUtaWdub3JlIGxpbnQ6XG4gICAgZXJyb3JVdGlsLnRvU3RyaW5nID0gKG1lc3NhZ2UpID0+IHR5cGVvZiBtZXNzYWdlID09PSBcInN0cmluZ1wiID8gbWVzc2FnZSA6IG1lc3NhZ2U/Lm1lc3NhZ2U7XG59KShlcnJvclV0aWwgfHwgKGVycm9yVXRpbCA9IHt9KSk7XG4iLCAiaW1wb3J0IHsgWm9kRXJyb3IsIFpvZElzc3VlQ29kZSwgfSBmcm9tIFwiLi9ab2RFcnJvci5qc1wiO1xuaW1wb3J0IHsgZGVmYXVsdEVycm9yTWFwLCBnZXRFcnJvck1hcCB9IGZyb20gXCIuL2Vycm9ycy5qc1wiO1xuaW1wb3J0IHsgZXJyb3JVdGlsIH0gZnJvbSBcIi4vaGVscGVycy9lcnJvclV0aWwuanNcIjtcbmltcG9ydCB7IERJUlRZLCBJTlZBTElELCBPSywgUGFyc2VTdGF0dXMsIGFkZElzc3VlVG9Db250ZXh0LCBpc0Fib3J0ZWQsIGlzQXN5bmMsIGlzRGlydHksIGlzVmFsaWQsIG1ha2VJc3N1ZSwgfSBmcm9tIFwiLi9oZWxwZXJzL3BhcnNlVXRpbC5qc1wiO1xuaW1wb3J0IHsgdXRpbCwgWm9kUGFyc2VkVHlwZSwgZ2V0UGFyc2VkVHlwZSB9IGZyb20gXCIuL2hlbHBlcnMvdXRpbC5qc1wiO1xuY2xhc3MgUGFyc2VJbnB1dExhenlQYXRoIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIHZhbHVlLCBwYXRoLCBrZXkpIHtcbiAgICAgICAgdGhpcy5fY2FjaGVkUGF0aCA9IFtdO1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgdGhpcy5kYXRhID0gdmFsdWU7XG4gICAgICAgIHRoaXMuX3BhdGggPSBwYXRoO1xuICAgICAgICB0aGlzLl9rZXkgPSBrZXk7XG4gICAgfVxuICAgIGdldCBwYXRoKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlZFBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLl9rZXkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVkUGF0aC5wdXNoKC4uLnRoaXMuX3BhdGgsIC4uLnRoaXMuX2tleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZWRQYXRoLnB1c2goLi4udGhpcy5fcGF0aCwgdGhpcy5fa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkUGF0aDtcbiAgICB9XG59XG5jb25zdCBoYW5kbGVSZXN1bHQgPSAoY3R4LCByZXN1bHQpID0+IHtcbiAgICBpZiAoaXNWYWxpZChyZXN1bHQpKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdC52YWx1ZSB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKCFjdHguY29tbW9uLmlzc3Vlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlZhbGlkYXRpb24gZmFpbGVkIGJ1dCBubyBpc3N1ZXMgZGV0ZWN0ZWQuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGdldCBlcnJvcigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9lcnJvcjtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBab2RFcnJvcihjdHguY29tbW9uLmlzc3Vlcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZXJyb3I7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cbn07XG5mdW5jdGlvbiBwcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcykge1xuICAgIGlmICghcGFyYW1zKVxuICAgICAgICByZXR1cm4ge307XG4gICAgY29uc3QgeyBlcnJvck1hcCwgaW52YWxpZF90eXBlX2Vycm9yLCByZXF1aXJlZF9lcnJvciwgZGVzY3JpcHRpb24gfSA9IHBhcmFtcztcbiAgICBpZiAoZXJyb3JNYXAgJiYgKGludmFsaWRfdHlwZV9lcnJvciB8fCByZXF1aXJlZF9lcnJvcikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCB1c2UgXCJpbnZhbGlkX3R5cGVfZXJyb3JcIiBvciBcInJlcXVpcmVkX2Vycm9yXCIgaW4gY29uanVuY3Rpb24gd2l0aCBjdXN0b20gZXJyb3IgbWFwLmApO1xuICAgIH1cbiAgICBpZiAoZXJyb3JNYXApXG4gICAgICAgIHJldHVybiB7IGVycm9yTWFwOiBlcnJvck1hcCwgZGVzY3JpcHRpb24gfTtcbiAgICBjb25zdCBjdXN0b21NYXAgPSAoaXNzLCBjdHgpID0+IHtcbiAgICAgICAgY29uc3QgeyBtZXNzYWdlIH0gPSBwYXJhbXM7XG4gICAgICAgIGlmIChpc3MuY29kZSA9PT0gXCJpbnZhbGlkX2VudW1fdmFsdWVcIikge1xuICAgICAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogbWVzc2FnZSA/PyBjdHguZGVmYXVsdEVycm9yIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBjdHguZGF0YSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogbWVzc2FnZSA/PyByZXF1aXJlZF9lcnJvciA/PyBjdHguZGVmYXVsdEVycm9yIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzcy5jb2RlICE9PSBcImludmFsaWRfdHlwZVwiKVxuICAgICAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogY3R4LmRlZmF1bHRFcnJvciB9O1xuICAgICAgICByZXR1cm4geyBtZXNzYWdlOiBtZXNzYWdlID8/IGludmFsaWRfdHlwZV9lcnJvciA/PyBjdHguZGVmYXVsdEVycm9yIH07XG4gICAgfTtcbiAgICByZXR1cm4geyBlcnJvck1hcDogY3VzdG9tTWFwLCBkZXNjcmlwdGlvbiB9O1xufVxuZXhwb3J0IGNsYXNzIFpvZFR5cGUge1xuICAgIGdldCBkZXNjcmlwdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5kZXNjcmlwdGlvbjtcbiAgICB9XG4gICAgX2dldFR5cGUoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIGdldFBhcnNlZFR5cGUoaW5wdXQuZGF0YSk7XG4gICAgfVxuICAgIF9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KSB7XG4gICAgICAgIHJldHVybiAoY3R4IHx8IHtcbiAgICAgICAgICAgIGNvbW1vbjogaW5wdXQucGFyZW50LmNvbW1vbixcbiAgICAgICAgICAgIGRhdGE6IGlucHV0LmRhdGEsXG4gICAgICAgICAgICBwYXJzZWRUeXBlOiBnZXRQYXJzZWRUeXBlKGlucHV0LmRhdGEpLFxuICAgICAgICAgICAgc2NoZW1hRXJyb3JNYXA6IHRoaXMuX2RlZi5lcnJvck1hcCxcbiAgICAgICAgICAgIHBhdGg6IGlucHV0LnBhdGgsXG4gICAgICAgICAgICBwYXJlbnQ6IGlucHV0LnBhcmVudCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1czogbmV3IFBhcnNlU3RhdHVzKCksXG4gICAgICAgICAgICBjdHg6IHtcbiAgICAgICAgICAgICAgICBjb21tb246IGlucHV0LnBhcmVudC5jb21tb24sXG4gICAgICAgICAgICAgICAgZGF0YTogaW5wdXQuZGF0YSxcbiAgICAgICAgICAgICAgICBwYXJzZWRUeXBlOiBnZXRQYXJzZWRUeXBlKGlucHV0LmRhdGEpLFxuICAgICAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICAgICAgcGF0aDogaW5wdXQucGF0aCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGlucHV0LnBhcmVudCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIF9wYXJzZVN5bmMoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcGFyc2UoaW5wdXQpO1xuICAgICAgICBpZiAoaXNBc3luYyhyZXN1bHQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTeW5jaHJvbm91cyBwYXJzZSBlbmNvdW50ZXJlZCBwcm9taXNlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBfcGFyc2VBc3luYyhpbnB1dCkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wYXJzZShpbnB1dCk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzdWx0KTtcbiAgICB9XG4gICAgcGFyc2UoZGF0YSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuc2FmZVBhcnNlKGRhdGEsIHBhcmFtcyk7XG4gICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcylcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuZGF0YTtcbiAgICAgICAgdGhyb3cgcmVzdWx0LmVycm9yO1xuICAgIH1cbiAgICBzYWZlUGFyc2UoZGF0YSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgYXN5bmM6IHBhcmFtcz8uYXN5bmMgPz8gZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGV4dHVhbEVycm9yTWFwOiBwYXJhbXM/LmVycm9yTWFwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IHBhcmFtcz8ucGF0aCB8fCBbXSxcbiAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGFyc2VkVHlwZTogZ2V0UGFyc2VkVHlwZShkYXRhKSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcGFyc2VTeW5jKHsgZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pO1xuICAgICAgICByZXR1cm4gaGFuZGxlUmVzdWx0KGN0eCwgcmVzdWx0KTtcbiAgICB9XG4gICAgXCJ+dmFsaWRhdGVcIihkYXRhKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgYXN5bmM6ICEhdGhpc1tcIn5zdGFuZGFyZFwiXS5hc3luYyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBbXSxcbiAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGFyc2VkVHlwZTogZ2V0UGFyc2VkVHlwZShkYXRhKSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCF0aGlzW1wifnN0YW5kYXJkXCJdLmFzeW5jKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3BhcnNlU3luYyh7IGRhdGEsIHBhdGg6IFtdLCBwYXJlbnQ6IGN0eCB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNWYWxpZChyZXN1bHQpXG4gICAgICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzc3VlczogY3R4LmNvbW1vbi5pc3N1ZXMsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycj8ubWVzc2FnZT8udG9Mb3dlckNhc2UoKT8uaW5jbHVkZXMoXCJlbmNvdW50ZXJlZFwiKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW1wifnN0YW5kYXJkXCJdLmFzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3R4LmNvbW1vbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgYXN5bmM6IHRydWUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fcGFyc2VBc3luYyh7IGRhdGEsIHBhdGg6IFtdLCBwYXJlbnQ6IGN0eCB9KS50aGVuKChyZXN1bHQpID0+IGlzVmFsaWQocmVzdWx0KVxuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogY3R4LmNvbW1vbi5pc3N1ZXMsXG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMgcGFyc2VBc3luYyhkYXRhLCBwYXJhbXMpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zYWZlUGFyc2VBc3luYyhkYXRhLCBwYXJhbXMpO1xuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LmRhdGE7XG4gICAgICAgIHRocm93IHJlc3VsdC5lcnJvcjtcbiAgICB9XG4gICAgYXN5bmMgc2FmZVBhcnNlQXN5bmMoZGF0YSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgY29udGV4dHVhbEVycm9yTWFwOiBwYXJhbXM/LmVycm9yTWFwLFxuICAgICAgICAgICAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IHBhcmFtcz8ucGF0aCB8fCBbXSxcbiAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGFyc2VkVHlwZTogZ2V0UGFyc2VkVHlwZShkYXRhKSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgbWF5YmVBc3luY1Jlc3VsdCA9IHRoaXMuX3BhcnNlKHsgZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCAoaXNBc3luYyhtYXliZUFzeW5jUmVzdWx0KSA/IG1heWJlQXN5bmNSZXN1bHQgOiBQcm9taXNlLnJlc29sdmUobWF5YmVBc3luY1Jlc3VsdCkpO1xuICAgICAgICByZXR1cm4gaGFuZGxlUmVzdWx0KGN0eCwgcmVzdWx0KTtcbiAgICB9XG4gICAgcmVmaW5lKGNoZWNrLCBtZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IGdldElzc3VlUHJvcGVydGllcyA9ICh2YWwpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgbWVzc2FnZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IG1lc3NhZ2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBtZXNzYWdlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZSh2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZpbmVtZW50KCh2YWwsIGN0eCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gY2hlY2sodmFsKTtcbiAgICAgICAgICAgIGNvbnN0IHNldEVycm9yID0gKCkgPT4gY3R4LmFkZElzc3VlKHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuY3VzdG9tLFxuICAgICAgICAgICAgICAgIC4uLmdldElzc3VlUHJvcGVydGllcyh2YWwpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIFByb21pc2UgIT09IFwidW5kZWZpbmVkXCIgJiYgcmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBzZXRFcnJvcigpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVmaW5lbWVudChjaGVjaywgcmVmaW5lbWVudERhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmluZW1lbnQoKHZhbCwgY3R4KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWNoZWNrKHZhbCkpIHtcbiAgICAgICAgICAgICAgICBjdHguYWRkSXNzdWUodHlwZW9mIHJlZmluZW1lbnREYXRhID09PSBcImZ1bmN0aW9uXCIgPyByZWZpbmVtZW50RGF0YSh2YWwsIGN0eCkgOiByZWZpbmVtZW50RGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfcmVmaW5lbWVudChyZWZpbmVtZW50KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRWZmZWN0cyh7XG4gICAgICAgICAgICBzY2hlbWE6IHRoaXMsXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVmZmVjdHMsXG4gICAgICAgICAgICBlZmZlY3Q6IHsgdHlwZTogXCJyZWZpbmVtZW50XCIsIHJlZmluZW1lbnQgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN1cGVyUmVmaW5lKHJlZmluZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmluZW1lbnQocmVmaW5lbWVudCk7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGRlZikge1xuICAgICAgICAvKiogQWxpYXMgb2Ygc2FmZVBhcnNlQXN5bmMgKi9cbiAgICAgICAgdGhpcy5zcGEgPSB0aGlzLnNhZmVQYXJzZUFzeW5jO1xuICAgICAgICB0aGlzLl9kZWYgPSBkZWY7XG4gICAgICAgIHRoaXMucGFyc2UgPSB0aGlzLnBhcnNlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc2FmZVBhcnNlID0gdGhpcy5zYWZlUGFyc2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5wYXJzZUFzeW5jID0gdGhpcy5wYXJzZUFzeW5jLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc2FmZVBhcnNlQXN5bmMgPSB0aGlzLnNhZmVQYXJzZUFzeW5jLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc3BhID0gdGhpcy5zcGEuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5yZWZpbmUgPSB0aGlzLnJlZmluZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnJlZmluZW1lbnQgPSB0aGlzLnJlZmluZW1lbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zdXBlclJlZmluZSA9IHRoaXMuc3VwZXJSZWZpbmUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5vcHRpb25hbCA9IHRoaXMub3B0aW9uYWwuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5udWxsYWJsZSA9IHRoaXMubnVsbGFibGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5udWxsaXNoID0gdGhpcy5udWxsaXNoLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYXJyYXkgPSB0aGlzLmFycmF5LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucHJvbWlzZSA9IHRoaXMucHJvbWlzZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9yID0gdGhpcy5vci5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmFuZCA9IHRoaXMuYW5kLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtID0gdGhpcy50cmFuc2Zvcm0uYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5icmFuZCA9IHRoaXMuYnJhbmQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5kZWZhdWx0ID0gdGhpcy5kZWZhdWx0LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuY2F0Y2ggPSB0aGlzLmNhdGNoLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZGVzY3JpYmUgPSB0aGlzLmRlc2NyaWJlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucGlwZSA9IHRoaXMucGlwZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnJlYWRvbmx5ID0gdGhpcy5yZWFkb25seS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmlzTnVsbGFibGUgPSB0aGlzLmlzTnVsbGFibGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5pc09wdGlvbmFsID0gdGhpcy5pc09wdGlvbmFsLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXNbXCJ+c3RhbmRhcmRcIl0gPSB7XG4gICAgICAgICAgICB2ZXJzaW9uOiAxLFxuICAgICAgICAgICAgdmVuZG9yOiBcInpvZFwiLFxuICAgICAgICAgICAgdmFsaWRhdGU6IChkYXRhKSA9PiB0aGlzW1wifnZhbGlkYXRlXCJdKGRhdGEpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBvcHRpb25hbCgpIHtcbiAgICAgICAgcmV0dXJuIFpvZE9wdGlvbmFsLmNyZWF0ZSh0aGlzLCB0aGlzLl9kZWYpO1xuICAgIH1cbiAgICBudWxsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIFpvZE51bGxhYmxlLmNyZWF0ZSh0aGlzLCB0aGlzLl9kZWYpO1xuICAgIH1cbiAgICBudWxsaXNoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5udWxsYWJsZSgpLm9wdGlvbmFsKCk7XG4gICAgfVxuICAgIGFycmF5KCkge1xuICAgICAgICByZXR1cm4gWm9kQXJyYXkuY3JlYXRlKHRoaXMpO1xuICAgIH1cbiAgICBwcm9taXNlKCkge1xuICAgICAgICByZXR1cm4gWm9kUHJvbWlzZS5jcmVhdGUodGhpcywgdGhpcy5fZGVmKTtcbiAgICB9XG4gICAgb3Iob3B0aW9uKSB7XG4gICAgICAgIHJldHVybiBab2RVbmlvbi5jcmVhdGUoW3RoaXMsIG9wdGlvbl0sIHRoaXMuX2RlZik7XG4gICAgfVxuICAgIGFuZChpbmNvbWluZykge1xuICAgICAgICByZXR1cm4gWm9kSW50ZXJzZWN0aW9uLmNyZWF0ZSh0aGlzLCBpbmNvbWluZywgdGhpcy5fZGVmKTtcbiAgICB9XG4gICAgdHJhbnNmb3JtKHRyYW5zZm9ybSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEVmZmVjdHMoe1xuICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyh0aGlzLl9kZWYpLFxuICAgICAgICAgICAgc2NoZW1hOiB0aGlzLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFZmZlY3RzLFxuICAgICAgICAgICAgZWZmZWN0OiB7IHR5cGU6IFwidHJhbnNmb3JtXCIsIHRyYW5zZm9ybSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZGVmYXVsdChkZWYpIHtcbiAgICAgICAgY29uc3QgZGVmYXVsdFZhbHVlRnVuYyA9IHR5cGVvZiBkZWYgPT09IFwiZnVuY3Rpb25cIiA/IGRlZiA6ICgpID0+IGRlZjtcbiAgICAgICAgcmV0dXJuIG5ldyBab2REZWZhdWx0KHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXModGhpcy5fZGVmKSxcbiAgICAgICAgICAgIGlubmVyVHlwZTogdGhpcyxcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogZGVmYXVsdFZhbHVlRnVuYyxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRGVmYXVsdCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGJyYW5kKCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEJyYW5kZWQoe1xuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RCcmFuZGVkLFxuICAgICAgICAgICAgdHlwZTogdGhpcyxcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXModGhpcy5fZGVmKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNhdGNoKGRlZikge1xuICAgICAgICBjb25zdCBjYXRjaFZhbHVlRnVuYyA9IHR5cGVvZiBkZWYgPT09IFwiZnVuY3Rpb25cIiA/IGRlZiA6ICgpID0+IGRlZjtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RDYXRjaCh7XG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHRoaXMuX2RlZiksXG4gICAgICAgICAgICBpbm5lclR5cGU6IHRoaXMsXG4gICAgICAgICAgICBjYXRjaFZhbHVlOiBjYXRjaFZhbHVlRnVuYyxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQ2F0Y2gsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBkZXNjcmliZShkZXNjcmlwdGlvbikge1xuICAgICAgICBjb25zdCBUaGlzID0gdGhpcy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgcmV0dXJuIG5ldyBUaGlzKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcGlwZSh0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuIFpvZFBpcGVsaW5lLmNyZWF0ZSh0aGlzLCB0YXJnZXQpO1xuICAgIH1cbiAgICByZWFkb25seSgpIHtcbiAgICAgICAgcmV0dXJuIFpvZFJlYWRvbmx5LmNyZWF0ZSh0aGlzKTtcbiAgICB9XG4gICAgaXNPcHRpb25hbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FmZVBhcnNlKHVuZGVmaW5lZCkuc3VjY2VzcztcbiAgICB9XG4gICAgaXNOdWxsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FmZVBhcnNlKG51bGwpLnN1Y2Nlc3M7XG4gICAgfVxufVxuY29uc3QgY3VpZFJlZ2V4ID0gL15jW15cXHMtXXs4LH0kL2k7XG5jb25zdCBjdWlkMlJlZ2V4ID0gL15bMC05YS16XSskLztcbmNvbnN0IHVsaWRSZWdleCA9IC9eWzAtOUEtSEpLTU5QLVRWLVpdezI2fSQvaTtcbi8vIGNvbnN0IHV1aWRSZWdleCA9XG4vLyAgIC9eKFthLWYwLTldezh9LVthLWYwLTldezR9LVsxLTVdW2EtZjAtOV17M30tW2EtZjAtOV17NH0tW2EtZjAtOV17MTJ9fDAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCkkL2k7XG5jb25zdCB1dWlkUmVnZXggPSAvXlswLTlhLWZBLUZdezh9XFxiLVswLTlhLWZBLUZdezR9XFxiLVswLTlhLWZBLUZdezR9XFxiLVswLTlhLWZBLUZdezR9XFxiLVswLTlhLWZBLUZdezEyfSQvaTtcbmNvbnN0IG5hbm9pZFJlZ2V4ID0gL15bYS16MC05Xy1dezIxfSQvaTtcbmNvbnN0IGp3dFJlZ2V4ID0gL15bQS1aYS16MC05LV9dK1xcLltBLVphLXowLTktX10rXFwuW0EtWmEtejAtOS1fXSokLztcbmNvbnN0IGR1cmF0aW9uUmVnZXggPSAvXlstK10/UCg/ISQpKD86KD86Wy0rXT9cXGQrWSl8KD86Wy0rXT9cXGQrWy4sXVxcZCtZJCkpPyg/Oig/OlstK10/XFxkK00pfCg/OlstK10/XFxkK1suLF1cXGQrTSQpKT8oPzooPzpbLStdP1xcZCtXKXwoPzpbLStdP1xcZCtbLixdXFxkK1ckKSk/KD86KD86Wy0rXT9cXGQrRCl8KD86Wy0rXT9cXGQrWy4sXVxcZCtEJCkpPyg/OlQoPz1bXFxkKy1dKSg/Oig/OlstK10/XFxkK0gpfCg/OlstK10/XFxkK1suLF1cXGQrSCQpKT8oPzooPzpbLStdP1xcZCtNKXwoPzpbLStdP1xcZCtbLixdXFxkK00kKSk/KD86Wy0rXT9cXGQrKD86Wy4sXVxcZCspP1MpPyk/PyQvO1xuLy8gZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNDYxODEvMTU1MDE1NVxuLy8gb2xkIHZlcnNpb246IHRvbyBzbG93LCBkaWRuJ3Qgc3VwcG9ydCB1bmljb2RlXG4vLyBjb25zdCBlbWFpbFJlZ2V4ID0gL14oKChbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkrKFxcLihbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkrKSopfCgoXFx4MjIpKCgoKFxceDIwfFxceDA5KSooXFx4MGRcXHgwYSkpPyhcXHgyMHxcXHgwOSkrKT8oKFtcXHgwMS1cXHgwOFxceDBiXFx4MGNcXHgwZS1cXHgxZlxceDdmXXxcXHgyMXxbXFx4MjMtXFx4NWJdfFtcXHg1ZC1cXHg3ZV18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfChcXFxcKFtcXHgwMS1cXHgwOVxceDBiXFx4MGNcXHgwZC1cXHg3Zl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSkpKigoKFxceDIwfFxceDA5KSooXFx4MGRcXHgwYSkpPyhcXHgyMHxcXHgwOSkrKT8oXFx4MjIpKSlAKCgoW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLikrKChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpJC9pO1xuLy9vbGQgZW1haWwgcmVnZXhcbi8vIGNvbnN0IGVtYWlsUmVnZXggPSAvXigoW148PigpW1xcXS4sOzpcXHNAXCJdKyhcXC5bXjw+KClbXFxdLiw7Olxcc0BcIl0rKSopfChcIi4rXCIpKUAoKD8hLSkoW148PigpW1xcXS4sOzpcXHNAXCJdK1xcLikrW148PigpW1xcXS4sOzpcXHNAXCJdezEsfSlbXi08PigpW1xcXS4sOzpcXHNAXCJdJC9pO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4vLyBjb25zdCBlbWFpbFJlZ2V4ID1cbi8vICAgL14oKFtePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoXFxbKCgoMjVbMC01XSl8KDJbMC00XVswLTldKXwoMVswLTldezJ9KXwoWzAtOV17MSwyfSkpXFwuKXszfSgoMjVbMC01XSl8KDJbMC00XVswLTldKXwoMVswLTldezJ9KXwoWzAtOV17MSwyfSkpXFxdKXwoXFxbSVB2NjooKFthLWYwLTldezEsNH06KXs3fXw6OihbYS1mMC05XXsxLDR9Oil7MCw2fXwoW2EtZjAtOV17MSw0fTopezF9OihbYS1mMC05XXsxLDR9Oil7MCw1fXwoW2EtZjAtOV17MSw0fTopezJ9OihbYS1mMC05XXsxLDR9Oil7MCw0fXwoW2EtZjAtOV17MSw0fTopezN9OihbYS1mMC05XXsxLDR9Oil7MCwzfXwoW2EtZjAtOV17MSw0fTopezR9OihbYS1mMC05XXsxLDR9Oil7MCwyfXwoW2EtZjAtOV17MSw0fTopezV9OihbYS1mMC05XXsxLDR9Oil7MCwxfSkoW2EtZjAtOV17MSw0fXwoKCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSlcXC4pezN9KCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSkpXFxdKXwoW0EtWmEtejAtOV0oW0EtWmEtejAtOS1dKltBLVphLXowLTldKSooXFwuW0EtWmEtel17Mix9KSspKSQvO1xuLy8gY29uc3QgZW1haWxSZWdleCA9XG4vLyAgIC9eW2EtekEtWjAtOVxcLlxcIVxcI1xcJFxcJVxcJlxcJ1xcKlxcK1xcL1xcPVxcP1xcXlxcX1xcYFxce1xcfFxcfVxcflxcLV0rQFthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykqJC87XG4vLyBjb25zdCBlbWFpbFJlZ2V4ID1cbi8vICAgL14oPzpbYS16MC05ISMkJSYnKisvPT9eX2B7fH1+LV0rKD86XFwuW2EtejAtOSEjJCUmJyorLz0/Xl9ge3x9fi1dKykqfFwiKD86W1xceDAxLVxceDA4XFx4MGJcXHgwY1xceDBlLVxceDFmXFx4MjFcXHgyMy1cXHg1YlxceDVkLVxceDdmXXxcXFxcW1xceDAxLVxceDA5XFx4MGJcXHgwY1xceDBlLVxceDdmXSkqXCIpQCg/Oig/OlthLXowLTldKD86W2EtejAtOS1dKlthLXowLTldKT9cXC4pK1thLXowLTldKD86W2EtejAtOS1dKlthLXowLTldKT98XFxbKD86KD86MjVbMC01XXwyWzAtNF1bMC05XXxbMDFdP1swLTldWzAtOV0/KVxcLil7M30oPzoyNVswLTVdfDJbMC00XVswLTldfFswMV0/WzAtOV1bMC05XT98W2EtejAtOS1dKlthLXowLTldOig/OltcXHgwMS1cXHgwOFxceDBiXFx4MGNcXHgwZS1cXHgxZlxceDIxLVxceDVhXFx4NTMtXFx4N2ZdfFxcXFxbXFx4MDEtXFx4MDlcXHgwYlxceDBjXFx4MGUtXFx4N2ZdKSspXFxdKSQvaTtcbmNvbnN0IGVtYWlsUmVnZXggPSAvXig/IVxcLikoPyEuKlxcLlxcLikoW0EtWjAtOV8nK1xcLVxcLl0qKVtBLVowLTlfKy1dQChbQS1aMC05XVtBLVowLTlcXC1dKlxcLikrW0EtWl17Mix9JC9pO1xuLy8gY29uc3QgZW1haWxSZWdleCA9XG4vLyAgIC9eW2EtejAtOS4hIyQlJlx1MjAxOSorLz0/Xl9ge3x9fi1dK0BbYS16MC05LV0rKD86XFwuW2EtejAtOVxcLV0rKSokL2k7XG4vLyBmcm9tIGh0dHBzOi8vdGhla2V2aW5zY290dC5jb20vZW1vamlzLWluLWphdmFzY3JpcHQvI3dyaXRpbmctYS1yZWd1bGFyLWV4cHJlc3Npb25cbmNvbnN0IF9lbW9qaVJlZ2V4ID0gYF4oXFxcXHB7RXh0ZW5kZWRfUGljdG9ncmFwaGljfXxcXFxccHtFbW9qaV9Db21wb25lbnR9KSskYDtcbmxldCBlbW9qaVJlZ2V4O1xuLy8gZmFzdGVyLCBzaW1wbGVyLCBzYWZlclxuY29uc3QgaXB2NFJlZ2V4ID0gL14oPzooPzoyNVswLTVdfDJbMC00XVswLTldfDFbMC05XVswLTldfFsxLTldWzAtOV18WzAtOV0pXFwuKXszfSg/OjI1WzAtNV18MlswLTRdWzAtOV18MVswLTldWzAtOV18WzEtOV1bMC05XXxbMC05XSkkLztcbmNvbnN0IGlwdjRDaWRyUmVnZXggPSAvXig/Oig/OjI1WzAtNV18MlswLTRdWzAtOV18MVswLTldWzAtOV18WzEtOV1bMC05XXxbMC05XSlcXC4pezN9KD86MjVbMC01XXwyWzAtNF1bMC05XXwxWzAtOV1bMC05XXxbMS05XVswLTldfFswLTldKVxcLygzWzAtMl18WzEyXT9bMC05XSkkLztcbi8vIGNvbnN0IGlwdjZSZWdleCA9XG4vLyAvXigoW2EtZjAtOV17MSw0fTopezd9fDo6KFthLWYwLTldezEsNH06KXswLDZ9fChbYS1mMC05XXsxLDR9Oil7MX06KFthLWYwLTldezEsNH06KXswLDV9fChbYS1mMC05XXsxLDR9Oil7Mn06KFthLWYwLTldezEsNH06KXswLDR9fChbYS1mMC05XXsxLDR9Oil7M306KFthLWYwLTldezEsNH06KXswLDN9fChbYS1mMC05XXsxLDR9Oil7NH06KFthLWYwLTldezEsNH06KXswLDJ9fChbYS1mMC05XXsxLDR9Oil7NX06KFthLWYwLTldezEsNH06KXswLDF9KShbYS1mMC05XXsxLDR9fCgoKDI1WzAtNV0pfCgyWzAtNF1bMC05XSl8KDFbMC05XXsyfSl8KFswLTldezEsMn0pKVxcLil7M30oKDI1WzAtNV0pfCgyWzAtNF1bMC05XSl8KDFbMC05XXsyfSl8KFswLTldezEsMn0pKSkkLztcbmNvbnN0IGlwdjZSZWdleCA9IC9eKChbMC05YS1mQS1GXXsxLDR9Oil7Nyw3fVswLTlhLWZBLUZdezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDd9OnwoWzAtOWEtZkEtRl17MSw0fTopezEsNn06WzAtOWEtZkEtRl17MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsNX0oOlswLTlhLWZBLUZdezEsNH0pezEsMn18KFswLTlhLWZBLUZdezEsNH06KXsxLDR9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDN9fChbMC05YS1mQS1GXXsxLDR9Oil7MSwzfSg6WzAtOWEtZkEtRl17MSw0fSl7MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsMn0oOlswLTlhLWZBLUZdezEsNH0pezEsNX18WzAtOWEtZkEtRl17MSw0fTooKDpbMC05YS1mQS1GXXsxLDR9KXsxLDZ9KXw6KCg6WzAtOWEtZkEtRl17MSw0fSl7MSw3fXw6KXxmZTgwOig6WzAtOWEtZkEtRl17MCw0fSl7MCw0fSVbMC05YS16QS1aXXsxLH18OjooZmZmZig6MHsxLDR9KXswLDF9Oil7MCwxfSgoMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pXFwuKXszLDN9KDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKXwoWzAtOWEtZkEtRl17MSw0fTopezEsNH06KCgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSlcXC4pezMsM30oMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pKSQvO1xuY29uc3QgaXB2NkNpZHJSZWdleCA9IC9eKChbMC05YS1mQS1GXXsxLDR9Oil7Nyw3fVswLTlhLWZBLUZdezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDd9OnwoWzAtOWEtZkEtRl17MSw0fTopezEsNn06WzAtOWEtZkEtRl17MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsNX0oOlswLTlhLWZBLUZdezEsNH0pezEsMn18KFswLTlhLWZBLUZdezEsNH06KXsxLDR9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDN9fChbMC05YS1mQS1GXXsxLDR9Oil7MSwzfSg6WzAtOWEtZkEtRl17MSw0fSl7MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsMn0oOlswLTlhLWZBLUZdezEsNH0pezEsNX18WzAtOWEtZkEtRl17MSw0fTooKDpbMC05YS1mQS1GXXsxLDR9KXsxLDZ9KXw6KCg6WzAtOWEtZkEtRl17MSw0fSl7MSw3fXw6KXxmZTgwOig6WzAtOWEtZkEtRl17MCw0fSl7MCw0fSVbMC05YS16QS1aXXsxLH18OjooZmZmZig6MHsxLDR9KXswLDF9Oil7MCwxfSgoMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pXFwuKXszLDN9KDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKXwoWzAtOWEtZkEtRl17MSw0fTopezEsNH06KCgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSlcXC4pezMsM30oMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pKVxcLygxMlswLThdfDFbMDFdWzAtOV18WzEtOV0/WzAtOV0pJC87XG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83ODYwMzkyL2RldGVybWluZS1pZi1zdHJpbmctaXMtaW4tYmFzZTY0LXVzaW5nLWphdmFzY3JpcHRcbmNvbnN0IGJhc2U2NFJlZ2V4ID0gL14oWzAtOWEtekEtWisvXXs0fSkqKChbMC05YS16QS1aKy9dezJ9PT0pfChbMC05YS16QS1aKy9dezN9PSkpPyQvO1xuLy8gaHR0cHM6Ly9iYXNlNjQuZ3VydS9zdGFuZGFyZHMvYmFzZTY0dXJsXG5jb25zdCBiYXNlNjR1cmxSZWdleCA9IC9eKFswLTlhLXpBLVotX117NH0pKigoWzAtOWEtekEtWi1fXXsyfSg9PSk/KXwoWzAtOWEtekEtWi1fXXszfSg9KT8pKT8kLztcbi8vIHNpbXBsZVxuLy8gY29uc3QgZGF0ZVJlZ2V4U291cmNlID0gYFxcXFxkezR9LVxcXFxkezJ9LVxcXFxkezJ9YDtcbi8vIG5vIGxlYXAgeWVhciB2YWxpZGF0aW9uXG4vLyBjb25zdCBkYXRlUmVnZXhTb3VyY2UgPSBgXFxcXGR7NH0tKCgwWzEzNTc4XXwxMHwxMiktMzF8KDBbMTMtOV18MVswLTJdKS0zMHwoMFsxLTldfDFbMC0yXSktKDBbMS05XXwxXFxcXGR8MlxcXFxkKSlgO1xuLy8gd2l0aCBsZWFwIHllYXIgdmFsaWRhdGlvblxuY29uc3QgZGF0ZVJlZ2V4U291cmNlID0gYCgoXFxcXGRcXFxcZFsyNDY4XVswNDhdfFxcXFxkXFxcXGRbMTM1NzldWzI2XXxcXFxcZFxcXFxkMFs0OF18WzAyNDY4XVswNDhdMDB8WzEzNTc5XVsyNl0wMCktMDItMjl8XFxcXGR7NH0tKCgwWzEzNTc4XXwxWzAyXSktKDBbMS05XXxbMTJdXFxcXGR8M1swMV0pfCgwWzQ2OV18MTEpLSgwWzEtOV18WzEyXVxcXFxkfDMwKXwoMDIpLSgwWzEtOV18MVxcXFxkfDJbMC04XSkpKWA7XG5jb25zdCBkYXRlUmVnZXggPSBuZXcgUmVnRXhwKGBeJHtkYXRlUmVnZXhTb3VyY2V9JGApO1xuZnVuY3Rpb24gdGltZVJlZ2V4U291cmNlKGFyZ3MpIHtcbiAgICBsZXQgc2Vjb25kc1JlZ2V4U291cmNlID0gYFswLTVdXFxcXGRgO1xuICAgIGlmIChhcmdzLnByZWNpc2lvbikge1xuICAgICAgICBzZWNvbmRzUmVnZXhTb3VyY2UgPSBgJHtzZWNvbmRzUmVnZXhTb3VyY2V9XFxcXC5cXFxcZHske2FyZ3MucHJlY2lzaW9ufX1gO1xuICAgIH1cbiAgICBlbHNlIGlmIChhcmdzLnByZWNpc2lvbiA9PSBudWxsKSB7XG4gICAgICAgIHNlY29uZHNSZWdleFNvdXJjZSA9IGAke3NlY29uZHNSZWdleFNvdXJjZX0oXFxcXC5cXFxcZCspP2A7XG4gICAgfVxuICAgIGNvbnN0IHNlY29uZHNRdWFudGlmaWVyID0gYXJncy5wcmVjaXNpb24gPyBcIitcIiA6IFwiP1wiOyAvLyByZXF1aXJlIHNlY29uZHMgaWYgcHJlY2lzaW9uIGlzIG5vbnplcm9cbiAgICByZXR1cm4gYChbMDFdXFxcXGR8MlswLTNdKTpbMC01XVxcXFxkKDoke3NlY29uZHNSZWdleFNvdXJjZX0pJHtzZWNvbmRzUXVhbnRpZmllcn1gO1xufVxuZnVuY3Rpb24gdGltZVJlZ2V4KGFyZ3MpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXiR7dGltZVJlZ2V4U291cmNlKGFyZ3MpfSRgKTtcbn1cbi8vIEFkYXB0ZWQgZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzE0MzIzMVxuZXhwb3J0IGZ1bmN0aW9uIGRhdGV0aW1lUmVnZXgoYXJncykge1xuICAgIGxldCByZWdleCA9IGAke2RhdGVSZWdleFNvdXJjZX1UJHt0aW1lUmVnZXhTb3VyY2UoYXJncyl9YDtcbiAgICBjb25zdCBvcHRzID0gW107XG4gICAgb3B0cy5wdXNoKGFyZ3MubG9jYWwgPyBgWj9gIDogYFpgKTtcbiAgICBpZiAoYXJncy5vZmZzZXQpXG4gICAgICAgIG9wdHMucHVzaChgKFsrLV1cXFxcZHsyfTo/XFxcXGR7Mn0pYCk7XG4gICAgcmVnZXggPSBgJHtyZWdleH0oJHtvcHRzLmpvaW4oXCJ8XCIpfSlgO1xuICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHtyZWdleH0kYCk7XG59XG5mdW5jdGlvbiBpc1ZhbGlkSVAoaXAsIHZlcnNpb24pIHtcbiAgICBpZiAoKHZlcnNpb24gPT09IFwidjRcIiB8fCAhdmVyc2lvbikgJiYgaXB2NFJlZ2V4LnRlc3QoaXApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoKHZlcnNpb24gPT09IFwidjZcIiB8fCAhdmVyc2lvbikgJiYgaXB2NlJlZ2V4LnRlc3QoaXApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBpc1ZhbGlkSldUKGp3dCwgYWxnKSB7XG4gICAgaWYgKCFqd3RSZWdleC50ZXN0KGp3dCkpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBbaGVhZGVyXSA9IGp3dC5zcGxpdChcIi5cIik7XG4gICAgICAgIGlmICghaGVhZGVyKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyBDb252ZXJ0IGJhc2U2NHVybCB0byBiYXNlNjRcbiAgICAgICAgY29uc3QgYmFzZTY0ID0gaGVhZGVyXG4gICAgICAgICAgICAucmVwbGFjZSgvLS9nLCBcIitcIilcbiAgICAgICAgICAgIC5yZXBsYWNlKC9fL2csIFwiL1wiKVxuICAgICAgICAgICAgLnBhZEVuZChoZWFkZXIubGVuZ3RoICsgKCg0IC0gKGhlYWRlci5sZW5ndGggJSA0KSkgJSA0KSwgXCI9XCIpO1xuICAgICAgICBjb25zdCBkZWNvZGVkID0gSlNPTi5wYXJzZShhdG9iKGJhc2U2NCkpO1xuICAgICAgICBpZiAodHlwZW9mIGRlY29kZWQgIT09IFwib2JqZWN0XCIgfHwgZGVjb2RlZCA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKFwidHlwXCIgaW4gZGVjb2RlZCAmJiBkZWNvZGVkPy50eXAgIT09IFwiSldUXCIpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICghZGVjb2RlZC5hbGcpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChhbGcgJiYgZGVjb2RlZC5hbGcgIT09IGFsZylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGlzVmFsaWRDaWRyKGlwLCB2ZXJzaW9uKSB7XG4gICAgaWYgKCh2ZXJzaW9uID09PSBcInY0XCIgfHwgIXZlcnNpb24pICYmIGlwdjRDaWRyUmVnZXgudGVzdChpcCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICgodmVyc2lvbiA9PT0gXCJ2NlwiIHx8ICF2ZXJzaW9uKSAmJiBpcHY2Q2lkclJlZ2V4LnRlc3QoaXApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5leHBvcnQgY2xhc3MgWm9kU3RyaW5nIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY29lcmNlKSB7XG4gICAgICAgICAgICBpbnB1dC5kYXRhID0gU3RyaW5nKGlucHV0LmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuc3RyaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLnN0cmluZyxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IG5ldyBQYXJzZVN0YXR1cygpO1xuICAgICAgICBsZXQgY3R4ID0gdW5kZWZpbmVkO1xuICAgICAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaGVjay5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEubGVuZ3RoIDwgY2hlY2sudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEubGVuZ3RoID4gY2hlY2sudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJsZW5ndGhcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb0JpZyA9IGlucHV0LmRhdGEubGVuZ3RoID4gY2hlY2sudmFsdWU7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBpbnB1dC5kYXRhLmxlbmd0aCA8IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29CaWcgfHwgdG9vU21hbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b29CaWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0b29TbWFsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJlbWFpbFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlbWFpbFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJlbWFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZW1vamlcIikge1xuICAgICAgICAgICAgICAgIGlmICghZW1vamlSZWdleCkge1xuICAgICAgICAgICAgICAgICAgICBlbW9qaVJlZ2V4ID0gbmV3IFJlZ0V4cChfZW1vamlSZWdleCwgXCJ1XCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWVtb2ppUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImVtb2ppXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ1dWlkXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXV1aWRSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwidXVpZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibmFub2lkXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW5hbm9pZFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJuYW5vaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImN1aWRcIikge1xuICAgICAgICAgICAgICAgIGlmICghY3VpZFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJjdWlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJjdWlkMlwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjdWlkMlJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJjdWlkMlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwidWxpZFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF1bGlkUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcInVsaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInVybFwiKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgbmV3IFVSTChpbnB1dC5kYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcInVybFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwicmVnZXhcIikge1xuICAgICAgICAgICAgICAgIGNoZWNrLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgdGVzdFJlc3VsdCA9IGNoZWNrLnJlZ2V4LnRlc3QoaW5wdXQuZGF0YSk7XG4gICAgICAgICAgICAgICAgaWYgKCF0ZXN0UmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwicmVnZXhcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInRyaW1cIikge1xuICAgICAgICAgICAgICAgIGlucHV0LmRhdGEgPSBpbnB1dC5kYXRhLnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiaW5jbHVkZXNcIikge1xuICAgICAgICAgICAgICAgIGlmICghaW5wdXQuZGF0YS5pbmNsdWRlcyhjaGVjay52YWx1ZSwgY2hlY2sucG9zaXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHsgaW5jbHVkZXM6IGNoZWNrLnZhbHVlLCBwb3NpdGlvbjogY2hlY2sucG9zaXRpb24gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInRvTG93ZXJDYXNlXCIpIHtcbiAgICAgICAgICAgICAgICBpbnB1dC5kYXRhID0gaW5wdXQuZGF0YS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ0b1VwcGVyQ2FzZVwiKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQuZGF0YSA9IGlucHV0LmRhdGEudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwic3RhcnRzV2l0aFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpbnB1dC5kYXRhLnN0YXJ0c1dpdGgoY2hlY2sudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHsgc3RhcnRzV2l0aDogY2hlY2sudmFsdWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImVuZHNXaXRoXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0LmRhdGEuZW5kc1dpdGgoY2hlY2sudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHsgZW5kc1dpdGg6IGNoZWNrLnZhbHVlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJkYXRldGltZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVnZXggPSBkYXRldGltZVJlZ2V4KGNoZWNrKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJkYXRldGltZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZGF0ZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVnZXggPSBkYXRlUmVnZXg7XG4gICAgICAgICAgICAgICAgaWYgKCFyZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwidGltZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVnZXggPSB0aW1lUmVnZXgoY2hlY2spO1xuICAgICAgICAgICAgICAgIGlmICghcmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcInRpbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImR1cmF0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWR1cmF0aW9uUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImR1cmF0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJpcFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkSVAoaW5wdXQuZGF0YSwgY2hlY2sudmVyc2lvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJpcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiand0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzVmFsaWRKV1QoaW5wdXQuZGF0YSwgY2hlY2suYWxnKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImp3dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiY2lkclwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkQ2lkcihpbnB1dC5kYXRhLCBjaGVjay52ZXJzaW9uKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImNpZHJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImJhc2U2NFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFiYXNlNjRSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiYmFzZTY0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJiYXNlNjR1cmxcIikge1xuICAgICAgICAgICAgICAgIGlmICghYmFzZTY0dXJsUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImJhc2U2NHVybFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoY2hlY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogaW5wdXQuZGF0YSB9O1xuICAgIH1cbiAgICBfcmVnZXgocmVnZXgsIHZhbGlkYXRpb24sIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVmaW5lbWVudCgoZGF0YSkgPT4gcmVnZXgudGVzdChkYXRhKSwge1xuICAgICAgICAgICAgdmFsaWRhdGlvbixcbiAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9hZGRDaGVjayhjaGVjaykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFN0cmluZyh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCBjaGVja10sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbWFpbChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiZW1haWxcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICB1cmwobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcInVybFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIGVtb2ppKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJlbW9qaVwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIHV1aWQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcInV1aWRcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBuYW5vaWQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcIm5hbm9pZFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIGN1aWQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImN1aWRcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBjdWlkMihtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiY3VpZDJcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICB1bGlkKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJ1bGlkXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgYmFzZTY0KG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJiYXNlNjRcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBiYXNlNjR1cmwobWVzc2FnZSkge1xuICAgICAgICAvLyBiYXNlNjR1cmwgZW5jb2RpbmcgaXMgYSBtb2RpZmljYXRpb24gb2YgYmFzZTY0IHRoYXQgY2FuIHNhZmVseSBiZSB1c2VkIGluIFVSTHMgYW5kIGZpbGVuYW1lc1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJiYXNlNjR1cmxcIixcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGp3dChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiand0XCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihvcHRpb25zKSB9KTtcbiAgICB9XG4gICAgaXAob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImlwXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihvcHRpb25zKSB9KTtcbiAgICB9XG4gICAgY2lkcihvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiY2lkclwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucykgfSk7XG4gICAgfVxuICAgIGRhdGV0aW1lKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAgICAgIGtpbmQ6IFwiZGF0ZXRpbWVcIixcbiAgICAgICAgICAgICAgICBwcmVjaXNpb246IG51bGwsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBsb2NhbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogb3B0aW9ucyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImRhdGV0aW1lXCIsXG4gICAgICAgICAgICBwcmVjaXNpb246IHR5cGVvZiBvcHRpb25zPy5wcmVjaXNpb24gPT09IFwidW5kZWZpbmVkXCIgPyBudWxsIDogb3B0aW9ucz8ucHJlY2lzaW9uLFxuICAgICAgICAgICAgb2Zmc2V0OiBvcHRpb25zPy5vZmZzZXQgPz8gZmFsc2UsXG4gICAgICAgICAgICBsb2NhbDogb3B0aW9ucz8ubG9jYWwgPz8gZmFsc2UsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucz8ubWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBkYXRlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJkYXRlXCIsIG1lc3NhZ2UgfSk7XG4gICAgfVxuICAgIHRpbWUob3B0aW9ucykge1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICAgICAga2luZDogXCJ0aW1lXCIsXG4gICAgICAgICAgICAgICAgcHJlY2lzaW9uOiBudWxsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG9wdGlvbnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJ0aW1lXCIsXG4gICAgICAgICAgICBwcmVjaXNpb246IHR5cGVvZiBvcHRpb25zPy5wcmVjaXNpb24gPT09IFwidW5kZWZpbmVkXCIgPyBudWxsIDogb3B0aW9ucz8ucHJlY2lzaW9uLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG9wdGlvbnM/Lm1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZHVyYXRpb24obWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImR1cmF0aW9uXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgcmVnZXgocmVnZXgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwicmVnZXhcIixcbiAgICAgICAgICAgIHJlZ2V4OiByZWdleCxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGluY2x1ZGVzKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImluY2x1ZGVzXCIsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBwb3NpdGlvbjogb3B0aW9ucz8ucG9zaXRpb24sXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucz8ubWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdGFydHNXaXRoKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcInN0YXJ0c1dpdGhcIixcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVuZHNXaXRoKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImVuZHNXaXRoXCIsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtaW4obWluTGVuZ3RoLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IG1pbkxlbmd0aCxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1heChtYXhMZW5ndGgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICB2YWx1ZTogbWF4TGVuZ3RoLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbGVuZ3RoKGxlbiwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJsZW5ndGhcIixcbiAgICAgICAgICAgIHZhbHVlOiBsZW4sXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFcXVpdmFsZW50IHRvIGAubWluKDEpYFxuICAgICAqL1xuICAgIG5vbmVtcHR5KG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluKDEsIGVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSk7XG4gICAgfVxuICAgIHRyaW0oKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kU3RyaW5nKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogWy4uLnRoaXMuX2RlZi5jaGVja3MsIHsga2luZDogXCJ0cmltXCIgfV0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB0b0xvd2VyQ2FzZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTdHJpbmcoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgeyBraW5kOiBcInRvTG93ZXJDYXNlXCIgfV0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB0b1VwcGVyQ2FzZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTdHJpbmcoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgeyBraW5kOiBcInRvVXBwZXJDYXNlXCIgfV0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQgaXNEYXRldGltZSgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJkYXRldGltZVwiKTtcbiAgICB9XG4gICAgZ2V0IGlzRGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJkYXRlXCIpO1xuICAgIH1cbiAgICBnZXQgaXNUaW1lKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcInRpbWVcIik7XG4gICAgfVxuICAgIGdldCBpc0R1cmF0aW9uKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImR1cmF0aW9uXCIpO1xuICAgIH1cbiAgICBnZXQgaXNFbWFpbCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJlbWFpbFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzVVJMKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcInVybFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzRW1vamkoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiZW1vamlcIik7XG4gICAgfVxuICAgIGdldCBpc1VVSUQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwidXVpZFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzTkFOT0lEKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcIm5hbm9pZFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzQ1VJRCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJjdWlkXCIpO1xuICAgIH1cbiAgICBnZXQgaXNDVUlEMigpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJjdWlkMlwiKTtcbiAgICB9XG4gICAgZ2V0IGlzVUxJRCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJ1bGlkXCIpO1xuICAgIH1cbiAgICBnZXQgaXNJUCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJpcFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzQ0lEUigpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJjaWRyXCIpO1xuICAgIH1cbiAgICBnZXQgaXNCYXNlNjQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiYmFzZTY0XCIpO1xuICAgIH1cbiAgICBnZXQgaXNCYXNlNjR1cmwoKSB7XG4gICAgICAgIC8vIGJhc2U2NHVybCBlbmNvZGluZyBpcyBhIG1vZGlmaWNhdGlvbiBvZiBiYXNlNjQgdGhhdCBjYW4gc2FmZWx5IGJlIHVzZWQgaW4gVVJMcyBhbmQgZmlsZW5hbWVzXG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiYmFzZTY0dXJsXCIpO1xuICAgIH1cbiAgICBnZXQgbWluTGVuZ3RoKCkge1xuICAgICAgICBsZXQgbWluID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChtaW4gPT09IG51bGwgfHwgY2gudmFsdWUgPiBtaW4pXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtaW47XG4gICAgfVxuICAgIGdldCBtYXhMZW5ndGgoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9XG59XG5ab2RTdHJpbmcuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kU3RyaW5nKHtcbiAgICAgICAgY2hlY2tzOiBbXSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RTdHJpbmcsXG4gICAgICAgIGNvZXJjZTogcGFyYW1zPy5jb2VyY2UgPz8gZmFsc2UsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zOTY2NDg0L3doeS1kb2VzLW1vZHVsdXMtb3BlcmF0b3ItcmV0dXJuLWZyYWN0aW9uYWwtbnVtYmVyLWluLWphdmFzY3JpcHQvMzE3MTEwMzQjMzE3MTEwMzRcbmZ1bmN0aW9uIGZsb2F0U2FmZVJlbWFpbmRlcih2YWwsIHN0ZXApIHtcbiAgICBjb25zdCB2YWxEZWNDb3VudCA9ICh2YWwudG9TdHJpbmcoKS5zcGxpdChcIi5cIilbMV0gfHwgXCJcIikubGVuZ3RoO1xuICAgIGNvbnN0IHN0ZXBEZWNDb3VudCA9IChzdGVwLnRvU3RyaW5nKCkuc3BsaXQoXCIuXCIpWzFdIHx8IFwiXCIpLmxlbmd0aDtcbiAgICBjb25zdCBkZWNDb3VudCA9IHZhbERlY0NvdW50ID4gc3RlcERlY0NvdW50ID8gdmFsRGVjQ291bnQgOiBzdGVwRGVjQ291bnQ7XG4gICAgY29uc3QgdmFsSW50ID0gTnVtYmVyLnBhcnNlSW50KHZhbC50b0ZpeGVkKGRlY0NvdW50KS5yZXBsYWNlKFwiLlwiLCBcIlwiKSk7XG4gICAgY29uc3Qgc3RlcEludCA9IE51bWJlci5wYXJzZUludChzdGVwLnRvRml4ZWQoZGVjQ291bnQpLnJlcGxhY2UoXCIuXCIsIFwiXCIpKTtcbiAgICByZXR1cm4gKHZhbEludCAlIHN0ZXBJbnQpIC8gMTAgKiogZGVjQ291bnQ7XG59XG5leHBvcnQgY2xhc3MgWm9kTnVtYmVyIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMubWluID0gdGhpcy5ndGU7XG4gICAgICAgIHRoaXMubWF4ID0gdGhpcy5sdGU7XG4gICAgICAgIHRoaXMuc3RlcCA9IHRoaXMubXVsdGlwbGVPZjtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY29lcmNlKSB7XG4gICAgICAgICAgICBpbnB1dC5kYXRhID0gTnVtYmVyKGlucHV0LmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUubnVtYmVyKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm51bWJlcixcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjdHggPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IG5ldyBQYXJzZVN0YXR1cygpO1xuICAgICAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaGVjay5raW5kID09PSBcImludFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF1dGlsLmlzSW50ZWdlcihpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFwiaW50ZWdlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IFwiZmxvYXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBjaGVjay5pbmNsdXNpdmUgPyBpbnB1dC5kYXRhIDwgY2hlY2sudmFsdWUgOiBpbnB1dC5kYXRhIDw9IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29TbWFsbCkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiBjaGVjay5pbmNsdXNpdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb0JpZyA9IGNoZWNrLmluY2x1c2l2ZSA/IGlucHV0LmRhdGEgPiBjaGVjay52YWx1ZSA6IGlucHV0LmRhdGEgPj0gY2hlY2sudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHRvb0JpZykge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogY2hlY2suaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZsb2F0U2FmZVJlbWFpbmRlcihpbnB1dC5kYXRhLCBjaGVjay52YWx1ZSkgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLm5vdF9tdWx0aXBsZV9vZixcbiAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpcGxlT2Y6IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZmluaXRlXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUubm90X2Zpbml0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGNoZWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGlucHV0LmRhdGEgfTtcbiAgICB9XG4gICAgZ3RlKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWluXCIsIHZhbHVlLCB0cnVlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBndCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1pblwiLCB2YWx1ZSwgZmFsc2UsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIGx0ZSh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1heFwiLCB2YWx1ZSwgdHJ1ZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgbHQodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtYXhcIiwgdmFsdWUsIGZhbHNlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBzZXRMaW1pdChraW5kLCB2YWx1ZSwgaW5jbHVzaXZlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kTnVtYmVyKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogW1xuICAgICAgICAgICAgICAgIC4uLnRoaXMuX2RlZi5jaGVja3MsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBraW5kLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfYWRkQ2hlY2soY2hlY2spIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2ROdW1iZXIoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgY2hlY2tdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW50KG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwiaW50XCIsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IGZhbHNlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbmVnYXRpdmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtYXhcIixcbiAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbnBvc2l0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbm5lZ2F0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG11bHRpcGxlT2YodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibXVsdGlwbGVPZlwiLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZmluaXRlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwiZmluaXRlXCIsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzYWZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0IG1pblZhbHVlKCkge1xuICAgICAgICBsZXQgbWluID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChtaW4gPT09IG51bGwgfHwgY2gudmFsdWUgPiBtaW4pXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtaW47XG4gICAgfVxuICAgIGdldCBtYXhWYWx1ZSgpIHtcbiAgICAgICAgbGV0IG1heCA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWF4ID09PSBudWxsIHx8IGNoLnZhbHVlIDwgbWF4KVxuICAgICAgICAgICAgICAgICAgICBtYXggPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF4O1xuICAgIH1cbiAgICBnZXQgaXNJbnQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiaW50XCIgfHwgKGNoLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiICYmIHV0aWwuaXNJbnRlZ2VyKGNoLnZhbHVlKSkpO1xuICAgIH1cbiAgICBnZXQgaXNGaW5pdGUoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBsZXQgbWluID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJmaW5pdGVcIiB8fCBjaC5raW5kID09PSBcImludFwiIHx8IGNoLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaC5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pbiA9PT0gbnVsbCB8fCBjaC52YWx1ZSA+IG1pbilcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZShtaW4pICYmIE51bWJlci5pc0Zpbml0ZShtYXgpO1xuICAgIH1cbn1cblpvZE51bWJlci5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2ROdW1iZXIoe1xuICAgICAgICBjaGVja3M6IFtdLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE51bWJlcixcbiAgICAgICAgY29lcmNlOiBwYXJhbXM/LmNvZXJjZSB8fCBmYWxzZSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RCaWdJbnQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5taW4gPSB0aGlzLmd0ZTtcbiAgICAgICAgdGhpcy5tYXggPSB0aGlzLmx0ZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY29lcmNlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlucHV0LmRhdGEgPSBCaWdJbnQoaW5wdXQuZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldEludmFsaWRJbnB1dChpbnB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5iaWdpbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRJbnZhbGlkSW5wdXQoaW5wdXQpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjdHggPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IG5ldyBQYXJzZVN0YXR1cygpO1xuICAgICAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaGVjay5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBjaGVjay5pbmNsdXNpdmUgPyBpbnB1dC5kYXRhIDwgY2hlY2sudmFsdWUgOiBpbnB1dC5kYXRhIDw9IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29TbWFsbCkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJiaWdpbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiBjaGVjay5pbmNsdXNpdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb0JpZyA9IGNoZWNrLmluY2x1c2l2ZSA/IGlucHV0LmRhdGEgPiBjaGVjay52YWx1ZSA6IGlucHV0LmRhdGEgPj0gY2hlY2sudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHRvb0JpZykge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYmlnaW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogY2hlY2suaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEgJSBjaGVjay52YWx1ZSAhPT0gQmlnSW50KDApKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5ub3RfbXVsdGlwbGVfb2YsXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZU9mOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGNoZWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGlucHV0LmRhdGEgfTtcbiAgICB9XG4gICAgX2dldEludmFsaWRJbnB1dChpbnB1dCkge1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmJpZ2ludCxcbiAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgIH1cbiAgICBndGUodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtaW5cIiwgdmFsdWUsIHRydWUsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIGd0KHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWluXCIsIHZhbHVlLCBmYWxzZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgbHRlKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWF4XCIsIHZhbHVlLCB0cnVlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBsdCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1heFwiLCB2YWx1ZSwgZmFsc2UsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIHNldExpbWl0KGtpbmQsIHZhbHVlLCBpbmNsdXNpdmUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RCaWdJbnQoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbXG4gICAgICAgICAgICAgICAgLi4udGhpcy5fZGVmLmNoZWNrcyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtpbmQsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9hZGRDaGVjayhjaGVjaykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEJpZ0ludCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCBjaGVja10sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBuZWdhdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBub25wb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbm5lZ2F0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICB2YWx1ZTogQmlnSW50KDApLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbXVsdGlwbGVPZih2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtdWx0aXBsZU9mXCIsXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldCBtaW5WYWx1ZSgpIHtcbiAgICAgICAgbGV0IG1pbiA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWluID09PSBudWxsIHx8IGNoLnZhbHVlID4gbWluKVxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWluO1xuICAgIH1cbiAgICBnZXQgbWF4VmFsdWUoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9XG59XG5ab2RCaWdJbnQuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kQmlnSW50KHtcbiAgICAgICAgY2hlY2tzOiBbXSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RCaWdJbnQsXG4gICAgICAgIGNvZXJjZTogcGFyYW1zPy5jb2VyY2UgPz8gZmFsc2UsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kQm9vbGVhbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5fZGVmLmNvZXJjZSkge1xuICAgICAgICAgICAgaW5wdXQuZGF0YSA9IEJvb2xlYW4oaW5wdXQuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5ib29sZWFuKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmJvb2xlYW4sXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuWm9kQm9vbGVhbi5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RCb29sZWFuKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RCb29sZWFuLFxuICAgICAgICBjb2VyY2U6IHBhcmFtcz8uY29lcmNlIHx8IGZhbHNlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZERhdGUgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RlZi5jb2VyY2UpIHtcbiAgICAgICAgICAgIGlucHV0LmRhdGEgPSBuZXcgRGF0ZShpbnB1dC5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLmRhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuZGF0ZSxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmIChOdW1iZXIuaXNOYU4oaW5wdXQuZGF0YS5nZXRUaW1lKCkpKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9kYXRlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdGF0dXMgPSBuZXcgUGFyc2VTdGF0dXMoKTtcbiAgICAgICAgbGV0IGN0eCA9IHVuZGVmaW5lZDtcbiAgICAgICAgZm9yIChjb25zdCBjaGVjayBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2sua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5kYXRhLmdldFRpbWUoKSA8IGNoZWNrLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuZGF0YS5nZXRUaW1lKCkgPiBjaGVjay52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdXRpbC5hc3NlcnROZXZlcihjaGVjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLnZhbHVlLFxuICAgICAgICAgICAgdmFsdWU6IG5ldyBEYXRlKGlucHV0LmRhdGEuZ2V0VGltZSgpKSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgX2FkZENoZWNrKGNoZWNrKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRGF0ZSh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCBjaGVja10sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtaW4obWluRGF0ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtaW5cIixcbiAgICAgICAgICAgIHZhbHVlOiBtaW5EYXRlLmdldFRpbWUoKSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1heChtYXhEYXRlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IG1heERhdGUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0IG1pbkRhdGUoKSB7XG4gICAgICAgIGxldCBtaW4gPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pbiA9PT0gbnVsbCB8fCBjaC52YWx1ZSA+IG1pbilcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pbiAhPSBudWxsID8gbmV3IERhdGUobWluKSA6IG51bGw7XG4gICAgfVxuICAgIGdldCBtYXhEYXRlKCkge1xuICAgICAgICBsZXQgbWF4ID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGlmIChtYXggPT09IG51bGwgfHwgY2gudmFsdWUgPCBtYXgpXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXggIT0gbnVsbCA/IG5ldyBEYXRlKG1heCkgOiBudWxsO1xuICAgIH1cbn1cblpvZERhdGUuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kRGF0ZSh7XG4gICAgICAgIGNoZWNrczogW10sXG4gICAgICAgIGNvZXJjZTogcGFyYW1zPy5jb2VyY2UgfHwgZmFsc2UsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRGF0ZSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RTeW1ib2wgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5zeW1ib2wpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuc3ltYm9sLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZFN5bWJvbC5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RTeW1ib2woe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFN5bWJvbCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RVbmRlZmluZWQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS51bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZFVuZGVmaW5lZC5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RVbmRlZmluZWQoe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFVuZGVmaW5lZCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2ROdWxsIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUubnVsbCkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5udWxsLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZE51bGwuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTnVsbCh7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTnVsbCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RBbnkgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgLy8gdG8gcHJldmVudCBpbnN0YW5jZXMgb2Ygb3RoZXIgY2xhc3NlcyBmcm9tIGV4dGVuZGluZyBab2RBbnkuIHRoaXMgY2F1c2VzIGlzc3VlcyB3aXRoIGNhdGNoYWxsIGluIFpvZE9iamVjdC5cbiAgICAgICAgdGhpcy5fYW55ID0gdHJ1ZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG59XG5ab2RBbnkuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kQW55KHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RBbnksXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kVW5rbm93biBleHRlbmRzIFpvZFR5cGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICAvLyByZXF1aXJlZFxuICAgICAgICB0aGlzLl91bmtub3duID0gdHJ1ZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG59XG5ab2RVbmtub3duLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFVua25vd24oe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFVua25vd24sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kTmV2ZXIgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5uZXZlcixcbiAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgIH1cbn1cblpvZE5ldmVyLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE5ldmVyKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2ROZXZlcixcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RWb2lkIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLnZvaWQsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuWm9kVm9pZC5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RWb2lkKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RWb2lkLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZEFycmF5IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4LCBzdGF0dXMgfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGRlZiA9IHRoaXMuX2RlZjtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLmFycmF5KSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmFycmF5LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZi5leGFjdExlbmd0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgdG9vQmlnID0gY3R4LmRhdGEubGVuZ3RoID4gZGVmLmV4YWN0TGVuZ3RoLnZhbHVlO1xuICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBjdHguZGF0YS5sZW5ndGggPCBkZWYuZXhhY3RMZW5ndGgudmFsdWU7XG4gICAgICAgICAgICBpZiAodG9vQmlnIHx8IHRvb1NtYWxsKSB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IHRvb0JpZyA/IFpvZElzc3VlQ29kZS50b29fYmlnIDogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgbWluaW11bTogKHRvb1NtYWxsID8gZGVmLmV4YWN0TGVuZ3RoLnZhbHVlIDogdW5kZWZpbmVkKSxcbiAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogKHRvb0JpZyA/IGRlZi5leGFjdExlbmd0aC52YWx1ZSA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGVmLmV4YWN0TGVuZ3RoLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZi5taW5MZW5ndGggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjdHguZGF0YS5sZW5ndGggPCBkZWYubWluTGVuZ3RoLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGRlZi5taW5MZW5ndGgudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5taW5MZW5ndGgubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVmLm1heExlbmd0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGN0eC5kYXRhLmxlbmd0aCA+IGRlZi5tYXhMZW5ndGgudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgIG1heGltdW06IGRlZi5tYXhMZW5ndGgudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5tYXhMZW5ndGgubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFsuLi5jdHguZGF0YV0ubWFwKChpdGVtLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZi50eXBlLl9wYXJzZUFzeW5jKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBpdGVtLCBjdHgucGF0aCwgaSkpO1xuICAgICAgICAgICAgfSkpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgcmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFsuLi5jdHguZGF0YV0ubWFwKChpdGVtLCBpKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZGVmLnR5cGUuX3BhcnNlU3luYyhuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgaXRlbSwgY3R4LnBhdGgsIGkpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgcmVzdWx0KTtcbiAgICB9XG4gICAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudHlwZTtcbiAgICB9XG4gICAgbWluKG1pbkxlbmd0aCwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEFycmF5KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIG1pbkxlbmd0aDogeyB2YWx1ZTogbWluTGVuZ3RoLCBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1heChtYXhMZW5ndGgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RBcnJheSh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBtYXhMZW5ndGg6IHsgdmFsdWU6IG1heExlbmd0aCwgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBsZW5ndGgobGVuLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQXJyYXkoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgZXhhY3RMZW5ndGg6IHsgdmFsdWU6IGxlbiwgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBub25lbXB0eShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbigxLCBtZXNzYWdlKTtcbiAgICB9XG59XG5ab2RBcnJheS5jcmVhdGUgPSAoc2NoZW1hLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEFycmF5KHtcbiAgICAgICAgdHlwZTogc2NoZW1hLFxuICAgICAgICBtaW5MZW5ndGg6IG51bGwsXG4gICAgICAgIG1heExlbmd0aDogbnVsbCxcbiAgICAgICAgZXhhY3RMZW5ndGg6IG51bGwsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQXJyYXksXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5mdW5jdGlvbiBkZWVwUGFydGlhbGlmeShzY2hlbWEpIHtcbiAgICBpZiAoc2NoZW1hIGluc3RhbmNlb2YgWm9kT2JqZWN0KSB7XG4gICAgICAgIGNvbnN0IG5ld1NoYXBlID0ge307XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNjaGVtYS5zaGFwZSkge1xuICAgICAgICAgICAgY29uc3QgZmllbGRTY2hlbWEgPSBzY2hlbWEuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIG5ld1NoYXBlW2tleV0gPSBab2RPcHRpb25hbC5jcmVhdGUoZGVlcFBhcnRpYWxpZnkoZmllbGRTY2hlbWEpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi5zY2hlbWEuX2RlZixcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiBuZXdTaGFwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHNjaGVtYSBpbnN0YW5jZW9mIFpvZEFycmF5KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQXJyYXkoe1xuICAgICAgICAgICAgLi4uc2NoZW1hLl9kZWYsXG4gICAgICAgICAgICB0eXBlOiBkZWVwUGFydGlhbGlmeShzY2hlbWEuZWxlbWVudCksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2RPcHRpb25hbCkge1xuICAgICAgICByZXR1cm4gWm9kT3B0aW9uYWwuY3JlYXRlKGRlZXBQYXJ0aWFsaWZ5KHNjaGVtYS51bndyYXAoKSkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2ROdWxsYWJsZSkge1xuICAgICAgICByZXR1cm4gWm9kTnVsbGFibGUuY3JlYXRlKGRlZXBQYXJ0aWFsaWZ5KHNjaGVtYS51bndyYXAoKSkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2RUdXBsZSkge1xuICAgICAgICByZXR1cm4gWm9kVHVwbGUuY3JlYXRlKHNjaGVtYS5pdGVtcy5tYXAoKGl0ZW0pID0+IGRlZXBQYXJ0aWFsaWZ5KGl0ZW0pKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gc2NoZW1hO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RPYmplY3QgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5fY2FjaGVkID0gbnVsbDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBkZXByZWNhdGVkIEluIG1vc3QgY2FzZXMsIHRoaXMgaXMgbm8gbG9uZ2VyIG5lZWRlZCAtIHVua25vd24gcHJvcGVydGllcyBhcmUgbm93IHNpbGVudGx5IHN0cmlwcGVkLlxuICAgICAgICAgKiBJZiB5b3Ugd2FudCB0byBwYXNzIHRocm91Z2ggdW5rbm93biBwcm9wZXJ0aWVzLCB1c2UgYC5wYXNzdGhyb3VnaCgpYCBpbnN0ZWFkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ub25zdHJpY3QgPSB0aGlzLnBhc3N0aHJvdWdoO1xuICAgICAgICAvLyBleHRlbmQ8XG4gICAgICAgIC8vICAgQXVnbWVudGF0aW9uIGV4dGVuZHMgWm9kUmF3U2hhcGUsXG4gICAgICAgIC8vICAgTmV3T3V0cHV0IGV4dGVuZHMgdXRpbC5mbGF0dGVuPHtcbiAgICAgICAgLy8gICAgIFtrIGluIGtleW9mIEF1Z21lbnRhdGlvbiB8IGtleW9mIE91dHB1dF06IGsgZXh0ZW5kcyBrZXlvZiBBdWdtZW50YXRpb25cbiAgICAgICAgLy8gICAgICAgPyBBdWdtZW50YXRpb25ba11bXCJfb3V0cHV0XCJdXG4gICAgICAgIC8vICAgICAgIDogayBleHRlbmRzIGtleW9mIE91dHB1dFxuICAgICAgICAvLyAgICAgICA/IE91dHB1dFtrXVxuICAgICAgICAvLyAgICAgICA6IG5ldmVyO1xuICAgICAgICAvLyAgIH0+LFxuICAgICAgICAvLyAgIE5ld0lucHV0IGV4dGVuZHMgdXRpbC5mbGF0dGVuPHtcbiAgICAgICAgLy8gICAgIFtrIGluIGtleW9mIEF1Z21lbnRhdGlvbiB8IGtleW9mIElucHV0XTogayBleHRlbmRzIGtleW9mIEF1Z21lbnRhdGlvblxuICAgICAgICAvLyAgICAgICA/IEF1Z21lbnRhdGlvbltrXVtcIl9pbnB1dFwiXVxuICAgICAgICAvLyAgICAgICA6IGsgZXh0ZW5kcyBrZXlvZiBJbnB1dFxuICAgICAgICAvLyAgICAgICA/IElucHV0W2tdXG4gICAgICAgIC8vICAgICAgIDogbmV2ZXI7XG4gICAgICAgIC8vICAgfT5cbiAgICAgICAgLy8gPihcbiAgICAgICAgLy8gICBhdWdtZW50YXRpb246IEF1Z21lbnRhdGlvblxuICAgICAgICAvLyApOiBab2RPYmplY3Q8XG4gICAgICAgIC8vICAgZXh0ZW5kU2hhcGU8VCwgQXVnbWVudGF0aW9uPixcbiAgICAgICAgLy8gICBVbmtub3duS2V5cyxcbiAgICAgICAgLy8gICBDYXRjaGFsbCxcbiAgICAgICAgLy8gICBOZXdPdXRwdXQsXG4gICAgICAgIC8vICAgTmV3SW5wdXRcbiAgICAgICAgLy8gPiB7XG4gICAgICAgIC8vICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAvLyAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAvLyAgICAgc2hhcGU6ICgpID0+ICh7XG4gICAgICAgIC8vICAgICAgIC4uLnRoaXMuX2RlZi5zaGFwZSgpLFxuICAgICAgICAvLyAgICAgICAuLi5hdWdtZW50YXRpb24sXG4gICAgICAgIC8vICAgICB9KSxcbiAgICAgICAgLy8gICB9KSBhcyBhbnk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBkZXByZWNhdGVkIFVzZSBgLmV4dGVuZGAgaW5zdGVhZFxuICAgICAgICAgKiAgKi9cbiAgICAgICAgdGhpcy5hdWdtZW50ID0gdGhpcy5leHRlbmQ7XG4gICAgfVxuICAgIF9nZXRDYWNoZWQoKSB7XG4gICAgICAgIGlmICh0aGlzLl9jYWNoZWQgIT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkO1xuICAgICAgICBjb25zdCBzaGFwZSA9IHRoaXMuX2RlZi5zaGFwZSgpO1xuICAgICAgICBjb25zdCBrZXlzID0gdXRpbC5vYmplY3RLZXlzKHNoYXBlKTtcbiAgICAgICAgdGhpcy5fY2FjaGVkID0geyBzaGFwZSwga2V5cyB9O1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5vYmplY3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUub2JqZWN0LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3QgeyBzaGFwZSwga2V5czogc2hhcGVLZXlzIH0gPSB0aGlzLl9nZXRDYWNoZWQoKTtcbiAgICAgICAgY29uc3QgZXh0cmFLZXlzID0gW107XG4gICAgICAgIGlmICghKHRoaXMuX2RlZi5jYXRjaGFsbCBpbnN0YW5jZW9mIFpvZE5ldmVyICYmIHRoaXMuX2RlZi51bmtub3duS2V5cyA9PT0gXCJzdHJpcFwiKSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gY3R4LmRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNoYXBlS2V5cy5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dHJhS2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhaXJzID0gW107XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHNoYXBlS2V5cykge1xuICAgICAgICAgICAgY29uc3Qga2V5VmFsaWRhdG9yID0gc2hhcGVba2V5XTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY3R4LmRhdGFba2V5XTtcbiAgICAgICAgICAgIHBhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgIGtleTogeyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGtleSB9LFxuICAgICAgICAgICAgICAgIHZhbHVlOiBrZXlWYWxpZGF0b3IuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCB2YWx1ZSwgY3R4LnBhdGgsIGtleSkpLFxuICAgICAgICAgICAgICAgIGFsd2F5c1NldDoga2V5IGluIGN0eC5kYXRhLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2RlZi5jYXRjaGFsbCBpbnN0YW5jZW9mIFpvZE5ldmVyKSB7XG4gICAgICAgICAgICBjb25zdCB1bmtub3duS2V5cyA9IHRoaXMuX2RlZi51bmtub3duS2V5cztcbiAgICAgICAgICAgIGlmICh1bmtub3duS2V5cyA9PT0gXCJwYXNzdGhyb3VnaFwiKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgZXh0cmFLZXlzKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiB7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZToga2V5IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogeyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGN0eC5kYXRhW2tleV0gfSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodW5rbm93bktleXMgPT09IFwic3RyaWN0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXh0cmFLZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudW5yZWNvZ25pemVkX2tleXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlzOiBleHRyYUtleXMsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh1bmtub3duS2V5cyA9PT0gXCJzdHJpcFwiKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludGVybmFsIFpvZE9iamVjdCBlcnJvcjogaW52YWxpZCB1bmtub3duS2V5cyB2YWx1ZS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHJ1biBjYXRjaGFsbCB2YWxpZGF0aW9uXG4gICAgICAgICAgICBjb25zdCBjYXRjaGFsbCA9IHRoaXMuX2RlZi5jYXRjaGFsbDtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGV4dHJhS2V5cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY3R4LmRhdGFba2V5XTtcbiAgICAgICAgICAgICAgICBwYWlycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiB7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZToga2V5IH0sXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjYXRjaGFsbC5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIHZhbHVlLCBjdHgucGF0aCwga2V5KSAvLywgY3R4LmNoaWxkKGtleSksIHZhbHVlLCBnZXRQYXJzZWRUeXBlKHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBhbHdheXNTZXQ6IGtleSBpbiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgICAgICAgLnRoZW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN5bmNQYWlycyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBwYWlyLmtleTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBhd2FpdCBwYWlyLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBzeW5jUGFpcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsd2F5c1NldDogcGFpci5hbHdheXNTZXQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gc3luY1BhaXJzO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbigoc3luY1BhaXJzKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFBhcnNlU3RhdHVzLm1lcmdlT2JqZWN0U3luYyhzdGF0dXMsIHN5bmNQYWlycyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZU9iamVjdFN5bmMoc3RhdHVzLCBwYWlycyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IHNoYXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnNoYXBlKCk7XG4gICAgfVxuICAgIHN0cmljdChtZXNzYWdlKSB7XG4gICAgICAgIGVycm9yVXRpbC5lcnJUb09iajtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgdW5rbm93bktleXM6IFwic3RyaWN0XCIsXG4gICAgICAgICAgICAuLi4obWVzc2FnZSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWFwOiAoaXNzdWUsIGN0eCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVmYXVsdEVycm9yID0gdGhpcy5fZGVmLmVycm9yTWFwPy4oaXNzdWUsIGN0eCkubWVzc2FnZSA/PyBjdHguZGVmYXVsdEVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzc3VlLmNvZGUgPT09IFwidW5yZWNvZ25pemVkX2tleXNcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkubWVzc2FnZSA/PyBkZWZhdWx0RXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGVmYXVsdEVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgOiB7fSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdHJpcCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgdW5rbm93bktleXM6IFwic3RyaXBcIixcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBhc3N0aHJvdWdoKCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICB1bmtub3duS2V5czogXCJwYXNzdGhyb3VnaFwiLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gY29uc3QgQXVnbWVudEZhY3RvcnkgPVxuICAgIC8vICAgPERlZiBleHRlbmRzIFpvZE9iamVjdERlZj4oZGVmOiBEZWYpID0+XG4gICAgLy8gICA8QXVnbWVudGF0aW9uIGV4dGVuZHMgWm9kUmF3U2hhcGU+KFxuICAgIC8vICAgICBhdWdtZW50YXRpb246IEF1Z21lbnRhdGlvblxuICAgIC8vICAgKTogWm9kT2JqZWN0PFxuICAgIC8vICAgICBleHRlbmRTaGFwZTxSZXR1cm5UeXBlPERlZltcInNoYXBlXCJdPiwgQXVnbWVudGF0aW9uPixcbiAgICAvLyAgICAgRGVmW1widW5rbm93bktleXNcIl0sXG4gICAgLy8gICAgIERlZltcImNhdGNoYWxsXCJdXG4gICAgLy8gICA+ID0+IHtcbiAgICAvLyAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgIC8vICAgICAgIC4uLmRlZixcbiAgICAvLyAgICAgICBzaGFwZTogKCkgPT4gKHtcbiAgICAvLyAgICAgICAgIC4uLmRlZi5zaGFwZSgpLFxuICAgIC8vICAgICAgICAgLi4uYXVnbWVudGF0aW9uLFxuICAgIC8vICAgICAgIH0pLFxuICAgIC8vICAgICB9KSBhcyBhbnk7XG4gICAgLy8gICB9O1xuICAgIGV4dGVuZChhdWdtZW50YXRpb24pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+ICh7XG4gICAgICAgICAgICAgICAgLi4udGhpcy5fZGVmLnNoYXBlKCksXG4gICAgICAgICAgICAgICAgLi4uYXVnbWVudGF0aW9uLFxuICAgICAgICAgICAgfSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcmlvciB0byB6b2RAMS4wLjEyIHRoZXJlIHdhcyBhIGJ1ZyBpbiB0aGVcbiAgICAgKiBpbmZlcnJlZCB0eXBlIG9mIG1lcmdlZCBvYmplY3RzLiBQbGVhc2VcbiAgICAgKiB1cGdyYWRlIGlmIHlvdSBhcmUgZXhwZXJpZW5jaW5nIGlzc3Vlcy5cbiAgICAgKi9cbiAgICBtZXJnZShtZXJnaW5nKSB7XG4gICAgICAgIGNvbnN0IG1lcmdlZCA9IG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgdW5rbm93bktleXM6IG1lcmdpbmcuX2RlZi51bmtub3duS2V5cyxcbiAgICAgICAgICAgIGNhdGNoYWxsOiBtZXJnaW5nLl9kZWYuY2F0Y2hhbGwsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi50aGlzLl9kZWYuc2hhcGUoKSxcbiAgICAgICAgICAgICAgICAuLi5tZXJnaW5nLl9kZWYuc2hhcGUoKSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbWVyZ2VkO1xuICAgIH1cbiAgICAvLyBtZXJnZTxcbiAgICAvLyAgIEluY29taW5nIGV4dGVuZHMgQW55Wm9kT2JqZWN0LFxuICAgIC8vICAgQXVnbWVudGF0aW9uIGV4dGVuZHMgSW5jb21pbmdbXCJzaGFwZVwiXSxcbiAgICAvLyAgIE5ld091dHB1dCBleHRlbmRzIHtcbiAgICAvLyAgICAgW2sgaW4ga2V5b2YgQXVnbWVudGF0aW9uIHwga2V5b2YgT3V0cHV0XTogayBleHRlbmRzIGtleW9mIEF1Z21lbnRhdGlvblxuICAgIC8vICAgICAgID8gQXVnbWVudGF0aW9uW2tdW1wiX291dHB1dFwiXVxuICAgIC8vICAgICAgIDogayBleHRlbmRzIGtleW9mIE91dHB1dFxuICAgIC8vICAgICAgID8gT3V0cHV0W2tdXG4gICAgLy8gICAgICAgOiBuZXZlcjtcbiAgICAvLyAgIH0sXG4gICAgLy8gICBOZXdJbnB1dCBleHRlbmRzIHtcbiAgICAvLyAgICAgW2sgaW4ga2V5b2YgQXVnbWVudGF0aW9uIHwga2V5b2YgSW5wdXRdOiBrIGV4dGVuZHMga2V5b2YgQXVnbWVudGF0aW9uXG4gICAgLy8gICAgICAgPyBBdWdtZW50YXRpb25ba11bXCJfaW5wdXRcIl1cbiAgICAvLyAgICAgICA6IGsgZXh0ZW5kcyBrZXlvZiBJbnB1dFxuICAgIC8vICAgICAgID8gSW5wdXRba11cbiAgICAvLyAgICAgICA6IG5ldmVyO1xuICAgIC8vICAgfVxuICAgIC8vID4oXG4gICAgLy8gICBtZXJnaW5nOiBJbmNvbWluZ1xuICAgIC8vICk6IFpvZE9iamVjdDxcbiAgICAvLyAgIGV4dGVuZFNoYXBlPFQsIFJldHVyblR5cGU8SW5jb21pbmdbXCJfZGVmXCJdW1wic2hhcGVcIl0+PixcbiAgICAvLyAgIEluY29taW5nW1wiX2RlZlwiXVtcInVua25vd25LZXlzXCJdLFxuICAgIC8vICAgSW5jb21pbmdbXCJfZGVmXCJdW1wiY2F0Y2hhbGxcIl0sXG4gICAgLy8gICBOZXdPdXRwdXQsXG4gICAgLy8gICBOZXdJbnB1dFxuICAgIC8vID4ge1xuICAgIC8vICAgY29uc3QgbWVyZ2VkOiBhbnkgPSBuZXcgWm9kT2JqZWN0KHtcbiAgICAvLyAgICAgdW5rbm93bktleXM6IG1lcmdpbmcuX2RlZi51bmtub3duS2V5cyxcbiAgICAvLyAgICAgY2F0Y2hhbGw6IG1lcmdpbmcuX2RlZi5jYXRjaGFsbCxcbiAgICAvLyAgICAgc2hhcGU6ICgpID0+XG4gICAgLy8gICAgICAgb2JqZWN0VXRpbC5tZXJnZVNoYXBlcyh0aGlzLl9kZWYuc2hhcGUoKSwgbWVyZ2luZy5fZGVmLnNoYXBlKCkpLFxuICAgIC8vICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9iamVjdCxcbiAgICAvLyAgIH0pIGFzIGFueTtcbiAgICAvLyAgIHJldHVybiBtZXJnZWQ7XG4gICAgLy8gfVxuICAgIHNldEtleShrZXksIHNjaGVtYSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdWdtZW50KHsgW2tleV06IHNjaGVtYSB9KTtcbiAgICB9XG4gICAgLy8gbWVyZ2U8SW5jb21pbmcgZXh0ZW5kcyBBbnlab2RPYmplY3Q+KFxuICAgIC8vICAgbWVyZ2luZzogSW5jb21pbmdcbiAgICAvLyApOiAvL1pvZE9iamVjdDxUICYgSW5jb21pbmdbXCJfc2hhcGVcIl0sIFVua25vd25LZXlzLCBDYXRjaGFsbD4gPSAobWVyZ2luZykgPT4ge1xuICAgIC8vIFpvZE9iamVjdDxcbiAgICAvLyAgIGV4dGVuZFNoYXBlPFQsIFJldHVyblR5cGU8SW5jb21pbmdbXCJfZGVmXCJdW1wic2hhcGVcIl0+PixcbiAgICAvLyAgIEluY29taW5nW1wiX2RlZlwiXVtcInVua25vd25LZXlzXCJdLFxuICAgIC8vICAgSW5jb21pbmdbXCJfZGVmXCJdW1wiY2F0Y2hhbGxcIl1cbiAgICAvLyA+IHtcbiAgICAvLyAgIC8vIGNvbnN0IG1lcmdlZFNoYXBlID0gb2JqZWN0VXRpbC5tZXJnZVNoYXBlcyhcbiAgICAvLyAgIC8vICAgdGhpcy5fZGVmLnNoYXBlKCksXG4gICAgLy8gICAvLyAgIG1lcmdpbmcuX2RlZi5zaGFwZSgpXG4gICAgLy8gICAvLyApO1xuICAgIC8vICAgY29uc3QgbWVyZ2VkOiBhbnkgPSBuZXcgWm9kT2JqZWN0KHtcbiAgICAvLyAgICAgdW5rbm93bktleXM6IG1lcmdpbmcuX2RlZi51bmtub3duS2V5cyxcbiAgICAvLyAgICAgY2F0Y2hhbGw6IG1lcmdpbmcuX2RlZi5jYXRjaGFsbCxcbiAgICAvLyAgICAgc2hhcGU6ICgpID0+XG4gICAgLy8gICAgICAgb2JqZWN0VXRpbC5tZXJnZVNoYXBlcyh0aGlzLl9kZWYuc2hhcGUoKSwgbWVyZ2luZy5fZGVmLnNoYXBlKCkpLFxuICAgIC8vICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9iamVjdCxcbiAgICAvLyAgIH0pIGFzIGFueTtcbiAgICAvLyAgIHJldHVybiBtZXJnZWQ7XG4gICAgLy8gfVxuICAgIGNhdGNoYWxsKGluZGV4KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNhdGNoYWxsOiBpbmRleCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBpY2sobWFzaykge1xuICAgICAgICBjb25zdCBzaGFwZSA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB1dGlsLm9iamVjdEtleXMobWFzaykpIHtcbiAgICAgICAgICAgIGlmIChtYXNrW2tleV0gJiYgdGhpcy5zaGFwZVtrZXldKSB7XG4gICAgICAgICAgICAgICAgc2hhcGVba2V5XSA9IHRoaXMuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gc2hhcGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBvbWl0KG1hc2spIHtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdXRpbC5vYmplY3RLZXlzKHRoaXMuc2hhcGUpKSB7XG4gICAgICAgICAgICBpZiAoIW1hc2tba2V5XSkge1xuICAgICAgICAgICAgICAgIHNoYXBlW2tleV0gPSB0aGlzLnNoYXBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+IHNoYXBlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICBkZWVwUGFydGlhbCgpIHtcbiAgICAgICAgcmV0dXJuIGRlZXBQYXJ0aWFsaWZ5KHRoaXMpO1xuICAgIH1cbiAgICBwYXJ0aWFsKG1hc2spIHtcbiAgICAgICAgY29uc3QgbmV3U2hhcGUgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdXRpbC5vYmplY3RLZXlzKHRoaXMuc2hhcGUpKSB7XG4gICAgICAgICAgICBjb25zdCBmaWVsZFNjaGVtYSA9IHRoaXMuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIGlmIChtYXNrICYmICFtYXNrW2tleV0pIHtcbiAgICAgICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gZmllbGRTY2hlbWE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gZmllbGRTY2hlbWEub3B0aW9uYWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gbmV3U2hhcGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXF1aXJlZChtYXNrKSB7XG4gICAgICAgIGNvbnN0IG5ld1NoYXBlID0ge307XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHV0aWwub2JqZWN0S2V5cyh0aGlzLnNoYXBlKSkge1xuICAgICAgICAgICAgaWYgKG1hc2sgJiYgIW1hc2tba2V5XSkge1xuICAgICAgICAgICAgICAgIG5ld1NoYXBlW2tleV0gPSB0aGlzLnNoYXBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWVsZFNjaGVtYSA9IHRoaXMuc2hhcGVba2V5XTtcbiAgICAgICAgICAgICAgICBsZXQgbmV3RmllbGQgPSBmaWVsZFNjaGVtYTtcbiAgICAgICAgICAgICAgICB3aGlsZSAobmV3RmllbGQgaW5zdGFuY2VvZiBab2RPcHRpb25hbCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdGaWVsZCA9IG5ld0ZpZWxkLl9kZWYuaW5uZXJUeXBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gbmV3RmllbGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+IG5ld1NoYXBlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAga2V5b2YoKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVab2RFbnVtKHV0aWwub2JqZWN0S2V5cyh0aGlzLnNoYXBlKSk7XG4gICAgfVxufVxuWm9kT2JqZWN0LmNyZWF0ZSA9IChzaGFwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICBzaGFwZTogKCkgPT4gc2hhcGUsXG4gICAgICAgIHVua25vd25LZXlzOiBcInN0cmlwXCIsXG4gICAgICAgIGNhdGNoYWxsOiBab2ROZXZlci5jcmVhdGUoKSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5ab2RPYmplY3Quc3RyaWN0Q3JlYXRlID0gKHNoYXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgIHNoYXBlOiAoKSA9PiBzaGFwZSxcbiAgICAgICAgdW5rbm93bktleXM6IFwic3RyaWN0XCIsXG4gICAgICAgIGNhdGNoYWxsOiBab2ROZXZlci5jcmVhdGUoKSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5ab2RPYmplY3QubGF6eWNyZWF0ZSA9IChzaGFwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICBzaGFwZSxcbiAgICAgICAgdW5rbm93bktleXM6IFwic3RyaXBcIixcbiAgICAgICAgY2F0Y2hhbGw6IFpvZE5ldmVyLmNyZWF0ZSgpLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9iamVjdCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RVbmlvbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX2RlZi5vcHRpb25zO1xuICAgICAgICBmdW5jdGlvbiBoYW5kbGVSZXN1bHRzKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIC8vIHJldHVybiBmaXJzdCBpc3N1ZS1mcmVlIHZhbGlkYXRpb24gaWYgaXQgZXhpc3RzXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5yZXN1bHQuc3RhdHVzID09PSBcInZhbGlkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQucmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCBpc3N1ZXMgZnJvbSBkaXJ0eSBvcHRpb25cbiAgICAgICAgICAgICAgICAgICAgY3R4LmNvbW1vbi5pc3N1ZXMucHVzaCguLi5yZXN1bHQuY3R4LmNvbW1vbi5pc3N1ZXMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LnJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZXR1cm4gaW52YWxpZFxuICAgICAgICAgICAgY29uc3QgdW5pb25FcnJvcnMgPSByZXN1bHRzLm1hcCgocmVzdWx0KSA9PiBuZXcgWm9kRXJyb3IocmVzdWx0LmN0eC5jb21tb24uaXNzdWVzKSk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbixcbiAgICAgICAgICAgICAgICB1bmlvbkVycm9ycyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChvcHRpb25zLm1hcChhc3luYyAob3B0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRDdHggPSB7XG4gICAgICAgICAgICAgICAgICAgIC4uLmN0eCxcbiAgICAgICAgICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5jdHguY29tbW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBudWxsLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBhd2FpdCBvcHRpb24uX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogY2hpbGRDdHgsXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBjdHg6IGNoaWxkQ3R4LFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSkudGhlbihoYW5kbGVSZXN1bHRzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBkaXJ0eSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGNvbnN0IGlzc3VlcyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2Ygb3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkQ3R4ID0ge1xuICAgICAgICAgICAgICAgICAgICAuLi5jdHgsXG4gICAgICAgICAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uY3R4LmNvbW1vbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogbnVsbCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG9wdGlvbi5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGNoaWxkQ3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBcInZhbGlkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiICYmICFkaXJ0eSkge1xuICAgICAgICAgICAgICAgICAgICBkaXJ0eSA9IHsgcmVzdWx0LCBjdHg6IGNoaWxkQ3R4IH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjaGlsZEN0eC5jb21tb24uaXNzdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBpc3N1ZXMucHVzaChjaGlsZEN0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGlydHkpIHtcbiAgICAgICAgICAgICAgICBjdHguY29tbW9uLmlzc3Vlcy5wdXNoKC4uLmRpcnR5LmN0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlydHkucmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdW5pb25FcnJvcnMgPSBpc3N1ZXMubWFwKChpc3N1ZXMpID0+IG5ldyBab2RFcnJvcihpc3N1ZXMpKTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3VuaW9uLFxuICAgICAgICAgICAgICAgIHVuaW9uRXJyb3JzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgb3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vcHRpb25zO1xuICAgIH1cbn1cblpvZFVuaW9uLmNyZWF0ZSA9ICh0eXBlcywgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RVbmlvbih7XG4gICAgICAgIG9wdGlvbnM6IHR5cGVzLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFVuaW9uLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vLy8vLy8vL1xuLy8vLy8vLy8vLyAgICAgIFpvZERpc2NyaW1pbmF0ZWRVbmlvbiAgICAgIC8vLy8vLy8vLy9cbi8vLy8vLy8vLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmNvbnN0IGdldERpc2NyaW1pbmF0b3IgPSAodHlwZSkgPT4ge1xuICAgIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTGF6eSkge1xuICAgICAgICByZXR1cm4gZ2V0RGlzY3JpbWluYXRvcih0eXBlLnNjaGVtYSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RFZmZlY3RzKSB7XG4gICAgICAgIHJldHVybiBnZXREaXNjcmltaW5hdG9yKHR5cGUuaW5uZXJUeXBlKCkpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTGl0ZXJhbCkge1xuICAgICAgICByZXR1cm4gW3R5cGUudmFsdWVdO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kRW51bSkge1xuICAgICAgICByZXR1cm4gdHlwZS5vcHRpb25zO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTmF0aXZlRW51bSkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgYmFuL2JhblxuICAgICAgICByZXR1cm4gdXRpbC5vYmplY3RWYWx1ZXModHlwZS5lbnVtKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZERlZmF1bHQpIHtcbiAgICAgICAgcmV0dXJuIGdldERpc2NyaW1pbmF0b3IodHlwZS5fZGVmLmlubmVyVHlwZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RVbmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIFt1bmRlZmluZWRdO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTnVsbCkge1xuICAgICAgICByZXR1cm4gW251bGxdO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kT3B0aW9uYWwpIHtcbiAgICAgICAgcmV0dXJuIFt1bmRlZmluZWQsIC4uLmdldERpc2NyaW1pbmF0b3IodHlwZS51bndyYXAoKSldO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTnVsbGFibGUpIHtcbiAgICAgICAgcmV0dXJuIFtudWxsLCAuLi5nZXREaXNjcmltaW5hdG9yKHR5cGUudW53cmFwKCkpXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZEJyYW5kZWQpIHtcbiAgICAgICAgcmV0dXJuIGdldERpc2NyaW1pbmF0b3IodHlwZS51bndyYXAoKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RSZWFkb25seSkge1xuICAgICAgICByZXR1cm4gZ2V0RGlzY3JpbWluYXRvcih0eXBlLnVud3JhcCgpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZENhdGNoKSB7XG4gICAgICAgIHJldHVybiBnZXREaXNjcmltaW5hdG9yKHR5cGUuX2RlZi5pbm5lclR5cGUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbn07XG5leHBvcnQgY2xhc3MgWm9kRGlzY3JpbWluYXRlZFVuaW9uIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUub2JqZWN0KSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm9iamVjdCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRpc2NyaW1pbmF0b3IgPSB0aGlzLmRpc2NyaW1pbmF0b3I7XG4gICAgICAgIGNvbnN0IGRpc2NyaW1pbmF0b3JWYWx1ZSA9IGN0eC5kYXRhW2Rpc2NyaW1pbmF0b3JdO1xuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLm9wdGlvbnNNYXAuZ2V0KGRpc2NyaW1pbmF0b3JWYWx1ZSk7XG4gICAgICAgIGlmICghb3B0aW9uKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbl9kaXNjcmltaW5hdG9yLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IEFycmF5LmZyb20odGhpcy5vcHRpb25zTWFwLmtleXMoKSksXG4gICAgICAgICAgICAgICAgcGF0aDogW2Rpc2NyaW1pbmF0b3JdLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb24uX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgZGlzY3JpbWluYXRvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5kaXNjcmltaW5hdG9yO1xuICAgIH1cbiAgICBnZXQgb3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vcHRpb25zO1xuICAgIH1cbiAgICBnZXQgb3B0aW9uc01hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vcHRpb25zTWFwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGUgY29uc3RydWN0b3Igb2YgdGhlIGRpc2NyaW1pbmF0ZWQgdW5pb24gc2NoZW1hLiBJdHMgYmVoYXZpb3VyIGlzIHZlcnkgc2ltaWxhciB0byB0aGF0IG9mIHRoZSBub3JtYWwgei51bmlvbigpIGNvbnN0cnVjdG9yLlxuICAgICAqIEhvd2V2ZXIsIGl0IG9ubHkgYWxsb3dzIGEgdW5pb24gb2Ygb2JqZWN0cywgYWxsIG9mIHdoaWNoIG5lZWQgdG8gc2hhcmUgYSBkaXNjcmltaW5hdG9yIHByb3BlcnR5LiBUaGlzIHByb3BlcnR5IG11c3RcbiAgICAgKiBoYXZlIGEgZGlmZmVyZW50IHZhbHVlIGZvciBlYWNoIG9iamVjdCBpbiB0aGUgdW5pb24uXG4gICAgICogQHBhcmFtIGRpc2NyaW1pbmF0b3IgdGhlIG5hbWUgb2YgdGhlIGRpc2NyaW1pbmF0b3IgcHJvcGVydHlcbiAgICAgKiBAcGFyYW0gdHlwZXMgYW4gYXJyYXkgb2Ygb2JqZWN0IHNjaGVtYXNcbiAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZShkaXNjcmltaW5hdG9yLCBvcHRpb25zLCBwYXJhbXMpIHtcbiAgICAgICAgLy8gR2V0IGFsbCB0aGUgdmFsaWQgZGlzY3JpbWluYXRvciB2YWx1ZXNcbiAgICAgICAgY29uc3Qgb3B0aW9uc01hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgLy8gdHJ5IHtcbiAgICAgICAgZm9yIChjb25zdCB0eXBlIG9mIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpc2NyaW1pbmF0b3JWYWx1ZXMgPSBnZXREaXNjcmltaW5hdG9yKHR5cGUuc2hhcGVbZGlzY3JpbWluYXRvcl0pO1xuICAgICAgICAgICAgaWYgKCFkaXNjcmltaW5hdG9yVmFsdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQSBkaXNjcmltaW5hdG9yIHZhbHVlIGZvciBrZXkgXFxgJHtkaXNjcmltaW5hdG9yfVxcYCBjb3VsZCBub3QgYmUgZXh0cmFjdGVkIGZyb20gYWxsIHNjaGVtYSBvcHRpb25zYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIGRpc2NyaW1pbmF0b3JWYWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9uc01hcC5oYXModmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRGlzY3JpbWluYXRvciBwcm9wZXJ0eSAke1N0cmluZyhkaXNjcmltaW5hdG9yKX0gaGFzIGR1cGxpY2F0ZSB2YWx1ZSAke1N0cmluZyh2YWx1ZSl9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9wdGlvbnNNYXAuc2V0KHZhbHVlLCB0eXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZERpc2NyaW1pbmF0ZWRVbmlvbih7XG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZERpc2NyaW1pbmF0ZWRVbmlvbixcbiAgICAgICAgICAgIGRpc2NyaW1pbmF0b3IsXG4gICAgICAgICAgICBvcHRpb25zLFxuICAgICAgICAgICAgb3B0aW9uc01hcCxcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZnVuY3Rpb24gbWVyZ2VWYWx1ZXMoYSwgYikge1xuICAgIGNvbnN0IGFUeXBlID0gZ2V0UGFyc2VkVHlwZShhKTtcbiAgICBjb25zdCBiVHlwZSA9IGdldFBhcnNlZFR5cGUoYik7XG4gICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIGRhdGE6IGEgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYVR5cGUgPT09IFpvZFBhcnNlZFR5cGUub2JqZWN0ICYmIGJUeXBlID09PSBab2RQYXJzZWRUeXBlLm9iamVjdCkge1xuICAgICAgICBjb25zdCBiS2V5cyA9IHV0aWwub2JqZWN0S2V5cyhiKTtcbiAgICAgICAgY29uc3Qgc2hhcmVkS2V5cyA9IHV0aWwub2JqZWN0S2V5cyhhKS5maWx0ZXIoKGtleSkgPT4gYktleXMuaW5kZXhPZihrZXkpICE9PSAtMSk7XG4gICAgICAgIGNvbnN0IG5ld09iaiA9IHsgLi4uYSwgLi4uYiB9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBzaGFyZWRLZXlzKSB7XG4gICAgICAgICAgICBjb25zdCBzaGFyZWRWYWx1ZSA9IG1lcmdlVmFsdWVzKGFba2V5XSwgYltrZXldKTtcbiAgICAgICAgICAgIGlmICghc2hhcmVkVmFsdWUudmFsaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld09ialtrZXldID0gc2hhcmVkVmFsdWUuZGF0YTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgZGF0YTogbmV3T2JqIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKGFUeXBlID09PSBab2RQYXJzZWRUeXBlLmFycmF5ICYmIGJUeXBlID09PSBab2RQYXJzZWRUeXBlLmFycmF5KSB7XG4gICAgICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ld0FycmF5ID0gW107XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgaXRlbUEgPSBhW2luZGV4XTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1CID0gYltpbmRleF07XG4gICAgICAgICAgICBjb25zdCBzaGFyZWRWYWx1ZSA9IG1lcmdlVmFsdWVzKGl0ZW1BLCBpdGVtQik7XG4gICAgICAgICAgICBpZiAoIXNoYXJlZFZhbHVlLnZhbGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdBcnJheS5wdXNoKHNoYXJlZFZhbHVlLmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBuZXdBcnJheSB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChhVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS5kYXRlICYmIGJUeXBlID09PSBab2RQYXJzZWRUeXBlLmRhdGUgJiYgK2EgPT09ICtiKSB7XG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBhIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UgfTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgWm9kSW50ZXJzZWN0aW9uIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGhhbmRsZVBhcnNlZCA9IChwYXJzZWRMZWZ0LCBwYXJzZWRSaWdodCkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzQWJvcnRlZChwYXJzZWRMZWZ0KSB8fCBpc0Fib3J0ZWQocGFyc2VkUmlnaHQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtZXJnZWQgPSBtZXJnZVZhbHVlcyhwYXJzZWRMZWZ0LnZhbHVlLCBwYXJzZWRSaWdodC52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoIW1lcmdlZC52YWxpZCkge1xuICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9pbnRlcnNlY3Rpb25fdHlwZXMsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNEaXJ0eShwYXJzZWRMZWZ0KSB8fCBpc0RpcnR5KHBhcnNlZFJpZ2h0KSkge1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBtZXJnZWQuZGF0YSB9O1xuICAgICAgICB9O1xuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWYubGVmdC5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgdGhpcy5fZGVmLnJpZ2h0Ll9wYXJzZUFzeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0pLnRoZW4oKFtsZWZ0LCByaWdodF0pID0+IGhhbmRsZVBhcnNlZChsZWZ0LCByaWdodCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZVBhcnNlZCh0aGlzLl9kZWYubGVmdC5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgIH0pLCB0aGlzLl9kZWYucmlnaHQuX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5ab2RJbnRlcnNlY3Rpb24uY3JlYXRlID0gKGxlZnQsIHJpZ2h0LCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEludGVyc2VjdGlvbih7XG4gICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgIHJpZ2h0OiByaWdodCxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RJbnRlcnNlY3Rpb24sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG4vLyB0eXBlIFpvZFR1cGxlSXRlbXMgPSBbWm9kVHlwZUFueSwgLi4uWm9kVHlwZUFueVtdXTtcbmV4cG9ydCBjbGFzcyBab2RUdXBsZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuYXJyYXkpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuYXJyYXksXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmRhdGEubGVuZ3RoIDwgdGhpcy5fZGVmLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICBtaW5pbXVtOiB0aGlzLl9kZWYuaXRlbXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN0ID0gdGhpcy5fZGVmLnJlc3Q7XG4gICAgICAgIGlmICghcmVzdCAmJiBjdHguZGF0YS5sZW5ndGggPiB0aGlzLl9kZWYuaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICBtYXhpbXVtOiB0aGlzLl9kZWYuaXRlbXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpdGVtcyA9IFsuLi5jdHguZGF0YV1cbiAgICAgICAgICAgIC5tYXAoKGl0ZW0sIGl0ZW1JbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2NoZW1hID0gdGhpcy5fZGVmLml0ZW1zW2l0ZW1JbmRleF0gfHwgdGhpcy5fZGVmLnJlc3Q7XG4gICAgICAgICAgICBpZiAoIXNjaGVtYSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBzY2hlbWEuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBpdGVtLCBjdHgucGF0aCwgaXRlbUluZGV4KSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuZmlsdGVyKCh4KSA9PiAhIXgpOyAvLyBmaWx0ZXIgbnVsbHNcbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChpdGVtcykudGhlbigocmVzdWx0cykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgcmVzdWx0cyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgaXRlbXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBpdGVtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pdGVtcztcbiAgICB9XG4gICAgcmVzdChyZXN0KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kVHVwbGUoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgcmVzdCxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuWm9kVHVwbGUuY3JlYXRlID0gKHNjaGVtYXMsIHBhcmFtcykgPT4ge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShzY2hlbWFzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGFuIGFycmF5IG9mIHNjaGVtYXMgdG8gei50dXBsZShbIC4uLiBdKVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBab2RUdXBsZSh7XG4gICAgICAgIGl0ZW1zOiBzY2hlbWFzLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFR1cGxlLFxuICAgICAgICByZXN0OiBudWxsLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZFJlY29yZCBleHRlbmRzIFpvZFR5cGUge1xuICAgIGdldCBrZXlTY2hlbWEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYua2V5VHlwZTtcbiAgICB9XG4gICAgZ2V0IHZhbHVlU2NoZW1hKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5vYmplY3QpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUub2JqZWN0LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFpcnMgPSBbXTtcbiAgICAgICAgY29uc3Qga2V5VHlwZSA9IHRoaXMuX2RlZi5rZXlUeXBlO1xuICAgICAgICBjb25zdCB2YWx1ZVR5cGUgPSB0aGlzLl9kZWYudmFsdWVUeXBlO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBjdHguZGF0YSkge1xuICAgICAgICAgICAgcGFpcnMucHVzaCh7XG4gICAgICAgICAgICAgICAga2V5OiBrZXlUeXBlLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwga2V5LCBjdHgucGF0aCwga2V5KSksXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlVHlwZS5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIGN0eC5kYXRhW2tleV0sIGN0eC5wYXRoLCBrZXkpKSxcbiAgICAgICAgICAgICAgICBhbHdheXNTZXQ6IGtleSBpbiBjdHguZGF0YSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VPYmplY3RBc3luYyhzdGF0dXMsIHBhaXJzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZU9iamVjdFN5bmMoc3RhdHVzLCBwYWlycyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWVUeXBlO1xuICAgIH1cbiAgICBzdGF0aWMgY3JlYXRlKGZpcnN0LCBzZWNvbmQsIHRoaXJkKSB7XG4gICAgICAgIGlmIChzZWNvbmQgaW5zdGFuY2VvZiBab2RUeXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFpvZFJlY29yZCh7XG4gICAgICAgICAgICAgICAga2V5VHlwZTogZmlyc3QsXG4gICAgICAgICAgICAgICAgdmFsdWVUeXBlOiBzZWNvbmQsXG4gICAgICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RSZWNvcmQsXG4gICAgICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyh0aGlyZCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZFJlY29yZCh7XG4gICAgICAgICAgICBrZXlUeXBlOiBab2RTdHJpbmcuY3JlYXRlKCksXG4gICAgICAgICAgICB2YWx1ZVR5cGU6IGZpcnN0LFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RSZWNvcmQsXG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHNlY29uZCksXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RNYXAgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBnZXQga2V5U2NoZW1hKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmtleVR5cGU7XG4gICAgfVxuICAgIGdldCB2YWx1ZVNjaGVtYSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi52YWx1ZVR5cGU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUubWFwKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm1hcCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleVR5cGUgPSB0aGlzLl9kZWYua2V5VHlwZTtcbiAgICAgICAgY29uc3QgdmFsdWVUeXBlID0gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICAgICAgY29uc3QgcGFpcnMgPSBbLi4uY3R4LmRhdGEuZW50cmllcygpXS5tYXAoKFtrZXksIHZhbHVlXSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAga2V5OiBrZXlUeXBlLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwga2V5LCBjdHgucGF0aCwgW2luZGV4LCBcImtleVwiXSkpLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVR5cGUuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCB2YWx1ZSwgY3R4LnBhdGgsIFtpbmRleCwgXCJ2YWx1ZVwiXSkpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICBjb25zdCBmaW5hbE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgcGFpci5rZXk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgcGFpci52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiYWJvcnRlZFwiIHx8IHZhbHVlLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkuc3RhdHVzID09PSBcImRpcnR5XCIgfHwgdmFsdWUuc3RhdHVzID09PSBcImRpcnR5XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsTWFwLnNldChrZXkudmFsdWUsIHZhbHVlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBmaW5hbE1hcCB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBmaW5hbE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IHBhaXIua2V5O1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFpci52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIgfHwgdmFsdWUuc3RhdHVzID09PSBcImFib3J0ZWRcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiZGlydHlcIiB8fCB2YWx1ZS5zdGF0dXMgPT09IFwiZGlydHlcIikge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxNYXAuc2V0KGtleS52YWx1ZSwgdmFsdWUudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBmaW5hbE1hcCB9O1xuICAgICAgICB9XG4gICAgfVxufVxuWm9kTWFwLmNyZWF0ZSA9IChrZXlUeXBlLCB2YWx1ZVR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTWFwKHtcbiAgICAgICAgdmFsdWVUeXBlLFxuICAgICAgICBrZXlUeXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE1hcCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RTZXQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLnNldCkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5zZXQsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZWYgPSB0aGlzLl9kZWY7XG4gICAgICAgIGlmIChkZWYubWluU2l6ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGN0eC5kYXRhLnNpemUgPCBkZWYubWluU2l6ZS52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBkZWYubWluU2l6ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzZXRcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5taW5TaXplLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZi5tYXhTaXplICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoY3R4LmRhdGEuc2l6ZSA+IGRlZi5tYXhTaXplLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBkZWYubWF4U2l6ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzZXRcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5tYXhTaXplLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWVUeXBlID0gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICAgICAgZnVuY3Rpb24gZmluYWxpemVTZXQoZWxlbWVudHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZFNldCA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICBwYXJzZWRTZXQuYWRkKGVsZW1lbnQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBwYXJzZWRTZXQgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IFsuLi5jdHguZGF0YS52YWx1ZXMoKV0ubWFwKChpdGVtLCBpKSA9PiB2YWx1ZVR5cGUuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBpdGVtLCBjdHgucGF0aCwgaSkpKTtcbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChlbGVtZW50cykudGhlbigoZWxlbWVudHMpID0+IGZpbmFsaXplU2V0KGVsZW1lbnRzKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmluYWxpemVTZXQoZWxlbWVudHMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIG1pbihtaW5TaXplLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kU2V0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIG1pblNpemU6IHsgdmFsdWU6IG1pblNpemUsIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbWF4KG1heFNpemUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTZXQoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgbWF4U2l6ZTogeyB2YWx1ZTogbWF4U2l6ZSwgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzaXplKHNpemUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluKHNpemUsIG1lc3NhZ2UpLm1heChzaXplLCBtZXNzYWdlKTtcbiAgICB9XG4gICAgbm9uZW1wdHkobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5taW4oMSwgbWVzc2FnZSk7XG4gICAgfVxufVxuWm9kU2V0LmNyZWF0ZSA9ICh2YWx1ZVR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kU2V0KHtcbiAgICAgICAgdmFsdWVUeXBlLFxuICAgICAgICBtaW5TaXplOiBudWxsLFxuICAgICAgICBtYXhTaXplOiBudWxsLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFNldCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RGdW5jdGlvbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnZhbGlkYXRlID0gdGhpcy5pbXBsZW1lbnQ7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLmZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gbWFrZUFyZ3NJc3N1ZShhcmdzLCBlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIG1ha2VJc3N1ZSh7XG4gICAgICAgICAgICAgICAgZGF0YTogYXJncyxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBlcnJvck1hcHM6IFtjdHguY29tbW9uLmNvbnRleHR1YWxFcnJvck1hcCwgY3R4LnNjaGVtYUVycm9yTWFwLCBnZXRFcnJvck1hcCgpLCBkZWZhdWx0RXJyb3JNYXBdLmZpbHRlcigoeCkgPT4gISF4KSxcbiAgICAgICAgICAgICAgICBpc3N1ZURhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfYXJndW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHNFcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VSZXR1cm5zSXNzdWUocmV0dXJucywgZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBtYWtlSXNzdWUoe1xuICAgICAgICAgICAgICAgIGRhdGE6IHJldHVybnMsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgZXJyb3JNYXBzOiBbY3R4LmNvbW1vbi5jb250ZXh0dWFsRXJyb3JNYXAsIGN0eC5zY2hlbWFFcnJvck1hcCwgZ2V0RXJyb3JNYXAoKSwgZGVmYXVsdEVycm9yTWFwXS5maWx0ZXIoKHgpID0+ICEheCksXG4gICAgICAgICAgICAgICAgaXNzdWVEYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3JldHVybl90eXBlLFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5UeXBlRXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJhbXMgPSB7IGVycm9yTWFwOiBjdHguY29tbW9uLmNvbnRleHR1YWxFcnJvck1hcCB9O1xuICAgICAgICBjb25zdCBmbiA9IGN0eC5kYXRhO1xuICAgICAgICBpZiAodGhpcy5fZGVmLnJldHVybnMgaW5zdGFuY2VvZiBab2RQcm9taXNlKSB7XG4gICAgICAgICAgICAvLyBXb3VsZCBsb3ZlIGEgd2F5IHRvIGF2b2lkIGRpc2FibGluZyB0aGlzIHJ1bGUsIGJ1dCB3ZSBuZWVkXG4gICAgICAgICAgICAvLyBhbiBhbGlhcyAodXNpbmcgYW4gYXJyb3cgZnVuY3Rpb24gd2FzIHdoYXQgY2F1c2VkIDI2NTEpLlxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG4gICAgICAgICAgICBjb25zdCBtZSA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4gT0soYXN5bmMgZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBab2RFcnJvcihbXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkQXJncyA9IGF3YWl0IG1lLl9kZWYuYXJncy5wYXJzZUFzeW5jKGFyZ3MsIHBhcmFtcykuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IuYWRkSXNzdWUobWFrZUFyZ3NJc3N1ZShhcmdzLCBlKSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFJlZmxlY3QuYXBwbHkoZm4sIHRoaXMsIHBhcnNlZEFyZ3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZFJldHVybnMgPSBhd2FpdCBtZS5fZGVmLnJldHVybnMuX2RlZi50eXBlXG4gICAgICAgICAgICAgICAgICAgIC5wYXJzZUFzeW5jKHJlc3VsdCwgcGFyYW1zKVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IuYWRkSXNzdWUobWFrZVJldHVybnNJc3N1ZShyZXN1bHQsIGUpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlZFJldHVybnM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFdvdWxkIGxvdmUgYSB3YXkgdG8gYXZvaWQgZGlzYWJsaW5nIHRoaXMgcnVsZSwgYnV0IHdlIG5lZWRcbiAgICAgICAgICAgIC8vIGFuIGFsaWFzICh1c2luZyBhbiBhcnJvdyBmdW5jdGlvbiB3YXMgd2hhdCBjYXVzZWQgMjY1MSkuXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcbiAgICAgICAgICAgIGNvbnN0IG1lID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiBPSyhmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZEFyZ3MgPSBtZS5fZGVmLmFyZ3Muc2FmZVBhcnNlKGFyZ3MsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJzZWRBcmdzLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFpvZEVycm9yKFttYWtlQXJnc0lzc3VlKGFyZ3MsIHBhcnNlZEFyZ3MuZXJyb3IpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IFJlZmxlY3QuYXBwbHkoZm4sIHRoaXMsIHBhcnNlZEFyZ3MuZGF0YSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkUmV0dXJucyA9IG1lLl9kZWYucmV0dXJucy5zYWZlUGFyc2UocmVzdWx0LCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIGlmICghcGFyc2VkUmV0dXJucy5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBab2RFcnJvcihbbWFrZVJldHVybnNJc3N1ZShyZXN1bHQsIHBhcnNlZFJldHVybnMuZXJyb3IpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZWRSZXR1cm5zLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwYXJhbWV0ZXJzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmFyZ3M7XG4gICAgfVxuICAgIHJldHVyblR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYucmV0dXJucztcbiAgICB9XG4gICAgYXJncyguLi5pdGVtcykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEZ1bmN0aW9uKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGFyZ3M6IFpvZFR1cGxlLmNyZWF0ZShpdGVtcykucmVzdChab2RVbmtub3duLmNyZWF0ZSgpKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybnMocmV0dXJuVHlwZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEZ1bmN0aW9uKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHJldHVybnM6IHJldHVyblR5cGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbXBsZW1lbnQoZnVuYykge1xuICAgICAgICBjb25zdCB2YWxpZGF0ZWRGdW5jID0gdGhpcy5wYXJzZShmdW5jKTtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlZEZ1bmM7XG4gICAgfVxuICAgIHN0cmljdEltcGxlbWVudChmdW5jKSB7XG4gICAgICAgIGNvbnN0IHZhbGlkYXRlZEZ1bmMgPSB0aGlzLnBhcnNlKGZ1bmMpO1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVkRnVuYztcbiAgICB9XG4gICAgc3RhdGljIGNyZWF0ZShhcmdzLCByZXR1cm5zLCBwYXJhbXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RGdW5jdGlvbih7XG4gICAgICAgICAgICBhcmdzOiAoYXJncyA/IGFyZ3MgOiBab2RUdXBsZS5jcmVhdGUoW10pLnJlc3QoWm9kVW5rbm93bi5jcmVhdGUoKSkpLFxuICAgICAgICAgICAgcmV0dXJuczogcmV0dXJucyB8fCBab2RVbmtub3duLmNyZWF0ZSgpLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RGdW5jdGlvbixcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFpvZExhenkgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBnZXQgc2NoZW1hKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmdldHRlcigpO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGxhenlTY2hlbWEgPSB0aGlzLl9kZWYuZ2V0dGVyKCk7XG4gICAgICAgIHJldHVybiBsYXp5U2NoZW1hLl9wYXJzZSh7IGRhdGE6IGN0eC5kYXRhLCBwYXRoOiBjdHgucGF0aCwgcGFyZW50OiBjdHggfSk7XG4gICAgfVxufVxuWm9kTGF6eS5jcmVhdGUgPSAoZ2V0dGVyLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZExhenkoe1xuICAgICAgICBnZXR0ZXI6IGdldHRlcixcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RMYXp5LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZExpdGVyYWwgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgaWYgKGlucHV0LmRhdGEgIT09IHRoaXMuX2RlZi52YWx1ZSkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX2xpdGVyYWwsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IHRoaXMuX2RlZi52YWx1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlOiBpbnB1dC5kYXRhIH07XG4gICAgfVxuICAgIGdldCB2YWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi52YWx1ZTtcbiAgICB9XG59XG5ab2RMaXRlcmFsLmNyZWF0ZSA9ICh2YWx1ZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RMaXRlcmFsKHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZExpdGVyYWwsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5mdW5jdGlvbiBjcmVhdGVab2RFbnVtKHZhbHVlcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBab2RFbnVtKHtcbiAgICAgICAgdmFsdWVzLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVudW0sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbmV4cG9ydCBjbGFzcyBab2RFbnVtIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQuZGF0YSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWRWYWx1ZXMgPSB0aGlzLl9kZWYudmFsdWVzO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IHV0aWwuam9pblZhbHVlcyhleHBlY3RlZFZhbHVlcyksXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fY2FjaGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlID0gbmV3IFNldCh0aGlzLl9kZWYudmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlLmhhcyhpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWRWYWx1ZXMgPSB0aGlzLl9kZWYudmFsdWVzO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX2VudW1fdmFsdWUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogZXhwZWN0ZWRWYWx1ZXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG4gICAgZ2V0IG9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWVzO1xuICAgIH1cbiAgICBnZXQgZW51bSgpIHtcbiAgICAgICAgY29uc3QgZW51bVZhbHVlcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHZhbCBvZiB0aGlzLl9kZWYudmFsdWVzKSB7XG4gICAgICAgICAgICBlbnVtVmFsdWVzW3ZhbF0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVudW1WYWx1ZXM7XG4gICAgfVxuICAgIGdldCBWYWx1ZXMoKSB7XG4gICAgICAgIGNvbnN0IGVudW1WYWx1ZXMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCB2YWwgb2YgdGhpcy5fZGVmLnZhbHVlcykge1xuICAgICAgICAgICAgZW51bVZhbHVlc1t2YWxdID0gdmFsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbnVtVmFsdWVzO1xuICAgIH1cbiAgICBnZXQgRW51bSgpIHtcbiAgICAgICAgY29uc3QgZW51bVZhbHVlcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHZhbCBvZiB0aGlzLl9kZWYudmFsdWVzKSB7XG4gICAgICAgICAgICBlbnVtVmFsdWVzW3ZhbF0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVudW1WYWx1ZXM7XG4gICAgfVxuICAgIGV4dHJhY3QodmFsdWVzLCBuZXdEZWYgPSB0aGlzLl9kZWYpIHtcbiAgICAgICAgcmV0dXJuIFpvZEVudW0uY3JlYXRlKHZhbHVlcywge1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgLi4ubmV3RGVmLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZXhjbHVkZSh2YWx1ZXMsIG5ld0RlZiA9IHRoaXMuX2RlZikge1xuICAgICAgICByZXR1cm4gWm9kRW51bS5jcmVhdGUodGhpcy5vcHRpb25zLmZpbHRlcigob3B0KSA9PiAhdmFsdWVzLmluY2x1ZGVzKG9wdCkpLCB7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICAuLi5uZXdEZWYsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblpvZEVudW0uY3JlYXRlID0gY3JlYXRlWm9kRW51bTtcbmV4cG9ydCBjbGFzcyBab2ROYXRpdmVFbnVtIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IG5hdGl2ZUVudW1WYWx1ZXMgPSB1dGlsLmdldFZhbGlkRW51bVZhbHVlcyh0aGlzLl9kZWYudmFsdWVzKTtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuc3RyaW5nICYmIGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLm51bWJlcikge1xuICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWRWYWx1ZXMgPSB1dGlsLm9iamVjdFZhbHVlcyhuYXRpdmVFbnVtVmFsdWVzKTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiB1dGlsLmpvaW5WYWx1ZXMoZXhwZWN0ZWRWYWx1ZXMpLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZSA9IG5ldyBTZXQodXRpbC5nZXRWYWxpZEVudW1WYWx1ZXModGhpcy5fZGVmLnZhbHVlcykpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fY2FjaGUuaGFzKGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICBjb25zdCBleHBlY3RlZFZhbHVlcyA9IHV0aWwub2JqZWN0VmFsdWVzKG5hdGl2ZUVudW1WYWx1ZXMpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX2VudW1fdmFsdWUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogZXhwZWN0ZWRWYWx1ZXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG4gICAgZ2V0IGVudW0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWVzO1xuICAgIH1cbn1cblpvZE5hdGl2ZUVudW0uY3JlYXRlID0gKHZhbHVlcywgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2ROYXRpdmVFbnVtKHtcbiAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTmF0aXZlRW51bSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RQcm9taXNlIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgdW53cmFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnR5cGU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLnByb21pc2UgJiYgY3R4LmNvbW1vbi5hc3luYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUucHJvbWlzZSxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb21pc2lmaWVkID0gY3R4LnBhcnNlZFR5cGUgPT09IFpvZFBhcnNlZFR5cGUucHJvbWlzZSA/IGN0eC5kYXRhIDogUHJvbWlzZS5yZXNvbHZlKGN0eC5kYXRhKTtcbiAgICAgICAgcmV0dXJuIE9LKHByb21pc2lmaWVkLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kZWYudHlwZS5wYXJzZUFzeW5jKGRhdGEsIHtcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBlcnJvck1hcDogY3R4LmNvbW1vbi5jb250ZXh0dWFsRXJyb3JNYXAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkpO1xuICAgIH1cbn1cblpvZFByb21pc2UuY3JlYXRlID0gKHNjaGVtYSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RQcm9taXNlKHtcbiAgICAgICAgdHlwZTogc2NoZW1hLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFByb21pc2UsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kRWZmZWN0cyBleHRlbmRzIFpvZFR5cGUge1xuICAgIGlubmVyVHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zY2hlbWE7XG4gICAgfVxuICAgIHNvdXJjZVR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuc2NoZW1hLl9kZWYudHlwZU5hbWUgPT09IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFZmZlY3RzXG4gICAgICAgICAgICA/IHRoaXMuX2RlZi5zY2hlbWEuc291cmNlVHlwZSgpXG4gICAgICAgICAgICA6IHRoaXMuX2RlZi5zY2hlbWE7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCBlZmZlY3QgPSB0aGlzLl9kZWYuZWZmZWN0IHx8IG51bGw7XG4gICAgICAgIGNvbnN0IGNoZWNrQ3R4ID0ge1xuICAgICAgICAgICAgYWRkSXNzdWU6IChhcmcpID0+IHtcbiAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIGFyZyk7XG4gICAgICAgICAgICAgICAgaWYgKGFyZy5mYXRhbCkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXQgcGF0aCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3R4LnBhdGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICBjaGVja0N0eC5hZGRJc3N1ZSA9IGNoZWNrQ3R4LmFkZElzc3VlLmJpbmQoY2hlY2tDdHgpO1xuICAgICAgICBpZiAoZWZmZWN0LnR5cGUgPT09IFwicHJlcHJvY2Vzc1wiKSB7XG4gICAgICAgICAgICBjb25zdCBwcm9jZXNzZWQgPSBlZmZlY3QudHJhbnNmb3JtKGN0eC5kYXRhLCBjaGVja0N0eCk7XG4gICAgICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocHJvY2Vzc2VkKS50aGVuKGFzeW5jIChwcm9jZXNzZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cy52YWx1ZSA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fZGVmLnNjaGVtYS5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBwcm9jZXNzZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gRElSVFkocmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cy52YWx1ZSA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERJUlRZKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzLnZhbHVlID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fZGVmLnNjaGVtYS5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcHJvY2Vzc2VkLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRElSVFkocmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzLnZhbHVlID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBESVJUWShyZXN1bHQudmFsdWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVmZmVjdC50eXBlID09PSBcInJlZmluZW1lbnRcIikge1xuICAgICAgICAgICAgY29uc3QgZXhlY3V0ZVJlZmluZW1lbnQgPSAoYWNjKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZWZmZWN0LnJlZmluZW1lbnQoYWNjLCBjaGVja0N0eCk7XG4gICAgICAgICAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luYyByZWZpbmVtZW50IGVuY291bnRlcmVkIGR1cmluZyBzeW5jaHJvbm91cyBwYXJzZSBvcGVyYXRpb24uIFVzZSAucGFyc2VBc3luYyBpbnN0ZWFkLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbm5lciA9IHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGlubmVyLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgIGlmIChpbm5lci5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHZhbHVlIGlzIGlnbm9yZWRcbiAgICAgICAgICAgICAgICBleGVjdXRlUmVmaW5lbWVudChpbm5lci52YWx1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBpbm5lci52YWx1ZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlQXN5bmMoeyBkYXRhOiBjdHguZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pLnRoZW4oKGlubmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbm5lci5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbm5lci5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXhlY3V0ZVJlZmluZW1lbnQoaW5uZXIudmFsdWUpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBpbm5lci52YWx1ZSB9O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZWZmZWN0LnR5cGUgPT09IFwidHJhbnNmb3JtXCIpIHtcbiAgICAgICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhc2UgPSB0aGlzLl9kZWYuc2NoZW1hLl9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZChiYXNlKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZWZmZWN0LnRyYW5zZm9ybShiYXNlLnZhbHVlLCBjaGVja0N0eCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3luY2hyb25vdXMgdHJhbnNmb3JtIGVuY291bnRlcmVkIGR1cmluZyBzeW5jaHJvbm91cyBwYXJzZSBvcGVyYXRpb24uIFVzZSAucGFyc2VBc3luYyBpbnN0ZWFkLmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IHJlc3VsdCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlQXN5bmMoeyBkYXRhOiBjdHguZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pLnRoZW4oKGJhc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKGJhc2UpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZWZmZWN0LnRyYW5zZm9ybShiYXNlLnZhbHVlLCBjaGVja0N0eCkpLnRoZW4oKHJlc3VsdCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoZWZmZWN0KTtcbiAgICB9XG59XG5ab2RFZmZlY3RzLmNyZWF0ZSA9IChzY2hlbWEsIGVmZmVjdCwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RFZmZlY3RzKHtcbiAgICAgICAgc2NoZW1hLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVmZmVjdHMsXG4gICAgICAgIGVmZmVjdCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcblpvZEVmZmVjdHMuY3JlYXRlV2l0aFByZXByb2Nlc3MgPSAocHJlcHJvY2Vzcywgc2NoZW1hLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEVmZmVjdHMoe1xuICAgICAgICBzY2hlbWEsXG4gICAgICAgIGVmZmVjdDogeyB0eXBlOiBcInByZXByb2Nlc3NcIiwgdHJhbnNmb3JtOiBwcmVwcm9jZXNzIH0sXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRWZmZWN0cyxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCB7IFpvZEVmZmVjdHMgYXMgWm9kVHJhbnNmb3JtZXIgfTtcbmV4cG9ydCBjbGFzcyBab2RPcHRpb25hbCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlID09PSBab2RQYXJzZWRUeXBlLnVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIE9LKHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKGlucHV0KTtcbiAgICB9XG4gICAgdW53cmFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmlubmVyVHlwZTtcbiAgICB9XG59XG5ab2RPcHRpb25hbC5jcmVhdGUgPSAodHlwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RPcHRpb25hbCh7XG4gICAgICAgIGlubmVyVHlwZTogdHlwZSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPcHRpb25hbCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2ROdWxsYWJsZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlID09PSBab2RQYXJzZWRUeXBlLm51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBPSyhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmlubmVyVHlwZS5fcGFyc2UoaW5wdXQpO1xuICAgIH1cbiAgICB1bndyYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlO1xuICAgIH1cbn1cblpvZE51bGxhYmxlLmNyZWF0ZSA9ICh0eXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE51bGxhYmxlKHtcbiAgICAgICAgaW5uZXJUeXBlOiB0eXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE51bGxhYmxlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZERlZmF1bHQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGxldCBkYXRhID0gY3R4LmRhdGE7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS51bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9kZWYuZGVmYXVsdFZhbHVlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKHtcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVtb3ZlRGVmYXVsdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuWm9kRGVmYXVsdC5jcmVhdGUgPSAodHlwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2REZWZhdWx0KHtcbiAgICAgICAgaW5uZXJUeXBlOiB0eXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZERlZmF1bHQsXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdHlwZW9mIHBhcmFtcy5kZWZhdWx0ID09PSBcImZ1bmN0aW9uXCIgPyBwYXJhbXMuZGVmYXVsdCA6ICgpID0+IHBhcmFtcy5kZWZhdWx0LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZENhdGNoIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICAvLyBuZXdDdHggaXMgdXNlZCB0byBub3QgY29sbGVjdCBpc3N1ZXMgZnJvbSBpbm5lciB0eXBlcyBpbiBjdHhcbiAgICAgICAgY29uc3QgbmV3Q3R4ID0ge1xuICAgICAgICAgICAgLi4uY3R4LFxuICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgLi4uY3R4LmNvbW1vbixcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fZGVmLmlubmVyVHlwZS5fcGFyc2Uoe1xuICAgICAgICAgICAgZGF0YTogbmV3Q3R4LmRhdGEsXG4gICAgICAgICAgICBwYXRoOiBuZXdDdHgucGF0aCxcbiAgICAgICAgICAgIHBhcmVudDoge1xuICAgICAgICAgICAgICAgIC4uLm5ld0N0eCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaXNBc3luYyhyZXN1bHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogXCJ2YWxpZFwiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmVzdWx0LnN0YXR1cyA9PT0gXCJ2YWxpZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHJlc3VsdC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLl9kZWYuY2F0Y2hWYWx1ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0IGVycm9yKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFpvZEVycm9yKG5ld0N0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBuZXdDdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcInZhbGlkXCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC5zdGF0dXMgPT09IFwidmFsaWRcIlxuICAgICAgICAgICAgICAgICAgICA/IHJlc3VsdC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICA6IHRoaXMuX2RlZi5jYXRjaFZhbHVlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldCBlcnJvcigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFpvZEVycm9yKG5ld0N0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogbmV3Q3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZW1vdmVDYXRjaCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuWm9kQ2F0Y2guY3JlYXRlID0gKHR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kQ2F0Y2goe1xuICAgICAgICBpbm5lclR5cGU6IHR5cGUsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQ2F0Y2gsXG4gICAgICAgIGNhdGNoVmFsdWU6IHR5cGVvZiBwYXJhbXMuY2F0Y2ggPT09IFwiZnVuY3Rpb25cIiA/IHBhcmFtcy5jYXRjaCA6ICgpID0+IHBhcmFtcy5jYXRjaCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2ROYU4gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5uYW4pIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUubmFuLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlOiBpbnB1dC5kYXRhIH07XG4gICAgfVxufVxuWm9kTmFOLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE5hTih7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTmFOLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNvbnN0IEJSQU5EID0gU3ltYm9sKFwiem9kX2JyYW5kXCIpO1xuZXhwb3J0IGNsYXNzIFpvZEJyYW5kZWQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBjdHguZGF0YTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi50eXBlLl9wYXJzZSh7XG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHVud3JhcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi50eXBlO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RQaXBlbGluZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlQXN5bmMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5SZXN1bHQgPSBhd2FpdCB0aGlzLl9kZWYuaW4uX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChpblJlc3VsdC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICBpZiAoaW5SZXN1bHQuc3RhdHVzID09PSBcImRpcnR5XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBESVJUWShpblJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGVmLm91dC5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBpblJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlQXN5bmMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGluUmVzdWx0ID0gdGhpcy5fZGVmLmluLl9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoaW5SZXN1bHQuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgIGlmIChpblJlc3VsdC5zdGF0dXMgPT09IFwiZGlydHlcIikge1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogXCJkaXJ0eVwiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogaW5SZXN1bHQudmFsdWUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9kZWYub3V0Ll9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBpblJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBjcmVhdGUoYSwgYikge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFBpcGVsaW5lKHtcbiAgICAgICAgICAgIGluOiBhLFxuICAgICAgICAgICAgb3V0OiBiLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RQaXBlbGluZSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFpvZFJlYWRvbmx5IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKGlucHV0KTtcbiAgICAgICAgY29uc3QgZnJlZXplID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChpc1ZhbGlkKGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YS52YWx1ZSA9IE9iamVjdC5mcmVlemUoZGF0YS52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGlzQXN5bmMocmVzdWx0KSA/IHJlc3VsdC50aGVuKChkYXRhKSA9PiBmcmVlemUoZGF0YSkpIDogZnJlZXplKHJlc3VsdCk7XG4gICAgfVxuICAgIHVud3JhcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuWm9kUmVhZG9ubHkuY3JlYXRlID0gKHR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kUmVhZG9ubHkoe1xuICAgICAgICBpbm5lclR5cGU6IHR5cGUsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kUmVhZG9ubHksXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgICAgICAgICAgICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgei5jdXN0b20gICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgICAgICAgICAgICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBjbGVhblBhcmFtcyhwYXJhbXMsIGRhdGEpIHtcbiAgICBjb25zdCBwID0gdHlwZW9mIHBhcmFtcyA9PT0gXCJmdW5jdGlvblwiID8gcGFyYW1zKGRhdGEpIDogdHlwZW9mIHBhcmFtcyA9PT0gXCJzdHJpbmdcIiA/IHsgbWVzc2FnZTogcGFyYW1zIH0gOiBwYXJhbXM7XG4gICAgY29uc3QgcDIgPSB0eXBlb2YgcCA9PT0gXCJzdHJpbmdcIiA/IHsgbWVzc2FnZTogcCB9IDogcDtcbiAgICByZXR1cm4gcDI7XG59XG5leHBvcnQgZnVuY3Rpb24gY3VzdG9tKGNoZWNrLCBfcGFyYW1zID0ge30sIFxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICpcbiAqIFBhc3MgYGZhdGFsYCBpbnRvIHRoZSBwYXJhbXMgb2JqZWN0IGluc3RlYWQ6XG4gKlxuICogYGBgdHNcbiAqIHouc3RyaW5nKCkuY3VzdG9tKCh2YWwpID0+IHZhbC5sZW5ndGggPiA1LCB7IGZhdGFsOiBmYWxzZSB9KVxuICogYGBgXG4gKlxuICovXG5mYXRhbCkge1xuICAgIGlmIChjaGVjaylcbiAgICAgICAgcmV0dXJuIFpvZEFueS5jcmVhdGUoKS5zdXBlclJlZmluZSgoZGF0YSwgY3R4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByID0gY2hlY2soZGF0YSk7XG4gICAgICAgICAgICBpZiAociBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gci50aGVuKChyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gY2xlYW5QYXJhbXMoX3BhcmFtcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBfZmF0YWwgPSBwYXJhbXMuZmF0YWwgPz8gZmF0YWwgPz8gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5hZGRJc3N1ZSh7IGNvZGU6IFwiY3VzdG9tXCIsIC4uLnBhcmFtcywgZmF0YWw6IF9mYXRhbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFyKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gY2xlYW5QYXJhbXMoX3BhcmFtcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgY29uc3QgX2ZhdGFsID0gcGFyYW1zLmZhdGFsID8/IGZhdGFsID8/IHRydWU7XG4gICAgICAgICAgICAgICAgY3R4LmFkZElzc3VlKHsgY29kZTogXCJjdXN0b21cIiwgLi4ucGFyYW1zLCBmYXRhbDogX2ZhdGFsIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9KTtcbiAgICByZXR1cm4gWm9kQW55LmNyZWF0ZSgpO1xufVxuZXhwb3J0IHsgWm9kVHlwZSBhcyBTY2hlbWEsIFpvZFR5cGUgYXMgWm9kU2NoZW1hIH07XG5leHBvcnQgY29uc3QgbGF0ZSA9IHtcbiAgICBvYmplY3Q6IFpvZE9iamVjdC5sYXp5Y3JlYXRlLFxufTtcbmV4cG9ydCB2YXIgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kO1xuKGZ1bmN0aW9uIChab2RGaXJzdFBhcnR5VHlwZUtpbmQpIHtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RTdHJpbmdcIl0gPSBcIlpvZFN0cmluZ1wiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE51bWJlclwiXSA9IFwiWm9kTnVtYmVyXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTmFOXCJdID0gXCJab2ROYU5cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RCaWdJbnRcIl0gPSBcIlpvZEJpZ0ludFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEJvb2xlYW5cIl0gPSBcIlpvZEJvb2xlYW5cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2REYXRlXCJdID0gXCJab2REYXRlXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kU3ltYm9sXCJdID0gXCJab2RTeW1ib2xcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RVbmRlZmluZWRcIl0gPSBcIlpvZFVuZGVmaW5lZFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE51bGxcIl0gPSBcIlpvZE51bGxcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RBbnlcIl0gPSBcIlpvZEFueVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFVua25vd25cIl0gPSBcIlpvZFVua25vd25cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2ROZXZlclwiXSA9IFwiWm9kTmV2ZXJcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RWb2lkXCJdID0gXCJab2RWb2lkXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kQXJyYXlcIl0gPSBcIlpvZEFycmF5XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kT2JqZWN0XCJdID0gXCJab2RPYmplY3RcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RVbmlvblwiXSA9IFwiWm9kVW5pb25cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2REaXNjcmltaW5hdGVkVW5pb25cIl0gPSBcIlpvZERpc2NyaW1pbmF0ZWRVbmlvblwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEludGVyc2VjdGlvblwiXSA9IFwiWm9kSW50ZXJzZWN0aW9uXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kVHVwbGVcIl0gPSBcIlpvZFR1cGxlXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kUmVjb3JkXCJdID0gXCJab2RSZWNvcmRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RNYXBcIl0gPSBcIlpvZE1hcFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFNldFwiXSA9IFwiWm9kU2V0XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kRnVuY3Rpb25cIl0gPSBcIlpvZEZ1bmN0aW9uXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTGF6eVwiXSA9IFwiWm9kTGF6eVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZExpdGVyYWxcIl0gPSBcIlpvZExpdGVyYWxcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RFbnVtXCJdID0gXCJab2RFbnVtXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kRWZmZWN0c1wiXSA9IFwiWm9kRWZmZWN0c1wiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE5hdGl2ZUVudW1cIl0gPSBcIlpvZE5hdGl2ZUVudW1cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RPcHRpb25hbFwiXSA9IFwiWm9kT3B0aW9uYWxcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2ROdWxsYWJsZVwiXSA9IFwiWm9kTnVsbGFibGVcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2REZWZhdWx0XCJdID0gXCJab2REZWZhdWx0XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kQ2F0Y2hcIl0gPSBcIlpvZENhdGNoXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kUHJvbWlzZVwiXSA9IFwiWm9kUHJvbWlzZVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEJyYW5kZWRcIl0gPSBcIlpvZEJyYW5kZWRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RQaXBlbGluZVwiXSA9IFwiWm9kUGlwZWxpbmVcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RSZWFkb25seVwiXSA9IFwiWm9kUmVhZG9ubHlcIjtcbn0pKFpvZEZpcnN0UGFydHlUeXBlS2luZCB8fCAoWm9kRmlyc3RQYXJ0eVR5cGVLaW5kID0ge30pKTtcbi8vIHJlcXVpcmVzIFRTIDQuNCtcbmNsYXNzIENsYXNzIHtcbiAgICBjb25zdHJ1Y3RvciguLi5fKSB7IH1cbn1cbmNvbnN0IGluc3RhbmNlT2ZUeXBlID0gKFxuLy8gY29uc3QgaW5zdGFuY2VPZlR5cGUgPSA8VCBleHRlbmRzIG5ldyAoLi4uYXJnczogYW55W10pID0+IGFueT4oXG5jbHMsIHBhcmFtcyA9IHtcbiAgICBtZXNzYWdlOiBgSW5wdXQgbm90IGluc3RhbmNlIG9mICR7Y2xzLm5hbWV9YCxcbn0pID0+IGN1c3RvbSgoZGF0YSkgPT4gZGF0YSBpbnN0YW5jZW9mIGNscywgcGFyYW1zKTtcbmNvbnN0IHN0cmluZ1R5cGUgPSBab2RTdHJpbmcuY3JlYXRlO1xuY29uc3QgbnVtYmVyVHlwZSA9IFpvZE51bWJlci5jcmVhdGU7XG5jb25zdCBuYW5UeXBlID0gWm9kTmFOLmNyZWF0ZTtcbmNvbnN0IGJpZ0ludFR5cGUgPSBab2RCaWdJbnQuY3JlYXRlO1xuY29uc3QgYm9vbGVhblR5cGUgPSBab2RCb29sZWFuLmNyZWF0ZTtcbmNvbnN0IGRhdGVUeXBlID0gWm9kRGF0ZS5jcmVhdGU7XG5jb25zdCBzeW1ib2xUeXBlID0gWm9kU3ltYm9sLmNyZWF0ZTtcbmNvbnN0IHVuZGVmaW5lZFR5cGUgPSBab2RVbmRlZmluZWQuY3JlYXRlO1xuY29uc3QgbnVsbFR5cGUgPSBab2ROdWxsLmNyZWF0ZTtcbmNvbnN0IGFueVR5cGUgPSBab2RBbnkuY3JlYXRlO1xuY29uc3QgdW5rbm93blR5cGUgPSBab2RVbmtub3duLmNyZWF0ZTtcbmNvbnN0IG5ldmVyVHlwZSA9IFpvZE5ldmVyLmNyZWF0ZTtcbmNvbnN0IHZvaWRUeXBlID0gWm9kVm9pZC5jcmVhdGU7XG5jb25zdCBhcnJheVR5cGUgPSBab2RBcnJheS5jcmVhdGU7XG5jb25zdCBvYmplY3RUeXBlID0gWm9kT2JqZWN0LmNyZWF0ZTtcbmNvbnN0IHN0cmljdE9iamVjdFR5cGUgPSBab2RPYmplY3Quc3RyaWN0Q3JlYXRlO1xuY29uc3QgdW5pb25UeXBlID0gWm9kVW5pb24uY3JlYXRlO1xuY29uc3QgZGlzY3JpbWluYXRlZFVuaW9uVHlwZSA9IFpvZERpc2NyaW1pbmF0ZWRVbmlvbi5jcmVhdGU7XG5jb25zdCBpbnRlcnNlY3Rpb25UeXBlID0gWm9kSW50ZXJzZWN0aW9uLmNyZWF0ZTtcbmNvbnN0IHR1cGxlVHlwZSA9IFpvZFR1cGxlLmNyZWF0ZTtcbmNvbnN0IHJlY29yZFR5cGUgPSBab2RSZWNvcmQuY3JlYXRlO1xuY29uc3QgbWFwVHlwZSA9IFpvZE1hcC5jcmVhdGU7XG5jb25zdCBzZXRUeXBlID0gWm9kU2V0LmNyZWF0ZTtcbmNvbnN0IGZ1bmN0aW9uVHlwZSA9IFpvZEZ1bmN0aW9uLmNyZWF0ZTtcbmNvbnN0IGxhenlUeXBlID0gWm9kTGF6eS5jcmVhdGU7XG5jb25zdCBsaXRlcmFsVHlwZSA9IFpvZExpdGVyYWwuY3JlYXRlO1xuY29uc3QgZW51bVR5cGUgPSBab2RFbnVtLmNyZWF0ZTtcbmNvbnN0IG5hdGl2ZUVudW1UeXBlID0gWm9kTmF0aXZlRW51bS5jcmVhdGU7XG5jb25zdCBwcm9taXNlVHlwZSA9IFpvZFByb21pc2UuY3JlYXRlO1xuY29uc3QgZWZmZWN0c1R5cGUgPSBab2RFZmZlY3RzLmNyZWF0ZTtcbmNvbnN0IG9wdGlvbmFsVHlwZSA9IFpvZE9wdGlvbmFsLmNyZWF0ZTtcbmNvbnN0IG51bGxhYmxlVHlwZSA9IFpvZE51bGxhYmxlLmNyZWF0ZTtcbmNvbnN0IHByZXByb2Nlc3NUeXBlID0gWm9kRWZmZWN0cy5jcmVhdGVXaXRoUHJlcHJvY2VzcztcbmNvbnN0IHBpcGVsaW5lVHlwZSA9IFpvZFBpcGVsaW5lLmNyZWF0ZTtcbmNvbnN0IG9zdHJpbmcgPSAoKSA9PiBzdHJpbmdUeXBlKCkub3B0aW9uYWwoKTtcbmNvbnN0IG9udW1iZXIgPSAoKSA9PiBudW1iZXJUeXBlKCkub3B0aW9uYWwoKTtcbmNvbnN0IG9ib29sZWFuID0gKCkgPT4gYm9vbGVhblR5cGUoKS5vcHRpb25hbCgpO1xuZXhwb3J0IGNvbnN0IGNvZXJjZSA9IHtcbiAgICBzdHJpbmc6ICgoYXJnKSA9PiBab2RTdHJpbmcuY3JlYXRlKHsgLi4uYXJnLCBjb2VyY2U6IHRydWUgfSkpLFxuICAgIG51bWJlcjogKChhcmcpID0+IFpvZE51bWJlci5jcmVhdGUoeyAuLi5hcmcsIGNvZXJjZTogdHJ1ZSB9KSksXG4gICAgYm9vbGVhbjogKChhcmcpID0+IFpvZEJvb2xlYW4uY3JlYXRlKHtcbiAgICAgICAgLi4uYXJnLFxuICAgICAgICBjb2VyY2U6IHRydWUsXG4gICAgfSkpLFxuICAgIGJpZ2ludDogKChhcmcpID0+IFpvZEJpZ0ludC5jcmVhdGUoeyAuLi5hcmcsIGNvZXJjZTogdHJ1ZSB9KSksXG4gICAgZGF0ZTogKChhcmcpID0+IFpvZERhdGUuY3JlYXRlKHsgLi4uYXJnLCBjb2VyY2U6IHRydWUgfSkpLFxufTtcbmV4cG9ydCB7IGFueVR5cGUgYXMgYW55LCBhcnJheVR5cGUgYXMgYXJyYXksIGJpZ0ludFR5cGUgYXMgYmlnaW50LCBib29sZWFuVHlwZSBhcyBib29sZWFuLCBkYXRlVHlwZSBhcyBkYXRlLCBkaXNjcmltaW5hdGVkVW5pb25UeXBlIGFzIGRpc2NyaW1pbmF0ZWRVbmlvbiwgZWZmZWN0c1R5cGUgYXMgZWZmZWN0LCBlbnVtVHlwZSBhcyBlbnVtLCBmdW5jdGlvblR5cGUgYXMgZnVuY3Rpb24sIGluc3RhbmNlT2ZUeXBlIGFzIGluc3RhbmNlb2YsIGludGVyc2VjdGlvblR5cGUgYXMgaW50ZXJzZWN0aW9uLCBsYXp5VHlwZSBhcyBsYXp5LCBsaXRlcmFsVHlwZSBhcyBsaXRlcmFsLCBtYXBUeXBlIGFzIG1hcCwgbmFuVHlwZSBhcyBuYW4sIG5hdGl2ZUVudW1UeXBlIGFzIG5hdGl2ZUVudW0sIG5ldmVyVHlwZSBhcyBuZXZlciwgbnVsbFR5cGUgYXMgbnVsbCwgbnVsbGFibGVUeXBlIGFzIG51bGxhYmxlLCBudW1iZXJUeXBlIGFzIG51bWJlciwgb2JqZWN0VHlwZSBhcyBvYmplY3QsIG9ib29sZWFuLCBvbnVtYmVyLCBvcHRpb25hbFR5cGUgYXMgb3B0aW9uYWwsIG9zdHJpbmcsIHBpcGVsaW5lVHlwZSBhcyBwaXBlbGluZSwgcHJlcHJvY2Vzc1R5cGUgYXMgcHJlcHJvY2VzcywgcHJvbWlzZVR5cGUgYXMgcHJvbWlzZSwgcmVjb3JkVHlwZSBhcyByZWNvcmQsIHNldFR5cGUgYXMgc2V0LCBzdHJpY3RPYmplY3RUeXBlIGFzIHN0cmljdE9iamVjdCwgc3RyaW5nVHlwZSBhcyBzdHJpbmcsIHN5bWJvbFR5cGUgYXMgc3ltYm9sLCBlZmZlY3RzVHlwZSBhcyB0cmFuc2Zvcm1lciwgdHVwbGVUeXBlIGFzIHR1cGxlLCB1bmRlZmluZWRUeXBlIGFzIHVuZGVmaW5lZCwgdW5pb25UeXBlIGFzIHVuaW9uLCB1bmtub3duVHlwZSBhcyB1bmtub3duLCB2b2lkVHlwZSBhcyB2b2lkLCB9O1xuZXhwb3J0IGNvbnN0IE5FVkVSID0gSU5WQUxJRDtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2l6aW5nLnRzIFx1MjAxNCBTaGFyZWQgcGVyLWJsb2NrIHNpemluZyBmcmFnbWVudCAodmFyaWFibGUgYmxvY2sgc2l6aW5nLCBEcm9wIDEpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gT25lIHVuaWZpZWQgbWVjaGFuaXNtIGZvciBcInRoaXMgYmxvY2sgcmVuZGVycyBuYXJyb3dlciB0aGFuIGl0cyBjb250YWluZXJcIjpcbi8vIGFuIG9wdGlvbmFsIHdpZHRoIEZSQUNUSU9OIHBsdXMgYW4gb3B0aW9uYWwgYWxpZ25tZW50LiBBcHBsaWVkIHRvZGF5IHRvXG4vLyBJbWFnZUJsb2NrIGFuZCBNYXRoQmxvY2sgKHRoZSBzaXphYmxlIHNldCB3aXRoIGEgcmVhbCBhdXRob3Jpbmcgc3VyZmFjZSk7XG4vLyBleHRlbmRzIHRvIG90aGVyIGJsb2NrcyBhZGRpdGl2ZWx5IHdoZW4gdGhlaXIgZWRpdGluZyBVSSBsYW5kcy4gRGVzaWduOlxuLy8gZG9jcy9kZXNpZ24vdmFyaWFibGUtYmxvY2stc2l6aW5nLm1kLlxuLy9cbi8vIFJlZmxvdy1zYWZlIGJ5IGNvbnN0cnVjdGlvbjogd2lkdGggaXMgcmVsYXRpdmUgKGEgZnJhY3Rpb24gb2Ygd2hhdGV2ZXJcbi8vIGNvbnRhaW5lciB0aGUgYmxvY2sgc2l0cyBpbiBcdTIwMTQgcGFnZSBvciBjb2x1bW4gY2VsbCksIG5ldmVyIGFic29sdXRlIHBpeGVscyxcbi8vIGFuZCBhIG5hcnJvd2VkIGJsb2NrIHN0YXlzIGluIG5vcm1hbCBmbG93IChubyB3cmFwLWFyb3VuZC9mbG9hdCksIHNvIHByaW50XG4vLyBwYWdpbmF0aW9uIGFuZCB0aGUgZm9sZGFibGUncyBoZWlnaHQgbWVhc3VyZW1lbnQga2VlcCB3b3JraW5nLlxuLy9cbi8vIHdpZHRoIFx1MjAxNCBmcmFjdGlvbiBvZiB0aGUgY29udGFpbmVyJ3MgY29udGVudCB3aWR0aCwgaW4gKDAsIDFdLiBBYnNlbnQgPSBmdWxsXG4vLyB3aWR0aCAodG9kYXkncyBiZWhhdmlvcikuIFRoZSBlZGl0b3IgVUkgc25hcHMgdG8gY2xlYW4gc3RvcHMgKDI1LzMzLzUwLzY2L1xuLy8gNzUvMTAwJSkgYnV0IHRoZSBzY2hlbWEgYWNjZXB0cyBhbnkgZnJhY3Rpb24gc28gZmluZS1ncmFpbmVkIGRyYWdzIHZhbGlkYXRlLlxuLy9cbi8vIGFsaWduIFx1MjAxNCB3aGVyZSB0aGUgbmFycm93ZWQgYmxvY2sgc2l0cyBob3Jpem9udGFsbHkuIEFic2VudCA9IGNlbnRlciAodGhlXG4vLyBuYXR1cmFsIHJlYWQgZm9yIGZpZ3VyZXMgb24gYSB3b3Jrc2hlZXQpOyBvbmx5IG1lYW5pbmdmdWwgd2hlbiB3aWR0aCBpc1xuLy8gcHJlc2VudCwgYW5kIHRoZSByZW5kZXJlciBpZ25vcmVzIGl0IG90aGVyd2lzZS4gU3RvcmVkIG9ubHkgd2hlbiB3aWR0aCBpc1xuLy8gc2V0IGFuZCB0aGUgdmFsdWUgaXMgJ2xlZnQnLydyaWdodCcsIHNvIHJvdW5kLXRyaXAgZXF1YWxpdHkgaG9sZHMgZm9yIHRoZVxuLy8gZGVmYXVsdCBjYXNlLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5cbmV4cG9ydCBjb25zdCBCbG9ja0FsaWduID0gei5lbnVtKFsnbGVmdCcsICdjZW50ZXInLCAncmlnaHQnXSk7XG5leHBvcnQgdHlwZSBCbG9ja0FsaWduID0gei5pbmZlcjx0eXBlb2YgQmxvY2tBbGlnbj47XG5cbi8vIEZyYWN0aW9uIG9mIGNvbnRhaW5lciB3aWR0aC4gZ3QoMCkgbm90IG1pbigwKSBcdTIwMTQgYSB6ZXJvLXdpZHRoIGJsb2NrIGlzIGFcbi8vIGhpZGRlbiBibG9jaywgd2hpY2ggaXMgYSBkaWZmZXJlbnQgKG5vbmV4aXN0ZW50KSBmZWF0dXJlLlxuZXhwb3J0IGNvbnN0IEJsb2NrV2lkdGhGcmFjdGlvbiA9IHoubnVtYmVyKCkuZ3QoMCkubWF4KDEpO1xuXG4vLyBTcHJlYWQgaW50byBhIGJsb2NrJ3Mgei5vYmplY3Qoey4uLn0pIHNoYXBlLiBBIHBsYWluIG9iamVjdCAobm90IGEgWm9kXG4vLyBzY2hlbWEpIHNvIGVhY2ggYmxvY2sga2VlcHMgYSBmbGF0IGZpZWxkIGxpc3QgYW5kIGRpc2NyaW1pbmF0ZWRVbmlvbiBrZWVwc1xuLy8gd29ya2luZyB1bnRvdWNoZWQuXG5leHBvcnQgY29uc3Qgc2l6aW5nRmllbGRzID0ge1xuICB3aWR0aDogQmxvY2tXaWR0aEZyYWN0aW9uLm9wdGlvbmFsKCksXG4gIGFsaWduOiBCbG9ja0FsaWduLm9wdGlvbmFsKCksXG59O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgc2l6aW5nRmllbGRzIH0gZnJvbSAnLi4vc2l6aW5nLmpzJztcblxuLy8gQSBjcm9wIHdpbmRvdzogdGhlIHZpc2libGUgcmVjdGFuZ2xlIGluc2lkZSB0aGUgc291cmNlIGltYWdlLCBhcyBmcmFjdGlvbnMgb2Zcbi8vIHRoZSBzb3VyY2UncyBvd24gd2lkdGgvaGVpZ2h0LiB4LHkgPSB0b3AtbGVmdCBvZiB0aGUgd2luZG93OyB3LGggPSBpdHMgc2l6ZS5cbi8vIFRoZSB3aW5kb3cgbXVzdCBzdGF5IGluc2lkZSB0aGUgc291cmNlICh4K3cgXHUyMjY0IDEsIHkraCBcdTIyNjQgMSkuIEEgdGlueSBlcHNpbG9uXG4vLyBhYnNvcmJzIGZsb2F0IGVycm9yIGZyb20gdGhlIGVkaXRvcidzIHB4XHUyMTkyZnJhY3Rpb24gbWF0aC4gVGhlIHJlbmRlcmVyIGlzIHB1cmVcbi8vIChubyBpbWFnZSBkaW1lbnNpb25zKSwgc28gdGhlIGNyb3AgcGl4ZWwgYXNwZWN0IGlzIGRlcml2ZWQgZnJvbSB0aGUgc2VwYXJhdGVseVxuLy8gc3RvcmVkIGBzcmNBc3BlY3RgIChzZWUgSW1hZ2VCbG9jaykuIERlc2lnbjogZG9jcy9kZXNpZ24vaW1hZ2UtY3JvcC5tZC5cbmNvbnN0IENST1BfRVBTSUxPTiA9IDFlLTY7XG5leHBvcnQgY29uc3QgQ3JvcFJlY3QgPSB6XG4gIC5vYmplY3Qoe1xuICAgIHg6IHoubnVtYmVyKCkubWluKDApLmx0KDEpLFxuICAgIHk6IHoubnVtYmVyKCkubWluKDApLmx0KDEpLFxuICAgIHc6IHoubnVtYmVyKCkuZ3QoMCkubWF4KDEpLFxuICAgIGg6IHoubnVtYmVyKCkuZ3QoMCkubWF4KDEpLFxuICB9KVxuICAucmVmaW5lKFxuICAgIChjKSA9PiBjLnggKyBjLncgPD0gMSArIENST1BfRVBTSUxPTiAmJiBjLnkgKyBjLmggPD0gMSArIENST1BfRVBTSUxPTixcbiAgICB7IG1lc3NhZ2U6ICdjcm9wIHdpbmRvdyBtdXN0IHN0YXkgd2l0aGluIHRoZSBzb3VyY2UgKHgrdyBcdTIyNjQgMSwgeStoIFx1MjI2NCAxKScgfSxcbiAgKTtcbmV4cG9ydCB0eXBlIENyb3BSZWN0ID0gei5pbmZlcjx0eXBlb2YgQ3JvcFJlY3Q+O1xuXG4vLyBQaGFzZSAxOiBVUkwtb25seS4gTm8gdXBsb2FkIHBpcGVsaW5lOyB0ZWFjaGVycyBwYXN0ZSBhIHB1YmxpYyBVUkwuXG4vLyBQaGFzZSAyKzogYSBzZXBhcmF0ZSB2YXJpYW50IHdpdGggYSBTdXBhYmFzZSBTdG9yYWdlIHVwbG9hZCwgd2l0aCBzcmNcbi8vIHBvaW50aW5nIHRvIGEgc2lnbmVkIFVSTC4gU2NoZW1hIGlzIGZvcndhcmQtY29tcGF0aWJsZSBcdTIwMTQgYWRkaW5nIGEgbmV3XG4vLyBgc291cmNlYCBkaXNjcmltaW5hdG9yIGZpZWxkIGxhdGVyIGlzIG5vbi1icmVha2luZyBpZiBleGlzdGluZyByb3dzIGFyZVxuLy8gdHJlYXRlZCBhcyBgc291cmNlOiAndXJsJ2AgYnkgZGVmYXVsdC5cbmV4cG9ydCBjb25zdCBJbWFnZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnaW1hZ2UnKSxcbiAgc3JjOiB6LnN0cmluZygpLnVybCgpLFxuICAvLyBhbHQgaXMgcmVxdWlyZWQgZm9yIGFjY2Vzc2liaWxpdHkgYnV0IGRlZmF1bHRzIHRvIGVtcHR5IHN0cmluZyBmb3JcbiAgLy8gZGVjb3JhdGl2ZSBpbWFnZXMuIEVkaXRvcnMgc2hvdWxkIHdhcm4gKG5vdCBibG9jaykgb24gZW1wdHkgYWx0LlxuICBhbHQ6IHouc3RyaW5nKCkuZGVmYXVsdCgnJyksXG4gIGNhcHRpb246IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgLy8gVmFyaWFibGUgYmxvY2sgc2l6aW5nOiBvcHRpb25hbCB3aWR0aCBmcmFjdGlvbiArIGFsaWdubWVudCAoc2l6aW5nLnRzKS5cbiAgLy8gVGhpcyBJUyB0aGUgaW1hZ2UgZGlzcGxheS1zaXplIG1lY2hhbmlzbSBcdTIwMTQgbm8gc2VwYXJhdGUgaW50cmluc2ljIHNpemUuXG4gIC4uLnNpemluZ0ZpZWxkcyxcbiAgLy8gQ3JvcCAocmVmcmFtZSkgXHUyMDE0IHRoZSB2aXNpYmxlIHN1Yi1yZWN0YW5nbGUgb2YgdGhlIHNvdXJjZSAoZG9jcy9kZXNpZ24vXG4gIC8vIGltYWdlLWNyb3AubWQpLiBgc3JjQXNwZWN0YCAodGhlIHNvdXJjZSdzIG5hdHVyYWwgVy9IIHJhdGlvKSBsZXRzIHRoZSBwdXJlXG4gIC8vIHJlbmRlcmVyIGRlcml2ZSB0aGUgY3JvcCBwaXhlbCBhc3BlY3QgQSA9IHNyY0FzcGVjdFx1MDBCNyh3L2gpIHdpdGhvdXQgcmVhZGluZ1xuICAvLyBpbWFnZSBkaW1lbnNpb25zLiBTdG9yZWQgQk9USC1PUi1ORUlUSEVSOiBhbiB1bmNyb3BwZWQgaW1hZ2UgY2Fycmllc1xuICAvLyBuZWl0aGVyIChieXRlLWlkZW50aWNhbCB0byB0b2RheSkuIFRoZSBwYWlyaW5nIGlzIGVuZm9yY2VkIGluIHRoZSBlZGl0b3IgK1xuICAvLyBzZXJpYWxpemUgKG5vdCBhIHNjaGVtYSAucmVmaW5lIFx1MjAxNCBJbWFnZUJsb2NrIGlzIGEgZGlzY3JpbWluYXRlZFVuaW9uIG1lbWJlclxuICAvLyBhbmQgcmVmaW5lZCBvYmplY3RzIGNhbid0IGJlIGRpc2NyaW1pbmF0ZWQpOyBzZWUgc2VyaWFsaXplLnRzICsgQ1ItSU5WLWJvdGguXG4gIGNyb3A6IENyb3BSZWN0Lm9wdGlvbmFsKCksXG4gIHNyY0FzcGVjdDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIEltYWdlQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBJbWFnZUJsb2NrPjtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gZ3JhcGgtcHJpbWl0aXZlcy50cyBcdTIwMTQgY29vcmRpbmF0ZS1wbGFuZSBwcmltaXRpdmVzLCBkZXBlbmRlbmN5LWZyZWVcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgYXhpcyAvIGZ1bmN0aW9uLW1vZGVsIC8gZHJhd2FibGUgdm9jYWJ1bGFyeSBzaGFyZWQgYnkgZXZlcnkgZ3JhcGgtc2hhcGVkXG4vLyBzdXJmYWNlOiBpbnRlcmFjdGl2ZV9ncmFwaCAodGhlIGdyYWRlZCBibG9jayksIGdyYXBoX2ZpZ3VyZSAodGhlIHN0YXRpY1xuLy8gcGljdHVyZSksIG11bHRpcGxlX2Nob2ljZSBjaG9pY2UgZmlndXJlcywgbWF0Y2hpbmcgc2lkZXMsIG51bWJlcl9saW5lXG4vLyAoRW5kcG9pbnRTdHlsZSksIGFuZCBkYXRhX3Bsb3QuXG4vL1xuLy8gVGhlc2Ugc2NoZW1hcyBsaXZlIEhFUkUsIGluIGEgbGVhZiBtb2R1bGUgdGhhdCBpbXBvcnRzIG5vdGhpbmcgYnV0IHpvZCxcbi8vIHJhdGhlciB0aGFuIGluIGJsb2Nrcy9pbnRlcmFjdGl2ZS1ncmFwaC50cyB3aGVyZSB0aGV5IGdyZXcgdXAuIFRoZSByZWFzb24gaXNcbi8vIGEgaGFyZCBvbmUsIG5vdCB0aWRpbmVzczogaW50ZXJhY3RpdmUtZ3JhcGgudHMgaW1wb3J0cyBJbmxpbmVOb2RlIGZyb21cbi8vIGlubGluZS50cyAoaXRzIHByb21wdC9mZWVkYmFjay9zb2x1dGlvbiBmaWVsZHMpLCBzbyBhbnl0aGluZyByZWFjaGluZyB0aGVzZVxuLy8gcHJpbWl0aXZlcyBUSFJPVUdIIGl0IGluaGVyaXRzIGEgZGVwZW5kZW5jeSBvbiBpbmxpbmUudHMuIFdoZW4gaW5saW5lLnRzXG4vLyBpdHNlbGYgbmVlZHMgdGhlbSBcdTIwMTQgRGVmaW5pdGlvbkJsb2NrIGFkbWl0cyBhIGdyYXBoX2ZpZ3VyZSwgc2VlIGlubGluZS50cyBcdTIwMTRcbi8vIHRoYXQgY2xvc2VzIHRoZSBjeWNsZSBpbmxpbmUudHMgLT4gZ3JhcGgtZmlndXJlLnRzIC0+IGludGVyYWN0aXZlLWdyYXBoLnRzIC0+XG4vLyBpbmxpbmUudHMsIGFuZCB0aGUgY3ljbGUgaXMgZmF0YWwgcmF0aGVyIHRoYW4gY29zbWV0aWM6IGludGVyYWN0aXZlLWdyYXBoLnRzXG4vLyBldmFsdWF0ZXMgYHouYXJyYXkoSW5saW5lTm9kZSlgIGF0IG1vZHVsZSBzY29wZSwgc28gYSBwYXJ0aWFsbHktaW5pdGlhbGl6ZWRcbi8vIGlubGluZS5qcyB0aHJvd3MgYSBURFogUmVmZXJlbmNlRXJyb3IgYXQgaW1wb3J0IHRpbWUuXG4vL1xuLy8gYmxvY2tzL2ludGVyYWN0aXZlLWdyYXBoLnRzIHJlLWV4cG9ydHMgZXZlcnl0aGluZyBoZXJlLCBzbyBldmVyeSBleGlzdGluZ1xuLy8gaW1wb3J0ZXIga2VlcHMgaXRzIGN1cnJlbnQgaW1wb3J0IHBhdGggYW5kIGlkZW50aXR5IFx1MjAxNCBub3RoaW5nIG1vdmVkIGZyb20gYVxuLy8gY29uc3VtZXIncyBwb2ludCBvZiB2aWV3LiBOZXcgaW5saW5lLXJlYWNoYWJsZSBjb2RlIChncmFwaC1maWd1cmUudHMpIGltcG9ydHNcbi8vIGZyb20gdGhpcyBtb2R1bGUgZGlyZWN0bHkuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcblxuLy8gLS0tLSBBeGlzIGNvbmZpZ3VyYXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBjb29yZGluYXRlIHBsYW5lIHRoZSBzdHVkZW50IHdvcmtzIGluLiBHcmFwaCB1bml0cyB0aHJvdWdob3V0IFx1MjAxNCB0b2xlcmFuY2Vcbi8vIGFuZCBncmlkIHN0ZXBzIGFyZSBpbiB0aGUgc2FtZSB1bml0cywgbmV2ZXIgcGl4ZWxzLCBzbyBhIHB1Ymxpc2hlZCBwYWdlIHRoYXRcbi8vIHJlLWxheXMtb3V0IGF0IGEgZGlmZmVyZW50IHNpemUgc3RpbGwgc2NvcmVzIGlkZW50aWNhbGx5LlxuZXhwb3J0IGNvbnN0IEF4aXNDb25maWcgPSB6Lm9iamVjdCh7XG4gIHhNaW46IHoubnVtYmVyKCksXG4gIHhNYXg6IHoubnVtYmVyKCksXG4gIHlNaW46IHoubnVtYmVyKCksXG4gIHlNYXg6IHoubnVtYmVyKCksXG4gIHhHcmlkU3RlcDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLmRlZmF1bHQoMSksXG4gIHlHcmlkU3RlcDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLmRlZmF1bHQoMSksXG4gIHNob3dHcmlkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAvLyBXaGVuIHRydWUsIGEgZHJhZ2dlZCBoYW5kbGUgc25hcHMgdG8gdGhlIG5lYXJlc3QgZ3JpZCBpbnRlcnNlY3Rpb24uIEtleWJvYXJkXG4gIC8vIG51ZGdlIGFsd2F5cyBtb3ZlcyBieSBvbmUgZ3JpZCBzdGVwIHJlZ2FyZGxlc3MgKFNoaWZ0ID0gMC4xIHN0ZXAsIGZpbmUpLlxuICBzbmFwVG9HcmlkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxufSk7XG5leHBvcnQgdHlwZSBBeGlzQ29uZmlnID0gei5pbmZlcjx0eXBlb2YgQXhpc0NvbmZpZz47XG5cbi8vIC0tLS0gRW5kcG9pbnQgc3R5bGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBvcGVuID0gaG9sbG93IGRvdCwgdmFsdWUgRVhDTFVERUQgKGEgc3RyaWN0IGluZXF1YWxpdHkgYm91bmRhcnksIGFuIG9wZW5cbi8vIGludGVydmFsIGVuZCk7IGNsb3NlZCA9IGZpbGxlZCBkb3QsIHZhbHVlIElOQ0xVREVELiBBIHNoYXJlZCB2b2NhYnVsYXJ5IHVzZWRcbi8vIGJ5IGluZXF1YWxpdHkgYm91bmRhcmllcyAoRHJvcCA0OiBzdHJpY3QgXHUyMTkyIG9wZW4pLCBkb21haW4tcmVzdHJpY3RlZCByYXlzIGFuZFxuLy8gc2VnbWVudHMgKERyb3AgNiksIGRpc3BsYXkgc2VnbWVudHMsIGFuZCB0aGUgZnV0dXJlIG51bWJlci1saW5lIGZhbWlseS4gQWRkZWRcbi8vIGFzIGEgZm91bmRhdGlvbiBub3cgKERyb3AgMik7IGNvbnN1bWVycyByZW5kZXIvc2NvcmUgaXQgaW4gdGhlaXIgb3duIGRyb3BzLlxuZXhwb3J0IGNvbnN0IEVuZHBvaW50U3R5bGUgPSB6LmVudW0oWydvcGVuJywgJ2Nsb3NlZCddKTtcbmV4cG9ydCB0eXBlIEVuZHBvaW50U3R5bGUgPSB6LmluZmVyPHR5cGVvZiBFbmRwb2ludFN0eWxlPjtcblxuLy8gRG9tYWluIHJlc3RyaWN0aW9uIG9uIGEgZHJhd24gY3VydmUgKERyb3AgNS82KTogcmF5cyBhbmQgc2VnbWVudHMgb2YgYVxuLy8gZnVuY3Rpb24uIFN0eWxlcyBtYXJrIHdoZXRoZXIgZWFjaCBlbmRwb2ludCBpcyBpbmNsdWRlZCAoY2xvc2VkKSBvciBub3QuXG5leHBvcnQgY29uc3QgQ3VydmVEb21haW4gPSB6Lm9iamVjdCh7XG4gIG1pbjogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBtaW5TdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxuICBtYXg6IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgbWF4U3R5bGU6IEVuZHBvaW50U3R5bGUub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ3VydmVEb21haW4gPSB6LmluZmVyPHR5cGVvZiBDdXJ2ZURvbWFpbj47XG5cbi8vIC0tLS0gRnVuY3Rpb24gbW9kZWxzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFYWNoIGZhbWlseSBjYXJyaWVzIGl0cyBwYXJhbWV0ZXJzICsgYSBwZXItcGFyYW1ldGVyIHRvbGVyYW5jZSwgYW5kIGl0c1xuLy8gcGFyYW1ldGVyIG5hbWVzIE1BVENIIHRoZSBraXQncyByZWdyZXNzaW9uIGZpdHRlcnMgKGdyYXBoLWtpdCBmaXRMaW5lYXIgL1xuLy8gZml0UXVhZHJhdGljIC8gZml0RXhwb25lbnRpYWwgLyBmaXRMb2dhcml0aG1pYykgc28gYSBmaXR0ZWQgY3VydmUgc2NvcmVzXG4vLyBhZ2FpbnN0IHRoZSBrZXkgd2l0aCBubyB0cmFuc2xhdGlvbi4gRm9ybXM6XG4vLyAgIGxpbmVhciAgICAgICB5ID0gc2xvcGVcdTAwQjd4ICsgaW50ZXJjZXB0XG4vLyAgIHF1YWRyYXRpYyAgICB5ID0gYVx1MDBCN3hcdTAwQjIgKyBiXHUwMEI3eCArIGNcbi8vICAgZXhwb25lbnRpYWwgIHkgPSBhXHUwMEI3Ylx1MDJFMyAgICAgICAgICAgIChiID4gMClcbi8vICAgbG9nYXJpdGhtaWMgIHkgPSBhICsgYlx1MDBCN2xuKHgpICAgICAoeCA+IDApXG4vLyAgIHZlcnRpY2FsICAgICB4ID0gayAgICAgICAgICAgICAgIChOT1QgYSB5ID0gZih4KSBjdXJ2ZSBcdTIwMTQgc2NvcmVkIG9uIHgpXG5leHBvcnQgY29uc3QgTGluZWFyTW9kZWwgPSB6Lm9iamVjdCh7XG4gIGZhbWlseTogei5saXRlcmFsKCdsaW5lYXInKSxcbiAgc2xvcGU6IHoubnVtYmVyKCksXG4gIGludGVyY2VwdDogei5udW1iZXIoKSxcbiAgc2xvcGVUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG4gIGludGVyY2VwdFRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgTGluZWFyTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBMaW5lYXJNb2RlbD47XG5cbmV4cG9ydCBjb25zdCBRdWFkcmF0aWNNb2RlbCA9IHoub2JqZWN0KHtcbiAgZmFtaWx5OiB6LmxpdGVyYWwoJ3F1YWRyYXRpYycpLFxuICBhOiB6Lm51bWJlcigpLFxuICBiOiB6Lm51bWJlcigpLFxuICBjOiB6Lm51bWJlcigpLFxuICBhVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBiVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBjVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxufSk7XG5leHBvcnQgdHlwZSBRdWFkcmF0aWNNb2RlbCA9IHouaW5mZXI8dHlwZW9mIFF1YWRyYXRpY01vZGVsPjtcblxuZXhwb3J0IGNvbnN0IEV4cG9uZW50aWFsTW9kZWwgPSB6Lm9iamVjdCh7XG4gIGZhbWlseTogei5saXRlcmFsKCdleHBvbmVudGlhbCcpLFxuICBhOiB6Lm51bWJlcigpLFxuICBiOiB6Lm51bWJlcigpLFxuICBhVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBiVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxufSk7XG5leHBvcnQgdHlwZSBFeHBvbmVudGlhbE1vZGVsID0gei5pbmZlcjx0eXBlb2YgRXhwb25lbnRpYWxNb2RlbD47XG5cbmV4cG9ydCBjb25zdCBMb2dhcml0aG1pY01vZGVsID0gei5vYmplY3Qoe1xuICBmYW1pbHk6IHoubGl0ZXJhbCgnbG9nYXJpdGhtaWMnKSxcbiAgYTogei5udW1iZXIoKSxcbiAgYjogei5udW1iZXIoKSxcbiAgYVRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgYlRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgTG9nYXJpdGhtaWNNb2RlbCA9IHouaW5mZXI8dHlwZW9mIExvZ2FyaXRobWljTW9kZWw+O1xuXG4vLyBBIHZlcnRpY2FsIGxpbmUgeCA9IGsuIEl0IGhhcyBubyB5ID0gZih4KSByZXByZXNlbnRhdGlvbiAoaW5maW5pdGUgc2xvcGUpLCBzb1xuLy8gaXQgY2FuJ3QgcmlkZSB0aGUgcmVncmVzc2lvbiBmaXR0ZXJzIFx1MjAxNCB0aGUga2l0IHNjb3JlcyBpdCBkaXJlY3RseSBvbiB0aGVcbi8vIHN0dWRlbnQncyB4LiBLZXB0IGluIEZ1bmN0aW9uTW9kZWwgKG5vdCBhIHNlcGFyYXRlIGludGVyYWN0aW9uKSBzbyBhdXRob3JpbmcgYVxuLy8gdmVydGljYWwgbGluZSBpcyB0aGUgc2FtZSBcInR5cGUgYW4gZXF1YXRpb25cIiBmbG93IGFzIGFueSBvdGhlciBmYW1pbHkuXG5leHBvcnQgY29uc3QgVmVydGljYWxNb2RlbCA9IHoub2JqZWN0KHtcbiAgZmFtaWx5OiB6LmxpdGVyYWwoJ3ZlcnRpY2FsJyksXG4gIHg6IHoubnVtYmVyKCksXG4gIHhUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIFZlcnRpY2FsTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBWZXJ0aWNhbE1vZGVsPjtcblxuLy8gRGlzY3JpbWluYXRlZCBvbiBgZmFtaWx5YCBzbyBjb25zdW1lcnMgYnJhbmNoIHVuaWZvcm1seS4gR3Jvd2luZyBhIGZhbWlseSBpcyBhXG4vLyBuZXcgbWVtYmVyIGhlcmUgKyBhIG5ldyBmaXQvc2NvcmUgYnJhbmNoIGluIHRoZSBraXQgXHUyMDE0IG5vIG90aGVyIGJsb2NrIHRvdWNoZWQuXG5leHBvcnQgY29uc3QgRnVuY3Rpb25Nb2RlbCA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCdmYW1pbHknLCBbXG4gIExpbmVhck1vZGVsLFxuICBRdWFkcmF0aWNNb2RlbCxcbiAgRXhwb25lbnRpYWxNb2RlbCxcbiAgTG9nYXJpdGhtaWNNb2RlbCxcbiAgVmVydGljYWxNb2RlbCxcbl0pO1xuZXhwb3J0IHR5cGUgRnVuY3Rpb25Nb2RlbCA9IHouaW5mZXI8dHlwZW9mIEZ1bmN0aW9uTW9kZWw+O1xuXG4vLyAtLS0tIERyYXdhYmxlcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gYERyYXdhYmxlYCBpcyBkaXNjcmltaW5hdGVkIG9uIGBraW5kYC4gYGN1cnZlYCBSRVVTRVMgRnVuY3Rpb25Nb2RlbCwgc28gdGhlXG4vLyBkYXkgcXVhZHJhdGljL2V4cG9uZW50aWFsL2xvZ2FyaXRobWljIGxhbmQgdGhleSBsaWdodCB1cCBoZXJlIEFORCBpblxuLy8gcGxvdF9mdW5jdGlvbiBhdCBvbmNlLiBBIGBsYWJlbGAgdGV4dC1hbm5vdGF0aW9uIGRyYXdhYmxlIGlzIGRlbGliZXJhdGVseVxuLy8gZGVmZXJyZWQgKHBvaW50LmxhYmVsIGNvdmVycyB0aGUgY29tbW9uIGNhc2UpIFx1MjAxNCBZQUdOSSwgYWRkaXRpdmUgd2hlbiBuZWVkZWQuXG4vLyBBdXRob3JlZCBwZXItZHJhd2FibGUgY29sb3IuIFN0b3JlZCBhcyBhIHBhbGV0dGUgS0VZIChub3QgYSBoZXgpIHNvIGNvbG9yc1xuLy8gc3RheSBzZW1hbnRpYzsgdGhlIGtleSBsaXN0IGlzIGRlZmluZWQgSEVSRSAoZGVwZW5kZW5jeS1mcmVlKSBhbmQgdGhlIGtleSAtPlxuLy8gaGV4IG1hcCBsaXZlcyBpbiBAYWN0aXZpdHkvZ3JhcGgta2l0J3MgRFJBV0FCTEVfUEFMRVRURS4gQSBkcmlmdCBndWFyZCB0ZXN0XG4vLyBrZWVwcyB0aGUgdHdvIGxpc3RzIGluIGxvY2tzdGVwLiBPcHRpb25hbDogYWJzZW50ID0gdGhlIHNoYXJlZCBkZWZhdWx0IGNvbG9yLlxuZXhwb3J0IGNvbnN0IERyYXdhYmxlQ29sb3IgPSB6LmVudW0oW1xuICAnYmx1ZScsXG4gICdpbmRpZ28nLFxuICAndGVhbCcsXG4gICdncmVlbicsXG4gICdhbWJlcicsXG4gICdyZWQnLFxuICAndmlvbGV0JyxcbiAgJ3NsYXRlJyxcbl0pO1xuZXhwb3J0IHR5cGUgRHJhd2FibGVDb2xvclQgPSB6LmluZmVyPHR5cGVvZiBEcmF3YWJsZUNvbG9yPjtcblxuY29uc3QgUG9pbnREcmF3YWJsZSA9IHoub2JqZWN0KHtcbiAga2luZDogei5saXRlcmFsKCdwb2ludCcpLFxuICBhdDogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICBsYWJlbDogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAvLyBvcGVuID0gaG9sbG93IChleGNsdWRlZCksIGNsb3NlZCA9IGZpbGxlZC4gRGVmYXVsdCBjbG9zZWQuXG4gIHN0eWxlOiBFbmRwb2ludFN0eWxlLm9wdGlvbmFsKCksXG4gIGNvbG9yOiBEcmF3YWJsZUNvbG9yLm9wdGlvbmFsKCksXG59KTtcbmNvbnN0IEN1cnZlRHJhd2FibGUgPSB6Lm9iamVjdCh7XG4gIGtpbmQ6IHoubGl0ZXJhbCgnY3VydmUnKSxcbiAgbW9kZWw6IEZ1bmN0aW9uTW9kZWwsXG4gIC8vIERyb3AgNTogZGFzaGVkIGJvdW5kYXJ5ICsgaGFsZi1wbGFuZSBzaGFkaW5nIHR1cm4gYSBkaXNwbGF5IGN1cnZlIGludG8gYVxuICAvLyBwaWN0dXJlZCBpbmVxdWFsaXR5OyBkb21haW4gcmVzdHJpY3RzIGl0IHRvIGEgcmF5L3NlZ21lbnQuXG4gIHN0eWxlOiB6LmVudW0oWydzb2xpZCcsICdkYXNoZWQnXSkub3B0aW9uYWwoKSxcbiAgc2hhZGU6IHouZW51bShbJ2Fib3ZlJywgJ2JlbG93JywgJ2xlZnQnLCAncmlnaHQnXSkub3B0aW9uYWwoKSxcbiAgZG9tYWluOiBDdXJ2ZURvbWFpbi5vcHRpb25hbCgpLFxuICAvLyBDb250aW51YXRpb24gYXJyb3doZWFkcyBvbiBVTkJPVU5ERUQgZW5kcyAodGV4dGJvb2sgY29udmVudGlvbjogYXJyb3cgPVxuICAvLyBcImtlZXBzIGdvaW5nXCIsIGRvdCA9IFwic3RvcHMgaGVyZVwiKS4gRHJhd24gd2hlcmUgdGhlIGN1cnZlIGV4aXRzIHRoZSB2aXNpYmxlXG4gIC8vIHdpbmRvdzsgYW4gYXV0aG9yZWQgZG9tYWluIGJvdW5kIHN1cHByZXNzZXMgdGhhdCBlbmQncyBhcnJvdyAoaXQgZ2V0cyB0aGVcbiAgLy8gb3Blbi9jbG9zZWQgZG90IGluc3RlYWQpLiB1bmRlZmluZWQgPSB0cnVlIFx1MjAxNCBhcnJvd3MgYXJlIHRoZSBjb252ZW50aW9uLFxuICAvLyB0aGlzIGZsYWcgaXMgdGhlIG9wdC1vdXQgKGF1dGhvciBjYWxsIDIwMjYtMDctMTApLlxuICBhcnJvd3M6IHouYm9vbGVhbigpLm9wdGlvbmFsKCksXG4gIGNvbG9yOiBEcmF3YWJsZUNvbG9yLm9wdGlvbmFsKCksXG59KTtcblxuLy8gRHJvcCA1OiBwbG90IEFOWSBwYXJzZWFibGUgZm9ybXVsYSAoc2luKHgpLCByYXRpb25hbHMsIFx1MjAyNikgYnkgc2FtcGxpbmcgXHUyMDE0IHRoZVxuLy8gZXNjYXBlIGhhdGNoIHRoZSBncmFkZWQgZmFtaWxpZXMgZGVsaWJlcmF0ZWx5IGRvbid0IGNvdmVyLiBEaXNwbGF5LW9ubHkuXG5jb25zdCBFeHByZXNzaW9uRHJhd2FibGUgPSB6Lm9iamVjdCh7XG4gIGtpbmQ6IHoubGl0ZXJhbCgnZXhwcmVzc2lvbicpLFxuICBleHByZXNzaW9uOiB6LnN0cmluZygpLm1pbigxKSxcbiAgc3R5bGU6IHouZW51bShbJ3NvbGlkJywgJ2Rhc2hlZCddKS5vcHRpb25hbCgpLFxuICAvLyBDb250aW51YXRpb24gYXJyb3doZWFkcyBhdCBib3RoIHdpbmRvdyBleGl0cyAoc2VlIEN1cnZlRHJhd2FibGUuYXJyb3dzKS5cbiAgYXJyb3dzOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICBjb2xvcjogRHJhd2FibGVDb2xvci5vcHRpb25hbCgpLFxufSk7XG5jb25zdCBTZWdtZW50RHJhd2FibGUgPSB6Lm9iamVjdCh7XG4gIGtpbmQ6IHoubGl0ZXJhbCgnc2VnbWVudCcpLFxuICBmcm9tOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIHRvOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIC8vIERyb3AgNTogb3Blbi9jbG9zZWQgZW5kcG9pbnQgZG90cyAoW2Zyb20sIHRvXSkuIERlZmF1bHQgY2xvc2VkLlxuICBlbmRwb2ludHM6IHoudHVwbGUoW0VuZHBvaW50U3R5bGUsIEVuZHBvaW50U3R5bGVdKS5vcHRpb25hbCgpLFxuICBjb2xvcjogRHJhd2FibGVDb2xvci5vcHRpb25hbCgpLFxufSk7XG5cbi8vIERyb3AgNTogYSByYXkgXHUyMDE0IHN0YXJ0cyBhdCBgZnJvbWAgKG9wZW4vY2xvc2VkKSwgcGFzc2VzIHRocm91Z2ggYHRocm91Z2hgLFxuLy8gcnVucyB0byB0aGUgd2luZG93IGVkZ2UuIFRoZSBwaHlzaWNzLWNsYXNzIHN0YXBsZS5cbmNvbnN0IFJheURyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ3JheScpLFxuICBmcm9tOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIHRocm91Z2g6IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgZnJvbVN0eWxlOiBFbmRwb2ludFN0eWxlLm9wdGlvbmFsKCksXG4gIC8vIENvbnRpbnVhdGlvbiBhcnJvd2hlYWQgb24gdGhlIHVuYm91bmRlZCBlbmQgKHNlZSBDdXJ2ZURyYXdhYmxlLmFycm93cykuXG4gIGFycm93czogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgY29sb3I6IERyYXdhYmxlQ29sb3Iub3B0aW9uYWwoKSxcbn0pO1xuY29uc3QgUG9seWdvbkRyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ3BvbHlnb24nKSxcbiAgdmVydGljZXM6IHouYXJyYXkoei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pKS5taW4oMyksXG4gIGZpbGxlZDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgY29sb3I6IERyYXdhYmxlQ29sb3Iub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IGNvbnN0IERyYXdhYmxlID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ2tpbmQnLCBbXG4gIFBvaW50RHJhd2FibGUsXG4gIEN1cnZlRHJhd2FibGUsXG4gIEV4cHJlc3Npb25EcmF3YWJsZSxcbiAgU2VnbWVudERyYXdhYmxlLFxuICBSYXlEcmF3YWJsZSxcbiAgUG9seWdvbkRyYXdhYmxlLFxuXSk7XG5leHBvcnQgdHlwZSBEcmF3YWJsZSA9IHouaW5mZXI8dHlwZW9mIERyYXdhYmxlPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbi8vIEZyb20gdGhlIGxlYWYgcHJpbWl0aXZlcyBtb2R1bGUsIE5PVCBmcm9tIC4vaW50ZXJhY3RpdmUtZ3JhcGguanMgXHUyMDE0IHRoYXQgZmlsZVxuLy8gaW1wb3J0cyBpbmxpbmUudHMsIGFuZCBpbmxpbmUudHMgaW1wb3J0cyBUSElTIG9uZSAoYSBkZWZpbml0aW9uIG1heSBjb250YWluIGFcbi8vIGdyYXBoIGZpZ3VyZSksIHNvIHJvdXRpbmcgdGhyb3VnaCBpdCB3b3VsZCBjbG9zZSBhIGZhdGFsIG1vZHVsZSBjeWNsZS4gU2VlXG4vLyAuLi9ncmFwaC1wcmltaXRpdmVzLnRzLlxuaW1wb3J0IHsgQXhpc0NvbmZpZywgRHJhd2FibGUgfSBmcm9tICcuLi9ncmFwaC1wcmltaXRpdmVzLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEdyYXBoRmlndXJlQmxvY2sgXHUyMDE0IGEgc3RhdGljIGNvb3JkaW5hdGUtcGxhbmUgcGljdHVyZSAobmV2ZXIgaW50ZXJhY3RpdmUpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEEgcHVyZSBDT05URU5UIGJsb2NrIChkYXRhLWJsb2NrLWNhdGVnb3J5PVwiY29udGVudFwiKTogbm9uLWludGVyYWN0aXZlLFxuLy8gbm9uLW51bWJlcmVkLCBubyBydW50aW1lIHdpcmluZywgbm8gc3VibWlzc2lvbiB3aXJlIGltcGFjdC4gVGhlIHN0YW5kYWxvbmVcbi8vIHByb21vdGlvbiBvZiB0aGUgTUMvbWF0Y2hpbmcgQ2hvaWNlR3JhcGggZmlndXJlICh7IGF4aXMsIGRyYXdhYmxlcyB9KSB0byBhXG4vLyBibG9jaywgYnVpbHQgZm9yIHRoZSByZWZlcmVuY2UgcGFuZWwgXHUyMDE0IFwidGhlc2UgdHdvIGxpbmVzIGFyZSBwYXJhbGxlbFwiLXN0eWxlXG4vLyBwaWN0dXJlcyBvbiBhIGZvcm11bGEgc2hlZXQuXG4vL1xuLy8gUmVuZGVyZWQgc2VydmVyLXNpZGUgYXMgaW5saW5lIFNWRyBieSB0aGUgcmVuZGVyZXIncyBncmFwaC1zdmcgZW5naW5lLCBuZXZlclxuLy8gdGhlIGludGVyYWN0aXZlIGtpdCBcdTIwMTQgc28gaXQgd29ya3Mgb24gcGFwZXIsIGluIHRoZSBwcmludCBib3gsIGFuZCBpbiB0aGVcbi8vIGZsb2F0aW5nIHBhbmVsIHdpdGggemVybyBKUy4gQ29uc2VxdWVuY2UgKHNhbWUgYXMgQ2hvaWNlR3JhcGgpOiBgZXhwcmVzc2lvbmBcbi8vIGRyYXdhYmxlcyBuZWVkIHRoZSBraXQncyBmb3JtdWxhIHBhcnNlciBhbmQgYXJlIE5PVCBkcmF3bjsgYXV0aG9yaW5nXG4vLyBzdXJmYWNlcyBkb24ndCBvZmZlciB0aGVtIGhlcmUuXG4vL1xuLy8gRGVsaWJlcmF0ZWx5IE5PVCBhIGRpc3BsYXktbW9kZSBpbnRlcmFjdGl2ZV9ncmFwaDogdGhhdCBibG9jayBpcyBhIG51bWJlcmVkLVxuLy8gcXVlc3Rpb24gZmFtaWx5IHdpdGggcHJvbXB0L3NvbHV0aW9uL2NvbmZpZGVuY2UgY2hyb21lIGFuZCBraXQgaHlkcmF0aW9uLlxuLy8gVGhpcyBvbmUgY2FuIG5ldmVyIGFjY2VwdCBzdHVkZW50IGlucHV0IGJ5IGNvbnN0cnVjdGlvbiwgd2hpY2ggaXMgdGhlXG4vLyByZWZlcmVuY2UgcGFuZWwncyBjb250cmFjdC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBjb25zdCBHcmFwaEZpZ3VyZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnZ3JhcGhfZmlndXJlJyksXG4gIGF4aXM6IEF4aXNDb25maWcsXG4gIGRyYXdhYmxlczogei5hcnJheShEcmF3YWJsZSkuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCB0eXBlIEdyYXBoRmlndXJlQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBHcmFwaEZpZ3VyZUJsb2NrPjtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gaW5saW5lLnRzIFx1MjAxNCBJbmxpbmUgY29udGVudCBub2Rlc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIElubGluZSBub2RlcyBhcmUgdGhlIGF0b21zIGluc2lkZSBhIGJsb2NrJ3MgYGNvbnRlbnRgIGFycmF5LiBNb3N0IGJsb2Nrc1xuLy8gYWNjZXB0IHRoZSBJbmxpbmVOb2RlIHVuaW9uICh0ZXh0ICsgaW5saW5lIG1hdGgpLiBUaGUgZmlsbF9pbl9ibGFuayBibG9ja1xuLy8gaXMgc3BlY2lhbDogaXQgYWNjZXB0cyBhbiBleHRlbmRlZCB1bmlvbiB0aGF0IGFsc28gaW5jbHVkZXMgQmxhbmtUb2tlbi5cbi8vXG4vLyBEaXNjcmltaW5hdGlvbjogZXZlcnkgaW5saW5lIG5vZGUgaGFzIGEgYHR5cGVgIGxpdGVyYWwuIFpvZCdzXG4vLyBkaXNjcmltaW5hdGVkVW5pb24ga2V5cyBvbiBpdCwgd2hpY2ggZ2l2ZXMgdXMgbmFycm93IHR5cGVzIGFmdGVyIHBhcnNpbmdcbi8vIGFuZCBjbGVhciBlcnJvciBtZXNzYWdlcyBvbiBtYWxmb3JtZWQgZGF0YS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuLy8gQm90aCBpbXBvcnRzIGFyZSBMRUFGLVNBRkUgXHUyMDE0IG5laXRoZXIgbW9kdWxlIGltcG9ydHMgaW5saW5lLnRzLCBzbyBuZWl0aGVyXG4vLyBjcmVhdGVzIGEgY3ljbGUuIHNpemluZy5qcyBhbmQgYmxvY2tzL2ltYWdlLmpzJ3MgQ3JvcFJlY3QgYXJlIHpvZC1vbmx5O1xuLy8gYmxvY2tzL2dyYXBoLWZpZ3VyZS5qcyByZWFjaGVzIGl0cyBheGlzL2RyYXdhYmxlIHByaW1pdGl2ZXMgdmlhIHRoZSBsZWFmXG4vLyBncmFwaC1wcmltaXRpdmVzLnRzIHByZWNpc2VseSBzbyB0aGF0IHRoaXMgaW1wb3J0IGlzIHBvc3NpYmxlLiBEbyBub3Qgc3dhcFxuLy8gZWl0aGVyIGZvciBhIGJsb2Nrcy8gbW9kdWxlIHRoYXQgY2FycmllcyBJbmxpbmVOb2RlLlxuaW1wb3J0IHsgc2l6aW5nRmllbGRzLCB0eXBlIEJsb2NrQWxpZ24gfSBmcm9tICcuL3NpemluZy5qcyc7XG5pbXBvcnQgeyBDcm9wUmVjdCB9IGZyb20gJy4vYmxvY2tzL2ltYWdlLmpzJztcbmltcG9ydCB7IEdyYXBoRmlndXJlQmxvY2sgfSBmcm9tICcuL2Jsb2Nrcy9ncmFwaC1maWd1cmUuanMnO1xuXG4vLyAtLS0tIE1hcmtzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gTWFya3MgYXJlIGZvcm1hdHRpbmcgYXBwbGllZCB0byBhIHJ1biBvZiB0ZXh0IFx1MjAxNCBub3QgbmVzdGVkIGVsZW1lbnRzIChub1xuLy8gPGVtPjxzdHJvbmc+Li4uPC9zdHJvbmc+PC9lbT4gc3RydWN0dXJlKTsgYSBzaW5nbGUgVGV4dE5vZGUgY2FuIGNhcnJ5XG4vLyBzZXZlcmFsLiBPcmRlciBkb2Vzbid0IG1hdHRlciBcdTIwMTQgcmVuZGVyIG91dHB1dCBpcyBjYW5vbmljYWxpemVkLlxuLy9cbi8vIEVhY2ggbWFyayBpcyBhbiBPQkpFQ1Qgd2l0aCBhIGB0eXBlYCBkaXNjcmltaW5hbnQuIFNpbXBsZSBtYXJrcyAoYm9sZCwgZXRjLilcbi8vIGNhcnJ5IG9ubHkgYHR5cGVgOyBhdHRyaWJ1dGUtY2FycnlpbmcgbWFya3MgKGUuZy4gYGRlZmluaXRpb25gKSBoYW5nIHRoZWlyXG4vLyBkYXRhIG9mZiB0aGUgc2FtZSBvYmplY3QuIExlZ2FjeSBkb2N1bWVudHMgc3RvcmVkIG1hcmtzIGFzIGJhcmUgc3RyaW5nc1xuLy8gKCdib2xkJyk7IHRoZSBwcmVwcm9jZXNzIGJlbG93IHVwZ3JhZGVzIHRob3NlIHRvIHRoZSBvYmplY3QgZm9ybSBvbiByZWFkLCBzb1xuLy8gb2xkIGFjdGl2aXRpZXMga2VlcCBwYXJzaW5nIHdpdGhvdXQgYSBzY2hlbWFWZXJzaW9uIGJ1bXAuIE5ldyBjb2RlIGFsd2F5c1xuLy8gd3JpdGVzIHRoZSBvYmplY3QgZm9ybS5cbmV4cG9ydCBjb25zdCBTSU1QTEVfTUFSS19UWVBFUyA9IFtcbiAgJ2JvbGQnLFxuICAnaXRhbGljJyxcbiAgJ3VuZGVybGluZScsXG4gICdjb2RlJyxcbiAgJ3N1YnNjcmlwdCcsXG4gICdzdXBlcnNjcmlwdCcsXG5dIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgU2ltcGxlTWFya1R5cGUgPSAodHlwZW9mIFNJTVBMRV9NQVJLX1RZUEVTKVtudW1iZXJdO1xuXG5jb25zdCBCb2xkTWFyayA9IHoub2JqZWN0KHsgdHlwZTogei5saXRlcmFsKCdib2xkJykgfSk7XG5jb25zdCBJdGFsaWNNYXJrID0gei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ2l0YWxpYycpIH0pO1xuY29uc3QgVW5kZXJsaW5lTWFyayA9IHoub2JqZWN0KHsgdHlwZTogei5saXRlcmFsKCd1bmRlcmxpbmUnKSB9KTtcbmNvbnN0IENvZGVNYXJrID0gei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ2NvZGUnKSB9KTtcbmNvbnN0IFN1YnNjcmlwdE1hcmsgPSB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnc3Vic2NyaXB0JykgfSk7XG5jb25zdCBTdXBlcnNjcmlwdE1hcmsgPSB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnc3VwZXJzY3JpcHQnKSB9KTtcblxuLy8gVGhlIGF0dHJpYnV0ZS1mcmVlIG1hcmtzIGFzIGEgdW5pb24uIERlZmluaXRpb24gY29udGVudCAoYmVsb3cpIGFsbG93cyBvbmx5XG4vLyB0aGVzZSBcdTIwMTQgYSBkZWZpbml0aW9uIGNhbiBiZSBmb3JtYXR0ZWQgYnV0IGNhbm5vdCBpdHNlbGYgY29udGFpbiBhIG5lc3RlZFxuLy8gZGVmaW5pdGlvbiwgd2hpY2ggYWxzbyBrZWVwcyB0aGUgc2NoZW1hIG5vbi1yZWN1cnNpdmUuXG5jb25zdCBTaW1wbGVNYXJrID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIEJvbGRNYXJrLFxuICBJdGFsaWNNYXJrLFxuICBVbmRlcmxpbmVNYXJrLFxuICBDb2RlTWFyayxcbiAgU3Vic2NyaXB0TWFyayxcbiAgU3VwZXJzY3JpcHRNYXJrLFxuXSk7XG5cbi8vIC0tLS0gTWF0aCBwcm9tcHQgKE1vZGVsIEE6IGluLWVxdWF0aW9uIGJsYW5rKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIGdyYWRlYWJsZSBnYXAgSU5TSURFIGEgcmVuZGVyZWQgZXF1YXRpb24gXHUyMDE0IHRoZSBNYXRoTGl2ZSBgXFxwbGFjZWhvbGRlcltpZF17fWBcbi8vIGZlYXR1cmUuIGBpZGAgbWF0Y2hlcyB0aGUgcGxhY2Vob2xkZXIgbWFya2VyIGluIHRoZSBvd25pbmcgbm9kZSdzIGBsYXRleGA7IHRoZVxuLy8gc3R1ZGVudCdzIHR5cGVkIG1hdGggZXhwcmVzc2lvbiBpcyBncmFkZWQgZXhhY3RseSBsaWtlIGEgJ21hdGgnIGZpbGwtaW4tYmxhbmtcbi8vIChudW1lcmljLXNhbXBsaW5nIGVxdWl2YWxlbmNlLCAyYSBcdTIyNjEgYSthIFx1MjI2MSBhKjIpLiBNb2RlbCBBIHJldXNlcyB0aGUgZXhpc3Rpbmdcbi8vIGBzdWJtaXNzaW9ucy5yZXNwb25zZXMuYmxhbmtzYCBtYXAga2V5ZWQgYnkgdGhpcyBpZCwgc28gcHJvbXB0cyBuZWVkIE5PIG5ld1xuLy8gd2lyZSBzaGFwZS4gQSBnYXAgaXMgaW5oZXJlbnRseSBhIG1hdGggYW5zd2VyLCBzbyB0aGVyZSBpcyBubyBgYW5zd2VyVHlwZWBcbi8vIGhlcmUgXHUyMDE0IGBlcXVpdmFsZW5jZWAgKyBgdG9sZXJhbmNlYCBhcmUgdGhlIHNhbWUgZ3JhZGluZyBrbm9icyBhICdtYXRoJ1xuLy8gQmxhbmtUb2tlbiBjYXJyaWVzLCByZXVzZWQgdmVyYmF0aW0uIFNlZSBkb2NzL2Rlc2lnbi9tYXRoLWJsYW5rcy5tZCAoTW9kZWwgQSkuXG5leHBvcnQgY29uc3QgTWF0aFByb21wdCA9IHoub2JqZWN0KHtcbiAgLy8gTWF0Y2hlcyB0aGUgYFxccGxhY2Vob2xkZXJbaWRde31gIG1hcmtlciBpbiB0aGUgb3duaW5nIG5vZGUncyBsYXRleC4gTk9UIGFcbiAgLy8gdXVpZDogTWF0aExpdmUgcGxhY2Vob2xkZXIgaWRzIG1heSBub3QgY29udGFpbiBzcGFjZXMvc3BlY2lhbCBjaGFyYWN0ZXJzXG4gIC8vICh1dWlkIGh5cGhlbnMgYXJlIHVuc2FmZSksIHNvIHRoZSBlZGl0b3IgbWludHMgYSBNYXRoTGl2ZS1zYWZlIHRva2VuLlxuICAvLyBEb2N1bWVudC13aWRlIHVuaXF1ZW5lc3MgKGl0IGtleXMgaW50byB0aGUgYmxhbmtzIG1hcCkgaXMgYW4gYXV0aG9yaW5nLXRpbWVcbiAgLy8gaW52YXJpYW50LCBub3QgYSBzY2hlbWEgY29uc3RyYWludC5cbiAgaWQ6IHouc3RyaW5nKCkubWluKDEpLFxuICBhbnN3ZXI6IHouc3RyaW5nKCkubWluKDEpLFxuICAvLyBBbHRlcm5hdGl2ZSBhY2NlcHRhYmxlIGZvcm1zIChcImFsc28gYWNjZXB0XCIpLiBFbXB0eSBhcnJheSBpcyB0aGUgY29tbW9uIGNhc2UuXG4gIGFjY2VwdGFibGVBbnN3ZXJzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICAvLyBFcXVpdmFsZW5jZSBtb2RlOiAndmFsdWUnIChkZWZhdWx0LCBhbnkgZXhwcmVzc2lvbiB0aGF0IGV2YWx1YXRlcyBlcXVhbCkgb3JcbiAgLy8gJ2V4YWN0LWZvcm0nIChub3JtYWxpemVkLXN0cmluZyBtYXRjaCkuIEFic2VudCA9ICd2YWx1ZScuIE1pcnJvcnMgQmxhbmtUb2tlbi5cbiAgZXF1aXZhbGVuY2U6IHouZW51bShbJ3ZhbHVlJywgJ2V4YWN0LWZvcm0nXSkub3B0aW9uYWwoKSxcbiAgLy8gQWJzb2x1dGUgc2FtcGxpbmcgdG9sZXJhbmNlLiBBYnNlbnQgPSBubyBleHRyYSBzbGFjay4gTWlycm9ycyBCbGFua1Rva2VuLlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubWluKDApLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE1hdGhQcm9tcHQgPSB6LmluZmVyPHR5cGVvZiBNYXRoUHJvbXB0PjtcblxuLy8gLS0tLSBJbmxpbmUgbWF0aCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIExhVGVYIHNvdXJjZSBmb3IgS2FUZVguIFN0b3JlZCB2ZXJiYXRpbTsgcmVuZGVyZWQgYXQgcmVuZGVyIHRpbWUuIFRoZVxuLy8gcmVuZGVyZXIgaXMgdG9sZXJhbnQgb2YgaW52YWxpZCBMYVRlWCAocmVuZGVycyBhbiBlcnJvciBpbmRpY2F0b3IgcmF0aGVyXG4vLyB0aGFuIGNyYXNoaW5nKSBzbyBzYXZpbmcgYSBkb2Mgd2l0aCBicm9rZW4gbWF0aCBkb2Vzbid0IGxvY2sgdGhlIGVkaXRvci5cbmV4cG9ydCBjb25zdCBJbmxpbmVNYXRoTm9kZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdtYXRoX2lubGluZScpLFxuICBsYXRleDogei5zdHJpbmcoKSxcbiAgLy8gTW9kZWwgQTogb3B0aW9uYWwgaW4tZXF1YXRpb24gZ3JhZGVhYmxlIGdhcHMgKFx1MDBBN01hdGhQcm9tcHQpLiBPcHRpb25hbCB3aXRoXG4gIC8vIE5PIGRlZmF1bHQgc28gYSBtYXRoIG5vZGUgYXV0aG9yZWQgYmVmb3JlIE1vZGVsIEEgXHUyMDE0IG9yIG9uZSB3aXRoIG5vIGdhcHMgXHUyMDE0XG4gIC8vIHJlLXNlcmlhbGl6ZXMgQllURS1JREVOVElDQUxMWSAoYSBgLmRlZmF1bHQoW10pYCB3b3VsZCBtYXRlcmlhbGl6ZSBgcHJvbXB0czpcbiAgLy8gW11gIG9uIGV2ZXJ5IGxlZ2FjeSBub2RlKS4gU2FtZSBvcHRpb25hbC1uby1kZWZhdWx0IGRpc2NpcGxpbmUgYXNcbiAgLy8gQmxhbmtUb2tlbi5hbnN3ZXJUeXBlL3RvbGVyYW5jZS4gU2VlIGRvY3MvZGVzaWduL21hdGgtYmxhbmtzLm1kIChNb2RlbCBBKS5cbiAgcHJvbXB0czogei5hcnJheShNYXRoUHJvbXB0KS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBJbmxpbmVNYXRoTm9kZSA9IHouaW5mZXI8dHlwZW9mIElubGluZU1hdGhOb2RlPjtcblxuLy8gLS0tLSBIYXJkIGJyZWFrIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEEgc29mdCBsaW5lIGJyZWFrIGluc2lkZSBhIGJsb2NrIChUaXB0YXAncyBoYXJkQnJlYWsgLyBTaGlmdCtFbnRlciksIGFzXG4vLyBvcHBvc2VkIHRvIGEgbmV3IGJsb2NrLiBDYXJyaWVzIG5vIGRhdGEgXHUyMDE0IGl0IHJlbmRlcnMgYXMgPGJyPi4gV2l0aG91dCB0aGlzXG4vLyBub2RlIHRoZSBicmVhayBpcyBkcm9wcGVkIG9uIHNlcmlhbGl6ZSBhbmQgYWRqYWNlbnQgdGV4dCBydW5zIGNvbmNhdGVuYXRlLlxuZXhwb3J0IGNvbnN0IEhhcmRCcmVha05vZGUgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnaGFyZF9icmVhaycpLFxufSk7XG5leHBvcnQgdHlwZSBIYXJkQnJlYWtOb2RlID0gei5pbmZlcjx0eXBlb2YgSGFyZEJyZWFrTm9kZT47XG5cbi8vIC0tLS0gRGVmaW5pdGlvbiBjb250ZW50IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgcmljaCBjb250ZW50IHNob3duIGluIGEgZGVmaW5pdGlvbidzIHBvcG92ZXI6IGZvcm1hdHRlZCB0ZXh0ICsgaW5saW5lXG4vLyBtYXRoICh0aGUgc2FtZSBhbHBoYWJldCB0aGUgYmxhbmsgaGludCB1c2VzKSwgYXV0aG9yZWQgdmlhIHRoZSBzaGFyZWRcbi8vIElubGluZVJpY2hUZXh0RWRpdG9yLiBBIGRlZmluaXRpb24ncyB0ZXh0IHJ1biBjYXJyaWVzIFNpbXBsZU1hcmsgb25seSBcdTIwMTQgbm9cbi8vIG5lc3RlZCBkZWZpbml0aW9ucyBcdTIwMTQgd2hpY2ggYWxzbyBicmVha3MgdGhlIHJlY3Vyc2lvbiB0aGF0IHJldXNpbmcgSW5saW5lTm9kZVxuLy8gaGVyZSB3b3VsZCBjcmVhdGUgKERlZmluaXRpb25NYXJrIFx1MjE5MiBjb250ZW50IFx1MjE5MiB0ZXh0IFx1MjE5MiBtYXJrcyBcdTIxOTIgRGVmaW5pdGlvbk1hcmspLlxuY29uc3QgRGVmaW5pdGlvbkNvbnRlbnRUZXh0ID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3RleHQnKSxcbiAgdGV4dDogei5zdHJpbmcoKSxcbiAgbWFya3M6IHouYXJyYXkoU2ltcGxlTWFyaykuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uQ29udGVudElubGluZSA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBEZWZpbml0aW9uQ29udGVudFRleHQsXG4gIElubGluZU1hdGhOb2RlLFxuICBIYXJkQnJlYWtOb2RlLFxuXSk7XG5leHBvcnQgdHlwZSBEZWZpbml0aW9uQ29udGVudElubGluZSA9IHouaW5mZXI8dHlwZW9mIERlZmluaXRpb25Db250ZW50SW5saW5lPjtcblxuLy8gLS0tLSBEZWZpbml0aW9uIGJsb2NrcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEEgZGVmaW5pdGlvbidzIGNvbnRlbnQgaXMgYSBCTE9DSyBzZXF1ZW5jZSwgc28gYSB2b2NhYnVsYXJ5IHBvcG92ZXIgY2FuIGhvbGRcbi8vIHdoYXQgYSByZWZlcmVuY2Ugc2hlZXQgaG9sZHM6IGEgZGlzcGxheSBlcXVhdGlvbiwgYSBzaG9ydCBwcm9wZXJ0eSBsaXN0LCBhXG4vLyBmaWd1cmUuIFNlZSBkb2NzL2Rlc2lnbi9kZWZpbml0aW9uLXJpY2gtY29udGVudC5tZC5cbi8vXG4vLyBUaGUgdW5pb24gaXMgYSBjdXJhdGVkIHN1YnNldCBvZiB0aGUgcmVmZXJlbmNlIHBhbmVsJ3MgY29udGVudCBibG9ja3MsIGFuZFxuLy8gZXZlcnkgdGV4dC1iZWFyaW5nIG1lbWJlciBpcyBkZWZpbmVkIExPQ0FMTFkgb3ZlciBEZWZpbml0aW9uQ29udGVudElubGluZVxuLy8gcmF0aGVyIHRoYW4gcmV1c2luZyBpdHMgYmxvY2tzLyBzaWJsaW5nLiBUaGF0IGlzIHdoYXQga2VlcHMgdGhlIHNjaGVtYVxuLy8gTk9OLVJFQ1VSU0lWRTogYmxvY2tzL3BhcmFncmFwaC50cyBhbmQgZnJpZW5kcyBjYXJyeSBJbmxpbmVOb2RlLCB3aG9zZVxuLy8gVGV4dE5vZGUgY2FycmllcyBNYXJrLCB3aGljaCBpbmNsdWRlcyBEZWZpbml0aW9uTWFyayBcdTIwMTQgc28gcmV1c2luZyB0aGVtIHdvdWxkXG4vLyBjbG9zZSB0aGUgY3ljbGUgRGVmaW5pdGlvbk1hcmsgLT4gYmxvY2sgLT4gdGV4dCAtPiBtYXJrIC0+IERlZmluaXRpb25NYXJrIGFuZFxuLy8gYWRtaXQgZGVmaW5pdGlvbnMgbmVzdGVkIGluc2lkZSBkZWZpbml0aW9ucyBhdCBhcmJpdHJhcnkgZGVwdGguIEl0IHdvdWxkIGFsc29cbi8vIGxhbmQgb24gdGhlIHNhbWUgdHNjIGRlY2xhcmF0aW9uLXNlcmlhbGl6YXRpb24gbGltaXQgKFRTNzA1NikgdGhhdCBhbHJlYWR5XG4vLyBmb3JjZWQgdGhlIGhhbmQtd3JpdHRlbiBgaW50ZXJmYWNlIEFjdGl2aXR5RG9jdW1lbnRgIGluIGRvY3VtZW50LnRzLlxuLy9cbi8vIEV4Y2x1ZGVkIG9uIHB1cnBvc2UgKGF1dGhvciBydWxpbmdzLCBkZXNpZ24gZG9jIEQyL0QzKTogY29sdW1ucyAodW5yZWFkYWJsZVxuLy8gaW4gYSB+MjhyZW0gcG9wb3ZlciBcdTIwMTQgYSBkZWZpbml0aW9uIHRoYXQgbmVlZHMgdHdvLWNvbHVtbiBsYXlvdXQgSVMgdGhlXG4vLyByZWZlcmVuY2UgcGFuZWwpLCBjYWxsb3V0IChhIG5vdGUgYm94IGluc2lkZSBhIG5vdGUgYm94KSwgYW5kIGV2ZXJ5XG4vLyBxdWVzdGlvbi9pbnRlcmFjdGl2ZSBibG9jayAoYSBkZWZpbml0aW9uIGlzIG5ldmVyIGdyYWRlYWJsZSkuXG4vL1xuLy8gYGlkYCBpcyBPUFRJT05BTCBvbiB0aGUgbG9jYWxseS1kZWZpbmVkIG1lbWJlcnMsIHVubGlrZSBldmVyeSBibG9ja3MvIHNpYmxpbmdcbi8vIHdoZXJlIGl0IGlzIGEgcmVxdWlyZWQgdXVpZC4gVHdvIHJlYXNvbnM6IG5vdGhpbmcgYWRkcmVzc2VzIGEgZGVmaW5pdGlvbiBibG9ja1xuLy8gKGl0IGlzIG5ldmVyIHNjb3JlZCwgbmV2ZXIgYSBzdWJtaXNzaW9uIGtleSwgbmV2ZXIgYSBydW50aW1lIHJlZiBcdTIwMTQgb25seSB0aGVcbi8vIGVkaXRvciB3YW50cyBpdCwgYW5kIHRoZSBlZGl0b3IgYWx3YXlzIG1pbnRzIG9uZSksIGFuZCB0aGUgbGVnYWN5IHVwZ3JhZGVzIGluXG4vLyB0aGUgTWFyayBwcmVwcm9jZXNzIGJlbG93IG11c3QgYmUgREVURVJNSU5JU1RJQy4gQSByZXF1aXJlZCB1dWlkIHdvdWxkIGZvcmNlXG4vLyBjcnlwdG8ucmFuZG9tVVVJRCgpIGF0IHBhcnNlIHRpbWUsIHNvIHBhcnNpbmcgb25lIHN0b3JlZCBkb2N1bWVudCB0d2ljZSB3b3VsZFxuLy8geWllbGQgZGlmZmVyZW50IGlkcyBhbmQgYnJlYWsgcmUtc2VyaWFsaXphdGlvbiBieXRlLWlkZW50aXR5LlxuXG4vLyBFdmVyeSBzY2hlbWEgYmVsb3cgY2FycmllcyBhbiBFWFBMSUNJVCBpbnRlcmZhY2UgKyBgei5ab2RUeXBlPFx1MjAyNj5gIGFubm90YXRpb25cbi8vIHJhdGhlciB0aGFuIHJlbHlpbmcgb24gei5pbmZlci4gVGhpcyBpcyBub3Qgc3R5bGU6IHdpdGhvdXQgaXQsIGFkZGluZyBhXG4vLyA3LW1lbWJlciBibG9jayB1bmlvbiBpbnNpZGUgYSBtYXJrIHRoYXQgZXZlcnkgYmxvY2sncyBpbmxpbmUgY29udGVudCBjYW5cbi8vIHJlYWNoIG92ZXJmbG93cyB0c2MncyBkZWNsYXJhdGlvbi1zZXJpYWxpemF0aW9uIGxpbWl0IGFuZCBmYWlscyB0aGUgYnVpbGQgd2l0aFxuLy8gVFM3MDU2IGluIGZpdmUgZG93bnN0cmVhbSBmaWxlcyAoYmxvY2tzL2luZGV4LnRzJ3MgQmxvY2ssIGRvY3VtZW50LnRzLFxuLy8gbGF5b3V0LnRzKS4gTmFtaW5nIHRoZSB0eXBlcyBzdG9wcyB0aGUgc3RydWN0dXJhbCBleHBhbnNpb24gYXQgdGhpcyBib3VuZGFyeSBcdTIwMTRcbi8vIHRoZSBzYW1lIHJlbWVkeSBgaW50ZXJmYWNlIEFjdGl2aXR5RG9jdW1lbnRgIGFscmVhZHkgYXBwbGllcyBpbiBkb2N1bWVudC50cy5cbi8vIFRoZSBhbm5vdGF0aW9ucyBhcmUgY2hlY2tlZCBhZ2FpbnN0IHRoZSBvYmplY3Qgc2NoZW1hcywgc28gbm90aGluZyBoZXJlIGxvc2VzXG4vLyB0eXBlIHNhZmV0eSwgYW5kIHRoZSBydW50aW1lIG9iamVjdHMgYXJlIHVudG91Y2hlZCAoYSBkaXNjcmltaW5hdGVkVW5pb24gc3RpbGxcbi8vIHBhcnNlcyBhcyBhIGRpc2NyaW1pbmF0ZWRVbmlvbikuXG5cbmNvbnN0IERlZmluaXRpb25CbG9ja0lkID0gei5zdHJpbmcoKS51dWlkKCkub3B0aW9uYWwoKTtcblxuLy8gU2hhcmVkIHNpemluZyBmcmFnbWVudCwgc3BlbGxlZCBvdXQgZm9yIHRoZSBpbnRlcmZhY2VzIGFib3ZlLlxuaW50ZXJmYWNlIERlZmluaXRpb25TaXppbmcge1xuICB3aWR0aD86IG51bWJlcjtcbiAgYWxpZ24/OiBCbG9ja0FsaWduO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25QYXJhZ3JhcGhCbG9jayB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAncGFyYWdyYXBoJztcbiAgY29udGVudDogRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmVbXTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRGVmaW5pdGlvbkhlYWRpbmdCbG9jayB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAnaGVhZGluZyc7XG4gIGxldmVsOiAxIHwgMiB8IDM7XG4gIGNvbnRlbnQ6IERlZmluaXRpb25Db250ZW50SW5saW5lW107XG59XG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25NYXRoQmxvY2sgZXh0ZW5kcyBEZWZpbml0aW9uU2l6aW5nIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIHR5cGU6ICdtYXRoX2Jsb2NrJztcbiAgbGF0ZXg6IHN0cmluZztcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRGVmaW5pdGlvbkltYWdlQmxvY2sgZXh0ZW5kcyBEZWZpbml0aW9uU2l6aW5nIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIHR5cGU6ICdpbWFnZSc7XG4gIHNyYzogc3RyaW5nO1xuICBhbHQ6IHN0cmluZztcbiAgY3JvcD86IENyb3BSZWN0O1xuICBzcmNBc3BlY3Q/OiBudW1iZXI7XG59XG5cbmNvbnN0IERlZmluaXRpb25QYXJhZ3JhcGhCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IERlZmluaXRpb25CbG9ja0lkLFxuICB0eXBlOiB6LmxpdGVyYWwoJ3BhcmFncmFwaCcpLFxuICBjb250ZW50OiB6LmFycmF5KERlZmluaXRpb25Db250ZW50SW5saW5lKS5kZWZhdWx0KFtdKSxcbn0pO1xuXG4vLyBTYW1lIHRocmVlLWxldmVsIGNhcCBhcyBIZWFkaW5nQmxvY2suIFRoZSBwb3BvdmVyIHN0eWxlc2hlZXQgc2NvcGVzIHRoZXNlXG4vLyBkb3duIHNvIGEgcGFuZWwtc2NhbGUgaDEgcmVhZHMgY29ycmVjdGx5IGF0IHBvcG92ZXIgc2NhbGUuXG5jb25zdCBEZWZpbml0aW9uSGVhZGluZ0Jsb2NrID0gei5vYmplY3Qoe1xuICBpZDogRGVmaW5pdGlvbkJsb2NrSWQsXG4gIHR5cGU6IHoubGl0ZXJhbCgnaGVhZGluZycpLFxuICBsZXZlbDogei51bmlvbihbei5saXRlcmFsKDEpLCB6LmxpdGVyYWwoMiksIHoubGl0ZXJhbCgzKV0pLFxuICBjb250ZW50OiB6LmFycmF5KERlZmluaXRpb25Db250ZW50SW5saW5lKS5kZWZhdWx0KFtdKSxcbn0pO1xuXG4vLyBEaXNwbGF5IG1hdGguIEEgZGVmaW5pdGlvbi1sb2NhbCBzaGFwZSByYXRoZXIgdGhhbiBibG9ja3MvbWF0aC1ibG9jay50cydzXG4vLyBNYXRoQmxvY2ssIHdoaWNoIGNhcnJpZXMgYHByb21wdHNgIChpbi1lcXVhdGlvbiBncmFkZWFibGUgZ2FwcykgYW5kXG4vLyBgc29sdXRpb246IElubGluZU5vZGVbXWAgXHUyMDE0IHRoZSBmaXJzdCBpcyBtZWFuaW5nbGVzcyBoZXJlIChhIGRlZmluaXRpb24gaXNcbi8vIG5ldmVyIGdyYWRlYWJsZSwgdGhlIHNhbWUgcG9zdHVyZSB0aGUgcmVmZXJlbmNlIHBhbmVsIGFscmVhZHkgdGFrZXMpIGFuZCB0aGVcbi8vIHNlY29uZCBpcyBleGFjdGx5IHRoZSByZWN1cnNpdmUgZWRnZSBkZXNjcmliZWQgYWJvdmUuIFNpemluZyByaWRlcyBhbG9uZztcbi8vIGxhYmVsRmllbGRzIGRvIG5vdCAoYSBkZWZpbml0aW9uIGJsb2NrIGlzIG5ldmVyIG51bWJlcmVkKS5cbmNvbnN0IERlZmluaXRpb25NYXRoQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgdHlwZTogei5saXRlcmFsKCdtYXRoX2Jsb2NrJyksXG4gIGxhdGV4OiB6LnN0cmluZygpLFxuICAuLi5zaXppbmdGaWVsZHMsXG59KTtcblxuLy8gSWxsdXN0cmF0aXZlIGltYWdlLiBEZWZpbml0aW9uLWxvY2FsIGZvciB0aGUgb3B0aW9uYWwtaWQgcmVhc29uIGFib3ZlLCBidXQgaXRcbi8vIHJldXNlcyB0aGUgc2hhcmVkIHNpemluZyArIGNyb3Agdm9jYWJ1bGFyeSB2ZXJiYXRpbSwgc28gcmVmcmFtaW5nIGEgdGV4dGJvb2tcbi8vIGZpZ3VyZSBkb3duIHRvIHRoZSByZWxldmFudCBjb3JuZXIgd29ya3MgZXhhY3RseSBhcyBpdCBkb2VzIGluIHRoZSBib2R5LlxuLy8gYGNhcHRpb25gIGlzIGRlbGliZXJhdGVseSBhYnNlbnQgKFlBR05JIFx1MjAxNCBhbHQgY292ZXJzIGFjY2Vzc2liaWxpdHksIGFuZCBhXG4vLyBjYXB0aW9uZWQgZmlndXJlIGluIGEgcG9wb3ZlciBpcyB0aGUgcmVmZXJlbmNlIHBhbmVsJ3Mgam9iKTsgYWRkaXRpdmUgbGF0ZXIuXG5jb25zdCBEZWZpbml0aW9uSW1hZ2VCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IERlZmluaXRpb25CbG9ja0lkLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2ltYWdlJyksXG4gIHNyYzogei5zdHJpbmcoKSxcbiAgYWx0OiB6LnN0cmluZygpLmRlZmF1bHQoJycpLFxuICAuLi5zaXppbmdGaWVsZHMsXG4gIGNyb3A6IENyb3BSZWN0Lm9wdGlvbmFsKCksXG4gIHNyY0FzcGVjdDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG59KTtcblxuLy8gTmVzdGVkIGxpc3RzLCBtaXJyb3JpbmcgYmxvY2tzL2xpc3QudHMncyBzaGFwZSBzbyBUYWItdG8taW5kZW50IGluIHRoZVxuLy8gZGVmaW5pdGlvbiBkaWFsb2cgcm91bmQtdHJpcHMuIFNhbWUgcmVjdXJzaW9uIG1lY2hhbmljOiBvbmx5IHRoZSBjeWNsaWMgZWRnZVxuLy8gKGl0ZW0gLT4gbGlzdCAtPiBpdGVtKSBpcyB6LmxhenkoKSwgbGVhdmluZyB0aGUgbGlzdCBibG9ja3MgYXMgcGxhaW5cbi8vIHoub2JqZWN0cyBzbyB0aGV5IHN0YXkgdXNhYmxlIGFzIGRpc2NyaW1pbmF0ZWRVbmlvbiBtZW1iZXJzIGJlbG93LlxuZXhwb3J0IGludGVyZmFjZSBEZWZpbml0aW9uTGlzdEl0ZW0ge1xuICBpZD86IHN0cmluZztcbiAgY29udGVudDogRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmVbXTtcbiAgY2hpbGRyZW4/OiBBcnJheTxEZWZpbml0aW9uQnVsbGV0TGlzdEJsb2NrIHwgRGVmaW5pdGlvbk9yZGVyZWRMaXN0QmxvY2s+O1xufVxuZXhwb3J0IGludGVyZmFjZSBEZWZpbml0aW9uQnVsbGV0TGlzdEJsb2NrIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIHR5cGU6ICdidWxsZXRfbGlzdCc7XG4gIGl0ZW1zOiBEZWZpbml0aW9uTGlzdEl0ZW1bXTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRGVmaW5pdGlvbk9yZGVyZWRMaXN0QmxvY2sge1xuICBpZD86IHN0cmluZztcbiAgdHlwZTogJ29yZGVyZWRfbGlzdCc7XG4gIGl0ZW1zOiBEZWZpbml0aW9uTGlzdEl0ZW1bXTtcbn1cblxuZXhwb3J0IGNvbnN0IERlZmluaXRpb25MaXN0SXRlbTogei5ab2RUeXBlPFxuICBEZWZpbml0aW9uTGlzdEl0ZW0sXG4gIHouWm9kVHlwZURlZixcbiAgdW5rbm93blxuPiA9IHoubGF6eSgoKSA9PlxuICB6Lm9iamVjdCh7XG4gICAgaWQ6IERlZmluaXRpb25CbG9ja0lkLFxuICAgIGNvbnRlbnQ6IHouYXJyYXkoRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmUpLmRlZmF1bHQoW10pLFxuICAgIGNoaWxkcmVuOiB6XG4gICAgICAuYXJyYXkoei51bmlvbihbRGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jaywgRGVmaW5pdGlvbk9yZGVyZWRMaXN0QmxvY2tdKSlcbiAgICAgIC5vcHRpb25hbCgpLFxuICB9KSxcbik7XG5cbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uQnVsbGV0TGlzdEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogRGVmaW5pdGlvbkJsb2NrSWQsXG4gIHR5cGU6IHoubGl0ZXJhbCgnYnVsbGV0X2xpc3QnKSxcbiAgaXRlbXM6IHouYXJyYXkoRGVmaW5pdGlvbkxpc3RJdGVtKS5kZWZhdWx0KFtdKSxcbn0pO1xuXG5leHBvcnQgY29uc3QgRGVmaW5pdGlvbk9yZGVyZWRMaXN0QmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgdHlwZTogei5saXRlcmFsKCdvcmRlcmVkX2xpc3QnKSxcbiAgaXRlbXM6IHouYXJyYXkoRGVmaW5pdGlvbkxpc3RJdGVtKS5kZWZhdWx0KFtdKSxcbn0pO1xuXG4vLyBHcmFwaEZpZ3VyZUJsb2NrIGlzIHRoZSBPTkUgbWVtYmVyIHJldXNlZCB2ZXJiYXRpbTogaXQgaXMgYWxyZWFkeSBpbmxpbmUtZnJlZVxuLy8gKGF4aXMgKyBkcmF3YWJsZXMgb25seSksIHNvIGl0IGludHJvZHVjZXMgbm8gY3ljbGUsIGFuZCBpdCBoYXMgbm8gbGVnYWN5XG4vLyB1cGdyYWRlIHBhdGggdGhhdCB3b3VsZCBuZWVkIHRvIG1pbnQgaXRzIHJlcXVpcmVkIHV1aWQuIEltcG9ydGluZyBpdCBpcyBzYWZlXG4vLyBvbmx5IGJlY2F1c2UgaXRzIG93biBncmFwaCBwcmltaXRpdmVzIG5vdyBjb21lIGZyb20gdGhlIGxlYWZcbi8vIGdyYXBoLXByaW1pdGl2ZXMudHMgcmF0aGVyIHRoYW4gdGhyb3VnaCBibG9ja3MvaW50ZXJhY3RpdmUtZ3JhcGgudHMgXHUyMDE0IHNlZSB0aGVcbi8vIGhlYWRlciBjb21tZW50IHRoZXJlLlxuZXhwb3J0IHR5cGUgRGVmaW5pdGlvbkJsb2NrID1cbiAgfCBEZWZpbml0aW9uUGFyYWdyYXBoQmxvY2tcbiAgfCBEZWZpbml0aW9uSGVhZGluZ0Jsb2NrXG4gIHwgRGVmaW5pdGlvbk1hdGhCbG9ja1xuICB8IERlZmluaXRpb25JbWFnZUJsb2NrXG4gIHwgRGVmaW5pdGlvbkJ1bGxldExpc3RCbG9ja1xuICB8IERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrXG4gIHwgR3JhcGhGaWd1cmVCbG9jaztcblxuZXhwb3J0IGNvbnN0IERlZmluaXRpb25CbG9jazogei5ab2RUeXBlPFxuICBEZWZpbml0aW9uQmxvY2ssXG4gIHouWm9kVHlwZURlZixcbiAgdW5rbm93blxuPiA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBEZWZpbml0aW9uUGFyYWdyYXBoQmxvY2ssXG4gIERlZmluaXRpb25IZWFkaW5nQmxvY2ssXG4gIERlZmluaXRpb25NYXRoQmxvY2ssXG4gIERlZmluaXRpb25JbWFnZUJsb2NrLFxuICBEZWZpbml0aW9uQnVsbGV0TGlzdEJsb2NrLFxuICBEZWZpbml0aW9uT3JkZXJlZExpc3RCbG9jayxcbiAgR3JhcGhGaWd1cmVCbG9jayxcbl0pO1xuXG4vLyBEZWZpbml0aW9uTWFyayBcdTIwMTQgaW5saW5lIHZvY2FidWxhcnkgZGVmaW5pdGlvbiAoUGhhc2UgMikuIGBjb250ZW50YCBpcyB0aGVcbi8vIHJpY2ggZGVmaW5pdGlvbiBzaG93biBpbiB0aGUgcHVibGlzaGVkLXBhZ2UgcG9wb3Zlciwgbm93IGEgYmxvY2sgc2VxdWVuY2Vcbi8vIChzZWUgRGVmaW5pdGlvbkJsb2NrIGFib3ZlKS4gYGdsb3NzYXJ5S2V5YCBpcyByZXNlcnZlZCBmb3IgdGhlIFBoYXNlIDQgdGVuYW50XG4vLyBnbG9zc2FyeSBzdG9yZSAocmVzb2x2ZWQgYXQgcHVibGlzaCkgYW5kIGlzIHVudXNlZCBpbiBQaGFzZSAyLiBUaGUgcmVuZGVyZXJcbi8vIGVtaXRzIGA8c3BhbiBjbGFzcz1cImRlZmluaXRpb25cIiBcdTIwMjY+YCBwbHVzIGEgaGlkZGVuIDx0ZW1wbGF0ZT4gY2FycnlpbmcgdGhlXG4vLyByZW5kZXJlZCBjb250ZW50OyBzZWUgUlVOVElNRS5tZCwgZG9jcy9kZXNpZ24vdm9jYWJ1bGFyeS1kZWZpbml0aW9ucy5tZCwgYW5kXG4vLyBkb2NzL2Rlc2lnbi9kZWZpbml0aW9uLXJpY2gtY29udGVudC5tZC5cbi8vIE5PVCBhbm5vdGF0ZWQgYXMgei5ab2RUeXBlLCB1bmxpa2UgRGVmaW5pdGlvbkJsb2NrIGFib3ZlOiB0aGlzIHNjaGVtYSBpcyBhXG4vLyBtZW1iZXIgb2YgdGhlIGBNYXJrYCBkaXNjcmltaW5hdGVkVW5pb24gYmVsb3csIGFuZCB6LmRpc2NyaW1pbmF0ZWRVbmlvbiBuZWVkc1xuLy8gcmVhbCBab2RPYmplY3RzIHRvIGludHJvc3BlY3QgdGhlIGB0eXBlYCBkaXNjcmltaW5hdG9yLiBUaGUgbmFtZWRcbi8vIERlZmluaXRpb25CbG9jayBhbGlhcyBpcyB3aGF0IGtlZXBzIHRoZSBpbmZlcnJlZCB0eXBlIGhlcmUgc21hbGwgZW5vdWdoIFx1MjAxNCB0aGVcbi8vIHNhbWUgcmVhc29uIGxpc3QudHMga2VlcHMgaXRzIGxpc3QgYmxvY2tzIGFzIHBsYWluIHoub2JqZWN0cyBhbmQgcHV0cyB0aGVcbi8vIHoubGF6eSgpIG9ubHkgb24gdGhlIGN5Y2xpYyBlZGdlLlxuZXhwb3J0IGNvbnN0IERlZmluaXRpb25NYXJrID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2RlZmluaXRpb24nKSxcbiAgY29udGVudDogei5hcnJheShEZWZpbml0aW9uQmxvY2spLmRlZmF1bHQoW10pLFxuICBnbG9zc2FyeUtleTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBEZWZpbml0aW9uTWFyayA9IHouaW5mZXI8dHlwZW9mIERlZmluaXRpb25NYXJrPjtcblxuLy8gQSBkZWZpbml0aW9uJ3MgY29udGVudCBpcyBhIGJsb2NrIGFycmF5IHRvZGF5LCBidXQgdHdvIG9sZGVyIHNoYXBlcyBhcmUgc3RpbGxcbi8vIG91dCB0aGVyZSBpbiBzdG9yZWQgZG9jdW1lbnRzLiBCb3RoIHVwZ3JhZGVzIGJlbG93IGFyZSBwdXJlLCBkZXRlcm1pbmlzdGljXG4vLyByZWFkLXRpbWUgcmV3cml0ZXMgXHUyMDE0IHRoZXkgbWludCBubyBpZHMgYW5kIG5vIHJhbmRvbW5lc3MsIHNvIHBhcnNpbmcgdGhlIHNhbWVcbi8vIHN0b3JlZCBkb2N1bWVudCB0d2ljZSB5aWVsZHMgaWRlbnRpY2FsIG91dHB1dC5cbi8vXG4vLyBUaGV5IENPTVBPU0UsIG9sZGVzdCBmaXJzdCwgYmVjYXVzZSBhIGRvY3VtZW50IGNhbiBjYXJyeSB0aGUgb2xkZXN0IHNoYXBlOlxuLy8gICB2MSAgeyBkZWZpbml0aW9uOiAnYSBzdHJpbmcnIH0gICAgICAgICAgICAgICAgICAgIChwcmUtcmljaC1jb250ZW50KVxuLy8gICB2MiAgeyBjb250ZW50OiBbaW5saW5lXHUyMDI2XSwgaW1hZ2U/OiB7c3JjLCBhbHR9IH0gICAgKFBoYXNlIDIgcmljaCBpbmxpbmUpXG4vLyAgIHYzICB7IGNvbnRlbnQ6IFtibG9ja1x1MjAyNl0gfSAgICAgICAgICAgICAgICAgICAgICAgICAoY3VycmVudClcbi8vIHNvIHYxIFx1MjE5MiB2MiBcdTIxOTIgdjMgbXVzdCBydW4gaW4gc2VxdWVuY2Ugb24gYSBzaW5nbGUgbWFyay5cbi8vIEV4cG9ydGVkIGJlY2F1c2UgdGhlIGFwcCdzIHNlcmlhbGl6ZXIgbmVlZHMgdGhlIElERU5USUNBTCBub3JtYWxpemF0aW9uIHdoZW5cbi8vIGl0IHJlYWRzIGEgZGVmaW5pdGlvbiBtYXJrJ3MgVGlwdGFwIGF0dHJzIFx1MjAxNCBhbiBlZGl0b3Igc2Vzc2lvbiBvcGVuZWQgYmVmb3JlXG4vLyB0aGUgYmxvY2sgbWlncmF0aW9uIHN0aWxsIGNhcnJpZXMgdGhlIHYyIGF0dHIgc2hhcGUuIE9uZSBpbXBsZW1lbnRhdGlvbiwgc29cbi8vIHRoZSBzY2hlbWEgYW5kIHRoZSBzZXJpYWxpemVyIGNhbm5vdCBkcmlmdCBhcGFydCBvbiB3aGF0IGFuIG9sZCBtYXJrIG1lYW5zLlxuZXhwb3J0IGZ1bmN0aW9uIHVwZ3JhZGVEZWZpbml0aW9uTWFyayhtOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHVua25vd24ge1xuICBsZXQgY29udGVudCA9IG0uY29udGVudDtcbiAgY29uc3QgcmVzdCA9IHsgLi4ubSB9O1xuXG4gIC8vIHYxIFx1MjE5MiB2MjogYSBwbGFpbiBgZGVmaW5pdGlvbmAgc3RyaW5nIGJlY29tZXMgYSBzaW5nbGUgaW5saW5lIHRleHQgcnVuLlxuICBpZiAodHlwZW9mIHJlc3QuZGVmaW5pdGlvbiA9PT0gJ3N0cmluZycgJiYgY29udGVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgdGV4dCA9IHJlc3QuZGVmaW5pdGlvbjtcbiAgICBjb250ZW50ID0gdGV4dCA/IFt7IHR5cGU6ICd0ZXh0JywgdGV4dCB9XSA6IFtdO1xuICB9XG4gIGRlbGV0ZSByZXN0LmRlZmluaXRpb247XG5cbiAgLy8gdjIgXHUyMTkyIHYzOiBhbiBJTkxJTkUgY29udGVudCBhcnJheSBiZWNvbWVzIG9uZSBwYXJhZ3JhcGggYmxvY2suIERldGVjdGVkIGJ5XG4gIC8vIHNoYXBlLCBub3QgYnkgYSB2ZXJzaW9uIGZpZWxkIFx1MjAxNCBhbiBpbmxpbmUgbm9kZSBpcyBhIHRleHQgLyBtYXRoX2lubGluZSAvXG4gIC8vIGhhcmRfYnJlYWssIG5vbmUgb2Ygd2hpY2ggaXMgYSBibG9jayBgdHlwZWAsIHNvIHRoZSBmaXJzdCBlbGVtZW50XG4gIC8vIGRpc2NyaW1pbmF0ZXMgdW5hbWJpZ3VvdXNseS4gQW4gZW1wdHkgYXJyYXkgaXMgYWxyZWFkeSB2YWxpZCBhdCBib3RoXG4gIC8vIHZlcnNpb25zIGFuZCBpcyBsZWZ0IGFsb25lLlxuICBjb25zdCBJTkxJTkVfVFlQRVMgPSBbJ3RleHQnLCAnbWF0aF9pbmxpbmUnLCAnaGFyZF9icmVhayddO1xuICBpZiAoQXJyYXkuaXNBcnJheShjb250ZW50KSAmJiBjb250ZW50Lmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBmaXJzdCA9IGNvbnRlbnRbMF0gYXMgeyB0eXBlPzogdW5rbm93biB9IHwgdW5kZWZpbmVkO1xuICAgIGlmICh0eXBlb2YgZmlyc3Q/LnR5cGUgPT09ICdzdHJpbmcnICYmIElOTElORV9UWVBFUy5pbmNsdWRlcyhmaXJzdC50eXBlKSkge1xuICAgICAgY29udGVudCA9IFt7IHR5cGU6ICdwYXJhZ3JhcGgnLCBjb250ZW50IH1dO1xuICAgIH1cbiAgfVxuXG4gIC8vIHYyIFx1MjE5MiB2MyAoRDcpOiB0aGUgc2VwYXJhdGUgYGltYWdlYCBhdHRyIGJlY29tZXMgYSB0cmFpbGluZyBpbWFnZSBibG9jaywgc29cbiAgLy8gdGhlcmUgaXMgZXhhY3RseSBvbmUgd2F5IHRvIGV4cHJlc3MgYW4gaW1hZ2UgaW4gYSBkZWZpbml0aW9uLiBBcHBlbmRlZFxuICAvLyBBRlRFUiB0aGUgdGV4dCwgbWF0Y2hpbmcgd2hlcmUgdGhlIG9sZCBwb3BvdmVyIHJlbmRlcmVkIGl0LlxuICBjb25zdCBpbWFnZSA9IHJlc3QuaW1hZ2U7XG4gIGRlbGV0ZSByZXN0LmltYWdlO1xuICBpZiAoaW1hZ2UgIT09IG51bGwgJiYgdHlwZW9mIGltYWdlID09PSAnb2JqZWN0Jykge1xuICAgIGNvbnN0IHsgc3JjLCBhbHQgfSA9IGltYWdlIGFzIHsgc3JjPzogdW5rbm93bjsgYWx0PzogdW5rbm93biB9O1xuICAgIGlmICh0eXBlb2Ygc3JjID09PSAnc3RyaW5nJyAmJiBzcmMpIHtcbiAgICAgIGNvbnN0IGJsb2NrcyA9IEFycmF5LmlzQXJyYXkoY29udGVudCkgPyBbLi4uY29udGVudF0gOiBbXTtcbiAgICAgIGJsb2Nrcy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgICAgc3JjLFxuICAgICAgICBhbHQ6IHR5cGVvZiBhbHQgPT09ICdzdHJpbmcnID8gYWx0IDogJycsXG4gICAgICB9KTtcbiAgICAgIGNvbnRlbnQgPSBibG9ja3M7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgLi4ucmVzdCwgY29udGVudDogY29udGVudCA/PyBbXSB9O1xufVxuXG5leHBvcnQgY29uc3QgTWFyayA9IHoucHJlcHJvY2VzcyhcbiAgKG0pID0+IHtcbiAgICAvLyBMZWdhY3k6IG1hcmtzIHdlcmUgYmFyZSBzdHJpbmdzICgnYm9sZCcpLlxuICAgIGlmICh0eXBlb2YgbSA9PT0gJ3N0cmluZycpIHJldHVybiB7IHR5cGU6IG0gfTtcbiAgICBpZiAoXG4gICAgICBtICE9PSBudWxsICYmXG4gICAgICB0eXBlb2YgbSA9PT0gJ29iamVjdCcgJiZcbiAgICAgIChtIGFzIHsgdHlwZT86IHVua25vd24gfSkudHlwZSA9PT0gJ2RlZmluaXRpb24nXG4gICAgKSB7XG4gICAgICByZXR1cm4gdXBncmFkZURlZmluaXRpb25NYXJrKG0gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuICAgIH1cbiAgICByZXR1cm4gbTtcbiAgfSxcbiAgei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gICAgQm9sZE1hcmssXG4gICAgSXRhbGljTWFyayxcbiAgICBVbmRlcmxpbmVNYXJrLFxuICAgIENvZGVNYXJrLFxuICAgIFN1YnNjcmlwdE1hcmssXG4gICAgU3VwZXJzY3JpcHRNYXJrLFxuICAgIERlZmluaXRpb25NYXJrLFxuICBdKSxcbik7XG5leHBvcnQgdHlwZSBNYXJrID0gei5pbmZlcjx0eXBlb2YgTWFyaz47XG4vLyBUaGUgc2V0IG9mIG1hcmsgYHR5cGVgIGRpc2NyaW1pbmFudHMsIGZvciBjYWxsZXJzIHRoYXQgYWxsb3ctbGlzdCBieSBuYW1lLlxuZXhwb3J0IHR5cGUgTWFya1R5cGUgPSBNYXJrWyd0eXBlJ107XG5cbi8vIC0tLS0gVGV4dCBub2RlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnQgY29uc3QgVGV4dE5vZGUgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgndGV4dCcpLFxuICB0ZXh0OiB6LnN0cmluZygpLFxuICAvLyBEZWZhdWx0IHRvIGVtcHR5IG1hcmtzIGFycmF5IHNvIGNhbGxlcnMgZG9uJ3QgbmVlZCB0byBzcGVjaWZ5IHdoZW4gbm9uZS5cbiAgbWFya3M6IHouYXJyYXkoTWFyaykuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCB0eXBlIFRleHROb2RlID0gei5pbmZlcjx0eXBlb2YgVGV4dE5vZGU+O1xuXG4vLyAtLS0tIElubGluZU5vZGUgdW5pb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSW5saW5lTm9kZSBpcyB0aGUgc3RhbmRhcmQgaW5saW5lIGFscGhhYmV0LiBVc2VkIGJ5IGFsbCBibG9ja3MgZXhjZXB0XG4vLyBmaWxsX2luX2JsYW5rLiBEZWZpbmVkIGJlZm9yZSBCbGFua1Rva2VuIGJlY2F1c2UgdGhlIGJsYW5rJ3MgcmljaCBmZWVkYmFja1xuLy8gZmllbGRzIChoaW50LCBtaXN0YWtlRmVlZGJhY2spIHJldXNlIHRoaXMgdW5pb24uXG5leHBvcnQgY29uc3QgSW5saW5lTm9kZSA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBUZXh0Tm9kZSxcbiAgSW5saW5lTWF0aE5vZGUsXG4gIEhhcmRCcmVha05vZGUsXG5dKTtcbmV4cG9ydCB0eXBlIElubGluZU5vZGUgPSB6LmluZmVyPHR5cGVvZiBJbmxpbmVOb2RlPjtcblxuLy8gLS0tLSBCbGFuayB0b2tlbiAoZmlsbC1pbi10aGUtYmxhbmsgb25seSkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJsYW5rcyBsaXZlIElOU0lERSB0aGUgaW5saW5lIGNvbnRlbnQgc3RyZWFtIG9mIGEgZmlsbF9pbl9ibGFuayBibG9jayBcdTIwMTRcbi8vIHN0dWRlbnRzIHNlZSBhIHByb21wdCB3aXRoIG9uZSBvciBtb3JlIGlubGluZSBibGFua3MuIEVhY2ggYmxhbmsgaGFzIGFcbi8vIHN0YWJsZSBpZCAocmVmZXJlbmNlZCBpbiBzdWJtaXNzaW9ucy5yZXNwb25zZXMuYmxhbmtzWzxpZD5dKSBhbmQgYW4gYW5zd2VyXG4vLyBrZXkuXG4vL1xuLy8gd2lkdGggaXMgaW4gQ1NTIGNoYXJzIChgY2hgIHVuaXRzKSBcdTIwMTQgdXNlZCB0byBzaXplIHRoZSBpbnB1dC4gT3B0aW9uYWxcbi8vIGJlY2F1c2UgdGhlIHJlbmRlcmVyIGhhcyBhIHNlbnNpYmxlIGRlZmF1bHQgKH42IGNoYXJzKS5cbi8vXG4vLyBoaW50IGFuZCBtaXN0YWtlRmVlZGJhY2sgYXJlIHRoZSBwZXItYmxhbmsgZmVlZGJhY2sgbGF5ZXJzIChibG9jay1sZXZlbFxuLy8gZmllbGRzIFx1MjAxNCBzb2x1dGlvbiwgaGFzQ29uZmlkZW5jZVJhdGluZywgc2tpbGxzIFx1MjAxNCBsaXZlIG9uIEZpbGxJbkJsYW5rQmxvY2spLlxuLy8gQm90aCBjYXJyeSByaWNoIGlubGluZSBjb250ZW50IChJbmxpbmVOb2RlW106IGZvcm1hdHRlZCB0ZXh0ICsgaW5saW5lIG1hdGgpXG4vLyBzbyBmZWVkYmFjayBjYW4gaW5jbHVkZSB0aGUgc2FtZSBmb3JtYXR0aW5nIGFuZCBtYXRoIGFzIHByb2JsZW0gcHJvc2UuXG4vLyBUaGUgcnVudGltZSByZWFkcyBib3RoIGF0IGluaXQgYnV0IGRvZXMgTk9UIGluamVjdCBhbnl0aGluZyBpbnRvIHRoZSBET01cbi8vIHVudGlsIHRoZSBzdHVkZW50IGNsaWNrcyBcIkNoZWNrIHRoaXMgc2VjdGlvbi5cIiBPbiBhIHdyb25nIGFuc3dlciwgdGhlXG4vLyBydW50aW1lIGZpcnN0IGxvb2tzIGZvciBhIG1hdGNoaW5nIG1pc3Rha2VGZWVkYmFjayBlbnRyeSAoZXhhY3Qgc3RyaW5nXG4vLyBtYXRjaCBmb3IgUGhhc2UgMSk7IGlmIG5vbmUgbWF0Y2hlcywgaXQgZmFsbHMgYmFjayB0byBoaW50OyBpZiBoaW50IGlzXG4vLyBhbHNvIGFic2VudCwgaXQgc2hvd3MgdGhlIGdlbmVyaWMgXHUyNzE3LlxuZXhwb3J0IGNvbnN0IEJsYW5rVG9rZW4gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnYmxhbmsnKSxcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICBhbnN3ZXI6IHouc3RyaW5nKCkubWluKDEpLFxuICAvLyBBbHRlcm5hdGl2ZSBjb3JyZWN0IGFuc3dlcnMuIEVtcHR5IGFycmF5IGlzIHRoZSBjb21tb24gY2FzZS5cbiAgYWNjZXB0YWJsZUFuc3dlcnM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIHdpZHRoOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLy8gT3B0aW9uYWwgdGVhY2hlci1hdXRob3JlZCBudWRnZSBzaG93biB3aGVuIHRoaXMgYmxhbmsgaXMgd3JvbmcgYW5kIG5vXG4gIC8vIG1pc3Rha2VGZWVkYmFjayBlbnRyeSBtYXRjaGVzLiBSaWNoIGlubGluZSBjb250ZW50IChmb3JtYXR0ZWQgdGV4dCArIG1hdGgpLlxuICBoaW50OiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIC8vIE9wdGlvbmFsIGxpc3Qgb2YgYW50aWNpcGF0ZWQgd3JvbmcgYW5zd2VycyBwYWlyZWQgd2l0aCBzcGVjaWZpYyBmZWVkYmFjay5cbiAgLy8gSWYgdGhlIHN0dWRlbnQncyB3cm9uZyBhbnN3ZXIgbWF0Y2hlcyBhIGBtYXRjaGAgc3RyaW5nIChQaGFzZSAxOiBleGFjdFxuICAvLyBtYXRjaDsgdGhlIHN0cmF0ZWd5LWRpc3BhdGNoIGhvb2sgaW4gdGhlIHJ1bnRpbWUgc3VwcG9ydHMgc21hcnRlclxuICAvLyBtYXRjaGluZyBsYXRlciksIHRoZSBjb3JyZXNwb25kaW5nIGZlZWRiYWNrIGlzIHNob3duIGluc3RlYWQgb2YgdGhlXG4gIC8vIGdlbmVyaWMgaGludC4gRmlyc3QgbWF0Y2ggd2lucy4gYGZlZWRiYWNrYCBpcyByaWNoIGlubGluZSBjb250ZW50LlxuICBtaXN0YWtlRmVlZGJhY2s6IHouYXJyYXkoei5vYmplY3Qoe1xuICAgIG1hdGNoOiB6LnN0cmluZygpLFxuICAgIGZlZWRiYWNrOiB6LmFycmF5KElubGluZU5vZGUpLFxuICB9KSkub3B0aW9uYWwoKSxcbiAgLy8gT3JkZXItaW5kZXBlbmRlbnQgYW5zd2VyIGdyb3VwaW5nLiBXaGVuIHRydWUsIHRoaXMgYmxhbmsncyBhbnN3ZXIgaXNcbiAgLy8gaW50ZXJjaGFuZ2VhYmxlIHdpdGggdGhlIGJsYW5rIGltbWVkaWF0ZWx5IGJlZm9yZSBpdCAoaW4gZG9jdW1lbnQgb3JkZXIsXG4gIC8vIHdpdGhpbiB0aGUgc2FtZSBibG9jaykgXHUyMDE0IGUuZy4gZmFjdG9yaW5nIGAoeCArIFx1MjYxMCkoeCArIFx1MjYxMClgIHdoZXJlICgyLDMpIGFuZFxuICAvLyAoMywyKSBhcmUgYm90aCBjb3JyZWN0IGJ1dCAoMiwyKSBpcyBub3QuIEEgXCJncm91cFwiIGlzIGEgbWF4aW1hbCBydW4gb2ZcbiAgLy8gYWRqYWNlbnQgYmxhbmtzIGVhY2ggZmxhZ2dlZCBoZXJlOyB0aGUgcmVuZGVyZXIgY29tcGlsZXMgcnVucyBpbnRvIGFcbiAgLy8gc2hhcmVkIGBkYXRhLWJsYW5rLWdyb3VwYCBpZCwgYW5kIHRoZSBydW50aW1lIHNjb3JlcyB0aGUgZ3JvdXAgd2l0aFxuICAvLyBjb25zdW1lLW9uY2UgbWF0Y2hpbmcgKGVhY2ggY29ycmVjdCBhbnN3ZXIgY2FuIHNhdGlzZnkgb25seSBvbmUgYmxhbmspLlxuICAvL1xuICAvLyBUaGlzIGJvb2xlYW4gaXMgYXV0aG9yaW5nICpzdWdhcio6IHRoZSBnZW5lcmFsIG1vZGVsIGxpdmVzIGluIHRoZSBydW50aW1lXG4gIC8vIGRhdGEtYXR0cmlidXRlIGNvbnRyYWN0IChncm91cCBpZHMpLCBzbyByaWNoZXIgZ3JvdXBpbmcgKG5vbi1hZGphY2VudCxcbiAgLy8gY3Jvc3MtYmxvY2spIGNhbiBiZSBhZGRlZCBsYXRlciBhcyBhbiBhZGRpdGl2ZSBgZ3JvdXBgIGZpZWxkIHdpdGhvdXQgYVxuICAvLyBicmVha2luZyBjaGFuZ2UuIFRoZSBmaXJzdCBibGFuayBpbiBhIGJsb2NrIGlnbm9yZXMgdGhpcyBmbGFnIChub1xuICAvLyBwcmV2aW91cyBibGFuayB0byBncm91cCB3aXRoKS5cbiAgaW50ZXJjaGFuZ2VhYmxlV2l0aFByZXZpb3VzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgLy8gQW5zd2VyIGludGVycHJldGF0aW9uIG1vZGUuIEFic2VudCAoPSAndGV4dCcpIGtlZXBzIHRoZSBQaGFzZSAxIGJlaGF2aW9yOlxuICAvLyBleGFjdCBzdHJpbmcgbWF0Y2ggYWdhaW5zdCBhbnN3ZXIgKyBhY2NlcHRhYmxlQW5zd2Vycy4gJ251bWVyaWMnIHRlbGxzIHRoZVxuICAvLyBydW50aW1lIHRvIHBhcnNlIEJPVEggdGhlIHR5cGVkIHZhbHVlIGFuZCBlYWNoIGtleSBlbnRyeSBudW1lcmljYWxseVxuICAvLyAoZGVjaW1hbHMsIGZyYWN0aW9ucyBsaWtlIDMvMiwgbWl4ZWQgbnVtYmVycyBsaWtlIFwiMSAxLzJcIiwgY29tbWFcbiAgLy8gc2VwYXJhdG9ycywgYSBsZWFkaW5nICQpIGFuZCBjb21wYXJlIHdpdGhpbiBgdG9sZXJhbmNlYCBcdTIwMTQgc28gMC41LCAxLzIsXG4gIC8vIGFuZCAuNTAgYWxsIHNhdGlzZnkgYW4gYW5zd2VyIG9mIFwiMS8yXCIuIE9wdGlvbmFsIHJhdGhlciB0aGFuIGRlZmF1bHRlZCBzb1xuICAvLyBkb2N1bWVudHMgc3RvcmVkIGJlZm9yZSB0aGlzIGZpZWxkIGV4aXN0ZWQgcmUtc2VyaWFsaXplIGJ5dGUtaWRlbnRpY2FsbHkuXG4gIC8vICdtYXRoJyAoTW9kZWwgQiBtYXRoIGJsYW5rcykgZ3JhZGVzIHRoZSB0eXBlZCB2YWx1ZSBhcyBhIG1hdGggRVhQUkVTU0lPTjpcbiAgLy8gdGhlIHJ1bnRpbWUgbGF6eS1sb2FkcyB0aGUgZ3JhcGgta2l0IGFuZCBjb21wYXJlcyBieSBudW1lcmljLXNhbXBsaW5nXG4gIC8vIGVxdWl2YWxlbmNlICgyYSBcdTIyNjEgYSthIFx1MjI2MSBhKjIpLCBOT1Qgc3RyaW5nIG1hdGNoLiBTZWUgZG9jcy9kZXNpZ24vbWF0aC1ibGFua3MubWQuXG4gIGFuc3dlclR5cGU6IHouZW51bShbJ3RleHQnLCAnbnVtZXJpYycsICdtYXRoJ10pLm9wdGlvbmFsKCksXG4gIC8vIEFic29sdXRlIGNvbXBhcmlzb24gdG9sZXJhbmNlLiBGb3IgJ251bWVyaWMnOiB8dHlwZWQgLSBrZXl8IDw9IHRvbGVyYW5jZS5cbiAgLy8gRm9yICdtYXRoJzogdGhlIGFic29sdXRlIHRvbGVyYW5jZSBwYXNzZWQgdG8gdGhlIHNhbXBsaW5nIGNvbXBhcmlzb24uXG4gIC8vIEFic2VudCA9IGV4YWN0IGVxdWFsaXR5IChudW1lcmljKSAvIG5vIGV4dHJhIHNsYWNrIChtYXRoKS5cbiAgdG9sZXJhbmNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxuICAvLyBFcXVpdmFsZW5jZSBtb2RlIGZvciAnbWF0aCcgYmxhbmtzOiAndmFsdWUnIChkZWZhdWx0LCBhbnkgZXhwcmVzc2lvbiB0aGF0XG4gIC8vIGV2YWx1YXRlcyBlcXVhbCkgb3IgJ2V4YWN0LWZvcm0nIChub3JtYWxpemVkLXN0cmluZyBtYXRjaCBcdTIwMTQgXCJ3cml0ZSBpdCBpblxuICAvLyB0aGlzIGZvcm1cIikuIE9ubHkgbWVhbmluZ2Z1bCB3aGVuIGFuc3dlclR5cGUgaXMgJ21hdGgnOyBhYnNlbnQgPSAndmFsdWUnLlxuICBlcXVpdmFsZW5jZTogei5lbnVtKFsndmFsdWUnLCAnZXhhY3QtZm9ybSddKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBCbGFua1Rva2VuID0gei5pbmZlcjx0eXBlb2YgQmxhbmtUb2tlbj47XG5cbi8vIC0tLS0gRmlsbEluQmxhbmtJbmxpbmUgdW5pb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGaWxsSW5CbGFua0lubGluZSBpcyB0aGUgZXh0ZW5kZWQgYWxwaGFiZXQgZm9yIGZpbGxfaW5fYmxhbmsgYmxvY2tzIG9ubHkuXG4vLyBJbmNsdWRlcyBCbGFua1Rva2VuIGluIGFkZGl0aW9uIHRvIHRoZSBzdGFuZGFyZCBpbmxpbmUgbm9kZXMuXG5leHBvcnQgY29uc3QgRmlsbEluQmxhbmtJbmxpbmUgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgVGV4dE5vZGUsXG4gIElubGluZU1hdGhOb2RlLFxuICBIYXJkQnJlYWtOb2RlLFxuICBCbGFua1Rva2VuLFxuXSk7XG5leHBvcnQgdHlwZSBGaWxsSW5CbGFua0lubGluZSA9IHouaW5mZXI8dHlwZW9mIEZpbGxJbkJsYW5rSW5saW5lPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG5leHBvcnQgY29uc3QgUGFyYWdyYXBoQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdwYXJhZ3JhcGgnKSxcbiAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbn0pO1xuZXhwb3J0IHR5cGUgUGFyYWdyYXBoQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBQYXJhZ3JhcGhCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gVGhyZWUgbGV2ZWxzIGlzIGEgZGVsaWJlcmF0ZSBjb25zdHJhaW50LiBXb3Jrc2hlZXRzIGRvbid0IG5lZWQgZGVlcGVyXG4vLyBoaWVyYXJjaHkgYW5kIGNhcHBpbmcgaXQgYXQgMyBrZWVwcyB0aGUgdmlzdWFsIGhpZXJhcmNoeSBtZWFuaW5nZnVsLlxuZXhwb3J0IGNvbnN0IEhlYWRpbmdMZXZlbCA9IHoudW5pb24oW3oubGl0ZXJhbCgxKSwgei5saXRlcmFsKDIpLCB6LmxpdGVyYWwoMyldKTtcbmV4cG9ydCB0eXBlIEhlYWRpbmdMZXZlbCA9IHouaW5mZXI8dHlwZW9mIEhlYWRpbmdMZXZlbD47XG5cbmV4cG9ydCBjb25zdCBIZWFkaW5nQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdoZWFkaW5nJyksXG4gIGxldmVsOiBIZWFkaW5nTGV2ZWwsXG4gIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG59KTtcbmV4cG9ydCB0eXBlIEhlYWRpbmdCbG9jayA9IHouaW5mZXI8dHlwZW9mIEhlYWRpbmdCbG9jaz47XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGxhYmVsLnRzIFx1MjAxNCBTaGFyZWQgcGVyLWJsb2NrIGRpc3BsYXktbGFiZWwgZnJhZ21lbnQgKG51bWJlcmluZy9sYWJlbCBkZWNvdXBsZSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWNvdXBsZXMgXCJpcyB0aGlzIGdyYWRlYWJsZT9cIiBmcm9tIFwiZG9lcyBpdCB3ZWFyIGEgcHJvYmxlbSBudW1iZXI/XCIuIEFcbi8vIGdyYWRlYWJsZSBibG9jayBpcyBhbHdheXMgc2NvcmVkIGFuZCBhbHdheXMgcmV2aWV3YWJsZTsgdGhpcyBmaWVsZCBjb250cm9sc1xuLy8gb25seSB3aGF0IHNob3dzIG9uIHRoZSBwYWdlOlxuLy9cbi8vICAgYXV0byAgIFx1MjAxNCB0aGUgZGVmYXVsdDogYSBudW1iZXJlZCBwcm9ibGVtLCBjb25zdW1pbmcgb25lIHNsb3Qgb2YgdGhlXG4vLyAgICAgICAgICAgIGRvY3VtZW50LXdpZGUgc2VxdWVuY2UgKHRvZGF5J3MgYmVoYXZpb3IgZm9yIGV2ZXJ5IGdyYWRlYWJsZSBibG9jaykuXG4vLyAgIGN1c3RvbSBcdTIwMTQgc2hvdyBhdXRob3JlZCB0ZXh0IChcIldhcm0tdXBcIiwgXCJDaGFsbGVuZ2VcIikgaW5zdGVhZCBvZiBhIG51bWJlcixcbi8vICAgICAgICAgICAgYW5kIERPTidUIGNvbnN1bWUgYSBzZXF1ZW5jZSBzbG90IChvdXQtb2Ytc2VxdWVuY2UgbGFiZWwpLlxuLy8gICBub25lICAgXHUyMDE0IHNob3cgbm90aGluZzsgRE9OJ1QgY29uc3VtZSBhIHNsb3QuIFRoZSBub3RlcyBrZXl3b3JkLWJsYW5rIGNhc2U6XG4vLyAgICAgICAgICAgIGEgZ3JhZGVhYmxlIGdhcCB0aGF0IGtlZXBzIHN0dWRlbnRzIHJlYWRpbmcgd2l0aG91dCBsb29raW5nIGxpa2UgYVxuLy8gICAgICAgICAgICBxdWl6IHF1ZXN0aW9uLiBTdGlsbCBzY29yZWQsIHN0aWxsIGluIHRoZSB0ZWFjaGVyJ3MgcmVzdWx0cyB2aWV3XG4vLyAgICAgICAgICAgIChsb2NhdGVkIGJ5IGl0cyBzdXJyb3VuZGluZyB0ZXh0LCBub3QgYSBudW1iZXIpLlxuLy9cbi8vIE9wdGlvbmFsIHdpdGggTk8gZGVmYXVsdCwgZXhhY3RseSBsaWtlIHNpemluZ0ZpZWxkcyBhbmQgbWF0aF9ibG9jay5wcm9tcHRzOlxuLy8gYW4gYWJzZW50IGBsYWJlbGAgbWVhbnMgYGF1dG9gLCBzbyBhIGJsb2NrIGF1dGhvcmVkIGJlZm9yZSB0aGlzIGZlYXR1cmUgXHUyMDE0IG9yXG4vLyBvbmUgbGVmdCBhdCB0aGUgZGVmYXVsdCBcdTIwMTQgcmUtc2VyaWFsaXplcyBCWVRFLUlERU5USUNBTExZLiBUaGUgcmVuZGVyZXIgYW5kXG4vLyBlZGl0b3IgdHJlYXQgYHVuZGVmaW5lZGAgYW5kIGB7bW9kZTonYXV0byd9YCBpZGVudGljYWxseS5cbi8vXG4vLyBUaGUgcGVyLWJsb2NrIG1hbnVhbCBpbnRlZ2VyIGBudW1iZXJgIG92ZXJyaWRlIGlzIG9ydGhvZ29uYWwgYW5kIHN0aWxsIGxpdmVzXG4vLyBvbiB0aGUgaW5kaXZpZHVhbCBibG9ja3M6IGl0IHJlbGFiZWxzIHRoZSBzaG93biBpbnRlZ2VyIHdoaWxlIFNUQVlJTkcgaW5cbi8vIHNlcXVlbmNlLCBhbmQgaXQgYXBwbGllcyBvbmx5IHdoZW4gdGhlIGxhYmVsIG1vZGUgaXMgYXV0byAoY3VzdG9tL25vbmUgd2luKS5cbi8vIFNlZSBkb2NzL2Rlc2lnbiArIGJsb2NrLXByZWRpY2F0ZXMudHMuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcblxuZXhwb3J0IGNvbnN0IEJsb2NrTGFiZWwgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbignbW9kZScsIFtcbiAgei5vYmplY3QoeyBtb2RlOiB6LmxpdGVyYWwoJ2F1dG8nKSB9KSxcbiAgLy8gbWluKDEpOiBhbiBlbXB0eSBjdXN0b20gbGFiZWwgaXMgbWVhbmluZ2xlc3MgXHUyMDE0IGF1dGhvciBlaXRoZXIgd2FudHMgdGV4dCBvclxuICAvLyB3YW50cyBgbm9uZWAuIEtlZXBzIHJvdW5kLXRyaXAgaG9uZXN0IChubyBlbXB0eS1zdHJpbmcgZ2hvc3RzKS5cbiAgei5vYmplY3QoeyBtb2RlOiB6LmxpdGVyYWwoJ2N1c3RvbScpLCB0ZXh0OiB6LnN0cmluZygpLm1pbigxKSB9KSxcbiAgei5vYmplY3QoeyBtb2RlOiB6LmxpdGVyYWwoJ25vbmUnKSB9KSxcbl0pO1xuZXhwb3J0IHR5cGUgQmxvY2tMYWJlbCA9IHouaW5mZXI8dHlwZW9mIEJsb2NrTGFiZWw+O1xuXG4vLyBTcHJlYWQgaW50byBhIGdyYWRlYWJsZSBibG9jaydzIHoub2JqZWN0KHsuLi59KSBzaGFwZS4gUGxhaW4gb2JqZWN0IChub3QgYSBab2Rcbi8vIHNjaGVtYSkgc28gZWFjaCBibG9jayBrZWVwcyBhIGZsYXQgZmllbGQgbGlzdCBhbmQgZGlzY3JpbWluYXRlZFVuaW9uIGtlZXBzXG4vLyB3b3JraW5nLCBtaXJyb3Jpbmcgc2l6aW5nRmllbGRzLlxuZXhwb3J0IGNvbnN0IGxhYmVsRmllbGRzID0ge1xuICBsYWJlbDogQmxvY2tMYWJlbC5vcHRpb25hbCgpLFxufTtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IHNpemluZ0ZpZWxkcyB9IGZyb20gJy4uL3NpemluZy5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcbmltcG9ydCB7IE1hdGhQcm9tcHQsIElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG4vLyBEaXNwbGF5IG1hdGggKGNlbnRlcmVkLCBmdWxsIHdpZHRoIGJ5IGRlZmF1bHQpLiBJbmxpbmUgbWF0aCBpcyBpbiBpbmxpbmUudHNcbi8vIGFzIElubGluZU1hdGhOb2RlLiBUaGV5J3JlIHNlcGFyYXRlIG5vZGUgdHlwZXMgYmVjYXVzZSB0aGV5IHJlbmRlclxuLy8gZGlmZmVyZW50bHkgYW5kIGhhdmUgZGlmZmVyZW50IHNlbWFudGljIG1lYW5pbmcuXG5leHBvcnQgY29uc3QgTWF0aEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnbWF0aF9ibG9jaycpLFxuICBsYXRleDogei5zdHJpbmcoKSxcbiAgLy8gTW9kZWwgQTogb3B0aW9uYWwgaW4tZXF1YXRpb24gZ3JhZGVhYmxlIGdhcHMgKFx1MDBBN01hdGhQcm9tcHQsIGlubGluZS50cykuXG4gIC8vIE9wdGlvbmFsIHdpdGggTk8gZGVmYXVsdCBzbyBhIG1hdGggYmxvY2sgYXV0aG9yZWQgYmVmb3JlIE1vZGVsIEEgXHUyMDE0IG9yIG9uZVxuICAvLyB3aXRoIG5vIGdhcHMgXHUyMDE0IHJlLXNlcmlhbGl6ZXMgQllURS1JREVOVElDQUxMWS4gU2VlIGRvY3MvZGVzaWduL21hdGgtYmxhbmtzLm1kLlxuICBwcm9tcHRzOiB6LmFycmF5KE1hdGhQcm9tcHQpLm9wdGlvbmFsKCksXG4gIC8vIFdvcmtlZCBleHBsYW5hdGlvbiByZXZlYWxlZCBwb3N0LWNoZWNrLCBtaXJyb3JpbmcgRmlsbEluQmxhbmtCbG9jay5zb2x1dGlvbi5cbiAgLy8gT3B0aW9uYWw7IG9ubHkgbWVhbmluZ2Z1bCBvbiBhIGdhcC1iZWFyaW5nIGVxdWF0aW9uLiBOZXZlciBsZWFrcyB0aGUgZ2FwXG4gIC8vIGFuc3dlciBkaXJlY3RseSAodGhlIHNhbmN0aW9uZWQgcmV2ZWFsLCBwZXIgdGhlIHJ1bnRpbWUncyBuby1sZWFrIHN0YW5jZSkuXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIC8vIFZhcmlhYmxlIGJsb2NrIHNpemluZzogb3B0aW9uYWwgd2lkdGggZnJhY3Rpb24gKyBhbGlnbm1lbnQgKHNpemluZy50cykuXG4gIC4uLnNpemluZ0ZpZWxkcyxcbiAgLy8gUGVyLWJsb2NrIGRpc3BsYXkgbGFiZWwgXHUyMDE0IGEgZ2FwLWJlYXJpbmcgZXF1YXRpb24gaXMgYSBudW1iZXJlZCBwcm9ibGVtIGJ5XG4gIC8vIGRlZmF1bHQ7IGN1c3RvbS9ub25lIG9wdCBvdXQgKG51bWJlcmluZy9sYWJlbCBkZWNvdXBsZSkuIEluZXJ0IG9uIGFcbiAgLy8gcHJvbXB0LWZyZWUgZGlzcGxheSBlcXVhdGlvbiAoaXQncyBuZXZlciBudW1iZXJlZCByZWdhcmRsZXNzKS4gU2VlIGxhYmVsLnRzLlxuICAuLi5sYWJlbEZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgTWF0aEJsb2NrID0gei5pbmZlcjx0eXBlb2YgTWF0aEJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG4vLyBGb3VyIHZhcmlhbnRzIGlzIGEgZGVsaWJlcmF0ZSBjb25zdHJhaW50LiBNb3JlIHRoYW4gdGhpcyBhbmQgc3R5bGluZ1xuLy8gYmVjb21lcyBpbmNvbnNpc3RlbnQgYWNyb3NzIHdvcmtzaGVldHMuIEFkZGluZyBhIG5ldyB2YXJpYW50IGxhdGVyIGlzIGFcbi8vIGJyZWFraW5nIHNjaGVtYSBjaGFuZ2UgXHUyMDE0IGNvbnNpZGVyIHRoYXQgYmVmb3JlIGV4dGVuZGluZy5cbmV4cG9ydCBjb25zdCBDYWxsb3V0VmFyaWFudCA9IHouZW51bShbJ2luZm8nLCAnd2FybmluZycsICdzdWNjZXNzJywgJ25vdGUnXSk7XG5leHBvcnQgdHlwZSBDYWxsb3V0VmFyaWFudCA9IHouaW5mZXI8dHlwZW9mIENhbGxvdXRWYXJpYW50PjtcblxuZXhwb3J0IGNvbnN0IENhbGxvdXRCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2NhbGxvdXQnKSxcbiAgdmFyaWFudDogQ2FsbG91dFZhcmlhbnQsXG4gIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG59KTtcbmV4cG9ydCB0eXBlIENhbGxvdXRCbG9jayA9IHouaW5mZXI8dHlwZW9mIENhbGxvdXRCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFx1MjZCMCBUT01CU1RPTkUgXHUyMDE0IGBwcm9ibGVtYCBJUyBERUFELiBEbyBub3QgYnVpbGQgb24gaXQuIChSdWxpbmcgRTEsIDIwMjYtMDgtMTkpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGJsb2NrIHN0aWxsIHBhcnNlcywgYmVjYXVzZSBkb2N1bWVudHMgaW4gdGhlIGRhdGFiYXNlIG1heSBjb250YWluIG9uZSBhbmRcbi8vIHRoZSBzY2hlbWEgaXMgdGhlIHRoaW5nIHRoYXQgbXVzdCBrZWVwIHJlYWRpbmcgdGhlbS4gTk9USElORyBFTFNFIGFib3V0IGl0IGlzXG4vLyBhbGl2ZTpcbi8vXG4vLyAgIC0gVGhlIEVESVRPUiBDQU5OT1QgSE9MRCBPTkUuIHNlcmlhbGl6ZS50cydzIGFjdGl2aXR5QmxvY2tUb1RpcHRhcCBoYXMgbm9cbi8vICAgICBgcHJvYmxlbWAgbWFwcGluZyBhbmQgcmV0dXJucyBudWxsLCBzbyBhbiBpbXBvcnRlZCBvciBoYW5kLWluc2VydGVkXG4vLyAgICAgcHJvYmxlbSBpcyBkcm9wcGVkIGZyb20gdGhlIGVkaXRvciB2aWV3IGFuZCBERUxFVEVEIGJ5IHRoZSBmaXJzdFxuLy8gICAgIGF1dG9zYXZlLiBUaGlzIGlzIG5vdCBhIGdhcCB0byBmaWxsOyBpdCBpcyB3aHkgdGhlIGJsb2NrIGlzIGRlYWQuXG4vLyAgIC0gVGhlcmUgaXMgbm8gaW1wb3J0ZXIgZmVuY2UsIG5vIGluc2VydCBhZmZvcmRhbmNlLCBhbmQgbm8gZWRpdG9yIE5vZGVWaWV3LlxuLy8gICAtIFRoZSB2aWV3ZXIncyBQcm9ibGVtLnRzeCByZW5kZXJzIGl0IHJlYWQtb25seSBmb3IgdGhlIGRvY3VtZW50cyB0aGF0XG4vLyAgICAgYWxyZWFkeSBoYXZlIG9uZSwgYW5kIHRoYXQgaXMgaXRzIGVudGlyZSByZW1haW5pbmcgam9iLlxuLy9cbi8vIFRoZSBhbnN3ZXIta2V5IGRlc2lnbiBwYXNzIChkb2NzL2Rlc2lnbi9wcm9ibGVtLWFuc3dlci1rZXkubWQpIG9wZW5lZCBieVxuLy8gcHJvcG9zaW5nIHRvIFJFVklWRSB0aGlzIGJsb2NrIGFzIHRoZSBob21lIG9mIHBhcGVyIHByb2JsZW1zLiBUaGUgc2NvcGUgZ2F0ZVxuLy8gb3ZlcnR1cm5lZCB0aGF0IHByZW1pc2Ugb24gdGhlIGV2aWRlbmNlIGFib3ZlOiBwYXBlciBwcm9ibGVtcyBzaGlwIG9uXG4vLyBzaG9ydF9hbnN3ZXIvZXNzYXksIHdoaWNoIGhhdmUgdGhlIGVkaXRvciwgdGhlIGZlbmNlcywgdGhlIHZpZXdlciwgYW5kIDAwMzQnc1xuLy8gZ3JhZGluZyBxdWV1ZSB0aGF0IGBwcm9ibGVtYCBuZXZlciBoYWQuIEZ1bGwgUkVNT1ZBTCBvZiB0aGUgdHlwZSAod2l0aCB0aGVcbi8vIFA1IGNsYWltcy1ncmVwIG92ZXIgZXZlcnkgY29tbWVudCB0aGF0IGNpdGVzIGl0KSBpcyBhIHJlY29yZGVkIFRPRE8sIG5vdCBwYXJ0XG4vLyBvZiB0aGF0IHNsaWNlIFx1MjAxNCByZW1vdmluZyBhIHBhcnNlYWJsZSBzaGFwZSBpcyBhIG1pZ3JhdGlvbiBxdWVzdGlvbi5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIEF1dG8tbnVtYmVyZWQgYXQgcmVuZGVyIHRpbWUgYnkgd2Fsa2luZyB0aGUgZG9jdW1lbnQgYW5kIGNvdW50aW5nIHByb2JsZW1cbi8vIGJsb2NrcyBpbiBvcmRlci4gVGhlIG9wdGlvbmFsIGBudW1iZXJgIGZpZWxkIG92ZXJyaWRlcyB0aGUgYXV0by1udW1iZXJcbi8vIChyYXJlIGNhc2VzIGxpa2UgXCJQcm9ibGVtIDVhXCIgb3IgaGFuZC1udW1iZXJlZCBsZWdhY3kgd29ya3NoZWV0cykuXG4vL1xuLy8gc29sdXRpb246IG9wdGlvbmFsIHdvcmtlZCBleHBsYW5hdGlvbiBzaG93biB0byBhbGwgc3R1ZGVudHMgYWZ0ZXIgdGhlXG4vLyBzZWN0aW9uIGlzIGNoZWNrZWQgKG9yIGFmdGVyIGZpbmFsIHN1Ym1pdCBpbiBzaW5nbGUtbW9kZSBhY3Rpdml0aWVzKSxcbi8vIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGV5IGFuc3dlcmVkIGNvcnJlY3RseS4gRGlmZmVyZW50IGZyb20gaGludCBcdTIwMTRcbi8vIGhpbnRzIG51ZGdlIGR1cmluZyB0aGUgYXR0ZW1wdDsgc29sdXRpb25zIGV4cGxhaW4gYWZ0ZXIuIFRoZSBydW50aW1lXG4vLyByZWFkcyB0aGlzIG9uIGluaXQgYnV0IGRvZXMgTk9UIGluamVjdCBpdCBpbnRvIHRoZSBET00gdW50aWwgYWZ0ZXJcbi8vIGNoZWNrIChQaGFzZSAxIHNlY3VyaXR5IGNlaWxpbmcgXHUyMDE0IGRvbid0IG1ha2UgdGhlIGxlYWsgd29yc2UpLlxuLy9cbi8vIHNraWxsczogb3B0aW9uYWwgYXJyYXkgb2YgdW5pdmVyc2FsIHNraWxsIHRhZ3MgdGhpcyBwcm9ibGVtIHRhcmdldHMuXG4vLyBBY3Rpdml0eS1sZXZlbCBza2lsbHMgbGl2ZSBvbiBBY3Rpdml0eU1ldGE7IHRoaXMgZmllbGQgY2FwdHVyZXNcbi8vIHByb2JsZW0tbGV2ZWwgZ3JhbnVsYXJpdHkgZm9yIGZ1dHVyZSBwZXItc2tpbGwgYW5hbHl0aWNzLiBFZGl0b3IgVUkgaXNcbi8vIFBoYXNlIDI7IHRoZSBmaWVsZCBleGlzdHMgaW4gUGhhc2UgMSBzbyBhbmFseXRpY3MgY2FuIHJlYWNoIGJhY2suXG5leHBvcnQgY29uc3QgUHJvYmxlbUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogei5saXRlcmFsKCdwcm9ibGVtJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBQcm9ibGVtQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBQcm9ibGVtQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgRmlsbEluQmxhbmtJbmxpbmUsIElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5cbi8vIFRoZSBhcmNoaXRlY3R1cmFsbHkgaW50ZXJlc3RpbmcgYmxvY2suIGNvbnRlbnQgaXMgYW4gYXJyYXkgb2YgaW5saW5lIG5vZGVzXG4vLyB0aGF0IG1heSBpbmNsdWRlIEJsYW5rVG9rZW4gXHUyMDE0IHN0dWRlbnRzIHNlZSBwcm9zZSB3aXRoIGVkaXRhYmxlIGJsYW5rcy5cbi8vIEVhY2ggYmxhbmsncyBpZCBpcyBhIHN0YWJsZSByZWZlcmVuY2UgdXNlZCBpbiBzdWJtaXNzaW9ucy5yZXNwb25zZXMsIHNvXG4vLyByZW9yZGVyaW5nIGJsb2NrcyBkb2Vzbid0IGJyZWFrIGdyYWRpbmcgb24gcGFzdCBzdWJtaXNzaW9ucy5cbi8vXG4vLyBhdXRvLW51bWJlcmVkIGxpa2UgUHJvYmxlbUJsb2NrIGZvciB0aGUgcHJvYmxlbSBoZWFkZXIgKGUuZy4sIFwiUHJvYmxlbSAzXCIpLlxuLy8gV2h5IG5vdCBqdXN0IHVzZSBQcm9ibGVtQmxvY2s/IFRoZXkgaGF2ZSBkaWZmZXJlbnQgcmVuZGVyaW5nIGFuZCBkaWZmZXJlbnRcbi8vIHN0dWRlbnQgaW50ZXJhY3Rpb247IGNvbmZsYXRpbmcgdGhlbSB3b3VsZCBmb3JjZSBldmVyeSBwcm9ibGVtIHRvIGVpdGhlclxuLy8gaGF2ZSBvciBub3QgaGF2ZSBibGFua3MsIGluc3RlYWQgb2YgYmVpbmcgYSBwZXItcHJvYmxlbSBkZWNpc2lvbi5cbi8vXG4vLyBQZXItYmxhbmsgZmllbGRzIChoaW50LCBtaXN0YWtlRmVlZGJhY2spIGxpdmUgb24gQmxhbmtUb2tlbiBpbiBpbmxpbmUudHMuXG4vLyBQZXItYmxvY2sgZmllbGRzIGJlbG93OlxuLy8gICAtIHNvbHV0aW9uOiBvbmUgd29ya2VkIGV4cGxhbmF0aW9uIGZvciB0aGUgd2hvbGUgcHJvYmxlbSAoYSBcInNpbXBsaWZ5XG4vLyAgICAgX194XHUwMEIyICsgX194IC0gMTJcIiBwcm9tcHQgaGFzIG9uZSBzb2x1dGlvbiBjb3ZlcmluZyBhbGwgYmxhbmtzLCBub3Qgb25lXG4vLyAgICAgcGVyIGJsYW5rKS4gU2hvd24gcG9zdC1jaGVjayByZWdhcmRsZXNzIG9mIGNvcnJlY3RuZXNzLlxuLy8gICAtIGhhc0NvbmZpZGVuY2VSYXRpbmc6IHdoZW4gdHJ1ZSwgc3R1ZGVudHMgc2VlIGEgMy1wb2ludCBjb25maWRlbmNlXG4vLyAgICAgc2VsZWN0b3IgKHVuc3VyZSAvIHRoaW5rX3NvIC8gY2VydGFpbikgZm9yIHRoaXMgcHJvYmxlbSBiZWZvcmVcbi8vICAgICBjaGVja2luZy4gQXNrZWQgb25jZSBwZXIgcHJvYmxlbSwgbm90IHBlciBibGFuay4gVGhlIHJ1bnRpbWUgc3RvcmVzXG4vLyAgICAgdGhlIHJhdGluZyBwZXItYmxhbmsgaW4gU3VibWlzc2lvblJlc3BvbnNlcyAoYXBwbGllZCB1bmlmb3JtbHkgdG9cbi8vICAgICBldmVyeSBibGFuayBpbiB0aGlzIHByb2JsZW0pLlxuLy8gICAtIHNraWxsczogdW5pdmVyc2FsIHNraWxsIHRhZ3MgKHNlZSBBY3Rpdml0eU1ldGEuc2tpbGxzKS4gRWRpdG9yIFVJIGZvclxuLy8gICAgIHRoaXMgZmllbGQgaXMgUGhhc2UgMjsgZmllbGQgZXhpc3RzIGluIFBoYXNlIDEgc28gcGVyLXNraWxsIGFuYWx5dGljc1xuLy8gICAgIGNhbiByZWFjaCBiYWNrIHRvIFBoYXNlIDEgcHJvYmxlbXMgd2hlbiB0aGUgZWRpdG9yIGxhbmRzLlxuLy8gICAtIHdvcmtTcGFjZTogcGVyLXByb2JsZW0gb3ZlcnJpZGUgKGluIHJlbSkgZm9yIHRoZSBibGFuayB3b3JraW5nIHNwYWNlXG4vLyAgICAgcHJpbnRlZCBiZWxvdyB0aGlzIHByb2JsZW0uIE9wdGlvbmFsIHdpdGggTk8gZGVmYXVsdCBvbiBwdXJwb3NlOiBhblxuLy8gICAgIGFic2VudCB2YWx1ZSBtZWFucyBcImluaGVyaXQgdGhlIGFjdGl2aXR5LWxldmVsIHByaW50LndvcmtTcGFjZVwiLCB3aGljaFxuLy8gICAgIGlzIGV4YWN0bHkgdGhlIENTUy1jdXN0b20tcHJvcGVydHkgaW5oZXJpdGFuY2UgdGhlIHJlbmRlcmVyIHJlbGllcyBvblxuLy8gICAgICh0aGUgYmxvY2sgc2V0cyBpdHMgb3duIC0tcHJpbnQtd29yay1zcGFjZSBvbmx5IHdoZW4gdGhpcyBpcyBwcmVzZW50KS5cbi8vICAgICBBIGRlZmF1bHQgaGVyZSB3b3VsZCBwaW4gZXZlcnkgYmxvY2sgdG8gYSBjb25jcmV0ZSB2YWx1ZSBhbmQgZGVmZWF0XG4vLyAgICAgdGhhdCBpbmhlcml0YW5jZS4gUHJpbnQtb25seTsgaWdub3JlZCBvbiBzY3JlZW4uXG5leHBvcnQgY29uc3QgRmlsbEluQmxhbmtCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB6LmxpdGVyYWwoJ2ZpbGxfaW5fYmxhbmsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogei5hcnJheShGaWxsSW5CbGFua0lubGluZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NvbmZpZGVuY2VSYXRpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtTcGFjZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGVyLWJsb2NrIGRpc3BsYXkgbGFiZWwgKGF1dG8vY3VzdG9tL25vbmUpLiBBYnNlbnQgPSBhdXRvID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdG9kYXkncyBudW1iZXJlZCBiZWhhdmlvci4gU2VlIGxhYmVsLnRzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5sYWJlbEZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgRmlsbEluQmxhbmtCbG9jayA9IHouaW5mZXI8dHlwZW9mIEZpbGxJbkJsYW5rQmxvY2s+O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBsaXN0LnRzIFx1MjAxNCBCdWxsZXQgYW5kIG9yZGVyZWQgbGlzdCBibG9ja3Ncbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBMaXN0cyBuZXN0LiBBIExpc3RJdGVtIGhvbGRzIGlubGluZSBjb250ZW50IHBsdXMgYW4gb3B0aW9uYWwgYGNoaWxkcmVuYFxuLy8gYXJyYXkgb2YgbmVzdGVkIGxpc3QgYmxvY2tzOyBidWxsZXQgYW5kIG9yZGVyZWQgbGlzdHMgY2FuIG1peCBmcmVlbHkgYXRcbi8vIGFueSBkZXB0aC4gVGhpcyBtaXJyb3JzIFRpcHRhcCdzIGxpc3RJdGVtID4gcGFyYWdyYXBoICsgKGJ1bGxldExpc3QgfFxuLy8gb3JkZXJlZExpc3QpIHNoYXBlIGVuZC10by1lbmQsIHNvIFRhYi10by1pbmRlbnQgaW4gdGhlIGVkaXRvciBwcmVzZXJ2ZXNcbi8vIGhpZXJhcmNoeSB0aHJvdWdoIGF1dG9zYXZlLlxuLy9cbi8vIFJlY3Vyc2lvbiBtZWNoYW5pYzogb25seSB0aGUgY3ljbGljIGVkZ2UgKExpc3RJdGVtLmNoaWxkcmVuIFx1MjE5MiBsaXN0IGJsb2NrIFx1MjE5MlxuLy8gTGlzdEl0ZW0pIG5lZWRzIHoubGF6eSgpLiBCdWxsZXRMaXN0QmxvY2sgYW5kIE9yZGVyZWRMaXN0QmxvY2sgYXJlIHBsYWluXG4vLyB6Lm9iamVjdHMsIHdoaWNoIGtlZXBzIHRoZW0gdXNhYmxlIGFzIG1lbWJlcnMgb2Ygei5kaXNjcmltaW5hdGVkVW5pb24gaW5cbi8vIGJsb2Nrcy9pbmRleC50cy4gRGlzY3JpbWluYXRlZCB1bmlvbnMgbmVlZCBab2RPYmplY3RzIHRvIGludHJvc3BlY3QgdGhlXG4vLyBgdHlwZWAgZGlzY3JpbWluYXRvcjsgYSB0b3AtbGV2ZWwgei5sYXp5KCkgd3JhcHBlciB3b3VsZCBkZWZlYXQgdGhhdC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vIC0tLS0gVHlwZVNjcmlwdCBpbnRlcmZhY2VzIChmb3J3YXJkIGRlY2xhcmF0aW9ucyBmb3IgdGhlIHJlY3Vyc2l2ZSB0eXBlcykgLS0tXG5cbmV4cG9ydCBpbnRlcmZhY2UgTGlzdEl0ZW0ge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY29udGVudDogei5pbmZlcjx0eXBlb2YgSW5saW5lTm9kZT5bXTtcbiAgICBjaGlsZHJlbj86IEFycmF5PEJ1bGxldExpc3RCbG9jayB8IE9yZGVyZWRMaXN0QmxvY2s+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1bGxldExpc3RCbG9jayB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB0eXBlOiAnYnVsbGV0X2xpc3QnO1xuICAgIGl0ZW1zOiBMaXN0SXRlbVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE9yZGVyZWRMaXN0QmxvY2sge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgdHlwZTogJ29yZGVyZWRfbGlzdCc7XG4gICAgaXRlbXM6IExpc3RJdGVtW107XG59XG5cbi8vIC0tLS0gWm9kIHNjaGVtYXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIExhenkgYmVjYXVzZSBMaXN0SXRlbS5jaGlsZHJlbiByZWZlcnMgdG8gdGhlIGxpc3QgYmxvY2tzLCB3aGljaCByZWZlciBiYWNrXG4vLyB0byBMaXN0SXRlbS4gVGhlIGFycm93IGJvZHkgb25seSBydW5zIGF0IHBhcnNlIHRpbWUsIGJ5IHdoaWNoIHBvaW50IGFsbFxuLy8gdGhyZWUgZXhwb3J0cyBhcmUgYm91bmQuXG5leHBvcnQgY29uc3QgTGlzdEl0ZW06IHouWm9kVHlwZTxMaXN0SXRlbSwgei5ab2RUeXBlRGVmLCB1bmtub3duPiA9IHoubGF6eSgoKSA9Plxuei5vYmplY3Qoe1xuICAgIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgICAgICAgIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gICAgICAgICBjaGlsZHJlbjogelxuICAgICAgICAgLmFycmF5KHoudW5pb24oW0J1bGxldExpc3RCbG9jaywgT3JkZXJlZExpc3RCbG9ja10pKVxuICAgICAgICAgLm9wdGlvbmFsKCksXG59KSxcbik7XG5cbmV4cG9ydCBjb25zdCBCdWxsZXRMaXN0QmxvY2sgPSB6Lm9iamVjdCh7XG4gICAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHoubGl0ZXJhbCgnYnVsbGV0X2xpc3QnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogei5hcnJheShMaXN0SXRlbSksXG59KTtcblxuZXhwb3J0IGNvbnN0IE9yZGVyZWRMaXN0QmxvY2sgPSB6Lm9iamVjdCh7XG4gICAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB6LmxpdGVyYWwoJ29yZGVyZWRfbGlzdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogei5hcnJheShMaXN0SXRlbSksXG59KTtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5pbXBvcnQgeyBzaXppbmdGaWVsZHMgfSBmcm9tICcuLi9zaXppbmcuanMnO1xuaW1wb3J0IHtcbiAgQXhpc0NvbmZpZyxcbiAgQ3VydmVEb21haW4sXG4gIERyYXdhYmxlLFxuICBFbmRwb2ludFN0eWxlLFxuICBGdW5jdGlvbk1vZGVsLFxufSBmcm9tICcuLi9ncmFwaC1wcmltaXRpdmVzLmpzJztcblxuLy8gVGhlIGNvb3JkaW5hdGUtcGxhbmUgcHJpbWl0aXZlcyAoQXhpc0NvbmZpZywgRW5kcG9pbnRTdHlsZSwgQ3VydmVEb21haW4sIHRoZVxuLy8gRnVuY3Rpb25Nb2RlbCBmYW1pbHksIERyYXdhYmxlQ29sb3IsIERyYXdhYmxlKSBNT1ZFRCB0byAuLi9ncmFwaC1wcmltaXRpdmVzLnRzXG4vLyBcdTIwMTQgYSBsZWFmIG1vZHVsZSB0aGF0IGltcG9ydHMgbm90aGluZyBidXQgem9kLiBUaGV5IGFyZSByZS1leHBvcnRlZCBoZXJlLCB3aXRoXG4vLyBpZGVudGljYWwgaWRlbnRpdGllcywgc28gZXZlcnkgZXhpc3RpbmcgaW1wb3J0IHBhdGgga2VlcHMgd29ya2luZy5cbi8vXG4vLyBXaHkgdGhleSBtb3ZlZDogdGhpcyBmaWxlIGltcG9ydHMgSW5saW5lTm9kZSwgc28gcmVhY2hpbmcgdGhlIHByaW1pdGl2ZXNcbi8vIHRocm91Z2ggaXQgZHJhZ3MgaW4gaW5saW5lLnRzLiBpbmxpbmUudHMgbm93IG5lZWRzIGdyYXBoX2ZpZ3VyZSAoYSBkZWZpbml0aW9uXG4vLyBtYXkgY29udGFpbiBvbmUpLCB3aGljaCB3b3VsZCBjbG9zZSB0aGUgY3ljbGUgaW5saW5lIC0+IGdyYXBoLWZpZ3VyZSAtPlxuLy8gaW50ZXJhY3RpdmUtZ3JhcGggLT4gaW5saW5lLiBUaGF0IGN5Y2xlIGlzIGZhdGFsLCBub3QgY29zbWV0aWM6IHRoZVxuLy8gYHouYXJyYXkoSW5saW5lTm9kZSlgIGNhbGxzIGJlbG93IHJ1biBhdCBtb2R1bGUgc2NvcGUgYW5kIHdvdWxkIGhpdCBhIFREWlxuLy8gUmVmZXJlbmNlRXJyb3Igb24gYSBwYXJ0aWFsbHktaW5pdGlhbGl6ZWQgaW5saW5lLmpzLiBTZWUgZ3JhcGgtcHJpbWl0aXZlcy50cy5cbmV4cG9ydCB7XG4gIEF4aXNDb25maWcsXG4gIEVuZHBvaW50U3R5bGUsXG4gIEN1cnZlRG9tYWluLFxuICBMaW5lYXJNb2RlbCxcbiAgUXVhZHJhdGljTW9kZWwsXG4gIEV4cG9uZW50aWFsTW9kZWwsXG4gIExvZ2FyaXRobWljTW9kZWwsXG4gIFZlcnRpY2FsTW9kZWwsXG4gIEZ1bmN0aW9uTW9kZWwsXG4gIERyYXdhYmxlQ29sb3IsXG4gIERyYXdhYmxlLFxufSBmcm9tICcuLi9ncmFwaC1wcmltaXRpdmVzLmpzJztcbmV4cG9ydCB0eXBlIHsgRHJhd2FibGVDb2xvclQgfSBmcm9tICcuLi9ncmFwaC1wcmltaXRpdmVzLmpzJztcblxuLy8gVGhlIGludGVyYWN0aXZlIGdyYXBoIGJsb2NrIChQaGFzZSAyLjcsIFN0YWdlIDUpLiBVbmxpa2UgZXZlcnkgb3RoZXIgYmxvY2ssXG4vLyB0aGUgc3R1ZGVudCdzIGFuc3dlciBpcyBHRU9NRVRSSUMgXHUyMDE0IGEgcG9pbnQgdGhleSBwbG90IG9uIGEgY29vcmRpbmF0ZSBwbGFuZSBcdTIwMTRcbi8vIG5vdCB0ZXh0LiBUaHJlZSBzdHJ1Y3R1cmFsIGNvbnNlcXVlbmNlcyAoc2VlIGRvY3MvZGVzaWduL2ludGVyYWN0aXZlLWdyYXBoLVxuLy8gYmxvY2subWQpOiB0aGUgYW5zd2VyIGlzIGEgc3RydWN0dXJlZCB2YWx1ZSAoaXRzIG93biBzdWJtaXNzaW9uIG1hcCwgbm90IHRoZVxuLy8gYmxhbmtzIG1hcCksIHNjb3JpbmcgaXMgdG9sZXJhbmNlLWJhc2VkIGdlb21ldHJpYyBjb21wYXJpc29uICh0aGUgZ3JhcGgta2l0XG4vLyBzY29yZXMgaXQsIG5vdCB0aGUgcnVudGltZSdzIHN0cmluZyBzdHJhdGVnaWVzKSwgYW5kIHRoZSB3aWRnZXQgaXMgbGFyZ2Vcbi8vIChKU1hHcmFwaCByaWRlcyB0aGUgbGF6eS1sb2FkZWQgQGFjdGl2aXR5L2dyYXBoLWtpdCwgbmV2ZXIgdGhlIGJhc2UgcnVudGltZSkuXG4vL1xuLy8gU2xpY2UgMSAoMi43YSkgc2hpcHMgT05FIGludGVyYWN0aW9uIFx1MjAxNCBwbG90X3BvaW50LiBUaGUgaW50ZXJhY3Rpb24gaXMgYVxuLy8gZGlzY3JpbWluYXRlZCB1bmlvbiBmcm9tIGRheSBvbmUgc28gcGxvdF9saW5lICgyLjdiKSBhbmQgc2hhZGVfcmVnaW9uICgyLjdjKVxuLy8gYXJlIGVhY2ggYSBuZXcgdmFyaWFudCArIGEgbmV3IHNjb3Jpbmcgc3RyYXRlZ3kgd2l0aCBOTyBzY2hlbWEgbWlncmF0aW9uIGFuZFxuLy8gbm8gY2hhbmdlIHRvIGFueSBvdGhlciBibG9jayB0eXBlIFx1MjAxNCBleGFjdGx5IGhvdyB0aGUgdG9wLWxldmVsIEJsb2NrIHVuaW9uXG4vLyBncm93cy5cblxuLy8gLS0tLSBJbnRlcmFjdGlvbiB2YXJpYW50cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVhY2ggdmFyaWFudCBjYXJyaWVzIGl0cyBPV04gYW5zd2VyIGtleSArIHRvbGVyYW5jZS4gcGxvdF9wb2ludCBpcyB0aGUgb25seVxuLy8gdmFyaWFudCBpbiBzbGljZSAxOyB0aGUgdW5pb24gc2hhcGUgaXMgaGVyZSBzbyB0aGUgbmV4dCB2YXJpYW50cyBzbG90IGluLlxuZXhwb3J0IGNvbnN0IFBvaW50SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9wb2ludCcpLFxuICAvLyBPbmUgb3IgbW9yZSBjb3JyZWN0IHBvaW50czsgdGhlIHN0dWRlbnQgbXVzdCBwbG90IGFsbCBvZiB0aGVtLiBBIHNpbmdsZVxuICAvLyBwb2ludCBpcyB0aGUgY29tbW9uIGNhc2U7IG11bHRpcGxlIHN1cHBvcnRzIGUuZy4gXCJwbG90IHRoZSB0d28gcm9vdHMuXCJcbiAgY29ycmVjdFBvaW50czogei5hcnJheSh6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSkpLm1pbigxKSxcbiAgLy8gUGVyLXBvaW50IHRvbGVyYW5jZSBpbiBncmFwaCB1bml0cyAoYSBFdWNsaWRlYW4vZWFjaC1heGlzIHJhZGl1cywgYXBwbGllZFxuICAvLyBieSB0aGUga2l0J3Mgc2NvcmVyKS4gMC4xIGRlZmF1bHQgc3VpdHMgYSBzbmFwLXRvLWdyaWQgc2luZ2xlIHBvaW50LlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIFBvaW50SW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBQb2ludEludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBwbG90X2Z1bmN0aW9uOiBwbG90IGEgY3VydmUgb2YgYSBnaXZlbiBmYW1pbHkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc3R1ZGVudCBwbGFjZXMgTiBwb2ludHMgYW5kIHRoZSB3aWRnZXQgZml0cyArIGRyYXdzIGEgY3VydmUgVEhST1VHSCB0aGVtXG4vLyAoTiA9IHRoZSBmYW1pbHkncyBwYXJhbWV0ZXIgY291bnQ6IGxpbmVhciAyLCBxdWFkcmF0aWMgMywgZXhwb25lbnRpYWwgMixcbi8vIGxvZ2FyaXRobWljIDIpLiBTY29yZWQgb24gdGhlIGZpdHRlZCBjdXJ2ZSdzIFBBUkFNRVRFUlMgKG5vdCB0aGUgZXhhY3QgcG9pbnRcbi8vIHBvc2l0aW9ucyksIHNvIGFueSBwb2ludHMgb24gdGhlIGNvcnJlY3QgY3VydmUgYXJlIGFjY2VwdGVkLiBUaGUgcGFyYW1ldGVyc1xuLy8gY29tZSBmcm9tIHRoZSBTQU1FIHJlZ3Jlc3Npb24gZml0IGVuZ2luZSB0aGUgY2FsY3VsYXRvciB1c2VzIChmaXRMaW5lYXIsIFx1MjAyNikuXG4vL1xuLy8gYG1vZGVsYCBpcyBhIGRpc2NyaW1pbmF0ZWQgdW5pb24gb24gYGZhbWlseWAgKEZ1bmN0aW9uTW9kZWwsIG5vdyBpblxuLy8gLi4vZ3JhcGgtcHJpbWl0aXZlcy50cyBhbmQgcmUtZXhwb3J0ZWQgYWJvdmUpOiBsaW5lYXIsIHF1YWRyYXRpYywgZXhwb25lbnRpYWwsXG4vLyBsb2dhcml0aG1pYywgdmVydGljYWwuIEdyb3dpbmcgYSBmYW1pbHkgaXMgYSBuZXcgbWVtYmVyIHRoZXJlICsgYSBuZXcgZml0XG4vLyBicmFuY2ggaW4gdGhlIGtpdCdzIHNjb3JlciBcdTIwMTQgYWRkaXRpdmUsIG5vdCBhIHJld3JpdGUuXG5cbi8vIHBsb3RfZnVuY3Rpb24gY2FycmllcyBhbiBBUlJBWSBvZiBjdXJ2ZXMgKHNoaXBzIGFzIG9uZSkuIE9uZSBjdXJ2ZSBpcyB0aGVcbi8vIGNvbW1vbiBjYXNlOyBtdWx0aXBsZSBpcyBhIHN5c3RlbSBvZiBlcXVhdGlvbnMgKFwiZ3JhcGggYm90aCBsaW5lc1wiKSwgc2NvcmVkXG4vLyBhcyBvbmUgb2JqZWN0IGVhY2ggXHUyMDE0IHNvIHN5c3RlbXMgYXJlIGFkZGl0aXZlLCBub3QgYSByZXNoYXBlIChEcm9wIDIgZGVjaXNpb24pLlxuZXhwb3J0IGNvbnN0IEZ1bmN0aW9uSW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9mdW5jdGlvbicpLFxuICBtb2RlbHM6IHouYXJyYXkoRnVuY3Rpb25Nb2RlbCkubWluKDEpLFxuICAvLyBEcm9wIDY6IG9wdGlvbmFsIHBlci1jdXJ2ZSBkb21haW4gcmVzdHJpY3Rpb25zIChcImdyYXBoIHkgPSAyeCArIDMgZm9yXG4gIC8vIHggPj0gMFwiKSwgcGFyYWxsZWwgdG8gbW9kZWxzIGJ5IGluZGV4LiBUaGUgZnJlZWZvcm0gcGFyc2VyIGZpbGxzIHRoZXNlIGZyb21cbiAgLy8gYSBgZm9yIFx1MjAyNmAgY2xhdXNlOyB0aGUgd2lkZ2V0J3MgZW5kcG9pbnQtZHJhZyBVWCBpcyB0aGUgcGxhbm5lZCBmb2xsb3ctdXAgXHUyMDE0XG4gIC8vIHVudGlsIGl0IGxhbmRzLCB0aGUgZG9tYWluIGlzIGF1dGhvcmluZyBtZXRhZGF0YSBkcmF3biBvbiB0aGUga2V5LCBhbmRcbiAgLy8gc2NvcmluZyByZW1haW5zIG9uIHRoZSBjdXJ2ZSBwYXJhbWV0ZXJzLlxuICBkb21haW5zOiB6LmFycmF5KEN1cnZlRG9tYWluLm51bGxhYmxlKCkpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIEZ1bmN0aW9uSW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBGdW5jdGlvbkludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBzaGFkZV9yZWdpb246IHNoYWRlIGEgcG9seWdvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHN0dWRlbnQgZHJhZ3MgdGhlIHZlcnRpY2VzIG9mIGEgcG9seWdvbiAob25lIGhhbmRsZSBwZXIgdmVydGV4KSB0byBjb3ZlciBhXG4vLyB0YXJnZXQgcmVnaW9uLCB3aGljaCBpcyBzaGFkZWQgYXMgdGhleSBtb3ZlLiBTY29yZWQgYnkgQVJFQSBPVkVSTEFQIHdpdGggdGhlXG4vLyBjb3JyZWN0IHBvbHlnb24gKGludGVyc2VjdGlvbi1vdmVyLXVuaW9uIFx1MjI2NSBtaW5PdmVybGFwKSwgc28gdGhlIGV4YWN0IHZlcnRleFxuLy8gcG9zaXRpb25zIGRvbid0IG1hdHRlciBcdTIwMTQgb25seSB0aGF0IHRoZSBzaGFkZWQgcmVnaW9uIG1hdGNoZXMuIEEgcG9seWdvbiwgbm90IGFcbi8vIGN1cnZlLCBzbyBpdCdzIGl0cyBvd24gaW50ZXJhY3Rpb24gKG5vdCBhIHBsb3RfZnVuY3Rpb24gZmFtaWx5KS5cbi8vIE9uZSB0YXJnZXQgcG9seWdvbjogdmVydGljZXMgaW4gb3JkZXIgKG1pbiAzKSArIHRoZSBtaW5pbXVtIGludGVyc2VjdGlvbi1vdmVyLVxuLy8gdW5pb24gd2l0aCB0aGUgc3R1ZGVudCdzIHBvbHlnb24gdG8gY291bnQgYXMgY29ycmVjdC5cbmV4cG9ydCBjb25zdCBSZWdpb25BbnN3ZXIgPSB6Lm9iamVjdCh7XG4gIGNvcnJlY3RWZXJ0aWNlczogei5hcnJheSh6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSkpLm1pbigzKSxcbiAgLy8gMC45IGlzIHN0cmljdCAobmVhci1leGFjdCBvbiBhIHNuYXBwZWQgZ3JpZCk7IGxvd2VyIGl0IGZvciBoYW5kLWRyYWdnZWQgL1xuICAvLyBhcHByb3hpbWF0ZSByZWdpb25zLlxuICBtaW5PdmVybGFwOiB6Lm51bWJlcigpLm1pbigwKS5tYXgoMSkuZGVmYXVsdCgwLjkpLFxufSk7XG5leHBvcnQgdHlwZSBSZWdpb25BbnN3ZXIgPSB6LmluZmVyPHR5cGVvZiBSZWdpb25BbnN3ZXI+O1xuXG4vLyBzaGFkZV9yZWdpb24gY2FycmllcyBhbiBBUlJBWSBvZiB0YXJnZXQgcG9seWdvbnMgKHNoaXBzIGFzIG9uZSksIGVhY2ggc2NvcmVkXG4vLyBhcyBvbmUgb2JqZWN0IFx1MjAxNCBzbyBcInNoYWRlIGJvdGggcmVnaW9uc1wiIGlzIGFkZGl0aXZlLCBtYXRjaGluZyBwbG90X2Z1bmN0aW9uLlxuZXhwb3J0IGNvbnN0IFJlZ2lvbkludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3NoYWRlX3JlZ2lvbicpLFxuICByZWdpb25zOiB6LmFycmF5KFJlZ2lvbkFuc3dlcikubWluKDEpLFxufSk7XG5leHBvcnQgdHlwZSBSZWdpb25JbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIFJlZ2lvbkludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBncmFwaF9pbmVxdWFsaXR5OiBncmFwaCBhbiBpbmVxdWFsaXR5IChEcm9wIDQpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHN0dWRlbnQgcGxhY2VzIHRoZSBib3VuZGFyeSAoc2FtZSBoYW5kbGVzIGFzIHBsb3RfZnVuY3Rpb24pLCB0b2dnbGVzIHRoZVxuLy8gbGluZSBkb3R0ZWQgKHN0cmljdCkgb3Igc29saWQgKGluY2x1c2l2ZSksIGFuZCBjbGlja3MgYSBzaWRlIHRvIHNoYWRlLiBBbGxcbi8vIHRocmVlIGFyZSBncmFkZWQgXHUyMDE0IGNob29zaW5nIHRoZW0gSVMgdGhlIHNraWxsLiBUaGUgYm91bmRhcnkgaXMgYSBGdW5jdGlvbk1vZGVsLFxuLy8gc28gcXVhZHJhdGljIGluZXF1YWxpdGllcyAoeSA+IHhcdTAwQjIpIHdvcmsgdGhlIGRheSB0aGUgZmFtaWx5IGRvZXM7IGEgdmVydGljYWxcbi8vIGJvdW5kYXJ5ICh4ID4gMykgc2hhZGVzIGxlZnQvcmlnaHQgaW5zdGVhZCBvZiBhYm92ZS9iZWxvdy5cbmV4cG9ydCBjb25zdCBTaGFkZVNpZGVWYWx1ZSA9IHouZW51bShbJ2Fib3ZlJywgJ2JlbG93JywgJ2xlZnQnLCAncmlnaHQnXSk7XG5leHBvcnQgdHlwZSBTaGFkZVNpZGVWYWx1ZSA9IHouaW5mZXI8dHlwZW9mIFNoYWRlU2lkZVZhbHVlPjtcblxuZXhwb3J0IGNvbnN0IEluZXF1YWxpdHlBbnN3ZXIgPSB6Lm9iamVjdCh7XG4gIGJvdW5kYXJ5OiBGdW5jdGlvbk1vZGVsLFxuICAvLyB0cnVlID0gc3RyaWN0ICg8IC8gPiwgZG90dGVkIGJvdW5kYXJ5KTsgZmFsc2UgPSBpbmNsdXNpdmUgKFx1MjI2NCAvIFx1MjI2NSwgc29saWQpLlxuICBzdHJpY3Q6IHouYm9vbGVhbigpLFxuICBzaGFkZVNpZGU6IFNoYWRlU2lkZVZhbHVlLFxufSk7XG5leHBvcnQgdHlwZSBJbmVxdWFsaXR5QW5zd2VyID0gei5pbmZlcjx0eXBlb2YgSW5lcXVhbGl0eUFuc3dlcj47XG5cbi8vIEFuIEFSUkFZIG9mIGluZXF1YWxpdGllcyAoc2hpcHMgYXMgb25lKTsgc3lzdGVtcyAoXCJzaGFkZSB3aGVyZSBCT1RIIGhvbGRcIilcbi8vIGJlY29tZSBhZGRpdGl2ZSBtZW1iZXJzLCBtYXRjaGluZyBwbG90X2Z1bmN0aW9uL3NoYWRlX3JlZ2lvbi5cbmV4cG9ydCBjb25zdCBJbmVxdWFsaXR5SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnZ3JhcGhfaW5lcXVhbGl0eScpLFxuICBpbmVxdWFsaXRpZXM6IHouYXJyYXkoSW5lcXVhbGl0eUFuc3dlcikubWluKDEpLFxufSk7XG5leHBvcnQgdHlwZSBJbmVxdWFsaXR5SW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBJbmVxdWFsaXR5SW50ZXJhY3Rpb24+O1xuXG4vLyAtLS0tIGRpc3BsYXk6IGEgc3RhdGljICh1bmdyYWRlZCkgZ3JhcGggLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBibG9jayBkcmF3cyBhIGZpeGVkIHBpY3R1cmUgXHUyMDE0IHBvaW50cywgY3VydmVzLCBzZWdtZW50cywgZmlsbGVkIHBvbHlnb25zIFx1MjAxNFxuLy8gYW5kIGNvbGxlY3RzIE5PIGFuc3dlci4gVHdvIGpvYnMgZnJvbSBvbmUgc2hhcGU6IGEgc3RpbXVsdXMgYSBncmFkZWQgcXVlc3Rpb25cbi8vIHJlZmVycyB0byAoXCJ1c2luZyB0aGUgZ3JhcGggYmVsb3csIFx1MjAyNlwiKSwgYW5kIGEgc3RhbmRhbG9uZSBleGVtcGxhciB3aXRoIG5vXG4vLyBxdWVzdGlvbiBhdCBhbGwgKGFuIGVtcHR5IHByb21wdCkuIEJlY2F1c2UgYGRpc3BsYXlgIGlzIGp1c3QgYW5vdGhlciBtZW1iZXIgb2Zcbi8vIHRoZSBgdHlwZWAgdW5pb24sIGEgc3RpbXVsdXMtd2l0aC1hbi1hbnN3ZXIgbGF0ZXIgaXMgYWRkaXRpdmUgXHUyMDE0IGEgbmV3IGFuc3dlclxuLy8gZmllbGQgYmVzaWRlIHRoZSBkcmF3YWJsZXMgXHUyMDE0IG5vdCBhIG5ldyBibG9jayBmYW1pbHkuXG4vL1xuLy8gYERyYXdhYmxlYCAodGhlIHBvaW50IC8gY3VydmUgLyBleHByZXNzaW9uIC8gc2VnbWVudCAvIHJheSAvIHBvbHlnb24gdW5pb24sXG4vLyBkaXNjcmltaW5hdGVkIG9uIGBraW5kYCkgYW5kIGl0cyBgRHJhd2FibGVDb2xvcmAgcGFsZXR0ZSBrZXlzIG5vdyBsaXZlIGluXG4vLyAuLi9ncmFwaC1wcmltaXRpdmVzLnRzIGFuZCBhcmUgcmUtZXhwb3J0ZWQgYWJvdmUuXG5cbmV4cG9ydCBjb25zdCBEaXNwbGF5SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnZGlzcGxheScpLFxuICBkcmF3YWJsZXM6IHouYXJyYXkoRHJhd2FibGUpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBEaXNwbGF5SW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBEaXNwbGF5SW50ZXJhY3Rpb24+O1xuXG4vLyAtLS0tIHBsb3RfcmF5IC8gcGxvdF9zZWdtZW50OiBkcmF3IGEgcmF5IG9yIHNlZ21lbnQgZGlyZWN0bHkgLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGaXJzdC1jbGFzcyByZXBsYWNlbWVudHMgZm9yIHRoZSBkb21haW4tZ2xpZGVyIGFwcHJvYWNoICh3aGljaCBhc2tlZCBzdHVkZW50c1xuLy8gdG8gZGVmaW5lIGFuIGluZmluaXRlIGxpbmUsIHRoZW4gbWFyayBlbmRwb2ludHMgb24gaXQgd2l0aCBzZXBhcmF0ZSBjb250cm9scyBcdTIwMTRcbi8vIHRoZSBkcmF3biBsaW5lIG5ldmVyIGV2ZW4gY2xpcHBlZCkuIEhlcmUgdGhlIHN0dWRlbnQgZHJhZ3MgVFdPIGhhbmRsZXMgXHUyMDE0IHRoZVxuLy8gZW5kcG9pbnQocykgXHUyMDE0IGFuZCB0aGUgd2lkZ2V0IGRyYXdzIGFuIEFDVFVBTCByYXkvc2VnbWVudCB0aHJvdWdoIHRoZW1cbi8vIChKU1hHcmFwaCBzdHJhaWdodEZpcnN0L3N0cmFpZ2h0TGFzdCksIHdpdGggb3Blbi9jbG9zZWQgZW5kcG9pbnQgcGlsbHMuXG4vLyBBcnJheXMtb2Ytb25lIGxpa2UgbW9kZWxzL3JlZ2lvbnMvaW5lcXVhbGl0aWVzLCBzbyBzeXN0ZW1zIHN0YXkgYWRkaXRpdmUuXG4vLyAocGxvdF9mdW5jdGlvbidzIGRvbWFpbnNbXSByZW1haW5zIHNjb3JlZCBmb3IgYWxyZWFkeS1wdWJsaXNoZWQgcGFnZXMsIGJ1dFxuLy8gYXV0aG9yaW5nIHN0ZWVycyBoZXJlIG5vdy4pXG5leHBvcnQgY29uc3QgUmF5QW5zd2VyID0gei5vYmplY3Qoe1xuICAvLyBUaGUgcmF5J3MgZW5kcG9pbnQgKHNjb3JlZCBvbiBwb3NpdGlvbiArIG9wZW4vY2xvc2VkIHN0eWxlKS5cbiAgZnJvbTogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICAvLyBBbnkgc2Vjb25kIHBvaW50IE9OIHRoZSByYXkgXHUyMDE0IG5hbWVzIHRoZSBkaXJlY3Rpb247IHRoZSBzdHVkZW50J3MgdGhyb3VnaFxuICAvLyBoYW5kbGUgbWF5IHNpdCBhbnl3aGVyZSBhbG9uZyB0aGUgY29ycmVjdCByYXkuXG4gIHRocm91Z2g6IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgZnJvbVN0eWxlOiBFbmRwb2ludFN0eWxlLmRlZmF1bHQoJ2Nsb3NlZCcpLFxuICAvLyBFbmRwb2ludCBwb3NpdGlvbiB0b2xlcmFuY2UgaW4gZ3JhcGggdW5pdHMgKG1hdGNoZXMgdGhlIGRvbWFpbi1nbGlkZXJcbiAgLy8gZGVmYXVsdCkuIERpcmVjdGlvbiBpcyBzY29yZWQgYnkgdW5pdC12ZWN0b3IgYWxpZ25tZW50IGtpdC1zaWRlLlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMjUpLFxufSk7XG5leHBvcnQgdHlwZSBSYXlBbnN3ZXIgPSB6LmluZmVyPHR5cGVvZiBSYXlBbnN3ZXI+O1xuXG5leHBvcnQgY29uc3QgUmF5SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9yYXknKSxcbiAgcmF5czogei5hcnJheShSYXlBbnN3ZXIpLm1pbigxKSxcbn0pO1xuZXhwb3J0IHR5cGUgUmF5SW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBSYXlJbnRlcmFjdGlvbj47XG5cbmV4cG9ydCBjb25zdCBTZWdtZW50QW5zd2VyID0gei5vYmplY3Qoe1xuICBmcm9tOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIHRvOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIC8vIFtmcm9tLWVuZHBvaW50IHN0eWxlLCB0by1lbmRwb2ludCBzdHlsZV0uIFNjb3JlZCBvcmRlci1pbmRlcGVuZGVudGx5IFx1MjAxNFxuICAvLyB0aGUgc3R1ZGVudCBtYXkgZHJhdyB0aGUgc2VnbWVudCBpbiBlaXRoZXIgZGlyZWN0aW9uLlxuICBlbmRwb2ludHM6IHoudHVwbGUoW0VuZHBvaW50U3R5bGUsIEVuZHBvaW50U3R5bGVdKS5kZWZhdWx0KFsnY2xvc2VkJywgJ2Nsb3NlZCddKSxcbiAgdG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjI1KSxcbn0pO1xuZXhwb3J0IHR5cGUgU2VnbWVudEFuc3dlciA9IHouaW5mZXI8dHlwZW9mIFNlZ21lbnRBbnN3ZXI+O1xuXG5leHBvcnQgY29uc3QgU2VnbWVudEludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3Rfc2VnbWVudCcpLFxuICBzZWdtZW50czogei5hcnJheShTZWdtZW50QW5zd2VyKS5taW4oMSksXG59KTtcbmV4cG9ydCB0eXBlIFNlZ21lbnRJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIFNlZ21lbnRJbnRlcmFjdGlvbj47XG5cbi8vIFRoZSBpbnRlcmFjdGlvbiB1bmlvbi4gcGxvdF9wb2ludCArIHBsb3RfZnVuY3Rpb24gKyBzaGFkZV9yZWdpb24gYXJlIGdyYWRlZDtcbi8vIGRpc3BsYXkgaXMgdGhlIHVuZ3JhZGVkIHN0YXRpYyBncmFwaC4gTW9yZSBhcmUgZnV0dXJlIG1lbWJlcnMuIEtlcHRcbi8vIGRpc2NyaW1pbmF0ZWQgb24gYHR5cGVgIHNvIHRoZSB3aXJlIGZvcm1hdCBhbHdheXMgY2FycmllcyBpdCBhbmQgY29uc3VtZXJzXG4vLyBicmFuY2ggdW5pZm9ybWx5LlxuZXhwb3J0IGNvbnN0IEdyYXBoSW50ZXJhY3Rpb24gPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgUG9pbnRJbnRlcmFjdGlvbixcbiAgRnVuY3Rpb25JbnRlcmFjdGlvbixcbiAgUmVnaW9uSW50ZXJhY3Rpb24sXG4gIEluZXF1YWxpdHlJbnRlcmFjdGlvbixcbiAgUmF5SW50ZXJhY3Rpb24sXG4gIFNlZ21lbnRJbnRlcmFjdGlvbixcbiAgRGlzcGxheUludGVyYWN0aW9uLFxuXSk7XG5leHBvcnQgdHlwZSBHcmFwaEludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgR3JhcGhJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gVGhlIGJsb2NrIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBdXRvLW51bWJlcmVkIGxpa2UgUHJvYmxlbUJsb2NrIC8gRmlsbEluQmxhbmtCbG9jay4gaGFzQ29uZmlkZW5jZVJhdGluZyArXG4vLyBza2lsbHMgZm9sbG93IHRoZSBzYW1lIG9wdC1pbiBwYXR0ZXJucyBGaWxsSW5CbGFua0Jsb2NrIGVzdGFibGlzaGVkOyBzb2x1dGlvblxuLy8gaXMgc2hvd24gcG9zdC1jaGVjayByZWdhcmRsZXNzIG9mIGNvcnJlY3RuZXNzLlxuZXhwb3J0IGNvbnN0IEludGVyYWN0aXZlR3JhcGhCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2ludGVyYWN0aXZlX2dyYXBoJyksXG4gIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC4uLmxhYmVsRmllbGRzLFxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGF4aXNDb25maWc6IEF4aXNDb25maWcsXG4gIGludGVyYWN0aW9uOiBHcmFwaEludGVyYWN0aW9uLFxuICAvLyBXaGVuIHRydWUsIGEgbXVsdGktcGFydCBncmFwaCAoc2V2ZXJhbCBwb2ludHMsIGEgc3lzdGVtIG9mIGN1cnZlcy9yZWdpb25zLFxuICAvLyBvciBcdTIwMTQgZnJvbSBEcm9wIDQgXHUyMDE0IGFuIGluZXF1YWxpdHkncyBsaW5lICsgc2lkZSArIHN0eWxlKSBzY29yZXMgZnJhY3Rpb25hbGx5XG4gIC8vIHBlciBvYmplY3QgYW5kIHRoZSBkYXNoYm9hcmQgaXRlbWl6ZXMgaXQ7IHdoZW4gZmFsc2UgKGRlZmF1bHQpIGl0IGlzIGFsbC1vci1cbiAgLy8gbm90aGluZy4gVGhlIGZsYWcgKyB0aGUga2l0J3MgcGVyLW9iamVjdCBzY29yaW5nIGVuZ2luZSBsYW5kIGhlcmUgKERyb3AgMik7XG4gIC8vIHRoZSBydW50aW1lICsgc3VibWlzc2lvbiBjb25zdW1lIHRoZSBmcmFjdGlvbiBhdCB0aGUgRHJvcCA0IHdpcmUgYnVtcC5cbiAgcGFydGlhbENyZWRpdDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIFdoZW4gdHJ1ZSwgdGhlIHN0dWRlbnQgZ2V0cyBhIFwiY2Fubm90IGJlIGdyYXBoZWQgLyBubyBzb2x1dGlvblwiIGNob2ljZSwgYW5kXG4gIC8vIHRoZSBhbnN3ZXIga2V5IG1heSBtYXJrIFRIQVQgYXMgdGhlIGNvcnJlY3QgYW5zd2VyICh0cmljayBxdWVzdGlvbnMpLiBUaGVcbiAgLy8gZmxhZyBsYW5kcyBoZXJlIChEcm9wIDIpOyB0aGUgc3R1ZGVudCBjb250cm9sICsgbm8tc29sdXRpb24gcmVzcG9uc2UgcmlkZSB0aGVcbiAgLy8gRHJvcCA0IHdpcmUgYnVtcC5cbiAgYWxsb3dOb1NvbHV0aW9uOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgLy8gVHJpY2sgcXVlc3Rpb25zOiB3aGVuIHRydWUgKHJlcXVpcmVzIGFsbG93Tm9Tb2x1dGlvbiksIFwibm8gc29sdXRpb25cIiBJUyB0aGVcbiAgLy8gY29ycmVjdCBhbnN3ZXIgYW5kIHRoZSBkcmF3biBhbnN3ZXIga2V5IGlzIGEgZGVjb3kuIEEgc3R1ZGVudCB3aG8gc2VsZWN0c1xuICAvLyBuby1zb2x1dGlvbiBpcyBjb3JyZWN0OyBvbmUgd2hvIGRyYXdzIGFueXRoaW5nIGlzIG5vdC5cbiAgbm9Tb2x1dGlvbkNvcnJlY3Q6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAvLyBCdWlsdC1pbiBtaXN0YWtlIGNsYXNzaWZpZXJzIChzd2FwcGVkIGNvb3JkaW5hdGVzLCBzd2FwcGVkIHNsb3BlL2ludGVyY2VwdCxcbiAgLy8gcmlnaHQtYm91bmRhcnktd3Jvbmctc2lkZSwgXHUyMDI2KSBzaG93IGEgdGFyZ2V0ZWQgbnVkZ2UgaW5zdGVhZCBvZiB0aGUgZ2VuZXJpY1xuICAvLyBcIk5vdCBxdWl0ZVwiIGFmdGVyIGEgY2hlY2suIERlZmF1bHQgT047IGEgdGVhY2hlciBjYW4gc3dpdGNoIHRoZW0gb2ZmLiBUaGVcbiAgLy8gY2xhc3NpZmllciBjYXRhbG9ndWUgKyBtZXNzYWdlcyBsaXZlIGtpdC1zaWRlIChncmFwaC1zY29yZS50cykgXHUyMDE0IHRoaXMgZmxhZ1xuICAvLyBvbmx5IGdhdGVzIHRoZW0uXG4gIGJ1aWx0aW5GZWVkYmFjazogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgLy8gQXV0aG9yZWQgYW50aWNpcGF0ZWQgbWlzdGFrZXMgXHUyMDE0IHRoZSBncmFwaCB0d2luIG9mIEJsYW5rVG9rZW4ubWlzdGFrZUZlZWRiYWNrLlxuICAvLyBgbWF0Y2hgIGlzIGEgZnJlZWZvcm0gZ3JhcGggYW5zd2VyIGluIHRoZSBTQU1FIHN5bnRheCB0aGUgYXV0aG9yaW5nIGZvcm11bGFcbiAgLy8gZmllbGQgYWNjZXB0cyAoXCIoNCwgMylcIiwgXCJ5ID0geCArIDJcIiwgXCJ5IDwgMnggKyAxXCIpOyB0aGUga2l0IHBhcnNlcyBpdCB3aXRoXG4gIC8vIHRoZSBzYW1lIHBhcnNlciBhbmQgY29tcGFyZXMgYWdhaW5zdCB0aGUgc3R1ZGVudCdzIGFuc3dlciB3aXRoIHRoZSBzYW1lXG4gIC8vIHRvbGVyYW5jZXMgYXMgc2NvcmluZy4gRmlyc3QgbWF0Y2ggd2lucywgYW5kIGFuIGF1dGhvcmVkIG1hdGNoIGJlYXRzIGFcbiAgLy8gYnVpbHQtaW4gY2xhc3NpZmllci4gYGZlZWRiYWNrYCBpcyByaWNoIGlubGluZSBjb250ZW50LCBzaG93biAocG9zdC1jaGVja1xuICAvLyBvbmx5KSBpbiB0aGUgYmxvY2sncyBmZWVkYmFjayBsaW5lLlxuICBtaXN0YWtlRmVlZGJhY2s6IHouYXJyYXkoei5vYmplY3Qoe1xuICAgIG1hdGNoOiB6LnN0cmluZygpLFxuICAgIGZlZWRiYWNrOiB6LmFycmF5KElubGluZU5vZGUpLFxuICB9KSkuZGVmYXVsdChbXSksXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIGhhc0NvbmZpZGVuY2VSYXRpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIC8vIFZhcmlhYmxlIGJsb2NrIHNpemluZzogb3B0aW9uYWwgd2lkdGggZnJhY3Rpb24gKyBhbGlnbm1lbnQgKHNpemluZy50cykuXG4gIC8vIEF1dGhvci1zZXQgZGlzcGxheSBmb290cHJpbnQgZm9yIHRoZSBmaWd1cmU7IHJlbmRlcmVyIGhvbm9ycyBpdCB2aWEgdGhlXG4gIC8vIHNoYXJlZCAuYmxvY2stc2l6ZWQgcGF0aC4gQWRkaXRpdmUvb3B0aW9uYWwgXHUyMDE0IG5vIHNjaGVtYVZlcnNpb24gYnVtcC5cbiAgLi4uc2l6aW5nRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBJbnRlcmFjdGl2ZUdyYXBoQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBJbnRlcmFjdGl2ZUdyYXBoQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcbmltcG9ydCB7IEF4aXNDb25maWcsIERyYXdhYmxlIH0gZnJvbSAnLi9pbnRlcmFjdGl2ZS1ncmFwaC5qcyc7XG5cbi8vIE11bHRpcGxlLWNob2ljZSBxdWVzdGlvbiBibG9jay4gT25lIHByb21wdCwgMisgY2hvaWNlcywgcmFkaW8gKHNpbmdsZSkgb3Jcbi8vIGNoZWNrYm94IChcInNlbGVjdCBhbGwgdGhhdCBhcHBseVwiKSB2aWEgbXVsdGlTZWxlY3QuIFNjb3JlZCBhbGwtb3Itbm90aGluZzpcbi8vIHRoZSBzZWxlY3RlZCBzZXQgbXVzdCBlcXVhbCB0aGUgY29ycmVjdCBzZXQgKHBlci1jaG9pY2UgcGFydGlhbCBjcmVkaXQgaXMgYVxuLy8gZnV0dXJlIGFkZGl0aXZlIGZsYWcsIG1pcnJvcmluZyB0aGUgZ3JhcGggYmxvY2sncyBwYXJ0aWFsQ3JlZGl0IHByZWNlZGVudCkuXG4vL1xuLy8gQ2hvaWNlIGNvbnRlbnQgaXMgcmljaCBpbmxpbmUgKGZvcm1hdHRlZCB0ZXh0ICsgaW5saW5lIG1hdGgpIFx1MjAxNCB0aGUgc2FtZVxuLy8gYWxwaGFiZXQgYXMgcHJvYmxlbSBwcm9zZSwgc28gbWF0aCBhbnN3ZXIgY2hvaWNlcyByZW5kZXIgcHJvcGVybHkuIFJpY2hlclxuLy8gY2hvaWNlcyBhcmUgQURESVRJVkUgRklFTERTIG9uIE11bHRpcGxlQ2hvaWNlT3B0aW9uLCBub3QgYSB1bmlvbiByZXdvcmsgXHUyMDE0XG4vLyBkZWNpZGVkIGF0IGRlc2lnbiB0aW1lLCBleGVyY2lzZWQgMjAyNi0wNy0xMCB3aGVuIHRoZSBvcHRpb25hbCBgaW1hZ2VgIGFuZFxuLy8gYGdyYXBoYCBmaWd1cmVzIGxhbmRlZCB3aXRob3V0IGEgc2NoZW1hVmVyc2lvbiBidW1wLlxuLy9cbi8vIFBlci1jaG9pY2UgYGZlZWRiYWNrYCBpcyB0aGUgTUMgYW5hbG9ndWUgb2YgYSBibGFuaydzIG1pc3Rha2VGZWVkYmFjazpcbi8vIGRpc3RyYWN0b3JzIGFyZSB1c3VhbGx5IGF1dGhvcmVkIEJFQ0FVU0UgdGhleSdyZSBhbnRpY2lwYXRlZCBtaXN0YWtlcywgc29cbi8vIGVhY2ggY2hvaWNlIGNhbiBjYXJyeSBhbiBleHBsYW5hdGlvbiBzaG93biBwb3N0LWNoZWNrIHdoZW4gaXQgd2FzIHNlbGVjdGVkLlxuLy9cbi8vIEJsb2NrLWxldmVsIGZpZWxkcyBtaXJyb3IgRmlsbEluQmxhbmtCbG9jayBmb3IgcGFyaXR5IChzb2x1dGlvbixcbi8vIGhhc0NvbmZpZGVuY2VSYXRpbmcsIHNraWxscywgd29ya1NwYWNlKSBcdTIwMTQgb25lIHByb2JsZW0gY2hyb21lLCBvbmUgcnVudGltZVxuLy8gdHJlYXRtZW50LCBvbmUgZGFzaGJvYXJkIHJvdyBzaGFwZS5cbi8vXG4vLyBEZWxpYmVyYXRlbHkgTk9UIHNjaGVtYS1lbmZvcmNlZDogXCJhdCBsZWFzdCBvbmUgY2hvaWNlIGlzIG1hcmtlZCBjb3JyZWN0LlwiXG4vLyBBIG1pZC1lZGl0IGRyYWZ0ICh0ZWFjaGVyIGhhc24ndCBwaWNrZWQgdGhlIHJpZ2h0IGFuc3dlciB5ZXQpIG11c3Qgc3RpbGxcbi8vIGF1dG9zYXZlOyB0aGUgZWRpdG9yIHN1cmZhY2VzIHRoZSB3YXJuaW5nIGluc3RlYWQuIEEgemVyby1jb3JyZWN0IGJsb2NrIGlzXG4vLyB3ZWxsLWRlZmluZWQgYXQgcnVudGltZSAobXVsdGktc2VsZWN0OiBzZWxlY3Rpbmcgbm90aGluZyBpcy4uLiBzdGlsbCBhblxuLy8gb21pc3Npb247IG5vdGhpbmcgc2NvcmVzIGNvcnJlY3QpIFx1MjAxNCB3cm9uZyBhdXRob3JpbmcsIG5vdCBhIGNyYXNoLlxuXG4vLyBPcHRpb25hbCBpbGx1c3RyYXRpdmUgaW1hZ2Ugb24gYSBjaG9pY2UgKFwid2hpY2ggZGlhZ3JhbSBzaG93c1x1MjAyNlwiKS4gTWlycm9yc1xuLy8gRGVmaW5pdGlvbkltYWdlIC8gUGhhc2UtMSBJbWFnZUJsb2NrOiBVUkwtb25seSwgbm8gdXBsb2FkIHBpcGVsaW5lOyBhbHRcbi8vIHJlcXVpcmVkIGJ1dCBkZWZhdWx0aW5nIHRvICcnIGZvciBkZWNvcmF0aXZlIGZpZ3VyZXMgKGVkaXRvciB3YXJucykuXG5leHBvcnQgY29uc3QgQ2hvaWNlSW1hZ2UgPSB6Lm9iamVjdCh7XG4gIHNyYzogei5zdHJpbmcoKS51cmwoKSxcbiAgYWx0OiB6LnN0cmluZygpLmRlZmF1bHQoJycpLFxufSk7XG5leHBvcnQgdHlwZSBDaG9pY2VJbWFnZSA9IHouaW5mZXI8dHlwZW9mIENob2ljZUltYWdlPjtcblxuLy8gT3B0aW9uYWwgc3RhdGljIGdyYXBoIG9uIGEgY2hvaWNlIChcIndoaWNoIGdyYXBoIHNob3dzXHUyMDI2XCIpLiBSZXVzZXMgdGhlXG4vLyBpbnRlcmFjdGl2ZS1ncmFwaCB2b2NhYnVsYXJ5IChBeGlzQ29uZmlnICsgZGlzcGxheSBEcmF3YWJsZXMpIGJ1dCBpc1xuLy8gZHJhd24gYXMgaW5saW5lIFNWRyBieSBncmFwaC1raXQncyBraXQtZnJlZSBgc3RhdGljLXN2Z2AgZW5naW5lIFx1MjAxNCBuZXZlciB0aGVcbi8vIGludGVyYWN0aXZlIGtpdC4gVGhlIHZpZXdlciByZW5kZXJzIGl0IGluIGBibG9ja3MvQ2hvaWNlRmlndXJlLnRzeGAsIHdoaWNoXG4vLyBpbXBvcnRzIHRoYXQgZW5naW5lIExBWklMWSAobXVsdGlwbGVfY2hvaWNlIGlzIGFuIGVhZ2VyIGJpbmRpbmcsIHNvIGEgc3RhdGljXG4vLyBpbXBvcnQgd291bGQgcHV0IHRoZSBlbmdpbmUgaW4gdGhlIHN0dWRlbnQgc2hlbGwpLiBDb25zZXF1ZW5jZTogYGV4cHJlc3Npb25gXG4vLyBkcmF3YWJsZXMgbmVlZCB0aGUga2l0J3MgcGFyc2VyIGFuZCBhcmUgTk9UIGRyYXduOyB0aGUgZWRpdG9yIGRvZXNuJ3Qgb2ZmZXJcbi8vIHRoZW0gaGVyZS4gKihVbnRpbCAyMDI2LTA4LTIyIHRoaXMgc2FpZCBcInRoZSByZW5kZXJlcidzIGdyYXBoLXN2ZyBlbmdpbmVcIiBcdTIwMTRcbi8vIGEgcGFja2FnZSBkZWxldGVkIGF0IFM5IERyb3AgNCwgd2hpY2ggaXMgd2h5IG5vdGhpbmcgcmVuZGVyZWQgdGhlc2UgZm9yXG4vLyBlaWdodCBkYXlzIHdoaWxlIHRoZSBmaWVsZCwgdGhlIGVkaXRvciBjb250cm9sIGFuZCB0aGUgaW1wb3J0ZXIgYWxsIGxpdmVkXG4vLyBvbi4gU2VlIGRvY3MvZGVzaWduL2Nob2ljZS1maWd1cmVzLWFuZC1uZXN0ZWQtbGlzdHMubWQuKSpcbmV4cG9ydCBjb25zdCBDaG9pY2VHcmFwaCA9IHoub2JqZWN0KHtcbiAgYXhpczogQXhpc0NvbmZpZyxcbiAgZHJhd2FibGVzOiB6LmFycmF5KERyYXdhYmxlKS5kZWZhdWx0KFtdKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ2hvaWNlR3JhcGggPSB6LmluZmVyPHR5cGVvZiBDaG9pY2VHcmFwaD47XG5cbmV4cG9ydCBjb25zdCBNdWx0aXBsZUNob2ljZU9wdGlvbiA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAvLyBSaWNoIGlubGluZSBjb250ZW50IChmb3JtYXR0ZWQgdGV4dCArIGlubGluZSBtYXRoKS4gTm9uLWVtcHR5IGlzIGFuXG4gIC8vIGVkaXRvciBjb25jZXJuLCBub3QgYSBzY2hlbWEgb25lIChtaWQtZWRpdCBkcmFmdHMgbXVzdCBzYXZlKS5cbiAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgY29ycmVjdDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIE9wdGlvbmFsIHBlci1jaG9pY2UgZXhwbGFuYXRpb24sIHJldmVhbGVkIHBvc3QtY2hlY2sgd2hlbiB0aGlzIGNob2ljZSB3YXNcbiAgLy8gc2VsZWN0ZWQuIFJpY2ggaW5saW5lIGNvbnRlbnQsIGxpa2UgYmxhbmsgbWlzdGFrZUZlZWRiYWNrIGVudHJpZXMuXG4gIGZlZWRiYWNrOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIC8vIE9wdGlvbmFsIGZpZ3VyZSBiZWxvdyB0aGUgY2hvaWNlIHRleHQgXHUyMDE0IHRoZSBhZGRpdGl2ZSB3aWRlbmluZyB0aGUgaGVhZGVyXG4gIC8vIGNvbW1lbnQgcmVzZXJ2ZWQuIEJvdGggbWF5IHRlY2huaWNhbGx5IGNvZXhpc3QgKGltYWdlIHJlbmRlcnMgZmlyc3QpO1xuICAvLyB0aGUgZWRpdG9yIFVJIHRyZWF0cyB0aGVtIGFzIGEgc2luZ2xlIGZpZ3VyZSBzbG90LlxuICBpbWFnZTogQ2hvaWNlSW1hZ2Uub3B0aW9uYWwoKSxcbiAgZ3JhcGg6IENob2ljZUdyYXBoLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE11bHRpcGxlQ2hvaWNlT3B0aW9uID0gei5pbmZlcjx0eXBlb2YgTXVsdGlwbGVDaG9pY2VPcHRpb24+O1xuXG5leHBvcnQgY29uc3QgTXVsdGlwbGVDaG9pY2VCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ211bHRpcGxlX2Nob2ljZScpLFxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAuLi5sYWJlbEZpZWxkcyxcbiAgLy8gVGhlIHF1ZXN0aW9uIHByb3NlIChyaWNoIGlubGluZSBjb250ZW50LCBsaWtlIGEgcHJvYmxlbSBzdGF0ZW1lbnQpLlxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGNob2ljZXM6IHouYXJyYXkoTXVsdGlwbGVDaG9pY2VPcHRpb24pLm1pbigyKSxcbiAgLy8gZmFsc2UgPSBzaW5nbGUgYW5zd2VyIChyYWRpb3MsIGV4YWN0bHkgb25lIHNlbGVjdGFibGUpOyB0cnVlID0gXCJzZWxlY3RcbiAgLy8gYWxsIHRoYXQgYXBwbHlcIiAoY2hlY2tib3hlcykuIFNjb3JpbmcgaXMgc2V0IGVxdWFsaXR5IGVpdGhlciB3YXkuXG4gIG11bHRpU2VsZWN0OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgLy8gS2VlcCB0aGUgYXV0aG9yZWQgY2hvaWNlIG9yZGVyIG9uIHBhcGVyIChTNS41IEQxN0EpLiBQcmludGVkIFZFUlNJT05TXG4gIC8vIHNodWZmbGUgY2hvaWNlcyB0byBkaXNjb3VyYWdlIGNvcHlpbmcsIHdoaWNoIGlzIHdyb25nIGZvciBhIHF1ZXN0aW9uIHdob3NlXG4gIC8vIG9yZGVyIGNhcnJpZXMgbWVhbmluZyBcdTIwMTQgXCJhbGwgb2YgdGhlIGFib3ZlXCIgaGFzIHRvIHN0YXkgbGFzdCwgYW5kIFwiYm90aCBBXG4gIC8vIGFuZCBCXCIgbmFtZXMgcG9zaXRpb25zIG91dHJpZ2h0LiBPcHRpb25hbCB3aXRoIG5vIGRlZmF1bHQgc28gYSBkb2N1bWVudFxuICAvLyB3cml0dGVuIGJlZm9yZSB0aGlzIHJlLXNlcmlhbGl6ZXMgYnl0ZS1pZGVudGljYWxseTsgYWJzZW50IG1lYW5zIHNodWZmbGUsXG4gIC8vIHdoaWNoIGlzIHRoZSByaWdodCBkZWZhdWx0IGZvciB0aGUgb3ZlcndoZWxtaW5nIG1ham9yaXR5IG9mIHF1ZXN0aW9ucy5cbiAgbG9ja0Nob2ljZU9yZGVyOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICAvLyBXb3JrZWQgZXhwbGFuYXRpb24gZm9yIHRoZSB3aG9sZSBwcm9ibGVtLCByZXZlYWxlZCBwb3N0LWNoZWNrIHJlZ2FyZGxlc3NcbiAgLy8gb2YgY29ycmVjdG5lc3MgKHNhbWUgY29udHJhY3QgYXMgRmlsbEluQmxhbmtCbG9jay5zb2x1dGlvbikuXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIGhhc0NvbmZpZGVuY2VSYXRpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIC8vIFBlci1wcm9ibGVtIHByaW50IHdvcmstc3BhY2Ugb3ZlcnJpZGUgKHJlbSk7IGFic2VudCA9IGluaGVyaXQgdGhlXG4gIC8vIGFjdGl2aXR5LWxldmVsIGRlZmF1bHQgKHNlZSBGaWxsSW5CbGFua0Jsb2NrLndvcmtTcGFjZSBmb3IgdGhlIENTU1xuICAvLyBjdXN0b20tcHJvcGVydHkgcmVhc29uaW5nKS5cbiAgd29ya1NwYWNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNdWx0aXBsZUNob2ljZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgTXVsdGlwbGVDaG9pY2VCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuaW1wb3J0IHsgQ2hvaWNlSW1hZ2UsIENob2ljZUdyYXBoIH0gZnJvbSAnLi9tdWx0aXBsZS1jaG9pY2UuanMnO1xuXG4vLyBNYXRjaGluZyBxdWVzdGlvbiBibG9jay4gVHdvIGNvbHVtbnM6IGxlZnQgXCJpdGVtc1wiIChzdGVtcywgZG9jdW1lbnQgb3JkZXIpXG4vLyBhbmQgcmlnaHQgXCJ0YXJnZXRzXCIgKGxldHRlcmVkIEEsIEIsIENcdTIwMjYsIHNodWZmbGVkIGF0IHB1Ymxpc2ggdGltZSkuIFRoZVxuLy8gc3R1ZGVudCBkcmFncyBhIHRhcmdldCBjYXJkIG9udG8gYW4gaXRlbTsgdGhlIGNhcmQgZG9ja3MgbmV4dCB0byB0aGUgc3RlbS5cbi8vIERlc2lnbjogZG9jcy9kZXNpZ24vbWF0Y2hpbmctb3JkZXJpbmctcXVlc3Rpb25zLm1kIChkZWNpZGVkIDIwMjYtMDctMTApLlxuLy9cbi8vIERpc3RyYWN0b3JzOiB0YXJnZXRzIG1heSBleGNlZWQgaXRlbXMgXHUyMDE0IGFuIHVubWF0Y2hlZCB0YXJnZXQgaXMgc2ltcGx5XG4vLyByZWZlcmVuY2VkIGJ5IG5vIGtleSBlbnRyeS4gYWxsb3dUYXJnZXRSZXVzZSAob2ZmIGJ5IGRlZmF1bHQpIGxldHMgc2V2ZXJhbFxuLy8gaXRlbXMgc2hhcmUgb25lIHRhcmdldCAoXCJjYXRlZ29yaXphdGlvbi1saXRlXCI6IGNsYXNzaWZ5IGVhY2ggZXhwcmVzc2lvbiBhc1xuLy8gbGluZWFyL3F1YWRyYXRpYy9leHBvbmVudGlhbCk7IHRoZSBVSSB0aGVuIENPUElFUyB0aGUgY2FyZCBvbiBkb2NrIGluc3RlYWRcbi8vIG9mIG1vdmluZyBpdC5cbi8vXG4vLyBTY29yZWQgUEVSIFBBSVIgKGVhcm5lZC90b3RhbCBcdTIwMTQgdGhlIGZyYWN0aW9uYWwgQ2hlY2twb2ludFJlc3VsdCBwcmVjZWRlbnRcbi8vIGZyb20gd2lyZSB2NCk6IGVhY2ggaXRlbSBpcyBvbmUgcG9pbnQsIGNvcnJlY3Qgd2hlbiB0aGUgc3R1ZGVudCdzIHRhcmdldFxuLy8gZm9yIGl0IGVxdWFscyBrZXlbaXRlbUlkXS4gQmxvY2sgYGNvcnJlY3RgID0gZXZlcnkgcGFpciByaWdodC4gTm8gYmlwYXJ0aXRlXG4vLyBtYWNoaW5lcnkgXHUyMDE0IHRoZSBzdHVkZW50J3MgcGFpcmluZyBJUyB0aGUgYXNzaWdubWVudCAoY29udHJhc3QgYmxhbmsgZ3JvdXBzLFxuLy8gd2hlcmUgdHlwZWQgdmFsdWVzIG11c3QgYmUgbWF0Y2hlZCB0byBzbG90cykuXG4vL1xuLy8gRmlndXJlczogaXRlbXMgYW5kIHRhcmdldHMgYm90aCB0YWtlIHRoZSBvcHRpb25hbCBpbWFnZS9ncmFwaCBmaWd1cmUgc2xvdFxuLy8gc2hpcHBlZCBmb3IgTUMgY2hvaWNlcyAoQ2hvaWNlSW1hZ2UvQ2hvaWNlR3JhcGggXHUyMDE0IFVSTC1vbmx5IGltYWdlOyBzdGF0aWNcbi8vIGdyYXBoIHZpYSB0aGUgcmVuZGVyZXIncyBraXQtZnJlZSBTVkcgZW5naW5lLCBzbyBgZXhwcmVzc2lvbmAgZHJhd2FibGVzIGFyZVxuLy8gZXhjbHVkZWQgdGhlcmUgYW5kIHRoZSBlZGl0b3IgZG9lc24ndCBvZmZlciB0aGVtKS4gXCJNYXRjaCB0aGUgZ3JhcGggdG8gaXRzXG4vLyBlcXVhdGlvblwiIGlzIHRoZSBtYXJxdWVlIGNhc2UuXG4vL1xuLy8gRGVsaWJlcmF0ZWx5IE5PVCBzY2hlbWEtZW5mb3JjZWQ6IFwia2V5IGNvdmVycyBldmVyeSBpdGVtXCIgLyBcImtleSByZWZlcmVuY2VzXG4vLyByZWFsIHRhcmdldHMuXCIgQSBtaWQtZWRpdCBkcmFmdCAodGVhY2hlciBzdGlsbCBhc3NpZ25pbmcgYW5zd2VycykgbXVzdFxuLy8gYXV0b3NhdmU7IHRoZSBlZGl0b3Igc3VyZmFjZXMgdGhlIHdhcm5pbmcgaW5zdGVhZCAodGhlIE1DIHplcm8tY29ycmVjdFxuLy8gcHJlY2VkZW50KS4gVGhlIHJ1bnRpbWUgdHJlYXRzIGFuIGl0ZW0gbWlzc2luZyBmcm9tIHRoZSBrZXkgYXMgbmV2ZXJcbi8vIGNvcnJlY3QgXHUyMDE0IHdyb25nIGF1dGhvcmluZywgbm90IGEgY3Jhc2guXG5cbmV4cG9ydCBjb25zdCBNYXRjaGluZ0l0ZW0gPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgLy8gUmljaCBpbmxpbmUgY29udGVudCAoZm9ybWF0dGVkIHRleHQgKyBpbmxpbmUgbWF0aCkuIE5vbi1lbXB0eSBpcyBhblxuICAvLyBlZGl0b3IgY29uY2Vybiwgbm90IGEgc2NoZW1hIG9uZSAobWlkLWVkaXQgZHJhZnRzIG11c3Qgc2F2ZSkuXG4gIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIC8vIE9wdGlvbmFsIGZpZ3VyZSBiZWxvdyB0aGUgaXRlbSB0ZXh0IChzYW1lIHNpbmdsZS1maWd1cmUtc2xvdCB0cmVhdG1lbnRcbiAgLy8gYXMgTUMgY2hvaWNlczsgaW1hZ2UgcmVuZGVycyBmaXJzdCBpZiBib3RoIGFyZSBzb21laG93IHNldCkuXG4gIGltYWdlOiBDaG9pY2VJbWFnZS5vcHRpb25hbCgpLFxuICBncmFwaDogQ2hvaWNlR3JhcGgub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgTWF0Y2hpbmdJdGVtID0gei5pbmZlcjx0eXBlb2YgTWF0Y2hpbmdJdGVtPjtcblxuZXhwb3J0IGNvbnN0IE1hdGNoaW5nVGFyZ2V0ID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGltYWdlOiBDaG9pY2VJbWFnZS5vcHRpb25hbCgpLFxuICBncmFwaDogQ2hvaWNlR3JhcGgub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgTWF0Y2hpbmdUYXJnZXQgPSB6LmluZmVyPHR5cGVvZiBNYXRjaGluZ1RhcmdldD47XG5cbmV4cG9ydCBjb25zdCBNYXRjaGluZ0Jsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnbWF0Y2hpbmcnKSxcbiAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLi4ubGFiZWxGaWVsZHMsXG4gIC8vIFRoZSBxdWVzdGlvbiBwcm9zZSAocmljaCBpbmxpbmUgY29udGVudCwgbGlrZSBhIHByb2JsZW0gc3RhdGVtZW50KS5cbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICAvLyBMZWZ0IGNvbHVtbiwgZG9jdW1lbnQgb3JkZXIuXG4gIGl0ZW1zOiB6LmFycmF5KE1hdGNoaW5nSXRlbSkubWluKDIpLFxuICAvLyBSaWdodCBjb2x1bW47IG1heSBleGNlZWQgaXRlbXMgKGV4dHJhIHRhcmdldHMgYXJlIGRpc3RyYWN0b3JzKS4gTGV0dGVyc1xuICAvLyBhcmUgYXNzaWduZWQgYnkgcG9zaXRpb24gQUZURVIgdGhlIHB1Ymxpc2gtdGltZSBzaHVmZmxlLCBuZXZlciBhdXRob3JlZC5cbiAgdGFyZ2V0czogei5hcnJheShNYXRjaGluZ1RhcmdldCkubWluKDIpLFxuICAvLyBUaGUgY29ycmVjdCBwYWlyaW5nOiBpdGVtIGlkIFx1MjE5MiB0YXJnZXQgaWQuIFBhcnRpYWwgZHVyaW5nIGF1dGhvcmluZyAoc2VlXG4gIC8vIGhlYWRlcik7IG11bHRpcGxlIGl0ZW1zIG1heSBzaGFyZSBhIHRhcmdldCBvbmx5IHVuZGVyIGFsbG93VGFyZ2V0UmV1c2UuXG4gIGtleTogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIHouc3RyaW5nKCkudXVpZCgpKSxcbiAgLy8gZmFsc2UgPSBvbmUtdG8tb25lIChkb2NraW5nIG1vdmVzIHRoZSBjYXJkOyBhIHVzZWQgdGFyZ2V0IGNhbid0IGJlIHVzZWRcbiAgLy8gYWdhaW4pLiB0cnVlID0gbWFueS10by1vbmUgYWxsb3dlZCAoZG9ja2luZyBjb3BpZXMgdGhlIGNhcmQpLlxuICBhbGxvd1RhcmdldFJldXNlOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgLy8gTUMtcGFyaXR5IHByb2JsZW0gY2hyb21lIChvbmUgcHJvYmxlbSBzaGFwZSwgb25lIGRhc2hib2FyZCByb3cgc2hhcGUpLlxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICBoYXNDb25maWRlbmNlUmF0aW5nOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICB3b3JrU3BhY2U6IHoubnVtYmVyKCkubWluKDApLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE1hdGNoaW5nQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBNYXRjaGluZ0Jsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5cbi8vIE9yZGVyaW5nIC8gc2VxdWVuY2luZyBxdWVzdGlvbiBibG9jay4gVGhlIEFVVEhPUkVEIG9yZGVyIG9mIGBpdGVtc2AgSVMgdGhlXG4vLyBjb3JyZWN0IG9yZGVyOyBzdHVkZW50cyBzZWUgdGhlIGxpc3Qgc2h1ZmZsZWQgYXQgcHVibGlzaCB0aW1lIGFuZCBkcmFnIGl0XG4vLyBiYWNrIGludG8gc2VxdWVuY2UuIERlc2lnbjogZG9jcy9kZXNpZ24vbWF0Y2hpbmctb3JkZXJpbmctcXVlc3Rpb25zLm1kXG4vLyAoZGVjaWRlZCAyMDI2LTA3LTEwKS5cbi8vXG4vLyBTY29yZWQgQUxMLU9SLU5PVEhJTkcgb24gZXhhY3Qgc2VxdWVuY2UgZXF1YWxpdHkgKGF1dGhvciBjYWxsOiBwYXJ0aWFsLVxuLy8gY3JlZGl0IG1ldHJpY3MgZm9yIG9yZGVyaW5ncyBhcmUgZWl0aGVyIG1pc2xlYWRpbmcgXHUyMDE0IHBvc2l0aW9uIG1hdGNoZXNcbi8vIHB1bmlzaCBhbiBvZmYtYnktb25lIHNoaWZ0IGFic3VyZGx5IFx1MjAxNCBvciBvcGFxdWUgdG8gdGVhY2hlcnM7IHJldmlzaXQgb25seVxuLy8gb24gb2JzZXJ2ZWQgZGVtYW5kKS4gSW50ZXJjaGFuZ2VhYmxlIGFkamFjZW50IGl0ZW1zOiBZQUdOSSwgYWRkaXRpdmUgbGF0ZXIuXG4vL1xuLy8gQW4gdW50b3VjaGVkIGxpc3QgaXMgYW4gT01JU1NJT04sIG5vdCBhbiBhbnN3ZXI6IGEgc2h1ZmZsZWQgbGlzdCBpcyBhbHdheXNcbi8vICpzb21lKiBzZXF1ZW5jZSwgc28gdGhlIHJ1bnRpbWUgb25seSByZWNvcmRzIGEgcmVzcG9uc2Ugb25jZSB0aGUgc3R1ZGVudFxuLy8gaGFzIG1vdmVkIHNvbWV0aGluZy5cbi8vXG4vLyBObyBmaWd1cmUgc2xvdCBvbiBpdGVtcyBpbiB2MSAobm8gY2xlYXIgdXNlIGNhc2UgeWV0OyBhZGRpdGl2ZSBsYXRlciBcdTIwMTRcbi8vIHRoZSBNQy9tYXRjaGluZyBDaG9pY2VJbWFnZS9DaG9pY2VHcmFwaCBwYXR0ZXJuIGlzIHNpdHRpbmcgdGhlcmUpLlxuXG5leHBvcnQgY29uc3QgT3JkZXJpbmdJdGVtID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIC8vIFJpY2ggaW5saW5lIGNvbnRlbnQgKGZvcm1hdHRlZCB0ZXh0ICsgaW5saW5lIG1hdGgpLiBOb24tZW1wdHkgaXMgYW5cbiAgLy8gZWRpdG9yIGNvbmNlcm4sIG5vdCBhIHNjaGVtYSBvbmUgKG1pZC1lZGl0IGRyYWZ0cyBtdXN0IHNhdmUpLlxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxufSk7XG5leHBvcnQgdHlwZSBPcmRlcmluZ0l0ZW0gPSB6LmluZmVyPHR5cGVvZiBPcmRlcmluZ0l0ZW0+O1xuXG5leHBvcnQgY29uc3QgT3JkZXJpbmdCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ29yZGVyaW5nJyksXG4gIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC4uLmxhYmVsRmllbGRzLFxuICAvLyBUaGUgcXVlc3Rpb24gcHJvc2UgKHJpY2ggaW5saW5lIGNvbnRlbnQsIGxpa2UgYSBwcm9ibGVtIHN0YXRlbWVudCkuXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgLy8gQXV0aG9yZWQgb3JkZXIgPSBjb3JyZWN0IG9yZGVyLiBUaGUgcmVuZGVyZXIgc2h1ZmZsZXMgZGV0ZXJtaW5pc3RpY2FsbHlcbiAgLy8gKHNlZWRlZCBieSBibG9jayBpZCkgZm9yIHRoZSBzdHVkZW50LWZhY2luZyBhcnJhbmdlbWVudC5cbiAgaXRlbXM6IHouYXJyYXkoT3JkZXJpbmdJdGVtKS5taW4oMiksXG4gIC8vIE1DLXBhcml0eSBwcm9ibGVtIGNocm9tZSAob25lIHByb2JsZW0gc2hhcGUsIG9uZSBkYXNoYm9hcmQgcm93IHNoYXBlKS5cbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgaGFzQ29uZmlkZW5jZVJhdGluZzogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgd29ya1NwYWNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBPcmRlcmluZ0Jsb2NrID0gei5pbmZlcjx0eXBlb2YgT3JkZXJpbmdCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuaW1wb3J0IHsgRW5kcG9pbnRTdHlsZSB9IGZyb20gJy4vaW50ZXJhY3RpdmUtZ3JhcGguanMnO1xuaW1wb3J0IHsgc2l6aW5nRmllbGRzIH0gZnJvbSAnLi4vc2l6aW5nLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIG51bWJlci1saW5lLnRzIFx1MjAxNCB0aGUgbnVtYmVyX2xpbmUgYmxvY2sgKDEtRCBncmFkZWQsIEstOCAvIGVhcmx5IGFsZ2VicmEpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIDEtRCBzaWJsaW5nIG9mIGludGVyYWN0aXZlX2dyYXBoLiBUaGUgc3R1ZGVudCdzIGFuc3dlciBpcyBHRU9NRVRSSUMgXHUyMDE0IGFcbi8vIHBvaW50IChvciBzZXZlcmFsKSBwbG90dGVkIG9uIGEgc2luZ2xlIG51bWJlciBsaW5lLCBvciBhbiBpbnRlcnZhbC9yYXkgd2l0aFxuLy8gb3Blbi9jbG9zZWQgZW5kcG9pbnRzIChcImdyYXBoIHggPj0gLTJcIikuIFNhbWUgdGhyZWUgc3RydWN0dXJhbCBjb25zZXF1ZW5jZXNcbi8vIGFzIHRoZSBncmFwaCBibG9jayAoc2VlIGRvY3MvZGVzaWduL251bWJlci1saW5lLWJsb2NrLm1kKTogYSBzdHJ1Y3R1cmVkXG4vLyBhbnN3ZXIgd2l0aCBpdHMgT1dOIHN1Ym1pc3Npb24gbWFwIChudW1iZXJMaW5lUmVzcG9uc2VzLCBub3QgdGhlIGJsYW5rcyBtYXApLFxuLy8gdG9sZXJhbmNlLWJhc2VkIGdlb21ldHJpYyBzY29yaW5nIGRvbmUgYnkgdGhlIGxhenkgZ3JhcGgta2l0IChub3QgdGhlXG4vLyBydW50aW1lJ3Mgc3RyaW5nIHN0cmF0ZWdpZXMpLCBhbmQgYSB3aWRnZXQgdGhhdCByaWRlcyBAYWN0aXZpdHkvZ3JhcGgta2l0LlxuLy9cbi8vIEEgU0VQQVJBVEUgYmxvY2sgZmFtaWx5LCBub3QgYSBHcmFwaEludGVyYWN0aW9uIHZhcmlhbnQgKGF1dGhvciBjYWxsLCBTVEFURVxuLy8gMjAyNi0wNy0xMCk6IG51bWJlciBsaW5lcyBhcmUgMS1EIGFuZCBtdXN0IG5vdCBiZSBmb3JjZWQgdW5kZXIgdGhlIGdyYXBoXG4vLyBibG9jaydzIDItRCBBeGlzQ29uZmlnLiBFbmRwb2ludFN0eWxlIGlzIHNoYXJlZCBmcm9tIGludGVyYWN0aXZlLWdyYXBoLnRzIFx1MjAxNFxuLy8gaXQgd2FzIHJlc2VydmVkIHRoZXJlIFwiZm9yIHRoZSBmdXR1cmUgbnVtYmVyLWxpbmUgZmFtaWx5XCIgZnJvbSBEcm9wIDIuXG4vL1xuLy8gU2xpY2UgMSBzaGlwcyBUV08gaW50ZXJhY3Rpb25zIChwbG90X3BvaW50LCBwbG90X2ludGVydmFsKSwgZGlzY3JpbWluYXRlZCBvblxuLy8gYHR5cGVgIGZyb20gZGF5IG9uZSBzbyBwbG90X3JheSAvIGRpc3BsYXkgc2xvdCBpbiBhZGRpdGl2ZWx5IGxhdGVyLCBleGFjdGx5XG4vLyBob3cgR3JhcGhJbnRlcmFjdGlvbiBncm93cy5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIC0tLS0gTGluZSBjb25maWd1cmF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgMS1EIGFuYWxvZ3VlIG9mIEF4aXNDb25maWcuIExpbmUgdW5pdHMgdGhyb3VnaG91dCBcdTIwMTQgdG9sZXJhbmNlIGFuZCB0aWNrXG4vLyBzdGVwcyBhcmUgaW4gdGhlIHNhbWUgdW5pdHMsIG5ldmVyIHBpeGVscywgc28gYSBwYWdlIHRoYXQgcmUtbGF5cy1vdXQgYXQgYVxuLy8gZGlmZmVyZW50IHdpZHRoIHN0aWxsIHNjb3JlcyBpZGVudGljYWxseS5cbmV4cG9ydCBjb25zdCBOdW1iZXJMaW5lQ29uZmlnID0gei5vYmplY3Qoe1xuICBtaW46IHoubnVtYmVyKCksXG4gIG1heDogei5udW1iZXIoKSxcbiAgLy8gU3BhY2luZyBiZXR3ZWVuIExBQkVMRUQgdGlja3MgKGxpbmUgdW5pdHMpLlxuICB0aWNrU3RlcDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLmRlZmF1bHQoMSksXG4gIC8vIFVubGFiZWxlZCBtaW5vciB0aWNrcyBkcmF3biBiZXR3ZWVuIGVhY2ggcGFpciBvZiBsYWJlbGVkIHRpY2tzICgwID0gbm9uZSkuXG4gIC8vIFZpc3VhbCBvbmx5IFx1MjAxNCBuZXZlciBzY29yZWQuXG4gIG1pbm9yVGlja3NQZXJTdGVwOiB6Lm51bWJlcigpLmludCgpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwKSxcbiAgLy8gV2hlbiB0cnVlLCBhIGRyYWdnZWQgaGFuZGxlIHNuYXBzIHRvIHRoZSBuZWFyZXN0IHRpY2sgKG1pbm9yIGlmIHByZXNlbnQsXG4gIC8vIGVsc2UgdGhlIGxhYmVsZWQgc3RlcCkuIEtleWJvYXJkIG51ZGdlIGFsd2F5cyBtb3ZlcyBieSBvbmUgdGljayByZWdhcmRsZXNzXG4gIC8vIChTaGlmdCA9IGZpbmUsIG9uZS10ZW50aCBvZiBhIHRpY2spLlxuICBzbmFwVG9UaWNrOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxufSk7XG5leHBvcnQgdHlwZSBOdW1iZXJMaW5lQ29uZmlnID0gei5pbmZlcjx0eXBlb2YgTnVtYmVyTGluZUNvbmZpZz47XG5cbi8vIC0tLS0gSW50ZXJhY3Rpb24gdmFyaWFudHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBwbG90X3BvaW50OiB0aGUgc3R1ZGVudCBwbGFjZXMgb25lIG9yIG1vcmUgcG9pbnRzIG9uIHRoZSBsaW5lLiBNdWx0aS1wb2ludFxuLy8gKFwicGxvdCAtMiBhbmQgNVwiKSBpcyBzY29yZWQgY29uc3VtZS1vbmNlLCBhbGwtb3Itbm90aGluZyBcdTIwMTQgZXZlcnkgY29ycmVjdFxuLy8gcG9zaXRpb24gbXVzdCBiZSBtYXRjaGVkIChtaXJyb3JzIHRoZSBncmFwaCBibG9jaydzIE4taGFuZGxlIHBsb3RfcG9pbnQpLlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3RfcG9pbnQnKSxcbiAgLy8gQ29ycmVjdCBwb3NpdGlvbnMgaW4gbGluZSB1bml0cy4gQSBzaW5nbGUgcG9pbnQgaXMgdGhlIGNvbW1vbiBjYXNlLlxuICBjb3JyZWN0UG9pbnRzOiB6LmFycmF5KHoubnVtYmVyKCkpLm1pbigxKSxcbiAgLy8gTWF0Y2ggcmFkaXVzIGluIGxpbmUgdW5pdHMgKGEgcG9pbnQgaXMgY29ycmVjdCB3aXRoaW4gKy8tIHRvbGVyYW5jZSkuXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZVBvaW50SW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgTnVtYmVyTGluZVBvaW50SW50ZXJhY3Rpb25cbj47XG5cbi8vIEFuIGludGVydmFsIG9yIHJheSBvbiB0aGUgbGluZS4gQSBwcmVzZW50IGJvdW5kIGNhcnJpZXMgYW4gb3Blbi9jbG9zZWQgc3R5bGVcbi8vICh0aGUgaW5lcXVhbGl0eSBkaXN0aW5jdGlvbjogeCA+IDMgb3BlbiB2cyB4ID49IDMgY2xvc2VkKS4gQW4gQUJTRU5UIGJvdW5kIGlzXG4vLyB1bmJvdW5kZWQgdGhhdCBkaXJlY3Rpb24gXHUyMDE0IHNvIGEgcmF5IGlzIGp1c3QgYW4gaW50ZXJ2YWwgd2l0aCBvbmUgc2lkZSBvbWl0dGVkXG4vLyAoXCJ4ID49IDNcIiA9IG1pbiAzIGNsb3NlZCwgbm8gbWF4OyBcInggPCA1XCIgPSBtYXggNSBvcGVuLCBubyBtaW4pLiBUaGUgc2hhZGVkXG4vLyByZWdpb24gaXMgdW5hbWJpZ3VvdXMgZnJvbSB3aGljaCBib3VuZHMgYXJlIHByZXNlbnQsIHNvIG5vIHNlcGFyYXRlIHNpZGUgZmxhZ1xuLy8gaXMgbmVlZGVkICh1bmxpa2UgdGhlIDItRCBncmFwaCBpbmVxdWFsaXR5KS4gQXQgbGVhc3Qgb25lIGJvdW5kIG11c3QgYmVcbi8vIHByZXNlbnQgKGEgdHdvLXNpZGVkLXVuYm91bmRlZCBpbnRlcnZhbCBpcyB0aGUgd2hvbGUgbGluZSBcdTIwMTQgbWVhbmluZ2xlc3MpOyB0aGVcbi8vIGZhY3RvcnkgKyBhdXRob3IgVUkgZ3VhcmFudGVlIGl0IGFuZCB0aGUgc2NvcmVyIGFzc3VtZXMgaXQuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUludGVydmFsID0gei5vYmplY3Qoe1xuICBtaW46IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgbWluU3R5bGU6IEVuZHBvaW50U3R5bGUub3B0aW9uYWwoKSxcbiAgbWF4OiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIG1heFN0eWxlOiBFbmRwb2ludFN0eWxlLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVJbnRlcnZhbCA9IHouaW5mZXI8dHlwZW9mIE51bWJlckxpbmVJbnRlcnZhbD47XG5cbmV4cG9ydCBjb25zdCBOdW1iZXJMaW5lSW50ZXJ2YWxJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X2ludGVydmFsJyksXG4gIGNvcnJlY3RJbnRlcnZhbDogTnVtYmVyTGluZUludGVydmFsLFxuICAvLyBNYXRjaCByYWRpdXMgaW4gbGluZSB1bml0cywgYXBwbGllZCB0byBlYWNoIHByZXNlbnQgZW5kcG9pbnQuXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb25cbj47XG5cbi8vIERpc2NyaW1pbmF0ZWQgb24gYHR5cGVgIHNvIGNvbnN1bWVycyBicmFuY2ggdW5pZm9ybWx5IGFuZCB0aGUgd2lyZSBmb3JtYXRcbi8vIGFsd2F5cyBjYXJyaWVzIGl0LiBHcm93aW5nIGEgdmFyaWFudCBpcyBhIG5ldyBtZW1iZXIgaGVyZSArIGEgbmV3IHNjb3JlclxuLy8gYnJhbmNoIGluIHRoZSBraXQgXHUyMDE0IG5vIG90aGVyIGJsb2NrIHRvdWNoZWQuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUludGVyYWN0aW9uID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uLFxuICBOdW1iZXJMaW5lSW50ZXJ2YWxJbnRlcmFjdGlvbixcbl0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZUludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgTnVtYmVyTGluZUludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBUaGUgYmxvY2sgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEF1dG8tbnVtYmVyZWQgbGlrZSB0aGUgb3RoZXIgcXVlc3Rpb24gYmxvY2tzLiBoYXNDb25maWRlbmNlUmF0aW5nICsgc2tpbGxzICtcbi8vIHNvbHV0aW9uIGZvbGxvdyB0aGUgc2FtZSBvcHQtaW4gcGF0dGVybnMgRmlsbEluQmxhbmtCbG9jayAvIEludGVyYWN0aXZlR3JhcGhcbi8vIGVzdGFibGlzaGVkLiBEZWxpYmVyYXRlbHkgTEVBTiBmb3Igc2xpY2UgMSAobm8gcGFydGlhbENyZWRpdCAvIGFsbG93Tm9Tb2x1dGlvblxuLy8gLyBtaXN0YWtlRmVlZGJhY2spIFx1MjAxNCBhbGwtb3Itbm90aGluZyBzY29yaW5nIChkZXNpZ24gZGVjaXNpb24gNik7IHRob3NlIGZpZWxkc1xuLy8gYXJlIGFkZGl0aXZlIGxhdGVyIGlmIGFza2VkIGZvciAoWUFHTkkpLCBleGFjdGx5IGFzIHRoZSBncmFwaCBibG9jayByZXNlcnZlZFxuLy8gdGhlbSBhY3Jvc3MgZHJvcHMuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnbnVtYmVyX2xpbmUnKSxcbiAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLi4ubGFiZWxGaWVsZHMsXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgY29uZmlnOiBOdW1iZXJMaW5lQ29uZmlnLFxuICBpbnRlcmFjdGlvbjogTnVtYmVyTGluZUludGVyYWN0aW9uLFxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICBoYXNDb25maWRlbmNlUmF0aW5nOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICAvLyBWYXJpYWJsZSBibG9jayBzaXppbmc6IG9wdGlvbmFsIHdpZHRoIGZyYWN0aW9uICsgYWxpZ25tZW50IChzaXppbmcudHMpLlxuICAvLyBBZGRpdGl2ZS9vcHRpb25hbCBcdTIwMTQgbm8gc2NoZW1hVmVyc2lvbiBidW1wLlxuICAuLi5zaXppbmdGaWVsZHMsXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVCbG9jayA9IHouaW5mZXI8dHlwZW9mIE51bWJlckxpbmVCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuaW1wb3J0IHsgTnVtYmVyTGluZUNvbmZpZyB9IGZyb20gJy4vbnVtYmVyLWxpbmUuanMnO1xuaW1wb3J0IHsgc2l6aW5nRmllbGRzIH0gZnJvbSAnLi4vc2l6aW5nLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGRhdGEtcGxvdC50cyBcdTIwMTQgdGhlIGRhdGFfcGxvdCBibG9jayAoc3RhdGlzdGljcyBjaGFydHMpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHN0YXRpc3RpY3Mgc2libGluZyBvZiBpbnRlcmFjdGl2ZV9ncmFwaCAoMi1EIGZ1bmN0aW9ucykgYW5kIG51bWJlcl9saW5lXG4vLyAoMS1EIGdlb21ldHJ5KS4gQSBkYXRhX3Bsb3QgcmVuZGVycyBhIGRvdCBwbG90LCBoaXN0b2dyYW0sIG9yIGJveCBwbG90IGZyb20gYVxuLy8gZGF0YXNldCBcdTIwMTQgZWl0aGVyIGFzIGEgc3RhdGljIFNUSU1VTFVTIHRoZSBzdHVkZW50IHJlYWRzIChcIndoYXQgaXMgdGhlIG1lZGlhblxuLy8gb2YgdGhpcyBib3ggcGxvdD9cIiwgcGFpcmVkIHdpdGggYSBzaWJsaW5nIG51bWVyaWMvTUMgYmxvY2spIG9yIGFzIGEgZ3JhZGVkXG4vLyBDT05TVFJVQ1RJT04gdGhlIHN0dWRlbnQgYnVpbGRzIChcIm1ha2UgYSBkb3QgcGxvdCBvZiB0aGVzZSB2YWx1ZXNcIikuXG4vL1xuLy8gQSBTRVBBUkFURSBibG9jayBmYW1pbHksIG5vdCBhIEdyYXBoSW50ZXJhY3Rpb24gdmFyaWFudCAodGF4b25vbXkgZml4ZWRcbi8vIDIwMjYtMDctMTAsIFNUQVRFKTogc3RhdHMgY2hhcnRzIGFyZSB0aGVpciBvd24gc2hhcGUgYW5kIG11c3Qgbm90IGJlIGZvcmNlZFxuLy8gdW5kZXIgdGhlIGdyYXBoIGJsb2NrJ3MgMi1EIEF4aXNDb25maWcuIERlc2lnbiArIDkgZGVjaXNpb25zIGluXG4vLyBkb2NzL2Rlc2lnbi9kYXRhLXBsb3QtYmxvY2subWQgKGF1dGhvciBhcHByb3ZlZCB0aGUgcmVjb21tZW5kZWQgYW5zd2VycykuXG4vL1xuLy8gVEhFIEFOU1dFUiBJUyBDT01QVVRFRCBGUk9NIFRIRSBEQVRBIChkZXNpZ24gZGVjaXNpb24gM2EpOiBhIGRvdCBwbG90LFxuLy8gaGlzdG9ncmFtLCBhbmQgYm94IHBsb3QgYXJlIGVhY2ggYSBkZXRlcm1pbmlzdGljIGZ1bmN0aW9uIG9mIGBkYXRhYCwgc28gdGhlXG4vLyBhdXRob3IgZW50ZXJzIHRoZSByYXcgZGF0YXNldCBPTkNFIGFuZCB0aGUgY29ycmVjdCBwbG90IGlzIGRlcml2ZWQgYnkgdGhlIGtpdFxuLy8gc2NvcmVyIFx1MjAxNCB0aGVyZSBpcyBubyBzZXBhcmF0ZWx5LWF1dGhvcmVkIGFuc3dlciBrZXkgdG8gZHJpZnQgZnJvbSB0aGUgZGF0YS5cbi8vIFRoZSBzYW1lIGBkYXRhYCByZW5kZXJzIHRoZSBjaGFydCBpbiBkaXNwbGF5IG1vZGUgYW5kIGlzIHRoZSBzb3VyY2UgdGhlXG4vLyBzdHVkZW50IHBsb3RzIChhbmQgdGhlIGtleSBpdCdzIHNjb3JlZCBhZ2FpbnN0KSBpbiBidWlsZCBtb2RlLlxuLy9cbi8vIFNsaWNlIDEgc2hpcHMgVFdPIGludGVyYWN0aW9ucyBcdTIwMTQgYGRpc3BsYXlgIChhbGwgdGhyZWUgY2hhcnQgdHlwZXMsIHVuZ3JhZGVkXG4vLyBzdGltdWx1cykgYW5kIGBidWlsZF9kb3RwbG90YCAodGhlIHNpbXBsZXN0IGdyYWRlZCBjb25zdHJ1Y3Rpb24pIFx1MjAxNFxuLy8gZGlzY3JpbWluYXRlZCBvbiBgdHlwZWAgZnJvbSBkYXkgb25lIHNvIGBidWlsZF9oaXN0b2dyYW1gIC8gYGJ1aWxkX2JveHBsb3RgXG4vLyBzbG90IGluIGFkZGl0aXZlbHkgbGF0ZXIsIGV4YWN0bHkgaG93IEdyYXBoSW50ZXJhY3Rpb24gYW5kIE51bWJlckxpbmVJbnRlcmFjdGlvblxuLy8gZ3Jvdy4gU2FtZSB0aHJlZSBzdHJ1Y3R1cmFsIGNvbnNlcXVlbmNlcyBhcyB0aGUgZ3JhcGgvbnVtYmVyLWxpbmUgYmxvY2tzOiBhXG4vLyBzdHJ1Y3R1cmVkIGFuc3dlciB3aXRoIGl0cyBPV04gc3VibWlzc2lvbiBtYXAgKGRhdGFQbG90UmVzcG9uc2VzLCBub3QgdGhlXG4vLyBibGFua3MgbWFwKSwgZnJlcXVlbmN5L3N1bW1hcnkgc2NvcmluZyBkb25lIGJ5IHRoZSBsYXp5IGdyYXBoLWtpdCAobm90IHRoZVxuLy8gcnVudGltZSdzIHN0cmluZyBzdHJhdGVnaWVzKSwgYW5kIGEgd2lkZ2V0IHRoYXQgcmlkZXMgQGFjdGl2aXR5L2dyYXBoLWtpdC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIC0tLS0gQ2hhcnQgY29uZmlndXJhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgbnVtZXJpYyBheGlzIGlzIHJldXNlZCBWRVJCQVRJTSBmcm9tIE51bWJlckxpbmVDb25maWcgKGRlc2lnbiBkZWNpc2lvbiA1KTpcbi8vIGEgZG90IHBsb3Qgc3RhY2tzIGRvdHMgYWJvdmUgdGhlaXIgdmFsdWUgb24gYSAxLUQgbnVtYmVyIGxpbmUsIGFuZCBhIGJveCBwbG90XG4vLyBzaXRzIG9uIHRoYXQgc2FtZSBheGlzLCBzbyB0aGUgdGljay9taW5vci9zbmFwIHNlbWFudGljcyBhcmUgaWRlbnRpY2FsLiBUaGVcbi8vIGhpc3RvZ3JhbS1vbmx5IGV4dHJhcyAoZXF1YWwtd2lkdGggYmlucyArIGFuIG9wdGlvbmFsIHktc2NhbGUgY2VpbGluZykgYXJlXG4vLyBjb25zdWx0ZWQgb25seSB3aGVuIHRoZSBjaGFydCBpcyBhIGhpc3RvZ3JhbTsgdW5lcXVhbC1iaW4gYGJpbkVkZ2VzYCBpcyBhXG4vLyBkb2N1bWVudGVkIGxhdGVyIGxldmVyIChZQUdOSSBpbiBzbGljZSAxKS5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdENvbmZpZyA9IE51bWJlckxpbmVDb25maWcuZXh0ZW5kKHtcbiAgLy8gRXF1YWwtd2lkdGggYmluIHNpemUgc3Bhbm5pbmcgW21pbiwgbWF4XTsgb25seSByZWFkIHdoZW4gY2hhcnQgPT1cbiAgLy8gJ2hpc3RvZ3JhbScuIEFic2VudCBcdTIxOTIgdGhlIGhpc3RvZ3JhbSBmYWxscyBiYWNrIHRvIGB0aWNrU3RlcGAgYXMgdGhlIGJpblxuICAvLyB3aWR0aC4gUG9zaXRpdmUuXG4gIGJpbldpZHRoOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLy8gRml4ZWQgY2VpbGluZyBmb3IgdGhlIGhpc3RvZ3JhbS9kb3QtcGxvdCB2ZXJ0aWNhbCBzY2FsZS4gQWJzZW50IFx1MjE5MiB0aGVcbiAgLy8gc2NhbGUgYXV0by1maXRzIHRoZSB0YWxsZXN0IGJhci9zdGFjayBmcm9tIGBkYXRhYC4gQSBmaXhlZCB2YWx1ZSBrZWVwc1xuICAvLyBzZXZlcmFsIHBsb3RzIG9uIGEgcGFnZSB2aXN1YWxseSBjb21wYXJhYmxlLiBQb3NpdGl2ZSBpbnRlZ2VyIChmcmVxdWVuY3kpLlxuICBtYXhGcmVxdWVuY3k6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdENvbmZpZyA9IHouaW5mZXI8dHlwZW9mIERhdGFQbG90Q29uZmlnPjtcblxuLy8gVGhlIGNoYXJ0IHNoYXBlLiBTaGFyZWQgYnkgdGhlIGBkaXNwbGF5YCBtZW1iZXIgKHdoaWNoIG9uZSB0byByZW5kZXIpIGFuZFxuLy8gaW1wbGllZCBieSBlYWNoIGBidWlsZF8qYCBtZW1iZXIuIE5hbWVkIGJ5IHNoYXBlLCBub3QgYnkgZ3JhZGUgYmFuZC5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdENoYXJ0ID0gei5lbnVtKFsnZG90cGxvdCcsICdoaXN0b2dyYW0nLCAnYm94cGxvdCddKTtcbmV4cG9ydCB0eXBlIERhdGFQbG90Q2hhcnQgPSB6LmluZmVyPHR5cGVvZiBEYXRhUGxvdENoYXJ0PjtcblxuLy8gLS0tLSBJbnRlcmFjdGlvbiB2YXJpYW50cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGRpc3BsYXk6IGEgc3RhdGljLCB1bmdyYWRlZCBjaGFydCBvZiBgZGF0YWAgXHUyMDE0IGEgc3RpbXVsdXMgdGhlIHN0dWRlbnQgcmVhZHMuXG4vLyBMaWtlIGludGVyYWN0aXZlX2dyYXBoJ3MgYGRpc3BsYXlgIG1lbWJlciBpdCBwdWxscyBubyBwcm9ibGVtIG51bWJlciwgaXNcbi8vIG5ldmVyIHNjb3JlZCwgYW5kIG5ldmVyIGpvaW5zIHRoZSBzdWJtaXNzaW9uIHBheWxvYWQ7IGEgXCJyZWFkIHRoaXMgY2hhcnQgdGhlblxuLy8gYW5zd2VyXCIgdGFzayBjb21wb3NlcyBhIGRpc3BsYXkgZGF0YV9wbG90IHdpdGggYSBzaWJsaW5nIG51bWVyaWMvTUMgYmxvY2tcbi8vICh0aGUgcGF0dGVybiB0aGF0IHJlcGxhY2VkIHRoZSByZXRpcmVkIGFuc3dlci1zdXJmYWNlLWFzLWEtZmllbGQgc2VhbSkuXG5leHBvcnQgY29uc3QgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnZGlzcGxheScpLFxuICBjaGFydDogRGF0YVBsb3RDaGFydCxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb25cbj47XG5cbi8vIGJ1aWxkX2RvdHBsb3Q6IHRoZSBzdHVkZW50IHN0YWNrcyBkb3RzIGFib3ZlIHRoZSBheGlzIHRvIHJlcHJvZHVjZSB0aGVcbi8vIGZyZXF1ZW5jeSBkaXN0cmlidXRpb24gb2YgYGRhdGFgLiBTY29yZWQgYWxsLW9yLW5vdGhpbmcgb24gZnJlcXVlbmN5LW1hcFxuLy8gZXF1YWxpdHkgKGRlc2lnbiBkZWNpc2lvbiA4KSBcdTIwMTQgZG90IHZhbHVlcyBhcmUgZGlzY3JldGUgKHRoZSB3aWRnZXQgc25hcHMgZWFjaFxuLy8gZG90IHRvIGEgdGljayksIHNvIHRoZSBjb21wYXJpc29uIGlzIGV4YWN0LCBubyB0b2xlcmFuY2UgZmllbGQuIFRoZSBjb3JyZWN0XG4vLyBkaXN0cmlidXRpb24gaXMgQ09NUFVURUQgZnJvbSBgZGF0YWAgKGRlY2lzaW9uIDNhKTsgbm90aGluZyB0byBhdXRob3IgaGVyZVxuLy8gYmV5b25kIHRoZSBkYXRhc2V0IGl0c2VsZiwgc28gdGhpcyBpcyBhIGJhcmUgbWFya2VyIHZhcmlhbnQgdGhhdCBncm93c1xuLy8gYnVpbGRfaGlzdG9ncmFtIC8gYnVpbGRfYm94cGxvdCBzaWJsaW5ncyBsYXRlci5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdERvdHBsb3RJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdidWlsZF9kb3RwbG90JyksXG59KTtcbmV4cG9ydCB0eXBlIERhdGFQbG90RG90cGxvdEludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIERhdGFQbG90RG90cGxvdEludGVyYWN0aW9uXG4+O1xuXG4vLyBidWlsZF9oaXN0b2dyYW06IHRoZSBzdHVkZW50IHNldHMgZWFjaCBiYXIncyBmcmVxdWVuY3kgdG8gcmVwcm9kdWNlIHRoZVxuLy8gaGlzdG9ncmFtIG9mIGBkYXRhYCAoYmlubmVkIGJ5IGNvbmZpZy5iaW5XaWR0aCBvdmVyIFttaW4sbWF4XSkuIFNjb3JlZFxuLy8gYWxsLW9yLW5vdGhpbmcgb24gZXhhY3QgcGVyLWJpbiBpbnRlZ2VyLWZyZXF1ZW5jeSBlcXVhbGl0eSAoYSBiYXIgaXMgYSB3aG9sZVxuLy8gY291bnQgXHUyMDE0IG5vIHRvbGVyYW5jZSksIHRoZSBmcmVxdWVuY3ktZGlzdHJpYnV0aW9uIHR3aW4gb2YgYnVpbGRfZG90cGxvdC4gVGhlXG4vLyBjb3JyZWN0IGhlaWdodHMgYXJlIENPTVBVVEVEIGZyb20gYGRhdGFgLCBzbyB0aGlzIHRvbyBpcyBhIGJhcmUgbWFya2VyIHZhcmlhbnQuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RIaXN0b2dyYW1JbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdidWlsZF9oaXN0b2dyYW0nKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RIaXN0b2dyYW1JbnRlcmFjdGlvbiA9IHouaW5mZXI8XG4gIHR5cGVvZiBEYXRhUGxvdEhpc3RvZ3JhbUludGVyYWN0aW9uXG4+O1xuXG4vLyBidWlsZF9ib3hwbG90OiB0aGUgc3R1ZGVudCBkcmFncyB0aGUgZml2ZS1udW1iZXItc3VtbWFyeSBoYW5kbGVzIChtaW4sIFExLFxuLy8gbWVkaWFuLCBRMywgbWF4KSB0byBidWlsZCB0aGUgYm94ICsgd2hpc2tlcnMgb2YgYGRhdGFgLiBTY29yZWQgYWxsLW9yLW5vdGhpbmdcbi8vIHdpdGggZWFjaCBoYW5kbGUgd2l0aGluIGB0b2xlcmFuY2VgIGxpbmUgdW5pdHMgb2YgdGhlIGNvbXB1dGVkIHN1bW1hcnkuIFVubGlrZVxuLy8gdGhlIGZyZXF1ZW5jeSBidWlsZHMgdGhpcyBjYXJyaWVzIGEgdG9sZXJhbmNlIGJlY2F1c2UgYm94IHBvc2l0aW9ucyBhcmVcbi8vIGNvbnRpbnVvdXMgYW5kIHRoZSB0d28gY29tbW9uIHF1YXJ0aWxlIG1ldGhvZHMgY2FuIGRpZmZlciBieSBhIGRhdGEgcG9pbnQgb25cbi8vIGV2ZW4tbGVuZ3RoIHNldHMgXHUyMDE0IHRoZSBrZXkgdXNlcyB0aGUgVEktODQgZXhjbHVzaXZlLW1lZGlhbiBtZXRob2QgKGxvY2tlZCxcbi8vIGRlc2lnbiBkZWNpc2lvbiA0KSBhbmQgdGhlIHRvbGVyYW5jZSBhYnNvcmJzIHRoZSBhZGphY2VudC1tZXRob2QgYW5zd2VyLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90Qm94cGxvdEludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2J1aWxkX2JveHBsb3QnKSxcbiAgLy8gTWF0Y2ggcmFkaXVzIGluIGxpbmUgdW5pdHMsIGFwcGxpZWQgdG8gZWFjaCBvZiB0aGUgZml2ZSBoYW5kbGVzLiBEZWZhdWx0XG4gIC8vIGhhbGYgYSB1bml0IHRpY2suXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC41KSxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RCb3hwbG90SW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgRGF0YVBsb3RCb3hwbG90SW50ZXJhY3Rpb25cbj47XG5cbi8vIERpc2NyaW1pbmF0ZWQgb24gYHR5cGVgIHNvIGNvbnN1bWVycyBicmFuY2ggdW5pZm9ybWx5IGFuZCB0aGUgd2lyZSBmb3JtYXRcbi8vIGFsd2F5cyBjYXJyaWVzIGl0LiBHcm93aW5nIGEgdmFyaWFudCBpcyBhIG5ldyBtZW1iZXIgaGVyZSArIGEgbmV3IHNjb3JlclxuLy8gYnJhbmNoIGluIHRoZSBraXQgXHUyMDE0IG5vIG90aGVyIGJsb2NrIHRvdWNoZWQuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RJbnRlcmFjdGlvbiA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBEYXRhUGxvdERpc3BsYXlJbnRlcmFjdGlvbixcbiAgRGF0YVBsb3REb3RwbG90SW50ZXJhY3Rpb24sXG4gIERhdGFQbG90SGlzdG9ncmFtSW50ZXJhY3Rpb24sXG4gIERhdGFQbG90Qm94cGxvdEludGVyYWN0aW9uLFxuXSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdEludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3RJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gVGhlIGJsb2NrIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBdXRvLW51bWJlcmVkIGxpa2UgdGhlIG90aGVyIHF1ZXN0aW9uIGJsb2NrcyBXSEVOIEdSQURFRCBcdTIwMTQgYSBgZGlzcGxheWBcbi8vIGRhdGFfcGxvdCBwdWxscyBubyBudW1iZXIgKHRoZSByZW5kZXJlcidzIGlzTnVtYmVyZWRCbG9jayByZXR1cm5zIGZhbHNlIGZvclxuLy8gaXQsIGV4YWN0bHkgYXMgaXQgZG9lcyBmb3IgYSBkaXNwbGF5IGludGVyYWN0aXZlX2dyYXBoKS4gaGFzQ29uZmlkZW5jZVJhdGluZ1xuLy8gKyBza2lsbHMgKyBzb2x1dGlvbiBmb2xsb3cgdGhlIHNhbWUgb3B0LWluIHBhdHRlcm5zIHRoZSBncmFwaCAvIG51bWJlci1saW5lXG4vLyBibG9ja3MgZXN0YWJsaXNoZWQsIGFuZCAobGlrZSB0aGVtKSBtYXR0ZXIgb25seSBpbiBidWlsZCBtb2RlLiBEZWxpYmVyYXRlbHlcbi8vIExFQU4gZm9yIHNsaWNlIDEgKG5vIHBhcnRpYWxDcmVkaXQgLyBtaXN0YWtlRmVlZGJhY2spIFx1MjAxNCBhbGwtb3Itbm90aGluZ1xuLy8gc2NvcmluZyAoZGVjaXNpb24gOCk7IHRob3NlIGZpZWxkcyBhcmUgYWRkaXRpdmUgbGF0ZXIgaWYgYXNrZWQgZm9yIChZQUdOSSkuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2RhdGFfcGxvdCcpLFxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAuLi5sYWJlbEZpZWxkcyxcbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICAvLyBUaGUgZGF0YXNldC4gU2luZ2xlIHNvdXJjZSBvZiB0cnV0aDogdGhlIGNoYXJ0IGlzIGRyYXduIGZyb20gaXQgYW5kLCBpblxuICAvLyBidWlsZCBtb2RlLCB0aGUgY29ycmVjdCBhbnN3ZXIgaXMgZGVyaXZlZCBmcm9tIGl0LiBOb24tZW1wdHkuXG4gIGRhdGE6IHouYXJyYXkoei5udW1iZXIoKSkubWluKDEpLFxuICBjb25maWc6IERhdGFQbG90Q29uZmlnLFxuICBpbnRlcmFjdGlvbjogRGF0YVBsb3RJbnRlcmFjdGlvbixcbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgaGFzQ29uZmlkZW5jZVJhdGluZzogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgLy8gVmFyaWFibGUgYmxvY2sgc2l6aW5nOiBvcHRpb25hbCB3aWR0aCBmcmFjdGlvbiArIGFsaWdubWVudCAoc2l6aW5nLnRzKS5cbiAgLy8gQWRkaXRpdmUvb3B0aW9uYWwgXHUyMDE0IG5vIHNjaGVtYVZlcnNpb24gYnVtcC5cbiAgLi4uc2l6aW5nRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdEJsb2NrID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3RCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrIFx1MjAxNCBhIHRpdGxlZCBsaXN0IG9mIGxlYXJuaW5nIG9iamVjdGl2ZXMuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBwdXJlIENPTlRFTlQgYmxvY2sgKGRhdGEtYmxvY2stY2F0ZWdvcnk9XCJjb250ZW50XCIpOiBub24taW50ZXJhY3RpdmUsXG4vLyBub24tbnVtYmVyZWQsIG5vIHJ1bnRpbWUgd2lyaW5nLCBubyBzdWJtaXNzaW9uIHdpcmUgaW1wYWN0LiBQZWRhZ29naWNhbGx5IGl0XG4vLyBmcm9udHMgYW4gYWN0aXZpdHkgKG9yIGEgc2VjdGlvbikgd2l0aCB0aGUgXCJzdHVkZW50cyB3aWxsIGJlIGFibGUgdG9cdTIwMjZcIiBnb2Fsc1xuLy8gdGhhdCBTd2VsbGVyLXN0eWxlIHNjYWZmb2xkaW5nIGlzIGJ1aWx0IGFyb3VuZC5cbi8vXG4vLyBTaGFwZTogYW4gZWRpdGFibGUgYHRpdGxlYCAoZGVmYXVsdGVkLCBidXQgdGhlIHRlYWNoZXIgY2FuIHJlbmFtZSBpdCkgcGx1cyBhXG4vLyBsaXN0IG9mIGBpdGVtc2AsIGVhY2ggYSByaWNoIGlubGluZSBydW4gKHRleHQgKyBpbmxpbmUgbWF0aCArIG1hcmtzKSBcdTIwMTQgdGhlXG4vLyBzYW1lIGFscGhhYmV0IHBhcmFncmFwaHMgdXNlLiBJdGVtcyBtYXAgMToxIHRvIGVkaXRhYmxlIHBhcmFncmFwaHMgaW4gdGhlXG4vLyBlZGl0b3IgTm9kZVZpZXc7IHRoZSByZW5kZXJlciBlbWl0cyB0aGVtIGFzIGEgPHVsPi5cbi8vXG4vLyBgaXRlbXNgIG1heSBiZSBlbXB0eTogdGhlIGVkaXRvcidzIGNvbnRlbnQgc3BlYyBrZWVwcyBhdCBsZWFzdCBvbmUgcGFyYWdyYXBoXG4vLyBsaXZlLCBidXQgYSBzZXJpYWxpemVkIHJvdW5kLXRyaXAgY2FuIGxlZ2l0aW1hdGVseSBwcm9kdWNlIGFuIGVtcHR5IGxpc3Rcbi8vIChlLmcuIGV2ZXJ5IGl0ZW0gY2xlYXJlZCksIGFuZCB0aGF0IG11c3Qgbm90IGZhaWwgcHVibGlzaCB2YWxpZGF0aW9uLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnbGVhcm5pbmdfb2JqZWN0aXZlcycpLFxuICB0aXRsZTogei5zdHJpbmcoKSxcbiAgaXRlbXM6IHouYXJyYXkoei5hcnJheShJbmxpbmVOb2RlKSksXG59KTtcbmV4cG9ydCB0eXBlIExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrID0gei5pbmZlcjx0eXBlb2YgTGVhcm5pbmdPYmplY3RpdmVzQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgUGFyYWdyYXBoQmxvY2sgfSBmcm9tICcuL3BhcmFncmFwaC5qcyc7XG5pbXBvcnQgeyBIZWFkaW5nQmxvY2sgfSBmcm9tICcuL2hlYWRpbmcuanMnO1xuaW1wb3J0IHsgTWF0aEJsb2NrIH0gZnJvbSAnLi9tYXRoLWJsb2NrLmpzJztcbmltcG9ydCB7IEltYWdlQmxvY2sgfSBmcm9tICcuL2ltYWdlLmpzJztcbmltcG9ydCB7IEJ1bGxldExpc3RCbG9jaywgT3JkZXJlZExpc3RCbG9jayB9IGZyb20gJy4vbGlzdC5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBXb3JrZWRFeGFtcGxlQmxvY2sgXHUyMDE0IGEgdGl0bGVkLCBib3hlZCBmdWxseS13b3JrZWQgZXhhbXBsZSB0byBzdHVkeS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIHB1cmUgQ09OVEVOVCBibG9jayAoZGF0YS1ibG9jay1jYXRlZ29yeT1cImNvbnRlbnRcIik6IG5vbi1pbnRlcmFjdGl2ZSxcbi8vIG5vbi1udW1iZXJlZCwgbm8gcnVudGltZSB3aXJpbmcsIG5vIHN1Ym1pc3Npb24gd2lyZSBpbXBhY3QuIERyYXdzIG9uXG4vLyBTd2VsbGVyJ3MgY29nbml0aXZlLWxvYWQgdGhlb3J5IFx1MjAxNCBhIHdvcmtlZCBleGFtcGxlIGEgc3R1ZGVudCByZWFkcyBiZWZvcmVcbi8vIGF0dGVtcHRpbmcgdGhlIGFuYWxvZ291cyBwcm9ibGVtLlxuLy9cbi8vIFVubGlrZSBhIGNhbGxvdXQgKGlubGluZS1vbmx5IGJvZHkpLCBhIHdvcmtlZCBleGFtcGxlIGhvbGRzIE5FU1RFRCBCTE9DS1xuLy8gY29udGVudCBzbyBhIG11bHRpLXN0ZXAsIG1hdGgtaGVhdnkgc29sdXRpb24gcmVuZGVycyBwcm9wZXJseTogcGFyYWdyYXBocyxcbi8vIGJsb2NrIG1hdGgsIGxpc3RzLCBhbmQgaW1hZ2VzLiBUaGUgY2hpbGQgdW5pb24gaXMgZGVsaWJlcmF0ZWx5IGEgY3VyYXRlZFxuLy8gc3Vic2V0IG9mIHRoZSBCbG9jayB1bmlvbiBcdTIwMTQgbGVhZiBDT05URU5UIGJsb2NrcyBvbmx5LiBJdCBleGNsdWRlczpcbi8vICAgLSBxdWVzdGlvbiBibG9ja3MgKGEgd29ya2VkIGV4YW1wbGUgaXMgY29udGVudCwgbmV2ZXIgc2NvcmVkKSxcbi8vICAgLSBjb2x1bW5zIGFuZCB3b3JrZWRfZXhhbXBsZSBpdHNlbGYgKHNvIG5lc3RpbmcgdGVybWluYXRlcyBcdTIwMTQgbm8gcmVjdXJzaW9uLFxuLy8gICAgIHRoZSBzYW1lIGRpc2NpcGxpbmUgYXMgQ29sdW1uQ2VsbEJsb2NrIGZvcmJpZGRpbmcgY29sdW1ucy1pbi1jb2x1bW5zKS5cbi8vIFRoaXMgYWxzbyBrZWVwcyB0aGUgZGFzaGJvYXJkIGluZGV4IHVudG91Y2hlZDogYSB3b3JrZWQgZXhhbXBsZSBjYW4gbmV2ZXJcbi8vIGNvbnRhaW4gYSBxdWVzdGlvbiwgc28gYnVpbGRBY3Rpdml0eUluZGV4IG5ldmVyIG5lZWRzIHRvIHJlY3Vyc2UgaW50byBpdC5cbi8vXG4vLyBUaGUgc3Vic2V0IG1hdGNoZXMgdGhlIGVkaXRvci1tYXBwYWJsZSBjb250ZW50IG5vZGVzIDE6MSAoV29ya2VkRXhhbXBsZS50cydzXG4vLyBjb250ZW50IGV4cHJlc3Npb24pLCBzbyBzZXJpYWxpemUgcm91bmQtdHJpcHMgd2l0aG91dCBzaWxlbnRseSBkcm9wcGluZyBhXG4vLyBjaGlsZC4gYGNvbnRlbnRgIG1heSBiZSBlbXB0eSBmb3IgdGhlIHNhbWUgcmVhc29uIExlYXJuaW5nT2JqZWN0aXZlcy5pdGVtc1xuLy8gbWF5IGJlIFx1MjAxNCBhbiBhbGwtdW5tYXBwYWJsZSByb3VuZCB0cmlwIChlLmcuIGEgc2luZ2xlIGVtcHR5IGltYWdlKSBtdXN0IG5vdFxuLy8gZmFpbCBwdWJsaXNoIHZhbGlkYXRpb24uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgY29uc3QgV29ya2VkRXhhbXBsZUNoaWxkID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFBhcmFncmFwaEJsb2NrLFxuICBIZWFkaW5nQmxvY2ssXG4gIE1hdGhCbG9jayxcbiAgSW1hZ2VCbG9jayxcbiAgQnVsbGV0TGlzdEJsb2NrLFxuICBPcmRlcmVkTGlzdEJsb2NrLFxuXSk7XG5leHBvcnQgdHlwZSBXb3JrZWRFeGFtcGxlQ2hpbGQgPSB6LmluZmVyPHR5cGVvZiBXb3JrZWRFeGFtcGxlQ2hpbGQ+O1xuXG5leHBvcnQgY29uc3QgV29ya2VkRXhhbXBsZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnd29ya2VkX2V4YW1wbGUnKSxcbiAgdGl0bGU6IHouc3RyaW5nKCksXG4gIGNvbnRlbnQ6IHouYXJyYXkoV29ya2VkRXhhbXBsZUNoaWxkKSxcbn0pO1xuZXhwb3J0IHR5cGUgV29ya2VkRXhhbXBsZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgV29ya2VkRXhhbXBsZUJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IFBhcmFncmFwaEJsb2NrIH0gZnJvbSAnLi9wYXJhZ3JhcGguanMnO1xuaW1wb3J0IHsgSGVhZGluZ0Jsb2NrIH0gZnJvbSAnLi9oZWFkaW5nLmpzJztcbmltcG9ydCB7IE1hdGhCbG9jayB9IGZyb20gJy4vbWF0aC1ibG9jay5qcyc7XG5pbXBvcnQgeyBJbWFnZUJsb2NrIH0gZnJvbSAnLi9pbWFnZS5qcyc7XG5pbXBvcnQgeyBCdWxsZXRMaXN0QmxvY2ssIE9yZGVyZWRMaXN0QmxvY2sgfSBmcm9tICcuL2xpc3QuanMnO1xuaW1wb3J0IHsgRmlsbEluQmxhbmtCbG9jayB9IGZyb20gJy4vZmlsbC1pbi1ibGFuay5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrIFx1MjAxNCBhIHNjYWZmb2xkZWQgKFwiZmFkZWRcIikgd29ya2VkIGV4YW1wbGUuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGludGVyYWN0aXZlIHNpYmxpbmcgb2Ygd29ya2VkX2V4YW1wbGUgKFJlbmtsL0F0a2luc29uIGNvbXBsZXRpb25cbi8vIHByb2JsZW1zKTogZWFybHkgc3RlcHMgYXJlIGZ1bGx5IHNob3duLCBsYXRlciBzdGVwcyBhcmUgRkFERUQgXHUyMDE0IHRoZSBzdHVkZW50XG4vLyBmaWxscyB0aGVtIGluLiBTdHJ1Y3R1cmFsbHkgaXQncyBhIHdvcmtlZF9leGFtcGxlIGZyYW1lIHdob3NlIGNoaWxkIHVuaW9uXG4vLyBBTFNPIGFkbWl0cyBmaWxsX2luX2JsYW5rIGJsb2NrczogYSBzaG93biBzdGVwIGlzIGEgcGFyYWdyYXBoIC8gYmxvY2sgbWF0aCAvXG4vLyBsaXN0IC8gaW1hZ2U7IGEgZmFkZWQgc3RlcCBpcyBhIGZpbGxfaW5fYmxhbmsgYmxvY2sgY2FycnlpbmcgdGhlIGJsYW5rcy5cbi8vXG4vLyBSZXVzZSBvdmVyIHJlaW52ZW50aW9uIChkZWNpZGVkIGF0IGRlc2lnbiwgMjAyNi0wNy0xMik6XG4vLyAgIC0gVGhlIGZhZGVkIHN0ZXBzIEFSRSBmaWxsX2luX2JsYW5rIGJsb2Nrcywgc28gdGhlIHJ1bnRpbWUgc2NvcmVzIHRoZW0gd2l0aFxuLy8gICAgIFpFUk8gbmV3IHJ1bnRpbWUgY29kZSBcdTIwMTQgaW5pdC50cyBhbHJlYWR5IHNjYW5zIGVhY2ggLmFjdGl2aXR5LXNlY3Rpb24gZm9yXG4vLyAgICAgYFtkYXRhLWJsb2NrLXR5cGU9XCJmaWxsX2luX2JsYW5rXCJdYCBhbmQgZmluZHMgTkVTVEVEIG9uZXMuIFRoZXkgcmlkZSB0aGVcbi8vICAgICBleGlzdGluZyBCbGFua1Jlc3BvbnNlIG1hcCwgc28gdGhlcmUgaXMgTk8gc3VibWlzc2lvbiB3aXJlL3N0b3JhZ2UgYnVtcC5cbi8vICAgLSBTY29yaW5nIHJpZGVzIHRoZSBjaGlsZCBibGFua3M7IHRoaXMgZnJhbWUgcmVhZHMgbm8gdHlwZS1zcGVjaWZpY1xuLy8gICAgIGF0dHJpYnV0ZXMgaXRzZWxmIFx1MjE5MiBpdCBpcyBhIENPTlRBSU5FUiAobGlrZSBgcHJvYmxlbWApLCBub3QgSU5URVJBQ1RJVkUuXG4vLyAgIC0gTnVtYmVyaW5nIChyZXZpc2VkIDIwMjYtMDctMTMpOiB0aGUgV0hPTEUgYm94IGlzIG9uZSBudW1iZXJlZCBwcm9ibGVtIFx1MjAxNFxuLy8gICAgIGl0cyBudW1iZXIgbGVhZHMgdGhlIHRpdGxlLCBhbmQgdGhlIGZhZGVkIGZpbGxfaW5fYmxhbmsgc3RlcHMgYXJlIGxldHRlcmVkXG4vLyAgICAgKGEpLyhiKVx1MjAyNiBMT0NBTExZIChzaG93U3RlcExhYmVscyB0b2dnbGVzIHRoZW0gb2ZmKSwgc28gdGhleSBubyBsb25nZXJcbi8vICAgICBjb25zdW1lIHdvcmtzaGVldCBwcm9ibGVtIG51bWJlcnMuIFNlZSByZW5kZXJGYWRlZFdvcmtlZEV4YW1wbGUgYW5kIHRoZVxuLy8gICAgIGVkaXRvcidzIHByb2JsZW1OdW1iZXJBdCAod2hpY2ggdHJlYXRzIHRoZSBib3ggYXMgYXRvbWljKS4gVGhpcyByZXZlcnNlZFxuLy8gICAgIHRoZSBvcmlnaW5hbCBcInN0ZXBzIG51bWJlciBhcyBvcmRpbmFyeSBwcm9ibGVtc1wiIGNob2ljZSwgd2hpY2ggd2FzdGVkXG4vLyAgICAgd3JpdGluZy9wcmludCB3aWR0aCBhbmQgcG9sbHV0ZWQgdGhlIHdvcmtzaGVldCdzIG51bWJlcmluZy5cbi8vXG4vLyBUaGUgY2hpbGQgdW5pb24gc3RpbGwgZXhjbHVkZXMgcXVlc3Rpb25zIE9USEVSIHRoYW4gZmlsbF9pbl9ibGFuaywgcGx1c1xuLy8gY29sdW1ucyAvIHdvcmtlZF9leGFtcGxlIC8gZmFkZWRfd29ya2VkX2V4YW1wbGUgaXRzZWxmIFx1MjAxNCBzbyBuZXN0aW5nXG4vLyB0ZXJtaW5hdGVzIGFuZCB0aGUgZGFzaGJvYXJkIGluZGV4IHJlY3Vyc2VzIG9ubHkgb25lIHByZWRpY3RhYmxlIGxldmVsLlxuLy8gYGNvbnRlbnRgIG1heSBiZSBlbXB0eSBmb3IgdGhlIHNhbWUgcm91bmQtdHJpcC1zYWZldHkgcmVhc29uIGFzXG4vLyB3b3JrZWRfZXhhbXBsZS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBjb25zdCBGYWRlZFdvcmtlZEV4YW1wbGVDaGlsZCA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBQYXJhZ3JhcGhCbG9jayxcbiAgSGVhZGluZ0Jsb2NrLFxuICBNYXRoQmxvY2ssXG4gIEltYWdlQmxvY2ssXG4gIEJ1bGxldExpc3RCbG9jayxcbiAgT3JkZXJlZExpc3RCbG9jayxcbiAgRmlsbEluQmxhbmtCbG9jayxcbl0pO1xuZXhwb3J0IHR5cGUgRmFkZWRXb3JrZWRFeGFtcGxlQ2hpbGQgPSB6LmluZmVyPHR5cGVvZiBGYWRlZFdvcmtlZEV4YW1wbGVDaGlsZD47XG5cbmV4cG9ydCBjb25zdCBGYWRlZFdvcmtlZEV4YW1wbGVCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2ZhZGVkX3dvcmtlZF9leGFtcGxlJyksXG4gIHRpdGxlOiB6LnN0cmluZygpLFxuICBjb250ZW50OiB6LmFycmF5KEZhZGVkV29ya2VkRXhhbXBsZUNoaWxkKSxcbiAgLy8gVGhlIHdob2xlIGJveCBpcyBPTkUgbnVtYmVyZWQgcHJvYmxlbSAoaXRzIG51bWJlciBsZWFkcyB0aGUgdGl0bGUpOyB0aGVcbiAgLy8gZmFkZWQgZmlsbF9pbl9ibGFuayBzdGVwcyBhcmUgbGV0dGVyZWQgKGEpLCAoYilcdTIwMjYgV0lUSElOIHRoZSBib3ggaW5zdGVhZCBvZlxuICAvLyBjb25zdW1pbmcgd29ya3NoZWV0IHByb2JsZW0gbnVtYmVycy4gc2hvd1N0ZXBMYWJlbHMgdG9nZ2xlcyB0aG9zZSBsZXR0ZXJzXG4gIC8vIG9mZiBwZXIgYm94IChiYXJlIGJsYW5rcywgbm8gZ3V0dGVyKSBmb3IgdGVhY2hlcnMgd2hvIHdhbnQgbWF4aW11bSB3cml0aW5nXG4gIC8vIHJvb20uIERlZmF1bHRlZCBzbyBwcmUtZXhpc3RpbmcgZG9jdW1lbnRzIChubyBmaWVsZCkgcmVuZGVyIGxhYmVsbGVkLlxuICBzaG93U3RlcExhYmVsczogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgLy8gVGhlIGJveCdzIE9XTiBwYWdlIGxhYmVsICh2aWV3ZXItbnVtYmVyaW5nIE42KS4gSXQgaGFzIGFsd2F5cyBiZWVuIG9uZVxuICAvLyBudW1iZXJlZCBwcm9ibGVtOyB0aGlzIGlzIHdoYXQgbGV0cyBhIHRlYWNoZXIgcmVsYWJlbCBpdCAoXCJXYXJtLXVwXCIpIG9yXG4gIC8vIHVubnVtYmVyIGl0LCB0aGUgc2FtZSB2b2NhYnVsYXJ5IGV2ZXJ5IG90aGVyIG51bWJlcmVkIHR5cGUgYWxyZWFkeSBoYWQuXG4gIC8vIERpc3RpbmN0IGZyb20gc2hvd1N0ZXBMYWJlbHMsIHdoaWNoIGdvdmVybnMgdGhlIChhKS8oYikgbGV0dGVycyBJTlNJREUgdGhlXG4gIC8vIGJveCBcdTIwMTQgdGhhdCBvbmUgaXMgYWJvdXQgdGhlIHN0ZXBzLCB0aGlzIG9uZSBpcyBhYm91dCB0aGUgYm94LlxuICAuLi5sYWJlbEZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgRmFkZWRXb3JrZWRFeGFtcGxlQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBGYWRlZFdvcmtlZEV4YW1wbGVCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFNlbGZFeHBsYW5hdGlvbkJsb2NrIFx1MjAxNCBhbiB1bmdyYWRlZCBmcmVlLXRleHQgcmVmbGVjdGlvbiBwcm9tcHQuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gTWV0YWNvZ25pdGl2ZSBzZWxmLWV4cGxhbmF0aW9uIChDaGkgZXQgYWwuKTogdGhlIHN0dWRlbnQgd3JpdGVzIFdIWSwgaW4gdGhlaXJcbi8vIG93biB3b3Jkcy4gRGVsaWJlcmF0ZWx5IFVOR1JBREVEIChhdXRob3IgZGVjaXNpb24sIDIwMjYtMDctMTIpIFx1MjAxNCB0aGUgcnVudGltZVxuLy8gY2FwdHVyZXMgdGhlIHRleHQgYW5kIHRoZSB0ZWFjaGVyIGRhc2hib2FyZCBzaG93cyBpdCByYXc7IHRoZXJlIGlzIG5vIGFuc3dlclxuLy8ga2V5LCBubyBjb3JyZWN0L2luY29ycmVjdCwgYW5kIGl0IG5ldmVyIGNvbnRyaWJ1dGVzIHRvIHRoZSBzY29yZS4gVGhpcyBrZWVwc1xuLy8gaXQgY2xlYXIgb2YgUGhhc2UgMi42IHJ1YnJpYyBncmFkaW5nLlxuLy9cbi8vIEl0IGlzIHRoZSBGSVJTVCBmcmVlLXRleHQgcmVzcG9uc2UgdHlwZSwgc28gaXQgaW50cm9kdWNlcyB0aGUgYGZyZWVSZXNwb25zZXNgXG4vLyBtYXAgb24gU3VibWlzc2lvblJlc3BvbnNlcyAod2lyZSB2OCBcdTIxOTIgdjkpIFx1MjAxNCB0aGUgbWFwIG5hbWUgdGhlIHNjaGVtYSByZXNlcnZlZFxuLy8gZm9yIGV4YWN0bHkgdGhpcyBzaGFwZS4gUGhhc2UgMi42IHNob3J0X2Fuc3dlciAvIGVzc2F5IHJldXNlIHRoZSBzYW1lIG1hcCAoYVxuLy8gc3RyaW5nIHBlciBibG9jaykgd2l0aCBubyBmdXJ0aGVyIHdpcmUgYnVtcDsgZ3JhZGluZywgd2hlbiBpdCBsYW5kcywgbGl2ZXMgaW5cbi8vIGEgc2VwYXJhdGUgdGFibGUsIG5vdCBpbiB0aGUgcmVzcG9uc2Ugc2hhcGUuXG4vL1xuLy8gU2hhcGU6IGEgYHByb21wdGAgKHJpY2ggaW5saW5lIFx1MjAxNCB0ZXh0ICsgaW5saW5lIG1hdGggKyBtYXJrcywgbGlrZSBldmVyeSBvdGhlclxuLy8gcXVlc3Rpb24gcHJvbXB0KSBwbHVzIGFuIG9wdGlvbmFsIGBwbGFjZWhvbGRlcmAgKGEgc2VudGVuY2Utc3RhcnRlciAvIGhpbnRcbi8vIHNob3duIGluIHRoZSBlbXB0eSB0ZXh0YXJlYSkuIE5vIGFuc3dlciBrZXkuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgY29uc3QgU2VsZkV4cGxhbmF0aW9uQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdzZWxmX2V4cGxhbmF0aW9uJyksXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgcGxhY2Vob2xkZXI6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgU2VsZkV4cGxhbmF0aW9uQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBTZWxmRXhwbGFuYXRpb25CbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gZnJlZS1yZXNwb25zZS50cyBcdTIwMTQgc2hvcnRfYW5zd2VyICsgZXNzYXkgKG1hbnVhbGx5LWdyYWRlZCBmcmVlIHRleHQpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIFBoYXNlIDIuNiBncmFkZWQgZnJlZS10ZXh0IHNpYmxpbmdzIG9mIHNlbGZfZXhwbGFuYXRpb24uIEFsbCB0aHJlZSB3cml0ZVxuLy8gdGhlaXIgc3R1ZGVudCB0ZXh0IGludG8gdGhlIFNBTUUgYGZyZWVSZXNwb25zZXNgIG1hcCAod2lyZSB2OSkgXHUyMDE0IHRoZSByZXNwb25zZVxuLy8gc2hhcGUgaXMgaWRlbnRpY2FsIChhIHN0cmluZyk7IHdoYXQgZGlmZmVycyBpcyBpbnRlbnQgKyBncmFkaW5nOlxuLy8gICAtIHNlbGZfZXhwbGFuYXRpb24gXHUyMDE0IHVuZ3JhZGVkIHJlZmxlY3Rpb24gKGFscmVhZHkgc2hpcHBlZCkuXG4vLyAgIC0gc2hvcnRfYW5zd2VyICAgICBcdTIwMTQgYSBicmllZiBncmFkZWQgcmVzcG9uc2UgKG1hbnVhbCBydWJyaWMgZ3JhZGluZywgMi42KS5cbi8vICAgLSBlc3NheSAgICAgICAgICAgIFx1MjAxNCBhIGxvbmcgZ3JhZGVkIHJlc3BvbnNlOyBhZGRzIG9wdGlvbmFsIHdvcmQtY291bnRcbi8vICAgICAgICAgICAgICAgICAgICAgICAgZ3VpZGFuY2UgKGEgdGFyZ2V0IHJhbmdlIHNob3duIGFzIGEgbGl2ZSBjb3VudGVyKS5cbi8vIEdyYWRpbmcgaXRzZWxmIGxpdmVzIGluIGEgc2VwYXJhdGUgYGdyYWRlc2AgdGFibGUgKFBoYXNlIDIuNiBsYXRlciBzbGljZXMpLFxuLy8gbmV2ZXIgaW4gdGhlIHN1Ym1pc3Npb24ganNvbmIgXHUyMDE0IGdyYWRlcyBhcmUgbXV0YWJsZSwgc3VibWlzc2lvbnMgYXJlIG5vdC4gVGhlc2Vcbi8vIGJsb2NrcyBhcmUgbmV2ZXIgQVVUTy1zY29yZWQgYnkgdGhlIHJ1bnRpbWUuXG4vL1xuLy8gXHUyNkEwIEFNRU5ERUQgMjAyNi0wOC0yMCAoYW5zd2VyLWtleSBzbGljZSwgcnVsaW5nIEUyIFx1MjAxNCB0aGlzIGNvbW1lbnQgaXMgYW1lbmRlZFxuLy8gaW4gdGhlIGNvbW1pdCB0aGF0IGNoYW5nZXMgd2hhdCBpdCBkZXNjcmliZXMsIFA1KS4gVGhlIGxpbmUgYWJvdmUgdXNlZCB0b1xuLy8gcmVhZCBcImNhcnJ5IE5PIGFuc3dlciBrZXlcIi4gVGhleSBub3cgTUFZIGNhcnJ5IG9uZSwgYW5kIHRoZSBkaXN0aW5jdGlvbiB0aGF0XG4vLyByZXBsYWNlZCBpdCBpcyB0aGUgbG9hZC1iZWFyaW5nIG9uZTpcbi8vXG4vLyAgIGFuc3dlciAgIFx1MjAxNCB0aGUgY2Fub25pY2FsIGFuc3dlciAvIG1hcmtpbmcgZ3VpZGUuIFRlYWNoZXItb25seSBtYXRlcmlhbCwgb25cbi8vICAgICAgICAgICAgICBFVkVSWSBjaGFubmVsOiB0aGUgcmVnaXN0cnkgc3RyaXBzIGl0IGZyb20gdGhlIHNlcnZlZCBkb2N1bWVudFxuLy8gICAgICAgICAgICAgIGFuZCBub3RoaW5nIGV2ZXIgcmV0dXJucyBpdCB0byBhIHN0dWRlbnQuIEl0IGV4aXN0cyBzbyB0aGVcbi8vICAgICAgICAgICAgICBwcmludGVkIGFuc3dlciBrZXkgaGFzIHNvbWV0aGluZyB0byBwcmludCAoYW5kIHNvIHRoZSBmdXR1cmVcbi8vICAgICAgICAgICAgICBzY2FuLWdyYWRpbmcgYXJjIGhhcyBhIGtleSB0byBncmFkZSBhIHBob3RvIGFnYWluc3QpLiBBIGJsb2NrXG4vLyAgICAgICAgICAgICAgdGhhdCBpcyBtYW51YWxseSBncmFkZWQgc3RpbGwgSEFTIGEgcmlnaHQgYW5zd2VyOyB3aGF0IGl0IGxhY2tzXG4vLyAgICAgICAgICAgICAgaXMgYSBtYWNoaW5lIHRoYXQgY2FuIHJlY29nbmlzZSBvbmUuXG4vLyAgIHNvbHV0aW9uIFx1MjAxNCB0aGUgcG9zdC1jaGVjayBleHBsYW5hdGlvbiwgaWRlbnRpY2FsIGluIGtpbmQgYW5kIGluIHJlbGVhc2Vcbi8vICAgICAgICAgICAgICBydWxlIHRvIGV2ZXJ5IG90aGVyIGJsb2NrJ3MgYHNvbHV0aW9uYDogc3RyaXBwZWQgZnJvbSB0aGUgcmVhZFxuLy8gICAgICAgICAgICAgIHBhdGgsIHJldHVybmVkIGJ5IHRoZSBjaGVjayByZXNwb25zZSBhZnRlciB0aGUgc2VjdGlvbiBpc1xuLy8gICAgICAgICAgICAgIGNoZWNrZWQgKHdhbGsudHMgY29sbGVjdHMgaXQgR0VORVJJQ0FMTFksIHNvIG5vIGdyYWRpbmctZW5naW5lXG4vLyAgICAgICAgICAgICAgY29kZSB3YXMgYWRkZWQgZm9yIHRoaXMpLCBhbmQgcmV2ZWFsZWQgYnkgdGhlIGNvbXBvbmVudC5cbi8vXG4vLyBCb3RoIGFyZSBJbmxpbmVOb2RlW10gXHUyMDE0IGEgd29ya2VkIGFuc3dlciB3YW50cyBmb3JtYXR0aW5nIGFuZCBpbmxpbmUgbWF0aCwgYW5kXG4vLyBhIG11bHRpLWxpbmUgb25lIGFycml2ZXMgZnJvbSB0aGUgaW1wb3J0ZXIgYXMgaGFyZCBicmVha3MuIEJvdGggYXJlIE9QVElPTkFMOlxuLy8gYW4gdW5hbnN3ZXJlZCBmcmVlLXJlc3BvbnNlIGJsb2NrIGlzIHN0aWxsIGEgdmFsaWQgYmxvY2ssIGFuZCB0aGUgYW5zd2VyIGtleVxuLy8gcHJpbnRzIFwibWFudWFsbHkgZ3JhZGVkIFx1MjAxNCBzZWUgcnVicmljXCIgZm9yIGl0ICh0aGUgZXh0cmFjdG9yJ3MgZmFsbGJhY2sgY2hhaW5cbi8vIGlzIGFuc3dlciBcdTIxOTIgc29sdXRpb24gXHUyMTkyIHRoYXQgcGhyYXNlOyBzZWUgdmlld2VyL3NyYy9hbnN3ZXIta2V5L2V4dHJhY3QudHMpLlxuLy9cbi8vIEU4J3MgY29udmVudGlvbiwgcmVjb3JkZWQgYmVjYXVzZSBpdCBpcyBOT1Qgc2NoZW1hOiBgYW5zd2VyYCBjYXJyaWVzIFdIQVQgaXNcbi8vIGNvcnJlY3Q7IGEgYHJ1YnJpY2AgY2FycmllcyBIT1cgTUFOWSBwb2ludHMgKHBlci1jcml0ZXJpb24gbWF4UG9pbnRzKSB3aGVuIGFcbi8vIHF1ZXN0aW9uIGlzIHdvcnRoIG1vcmUgdGhhbiBvbmU7IG5vIHJ1YnJpYyA9IGEgMS1wb2ludCBxdWVzdGlvbi4gVGhlcmUgaXNcbi8vIGRlbGliZXJhdGVseSBubyBwb2ludHMgZmllbGQgaGVyZSBcdTIwMTQgdGhlIGZ1bGwgbWFya2luZyBjb250cmFjdCBiZWxvbmdzIHRvXG4vLyBkb2NzL2Rlc2lnbi9waG90by1ncmFkaW5nLm1kJ3Mgb3duIGRlc2lnbiBwYXNzLlxuLy9cbi8vIHdvcmRDb3VudEhpbnQgKGVzc2F5IG9ubHkpOiBhbiBvcHRpb25hbCB7bWluPywgbWF4P30gdGFyZ2V0LiBUaGUgcmVuZGVyZXJcbi8vIHNob3dzIGEgbGl2ZSB3b3JkIGNvdW50ZXI7IHRoZSBjb3VudCBpdHNlbGYgaXMgY29tcHV0ZWQtb24tcmVhZCAobmV2ZXIgc3RvcmVkXG4vLyBpbiB0aGUgd2lyZSBcdTIwMTQgaXQncyBkZXJpdmFibGUgZnJvbSB0aGUgdGV4dCksIHNvIHRoaXMgaXMgZGlzcGxheSBndWlkYW5jZSBvbmx5LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gT25lIHJ1YnJpYyBjcml0ZXJpb246IGEgbGFiZWwgKFwiVGhlc2lzIGNsYXJpdHlcIiksIHRoZSBwb2ludHMgaXQncyB3b3J0aCwgYW5kXG4vLyBhbiBvcHRpb25hbCBkZXNjcmlwdGlvbiBvZiB3aGF0IGZ1bGwgY3JlZGl0IGxvb2tzIGxpa2UuIExldmVsZWQgZGVzY3JpcHRvclxuLy8gZ3JpZHMgKDQvMy8yLzEgY29sdW1ucykgYXJlIGEgZnV0dXJlIEFERElUSVZFIGV4dGVuc2lvbiBvZiB0aGlzIHNoYXBlLlxuZXhwb3J0IGNvbnN0IFJ1YnJpY0NyaXRlcmlvbiA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICBsYWJlbDogei5zdHJpbmcoKS5taW4oMSksXG4gIG1heFBvaW50czogei5udW1iZXIoKS5wb3NpdGl2ZSgpLmZpbml0ZSgpLFxuICBkZXNjcmlwdGlvbjogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBSdWJyaWNDcml0ZXJpb24gPSB6LmluZmVyPHR5cGVvZiBSdWJyaWNDcml0ZXJpb24+O1xuXG4vLyBBIGJsb2NrJ3MgZ3JhZGluZyBydWJyaWMuIExpdmVzIElOIHRoZSBkb2N1bWVudCAoYXV0aG9yIGRlY2lzaW9uIDIwMjYtMDctMTMsXG4vLyBkb2NzL2Rlc2lnbi9tYW51YWwtZ3JhZGluZy5tZCk6IHN1Ym1pc3Npb25zIHBpbiB0byBhY3Rpdml0eV92ZXJzaW9ucywgc28gdGhlXG4vLyBncmFkaW5nIFVJIHJlYWRzIHRoZSBleGFjdCBydWJyaWMgdGhlIHN0dWRlbnQgd2FzIGFzc2Vzc2VkIGFnYWluc3QgXHUyMDE0IHZlcnNpb25cbi8vIHBpbm5pbmcgSVMgdGhlIFwicnVicmljIGVkaXRzIGFwcGx5IHByb3NwZWN0aXZlbHlcIiBtZWNoYW5pc20uIFRoZSByZW5kZXJlclxuLy8gbmV2ZXIgZW1pdHMgaXQgKHRlYWNoZXItc2lkZSBkYXRhOyBzdGF5cyBvdXQgb2Ygc3R1ZGVudCBIVE1MKS4gR3JhZGVzXG4vLyB0aGVtc2VsdmVzIGFyZSBtdXRhYmxlIGFuZCBsaXZlIGluIHRoZSBgZ3JhZGVzYCBUQUJMRSwga2V5ZWQgYnlcbi8vIChzdWJtaXNzaW9uX2lkLCBibG9ja19pZCkgKyBjcml0ZXJpb24gaWQuXG5leHBvcnQgY29uc3QgUnVicmljID0gei5vYmplY3Qoe1xuICBjcml0ZXJpYTogei5hcnJheShSdWJyaWNDcml0ZXJpb24pLm1pbigxKSxcbn0pO1xuZXhwb3J0IHR5cGUgUnVicmljID0gei5pbmZlcjx0eXBlb2YgUnVicmljPjtcblxuLy8gVGhlIHR3byB0ZWFjaGVyLW9ubHkgYW5zd2VyIGZpZWxkcyBib3RoIGJsb2NrcyBjYXJyeSAocnVsaW5nIEUyICsgRTQnc1xuLy8gcGFyaXR5OiBvbmUgc2NoZW1hIHJvdW5kIGZvciB0aGUgcGFpciwgbmV2ZXIgdHdvKS4gRGVjbGFyZWQgb25jZSBoZXJlIHNvIHRoZVxuLy8gdHdvIGJsb2NrIHNoYXBlcyBjYW5ub3QgZHJpZnQgYXBhcnQgZmllbGQtYnktZmllbGQuXG4vL1xuLy8gXHUyNkEwIEJPVEggQkxPQ0tTIEFMU08gQ0FSUlkgYGxhYmVsRmllbGRzYCBzaW5jZSB0aGUgdmlld2VyLW51bWJlcmluZyBzbGljZVxuLy8gKHJ1bGluZyBONikuIFJ1bGluZyBFNyBtYWRlIHRoZW0gcGFnZS1udW1iZXJlZCwgYW5kIHVudGlsIE42IHRoZXkgd2VyZSB0aGVcbi8vIG9ubHkgbnVtYmVyZWQgdHlwZXMgd2l0aCBubyB3YXkgdG8gb3B0IG91dCBcdTIwMTQgYSB0ZWFjaGVyIGNvdWxkIG5vdCBtYXJrIGFcbi8vIHJlZmxlY3Rpb24tc3R5bGUgc2hvcnQgYW5zd2VyIGFzIHVubnVtYmVyZWQgZXZlbiB0aG91Z2ggdGhlIHNjaGVtYSBoYXMgaGFkXG4vLyB0aGF0IHZvY2FidWxhcnkgKGF1dG8gLyBjdXN0b20gLyBub25lKSBzaW5jZSB0aGUgbnVtYmVyaW5nLWxhYmVsIGRlY291cGxlLlxuLy8gVGhlIGZpZWxkIGlzIE5PVCBlbm91Z2ggb24gaXRzIG93bjogYGxhYmVsYCBvbmx5IHN1cnZpdmVzIGEgc2F2ZSBpZiB0aGUgdHlwZVxuLy8gaXMgYWxzbyBpbiBzZXJpYWxpemUudHMncyBMQUJFTEVEX0JMT0NLX1RZUEVTLCBhbmQgb25seSByZWFjaGVzIGFuIGF1dGhvciBpZlxuLy8gYmxvY2tDb250cm9scy50cyBhdHRhY2hlcyBgbnVtYmVyaW5nR3JvdXBgLiBTZWUgdGhlIHBsYW4ncyBmb3VyLWxpbmsgY2hhaW5cbi8vIChkb2NzL2Rlc2lnbi92aWV3ZXItbnVtYmVyaW5nLm1kLCBEOCkgXHUyMDE0IGxpbmsgMSBpcyBoZXJlLlxuY29uc3QgYW5zd2VyRmllbGRzID0ge1xuICAvKiogVGhlIGNhbm9uaWNhbCBhbnN3ZXIgLyBtYXJraW5nIGd1aWRlLiBUZWFjaGVyLW9ubHkgb24gZXZlcnkgY2hhbm5lbC4gKi9cbiAgYW5zd2VyOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIC8qKiBUaGUgcG9zdC1jaGVjayBleHBsYW5hdGlvbiBcdTIwMTQgc2FtZSByZWxlYXNlIHJ1bGUgYXMgZXZlcnkgb3RoZXIgYHNvbHV0aW9uYC4gKi9cbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbn07XG5cbmV4cG9ydCBjb25zdCBTaG9ydEFuc3dlckJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnc2hvcnRfYW5zd2VyJyksXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgcGxhY2Vob2xkZXI6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgcnVicmljOiBSdWJyaWMub3B0aW9uYWwoKSxcbiAgLi4uYW5zd2VyRmllbGRzLFxuICAuLi5sYWJlbEZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgU2hvcnRBbnN3ZXJCbG9jayA9IHouaW5mZXI8dHlwZW9mIFNob3J0QW5zd2VyQmxvY2s+O1xuXG5leHBvcnQgY29uc3QgV29yZENvdW50SGludCA9IHpcbiAgLm9iamVjdCh7XG4gICAgbWluOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgICBtYXg6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICB9KVxuICAvLyBHdWFyZCBhZ2FpbnN0IGFuIGludmVydGVkIHJhbmdlIChtaW4gPiBtYXgpIFx1MjAxNCBhIG5vbnNlbnNlIGhpbnQgdGhlIGVkaXRvclxuICAvLyBzaG91bGRuJ3QgYmUgYWJsZSB0byBwcm9kdWNlLCBidXQgdmFsaWRhdGlvbiBpcyB0aGUgc2NoZW1hJ3Mgam9iLlxuICAucmVmaW5lKFxuICAgIChoKSA9PiBoLm1pbiA9PT0gdW5kZWZpbmVkIHx8IGgubWF4ID09PSB1bmRlZmluZWQgfHwgaC5taW4gPD0gaC5tYXgsXG4gICAgeyBtZXNzYWdlOiAnd29yZENvdW50SGludC5taW4gbXVzdCBiZSBcdTIyNjQgbWF4JyB9LFxuICApO1xuZXhwb3J0IHR5cGUgV29yZENvdW50SGludCA9IHouaW5mZXI8dHlwZW9mIFdvcmRDb3VudEhpbnQ+O1xuXG5leHBvcnQgY29uc3QgRXNzYXlCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2Vzc2F5JyksXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgcGxhY2Vob2xkZXI6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgd29yZENvdW50SGludDogV29yZENvdW50SGludC5vcHRpb25hbCgpLFxuICBydWJyaWM6IFJ1YnJpYy5vcHRpb25hbCgpLFxuICAuLi5hbnN3ZXJGaWVsZHMsXG4gIC4uLmxhYmVsRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBFc3NheUJsb2NrID0gei5pbmZlcjx0eXBlb2YgRXNzYXlCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBGaWxsSW5CbGFua0lubGluZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFRhYmxlQmxvY2sgXHUyMDE0IGEgcmVhbCB0YWJsZSwgd2hvc2UgY2VsbHMgY2FuIGhvbGQgYmxhbmtzLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFBsYW4gKyBydWxpbmdzOiBkb2NzL2Rlc2lnbi90YWJsZS1ibG9jay5tZCAoZW5nIHJldmlldyAyMDI2LTA4LTIxKS5cbi8vXG4vLyBXSFkgVEhJUyBFWElTVFMgQVQgQUxMLiBUaGUgYGBgY29sdW1ucyB3b3JrYXJvdW5kIFBSSU5UUyBzb21ldGhpbmcgdGhhdCBsb29rc1xuLy8gbGlrZSBhIHRhYmxlIGFuZCBpcyBub3Qgb25lOiB0aGUgZGl2aWRlciBydWxlIGlzIGRyYXduIHBlciBDT0xVTU4sXG4vLyBpbmRlcGVuZGVudGx5LCBzbyByb3dzIGxpbmUgdXAgb25seSB3aGlsZSBldmVyeSBjZWxsIGhhcHBlbnMgdG8gYmUgb25lIGxpbmVcbi8vIHRhbGwuIEdpdmUgb25lIGNlbGwgYSBsYWJlbCB0aGF0IHdyYXBzIGFuZCB0aGUgdHdvIGNvbHVtbnMnIGRpdmlkZXJzIGRlc3luYyxcbi8vIGJlY2F1c2UgdGhlcmUgaXMgbm8gcm93IGNvbmNlcHQgaW4gdGhlIERPTSBob2xkaW5nIGEgcm93IHRvZ2V0aGVyLlxuLy9cbi8vIFx1MjZBMFx1MjZBMCBUSEUgT05FIFJVTEUgVEhBVCBNQUtFUyBUSEUgV0hPTEUgREVTSUdOIFdPUks6IGBUYWJsZVJvd2AgYW5kIGBUYWJsZUNlbGxgXG4vLyBDQVJSWSBOTyBgdHlwZWAgRklFTEQsIEFORCBNVVNUIE5FVkVSIEdBSU4gT05FLlxuLy9cbi8vIEZvdXIgc2VwYXJhdGUgd2Fsa3MgZmluZCBibGFua3MgYW5kIG1hdGggZ2FwcyBzdHJ1Y3R1cmFsbHksIGF0IGFueSBkZXB0aCBcdTIwMTRcbi8vIHRoZSBzYW5pdGl6ZXIncyBpbi1iYW5kIHN0cmlwLCB0aGUgY2xpZW50J3MgY2hlY2stcGF5bG9hZCBpbmRleFxuLy8gKGNvbnRhaW5lci9ibG9ja0luZGV4LnRzKSwgdGhlIHNlcnZlcidzIGdyYWRpbmcga2V5c1xuLy8gKHNlcnZlci9ncmFkaW5nL3dhbGsudHMpLCBhbmQgdGhlIHRlYWNoZXIncyBhbnN3ZXIga2V5IChhbnN3ZXIta2V5L2V4dHJhY3QpLlxuLy8gVGhyZWUgb2YgdGhlbSBzdG9wIGRlc2NlbmRpbmcgYXQgYGxvb2tzTGlrZUJsb2NrQXJyYXlgLCB3aGljaCBmaXJlcyBvbiBhbnlcbi8vIGFycmF5IHdob3NlIGVsZW1lbnRzIEFMTCBjYXJyeSBib3RoIGEgc3RyaW5nIGBpZGAgYW5kIGEgc3RyaW5nIGB0eXBlYC4gUm93c1xuLy8gYW5kIGNlbGxzIGhhdmUgYW4gYGlkYCBhbmQgbm8gYHR5cGVgLCBzbyB0aG9zZSB3YWxrcyBkZXNjZW5kIGludG8gdGhlbSBhbmQgYVxuLy8gYmxhbmsgaW4gYSBjZWxsIGlzIGdyYWRlZCwgY2hlY2tlZCBhbmQga2V5ZWQgd2l0aCBaRVJPIG5ldyBjb2RlLlxuLy9cbi8vIEFkZCBgdHlwZTogJ3RhYmxlX3JvdydgIFx1MjAxNCB0aGUgc2hhcGUgYSBzY2hlbWEgYXV0aG9yIHJlYWNoZXMgZm9yIGJ5IHJlZmxleCBcdTIwMTRcbi8vIGFuZCB0aHJlZSBvZiB0aGUgZm91ciB3YWxrcyBza2lwIHRoZSBlbnRpcmUgdGFibGUuIFRoZSBzYW5pdGl6ZXIgZG9lcyBOT1Rcbi8vIHN0b3AgYXQgYmxvY2sgYXJyYXlzLCBzbyBub3RoaW5nIGxlYWtzOyB0aGUgYW5zd2VyIGlzIHNpbXBseSBuZXZlciBHUkFERUQuXG4vLyB3YWxrLnRzIGNhbGxzIHRoYXQgXCJ0aGUgd29yc3Qga2luZFwiIG9mIGZhaWx1cmU6IHN1Ym1pdHRlZCwgc3RvcmVkLCBuZXZlclxuLy8gc2NvcmVkLiBUaGUgZ3VhcmQgYWdhaW5zdCBpdCBpcyBib3VuZCB0byB3YWxrIE9VVFBVVCAoc2VlIHRoZSBxdWFydGV0IGluXG4vLyB2aWV3ZXIvdGVzdHMgYW5kIHNjaGVtYS90ZXN0cy90YWJsZS50ZXN0LnRzKSwgbmV2ZXIgdG8gdGhpcyBkZWNsYXJhdGlvbi5cbi8vXG4vLyBHUkFEQUJJTElUWSBJUyBERVJJVkVELCBOT1QgREVDTEFSRUQuIFRoZXJlIGlzIG5vIGBpbnRlcmFjdGl2ZWAgZmxhZzogYSB0YWJsZVxuLy8gaXMgYSBxdWVzdGlvbiBleGFjdGx5IHdoZW4gc29tZSBjZWxsIGhvbGRzIGEgYmxhbmsgKGBpc0dyYWRlYWJsZWAsIHRoZVxuLy8gbWF0aF9ibG9jayBwcmVjZWRlbnQpLiBBIGZsYWcgY2FuIGRyaWZ0IGZyb20gY29udGVudCBcdTIwMTQgZGVsZXRlIHRoZSBsYXN0IGJsYW5rXG4vLyBhbmQgYSBzdGFsZSBmbGFnIGxlYXZlcyBhIHBoYW50b20gbnVtYmVyZWQgcXVlc3Rpb24gaW4gdGhlIGNoZWNrIHBheWxvYWQuXG4vL1xuLy8gTlVNQkVSSU5HIGZvbGxvd3MgZmFkZWRfd29ya2VkX2V4YW1wbGU6IHRoZSB3aG9sZSB0YWJsZSBpcyBPTkUgbnVtYmVyZWRcbi8vIHByb2JsZW0sIGFuZCBpdHMgYmxhbmtzIGFyZSBsZXR0ZXJlZCAoYSksIChiKSBcdTIwMjYgaW4gUkVBRElORyBPUkRFUi4gVGhlIGxldHRlcnNcbi8vIGFyZSBkZXJpdmVkIGZyb20gcG9zaXRpb24gYXQgcmVuZGVyIHRpbWUgYW5kIG5ldmVyIHN0b3JlZCAoYHRhYmxlQmxhbmtJZHNgICtcbi8vIGBzdGVwTGV0dGVyYCksIHRoZSBzYW1lIHJ1bGUgZmlsbF9pbl9ibGFuaydzIHN1Yi1wYXJ0cyBhbHJlYWR5IGZvbGxvdy5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBQZXItY29sdW1uIHByaW50L3NjcmVlbiBhbGlnbm1lbnQsIHN0cmFpZ2h0IGZyb20gYSBtYXJrZG93biBkZWxpbWl0ZXIgcm93J3NcbiAqIGNvbG9ucyAoYHwtLS06fGAgXHUyMTkyIHJpZ2h0KS4gUmlnaHQtYWxpZ25lZCBudW1iZXIgY29sdW1ucyBhcmUgd2hhdCBtYWtlcyBhXG4gKiB0YWJsZSBvZiBmaWd1cmVzIHJlYWRhYmxlIG9uIHBhcGVyLCB3aGljaCBpcyB3aHkgdGhpcyBpcyBhdXRob3JlZCBkYXRhIGFuZFxuICogbm90IGEgc3R5bGVzaGVldCBkZWNpc2lvbi4gKi9cbmV4cG9ydCBjb25zdCBUYWJsZUNvbHVtbkFsaWduID0gei5lbnVtKFsnbGVmdCcsICdjZW50ZXInLCAncmlnaHQnXSk7XG5leHBvcnQgdHlwZSBUYWJsZUNvbHVtbkFsaWduID0gei5pbmZlcjx0eXBlb2YgVGFibGVDb2x1bW5BbGlnbj47XG5cbi8vIE5PIGB0eXBlYCBGSUVMRCBcdTIwMTQgc2VlIHRoZSBoZWFkZXIuIGBpZGAgaXMgZm9yIHN0YWJsZSBhZGRyZXNzaW5nIChSZWFjdCBrZXlzLFxuLy8gZWRpdG9yIGlkZW50aXR5KTsgaXQgaXMgTk9UIGEgcmVzcG9uc2Uga2V5LiBUaGUgcmVzcG9uc2Uga2V5cyBhcmUgdGhlIGJsYW5rXG4vLyBpZHMgSU5TSURFIGBjb250ZW50YCwgd2hpY2ggaXMgd2hhdCBsZXRzIGNlbGwgYmxhbmtzIHJpZGUgdGhlIGV4aXN0aW5nXG4vLyBTdWJtaXNzaW9uUmVzcG9uc2VzLmJsYW5rcyBtYXAgd2l0aCBubyB3aXJlLXZlcnNpb24gYnVtcC5cbmV4cG9ydCBjb25zdCBUYWJsZUNlbGwgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgLy8gVGhlIHNhbWUgaW5saW5lIGFscGhhYmV0IGZpbGxfaW5fYmxhbmsncyBib2R5IHVzZXM6IHRleHQgd2l0aCBtYXJrcyxcbiAgLy8gaW5saW5lIG1hdGgsIGhhcmQgYnJlYWtzLCBhbmQgYmxhbmsgdG9rZW5zLiBEZWxpYmVyYXRlbHkgTk9UIGEgYmxvY2sgYXJyYXk6XG4gIC8vIGl0IGtlZXBzIGV2ZXJ5IGNlbGwgd2Fsa2FibGUsIGtlZXBzIHRoZSBzY2hlbWEgbm9uLXJlY3Vyc2l2ZSAoc2VlIHRoZVxuICAvLyBUUzcwNTYgbm90ZSBpbiBpbmxpbmUudHMpLCBhbmQga2VlcHMgYSBjZWxsIGEgY2VsbCByYXRoZXIgdGhhbiBhIHBhZ2UuXG4gIGNvbnRlbnQ6IHouYXJyYXkoRmlsbEluQmxhbmtJbmxpbmUpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBUYWJsZUNlbGwgPSB6LmluZmVyPHR5cGVvZiBUYWJsZUNlbGw+O1xuXG4vLyBOTyBgdHlwZWAgRklFTEQgXHUyMDE0IHNlZSB0aGUgaGVhZGVyLlxuZXhwb3J0IGNvbnN0IFRhYmxlUm93ID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIGNlbGxzOiB6LmFycmF5KFRhYmxlQ2VsbCkuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCB0eXBlIFRhYmxlUm93ID0gei5pbmZlcjx0eXBlb2YgVGFibGVSb3c+O1xuXG5leHBvcnQgY29uc3QgVGFibGVCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ3RhYmxlJyksXG4gIC8vIEF1dG8tYXNzaWduZWQgd29ya3NoZWV0IG51bWJlciwgYXMgb24gZXZlcnkgbnVtYmVyZWQgYmxvY2suIFByZXNlbnQgb25seVxuICAvLyB3aGVuIHRoZSB0YWJsZSBpcyBncmFkYWJsZSAoYSBibGFua2xlc3MgdGFibGUgaXMgYSBzdGltdWx1cywgbm90IGFcbiAgLy8gcXVlc3Rpb24pIFx1MjAxNCByZXNvbHZlZCBieSBudW1iZXJpbmcsIG5vdCBzdG9yZWQgYXV0aG9yaXR5LlxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAvLyBXaGljaCBheGlzIGNhcnJpZXMgdGhlIGhlYWRlcnMuIFR3byBib29sZWFucyByYXRoZXIgdGhhbiBhIHBlci1jZWxsIGZsYWc6XG4gIC8vIGEgaGVhZGVyIGNlbGwgaW4gdGhlIE1JRERMRSBvZiBhIHRhYmxlIGlzIG5vdCBhIHRoaW5nIHRoaXMgdm9jYWJ1bGFyeVxuICAvLyBzaG91bGQgYmUgYWJsZSB0byBleHByZXNzLCBhbmQgdGhlIGExMXkgc3RvcnkgbmVlZHMgdG8ga25vdyB3aGljaCBheGlzXG4gIC8vIG5hbWVzIGEgY2VsbCAoXCJLaWxvZ3JhbXMgMiwgQ29zdFwiIHJlYWRzIGNvcnJlY3RseSBvbmx5IGlmIHdlIGtub3cgd2hlcmUgdGhlXG4gIC8vIGxhYmVscyBsaXZlKS4gYGhlYWRlckNvbHVtbmAgaXMgbm90IGRlY29yYXRpb24gXHUyMDE0IGFsZ2VicmEgdGFibGVzIGFyZSBhc1xuICAvLyBvZnRlbiB0cmFuc3Bvc2VkICh4IGRvd24gdGhlIGxlZnQpIGFzIG5vdC5cbiAgaGVhZGVyUm93OiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICBoZWFkZXJDb2x1bW46IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAvLyBQZXItY29sdW1uIGFsaWdubWVudCwgaW5kZXgtYWxpZ25lZCB3aXRoIGVhY2ggcm93J3MgY2VsbHMuIE9wdGlvbmFsIHdpdGggTk9cbiAgLy8gZGVmYXVsdCBzbyBhIHRhYmxlIGF1dGhvcmVkIHdpdGhvdXQgYWxpZ25tZW50IHJlLXNlcmlhbGl6ZXMgYnl0ZS1pZGVudGljYWxseVxuICAvLyAodGhlIHNhbWUgb3B0aW9uYWwtbm8tZGVmYXVsdCBkaXNjaXBsaW5lIGFzIEJsYW5rVG9rZW4uYW5zd2VyVHlwZSkuIEEgc2hvcnRcbiAgLy8gYXJyYXkgaXMgZmluZTogY29sdW1ucyBwYXN0IGl0cyBlbmQgZmFsbCBiYWNrIHRvIGxlZnQuXG4gIGNvbHVtbkFsaWduczogei5hcnJheShUYWJsZUNvbHVtbkFsaWduKS5vcHRpb25hbCgpLFxuICAvLyBUaGUgKGEpLyhiKSBtYXJrZXJzIG9uIGJsYW5rIGNlbGxzLiBNaXJyb3JzIGZhZGVkX3dvcmtlZF9leGFtcGxlJ3NcbiAgLy8gc2hvd1N0ZXBMYWJlbHMgXHUyMDE0IG9mZiBnaXZlcyBhIHRlYWNoZXIgbWF4aW11bSB3cml0aW5nIHJvb20gb24gcGFwZXIuXG4gIC8vIERlZmF1bHRlZCBzbyBhIGRvY3VtZW50IGF1dGhvcmVkIGJlZm9yZSB0aGlzIGZpZWxkIHJlbmRlcnMgbGFiZWxsZWQuXG4gIHNob3dDZWxsTGFiZWxzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICByb3dzOiB6LmFycmF5KFRhYmxlUm93KS5kZWZhdWx0KFtdKSxcbiAgLy8gVGhlIHRhYmxlJ3Mgb3duIHBhZ2UgbGFiZWwgKGF1dG8vY3VzdG9tL25vbmUpLCBsaWtlIGV2ZXJ5IG51bWJlcmVkIHR5cGUuXG4gIC4uLmxhYmVsRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBUYWJsZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgVGFibGVCbG9jaz47XG5cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gYmxvY2tzL2luZGV4LnRzIFx1MjAxNCBCbG9jayBkaXNjcmltaW5hdGVkIHVuaW9uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2luZ2xlIHNvdXJjZSBvZiB0cnV0aCBmb3IgXCJ3aGF0IGJsb2NrIHR5cGVzIGV4aXN0IGluIFBoYXNlIDEuXCIgQWRkaW5nIGFcbi8vIG5ldyBibG9jayB0eXBlIG1lYW5zOiBuZXcgZmlsZSB1bmRlciBibG9ja3MvLCBuZXcgZW50cnkgaGVyZSwgbmV3IGZhY3Rvcnlcbi8vIGluIGZhY3Rvcmllcy50cywgbmV3IHJlbmRlcmVyIGluIEBhY3Rpdml0eS9yZW5kZXJlci9ibG9ja3MvLiBUaHJlZSBwbGFjZXMsXG4vLyBhbHdheXMgaW4gdGhhdCBvcmRlci5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG5pbXBvcnQgeyBQYXJhZ3JhcGhCbG9jayB9IGZyb20gJy4vcGFyYWdyYXBoLmpzJztcbmltcG9ydCB7IEhlYWRpbmdCbG9jayB9IGZyb20gJy4vaGVhZGluZy5qcyc7XG5pbXBvcnQgeyBNYXRoQmxvY2sgfSBmcm9tICcuL21hdGgtYmxvY2suanMnO1xuaW1wb3J0IHsgSW1hZ2VCbG9jaywgQ3JvcFJlY3QgfSBmcm9tICcuL2ltYWdlLmpzJztcbmltcG9ydCB7IENhbGxvdXRCbG9jayB9IGZyb20gJy4vY2FsbG91dC5qcyc7XG5pbXBvcnQgeyBQcm9ibGVtQmxvY2sgfSBmcm9tICcuL3Byb2JsZW0uanMnO1xuaW1wb3J0IHsgRmlsbEluQmxhbmtCbG9jayB9IGZyb20gJy4vZmlsbC1pbi1ibGFuay5qcyc7XG5pbXBvcnQgeyBCdWxsZXRMaXN0QmxvY2ssIE9yZGVyZWRMaXN0QmxvY2ssIExpc3RJdGVtIH0gZnJvbSAnLi9saXN0LmpzJztcbmltcG9ydCB7IEludGVyYWN0aXZlR3JhcGhCbG9jayB9IGZyb20gJy4vaW50ZXJhY3RpdmUtZ3JhcGguanMnO1xuaW1wb3J0IHsgTXVsdGlwbGVDaG9pY2VCbG9jayB9IGZyb20gJy4vbXVsdGlwbGUtY2hvaWNlLmpzJztcbmltcG9ydCB7IE1hdGNoaW5nQmxvY2sgfSBmcm9tICcuL21hdGNoaW5nLmpzJztcbmltcG9ydCB7IE9yZGVyaW5nQmxvY2sgfSBmcm9tICcuL29yZGVyaW5nLmpzJztcbmltcG9ydCB7IE51bWJlckxpbmVCbG9jayB9IGZyb20gJy4vbnVtYmVyLWxpbmUuanMnO1xuaW1wb3J0IHsgRGF0YVBsb3RCbG9jayB9IGZyb20gJy4vZGF0YS1wbG90LmpzJztcbmltcG9ydCB7IExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrIH0gZnJvbSAnLi9sZWFybmluZy1vYmplY3RpdmVzLmpzJztcbmltcG9ydCB7IFdvcmtlZEV4YW1wbGVCbG9jayB9IGZyb20gJy4vd29ya2VkLWV4YW1wbGUuanMnO1xuaW1wb3J0IHsgR3JhcGhGaWd1cmVCbG9jayB9IGZyb20gJy4vZ3JhcGgtZmlndXJlLmpzJztcbmltcG9ydCB7IEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrIH0gZnJvbSAnLi9mYWRlZC13b3JrZWQtZXhhbXBsZS5qcyc7XG5pbXBvcnQgeyBTZWxmRXhwbGFuYXRpb25CbG9jayB9IGZyb20gJy4vc2VsZi1leHBsYW5hdGlvbi5qcyc7XG5pbXBvcnQgeyBTaG9ydEFuc3dlckJsb2NrLCBFc3NheUJsb2NrIH0gZnJvbSAnLi9mcmVlLXJlc3BvbnNlLmpzJztcbmltcG9ydCB7IFRhYmxlQmxvY2sgfSBmcm9tICcuL3RhYmxlLmpzJztcblxuZXhwb3J0IGNvbnN0IEJsb2NrID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFBhcmFncmFwaEJsb2NrLFxuICBIZWFkaW5nQmxvY2ssXG4gIE1hdGhCbG9jayxcbiAgSW1hZ2VCbG9jayxcbiAgQ2FsbG91dEJsb2NrLFxuICBQcm9ibGVtQmxvY2ssXG4gIEZpbGxJbkJsYW5rQmxvY2ssXG4gIEJ1bGxldExpc3RCbG9jayxcbiAgT3JkZXJlZExpc3RCbG9jayxcbiAgSW50ZXJhY3RpdmVHcmFwaEJsb2NrLFxuICBNdWx0aXBsZUNob2ljZUJsb2NrLFxuICBNYXRjaGluZ0Jsb2NrLFxuICBPcmRlcmluZ0Jsb2NrLFxuICBOdW1iZXJMaW5lQmxvY2ssXG4gIERhdGFQbG90QmxvY2ssXG4gIExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrLFxuICBXb3JrZWRFeGFtcGxlQmxvY2ssXG4gIEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrLFxuICBTZWxmRXhwbGFuYXRpb25CbG9jayxcbiAgU2hvcnRBbnN3ZXJCbG9jayxcbiAgRXNzYXlCbG9jayxcbiAgR3JhcGhGaWd1cmVCbG9jayxcbiAgVGFibGVCbG9jayxcbl0pO1xuZXhwb3J0IHR5cGUgQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBCbG9jaz47XG5cbi8vIE5PVEU6IGxheW91dCBpcyBOT1QgYSBibG9jay4gUm93cy9Db2x1bW5zIChwYWNrYWdlcy9zY2hlbWEvc3JjL2xheW91dC50cykgYXJlXG4vLyB0aGUgc3RydWN0dXJhbCBjb250YWluZXIgQUJPVkUgYmxvY2tzIFx1MjAxNCBhIENvbHVtbiBob2xkcyBCbG9ja1tdLCBuZXZlciB0aGVcbi8vIHJldmVyc2UgXHUyMDE0IHNvIHRoZSBCbG9jayB1bmlvbiBpcyBsZWFmIGJsb2NrcyBvbmx5IGFuZCBjYW4gbmV2ZXIgbmVzdCBhIHJvdy5cblxuLy8gUmUtZXhwb3J0IGluZGl2aWR1YWwgYmxvY2sgdHlwZXMgc28gY29uc3VtZXJzIGNhbiBpbXBvcnQgdGhlbSBieSBuYW1lLlxuZXhwb3J0IHtcbiAgUGFyYWdyYXBoQmxvY2ssXG4gIEhlYWRpbmdCbG9jayxcbiAgTWF0aEJsb2NrLFxuICBJbWFnZUJsb2NrLFxuICBDcm9wUmVjdCxcbiAgQ2FsbG91dEJsb2NrLFxuICBQcm9ibGVtQmxvY2ssXG4gIEZpbGxJbkJsYW5rQmxvY2ssXG4gIEJ1bGxldExpc3RCbG9jayxcbiAgT3JkZXJlZExpc3RCbG9jayxcbiAgTGlzdEl0ZW0sXG4gIEludGVyYWN0aXZlR3JhcGhCbG9jayxcbn07XG5leHBvcnQge1xuICBNdWx0aXBsZUNob2ljZUJsb2NrLFxuICBNdWx0aXBsZUNob2ljZU9wdGlvbixcbiAgQ2hvaWNlSW1hZ2UsXG4gIENob2ljZUdyYXBoLFxufSBmcm9tICcuL211bHRpcGxlLWNob2ljZS5qcyc7XG5leHBvcnQgeyBNYXRjaGluZ0Jsb2NrLCBNYXRjaGluZ0l0ZW0sIE1hdGNoaW5nVGFyZ2V0IH0gZnJvbSAnLi9tYXRjaGluZy5qcyc7XG5leHBvcnQgeyBPcmRlcmluZ0Jsb2NrLCBPcmRlcmluZ0l0ZW0gfSBmcm9tICcuL29yZGVyaW5nLmpzJztcbmV4cG9ydCB7XG4gIE51bWJlckxpbmVCbG9jayxcbiAgTnVtYmVyTGluZUNvbmZpZyxcbiAgTnVtYmVyTGluZUludGVyYWN0aW9uLFxuICBOdW1iZXJMaW5lUG9pbnRJbnRlcmFjdGlvbixcbiAgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb24sXG4gIE51bWJlckxpbmVJbnRlcnZhbCxcbn0gZnJvbSAnLi9udW1iZXItbGluZS5qcyc7XG5leHBvcnQge1xuICBEYXRhUGxvdEJsb2NrLFxuICBEYXRhUGxvdENvbmZpZyxcbiAgRGF0YVBsb3RDaGFydCxcbiAgRGF0YVBsb3RJbnRlcmFjdGlvbixcbiAgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb24sXG4gIERhdGFQbG90RG90cGxvdEludGVyYWN0aW9uLFxuICBEYXRhUGxvdEhpc3RvZ3JhbUludGVyYWN0aW9uLFxuICBEYXRhUGxvdEJveHBsb3RJbnRlcmFjdGlvbixcbn0gZnJvbSAnLi9kYXRhLXBsb3QuanMnO1xuZXhwb3J0IHsgTGVhcm5pbmdPYmplY3RpdmVzQmxvY2sgfSBmcm9tICcuL2xlYXJuaW5nLW9iamVjdGl2ZXMuanMnO1xuZXhwb3J0IHsgV29ya2VkRXhhbXBsZUJsb2NrLCBXb3JrZWRFeGFtcGxlQ2hpbGQgfSBmcm9tICcuL3dvcmtlZC1leGFtcGxlLmpzJztcbmV4cG9ydCB7IEdyYXBoRmlndXJlQmxvY2sgfSBmcm9tICcuL2dyYXBoLWZpZ3VyZS5qcyc7XG5leHBvcnQge1xuICBGYWRlZFdvcmtlZEV4YW1wbGVCbG9jayxcbiAgRmFkZWRXb3JrZWRFeGFtcGxlQ2hpbGQsXG59IGZyb20gJy4vZmFkZWQtd29ya2VkLWV4YW1wbGUuanMnO1xuZXhwb3J0IHsgU2VsZkV4cGxhbmF0aW9uQmxvY2sgfSBmcm9tICcuL3NlbGYtZXhwbGFuYXRpb24uanMnO1xuZXhwb3J0IHtcbiAgU2hvcnRBbnN3ZXJCbG9jayxcbiAgRXNzYXlCbG9jayxcbiAgV29yZENvdW50SGludCxcbiAgUnVicmljLFxuICBSdWJyaWNDcml0ZXJpb24sXG59IGZyb20gJy4vZnJlZS1yZXNwb25zZS5qcyc7XG5leHBvcnQge1xuICBUYWJsZUJsb2NrLFxuICBUYWJsZVJvdyxcbiAgVGFibGVDZWxsLFxuICBUYWJsZUNvbHVtbkFsaWduLFxufSBmcm9tICcuL3RhYmxlLmpzJztcbi8vIEZyb20gdGhlIHpvZC1mcmVlIG1vZHVsZSwgTk9UICcuL3RhYmxlLmpzJyBcdTIwMTQgc2VlIHRhYmxlLWJsYW5rLWlkcy50cy4gUm91dGluZ1xuLy8gaXQgdGhyb3VnaCB0aGUgc2NoZW1hIG1vZHVsZSB3b3VsZCBwdXQgem9kIGJhY2sgaW4gdGhlIHN0dWRlbnQgc2hlbGwgZm9yXG4vLyBhbnlvbmUgd2hvIHJlYWNoZXMgdGhpcyBiYXJyZWwuXG5leHBvcnQgeyB0YWJsZUJsYW5rSWRzIH0gZnJvbSAnLi4vdGFibGUtYmxhbmstaWRzLmpzJztcbmV4cG9ydCB0eXBlIHsgVGFibGVCbGFua1NvdXJjZSB9IGZyb20gJy4uL3RhYmxlLWJsYW5rLWlkcy5qcyc7XG5leHBvcnQge1xuICBBeGlzQ29uZmlnLFxuICBQb2ludEludGVyYWN0aW9uLFxuICBGdW5jdGlvbkludGVyYWN0aW9uLFxuICBGdW5jdGlvbk1vZGVsLFxuICBSZWdpb25JbnRlcmFjdGlvbixcbiAgUmF5SW50ZXJhY3Rpb24sXG4gIFJheUFuc3dlcixcbiAgU2VnbWVudEludGVyYWN0aW9uLFxuICBTZWdtZW50QW5zd2VyLFxuICBFbmRwb2ludFN0eWxlLFxuICBEcmF3YWJsZSxcbiAgRHJhd2FibGVDb2xvcixcbiAgRGlzcGxheUludGVyYWN0aW9uLFxuICBHcmFwaEludGVyYWN0aW9uLFxufSBmcm9tICcuL2ludGVyYWN0aXZlLWdyYXBoLmpzJztcbmV4cG9ydCB0eXBlIHsgSGVhZGluZ0xldmVsIH0gZnJvbSAnLi9oZWFkaW5nLmpzJztcbmV4cG9ydCB0eXBlIHsgQ2FsbG91dFZhcmlhbnQgfSBmcm9tICcuL2NhbGxvdXQuanMnO1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBsYXlvdXQudHMgXHUyMDE0IFN0cnVjdHVyYWwgbGF5b3V0IGxheWVyOiBSb3cgKyBDb2x1bW5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgZG9jdW1lbnQgYm9keSBpcyBhIHN0YWNrIG9mIFJPV1MuIEEgcm93IGxheXMgaXRzIGNoaWxkIGNvbHVtbnMgc2lkZSBieVxuLy8gc2lkZTsgZWFjaCBjb2x1bW4gaG9sZHMgaXRzIG93biBTVEFDSyBvZiBibG9ja3MgKGJsb2NrKykuIE9uZSBjb2x1bW4gaXMgdGhlXG4vLyBpZGVudGl0eS9kZWZhdWx0IFx1MjAxNCBhIDEtY29sdW1uIHJvdyBpcyB0aGUgbm9ybWFsIGZ1bGwtd2lkdGggdmVydGljYWwgZmxvdywgYW5kXG4vLyBcImFkZCBjb2x1bW5zXCIgc3BsaXRzIGEgcm93IGludG8gbW9yZSBjb2x1bW5zLiBUaGlzIHJlcGxhY2VzIHRoZSBvbGQgYGNvbHVtbnNgXG4vLyBibG9jayB0eXBlOiBsYXlvdXQgaXMgbm93IHRoZSB1bml2ZXJzYWwgY29udGFpbmVyIGluc3RlYWQgb2YgYW4gaW5zZXJ0ZWRcbi8vIGJsb2NrLCB3aGljaCBpcyBob3cgcXVhbGl0eSBwcmludCBlbmdpbmVzIChJbkRlc2lnbiwgcHJpbnQgQ1NTKSBhbmQgd2ViXG4vLyBsYXlvdXQgdG9vbHMgbW9kZWwgYSBkb2N1bWVudC5cbi8vXG4vLyBObyByZWN1cnNpb246IGByb3dgIGFuZCBgY29sdW1uYCBhcmUgTk9UIG1lbWJlcnMgb2YgdGhlIEJsb2NrIHVuaW9uIChCbG9jayBpc1xuLy8gbGVhZiBibG9ja3Mgb25seSksIHNvIGEgQ29sdW1uJ3MgYGJsb2NrczogQmxvY2tbXWAgY2FuIG5ldmVyIGNvbnRhaW4gYSBSb3cuXG4vLyBUaGUgb2xkIGNvbHVtbnMtaW4tY29sdW1ucyBndWFyZCAoYW4gZW51bWVyYXRlZCBjZWxsIHVuaW9uKSBpcyB0aGVyZWZvcmUgYVxuLy8gc3RydWN0dXJhbCBmYWN0IGhlcmUsIG5vdCBhbiBlbmZvcmNlZCBleGNsdXNpb24uXG4vL1xuLy8gd2lkdGggaXMgYW4gb3B0aW9uYWwgdW5pdGxlc3Mgd2VpZ2h0IHBlciBjb2x1bW46IGEgY29sdW1uIHdpdGggd2lkdGggMiBiZXNpZGVcbi8vIGEgY29sdW1uIHdpdGggd2lkdGggMSB0YWtlcyAyLzMgb2YgdGhlIHJvdy4gQWJzZW50IFx1MjE5MiBlcXVhbCBzcGxpdC4gVGhpcyBpcyB0aGVcbi8vIHJlYXNvbiBsYXlvdXQgaXMgc3RydWN0dXJhbCByYXRoZXIgdGhhbiBhIENTUyB0b2dnbGUgXHUyMDE0IFwid2lkZSB3b3JrZWQgZXhhbXBsZSArXG4vLyBuYXJyb3cgYW5zd2VyIHN0cmlwXCIgbmVlZHMgdW5lcXVhbCB3aWR0aHMuXG4vL1xuLy8gbWluSGVpZ2h0IGlzIGEgcmVzZXJ2ZWQgd29yay1zcGFjZSBmbG9vciBpbiByZW0uIFRoZSBjZWxsIHN0aWxsIEdST1dTIHdpdGhcbi8vIGNvbnRlbnQgKGEgZmxvb3IsIG5vdCBhIGZpeGVkIGhlaWdodCBcdTIwMTQgZml4ZWQgaGVpZ2h0cyBicmVhayBwcmludCByZWZsb3cgYW5kXG4vLyB0aGUgZm9sZGFibGUncyBoZWlnaHQgbWVhc3VyZW1lbnQpLiByZW0gc28gdGhlIHJlc2VydmVkIHNwYWNlIHNjYWxlcyB3aXRoIHRoZVxuLy8gcHJpbnQgZm9udC1zaXplIGNvbmZpZy4gQWJzZW50ID0gY29udGVudC1kZXRlcm1pbmVkIGhlaWdodC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG5pbXBvcnQgeyBCbG9jayB9IGZyb20gJy4vYmxvY2tzL2luZGV4LmpzJztcblxuLy8gZ3JpZExpbmVzIHR1cm5zIGEgcm93IGludG8gYSBydWxlZCBncmlkOiBhIGJvcmRlciBhcm91bmQgdGhlIHdob2xlIHJvdywgcnVsZXNcbi8vIGJldHdlZW4gdGhlIGNlbGxzLCBhbmQgcnVsZXMgYmV0d2VlbiB0aGUgc3RhY2tlZCBibG9ja3Mgd2l0aGluIGEgY2VsbC5cbi8vIEVzcGVjaWFsbHkgdXNlZnVsIGluIHByaW50IChib3hlZCByZWdpb25zIHRvIHdyaXRlIGluIC8gY3V0IG91dCkuIFRyaS1zdGF0ZSBzb1xuLy8gYSByb3cgY2FuIGRlZmVyIHRvIHRoZSBhY3Rpdml0eS13aWRlIGRlZmF1bHQ6XG4vLyAgICdpbmhlcml0JyBcdTIwMTQgZm9sbG93IG1ldGEucHJpbnQuZ3JpZExpbmVzICh0aGUgYWN0aXZpdHkgZGVmYXVsdDsgdGhlIHJlbmRlcmVyXG4vLyAgICAgICAgICAgICAgIHJlc29sdmVzIHRoaXMpLiBEZWZhdWx0LCBzbyBhIGZyZXNobHkgYXV0aG9yZWQgcm93IHRyYWNrcyB0aGVcbi8vICAgICAgICAgICAgICAgYWN0aXZpdHkgc2V0dGluZyB3aXRob3V0IHBlci1yb3cgZmlkZGxpbmcuXG4vLyAgICdvbicgICAgICBcdTIwMTQgYWx3YXlzIHJ1bGVkLCByZWdhcmRsZXNzIG9mIHRoZSBhY3Rpdml0eSBkZWZhdWx0LlxuLy8gICAnb2ZmJyAgICAgXHUyMDE0IG5ldmVyIHJ1bGVkLCByZWdhcmRsZXNzIG9mIHRoZSBhY3Rpdml0eSBkZWZhdWx0LlxuZXhwb3J0IGNvbnN0IENvbHVtbkdyaWRMaW5lcyA9IHouZW51bShbJ2luaGVyaXQnLCAnb24nLCAnb2ZmJ10pO1xuZXhwb3J0IHR5cGUgQ29sdW1uR3JpZExpbmVzID0gei5pbmZlcjx0eXBlb2YgQ29sdW1uR3JpZExpbmVzPjtcblxuZXhwb3J0IGNvbnN0IENvbHVtbiA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAvLyBQZXItY29sdW1uIHdpZHRoIHdlaWdodCAoZnIgdW5pdHMpLiBPcHRpb25hbDsgYWJzZW50ID0gZXF1YWwgc3BsaXQuXG4gIHdpZHRoOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLy8gUmVzZXJ2ZWQgd29yay1zcGFjZSBmbG9vciBpbiByZW0gKGEgbWluLWhlaWdodCwgbm90IGEgZml4ZWQgaGVpZ2h0KS5cbiAgbWluSGVpZ2h0OiB6Lm51bWJlcigpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLy8gQSBjb2x1bW4gaG9sZHMgYSBub24tZW1wdHkgU1RBQ0sgb2YgYmxvY2tzIChibG9jayspLiBBIGNvbHVtbiBjYW4gaG9sZCBhXG4gIC8vIGhlYWRpbmcgZm9sbG93ZWQgYnkgc2V2ZXJhbCBwcm9ibGVtcyBcdTIwMTQgdGhlIHRoaW5nIGEgZG9jdW1lbnQgdG9vbCBuZWVkcyBhbmRcbiAgLy8gYSBvbmUtYmxvY2stcGVyLXJvdyBtb2RlbCBjYW4ndCBleHByZXNzLlxuICBibG9ja3M6IHouYXJyYXkoQmxvY2spLm1pbigxKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ29sdW1uID0gei5pbmZlcjx0eXBlb2YgQ29sdW1uPjtcblxuLy8gMS4uNiBjb2x1bW5zLiBUaGUgZWRpdG9yIHN1cmZhY2VzIGEgbm9uLWJsb2NraW5nIHdhcm5pbmcgYWJvdmUgMyAodG9vIG5hcnJvd1xuLy8gdG8gcmVhZCBvbiBwYXBlciBvciBhIENocm9tZWJvb2spLCBidXQgdGhlIHNjaGVtYSBhY2NlcHRzIHVwIHRvIDYgc28gYW5cbi8vIGludGVudGlvbmFsIGRlbnNlIGxheW91dCBzdGlsbCB2YWxpZGF0ZXMuIE9uZSBjb2x1bW4gaXMgdGhlIGlkZW50aXR5IHN0YXRlOlxuLy8gYSBmdWxsLXdpZHRoIHJvdyB0aGF0IFwicmVtb3ZlIGNvbHVtblwiIGNhbm5vdCBkaXNzb2x2ZSBiZWxvdy5cbmV4cG9ydCBjb25zdCBSb3cgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgY29sdW1uczogei5hcnJheShDb2x1bW4pLm1pbigxKS5tYXgoNiksXG4gIGdyaWRMaW5lczogQ29sdW1uR3JpZExpbmVzLmRlZmF1bHQoJ2luaGVyaXQnKSxcbn0pO1xuZXhwb3J0IHR5cGUgUm93ID0gei5pbmZlcjx0eXBlb2YgUm93PjtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gZG9jdW1lbnQudHMgXHUyMDE0IFRvcC1sZXZlbCBBY3Rpdml0eURvY3VtZW50IGFuZCBTZWN0aW9uIHNjaGVtYXNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBY3Rpdml0eURvY3VtZW50IGlzIHdoYXQgZ2V0cyBzdG9yZWQgaW4gYWN0aXZpdGllcy5kcmFmdF9jb250ZW50IGFuZFxuLy8gYWN0aXZpdHlfdmVyc2lvbnMuY29udGVudC4gVGhlIHNoYXBlIGxpdmVzIGluIHRoaXMgcGFja2FnZSBhcyB0aGUgc2luZ2xlXG4vLyBzb3VyY2Ugb2YgdHJ1dGggXHUyMDE0IHRoZSByZW5kZXJlciBwYXJzZXMgaXQsIHRoZSBlZGl0b3IgcHJvZHVjZXMgaXQgdmlhIHRoZVxuLy8gc2VyaWFsaXplIGxheWVyLCB0aGUgZGF0YWJhc2Ugc3RvcmVzIGl0IGFzIGpzb25iLlxuLy9cbi8vIHNjaGVtYVZlcnNpb24gaXMgdGhlIG1pZ3JhdGlvbiBhbmNob3IuIEl0IGlzIGN1cnJlbnRseSAyLiBUaGUgMVx1MjE5MjIgcmVzaGFwZVxuLy8gKGJsb2NrLXN0cmVhbSBzZWN0aW9ucyBcdTIxOTIgcm93cy1vZi1jb2x1bW5zKSB3YXMgYSBHUkVFTkZJRUxEIEhBUkQtQ1VUOiB0aGVyZSB3YXNcbi8vIG5vIHByb2R1Y3Rpb24gZGF0YSB0byBwcmVzZXJ2ZSwgc28gdGhlcmUgaXMgZGVsaWJlcmF0ZWx5IE5PIG1pZ3JhdGUoMVx1MjE5MjIpIGFuZFxuLy8gTk8gbWlncmF0ZS1vbi1yZWFkIFx1MjAxNCB0aGUgcGFyc2VyIGlzIHoubGl0ZXJhbCgyKSBhbmQgUkVKRUNUUyBhIHYxIGRvY3VtZW50XG4vLyAoYSBzdHJheSB2MSBmYWlscyBsb3VkbHkgYXQgcGFyc2UgcmF0aGVyIHRoYW4gbWlzLXBhcnNpbmcgaW50byBnYXJiYWdlKS5cbi8vIFdoZW4gYSBGVVRVUkUgc2NoZW1hIG5lZWRzIGEgbm9uLXRyaXZpYWwgbWlncmF0aW9uIGFnYWluc3QgcmVhbCBzdG9yZWQgZGF0YSxcbi8vIGJ1bXAgdGhlIHZlcnNpb24gYW5kIGFkZCBhIG1pZ3JhdGUoTiAtPiBOKzEpIHRoYXQgcnVucyBvbiByZWFkIChvbGRcbi8vIGFjdGl2aXR5X3ZlcnNpb25zIHJvd3Mgc3RheSBhdCB0aGVpciBvcmlnaW5hbCBzY2hlbWFWZXJzaW9uIGZvcmV2ZXI7IG1pZ3JhdGVcbi8vIG9uIHJlYWQsIG5ldmVyIGJ5IG11dGF0aW5nIHN0b3JlZCB2ZXJzaW9ucykuIFRoZSBncmVlbmZpZWxkIGhhcmQtY3V0IGlzIGFcbi8vIG9uZS10aW1lIGV4Y2VwdGlvbiwgbm90IHRoZSBnZW5lcmFsIHBvbGljeS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgQmxvY2sgfSBmcm9tICcuL2Jsb2Nrcy9pbmRleC5qcyc7XG5pbXBvcnQgeyBSb3cgfSBmcm9tICcuL2xheW91dC5qcyc7XG5cbi8vIFNlY3Rpb246IGEgY29sbGVjdGlvbiBvZiBST1dTIHdpdGggYW4gb3B0aW9uYWwgdGl0bGUuIFNlY3Rpb25zIGFyZSB0aGVcbi8vIHZlcnRpY2FsIGNoZWNrcG9pbnQgcHJpbWl0aXZlOyByb3dzIGFyZSB0aGUgaG9yaXpvbnRhbC1zcGxpdCBwcmltaXRpdmVcbi8vIChsYXlvdXQudHMpLiBBIHNlY3Rpb24gaXMgdXN1YWxseSBvbmUgMS1jb2x1bW4gcm93IHdob3NlIGNvbHVtbiBzdGFja3MgbWFueVxuLy8gYmxvY2tzOyBhIGNvbHVtbmVkIHJlZ2lvbiBpcyBhIG11bHRpLWNvbHVtbiByb3cuIFNlY3Rpb25zIGFyZSBvcmdhbml6YXRpb25hbFxuLy8gb25seSBcdTIwMTQgdGhleSBkb24ndCBjb25zdHJhaW4gY29udGVudCBiZXlvbmQgaG9sZGluZyByb3dzLlxuLy9cbi8vIGlzQ2hlY2twb2ludCBtYXJrcyB0aGlzIHNlY3Rpb24gYXMgaGF2aW5nIGEgXCJDaGVjayB0aGlzIHNlY3Rpb25cIiBidXR0b24gYXRcbi8vIGl0cyBib3R0b20gaW4gdGhlIHB1Ymxpc2hlZCBIVE1MLiBPbmx5IG1lYW5pbmdmdWwgd2hlbiB0aGUgYWN0aXZpdHknc1xuLy8gc3VibWlzc2lvbk1vZGUgaXMgJ2xvY2tlZCcgb3IgJ2ZyZWUnIChpZ25vcmVkIGluICdzaW5nbGUnIG1vZGUgXHUyMDE0IG5vXG4vLyBjaGVja3BvaW50IGJ1dHRvbnMgcmVuZGVyIGFueXdoZXJlKS5cbmV4cG9ydCBjb25zdCBTZWN0aW9uID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQ2hlY2twb2ludDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd3M6IHouYXJyYXkoUm93KSxcbn0pO1xuZXhwb3J0IHR5cGUgU2VjdGlvbiA9IHouaW5mZXI8dHlwZW9mIFNlY3Rpb24+O1xuXG4vLyBNZXRhOiB0aGUgYWN0aXZpdHkncyB0aXRsZSwgY291cnNlLCB1bml0LCBldGMuIE5vdCB1c2VkIGluIHJlbmRlcmluZyBvZlxuLy8gdGhlIGJvZHkgXHUyMDE0IGRyaXZlcyB0aGUgcHVibGlzaGVkIEhUTUwncyA8dGl0bGU+IGFuZCBoZWFkZXIgYmFubmVyLlxuLy9cbi8vIHN1Ym1pc3Npb25Nb2RlIGNvbnRyb2xzIHRoZSBzdHVkZW50LWZhY2luZyBmbG93OlxuLy8gICAnc2luZ2xlJyBcdTIwMTQgb25lIHN1Ym1pdCBhdCB0aGUgZW5kLCBubyBjaGVja3BvaW50cyAodGhlIG9yaWdpbmFsIFBoYXNlIDEgbW9kZWwpXG4vLyAgICdsb2NrZWQnIFx1MjAxNCBwZXItc2VjdGlvbiBjaGVja3BvaW50czsgaW5wdXRzIGZyZWV6ZSBhZnRlciBlYWNoIHNlY3Rpb24gaXMgY2hlY2tlZFxuLy8gICAnZnJlZScgICBcdTIwMTQgcGVyLXNlY3Rpb24gY2hlY2twb2ludHM7IHN0dWRlbnQgY2FuIHJldmlzZSBhbnkgY2hlY2tlZCBzZWN0aW9uIGZyZWVseVxuLy9cbi8vIHJldmlzaW9uTW9kZSBjb250cm9scyBwb3N0LXN1Ym1pc3Npb24gYmVoYXZpb3I6XG4vLyAgICdmcmVlJyAgIFx1MjAxNCBhZnRlciBmaW5hbCBzdWJtaXQsIHN0dWRlbnQgY2FuIHJldmlzZSBhbmQgcmVzdWJtaXQgKG5ldyBhdHRlbXB0IHJvdylcbi8vICAgJ2xvY2tlZCcgXHUyMDE0IGZpbmFsIHN1Ym1pdCBpcyBmaW5hbDsgbm8gcmVzdWJtaXNzaW9uc1xuLy8gcmV2aXNpb25Nb2RlIGlzIGlnbm9yZWQgd2hlbiBzdWJtaXNzaW9uTW9kZSA9PT0gJ3NpbmdsZScuXG4vL1xuLy8gZ3JhZGluZ01vZGUgY29udHJvbHMgd2hvIHNjb3JlcyB0aGUgYWN0aXZpdHk6XG4vLyAgICdhdXRvJyAgIFx1MjAxNCBQaGFzZSAxIGRlZmF1bHQuIFJ1bnRpbWUgY29tcHV0ZXMgc2NvcmVzIGNsaWVudC1zaWRlIGZyb21cbi8vICAgICAgICAgICAgICBhbnN3ZXIga2V5cyBiYWtlZCBpbnRvIHRoZSBwdWJsaXNoZWQgSFRNTC5cbi8vICAgJ21hbnVhbCcgXHUyMDE0IFBoYXNlIDIuNisuIE5vIGF1dG8tc2NvcmluZzsgc3VibWlzc2lvbnMgbGFuZCBpbiB0aGVcbi8vICAgICAgICAgICAgICB0ZWFjaGVyIGRhc2hib2FyZCBwZW5kaW5nIHJ1YnJpYyBhcHBsaWNhdGlvbi5cbi8vICAgJ21peGVkJyAgXHUyMDE0IFBoYXNlIDIuNisuIFNvbWUgYmxvY2tzIGF1dG8tZ3JhZGVkLCBzb21lIG1hbnVhbGx5IGdyYWRlZFxuLy8gICAgICAgICAgICAgIChlLmcuLCA1IE1DIHF1ZXN0aW9ucyArIDEgZXNzYXkpLiBGaW5hbCBzY29yZSBjb21iaW5lcyBib3RoLlxuLy8gSW5lcnQgaW4gUGhhc2UgMSBcdTIwMTQgbm8gbWFudWFsLWdyYWRlZCBibG9jayB0eXBlcyBleGlzdCB5ZXQsIHNvIHRoZVxuLy8gcnVudGltZSB0cmVhdHMgJ21hbnVhbCcvJ21peGVkJyB0aGUgc2FtZSBhcyAnYXV0bycgdW50aWwgUGhhc2UgMi42XG4vLyBsYW5kcyBwZXItYmxvY2sgZ3JhZGluZyBtZXRhZGF0YS4gRmllbGQgZXhpc3RzIG5vdyBzbyBleGlzdGluZyBzdG9yZWRcbi8vIGRvY3VtZW50cyBwYXJzZSBjbGVhbmx5IHdoZW4gdGhvc2UgYmxvY2sgdHlwZXMgYXJyaXZlLlxuLy9cbi8vIGFjdGl2aXR5VHlwZSBkcml2ZXMgcHJlc2VudGF0aW9uOiBhbiBleGl0X3RpY2tldCByZW5kZXJzIGFzIGEgc2luZ2xlLXBhZ2Vcbi8vIGZvY3VzZWQgbGF5b3V0OyBhIHdvcmtzaGVldCByZW5kZXJzIHdpdGggZnVsbCBzZWN0aW9uIG5hdmlnYXRpb247IGV0Yy5cbi8vXG4vLyBhbnN3ZXJGZWVkYmFjayBjb250cm9scyBXSEVOIGEgYmxhbmsncyBjb3JyZWN0L2luY29ycmVjdCBzaWduYWwgKHRoZVxuLy8gZ3JlZW4vcmVkIGJvcmRlciArIGFyaWEtaW52YWxpZCArIHRhcmdldGVkIG1pc3Rha2UgZmVlZGJhY2spIGJlY29tZXNcbi8vIHZpc2libGUgdG8gdGhlIHN0dWRlbnQ6XG4vLyAgICdpbW1lZGlhdGUnIFx1MjAxNCB0aGUgYmxhbmsgc2VsZi1jaGVja3Mgb24gYmx1ciwgc28gdGhlIHN0dWRlbnQgc2Vlc1xuLy8gICAgICAgICAgICAgICAgIGNvcnJlY3QvaW5jb3JyZWN0IGFzIHNvb24gYXMgdGhleSBsZWF2ZSB0aGUgZmllbGQuIEFcbi8vICAgICAgICAgICAgICAgICBzZWxmLWNoZWNrIHByYWN0aWNlIGV4cGVyaWVuY2UuXG4vLyAgICdvbl9jaGVjaycgIFx1MjAxNCBjb3JyZWN0bmVzcyBpcyBoaWRkZW4gdW50aWwgdGhlIHN0dWRlbnQgY2hlY2tzIHRoZSBzZWN0aW9uXG4vLyAgICAgICAgICAgICAgICAgKGxvY2tlZC9mcmVlKSBvciBzdWJtaXRzIChzaW5nbGUpLiBBbiBhc3Nlc3NtZW50LXN0eWxlXG4vLyAgICAgICAgICAgICAgICAgZXhwZXJpZW5jZSB0aGF0IGRvZXNuJ3QgbGVhayBhbnN3ZXJzIGJlZm9yZSB0aGUgZ2F0ZS5cbi8vIE9ydGhvZ29uYWwgdG8gc3VibWlzc2lvbk1vZGUgXHUyMDE0IGFueSBjaGVja3BvaW50IGJlaGF2aW9yIGNhbiBwYWlyIHdpdGhcbi8vIGVpdGhlciBmZWVkYmFjayB0aW1pbmcgKHRoZSBzYW1lIHJlYXNvbiByZXZpc2lvbk1vZGUgaXMgaXRzIG93biBmaWVsZCkuXG4vLyBEZWZhdWx0ICdvbl9jaGVjayc6IHRoZSBjaGVja3BvaW50IG1vZGVsIGltcGxpZXMgXCJhbnN3ZXIsIHRoZW4gY2hlY2tcIixcbi8vIGFuZCBsZWFraW5nIGNvcnJlY3RuZXNzIG9uIGJsdXIgdW5kZXJjdXQgdGhhdC4gTk9URSB0aGUgcnVudGltZSBkZWZhdWx0cyBhXG4vLyBNSVNTSU5HIGFuc3dlckZlZWRiYWNrIChhY3Rpdml0aWVzIHB1Ymxpc2hlZCBiZWZvcmUgdGhpcyBmaWVsZCBleGlzdGVkKSB0b1xuLy8gJ2ltbWVkaWF0ZScsIHByZXNlcnZpbmcgdGhlaXIgb3JpZ2luYWwgYmVoYXZpb3IgXHUyMDE0IHRoZSBzY2hlbWEgZGVmYXVsdCBhbmRcbi8vIHRoZSBydW50aW1lIGJhY2stY29tcGF0IGZhbGxiYWNrIGRpZmZlciBvbiBwdXJwb3NlLlxuLy9cbi8vIHNraWxscyBpcyBhbiBhcnJheSBvZiB1bml2ZXJzYWwgc2tpbGwgdGFncyBkZXNjcmliaW5nIHdoYXQgdGhlIGFjdGl2aXR5XG4vLyB0ZWFjaGVzLiBBY3Rpb24tb3JpZW50ZWQsIGZyYW1ld29yay1uZXV0cmFsOiBcInNpbXBsaWZ5aW5nIHJhdGlvbmFsXG4vLyBleHByZXNzaW9uc1wiLCBcImZhY3RvcmluZyBxdWFkcmF0aWNzXCIsIFwiZ3JhcGhpbmcgcGFyYWJvbGFzXCIuIEEgdGVhY2hlciB3aG9cbi8vIHdhbnRzIHRvIHVzZSBURUtTIG9yIENDU1MgY29kZXMgY2FuIFx1MjAxNCB0aGUgZmllbGQgZG9lc24ndCB2YWxpZGF0ZSBhZ2FpbnN0XG4vLyBhbnkgZnJhbWV3b3JrLiBQaGFzZSA1IG1hcmtldHBsYWNlIGFkZHMgY29udHJvbGxlZCB2b2NhYnVsYXJ5IG9uIHRvcC5cbi8vXG4vLyBwcmludCBpcyB0aGUgdGVhY2hlci1jb25maWd1cmFibGUgcHJpbnQgbGF5ZXIgKHNlZSBQcmludENvbmZpZyBiZWxvdykuIEl0XG4vLyBpcyBhbHdheXMgcHJlc2VudCBhZnRlciBwYXJzZSAoZGVmYXVsdCB7fSksIHNvIGV2ZXJ5IGNvbnN1bWVyIGNhbiByZWFkXG4vLyBkb2MubWV0YS5wcmludC4qIHdpdGhvdXQgYW4gdW5kZWZpbmVkIGNoZWNrOyBkb2N1bWVudHMgc3RvcmVkIGJlZm9yZSB0aGlzXG4vLyBmaWVsZCBleGlzdGVkIGdldCB0aGUgZGVmYXVsdHMgYXBwbGllZCBvbiByZWFkLiBUaGUgZGVmYXVsdHMga2VlcCB0aGVcbi8vIFN0YWdlIDExIGJhc2VsaW5lIHBhZ2UgZ2VvbWV0cnkgKHNpbmdsZSBjb2x1bW4sIDAuNWluIG1hcmdpbiwgbGV0dGVyKSBhbmRcbi8vIGFkZCB0aGUgcHJpbnQgdHlwb2dyYXBoeSBTdGFnZSAxMSBkZWxpYmVyYXRlbHkgZGVmZXJyZWQgdG8gdGhpcyBmZWF0dXJlXG4vLyAoMTFwdCBib2R5LCAxcmVtIHByb2JsZW0gc3BhY2luZykgXHUyMDE0IHNvIGEgZnJlc2hseSBwdWJsaXNoZWQgcGFnZSBwcmludHMgaW4gYVxuLy8gc2Vuc2libGUgZGVmYXVsdCBzdHlsZSwgYW5kIHRoZSB0ZWFjaGVyIHR1bmVzIGZyb20gdGhlcmUuXG5cbi8vIFByaW50SGVhZGVyOiB3aGljaCBsYWJlbGVkIGZpbGwtaW4gbGluZXMgYXBwZWFyIGF0IHRoZSB0b3Agb2YgYSBwcmludGVkXG4vLyBzaGVldC4gTmFtZSArIERhdGUgYXJlIHRoZSBuZWFyLXVuaXZlcnNhbCBwYWlyLCBzbyB0aGV5IGRlZmF1bHQgb247IHRoZVxuLy8gcmVzdCBkZWZhdWx0IG9mZi4gY3VzdG9tIGhvbGRzIGV4dHJhIHRlYWNoZXItYXV0aG9yZWQgbGFiZWxzIChlLmcuXG4vLyBcIkJsb2NrXCIsIFwiVGVhY2hlclwiKSByZW5kZXJlZCBhcyB0aGVpciBvd24gZmlsbC1pbiBsaW5lcy4gVGhlIGhlYWRlciBpc1xuLy8gcHJpbnQtb25seSBcdTIwMTQgaXQgbmV2ZXIgc2hvd3Mgb24gc2NyZWVuICh0aGUgb24tc2NyZWVuIGlkZW50aXR5IHByb21wdCBpcyB0aGVcbi8vIGxpdmUgbmFtZSBmaWVsZCk7IHNlZSByZW5kZXJQcmludEhlYWRlciArIHRoZSBAbWVkaWEgcHJpbnQgcnVsZXMuXG5leHBvcnQgY29uc3QgUHJpbnRIZWFkZXIgPSB6Lm9iamVjdCh7XG4gIG5hbWU6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbTogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbn0pO1xuZXhwb3J0IHR5cGUgUHJpbnRIZWFkZXIgPSB6LmluZmVyPHR5cGVvZiBQcmludEhlYWRlcj47XG5cbi8vIFByaW50Q29uZmlnOiB0aGUgdGVhY2hlcidzIHByaW50IHNldHRpbmdzIGZvciBhbiBhY3Rpdml0eS4gRXZlcnkgZmllbGQgaXNcbi8vIGRlZmF1bHRlZCBzbyBQcmludENvbmZpZy5wYXJzZSh7fSkgeWllbGRzIGEgY29tcGxldGUsIGJhc2VsaW5lLWVxdWl2YWxlbnRcbi8vIGNvbmZpZyBcdTIwMTQgdGhhdCBpcyB3aGF0IEFjdGl2aXR5TWV0YS5wcmludCBmYWxscyBiYWNrIHRvLlxuLy9cbi8vICAgcGFwZXJTaXplICAgICAgXHUyMDE0ICdsZXR0ZXInIHwgJ2E0Jy4gRHJpdmVzIHRoZSBAcGFnZSBzaXplIGtleXdvcmQuIERlZmF1bHRcbi8vICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgZm9yIG5vdyAoTlovQTQgaXMgYSBvbmUtbGluZSBmbGlwIGxhdGVyKTsgZW1pdHRlZFxuLy8gICAgICAgICAgICAgICAgICAgIGFzIGEgTElURVJBTCBAcGFnZSBydWxlLCBuZXZlciBhIENTUyB2YXIsIGJlY2F1c2UgQHBhZ2Vcbi8vICAgICAgICAgICAgICAgICAgICBydWxlcyBjYW5ub3QgcmVsaWFibHkgcmVhZCBjdXN0b20gcHJvcGVydGllcy5cbi8vICAgY29sdW1ucyAgICAgICAgXHUyMDE0IDEuLjMuIGNvbHVtbi1jb3VudCBpbiBwcmludDsgMSBpcyBhIG5vLW9wIChzaW5nbGUgY29sKS5cbi8vICAgICAgICAgICAgICAgICAgICBET1JNQU5UOiB0aGUgYXV0aG9yLWZhY2luZyBjb250cm9sIHdhcyByZXRpcmVkIHdoZW5cbi8vICAgICAgICAgICAgICAgICAgICBzdHJ1Y3R1cmFsIGF1dGhvcmVkIGNvbHVtbnMgKHRoZSBSb3cvQ29sdW1uIGxheW91dFxuLy8gICAgICAgICAgICAgICAgICAgIHByaW1pdGl2ZSkgbGFuZGVkIFx1MjAxNCBhIG11bHRpLWNvbHVtbiByb3cgcmVuZGVycyBjb25zaXN0ZW50bHlcbi8vICAgICAgICAgICAgICAgICAgICBvbiBzY3JlZW4sIGluIHdvcmtzaGVldCBwcmludCwgYW5kIGluc2lkZSBhIGZvbGRhYmxlLCBzb1xuLy8gICAgICAgICAgICAgICAgICAgIHRoaXMgcGVyLW1vZGUgcHJpbnQgc2V0dGluZyBiZWNhbWUgcmVkdW5kYW50LiBUaGUgZmllbGQgK1xuLy8gICAgICAgICAgICAgICAgICAgIGl0cyByZW5kZXJlciB2YXIvQ1NTIGFyZSBrZXB0IChub3QgZGVsZXRlZCkgc28gdmFsdWVzXG4vLyAgICAgICAgICAgICAgICAgICAgYWxyZWFkeSBzYXZlZCBvbiBleGlzdGluZyBhY3Rpdml0aWVzIGtlZXAgcHJpbnRpbmcgYXNcbi8vICAgICAgICAgICAgICAgICAgICBhdXRob3JlZCwgYW5kIHNvIHRoZSBjb250cm9sIGNhbiBiZSByZS1leHBvc2VkIGxhdGVyIHdpdGhcbi8vICAgICAgICAgICAgICAgICAgICBubyBzY2hlbWEvcmVuZGVyZXIgY2hhbmdlLiBOZXcgYWN0aXZpdGllcyBkZWZhdWx0IHRvIDEuXG4vLyAgIHdvcmtTcGFjZSAgICAgIFx1MjAxNCByZW0gb2YgYmxhbmsgc3BhY2UgYmVsb3cgZWFjaCBwcm9ibGVtIGZvciBoYW5kLXdvcmtpbmcuXG4vLyAgICAgICAgICAgICAgICAgICAgQWN0aXZpdHktbGV2ZWwgZGVmYXVsdDsgYSBmaWxsLWluLWJsYW5rIGJsb2NrIG1heSBvdmVycmlkZVxuLy8gICAgICAgICAgICAgICAgICAgIGl0IHBlci1wcm9ibGVtIHZpYSBGaWxsSW5CbGFua0Jsb2NrLndvcmtTcGFjZS5cbi8vICAgZm9udFNpemUgICAgICAgXHUyMDE0IHB0LiBBcHBsaWVkIHRvIC5hY3Rpdml0eS1jb250YWluZXIgaW4gcHJpbnQgb25seS5cbi8vICAgcHJvYmxlbVNwYWNpbmcgXHUyMDE0IHJlbSBvZiB2ZXJ0aWNhbCBtYXJnaW4gYXJvdW5kIGVhY2ggcHJvYmxlbSBpbiBwcmludC5cbi8vICAgbWFyZ2luICAgICAgICAgXHUyMDE0IGluY2hlcy4gVGhlIEBwYWdlIG1hcmdpbiAobGl0ZXJhbCwgbGlrZSBwYXBlclNpemUpLlxuLy8gICBncmlkTGluZXMgICAgICBcdTIwMTQgYWN0aXZpdHktd2lkZSBkZWZhdWx0IGZvciBydWxlZCByb3dzLiBBIFJvdyB3aXRoXG4vLyAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOidpbmhlcml0JyAodGhlIHBlci1yb3cgZGVmYXVsdCkgcmVzb2x2ZXMgdG8gdGhpcztcbi8vICAgICAgICAgICAgICAgICAgICAnb24nLydvZmYnIG9uIGEgcm93IG92ZXJyaWRlIGl0LiBPZmYgYnkgZGVmYXVsdCBcdTIwMTQgcnVsZWRcbi8vICAgICAgICAgICAgICAgICAgICBncmlkcyBhcmUgb3B0LWluLlxuLy8gICBwcmludFJlZmVyZW5jZVBhbmVsIFx1MjAxNCB3aGV0aGVyIHRoZSBhY3Rpdml0eSdzIHJlZmVyZW5jZSBwYW5lbCBwcmludHMgYXMgYVxuLy8gICAgICAgICAgICAgICAgICAgIGJveCBhdCB0aGUgdG9wIG9mIHRoZSB3b3Jrc2hlZXQuIE9uIGJ5IGRlZmF1bHQ7IGEgdGVhY2hlclxuLy8gICAgICAgICAgICAgICAgICAgIHdpdGggYSBjbGFzcyBzZXQgb2YgY2hhcnRzIGNhbiB0dXJuIGl0IG9mZiBzbyBpdCBpc24ndFxuLy8gICAgICAgICAgICAgICAgICAgIHJlcHJpbnRlZCBwZXIgYWN0aXZpdHkuIEdhdGVzIFBSSU5UIGFsb25lLCBhbmQgYXMgb2Zcbi8vICAgICAgICAgICAgICAgICAgICAyMDI2LTA4LTIzIHRoYXQgaXMgdHJ1ZSBhZ2FpbiByYXRoZXIgdGhhbiBtZXJlbHkgY2xhaW1lZDpcbi8vICAgICAgICAgICAgICAgICAgICB0aGUgcGFuZWwncyBTQ1JFRU4gc3VyZmFjZSBpcyBiYWNrIChhIHN1bW1vbmVkIHBhbmVsIGluXG4vLyAgICAgICAgICAgICAgICAgICAgdGhlIHZpZXdlciksIHNvIHR1cm5pbmcgdGhpcyBvZmYgbWVhbnMgc2NyZWVuLW9ubHkgaW5zdGVhZFxuLy8gICAgICAgICAgICAgICAgICAgIG9mIGludmlzaWJsZS1ldmVyeXdoZXJlLiBCZXR3ZWVuIFM5IERyb3AgNCBhbmQgdGhhdCBzbGljZVxuLy8gICAgICAgICAgICAgICAgICAgIHByaW50IFdBUyB0aGUgb25seSBzdXJmYWNlLCB3aGljaCBtYWRlIHRoaXMgZmxhZyBhIHRyYXAuXG4vLyAgICAgICAgICAgICAgICAgICAgUmVhZCBieSB0aGUgdmlld2VyJ3MgcHJpbnQgbGF5ZXI7IG5vdCBhIGNvbnRhaW5lciBDU1MgdmFyLlxuLy8gICBwcmludERlZmluaXRpb25HbG9zc2FyeSBcdTIwMTQgd2hldGhlciBpbmxpbmUgdm9jYWJ1bGFyeSBkZWZpbml0aW9ucyBwcmludCBhcyBhXG4vLyAgICAgICAgICAgICAgICAgICAgZ2xvc3NhcnkgYXBwZW5kaXggYXQgdGhlIEVORCBvZiB0aGUgd29ya3NoZWV0LiBPRkYgYnlcbi8vICAgICAgICAgICAgICAgICAgICBkZWZhdWx0LCB1bmxpa2UgcHJpbnRSZWZlcmVuY2VQYW5lbDogb24gc2NyZWVuIGEgZGVmaW5pdGlvblxuLy8gICAgICAgICAgICAgICAgICAgIGlzIGEgcG9wb3ZlciBhIHN0dWRlbnQgb3BlbnMgb24gZGVtYW5kLCBhbmQgbW9zdCBhcmUgYVxuLy8gICAgICAgICAgICAgICAgICAgIHNob3J0IGdsb3NzIHRoYXQgd291bGQgb25seSBwYWQgdGhlIHByaW50b3V0LiBBIHRlYWNoZXIgd2hvXG4vLyAgICAgICAgICAgICAgICAgICAgaGFzIHB1dCBhIGZvcm11bGEgb3IgYSBkaWFncmFtIGluIGEgZGVmaW5pdGlvbiB0dXJucyB0aGlzXG4vLyAgICAgICAgICAgICAgICAgICAgb24gc28gaXQgc3Vydml2ZXMgb24gcGFwZXIgKGRlZmluaXRpb24gcG9wb3ZlcnMgYXJlXG4vLyAgICAgICAgICAgICAgICAgICAgZGlzcGxheTpub25lIGluIHByaW50KS4gUmVhZCBieSB0aGUgcmVuZGVyZXIgdG8gZGVjaWRlXG4vLyAgICAgICAgICAgICAgICAgICAgd2hldGhlciB0byBlbWl0IHRoZSBhcHBlbmRpeDsgbm90IGEgY29udGFpbmVyIENTUyB2YXIuXG4vLyAgIGhlYWRlciAgICAgICAgIFx1MjAxNCBzZWUgUHJpbnRIZWFkZXIuXG4vL1xuLy8gY29sdW1ucy93b3JrU3BhY2UvZm9udFNpemUvcHJvYmxlbVNwYWNpbmcgcmlkZSBhcyAtLXByaW50LSogQ1NTIHZhcnMgb24gdGhlXG4vLyBjb250YWluZXIgKG5vcm1hbCBzZWxlY3RvcnMgY2FuIHJlYWQgdGhlbSk7IHBhcGVyU2l6ZS9tYXJnaW4gYXJlIGVtaXR0ZWQgYXNcbi8vIGEgcGVyLWRvY3VtZW50IGxpdGVyYWwgQHBhZ2UgcnVsZS4gZ3JpZExpbmVzIGlzIG5vdCBhIGNvbnRhaW5lciB2YXIgXHUyMDE0IGl0IGlzXG4vLyByZXNvbHZlZCBwZXIgcm93IGF0IHJlbmRlciB0aW1lIChzZWUgcmVuZGVyUm93KS5cbmV4cG9ydCBjb25zdCBQcmludENvbmZpZyA9IHoub2JqZWN0KHtcbiAgcGFwZXJTaXplOiB6LmVudW0oWydsZXR0ZXInLCAnYTQnXSkuZGVmYXVsdCgnbGV0dGVyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uczogei5udW1iZXIoKS5pbnQoKS5taW4oMSkubWF4KDMpLmRlZmF1bHQoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya1NwYWNlOiB6Lm51bWJlcigpLm1pbigwKS5kZWZhdWx0KDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkuZGVmYXVsdCgxMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvYmxlbVNwYWNpbmc6IHoubnVtYmVyKCkubWluKDApLmRlZmF1bHQoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiB6Lm51bWJlcigpLm1pbigwKS5kZWZhdWx0KDAuNSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmludFJlZmVyZW5jZVBhbmVsOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaW50RGVmaW5pdGlvbkdsb3NzYXJ5OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXI6IFByaW50SGVhZGVyLmRlZmF1bHQoe30pLFxufSk7XG5leHBvcnQgdHlwZSBQcmludENvbmZpZyA9IHouaW5mZXI8dHlwZW9mIFByaW50Q29uZmlnPjtcblxuLy8gVHlwb2dyYXBoeTogdGhlIGFjdGl2aXR5LXdpZGUgZm9udCArIGJhc2UgYm9keSBzaXplIChhdXRob3ItYXBwcm92ZWRcbi8vIDIwMjYtMDctMDgpLiBPTkUgZm9udCBhbmQgT05FIGJhc2Ugc2l6ZSBmb3IgdGhlIHdob2xlIGFjdGl2aXR5IFx1MjAxNCBwdWJsaXNoZWRcbi8vIHBhZ2UsIGVkaXRvciBjYW52YXMsIGFuZCBwcmludCB2aWV3IGFsbCByZWFkIHRoZSBzYW1lIGNvbmZpZyBzbyBhdXRob3JpbmcgaXNcbi8vIFdZU0lXWUcuIE9wdGlvbmFsIGFuZCBhZGRpdGl2ZTogZG9jdW1lbnRzIHN0b3JlZCBiZWZvcmUgdGhpcyBmaWVsZCBleGlzdGVkXG4vLyBwYXJzZSB1bmNoYW5nZWQgKG5vIHNjaGVtYVZlcnNpb24gYnVtcCksIGFuZCB0aGUgZWRpdG9yIG9taXRzIHRoZSBmaWVsZFxuLy8gZW50aXJlbHkgd2hpbGUgaXQgaG9sZHMgdGhlIGRlZmF1bHRzIHNvIHVudG91Y2hlZCBkb2N1bWVudHMgc3RheVxuLy8gc3RydWN0dXJhbGx5IGlkZW50aWNhbC5cbi8vXG4vLyAgIGZvbnQgICAgIFx1MjAxNCBhbiBpZCBpbnRvIHRoZSByZW5kZXJlcidzIEZPTlRfUkVHSVNUUlkgKHRoZSBDU1Mgc3BlY2lmaWNzIFx1MjAxNFxuLy8gICAgICAgICAgICAgIGZhbWlseSBuYW1lLCBmYWxsYmFjayBzdGFjaywgV09GRjIgZmlsZXMgXHUyMDE0IGxpdmUgcmVuZGVyZXItc2lkZTtcbi8vICAgICAgICAgICAgICB0aGUgc2NoZW1hIG9ubHkgY29uc3RyYWlucyB0aGUgbWVudSkuICdkZWZhdWx0JyA9IHRoZSBjdXJyZW50XG4vLyAgICAgICAgICAgICAgc3lzdGVtIHN0YWNrLCBubyBmb250IGRvd25sb2FkLiBUaGUgb3RoZXIgZm91ciBhcmUgU0lMIE9GTFxuLy8gICAgICAgICAgICAgIGZhY2VzIHNlbGYtaG9zdGVkIGFzIFdPRkYyIG9uIFIyIChubyBHb29nbGUgQ0ROIGRlcGVuZGVuY3kgb25cbi8vICAgICAgICAgICAgICBwdWJsaXNoZWQgcGFnZXMpLlxuLy8gICBmb250U2l6ZSBcdTIwMTQgYmFzZSBCT0RZIHNpemUgaW4gcHgsIGFwcGxpZWQgb24gc2NyZWVuIHZpYVxuLy8gICAgICAgICAgICAgIC0tYWN0aXZpdHktZm9udC1zaXplLiBQcmludCBib2R5IHNpemluZyBzdGF5cyBvd25lZCBieVxuLy8gICAgICAgICAgICAgIG1ldGEucHJpbnQuZm9udFNpemUgKHB0KSBcdTIwMTQgdGhlIEBtZWRpYSBwcmludCBydWxlIG92ZXJyaWRlcyB0aGVcbi8vICAgICAgICAgICAgICBzY3JlZW4gc2l6ZSwgc28gdGhlIHR3byBuZXZlciBmaWdodC4gSGVhZGluZ3MgYXJlIGVtLXJlbGF0aXZlXG4vLyAgICAgICAgICAgICAgYW5kIHNjYWxlIG9mZiB3aGljaGV2ZXIgYmFzZSBpcyBpbiBlZmZlY3QuXG4vL1xuLy8gUGVyLXNwYW4gZm9udC9zaXplIG1hcmtzIGFyZSBQQVJLRUQgYnV0IGRlc2lnbmVkIGZvcjogdGhpcyBhY3Rpdml0eS13aWRlXG4vLyBsYXllciBvbmx5IHNldHMgQ1NTIHZhcnMgKyBAZm9udC1mYWNlLCBzbyBhIGZ1dHVyZSBgdGV4dFN0eWxlYCBtYXJrIGNhblxuLy8gc2xvdCBpbiBhZGRpdGl2ZWx5IChzcGFuLWxldmVsIGlubGluZSBzdHlsZXMgd2luIHRoZSBjYXNjYWRlOyB0aGVcbi8vIHJlbmRlcmVyJ3MgZm9udEZhY2VDc3MgYWxyZWFkeSB0YWtlcyBhIExJU1Qgb2YgZmFtaWxpZXMgdG8gZW1iZWQpLlxuZXhwb3J0IGNvbnN0IEFjdGl2aXR5Rm9udCA9IHouZW51bShbXG4gICdkZWZhdWx0JyxcbiAgJ2xleGVuZCcsXG4gICdhdGtpbnNvbi1oeXBlcmxlZ2libGUnLFxuICAnYW5kaWthJyxcbiAgJ2NvbWljLW5ldWUnLFxuXSk7XG5leHBvcnQgdHlwZSBBY3Rpdml0eUZvbnQgPSB6LmluZmVyPHR5cGVvZiBBY3Rpdml0eUZvbnQ+O1xuXG5leHBvcnQgY29uc3QgVHlwb2dyYXBoeSA9IHoub2JqZWN0KHtcbiAgZm9udDogQWN0aXZpdHlGb250LmRlZmF1bHQoJ2RlZmF1bHQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogei5udW1iZXIoKS5taW4oMTIpLm1heCgyNCkuZGVmYXVsdCgxNiksXG59KTtcbmV4cG9ydCB0eXBlIFR5cG9ncmFwaHkgPSB6LmluZmVyPHR5cGVvZiBUeXBvZ3JhcGh5PjtcblxuZXhwb3J0IGNvbnN0IEFjdGl2aXR5TWV0YSA9IHoub2JqZWN0KHtcbiAgdGl0bGU6IHouc3RyaW5nKCkubWluKDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC5taW4oMSk6IGNvdXJzZSBpcyBzdGFtcGVkIGludG8gdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWN0aXZpdGllcy5jb3Vyc2UgY29sdW1uIGF0IHB1Ymxpc2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAoMDAzNywgdGF4b25vbXkgUjEpIHdoZXJlIGl0IGlzIGBub3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBudWxsYCBcdTIwMTQgYSBibGFuayBjb3Vyc2Ugd291bGQgcHVibGlzaCBhblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtcHR5IGZhY2V0IGludG8gdGhlIGNhdGFsb2cuIFRoZSBlZGl0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmYWxscyBiYWNrIHRvIHRoZSBkZWZhdWx0IHJhdGhlciB0aGFuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXZlciBzZW5kaW5nIGEgYmxhbmsgKEFjdGl2aXR5RWRpdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2F2ZSgpLCBzYW1lIGd1YXJkIHRpdGxlIGFscmVhZHkgaGFzKS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3Vyc2U6IHouc3RyaW5nKCkubWluKDEpLmRlZmF1bHQoJ0FsZ2VicmEgSUknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml0OiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWlzc2lvbk1vZGU6IHouZW51bShbJ3NpbmdsZScsICdsb2NrZWQnLCAnZnJlZSddKS5kZWZhdWx0KCdmcmVlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV2aXNpb25Nb2RlOiB6LmVudW0oWydmcmVlJywgJ2xvY2tlZCddKS5kZWZhdWx0KCdmcmVlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JhZGluZ01vZGU6IHouZW51bShbJ2F1dG8nLCAnbWFudWFsJywgJ21peGVkJ10pLmRlZmF1bHQoJ2F1dG8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpdml0eVR5cGU6IHouZW51bShbJ3dvcmtzaGVldCcsICdleGl0X3RpY2tldCcsICd3YXJtX3VwJywgJ3JldmlldyddKS5kZWZhdWx0KCd3b3Jrc2hlZXQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXJGZWVkYmFjazogei5lbnVtKFsnaW1tZWRpYXRlJywgJ29uX2NoZWNrJ10pLmRlZmF1bHQoJ29uX2NoZWNrJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaW50OiBQcmludENvbmZpZy5kZWZhdWx0KHt9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBvZ3JhcGh5OiBUeXBvZ3JhcGh5Lm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIEFjdGl2aXR5TWV0YSA9IHouaW5mZXI8dHlwZW9mIEFjdGl2aXR5TWV0YT47XG5cbi8vIFRoZSB0b3AtbGV2ZWwgZG9jdW1lbnQuIEFsd2F5cyB2YWxpZGF0ZSB1c2VyLWZhY2luZyBpbnB1dCB0aHJvdWdoIHRoaXNcbi8vIGJlZm9yZSBzdG9yaW5nLiBUaGUgRWRnZSBGdW5jdGlvbnMgcGFyc2UgaW5jb21pbmcgZHJhZnRzIHdpdGggdGhpcyBzY2hlbWFcbi8vIGFuZCByZWplY3QgbWFsZm9ybWVkIGRvY3VtZW50cyB3aXRoIGEgNDAwLlxuLy8gUmVmZXJlbmNlUGFuZWw6IG9wdGlvbmFsIHN0aWNreS1zaWRlYmFyIGNvbnRlbnQgc3R1ZGVudHMgY29uc3VsdCB3aGlsZVxuLy8gd29ya2luZyBcdTIwMTQgZm9ybXVsYSBjaGFydHMsIHBlcmlvZGljIHRhYmxlcywgdm9jYWJ1bGFyeSBsaXN0cywgY29udmVyc2lvblxuLy8gdGFibGVzLCB1bml0LWNpcmNsZSBkaWFncmFtcywgc2VudGVuY2Utc3RlbSBwcm9tcHRzLCBmb3JlaWduLWxhbmd1YWdlXG4vLyB2ZXJiIHRhYmxlcywgcHJpbWFyeS1zb3VyY2UgZXhjZXJwdHMsIG1hcHMuIFRoZSBibG9ja3MgYXJyYXkgdXNlcyB0aGVcbi8vIHNhbWUgQmxvY2sgc2NoZW1hIGFzIHNlY3Rpb24gY29udGVudDsgbm8gbmV3IGJsb2NrIHR5cGVzIGFyZSBuZWVkZWRcbi8vIGZvciB0aGUgcGFuZWwuXG4vL1xuLy8gUGhhc2UgMTogdGhlIHNjaGVtYSBhY2NlcHRzIHRoZSBmaWVsZCBhcyBmb3J3YXJkLWNvbXBhdDsgdGhlIGVkaXRvclxuLy8gZG9lc24ndCBzdXJmYWNlIGl0LCBhbmQgdGhlIHJlbmRlcmVyIGlnbm9yZXMgaXQuIFBoYXNlIDIgd2lyZXMgdXAgdGhlXG4vLyBhdXRob3JpbmcgVUkgYW5kIHRoZSBzaWRlYmFyIGxheW91dCBpbiBwdWJsaXNoZWQgSFRNTC4gRmllbGQgaXNcbi8vIG9wdGlvbmFsIHdpdGggbm8gZGVmYXVsdCBvbiBBY3Rpdml0eURvY3VtZW50LCBzbyBleGlzdGluZyBzdG9yZWRcbi8vIGRvY3VtZW50cyBwYXJzZSBjbGVhbmx5LlxuLy9cbi8vIFJlbmRlcmVyIHdpbGwgdHJlYXQgcmVmZXJlbmNlIGNvbnRlbnQgYXMgZGF0YS1ibG9jay1jYXRlZ29yeT1cInNjYWZmb2xkXCJcbi8vIChQaGFzZSAyKykgXHUyMDE0IGRvZXNuJ3QgY29udHJpYnV0ZSB0byBzY29yaW5nIG9yIGNoZWNrcG9pbnQgYmVoYXZpb3IuXG5leHBvcnQgY29uc3QgUmVmZXJlbmNlUGFuZWwgPSB6Lm9iamVjdCh7XG4gIHRpdGxlOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBibG9ja3M6IHouYXJyYXkoQmxvY2spLFxufSk7XG5leHBvcnQgdHlwZSBSZWZlcmVuY2VQYW5lbCA9IHouaW5mZXI8dHlwZW9mIFJlZmVyZW5jZVBhbmVsPjtcblxuLy8gQ2FsY3VsYXRvciB0b29sOiBhbiBhY3Rpdml0eS1sZXZlbCBzY2FmZm9sZCwgYSBzaWJsaW5nIHRvIHRoZSByZWZlcmVuY2Vcbi8vIHBhbmVsIFx1MjAxNCBhIHRlYWNoZXItY29uZmlndXJhYmxlIG9uLXNjcmVlbiBjYWxjdWxhdG9yIGEgc3R1ZGVudCBzdW1tb25zIHdoaWxlXG4vLyB3b3JraW5nIChsaWtlIHRoZSBjYWxjdWxhdG9yIGFsbG93ZWQgb24gYSBkaWdpdGFsIFNBVCkuIEl0IGlzIE5FVkVSIHNjb3JlZCxcbi8vIHByb2R1Y2VzIG5vIHN1Ym1pc3Npb24sIGFuZCBjYXJyaWVzIG5vIGFuc3dlciBrZXk7IHRoZSByZW5kZXJlciB0cmVhdHMgaXQgYXNcbi8vIGRhdGEtYmxvY2stY2F0ZWdvcnk9XCJzY2FmZm9sZFwiIChvdXRzaWRlIGFueSAuYWN0aXZpdHktc2VjdGlvbiwgc28gdGhlIHNjb3Jpbmdcbi8vIHJ1bnRpbWUgbmV2ZXIgc2VlcyBpdCkuIEl0IHRyYXZlbHMgaW4gdGhlIHdpcmUgZm9ybWF0LCBjb25maWd1cmVkIG9uY2UgcGVyXG4vLyBhY3Rpdml0eSwgYW5kIGlzIG9wdGlvbmFsIHNvIGV4aXN0aW5nIHN0b3JlZCBkb2N1bWVudHMgcGFyc2UgdW5jaGFuZ2VkIFx1MjAxNCBub1xuLy8gc2NoZW1hVmVyc2lvbiBidW1wIChzYW1lIGZvcndhcmQtY29tcGF0IHN0b3J5IGFzIHJlZmVyZW5jZVBhbmVsL3ByaW50KS5cbi8vXG4vLyBSZXN0cmljdGlvbnMgYXJlIFBFUk1JU1NJVkUgYnkgZGVmYXVsdDogYW4gZW5hYmxlZC1idXQtdW5jb25maWd1cmVkXG4vLyBjYWxjdWxhdG9yIGlzIGEgZnVsbCB0b29sOyB0ZWFjaGVycyBvcHQgSU5UTyByZXN0cmljdGlvbnMsIG5ldmVyIG91dCBvZlxuLy8gY2FwYWJpbGl0eS4gTGF0ZXIgZmxhZ3MgKGxvY2tWaWV3cG9ydCwgYWxsb3dlZFJlZ3Jlc3Npb25Nb2RlbHMsXG4vLyBtYXhFeHByZXNzaW9uc1x1MjAyNikgYXJlIGFkZGVkIGFkZGl0aXZlbHkgYXMgZ3JhcGhpbmctdHJhY2sgc3RhZ2VzIGxhbmQgXHUyMDE0IGFsbFxuLy8gb3B0aW9uYWwvZGVmYXVsdGVkLCBzbyBzdGlsbCBubyBzY2hlbWFWZXJzaW9uIGJ1bXAuXG4vL1xuLy8gYG1vZGVgIGlzIHRoZSBjYXBhYmlsaXR5IGNlaWxpbmcuIFRoZSBlbnVtIGNhcnJpZXMgdGhlIGZ1bGwgY29udHJhY3Qgbm93LCBidXRcbi8vIHRoZSBkZWZhdWx0IGlzICdzY2llbnRpZmljJyBiZWNhdXNlIHRoYXQgaXMgdGhlIG9ubHkgY2FwYWJpbGl0eSBTdGFnZSAxXG4vLyBpbXBsZW1lbnRzIFx1MjAxNCBhbiBlbmFibGVkIGNhbGN1bGF0b3IgZG9lcyBleGFjdGx5IHdoYXQgaXMgYnVpbHQuIFRoZSBkZWZhdWx0XG4vLyBtYXkgZmxpcCB0byAnZ3JhcGhpbmcnIG9uY2UgdGhlIGJvYXJkIGxheWVyIGxhbmRzIChTdGFnZSAyKS5cbi8vIFN0YWdlIDM6IHdoaWNoIGZpdCBtb2RlbHMgdGhlIGdyYXBoaW5nIGNhbGN1bGF0b3IncyBkYXRhL3JlZ3Jlc3Npb24gcGFuZWxcbi8vIG9mZmVycy4gUGVybWlzc2l2ZSBkZWZhdWx0IChhbGwgdGhyZWUpOyBhbiBFTVBUWSBhcnJheSB0dXJucyByZWdyZXNzaW9uIG9mZlxuLy8gZW50aXJlbHkgKG5vIGRhdGEgcGFuZWwpLiBPbmx5IG1lYW5pbmdmdWwgdW5kZXIgbW9kZSAnZ3JhcGhpbmcnIFx1MjAxNCB0aGVcbi8vICdzY2llbnRpZmljJyBjZWlsaW5nIGFscmVhZHkgZXhjbHVkZXMgdGhlIGJvYXJkIHRoZSBmaXRzIGRyYXcgb24uXG4vLyAnbG9nYXJpdGhtaWMnIGpvaW5lZCAyMDI2LTA3LTExIChjYWxjdWxhdG9yLXBhcml0eSBiYXRjaCk6IHRoZSBraXQgY29tcHV0ZWRcbi8vIGxvZyBmaXRzIGFsbCBhbG9uZzsgdGhlIGVudW0gd2FzIHRoZSBvbmx5IGdhcC4gTk9URSBhIHN0b3JlZCBkb2MgdGhhdCBjYXJyaWVzXG4vLyB0aGUgZXhwbGljaXQgdGhyZWUtbW9kZWwgYXJyYXkgc3RheXMgdGhyZWUtbW9kZWwgKGluZGlzdGluZ3Vpc2hhYmxlIGZyb20gYVxuLy8gZGVsaWJlcmF0ZSByZXN0cmljdGlvbikgdW50aWwgdGhlIHRlYWNoZXIgdG91Y2hlcyB0aGUgY29uZmlnIFx1MjAxNCBhY2NlcHRlZCBhdFxuLy8gdGhlIGRlc2lnbiBwYXNzOyB0aGUgcGVybWlzc2l2ZSBkZWZhdWx0IG9ubHkgYXBwbGllcyB3aGVuIHRoZSBmaWVsZCBpcyBhYnNlbnQuXG5leHBvcnQgY29uc3QgUmVncmVzc2lvbk1vZGVsID0gei5lbnVtKFtcbiAgJ2xpbmVhcicsXG4gICdxdWFkcmF0aWMnLFxuICAnZXhwb25lbnRpYWwnLFxuICAnbG9nYXJpdGhtaWMnLFxuXSk7XG5leHBvcnQgdHlwZSBSZWdyZXNzaW9uTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBSZWdyZXNzaW9uTW9kZWw+O1xuXG5leHBvcnQgY29uc3QgQ2FsY3VsYXRvclJlc3RyaWN0aW9ucyA9IHoub2JqZWN0KHtcbiAgbW9kZTogei5lbnVtKFsnc2NpZW50aWZpYycsICdncmFwaGluZyddKS5kZWZhdWx0KCdzY2llbnRpZmljJyksXG4gIGFsbG93VHJpZzogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgYWxsb3dMb2dFeHA6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gIC8vIEluZXF1YWxpdHkgcm93cyBpbiB0aGUgZ3JhcGhpbmcgZXhwcmVzc2lvbiBsaXN0IChjYWxjdWxhdG9yLXBhcml0eSBiYXRjaCkuXG4gIC8vIEFkZGl0aXZlICsgZGVmYXVsdGVkIGxpa2UgdGhlIG90aGVyIGdhdGVzIFx1MjAxNCBubyBzY2hlbWFWZXJzaW9uIGJ1bXA7IHRoZSBraXRcbiAgLy8gcmVhZHMgYSBtaXNzaW5nIHZhbHVlIGFzIHBlcm1pc3NpdmUsIHNvIG9sZCBwdWJsaXNoZWQgcGFnZXMgc3RheSBmdWxsLXRvb2wuXG4gIGFsbG93SW5lcXVhbGl0aWVzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICBhbGxvd2VkUmVncmVzc2lvbk1vZGVsczogelxuICAgIC5hcnJheShSZWdyZXNzaW9uTW9kZWwpXG4gICAgLmRlZmF1bHQoWydsaW5lYXInLCAncXVhZHJhdGljJywgJ2V4cG9uZW50aWFsJywgJ2xvZ2FyaXRobWljJ10pLFxuICAvLyBTdGFnZSA0OiBjYXAgb24gdGhlIGdyYXBoaW5nIGV4cHJlc3Npb24gbGlzdC4gQUJTRU5UID0gdW5saW1pdGVkICh0aGVcbiAgLy8gcGVybWlzc2l2ZSBkZWZhdWx0IFx1MjAxNCBvcHRpb25hbCwgbm90IGRlZmF1bHRlZCwgc28gaXQgc3RheXMgb3V0IG9mIHN0b3JlZFxuICAvLyBkb2NzIHVubGVzcyBhIHRlYWNoZXIgc2V0cyBpdCkuIEdyYXBoaW5nIG1vZGUgb25seS5cbiAgbWF4RXhwcmVzc2lvbnM6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm1heCg1MCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ2FsY3VsYXRvclJlc3RyaWN0aW9ucyA9IHouaW5mZXI8dHlwZW9mIENhbGN1bGF0b3JSZXN0cmljdGlvbnM+O1xuXG5leHBvcnQgY29uc3QgQ2FsY3VsYXRvclRvb2wgPSB6Lm9iamVjdCh7XG4gIGVuYWJsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICByZXN0cmljdGlvbnM6IENhbGN1bGF0b3JSZXN0cmljdGlvbnMuZGVmYXVsdCh7fSksXG59KTtcbmV4cG9ydCB0eXBlIENhbGN1bGF0b3JUb29sID0gei5pbmZlcjx0eXBlb2YgQ2FsY3VsYXRvclRvb2w+O1xuXG4vLyBUaGUgZXhwbGljaXQgdHlwZSArIHouWm9kVHlwZSBhbm5vdGF0aW9uIChpbnN0ZWFkIG9mIHouaW5mZXIpIGV4aXN0cyBiZWNhdXNlXG4vLyB0aGUgZnVsbHkgaW5mZXJyZWQgZG9jdW1lbnQgdHlwZSBvdXRncmV3IHRzYydzIGRlY2xhcmF0aW9uLXNlcmlhbGl6YXRpb25cbi8vIGxpbWl0IChUUzcwNTYpIHdoZW4gdGhlIEJsb2NrIHVuaW9uIHJlYWNoZWQgMTQgbWVtYmVycy4gU3RydWN0dXJhbGx5XG4vLyBpZGVudGljYWwgdG8gd2hhdCBpbmZlcmVuY2UgcHJvZHVjZWQ7IG5vdGhpbmcgaGVyZSBsb3NlcyB0eXBlIHNhZmV0eSBcdTIwMTRcbi8vIHRoZSBhbm5vdGF0aW9uIGlzIGNoZWNrZWQgYWdhaW5zdCB0aGUgb2JqZWN0IHNjaGVtYS5cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZpdHlEb2N1bWVudCB7XG4gIHNjaGVtYVZlcnNpb246IDI7XG4gIG1ldGE6IEFjdGl2aXR5TWV0YTtcbiAgc2VjdGlvbnM6IFNlY3Rpb25bXTtcbiAgcmVmZXJlbmNlUGFuZWw/OiBSZWZlcmVuY2VQYW5lbDtcbiAgY2FsY3VsYXRvcj86IENhbGN1bGF0b3JUb29sO1xufVxuZXhwb3J0IGNvbnN0IEFjdGl2aXR5RG9jdW1lbnQ6IHouWm9kVHlwZTxBY3Rpdml0eURvY3VtZW50LCB6LlpvZFR5cGVEZWYsIHVua25vd24+ID1cbiAgei5vYmplY3Qoe1xuICAgIHNjaGVtYVZlcnNpb246IHoubGl0ZXJhbCgyKSxcbiAgICBtZXRhOiBBY3Rpdml0eU1ldGEsXG4gICAgc2VjdGlvbnM6IHouYXJyYXkoU2VjdGlvbiksXG4gICAgcmVmZXJlbmNlUGFuZWw6IFJlZmVyZW5jZVBhbmVsLm9wdGlvbmFsKCksXG4gICAgY2FsY3VsYXRvcjogQ2FsY3VsYXRvclRvb2wub3B0aW9uYWwoKSxcbiAgfSk7XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHVwZ3JhZGUudHMgXHUyMDE0IHNlcnZlci1zaWRlIHVwZ3JhZGUtb24tcmVhZCAoY29tcG9uZW50cy1hcy1kYXRhIHJ1bGluZyA0QSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgcmVhZCBBUEkgKFMyKSB1cGdyYWRlcyBldmVyeSBzdG9yZWQgYWN0aXZpdHlfdmVyc2lvbnMuY29udGVudCB0byB0aGVcbi8vIENVUlJFTlQgc2NoZW1hIGJlZm9yZSBzYW5pdGl6aW5nIGFuZCBzZXJ2aW5nIGl0LCBzbyB0aGUgdmlld2VyIG9ubHkgZXZlclxuLy8gc2VlcyB0aGUgbGF0ZXN0IHNoYXBlLiBUaGlzIG1vZHVsZSBpcyB0aGF0IHNlYW0uXG4vL1xuLy8gVGhlIGNoYWluIGlzIEVNUFRZIHRvZGF5LCBkZWxpYmVyYXRlbHk6IHNjaGVtYVZlcnNpb24gaXMgMiBhbmQgdGhlIDFcdTIxOTIyXG4vLyByZXNoYXBlIHdhcyBhIGdyZWVuZmllbGQgaGFyZC1jdXQgd2l0aCBubyBtaWdyYXRlIHBhdGggKGRvY3VtZW50LnRzIGhlYWRlciBcdTIwMTRcbi8vIGEgc3RyYXkgdjEgZmFpbHMgbG91ZGx5IHJhdGhlciB0aGFuIG1pcy1wYXJzaW5nKS4gV2hlbiBzY2hlbWFWZXJzaW9uIDNcbi8vIGxhbmRzLCBpdHMgbWlncmF0aW9uIGlzIG9uZSBwdXJlIGVudHJ5IGluIFVQR1JBREVTIGJlbG93OyBzdG9yZWQgcm93cyBzdGF5XG4vLyBhdCB0aGVpciBvcmlnaW5hbCB2ZXJzaW9uIGZvcmV2ZXIgYW5kIGFyZSB1cGdyYWRlZCBvbiByZWFkLCBuZXZlciBtdXRhdGVkLlxuLy9cbi8vIERpc3RpbmN0IGZyb20gdGhlIHR3byBvdGhlciBcInVwZ3JhZGVcIiBsYXllcnMsIG9uIHB1cnBvc2U6XG4vLyAgIC0gTWFyay9kZWZpbml0aW9uIGxlZ2FjeSBwcmVwcm9jZXNzaW5nIChpbmxpbmUudHMpIHJ1bnMgSU5TSURFXG4vLyAgICAgQWN0aXZpdHlEb2N1bWVudC5wYXJzZSBcdTIwMTQgYWRkaXRpdmUgc2hhcGUgZHJpZnQgd2l0aGluIG9uZSBzY2hlbWFWZXJzaW9uLlxuLy8gICAtIG1pZ3JhdGVTdWJtaXNzaW9uUmVzcG9uc2VzIChzdWJtaXNzaW9uLnRzKSBpcyB0aGUgU1VCTUlTU0lPTiB3aXJlJ3Ncbi8vICAgICBsYWRkZXIgXHUyMDE0IGEgZGlmZmVyZW50IGRvY3VtZW50IHdpdGggaXRzIG93biB2ZXJzaW9uaW5nLlxuLy8gVGhpcyBtb2R1bGUgb3ducyBvbmx5IHRoZSB0b3AtbGV2ZWwgQWN0aXZpdHlEb2N1bWVudCBzY2hlbWFWZXJzaW9uLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgQWN0aXZpdHlEb2N1bWVudCB9IGZyb20gJy4vZG9jdW1lbnQuanMnO1xuXG4vKiogVGhlIHNjaGVtYVZlcnNpb24gdGhpcyBidWlsZCBwYXJzZXMgYW5kIHNlcnZlcy4gR3VhcmQtdGVzdGVkIGFnYWluc3QgdGhlXG4gKiBBY3Rpdml0eURvY3VtZW50IGxpdGVyYWwgc28gdGhlIGNvbnN0YW50IGNhbid0IGRyaWZ0IGZyb20gdGhlIHBhcnNlci4gKi9cbmV4cG9ydCBjb25zdCBBQ1RJVklUWV9TQ0hFTUFfVkVSU0lPTiA9IDI7XG5cbi8qKiBUaHJvd24gd2hlbiBzdG9yZWQgY29udGVudCBjYW5ub3QgYmUgYnJvdWdodCB0byB0aGUgY3VycmVudCBzY2hlbWEuIFRoZVxuICogcmVhZCBBUEkgbWFwcyB0aGlzIHRvIGFuIGV4cGxpY2l0IGVycm9yIHN0YXRlIChmYWlsdXJlLW1vZGVzIHRhYmxlOiBcInVwZ3JhZGVcbiAqIGNoYWluIGJ1ZyBvbiBvbGQgdmVyc2lvblwiIFx1MjE5MiBjbGVhciBlcnJvciwgbmV2ZXIgYSB3aGl0ZSBzY3JlZW4pLiAqL1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIC8qKiBUaGUgc2NoZW1hVmVyc2lvbiB0aGUgc3RvcmVkIGRvY3VtZW50IGNsYWltZWQsIHdoZW4gcmVhZGFibGUuICovXG4gICAgcmVhZG9ubHkgc3RvcmVkVmVyc2lvbj86IG51bWJlcixcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ1VwZ3JhZGVFcnJvcic7XG4gIH1cbn1cblxuLyoqIE9uZSBzdGVwIG9mIHRoZSBjaGFpbjogYSBQVVJFIGpzb24gXHUyMTkyIGpzb24gcmV3cml0ZSBmcm9tIGBmcm9tYCB0byBgZnJvbSsxYC5cbiAqIE5vIEkvTywgbm8gcmFuZG9tbmVzcywgbm8gRGF0ZSBcdTIwMTQgdXBncmFkaW5nIHRoZSBzYW1lIHN0b3JlZCByb3cgdHdpY2UgbXVzdFxuICogeWllbGQgaWRlbnRpY2FsIG91dHB1dCAodGhlIHBlci12ZXJzaW9uIHJlYWQgY2FjaGUgZGVwZW5kcyBvbiBpdCkuICovXG5pbnRlcmZhY2UgVXBncmFkZVN0ZXAge1xuICByZWFkb25seSBmcm9tOiBudW1iZXI7XG4gIHJlYWRvbmx5IHJ1bjogKHJhdzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG4vLyBUaGUgY2hhaW4uIEFwcGVuZC1vbmx5OyBlYWNoIGVudHJ5IGJ1bXBzIGV4YWN0bHkgb25lIHZlcnNpb24uIEVtcHR5IHRvZGF5IFx1MjAxNFxuLy8gc2VlIHRoZSBoZWFkZXIgZm9yIHdoeSB2MSBkZWxpYmVyYXRlbHkgaGFzIG5vIGVudHJ5LlxuY29uc3QgVVBHUkFERVM6IHJlYWRvbmx5IFVwZ3JhZGVTdGVwW10gPSBbXTtcblxuZXhwb3J0IGludGVyZmFjZSBVcGdyYWRlUmVzdWx0IHtcbiAgLyoqIFRoZSBkb2N1bWVudCwgcGFyc2VkIGFuZCB2YWxpZGF0ZWQgYXQgdGhlIENVUlJFTlQgc2NoZW1hLiAqL1xuICBkb2M6IEFjdGl2aXR5RG9jdW1lbnQ7XG4gIC8qKiBUaGUgc2NoZW1hVmVyc2lvbiB0aGUgc3RvcmVkIGNvbnRlbnQgYXJyaXZlZCBhdCAoPT09IGN1cnJlbnQgd2hlbiBub1xuICAgKiBjaGFpbiBzdGVwIHJhbikuIENhbGxlcnMgbWF5IGxvZyBpdDsgdGhlIGNhY2hlIHN0b3JlcyB0aGUgdGFyZ2V0LiAqL1xuICBmcm9tU2NoZW1hVmVyc2lvbjogbnVtYmVyO1xufVxuXG4vKipcbiAqIEJyaW5nIHJhdyBzdG9yZWQgY29udGVudCAoYWN0aXZpdHlfdmVyc2lvbnMuY29udGVudCkgdG8gdGhlIGN1cnJlbnQgc2NoZW1hXG4gKiBhbmQgdmFsaWRhdGUgaXQuIFRocm93cyBVcGdyYWRlRXJyb3Igb24gYW55IGNvbnRlbnQgdGhpcyBidWlsZCBjYW5ub3Qgc2VydmVcbiAqIFx1MjAxNCBhbiB1bmtub3duL2Z1dHVyZSB2ZXJzaW9uLCBhIHZlcnNpb24gd2l0aCBubyBjaGFpbiBwYXRoLCBvciBjb250ZW50IHRoYXRcbiAqIGZhaWxzIHZhbGlkYXRpb24gYWZ0ZXIgdXBncmFkaW5nLiBOZXZlciByZXR1cm5zIGEgcGFydGlhbGx5LXVwZ3JhZGVkIGRvYy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZ3JhZGVBY3Rpdml0eURvY3VtZW50KHJhdzogdW5rbm93bik6IFVwZ3JhZGVSZXN1bHQge1xuICBpZiAocmF3ID09PSBudWxsIHx8IHR5cGVvZiByYXcgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkocmF3KSkge1xuICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoJ1N0b3JlZCBjb250ZW50IGlzIG5vdCBhbiBvYmplY3QnKTtcbiAgfVxuICBjb25zdCBzdG9yZWQgPSByYXcgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGNvbnN0IHZlcnNpb24gPSBzdG9yZWQuc2NoZW1hVmVyc2lvbjtcbiAgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcih2ZXJzaW9uKSkge1xuICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoJ1N0b3JlZCBjb250ZW50IGhhcyBubyBpbnRlZ2VyIHNjaGVtYVZlcnNpb24nKTtcbiAgfVxuICBpZiAodmVyc2lvbiA+IEFDVElWSVRZX1NDSEVNQV9WRVJTSU9OKSB7XG4gICAgLy8gQ29udGVudCB3cml0dGVuIGJ5IGEgTkVXRVIgYnVpbGQgdGhhbiB0aGlzIG9uZSAoZGVwbG95LW9yZGVyIHNsaXApLlxuICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoXG4gICAgICBgU3RvcmVkIHNjaGVtYVZlcnNpb24gJHt2ZXJzaW9ufSBpcyBuZXdlciB0aGFuIHRoaXMgYnVpbGQncyBgICtcbiAgICAgICAgYCR7QUNUSVZJVFlfU0NIRU1BX1ZFUlNJT059IFx1MjAxNCByZWZ1c2luZyB0byBndWVzc2AsXG4gICAgICB2ZXJzaW9uLFxuICAgICk7XG4gIH1cblxuICBsZXQgY3VycmVudCA9IHN0b3JlZDtcbiAgbGV0IGF0ID0gdmVyc2lvbjtcbiAgd2hpbGUgKGF0IDwgQUNUSVZJVFlfU0NIRU1BX1ZFUlNJT04pIHtcbiAgICBjb25zdCBzdGVwID0gVVBHUkFERVMuZmluZCgodSkgPT4gdS5mcm9tID09PSBhdCk7XG4gICAgaWYgKCFzdGVwKSB7XG4gICAgICAvLyB2MSBsYW5kcyBoZXJlIGJ5IGRlc2lnbiAoZ3JlZW5maWVsZCBoYXJkLWN1dDogbm8gbWlncmF0ZSgxXHUyMTkyMikpLlxuICAgICAgdGhyb3cgbmV3IFVwZ3JhZGVFcnJvcihcbiAgICAgICAgYE5vIHVwZ3JhZGUgcGF0aCBmcm9tIHNjaGVtYVZlcnNpb24gJHthdH0gXHUyMDE0IGNhbm5vdCBzZXJ2ZWAsXG4gICAgICAgIHZlcnNpb24sXG4gICAgICApO1xuICAgIH1cbiAgICBjdXJyZW50ID0gc3RlcC5ydW4oY3VycmVudCk7XG4gICAgYXQgKz0gMTtcbiAgfVxuXG4gIGNvbnN0IHBhcnNlZCA9IEFjdGl2aXR5RG9jdW1lbnQuc2FmZVBhcnNlKGN1cnJlbnQpO1xuICBpZiAoIXBhcnNlZC5zdWNjZXNzKSB7XG4gICAgdGhyb3cgbmV3IFVwZ3JhZGVFcnJvcihcbiAgICAgIGBDb250ZW50IGZhaWxlZCB2YWxpZGF0aW9uIGF0IHNjaGVtYVZlcnNpb24gJHthdH06IGAgK1xuICAgICAgICBwYXJzZWQuZXJyb3IuaXNzdWVzXG4gICAgICAgICAgLnNsaWNlKDAsIDMpXG4gICAgICAgICAgLm1hcCgoaSkgPT4gYCR7aS5wYXRoLmpvaW4oJy4nKX06ICR7aS5tZXNzYWdlfWApXG4gICAgICAgICAgLmpvaW4oJzsgJyksXG4gICAgICB2ZXJzaW9uLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHsgZG9jOiBwYXJzZWQuZGF0YSwgZnJvbVNjaGVtYVZlcnNpb246IHZlcnNpb24gfTtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gcmVnaXN0cnkvcmVnaXN0cnkudHMgXHUyMDE0IHRoZSBzaW5nbGUgYmxvY2sgcmVnaXN0cnkgKFMwLCBydWxpbmcgUTFBKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE9uZSBlbnRyeSBwZXIgc2NoZW1hIGJsb2NrIHR5cGUuIFRoZSBndWFyZCBzdWl0ZSAodGVzdHMvcmVnaXN0cnkudGVzdC50cylcbi8vIHByb3ZlczogY292ZXJhZ2UgaXMgZXhhY3QgYWdhaW5zdCB0aGUgQmxvY2sgdW5pb24sIG51bWJlcmluZyBkZWNsYXJhdGlvbnNcbi8vIGFncmVlIHdpdGggYmxvY2stcHJlZGljYXRlcy50cywgZmFtaWxpZXMgYWdyZWUgd2l0aCBpc0dyYWRlYWJsZSwgdmFyaWFudHNcbi8vIGFncmVlIHdpdGggdGhlIHNjaGVtYSdzIGludGVyYWN0aW9uIHVuaW9ucywgYW5kIGV2ZXJ5IGludGVyYWN0aXZlIGVudHJ5XG4vLyBjYXJyaWVzIGFuIGExMXkgc3RvcnkuIEFkZCBhIGJsb2NrIHR5cGUgdG8gdGhlIHNjaGVtYSBhbmQgdGhpcyBmaWxlIGZhaWxzIHRvXG4vLyBjb21waWxlIChCbG9ja1JlZ2lzdHJ5IGlzIGtleWVkIGJ5IHRoZSB1bmlvbikgXHUyMDE0IHRoYXQgaXMgdGhlIHBvaW50LlxuLy9cbi8vIFByaW50IGRlY2xhcmF0aW9ucyBzdGFydGVkIEZBSVRIRlVMIHRvIHRoZSBiYXNlbGluZSBwcmludCBsYXllclxuLy8gKHJlbmRlcmVyL3NyYy9ydW50aW1lL3N0eWxlcy50cyBAbWVkaWEgcHJpbnQpLCBpbmNsdWRpbmcgaXRzIGtub3duIG9kZGl0aWVzLFxuLy8gc28gdGhhdCBpbXByb3ZpbmcgdGhlbSB3b3VsZCBiZSBhIGRlbGliZXJhdGUgZGVjaXNpb24gcmF0aGVyIHRoYW4gYSBzaWxlbnRcbi8vIHJlZ2lzdHJ5IHNpZGUgZWZmZWN0LiBTNSAodGhlIHByaW50IHNsaWNlKSBJUyB0aGF0IGRlY2lzaW9uIHBvaW50LCBhbmQgaXRcbi8vIHJ1bGVkIChTNS1PVjYpOiBtYXRoX2Jsb2NrLCBkYXRhX3Bsb3QsIGFuZCBzZWxmX2V4cGxhbmF0aW9uIG5vdyBkZWNsYXJlXG4vLyBicmVhay1pbnNpZGU6IGF2b2lkIFx1MjAxNCBhIG51bWJlcmVkIGVxdWF0aW9uLCBhIGNoYXJ0LCBvciBhIHByb21wdCBzZXBhcmF0ZWRcbi8vIGZyb20gaXRzIHdyaXRpbmcgYm94IGlzIGEgcHJpbnQgYnVnIG9uIGFueSBzdXJmYWNlIFx1MjAxNCBhbmQgdGhlIGF1dGhvciBleHRlbmRlZFxuLy8gaXQgdG8gc2hvcnRfYW5zd2VyIGFuZCBlc3NheSwgdGhlIHR3byB1bm5hbWVkIHNpYmxpbmdzIHRoYXQgc2hhcmVcbi8vIHNlbGZfZXhwbGFuYXRpb24ncyB3cml0aW5nLWJveCBzdHJ1Y3R1cmUuIFRoZSBwYXJpdHkgZ2F0ZSBhc3NlcnRzXG4vLyBUSElTIHNwZWMgb24gYm90aCBzdXJmYWNlcyByYXRoZXIgdGhhbiBkaWZmaW5nIGFnYWluc3QgcmVuZGVyZXIgb3V0cHV0XG4vLyAocHJpbnRFeHBlY3RhdGlvbnMudHMpLCB3aGljaCBpcyBleGFjdGx5IHdoYXQgbWFrZXMgdGhlIGltcHJvdmVtZW50XG4vLyBleHByZXNzaWJsZTsgcHVibGlzaGVkIHBhZ2VzIGtlZXAgdGhlaXIgY3VycmVudCBiZWhhdmlvciB1bnRpbCB0aGV5IHJldGlyZS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7XG4gIGlzR3JhZGVhYmxlLFxuICBpc1BhZ2VOdW1iZXJlZCxcbiAgdHlwZSBCbG9jayxcbn0gZnJvbSAnQGFjdGl2aXR5L3NjaGVtYSc7XG5pbXBvcnQgdHlwZSB7XG4gIEJsb2NrQ2F0ZWdvcnksXG4gIEJsb2NrUmVnaXN0cnksXG4gIEJsb2NrVHlwZSxcbiAgQ2hlY2tlZFN0YXRlRmFtaWx5LFxufSBmcm9tICcuL3R5cGVzLmpzJztcblxuLyoqIEJsYW5rVG9rZW4gZmllbGRzIHN0cmlwcGVkIGZyb20gaW5saW5lIGNvbnRlbnQgd2hlcmV2ZXJcbiAqIFNhbml0aXplU3BlYy5pbmxpbmVCbGFua1NlY3JldHMgaXMgc2V0LiBgaGludGAgZGVsaWJlcmF0ZWx5IHN1cnZpdmVzIFx1MjAxNCBpdCBpc1xuICogYSBwcmUtY2hlY2sgYWZmb3JkYW5jZSB0aGUgc3R1ZGVudCBtYXkgb3BlbjsgcGVyLW1pc3Rha2UgZmVlZGJhY2sgaXNcbiAqIHJldHVybmVkIGJ5IHRoZSBjaGVjayBSUEMgKHJ1bGluZyAyLjFBKSwgc28gdGhlIHdob2xlIG1pc3Rha2VGZWVkYmFjayBhcnJheVxuICogKG1hdGNoIHN0cmluZ3MgQU5EIGZlZWRiYWNrIHRleHQpIHN0cmlwcy4gYGFuc3dlclR5cGVgIHN1cnZpdmVzOiBpdCBzaGFwZXNcbiAqIHRoZSBpbnB1dCAobnVtZXJpYyBrZXlib2FyZHMpLiAqL1xuZXhwb3J0IGNvbnN0IEJMQU5LX1NFQ1JFVF9GSUVMRFMgPSBbXG4gICdhbnN3ZXInLFxuICAnYWNjZXB0YWJsZUFuc3dlcnMnLFxuICAnbWlzdGFrZUZlZWRiYWNrJyxcbiAgJ3RvbGVyYW5jZScsXG4gICdlcXVpdmFsZW5jZScsXG5dIGFzIGNvbnN0O1xuXG4vKiogTWF0aFByb21wdCBmaWVsZHMgc3RyaXBwZWQgd2hlcmV2ZXIgYSBwcm9tcHRzIGFycmF5IGFwcGVhcnMgKG1hdGhfYmxvY2tcbiAqIGJsb2NrcyBBTkQgbWF0aF9pbmxpbmUgbm9kZXMpLiBUaGUgZ2FwIG1hcmtlcnMgaW4gdGhlIGxhdGV4IGFyZSB0aGUgZ2Fwc1xuICogdGhlbXNlbHZlcyAoYWxyZWFkeSBzZXJ2ZWQgZW1wdHkgdG9kYXkgXHUyMDE0IHNlcmlhbGl6ZS50cyBwcmVjZWRlbnQpOyB0aGVcbiAqIHByb21wdCdzIGFuc3dlci9ncmFkaW5nIGNvbmZpZyBpcyB0aGUgc2VjcmV0LiBgYWNjZXB0YWJsZUFuc3dlcnNgIHdhc1xuICogTUlTU0lORyBmcm9tIHRoZSBTMCBkZWNsYXJhdGlvbiAoXCJhbHNvIGFjY2VwdFwiIGFsdGVybmF0aXZlIGFuc3dlcnMgXHUyMDE0IGEgcmVhbFxuICoga2V5IGxlYWspIFx1MjAxNCBjYXVnaHQgYnkgUzIncyBjcm9zcy1jaGVjayBhZ2FpbnN0IHRoZSBNYXRoUHJvbXB0IHNjaGVtYSBhbmRcbiAqIGFkZGVkIGJlZm9yZSB0aGUgZmlyc3Qgc2FuaXRpemVkIGJ5dGUgd2FzIHNlcnZlZC4gKi9cbmV4cG9ydCBjb25zdCBNQVRIX1BST01QVF9TRUNSRVRfRklFTERTID0gW1xuICAnYW5zd2VyJyxcbiAgJ2FjY2VwdGFibGVBbnN3ZXJzJyxcbiAgJ2VxdWl2YWxlbmNlJyxcbiAgJ3RvbGVyYW5jZScsXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgYmxvY2tSZWdpc3RyeTogQmxvY2tSZWdpc3RyeSA9IHtcbiAgcGFyYWdyYXBoOiB7XG4gICAgdHlwZTogJ3BhcmFncmFwaCcsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ3BhcmFncmFwaCcsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAncHJvc2UnIH0sXG4gIH0sXG5cbiAgaGVhZGluZzoge1xuICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnaGVhZGluZycsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAncHJvc2UnLCBrZWVwV2l0aE5leHQ6IHRydWUgfSxcbiAgfSxcblxuICBtYXRoX2Jsb2NrOiB7XG4gICAgdHlwZTogJ21hdGhfYmxvY2snLFxuICAgIC8vIEdhcC1iZWFyaW5nIChNb2RlbCBBIHByb21wdHMpIFx1MjE5MiBhdXRvLWdyYWRhYmxlICsgbnVtYmVyZWQgKyBpbnRlcmFjdGl2ZTtcbiAgICAvLyBhIHBsYWluIGRpc3BsYXkgZXF1YXRpb24gcmVzb2x2ZXMgc3RhdGljIHRocm91Z2ggZmFtaWx5T2YoKS5cbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsIC8vIGZhaXRoZnVsOiByZW5kZXJlciBlbWl0cyBjb250ZW50IGV2ZW4gd2hlbiBnYXAtYmVhcmluZ1xuICAgIG51bWJlcmVkOiAnd2hlbl9ncmFkYWJsZScsXG4gICAgYW5hbHl0aWNzS2V5OiAnbWF0aF9ibG9jaycsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFsnc29sdXRpb24nXSwgaW5saW5lQmxhbmtTZWNyZXRzOiB0cnVlIH0sXG4gICAgLy8gV0FTIGEgZmFpdGhmdWwgb2RkaXR5IChhYnNlbnQgZnJvbSB0aGUgYmFzZWxpbmUgYnJlYWstaW5zaWRlOmF2b2lkIGxpc3QsXG4gICAgLy8gc28gYSBudW1iZXJlZCBkaXNwbGF5IGVxdWF0aW9uIGNvdWxkIHNwbGl0IGFjcm9zcyBhIHBhZ2UpLiBGSVhFRCBieVxuICAgIC8vIHJ1bGluZyBTNS1PVjYgXHUyMDE0IHN0aWxsIG5vdCBpbiB0aGUgc2hvd0Fuc3dlcnMgc2V0LCB3aGljaCBpcyB0aGUgc2VwYXJhdGVcbiAgICAvLyBhbnN3ZXIta2V5LXZhcmlhbnQgcXVlc3Rpb24gUzUuNSBvd25zLlxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICd1bmRlcmxpbmUtYmxhbmtzJyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnRWFjaCBpbi1lcXVhdGlvbiBnYXAgaXMgYSB0ZXh0IGlucHV0IGluIHRhYiBvcmRlciwgbGFiZWxlZCB3aXRoIGl0cyAnICtcbiAgICAgICAgJ3Bvc2l0aW9uIHdpdGhpbiB0aGUgZXF1YXRpb24gKFwiZ2FwIDEgb2YgMlwiKS4gVGhlIFBST0JMRU0gbnVtYmVyIGlzICcgK1xuICAgICAgICAnYW5ub3VuY2VkIG9uY2UgYnkgdGhlIGJsb2NrIHdyYXBwZXIsIHdoaWNoIGlzIGEgbGFiZWxsZWQgZ3JvdXAgXHUyMDE0IG5vdCAnICtcbiAgICAgICAgJ3JlcGVhdGVkIG9uIGV2ZXJ5IGdhcCAodmlld2VyLW51bWJlcmluZyBEMykuIFZhbHVlcyB0eXBlIGFzIHBsYWluIHRleHQ7ICcgK1xuICAgICAgICAndmVyZGljdHMgYXJlIGFubm91bmNlZCB2aWEgdGhlIHNoYXJlZCBzdGF0ZS1waWxsIGFyaWEtbGl2ZSByZWdpb24uJyxcbiAgICB9LFxuICB9LFxuXG4gIGltYWdlOiB7XG4gICAgdHlwZTogJ2ltYWdlJyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnaW1hZ2UnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ2ZpZ3VyZScgfSxcbiAgfSxcblxuICBjYWxsb3V0OiB7XG4gICAgdHlwZTogJ2NhbGxvdXQnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdjYWxsb3V0JyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICd2YXJpYW50LWJvcmRlci1ib3gnIH0sXG4gIH0sXG5cbiAgcHJvYmxlbToge1xuICAgIHR5cGU6ICdwcm9ibGVtJyxcbiAgICAvLyBOdW1iZXJlZCBsZWdhY3kgcHJvc2UgcHJvYmxlbTsgY2FycmllcyBhIHNvbHV0aW9uIGJ1dCBubyBhdXRvLWdyYWRlZFxuICAgIC8vIHJlc3BvbnNlIChpc0dyYWRlYWJsZTogZmFsc2UpIFx1MjE5MiBzdGF0aWMgZmFtaWx5LCBubyBzdGF0ZSBjaHJvbWUuIFNjaGVtYVxuICAgIC8vIG9ycGhhbjogbm8gZWRpdG9yIE5vZGVWaWV3OyBzdGlsbCByZW5kZXJhYmxlLCBzbyBpdCBrZWVwcyBhbiBlbnRyeS5cbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdwcm9ibGVtJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogWydzb2x1dGlvbiddIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3Byb3NlJyB9LFxuICB9LFxuXG4gIGZpbGxfaW5fYmxhbms6IHtcbiAgICB0eXBlOiAnZmlsbF9pbl9ibGFuaycsXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAnZmlsbF9pbl9ibGFuaycsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFsnc29sdXRpb24nXSwgaW5saW5lQmxhbmtTZWNyZXRzOiB0cnVlIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3VuZGVybGluZS1ibGFua3MnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdFYWNoIGJsYW5rIGlzIGEgdGV4dCBpbnB1dCBpbiB0YWIgb3JkZXIsIGxhYmVsZWQgd2l0aCBpdHMgc3ViLXBhcnQgJyArXG4gICAgICAgICdhbmQgcG9zaXRpb24gKFwiUGFydCBiLCBibGFuayAyIG9mIDNcIikgb24gYSBudW1iZXJlZCBtdWx0aS1ibGFuayAnICtcbiAgICAgICAgJ3Byb2JsZW0sIGFuZCBcIkJsYW5rIDIgb2YgM1wiIG90aGVyd2lzZS4gVGhlIFBST0JMRU0gbnVtYmVyIGlzICcgK1xuICAgICAgICAnYW5ub3VuY2VkIG9uY2UgYnkgdGhlIGJsb2NrIHdyYXBwZXIsIHdoaWNoIGlzIGEgbGFiZWxsZWQgZ3JvdXAsICcgK1xuICAgICAgICAncmF0aGVyIHRoYW4gcmVwZWF0ZWQgb24gZXZlcnkgYmxhbmsgKHZpZXdlci1udW1iZXJpbmcgRDMvTjcpLiAnICtcbiAgICAgICAgJ0hpbnQgYW5kIG1pc3Rha2UgJyArXG4gICAgICAgICdhZmZvcmRhbmNlcyBhcmUgYnV0dG9ucyByZWFjaGFibGUgYnkgVGFiOyB0aGUgb3BlbmVkIHBvcG92ZXIgdHJhcHMgJyArXG4gICAgICAgICdubyBmb2N1cyBhbmQgY2xvc2VzIG9uIEVzY2FwZS4gVmVyZGljdHMgYW5ub3VuY2UgdmlhIGFyaWEtbGl2ZS4nLFxuICAgIH0sXG4gIH0sXG5cbiAgYnVsbGV0X2xpc3Q6IHtcbiAgICB0eXBlOiAnYnVsbGV0X2xpc3QnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdidWxsZXRfbGlzdCcsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAncHJvc2UnIH0sXG4gIH0sXG5cbiAgb3JkZXJlZF9saXN0OiB7XG4gICAgdHlwZTogJ29yZGVyZWRfbGlzdCcsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ29yZGVyZWRfbGlzdCcsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAncHJvc2UnIH0sXG4gIH0sXG5cbiAgaW50ZXJhY3RpdmVfZ3JhcGg6IHtcbiAgICB0eXBlOiAnaW50ZXJhY3RpdmVfZ3JhcGgnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLCAvLyBkaXNwbGF5IHZhcmlhbnQgcmVzb2x2ZXMgc3RhdGljIHZpYSBmYW1pbHlPZigpXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJywgLy8gZGlzcGxheSB2YXJpYW50IHJlc29sdmVzIGNvbnRlbnQgdmlhIGNhdGVnb3J5T2YoKVxuICAgIG51bWJlcmVkOiAnd2hlbl9ncmFkYWJsZScsXG4gICAgYW5hbHl0aWNzS2V5OiAnaW50ZXJhY3RpdmVfZ3JhcGgnLFxuICAgIHZhcmlhbnRzOiBbXG4gICAgICAncGxvdF9wb2ludCcsXG4gICAgICAncGxvdF9mdW5jdGlvbicsXG4gICAgICAnc2hhZGVfcmVnaW9uJyxcbiAgICAgICdncmFwaF9pbmVxdWFsaXR5JyxcbiAgICAgICdwbG90X3JheScsXG4gICAgICAncGxvdF9zZWdtZW50JyxcbiAgICAgICdkaXNwbGF5JyxcbiAgICBdLFxuICAgIHNhbml0aXplOiB7XG4gICAgICAvLyBUaGUgd2lkZ2V0IG5lZWRzIGhhbmRsZSBjb3VudCAvIGZhbWlseSwgd2hpY2ggbGl2ZSBpbiB0aGUga2V5IHRoZVxuICAgICAgLy8gdmlld2VyIG5ldmVyIGdldHMuIERlcml2ZWQgKyB3aGl0ZWxpc3RlZDsgc2VlIFNhbml0aXplU3BlYy5cbiAgICAgIGRlcml2ZVF1ZXN0aW9uU2hhcGU6IHRydWUsXG4gICAgICAvLyBWYXJpYW50LXNjb3BlZCBrZXlzOiBwYXRocyB0aGF0IGRvbid0IGV4aXN0IG9uIGFuIGluc3RhbmNlJ3NcbiAgICAgIC8vIGludGVyYWN0aW9uIHNpbXBseSBkb24ndCBtYXRjaC4gYGFsbG93Tm9Tb2x1dGlvbmAgU1VSVklWRVMgKGl0IHJlbmRlcnNcbiAgICAgIC8vIHRoZSBcIm5vIHNvbHV0aW9uXCIgY29udHJvbCk7IGBub1NvbHV0aW9uQ29ycmVjdGAgaXMgdGhlIGFuc3dlci5cbiAgICAgIHN0cmlwOiBbXG4gICAgICAgICdpbnRlcmFjdGlvbi5jb3JyZWN0UG9pbnRzJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLnRvbGVyYW5jZScsXG4gICAgICAgICdpbnRlcmFjdGlvbi5tb2RlbHMnLFxuICAgICAgICAnaW50ZXJhY3Rpb24uZG9tYWlucycsXG4gICAgICAgICdpbnRlcmFjdGlvbi5yZWdpb25zJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLmluZXF1YWxpdGllcycsXG4gICAgICAgICdpbnRlcmFjdGlvbi5yYXlzJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLnNlZ21lbnRzJyxcbiAgICAgICAgJ21pc3Rha2VGZWVkYmFjaycsXG4gICAgICAgICdzb2x1dGlvbicsXG4gICAgICAgICdub1NvbHV0aW9uQ29ycmVjdCcsXG4gICAgICAgICdwYXJ0aWFsQ3JlZGl0JyxcbiAgICAgICAgJ2J1aWx0aW5GZWVkYmFjaycsXG4gICAgICBdLFxuICAgIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3N0YXRpYy1zdmcnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdUaGUgY2FudmFzIGlzIGZvY3VzYWJsZTsgaGFuZGxlcyBtb3ZlIGJ5IGFycm93IGtleXMgd2l0aCBwb3NpdGlvbiAnICtcbiAgICAgICAgJ25hcnJhdGlvbiB0byBhIHZpc3VhbGx5LWhpZGRlbiBhcmlhLWxpdmUgcmVnaW9uIChhIHZpc2libGUgcmVhZG91dCAnICtcbiAgICAgICAgJ3dvdWxkIGhhbmQgb3ZlciB0aGUgYW5zd2VyIFx1MjAxNCByZWFkaW5nIHRoZSBncmlkIGlzIHRoZSBza2lsbCkuICcgK1xuICAgICAgICAnUG9zdC1jaGVjayByZXN1bHRzIGFyZSB2aXNpYmxlIHRleHQuIFRvdWNoIHRhcmdldHMgbWVldCA0NHB4LicsXG4gICAgfSxcbiAgfSxcblxuICBtdWx0aXBsZV9jaG9pY2U6IHtcbiAgICB0eXBlOiAnbXVsdGlwbGVfY2hvaWNlJyxcbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdtdWx0aXBsZV9jaG9pY2UnLFxuICAgIHNhbml0aXplOiB7XG4gICAgICAvLyBQZXItY2hvaWNlIGZlZWRiYWNrIHJldHVybnMgdmlhIHRoZSBjaGVjayBSUEMgKDIuMUEpLCBsaWtlIGJsYW5rcycuXG4gICAgICBzdHJpcDogWydjaG9pY2VzW10uY29ycmVjdCcsICdjaG9pY2VzW10uZmVlZGJhY2snLCAnc29sdXRpb24nXSxcbiAgICB9LFxuICAgIHByaW50OiB7XG4gICAgICBicmVha0luc2lkZTogJ2F2b2lkJyxcbiAgICAgIHRyZWF0bWVudDogJ2Nob2ljZS1sZXR0ZXJzJyxcbiAgICAgIC8vIFByaW50ZWQgdmVyc2lvbnMgcmVhcnJhbmdlIHRoZSBjaG9pY2VzOyBhIHF1ZXN0aW9uIHRoYXQgc2F5cyBcImFsbCBvZlxuICAgICAgLy8gdGhlIGFib3ZlXCIgb3B0cyBvdXQgcGVyLWJsb2NrIChEMTdBKS4gTk9UIHNlcnZlU2h1ZmZsZWQ6IHRoZSBzdHVkZW50XG4gICAgICAvLyBzY3JlZW4ga2VlcHMgdGhlIGF1dGhvcmVkIG9yZGVyLCBiZWNhdXNlIHRoZSBhbnN3ZXIgaXMgdGhlIGNob2ljZSBpZFxuICAgICAgLy8gYW5kIHJlYXJyYW5naW5nIGl0IHRoZXJlIGJ1eXMgbm90aGluZy5cbiAgICAgIHNodWZmbGVkOiBbJ2Nob2ljZXMnXSxcbiAgICAgIHNodWZmbGVMb2NrZWRCeTogJ2xvY2tDaG9pY2VPcmRlcicsXG4gICAgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ05hdGl2ZSByYWRpbyAoc2luZ2xlKSAvIGNoZWNrYm94IChtdWx0aSkgaW5wdXRzIGdyb3VwZWQgaW4gYSAnICtcbiAgICAgICAgJ2ZpZWxkc2V0IHdob3NlIGxlZ2VuZCBpcyB0aGUgcHJvbXB0OyBmdWxsIGxhYmVsIGNsaWNrIHRhcmdldHMuICcgK1xuICAgICAgICAnU3RhbmRhcmQgYXJyb3cta2V5IHJhZGlvIGJlaGF2aW9yOyB2ZXJkaWN0cyBhbm5vdW5jZSB2aWEgYXJpYS1saXZlLicsXG4gICAgfSxcbiAgfSxcblxuICBtYXRjaGluZzoge1xuICAgIHR5cGU6ICdtYXRjaGluZycsXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAnbWF0Y2hpbmcnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbJ2tleScsICdzb2x1dGlvbiddIH0sXG4gICAgLy8gQTkvRTM6IGNvbmRpdGlvbmFsLCBhbmQgZGVjbGFyZWQgYXMgc3VjaCBcdTIwMTQgdGhlIGJhbmsgZHJvcHMgaXRzXG4gICAgLy8gdW5icmVha2FiaWxpdHkgb25jZSBpdCBob2xkcyBmaWd1cmVzLiBTZWUgUHJpbnRTcGVjLmJyZWFrSW5zaWRlLlxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQtdW5sZXNzLWZpZ3VyZXMnLCB0cmVhdG1lbnQ6ICdsZXR0ZXItYmFuaycgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ1BvaW50ZXIgZHJhZyB3aXRoIGEga2V5Ym9hcmQgc2VsZWN0LXRoZW4tcGxhY2UgZ3JhbW1hciB1bmRlcm5lYXRoOiAnICtcbiAgICAgICAgJ3RhcmdldCBjYXJkcyBhcmUgZm9jdXNhYmxlLCBTcGFjZS9FbnRlciBsaWZ0cywgYXJyb3dzIGNob29zZSBhIGRvY2ssICcgK1xuICAgICAgICAnU3BhY2UvRW50ZXIgcGxhY2VzLCBFc2NhcGUgY2FuY2Vscy4gRXZlcnkgbW92ZSBuYXJyYXRlcyB0byBhICcgK1xuICAgICAgICAndmlzdWFsbHktaGlkZGVuIGFyaWEtbGl2ZSByZWdpb24gKFwiQ2FyZCBCIHBsYWNlZCBvbiBpdGVtIDJcIikuJyxcbiAgICB9LFxuICB9LFxuXG4gIG9yZGVyaW5nOiB7XG4gICAgdHlwZTogJ29yZGVyaW5nJyxcbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdvcmRlcmluZycsXG4gICAgc2FuaXRpemU6IHtcbiAgICAgIHN0cmlwOiBbJ3NvbHV0aW9uJ10sXG4gICAgICAvLyBUaGUgYXV0aG9yZWQgaXRlbXMgb3JkZXIgSVMgdGhlIGtleSBcdTIwMTQgdGhlIHNlcnZlciBzZXJ2ZXMgYSBzaHVmZmxlXG4gICAgICAvLyAoc3RhYmxlIHBlciB2ZXJzaW9uICsgc3R1ZGVudCBzbyByZWxvYWRzIGRvbid0IHJlc2h1ZmZsZSkuXG4gICAgICBzZXJ2ZVNodWZmbGVkOiBbJ2l0ZW1zJ10sXG4gICAgfSxcbiAgICBwcmludDoge1xuICAgICAgYnJlYWtJbnNpZGU6ICdhdm9pZCcsXG4gICAgICB0cmVhdG1lbnQ6ICdudW1iZXItYm94ZXMnLFxuICAgICAgLy8gVGhlIGF1dGhvcmVkIG9yZGVyIGlzIHRoZSBhbnN3ZXIsIHNvIHBhcGVyIG11c3QgbmV2ZXIgc2hvdyBpdC4gVGhlXG4gICAgICAvLyBzZXJ2ZXIgYWxyZWFkeSBzaHVmZmxlcyBmb3Igc3R1ZGVudHMgKHNlcnZlU2h1ZmZsZWQgYWJvdmUpOyB0ZWFjaGVyXG4gICAgICAvLyBwcmludCBnZXRzIGl0cyBvd24sIGJlY2F1c2UgdGhhdCBwYXRoIGRlbGliZXJhdGVseSBkb2VzIG5vdCBydW4gdGhlXG4gICAgICAvLyBwZXItc3R1ZGVudCBzZXJ2ZSBzaHVmZmxlLlxuICAgICAgc2h1ZmZsZWQ6IFsnaXRlbXMnXSxcbiAgICB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnUm93cyBhcmUgZm9jdXNhYmxlIGFuZCByZW9yZGVyIHZpYSB0aGUgc2hhcmVkIGxpZnQgZ3JhbW1hcjogJyArXG4gICAgICAgICdTcGFjZS9FbnRlciBsaWZ0cywgYXJyb3dzIG1vdmUgdGhlIHJvdywgU3BhY2UvRW50ZXIgZHJvcHMsIEVzY2FwZSAnICtcbiAgICAgICAgJ2NhbmNlbHM7IHBvc2l0aW9ucyBuYXJyYXRlIHRvIGEgdmlzdWFsbHktaGlkZGVuIGFyaWEtbGl2ZSByZWdpb24uJyxcbiAgICB9LFxuICB9LFxuXG4gIG51bWJlcl9saW5lOiB7XG4gICAgdHlwZTogJ251bWJlcl9saW5lJyxcbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdudW1iZXJfbGluZScsXG4gICAgdmFyaWFudHM6IFsncGxvdF9wb2ludCcsICdwbG90X2ludGVydmFsJ10sXG4gICAgc2FuaXRpemU6IHtcbiAgICAgIC8vIFRoZSB3aWRnZXQgbmVlZHMgaGFuZGxlIGNvdW50IC8gZmFtaWx5LCB3aGljaCBsaXZlIGluIHRoZSBrZXkgdGhlXG4gICAgICAvLyB2aWV3ZXIgbmV2ZXIgZ2V0cy4gRGVyaXZlZCArIHdoaXRlbGlzdGVkOyBzZWUgU2FuaXRpemVTcGVjLlxuICAgICAgZGVyaXZlUXVlc3Rpb25TaGFwZTogdHJ1ZSxcbiAgICAgIHN0cmlwOiBbXG4gICAgICAgICdpbnRlcmFjdGlvbi5jb3JyZWN0UG9pbnRzJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLnRvbGVyYW5jZScsXG4gICAgICAgICdpbnRlcmFjdGlvbi5jb3JyZWN0SW50ZXJ2YWwnLFxuICAgICAgICAnc29sdXRpb24nLFxuICAgICAgXSxcbiAgICB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdzdGF0aWMtc3ZnJyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnVGhlIGxpbmUgaXMgZm9jdXNhYmxlOyBwb2ludHMvaW50ZXJ2YWwgZW5kcG9pbnRzIG1vdmUgYnkgYXJyb3cga2V5cyAnICtcbiAgICAgICAgJ3dpdGggdmFsdWUgbmFycmF0aW9uIHRvIGEgdmlzdWFsbHktaGlkZGVuIGFyaWEtbGl2ZSByZWdpb24gKHZpc2libGUgJyArXG4gICAgICAgICdyZWFkb3V0IHdvdWxkIHJldmVhbCB0aGUgYW5zd2VyKS4gUG9zdC1jaGVjayByZXN1bHRzIGFyZSB2aXNpYmxlLicsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhX3Bsb3Q6IHtcbiAgICB0eXBlOiAnZGF0YV9wbG90JyxcbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJywgLy8gZGlzcGxheSB2YXJpYW50IHJlc29sdmVzIHN0YXRpYyB2aWEgZmFtaWx5T2YoKVxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsIC8vIGRpc3BsYXkgdmFyaWFudCByZXNvbHZlcyBjb250ZW50IHZpYSBjYXRlZ29yeU9mKClcbiAgICBudW1iZXJlZDogJ3doZW5fZ3JhZGFibGUnLFxuICAgIGFuYWx5dGljc0tleTogJ2RhdGFfcGxvdCcsXG4gICAgdmFyaWFudHM6IFsnZGlzcGxheScsICdidWlsZF9kb3RwbG90JywgJ2J1aWxkX2hpc3RvZ3JhbScsICdidWlsZF9ib3hwbG90J10sXG4gICAgc2FuaXRpemU6IHtcbiAgICAgIC8vIFRoZSB3aWRnZXQgbmVlZHMgaGFuZGxlIGNvdW50IC8gZmFtaWx5LCB3aGljaCBsaXZlIGluIHRoZSBrZXkgdGhlXG4gICAgICAvLyB2aWV3ZXIgbmV2ZXIgZ2V0cy4gRGVyaXZlZCArIHdoaXRlbGlzdGVkOyBzZWUgU2FuaXRpemVTcGVjLlxuICAgICAgZGVyaXZlUXVlc3Rpb25TaGFwZTogdHJ1ZSxcbiAgICAgIHN0cmlwOiBbJ3NvbHV0aW9uJywgJ2ludGVyYWN0aW9uLnRvbGVyYW5jZSddLFxuICAgICAgZGVyaXZhYmxlRnJvbVNlcnZlZDpcbiAgICAgICAgJ1RoZSBkYXRhIHNldCBpcyB0aGUgd29ya2luZyBtYXRlcmlhbCB0aGUgc3R1ZGVudCBidWlsZHMgdGhlIGNoYXJ0ICcgK1xuICAgICAgICAnRlJPTSwgYW5kIHRoZSBjb3JyZWN0IGNoYXJ0IGlzIGNvbXB1dGVkIGZyb20gaXQgXHUyMDE0IHdpdGhob2xkaW5nIHRoZSAnICtcbiAgICAgICAgJ2RhdGEgd291bGQgcmVtb3ZlIHRoZSB0YXNrLiBTZXJ2ZXItYXV0aG9yaXRhdGl2ZSBncmFkaW5nIHN0aWxsIGdhdGVzICcgK1xuICAgICAgICAndmVyZGljdHM7IHRoZSBsZWFrIHRlc3RzIHdoaXRlbGlzdCBgZGF0YWAgZm9yIHRoaXMgYmxvY2sgZXhwbGljaXRseS4nLFxuICAgIH0sXG4gICAgLy8gV0FTIGEgZmFpdGhmdWwgb2RkaXR5IChhYnNlbnQgZnJvbSB0aGUgYmFzZWxpbmUgYnJlYWstaW5zaWRlOmF2b2lkIGxpc3QsXG4gICAgLy8gdW5saWtlIHRoZSBncmFwaCBhbmQgbnVtYmVyLWxpbmUgY2FudmFzZXMpLiBGSVhFRCBieSBydWxpbmcgUzUtT1Y2IFx1MjAxNCBhXG4gICAgLy8gY2hhcnQgc3BsaXQgYWNyb3NzIGEgcGFnZSBib3VuZGFyeSBpcyB1bnJlYWRhYmxlLlxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdzdGF0aWMtc3ZnJyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnQ2hhcnQtYnVpbGRpbmcgY29udHJvbHMgYXJlIGZvY3VzYWJsZTsgZG90cy9iYXJzL2JveCBoYW5kbGVzIGFkanVzdCAnICtcbiAgICAgICAgJ2J5IGFycm93IGtleXMgd2l0aCB2YWx1ZSBuYXJyYXRpb24gdG8gYSB2aXN1YWxseS1oaWRkZW4gYXJpYS1saXZlICcgK1xuICAgICAgICAncmVnaW9uLiBQb3N0LWNoZWNrIHJlc3VsdHMgYXJlIHZpc2libGUgdGV4dC4nLFxuICAgIH0sXG4gIH0sXG5cbiAgbGVhcm5pbmdfb2JqZWN0aXZlczoge1xuICAgIHR5cGU6ICdsZWFybmluZ19vYmplY3RpdmVzJyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnbGVhcm5pbmdfb2JqZWN0aXZlcycsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ2JvcmRlcmVkLWJveCcgfSxcbiAgfSxcblxuICB3b3JrZWRfZXhhbXBsZToge1xuICAgIHR5cGU6ICd3b3JrZWRfZXhhbXBsZScsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ3dvcmtlZF9leGFtcGxlJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10sIGNoaWxkQmxvY2tzOiBbJ2NvbnRlbnQnXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdib3JkZXJlZC1ib3gnIH0sXG4gIH0sXG5cbiAgZmFkZWRfd29ya2VkX2V4YW1wbGU6IHtcbiAgICB0eXBlOiAnZmFkZWRfd29ya2VkX2V4YW1wbGUnLFxuICAgIC8vIFRoZSBib3ggY291bnRzIGFzIE9ORSBudW1iZXJlZCBwcm9ibGVtOyBncmFkaW5nIHJpZGVzIGl0cyBjaGlsZFxuICAgIC8vIGZpbGxfaW5fYmxhbmsgc3RlcHMsIGVhY2ggc2FuaXRpemVkIGJ5IGl0cyBvd24gZW50cnkgdmlhIGNoaWxkQmxvY2tzLlxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnc2NhZmZvbGQnLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdmYWRlZF93b3JrZWRfZXhhbXBsZScsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdLCBjaGlsZEJsb2NrczogWydjb250ZW50J10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnYm9yZGVyZWQtYm94JyB9LFxuICB9LFxuXG4gIHRhYmxlOiB7XG4gICAgdHlwZTogJ3RhYmxlJyxcbiAgICAvLyBEVUFMLU5BVFVSRUQsIHJlc29sdmVkIHBlciBpbnN0YW5jZSByYXRoZXIgdGhhbiBkZWNsYXJlZCBwZXIgdHlwZTogYVxuICAgIC8vIHRhYmxlIHdob3NlIGNlbGxzIGhvbGQgYmxhbmtzIGlzIGEgcXVlc3Rpb247IGEgYmxhbmtsZXNzIG9uZSBpcyBhXG4gICAgLy8gc3RpbXVsdXMgKGEgcmF0ZXMgY2hhcnQgdG8gUkVBRCkuIGZhbWlseU9mKCkvY2F0ZWdvcnlPZigpIHJvdXRlIHRocm91Z2hcbiAgICAvLyBpc0dyYWRlYWJsZSwgd2hpY2ggYW5zd2VycyBmcm9tIENPTlRFTlQgXHUyMDE0IHRoZSBtYXRoX2Jsb2NrIHByZWNlZGVudCwgYW5kXG4gICAgLy8gdGhlIHJlYXNvbiB0aGVyZSBpcyBubyBhdXRob3JlZCBgaW50ZXJhY3RpdmVgIGZsYWcgdG8gZHJpZnQuXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ3doZW5fZ3JhZGFibGUnLFxuICAgIGFuYWx5dGljc0tleTogJ3RhYmxlJyxcbiAgICAvLyBDZWxscyBhcmUgTk9UIGJsb2Nrcywgc28gYGNoaWxkQmxvY2tzYCB3b3VsZCBiZSBhIGNhdGVnb3J5IGVycm9yIGhlcmUuXG4gICAgLy8gVGhlIGNlbGwgYmxhbmtzIGFyZSBpbi1iYW5kIGNvbnRlbnQgb2YgVEhJUyBibG9jazogdGhlIGRlZXAgc3RyaXAgd2Fsa3NcbiAgICAvLyB0aGVtIHVuY29uZGl0aW9uYWxseSAoaXQgbmV2ZXIgc3RvcHMgYXQgbmVzdGVkIGFycmF5cyksIGFuZCB0aGlzIGZsYWcgaXNcbiAgICAvLyB0aGUgZGVjbGFyYXRpb24gKyB0aGUgdHlwZSBwcm9qZWN0aW9uIHRoYXQgc2F5cyBzby5cbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10sIGlubGluZUJsYW5rU2VjcmV0czogdHJ1ZSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdkYXRhLXRhYmxlJyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnVGhlIHRhYmxlIGlzIGEgcmVhbCA8dGFibGU+IHdpdGggPHRoPiBjZWxscyBvbiB3aGljaGV2ZXIgYXhpcyB0aGUgJyArXG4gICAgICAgICdhdXRob3IgbWFya2VkIChoZWFkZXJSb3cgLyBoZWFkZXJDb2x1bW4pLCBzbyBhIHNjcmVlbiByZWFkZXIgJyArXG4gICAgICAgICdhbm5vdW5jZXMgYSBibGFuayBjZWxsIHdpdGggaXRzIHJvdyBhbmQgY29sdW1uIGhlYWRlcnMgXHUyMDE0IFwiS2lsb2dyYW1zICcgK1xuICAgICAgICAnMiwgQ29zdCwgYmxhbmtcIiBcdTIwMTQgd2hpY2ggaXMgdGhlIGluZm9ybWF0aW9uIGEgc2lnaHRlZCBzdHVkZW50IHJlYWRzICcgK1xuICAgICAgICAnb2ZmIHRoZSBncmlkLiBFYWNoIGJsYW5rIGlzIGEgdGV4dCBpbnB1dCBpbiB0YWIgb3JkZXIsIHJlYWRpbmcgb3JkZXIgJyArXG4gICAgICAgICdsZWZ0IHRvIHJpZ2h0IHRoZW4gZG93bi4gT24gYSBtdWx0aS1ibGFuayB0YWJsZSB0aGUgaW5wdXQgYWxzbyAnICtcbiAgICAgICAgJ2NhcnJpZXMgaXRzIHN1Yi1wYXJ0IGxldHRlciAoXCJQYXJ0IGJcIiksIG1hdGNoaW5nIHRoZSAoYikgbWFya2VyICcgK1xuICAgICAgICAncHJpbnRlZCBiZXNpZGUgaXQ7IHRoYXQgbWFya2VyIGlzIGFyaWEtaGlkZGVuIHNvIGl0IGlzIG5vdCBhbm5vdW5jZWQgJyArXG4gICAgICAgICd0d2ljZS4gVGhlIFBST0JMRU0gbnVtYmVyIGlzIGFubm91bmNlZCBvbmNlIGJ5IHRoZSBibG9jayB3cmFwcGVyLCAnICtcbiAgICAgICAgJ25ldmVyIHJlcGVhdGVkIHBlciBjZWxsICh2aWV3ZXItbnVtYmVyaW5nIEQzKS4gVmVyZGljdHMgYW5ub3VuY2UgdmlhICcgK1xuICAgICAgICAndGhlIHNoYXJlZCBzdGF0ZS1waWxsIGFyaWEtbGl2ZSByZWdpb24uJyxcbiAgICB9LFxuICB9LFxuXG4gIHNlbGZfZXhwbGFuYXRpb246IHtcbiAgICB0eXBlOiAnc2VsZl9leHBsYW5hdGlvbicsXG4gICAgZmFtaWx5OiAncmVjb3JkZWQnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnc2VsZl9leHBsYW5hdGlvbicsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgLy8gV0FTIGEgZmFpdGhmdWwgb2RkaXR5OiB0aGUgYmFzZWxpbmUgYXZvaWQgcmlkZXMgdGhlIHRleHRhcmVhLCBub3QgdGhlXG4gICAgLy8gYmxvY2ssIHNvIGEgbG9uZyBwcm9tcHQgY291bGQgc2VwYXJhdGUgZnJvbSBpdHMgd3JpdGluZyBib3guIEZJWEVEIGJ5XG4gICAgLy8gcnVsaW5nIFM1LU9WNiBcdTIwMTQgYSBwcm9tcHQgb24gb25lIHBhZ2UgYW5kIGl0cyBhbnN3ZXIgc3BhY2Ugb24gdGhlIG5leHQgaXNcbiAgICAvLyB0aGUgc2FtZSBkZWZlY3QgY2xhc3MgYXMgYSBzcGxpdCBlcXVhdGlvbi5cbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnd3JpdGluZy1ib3gnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdBIGxhYmVsZWQgdGV4dGFyZWEgaW4gdGFiIG9yZGVyLiBPbiBjaGVjayB0aGUgYmxvY2sgYW5ub3VuY2VzICcgK1xuICAgICAgICAnXCJSZWNvcmRlZCBcdTIwMTQgeW91ciB0ZWFjaGVyIHdpbGwgcmV2aWV3XCIgdmlhIGFyaWEtbGl2ZTsgbmV2ZXIgYSB2ZXJkaWN0LicsXG4gICAgfSxcbiAgfSxcblxuICBzaG9ydF9hbnN3ZXI6IHtcbiAgICB0eXBlOiAnc2hvcnRfYW5zd2VyJyxcbiAgICBmYW1pbHk6ICdyZWNvcmRlZCcsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICAvLyBXQVMgJ25ldmVyJyBcdTIwMTQgYSBwcmUtcGFwZXItZmlyc3QgY2hvaWNlLiBSdWxpbmcgRTcgKDIwMjYtMDgtMTkpOiBhIGdyYWRlZFxuICAgIC8vIHF1ZXN0aW9uIGEgdGVhY2hlciBtYXJrcyBvbiBwYXBlciBuZWVkcyBhIG51bWJlciwgYW5kIHRoZSBudW1iZXJpbmcgd2Fsa1xuICAgIC8vIHRoYXQgYWxyZWFkeSBleGlzdHMgZ2l2ZXMgdGhlIHNjYW4gYXJjIGl0cyBwYXBlclx1MjE5MmJsb2NrIG1hcHBpbmcgZm9yIGZyZWUuXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ3Nob3J0X2Fuc3dlcicsXG4gICAgLy8gUnVicmljcyBhcmUgdGVhY2hlci1zaWRlIGRhdGEgXHUyMDE0IGFscmVhZHkgY29ycmVjdGx5IHdpdGhoZWxkIGZyb20gc3R1ZGVudFxuICAgIC8vIEhUTUwgdG9kYXk7IHRoZSByZWdpc3RyeSBtYWtlcyB0aGF0IGEgZGVjbGFyZWQgaW52YXJpYW50LlxuICAgIC8vXG4gICAgLy8gYGFuc3dlcmAgYW5kIGBzb2x1dGlvbmAgam9pbmVkIGl0IHdpdGggdGhlIGFuc3dlci1rZXkgc2xpY2UgKHJ1bGluZyBFMi9FMylcbiAgICAvLyBhbmQgdGhlIE9SREVSIE9GIEVWRU5UUyBtYXR0ZXJzIG1vcmUgdGhhbiB0aGUgbGlzdCBkb2VzOiBFMyBkZWNsYXJlcyB0aGVcbiAgICAvLyBhbnRpLWxlYWsgY2hhaW4gT05FIElOU0VQQVJBQkxFIFVOSVQgXHUyMDE0IHRoaXMgc3RyaXAgZW50cnksIHRoZSBsZWFrRml4dHVyZVxuICAgIC8vIHNlbnRpbmVsIHJvdyB0aGF0IG9ic2VydmVzIGl0LCB0aGUgc2FuaXRpemUgdW5pdCBhc3NlcnRpb24sIGFuZCB0aGVcbiAgICAvLyBzY2hlbWEtdnMtcmVnaXN0cnkgY29tcGxldGVuZXNzIGdhdGUgYWxsIGxhbmQgdG9nZXRoZXIuIEEgc3RyaXAgZW50cnlcbiAgICAvLyB3aXRob3V0IGl0cyBmaXh0dXJlIHJvdyBpcyBhIGNsYWltIG5vdGhpbmcgY2hlY2tzICh0aGUgXCJwYXNzaW5nIGJlY2F1c2VcbiAgICAvLyBvZiB3aGF0IGlzIGFic2VudFwiIGNsYXNzKSwgd2hpY2ggaXMgZXhhY3RseSBob3cgYSBrZXkgbGVha3MgcXVpZXRseS5cbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogWydydWJyaWMnLCAnYW5zd2VyJywgJ3NvbHV0aW9uJ10gfSxcbiAgICAvLyBTYW1lIGZvcm1lciBvZGRpdHkgYXMgc2VsZl9leHBsYW5hdGlvbiwgYW5kIGZpeGVkIHdpdGggaXQ6IHRoZSBiYXNlbGluZVxuICAgIC8vIGF2b2lkIHJpZGVzIHRoZSB0ZXh0YXJlYSwgbm90IHRoZSBibG9jaywgc28gYSBwcm9tcHQgY291bGQgcHJpbnQgb24gb25lXG4gICAgLy8gcGFnZSB3aXRoIGl0cyBhbnN3ZXIgc3BhY2Ugb24gdGhlIG5leHQuIFM1LU9WNiBuYW1lZCBvbmx5IHRoZSB0aHJlZVxuICAgIC8vIHR5cGVzIGl0cyBjb21tZW50cyBmbGFnZ2VkOyB0aGUgYXV0aG9yIGV4dGVuZGVkIHRoZSBydWxpbmcgdG8gdGhlIHR3b1xuICAgIC8vIHVubmFtZWQgc2libGluZ3Mgb2YgdGhlIHNhbWUgZmFtaWx5IHJhdGhlciB0aGFuIGxlYXZlIHRoZSBkZWZlY3QgaW5cbiAgICAvLyBwbGFjZSBmb3IgdGhlbSAodGhlIHBsb3RfcmF5L3Bsb3Rfc2VnbWVudCBsZXNzb246IGF1ZGl0IHRoZSBmYW1pbHkpLlxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICd3cml0aW5nLWJveCcgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ0EgbGFiZWxlZCB0ZXh0YXJlYSBpbiB0YWIgb3JkZXIuIFJlY29yZGVkIHN0YXRlIGFubm91bmNlcyB2aWEgJyArXG4gICAgICAgICdhcmlhLWxpdmU7IHRlYWNoZXIgZmVlZGJhY2ssIG9uY2UgcmVsZWFzZWQsIHJlbmRlcnMgYXMgYSBsYWJlbGVkICcgK1xuICAgICAgICAncmVnaW9uIGFubm91bmNlZCBvbiBhcnJpdmFsLicsXG4gICAgfSxcbiAgfSxcblxuICBlc3NheToge1xuICAgIHR5cGU6ICdlc3NheScsXG4gICAgZmFtaWx5OiAncmVjb3JkZWQnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgLy8gTnVtYmVyZWQgd2l0aCBzaG9ydF9hbnN3ZXIgXHUyMDE0IHNlZSB0aGUgbm90ZSB0aGVyZSAocnVsaW5nIEU3KS5cbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAnZXNzYXknLFxuICAgIC8vIGFuc3dlciArIHNvbHV0aW9uIHJpZGUgdGhlIHNhbWUgYW50aS1sZWFrIHVuaXQgYXMgc2hvcnRfYW5zd2VyJ3M7IEU0J3NcbiAgICAvLyBwYXJpdHkgcnVsaW5nIGlzIHdoYXQga2VlcHMgdGhlc2UgdHdvIGxpc3RzIGlkZW50aWNhbC5cbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogWydydWJyaWMnLCAnYW5zd2VyJywgJ3NvbHV0aW9uJ10gfSxcbiAgICAvLyBFeHRlbmRlZCB3aXRoIHNob3J0X2Fuc3dlciArIHNlbGZfZXhwbGFuYXRpb24gXHUyMDE0IHNlZSB0aGUgbm90ZSB0aGVyZS5cbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnd3JpdGluZy1ib3gnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdBIGxhYmVsZWQgdGV4dGFyZWEgaW4gdGFiIG9yZGVyLiBUaGUgbGl2ZSB3b3JkIGNvdW50ZXIgaXMgJyArXG4gICAgICAgICdhcmlhLWxpdmU9cG9saXRlIGFuZCBkZWJvdW5jZWQgc28gaXQgbmV2ZXIgY2hhdHRlcnMgcGVyIGtleXN0cm9rZS4gJyArXG4gICAgICAgICdSZWNvcmRlZCBzdGF0ZSBhbmQgcmVsZWFzZWQgdGVhY2hlciBmZWVkYmFjayBhbm5vdW5jZSB2aWEgYXJpYS1saXZlLicsXG4gICAgfSxcbiAgfSxcblxuICBncmFwaF9maWd1cmU6IHtcbiAgICB0eXBlOiAnZ3JhcGhfZmlndXJlJyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnZ3JhcGhfZmlndXJlJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICdmaWd1cmUnIH0sXG4gIH0sXG59O1xuXG4vKiogRXZlcnkgcmVnaXN0ZXJlZCB0eXBlLCBpbiByZWdpc3RyeSBkZWNsYXJhdGlvbiBvcmRlci4gKi9cbmV4cG9ydCBjb25zdCByZWdpc3RlcmVkQmxvY2tUeXBlcyA9IE9iamVjdC5rZXlzKGJsb2NrUmVnaXN0cnkpIGFzIEJsb2NrVHlwZVtdO1xuXG4vKiogUmVzb2x2ZSBhbiBJTlNUQU5DRSdzIGNoZWNrZWQtc3RhdGUgZmFtaWx5LiBBIHR5cGUncyBkZWNsYXJlZCBmYW1pbHkgaXNcbiAqIG1heGltYWw7IHVuZ3JhZGFibGUgaW5zdGFuY2VzIG9mIGdyYWRhYmxlIHR5cGVzIChkaXNwbGF5IGdyYXBoL2RhdGEgcGxvdCxcbiAqIHByb21wdGxlc3MgbWF0aCBibG9jaykgcmVzb2x2ZSB0byBzdGF0aWMgXHUyMDE0IG9uZSBydWxlIGVuZ2luZSwgaXNHcmFkZWFibGUuICovXG5leHBvcnQgZnVuY3Rpb24gZmFtaWx5T2YoYmxvY2s6IEJsb2NrKTogQ2hlY2tlZFN0YXRlRmFtaWx5IHtcbiAgY29uc3QgZW50cnkgPSBibG9ja1JlZ2lzdHJ5W2Jsb2NrLnR5cGVdO1xuICBpZiAoZW50cnkuZmFtaWx5ID09PSAnc3RhdGljJykgcmV0dXJuICdzdGF0aWMnO1xuICByZXR1cm4gaXNHcmFkZWFibGUoYmxvY2spID8gZW50cnkuZmFtaWx5IDogJ3N0YXRpYyc7XG59XG5cbi8qKiBSZXNvbHZlIGFuIElOU1RBTkNFJ3MgY2F0ZWdvcnk6IGEgZGlzcGxheS1tb2RlIGdyYXBoL2RhdGEgcGxvdCBzZXJ2ZXMgYXNcbiAqIGNvbnRlbnQsIG1hdGNoaW5nIHRoZSByZW5kZXJlcidzIGRhdGEtYmxvY2stY2F0ZWdvcnkgZW1pc3Npb24uICovXG5leHBvcnQgZnVuY3Rpb24gY2F0ZWdvcnlPZihibG9jazogQmxvY2spOiBCbG9ja0NhdGVnb3J5IHtcbiAgY29uc3QgZW50cnkgPSBibG9ja1JlZ2lzdHJ5W2Jsb2NrLnR5cGVdO1xuICBpZiAoZW50cnkuY2F0ZWdvcnkgPT09ICdxdWVzdGlvbicgJiYgZW50cnkubnVtYmVyZWQgPT09ICd3aGVuX2dyYWRhYmxlJykge1xuICAgIHJldHVybiBpc0dyYWRlYWJsZShibG9jaykgPyAncXVlc3Rpb24nIDogJ2NvbnRlbnQnO1xuICB9XG4gIHJldHVybiBlbnRyeS5jYXRlZ29yeTtcbn1cblxuLyoqIENlbnN1cyBrZXkgZm9yIGFuIGluc3RhbmNlIChQM0EpOiB0aGUgYW5hbHl0aWNzIGtleSwgd2l0aCB0aGUgaW50ZXJhY3Rpb25cbiAqIHZhcmlhbnQgYXBwZW5kZWQgZm9yIHRoZSBibG9ja3MgdGhhdCBoYXZlIG9uZSBcdTIwMTQgYGRhdGFfcGxvdC5idWlsZF9oaXN0b2dyYW1gLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNlbnN1c0tleU9mKGJsb2NrOiBCbG9jayk6IHN0cmluZyB7XG4gIGNvbnN0IGVudHJ5ID0gYmxvY2tSZWdpc3RyeVtibG9jay50eXBlXTtcbiAgaWYgKCdpbnRlcmFjdGlvbicgaW4gYmxvY2sgJiYgZW50cnkudmFyaWFudHMpIHtcbiAgICByZXR1cm4gYCR7ZW50cnkuYW5hbHl0aWNzS2V5fS4ke2Jsb2NrLmludGVyYWN0aW9uLnR5cGV9YDtcbiAgfVxuICByZXR1cm4gZW50cnkuYW5hbHl0aWNzS2V5O1xufVxuXG4vKiogV2hldGhlciBhbiBJTlNUQU5DRSBkcmF3cyBhIHByb2JsZW0gbnVtYmVyIChkZWxlZ2F0ZXMgdG8gdGhlIHNjaGVtYSBydWxlXG4gKiBlbmdpbmUgXHUyMDE0IHJlLWV4cG9ydGVkIGhlcmUgc28gdmlld2VyIGNvZGUgaGFzIG9uZSBpbXBvcnQgc3VyZmFjZSkuICovXG5leHBvcnQgeyBpc1BhZ2VOdW1iZXJlZCB9O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBwcm9tcHRDYXJyaWVycy50cyBcdTIwMTQgdGhlIE9ORSBsaXN0IG9mIGlubGluZSB0eXBlcyB3aG9zZSBgcHJvbXB0c2AgY2Fycnkga2V5c1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEEgbWF0aCBub2RlJ3MgYHByb21wdHNgIGFycmF5IGhvbGRzIGluLWJhbmQgYW5zd2VyIG1hdGVyaWFsLCBzbyBib3RoIHRoZVxuLy8gc2FuaXRpemVyJ3MgZGVlcCBzdHJpcCAobGF5ZXIgMykgYW5kIHRoZSBncmFkaW5nIHdhbGsncyBrZXkgY29sbGVjdGlvbiBtdXN0XG4vLyBhZ3JlZSBvbiBleGFjdGx5IHdoaWNoIG5vZGUgdHlwZXMgY2FycnkgcHJvbXB0cy4gVW50aWwgMjAyNi0wOC0wNiB0aGlzIFNldFxuLy8gd2FzIGRlY2xhcmVkIHR3aWNlIHdpdGggaWRlbnRpY2FsIGNvbnRlbnRzIChzYW5pdGl6ZS50cyBhbmQgZ3JhZGluZy93YWxrLnRzXG4vLyBcdTIwMTQgczQtcmV0cm8gZmluZGluZyAxMCwgZml4ZWQgYnkgZW5nLXJldmlldyBBNyk6IHR3byBzcGVsbGluZ3Mgb2YgYSBzZWN1cml0eS1cbi8vIHJlbGV2YW50IHJvc3RlciwgYm9uZGVkIGJ5IG5vdGhpbmcuIEEgdHlwZSBhZGRlZCB0byBvbmUgYW5kIG5vdCB0aGUgb3RoZXJcbi8vIHdvdWxkIGVpdGhlciBsZWFrIGEgcHJvbXB0IGtleSB0byBzdHVkZW50cyAoc2FuaXRpemUgc2lkZSBtaXNzaW5nKSBvciBncmFkZVxuLy8gYWdhaW5zdCBhIGtleSB0aGUgd2lyZSBuZXZlciBjYXJyaWVkICh3YWxrIHNpZGUgbWlzc2luZykgXHUyMDE0IGJvdGggc2lsZW50LlxuLy9cbi8vIFRoaXMgbW9kdWxlIGlzIGEgZGVwZW5kZW5jeS1mcmVlIGxlYWYgT04gUFVSUE9TRTogaXQgaXMgaW1wb3J0ZWQgYnkgdGhlIHJlYWRcbi8vIGJ1bmRsZSAodmlhIHNhbml0aXplLnRzKSBBTkQgdGhlIGdyYWRpbmcgYnVuZGxlICh2aWEgd2Fsay50cyksIHNvIGl0IG11c3Rcbi8vIG5ldmVyIGdyb3cgYW4gaW1wb3J0IHRoYXQgZWl0aGVyIGJ1bmRsZSBjYW4ndCBhZmZvcmQuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vKiogSW5saW5lIG5vZGUgdHlwZXMgd2hvc2UgYHByb21wdHNgIGFycmF5cyBjYXJyeSBpbi1iYW5kIGFuc3dlciBrZXlzLiAqL1xuZXhwb3J0IGNvbnN0IFBST01QVF9DQVJSSUVSX1RZUEVTOiBSZWFkb25seVNldDxzdHJpbmc+ID0gbmV3IFNldChbXG4gICdtYXRoX2lubGluZScsXG4gICdtYXRoX2Jsb2NrJyxcbl0pO1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBzYW5pdGl6ZS9zYW5pdGl6ZS50cyBcdTIwMTQgdGhlIGFuc3dlci1rZXkgc2FuaXRpemVyIChTMi9UMywgcnVsaW5nIFRWNC1BKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEEgR0VORVJJQyBzdHJpcCB0cmFuc2Zvcm0gZHJpdmVuIGVudGlyZWx5IGJ5IHRoZSByZWdpc3RyeSdzIFNhbml0aXplU3BlY1xuLy8gZGVjbGFyYXRpb25zIFx1MjAxNCBpdCBob2xkcyBubyBwZXItdHlwZSBrbm93bGVkZ2Ugb2YgaXRzIG93biAocnVsaW5nIFExQTogdGhlXG4vLyByZWdpc3RyeSBkZWNsYXJlcywgdHJhbnNmb3JtcyBvYmV5KS4gUnVucyBzZXJ2ZXItc2lkZSBpbiB0aGUgZ2V0LWFjdGl2aXR5XG4vLyBFZGdlIEZ1bmN0aW9uLCBjb21wb3NlZCB3aXRoIHVwZ3JhZGUtb24tcmVhZDsgdGhlIG91dHB1dCBpcyB3aGF0IHRoZSBkdXJhYmxlXG4vLyBwZXItdmVyc2lvbiBjYWNoZSBzdG9yZXMgYW5kIHRoZSB2aWV3ZXIgcmVjZWl2ZXMuIEFuc3dlcnMgTkVWRVIgcmVhY2ggYVxuLy8gc3R1ZGVudCBjbGllbnQgKHJ1bGluZyBRMkIpIFx1MjAxNCB0aGUgd2lyZS1sZXZlbCBsZWFrIHRlc3RzIGluXG4vLyB0ZXN0cy9zYW5pdGl6ZS50ZXN0LnRzIGFzc2VydCB0aGUgb3V0Y29tZSwgbm90IHRoZSBtZWNoYW5pc20uXG4vL1xuLy8gVGhyZWUgbGF5ZXJzLCBpbiBvcmRlciwgcGVyIGJsb2NrOlxuLy8gICAxLiBEZWNsYXJlZCBzdHJpcHMgXHUyMDE0IHRoZSBlbnRyeSdzIGBzdHJpcGAgcGF0aHMsIGluIHRoZSB0aW55IGdyYW1tYXJcbi8vICAgICAgdHlwZXMudHMgZG9jdW1lbnRzICgnZmllbGQnLCAnZmllbGRbXS5zdWInLCAnaW50ZXJhY3Rpb24uZmllbGQnKS5cbi8vICAgMi4gQ2hpbGQgcmVjdXJzaW9uIFx1MjAxNCBgY2hpbGRCbG9ja3NgIGZpZWxkcyByZS1lbnRlciB0aGUgc2FuaXRpemVyLCBzbyBhXG4vLyAgICAgIGZpbGxfaW5fYmxhbmsgbmVzdGVkIGluIGEgd29ya2VkIGV4YW1wbGUgaXMgc3RyaXBwZWQgYnkgSVRTIE9XTiBlbnRyeS5cbi8vICAgMy4gSW4tYmFuZCBkZWVwIHdhbGsgXHUyMDE0IEJsYW5rVG9rZW4gYW5kIE1hdGhQcm9tcHQgc2VjcmV0cyBhcmUgc3RyaXBwZWQgZnJvbVxuLy8gICAgICBldmVyeSBvYmplY3QgdGhlIGJsb2NrIGNhcnJpZXMsIFVOQ09ORElUSU9OQUxMWSAobm90IGdhdGVkIG9uIHRoZVxuLy8gICAgICBlbnRyeSdzIGBpbmxpbmVCbGFua1NlY3JldHNgIGZsYWcpLiBEZWZlbnNlIGluIGRlcHRoOiB0aGUgc2NoZW1hIGFkbWl0c1xuLy8gICAgICBhIHByb21wdGVkIG1hdGhfaW5saW5lIGluc2lkZSBhbnkgY29udGVudCBhcnJheSBcdTIwMTQgYSBwYXJhZ3JhcGgsIGEgaGludCxcbi8vICAgICAgYSBsaXN0IGl0ZW0gXHUyMDE0IGFuZCBhIGRlY2xhcmF0aW9uIG1pc3MgdGhlcmUgbXVzdCBub3QgYmVjb21lIGEgc2lsZW50XG4vLyAgICAgIGxlYWsuIFRoZSBmbGFnIHN0YXlzIGRlY2xhcmF0aXZlIChzZWUgdHlwZXMudHMpLlxuLy9cbi8vIFdoYXQgc2FuaXRpemUgZG9lcyBOT1QgZG86IHRoZSBwZXItc3R1ZGVudCBgc2VydmVTaHVmZmxlZGAgcmVvcmRlci4gVGhhdCBpc1xuLy8gc2VydmUtdGltZSB3b3JrIChzaHVmZmxlLnRzKSBwcmVjaXNlbHkgc28gVEhJUyBvdXRwdXQgaXMgY2FjaGVhYmxlIHBlclxuLy8gdmVyc2lvbiBcdTIwMTQgdGhlIG9yZGVyIHNlY3JldCBjYW4ndCBiZSBoYW5kbGVkIGJ5IGEgc3RyaXAsIGFuZCB0aGUgc2h1ZmZsZVxuLy8gY2FuJ3QgYmUgaGFuZGxlZCBieSB0aGUgY2FjaGUuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgdHlwZSB7IEFjdGl2aXR5RG9jdW1lbnQsIEJsb2NrIH0gZnJvbSAnQGFjdGl2aXR5L3NjaGVtYSc7XG5pbXBvcnQge1xuICBCTEFOS19TRUNSRVRfRklFTERTLFxuICBNQVRIX1BST01QVF9TRUNSRVRfRklFTERTLFxuICBibG9ja1JlZ2lzdHJ5LFxuICByZWdpc3RlcmVkQmxvY2tUeXBlcyxcbn0gZnJvbSAnLi4vcmVnaXN0cnkvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgUFJPTVBUX0NBUlJJRVJfVFlQRVMgfSBmcm9tICcuL3Byb21wdENhcnJpZXJzLmpzJztcbmltcG9ydCB0eXBlIHtcbiAgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCxcbiAgU2FuaXRpemVkQmxvY2ssXG59IGZyb20gJy4vc2FuaXRpemVkLXR5cGVzLmpzJztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNhbml0aXplciByZXZpc2lvbiBcdTIwMTQgdGhlIGR1cmFibGUgY2FjaGUncyBpbnZhbGlkYXRpb24ga2V5XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHJlYWQgY2FjaGUgc3RvcmVzIHNhbml0aXplZCBvdXRwdXQgcGVyICh2ZXJzaW9uX2lkLCBTQU5JVElaRVJfUkVWKS4gVGhlXG4vLyByZXYgaXMgQ09NUFVURUQgZnJvbSB0aGUgcmVnaXN0cnkncyBzYW5pdGl6ZSBkZWNsYXJhdGlvbnMgKyB0aGUgc2VjcmV0LWZpZWxkXG4vLyBsaXN0cywgc28gY2hhbmdpbmcgYW55IHNwZWMgYXV0b21hdGljYWxseSBvcnBoYW5zIGV2ZXJ5IHN0YWxlIGNhY2hlIHJvdyBcdTIwMTQgYVxuLy8gc2FuaXRpemVyIGZpeCB0aGF0IHJlcXVpcmVkIGEgaGFuZC1idW1wZWQgY29uc3RhbnQgdG8gdGFrZSBlZmZlY3QgaXMgZXhhY3RseVxuLy8gdGhlIGZvcmdldHRhYmxlLXN0ZXAgY2xhc3MgdGhpcyByZXBvIGRvY3VtZW50cyAoZ3JhcGgta2l0IG1hbmlmZXN0LCAwMDE1J3Ncbi8vIGdyYW50IHN0YW56YXMpLiBCdW1wIFNBTklUSVpFUl9BTEdPX1JFViBieSBoYW5kIE9OTFkgd2hlbiB0aGUgdHJhbnNmb3JtXG4vLyBsb2dpYyBpdHNlbGYgY2hhbmdlcyBpbiBhIHdheSB0aGUgZGVjbGFyYXRpb25zIGRvbid0IGNhcHR1cmUuXG5cbi8vIDEgLT4gMiAoMjAyNi0wOC0yMyk6IHRoZSBwZXItYmxvY2sgc3RyaXBzIGJlZ2FuIGNvdmVyaW5nIGByZWZlcmVuY2VQYW5lbGBcbi8vIGFzIHdlbGwgYXMgdGhlIGJvZHkuIFRoaXMgaXMgRVhBQ1RMWSB0aGUgY2FzZSB0aGUgbm90ZSBhYm92ZSByZXNlcnZlcyBhIGhhbmRcbi8vIGJ1bXAgZm9yIFx1MjAxNCB0aGUgdHJhbnNmb3JtIGNoYW5nZWQgd2hpbGUgZXZlcnkgc2FuaXRpemUgREVDTEFSQVRJT04gc3RheWVkXG4vLyBpZGVudGljYWwsIHNvIHRoZSBjb21wdXRlZCByZXYgd291bGQgbm90IGhhdmUgbW92ZWQgYW5kIGV2ZXJ5IGNhY2hlZCByb3dcbi8vIHdvdWxkIGhhdmUga2VwdCBzZXJ2aW5nIHRoZSBsZWFrIGl0IHdhcyB3cml0dGVuIHdpdGguXG5leHBvcnQgY29uc3QgU0FOSVRJWkVSX0FMR09fUkVWID0gMjtcblxuLyoqIEZOVi0xYSAzMi1iaXQsIGhleC4gVGlueSwgZGVwZW5kZW5jeS1mcmVlLCBzdGFibGUgYWNyb3NzIEpTIHJ1bnRpbWVzIFx1MjAxNFxuICogdGhpcyBpcyBhIGNhY2hlLWJ1c3RpbmcgZmluZ2VycHJpbnQsIG5vdCBzZWN1cml0eSBtYXRlcmlhbC4gKi9cbmZ1bmN0aW9uIGZudjFhKHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBoYXNoID0gMHg4MTFjOWRjNTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0ZXh0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaGFzaCBePSB0ZXh0LmNoYXJDb2RlQXQoaSk7XG4gICAgaGFzaCA9IE1hdGguaW11bChoYXNoLCAweDAxMDAwMTkzKTtcbiAgfVxuICByZXR1cm4gKGhhc2ggPj4+IDApLnRvU3RyaW5nKDE2KS5wYWRTdGFydCg4LCAnMCcpO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlU2FuaXRpemVyUmV2KCk6IHN0cmluZyB7XG4gIGNvbnN0IHNwZWNzID0gWy4uLnJlZ2lzdGVyZWRCbG9ja1R5cGVzXVxuICAgIC5zb3J0KClcbiAgICAubWFwKCh0eXBlKSA9PiBbdHlwZSwgYmxvY2tSZWdpc3RyeVt0eXBlXS5zYW5pdGl6ZV0pO1xuICBjb25zdCBtYXRlcmlhbCA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICBhbGdvOiBTQU5JVElaRVJfQUxHT19SRVYsXG4gICAgYmxhbms6IEJMQU5LX1NFQ1JFVF9GSUVMRFMsXG4gICAgcHJvbXB0OiBNQVRIX1BST01QVF9TRUNSRVRfRklFTERTLFxuICAgIHNwZWNzLFxuICB9KTtcbiAgcmV0dXJuIGAke1NBTklUSVpFUl9BTEdPX1JFVn0tJHtmbnYxYShtYXRlcmlhbCl9YDtcbn1cblxuLyoqIFRoZSBjYWNoZSBrZXkgY29tcG9uZW50LiBTdGFibGUgZm9yIGEgZ2l2ZW4gcmVnaXN0cnkgKyBhbGdvcml0aG07IGNoYW5nZXNcbiAqIHdoZW5ldmVyIGFueSBzYW5pdGl6ZSBkZWNsYXJhdGlvbiBjaGFuZ2VzLiAqL1xuZXhwb3J0IGNvbnN0IFNBTklUSVpFUl9SRVYgPSBjb21wdXRlU2FuaXRpemVyUmV2KCk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc3RyaXAgZ3JhbW1hciAoZXhhY3RseSB3aGF0IHR5cGVzLnRzIGRvY3VtZW50cyBcdTIwMTQgbm90aGluZyBtb3JlKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gYXBwbHlTdHJpcFBhdGgoYmxvY2s6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBwYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgYXJyYXlJZHggPSBwYXRoLmluZGV4T2YoJ1tdLicpO1xuICBpZiAoYXJyYXlJZHggIT09IC0xKSB7XG4gICAgLy8gJ2ZpZWxkW10uc3ViJyBcdTIwMTQgZGVsZXRlIGBzdWJgIGZyb20gZXZlcnkgZWxlbWVudCBvZiBhcnJheSBgZmllbGRgLlxuICAgIGNvbnN0IGZpZWxkID0gcGF0aC5zbGljZSgwLCBhcnJheUlkeCk7XG4gICAgY29uc3Qgc3ViID0gcGF0aC5zbGljZShhcnJheUlkeCArIDMpO1xuICAgIGNvbnN0IGFyciA9IGJsb2NrW2ZpZWxkXTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgICBmb3IgKGNvbnN0IGVsIG9mIGFycikge1xuICAgICAgICBpZiAoZWwgIT09IG51bGwgJiYgdHlwZW9mIGVsID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIGRlbGV0ZSAoZWwgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW3N1Yl07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGRvdElkeCA9IHBhdGguaW5kZXhPZignLicpO1xuICBpZiAoZG90SWR4ICE9PSAtMSkge1xuICAgIC8vICdwYXJlbnQuZmllbGQnIFx1MjAxNCBkZWxldGUgYGZpZWxkYCBmcm9tIHRoZSBuZXN0ZWQgb2JqZWN0IHdoZW4gcHJlc2VudC5cbiAgICAvLyBWYXJpYW50LXNjb3BlZCBrZXlzIHNpbXBseSBkb24ndCBtYXRjaCBvbiBvdGhlciB2YXJpYW50cy5cbiAgICBjb25zdCBwYXJlbnQgPSBibG9ja1twYXRoLnNsaWNlKDAsIGRvdElkeCldO1xuICAgIGlmIChwYXJlbnQgIT09IG51bGwgJiYgdHlwZW9mIHBhcmVudCA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkocGFyZW50KSkge1xuICAgICAgZGVsZXRlIChwYXJlbnQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW3BhdGguc2xpY2UoZG90SWR4ICsgMSldO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cbiAgLy8gJ2ZpZWxkJyBcdTIwMTQgZGVsZXRlIHRoZSBibG9jaydzIHRvcC1sZXZlbCBmaWVsZC5cbiAgZGVsZXRlIGJsb2NrW3BhdGhdO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSW4tYmFuZCBzZWNyZXRzIFx1MjAxNCB0aGUgdW5jb25kaXRpb25hbCBkZWVwIHdhbGsgKGxheWVyIDMpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUFJPTVBUX0NBUlJJRVJfVFlQRVMgaXMgc2luZ2xlLXNvdXJjZWQgKHByb21wdENhcnJpZXJzLnRzKSBcdTIwMTQgdGhlIGdyYWRpbmdcbi8vIHdhbGsgY29uc3VtZXMgdGhlIHNhbWUgcm9zdGVyLCBhbmQgdHdvIGRlY2xhcmF0aW9ucyBkcmlmdGVkLXJpc2sgYSBzaWxlbnRcbi8vIGxlYWsgb3IgYSBzaWxlbnQgbWlzLWdyYWRlIChBNykuXG5cbmZ1bmN0aW9uIHN0cmlwSW5CYW5kU2VjcmV0cyh2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBmb3IgKGNvbnN0IGVsIG9mIHZhbHVlKSBzdHJpcEluQmFuZFNlY3JldHMoZWwpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodmFsdWUgPT09IG51bGwgfHwgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JykgcmV0dXJuO1xuICBjb25zdCBvYmogPSB2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICBpZiAob2JqLnR5cGUgPT09ICdibGFuaycpIHtcbiAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIEJMQU5LX1NFQ1JFVF9GSUVMRFMpIGRlbGV0ZSBvYmpbZmllbGRdO1xuICB9XG4gIGlmIChcbiAgICB0eXBlb2Ygb2JqLnR5cGUgPT09ICdzdHJpbmcnICYmXG4gICAgUFJPTVBUX0NBUlJJRVJfVFlQRVMuaGFzKG9iai50eXBlKSAmJlxuICAgIEFycmF5LmlzQXJyYXkob2JqLnByb21wdHMpXG4gICkge1xuICAgIGZvciAoY29uc3QgcHJvbXB0IG9mIG9iai5wcm9tcHRzKSB7XG4gICAgICBpZiAocHJvbXB0ICE9PSBudWxsICYmIHR5cGVvZiBwcm9tcHQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgZmllbGQgb2YgTUFUSF9QUk9NUFRfU0VDUkVUX0ZJRUxEUykge1xuICAgICAgICAgIGRlbGV0ZSAocHJvbXB0IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVtmaWVsZF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMob2JqKSkgc3RyaXBJbkJhbmRTZWNyZXRzKG9ialtrZXldKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFBlci1ibG9jayBzYW5pdGl6ZVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIE11dGF0aW5nIGNvcmUgXHUyMDE0IG9wZXJhdGVzIG9uIGFuIGFscmVhZHktY2xvbmVkIGJsb2NrLiAqL1xuXG4vLyAtLS0tIERlcml2ZWQgcXVlc3Rpb24gc2hhcGUgKHRoZSBvbmUgQURESVRJVkUgc3RlcCkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHNhbml0aXplcidzIGpvYiBpcyByZW1vdmFsOyB0aGlzIGlzIHRoZSBzaW5nbGUgZXhjZXB0aW9uLCBhbmQgaXQgaXNcbi8vIGZlbmNlZCBhY2NvcmRpbmdseS5cbi8vXG4vLyBXaHkgaXQgZXhpc3RzOiB0aGUgZ3JhcGggd2lkZ2V0cyB0YWtlIHRoZWlyIGhhbmRsZSBjb3VudCBhbmQgY3VydmUgZmFtaWx5XG4vLyBmcm9tIHRoZSBhbnN3ZXIga2V5LiBUaGUgdmlld2VyIG5ldmVyIHJlY2VpdmVzIGEga2V5LCBzbyB3aXRob3V0IHRoaXMgYVxuLy8gc2VydmVkIGdyYXBoIHF1ZXN0aW9uIGNhbm5vdCBiZSBsYWlkIG91dCBcdTIwMTQgdGhlcmUgaXMgbm8gd2F5IHRvIGtub3cgd2hldGhlclxuLy8gdG8gZHJhdyBvbmUgaGFuZGxlIG9yIHRocmVlLlxuLy9cbi8vIFdoeSBpdCBpcyBzYWZlOiB3aGF0IGxlYXZlcyBoZXJlIGlzIHF1ZXN0aW9uIFNIQVBFLCB3aGljaCB0aGUgc3R1ZGVudCBjYW5cbi8vIGFscmVhZHkgc2VlIChob3cgbWFueSBoYW5kbGVzOyB3aGljaCBmYW1pbHkncyBjdXJ2ZSBmb2xsb3dzIHRoZWlyIGRyYWdzKSxcbi8vIG5ldmVyIHRoZSBjb29yZGluYXRlcywgdG9sZXJhbmNlcywgb3IgY29lZmZpY2llbnRzIHRoYXQgbWFrZSBhbiBhbnN3ZXIuIFRoZVxuLy8gZ3VhcmFudGVlIGlzIFNUUlVDVFVSQUwgcmF0aGVyIHRoYW4gYSBwcm9taXNlIGFib3V0IHRoaXMgY29kZTogZXZlcnkgdmFsdWVcbi8vIHBhc3NlcyBhIHdoaXRlbGlzdCBvbiB0aGUgd2F5IG91dCBcdTIwMTQgc21hbGwgcG9zaXRpdmUgaW50ZWdlcnMsIG9yIGEgZmFtaWx5XG4vLyBuYW1lIGZyb20gYSBjbG9zZWQgc2V0IFx1MjAxNCBzbyBhIGNvb3JkaW5hdGUgY2Fubm90IHRyYXZlbCB0aGlzIHBhdGggZXZlbiBpZiBhXG4vLyBmdXR1cmUgZWRpdCB0cmllZCB0byBzZW5kIG9uZS4gQW55dGhpbmcgZmFpbGluZyB0aGUgd2hpdGVsaXN0IGlzIGRyb3BwZWQsXG4vLyBub3QgcGFzc2VkIHRocm91Z2ggKGZhaWwgY2xvc2VkLCBsaWtlIHRoZSB1bmtub3duLWJsb2NrLXR5cGUgdGhyb3cpLlxuXG4vKiogVXBwZXIgYm91bmQgb24gYSBoYW5kbGUgY291bnQuIEZhciBhYm92ZSBhbnkgcmVhbCBxdWVzdGlvbjsgZXhpc3RzIHNvIGFcbiAqIGNvcnJ1cHQgb3IgaG9zdGlsZSBsZW5ndGggY2FuJ3QgYmVjb21lIGFuIGFic3VyZCBhbGxvY2F0aW9uIGRvd25zdHJlYW0uICovXG5jb25zdCBNQVhfSEFORExFUyA9IDI0O1xuXG4vKiogQ3VydmUgZmFtaWxpZXMgdGhlIHdpZGdldCBsYXlzIG91dC4gQ2xvc2VkIHNldDogYW4gdW5yZWNvZ25pemVkIGZhbWlseSBpc1xuICogZHJvcHBlZCBhbmQgdGhlIHdpZGdldCBmYWxscyBiYWNrIHRvIGl0cyBvd24gZGVmYXVsdC4gKi9cbmNvbnN0IEtOT1dOX0ZBTUlMSUVTOiBSZWFkb25seVNldDxzdHJpbmc+ID0gbmV3IFNldChbXG4gICdsaW5lYXInLFxuICAncXVhZHJhdGljJyxcbiAgJ2V4cG9uZW50aWFsJyxcbiAgJ2xvZ2FyaXRobWljJyxcbiAgJ3ZlcnRpY2FsJyxcbiAgJ2Fic29sdXRlJyxcbiAgJ3NxcnQnLFxuICAnY3ViaWMnLFxuXSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUXVlc3Rpb25TaGFwZSB7XG4gIGhhbmRsZUNvdW50PzogbnVtYmVyO1xuICBmYW1pbHk/OiBzdHJpbmc7XG4gIHZlcnRleENvdW50PzogbnVtYmVyO1xufVxuXG4vKiogQSBjb3VudCBzdXJ2aXZlcyBvbmx5IGFzIGEgc21hbGwgcG9zaXRpdmUgaW50ZWdlci4gKi9cbmZ1bmN0aW9uIHNhZmVDb3VudCh2YWx1ZTogdW5rbm93bik6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmXG4gICAgTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgJiZcbiAgICB2YWx1ZSA+IDAgJiZcbiAgICB2YWx1ZSA8PSBNQVhfSEFORExFU1xuICAgID8gdmFsdWVcbiAgICA6IHVuZGVmaW5lZDtcbn1cblxuLyoqIEEgZmFtaWx5IHN1cnZpdmVzIG9ubHkgaWYgaXQgaXMgYSBrbm93biBuYW1lLiAqL1xuZnVuY3Rpb24gc2FmZUZhbWlseSh2YWx1ZTogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIEtOT1dOX0ZBTUlMSUVTLmhhcyh2YWx1ZSlcbiAgICA/IHZhbHVlXG4gICAgOiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogRGVyaXZlIHRoZSBzZXJ2ZWQgcXVlc3Rpb24gc2hhcGUgZnJvbSBhbiBVTlNBTklUSVpFRCBibG9jayAoaXQgcmVhZHMgdGhlXG4gKiBhbnN3ZXIga2V5LCBzbyBpdCBtdXN0IHJ1biBiZWZvcmUgdGhlIHN0cmlwcykuIFJldHVybnMgdW5kZWZpbmVkIHdoZW4gdGhlcmVcbiAqIGlzIG5vdGhpbmcgdG8gc2F5IFx1MjAxNCBhIGRpc3BsYXktbW9kZSBncmFwaCB0YWtlcyBubyBpbnB1dCBhbmQgZ2V0cyBubyBzaGFwZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlcml2ZVF1ZXN0aW9uU2hhcGUoXG4gIGJsb2NrOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbik6IFF1ZXN0aW9uU2hhcGUgfCB1bmRlZmluZWQge1xuICBjb25zdCBpbnRlcmFjdGlvbiA9IGJsb2NrLmludGVyYWN0aW9uIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xuICBjb25zdCBraW5kID0gdHlwZW9mIGludGVyYWN0aW9uPy50eXBlID09PSAnc3RyaW5nJyA/IGludGVyYWN0aW9uLnR5cGUgOiBudWxsO1xuICBpZiAoIWtpbmQgfHwga2luZCA9PT0gJ2Rpc3BsYXknKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHNoYXBlOiBRdWVzdGlvblNoYXBlID0ge307XG5cbiAgLy8gUG9pbnQtc3R5bGUgaW50ZXJhY3Rpb25zOiBvbmUgaGFuZGxlIHBlciBhdXRob3JlZCB0YXJnZXQuIFRoaXMgbWlycm9yc1xuICAvLyBleGFjdGx5IHdoYXQgdGhlIGdyYWRlZCB3aWRnZXQgYWxyZWFkeSBkb2VzIHdpdGggdGhlIGtleVxuICAvLyAoY291bnQgPSBjb3JyZWN0UG9pbnRzLmxlbmd0aCksIHNvIGEgc3R1ZGVudCBzZWVzIHRoZSBzYW1lIHdpZGdldCBlaXRoZXJcbiAgLy8gd2F5IFx1MjAxNCB0aGUgbnVtYmVyIG9mIGhhbmRsZXMgaXMgbm90IHRoZSBzZWNyZXQsIHRoZWlyIHBvc2l0aW9ucyBhcmUuXG4gIGNvbnN0IHBvaW50cyA9IGludGVyYWN0aW9uPy5jb3JyZWN0UG9pbnRzO1xuICBpZiAoQXJyYXkuaXNBcnJheShwb2ludHMpKSB7XG4gICAgY29uc3QgY291bnQgPSBzYWZlQ291bnQocG9pbnRzLmxlbmd0aCk7XG4gICAgaWYgKGNvdW50ICE9PSB1bmRlZmluZWQpIHNoYXBlLmhhbmRsZUNvdW50ID0gY291bnQ7XG4gIH1cblxuICAvLyBDdXJ2ZSBmYW1pbGllczogdGhlIHNoYXBlIG9mIHRoZSBjdXJ2ZSB0aGF0IGZvbGxvd3MgdGhlIHN0dWRlbnQncyBkcmFncy5cbiAgY29uc3QgbW9kZWxzID0gaW50ZXJhY3Rpb24/Lm1vZGVscztcbiAgaWYgKEFycmF5LmlzQXJyYXkobW9kZWxzKSAmJiBtb2RlbHMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGZhbWlseSA9IHNhZmVGYW1pbHkoXG4gICAgICAobW9kZWxzWzBdIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbCk/LmZhbWlseSxcbiAgICApO1xuICAgIGlmIChmYW1pbHkgIT09IHVuZGVmaW5lZCkgc2hhcGUuZmFtaWx5ID0gZmFtaWx5O1xuICB9XG5cbiAgLy8gQW4gaW5lcXVhbGl0eSdzIGJvdW5kYXJ5IHJpZGVzIHRoZSBzYW1lIGZhbWlseSBtYWNoaW5lcnkuXG4gIGNvbnN0IGluZXF1YWxpdGllcyA9IGludGVyYWN0aW9uPy5pbmVxdWFsaXRpZXM7XG4gIGlmIChBcnJheS5pc0FycmF5KGluZXF1YWxpdGllcykgJiYgaW5lcXVhbGl0aWVzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBib3VuZGFyeSA9IChpbmVxdWFsaXRpZXNbMF0gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsKVxuICAgICAgPy5ib3VuZGFyeSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBmYW1pbHkgPSBzYWZlRmFtaWx5KGJvdW5kYXJ5Py5mYW1pbHkpO1xuICAgIGlmIChmYW1pbHkgIT09IHVuZGVmaW5lZCkgc2hhcGUuZmFtaWx5ID0gZmFtaWx5O1xuICB9XG5cbiAgLy8gUG9seWdvbiB2ZXJ0ZXggY291bnQgZm9yIHNoYWRlX3JlZ2lvbi5cbiAgY29uc3QgcmVnaW9ucyA9IGludGVyYWN0aW9uPy5yZWdpb25zO1xuICBpZiAoQXJyYXkuaXNBcnJheShyZWdpb25zKSAmJiByZWdpb25zLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCB2ZXJ0aWNlcyA9IChyZWdpb25zWzBdIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbClcbiAgICAgID8uY29ycmVjdFZlcnRpY2VzO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZlcnRpY2VzKSkge1xuICAgICAgY29uc3QgY291bnQgPSBzYWZlQ291bnQodmVydGljZXMubGVuZ3RoKTtcbiAgICAgIGlmIChjb3VudCAhPT0gdW5kZWZpbmVkKSBzaGFwZS52ZXJ0ZXhDb3VudCA9IGNvdW50O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBPYmplY3Qua2V5cyhzaGFwZSkubGVuZ3RoID4gMCA/IHNoYXBlIDogdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBzYW5pdGl6ZUJsb2NrTXV0KGJsb2NrOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICBjb25zdCB0eXBlID0gYmxvY2sudHlwZTtcbiAgY29uc3QgZW50cnkgPVxuICAgIHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyAmJiB0eXBlIGluIGJsb2NrUmVnaXN0cnlcbiAgICAgID8gYmxvY2tSZWdpc3RyeVt0eXBlIGFzIGtleW9mIHR5cGVvZiBibG9ja1JlZ2lzdHJ5XVxuICAgICAgOiB1bmRlZmluZWQ7XG4gIGlmICghZW50cnkpIHtcbiAgICAvLyBBIHZhbGlkYXRlZCBBY3Rpdml0eURvY3VtZW50IGNhbid0IGdldCBoZXJlICh0aGUgcmVnaXN0cnkgY292ZXJhZ2UgZ3VhcmRcbiAgICAvLyBwcm92ZXMgZXhhY3QgYWdyZWVtZW50IHdpdGggdGhlIEJsb2NrIHVuaW9uKSBcdTIwMTQgYnV0IHRoZSBzYW5pdGl6ZXIgc2l0cyBvblxuICAgIC8vIHRoZSB3aXJlIGJvdW5kYXJ5LCBzbyBhbiB1bmtub3duIHR5cGUgZmFpbHMgQ0xPU0VELCBuZXZlciBwYXNzZXMgdGhyb3VnaC5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYHNhbml0aXplOiB1bmtub3duIGJsb2NrIHR5cGUgJHtTdHJpbmcodHlwZSl9YCk7XG4gIH1cblxuICAvLyBEZXJpdmVkIHNoYXBlIGlzIGNvbXB1dGVkIEJFRk9SRSB0aGUgc3RyaXBzIChpdCByZWFkcyB0aGUgYW5zd2VyIGtleSkgYW5kXG4gIC8vIGF0dGFjaGVkIGFmdGVyLCBzbyB0aGUgc2VydmVkIGJsb2NrIGNhcnJpZXMgb25seSB0aGUgd2hpdGVsaXN0ZWQgcmVzdWx0LlxuICBjb25zdCBzaGFwZSA9IGVudHJ5LnNhbml0aXplLmRlcml2ZVF1ZXN0aW9uU2hhcGVcbiAgICA/IGRlcml2ZVF1ZXN0aW9uU2hhcGUoYmxvY2spXG4gICAgOiB1bmRlZmluZWQ7XG5cbiAgZm9yIChjb25zdCBwYXRoIG9mIGVudHJ5LnNhbml0aXplLnN0cmlwKSBhcHBseVN0cmlwUGF0aChibG9jaywgcGF0aCk7XG5cbiAgaWYgKHNoYXBlKSBibG9jay5xdWVzdGlvblNoYXBlID0gc2hhcGU7XG5cbiAgZm9yIChjb25zdCBmaWVsZCBvZiBlbnRyeS5zYW5pdGl6ZS5jaGlsZEJsb2NrcyA/PyBbXSkge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gYmxvY2tbZmllbGRdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSkge1xuICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikge1xuICAgICAgICBpZiAoY2hpbGQgIT09IG51bGwgJiYgdHlwZW9mIGNoaWxkID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHNhbml0aXplQmxvY2tNdXQoY2hpbGQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RyaXBJbkJhbmRTZWNyZXRzKGJsb2NrKTtcbn1cblxuLyoqXG4gKiBTYW5pdGl6ZSBhIGxvb3NlIElOTElORS1DT05URU5UIGFycmF5IHB1bGxlZCBvdXQgb2YgdGhlIHJhdyBkb2N1bWVudCAocHVyZSkuXG4gKlxuICogUzQncyBncmFkaW5nIFJQQyBpcyBhIHNlY29uZCBzZXJ2ZXJcdTIxOTJjbGllbnQgY2hhbm5lbDogaXQgcmV0dXJucyBhdXRob3JlZFxuICogYGZlZWRiYWNrYCBhbmQgYHNvbHV0aW9uYCBjb250ZW50IHRoYXQgdGhlIHJlYWQgQVBJIGRlbGliZXJhdGVseSBzdHJpcHBlZCBhbmRcbiAqIHRoZSBzZXJ2ZXIgcmVsZWFzZXMgb25seSBhZnRlciBhIGNoZWNrLiBUaG9zZSBhcmUgYElubGluZU5vZGVbXWAsIGFuZCBhblxuICogaW5saW5lIGFycmF5IGNhbiBjYXJyeSBpbi1iYW5kIHNlY3JldHMgXHUyMDE0IGEgcHJvbXB0ZWQgYG1hdGhfaW5saW5lYCBzaXR0aW5nXG4gKiBpbnNpZGUgYSBzb2x1dGlvbiBwYXJhZ3JhcGgsIG9yIGEgcGFzdGVkIGJsYW5rIHRva2VuIFx1MjAxNCBzbyBpdCBtdXN0IGdvIHRocm91Z2hcbiAqIHRoZSBTQU1FIHVuY29uZGl0aW9uYWwgZGVlcCB3YWxrIHRoZSBzZXJ2ZWQgZG9jdW1lbnQgZG9lcy4gV2l0aG91dCB0aGlzLCBhblxuICogYXV0aG9yZWQgc29sdXRpb24gY29udGFpbmluZyBhIGJsYW5rIHdvdWxkIGhhbmQgZXZlcnkgY2hlY2tpbmcgc3R1ZGVudCB0aGF0XG4gKiBibGFuaydzIGFuc3dlcnMsIHNpbGVudGx5LlxuICpcbiAqIFJldXNpbmcgYHN0cmlwSW5CYW5kU2VjcmV0c2AgcmF0aGVyIHRoYW4gcmVpbXBsZW1lbnRpbmcgaXQgaXMgdGhlIHBvaW50OiB0aGVcbiAqIHNlY3JldC1maWVsZCBsaXN0cyBsaXZlIGluIHRoZSByZWdpc3RyeSwgYW5kIGEgZnV0dXJlIGFkZGl0aW9uIHRvIHRoZW0gaGFzIHRvXG4gKiBwcm90ZWN0IGJvdGggY2hhbm5lbHMgYXV0b21hdGljYWxseSBvciBpdCBwcm90ZWN0cyBuZWl0aGVyLlxuICpcbiAqIFJldHVybnMgYSBjbG9uZTsgdGhlIGNhbGxlcidzIGFycmF5IGlzIG5ldmVyIG11dGF0ZWQgKGl0IGJlbG9uZ3MgdG8gdGhlXG4gKiBjYWNoZWQgcmF3IGRvY3VtZW50KS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplSW5saW5lQ29udGVudDxUPihub2RlczogVFtdKTogVFtdIHtcbiAgY29uc3QgY2xvbmUgPSBzdHJ1Y3R1cmVkQ2xvbmUobm9kZXMpO1xuICBzdHJpcEluQmFuZFNlY3JldHMoY2xvbmUpO1xuICByZXR1cm4gY2xvbmU7XG59XG5cbi8qKiBTYW5pdGl6ZSBPTkUgYmxvY2sgKHB1cmUpLiBFeHBvc2VkIGZvciB0ZXN0cyBhbmQgcGVyLWJsb2NrIHRvb2xpbmc7IHRoZVxuICogZG9jdW1lbnQtbGV2ZWwgZW50cnkgcG9pbnQgYmVsb3cgaXMgd2hhdCB0aGUgcmVhZCBBUEkgdXNlcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUJsb2NrKGJsb2NrOiBCbG9jayk6IFNhbml0aXplZEJsb2NrIHtcbiAgY29uc3QgY2xvbmUgPSBzdHJ1Y3R1cmVkQ2xvbmUoYmxvY2spIGFzIHVua25vd24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIHNhbml0aXplQmxvY2tNdXQoY2xvbmUpO1xuICByZXR1cm4gY2xvbmUgYXMgdW5rbm93biBhcyBTYW5pdGl6ZWRCbG9jaztcbn1cblxuLyoqXG4gKiBTYW5pdGl6ZSBhIGZ1bGwgdXBncmFkZWQgZG9jdW1lbnQgKHB1cmUpLiBFdmVyeSBibG9jayB0aGUgZG9jdW1lbnQgc2hpcHMgXHUyMDE0XG4gKiBib2R5IEFORCByZWZlcmVuY2UgcGFuZWwgXHUyMDE0IGdvZXMgdGhyb3VnaCBpdHMgcmVnaXN0cnkgZW50cnk7IHRoZSBpbi1iYW5kIGRlZXBcbiAqIHdhbGsgdGhlbiBjb3ZlcnMgd2hhdGV2ZXIgaXMgbGVmdCAobWV0YSwgaW5saW5lIG5vZGVzIGFueXdoZXJlKSBhcyBkZWZlbnNlIGluXG4gKiBkZXB0aC5cbiAqXG4gKiBcdTI2QTAgVGhlIHJlZmVyZW5jZSBwYW5lbCB3YXMgTk9UIGluIHRoYXQgc2V0IHVudGlsIDIwMjYtMDgtMjMsIGFuZCB0aGUgY29tbWVudFxuICogaGVyZSBhc3NlcnRlZCB0aGUgcmVhc29uIGl0IGRpZCBub3QgbmVlZCB0byBiZTogXCJ0aG9zZSBzdXJmYWNlcyBjYXJyeSBub1xuICogZGVjbGFyZWQgYW5zd2VyIGtleXNcIi4gVGhhdCB3YXMgZmFsc2UuIGBSZWZlcmVuY2VQYW5lbC5ibG9ja3NgIGlzXG4gKiBgei5hcnJheShCbG9jaylgIFx1MjAxNCB0aGUgU0FNRSBmdWxsIHVuaW9uIGFzIHNlY3Rpb24gY29udGVudCwgbXVsdGlwbGUgY2hvaWNlXG4gKiBhbmQgbWF0Y2hpbmcgaW5jbHVkZWQgXHUyMDE0IHNvIGEga2V5LWJlYXJpbmcgYmxvY2sgaW4gYSBwYW5lbCByZWFjaGVkIHRoZSBzdHVkZW50XG4gKiB3aXRoIGl0cyBrZXkgaW50YWN0LCBiZWNhdXNlIHRoZSBkZWVwIHdhbGsgYmVsb3cga25vd3Mgb25seSBhYm91dCBibGFua3MgYW5kXG4gKiBtYXRoIHByb21wdHMuIFRoZSBsZWFrIGZpeHR1cmUgbm93IHBsYW50cyBldmVyeSBibG9jayB0eXBlIGluIHRoZSBwYW5lbCB0b28sXG4gKiBzbyB0aGlzIGlzIGEgd2lyZS1zY2FubmVkIHByb3BlcnR5IHJhdGhlciB0aGFuIGEgY2xhaW0gaW4gYSBjb21tZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVBY3Rpdml0eURvY3VtZW50KFxuICBkb2M6IEFjdGl2aXR5RG9jdW1lbnQsXG4pOiBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50IHtcbiAgY29uc3QgY2xvbmUgPSBzdHJ1Y3R1cmVkQ2xvbmUoZG9jKSBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+ICYge1xuICAgIHNlY3Rpb25zOiBBcnJheTx7XG4gICAgICByb3dzOiBBcnJheTx7IGNvbHVtbnM6IEFycmF5PHsgYmxvY2tzOiB1bmtub3duW10gfT4gfT47XG4gICAgfT47XG4gIH07XG4gIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBjbG9uZS5zZWN0aW9ucykge1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHNlY3Rpb24ucm93cykge1xuICAgICAgZm9yIChjb25zdCBjb2x1bW4gb2Ygcm93LmNvbHVtbnMpIHtcbiAgICAgICAgZm9yIChjb25zdCBibG9jayBvZiBjb2x1bW4uYmxvY2tzKSB7XG4gICAgICAgICAgaWYgKGJsb2NrICE9PSBudWxsICYmIHR5cGVvZiBibG9jayA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHNhbml0aXplQmxvY2tNdXQoYmxvY2sgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBUaGUgcmVmZXJlbmNlIHBhbmVsIHNoaXBzIHRoZSBzYW1lIEJsb2NrIHVuaW9uIHRoZSBib2R5IGRvZXMsIHNvIGl0IGdldHNcbiAgLy8gdGhlIHNhbWUgcGVyLWJsb2NrIHRyZWF0bWVudC4gU2NhZmZvbGQgYnkgaW50ZW50IGlzIG5vdCBzY2FmZm9sZCBieSBTQ0hFTUEuXG4gIGNvbnN0IHBhbmVsID0gY2xvbmUucmVmZXJlbmNlUGFuZWw7XG4gIGlmIChwYW5lbCAhPT0gbnVsbCAmJiB0eXBlb2YgcGFuZWwgPT09ICdvYmplY3QnKSB7XG4gICAgY29uc3QgcGFuZWxCbG9ja3MgPSAocGFuZWwgYXMgeyBibG9ja3M/OiB1bmtub3duIH0pLmJsb2NrcztcbiAgICBpZiAoQXJyYXkuaXNBcnJheShwYW5lbEJsb2NrcykpIHtcbiAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgcGFuZWxCbG9ja3MpIHtcbiAgICAgICAgaWYgKGJsb2NrICE9PSBudWxsICYmIHR5cGVvZiBibG9jayA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBzYW5pdGl6ZUJsb2NrTXV0KGJsb2NrIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBFdmVyeXRoaW5nIGVsc2UgKG1ldGEsIGFuZCBhbnkgaW5saW5lIG5vZGUgYW55d2hlcmUpIFx1MjAxNCBpbi1iYW5kIHNlY3JldHMuXG4gIHN0cmlwSW5CYW5kU2VjcmV0cyhjbG9uZSk7XG4gIHJldHVybiBjbG9uZSBhcyB1bmtub3duIGFzIFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQ7XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHNhbml0aXplL3NodWZmbGUudHMgXHUyMDE0IHNlcnZlLXRpbWUgZGV0ZXJtaW5pc3RpYyBzaHVmZmxlcyAoUzIsIFNhbml0aXplU3BlYylcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgcmVnaXN0cnkncyBgc2VydmVTaHVmZmxlZGAgbWFya3MgYXJyYXlzIHdob3NlIEFVVEhPUkVEIE9SREVSIGlzIHRoZVxuLy8gYW5zd2VyIGtleSAob3JkZXJpbmcuaXRlbXMpIFx1MjAxNCBhIHN0cmlwIGNhbid0IGhlbHAgd2hlbiB0aGUgb3JkZXIgaXRzZWxmIGlzXG4vLyB0aGUgc2VjcmV0LCBzbyB0aGUgc2VydmVyIHNlcnZlcyBhIHBlcm11dGF0aW9uLiBSZXF1aXJlbWVudHMgZnJvbSB0aGUgc3BlYzpcbi8vXG4vLyAgIC0gRGV0ZXJtaW5pc3RpYyBwZXIgKHZlcnNpb24sIHN0dWRlbnQpOiB0aGUgcmVhZCBBUEkgc2VlZHMgd2l0aFxuLy8gICAgIGAke3ZlcnNpb25faWR9OiR7dXNlcl9pZH1gLCBzbyBhIHJlbG9hZCAob3IgYW4gSFRUUC1jYWNoZSBtaXNzKSBzZXJ2ZXNcbi8vICAgICB0aGUgU0FNRSBvcmRlciBcdTIwMTQgdGhlIHN0dWRlbnQncyBzY3JlZW4gbmV2ZXIgcmVzaHVmZmxlcyB1bmRlciB0aGVtLlxuLy8gICAtIEFwcGxpZWQgYXQgU0VSVkUgdGltZSwgYWZ0ZXIgdGhlIHBlci12ZXJzaW9uIGNhY2hlOiB0aGUgY2FjaGVkIGFydGlmYWN0XG4vLyAgICAgaXMgc3R1ZGVudC1pbmRlcGVuZGVudCAodGhhdCdzIHdoYXQgbWFrZXMgaXQgY2FjaGVhYmxlKTsgdGhpcyB0cmFuc2Zvcm1cbi8vICAgICBpcyBjaGVhcCBlbm91Z2ggdG8gcnVuIHBlciByZXF1ZXN0LlxuLy8gICAtIFBlci1ibG9jayBzdWItc2VlZGluZzogdHdvIG9yZGVyaW5nIGJsb2NrcyBpbiBvbmUgYWN0aXZpdHkgZ2V0XG4vLyAgICAgaW5kZXBlbmRlbnQgcGVybXV0YXRpb25zIChibG9jayBpZCArIGZpZWxkIGpvaW4gdGhlIHNlZWQpLlxuLy9cbi8vIEdyYWRpbmcgaXMgb3JkZXItaW5kZXBlbmRlbnQgKHJlc3BvbnNlcyByZWZlcmVuY2UgaXRlbSBpZHMsIGFuZCB0aGUgc2VydmVyXG4vLyBncmFkZXMgYWdhaW5zdCB0aGUgYXV0aG9yZWQga2V5KSwgc28gdGhlIHBlcm11dGF0aW9uIGlzIHByZXNlbnRhdGlvbi1vbmx5IFx1MjAxNFxuLy8gYnV0IGl0cyBzdGFiaWxpdHkgaXMgYSBVWCBjb250cmFjdCwgbm90IGEgbmljZXR5LlxuLy9cbi8vIFRoZSBQUk5HIGlzIGEgc2VlZGVkIHhvcnNoaWZ0LXN0eWxlIGdlbmVyYXRvciAobXVsYmVycnkzMikgb3ZlciBhbiBGTlYtMWFcbi8vIHNlZWQgXHUyMDE0IGRldGVybWluaXN0aWMgYWNyb3NzIEpTIHJ1bnRpbWVzLCBkZXBlbmRlbmN5LWZyZWUuIE5vdCBjcnlwdG9ncmFwaGljLFxuLy8gZGVsaWJlcmF0ZWx5OiB0aGUgdGhyZWF0IG1vZGVsIGlzIFwiZG9uJ3Qgc2VydmUgdGhlIGF1dGhvcmVkIG9yZGVyLFwiIG5vdFxuLy8gXCJtYWtlIHRoZSBwZXJtdXRhdGlvbiB1bnByZWRpY3RhYmxlIHRvIGEgZGV0ZXJtaW5lZCBzdHVkZW50IHdpdGggYSBkZWJ1Z2dlclwiXG4vLyAodGhlIGFuc3dlciBrZXkgbmV2ZXIgbGVhdmVzIHRoZSBzZXJ2ZXIgZWl0aGVyIHdheSkuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyBibG9ja1JlZ2lzdHJ5IH0gZnJvbSAnLi4vcmVnaXN0cnkvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHR5cGUgeyBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50IH0gZnJvbSAnLi9zYW5pdGl6ZWQtdHlwZXMuanMnO1xuXG4vKiogRk5WLTFhIDMyLWJpdCBvdmVyIGEgc3RyaW5nIFx1MjE5MiB1aW50MzIgc2VlZC4gKi9cbmZ1bmN0aW9uIHNlZWRGcm9tKHRleHQ6IHN0cmluZyk6IG51bWJlciB7XG4gIGxldCBoYXNoID0gMHg4MTFjOWRjNTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0ZXh0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaGFzaCBePSB0ZXh0LmNoYXJDb2RlQXQoaSk7XG4gICAgaGFzaCA9IE1hdGguaW11bChoYXNoLCAweDAxMDAwMTkzKTtcbiAgfVxuICByZXR1cm4gaGFzaCA+Pj4gMDtcbn1cblxuLyoqIG11bGJlcnJ5MzIgXHUyMDE0IHRpbnkgZGV0ZXJtaW5pc3RpYyBQUk5HLCB1bmlmb3JtIGVub3VnaCBmb3IgYSBzaHVmZmxlLiAqL1xuZnVuY3Rpb24gbXVsYmVycnkzMihzZWVkOiBudW1iZXIpOiAoKSA9PiBudW1iZXIge1xuICBsZXQgYSA9IHNlZWQgPj4+IDA7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgYSA9IChhICsgMHg2ZDJiNzlmNSkgPj4+IDA7XG4gICAgbGV0IHQgPSBhO1xuICAgIHQgPSBNYXRoLmltdWwodCBeICh0ID4+PiAxNSksIHQgfCAxKTtcbiAgICB0IF49IHQgKyBNYXRoLmltdWwodCBeICh0ID4+PiA3KSwgdCB8IDYxKTtcbiAgICByZXR1cm4gKCh0IF4gKHQgPj4+IDE0KSkgPj4+IDApIC8gNDI5NDk2NzI5NjtcbiAgfTtcbn1cblxuLyoqXG4gKiBGaXNoZXJcdTIwMTNZYXRlcyB3aXRoIGEgc2VlZGVkIFBSTkcgKHB1cmUgXHUyMDE0IHJldHVybnMgYSBuZXcgYXJyYXkpLlxuICpcbiAqIE5FVkVSIFJFVFVSTlMgVEhFIElERU5USVRZIGZvciAyKyBpdGVtczsgaXQgcm90YXRlcyBieSBvbmUgaWYgdGhlIGRlYWwgbGFuZHNcbiAqIHRoZXJlLiBUaGlzIGlzIG5vdCB0aWRpbmVzcyBcdTIwMTQgaXQgaXMgdGhlIHdob2xlIHBvaW50IG9mIHNodWZmbGluZyB0aGVzZVxuICogZmllbGRzLiBUaGUgYXJyYXlzIHRoYXQgcmVhY2ggaGVyZSBhcmUgdGhlIG9uZXMgd2hvc2UgQVVUSE9SRUQgT1JERVIgSVMgVEhFXG4gKiBBTlNXRVIsIHNvIGFuIGlkZW50aXR5IGRlYWwgc2VydmVzIHRoZSBzdHVkZW50IGEgcHJlLXNvbHZlZCBxdWVzdGlvbi4gQSBmYWlyXG4gKiBzaHVmZmxlIGxhbmRzIG9uIGl0IDEvbiEgb2YgdGhlIHRpbWUsIHdoaWNoIHNvdW5kcyBuZWdsaWdpYmxlIHVudGlsIHlvdVxuICogbm90aWNlIHRoYXQgb3JkZXJpbmcgYmxvY2tzIGFyZSBhbGxvd2VkIGFzIGZldyBhcyB0d28gaXRlbXMgXHUyMDE0IG9uZSBjbGFzcyBpblxuICogdHdvLCBmb3IgdGhhdCBxdWVzdGlvbi4gVGhlIHJlbmRlcmVyIGhhcyBhbHdheXMgZ3VhcmFudGVlZCB0aGlzXG4gKiAocmVuZGVyZXIvc3JjL2Jsb2Nrcy9zaHVmZmxlLnRzKSBhbmQgdGhlIHZpZXdlciBtdXN0IG5vdCByZWdyZXNzIGl0IGF0XG4gKiBjdXRvdmVyLlxuICpcbiAqIFM0J3MgZ3JhZGluZyBrZWVwcyBpdHMgb3duIGRlZmVuc2l2ZSBndWFyZCBmb3IgdGhlIHNlcnZlZC1vcmRlci1lcXVhbHMtXG4gKiBhdXRob3JlZC1vcmRlciBjYXNlIChncmFkaW5nL2Nob2ljZXMudHMpIGFuZCBzaG91bGQga2VlcCBpdDogaXQgYWxzbyBjb3ZlcnNcbiAqIGRvY3VtZW50cyBzZXJ2ZWQgdW5zaHVmZmxlZCwgd2hpY2ggdGhpcyBjYW5ub3Qgc3BlYWsgZm9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VlZGVkU2h1ZmZsZTxUPihpdGVtczogcmVhZG9ubHkgVFtdLCBzZWVkS2V5OiBzdHJpbmcpOiBUW10ge1xuICBjb25zdCBvdXQgPSBbLi4uaXRlbXNdO1xuICBjb25zdCBuZXh0ID0gbXVsYmVycnkzMihzZWVkRnJvbShzZWVkS2V5KSk7XG4gIGZvciAobGV0IGkgPSBvdXQubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xuICAgIGNvbnN0IGogPSBNYXRoLmZsb29yKG5leHQoKSAqIChpICsgMSkpO1xuICAgIGNvbnN0IGEgPSBvdXRbaV0hO1xuICAgIG91dFtpXSA9IG91dFtqXSE7XG4gICAgb3V0W2pdID0gYTtcbiAgfVxuICBpZiAob3V0Lmxlbmd0aCA+IDEgJiYgb3V0LmV2ZXJ5KCh2YWx1ZSwgaSkgPT4gdmFsdWUgPT09IGl0ZW1zW2ldKSkge1xuICAgIG91dC5wdXNoKG91dC5zaGlmdCgpIGFzIFQpO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQXBwbHkgZXZlcnkgcmVnaXN0cnktZGVjbGFyZWQgYHNlcnZlU2h1ZmZsZWRgIHJlb3JkZXIgdG8gYSBTQU5JVElaRURcbiAqIGRvY3VtZW50IChwdXJlIFx1MjAxNCB0aGUgaW5wdXQsIHR5cGljYWxseSB0aGUgc2hhcmVkIGNhY2hlZCBhcnRpZmFjdCwgaXMgbm90XG4gKiBtdXRhdGVkKS4gYHNlZWRLZXlgIGlzIHRoZSBwZXItKHZlcnNpb24sIHN0dWRlbnQpIGlkZW50aXR5OyBlYWNoIHNodWZmbGVkXG4gKiBhcnJheSBpcyBzdWItc2VlZGVkIHdpdGggdGhlIGJsb2NrIGlkIGFuZCBmaWVsZCBuYW1lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlTZXJ2ZVNodWZmbGVzKFxuICBkb2M6IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQsXG4gIHNlZWRLZXk6IHN0cmluZyxcbik6IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQge1xuICBjb25zdCBjbG9uZSA9IHN0cnVjdHVyZWRDbG9uZShkb2MpIGFzIHVua25vd24gYXMge1xuICAgIHNlY3Rpb25zOiBBcnJheTx7XG4gICAgICByb3dzOiBBcnJheTx7IGNvbHVtbnM6IEFycmF5PHsgYmxvY2tzOiB1bmtub3duW10gfT4gfT47XG4gICAgfT47XG4gIH07XG5cbiAgY29uc3Qgc2h1ZmZsZUJsb2NrID0gKGJsb2NrOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHR5cGUgPSBibG9jay50eXBlO1xuICAgIGNvbnN0IGVudHJ5ID1cbiAgICAgIHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyAmJiB0eXBlIGluIGJsb2NrUmVnaXN0cnlcbiAgICAgICAgPyBibG9ja1JlZ2lzdHJ5W3R5cGUgYXMga2V5b2YgdHlwZW9mIGJsb2NrUmVnaXN0cnldXG4gICAgICAgIDogdW5kZWZpbmVkO1xuICAgIGlmICghZW50cnkpIHJldHVybjsgLy8gc2FuaXRpemUgYWxyZWFkeSBmYWlsZWQgY2xvc2VkIG9uIHVua25vd24gdHlwZXNcbiAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGVudHJ5LnNhbml0aXplLnNlcnZlU2h1ZmZsZWQgPz8gW10pIHtcbiAgICAgIGNvbnN0IGFyciA9IGJsb2NrW2ZpZWxkXTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgICAgYmxvY2tbZmllbGRdID0gc2VlZGVkU2h1ZmZsZShcbiAgICAgICAgICBhcnIsXG4gICAgICAgICAgYCR7c2VlZEtleX06JHtTdHJpbmcoYmxvY2suaWQgPz8gJycpfToke2ZpZWxkfWAsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFJlY3Vyc2Ugd2hlcmUgdGhlIHJlZ2lzdHJ5IGRlY2xhcmVzIG5lc3RlZCBibG9ja3MsIG1pcnJvcmluZyBzYW5pdGl6ZS5cbiAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGVudHJ5LnNhbml0aXplLmNoaWxkQmxvY2tzID8/IFtdKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IGJsb2NrW2ZpZWxkXTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgICAgICAgaWYgKGNoaWxkICE9PSBudWxsICYmIHR5cGVvZiBjaGlsZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHNodWZmbGVCbG9jayhjaGlsZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBjbG9uZS5zZWN0aW9ucykge1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHNlY3Rpb24ucm93cykge1xuICAgICAgZm9yIChjb25zdCBjb2x1bW4gb2Ygcm93LmNvbHVtbnMpIHtcbiAgICAgICAgZm9yIChjb25zdCBibG9jayBvZiBjb2x1bW4uYmxvY2tzKSB7XG4gICAgICAgICAgaWYgKGJsb2NrICE9PSBudWxsICYmIHR5cGVvZiBibG9jayA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHNodWZmbGVCbG9jayhibG9jayBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjbG9uZSBhcyB1bmtub3duIGFzIFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQ7XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGNvbnRhaW5lci9ibG9ja0luZGV4LnRzIFx1MjAxNCBzZXJ2ZWQgZG9jdW1lbnQgXHUyMTkyIHBlci1zZWN0aW9uIHJlc3BvbnNlIGlkcyAoUzMgVjQpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHN0b3JlIGlzIGRlbGliZXJhdGVseSBkb2N1bWVudC1zaGFwZS1hZ25vc3RpYyAoc3RvcmUudHMpOiBpdCBob2xkc1xuLy8gaWQta2V5ZWQgcmVzcG9uc2UgbWFwcyBhbmQgaXMgVE9MRCB3aGljaCBpZHMgYmVsb25nIHRvIGEgc2VjdGlvbiBhdCBjaGVja1xuLy8gdGltZS4gVGhpcyBtb2R1bGUgaXMgd2hhdCB0ZWxscyBpdCBcdTIwMTQgb25lIHdhbGsgb3ZlciB0aGUgU0VSVkVEIChzYW5pdGl6ZWQpXG4vLyBkb2N1bWVudCBwcm9kdWNpbmcsIHBlciBzZWN0aW9uLCB0aGUgaXRlbSBpZHMgaW4gZWFjaCB3aXJlIGNhdGVnb3J5LlxuLy9cbi8vIFR3byBkZXNpZ24gcG9pbnRzIHdvcnRoIGtlZXBpbmc6XG4vL1xuLy8gIDEuIElOLUJBTkQgSURTIENPTUUgRlJPTSBBIERFRVAgV0FMSywgbm90IGEgcGVyLXR5cGUgZmllbGQgbGlzdC4gQSBibGFua1xuLy8gICAgIHRva2VuIGxpdmVzIGluIGZpbGxfaW5fYmxhbmsuY29udGVudCwgYnV0IGFsc28gaW5zaWRlIGFcbi8vICAgICBmYWRlZF93b3JrZWRfZXhhbXBsZSdzIG5lc3RlZCBzdGVwczsgYSBwcm9tcHRlZCBtYXRoX2lubGluZSBtYXkgYXBwZWFyIGluXG4vLyAgICAgQU5ZIGNvbnRlbnQgYXJyYXkgKHRoZSBzY2hlbWEgYWRtaXRzIGl0LCB3aGljaCBpcyBleGFjdGx5IHdoeSB0aGUgUzJcbi8vICAgICBzYW5pdGl6ZXIgc3RyaXBzIGluLWJhbmQgc2VjcmV0cyB1bmNvbmRpdGlvbmFsbHkgcmF0aGVyIHRoYW4gYnlcbi8vICAgICBkZWNsYXJhdGlvbikuIE1pcnJvcmluZyB0aGF0IHBvc3R1cmUgaGVyZSBtZWFucyBhIG5ldyBibG9jayB0eXBlIHRoYXRcbi8vICAgICBlbWJlZHMgYmxhbmtzIGlzIHdpcmVkIGludG8gY2hlY2tpbmcgdGhlIGRheSBpdCByZW5kZXJzLCB3aXRoIG5vIHJlZ2lzdHJ5XG4vLyAgICAgZWRpdCBcdTIwMTQgdGhlIGZhaWx1cmUgbW9kZSB0aGlzIGF2b2lkcyBpcyBhIHN0dWRlbnQncyBhbnN3ZXIgc2lsZW50bHkgbmV2ZXJcbi8vICAgICByZWFjaGluZyB0aGUgZ3JhZGVyLlxuLy9cbi8vICAyLiBVTlNVUFBPUlRFRCBJUyBSRUNPUkRFRCwgTkVWRVIgRFJPUFBFRC4gV2lyZSB2MiAoVjkpIGdhdmUgdGhlIGdyYXBoXG4vLyAgICAgZmFtaWx5IGl0cyBgZ3JhcGhzYCBjYXRlZ29yeSwgc28gYHVuc3VwcG9ydGVkYCBpcyBlbXB0eSB0b2RheSBcdTIwMTQgYnV0IHRoZVxuLy8gICAgIG1lY2hhbmlzbSBzdGF5cy4gSXQgaXMgdGhlIGhvbmVzdCBhbnN3ZXIgd2hlbmV2ZXIgYSBncmFkYWJsZSBibG9jayBoYXNcbi8vICAgICBubyB3YXkgdG8gcmVhY2ggdGhlIGdyYWRlciAoYSBmdXR1cmUgYmxvY2sgdHlwZSBhaGVhZCBvZiBpdHMgd2lyZVxuLy8gICAgIGJ1bXApLiBBIHNpbGVudCBvbWlzc2lvbiB3b3VsZCByZWFkIGFzIFwiYWxsIGNoZWNrZWRcIiB3aGlsZSBhIHN0dWRlbnQnc1xuLy8gICAgIHdvcmsgd2VudCB1bmdyYWRlZCwgd2hpY2ggaXMgdGhlIGZhaWx1cmUgdGhpcyBleGlzdHMgdG8gcHJldmVudC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IGZhbWlseU9mIH0gZnJvbSAnLi4vcmVnaXN0cnkvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHR5cGUgeyBCbG9ja1R5cGUgfSBmcm9tICcuLi9yZWdpc3RyeS90eXBlcy5qcyc7XG5pbXBvcnQgdHlwZSB7XG4gIFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQsXG4gIFNhbml0aXplZEJsb2NrLFxufSBmcm9tICcuLi9zYW5pdGl6ZS9zYW5pdGl6ZWQtdHlwZXMuanMnO1xuaW1wb3J0IHR5cGUgeyBTZWN0aW9uSXRlbUlkcyB9IGZyb20gJy4uL3N0b3JlL3N0b3JlLmpzJztcblxuLyoqIEJsb2NrIHR5cGVzIHdob3NlIHJlc3BvbnNlcyBoYXZlIG5vIHdpcmUtdjEgY2F0ZWdvcnkgKHNlZSBkZXNpZ24gcG9pbnQgMikuICovXG5jb25zdCBHUkFQSF9GQU1JTFk6IFJlYWRvbmx5U2V0PHN0cmluZz4gPSBuZXcgU2V0KFtcbiAgJ2ludGVyYWN0aXZlX2dyYXBoJyxcbiAgJ251bWJlcl9saW5lJyxcbiAgJ2RhdGFfcGxvdCcsXG5dKTtcblxuZXhwb3J0IGludGVyZmFjZSBTZWN0aW9uSW5kZXgge1xuICBzZWN0aW9uSWQ6IHN0cmluZztcbiAgLyoqIElkcyB0byBzZW5kIHdoZW4gY2hlY2tpbmcgdGhpcyBzZWN0aW9uLiAqL1xuICBpdGVtczogU2VjdGlvbkl0ZW1JZHM7XG4gIC8qKiBCbG9jayBpZHMgcHJlc2VudCBpbiB0aGlzIHNlY3Rpb24sIGRvY3VtZW50IG9yZGVyIChjb250YWluZXJzIGluY2x1ZGVkKS4gKi9cbiAgYmxvY2tJZHM6IHN0cmluZ1tdO1xuICAvKiogR3JhZGFibGUgYmxvY2sgaWRzIHRoaXMgd2lyZSB2ZXJzaW9uIGNhbm5vdCBjYXJyeSBcdTIwMTQgc3VyZmFjZWQsIG5vdCBoaWRkZW4uICovXG4gIHVuc3VwcG9ydGVkOiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEb2N1bWVudEluZGV4IHtcbiAgc2VjdGlvbnM6IFNlY3Rpb25JbmRleFtdO1xuICBieVNlY3Rpb246IFJlY29yZDxzdHJpbmcsIFNlY3Rpb25JbmRleD47XG4gIC8qKiBFdmVyeSBncmFkYWJsZS1idXQtdW5jYXJyeWFibGUgYmxvY2sgaWQgYWNyb3NzIHRoZSBkb2N1bWVudC4gKi9cbiAgdW5zdXBwb3J0ZWQ6IHN0cmluZ1tdO1xufVxuXG4vKiogRGVlcC13YWxrIGFueSB2YWx1ZSBmb3IgaW4tYmFuZCByZXNwb25zZSBpZHM6IGJsYW5rIHRva2VucyBhbmQgbWF0aC1nYXBcbiAqIHByb21wdHMsIHdoZXJldmVyIHRoZXkgc2l0LiBEb2VzIE5PVCBkZXNjZW5kIGludG8gbmVzdGVkIEJsb2NrIGFycmF5cyBcdTIwMTRcbiAqIGNoaWxkIGJsb2NrcyBhcmUgdmlzaXRlZCBieSB0aGUgY2FsbGVyIHNvIHRoZWlyIG93biBpZHMgYXR0cmlidXRlIHRvIHRoZW0uICovXG5mdW5jdGlvbiBjb2xsZWN0SW5CYW5kSWRzKFxuICB2YWx1ZTogdW5rbm93bixcbiAgb3V0OiBzdHJpbmdbXSxcbiAgaXNDaGlsZEJsb2NrQXJyYXk6ICh2YWx1ZTogdW5rbm93bikgPT4gYm9vbGVhbixcbik6IHZvaWQge1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBpZiAoaXNDaGlsZEJsb2NrQXJyYXkodmFsdWUpKSByZXR1cm47XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHZhbHVlKSBjb2xsZWN0SW5CYW5kSWRzKGl0ZW0sIG91dCwgaXNDaGlsZEJsb2NrQXJyYXkpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JyB8fCB2YWx1ZSA9PT0gbnVsbCkgcmV0dXJuO1xuXG4gIGNvbnN0IG5vZGUgPSB2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgaWYgKG5vZGUudHlwZSA9PT0gJ2JsYW5rJyAmJiB0eXBlb2Ygbm9kZS5pZCA9PT0gJ3N0cmluZycpIHtcbiAgICBvdXQucHVzaChub2RlLmlkKTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gQSBNYXRoUHJvbXB0IGNhcnJpZXI6IGBsYXRleGAgKyBgcHJvbXB0c2AuIE1hdGNoZWQgU1RSVUNUVVJBTExZIHJhdGhlclxuICAvLyB0aGFuIGJ5IG5vZGUgdHlwZSBiZWNhdXNlIHRoZSBzYW1lIGNhcnJpZXIgc2hhcGUgaXMgYm90aCBhbiBpbmxpbmVcbiAgLy8gbWF0aF9pbmxpbmUgbm9kZSBhbmQgYSB0b3AtbGV2ZWwgbWF0aF9ibG9jayBcdTIwMTQgYW5kIHRoZSBzY2hlbWEgYWRtaXRzIGl0IGluXG4gIC8vIGVpdGhlciBwb3NpdGlvbiAodGhlIHJlYXNvbiB0aGUgUzIgc2FuaXRpemVyIHdhbGtzIHVuY29uZGl0aW9uYWxseSB0b28pLlxuICBpZiAodHlwZW9mIG5vZGUubGF0ZXggPT09ICdzdHJpbmcnICYmIEFycmF5LmlzQXJyYXkobm9kZS5wcm9tcHRzKSkge1xuICAgIGZvciAoY29uc3QgcHJvbXB0IG9mIG5vZGUucHJvbXB0cykge1xuICAgICAgY29uc3QgaWQgPSAocHJvbXB0IGFzIHsgaWQ/OiB1bmtub3duIH0gfCBudWxsKT8uaWQ7XG4gICAgICBpZiAodHlwZW9mIGlkID09PSAnc3RyaW5nJykgb3V0LnB1c2goaWQpO1xuICAgIH1cbiAgICAvLyBLZWVwIHdhbGtpbmcgc2libGluZ3M6IGEgbWF0aF9ibG9jayBhbHNvIGNhcnJpZXMgY29udGVudCBmaWVsZHMuXG4gIH1cbiAgZm9yIChjb25zdCBjaGlsZCBvZiBPYmplY3QudmFsdWVzKG5vZGUpKSB7XG4gICAgY29sbGVjdEluQmFuZElkcyhjaGlsZCwgb3V0LCBpc0NoaWxkQmxvY2tBcnJheSk7XG4gIH1cbn1cblxuLyoqIEEgdmFsdWUgaXMgYSBjaGlsZC1ibG9jayBhcnJheSBpZiBpdCBsb29rcyBsaWtlIEJsb2NrW10gKG9iamVjdHMgY2FycnlpbmcgYVxuICogYHR5cGVgIHRoZSByZWdpc3RyeSBrbm93cyBBTkQgYW4gYGlkYCkuIFN0cnVjdHVyYWwgcmF0aGVyIHRoYW5cbiAqIHJlZ2lzdHJ5LWRlY2xhcmVkIHNvIGEgY29udGFpbmVyIHRoYXQgZm9yZ2V0cyBpdHMgY2hpbGRCbG9ja3MgZGVjbGFyYXRpb25cbiAqIHN0aWxsIGNhbid0IGdldCBpdHMgY2hpbGRyZW4ncyBpZHMgbWlzLWF0dHJpYnV0ZWQuXG4gKlxuICogRXhwb3J0ZWQgYmVjYXVzZSB0aGUgYW5zd2VyLWtleSBleHRyYWN0aW9uLCB0aGUgY2Vuc3VzLCBBTkQgdGhlIGdyYWRpbmdcbiAqIHdhbGsgKHNpbmNlIEEyNCwgMjAyNi0wOC0wNiBcdTIwMTQgaXQgY2FycmllZCBhIHByaXZhdGUgY29weSBmb3IgYSBzbGljZVxuICogZ2VuZXJhdGlvbikgYWxsIGFuc3dlciB0aGUgc2FtZSBxdWVzdGlvbiAoXCJpcyB0aGlzIGEgbmVzdGVkIGJsb2NrLCBvclxuICogY29udGVudCBvZiB0aGlzIG9uZT9cIikuIFR3byBjb3BpZXMgb2YgYSBzdWJ0bGUgaGV1cmlzdGljIGRyaWZ0OyB0aGlzIG9uZVxuICogaXMgVEhFIHNvdXJjZSwgd2l0aCB6ZXJvIGNvcGllcyByZW1haW5pbmcuICovXG5leHBvcnQgZnVuY3Rpb24gbG9va3NMaWtlQmxvY2tBcnJheSh2YWx1ZTogdW5rbm93bik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIEFycmF5LmlzQXJyYXkodmFsdWUpICYmXG4gICAgdmFsdWUubGVuZ3RoID4gMCAmJlxuICAgIHZhbHVlLmV2ZXJ5KFxuICAgICAgKGl0ZW0pID0+XG4gICAgICAgIHR5cGVvZiBpdGVtID09PSAnb2JqZWN0JyAmJlxuICAgICAgICBpdGVtICE9PSBudWxsICYmXG4gICAgICAgIHR5cGVvZiAoaXRlbSBhcyB7IGlkPzogdW5rbm93biB9KS5pZCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgdHlwZW9mIChpdGVtIGFzIHsgdHlwZT86IHVua25vd24gfSkudHlwZSA9PT0gJ3N0cmluZycsXG4gICAgKSAmJlxuICAgIC8vIElubGluZSBub2RlcyBjYXJyeSBgdHlwZWAgYnV0IG5ldmVyIGBpZGAgKyBibG9jay1pc2ggc2hhcGUgdG9nZXRoZXI7XG4gICAgLy8gcmVxdWlyZSBhdCBsZWFzdCBvbmUga25vd24gY29udGFpbmVyLWlzaCBrZXkgdG8gYXZvaWQgZmFsc2UgcG9zaXRpdmVzLlxuICAgIHZhbHVlLmV2ZXJ5KChpdGVtKSA9PiB7XG4gICAgICBjb25zdCB0ID0gKGl0ZW0gYXMgeyB0eXBlOiBzdHJpbmcgfSkudHlwZTtcbiAgICAgIHJldHVybiB0ICE9PSAndGV4dCcgJiYgdCAhPT0gJ2JsYW5rJyAmJiB0ICE9PSAnbWF0aF9pbmxpbmUnICYmIHQgIT09ICdoYXJkX2JyZWFrJztcbiAgICB9KVxuICApO1xufVxuXG4vKiogTmVzdGVkIGJsb2NrcywgZm91bmQgc3RydWN0dXJhbGx5IChzZWUgbG9va3NMaWtlQmxvY2tBcnJheSkuIEdlbmVyaWMgb3ZlciB0aGVcbiAqIGJsb2NrIHNoYXBlIHNvIHRoZSBzZXJ2ZWQtZG9jdW1lbnQgd2FsayBoZXJlIGFuZCB0aGUgYXV0aG9yZWQtZG9jdW1lbnQgd2FsayBpblxuICogdGhlIGFuc3dlci1rZXkgZXh0cmFjdGlvbiBzaGFyZSBPTkUgZGVmaW5pdGlvbiBvZiBcImNoaWxkIGJsb2NrXCIuICovXG5leHBvcnQgZnVuY3Rpb24gY2hpbGRCbG9ja3NPZjxUIGV4dGVuZHMgb2JqZWN0PihibG9jazogVCk6IFRbXSB7XG4gIGNvbnN0IG91dDogVFtdID0gW107XG4gIGZvciAoY29uc3QgdmFsdWUgb2YgT2JqZWN0LnZhbHVlcyhibG9jayBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikpIHtcbiAgICBpZiAobG9va3NMaWtlQmxvY2tBcnJheSh2YWx1ZSkpIG91dC5wdXNoKC4uLih2YWx1ZSBhcyBUW10pKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiB2aXNpdChibG9jazogU2FuaXRpemVkQmxvY2ssIGluZGV4OiBTZWN0aW9uSW5kZXgpOiB2b2lkIHtcbiAgY29uc3QgdHlwZSA9IChibG9jayBhcyB7IHR5cGU6IHN0cmluZyB9KS50eXBlIGFzIEJsb2NrVHlwZTtcbiAgY29uc3QgaWQgPSAoYmxvY2sgYXMgeyBpZDogc3RyaW5nIH0pLmlkO1xuICBpbmRleC5ibG9ja0lkcy5wdXNoKGlkKTtcblxuICAvLyBJbi1iYW5kIGlkcyAoYmxhbmtzICsgbWF0aCBnYXBzKSBiZWxvbmcgdG8gVEhJUyBibG9jaywgYXQgYW55IGRlcHRoXG4gIC8vIHNob3J0IG9mIGEgbmVzdGVkIGJsb2NrLlxuICBjb25zdCBpbkJhbmQ6IHN0cmluZ1tdID0gW107XG4gIGNvbGxlY3RJbkJhbmRJZHMoYmxvY2ssIGluQmFuZCwgbG9va3NMaWtlQmxvY2tBcnJheSk7XG4gIGlmIChpbkJhbmQubGVuZ3RoID4gMCkge1xuICAgIGluZGV4Lml0ZW1zLmJsYW5rcyA9IFsuLi4oaW5kZXguaXRlbXMuYmxhbmtzID8/IFtdKSwgLi4uaW5CYW5kXTtcbiAgfVxuXG4gIC8vIFBlci1ibG9jay1pZCBjYXRlZ29yaWVzLiBmYW1pbHlPZiByZXNvbHZlcyBkaXNwbGF5LW1vZGUgaW5zdGFuY2VzIHRvXG4gIC8vICdzdGF0aWMnLCBzbyBhIGRpc3BsYXkgZ3JhcGggY29udHJpYnV0ZXMgbm90aGluZyBcdTIwMTQgY29ycmVjdCwgaXQgdGFrZXMgbm9cbiAgLy8gaW5wdXQuXG4gIGNvbnN0IGZhbWlseSA9IGZhbWlseU9mKGJsb2NrIGFzIG5ldmVyKTtcbiAgaWYgKGZhbWlseSAhPT0gJ3N0YXRpYycpIHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ211bHRpcGxlX2Nob2ljZSc6XG4gICAgICAgIGluZGV4Lml0ZW1zLmNob2ljZXMgPSBbLi4uKGluZGV4Lml0ZW1zLmNob2ljZXMgPz8gW10pLCBpZF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbWF0Y2hpbmcnOlxuICAgICAgICBpbmRleC5pdGVtcy5tYXRjaGVzID0gWy4uLihpbmRleC5pdGVtcy5tYXRjaGVzID8/IFtdKSwgaWRdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ29yZGVyaW5nJzpcbiAgICAgICAgaW5kZXguaXRlbXMub3JkZXJpbmdzID0gWy4uLihpbmRleC5pdGVtcy5vcmRlcmluZ3MgPz8gW10pLCBpZF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2VsZl9leHBsYW5hdGlvbic6XG4gICAgICBjYXNlICdzaG9ydF9hbnN3ZXInOlxuICAgICAgY2FzZSAnZXNzYXknOlxuICAgICAgICBpbmRleC5pdGVtcy5mcmVlVGV4dCA9IFsuLi4oaW5kZXguaXRlbXMuZnJlZVRleHQgPz8gW10pLCBpZF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gV2lyZSB2MiBjYXJyaWVzIGdlb21ldHJpYyB3b3JrIGZvciB0aGUgd2hvbGUgZ3JhcGggZmFtaWx5OyB0aGVcbiAgICAgICAgLy8gc2VydmVyIGRpc3BhdGNoZXMgb24gdGhlIHNlcnZlZCBpbnRlcmFjdGlvbiB0eXBlLlxuICAgICAgICBpZiAoR1JBUEhfRkFNSUxZLmhhcyh0eXBlKSkge1xuICAgICAgICAgIGluZGV4Lml0ZW1zLmdyYXBocyA9IFsuLi4oaW5kZXguaXRlbXMuZ3JhcGhzID8/IFtdKSwgaWRdO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRCbG9ja3NPZihibG9jaykpIHZpc2l0KGNoaWxkLCBpbmRleCk7XG59XG5cbi8qKiBJbmRleCBhIHNlcnZlZCBkb2N1bWVudDogcGVyLXNlY3Rpb24gY2hlY2sgcGF5bG9hZCBpZHMgKyB0aGUgdW5zdXBwb3J0ZWRcbiAqIHJvc3Rlci4gUHVyZTsgc2FmZSB0byByZWNvbXB1dGUgb24gZXZlcnkgcmVuZGVyICh0aGUgZG9jdW1lbnQgaXMgaW1tdXRhYmxlXG4gKiBwZXIgdmVyc2lvbikuICovXG5leHBvcnQgZnVuY3Rpb24gaW5kZXhEb2N1bWVudChkb2M6IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQpOiBEb2N1bWVudEluZGV4IHtcbiAgY29uc3Qgc2VjdGlvbnM6IFNlY3Rpb25JbmRleFtdID0gW107XG4gIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBkb2Muc2VjdGlvbnMpIHtcbiAgICBjb25zdCBpbmRleDogU2VjdGlvbkluZGV4ID0ge1xuICAgICAgc2VjdGlvbklkOiBzZWN0aW9uLmlkLFxuICAgICAgaXRlbXM6IHt9LFxuICAgICAgYmxvY2tJZHM6IFtdLFxuICAgICAgdW5zdXBwb3J0ZWQ6IFtdLFxuICAgIH07XG4gICAgZm9yIChjb25zdCByb3cgb2Ygc2VjdGlvbi5yb3dzKSB7XG4gICAgICBmb3IgKGNvbnN0IGNvbHVtbiBvZiByb3cuY29sdW1ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGJsb2NrIG9mIGNvbHVtbi5ibG9ja3MpIHZpc2l0KGJsb2NrLCBpbmRleCk7XG4gICAgICB9XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goaW5kZXgpO1xuICB9XG4gIHJldHVybiB7XG4gICAgc2VjdGlvbnMsXG4gICAgYnlTZWN0aW9uOiBPYmplY3QuZnJvbUVudHJpZXMoc2VjdGlvbnMubWFwKChzKSA9PiBbcy5zZWN0aW9uSWQsIHNdKSksXG4gICAgdW5zdXBwb3J0ZWQ6IHNlY3Rpb25zLmZsYXRNYXAoKHMpID0+IHMudW5zdXBwb3J0ZWQpLFxuICB9O1xufVxuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBncmFkaW5nL3dhbGsudHMgXHUyMDE0IHJhdyBkb2N1bWVudCBcdTIxOTIgdGhlIGdyYWRhYmxlIGludmVudG9yeSBvZiBvbmUgc2VjdGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzZXJ2ZXIncyBjb3VudGVycGFydCB0byB0aGUgdmlld2VyJ3MgY29udGFpbmVyL2Jsb2NrSW5kZXgudHMuIFNhbWUgd2Fsayxcbi8vIG9wcG9zaXRlIHNpZGUgb2YgdGhlIHdpcmU6IGJsb2NrSW5kZXggdGVsbHMgdGhlIENMSUVOVCB3aGljaCBpZHMgdG8gc2VuZCxcbi8vIHRoaXMgdGVsbHMgdGhlIFNFUlZFUiB3aGF0IGVhY2ggb2YgdGhvc2UgaWRzIGlzIHdvcnRoLiBUaGV5IG11c3QgYWdyZWUsIGFuZFxuLy8gdGhlIGdvbGRlbiBjb3JwdXMgcGx1cyB0aGUgY29uZm9ybWFuY2Ugc3VpdGUgYXJlIHdoYXQgaG9sZCB0aGVtIHRvZ2V0aGVyLlxuLy9cbi8vIFR3byBwcm9wZXJ0aWVzIGluaGVyaXRlZCBkZWxpYmVyYXRlbHkgZnJvbSBibG9ja0luZGV4OlxuLy9cbi8vICAxLiBJTi1CQU5EIElEUyBDT01FIEZST00gQSBERUVQIFdBTEssIG5vdCBhIHBlci10eXBlIGZpZWxkIGxpc3QuIEEgYmxhbmtcbi8vICAgICBsaXZlcyBpbiBmaWxsX2luX2JsYW5rLmNvbnRlbnQsIGJ1dCBhbHNvIGluc2lkZSBhIGZhZGVkX3dvcmtlZF9leGFtcGxlJ3Ncbi8vICAgICBuZXN0ZWQgc3RlcHMsIGFuZCBhIHByb21wdGVkIG1hdGhfaW5saW5lIG1heSBhcHBlYXIgaW4gQU5ZIGNvbnRlbnQgYXJyYXkuXG4vLyAgICAgV2Fsa2luZyB1bmNvbmRpdGlvbmFsbHkgbWVhbnMgYSBuZXcgYmxvY2sgdHlwZSB0aGF0IGVtYmVkcyBibGFua3MgaXNcbi8vICAgICBncmFkYWJsZSB0aGUgZGF5IGl0IHJlbmRlcnMsIHdpdGggbm8gcmVnaXN0cnkgZWRpdC4gVGhlIGZhaWx1cmUgdGhpc1xuLy8gICAgIGF2b2lkcyBpcyB0aGUgd29yc3Qga2luZDogYSBzdHVkZW50IGFuc3dlciB0aGF0IGlzIHN1Ym1pdHRlZCwgc3RvcmVkLCBhbmRcbi8vICAgICBuZXZlciBzY29yZWQuXG4vL1xuLy8gIDIuIENPTlRBSU5FUlMgQVRUUklCVVRFIFRPIFRIRSBDSElMRC4gQSBibGFuayBpbnNpZGUgYSBmYWRlZCBleGFtcGxlIGJlbG9uZ3Ncbi8vICAgICB0byB0aGF0IGV4YW1wbGUncyBzdGVwLCBub3QgdG8gdGhlIGNvbnRhaW5lciwgc28gaWRzIGxpbmUgdXAgd2l0aCB3aGF0XG4vLyAgICAgdGhlIGNsaWVudCBzZW50LlxuLy9cbi8vIFRoaXMgd2FsayByZWFkcyB0aGUgUkFXIGRvY3VtZW50LiBUaGF0IGlzIHdoYXQgbWFrZXMgYG9yZGVyaW5nYCBncmFkYWJsZSBhdFxuLy8gYWxsIChpdHMgYXV0aG9yZWQgaXRlbSBvcmRlciBJUyB0aGUga2V5KSBhbmQgd2hhdCBnaXZlcyB0aGUgZ3JhZGVyIHRoZSBhbnN3ZXJcbi8vIGtleXMsIGhpbnRzLCBhbmQgc29sdXRpb25zIHRoZSBzZXJ2ZWQgZG9jdW1lbnQgaGFkIHN0cmlwcGVkLlxuLy9cbi8vIE1BTEZPUk1FRC1ET0NVTUVOVCBQT1NUVVJFIChydWxlZCBCOC9EMTAsIDIwMjYtMDgtMDY7IGxhbmRlZCByZWQtZ3JlZW4pOlxuLy8gdGhlIHdhbGsgY2FycmllcyBhbiBJTlRFR1JJVFkgR0FURS4gVGhlIHJ1bGUgdGhhdCBkZWNpZGVzIGV2ZXJ5IGNoZWNrIGJlbG93OlxuLy8gYSBncmFkZXItcmVhZCBmaWVsZCB0aGF0IGlzIFBSRVNFTlQgd2l0aCBhIHNoYXBlIHRoZSBzY2hlbWEgY2Fubm90IGF1dGhvciBpc1xuLy8gc3RydWN0dXJhbGx5IGJyb2tlbiBcdTIxOTIgTWFsZm9ybWVkRG9jdW1lbnRFcnJvciAodGhlIGhhbmRsZXIgbWFwcyBpdCB0byB0aGVcbi8vIHdpcmUgY29kZSBgbWFsZm9ybWVkX2RvY3VtZW50YCwgdGhlIGNsaWVudCB0byBpdHMgb3duIG5vbi1yZXRyeWFibGUgY29weSkuXG4vLyBBIGZpZWxkIHRoYXQgaXMgQUJTRU5ULCBvciBhdXRob3JlZCBlbXB0eSwgZ3JhZGVzIGV4YWN0bHkgYXMgaXQgYWx3YXlzIGhhcyBcdTIwMTRcbi8vIGF1dGhvcmVkLWVtcHR5IGlzIGEgdGVhY2hlciBtaWQtZWRpdCwgbm90IGNvcnJ1cHRpb24sIGFuZCByZWZ1c2luZyBpdCB3b3VsZFxuLy8gYnJlYWsgbGVnaXRpbWF0ZSBkb2N1bWVudHMuIEJlZm9yZSB0aGUgZ2F0ZSwgZXZlcnkgZmllbGQgd2FzIHNpbGVudGx5XG4vLyBuYXJyb3dlZCwgc28gYSBicm9rZW4gYmxvY2sgcHJvZHVjZWQgYSBNQVJLIChncmFkZWQgYWdhaW5zdCBhIGNvZXJjZWQtZW1wdHlcbi8vIGtleSkgXHUyMDE0IGEgY29uZmlkZW50IHdyb25nIHZlcmRpY3Qgbm9ib2R5IGNvdWxkIHNlZSAoczQtYXVkaXQgbWlzc2VkLTkpO1xuLy8gc2VydmVyLWF1dGhvcml0YXRpdmUgZ3JhZGluZyBtYWtlcyB0aGF0IHdvcnNlIHRoYW4gYSB0eXBlZCBmYWlsdXJlLlxuLy9cbi8vIFR3byBkZWxpYmVyYXRlIHNjb3BlIGVkZ2VzOlxuLy8gICAqIFRoZSBncmFwaCBmYW1pbHkgaXMgTk9UIGdhdGVkIGhlcmUuIHNjb3JlR3JhcGhCbG9jayBkaXNwYXRjaGVzIG9uIHRoZVxuLy8gICAgIHNlcnZlZCBpbnRlcmFjdGlvbiBhbmQgUkVGVVNFUyB3b3JrIHRoYXQgZGlzYWdyZWVzIChudWxsIFx1MjE5MiBubyBtYXJrKSBcdTIwMTRcbi8vICAgICBpdCBhbHJlYWR5IGZhaWxzIHNhZmUgcmF0aGVyIHRoYW4gY29lcmNpbmcsIHdoaWNoIGlzIHRoZSBwcm9wZXJ0eSB0aGVcbi8vICAgICBnYXRlIGV4aXN0cyB0byBhZGQgZWxzZXdoZXJlLlxuLy8gICAqIE9uIHRvZGF5J3MgaGFuZGxlciBwYXRoIHRoZSB1cGdyYWRlIHN0ZXAncyBab2QgdmFsaWRhdGlvbiBtZWFucyBub1xuLy8gICAgIFNUT1JBQkxFIGRvY3VtZW50IHJlYWNoZXMgdGhpcyB3YWxrIGJyb2tlbiBcdTIwMTQgdGhlIGdhdGUgaXMgdGhlIGVuZ2luZSdzXG4vLyAgICAgb3duIGNvbnRyYWN0IChkZWZlbnNlIGluIGRlcHRoIGJlaGluZCB0aGUgaGFuZGxlcidzIGBhcyBuZXZlcmAgY2FzdCksXG4vLyAgICAgc28gc2FmZXR5IHN0b3BzIGRlcGVuZGluZyBvbiBldmVyeSBjYWxsZXIgdmFsaWRhdGluZyBmaXJzdC4gUzcncyByZWFsXG4vLyAgICAgbWFsZm9ybWVkIGNhc2UgKHNjaGVtYVZlcnNpb24tMSBkb2N1bWVudHMpIGlzIHJlZnVzZWQgdXBzdHJlYW0gYnkgdGhlXG4vLyAgICAgdXBncmFkZSBwYXRoIGl0c2VsZi5cbi8vXG4vLyBUaGUgY2Vuc3VzIChyZWFkIHBhdGgpIG9wdHMgT1VUIHZpYSBgeyBpbnRlZ3JpdHk6ICdjb2VyY2UnIH1gIFx1MjAxNCBhIGNlbnN1c2VkXG4vLyBtYWxmb3JtZWQgZG9jdW1lbnQgbWVyZWx5IG1pc2NvdW50cywgYW5kIHRoZSByZWFkIHBhdGgncyBydWxlZCBwb3N0dXJlIGlzXG4vLyB3aXRoaG9sZC1hbmQtc2VydmUsIG5vdCBmYWlsLiBHcmFkaW5nIGFsd2F5cyBydW5zIHRoZSBnYXRlLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHtcbiAgY2hpbGRCbG9ja3NPZixcbiAgbG9va3NMaWtlQmxvY2tBcnJheSxcbn0gZnJvbSAnLi4vLi4vY29udGFpbmVyL2Jsb2NrSW5kZXguanMnO1xuaW1wb3J0IHsgUFJPTVBUX0NBUlJJRVJfVFlQRVMgfSBmcm9tICcuLi8uLi9zYW5pdGl6ZS9wcm9tcHRDYXJyaWVycy5qcyc7XG5pbXBvcnQgdHlwZSB7IEJsYW5rS2V5IH0gZnJvbSAnLi9ibGFua3MuanMnO1xuaW1wb3J0IHR5cGUgeyBSYXdHcmFwaEJsb2NrIH0gZnJvbSAnLi9ncmFwaHMuanMnO1xuXG4vKiogTG9vc2VseS10eXBlZCByYXcgYmxvY2s6IHRoZSBzZXJ2ZXIgZGlzcGF0Y2hlcyBvbiBgdHlwZWAgc3RyaW5ncyBhbmQgcmVhZHNcbiAqIGZpZWxkcyB0aGUgc2FuaXRpemVkIHR5cGVzIGRlbGliZXJhdGVseSBkb24ndCBhZG1pdC4gKi9cbmV4cG9ydCB0eXBlIFJhd0Jsb2NrID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj4gJiB7IGlkPzogc3RyaW5nOyB0eXBlPzogc3RyaW5nIH07XG5cbi8qKiBTdHJ1Y3R1cmFsbHkgYnJva2VuIGRvY3VtZW50IChlbmctcmV2aWV3IEI4L0QxMCk6IGEgZ3JhZGVyLXJlYWQgZmllbGQgd2FzXG4gKiBwcmVzZW50IHdpdGggYSBzaGFwZSB0aGUgc2NoZW1hIGNhbm5vdCBhdXRob3IuIFRocm93biBpbnN0ZWFkIG9mIGdyYWRpbmcsXG4gKiBiZWNhdXNlIGEgc2lsZW50bHkgd3JvbmcgbWFyayBpcyB3b3JzZSB0aGFuIGEgdHlwZWQgZmFpbHVyZS4gVGhlIGhhbmRsZXJcbiAqIG1hcHMgdGhpcyB0byB0aGUgd2lyZSBjb2RlIGBtYWxmb3JtZWRfZG9jdW1lbnRgLiAqL1xuZXhwb3J0IGNsYXNzIE1hbGZvcm1lZERvY3VtZW50RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIHJlYWRvbmx5IHByb2JsZW1zOiBzdHJpbmdbXTtcbiAgY29uc3RydWN0b3IocHJvYmxlbXM6IHN0cmluZ1tdKSB7XG4gICAgc3VwZXIoYFN0cnVjdHVyYWxseSBicm9rZW4gZG9jdW1lbnQ6ICR7cHJvYmxlbXMuam9pbignOyAnKX1gKTtcbiAgICB0aGlzLm5hbWUgPSAnTWFsZm9ybWVkRG9jdW1lbnRFcnJvcic7XG4gICAgdGhpcy5wcm9ibGVtcyA9IHByb2JsZW1zO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgR3JhZGFibGVJbnZlbnRvcnkge1xuICAvKiogQmxhbmsgKyBtYXRoLWdhcCBrZXlzLCBpbiBkb2N1bWVudCBvcmRlciwgZ3JvdXBlZCBwZXIgb3duaW5nIGJsb2NrIHNvXG4gICAqIGludGVyY2hhbmdlYWJsZSBydW5zIGNhbiBiZSByZXNvbHZlZCB3aXRoaW4gdGhlaXIgYmxvY2suICovXG4gIGJsYW5rR3JvdXBzQnlCbG9jazogQXJyYXk8eyBibG9ja0lkOiBzdHJpbmc7IGtleXM6IEJsYW5rS2V5W10gfT47XG4gIG11bHRpcGxlQ2hvaWNlOiBBcnJheTx7XG4gICAgYmxvY2tJZDogc3RyaW5nO1xuICAgIGNvcnJlY3RJZHM6IHN0cmluZ1tdO1xuICAgIGNob2ljZXM6IEFycmF5PHsgaWQ6IHN0cmluZzsgZmVlZGJhY2s/OiB1bmtub3duW10gfT47XG4gIH0+O1xuICBtYXRjaGluZzogQXJyYXk8e1xuICAgIGJsb2NrSWQ6IHN0cmluZztcbiAgICBrZXk6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gICAgaXRlbUlkczogc3RyaW5nW107XG4gIH0+O1xuICBvcmRlcmluZzogQXJyYXk8eyBibG9ja0lkOiBzdHJpbmc7IGF1dGhvcmVkT3JkZXI6IHN0cmluZ1tdIH0+O1xuICBncmFwaHM6IEFycmF5PHsgYmxvY2tJZDogc3RyaW5nOyBibG9jazogUmF3R3JhcGhCbG9jayB9PjtcbiAgLyoqIEV2ZXJ5IGZyZWUtdGV4dCBibG9jayBpbiB0aGUgc2VjdGlvbiBcdTIwMTQgcmVjb3JkZWQsIG5ldmVyIGp1ZGdlZC4gKi9cbiAgZnJlZVRleHQ6IHN0cmluZ1tdO1xuICAvKiogYmxvY2tJZCBcdTIxOTIgYXV0aG9yZWQgc29sdXRpb24gY29udGVudCwgZm9yIEVWRVJZIGJsb2NrIGluIHRoZSBzZWN0aW9uIHRoYXRcbiAgICogaGFzIG9uZS4gSW5jbHVkZXMgU1RBVElDIGJsb2NrcyAoYSBgcHJvYmxlbWAncyB3b3JrZWQgZXhwbGFuYXRpb24pLCB3aGljaFxuICAgKiBpcyB0aGUgd2hvbGUgcmVhc29uIHRoaXMgaXMgY29sbGVjdGVkIGJ5IHdhbGtpbmcgYmxvY2tzIHJhdGhlciB0aGFuIGJ5XG4gICAqIHdhbGtpbmcgdGhlIGJsb2NrcyB0aGF0IHByb2R1Y2VkIHJlc3BvbnNlcy4gKi9cbiAgc29sdXRpb25zOiBBcnJheTx7IGJsb2NrSWQ6IHN0cmluZzsgc29sdXRpb246IHVua25vd25bXSB9Pjtcbn1cblxuLy8gRXhwb3J0ZWQgZm9yIHRoZSByb3N0ZXItYm9uZCB0ZXN0IE9OTFkgKHJvc3RlckJvbmRzLnRlc3QudHMpIFx1MjAxNCB0aGVzZSB0d29cbi8vIFNldHMgcmVzdGF0ZSByZWdpc3RyeSBmYWN0cyAoZmFtaWx5ICdyZWNvcmRlZCc7IGRlcml2ZVF1ZXN0aW9uU2hhcGUpIHRoYXRcbi8vIHRoaXMgbW9kdWxlIGRlbGliZXJhdGVseSBkb2VzIG5vdCBpbXBvcnQgdGhlIHJlZ2lzdHJ5IHRvIGRlcml2ZSwgYW5kIGFcbi8vIGhhbmQtbGlzdCB0aGF0IHJlc3RhdGVzIGEgcmVnaXN0cnkgZmFjdCBpcyBhIGNsYWltIHRoYXQgbmVlZHMgYSBndWFyZCAoQTcsXG4vLyBwb2xpY3kgUDEwYikuIFByb2R1Y3Rpb24gY29kZSBtdXN0IGtlZXAgY29uc3VtaW5nIHRoZW0gZnJvbSBoZXJlLlxuZXhwb3J0IGNvbnN0IEZSRUVfVEVYVF9UWVBFUyA9IG5ldyBTZXQoW1xuICAnc2VsZl9leHBsYW5hdGlvbicsXG4gICdzaG9ydF9hbnN3ZXInLFxuICAnZXNzYXknLFxuXSk7XG5leHBvcnQgY29uc3QgR1JBUEhfVFlQRVMgPSBuZXcgU2V0KFtcbiAgJ2ludGVyYWN0aXZlX2dyYXBoJyxcbiAgJ251bWJlcl9saW5lJyxcbiAgJ2RhdGFfcGxvdCcsXG5dKTtcblxuLyoqIFByb2plY3QgYSByYXcgQmxhbmtUb2tlbiBvbnRvIHRoZSBncmFkaW5nIGtleSBzaGFwZS4gKi9cbmZ1bmN0aW9uIGJsYW5rVG9rZW5Ub0tleShub2RlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IEJsYW5rS2V5IHtcbiAgY29uc3QgYW5zd2VyID0gdHlwZW9mIG5vZGUuYW5zd2VyID09PSAnc3RyaW5nJyA/IG5vZGUuYW5zd2VyIDogJyc7XG4gIGNvbnN0IGFjY2VwdGFibGUgPSBBcnJheS5pc0FycmF5KG5vZGUuYWNjZXB0YWJsZUFuc3dlcnMpXG4gICAgPyAobm9kZS5hY2NlcHRhYmxlQW5zd2VycyBhcyB1bmtub3duW10pLmZpbHRlcihcbiAgICAgICAgKGEpOiBhIGlzIHN0cmluZyA9PiB0eXBlb2YgYSA9PT0gJ3N0cmluZycsXG4gICAgICApXG4gICAgOiBbXTtcbiAgY29uc3QgYW5zd2VyVHlwZSA9IG5vZGUuYW5zd2VyVHlwZTtcbiAgcmV0dXJuIHtcbiAgICBpZDogU3RyaW5nKG5vZGUuaWQgPz8gJycpLFxuICAgIC8vIGBhbnN3ZXJgIGZpcnN0LCB0aGVuIHRoZSBhbHRlcm5hdGVzIFx1MjAxNCBvbmUgbGlzdCwgbWF0Y2hpbmcgaG93IHRoZVxuICAgIC8vIHJlbmRlcmVyIGpvaW5zIHRoZW0gaW50byBkYXRhLWJsYW5rLWFuc3dlcnMuXG4gICAgYW5zd2VyczogW2Fuc3dlciwgLi4uYWNjZXB0YWJsZV0sXG4gICAgYW5zd2VyVHlwZTpcbiAgICAgIGFuc3dlclR5cGUgPT09ICdudW1lcmljJyB8fCBhbnN3ZXJUeXBlID09PSAnbWF0aCcgPyBhbnN3ZXJUeXBlIDogJ3RleHQnLFxuICAgIHRvbGVyYW5jZTogdHlwZW9mIG5vZGUudG9sZXJhbmNlID09PSAnbnVtYmVyJyA/IG5vZGUudG9sZXJhbmNlIDogMCxcbiAgICBlcXVpdmFsZW5jZTogbm9kZS5lcXVpdmFsZW5jZSA9PT0gJ2V4YWN0LWZvcm0nID8gJ2V4YWN0LWZvcm0nIDogJ3ZhbHVlJyxcbiAgICBtaXN0YWtlRmVlZGJhY2s6IEFycmF5LmlzQXJyYXkobm9kZS5taXN0YWtlRmVlZGJhY2spXG4gICAgICA/IChub2RlLm1pc3Rha2VGZWVkYmFjayBhcyBBcnJheTx7IG1hdGNoOiBzdHJpbmc7IGZlZWRiYWNrOiB1bmtub3duW10gfT4pXG4gICAgICA6IFtdLFxuICAgIGhpbnQ6IEFycmF5LmlzQXJyYXkobm9kZS5oaW50KSA/IChub2RlLmhpbnQgYXMgdW5rbm93bltdKSA6IHVuZGVmaW5lZCxcbiAgICBpbnRlcmNoYW5nZWFibGVXaXRoUHJldmlvdXM6IG5vZGUuaW50ZXJjaGFuZ2VhYmxlV2l0aFByZXZpb3VzID09PSB0cnVlLFxuICB9O1xufVxuXG4vKiogUHJvamVjdCBhIHJhdyBNYXRoUHJvbXB0IG9udG8gdGhlIHNhbWUgc2hhcGUuIEEgZ2FwIGlzIEFMV0FZUyBncmFkZWQgYXMgYVxuICogbWF0aCBleHByZXNzaW9uIGFuZCBuZXZlciBjYXJyaWVzIGhpbnQvbWlzdGFrZUZlZWRiYWNrIFx1MjAxNCBhbmQgaXRzIGlkIGlzIG5vdCBhXG4gKiB1dWlkLCBidXQgaXQga2V5cyBpbnRvIHRoZSBzYW1lIGBibGFua3NgIHJlc3BvbnNlIG1hcC4gKi9cbmZ1bmN0aW9uIG1hdGhQcm9tcHRUb0tleShub2RlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IEJsYW5rS2V5IHtcbiAgY29uc3QgYW5zd2VyID0gdHlwZW9mIG5vZGUuYW5zd2VyID09PSAnc3RyaW5nJyA/IG5vZGUuYW5zd2VyIDogJyc7XG4gIGNvbnN0IGFjY2VwdGFibGUgPSBBcnJheS5pc0FycmF5KG5vZGUuYWNjZXB0YWJsZUFuc3dlcnMpXG4gICAgPyAobm9kZS5hY2NlcHRhYmxlQW5zd2VycyBhcyB1bmtub3duW10pLmZpbHRlcihcbiAgICAgICAgKGEpOiBhIGlzIHN0cmluZyA9PiB0eXBlb2YgYSA9PT0gJ3N0cmluZycsXG4gICAgICApXG4gICAgOiBbXTtcbiAgcmV0dXJuIHtcbiAgICBpZDogU3RyaW5nKG5vZGUuaWQgPz8gJycpLFxuICAgIGFuc3dlcnM6IFthbnN3ZXIsIC4uLmFjY2VwdGFibGVdLFxuICAgIGFuc3dlclR5cGU6ICdtYXRoJyxcbiAgICB0b2xlcmFuY2U6IHR5cGVvZiBub2RlLnRvbGVyYW5jZSA9PT0gJ251bWJlcicgPyBub2RlLnRvbGVyYW5jZSA6IDAsXG4gICAgZXF1aXZhbGVuY2U6IG5vZGUuZXF1aXZhbGVuY2UgPT09ICdleGFjdC1mb3JtJyA/ICdleGFjdC1mb3JtJyA6ICd2YWx1ZScsXG4gICAgbWlzdGFrZUZlZWRiYWNrOiBbXSxcbiAgICBoaW50OiB1bmRlZmluZWQsXG4gICAgLy8gQSBnYXAgbmV2ZXIgam9pbnMgYW4gaW50ZXJjaGFuZ2VhYmxlIHJ1bjogdGhlIGZsYWcgaXMgYSBCbGFua1Rva2VuIGZpZWxkLlxuICAgIGludGVyY2hhbmdlYWJsZVdpdGhQcmV2aW91czogZmFsc2UsXG4gIH07XG59XG5cbi8vIFBST01QVF9DQVJSSUVSX1RZUEVTIGlzIGltcG9ydGVkIGZyb20gc2FuaXRpemUvcHJvbXB0Q2FycmllcnMudHMgXHUyMDE0IHRoZSBPTkVcbi8vIGRlY2xhcmF0aW9uIGJvdGggdGhlIHNhbml0aXplcidzIGRlZXAgc3RyaXAgYW5kIHRoaXMgd2FsayBjb25zdW1lIChBNykuXG5cbi8vIC0tLS0gVGhlIGludGVncml0eSBnYXRlIChCOC9EMTApIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFYWNoIGhlbHBlciBiZWxvdyBBUFBFTkRTIHByb2JsZW1zIGFuZCBuZXZlciBjaGFuZ2VzIHdoYXQgaXMgY29sbGVjdGVkIFx1MjAxNCBpblxuLy8gJ2NvZXJjZScgbW9kZSB0aGUgaW52ZW50b3J5IG11c3Qgc3RheSBieXRlLWlkZW50aWNhbCB0byB0aGUgcHJlLWdhdGUgd2Fsayxcbi8vIGFuZCBpbiAndGhyb3cnIG1vZGUgdGhlIGNvbGxlY3RlZCBpbnZlbnRvcnkgaXMgZGlzY2FyZGVkIGFueXdheS4gRXZlcnlcbi8vIG1lc3NhZ2UgbGVhZHMgd2l0aCB0aGUgb3duaW5nIGJsb2NrIGlkOiB0aGUgZXJyb3IncyBwcm9ibGVtcyBsaXN0IGlzIHdoYXRcbi8vIHR1cm5zIFwiY2hlY2tpbmcgaXMgYnJva2VuXCIgaW50byBhIGZpbmRhYmxlIGRlZmVjdCBpbiBhbiBlZGdlIGxvZy5cblxuLyoqIFRoZSBhbnN3ZXJUeXBlIC8gZXF1aXZhbGVuY2Ugdm9jYWJ1bGFyaWVzIHRoZSBwcm9qZWN0aW9ucyBjb2VyY2UgdG93YXJkLlxuICogQSB2YWx1ZSBPVVRTSURFIHRoZW0gaXMgYSBzaGFwZSB0aGUgc2NoZW1hIGNhbm5vdCBhdXRob3IgXHUyMDE0IGNvZXJjaW5nIGl0XG4gKiBzaWxlbnRseSBjaGFuZ2VzIGdyYWRpbmcgc2VtYW50aWNzIChlLmcuIGEgbWF0aCBhbnN3ZXIgZ3JhZGVkIGJ5dGUtd2lzZSkuICovXG5jb25zdCBBTlNXRVJfVFlQRVMgPSBuZXcgU2V0KFsndGV4dCcsICdudW1lcmljJywgJ21hdGgnXSk7XG5jb25zdCBFUVVJVkFMRU5DRVMgPSBuZXcgU2V0KFsndmFsdWUnLCAnZXhhY3QtZm9ybSddKTtcblxuLyoqIHByZXNlbnQtd2l0aC10aGUtd3Jvbmctc2hhcGUsIHRoZSBydWxlJ3Mgb25lIHByZWRpY2F0ZTogYWJzZW50IGlzIGFsd2F5c1xuICogZmluZSAoYXV0aG9yZWQtZW1wdHkpLCBhIGJhZCBzaGFwZSBuZXZlciBpcy4gKi9cbmZ1bmN0aW9uIGJhZCh2YWx1ZTogdW5rbm93biwgb2s6ICh2OiB1bmtub3duKSA9PiBib29sZWFuKTogYm9vbGVhbiB7XG4gIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmICFvayh2YWx1ZSk7XG59XG5cbmNvbnN0IGlzU3RyaW5nID0gKHY6IHVua25vd24pID0+IHR5cGVvZiB2ID09PSAnc3RyaW5nJztcbmNvbnN0IGlzTnVtYmVyID0gKHY6IHVua25vd24pID0+IHR5cGVvZiB2ID09PSAnbnVtYmVyJztcbmNvbnN0IGlzQm9vbGVhbiA9ICh2OiB1bmtub3duKSA9PiB0eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nO1xuY29uc3QgaXNBcnJheVYgPSAodjogdW5rbm93bikgPT4gQXJyYXkuaXNBcnJheSh2KTtcbmNvbnN0IGlzUGxhaW5PYmplY3QgPSAodjogdW5rbm93bikgPT5cbiAgdiAhPT0gbnVsbCAmJiB0eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkodik7XG5cbi8qKiBNYXRjaGluZy9vcmRlcmluZyBpdGVtIGVudHJpZXM6IGBTdHJpbmcoaS5pZClgIG1pbnRlZCAndW5kZWZpbmVkJy1zdHlsZVxuICogaWRzIHRoZSBjbGllbnQgY291bGQgbmV2ZXIgc2VuZCBiYWNrLiBBbiBlbnRyeSB0aGF0IGV4aXN0cyBidXQgbGFja3MgaXRzXG4gKiBpZGVudGl0eSBpcyBicm9rZW4sIG5vdCBhdXRob3JlZC1lbXB0eSBcdTIwMTQgYW4gRU1QVFkgaXRlbXMgYXJyYXkgaXMgdGhlXG4gKiBhdXRob3JlZC1lbXB0eSBmb3JtIGFuZCBzdGF5cyBmaW5lLiAqL1xuZnVuY3Rpb24gY2hlY2tJdGVtSWRzKFxuICBpdGVtczogQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+LFxuICBibG9ja0lkOiBzdHJpbmcsXG4gIHByb2JsZW1zOiBzdHJpbmdbXSxcbik6IHZvaWQge1xuICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcbiAgICBpZiAoIWlzUGxhaW5PYmplY3QoaXRlbSkpIHtcbiAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7YmxvY2tJZH06IGFuIGl0ZW0gZW50cnkgdGhhdCBpcyBub3QgYW4gb2JqZWN0YCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaXRlbS5pZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7YmxvY2tJZH06IGFuIGl0ZW0gd2l0aG91dCBhIHN0cmluZyBpZGApO1xuICAgIH1cbiAgfVxufVxuXG4vKiogVGhlIGZpZWxkcyBibGFua1Rva2VuVG9LZXkgLyBtYXRoUHJvbXB0VG9LZXkgbmFycm93LCBjaGVja2VkIGluc3RlYWQgb2ZcbiAqIGNvZXJjZWQuIGBmb3JQcm9tcHRgIHNraXBzIHRoZSB0aHJlZSBCbGFua1Rva2VuLW9ubHkgZmllbGRzLiAqL1xuZnVuY3Rpb24gY2hlY2tLZXlGaWVsZHMoXG4gIG5vZGU6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuICB3aGVyZTogc3RyaW5nLFxuICBwcm9ibGVtczogc3RyaW5nW10sXG4gIGZvclByb21wdDogYm9vbGVhbixcbik6IHZvaWQge1xuICBpZiAoYmFkKG5vZGUuYW5zd2VyLCBpc1N0cmluZykpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogYW5zd2VyIGlzIG5vdCBhIHN0cmluZ2ApO1xuICB9XG4gIGlmIChiYWQobm9kZS5hY2NlcHRhYmxlQW5zd2VycywgaXNBcnJheVYpKSB7XG4gICAgcHJvYmxlbXMucHVzaChgJHt3aGVyZX06IGFjY2VwdGFibGVBbnN3ZXJzIGlzIG5vdCBhbiBhcnJheWApO1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkobm9kZS5hY2NlcHRhYmxlQW5zd2VycykpIHtcbiAgICAvLyBUaGUgcHJvamVjdGlvbiBGSUxURVJTIG5vbi1zdHJpbmcgZW50cmllcyBcdTIwMTQgYW4gYXV0aG9yZWQgYWx0ZXJuYXRlIHRoYXRcbiAgICAvLyBzaWxlbnRseSB2YW5pc2hlcyBtYXJrcyBhIGNvcnJlY3Qgc3R1ZGVudCB3cm9uZy5cbiAgICBpZiAoIW5vZGUuYWNjZXB0YWJsZUFuc3dlcnMuZXZlcnkoaXNTdHJpbmcpKSB7XG4gICAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogYWNjZXB0YWJsZUFuc3dlcnMgaGFzIGEgbm9uLXN0cmluZyBlbnRyeWApO1xuICAgIH1cbiAgfVxuICBpZiAoYmFkKG5vZGUuYW5zd2VyVHlwZSwgKHYpID0+IEFOU1dFUl9UWVBFUy5oYXModiBhcyBzdHJpbmcpKSkge1xuICAgIHByb2JsZW1zLnB1c2goYCR7d2hlcmV9OiBhbnN3ZXJUeXBlIGlzIG91dHNpZGUgdGhlIHZvY2FidWxhcnlgKTtcbiAgfVxuICBpZiAoYmFkKG5vZGUudG9sZXJhbmNlLCBpc051bWJlcikpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogdG9sZXJhbmNlIGlzIG5vdCBhIG51bWJlcmApO1xuICB9XG4gIGlmIChiYWQobm9kZS5lcXVpdmFsZW5jZSwgKHYpID0+IEVRVUlWQUxFTkNFUy5oYXModiBhcyBzdHJpbmcpKSkge1xuICAgIHByb2JsZW1zLnB1c2goYCR7d2hlcmV9OiBlcXVpdmFsZW5jZSBpcyBvdXRzaWRlIHRoZSB2b2NhYnVsYXJ5YCk7XG4gIH1cbiAgaWYgKGZvclByb21wdCkgcmV0dXJuO1xuICBpZiAoYmFkKG5vZGUubWlzdGFrZUZlZWRiYWNrLCBpc0FycmF5VikpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogbWlzdGFrZUZlZWRiYWNrIGlzIG5vdCBhbiBhcnJheWApO1xuICB9XG4gIGlmIChiYWQobm9kZS5oaW50LCBpc0FycmF5VikpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogaGludCBpcyBub3QgYW4gYXJyYXlgKTtcbiAgfVxuICBpZiAoYmFkKG5vZGUuaW50ZXJjaGFuZ2VhYmxlV2l0aFByZXZpb3VzLCBpc0Jvb2xlYW4pKSB7XG4gICAgLy8gYD09PSB0cnVlYCBuYXJyb3dpbmcgd291bGQgc2lsZW50bHkgZGVncmFkZSB0aGUgZ3JvdXAgdG8gcG9zaXRpb25hbFxuICAgIC8vIGdyYWRpbmcgXHUyMDE0IGEgc3dhcHBlZC1idXQtY29ycmVjdCBwYWlyIG1hcmtlZCB3cm9uZy5cbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogaW50ZXJjaGFuZ2VhYmxlV2l0aFByZXZpb3VzIGlzIG5vdCBhIGJvb2xlYW5gKTtcbiAgfVxufVxuXG4vKiogQ29sbGVjdCBpbi1iYW5kIGtleXMgKGJsYW5rcyArIG1hdGggZ2FwcykgYmVsb25naW5nIHRvIFRISVMgYmxvY2ssIGF0IGFueVxuICogZGVwdGggc2hvcnQgb2YgYSBuZXN0ZWQgY2hpbGQgYmxvY2suICovXG5mdW5jdGlvbiBjb2xsZWN0SW5CYW5kS2V5cyhcbiAgdmFsdWU6IHVua25vd24sXG4gIG91dDogQmxhbmtLZXlbXSxcbiAgaXNDaGlsZEJsb2NrQXJyYXk6ICh2YWx1ZTogdW5rbm93bikgPT4gYm9vbGVhbixcbiAgYmxvY2tJZDogc3RyaW5nLFxuICBwcm9ibGVtczogc3RyaW5nW10sXG4pOiB2b2lkIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgaWYgKGlzQ2hpbGRCbG9ja0FycmF5KHZhbHVlKSkgcmV0dXJuO1xuICAgIGZvciAoY29uc3QgaXRlbSBvZiB2YWx1ZSkge1xuICAgICAgY29sbGVjdEluQmFuZEtleXMoaXRlbSwgb3V0LCBpc0NoaWxkQmxvY2tBcnJheSwgYmxvY2tJZCwgcHJvYmxlbXMpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHJldHVybjtcbiAgY29uc3Qgbm9kZSA9IHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIGlmIChub2RlLnR5cGUgPT09ICdibGFuaycgJiYgdHlwZW9mIG5vZGUuaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgLy8gTm90IGV2ZW4gcmVjb2duaXplZCBhcyBhIGJsYW5rIFx1MjAxNCB0aGUgdHlwZWQgYW5zd2VyIHdvdWxkIHZhbmlzaC4gVGhlIGlkXG4gICAgLy8gaXMgdGhlIHRva2VuJ3MgaWRlbnRpdHksIHNvIGFuIGVudHJ5IHdpdGhvdXQgb25lIGlzIGJyb2tlbiwgbm90XG4gICAgLy8gYXV0aG9yZWQtZW1wdHkuIEZhbGxzIHRocm91Z2ggdG8gdGhlIGNoaWxkIHdhbGsgZXhhY3RseSBhcyB0aGVcbiAgICAvLyBwcmUtZ2F0ZSBjb2RlIGRpZCwgc28gJ2NvZXJjZScgbW9kZSBzdGF5cyBieXRlLWlkZW50aWNhbC5cbiAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2Jsb2NrSWR9OiBhIGJsYW5rIHRva2VuIHdpdGhvdXQgYSBzdHJpbmcgaWRgKTtcbiAgfVxuICBpZiAobm9kZS50eXBlID09PSAnYmxhbmsnICYmIHR5cGVvZiBub2RlLmlkID09PSAnc3RyaW5nJykge1xuICAgIGNoZWNrS2V5RmllbGRzKG5vZGUsIGBibG9jayAke2Jsb2NrSWR9OiBibGFuayAke25vZGUuaWR9YCwgcHJvYmxlbXMsIGZhbHNlKTtcbiAgICBvdXQucHVzaChibGFua1Rva2VuVG9LZXkobm9kZSkpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodHlwZW9mIG5vZGUudHlwZSA9PT0gJ3N0cmluZycgJiYgUFJPTVBUX0NBUlJJRVJfVFlQRVMuaGFzKG5vZGUudHlwZSkpIHtcbiAgICBpZiAoYmFkKG5vZGUucHJvbXB0cywgaXNBcnJheVYpKSB7XG4gICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2Jsb2NrSWR9OiBwcm9tcHRzIGlzIG5vdCBhbiBhcnJheWApO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShub2RlLnByb21wdHMpKSB7XG4gICAgICBmb3IgKGNvbnN0IHByb21wdCBvZiBub2RlLnByb21wdHMpIHtcbiAgICAgICAgaWYgKHByb21wdCA9PT0gbnVsbCB8fCB0eXBlb2YgcHJvbXB0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7YmxvY2tJZH06IGEgcHJvbXB0IGVudHJ5IHRoYXQgaXMgbm90IGFuIG9iamVjdGApO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHAgPSBwcm9tcHQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIGlmICh0eXBlb2YgcC5pZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2Jsb2NrSWR9OiBhIHByb21wdCB3aXRob3V0IGEgc3RyaW5nIGlkYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hlY2tLZXlGaWVsZHMocCwgYGJsb2NrICR7YmxvY2tJZH06IHByb21wdCAke3AuaWR9YCwgcHJvYmxlbXMsIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIG91dC5wdXNoKG1hdGhQcm9tcHRUb0tleShwKSk7XG4gICAgICB9XG4gICAgICAvLyBLZWVwIHdhbGtpbmcgc2libGluZ3M6IGEgbWF0aF9ibG9jayBjYXJyaWVzIGNvbnRlbnQgZmllbGRzIHRvby5cbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBjaGlsZCBvZiBPYmplY3QudmFsdWVzKG5vZGUpKSB7XG4gICAgY29sbGVjdEluQmFuZEtleXMoY2hpbGQsIG91dCwgaXNDaGlsZEJsb2NrQXJyYXksIGJsb2NrSWQsIHByb2JsZW1zKTtcbiAgfVxufVxuXG4vLyBsb29rc0xpa2VCbG9ja0FycmF5IC8gY2hpbGRCbG9ja3NPZiBhcmUgSU1QT1JURUQgZnJvbSBjb250YWluZXIvYmxvY2tJbmRleCBcdTIwMTRcbi8vIHRoaXMgZmlsZSBjYXJyaWVkIGEgcHJpdmF0ZSwgbG9naWNhbGx5LWlkZW50aWNhbCBjb3B5IG9mIHRoZSBzdWJ0bGVcbi8vIGhldXJpc3RpYyB1bnRpbCAyMDI2LTA4LTA2IChBMjQpLCBoZWRnZWQgXCJtaXJyb3JpbmcgYmxvY2tJbmRleCdzXCIgd2hpbGUgdGhlXG4vLyBzb3VyY2UgZmlsZSBjbGFpbWVkIFwidGhpcyBvbmUgaXMgdGhlIHNvdXJjZVwiOiB0aGUgY29weSB0aGF0IHdvdWxkIHNpbGVudGx5XG4vLyBkcmlmdCwgYW5kIGRyaWZ0ZWQgYXR0cmlidXRpb24gbWlzLWdyYWRlcyBpbnZpc2libHkuIFNhbWUgcGFja2FnZSwgYW5kIHRoZVxuLy8gY2Vuc3VzIGFscmVhZHkgaW1wb3J0cyBjaGlsZEJsb2Nrc09mIHNlcnZlci1zaWRlLCBzbyB0aGUgYnVuZGxlIGJvdW5kYXJ5XG4vLyB3YXMgcHJvdmVuIGJlZm9yZSB0aGlzIGpvaW5lZCBpdC5cblxuZnVuY3Rpb24gdmlzaXQoXG4gIGJsb2NrOiBSYXdCbG9jayxcbiAgaW52OiBHcmFkYWJsZUludmVudG9yeSxcbiAgcHJvYmxlbXM6IHN0cmluZ1tdLFxuKTogdm9pZCB7XG4gIGNvbnN0IGlkID0gdHlwZW9mIGJsb2NrLmlkID09PSAnc3RyaW5nJyA/IGJsb2NrLmlkIDogJyc7XG4gIGNvbnN0IHR5cGUgPSB0eXBlb2YgYmxvY2sudHlwZSA9PT0gJ3N0cmluZycgPyBibG9jay50eXBlIDogJyc7XG4gIGlmIChiYWQoYmxvY2suaWQsIGlzU3RyaW5nKSkge1xuICAgIC8vIFNraXBwZWQgZW50aXJlbHkgYnkgdGhlIHByZS1nYXRlIHdhbGs6IHRoZSBzdHVkZW50J3MgYW5zd2VyIGZvciBpdCB3YXNcbiAgICAvLyBzdWJtaXR0ZWQsIHN0b3JlZCwgYW5kIG5ldmVyIHNjb3JlZCBcdTIwMTQgdGhlIGV4YWN0IGZhaWx1cmUgdGhlIGRlZXAgd2Fsa1xuICAgIC8vIGV4aXN0cyB0byBwcmV2ZW50LlxuICAgIHByb2JsZW1zLnB1c2goYGEgYmxvY2sgd2hvc2UgaWQgaXMgbm90IGEgc3RyaW5nICgke0pTT04uc3RyaW5naWZ5KGJsb2NrLmlkKX0pYCk7XG4gIH1cbiAgaWYgKGJhZChibG9jay50eXBlLCBpc1N0cmluZykpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkIHx8ICc8bm8gaWQ+J306IHR5cGUgaXMgbm90IGEgc3RyaW5nYCk7XG4gIH1cbiAgaWYgKGJhZChibG9jay5zb2x1dGlvbiwgaXNBcnJheVYpKSB7XG4gICAgLy8gU2lsZW50bHkgZHJvcHBlZCBiZWZvcmU6IHRoZSBzZWN0aW9uIHNheXMgXCJjaGVja2VkXCIgYnV0IHRoZSB3b3JrZWRcbiAgICAvLyBleHBsYW5hdGlvbiBuZXZlciB1bmxvY2tzIFx1MjAxNCBhIGNvbnRlbnQgYnVnIGZyb20gdGhlIHN0dWRlbnQncyBzZWF0LlxuICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWQgfHwgJzxubyBpZD4nfTogc29sdXRpb24gaXMgbm90IGFuIGFycmF5YCk7XG4gIH1cbiAgaWYgKCFpZCkgcmV0dXJuO1xuXG4gIC8vIFNvbHV0aW9ucyBhcmUgY29sbGVjdGVkIGZvciBFVkVSWSBibG9jayB0aGF0IGhhcyBvbmUsIGluY2x1ZGluZyBzdGF0aWNzLlxuICAvLyBBIGdyYWRlciB0aGF0IHdhbGtlZCBvbmx5IHJlc3BvbmRpbmcgYmxvY2tzIHdvdWxkIG5ldmVyIHVubG9jayBhXG4gIC8vIGBwcm9ibGVtYCdzIHdvcmtlZCBzb2x1dGlvbiwgYW5kIHRvIGEgc3R1ZGVudCB0aGF0IHJlYWRzIGFzIGEgY29udGVudCBidWdcbiAgLy8gKHRoZSBzZWN0aW9uIHNheXMgXCJjaGVja2VkXCIgYnV0IG9uZSBib3ggc3RheXMgc2h1dCkuXG4gIGlmIChBcnJheS5pc0FycmF5KGJsb2NrLnNvbHV0aW9uKSAmJiBibG9jay5zb2x1dGlvbi5sZW5ndGggPiAwKSB7XG4gICAgaW52LnNvbHV0aW9ucy5wdXNoKHsgYmxvY2tJZDogaWQsIHNvbHV0aW9uOiBibG9jay5zb2x1dGlvbiBhcyB1bmtub3duW10gfSk7XG4gIH1cblxuICBjb25zdCBpbkJhbmQ6IEJsYW5rS2V5W10gPSBbXTtcbiAgY29sbGVjdEluQmFuZEtleXMoYmxvY2ssIGluQmFuZCwgbG9va3NMaWtlQmxvY2tBcnJheSwgaWQsIHByb2JsZW1zKTtcbiAgaWYgKGluQmFuZC5sZW5ndGggPiAwKSB7XG4gICAgaW52LmJsYW5rR3JvdXBzQnlCbG9jay5wdXNoKHsgYmxvY2tJZDogaWQsIGtleXM6IGluQmFuZCB9KTtcbiAgfVxuXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ211bHRpcGxlX2Nob2ljZSc6IHtcbiAgICAgIGlmIChiYWQoYmxvY2suY2hvaWNlcywgaXNBcnJheVYpKSB7XG4gICAgICAgIC8vIENvZXJjZWQgdG8gW10gYmVmb3JlOiB0aGUgc2VsZWN0aW9uIGdyYWRlZCBhZ2FpbnN0IGFuIEVNUFRZIGtleSBhbmRcbiAgICAgICAgLy8gdGhlIHN0dWRlbnQgd2FzIG1hcmtlZCB3cm9uZyB3aXRoIGNvbmZpZGVuY2UuXG4gICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBjaG9pY2VzIGlzIG5vdCBhbiBhcnJheWApO1xuICAgICAgfVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYmxvY2suY2hvaWNlcykpIHtcbiAgICAgICAgZm9yIChjb25zdCBjIG9mIGJsb2NrLmNob2ljZXMpIHtcbiAgICAgICAgICBpZiAoIWlzUGxhaW5PYmplY3QoYykpIHtcbiAgICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBhIGNob2ljZSBlbnRyeSB0aGF0IGlzIG5vdCBhbiBvYmplY3RgKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBjaG9pY2UgPSBjIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICAgIGlmICh0eXBlb2YgY2hvaWNlLmlkICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgLy8gU3RyaW5nKGMuaWQpIG1pbnRlZCBpZHMgdGhlIHNlcnZlZCBwYWdlIG5ldmVyIHJlbmRlcmVkLlxuICAgICAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGEgY2hvaWNlIHdpdGhvdXQgYSBzdHJpbmcgaWRgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGJhZChjaG9pY2UuY29ycmVjdCwgaXNCb29sZWFuKSkge1xuICAgICAgICAgICAgLy8gYD09PSB0cnVlYCBuYXJyb3dpbmcgc2lsZW50bHkgZW1wdGllZCB0aGUga2V5LlxuICAgICAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGEgY2hvaWNlIHdob3NlIGNvcnJlY3QgZmxhZyBpcyBub3QgYSBib29sZWFuYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChiYWQoY2hvaWNlLmZlZWRiYWNrLCBpc0FycmF5VikpIHtcbiAgICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBhIGNob2ljZSB3aG9zZSBmZWVkYmFjayBpcyBub3QgYW4gYXJyYXlgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGNob2ljZXMgPSBBcnJheS5pc0FycmF5KGJsb2NrLmNob2ljZXMpXG4gICAgICAgID8gKGJsb2NrLmNob2ljZXMgYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KVxuICAgICAgICA6IFtdO1xuICAgICAgaW52Lm11bHRpcGxlQ2hvaWNlLnB1c2goe1xuICAgICAgICBibG9ja0lkOiBpZCxcbiAgICAgICAgY29ycmVjdElkczogY2hvaWNlc1xuICAgICAgICAgIC5maWx0ZXIoKGMpID0+IGMuY29ycmVjdCA9PT0gdHJ1ZSlcbiAgICAgICAgICAubWFwKChjKSA9PiBTdHJpbmcoYy5pZCkpLFxuICAgICAgICBjaG9pY2VzOiBjaG9pY2VzLm1hcCgoYykgPT4gKHtcbiAgICAgICAgICBpZDogU3RyaW5nKGMuaWQpLFxuICAgICAgICAgIC4uLihBcnJheS5pc0FycmF5KGMuZmVlZGJhY2spXG4gICAgICAgICAgICA/IHsgZmVlZGJhY2s6IGMuZmVlZGJhY2sgYXMgdW5rbm93bltdIH1cbiAgICAgICAgICAgIDoge30pLFxuICAgICAgICB9KSksXG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjYXNlICdtYXRjaGluZyc6IHtcbiAgICAgIGlmIChiYWQoYmxvY2suaXRlbXMsIGlzQXJyYXlWKSkge1xuICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkfTogaXRlbXMgaXMgbm90IGFuIGFycmF5YCk7XG4gICAgICB9XG4gICAgICBpZiAoYmFkKGJsb2NrLmtleSwgaXNQbGFpbk9iamVjdCkpIHtcbiAgICAgICAgLy8gVGhlIGJhcmUgY2FzdCBwYXNzZWQgYW55dGhpbmcgdGhyb3VnaDogbG9va3VwcyBvbiBhIGJyb2tlbiBrZXlcbiAgICAgICAgLy8gcmV0dXJuIHVuZGVmaW5lZCBhbmQgZXZlcnkgcGxhY2VkIHBhaXIgaXMgd3JvbmcuXG4gICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBrZXkgaXMgbm90IGFuIG9iamVjdGApO1xuICAgICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KGJsb2NrLmtleSkpIHtcbiAgICAgICAgaWYgKCFPYmplY3QudmFsdWVzKGJsb2NrLmtleSBhcyBvYmplY3QpLmV2ZXJ5KGlzU3RyaW5nKSkge1xuICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBrZXkgaGFzIGEgbm9uLXN0cmluZyB0YXJnZXRgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgaXRlbXMgPSBBcnJheS5pc0FycmF5KGJsb2NrLml0ZW1zKVxuICAgICAgICA/IChibG9jay5pdGVtcyBhcyBBcnJheTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4pXG4gICAgICAgIDogW107XG4gICAgICBjaGVja0l0ZW1JZHMoaXRlbXMsIGlkLCBwcm9ibGVtcyk7XG4gICAgICBpbnYubWF0Y2hpbmcucHVzaCh7XG4gICAgICAgIGJsb2NrSWQ6IGlkLFxuICAgICAgICBrZXk6IChibG9jay5rZXkgYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPikgPz8ge30sXG4gICAgICAgIGl0ZW1JZHM6IGl0ZW1zLm1hcCgoaSkgPT4gU3RyaW5nKGkuaWQpKSxcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgJ29yZGVyaW5nJzoge1xuICAgICAgaWYgKGJhZChibG9jay5pdGVtcywgaXNBcnJheVYpKSB7XG4gICAgICAgIC8vIGF1dGhvcmVkT3JkZXIgY29lcmNlZCB0byBbXSBiZWZvcmU6IGEgZGVsaWJlcmF0ZSBhcnJhbmdlbWVudCBncmFkZWRcbiAgICAgICAgLy8gYWdhaW5zdCBhbiBlbXB0eSBrZXkgYW5kIHdhcyBtYXJrZWQgd3JvbmcuXG4gICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBpdGVtcyBpcyBub3QgYW4gYXJyYXlgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGl0ZW1zID0gQXJyYXkuaXNBcnJheShibG9jay5pdGVtcylcbiAgICAgICAgPyAoYmxvY2suaXRlbXMgYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KVxuICAgICAgICA6IFtdO1xuICAgICAgY2hlY2tJdGVtSWRzKGl0ZW1zLCBpZCwgcHJvYmxlbXMpO1xuICAgICAgLy8gVGhlIGF1dGhvcmVkIG9yZGVyIElTIHRoZSBrZXkgXHUyMDE0IGF2YWlsYWJsZSBvbmx5IGJlY2F1c2UgdGhpcyB3YWxrcyB0aGVcbiAgICAgIC8vIHJhdyBkb2N1bWVudCByYXRoZXIgdGhhbiB0aGUgc2VydmVkIG9uZS5cbiAgICAgIGludi5vcmRlcmluZy5wdXNoKHsgYmxvY2tJZDogaWQsIGF1dGhvcmVkT3JkZXI6IGl0ZW1zLm1hcCgoaSkgPT4gU3RyaW5nKGkuaWQpKSB9KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjYXNlICd0YWJsZSc6IHtcbiAgICAgIC8vIEEgdGFibGUgY29udHJpYnV0ZXMgTk8gcGVyLXR5cGUgaW52ZW50b3J5OiBpdHMgZ3JhZGFibGUgY29udGVudCBpc1xuICAgICAgLy8gYmxhbmsgdG9rZW5zLCBhbHJlYWR5IGNvbGxlY3RlZCAoYW5kIGdhdGVkKSBieSB0aGUgaW4tYmFuZCB3YWxrIGFib3ZlLFxuICAgICAgLy8gd2hlcmV2ZXIgaW4gdGhlIGNlbGxzIHRoZXkgc2l0LiBUaGF0IGlzIHRoZSB3aG9sZSBkZXNpZ24uXG4gICAgICAvL1xuICAgICAgLy8gV2hhdCB0aGF0IHdhbGsgY2Fubm90IHNlZSBpcyBhIFNLRUxFVE9OIHByZXNlbnQgd2l0aCB0aGUgd3Jvbmcgc2hhcGUuXG4gICAgICAvLyBgcm93czogJ25vcGUnYCwgb3IgYSBgY2VsbHNgIG9iamVjdCwgc2ltcGx5IHlpZWxkcyBubyBrZXlzIFx1MjAxNCBzbyB0aGVcbiAgICAgIC8vIHNlY3Rpb24gXCJjaGVja3NcIiBzdWNjZXNzZnVsbHkgd2hpbGUgdGhlIHN0dWRlbnQncyB0YWJsZSBhbnN3ZXJzIGdvXG4gICAgICAvLyB1bnNjb3JlZCBhbmQgdW5yZXBvcnRlZC4gVGhhdCBpcyB0aGUgc2FtZSB3b3JzdC1jYXNlIHRoZSBzZWN0aW9uLWxldmVsXG4gICAgICAvLyByb3dzIGNoZWNrIGd1YXJkcyBhZ2FpbnN0LCBvbmUgbGV2ZWwgZG93biwgYW5kIHRoZSByZWFzb24gdGhpcyBjYXNlXG4gICAgICAvLyBleGlzdHMgYXQgYWxsIGRlc3BpdGUgYWRkaW5nIG5vdGhpbmcgdG8gdGhlIGludmVudG9yeS5cbiAgICAgIGlmIChiYWQoYmxvY2sucm93cywgaXNBcnJheVYpKSB7XG4gICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiByb3dzIGlzIG5vdCBhbiBhcnJheWApO1xuICAgICAgfVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYmxvY2sucm93cykpIHtcbiAgICAgICAgZm9yIChjb25zdCByb3cgb2YgYmxvY2sucm93cykge1xuICAgICAgICAgIGlmICghaXNQbGFpbk9iamVjdChyb3cpKSB7XG4gICAgICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkfTogYSByb3cgdGhhdCBpcyBub3QgYW4gb2JqZWN0YCk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgY2VsbHMgPSAocm93IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KS5jZWxscztcbiAgICAgICAgICBpZiAoYmFkKGNlbGxzLCBpc0FycmF5VikpIHtcbiAgICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBhIHJvdyB3aG9zZSBjZWxscyBpcyBub3QgYW4gYXJyYXlgKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2YgQXJyYXkuaXNBcnJheShjZWxscykgPyBjZWxscyA6IFtdKSB7XG4gICAgICAgICAgICBpZiAoIWlzUGxhaW5PYmplY3QoY2VsbCkpIHtcbiAgICAgICAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGEgY2VsbCB0aGF0IGlzIG5vdCBhbiBvYmplY3RgKTtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYmFkKChjZWxsIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KS5jb250ZW50LCBpc0FycmF5VikpIHtcbiAgICAgICAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGEgY2VsbCB3aG9zZSBjb250ZW50IGlzIG5vdCBhbiBhcnJheWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgZGVmYXVsdDpcbiAgICAgIGlmIChGUkVFX1RFWFRfVFlQRVMuaGFzKHR5cGUpKSB7XG4gICAgICAgIGludi5mcmVlVGV4dC5wdXNoKGlkKTtcbiAgICAgIH0gZWxzZSBpZiAoR1JBUEhfVFlQRVMuaGFzKHR5cGUpKSB7XG4gICAgICAgIGludi5ncmFwaHMucHVzaCh7IGJsb2NrSWQ6IGlkLCBibG9jazogYmxvY2sgYXMgdW5rbm93biBhcyBSYXdHcmFwaEJsb2NrIH0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cblxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkQmxvY2tzT2YoYmxvY2spKSB2aXNpdChjaGlsZCwgaW52LCBwcm9ibGVtcyk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmF3U2VjdGlvbiB7XG4gIGlkPzogc3RyaW5nO1xuICByb3dzPzogQXJyYXk8eyBjb2x1bW5zPzogQXJyYXk8eyBibG9ja3M/OiBSYXdCbG9ja1tdIH0+IH0+O1xufVxuXG4vKiogRmluZCBhIHNlY3Rpb24gYnkgaWQgaW4gdGhlIHJhdyBkb2N1bWVudC4gUmV0dXJucyBudWxsIHdoZW4gYWJzZW50IFx1MjAxNCB0aGVcbiAqIGhhbmRsZXIgdHVybnMgdGhhdCBpbnRvIGEgNDAwIHJhdGhlciB0aGFuIGdyYWRpbmcgbm90aGluZyBhbmQgcmVwb3J0aW5nXG4gKiBzdWNjZXNzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRTZWN0aW9uKFxuICBkb2M6IHsgc2VjdGlvbnM/OiBSYXdTZWN0aW9uW10gfSxcbiAgc2VjdGlvbklkOiBzdHJpbmcsXG4pOiBSYXdTZWN0aW9uIHwgbnVsbCB7XG4gIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBkb2Muc2VjdGlvbnMgPz8gW10pIHtcbiAgICBpZiAoc2VjdGlvbi5pZCA9PT0gc2VjdGlvbklkKSByZXR1cm4gc2VjdGlvbjtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXYWxrT3B0aW9ucyB7XG4gIC8qKlxuICAgKiAndGhyb3cnIChkZWZhdWx0KTogdGhlIEI4L0QxMCBpbnRlZ3JpdHkgZ2F0ZSBcdTIwMTQgYSBzdHJ1Y3R1cmFsbHkgYnJva2VuXG4gICAqIGRvY3VtZW50IHJhaXNlcyBNYWxmb3JtZWREb2N1bWVudEVycm9yIGluc3RlYWQgb2YgZ3JhZGluZy4gVGhlIGRlZmF1bHQgb25cbiAgICogcHVycG9zZTogYSBuZXcgY2FsbGVyIGdldHMgdGhlIGdhdGUgdW5sZXNzIGl0IGFyZ3VlcyBpdHMgd2F5IG91dC5cbiAgICpcbiAgICogJ2NvZXJjZSc6IHRoZSBwcmUtZ2F0ZSBkZWZlbnNpdmUgbmFycm93aW5nLCBieXRlLWlkZW50aWNhbCBpbnZlbnRvcnkuXG4gICAqIFJlc2VydmVkIGZvciB0aGUgUkVBRCBwYXRoIChjZW5zdXMpLCB3aG9zZSBydWxlZCBmYWlsdXJlIHBvc3R1cmUgaXNcbiAgICogd2l0aGhvbGQtYW5kLXNlcnZlIFx1MjAxNCBhIGNlbnN1c2VkIG1hbGZvcm1lZCBkb2N1bWVudCBtZXJlbHkgbWlzY291bnRzLFxuICAgKiB3aGVyZSBhIGdyYWRlZCBvbmUgbWludHMgYSB3cm9uZyBtYXJrLlxuICAgKi9cbiAgaW50ZWdyaXR5PzogJ3Rocm93JyB8ICdjb2VyY2UnO1xufVxuXG4vKiogQnVpbGQgdGhlIGdyYWRhYmxlIGludmVudG9yeSBmb3Igb25lIHNlY3Rpb24gb2YgdGhlIFJBVyBkb2N1bWVudC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlbnRvcnlTZWN0aW9uKFxuICBzZWN0aW9uOiBSYXdTZWN0aW9uLFxuICBvcHRpb25zOiBXYWxrT3B0aW9ucyA9IHt9LFxuKTogR3JhZGFibGVJbnZlbnRvcnkge1xuICBjb25zdCBpbnY6IEdyYWRhYmxlSW52ZW50b3J5ID0ge1xuICAgIGJsYW5rR3JvdXBzQnlCbG9jazogW10sXG4gICAgbXVsdGlwbGVDaG9pY2U6IFtdLFxuICAgIG1hdGNoaW5nOiBbXSxcbiAgICBvcmRlcmluZzogW10sXG4gICAgZ3JhcGhzOiBbXSxcbiAgICBmcmVlVGV4dDogW10sXG4gICAgc29sdXRpb25zOiBbXSxcbiAgfTtcbiAgY29uc3QgcHJvYmxlbXM6IHN0cmluZ1tdID0gW107XG4gIC8vIFRoZSBza2VsZXRvbiBydW5zIHRoZSBzYW1lIHByZXNlbnQtdnMtYWJzZW50IHJ1bGUgYXMgdGhlIGJsb2Nrczogcm93c1xuICAvLyBjb2VyY2VkIHRvIFtdIGlzIHRoZSB3b3JzdCBzaWxlbnQgb3V0Y29tZSBvZiBhbGwgXHUyMDE0IHRoZSB3aG9sZSBzZWN0aW9uXG4gIC8vIFwiY2hlY2tzXCIgc3VjY2Vzc2Z1bGx5IHdpdGggemVybyBpdGVtcy5cbiAgY29uc3QgcmF3ID0gc2VjdGlvbiBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgaWYgKGJhZChyYXcucm93cywgaXNBcnJheVYpKSB7XG4gICAgcHJvYmxlbXMucHVzaCgnc2VjdGlvbjogcm93cyBpcyBub3QgYW4gYXJyYXknKTtcbiAgfVxuICBmb3IgKGNvbnN0IHJvdyBvZiBBcnJheS5pc0FycmF5KHJhdy5yb3dzKSA/IChzZWN0aW9uLnJvd3MgPz8gW10pIDogW10pIHtcbiAgICBpZiAoIWlzUGxhaW5PYmplY3Qocm93KSkge1xuICAgICAgcHJvYmxlbXMucHVzaCgnc2VjdGlvbjogYSByb3cgdGhhdCBpcyBub3QgYW4gb2JqZWN0Jyk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGJhZChyb3cuY29sdW1ucywgaXNBcnJheVYpKSB7XG4gICAgICBwcm9ibGVtcy5wdXNoKCdzZWN0aW9uOiBhIHJvdyB3aG9zZSBjb2x1bW5zIGlzIG5vdCBhbiBhcnJheScpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGNvbHVtbiBvZiBBcnJheS5pc0FycmF5KHJvdy5jb2x1bW5zKSA/IHJvdy5jb2x1bW5zIDogW10pIHtcbiAgICAgIGlmICghaXNQbGFpbk9iamVjdChjb2x1bW4pKSB7XG4gICAgICAgIHByb2JsZW1zLnB1c2goJ3NlY3Rpb246IGEgY29sdW1uIHRoYXQgaXMgbm90IGFuIG9iamVjdCcpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmIChiYWQoY29sdW1uLmJsb2NrcywgaXNBcnJheVYpKSB7XG4gICAgICAgIHByb2JsZW1zLnB1c2goJ3NlY3Rpb246IGEgY29sdW1uIHdob3NlIGJsb2NrcyBpcyBub3QgYW4gYXJyYXknKTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgQXJyYXkuaXNBcnJheShjb2x1bW4uYmxvY2tzKSA/IGNvbHVtbi5ibG9ja3MgOiBbXSkge1xuICAgICAgICBpZiAoIWlzUGxhaW5PYmplY3QoYmxvY2spKSB7XG4gICAgICAgICAgcHJvYmxlbXMucHVzaCgnc2VjdGlvbjogYSBibG9ja3MgZW50cnkgdGhhdCBpcyBub3QgYW4gb2JqZWN0Jyk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdmlzaXQoYmxvY2ssIGludiwgcHJvYmxlbXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAocHJvYmxlbXMubGVuZ3RoID4gMCAmJiBvcHRpb25zLmludGVncml0eSAhPT0gJ2NvZXJjZScpIHtcbiAgICB0aHJvdyBuZXcgTWFsZm9ybWVkRG9jdW1lbnRFcnJvcihwcm9ibGVtcyk7XG4gIH1cbiAgcmV0dXJuIGludjtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gY2Vuc3VzL2NlbnN1cy50cyBcdTIwMTQgYSBwdWJsaXNoZWQgdmVyc2lvbidzIGJsb2NrIGNlbnN1cyArIGl0ZW0gYXR0cmlidXRpb24gKFM3KVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFAzQSdzIFwicHVibGlzaC10aW1lIHJlZ2lzdHJ5IGNlbnN1c1wiLCBidWlsdCB0aGUgd2F5IFMyIG1hZGUgcG9zc2libGU6IHRoZVxuLy8gY2Vuc3VzIGlzIERFUklWRUQgZnJvbSB0aGUgc3RvcmVkIHZlcnNpb24gc25hcHNob3QsIG5ldmVyIHdyaXR0ZW4gYnlcbi8vIHB1Ymxpc2gtYWN0aXZpdHkuIEV2ZXJ5IHB1Ymxpc2hlZCB2ZXJzaW9uJ3MgZG9jdW1lbnQgYWxyZWFkeSBsaXZlcyBpblxuLy8gYWN0aXZpdHlfdmVyc2lvbnMuY29udGVudCBmb3JldmVyLCBzbyB0aGUgdGFsbHkgY2FuIGJlIGNvbXB1dGVkIHdoZW5ldmVyIHRoZVxuLy8gZG9jdW1lbnQgaXMgbmV4dCByZWFkIFx1MjAxNCBhbmQgYHB1Ymxpc2gtYWN0aXZpdHlgLCB3aGljaCBTOSByZXdyaXRlcywgaXMgbmV2ZXJcbi8vIHRvdWNoZWQgKHRoaXMgaXMgd2hhdCBkaXNzb2x2ZWQgZmluZGluZyBSNihiKTogbm90aGluZyBnZXRzIHdyaXR0ZW4gdHdpY2UpLlxuLy8gU2FtZSBwb3N0dXJlIGFzIDAwMjUncyBkZXJpdmVkIHN0dWRlbnQgZG9ybWFuY3k6IGRvbid0IG1hcmsgd2hhdCB5b3UgY2FuXG4vLyBkZXJpdmUuXG4vL1xuLy8gVHdvIHByb2R1Y3RzLCBib3RoIHBlciB2ZXJzaW9uOlxuLy9cbi8vICAgY291bnRzIFx1MjAxNCBjZW5zdXNLZXkgXHUyMTkyIGhvdyBtYW55IGJsb2NrIGluc3RhbmNlcyBvZiB0aGF0IGtpbmQgdGhlIHZlcnNpb25cbi8vICAgICBjb250YWlucy4gVGhlIGtleSBjb21lcyBmcm9tIHRoZSByZWdpc3RyeSdzIGNlbnN1c0tleU9mKCksIHNvIGFcbi8vICAgICB2YXJpYW50LWNhcnJ5aW5nIGJsb2NrIHRhbGxpZXMgcGVyIHZhcmlhbnQgKGBkYXRhX3Bsb3QuYnVpbGRfaGlzdG9ncmFtYClcbi8vICAgICBhbmQgYSBuZXcgYmxvY2sgdHlwZSBpcyBjb3VudGVkIHRoZSBkYXkgaXQgcmVnaXN0ZXJzLlxuLy9cbi8vICAgaXRlbXMgXHUyMDE0IGV2ZXJ5IFJFU1BPTlNFIGlkIGluIHRoZSB2ZXJzaW9uIG1hcHBlZCB0byB0aGUgY2Vuc3VzIGtleSBvZiB0aGVcbi8vICAgICBibG9jayBpdCBiZWxvbmdzIHRvLiBUaGlzIGlzIHdoYXQgbGV0cyBhbiBhZ2dyZWdhdGUgb3ZlciBzZWN0aW9uX2NoZWNrc1xuLy8gICAgIHNheSBcIjMgb2YgNCB3cm9uZyBhbnN3ZXJzIHdlcmUgb24gZmlsbF9pbl9ibGFua1wiIFx1MjAxNCB2ZXJkaWN0cyBhcmUga2V5ZWQgYnlcbi8vICAgICBpdGVtIGlkIChibGFuay9nYXAgaWRzIGZvciB0aGUgYmxhbmtzIGNhdGVnb3J5LCBibG9jayBpZHMgZWxzZXdoZXJlKSwgYW5kXG4vLyAgICAgbm90aGluZyBlbHNlIGluIHRoZSBkYXRhYmFzZSBrbm93cyB3aGF0IGFuIGl0ZW0gaWQgSVMuXG4vL1xuLy8gV0hZIFRIRSBJVEVNIE1BUCBSRVVTRVMgVEhFIEdSQURJTkcgV0FMSyAocnVsaW5nIFM3LTUpLiBUaGUgc2V0IG9mIGlkcyB0aGF0XG4vLyBjYW4gYXBwZWFyIGluIGEgdmVyZGljdCBtYXAgaXMgZGVjaWRlZCBieSBPTkUgdGhpbmc6IHdoYXQgdGhlIGdyYWRlciBhY2NlcHRzXG4vLyAoaW52ZW50b3J5U2VjdGlvbiwgc2VydmVyL2dyYWRpbmcvd2Fsay50cykuIEEgc2Vjb25kIGVudW1lcmF0aW9uIHdyaXR0ZW4gaGVyZVxuLy8gd291bGQgZHJpZnQgZnJvbSBpdCBcdTIwMTQgYW5kIGRyaWZ0ZWQgYXR0cmlidXRpb24gaXMgc2lsZW50LCBjb3VudGluZyBhIHN0dWRlbnQnc1xuLy8gYW5zd2VyIHVuZGVyIHRoZSB3cm9uZyBibG9jayB0eXBlIG9yIGRyb3BwaW5nIGl0LiBTbyB0aGlzIG1vZHVsZSBvd25zIG5vIGlkXG4vLyBydWxlcyBhdCBhbGw6IGl0IGFza3MgdGhlIGdyYWRlcidzIGludmVudG9yeSBmb3IgdGhlIGlkcyBhbmQgb25seSBzdXBwbGllc1xuLy8gdGhlIGlkIFx1MjE5MiBjZW5zdXMta2V5IGpvaW4uIHRlc3RzL2NlbnN1cy50ZXN0LnRzIHBpbnMgdGhlIGVxdWFsaXR5LlxuLy9cbi8vIEJVTkRMRSBOT1RFOiB3YWxrLnRzIGltcG9ydHMgaXRzIHR3byBjb2xsYWJvcmF0b3JzIGFzIGBpbXBvcnQgdHlwZWAgb25seSwgc29cbi8vIHB1bGxpbmcgaXQgaW4gaGVyZSBjb3N0cyB0aGUgcmVhZCBidW5kbGUgbm90aGluZyBhdCBydW50aW1lIFx1MjAxNCBubyBtYXRoanMsIG5vXG4vLyBzY29yZXJzICh0aGUgZ3JhcGgta2l0L3Njb3JlcnMgZGlzY2lwbGluZSwgY2hlY2tlZCBieSB0aGUgYnVuZGxlJ3Mgc2l6ZVxuLy8gY2VpbGluZyBhbmQgYSBncmVwLWFic2VuY2UgdGVzdCkuXG4vL1xuLy8gICBkb2N1bWVudCBcdTI1MDBcdTI1MDBcdTI1QkEgZWFjaEJsb2NrIChyb3dzXHUyMTkyY29sdW1uc1x1MjE5MmJsb2NrcywgY2hpbGQgYmxvY2tzLCByZWZlcmVuY2VQYW5lbClcbi8vICAgICAgICAgICAgICAgICAgIFx1MjUwMlxuLy8gICAgICAgICAgICAgICAgICAgXHUyNTFDXHUyNTAwXHUyNUJBIGNvdW50czogIHRhbGx5IG9mIGNlbnN1c0tleU9mKGJsb2NrKVxuLy8gICAgICAgICAgICAgICAgICAgXHUyNTE0XHUyNTAwXHUyNUJBIGluZGV4OiAgIGJsb2NrSWQgXHUyMTkyIGNlbnN1c0tleVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdTI1QjJcbi8vICAgc2VjdGlvbnMgXHUyNTAwXHUyNTAwXHUyNUJBIGludmVudG9yeVNlY3Rpb24gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTE4ICAoYmxhbmsvZ2FwIGlkcywgTUMvbWF0Y2hpbmcvb3JkZXJpbmcvXG4vLyAgICAgICAgICAgICAgICAodGhlIGdyYWRlcidzIG93biAgICAgICBncmFwaC9mcmVlLXRleHQgYmxvY2sgaWRzKVxuLy8gICAgICAgICAgICAgICAgIGFjY2VwdGVkLWlkIHNldCkgICBcdTI1MDBcdTI1MDBcdTI1QkEgaXRlbXNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB0eXBlIHsgQWN0aXZpdHlEb2N1bWVudCwgQmxvY2sgfSBmcm9tICdAYWN0aXZpdHkvc2NoZW1hJztcbmltcG9ydCB7IGNoaWxkQmxvY2tzT2YgfSBmcm9tICcuLi9jb250YWluZXIvYmxvY2tJbmRleC5qcyc7XG5pbXBvcnQgeyBibG9ja1JlZ2lzdHJ5LCBjZW5zdXNLZXlPZiB9IGZyb20gJy4uL3JlZ2lzdHJ5L3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IGludmVudG9yeVNlY3Rpb24gfSBmcm9tICcuLi9zZXJ2ZXIvZ3JhZGluZy93YWxrLmpzJztcbmltcG9ydCB0eXBlIHsgUmF3U2VjdGlvbiB9IGZyb20gJy4uL3NlcnZlci9ncmFkaW5nL3dhbGsuanMnO1xuXG4vKiogQ2Vuc3VzIGtleSBmb3IgYSBibG9jayB3aG9zZSB0eXBlIHRoZSByZWdpc3RyeSBkb2Vzbid0IGtub3cuIFVucmVhY2hhYmxlIGZvclxuICogYSBzY2hlbWEtdmFsaWQgZG9jdW1lbnQgKHRoZSByZWdpc3RyeSBjb21wbGV0ZW5lc3MgZ3VhcmQgbWFrZXMgZXZlcnkgYmxvY2tcbiAqIHR5cGUgcmVnaXN0ZXJlZCksIGFuZCBkZWxpYmVyYXRlbHkgYSBWSVNJQkxFIGJ1Y2tldCByYXRoZXIgdGhhbiBhIHRocm93OiB0aGlzXG4gKiBydW5zIG9uIHRoZSByZWFkIHBhdGgsIHdoZXJlIHRoZSBydWxlZCB3cml0ZSBvcmRlcmluZyBtZWFucyBhIHRocm93biBjZW5zdXNcbiAqIHdvdWxkIGNvc3QgdGhlIHZlcnNpb24gaXRzIGNhY2hlIHJvdyBvbiBldmVyeSByZWFkLiBBIHN1cmZhY2VkIGBfdW5rbm93bmBcbiAqIHJvdyBpcyBhIGJ1ZyByZXBvcnQ7IGEgY3Jhc2ggaGVyZSB3b3VsZCBiZSBhIHNpbGVudCBwZXJmb3JtYW5jZSBjbGlmZi4gKi9cbmV4cG9ydCBjb25zdCBVTktOT1dOX0NFTlNVU19LRVkgPSAnX3Vua25vd24nO1xuXG5leHBvcnQgaW50ZXJmYWNlIENlbnN1c0NvdW50IHtcbiAgY2Vuc3VzS2V5OiBzdHJpbmc7XG4gIGJsb2NrQ291bnQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDZW5zdXNJdGVtIHtcbiAgLyoqIFRoZSBpZCBhIHZlcmRpY3QgbWFwIGlzIGtleWVkIGJ5OiBhIGJsYW5rIGlkLCBhbiBpbi1lcXVhdGlvbiBnYXAgaWRcbiAgICogKGBnYCtoZXgpLCBvciBhIGdyYWRhYmxlL3JlY29yZGVkIGJsb2NrIGlkLiAqL1xuICBpdGVtSWQ6IHN0cmluZztcbiAgY2Vuc3VzS2V5OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmVyc2lvbkNlbnN1cyB7XG4gIC8qKiBEb2N1bWVudCBvcmRlciBvZiBmaXJzdCBhcHBlYXJhbmNlLiAqL1xuICBjb3VudHM6IENlbnN1c0NvdW50W107XG4gIGl0ZW1zOiBDZW5zdXNJdGVtW107XG59XG5cbi8qKiBUaGUgcmVnaXN0cnkncyBrZXkgcnVsZSwgZ3VhcmRlZCBvbiBpdHMgb25lIHByZWNvbmRpdGlvbiAoYSByZWdpc3RlcmVkXG4gKiB0eXBlKS4gVGhlIHJ1bGUgaXRzZWxmIGlzIE5PVCByZXN0YXRlZCBoZXJlIFx1MjAxNCBjZW5zdXNLZXlPZiBzdGF5cyB0aGUgc291cmNlLFxuICogdmFyaWFudCBzdWZmaXggaW5jbHVkZWQuICovXG5mdW5jdGlvbiBzYWZlQ2Vuc3VzS2V5KGJsb2NrOiBCbG9jayk6IHN0cmluZyB7XG4gIGNvbnN0IHR5cGUgPSAoYmxvY2sgYXMgeyB0eXBlPzogdW5rbm93biB9KS50eXBlO1xuICBpZiAodHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnIHx8ICEodHlwZSBpbiBibG9ja1JlZ2lzdHJ5KSkge1xuICAgIHJldHVybiBVTktOT1dOX0NFTlNVU19LRVk7XG4gIH1cbiAgcmV0dXJuIGNlbnN1c0tleU9mKGJsb2NrKTtcbn1cblxuLyoqIFZpc2l0IGEgYmxvY2sgYW5kLCBkZXB0aC1maXJzdCwgZXZlcnkgYmxvY2sgbmVzdGVkIGluc2lkZSBpdC4gQ2hpbGQgYmxvY2tzXG4gKiBhcmUgZm91bmQgU1RSVUNUVVJBTExZIHZpYSBibG9ja0luZGV4J3MgY2hpbGRCbG9ja3NPZiBcdTIwMTQgdGhlIGRvY3VtZW50ZWQgc2luZ2xlXG4gKiBkZWZpbml0aW9uIG9mIFwiaXMgdGhpcyBhIG5lc3RlZCBibG9jayBvciBjb250ZW50IG9mIHRoaXMgb25lP1wiLCBzaGFyZWQgd2l0aFxuICogdGhlIHNlcnZlZC1kb2N1bWVudCBpbmRleCBhbmQgdGhlIGFuc3dlci1rZXkgZXh0cmFjdGlvbi4gQSBmYWRlZCBleGFtcGxlJ3NcbiAqIHN0ZXBzIHRoZXJlZm9yZSBjb3VudCBhcyB0aGVtc2VsdmVzLCBleGFjdGx5IGFzIHRoZXkgZ3JhZGUgYXMgdGhlbXNlbHZlcy4gKi9cbmZ1bmN0aW9uIHZpc2l0RGVlcChibG9jazogQmxvY2ssIHZpc2l0OiAoYmxvY2s6IEJsb2NrKSA9PiB2b2lkKTogdm9pZCB7XG4gIHZpc2l0KGJsb2NrKTtcbiAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZEJsb2Nrc09mKGJsb2NrIGFzIHVua25vd24gYXMgb2JqZWN0KSkge1xuICAgIHZpc2l0RGVlcChjaGlsZCBhcyB1bmtub3duIGFzIEJsb2NrLCB2aXNpdCk7XG4gIH1cbn1cblxuLyoqIEV2ZXJ5IGJsb2NrIGluc3RhbmNlIGluIHRoZSBkb2N1bWVudCwgaW4gZG9jdW1lbnQgb3JkZXI6IHNlY3Rpb24gY29udGVudFxuICogZmlyc3QgKHJvd3MgXHUyMTkyIGNvbHVtbnMgXHUyMTkyIGJsb2NrcyksIHRoZW4gdGhlIHJlZmVyZW5jZSBwYW5lbC4gVGhlIHBhbmVsIGlzXG4gKiBzY2FmZm9sZCBcdTIwMTQgaXQgaXMgbmV2ZXIgY2hlY2tlZCwgc28gaXQgY29udHJpYnV0ZXMgY291bnRzIGFuZCBubyBpdGVtcyBcdTIwMTQgYnV0XG4gKiBpdCBJUyBhdXRob3JlZCBjb250ZW50IGEgdGVhY2hlciBjaG9zZSwgc28gbGVhdmluZyBpdCBvdXQgd291bGQgdW5kZXJjb3VudFxuICogd2hhdCB0aGUgYWN0aXZpdHkgYWN0dWFsbHkgdXNlcy4gKi9cbmZ1bmN0aW9uIGVhY2hCbG9jayhkb2M6IEFjdGl2aXR5RG9jdW1lbnQsIHZpc2l0OiAoYmxvY2s6IEJsb2NrKSA9PiB2b2lkKTogdm9pZCB7XG4gIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBkb2Muc2VjdGlvbnMgPz8gW10pIHtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiBzZWN0aW9uLnJvd3MgPz8gW10pIHtcbiAgICAgIGZvciAoY29uc3QgY29sdW1uIG9mIHJvdy5jb2x1bW5zID8/IFtdKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgY29sdW1uLmJsb2NrcyA/PyBbXSkgdmlzaXREZWVwKGJsb2NrLCB2aXNpdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgYmxvY2sgb2YgZG9jLnJlZmVyZW5jZVBhbmVsPy5ibG9ja3MgPz8gW10pIHZpc2l0RGVlcChibG9jaywgdmlzaXQpO1xufVxuXG4vKipcbiAqIENvbXB1dGUgdGhlIGNlbnN1cyBvZiBhbiBVUEdSQURFRCBkb2N1bWVudCAocG9zdC11cGdyYWRlLCBwcmUtc2FuaXRpemUpLlxuICpcbiAqIFByZS1zYW5pdGl6ZSBvbiBwdXJwb3NlOiBgb3JkZXJpbmdgJ3MgYXV0aG9yZWQgaXRlbSBvcmRlciBhbmQgdGhlIGJsYW5rXG4gKiBhbnN3ZXIga2V5cyBhcmUgZ29uZSBmcm9tIHRoZSBzZXJ2ZWQgYXJ0aWZhY3QsIGFuZCB0aGUgZ3JhZGluZyBpbnZlbnRvcnkgdGhpc1xuICogam9pbnMgYWdhaW5zdCByZWFkcyB0aGUgc2FtZSByYXcgc2hhcGUgdGhlIGdyYWRlciBkb2VzLiBOb3RoaW5nIGRlcml2ZWQgaGVyZVxuICogaXMgc2VjcmV0IFx1MjAxNCBhIGNvdW50IG9mIGJsb2NrIGtpbmRzIGFuZCBhIGxpc3Qgb2YgcmVzcG9uc2UgaWRzIHRoZSBjbGllbnRcbiAqIGFscmVhZHkgaG9sZHMgXHUyMDE0IHNvIHRoZSBvdXRwdXQgY3Jvc3NlcyBubyBzYW5pdGl6ZXIgYm91bmRhcnkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjZW5zdXNPZkRvY3VtZW50KGRvYzogQWN0aXZpdHlEb2N1bWVudCk6IFZlcnNpb25DZW5zdXMge1xuICBjb25zdCBjb3VudHMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuICBjb25zdCBrZXlCeUJsb2NrSWQgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXG4gIGVhY2hCbG9jayhkb2MsIChibG9jaykgPT4ge1xuICAgIGNvbnN0IGtleSA9IHNhZmVDZW5zdXNLZXkoYmxvY2spO1xuICAgIGNvdW50cy5zZXQoa2V5LCAoY291bnRzLmdldChrZXkpID8/IDApICsgMSk7XG4gICAgY29uc3QgaWQgPSAoYmxvY2sgYXMgeyBpZD86IHVua25vd24gfSkuaWQ7XG4gICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpIGtleUJ5QmxvY2tJZC5zZXQoaWQsIGtleSk7XG4gIH0pO1xuXG4gIGNvbnN0IGl0ZW1zOiBDZW5zdXNJdGVtW10gPSBbXTtcbiAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCBwdXNoID0gKGl0ZW1JZDogc3RyaW5nLCBibG9ja0lkOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICBpZiAoIWl0ZW1JZCB8fCBzZWVuLmhhcyhpdGVtSWQpKSByZXR1cm47XG4gICAgc2Vlbi5hZGQoaXRlbUlkKTtcbiAgICBpdGVtcy5wdXNoKHtcbiAgICAgIGl0ZW1JZCxcbiAgICAgIGNlbnN1c0tleToga2V5QnlCbG9ja0lkLmdldChibG9ja0lkKSA/PyBVTktOT1dOX0NFTlNVU19LRVksXG4gICAgfSk7XG4gIH07XG5cbiAgZm9yIChjb25zdCBzZWN0aW9uIG9mIGRvYy5zZWN0aW9ucyA/PyBbXSkge1xuICAgIC8vICdjb2VyY2UnIG9wdHMgT1VUIG9mIHRoZSBCOC9EMTAgaW50ZWdyaXR5IGdhdGUsIGRlbGliZXJhdGVseTogdGhpcyBpc1xuICAgIC8vIHRoZSBSRUFEIHBhdGgsIHdob3NlIHJ1bGVkIGZhaWx1cmUgcG9zdHVyZSBpcyB3aXRoaG9sZC1hbmQtc2VydmUgKHRoZVxuICAgIC8vIGNhY2hlLWZpbGwgY2FsbGVyIGFscmVhZHkgZmFpbHMgc2FmZSkuIEEgY2Vuc3VzZWQgbWFsZm9ybWVkIGRvY3VtZW50XG4gICAgLy8gbWVyZWx5IG1pc2NvdW50czsgb25seSBHUkFESU5HIG9uZSBtaW50cyBhIHdyb25nIG1hcmssIHNvIG9ubHkgZ3JhZGluZ1xuICAgIC8vIHJ1bnMgdGhlIGdhdGUuXG4gICAgY29uc3QgaW52ID0gaW52ZW50b3J5U2VjdGlvbihzZWN0aW9uIGFzIHVua25vd24gYXMgUmF3U2VjdGlvbiwge1xuICAgICAgaW50ZWdyaXR5OiAnY29lcmNlJyxcbiAgICB9KTtcbiAgICAvLyBCbGFua3MgYW5kIG1hdGggZ2FwcyBhdHRyaWJ1dGUgdG8gdGhlaXIgT1dOSU5HIGJsb2NrICh0aGUgd2FsayBhbHJlYWR5XG4gICAgLy8gcmVzb2x2ZXMgY29udGFpbmVycyB0byB0aGUgY2hpbGQpLCB3aGljaCBpcyB3aHkgYSBibGFuayBpbnNpZGUgYSBmYWRlZFxuICAgIC8vIGV4YW1wbGUgY291bnRzIGFzIGZhZGVkX3dvcmtlZF9leGFtcGxlIGFuZCBub3QgYXMgZmlsbF9pbl9ibGFuay5cbiAgICBmb3IgKGNvbnN0IGdyb3VwIG9mIGludi5ibGFua0dyb3Vwc0J5QmxvY2spIHtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGdyb3VwLmtleXMpIHB1c2goa2V5LmlkLCBncm91cC5ibG9ja0lkKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBtYyBvZiBpbnYubXVsdGlwbGVDaG9pY2UpIHB1c2gobWMuYmxvY2tJZCwgbWMuYmxvY2tJZCk7XG4gICAgZm9yIChjb25zdCBtIG9mIGludi5tYXRjaGluZykgcHVzaChtLmJsb2NrSWQsIG0uYmxvY2tJZCk7XG4gICAgZm9yIChjb25zdCBvIG9mIGludi5vcmRlcmluZykgcHVzaChvLmJsb2NrSWQsIG8uYmxvY2tJZCk7XG4gICAgZm9yIChjb25zdCBnIG9mIGludi5ncmFwaHMpIHB1c2goZy5ibG9ja0lkLCBnLmJsb2NrSWQpO1xuICAgIGZvciAoY29uc3QgaWQgb2YgaW52LmZyZWVUZXh0KSBwdXNoKGlkLCBpZCk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGNvdW50czogWy4uLmNvdW50c10ubWFwKChbY2Vuc3VzS2V5LCBibG9ja0NvdW50XSkgPT4gKHtcbiAgICAgIGNlbnN1c0tleSxcbiAgICAgIGJsb2NrQ291bnQsXG4gICAgfSkpLFxuICAgIGl0ZW1zLFxuICB9O1xufVxuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBzYW5pdGl6ZS9zZXJ2ZVNlZWQudHMgXHUyMDE0IHRoZSBPTkUgc3BlbGxpbmcgb2YgdGhlIHNlcnZlLXNodWZmbGUgc2VlZCAoRzEpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHNlZWQgdGhhdCBkZWNpZGVzIHdoYXQgYXJyYW5nZW1lbnQgZWFjaCBzdHVkZW50IGlzIFNFUlZFRCBcdTIwMTQgYW5kXG4vLyB0aGVyZWZvcmUgd2hhdCB0aGUgZ3JhZGVyIG11c3QgcmVjb21wdXRlIHRvIHRlbGwgXCJhcnJhbmdlZCBkZWxpYmVyYXRlbHlcIlxuLy8gZnJvbSBcIm5ldmVyIHRvdWNoZWRcIiAodGhlIG9yZGVyaW5nIG9taXNzaW9uIHJ1bGUpLiBVbnRpbCAyMDI2LTA4LTA2IHRoZVxuLy8gY29udHJhY3QgZXhpc3RlZCBhcyB0d28gc3BlbGxpbmdzIGFncmVlaW5nIGJ5IGx1Y2s6IHRoZSByZWFkIHBhdGggY29tcG9zZWRcbi8vIGAke3ZlcnNpb25JZH06JHt1c2VySWR9YCBpbmxpbmUgd2hpbGUgdGhlIGdyYWRpbmcgc2lkZSBoYWQgaXRzIG93blxuLy8gc2VydmVTZWVkKCkgKHMyLXJldHJvIGZpbmRpbmcgNykuIFR3byBzdHJpbmdzIGRyaWZ0aW5nIGhlcmUgd291bGQgc2lsZW50bHlcbi8vIG1pcy1ncmFkZSBhIHN1YnNldCBvZiBzdHVkZW50cyBcdTIwMTQgY2xvc2UgdG8gdW5kaWFnbm9zYWJsZSBmcm9tIGEgYnVnIHJlcG9ydC5cbi8vXG4vLyBEZXBlbmRlbmN5LWZyZWUgbGVhZiBPTiBQVVJQT1NFOiBpbXBvcnRlZCBieSB0aGUgcmVhZCBidW5kbGUgKHRoZSBoYW5kbGVyKVxuLy8gYW5kIHRoZSBncmFkaW5nIGJ1bmRsZSAoc2VydmVkT3JkZXIpLCBzbyBpdCBtdXN0IG5ldmVyIGdyb3cgYW4gaW1wb3J0LlxuLy9cbi8vIE5CIHRoZSBzZWVkZWQgc2h1ZmZsZSBiZWhpbmQgdGhpcyBzZWVkIGlzIGxvYWQtYmVhcmluZyBmb3IgUzQncyBvcmRlcmluZ1xuLy8gb21pc3Npb24gcnVsZSBhbmQgY2FycmllcyBhbiB1bmV4cGxhaW5lZCBvbmUtb2ZmIGZsYWtlIGluIFNUQVRFJ3Mgd2F0Y2hcbi8vIGl0ZW1zIChzYW5pdGl6ZS50ZXN0IFwiZGlmZmVycyBhY3Jvc3Mgc3R1ZGVudHNcIiwgMjAyNi0wOC0wMSwgMS1pbi0xNCkgXHUyMDE0IGlmXG4vLyB0aGF0IHRlc3QgbWlzYmVoYXZlcyBhZnRlciBhbnkgY2hhbmdlIGhlcmUsIHRyZWF0IGl0IGFzIHRoZSBzZWNvbmQgc2lnaHRpbmcuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vKiogQ29tcG9zZSB0aGUgc2VlZCB0aGUgcmVhZCBwYXRoIHNlcnZlcyB3aXRoIGFuZCB0aGUgZ3JhZGVyIHJlY29tcHV0ZXMgZnJvbS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXJ2ZVNlZWQodmVyc2lvbklkOiBzdHJpbmcsIHN0dWRlbnRJZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3ZlcnNpb25JZH06JHtzdHVkZW50SWR9YDtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2VydmVyL2p3dC50cyBcdTIwMTQgdGhlIE9ORSB1bnZlcmlmaWVkIGBzdWJgIHJlYWRlciAoRzIpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRGVjb2RlZCBXSVRIT1VUIHZlcmlmaWNhdGlvbiwgZGVsaWJlcmF0ZWx5OiBieSB0aGUgdGltZSBlaXRoZXIgaGFuZGxlciBjYWxsc1xuLy8gdGhpcywgaXRzIHVzZXItc2NvcGVkIFJQQyBoYXMgYWxyZWFkeSBzdWNjZWVkZWQsIHdoaWNoIG1lYW5zIFBvc3RnUkVTVFxuLy8gdmVyaWZpZWQgdGhlIHRva2VuJ3Mgc2lnbmF0dXJlLiBUaGlzIG9ubHkgcmUtcmVhZHMgdGhlIGBzdWJgIGNsYWltIFx1MjAxNCB0byBrZXlcbi8vIHRoZSBzdHVkZW50J3Mgc2VydmUgc2h1ZmZsZSAocmVhZCBwYXRoKSBhbmQgdGhlaXIgc2VjdGlvbl9jaGVja3Mgcm93XG4vLyAoY2hlY2sgcGF0aCkuIE5FVkVSIGFuIGF1dGhvcml6YXRpb24gaW5wdXQuXG4vL1xuLy8gV2FzIHBhc3RlZCBieXRlLWlkZW50aWNhbGx5IGludG8gYm90aCBoYW5kbGVycyBhcyBqd3RTdWIgLyBqd3RTdWJqZWN0XG4vLyAoczItcmV0cm8gZmluZGluZyA4KTsgb25lIGNvcHksIG9uZSBuYW1lLCBzaW5jZSAyMDI2LTA4LTA2LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFRoZSB0b2tlbidzIGBzdWJgIGNsYWltLCBvciBudWxsIHdoZW4gdGhlIGhlYWRlciBjYXJyaWVzIG5vIHJlYWRhYmxlIEpXVC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBqd3RTdWIoYXV0aEhlYWRlcjogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IHRva2VuID0gYXV0aEhlYWRlci5yZXBsYWNlKC9eQmVhcmVyXFxzKy9pLCAnJyk7XG4gIGNvbnN0IHBheWxvYWQgPSB0b2tlbi5zcGxpdCgnLicpWzFdO1xuICBpZiAoIXBheWxvYWQpIHJldHVybiBudWxsO1xuICB0cnkge1xuICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKFxuICAgICAgYXRvYihwYXlsb2FkLnJlcGxhY2UoLy0vZywgJysnKS5yZXBsYWNlKC9fL2csICcvJykpLFxuICAgICkgYXMgeyBzdWI/OiB1bmtub3duIH07XG4gICAgcmV0dXJuIHR5cGVvZiBqc29uLnN1YiA9PT0gJ3N0cmluZycgPyBqc29uLnN1YiA6IG51bGw7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHNlcnZlci91dWlkLnRzIFx1MjAxNCBPTkUgaWQtc2hhcGUgcnVsZSBmb3IgdGhlIEFQSSBzdXJmYWNlIChHMilcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUSEUgREVDSVNJT04gKGVuZy1yZXZpZXcgRzIsIDIwMjYtMDgtMDYpOiBTVFJJQ1QgZXZlcnl3aGVyZSBpbiBzaGFyZWQgc2VydmVyXG4vLyBzb3VyY2UuIFVVSURfUkUgZXhpc3RlZCBhdCBmb3VyIHNpdGVzIHdpdGggdHdvIHN0cmljdG5lc3NlcyBcdTIwMTQgdGhlIHJlYWQgQVBJXG4vLyBhY2NlcHRlZCBhbnkgaGV4IG5pYmJsZXMgd2hpbGUgdGhlIGNoZWNrIEFQSSByZXF1aXJlZCBhIHJlYWwgdmVyc2lvbiBuaWJibGVcbi8vIGFuZCBSRkMgdmFyaWFudCBcdTIwMTQgc28gdGhlIHNhbWUgYWN0aXZpdHkgaWQgY291bGQgYmUgdmFsaWQgb24gb25lIGVuZHBvaW50IGFuZFxuLy8gcmVqZWN0ZWQgYnkgdGhlIG90aGVyLCB3aXRoIG5vIHJlY29yZGVkIHdoeSAoczItYXVkaXQgY29ycmVjdGlvbnMgMy81KS5cbi8vIEV2ZXJ5IGxlZ2l0aW1hdGUgaWQgaXMgYSBQb3N0Z3JlcyBnZW5fcmFuZG9tX3V1aWQoKSAodjQsIFJGQyB2YXJpYW50KSwgc29cbi8vIHN0cmljdCBjb3N0cyBubyByZWFsIGNsaWVudCBhbnl0aGluZyBhbmQgcmVqZWN0cyBnYXJiYWdlIGVhcmxpZXIuXG4vL1xuLy8gVGhlIHR3byByZW1haW5pbmcgTE9PU0UgY29waWVzIGxpdmUgaW4gaW5nZXN0LXN1Ym1pc3Npb24gYW5kIGdldC1mZWVkYmFjaydzXG4vLyBEZW5vIGZpbGVzLCBkZWxpYmVyYXRlbHkgdW50b3VjaGVkOiBib3RoIGZ1bmN0aW9ucyBzZXJ2ZSBvbmx5IHRoZSBhbm9ueW1vdXNcbi8vIHB1Ymxpc2hlZC1wYWdlIHdpcmUgYW5kIGFyZSBkZWxldGVkIGF0IFM5IChjdXRvdmVyIGNoZWNrbGlzdCBDMTUpIFx1MjAxNFxuLy8gdGlnaHRlbmluZyBhIHN1cmZhY2Ugc2NoZWR1bGVkIGZvciBkZW1vbGl0aW9uIHdvdWxkIGJ1eSB0d28gcmVkZXBsb3lzIG9mIGFcbi8vIGRvb21lZCBmdW5jdGlvbi4gVGhlaXIgY29waWVzIGNhcnJ5IGEgcG9pbnRlciBoZXJlLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLyoqIFJGQyA0MTIyIHYxXHUyMDEzdjUsIHZhcmlhbnQgMTB4eCBcdTIwMTQgd2hhdCBnZW5fcmFuZG9tX3V1aWQoKSBhbmQgZXZlcnkgbGVnaXRpbWF0ZVxuICogY2xpZW50IGlkIGFjdHVhbGx5IGxvb2sgbGlrZS4gKi9cbmV4cG9ydCBjb25zdCBVVUlEX1JFID1cbiAgL15bMC05YS1mXXs4fS1bMC05YS1mXXs0fS1bMS01XVswLTlhLWZdezN9LVs4OWFiXVswLTlhLWZdezN9LVswLTlhLWZdezEyfSQvaTtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2VydmVyL2dldC1hY3Rpdml0eS1oYW5kbGVyLnRzIFx1MjAxNCB0aGUgZ2V0LWFjdGl2aXR5IHJlcXVlc3QgaGFuZGxlciAoUzIpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGZ1bGwgYnJhbmNoaW5nIGxvZ2ljIG9mIHRoZSBnZXQtYWN0aXZpdHkgRWRnZSBGdW5jdGlvbiwgZXh0cmFjdGVkIGhlcmUgc29cbi8vIGl0IGxpdmVzIGluIHRoZSBURVNURUQsIENJLWRyaWZ0LWd1YXJkZWQgdmlld2VyLXNlcnZlciBidW5kbGUgaW5zdGVhZCBvZiBpblxuLy8gdW50ZXN0YWJsZSBEZW5vIGdsdWUgKHRoZSBTMiByZXZpZXcgZm91bmQgdGhlIDM3NC1saW5lIGZ1bmN0aW9uIHdhcyB0aGUgbW9zdFxuLy8gYnJhbmNoLWhlYXZ5IGluIHRoZSByZXBvIHdpdGggemVybyBhdXRvbWF0ZWQgY292ZXJhZ2UpLiBUaGUgRGVubyBlbnRyeSBwb2ludFxuLy8gKHN1cGFiYXNlL2Z1bmN0aW9ucy9nZXQtYWN0aXZpdHkvaW5kZXgudHMpIGlzIG5vdyB0aGluIHdpcmluZzogaXQgcmVhZHMgZW52LFxuLy8gYnVpbGRzIHRoZSBTdXBhYmFzZSBjbGllbnRzIGJlaGluZCB0aGUgYEdldEFjdGl2aXR5RGJgIHBvcnQsIHBhc3NlcyB0aGVcbi8vIF9zaGFyZWQvY29ycy50cyBoZWxwZXJzIGJlaGluZCB0aGUgYENvcnNLaXRgIHBvcnQsIGFuZCBzZXJ2ZXMgdGhlIGhhbmRsZXJcbi8vIHRoaXMgZmFjdG9yeSByZXR1cm5zLiBFdmVyeXRoaW5nIG9ic2VydmFibGUgXHUyMDE0IHN0YXR1cyBjb2RlcywgZXJyb3IgY29kZXMsXG4vLyBjYWNoZSBoZWFkZXJzLCByZXNwb25zZSBlbnZlbG9wZXMgXHUyMDE0IGlzIGRlY2lkZWQgSEVSRSBhbmQgcGlubmVkIGJ5XG4vLyB0ZXN0cy9nZXQtYWN0aXZpdHktaGFuZGxlci50ZXN0LnRzLlxuLy9cbi8vIFRocmVlIEdFVCBtb2RlcyBvbiBvbmUgZnVuY3Rpb246XG4vL1xuLy8gICAxLiBNRVRBIChhbm9ueW1vdXMsIHJhdGUtbGltaXRlZCBcdTIwMTQgcnVsaW5nIDMuMkEpOlxuLy8gICAgICAgIEdFVCA/YWN0aXZpdHlfaWQ9PHV1aWQ+Jm1ldGE9MVxuLy8gICAgICBcdTIxOTIgeyB0aXRsZSwgdGVhY2hlcl9uYW1lIH0gYW5kIE5PVEhJTkcgZWxzZSBcdTIwMTQgdGhlIHByZS1hdXRoIGludGVyc3RpdGlhbFxuLy8gICAgICAgIGNvbnRyYWN0IChcIk1ycy4gSmFmYXJpJ3MgJ0xpbmVhciBTeXN0ZW1zJ1wiICsgXCJ1c2UgeW91ciBAZGlzdHJpY3Qub3JnXG4vLyAgICAgICAgYWNjb3VudFwiKS4gU2FtZSBkYXRhIGFueSBwdWJsaXNoZWQgcGFnZSBhbHJlYWR5IHNob3dzIHB1YmxpY2x5LlxuLy9cbi8vICAgMWIuIENMQVNTIE1FVEEgKGFub255bW91cywgc2FtZSBsaW1pdGVyIFx1MjAxNCBTOSBEcm9wIDIsIEQtMy9FLTIpOlxuLy8gICAgICAgIEdFVCA/am9pbl9jb2RlPTxjb2RlPiZtZXRhPTFcbi8vICAgICAgXHUyMTkyIHsgY2xhc3NfbmFtZSB9IGFuZCBOT1RISU5HIGVsc2UgXHUyMDE0IHRoZSBqb2luIGdhdGUncyBcIkpvaW4gPGNsYXNzIG5hbWU+XCJcbi8vICAgICAgICBpbnN0ZWFkIG9mIHRoZSBiYXJlIGNvZGUuIFJpZGVzIFRISVMgYnJhbmNoIHJhdGhlciB0aGFuIGEgZGlyZWN0IGFub25cbi8vICAgICAgICBQb3N0Z1JFU1QgZ3JhbnQgc28gdGhlIG9uZSBhbm9ueW1vdXMgc3VyZmFjZSBrZWVwcyBpdHMgcmVxdWVzdFxuLy8gICAgICAgIHNoYXBpbmcgKEUtMidzIHJlamVjdGlvbiByZWFzb24pLiBFbnVtZXJhdGlvbiBwb3N0dXJlIHJlY29yZGVkIGluXG4vLyAgICAgICAgMDAzMCdzIGhlYWRlciAoT1YtNCk6IGNvZGVzIFx1MjI0ODJeMjkuNywgdGhlIGxpbWl0ZXIgaXMgb3Bwb3J0dW5pc3RpY1xuLy8gICAgICAgIG5vdCBhIGd1YXJhbnRlZSwgcGF5b2ZmIGlzIGEgY2xhc3MgbmFtZSwgcmVjb3ZlcnkgaXMgQjE0XG4vLyAgICAgICAgcmVtb3ZlLWFuZC1yZWdlbmVyYXRlOyByZXZpc2l0IHRyaWdnZXJzIG5hbWVkIHRoZXJlLlxuLy9cbi8vICAgMi4gUkVTT0xWRSAoYXV0aGVudGljYXRlZCk6XG4vLyAgICAgICAgR0VUID9hY3Rpdml0eV9pZD08dXVpZD5cbi8vICAgICAgXHUyMTkyIHsgYWN0aXZpdHlfaWQsIHZlcnNpb25faWQsIHZlcnNpb25fbnVtLCB0aXRsZSB9IGZvciB0aGUgQ1VSUkVOVFxuLy8gICAgICAgIHB1Ymxpc2hlZCB2ZXJzaW9uLiBTZXJ2ZWQgYG5vLWNhY2hlYCBzbyBhIHJlcHVibGlzaCBpcyB2aXNpYmxlIG9uIHRoZVxuLy8gICAgICAgIG5leHQgb3BlbiAocmV2YWxpZGF0ZSwgZG9uJ3QgcmUtZG93bmxvYWQgXHUyMDE0IHNhbWUgcG9zdHVyZSBhcyB0aGUgUjJcbi8vICAgICAgICBsaXZlIGFsaWFzKS5cbi8vXG4vLyAgIDMuIENPTlRFTlQgKGF1dGhlbnRpY2F0ZWQpOlxuLy8gICAgICAgIEdFVCA/YWN0aXZpdHlfaWQ9PHV1aWQ+JnZlcnNpb25faWQ9PHV1aWQ+XG4vLyAgICAgIFx1MjE5MiB0aGUgVVBHUkFERUQgKDRBKSArIFNBTklUSVpFRCAoVFY0LUEpIGRvY3VtZW50IGZvciB0aGF0IHZlcnNpb24sIHBsdXNcbi8vICAgICAgICBwZXItc3R1ZGVudCBzZXJ2ZS10aW1lIHNodWZmbGVzLiBUaGUgVVJMIGlzIHZlcnNpb24ta2V5ZWQsIHNvIHRoZVxuLy8gICAgICAgIHJlc3BvbnNlIGlzIHNlcnZlZCBgcHJpdmF0ZSwgbWF4LWFnZT0zMTUzNjAwMCwgaW1tdXRhYmxlYCBcdTIwMTQgdGhlXG4vLyAgICAgICAgYnJvd3NlciBuZXZlciByZWZldGNoZXMgYSB2ZXJzaW9uIGl0IGhhcy4gT25seSB0aGUgQ1VSUkVOVCB2ZXJzaW9uIGlzXG4vLyAgICAgICAgc2VydmVkIChhIHN0YWxlIHZlcnNpb25faWQgNDA0cyB3aXRoIGNvZGUgJ3N0YWxlX3ZlcnNpb24nOyB0aGUgdmlld2VyXG4vLyAgICAgICAgcmUtcmVzb2x2ZXMpLCBzbyBhIHJlcHVibGlzaCBpbnZhbGlkYXRlcyBieSBjaGFuZ2luZyB0aGUgVVJMLCBuZXZlclxuLy8gICAgICAgIGJ5IGV4cGlyaW5nIGEgY2FjaGUuXG4vL1xuLy8gUGlwZWxpbmUgKGNvbnRlbnQgbW9kZSk6IGdldF9wdWJsaXNoZWRfYWN0aXZpdHkgUlBDIGFzIHRoZSBDQUxMRVIgKHRoZSBEQlxuLy8gZW5mb3JjZXMgYXV0aCArIHB1Ymxpc2hlZC1vbmx5OyBkcmFmdCBjb250ZW50IGlzIHVucmVhY2hhYmxlIGhlcmUpIFx1MjE5MlxuLy8gZHVyYWJsZSBwZXItdmVyc2lvbiBjYWNoZSBsb29rdXAgaW4gYWN0aXZpdHlfdmVyc2lvbl9yZWFkcyBrZXllZCBieVxuLy8gKHZlcnNpb25faWQsIFNBTklUSVpFUl9SRVYpIFx1MjE5MiBvbiBtaXNzIHRoZSBjYWNoZS1maWxsIHBhdGggYmVsb3cgXHUyMTkyXG4vLyBhcHBseVNlcnZlU2h1ZmZsZXMgc2VlZGVkIGAke3ZlcnNpb25faWR9OiR7dXNlcl9pZH1gIChkZXRlcm1pbmlzdGljOiByZWxvYWRzXG4vLyBuZXZlciByZXNodWZmbGU7IHRoZSBjYWNoZWQgYXJ0aWZhY3Qgc3RheXMgc3R1ZGVudC1pbmRlcGVuZGVudCkuXG4vL1xuLy8gICBjYWNoZSBNSVNTIFx1MjUwMFx1MjUwMFx1MjVCQSByZWFkVmVyc2lvbiBcdTI1MDBcdTI1MDBcdTI1QkEgdXBncmFkZSBcdTI1MDBcdTI1MDBcdTI1QkEgc2FuaXRpemVcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjUwMlxuLy8gICAgICAgICAgICAgICAgICAgIFx1MjUwQ1x1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUxOFxuLy8gICAgICAgICAgICAgICAgICAgIFx1MjVCQ1xuLy8gICAgICAgICAgICAgIHdyaXRlQ2Vuc3VzIChTNykgXHUyNTAwXHUyNTAwZmFpbHNcdTI1MDBcdTI1MDBcdTI1QkEgTk8gY2FjaGUgcm93OiBuZXh0IHJlYWQgcmV0cmllc1xuLy8gICAgICAgICAgICAgICAgICAgIFx1MjUwMiBvayAgICAgICAgICAgICAgICAgIChzZWxmLWhlYWxpbmc7IHNlZSB0aGUgb3JkZXJpbmdcbi8vICAgICAgICAgICAgICAgICAgICBcdTI1QkMgICAgICAgICAgICAgICAgICAgICAgbm90ZSBhdCB0aGUgY2FsbCBzaXRlKVxuLy8gICAgICAgICAgICAgIHVwc2VydENhY2hlIFx1MjUwMFx1MjUwMFx1MjVCQSBkZWxldGVTdGFsZUNhY2hlIChvbGQtcmV2IEdDIGZvciB0aGlzIHZlcnNpb24pXG4vL1xuLy8gVGhlIGFuYWx5dGljcyB3cml0ZXMgYXJlIGEgU0lERS1DSEFOTkVMOiBldmVyeSBvbmUgb2YgdGhlbSBjYW4gZmFpbCB3aXRob3V0XG4vLyBjaGFuZ2luZyB0aGUgc3R1ZGVudCdzIHJlc3BvbnNlLiBBIGNhY2hlIEhJVCBkb2VzIG5vbmUgb2YgdGhpcyB3b3JrLlxuLy9cbi8vIEFjY2VzcyBydWxlIChTMiBkZWNpc2lvbiAyKTogQU5ZIGF1dGhlbnRpY2F0ZWQgdXNlciAoc3R1ZGVudCBvciB0ZWFjaGVyKSBtYXlcbi8vIHJlYWQgdGhlIHB1Ymxpc2hlZCBjdXJyZW50IHZlcnNpb24gb2YgYSBub24tZGVsZXRlZCBhY3Rpdml0eSBcdTIwMTQgdGhlIFIyXG4vLyBsaW5rLXNoYXJlIG1vZGVsIGJlaGluZCBzaWduLWluLiBDbGFzc2VzIGdhdGUgaWRlbnRpdHkgKHRoZSAxMysgYXNzZXJ0aW9uKSxcbi8vIG5vdCBhY3Rpdml0eSBhY2Nlc3MuXG4vL1xuLy8gS25vd24gcmVzaWR1YWwgKGRvY3VtZW50ZWQsIGFjY2VwdGVkKTogdGhlIGJyb3dzZXIgSFRUUCBjYWNoZSBpcyBwZXJcbi8vIHByb2ZpbGUsIG5vdCBwZXIgYWNjb3VudC4gT24gYSBzaGFyZWQgQ2hyb21lYm9vayBwcm9maWxlLCBzdHVkZW50IEIgY2FuIGJlXG4vLyBzZXJ2ZWQgc3R1ZGVudCBBJ3MgY2FjaGVkIGNvbnRlbnQgcmVzcG9uc2UgXHUyMDE0IGlkZW50aWNhbCBleGNlcHQgdGhlIG9yZGVyaW5nXG4vLyBwZXJtdXRhdGlvbiAoc2VlZGVkIHBlciBzdHVkZW50KS4gTm8ga2V5IG1hdGVyaWFsIGRpZmZlcnMsIGFuZCBncmFkaW5nXG4vLyByZWZlcmVuY2VzIGl0ZW0gaWRzIChvcmRlci1pbmRlcGVuZGVudCksIHNvIHRoZSB3b3JzdCBjYXNlIGlzIGEgY29zbWV0aWNcbi8vIHBlcm11dGF0aW9uIHN3YXA7IFMxJ3Mgc2lnbk91dEV2ZXJ5dGhpbmcgcHVyZ2VzIHZpZXdlciBTVE9SQUdFLCBub3QgdGhlXG4vLyBIVFRQIGNhY2hlLCBhbmQgcHV0dGluZyB0aGUgdXNlciBpZCBpbiB0aGUgVVJMIHRvIHNwbGl0IGNhY2hlIGtleXMgd291bGRcbi8vIGxlYWsgYW4gaWRlbnRpZmllciBpbnRvIGxvZ3MgZm9yIG5vIHNlY3VyaXR5IGdhaW4uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyBVcGdyYWRlRXJyb3IsIHVwZ3JhZGVBY3Rpdml0eURvY3VtZW50IH0gZnJvbSAnQGFjdGl2aXR5L3NjaGVtYSc7XG5pbXBvcnQgeyBjZW5zdXNPZkRvY3VtZW50IH0gZnJvbSAnLi4vY2Vuc3VzL2NlbnN1cy5qcyc7XG5pbXBvcnQgdHlwZSB7IFZlcnNpb25DZW5zdXMgfSBmcm9tICcuLi9jZW5zdXMvY2Vuc3VzLmpzJztcbmltcG9ydCB7IFNBTklUSVpFUl9SRVYsIHNhbml0aXplQWN0aXZpdHlEb2N1bWVudCB9IGZyb20gJy4uL3Nhbml0aXplL3Nhbml0aXplLmpzJztcbmltcG9ydCB7IHNlcnZlU2VlZCB9IGZyb20gJy4uL3Nhbml0aXplL3NlcnZlU2VlZC5qcyc7XG5pbXBvcnQgeyBqd3RTdWIgfSBmcm9tICcuL2p3dC5qcyc7XG5pbXBvcnQgeyBVVUlEX1JFIH0gZnJvbSAnLi91dWlkLmpzJztcbmltcG9ydCB7IGFwcGx5U2VydmVTaHVmZmxlcyB9IGZyb20gJy4uL3Nhbml0aXplL3NodWZmbGUuanMnO1xuaW1wb3J0IHR5cGUgeyBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50IH0gZnJvbSAnLi4vc2FuaXRpemUvc2FuaXRpemVkLXR5cGVzLmpzJztcblxuLyoqIEJ1bXAgd2hlbiB0aGUgcmVzcG9uc2UgZW52ZWxvcGUgY2hhbmdlcyBzaGFwZSAodGhlIGRvYyBJTlNJREUgaXQgaXNcbiAqIHZlcnNpb25lZCBieSB0aGUgc2NoZW1hICsgU0FOSVRJWkVSX1JFViwgbm90IGJ5IHRoaXMpLiAqL1xuZXhwb3J0IGNvbnN0IEFQSV9WRVJTSU9OID0gMTtcblxuLy8gVVVJRF9SRSBpcyBpbXBvcnRlZCAoc2VydmVyL3V1aWQudHMsIEcyKTogdGhpcyBmaWxlJ3MgbG9vc2UgbG9jYWwgY29weVxuLy8gYWNjZXB0ZWQgaWRzIHRoZSBjaGVjayBBUEkgcmVqZWN0ZWQgXHUyMDE0IG9uZSBzaGFwZSBydWxlIG5vdywgc3RyaWN0LlxuXG4vLyAtLS0tIFBvcnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGhhbmRsZXIgbmV2ZXIgdG91Y2hlcyBzdXBhYmFzZS1qcyBvciBEZW5vIGRpcmVjdGx5OyB0aGUgZW50cnkgcG9pbnRcbi8vIGltcGxlbWVudHMgdGhlc2UgYWdhaW5zdCB0aGUgcmVhbCBjbGllbnRzLCB0ZXN0cyBpbXBsZW1lbnQgdGhlbSB3aXRoIGZha2VzLlxuXG4vKiogVGhlIGB7IGRhdGEsIGVycm9yIH1gIHNoYXBlIGV2ZXJ5IHN1cGFiYXNlLWpzIHF1ZXJ5IHJlc29sdmVzIHRvLiAqL1xuZXhwb3J0IGludGVyZmFjZSBEYlJlc3VsdDxUPiB7XG4gIGRhdGE6IFQgfCBudWxsO1xuICBlcnJvcjogeyBtZXNzYWdlPzogc3RyaW5nIH0gfCBudWxsO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFB1Ymxpc2hlZEFjdGl2aXR5Um93IHtcbiAgdmVyc2lvbl9pZDogc3RyaW5nO1xuICB2ZXJzaW9uX251bTogbnVtYmVyO1xuICB0aXRsZTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEdldEFjdGl2aXR5RGIge1xuICAvKiogYGdldF9hY3Rpdml0eV9wdWJsaWNfbWV0YWAgUlBDIGFzIGFub24gKHBvc3RncmVzLW93bmVkIERFRklORVI7IDAwMTdcbiAgICogZG9jdW1lbnRzIHRoZSBkZWxpYmVyYXRlIGdyYW50IFx1MjAxNCBvbmUgb2YgZXhhY3RseSBUV08gYW5vbiBSUENzIHNpbmNlXG4gICAqIDAwMzAsIHdpdGggY2xhc3NNZXRhJ3MgYmVsb3c7IHZlcmlmeS0wMDE3IFx1MDBBN0QgKyB2ZXJpZnktMDAyOCBcdTAwQTdBIGJvdGggcGluXG4gICAqIHRoZSByb3N0ZXIpLiAqL1xuICBwdWJsaWNNZXRhKFxuICAgIGFjdGl2aXR5SWQ6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxEYlJlc3VsdDx7IHRpdGxlOiBzdHJpbmc7IHRlYWNoZXJfbmFtZTogc3RyaW5nIHwgbnVsbCB9Pj47XG4gIC8qKiBgZ2V0X2NsYXNzX3B1YmxpY19tZXRhYCBSUEMgYXMgYW5vbiAoMDAzMDsgdGhlIGpvaW4gZ2F0ZSdzIHByZS1hdXRoXG4gICAqIGNsYXNzLW5hbWUgbG9va3VwIFx1MjAxNCB0aGUgcm9zdGVyJ3MgU0VDT05EIGFub24gUlBDLCBhc3NlcnRlZCBpblxuICAgKiB2ZXJpZnktMDAyOCBcdTAwQTdBKS4gKi9cbiAgY2xhc3NNZXRhKGpvaW5Db2RlOiBzdHJpbmcpOiBQcm9taXNlPERiUmVzdWx0PHsgbmFtZTogc3RyaW5nIH0+PjtcbiAgLyoqIGBnZXRfcHVibGlzaGVkX2FjdGl2aXR5YCBSUEMgYXMgdGhlIENBTExFUiAoQXV0aG9yaXphdGlvbiBoZWFkZXIgcGFzc2VkXG4gICAqIHRocm91Z2gpLCBzbyB0aGUgREIgZW5mb3JjZXMgYXV0aCArIHB1Ymxpc2hlZC1vbmx5IFx1MjAxNCBub3QgdGhpcyBoYW5kbGVyLiAqL1xuICBwdWJsaXNoZWRBY3Rpdml0eShcbiAgICBhdXRoSGVhZGVyOiBzdHJpbmcsXG4gICAgYWN0aXZpdHlJZDogc3RyaW5nLFxuICApOiBQcm9taXNlPERiUmVzdWx0PFB1Ymxpc2hlZEFjdGl2aXR5Um93Pj47XG4gIC8qKiBDYWNoZSByb3cgZnJvbSBhY3Rpdml0eV92ZXJzaW9uX3JlYWRzIChzZXJ2aWNlIHJvbGUpLiAqL1xuICByZWFkQ2FjaGUoXG4gICAgdmVyc2lvbklkOiBzdHJpbmcsXG4gICAgc2FuaXRpemVyUmV2OiBzdHJpbmcsXG4gICk6IFByb21pc2U8RGJSZXN1bHQ8eyBjb250ZW50OiB1bmtub3duIH0+PjtcbiAgLyoqIFZlcnNpb24gcm93IGZyb20gYWN0aXZpdHlfdmVyc2lvbnMgKHNlcnZpY2Ugcm9sZSkuICovXG4gIHJlYWRWZXJzaW9uKHZlcnNpb25JZDogc3RyaW5nKTogUHJvbWlzZTxEYlJlc3VsdDx7IGNvbnRlbnQ6IHVua25vd24gfT4+O1xuICAvKiogVXBzZXJ0IGtleWVkICh2ZXJzaW9uX2lkLCBzYW5pdGl6ZXJfcmV2KSBcdTIwMTQgY29uY3VycmVudCBtaXNzZXMgd3JpdGUgdGhlXG4gICAqIHNhbWUgZGV0ZXJtaW5pc3RpYyBhcnRpZmFjdCwgc28gbGFzdC13cml0ZS13aW5zIGlzIGhhcm1sZXNzLiAqL1xuICB1cHNlcnRDYWNoZShyb3c6IHtcbiAgICB2ZXJzaW9uX2lkOiBzdHJpbmc7XG4gICAgc2FuaXRpemVyX3Jldjogc3RyaW5nO1xuICAgIHNjaGVtYV92ZXJzaW9uOiBudW1iZXI7XG4gICAgY29udGVudDogdW5rbm93bjtcbiAgfSk6IFByb21pc2U8eyBlcnJvcjogeyBtZXNzYWdlPzogc3RyaW5nIH0gfCBudWxsIH0+O1xuICAvKiogUmVwbGFjZSB0aGlzIHZlcnNpb24ncyBjZW5zdXMgKyBpdGVtLWF0dHJpYnV0aW9uIHJvd3MgKFM3KS4gSWRlbXBvdGVudDpcbiAgICogdGhlIGNlbnN1cyBpcyBhIHB1cmUgZnVuY3Rpb24gb2YgYW4gaW1tdXRhYmxlIHZlcnNpb24sIHNvIGEgcmUtcnVuIHdyaXRlc1xuICAgKiBpZGVudGljYWwgcm93cy4gKi9cbiAgd3JpdGVDZW5zdXMoXG4gICAgdmVyc2lvbklkOiBzdHJpbmcsXG4gICAgY2Vuc3VzOiBWZXJzaW9uQ2Vuc3VzLFxuICApOiBQcm9taXNlPHsgZXJyb3I6IHsgbWVzc2FnZT86IHN0cmluZyB9IHwgbnVsbCB9PjtcbiAgLyoqIERlbGV0ZSB0aGlzIHZlcnNpb24ncyBjYWNoZSByb3dzIHdyaXR0ZW4gdW5kZXIgYW55IE9USEVSIHNhbml0aXplciByZXYgXHUyMDE0XG4gICAqIHRoZSBleGFjdCBoYWxmIG9mIHRoZSBSNihhKSBHQy4gT25seSB0aGlzIGNvZGUga25vd3MgdGhlIGN1cnJlbnQgcmV2LCBzb1xuICAgKiBvbmx5IHRoaXMgY29kZSBjYW4gYmUgcHJlY2lzZSBhYm91dCBpdDsgdGhlIHNjaGVkdWxlZCBqb2Igc3dlZXBzIHRoZSB0YWlsXG4gICAqIG9mIHZlcnNpb25zIHRoYXQgYXJlIG5ldmVyIHJlYWQgYWdhaW4uICovXG4gIGRlbGV0ZVN0YWxlQ2FjaGUoXG4gICAgdmVyc2lvbklkOiBzdHJpbmcsXG4gICAga2VlcFJldjogc3RyaW5nLFxuICApOiBQcm9taXNlPHsgZXJyb3I6IHsgbWVzc2FnZT86IHN0cmluZyB9IHwgbnVsbCB9Pjtcbn1cblxuLyoqIFRoZSBfc2hhcmVkL2NvcnMudHMgaGVscGVyIHN1cmZhY2UgKGVudi1yZWFkaW5nLCBzbyBpdCBzdGF5cyBEZW5vLXNpZGUpLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb3JzS2l0IHtcbiAgY29yc0hlYWRlcnMocmVxOiBSZXF1ZXN0KTogSGVhZGVyc0luaXQ7XG4gIGhhbmRsZVByZWZsaWdodChyZXE6IFJlcXVlc3QpOiBSZXNwb25zZSB8IG51bGw7XG4gIGpzb25SZXNwb25zZShyZXE6IFJlcXVlc3QsIGJvZHk6IHVua25vd24sIGluaXQ/OiBSZXNwb25zZUluaXQpOiBSZXNwb25zZTtcbiAgZXJyb3JSZXNwb25zZShcbiAgICByZXE6IFJlcXVlc3QsXG4gICAgc3RhdHVzOiBudW1iZXIsXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIGRldGFpbHM/OiB1bmtub3duLFxuICApOiBSZXNwb25zZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBHZXRBY3Rpdml0eUhhbmRsZXJEZXBzIHtcbiAgZGI6IEdldEFjdGl2aXR5RGI7XG4gIGNvcnM6IENvcnNLaXQ7XG4gIC8qKiBJbmplY3RhYmxlIGNsb2NrIGZvciB0aGUgcmF0ZSBsaW1pdGVyICh0ZXN0cykuIERlZmF1bHRzIHRvIERhdGUubm93LiAqL1xuICBub3c/OiAoKSA9PiBudW1iZXI7XG59XG5cbi8vIC0tLS0gTWV0YS1icmFuY2ggcmF0ZSBsaW1pdGluZyAocGVyIGlzb2xhdGUgXHUyMDE0IE1FQVNVUkVEIEFTIE5FQVJMWSBJTkVSVCkgLS0tLVxuLy8gQSBzbGlkaW5nIG9uZS1taW51dGUgd2luZG93IHBlciBjbGllbnQgSVAuXG4vL1xuLy8gUkVBRCBUSElTIEJFRk9SRSBDSEFOR0lORyBUSEUgVEhSRVNIT0xEIE9SIEdJVklORyBUSElTIFNIQVJFRCBTVEFURS5cbi8vXG4vLyAqKiBBIENMQVNTUk9PTSBJUyBPTkUgSVAuICoqIEV2ZXJ5IHN0dWRlbnQgaW4gYSBzY2hvb2wgc2l0cyBiZWhpbmQgdGhlIHNhbWVcbi8vIE5BVCwgc28gXCJvcGVuIHRoaXMgbGluayBub3dcIiBwcm9kdWNlcyBvbmUgbWV0YSByZXF1ZXN0IHBlciBzdHVkZW50IFx1MjAxNCAzMCtcbi8vIHdpdGhpbiBzZWNvbmRzLCBodW5kcmVkcyBwZXIgbWludXRlIGF0IGEgYmVsbCBjaGFuZ2UgYWNyb3NzIGEgY2FtcHVzIFx1MjAxNCBhbGxcbi8vIGZyb20gYSBTSU5HTEUgYWRkcmVzcy4gQSBwZXItcGVyc29uIHRocmVzaG9sZCBpcyB0aGVyZWZvcmUgb2ZmIGJ5IH4yIG9yZGVyc1xuLy8gb2YgbWFnbml0dWRlIGFnYWluc3QgdGhlIHJlYWwgdG9wb2xvZ3ksIGFuZCB0aGlzIGVuZHBvaW50IHNlcnZlcyB0aGUgUFJFLUFVVEhcbi8vIGludGVyc3RpdGlhbDogYSA0MjkgaGVyZSBpcyB0aGUgZmlyc3Qgc2NyZWVuIGEgc3R1ZGVudCBldmVyIHNlZXMsIGJlZm9yZSB0aGV5XG4vLyBjYW4gZXZlbiBzaWduIGluLiBUaGUgZmFpbHVyZSB3b3VsZCBwcmVzZW50IGFzIFwic29tZSBzdHVkZW50cyBjYW4ndCBvcGVuIHRoZVxuLy8gYWN0aXZpdHksIG90aGVycyBjYW4sIGFwcGFyZW50bHkgYXQgcmFuZG9tXCIgXHUyMDE0IG1pc2VyYWJsZSB0byBkaWFnbm9zZSBtaWQtY2xhc3MuXG4vLyBUaGUgY2VpbGluZyBiZWxvdyBpcyBkZWxpYmVyYXRlbHkgZ2VuZXJvdXMgZm9yIHRoYXQgcmVhc29uLiBSQUlTSU5HIGl0IGlzXG4vLyBzYWZlOyBMT1dFUklORyBpdCB0b3dhcmQgYSBwZXItcGVyc29uIG51bWJlciBpcyB0aGUgYnVnLlxuLy9cbi8vIFRoaXMgY29uc3RyYWludCBpcyBub3Qgc3BlY2lmaWMgdG8gdGhpcyBmdW5jdGlvbjogcGVyLUlQIGxpbWl0aW5nIGlzIHRoZVxuLy8gd3JvbmcgcHJpbWl0aXZlIGFueXdoZXJlIGluIHRoaXMgcHJvZHVjdCwgYmVjYXVzZSBvdXIgdXNlcnMgYXJyaXZlIHRoaXJ0eS1hdC1cbi8vIGEtdGltZSBmcm9tIG9uZSBhZGRyZXNzLiBTZWUgREVDSVNJT05TLm1kIFx1MjE5MiBcIlJlYWQgQVBJIFMyXCIgKHJhdGUtbGltaXRcbi8vIGZpbmRpbmcpIGJlZm9yZSByZWFjaGluZyBmb3IgSVAtYmFzZWQgdGhyb3R0bGluZyBlbHNld2hlcmUuXG4vL1xuLy8gTUVBU1VSRUQgMjAyNi0wNy0yOCBvbiB0aGUgbGl2ZSBkZXBsb3ltZW50OiA5NSBzZXF1ZW50aWFsIGFub255bW91cyByZXF1ZXN0c1xuLy8gZnJvbSBPTkUgSVAgcHJvZHVjZWQgWkVSTyA0MjlzLiBTdXBhYmFzZSdzIEVkZ2UgUnVudGltZSByZWN5Y2xlcyBpc29sYXRlc1xuLy8gYWdncmVzc2l2ZWx5LCBzbyB0aGlzIHBlci1oYW5kbGVyIE1hcCBpcyBlbXB0eSBvbiBtb3N0IHJlcXVlc3RzIFx1MjAxNCB0aGVcbi8vIGVmZmVjdGl2ZSBsaW1pdCBpcyBmYXIgbG9vc2VyIHRoYW4gdGhlIGNvbnN0YW50cyBpbXBseSwgYW5kIG9uIGEgZGlzdHJpYnV0ZWRcbi8vIGJ1cnN0IGl0IGlzIG5vIGxpbWl0IGF0IGFsbC4gU28gdGhpcyBpcyBvcHBvcnR1bmlzdGljIHRocm90dGxpbmcgb2YgYSBzaW5nbGVcbi8vIGhvdCBpc29sYXRlLCBOT1QgYSBndWFyYW50ZWUgXHUyMDE0IGRvIG5vdCBkZXNjcmliZSBpdCBhcyBvbmUuXG4vL1xuLy8gS2VwdCByYXRoZXIgdGhhbiBkZWxldGVkIGJlY2F1c2UgaXQgY29zdHMgbm90aGluZyBhbmQgZG9lcyBibHVudCBhIHJ1bmF3YXlcbi8vIGNsaWVudC4gV2hhdCBpdCBndWFyZHMgaXMgdGhlIHRpdGxlICsgdGVhY2hlciBkaXNwbGF5IG5hbWUgb2YgYSBQVUJMSVNIRURcbi8vIGFjdGl2aXR5LCB0byBhIGNhbGxlciB3aG8gYWxyZWFkeSBob2xkcyBpdHMgVVVJRCBcdTIwMTQgZGF0YSBldmVyeSBwdWJsaXNoZWQgcGFnZVxuLy8gc2hvd3MgcHVibGljbHkgdG9kYXksIHdpdGggVVVJRCBlbnVtZXJhdGlvbiBpbmZlYXNpYmxlLlxuLy9cbi8vIElmIGEgUkVBTCBsaW1pdCBpcyBldmVyIG5lZWRlZCAodHJpZ2dlcjogdGhpcyByZXNwb25zZSBzdGFydHMgcmV0dXJuaW5nXG4vLyBhbnl0aGluZyByaWNoZXIgdGhhbiB0aG9zZSB0d28gZmllbGRzKSwgaXQgbXVzdCBtb3ZlIHRvIHNoYXJlZCBzdGF0ZSBcdTIwMTQgYVxuLy8gc21hbGwgREIgY291bnRlciB0YWJsZSBcdTIwMTQgYmVjYXVzZSBubyBpbi1tZW1vcnkgc2NoZW1lIGNhbiB3b3JrIGhlcmUuIFBvcnQgdGhlXG4vLyBTQ0hPT0wtU0FGRSBjZWlsaW5nIHdpdGggaXQ7IGRvIG5vdCByZWludHJvZHVjZSBhIHBlci1wZXJzb24gbnVtYmVyLlxuLy9cbi8vIFRoZSBhdXRoZWQgYnJhbmNoZXMgYXJlIE5PVCByYXRlLWxpbWl0ZWQgaGVyZTsgdGhlIEpXVCBpcyB0aGVpciBnYXRlLlxuXG4vKiogSm9pbi1jb2RlIHJlcXVlc3Qgc2hhcGluZzogMDAxNCBtaW50cyA2IGNoYXJzIGZyb20gYSAzMS1jaGFyIGFscGhhYmV0LCBidXRcbiAqIHRoZSBnYXRlIGhlcmUgaXMgZGVsaWJlcmF0ZWx5IGxvb3NlciAoYW55IDRcdTIwMTMxMiBhbHBoYW51bWVyaWNzKSBcdTIwMTQgdGhlIFJQQydzXG4gKiBub3JtYWxpemVkIGxvb2t1cCBpcyB0aGUgcmVhbCBqdWRnZTsgdGhpcyBvbmx5IGJvdW5jZXMgZ2FyYmFnZSBiZWZvcmUgaXRcbiAqIGNvc3RzIGEgcm91bmQgdHJpcC4gVGlnaHRlbmluZyB0aGlzIHRvIHRvZGF5J3MgbWludCBmb3JtYXQgd291bGQgdHVybiBhXG4gKiBmdXR1cmUgY29kZS1mb3JtYXQgY2hhbmdlIGludG8gYSBzaWxlbnQgNDAwLiAqL1xuZXhwb3J0IGNvbnN0IEpPSU5fQ09ERV9SRSA9IC9eW0EtWmEtejAtOV17NCwxMn0kLztcblxuZXhwb3J0IGNvbnN0IE1FVEFfV0lORE9XX01TID0gNjBfMDAwO1xuLyoqIFNjaG9vbC1zYWZlIGNlaWxpbmc6IHNpemVkIGZvciBhIHdob2xlIGNhbXB1cyBiZWhpbmQgb25lIE5BVCBhdCBhIGJlbGxcbiAqIGNoYW5nZSwgbm90IGZvciBvbmUgcGVyc29uLiBTZWUgdGhlIHRvcG9sb2d5IG5vdGUgYWJvdmUuICovXG5leHBvcnQgY29uc3QgTUVUQV9NQVhfUEVSX1dJTkRPVyA9IDYwMDtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1ldGFSYXRlTGltaXRlcihcbiAgbm93OiAoKSA9PiBudW1iZXIgPSBEYXRlLm5vdyxcbik6IChpcDogc3RyaW5nKSA9PiBib29sZWFuIHtcbiAgY29uc3QgbWV0YUhpdHMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyW10+KCk7XG4gIHJldHVybiBmdW5jdGlvbiBtZXRhUmF0ZUxpbWl0ZWQoaXA6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHQgPSBub3coKTtcbiAgICBjb25zdCBoaXRzID0gKG1ldGFIaXRzLmdldChpcCkgPz8gW10pLmZpbHRlcihcbiAgICAgIChoaXQpID0+IHQgLSBoaXQgPCBNRVRBX1dJTkRPV19NUyxcbiAgICApO1xuICAgIGlmIChoaXRzLmxlbmd0aCA+PSBNRVRBX01BWF9QRVJfV0lORE9XKSB7XG4gICAgICBtZXRhSGl0cy5zZXQoaXAsIGhpdHMpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGhpdHMucHVzaCh0KTtcbiAgICBtZXRhSGl0cy5zZXQoaXAsIGhpdHMpO1xuICAgIC8vIEJvdW5kIHRoZSBtYXAgc28gYSBzY2FuIGFjcm9zcyBtYW55IElQcyBjYW4ndCBncm93IG1lbW9yeSB1bmJvdW5kZWQuXG4gICAgaWYgKG1ldGFIaXRzLnNpemUgPiAxMF8wMDApIG1ldGFIaXRzLmNsZWFyKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xufVxuXG4vLyBqd3RTdWIgaXMgaW1wb3J0ZWQgKHNlcnZlci9qd3QudHMsIEcyKSBcdTIwMTQgaXQgd2FzIHBhc3RlZCBieXRlLWlkZW50aWNhbGx5XG4vLyBpbnRvIGJvdGggaGFuZGxlcnM7IHNlZSB0aGF0IGxlYWYgZm9yIHRoZSBuby12ZXJpZmljYXRpb24gcmVhc29uaW5nLlxuXG4vLyAtLS0tIFRoZSBoYW5kbGVyIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlR2V0QWN0aXZpdHlIYW5kbGVyKFxuICBkZXBzOiBHZXRBY3Rpdml0eUhhbmRsZXJEZXBzLFxuKTogKHJlcTogUmVxdWVzdCkgPT4gUHJvbWlzZTxSZXNwb25zZT4ge1xuICBjb25zdCB7IGRiLCBjb3JzIH0gPSBkZXBzO1xuICBjb25zdCBtZXRhUmF0ZUxpbWl0ZWQgPSBjcmVhdGVNZXRhUmF0ZUxpbWl0ZXIoZGVwcy5ub3cgPz8gRGF0ZS5ub3cpO1xuXG4gIHJldHVybiBhc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRBY3Rpdml0eShyZXE6IFJlcXVlc3QpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgY29uc3QgcHJlZmxpZ2h0ID0gY29ycy5oYW5kbGVQcmVmbGlnaHQocmVxKTtcbiAgICBpZiAocHJlZmxpZ2h0KSByZXR1cm4gcHJlZmxpZ2h0O1xuICAgIGlmIChyZXEubWV0aG9kICE9PSAnR0VUJykge1xuICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQwNSwgJ01ldGhvZCBub3QgYWxsb3dlZCcpO1xuICAgIH1cblxuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocmVxLnVybCk7XG4gICAgY29uc3QgYWN0aXZpdHlJZCA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KCdhY3Rpdml0eV9pZCcpID8/ICcnO1xuICAgIGNvbnN0IHZlcnNpb25JZCA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KCd2ZXJzaW9uX2lkJyk7XG4gICAgY29uc3QgbWV0YU9ubHkgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgnbWV0YScpID09PSAnMSc7XG4gICAgY29uc3Qgam9pbkNvZGUgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgnam9pbl9jb2RlJyk7XG5cbiAgICAvLyAtLS0tIDFiLiBDTEFTUyBNRVRBIChhbm9ueW1vdXMpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIEhhbmRsZWQgYmVmb3JlIHRoZSBhY3Rpdml0eV9pZCBzaGFwZSBjaGVjazogdGhpcyBicmFuY2ggaGFzIG5vXG4gICAgLy8gYWN0aXZpdHkuIGpvaW5fY29kZSBleGlzdHMgT05MWSBhcyBhIG1ldGEgbG9va3VwIFx1MjAxNCBhbnkgb3RoZXIgdXNlIG9mIHRoZVxuICAgIC8vIHBhcmFtIGlzIGEgbWFsZm9ybWVkIHJlcXVlc3QsIG5vdCBhIG1vZGUuXG4gICAgaWYgKGpvaW5Db2RlICE9PSBudWxsKSB7XG4gICAgICBpZiAoIW1ldGFPbmx5KSB7XG4gICAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDAsICdqb2luX2NvZGUgcmVxdWlyZXMgbWV0YT0xJyk7XG4gICAgICB9XG4gICAgICBjb25zdCBjb2RlID0gam9pbkNvZGUudHJpbSgpO1xuICAgICAgaWYgKCFKT0lOX0NPREVfUkUudGVzdChjb2RlKSkge1xuICAgICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDAwLCAnam9pbl9jb2RlIG11c3QgYmUgYSBjbGFzcyBjb2RlJyk7XG4gICAgICB9XG4gICAgICBjb25zdCBpcCA9XG4gICAgICAgIHJlcS5oZWFkZXJzLmdldCgneC1mb3J3YXJkZWQtZm9yJyk/LnNwbGl0KCcsJylbMF0/LnRyaW0oKSA/PyAndW5rbm93bic7XG4gICAgICAvLyBUaGUgU0FNRSBsaW1pdGVyIGluc3RhbmNlIGFzIHRoZSBhY3Rpdml0eSBtZXRhIGJyYW5jaCBcdTIwMTQgb25lIGFub255bW91c1xuICAgICAgLy8gd2luZG93IHBlciBJUCBhY3Jvc3MgYm90aCBsb29rdXBzIChQMydzIGxpdmVuZXNzIHJvdyBmaXJlcyBpdCBoZXJlKS5cbiAgICAgIGlmIChtZXRhUmF0ZUxpbWl0ZWQoaXApKSB7XG4gICAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MjksICdUb28gbWFueSByZXF1ZXN0cycpO1xuICAgICAgfVxuICAgICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgZGIuY2xhc3NNZXRhKGNvZGUpO1xuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIGNsYXNzIG1ldGEgUlBDIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDUwMCwgJ0xvb2t1cCBmYWlsZWQnKTtcbiAgICAgIH1cbiAgICAgIC8vIE5vIHJvdyA9IHVua25vd24gb3IgZGVsZXRlZCBjbGFzcyBcdTIwMTQgdGhlIERFRklOSVRJVkUgbmVnYXRpdmUgRFItNidzXG4gICAgICAvLyBwcmUtT0F1dGggd2FybmluZyBrZXlzIG9uIChuZXR3b3JrIGZhaWx1cmUgYWJvdmUgaXMgdGhlIHNpbGVudCBvbmUpLlxuICAgICAgaWYgKCFkYXRhKSByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDA0LCAnTm90IGF2YWlsYWJsZScpO1xuICAgICAgcmV0dXJuIGNvcnMuanNvblJlc3BvbnNlKFxuICAgICAgICByZXEsXG4gICAgICAgIC8vIFRoZSB3aXJlLWxlYWsgY29udHJhY3Q6IHRoZSBjbGFzcyBOQU1FIGFuZCBub3RoaW5nIGVsc2UuXG4gICAgICAgIHsgYXBpX3ZlcnNpb246IEFQSV9WRVJTSU9OLCBjbGFzc19uYW1lOiBkYXRhLm5hbWUgfSxcbiAgICAgICAgeyBoZWFkZXJzOiB7ICdDYWNoZS1Db250cm9sJzogJ25vLWNhY2hlJyB9IH0sXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICghVVVJRF9SRS50ZXN0KGFjdGl2aXR5SWQpKSB7XG4gICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDAwLCAnYWN0aXZpdHlfaWQgbXVzdCBiZSBhIFVVSUQnKTtcbiAgICB9XG5cbiAgICAvLyAtLS0tIDEuIE1FVEEgKGFub255bW91cykgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGlmIChtZXRhT25seSkge1xuICAgICAgY29uc3QgaXAgPVxuICAgICAgICByZXEuaGVhZGVycy5nZXQoJ3gtZm9yd2FyZGVkLWZvcicpPy5zcGxpdCgnLCcpWzBdPy50cmltKCkgPz8gJ3Vua25vd24nO1xuICAgICAgaWYgKG1ldGFSYXRlTGltaXRlZChpcCkpIHtcbiAgICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQyOSwgJ1RvbyBtYW55IHJlcXVlc3RzJyk7XG4gICAgICB9XG4gICAgICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBkYi5wdWJsaWNNZXRhKGFjdGl2aXR5SWQpO1xuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIG1ldGEgUlBDIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDUwMCwgJ0xvb2t1cCBmYWlsZWQnKTtcbiAgICAgIH1cbiAgICAgIGlmICghZGF0YSkgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQwNCwgJ05vdCBhdmFpbGFibGUnKTtcbiAgICAgIHJldHVybiBjb3JzLmpzb25SZXNwb25zZShcbiAgICAgICAgcmVxLFxuICAgICAgICB7XG4gICAgICAgICAgYXBpX3ZlcnNpb246IEFQSV9WRVJTSU9OLFxuICAgICAgICAgIHRpdGxlOiBkYXRhLnRpdGxlLFxuICAgICAgICAgIHRlYWNoZXJfbmFtZTogZGF0YS50ZWFjaGVyX25hbWUsXG4gICAgICAgIH0sXG4gICAgICAgIHsgaGVhZGVyczogeyAnQ2FjaGUtQ29udHJvbCc6ICduby1jYWNoZScgfSB9LFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyAtLS0tIEF1dGggKHJlc29sdmUgKyBjb250ZW50KSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBjb25zdCBhdXRoSGVhZGVyID0gcmVxLmhlYWRlcnMuZ2V0KCdBdXRob3JpemF0aW9uJyk7XG4gICAgaWYgKCFhdXRoSGVhZGVyKSB7XG4gICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDAxLCAnTWlzc2luZyBBdXRob3JpemF0aW9uIGhlYWRlcicpO1xuICAgIH1cblxuICAgIGNvbnN0IHsgZGF0YTogY3VycmVudCwgZXJyb3I6IHJwY0Vycm9yIH0gPSBhd2FpdCBkYi5wdWJsaXNoZWRBY3Rpdml0eShcbiAgICAgIGF1dGhIZWFkZXIsXG4gICAgICBhY3Rpdml0eUlkLFxuICAgICk7XG4gICAgaWYgKHJwY0Vycm9yKSB7XG4gICAgICBjb25zdCBtc2cgPSBycGNFcnJvci5tZXNzYWdlID8/ICcnO1xuICAgICAgLy8gUG9zdGdSRVNUIHN1cmZhY2VzIGEgYmFkL2V4cGlyZWQgSldUIGFzIGEgNDAxLWNsYXNzIGVycm9yOyB0aGUgUlBDXG4gICAgICAvLyByYWlzZXMgJ05vdCBhdmFpbGFibGUnIGZvciBtaXNzaW5nL3VucHVibGlzaGVkL2RlbGV0ZWQgYWN0aXZpdGllcy5cbiAgICAgIGNvbnN0IHN0YXR1cyA9IG1zZy5pbmNsdWRlcygnTm90IGF2YWlsYWJsZScpXG4gICAgICAgID8gNDA0XG4gICAgICAgIDogL0pXVHx0b2tlbnxhdXRoL2kudGVzdChtc2cpXG4gICAgICAgICAgPyA0MDFcbiAgICAgICAgICA6IDUwMDtcbiAgICAgIGlmIChzdGF0dXMgPT09IDUwMCkgY29uc29sZS5lcnJvcignW2dldC1hY3Rpdml0eV0gUlBDIGVycm9yOicsIHJwY0Vycm9yKTtcbiAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UoXG4gICAgICAgIHJlcSxcbiAgICAgICAgc3RhdHVzLFxuICAgICAgICBzdGF0dXMgPT09IDQwNCA/ICdOb3QgYXZhaWxhYmxlJyA6IG1zZyxcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICghY3VycmVudCkgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQwNCwgJ05vdCBhdmFpbGFibGUnKTtcbiAgICBjb25zdCByb3cgPSBjdXJyZW50O1xuXG4gICAgLy8gLS0tLSAyLiBSRVNPTFZFIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaWYgKCF2ZXJzaW9uSWQpIHtcbiAgICAgIHJldHVybiBjb3JzLmpzb25SZXNwb25zZShcbiAgICAgICAgcmVxLFxuICAgICAgICB7XG4gICAgICAgICAgYXBpX3ZlcnNpb246IEFQSV9WRVJTSU9OLFxuICAgICAgICAgIGFjdGl2aXR5X2lkOiBhY3Rpdml0eUlkLFxuICAgICAgICAgIHZlcnNpb25faWQ6IHJvdy52ZXJzaW9uX2lkLFxuICAgICAgICAgIHZlcnNpb25fbnVtOiByb3cudmVyc2lvbl9udW0sXG4gICAgICAgICAgdGl0bGU6IHJvdy50aXRsZSxcbiAgICAgICAgfSxcbiAgICAgICAgeyBoZWFkZXJzOiB7ICdDYWNoZS1Db250cm9sJzogJ25vLWNhY2hlJyB9IH0sXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIC0tLS0gMy4gQ09OVEVOVCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGlmICghVVVJRF9SRS50ZXN0KHZlcnNpb25JZCkpIHtcbiAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDAsICd2ZXJzaW9uX2lkIG11c3QgYmUgYSBVVUlEJyk7XG4gICAgfVxuICAgIGlmICh2ZXJzaW9uSWQgIT09IHJvdy52ZXJzaW9uX2lkKSB7XG4gICAgICAvLyBSZXB1Ymxpc2hlZCBzaW5jZSByZXNvbHZlIFx1MjAxNCB0aGUgdmlld2VyIHJlLXJlc29sdmVzIGFuZCByZWZldGNoZXMuIDQwNFxuICAgICAgLy8gKG5vdCA0MDkpIHNvIG5vIHN0YWxlLVVSTCByZXNwb25zZSBpcyBldmVyIGNhY2hlYWJsZSBhcyBjb250ZW50LlxuICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQwNCwgJ05vdCB0aGUgY3VycmVudCB2ZXJzaW9uJywge1xuICAgICAgICBjb2RlOiAnc3RhbGVfdmVyc2lvbicsXG4gICAgICAgIGN1cnJlbnRfdmVyc2lvbl9pZDogcm93LnZlcnNpb25faWQsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBEdXJhYmxlIHBlci12ZXJzaW9uIGNhY2hlIChhY3Rpdml0eV92ZXJzaW9uX3JlYWRzLCBzZXJ2aWNlLXJvbGUgb25seSkuXG4gICAgbGV0IHNhbml0aXplZDogU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IHsgZGF0YTogY2FjaGVkLCBlcnJvcjogY2FjaGVFcnIgfSA9IGF3YWl0IGRiLnJlYWRDYWNoZShcbiAgICAgIHZlcnNpb25JZCxcbiAgICAgIFNBTklUSVpFUl9SRVYsXG4gICAgKTtcbiAgICBpZiAoY2FjaGVFcnIpIHtcbiAgICAgIC8vIENhY2hlIHJlYWQgZmFpbHVyZSBpcyBub24tZmF0YWwgXHUyMDE0IGZhbGwgdGhyb3VnaCB0byB0aGUgc291cmNlIG9mIHRydXRoLlxuICAgICAgY29uc29sZS5lcnJvcignW2dldC1hY3Rpdml0eV0gY2FjaGUgcmVhZCBmYWlsZWQ6JywgY2FjaGVFcnIpO1xuICAgIH1cbiAgICBpZiAoY2FjaGVkKSB7XG4gICAgICBzYW5pdGl6ZWQgPSBjYWNoZWQuY29udGVudCBhcyBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50O1xuICAgIH1cblxuICAgIGlmICghc2FuaXRpemVkKSB7XG4gICAgICBjb25zdCB7IGRhdGE6IHZlcnNpb24sIGVycm9yOiB2RXJyIH0gPSBhd2FpdCBkYi5yZWFkVmVyc2lvbih2ZXJzaW9uSWQpO1xuICAgICAgaWYgKHZFcnIgfHwgIXZlcnNpb24pIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW2dldC1hY3Rpdml0eV0gdmVyc2lvbiByZWFkIGZhaWxlZDonLCB2RXJyKTtcbiAgICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDUwMCwgJ1ZlcnNpb24gcmVhZCBmYWlsZWQnKTtcbiAgICAgIH1cbiAgICAgIGxldCB1cGdyYWRlZDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHVwZ3JhZGVkID0gdXBncmFkZUFjdGl2aXR5RG9jdW1lbnQodmVyc2lvbi5jb250ZW50KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyBUaGUgZXhwbGljaXQgZmFpbHVyZSBzdGF0ZSB0aGUgZmFpbHVyZS1tb2RlcyB0YWJsZSBwcm9taXNlcyBcdTIwMTQgYVxuICAgICAgICAvLyBzZXJ2ZWQgNTAwIHdpdGggYSByZWFzb24sIG5ldmVyIGEgbWlzLXBhcnNlZCBkb2N1bWVudC5cbiAgICAgICAgY29uc29sZS5lcnJvcignW2dldC1hY3Rpdml0eV0gdXBncmFkZSBmYWlsZWQ6JywgZXJyKTtcbiAgICAgICAgY29uc3QgZGV0YWlsID1cbiAgICAgICAgICBlcnIgaW5zdGFuY2VvZiBVcGdyYWRlRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdVcGdyYWRlIGZhaWxlZCc7XG4gICAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA1MDAsICdBY3Rpdml0eSBjb250ZW50IGNhbm5vdCBiZSBzZXJ2ZWQnLCB7XG4gICAgICAgICAgY29kZTogJ3VwZ3JhZGVfZmFpbGVkJyxcbiAgICAgICAgICBkZXRhaWwsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgc2FuaXRpemVkID0gc2FuaXRpemVBY3Rpdml0eURvY3VtZW50KHVwZ3JhZGVkLmRvYyk7XG5cbiAgICAgIC8vIC0tLS0gQW5hbHl0aWNzIHNpZGUtY2hhbm5lbCAoUzcpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBPUkRFUiBJUyBMT0FELUJFQVJJTkc6IGNlbnN1cyBGSVJTVCwgYW5kIHRoZSBjYWNoZSByb3cgaXMgd3JpdHRlbiBvbmx5XG4gICAgICAvLyBpZiBpdCBzdWNjZWVkZWQgKHJ1bGluZyBTNy05KS5cbiAgICAgIC8vXG4gICAgICAvLyBUaGUgY2FjaGUgcm93IGlzIHdoYXQgbWFrZXMgZXZlcnkgbGF0ZXIgcmVhZCBhIEhJVCBcdTIwMTQgYW5kIGEgSElUIGRvZXMgbm9cbiAgICAgIC8vIGFuYWx5dGljcyB3b3JrIGF0IGFsbC4gU28gd3JpdGluZyB0aGUgY2FjaGUgcm93IGFmdGVyIGEgRkFJTEVEIGNlbnN1c1xuICAgICAgLy8gd291bGQgc3RyYW5kIHRoaXMgdmVyc2lvbiB3aXRoIG5vIGNlbnN1cyB1bnRpbCB0aGUgbmV4dCBTQU5JVElaRVJfUkVWXG4gICAgICAvLyBidW1wLCB3aGlsZSBldmVyeSBjaGVjayBvbiBpdCBhZ2dyZWdhdGVkIGFzIHVuYXR0cmlidXRlZC4gU2lsZW50LCBhbmRcbiAgICAgIC8vIHBlcm1hbmVudC4gV2l0aGhvbGRpbmcgdGhlIGNhY2hlIHJvdyBpbnN0ZWFkIG1lYW5zIHRoZSBuZXh0IHJlYWQgaXNcbiAgICAgIC8vIGFub3RoZXIgbWlzcyB0aGF0IHJldHJpZXMgYm90aDogdGhlIGZhaWx1cmUgc2VsZi1oZWFscywgYW5kIGl0cyBvbmx5XG4gICAgICAvLyBjb3N0IGlzIHJlY29tcHV0aW5nIGEgZG9jdW1lbnQgd2UgYWxyZWFkeSBrbm93IGhvdyB0byByZWNvbXB1dGUuXG4gICAgICAvL1xuICAgICAgLy8gVGhlIGNlbnN1cyBpdHNlbGYgaXMgdG90YWwgKG5ldmVyIHRocm93cyBcdTIwMTQgc2VlIFVOS05PV05fQ0VOU1VTX0tFWSksIHNvXG4gICAgICAvLyB3aGF0IHRoaXMgb3JkZXJpbmcgYWN0dWFsbHkgZ3VhcmRzIGFnYWluc3QgaXMgYSB0cmFuc2llbnQgREIgZmFpbHVyZSxcbiAgICAgIC8vIHdoaWNoIGlzIGV4YWN0bHkgdGhlIGtpbmQgdGhhdCBhIHJldHJ5IGZpeGVzLlxuICAgICAgbGV0IGNlbnN1c09rID0gdHJ1ZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgZXJyb3I6IGNlbnN1c0VyciB9ID0gYXdhaXQgZGIud3JpdGVDZW5zdXMoXG4gICAgICAgICAgdmVyc2lvbklkLFxuICAgICAgICAgIGNlbnN1c09mRG9jdW1lbnQodXBncmFkZWQuZG9jKSxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGNlbnN1c0Vycikge1xuICAgICAgICAgIGNlbnN1c09rID0gZmFsc2U7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignW2dldC1hY3Rpdml0eV0gY2Vuc3VzIHdyaXRlIGZhaWxlZDonLCBjZW5zdXNFcnIpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY2Vuc3VzT2sgPSBmYWxzZTtcbiAgICAgICAgY29uc29sZS5lcnJvcignW2dldC1hY3Rpdml0eV0gY2Vuc3VzIHRocmV3OicsIGVycik7XG4gICAgICB9XG5cbiAgICAgIGlmIChjZW5zdXNPaykge1xuICAgICAgICBjb25zdCB7IGVycm9yOiB1cHNlcnRFcnIgfSA9IGF3YWl0IGRiLnVwc2VydENhY2hlKHtcbiAgICAgICAgICB2ZXJzaW9uX2lkOiB2ZXJzaW9uSWQsXG4gICAgICAgICAgc2FuaXRpemVyX3JldjogU0FOSVRJWkVSX1JFVixcbiAgICAgICAgICBzY2hlbWFfdmVyc2lvbjogdXBncmFkZWQuZG9jLnNjaGVtYVZlcnNpb24sXG4gICAgICAgICAgY29udGVudDogc2FuaXRpemVkLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHVwc2VydEVycikge1xuICAgICAgICAgIC8vIE5vbi1mYXRhbDogdGhlIHJlc3BvbnNlIGlzIGFscmVhZHkgY29tcHV0ZWQ7IHRoZSBuZXh0IHJlcXVlc3RcbiAgICAgICAgICAvLyByZXRyaWVzLlxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIGNhY2hlIHVwc2VydCBmYWlsZWQ6JywgdXBzZXJ0RXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBUaGlzIHZlcnNpb24gaXMgbm93IGNhY2hlZCB1bmRlciB0aGUgQ1VSUkVOVCByZXYsIHNvIGFueSByb3cgaXRcbiAgICAgICAgICAvLyBoYXMgdW5kZXIgYW4gb2xkZXIgcmV2IGlzIGRlYWQgd2VpZ2h0IG5vdGhpbmcgd2lsbCBldmVyIHJlYWQuXG4gICAgICAgICAgY29uc3QgeyBlcnJvcjogZ2NFcnIgfSA9IGF3YWl0IGRiLmRlbGV0ZVN0YWxlQ2FjaGUoXG4gICAgICAgICAgICB2ZXJzaW9uSWQsXG4gICAgICAgICAgICBTQU5JVElaRVJfUkVWLFxuICAgICAgICAgICk7XG4gICAgICAgICAgaWYgKGdjRXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBzdGFsZS1jYWNoZSBHQyBmYWlsZWQ6JywgZ2NFcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHVzZXJJZCA9IGp3dFN1YihhdXRoSGVhZGVyKSA/PyAnYW5vbnltb3VzJztcbiAgICAvLyBzZXJ2ZVNlZWQsIGltcG9ydGVkIChHMSk6IHRoZSBncmFkaW5nIHNpZGUgcmVjb21wdXRlcyB0aGlzIHN0dWRlbnQnc1xuICAgIC8vIGFycmFuZ2VtZW50IGZyb20gdGhlIFNBTUUgc3ltYm9sIFx1MjAxNCB0d28gc3BlbGxpbmdzIGFncmVlaW5nIGJ5IGx1Y2sgd2FzXG4gICAgLy8gdGhlIHMyIHJldHJvJ3Mgc2hhcnBlc3Qgc2VhbSBmaW5kaW5nLlxuICAgIGNvbnN0IHNlcnZlZCA9IGFwcGx5U2VydmVTaHVmZmxlcyhzYW5pdGl6ZWQsIHNlcnZlU2VlZCh2ZXJzaW9uSWQsIHVzZXJJZCkpO1xuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShcbiAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgYXBpX3ZlcnNpb246IEFQSV9WRVJTSU9OLFxuICAgICAgICBhY3Rpdml0eV9pZDogYWN0aXZpdHlJZCxcbiAgICAgICAgdmVyc2lvbjoge1xuICAgICAgICAgIGlkOiB2ZXJzaW9uSWQsXG4gICAgICAgICAgbnVtOiByb3cudmVyc2lvbl9udW0sXG4gICAgICAgICAgc2NoZW1hX3ZlcnNpb246IHNlcnZlZC5zY2hlbWFWZXJzaW9uLFxuICAgICAgICB9LFxuICAgICAgICB0aXRsZTogcm93LnRpdGxlLFxuICAgICAgICBhY3Rpdml0eTogc2VydmVkLFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIHN0YXR1czogMjAwLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgLi4uY29ycy5jb3JzSGVhZGVycyhyZXEpLFxuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgLy8gVmVyc2lvbi1rZXllZCBVUkwgXHUyMTkyIGltbXV0YWJsZS4gcHJpdmF0ZTogc3R1ZGVudCBjb250ZW50IG5ldmVyIGxhbmRzXG4gICAgICAgICAgLy8gaW4gc2hhcmVkIGNhY2hlcy4gQSByZXB1Ymxpc2ggY2hhbmdlcyB0aGUgVVJMIHZpYSByZXNvbHZlLCBzbyB0aGlzXG4gICAgICAgICAgLy8gbmV2ZXIgbmVlZHMgdG8gZXhwaXJlLlxuICAgICAgICAgICdDYWNoZS1Db250cm9sJzogJ3ByaXZhdGUsIG1heC1hZ2U9MzE1MzYwMDAsIGltbXV0YWJsZScsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICk7XG4gIH07XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQU8sSUFBSTtBQUFBLENBQ1YsU0FBVUEsT0FBTTtBQUNiLEVBQUFBLE1BQUssY0FBYyxDQUFDLE1BQU07QUFBQSxFQUFFO0FBQzVCLFdBQVMsU0FBUyxNQUFNO0FBQUEsRUFBRTtBQUMxQixFQUFBQSxNQUFLLFdBQVc7QUFDaEIsV0FBUyxZQUFZLElBQUk7QUFDckIs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UUFBUSxDQUFDLEdBQUcsS0FBSyxLQUFLLFFBQVEsS0FBSztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxNQUFNLFNBQVM7QUFDWCxXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sU0FBUyxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQzNFO0FBQUEsRUFDQSxJQUFJLFNBQVM7QUFDVCxXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sT0FBTyxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQ3pFO0FBQUEsRUFDQSxNQUFNLFNBQVM7QUFDWCxXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sU0FBUyxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQzNFO0FBQUEsRUFDQSxLQUFLLFNBQVM7QUFDVixXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sUUFBUSxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQzFFO0FBQUEsRUFDQSxPQUFPLFNBQVM7QUFDWixXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sVUFBVSxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQzVFO0FBQUEsRUFDQSxLQUFLLFNBQVM7QUFDVixXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sUUFBUSxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQzFFO0FBQUEsRUFDQSxNQUFNLFNBQVM7QUFDWCxXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sU0FBUyxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQzNFO0FBQUEsRUFDQSxLQUFLLFNBQVM7QUFDVixXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sUUFBUSxHQUFHLFVBQVUsU0FBUyxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQzFFO0FBQUEsRUFDQSxPQUFPLFNBQVM7QUFDWixXQUFPLEtBQUssVUFBVSxFQUFFLE1BQU0sVUFBVSxHQUFHLFVBQVUsU0FBUyxP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Q0EsSUFBSSxhQUFhO0FBQ2IsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLFVBQVU7QUFBQSxFQUNqRTtBQUFBLEVBQ0EsSUFBSSxTQUFTO0FBQ1QsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLE1BQU07QUFBQSxFQUM3RDtBQUFBLEVBQ0EsSUFBSSxTQUFTO0FBQ1QsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLE1BQU07QUFBQSxFQUM3RDtBQUFBLEVBQ0EsSUFBSSxhQUFhO0FBQ2IsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLFVBQVU7QUFBQSxFQUNqRTtBQUFBLEVBQ0EsSUFBSSxVQUFVO0FBQ1YsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLE9BQU87QUFBQSxFQUM5RDtBQUFBLEVBQ0EsSUFBSSxRQUFRO0FBQ1IsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLEtBQUs7QUFBQSxFQUM1RDtBQUFBLEVBQ0EsSUFBSSxVQUFVO0FBQ1YsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLE9BQU87QUFBQSxFQUM5RDtBQUFBLEVBQ0EsSUFBSSxTQUFTO0FBQ1QsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLE1BQU07QUFBQSxFQUM3RDtBQUFBLEVBQ0EsSUFBSSxXQUFXO0FBQ1gsV0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLFFBQVE7QUFBQSxFQUMvRDtBQUFBLEVBQ0EsSUFBSSxTQUFTO0FBQ1QsV0FBTyxDQUFDLENBQUMsS0FB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LE9BQU87QUFHTCxnQkFBTSxFQUFFLE9BQU8sTUFBTSxJQUFJLE1BQU0sR0FBRztBQUFBLFlBQ2hDO0FBQUEsWUFDQTtBQUFBLFVBQ0Y7QUFDQSxjQUFJLE9BQU87QUFDVCxvQkFBUSxNQUFNLHlDQUF5QyxLQUFLO0FBQUEsVUFDOUQ7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFFQSxVQUFNLFNBQVMsT0FBTyxVQUFVLEtBQUs7QUFJckMsVUFBTSxTQUFTLG1CQUFtQixXQUFXLFVBQVUsV0FBVyxNQUFNLENBQUM7QUFFekUsV0FBTyxJQUFJO0FBQUEsTUFDVCxLQUFLLFVBQVU7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLFNBQVM7QUFBQSxVQUNQLElBQUk7QUFBQSxVQUNKLEtBQUssSUFBSTtBQUFBLFVBQ1QsZ0JBQWdCLE9BQU87QUFBQSxRQUN6QjtBQUFBLFFBQ0EsT0FBTyxJQUFJO0FBQUEsUUFDWCxVQUFVO0FBQUEsTUFDWixDQUFDO0FBQUEsTUFDRDtBQUFBLFFBQ0UsUUFBUTtBQUFBLFFBQ1IsU0FBUztBQUFBLFVBQ1AsR0FBRyxLQUFLLFlBQVksR0FBRztBQUFBLFVBQ3ZCLGdCQUFnQjtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBSWhCLGlCQUFpQjtBQUFBLFFBQ25CO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbInV0aWwiLCAib2JqZWN0VXRpbCIsICJlcnJvclV0aWwiLCAiZXJyb3JNYXAiLCAiY3R4IiwgInJlc3VsdCIsICJpc3N1ZXMiLCAiZWxlbWVudHMiLCAicHJvY2Vzc2VkIiwgInJlc3VsdCIsICJyIiwgIlpvZEZpcnN0UGFydHlUeXBlS2luZCIsICJ2aXNpdCJdCn0K
