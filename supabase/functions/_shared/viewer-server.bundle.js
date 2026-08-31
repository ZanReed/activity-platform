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
  // Required unit for a 'numeric' blank ({{=1.5 unit: km/h}}): the student
  // types value AND unit in the one input, the server splits and grades both
  // (value within tolerance AND unit accepted — a missing unit is wrong,
  // which is the whole diagnostic). `unit` is the canonical form the teacher
  // answer key shows; `acceptableUnits` are normalized-equal alternates
  // (km/h vs kph). Meaningful only when answerType is 'numeric'; both are
  // answer-key material and ride BLANK_SECRET_FIELDS. Optional with no
  // default so pre-existing documents re-serialize byte-identically.
  unit: external_exports.string().min(1).optional(),
  acceptableUnits: external_exports.array(external_exports.string()).optional(),
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
  "equivalence",
  // The required unit and its alternates are answer-key material: a served
  // unit would prompt the very recall the unit-bearing blank tests.
  "unit",
  "acceptableUnits"
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
    interchangeableWithPrevious: node.interchangeableWithPrevious === true,
    // Unit-bearing numeric blanks: the required unit + accepted alternates.
    ...typeof node.unit === "string" && node.unit.length > 0 ? {
      unit: node.unit,
      ...Array.isArray(node.acceptableUnits) ? {
        acceptableUnits: node.acceptableUnits.filter(
          (u) => typeof u === "string"
        )
      } : {}
    } : {}
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvZXh0ZXJuYWwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvaGVscGVycy91dGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL1pvZEVycm9yLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2xvY2FsZXMvZW4uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvZXJyb3JzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2hlbHBlcnMvcGFyc2VVdGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2hlbHBlcnMvZXJyb3JVdGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL3R5cGVzLmpzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvc2l6aW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2ltYWdlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvZ3JhcGgtcHJpbWl0aXZlcy50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9ncmFwaC1maWd1cmUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9pbmxpbmUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvcGFyYWdyYXBoLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2hlYWRpbmcudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9sYWJlbC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9tYXRoLWJsb2NrLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2NhbGxvdXQudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvcHJvYmxlbS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9maWxsLWluLWJsYW5rLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2xpc3QudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvaW50ZXJhY3RpdmUtZ3JhcGgudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvbXVsdGlwbGUtY2hvaWNlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL21hdGNoaW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL29yZGVyaW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL251bWJlci1saW5lLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2RhdGEtcGxvdC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9sZWFybmluZy1vYmplY3RpdmVzLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL3dvcmtlZC1leGFtcGxlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2ZhZGVkLXdvcmtlZC1leGFtcGxlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL3NlbGYtZXhwbGFuYXRpb24udHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvZnJlZS1yZXNwb25zZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy90YWJsZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9pbmRleC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2xheW91dC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2RvY3VtZW50LnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvdXBncmFkZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3JlZ2lzdHJ5L3JlZ2lzdHJ5LnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2FuaXRpemUvcHJvbXB0Q2FycmllcnMudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9zYW5pdGl6ZS9zYW5pdGl6ZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3Nhbml0aXplL3NodWZmbGUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9jb250YWluZXIvYmxvY2tJbmRleC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3NlcnZlci9ncmFkaW5nL3dhbGsudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9jZW5zdXMvY2Vuc3VzLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2FuaXRpemUvc2VydmVTZWVkLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2VydmVyL2p3dC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3NlcnZlci91dWlkLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2VydmVyL2dldC1hY3Rpdml0eS1oYW5kbGVyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgKiBmcm9tIFwiLi9lcnJvcnMuanNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2hlbHBlcnMvcGFyc2VVdGlsLmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9oZWxwZXJzL3R5cGVBbGlhc2VzLmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9oZWxwZXJzL3V0aWwuanNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3R5cGVzLmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9ab2RFcnJvci5qc1wiO1xuIiwgImV4cG9ydCB2YXIgdXRpbDtcbihmdW5jdGlvbiAodXRpbCkge1xuICAgIHV0aWwuYXNzZXJ0RXF1YWwgPSAoXykgPT4geyB9O1xuICAgIGZ1bmN0aW9uIGFzc2VydElzKF9hcmcpIHsgfVxuICAgIHV0aWwuYXNzZXJ0SXMgPSBhc3NlcnRJcztcbiAgICBmdW5jdGlvbiBhc3NlcnROZXZlcihfeCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB9XG4gICAgdXRpbC5hc3NlcnROZXZlciA9IGFzc2VydE5ldmVyO1xuICAgIHV0aWwuYXJyYXlUb0VudW0gPSAoaXRlbXMpID0+IHtcbiAgICAgICAgY29uc3Qgb2JqID0ge307XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xuICAgICAgICAgICAgb2JqW2l0ZW1dID0gaXRlbTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH07XG4gICAgdXRpbC5nZXRWYWxpZEVudW1WYWx1ZXMgPSAob2JqKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbGlkS2V5cyA9IHV0aWwub2JqZWN0S2V5cyhvYmopLmZpbHRlcigoaykgPT4gdHlwZW9mIG9ialtvYmpba11dICE9PSBcIm51bWJlclwiKTtcbiAgICAgICAgY29uc3QgZmlsdGVyZWQgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrIG9mIHZhbGlkS2V5cykge1xuICAgICAgICAgICAgZmlsdGVyZWRba10gPSBvYmpba107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHV0aWwub2JqZWN0VmFsdWVzKGZpbHRlcmVkKTtcbiAgICB9O1xuICAgIHV0aWwub2JqZWN0VmFsdWVzID0gKG9iaikgPT4ge1xuICAgICAgICByZXR1cm4gdXRpbC5vYmplY3RLZXlzKG9iaikubWFwKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqW2VdO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHV0aWwub2JqZWN0S2V5cyA9IHR5cGVvZiBPYmplY3Qua2V5cyA9PT0gXCJmdW5jdGlvblwiIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFuL2JhblxuICAgICAgICA/IChvYmopID0+IE9iamVjdC5rZXlzKG9iaikgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYW4vYmFuXG4gICAgICAgIDogKG9iamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qga2V5cyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgICAgIH07XG4gICAgdXRpbC5maW5kID0gKGFyciwgY2hlY2tlcikgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgYXJyKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2tlcihpdGVtKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG4gICAgdXRpbC5pc0ludGVnZXIgPSB0eXBlb2YgTnVtYmVyLmlzSW50ZWdlciA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgID8gKHZhbCkgPT4gTnVtYmVyLmlzSW50ZWdlcih2YWwpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFuL2JhblxuICAgICAgICA6ICh2YWwpID0+IHR5cGVvZiB2YWwgPT09IFwibnVtYmVyXCIgJiYgTnVtYmVyLmlzRmluaXRlKHZhbCkgJiYgTWF0aC5mbG9vcih2YWwpID09PSB2YWw7XG4gICAgZnVuY3Rpb24gam9pblZhbHVlcyhhcnJheSwgc2VwYXJhdG9yID0gXCIgfCBcIikge1xuICAgICAgICByZXR1cm4gYXJyYXkubWFwKCh2YWwpID0+ICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiID8gYCcke3ZhbH0nYCA6IHZhbCkpLmpvaW4oc2VwYXJhdG9yKTtcbiAgICB9XG4gICAgdXRpbC5qb2luVmFsdWVzID0gam9pblZhbHVlcztcbiAgICB1dGlsLmpzb25TdHJpbmdpZnlSZXBsYWNlciA9IChfLCB2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJpZ2ludFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbn0pKHV0aWwgfHwgKHV0aWwgPSB7fSkpO1xuZXhwb3J0IHZhciBvYmplY3RVdGlsO1xuKGZ1bmN0aW9uIChvYmplY3RVdGlsKSB7XG4gICAgb2JqZWN0VXRpbC5tZXJnZVNoYXBlcyA9IChmaXJzdCwgc2Vjb25kKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5maXJzdCxcbiAgICAgICAgICAgIC4uLnNlY29uZCwgLy8gc2Vjb25kIG92ZXJ3cml0ZXMgZmlyc3RcbiAgICAgICAgfTtcbiAgICB9O1xufSkob2JqZWN0VXRpbCB8fCAob2JqZWN0VXRpbCA9IHt9KSk7XG5leHBvcnQgY29uc3QgWm9kUGFyc2VkVHlwZSA9IHV0aWwuYXJyYXlUb0VudW0oW1xuICAgIFwic3RyaW5nXCIsXG4gICAgXCJuYW5cIixcbiAgICBcIm51bWJlclwiLFxuICAgIFwiaW50ZWdlclwiLFxuICAgIFwiZmxvYXRcIixcbiAgICBcImJvb2xlYW5cIixcbiAgICBcImRhdGVcIixcbiAgICBcImJpZ2ludFwiLFxuICAgIFwic3ltYm9sXCIsXG4gICAgXCJmdW5jdGlvblwiLFxuICAgIFwidW5kZWZpbmVkXCIsXG4gICAgXCJudWxsXCIsXG4gICAgXCJhcnJheVwiLFxuICAgIFwib2JqZWN0XCIsXG4gICAgXCJ1bmtub3duXCIsXG4gICAgXCJwcm9taXNlXCIsXG4gICAgXCJ2b2lkXCIsXG4gICAgXCJuZXZlclwiLFxuICAgIFwibWFwXCIsXG4gICAgXCJzZXRcIixcbl0pO1xuZXhwb3J0IGNvbnN0IGdldFBhcnNlZFR5cGUgPSAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IHQgPSB0eXBlb2YgZGF0YTtcbiAgICBzd2l0Y2ggKHQpIHtcbiAgICAgICAgY2FzZSBcInVuZGVmaW5lZFwiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkO1xuICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5zdHJpbmc7XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIuaXNOYU4oZGF0YSkgPyBab2RQYXJzZWRUeXBlLm5hbiA6IFpvZFBhcnNlZFR5cGUubnVtYmVyO1xuICAgICAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuYm9vbGVhbjtcbiAgICAgICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5mdW5jdGlvbjtcbiAgICAgICAgY2FzZSBcImJpZ2ludFwiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuYmlnaW50O1xuICAgICAgICBjYXNlIFwic3ltYm9sXCI6XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5zeW1ib2w7XG4gICAgICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuYXJyYXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLm51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YS50aGVuICYmIHR5cGVvZiBkYXRhLnRoZW4gPT09IFwiZnVuY3Rpb25cIiAmJiBkYXRhLmNhdGNoICYmIHR5cGVvZiBkYXRhLmNhdGNoID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5wcm9taXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBNYXAgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLm1hcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgU2V0ICE9PSBcInVuZGVmaW5lZFwiICYmIGRhdGEgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5zZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIERhdGUgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5kYXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUub2JqZWN0O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUudW5rbm93bjtcbiAgICB9XG59O1xuIiwgImltcG9ydCB7IHV0aWwgfSBmcm9tIFwiLi9oZWxwZXJzL3V0aWwuanNcIjtcbmV4cG9ydCBjb25zdCBab2RJc3N1ZUNvZGUgPSB1dGlsLmFycmF5VG9FbnVtKFtcbiAgICBcImludmFsaWRfdHlwZVwiLFxuICAgIFwiaW52YWxpZF9saXRlcmFsXCIsXG4gICAgXCJjdXN0b21cIixcbiAgICBcImludmFsaWRfdW5pb25cIixcbiAgICBcImludmFsaWRfdW5pb25fZGlzY3JpbWluYXRvclwiLFxuICAgIFwiaW52YWxpZF9lbnVtX3ZhbHVlXCIsXG4gICAgXCJ1bnJlY29nbml6ZWRfa2V5c1wiLFxuICAgIFwiaW52YWxpZF9hcmd1bWVudHNcIixcbiAgICBcImludmFsaWRfcmV0dXJuX3R5cGVcIixcbiAgICBcImludmFsaWRfZGF0ZVwiLFxuICAgIFwiaW52YWxpZF9zdHJpbmdcIixcbiAgICBcInRvb19zbWFsbFwiLFxuICAgIFwidG9vX2JpZ1wiLFxuICAgIFwiaW52YWxpZF9pbnRlcnNlY3Rpb25fdHlwZXNcIixcbiAgICBcIm5vdF9tdWx0aXBsZV9vZlwiLFxuICAgIFwibm90X2Zpbml0ZVwiLFxuXSk7XG5leHBvcnQgY29uc3QgcXVvdGVsZXNzSnNvbiA9IChvYmopID0+IHtcbiAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkob2JqLCBudWxsLCAyKTtcbiAgICByZXR1cm4ganNvbi5yZXBsYWNlKC9cIihbXlwiXSspXCI6L2csIFwiJDE6XCIpO1xufTtcbmV4cG9ydCBjbGFzcyBab2RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBnZXQgZXJyb3JzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc3N1ZXM7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGlzc3Vlcykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmlzc3VlcyA9IFtdO1xuICAgICAgICB0aGlzLmFkZElzc3VlID0gKHN1YikgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc3N1ZXMgPSBbLi4udGhpcy5pc3N1ZXMsIHN1Yl07XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkSXNzdWVzID0gKHN1YnMgPSBbXSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc3N1ZXMgPSBbLi4udGhpcy5pc3N1ZXMsIC4uLnN1YnNdO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBhY3R1YWxQcm90byA9IG5ldy50YXJnZXQucHJvdG90eXBlO1xuICAgICAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgYmFuL2JhblxuICAgICAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIGFjdHVhbFByb3RvKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX19wcm90b19fID0gYWN0dWFsUHJvdG87XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5uYW1lID0gXCJab2RFcnJvclwiO1xuICAgICAgICB0aGlzLmlzc3VlcyA9IGlzc3VlcztcbiAgICB9XG4gICAgZm9ybWF0KF9tYXBwZXIpIHtcbiAgICAgICAgY29uc3QgbWFwcGVyID0gX21hcHBlciB8fFxuICAgICAgICAgICAgZnVuY3Rpb24gKGlzc3VlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzc3VlLm1lc3NhZ2U7XG4gICAgICAgICAgICB9O1xuICAgICAgICBjb25zdCBmaWVsZEVycm9ycyA9IHsgX2Vycm9yczogW10gfTtcbiAgICAgICAgY29uc3QgcHJvY2Vzc0Vycm9yID0gKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGlzc3VlIG9mIGVycm9yLmlzc3Vlcykge1xuICAgICAgICAgICAgICAgIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfdW5pb25cIikge1xuICAgICAgICAgICAgICAgICAgICBpc3N1ZS51bmlvbkVycm9ycy5tYXAocHJvY2Vzc0Vycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUuY29kZSA9PT0gXCJpbnZhbGlkX3JldHVybl90eXBlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0Vycm9yKGlzc3VlLnJldHVyblR5cGVFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLmNvZGUgPT09IFwiaW52YWxpZF9hcmd1bWVudHNcIikge1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzRXJyb3IoaXNzdWUuYXJndW1lbnRzRXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS5wYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBmaWVsZEVycm9ycy5fZXJyb3JzLnB1c2gobWFwcGVyKGlzc3VlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VyciA9IGZpZWxkRXJyb3JzO1xuICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgaXNzdWUucGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gaXNzdWUucGF0aFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRlcm1pbmFsID0gaSA9PT0gaXNzdWUucGF0aC5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0ZXJtaW5hbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJbZWxdID0gY3VycltlbF0gfHwgeyBfZXJyb3JzOiBbXSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmICh0eXBlb2YgZWwgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGN1cnJbZWxdID0gY3VycltlbF0gfHwgeyBfZXJyb3JzOiBbXSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIH0gZWxzZSBpZiAodHlwZW9mIGVsID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBjb25zdCBlcnJvckFycmF5OiBhbnkgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGVycm9yQXJyYXkuX2Vycm9ycyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgY3VycltlbF0gPSBjdXJyW2VsXSB8fCBlcnJvckFycmF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJbZWxdID0gY3VycltlbF0gfHwgeyBfZXJyb3JzOiBbXSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJbZWxdLl9lcnJvcnMucHVzaChtYXBwZXIoaXNzdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnIgPSBjdXJyW2VsXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcHJvY2Vzc0Vycm9yKHRoaXMpO1xuICAgICAgICByZXR1cm4gZmllbGRFcnJvcnM7XG4gICAgfVxuICAgIHN0YXRpYyBhc3NlcnQodmFsdWUpIHtcbiAgICAgICAgaWYgKCEodmFsdWUgaW5zdGFuY2VvZiBab2RFcnJvcikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IGEgWm9kRXJyb3I6ICR7dmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lc3NhZ2U7XG4gICAgfVxuICAgIGdldCBtZXNzYWdlKCkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5pc3N1ZXMsIHV0aWwuanNvblN0cmluZ2lmeVJlcGxhY2VyLCAyKTtcbiAgICB9XG4gICAgZ2V0IGlzRW1wdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzc3Vlcy5sZW5ndGggPT09IDA7XG4gICAgfVxuICAgIGZsYXR0ZW4obWFwcGVyID0gKGlzc3VlKSA9PiBpc3N1ZS5tZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IGZpZWxkRXJyb3JzID0ge307XG4gICAgICAgIGNvbnN0IGZvcm1FcnJvcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBzdWIgb2YgdGhpcy5pc3N1ZXMpIHtcbiAgICAgICAgICAgIGlmIChzdWIucGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlyc3RFbCA9IHN1Yi5wYXRoWzBdO1xuICAgICAgICAgICAgICAgIGZpZWxkRXJyb3JzW2ZpcnN0RWxdID0gZmllbGRFcnJvcnNbZmlyc3RFbF0gfHwgW107XG4gICAgICAgICAgICAgICAgZmllbGRFcnJvcnNbZmlyc3RFbF0ucHVzaChtYXBwZXIoc3ViKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3JtRXJyb3JzLnB1c2gobWFwcGVyKHN1YikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IGZvcm1FcnJvcnMsIGZpZWxkRXJyb3JzIH07XG4gICAgfVxuICAgIGdldCBmb3JtRXJyb3JzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mbGF0dGVuKCk7XG4gICAgfVxufVxuWm9kRXJyb3IuY3JlYXRlID0gKGlzc3VlcykgPT4ge1xuICAgIGNvbnN0IGVycm9yID0gbmV3IFpvZEVycm9yKGlzc3Vlcyk7XG4gICAgcmV0dXJuIGVycm9yO1xufTtcbiIsICJpbXBvcnQgeyBab2RJc3N1ZUNvZGUgfSBmcm9tIFwiLi4vWm9kRXJyb3IuanNcIjtcbmltcG9ydCB7IHV0aWwsIFpvZFBhcnNlZFR5cGUgfSBmcm9tIFwiLi4vaGVscGVycy91dGlsLmpzXCI7XG5jb25zdCBlcnJvck1hcCA9IChpc3N1ZSwgX2N0eCkgPT4ge1xuICAgIGxldCBtZXNzYWdlO1xuICAgIHN3aXRjaCAoaXNzdWUuY29kZSkge1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGU6XG4gICAgICAgICAgICBpZiAoaXNzdWUucmVjZWl2ZWQgPT09IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiUmVxdWlyZWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgRXhwZWN0ZWQgJHtpc3N1ZS5leHBlY3RlZH0sIHJlY2VpdmVkICR7aXNzdWUucmVjZWl2ZWR9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX2xpdGVyYWw6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgbGl0ZXJhbCB2YWx1ZSwgZXhwZWN0ZWQgJHtKU09OLnN0cmluZ2lmeShpc3N1ZS5leHBlY3RlZCwgdXRpbC5qc29uU3RyaW5naWZ5UmVwbGFjZXIpfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUudW5yZWNvZ25pemVkX2tleXM6XG4gICAgICAgICAgICBtZXNzYWdlID0gYFVucmVjb2duaXplZCBrZXkocykgaW4gb2JqZWN0OiAke3V0aWwuam9pblZhbHVlcyhpc3N1ZS5rZXlzLCBcIiwgXCIpfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dGA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbl9kaXNjcmltaW5hdG9yOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGRpc2NyaW1pbmF0b3IgdmFsdWUuIEV4cGVjdGVkICR7dXRpbC5qb2luVmFsdWVzKGlzc3VlLm9wdGlvbnMpfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9lbnVtX3ZhbHVlOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGVudW0gdmFsdWUuIEV4cGVjdGVkICR7dXRpbC5qb2luVmFsdWVzKGlzc3VlLm9wdGlvbnMpfSwgcmVjZWl2ZWQgJyR7aXNzdWUucmVjZWl2ZWR9J2A7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9hcmd1bWVudHM6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgZnVuY3Rpb24gYXJndW1lbnRzYDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX3JldHVybl90eXBlOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGZ1bmN0aW9uIHJldHVybiB0eXBlYDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX2RhdGU6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgZGF0ZWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmc6XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlzc3VlLnZhbGlkYXRpb24gPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoXCJpbmNsdWRlc1wiIGluIGlzc3VlLnZhbGlkYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGlucHV0OiBtdXN0IGluY2x1ZGUgXCIke2lzc3VlLnZhbGlkYXRpb24uaW5jbHVkZXN9XCJgO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlzc3VlLnZhbGlkYXRpb24ucG9zaXRpb24gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgJHttZXNzYWdlfSBhdCBvbmUgb3IgbW9yZSBwb3NpdGlvbnMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvICR7aXNzdWUudmFsaWRhdGlvbi5wb3NpdGlvbn1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFwic3RhcnRzV2l0aFwiIGluIGlzc3VlLnZhbGlkYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGlucHV0OiBtdXN0IHN0YXJ0IHdpdGggXCIke2lzc3VlLnZhbGlkYXRpb24uc3RhcnRzV2l0aH1cImA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFwiZW5kc1dpdGhcIiBpbiBpc3N1ZS52YWxpZGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dDogbXVzdCBlbmQgd2l0aCBcIiR7aXNzdWUudmFsaWRhdGlvbi5lbmRzV2l0aH1cImA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGlzc3VlLnZhbGlkYXRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnZhbGlkYXRpb24gIT09IFwicmVnZXhcIikge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCAke2lzc3VlLnZhbGlkYXRpb259YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkludmFsaWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS50b29fc21hbGw6XG4gICAgICAgICAgICBpZiAoaXNzdWUudHlwZSA9PT0gXCJhcnJheVwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgQXJyYXkgbXVzdCBjb250YWluICR7aXNzdWUuZXhhY3QgPyBcImV4YWN0bHlcIiA6IGlzc3VlLmluY2x1c2l2ZSA/IGBhdCBsZWFzdGAgOiBgbW9yZSB0aGFuYH0gJHtpc3N1ZS5taW5pbXVtfSBlbGVtZW50KHMpYDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwic3RyaW5nXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBTdHJpbmcgbXVzdCBjb250YWluICR7aXNzdWUuZXhhY3QgPyBcImV4YWN0bHlcIiA6IGlzc3VlLmluY2x1c2l2ZSA/IGBhdCBsZWFzdGAgOiBgb3ZlcmB9ICR7aXNzdWUubWluaW11bX0gY2hhcmFjdGVyKHMpYDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwibnVtYmVyXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBOdW1iZXIgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHkgZXF1YWwgdG8gYCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gYCA6IGBncmVhdGVyIHRoYW4gYH0ke2lzc3VlLm1pbmltdW19YDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwiYmlnaW50XCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBOdW1iZXIgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHkgZXF1YWwgdG8gYCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gYCA6IGBncmVhdGVyIHRoYW4gYH0ke2lzc3VlLm1pbmltdW19YDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwiZGF0ZVwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgRGF0ZSBtdXN0IGJlICR7aXNzdWUuZXhhY3QgPyBgZXhhY3RseSBlcXVhbCB0byBgIDogaXNzdWUuaW5jbHVzaXZlID8gYGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBgIDogYGdyZWF0ZXIgdGhhbiBgfSR7bmV3IERhdGUoTnVtYmVyKGlzc3VlLm1pbmltdW0pKX1gO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkludmFsaWQgaW5wdXRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS50b29fYmlnOlxuICAgICAgICAgICAgaWYgKGlzc3VlLnR5cGUgPT09IFwiYXJyYXlcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEFycmF5IG11c3QgY29udGFpbiAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYGF0IG1vc3RgIDogYGxlc3MgdGhhbmB9ICR7aXNzdWUubWF4aW11bX0gZWxlbWVudChzKWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcInN0cmluZ1wiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgU3RyaW5nIG11c3QgY29udGFpbiAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYGF0IG1vc3RgIDogYHVuZGVyYH0gJHtpc3N1ZS5tYXhpbXVtfSBjaGFyYWN0ZXIocylgO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJudW1iZXJcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYE51bWJlciBtdXN0IGJlICR7aXNzdWUuZXhhY3QgPyBgZXhhY3RseWAgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgbGVzcyB0aGFuIG9yIGVxdWFsIHRvYCA6IGBsZXNzIHRoYW5gfSAke2lzc3VlLm1heGltdW19YDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwiYmlnaW50XCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBCaWdJbnQgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYGxlc3MgdGhhbiBvciBlcXVhbCB0b2AgOiBgbGVzcyB0aGFuYH0gJHtpc3N1ZS5tYXhpbXVtfWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcImRhdGVcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYERhdGUgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYHNtYWxsZXIgdGhhbiBvciBlcXVhbCB0b2AgOiBgc21hbGxlciB0aGFuYH0gJHtuZXcgRGF0ZShOdW1iZXIoaXNzdWUubWF4aW11bSkpfWA7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiSW52YWxpZCBpbnB1dFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmN1c3RvbTpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dGA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9pbnRlcnNlY3Rpb25fdHlwZXM6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludGVyc2VjdGlvbiByZXN1bHRzIGNvdWxkIG5vdCBiZSBtZXJnZWRgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLm5vdF9tdWx0aXBsZV9vZjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgTnVtYmVyIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAke2lzc3VlLm11bHRpcGxlT2Z9YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5ub3RfZmluaXRlOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiTnVtYmVyIG11c3QgYmUgZmluaXRlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBfY3R4LmRlZmF1bHRFcnJvcjtcbiAgICAgICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoaXNzdWUpO1xuICAgIH1cbiAgICByZXR1cm4geyBtZXNzYWdlIH07XG59O1xuZXhwb3J0IGRlZmF1bHQgZXJyb3JNYXA7XG4iLCAiaW1wb3J0IGRlZmF1bHRFcnJvck1hcCBmcm9tIFwiLi9sb2NhbGVzL2VuLmpzXCI7XG5sZXQgb3ZlcnJpZGVFcnJvck1hcCA9IGRlZmF1bHRFcnJvck1hcDtcbmV4cG9ydCB7IGRlZmF1bHRFcnJvck1hcCB9O1xuZXhwb3J0IGZ1bmN0aW9uIHNldEVycm9yTWFwKG1hcCkge1xuICAgIG92ZXJyaWRlRXJyb3JNYXAgPSBtYXA7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0RXJyb3JNYXAoKSB7XG4gICAgcmV0dXJuIG92ZXJyaWRlRXJyb3JNYXA7XG59XG4iLCAiaW1wb3J0IHsgZ2V0RXJyb3JNYXAgfSBmcm9tIFwiLi4vZXJyb3JzLmpzXCI7XG5pbXBvcnQgZGVmYXVsdEVycm9yTWFwIGZyb20gXCIuLi9sb2NhbGVzL2VuLmpzXCI7XG5leHBvcnQgY29uc3QgbWFrZUlzc3VlID0gKHBhcmFtcykgPT4ge1xuICAgIGNvbnN0IHsgZGF0YSwgcGF0aCwgZXJyb3JNYXBzLCBpc3N1ZURhdGEgfSA9IHBhcmFtcztcbiAgICBjb25zdCBmdWxsUGF0aCA9IFsuLi5wYXRoLCAuLi4oaXNzdWVEYXRhLnBhdGggfHwgW10pXTtcbiAgICBjb25zdCBmdWxsSXNzdWUgPSB7XG4gICAgICAgIC4uLmlzc3VlRGF0YSxcbiAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgfTtcbiAgICBpZiAoaXNzdWVEYXRhLm1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uaXNzdWVEYXRhLFxuICAgICAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgICAgICAgICBtZXNzYWdlOiBpc3N1ZURhdGEubWVzc2FnZSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgbGV0IGVycm9yTWVzc2FnZSA9IFwiXCI7XG4gICAgY29uc3QgbWFwcyA9IGVycm9yTWFwc1xuICAgICAgICAuZmlsdGVyKChtKSA9PiAhIW0pXG4gICAgICAgIC5zbGljZSgpXG4gICAgICAgIC5yZXZlcnNlKCk7XG4gICAgZm9yIChjb25zdCBtYXAgb2YgbWFwcykge1xuICAgICAgICBlcnJvck1lc3NhZ2UgPSBtYXAoZnVsbElzc3VlLCB7IGRhdGEsIGRlZmF1bHRFcnJvcjogZXJyb3JNZXNzYWdlIH0pLm1lc3NhZ2U7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIC4uLmlzc3VlRGF0YSxcbiAgICAgICAgcGF0aDogZnVsbFBhdGgsXG4gICAgICAgIG1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICB9O1xufTtcbmV4cG9ydCBjb25zdCBFTVBUWV9QQVRIID0gW107XG5leHBvcnQgZnVuY3Rpb24gYWRkSXNzdWVUb0NvbnRleHQoY3R4LCBpc3N1ZURhdGEpIHtcbiAgICBjb25zdCBvdmVycmlkZU1hcCA9IGdldEVycm9yTWFwKCk7XG4gICAgY29uc3QgaXNzdWUgPSBtYWtlSXNzdWUoe1xuICAgICAgICBpc3N1ZURhdGE6IGlzc3VlRGF0YSxcbiAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICBlcnJvck1hcHM6IFtcbiAgICAgICAgICAgIGN0eC5jb21tb24uY29udGV4dHVhbEVycm9yTWFwLCAvLyBjb250ZXh0dWFsIGVycm9yIG1hcCBpcyBmaXJzdCBwcmlvcml0eVxuICAgICAgICAgICAgY3R4LnNjaGVtYUVycm9yTWFwLCAvLyB0aGVuIHNjaGVtYS1ib3VuZCBtYXAgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgICBvdmVycmlkZU1hcCwgLy8gdGhlbiBnbG9iYWwgb3ZlcnJpZGUgbWFwXG4gICAgICAgICAgICBvdmVycmlkZU1hcCA9PT0gZGVmYXVsdEVycm9yTWFwID8gdW5kZWZpbmVkIDogZGVmYXVsdEVycm9yTWFwLCAvLyB0aGVuIGdsb2JhbCBkZWZhdWx0IG1hcFxuICAgICAgICBdLmZpbHRlcigoeCkgPT4gISF4KSxcbiAgICB9KTtcbiAgICBjdHguY29tbW9uLmlzc3Vlcy5wdXNoKGlzc3VlKTtcbn1cbmV4cG9ydCBjbGFzcyBQYXJzZVN0YXR1cyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSBcInZhbGlkXCI7XG4gICAgfVxuICAgIGRpcnR5KCkge1xuICAgICAgICBpZiAodGhpcy52YWx1ZSA9PT0gXCJ2YWxpZFwiKVxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFwiZGlydHlcIjtcbiAgICB9XG4gICAgYWJvcnQoKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlICE9PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBcImFib3J0ZWRcIjtcbiAgICB9XG4gICAgc3RhdGljIG1lcmdlQXJyYXkoc3RhdHVzLCByZXN1bHRzKSB7XG4gICAgICAgIGNvbnN0IGFycmF5VmFsdWUgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBzIG9mIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmIChzLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICBpZiAocy5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIGFycmF5VmFsdWUucHVzaChzLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGFycmF5VmFsdWUgfTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIG1lcmdlT2JqZWN0QXN5bmMoc3RhdHVzLCBwYWlycykge1xuICAgICAgICBjb25zdCBzeW5jUGFpcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHBhaXJzKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBwYWlyLmtleTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgcGFpci52YWx1ZTtcbiAgICAgICAgICAgIHN5bmNQYWlycy5wdXNoKHtcbiAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VPYmplY3RTeW5jKHN0YXR1cywgc3luY1BhaXJzKTtcbiAgICB9XG4gICAgc3RhdGljIG1lcmdlT2JqZWN0U3luYyhzdGF0dXMsIHBhaXJzKSB7XG4gICAgICAgIGNvbnN0IGZpbmFsT2JqZWN0ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgY29uc3QgeyBrZXksIHZhbHVlIH0gPSBwYWlyO1xuICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgaWYgKHZhbHVlLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICBpZiAoa2V5LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgaWYgKHZhbHVlLnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgaWYgKGtleS52YWx1ZSAhPT0gXCJfX3Byb3RvX19cIiAmJiAodHlwZW9mIHZhbHVlLnZhbHVlICE9PSBcInVuZGVmaW5lZFwiIHx8IHBhaXIuYWx3YXlzU2V0KSkge1xuICAgICAgICAgICAgICAgIGZpbmFsT2JqZWN0W2tleS52YWx1ZV0gPSB2YWx1ZS52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGZpbmFsT2JqZWN0IH07XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IElOVkFMSUQgPSBPYmplY3QuZnJlZXplKHtcbiAgICBzdGF0dXM6IFwiYWJvcnRlZFwiLFxufSk7XG5leHBvcnQgY29uc3QgRElSVFkgPSAodmFsdWUpID0+ICh7IHN0YXR1czogXCJkaXJ0eVwiLCB2YWx1ZSB9KTtcbmV4cG9ydCBjb25zdCBPSyA9ICh2YWx1ZSkgPT4gKHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlIH0pO1xuZXhwb3J0IGNvbnN0IGlzQWJvcnRlZCA9ICh4KSA9PiB4LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCI7XG5leHBvcnQgY29uc3QgaXNEaXJ0eSA9ICh4KSA9PiB4LnN0YXR1cyA9PT0gXCJkaXJ0eVwiO1xuZXhwb3J0IGNvbnN0IGlzVmFsaWQgPSAoeCkgPT4geC5zdGF0dXMgPT09IFwidmFsaWRcIjtcbmV4cG9ydCBjb25zdCBpc0FzeW5jID0gKHgpID0+IHR5cGVvZiBQcm9taXNlICE9PSBcInVuZGVmaW5lZFwiICYmIHggaW5zdGFuY2VvZiBQcm9taXNlO1xuIiwgImV4cG9ydCB2YXIgZXJyb3JVdGlsO1xuKGZ1bmN0aW9uIChlcnJvclV0aWwpIHtcbiAgICBlcnJvclV0aWwuZXJyVG9PYmogPSAobWVzc2FnZSkgPT4gdHlwZW9mIG1lc3NhZ2UgPT09IFwic3RyaW5nXCIgPyB7IG1lc3NhZ2UgfSA6IG1lc3NhZ2UgfHwge307XG4gICAgLy8gYmlvbWUtaWdub3JlIGxpbnQ6XG4gICAgZXJyb3JVdGlsLnRvU3RyaW5nID0gKG1lc3NhZ2UpID0+IHR5cGVvZiBtZXNzYWdlID09PSBcInN0cmluZ1wiID8gbWVzc2FnZSA6IG1lc3NhZ2U/Lm1lc3NhZ2U7XG59KShlcnJvclV0aWwgfHwgKGVycm9yVXRpbCA9IHt9KSk7XG4iLCAiaW1wb3J0IHsgWm9kRXJyb3IsIFpvZElzc3VlQ29kZSwgfSBmcm9tIFwiLi9ab2RFcnJvci5qc1wiO1xuaW1wb3J0IHsgZGVmYXVsdEVycm9yTWFwLCBnZXRFcnJvck1hcCB9IGZyb20gXCIuL2Vycm9ycy5qc1wiO1xuaW1wb3J0IHsgZXJyb3JVdGlsIH0gZnJvbSBcIi4vaGVscGVycy9lcnJvclV0aWwuanNcIjtcbmltcG9ydCB7IERJUlRZLCBJTlZBTElELCBPSywgUGFyc2VTdGF0dXMsIGFkZElzc3VlVG9Db250ZXh0LCBpc0Fib3J0ZWQsIGlzQXN5bmMsIGlzRGlydHksIGlzVmFsaWQsIG1ha2VJc3N1ZSwgfSBmcm9tIFwiLi9oZWxwZXJzL3BhcnNlVXRpbC5qc1wiO1xuaW1wb3J0IHsgdXRpbCwgWm9kUGFyc2VkVHlwZSwgZ2V0UGFyc2VkVHlwZSB9IGZyb20gXCIuL2hlbHBlcnMvdXRpbC5qc1wiO1xuY2xhc3MgUGFyc2VJbnB1dExhenlQYXRoIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIHZhbHVlLCBwYXRoLCBrZXkpIHtcbiAgICAgICAgdGhpcy5fY2FjaGVkUGF0aCA9IFtdO1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgdGhpcy5kYXRhID0gdmFsdWU7XG4gICAgICAgIHRoaXMuX3BhdGggPSBwYXRoO1xuICAgICAgICB0aGlzLl9rZXkgPSBrZXk7XG4gICAgfVxuICAgIGdldCBwYXRoKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlZFBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLl9rZXkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVkUGF0aC5wdXNoKC4uLnRoaXMuX3BhdGgsIC4uLnRoaXMuX2tleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZWRQYXRoLnB1c2goLi4udGhpcy5fcGF0aCwgdGhpcy5fa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkUGF0aDtcbiAgICB9XG59XG5jb25zdCBoYW5kbGVSZXN1bHQgPSAoY3R4LCByZXN1bHQpID0+IHtcbiAgICBpZiAoaXNWYWxpZChyZXN1bHQpKSB7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdC52YWx1ZSB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKCFjdHguY29tbW9uLmlzc3Vlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlZhbGlkYXRpb24gZmFpbGVkIGJ1dCBubyBpc3N1ZXMgZGV0ZWN0ZWQuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGdldCBlcnJvcigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9lcnJvcjtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBab2RFcnJvcihjdHguY29tbW9uLmlzc3Vlcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZXJyb3I7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cbn07XG5mdW5jdGlvbiBwcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcykge1xuICAgIGlmICghcGFyYW1zKVxuICAgICAgICByZXR1cm4ge307XG4gICAgY29uc3QgeyBlcnJvck1hcCwgaW52YWxpZF90eXBlX2Vycm9yLCByZXF1aXJlZF9lcnJvciwgZGVzY3JpcHRpb24gfSA9IHBhcmFtcztcbiAgICBpZiAoZXJyb3JNYXAgJiYgKGludmFsaWRfdHlwZV9lcnJvciB8fCByZXF1aXJlZF9lcnJvcikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCB1c2UgXCJpbnZhbGlkX3R5cGVfZXJyb3JcIiBvciBcInJlcXVpcmVkX2Vycm9yXCIgaW4gY29uanVuY3Rpb24gd2l0aCBjdXN0b20gZXJyb3IgbWFwLmApO1xuICAgIH1cbiAgICBpZiAoZXJyb3JNYXApXG4gICAgICAgIHJldHVybiB7IGVycm9yTWFwOiBlcnJvck1hcCwgZGVzY3JpcHRpb24gfTtcbiAgICBjb25zdCBjdXN0b21NYXAgPSAoaXNzLCBjdHgpID0+IHtcbiAgICAgICAgY29uc3QgeyBtZXNzYWdlIH0gPSBwYXJhbXM7XG4gICAgICAgIGlmIChpc3MuY29kZSA9PT0gXCJpbnZhbGlkX2VudW1fdmFsdWVcIikge1xuICAgICAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogbWVzc2FnZSA/PyBjdHguZGVmYXVsdEVycm9yIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBjdHguZGF0YSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogbWVzc2FnZSA/PyByZXF1aXJlZF9lcnJvciA/PyBjdHguZGVmYXVsdEVycm9yIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzcy5jb2RlICE9PSBcImludmFsaWRfdHlwZVwiKVxuICAgICAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogY3R4LmRlZmF1bHRFcnJvciB9O1xuICAgICAgICByZXR1cm4geyBtZXNzYWdlOiBtZXNzYWdlID8/IGludmFsaWRfdHlwZV9lcnJvciA/PyBjdHguZGVmYXVsdEVycm9yIH07XG4gICAgfTtcbiAgICByZXR1cm4geyBlcnJvck1hcDogY3VzdG9tTWFwLCBkZXNjcmlwdGlvbiB9O1xufVxuZXhwb3J0IGNsYXNzIFpvZFR5cGUge1xuICAgIGdldCBkZXNjcmlwdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5kZXNjcmlwdGlvbjtcbiAgICB9XG4gICAgX2dldFR5cGUoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIGdldFBhcnNlZFR5cGUoaW5wdXQuZGF0YSk7XG4gICAgfVxuICAgIF9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KSB7XG4gICAgICAgIHJldHVybiAoY3R4IHx8IHtcbiAgICAgICAgICAgIGNvbW1vbjogaW5wdXQucGFyZW50LmNvbW1vbixcbiAgICAgICAgICAgIGRhdGE6IGlucHV0LmRhdGEsXG4gICAgICAgICAgICBwYXJzZWRUeXBlOiBnZXRQYXJzZWRUeXBlKGlucHV0LmRhdGEpLFxuICAgICAgICAgICAgc2NoZW1hRXJyb3JNYXA6IHRoaXMuX2RlZi5lcnJvck1hcCxcbiAgICAgICAgICAgIHBhdGg6IGlucHV0LnBhdGgsXG4gICAgICAgICAgICBwYXJlbnQ6IGlucHV0LnBhcmVudCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1czogbmV3IFBhcnNlU3RhdHVzKCksXG4gICAgICAgICAgICBjdHg6IHtcbiAgICAgICAgICAgICAgICBjb21tb246IGlucHV0LnBhcmVudC5jb21tb24sXG4gICAgICAgICAgICAgICAgZGF0YTogaW5wdXQuZGF0YSxcbiAgICAgICAgICAgICAgICBwYXJzZWRUeXBlOiBnZXRQYXJzZWRUeXBlKGlucHV0LmRhdGEpLFxuICAgICAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICAgICAgcGF0aDogaW5wdXQucGF0aCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGlucHV0LnBhcmVudCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIF9wYXJzZVN5bmMoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcGFyc2UoaW5wdXQpO1xuICAgICAgICBpZiAoaXNBc3luYyhyZXN1bHQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTeW5jaHJvbm91cyBwYXJzZSBlbmNvdW50ZXJlZCBwcm9taXNlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBfcGFyc2VBc3luYyhpbnB1dCkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wYXJzZShpbnB1dCk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzdWx0KTtcbiAgICB9XG4gICAgcGFyc2UoZGF0YSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuc2FmZVBhcnNlKGRhdGEsIHBhcmFtcyk7XG4gICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcylcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuZGF0YTtcbiAgICAgICAgdGhyb3cgcmVzdWx0LmVycm9yO1xuICAgIH1cbiAgICBzYWZlUGFyc2UoZGF0YSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgYXN5bmM6IHBhcmFtcz8uYXN5bmMgPz8gZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGV4dHVhbEVycm9yTWFwOiBwYXJhbXM/LmVycm9yTWFwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IHBhcmFtcz8ucGF0aCB8fCBbXSxcbiAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGFyc2VkVHlwZTogZ2V0UGFyc2VkVHlwZShkYXRhKSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcGFyc2VTeW5jKHsgZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pO1xuICAgICAgICByZXR1cm4gaGFuZGxlUmVzdWx0KGN0eCwgcmVzdWx0KTtcbiAgICB9XG4gICAgXCJ+dmFsaWRhdGVcIihkYXRhKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgYXN5bmM6ICEhdGhpc1tcIn5zdGFuZGFyZFwiXS5hc3luYyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBbXSxcbiAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGFyc2VkVHlwZTogZ2V0UGFyc2VkVHlwZShkYXRhKSxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCF0aGlzW1wifnN0YW5kYXJkXCJdLmFzeW5jKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3BhcnNlU3luYyh7IGRhdGEsIHBhdGg6IFtdLCBwYXJlbnQ6IGN0eCB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNWYWxpZChyZXN1bHQpXG4gICAgICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzc3VlczogY3R4LmNvbW1vbi5pc3N1ZXMsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycj8ubWVzc2FnZT8udG9Mb3dlckNhc2UoKT8uaW5jbHVkZXMoXCJlbmNvdW50ZXJlZFwiKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW1wifnN0YW5kYXJkXCJdLmFzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3R4LmNvbW1vbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgYXN5bmM6IHRydWUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fcGFyc2VBc3luYyh7IGRhdGEsIHBhdGg6IFtdLCBwYXJlbnQ6IGN0eCB9KS50aGVuKChyZXN1bHQpID0+IGlzVmFsaWQocmVzdWx0KVxuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogY3R4LmNvbW1vbi5pc3N1ZXMsXG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMgcGFyc2VBc3luYyhkYXRhLCBwYXJhbXMpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zYWZlUGFyc2VBc3luYyhkYXRhLCBwYXJhbXMpO1xuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LmRhdGE7XG4gICAgICAgIHRocm93IHJlc3VsdC5lcnJvcjtcbiAgICB9XG4gICAgYXN5bmMgc2FmZVBhcnNlQXN5bmMoZGF0YSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHtcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgY29udGV4dHVhbEVycm9yTWFwOiBwYXJhbXM/LmVycm9yTWFwLFxuICAgICAgICAgICAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IHBhcmFtcz8ucGF0aCB8fCBbXSxcbiAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGFyc2VkVHlwZTogZ2V0UGFyc2VkVHlwZShkYXRhKSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgbWF5YmVBc3luY1Jlc3VsdCA9IHRoaXMuX3BhcnNlKHsgZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCAoaXNBc3luYyhtYXliZUFzeW5jUmVzdWx0KSA/IG1heWJlQXN5bmNSZXN1bHQgOiBQcm9taXNlLnJlc29sdmUobWF5YmVBc3luY1Jlc3VsdCkpO1xuICAgICAgICByZXR1cm4gaGFuZGxlUmVzdWx0KGN0eCwgcmVzdWx0KTtcbiAgICB9XG4gICAgcmVmaW5lKGNoZWNrLCBtZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IGdldElzc3VlUHJvcGVydGllcyA9ICh2YWwpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgbWVzc2FnZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IG1lc3NhZ2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBtZXNzYWdlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZSh2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZpbmVtZW50KCh2YWwsIGN0eCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gY2hlY2sodmFsKTtcbiAgICAgICAgICAgIGNvbnN0IHNldEVycm9yID0gKCkgPT4gY3R4LmFkZElzc3VlKHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuY3VzdG9tLFxuICAgICAgICAgICAgICAgIC4uLmdldElzc3VlUHJvcGVydGllcyh2YWwpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIFByb21pc2UgIT09IFwidW5kZWZpbmVkXCIgJiYgcmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBzZXRFcnJvcigpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVmaW5lbWVudChjaGVjaywgcmVmaW5lbWVudERhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmluZW1lbnQoKHZhbCwgY3R4KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWNoZWNrKHZhbCkpIHtcbiAgICAgICAgICAgICAgICBjdHguYWRkSXNzdWUodHlwZW9mIHJlZmluZW1lbnREYXRhID09PSBcImZ1bmN0aW9uXCIgPyByZWZpbmVtZW50RGF0YSh2YWwsIGN0eCkgOiByZWZpbmVtZW50RGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfcmVmaW5lbWVudChyZWZpbmVtZW50KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRWZmZWN0cyh7XG4gICAgICAgICAgICBzY2hlbWE6IHRoaXMsXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVmZmVjdHMsXG4gICAgICAgICAgICBlZmZlY3Q6IHsgdHlwZTogXCJyZWZpbmVtZW50XCIsIHJlZmluZW1lbnQgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN1cGVyUmVmaW5lKHJlZmluZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmluZW1lbnQocmVmaW5lbWVudCk7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGRlZikge1xuICAgICAgICAvKiogQWxpYXMgb2Ygc2FmZVBhcnNlQXN5bmMgKi9cbiAgICAgICAgdGhpcy5zcGEgPSB0aGlzLnNhZmVQYXJzZUFzeW5jO1xuICAgICAgICB0aGlzLl9kZWYgPSBkZWY7XG4gICAgICAgIHRoaXMucGFyc2UgPSB0aGlzLnBhcnNlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc2FmZVBhcnNlID0gdGhpcy5zYWZlUGFyc2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5wYXJzZUFzeW5jID0gdGhpcy5wYXJzZUFzeW5jLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc2FmZVBhcnNlQXN5bmMgPSB0aGlzLnNhZmVQYXJzZUFzeW5jLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc3BhID0gdGhpcy5zcGEuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5yZWZpbmUgPSB0aGlzLnJlZmluZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnJlZmluZW1lbnQgPSB0aGlzLnJlZmluZW1lbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zdXBlclJlZmluZSA9IHRoaXMuc3VwZXJSZWZpbmUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5vcHRpb25hbCA9IHRoaXMub3B0aW9uYWwuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5udWxsYWJsZSA9IHRoaXMubnVsbGFibGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5udWxsaXNoID0gdGhpcy5udWxsaXNoLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYXJyYXkgPSB0aGlzLmFycmF5LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucHJvbWlzZSA9IHRoaXMucHJvbWlzZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9yID0gdGhpcy5vci5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmFuZCA9IHRoaXMuYW5kLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtID0gdGhpcy50cmFuc2Zvcm0uYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5icmFuZCA9IHRoaXMuYnJhbmQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5kZWZhdWx0ID0gdGhpcy5kZWZhdWx0LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuY2F0Y2ggPSB0aGlzLmNhdGNoLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZGVzY3JpYmUgPSB0aGlzLmRlc2NyaWJlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucGlwZSA9IHRoaXMucGlwZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnJlYWRvbmx5ID0gdGhpcy5yZWFkb25seS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmlzTnVsbGFibGUgPSB0aGlzLmlzTnVsbGFibGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5pc09wdGlvbmFsID0gdGhpcy5pc09wdGlvbmFsLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXNbXCJ+c3RhbmRhcmRcIl0gPSB7XG4gICAgICAgICAgICB2ZXJzaW9uOiAxLFxuICAgICAgICAgICAgdmVuZG9yOiBcInpvZFwiLFxuICAgICAgICAgICAgdmFsaWRhdGU6IChkYXRhKSA9PiB0aGlzW1wifnZhbGlkYXRlXCJdKGRhdGEpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBvcHRpb25hbCgpIHtcbiAgICAgICAgcmV0dXJuIFpvZE9wdGlvbmFsLmNyZWF0ZSh0aGlzLCB0aGlzLl9kZWYpO1xuICAgIH1cbiAgICBudWxsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIFpvZE51bGxhYmxlLmNyZWF0ZSh0aGlzLCB0aGlzLl9kZWYpO1xuICAgIH1cbiAgICBudWxsaXNoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5udWxsYWJsZSgpLm9wdGlvbmFsKCk7XG4gICAgfVxuICAgIGFycmF5KCkge1xuICAgICAgICByZXR1cm4gWm9kQXJyYXkuY3JlYXRlKHRoaXMpO1xuICAgIH1cbiAgICBwcm9taXNlKCkge1xuICAgICAgICByZXR1cm4gWm9kUHJvbWlzZS5jcmVhdGUodGhpcywgdGhpcy5fZGVmKTtcbiAgICB9XG4gICAgb3Iob3B0aW9uKSB7XG4gICAgICAgIHJldHVybiBab2RVbmlvbi5jcmVhdGUoW3RoaXMsIG9wdGlvbl0sIHRoaXMuX2RlZik7XG4gICAgfVxuICAgIGFuZChpbmNvbWluZykge1xuICAgICAgICByZXR1cm4gWm9kSW50ZXJzZWN0aW9uLmNyZWF0ZSh0aGlzLCBpbmNvbWluZywgdGhpcy5fZGVmKTtcbiAgICB9XG4gICAgdHJhbnNmb3JtKHRyYW5zZm9ybSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEVmZmVjdHMoe1xuICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyh0aGlzLl9kZWYpLFxuICAgICAgICAgICAgc2NoZW1hOiB0aGlzLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFZmZlY3RzLFxuICAgICAgICAgICAgZWZmZWN0OiB7IHR5cGU6IFwidHJhbnNmb3JtXCIsIHRyYW5zZm9ybSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZGVmYXVsdChkZWYpIHtcbiAgICAgICAgY29uc3QgZGVmYXVsdFZhbHVlRnVuYyA9IHR5cGVvZiBkZWYgPT09IFwiZnVuY3Rpb25cIiA/IGRlZiA6ICgpID0+IGRlZjtcbiAgICAgICAgcmV0dXJuIG5ldyBab2REZWZhdWx0KHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXModGhpcy5fZGVmKSxcbiAgICAgICAgICAgIGlubmVyVHlwZTogdGhpcyxcbiAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogZGVmYXVsdFZhbHVlRnVuYyxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRGVmYXVsdCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGJyYW5kKCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEJyYW5kZWQoe1xuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RCcmFuZGVkLFxuICAgICAgICAgICAgdHlwZTogdGhpcyxcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXModGhpcy5fZGVmKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNhdGNoKGRlZikge1xuICAgICAgICBjb25zdCBjYXRjaFZhbHVlRnVuYyA9IHR5cGVvZiBkZWYgPT09IFwiZnVuY3Rpb25cIiA/IGRlZiA6ICgpID0+IGRlZjtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RDYXRjaCh7XG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHRoaXMuX2RlZiksXG4gICAgICAgICAgICBpbm5lclR5cGU6IHRoaXMsXG4gICAgICAgICAgICBjYXRjaFZhbHVlOiBjYXRjaFZhbHVlRnVuYyxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQ2F0Y2gsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBkZXNjcmliZShkZXNjcmlwdGlvbikge1xuICAgICAgICBjb25zdCBUaGlzID0gdGhpcy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgcmV0dXJuIG5ldyBUaGlzKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcGlwZSh0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuIFpvZFBpcGVsaW5lLmNyZWF0ZSh0aGlzLCB0YXJnZXQpO1xuICAgIH1cbiAgICByZWFkb25seSgpIHtcbiAgICAgICAgcmV0dXJuIFpvZFJlYWRvbmx5LmNyZWF0ZSh0aGlzKTtcbiAgICB9XG4gICAgaXNPcHRpb25hbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FmZVBhcnNlKHVuZGVmaW5lZCkuc3VjY2VzcztcbiAgICB9XG4gICAgaXNOdWxsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FmZVBhcnNlKG51bGwpLnN1Y2Nlc3M7XG4gICAgfVxufVxuY29uc3QgY3VpZFJlZ2V4ID0gL15jW15cXHMtXXs4LH0kL2k7XG5jb25zdCBjdWlkMlJlZ2V4ID0gL15bMC05YS16XSskLztcbmNvbnN0IHVsaWRSZWdleCA9IC9eWzAtOUEtSEpLTU5QLVRWLVpdezI2fSQvaTtcbi8vIGNvbnN0IHV1aWRSZWdleCA9XG4vLyAgIC9eKFthLWYwLTldezh9LVthLWYwLTldezR9LVsxLTVdW2EtZjAtOV17M30tW2EtZjAtOV17NH0tW2EtZjAtOV17MTJ9fDAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCkkL2k7XG5jb25zdCB1dWlkUmVnZXggPSAvXlswLTlhLWZBLUZdezh9XFxiLVswLTlhLWZBLUZdezR9XFxiLVswLTlhLWZBLUZdezR9XFxiLVswLTlhLWZBLUZdezR9XFxiLVswLTlhLWZBLUZdezEyfSQvaTtcbmNvbnN0IG5hbm9pZFJlZ2V4ID0gL15bYS16MC05Xy1dezIxfSQvaTtcbmNvbnN0IGp3dFJlZ2V4ID0gL15bQS1aYS16MC05LV9dK1xcLltBLVphLXowLTktX10rXFwuW0EtWmEtejAtOS1fXSokLztcbmNvbnN0IGR1cmF0aW9uUmVnZXggPSAvXlstK10/UCg/ISQpKD86KD86Wy0rXT9cXGQrWSl8KD86Wy0rXT9cXGQrWy4sXVxcZCtZJCkpPyg/Oig/OlstK10/XFxkK00pfCg/OlstK10/XFxkK1suLF1cXGQrTSQpKT8oPzooPzpbLStdP1xcZCtXKXwoPzpbLStdP1xcZCtbLixdXFxkK1ckKSk/KD86KD86Wy0rXT9cXGQrRCl8KD86Wy0rXT9cXGQrWy4sXVxcZCtEJCkpPyg/OlQoPz1bXFxkKy1dKSg/Oig/OlstK10/XFxkK0gpfCg/OlstK10/XFxkK1suLF1cXGQrSCQpKT8oPzooPzpbLStdP1xcZCtNKXwoPzpbLStdP1xcZCtbLixdXFxkK00kKSk/KD86Wy0rXT9cXGQrKD86Wy4sXVxcZCspP1MpPyk/PyQvO1xuLy8gZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNDYxODEvMTU1MDE1NVxuLy8gb2xkIHZlcnNpb246IHRvbyBzbG93LCBkaWRuJ3Qgc3VwcG9ydCB1bmljb2RlXG4vLyBjb25zdCBlbWFpbFJlZ2V4ID0gL14oKChbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkrKFxcLihbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkrKSopfCgoXFx4MjIpKCgoKFxceDIwfFxceDA5KSooXFx4MGRcXHgwYSkpPyhcXHgyMHxcXHgwOSkrKT8oKFtcXHgwMS1cXHgwOFxceDBiXFx4MGNcXHgwZS1cXHgxZlxceDdmXXxcXHgyMXxbXFx4MjMtXFx4NWJdfFtcXHg1ZC1cXHg3ZV18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfChcXFxcKFtcXHgwMS1cXHgwOVxceDBiXFx4MGNcXHgwZC1cXHg3Zl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSkpKigoKFxceDIwfFxceDA5KSooXFx4MGRcXHgwYSkpPyhcXHgyMHxcXHgwOSkrKT8oXFx4MjIpKSlAKCgoW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLikrKChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpJC9pO1xuLy9vbGQgZW1haWwgcmVnZXhcbi8vIGNvbnN0IGVtYWlsUmVnZXggPSAvXigoW148PigpW1xcXS4sOzpcXHNAXCJdKyhcXC5bXjw+KClbXFxdLiw7Olxcc0BcIl0rKSopfChcIi4rXCIpKUAoKD8hLSkoW148PigpW1xcXS4sOzpcXHNAXCJdK1xcLikrW148PigpW1xcXS4sOzpcXHNAXCJdezEsfSlbXi08PigpW1xcXS4sOzpcXHNAXCJdJC9pO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4vLyBjb25zdCBlbWFpbFJlZ2V4ID1cbi8vICAgL14oKFtePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoXFxbKCgoMjVbMC01XSl8KDJbMC00XVswLTldKXwoMVswLTldezJ9KXwoWzAtOV17MSwyfSkpXFwuKXszfSgoMjVbMC01XSl8KDJbMC00XVswLTldKXwoMVswLTldezJ9KXwoWzAtOV17MSwyfSkpXFxdKXwoXFxbSVB2NjooKFthLWYwLTldezEsNH06KXs3fXw6OihbYS1mMC05XXsxLDR9Oil7MCw2fXwoW2EtZjAtOV17MSw0fTopezF9OihbYS1mMC05XXsxLDR9Oil7MCw1fXwoW2EtZjAtOV17MSw0fTopezJ9OihbYS1mMC05XXsxLDR9Oil7MCw0fXwoW2EtZjAtOV17MSw0fTopezN9OihbYS1mMC05XXsxLDR9Oil7MCwzfXwoW2EtZjAtOV17MSw0fTopezR9OihbYS1mMC05XXsxLDR9Oil7MCwyfXwoW2EtZjAtOV17MSw0fTopezV9OihbYS1mMC05XXsxLDR9Oil7MCwxfSkoW2EtZjAtOV17MSw0fXwoKCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSlcXC4pezN9KCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSkpXFxdKXwoW0EtWmEtejAtOV0oW0EtWmEtejAtOS1dKltBLVphLXowLTldKSooXFwuW0EtWmEtel17Mix9KSspKSQvO1xuLy8gY29uc3QgZW1haWxSZWdleCA9XG4vLyAgIC9eW2EtekEtWjAtOVxcLlxcIVxcI1xcJFxcJVxcJlxcJ1xcKlxcK1xcL1xcPVxcP1xcXlxcX1xcYFxce1xcfFxcfVxcflxcLV0rQFthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykqJC87XG4vLyBjb25zdCBlbWFpbFJlZ2V4ID1cbi8vICAgL14oPzpbYS16MC05ISMkJSYnKisvPT9eX2B7fH1+LV0rKD86XFwuW2EtejAtOSEjJCUmJyorLz0/Xl9ge3x9fi1dKykqfFwiKD86W1xceDAxLVxceDA4XFx4MGJcXHgwY1xceDBlLVxceDFmXFx4MjFcXHgyMy1cXHg1YlxceDVkLVxceDdmXXxcXFxcW1xceDAxLVxceDA5XFx4MGJcXHgwY1xceDBlLVxceDdmXSkqXCIpQCg/Oig/OlthLXowLTldKD86W2EtejAtOS1dKlthLXowLTldKT9cXC4pK1thLXowLTldKD86W2EtejAtOS1dKlthLXowLTldKT98XFxbKD86KD86MjVbMC01XXwyWzAtNF1bMC05XXxbMDFdP1swLTldWzAtOV0/KVxcLil7M30oPzoyNVswLTVdfDJbMC00XVswLTldfFswMV0/WzAtOV1bMC05XT98W2EtejAtOS1dKlthLXowLTldOig/OltcXHgwMS1cXHgwOFxceDBiXFx4MGNcXHgwZS1cXHgxZlxceDIxLVxceDVhXFx4NTMtXFx4N2ZdfFxcXFxbXFx4MDEtXFx4MDlcXHgwYlxceDBjXFx4MGUtXFx4N2ZdKSspXFxdKSQvaTtcbmNvbnN0IGVtYWlsUmVnZXggPSAvXig/IVxcLikoPyEuKlxcLlxcLikoW0EtWjAtOV8nK1xcLVxcLl0qKVtBLVowLTlfKy1dQChbQS1aMC05XVtBLVowLTlcXC1dKlxcLikrW0EtWl17Mix9JC9pO1xuLy8gY29uc3QgZW1haWxSZWdleCA9XG4vLyAgIC9eW2EtejAtOS4hIyQlJlx1MjAxOSorLz0/Xl9ge3x9fi1dK0BbYS16MC05LV0rKD86XFwuW2EtejAtOVxcLV0rKSokL2k7XG4vLyBmcm9tIGh0dHBzOi8vdGhla2V2aW5zY290dC5jb20vZW1vamlzLWluLWphdmFzY3JpcHQvI3dyaXRpbmctYS1yZWd1bGFyLWV4cHJlc3Npb25cbmNvbnN0IF9lbW9qaVJlZ2V4ID0gYF4oXFxcXHB7RXh0ZW5kZWRfUGljdG9ncmFwaGljfXxcXFxccHtFbW9qaV9Db21wb25lbnR9KSskYDtcbmxldCBlbW9qaVJlZ2V4O1xuLy8gZmFzdGVyLCBzaW1wbGVyLCBzYWZlclxuY29uc3QgaXB2NFJlZ2V4ID0gL14oPzooPzoyNVswLTVdfDJbMC00XVswLTldfDFbMC05XVswLTldfFsxLTldWzAtOV18WzAtOV0pXFwuKXszfSg/OjI1WzAtNV18MlswLTRdWzAtOV18MVswLTldWzAtOV18WzEtOV1bMC05XXxbMC05XSkkLztcbmNvbnN0IGlwdjRDaWRyUmVnZXggPSAvXig/Oig/OjI1WzAtNV18MlswLTRdWzAtOV18MVswLTldWzAtOV18WzEtOV1bMC05XXxbMC05XSlcXC4pezN9KD86MjVbMC01XXwyWzAtNF1bMC05XXwxWzAtOV1bMC05XXxbMS05XVswLTldfFswLTldKVxcLygzWzAtMl18WzEyXT9bMC05XSkkLztcbi8vIGNvbnN0IGlwdjZSZWdleCA9XG4vLyAvXigoW2EtZjAtOV17MSw0fTopezd9fDo6KFthLWYwLTldezEsNH06KXswLDZ9fChbYS1mMC05XXsxLDR9Oil7MX06KFthLWYwLTldezEsNH06KXswLDV9fChbYS1mMC05XXsxLDR9Oil7Mn06KFthLWYwLTldezEsNH06KXswLDR9fChbYS1mMC05XXsxLDR9Oil7M306KFthLWYwLTldezEsNH06KXswLDN9fChbYS1mMC05XXsxLDR9Oil7NH06KFthLWYwLTldezEsNH06KXswLDJ9fChbYS1mMC05XXsxLDR9Oil7NX06KFthLWYwLTldezEsNH06KXswLDF9KShbYS1mMC05XXsxLDR9fCgoKDI1WzAtNV0pfCgyWzAtNF1bMC05XSl8KDFbMC05XXsyfSl8KFswLTldezEsMn0pKVxcLil7M30oKDI1WzAtNV0pfCgyWzAtNF1bMC05XSl8KDFbMC05XXsyfSl8KFswLTldezEsMn0pKSkkLztcbmNvbnN0IGlwdjZSZWdleCA9IC9eKChbMC05YS1mQS1GXXsxLDR9Oil7Nyw3fVswLTlhLWZBLUZdezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDd9OnwoWzAtOWEtZkEtRl17MSw0fTopezEsNn06WzAtOWEtZkEtRl17MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsNX0oOlswLTlhLWZBLUZdezEsNH0pezEsMn18KFswLTlhLWZBLUZdezEsNH06KXsxLDR9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDN9fChbMC05YS1mQS1GXXsxLDR9Oil7MSwzfSg6WzAtOWEtZkEtRl17MSw0fSl7MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsMn0oOlswLTlhLWZBLUZdezEsNH0pezEsNX18WzAtOWEtZkEtRl17MSw0fTooKDpbMC05YS1mQS1GXXsxLDR9KXsxLDZ9KXw6KCg6WzAtOWEtZkEtRl17MSw0fSl7MSw3fXw6KXxmZTgwOig6WzAtOWEtZkEtRl17MCw0fSl7MCw0fSVbMC05YS16QS1aXXsxLH18OjooZmZmZig6MHsxLDR9KXswLDF9Oil7MCwxfSgoMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pXFwuKXszLDN9KDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKXwoWzAtOWEtZkEtRl17MSw0fTopezEsNH06KCgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSlcXC4pezMsM30oMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pKSQvO1xuY29uc3QgaXB2NkNpZHJSZWdleCA9IC9eKChbMC05YS1mQS1GXXsxLDR9Oil7Nyw3fVswLTlhLWZBLUZdezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDd9OnwoWzAtOWEtZkEtRl17MSw0fTopezEsNn06WzAtOWEtZkEtRl17MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsNX0oOlswLTlhLWZBLUZdezEsNH0pezEsMn18KFswLTlhLWZBLUZdezEsNH06KXsxLDR9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDN9fChbMC05YS1mQS1GXXsxLDR9Oil7MSwzfSg6WzAtOWEtZkEtRl17MSw0fSl7MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsMn0oOlswLTlhLWZBLUZdezEsNH0pezEsNX18WzAtOWEtZkEtRl17MSw0fTooKDpbMC05YS1mQS1GXXsxLDR9KXsxLDZ9KXw6KCg6WzAtOWEtZkEtRl17MSw0fSl7MSw3fXw6KXxmZTgwOig6WzAtOWEtZkEtRl17MCw0fSl7MCw0fSVbMC05YS16QS1aXXsxLH18OjooZmZmZig6MHsxLDR9KXswLDF9Oil7MCwxfSgoMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pXFwuKXszLDN9KDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKXwoWzAtOWEtZkEtRl17MSw0fTopezEsNH06KCgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSlcXC4pezMsM30oMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pKVxcLygxMlswLThdfDFbMDFdWzAtOV18WzEtOV0/WzAtOV0pJC87XG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83ODYwMzkyL2RldGVybWluZS1pZi1zdHJpbmctaXMtaW4tYmFzZTY0LXVzaW5nLWphdmFzY3JpcHRcbmNvbnN0IGJhc2U2NFJlZ2V4ID0gL14oWzAtOWEtekEtWisvXXs0fSkqKChbMC05YS16QS1aKy9dezJ9PT0pfChbMC05YS16QS1aKy9dezN9PSkpPyQvO1xuLy8gaHR0cHM6Ly9iYXNlNjQuZ3VydS9zdGFuZGFyZHMvYmFzZTY0dXJsXG5jb25zdCBiYXNlNjR1cmxSZWdleCA9IC9eKFswLTlhLXpBLVotX117NH0pKigoWzAtOWEtekEtWi1fXXsyfSg9PSk/KXwoWzAtOWEtekEtWi1fXXszfSg9KT8pKT8kLztcbi8vIHNpbXBsZVxuLy8gY29uc3QgZGF0ZVJlZ2V4U291cmNlID0gYFxcXFxkezR9LVxcXFxkezJ9LVxcXFxkezJ9YDtcbi8vIG5vIGxlYXAgeWVhciB2YWxpZGF0aW9uXG4vLyBjb25zdCBkYXRlUmVnZXhTb3VyY2UgPSBgXFxcXGR7NH0tKCgwWzEzNTc4XXwxMHwxMiktMzF8KDBbMTMtOV18MVswLTJdKS0zMHwoMFsxLTldfDFbMC0yXSktKDBbMS05XXwxXFxcXGR8MlxcXFxkKSlgO1xuLy8gd2l0aCBsZWFwIHllYXIgdmFsaWRhdGlvblxuY29uc3QgZGF0ZVJlZ2V4U291cmNlID0gYCgoXFxcXGRcXFxcZFsyNDY4XVswNDhdfFxcXFxkXFxcXGRbMTM1NzldWzI2XXxcXFxcZFxcXFxkMFs0OF18WzAyNDY4XVswNDhdMDB8WzEzNTc5XVsyNl0wMCktMDItMjl8XFxcXGR7NH0tKCgwWzEzNTc4XXwxWzAyXSktKDBbMS05XXxbMTJdXFxcXGR8M1swMV0pfCgwWzQ2OV18MTEpLSgwWzEtOV18WzEyXVxcXFxkfDMwKXwoMDIpLSgwWzEtOV18MVxcXFxkfDJbMC04XSkpKWA7XG5jb25zdCBkYXRlUmVnZXggPSBuZXcgUmVnRXhwKGBeJHtkYXRlUmVnZXhTb3VyY2V9JGApO1xuZnVuY3Rpb24gdGltZVJlZ2V4U291cmNlKGFyZ3MpIHtcbiAgICBsZXQgc2Vjb25kc1JlZ2V4U291cmNlID0gYFswLTVdXFxcXGRgO1xuICAgIGlmIChhcmdzLnByZWNpc2lvbikge1xuICAgICAgICBzZWNvbmRzUmVnZXhTb3VyY2UgPSBgJHtzZWNvbmRzUmVnZXhTb3VyY2V9XFxcXC5cXFxcZHske2FyZ3MucHJlY2lzaW9ufX1gO1xuICAgIH1cbiAgICBlbHNlIGlmIChhcmdzLnByZWNpc2lvbiA9PSBudWxsKSB7XG4gICAgICAgIHNlY29uZHNSZWdleFNvdXJjZSA9IGAke3NlY29uZHNSZWdleFNvdXJjZX0oXFxcXC5cXFxcZCspP2A7XG4gICAgfVxuICAgIGNvbnN0IHNlY29uZHNRdWFudGlmaWVyID0gYXJncy5wcmVjaXNpb24gPyBcIitcIiA6IFwiP1wiOyAvLyByZXF1aXJlIHNlY29uZHMgaWYgcHJlY2lzaW9uIGlzIG5vbnplcm9cbiAgICByZXR1cm4gYChbMDFdXFxcXGR8MlswLTNdKTpbMC01XVxcXFxkKDoke3NlY29uZHNSZWdleFNvdXJjZX0pJHtzZWNvbmRzUXVhbnRpZmllcn1gO1xufVxuZnVuY3Rpb24gdGltZVJlZ2V4KGFyZ3MpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXiR7dGltZVJlZ2V4U291cmNlKGFyZ3MpfSRgKTtcbn1cbi8vIEFkYXB0ZWQgZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzE0MzIzMVxuZXhwb3J0IGZ1bmN0aW9uIGRhdGV0aW1lUmVnZXgoYXJncykge1xuICAgIGxldCByZWdleCA9IGAke2RhdGVSZWdleFNvdXJjZX1UJHt0aW1lUmVnZXhTb3VyY2UoYXJncyl9YDtcbiAgICBjb25zdCBvcHRzID0gW107XG4gICAgb3B0cy5wdXNoKGFyZ3MubG9jYWwgPyBgWj9gIDogYFpgKTtcbiAgICBpZiAoYXJncy5vZmZzZXQpXG4gICAgICAgIG9wdHMucHVzaChgKFsrLV1cXFxcZHsyfTo/XFxcXGR7Mn0pYCk7XG4gICAgcmVnZXggPSBgJHtyZWdleH0oJHtvcHRzLmpvaW4oXCJ8XCIpfSlgO1xuICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHtyZWdleH0kYCk7XG59XG5mdW5jdGlvbiBpc1ZhbGlkSVAoaXAsIHZlcnNpb24pIHtcbiAgICBpZiAoKHZlcnNpb24gPT09IFwidjRcIiB8fCAhdmVyc2lvbikgJiYgaXB2NFJlZ2V4LnRlc3QoaXApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoKHZlcnNpb24gPT09IFwidjZcIiB8fCAhdmVyc2lvbikgJiYgaXB2NlJlZ2V4LnRlc3QoaXApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBpc1ZhbGlkSldUKGp3dCwgYWxnKSB7XG4gICAgaWYgKCFqd3RSZWdleC50ZXN0KGp3dCkpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBbaGVhZGVyXSA9IGp3dC5zcGxpdChcIi5cIik7XG4gICAgICAgIGlmICghaGVhZGVyKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyBDb252ZXJ0IGJhc2U2NHVybCB0byBiYXNlNjRcbiAgICAgICAgY29uc3QgYmFzZTY0ID0gaGVhZGVyXG4gICAgICAgICAgICAucmVwbGFjZSgvLS9nLCBcIitcIilcbiAgICAgICAgICAgIC5yZXBsYWNlKC9fL2csIFwiL1wiKVxuICAgICAgICAgICAgLnBhZEVuZChoZWFkZXIubGVuZ3RoICsgKCg0IC0gKGhlYWRlci5sZW5ndGggJSA0KSkgJSA0KSwgXCI9XCIpO1xuICAgICAgICBjb25zdCBkZWNvZGVkID0gSlNPTi5wYXJzZShhdG9iKGJhc2U2NCkpO1xuICAgICAgICBpZiAodHlwZW9mIGRlY29kZWQgIT09IFwib2JqZWN0XCIgfHwgZGVjb2RlZCA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKFwidHlwXCIgaW4gZGVjb2RlZCAmJiBkZWNvZGVkPy50eXAgIT09IFwiSldUXCIpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICghZGVjb2RlZC5hbGcpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChhbGcgJiYgZGVjb2RlZC5hbGcgIT09IGFsZylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGlzVmFsaWRDaWRyKGlwLCB2ZXJzaW9uKSB7XG4gICAgaWYgKCh2ZXJzaW9uID09PSBcInY0XCIgfHwgIXZlcnNpb24pICYmIGlwdjRDaWRyUmVnZXgudGVzdChpcCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICgodmVyc2lvbiA9PT0gXCJ2NlwiIHx8ICF2ZXJzaW9uKSAmJiBpcHY2Q2lkclJlZ2V4LnRlc3QoaXApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5leHBvcnQgY2xhc3MgWm9kU3RyaW5nIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY29lcmNlKSB7XG4gICAgICAgICAgICBpbnB1dC5kYXRhID0gU3RyaW5nKGlucHV0LmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuc3RyaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLnN0cmluZyxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IG5ldyBQYXJzZVN0YXR1cygpO1xuICAgICAgICBsZXQgY3R4ID0gdW5kZWZpbmVkO1xuICAgICAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaGVjay5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEubGVuZ3RoIDwgY2hlY2sudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEubGVuZ3RoID4gY2hlY2sudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJsZW5ndGhcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb0JpZyA9IGlucHV0LmRhdGEubGVuZ3RoID4gY2hlY2sudmFsdWU7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBpbnB1dC5kYXRhLmxlbmd0aCA8IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29CaWcgfHwgdG9vU21hbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b29CaWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0b29TbWFsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJlbWFpbFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlbWFpbFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJlbWFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZW1vamlcIikge1xuICAgICAgICAgICAgICAgIGlmICghZW1vamlSZWdleCkge1xuICAgICAgICAgICAgICAgICAgICBlbW9qaVJlZ2V4ID0gbmV3IFJlZ0V4cChfZW1vamlSZWdleCwgXCJ1XCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWVtb2ppUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImVtb2ppXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ1dWlkXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXV1aWRSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwidXVpZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibmFub2lkXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW5hbm9pZFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJuYW5vaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImN1aWRcIikge1xuICAgICAgICAgICAgICAgIGlmICghY3VpZFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJjdWlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJjdWlkMlwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjdWlkMlJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJjdWlkMlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwidWxpZFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF1bGlkUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcInVsaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInVybFwiKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgbmV3IFVSTChpbnB1dC5kYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcInVybFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwicmVnZXhcIikge1xuICAgICAgICAgICAgICAgIGNoZWNrLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgdGVzdFJlc3VsdCA9IGNoZWNrLnJlZ2V4LnRlc3QoaW5wdXQuZGF0YSk7XG4gICAgICAgICAgICAgICAgaWYgKCF0ZXN0UmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwicmVnZXhcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInRyaW1cIikge1xuICAgICAgICAgICAgICAgIGlucHV0LmRhdGEgPSBpbnB1dC5kYXRhLnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiaW5jbHVkZXNcIikge1xuICAgICAgICAgICAgICAgIGlmICghaW5wdXQuZGF0YS5pbmNsdWRlcyhjaGVjay52YWx1ZSwgY2hlY2sucG9zaXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHsgaW5jbHVkZXM6IGNoZWNrLnZhbHVlLCBwb3NpdGlvbjogY2hlY2sucG9zaXRpb24gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInRvTG93ZXJDYXNlXCIpIHtcbiAgICAgICAgICAgICAgICBpbnB1dC5kYXRhID0gaW5wdXQuZGF0YS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ0b1VwcGVyQ2FzZVwiKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQuZGF0YSA9IGlucHV0LmRhdGEudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwic3RhcnRzV2l0aFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpbnB1dC5kYXRhLnN0YXJ0c1dpdGgoY2hlY2sudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHsgc3RhcnRzV2l0aDogY2hlY2sudmFsdWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImVuZHNXaXRoXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0LmRhdGEuZW5kc1dpdGgoY2hlY2sudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IHsgZW5kc1dpdGg6IGNoZWNrLnZhbHVlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJkYXRldGltZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVnZXggPSBkYXRldGltZVJlZ2V4KGNoZWNrKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJkYXRldGltZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZGF0ZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVnZXggPSBkYXRlUmVnZXg7XG4gICAgICAgICAgICAgICAgaWYgKCFyZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwidGltZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVnZXggPSB0aW1lUmVnZXgoY2hlY2spO1xuICAgICAgICAgICAgICAgIGlmICghcmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcInRpbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImR1cmF0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWR1cmF0aW9uUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImR1cmF0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJpcFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkSVAoaW5wdXQuZGF0YSwgY2hlY2sudmVyc2lvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJpcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiand0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzVmFsaWRKV1QoaW5wdXQuZGF0YSwgY2hlY2suYWxnKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImp3dFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiY2lkclwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkQ2lkcihpbnB1dC5kYXRhLCBjaGVjay52ZXJzaW9uKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImNpZHJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImJhc2U2NFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFiYXNlNjRSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiYmFzZTY0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJiYXNlNjR1cmxcIikge1xuICAgICAgICAgICAgICAgIGlmICghYmFzZTY0dXJsUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImJhc2U2NHVybFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoY2hlY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogaW5wdXQuZGF0YSB9O1xuICAgIH1cbiAgICBfcmVnZXgocmVnZXgsIHZhbGlkYXRpb24sIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVmaW5lbWVudCgoZGF0YSkgPT4gcmVnZXgudGVzdChkYXRhKSwge1xuICAgICAgICAgICAgdmFsaWRhdGlvbixcbiAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9hZGRDaGVjayhjaGVjaykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFN0cmluZyh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCBjaGVja10sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbWFpbChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiZW1haWxcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICB1cmwobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcInVybFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIGVtb2ppKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJlbW9qaVwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIHV1aWQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcInV1aWRcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBuYW5vaWQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcIm5hbm9pZFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIGN1aWQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImN1aWRcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBjdWlkMihtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiY3VpZDJcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICB1bGlkKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJ1bGlkXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgYmFzZTY0KG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJiYXNlNjRcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBiYXNlNjR1cmwobWVzc2FnZSkge1xuICAgICAgICAvLyBiYXNlNjR1cmwgZW5jb2RpbmcgaXMgYSBtb2RpZmljYXRpb24gb2YgYmFzZTY0IHRoYXQgY2FuIHNhZmVseSBiZSB1c2VkIGluIFVSTHMgYW5kIGZpbGVuYW1lc1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJiYXNlNjR1cmxcIixcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGp3dChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiand0XCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihvcHRpb25zKSB9KTtcbiAgICB9XG4gICAgaXAob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImlwXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihvcHRpb25zKSB9KTtcbiAgICB9XG4gICAgY2lkcihvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiY2lkclwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucykgfSk7XG4gICAgfVxuICAgIGRhdGV0aW1lKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAgICAgIGtpbmQ6IFwiZGF0ZXRpbWVcIixcbiAgICAgICAgICAgICAgICBwcmVjaXNpb246IG51bGwsXG4gICAgICAgICAgICAgICAgb2Zmc2V0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBsb2NhbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogb3B0aW9ucyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImRhdGV0aW1lXCIsXG4gICAgICAgICAgICBwcmVjaXNpb246IHR5cGVvZiBvcHRpb25zPy5wcmVjaXNpb24gPT09IFwidW5kZWZpbmVkXCIgPyBudWxsIDogb3B0aW9ucz8ucHJlY2lzaW9uLFxuICAgICAgICAgICAgb2Zmc2V0OiBvcHRpb25zPy5vZmZzZXQgPz8gZmFsc2UsXG4gICAgICAgICAgICBsb2NhbDogb3B0aW9ucz8ubG9jYWwgPz8gZmFsc2UsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucz8ubWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBkYXRlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJkYXRlXCIsIG1lc3NhZ2UgfSk7XG4gICAgfVxuICAgIHRpbWUob3B0aW9ucykge1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICAgICAga2luZDogXCJ0aW1lXCIsXG4gICAgICAgICAgICAgICAgcHJlY2lzaW9uOiBudWxsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG9wdGlvbnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJ0aW1lXCIsXG4gICAgICAgICAgICBwcmVjaXNpb246IHR5cGVvZiBvcHRpb25zPy5wcmVjaXNpb24gPT09IFwidW5kZWZpbmVkXCIgPyBudWxsIDogb3B0aW9ucz8ucHJlY2lzaW9uLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG9wdGlvbnM/Lm1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZHVyYXRpb24obWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImR1cmF0aW9uXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgcmVnZXgocmVnZXgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwicmVnZXhcIixcbiAgICAgICAgICAgIHJlZ2V4OiByZWdleCxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGluY2x1ZGVzKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImluY2x1ZGVzXCIsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBwb3NpdGlvbjogb3B0aW9ucz8ucG9zaXRpb24sXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucz8ubWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdGFydHNXaXRoKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcInN0YXJ0c1dpdGhcIixcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVuZHNXaXRoKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImVuZHNXaXRoXCIsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtaW4obWluTGVuZ3RoLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IG1pbkxlbmd0aCxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1heChtYXhMZW5ndGgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICB2YWx1ZTogbWF4TGVuZ3RoLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbGVuZ3RoKGxlbiwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJsZW5ndGhcIixcbiAgICAgICAgICAgIHZhbHVlOiBsZW4sXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFcXVpdmFsZW50IHRvIGAubWluKDEpYFxuICAgICAqL1xuICAgIG5vbmVtcHR5KG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluKDEsIGVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSk7XG4gICAgfVxuICAgIHRyaW0oKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kU3RyaW5nKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogWy4uLnRoaXMuX2RlZi5jaGVja3MsIHsga2luZDogXCJ0cmltXCIgfV0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB0b0xvd2VyQ2FzZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTdHJpbmcoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgeyBraW5kOiBcInRvTG93ZXJDYXNlXCIgfV0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB0b1VwcGVyQ2FzZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTdHJpbmcoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgeyBraW5kOiBcInRvVXBwZXJDYXNlXCIgfV0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQgaXNEYXRldGltZSgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJkYXRldGltZVwiKTtcbiAgICB9XG4gICAgZ2V0IGlzRGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJkYXRlXCIpO1xuICAgIH1cbiAgICBnZXQgaXNUaW1lKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcInRpbWVcIik7XG4gICAgfVxuICAgIGdldCBpc0R1cmF0aW9uKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImR1cmF0aW9uXCIpO1xuICAgIH1cbiAgICBnZXQgaXNFbWFpbCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJlbWFpbFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzVVJMKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcInVybFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzRW1vamkoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiZW1vamlcIik7XG4gICAgfVxuICAgIGdldCBpc1VVSUQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwidXVpZFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzTkFOT0lEKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcIm5hbm9pZFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzQ1VJRCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJjdWlkXCIpO1xuICAgIH1cbiAgICBnZXQgaXNDVUlEMigpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJjdWlkMlwiKTtcbiAgICB9XG4gICAgZ2V0IGlzVUxJRCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJ1bGlkXCIpO1xuICAgIH1cbiAgICBnZXQgaXNJUCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJpcFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzQ0lEUigpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJjaWRyXCIpO1xuICAgIH1cbiAgICBnZXQgaXNCYXNlNjQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiYmFzZTY0XCIpO1xuICAgIH1cbiAgICBnZXQgaXNCYXNlNjR1cmwoKSB7XG4gICAgICAgIC8vIGJhc2U2NHVybCBlbmNvZGluZyBpcyBhIG1vZGlmaWNhdGlvbiBvZiBiYXNlNjQgdGhhdCBjYW4gc2FmZWx5IGJlIHVzZWQgaW4gVVJMcyBhbmQgZmlsZW5hbWVzXG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiYmFzZTY0dXJsXCIpO1xuICAgIH1cbiAgICBnZXQgbWluTGVuZ3RoKCkge1xuICAgICAgICBsZXQgbWluID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChtaW4gPT09IG51bGwgfHwgY2gudmFsdWUgPiBtaW4pXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtaW47XG4gICAgfVxuICAgIGdldCBtYXhMZW5ndGgoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9XG59XG5ab2RTdHJpbmcuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kU3RyaW5nKHtcbiAgICAgICAgY2hlY2tzOiBbXSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RTdHJpbmcsXG4gICAgICAgIGNvZXJjZTogcGFyYW1zPy5jb2VyY2UgPz8gZmFsc2UsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zOTY2NDg0L3doeS1kb2VzLW1vZHVsdXMtb3BlcmF0b3ItcmV0dXJuLWZyYWN0aW9uYWwtbnVtYmVyLWluLWphdmFzY3JpcHQvMzE3MTEwMzQjMzE3MTEwMzRcbmZ1bmN0aW9uIGZsb2F0U2FmZVJlbWFpbmRlcih2YWwsIHN0ZXApIHtcbiAgICBjb25zdCB2YWxEZWNDb3VudCA9ICh2YWwudG9TdHJpbmcoKS5zcGxpdChcIi5cIilbMV0gfHwgXCJcIikubGVuZ3RoO1xuICAgIGNvbnN0IHN0ZXBEZWNDb3VudCA9IChzdGVwLnRvU3RyaW5nKCkuc3BsaXQoXCIuXCIpWzFdIHx8IFwiXCIpLmxlbmd0aDtcbiAgICBjb25zdCBkZWNDb3VudCA9IHZhbERlY0NvdW50ID4gc3RlcERlY0NvdW50ID8gdmFsRGVjQ291bnQgOiBzdGVwRGVjQ291bnQ7XG4gICAgY29uc3QgdmFsSW50ID0gTnVtYmVyLnBhcnNlSW50KHZhbC50b0ZpeGVkKGRlY0NvdW50KS5yZXBsYWNlKFwiLlwiLCBcIlwiKSk7XG4gICAgY29uc3Qgc3RlcEludCA9IE51bWJlci5wYXJzZUludChzdGVwLnRvRml4ZWQoZGVjQ291bnQpLnJlcGxhY2UoXCIuXCIsIFwiXCIpKTtcbiAgICByZXR1cm4gKHZhbEludCAlIHN0ZXBJbnQpIC8gMTAgKiogZGVjQ291bnQ7XG59XG5leHBvcnQgY2xhc3MgWm9kTnVtYmVyIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMubWluID0gdGhpcy5ndGU7XG4gICAgICAgIHRoaXMubWF4ID0gdGhpcy5sdGU7XG4gICAgICAgIHRoaXMuc3RlcCA9IHRoaXMubXVsdGlwbGVPZjtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY29lcmNlKSB7XG4gICAgICAgICAgICBpbnB1dC5kYXRhID0gTnVtYmVyKGlucHV0LmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUubnVtYmVyKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm51bWJlcixcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjdHggPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IG5ldyBQYXJzZVN0YXR1cygpO1xuICAgICAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaGVjay5raW5kID09PSBcImludFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF1dGlsLmlzSW50ZWdlcihpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFwiaW50ZWdlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IFwiZmxvYXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBjaGVjay5pbmNsdXNpdmUgPyBpbnB1dC5kYXRhIDwgY2hlY2sudmFsdWUgOiBpbnB1dC5kYXRhIDw9IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29TbWFsbCkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiBjaGVjay5pbmNsdXNpdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb0JpZyA9IGNoZWNrLmluY2x1c2l2ZSA/IGlucHV0LmRhdGEgPiBjaGVjay52YWx1ZSA6IGlucHV0LmRhdGEgPj0gY2hlY2sudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHRvb0JpZykge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogY2hlY2suaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZsb2F0U2FmZVJlbWFpbmRlcihpbnB1dC5kYXRhLCBjaGVjay52YWx1ZSkgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLm5vdF9tdWx0aXBsZV9vZixcbiAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpcGxlT2Y6IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZmluaXRlXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUubm90X2Zpbml0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGNoZWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGlucHV0LmRhdGEgfTtcbiAgICB9XG4gICAgZ3RlKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWluXCIsIHZhbHVlLCB0cnVlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBndCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1pblwiLCB2YWx1ZSwgZmFsc2UsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIGx0ZSh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1heFwiLCB2YWx1ZSwgdHJ1ZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgbHQodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtYXhcIiwgdmFsdWUsIGZhbHNlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBzZXRMaW1pdChraW5kLCB2YWx1ZSwgaW5jbHVzaXZlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kTnVtYmVyKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogW1xuICAgICAgICAgICAgICAgIC4uLnRoaXMuX2RlZi5jaGVja3MsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBraW5kLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfYWRkQ2hlY2soY2hlY2spIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2ROdW1iZXIoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgY2hlY2tdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW50KG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwiaW50XCIsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IGZhbHNlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbmVnYXRpdmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtYXhcIixcbiAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbnBvc2l0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbm5lZ2F0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG11bHRpcGxlT2YodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibXVsdGlwbGVPZlwiLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZmluaXRlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwiZmluaXRlXCIsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzYWZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0IG1pblZhbHVlKCkge1xuICAgICAgICBsZXQgbWluID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChtaW4gPT09IG51bGwgfHwgY2gudmFsdWUgPiBtaW4pXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtaW47XG4gICAgfVxuICAgIGdldCBtYXhWYWx1ZSgpIHtcbiAgICAgICAgbGV0IG1heCA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWF4ID09PSBudWxsIHx8IGNoLnZhbHVlIDwgbWF4KVxuICAgICAgICAgICAgICAgICAgICBtYXggPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF4O1xuICAgIH1cbiAgICBnZXQgaXNJbnQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiaW50XCIgfHwgKGNoLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiICYmIHV0aWwuaXNJbnRlZ2VyKGNoLnZhbHVlKSkpO1xuICAgIH1cbiAgICBnZXQgaXNGaW5pdGUoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBsZXQgbWluID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJmaW5pdGVcIiB8fCBjaC5raW5kID09PSBcImludFwiIHx8IGNoLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaC5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pbiA9PT0gbnVsbCB8fCBjaC52YWx1ZSA+IG1pbilcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZShtaW4pICYmIE51bWJlci5pc0Zpbml0ZShtYXgpO1xuICAgIH1cbn1cblpvZE51bWJlci5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2ROdW1iZXIoe1xuICAgICAgICBjaGVja3M6IFtdLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE51bWJlcixcbiAgICAgICAgY29lcmNlOiBwYXJhbXM/LmNvZXJjZSB8fCBmYWxzZSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RCaWdJbnQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5taW4gPSB0aGlzLmd0ZTtcbiAgICAgICAgdGhpcy5tYXggPSB0aGlzLmx0ZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY29lcmNlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlucHV0LmRhdGEgPSBCaWdJbnQoaW5wdXQuZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldEludmFsaWRJbnB1dChpbnB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5iaWdpbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRJbnZhbGlkSW5wdXQoaW5wdXQpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjdHggPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IG5ldyBQYXJzZVN0YXR1cygpO1xuICAgICAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaGVjay5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBjaGVjay5pbmNsdXNpdmUgPyBpbnB1dC5kYXRhIDwgY2hlY2sudmFsdWUgOiBpbnB1dC5kYXRhIDw9IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29TbWFsbCkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJiaWdpbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiBjaGVjay5pbmNsdXNpdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb0JpZyA9IGNoZWNrLmluY2x1c2l2ZSA/IGlucHV0LmRhdGEgPiBjaGVjay52YWx1ZSA6IGlucHV0LmRhdGEgPj0gY2hlY2sudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHRvb0JpZykge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYmlnaW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogY2hlY2suaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibXVsdGlwbGVPZlwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEgJSBjaGVjay52YWx1ZSAhPT0gQmlnSW50KDApKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5ub3RfbXVsdGlwbGVfb2YsXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZU9mOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGNoZWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGlucHV0LmRhdGEgfTtcbiAgICB9XG4gICAgX2dldEludmFsaWRJbnB1dChpbnB1dCkge1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmJpZ2ludCxcbiAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgIH1cbiAgICBndGUodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtaW5cIiwgdmFsdWUsIHRydWUsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIGd0KHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWluXCIsIHZhbHVlLCBmYWxzZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgbHRlKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWF4XCIsIHZhbHVlLCB0cnVlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBsdCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1heFwiLCB2YWx1ZSwgZmFsc2UsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIHNldExpbWl0KGtpbmQsIHZhbHVlLCBpbmNsdXNpdmUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RCaWdJbnQoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbXG4gICAgICAgICAgICAgICAgLi4udGhpcy5fZGVmLmNoZWNrcyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtpbmQsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9hZGRDaGVjayhjaGVjaykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEJpZ0ludCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCBjaGVja10sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBuZWdhdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBub25wb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbm5lZ2F0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICB2YWx1ZTogQmlnSW50KDApLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbXVsdGlwbGVPZih2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtdWx0aXBsZU9mXCIsXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldCBtaW5WYWx1ZSgpIHtcbiAgICAgICAgbGV0IG1pbiA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWluID09PSBudWxsIHx8IGNoLnZhbHVlID4gbWluKVxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWluO1xuICAgIH1cbiAgICBnZXQgbWF4VmFsdWUoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9XG59XG5ab2RCaWdJbnQuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kQmlnSW50KHtcbiAgICAgICAgY2hlY2tzOiBbXSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RCaWdJbnQsXG4gICAgICAgIGNvZXJjZTogcGFyYW1zPy5jb2VyY2UgPz8gZmFsc2UsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kQm9vbGVhbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5fZGVmLmNvZXJjZSkge1xuICAgICAgICAgICAgaW5wdXQuZGF0YSA9IEJvb2xlYW4oaW5wdXQuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5ib29sZWFuKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmJvb2xlYW4sXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuWm9kQm9vbGVhbi5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RCb29sZWFuKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RCb29sZWFuLFxuICAgICAgICBjb2VyY2U6IHBhcmFtcz8uY29lcmNlIHx8IGZhbHNlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZERhdGUgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RlZi5jb2VyY2UpIHtcbiAgICAgICAgICAgIGlucHV0LmRhdGEgPSBuZXcgRGF0ZShpbnB1dC5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLmRhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuZGF0ZSxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmIChOdW1iZXIuaXNOYU4oaW5wdXQuZGF0YS5nZXRUaW1lKCkpKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9kYXRlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdGF0dXMgPSBuZXcgUGFyc2VTdGF0dXMoKTtcbiAgICAgICAgbGV0IGN0eCA9IHVuZGVmaW5lZDtcbiAgICAgICAgZm9yIChjb25zdCBjaGVjayBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2sua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5kYXRhLmdldFRpbWUoKSA8IGNoZWNrLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuZGF0YS5nZXRUaW1lKCkgPiBjaGVjay52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdXRpbC5hc3NlcnROZXZlcihjaGVjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLnZhbHVlLFxuICAgICAgICAgICAgdmFsdWU6IG5ldyBEYXRlKGlucHV0LmRhdGEuZ2V0VGltZSgpKSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgX2FkZENoZWNrKGNoZWNrKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRGF0ZSh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCBjaGVja10sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtaW4obWluRGF0ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtaW5cIixcbiAgICAgICAgICAgIHZhbHVlOiBtaW5EYXRlLmdldFRpbWUoKSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1heChtYXhEYXRlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IG1heERhdGUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0IG1pbkRhdGUoKSB7XG4gICAgICAgIGxldCBtaW4gPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pbiA9PT0gbnVsbCB8fCBjaC52YWx1ZSA+IG1pbilcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pbiAhPSBudWxsID8gbmV3IERhdGUobWluKSA6IG51bGw7XG4gICAgfVxuICAgIGdldCBtYXhEYXRlKCkge1xuICAgICAgICBsZXQgbWF4ID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGlmIChtYXggPT09IG51bGwgfHwgY2gudmFsdWUgPCBtYXgpXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXggIT0gbnVsbCA/IG5ldyBEYXRlKG1heCkgOiBudWxsO1xuICAgIH1cbn1cblpvZERhdGUuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kRGF0ZSh7XG4gICAgICAgIGNoZWNrczogW10sXG4gICAgICAgIGNvZXJjZTogcGFyYW1zPy5jb2VyY2UgfHwgZmFsc2UsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRGF0ZSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RTeW1ib2wgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5zeW1ib2wpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuc3ltYm9sLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZFN5bWJvbC5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RTeW1ib2woe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFN5bWJvbCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RVbmRlZmluZWQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS51bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZFVuZGVmaW5lZC5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RVbmRlZmluZWQoe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFVuZGVmaW5lZCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2ROdWxsIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUubnVsbCkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5udWxsLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZE51bGwuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTnVsbCh7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTnVsbCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RBbnkgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgLy8gdG8gcHJldmVudCBpbnN0YW5jZXMgb2Ygb3RoZXIgY2xhc3NlcyBmcm9tIGV4dGVuZGluZyBab2RBbnkuIHRoaXMgY2F1c2VzIGlzc3VlcyB3aXRoIGNhdGNoYWxsIGluIFpvZE9iamVjdC5cbiAgICAgICAgdGhpcy5fYW55ID0gdHJ1ZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG59XG5ab2RBbnkuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kQW55KHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RBbnksXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kVW5rbm93biBleHRlbmRzIFpvZFR5cGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICAvLyByZXF1aXJlZFxuICAgICAgICB0aGlzLl91bmtub3duID0gdHJ1ZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG59XG5ab2RVbmtub3duLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFVua25vd24oe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFVua25vd24sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kTmV2ZXIgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5uZXZlcixcbiAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgIH1cbn1cblpvZE5ldmVyLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE5ldmVyKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2ROZXZlcixcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RWb2lkIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLnZvaWQsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuWm9kVm9pZC5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RWb2lkKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RWb2lkLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZEFycmF5IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4LCBzdGF0dXMgfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGRlZiA9IHRoaXMuX2RlZjtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLmFycmF5KSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmFycmF5LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZi5leGFjdExlbmd0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgdG9vQmlnID0gY3R4LmRhdGEubGVuZ3RoID4gZGVmLmV4YWN0TGVuZ3RoLnZhbHVlO1xuICAgICAgICAgICAgY29uc3QgdG9vU21hbGwgPSBjdHguZGF0YS5sZW5ndGggPCBkZWYuZXhhY3RMZW5ndGgudmFsdWU7XG4gICAgICAgICAgICBpZiAodG9vQmlnIHx8IHRvb1NtYWxsKSB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IHRvb0JpZyA/IFpvZElzc3VlQ29kZS50b29fYmlnIDogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgbWluaW11bTogKHRvb1NtYWxsID8gZGVmLmV4YWN0TGVuZ3RoLnZhbHVlIDogdW5kZWZpbmVkKSxcbiAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogKHRvb0JpZyA/IGRlZi5leGFjdExlbmd0aC52YWx1ZSA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGVmLmV4YWN0TGVuZ3RoLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZi5taW5MZW5ndGggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjdHguZGF0YS5sZW5ndGggPCBkZWYubWluTGVuZ3RoLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGRlZi5taW5MZW5ndGgudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5taW5MZW5ndGgubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVmLm1heExlbmd0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGN0eC5kYXRhLmxlbmd0aCA+IGRlZi5tYXhMZW5ndGgudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgIG1heGltdW06IGRlZi5tYXhMZW5ndGgudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5tYXhMZW5ndGgubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFsuLi5jdHguZGF0YV0ubWFwKChpdGVtLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZi50eXBlLl9wYXJzZUFzeW5jKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBpdGVtLCBjdHgucGF0aCwgaSkpO1xuICAgICAgICAgICAgfSkpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgcmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFsuLi5jdHguZGF0YV0ubWFwKChpdGVtLCBpKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZGVmLnR5cGUuX3BhcnNlU3luYyhuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgaXRlbSwgY3R4LnBhdGgsIGkpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgcmVzdWx0KTtcbiAgICB9XG4gICAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudHlwZTtcbiAgICB9XG4gICAgbWluKG1pbkxlbmd0aCwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEFycmF5KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIG1pbkxlbmd0aDogeyB2YWx1ZTogbWluTGVuZ3RoLCBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1heChtYXhMZW5ndGgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RBcnJheSh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBtYXhMZW5ndGg6IHsgdmFsdWU6IG1heExlbmd0aCwgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBsZW5ndGgobGVuLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQXJyYXkoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgZXhhY3RMZW5ndGg6IHsgdmFsdWU6IGxlbiwgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBub25lbXB0eShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbigxLCBtZXNzYWdlKTtcbiAgICB9XG59XG5ab2RBcnJheS5jcmVhdGUgPSAoc2NoZW1hLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEFycmF5KHtcbiAgICAgICAgdHlwZTogc2NoZW1hLFxuICAgICAgICBtaW5MZW5ndGg6IG51bGwsXG4gICAgICAgIG1heExlbmd0aDogbnVsbCxcbiAgICAgICAgZXhhY3RMZW5ndGg6IG51bGwsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQXJyYXksXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5mdW5jdGlvbiBkZWVwUGFydGlhbGlmeShzY2hlbWEpIHtcbiAgICBpZiAoc2NoZW1hIGluc3RhbmNlb2YgWm9kT2JqZWN0KSB7XG4gICAgICAgIGNvbnN0IG5ld1NoYXBlID0ge307XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNjaGVtYS5zaGFwZSkge1xuICAgICAgICAgICAgY29uc3QgZmllbGRTY2hlbWEgPSBzY2hlbWEuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIG5ld1NoYXBlW2tleV0gPSBab2RPcHRpb25hbC5jcmVhdGUoZGVlcFBhcnRpYWxpZnkoZmllbGRTY2hlbWEpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi5zY2hlbWEuX2RlZixcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiBuZXdTaGFwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHNjaGVtYSBpbnN0YW5jZW9mIFpvZEFycmF5KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQXJyYXkoe1xuICAgICAgICAgICAgLi4uc2NoZW1hLl9kZWYsXG4gICAgICAgICAgICB0eXBlOiBkZWVwUGFydGlhbGlmeShzY2hlbWEuZWxlbWVudCksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2RPcHRpb25hbCkge1xuICAgICAgICByZXR1cm4gWm9kT3B0aW9uYWwuY3JlYXRlKGRlZXBQYXJ0aWFsaWZ5KHNjaGVtYS51bndyYXAoKSkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2ROdWxsYWJsZSkge1xuICAgICAgICByZXR1cm4gWm9kTnVsbGFibGUuY3JlYXRlKGRlZXBQYXJ0aWFsaWZ5KHNjaGVtYS51bndyYXAoKSkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2RUdXBsZSkge1xuICAgICAgICByZXR1cm4gWm9kVHVwbGUuY3JlYXRlKHNjaGVtYS5pdGVtcy5tYXAoKGl0ZW0pID0+IGRlZXBQYXJ0aWFsaWZ5KGl0ZW0pKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gc2NoZW1hO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RPYmplY3QgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5fY2FjaGVkID0gbnVsbDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBkZXByZWNhdGVkIEluIG1vc3QgY2FzZXMsIHRoaXMgaXMgbm8gbG9uZ2VyIG5lZWRlZCAtIHVua25vd24gcHJvcGVydGllcyBhcmUgbm93IHNpbGVudGx5IHN0cmlwcGVkLlxuICAgICAgICAgKiBJZiB5b3Ugd2FudCB0byBwYXNzIHRocm91Z2ggdW5rbm93biBwcm9wZXJ0aWVzLCB1c2UgYC5wYXNzdGhyb3VnaCgpYCBpbnN0ZWFkLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5ub25zdHJpY3QgPSB0aGlzLnBhc3N0aHJvdWdoO1xuICAgICAgICAvLyBleHRlbmQ8XG4gICAgICAgIC8vICAgQXVnbWVudGF0aW9uIGV4dGVuZHMgWm9kUmF3U2hhcGUsXG4gICAgICAgIC8vICAgTmV3T3V0cHV0IGV4dGVuZHMgdXRpbC5mbGF0dGVuPHtcbiAgICAgICAgLy8gICAgIFtrIGluIGtleW9mIEF1Z21lbnRhdGlvbiB8IGtleW9mIE91dHB1dF06IGsgZXh0ZW5kcyBrZXlvZiBBdWdtZW50YXRpb25cbiAgICAgICAgLy8gICAgICAgPyBBdWdtZW50YXRpb25ba11bXCJfb3V0cHV0XCJdXG4gICAgICAgIC8vICAgICAgIDogayBleHRlbmRzIGtleW9mIE91dHB1dFxuICAgICAgICAvLyAgICAgICA/IE91dHB1dFtrXVxuICAgICAgICAvLyAgICAgICA6IG5ldmVyO1xuICAgICAgICAvLyAgIH0+LFxuICAgICAgICAvLyAgIE5ld0lucHV0IGV4dGVuZHMgdXRpbC5mbGF0dGVuPHtcbiAgICAgICAgLy8gICAgIFtrIGluIGtleW9mIEF1Z21lbnRhdGlvbiB8IGtleW9mIElucHV0XTogayBleHRlbmRzIGtleW9mIEF1Z21lbnRhdGlvblxuICAgICAgICAvLyAgICAgICA/IEF1Z21lbnRhdGlvbltrXVtcIl9pbnB1dFwiXVxuICAgICAgICAvLyAgICAgICA6IGsgZXh0ZW5kcyBrZXlvZiBJbnB1dFxuICAgICAgICAvLyAgICAgICA/IElucHV0W2tdXG4gICAgICAgIC8vICAgICAgIDogbmV2ZXI7XG4gICAgICAgIC8vICAgfT5cbiAgICAgICAgLy8gPihcbiAgICAgICAgLy8gICBhdWdtZW50YXRpb246IEF1Z21lbnRhdGlvblxuICAgICAgICAvLyApOiBab2RPYmplY3Q8XG4gICAgICAgIC8vICAgZXh0ZW5kU2hhcGU8VCwgQXVnbWVudGF0aW9uPixcbiAgICAgICAgLy8gICBVbmtub3duS2V5cyxcbiAgICAgICAgLy8gICBDYXRjaGFsbCxcbiAgICAgICAgLy8gICBOZXdPdXRwdXQsXG4gICAgICAgIC8vICAgTmV3SW5wdXRcbiAgICAgICAgLy8gPiB7XG4gICAgICAgIC8vICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAvLyAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAvLyAgICAgc2hhcGU6ICgpID0+ICh7XG4gICAgICAgIC8vICAgICAgIC4uLnRoaXMuX2RlZi5zaGFwZSgpLFxuICAgICAgICAvLyAgICAgICAuLi5hdWdtZW50YXRpb24sXG4gICAgICAgIC8vICAgICB9KSxcbiAgICAgICAgLy8gICB9KSBhcyBhbnk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBkZXByZWNhdGVkIFVzZSBgLmV4dGVuZGAgaW5zdGVhZFxuICAgICAgICAgKiAgKi9cbiAgICAgICAgdGhpcy5hdWdtZW50ID0gdGhpcy5leHRlbmQ7XG4gICAgfVxuICAgIF9nZXRDYWNoZWQoKSB7XG4gICAgICAgIGlmICh0aGlzLl9jYWNoZWQgIT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkO1xuICAgICAgICBjb25zdCBzaGFwZSA9IHRoaXMuX2RlZi5zaGFwZSgpO1xuICAgICAgICBjb25zdCBrZXlzID0gdXRpbC5vYmplY3RLZXlzKHNoYXBlKTtcbiAgICAgICAgdGhpcy5fY2FjaGVkID0geyBzaGFwZSwga2V5cyB9O1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5vYmplY3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUub2JqZWN0LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3QgeyBzaGFwZSwga2V5czogc2hhcGVLZXlzIH0gPSB0aGlzLl9nZXRDYWNoZWQoKTtcbiAgICAgICAgY29uc3QgZXh0cmFLZXlzID0gW107XG4gICAgICAgIGlmICghKHRoaXMuX2RlZi5jYXRjaGFsbCBpbnN0YW5jZW9mIFpvZE5ldmVyICYmIHRoaXMuX2RlZi51bmtub3duS2V5cyA9PT0gXCJzdHJpcFwiKSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gY3R4LmRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNoYXBlS2V5cy5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dHJhS2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhaXJzID0gW107XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHNoYXBlS2V5cykge1xuICAgICAgICAgICAgY29uc3Qga2V5VmFsaWRhdG9yID0gc2hhcGVba2V5XTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY3R4LmRhdGFba2V5XTtcbiAgICAgICAgICAgIHBhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgIGtleTogeyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGtleSB9LFxuICAgICAgICAgICAgICAgIHZhbHVlOiBrZXlWYWxpZGF0b3IuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCB2YWx1ZSwgY3R4LnBhdGgsIGtleSkpLFxuICAgICAgICAgICAgICAgIGFsd2F5c1NldDoga2V5IGluIGN0eC5kYXRhLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2RlZi5jYXRjaGFsbCBpbnN0YW5jZW9mIFpvZE5ldmVyKSB7XG4gICAgICAgICAgICBjb25zdCB1bmtub3duS2V5cyA9IHRoaXMuX2RlZi51bmtub3duS2V5cztcbiAgICAgICAgICAgIGlmICh1bmtub3duS2V5cyA9PT0gXCJwYXNzdGhyb3VnaFwiKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgZXh0cmFLZXlzKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiB7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZToga2V5IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogeyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGN0eC5kYXRhW2tleV0gfSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodW5rbm93bktleXMgPT09IFwic3RyaWN0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXh0cmFLZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudW5yZWNvZ25pemVkX2tleXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlzOiBleHRyYUtleXMsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh1bmtub3duS2V5cyA9PT0gXCJzdHJpcFwiKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludGVybmFsIFpvZE9iamVjdCBlcnJvcjogaW52YWxpZCB1bmtub3duS2V5cyB2YWx1ZS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHJ1biBjYXRjaGFsbCB2YWxpZGF0aW9uXG4gICAgICAgICAgICBjb25zdCBjYXRjaGFsbCA9IHRoaXMuX2RlZi5jYXRjaGFsbDtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGV4dHJhS2V5cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY3R4LmRhdGFba2V5XTtcbiAgICAgICAgICAgICAgICBwYWlycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiB7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZToga2V5IH0sXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjYXRjaGFsbC5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIHZhbHVlLCBjdHgucGF0aCwga2V5KSAvLywgY3R4LmNoaWxkKGtleSksIHZhbHVlLCBnZXRQYXJzZWRUeXBlKHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBhbHdheXNTZXQ6IGtleSBpbiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgICAgICAgLnRoZW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN5bmNQYWlycyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBwYWlyLmtleTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBhd2FpdCBwYWlyLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBzeW5jUGFpcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsd2F5c1NldDogcGFpci5hbHdheXNTZXQsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gc3luY1BhaXJzO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbigoc3luY1BhaXJzKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFBhcnNlU3RhdHVzLm1lcmdlT2JqZWN0U3luYyhzdGF0dXMsIHN5bmNQYWlycyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZU9iamVjdFN5bmMoc3RhdHVzLCBwYWlycyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IHNoYXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnNoYXBlKCk7XG4gICAgfVxuICAgIHN0cmljdChtZXNzYWdlKSB7XG4gICAgICAgIGVycm9yVXRpbC5lcnJUb09iajtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgdW5rbm93bktleXM6IFwic3RyaWN0XCIsXG4gICAgICAgICAgICAuLi4obWVzc2FnZSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWFwOiAoaXNzdWUsIGN0eCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVmYXVsdEVycm9yID0gdGhpcy5fZGVmLmVycm9yTWFwPy4oaXNzdWUsIGN0eCkubWVzc2FnZSA/PyBjdHguZGVmYXVsdEVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzc3VlLmNvZGUgPT09IFwidW5yZWNvZ25pemVkX2tleXNcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkubWVzc2FnZSA/PyBkZWZhdWx0RXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGVmYXVsdEVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgOiB7fSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdHJpcCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgdW5rbm93bktleXM6IFwic3RyaXBcIixcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBhc3N0aHJvdWdoKCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICB1bmtub3duS2V5czogXCJwYXNzdGhyb3VnaFwiLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gY29uc3QgQXVnbWVudEZhY3RvcnkgPVxuICAgIC8vICAgPERlZiBleHRlbmRzIFpvZE9iamVjdERlZj4oZGVmOiBEZWYpID0+XG4gICAgLy8gICA8QXVnbWVudGF0aW9uIGV4dGVuZHMgWm9kUmF3U2hhcGU+KFxuICAgIC8vICAgICBhdWdtZW50YXRpb246IEF1Z21lbnRhdGlvblxuICAgIC8vICAgKTogWm9kT2JqZWN0PFxuICAgIC8vICAgICBleHRlbmRTaGFwZTxSZXR1cm5UeXBlPERlZltcInNoYXBlXCJdPiwgQXVnbWVudGF0aW9uPixcbiAgICAvLyAgICAgRGVmW1widW5rbm93bktleXNcIl0sXG4gICAgLy8gICAgIERlZltcImNhdGNoYWxsXCJdXG4gICAgLy8gICA+ID0+IHtcbiAgICAvLyAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgIC8vICAgICAgIC4uLmRlZixcbiAgICAvLyAgICAgICBzaGFwZTogKCkgPT4gKHtcbiAgICAvLyAgICAgICAgIC4uLmRlZi5zaGFwZSgpLFxuICAgIC8vICAgICAgICAgLi4uYXVnbWVudGF0aW9uLFxuICAgIC8vICAgICAgIH0pLFxuICAgIC8vICAgICB9KSBhcyBhbnk7XG4gICAgLy8gICB9O1xuICAgIGV4dGVuZChhdWdtZW50YXRpb24pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+ICh7XG4gICAgICAgICAgICAgICAgLi4udGhpcy5fZGVmLnNoYXBlKCksXG4gICAgICAgICAgICAgICAgLi4uYXVnbWVudGF0aW9uLFxuICAgICAgICAgICAgfSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQcmlvciB0byB6b2RAMS4wLjEyIHRoZXJlIHdhcyBhIGJ1ZyBpbiB0aGVcbiAgICAgKiBpbmZlcnJlZCB0eXBlIG9mIG1lcmdlZCBvYmplY3RzLiBQbGVhc2VcbiAgICAgKiB1cGdyYWRlIGlmIHlvdSBhcmUgZXhwZXJpZW5jaW5nIGlzc3Vlcy5cbiAgICAgKi9cbiAgICBtZXJnZShtZXJnaW5nKSB7XG4gICAgICAgIGNvbnN0IG1lcmdlZCA9IG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgdW5rbm93bktleXM6IG1lcmdpbmcuX2RlZi51bmtub3duS2V5cyxcbiAgICAgICAgICAgIGNhdGNoYWxsOiBtZXJnaW5nLl9kZWYuY2F0Y2hhbGwsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi50aGlzLl9kZWYuc2hhcGUoKSxcbiAgICAgICAgICAgICAgICAuLi5tZXJnaW5nLl9kZWYuc2hhcGUoKSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbWVyZ2VkO1xuICAgIH1cbiAgICAvLyBtZXJnZTxcbiAgICAvLyAgIEluY29taW5nIGV4dGVuZHMgQW55Wm9kT2JqZWN0LFxuICAgIC8vICAgQXVnbWVudGF0aW9uIGV4dGVuZHMgSW5jb21pbmdbXCJzaGFwZVwiXSxcbiAgICAvLyAgIE5ld091dHB1dCBleHRlbmRzIHtcbiAgICAvLyAgICAgW2sgaW4ga2V5b2YgQXVnbWVudGF0aW9uIHwga2V5b2YgT3V0cHV0XTogayBleHRlbmRzIGtleW9mIEF1Z21lbnRhdGlvblxuICAgIC8vICAgICAgID8gQXVnbWVudGF0aW9uW2tdW1wiX291dHB1dFwiXVxuICAgIC8vICAgICAgIDogayBleHRlbmRzIGtleW9mIE91dHB1dFxuICAgIC8vICAgICAgID8gT3V0cHV0W2tdXG4gICAgLy8gICAgICAgOiBuZXZlcjtcbiAgICAvLyAgIH0sXG4gICAgLy8gICBOZXdJbnB1dCBleHRlbmRzIHtcbiAgICAvLyAgICAgW2sgaW4ga2V5b2YgQXVnbWVudGF0aW9uIHwga2V5b2YgSW5wdXRdOiBrIGV4dGVuZHMga2V5b2YgQXVnbWVudGF0aW9uXG4gICAgLy8gICAgICAgPyBBdWdtZW50YXRpb25ba11bXCJfaW5wdXRcIl1cbiAgICAvLyAgICAgICA6IGsgZXh0ZW5kcyBrZXlvZiBJbnB1dFxuICAgIC8vICAgICAgID8gSW5wdXRba11cbiAgICAvLyAgICAgICA6IG5ldmVyO1xuICAgIC8vICAgfVxuICAgIC8vID4oXG4gICAgLy8gICBtZXJnaW5nOiBJbmNvbWluZ1xuICAgIC8vICk6IFpvZE9iamVjdDxcbiAgICAvLyAgIGV4dGVuZFNoYXBlPFQsIFJldHVyblR5cGU8SW5jb21pbmdbXCJfZGVmXCJdW1wic2hhcGVcIl0+PixcbiAgICAvLyAgIEluY29taW5nW1wiX2RlZlwiXVtcInVua25vd25LZXlzXCJdLFxuICAgIC8vICAgSW5jb21pbmdbXCJfZGVmXCJdW1wiY2F0Y2hhbGxcIl0sXG4gICAgLy8gICBOZXdPdXRwdXQsXG4gICAgLy8gICBOZXdJbnB1dFxuICAgIC8vID4ge1xuICAgIC8vICAgY29uc3QgbWVyZ2VkOiBhbnkgPSBuZXcgWm9kT2JqZWN0KHtcbiAgICAvLyAgICAgdW5rbm93bktleXM6IG1lcmdpbmcuX2RlZi51bmtub3duS2V5cyxcbiAgICAvLyAgICAgY2F0Y2hhbGw6IG1lcmdpbmcuX2RlZi5jYXRjaGFsbCxcbiAgICAvLyAgICAgc2hhcGU6ICgpID0+XG4gICAgLy8gICAgICAgb2JqZWN0VXRpbC5tZXJnZVNoYXBlcyh0aGlzLl9kZWYuc2hhcGUoKSwgbWVyZ2luZy5fZGVmLnNoYXBlKCkpLFxuICAgIC8vICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9iamVjdCxcbiAgICAvLyAgIH0pIGFzIGFueTtcbiAgICAvLyAgIHJldHVybiBtZXJnZWQ7XG4gICAgLy8gfVxuICAgIHNldEtleShrZXksIHNjaGVtYSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdWdtZW50KHsgW2tleV06IHNjaGVtYSB9KTtcbiAgICB9XG4gICAgLy8gbWVyZ2U8SW5jb21pbmcgZXh0ZW5kcyBBbnlab2RPYmplY3Q+KFxuICAgIC8vICAgbWVyZ2luZzogSW5jb21pbmdcbiAgICAvLyApOiAvL1pvZE9iamVjdDxUICYgSW5jb21pbmdbXCJfc2hhcGVcIl0sIFVua25vd25LZXlzLCBDYXRjaGFsbD4gPSAobWVyZ2luZykgPT4ge1xuICAgIC8vIFpvZE9iamVjdDxcbiAgICAvLyAgIGV4dGVuZFNoYXBlPFQsIFJldHVyblR5cGU8SW5jb21pbmdbXCJfZGVmXCJdW1wic2hhcGVcIl0+PixcbiAgICAvLyAgIEluY29taW5nW1wiX2RlZlwiXVtcInVua25vd25LZXlzXCJdLFxuICAgIC8vICAgSW5jb21pbmdbXCJfZGVmXCJdW1wiY2F0Y2hhbGxcIl1cbiAgICAvLyA+IHtcbiAgICAvLyAgIC8vIGNvbnN0IG1lcmdlZFNoYXBlID0gb2JqZWN0VXRpbC5tZXJnZVNoYXBlcyhcbiAgICAvLyAgIC8vICAgdGhpcy5fZGVmLnNoYXBlKCksXG4gICAgLy8gICAvLyAgIG1lcmdpbmcuX2RlZi5zaGFwZSgpXG4gICAgLy8gICAvLyApO1xuICAgIC8vICAgY29uc3QgbWVyZ2VkOiBhbnkgPSBuZXcgWm9kT2JqZWN0KHtcbiAgICAvLyAgICAgdW5rbm93bktleXM6IG1lcmdpbmcuX2RlZi51bmtub3duS2V5cyxcbiAgICAvLyAgICAgY2F0Y2hhbGw6IG1lcmdpbmcuX2RlZi5jYXRjaGFsbCxcbiAgICAvLyAgICAgc2hhcGU6ICgpID0+XG4gICAgLy8gICAgICAgb2JqZWN0VXRpbC5tZXJnZVNoYXBlcyh0aGlzLl9kZWYuc2hhcGUoKSwgbWVyZ2luZy5fZGVmLnNoYXBlKCkpLFxuICAgIC8vICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9iamVjdCxcbiAgICAvLyAgIH0pIGFzIGFueTtcbiAgICAvLyAgIHJldHVybiBtZXJnZWQ7XG4gICAgLy8gfVxuICAgIGNhdGNoYWxsKGluZGV4KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNhdGNoYWxsOiBpbmRleCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBpY2sobWFzaykge1xuICAgICAgICBjb25zdCBzaGFwZSA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB1dGlsLm9iamVjdEtleXMobWFzaykpIHtcbiAgICAgICAgICAgIGlmIChtYXNrW2tleV0gJiYgdGhpcy5zaGFwZVtrZXldKSB7XG4gICAgICAgICAgICAgICAgc2hhcGVba2V5XSA9IHRoaXMuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gc2hhcGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBvbWl0KG1hc2spIHtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdXRpbC5vYmplY3RLZXlzKHRoaXMuc2hhcGUpKSB7XG4gICAgICAgICAgICBpZiAoIW1hc2tba2V5XSkge1xuICAgICAgICAgICAgICAgIHNoYXBlW2tleV0gPSB0aGlzLnNoYXBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+IHNoYXBlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICBkZWVwUGFydGlhbCgpIHtcbiAgICAgICAgcmV0dXJuIGRlZXBQYXJ0aWFsaWZ5KHRoaXMpO1xuICAgIH1cbiAgICBwYXJ0aWFsKG1hc2spIHtcbiAgICAgICAgY29uc3QgbmV3U2hhcGUgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdXRpbC5vYmplY3RLZXlzKHRoaXMuc2hhcGUpKSB7XG4gICAgICAgICAgICBjb25zdCBmaWVsZFNjaGVtYSA9IHRoaXMuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIGlmIChtYXNrICYmICFtYXNrW2tleV0pIHtcbiAgICAgICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gZmllbGRTY2hlbWE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gZmllbGRTY2hlbWEub3B0aW9uYWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gbmV3U2hhcGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXF1aXJlZChtYXNrKSB7XG4gICAgICAgIGNvbnN0IG5ld1NoYXBlID0ge307XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHV0aWwub2JqZWN0S2V5cyh0aGlzLnNoYXBlKSkge1xuICAgICAgICAgICAgaWYgKG1hc2sgJiYgIW1hc2tba2V5XSkge1xuICAgICAgICAgICAgICAgIG5ld1NoYXBlW2tleV0gPSB0aGlzLnNoYXBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWVsZFNjaGVtYSA9IHRoaXMuc2hhcGVba2V5XTtcbiAgICAgICAgICAgICAgICBsZXQgbmV3RmllbGQgPSBmaWVsZFNjaGVtYTtcbiAgICAgICAgICAgICAgICB3aGlsZSAobmV3RmllbGQgaW5zdGFuY2VvZiBab2RPcHRpb25hbCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdGaWVsZCA9IG5ld0ZpZWxkLl9kZWYuaW5uZXJUeXBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gbmV3RmllbGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+IG5ld1NoYXBlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAga2V5b2YoKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVab2RFbnVtKHV0aWwub2JqZWN0S2V5cyh0aGlzLnNoYXBlKSk7XG4gICAgfVxufVxuWm9kT2JqZWN0LmNyZWF0ZSA9IChzaGFwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICBzaGFwZTogKCkgPT4gc2hhcGUsXG4gICAgICAgIHVua25vd25LZXlzOiBcInN0cmlwXCIsXG4gICAgICAgIGNhdGNoYWxsOiBab2ROZXZlci5jcmVhdGUoKSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5ab2RPYmplY3Quc3RyaWN0Q3JlYXRlID0gKHNoYXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgIHNoYXBlOiAoKSA9PiBzaGFwZSxcbiAgICAgICAgdW5rbm93bktleXM6IFwic3RyaWN0XCIsXG4gICAgICAgIGNhdGNoYWxsOiBab2ROZXZlci5jcmVhdGUoKSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5ab2RPYmplY3QubGF6eWNyZWF0ZSA9IChzaGFwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICBzaGFwZSxcbiAgICAgICAgdW5rbm93bktleXM6IFwic3RyaXBcIixcbiAgICAgICAgY2F0Y2hhbGw6IFpvZE5ldmVyLmNyZWF0ZSgpLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9iamVjdCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RVbmlvbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX2RlZi5vcHRpb25zO1xuICAgICAgICBmdW5jdGlvbiBoYW5kbGVSZXN1bHRzKHJlc3VsdHMpIHtcbiAgICAgICAgICAgIC8vIHJldHVybiBmaXJzdCBpc3N1ZS1mcmVlIHZhbGlkYXRpb24gaWYgaXQgZXhpc3RzXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5yZXN1bHQuc3RhdHVzID09PSBcInZhbGlkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQucmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCBpc3N1ZXMgZnJvbSBkaXJ0eSBvcHRpb25cbiAgICAgICAgICAgICAgICAgICAgY3R4LmNvbW1vbi5pc3N1ZXMucHVzaCguLi5yZXN1bHQuY3R4LmNvbW1vbi5pc3N1ZXMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LnJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZXR1cm4gaW52YWxpZFxuICAgICAgICAgICAgY29uc3QgdW5pb25FcnJvcnMgPSByZXN1bHRzLm1hcCgocmVzdWx0KSA9PiBuZXcgWm9kRXJyb3IocmVzdWx0LmN0eC5jb21tb24uaXNzdWVzKSk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbixcbiAgICAgICAgICAgICAgICB1bmlvbkVycm9ycyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChvcHRpb25zLm1hcChhc3luYyAob3B0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRDdHggPSB7XG4gICAgICAgICAgICAgICAgICAgIC4uLmN0eCxcbiAgICAgICAgICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5jdHguY29tbW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBudWxsLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBhd2FpdCBvcHRpb24uX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogY2hpbGRDdHgsXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBjdHg6IGNoaWxkQ3R4LFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSkudGhlbihoYW5kbGVSZXN1bHRzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBkaXJ0eSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGNvbnN0IGlzc3VlcyA9IFtdO1xuICAgICAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2Ygb3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkQ3R4ID0ge1xuICAgICAgICAgICAgICAgICAgICAuLi5jdHgsXG4gICAgICAgICAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uY3R4LmNvbW1vbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogbnVsbCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG9wdGlvbi5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGNoaWxkQ3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBcInZhbGlkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiICYmICFkaXJ0eSkge1xuICAgICAgICAgICAgICAgICAgICBkaXJ0eSA9IHsgcmVzdWx0LCBjdHg6IGNoaWxkQ3R4IH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjaGlsZEN0eC5jb21tb24uaXNzdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBpc3N1ZXMucHVzaChjaGlsZEN0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGlydHkpIHtcbiAgICAgICAgICAgICAgICBjdHguY29tbW9uLmlzc3Vlcy5wdXNoKC4uLmRpcnR5LmN0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGlydHkucmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdW5pb25FcnJvcnMgPSBpc3N1ZXMubWFwKChpc3N1ZXMpID0+IG5ldyBab2RFcnJvcihpc3N1ZXMpKTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3VuaW9uLFxuICAgICAgICAgICAgICAgIHVuaW9uRXJyb3JzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgb3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vcHRpb25zO1xuICAgIH1cbn1cblpvZFVuaW9uLmNyZWF0ZSA9ICh0eXBlcywgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RVbmlvbih7XG4gICAgICAgIG9wdGlvbnM6IHR5cGVzLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFVuaW9uLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vLy8vLy8vL1xuLy8vLy8vLy8vLyAgICAgIFpvZERpc2NyaW1pbmF0ZWRVbmlvbiAgICAgIC8vLy8vLy8vLy9cbi8vLy8vLy8vLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmNvbnN0IGdldERpc2NyaW1pbmF0b3IgPSAodHlwZSkgPT4ge1xuICAgIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTGF6eSkge1xuICAgICAgICByZXR1cm4gZ2V0RGlzY3JpbWluYXRvcih0eXBlLnNjaGVtYSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RFZmZlY3RzKSB7XG4gICAgICAgIHJldHVybiBnZXREaXNjcmltaW5hdG9yKHR5cGUuaW5uZXJUeXBlKCkpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTGl0ZXJhbCkge1xuICAgICAgICByZXR1cm4gW3R5cGUudmFsdWVdO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kRW51bSkge1xuICAgICAgICByZXR1cm4gdHlwZS5vcHRpb25zO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTmF0aXZlRW51bSkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgYmFuL2JhblxuICAgICAgICByZXR1cm4gdXRpbC5vYmplY3RWYWx1ZXModHlwZS5lbnVtKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZERlZmF1bHQpIHtcbiAgICAgICAgcmV0dXJuIGdldERpc2NyaW1pbmF0b3IodHlwZS5fZGVmLmlubmVyVHlwZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RVbmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIFt1bmRlZmluZWRdO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTnVsbCkge1xuICAgICAgICByZXR1cm4gW251bGxdO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kT3B0aW9uYWwpIHtcbiAgICAgICAgcmV0dXJuIFt1bmRlZmluZWQsIC4uLmdldERpc2NyaW1pbmF0b3IodHlwZS51bndyYXAoKSldO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kTnVsbGFibGUpIHtcbiAgICAgICAgcmV0dXJuIFtudWxsLCAuLi5nZXREaXNjcmltaW5hdG9yKHR5cGUudW53cmFwKCkpXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZEJyYW5kZWQpIHtcbiAgICAgICAgcmV0dXJuIGdldERpc2NyaW1pbmF0b3IodHlwZS51bndyYXAoKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RSZWFkb25seSkge1xuICAgICAgICByZXR1cm4gZ2V0RGlzY3JpbWluYXRvcih0eXBlLnVud3JhcCgpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZENhdGNoKSB7XG4gICAgICAgIHJldHVybiBnZXREaXNjcmltaW5hdG9yKHR5cGUuX2RlZi5pbm5lclR5cGUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbn07XG5leHBvcnQgY2xhc3MgWm9kRGlzY3JpbWluYXRlZFVuaW9uIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUub2JqZWN0KSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm9iamVjdCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRpc2NyaW1pbmF0b3IgPSB0aGlzLmRpc2NyaW1pbmF0b3I7XG4gICAgICAgIGNvbnN0IGRpc2NyaW1pbmF0b3JWYWx1ZSA9IGN0eC5kYXRhW2Rpc2NyaW1pbmF0b3JdO1xuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLm9wdGlvbnNNYXAuZ2V0KGRpc2NyaW1pbmF0b3JWYWx1ZSk7XG4gICAgICAgIGlmICghb3B0aW9uKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbl9kaXNjcmltaW5hdG9yLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IEFycmF5LmZyb20odGhpcy5vcHRpb25zTWFwLmtleXMoKSksXG4gICAgICAgICAgICAgICAgcGF0aDogW2Rpc2NyaW1pbmF0b3JdLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb24uX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgZGlzY3JpbWluYXRvcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5kaXNjcmltaW5hdG9yO1xuICAgIH1cbiAgICBnZXQgb3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vcHRpb25zO1xuICAgIH1cbiAgICBnZXQgb3B0aW9uc01hcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vcHRpb25zTWFwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGUgY29uc3RydWN0b3Igb2YgdGhlIGRpc2NyaW1pbmF0ZWQgdW5pb24gc2NoZW1hLiBJdHMgYmVoYXZpb3VyIGlzIHZlcnkgc2ltaWxhciB0byB0aGF0IG9mIHRoZSBub3JtYWwgei51bmlvbigpIGNvbnN0cnVjdG9yLlxuICAgICAqIEhvd2V2ZXIsIGl0IG9ubHkgYWxsb3dzIGEgdW5pb24gb2Ygb2JqZWN0cywgYWxsIG9mIHdoaWNoIG5lZWQgdG8gc2hhcmUgYSBkaXNjcmltaW5hdG9yIHByb3BlcnR5LiBUaGlzIHByb3BlcnR5IG11c3RcbiAgICAgKiBoYXZlIGEgZGlmZmVyZW50IHZhbHVlIGZvciBlYWNoIG9iamVjdCBpbiB0aGUgdW5pb24uXG4gICAgICogQHBhcmFtIGRpc2NyaW1pbmF0b3IgdGhlIG5hbWUgb2YgdGhlIGRpc2NyaW1pbmF0b3IgcHJvcGVydHlcbiAgICAgKiBAcGFyYW0gdHlwZXMgYW4gYXJyYXkgb2Ygb2JqZWN0IHNjaGVtYXNcbiAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZShkaXNjcmltaW5hdG9yLCBvcHRpb25zLCBwYXJhbXMpIHtcbiAgICAgICAgLy8gR2V0IGFsbCB0aGUgdmFsaWQgZGlzY3JpbWluYXRvciB2YWx1ZXNcbiAgICAgICAgY29uc3Qgb3B0aW9uc01hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgLy8gdHJ5IHtcbiAgICAgICAgZm9yIChjb25zdCB0eXBlIG9mIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpc2NyaW1pbmF0b3JWYWx1ZXMgPSBnZXREaXNjcmltaW5hdG9yKHR5cGUuc2hhcGVbZGlzY3JpbWluYXRvcl0pO1xuICAgICAgICAgICAgaWYgKCFkaXNjcmltaW5hdG9yVmFsdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQSBkaXNjcmltaW5hdG9yIHZhbHVlIGZvciBrZXkgXFxgJHtkaXNjcmltaW5hdG9yfVxcYCBjb3VsZCBub3QgYmUgZXh0cmFjdGVkIGZyb20gYWxsIHNjaGVtYSBvcHRpb25zYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIGRpc2NyaW1pbmF0b3JWYWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9uc01hcC5oYXModmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRGlzY3JpbWluYXRvciBwcm9wZXJ0eSAke1N0cmluZyhkaXNjcmltaW5hdG9yKX0gaGFzIGR1cGxpY2F0ZSB2YWx1ZSAke1N0cmluZyh2YWx1ZSl9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9wdGlvbnNNYXAuc2V0KHZhbHVlLCB0eXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZERpc2NyaW1pbmF0ZWRVbmlvbih7XG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZERpc2NyaW1pbmF0ZWRVbmlvbixcbiAgICAgICAgICAgIGRpc2NyaW1pbmF0b3IsXG4gICAgICAgICAgICBvcHRpb25zLFxuICAgICAgICAgICAgb3B0aW9uc01hcCxcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZnVuY3Rpb24gbWVyZ2VWYWx1ZXMoYSwgYikge1xuICAgIGNvbnN0IGFUeXBlID0gZ2V0UGFyc2VkVHlwZShhKTtcbiAgICBjb25zdCBiVHlwZSA9IGdldFBhcnNlZFR5cGUoYik7XG4gICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIGRhdGE6IGEgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYVR5cGUgPT09IFpvZFBhcnNlZFR5cGUub2JqZWN0ICYmIGJUeXBlID09PSBab2RQYXJzZWRUeXBlLm9iamVjdCkge1xuICAgICAgICBjb25zdCBiS2V5cyA9IHV0aWwub2JqZWN0S2V5cyhiKTtcbiAgICAgICAgY29uc3Qgc2hhcmVkS2V5cyA9IHV0aWwub2JqZWN0S2V5cyhhKS5maWx0ZXIoKGtleSkgPT4gYktleXMuaW5kZXhPZihrZXkpICE9PSAtMSk7XG4gICAgICAgIGNvbnN0IG5ld09iaiA9IHsgLi4uYSwgLi4uYiB9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBzaGFyZWRLZXlzKSB7XG4gICAgICAgICAgICBjb25zdCBzaGFyZWRWYWx1ZSA9IG1lcmdlVmFsdWVzKGFba2V5XSwgYltrZXldKTtcbiAgICAgICAgICAgIGlmICghc2hhcmVkVmFsdWUudmFsaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld09ialtrZXldID0gc2hhcmVkVmFsdWUuZGF0YTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgZGF0YTogbmV3T2JqIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKGFUeXBlID09PSBab2RQYXJzZWRUeXBlLmFycmF5ICYmIGJUeXBlID09PSBab2RQYXJzZWRUeXBlLmFycmF5KSB7XG4gICAgICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ld0FycmF5ID0gW107XG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgaXRlbUEgPSBhW2luZGV4XTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1CID0gYltpbmRleF07XG4gICAgICAgICAgICBjb25zdCBzaGFyZWRWYWx1ZSA9IG1lcmdlVmFsdWVzKGl0ZW1BLCBpdGVtQik7XG4gICAgICAgICAgICBpZiAoIXNoYXJlZFZhbHVlLnZhbGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdBcnJheS5wdXNoKHNoYXJlZFZhbHVlLmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBuZXdBcnJheSB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChhVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS5kYXRlICYmIGJUeXBlID09PSBab2RQYXJzZWRUeXBlLmRhdGUgJiYgK2EgPT09ICtiKSB7XG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBhIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UgfTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgWm9kSW50ZXJzZWN0aW9uIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGhhbmRsZVBhcnNlZCA9IChwYXJzZWRMZWZ0LCBwYXJzZWRSaWdodCkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzQWJvcnRlZChwYXJzZWRMZWZ0KSB8fCBpc0Fib3J0ZWQocGFyc2VkUmlnaHQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtZXJnZWQgPSBtZXJnZVZhbHVlcyhwYXJzZWRMZWZ0LnZhbHVlLCBwYXJzZWRSaWdodC52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoIW1lcmdlZC52YWxpZCkge1xuICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9pbnRlcnNlY3Rpb25fdHlwZXMsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNEaXJ0eShwYXJzZWRMZWZ0KSB8fCBpc0RpcnR5KHBhcnNlZFJpZ2h0KSkge1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBtZXJnZWQuZGF0YSB9O1xuICAgICAgICB9O1xuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWYubGVmdC5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgdGhpcy5fZGVmLnJpZ2h0Ll9wYXJzZUFzeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0pLnRoZW4oKFtsZWZ0LCByaWdodF0pID0+IGhhbmRsZVBhcnNlZChsZWZ0LCByaWdodCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZVBhcnNlZCh0aGlzLl9kZWYubGVmdC5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgIH0pLCB0aGlzLl9kZWYucmlnaHQuX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5ab2RJbnRlcnNlY3Rpb24uY3JlYXRlID0gKGxlZnQsIHJpZ2h0LCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEludGVyc2VjdGlvbih7XG4gICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgIHJpZ2h0OiByaWdodCxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RJbnRlcnNlY3Rpb24sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG4vLyB0eXBlIFpvZFR1cGxlSXRlbXMgPSBbWm9kVHlwZUFueSwgLi4uWm9kVHlwZUFueVtdXTtcbmV4cG9ydCBjbGFzcyBab2RUdXBsZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuYXJyYXkpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuYXJyYXksXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmRhdGEubGVuZ3RoIDwgdGhpcy5fZGVmLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICBtaW5pbXVtOiB0aGlzLl9kZWYuaXRlbXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN0ID0gdGhpcy5fZGVmLnJlc3Q7XG4gICAgICAgIGlmICghcmVzdCAmJiBjdHguZGF0YS5sZW5ndGggPiB0aGlzLl9kZWYuaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICBtYXhpbXVtOiB0aGlzLl9kZWYuaXRlbXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpdGVtcyA9IFsuLi5jdHguZGF0YV1cbiAgICAgICAgICAgIC5tYXAoKGl0ZW0sIGl0ZW1JbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2NoZW1hID0gdGhpcy5fZGVmLml0ZW1zW2l0ZW1JbmRleF0gfHwgdGhpcy5fZGVmLnJlc3Q7XG4gICAgICAgICAgICBpZiAoIXNjaGVtYSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBzY2hlbWEuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBpdGVtLCBjdHgucGF0aCwgaXRlbUluZGV4KSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuZmlsdGVyKCh4KSA9PiAhIXgpOyAvLyBmaWx0ZXIgbnVsbHNcbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChpdGVtcykudGhlbigocmVzdWx0cykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgcmVzdWx0cyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZUFycmF5KHN0YXR1cywgaXRlbXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBpdGVtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pdGVtcztcbiAgICB9XG4gICAgcmVzdChyZXN0KSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kVHVwbGUoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgcmVzdCxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuWm9kVHVwbGUuY3JlYXRlID0gKHNjaGVtYXMsIHBhcmFtcykgPT4ge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShzY2hlbWFzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGFuIGFycmF5IG9mIHNjaGVtYXMgdG8gei50dXBsZShbIC4uLiBdKVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBab2RUdXBsZSh7XG4gICAgICAgIGl0ZW1zOiBzY2hlbWFzLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFR1cGxlLFxuICAgICAgICByZXN0OiBudWxsLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZFJlY29yZCBleHRlbmRzIFpvZFR5cGUge1xuICAgIGdldCBrZXlTY2hlbWEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYua2V5VHlwZTtcbiAgICB9XG4gICAgZ2V0IHZhbHVlU2NoZW1hKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5vYmplY3QpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUub2JqZWN0LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFpcnMgPSBbXTtcbiAgICAgICAgY29uc3Qga2V5VHlwZSA9IHRoaXMuX2RlZi5rZXlUeXBlO1xuICAgICAgICBjb25zdCB2YWx1ZVR5cGUgPSB0aGlzLl9kZWYudmFsdWVUeXBlO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBjdHguZGF0YSkge1xuICAgICAgICAgICAgcGFpcnMucHVzaCh7XG4gICAgICAgICAgICAgICAga2V5OiBrZXlUeXBlLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwga2V5LCBjdHgucGF0aCwga2V5KSksXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlVHlwZS5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIGN0eC5kYXRhW2tleV0sIGN0eC5wYXRoLCBrZXkpKSxcbiAgICAgICAgICAgICAgICBhbHdheXNTZXQ6IGtleSBpbiBjdHguZGF0YSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VPYmplY3RBc3luYyhzdGF0dXMsIHBhaXJzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZU9iamVjdFN5bmMoc3RhdHVzLCBwYWlycyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWVUeXBlO1xuICAgIH1cbiAgICBzdGF0aWMgY3JlYXRlKGZpcnN0LCBzZWNvbmQsIHRoaXJkKSB7XG4gICAgICAgIGlmIChzZWNvbmQgaW5zdGFuY2VvZiBab2RUeXBlKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFpvZFJlY29yZCh7XG4gICAgICAgICAgICAgICAga2V5VHlwZTogZmlyc3QsXG4gICAgICAgICAgICAgICAgdmFsdWVUeXBlOiBzZWNvbmQsXG4gICAgICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RSZWNvcmQsXG4gICAgICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyh0aGlyZCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZFJlY29yZCh7XG4gICAgICAgICAgICBrZXlUeXBlOiBab2RTdHJpbmcuY3JlYXRlKCksXG4gICAgICAgICAgICB2YWx1ZVR5cGU6IGZpcnN0LFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RSZWNvcmQsXG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHNlY29uZCksXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RNYXAgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBnZXQga2V5U2NoZW1hKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmtleVR5cGU7XG4gICAgfVxuICAgIGdldCB2YWx1ZVNjaGVtYSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi52YWx1ZVR5cGU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUubWFwKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm1hcCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleVR5cGUgPSB0aGlzLl9kZWYua2V5VHlwZTtcbiAgICAgICAgY29uc3QgdmFsdWVUeXBlID0gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICAgICAgY29uc3QgcGFpcnMgPSBbLi4uY3R4LmRhdGEuZW50cmllcygpXS5tYXAoKFtrZXksIHZhbHVlXSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAga2V5OiBrZXlUeXBlLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwga2V5LCBjdHgucGF0aCwgW2luZGV4LCBcImtleVwiXSkpLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVR5cGUuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCB2YWx1ZSwgY3R4LnBhdGgsIFtpbmRleCwgXCJ2YWx1ZVwiXSkpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICBjb25zdCBmaW5hbE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgcGFpci5rZXk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgcGFpci52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiYWJvcnRlZFwiIHx8IHZhbHVlLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkuc3RhdHVzID09PSBcImRpcnR5XCIgfHwgdmFsdWUuc3RhdHVzID09PSBcImRpcnR5XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsTWFwLnNldChrZXkudmFsdWUsIHZhbHVlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBmaW5hbE1hcCB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBmaW5hbE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IHBhaXIua2V5O1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFpci52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIgfHwgdmFsdWUuc3RhdHVzID09PSBcImFib3J0ZWRcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiZGlydHlcIiB8fCB2YWx1ZS5zdGF0dXMgPT09IFwiZGlydHlcIikge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxNYXAuc2V0KGtleS52YWx1ZSwgdmFsdWUudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBmaW5hbE1hcCB9O1xuICAgICAgICB9XG4gICAgfVxufVxuWm9kTWFwLmNyZWF0ZSA9IChrZXlUeXBlLCB2YWx1ZVR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTWFwKHtcbiAgICAgICAgdmFsdWVUeXBlLFxuICAgICAgICBrZXlUeXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE1hcCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RTZXQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLnNldCkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5zZXQsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZWYgPSB0aGlzLl9kZWY7XG4gICAgICAgIGlmIChkZWYubWluU2l6ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGN0eC5kYXRhLnNpemUgPCBkZWYubWluU2l6ZS52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBkZWYubWluU2l6ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzZXRcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5taW5TaXplLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZi5tYXhTaXplICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoY3R4LmRhdGEuc2l6ZSA+IGRlZi5tYXhTaXplLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBkZWYubWF4U2l6ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzZXRcIixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5tYXhTaXplLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWVUeXBlID0gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICAgICAgZnVuY3Rpb24gZmluYWxpemVTZXQoZWxlbWVudHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZFNldCA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50cykge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICBwYXJzZWRTZXQuYWRkKGVsZW1lbnQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBwYXJzZWRTZXQgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IFsuLi5jdHguZGF0YS52YWx1ZXMoKV0ubWFwKChpdGVtLCBpKSA9PiB2YWx1ZVR5cGUuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBpdGVtLCBjdHgucGF0aCwgaSkpKTtcbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChlbGVtZW50cykudGhlbigoZWxlbWVudHMpID0+IGZpbmFsaXplU2V0KGVsZW1lbnRzKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmluYWxpemVTZXQoZWxlbWVudHMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIG1pbihtaW5TaXplLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kU2V0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIG1pblNpemU6IHsgdmFsdWU6IG1pblNpemUsIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbWF4KG1heFNpemUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTZXQoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgbWF4U2l6ZTogeyB2YWx1ZTogbWF4U2l6ZSwgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzaXplKHNpemUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluKHNpemUsIG1lc3NhZ2UpLm1heChzaXplLCBtZXNzYWdlKTtcbiAgICB9XG4gICAgbm9uZW1wdHkobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5taW4oMSwgbWVzc2FnZSk7XG4gICAgfVxufVxuWm9kU2V0LmNyZWF0ZSA9ICh2YWx1ZVR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kU2V0KHtcbiAgICAgICAgdmFsdWVUeXBlLFxuICAgICAgICBtaW5TaXplOiBudWxsLFxuICAgICAgICBtYXhTaXplOiBudWxsLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFNldCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RGdW5jdGlvbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnZhbGlkYXRlID0gdGhpcy5pbXBsZW1lbnQ7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLmZ1bmN0aW9uKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gbWFrZUFyZ3NJc3N1ZShhcmdzLCBlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIG1ha2VJc3N1ZSh7XG4gICAgICAgICAgICAgICAgZGF0YTogYXJncyxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBlcnJvck1hcHM6IFtjdHguY29tbW9uLmNvbnRleHR1YWxFcnJvck1hcCwgY3R4LnNjaGVtYUVycm9yTWFwLCBnZXRFcnJvck1hcCgpLCBkZWZhdWx0RXJyb3JNYXBdLmZpbHRlcigoeCkgPT4gISF4KSxcbiAgICAgICAgICAgICAgICBpc3N1ZURhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfYXJndW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHNFcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VSZXR1cm5zSXNzdWUocmV0dXJucywgZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBtYWtlSXNzdWUoe1xuICAgICAgICAgICAgICAgIGRhdGE6IHJldHVybnMsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgZXJyb3JNYXBzOiBbY3R4LmNvbW1vbi5jb250ZXh0dWFsRXJyb3JNYXAsIGN0eC5zY2hlbWFFcnJvck1hcCwgZ2V0RXJyb3JNYXAoKSwgZGVmYXVsdEVycm9yTWFwXS5maWx0ZXIoKHgpID0+ICEheCksXG4gICAgICAgICAgICAgICAgaXNzdWVEYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3JldHVybl90eXBlLFxuICAgICAgICAgICAgICAgICAgICByZXR1cm5UeXBlRXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJhbXMgPSB7IGVycm9yTWFwOiBjdHguY29tbW9uLmNvbnRleHR1YWxFcnJvck1hcCB9O1xuICAgICAgICBjb25zdCBmbiA9IGN0eC5kYXRhO1xuICAgICAgICBpZiAodGhpcy5fZGVmLnJldHVybnMgaW5zdGFuY2VvZiBab2RQcm9taXNlKSB7XG4gICAgICAgICAgICAvLyBXb3VsZCBsb3ZlIGEgd2F5IHRvIGF2b2lkIGRpc2FibGluZyB0aGlzIHJ1bGUsIGJ1dCB3ZSBuZWVkXG4gICAgICAgICAgICAvLyBhbiBhbGlhcyAodXNpbmcgYW4gYXJyb3cgZnVuY3Rpb24gd2FzIHdoYXQgY2F1c2VkIDI2NTEpLlxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG4gICAgICAgICAgICBjb25zdCBtZSA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4gT0soYXN5bmMgZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBab2RFcnJvcihbXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkQXJncyA9IGF3YWl0IG1lLl9kZWYuYXJncy5wYXJzZUFzeW5jKGFyZ3MsIHBhcmFtcykuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IuYWRkSXNzdWUobWFrZUFyZ3NJc3N1ZShhcmdzLCBlKSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFJlZmxlY3QuYXBwbHkoZm4sIHRoaXMsIHBhcnNlZEFyZ3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZFJldHVybnMgPSBhd2FpdCBtZS5fZGVmLnJldHVybnMuX2RlZi50eXBlXG4gICAgICAgICAgICAgICAgICAgIC5wYXJzZUFzeW5jKHJlc3VsdCwgcGFyYW1zKVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IuYWRkSXNzdWUobWFrZVJldHVybnNJc3N1ZShyZXN1bHQsIGUpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlZFJldHVybnM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFdvdWxkIGxvdmUgYSB3YXkgdG8gYXZvaWQgZGlzYWJsaW5nIHRoaXMgcnVsZSwgYnV0IHdlIG5lZWRcbiAgICAgICAgICAgIC8vIGFuIGFsaWFzICh1c2luZyBhbiBhcnJvdyBmdW5jdGlvbiB3YXMgd2hhdCBjYXVzZWQgMjY1MSkuXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcbiAgICAgICAgICAgIGNvbnN0IG1lID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiBPSyhmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZEFyZ3MgPSBtZS5fZGVmLmFyZ3Muc2FmZVBhcnNlKGFyZ3MsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJzZWRBcmdzLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFpvZEVycm9yKFttYWtlQXJnc0lzc3VlKGFyZ3MsIHBhcnNlZEFyZ3MuZXJyb3IpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IFJlZmxlY3QuYXBwbHkoZm4sIHRoaXMsIHBhcnNlZEFyZ3MuZGF0YSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkUmV0dXJucyA9IG1lLl9kZWYucmV0dXJucy5zYWZlUGFyc2UocmVzdWx0LCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIGlmICghcGFyc2VkUmV0dXJucy5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBab2RFcnJvcihbbWFrZVJldHVybnNJc3N1ZShyZXN1bHQsIHBhcnNlZFJldHVybnMuZXJyb3IpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZWRSZXR1cm5zLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwYXJhbWV0ZXJzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmFyZ3M7XG4gICAgfVxuICAgIHJldHVyblR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYucmV0dXJucztcbiAgICB9XG4gICAgYXJncyguLi5pdGVtcykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEZ1bmN0aW9uKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGFyZ3M6IFpvZFR1cGxlLmNyZWF0ZShpdGVtcykucmVzdChab2RVbmtub3duLmNyZWF0ZSgpKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybnMocmV0dXJuVHlwZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEZ1bmN0aW9uKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHJldHVybnM6IHJldHVyblR5cGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbXBsZW1lbnQoZnVuYykge1xuICAgICAgICBjb25zdCB2YWxpZGF0ZWRGdW5jID0gdGhpcy5wYXJzZShmdW5jKTtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlZEZ1bmM7XG4gICAgfVxuICAgIHN0cmljdEltcGxlbWVudChmdW5jKSB7XG4gICAgICAgIGNvbnN0IHZhbGlkYXRlZEZ1bmMgPSB0aGlzLnBhcnNlKGZ1bmMpO1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVkRnVuYztcbiAgICB9XG4gICAgc3RhdGljIGNyZWF0ZShhcmdzLCByZXR1cm5zLCBwYXJhbXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RGdW5jdGlvbih7XG4gICAgICAgICAgICBhcmdzOiAoYXJncyA/IGFyZ3MgOiBab2RUdXBsZS5jcmVhdGUoW10pLnJlc3QoWm9kVW5rbm93bi5jcmVhdGUoKSkpLFxuICAgICAgICAgICAgcmV0dXJuczogcmV0dXJucyB8fCBab2RVbmtub3duLmNyZWF0ZSgpLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RGdW5jdGlvbixcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFpvZExhenkgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBnZXQgc2NoZW1hKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmdldHRlcigpO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGxhenlTY2hlbWEgPSB0aGlzLl9kZWYuZ2V0dGVyKCk7XG4gICAgICAgIHJldHVybiBsYXp5U2NoZW1hLl9wYXJzZSh7IGRhdGE6IGN0eC5kYXRhLCBwYXRoOiBjdHgucGF0aCwgcGFyZW50OiBjdHggfSk7XG4gICAgfVxufVxuWm9kTGF6eS5jcmVhdGUgPSAoZ2V0dGVyLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZExhenkoe1xuICAgICAgICBnZXR0ZXI6IGdldHRlcixcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RMYXp5LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZExpdGVyYWwgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgaWYgKGlucHV0LmRhdGEgIT09IHRoaXMuX2RlZi52YWx1ZSkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX2xpdGVyYWwsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IHRoaXMuX2RlZi52YWx1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlOiBpbnB1dC5kYXRhIH07XG4gICAgfVxuICAgIGdldCB2YWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi52YWx1ZTtcbiAgICB9XG59XG5ab2RMaXRlcmFsLmNyZWF0ZSA9ICh2YWx1ZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RMaXRlcmFsKHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZExpdGVyYWwsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5mdW5jdGlvbiBjcmVhdGVab2RFbnVtKHZhbHVlcywgcGFyYW1zKSB7XG4gICAgcmV0dXJuIG5ldyBab2RFbnVtKHtcbiAgICAgICAgdmFsdWVzLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVudW0sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn1cbmV4cG9ydCBjbGFzcyBab2RFbnVtIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQuZGF0YSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWRWYWx1ZXMgPSB0aGlzLl9kZWYudmFsdWVzO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IHV0aWwuam9pblZhbHVlcyhleHBlY3RlZFZhbHVlcyksXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fY2FjaGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlID0gbmV3IFNldCh0aGlzLl9kZWYudmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlLmhhcyhpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWRWYWx1ZXMgPSB0aGlzLl9kZWYudmFsdWVzO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX2VudW1fdmFsdWUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogZXhwZWN0ZWRWYWx1ZXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG4gICAgZ2V0IG9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWVzO1xuICAgIH1cbiAgICBnZXQgZW51bSgpIHtcbiAgICAgICAgY29uc3QgZW51bVZhbHVlcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHZhbCBvZiB0aGlzLl9kZWYudmFsdWVzKSB7XG4gICAgICAgICAgICBlbnVtVmFsdWVzW3ZhbF0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVudW1WYWx1ZXM7XG4gICAgfVxuICAgIGdldCBWYWx1ZXMoKSB7XG4gICAgICAgIGNvbnN0IGVudW1WYWx1ZXMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCB2YWwgb2YgdGhpcy5fZGVmLnZhbHVlcykge1xuICAgICAgICAgICAgZW51bVZhbHVlc1t2YWxdID0gdmFsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbnVtVmFsdWVzO1xuICAgIH1cbiAgICBnZXQgRW51bSgpIHtcbiAgICAgICAgY29uc3QgZW51bVZhbHVlcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHZhbCBvZiB0aGlzLl9kZWYudmFsdWVzKSB7XG4gICAgICAgICAgICBlbnVtVmFsdWVzW3ZhbF0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVudW1WYWx1ZXM7XG4gICAgfVxuICAgIGV4dHJhY3QodmFsdWVzLCBuZXdEZWYgPSB0aGlzLl9kZWYpIHtcbiAgICAgICAgcmV0dXJuIFpvZEVudW0uY3JlYXRlKHZhbHVlcywge1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgLi4ubmV3RGVmLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZXhjbHVkZSh2YWx1ZXMsIG5ld0RlZiA9IHRoaXMuX2RlZikge1xuICAgICAgICByZXR1cm4gWm9kRW51bS5jcmVhdGUodGhpcy5vcHRpb25zLmZpbHRlcigob3B0KSA9PiAhdmFsdWVzLmluY2x1ZGVzKG9wdCkpLCB7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICAuLi5uZXdEZWYsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblpvZEVudW0uY3JlYXRlID0gY3JlYXRlWm9kRW51bTtcbmV4cG9ydCBjbGFzcyBab2ROYXRpdmVFbnVtIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IG5hdGl2ZUVudW1WYWx1ZXMgPSB1dGlsLmdldFZhbGlkRW51bVZhbHVlcyh0aGlzLl9kZWYudmFsdWVzKTtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuc3RyaW5nICYmIGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLm51bWJlcikge1xuICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWRWYWx1ZXMgPSB1dGlsLm9iamVjdFZhbHVlcyhuYXRpdmVFbnVtVmFsdWVzKTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiB1dGlsLmpvaW5WYWx1ZXMoZXhwZWN0ZWRWYWx1ZXMpLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZSA9IG5ldyBTZXQodXRpbC5nZXRWYWxpZEVudW1WYWx1ZXModGhpcy5fZGVmLnZhbHVlcykpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fY2FjaGUuaGFzKGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICBjb25zdCBleHBlY3RlZFZhbHVlcyA9IHV0aWwub2JqZWN0VmFsdWVzKG5hdGl2ZUVudW1WYWx1ZXMpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX2VudW1fdmFsdWUsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogZXhwZWN0ZWRWYWx1ZXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG4gICAgZ2V0IGVudW0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWVzO1xuICAgIH1cbn1cblpvZE5hdGl2ZUVudW0uY3JlYXRlID0gKHZhbHVlcywgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2ROYXRpdmVFbnVtKHtcbiAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTmF0aXZlRW51bSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RQcm9taXNlIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgdW53cmFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnR5cGU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLnByb21pc2UgJiYgY3R4LmNvbW1vbi5hc3luYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUucHJvbWlzZSxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb21pc2lmaWVkID0gY3R4LnBhcnNlZFR5cGUgPT09IFpvZFBhcnNlZFR5cGUucHJvbWlzZSA/IGN0eC5kYXRhIDogUHJvbWlzZS5yZXNvbHZlKGN0eC5kYXRhKTtcbiAgICAgICAgcmV0dXJuIE9LKHByb21pc2lmaWVkLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kZWYudHlwZS5wYXJzZUFzeW5jKGRhdGEsIHtcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBlcnJvck1hcDogY3R4LmNvbW1vbi5jb250ZXh0dWFsRXJyb3JNYXAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkpO1xuICAgIH1cbn1cblpvZFByb21pc2UuY3JlYXRlID0gKHNjaGVtYSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RQcm9taXNlKHtcbiAgICAgICAgdHlwZTogc2NoZW1hLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFByb21pc2UsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kRWZmZWN0cyBleHRlbmRzIFpvZFR5cGUge1xuICAgIGlubmVyVHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zY2hlbWE7XG4gICAgfVxuICAgIHNvdXJjZVR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuc2NoZW1hLl9kZWYudHlwZU5hbWUgPT09IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFZmZlY3RzXG4gICAgICAgICAgICA/IHRoaXMuX2RlZi5zY2hlbWEuc291cmNlVHlwZSgpXG4gICAgICAgICAgICA6IHRoaXMuX2RlZi5zY2hlbWE7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCBlZmZlY3QgPSB0aGlzLl9kZWYuZWZmZWN0IHx8IG51bGw7XG4gICAgICAgIGNvbnN0IGNoZWNrQ3R4ID0ge1xuICAgICAgICAgICAgYWRkSXNzdWU6IChhcmcpID0+IHtcbiAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIGFyZyk7XG4gICAgICAgICAgICAgICAgaWYgKGFyZy5mYXRhbCkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXQgcGF0aCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3R4LnBhdGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICBjaGVja0N0eC5hZGRJc3N1ZSA9IGNoZWNrQ3R4LmFkZElzc3VlLmJpbmQoY2hlY2tDdHgpO1xuICAgICAgICBpZiAoZWZmZWN0LnR5cGUgPT09IFwicHJlcHJvY2Vzc1wiKSB7XG4gICAgICAgICAgICBjb25zdCBwcm9jZXNzZWQgPSBlZmZlY3QudHJhbnNmb3JtKGN0eC5kYXRhLCBjaGVja0N0eCk7XG4gICAgICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocHJvY2Vzc2VkKS50aGVuKGFzeW5jIChwcm9jZXNzZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cy52YWx1ZSA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fZGVmLnNjaGVtYS5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBwcm9jZXNzZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gRElSVFkocmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cy52YWx1ZSA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERJUlRZKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzLnZhbHVlID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fZGVmLnNjaGVtYS5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcHJvY2Vzc2VkLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRElSVFkocmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzLnZhbHVlID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBESVJUWShyZXN1bHQudmFsdWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVmZmVjdC50eXBlID09PSBcInJlZmluZW1lbnRcIikge1xuICAgICAgICAgICAgY29uc3QgZXhlY3V0ZVJlZmluZW1lbnQgPSAoYWNjKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZWZmZWN0LnJlZmluZW1lbnQoYWNjLCBjaGVja0N0eCk7XG4gICAgICAgICAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luYyByZWZpbmVtZW50IGVuY291bnRlcmVkIGR1cmluZyBzeW5jaHJvbm91cyBwYXJzZSBvcGVyYXRpb24uIFVzZSAucGFyc2VBc3luYyBpbnN0ZWFkLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbm5lciA9IHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGlubmVyLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgIGlmIChpbm5lci5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHZhbHVlIGlzIGlnbm9yZWRcbiAgICAgICAgICAgICAgICBleGVjdXRlUmVmaW5lbWVudChpbm5lci52YWx1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBpbm5lci52YWx1ZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlQXN5bmMoeyBkYXRhOiBjdHguZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pLnRoZW4oKGlubmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbm5lci5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbm5lci5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXhlY3V0ZVJlZmluZW1lbnQoaW5uZXIudmFsdWUpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBpbm5lci52YWx1ZSB9O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZWZmZWN0LnR5cGUgPT09IFwidHJhbnNmb3JtXCIpIHtcbiAgICAgICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhc2UgPSB0aGlzLl9kZWYuc2NoZW1hLl9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZChiYXNlKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZWZmZWN0LnRyYW5zZm9ybShiYXNlLnZhbHVlLCBjaGVja0N0eCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3luY2hyb25vdXMgdHJhbnNmb3JtIGVuY291bnRlcmVkIGR1cmluZyBzeW5jaHJvbm91cyBwYXJzZSBvcGVyYXRpb24uIFVzZSAucGFyc2VBc3luYyBpbnN0ZWFkLmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IHJlc3VsdCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlQXN5bmMoeyBkYXRhOiBjdHguZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pLnRoZW4oKGJhc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKGJhc2UpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZWZmZWN0LnRyYW5zZm9ybShiYXNlLnZhbHVlLCBjaGVja0N0eCkpLnRoZW4oKHJlc3VsdCkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoZWZmZWN0KTtcbiAgICB9XG59XG5ab2RFZmZlY3RzLmNyZWF0ZSA9IChzY2hlbWEsIGVmZmVjdCwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RFZmZlY3RzKHtcbiAgICAgICAgc2NoZW1hLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVmZmVjdHMsXG4gICAgICAgIGVmZmVjdCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcblpvZEVmZmVjdHMuY3JlYXRlV2l0aFByZXByb2Nlc3MgPSAocHJlcHJvY2Vzcywgc2NoZW1hLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEVmZmVjdHMoe1xuICAgICAgICBzY2hlbWEsXG4gICAgICAgIGVmZmVjdDogeyB0eXBlOiBcInByZXByb2Nlc3NcIiwgdHJhbnNmb3JtOiBwcmVwcm9jZXNzIH0sXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRWZmZWN0cyxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCB7IFpvZEVmZmVjdHMgYXMgWm9kVHJhbnNmb3JtZXIgfTtcbmV4cG9ydCBjbGFzcyBab2RPcHRpb25hbCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlID09PSBab2RQYXJzZWRUeXBlLnVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIE9LKHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKGlucHV0KTtcbiAgICB9XG4gICAgdW53cmFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmlubmVyVHlwZTtcbiAgICB9XG59XG5ab2RPcHRpb25hbC5jcmVhdGUgPSAodHlwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RPcHRpb25hbCh7XG4gICAgICAgIGlubmVyVHlwZTogdHlwZSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPcHRpb25hbCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2ROdWxsYWJsZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlID09PSBab2RQYXJzZWRUeXBlLm51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBPSyhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmlubmVyVHlwZS5fcGFyc2UoaW5wdXQpO1xuICAgIH1cbiAgICB1bndyYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlO1xuICAgIH1cbn1cblpvZE51bGxhYmxlLmNyZWF0ZSA9ICh0eXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE51bGxhYmxlKHtcbiAgICAgICAgaW5uZXJUeXBlOiB0eXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE51bGxhYmxlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZERlZmF1bHQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGxldCBkYXRhID0gY3R4LmRhdGE7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS51bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9kZWYuZGVmYXVsdFZhbHVlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKHtcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVtb3ZlRGVmYXVsdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuWm9kRGVmYXVsdC5jcmVhdGUgPSAodHlwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2REZWZhdWx0KHtcbiAgICAgICAgaW5uZXJUeXBlOiB0eXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZERlZmF1bHQsXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdHlwZW9mIHBhcmFtcy5kZWZhdWx0ID09PSBcImZ1bmN0aW9uXCIgPyBwYXJhbXMuZGVmYXVsdCA6ICgpID0+IHBhcmFtcy5kZWZhdWx0LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZENhdGNoIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICAvLyBuZXdDdHggaXMgdXNlZCB0byBub3QgY29sbGVjdCBpc3N1ZXMgZnJvbSBpbm5lciB0eXBlcyBpbiBjdHhcbiAgICAgICAgY29uc3QgbmV3Q3R4ID0ge1xuICAgICAgICAgICAgLi4uY3R4LFxuICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgLi4uY3R4LmNvbW1vbixcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fZGVmLmlubmVyVHlwZS5fcGFyc2Uoe1xuICAgICAgICAgICAgZGF0YTogbmV3Q3R4LmRhdGEsXG4gICAgICAgICAgICBwYXRoOiBuZXdDdHgucGF0aCxcbiAgICAgICAgICAgIHBhcmVudDoge1xuICAgICAgICAgICAgICAgIC4uLm5ld0N0eCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaXNBc3luYyhyZXN1bHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogXCJ2YWxpZFwiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmVzdWx0LnN0YXR1cyA9PT0gXCJ2YWxpZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHJlc3VsdC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLl9kZWYuY2F0Y2hWYWx1ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0IGVycm9yKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFpvZEVycm9yKG5ld0N0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBuZXdDdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcInZhbGlkXCIsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC5zdGF0dXMgPT09IFwidmFsaWRcIlxuICAgICAgICAgICAgICAgICAgICA/IHJlc3VsdC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICA6IHRoaXMuX2RlZi5jYXRjaFZhbHVlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldCBlcnJvcigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFpvZEVycm9yKG5ld0N0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogbmV3Q3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZW1vdmVDYXRjaCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuWm9kQ2F0Y2guY3JlYXRlID0gKHR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kQ2F0Y2goe1xuICAgICAgICBpbm5lclR5cGU6IHR5cGUsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQ2F0Y2gsXG4gICAgICAgIGNhdGNoVmFsdWU6IHR5cGVvZiBwYXJhbXMuY2F0Y2ggPT09IFwiZnVuY3Rpb25cIiA/IHBhcmFtcy5jYXRjaCA6ICgpID0+IHBhcmFtcy5jYXRjaCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2ROYU4gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5uYW4pIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUubmFuLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlOiBpbnB1dC5kYXRhIH07XG4gICAgfVxufVxuWm9kTmFOLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE5hTih7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTmFOLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNvbnN0IEJSQU5EID0gU3ltYm9sKFwiem9kX2JyYW5kXCIpO1xuZXhwb3J0IGNsYXNzIFpvZEJyYW5kZWQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBjdHguZGF0YTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi50eXBlLl9wYXJzZSh7XG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHVud3JhcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi50eXBlO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RQaXBlbGluZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlQXN5bmMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5SZXN1bHQgPSBhd2FpdCB0aGlzLl9kZWYuaW4uX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChpblJlc3VsdC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICBpZiAoaW5SZXN1bHQuc3RhdHVzID09PSBcImRpcnR5XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBESVJUWShpblJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGVmLm91dC5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBpblJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlQXN5bmMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGluUmVzdWx0ID0gdGhpcy5fZGVmLmluLl9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoaW5SZXN1bHQuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgIGlmIChpblJlc3VsdC5zdGF0dXMgPT09IFwiZGlydHlcIikge1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogXCJkaXJ0eVwiLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogaW5SZXN1bHQudmFsdWUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9kZWYub3V0Ll9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBpblJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBjcmVhdGUoYSwgYikge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFBpcGVsaW5lKHtcbiAgICAgICAgICAgIGluOiBhLFxuICAgICAgICAgICAgb3V0OiBiLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RQaXBlbGluZSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFpvZFJlYWRvbmx5IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKGlucHV0KTtcbiAgICAgICAgY29uc3QgZnJlZXplID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChpc1ZhbGlkKGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YS52YWx1ZSA9IE9iamVjdC5mcmVlemUoZGF0YS52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGlzQXN5bmMocmVzdWx0KSA/IHJlc3VsdC50aGVuKChkYXRhKSA9PiBmcmVlemUoZGF0YSkpIDogZnJlZXplKHJlc3VsdCk7XG4gICAgfVxuICAgIHVud3JhcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuWm9kUmVhZG9ubHkuY3JlYXRlID0gKHR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kUmVhZG9ubHkoe1xuICAgICAgICBpbm5lclR5cGU6IHR5cGUsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kUmVhZG9ubHksXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgICAgICAgICAgICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgei5jdXN0b20gICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgICAgICAgICAgICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBjbGVhblBhcmFtcyhwYXJhbXMsIGRhdGEpIHtcbiAgICBjb25zdCBwID0gdHlwZW9mIHBhcmFtcyA9PT0gXCJmdW5jdGlvblwiID8gcGFyYW1zKGRhdGEpIDogdHlwZW9mIHBhcmFtcyA9PT0gXCJzdHJpbmdcIiA/IHsgbWVzc2FnZTogcGFyYW1zIH0gOiBwYXJhbXM7XG4gICAgY29uc3QgcDIgPSB0eXBlb2YgcCA9PT0gXCJzdHJpbmdcIiA/IHsgbWVzc2FnZTogcCB9IDogcDtcbiAgICByZXR1cm4gcDI7XG59XG5leHBvcnQgZnVuY3Rpb24gY3VzdG9tKGNoZWNrLCBfcGFyYW1zID0ge30sIFxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICpcbiAqIFBhc3MgYGZhdGFsYCBpbnRvIHRoZSBwYXJhbXMgb2JqZWN0IGluc3RlYWQ6XG4gKlxuICogYGBgdHNcbiAqIHouc3RyaW5nKCkuY3VzdG9tKCh2YWwpID0+IHZhbC5sZW5ndGggPiA1LCB7IGZhdGFsOiBmYWxzZSB9KVxuICogYGBgXG4gKlxuICovXG5mYXRhbCkge1xuICAgIGlmIChjaGVjaylcbiAgICAgICAgcmV0dXJuIFpvZEFueS5jcmVhdGUoKS5zdXBlclJlZmluZSgoZGF0YSwgY3R4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByID0gY2hlY2soZGF0YSk7XG4gICAgICAgICAgICBpZiAociBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gci50aGVuKChyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gY2xlYW5QYXJhbXMoX3BhcmFtcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBfZmF0YWwgPSBwYXJhbXMuZmF0YWwgPz8gZmF0YWwgPz8gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5hZGRJc3N1ZSh7IGNvZGU6IFwiY3VzdG9tXCIsIC4uLnBhcmFtcywgZmF0YWw6IF9mYXRhbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFyKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyYW1zID0gY2xlYW5QYXJhbXMoX3BhcmFtcywgZGF0YSk7XG4gICAgICAgICAgICAgICAgY29uc3QgX2ZhdGFsID0gcGFyYW1zLmZhdGFsID8/IGZhdGFsID8/IHRydWU7XG4gICAgICAgICAgICAgICAgY3R4LmFkZElzc3VlKHsgY29kZTogXCJjdXN0b21cIiwgLi4ucGFyYW1zLCBmYXRhbDogX2ZhdGFsIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9KTtcbiAgICByZXR1cm4gWm9kQW55LmNyZWF0ZSgpO1xufVxuZXhwb3J0IHsgWm9kVHlwZSBhcyBTY2hlbWEsIFpvZFR5cGUgYXMgWm9kU2NoZW1hIH07XG5leHBvcnQgY29uc3QgbGF0ZSA9IHtcbiAgICBvYmplY3Q6IFpvZE9iamVjdC5sYXp5Y3JlYXRlLFxufTtcbmV4cG9ydCB2YXIgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kO1xuKGZ1bmN0aW9uIChab2RGaXJzdFBhcnR5VHlwZUtpbmQpIHtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RTdHJpbmdcIl0gPSBcIlpvZFN0cmluZ1wiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE51bWJlclwiXSA9IFwiWm9kTnVtYmVyXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTmFOXCJdID0gXCJab2ROYU5cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RCaWdJbnRcIl0gPSBcIlpvZEJpZ0ludFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEJvb2xlYW5cIl0gPSBcIlpvZEJvb2xlYW5cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2REYXRlXCJdID0gXCJab2REYXRlXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kU3ltYm9sXCJdID0gXCJab2RTeW1ib2xcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RVbmRlZmluZWRcIl0gPSBcIlpvZFVuZGVmaW5lZFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE51bGxcIl0gPSBcIlpvZE51bGxcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RBbnlcIl0gPSBcIlpvZEFueVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFVua25vd25cIl0gPSBcIlpvZFVua25vd25cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2ROZXZlclwiXSA9IFwiWm9kTmV2ZXJcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RWb2lkXCJdID0gXCJab2RWb2lkXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kQXJyYXlcIl0gPSBcIlpvZEFycmF5XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kT2JqZWN0XCJdID0gXCJab2RPYmplY3RcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RVbmlvblwiXSA9IFwiWm9kVW5pb25cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2REaXNjcmltaW5hdGVkVW5pb25cIl0gPSBcIlpvZERpc2NyaW1pbmF0ZWRVbmlvblwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEludGVyc2VjdGlvblwiXSA9IFwiWm9kSW50ZXJzZWN0aW9uXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kVHVwbGVcIl0gPSBcIlpvZFR1cGxlXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kUmVjb3JkXCJdID0gXCJab2RSZWNvcmRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RNYXBcIl0gPSBcIlpvZE1hcFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFNldFwiXSA9IFwiWm9kU2V0XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kRnVuY3Rpb25cIl0gPSBcIlpvZEZ1bmN0aW9uXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTGF6eVwiXSA9IFwiWm9kTGF6eVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZExpdGVyYWxcIl0gPSBcIlpvZExpdGVyYWxcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RFbnVtXCJdID0gXCJab2RFbnVtXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kRWZmZWN0c1wiXSA9IFwiWm9kRWZmZWN0c1wiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE5hdGl2ZUVudW1cIl0gPSBcIlpvZE5hdGl2ZUVudW1cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RPcHRpb25hbFwiXSA9IFwiWm9kT3B0aW9uYWxcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2ROdWxsYWJsZVwiXSA9IFwiWm9kTnVsbGFibGVcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2REZWZhdWx0XCJdID0gXCJab2REZWZhdWx0XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kQ2F0Y2hcIl0gPSBcIlpvZENhdGNoXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kUHJvbWlzZVwiXSA9IFwiWm9kUHJvbWlzZVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEJyYW5kZWRcIl0gPSBcIlpvZEJyYW5kZWRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RQaXBlbGluZVwiXSA9IFwiWm9kUGlwZWxpbmVcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RSZWFkb25seVwiXSA9IFwiWm9kUmVhZG9ubHlcIjtcbn0pKFpvZEZpcnN0UGFydHlUeXBlS2luZCB8fCAoWm9kRmlyc3RQYXJ0eVR5cGVLaW5kID0ge30pKTtcbi8vIHJlcXVpcmVzIFRTIDQuNCtcbmNsYXNzIENsYXNzIHtcbiAgICBjb25zdHJ1Y3RvciguLi5fKSB7IH1cbn1cbmNvbnN0IGluc3RhbmNlT2ZUeXBlID0gKFxuLy8gY29uc3QgaW5zdGFuY2VPZlR5cGUgPSA8VCBleHRlbmRzIG5ldyAoLi4uYXJnczogYW55W10pID0+IGFueT4oXG5jbHMsIHBhcmFtcyA9IHtcbiAgICBtZXNzYWdlOiBgSW5wdXQgbm90IGluc3RhbmNlIG9mICR7Y2xzLm5hbWV9YCxcbn0pID0+IGN1c3RvbSgoZGF0YSkgPT4gZGF0YSBpbnN0YW5jZW9mIGNscywgcGFyYW1zKTtcbmNvbnN0IHN0cmluZ1R5cGUgPSBab2RTdHJpbmcuY3JlYXRlO1xuY29uc3QgbnVtYmVyVHlwZSA9IFpvZE51bWJlci5jcmVhdGU7XG5jb25zdCBuYW5UeXBlID0gWm9kTmFOLmNyZWF0ZTtcbmNvbnN0IGJpZ0ludFR5cGUgPSBab2RCaWdJbnQuY3JlYXRlO1xuY29uc3QgYm9vbGVhblR5cGUgPSBab2RCb29sZWFuLmNyZWF0ZTtcbmNvbnN0IGRhdGVUeXBlID0gWm9kRGF0ZS5jcmVhdGU7XG5jb25zdCBzeW1ib2xUeXBlID0gWm9kU3ltYm9sLmNyZWF0ZTtcbmNvbnN0IHVuZGVmaW5lZFR5cGUgPSBab2RVbmRlZmluZWQuY3JlYXRlO1xuY29uc3QgbnVsbFR5cGUgPSBab2ROdWxsLmNyZWF0ZTtcbmNvbnN0IGFueVR5cGUgPSBab2RBbnkuY3JlYXRlO1xuY29uc3QgdW5rbm93blR5cGUgPSBab2RVbmtub3duLmNyZWF0ZTtcbmNvbnN0IG5ldmVyVHlwZSA9IFpvZE5ldmVyLmNyZWF0ZTtcbmNvbnN0IHZvaWRUeXBlID0gWm9kVm9pZC5jcmVhdGU7XG5jb25zdCBhcnJheVR5cGUgPSBab2RBcnJheS5jcmVhdGU7XG5jb25zdCBvYmplY3RUeXBlID0gWm9kT2JqZWN0LmNyZWF0ZTtcbmNvbnN0IHN0cmljdE9iamVjdFR5cGUgPSBab2RPYmplY3Quc3RyaWN0Q3JlYXRlO1xuY29uc3QgdW5pb25UeXBlID0gWm9kVW5pb24uY3JlYXRlO1xuY29uc3QgZGlzY3JpbWluYXRlZFVuaW9uVHlwZSA9IFpvZERpc2NyaW1pbmF0ZWRVbmlvbi5jcmVhdGU7XG5jb25zdCBpbnRlcnNlY3Rpb25UeXBlID0gWm9kSW50ZXJzZWN0aW9uLmNyZWF0ZTtcbmNvbnN0IHR1cGxlVHlwZSA9IFpvZFR1cGxlLmNyZWF0ZTtcbmNvbnN0IHJlY29yZFR5cGUgPSBab2RSZWNvcmQuY3JlYXRlO1xuY29uc3QgbWFwVHlwZSA9IFpvZE1hcC5jcmVhdGU7XG5jb25zdCBzZXRUeXBlID0gWm9kU2V0LmNyZWF0ZTtcbmNvbnN0IGZ1bmN0aW9uVHlwZSA9IFpvZEZ1bmN0aW9uLmNyZWF0ZTtcbmNvbnN0IGxhenlUeXBlID0gWm9kTGF6eS5jcmVhdGU7XG5jb25zdCBsaXRlcmFsVHlwZSA9IFpvZExpdGVyYWwuY3JlYXRlO1xuY29uc3QgZW51bVR5cGUgPSBab2RFbnVtLmNyZWF0ZTtcbmNvbnN0IG5hdGl2ZUVudW1UeXBlID0gWm9kTmF0aXZlRW51bS5jcmVhdGU7XG5jb25zdCBwcm9taXNlVHlwZSA9IFpvZFByb21pc2UuY3JlYXRlO1xuY29uc3QgZWZmZWN0c1R5cGUgPSBab2RFZmZlY3RzLmNyZWF0ZTtcbmNvbnN0IG9wdGlvbmFsVHlwZSA9IFpvZE9wdGlvbmFsLmNyZWF0ZTtcbmNvbnN0IG51bGxhYmxlVHlwZSA9IFpvZE51bGxhYmxlLmNyZWF0ZTtcbmNvbnN0IHByZXByb2Nlc3NUeXBlID0gWm9kRWZmZWN0cy5jcmVhdGVXaXRoUHJlcHJvY2VzcztcbmNvbnN0IHBpcGVsaW5lVHlwZSA9IFpvZFBpcGVsaW5lLmNyZWF0ZTtcbmNvbnN0IG9zdHJpbmcgPSAoKSA9PiBzdHJpbmdUeXBlKCkub3B0aW9uYWwoKTtcbmNvbnN0IG9udW1iZXIgPSAoKSA9PiBudW1iZXJUeXBlKCkub3B0aW9uYWwoKTtcbmNvbnN0IG9ib29sZWFuID0gKCkgPT4gYm9vbGVhblR5cGUoKS5vcHRpb25hbCgpO1xuZXhwb3J0IGNvbnN0IGNvZXJjZSA9IHtcbiAgICBzdHJpbmc6ICgoYXJnKSA9PiBab2RTdHJpbmcuY3JlYXRlKHsgLi4uYXJnLCBjb2VyY2U6IHRydWUgfSkpLFxuICAgIG51bWJlcjogKChhcmcpID0+IFpvZE51bWJlci5jcmVhdGUoeyAuLi5hcmcsIGNvZXJjZTogdHJ1ZSB9KSksXG4gICAgYm9vbGVhbjogKChhcmcpID0+IFpvZEJvb2xlYW4uY3JlYXRlKHtcbiAgICAgICAgLi4uYXJnLFxuICAgICAgICBjb2VyY2U6IHRydWUsXG4gICAgfSkpLFxuICAgIGJpZ2ludDogKChhcmcpID0+IFpvZEJpZ0ludC5jcmVhdGUoeyAuLi5hcmcsIGNvZXJjZTogdHJ1ZSB9KSksXG4gICAgZGF0ZTogKChhcmcpID0+IFpvZERhdGUuY3JlYXRlKHsgLi4uYXJnLCBjb2VyY2U6IHRydWUgfSkpLFxufTtcbmV4cG9ydCB7IGFueVR5cGUgYXMgYW55LCBhcnJheVR5cGUgYXMgYXJyYXksIGJpZ0ludFR5cGUgYXMgYmlnaW50LCBib29sZWFuVHlwZSBhcyBib29sZWFuLCBkYXRlVHlwZSBhcyBkYXRlLCBkaXNjcmltaW5hdGVkVW5pb25UeXBlIGFzIGRpc2NyaW1pbmF0ZWRVbmlvbiwgZWZmZWN0c1R5cGUgYXMgZWZmZWN0LCBlbnVtVHlwZSBhcyBlbnVtLCBmdW5jdGlvblR5cGUgYXMgZnVuY3Rpb24sIGluc3RhbmNlT2ZUeXBlIGFzIGluc3RhbmNlb2YsIGludGVyc2VjdGlvblR5cGUgYXMgaW50ZXJzZWN0aW9uLCBsYXp5VHlwZSBhcyBsYXp5LCBsaXRlcmFsVHlwZSBhcyBsaXRlcmFsLCBtYXBUeXBlIGFzIG1hcCwgbmFuVHlwZSBhcyBuYW4sIG5hdGl2ZUVudW1UeXBlIGFzIG5hdGl2ZUVudW0sIG5ldmVyVHlwZSBhcyBuZXZlciwgbnVsbFR5cGUgYXMgbnVsbCwgbnVsbGFibGVUeXBlIGFzIG51bGxhYmxlLCBudW1iZXJUeXBlIGFzIG51bWJlciwgb2JqZWN0VHlwZSBhcyBvYmplY3QsIG9ib29sZWFuLCBvbnVtYmVyLCBvcHRpb25hbFR5cGUgYXMgb3B0aW9uYWwsIG9zdHJpbmcsIHBpcGVsaW5lVHlwZSBhcyBwaXBlbGluZSwgcHJlcHJvY2Vzc1R5cGUgYXMgcHJlcHJvY2VzcywgcHJvbWlzZVR5cGUgYXMgcHJvbWlzZSwgcmVjb3JkVHlwZSBhcyByZWNvcmQsIHNldFR5cGUgYXMgc2V0LCBzdHJpY3RPYmplY3RUeXBlIGFzIHN0cmljdE9iamVjdCwgc3RyaW5nVHlwZSBhcyBzdHJpbmcsIHN5bWJvbFR5cGUgYXMgc3ltYm9sLCBlZmZlY3RzVHlwZSBhcyB0cmFuc2Zvcm1lciwgdHVwbGVUeXBlIGFzIHR1cGxlLCB1bmRlZmluZWRUeXBlIGFzIHVuZGVmaW5lZCwgdW5pb25UeXBlIGFzIHVuaW9uLCB1bmtub3duVHlwZSBhcyB1bmtub3duLCB2b2lkVHlwZSBhcyB2b2lkLCB9O1xuZXhwb3J0IGNvbnN0IE5FVkVSID0gSU5WQUxJRDtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2l6aW5nLnRzIFx1MjAxNCBTaGFyZWQgcGVyLWJsb2NrIHNpemluZyBmcmFnbWVudCAodmFyaWFibGUgYmxvY2sgc2l6aW5nLCBEcm9wIDEpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gT25lIHVuaWZpZWQgbWVjaGFuaXNtIGZvciBcInRoaXMgYmxvY2sgcmVuZGVycyBuYXJyb3dlciB0aGFuIGl0cyBjb250YWluZXJcIjpcbi8vIGFuIG9wdGlvbmFsIHdpZHRoIEZSQUNUSU9OIHBsdXMgYW4gb3B0aW9uYWwgYWxpZ25tZW50LiBBcHBsaWVkIHRvZGF5IHRvXG4vLyBJbWFnZUJsb2NrIGFuZCBNYXRoQmxvY2sgKHRoZSBzaXphYmxlIHNldCB3aXRoIGEgcmVhbCBhdXRob3Jpbmcgc3VyZmFjZSk7XG4vLyBleHRlbmRzIHRvIG90aGVyIGJsb2NrcyBhZGRpdGl2ZWx5IHdoZW4gdGhlaXIgZWRpdGluZyBVSSBsYW5kcy4gRGVzaWduOlxuLy8gZG9jcy9kZXNpZ24vdmFyaWFibGUtYmxvY2stc2l6aW5nLm1kLlxuLy9cbi8vIFJlZmxvdy1zYWZlIGJ5IGNvbnN0cnVjdGlvbjogd2lkdGggaXMgcmVsYXRpdmUgKGEgZnJhY3Rpb24gb2Ygd2hhdGV2ZXJcbi8vIGNvbnRhaW5lciB0aGUgYmxvY2sgc2l0cyBpbiBcdTIwMTQgcGFnZSBvciBjb2x1bW4gY2VsbCksIG5ldmVyIGFic29sdXRlIHBpeGVscyxcbi8vIGFuZCBhIG5hcnJvd2VkIGJsb2NrIHN0YXlzIGluIG5vcm1hbCBmbG93IChubyB3cmFwLWFyb3VuZC9mbG9hdCksIHNvIHByaW50XG4vLyBwYWdpbmF0aW9uIGFuZCB0aGUgZm9sZGFibGUncyBoZWlnaHQgbWVhc3VyZW1lbnQga2VlcCB3b3JraW5nLlxuLy9cbi8vIHdpZHRoIFx1MjAxNCBmcmFjdGlvbiBvZiB0aGUgY29udGFpbmVyJ3MgY29udGVudCB3aWR0aCwgaW4gKDAsIDFdLiBBYnNlbnQgPSBmdWxsXG4vLyB3aWR0aCAodG9kYXkncyBiZWhhdmlvcikuIFRoZSBlZGl0b3IgVUkgc25hcHMgdG8gY2xlYW4gc3RvcHMgKDI1LzMzLzUwLzY2L1xuLy8gNzUvMTAwJSkgYnV0IHRoZSBzY2hlbWEgYWNjZXB0cyBhbnkgZnJhY3Rpb24gc28gZmluZS1ncmFpbmVkIGRyYWdzIHZhbGlkYXRlLlxuLy9cbi8vIGFsaWduIFx1MjAxNCB3aGVyZSB0aGUgbmFycm93ZWQgYmxvY2sgc2l0cyBob3Jpem9udGFsbHkuIEFic2VudCA9IGNlbnRlciAodGhlXG4vLyBuYXR1cmFsIHJlYWQgZm9yIGZpZ3VyZXMgb24gYSB3b3Jrc2hlZXQpOyBvbmx5IG1lYW5pbmdmdWwgd2hlbiB3aWR0aCBpc1xuLy8gcHJlc2VudCwgYW5kIHRoZSByZW5kZXJlciBpZ25vcmVzIGl0IG90aGVyd2lzZS4gU3RvcmVkIG9ubHkgd2hlbiB3aWR0aCBpc1xuLy8gc2V0IGFuZCB0aGUgdmFsdWUgaXMgJ2xlZnQnLydyaWdodCcsIHNvIHJvdW5kLXRyaXAgZXF1YWxpdHkgaG9sZHMgZm9yIHRoZVxuLy8gZGVmYXVsdCBjYXNlLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5cbmV4cG9ydCBjb25zdCBCbG9ja0FsaWduID0gei5lbnVtKFsnbGVmdCcsICdjZW50ZXInLCAncmlnaHQnXSk7XG5leHBvcnQgdHlwZSBCbG9ja0FsaWduID0gei5pbmZlcjx0eXBlb2YgQmxvY2tBbGlnbj47XG5cbi8vIEZyYWN0aW9uIG9mIGNvbnRhaW5lciB3aWR0aC4gZ3QoMCkgbm90IG1pbigwKSBcdTIwMTQgYSB6ZXJvLXdpZHRoIGJsb2NrIGlzIGFcbi8vIGhpZGRlbiBibG9jaywgd2hpY2ggaXMgYSBkaWZmZXJlbnQgKG5vbmV4aXN0ZW50KSBmZWF0dXJlLlxuZXhwb3J0IGNvbnN0IEJsb2NrV2lkdGhGcmFjdGlvbiA9IHoubnVtYmVyKCkuZ3QoMCkubWF4KDEpO1xuXG4vLyBTcHJlYWQgaW50byBhIGJsb2NrJ3Mgei5vYmplY3Qoey4uLn0pIHNoYXBlLiBBIHBsYWluIG9iamVjdCAobm90IGEgWm9kXG4vLyBzY2hlbWEpIHNvIGVhY2ggYmxvY2sga2VlcHMgYSBmbGF0IGZpZWxkIGxpc3QgYW5kIGRpc2NyaW1pbmF0ZWRVbmlvbiBrZWVwc1xuLy8gd29ya2luZyB1bnRvdWNoZWQuXG5leHBvcnQgY29uc3Qgc2l6aW5nRmllbGRzID0ge1xuICB3aWR0aDogQmxvY2tXaWR0aEZyYWN0aW9uLm9wdGlvbmFsKCksXG4gIGFsaWduOiBCbG9ja0FsaWduLm9wdGlvbmFsKCksXG59O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgc2l6aW5nRmllbGRzIH0gZnJvbSAnLi4vc2l6aW5nLmpzJztcblxuLy8gQSBjcm9wIHdpbmRvdzogdGhlIHZpc2libGUgcmVjdGFuZ2xlIGluc2lkZSB0aGUgc291cmNlIGltYWdlLCBhcyBmcmFjdGlvbnMgb2Zcbi8vIHRoZSBzb3VyY2UncyBvd24gd2lkdGgvaGVpZ2h0LiB4LHkgPSB0b3AtbGVmdCBvZiB0aGUgd2luZG93OyB3LGggPSBpdHMgc2l6ZS5cbi8vIFRoZSB3aW5kb3cgbXVzdCBzdGF5IGluc2lkZSB0aGUgc291cmNlICh4K3cgXHUyMjY0IDEsIHkraCBcdTIyNjQgMSkuIEEgdGlueSBlcHNpbG9uXG4vLyBhYnNvcmJzIGZsb2F0IGVycm9yIGZyb20gdGhlIGVkaXRvcidzIHB4XHUyMTkyZnJhY3Rpb24gbWF0aC4gVGhlIHJlbmRlcmVyIGlzIHB1cmVcbi8vIChubyBpbWFnZSBkaW1lbnNpb25zKSwgc28gdGhlIGNyb3AgcGl4ZWwgYXNwZWN0IGlzIGRlcml2ZWQgZnJvbSB0aGUgc2VwYXJhdGVseVxuLy8gc3RvcmVkIGBzcmNBc3BlY3RgIChzZWUgSW1hZ2VCbG9jaykuIERlc2lnbjogZG9jcy9kZXNpZ24vaW1hZ2UtY3JvcC5tZC5cbmNvbnN0IENST1BfRVBTSUxPTiA9IDFlLTY7XG5leHBvcnQgY29uc3QgQ3JvcFJlY3QgPSB6XG4gIC5vYmplY3Qoe1xuICAgIHg6IHoubnVtYmVyKCkubWluKDApLmx0KDEpLFxuICAgIHk6IHoubnVtYmVyKCkubWluKDApLmx0KDEpLFxuICAgIHc6IHoubnVtYmVyKCkuZ3QoMCkubWF4KDEpLFxuICAgIGg6IHoubnVtYmVyKCkuZ3QoMCkubWF4KDEpLFxuICB9KVxuICAucmVmaW5lKFxuICAgIChjKSA9PiBjLnggKyBjLncgPD0gMSArIENST1BfRVBTSUxPTiAmJiBjLnkgKyBjLmggPD0gMSArIENST1BfRVBTSUxPTixcbiAgICB7IG1lc3NhZ2U6ICdjcm9wIHdpbmRvdyBtdXN0IHN0YXkgd2l0aGluIHRoZSBzb3VyY2UgKHgrdyBcdTIyNjQgMSwgeStoIFx1MjI2NCAxKScgfSxcbiAgKTtcbmV4cG9ydCB0eXBlIENyb3BSZWN0ID0gei5pbmZlcjx0eXBlb2YgQ3JvcFJlY3Q+O1xuXG4vLyBQaGFzZSAxOiBVUkwtb25seS4gTm8gdXBsb2FkIHBpcGVsaW5lOyB0ZWFjaGVycyBwYXN0ZSBhIHB1YmxpYyBVUkwuXG4vLyBQaGFzZSAyKzogYSBzZXBhcmF0ZSB2YXJpYW50IHdpdGggYSBTdXBhYmFzZSBTdG9yYWdlIHVwbG9hZCwgd2l0aCBzcmNcbi8vIHBvaW50aW5nIHRvIGEgc2lnbmVkIFVSTC4gU2NoZW1hIGlzIGZvcndhcmQtY29tcGF0aWJsZSBcdTIwMTQgYWRkaW5nIGEgbmV3XG4vLyBgc291cmNlYCBkaXNjcmltaW5hdG9yIGZpZWxkIGxhdGVyIGlzIG5vbi1icmVha2luZyBpZiBleGlzdGluZyByb3dzIGFyZVxuLy8gdHJlYXRlZCBhcyBgc291cmNlOiAndXJsJ2AgYnkgZGVmYXVsdC5cbmV4cG9ydCBjb25zdCBJbWFnZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnaW1hZ2UnKSxcbiAgc3JjOiB6LnN0cmluZygpLnVybCgpLFxuICAvLyBhbHQgaXMgcmVxdWlyZWQgZm9yIGFjY2Vzc2liaWxpdHkgYnV0IGRlZmF1bHRzIHRvIGVtcHR5IHN0cmluZyBmb3JcbiAgLy8gZGVjb3JhdGl2ZSBpbWFnZXMuIEVkaXRvcnMgc2hvdWxkIHdhcm4gKG5vdCBibG9jaykgb24gZW1wdHkgYWx0LlxuICBhbHQ6IHouc3RyaW5nKCkuZGVmYXVsdCgnJyksXG4gIGNhcHRpb246IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgLy8gVmFyaWFibGUgYmxvY2sgc2l6aW5nOiBvcHRpb25hbCB3aWR0aCBmcmFjdGlvbiArIGFsaWdubWVudCAoc2l6aW5nLnRzKS5cbiAgLy8gVGhpcyBJUyB0aGUgaW1hZ2UgZGlzcGxheS1zaXplIG1lY2hhbmlzbSBcdTIwMTQgbm8gc2VwYXJhdGUgaW50cmluc2ljIHNpemUuXG4gIC4uLnNpemluZ0ZpZWxkcyxcbiAgLy8gQ3JvcCAocmVmcmFtZSkgXHUyMDE0IHRoZSB2aXNpYmxlIHN1Yi1yZWN0YW5nbGUgb2YgdGhlIHNvdXJjZSAoZG9jcy9kZXNpZ24vXG4gIC8vIGltYWdlLWNyb3AubWQpLiBgc3JjQXNwZWN0YCAodGhlIHNvdXJjZSdzIG5hdHVyYWwgVy9IIHJhdGlvKSBsZXRzIHRoZSBwdXJlXG4gIC8vIHJlbmRlcmVyIGRlcml2ZSB0aGUgY3JvcCBwaXhlbCBhc3BlY3QgQSA9IHNyY0FzcGVjdFx1MDBCNyh3L2gpIHdpdGhvdXQgcmVhZGluZ1xuICAvLyBpbWFnZSBkaW1lbnNpb25zLiBTdG9yZWQgQk9USC1PUi1ORUlUSEVSOiBhbiB1bmNyb3BwZWQgaW1hZ2UgY2Fycmllc1xuICAvLyBuZWl0aGVyIChieXRlLWlkZW50aWNhbCB0byB0b2RheSkuIFRoZSBwYWlyaW5nIGlzIGVuZm9yY2VkIGluIHRoZSBlZGl0b3IgK1xuICAvLyBzZXJpYWxpemUgKG5vdCBhIHNjaGVtYSAucmVmaW5lIFx1MjAxNCBJbWFnZUJsb2NrIGlzIGEgZGlzY3JpbWluYXRlZFVuaW9uIG1lbWJlclxuICAvLyBhbmQgcmVmaW5lZCBvYmplY3RzIGNhbid0IGJlIGRpc2NyaW1pbmF0ZWQpOyBzZWUgc2VyaWFsaXplLnRzICsgQ1ItSU5WLWJvdGguXG4gIGNyb3A6IENyb3BSZWN0Lm9wdGlvbmFsKCksXG4gIHNyY0FzcGVjdDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIEltYWdlQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBJbWFnZUJsb2NrPjtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gZ3JhcGgtcHJpbWl0aXZlcy50cyBcdTIwMTQgY29vcmRpbmF0ZS1wbGFuZSBwcmltaXRpdmVzLCBkZXBlbmRlbmN5LWZyZWVcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgYXhpcyAvIGZ1bmN0aW9uLW1vZGVsIC8gZHJhd2FibGUgdm9jYWJ1bGFyeSBzaGFyZWQgYnkgZXZlcnkgZ3JhcGgtc2hhcGVkXG4vLyBzdXJmYWNlOiBpbnRlcmFjdGl2ZV9ncmFwaCAodGhlIGdyYWRlZCBibG9jayksIGdyYXBoX2ZpZ3VyZSAodGhlIHN0YXRpY1xuLy8gcGljdHVyZSksIG11bHRpcGxlX2Nob2ljZSBjaG9pY2UgZmlndXJlcywgbWF0Y2hpbmcgc2lkZXMsIG51bWJlcl9saW5lXG4vLyAoRW5kcG9pbnRTdHlsZSksIGFuZCBkYXRhX3Bsb3QuXG4vL1xuLy8gVGhlc2Ugc2NoZW1hcyBsaXZlIEhFUkUsIGluIGEgbGVhZiBtb2R1bGUgdGhhdCBpbXBvcnRzIG5vdGhpbmcgYnV0IHpvZCxcbi8vIHJhdGhlciB0aGFuIGluIGJsb2Nrcy9pbnRlcmFjdGl2ZS1ncmFwaC50cyB3aGVyZSB0aGV5IGdyZXcgdXAuIFRoZSByZWFzb24gaXNcbi8vIGEgaGFyZCBvbmUsIG5vdCB0aWRpbmVzczogaW50ZXJhY3RpdmUtZ3JhcGgudHMgaW1wb3J0cyBJbmxpbmVOb2RlIGZyb21cbi8vIGlubGluZS50cyAoaXRzIHByb21wdC9mZWVkYmFjay9zb2x1dGlvbiBmaWVsZHMpLCBzbyBhbnl0aGluZyByZWFjaGluZyB0aGVzZVxuLy8gcHJpbWl0aXZlcyBUSFJPVUdIIGl0IGluaGVyaXRzIGEgZGVwZW5kZW5jeSBvbiBpbmxpbmUudHMuIFdoZW4gaW5saW5lLnRzXG4vLyBpdHNlbGYgbmVlZHMgdGhlbSBcdTIwMTQgRGVmaW5pdGlvbkJsb2NrIGFkbWl0cyBhIGdyYXBoX2ZpZ3VyZSwgc2VlIGlubGluZS50cyBcdTIwMTRcbi8vIHRoYXQgY2xvc2VzIHRoZSBjeWNsZSBpbmxpbmUudHMgLT4gZ3JhcGgtZmlndXJlLnRzIC0+IGludGVyYWN0aXZlLWdyYXBoLnRzIC0+XG4vLyBpbmxpbmUudHMsIGFuZCB0aGUgY3ljbGUgaXMgZmF0YWwgcmF0aGVyIHRoYW4gY29zbWV0aWM6IGludGVyYWN0aXZlLWdyYXBoLnRzXG4vLyBldmFsdWF0ZXMgYHouYXJyYXkoSW5saW5lTm9kZSlgIGF0IG1vZHVsZSBzY29wZSwgc28gYSBwYXJ0aWFsbHktaW5pdGlhbGl6ZWRcbi8vIGlubGluZS5qcyB0aHJvd3MgYSBURFogUmVmZXJlbmNlRXJyb3IgYXQgaW1wb3J0IHRpbWUuXG4vL1xuLy8gYmxvY2tzL2ludGVyYWN0aXZlLWdyYXBoLnRzIHJlLWV4cG9ydHMgZXZlcnl0aGluZyBoZXJlLCBzbyBldmVyeSBleGlzdGluZ1xuLy8gaW1wb3J0ZXIga2VlcHMgaXRzIGN1cnJlbnQgaW1wb3J0IHBhdGggYW5kIGlkZW50aXR5IFx1MjAxNCBub3RoaW5nIG1vdmVkIGZyb20gYVxuLy8gY29uc3VtZXIncyBwb2ludCBvZiB2aWV3LiBOZXcgaW5saW5lLXJlYWNoYWJsZSBjb2RlIChncmFwaC1maWd1cmUudHMpIGltcG9ydHNcbi8vIGZyb20gdGhpcyBtb2R1bGUgZGlyZWN0bHkuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcblxuLy8gLS0tLSBBeGlzIGNvbmZpZ3VyYXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBjb29yZGluYXRlIHBsYW5lIHRoZSBzdHVkZW50IHdvcmtzIGluLiBHcmFwaCB1bml0cyB0aHJvdWdob3V0IFx1MjAxNCB0b2xlcmFuY2Vcbi8vIGFuZCBncmlkIHN0ZXBzIGFyZSBpbiB0aGUgc2FtZSB1bml0cywgbmV2ZXIgcGl4ZWxzLCBzbyBhIHB1Ymxpc2hlZCBwYWdlIHRoYXRcbi8vIHJlLWxheXMtb3V0IGF0IGEgZGlmZmVyZW50IHNpemUgc3RpbGwgc2NvcmVzIGlkZW50aWNhbGx5LlxuZXhwb3J0IGNvbnN0IEF4aXNDb25maWcgPSB6Lm9iamVjdCh7XG4gIHhNaW46IHoubnVtYmVyKCksXG4gIHhNYXg6IHoubnVtYmVyKCksXG4gIHlNaW46IHoubnVtYmVyKCksXG4gIHlNYXg6IHoubnVtYmVyKCksXG4gIHhHcmlkU3RlcDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLmRlZmF1bHQoMSksXG4gIHlHcmlkU3RlcDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLmRlZmF1bHQoMSksXG4gIHNob3dHcmlkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAvLyBXaGVuIHRydWUsIGEgZHJhZ2dlZCBoYW5kbGUgc25hcHMgdG8gdGhlIG5lYXJlc3QgZ3JpZCBpbnRlcnNlY3Rpb24uIEtleWJvYXJkXG4gIC8vIG51ZGdlIGFsd2F5cyBtb3ZlcyBieSBvbmUgZ3JpZCBzdGVwIHJlZ2FyZGxlc3MgKFNoaWZ0ID0gMC4xIHN0ZXAsIGZpbmUpLlxuICBzbmFwVG9HcmlkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxufSk7XG5leHBvcnQgdHlwZSBBeGlzQ29uZmlnID0gei5pbmZlcjx0eXBlb2YgQXhpc0NvbmZpZz47XG5cbi8vIC0tLS0gRW5kcG9pbnQgc3R5bGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBvcGVuID0gaG9sbG93IGRvdCwgdmFsdWUgRVhDTFVERUQgKGEgc3RyaWN0IGluZXF1YWxpdHkgYm91bmRhcnksIGFuIG9wZW5cbi8vIGludGVydmFsIGVuZCk7IGNsb3NlZCA9IGZpbGxlZCBkb3QsIHZhbHVlIElOQ0xVREVELiBBIHNoYXJlZCB2b2NhYnVsYXJ5IHVzZWRcbi8vIGJ5IGluZXF1YWxpdHkgYm91bmRhcmllcyAoRHJvcCA0OiBzdHJpY3QgXHUyMTkyIG9wZW4pLCBkb21haW4tcmVzdHJpY3RlZCByYXlzIGFuZFxuLy8gc2VnbWVudHMgKERyb3AgNiksIGRpc3BsYXkgc2VnbWVudHMsIGFuZCB0aGUgZnV0dXJlIG51bWJlci1saW5lIGZhbWlseS4gQWRkZWRcbi8vIGFzIGEgZm91bmRhdGlvbiBub3cgKERyb3AgMik7IGNvbnN1bWVycyByZW5kZXIvc2NvcmUgaXQgaW4gdGhlaXIgb3duIGRyb3BzLlxuZXhwb3J0IGNvbnN0IEVuZHBvaW50U3R5bGUgPSB6LmVudW0oWydvcGVuJywgJ2Nsb3NlZCddKTtcbmV4cG9ydCB0eXBlIEVuZHBvaW50U3R5bGUgPSB6LmluZmVyPHR5cGVvZiBFbmRwb2ludFN0eWxlPjtcblxuLy8gRG9tYWluIHJlc3RyaWN0aW9uIG9uIGEgZHJhd24gY3VydmUgKERyb3AgNS82KTogcmF5cyBhbmQgc2VnbWVudHMgb2YgYVxuLy8gZnVuY3Rpb24uIFN0eWxlcyBtYXJrIHdoZXRoZXIgZWFjaCBlbmRwb2ludCBpcyBpbmNsdWRlZCAoY2xvc2VkKSBvciBub3QuXG5leHBvcnQgY29uc3QgQ3VydmVEb21haW4gPSB6Lm9iamVjdCh7XG4gIG1pbjogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBtaW5TdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxuICBtYXg6IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgbWF4U3R5bGU6IEVuZHBvaW50U3R5bGUub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ3VydmVEb21haW4gPSB6LmluZmVyPHR5cGVvZiBDdXJ2ZURvbWFpbj47XG5cbi8vIC0tLS0gRnVuY3Rpb24gbW9kZWxzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFYWNoIGZhbWlseSBjYXJyaWVzIGl0cyBwYXJhbWV0ZXJzICsgYSBwZXItcGFyYW1ldGVyIHRvbGVyYW5jZSwgYW5kIGl0c1xuLy8gcGFyYW1ldGVyIG5hbWVzIE1BVENIIHRoZSBraXQncyByZWdyZXNzaW9uIGZpdHRlcnMgKGdyYXBoLWtpdCBmaXRMaW5lYXIgL1xuLy8gZml0UXVhZHJhdGljIC8gZml0RXhwb25lbnRpYWwgLyBmaXRMb2dhcml0aG1pYykgc28gYSBmaXR0ZWQgY3VydmUgc2NvcmVzXG4vLyBhZ2FpbnN0IHRoZSBrZXkgd2l0aCBubyB0cmFuc2xhdGlvbi4gRm9ybXM6XG4vLyAgIGxpbmVhciAgICAgICB5ID0gc2xvcGVcdTAwQjd4ICsgaW50ZXJjZXB0XG4vLyAgIHF1YWRyYXRpYyAgICB5ID0gYVx1MDBCN3hcdTAwQjIgKyBiXHUwMEI3eCArIGNcbi8vICAgY3ViaWMgICAgICAgIHkgPSBhXHUwMEI3eFx1MDBCMyArIGJcdTAwQjd4XHUwMEIyICsgY1x1MDBCN3ggKyBkXG4vLyAgIHF1YXJ0aWMgICAgICB5ID0gYVx1MDBCN3hcdTIwNzQgKyBiXHUwMEI3eFx1MDBCMyArIGNcdTAwQjd4XHUwMEIyICsgZFx1MDBCN3ggKyBlXG4vLyAgIGV4cG9uZW50aWFsICB5ID0gYVx1MDBCN2JcdTAyRTMgICAgICAgICAgICAoYiA+IDApXG4vLyAgIGxvZ2FyaXRobWljICB5ID0gYSArIGJcdTAwQjdsbih4KSAgICAgKHggPiAwKVxuLy8gICB2ZXJ0aWNhbCAgICAgeCA9IGsgICAgICAgICAgICAgICAoTk9UIGEgeSA9IGYoeCkgY3VydmUgXHUyMDE0IHNjb3JlZCBvbiB4KVxuZXhwb3J0IGNvbnN0IExpbmVhck1vZGVsID0gei5vYmplY3Qoe1xuICBmYW1pbHk6IHoubGl0ZXJhbCgnbGluZWFyJyksXG4gIHNsb3BlOiB6Lm51bWJlcigpLFxuICBpbnRlcmNlcHQ6IHoubnVtYmVyKCksXG4gIHNsb3BlVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBpbnRlcmNlcHRUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIExpbmVhck1vZGVsID0gei5pbmZlcjx0eXBlb2YgTGluZWFyTW9kZWw+O1xuXG5leHBvcnQgY29uc3QgUXVhZHJhdGljTW9kZWwgPSB6Lm9iamVjdCh7XG4gIGZhbWlseTogei5saXRlcmFsKCdxdWFkcmF0aWMnKSxcbiAgYTogei5udW1iZXIoKSxcbiAgYjogei5udW1iZXIoKSxcbiAgYzogei5udW1iZXIoKSxcbiAgYVRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgYlRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgY1RvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgUXVhZHJhdGljTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBRdWFkcmF0aWNNb2RlbD47XG5cbmV4cG9ydCBjb25zdCBDdWJpY01vZGVsID0gei5vYmplY3Qoe1xuICBmYW1pbHk6IHoubGl0ZXJhbCgnY3ViaWMnKSxcbiAgYTogei5udW1iZXIoKSxcbiAgYjogei5udW1iZXIoKSxcbiAgYzogei5udW1iZXIoKSxcbiAgZDogei5udW1iZXIoKSxcbiAgYVRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgYlRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgY1RvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgZFRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ3ViaWNNb2RlbCA9IHouaW5mZXI8dHlwZW9mIEN1YmljTW9kZWw+O1xuXG5leHBvcnQgY29uc3QgUXVhcnRpY01vZGVsID0gei5vYmplY3Qoe1xuICBmYW1pbHk6IHoubGl0ZXJhbCgncXVhcnRpYycpLFxuICBhOiB6Lm51bWJlcigpLFxuICBiOiB6Lm51bWJlcigpLFxuICBjOiB6Lm51bWJlcigpLFxuICBkOiB6Lm51bWJlcigpLFxuICBlOiB6Lm51bWJlcigpLFxuICBhVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBiVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBjVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBkVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBlVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxufSk7XG5leHBvcnQgdHlwZSBRdWFydGljTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBRdWFydGljTW9kZWw+O1xuXG5leHBvcnQgY29uc3QgRXhwb25lbnRpYWxNb2RlbCA9IHoub2JqZWN0KHtcbiAgZmFtaWx5OiB6LmxpdGVyYWwoJ2V4cG9uZW50aWFsJyksXG4gIGE6IHoubnVtYmVyKCksXG4gIGI6IHoubnVtYmVyKCksXG4gIGFUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG4gIGJUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIEV4cG9uZW50aWFsTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBFeHBvbmVudGlhbE1vZGVsPjtcblxuZXhwb3J0IGNvbnN0IExvZ2FyaXRobWljTW9kZWwgPSB6Lm9iamVjdCh7XG4gIGZhbWlseTogei5saXRlcmFsKCdsb2dhcml0aG1pYycpLFxuICBhOiB6Lm51bWJlcigpLFxuICBiOiB6Lm51bWJlcigpLFxuICBhVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBiVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxufSk7XG5leHBvcnQgdHlwZSBMb2dhcml0aG1pY01vZGVsID0gei5pbmZlcjx0eXBlb2YgTG9nYXJpdGhtaWNNb2RlbD47XG5cbi8vIEEgdmVydGljYWwgbGluZSB4ID0gay4gSXQgaGFzIG5vIHkgPSBmKHgpIHJlcHJlc2VudGF0aW9uIChpbmZpbml0ZSBzbG9wZSksIHNvXG4vLyBpdCBjYW4ndCByaWRlIHRoZSByZWdyZXNzaW9uIGZpdHRlcnMgXHUyMDE0IHRoZSBraXQgc2NvcmVzIGl0IGRpcmVjdGx5IG9uIHRoZVxuLy8gc3R1ZGVudCdzIHguIEtlcHQgaW4gRnVuY3Rpb25Nb2RlbCAobm90IGEgc2VwYXJhdGUgaW50ZXJhY3Rpb24pIHNvIGF1dGhvcmluZyBhXG4vLyB2ZXJ0aWNhbCBsaW5lIGlzIHRoZSBzYW1lIFwidHlwZSBhbiBlcXVhdGlvblwiIGZsb3cgYXMgYW55IG90aGVyIGZhbWlseS5cbmV4cG9ydCBjb25zdCBWZXJ0aWNhbE1vZGVsID0gei5vYmplY3Qoe1xuICBmYW1pbHk6IHoubGl0ZXJhbCgndmVydGljYWwnKSxcbiAgeDogei5udW1iZXIoKSxcbiAgeFRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgVmVydGljYWxNb2RlbCA9IHouaW5mZXI8dHlwZW9mIFZlcnRpY2FsTW9kZWw+O1xuXG4vLyBEaXNjcmltaW5hdGVkIG9uIGBmYW1pbHlgIHNvIGNvbnN1bWVycyBicmFuY2ggdW5pZm9ybWx5LiBHcm93aW5nIGEgZmFtaWx5IGlzIGFcbi8vIG5ldyBtZW1iZXIgaGVyZSArIGEgbmV3IGZpdC9zY29yZSBicmFuY2ggaW4gdGhlIGtpdCBcdTIwMTQgbm8gb3RoZXIgYmxvY2sgdG91Y2hlZC5cbmV4cG9ydCBjb25zdCBGdW5jdGlvbk1vZGVsID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ2ZhbWlseScsIFtcbiAgTGluZWFyTW9kZWwsXG4gIFF1YWRyYXRpY01vZGVsLFxuICBDdWJpY01vZGVsLFxuICBRdWFydGljTW9kZWwsXG4gIEV4cG9uZW50aWFsTW9kZWwsXG4gIExvZ2FyaXRobWljTW9kZWwsXG4gIFZlcnRpY2FsTW9kZWwsXG5dKTtcbmV4cG9ydCB0eXBlIEZ1bmN0aW9uTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBGdW5jdGlvbk1vZGVsPjtcblxuLy8gLS0tLSBEcmF3YWJsZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGBEcmF3YWJsZWAgaXMgZGlzY3JpbWluYXRlZCBvbiBga2luZGAuIGBjdXJ2ZWAgUkVVU0VTIEZ1bmN0aW9uTW9kZWwsIHNvIHRoZVxuLy8gZGF5IHF1YWRyYXRpYy9leHBvbmVudGlhbC9sb2dhcml0aG1pYyBsYW5kIHRoZXkgbGlnaHQgdXAgaGVyZSBBTkQgaW5cbi8vIHBsb3RfZnVuY3Rpb24gYXQgb25jZS4gQSBgbGFiZWxgIHRleHQtYW5ub3RhdGlvbiBkcmF3YWJsZSBpcyBkZWxpYmVyYXRlbHlcbi8vIGRlZmVycmVkIChwb2ludC5sYWJlbCBjb3ZlcnMgdGhlIGNvbW1vbiBjYXNlKSBcdTIwMTQgWUFHTkksIGFkZGl0aXZlIHdoZW4gbmVlZGVkLlxuLy8gQXV0aG9yZWQgcGVyLWRyYXdhYmxlIGNvbG9yLiBTdG9yZWQgYXMgYSBwYWxldHRlIEtFWSAobm90IGEgaGV4KSBzbyBjb2xvcnNcbi8vIHN0YXkgc2VtYW50aWM7IHRoZSBrZXkgbGlzdCBpcyBkZWZpbmVkIEhFUkUgKGRlcGVuZGVuY3ktZnJlZSkgYW5kIHRoZSBrZXkgLT5cbi8vIGhleCBtYXAgbGl2ZXMgaW4gQGFjdGl2aXR5L2dyYXBoLWtpdCdzIERSQVdBQkxFX1BBTEVUVEUuIEEgZHJpZnQgZ3VhcmQgdGVzdFxuLy8ga2VlcHMgdGhlIHR3byBsaXN0cyBpbiBsb2Nrc3RlcC4gT3B0aW9uYWw6IGFic2VudCA9IHRoZSBzaGFyZWQgZGVmYXVsdCBjb2xvci5cbmV4cG9ydCBjb25zdCBEcmF3YWJsZUNvbG9yID0gei5lbnVtKFtcbiAgJ2JsdWUnLFxuICAnaW5kaWdvJyxcbiAgJ3RlYWwnLFxuICAnZ3JlZW4nLFxuICAnYW1iZXInLFxuICAncmVkJyxcbiAgJ3Zpb2xldCcsXG4gICdzbGF0ZScsXG5dKTtcbmV4cG9ydCB0eXBlIERyYXdhYmxlQ29sb3JUID0gei5pbmZlcjx0eXBlb2YgRHJhd2FibGVDb2xvcj47XG5cbmNvbnN0IFBvaW50RHJhd2FibGUgPSB6Lm9iamVjdCh7XG4gIGtpbmQ6IHoubGl0ZXJhbCgncG9pbnQnKSxcbiAgYXQ6IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgbGFiZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgLy8gb3BlbiA9IGhvbGxvdyAoZXhjbHVkZWQpLCBjbG9zZWQgPSBmaWxsZWQuIERlZmF1bHQgY2xvc2VkLlxuICBzdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxuICBjb2xvcjogRHJhd2FibGVDb2xvci5vcHRpb25hbCgpLFxufSk7XG5jb25zdCBDdXJ2ZURyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ2N1cnZlJyksXG4gIG1vZGVsOiBGdW5jdGlvbk1vZGVsLFxuICAvLyBEcm9wIDU6IGRhc2hlZCBib3VuZGFyeSArIGhhbGYtcGxhbmUgc2hhZGluZyB0dXJuIGEgZGlzcGxheSBjdXJ2ZSBpbnRvIGFcbiAgLy8gcGljdHVyZWQgaW5lcXVhbGl0eTsgZG9tYWluIHJlc3RyaWN0cyBpdCB0byBhIHJheS9zZWdtZW50LlxuICBzdHlsZTogei5lbnVtKFsnc29saWQnLCAnZGFzaGVkJ10pLm9wdGlvbmFsKCksXG4gIHNoYWRlOiB6LmVudW0oWydhYm92ZScsICdiZWxvdycsICdsZWZ0JywgJ3JpZ2h0J10pLm9wdGlvbmFsKCksXG4gIGRvbWFpbjogQ3VydmVEb21haW4ub3B0aW9uYWwoKSxcbiAgLy8gQ29udGludWF0aW9uIGFycm93aGVhZHMgb24gVU5CT1VOREVEIGVuZHMgKHRleHRib29rIGNvbnZlbnRpb246IGFycm93ID1cbiAgLy8gXCJrZWVwcyBnb2luZ1wiLCBkb3QgPSBcInN0b3BzIGhlcmVcIikuIERyYXduIHdoZXJlIHRoZSBjdXJ2ZSBleGl0cyB0aGUgdmlzaWJsZVxuICAvLyB3aW5kb3c7IGFuIGF1dGhvcmVkIGRvbWFpbiBib3VuZCBzdXBwcmVzc2VzIHRoYXQgZW5kJ3MgYXJyb3cgKGl0IGdldHMgdGhlXG4gIC8vIG9wZW4vY2xvc2VkIGRvdCBpbnN0ZWFkKS4gdW5kZWZpbmVkID0gdHJ1ZSBcdTIwMTQgYXJyb3dzIGFyZSB0aGUgY29udmVudGlvbixcbiAgLy8gdGhpcyBmbGFnIGlzIHRoZSBvcHQtb3V0IChhdXRob3IgY2FsbCAyMDI2LTA3LTEwKS5cbiAgYXJyb3dzOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICBjb2xvcjogRHJhd2FibGVDb2xvci5vcHRpb25hbCgpLFxufSk7XG5cbi8vIERyb3AgNTogcGxvdCBBTlkgcGFyc2VhYmxlIGZvcm11bGEgKHNpbih4KSwgcmF0aW9uYWxzLCBcdTIwMjYpIGJ5IHNhbXBsaW5nIFx1MjAxNCB0aGVcbi8vIGVzY2FwZSBoYXRjaCB0aGUgZ3JhZGVkIGZhbWlsaWVzIGRlbGliZXJhdGVseSBkb24ndCBjb3Zlci4gRGlzcGxheS1vbmx5LlxuY29uc3QgRXhwcmVzc2lvbkRyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ2V4cHJlc3Npb24nKSxcbiAgZXhwcmVzc2lvbjogei5zdHJpbmcoKS5taW4oMSksXG4gIHN0eWxlOiB6LmVudW0oWydzb2xpZCcsICdkYXNoZWQnXSkub3B0aW9uYWwoKSxcbiAgLy8gQ29udGludWF0aW9uIGFycm93aGVhZHMgYXQgYm90aCB3aW5kb3cgZXhpdHMgKHNlZSBDdXJ2ZURyYXdhYmxlLmFycm93cykuXG4gIGFycm93czogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgY29sb3I6IERyYXdhYmxlQ29sb3Iub3B0aW9uYWwoKSxcbn0pO1xuY29uc3QgU2VnbWVudERyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ3NlZ21lbnQnKSxcbiAgZnJvbTogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICB0bzogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICAvLyBEcm9wIDU6IG9wZW4vY2xvc2VkIGVuZHBvaW50IGRvdHMgKFtmcm9tLCB0b10pLiBEZWZhdWx0IGNsb3NlZC5cbiAgZW5kcG9pbnRzOiB6LnR1cGxlKFtFbmRwb2ludFN0eWxlLCBFbmRwb2ludFN0eWxlXSkub3B0aW9uYWwoKSxcbiAgY29sb3I6IERyYXdhYmxlQ29sb3Iub3B0aW9uYWwoKSxcbn0pO1xuXG4vLyBEcm9wIDU6IGEgcmF5IFx1MjAxNCBzdGFydHMgYXQgYGZyb21gIChvcGVuL2Nsb3NlZCksIHBhc3NlcyB0aHJvdWdoIGB0aHJvdWdoYCxcbi8vIHJ1bnMgdG8gdGhlIHdpbmRvdyBlZGdlLiBUaGUgcGh5c2ljcy1jbGFzcyBzdGFwbGUuXG5jb25zdCBSYXlEcmF3YWJsZSA9IHoub2JqZWN0KHtcbiAga2luZDogei5saXRlcmFsKCdyYXknKSxcbiAgZnJvbTogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICB0aHJvdWdoOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIGZyb21TdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxuICAvLyBDb250aW51YXRpb24gYXJyb3doZWFkIG9uIHRoZSB1bmJvdW5kZWQgZW5kIChzZWUgQ3VydmVEcmF3YWJsZS5hcnJvd3MpLlxuICBhcnJvd3M6IHouYm9vbGVhbigpLm9wdGlvbmFsKCksXG4gIGNvbG9yOiBEcmF3YWJsZUNvbG9yLm9wdGlvbmFsKCksXG59KTtcbmNvbnN0IFBvbHlnb25EcmF3YWJsZSA9IHoub2JqZWN0KHtcbiAga2luZDogei5saXRlcmFsKCdwb2x5Z29uJyksXG4gIHZlcnRpY2VzOiB6LmFycmF5KHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSkubWluKDMpLFxuICBmaWxsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gIGNvbG9yOiBEcmF3YWJsZUNvbG9yLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCBjb25zdCBEcmF3YWJsZSA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCdraW5kJywgW1xuICBQb2ludERyYXdhYmxlLFxuICBDdXJ2ZURyYXdhYmxlLFxuICBFeHByZXNzaW9uRHJhd2FibGUsXG4gIFNlZ21lbnREcmF3YWJsZSxcbiAgUmF5RHJhd2FibGUsXG4gIFBvbHlnb25EcmF3YWJsZSxcbl0pO1xuZXhwb3J0IHR5cGUgRHJhd2FibGUgPSB6LmluZmVyPHR5cGVvZiBEcmF3YWJsZT47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG4vLyBGcm9tIHRoZSBsZWFmIHByaW1pdGl2ZXMgbW9kdWxlLCBOT1QgZnJvbSAuL2ludGVyYWN0aXZlLWdyYXBoLmpzIFx1MjAxNCB0aGF0IGZpbGVcbi8vIGltcG9ydHMgaW5saW5lLnRzLCBhbmQgaW5saW5lLnRzIGltcG9ydHMgVEhJUyBvbmUgKGEgZGVmaW5pdGlvbiBtYXkgY29udGFpbiBhXG4vLyBncmFwaCBmaWd1cmUpLCBzbyByb3V0aW5nIHRocm91Z2ggaXQgd291bGQgY2xvc2UgYSBmYXRhbCBtb2R1bGUgY3ljbGUuIFNlZVxuLy8gLi4vZ3JhcGgtcHJpbWl0aXZlcy50cy5cbmltcG9ydCB7IEF4aXNDb25maWcsIERyYXdhYmxlIH0gZnJvbSAnLi4vZ3JhcGgtcHJpbWl0aXZlcy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBHcmFwaEZpZ3VyZUJsb2NrIFx1MjAxNCBhIHN0YXRpYyBjb29yZGluYXRlLXBsYW5lIHBpY3R1cmUgKG5ldmVyIGludGVyYWN0aXZlKS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIHB1cmUgQ09OVEVOVCBibG9jayAoZGF0YS1ibG9jay1jYXRlZ29yeT1cImNvbnRlbnRcIik6IG5vbi1pbnRlcmFjdGl2ZSxcbi8vIG5vbi1udW1iZXJlZCwgbm8gcnVudGltZSB3aXJpbmcsIG5vIHN1Ym1pc3Npb24gd2lyZSBpbXBhY3QuIFRoZSBzdGFuZGFsb25lXG4vLyBwcm9tb3Rpb24gb2YgdGhlIE1DL21hdGNoaW5nIENob2ljZUdyYXBoIGZpZ3VyZSAoeyBheGlzLCBkcmF3YWJsZXMgfSkgdG8gYVxuLy8gYmxvY2ssIGJ1aWx0IGZvciB0aGUgcmVmZXJlbmNlIHBhbmVsIFx1MjAxNCBcInRoZXNlIHR3byBsaW5lcyBhcmUgcGFyYWxsZWxcIi1zdHlsZVxuLy8gcGljdHVyZXMgb24gYSBmb3JtdWxhIHNoZWV0LlxuLy9cbi8vIFJlbmRlcmVkIHNlcnZlci1zaWRlIGFzIGlubGluZSBTVkcgYnkgdGhlIHJlbmRlcmVyJ3MgZ3JhcGgtc3ZnIGVuZ2luZSwgbmV2ZXJcbi8vIHRoZSBpbnRlcmFjdGl2ZSBraXQgXHUyMDE0IHNvIGl0IHdvcmtzIG9uIHBhcGVyLCBpbiB0aGUgcHJpbnQgYm94LCBhbmQgaW4gdGhlXG4vLyBmbG9hdGluZyBwYW5lbCB3aXRoIHplcm8gSlMuIENvbnNlcXVlbmNlIChzYW1lIGFzIENob2ljZUdyYXBoKTogYGV4cHJlc3Npb25gXG4vLyBkcmF3YWJsZXMgbmVlZCB0aGUga2l0J3MgZm9ybXVsYSBwYXJzZXIgYW5kIGFyZSBOT1QgZHJhd247IGF1dGhvcmluZ1xuLy8gc3VyZmFjZXMgZG9uJ3Qgb2ZmZXIgdGhlbSBoZXJlLlxuLy9cbi8vIERlbGliZXJhdGVseSBOT1QgYSBkaXNwbGF5LW1vZGUgaW50ZXJhY3RpdmVfZ3JhcGg6IHRoYXQgYmxvY2sgaXMgYSBudW1iZXJlZC1cbi8vIHF1ZXN0aW9uIGZhbWlseSB3aXRoIHByb21wdC9zb2x1dGlvbi9jb25maWRlbmNlIGNocm9tZSBhbmQga2l0IGh5ZHJhdGlvbi5cbi8vIFRoaXMgb25lIGNhbiBuZXZlciBhY2NlcHQgc3R1ZGVudCBpbnB1dCBieSBjb25zdHJ1Y3Rpb24sIHdoaWNoIGlzIHRoZVxuLy8gcmVmZXJlbmNlIHBhbmVsJ3MgY29udHJhY3QuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgY29uc3QgR3JhcGhGaWd1cmVCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2dyYXBoX2ZpZ3VyZScpLFxuICBheGlzOiBBeGlzQ29uZmlnLFxuICBkcmF3YWJsZXM6IHouYXJyYXkoRHJhd2FibGUpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBHcmFwaEZpZ3VyZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgR3JhcGhGaWd1cmVCbG9jaz47XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGlubGluZS50cyBcdTIwMTQgSW5saW5lIGNvbnRlbnQgbm9kZXNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBJbmxpbmUgbm9kZXMgYXJlIHRoZSBhdG9tcyBpbnNpZGUgYSBibG9jaydzIGBjb250ZW50YCBhcnJheS4gTW9zdCBibG9ja3Ncbi8vIGFjY2VwdCB0aGUgSW5saW5lTm9kZSB1bmlvbiAodGV4dCArIGlubGluZSBtYXRoKS4gVGhlIGZpbGxfaW5fYmxhbmsgYmxvY2tcbi8vIGlzIHNwZWNpYWw6IGl0IGFjY2VwdHMgYW4gZXh0ZW5kZWQgdW5pb24gdGhhdCBhbHNvIGluY2x1ZGVzIEJsYW5rVG9rZW4uXG4vL1xuLy8gRGlzY3JpbWluYXRpb246IGV2ZXJ5IGlubGluZSBub2RlIGhhcyBhIGB0eXBlYCBsaXRlcmFsLiBab2Qnc1xuLy8gZGlzY3JpbWluYXRlZFVuaW9uIGtleXMgb24gaXQsIHdoaWNoIGdpdmVzIHVzIG5hcnJvdyB0eXBlcyBhZnRlciBwYXJzaW5nXG4vLyBhbmQgY2xlYXIgZXJyb3IgbWVzc2FnZXMgb24gbWFsZm9ybWVkIGRhdGEuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbi8vIEJvdGggaW1wb3J0cyBhcmUgTEVBRi1TQUZFIFx1MjAxNCBuZWl0aGVyIG1vZHVsZSBpbXBvcnRzIGlubGluZS50cywgc28gbmVpdGhlclxuLy8gY3JlYXRlcyBhIGN5Y2xlLiBzaXppbmcuanMgYW5kIGJsb2Nrcy9pbWFnZS5qcydzIENyb3BSZWN0IGFyZSB6b2Qtb25seTtcbi8vIGJsb2Nrcy9ncmFwaC1maWd1cmUuanMgcmVhY2hlcyBpdHMgYXhpcy9kcmF3YWJsZSBwcmltaXRpdmVzIHZpYSB0aGUgbGVhZlxuLy8gZ3JhcGgtcHJpbWl0aXZlcy50cyBwcmVjaXNlbHkgc28gdGhhdCB0aGlzIGltcG9ydCBpcyBwb3NzaWJsZS4gRG8gbm90IHN3YXBcbi8vIGVpdGhlciBmb3IgYSBibG9ja3MvIG1vZHVsZSB0aGF0IGNhcnJpZXMgSW5saW5lTm9kZS5cbmltcG9ydCB7IHNpemluZ0ZpZWxkcywgdHlwZSBCbG9ja0FsaWduIH0gZnJvbSAnLi9zaXppbmcuanMnO1xuaW1wb3J0IHsgQ3JvcFJlY3QgfSBmcm9tICcuL2Jsb2Nrcy9pbWFnZS5qcyc7XG5pbXBvcnQgeyBHcmFwaEZpZ3VyZUJsb2NrIH0gZnJvbSAnLi9ibG9ja3MvZ3JhcGgtZmlndXJlLmpzJztcblxuLy8gLS0tLSBNYXJrcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE1hcmtzIGFyZSBmb3JtYXR0aW5nIGFwcGxpZWQgdG8gYSBydW4gb2YgdGV4dCBcdTIwMTQgbm90IG5lc3RlZCBlbGVtZW50cyAobm9cbi8vIDxlbT48c3Ryb25nPi4uLjwvc3Ryb25nPjwvZW0+IHN0cnVjdHVyZSk7IGEgc2luZ2xlIFRleHROb2RlIGNhbiBjYXJyeVxuLy8gc2V2ZXJhbC4gT3JkZXIgZG9lc24ndCBtYXR0ZXIgXHUyMDE0IHJlbmRlciBvdXRwdXQgaXMgY2Fub25pY2FsaXplZC5cbi8vXG4vLyBFYWNoIG1hcmsgaXMgYW4gT0JKRUNUIHdpdGggYSBgdHlwZWAgZGlzY3JpbWluYW50LiBTaW1wbGUgbWFya3MgKGJvbGQsIGV0Yy4pXG4vLyBjYXJyeSBvbmx5IGB0eXBlYDsgYXR0cmlidXRlLWNhcnJ5aW5nIG1hcmtzIChlLmcuIGBkZWZpbml0aW9uYCkgaGFuZyB0aGVpclxuLy8gZGF0YSBvZmYgdGhlIHNhbWUgb2JqZWN0LiBMZWdhY3kgZG9jdW1lbnRzIHN0b3JlZCBtYXJrcyBhcyBiYXJlIHN0cmluZ3Ncbi8vICgnYm9sZCcpOyB0aGUgcHJlcHJvY2VzcyBiZWxvdyB1cGdyYWRlcyB0aG9zZSB0byB0aGUgb2JqZWN0IGZvcm0gb24gcmVhZCwgc29cbi8vIG9sZCBhY3Rpdml0aWVzIGtlZXAgcGFyc2luZyB3aXRob3V0IGEgc2NoZW1hVmVyc2lvbiBidW1wLiBOZXcgY29kZSBhbHdheXNcbi8vIHdyaXRlcyB0aGUgb2JqZWN0IGZvcm0uXG5leHBvcnQgY29uc3QgU0lNUExFX01BUktfVFlQRVMgPSBbXG4gICdib2xkJyxcbiAgJ2l0YWxpYycsXG4gICd1bmRlcmxpbmUnLFxuICAnY29kZScsXG4gICdzdWJzY3JpcHQnLFxuICAnc3VwZXJzY3JpcHQnLFxuXSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIFNpbXBsZU1hcmtUeXBlID0gKHR5cGVvZiBTSU1QTEVfTUFSS19UWVBFUylbbnVtYmVyXTtcblxuY29uc3QgQm9sZE1hcmsgPSB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnYm9sZCcpIH0pO1xuY29uc3QgSXRhbGljTWFyayA9IHoub2JqZWN0KHsgdHlwZTogei5saXRlcmFsKCdpdGFsaWMnKSB9KTtcbmNvbnN0IFVuZGVybGluZU1hcmsgPSB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgndW5kZXJsaW5lJykgfSk7XG5jb25zdCBDb2RlTWFyayA9IHoub2JqZWN0KHsgdHlwZTogei5saXRlcmFsKCdjb2RlJykgfSk7XG5jb25zdCBTdWJzY3JpcHRNYXJrID0gei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ3N1YnNjcmlwdCcpIH0pO1xuY29uc3QgU3VwZXJzY3JpcHRNYXJrID0gei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ3N1cGVyc2NyaXB0JykgfSk7XG5cbi8vIFRoZSBhdHRyaWJ1dGUtZnJlZSBtYXJrcyBhcyBhIHVuaW9uLiBEZWZpbml0aW9uIGNvbnRlbnQgKGJlbG93KSBhbGxvd3Mgb25seVxuLy8gdGhlc2UgXHUyMDE0IGEgZGVmaW5pdGlvbiBjYW4gYmUgZm9ybWF0dGVkIGJ1dCBjYW5ub3QgaXRzZWxmIGNvbnRhaW4gYSBuZXN0ZWRcbi8vIGRlZmluaXRpb24sIHdoaWNoIGFsc28ga2VlcHMgdGhlIHNjaGVtYSBub24tcmVjdXJzaXZlLlxuY29uc3QgU2ltcGxlTWFyayA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBCb2xkTWFyayxcbiAgSXRhbGljTWFyayxcbiAgVW5kZXJsaW5lTWFyayxcbiAgQ29kZU1hcmssXG4gIFN1YnNjcmlwdE1hcmssXG4gIFN1cGVyc2NyaXB0TWFyayxcbl0pO1xuXG4vLyAtLS0tIE1hdGggcHJvbXB0IChNb2RlbCBBOiBpbi1lcXVhdGlvbiBibGFuaykgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBncmFkZWFibGUgZ2FwIElOU0lERSBhIHJlbmRlcmVkIGVxdWF0aW9uIFx1MjAxNCB0aGUgTWF0aExpdmUgYFxccGxhY2Vob2xkZXJbaWRde31gXG4vLyBmZWF0dXJlLiBgaWRgIG1hdGNoZXMgdGhlIHBsYWNlaG9sZGVyIG1hcmtlciBpbiB0aGUgb3duaW5nIG5vZGUncyBgbGF0ZXhgOyB0aGVcbi8vIHN0dWRlbnQncyB0eXBlZCBtYXRoIGV4cHJlc3Npb24gaXMgZ3JhZGVkIGV4YWN0bHkgbGlrZSBhICdtYXRoJyBmaWxsLWluLWJsYW5rXG4vLyAobnVtZXJpYy1zYW1wbGluZyBlcXVpdmFsZW5jZSwgMmEgXHUyMjYxIGErYSBcdTIyNjEgYSoyKS4gTW9kZWwgQSByZXVzZXMgdGhlIGV4aXN0aW5nXG4vLyBgc3VibWlzc2lvbnMucmVzcG9uc2VzLmJsYW5rc2AgbWFwIGtleWVkIGJ5IHRoaXMgaWQsIHNvIHByb21wdHMgbmVlZCBOTyBuZXdcbi8vIHdpcmUgc2hhcGUuIEEgZ2FwIGlzIGluaGVyZW50bHkgYSBtYXRoIGFuc3dlciwgc28gdGhlcmUgaXMgbm8gYGFuc3dlclR5cGVgXG4vLyBoZXJlIFx1MjAxNCBgZXF1aXZhbGVuY2VgICsgYHRvbGVyYW5jZWAgYXJlIHRoZSBzYW1lIGdyYWRpbmcga25vYnMgYSAnbWF0aCdcbi8vIEJsYW5rVG9rZW4gY2FycmllcywgcmV1c2VkIHZlcmJhdGltLiBTZWUgZG9jcy9kZXNpZ24vbWF0aC1ibGFua3MubWQgKE1vZGVsIEEpLlxuZXhwb3J0IGNvbnN0IE1hdGhQcm9tcHQgPSB6Lm9iamVjdCh7XG4gIC8vIE1hdGNoZXMgdGhlIGBcXHBsYWNlaG9sZGVyW2lkXXt9YCBtYXJrZXIgaW4gdGhlIG93bmluZyBub2RlJ3MgbGF0ZXguIE5PVCBhXG4gIC8vIHV1aWQ6IE1hdGhMaXZlIHBsYWNlaG9sZGVyIGlkcyBtYXkgbm90IGNvbnRhaW4gc3BhY2VzL3NwZWNpYWwgY2hhcmFjdGVyc1xuICAvLyAodXVpZCBoeXBoZW5zIGFyZSB1bnNhZmUpLCBzbyB0aGUgZWRpdG9yIG1pbnRzIGEgTWF0aExpdmUtc2FmZSB0b2tlbi5cbiAgLy8gRG9jdW1lbnQtd2lkZSB1bmlxdWVuZXNzIChpdCBrZXlzIGludG8gdGhlIGJsYW5rcyBtYXApIGlzIGFuIGF1dGhvcmluZy10aW1lXG4gIC8vIGludmFyaWFudCwgbm90IGEgc2NoZW1hIGNvbnN0cmFpbnQuXG4gIGlkOiB6LnN0cmluZygpLm1pbigxKSxcbiAgYW5zd2VyOiB6LnN0cmluZygpLm1pbigxKSxcbiAgLy8gQWx0ZXJuYXRpdmUgYWNjZXB0YWJsZSBmb3JtcyAoXCJhbHNvIGFjY2VwdFwiKS4gRW1wdHkgYXJyYXkgaXMgdGhlIGNvbW1vbiBjYXNlLlxuICBhY2NlcHRhYmxlQW5zd2Vyczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgLy8gRXF1aXZhbGVuY2UgbW9kZTogJ3ZhbHVlJyAoZGVmYXVsdCwgYW55IGV4cHJlc3Npb24gdGhhdCBldmFsdWF0ZXMgZXF1YWwpIG9yXG4gIC8vICdleGFjdC1mb3JtJyAobm9ybWFsaXplZC1zdHJpbmcgbWF0Y2gpLiBBYnNlbnQgPSAndmFsdWUnLiBNaXJyb3JzIEJsYW5rVG9rZW4uXG4gIGVxdWl2YWxlbmNlOiB6LmVudW0oWyd2YWx1ZScsICdleGFjdC1mb3JtJ10pLm9wdGlvbmFsKCksXG4gIC8vIEFic29sdXRlIHNhbXBsaW5nIHRvbGVyYW5jZS4gQWJzZW50ID0gbm8gZXh0cmEgc2xhY2suIE1pcnJvcnMgQmxhbmtUb2tlbi5cbiAgdG9sZXJhbmNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNYXRoUHJvbXB0ID0gei5pbmZlcjx0eXBlb2YgTWF0aFByb21wdD47XG5cbi8vIC0tLS0gSW5saW5lIG1hdGggLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBMYVRlWCBzb3VyY2UgZm9yIEthVGVYLiBTdG9yZWQgdmVyYmF0aW07IHJlbmRlcmVkIGF0IHJlbmRlciB0aW1lLiBUaGVcbi8vIHJlbmRlcmVyIGlzIHRvbGVyYW50IG9mIGludmFsaWQgTGFUZVggKHJlbmRlcnMgYW4gZXJyb3IgaW5kaWNhdG9yIHJhdGhlclxuLy8gdGhhbiBjcmFzaGluZykgc28gc2F2aW5nIGEgZG9jIHdpdGggYnJva2VuIG1hdGggZG9lc24ndCBsb2NrIHRoZSBlZGl0b3IuXG5leHBvcnQgY29uc3QgSW5saW5lTWF0aE5vZGUgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnbWF0aF9pbmxpbmUnKSxcbiAgbGF0ZXg6IHouc3RyaW5nKCksXG4gIC8vIE1vZGVsIEE6IG9wdGlvbmFsIGluLWVxdWF0aW9uIGdyYWRlYWJsZSBnYXBzIChcdTAwQTdNYXRoUHJvbXB0KS4gT3B0aW9uYWwgd2l0aFxuICAvLyBOTyBkZWZhdWx0IHNvIGEgbWF0aCBub2RlIGF1dGhvcmVkIGJlZm9yZSBNb2RlbCBBIFx1MjAxNCBvciBvbmUgd2l0aCBubyBnYXBzIFx1MjAxNFxuICAvLyByZS1zZXJpYWxpemVzIEJZVEUtSURFTlRJQ0FMTFkgKGEgYC5kZWZhdWx0KFtdKWAgd291bGQgbWF0ZXJpYWxpemUgYHByb21wdHM6XG4gIC8vIFtdYCBvbiBldmVyeSBsZWdhY3kgbm9kZSkuIFNhbWUgb3B0aW9uYWwtbm8tZGVmYXVsdCBkaXNjaXBsaW5lIGFzXG4gIC8vIEJsYW5rVG9rZW4uYW5zd2VyVHlwZS90b2xlcmFuY2UuIFNlZSBkb2NzL2Rlc2lnbi9tYXRoLWJsYW5rcy5tZCAoTW9kZWwgQSkuXG4gIHByb21wdHM6IHouYXJyYXkoTWF0aFByb21wdCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgSW5saW5lTWF0aE5vZGUgPSB6LmluZmVyPHR5cGVvZiBJbmxpbmVNYXRoTm9kZT47XG5cbi8vIC0tLS0gSGFyZCBicmVhayAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIHNvZnQgbGluZSBicmVhayBpbnNpZGUgYSBibG9jayAoVGlwdGFwJ3MgaGFyZEJyZWFrIC8gU2hpZnQrRW50ZXIpLCBhc1xuLy8gb3Bwb3NlZCB0byBhIG5ldyBibG9jay4gQ2FycmllcyBubyBkYXRhIFx1MjAxNCBpdCByZW5kZXJzIGFzIDxicj4uIFdpdGhvdXQgdGhpc1xuLy8gbm9kZSB0aGUgYnJlYWsgaXMgZHJvcHBlZCBvbiBzZXJpYWxpemUgYW5kIGFkamFjZW50IHRleHQgcnVucyBjb25jYXRlbmF0ZS5cbmV4cG9ydCBjb25zdCBIYXJkQnJlYWtOb2RlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2hhcmRfYnJlYWsnKSxcbn0pO1xuZXhwb3J0IHR5cGUgSGFyZEJyZWFrTm9kZSA9IHouaW5mZXI8dHlwZW9mIEhhcmRCcmVha05vZGU+O1xuXG4vLyAtLS0tIERlZmluaXRpb24gY29udGVudCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHJpY2ggY29udGVudCBzaG93biBpbiBhIGRlZmluaXRpb24ncyBwb3BvdmVyOiBmb3JtYXR0ZWQgdGV4dCArIGlubGluZVxuLy8gbWF0aCAodGhlIHNhbWUgYWxwaGFiZXQgdGhlIGJsYW5rIGhpbnQgdXNlcyksIGF1dGhvcmVkIHZpYSB0aGUgc2hhcmVkXG4vLyBJbmxpbmVSaWNoVGV4dEVkaXRvci4gQSBkZWZpbml0aW9uJ3MgdGV4dCBydW4gY2FycmllcyBTaW1wbGVNYXJrIG9ubHkgXHUyMDE0IG5vXG4vLyBuZXN0ZWQgZGVmaW5pdGlvbnMgXHUyMDE0IHdoaWNoIGFsc28gYnJlYWtzIHRoZSByZWN1cnNpb24gdGhhdCByZXVzaW5nIElubGluZU5vZGVcbi8vIGhlcmUgd291bGQgY3JlYXRlIChEZWZpbml0aW9uTWFyayBcdTIxOTIgY29udGVudCBcdTIxOTIgdGV4dCBcdTIxOTIgbWFya3MgXHUyMTkyIERlZmluaXRpb25NYXJrKS5cbmNvbnN0IERlZmluaXRpb25Db250ZW50VGV4dCA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCd0ZXh0JyksXG4gIHRleHQ6IHouc3RyaW5nKCksXG4gIG1hcmtzOiB6LmFycmF5KFNpbXBsZU1hcmspLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgY29uc3QgRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmUgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgRGVmaW5pdGlvbkNvbnRlbnRUZXh0LFxuICBJbmxpbmVNYXRoTm9kZSxcbiAgSGFyZEJyZWFrTm9kZSxcbl0pO1xuZXhwb3J0IHR5cGUgRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmUgPSB6LmluZmVyPHR5cGVvZiBEZWZpbml0aW9uQ29udGVudElubGluZT47XG5cbi8vIC0tLS0gRGVmaW5pdGlvbiBibG9ja3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIGRlZmluaXRpb24ncyBjb250ZW50IGlzIGEgQkxPQ0sgc2VxdWVuY2UsIHNvIGEgdm9jYWJ1bGFyeSBwb3BvdmVyIGNhbiBob2xkXG4vLyB3aGF0IGEgcmVmZXJlbmNlIHNoZWV0IGhvbGRzOiBhIGRpc3BsYXkgZXF1YXRpb24sIGEgc2hvcnQgcHJvcGVydHkgbGlzdCwgYVxuLy8gZmlndXJlLiBTZWUgZG9jcy9kZXNpZ24vZGVmaW5pdGlvbi1yaWNoLWNvbnRlbnQubWQuXG4vL1xuLy8gVGhlIHVuaW9uIGlzIGEgY3VyYXRlZCBzdWJzZXQgb2YgdGhlIHJlZmVyZW5jZSBwYW5lbCdzIGNvbnRlbnQgYmxvY2tzLCBhbmRcbi8vIGV2ZXJ5IHRleHQtYmVhcmluZyBtZW1iZXIgaXMgZGVmaW5lZCBMT0NBTExZIG92ZXIgRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmVcbi8vIHJhdGhlciB0aGFuIHJldXNpbmcgaXRzIGJsb2Nrcy8gc2libGluZy4gVGhhdCBpcyB3aGF0IGtlZXBzIHRoZSBzY2hlbWFcbi8vIE5PTi1SRUNVUlNJVkU6IGJsb2Nrcy9wYXJhZ3JhcGgudHMgYW5kIGZyaWVuZHMgY2FycnkgSW5saW5lTm9kZSwgd2hvc2Vcbi8vIFRleHROb2RlIGNhcnJpZXMgTWFyaywgd2hpY2ggaW5jbHVkZXMgRGVmaW5pdGlvbk1hcmsgXHUyMDE0IHNvIHJldXNpbmcgdGhlbSB3b3VsZFxuLy8gY2xvc2UgdGhlIGN5Y2xlIERlZmluaXRpb25NYXJrIC0+IGJsb2NrIC0+IHRleHQgLT4gbWFyayAtPiBEZWZpbml0aW9uTWFyayBhbmRcbi8vIGFkbWl0IGRlZmluaXRpb25zIG5lc3RlZCBpbnNpZGUgZGVmaW5pdGlvbnMgYXQgYXJiaXRyYXJ5IGRlcHRoLiBJdCB3b3VsZCBhbHNvXG4vLyBsYW5kIG9uIHRoZSBzYW1lIHRzYyBkZWNsYXJhdGlvbi1zZXJpYWxpemF0aW9uIGxpbWl0IChUUzcwNTYpIHRoYXQgYWxyZWFkeVxuLy8gZm9yY2VkIHRoZSBoYW5kLXdyaXR0ZW4gYGludGVyZmFjZSBBY3Rpdml0eURvY3VtZW50YCBpbiBkb2N1bWVudC50cy5cbi8vXG4vLyBFeGNsdWRlZCBvbiBwdXJwb3NlIChhdXRob3IgcnVsaW5ncywgZGVzaWduIGRvYyBEMi9EMyk6IGNvbHVtbnMgKHVucmVhZGFibGVcbi8vIGluIGEgfjI4cmVtIHBvcG92ZXIgXHUyMDE0IGEgZGVmaW5pdGlvbiB0aGF0IG5lZWRzIHR3by1jb2x1bW4gbGF5b3V0IElTIHRoZVxuLy8gcmVmZXJlbmNlIHBhbmVsKSwgY2FsbG91dCAoYSBub3RlIGJveCBpbnNpZGUgYSBub3RlIGJveCksIGFuZCBldmVyeVxuLy8gcXVlc3Rpb24vaW50ZXJhY3RpdmUgYmxvY2sgKGEgZGVmaW5pdGlvbiBpcyBuZXZlciBncmFkZWFibGUpLlxuLy9cbi8vIGBpZGAgaXMgT1BUSU9OQUwgb24gdGhlIGxvY2FsbHktZGVmaW5lZCBtZW1iZXJzLCB1bmxpa2UgZXZlcnkgYmxvY2tzLyBzaWJsaW5nXG4vLyB3aGVyZSBpdCBpcyBhIHJlcXVpcmVkIHV1aWQuIFR3byByZWFzb25zOiBub3RoaW5nIGFkZHJlc3NlcyBhIGRlZmluaXRpb24gYmxvY2tcbi8vIChpdCBpcyBuZXZlciBzY29yZWQsIG5ldmVyIGEgc3VibWlzc2lvbiBrZXksIG5ldmVyIGEgcnVudGltZSByZWYgXHUyMDE0IG9ubHkgdGhlXG4vLyBlZGl0b3Igd2FudHMgaXQsIGFuZCB0aGUgZWRpdG9yIGFsd2F5cyBtaW50cyBvbmUpLCBhbmQgdGhlIGxlZ2FjeSB1cGdyYWRlcyBpblxuLy8gdGhlIE1hcmsgcHJlcHJvY2VzcyBiZWxvdyBtdXN0IGJlIERFVEVSTUlOSVNUSUMuIEEgcmVxdWlyZWQgdXVpZCB3b3VsZCBmb3JjZVxuLy8gY3J5cHRvLnJhbmRvbVVVSUQoKSBhdCBwYXJzZSB0aW1lLCBzbyBwYXJzaW5nIG9uZSBzdG9yZWQgZG9jdW1lbnQgdHdpY2Ugd291bGRcbi8vIHlpZWxkIGRpZmZlcmVudCBpZHMgYW5kIGJyZWFrIHJlLXNlcmlhbGl6YXRpb24gYnl0ZS1pZGVudGl0eS5cblxuLy8gRXZlcnkgc2NoZW1hIGJlbG93IGNhcnJpZXMgYW4gRVhQTElDSVQgaW50ZXJmYWNlICsgYHouWm9kVHlwZTxcdTIwMjY+YCBhbm5vdGF0aW9uXG4vLyByYXRoZXIgdGhhbiByZWx5aW5nIG9uIHouaW5mZXIuIFRoaXMgaXMgbm90IHN0eWxlOiB3aXRob3V0IGl0LCBhZGRpbmcgYVxuLy8gNy1tZW1iZXIgYmxvY2sgdW5pb24gaW5zaWRlIGEgbWFyayB0aGF0IGV2ZXJ5IGJsb2NrJ3MgaW5saW5lIGNvbnRlbnQgY2FuXG4vLyByZWFjaCBvdmVyZmxvd3MgdHNjJ3MgZGVjbGFyYXRpb24tc2VyaWFsaXphdGlvbiBsaW1pdCBhbmQgZmFpbHMgdGhlIGJ1aWxkIHdpdGhcbi8vIFRTNzA1NiBpbiBmaXZlIGRvd25zdHJlYW0gZmlsZXMgKGJsb2Nrcy9pbmRleC50cydzIEJsb2NrLCBkb2N1bWVudC50cyxcbi8vIGxheW91dC50cykuIE5hbWluZyB0aGUgdHlwZXMgc3RvcHMgdGhlIHN0cnVjdHVyYWwgZXhwYW5zaW9uIGF0IHRoaXMgYm91bmRhcnkgXHUyMDE0XG4vLyB0aGUgc2FtZSByZW1lZHkgYGludGVyZmFjZSBBY3Rpdml0eURvY3VtZW50YCBhbHJlYWR5IGFwcGxpZXMgaW4gZG9jdW1lbnQudHMuXG4vLyBUaGUgYW5ub3RhdGlvbnMgYXJlIGNoZWNrZWQgYWdhaW5zdCB0aGUgb2JqZWN0IHNjaGVtYXMsIHNvIG5vdGhpbmcgaGVyZSBsb3Nlc1xuLy8gdHlwZSBzYWZldHksIGFuZCB0aGUgcnVudGltZSBvYmplY3RzIGFyZSB1bnRvdWNoZWQgKGEgZGlzY3JpbWluYXRlZFVuaW9uIHN0aWxsXG4vLyBwYXJzZXMgYXMgYSBkaXNjcmltaW5hdGVkVW5pb24pLlxuXG5jb25zdCBEZWZpbml0aW9uQmxvY2tJZCA9IHouc3RyaW5nKCkudXVpZCgpLm9wdGlvbmFsKCk7XG5cbi8vIFNoYXJlZCBzaXppbmcgZnJhZ21lbnQsIHNwZWxsZWQgb3V0IGZvciB0aGUgaW50ZXJmYWNlcyBhYm92ZS5cbmludGVyZmFjZSBEZWZpbml0aW9uU2l6aW5nIHtcbiAgd2lkdGg/OiBudW1iZXI7XG4gIGFsaWduPzogQmxvY2tBbGlnbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZWZpbml0aW9uUGFyYWdyYXBoQmxvY2sge1xuICBpZD86IHN0cmluZztcbiAgdHlwZTogJ3BhcmFncmFwaCc7XG4gIGNvbnRlbnQ6IERlZmluaXRpb25Db250ZW50SW5saW5lW107XG59XG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25IZWFkaW5nQmxvY2sge1xuICBpZD86IHN0cmluZztcbiAgdHlwZTogJ2hlYWRpbmcnO1xuICBsZXZlbDogMSB8IDIgfCAzO1xuICBjb250ZW50OiBEZWZpbml0aW9uQ29udGVudElubGluZVtdO1xufVxuZXhwb3J0IGludGVyZmFjZSBEZWZpbml0aW9uTWF0aEJsb2NrIGV4dGVuZHMgRGVmaW5pdGlvblNpemluZyB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAnbWF0aF9ibG9jayc7XG4gIGxhdGV4OiBzdHJpbmc7XG59XG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25JbWFnZUJsb2NrIGV4dGVuZHMgRGVmaW5pdGlvblNpemluZyB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAnaW1hZ2UnO1xuICBzcmM6IHN0cmluZztcbiAgYWx0OiBzdHJpbmc7XG4gIGNyb3A/OiBDcm9wUmVjdDtcbiAgc3JjQXNwZWN0PzogbnVtYmVyO1xufVxuXG5jb25zdCBEZWZpbml0aW9uUGFyYWdyYXBoQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgdHlwZTogei5saXRlcmFsKCdwYXJhZ3JhcGgnKSxcbiAgY29udGVudDogei5hcnJheShEZWZpbml0aW9uQ29udGVudElubGluZSkuZGVmYXVsdChbXSksXG59KTtcblxuLy8gU2FtZSB0aHJlZS1sZXZlbCBjYXAgYXMgSGVhZGluZ0Jsb2NrLiBUaGUgcG9wb3ZlciBzdHlsZXNoZWV0IHNjb3BlcyB0aGVzZVxuLy8gZG93biBzbyBhIHBhbmVsLXNjYWxlIGgxIHJlYWRzIGNvcnJlY3RseSBhdCBwb3BvdmVyIHNjYWxlLlxuY29uc3QgRGVmaW5pdGlvbkhlYWRpbmdCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IERlZmluaXRpb25CbG9ja0lkLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2hlYWRpbmcnKSxcbiAgbGV2ZWw6IHoudW5pb24oW3oubGl0ZXJhbCgxKSwgei5saXRlcmFsKDIpLCB6LmxpdGVyYWwoMyldKSxcbiAgY29udGVudDogei5hcnJheShEZWZpbml0aW9uQ29udGVudElubGluZSkuZGVmYXVsdChbXSksXG59KTtcblxuLy8gRGlzcGxheSBtYXRoLiBBIGRlZmluaXRpb24tbG9jYWwgc2hhcGUgcmF0aGVyIHRoYW4gYmxvY2tzL21hdGgtYmxvY2sudHMnc1xuLy8gTWF0aEJsb2NrLCB3aGljaCBjYXJyaWVzIGBwcm9tcHRzYCAoaW4tZXF1YXRpb24gZ3JhZGVhYmxlIGdhcHMpIGFuZFxuLy8gYHNvbHV0aW9uOiBJbmxpbmVOb2RlW11gIFx1MjAxNCB0aGUgZmlyc3QgaXMgbWVhbmluZ2xlc3MgaGVyZSAoYSBkZWZpbml0aW9uIGlzXG4vLyBuZXZlciBncmFkZWFibGUsIHRoZSBzYW1lIHBvc3R1cmUgdGhlIHJlZmVyZW5jZSBwYW5lbCBhbHJlYWR5IHRha2VzKSBhbmQgdGhlXG4vLyBzZWNvbmQgaXMgZXhhY3RseSB0aGUgcmVjdXJzaXZlIGVkZ2UgZGVzY3JpYmVkIGFib3ZlLiBTaXppbmcgcmlkZXMgYWxvbmc7XG4vLyBsYWJlbEZpZWxkcyBkbyBub3QgKGEgZGVmaW5pdGlvbiBibG9jayBpcyBuZXZlciBudW1iZXJlZCkuXG5jb25zdCBEZWZpbml0aW9uTWF0aEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogRGVmaW5pdGlvbkJsb2NrSWQsXG4gIHR5cGU6IHoubGl0ZXJhbCgnbWF0aF9ibG9jaycpLFxuICBsYXRleDogei5zdHJpbmcoKSxcbiAgLi4uc2l6aW5nRmllbGRzLFxufSk7XG5cbi8vIElsbHVzdHJhdGl2ZSBpbWFnZS4gRGVmaW5pdGlvbi1sb2NhbCBmb3IgdGhlIG9wdGlvbmFsLWlkIHJlYXNvbiBhYm92ZSwgYnV0IGl0XG4vLyByZXVzZXMgdGhlIHNoYXJlZCBzaXppbmcgKyBjcm9wIHZvY2FidWxhcnkgdmVyYmF0aW0sIHNvIHJlZnJhbWluZyBhIHRleHRib29rXG4vLyBmaWd1cmUgZG93biB0byB0aGUgcmVsZXZhbnQgY29ybmVyIHdvcmtzIGV4YWN0bHkgYXMgaXQgZG9lcyBpbiB0aGUgYm9keS5cbi8vIGBjYXB0aW9uYCBpcyBkZWxpYmVyYXRlbHkgYWJzZW50IChZQUdOSSBcdTIwMTQgYWx0IGNvdmVycyBhY2Nlc3NpYmlsaXR5LCBhbmQgYVxuLy8gY2FwdGlvbmVkIGZpZ3VyZSBpbiBhIHBvcG92ZXIgaXMgdGhlIHJlZmVyZW5jZSBwYW5lbCdzIGpvYik7IGFkZGl0aXZlIGxhdGVyLlxuY29uc3QgRGVmaW5pdGlvbkltYWdlQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgdHlwZTogei5saXRlcmFsKCdpbWFnZScpLFxuICBzcmM6IHouc3RyaW5nKCksXG4gIGFsdDogei5zdHJpbmcoKS5kZWZhdWx0KCcnKSxcbiAgLi4uc2l6aW5nRmllbGRzLFxuICBjcm9wOiBDcm9wUmVjdC5vcHRpb25hbCgpLFxuICBzcmNBc3BlY3Q6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxufSk7XG5cbi8vIE5lc3RlZCBsaXN0cywgbWlycm9yaW5nIGJsb2Nrcy9saXN0LnRzJ3Mgc2hhcGUgc28gVGFiLXRvLWluZGVudCBpbiB0aGVcbi8vIGRlZmluaXRpb24gZGlhbG9nIHJvdW5kLXRyaXBzLiBTYW1lIHJlY3Vyc2lvbiBtZWNoYW5pYzogb25seSB0aGUgY3ljbGljIGVkZ2Vcbi8vIChpdGVtIC0+IGxpc3QgLT4gaXRlbSkgaXMgei5sYXp5KCksIGxlYXZpbmcgdGhlIGxpc3QgYmxvY2tzIGFzIHBsYWluXG4vLyB6Lm9iamVjdHMgc28gdGhleSBzdGF5IHVzYWJsZSBhcyBkaXNjcmltaW5hdGVkVW5pb24gbWVtYmVycyBiZWxvdy5cbmV4cG9ydCBpbnRlcmZhY2UgRGVmaW5pdGlvbkxpc3RJdGVtIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIGNvbnRlbnQ6IERlZmluaXRpb25Db250ZW50SW5saW5lW107XG4gIGNoaWxkcmVuPzogQXJyYXk8RGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jayB8IERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrPjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jayB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAnYnVsbGV0X2xpc3QnO1xuICBpdGVtczogRGVmaW5pdGlvbkxpc3RJdGVtW107XG59XG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIHR5cGU6ICdvcmRlcmVkX2xpc3QnO1xuICBpdGVtczogRGVmaW5pdGlvbkxpc3RJdGVtW107XG59XG5cbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uTGlzdEl0ZW06IHouWm9kVHlwZTxcbiAgRGVmaW5pdGlvbkxpc3RJdGVtLFxuICB6LlpvZFR5cGVEZWYsXG4gIHVua25vd25cbj4gPSB6LmxhenkoKCkgPT5cbiAgei5vYmplY3Qoe1xuICAgIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgICBjb250ZW50OiB6LmFycmF5KERlZmluaXRpb25Db250ZW50SW5saW5lKS5kZWZhdWx0KFtdKSxcbiAgICBjaGlsZHJlbjogelxuICAgICAgLmFycmF5KHoudW5pb24oW0RlZmluaXRpb25CdWxsZXRMaXN0QmxvY2ssIERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrXSkpXG4gICAgICAub3B0aW9uYWwoKSxcbiAgfSksXG4pO1xuXG5leHBvcnQgY29uc3QgRGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IERlZmluaXRpb25CbG9ja0lkLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2J1bGxldF9saXN0JyksXG4gIGl0ZW1zOiB6LmFycmF5KERlZmluaXRpb25MaXN0SXRlbSkuZGVmYXVsdChbXSksXG59KTtcblxuZXhwb3J0IGNvbnN0IERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogRGVmaW5pdGlvbkJsb2NrSWQsXG4gIHR5cGU6IHoubGl0ZXJhbCgnb3JkZXJlZF9saXN0JyksXG4gIGl0ZW1zOiB6LmFycmF5KERlZmluaXRpb25MaXN0SXRlbSkuZGVmYXVsdChbXSksXG59KTtcblxuLy8gR3JhcGhGaWd1cmVCbG9jayBpcyB0aGUgT05FIG1lbWJlciByZXVzZWQgdmVyYmF0aW06IGl0IGlzIGFscmVhZHkgaW5saW5lLWZyZWVcbi8vIChheGlzICsgZHJhd2FibGVzIG9ubHkpLCBzbyBpdCBpbnRyb2R1Y2VzIG5vIGN5Y2xlLCBhbmQgaXQgaGFzIG5vIGxlZ2FjeVxuLy8gdXBncmFkZSBwYXRoIHRoYXQgd291bGQgbmVlZCB0byBtaW50IGl0cyByZXF1aXJlZCB1dWlkLiBJbXBvcnRpbmcgaXQgaXMgc2FmZVxuLy8gb25seSBiZWNhdXNlIGl0cyBvd24gZ3JhcGggcHJpbWl0aXZlcyBub3cgY29tZSBmcm9tIHRoZSBsZWFmXG4vLyBncmFwaC1wcmltaXRpdmVzLnRzIHJhdGhlciB0aGFuIHRocm91Z2ggYmxvY2tzL2ludGVyYWN0aXZlLWdyYXBoLnRzIFx1MjAxNCBzZWUgdGhlXG4vLyBoZWFkZXIgY29tbWVudCB0aGVyZS5cbmV4cG9ydCB0eXBlIERlZmluaXRpb25CbG9jayA9XG4gIHwgRGVmaW5pdGlvblBhcmFncmFwaEJsb2NrXG4gIHwgRGVmaW5pdGlvbkhlYWRpbmdCbG9ja1xuICB8IERlZmluaXRpb25NYXRoQmxvY2tcbiAgfCBEZWZpbml0aW9uSW1hZ2VCbG9ja1xuICB8IERlZmluaXRpb25CdWxsZXRMaXN0QmxvY2tcbiAgfCBEZWZpbml0aW9uT3JkZXJlZExpc3RCbG9ja1xuICB8IEdyYXBoRmlndXJlQmxvY2s7XG5cbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uQmxvY2s6IHouWm9kVHlwZTxcbiAgRGVmaW5pdGlvbkJsb2NrLFxuICB6LlpvZFR5cGVEZWYsXG4gIHVua25vd25cbj4gPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgRGVmaW5pdGlvblBhcmFncmFwaEJsb2NrLFxuICBEZWZpbml0aW9uSGVhZGluZ0Jsb2NrLFxuICBEZWZpbml0aW9uTWF0aEJsb2NrLFxuICBEZWZpbml0aW9uSW1hZ2VCbG9jayxcbiAgRGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jayxcbiAgRGVmaW5pdGlvbk9yZGVyZWRMaXN0QmxvY2ssXG4gIEdyYXBoRmlndXJlQmxvY2ssXG5dKTtcblxuLy8gRGVmaW5pdGlvbk1hcmsgXHUyMDE0IGlubGluZSB2b2NhYnVsYXJ5IGRlZmluaXRpb24gKFBoYXNlIDIpLiBgY29udGVudGAgaXMgdGhlXG4vLyByaWNoIGRlZmluaXRpb24gc2hvd24gaW4gdGhlIHB1Ymxpc2hlZC1wYWdlIHBvcG92ZXIsIG5vdyBhIGJsb2NrIHNlcXVlbmNlXG4vLyAoc2VlIERlZmluaXRpb25CbG9jayBhYm92ZSkuIGBnbG9zc2FyeUtleWAgaXMgcmVzZXJ2ZWQgZm9yIHRoZSBQaGFzZSA0IHRlbmFudFxuLy8gZ2xvc3Nhcnkgc3RvcmUgKHJlc29sdmVkIGF0IHB1Ymxpc2gpIGFuZCBpcyB1bnVzZWQgaW4gUGhhc2UgMi4gVGhlIHJlbmRlcmVyXG4vLyBlbWl0cyBgPHNwYW4gY2xhc3M9XCJkZWZpbml0aW9uXCIgXHUyMDI2PmAgcGx1cyBhIGhpZGRlbiA8dGVtcGxhdGU+IGNhcnJ5aW5nIHRoZVxuLy8gcmVuZGVyZWQgY29udGVudDsgc2VlIFJVTlRJTUUubWQsIGRvY3MvZGVzaWduL3ZvY2FidWxhcnktZGVmaW5pdGlvbnMubWQsIGFuZFxuLy8gZG9jcy9kZXNpZ24vZGVmaW5pdGlvbi1yaWNoLWNvbnRlbnQubWQuXG4vLyBOT1QgYW5ub3RhdGVkIGFzIHouWm9kVHlwZSwgdW5saWtlIERlZmluaXRpb25CbG9jayBhYm92ZTogdGhpcyBzY2hlbWEgaXMgYVxuLy8gbWVtYmVyIG9mIHRoZSBgTWFya2AgZGlzY3JpbWluYXRlZFVuaW9uIGJlbG93LCBhbmQgei5kaXNjcmltaW5hdGVkVW5pb24gbmVlZHNcbi8vIHJlYWwgWm9kT2JqZWN0cyB0byBpbnRyb3NwZWN0IHRoZSBgdHlwZWAgZGlzY3JpbWluYXRvci4gVGhlIG5hbWVkXG4vLyBEZWZpbml0aW9uQmxvY2sgYWxpYXMgaXMgd2hhdCBrZWVwcyB0aGUgaW5mZXJyZWQgdHlwZSBoZXJlIHNtYWxsIGVub3VnaCBcdTIwMTQgdGhlXG4vLyBzYW1lIHJlYXNvbiBsaXN0LnRzIGtlZXBzIGl0cyBsaXN0IGJsb2NrcyBhcyBwbGFpbiB6Lm9iamVjdHMgYW5kIHB1dHMgdGhlXG4vLyB6LmxhenkoKSBvbmx5IG9uIHRoZSBjeWNsaWMgZWRnZS5cbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uTWFyayA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdkZWZpbml0aW9uJyksXG4gIGNvbnRlbnQ6IHouYXJyYXkoRGVmaW5pdGlvbkJsb2NrKS5kZWZhdWx0KFtdKSxcbiAgZ2xvc3NhcnlLZXk6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGVmaW5pdGlvbk1hcmsgPSB6LmluZmVyPHR5cGVvZiBEZWZpbml0aW9uTWFyaz47XG5cbi8vIEEgZGVmaW5pdGlvbidzIGNvbnRlbnQgaXMgYSBibG9jayBhcnJheSB0b2RheSwgYnV0IHR3byBvbGRlciBzaGFwZXMgYXJlIHN0aWxsXG4vLyBvdXQgdGhlcmUgaW4gc3RvcmVkIGRvY3VtZW50cy4gQm90aCB1cGdyYWRlcyBiZWxvdyBhcmUgcHVyZSwgZGV0ZXJtaW5pc3RpY1xuLy8gcmVhZC10aW1lIHJld3JpdGVzIFx1MjAxNCB0aGV5IG1pbnQgbm8gaWRzIGFuZCBubyByYW5kb21uZXNzLCBzbyBwYXJzaW5nIHRoZSBzYW1lXG4vLyBzdG9yZWQgZG9jdW1lbnQgdHdpY2UgeWllbGRzIGlkZW50aWNhbCBvdXRwdXQuXG4vL1xuLy8gVGhleSBDT01QT1NFLCBvbGRlc3QgZmlyc3QsIGJlY2F1c2UgYSBkb2N1bWVudCBjYW4gY2FycnkgdGhlIG9sZGVzdCBzaGFwZTpcbi8vICAgdjEgIHsgZGVmaW5pdGlvbjogJ2Egc3RyaW5nJyB9ICAgICAgICAgICAgICAgICAgICAocHJlLXJpY2gtY29udGVudClcbi8vICAgdjIgIHsgY29udGVudDogW2lubGluZVx1MjAyNl0sIGltYWdlPzoge3NyYywgYWx0fSB9ICAgIChQaGFzZSAyIHJpY2ggaW5saW5lKVxuLy8gICB2MyAgeyBjb250ZW50OiBbYmxvY2tcdTIwMjZdIH0gICAgICAgICAgICAgICAgICAgICAgICAgKGN1cnJlbnQpXG4vLyBzbyB2MSBcdTIxOTIgdjIgXHUyMTkyIHYzIG11c3QgcnVuIGluIHNlcXVlbmNlIG9uIGEgc2luZ2xlIG1hcmsuXG4vLyBFeHBvcnRlZCBiZWNhdXNlIHRoZSBhcHAncyBzZXJpYWxpemVyIG5lZWRzIHRoZSBJREVOVElDQUwgbm9ybWFsaXphdGlvbiB3aGVuXG4vLyBpdCByZWFkcyBhIGRlZmluaXRpb24gbWFyaydzIFRpcHRhcCBhdHRycyBcdTIwMTQgYW4gZWRpdG9yIHNlc3Npb24gb3BlbmVkIGJlZm9yZVxuLy8gdGhlIGJsb2NrIG1pZ3JhdGlvbiBzdGlsbCBjYXJyaWVzIHRoZSB2MiBhdHRyIHNoYXBlLiBPbmUgaW1wbGVtZW50YXRpb24sIHNvXG4vLyB0aGUgc2NoZW1hIGFuZCB0aGUgc2VyaWFsaXplciBjYW5ub3QgZHJpZnQgYXBhcnQgb24gd2hhdCBhbiBvbGQgbWFyayBtZWFucy5cbmV4cG9ydCBmdW5jdGlvbiB1cGdyYWRlRGVmaW5pdGlvbk1hcmsobTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB1bmtub3duIHtcbiAgbGV0IGNvbnRlbnQgPSBtLmNvbnRlbnQ7XG4gIGNvbnN0IHJlc3QgPSB7IC4uLm0gfTtcblxuICAvLyB2MSBcdTIxOTIgdjI6IGEgcGxhaW4gYGRlZmluaXRpb25gIHN0cmluZyBiZWNvbWVzIGEgc2luZ2xlIGlubGluZSB0ZXh0IHJ1bi5cbiAgaWYgKHR5cGVvZiByZXN0LmRlZmluaXRpb24gPT09ICdzdHJpbmcnICYmIGNvbnRlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHRleHQgPSByZXN0LmRlZmluaXRpb247XG4gICAgY29udGVudCA9IHRleHQgPyBbeyB0eXBlOiAndGV4dCcsIHRleHQgfV0gOiBbXTtcbiAgfVxuICBkZWxldGUgcmVzdC5kZWZpbml0aW9uO1xuXG4gIC8vIHYyIFx1MjE5MiB2MzogYW4gSU5MSU5FIGNvbnRlbnQgYXJyYXkgYmVjb21lcyBvbmUgcGFyYWdyYXBoIGJsb2NrLiBEZXRlY3RlZCBieVxuICAvLyBzaGFwZSwgbm90IGJ5IGEgdmVyc2lvbiBmaWVsZCBcdTIwMTQgYW4gaW5saW5lIG5vZGUgaXMgYSB0ZXh0IC8gbWF0aF9pbmxpbmUgL1xuICAvLyBoYXJkX2JyZWFrLCBub25lIG9mIHdoaWNoIGlzIGEgYmxvY2sgYHR5cGVgLCBzbyB0aGUgZmlyc3QgZWxlbWVudFxuICAvLyBkaXNjcmltaW5hdGVzIHVuYW1iaWd1b3VzbHkuIEFuIGVtcHR5IGFycmF5IGlzIGFscmVhZHkgdmFsaWQgYXQgYm90aFxuICAvLyB2ZXJzaW9ucyBhbmQgaXMgbGVmdCBhbG9uZS5cbiAgY29uc3QgSU5MSU5FX1RZUEVTID0gWyd0ZXh0JywgJ21hdGhfaW5saW5lJywgJ2hhcmRfYnJlYWsnXTtcbiAgaWYgKEFycmF5LmlzQXJyYXkoY29udGVudCkgJiYgY29udGVudC5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZmlyc3QgPSBjb250ZW50WzBdIGFzIHsgdHlwZT86IHVua25vd24gfSB8IHVuZGVmaW5lZDtcbiAgICBpZiAodHlwZW9mIGZpcnN0Py50eXBlID09PSAnc3RyaW5nJyAmJiBJTkxJTkVfVFlQRVMuaW5jbHVkZXMoZmlyc3QudHlwZSkpIHtcbiAgICAgIGNvbnRlbnQgPSBbeyB0eXBlOiAncGFyYWdyYXBoJywgY29udGVudCB9XTtcbiAgICB9XG4gIH1cblxuICAvLyB2MiBcdTIxOTIgdjMgKEQ3KTogdGhlIHNlcGFyYXRlIGBpbWFnZWAgYXR0ciBiZWNvbWVzIGEgdHJhaWxpbmcgaW1hZ2UgYmxvY2ssIHNvXG4gIC8vIHRoZXJlIGlzIGV4YWN0bHkgb25lIHdheSB0byBleHByZXNzIGFuIGltYWdlIGluIGEgZGVmaW5pdGlvbi4gQXBwZW5kZWRcbiAgLy8gQUZURVIgdGhlIHRleHQsIG1hdGNoaW5nIHdoZXJlIHRoZSBvbGQgcG9wb3ZlciByZW5kZXJlZCBpdC5cbiAgY29uc3QgaW1hZ2UgPSByZXN0LmltYWdlO1xuICBkZWxldGUgcmVzdC5pbWFnZTtcbiAgaWYgKGltYWdlICE9PSBudWxsICYmIHR5cGVvZiBpbWFnZSA9PT0gJ29iamVjdCcpIHtcbiAgICBjb25zdCB7IHNyYywgYWx0IH0gPSBpbWFnZSBhcyB7IHNyYz86IHVua25vd247IGFsdD86IHVua25vd24gfTtcbiAgICBpZiAodHlwZW9mIHNyYyA9PT0gJ3N0cmluZycgJiYgc3JjKSB7XG4gICAgICBjb25zdCBibG9ja3MgPSBBcnJheS5pc0FycmF5KGNvbnRlbnQpID8gWy4uLmNvbnRlbnRdIDogW107XG4gICAgICBibG9ja3MucHVzaCh7XG4gICAgICAgIHR5cGU6ICdpbWFnZScsXG4gICAgICAgIHNyYyxcbiAgICAgICAgYWx0OiB0eXBlb2YgYWx0ID09PSAnc3RyaW5nJyA/IGFsdCA6ICcnLFxuICAgICAgfSk7XG4gICAgICBjb250ZW50ID0gYmxvY2tzO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IC4uLnJlc3QsIGNvbnRlbnQ6IGNvbnRlbnQgPz8gW10gfTtcbn1cblxuZXhwb3J0IGNvbnN0IE1hcmsgPSB6LnByZXByb2Nlc3MoXG4gIChtKSA9PiB7XG4gICAgLy8gTGVnYWN5OiBtYXJrcyB3ZXJlIGJhcmUgc3RyaW5ncyAoJ2JvbGQnKS5cbiAgICBpZiAodHlwZW9mIG0gPT09ICdzdHJpbmcnKSByZXR1cm4geyB0eXBlOiBtIH07XG4gICAgaWYgKFxuICAgICAgbSAhPT0gbnVsbCAmJlxuICAgICAgdHlwZW9mIG0gPT09ICdvYmplY3QnICYmXG4gICAgICAobSBhcyB7IHR5cGU/OiB1bmtub3duIH0pLnR5cGUgPT09ICdkZWZpbml0aW9uJ1xuICAgICkge1xuICAgICAgcmV0dXJuIHVwZ3JhZGVEZWZpbml0aW9uTWFyayhtIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICB9XG4gICAgcmV0dXJuIG07XG4gIH0sXG4gIHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICAgIEJvbGRNYXJrLFxuICAgIEl0YWxpY01hcmssXG4gICAgVW5kZXJsaW5lTWFyayxcbiAgICBDb2RlTWFyayxcbiAgICBTdWJzY3JpcHRNYXJrLFxuICAgIFN1cGVyc2NyaXB0TWFyayxcbiAgICBEZWZpbml0aW9uTWFyayxcbiAgXSksXG4pO1xuZXhwb3J0IHR5cGUgTWFyayA9IHouaW5mZXI8dHlwZW9mIE1hcms+O1xuLy8gVGhlIHNldCBvZiBtYXJrIGB0eXBlYCBkaXNjcmltaW5hbnRzLCBmb3IgY2FsbGVycyB0aGF0IGFsbG93LWxpc3QgYnkgbmFtZS5cbmV4cG9ydCB0eXBlIE1hcmtUeXBlID0gTWFya1sndHlwZSddO1xuXG4vLyAtLS0tIFRleHQgbm9kZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGNvbnN0IFRleHROb2RlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3RleHQnKSxcbiAgdGV4dDogei5zdHJpbmcoKSxcbiAgLy8gRGVmYXVsdCB0byBlbXB0eSBtYXJrcyBhcnJheSBzbyBjYWxsZXJzIGRvbid0IG5lZWQgdG8gc3BlY2lmeSB3aGVuIG5vbmUuXG4gIG1hcmtzOiB6LmFycmF5KE1hcmspLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBUZXh0Tm9kZSA9IHouaW5mZXI8dHlwZW9mIFRleHROb2RlPjtcblxuLy8gLS0tLSBNaXNjb25jZXB0aW9uIGJpbmRpbmcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEFuIG9wYXF1ZSB0YWcgYmluZGluZyBhbiBhbnRpY2lwYXRlZCB3cm9uZyBhbnN3ZXIgdG8gYSBuYW1lZCBtaXNjb25jZXB0aW9uIGluXG4vLyB0aGUgQVVUSE9SJ1MgcmVnaXN0cnkgKHdoaWNoIGxpdmVzIGluIHRoZWlyIGNhdGFsb2d1ZSBwcm9qZWN0LCBub3QgaGVyZSBcdTIwMTQgdGhlXG4vLyBwbGF0Zm9ybSBkZWxpYmVyYXRlbHkgZG9lcyBub3Qgb3duIHRoZSB0YXhvbm9teSkuIEJvdW5kZWQgaW4gU0hBUEUsIG5ldmVyIGluXG4vLyBtZWFuaW5nOiB0aGUgbGVuZ3RoIGNhcCBrZWVwcyBhIHBhc3RlZCBwYXJhZ3JhcGggb3V0IG9mIGV2ZXJ5IHN0b3JlZCBjaGVja1xuLy8gcm93LCBzaW5jZSBkb2N1bWVudHMgcmVhY2ggdGhpcyBzY2hlbWEgZnJvbSB0aGUgaW1wb3J0ZXIsIHRoZSBlZGl0b3IsIEFORCByYXdcbi8vIHN0b3JlZCBqc29uYiwgYW5kIG9ubHkgdGhpcyBsYXllciBzZWVzIGFsbCB0aHJlZS4gUGF0dGVybiB2YWxpZGF0aW9uIGlzIHRoZVxuLy8gSU1QT1JURVIncyBqb2IgKGEgd2FybmluZywgbmV2ZXIgYW4gZXJyb3IpIHNvIGEgZnV0dXJlIGBza2lsbC4qYCB0YXhvbm9teVxuLy8gbmVlZHMgbm8gcGxhdGZvcm0gY2hhbmdlLlxuZXhwb3J0IGNvbnN0IE1pc2NvbmNlcHRpb25JZCA9IHouc3RyaW5nKCkubWluKDEpLm1heCgxMjApO1xuZXhwb3J0IHR5cGUgTWlzY29uY2VwdGlvbklkID0gei5pbmZlcjx0eXBlb2YgTWlzY29uY2VwdGlvbklkPjtcblxuLy8gLS0tLSBJbmxpbmVOb2RlIHVuaW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIElubGluZU5vZGUgaXMgdGhlIHN0YW5kYXJkIGlubGluZSBhbHBoYWJldC4gVXNlZCBieSBhbGwgYmxvY2tzIGV4Y2VwdFxuLy8gZmlsbF9pbl9ibGFuay4gRGVmaW5lZCBiZWZvcmUgQmxhbmtUb2tlbiBiZWNhdXNlIHRoZSBibGFuaydzIHJpY2ggZmVlZGJhY2tcbi8vIGZpZWxkcyAoaGludCwgbWlzdGFrZUZlZWRiYWNrKSByZXVzZSB0aGlzIHVuaW9uLlxuZXhwb3J0IGNvbnN0IElubGluZU5vZGUgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgVGV4dE5vZGUsXG4gIElubGluZU1hdGhOb2RlLFxuICBIYXJkQnJlYWtOb2RlLFxuXSk7XG5leHBvcnQgdHlwZSBJbmxpbmVOb2RlID0gei5pbmZlcjx0eXBlb2YgSW5saW5lTm9kZT47XG5cbi8vIC0tLS0gQmxhbmsgdG9rZW4gKGZpbGwtaW4tdGhlLWJsYW5rIG9ubHkpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCbGFua3MgbGl2ZSBJTlNJREUgdGhlIGlubGluZSBjb250ZW50IHN0cmVhbSBvZiBhIGZpbGxfaW5fYmxhbmsgYmxvY2sgXHUyMDE0XG4vLyBzdHVkZW50cyBzZWUgYSBwcm9tcHQgd2l0aCBvbmUgb3IgbW9yZSBpbmxpbmUgYmxhbmtzLiBFYWNoIGJsYW5rIGhhcyBhXG4vLyBzdGFibGUgaWQgKHJlZmVyZW5jZWQgaW4gc3VibWlzc2lvbnMucmVzcG9uc2VzLmJsYW5rc1s8aWQ+XSkgYW5kIGFuIGFuc3dlclxuLy8ga2V5LlxuLy9cbi8vIHdpZHRoIGlzIGluIENTUyBjaGFycyAoYGNoYCB1bml0cykgXHUyMDE0IHVzZWQgdG8gc2l6ZSB0aGUgaW5wdXQuIE9wdGlvbmFsXG4vLyBiZWNhdXNlIHRoZSByZW5kZXJlciBoYXMgYSBzZW5zaWJsZSBkZWZhdWx0ICh+NiBjaGFycykuXG4vL1xuLy8gaGludCBhbmQgbWlzdGFrZUZlZWRiYWNrIGFyZSB0aGUgcGVyLWJsYW5rIGZlZWRiYWNrIGxheWVycyAoYmxvY2stbGV2ZWxcbi8vIGZpZWxkcyBcdTIwMTQgc29sdXRpb24sIHNraWxscyBcdTIwMTQgbGl2ZSBvbiBGaWxsSW5CbGFua0Jsb2NrKS5cbi8vIEJvdGggY2FycnkgcmljaCBpbmxpbmUgY29udGVudCAoSW5saW5lTm9kZVtdOiBmb3JtYXR0ZWQgdGV4dCArIGlubGluZSBtYXRoKVxuLy8gc28gZmVlZGJhY2sgY2FuIGluY2x1ZGUgdGhlIHNhbWUgZm9ybWF0dGluZyBhbmQgbWF0aCBhcyBwcm9ibGVtIHByb3NlLlxuLy8gVGhlIHJ1bnRpbWUgcmVhZHMgYm90aCBhdCBpbml0IGJ1dCBkb2VzIE5PVCBpbmplY3QgYW55dGhpbmcgaW50byB0aGUgRE9NXG4vLyB1bnRpbCB0aGUgc3R1ZGVudCBjbGlja3MgXCJDaGVjayB0aGlzIHNlY3Rpb24uXCIgT24gYSB3cm9uZyBhbnN3ZXIsIHRoZVxuLy8gcnVudGltZSBmaXJzdCBsb29rcyBmb3IgYSBtYXRjaGluZyBtaXN0YWtlRmVlZGJhY2sgZW50cnkgKGV4YWN0IHN0cmluZ1xuLy8gbWF0Y2ggZm9yIFBoYXNlIDEpOyBpZiBub25lIG1hdGNoZXMsIGl0IGZhbGxzIGJhY2sgdG8gaGludDsgaWYgaGludCBpc1xuLy8gYWxzbyBhYnNlbnQsIGl0IHNob3dzIHRoZSBnZW5lcmljIFx1MjcxNy5cbmV4cG9ydCBjb25zdCBCbGFua1Rva2VuID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2JsYW5rJyksXG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgYW5zd2VyOiB6LnN0cmluZygpLm1pbigxKSxcbiAgLy8gQWx0ZXJuYXRpdmUgY29ycmVjdCBhbnN3ZXJzLiBFbXB0eSBhcnJheSBpcyB0aGUgY29tbW9uIGNhc2UuXG4gIGFjY2VwdGFibGVBbnN3ZXJzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICB3aWR0aDogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC8vIE9wdGlvbmFsIHRlYWNoZXItYXV0aG9yZWQgbnVkZ2Ugc2hvd24gd2hlbiB0aGlzIGJsYW5rIGlzIHdyb25nIGFuZCBub1xuICAvLyBtaXN0YWtlRmVlZGJhY2sgZW50cnkgbWF0Y2hlcy4gUmljaCBpbmxpbmUgY29udGVudCAoZm9ybWF0dGVkIHRleHQgKyBtYXRoKS5cbiAgaGludDogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICAvLyBPcHRpb25hbCBsaXN0IG9mIGFudGljaXBhdGVkIHdyb25nIGFuc3dlcnMgcGFpcmVkIHdpdGggc3BlY2lmaWMgZmVlZGJhY2suXG4gIC8vIElmIHRoZSBzdHVkZW50J3Mgd3JvbmcgYW5zd2VyIG1hdGNoZXMgYSBgbWF0Y2hgIHN0cmluZyAoUGhhc2UgMTogZXhhY3RcbiAgLy8gbWF0Y2g7IHRoZSBzdHJhdGVneS1kaXNwYXRjaCBob29rIGluIHRoZSBydW50aW1lIHN1cHBvcnRzIHNtYXJ0ZXJcbiAgLy8gbWF0Y2hpbmcgbGF0ZXIpLCB0aGUgY29ycmVzcG9uZGluZyBmZWVkYmFjayBpcyBzaG93biBpbnN0ZWFkIG9mIHRoZVxuICAvLyBnZW5lcmljIGhpbnQuIEZpcnN0IG1hdGNoIHdpbnMuIGBmZWVkYmFja2AgaXMgcmljaCBpbmxpbmUgY29udGVudC5cbiAgLy8gYG1pc2NvbmNlcHRpb25JZGAgYmluZHMgdGhlIGFudGljaXBhdGVkIG1pc3Rha2UgdG8gYSBuYW1lZCBtaXNjb25jZXB0aW9uXG4gIC8vIChhbiBvcGFxdWUgYG1pcy4qYCB0YWcgXHUyMDE0IHRoZSB0YXhvbm9teSBsaXZlcyBpbiB0aGUgYXV0aG9yJ3MgY2F0YWxvZ3VlXG4gIC8vIHByb2plY3QsIG5vdCBoZXJlKS4gVGhlIGdyYWRlciByZXR1cm5zIGl0IG9uIHRoZSBjaGVjayB2ZXJkaWN0LCBhbmQgdGhlXG4gIC8vIHN0b3JlZCB2ZXJkaWN0cyByb3cgaXMgd2hhdCBtYWtlcyB0aGUgYWdncmVnYXRlIHNpZ25hbCBxdWVyeWFibGUuXG4gIG1pc3Rha2VGZWVkYmFjazogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgbWF0Y2g6IHouc3RyaW5nKCksXG4gICAgZmVlZGJhY2s6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gICAgbWlzY29uY2VwdGlvbklkOiBNaXNjb25jZXB0aW9uSWQub3B0aW9uYWwoKSxcbiAgfSkpLm9wdGlvbmFsKCksXG4gIC8vIE9yZGVyLWluZGVwZW5kZW50IGFuc3dlciBncm91cGluZy4gV2hlbiB0cnVlLCB0aGlzIGJsYW5rJ3MgYW5zd2VyIGlzXG4gIC8vIGludGVyY2hhbmdlYWJsZSB3aXRoIHRoZSBibGFuayBpbW1lZGlhdGVseSBiZWZvcmUgaXQgKGluIGRvY3VtZW50IG9yZGVyLFxuICAvLyB3aXRoaW4gdGhlIHNhbWUgYmxvY2spIFx1MjAxNCBlLmcuIGZhY3RvcmluZyBgKHggKyBcdTI2MTApKHggKyBcdTI2MTApYCB3aGVyZSAoMiwzKSBhbmRcbiAgLy8gKDMsMikgYXJlIGJvdGggY29ycmVjdCBidXQgKDIsMikgaXMgbm90LiBBIFwiZ3JvdXBcIiBpcyBhIG1heGltYWwgcnVuIG9mXG4gIC8vIGFkamFjZW50IGJsYW5rcyBlYWNoIGZsYWdnZWQgaGVyZTsgdGhlIHJlbmRlcmVyIGNvbXBpbGVzIHJ1bnMgaW50byBhXG4gIC8vIHNoYXJlZCBgZGF0YS1ibGFuay1ncm91cGAgaWQsIGFuZCB0aGUgcnVudGltZSBzY29yZXMgdGhlIGdyb3VwIHdpdGhcbiAgLy8gY29uc3VtZS1vbmNlIG1hdGNoaW5nIChlYWNoIGNvcnJlY3QgYW5zd2VyIGNhbiBzYXRpc2Z5IG9ubHkgb25lIGJsYW5rKS5cbiAgLy9cbiAgLy8gVGhpcyBib29sZWFuIGlzIGF1dGhvcmluZyAqc3VnYXIqOiB0aGUgZ2VuZXJhbCBtb2RlbCBsaXZlcyBpbiB0aGUgcnVudGltZVxuICAvLyBkYXRhLWF0dHJpYnV0ZSBjb250cmFjdCAoZ3JvdXAgaWRzKSwgc28gcmljaGVyIGdyb3VwaW5nIChub24tYWRqYWNlbnQsXG4gIC8vIGNyb3NzLWJsb2NrKSBjYW4gYmUgYWRkZWQgbGF0ZXIgYXMgYW4gYWRkaXRpdmUgYGdyb3VwYCBmaWVsZCB3aXRob3V0IGFcbiAgLy8gYnJlYWtpbmcgY2hhbmdlLiBUaGUgZmlyc3QgYmxhbmsgaW4gYSBibG9jayBpZ25vcmVzIHRoaXMgZmxhZyAobm9cbiAgLy8gcHJldmlvdXMgYmxhbmsgdG8gZ3JvdXAgd2l0aCkuXG4gIGludGVyY2hhbmdlYWJsZVdpdGhQcmV2aW91czogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIEFuc3dlciBpbnRlcnByZXRhdGlvbiBtb2RlLiBBYnNlbnQgKD0gJ3RleHQnKSBrZWVwcyB0aGUgUGhhc2UgMSBiZWhhdmlvcjpcbiAgLy8gZXhhY3Qgc3RyaW5nIG1hdGNoIGFnYWluc3QgYW5zd2VyICsgYWNjZXB0YWJsZUFuc3dlcnMuICdudW1lcmljJyB0ZWxscyB0aGVcbiAgLy8gcnVudGltZSB0byBwYXJzZSBCT1RIIHRoZSB0eXBlZCB2YWx1ZSBhbmQgZWFjaCBrZXkgZW50cnkgbnVtZXJpY2FsbHlcbiAgLy8gKGRlY2ltYWxzLCBmcmFjdGlvbnMgbGlrZSAzLzIsIG1peGVkIG51bWJlcnMgbGlrZSBcIjEgMS8yXCIsIGNvbW1hXG4gIC8vIHNlcGFyYXRvcnMsIGEgbGVhZGluZyAkKSBhbmQgY29tcGFyZSB3aXRoaW4gYHRvbGVyYW5jZWAgXHUyMDE0IHNvIDAuNSwgMS8yLFxuICAvLyBhbmQgLjUwIGFsbCBzYXRpc2Z5IGFuIGFuc3dlciBvZiBcIjEvMlwiLiBPcHRpb25hbCByYXRoZXIgdGhhbiBkZWZhdWx0ZWQgc29cbiAgLy8gZG9jdW1lbnRzIHN0b3JlZCBiZWZvcmUgdGhpcyBmaWVsZCBleGlzdGVkIHJlLXNlcmlhbGl6ZSBieXRlLWlkZW50aWNhbGx5LlxuICAvLyAnbWF0aCcgKE1vZGVsIEIgbWF0aCBibGFua3MpIGdyYWRlcyB0aGUgdHlwZWQgdmFsdWUgYXMgYSBtYXRoIEVYUFJFU1NJT046XG4gIC8vIHRoZSBydW50aW1lIGxhenktbG9hZHMgdGhlIGdyYXBoLWtpdCBhbmQgY29tcGFyZXMgYnkgbnVtZXJpYy1zYW1wbGluZ1xuICAvLyBlcXVpdmFsZW5jZSAoMmEgXHUyMjYxIGErYSBcdTIyNjEgYSoyKSwgTk9UIHN0cmluZyBtYXRjaC4gU2VlIGRvY3MvZGVzaWduL21hdGgtYmxhbmtzLm1kLlxuICBhbnN3ZXJUeXBlOiB6LmVudW0oWyd0ZXh0JywgJ251bWVyaWMnLCAnbWF0aCddKS5vcHRpb25hbCgpLFxuICAvLyBBYnNvbHV0ZSBjb21wYXJpc29uIHRvbGVyYW5jZS4gRm9yICdudW1lcmljJzogfHR5cGVkIC0ga2V5fCA8PSB0b2xlcmFuY2UuXG4gIC8vIEZvciAnbWF0aCc6IHRoZSBhYnNvbHV0ZSB0b2xlcmFuY2UgcGFzc2VkIHRvIHRoZSBzYW1wbGluZyBjb21wYXJpc29uLlxuICAvLyBBYnNlbnQgPSBleGFjdCBlcXVhbGl0eSAobnVtZXJpYykgLyBubyBleHRyYSBzbGFjayAobWF0aCkuXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbiAgLy8gUmVxdWlyZWQgdW5pdCBmb3IgYSAnbnVtZXJpYycgYmxhbmsgKHt7PTEuNSB1bml0OiBrbS9ofX0pOiB0aGUgc3R1ZGVudFxuICAvLyB0eXBlcyB2YWx1ZSBBTkQgdW5pdCBpbiB0aGUgb25lIGlucHV0LCB0aGUgc2VydmVyIHNwbGl0cyBhbmQgZ3JhZGVzIGJvdGhcbiAgLy8gKHZhbHVlIHdpdGhpbiB0b2xlcmFuY2UgQU5EIHVuaXQgYWNjZXB0ZWQgXHUyMDE0IGEgbWlzc2luZyB1bml0IGlzIHdyb25nLFxuICAvLyB3aGljaCBpcyB0aGUgd2hvbGUgZGlhZ25vc3RpYykuIGB1bml0YCBpcyB0aGUgY2Fub25pY2FsIGZvcm0gdGhlIHRlYWNoZXJcbiAgLy8gYW5zd2VyIGtleSBzaG93czsgYGFjY2VwdGFibGVVbml0c2AgYXJlIG5vcm1hbGl6ZWQtZXF1YWwgYWx0ZXJuYXRlc1xuICAvLyAoa20vaCB2cyBrcGgpLiBNZWFuaW5nZnVsIG9ubHkgd2hlbiBhbnN3ZXJUeXBlIGlzICdudW1lcmljJzsgYm90aCBhcmVcbiAgLy8gYW5zd2VyLWtleSBtYXRlcmlhbCBhbmQgcmlkZSBCTEFOS19TRUNSRVRfRklFTERTLiBPcHRpb25hbCB3aXRoIG5vXG4gIC8vIGRlZmF1bHQgc28gcHJlLWV4aXN0aW5nIGRvY3VtZW50cyByZS1zZXJpYWxpemUgYnl0ZS1pZGVudGljYWxseS5cbiAgdW5pdDogei5zdHJpbmcoKS5taW4oMSkub3B0aW9uYWwoKSxcbiAgYWNjZXB0YWJsZVVuaXRzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG4gIC8vIEVxdWl2YWxlbmNlIG1vZGUgZm9yICdtYXRoJyBibGFua3M6ICd2YWx1ZScgKGRlZmF1bHQsIGFueSBleHByZXNzaW9uIHRoYXRcbiAgLy8gZXZhbHVhdGVzIGVxdWFsKSBvciAnZXhhY3QtZm9ybScgKG5vcm1hbGl6ZWQtc3RyaW5nIG1hdGNoIFx1MjAxNCBcIndyaXRlIGl0IGluXG4gIC8vIHRoaXMgZm9ybVwiKS4gT25seSBtZWFuaW5nZnVsIHdoZW4gYW5zd2VyVHlwZSBpcyAnbWF0aCc7IGFic2VudCA9ICd2YWx1ZScuXG4gIGVxdWl2YWxlbmNlOiB6LmVudW0oWyd2YWx1ZScsICdleGFjdC1mb3JtJ10pLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIEJsYW5rVG9rZW4gPSB6LmluZmVyPHR5cGVvZiBCbGFua1Rva2VuPjtcblxuLy8gLS0tLSBGaWxsSW5CbGFua0lubGluZSB1bmlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZpbGxJbkJsYW5rSW5saW5lIGlzIHRoZSBleHRlbmRlZCBhbHBoYWJldCBmb3IgZmlsbF9pbl9ibGFuayBibG9ja3Mgb25seS5cbi8vIEluY2x1ZGVzIEJsYW5rVG9rZW4gaW4gYWRkaXRpb24gdG8gdGhlIHN0YW5kYXJkIGlubGluZSBub2Rlcy5cbmV4cG9ydCBjb25zdCBGaWxsSW5CbGFua0lubGluZSA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBUZXh0Tm9kZSxcbiAgSW5saW5lTWF0aE5vZGUsXG4gIEhhcmRCcmVha05vZGUsXG4gIEJsYW5rVG9rZW4sXG5dKTtcbmV4cG9ydCB0eXBlIEZpbGxJbkJsYW5rSW5saW5lID0gei5pbmZlcjx0eXBlb2YgRmlsbEluQmxhbmtJbmxpbmU+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbmV4cG9ydCBjb25zdCBQYXJhZ3JhcGhCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ3BhcmFncmFwaCcpLFxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxufSk7XG5leHBvcnQgdHlwZSBQYXJhZ3JhcGhCbG9jayA9IHouaW5mZXI8dHlwZW9mIFBhcmFncmFwaEJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG4vLyBUaHJlZSBsZXZlbHMgaXMgYSBkZWxpYmVyYXRlIGNvbnN0cmFpbnQuIFdvcmtzaGVldHMgZG9uJ3QgbmVlZCBkZWVwZXJcbi8vIGhpZXJhcmNoeSBhbmQgY2FwcGluZyBpdCBhdCAzIGtlZXBzIHRoZSB2aXN1YWwgaGllcmFyY2h5IG1lYW5pbmdmdWwuXG5leHBvcnQgY29uc3QgSGVhZGluZ0xldmVsID0gei51bmlvbihbei5saXRlcmFsKDEpLCB6LmxpdGVyYWwoMiksIHoubGl0ZXJhbCgzKV0pO1xuZXhwb3J0IHR5cGUgSGVhZGluZ0xldmVsID0gei5pbmZlcjx0eXBlb2YgSGVhZGluZ0xldmVsPjtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmdCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2hlYWRpbmcnKSxcbiAgbGV2ZWw6IEhlYWRpbmdMZXZlbCxcbiAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbn0pO1xuZXhwb3J0IHR5cGUgSGVhZGluZ0Jsb2NrID0gei5pbmZlcjx0eXBlb2YgSGVhZGluZ0Jsb2NrPjtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gbGFiZWwudHMgXHUyMDE0IFNoYXJlZCBwZXItYmxvY2sgZGlzcGxheS1sYWJlbCBmcmFnbWVudCAobnVtYmVyaW5nL2xhYmVsIGRlY291cGxlKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERlY291cGxlcyBcImlzIHRoaXMgZ3JhZGVhYmxlP1wiIGZyb20gXCJkb2VzIGl0IHdlYXIgYSBwcm9ibGVtIG51bWJlcj9cIi4gQVxuLy8gZ3JhZGVhYmxlIGJsb2NrIGlzIGFsd2F5cyBzY29yZWQgYW5kIGFsd2F5cyByZXZpZXdhYmxlOyB0aGlzIGZpZWxkIGNvbnRyb2xzXG4vLyBvbmx5IHdoYXQgc2hvd3Mgb24gdGhlIHBhZ2U6XG4vL1xuLy8gICBhdXRvICAgXHUyMDE0IHRoZSBkZWZhdWx0OiBhIG51bWJlcmVkIHByb2JsZW0sIGNvbnN1bWluZyBvbmUgc2xvdCBvZiB0aGVcbi8vICAgICAgICAgICAgZG9jdW1lbnQtd2lkZSBzZXF1ZW5jZSAodG9kYXkncyBiZWhhdmlvciBmb3IgZXZlcnkgZ3JhZGVhYmxlIGJsb2NrKS5cbi8vICAgY3VzdG9tIFx1MjAxNCBzaG93IGF1dGhvcmVkIHRleHQgKFwiV2FybS11cFwiLCBcIkNoYWxsZW5nZVwiKSBpbnN0ZWFkIG9mIGEgbnVtYmVyLFxuLy8gICAgICAgICAgICBhbmQgRE9OJ1QgY29uc3VtZSBhIHNlcXVlbmNlIHNsb3QgKG91dC1vZi1zZXF1ZW5jZSBsYWJlbCkuXG4vLyAgIG5vbmUgICBcdTIwMTQgc2hvdyBub3RoaW5nOyBET04nVCBjb25zdW1lIGEgc2xvdC4gVGhlIG5vdGVzIGtleXdvcmQtYmxhbmsgY2FzZTpcbi8vICAgICAgICAgICAgYSBncmFkZWFibGUgZ2FwIHRoYXQga2VlcHMgc3R1ZGVudHMgcmVhZGluZyB3aXRob3V0IGxvb2tpbmcgbGlrZSBhXG4vLyAgICAgICAgICAgIHF1aXogcXVlc3Rpb24uIFN0aWxsIHNjb3JlZCwgc3RpbGwgaW4gdGhlIHRlYWNoZXIncyByZXN1bHRzIHZpZXdcbi8vICAgICAgICAgICAgKGxvY2F0ZWQgYnkgaXRzIHN1cnJvdW5kaW5nIHRleHQsIG5vdCBhIG51bWJlcikuXG4vL1xuLy8gT3B0aW9uYWwgd2l0aCBOTyBkZWZhdWx0LCBleGFjdGx5IGxpa2Ugc2l6aW5nRmllbGRzIGFuZCBtYXRoX2Jsb2NrLnByb21wdHM6XG4vLyBhbiBhYnNlbnQgYGxhYmVsYCBtZWFucyBgYXV0b2AsIHNvIGEgYmxvY2sgYXV0aG9yZWQgYmVmb3JlIHRoaXMgZmVhdHVyZSBcdTIwMTQgb3Jcbi8vIG9uZSBsZWZ0IGF0IHRoZSBkZWZhdWx0IFx1MjAxNCByZS1zZXJpYWxpemVzIEJZVEUtSURFTlRJQ0FMTFkuIFRoZSByZW5kZXJlciBhbmRcbi8vIGVkaXRvciB0cmVhdCBgdW5kZWZpbmVkYCBhbmQgYHttb2RlOidhdXRvJ31gIGlkZW50aWNhbGx5LlxuLy9cbi8vIFRoZSBwZXItYmxvY2sgbWFudWFsIGludGVnZXIgYG51bWJlcmAgb3ZlcnJpZGUgaXMgb3J0aG9nb25hbCBhbmQgc3RpbGwgbGl2ZXNcbi8vIG9uIHRoZSBpbmRpdmlkdWFsIGJsb2NrczogaXQgcmVsYWJlbHMgdGhlIHNob3duIGludGVnZXIgd2hpbGUgU1RBWUlORyBpblxuLy8gc2VxdWVuY2UsIGFuZCBpdCBhcHBsaWVzIG9ubHkgd2hlbiB0aGUgbGFiZWwgbW9kZSBpcyBhdXRvIChjdXN0b20vbm9uZSB3aW4pLlxuLy8gU2VlIGRvY3MvZGVzaWduICsgYmxvY2stcHJlZGljYXRlcy50cy5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG5leHBvcnQgY29uc3QgQmxvY2tMYWJlbCA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCdtb2RlJywgW1xuICB6Lm9iamVjdCh7IG1vZGU6IHoubGl0ZXJhbCgnYXV0bycpIH0pLFxuICAvLyBtaW4oMSk6IGFuIGVtcHR5IGN1c3RvbSBsYWJlbCBpcyBtZWFuaW5nbGVzcyBcdTIwMTQgYXV0aG9yIGVpdGhlciB3YW50cyB0ZXh0IG9yXG4gIC8vIHdhbnRzIGBub25lYC4gS2VlcHMgcm91bmQtdHJpcCBob25lc3QgKG5vIGVtcHR5LXN0cmluZyBnaG9zdHMpLlxuICB6Lm9iamVjdCh7IG1vZGU6IHoubGl0ZXJhbCgnY3VzdG9tJyksIHRleHQ6IHouc3RyaW5nKCkubWluKDEpIH0pLFxuICB6Lm9iamVjdCh7IG1vZGU6IHoubGl0ZXJhbCgnbm9uZScpIH0pLFxuXSk7XG5leHBvcnQgdHlwZSBCbG9ja0xhYmVsID0gei5pbmZlcjx0eXBlb2YgQmxvY2tMYWJlbD47XG5cbi8vIFNwcmVhZCBpbnRvIGEgZ3JhZGVhYmxlIGJsb2NrJ3Mgei5vYmplY3Qoey4uLn0pIHNoYXBlLiBQbGFpbiBvYmplY3QgKG5vdCBhIFpvZFxuLy8gc2NoZW1hKSBzbyBlYWNoIGJsb2NrIGtlZXBzIGEgZmxhdCBmaWVsZCBsaXN0IGFuZCBkaXNjcmltaW5hdGVkVW5pb24ga2VlcHNcbi8vIHdvcmtpbmcsIG1pcnJvcmluZyBzaXppbmdGaWVsZHMuXG5leHBvcnQgY29uc3QgbGFiZWxGaWVsZHMgPSB7XG4gIGxhYmVsOiBCbG9ja0xhYmVsLm9wdGlvbmFsKCksXG59O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgc2l6aW5nRmllbGRzIH0gZnJvbSAnLi4vc2l6aW5nLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuaW1wb3J0IHsgTWF0aFByb21wdCwgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vIERpc3BsYXkgbWF0aCAoY2VudGVyZWQsIGZ1bGwgd2lkdGggYnkgZGVmYXVsdCkuIElubGluZSBtYXRoIGlzIGluIGlubGluZS50c1xuLy8gYXMgSW5saW5lTWF0aE5vZGUuIFRoZXkncmUgc2VwYXJhdGUgbm9kZSB0eXBlcyBiZWNhdXNlIHRoZXkgcmVuZGVyXG4vLyBkaWZmZXJlbnRseSBhbmQgaGF2ZSBkaWZmZXJlbnQgc2VtYW50aWMgbWVhbmluZy5cbmV4cG9ydCBjb25zdCBNYXRoQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdtYXRoX2Jsb2NrJyksXG4gIGxhdGV4OiB6LnN0cmluZygpLFxuICAvLyBNb2RlbCBBOiBvcHRpb25hbCBpbi1lcXVhdGlvbiBncmFkZWFibGUgZ2FwcyAoXHUwMEE3TWF0aFByb21wdCwgaW5saW5lLnRzKS5cbiAgLy8gT3B0aW9uYWwgd2l0aCBOTyBkZWZhdWx0IHNvIGEgbWF0aCBibG9jayBhdXRob3JlZCBiZWZvcmUgTW9kZWwgQSBcdTIwMTQgb3Igb25lXG4gIC8vIHdpdGggbm8gZ2FwcyBcdTIwMTQgcmUtc2VyaWFsaXplcyBCWVRFLUlERU5USUNBTExZLiBTZWUgZG9jcy9kZXNpZ24vbWF0aC1ibGFua3MubWQuXG4gIHByb21wdHM6IHouYXJyYXkoTWF0aFByb21wdCkub3B0aW9uYWwoKSxcbiAgLy8gV29ya2VkIGV4cGxhbmF0aW9uIHJldmVhbGVkIHBvc3QtY2hlY2ssIG1pcnJvcmluZyBGaWxsSW5CbGFua0Jsb2NrLnNvbHV0aW9uLlxuICAvLyBPcHRpb25hbDsgb25seSBtZWFuaW5nZnVsIG9uIGEgZ2FwLWJlYXJpbmcgZXF1YXRpb24uIE5ldmVyIGxlYWtzIHRoZSBnYXBcbiAgLy8gYW5zd2VyIGRpcmVjdGx5ICh0aGUgc2FuY3Rpb25lZCByZXZlYWwsIHBlciB0aGUgcnVudGltZSdzIG5vLWxlYWsgc3RhbmNlKS5cbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgLy8gVmFyaWFibGUgYmxvY2sgc2l6aW5nOiBvcHRpb25hbCB3aWR0aCBmcmFjdGlvbiArIGFsaWdubWVudCAoc2l6aW5nLnRzKS5cbiAgLi4uc2l6aW5nRmllbGRzLFxuICAvLyBQZXItYmxvY2sgZGlzcGxheSBsYWJlbCBcdTIwMTQgYSBnYXAtYmVhcmluZyBlcXVhdGlvbiBpcyBhIG51bWJlcmVkIHByb2JsZW0gYnlcbiAgLy8gZGVmYXVsdDsgY3VzdG9tL25vbmUgb3B0IG91dCAobnVtYmVyaW5nL2xhYmVsIGRlY291cGxlKS4gSW5lcnQgb24gYVxuICAvLyBwcm9tcHQtZnJlZSBkaXNwbGF5IGVxdWF0aW9uIChpdCdzIG5ldmVyIG51bWJlcmVkIHJlZ2FyZGxlc3MpLiBTZWUgbGFiZWwudHMuXG4gIC4uLmxhYmVsRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBNYXRoQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBNYXRoQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vIEZvdXIgdmFyaWFudHMgaXMgYSBkZWxpYmVyYXRlIGNvbnN0cmFpbnQuIE1vcmUgdGhhbiB0aGlzIGFuZCBzdHlsaW5nXG4vLyBiZWNvbWVzIGluY29uc2lzdGVudCBhY3Jvc3Mgd29ya3NoZWV0cy4gQWRkaW5nIGEgbmV3IHZhcmlhbnQgbGF0ZXIgaXMgYVxuLy8gYnJlYWtpbmcgc2NoZW1hIGNoYW5nZSBcdTIwMTQgY29uc2lkZXIgdGhhdCBiZWZvcmUgZXh0ZW5kaW5nLlxuZXhwb3J0IGNvbnN0IENhbGxvdXRWYXJpYW50ID0gei5lbnVtKFsnaW5mbycsICd3YXJuaW5nJywgJ3N1Y2Nlc3MnLCAnbm90ZSddKTtcbmV4cG9ydCB0eXBlIENhbGxvdXRWYXJpYW50ID0gei5pbmZlcjx0eXBlb2YgQ2FsbG91dFZhcmlhbnQ+O1xuXG5leHBvcnQgY29uc3QgQ2FsbG91dEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnY2FsbG91dCcpLFxuICB2YXJpYW50OiBDYWxsb3V0VmFyaWFudCxcbiAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ2FsbG91dEJsb2NrID0gei5pbmZlcjx0eXBlb2YgQ2FsbG91dEJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gXHUyNkIwIFRPTUJTVE9ORSBcdTIwMTQgYHByb2JsZW1gIElTIERFQUQuIERvIG5vdCBidWlsZCBvbiBpdC4gKFJ1bGluZyBFMSwgMjAyNi0wOC0xOSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgYmxvY2sgc3RpbGwgcGFyc2VzLCBiZWNhdXNlIGRvY3VtZW50cyBpbiB0aGUgZGF0YWJhc2UgbWF5IGNvbnRhaW4gb25lIGFuZFxuLy8gdGhlIHNjaGVtYSBpcyB0aGUgdGhpbmcgdGhhdCBtdXN0IGtlZXAgcmVhZGluZyB0aGVtLiBOT1RISU5HIEVMU0UgYWJvdXQgaXQgaXNcbi8vIGFsaXZlOlxuLy9cbi8vICAgLSBUaGUgRURJVE9SIENBTk5PVCBIT0xEIE9ORS4gc2VyaWFsaXplLnRzJ3MgYWN0aXZpdHlCbG9ja1RvVGlwdGFwIGhhcyBub1xuLy8gICAgIGBwcm9ibGVtYCBtYXBwaW5nIGFuZCByZXR1cm5zIG51bGwsIHNvIGFuIGltcG9ydGVkIG9yIGhhbmQtaW5zZXJ0ZWRcbi8vICAgICBwcm9ibGVtIGlzIGRyb3BwZWQgZnJvbSB0aGUgZWRpdG9yIHZpZXcgYW5kIERFTEVURUQgYnkgdGhlIGZpcnN0XG4vLyAgICAgYXV0b3NhdmUuIFRoaXMgaXMgbm90IGEgZ2FwIHRvIGZpbGw7IGl0IGlzIHdoeSB0aGUgYmxvY2sgaXMgZGVhZC5cbi8vICAgLSBUaGVyZSBpcyBubyBpbXBvcnRlciBmZW5jZSwgbm8gaW5zZXJ0IGFmZm9yZGFuY2UsIGFuZCBubyBlZGl0b3IgTm9kZVZpZXcuXG4vLyAgIC0gVGhlIHZpZXdlcidzIFByb2JsZW0udHN4IHJlbmRlcnMgaXQgcmVhZC1vbmx5IGZvciB0aGUgZG9jdW1lbnRzIHRoYXRcbi8vICAgICBhbHJlYWR5IGhhdmUgb25lLCBhbmQgdGhhdCBpcyBpdHMgZW50aXJlIHJlbWFpbmluZyBqb2IuXG4vL1xuLy8gVGhlIGFuc3dlci1rZXkgZGVzaWduIHBhc3MgKGRvY3MvZGVzaWduL3Byb2JsZW0tYW5zd2VyLWtleS5tZCkgb3BlbmVkIGJ5XG4vLyBwcm9wb3NpbmcgdG8gUkVWSVZFIHRoaXMgYmxvY2sgYXMgdGhlIGhvbWUgb2YgcGFwZXIgcHJvYmxlbXMuIFRoZSBzY29wZSBnYXRlXG4vLyBvdmVydHVybmVkIHRoYXQgcHJlbWlzZSBvbiB0aGUgZXZpZGVuY2UgYWJvdmU6IHBhcGVyIHByb2JsZW1zIHNoaXAgb25cbi8vIHNob3J0X2Fuc3dlci9lc3NheSwgd2hpY2ggaGF2ZSB0aGUgZWRpdG9yLCB0aGUgZmVuY2VzLCB0aGUgdmlld2VyLCBhbmQgMDAzNCdzXG4vLyBncmFkaW5nIHF1ZXVlIHRoYXQgYHByb2JsZW1gIG5ldmVyIGhhZC4gRnVsbCBSRU1PVkFMIG9mIHRoZSB0eXBlICh3aXRoIHRoZVxuLy8gUDUgY2xhaW1zLWdyZXAgb3ZlciBldmVyeSBjb21tZW50IHRoYXQgY2l0ZXMgaXQpIGlzIGEgcmVjb3JkZWQgVE9ETywgbm90IHBhcnRcbi8vIG9mIHRoYXQgc2xpY2UgXHUyMDE0IHJlbW92aW5nIGEgcGFyc2VhYmxlIHNoYXBlIGlzIGEgbWlncmF0aW9uIHF1ZXN0aW9uLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gQXV0by1udW1iZXJlZCBhdCByZW5kZXIgdGltZSBieSB3YWxraW5nIHRoZSBkb2N1bWVudCBhbmQgY291bnRpbmcgcHJvYmxlbVxuLy8gYmxvY2tzIGluIG9yZGVyLiBUaGUgb3B0aW9uYWwgYG51bWJlcmAgZmllbGQgb3ZlcnJpZGVzIHRoZSBhdXRvLW51bWJlclxuLy8gKHJhcmUgY2FzZXMgbGlrZSBcIlByb2JsZW0gNWFcIiBvciBoYW5kLW51bWJlcmVkIGxlZ2FjeSB3b3Jrc2hlZXRzKS5cbi8vXG4vLyBzb2x1dGlvbjogb3B0aW9uYWwgd29ya2VkIGV4cGxhbmF0aW9uIHNob3duIHRvIGFsbCBzdHVkZW50cyBhZnRlciB0aGVcbi8vIHNlY3Rpb24gaXMgY2hlY2tlZCAob3IgYWZ0ZXIgZmluYWwgc3VibWl0IGluIHNpbmdsZS1tb2RlIGFjdGl2aXRpZXMpLFxuLy8gcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZXkgYW5zd2VyZWQgY29ycmVjdGx5LiBEaWZmZXJlbnQgZnJvbSBoaW50IFx1MjAxNFxuLy8gaGludHMgbnVkZ2UgZHVyaW5nIHRoZSBhdHRlbXB0OyBzb2x1dGlvbnMgZXhwbGFpbiBhZnRlci4gVGhlIHJ1bnRpbWVcbi8vIHJlYWRzIHRoaXMgb24gaW5pdCBidXQgZG9lcyBOT1QgaW5qZWN0IGl0IGludG8gdGhlIERPTSB1bnRpbCBhZnRlclxuLy8gY2hlY2sgKFBoYXNlIDEgc2VjdXJpdHkgY2VpbGluZyBcdTIwMTQgZG9uJ3QgbWFrZSB0aGUgbGVhayB3b3JzZSkuXG4vL1xuLy8gc2tpbGxzOiBvcHRpb25hbCBhcnJheSBvZiB1bml2ZXJzYWwgc2tpbGwgdGFncyB0aGlzIHByb2JsZW0gdGFyZ2V0cy5cbi8vIEFjdGl2aXR5LWxldmVsIHNraWxscyBsaXZlIG9uIEFjdGl2aXR5TWV0YTsgdGhpcyBmaWVsZCBjYXB0dXJlc1xuLy8gcHJvYmxlbS1sZXZlbCBncmFudWxhcml0eSBmb3IgZnV0dXJlIHBlci1za2lsbCBhbmFseXRpY3MuIEVkaXRvciBVSSBpc1xuLy8gUGhhc2UgMjsgdGhlIGZpZWxkIGV4aXN0cyBpbiBQaGFzZSAxIHNvIGFuYWx5dGljcyBjYW4gcmVhY2ggYmFjay5cbmV4cG9ydCBjb25zdCBQcm9ibGVtQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB6LmxpdGVyYWwoJ3Byb2JsZW0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCB0eXBlIFByb2JsZW1CbG9jayA9IHouaW5mZXI8dHlwZW9mIFByb2JsZW1CbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBGaWxsSW5CbGFua0lubGluZSwgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcblxuLy8gVGhlIGFyY2hpdGVjdHVyYWxseSBpbnRlcmVzdGluZyBibG9jay4gY29udGVudCBpcyBhbiBhcnJheSBvZiBpbmxpbmUgbm9kZXNcbi8vIHRoYXQgbWF5IGluY2x1ZGUgQmxhbmtUb2tlbiBcdTIwMTQgc3R1ZGVudHMgc2VlIHByb3NlIHdpdGggZWRpdGFibGUgYmxhbmtzLlxuLy8gRWFjaCBibGFuaydzIGlkIGlzIGEgc3RhYmxlIHJlZmVyZW5jZSB1c2VkIGluIHN1Ym1pc3Npb25zLnJlc3BvbnNlcywgc29cbi8vIHJlb3JkZXJpbmcgYmxvY2tzIGRvZXNuJ3QgYnJlYWsgZ3JhZGluZyBvbiBwYXN0IHN1Ym1pc3Npb25zLlxuLy9cbi8vIGF1dG8tbnVtYmVyZWQgbGlrZSBQcm9ibGVtQmxvY2sgZm9yIHRoZSBwcm9ibGVtIGhlYWRlciAoZS5nLiwgXCJQcm9ibGVtIDNcIikuXG4vLyBXaHkgbm90IGp1c3QgdXNlIFByb2JsZW1CbG9jaz8gVGhleSBoYXZlIGRpZmZlcmVudCByZW5kZXJpbmcgYW5kIGRpZmZlcmVudFxuLy8gc3R1ZGVudCBpbnRlcmFjdGlvbjsgY29uZmxhdGluZyB0aGVtIHdvdWxkIGZvcmNlIGV2ZXJ5IHByb2JsZW0gdG8gZWl0aGVyXG4vLyBoYXZlIG9yIG5vdCBoYXZlIGJsYW5rcywgaW5zdGVhZCBvZiBiZWluZyBhIHBlci1wcm9ibGVtIGRlY2lzaW9uLlxuLy9cbi8vIFBlci1ibGFuayBmaWVsZHMgKGhpbnQsIG1pc3Rha2VGZWVkYmFjaykgbGl2ZSBvbiBCbGFua1Rva2VuIGluIGlubGluZS50cy5cbi8vIFBlci1ibG9jayBmaWVsZHMgYmVsb3c6XG4vLyAgIC0gc29sdXRpb246IG9uZSB3b3JrZWQgZXhwbGFuYXRpb24gZm9yIHRoZSB3aG9sZSBwcm9ibGVtIChhIFwic2ltcGxpZnlcbi8vICAgICBfX3hcdTAwQjIgKyBfX3ggLSAxMlwiIHByb21wdCBoYXMgb25lIHNvbHV0aW9uIGNvdmVyaW5nIGFsbCBibGFua3MsIG5vdCBvbmVcbi8vICAgICBwZXIgYmxhbmspLiBTaG93biBwb3N0LWNoZWNrIHJlZ2FyZGxlc3Mgb2YgY29ycmVjdG5lc3MuXG4vLyAgIC0gc2tpbGxzOiB1bml2ZXJzYWwgc2tpbGwgdGFncyAoc2VlIEFjdGl2aXR5TWV0YS5za2lsbHMpLiBFZGl0b3IgVUkgZm9yXG4vLyAgICAgdGhpcyBmaWVsZCBpcyBQaGFzZSAyOyBmaWVsZCBleGlzdHMgaW4gUGhhc2UgMSBzbyBwZXItc2tpbGwgYW5hbHl0aWNzXG4vLyAgICAgY2FuIHJlYWNoIGJhY2sgdG8gUGhhc2UgMSBwcm9ibGVtcyB3aGVuIHRoZSBlZGl0b3IgbGFuZHMuXG4vLyAgIC0gd29ya1NwYWNlOiBwZXItcHJvYmxlbSBvdmVycmlkZSAoaW4gcmVtKSBmb3IgdGhlIGJsYW5rIHdvcmtpbmcgc3BhY2Vcbi8vICAgICBwcmludGVkIGJlbG93IHRoaXMgcHJvYmxlbS4gT3B0aW9uYWwgd2l0aCBOTyBkZWZhdWx0IG9uIHB1cnBvc2U6IGFuXG4vLyAgICAgYWJzZW50IHZhbHVlIG1lYW5zIFwiaW5oZXJpdCB0aGUgYWN0aXZpdHktbGV2ZWwgcHJpbnQud29ya1NwYWNlXCIsIHdoaWNoXG4vLyAgICAgaXMgZXhhY3RseSB0aGUgQ1NTLWN1c3RvbS1wcm9wZXJ0eSBpbmhlcml0YW5jZSB0aGUgcmVuZGVyZXIgcmVsaWVzIG9uXG4vLyAgICAgKHRoZSBibG9jayBzZXRzIGl0cyBvd24gLS1wcmludC13b3JrLXNwYWNlIG9ubHkgd2hlbiB0aGlzIGlzIHByZXNlbnQpLlxuLy8gICAgIEEgZGVmYXVsdCBoZXJlIHdvdWxkIHBpbiBldmVyeSBibG9jayB0byBhIGNvbmNyZXRlIHZhbHVlIGFuZCBkZWZlYXRcbi8vICAgICB0aGF0IGluaGVyaXRhbmNlLiBQcmludC1vbmx5OyBpZ25vcmVkIG9uIHNjcmVlbi5cbmV4cG9ydCBjb25zdCBGaWxsSW5CbGFua0Jsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHoubGl0ZXJhbCgnZmlsbF9pbl9ibGFuaycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiB6LmFycmF5KEZpbGxJbkJsYW5rSW5saW5lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrU3BhY2U6IHoubnVtYmVyKCkubWluKDApLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFBlci1ibG9jayBkaXNwbGF5IGxhYmVsIChhdXRvL2N1c3RvbS9ub25lKS4gQWJzZW50ID0gYXV0byA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRvZGF5J3MgbnVtYmVyZWQgYmVoYXZpb3IuIFNlZSBsYWJlbC50cy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ubGFiZWxGaWVsZHMsXG59KTtcbmV4cG9ydCB0eXBlIEZpbGxJbkJsYW5rQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBGaWxsSW5CbGFua0Jsb2NrPjtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gbGlzdC50cyBcdTIwMTQgQnVsbGV0IGFuZCBvcmRlcmVkIGxpc3QgYmxvY2tzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gTGlzdHMgbmVzdC4gQSBMaXN0SXRlbSBob2xkcyBpbmxpbmUgY29udGVudCBwbHVzIGFuIG9wdGlvbmFsIGBjaGlsZHJlbmBcbi8vIGFycmF5IG9mIG5lc3RlZCBsaXN0IGJsb2NrczsgYnVsbGV0IGFuZCBvcmRlcmVkIGxpc3RzIGNhbiBtaXggZnJlZWx5IGF0XG4vLyBhbnkgZGVwdGguIFRoaXMgbWlycm9ycyBUaXB0YXAncyBsaXN0SXRlbSA+IHBhcmFncmFwaCArIChidWxsZXRMaXN0IHxcbi8vIG9yZGVyZWRMaXN0KSBzaGFwZSBlbmQtdG8tZW5kLCBzbyBUYWItdG8taW5kZW50IGluIHRoZSBlZGl0b3IgcHJlc2VydmVzXG4vLyBoaWVyYXJjaHkgdGhyb3VnaCBhdXRvc2F2ZS5cbi8vXG4vLyBSZWN1cnNpb24gbWVjaGFuaWM6IG9ubHkgdGhlIGN5Y2xpYyBlZGdlIChMaXN0SXRlbS5jaGlsZHJlbiBcdTIxOTIgbGlzdCBibG9jayBcdTIxOTJcbi8vIExpc3RJdGVtKSBuZWVkcyB6LmxhenkoKS4gQnVsbGV0TGlzdEJsb2NrIGFuZCBPcmRlcmVkTGlzdEJsb2NrIGFyZSBwbGFpblxuLy8gei5vYmplY3RzLCB3aGljaCBrZWVwcyB0aGVtIHVzYWJsZSBhcyBtZW1iZXJzIG9mIHouZGlzY3JpbWluYXRlZFVuaW9uIGluXG4vLyBibG9ja3MvaW5kZXgudHMuIERpc2NyaW1pbmF0ZWQgdW5pb25zIG5lZWQgWm9kT2JqZWN0cyB0byBpbnRyb3NwZWN0IHRoZVxuLy8gYHR5cGVgIGRpc2NyaW1pbmF0b3I7IGEgdG9wLWxldmVsIHoubGF6eSgpIHdyYXBwZXIgd291bGQgZGVmZWF0IHRoYXQuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG4vLyAtLS0tIFR5cGVTY3JpcHQgaW50ZXJmYWNlcyAoZm9yd2FyZCBkZWNsYXJhdGlvbnMgZm9yIHRoZSByZWN1cnNpdmUgdHlwZXMpIC0tLVxuXG5leHBvcnQgaW50ZXJmYWNlIExpc3RJdGVtIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIGNvbnRlbnQ6IHouaW5mZXI8dHlwZW9mIElubGluZU5vZGU+W107XG4gICAgY2hpbGRyZW4/OiBBcnJheTxCdWxsZXRMaXN0QmxvY2sgfCBPcmRlcmVkTGlzdEJsb2NrPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCdWxsZXRMaXN0QmxvY2sge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgdHlwZTogJ2J1bGxldF9saXN0JztcbiAgICBpdGVtczogTGlzdEl0ZW1bXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPcmRlcmVkTGlzdEJsb2NrIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHR5cGU6ICdvcmRlcmVkX2xpc3QnO1xuICAgIGl0ZW1zOiBMaXN0SXRlbVtdO1xufVxuXG4vLyAtLS0tIFpvZCBzY2hlbWFzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vLyBMYXp5IGJlY2F1c2UgTGlzdEl0ZW0uY2hpbGRyZW4gcmVmZXJzIHRvIHRoZSBsaXN0IGJsb2Nrcywgd2hpY2ggcmVmZXIgYmFja1xuLy8gdG8gTGlzdEl0ZW0uIFRoZSBhcnJvdyBib2R5IG9ubHkgcnVucyBhdCBwYXJzZSB0aW1lLCBieSB3aGljaCBwb2ludCBhbGxcbi8vIHRocmVlIGV4cG9ydHMgYXJlIGJvdW5kLlxuZXhwb3J0IGNvbnN0IExpc3RJdGVtOiB6LlpvZFR5cGU8TGlzdEl0ZW0sIHouWm9kVHlwZURlZiwgdW5rbm93bj4gPSB6LmxhenkoKCkgPT5cbnoub2JqZWN0KHtcbiAgICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gICAgICAgICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxuICAgICAgICAgY2hpbGRyZW46IHpcbiAgICAgICAgIC5hcnJheSh6LnVuaW9uKFtCdWxsZXRMaXN0QmxvY2ssIE9yZGVyZWRMaXN0QmxvY2tdKSlcbiAgICAgICAgIC5vcHRpb25hbCgpLFxufSksXG4pO1xuXG5leHBvcnQgY29uc3QgQnVsbGV0TGlzdEJsb2NrID0gei5vYmplY3Qoe1xuICAgIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB6LmxpdGVyYWwoJ2J1bGxldF9saXN0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IHouYXJyYXkoTGlzdEl0ZW0pLFxufSk7XG5cbmV4cG9ydCBjb25zdCBPcmRlcmVkTGlzdEJsb2NrID0gei5vYmplY3Qoe1xuICAgIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogei5saXRlcmFsKCdvcmRlcmVkX2xpc3QnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IHouYXJyYXkoTGlzdEl0ZW0pLFxufSk7XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlLCBNaXNjb25jZXB0aW9uSWQgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5pbXBvcnQgeyBzaXppbmdGaWVsZHMgfSBmcm9tICcuLi9zaXppbmcuanMnO1xuaW1wb3J0IHtcbiAgQXhpc0NvbmZpZyxcbiAgQ3VydmVEb21haW4sXG4gIERyYXdhYmxlLFxuICBFbmRwb2ludFN0eWxlLFxuICBGdW5jdGlvbk1vZGVsLFxufSBmcm9tICcuLi9ncmFwaC1wcmltaXRpdmVzLmpzJztcblxuLy8gVGhlIGNvb3JkaW5hdGUtcGxhbmUgcHJpbWl0aXZlcyAoQXhpc0NvbmZpZywgRW5kcG9pbnRTdHlsZSwgQ3VydmVEb21haW4sIHRoZVxuLy8gRnVuY3Rpb25Nb2RlbCBmYW1pbHksIERyYXdhYmxlQ29sb3IsIERyYXdhYmxlKSBNT1ZFRCB0byAuLi9ncmFwaC1wcmltaXRpdmVzLnRzXG4vLyBcdTIwMTQgYSBsZWFmIG1vZHVsZSB0aGF0IGltcG9ydHMgbm90aGluZyBidXQgem9kLiBUaGV5IGFyZSByZS1leHBvcnRlZCBoZXJlLCB3aXRoXG4vLyBpZGVudGljYWwgaWRlbnRpdGllcywgc28gZXZlcnkgZXhpc3RpbmcgaW1wb3J0IHBhdGgga2VlcHMgd29ya2luZy5cbi8vXG4vLyBXaHkgdGhleSBtb3ZlZDogdGhpcyBmaWxlIGltcG9ydHMgSW5saW5lTm9kZSwgc28gcmVhY2hpbmcgdGhlIHByaW1pdGl2ZXNcbi8vIHRocm91Z2ggaXQgZHJhZ3MgaW4gaW5saW5lLnRzLiBpbmxpbmUudHMgbm93IG5lZWRzIGdyYXBoX2ZpZ3VyZSAoYSBkZWZpbml0aW9uXG4vLyBtYXkgY29udGFpbiBvbmUpLCB3aGljaCB3b3VsZCBjbG9zZSB0aGUgY3ljbGUgaW5saW5lIC0+IGdyYXBoLWZpZ3VyZSAtPlxuLy8gaW50ZXJhY3RpdmUtZ3JhcGggLT4gaW5saW5lLiBUaGF0IGN5Y2xlIGlzIGZhdGFsLCBub3QgY29zbWV0aWM6IHRoZVxuLy8gYHouYXJyYXkoSW5saW5lTm9kZSlgIGNhbGxzIGJlbG93IHJ1biBhdCBtb2R1bGUgc2NvcGUgYW5kIHdvdWxkIGhpdCBhIFREWlxuLy8gUmVmZXJlbmNlRXJyb3Igb24gYSBwYXJ0aWFsbHktaW5pdGlhbGl6ZWQgaW5saW5lLmpzLiBTZWUgZ3JhcGgtcHJpbWl0aXZlcy50cy5cbmV4cG9ydCB7XG4gIEF4aXNDb25maWcsXG4gIEVuZHBvaW50U3R5bGUsXG4gIEN1cnZlRG9tYWluLFxuICBMaW5lYXJNb2RlbCxcbiAgUXVhZHJhdGljTW9kZWwsXG4gIEN1YmljTW9kZWwsXG4gIFF1YXJ0aWNNb2RlbCxcbiAgRXhwb25lbnRpYWxNb2RlbCxcbiAgTG9nYXJpdGhtaWNNb2RlbCxcbiAgVmVydGljYWxNb2RlbCxcbiAgRnVuY3Rpb25Nb2RlbCxcbiAgRHJhd2FibGVDb2xvcixcbiAgRHJhd2FibGUsXG59IGZyb20gJy4uL2dyYXBoLXByaW1pdGl2ZXMuanMnO1xuZXhwb3J0IHR5cGUgeyBEcmF3YWJsZUNvbG9yVCB9IGZyb20gJy4uL2dyYXBoLXByaW1pdGl2ZXMuanMnO1xuXG4vLyBUaGUgaW50ZXJhY3RpdmUgZ3JhcGggYmxvY2sgKFBoYXNlIDIuNywgU3RhZ2UgNSkuIFVubGlrZSBldmVyeSBvdGhlciBibG9jayxcbi8vIHRoZSBzdHVkZW50J3MgYW5zd2VyIGlzIEdFT01FVFJJQyBcdTIwMTQgYSBwb2ludCB0aGV5IHBsb3Qgb24gYSBjb29yZGluYXRlIHBsYW5lIFx1MjAxNFxuLy8gbm90IHRleHQuIFRocmVlIHN0cnVjdHVyYWwgY29uc2VxdWVuY2VzIChzZWUgZG9jcy9kZXNpZ24vaW50ZXJhY3RpdmUtZ3JhcGgtXG4vLyBibG9jay5tZCk6IHRoZSBhbnN3ZXIgaXMgYSBzdHJ1Y3R1cmVkIHZhbHVlIChpdHMgb3duIHN1Ym1pc3Npb24gbWFwLCBub3QgdGhlXG4vLyBibGFua3MgbWFwKSwgc2NvcmluZyBpcyB0b2xlcmFuY2UtYmFzZWQgZ2VvbWV0cmljIGNvbXBhcmlzb24gKHRoZSBncmFwaC1raXRcbi8vIHNjb3JlcyBpdCwgbm90IHRoZSBydW50aW1lJ3Mgc3RyaW5nIHN0cmF0ZWdpZXMpLCBhbmQgdGhlIHdpZGdldCBpcyBsYXJnZVxuLy8gKEpTWEdyYXBoIHJpZGVzIHRoZSBsYXp5LWxvYWRlZCBAYWN0aXZpdHkvZ3JhcGgta2l0LCBuZXZlciB0aGUgYmFzZSBydW50aW1lKS5cbi8vXG4vLyBTbGljZSAxICgyLjdhKSBzaGlwcyBPTkUgaW50ZXJhY3Rpb24gXHUyMDE0IHBsb3RfcG9pbnQuIFRoZSBpbnRlcmFjdGlvbiBpcyBhXG4vLyBkaXNjcmltaW5hdGVkIHVuaW9uIGZyb20gZGF5IG9uZSBzbyBwbG90X2xpbmUgKDIuN2IpIGFuZCBzaGFkZV9yZWdpb24gKDIuN2MpXG4vLyBhcmUgZWFjaCBhIG5ldyB2YXJpYW50ICsgYSBuZXcgc2NvcmluZyBzdHJhdGVneSB3aXRoIE5PIHNjaGVtYSBtaWdyYXRpb24gYW5kXG4vLyBubyBjaGFuZ2UgdG8gYW55IG90aGVyIGJsb2NrIHR5cGUgXHUyMDE0IGV4YWN0bHkgaG93IHRoZSB0b3AtbGV2ZWwgQmxvY2sgdW5pb25cbi8vIGdyb3dzLlxuXG4vLyAtLS0tIEludGVyYWN0aW9uIHZhcmlhbnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRWFjaCB2YXJpYW50IGNhcnJpZXMgaXRzIE9XTiBhbnN3ZXIga2V5ICsgdG9sZXJhbmNlLiBwbG90X3BvaW50IGlzIHRoZSBvbmx5XG4vLyB2YXJpYW50IGluIHNsaWNlIDE7IHRoZSB1bmlvbiBzaGFwZSBpcyBoZXJlIHNvIHRoZSBuZXh0IHZhcmlhbnRzIHNsb3QgaW4uXG5leHBvcnQgY29uc3QgUG9pbnRJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X3BvaW50JyksXG4gIC8vIE9uZSBvciBtb3JlIGNvcnJlY3QgcG9pbnRzOyB0aGUgc3R1ZGVudCBtdXN0IHBsb3QgYWxsIG9mIHRoZW0uIEEgc2luZ2xlXG4gIC8vIHBvaW50IGlzIHRoZSBjb21tb24gY2FzZTsgbXVsdGlwbGUgc3VwcG9ydHMgZS5nLiBcInBsb3QgdGhlIHR3byByb290cy5cIlxuICBjb3JyZWN0UG9pbnRzOiB6LmFycmF5KHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSkubWluKDEpLFxuICAvLyBQZXItcG9pbnQgdG9sZXJhbmNlIGluIGdyYXBoIHVuaXRzIChhIEV1Y2xpZGVhbi9lYWNoLWF4aXMgcmFkaXVzLCBhcHBsaWVkXG4gIC8vIGJ5IHRoZSBraXQncyBzY29yZXIpLiAwLjEgZGVmYXVsdCBzdWl0cyBhIHNuYXAtdG8tZ3JpZCBzaW5nbGUgcG9pbnQuXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgUG9pbnRJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIFBvaW50SW50ZXJhY3Rpb24+O1xuXG4vLyAtLS0tIHBsb3RfZnVuY3Rpb246IHBsb3QgYSBjdXJ2ZSBvZiBhIGdpdmVuIGZhbWlseSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzdHVkZW50IHBsYWNlcyBOIHBvaW50cyBhbmQgdGhlIHdpZGdldCBmaXRzICsgZHJhd3MgYSBjdXJ2ZSBUSFJPVUdIIHRoZW1cbi8vIChOID0gdGhlIGZhbWlseSdzIHBhcmFtZXRlciBjb3VudDogbGluZWFyIDIsIHF1YWRyYXRpYyAzLCBleHBvbmVudGlhbCAyLFxuLy8gbG9nYXJpdGhtaWMgMikuIFNjb3JlZCBvbiB0aGUgZml0dGVkIGN1cnZlJ3MgUEFSQU1FVEVSUyAobm90IHRoZSBleGFjdCBwb2ludFxuLy8gcG9zaXRpb25zKSwgc28gYW55IHBvaW50cyBvbiB0aGUgY29ycmVjdCBjdXJ2ZSBhcmUgYWNjZXB0ZWQuIFRoZSBwYXJhbWV0ZXJzXG4vLyBjb21lIGZyb20gdGhlIFNBTUUgcmVncmVzc2lvbiBmaXQgZW5naW5lIHRoZSBjYWxjdWxhdG9yIHVzZXMgKGZpdExpbmVhciwgXHUyMDI2KS5cbi8vXG4vLyBgbW9kZWxgIGlzIGEgZGlzY3JpbWluYXRlZCB1bmlvbiBvbiBgZmFtaWx5YCAoRnVuY3Rpb25Nb2RlbCwgbm93IGluXG4vLyAuLi9ncmFwaC1wcmltaXRpdmVzLnRzIGFuZCByZS1leHBvcnRlZCBhYm92ZSk6IGxpbmVhciwgcXVhZHJhdGljLCBleHBvbmVudGlhbCxcbi8vIGxvZ2FyaXRobWljLCB2ZXJ0aWNhbC4gR3Jvd2luZyBhIGZhbWlseSBpcyBhIG5ldyBtZW1iZXIgdGhlcmUgKyBhIG5ldyBmaXRcbi8vIGJyYW5jaCBpbiB0aGUga2l0J3Mgc2NvcmVyIFx1MjAxNCBhZGRpdGl2ZSwgbm90IGEgcmV3cml0ZS5cblxuLy8gcGxvdF9mdW5jdGlvbiBjYXJyaWVzIGFuIEFSUkFZIG9mIGN1cnZlcyAoc2hpcHMgYXMgb25lKS4gT25lIGN1cnZlIGlzIHRoZVxuLy8gY29tbW9uIGNhc2U7IG11bHRpcGxlIGlzIGEgc3lzdGVtIG9mIGVxdWF0aW9ucyAoXCJncmFwaCBib3RoIGxpbmVzXCIpLCBzY29yZWRcbi8vIGFzIG9uZSBvYmplY3QgZWFjaCBcdTIwMTQgc28gc3lzdGVtcyBhcmUgYWRkaXRpdmUsIG5vdCBhIHJlc2hhcGUgKERyb3AgMiBkZWNpc2lvbikuXG5leHBvcnQgY29uc3QgRnVuY3Rpb25JbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X2Z1bmN0aW9uJyksXG4gIG1vZGVsczogei5hcnJheShGdW5jdGlvbk1vZGVsKS5taW4oMSksXG4gIC8vIERyb3AgNjogb3B0aW9uYWwgcGVyLWN1cnZlIGRvbWFpbiByZXN0cmljdGlvbnMgKFwiZ3JhcGggeSA9IDJ4ICsgMyBmb3JcbiAgLy8geCA+PSAwXCIpLCBwYXJhbGxlbCB0byBtb2RlbHMgYnkgaW5kZXguIFRoZSBmcmVlZm9ybSBwYXJzZXIgZmlsbHMgdGhlc2UgZnJvbVxuICAvLyBhIGBmb3IgXHUyMDI2YCBjbGF1c2U7IHRoZSB3aWRnZXQncyBlbmRwb2ludC1kcmFnIFVYIGlzIHRoZSBwbGFubmVkIGZvbGxvdy11cCBcdTIwMTRcbiAgLy8gdW50aWwgaXQgbGFuZHMsIHRoZSBkb21haW4gaXMgYXV0aG9yaW5nIG1ldGFkYXRhIGRyYXduIG9uIHRoZSBrZXksIGFuZFxuICAvLyBzY29yaW5nIHJlbWFpbnMgb24gdGhlIGN1cnZlIHBhcmFtZXRlcnMuXG4gIGRvbWFpbnM6IHouYXJyYXkoQ3VydmVEb21haW4ubnVsbGFibGUoKSkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgRnVuY3Rpb25JbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIEZ1bmN0aW9uSW50ZXJhY3Rpb24+O1xuXG4vLyAtLS0tIHNoYWRlX3JlZ2lvbjogc2hhZGUgYSBwb2x5Z29uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc3R1ZGVudCBkcmFncyB0aGUgdmVydGljZXMgb2YgYSBwb2x5Z29uIChvbmUgaGFuZGxlIHBlciB2ZXJ0ZXgpIHRvIGNvdmVyIGFcbi8vIHRhcmdldCByZWdpb24sIHdoaWNoIGlzIHNoYWRlZCBhcyB0aGV5IG1vdmUuIFNjb3JlZCBieSBBUkVBIE9WRVJMQVAgd2l0aCB0aGVcbi8vIGNvcnJlY3QgcG9seWdvbiAoaW50ZXJzZWN0aW9uLW92ZXItdW5pb24gXHUyMjY1IG1pbk92ZXJsYXApLCBzbyB0aGUgZXhhY3QgdmVydGV4XG4vLyBwb3NpdGlvbnMgZG9uJ3QgbWF0dGVyIFx1MjAxNCBvbmx5IHRoYXQgdGhlIHNoYWRlZCByZWdpb24gbWF0Y2hlcy4gQSBwb2x5Z29uLCBub3QgYVxuLy8gY3VydmUsIHNvIGl0J3MgaXRzIG93biBpbnRlcmFjdGlvbiAobm90IGEgcGxvdF9mdW5jdGlvbiBmYW1pbHkpLlxuLy8gT25lIHRhcmdldCBwb2x5Z29uOiB2ZXJ0aWNlcyBpbiBvcmRlciAobWluIDMpICsgdGhlIG1pbmltdW0gaW50ZXJzZWN0aW9uLW92ZXItXG4vLyB1bmlvbiB3aXRoIHRoZSBzdHVkZW50J3MgcG9seWdvbiB0byBjb3VudCBhcyBjb3JyZWN0LlxuZXhwb3J0IGNvbnN0IFJlZ2lvbkFuc3dlciA9IHoub2JqZWN0KHtcbiAgY29ycmVjdFZlcnRpY2VzOiB6LmFycmF5KHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSkubWluKDMpLFxuICAvLyAwLjkgaXMgc3RyaWN0IChuZWFyLWV4YWN0IG9uIGEgc25hcHBlZCBncmlkKTsgbG93ZXIgaXQgZm9yIGhhbmQtZHJhZ2dlZCAvXG4gIC8vIGFwcHJveGltYXRlIHJlZ2lvbnMuXG4gIG1pbk92ZXJsYXA6IHoubnVtYmVyKCkubWluKDApLm1heCgxKS5kZWZhdWx0KDAuOSksXG59KTtcbmV4cG9ydCB0eXBlIFJlZ2lvbkFuc3dlciA9IHouaW5mZXI8dHlwZW9mIFJlZ2lvbkFuc3dlcj47XG5cbi8vIHNoYWRlX3JlZ2lvbiBjYXJyaWVzIGFuIEFSUkFZIG9mIHRhcmdldCBwb2x5Z29ucyAoc2hpcHMgYXMgb25lKSwgZWFjaCBzY29yZWRcbi8vIGFzIG9uZSBvYmplY3QgXHUyMDE0IHNvIFwic2hhZGUgYm90aCByZWdpb25zXCIgaXMgYWRkaXRpdmUsIG1hdGNoaW5nIHBsb3RfZnVuY3Rpb24uXG5leHBvcnQgY29uc3QgUmVnaW9uSW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnc2hhZGVfcmVnaW9uJyksXG4gIHJlZ2lvbnM6IHouYXJyYXkoUmVnaW9uQW5zd2VyKS5taW4oMSksXG59KTtcbmV4cG9ydCB0eXBlIFJlZ2lvbkludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgUmVnaW9uSW50ZXJhY3Rpb24+O1xuXG4vLyAtLS0tIGdyYXBoX2luZXF1YWxpdHk6IGdyYXBoIGFuIGluZXF1YWxpdHkgKERyb3AgNCkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc3R1ZGVudCBwbGFjZXMgdGhlIGJvdW5kYXJ5IChzYW1lIGhhbmRsZXMgYXMgcGxvdF9mdW5jdGlvbiksIHRvZ2dsZXMgdGhlXG4vLyBsaW5lIGRvdHRlZCAoc3RyaWN0KSBvciBzb2xpZCAoaW5jbHVzaXZlKSwgYW5kIGNsaWNrcyBhIHNpZGUgdG8gc2hhZGUuIEFsbFxuLy8gdGhyZWUgYXJlIGdyYWRlZCBcdTIwMTQgY2hvb3NpbmcgdGhlbSBJUyB0aGUgc2tpbGwuIFRoZSBib3VuZGFyeSBpcyBhIEZ1bmN0aW9uTW9kZWwsXG4vLyBzbyBxdWFkcmF0aWMgaW5lcXVhbGl0aWVzICh5ID4geFx1MDBCMikgd29yayB0aGUgZGF5IHRoZSBmYW1pbHkgZG9lczsgYSB2ZXJ0aWNhbFxuLy8gYm91bmRhcnkgKHggPiAzKSBzaGFkZXMgbGVmdC9yaWdodCBpbnN0ZWFkIG9mIGFib3ZlL2JlbG93LlxuZXhwb3J0IGNvbnN0IFNoYWRlU2lkZVZhbHVlID0gei5lbnVtKFsnYWJvdmUnLCAnYmVsb3cnLCAnbGVmdCcsICdyaWdodCddKTtcbmV4cG9ydCB0eXBlIFNoYWRlU2lkZVZhbHVlID0gei5pbmZlcjx0eXBlb2YgU2hhZGVTaWRlVmFsdWU+O1xuXG5leHBvcnQgY29uc3QgSW5lcXVhbGl0eUFuc3dlciA9IHoub2JqZWN0KHtcbiAgYm91bmRhcnk6IEZ1bmN0aW9uTW9kZWwsXG4gIC8vIHRydWUgPSBzdHJpY3QgKDwgLyA+LCBkb3R0ZWQgYm91bmRhcnkpOyBmYWxzZSA9IGluY2x1c2l2ZSAoXHUyMjY0IC8gXHUyMjY1LCBzb2xpZCkuXG4gIHN0cmljdDogei5ib29sZWFuKCksXG4gIHNoYWRlU2lkZTogU2hhZGVTaWRlVmFsdWUsXG59KTtcbmV4cG9ydCB0eXBlIEluZXF1YWxpdHlBbnN3ZXIgPSB6LmluZmVyPHR5cGVvZiBJbmVxdWFsaXR5QW5zd2VyPjtcblxuLy8gQW4gQVJSQVkgb2YgaW5lcXVhbGl0aWVzIChzaGlwcyBhcyBvbmUpOyBzeXN0ZW1zIChcInNoYWRlIHdoZXJlIEJPVEggaG9sZFwiKVxuLy8gYmVjb21lIGFkZGl0aXZlIG1lbWJlcnMsIG1hdGNoaW5nIHBsb3RfZnVuY3Rpb24vc2hhZGVfcmVnaW9uLlxuZXhwb3J0IGNvbnN0IEluZXF1YWxpdHlJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdncmFwaF9pbmVxdWFsaXR5JyksXG4gIGluZXF1YWxpdGllczogei5hcnJheShJbmVxdWFsaXR5QW5zd2VyKS5taW4oMSksXG59KTtcbmV4cG9ydCB0eXBlIEluZXF1YWxpdHlJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIEluZXF1YWxpdHlJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gZGlzcGxheTogYSBzdGF0aWMgKHVuZ3JhZGVkKSBncmFwaCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGJsb2NrIGRyYXdzIGEgZml4ZWQgcGljdHVyZSBcdTIwMTQgcG9pbnRzLCBjdXJ2ZXMsIHNlZ21lbnRzLCBmaWxsZWQgcG9seWdvbnMgXHUyMDE0XG4vLyBhbmQgY29sbGVjdHMgTk8gYW5zd2VyLiBUd28gam9icyBmcm9tIG9uZSBzaGFwZTogYSBzdGltdWx1cyBhIGdyYWRlZCBxdWVzdGlvblxuLy8gcmVmZXJzIHRvIChcInVzaW5nIHRoZSBncmFwaCBiZWxvdywgXHUyMDI2XCIpLCBhbmQgYSBzdGFuZGFsb25lIGV4ZW1wbGFyIHdpdGggbm9cbi8vIHF1ZXN0aW9uIGF0IGFsbCAoYW4gZW1wdHkgcHJvbXB0KS4gQmVjYXVzZSBgZGlzcGxheWAgaXMganVzdCBhbm90aGVyIG1lbWJlciBvZlxuLy8gdGhlIGB0eXBlYCB1bmlvbiwgYSBzdGltdWx1cy13aXRoLWFuLWFuc3dlciBsYXRlciBpcyBhZGRpdGl2ZSBcdTIwMTQgYSBuZXcgYW5zd2VyXG4vLyBmaWVsZCBiZXNpZGUgdGhlIGRyYXdhYmxlcyBcdTIwMTQgbm90IGEgbmV3IGJsb2NrIGZhbWlseS5cbi8vXG4vLyBgRHJhd2FibGVgICh0aGUgcG9pbnQgLyBjdXJ2ZSAvIGV4cHJlc3Npb24gLyBzZWdtZW50IC8gcmF5IC8gcG9seWdvbiB1bmlvbixcbi8vIGRpc2NyaW1pbmF0ZWQgb24gYGtpbmRgKSBhbmQgaXRzIGBEcmF3YWJsZUNvbG9yYCBwYWxldHRlIGtleXMgbm93IGxpdmUgaW5cbi8vIC4uL2dyYXBoLXByaW1pdGl2ZXMudHMgYW5kIGFyZSByZS1leHBvcnRlZCBhYm92ZS5cblxuZXhwb3J0IGNvbnN0IERpc3BsYXlJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdkaXNwbGF5JyksXG4gIGRyYXdhYmxlczogei5hcnJheShEcmF3YWJsZSkuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCB0eXBlIERpc3BsYXlJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIERpc3BsYXlJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gcGxvdF9yYXkgLyBwbG90X3NlZ21lbnQ6IGRyYXcgYSByYXkgb3Igc2VnbWVudCBkaXJlY3RseSAtLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZpcnN0LWNsYXNzIHJlcGxhY2VtZW50cyBmb3IgdGhlIGRvbWFpbi1nbGlkZXIgYXBwcm9hY2ggKHdoaWNoIGFza2VkIHN0dWRlbnRzXG4vLyB0byBkZWZpbmUgYW4gaW5maW5pdGUgbGluZSwgdGhlbiBtYXJrIGVuZHBvaW50cyBvbiBpdCB3aXRoIHNlcGFyYXRlIGNvbnRyb2xzIFx1MjAxNFxuLy8gdGhlIGRyYXduIGxpbmUgbmV2ZXIgZXZlbiBjbGlwcGVkKS4gSGVyZSB0aGUgc3R1ZGVudCBkcmFncyBUV08gaGFuZGxlcyBcdTIwMTQgdGhlXG4vLyBlbmRwb2ludChzKSBcdTIwMTQgYW5kIHRoZSB3aWRnZXQgZHJhd3MgYW4gQUNUVUFMIHJheS9zZWdtZW50IHRocm91Z2ggdGhlbVxuLy8gKEpTWEdyYXBoIHN0cmFpZ2h0Rmlyc3Qvc3RyYWlnaHRMYXN0KSwgd2l0aCBvcGVuL2Nsb3NlZCBlbmRwb2ludCBwaWxscy5cbi8vIEFycmF5cy1vZi1vbmUgbGlrZSBtb2RlbHMvcmVnaW9ucy9pbmVxdWFsaXRpZXMsIHNvIHN5c3RlbXMgc3RheSBhZGRpdGl2ZS5cbi8vIChwbG90X2Z1bmN0aW9uJ3MgZG9tYWluc1tdIHJlbWFpbnMgc2NvcmVkIGZvciBhbHJlYWR5LXB1Ymxpc2hlZCBwYWdlcywgYnV0XG4vLyBhdXRob3Jpbmcgc3RlZXJzIGhlcmUgbm93LilcbmV4cG9ydCBjb25zdCBSYXlBbnN3ZXIgPSB6Lm9iamVjdCh7XG4gIC8vIFRoZSByYXkncyBlbmRwb2ludCAoc2NvcmVkIG9uIHBvc2l0aW9uICsgb3Blbi9jbG9zZWQgc3R5bGUpLlxuICBmcm9tOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIC8vIEFueSBzZWNvbmQgcG9pbnQgT04gdGhlIHJheSBcdTIwMTQgbmFtZXMgdGhlIGRpcmVjdGlvbjsgdGhlIHN0dWRlbnQncyB0aHJvdWdoXG4gIC8vIGhhbmRsZSBtYXkgc2l0IGFueXdoZXJlIGFsb25nIHRoZSBjb3JyZWN0IHJheS5cbiAgdGhyb3VnaDogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICBmcm9tU3R5bGU6IEVuZHBvaW50U3R5bGUuZGVmYXVsdCgnY2xvc2VkJyksXG4gIC8vIEVuZHBvaW50IHBvc2l0aW9uIHRvbGVyYW5jZSBpbiBncmFwaCB1bml0cyAobWF0Y2hlcyB0aGUgZG9tYWluLWdsaWRlclxuICAvLyBkZWZhdWx0KS4gRGlyZWN0aW9uIGlzIHNjb3JlZCBieSB1bml0LXZlY3RvciBhbGlnbm1lbnQga2l0LXNpZGUuXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4yNSksXG59KTtcbmV4cG9ydCB0eXBlIFJheUFuc3dlciA9IHouaW5mZXI8dHlwZW9mIFJheUFuc3dlcj47XG5cbmV4cG9ydCBjb25zdCBSYXlJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X3JheScpLFxuICByYXlzOiB6LmFycmF5KFJheUFuc3dlcikubWluKDEpLFxufSk7XG5leHBvcnQgdHlwZSBSYXlJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIFJheUludGVyYWN0aW9uPjtcblxuZXhwb3J0IGNvbnN0IFNlZ21lbnRBbnN3ZXIgPSB6Lm9iamVjdCh7XG4gIGZyb206IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgdG86IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgLy8gW2Zyb20tZW5kcG9pbnQgc3R5bGUsIHRvLWVuZHBvaW50IHN0eWxlXS4gU2NvcmVkIG9yZGVyLWluZGVwZW5kZW50bHkgXHUyMDE0XG4gIC8vIHRoZSBzdHVkZW50IG1heSBkcmF3IHRoZSBzZWdtZW50IGluIGVpdGhlciBkaXJlY3Rpb24uXG4gIGVuZHBvaW50czogei50dXBsZShbRW5kcG9pbnRTdHlsZSwgRW5kcG9pbnRTdHlsZV0pLmRlZmF1bHQoWydjbG9zZWQnLCAnY2xvc2VkJ10pLFxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMjUpLFxufSk7XG5leHBvcnQgdHlwZSBTZWdtZW50QW5zd2VyID0gei5pbmZlcjx0eXBlb2YgU2VnbWVudEFuc3dlcj47XG5cbmV4cG9ydCBjb25zdCBTZWdtZW50SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9zZWdtZW50JyksXG4gIHNlZ21lbnRzOiB6LmFycmF5KFNlZ21lbnRBbnN3ZXIpLm1pbigxKSxcbn0pO1xuZXhwb3J0IHR5cGUgU2VnbWVudEludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgU2VnbWVudEludGVyYWN0aW9uPjtcblxuLy8gVGhlIGludGVyYWN0aW9uIHVuaW9uLiBwbG90X3BvaW50ICsgcGxvdF9mdW5jdGlvbiArIHNoYWRlX3JlZ2lvbiBhcmUgZ3JhZGVkO1xuLy8gZGlzcGxheSBpcyB0aGUgdW5ncmFkZWQgc3RhdGljIGdyYXBoLiBNb3JlIGFyZSBmdXR1cmUgbWVtYmVycy4gS2VwdFxuLy8gZGlzY3JpbWluYXRlZCBvbiBgdHlwZWAgc28gdGhlIHdpcmUgZm9ybWF0IGFsd2F5cyBjYXJyaWVzIGl0IGFuZCBjb25zdW1lcnNcbi8vIGJyYW5jaCB1bmlmb3JtbHkuXG5leHBvcnQgY29uc3QgR3JhcGhJbnRlcmFjdGlvbiA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBQb2ludEludGVyYWN0aW9uLFxuICBGdW5jdGlvbkludGVyYWN0aW9uLFxuICBSZWdpb25JbnRlcmFjdGlvbixcbiAgSW5lcXVhbGl0eUludGVyYWN0aW9uLFxuICBSYXlJbnRlcmFjdGlvbixcbiAgU2VnbWVudEludGVyYWN0aW9uLFxuICBEaXNwbGF5SW50ZXJhY3Rpb24sXG5dKTtcbmV4cG9ydCB0eXBlIEdyYXBoSW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBHcmFwaEludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBUaGUgYmxvY2sgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEF1dG8tbnVtYmVyZWQgbGlrZSBQcm9ibGVtQmxvY2sgLyBGaWxsSW5CbGFua0Jsb2NrLiBza2lsbHMgZm9sbG93cyB0aGUgc2FtZVxuLy8gb3B0LWluIHBhdHRlcm4gRmlsbEluQmxhbmtCbG9jayBlc3RhYmxpc2hlZDsgc29sdXRpb24gaXMgc2hvd24gcG9zdC1jaGVja1xuLy8gcmVnYXJkbGVzcyBvZiBjb3JyZWN0bmVzcy5cbmV4cG9ydCBjb25zdCBJbnRlcmFjdGl2ZUdyYXBoQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdpbnRlcmFjdGl2ZV9ncmFwaCcpLFxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAuLi5sYWJlbEZpZWxkcyxcbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICBheGlzQ29uZmlnOiBBeGlzQ29uZmlnLFxuICBpbnRlcmFjdGlvbjogR3JhcGhJbnRlcmFjdGlvbixcbiAgLy8gV2hlbiB0cnVlLCB0aGUgc3R1ZGVudCBnZXRzIGEgXCJjYW5ub3QgYmUgZ3JhcGhlZCAvIG5vIHNvbHV0aW9uXCIgY2hvaWNlLCBhbmRcbiAgLy8gdGhlIGFuc3dlciBrZXkgbWF5IG1hcmsgVEhBVCBhcyB0aGUgY29ycmVjdCBhbnN3ZXIgKHRyaWNrIHF1ZXN0aW9ucykuIFRoZVxuICAvLyBmbGFnIGxhbmRzIGhlcmUgKERyb3AgMik7IHRoZSBzdHVkZW50IGNvbnRyb2wgKyBuby1zb2x1dGlvbiByZXNwb25zZSByaWRlIHRoZVxuICAvLyBEcm9wIDQgd2lyZSBidW1wLlxuICBhbGxvd05vU29sdXRpb246IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAvLyBUcmljayBxdWVzdGlvbnM6IHdoZW4gdHJ1ZSAocmVxdWlyZXMgYWxsb3dOb1NvbHV0aW9uKSwgXCJubyBzb2x1dGlvblwiIElTIHRoZVxuICAvLyBjb3JyZWN0IGFuc3dlciBhbmQgdGhlIGRyYXduIGFuc3dlciBrZXkgaXMgYSBkZWNveS4gQSBzdHVkZW50IHdobyBzZWxlY3RzXG4gIC8vIG5vLXNvbHV0aW9uIGlzIGNvcnJlY3Q7IG9uZSB3aG8gZHJhd3MgYW55dGhpbmcgaXMgbm90LlxuICBub1NvbHV0aW9uQ29ycmVjdDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIEJ1aWx0LWluIG1pc3Rha2UgY2xhc3NpZmllcnMgKHN3YXBwZWQgY29vcmRpbmF0ZXMsIHN3YXBwZWQgc2xvcGUvaW50ZXJjZXB0LFxuICAvLyByaWdodC1ib3VuZGFyeS13cm9uZy1zaWRlLCBcdTIwMjYpIHNob3cgYSB0YXJnZXRlZCBudWRnZSBpbnN0ZWFkIG9mIHRoZSBnZW5lcmljXG4gIC8vIFwiTm90IHF1aXRlXCIgYWZ0ZXIgYSBjaGVjay4gRGVmYXVsdCBPTjsgYSB0ZWFjaGVyIGNhbiBzd2l0Y2ggdGhlbSBvZmYuIFRoZVxuICAvLyBjbGFzc2lmaWVyIGNhdGFsb2d1ZSArIG1lc3NhZ2VzIGxpdmUga2l0LXNpZGUgKGdyYXBoLXNjb3JlLnRzKSBcdTIwMTQgdGhpcyBmbGFnXG4gIC8vIG9ubHkgZ2F0ZXMgdGhlbS5cbiAgYnVpbHRpbkZlZWRiYWNrOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAvLyBBdXRob3JlZCBhbnRpY2lwYXRlZCBtaXN0YWtlcyBcdTIwMTQgdGhlIGdyYXBoIHR3aW4gb2YgQmxhbmtUb2tlbi5taXN0YWtlRmVlZGJhY2suXG4gIC8vIGBtYXRjaGAgaXMgYSBmcmVlZm9ybSBncmFwaCBhbnN3ZXIgaW4gdGhlIFNBTUUgc3ludGF4IHRoZSBhdXRob3JpbmcgZm9ybXVsYVxuICAvLyBmaWVsZCBhY2NlcHRzIChcIig0LCAzKVwiLCBcInkgPSB4ICsgMlwiLCBcInkgPCAyeCArIDFcIik7IHRoZSBraXQgcGFyc2VzIGl0IHdpdGhcbiAgLy8gdGhlIHNhbWUgcGFyc2VyIGFuZCBjb21wYXJlcyBhZ2FpbnN0IHRoZSBzdHVkZW50J3MgYW5zd2VyIHdpdGggdGhlIHNhbWVcbiAgLy8gdG9sZXJhbmNlcyBhcyBzY29yaW5nLiBGaXJzdCBtYXRjaCB3aW5zLCBhbmQgYW4gYXV0aG9yZWQgbWF0Y2ggYmVhdHMgYVxuICAvLyBidWlsdC1pbiBjbGFzc2lmaWVyLiBgZmVlZGJhY2tgIGlzIHJpY2ggaW5saW5lIGNvbnRlbnQsIHNob3duIChwb3N0LWNoZWNrXG4gIC8vIG9ubHkpIGluIHRoZSBibG9jaydzIGZlZWRiYWNrIGxpbmUuXG4gIC8vIGBtaXNjb25jZXB0aW9uSWRgIGJpbmRzIHRoZSBlbnRyeSB0byBhIG5hbWVkIG1pc2NvbmNlcHRpb24gKG9wYXF1ZVxuICAvLyBgbWlzLipgIHRhZyksIHNhbWUgY29udHJhY3QgYXMgQmxhbmtUb2tlbi5taXN0YWtlRmVlZGJhY2suXG4gIG1pc3Rha2VGZWVkYmFjazogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgbWF0Y2g6IHouc3RyaW5nKCksXG4gICAgZmVlZGJhY2s6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gICAgbWlzY29uY2VwdGlvbklkOiBNaXNjb25jZXB0aW9uSWQub3B0aW9uYWwoKSxcbiAgfSkpLmRlZmF1bHQoW10pLFxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIC8vIFZhcmlhYmxlIGJsb2NrIHNpemluZzogb3B0aW9uYWwgd2lkdGggZnJhY3Rpb24gKyBhbGlnbm1lbnQgKHNpemluZy50cykuXG4gIC8vIEF1dGhvci1zZXQgZGlzcGxheSBmb290cHJpbnQgZm9yIHRoZSBmaWd1cmU7IHJlbmRlcmVyIGhvbm9ycyBpdCB2aWEgdGhlXG4gIC8vIHNoYXJlZCAuYmxvY2stc2l6ZWQgcGF0aC4gQWRkaXRpdmUvb3B0aW9uYWwgXHUyMDE0IG5vIHNjaGVtYVZlcnNpb24gYnVtcC5cbiAgLi4uc2l6aW5nRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBJbnRlcmFjdGl2ZUdyYXBoQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBJbnRlcmFjdGl2ZUdyYXBoQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSwgTWlzY29uY2VwdGlvbklkIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuaW1wb3J0IHsgQXhpc0NvbmZpZywgRHJhd2FibGUgfSBmcm9tICcuL2ludGVyYWN0aXZlLWdyYXBoLmpzJztcblxuLy8gTXVsdGlwbGUtY2hvaWNlIHF1ZXN0aW9uIGJsb2NrLiBPbmUgcHJvbXB0LCAyKyBjaG9pY2VzLCByYWRpbyAoc2luZ2xlKSBvclxuLy8gY2hlY2tib3ggKFwic2VsZWN0IGFsbCB0aGF0IGFwcGx5XCIpIHZpYSBtdWx0aVNlbGVjdC4gU2NvcmVkIGFsbC1vci1ub3RoaW5nOlxuLy8gdGhlIHNlbGVjdGVkIHNldCBtdXN0IGVxdWFsIHRoZSBjb3JyZWN0IHNldCAocGVyLWNob2ljZSBwYXJ0aWFsIGNyZWRpdCwgaWZcbi8vIGV2ZXIgd2FudGVkLCBpcyBhIGZ1dHVyZSBhZGRpdGl2ZSBmbGFnKS5cbi8vXG4vLyBDaG9pY2UgY29udGVudCBpcyByaWNoIGlubGluZSAoZm9ybWF0dGVkIHRleHQgKyBpbmxpbmUgbWF0aCkgXHUyMDE0IHRoZSBzYW1lXG4vLyBhbHBoYWJldCBhcyBwcm9ibGVtIHByb3NlLCBzbyBtYXRoIGFuc3dlciBjaG9pY2VzIHJlbmRlciBwcm9wZXJseS4gUmljaGVyXG4vLyBjaG9pY2VzIGFyZSBBRERJVElWRSBGSUVMRFMgb24gTXVsdGlwbGVDaG9pY2VPcHRpb24sIG5vdCBhIHVuaW9uIHJld29yayBcdTIwMTRcbi8vIGRlY2lkZWQgYXQgZGVzaWduIHRpbWUsIGV4ZXJjaXNlZCAyMDI2LTA3LTEwIHdoZW4gdGhlIG9wdGlvbmFsIGBpbWFnZWAgYW5kXG4vLyBgZ3JhcGhgIGZpZ3VyZXMgbGFuZGVkIHdpdGhvdXQgYSBzY2hlbWFWZXJzaW9uIGJ1bXAuXG4vL1xuLy8gUGVyLWNob2ljZSBgZmVlZGJhY2tgIGlzIHRoZSBNQyBhbmFsb2d1ZSBvZiBhIGJsYW5rJ3MgbWlzdGFrZUZlZWRiYWNrOlxuLy8gZGlzdHJhY3RvcnMgYXJlIHVzdWFsbHkgYXV0aG9yZWQgQkVDQVVTRSB0aGV5J3JlIGFudGljaXBhdGVkIG1pc3Rha2VzLCBzb1xuLy8gZWFjaCBjaG9pY2UgY2FuIGNhcnJ5IGFuIGV4cGxhbmF0aW9uIHNob3duIHBvc3QtY2hlY2sgd2hlbiBpdCB3YXMgc2VsZWN0ZWQuXG4vL1xuLy8gQmxvY2stbGV2ZWwgZmllbGRzIG1pcnJvciBGaWxsSW5CbGFua0Jsb2NrIGZvciBwYXJpdHkgKHNvbHV0aW9uLCBza2lsbHMsXG4vLyB3b3JrU3BhY2UpIFx1MjAxNCBvbmUgcHJvYmxlbSBjaHJvbWUsIG9uZSBydW50aW1lIHRyZWF0bWVudCwgb25lIGRhc2hib2FyZCByb3dcbi8vIHNoYXBlLlxuLy9cbi8vIERlbGliZXJhdGVseSBOT1Qgc2NoZW1hLWVuZm9yY2VkOiBcImF0IGxlYXN0IG9uZSBjaG9pY2UgaXMgbWFya2VkIGNvcnJlY3QuXCJcbi8vIEEgbWlkLWVkaXQgZHJhZnQgKHRlYWNoZXIgaGFzbid0IHBpY2tlZCB0aGUgcmlnaHQgYW5zd2VyIHlldCkgbXVzdCBzdGlsbFxuLy8gYXV0b3NhdmU7IHRoZSBlZGl0b3Igc3VyZmFjZXMgdGhlIHdhcm5pbmcgaW5zdGVhZC4gQSB6ZXJvLWNvcnJlY3QgYmxvY2sgaXNcbi8vIHdlbGwtZGVmaW5lZCBhdCBydW50aW1lIChtdWx0aS1zZWxlY3Q6IHNlbGVjdGluZyBub3RoaW5nIGlzLi4uIHN0aWxsIGFuXG4vLyBvbWlzc2lvbjsgbm90aGluZyBzY29yZXMgY29ycmVjdCkgXHUyMDE0IHdyb25nIGF1dGhvcmluZywgbm90IGEgY3Jhc2guXG5cbi8vIE9wdGlvbmFsIGlsbHVzdHJhdGl2ZSBpbWFnZSBvbiBhIGNob2ljZSAoXCJ3aGljaCBkaWFncmFtIHNob3dzXHUyMDI2XCIpLiBNaXJyb3JzXG4vLyBEZWZpbml0aW9uSW1hZ2UgLyBQaGFzZS0xIEltYWdlQmxvY2s6IFVSTC1vbmx5LCBubyB1cGxvYWQgcGlwZWxpbmU7IGFsdFxuLy8gcmVxdWlyZWQgYnV0IGRlZmF1bHRpbmcgdG8gJycgZm9yIGRlY29yYXRpdmUgZmlndXJlcyAoZWRpdG9yIHdhcm5zKS5cbmV4cG9ydCBjb25zdCBDaG9pY2VJbWFnZSA9IHoub2JqZWN0KHtcbiAgc3JjOiB6LnN0cmluZygpLnVybCgpLFxuICBhbHQ6IHouc3RyaW5nKCkuZGVmYXVsdCgnJyksXG59KTtcbmV4cG9ydCB0eXBlIENob2ljZUltYWdlID0gei5pbmZlcjx0eXBlb2YgQ2hvaWNlSW1hZ2U+O1xuXG4vLyBPcHRpb25hbCBzdGF0aWMgZ3JhcGggb24gYSBjaG9pY2UgKFwid2hpY2ggZ3JhcGggc2hvd3NcdTIwMjZcIikuIFJldXNlcyB0aGVcbi8vIGludGVyYWN0aXZlLWdyYXBoIHZvY2FidWxhcnkgKEF4aXNDb25maWcgKyBkaXNwbGF5IERyYXdhYmxlcykgYnV0IGlzXG4vLyBkcmF3biBhcyBpbmxpbmUgU1ZHIGJ5IGdyYXBoLWtpdCdzIGtpdC1mcmVlIGBzdGF0aWMtc3ZnYCBlbmdpbmUgXHUyMDE0IG5ldmVyIHRoZVxuLy8gaW50ZXJhY3RpdmUga2l0LiBUaGUgdmlld2VyIHJlbmRlcnMgaXQgaW4gYGJsb2Nrcy9DaG9pY2VGaWd1cmUudHN4YCwgd2hpY2hcbi8vIGltcG9ydHMgdGhhdCBlbmdpbmUgTEFaSUxZIChtdWx0aXBsZV9jaG9pY2UgaXMgYW4gZWFnZXIgYmluZGluZywgc28gYSBzdGF0aWNcbi8vIGltcG9ydCB3b3VsZCBwdXQgdGhlIGVuZ2luZSBpbiB0aGUgc3R1ZGVudCBzaGVsbCkuIENvbnNlcXVlbmNlOiBgZXhwcmVzc2lvbmBcbi8vIGRyYXdhYmxlcyBuZWVkIHRoZSBraXQncyBwYXJzZXIgYW5kIGFyZSBOT1QgZHJhd247IHRoZSBlZGl0b3IgZG9lc24ndCBvZmZlclxuLy8gdGhlbSBoZXJlLiAqKFVudGlsIDIwMjYtMDgtMjIgdGhpcyBzYWlkIFwidGhlIHJlbmRlcmVyJ3MgZ3JhcGgtc3ZnIGVuZ2luZVwiIFx1MjAxNFxuLy8gYSBwYWNrYWdlIGRlbGV0ZWQgYXQgUzkgRHJvcCA0LCB3aGljaCBpcyB3aHkgbm90aGluZyByZW5kZXJlZCB0aGVzZSBmb3Jcbi8vIGVpZ2h0IGRheXMgd2hpbGUgdGhlIGZpZWxkLCB0aGUgZWRpdG9yIGNvbnRyb2wgYW5kIHRoZSBpbXBvcnRlciBhbGwgbGl2ZWRcbi8vIG9uLiBTZWUgZG9jcy9kZXNpZ24vY2hvaWNlLWZpZ3VyZXMtYW5kLW5lc3RlZC1saXN0cy5tZC4pKlxuZXhwb3J0IGNvbnN0IENob2ljZUdyYXBoID0gei5vYmplY3Qoe1xuICBheGlzOiBBeGlzQ29uZmlnLFxuICBkcmF3YWJsZXM6IHouYXJyYXkoRHJhd2FibGUpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBDaG9pY2VHcmFwaCA9IHouaW5mZXI8dHlwZW9mIENob2ljZUdyYXBoPjtcblxuZXhwb3J0IGNvbnN0IE11bHRpcGxlQ2hvaWNlT3B0aW9uID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIC8vIFJpY2ggaW5saW5lIGNvbnRlbnQgKGZvcm1hdHRlZCB0ZXh0ICsgaW5saW5lIG1hdGgpLiBOb24tZW1wdHkgaXMgYW5cbiAgLy8gZWRpdG9yIGNvbmNlcm4sIG5vdCBhIHNjaGVtYSBvbmUgKG1pZC1lZGl0IGRyYWZ0cyBtdXN0IHNhdmUpLlxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxuICBjb3JyZWN0OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgLy8gT3B0aW9uYWwgcGVyLWNob2ljZSBleHBsYW5hdGlvbiwgcmV2ZWFsZWQgcG9zdC1jaGVjayB3aGVuIHRoaXMgY2hvaWNlIHdhc1xuICAvLyBzZWxlY3RlZC4gUmljaCBpbmxpbmUgY29udGVudCwgbGlrZSBibGFuayBtaXN0YWtlRmVlZGJhY2sgZW50cmllcy5cbiAgZmVlZGJhY2s6IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgLy8gQmluZHMgYSBkaXN0cmFjdG9yIHRvIGEgbmFtZWQgbWlzY29uY2VwdGlvbiAob3BhcXVlIGBtaXMuKmAgdGFnOyB0aGVcbiAgLy8gdGF4b25vbXkgbGl2ZXMgaW4gdGhlIGF1dGhvcidzIGNhdGFsb2d1ZSBwcm9qZWN0KS4gUmV0dXJuZWQgb24gdGhlIGNoZWNrXG4gIC8vIHZlcmRpY3Qgd2hlbiB0aGUgc3R1ZGVudCBzZWxlY3RzIHRoaXMgY2hvaWNlIGFuZCBpdCBpcyB3cm9uZzsgdGhlIHN0b3JlZFxuICAvLyB2ZXJkaWN0cyByb3cgY2FycmllcyB0aGUgYWdncmVnYXRlIHNpZ25hbC4gTWVhbmluZ2xlc3Mgb24gYSBjb3JyZWN0XG4gIC8vIGNob2ljZSBcdTIwMTQgdGhlIGdyYWRlciBuZXZlciBlbWl0cyBpdCBmb3Igb25lLlxuICBtaXNjb25jZXB0aW9uSWQ6IE1pc2NvbmNlcHRpb25JZC5vcHRpb25hbCgpLFxuICAvLyBPcHRpb25hbCBmaWd1cmUgYmVsb3cgdGhlIGNob2ljZSB0ZXh0IFx1MjAxNCB0aGUgYWRkaXRpdmUgd2lkZW5pbmcgdGhlIGhlYWRlclxuICAvLyBjb21tZW50IHJlc2VydmVkLiBCb3RoIG1heSB0ZWNobmljYWxseSBjb2V4aXN0IChpbWFnZSByZW5kZXJzIGZpcnN0KTtcbiAgLy8gdGhlIGVkaXRvciBVSSB0cmVhdHMgdGhlbSBhcyBhIHNpbmdsZSBmaWd1cmUgc2xvdC5cbiAgaW1hZ2U6IENob2ljZUltYWdlLm9wdGlvbmFsKCksXG4gIGdyYXBoOiBDaG9pY2VHcmFwaC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNdWx0aXBsZUNob2ljZU9wdGlvbiA9IHouaW5mZXI8dHlwZW9mIE11bHRpcGxlQ2hvaWNlT3B0aW9uPjtcblxuZXhwb3J0IGNvbnN0IE11bHRpcGxlQ2hvaWNlQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdtdWx0aXBsZV9jaG9pY2UnKSxcbiAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLi4ubGFiZWxGaWVsZHMsXG4gIC8vIFRoZSBxdWVzdGlvbiBwcm9zZSAocmljaCBpbmxpbmUgY29udGVudCwgbGlrZSBhIHByb2JsZW0gc3RhdGVtZW50KS5cbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICBjaG9pY2VzOiB6LmFycmF5KE11bHRpcGxlQ2hvaWNlT3B0aW9uKS5taW4oMiksXG4gIC8vIGZhbHNlID0gc2luZ2xlIGFuc3dlciAocmFkaW9zLCBleGFjdGx5IG9uZSBzZWxlY3RhYmxlKTsgdHJ1ZSA9IFwic2VsZWN0XG4gIC8vIGFsbCB0aGF0IGFwcGx5XCIgKGNoZWNrYm94ZXMpLiBTY29yaW5nIGlzIHNldCBlcXVhbGl0eSBlaXRoZXIgd2F5LlxuICBtdWx0aVNlbGVjdDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIEtlZXAgdGhlIGF1dGhvcmVkIGNob2ljZSBvcmRlciBvbiBwYXBlciAoUzUuNSBEMTdBKS4gUHJpbnRlZCBWRVJTSU9OU1xuICAvLyBzaHVmZmxlIGNob2ljZXMgdG8gZGlzY291cmFnZSBjb3B5aW5nLCB3aGljaCBpcyB3cm9uZyBmb3IgYSBxdWVzdGlvbiB3aG9zZVxuICAvLyBvcmRlciBjYXJyaWVzIG1lYW5pbmcgXHUyMDE0IFwiYWxsIG9mIHRoZSBhYm92ZVwiIGhhcyB0byBzdGF5IGxhc3QsIGFuZCBcImJvdGggQVxuICAvLyBhbmQgQlwiIG5hbWVzIHBvc2l0aW9ucyBvdXRyaWdodC4gT3B0aW9uYWwgd2l0aCBubyBkZWZhdWx0IHNvIGEgZG9jdW1lbnRcbiAgLy8gd3JpdHRlbiBiZWZvcmUgdGhpcyByZS1zZXJpYWxpemVzIGJ5dGUtaWRlbnRpY2FsbHk7IGFic2VudCBtZWFucyBzaHVmZmxlLFxuICAvLyB3aGljaCBpcyB0aGUgcmlnaHQgZGVmYXVsdCBmb3IgdGhlIG92ZXJ3aGVsbWluZyBtYWpvcml0eSBvZiBxdWVzdGlvbnMuXG4gIGxvY2tDaG9pY2VPcmRlcjogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgLy8gV29ya2VkIGV4cGxhbmF0aW9uIGZvciB0aGUgd2hvbGUgcHJvYmxlbSwgcmV2ZWFsZWQgcG9zdC1jaGVjayByZWdhcmRsZXNzXG4gIC8vIG9mIGNvcnJlY3RuZXNzIChzYW1lIGNvbnRyYWN0IGFzIEZpbGxJbkJsYW5rQmxvY2suc29sdXRpb24pLlxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIC8vIFBlci1wcm9ibGVtIHByaW50IHdvcmstc3BhY2Ugb3ZlcnJpZGUgKHJlbSk7IGFic2VudCA9IGluaGVyaXQgdGhlXG4gIC8vIGFjdGl2aXR5LWxldmVsIGRlZmF1bHQgKHNlZSBGaWxsSW5CbGFua0Jsb2NrLndvcmtTcGFjZSBmb3IgdGhlIENTU1xuICAvLyBjdXN0b20tcHJvcGVydHkgcmVhc29uaW5nKS5cbiAgd29ya1NwYWNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNdWx0aXBsZUNob2ljZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgTXVsdGlwbGVDaG9pY2VCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuaW1wb3J0IHsgQ2hvaWNlSW1hZ2UsIENob2ljZUdyYXBoIH0gZnJvbSAnLi9tdWx0aXBsZS1jaG9pY2UuanMnO1xuXG4vLyBNYXRjaGluZyBxdWVzdGlvbiBibG9jay4gVHdvIGNvbHVtbnM6IGxlZnQgXCJpdGVtc1wiIChzdGVtcywgZG9jdW1lbnQgb3JkZXIpXG4vLyBhbmQgcmlnaHQgXCJ0YXJnZXRzXCIgKGxldHRlcmVkIEEsIEIsIENcdTIwMjYsIHNodWZmbGVkIGF0IHB1Ymxpc2ggdGltZSkuIFRoZVxuLy8gc3R1ZGVudCBkcmFncyBhIHRhcmdldCBjYXJkIG9udG8gYW4gaXRlbTsgdGhlIGNhcmQgZG9ja3MgbmV4dCB0byB0aGUgc3RlbS5cbi8vIERlc2lnbjogZG9jcy9kZXNpZ24vbWF0Y2hpbmctb3JkZXJpbmctcXVlc3Rpb25zLm1kIChkZWNpZGVkIDIwMjYtMDctMTApLlxuLy9cbi8vIERpc3RyYWN0b3JzOiB0YXJnZXRzIG1heSBleGNlZWQgaXRlbXMgXHUyMDE0IGFuIHVubWF0Y2hlZCB0YXJnZXQgaXMgc2ltcGx5XG4vLyByZWZlcmVuY2VkIGJ5IG5vIGtleSBlbnRyeS4gU2V2ZXJhbCBpdGVtcyBtYXkgc2hhcmUgb25lIHRhcmdldFxuLy8gKFwiY2F0ZWdvcml6YXRpb24tbGl0ZVwiOiBjbGFzc2lmeSBlYWNoIGV4cHJlc3Npb24gYXMgbGluZWFyL3F1YWRyYXRpYy9cbi8vIGV4cG9uZW50aWFsKSBcdTIwMTQgYWx3YXlzIGFsbG93ZWQ7IHRoZSBhbGxvd1RhcmdldFJldXNlIGdhdGUgd2FzIGRlbGV0ZWRcbi8vIDIwMjYtMDgtMjQgYWZ0ZXIgc2hpcHBpbmcgaW5lcnQgaW4gYm90aCBkaXJlY3Rpb25zLlxuLy9cbi8vIFNjb3JlZCBQRVIgUEFJUiAoZWFybmVkL3RvdGFsIFx1MjAxNCB0aGUgZnJhY3Rpb25hbCBDaGVja3BvaW50UmVzdWx0IHByZWNlZGVudFxuLy8gZnJvbSB3aXJlIHY0KTogZWFjaCBpdGVtIGlzIG9uZSBwb2ludCwgY29ycmVjdCB3aGVuIHRoZSBzdHVkZW50J3MgdGFyZ2V0XG4vLyBmb3IgaXQgZXF1YWxzIGtleVtpdGVtSWRdLiBCbG9jayBgY29ycmVjdGAgPSBldmVyeSBwYWlyIHJpZ2h0LiBObyBiaXBhcnRpdGVcbi8vIG1hY2hpbmVyeSBcdTIwMTQgdGhlIHN0dWRlbnQncyBwYWlyaW5nIElTIHRoZSBhc3NpZ25tZW50IChjb250cmFzdCBibGFuayBncm91cHMsXG4vLyB3aGVyZSB0eXBlZCB2YWx1ZXMgbXVzdCBiZSBtYXRjaGVkIHRvIHNsb3RzKS5cbi8vXG4vLyBGaWd1cmVzOiBpdGVtcyBhbmQgdGFyZ2V0cyBib3RoIHRha2UgdGhlIG9wdGlvbmFsIGltYWdlL2dyYXBoIGZpZ3VyZSBzbG90XG4vLyBzaGlwcGVkIGZvciBNQyBjaG9pY2VzIChDaG9pY2VJbWFnZS9DaG9pY2VHcmFwaCBcdTIwMTQgVVJMLW9ubHkgaW1hZ2U7IHN0YXRpY1xuLy8gZ3JhcGggdmlhIHRoZSByZW5kZXJlcidzIGtpdC1mcmVlIFNWRyBlbmdpbmUsIHNvIGBleHByZXNzaW9uYCBkcmF3YWJsZXMgYXJlXG4vLyBleGNsdWRlZCB0aGVyZSBhbmQgdGhlIGVkaXRvciBkb2Vzbid0IG9mZmVyIHRoZW0pLiBcIk1hdGNoIHRoZSBncmFwaCB0byBpdHNcbi8vIGVxdWF0aW9uXCIgaXMgdGhlIG1hcnF1ZWUgY2FzZS5cbi8vXG4vLyBEZWxpYmVyYXRlbHkgTk9UIHNjaGVtYS1lbmZvcmNlZDogXCJrZXkgY292ZXJzIGV2ZXJ5IGl0ZW1cIiAvIFwia2V5IHJlZmVyZW5jZXNcbi8vIHJlYWwgdGFyZ2V0cy5cIiBBIG1pZC1lZGl0IGRyYWZ0ICh0ZWFjaGVyIHN0aWxsIGFzc2lnbmluZyBhbnN3ZXJzKSBtdXN0XG4vLyBhdXRvc2F2ZTsgdGhlIGVkaXRvciBzdXJmYWNlcyB0aGUgd2FybmluZyBpbnN0ZWFkICh0aGUgTUMgemVyby1jb3JyZWN0XG4vLyBwcmVjZWRlbnQpLiBUaGUgcnVudGltZSB0cmVhdHMgYW4gaXRlbSBtaXNzaW5nIGZyb20gdGhlIGtleSBhcyBuZXZlclxuLy8gY29ycmVjdCBcdTIwMTQgd3JvbmcgYXV0aG9yaW5nLCBub3QgYSBjcmFzaC5cblxuZXhwb3J0IGNvbnN0IE1hdGNoaW5nSXRlbSA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAvLyBSaWNoIGlubGluZSBjb250ZW50IChmb3JtYXR0ZWQgdGV4dCArIGlubGluZSBtYXRoKS4gTm9uLWVtcHR5IGlzIGFuXG4gIC8vIGVkaXRvciBjb25jZXJuLCBub3QgYSBzY2hlbWEgb25lIChtaWQtZWRpdCBkcmFmdHMgbXVzdCBzYXZlKS5cbiAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgLy8gT3B0aW9uYWwgZmlndXJlIGJlbG93IHRoZSBpdGVtIHRleHQgKHNhbWUgc2luZ2xlLWZpZ3VyZS1zbG90IHRyZWF0bWVudFxuICAvLyBhcyBNQyBjaG9pY2VzOyBpbWFnZSByZW5kZXJzIGZpcnN0IGlmIGJvdGggYXJlIHNvbWVob3cgc2V0KS5cbiAgaW1hZ2U6IENob2ljZUltYWdlLm9wdGlvbmFsKCksXG4gIGdyYXBoOiBDaG9pY2VHcmFwaC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNYXRjaGluZ0l0ZW0gPSB6LmluZmVyPHR5cGVvZiBNYXRjaGluZ0l0ZW0+O1xuXG5leHBvcnQgY29uc3QgTWF0Y2hpbmdUYXJnZXQgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgaW1hZ2U6IENob2ljZUltYWdlLm9wdGlvbmFsKCksXG4gIGdyYXBoOiBDaG9pY2VHcmFwaC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNYXRjaGluZ1RhcmdldCA9IHouaW5mZXI8dHlwZW9mIE1hdGNoaW5nVGFyZ2V0PjtcblxuZXhwb3J0IGNvbnN0IE1hdGNoaW5nQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdtYXRjaGluZycpLFxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAuLi5sYWJlbEZpZWxkcyxcbiAgLy8gVGhlIHF1ZXN0aW9uIHByb3NlIChyaWNoIGlubGluZSBjb250ZW50LCBsaWtlIGEgcHJvYmxlbSBzdGF0ZW1lbnQpLlxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIC8vIExlZnQgY29sdW1uLCBkb2N1bWVudCBvcmRlci5cbiAgaXRlbXM6IHouYXJyYXkoTWF0Y2hpbmdJdGVtKS5taW4oMiksXG4gIC8vIFJpZ2h0IGNvbHVtbjsgbWF5IGV4Y2VlZCBpdGVtcyAoZXh0cmEgdGFyZ2V0cyBhcmUgZGlzdHJhY3RvcnMpLiBMZXR0ZXJzXG4gIC8vIGFyZSBhc3NpZ25lZCBieSBwb3NpdGlvbiBBRlRFUiB0aGUgcHVibGlzaC10aW1lIHNodWZmbGUsIG5ldmVyIGF1dGhvcmVkLlxuICB0YXJnZXRzOiB6LmFycmF5KE1hdGNoaW5nVGFyZ2V0KS5taW4oMiksXG4gIC8vIFRoZSBjb3JyZWN0IHBhaXJpbmc6IGl0ZW0gaWQgXHUyMTkyIHRhcmdldCBpZC4gUGFydGlhbCBkdXJpbmcgYXV0aG9yaW5nIChzZWVcbiAgLy8gaGVhZGVyKTsgbWFueS10by1vbmUgaXMgYWxsb3dlZCAodGhlIGdyYWRlcidzIGl0ZW1cdTIxOTJ0YXJnZXQga2V5IHNjb3JlcyBpdFxuICAvLyBuYXR1cmFsbHksIGFuZCB0aGUgdmlld2VyIG5ldmVyIHJlc3RyaWN0ZWQgZG9ja2luZyBhIHRhcmdldCB0d2ljZSkuXG4gIGtleTogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIHouc3RyaW5nKCkudXVpZCgpKSxcbiAgLy8gTUMtcGFyaXR5IHByb2JsZW0gY2hyb21lIChvbmUgcHJvYmxlbSBzaGFwZSwgb25lIGRhc2hib2FyZCByb3cgc2hhcGUpLlxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIHdvcmtTcGFjZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgTWF0Y2hpbmdCbG9jayA9IHouaW5mZXI8dHlwZW9mIE1hdGNoaW5nQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcblxuLy8gT3JkZXJpbmcgLyBzZXF1ZW5jaW5nIHF1ZXN0aW9uIGJsb2NrLiBUaGUgQVVUSE9SRUQgb3JkZXIgb2YgYGl0ZW1zYCBJUyB0aGVcbi8vIGNvcnJlY3Qgb3JkZXI7IHN0dWRlbnRzIHNlZSB0aGUgbGlzdCBzaHVmZmxlZCBhdCBwdWJsaXNoIHRpbWUgYW5kIGRyYWcgaXRcbi8vIGJhY2sgaW50byBzZXF1ZW5jZS4gRGVzaWduOiBkb2NzL2Rlc2lnbi9tYXRjaGluZy1vcmRlcmluZy1xdWVzdGlvbnMubWRcbi8vIChkZWNpZGVkIDIwMjYtMDctMTApLlxuLy9cbi8vIFNjb3JlZCBBTEwtT1ItTk9USElORyBvbiBleGFjdCBzZXF1ZW5jZSBlcXVhbGl0eSAoYXV0aG9yIGNhbGw6IHBhcnRpYWwtXG4vLyBjcmVkaXQgbWV0cmljcyBmb3Igb3JkZXJpbmdzIGFyZSBlaXRoZXIgbWlzbGVhZGluZyBcdTIwMTQgcG9zaXRpb24gbWF0Y2hlc1xuLy8gcHVuaXNoIGFuIG9mZi1ieS1vbmUgc2hpZnQgYWJzdXJkbHkgXHUyMDE0IG9yIG9wYXF1ZSB0byB0ZWFjaGVyczsgcmV2aXNpdCBvbmx5XG4vLyBvbiBvYnNlcnZlZCBkZW1hbmQpLiBJbnRlcmNoYW5nZWFibGUgYWRqYWNlbnQgaXRlbXM6IFlBR05JLCBhZGRpdGl2ZSBsYXRlci5cbi8vXG4vLyBBbiB1bnRvdWNoZWQgbGlzdCBpcyBhbiBPTUlTU0lPTiwgbm90IGFuIGFuc3dlcjogYSBzaHVmZmxlZCBsaXN0IGlzIGFsd2F5c1xuLy8gKnNvbWUqIHNlcXVlbmNlLCBzbyB0aGUgcnVudGltZSBvbmx5IHJlY29yZHMgYSByZXNwb25zZSBvbmNlIHRoZSBzdHVkZW50XG4vLyBoYXMgbW92ZWQgc29tZXRoaW5nLlxuLy9cbi8vIE5vIGZpZ3VyZSBzbG90IG9uIGl0ZW1zIGluIHYxIChubyBjbGVhciB1c2UgY2FzZSB5ZXQ7IGFkZGl0aXZlIGxhdGVyIFx1MjAxNFxuLy8gdGhlIE1DL21hdGNoaW5nIENob2ljZUltYWdlL0Nob2ljZUdyYXBoIHBhdHRlcm4gaXMgc2l0dGluZyB0aGVyZSkuXG5cbmV4cG9ydCBjb25zdCBPcmRlcmluZ0l0ZW0gPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgLy8gUmljaCBpbmxpbmUgY29udGVudCAoZm9ybWF0dGVkIHRleHQgKyBpbmxpbmUgbWF0aCkuIE5vbi1lbXB0eSBpcyBhblxuICAvLyBlZGl0b3IgY29uY2Vybiwgbm90IGEgc2NoZW1hIG9uZSAobWlkLWVkaXQgZHJhZnRzIG11c3Qgc2F2ZSkuXG4gIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG59KTtcbmV4cG9ydCB0eXBlIE9yZGVyaW5nSXRlbSA9IHouaW5mZXI8dHlwZW9mIE9yZGVyaW5nSXRlbT47XG5cbmV4cG9ydCBjb25zdCBPcmRlcmluZ0Jsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnb3JkZXJpbmcnKSxcbiAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLi4ubGFiZWxGaWVsZHMsXG4gIC8vIFRoZSBxdWVzdGlvbiBwcm9zZSAocmljaCBpbmxpbmUgY29udGVudCwgbGlrZSBhIHByb2JsZW0gc3RhdGVtZW50KS5cbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICAvLyBBdXRob3JlZCBvcmRlciA9IGNvcnJlY3Qgb3JkZXIuIFRoZSByZW5kZXJlciBzaHVmZmxlcyBkZXRlcm1pbmlzdGljYWxseVxuICAvLyAoc2VlZGVkIGJ5IGJsb2NrIGlkKSBmb3IgdGhlIHN0dWRlbnQtZmFjaW5nIGFycmFuZ2VtZW50LlxuICBpdGVtczogei5hcnJheShPcmRlcmluZ0l0ZW0pLm1pbigyKSxcbiAgLy8gTUMtcGFyaXR5IHByb2JsZW0gY2hyb21lIChvbmUgcHJvYmxlbSBzaGFwZSwgb25lIGRhc2hib2FyZCByb3cgc2hhcGUpLlxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIHdvcmtTcGFjZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgT3JkZXJpbmdCbG9jayA9IHouaW5mZXI8dHlwZW9mIE9yZGVyaW5nQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcbmltcG9ydCB7IEVuZHBvaW50U3R5bGUgfSBmcm9tICcuL2ludGVyYWN0aXZlLWdyYXBoLmpzJztcbmltcG9ydCB7IHNpemluZ0ZpZWxkcyB9IGZyb20gJy4uL3NpemluZy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBudW1iZXItbGluZS50cyBcdTIwMTQgdGhlIG51bWJlcl9saW5lIGJsb2NrICgxLUQgZ3JhZGVkLCBLLTggLyBlYXJseSBhbGdlYnJhKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSAxLUQgc2libGluZyBvZiBpbnRlcmFjdGl2ZV9ncmFwaC4gVGhlIHN0dWRlbnQncyBhbnN3ZXIgaXMgR0VPTUVUUklDIFx1MjAxNCBhXG4vLyBwb2ludCAob3Igc2V2ZXJhbCkgcGxvdHRlZCBvbiBhIHNpbmdsZSBudW1iZXIgbGluZSwgb3IgYW4gaW50ZXJ2YWwvcmF5IHdpdGhcbi8vIG9wZW4vY2xvc2VkIGVuZHBvaW50cyAoXCJncmFwaCB4ID49IC0yXCIpLiBTYW1lIHRocmVlIHN0cnVjdHVyYWwgY29uc2VxdWVuY2VzXG4vLyBhcyB0aGUgZ3JhcGggYmxvY2sgKHNlZSBkb2NzL2Rlc2lnbi9udW1iZXItbGluZS1ibG9jay5tZCk6IGEgc3RydWN0dXJlZFxuLy8gYW5zd2VyIHdpdGggaXRzIE9XTiBzdWJtaXNzaW9uIG1hcCAobnVtYmVyTGluZVJlc3BvbnNlcywgbm90IHRoZSBibGFua3MgbWFwKSxcbi8vIHRvbGVyYW5jZS1iYXNlZCBnZW9tZXRyaWMgc2NvcmluZyBkb25lIGJ5IHRoZSBsYXp5IGdyYXBoLWtpdCAobm90IHRoZVxuLy8gcnVudGltZSdzIHN0cmluZyBzdHJhdGVnaWVzKSwgYW5kIGEgd2lkZ2V0IHRoYXQgcmlkZXMgQGFjdGl2aXR5L2dyYXBoLWtpdC5cbi8vXG4vLyBBIFNFUEFSQVRFIGJsb2NrIGZhbWlseSwgbm90IGEgR3JhcGhJbnRlcmFjdGlvbiB2YXJpYW50IChhdXRob3IgY2FsbCwgU1RBVEVcbi8vIDIwMjYtMDctMTApOiBudW1iZXIgbGluZXMgYXJlIDEtRCBhbmQgbXVzdCBub3QgYmUgZm9yY2VkIHVuZGVyIHRoZSBncmFwaFxuLy8gYmxvY2sncyAyLUQgQXhpc0NvbmZpZy4gRW5kcG9pbnRTdHlsZSBpcyBzaGFyZWQgZnJvbSBpbnRlcmFjdGl2ZS1ncmFwaC50cyBcdTIwMTRcbi8vIGl0IHdhcyByZXNlcnZlZCB0aGVyZSBcImZvciB0aGUgZnV0dXJlIG51bWJlci1saW5lIGZhbWlseVwiIGZyb20gRHJvcCAyLlxuLy9cbi8vIFNsaWNlIDEgc2hpcHMgVFdPIGludGVyYWN0aW9ucyAocGxvdF9wb2ludCwgcGxvdF9pbnRlcnZhbCksIGRpc2NyaW1pbmF0ZWQgb25cbi8vIGB0eXBlYCBmcm9tIGRheSBvbmUgc28gcGxvdF9yYXkgLyBkaXNwbGF5IHNsb3QgaW4gYWRkaXRpdmVseSBsYXRlciwgZXhhY3RseVxuLy8gaG93IEdyYXBoSW50ZXJhY3Rpb24gZ3Jvd3MuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyAtLS0tIExpbmUgY29uZmlndXJhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIDEtRCBhbmFsb2d1ZSBvZiBBeGlzQ29uZmlnLiBMaW5lIHVuaXRzIHRocm91Z2hvdXQgXHUyMDE0IHRvbGVyYW5jZSBhbmQgdGlja1xuLy8gc3RlcHMgYXJlIGluIHRoZSBzYW1lIHVuaXRzLCBuZXZlciBwaXhlbHMsIHNvIGEgcGFnZSB0aGF0IHJlLWxheXMtb3V0IGF0IGFcbi8vIGRpZmZlcmVudCB3aWR0aCBzdGlsbCBzY29yZXMgaWRlbnRpY2FsbHkuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUNvbmZpZyA9IHoub2JqZWN0KHtcbiAgbWluOiB6Lm51bWJlcigpLFxuICBtYXg6IHoubnVtYmVyKCksXG4gIC8vIFNwYWNpbmcgYmV0d2VlbiBMQUJFTEVEIHRpY2tzIChsaW5lIHVuaXRzKS5cbiAgdGlja1N0ZXA6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5kZWZhdWx0KDEpLFxuICAvLyBVbmxhYmVsZWQgbWlub3IgdGlja3MgZHJhd24gYmV0d2VlbiBlYWNoIHBhaXIgb2YgbGFiZWxlZCB0aWNrcyAoMCA9IG5vbmUpLlxuICAvLyBWaXN1YWwgb25seSBcdTIwMTQgbmV2ZXIgc2NvcmVkLlxuICBtaW5vclRpY2tzUGVyU3RlcDogei5udW1iZXIoKS5pbnQoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMCksXG4gIC8vIFdoZW4gdHJ1ZSwgYSBkcmFnZ2VkIGhhbmRsZSBzbmFwcyB0byB0aGUgbmVhcmVzdCB0aWNrIChtaW5vciBpZiBwcmVzZW50LFxuICAvLyBlbHNlIHRoZSBsYWJlbGVkIHN0ZXApLiBLZXlib2FyZCBudWRnZSBhbHdheXMgbW92ZXMgYnkgb25lIHRpY2sgcmVnYXJkbGVzc1xuICAvLyAoU2hpZnQgPSBmaW5lLCBvbmUtdGVudGggb2YgYSB0aWNrKS5cbiAgc25hcFRvVGljazogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbn0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZUNvbmZpZyA9IHouaW5mZXI8dHlwZW9mIE51bWJlckxpbmVDb25maWc+O1xuXG4vLyAtLS0tIEludGVyYWN0aW9uIHZhcmlhbnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gcGxvdF9wb2ludDogdGhlIHN0dWRlbnQgcGxhY2VzIG9uZSBvciBtb3JlIHBvaW50cyBvbiB0aGUgbGluZS4gTXVsdGktcG9pbnRcbi8vIChcInBsb3QgLTIgYW5kIDVcIikgaXMgc2NvcmVkIGNvbnN1bWUtb25jZSwgYWxsLW9yLW5vdGhpbmcgXHUyMDE0IGV2ZXJ5IGNvcnJlY3Rcbi8vIHBvc2l0aW9uIG11c3QgYmUgbWF0Y2hlZCAobWlycm9ycyB0aGUgZ3JhcGggYmxvY2sncyBOLWhhbmRsZSBwbG90X3BvaW50KS5cbmV4cG9ydCBjb25zdCBOdW1iZXJMaW5lUG9pbnRJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X3BvaW50JyksXG4gIC8vIENvcnJlY3QgcG9zaXRpb25zIGluIGxpbmUgdW5pdHMuIEEgc2luZ2xlIHBvaW50IGlzIHRoZSBjb21tb24gY2FzZS5cbiAgY29ycmVjdFBvaW50czogei5hcnJheSh6Lm51bWJlcigpKS5taW4oMSksXG4gIC8vIE1hdGNoIHJhZGl1cyBpbiBsaW5lIHVuaXRzIChhIHBvaW50IGlzIGNvcnJlY3Qgd2l0aGluICsvLSB0b2xlcmFuY2UpLlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uXG4+O1xuXG4vLyBBbiBpbnRlcnZhbCBvciByYXkgb24gdGhlIGxpbmUuIEEgcHJlc2VudCBib3VuZCBjYXJyaWVzIGFuIG9wZW4vY2xvc2VkIHN0eWxlXG4vLyAodGhlIGluZXF1YWxpdHkgZGlzdGluY3Rpb246IHggPiAzIG9wZW4gdnMgeCA+PSAzIGNsb3NlZCkuIEFuIEFCU0VOVCBib3VuZCBpc1xuLy8gdW5ib3VuZGVkIHRoYXQgZGlyZWN0aW9uIFx1MjAxNCBzbyBhIHJheSBpcyBqdXN0IGFuIGludGVydmFsIHdpdGggb25lIHNpZGUgb21pdHRlZFxuLy8gKFwieCA+PSAzXCIgPSBtaW4gMyBjbG9zZWQsIG5vIG1heDsgXCJ4IDwgNVwiID0gbWF4IDUgb3Blbiwgbm8gbWluKS4gVGhlIHNoYWRlZFxuLy8gcmVnaW9uIGlzIHVuYW1iaWd1b3VzIGZyb20gd2hpY2ggYm91bmRzIGFyZSBwcmVzZW50LCBzbyBubyBzZXBhcmF0ZSBzaWRlIGZsYWdcbi8vIGlzIG5lZWRlZCAodW5saWtlIHRoZSAyLUQgZ3JhcGggaW5lcXVhbGl0eSkuIEF0IGxlYXN0IG9uZSBib3VuZCBtdXN0IGJlXG4vLyBwcmVzZW50IChhIHR3by1zaWRlZC11bmJvdW5kZWQgaW50ZXJ2YWwgaXMgdGhlIHdob2xlIGxpbmUgXHUyMDE0IG1lYW5pbmdsZXNzKTsgdGhlXG4vLyBmYWN0b3J5ICsgYXV0aG9yIFVJIGd1YXJhbnRlZSBpdCBhbmQgdGhlIHNjb3JlciBhc3N1bWVzIGl0LlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVJbnRlcnZhbCA9IHoub2JqZWN0KHtcbiAgbWluOiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIG1pblN0eWxlOiBFbmRwb2ludFN0eWxlLm9wdGlvbmFsKCksXG4gIG1heDogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBtYXhTdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBOdW1iZXJMaW5lSW50ZXJ2YWwgPSB6LmluZmVyPHR5cGVvZiBOdW1iZXJMaW5lSW50ZXJ2YWw+O1xuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9pbnRlcnZhbCcpLFxuICBjb3JyZWN0SW50ZXJ2YWw6IE51bWJlckxpbmVJbnRlcnZhbCxcbiAgLy8gTWF0Y2ggcmFkaXVzIGluIGxpbmUgdW5pdHMsIGFwcGxpZWQgdG8gZWFjaCBwcmVzZW50IGVuZHBvaW50LlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVJbnRlcnZhbEludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIE51bWJlckxpbmVJbnRlcnZhbEludGVyYWN0aW9uXG4+O1xuXG4vLyBEaXNjcmltaW5hdGVkIG9uIGB0eXBlYCBzbyBjb25zdW1lcnMgYnJhbmNoIHVuaWZvcm1seSBhbmQgdGhlIHdpcmUgZm9ybWF0XG4vLyBhbHdheXMgY2FycmllcyBpdC4gR3Jvd2luZyBhIHZhcmlhbnQgaXMgYSBuZXcgbWVtYmVyIGhlcmUgKyBhIG5ldyBzY29yZXJcbi8vIGJyYW5jaCBpbiB0aGUga2l0IFx1MjAxNCBubyBvdGhlciBibG9jayB0b3VjaGVkLlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVJbnRlcmFjdGlvbiA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBOdW1iZXJMaW5lUG9pbnRJbnRlcmFjdGlvbixcbiAgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb24sXG5dKTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIE51bWJlckxpbmVJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gVGhlIGJsb2NrIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBdXRvLW51bWJlcmVkIGxpa2UgdGhlIG90aGVyIHF1ZXN0aW9uIGJsb2Nrcy4gc2tpbGxzICsgc29sdXRpb24gZm9sbG93IHRoZVxuLy8gc2FtZSBvcHQtaW4gcGF0dGVybnMgRmlsbEluQmxhbmtCbG9jayAvIEludGVyYWN0aXZlR3JhcGggZXN0YWJsaXNoZWQuXG4vLyBEZWxpYmVyYXRlbHkgTEVBTiBmb3Igc2xpY2UgMSAobm8gYWxsb3dOb1NvbHV0aW9uIC8gbWlzdGFrZUZlZWRiYWNrKSBcdTIwMTRcbi8vIGFsbC1vci1ub3RoaW5nIHNjb3JpbmcgKGRlc2lnbiBkZWNpc2lvbiA2KTsgdGhvc2UgZmllbGRzIGFyZSBhZGRpdGl2ZSBsYXRlclxuLy8gaWYgYXNrZWQgZm9yIChZQUdOSSksIGV4YWN0bHkgYXMgdGhlIGdyYXBoIGJsb2NrIHJlc2VydmVkIHRoZW0gYWNyb3NzIGRyb3BzLlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ251bWJlcl9saW5lJyksXG4gIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC4uLmxhYmVsRmllbGRzLFxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGNvbmZpZzogTnVtYmVyTGluZUNvbmZpZyxcbiAgaW50ZXJhY3Rpb246IE51bWJlckxpbmVJbnRlcmFjdGlvbixcbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICAvLyBWYXJpYWJsZSBibG9jayBzaXppbmc6IG9wdGlvbmFsIHdpZHRoIGZyYWN0aW9uICsgYWxpZ25tZW50IChzaXppbmcudHMpLlxuICAvLyBBZGRpdGl2ZS9vcHRpb25hbCBcdTIwMTQgbm8gc2NoZW1hVmVyc2lvbiBidW1wLlxuICAuLi5zaXppbmdGaWVsZHMsXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVCbG9jayA9IHouaW5mZXI8dHlwZW9mIE51bWJlckxpbmVCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuaW1wb3J0IHsgTnVtYmVyTGluZUNvbmZpZyB9IGZyb20gJy4vbnVtYmVyLWxpbmUuanMnO1xuaW1wb3J0IHsgc2l6aW5nRmllbGRzIH0gZnJvbSAnLi4vc2l6aW5nLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGRhdGEtcGxvdC50cyBcdTIwMTQgdGhlIGRhdGFfcGxvdCBibG9jayAoc3RhdGlzdGljcyBjaGFydHMpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHN0YXRpc3RpY3Mgc2libGluZyBvZiBpbnRlcmFjdGl2ZV9ncmFwaCAoMi1EIGZ1bmN0aW9ucykgYW5kIG51bWJlcl9saW5lXG4vLyAoMS1EIGdlb21ldHJ5KS4gQSBkYXRhX3Bsb3QgcmVuZGVycyBhIGRvdCBwbG90LCBoaXN0b2dyYW0sIG9yIGJveCBwbG90IGZyb20gYVxuLy8gZGF0YXNldCBcdTIwMTQgZWl0aGVyIGFzIGEgc3RhdGljIFNUSU1VTFVTIHRoZSBzdHVkZW50IHJlYWRzIChcIndoYXQgaXMgdGhlIG1lZGlhblxuLy8gb2YgdGhpcyBib3ggcGxvdD9cIiwgcGFpcmVkIHdpdGggYSBzaWJsaW5nIG51bWVyaWMvTUMgYmxvY2spIG9yIGFzIGEgZ3JhZGVkXG4vLyBDT05TVFJVQ1RJT04gdGhlIHN0dWRlbnQgYnVpbGRzIChcIm1ha2UgYSBkb3QgcGxvdCBvZiB0aGVzZSB2YWx1ZXNcIikuXG4vL1xuLy8gQSBTRVBBUkFURSBibG9jayBmYW1pbHksIG5vdCBhIEdyYXBoSW50ZXJhY3Rpb24gdmFyaWFudCAodGF4b25vbXkgZml4ZWRcbi8vIDIwMjYtMDctMTAsIFNUQVRFKTogc3RhdHMgY2hhcnRzIGFyZSB0aGVpciBvd24gc2hhcGUgYW5kIG11c3Qgbm90IGJlIGZvcmNlZFxuLy8gdW5kZXIgdGhlIGdyYXBoIGJsb2NrJ3MgMi1EIEF4aXNDb25maWcuIERlc2lnbiArIDkgZGVjaXNpb25zIGluXG4vLyBkb2NzL2Rlc2lnbi9kYXRhLXBsb3QtYmxvY2subWQgKGF1dGhvciBhcHByb3ZlZCB0aGUgcmVjb21tZW5kZWQgYW5zd2VycykuXG4vL1xuLy8gVEhFIEFOU1dFUiBJUyBDT01QVVRFRCBGUk9NIFRIRSBEQVRBIChkZXNpZ24gZGVjaXNpb24gM2EpOiBhIGRvdCBwbG90LFxuLy8gaGlzdG9ncmFtLCBhbmQgYm94IHBsb3QgYXJlIGVhY2ggYSBkZXRlcm1pbmlzdGljIGZ1bmN0aW9uIG9mIGBkYXRhYCwgc28gdGhlXG4vLyBhdXRob3IgZW50ZXJzIHRoZSByYXcgZGF0YXNldCBPTkNFIGFuZCB0aGUgY29ycmVjdCBwbG90IGlzIGRlcml2ZWQgYnkgdGhlIGtpdFxuLy8gc2NvcmVyIFx1MjAxNCB0aGVyZSBpcyBubyBzZXBhcmF0ZWx5LWF1dGhvcmVkIGFuc3dlciBrZXkgdG8gZHJpZnQgZnJvbSB0aGUgZGF0YS5cbi8vIFRoZSBzYW1lIGBkYXRhYCByZW5kZXJzIHRoZSBjaGFydCBpbiBkaXNwbGF5IG1vZGUgYW5kIGlzIHRoZSBzb3VyY2UgdGhlXG4vLyBzdHVkZW50IHBsb3RzIChhbmQgdGhlIGtleSBpdCdzIHNjb3JlZCBhZ2FpbnN0KSBpbiBidWlsZCBtb2RlLlxuLy9cbi8vIFNsaWNlIDEgc2hpcHMgVFdPIGludGVyYWN0aW9ucyBcdTIwMTQgYGRpc3BsYXlgIChhbGwgdGhyZWUgY2hhcnQgdHlwZXMsIHVuZ3JhZGVkXG4vLyBzdGltdWx1cykgYW5kIGBidWlsZF9kb3RwbG90YCAodGhlIHNpbXBsZXN0IGdyYWRlZCBjb25zdHJ1Y3Rpb24pIFx1MjAxNFxuLy8gZGlzY3JpbWluYXRlZCBvbiBgdHlwZWAgZnJvbSBkYXkgb25lIHNvIGBidWlsZF9oaXN0b2dyYW1gIC8gYGJ1aWxkX2JveHBsb3RgXG4vLyBzbG90IGluIGFkZGl0aXZlbHkgbGF0ZXIsIGV4YWN0bHkgaG93IEdyYXBoSW50ZXJhY3Rpb24gYW5kIE51bWJlckxpbmVJbnRlcmFjdGlvblxuLy8gZ3Jvdy4gU2FtZSB0aHJlZSBzdHJ1Y3R1cmFsIGNvbnNlcXVlbmNlcyBhcyB0aGUgZ3JhcGgvbnVtYmVyLWxpbmUgYmxvY2tzOiBhXG4vLyBzdHJ1Y3R1cmVkIGFuc3dlciB3aXRoIGl0cyBPV04gc3VibWlzc2lvbiBtYXAgKGRhdGFQbG90UmVzcG9uc2VzLCBub3QgdGhlXG4vLyBibGFua3MgbWFwKSwgZnJlcXVlbmN5L3N1bW1hcnkgc2NvcmluZyBkb25lIGJ5IHRoZSBsYXp5IGdyYXBoLWtpdCAobm90IHRoZVxuLy8gcnVudGltZSdzIHN0cmluZyBzdHJhdGVnaWVzKSwgYW5kIGEgd2lkZ2V0IHRoYXQgcmlkZXMgQGFjdGl2aXR5L2dyYXBoLWtpdC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIC0tLS0gQ2hhcnQgY29uZmlndXJhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgbnVtZXJpYyBheGlzIGlzIHJldXNlZCBWRVJCQVRJTSBmcm9tIE51bWJlckxpbmVDb25maWcgKGRlc2lnbiBkZWNpc2lvbiA1KTpcbi8vIGEgZG90IHBsb3Qgc3RhY2tzIGRvdHMgYWJvdmUgdGhlaXIgdmFsdWUgb24gYSAxLUQgbnVtYmVyIGxpbmUsIGFuZCBhIGJveCBwbG90XG4vLyBzaXRzIG9uIHRoYXQgc2FtZSBheGlzLCBzbyB0aGUgdGljay9taW5vci9zbmFwIHNlbWFudGljcyBhcmUgaWRlbnRpY2FsLiBUaGVcbi8vIGhpc3RvZ3JhbS1vbmx5IGV4dHJhcyAoZXF1YWwtd2lkdGggYmlucyArIGFuIG9wdGlvbmFsIHktc2NhbGUgY2VpbGluZykgYXJlXG4vLyBjb25zdWx0ZWQgb25seSB3aGVuIHRoZSBjaGFydCBpcyBhIGhpc3RvZ3JhbTsgdW5lcXVhbC1iaW4gYGJpbkVkZ2VzYCBpcyBhXG4vLyBkb2N1bWVudGVkIGxhdGVyIGxldmVyIChZQUdOSSBpbiBzbGljZSAxKS5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdENvbmZpZyA9IE51bWJlckxpbmVDb25maWcuZXh0ZW5kKHtcbiAgLy8gRXF1YWwtd2lkdGggYmluIHNpemUgc3Bhbm5pbmcgW21pbiwgbWF4XTsgb25seSByZWFkIHdoZW4gY2hhcnQgPT1cbiAgLy8gJ2hpc3RvZ3JhbScuIEFic2VudCBcdTIxOTIgdGhlIGhpc3RvZ3JhbSBmYWxscyBiYWNrIHRvIGB0aWNrU3RlcGAgYXMgdGhlIGJpblxuICAvLyB3aWR0aC4gUG9zaXRpdmUuXG4gIGJpbldpZHRoOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLy8gRml4ZWQgY2VpbGluZyBmb3IgdGhlIGhpc3RvZ3JhbS9kb3QtcGxvdCB2ZXJ0aWNhbCBzY2FsZS4gQWJzZW50IFx1MjE5MiB0aGVcbiAgLy8gc2NhbGUgYXV0by1maXRzIHRoZSB0YWxsZXN0IGJhci9zdGFjayBmcm9tIGBkYXRhYC4gQSBmaXhlZCB2YWx1ZSBrZWVwc1xuICAvLyBzZXZlcmFsIHBsb3RzIG9uIGEgcGFnZSB2aXN1YWxseSBjb21wYXJhYmxlLiBQb3NpdGl2ZSBpbnRlZ2VyIChmcmVxdWVuY3kpLlxuICBtYXhGcmVxdWVuY3k6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdENvbmZpZyA9IHouaW5mZXI8dHlwZW9mIERhdGFQbG90Q29uZmlnPjtcblxuLy8gVGhlIGNoYXJ0IHNoYXBlLiBTaGFyZWQgYnkgdGhlIGBkaXNwbGF5YCBtZW1iZXIgKHdoaWNoIG9uZSB0byByZW5kZXIpIGFuZFxuLy8gaW1wbGllZCBieSBlYWNoIGBidWlsZF8qYCBtZW1iZXIuIE5hbWVkIGJ5IHNoYXBlLCBub3QgYnkgZ3JhZGUgYmFuZC5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdENoYXJ0ID0gei5lbnVtKFsnZG90cGxvdCcsICdoaXN0b2dyYW0nLCAnYm94cGxvdCddKTtcbmV4cG9ydCB0eXBlIERhdGFQbG90Q2hhcnQgPSB6LmluZmVyPHR5cGVvZiBEYXRhUGxvdENoYXJ0PjtcblxuLy8gLS0tLSBJbnRlcmFjdGlvbiB2YXJpYW50cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGRpc3BsYXk6IGEgc3RhdGljLCB1bmdyYWRlZCBjaGFydCBvZiBgZGF0YWAgXHUyMDE0IGEgc3RpbXVsdXMgdGhlIHN0dWRlbnQgcmVhZHMuXG4vLyBMaWtlIGludGVyYWN0aXZlX2dyYXBoJ3MgYGRpc3BsYXlgIG1lbWJlciBpdCBwdWxscyBubyBwcm9ibGVtIG51bWJlciwgaXNcbi8vIG5ldmVyIHNjb3JlZCwgYW5kIG5ldmVyIGpvaW5zIHRoZSBzdWJtaXNzaW9uIHBheWxvYWQ7IGEgXCJyZWFkIHRoaXMgY2hhcnQgdGhlblxuLy8gYW5zd2VyXCIgdGFzayBjb21wb3NlcyBhIGRpc3BsYXkgZGF0YV9wbG90IHdpdGggYSBzaWJsaW5nIG51bWVyaWMvTUMgYmxvY2tcbi8vICh0aGUgcGF0dGVybiB0aGF0IHJlcGxhY2VkIHRoZSByZXRpcmVkIGFuc3dlci1zdXJmYWNlLWFzLWEtZmllbGQgc2VhbSkuXG5leHBvcnQgY29uc3QgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnZGlzcGxheScpLFxuICBjaGFydDogRGF0YVBsb3RDaGFydCxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb25cbj47XG5cbi8vIGJ1aWxkX2RvdHBsb3Q6IHRoZSBzdHVkZW50IHN0YWNrcyBkb3RzIGFib3ZlIHRoZSBheGlzIHRvIHJlcHJvZHVjZSB0aGVcbi8vIGZyZXF1ZW5jeSBkaXN0cmlidXRpb24gb2YgYGRhdGFgLiBTY29yZWQgYWxsLW9yLW5vdGhpbmcgb24gZnJlcXVlbmN5LW1hcFxuLy8gZXF1YWxpdHkgKGRlc2lnbiBkZWNpc2lvbiA4KSBcdTIwMTQgZG90IHZhbHVlcyBhcmUgZGlzY3JldGUgKHRoZSB3aWRnZXQgc25hcHMgZWFjaFxuLy8gZG90IHRvIGEgdGljayksIHNvIHRoZSBjb21wYXJpc29uIGlzIGV4YWN0LCBubyB0b2xlcmFuY2UgZmllbGQuIFRoZSBjb3JyZWN0XG4vLyBkaXN0cmlidXRpb24gaXMgQ09NUFVURUQgZnJvbSBgZGF0YWAgKGRlY2lzaW9uIDNhKTsgbm90aGluZyB0byBhdXRob3IgaGVyZVxuLy8gYmV5b25kIHRoZSBkYXRhc2V0IGl0c2VsZiwgc28gdGhpcyBpcyBhIGJhcmUgbWFya2VyIHZhcmlhbnQgdGhhdCBncm93c1xuLy8gYnVpbGRfaGlzdG9ncmFtIC8gYnVpbGRfYm94cGxvdCBzaWJsaW5ncyBsYXRlci5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdERvdHBsb3RJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdidWlsZF9kb3RwbG90JyksXG59KTtcbmV4cG9ydCB0eXBlIERhdGFQbG90RG90cGxvdEludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIERhdGFQbG90RG90cGxvdEludGVyYWN0aW9uXG4+O1xuXG4vLyBidWlsZF9oaXN0b2dyYW06IHRoZSBzdHVkZW50IHNldHMgZWFjaCBiYXIncyBmcmVxdWVuY3kgdG8gcmVwcm9kdWNlIHRoZVxuLy8gaGlzdG9ncmFtIG9mIGBkYXRhYCAoYmlubmVkIGJ5IGNvbmZpZy5iaW5XaWR0aCBvdmVyIFttaW4sbWF4XSkuIFNjb3JlZFxuLy8gYWxsLW9yLW5vdGhpbmcgb24gZXhhY3QgcGVyLWJpbiBpbnRlZ2VyLWZyZXF1ZW5jeSBlcXVhbGl0eSAoYSBiYXIgaXMgYSB3aG9sZVxuLy8gY291bnQgXHUyMDE0IG5vIHRvbGVyYW5jZSksIHRoZSBmcmVxdWVuY3ktZGlzdHJpYnV0aW9uIHR3aW4gb2YgYnVpbGRfZG90cGxvdC4gVGhlXG4vLyBjb3JyZWN0IGhlaWdodHMgYXJlIENPTVBVVEVEIGZyb20gYGRhdGFgLCBzbyB0aGlzIHRvbyBpcyBhIGJhcmUgbWFya2VyIHZhcmlhbnQuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RIaXN0b2dyYW1JbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdidWlsZF9oaXN0b2dyYW0nKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RIaXN0b2dyYW1JbnRlcmFjdGlvbiA9IHouaW5mZXI8XG4gIHR5cGVvZiBEYXRhUGxvdEhpc3RvZ3JhbUludGVyYWN0aW9uXG4+O1xuXG4vLyBidWlsZF9ib3hwbG90OiB0aGUgc3R1ZGVudCBkcmFncyB0aGUgZml2ZS1udW1iZXItc3VtbWFyeSBoYW5kbGVzIChtaW4sIFExLFxuLy8gbWVkaWFuLCBRMywgbWF4KSB0byBidWlsZCB0aGUgYm94ICsgd2hpc2tlcnMgb2YgYGRhdGFgLiBTY29yZWQgYWxsLW9yLW5vdGhpbmdcbi8vIHdpdGggZWFjaCBoYW5kbGUgd2l0aGluIGB0b2xlcmFuY2VgIGxpbmUgdW5pdHMgb2YgdGhlIGNvbXB1dGVkIHN1bW1hcnkuIFVubGlrZVxuLy8gdGhlIGZyZXF1ZW5jeSBidWlsZHMgdGhpcyBjYXJyaWVzIGEgdG9sZXJhbmNlIGJlY2F1c2UgYm94IHBvc2l0aW9ucyBhcmVcbi8vIGNvbnRpbnVvdXMgYW5kIHRoZSB0d28gY29tbW9uIHF1YXJ0aWxlIG1ldGhvZHMgY2FuIGRpZmZlciBieSBhIGRhdGEgcG9pbnQgb25cbi8vIGV2ZW4tbGVuZ3RoIHNldHMgXHUyMDE0IHRoZSBrZXkgdXNlcyB0aGUgVEktODQgZXhjbHVzaXZlLW1lZGlhbiBtZXRob2QgKGxvY2tlZCxcbi8vIGRlc2lnbiBkZWNpc2lvbiA0KSBhbmQgdGhlIHRvbGVyYW5jZSBhYnNvcmJzIHRoZSBhZGphY2VudC1tZXRob2QgYW5zd2VyLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90Qm94cGxvdEludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2J1aWxkX2JveHBsb3QnKSxcbiAgLy8gTWF0Y2ggcmFkaXVzIGluIGxpbmUgdW5pdHMsIGFwcGxpZWQgdG8gZWFjaCBvZiB0aGUgZml2ZSBoYW5kbGVzLiBEZWZhdWx0XG4gIC8vIGhhbGYgYSB1bml0IHRpY2suXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC41KSxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RCb3hwbG90SW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgRGF0YVBsb3RCb3hwbG90SW50ZXJhY3Rpb25cbj47XG5cbi8vIERpc2NyaW1pbmF0ZWQgb24gYHR5cGVgIHNvIGNvbnN1bWVycyBicmFuY2ggdW5pZm9ybWx5IGFuZCB0aGUgd2lyZSBmb3JtYXRcbi8vIGFsd2F5cyBjYXJyaWVzIGl0LiBHcm93aW5nIGEgdmFyaWFudCBpcyBhIG5ldyBtZW1iZXIgaGVyZSArIGEgbmV3IHNjb3JlclxuLy8gYnJhbmNoIGluIHRoZSBraXQgXHUyMDE0IG5vIG90aGVyIGJsb2NrIHRvdWNoZWQuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RJbnRlcmFjdGlvbiA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBEYXRhUGxvdERpc3BsYXlJbnRlcmFjdGlvbixcbiAgRGF0YVBsb3REb3RwbG90SW50ZXJhY3Rpb24sXG4gIERhdGFQbG90SGlzdG9ncmFtSW50ZXJhY3Rpb24sXG4gIERhdGFQbG90Qm94cGxvdEludGVyYWN0aW9uLFxuXSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdEludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3RJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gVGhlIGJsb2NrIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBdXRvLW51bWJlcmVkIGxpa2UgdGhlIG90aGVyIHF1ZXN0aW9uIGJsb2NrcyBXSEVOIEdSQURFRCBcdTIwMTQgYSBgZGlzcGxheWBcbi8vIGRhdGFfcGxvdCBwdWxscyBubyBudW1iZXIgKHRoZSByZW5kZXJlcidzIGlzTnVtYmVyZWRCbG9jayByZXR1cm5zIGZhbHNlIGZvclxuLy8gaXQsIGV4YWN0bHkgYXMgaXQgZG9lcyBmb3IgYSBkaXNwbGF5IGludGVyYWN0aXZlX2dyYXBoKS4gc2tpbGxzICsgc29sdXRpb25cbi8vIGZvbGxvdyB0aGUgc2FtZSBvcHQtaW4gcGF0dGVybnMgdGhlIGdyYXBoIC8gbnVtYmVyLWxpbmUgYmxvY2tzIGVzdGFibGlzaGVkLFxuLy8gYW5kIChsaWtlIHRoZW0pIG1hdHRlciBvbmx5IGluIGJ1aWxkIG1vZGUuIERlbGliZXJhdGVseSBMRUFOIGZvciBzbGljZSAxXG4vLyAobm8gbWlzdGFrZUZlZWRiYWNrKSBcdTIwMTQgYWxsLW9yLW5vdGhpbmcgc2NvcmluZyAoZGVjaXNpb24gOCk7IHRob3NlIGZpZWxkc1xuLy8gYXJlIGFkZGl0aXZlIGxhdGVyIGlmIGFza2VkIGZvciAoWUFHTkkpLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90QmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdkYXRhX3Bsb3QnKSxcbiAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLi4ubGFiZWxGaWVsZHMsXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgLy8gVGhlIGRhdGFzZXQuIFNpbmdsZSBzb3VyY2Ugb2YgdHJ1dGg6IHRoZSBjaGFydCBpcyBkcmF3biBmcm9tIGl0IGFuZCwgaW5cbiAgLy8gYnVpbGQgbW9kZSwgdGhlIGNvcnJlY3QgYW5zd2VyIGlzIGRlcml2ZWQgZnJvbSBpdC4gTm9uLWVtcHR5LlxuICBkYXRhOiB6LmFycmF5KHoubnVtYmVyKCkpLm1pbigxKSxcbiAgY29uZmlnOiBEYXRhUGxvdENvbmZpZyxcbiAgaW50ZXJhY3Rpb246IERhdGFQbG90SW50ZXJhY3Rpb24sXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgLy8gVmFyaWFibGUgYmxvY2sgc2l6aW5nOiBvcHRpb25hbCB3aWR0aCBmcmFjdGlvbiArIGFsaWdubWVudCAoc2l6aW5nLnRzKS5cbiAgLy8gQWRkaXRpdmUvb3B0aW9uYWwgXHUyMDE0IG5vIHNjaGVtYVZlcnNpb24gYnVtcC5cbiAgLi4uc2l6aW5nRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdEJsb2NrID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3RCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrIFx1MjAxNCBhIHRpdGxlZCBsaXN0IG9mIGxlYXJuaW5nIG9iamVjdGl2ZXMuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBwdXJlIENPTlRFTlQgYmxvY2sgKGRhdGEtYmxvY2stY2F0ZWdvcnk9XCJjb250ZW50XCIpOiBub24taW50ZXJhY3RpdmUsXG4vLyBub24tbnVtYmVyZWQsIG5vIHJ1bnRpbWUgd2lyaW5nLCBubyBzdWJtaXNzaW9uIHdpcmUgaW1wYWN0LiBQZWRhZ29naWNhbGx5IGl0XG4vLyBmcm9udHMgYW4gYWN0aXZpdHkgKG9yIGEgc2VjdGlvbikgd2l0aCB0aGUgXCJzdHVkZW50cyB3aWxsIGJlIGFibGUgdG9cdTIwMjZcIiBnb2Fsc1xuLy8gdGhhdCBTd2VsbGVyLXN0eWxlIHNjYWZmb2xkaW5nIGlzIGJ1aWx0IGFyb3VuZC5cbi8vXG4vLyBTaGFwZTogYW4gZWRpdGFibGUgYHRpdGxlYCAoZGVmYXVsdGVkLCBidXQgdGhlIHRlYWNoZXIgY2FuIHJlbmFtZSBpdCkgcGx1cyBhXG4vLyBsaXN0IG9mIGBpdGVtc2AsIGVhY2ggYSByaWNoIGlubGluZSBydW4gKHRleHQgKyBpbmxpbmUgbWF0aCArIG1hcmtzKSBcdTIwMTQgdGhlXG4vLyBzYW1lIGFscGhhYmV0IHBhcmFncmFwaHMgdXNlLiBJdGVtcyBtYXAgMToxIHRvIGVkaXRhYmxlIHBhcmFncmFwaHMgaW4gdGhlXG4vLyBlZGl0b3IgTm9kZVZpZXc7IHRoZSByZW5kZXJlciBlbWl0cyB0aGVtIGFzIGEgPHVsPi5cbi8vXG4vLyBgaXRlbXNgIG1heSBiZSBlbXB0eTogdGhlIGVkaXRvcidzIGNvbnRlbnQgc3BlYyBrZWVwcyBhdCBsZWFzdCBvbmUgcGFyYWdyYXBoXG4vLyBsaXZlLCBidXQgYSBzZXJpYWxpemVkIHJvdW5kLXRyaXAgY2FuIGxlZ2l0aW1hdGVseSBwcm9kdWNlIGFuIGVtcHR5IGxpc3Rcbi8vIChlLmcuIGV2ZXJ5IGl0ZW0gY2xlYXJlZCksIGFuZCB0aGF0IG11c3Qgbm90IGZhaWwgcHVibGlzaCB2YWxpZGF0aW9uLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnbGVhcm5pbmdfb2JqZWN0aXZlcycpLFxuICB0aXRsZTogei5zdHJpbmcoKSxcbiAgaXRlbXM6IHouYXJyYXkoei5hcnJheShJbmxpbmVOb2RlKSksXG59KTtcbmV4cG9ydCB0eXBlIExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrID0gei5pbmZlcjx0eXBlb2YgTGVhcm5pbmdPYmplY3RpdmVzQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgUGFyYWdyYXBoQmxvY2sgfSBmcm9tICcuL3BhcmFncmFwaC5qcyc7XG5pbXBvcnQgeyBIZWFkaW5nQmxvY2sgfSBmcm9tICcuL2hlYWRpbmcuanMnO1xuaW1wb3J0IHsgTWF0aEJsb2NrIH0gZnJvbSAnLi9tYXRoLWJsb2NrLmpzJztcbmltcG9ydCB7IEltYWdlQmxvY2sgfSBmcm9tICcuL2ltYWdlLmpzJztcbmltcG9ydCB7IEJ1bGxldExpc3RCbG9jaywgT3JkZXJlZExpc3RCbG9jayB9IGZyb20gJy4vbGlzdC5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBXb3JrZWRFeGFtcGxlQmxvY2sgXHUyMDE0IGEgdGl0bGVkLCBib3hlZCBmdWxseS13b3JrZWQgZXhhbXBsZSB0byBzdHVkeS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIHB1cmUgQ09OVEVOVCBibG9jayAoZGF0YS1ibG9jay1jYXRlZ29yeT1cImNvbnRlbnRcIik6IG5vbi1pbnRlcmFjdGl2ZSxcbi8vIG5vbi1udW1iZXJlZCwgbm8gcnVudGltZSB3aXJpbmcsIG5vIHN1Ym1pc3Npb24gd2lyZSBpbXBhY3QuIERyYXdzIG9uXG4vLyBTd2VsbGVyJ3MgY29nbml0aXZlLWxvYWQgdGhlb3J5IFx1MjAxNCBhIHdvcmtlZCBleGFtcGxlIGEgc3R1ZGVudCByZWFkcyBiZWZvcmVcbi8vIGF0dGVtcHRpbmcgdGhlIGFuYWxvZ291cyBwcm9ibGVtLlxuLy9cbi8vIFVubGlrZSBhIGNhbGxvdXQgKGlubGluZS1vbmx5IGJvZHkpLCBhIHdvcmtlZCBleGFtcGxlIGhvbGRzIE5FU1RFRCBCTE9DS1xuLy8gY29udGVudCBzbyBhIG11bHRpLXN0ZXAsIG1hdGgtaGVhdnkgc29sdXRpb24gcmVuZGVycyBwcm9wZXJseTogcGFyYWdyYXBocyxcbi8vIGJsb2NrIG1hdGgsIGxpc3RzLCBhbmQgaW1hZ2VzLiBUaGUgY2hpbGQgdW5pb24gaXMgZGVsaWJlcmF0ZWx5IGEgY3VyYXRlZFxuLy8gc3Vic2V0IG9mIHRoZSBCbG9jayB1bmlvbiBcdTIwMTQgbGVhZiBDT05URU5UIGJsb2NrcyBvbmx5LiBJdCBleGNsdWRlczpcbi8vICAgLSBxdWVzdGlvbiBibG9ja3MgKGEgd29ya2VkIGV4YW1wbGUgaXMgY29udGVudCwgbmV2ZXIgc2NvcmVkKSxcbi8vICAgLSBjb2x1bW5zIGFuZCB3b3JrZWRfZXhhbXBsZSBpdHNlbGYgKHNvIG5lc3RpbmcgdGVybWluYXRlcyBcdTIwMTQgbm8gcmVjdXJzaW9uLFxuLy8gICAgIHRoZSBzYW1lIGRpc2NpcGxpbmUgYXMgQ29sdW1uQ2VsbEJsb2NrIGZvcmJpZGRpbmcgY29sdW1ucy1pbi1jb2x1bW5zKS5cbi8vIFRoaXMgYWxzbyBrZWVwcyB0aGUgZGFzaGJvYXJkIGluZGV4IHVudG91Y2hlZDogYSB3b3JrZWQgZXhhbXBsZSBjYW4gbmV2ZXJcbi8vIGNvbnRhaW4gYSBxdWVzdGlvbiwgc28gYnVpbGRBY3Rpdml0eUluZGV4IG5ldmVyIG5lZWRzIHRvIHJlY3Vyc2UgaW50byBpdC5cbi8vXG4vLyBUaGUgc3Vic2V0IG1hdGNoZXMgdGhlIGVkaXRvci1tYXBwYWJsZSBjb250ZW50IG5vZGVzIDE6MSAoV29ya2VkRXhhbXBsZS50cydzXG4vLyBjb250ZW50IGV4cHJlc3Npb24pLCBzbyBzZXJpYWxpemUgcm91bmQtdHJpcHMgd2l0aG91dCBzaWxlbnRseSBkcm9wcGluZyBhXG4vLyBjaGlsZC4gYGNvbnRlbnRgIG1heSBiZSBlbXB0eSBmb3IgdGhlIHNhbWUgcmVhc29uIExlYXJuaW5nT2JqZWN0aXZlcy5pdGVtc1xuLy8gbWF5IGJlIFx1MjAxNCBhbiBhbGwtdW5tYXBwYWJsZSByb3VuZCB0cmlwIChlLmcuIGEgc2luZ2xlIGVtcHR5IGltYWdlKSBtdXN0IG5vdFxuLy8gZmFpbCBwdWJsaXNoIHZhbGlkYXRpb24uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgY29uc3QgV29ya2VkRXhhbXBsZUNoaWxkID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFBhcmFncmFwaEJsb2NrLFxuICBIZWFkaW5nQmxvY2ssXG4gIE1hdGhCbG9jayxcbiAgSW1hZ2VCbG9jayxcbiAgQnVsbGV0TGlzdEJsb2NrLFxuICBPcmRlcmVkTGlzdEJsb2NrLFxuXSk7XG5leHBvcnQgdHlwZSBXb3JrZWRFeGFtcGxlQ2hpbGQgPSB6LmluZmVyPHR5cGVvZiBXb3JrZWRFeGFtcGxlQ2hpbGQ+O1xuXG5leHBvcnQgY29uc3QgV29ya2VkRXhhbXBsZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnd29ya2VkX2V4YW1wbGUnKSxcbiAgdGl0bGU6IHouc3RyaW5nKCksXG4gIGNvbnRlbnQ6IHouYXJyYXkoV29ya2VkRXhhbXBsZUNoaWxkKSxcbn0pO1xuZXhwb3J0IHR5cGUgV29ya2VkRXhhbXBsZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgV29ya2VkRXhhbXBsZUJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IFBhcmFncmFwaEJsb2NrIH0gZnJvbSAnLi9wYXJhZ3JhcGguanMnO1xuaW1wb3J0IHsgSGVhZGluZ0Jsb2NrIH0gZnJvbSAnLi9oZWFkaW5nLmpzJztcbmltcG9ydCB7IE1hdGhCbG9jayB9IGZyb20gJy4vbWF0aC1ibG9jay5qcyc7XG5pbXBvcnQgeyBJbWFnZUJsb2NrIH0gZnJvbSAnLi9pbWFnZS5qcyc7XG5pbXBvcnQgeyBCdWxsZXRMaXN0QmxvY2ssIE9yZGVyZWRMaXN0QmxvY2sgfSBmcm9tICcuL2xpc3QuanMnO1xuaW1wb3J0IHsgRmlsbEluQmxhbmtCbG9jayB9IGZyb20gJy4vZmlsbC1pbi1ibGFuay5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrIFx1MjAxNCBhIHNjYWZmb2xkZWQgKFwiZmFkZWRcIikgd29ya2VkIGV4YW1wbGUuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGludGVyYWN0aXZlIHNpYmxpbmcgb2Ygd29ya2VkX2V4YW1wbGUgKFJlbmtsL0F0a2luc29uIGNvbXBsZXRpb25cbi8vIHByb2JsZW1zKTogZWFybHkgc3RlcHMgYXJlIGZ1bGx5IHNob3duLCBsYXRlciBzdGVwcyBhcmUgRkFERUQgXHUyMDE0IHRoZSBzdHVkZW50XG4vLyBmaWxscyB0aGVtIGluLiBTdHJ1Y3R1cmFsbHkgaXQncyBhIHdvcmtlZF9leGFtcGxlIGZyYW1lIHdob3NlIGNoaWxkIHVuaW9uXG4vLyBBTFNPIGFkbWl0cyBmaWxsX2luX2JsYW5rIGJsb2NrczogYSBzaG93biBzdGVwIGlzIGEgcGFyYWdyYXBoIC8gYmxvY2sgbWF0aCAvXG4vLyBsaXN0IC8gaW1hZ2U7IGEgZmFkZWQgc3RlcCBpcyBhIGZpbGxfaW5fYmxhbmsgYmxvY2sgY2FycnlpbmcgdGhlIGJsYW5rcy5cbi8vXG4vLyBSZXVzZSBvdmVyIHJlaW52ZW50aW9uIChkZWNpZGVkIGF0IGRlc2lnbiwgMjAyNi0wNy0xMik6XG4vLyAgIC0gVGhlIGZhZGVkIHN0ZXBzIEFSRSBmaWxsX2luX2JsYW5rIGJsb2Nrcywgc28gdGhlIHJ1bnRpbWUgc2NvcmVzIHRoZW0gd2l0aFxuLy8gICAgIFpFUk8gbmV3IHJ1bnRpbWUgY29kZSBcdTIwMTQgaW5pdC50cyBhbHJlYWR5IHNjYW5zIGVhY2ggLmFjdGl2aXR5LXNlY3Rpb24gZm9yXG4vLyAgICAgYFtkYXRhLWJsb2NrLXR5cGU9XCJmaWxsX2luX2JsYW5rXCJdYCBhbmQgZmluZHMgTkVTVEVEIG9uZXMuIFRoZXkgcmlkZSB0aGVcbi8vICAgICBleGlzdGluZyBCbGFua1Jlc3BvbnNlIG1hcCwgc28gdGhlcmUgaXMgTk8gc3VibWlzc2lvbiB3aXJlL3N0b3JhZ2UgYnVtcC5cbi8vICAgLSBTY29yaW5nIHJpZGVzIHRoZSBjaGlsZCBibGFua3M7IHRoaXMgZnJhbWUgcmVhZHMgbm8gdHlwZS1zcGVjaWZpY1xuLy8gICAgIGF0dHJpYnV0ZXMgaXRzZWxmIFx1MjE5MiBpdCBpcyBhIENPTlRBSU5FUiAobGlrZSBgcHJvYmxlbWApLCBub3QgSU5URVJBQ1RJVkUuXG4vLyAgIC0gTnVtYmVyaW5nIChyZXZpc2VkIDIwMjYtMDctMTMpOiB0aGUgV0hPTEUgYm94IGlzIG9uZSBudW1iZXJlZCBwcm9ibGVtIFx1MjAxNFxuLy8gICAgIGl0cyBudW1iZXIgbGVhZHMgdGhlIHRpdGxlLCBhbmQgdGhlIGZhZGVkIGZpbGxfaW5fYmxhbmsgc3RlcHMgYXJlIGxldHRlcmVkXG4vLyAgICAgKGEpLyhiKVx1MjAyNiBMT0NBTExZIChzaG93U3RlcExhYmVscyB0b2dnbGVzIHRoZW0gb2ZmKSwgc28gdGhleSBubyBsb25nZXJcbi8vICAgICBjb25zdW1lIHdvcmtzaGVldCBwcm9ibGVtIG51bWJlcnMuIFNlZSByZW5kZXJGYWRlZFdvcmtlZEV4YW1wbGUgYW5kIHRoZVxuLy8gICAgIGVkaXRvcidzIHByb2JsZW1OdW1iZXJBdCAod2hpY2ggdHJlYXRzIHRoZSBib3ggYXMgYXRvbWljKS4gVGhpcyByZXZlcnNlZFxuLy8gICAgIHRoZSBvcmlnaW5hbCBcInN0ZXBzIG51bWJlciBhcyBvcmRpbmFyeSBwcm9ibGVtc1wiIGNob2ljZSwgd2hpY2ggd2FzdGVkXG4vLyAgICAgd3JpdGluZy9wcmludCB3aWR0aCBhbmQgcG9sbHV0ZWQgdGhlIHdvcmtzaGVldCdzIG51bWJlcmluZy5cbi8vXG4vLyBUaGUgY2hpbGQgdW5pb24gc3RpbGwgZXhjbHVkZXMgcXVlc3Rpb25zIE9USEVSIHRoYW4gZmlsbF9pbl9ibGFuaywgcGx1c1xuLy8gY29sdW1ucyAvIHdvcmtlZF9leGFtcGxlIC8gZmFkZWRfd29ya2VkX2V4YW1wbGUgaXRzZWxmIFx1MjAxNCBzbyBuZXN0aW5nXG4vLyB0ZXJtaW5hdGVzIGFuZCB0aGUgZGFzaGJvYXJkIGluZGV4IHJlY3Vyc2VzIG9ubHkgb25lIHByZWRpY3RhYmxlIGxldmVsLlxuLy8gYGNvbnRlbnRgIG1heSBiZSBlbXB0eSBmb3IgdGhlIHNhbWUgcm91bmQtdHJpcC1zYWZldHkgcmVhc29uIGFzXG4vLyB3b3JrZWRfZXhhbXBsZS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBjb25zdCBGYWRlZFdvcmtlZEV4YW1wbGVDaGlsZCA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBQYXJhZ3JhcGhCbG9jayxcbiAgSGVhZGluZ0Jsb2NrLFxuICBNYXRoQmxvY2ssXG4gIEltYWdlQmxvY2ssXG4gIEJ1bGxldExpc3RCbG9jayxcbiAgT3JkZXJlZExpc3RCbG9jayxcbiAgRmlsbEluQmxhbmtCbG9jayxcbl0pO1xuZXhwb3J0IHR5cGUgRmFkZWRXb3JrZWRFeGFtcGxlQ2hpbGQgPSB6LmluZmVyPHR5cGVvZiBGYWRlZFdvcmtlZEV4YW1wbGVDaGlsZD47XG5cbmV4cG9ydCBjb25zdCBGYWRlZFdvcmtlZEV4YW1wbGVCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2ZhZGVkX3dvcmtlZF9leGFtcGxlJyksXG4gIHRpdGxlOiB6LnN0cmluZygpLFxuICBjb250ZW50OiB6LmFycmF5KEZhZGVkV29ya2VkRXhhbXBsZUNoaWxkKSxcbiAgLy8gVGhlIHdob2xlIGJveCBpcyBPTkUgbnVtYmVyZWQgcHJvYmxlbSAoaXRzIG51bWJlciBsZWFkcyB0aGUgdGl0bGUpOyB0aGVcbiAgLy8gZmFkZWQgZmlsbF9pbl9ibGFuayBzdGVwcyBhcmUgbGV0dGVyZWQgKGEpLCAoYilcdTIwMjYgV0lUSElOIHRoZSBib3ggaW5zdGVhZCBvZlxuICAvLyBjb25zdW1pbmcgd29ya3NoZWV0IHByb2JsZW0gbnVtYmVycy4gc2hvd1N0ZXBMYWJlbHMgdG9nZ2xlcyB0aG9zZSBsZXR0ZXJzXG4gIC8vIG9mZiBwZXIgYm94IChiYXJlIGJsYW5rcywgbm8gZ3V0dGVyKSBmb3IgdGVhY2hlcnMgd2hvIHdhbnQgbWF4aW11bSB3cml0aW5nXG4gIC8vIHJvb20uIERlZmF1bHRlZCBzbyBwcmUtZXhpc3RpbmcgZG9jdW1lbnRzIChubyBmaWVsZCkgcmVuZGVyIGxhYmVsbGVkLlxuICBzaG93U3RlcExhYmVsczogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgLy8gVGhlIGJveCdzIE9XTiBwYWdlIGxhYmVsICh2aWV3ZXItbnVtYmVyaW5nIE42KS4gSXQgaGFzIGFsd2F5cyBiZWVuIG9uZVxuICAvLyBudW1iZXJlZCBwcm9ibGVtOyB0aGlzIGlzIHdoYXQgbGV0cyBhIHRlYWNoZXIgcmVsYWJlbCBpdCAoXCJXYXJtLXVwXCIpIG9yXG4gIC8vIHVubnVtYmVyIGl0LCB0aGUgc2FtZSB2b2NhYnVsYXJ5IGV2ZXJ5IG90aGVyIG51bWJlcmVkIHR5cGUgYWxyZWFkeSBoYWQuXG4gIC8vIERpc3RpbmN0IGZyb20gc2hvd1N0ZXBMYWJlbHMsIHdoaWNoIGdvdmVybnMgdGhlIChhKS8oYikgbGV0dGVycyBJTlNJREUgdGhlXG4gIC8vIGJveCBcdTIwMTQgdGhhdCBvbmUgaXMgYWJvdXQgdGhlIHN0ZXBzLCB0aGlzIG9uZSBpcyBhYm91dCB0aGUgYm94LlxuICAuLi5sYWJlbEZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgRmFkZWRXb3JrZWRFeGFtcGxlQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBGYWRlZFdvcmtlZEV4YW1wbGVCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFNlbGZFeHBsYW5hdGlvbkJsb2NrIFx1MjAxNCBhbiB1bmdyYWRlZCBmcmVlLXRleHQgcmVmbGVjdGlvbiBwcm9tcHQuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gTWV0YWNvZ25pdGl2ZSBzZWxmLWV4cGxhbmF0aW9uIChDaGkgZXQgYWwuKTogdGhlIHN0dWRlbnQgd3JpdGVzIFdIWSwgaW4gdGhlaXJcbi8vIG93biB3b3Jkcy4gRGVsaWJlcmF0ZWx5IFVOR1JBREVEIChhdXRob3IgZGVjaXNpb24sIDIwMjYtMDctMTIpIFx1MjAxNCB0aGUgcnVudGltZVxuLy8gY2FwdHVyZXMgdGhlIHRleHQgYW5kIHRoZSB0ZWFjaGVyIGRhc2hib2FyZCBzaG93cyBpdCByYXc7IHRoZXJlIGlzIG5vIGFuc3dlclxuLy8ga2V5LCBubyBjb3JyZWN0L2luY29ycmVjdCwgYW5kIGl0IG5ldmVyIGNvbnRyaWJ1dGVzIHRvIHRoZSBzY29yZS4gVGhpcyBrZWVwc1xuLy8gaXQgY2xlYXIgb2YgUGhhc2UgMi42IHJ1YnJpYyBncmFkaW5nLlxuLy9cbi8vIEl0IGlzIHRoZSBGSVJTVCBmcmVlLXRleHQgcmVzcG9uc2UgdHlwZSwgc28gaXQgaW50cm9kdWNlcyB0aGUgYGZyZWVSZXNwb25zZXNgXG4vLyBtYXAgb24gU3VibWlzc2lvblJlc3BvbnNlcyAod2lyZSB2OCBcdTIxOTIgdjkpIFx1MjAxNCB0aGUgbWFwIG5hbWUgdGhlIHNjaGVtYSByZXNlcnZlZFxuLy8gZm9yIGV4YWN0bHkgdGhpcyBzaGFwZS4gUGhhc2UgMi42IHNob3J0X2Fuc3dlciAvIGVzc2F5IHJldXNlIHRoZSBzYW1lIG1hcCAoYVxuLy8gc3RyaW5nIHBlciBibG9jaykgd2l0aCBubyBmdXJ0aGVyIHdpcmUgYnVtcDsgZ3JhZGluZywgd2hlbiBpdCBsYW5kcywgbGl2ZXMgaW5cbi8vIGEgc2VwYXJhdGUgdGFibGUsIG5vdCBpbiB0aGUgcmVzcG9uc2Ugc2hhcGUuXG4vL1xuLy8gU2hhcGU6IGEgYHByb21wdGAgKHJpY2ggaW5saW5lIFx1MjAxNCB0ZXh0ICsgaW5saW5lIG1hdGggKyBtYXJrcywgbGlrZSBldmVyeSBvdGhlclxuLy8gcXVlc3Rpb24gcHJvbXB0KSBwbHVzIGFuIG9wdGlvbmFsIGBwbGFjZWhvbGRlcmAgKGEgc2VudGVuY2Utc3RhcnRlciAvIGhpbnRcbi8vIHNob3duIGluIHRoZSBlbXB0eSB0ZXh0YXJlYSkuIE5vIGFuc3dlciBrZXkuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgY29uc3QgU2VsZkV4cGxhbmF0aW9uQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdzZWxmX2V4cGxhbmF0aW9uJyksXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgcGxhY2Vob2xkZXI6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgU2VsZkV4cGxhbmF0aW9uQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBTZWxmRXhwbGFuYXRpb25CbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gZnJlZS1yZXNwb25zZS50cyBcdTIwMTQgc2hvcnRfYW5zd2VyICsgZXNzYXkgKG1hbnVhbGx5LWdyYWRlZCBmcmVlIHRleHQpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIFBoYXNlIDIuNiBncmFkZWQgZnJlZS10ZXh0IHNpYmxpbmdzIG9mIHNlbGZfZXhwbGFuYXRpb24uIEFsbCB0aHJlZSB3cml0ZVxuLy8gdGhlaXIgc3R1ZGVudCB0ZXh0IGludG8gdGhlIFNBTUUgYGZyZWVSZXNwb25zZXNgIG1hcCAod2lyZSB2OSkgXHUyMDE0IHRoZSByZXNwb25zZVxuLy8gc2hhcGUgaXMgaWRlbnRpY2FsIChhIHN0cmluZyk7IHdoYXQgZGlmZmVycyBpcyBpbnRlbnQgKyBncmFkaW5nOlxuLy8gICAtIHNlbGZfZXhwbGFuYXRpb24gXHUyMDE0IHVuZ3JhZGVkIHJlZmxlY3Rpb24gKGFscmVhZHkgc2hpcHBlZCkuXG4vLyAgIC0gc2hvcnRfYW5zd2VyICAgICBcdTIwMTQgYSBicmllZiBncmFkZWQgcmVzcG9uc2UgKG1hbnVhbCBydWJyaWMgZ3JhZGluZywgMi42KS5cbi8vICAgLSBlc3NheSAgICAgICAgICAgIFx1MjAxNCBhIGxvbmcgZ3JhZGVkIHJlc3BvbnNlOyBhZGRzIG9wdGlvbmFsIHdvcmQtY291bnRcbi8vICAgICAgICAgICAgICAgICAgICAgICAgZ3VpZGFuY2UgKGEgdGFyZ2V0IHJhbmdlIHNob3duIGFzIGEgbGl2ZSBjb3VudGVyKS5cbi8vIEdyYWRpbmcgaXRzZWxmIGxpdmVzIGluIGEgc2VwYXJhdGUgYGdyYWRlc2AgdGFibGUgKFBoYXNlIDIuNiBsYXRlciBzbGljZXMpLFxuLy8gbmV2ZXIgaW4gdGhlIHN1Ym1pc3Npb24ganNvbmIgXHUyMDE0IGdyYWRlcyBhcmUgbXV0YWJsZSwgc3VibWlzc2lvbnMgYXJlIG5vdC4gVGhlc2Vcbi8vIGJsb2NrcyBhcmUgbmV2ZXIgQVVUTy1zY29yZWQgYnkgdGhlIHJ1bnRpbWUuXG4vL1xuLy8gXHUyNkEwIEFNRU5ERUQgMjAyNi0wOC0yMCAoYW5zd2VyLWtleSBzbGljZSwgcnVsaW5nIEUyIFx1MjAxNCB0aGlzIGNvbW1lbnQgaXMgYW1lbmRlZFxuLy8gaW4gdGhlIGNvbW1pdCB0aGF0IGNoYW5nZXMgd2hhdCBpdCBkZXNjcmliZXMsIFA1KS4gVGhlIGxpbmUgYWJvdmUgdXNlZCB0b1xuLy8gcmVhZCBcImNhcnJ5IE5PIGFuc3dlciBrZXlcIi4gVGhleSBub3cgTUFZIGNhcnJ5IG9uZSwgYW5kIHRoZSBkaXN0aW5jdGlvbiB0aGF0XG4vLyByZXBsYWNlZCBpdCBpcyB0aGUgbG9hZC1iZWFyaW5nIG9uZTpcbi8vXG4vLyAgIGFuc3dlciAgIFx1MjAxNCB0aGUgY2Fub25pY2FsIGFuc3dlciAvIG1hcmtpbmcgZ3VpZGUuIFRlYWNoZXItb25seSBtYXRlcmlhbCwgb25cbi8vICAgICAgICAgICAgICBFVkVSWSBjaGFubmVsOiB0aGUgcmVnaXN0cnkgc3RyaXBzIGl0IGZyb20gdGhlIHNlcnZlZCBkb2N1bWVudFxuLy8gICAgICAgICAgICAgIGFuZCBub3RoaW5nIGV2ZXIgcmV0dXJucyBpdCB0byBhIHN0dWRlbnQuIEl0IGV4aXN0cyBzbyB0aGVcbi8vICAgICAgICAgICAgICBwcmludGVkIGFuc3dlciBrZXkgaGFzIHNvbWV0aGluZyB0byBwcmludCAoYW5kIHNvIHRoZSBmdXR1cmVcbi8vICAgICAgICAgICAgICBzY2FuLWdyYWRpbmcgYXJjIGhhcyBhIGtleSB0byBncmFkZSBhIHBob3RvIGFnYWluc3QpLiBBIGJsb2NrXG4vLyAgICAgICAgICAgICAgdGhhdCBpcyBtYW51YWxseSBncmFkZWQgc3RpbGwgSEFTIGEgcmlnaHQgYW5zd2VyOyB3aGF0IGl0IGxhY2tzXG4vLyAgICAgICAgICAgICAgaXMgYSBtYWNoaW5lIHRoYXQgY2FuIHJlY29nbmlzZSBvbmUuXG4vLyAgIHNvbHV0aW9uIFx1MjAxNCB0aGUgcG9zdC1jaGVjayBleHBsYW5hdGlvbiwgaWRlbnRpY2FsIGluIGtpbmQgYW5kIGluIHJlbGVhc2Vcbi8vICAgICAgICAgICAgICBydWxlIHRvIGV2ZXJ5IG90aGVyIGJsb2NrJ3MgYHNvbHV0aW9uYDogc3RyaXBwZWQgZnJvbSB0aGUgcmVhZFxuLy8gICAgICAgICAgICAgIHBhdGgsIHJldHVybmVkIGJ5IHRoZSBjaGVjayByZXNwb25zZSBhZnRlciB0aGUgc2VjdGlvbiBpc1xuLy8gICAgICAgICAgICAgIGNoZWNrZWQgKHdhbGsudHMgY29sbGVjdHMgaXQgR0VORVJJQ0FMTFksIHNvIG5vIGdyYWRpbmctZW5naW5lXG4vLyAgICAgICAgICAgICAgY29kZSB3YXMgYWRkZWQgZm9yIHRoaXMpLCBhbmQgcmV2ZWFsZWQgYnkgdGhlIGNvbXBvbmVudC5cbi8vXG4vLyBCb3RoIGFyZSBJbmxpbmVOb2RlW10gXHUyMDE0IGEgd29ya2VkIGFuc3dlciB3YW50cyBmb3JtYXR0aW5nIGFuZCBpbmxpbmUgbWF0aCwgYW5kXG4vLyBhIG11bHRpLWxpbmUgb25lIGFycml2ZXMgZnJvbSB0aGUgaW1wb3J0ZXIgYXMgaGFyZCBicmVha3MuIEJvdGggYXJlIE9QVElPTkFMOlxuLy8gYW4gdW5hbnN3ZXJlZCBmcmVlLXJlc3BvbnNlIGJsb2NrIGlzIHN0aWxsIGEgdmFsaWQgYmxvY2ssIGFuZCB0aGUgYW5zd2VyIGtleVxuLy8gcHJpbnRzIFwibWFudWFsbHkgZ3JhZGVkIFx1MjAxNCBzZWUgcnVicmljXCIgZm9yIGl0ICh0aGUgZXh0cmFjdG9yJ3MgZmFsbGJhY2sgY2hhaW5cbi8vIGlzIGFuc3dlciBcdTIxOTIgc29sdXRpb24gXHUyMTkyIHRoYXQgcGhyYXNlOyBzZWUgdmlld2VyL3NyYy9hbnN3ZXIta2V5L2V4dHJhY3QudHMpLlxuLy9cbi8vIEU4J3MgY29udmVudGlvbiwgcmVjb3JkZWQgYmVjYXVzZSBpdCBpcyBOT1Qgc2NoZW1hOiBgYW5zd2VyYCBjYXJyaWVzIFdIQVQgaXNcbi8vIGNvcnJlY3Q7IGEgYHJ1YnJpY2AgY2FycmllcyBIT1cgTUFOWSBwb2ludHMgKHBlci1jcml0ZXJpb24gbWF4UG9pbnRzKSB3aGVuIGFcbi8vIHF1ZXN0aW9uIGlzIHdvcnRoIG1vcmUgdGhhbiBvbmU7IG5vIHJ1YnJpYyA9IGEgMS1wb2ludCBxdWVzdGlvbi4gVGhlcmUgaXNcbi8vIGRlbGliZXJhdGVseSBubyBwb2ludHMgZmllbGQgaGVyZSBcdTIwMTQgdGhlIGZ1bGwgbWFya2luZyBjb250cmFjdCBiZWxvbmdzIHRvXG4vLyBkb2NzL2Rlc2lnbi9waG90by1ncmFkaW5nLm1kJ3Mgb3duIGRlc2lnbiBwYXNzLlxuLy9cbi8vIHdvcmRDb3VudEhpbnQgKGVzc2F5IG9ubHkpOiBhbiBvcHRpb25hbCB7bWluPywgbWF4P30gdGFyZ2V0LiBUaGUgcmVuZGVyZXJcbi8vIHNob3dzIGEgbGl2ZSB3b3JkIGNvdW50ZXI7IHRoZSBjb3VudCBpdHNlbGYgaXMgY29tcHV0ZWQtb24tcmVhZCAobmV2ZXIgc3RvcmVkXG4vLyBpbiB0aGUgd2lyZSBcdTIwMTQgaXQncyBkZXJpdmFibGUgZnJvbSB0aGUgdGV4dCksIHNvIHRoaXMgaXMgZGlzcGxheSBndWlkYW5jZSBvbmx5LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gT25lIHJ1YnJpYyBjcml0ZXJpb246IGEgbGFiZWwgKFwiVGhlc2lzIGNsYXJpdHlcIiksIHRoZSBwb2ludHMgaXQncyB3b3J0aCwgYW5kXG4vLyBhbiBvcHRpb25hbCBkZXNjcmlwdGlvbiBvZiB3aGF0IGZ1bGwgY3JlZGl0IGxvb2tzIGxpa2UuIExldmVsZWQgZGVzY3JpcHRvclxuLy8gZ3JpZHMgKDQvMy8yLzEgY29sdW1ucykgYXJlIGEgZnV0dXJlIEFERElUSVZFIGV4dGVuc2lvbiBvZiB0aGlzIHNoYXBlLlxuZXhwb3J0IGNvbnN0IFJ1YnJpY0NyaXRlcmlvbiA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICBsYWJlbDogei5zdHJpbmcoKS5taW4oMSksXG4gIG1heFBvaW50czogei5udW1iZXIoKS5wb3NpdGl2ZSgpLmZpbml0ZSgpLFxuICBkZXNjcmlwdGlvbjogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBSdWJyaWNDcml0ZXJpb24gPSB6LmluZmVyPHR5cGVvZiBSdWJyaWNDcml0ZXJpb24+O1xuXG4vLyBBIGJsb2NrJ3MgZ3JhZGluZyBydWJyaWMuIExpdmVzIElOIHRoZSBkb2N1bWVudCAoYXV0aG9yIGRlY2lzaW9uIDIwMjYtMDctMTMsXG4vLyBkb2NzL2Rlc2lnbi9tYW51YWwtZ3JhZGluZy5tZCk6IHN1Ym1pc3Npb25zIHBpbiB0byBhY3Rpdml0eV92ZXJzaW9ucywgc28gdGhlXG4vLyBncmFkaW5nIFVJIHJlYWRzIHRoZSBleGFjdCBydWJyaWMgdGhlIHN0dWRlbnQgd2FzIGFzc2Vzc2VkIGFnYWluc3QgXHUyMDE0IHZlcnNpb25cbi8vIHBpbm5pbmcgSVMgdGhlIFwicnVicmljIGVkaXRzIGFwcGx5IHByb3NwZWN0aXZlbHlcIiBtZWNoYW5pc20uIFRoZSByZW5kZXJlclxuLy8gbmV2ZXIgZW1pdHMgaXQgKHRlYWNoZXItc2lkZSBkYXRhOyBzdGF5cyBvdXQgb2Ygc3R1ZGVudCBIVE1MKS4gR3JhZGVzXG4vLyB0aGVtc2VsdmVzIGFyZSBtdXRhYmxlIGFuZCBsaXZlIGluIHRoZSBgZ3JhZGVzYCBUQUJMRSwga2V5ZWQgYnlcbi8vIChzdWJtaXNzaW9uX2lkLCBibG9ja19pZCkgKyBjcml0ZXJpb24gaWQuXG5leHBvcnQgY29uc3QgUnVicmljID0gei5vYmplY3Qoe1xuICBjcml0ZXJpYTogei5hcnJheShSdWJyaWNDcml0ZXJpb24pLm1pbigxKSxcbn0pO1xuZXhwb3J0IHR5cGUgUnVicmljID0gei5pbmZlcjx0eXBlb2YgUnVicmljPjtcblxuLy8gVGhlIHR3byB0ZWFjaGVyLW9ubHkgYW5zd2VyIGZpZWxkcyBib3RoIGJsb2NrcyBjYXJyeSAocnVsaW5nIEUyICsgRTQnc1xuLy8gcGFyaXR5OiBvbmUgc2NoZW1hIHJvdW5kIGZvciB0aGUgcGFpciwgbmV2ZXIgdHdvKS4gRGVjbGFyZWQgb25jZSBoZXJlIHNvIHRoZVxuLy8gdHdvIGJsb2NrIHNoYXBlcyBjYW5ub3QgZHJpZnQgYXBhcnQgZmllbGQtYnktZmllbGQuXG4vL1xuLy8gXHUyNkEwIEJPVEggQkxPQ0tTIEFMU08gQ0FSUlkgYGxhYmVsRmllbGRzYCBzaW5jZSB0aGUgdmlld2VyLW51bWJlcmluZyBzbGljZVxuLy8gKHJ1bGluZyBONikuIFJ1bGluZyBFNyBtYWRlIHRoZW0gcGFnZS1udW1iZXJlZCwgYW5kIHVudGlsIE42IHRoZXkgd2VyZSB0aGVcbi8vIG9ubHkgbnVtYmVyZWQgdHlwZXMgd2l0aCBubyB3YXkgdG8gb3B0IG91dCBcdTIwMTQgYSB0ZWFjaGVyIGNvdWxkIG5vdCBtYXJrIGFcbi8vIHJlZmxlY3Rpb24tc3R5bGUgc2hvcnQgYW5zd2VyIGFzIHVubnVtYmVyZWQgZXZlbiB0aG91Z2ggdGhlIHNjaGVtYSBoYXMgaGFkXG4vLyB0aGF0IHZvY2FidWxhcnkgKGF1dG8gLyBjdXN0b20gLyBub25lKSBzaW5jZSB0aGUgbnVtYmVyaW5nLWxhYmVsIGRlY291cGxlLlxuLy8gVGhlIGZpZWxkIGlzIE5PVCBlbm91Z2ggb24gaXRzIG93bjogYGxhYmVsYCBvbmx5IHN1cnZpdmVzIGEgc2F2ZSBpZiB0aGUgdHlwZVxuLy8gaXMgYWxzbyBpbiBzZXJpYWxpemUudHMncyBMQUJFTEVEX0JMT0NLX1RZUEVTLCBhbmQgb25seSByZWFjaGVzIGFuIGF1dGhvciBpZlxuLy8gYmxvY2tDb250cm9scy50cyBhdHRhY2hlcyBgbnVtYmVyaW5nR3JvdXBgLiBTZWUgdGhlIHBsYW4ncyBmb3VyLWxpbmsgY2hhaW5cbi8vIChkb2NzL2Rlc2lnbi92aWV3ZXItbnVtYmVyaW5nLm1kLCBEOCkgXHUyMDE0IGxpbmsgMSBpcyBoZXJlLlxuY29uc3QgYW5zd2VyRmllbGRzID0ge1xuICAvKiogVGhlIGNhbm9uaWNhbCBhbnN3ZXIgLyBtYXJraW5nIGd1aWRlLiBUZWFjaGVyLW9ubHkgb24gZXZlcnkgY2hhbm5lbC4gKi9cbiAgYW5zd2VyOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIC8qKiBUaGUgcG9zdC1jaGVjayBleHBsYW5hdGlvbiBcdTIwMTQgc2FtZSByZWxlYXNlIHJ1bGUgYXMgZXZlcnkgb3RoZXIgYHNvbHV0aW9uYC4gKi9cbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbn07XG5cbmV4cG9ydCBjb25zdCBTaG9ydEFuc3dlckJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnc2hvcnRfYW5zd2VyJyksXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgcGxhY2Vob2xkZXI6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgcnVicmljOiBSdWJyaWMub3B0aW9uYWwoKSxcbiAgLi4uYW5zd2VyRmllbGRzLFxuICAuLi5sYWJlbEZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgU2hvcnRBbnN3ZXJCbG9jayA9IHouaW5mZXI8dHlwZW9mIFNob3J0QW5zd2VyQmxvY2s+O1xuXG5leHBvcnQgY29uc3QgV29yZENvdW50SGludCA9IHpcbiAgLm9iamVjdCh7XG4gICAgbWluOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgICBtYXg6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICB9KVxuICAvLyBHdWFyZCBhZ2FpbnN0IGFuIGludmVydGVkIHJhbmdlIChtaW4gPiBtYXgpIFx1MjAxNCBhIG5vbnNlbnNlIGhpbnQgdGhlIGVkaXRvclxuICAvLyBzaG91bGRuJ3QgYmUgYWJsZSB0byBwcm9kdWNlLCBidXQgdmFsaWRhdGlvbiBpcyB0aGUgc2NoZW1hJ3Mgam9iLlxuICAucmVmaW5lKFxuICAgIChoKSA9PiBoLm1pbiA9PT0gdW5kZWZpbmVkIHx8IGgubWF4ID09PSB1bmRlZmluZWQgfHwgaC5taW4gPD0gaC5tYXgsXG4gICAgeyBtZXNzYWdlOiAnd29yZENvdW50SGludC5taW4gbXVzdCBiZSBcdTIyNjQgbWF4JyB9LFxuICApO1xuZXhwb3J0IHR5cGUgV29yZENvdW50SGludCA9IHouaW5mZXI8dHlwZW9mIFdvcmRDb3VudEhpbnQ+O1xuXG5leHBvcnQgY29uc3QgRXNzYXlCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2Vzc2F5JyksXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgcGxhY2Vob2xkZXI6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgd29yZENvdW50SGludDogV29yZENvdW50SGludC5vcHRpb25hbCgpLFxuICBydWJyaWM6IFJ1YnJpYy5vcHRpb25hbCgpLFxuICAuLi5hbnN3ZXJGaWVsZHMsXG4gIC4uLmxhYmVsRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBFc3NheUJsb2NrID0gei5pbmZlcjx0eXBlb2YgRXNzYXlCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBGaWxsSW5CbGFua0lubGluZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFRhYmxlQmxvY2sgXHUyMDE0IGEgcmVhbCB0YWJsZSwgd2hvc2UgY2VsbHMgY2FuIGhvbGQgYmxhbmtzLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFBsYW4gKyBydWxpbmdzOiBkb2NzL2Rlc2lnbi90YWJsZS1ibG9jay5tZCAoZW5nIHJldmlldyAyMDI2LTA4LTIxKS5cbi8vXG4vLyBXSFkgVEhJUyBFWElTVFMgQVQgQUxMLiBUaGUgYGBgY29sdW1ucyB3b3JrYXJvdW5kIFBSSU5UUyBzb21ldGhpbmcgdGhhdCBsb29rc1xuLy8gbGlrZSBhIHRhYmxlIGFuZCBpcyBub3Qgb25lOiB0aGUgZGl2aWRlciBydWxlIGlzIGRyYXduIHBlciBDT0xVTU4sXG4vLyBpbmRlcGVuZGVudGx5LCBzbyByb3dzIGxpbmUgdXAgb25seSB3aGlsZSBldmVyeSBjZWxsIGhhcHBlbnMgdG8gYmUgb25lIGxpbmVcbi8vIHRhbGwuIEdpdmUgb25lIGNlbGwgYSBsYWJlbCB0aGF0IHdyYXBzIGFuZCB0aGUgdHdvIGNvbHVtbnMnIGRpdmlkZXJzIGRlc3luYyxcbi8vIGJlY2F1c2UgdGhlcmUgaXMgbm8gcm93IGNvbmNlcHQgaW4gdGhlIERPTSBob2xkaW5nIGEgcm93IHRvZ2V0aGVyLlxuLy9cbi8vIFx1MjZBMFx1MjZBMCBUSEUgT05FIFJVTEUgVEhBVCBNQUtFUyBUSEUgV0hPTEUgREVTSUdOIFdPUks6IGBUYWJsZVJvd2AgYW5kIGBUYWJsZUNlbGxgXG4vLyBDQVJSWSBOTyBgdHlwZWAgRklFTEQsIEFORCBNVVNUIE5FVkVSIEdBSU4gT05FLlxuLy9cbi8vIEZvdXIgc2VwYXJhdGUgd2Fsa3MgZmluZCBibGFua3MgYW5kIG1hdGggZ2FwcyBzdHJ1Y3R1cmFsbHksIGF0IGFueSBkZXB0aCBcdTIwMTRcbi8vIHRoZSBzYW5pdGl6ZXIncyBpbi1iYW5kIHN0cmlwLCB0aGUgY2xpZW50J3MgY2hlY2stcGF5bG9hZCBpbmRleFxuLy8gKGNvbnRhaW5lci9ibG9ja0luZGV4LnRzKSwgdGhlIHNlcnZlcidzIGdyYWRpbmcga2V5c1xuLy8gKHNlcnZlci9ncmFkaW5nL3dhbGsudHMpLCBhbmQgdGhlIHRlYWNoZXIncyBhbnN3ZXIga2V5IChhbnN3ZXIta2V5L2V4dHJhY3QpLlxuLy8gVGhyZWUgb2YgdGhlbSBzdG9wIGRlc2NlbmRpbmcgYXQgYGxvb2tzTGlrZUJsb2NrQXJyYXlgLCB3aGljaCBmaXJlcyBvbiBhbnlcbi8vIGFycmF5IHdob3NlIGVsZW1lbnRzIEFMTCBjYXJyeSBib3RoIGEgc3RyaW5nIGBpZGAgYW5kIGEgc3RyaW5nIGB0eXBlYC4gUm93c1xuLy8gYW5kIGNlbGxzIGhhdmUgYW4gYGlkYCBhbmQgbm8gYHR5cGVgLCBzbyB0aG9zZSB3YWxrcyBkZXNjZW5kIGludG8gdGhlbSBhbmQgYVxuLy8gYmxhbmsgaW4gYSBjZWxsIGlzIGdyYWRlZCwgY2hlY2tlZCBhbmQga2V5ZWQgd2l0aCBaRVJPIG5ldyBjb2RlLlxuLy9cbi8vIEFkZCBgdHlwZTogJ3RhYmxlX3JvdydgIFx1MjAxNCB0aGUgc2hhcGUgYSBzY2hlbWEgYXV0aG9yIHJlYWNoZXMgZm9yIGJ5IHJlZmxleCBcdTIwMTRcbi8vIGFuZCB0aHJlZSBvZiB0aGUgZm91ciB3YWxrcyBza2lwIHRoZSBlbnRpcmUgdGFibGUuIFRoZSBzYW5pdGl6ZXIgZG9lcyBOT1Rcbi8vIHN0b3AgYXQgYmxvY2sgYXJyYXlzLCBzbyBub3RoaW5nIGxlYWtzOyB0aGUgYW5zd2VyIGlzIHNpbXBseSBuZXZlciBHUkFERUQuXG4vLyB3YWxrLnRzIGNhbGxzIHRoYXQgXCJ0aGUgd29yc3Qga2luZFwiIG9mIGZhaWx1cmU6IHN1Ym1pdHRlZCwgc3RvcmVkLCBuZXZlclxuLy8gc2NvcmVkLiBUaGUgZ3VhcmQgYWdhaW5zdCBpdCBpcyBib3VuZCB0byB3YWxrIE9VVFBVVCAoc2VlIHRoZSBxdWFydGV0IGluXG4vLyB2aWV3ZXIvdGVzdHMgYW5kIHNjaGVtYS90ZXN0cy90YWJsZS50ZXN0LnRzKSwgbmV2ZXIgdG8gdGhpcyBkZWNsYXJhdGlvbi5cbi8vXG4vLyBHUkFEQUJJTElUWSBJUyBERVJJVkVELCBOT1QgREVDTEFSRUQuIFRoZXJlIGlzIG5vIGBpbnRlcmFjdGl2ZWAgZmxhZzogYSB0YWJsZVxuLy8gaXMgYSBxdWVzdGlvbiBleGFjdGx5IHdoZW4gc29tZSBjZWxsIGhvbGRzIGEgYmxhbmsgKGBpc0dyYWRlYWJsZWAsIHRoZVxuLy8gbWF0aF9ibG9jayBwcmVjZWRlbnQpLiBBIGZsYWcgY2FuIGRyaWZ0IGZyb20gY29udGVudCBcdTIwMTQgZGVsZXRlIHRoZSBsYXN0IGJsYW5rXG4vLyBhbmQgYSBzdGFsZSBmbGFnIGxlYXZlcyBhIHBoYW50b20gbnVtYmVyZWQgcXVlc3Rpb24gaW4gdGhlIGNoZWNrIHBheWxvYWQuXG4vL1xuLy8gTlVNQkVSSU5HIGZvbGxvd3MgZmFkZWRfd29ya2VkX2V4YW1wbGU6IHRoZSB3aG9sZSB0YWJsZSBpcyBPTkUgbnVtYmVyZWRcbi8vIHByb2JsZW0sIGFuZCBpdHMgYmxhbmtzIGFyZSBsZXR0ZXJlZCAoYSksIChiKSBcdTIwMjYgaW4gUkVBRElORyBPUkRFUi4gVGhlIGxldHRlcnNcbi8vIGFyZSBkZXJpdmVkIGZyb20gcG9zaXRpb24gYXQgcmVuZGVyIHRpbWUgYW5kIG5ldmVyIHN0b3JlZCAoYHRhYmxlQmxhbmtJZHNgICtcbi8vIGBzdGVwTGV0dGVyYCksIHRoZSBzYW1lIHJ1bGUgZmlsbF9pbl9ibGFuaydzIHN1Yi1wYXJ0cyBhbHJlYWR5IGZvbGxvdy5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBQZXItY29sdW1uIHByaW50L3NjcmVlbiBhbGlnbm1lbnQsIHN0cmFpZ2h0IGZyb20gYSBtYXJrZG93biBkZWxpbWl0ZXIgcm93J3NcbiAqIGNvbG9ucyAoYHwtLS06fGAgXHUyMTkyIHJpZ2h0KS4gUmlnaHQtYWxpZ25lZCBudW1iZXIgY29sdW1ucyBhcmUgd2hhdCBtYWtlcyBhXG4gKiB0YWJsZSBvZiBmaWd1cmVzIHJlYWRhYmxlIG9uIHBhcGVyLCB3aGljaCBpcyB3aHkgdGhpcyBpcyBhdXRob3JlZCBkYXRhIGFuZFxuICogbm90IGEgc3R5bGVzaGVldCBkZWNpc2lvbi4gKi9cbmV4cG9ydCBjb25zdCBUYWJsZUNvbHVtbkFsaWduID0gei5lbnVtKFsnbGVmdCcsICdjZW50ZXInLCAncmlnaHQnXSk7XG5leHBvcnQgdHlwZSBUYWJsZUNvbHVtbkFsaWduID0gei5pbmZlcjx0eXBlb2YgVGFibGVDb2x1bW5BbGlnbj47XG5cbi8vIE5PIGB0eXBlYCBGSUVMRCBcdTIwMTQgc2VlIHRoZSBoZWFkZXIuIGBpZGAgaXMgZm9yIHN0YWJsZSBhZGRyZXNzaW5nIChSZWFjdCBrZXlzLFxuLy8gZWRpdG9yIGlkZW50aXR5KTsgaXQgaXMgTk9UIGEgcmVzcG9uc2Uga2V5LiBUaGUgcmVzcG9uc2Uga2V5cyBhcmUgdGhlIGJsYW5rXG4vLyBpZHMgSU5TSURFIGBjb250ZW50YCwgd2hpY2ggaXMgd2hhdCBsZXRzIGNlbGwgYmxhbmtzIHJpZGUgdGhlIGV4aXN0aW5nXG4vLyBTdWJtaXNzaW9uUmVzcG9uc2VzLmJsYW5rcyBtYXAgd2l0aCBubyB3aXJlLXZlcnNpb24gYnVtcC5cbmV4cG9ydCBjb25zdCBUYWJsZUNlbGwgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgLy8gVGhlIHNhbWUgaW5saW5lIGFscGhhYmV0IGZpbGxfaW5fYmxhbmsncyBib2R5IHVzZXM6IHRleHQgd2l0aCBtYXJrcyxcbiAgLy8gaW5saW5lIG1hdGgsIGhhcmQgYnJlYWtzLCBhbmQgYmxhbmsgdG9rZW5zLiBEZWxpYmVyYXRlbHkgTk9UIGEgYmxvY2sgYXJyYXk6XG4gIC8vIGl0IGtlZXBzIGV2ZXJ5IGNlbGwgd2Fsa2FibGUsIGtlZXBzIHRoZSBzY2hlbWEgbm9uLXJlY3Vyc2l2ZSAoc2VlIHRoZVxuICAvLyBUUzcwNTYgbm90ZSBpbiBpbmxpbmUudHMpLCBhbmQga2VlcHMgYSBjZWxsIGEgY2VsbCByYXRoZXIgdGhhbiBhIHBhZ2UuXG4gIGNvbnRlbnQ6IHouYXJyYXkoRmlsbEluQmxhbmtJbmxpbmUpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBUYWJsZUNlbGwgPSB6LmluZmVyPHR5cGVvZiBUYWJsZUNlbGw+O1xuXG4vLyBOTyBgdHlwZWAgRklFTEQgXHUyMDE0IHNlZSB0aGUgaGVhZGVyLlxuZXhwb3J0IGNvbnN0IFRhYmxlUm93ID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIGNlbGxzOiB6LmFycmF5KFRhYmxlQ2VsbCkuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCB0eXBlIFRhYmxlUm93ID0gei5pbmZlcjx0eXBlb2YgVGFibGVSb3c+O1xuXG5leHBvcnQgY29uc3QgVGFibGVCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ3RhYmxlJyksXG4gIC8vIEF1dG8tYXNzaWduZWQgd29ya3NoZWV0IG51bWJlciwgYXMgb24gZXZlcnkgbnVtYmVyZWQgYmxvY2suIFByZXNlbnQgb25seVxuICAvLyB3aGVuIHRoZSB0YWJsZSBpcyBncmFkYWJsZSAoYSBibGFua2xlc3MgdGFibGUgaXMgYSBzdGltdWx1cywgbm90IGFcbiAgLy8gcXVlc3Rpb24pIFx1MjAxNCByZXNvbHZlZCBieSBudW1iZXJpbmcsIG5vdCBzdG9yZWQgYXV0aG9yaXR5LlxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAvLyBXaGljaCBheGlzIGNhcnJpZXMgdGhlIGhlYWRlcnMuIFR3byBib29sZWFucyByYXRoZXIgdGhhbiBhIHBlci1jZWxsIGZsYWc6XG4gIC8vIGEgaGVhZGVyIGNlbGwgaW4gdGhlIE1JRERMRSBvZiBhIHRhYmxlIGlzIG5vdCBhIHRoaW5nIHRoaXMgdm9jYWJ1bGFyeVxuICAvLyBzaG91bGQgYmUgYWJsZSB0byBleHByZXNzLCBhbmQgdGhlIGExMXkgc3RvcnkgbmVlZHMgdG8ga25vdyB3aGljaCBheGlzXG4gIC8vIG5hbWVzIGEgY2VsbCAoXCJLaWxvZ3JhbXMgMiwgQ29zdFwiIHJlYWRzIGNvcnJlY3RseSBvbmx5IGlmIHdlIGtub3cgd2hlcmUgdGhlXG4gIC8vIGxhYmVscyBsaXZlKS4gYGhlYWRlckNvbHVtbmAgaXMgbm90IGRlY29yYXRpb24gXHUyMDE0IGFsZ2VicmEgdGFibGVzIGFyZSBhc1xuICAvLyBvZnRlbiB0cmFuc3Bvc2VkICh4IGRvd24gdGhlIGxlZnQpIGFzIG5vdC5cbiAgaGVhZGVyUm93OiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICBoZWFkZXJDb2x1bW46IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAvLyBQZXItY29sdW1uIGFsaWdubWVudCwgaW5kZXgtYWxpZ25lZCB3aXRoIGVhY2ggcm93J3MgY2VsbHMuIE9wdGlvbmFsIHdpdGggTk9cbiAgLy8gZGVmYXVsdCBzbyBhIHRhYmxlIGF1dGhvcmVkIHdpdGhvdXQgYWxpZ25tZW50IHJlLXNlcmlhbGl6ZXMgYnl0ZS1pZGVudGljYWxseVxuICAvLyAodGhlIHNhbWUgb3B0aW9uYWwtbm8tZGVmYXVsdCBkaXNjaXBsaW5lIGFzIEJsYW5rVG9rZW4uYW5zd2VyVHlwZSkuIEEgc2hvcnRcbiAgLy8gYXJyYXkgaXMgZmluZTogY29sdW1ucyBwYXN0IGl0cyBlbmQgZmFsbCBiYWNrIHRvIGxlZnQuXG4gIGNvbHVtbkFsaWduczogei5hcnJheShUYWJsZUNvbHVtbkFsaWduKS5vcHRpb25hbCgpLFxuICAvLyBUaGUgKGEpLyhiKSBtYXJrZXJzIG9uIGJsYW5rIGNlbGxzLiBNaXJyb3JzIGZhZGVkX3dvcmtlZF9leGFtcGxlJ3NcbiAgLy8gc2hvd1N0ZXBMYWJlbHMgXHUyMDE0IG9mZiBnaXZlcyBhIHRlYWNoZXIgbWF4aW11bSB3cml0aW5nIHJvb20gb24gcGFwZXIuXG4gIC8vIERlZmF1bHRlZCBzbyBhIGRvY3VtZW50IGF1dGhvcmVkIGJlZm9yZSB0aGlzIGZpZWxkIHJlbmRlcnMgbGFiZWxsZWQuXG4gIHNob3dDZWxsTGFiZWxzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICByb3dzOiB6LmFycmF5KFRhYmxlUm93KS5kZWZhdWx0KFtdKSxcbiAgLy8gVGhlIHRhYmxlJ3Mgb3duIHBhZ2UgbGFiZWwgKGF1dG8vY3VzdG9tL25vbmUpLCBsaWtlIGV2ZXJ5IG51bWJlcmVkIHR5cGUuXG4gIC4uLmxhYmVsRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBUYWJsZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgVGFibGVCbG9jaz47XG5cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gYmxvY2tzL2luZGV4LnRzIFx1MjAxNCBCbG9jayBkaXNjcmltaW5hdGVkIHVuaW9uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2luZ2xlIHNvdXJjZSBvZiB0cnV0aCBmb3IgXCJ3aGF0IGJsb2NrIHR5cGVzIGV4aXN0IGluIFBoYXNlIDEuXCIgQWRkaW5nIGFcbi8vIG5ldyBibG9jayB0eXBlIG1lYW5zOiBuZXcgZmlsZSB1bmRlciBibG9ja3MvLCBuZXcgZW50cnkgaGVyZSwgbmV3IGZhY3Rvcnlcbi8vIGluIGZhY3Rvcmllcy50cywgbmV3IHJlbmRlcmVyIGluIEBhY3Rpdml0eS9yZW5kZXJlci9ibG9ja3MvLiBUaHJlZSBwbGFjZXMsXG4vLyBhbHdheXMgaW4gdGhhdCBvcmRlci5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG5pbXBvcnQgeyBQYXJhZ3JhcGhCbG9jayB9IGZyb20gJy4vcGFyYWdyYXBoLmpzJztcbmltcG9ydCB7IEhlYWRpbmdCbG9jayB9IGZyb20gJy4vaGVhZGluZy5qcyc7XG5pbXBvcnQgeyBNYXRoQmxvY2sgfSBmcm9tICcuL21hdGgtYmxvY2suanMnO1xuaW1wb3J0IHsgSW1hZ2VCbG9jaywgQ3JvcFJlY3QgfSBmcm9tICcuL2ltYWdlLmpzJztcbmltcG9ydCB7IENhbGxvdXRCbG9jayB9IGZyb20gJy4vY2FsbG91dC5qcyc7XG5pbXBvcnQgeyBQcm9ibGVtQmxvY2sgfSBmcm9tICcuL3Byb2JsZW0uanMnO1xuaW1wb3J0IHsgRmlsbEluQmxhbmtCbG9jayB9IGZyb20gJy4vZmlsbC1pbi1ibGFuay5qcyc7XG5pbXBvcnQgeyBCdWxsZXRMaXN0QmxvY2ssIE9yZGVyZWRMaXN0QmxvY2ssIExpc3RJdGVtIH0gZnJvbSAnLi9saXN0LmpzJztcbmltcG9ydCB7IEludGVyYWN0aXZlR3JhcGhCbG9jayB9IGZyb20gJy4vaW50ZXJhY3RpdmUtZ3JhcGguanMnO1xuaW1wb3J0IHsgTXVsdGlwbGVDaG9pY2VCbG9jayB9IGZyb20gJy4vbXVsdGlwbGUtY2hvaWNlLmpzJztcbmltcG9ydCB7IE1hdGNoaW5nQmxvY2sgfSBmcm9tICcuL21hdGNoaW5nLmpzJztcbmltcG9ydCB7IE9yZGVyaW5nQmxvY2sgfSBmcm9tICcuL29yZGVyaW5nLmpzJztcbmltcG9ydCB7IE51bWJlckxpbmVCbG9jayB9IGZyb20gJy4vbnVtYmVyLWxpbmUuanMnO1xuaW1wb3J0IHsgRGF0YVBsb3RCbG9jayB9IGZyb20gJy4vZGF0YS1wbG90LmpzJztcbmltcG9ydCB7IExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrIH0gZnJvbSAnLi9sZWFybmluZy1vYmplY3RpdmVzLmpzJztcbmltcG9ydCB7IFdvcmtlZEV4YW1wbGVCbG9jayB9IGZyb20gJy4vd29ya2VkLWV4YW1wbGUuanMnO1xuaW1wb3J0IHsgR3JhcGhGaWd1cmVCbG9jayB9IGZyb20gJy4vZ3JhcGgtZmlndXJlLmpzJztcbmltcG9ydCB7IEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrIH0gZnJvbSAnLi9mYWRlZC13b3JrZWQtZXhhbXBsZS5qcyc7XG5pbXBvcnQgeyBTZWxmRXhwbGFuYXRpb25CbG9jayB9IGZyb20gJy4vc2VsZi1leHBsYW5hdGlvbi5qcyc7XG5pbXBvcnQgeyBTaG9ydEFuc3dlckJsb2NrLCBFc3NheUJsb2NrIH0gZnJvbSAnLi9mcmVlLXJlc3BvbnNlLmpzJztcbmltcG9ydCB7IFRhYmxlQmxvY2sgfSBmcm9tICcuL3RhYmxlLmpzJztcblxuZXhwb3J0IGNvbnN0IEJsb2NrID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFBhcmFncmFwaEJsb2NrLFxuICBIZWFkaW5nQmxvY2ssXG4gIE1hdGhCbG9jayxcbiAgSW1hZ2VCbG9jayxcbiAgQ2FsbG91dEJsb2NrLFxuICBQcm9ibGVtQmxvY2ssXG4gIEZpbGxJbkJsYW5rQmxvY2ssXG4gIEJ1bGxldExpc3RCbG9jayxcbiAgT3JkZXJlZExpc3RCbG9jayxcbiAgSW50ZXJhY3RpdmVHcmFwaEJsb2NrLFxuICBNdWx0aXBsZUNob2ljZUJsb2NrLFxuICBNYXRjaGluZ0Jsb2NrLFxuICBPcmRlcmluZ0Jsb2NrLFxuICBOdW1iZXJMaW5lQmxvY2ssXG4gIERhdGFQbG90QmxvY2ssXG4gIExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrLFxuICBXb3JrZWRFeGFtcGxlQmxvY2ssXG4gIEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrLFxuICBTZWxmRXhwbGFuYXRpb25CbG9jayxcbiAgU2hvcnRBbnN3ZXJCbG9jayxcbiAgRXNzYXlCbG9jayxcbiAgR3JhcGhGaWd1cmVCbG9jayxcbiAgVGFibGVCbG9jayxcbl0pO1xuZXhwb3J0IHR5cGUgQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBCbG9jaz47XG5cbi8vIE5PVEU6IGxheW91dCBpcyBOT1QgYSBibG9jay4gUm93cy9Db2x1bW5zIChwYWNrYWdlcy9zY2hlbWEvc3JjL2xheW91dC50cykgYXJlXG4vLyB0aGUgc3RydWN0dXJhbCBjb250YWluZXIgQUJPVkUgYmxvY2tzIFx1MjAxNCBhIENvbHVtbiBob2xkcyBCbG9ja1tdLCBuZXZlciB0aGVcbi8vIHJldmVyc2UgXHUyMDE0IHNvIHRoZSBCbG9jayB1bmlvbiBpcyBsZWFmIGJsb2NrcyBvbmx5IGFuZCBjYW4gbmV2ZXIgbmVzdCBhIHJvdy5cblxuLy8gUmUtZXhwb3J0IGluZGl2aWR1YWwgYmxvY2sgdHlwZXMgc28gY29uc3VtZXJzIGNhbiBpbXBvcnQgdGhlbSBieSBuYW1lLlxuZXhwb3J0IHtcbiAgUGFyYWdyYXBoQmxvY2ssXG4gIEhlYWRpbmdCbG9jayxcbiAgTWF0aEJsb2NrLFxuICBJbWFnZUJsb2NrLFxuICBDcm9wUmVjdCxcbiAgQ2FsbG91dEJsb2NrLFxuICBQcm9ibGVtQmxvY2ssXG4gIEZpbGxJbkJsYW5rQmxvY2ssXG4gIEJ1bGxldExpc3RCbG9jayxcbiAgT3JkZXJlZExpc3RCbG9jayxcbiAgTGlzdEl0ZW0sXG4gIEludGVyYWN0aXZlR3JhcGhCbG9jayxcbn07XG5leHBvcnQge1xuICBNdWx0aXBsZUNob2ljZUJsb2NrLFxuICBNdWx0aXBsZUNob2ljZU9wdGlvbixcbiAgQ2hvaWNlSW1hZ2UsXG4gIENob2ljZUdyYXBoLFxufSBmcm9tICcuL211bHRpcGxlLWNob2ljZS5qcyc7XG5leHBvcnQgeyBNYXRjaGluZ0Jsb2NrLCBNYXRjaGluZ0l0ZW0sIE1hdGNoaW5nVGFyZ2V0IH0gZnJvbSAnLi9tYXRjaGluZy5qcyc7XG5leHBvcnQgeyBPcmRlcmluZ0Jsb2NrLCBPcmRlcmluZ0l0ZW0gfSBmcm9tICcuL29yZGVyaW5nLmpzJztcbmV4cG9ydCB7XG4gIE51bWJlckxpbmVCbG9jayxcbiAgTnVtYmVyTGluZUNvbmZpZyxcbiAgTnVtYmVyTGluZUludGVyYWN0aW9uLFxuICBOdW1iZXJMaW5lUG9pbnRJbnRlcmFjdGlvbixcbiAgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb24sXG4gIE51bWJlckxpbmVJbnRlcnZhbCxcbn0gZnJvbSAnLi9udW1iZXItbGluZS5qcyc7XG5leHBvcnQge1xuICBEYXRhUGxvdEJsb2NrLFxuICBEYXRhUGxvdENvbmZpZyxcbiAgRGF0YVBsb3RDaGFydCxcbiAgRGF0YVBsb3RJbnRlcmFjdGlvbixcbiAgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb24sXG4gIERhdGFQbG90RG90cGxvdEludGVyYWN0aW9uLFxuICBEYXRhUGxvdEhpc3RvZ3JhbUludGVyYWN0aW9uLFxuICBEYXRhUGxvdEJveHBsb3RJbnRlcmFjdGlvbixcbn0gZnJvbSAnLi9kYXRhLXBsb3QuanMnO1xuZXhwb3J0IHsgTGVhcm5pbmdPYmplY3RpdmVzQmxvY2sgfSBmcm9tICcuL2xlYXJuaW5nLW9iamVjdGl2ZXMuanMnO1xuZXhwb3J0IHsgV29ya2VkRXhhbXBsZUJsb2NrLCBXb3JrZWRFeGFtcGxlQ2hpbGQgfSBmcm9tICcuL3dvcmtlZC1leGFtcGxlLmpzJztcbmV4cG9ydCB7IEdyYXBoRmlndXJlQmxvY2sgfSBmcm9tICcuL2dyYXBoLWZpZ3VyZS5qcyc7XG5leHBvcnQge1xuICBGYWRlZFdvcmtlZEV4YW1wbGVCbG9jayxcbiAgRmFkZWRXb3JrZWRFeGFtcGxlQ2hpbGQsXG59IGZyb20gJy4vZmFkZWQtd29ya2VkLWV4YW1wbGUuanMnO1xuZXhwb3J0IHsgU2VsZkV4cGxhbmF0aW9uQmxvY2sgfSBmcm9tICcuL3NlbGYtZXhwbGFuYXRpb24uanMnO1xuZXhwb3J0IHtcbiAgU2hvcnRBbnN3ZXJCbG9jayxcbiAgRXNzYXlCbG9jayxcbiAgV29yZENvdW50SGludCxcbiAgUnVicmljLFxuICBSdWJyaWNDcml0ZXJpb24sXG59IGZyb20gJy4vZnJlZS1yZXNwb25zZS5qcyc7XG5leHBvcnQge1xuICBUYWJsZUJsb2NrLFxuICBUYWJsZVJvdyxcbiAgVGFibGVDZWxsLFxuICBUYWJsZUNvbHVtbkFsaWduLFxufSBmcm9tICcuL3RhYmxlLmpzJztcbi8vIEZyb20gdGhlIHpvZC1mcmVlIG1vZHVsZSwgTk9UICcuL3RhYmxlLmpzJyBcdTIwMTQgc2VlIHRhYmxlLWJsYW5rLWlkcy50cy4gUm91dGluZ1xuLy8gaXQgdGhyb3VnaCB0aGUgc2NoZW1hIG1vZHVsZSB3b3VsZCBwdXQgem9kIGJhY2sgaW4gdGhlIHN0dWRlbnQgc2hlbGwgZm9yXG4vLyBhbnlvbmUgd2hvIHJlYWNoZXMgdGhpcyBiYXJyZWwuXG5leHBvcnQgeyB0YWJsZUJsYW5rSWRzIH0gZnJvbSAnLi4vdGFibGUtYmxhbmstaWRzLmpzJztcbmV4cG9ydCB0eXBlIHsgVGFibGVCbGFua1NvdXJjZSB9IGZyb20gJy4uL3RhYmxlLWJsYW5rLWlkcy5qcyc7XG5leHBvcnQge1xuICBBeGlzQ29uZmlnLFxuICBQb2ludEludGVyYWN0aW9uLFxuICBGdW5jdGlvbkludGVyYWN0aW9uLFxuICBGdW5jdGlvbk1vZGVsLFxuICBSZWdpb25JbnRlcmFjdGlvbixcbiAgUmF5SW50ZXJhY3Rpb24sXG4gIFJheUFuc3dlcixcbiAgU2VnbWVudEludGVyYWN0aW9uLFxuICBTZWdtZW50QW5zd2VyLFxuICBFbmRwb2ludFN0eWxlLFxuICBEcmF3YWJsZSxcbiAgRHJhd2FibGVDb2xvcixcbiAgRGlzcGxheUludGVyYWN0aW9uLFxuICBHcmFwaEludGVyYWN0aW9uLFxufSBmcm9tICcuL2ludGVyYWN0aXZlLWdyYXBoLmpzJztcbmV4cG9ydCB0eXBlIHsgSGVhZGluZ0xldmVsIH0gZnJvbSAnLi9oZWFkaW5nLmpzJztcbmV4cG9ydCB0eXBlIHsgQ2FsbG91dFZhcmlhbnQgfSBmcm9tICcuL2NhbGxvdXQuanMnO1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBsYXlvdXQudHMgXHUyMDE0IFN0cnVjdHVyYWwgbGF5b3V0IGxheWVyOiBSb3cgKyBDb2x1bW5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgZG9jdW1lbnQgYm9keSBpcyBhIHN0YWNrIG9mIFJPV1MuIEEgcm93IGxheXMgaXRzIGNoaWxkIGNvbHVtbnMgc2lkZSBieVxuLy8gc2lkZTsgZWFjaCBjb2x1bW4gaG9sZHMgaXRzIG93biBTVEFDSyBvZiBibG9ja3MgKGJsb2NrKykuIE9uZSBjb2x1bW4gaXMgdGhlXG4vLyBpZGVudGl0eS9kZWZhdWx0IFx1MjAxNCBhIDEtY29sdW1uIHJvdyBpcyB0aGUgbm9ybWFsIGZ1bGwtd2lkdGggdmVydGljYWwgZmxvdywgYW5kXG4vLyBcImFkZCBjb2x1bW5zXCIgc3BsaXRzIGEgcm93IGludG8gbW9yZSBjb2x1bW5zLiBUaGlzIHJlcGxhY2VzIHRoZSBvbGQgYGNvbHVtbnNgXG4vLyBibG9jayB0eXBlOiBsYXlvdXQgaXMgbm93IHRoZSB1bml2ZXJzYWwgY29udGFpbmVyIGluc3RlYWQgb2YgYW4gaW5zZXJ0ZWRcbi8vIGJsb2NrLCB3aGljaCBpcyBob3cgcXVhbGl0eSBwcmludCBlbmdpbmVzIChJbkRlc2lnbiwgcHJpbnQgQ1NTKSBhbmQgd2ViXG4vLyBsYXlvdXQgdG9vbHMgbW9kZWwgYSBkb2N1bWVudC5cbi8vXG4vLyBObyByZWN1cnNpb246IGByb3dgIGFuZCBgY29sdW1uYCBhcmUgTk9UIG1lbWJlcnMgb2YgdGhlIEJsb2NrIHVuaW9uIChCbG9jayBpc1xuLy8gbGVhZiBibG9ja3Mgb25seSksIHNvIGEgQ29sdW1uJ3MgYGJsb2NrczogQmxvY2tbXWAgY2FuIG5ldmVyIGNvbnRhaW4gYSBSb3cuXG4vLyBUaGUgb2xkIGNvbHVtbnMtaW4tY29sdW1ucyBndWFyZCAoYW4gZW51bWVyYXRlZCBjZWxsIHVuaW9uKSBpcyB0aGVyZWZvcmUgYVxuLy8gc3RydWN0dXJhbCBmYWN0IGhlcmUsIG5vdCBhbiBlbmZvcmNlZCBleGNsdXNpb24uXG4vL1xuLy8gd2lkdGggaXMgYW4gb3B0aW9uYWwgdW5pdGxlc3Mgd2VpZ2h0IHBlciBjb2x1bW46IGEgY29sdW1uIHdpdGggd2lkdGggMiBiZXNpZGVcbi8vIGEgY29sdW1uIHdpdGggd2lkdGggMSB0YWtlcyAyLzMgb2YgdGhlIHJvdy4gQWJzZW50IFx1MjE5MiBlcXVhbCBzcGxpdC4gVGhpcyBpcyB0aGVcbi8vIHJlYXNvbiBsYXlvdXQgaXMgc3RydWN0dXJhbCByYXRoZXIgdGhhbiBhIENTUyB0b2dnbGUgXHUyMDE0IFwid2lkZSB3b3JrZWQgZXhhbXBsZSArXG4vLyBuYXJyb3cgYW5zd2VyIHN0cmlwXCIgbmVlZHMgdW5lcXVhbCB3aWR0aHMuXG4vL1xuLy8gbWluSGVpZ2h0IGlzIGEgcmVzZXJ2ZWQgd29yay1zcGFjZSBmbG9vciBpbiByZW0uIFRoZSBjZWxsIHN0aWxsIEdST1dTIHdpdGhcbi8vIGNvbnRlbnQgKGEgZmxvb3IsIG5vdCBhIGZpeGVkIGhlaWdodCBcdTIwMTQgZml4ZWQgaGVpZ2h0cyBicmVhayBwcmludCByZWZsb3cgYW5kXG4vLyB0aGUgZm9sZGFibGUncyBoZWlnaHQgbWVhc3VyZW1lbnQpLiByZW0gc28gdGhlIHJlc2VydmVkIHNwYWNlIHNjYWxlcyB3aXRoIHRoZVxuLy8gcHJpbnQgZm9udC1zaXplIGNvbmZpZy4gQWJzZW50ID0gY29udGVudC1kZXRlcm1pbmVkIGhlaWdodC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG5pbXBvcnQgeyBCbG9jayB9IGZyb20gJy4vYmxvY2tzL2luZGV4LmpzJztcblxuLy8gZ3JpZExpbmVzIHR1cm5zIGEgcm93IGludG8gYSBydWxlZCBncmlkOiBhIGJvcmRlciBhcm91bmQgdGhlIHdob2xlIHJvdywgcnVsZXNcbi8vIGJldHdlZW4gdGhlIGNlbGxzLCBhbmQgcnVsZXMgYmV0d2VlbiB0aGUgc3RhY2tlZCBibG9ja3Mgd2l0aGluIGEgY2VsbC5cbi8vIEVzcGVjaWFsbHkgdXNlZnVsIGluIHByaW50IChib3hlZCByZWdpb25zIHRvIHdyaXRlIGluIC8gY3V0IG91dCkuIFRyaS1zdGF0ZSBzb1xuLy8gYSByb3cgY2FuIGRlZmVyIHRvIHRoZSBhY3Rpdml0eS13aWRlIGRlZmF1bHQ6XG4vLyAgICdpbmhlcml0JyBcdTIwMTQgZm9sbG93IG1ldGEucHJpbnQuZ3JpZExpbmVzICh0aGUgYWN0aXZpdHkgZGVmYXVsdDsgdGhlIHJlbmRlcmVyXG4vLyAgICAgICAgICAgICAgIHJlc29sdmVzIHRoaXMpLiBEZWZhdWx0LCBzbyBhIGZyZXNobHkgYXV0aG9yZWQgcm93IHRyYWNrcyB0aGVcbi8vICAgICAgICAgICAgICAgYWN0aXZpdHkgc2V0dGluZyB3aXRob3V0IHBlci1yb3cgZmlkZGxpbmcuXG4vLyAgICdvbicgICAgICBcdTIwMTQgYWx3YXlzIHJ1bGVkLCByZWdhcmRsZXNzIG9mIHRoZSBhY3Rpdml0eSBkZWZhdWx0LlxuLy8gICAnb2ZmJyAgICAgXHUyMDE0IG5ldmVyIHJ1bGVkLCByZWdhcmRsZXNzIG9mIHRoZSBhY3Rpdml0eSBkZWZhdWx0LlxuZXhwb3J0IGNvbnN0IENvbHVtbkdyaWRMaW5lcyA9IHouZW51bShbJ2luaGVyaXQnLCAnb24nLCAnb2ZmJ10pO1xuZXhwb3J0IHR5cGUgQ29sdW1uR3JpZExpbmVzID0gei5pbmZlcjx0eXBlb2YgQ29sdW1uR3JpZExpbmVzPjtcblxuZXhwb3J0IGNvbnN0IENvbHVtbiA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAvLyBQZXItY29sdW1uIHdpZHRoIHdlaWdodCAoZnIgdW5pdHMpLiBPcHRpb25hbDsgYWJzZW50ID0gZXF1YWwgc3BsaXQuXG4gIHdpZHRoOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLy8gUmVzZXJ2ZWQgd29yay1zcGFjZSBmbG9vciBpbiByZW0gKGEgbWluLWhlaWdodCwgbm90IGEgZml4ZWQgaGVpZ2h0KS5cbiAgbWluSGVpZ2h0OiB6Lm51bWJlcigpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLy8gQSBjb2x1bW4gaG9sZHMgYSBub24tZW1wdHkgU1RBQ0sgb2YgYmxvY2tzIChibG9jayspLiBBIGNvbHVtbiBjYW4gaG9sZCBhXG4gIC8vIGhlYWRpbmcgZm9sbG93ZWQgYnkgc2V2ZXJhbCBwcm9ibGVtcyBcdTIwMTQgdGhlIHRoaW5nIGEgZG9jdW1lbnQgdG9vbCBuZWVkcyBhbmRcbiAgLy8gYSBvbmUtYmxvY2stcGVyLXJvdyBtb2RlbCBjYW4ndCBleHByZXNzLlxuICBibG9ja3M6IHouYXJyYXkoQmxvY2spLm1pbigxKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ29sdW1uID0gei5pbmZlcjx0eXBlb2YgQ29sdW1uPjtcblxuLy8gMS4uNiBjb2x1bW5zLiBUaGUgZWRpdG9yIHN1cmZhY2VzIGEgbm9uLWJsb2NraW5nIHdhcm5pbmcgYWJvdmUgMyAodG9vIG5hcnJvd1xuLy8gdG8gcmVhZCBvbiBwYXBlciBvciBhIENocm9tZWJvb2spLCBidXQgdGhlIHNjaGVtYSBhY2NlcHRzIHVwIHRvIDYgc28gYW5cbi8vIGludGVudGlvbmFsIGRlbnNlIGxheW91dCBzdGlsbCB2YWxpZGF0ZXMuIE9uZSBjb2x1bW4gaXMgdGhlIGlkZW50aXR5IHN0YXRlOlxuLy8gYSBmdWxsLXdpZHRoIHJvdyB0aGF0IFwicmVtb3ZlIGNvbHVtblwiIGNhbm5vdCBkaXNzb2x2ZSBiZWxvdy5cbmV4cG9ydCBjb25zdCBSb3cgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgY29sdW1uczogei5hcnJheShDb2x1bW4pLm1pbigxKS5tYXgoNiksXG4gIGdyaWRMaW5lczogQ29sdW1uR3JpZExpbmVzLmRlZmF1bHQoJ2luaGVyaXQnKSxcbn0pO1xuZXhwb3J0IHR5cGUgUm93ID0gei5pbmZlcjx0eXBlb2YgUm93PjtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gZG9jdW1lbnQudHMgXHUyMDE0IFRvcC1sZXZlbCBBY3Rpdml0eURvY3VtZW50IGFuZCBTZWN0aW9uIHNjaGVtYXNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBY3Rpdml0eURvY3VtZW50IGlzIHdoYXQgZ2V0cyBzdG9yZWQgaW4gYWN0aXZpdGllcy5kcmFmdF9jb250ZW50IGFuZFxuLy8gYWN0aXZpdHlfdmVyc2lvbnMuY29udGVudC4gVGhlIHNoYXBlIGxpdmVzIGluIHRoaXMgcGFja2FnZSBhcyB0aGUgc2luZ2xlXG4vLyBzb3VyY2Ugb2YgdHJ1dGggXHUyMDE0IHRoZSByZW5kZXJlciBwYXJzZXMgaXQsIHRoZSBlZGl0b3IgcHJvZHVjZXMgaXQgdmlhIHRoZVxuLy8gc2VyaWFsaXplIGxheWVyLCB0aGUgZGF0YWJhc2Ugc3RvcmVzIGl0IGFzIGpzb25iLlxuLy9cbi8vIHNjaGVtYVZlcnNpb24gaXMgdGhlIG1pZ3JhdGlvbiBhbmNob3IuIEl0IGlzIGN1cnJlbnRseSAyLiBUaGUgMVx1MjE5MjIgcmVzaGFwZVxuLy8gKGJsb2NrLXN0cmVhbSBzZWN0aW9ucyBcdTIxOTIgcm93cy1vZi1jb2x1bW5zKSB3YXMgYSBHUkVFTkZJRUxEIEhBUkQtQ1VUOiB0aGVyZSB3YXNcbi8vIG5vIHByb2R1Y3Rpb24gZGF0YSB0byBwcmVzZXJ2ZSwgc28gdGhlcmUgaXMgZGVsaWJlcmF0ZWx5IE5PIG1pZ3JhdGUoMVx1MjE5MjIpIGFuZFxuLy8gTk8gbWlncmF0ZS1vbi1yZWFkIFx1MjAxNCB0aGUgcGFyc2VyIGlzIHoubGl0ZXJhbCgyKSBhbmQgUkVKRUNUUyBhIHYxIGRvY3VtZW50XG4vLyAoYSBzdHJheSB2MSBmYWlscyBsb3VkbHkgYXQgcGFyc2UgcmF0aGVyIHRoYW4gbWlzLXBhcnNpbmcgaW50byBnYXJiYWdlKS5cbi8vIFdoZW4gYSBGVVRVUkUgc2NoZW1hIG5lZWRzIGEgbm9uLXRyaXZpYWwgbWlncmF0aW9uIGFnYWluc3QgcmVhbCBzdG9yZWQgZGF0YSxcbi8vIGJ1bXAgdGhlIHZlcnNpb24gYW5kIGFkZCBhIG1pZ3JhdGUoTiAtPiBOKzEpIHRoYXQgcnVucyBvbiByZWFkIChvbGRcbi8vIGFjdGl2aXR5X3ZlcnNpb25zIHJvd3Mgc3RheSBhdCB0aGVpciBvcmlnaW5hbCBzY2hlbWFWZXJzaW9uIGZvcmV2ZXI7IG1pZ3JhdGVcbi8vIG9uIHJlYWQsIG5ldmVyIGJ5IG11dGF0aW5nIHN0b3JlZCB2ZXJzaW9ucykuIFRoZSBncmVlbmZpZWxkIGhhcmQtY3V0IGlzIGFcbi8vIG9uZS10aW1lIGV4Y2VwdGlvbiwgbm90IHRoZSBnZW5lcmFsIHBvbGljeS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgQmxvY2sgfSBmcm9tICcuL2Jsb2Nrcy9pbmRleC5qcyc7XG5pbXBvcnQgeyBSb3cgfSBmcm9tICcuL2xheW91dC5qcyc7XG5cbi8vIFNlY3Rpb246IGEgY29sbGVjdGlvbiBvZiBST1dTIHdpdGggYW4gb3B0aW9uYWwgdGl0bGUuIFNlY3Rpb25zIGFyZSB0aGVcbi8vIHZlcnRpY2FsIGNoZWNrcG9pbnQgcHJpbWl0aXZlOyByb3dzIGFyZSB0aGUgaG9yaXpvbnRhbC1zcGxpdCBwcmltaXRpdmVcbi8vIChsYXlvdXQudHMpLiBBIHNlY3Rpb24gaXMgdXN1YWxseSBvbmUgMS1jb2x1bW4gcm93IHdob3NlIGNvbHVtbiBzdGFja3MgbWFueVxuLy8gYmxvY2tzOyBhIGNvbHVtbmVkIHJlZ2lvbiBpcyBhIG11bHRpLWNvbHVtbiByb3cuIFNlY3Rpb25zIGFyZSBvcmdhbml6YXRpb25hbFxuLy8gb25seSBcdTIwMTQgdGhleSBkb24ndCBjb25zdHJhaW4gY29udGVudCBiZXlvbmQgaG9sZGluZyByb3dzLlxuLy9cbi8vIGlzQ2hlY2twb2ludCBpcyB0aGUgYHtjaGVja3BvaW50fWAgbWFya2VyLCBhbmQgaXQgaXMgd2hlcmUgQ0hFQ0tJTkcgSEFQUEVOU1xuLy8gKGFjdGl2aXR5IGZsb3cgbW9kZXMsIFIxKS4gQSBjaGVja3BvaW50IHNlY3Rpb24ncyBDaGVjayBjb3ZlcnMgRVZFUlkgU0VDVElPTlxuLy8gU0lOQ0UgVEhFIFBSRVZJT1VTIENIRUNLUE9JTlQsIGluY2x1c2l2ZSBcdTIwMTQgbm90IGp1c3QgaXRzZWxmIFx1MjAxNCBhbmQgVEhFIEVORCBPRlxuLy8gVEhFIEFDVElWSVRZIElTIEFMV0FZUyBBIENIRUNLUE9JTlQsIHNvIG5vIHRyYWlsaW5nIHNlY3Rpb24gaXMgZXZlciBsZWZ0XG4vLyB1bi1jaGVja2FibGUgYW5kIGEgZG9jdW1lbnQgd2l0aCBubyBtYXJrZXIgYXQgYWxsIGRlZ3JhZGVzIHRvIGV4YWN0bHkgb25lXG4vLyBDaGVjayBhdCB0aGUgZW5kLiBJZ25vcmVkIGVudGlyZWx5IHdoZW4gc3VibWlzc2lvbk1vZGUgaXMgJ3NpbmdsZScuXG4vL1xuLy8gVGhlIGZvbGQgdGhhdCB0dXJucyB0aGVzZSBpbnRvIGNoZWNrIGdyb3VwcyBpc1xuLy8gcGFja2FnZXMvdmlld2VyL3NyYy9jb250YWluZXIvY2hlY2tHcm91cHMudHM7IHRoZSBndWFyZCB0aGF0IGJpbmRzIGl0IHRvXG4vLyByZW5kZXJlZCBvdXRwdXQgaXMgdGVzdHMvY29tcG9uZW50cy9jaGVjay1ncm91cHMudGVzdC50c3ggKGEgQ2hlY2sgYnV0dG9uXG4vLyBleGlzdHMgaW4gdGhlIERPTSBmb3IgZXZlcnkgc2VjdGlvbiwgaW4gZXZlcnkgbW9kZSkuXG5leHBvcnQgY29uc3QgU2VjdGlvbiA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0NoZWNrcG9pbnQ6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dzOiB6LmFycmF5KFJvdyksXG59KTtcbmV4cG9ydCB0eXBlIFNlY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBTZWN0aW9uPjtcblxuLy8gTWV0YTogdGhlIGFjdGl2aXR5J3MgdGl0bGUsIGNvdXJzZSwgdW5pdCwgZXRjLiBOb3QgdXNlZCBpbiByZW5kZXJpbmcgb2Zcbi8vIHRoZSBib2R5IFx1MjAxNCBkcml2ZXMgdGhlIHB1Ymxpc2hlZCBIVE1MJ3MgPHRpdGxlPiBhbmQgaGVhZGVyIGJhbm5lci5cbi8vXG4vLyBzdWJtaXNzaW9uTW9kZSBjb250cm9scyB0aGUgc3R1ZGVudC1mYWNpbmcgZmxvdy4gVHdvIHJlYWwgYmVoYXZpb3VycyBhbmQgb25lXG4vLyBhdXRob3JpbmcgY29udmVuaWVuY2UgKGFjdGl2aXR5IGZsb3cgbW9kZXMsIFIyKTpcbi8vICAgJ2ZyZWUnICAgKGRlZmF1bHQpIFx1MjAxNCBjaGVja3BvaW50cyBwZXIgUjE7IGEgZ3JvdXAgbWF5IGJlIHJlLWNoZWNrZWQgZnJlZWx5XG4vLyAgICdsb2NrZWQnIFx1MjAxNCBjaGVja3BvaW50cyBwZXIgUjE7IGEgZ3JvdXAncyBpbnB1dHMgRlJFRVpFIHRoZSBtb21lbnQgaXRzXG4vLyAgICAgICAgICAgICAgY2hlY2sgaXMgcHJlc3NlZCwgYW5kIHRoZSBTRVJWRVIgcmVmdXNlcyBhIHNlY29uZCBjaGVjayBmb3IgYVxuLy8gICAgICAgICAgICAgIHNlY3Rpb24gdGhhdCBhbHJlYWR5IGhhcyBvbmUgKHJlY29yZF9jaGVjaydzIHBfbG9ja2VkLCAwMDQwIFx1MjAxNFxuLy8gICAgICAgICAgICAgIGRlcml2ZWQgZnJvbSBUSElTIGZpZWxkLCBuZXZlciBmcm9tIGFueXRoaW5nIHRoZSBjbGllbnQgc2VuZHMpLlxuLy8gICAgICAgICAgICAgIFx1MjZBMCBUaGVyZSBpcyBubyB1bmxvY2sgaW4gdjE6IG5vdCBmb3IgdGhlIHN0dWRlbnQsIG5vdCBmb3IgdGhlXG4vLyAgICAgICAgICAgICAgdGVhY2hlci4gQSByZXB1Ymxpc2ggbWludHMgYSBuZXcgdmVyc2lvbiBhbmQgcmVzZXRzIGV2ZXJ5b25lLFxuLy8gICAgICAgICAgICAgIGFuZCB0aGF0IGlzIHRoZSBvbmx5IHVubG9jayB0aGVyZSBpcy5cbi8vICAgJ3NpbmdsZScgXHUyMDE0IG5vIG1pZC1hY3Rpdml0eSBjaGVja3BvaW50czsgdGhlIGVuZC1vZi1hY3Rpdml0eSBDaGVjayBpcyB0aGVcbi8vICAgICAgICAgICAgICBvbmx5IG9uZS4gUmVkdW5kYW50IHdpdGggJ2ZyZWUnICsgbm8gbWFya2VycyB1bmRlciBSMSwgYW5kIGtlcHRcbi8vICAgICAgICAgICAgICBiZWNhdXNlIGl0IHNheXMgdGhlIGludGVudCBwbGFpbmx5IGF0IGF1dGhvcmluZyB0aW1lLlxuLy9cbi8vIGFjdGl2aXR5VHlwZSBpcyBhIExBQkVMIChSNSk6IGl0IHJlbmRlcnMgYXMgdGV4dCBiZXNpZGUgY291cnNlL3VuaXQsIG9uXG4vLyBzY3JlZW4gYW5kIG9uIHBhcGVyIFx1MjAxNCBcIkV4aXQgdGlja2V0XCIgLyBcIldhcm0tdXBcIiAvIFwiUmV2aWV3XCI7ICd3b3Jrc2hlZXQnIGlzXG4vLyB0aGUgdW5tYXJrZWQgZGVmYXVsdCBhbmQgcmVuZGVycyBub3RoaW5nLiBJdCBkcml2ZXMgbm8gbGF5b3V0LiBJdCB1c2VkIHRvXG4vLyBjbGFpbSBpdCBkaWQgKFwiYW4gZXhpdF90aWNrZXQgcmVuZGVycyBhcyBhIHNpbmdsZS1wYWdlIGZvY3VzZWQgbGF5b3V0OyBhXG4vLyB3b3Jrc2hlZXQgcmVuZGVycyB3aXRoIGZ1bGwgc2VjdGlvbiBuYXZpZ2F0aW9uXCIpIGFuZCB0aGF0IHdhcyBuZXZlciBidWlsdCBpblxuLy8gdGhlIHZpZXdlciwgd2hpY2ggaGFzIE9ORSBsYXlvdXQgYW5kIG5vIHNlY3Rpb24gbmF2aWdhdGlvbi4gSXQgaXMgYWxzbyBOT1Rcbi8vIHRoZSBjYXRhbG9nIGZhY2V0IFx1MjAxNCB0aGF0IGlzIGBwZWRhZ29naWNhbF9yb2xlYCAoMDAzNyksIGEgZGlmZmVyZW50IGF4aXMgb25cbi8vIHB1cnBvc2UgKHNlZSBwYWNrYWdlcy9hcHAvc3JjL2xpYi9wZWRhZ29naWNhbFJvbGUudHMpLlxuLy9cbi8vIGFuc3dlckZlZWRiYWNrIGNvbnRyb2xzIFdIRU4gYSBjb3JyZWN0L2luY29ycmVjdCBzaWduYWwgYmVjb21lcyB2aXNpYmxlOlxuLy8gICAnb25fY2hlY2snICBcdTIwMTQgaGlkZGVuIHVudGlsIHRoZSBzdHVkZW50IGNoZWNrcy4gVEhFIE9OTFkgTElWRSBWQUxVRSwgYW5kXG4vLyAgICAgICAgICAgICAgICAgdGhlIHRyZWF0bWVudCBmb3IgYSBtaXNzaW5nIGZpZWxkLlxuLy8gICAnaW1tZWRpYXRlJyBcdTIwMTQgUkVTRVJWRUQsIE5PVCBZRVQgQUNUSVZFIChSMywgZGVmZXJyZWQgdG8gaXRzIG93biBzbGljZSkuXG4vLyAgICAgICAgICAgICAgICAgVGhlIGVkaXRvciBncmV5cyBpdCwgdGhlIGltcG9ydGVyIHdhcm5zLCBhbmQgdGhlIHZpZXdlclxuLy8gICAgICAgICAgICAgICAgIHRyZWF0cyBpdCBhcyAnb25fY2hlY2snLiBJdCBpcyBub3QgYnVpbHQgYmVjYXVzZSBub3RoaW5nIHRvXG4vLyAgICAgICAgICAgICAgICAgaGFuZyBpdCBvbiBleGlzdHMgeWV0OiBhbGwgZWxldmVuIGlucHV0IGNvbXBvbmVudHMgd3JpdGUgdG9cbi8vICAgICAgICAgICAgICAgICB0aGUgc3RvcmUgcGVyIGtleXN0cm9rZSwgc28gdGhlcmUgaXMgbm8gY29tbWl0IHNlYW07IG9ubHlcbi8vICAgICAgICAgICAgICAgICB0aGUgc2VydmVyIHNjb3JlcnMga25vdyB3aGF0IFwiYW5zd2VyZWRcIiBtZWFucyAodGhlIHNhbml0aXplclxuLy8gICAgICAgICAgICAgICAgIHN0cmlwcyB0aGUgZXhwZWN0ZWQgY291bnQsIHNvIHRoZSBjbGllbnQgY2Fubm90IGtub3cgYW5cbi8vICAgICAgICAgICAgICAgICBvcmRlcmluZyBvciBhIGdyYXBoIGlzIGNvbXBsZXRlKTsgYW5kIHRoZSByZS1maXJlIHJ1bGUgYWZ0ZXJcbi8vICAgICAgICAgICAgICAgICBhIGNvcnJlY3Rpb24gaXMgdW5kZXNpZ25lZC4gYGltbWVkaWF0ZWAgKyBgbG9ja2VkYCBpc1xuLy8gICAgICAgICAgICAgICAgIHJlZnVzZWQgYXQgYXV0aG9yaW5nLCBiZWNhdXNlIHRoZSBzZXJ2ZXIgY2Fubm90IHRlbGwgYW5cbi8vICAgICAgICAgICAgICAgICBhdXRvLWNoZWNrIGZyb20gYSBwcmVzcy5cbi8vXG4vLyBcdTI2QTAgVEhFIE9MRCBcInRoZSBydW50aW1lIGRlZmF1bHRzIGEgTUlTU0lORyBhbnN3ZXJGZWVkYmFjayB0byAnaW1tZWRpYXRlJ1wiXG4vLyBOT1RFIElTIERFQUQgKE9WIzIwKS4gSXQgZGVzY3JpYmVkIGBwYWNrYWdlcy9yZW5kZXJlcmAncyBydW50aW1lLCB3aGljaCB3YXNcbi8vIGRlbGV0ZWQgYXQgUzkgRHJvcCA0LiBNaXNzaW5nIG1lYW5zICdvbl9jaGVjaycsIHRoZSBzYW1lIGFzIHRoZSBzY2hlbWFcbi8vIGRlZmF1bHQgXHUyMDE0IHRoZXJlIGlzIG5vIGxvbmdlciBhIGJhY2stY29tcGF0IGZhbGxiYWNrIHRoYXQgZGlmZmVycy5cbi8vXG4vLyBcdTI2QjAgcmV2aXNpb25Nb2RlIGFuZCBncmFkaW5nTW9kZSB3ZXJlIERFTEVURUQgaW4gdGhlIGFjdGl2aXR5LWZsb3ctbW9kZXMgc2xpY2Vcbi8vIChSNCwgMjAyNi0wOC0yNCkgYW5kIG11c3Qgbm90IGNvbWUgYmFjayBzcGVjdWxhdGl2ZWx5LiByZXZpc2lvbk1vZGUgZ292ZXJuZWRcbi8vIFwiYWZ0ZXIgZmluYWwgc3VibWl0LCBtYXkgdGhlIHN0dWRlbnQgcmVzdWJtaXRcIiBcdTIwMTQgYW5kIHRoZXJlIGlzIG5vIHN1Ym1pdCBpblxuLy8gdGhlIHZpZXdlciwgc28gaXQgaGFkIG5vIHJlZmVyZW50OyByZS1jaGVja2luZyBpcyBzdWJtaXNzaW9uTW9kZSdzIGpvYi5cbi8vIGdyYWRpbmdNb2RlIGlzIERFUklWRUQsIG5vdCBhdXRob3JlZDogdGhlIHNlcnZlciBhbHJlYWR5IHJlY29yZHMgZnJlZSB0ZXh0IGFzXG4vLyBcInlvdXIgdGVhY2hlciB3aWxsIHJldmlld1wiIGFuZCBncmFkZXMgZXZlcnl0aGluZyBlbHNlIHB1cmVseSBmcm9tIGJsb2NrXG4vLyB0eXBlcywgc28gJ21hbnVhbCcgb24gYW4gYWxsLU1DIGFjdGl2aXR5IHdvdWxkIGJlIGEgbGllIGFuZCAnYXV0bycgb24gYW5cbi8vIGVzc2F5IHdvdWxkIGJlIGlnbm9yZWQuIFdoZW4gcGVyLWJsb2NrIGdyYWRpbmcgbWV0YWRhdGEgbGFuZHMgKHRoZVxuLy8gdGVhY2hlci1ncmFkaW5nIHNsaWNlJ3Mgb3duIGRlc2lnbiBzYXlzIGl0IG5lZWRzIGl0KSwgaXQgbGFuZHMgYXQgdGhlIEJMT0NLXG4vLyBncmFpbiwgbm90IGhlcmUuIE9sZCBzdG9yZWQgZG9jdW1lbnRzIGNhcnJ5aW5nIGVpdGhlciBmaWVsZCBwYXJzZSBmaW5lIFx1MjAxNFxuLy8gem9kIC5vYmplY3QoKSBzdHJpcHMgdW5rbm93biBrZXlzLCBzbyB0aGV5IHZhbmlzaCBvbiB0aGUgbmV4dCBzYXZlLlxuLy9cbi8vIHNraWxscyBpcyBhbiBhcnJheSBvZiB1bml2ZXJzYWwgc2tpbGwgdGFncyBkZXNjcmliaW5nIHdoYXQgdGhlIGFjdGl2aXR5XG4vLyB0ZWFjaGVzLiBBY3Rpb24tb3JpZW50ZWQsIGZyYW1ld29yay1uZXV0cmFsOiBcInNpbXBsaWZ5aW5nIHJhdGlvbmFsXG4vLyBleHByZXNzaW9uc1wiLCBcImZhY3RvcmluZyBxdWFkcmF0aWNzXCIsIFwiZ3JhcGhpbmcgcGFyYWJvbGFzXCIuIEEgdGVhY2hlciB3aG9cbi8vIHdhbnRzIHRvIHVzZSBURUtTIG9yIENDU1MgY29kZXMgY2FuIFx1MjAxNCB0aGUgZmllbGQgZG9lc24ndCB2YWxpZGF0ZSBhZ2FpbnN0XG4vLyBhbnkgZnJhbWV3b3JrLiBQaGFzZSA1IG1hcmtldHBsYWNlIGFkZHMgY29udHJvbGxlZCB2b2NhYnVsYXJ5IG9uIHRvcC5cbi8vXG4vLyBwcmludCBpcyB0aGUgdGVhY2hlci1jb25maWd1cmFibGUgcHJpbnQgbGF5ZXIgKHNlZSBQcmludENvbmZpZyBiZWxvdykuIEl0XG4vLyBpcyBhbHdheXMgcHJlc2VudCBhZnRlciBwYXJzZSAoZGVmYXVsdCB7fSksIHNvIGV2ZXJ5IGNvbnN1bWVyIGNhbiByZWFkXG4vLyBkb2MubWV0YS5wcmludC4qIHdpdGhvdXQgYW4gdW5kZWZpbmVkIGNoZWNrOyBkb2N1bWVudHMgc3RvcmVkIGJlZm9yZSB0aGlzXG4vLyBmaWVsZCBleGlzdGVkIGdldCB0aGUgZGVmYXVsdHMgYXBwbGllZCBvbiByZWFkLiBUaGUgZGVmYXVsdHMga2VlcCB0aGVcbi8vIFN0YWdlIDExIGJhc2VsaW5lIHBhZ2UgZ2VvbWV0cnkgKHNpbmdsZSBjb2x1bW4sIDAuNWluIG1hcmdpbiwgbGV0dGVyKSBhbmRcbi8vIGFkZCB0aGUgcHJpbnQgdHlwb2dyYXBoeSBTdGFnZSAxMSBkZWxpYmVyYXRlbHkgZGVmZXJyZWQgdG8gdGhpcyBmZWF0dXJlXG4vLyAoMTFwdCBib2R5LCAxcmVtIHByb2JsZW0gc3BhY2luZykgXHUyMDE0IHNvIGEgZnJlc2hseSBwdWJsaXNoZWQgcGFnZSBwcmludHMgaW4gYVxuLy8gc2Vuc2libGUgZGVmYXVsdCBzdHlsZSwgYW5kIHRoZSB0ZWFjaGVyIHR1bmVzIGZyb20gdGhlcmUuXG5cbi8vIFByaW50SGVhZGVyOiB3aGljaCBsYWJlbGVkIGZpbGwtaW4gbGluZXMgYXBwZWFyIGF0IHRoZSB0b3Agb2YgYSBwcmludGVkXG4vLyBzaGVldC4gTmFtZSArIERhdGUgYXJlIHRoZSBuZWFyLXVuaXZlcnNhbCBwYWlyLCBzbyB0aGV5IGRlZmF1bHQgb247IHRoZVxuLy8gcmVzdCBkZWZhdWx0IG9mZi4gY3VzdG9tIGhvbGRzIGV4dHJhIHRlYWNoZXItYXV0aG9yZWQgbGFiZWxzIChlLmcuXG4vLyBcIkJsb2NrXCIsIFwiVGVhY2hlclwiKSByZW5kZXJlZCBhcyB0aGVpciBvd24gZmlsbC1pbiBsaW5lcy4gVGhlIGhlYWRlciBpc1xuLy8gcHJpbnQtb25seSBcdTIwMTQgaXQgbmV2ZXIgc2hvd3Mgb24gc2NyZWVuICh0aGUgb24tc2NyZWVuIGlkZW50aXR5IHByb21wdCBpcyB0aGVcbi8vIGxpdmUgbmFtZSBmaWVsZCk7IHNlZSByZW5kZXJQcmludEhlYWRlciArIHRoZSBAbWVkaWEgcHJpbnQgcnVsZXMuXG5leHBvcnQgY29uc3QgUHJpbnRIZWFkZXIgPSB6Lm9iamVjdCh7XG4gIG5hbWU6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbTogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbn0pO1xuZXhwb3J0IHR5cGUgUHJpbnRIZWFkZXIgPSB6LmluZmVyPHR5cGVvZiBQcmludEhlYWRlcj47XG5cbi8vIFByaW50Q29uZmlnOiB0aGUgdGVhY2hlcidzIHByaW50IHNldHRpbmdzIGZvciBhbiBhY3Rpdml0eS4gRXZlcnkgZmllbGQgaXNcbi8vIGRlZmF1bHRlZCBzbyBQcmludENvbmZpZy5wYXJzZSh7fSkgeWllbGRzIGEgY29tcGxldGUsIGJhc2VsaW5lLWVxdWl2YWxlbnRcbi8vIGNvbmZpZyBcdTIwMTQgdGhhdCBpcyB3aGF0IEFjdGl2aXR5TWV0YS5wcmludCBmYWxscyBiYWNrIHRvLlxuLy9cbi8vICAgcGFwZXJTaXplICAgICAgXHUyMDE0ICdsZXR0ZXInIHwgJ2E0Jy4gRHJpdmVzIHRoZSBAcGFnZSBzaXplIGtleXdvcmQuIERlZmF1bHRcbi8vICAgICAgICAgICAgICAgICAgICBsZXR0ZXIgZm9yIG5vdyAoTlovQTQgaXMgYSBvbmUtbGluZSBmbGlwIGxhdGVyKTsgZW1pdHRlZFxuLy8gICAgICAgICAgICAgICAgICAgIGFzIGEgTElURVJBTCBAcGFnZSBydWxlLCBuZXZlciBhIENTUyB2YXIsIGJlY2F1c2UgQHBhZ2Vcbi8vICAgICAgICAgICAgICAgICAgICBydWxlcyBjYW5ub3QgcmVsaWFibHkgcmVhZCBjdXN0b20gcHJvcGVydGllcy5cbi8vICAgY29sdW1ucyAgICAgICAgXHUyMDE0IDEuLjMuIGNvbHVtbi1jb3VudCBpbiBwcmludDsgMSBpcyBhIG5vLW9wIChzaW5nbGUgY29sKS5cbi8vICAgICAgICAgICAgICAgICAgICBET1JNQU5UOiB0aGUgYXV0aG9yLWZhY2luZyBjb250cm9sIHdhcyByZXRpcmVkIHdoZW5cbi8vICAgICAgICAgICAgICAgICAgICBzdHJ1Y3R1cmFsIGF1dGhvcmVkIGNvbHVtbnMgKHRoZSBSb3cvQ29sdW1uIGxheW91dFxuLy8gICAgICAgICAgICAgICAgICAgIHByaW1pdGl2ZSkgbGFuZGVkIFx1MjAxNCBhIG11bHRpLWNvbHVtbiByb3cgcmVuZGVycyBjb25zaXN0ZW50bHlcbi8vICAgICAgICAgICAgICAgICAgICBvbiBzY3JlZW4sIGluIHdvcmtzaGVldCBwcmludCwgYW5kIGluc2lkZSBhIGZvbGRhYmxlLCBzb1xuLy8gICAgICAgICAgICAgICAgICAgIHRoaXMgcGVyLW1vZGUgcHJpbnQgc2V0dGluZyBiZWNhbWUgcmVkdW5kYW50LiBUaGUgZmllbGQgK1xuLy8gICAgICAgICAgICAgICAgICAgIGl0cyByZW5kZXJlciB2YXIvQ1NTIGFyZSBrZXB0IChub3QgZGVsZXRlZCkgc28gdmFsdWVzXG4vLyAgICAgICAgICAgICAgICAgICAgYWxyZWFkeSBzYXZlZCBvbiBleGlzdGluZyBhY3Rpdml0aWVzIGtlZXAgcHJpbnRpbmcgYXNcbi8vICAgICAgICAgICAgICAgICAgICBhdXRob3JlZCwgYW5kIHNvIHRoZSBjb250cm9sIGNhbiBiZSByZS1leHBvc2VkIGxhdGVyIHdpdGhcbi8vICAgICAgICAgICAgICAgICAgICBubyBzY2hlbWEvcmVuZGVyZXIgY2hhbmdlLiBOZXcgYWN0aXZpdGllcyBkZWZhdWx0IHRvIDEuXG4vLyAgIHdvcmtTcGFjZSAgICAgIFx1MjAxNCByZW0gb2YgYmxhbmsgc3BhY2UgYmVsb3cgZWFjaCBwcm9ibGVtIGZvciBoYW5kLXdvcmtpbmcuXG4vLyAgICAgICAgICAgICAgICAgICAgQWN0aXZpdHktbGV2ZWwgZGVmYXVsdDsgYSBmaWxsLWluLWJsYW5rIGJsb2NrIG1heSBvdmVycmlkZVxuLy8gICAgICAgICAgICAgICAgICAgIGl0IHBlci1wcm9ibGVtIHZpYSBGaWxsSW5CbGFua0Jsb2NrLndvcmtTcGFjZS5cbi8vICAgZm9udFNpemUgICAgICAgXHUyMDE0IHB0LiBBcHBsaWVkIHRvIC5hY3Rpdml0eS1jb250YWluZXIgaW4gcHJpbnQgb25seS5cbi8vICAgcHJvYmxlbVNwYWNpbmcgXHUyMDE0IHJlbSBvZiB2ZXJ0aWNhbCBtYXJnaW4gYXJvdW5kIGVhY2ggcHJvYmxlbSBpbiBwcmludC5cbi8vICAgbWFyZ2luICAgICAgICAgXHUyMDE0IGluY2hlcy4gVGhlIEBwYWdlIG1hcmdpbiAobGl0ZXJhbCwgbGlrZSBwYXBlclNpemUpLlxuLy8gICBncmlkTGluZXMgICAgICBcdTIwMTQgYWN0aXZpdHktd2lkZSBkZWZhdWx0IGZvciBydWxlZCByb3dzLiBBIFJvdyB3aXRoXG4vLyAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOidpbmhlcml0JyAodGhlIHBlci1yb3cgZGVmYXVsdCkgcmVzb2x2ZXMgdG8gdGhpcztcbi8vICAgICAgICAgICAgICAgICAgICAnb24nLydvZmYnIG9uIGEgcm93IG92ZXJyaWRlIGl0LiBPZmYgYnkgZGVmYXVsdCBcdTIwMTQgcnVsZWRcbi8vICAgICAgICAgICAgICAgICAgICBncmlkcyBhcmUgb3B0LWluLlxuLy8gICBwcmludFJlZmVyZW5jZVBhbmVsIFx1MjAxNCB3aGV0aGVyIHRoZSBhY3Rpdml0eSdzIHJlZmVyZW5jZSBwYW5lbCBwcmludHMgYXMgYVxuLy8gICAgICAgICAgICAgICAgICAgIGJveCBhdCB0aGUgdG9wIG9mIHRoZSB3b3Jrc2hlZXQuIE9uIGJ5IGRlZmF1bHQ7IGEgdGVhY2hlclxuLy8gICAgICAgICAgICAgICAgICAgIHdpdGggYSBjbGFzcyBzZXQgb2YgY2hhcnRzIGNhbiB0dXJuIGl0IG9mZiBzbyBpdCBpc24ndFxuLy8gICAgICAgICAgICAgICAgICAgIHJlcHJpbnRlZCBwZXIgYWN0aXZpdHkuIEdhdGVzIFBSSU5UIGFsb25lLCBhbmQgYXMgb2Zcbi8vICAgICAgICAgICAgICAgICAgICAyMDI2LTA4LTIzIHRoYXQgaXMgdHJ1ZSBhZ2FpbiByYXRoZXIgdGhhbiBtZXJlbHkgY2xhaW1lZDpcbi8vICAgICAgICAgICAgICAgICAgICB0aGUgcGFuZWwncyBTQ1JFRU4gc3VyZmFjZSBpcyBiYWNrIChhIHN1bW1vbmVkIHBhbmVsIGluXG4vLyAgICAgICAgICAgICAgICAgICAgdGhlIHZpZXdlciksIHNvIHR1cm5pbmcgdGhpcyBvZmYgbWVhbnMgc2NyZWVuLW9ubHkgaW5zdGVhZFxuLy8gICAgICAgICAgICAgICAgICAgIG9mIGludmlzaWJsZS1ldmVyeXdoZXJlLiBCZXR3ZWVuIFM5IERyb3AgNCBhbmQgdGhhdCBzbGljZVxuLy8gICAgICAgICAgICAgICAgICAgIHByaW50IFdBUyB0aGUgb25seSBzdXJmYWNlLCB3aGljaCBtYWRlIHRoaXMgZmxhZyBhIHRyYXAuXG4vLyAgICAgICAgICAgICAgICAgICAgUmVhZCBieSB0aGUgdmlld2VyJ3MgcHJpbnQgbGF5ZXI7IG5vdCBhIGNvbnRhaW5lciBDU1MgdmFyLlxuLy8gICBwcmludERlZmluaXRpb25HbG9zc2FyeSBcdTIwMTQgd2hldGhlciBpbmxpbmUgdm9jYWJ1bGFyeSBkZWZpbml0aW9ucyBwcmludCBhcyBhXG4vLyAgICAgICAgICAgICAgICAgICAgZ2xvc3NhcnkgYXBwZW5kaXggYXQgdGhlIEVORCBvZiB0aGUgd29ya3NoZWV0LiBPRkYgYnlcbi8vICAgICAgICAgICAgICAgICAgICBkZWZhdWx0LCB1bmxpa2UgcHJpbnRSZWZlcmVuY2VQYW5lbDogb24gc2NyZWVuIGEgZGVmaW5pdGlvblxuLy8gICAgICAgICAgICAgICAgICAgIGlzIGEgcG9wb3ZlciBhIHN0dWRlbnQgb3BlbnMgb24gZGVtYW5kLCBhbmQgbW9zdCBhcmUgYVxuLy8gICAgICAgICAgICAgICAgICAgIHNob3J0IGdsb3NzIHRoYXQgd291bGQgb25seSBwYWQgdGhlIHByaW50b3V0LiBBIHRlYWNoZXIgd2hvXG4vLyAgICAgICAgICAgICAgICAgICAgaGFzIHB1dCBhIGZvcm11bGEgb3IgYSBkaWFncmFtIGluIGEgZGVmaW5pdGlvbiB0dXJucyB0aGlzXG4vLyAgICAgICAgICAgICAgICAgICAgb24gc28gaXQgc3Vydml2ZXMgb24gcGFwZXIgKGRlZmluaXRpb24gcG9wb3ZlcnMgYXJlXG4vLyAgICAgICAgICAgICAgICAgICAgZGlzcGxheTpub25lIGluIHByaW50KS4gUmVhZCBieSB0aGUgcmVuZGVyZXIgdG8gZGVjaWRlXG4vLyAgICAgICAgICAgICAgICAgICAgd2hldGhlciB0byBlbWl0IHRoZSBhcHBlbmRpeDsgbm90IGEgY29udGFpbmVyIENTUyB2YXIuXG4vLyAgIGhlYWRlciAgICAgICAgIFx1MjAxNCBzZWUgUHJpbnRIZWFkZXIuXG4vL1xuLy8gY29sdW1ucy93b3JrU3BhY2UvZm9udFNpemUvcHJvYmxlbVNwYWNpbmcgcmlkZSBhcyAtLXByaW50LSogQ1NTIHZhcnMgb24gdGhlXG4vLyBjb250YWluZXIgKG5vcm1hbCBzZWxlY3RvcnMgY2FuIHJlYWQgdGhlbSk7IHBhcGVyU2l6ZS9tYXJnaW4gYXJlIGVtaXR0ZWQgYXNcbi8vIGEgcGVyLWRvY3VtZW50IGxpdGVyYWwgQHBhZ2UgcnVsZS4gZ3JpZExpbmVzIGlzIG5vdCBhIGNvbnRhaW5lciB2YXIgXHUyMDE0IGl0IGlzXG4vLyByZXNvbHZlZCBwZXIgcm93IGF0IHJlbmRlciB0aW1lIChzZWUgcmVuZGVyUm93KS5cbmV4cG9ydCBjb25zdCBQcmludENvbmZpZyA9IHoub2JqZWN0KHtcbiAgcGFwZXJTaXplOiB6LmVudW0oWydsZXR0ZXInLCAnYTQnXSkuZGVmYXVsdCgnbGV0dGVyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uczogei5udW1iZXIoKS5pbnQoKS5taW4oMSkubWF4KDMpLmRlZmF1bHQoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya1NwYWNlOiB6Lm51bWJlcigpLm1pbigwKS5kZWZhdWx0KDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkuZGVmYXVsdCgxMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvYmxlbVNwYWNpbmc6IHoubnVtYmVyKCkubWluKDApLmRlZmF1bHQoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiB6Lm51bWJlcigpLm1pbigwKS5kZWZhdWx0KDAuNSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmludFJlZmVyZW5jZVBhbmVsOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaW50RGVmaW5pdGlvbkdsb3NzYXJ5OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXI6IFByaW50SGVhZGVyLmRlZmF1bHQoe30pLFxufSk7XG5leHBvcnQgdHlwZSBQcmludENvbmZpZyA9IHouaW5mZXI8dHlwZW9mIFByaW50Q29uZmlnPjtcblxuLy8gVHlwb2dyYXBoeTogdGhlIGFjdGl2aXR5LXdpZGUgZm9udCArIGJhc2UgYm9keSBzaXplIChhdXRob3ItYXBwcm92ZWRcbi8vIDIwMjYtMDctMDgpLiBPTkUgZm9udCBhbmQgT05FIGJhc2Ugc2l6ZSBmb3IgdGhlIHdob2xlIGFjdGl2aXR5IFx1MjAxNCBwdWJsaXNoZWRcbi8vIHBhZ2UsIGVkaXRvciBjYW52YXMsIGFuZCBwcmludCB2aWV3IGFsbCByZWFkIHRoZSBzYW1lIGNvbmZpZyBzbyBhdXRob3JpbmcgaXNcbi8vIFdZU0lXWUcuIE9wdGlvbmFsIGFuZCBhZGRpdGl2ZTogZG9jdW1lbnRzIHN0b3JlZCBiZWZvcmUgdGhpcyBmaWVsZCBleGlzdGVkXG4vLyBwYXJzZSB1bmNoYW5nZWQgKG5vIHNjaGVtYVZlcnNpb24gYnVtcCksIGFuZCB0aGUgZWRpdG9yIG9taXRzIHRoZSBmaWVsZFxuLy8gZW50aXJlbHkgd2hpbGUgaXQgaG9sZHMgdGhlIGRlZmF1bHRzIHNvIHVudG91Y2hlZCBkb2N1bWVudHMgc3RheVxuLy8gc3RydWN0dXJhbGx5IGlkZW50aWNhbC5cbi8vXG4vLyAgIGZvbnQgICAgIFx1MjAxNCBhbiBpZCBpbnRvIHRoZSByZW5kZXJlcidzIEZPTlRfUkVHSVNUUlkgKHRoZSBDU1Mgc3BlY2lmaWNzIFx1MjAxNFxuLy8gICAgICAgICAgICAgIGZhbWlseSBuYW1lLCBmYWxsYmFjayBzdGFjaywgV09GRjIgZmlsZXMgXHUyMDE0IGxpdmUgcmVuZGVyZXItc2lkZTtcbi8vICAgICAgICAgICAgICB0aGUgc2NoZW1hIG9ubHkgY29uc3RyYWlucyB0aGUgbWVudSkuICdkZWZhdWx0JyA9IHRoZSBjdXJyZW50XG4vLyAgICAgICAgICAgICAgc3lzdGVtIHN0YWNrLCBubyBmb250IGRvd25sb2FkLiBUaGUgb3RoZXIgZm91ciBhcmUgU0lMIE9GTFxuLy8gICAgICAgICAgICAgIGZhY2VzIHNlbGYtaG9zdGVkIGFzIFdPRkYyIG9uIFIyIChubyBHb29nbGUgQ0ROIGRlcGVuZGVuY3kgb25cbi8vICAgICAgICAgICAgICBwdWJsaXNoZWQgcGFnZXMpLlxuLy8gICBmb250U2l6ZSBcdTIwMTQgYmFzZSBCT0RZIHNpemUgaW4gcHgsIGFwcGxpZWQgb24gc2NyZWVuIHZpYVxuLy8gICAgICAgICAgICAgIC0tYWN0aXZpdHktZm9udC1zaXplLiBQcmludCBib2R5IHNpemluZyBzdGF5cyBvd25lZCBieVxuLy8gICAgICAgICAgICAgIG1ldGEucHJpbnQuZm9udFNpemUgKHB0KSBcdTIwMTQgdGhlIEBtZWRpYSBwcmludCBydWxlIG92ZXJyaWRlcyB0aGVcbi8vICAgICAgICAgICAgICBzY3JlZW4gc2l6ZSwgc28gdGhlIHR3byBuZXZlciBmaWdodC4gSGVhZGluZ3MgYXJlIGVtLXJlbGF0aXZlXG4vLyAgICAgICAgICAgICAgYW5kIHNjYWxlIG9mZiB3aGljaGV2ZXIgYmFzZSBpcyBpbiBlZmZlY3QuXG4vL1xuLy8gUGVyLXNwYW4gZm9udC9zaXplIG1hcmtzIGFyZSBQQVJLRUQgYnV0IGRlc2lnbmVkIGZvcjogdGhpcyBhY3Rpdml0eS13aWRlXG4vLyBsYXllciBvbmx5IHNldHMgQ1NTIHZhcnMgKyBAZm9udC1mYWNlLCBzbyBhIGZ1dHVyZSBgdGV4dFN0eWxlYCBtYXJrIGNhblxuLy8gc2xvdCBpbiBhZGRpdGl2ZWx5IChzcGFuLWxldmVsIGlubGluZSBzdHlsZXMgd2luIHRoZSBjYXNjYWRlOyB0aGVcbi8vIHJlbmRlcmVyJ3MgZm9udEZhY2VDc3MgYWxyZWFkeSB0YWtlcyBhIExJU1Qgb2YgZmFtaWxpZXMgdG8gZW1iZWQpLlxuZXhwb3J0IGNvbnN0IEFjdGl2aXR5Rm9udCA9IHouZW51bShbXG4gICdkZWZhdWx0JyxcbiAgJ2xleGVuZCcsXG4gICdhdGtpbnNvbi1oeXBlcmxlZ2libGUnLFxuICAnYW5kaWthJyxcbiAgJ2NvbWljLW5ldWUnLFxuXSk7XG5leHBvcnQgdHlwZSBBY3Rpdml0eUZvbnQgPSB6LmluZmVyPHR5cGVvZiBBY3Rpdml0eUZvbnQ+O1xuXG5leHBvcnQgY29uc3QgVHlwb2dyYXBoeSA9IHoub2JqZWN0KHtcbiAgZm9udDogQWN0aXZpdHlGb250LmRlZmF1bHQoJ2RlZmF1bHQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogei5udW1iZXIoKS5taW4oMTIpLm1heCgyNCkuZGVmYXVsdCgxNiksXG59KTtcbmV4cG9ydCB0eXBlIFR5cG9ncmFwaHkgPSB6LmluZmVyPHR5cGVvZiBUeXBvZ3JhcGh5PjtcblxuZXhwb3J0IGNvbnN0IEFjdGl2aXR5TWV0YSA9IHoub2JqZWN0KHtcbiAgdGl0bGU6IHouc3RyaW5nKCkubWluKDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC5taW4oMSk6IGNvdXJzZSBpcyBzdGFtcGVkIGludG8gdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWN0aXZpdGllcy5jb3Vyc2UgY29sdW1uIGF0IHB1Ymxpc2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAoMDAzNywgdGF4b25vbXkgUjEpIHdoZXJlIGl0IGlzIGBub3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBudWxsYCBcdTIwMTQgYSBibGFuayBjb3Vyc2Ugd291bGQgcHVibGlzaCBhblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtcHR5IGZhY2V0IGludG8gdGhlIGNhdGFsb2cuIFRoZSBlZGl0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmYWxscyBiYWNrIHRvIHRoZSBkZWZhdWx0IHJhdGhlciB0aGFuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXZlciBzZW5kaW5nIGEgYmxhbmsgKEFjdGl2aXR5RWRpdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2F2ZSgpLCBzYW1lIGd1YXJkIHRpdGxlIGFscmVhZHkgaGFzKS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3Vyc2U6IHouc3RyaW5nKCkubWluKDEpLmRlZmF1bHQoJ0FsZ2VicmEgSUknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml0OiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWlzc2lvbk1vZGU6IHouZW51bShbJ3NpbmdsZScsICdsb2NrZWQnLCAnZnJlZSddKS5kZWZhdWx0KCdmcmVlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZpdHlUeXBlOiB6LmVudW0oWyd3b3Jrc2hlZXQnLCAnZXhpdF90aWNrZXQnLCAnd2FybV91cCcsICdyZXZpZXcnXSkuZGVmYXVsdCgnd29ya3NoZWV0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyRmVlZGJhY2s6IHouZW51bShbJ2ltbWVkaWF0ZScsICdvbl9jaGVjayddKS5kZWZhdWx0KCdvbl9jaGVjaycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmludDogUHJpbnRDb25maWcuZGVmYXVsdCh7fSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwb2dyYXBoeTogVHlwb2dyYXBoeS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBBY3Rpdml0eU1ldGEgPSB6LmluZmVyPHR5cGVvZiBBY3Rpdml0eU1ldGE+O1xuXG4vLyBUaGUgdG9wLWxldmVsIGRvY3VtZW50LiBBbHdheXMgdmFsaWRhdGUgdXNlci1mYWNpbmcgaW5wdXQgdGhyb3VnaCB0aGlzXG4vLyBiZWZvcmUgc3RvcmluZy4gVGhlIEVkZ2UgRnVuY3Rpb25zIHBhcnNlIGluY29taW5nIGRyYWZ0cyB3aXRoIHRoaXMgc2NoZW1hXG4vLyBhbmQgcmVqZWN0IG1hbGZvcm1lZCBkb2N1bWVudHMgd2l0aCBhIDQwMC5cbi8vIFJlZmVyZW5jZVBhbmVsOiBvcHRpb25hbCBzdGlja3ktc2lkZWJhciBjb250ZW50IHN0dWRlbnRzIGNvbnN1bHQgd2hpbGVcbi8vIHdvcmtpbmcgXHUyMDE0IGZvcm11bGEgY2hhcnRzLCBwZXJpb2RpYyB0YWJsZXMsIHZvY2FidWxhcnkgbGlzdHMsIGNvbnZlcnNpb25cbi8vIHRhYmxlcywgdW5pdC1jaXJjbGUgZGlhZ3JhbXMsIHNlbnRlbmNlLXN0ZW0gcHJvbXB0cywgZm9yZWlnbi1sYW5ndWFnZVxuLy8gdmVyYiB0YWJsZXMsIHByaW1hcnktc291cmNlIGV4Y2VycHRzLCBtYXBzLiBUaGUgYmxvY2tzIGFycmF5IHVzZXMgdGhlXG4vLyBzYW1lIEJsb2NrIHNjaGVtYSBhcyBzZWN0aW9uIGNvbnRlbnQ7IG5vIG5ldyBibG9jayB0eXBlcyBhcmUgbmVlZGVkXG4vLyBmb3IgdGhlIHBhbmVsLlxuLy9cbi8vIFBoYXNlIDE6IHRoZSBzY2hlbWEgYWNjZXB0cyB0aGUgZmllbGQgYXMgZm9yd2FyZC1jb21wYXQ7IHRoZSBlZGl0b3Jcbi8vIGRvZXNuJ3Qgc3VyZmFjZSBpdCwgYW5kIHRoZSByZW5kZXJlciBpZ25vcmVzIGl0LiBQaGFzZSAyIHdpcmVzIHVwIHRoZVxuLy8gYXV0aG9yaW5nIFVJIGFuZCB0aGUgc2lkZWJhciBsYXlvdXQgaW4gcHVibGlzaGVkIEhUTUwuIEZpZWxkIGlzXG4vLyBvcHRpb25hbCB3aXRoIG5vIGRlZmF1bHQgb24gQWN0aXZpdHlEb2N1bWVudCwgc28gZXhpc3Rpbmcgc3RvcmVkXG4vLyBkb2N1bWVudHMgcGFyc2UgY2xlYW5seS5cbi8vXG4vLyBSZW5kZXJlciB3aWxsIHRyZWF0IHJlZmVyZW5jZSBjb250ZW50IGFzIGRhdGEtYmxvY2stY2F0ZWdvcnk9XCJzY2FmZm9sZFwiXG4vLyAoUGhhc2UgMispIFx1MjAxNCBkb2Vzbid0IGNvbnRyaWJ1dGUgdG8gc2NvcmluZyBvciBjaGVja3BvaW50IGJlaGF2aW9yLlxuZXhwb3J0IGNvbnN0IFJlZmVyZW5jZVBhbmVsID0gei5vYmplY3Qoe1xuICB0aXRsZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tzOiB6LmFycmF5KEJsb2NrKSxcbn0pO1xuZXhwb3J0IHR5cGUgUmVmZXJlbmNlUGFuZWwgPSB6LmluZmVyPHR5cGVvZiBSZWZlcmVuY2VQYW5lbD47XG5cbi8vIENhbGN1bGF0b3IgdG9vbDogYW4gYWN0aXZpdHktbGV2ZWwgc2NhZmZvbGQsIGEgc2libGluZyB0byB0aGUgcmVmZXJlbmNlXG4vLyBwYW5lbCBcdTIwMTQgYSB0ZWFjaGVyLWNvbmZpZ3VyYWJsZSBvbi1zY3JlZW4gY2FsY3VsYXRvciBhIHN0dWRlbnQgc3VtbW9ucyB3aGlsZVxuLy8gd29ya2luZyAobGlrZSB0aGUgY2FsY3VsYXRvciBhbGxvd2VkIG9uIGEgZGlnaXRhbCBTQVQpLiBJdCBpcyBORVZFUiBzY29yZWQsXG4vLyBwcm9kdWNlcyBubyBzdWJtaXNzaW9uLCBhbmQgY2FycmllcyBubyBhbnN3ZXIga2V5OyB0aGUgcmVuZGVyZXIgdHJlYXRzIGl0IGFzXG4vLyBkYXRhLWJsb2NrLWNhdGVnb3J5PVwic2NhZmZvbGRcIiAob3V0c2lkZSBhbnkgLmFjdGl2aXR5LXNlY3Rpb24sIHNvIHRoZSBzY29yaW5nXG4vLyBydW50aW1lIG5ldmVyIHNlZXMgaXQpLiBJdCB0cmF2ZWxzIGluIHRoZSB3aXJlIGZvcm1hdCwgY29uZmlndXJlZCBvbmNlIHBlclxuLy8gYWN0aXZpdHksIGFuZCBpcyBvcHRpb25hbCBzbyBleGlzdGluZyBzdG9yZWQgZG9jdW1lbnRzIHBhcnNlIHVuY2hhbmdlZCBcdTIwMTQgbm9cbi8vIHNjaGVtYVZlcnNpb24gYnVtcCAoc2FtZSBmb3J3YXJkLWNvbXBhdCBzdG9yeSBhcyByZWZlcmVuY2VQYW5lbC9wcmludCkuXG4vL1xuLy8gUmVzdHJpY3Rpb25zIGFyZSBQRVJNSVNTSVZFIGJ5IGRlZmF1bHQ6IGFuIGVuYWJsZWQtYnV0LXVuY29uZmlndXJlZFxuLy8gY2FsY3VsYXRvciBpcyBhIGZ1bGwgdG9vbDsgdGVhY2hlcnMgb3B0IElOVE8gcmVzdHJpY3Rpb25zLCBuZXZlciBvdXQgb2Zcbi8vIGNhcGFiaWxpdHkuIExhdGVyIGZsYWdzIChsb2NrVmlld3BvcnQsIGFsbG93ZWRSZWdyZXNzaW9uTW9kZWxzLFxuLy8gbWF4RXhwcmVzc2lvbnNcdTIwMjYpIGFyZSBhZGRlZCBhZGRpdGl2ZWx5IGFzIGdyYXBoaW5nLXRyYWNrIHN0YWdlcyBsYW5kIFx1MjAxNCBhbGxcbi8vIG9wdGlvbmFsL2RlZmF1bHRlZCwgc28gc3RpbGwgbm8gc2NoZW1hVmVyc2lvbiBidW1wLlxuLy9cbi8vIGBtb2RlYCBpcyB0aGUgY2FwYWJpbGl0eSBjZWlsaW5nLiBUaGUgZW51bSBjYXJyaWVzIHRoZSBmdWxsIGNvbnRyYWN0IG5vdywgYnV0XG4vLyB0aGUgZGVmYXVsdCBpcyAnc2NpZW50aWZpYycgYmVjYXVzZSB0aGF0IGlzIHRoZSBvbmx5IGNhcGFiaWxpdHkgU3RhZ2UgMVxuLy8gaW1wbGVtZW50cyBcdTIwMTQgYW4gZW5hYmxlZCBjYWxjdWxhdG9yIGRvZXMgZXhhY3RseSB3aGF0IGlzIGJ1aWx0LiBUaGUgZGVmYXVsdFxuLy8gbWF5IGZsaXAgdG8gJ2dyYXBoaW5nJyBvbmNlIHRoZSBib2FyZCBsYXllciBsYW5kcyAoU3RhZ2UgMikuXG4vLyBTdGFnZSAzOiB3aGljaCBmaXQgbW9kZWxzIHRoZSBncmFwaGluZyBjYWxjdWxhdG9yJ3MgZGF0YS9yZWdyZXNzaW9uIHBhbmVsXG4vLyBvZmZlcnMuIFBlcm1pc3NpdmUgZGVmYXVsdCAoYWxsIHRocmVlKTsgYW4gRU1QVFkgYXJyYXkgdHVybnMgcmVncmVzc2lvbiBvZmZcbi8vIGVudGlyZWx5IChubyBkYXRhIHBhbmVsKS4gT25seSBtZWFuaW5nZnVsIHVuZGVyIG1vZGUgJ2dyYXBoaW5nJyBcdTIwMTQgdGhlXG4vLyAnc2NpZW50aWZpYycgY2VpbGluZyBhbHJlYWR5IGV4Y2x1ZGVzIHRoZSBib2FyZCB0aGUgZml0cyBkcmF3IG9uLlxuLy8gJ2xvZ2FyaXRobWljJyBqb2luZWQgMjAyNi0wNy0xMSAoY2FsY3VsYXRvci1wYXJpdHkgYmF0Y2gpOiB0aGUga2l0IGNvbXB1dGVkXG4vLyBsb2cgZml0cyBhbGwgYWxvbmc7IHRoZSBlbnVtIHdhcyB0aGUgb25seSBnYXAuIE5PVEUgYSBzdG9yZWQgZG9jIHRoYXQgY2Fycmllc1xuLy8gdGhlIGV4cGxpY2l0IHRocmVlLW1vZGVsIGFycmF5IHN0YXlzIHRocmVlLW1vZGVsIChpbmRpc3Rpbmd1aXNoYWJsZSBmcm9tIGFcbi8vIGRlbGliZXJhdGUgcmVzdHJpY3Rpb24pIHVudGlsIHRoZSB0ZWFjaGVyIHRvdWNoZXMgdGhlIGNvbmZpZyBcdTIwMTQgYWNjZXB0ZWQgYXRcbi8vIHRoZSBkZXNpZ24gcGFzczsgdGhlIHBlcm1pc3NpdmUgZGVmYXVsdCBvbmx5IGFwcGxpZXMgd2hlbiB0aGUgZmllbGQgaXMgYWJzZW50LlxuZXhwb3J0IGNvbnN0IFJlZ3Jlc3Npb25Nb2RlbCA9IHouZW51bShbXG4gICdsaW5lYXInLFxuICAncXVhZHJhdGljJyxcbiAgJ2V4cG9uZW50aWFsJyxcbiAgJ2xvZ2FyaXRobWljJyxcbl0pO1xuZXhwb3J0IHR5cGUgUmVncmVzc2lvbk1vZGVsID0gei5pbmZlcjx0eXBlb2YgUmVncmVzc2lvbk1vZGVsPjtcblxuZXhwb3J0IGNvbnN0IENhbGN1bGF0b3JSZXN0cmljdGlvbnMgPSB6Lm9iamVjdCh7XG4gIG1vZGU6IHouZW51bShbJ3NjaWVudGlmaWMnLCAnZ3JhcGhpbmcnXSkuZGVmYXVsdCgnc2NpZW50aWZpYycpLFxuICBhbGxvd1RyaWc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gIGFsbG93TG9nRXhwOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAvLyBJbmVxdWFsaXR5IHJvd3MgaW4gdGhlIGdyYXBoaW5nIGV4cHJlc3Npb24gbGlzdCAoY2FsY3VsYXRvci1wYXJpdHkgYmF0Y2gpLlxuICAvLyBBZGRpdGl2ZSArIGRlZmF1bHRlZCBsaWtlIHRoZSBvdGhlciBnYXRlcyBcdTIwMTQgbm8gc2NoZW1hVmVyc2lvbiBidW1wOyB0aGUga2l0XG4gIC8vIHJlYWRzIGEgbWlzc2luZyB2YWx1ZSBhcyBwZXJtaXNzaXZlLCBzbyBvbGQgcHVibGlzaGVkIHBhZ2VzIHN0YXkgZnVsbC10b29sLlxuICBhbGxvd0luZXF1YWxpdGllczogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgYWxsb3dlZFJlZ3Jlc3Npb25Nb2RlbHM6IHpcbiAgICAuYXJyYXkoUmVncmVzc2lvbk1vZGVsKVxuICAgIC5kZWZhdWx0KFsnbGluZWFyJywgJ3F1YWRyYXRpYycsICdleHBvbmVudGlhbCcsICdsb2dhcml0aG1pYyddKSxcbiAgLy8gU3RhZ2UgNDogY2FwIG9uIHRoZSBncmFwaGluZyBleHByZXNzaW9uIGxpc3QuIEFCU0VOVCA9IHVubGltaXRlZCAodGhlXG4gIC8vIHBlcm1pc3NpdmUgZGVmYXVsdCBcdTIwMTQgb3B0aW9uYWwsIG5vdCBkZWZhdWx0ZWQsIHNvIGl0IHN0YXlzIG91dCBvZiBzdG9yZWRcbiAgLy8gZG9jcyB1bmxlc3MgYSB0ZWFjaGVyIHNldHMgaXQpLiBHcmFwaGluZyBtb2RlIG9ubHkuXG4gIG1heEV4cHJlc3Npb25zOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoNTApLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIENhbGN1bGF0b3JSZXN0cmljdGlvbnMgPSB6LmluZmVyPHR5cGVvZiBDYWxjdWxhdG9yUmVzdHJpY3Rpb25zPjtcblxuZXhwb3J0IGNvbnN0IENhbGN1bGF0b3JUb29sID0gei5vYmplY3Qoe1xuICBlbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgcmVzdHJpY3Rpb25zOiBDYWxjdWxhdG9yUmVzdHJpY3Rpb25zLmRlZmF1bHQoe30pLFxufSk7XG5leHBvcnQgdHlwZSBDYWxjdWxhdG9yVG9vbCA9IHouaW5mZXI8dHlwZW9mIENhbGN1bGF0b3JUb29sPjtcblxuLy8gVGhlIGV4cGxpY2l0IHR5cGUgKyB6LlpvZFR5cGUgYW5ub3RhdGlvbiAoaW5zdGVhZCBvZiB6LmluZmVyKSBleGlzdHMgYmVjYXVzZVxuLy8gdGhlIGZ1bGx5IGluZmVycmVkIGRvY3VtZW50IHR5cGUgb3V0Z3JldyB0c2MncyBkZWNsYXJhdGlvbi1zZXJpYWxpemF0aW9uXG4vLyBsaW1pdCAoVFM3MDU2KSB3aGVuIHRoZSBCbG9jayB1bmlvbiByZWFjaGVkIDE0IG1lbWJlcnMuIFN0cnVjdHVyYWxseVxuLy8gaWRlbnRpY2FsIHRvIHdoYXQgaW5mZXJlbmNlIHByb2R1Y2VkOyBub3RoaW5nIGhlcmUgbG9zZXMgdHlwZSBzYWZldHkgXHUyMDE0XG4vLyB0aGUgYW5ub3RhdGlvbiBpcyBjaGVja2VkIGFnYWluc3QgdGhlIG9iamVjdCBzY2hlbWEuXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2aXR5RG9jdW1lbnQge1xuICBzY2hlbWFWZXJzaW9uOiAyO1xuICBtZXRhOiBBY3Rpdml0eU1ldGE7XG4gIHNlY3Rpb25zOiBTZWN0aW9uW107XG4gIHJlZmVyZW5jZVBhbmVsPzogUmVmZXJlbmNlUGFuZWw7XG4gIGNhbGN1bGF0b3I/OiBDYWxjdWxhdG9yVG9vbDtcbn1cbmV4cG9ydCBjb25zdCBBY3Rpdml0eURvY3VtZW50OiB6LlpvZFR5cGU8QWN0aXZpdHlEb2N1bWVudCwgei5ab2RUeXBlRGVmLCB1bmtub3duPiA9XG4gIHoub2JqZWN0KHtcbiAgICBzY2hlbWFWZXJzaW9uOiB6LmxpdGVyYWwoMiksXG4gICAgbWV0YTogQWN0aXZpdHlNZXRhLFxuICAgIHNlY3Rpb25zOiB6LmFycmF5KFNlY3Rpb24pLFxuICAgIHJlZmVyZW5jZVBhbmVsOiBSZWZlcmVuY2VQYW5lbC5vcHRpb25hbCgpLFxuICAgIGNhbGN1bGF0b3I6IENhbGN1bGF0b3JUb29sLm9wdGlvbmFsKCksXG4gIH0pO1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyB1cGdyYWRlLnRzIFx1MjAxNCBzZXJ2ZXItc2lkZSB1cGdyYWRlLW9uLXJlYWQgKGNvbXBvbmVudHMtYXMtZGF0YSBydWxpbmcgNEEpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHJlYWQgQVBJIChTMikgdXBncmFkZXMgZXZlcnkgc3RvcmVkIGFjdGl2aXR5X3ZlcnNpb25zLmNvbnRlbnQgdG8gdGhlXG4vLyBDVVJSRU5UIHNjaGVtYSBiZWZvcmUgc2FuaXRpemluZyBhbmQgc2VydmluZyBpdCwgc28gdGhlIHZpZXdlciBvbmx5IGV2ZXJcbi8vIHNlZXMgdGhlIGxhdGVzdCBzaGFwZS4gVGhpcyBtb2R1bGUgaXMgdGhhdCBzZWFtLlxuLy9cbi8vIFRoZSBjaGFpbiBpcyBFTVBUWSB0b2RheSwgZGVsaWJlcmF0ZWx5OiBzY2hlbWFWZXJzaW9uIGlzIDIgYW5kIHRoZSAxXHUyMTkyMlxuLy8gcmVzaGFwZSB3YXMgYSBncmVlbmZpZWxkIGhhcmQtY3V0IHdpdGggbm8gbWlncmF0ZSBwYXRoIChkb2N1bWVudC50cyBoZWFkZXIgXHUyMDE0XG4vLyBhIHN0cmF5IHYxIGZhaWxzIGxvdWRseSByYXRoZXIgdGhhbiBtaXMtcGFyc2luZykuIFdoZW4gc2NoZW1hVmVyc2lvbiAzXG4vLyBsYW5kcywgaXRzIG1pZ3JhdGlvbiBpcyBvbmUgcHVyZSBlbnRyeSBpbiBVUEdSQURFUyBiZWxvdzsgc3RvcmVkIHJvd3Mgc3RheVxuLy8gYXQgdGhlaXIgb3JpZ2luYWwgdmVyc2lvbiBmb3JldmVyIGFuZCBhcmUgdXBncmFkZWQgb24gcmVhZCwgbmV2ZXIgbXV0YXRlZC5cbi8vXG4vLyBEaXN0aW5jdCBmcm9tIHRoZSB0d28gb3RoZXIgXCJ1cGdyYWRlXCIgbGF5ZXJzLCBvbiBwdXJwb3NlOlxuLy8gICAtIE1hcmsvZGVmaW5pdGlvbiBsZWdhY3kgcHJlcHJvY2Vzc2luZyAoaW5saW5lLnRzKSBydW5zIElOU0lERVxuLy8gICAgIEFjdGl2aXR5RG9jdW1lbnQucGFyc2UgXHUyMDE0IGFkZGl0aXZlIHNoYXBlIGRyaWZ0IHdpdGhpbiBvbmUgc2NoZW1hVmVyc2lvbi5cbi8vICAgLSBtaWdyYXRlU3VibWlzc2lvblJlc3BvbnNlcyAoc3VibWlzc2lvbi50cykgaXMgdGhlIFNVQk1JU1NJT04gd2lyZSdzXG4vLyAgICAgbGFkZGVyIFx1MjAxNCBhIGRpZmZlcmVudCBkb2N1bWVudCB3aXRoIGl0cyBvd24gdmVyc2lvbmluZy5cbi8vIFRoaXMgbW9kdWxlIG93bnMgb25seSB0aGUgdG9wLWxldmVsIEFjdGl2aXR5RG9jdW1lbnQgc2NoZW1hVmVyc2lvbi5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IEFjdGl2aXR5RG9jdW1lbnQgfSBmcm9tICcuL2RvY3VtZW50LmpzJztcblxuLyoqIFRoZSBzY2hlbWFWZXJzaW9uIHRoaXMgYnVpbGQgcGFyc2VzIGFuZCBzZXJ2ZXMuIEd1YXJkLXRlc3RlZCBhZ2FpbnN0IHRoZVxuICogQWN0aXZpdHlEb2N1bWVudCBsaXRlcmFsIHNvIHRoZSBjb25zdGFudCBjYW4ndCBkcmlmdCBmcm9tIHRoZSBwYXJzZXIuICovXG5leHBvcnQgY29uc3QgQUNUSVZJVFlfU0NIRU1BX1ZFUlNJT04gPSAyO1xuXG4vKiogVGhyb3duIHdoZW4gc3RvcmVkIGNvbnRlbnQgY2Fubm90IGJlIGJyb3VnaHQgdG8gdGhlIGN1cnJlbnQgc2NoZW1hLiBUaGVcbiAqIHJlYWQgQVBJIG1hcHMgdGhpcyB0byBhbiBleHBsaWNpdCBlcnJvciBzdGF0ZSAoZmFpbHVyZS1tb2RlcyB0YWJsZTogXCJ1cGdyYWRlXG4gKiBjaGFpbiBidWcgb24gb2xkIHZlcnNpb25cIiBcdTIxOTIgY2xlYXIgZXJyb3IsIG5ldmVyIGEgd2hpdGUgc2NyZWVuKS4gKi9cbmV4cG9ydCBjbGFzcyBVcGdyYWRlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAvKiogVGhlIHNjaGVtYVZlcnNpb24gdGhlIHN0b3JlZCBkb2N1bWVudCBjbGFpbWVkLCB3aGVuIHJlYWRhYmxlLiAqL1xuICAgIHJlYWRvbmx5IHN0b3JlZFZlcnNpb24/OiBudW1iZXIsXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9ICdVcGdyYWRlRXJyb3InO1xuICB9XG59XG5cbi8qKiBPbmUgc3RlcCBvZiB0aGUgY2hhaW46IGEgUFVSRSBqc29uIFx1MjE5MiBqc29uIHJld3JpdGUgZnJvbSBgZnJvbWAgdG8gYGZyb20rMWAuXG4gKiBObyBJL08sIG5vIHJhbmRvbW5lc3MsIG5vIERhdGUgXHUyMDE0IHVwZ3JhZGluZyB0aGUgc2FtZSBzdG9yZWQgcm93IHR3aWNlIG11c3RcbiAqIHlpZWxkIGlkZW50aWNhbCBvdXRwdXQgKHRoZSBwZXItdmVyc2lvbiByZWFkIGNhY2hlIGRlcGVuZHMgb24gaXQpLiAqL1xuaW50ZXJmYWNlIFVwZ3JhZGVTdGVwIHtcbiAgcmVhZG9ubHkgZnJvbTogbnVtYmVyO1xuICByZWFkb25seSBydW46IChyYXc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuLy8gVGhlIGNoYWluLiBBcHBlbmQtb25seTsgZWFjaCBlbnRyeSBidW1wcyBleGFjdGx5IG9uZSB2ZXJzaW9uLiBFbXB0eSB0b2RheSBcdTIwMTRcbi8vIHNlZSB0aGUgaGVhZGVyIGZvciB3aHkgdjEgZGVsaWJlcmF0ZWx5IGhhcyBubyBlbnRyeS5cbmNvbnN0IFVQR1JBREVTOiByZWFkb25seSBVcGdyYWRlU3RlcFtdID0gW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgVXBncmFkZVJlc3VsdCB7XG4gIC8qKiBUaGUgZG9jdW1lbnQsIHBhcnNlZCBhbmQgdmFsaWRhdGVkIGF0IHRoZSBDVVJSRU5UIHNjaGVtYS4gKi9cbiAgZG9jOiBBY3Rpdml0eURvY3VtZW50O1xuICAvKiogVGhlIHNjaGVtYVZlcnNpb24gdGhlIHN0b3JlZCBjb250ZW50IGFycml2ZWQgYXQgKD09PSBjdXJyZW50IHdoZW4gbm9cbiAgICogY2hhaW4gc3RlcCByYW4pLiBDYWxsZXJzIG1heSBsb2cgaXQ7IHRoZSBjYWNoZSBzdG9yZXMgdGhlIHRhcmdldC4gKi9cbiAgZnJvbVNjaGVtYVZlcnNpb246IG51bWJlcjtcbn1cblxuLyoqXG4gKiBCcmluZyByYXcgc3RvcmVkIGNvbnRlbnQgKGFjdGl2aXR5X3ZlcnNpb25zLmNvbnRlbnQpIHRvIHRoZSBjdXJyZW50IHNjaGVtYVxuICogYW5kIHZhbGlkYXRlIGl0LiBUaHJvd3MgVXBncmFkZUVycm9yIG9uIGFueSBjb250ZW50IHRoaXMgYnVpbGQgY2Fubm90IHNlcnZlXG4gKiBcdTIwMTQgYW4gdW5rbm93bi9mdXR1cmUgdmVyc2lvbiwgYSB2ZXJzaW9uIHdpdGggbm8gY2hhaW4gcGF0aCwgb3IgY29udGVudCB0aGF0XG4gKiBmYWlscyB2YWxpZGF0aW9uIGFmdGVyIHVwZ3JhZGluZy4gTmV2ZXIgcmV0dXJucyBhIHBhcnRpYWxseS11cGdyYWRlZCBkb2MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGdyYWRlQWN0aXZpdHlEb2N1bWVudChyYXc6IHVua25vd24pOiBVcGdyYWRlUmVzdWx0IHtcbiAgaWYgKHJhdyA9PT0gbnVsbCB8fCB0eXBlb2YgcmF3ICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHJhdykpIHtcbiAgICB0aHJvdyBuZXcgVXBncmFkZUVycm9yKCdTdG9yZWQgY29udGVudCBpcyBub3QgYW4gb2JqZWN0Jyk7XG4gIH1cbiAgY29uc3Qgc3RvcmVkID0gcmF3IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBjb25zdCB2ZXJzaW9uID0gc3RvcmVkLnNjaGVtYVZlcnNpb247XG4gIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIodmVyc2lvbikpIHtcbiAgICB0aHJvdyBuZXcgVXBncmFkZUVycm9yKCdTdG9yZWQgY29udGVudCBoYXMgbm8gaW50ZWdlciBzY2hlbWFWZXJzaW9uJyk7XG4gIH1cbiAgaWYgKHZlcnNpb24gPiBBQ1RJVklUWV9TQ0hFTUFfVkVSU0lPTikge1xuICAgIC8vIENvbnRlbnQgd3JpdHRlbiBieSBhIE5FV0VSIGJ1aWxkIHRoYW4gdGhpcyBvbmUgKGRlcGxveS1vcmRlciBzbGlwKS5cbiAgICB0aHJvdyBuZXcgVXBncmFkZUVycm9yKFxuICAgICAgYFN0b3JlZCBzY2hlbWFWZXJzaW9uICR7dmVyc2lvbn0gaXMgbmV3ZXIgdGhhbiB0aGlzIGJ1aWxkJ3MgYCArXG4gICAgICAgIGAke0FDVElWSVRZX1NDSEVNQV9WRVJTSU9OfSBcdTIwMTQgcmVmdXNpbmcgdG8gZ3Vlc3NgLFxuICAgICAgdmVyc2lvbixcbiAgICApO1xuICB9XG5cbiAgbGV0IGN1cnJlbnQgPSBzdG9yZWQ7XG4gIGxldCBhdCA9IHZlcnNpb247XG4gIHdoaWxlIChhdCA8IEFDVElWSVRZX1NDSEVNQV9WRVJTSU9OKSB7XG4gICAgY29uc3Qgc3RlcCA9IFVQR1JBREVTLmZpbmQoKHUpID0+IHUuZnJvbSA9PT0gYXQpO1xuICAgIGlmICghc3RlcCkge1xuICAgICAgLy8gdjEgbGFuZHMgaGVyZSBieSBkZXNpZ24gKGdyZWVuZmllbGQgaGFyZC1jdXQ6IG5vIG1pZ3JhdGUoMVx1MjE5MjIpKS5cbiAgICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoXG4gICAgICAgIGBObyB1cGdyYWRlIHBhdGggZnJvbSBzY2hlbWFWZXJzaW9uICR7YXR9IFx1MjAxNCBjYW5ub3Qgc2VydmVgLFxuICAgICAgICB2ZXJzaW9uLFxuICAgICAgKTtcbiAgICB9XG4gICAgY3VycmVudCA9IHN0ZXAucnVuKGN1cnJlbnQpO1xuICAgIGF0ICs9IDE7XG4gIH1cblxuICBjb25zdCBwYXJzZWQgPSBBY3Rpdml0eURvY3VtZW50LnNhZmVQYXJzZShjdXJyZW50KTtcbiAgaWYgKCFwYXJzZWQuc3VjY2Vzcykge1xuICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoXG4gICAgICBgQ29udGVudCBmYWlsZWQgdmFsaWRhdGlvbiBhdCBzY2hlbWFWZXJzaW9uICR7YXR9OiBgICtcbiAgICAgICAgcGFyc2VkLmVycm9yLmlzc3Vlc1xuICAgICAgICAgIC5zbGljZSgwLCAzKVxuICAgICAgICAgIC5tYXAoKGkpID0+IGAke2kucGF0aC5qb2luKCcuJyl9OiAke2kubWVzc2FnZX1gKVxuICAgICAgICAgIC5qb2luKCc7ICcpLFxuICAgICAgdmVyc2lvbixcbiAgICApO1xuICB9XG4gIHJldHVybiB7IGRvYzogcGFyc2VkLmRhdGEsIGZyb21TY2hlbWFWZXJzaW9uOiB2ZXJzaW9uIH07XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHJlZ2lzdHJ5L3JlZ2lzdHJ5LnRzIFx1MjAxNCB0aGUgc2luZ2xlIGJsb2NrIHJlZ2lzdHJ5IChTMCwgcnVsaW5nIFExQSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBPbmUgZW50cnkgcGVyIHNjaGVtYSBibG9jayB0eXBlLiBUaGUgZ3VhcmQgc3VpdGUgKHRlc3RzL3JlZ2lzdHJ5LnRlc3QudHMpXG4vLyBwcm92ZXM6IGNvdmVyYWdlIGlzIGV4YWN0IGFnYWluc3QgdGhlIEJsb2NrIHVuaW9uLCBudW1iZXJpbmcgZGVjbGFyYXRpb25zXG4vLyBhZ3JlZSB3aXRoIGJsb2NrLXByZWRpY2F0ZXMudHMsIGZhbWlsaWVzIGFncmVlIHdpdGggaXNHcmFkZWFibGUsIHZhcmlhbnRzXG4vLyBhZ3JlZSB3aXRoIHRoZSBzY2hlbWEncyBpbnRlcmFjdGlvbiB1bmlvbnMsIGFuZCBldmVyeSBpbnRlcmFjdGl2ZSBlbnRyeVxuLy8gY2FycmllcyBhbiBhMTF5IHN0b3J5LiBBZGQgYSBibG9jayB0eXBlIHRvIHRoZSBzY2hlbWEgYW5kIHRoaXMgZmlsZSBmYWlscyB0b1xuLy8gY29tcGlsZSAoQmxvY2tSZWdpc3RyeSBpcyBrZXllZCBieSB0aGUgdW5pb24pIFx1MjAxNCB0aGF0IGlzIHRoZSBwb2ludC5cbi8vXG4vLyBQcmludCBkZWNsYXJhdGlvbnMgc3RhcnRlZCBGQUlUSEZVTCB0byB0aGUgYmFzZWxpbmUgcHJpbnQgbGF5ZXJcbi8vIChyZW5kZXJlci9zcmMvcnVudGltZS9zdHlsZXMudHMgQG1lZGlhIHByaW50KSwgaW5jbHVkaW5nIGl0cyBrbm93biBvZGRpdGllcyxcbi8vIHNvIHRoYXQgaW1wcm92aW5nIHRoZW0gd291bGQgYmUgYSBkZWxpYmVyYXRlIGRlY2lzaW9uIHJhdGhlciB0aGFuIGEgc2lsZW50XG4vLyByZWdpc3RyeSBzaWRlIGVmZmVjdC4gUzUgKHRoZSBwcmludCBzbGljZSkgSVMgdGhhdCBkZWNpc2lvbiBwb2ludCwgYW5kIGl0XG4vLyBydWxlZCAoUzUtT1Y2KTogbWF0aF9ibG9jaywgZGF0YV9wbG90LCBhbmQgc2VsZl9leHBsYW5hdGlvbiBub3cgZGVjbGFyZVxuLy8gYnJlYWstaW5zaWRlOiBhdm9pZCBcdTIwMTQgYSBudW1iZXJlZCBlcXVhdGlvbiwgYSBjaGFydCwgb3IgYSBwcm9tcHQgc2VwYXJhdGVkXG4vLyBmcm9tIGl0cyB3cml0aW5nIGJveCBpcyBhIHByaW50IGJ1ZyBvbiBhbnkgc3VyZmFjZSBcdTIwMTQgYW5kIHRoZSBhdXRob3IgZXh0ZW5kZWRcbi8vIGl0IHRvIHNob3J0X2Fuc3dlciBhbmQgZXNzYXksIHRoZSB0d28gdW5uYW1lZCBzaWJsaW5ncyB0aGF0IHNoYXJlXG4vLyBzZWxmX2V4cGxhbmF0aW9uJ3Mgd3JpdGluZy1ib3ggc3RydWN0dXJlLiBUaGUgcGFyaXR5IGdhdGUgYXNzZXJ0c1xuLy8gVEhJUyBzcGVjIG9uIGJvdGggc3VyZmFjZXMgcmF0aGVyIHRoYW4gZGlmZmluZyBhZ2FpbnN0IHJlbmRlcmVyIG91dHB1dFxuLy8gKHByaW50RXhwZWN0YXRpb25zLnRzKSwgd2hpY2ggaXMgZXhhY3RseSB3aGF0IG1ha2VzIHRoZSBpbXByb3ZlbWVudFxuLy8gZXhwcmVzc2libGU7IHB1Ymxpc2hlZCBwYWdlcyBrZWVwIHRoZWlyIGN1cnJlbnQgYmVoYXZpb3IgdW50aWwgdGhleSByZXRpcmUuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQge1xuICBpc0dyYWRlYWJsZSxcbiAgaXNQYWdlTnVtYmVyZWQsXG4gIHR5cGUgQmxvY2ssXG59IGZyb20gJ0BhY3Rpdml0eS9zY2hlbWEnO1xuaW1wb3J0IHR5cGUge1xuICBCbG9ja0NhdGVnb3J5LFxuICBCbG9ja1JlZ2lzdHJ5LFxuICBCbG9ja1R5cGUsXG4gIENoZWNrZWRTdGF0ZUZhbWlseSxcbn0gZnJvbSAnLi90eXBlcy5qcyc7XG5cbi8qKiBCbGFua1Rva2VuIGZpZWxkcyBzdHJpcHBlZCBmcm9tIGlubGluZSBjb250ZW50IHdoZXJldmVyXG4gKiBTYW5pdGl6ZVNwZWMuaW5saW5lQmxhbmtTZWNyZXRzIGlzIHNldC4gYGhpbnRgIGRlbGliZXJhdGVseSBzdXJ2aXZlcyBcdTIwMTQgaXQgaXNcbiAqIGEgcHJlLWNoZWNrIGFmZm9yZGFuY2UgdGhlIHN0dWRlbnQgbWF5IG9wZW47IHBlci1taXN0YWtlIGZlZWRiYWNrIGlzXG4gKiByZXR1cm5lZCBieSB0aGUgY2hlY2sgUlBDIChydWxpbmcgMi4xQSksIHNvIHRoZSB3aG9sZSBtaXN0YWtlRmVlZGJhY2sgYXJyYXlcbiAqIChtYXRjaCBzdHJpbmdzIEFORCBmZWVkYmFjayB0ZXh0KSBzdHJpcHMuIGBhbnN3ZXJUeXBlYCBzdXJ2aXZlczogaXQgc2hhcGVzXG4gKiB0aGUgaW5wdXQgKG51bWVyaWMga2V5Ym9hcmRzKS4gKi9cbmV4cG9ydCBjb25zdCBCTEFOS19TRUNSRVRfRklFTERTID0gW1xuICAnYW5zd2VyJyxcbiAgJ2FjY2VwdGFibGVBbnN3ZXJzJyxcbiAgJ21pc3Rha2VGZWVkYmFjaycsXG4gICd0b2xlcmFuY2UnLFxuICAnZXF1aXZhbGVuY2UnLFxuICAvLyBUaGUgcmVxdWlyZWQgdW5pdCBhbmQgaXRzIGFsdGVybmF0ZXMgYXJlIGFuc3dlci1rZXkgbWF0ZXJpYWw6IGEgc2VydmVkXG4gIC8vIHVuaXQgd291bGQgcHJvbXB0IHRoZSB2ZXJ5IHJlY2FsbCB0aGUgdW5pdC1iZWFyaW5nIGJsYW5rIHRlc3RzLlxuICAndW5pdCcsXG4gICdhY2NlcHRhYmxlVW5pdHMnLFxuXSBhcyBjb25zdDtcblxuLyoqIE1hdGhQcm9tcHQgZmllbGRzIHN0cmlwcGVkIHdoZXJldmVyIGEgcHJvbXB0cyBhcnJheSBhcHBlYXJzIChtYXRoX2Jsb2NrXG4gKiBibG9ja3MgQU5EIG1hdGhfaW5saW5lIG5vZGVzKS4gVGhlIGdhcCBtYXJrZXJzIGluIHRoZSBsYXRleCBhcmUgdGhlIGdhcHNcbiAqIHRoZW1zZWx2ZXMgKGFscmVhZHkgc2VydmVkIGVtcHR5IHRvZGF5IFx1MjAxNCBzZXJpYWxpemUudHMgcHJlY2VkZW50KTsgdGhlXG4gKiBwcm9tcHQncyBhbnN3ZXIvZ3JhZGluZyBjb25maWcgaXMgdGhlIHNlY3JldC4gYGFjY2VwdGFibGVBbnN3ZXJzYCB3YXNcbiAqIE1JU1NJTkcgZnJvbSB0aGUgUzAgZGVjbGFyYXRpb24gKFwiYWxzbyBhY2NlcHRcIiBhbHRlcm5hdGl2ZSBhbnN3ZXJzIFx1MjAxNCBhIHJlYWxcbiAqIGtleSBsZWFrKSBcdTIwMTQgY2F1Z2h0IGJ5IFMyJ3MgY3Jvc3MtY2hlY2sgYWdhaW5zdCB0aGUgTWF0aFByb21wdCBzY2hlbWEgYW5kXG4gKiBhZGRlZCBiZWZvcmUgdGhlIGZpcnN0IHNhbml0aXplZCBieXRlIHdhcyBzZXJ2ZWQuICovXG5leHBvcnQgY29uc3QgTUFUSF9QUk9NUFRfU0VDUkVUX0ZJRUxEUyA9IFtcbiAgJ2Fuc3dlcicsXG4gICdhY2NlcHRhYmxlQW5zd2VycycsXG4gICdlcXVpdmFsZW5jZScsXG4gICd0b2xlcmFuY2UnLFxuXSBhcyBjb25zdDtcblxuZXhwb3J0IGNvbnN0IGJsb2NrUmVnaXN0cnk6IEJsb2NrUmVnaXN0cnkgPSB7XG4gIHBhcmFncmFwaDoge1xuICAgIHR5cGU6ICdwYXJhZ3JhcGgnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdwYXJhZ3JhcGgnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ3Byb3NlJyB9LFxuICB9LFxuXG4gIGhlYWRpbmc6IHtcbiAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ2hlYWRpbmcnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ3Byb3NlJywga2VlcFdpdGhOZXh0OiB0cnVlIH0sXG4gIH0sXG5cbiAgbWF0aF9ibG9jazoge1xuICAgIHR5cGU6ICdtYXRoX2Jsb2NrJyxcbiAgICAvLyBHYXAtYmVhcmluZyAoTW9kZWwgQSBwcm9tcHRzKSBcdTIxOTIgYXV0by1ncmFkYWJsZSArIG51bWJlcmVkICsgaW50ZXJhY3RpdmU7XG4gICAgLy8gYSBwbGFpbiBkaXNwbGF5IGVxdWF0aW9uIHJlc29sdmVzIHN0YXRpYyB0aHJvdWdoIGZhbWlseU9mKCkuXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLCAvLyBmYWl0aGZ1bDogcmVuZGVyZXIgZW1pdHMgY29udGVudCBldmVuIHdoZW4gZ2FwLWJlYXJpbmdcbiAgICBudW1iZXJlZDogJ3doZW5fZ3JhZGFibGUnLFxuICAgIGFuYWx5dGljc0tleTogJ21hdGhfYmxvY2snLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbJ3NvbHV0aW9uJ10sIGlubGluZUJsYW5rU2VjcmV0czogdHJ1ZSB9LFxuICAgIC8vIFdBUyBhIGZhaXRoZnVsIG9kZGl0eSAoYWJzZW50IGZyb20gdGhlIGJhc2VsaW5lIGJyZWFrLWluc2lkZTphdm9pZCBsaXN0LFxuICAgIC8vIHNvIGEgbnVtYmVyZWQgZGlzcGxheSBlcXVhdGlvbiBjb3VsZCBzcGxpdCBhY3Jvc3MgYSBwYWdlKS4gRklYRUQgYnlcbiAgICAvLyBydWxpbmcgUzUtT1Y2IFx1MjAxNCBzdGlsbCBub3QgaW4gdGhlIHNob3dBbnN3ZXJzIHNldCwgd2hpY2ggaXMgdGhlIHNlcGFyYXRlXG4gICAgLy8gYW5zd2VyLWtleS12YXJpYW50IHF1ZXN0aW9uIFM1LjUgb3ducy5cbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAndW5kZXJsaW5lLWJsYW5rcycgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ0VhY2ggaW4tZXF1YXRpb24gZ2FwIGlzIGEgdGV4dCBpbnB1dCBpbiB0YWIgb3JkZXIsIGxhYmVsZWQgd2l0aCBpdHMgJyArXG4gICAgICAgICdwb3NpdGlvbiB3aXRoaW4gdGhlIGVxdWF0aW9uIChcImdhcCAxIG9mIDJcIikuIFRoZSBQUk9CTEVNIG51bWJlciBpcyAnICtcbiAgICAgICAgJ2Fubm91bmNlZCBvbmNlIGJ5IHRoZSBibG9jayB3cmFwcGVyLCB3aGljaCBpcyBhIGxhYmVsbGVkIGdyb3VwIFx1MjAxNCBub3QgJyArXG4gICAgICAgICdyZXBlYXRlZCBvbiBldmVyeSBnYXAgKHZpZXdlci1udW1iZXJpbmcgRDMpLiBWYWx1ZXMgdHlwZSBhcyBwbGFpbiB0ZXh0OyAnICtcbiAgICAgICAgJ3ZlcmRpY3RzIGFyZSBhbm5vdW5jZWQgdmlhIHRoZSBzaGFyZWQgc3RhdGUtcGlsbCBhcmlhLWxpdmUgcmVnaW9uLicsXG4gICAgfSxcbiAgfSxcblxuICBpbWFnZToge1xuICAgIHR5cGU6ICdpbWFnZScsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ2ltYWdlJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICdmaWd1cmUnIH0sXG4gIH0sXG5cbiAgY2FsbG91dDoge1xuICAgIHR5cGU6ICdjYWxsb3V0JyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnY2FsbG91dCcsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAndmFyaWFudC1ib3JkZXItYm94JyB9LFxuICB9LFxuXG4gIHByb2JsZW06IHtcbiAgICB0eXBlOiAncHJvYmxlbScsXG4gICAgLy8gTnVtYmVyZWQgbGVnYWN5IHByb3NlIHByb2JsZW07IGNhcnJpZXMgYSBzb2x1dGlvbiBidXQgbm8gYXV0by1ncmFkZWRcbiAgICAvLyByZXNwb25zZSAoaXNHcmFkZWFibGU6IGZhbHNlKSBcdTIxOTIgc3RhdGljIGZhbWlseSwgbm8gc3RhdGUgY2hyb21lLiBTY2hlbWFcbiAgICAvLyBvcnBoYW46IG5vIGVkaXRvciBOb2RlVmlldzsgc3RpbGwgcmVuZGVyYWJsZSwgc28gaXQga2VlcHMgYW4gZW50cnkuXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAncHJvYmxlbScsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFsnc29sdXRpb24nXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdwcm9zZScgfSxcbiAgfSxcblxuICBmaWxsX2luX2JsYW5rOiB7XG4gICAgdHlwZTogJ2ZpbGxfaW5fYmxhbmsnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ2ZpbGxfaW5fYmxhbmsnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbJ3NvbHV0aW9uJ10sIGlubGluZUJsYW5rU2VjcmV0czogdHJ1ZSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICd1bmRlcmxpbmUtYmxhbmtzJyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnRWFjaCBibGFuayBpcyBhIHRleHQgaW5wdXQgaW4gdGFiIG9yZGVyLCBsYWJlbGVkIHdpdGggaXRzIHN1Yi1wYXJ0ICcgK1xuICAgICAgICAnYW5kIHBvc2l0aW9uIChcIlBhcnQgYiwgYmxhbmsgMiBvZiAzXCIpIG9uIGEgbnVtYmVyZWQgbXVsdGktYmxhbmsgJyArXG4gICAgICAgICdwcm9ibGVtLCBhbmQgXCJCbGFuayAyIG9mIDNcIiBvdGhlcndpc2UuIFRoZSBQUk9CTEVNIG51bWJlciBpcyAnICtcbiAgICAgICAgJ2Fubm91bmNlZCBvbmNlIGJ5IHRoZSBibG9jayB3cmFwcGVyLCB3aGljaCBpcyBhIGxhYmVsbGVkIGdyb3VwLCAnICtcbiAgICAgICAgJ3JhdGhlciB0aGFuIHJlcGVhdGVkIG9uIGV2ZXJ5IGJsYW5rICh2aWV3ZXItbnVtYmVyaW5nIEQzL043KS4gJyArXG4gICAgICAgICdIaW50IGFuZCBtaXN0YWtlICcgK1xuICAgICAgICAnYWZmb3JkYW5jZXMgYXJlIGJ1dHRvbnMgcmVhY2hhYmxlIGJ5IFRhYjsgdGhlIG9wZW5lZCBwb3BvdmVyIHRyYXBzICcgK1xuICAgICAgICAnbm8gZm9jdXMgYW5kIGNsb3NlcyBvbiBFc2NhcGUuIFZlcmRpY3RzIGFubm91bmNlIHZpYSBhcmlhLWxpdmUuJyxcbiAgICB9LFxuICB9LFxuXG4gIGJ1bGxldF9saXN0OiB7XG4gICAgdHlwZTogJ2J1bGxldF9saXN0JyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnYnVsbGV0X2xpc3QnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ3Byb3NlJyB9LFxuICB9LFxuXG4gIG9yZGVyZWRfbGlzdDoge1xuICAgIHR5cGU6ICdvcmRlcmVkX2xpc3QnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdvcmRlcmVkX2xpc3QnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ3Byb3NlJyB9LFxuICB9LFxuXG4gIGludGVyYWN0aXZlX2dyYXBoOiB7XG4gICAgdHlwZTogJ2ludGVyYWN0aXZlX2dyYXBoJyxcbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJywgLy8gZGlzcGxheSB2YXJpYW50IHJlc29sdmVzIHN0YXRpYyB2aWEgZmFtaWx5T2YoKVxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsIC8vIGRpc3BsYXkgdmFyaWFudCByZXNvbHZlcyBjb250ZW50IHZpYSBjYXRlZ29yeU9mKClcbiAgICBudW1iZXJlZDogJ3doZW5fZ3JhZGFibGUnLFxuICAgIGFuYWx5dGljc0tleTogJ2ludGVyYWN0aXZlX2dyYXBoJyxcbiAgICB2YXJpYW50czogW1xuICAgICAgJ3Bsb3RfcG9pbnQnLFxuICAgICAgJ3Bsb3RfZnVuY3Rpb24nLFxuICAgICAgJ3NoYWRlX3JlZ2lvbicsXG4gICAgICAnZ3JhcGhfaW5lcXVhbGl0eScsXG4gICAgICAncGxvdF9yYXknLFxuICAgICAgJ3Bsb3Rfc2VnbWVudCcsXG4gICAgICAnZGlzcGxheScsXG4gICAgXSxcbiAgICBzYW5pdGl6ZToge1xuICAgICAgLy8gVGhlIHdpZGdldCBuZWVkcyBoYW5kbGUgY291bnQgLyBmYW1pbHksIHdoaWNoIGxpdmUgaW4gdGhlIGtleSB0aGVcbiAgICAgIC8vIHZpZXdlciBuZXZlciBnZXRzLiBEZXJpdmVkICsgd2hpdGVsaXN0ZWQ7IHNlZSBTYW5pdGl6ZVNwZWMuXG4gICAgICBkZXJpdmVRdWVzdGlvblNoYXBlOiB0cnVlLFxuICAgICAgLy8gVmFyaWFudC1zY29wZWQga2V5czogcGF0aHMgdGhhdCBkb24ndCBleGlzdCBvbiBhbiBpbnN0YW5jZSdzXG4gICAgICAvLyBpbnRlcmFjdGlvbiBzaW1wbHkgZG9uJ3QgbWF0Y2guIGBhbGxvd05vU29sdXRpb25gIFNVUlZJVkVTIChpdCByZW5kZXJzXG4gICAgICAvLyB0aGUgXCJubyBzb2x1dGlvblwiIGNvbnRyb2wpOyBgbm9Tb2x1dGlvbkNvcnJlY3RgIGlzIHRoZSBhbnN3ZXIuXG4gICAgICBzdHJpcDogW1xuICAgICAgICAnaW50ZXJhY3Rpb24uY29ycmVjdFBvaW50cycsXG4gICAgICAgICdpbnRlcmFjdGlvbi50b2xlcmFuY2UnLFxuICAgICAgICAnaW50ZXJhY3Rpb24ubW9kZWxzJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLmRvbWFpbnMnLFxuICAgICAgICAnaW50ZXJhY3Rpb24ucmVnaW9ucycsXG4gICAgICAgICdpbnRlcmFjdGlvbi5pbmVxdWFsaXRpZXMnLFxuICAgICAgICAnaW50ZXJhY3Rpb24ucmF5cycsXG4gICAgICAgICdpbnRlcmFjdGlvbi5zZWdtZW50cycsXG4gICAgICAgICdtaXN0YWtlRmVlZGJhY2snLFxuICAgICAgICAnc29sdXRpb24nLFxuICAgICAgICAnbm9Tb2x1dGlvbkNvcnJlY3QnLFxuICAgICAgICAnYnVpbHRpbkZlZWRiYWNrJyxcbiAgICAgIF0sXG4gICAgfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnc3RhdGljLXN2ZycgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ1RoZSBjYW52YXMgaXMgZm9jdXNhYmxlOyBoYW5kbGVzIG1vdmUgYnkgYXJyb3cga2V5cyB3aXRoIHBvc2l0aW9uICcgK1xuICAgICAgICAnbmFycmF0aW9uIHRvIGEgdmlzdWFsbHktaGlkZGVuIGFyaWEtbGl2ZSByZWdpb24gKGEgdmlzaWJsZSByZWFkb3V0ICcgK1xuICAgICAgICAnd291bGQgaGFuZCBvdmVyIHRoZSBhbnN3ZXIgXHUyMDE0IHJlYWRpbmcgdGhlIGdyaWQgaXMgdGhlIHNraWxsKS4gJyArXG4gICAgICAgICdQb3N0LWNoZWNrIHJlc3VsdHMgYXJlIHZpc2libGUgdGV4dC4gVG91Y2ggdGFyZ2V0cyBtZWV0IDQ0cHguJyxcbiAgICB9LFxuICB9LFxuXG4gIG11bHRpcGxlX2Nob2ljZToge1xuICAgIHR5cGU6ICdtdWx0aXBsZV9jaG9pY2UnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ211bHRpcGxlX2Nob2ljZScsXG4gICAgc2FuaXRpemU6IHtcbiAgICAgIC8vIFBlci1jaG9pY2UgZmVlZGJhY2sgcmV0dXJucyB2aWEgdGhlIGNoZWNrIFJQQyAoMi4xQSksIGxpa2UgYmxhbmtzJy5cbiAgICAgIC8vIG1pc2NvbmNlcHRpb25JZCBpcyBzZXJ2ZXItc2lkZSBtZXRhZGF0YSAoYSBkaXN0cmFjdG9yXHUyMTkycmVnaXN0cnlcbiAgICAgIC8vIGJpbmRpbmcpOyBhIHByZS1jaGVjayBjbGllbnQgY291bGQgb3RoZXJ3aXNlIHJlYWQgd2hpY2ggd3JvbmdcbiAgICAgIC8vIGFuc3dlcnMgd2VyZSBhbnRpY2lwYXRlZC5cbiAgICAgIHN0cmlwOiBbXG4gICAgICAgICdjaG9pY2VzW10uY29ycmVjdCcsXG4gICAgICAgICdjaG9pY2VzW10uZmVlZGJhY2snLFxuICAgICAgICAnY2hvaWNlc1tdLm1pc2NvbmNlcHRpb25JZCcsXG4gICAgICAgICdzb2x1dGlvbicsXG4gICAgICBdLFxuICAgIH0sXG4gICAgcHJpbnQ6IHtcbiAgICAgIGJyZWFrSW5zaWRlOiAnYXZvaWQnLFxuICAgICAgdHJlYXRtZW50OiAnY2hvaWNlLWxldHRlcnMnLFxuICAgICAgLy8gUHJpbnRlZCB2ZXJzaW9ucyByZWFycmFuZ2UgdGhlIGNob2ljZXM7IGEgcXVlc3Rpb24gdGhhdCBzYXlzIFwiYWxsIG9mXG4gICAgICAvLyB0aGUgYWJvdmVcIiBvcHRzIG91dCBwZXItYmxvY2sgKEQxN0EpLiBOT1Qgc2VydmVTaHVmZmxlZDogdGhlIHN0dWRlbnRcbiAgICAgIC8vIHNjcmVlbiBrZWVwcyB0aGUgYXV0aG9yZWQgb3JkZXIsIGJlY2F1c2UgdGhlIGFuc3dlciBpcyB0aGUgY2hvaWNlIGlkXG4gICAgICAvLyBhbmQgcmVhcnJhbmdpbmcgaXQgdGhlcmUgYnV5cyBub3RoaW5nLlxuICAgICAgc2h1ZmZsZWQ6IFsnY2hvaWNlcyddLFxuICAgICAgc2h1ZmZsZUxvY2tlZEJ5OiAnbG9ja0Nob2ljZU9yZGVyJyxcbiAgICB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnTmF0aXZlIHJhZGlvIChzaW5nbGUpIC8gY2hlY2tib3ggKG11bHRpKSBpbnB1dHMgZ3JvdXBlZCBpbiBhICcgK1xuICAgICAgICAnZmllbGRzZXQgd2hvc2UgbGVnZW5kIGlzIHRoZSBwcm9tcHQ7IGZ1bGwgbGFiZWwgY2xpY2sgdGFyZ2V0cy4gJyArXG4gICAgICAgICdTdGFuZGFyZCBhcnJvdy1rZXkgcmFkaW8gYmVoYXZpb3I7IHZlcmRpY3RzIGFubm91bmNlIHZpYSBhcmlhLWxpdmUuJyxcbiAgICB9LFxuICB9LFxuXG4gIG1hdGNoaW5nOiB7XG4gICAgdHlwZTogJ21hdGNoaW5nJyxcbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdtYXRjaGluZycsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFsna2V5JywgJ3NvbHV0aW9uJ10gfSxcbiAgICAvLyBBOS9FMzogY29uZGl0aW9uYWwsIGFuZCBkZWNsYXJlZCBhcyBzdWNoIFx1MjAxNCB0aGUgYmFuayBkcm9wcyBpdHNcbiAgICAvLyB1bmJyZWFrYWJpbGl0eSBvbmNlIGl0IGhvbGRzIGZpZ3VyZXMuIFNlZSBQcmludFNwZWMuYnJlYWtJbnNpZGUuXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZC11bmxlc3MtZmlndXJlcycsIHRyZWF0bWVudDogJ2xldHRlci1iYW5rJyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnUG9pbnRlciBkcmFnIHdpdGggYSBrZXlib2FyZCBzZWxlY3QtdGhlbi1wbGFjZSBncmFtbWFyIHVuZGVybmVhdGg6ICcgK1xuICAgICAgICAndGFyZ2V0IGNhcmRzIGFyZSBmb2N1c2FibGUsIFNwYWNlL0VudGVyIGxpZnRzLCBhcnJvd3MgY2hvb3NlIGEgZG9jaywgJyArXG4gICAgICAgICdTcGFjZS9FbnRlciBwbGFjZXMsIEVzY2FwZSBjYW5jZWxzLiBFdmVyeSBtb3ZlIG5hcnJhdGVzIHRvIGEgJyArXG4gICAgICAgICd2aXN1YWxseS1oaWRkZW4gYXJpYS1saXZlIHJlZ2lvbiAoXCJDYXJkIEIgcGxhY2VkIG9uIGl0ZW0gMlwiKS4nLFxuICAgIH0sXG4gIH0sXG5cbiAgb3JkZXJpbmc6IHtcbiAgICB0eXBlOiAnb3JkZXJpbmcnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ29yZGVyaW5nJyxcbiAgICBzYW5pdGl6ZToge1xuICAgICAgc3RyaXA6IFsnc29sdXRpb24nXSxcbiAgICAgIC8vIFRoZSBhdXRob3JlZCBpdGVtcyBvcmRlciBJUyB0aGUga2V5IFx1MjAxNCB0aGUgc2VydmVyIHNlcnZlcyBhIHNodWZmbGVcbiAgICAgIC8vIChzdGFibGUgcGVyIHZlcnNpb24gKyBzdHVkZW50IHNvIHJlbG9hZHMgZG9uJ3QgcmVzaHVmZmxlKS5cbiAgICAgIHNlcnZlU2h1ZmZsZWQ6IFsnaXRlbXMnXSxcbiAgICB9LFxuICAgIHByaW50OiB7XG4gICAgICBicmVha0luc2lkZTogJ2F2b2lkJyxcbiAgICAgIHRyZWF0bWVudDogJ251bWJlci1ib3hlcycsXG4gICAgICAvLyBUaGUgYXV0aG9yZWQgb3JkZXIgaXMgdGhlIGFuc3dlciwgc28gcGFwZXIgbXVzdCBuZXZlciBzaG93IGl0LiBUaGVcbiAgICAgIC8vIHNlcnZlciBhbHJlYWR5IHNodWZmbGVzIGZvciBzdHVkZW50cyAoc2VydmVTaHVmZmxlZCBhYm92ZSk7IHRlYWNoZXJcbiAgICAgIC8vIHByaW50IGdldHMgaXRzIG93biwgYmVjYXVzZSB0aGF0IHBhdGggZGVsaWJlcmF0ZWx5IGRvZXMgbm90IHJ1biB0aGVcbiAgICAgIC8vIHBlci1zdHVkZW50IHNlcnZlIHNodWZmbGUuXG4gICAgICBzaHVmZmxlZDogWydpdGVtcyddLFxuICAgIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdSb3dzIGFyZSBmb2N1c2FibGUgYW5kIHJlb3JkZXIgdmlhIHRoZSBzaGFyZWQgbGlmdCBncmFtbWFyOiAnICtcbiAgICAgICAgJ1NwYWNlL0VudGVyIGxpZnRzLCBhcnJvd3MgbW92ZSB0aGUgcm93LCBTcGFjZS9FbnRlciBkcm9wcywgRXNjYXBlICcgK1xuICAgICAgICAnY2FuY2VsczsgcG9zaXRpb25zIG5hcnJhdGUgdG8gYSB2aXN1YWxseS1oaWRkZW4gYXJpYS1saXZlIHJlZ2lvbi4nLFxuICAgIH0sXG4gIH0sXG5cbiAgbnVtYmVyX2xpbmU6IHtcbiAgICB0eXBlOiAnbnVtYmVyX2xpbmUnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ251bWJlcl9saW5lJyxcbiAgICB2YXJpYW50czogWydwbG90X3BvaW50JywgJ3Bsb3RfaW50ZXJ2YWwnXSxcbiAgICBzYW5pdGl6ZToge1xuICAgICAgLy8gVGhlIHdpZGdldCBuZWVkcyBoYW5kbGUgY291bnQgLyBmYW1pbHksIHdoaWNoIGxpdmUgaW4gdGhlIGtleSB0aGVcbiAgICAgIC8vIHZpZXdlciBuZXZlciBnZXRzLiBEZXJpdmVkICsgd2hpdGVsaXN0ZWQ7IHNlZSBTYW5pdGl6ZVNwZWMuXG4gICAgICBkZXJpdmVRdWVzdGlvblNoYXBlOiB0cnVlLFxuICAgICAgc3RyaXA6IFtcbiAgICAgICAgJ2ludGVyYWN0aW9uLmNvcnJlY3RQb2ludHMnLFxuICAgICAgICAnaW50ZXJhY3Rpb24udG9sZXJhbmNlJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLmNvcnJlY3RJbnRlcnZhbCcsXG4gICAgICAgICdzb2x1dGlvbicsXG4gICAgICBdLFxuICAgIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3N0YXRpYy1zdmcnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdUaGUgbGluZSBpcyBmb2N1c2FibGU7IHBvaW50cy9pbnRlcnZhbCBlbmRwb2ludHMgbW92ZSBieSBhcnJvdyBrZXlzICcgK1xuICAgICAgICAnd2l0aCB2YWx1ZSBuYXJyYXRpb24gdG8gYSB2aXN1YWxseS1oaWRkZW4gYXJpYS1saXZlIHJlZ2lvbiAodmlzaWJsZSAnICtcbiAgICAgICAgJ3JlYWRvdXQgd291bGQgcmV2ZWFsIHRoZSBhbnN3ZXIpLiBQb3N0LWNoZWNrIHJlc3VsdHMgYXJlIHZpc2libGUuJyxcbiAgICB9LFxuICB9LFxuXG4gIGRhdGFfcGxvdDoge1xuICAgIHR5cGU6ICdkYXRhX3Bsb3QnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLCAvLyBkaXNwbGF5IHZhcmlhbnQgcmVzb2x2ZXMgc3RhdGljIHZpYSBmYW1pbHlPZigpXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJywgLy8gZGlzcGxheSB2YXJpYW50IHJlc29sdmVzIGNvbnRlbnQgdmlhIGNhdGVnb3J5T2YoKVxuICAgIG51bWJlcmVkOiAnd2hlbl9ncmFkYWJsZScsXG4gICAgYW5hbHl0aWNzS2V5OiAnZGF0YV9wbG90JyxcbiAgICB2YXJpYW50czogWydkaXNwbGF5JywgJ2J1aWxkX2RvdHBsb3QnLCAnYnVpbGRfaGlzdG9ncmFtJywgJ2J1aWxkX2JveHBsb3QnXSxcbiAgICBzYW5pdGl6ZToge1xuICAgICAgLy8gVGhlIHdpZGdldCBuZWVkcyBoYW5kbGUgY291bnQgLyBmYW1pbHksIHdoaWNoIGxpdmUgaW4gdGhlIGtleSB0aGVcbiAgICAgIC8vIHZpZXdlciBuZXZlciBnZXRzLiBEZXJpdmVkICsgd2hpdGVsaXN0ZWQ7IHNlZSBTYW5pdGl6ZVNwZWMuXG4gICAgICBkZXJpdmVRdWVzdGlvblNoYXBlOiB0cnVlLFxuICAgICAgc3RyaXA6IFsnc29sdXRpb24nLCAnaW50ZXJhY3Rpb24udG9sZXJhbmNlJ10sXG4gICAgICBkZXJpdmFibGVGcm9tU2VydmVkOlxuICAgICAgICAnVGhlIGRhdGEgc2V0IGlzIHRoZSB3b3JraW5nIG1hdGVyaWFsIHRoZSBzdHVkZW50IGJ1aWxkcyB0aGUgY2hhcnQgJyArXG4gICAgICAgICdGUk9NLCBhbmQgdGhlIGNvcnJlY3QgY2hhcnQgaXMgY29tcHV0ZWQgZnJvbSBpdCBcdTIwMTQgd2l0aGhvbGRpbmcgdGhlICcgK1xuICAgICAgICAnZGF0YSB3b3VsZCByZW1vdmUgdGhlIHRhc2suIFNlcnZlci1hdXRob3JpdGF0aXZlIGdyYWRpbmcgc3RpbGwgZ2F0ZXMgJyArXG4gICAgICAgICd2ZXJkaWN0czsgdGhlIGxlYWsgdGVzdHMgd2hpdGVsaXN0IGBkYXRhYCBmb3IgdGhpcyBibG9jayBleHBsaWNpdGx5LicsXG4gICAgfSxcbiAgICAvLyBXQVMgYSBmYWl0aGZ1bCBvZGRpdHkgKGFic2VudCBmcm9tIHRoZSBiYXNlbGluZSBicmVhay1pbnNpZGU6YXZvaWQgbGlzdCxcbiAgICAvLyB1bmxpa2UgdGhlIGdyYXBoIGFuZCBudW1iZXItbGluZSBjYW52YXNlcykuIEZJWEVEIGJ5IHJ1bGluZyBTNS1PVjYgXHUyMDE0IGFcbiAgICAvLyBjaGFydCBzcGxpdCBhY3Jvc3MgYSBwYWdlIGJvdW5kYXJ5IGlzIHVucmVhZGFibGUuXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3N0YXRpYy1zdmcnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdDaGFydC1idWlsZGluZyBjb250cm9scyBhcmUgZm9jdXNhYmxlOyBkb3RzL2JhcnMvYm94IGhhbmRsZXMgYWRqdXN0ICcgK1xuICAgICAgICAnYnkgYXJyb3cga2V5cyB3aXRoIHZhbHVlIG5hcnJhdGlvbiB0byBhIHZpc3VhbGx5LWhpZGRlbiBhcmlhLWxpdmUgJyArXG4gICAgICAgICdyZWdpb24uIFBvc3QtY2hlY2sgcmVzdWx0cyBhcmUgdmlzaWJsZSB0ZXh0LicsXG4gICAgfSxcbiAgfSxcblxuICBsZWFybmluZ19vYmplY3RpdmVzOiB7XG4gICAgdHlwZTogJ2xlYXJuaW5nX29iamVjdGl2ZXMnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdsZWFybmluZ19vYmplY3RpdmVzJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnYm9yZGVyZWQtYm94JyB9LFxuICB9LFxuXG4gIHdvcmtlZF9leGFtcGxlOiB7XG4gICAgdHlwZTogJ3dvcmtlZF9leGFtcGxlJyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnd29ya2VkX2V4YW1wbGUnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSwgY2hpbGRCbG9ja3M6IFsnY29udGVudCddIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ2JvcmRlcmVkLWJveCcgfSxcbiAgfSxcblxuICBmYWRlZF93b3JrZWRfZXhhbXBsZToge1xuICAgIHR5cGU6ICdmYWRlZF93b3JrZWRfZXhhbXBsZScsXG4gICAgLy8gVGhlIGJveCBjb3VudHMgYXMgT05FIG51bWJlcmVkIHByb2JsZW07IGdyYWRpbmcgcmlkZXMgaXRzIGNoaWxkXG4gICAgLy8gZmlsbF9pbl9ibGFuayBzdGVwcywgZWFjaCBzYW5pdGl6ZWQgYnkgaXRzIG93biBlbnRyeSB2aWEgY2hpbGRCbG9ja3MuXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdzY2FmZm9sZCcsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ2ZhZGVkX3dvcmtlZF9leGFtcGxlJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10sIGNoaWxkQmxvY2tzOiBbJ2NvbnRlbnQnXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdib3JkZXJlZC1ib3gnIH0sXG4gIH0sXG5cbiAgdGFibGU6IHtcbiAgICB0eXBlOiAndGFibGUnLFxuICAgIC8vIERVQUwtTkFUVVJFRCwgcmVzb2x2ZWQgcGVyIGluc3RhbmNlIHJhdGhlciB0aGFuIGRlY2xhcmVkIHBlciB0eXBlOiBhXG4gICAgLy8gdGFibGUgd2hvc2UgY2VsbHMgaG9sZCBibGFua3MgaXMgYSBxdWVzdGlvbjsgYSBibGFua2xlc3Mgb25lIGlzIGFcbiAgICAvLyBzdGltdWx1cyAoYSByYXRlcyBjaGFydCB0byBSRUFEKS4gZmFtaWx5T2YoKS9jYXRlZ29yeU9mKCkgcm91dGUgdGhyb3VnaFxuICAgIC8vIGlzR3JhZGVhYmxlLCB3aGljaCBhbnN3ZXJzIGZyb20gQ09OVEVOVCBcdTIwMTQgdGhlIG1hdGhfYmxvY2sgcHJlY2VkZW50LCBhbmRcbiAgICAvLyB0aGUgcmVhc29uIHRoZXJlIGlzIG5vIGF1dGhvcmVkIGBpbnRlcmFjdGl2ZWAgZmxhZyB0byBkcmlmdC5cbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnd2hlbl9ncmFkYWJsZScsXG4gICAgYW5hbHl0aWNzS2V5OiAndGFibGUnLFxuICAgIC8vIENlbGxzIGFyZSBOT1QgYmxvY2tzLCBzbyBgY2hpbGRCbG9ja3NgIHdvdWxkIGJlIGEgY2F0ZWdvcnkgZXJyb3IgaGVyZS5cbiAgICAvLyBUaGUgY2VsbCBibGFua3MgYXJlIGluLWJhbmQgY29udGVudCBvZiBUSElTIGJsb2NrOiB0aGUgZGVlcCBzdHJpcCB3YWxrc1xuICAgIC8vIHRoZW0gdW5jb25kaXRpb25hbGx5IChpdCBuZXZlciBzdG9wcyBhdCBuZXN0ZWQgYXJyYXlzKSwgYW5kIHRoaXMgZmxhZyBpc1xuICAgIC8vIHRoZSBkZWNsYXJhdGlvbiArIHRoZSB0eXBlIHByb2plY3Rpb24gdGhhdCBzYXlzIHNvLlxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSwgaW5saW5lQmxhbmtTZWNyZXRzOiB0cnVlIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ2RhdGEtdGFibGUnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdUaGUgdGFibGUgaXMgYSByZWFsIDx0YWJsZT4gd2l0aCA8dGg+IGNlbGxzIG9uIHdoaWNoZXZlciBheGlzIHRoZSAnICtcbiAgICAgICAgJ2F1dGhvciBtYXJrZWQgKGhlYWRlclJvdyAvIGhlYWRlckNvbHVtbiksIHNvIGEgc2NyZWVuIHJlYWRlciAnICtcbiAgICAgICAgJ2Fubm91bmNlcyBhIGJsYW5rIGNlbGwgd2l0aCBpdHMgcm93IGFuZCBjb2x1bW4gaGVhZGVycyBcdTIwMTQgXCJLaWxvZ3JhbXMgJyArXG4gICAgICAgICcyLCBDb3N0LCBibGFua1wiIFx1MjAxNCB3aGljaCBpcyB0aGUgaW5mb3JtYXRpb24gYSBzaWdodGVkIHN0dWRlbnQgcmVhZHMgJyArXG4gICAgICAgICdvZmYgdGhlIGdyaWQuIEVhY2ggYmxhbmsgaXMgYSB0ZXh0IGlucHV0IGluIHRhYiBvcmRlciwgcmVhZGluZyBvcmRlciAnICtcbiAgICAgICAgJ2xlZnQgdG8gcmlnaHQgdGhlbiBkb3duLiBPbiBhIG11bHRpLWJsYW5rIHRhYmxlIHRoZSBpbnB1dCBhbHNvICcgK1xuICAgICAgICAnY2FycmllcyBpdHMgc3ViLXBhcnQgbGV0dGVyIChcIlBhcnQgYlwiKSwgbWF0Y2hpbmcgdGhlIChiKSBtYXJrZXIgJyArXG4gICAgICAgICdwcmludGVkIGJlc2lkZSBpdDsgdGhhdCBtYXJrZXIgaXMgYXJpYS1oaWRkZW4gc28gaXQgaXMgbm90IGFubm91bmNlZCAnICtcbiAgICAgICAgJ3R3aWNlLiBUaGUgUFJPQkxFTSBudW1iZXIgaXMgYW5ub3VuY2VkIG9uY2UgYnkgdGhlIGJsb2NrIHdyYXBwZXIsICcgK1xuICAgICAgICAnbmV2ZXIgcmVwZWF0ZWQgcGVyIGNlbGwgKHZpZXdlci1udW1iZXJpbmcgRDMpLiBWZXJkaWN0cyBhbm5vdW5jZSB2aWEgJyArXG4gICAgICAgICd0aGUgc2hhcmVkIHN0YXRlLXBpbGwgYXJpYS1saXZlIHJlZ2lvbi4nLFxuICAgIH0sXG4gIH0sXG5cbiAgc2VsZl9leHBsYW5hdGlvbjoge1xuICAgIHR5cGU6ICdzZWxmX2V4cGxhbmF0aW9uJyxcbiAgICBmYW1pbHk6ICdyZWNvcmRlZCcsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdzZWxmX2V4cGxhbmF0aW9uJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICAvLyBXQVMgYSBmYWl0aGZ1bCBvZGRpdHk6IHRoZSBiYXNlbGluZSBhdm9pZCByaWRlcyB0aGUgdGV4dGFyZWEsIG5vdCB0aGVcbiAgICAvLyBibG9jaywgc28gYSBsb25nIHByb21wdCBjb3VsZCBzZXBhcmF0ZSBmcm9tIGl0cyB3cml0aW5nIGJveC4gRklYRUQgYnlcbiAgICAvLyBydWxpbmcgUzUtT1Y2IFx1MjAxNCBhIHByb21wdCBvbiBvbmUgcGFnZSBhbmQgaXRzIGFuc3dlciBzcGFjZSBvbiB0aGUgbmV4dCBpc1xuICAgIC8vIHRoZSBzYW1lIGRlZmVjdCBjbGFzcyBhcyBhIHNwbGl0IGVxdWF0aW9uLlxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICd3cml0aW5nLWJveCcgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ0EgbGFiZWxlZCB0ZXh0YXJlYSBpbiB0YWIgb3JkZXIuIE9uIGNoZWNrIHRoZSBibG9jayBhbm5vdW5jZXMgJyArXG4gICAgICAgICdcIlJlY29yZGVkIFx1MjAxNCB5b3VyIHRlYWNoZXIgd2lsbCByZXZpZXdcIiB2aWEgYXJpYS1saXZlOyBuZXZlciBhIHZlcmRpY3QuJyxcbiAgICB9LFxuICB9LFxuXG4gIHNob3J0X2Fuc3dlcjoge1xuICAgIHR5cGU6ICdzaG9ydF9hbnN3ZXInLFxuICAgIGZhbWlseTogJ3JlY29yZGVkJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIC8vIFdBUyAnbmV2ZXInIFx1MjAxNCBhIHByZS1wYXBlci1maXJzdCBjaG9pY2UuIFJ1bGluZyBFNyAoMjAyNi0wOC0xOSk6IGEgZ3JhZGVkXG4gICAgLy8gcXVlc3Rpb24gYSB0ZWFjaGVyIG1hcmtzIG9uIHBhcGVyIG5lZWRzIGEgbnVtYmVyLCBhbmQgdGhlIG51bWJlcmluZyB3YWxrXG4gICAgLy8gdGhhdCBhbHJlYWR5IGV4aXN0cyBnaXZlcyB0aGUgc2NhbiBhcmMgaXRzIHBhcGVyXHUyMTkyYmxvY2sgbWFwcGluZyBmb3IgZnJlZS5cbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAnc2hvcnRfYW5zd2VyJyxcbiAgICAvLyBSdWJyaWNzIGFyZSB0ZWFjaGVyLXNpZGUgZGF0YSBcdTIwMTQgYWxyZWFkeSBjb3JyZWN0bHkgd2l0aGhlbGQgZnJvbSBzdHVkZW50XG4gICAgLy8gSFRNTCB0b2RheTsgdGhlIHJlZ2lzdHJ5IG1ha2VzIHRoYXQgYSBkZWNsYXJlZCBpbnZhcmlhbnQuXG4gICAgLy9cbiAgICAvLyBgYW5zd2VyYCBhbmQgYHNvbHV0aW9uYCBqb2luZWQgaXQgd2l0aCB0aGUgYW5zd2VyLWtleSBzbGljZSAocnVsaW5nIEUyL0UzKVxuICAgIC8vIGFuZCB0aGUgT1JERVIgT0YgRVZFTlRTIG1hdHRlcnMgbW9yZSB0aGFuIHRoZSBsaXN0IGRvZXM6IEUzIGRlY2xhcmVzIHRoZVxuICAgIC8vIGFudGktbGVhayBjaGFpbiBPTkUgSU5TRVBBUkFCTEUgVU5JVCBcdTIwMTQgdGhpcyBzdHJpcCBlbnRyeSwgdGhlIGxlYWtGaXh0dXJlXG4gICAgLy8gc2VudGluZWwgcm93IHRoYXQgb2JzZXJ2ZXMgaXQsIHRoZSBzYW5pdGl6ZSB1bml0IGFzc2VydGlvbiwgYW5kIHRoZVxuICAgIC8vIHNjaGVtYS12cy1yZWdpc3RyeSBjb21wbGV0ZW5lc3MgZ2F0ZSBhbGwgbGFuZCB0b2dldGhlci4gQSBzdHJpcCBlbnRyeVxuICAgIC8vIHdpdGhvdXQgaXRzIGZpeHR1cmUgcm93IGlzIGEgY2xhaW0gbm90aGluZyBjaGVja3MgKHRoZSBcInBhc3NpbmcgYmVjYXVzZVxuICAgIC8vIG9mIHdoYXQgaXMgYWJzZW50XCIgY2xhc3MpLCB3aGljaCBpcyBleGFjdGx5IGhvdyBhIGtleSBsZWFrcyBxdWlldGx5LlxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbJ3J1YnJpYycsICdhbnN3ZXInLCAnc29sdXRpb24nXSB9LFxuICAgIC8vIFNhbWUgZm9ybWVyIG9kZGl0eSBhcyBzZWxmX2V4cGxhbmF0aW9uLCBhbmQgZml4ZWQgd2l0aCBpdDogdGhlIGJhc2VsaW5lXG4gICAgLy8gYXZvaWQgcmlkZXMgdGhlIHRleHRhcmVhLCBub3QgdGhlIGJsb2NrLCBzbyBhIHByb21wdCBjb3VsZCBwcmludCBvbiBvbmVcbiAgICAvLyBwYWdlIHdpdGggaXRzIGFuc3dlciBzcGFjZSBvbiB0aGUgbmV4dC4gUzUtT1Y2IG5hbWVkIG9ubHkgdGhlIHRocmVlXG4gICAgLy8gdHlwZXMgaXRzIGNvbW1lbnRzIGZsYWdnZWQ7IHRoZSBhdXRob3IgZXh0ZW5kZWQgdGhlIHJ1bGluZyB0byB0aGUgdHdvXG4gICAgLy8gdW5uYW1lZCBzaWJsaW5ncyBvZiB0aGUgc2FtZSBmYW1pbHkgcmF0aGVyIHRoYW4gbGVhdmUgdGhlIGRlZmVjdCBpblxuICAgIC8vIHBsYWNlIGZvciB0aGVtICh0aGUgcGxvdF9yYXkvcGxvdF9zZWdtZW50IGxlc3NvbjogYXVkaXQgdGhlIGZhbWlseSkuXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3dyaXRpbmctYm94JyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnQSBsYWJlbGVkIHRleHRhcmVhIGluIHRhYiBvcmRlci4gUmVjb3JkZWQgc3RhdGUgYW5ub3VuY2VzIHZpYSAnICtcbiAgICAgICAgJ2FyaWEtbGl2ZTsgdGVhY2hlciBmZWVkYmFjaywgb25jZSByZWxlYXNlZCwgcmVuZGVycyBhcyBhIGxhYmVsZWQgJyArXG4gICAgICAgICdyZWdpb24gYW5ub3VuY2VkIG9uIGFycml2YWwuJyxcbiAgICB9LFxuICB9LFxuXG4gIGVzc2F5OiB7XG4gICAgdHlwZTogJ2Vzc2F5JyxcbiAgICBmYW1pbHk6ICdyZWNvcmRlZCcsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICAvLyBOdW1iZXJlZCB3aXRoIHNob3J0X2Fuc3dlciBcdTIwMTQgc2VlIHRoZSBub3RlIHRoZXJlIChydWxpbmcgRTcpLlxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdlc3NheScsXG4gICAgLy8gYW5zd2VyICsgc29sdXRpb24gcmlkZSB0aGUgc2FtZSBhbnRpLWxlYWsgdW5pdCBhcyBzaG9ydF9hbnN3ZXInczsgRTQnc1xuICAgIC8vIHBhcml0eSBydWxpbmcgaXMgd2hhdCBrZWVwcyB0aGVzZSB0d28gbGlzdHMgaWRlbnRpY2FsLlxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbJ3J1YnJpYycsICdhbnN3ZXInLCAnc29sdXRpb24nXSB9LFxuICAgIC8vIEV4dGVuZGVkIHdpdGggc2hvcnRfYW5zd2VyICsgc2VsZl9leHBsYW5hdGlvbiBcdTIwMTQgc2VlIHRoZSBub3RlIHRoZXJlLlxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICd3cml0aW5nLWJveCcgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ0EgbGFiZWxlZCB0ZXh0YXJlYSBpbiB0YWIgb3JkZXIuIFRoZSBsaXZlIHdvcmQgY291bnRlciBpcyAnICtcbiAgICAgICAgJ2FyaWEtbGl2ZT1wb2xpdGUgYW5kIGRlYm91bmNlZCBzbyBpdCBuZXZlciBjaGF0dGVycyBwZXIga2V5c3Ryb2tlLiAnICtcbiAgICAgICAgJ1JlY29yZGVkIHN0YXRlIGFuZCByZWxlYXNlZCB0ZWFjaGVyIGZlZWRiYWNrIGFubm91bmNlIHZpYSBhcmlhLWxpdmUuJyxcbiAgICB9LFxuICB9LFxuXG4gIGdyYXBoX2ZpZ3VyZToge1xuICAgIHR5cGU6ICdncmFwaF9maWd1cmUnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdncmFwaF9maWd1cmUnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ2ZpZ3VyZScgfSxcbiAgfSxcbn07XG5cbi8qKiBFdmVyeSByZWdpc3RlcmVkIHR5cGUsIGluIHJlZ2lzdHJ5IGRlY2xhcmF0aW9uIG9yZGVyLiAqL1xuZXhwb3J0IGNvbnN0IHJlZ2lzdGVyZWRCbG9ja1R5cGVzID0gT2JqZWN0LmtleXMoYmxvY2tSZWdpc3RyeSkgYXMgQmxvY2tUeXBlW107XG5cbi8qKiBSZXNvbHZlIGFuIElOU1RBTkNFJ3MgY2hlY2tlZC1zdGF0ZSBmYW1pbHkuIEEgdHlwZSdzIGRlY2xhcmVkIGZhbWlseSBpc1xuICogbWF4aW1hbDsgdW5ncmFkYWJsZSBpbnN0YW5jZXMgb2YgZ3JhZGFibGUgdHlwZXMgKGRpc3BsYXkgZ3JhcGgvZGF0YSBwbG90LFxuICogcHJvbXB0bGVzcyBtYXRoIGJsb2NrKSByZXNvbHZlIHRvIHN0YXRpYyBcdTIwMTQgb25lIHJ1bGUgZW5naW5lLCBpc0dyYWRlYWJsZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmYW1pbHlPZihibG9jazogQmxvY2spOiBDaGVja2VkU3RhdGVGYW1pbHkge1xuICBjb25zdCBlbnRyeSA9IGJsb2NrUmVnaXN0cnlbYmxvY2sudHlwZV07XG4gIGlmIChlbnRyeS5mYW1pbHkgPT09ICdzdGF0aWMnKSByZXR1cm4gJ3N0YXRpYyc7XG4gIHJldHVybiBpc0dyYWRlYWJsZShibG9jaykgPyBlbnRyeS5mYW1pbHkgOiAnc3RhdGljJztcbn1cblxuLyoqIFJlc29sdmUgYW4gSU5TVEFOQ0UncyBjYXRlZ29yeTogYSBkaXNwbGF5LW1vZGUgZ3JhcGgvZGF0YSBwbG90IHNlcnZlcyBhc1xuICogY29udGVudCwgbWF0Y2hpbmcgdGhlIHJlbmRlcmVyJ3MgZGF0YS1ibG9jay1jYXRlZ29yeSBlbWlzc2lvbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYXRlZ29yeU9mKGJsb2NrOiBCbG9jayk6IEJsb2NrQ2F0ZWdvcnkge1xuICBjb25zdCBlbnRyeSA9IGJsb2NrUmVnaXN0cnlbYmxvY2sudHlwZV07XG4gIGlmIChlbnRyeS5jYXRlZ29yeSA9PT0gJ3F1ZXN0aW9uJyAmJiBlbnRyeS5udW1iZXJlZCA9PT0gJ3doZW5fZ3JhZGFibGUnKSB7XG4gICAgcmV0dXJuIGlzR3JhZGVhYmxlKGJsb2NrKSA/ICdxdWVzdGlvbicgOiAnY29udGVudCc7XG4gIH1cbiAgcmV0dXJuIGVudHJ5LmNhdGVnb3J5O1xufVxuXG4vKiogQ2Vuc3VzIGtleSBmb3IgYW4gaW5zdGFuY2UgKFAzQSk6IHRoZSBhbmFseXRpY3Mga2V5LCB3aXRoIHRoZSBpbnRlcmFjdGlvblxuICogdmFyaWFudCBhcHBlbmRlZCBmb3IgdGhlIGJsb2NrcyB0aGF0IGhhdmUgb25lIFx1MjAxNCBgZGF0YV9wbG90LmJ1aWxkX2hpc3RvZ3JhbWAuICovXG5leHBvcnQgZnVuY3Rpb24gY2Vuc3VzS2V5T2YoYmxvY2s6IEJsb2NrKTogc3RyaW5nIHtcbiAgY29uc3QgZW50cnkgPSBibG9ja1JlZ2lzdHJ5W2Jsb2NrLnR5cGVdO1xuICBpZiAoJ2ludGVyYWN0aW9uJyBpbiBibG9jayAmJiBlbnRyeS52YXJpYW50cykge1xuICAgIHJldHVybiBgJHtlbnRyeS5hbmFseXRpY3NLZXl9LiR7YmxvY2suaW50ZXJhY3Rpb24udHlwZX1gO1xuICB9XG4gIHJldHVybiBlbnRyeS5hbmFseXRpY3NLZXk7XG59XG5cbi8qKiBXaGV0aGVyIGFuIElOU1RBTkNFIGRyYXdzIGEgcHJvYmxlbSBudW1iZXIgKGRlbGVnYXRlcyB0byB0aGUgc2NoZW1hIHJ1bGVcbiAqIGVuZ2luZSBcdTIwMTQgcmUtZXhwb3J0ZWQgaGVyZSBzbyB2aWV3ZXIgY29kZSBoYXMgb25lIGltcG9ydCBzdXJmYWNlKS4gKi9cbmV4cG9ydCB7IGlzUGFnZU51bWJlcmVkIH07XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHByb21wdENhcnJpZXJzLnRzIFx1MjAxNCB0aGUgT05FIGxpc3Qgb2YgaW5saW5lIHR5cGVzIHdob3NlIGBwcm9tcHRzYCBjYXJyeSBrZXlzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBtYXRoIG5vZGUncyBgcHJvbXB0c2AgYXJyYXkgaG9sZHMgaW4tYmFuZCBhbnN3ZXIgbWF0ZXJpYWwsIHNvIGJvdGggdGhlXG4vLyBzYW5pdGl6ZXIncyBkZWVwIHN0cmlwIChsYXllciAzKSBhbmQgdGhlIGdyYWRpbmcgd2FsaydzIGtleSBjb2xsZWN0aW9uIG11c3Rcbi8vIGFncmVlIG9uIGV4YWN0bHkgd2hpY2ggbm9kZSB0eXBlcyBjYXJyeSBwcm9tcHRzLiBVbnRpbCAyMDI2LTA4LTA2IHRoaXMgU2V0XG4vLyB3YXMgZGVjbGFyZWQgdHdpY2Ugd2l0aCBpZGVudGljYWwgY29udGVudHMgKHNhbml0aXplLnRzIGFuZCBncmFkaW5nL3dhbGsudHNcbi8vIFx1MjAxNCBzNC1yZXRybyBmaW5kaW5nIDEwLCBmaXhlZCBieSBlbmctcmV2aWV3IEE3KTogdHdvIHNwZWxsaW5ncyBvZiBhIHNlY3VyaXR5LVxuLy8gcmVsZXZhbnQgcm9zdGVyLCBib25kZWQgYnkgbm90aGluZy4gQSB0eXBlIGFkZGVkIHRvIG9uZSBhbmQgbm90IHRoZSBvdGhlclxuLy8gd291bGQgZWl0aGVyIGxlYWsgYSBwcm9tcHQga2V5IHRvIHN0dWRlbnRzIChzYW5pdGl6ZSBzaWRlIG1pc3NpbmcpIG9yIGdyYWRlXG4vLyBhZ2FpbnN0IGEga2V5IHRoZSB3aXJlIG5ldmVyIGNhcnJpZWQgKHdhbGsgc2lkZSBtaXNzaW5nKSBcdTIwMTQgYm90aCBzaWxlbnQuXG4vL1xuLy8gVGhpcyBtb2R1bGUgaXMgYSBkZXBlbmRlbmN5LWZyZWUgbGVhZiBPTiBQVVJQT1NFOiBpdCBpcyBpbXBvcnRlZCBieSB0aGUgcmVhZFxuLy8gYnVuZGxlICh2aWEgc2FuaXRpemUudHMpIEFORCB0aGUgZ3JhZGluZyBidW5kbGUgKHZpYSB3YWxrLnRzKSwgc28gaXQgbXVzdFxuLy8gbmV2ZXIgZ3JvdyBhbiBpbXBvcnQgdGhhdCBlaXRoZXIgYnVuZGxlIGNhbid0IGFmZm9yZC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBJbmxpbmUgbm9kZSB0eXBlcyB3aG9zZSBgcHJvbXB0c2AgYXJyYXlzIGNhcnJ5IGluLWJhbmQgYW5zd2VyIGtleXMuICovXG5leHBvcnQgY29uc3QgUFJPTVBUX0NBUlJJRVJfVFlQRVM6IFJlYWRvbmx5U2V0PHN0cmluZz4gPSBuZXcgU2V0KFtcbiAgJ21hdGhfaW5saW5lJyxcbiAgJ21hdGhfYmxvY2snLFxuXSk7XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHNhbml0aXplL3Nhbml0aXplLnRzIFx1MjAxNCB0aGUgYW5zd2VyLWtleSBzYW5pdGl6ZXIgKFMyL1QzLCBydWxpbmcgVFY0LUEpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBHRU5FUklDIHN0cmlwIHRyYW5zZm9ybSBkcml2ZW4gZW50aXJlbHkgYnkgdGhlIHJlZ2lzdHJ5J3MgU2FuaXRpemVTcGVjXG4vLyBkZWNsYXJhdGlvbnMgXHUyMDE0IGl0IGhvbGRzIG5vIHBlci10eXBlIGtub3dsZWRnZSBvZiBpdHMgb3duIChydWxpbmcgUTFBOiB0aGVcbi8vIHJlZ2lzdHJ5IGRlY2xhcmVzLCB0cmFuc2Zvcm1zIG9iZXkpLiBSdW5zIHNlcnZlci1zaWRlIGluIHRoZSBnZXQtYWN0aXZpdHlcbi8vIEVkZ2UgRnVuY3Rpb24sIGNvbXBvc2VkIHdpdGggdXBncmFkZS1vbi1yZWFkOyB0aGUgb3V0cHV0IGlzIHdoYXQgdGhlIGR1cmFibGVcbi8vIHBlci12ZXJzaW9uIGNhY2hlIHN0b3JlcyBhbmQgdGhlIHZpZXdlciByZWNlaXZlcy4gQW5zd2VycyBORVZFUiByZWFjaCBhXG4vLyBzdHVkZW50IGNsaWVudCAocnVsaW5nIFEyQikgXHUyMDE0IHRoZSB3aXJlLWxldmVsIGxlYWsgdGVzdHMgaW5cbi8vIHRlc3RzL3Nhbml0aXplLnRlc3QudHMgYXNzZXJ0IHRoZSBvdXRjb21lLCBub3QgdGhlIG1lY2hhbmlzbS5cbi8vXG4vLyBUaHJlZSBsYXllcnMsIGluIG9yZGVyLCBwZXIgYmxvY2s6XG4vLyAgIDEuIERlY2xhcmVkIHN0cmlwcyBcdTIwMTQgdGhlIGVudHJ5J3MgYHN0cmlwYCBwYXRocywgaW4gdGhlIHRpbnkgZ3JhbW1hclxuLy8gICAgICB0eXBlcy50cyBkb2N1bWVudHMgKCdmaWVsZCcsICdmaWVsZFtdLnN1YicsICdpbnRlcmFjdGlvbi5maWVsZCcpLlxuLy8gICAyLiBDaGlsZCByZWN1cnNpb24gXHUyMDE0IGBjaGlsZEJsb2Nrc2AgZmllbGRzIHJlLWVudGVyIHRoZSBzYW5pdGl6ZXIsIHNvIGFcbi8vICAgICAgZmlsbF9pbl9ibGFuayBuZXN0ZWQgaW4gYSB3b3JrZWQgZXhhbXBsZSBpcyBzdHJpcHBlZCBieSBJVFMgT1dOIGVudHJ5LlxuLy8gICAzLiBJbi1iYW5kIGRlZXAgd2FsayBcdTIwMTQgQmxhbmtUb2tlbiBhbmQgTWF0aFByb21wdCBzZWNyZXRzIGFyZSBzdHJpcHBlZCBmcm9tXG4vLyAgICAgIGV2ZXJ5IG9iamVjdCB0aGUgYmxvY2sgY2FycmllcywgVU5DT05ESVRJT05BTExZIChub3QgZ2F0ZWQgb24gdGhlXG4vLyAgICAgIGVudHJ5J3MgYGlubGluZUJsYW5rU2VjcmV0c2AgZmxhZykuIERlZmVuc2UgaW4gZGVwdGg6IHRoZSBzY2hlbWEgYWRtaXRzXG4vLyAgICAgIGEgcHJvbXB0ZWQgbWF0aF9pbmxpbmUgaW5zaWRlIGFueSBjb250ZW50IGFycmF5IFx1MjAxNCBhIHBhcmFncmFwaCwgYSBoaW50LFxuLy8gICAgICBhIGxpc3QgaXRlbSBcdTIwMTQgYW5kIGEgZGVjbGFyYXRpb24gbWlzcyB0aGVyZSBtdXN0IG5vdCBiZWNvbWUgYSBzaWxlbnRcbi8vICAgICAgbGVhay4gVGhlIGZsYWcgc3RheXMgZGVjbGFyYXRpdmUgKHNlZSB0eXBlcy50cykuXG4vL1xuLy8gV2hhdCBzYW5pdGl6ZSBkb2VzIE5PVCBkbzogdGhlIHBlci1zdHVkZW50IGBzZXJ2ZVNodWZmbGVkYCByZW9yZGVyLiBUaGF0IGlzXG4vLyBzZXJ2ZS10aW1lIHdvcmsgKHNodWZmbGUudHMpIHByZWNpc2VseSBzbyBUSElTIG91dHB1dCBpcyBjYWNoZWFibGUgcGVyXG4vLyB2ZXJzaW9uIFx1MjAxNCB0aGUgb3JkZXIgc2VjcmV0IGNhbid0IGJlIGhhbmRsZWQgYnkgYSBzdHJpcCwgYW5kIHRoZSBzaHVmZmxlXG4vLyBjYW4ndCBiZSBoYW5kbGVkIGJ5IHRoZSBjYWNoZS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB0eXBlIHsgQWN0aXZpdHlEb2N1bWVudCwgQmxvY2sgfSBmcm9tICdAYWN0aXZpdHkvc2NoZW1hJztcbmltcG9ydCB7XG4gIEJMQU5LX1NFQ1JFVF9GSUVMRFMsXG4gIE1BVEhfUFJPTVBUX1NFQ1JFVF9GSUVMRFMsXG4gIGJsb2NrUmVnaXN0cnksXG4gIHJlZ2lzdGVyZWRCbG9ja1R5cGVzLFxufSBmcm9tICcuLi9yZWdpc3RyeS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgeyBQUk9NUFRfQ0FSUklFUl9UWVBFUyB9IGZyb20gJy4vcHJvbXB0Q2FycmllcnMuanMnO1xuaW1wb3J0IHR5cGUge1xuICBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50LFxuICBTYW5pdGl6ZWRCbG9jayxcbn0gZnJvbSAnLi9zYW5pdGl6ZWQtdHlwZXMuanMnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2FuaXRpemVyIHJldmlzaW9uIFx1MjAxNCB0aGUgZHVyYWJsZSBjYWNoZSdzIGludmFsaWRhdGlvbiBrZXlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgcmVhZCBjYWNoZSBzdG9yZXMgc2FuaXRpemVkIG91dHB1dCBwZXIgKHZlcnNpb25faWQsIFNBTklUSVpFUl9SRVYpLiBUaGVcbi8vIHJldiBpcyBDT01QVVRFRCBmcm9tIHRoZSByZWdpc3RyeSdzIHNhbml0aXplIGRlY2xhcmF0aW9ucyArIHRoZSBzZWNyZXQtZmllbGRcbi8vIGxpc3RzLCBzbyBjaGFuZ2luZyBhbnkgc3BlYyBhdXRvbWF0aWNhbGx5IG9ycGhhbnMgZXZlcnkgc3RhbGUgY2FjaGUgcm93IFx1MjAxNCBhXG4vLyBzYW5pdGl6ZXIgZml4IHRoYXQgcmVxdWlyZWQgYSBoYW5kLWJ1bXBlZCBjb25zdGFudCB0byB0YWtlIGVmZmVjdCBpcyBleGFjdGx5XG4vLyB0aGUgZm9yZ2V0dGFibGUtc3RlcCBjbGFzcyB0aGlzIHJlcG8gZG9jdW1lbnRzIChncmFwaC1raXQgbWFuaWZlc3QsIDAwMTUnc1xuLy8gZ3JhbnQgc3RhbnphcykuIEJ1bXAgU0FOSVRJWkVSX0FMR09fUkVWIGJ5IGhhbmQgT05MWSB3aGVuIHRoZSB0cmFuc2Zvcm1cbi8vIGxvZ2ljIGl0c2VsZiBjaGFuZ2VzIGluIGEgd2F5IHRoZSBkZWNsYXJhdGlvbnMgZG9uJ3QgY2FwdHVyZS5cblxuLy8gMSAtPiAyICgyMDI2LTA4LTIzKTogdGhlIHBlci1ibG9jayBzdHJpcHMgYmVnYW4gY292ZXJpbmcgYHJlZmVyZW5jZVBhbmVsYFxuLy8gYXMgd2VsbCBhcyB0aGUgYm9keS4gVGhpcyBpcyBFWEFDVExZIHRoZSBjYXNlIHRoZSBub3RlIGFib3ZlIHJlc2VydmVzIGEgaGFuZFxuLy8gYnVtcCBmb3IgXHUyMDE0IHRoZSB0cmFuc2Zvcm0gY2hhbmdlZCB3aGlsZSBldmVyeSBzYW5pdGl6ZSBERUNMQVJBVElPTiBzdGF5ZWRcbi8vIGlkZW50aWNhbCwgc28gdGhlIGNvbXB1dGVkIHJldiB3b3VsZCBub3QgaGF2ZSBtb3ZlZCBhbmQgZXZlcnkgY2FjaGVkIHJvd1xuLy8gd291bGQgaGF2ZSBrZXB0IHNlcnZpbmcgdGhlIGxlYWsgaXQgd2FzIHdyaXR0ZW4gd2l0aC5cbmV4cG9ydCBjb25zdCBTQU5JVElaRVJfQUxHT19SRVYgPSAyO1xuXG4vKiogRk5WLTFhIDMyLWJpdCwgaGV4LiBUaW55LCBkZXBlbmRlbmN5LWZyZWUsIHN0YWJsZSBhY3Jvc3MgSlMgcnVudGltZXMgXHUyMDE0XG4gKiB0aGlzIGlzIGEgY2FjaGUtYnVzdGluZyBmaW5nZXJwcmludCwgbm90IHNlY3VyaXR5IG1hdGVyaWFsLiAqL1xuZnVuY3Rpb24gZm52MWEodGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IGhhc2ggPSAweDgxMWM5ZGM1O1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRleHQubGVuZ3RoOyBpKyspIHtcbiAgICBoYXNoIF49IHRleHQuY2hhckNvZGVBdChpKTtcbiAgICBoYXNoID0gTWF0aC5pbXVsKGhhc2gsIDB4MDEwMDAxOTMpO1xuICB9XG4gIHJldHVybiAoaGFzaCA+Pj4gMCkudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDgsICcwJyk7XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVTYW5pdGl6ZXJSZXYoKTogc3RyaW5nIHtcbiAgY29uc3Qgc3BlY3MgPSBbLi4ucmVnaXN0ZXJlZEJsb2NrVHlwZXNdXG4gICAgLnNvcnQoKVxuICAgIC5tYXAoKHR5cGUpID0+IFt0eXBlLCBibG9ja1JlZ2lzdHJ5W3R5cGVdLnNhbml0aXplXSk7XG4gIGNvbnN0IG1hdGVyaWFsID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgIGFsZ286IFNBTklUSVpFUl9BTEdPX1JFVixcbiAgICBibGFuazogQkxBTktfU0VDUkVUX0ZJRUxEUyxcbiAgICBwcm9tcHQ6IE1BVEhfUFJPTVBUX1NFQ1JFVF9GSUVMRFMsXG4gICAgc3BlY3MsXG4gIH0pO1xuICByZXR1cm4gYCR7U0FOSVRJWkVSX0FMR09fUkVWfS0ke2ZudjFhKG1hdGVyaWFsKX1gO1xufVxuXG4vKiogVGhlIGNhY2hlIGtleSBjb21wb25lbnQuIFN0YWJsZSBmb3IgYSBnaXZlbiByZWdpc3RyeSArIGFsZ29yaXRobTsgY2hhbmdlc1xuICogd2hlbmV2ZXIgYW55IHNhbml0aXplIGRlY2xhcmF0aW9uIGNoYW5nZXMuICovXG5leHBvcnQgY29uc3QgU0FOSVRJWkVSX1JFViA9IGNvbXB1dGVTYW5pdGl6ZXJSZXYoKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzdHJpcCBncmFtbWFyIChleGFjdGx5IHdoYXQgdHlwZXMudHMgZG9jdW1lbnRzIFx1MjAxNCBub3RoaW5nIG1vcmUpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBhcHBseVN0cmlwUGF0aChibG9jazogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIHBhdGg6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBhcnJheUlkeCA9IHBhdGguaW5kZXhPZignW10uJyk7XG4gIGlmIChhcnJheUlkeCAhPT0gLTEpIHtcbiAgICAvLyAnZmllbGRbXS5zdWInIFx1MjAxNCBkZWxldGUgYHN1YmAgZnJvbSBldmVyeSBlbGVtZW50IG9mIGFycmF5IGBmaWVsZGAuXG4gICAgY29uc3QgZmllbGQgPSBwYXRoLnNsaWNlKDAsIGFycmF5SWR4KTtcbiAgICBjb25zdCBzdWIgPSBwYXRoLnNsaWNlKGFycmF5SWR4ICsgMyk7XG4gICAgY29uc3QgYXJyID0gYmxvY2tbZmllbGRdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgIGZvciAoY29uc3QgZWwgb2YgYXJyKSB7XG4gICAgICAgIGlmIChlbCAhPT0gbnVsbCAmJiB0eXBlb2YgZWwgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgZGVsZXRlIChlbCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilbc3ViXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgZG90SWR4ID0gcGF0aC5pbmRleE9mKCcuJyk7XG4gIGlmIChkb3RJZHggIT09IC0xKSB7XG4gICAgLy8gJ3BhcmVudC5maWVsZCcgXHUyMDE0IGRlbGV0ZSBgZmllbGRgIGZyb20gdGhlIG5lc3RlZCBvYmplY3Qgd2hlbiBwcmVzZW50LlxuICAgIC8vIFZhcmlhbnQtc2NvcGVkIGtleXMgc2ltcGx5IGRvbid0IG1hdGNoIG9uIG90aGVyIHZhcmlhbnRzLlxuICAgIGNvbnN0IHBhcmVudCA9IGJsb2NrW3BhdGguc2xpY2UoMCwgZG90SWR4KV07XG4gICAgaWYgKHBhcmVudCAhPT0gbnVsbCAmJiB0eXBlb2YgcGFyZW50ID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShwYXJlbnQpKSB7XG4gICAgICBkZWxldGUgKHBhcmVudCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilbcGF0aC5zbGljZShkb3RJZHggKyAxKV07XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuICAvLyAnZmllbGQnIFx1MjAxNCBkZWxldGUgdGhlIGJsb2NrJ3MgdG9wLWxldmVsIGZpZWxkLlxuICBkZWxldGUgYmxvY2tbcGF0aF07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBJbi1iYW5kIHNlY3JldHMgXHUyMDE0IHRoZSB1bmNvbmRpdGlvbmFsIGRlZXAgd2FsayAobGF5ZXIgMylcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQUk9NUFRfQ0FSUklFUl9UWVBFUyBpcyBzaW5nbGUtc291cmNlZCAocHJvbXB0Q2FycmllcnMudHMpIFx1MjAxNCB0aGUgZ3JhZGluZ1xuLy8gd2FsayBjb25zdW1lcyB0aGUgc2FtZSByb3N0ZXIsIGFuZCB0d28gZGVjbGFyYXRpb25zIGRyaWZ0ZWQtcmlzayBhIHNpbGVudFxuLy8gbGVhayBvciBhIHNpbGVudCBtaXMtZ3JhZGUgKEE3KS5cblxuZnVuY3Rpb24gc3RyaXBJbkJhbmRTZWNyZXRzKHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIGZvciAoY29uc3QgZWwgb2YgdmFsdWUpIHN0cmlwSW5CYW5kU2VjcmV0cyhlbCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSByZXR1cm47XG4gIGNvbnN0IG9iaiA9IHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIGlmIChvYmoudHlwZSA9PT0gJ2JsYW5rJykge1xuICAgIGZvciAoY29uc3QgZmllbGQgb2YgQkxBTktfU0VDUkVUX0ZJRUxEUykgZGVsZXRlIG9ialtmaWVsZF07XG4gIH1cbiAgaWYgKFxuICAgIHR5cGVvZiBvYmoudHlwZSA9PT0gJ3N0cmluZycgJiZcbiAgICBQUk9NUFRfQ0FSUklFUl9UWVBFUy5oYXMob2JqLnR5cGUpICYmXG4gICAgQXJyYXkuaXNBcnJheShvYmoucHJvbXB0cylcbiAgKSB7XG4gICAgZm9yIChjb25zdCBwcm9tcHQgb2Ygb2JqLnByb21wdHMpIHtcbiAgICAgIGlmIChwcm9tcHQgIT09IG51bGwgJiYgdHlwZW9mIHByb21wdCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yIChjb25zdCBmaWVsZCBvZiBNQVRIX1BST01QVF9TRUNSRVRfRklFTERTKSB7XG4gICAgICAgICAgZGVsZXRlIChwcm9tcHQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW2ZpZWxkXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvYmopKSBzdHJpcEluQmFuZFNlY3JldHMob2JqW2tleV0pO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUGVyLWJsb2NrIHNhbml0aXplXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogTXV0YXRpbmcgY29yZSBcdTIwMTQgb3BlcmF0ZXMgb24gYW4gYWxyZWFkeS1jbG9uZWQgYmxvY2suICovXG5cbi8vIC0tLS0gRGVyaXZlZCBxdWVzdGlvbiBzaGFwZSAodGhlIG9uZSBBRERJVElWRSBzdGVwKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc2FuaXRpemVyJ3Mgam9iIGlzIHJlbW92YWw7IHRoaXMgaXMgdGhlIHNpbmdsZSBleGNlcHRpb24sIGFuZCBpdCBpc1xuLy8gZmVuY2VkIGFjY29yZGluZ2x5LlxuLy9cbi8vIFdoeSBpdCBleGlzdHM6IHRoZSBncmFwaCB3aWRnZXRzIHRha2UgdGhlaXIgaGFuZGxlIGNvdW50IGFuZCBjdXJ2ZSBmYW1pbHlcbi8vIGZyb20gdGhlIGFuc3dlciBrZXkuIFRoZSB2aWV3ZXIgbmV2ZXIgcmVjZWl2ZXMgYSBrZXksIHNvIHdpdGhvdXQgdGhpcyBhXG4vLyBzZXJ2ZWQgZ3JhcGggcXVlc3Rpb24gY2Fubm90IGJlIGxhaWQgb3V0IFx1MjAxNCB0aGVyZSBpcyBubyB3YXkgdG8ga25vdyB3aGV0aGVyXG4vLyB0byBkcmF3IG9uZSBoYW5kbGUgb3IgdGhyZWUuXG4vL1xuLy8gV2h5IGl0IGlzIHNhZmU6IHdoYXQgbGVhdmVzIGhlcmUgaXMgcXVlc3Rpb24gU0hBUEUsIHdoaWNoIHRoZSBzdHVkZW50IGNhblxuLy8gYWxyZWFkeSBzZWUgKGhvdyBtYW55IGhhbmRsZXM7IHdoaWNoIGZhbWlseSdzIGN1cnZlIGZvbGxvd3MgdGhlaXIgZHJhZ3MpLFxuLy8gbmV2ZXIgdGhlIGNvb3JkaW5hdGVzLCB0b2xlcmFuY2VzLCBvciBjb2VmZmljaWVudHMgdGhhdCBtYWtlIGFuIGFuc3dlci4gVGhlXG4vLyBndWFyYW50ZWUgaXMgU1RSVUNUVVJBTCByYXRoZXIgdGhhbiBhIHByb21pc2UgYWJvdXQgdGhpcyBjb2RlOiBldmVyeSB2YWx1ZVxuLy8gcGFzc2VzIGEgd2hpdGVsaXN0IG9uIHRoZSB3YXkgb3V0IFx1MjAxNCBzbWFsbCBwb3NpdGl2ZSBpbnRlZ2Vycywgb3IgYSBmYW1pbHlcbi8vIG5hbWUgZnJvbSBhIGNsb3NlZCBzZXQgXHUyMDE0IHNvIGEgY29vcmRpbmF0ZSBjYW5ub3QgdHJhdmVsIHRoaXMgcGF0aCBldmVuIGlmIGFcbi8vIGZ1dHVyZSBlZGl0IHRyaWVkIHRvIHNlbmQgb25lLiBBbnl0aGluZyBmYWlsaW5nIHRoZSB3aGl0ZWxpc3QgaXMgZHJvcHBlZCxcbi8vIG5vdCBwYXNzZWQgdGhyb3VnaCAoZmFpbCBjbG9zZWQsIGxpa2UgdGhlIHVua25vd24tYmxvY2stdHlwZSB0aHJvdykuXG5cbi8qKiBVcHBlciBib3VuZCBvbiBhIGhhbmRsZSBjb3VudC4gRmFyIGFib3ZlIGFueSByZWFsIHF1ZXN0aW9uOyBleGlzdHMgc28gYVxuICogY29ycnVwdCBvciBob3N0aWxlIGxlbmd0aCBjYW4ndCBiZWNvbWUgYW4gYWJzdXJkIGFsbG9jYXRpb24gZG93bnN0cmVhbS4gKi9cbmNvbnN0IE1BWF9IQU5ETEVTID0gMjQ7XG5cbi8qKiBDdXJ2ZSBmYW1pbGllcyB0aGUgd2lkZ2V0IGxheXMgb3V0LiBDbG9zZWQgc2V0OiBhbiB1bnJlY29nbml6ZWQgZmFtaWx5IGlzXG4gKiBkcm9wcGVkIGFuZCB0aGUgd2lkZ2V0IGZhbGxzIGJhY2sgdG8gaXRzIG93biBkZWZhdWx0LiAqL1xuY29uc3QgS05PV05fRkFNSUxJRVM6IFJlYWRvbmx5U2V0PHN0cmluZz4gPSBuZXcgU2V0KFtcbiAgJ2xpbmVhcicsXG4gICdxdWFkcmF0aWMnLFxuICAnZXhwb25lbnRpYWwnLFxuICAnbG9nYXJpdGhtaWMnLFxuICAndmVydGljYWwnLFxuICAnYWJzb2x1dGUnLFxuICAnc3FydCcsXG4gICdjdWJpYycsXG4gICdxdWFydGljJyxcbl0pO1xuXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXN0aW9uU2hhcGUge1xuICBoYW5kbGVDb3VudD86IG51bWJlcjtcbiAgZmFtaWx5Pzogc3RyaW5nO1xuICB2ZXJ0ZXhDb3VudD86IG51bWJlcjtcbn1cblxuLyoqIEEgY291bnQgc3Vydml2ZXMgb25seSBhcyBhIHNtYWxsIHBvc2l0aXZlIGludGVnZXIuICovXG5mdW5jdGlvbiBzYWZlQ291bnQodmFsdWU6IHVua25vd24pOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJlxuICAgIE51bWJlci5pc0ludGVnZXIodmFsdWUpICYmXG4gICAgdmFsdWUgPiAwICYmXG4gICAgdmFsdWUgPD0gTUFYX0hBTkRMRVNcbiAgICA/IHZhbHVlXG4gICAgOiB1bmRlZmluZWQ7XG59XG5cbi8qKiBBIGZhbWlseSBzdXJ2aXZlcyBvbmx5IGlmIGl0IGlzIGEga25vd24gbmFtZS4gKi9cbmZ1bmN0aW9uIHNhZmVGYW1pbHkodmFsdWU6IHVua25vd24pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiBLTk9XTl9GQU1JTElFUy5oYXModmFsdWUpXG4gICAgPyB2YWx1ZVxuICAgIDogdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIERlcml2ZSB0aGUgc2VydmVkIHF1ZXN0aW9uIHNoYXBlIGZyb20gYW4gVU5TQU5JVElaRUQgYmxvY2sgKGl0IHJlYWRzIHRoZVxuICogYW5zd2VyIGtleSwgc28gaXQgbXVzdCBydW4gYmVmb3JlIHRoZSBzdHJpcHMpLiBSZXR1cm5zIHVuZGVmaW5lZCB3aGVuIHRoZXJlXG4gKiBpcyBub3RoaW5nIHRvIHNheSBcdTIwMTQgYSBkaXNwbGF5LW1vZGUgZ3JhcGggdGFrZXMgbm8gaW5wdXQgYW5kIGdldHMgbm8gc2hhcGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXJpdmVRdWVzdGlvblNoYXBlKFxuICBibG9jazogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4pOiBRdWVzdGlvblNoYXBlIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgaW50ZXJhY3Rpb24gPSBibG9jay5pbnRlcmFjdGlvbiBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcbiAgY29uc3Qga2luZCA9IHR5cGVvZiBpbnRlcmFjdGlvbj8udHlwZSA9PT0gJ3N0cmluZycgPyBpbnRlcmFjdGlvbi50eXBlIDogbnVsbDtcbiAgaWYgKCFraW5kIHx8IGtpbmQgPT09ICdkaXNwbGF5JykgcmV0dXJuIHVuZGVmaW5lZDtcblxuICBjb25zdCBzaGFwZTogUXVlc3Rpb25TaGFwZSA9IHt9O1xuXG4gIC8vIFBvaW50LXN0eWxlIGludGVyYWN0aW9uczogb25lIGhhbmRsZSBwZXIgYXV0aG9yZWQgdGFyZ2V0LiBUaGlzIG1pcnJvcnNcbiAgLy8gZXhhY3RseSB3aGF0IHRoZSBncmFkZWQgd2lkZ2V0IGFscmVhZHkgZG9lcyB3aXRoIHRoZSBrZXlcbiAgLy8gKGNvdW50ID0gY29ycmVjdFBvaW50cy5sZW5ndGgpLCBzbyBhIHN0dWRlbnQgc2VlcyB0aGUgc2FtZSB3aWRnZXQgZWl0aGVyXG4gIC8vIHdheSBcdTIwMTQgdGhlIG51bWJlciBvZiBoYW5kbGVzIGlzIG5vdCB0aGUgc2VjcmV0LCB0aGVpciBwb3NpdGlvbnMgYXJlLlxuICBjb25zdCBwb2ludHMgPSBpbnRlcmFjdGlvbj8uY29ycmVjdFBvaW50cztcbiAgaWYgKEFycmF5LmlzQXJyYXkocG9pbnRzKSkge1xuICAgIGNvbnN0IGNvdW50ID0gc2FmZUNvdW50KHBvaW50cy5sZW5ndGgpO1xuICAgIGlmIChjb3VudCAhPT0gdW5kZWZpbmVkKSBzaGFwZS5oYW5kbGVDb3VudCA9IGNvdW50O1xuICB9XG5cbiAgLy8gQ3VydmUgZmFtaWxpZXM6IHRoZSBzaGFwZSBvZiB0aGUgY3VydmUgdGhhdCBmb2xsb3dzIHRoZSBzdHVkZW50J3MgZHJhZ3MuXG4gIGNvbnN0IG1vZGVscyA9IGludGVyYWN0aW9uPy5tb2RlbHM7XG4gIGlmIChBcnJheS5pc0FycmF5KG1vZGVscykgJiYgbW9kZWxzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBmYW1pbHkgPSBzYWZlRmFtaWx5KFxuICAgICAgKG1vZGVsc1swXSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGwpPy5mYW1pbHksXG4gICAgKTtcbiAgICBpZiAoZmFtaWx5ICE9PSB1bmRlZmluZWQpIHNoYXBlLmZhbWlseSA9IGZhbWlseTtcbiAgfVxuXG4gIC8vIEFuIGluZXF1YWxpdHkncyBib3VuZGFyeSByaWRlcyB0aGUgc2FtZSBmYW1pbHkgbWFjaGluZXJ5LlxuICBjb25zdCBpbmVxdWFsaXRpZXMgPSBpbnRlcmFjdGlvbj8uaW5lcXVhbGl0aWVzO1xuICBpZiAoQXJyYXkuaXNBcnJheShpbmVxdWFsaXRpZXMpICYmIGluZXF1YWxpdGllcy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgYm91bmRhcnkgPSAoaW5lcXVhbGl0aWVzWzBdIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbClcbiAgICAgID8uYm91bmRhcnkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgZmFtaWx5ID0gc2FmZUZhbWlseShib3VuZGFyeT8uZmFtaWx5KTtcbiAgICBpZiAoZmFtaWx5ICE9PSB1bmRlZmluZWQpIHNoYXBlLmZhbWlseSA9IGZhbWlseTtcbiAgfVxuXG4gIC8vIFBvbHlnb24gdmVydGV4IGNvdW50IGZvciBzaGFkZV9yZWdpb24uXG4gIGNvbnN0IHJlZ2lvbnMgPSBpbnRlcmFjdGlvbj8ucmVnaW9ucztcbiAgaWYgKEFycmF5LmlzQXJyYXkocmVnaW9ucykgJiYgcmVnaW9ucy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgdmVydGljZXMgPSAocmVnaW9uc1swXSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGwpXG4gICAgICA/LmNvcnJlY3RWZXJ0aWNlcztcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2ZXJ0aWNlcykpIHtcbiAgICAgIGNvbnN0IGNvdW50ID0gc2FmZUNvdW50KHZlcnRpY2VzLmxlbmd0aCk7XG4gICAgICBpZiAoY291bnQgIT09IHVuZGVmaW5lZCkgc2hhcGUudmVydGV4Q291bnQgPSBjb3VudDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmtleXMoc2hhcGUpLmxlbmd0aCA+IDAgPyBzaGFwZSA6IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gc2FuaXRpemVCbG9ja011dChibG9jazogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkIHtcbiAgY29uc3QgdHlwZSA9IGJsb2NrLnR5cGU7XG4gIGNvbnN0IGVudHJ5ID1cbiAgICB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgJiYgdHlwZSBpbiBibG9ja1JlZ2lzdHJ5XG4gICAgICA/IGJsb2NrUmVnaXN0cnlbdHlwZSBhcyBrZXlvZiB0eXBlb2YgYmxvY2tSZWdpc3RyeV1cbiAgICAgIDogdW5kZWZpbmVkO1xuICBpZiAoIWVudHJ5KSB7XG4gICAgLy8gQSB2YWxpZGF0ZWQgQWN0aXZpdHlEb2N1bWVudCBjYW4ndCBnZXQgaGVyZSAodGhlIHJlZ2lzdHJ5IGNvdmVyYWdlIGd1YXJkXG4gICAgLy8gcHJvdmVzIGV4YWN0IGFncmVlbWVudCB3aXRoIHRoZSBCbG9jayB1bmlvbikgXHUyMDE0IGJ1dCB0aGUgc2FuaXRpemVyIHNpdHMgb25cbiAgICAvLyB0aGUgd2lyZSBib3VuZGFyeSwgc28gYW4gdW5rbm93biB0eXBlIGZhaWxzIENMT1NFRCwgbmV2ZXIgcGFzc2VzIHRocm91Z2guXG4gICAgdGhyb3cgbmV3IEVycm9yKGBzYW5pdGl6ZTogdW5rbm93biBibG9jayB0eXBlICR7U3RyaW5nKHR5cGUpfWApO1xuICB9XG5cbiAgLy8gRGVyaXZlZCBzaGFwZSBpcyBjb21wdXRlZCBCRUZPUkUgdGhlIHN0cmlwcyAoaXQgcmVhZHMgdGhlIGFuc3dlciBrZXkpIGFuZFxuICAvLyBhdHRhY2hlZCBhZnRlciwgc28gdGhlIHNlcnZlZCBibG9jayBjYXJyaWVzIG9ubHkgdGhlIHdoaXRlbGlzdGVkIHJlc3VsdC5cbiAgY29uc3Qgc2hhcGUgPSBlbnRyeS5zYW5pdGl6ZS5kZXJpdmVRdWVzdGlvblNoYXBlXG4gICAgPyBkZXJpdmVRdWVzdGlvblNoYXBlKGJsb2NrKVxuICAgIDogdW5kZWZpbmVkO1xuXG4gIGZvciAoY29uc3QgcGF0aCBvZiBlbnRyeS5zYW5pdGl6ZS5zdHJpcCkgYXBwbHlTdHJpcFBhdGgoYmxvY2ssIHBhdGgpO1xuXG4gIGlmIChzaGFwZSkgYmxvY2sucXVlc3Rpb25TaGFwZSA9IHNoYXBlO1xuXG4gIGZvciAoY29uc3QgZmllbGQgb2YgZW50cnkuc2FuaXRpemUuY2hpbGRCbG9ja3MgPz8gW10pIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IGJsb2NrW2ZpZWxkXTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbikpIHtcbiAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKGNoaWxkICE9PSBudWxsICYmIHR5cGVvZiBjaGlsZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBzYW5pdGl6ZUJsb2NrTXV0KGNoaWxkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0cmlwSW5CYW5kU2VjcmV0cyhibG9jayk7XG59XG5cbi8qKlxuICogU2FuaXRpemUgYSBsb29zZSBJTkxJTkUtQ09OVEVOVCBhcnJheSBwdWxsZWQgb3V0IG9mIHRoZSByYXcgZG9jdW1lbnQgKHB1cmUpLlxuICpcbiAqIFM0J3MgZ3JhZGluZyBSUEMgaXMgYSBzZWNvbmQgc2VydmVyXHUyMTkyY2xpZW50IGNoYW5uZWw6IGl0IHJldHVybnMgYXV0aG9yZWRcbiAqIGBmZWVkYmFja2AgYW5kIGBzb2x1dGlvbmAgY29udGVudCB0aGF0IHRoZSByZWFkIEFQSSBkZWxpYmVyYXRlbHkgc3RyaXBwZWQgYW5kXG4gKiB0aGUgc2VydmVyIHJlbGVhc2VzIG9ubHkgYWZ0ZXIgYSBjaGVjay4gVGhvc2UgYXJlIGBJbmxpbmVOb2RlW11gLCBhbmQgYW5cbiAqIGlubGluZSBhcnJheSBjYW4gY2FycnkgaW4tYmFuZCBzZWNyZXRzIFx1MjAxNCBhIHByb21wdGVkIGBtYXRoX2lubGluZWAgc2l0dGluZ1xuICogaW5zaWRlIGEgc29sdXRpb24gcGFyYWdyYXBoLCBvciBhIHBhc3RlZCBibGFuayB0b2tlbiBcdTIwMTQgc28gaXQgbXVzdCBnbyB0aHJvdWdoXG4gKiB0aGUgU0FNRSB1bmNvbmRpdGlvbmFsIGRlZXAgd2FsayB0aGUgc2VydmVkIGRvY3VtZW50IGRvZXMuIFdpdGhvdXQgdGhpcywgYW5cbiAqIGF1dGhvcmVkIHNvbHV0aW9uIGNvbnRhaW5pbmcgYSBibGFuayB3b3VsZCBoYW5kIGV2ZXJ5IGNoZWNraW5nIHN0dWRlbnQgdGhhdFxuICogYmxhbmsncyBhbnN3ZXJzLCBzaWxlbnRseS5cbiAqXG4gKiBSZXVzaW5nIGBzdHJpcEluQmFuZFNlY3JldHNgIHJhdGhlciB0aGFuIHJlaW1wbGVtZW50aW5nIGl0IGlzIHRoZSBwb2ludDogdGhlXG4gKiBzZWNyZXQtZmllbGQgbGlzdHMgbGl2ZSBpbiB0aGUgcmVnaXN0cnksIGFuZCBhIGZ1dHVyZSBhZGRpdGlvbiB0byB0aGVtIGhhcyB0b1xuICogcHJvdGVjdCBib3RoIGNoYW5uZWxzIGF1dG9tYXRpY2FsbHkgb3IgaXQgcHJvdGVjdHMgbmVpdGhlci5cbiAqXG4gKiBSZXR1cm5zIGEgY2xvbmU7IHRoZSBjYWxsZXIncyBhcnJheSBpcyBuZXZlciBtdXRhdGVkIChpdCBiZWxvbmdzIHRvIHRoZVxuICogY2FjaGVkIHJhdyBkb2N1bWVudCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUlubGluZUNvbnRlbnQ8VD4obm9kZXM6IFRbXSk6IFRbXSB7XG4gIGNvbnN0IGNsb25lID0gc3RydWN0dXJlZENsb25lKG5vZGVzKTtcbiAgc3RyaXBJbkJhbmRTZWNyZXRzKGNsb25lKTtcbiAgcmV0dXJuIGNsb25lO1xufVxuXG4vKiogU2FuaXRpemUgT05FIGJsb2NrIChwdXJlKS4gRXhwb3NlZCBmb3IgdGVzdHMgYW5kIHBlci1ibG9jayB0b29saW5nOyB0aGVcbiAqIGRvY3VtZW50LWxldmVsIGVudHJ5IHBvaW50IGJlbG93IGlzIHdoYXQgdGhlIHJlYWQgQVBJIHVzZXMuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVCbG9jayhibG9jazogQmxvY2spOiBTYW5pdGl6ZWRCbG9jayB7XG4gIGNvbnN0IGNsb25lID0gc3RydWN0dXJlZENsb25lKGJsb2NrKSBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBzYW5pdGl6ZUJsb2NrTXV0KGNsb25lKTtcbiAgcmV0dXJuIGNsb25lIGFzIHVua25vd24gYXMgU2FuaXRpemVkQmxvY2s7XG59XG5cbi8qKlxuICogU2FuaXRpemUgYSBmdWxsIHVwZ3JhZGVkIGRvY3VtZW50IChwdXJlKS4gRXZlcnkgYmxvY2sgdGhlIGRvY3VtZW50IHNoaXBzIFx1MjAxNFxuICogYm9keSBBTkQgcmVmZXJlbmNlIHBhbmVsIFx1MjAxNCBnb2VzIHRocm91Z2ggaXRzIHJlZ2lzdHJ5IGVudHJ5OyB0aGUgaW4tYmFuZCBkZWVwXG4gKiB3YWxrIHRoZW4gY292ZXJzIHdoYXRldmVyIGlzIGxlZnQgKG1ldGEsIGlubGluZSBub2RlcyBhbnl3aGVyZSkgYXMgZGVmZW5zZSBpblxuICogZGVwdGguXG4gKlxuICogXHUyNkEwIFRoZSByZWZlcmVuY2UgcGFuZWwgd2FzIE5PVCBpbiB0aGF0IHNldCB1bnRpbCAyMDI2LTA4LTIzLCBhbmQgdGhlIGNvbW1lbnRcbiAqIGhlcmUgYXNzZXJ0ZWQgdGhlIHJlYXNvbiBpdCBkaWQgbm90IG5lZWQgdG8gYmU6IFwidGhvc2Ugc3VyZmFjZXMgY2Fycnkgbm9cbiAqIGRlY2xhcmVkIGFuc3dlciBrZXlzXCIuIFRoYXQgd2FzIGZhbHNlLiBgUmVmZXJlbmNlUGFuZWwuYmxvY2tzYCBpc1xuICogYHouYXJyYXkoQmxvY2spYCBcdTIwMTQgdGhlIFNBTUUgZnVsbCB1bmlvbiBhcyBzZWN0aW9uIGNvbnRlbnQsIG11bHRpcGxlIGNob2ljZVxuICogYW5kIG1hdGNoaW5nIGluY2x1ZGVkIFx1MjAxNCBzbyBhIGtleS1iZWFyaW5nIGJsb2NrIGluIGEgcGFuZWwgcmVhY2hlZCB0aGUgc3R1ZGVudFxuICogd2l0aCBpdHMga2V5IGludGFjdCwgYmVjYXVzZSB0aGUgZGVlcCB3YWxrIGJlbG93IGtub3dzIG9ubHkgYWJvdXQgYmxhbmtzIGFuZFxuICogbWF0aCBwcm9tcHRzLiBUaGUgbGVhayBmaXh0dXJlIG5vdyBwbGFudHMgZXZlcnkgYmxvY2sgdHlwZSBpbiB0aGUgcGFuZWwgdG9vLFxuICogc28gdGhpcyBpcyBhIHdpcmUtc2Nhbm5lZCBwcm9wZXJ0eSByYXRoZXIgdGhhbiBhIGNsYWltIGluIGEgY29tbWVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplQWN0aXZpdHlEb2N1bWVudChcbiAgZG9jOiBBY3Rpdml0eURvY3VtZW50LFxuKTogU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCB7XG4gIGNvbnN0IGNsb25lID0gc3RydWN0dXJlZENsb25lKGRvYykgYXMgdW5rbm93biBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiAmIHtcbiAgICBzZWN0aW9uczogQXJyYXk8e1xuICAgICAgcm93czogQXJyYXk8eyBjb2x1bW5zOiBBcnJheTx7IGJsb2NrczogdW5rbm93bltdIH0+IH0+O1xuICAgIH0+O1xuICB9O1xuICBmb3IgKGNvbnN0IHNlY3Rpb24gb2YgY2xvbmUuc2VjdGlvbnMpIHtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiBzZWN0aW9uLnJvd3MpIHtcbiAgICAgIGZvciAoY29uc3QgY29sdW1uIG9mIHJvdy5jb2x1bW5zKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgY29sdW1uLmJsb2Nrcykge1xuICAgICAgICAgIGlmIChibG9jayAhPT0gbnVsbCAmJiB0eXBlb2YgYmxvY2sgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBzYW5pdGl6ZUJsb2NrTXV0KGJsb2NrIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gVGhlIHJlZmVyZW5jZSBwYW5lbCBzaGlwcyB0aGUgc2FtZSBCbG9jayB1bmlvbiB0aGUgYm9keSBkb2VzLCBzbyBpdCBnZXRzXG4gIC8vIHRoZSBzYW1lIHBlci1ibG9jayB0cmVhdG1lbnQuIFNjYWZmb2xkIGJ5IGludGVudCBpcyBub3Qgc2NhZmZvbGQgYnkgU0NIRU1BLlxuICBjb25zdCBwYW5lbCA9IGNsb25lLnJlZmVyZW5jZVBhbmVsO1xuICBpZiAocGFuZWwgIT09IG51bGwgJiYgdHlwZW9mIHBhbmVsID09PSAnb2JqZWN0Jykge1xuICAgIGNvbnN0IHBhbmVsQmxvY2tzID0gKHBhbmVsIGFzIHsgYmxvY2tzPzogdW5rbm93biB9KS5ibG9ja3M7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocGFuZWxCbG9ja3MpKSB7XG4gICAgICBmb3IgKGNvbnN0IGJsb2NrIG9mIHBhbmVsQmxvY2tzKSB7XG4gICAgICAgIGlmIChibG9jayAhPT0gbnVsbCAmJiB0eXBlb2YgYmxvY2sgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgc2FuaXRpemVCbG9ja011dChibG9jayBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gRXZlcnl0aGluZyBlbHNlIChtZXRhLCBhbmQgYW55IGlubGluZSBub2RlIGFueXdoZXJlKSBcdTIwMTQgaW4tYmFuZCBzZWNyZXRzLlxuICBzdHJpcEluQmFuZFNlY3JldHMoY2xvbmUpO1xuICByZXR1cm4gY2xvbmUgYXMgdW5rbm93biBhcyBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50O1xufVxuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBzYW5pdGl6ZS9zaHVmZmxlLnRzIFx1MjAxNCBzZXJ2ZS10aW1lIGRldGVybWluaXN0aWMgc2h1ZmZsZXMgKFMyLCBTYW5pdGl6ZVNwZWMpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHJlZ2lzdHJ5J3MgYHNlcnZlU2h1ZmZsZWRgIG1hcmtzIGFycmF5cyB3aG9zZSBBVVRIT1JFRCBPUkRFUiBpcyB0aGVcbi8vIGFuc3dlciBrZXkgKG9yZGVyaW5nLml0ZW1zKSBcdTIwMTQgYSBzdHJpcCBjYW4ndCBoZWxwIHdoZW4gdGhlIG9yZGVyIGl0c2VsZiBpc1xuLy8gdGhlIHNlY3JldCwgc28gdGhlIHNlcnZlciBzZXJ2ZXMgYSBwZXJtdXRhdGlvbi4gUmVxdWlyZW1lbnRzIGZyb20gdGhlIHNwZWM6XG4vL1xuLy8gICAtIERldGVybWluaXN0aWMgcGVyICh2ZXJzaW9uLCBzdHVkZW50KTogdGhlIHJlYWQgQVBJIHNlZWRzIHdpdGhcbi8vICAgICBgJHt2ZXJzaW9uX2lkfToke3VzZXJfaWR9YCwgc28gYSByZWxvYWQgKG9yIGFuIEhUVFAtY2FjaGUgbWlzcykgc2VydmVzXG4vLyAgICAgdGhlIFNBTUUgb3JkZXIgXHUyMDE0IHRoZSBzdHVkZW50J3Mgc2NyZWVuIG5ldmVyIHJlc2h1ZmZsZXMgdW5kZXIgdGhlbS5cbi8vICAgLSBBcHBsaWVkIGF0IFNFUlZFIHRpbWUsIGFmdGVyIHRoZSBwZXItdmVyc2lvbiBjYWNoZTogdGhlIGNhY2hlZCBhcnRpZmFjdFxuLy8gICAgIGlzIHN0dWRlbnQtaW5kZXBlbmRlbnQgKHRoYXQncyB3aGF0IG1ha2VzIGl0IGNhY2hlYWJsZSk7IHRoaXMgdHJhbnNmb3JtXG4vLyAgICAgaXMgY2hlYXAgZW5vdWdoIHRvIHJ1biBwZXIgcmVxdWVzdC5cbi8vICAgLSBQZXItYmxvY2sgc3ViLXNlZWRpbmc6IHR3byBvcmRlcmluZyBibG9ja3MgaW4gb25lIGFjdGl2aXR5IGdldFxuLy8gICAgIGluZGVwZW5kZW50IHBlcm11dGF0aW9ucyAoYmxvY2sgaWQgKyBmaWVsZCBqb2luIHRoZSBzZWVkKS5cbi8vXG4vLyBHcmFkaW5nIGlzIG9yZGVyLWluZGVwZW5kZW50IChyZXNwb25zZXMgcmVmZXJlbmNlIGl0ZW0gaWRzLCBhbmQgdGhlIHNlcnZlclxuLy8gZ3JhZGVzIGFnYWluc3QgdGhlIGF1dGhvcmVkIGtleSksIHNvIHRoZSBwZXJtdXRhdGlvbiBpcyBwcmVzZW50YXRpb24tb25seSBcdTIwMTRcbi8vIGJ1dCBpdHMgc3RhYmlsaXR5IGlzIGEgVVggY29udHJhY3QsIG5vdCBhIG5pY2V0eS5cbi8vXG4vLyBUaGUgUFJORyBpcyBhIHNlZWRlZCB4b3JzaGlmdC1zdHlsZSBnZW5lcmF0b3IgKG11bGJlcnJ5MzIpIG92ZXIgYW4gRk5WLTFhXG4vLyBzZWVkIFx1MjAxNCBkZXRlcm1pbmlzdGljIGFjcm9zcyBKUyBydW50aW1lcywgZGVwZW5kZW5jeS1mcmVlLiBOb3QgY3J5cHRvZ3JhcGhpYyxcbi8vIGRlbGliZXJhdGVseTogdGhlIHRocmVhdCBtb2RlbCBpcyBcImRvbid0IHNlcnZlIHRoZSBhdXRob3JlZCBvcmRlcixcIiBub3Rcbi8vIFwibWFrZSB0aGUgcGVybXV0YXRpb24gdW5wcmVkaWN0YWJsZSB0byBhIGRldGVybWluZWQgc3R1ZGVudCB3aXRoIGEgZGVidWdnZXJcIlxuLy8gKHRoZSBhbnN3ZXIga2V5IG5ldmVyIGxlYXZlcyB0aGUgc2VydmVyIGVpdGhlciB3YXkpLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgYmxvY2tSZWdpc3RyeSB9IGZyb20gJy4uL3JlZ2lzdHJ5L3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB0eXBlIHsgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCB9IGZyb20gJy4vc2FuaXRpemVkLXR5cGVzLmpzJztcblxuLyoqIEZOVi0xYSAzMi1iaXQgb3ZlciBhIHN0cmluZyBcdTIxOTIgdWludDMyIHNlZWQuICovXG5mdW5jdGlvbiBzZWVkRnJvbSh0ZXh0OiBzdHJpbmcpOiBudW1iZXIge1xuICBsZXQgaGFzaCA9IDB4ODExYzlkYzU7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdGV4dC5sZW5ndGg7IGkrKykge1xuICAgIGhhc2ggXj0gdGV4dC5jaGFyQ29kZUF0KGkpO1xuICAgIGhhc2ggPSBNYXRoLmltdWwoaGFzaCwgMHgwMTAwMDE5Myk7XG4gIH1cbiAgcmV0dXJuIGhhc2ggPj4+IDA7XG59XG5cbi8qKiBtdWxiZXJyeTMyIFx1MjAxNCB0aW55IGRldGVybWluaXN0aWMgUFJORywgdW5pZm9ybSBlbm91Z2ggZm9yIGEgc2h1ZmZsZS4gKi9cbmZ1bmN0aW9uIG11bGJlcnJ5MzIoc2VlZDogbnVtYmVyKTogKCkgPT4gbnVtYmVyIHtcbiAgbGV0IGEgPSBzZWVkID4+PiAwO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGEgPSAoYSArIDB4NmQyYjc5ZjUpID4+PiAwO1xuICAgIGxldCB0ID0gYTtcbiAgICB0ID0gTWF0aC5pbXVsKHQgXiAodCA+Pj4gMTUpLCB0IHwgMSk7XG4gICAgdCBePSB0ICsgTWF0aC5pbXVsKHQgXiAodCA+Pj4gNyksIHQgfCA2MSk7XG4gICAgcmV0dXJuICgodCBeICh0ID4+PiAxNCkpID4+PiAwKSAvIDQyOTQ5NjcyOTY7XG4gIH07XG59XG5cbi8qKlxuICogRmlzaGVyXHUyMDEzWWF0ZXMgd2l0aCBhIHNlZWRlZCBQUk5HIChwdXJlIFx1MjAxNCByZXR1cm5zIGEgbmV3IGFycmF5KS5cbiAqXG4gKiBORVZFUiBSRVRVUk5TIFRIRSBJREVOVElUWSBmb3IgMisgaXRlbXM7IGl0IHJvdGF0ZXMgYnkgb25lIGlmIHRoZSBkZWFsIGxhbmRzXG4gKiB0aGVyZS4gVGhpcyBpcyBub3QgdGlkaW5lc3MgXHUyMDE0IGl0IGlzIHRoZSB3aG9sZSBwb2ludCBvZiBzaHVmZmxpbmcgdGhlc2VcbiAqIGZpZWxkcy4gVGhlIGFycmF5cyB0aGF0IHJlYWNoIGhlcmUgYXJlIHRoZSBvbmVzIHdob3NlIEFVVEhPUkVEIE9SREVSIElTIFRIRVxuICogQU5TV0VSLCBzbyBhbiBpZGVudGl0eSBkZWFsIHNlcnZlcyB0aGUgc3R1ZGVudCBhIHByZS1zb2x2ZWQgcXVlc3Rpb24uIEEgZmFpclxuICogc2h1ZmZsZSBsYW5kcyBvbiBpdCAxL24hIG9mIHRoZSB0aW1lLCB3aGljaCBzb3VuZHMgbmVnbGlnaWJsZSB1bnRpbCB5b3VcbiAqIG5vdGljZSB0aGF0IG9yZGVyaW5nIGJsb2NrcyBhcmUgYWxsb3dlZCBhcyBmZXcgYXMgdHdvIGl0ZW1zIFx1MjAxNCBvbmUgY2xhc3MgaW5cbiAqIHR3bywgZm9yIHRoYXQgcXVlc3Rpb24uIFRoZSByZW5kZXJlciBoYXMgYWx3YXlzIGd1YXJhbnRlZWQgdGhpc1xuICogKHJlbmRlcmVyL3NyYy9ibG9ja3Mvc2h1ZmZsZS50cykgYW5kIHRoZSB2aWV3ZXIgbXVzdCBub3QgcmVncmVzcyBpdCBhdFxuICogY3V0b3Zlci5cbiAqXG4gKiBTNCdzIGdyYWRpbmcga2VlcHMgaXRzIG93biBkZWZlbnNpdmUgZ3VhcmQgZm9yIHRoZSBzZXJ2ZWQtb3JkZXItZXF1YWxzLVxuICogYXV0aG9yZWQtb3JkZXIgY2FzZSAoZ3JhZGluZy9jaG9pY2VzLnRzKSBhbmQgc2hvdWxkIGtlZXAgaXQ6IGl0IGFsc28gY292ZXJzXG4gKiBkb2N1bWVudHMgc2VydmVkIHVuc2h1ZmZsZWQsIHdoaWNoIHRoaXMgY2Fubm90IHNwZWFrIGZvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlZWRlZFNodWZmbGU8VD4oaXRlbXM6IHJlYWRvbmx5IFRbXSwgc2VlZEtleTogc3RyaW5nKTogVFtdIHtcbiAgY29uc3Qgb3V0ID0gWy4uLml0ZW1zXTtcbiAgY29uc3QgbmV4dCA9IG11bGJlcnJ5MzIoc2VlZEZyb20oc2VlZEtleSkpO1xuICBmb3IgKGxldCBpID0gb3V0Lmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICBjb25zdCBqID0gTWF0aC5mbG9vcihuZXh0KCkgKiAoaSArIDEpKTtcbiAgICBjb25zdCBhID0gb3V0W2ldITtcbiAgICBvdXRbaV0gPSBvdXRbal0hO1xuICAgIG91dFtqXSA9IGE7XG4gIH1cbiAgaWYgKG91dC5sZW5ndGggPiAxICYmIG91dC5ldmVyeSgodmFsdWUsIGkpID0+IHZhbHVlID09PSBpdGVtc1tpXSkpIHtcbiAgICBvdXQucHVzaChvdXQuc2hpZnQoKSBhcyBUKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFwcGx5IGV2ZXJ5IHJlZ2lzdHJ5LWRlY2xhcmVkIGBzZXJ2ZVNodWZmbGVkYCByZW9yZGVyIHRvIGEgU0FOSVRJWkVEXG4gKiBkb2N1bWVudCAocHVyZSBcdTIwMTQgdGhlIGlucHV0LCB0eXBpY2FsbHkgdGhlIHNoYXJlZCBjYWNoZWQgYXJ0aWZhY3QsIGlzIG5vdFxuICogbXV0YXRlZCkuIGBzZWVkS2V5YCBpcyB0aGUgcGVyLSh2ZXJzaW9uLCBzdHVkZW50KSBpZGVudGl0eTsgZWFjaCBzaHVmZmxlZFxuICogYXJyYXkgaXMgc3ViLXNlZWRlZCB3aXRoIHRoZSBibG9jayBpZCBhbmQgZmllbGQgbmFtZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5U2VydmVTaHVmZmxlcyhcbiAgZG9jOiBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50LFxuICBzZWVkS2V5OiBzdHJpbmcsXG4pOiBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50IHtcbiAgY29uc3QgY2xvbmUgPSBzdHJ1Y3R1cmVkQ2xvbmUoZG9jKSBhcyB1bmtub3duIGFzIHtcbiAgICBzZWN0aW9uczogQXJyYXk8e1xuICAgICAgcm93czogQXJyYXk8eyBjb2x1bW5zOiBBcnJheTx7IGJsb2NrczogdW5rbm93bltdIH0+IH0+O1xuICAgIH0+O1xuICB9O1xuXG4gIGNvbnN0IHNodWZmbGVCbG9jayA9IChibG9jazogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkID0+IHtcbiAgICBjb25zdCB0eXBlID0gYmxvY2sudHlwZTtcbiAgICBjb25zdCBlbnRyeSA9XG4gICAgICB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgJiYgdHlwZSBpbiBibG9ja1JlZ2lzdHJ5XG4gICAgICAgID8gYmxvY2tSZWdpc3RyeVt0eXBlIGFzIGtleW9mIHR5cGVvZiBibG9ja1JlZ2lzdHJ5XVxuICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICBpZiAoIWVudHJ5KSByZXR1cm47IC8vIHNhbml0aXplIGFscmVhZHkgZmFpbGVkIGNsb3NlZCBvbiB1bmtub3duIHR5cGVzXG4gICAgZm9yIChjb25zdCBmaWVsZCBvZiBlbnRyeS5zYW5pdGl6ZS5zZXJ2ZVNodWZmbGVkID8/IFtdKSB7XG4gICAgICBjb25zdCBhcnIgPSBibG9ja1tmaWVsZF07XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgICAgIGJsb2NrW2ZpZWxkXSA9IHNlZWRlZFNodWZmbGUoXG4gICAgICAgICAgYXJyLFxuICAgICAgICAgIGAke3NlZWRLZXl9OiR7U3RyaW5nKGJsb2NrLmlkID8/ICcnKX06JHtmaWVsZH1gLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBSZWN1cnNlIHdoZXJlIHRoZSByZWdpc3RyeSBkZWNsYXJlcyBuZXN0ZWQgYmxvY2tzLCBtaXJyb3Jpbmcgc2FuaXRpemUuXG4gICAgZm9yIChjb25zdCBmaWVsZCBvZiBlbnRyeS5zYW5pdGl6ZS5jaGlsZEJsb2NrcyA/PyBbXSkge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBibG9ja1tmaWVsZF07XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikge1xuICAgICAgICAgIGlmIChjaGlsZCAhPT0gbnVsbCAmJiB0eXBlb2YgY2hpbGQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBzaHVmZmxlQmxvY2soY2hpbGQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBmb3IgKGNvbnN0IHNlY3Rpb24gb2YgY2xvbmUuc2VjdGlvbnMpIHtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiBzZWN0aW9uLnJvd3MpIHtcbiAgICAgIGZvciAoY29uc3QgY29sdW1uIG9mIHJvdy5jb2x1bW5zKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgY29sdW1uLmJsb2Nrcykge1xuICAgICAgICAgIGlmIChibG9jayAhPT0gbnVsbCAmJiB0eXBlb2YgYmxvY2sgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBzaHVmZmxlQmxvY2soYmxvY2sgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gY2xvbmUgYXMgdW5rbm93biBhcyBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50O1xufVxuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBjb250YWluZXIvYmxvY2tJbmRleC50cyBcdTIwMTQgc2VydmVkIGRvY3VtZW50IFx1MjE5MiBwZXItc2VjdGlvbiByZXNwb25zZSBpZHMgKFMzIFY0KVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzdG9yZSBpcyBkZWxpYmVyYXRlbHkgZG9jdW1lbnQtc2hhcGUtYWdub3N0aWMgKHN0b3JlLnRzKTogaXQgaG9sZHNcbi8vIGlkLWtleWVkIHJlc3BvbnNlIG1hcHMgYW5kIGlzIFRPTEQgd2hpY2ggaWRzIGJlbG9uZyB0byBhIHNlY3Rpb24gYXQgY2hlY2tcbi8vIHRpbWUuIFRoaXMgbW9kdWxlIGlzIHdoYXQgdGVsbHMgaXQgXHUyMDE0IG9uZSB3YWxrIG92ZXIgdGhlIFNFUlZFRCAoc2FuaXRpemVkKVxuLy8gZG9jdW1lbnQgcHJvZHVjaW5nLCBwZXIgc2VjdGlvbiwgdGhlIGl0ZW0gaWRzIGluIGVhY2ggd2lyZSBjYXRlZ29yeS5cbi8vXG4vLyBUd28gZGVzaWduIHBvaW50cyB3b3J0aCBrZWVwaW5nOlxuLy9cbi8vICAxLiBJTi1CQU5EIElEUyBDT01FIEZST00gQSBERUVQIFdBTEssIG5vdCBhIHBlci10eXBlIGZpZWxkIGxpc3QuIEEgYmxhbmtcbi8vICAgICB0b2tlbiBsaXZlcyBpbiBmaWxsX2luX2JsYW5rLmNvbnRlbnQsIGJ1dCBhbHNvIGluc2lkZSBhXG4vLyAgICAgZmFkZWRfd29ya2VkX2V4YW1wbGUncyBuZXN0ZWQgc3RlcHM7IGEgcHJvbXB0ZWQgbWF0aF9pbmxpbmUgbWF5IGFwcGVhciBpblxuLy8gICAgIEFOWSBjb250ZW50IGFycmF5ICh0aGUgc2NoZW1hIGFkbWl0cyBpdCwgd2hpY2ggaXMgZXhhY3RseSB3aHkgdGhlIFMyXG4vLyAgICAgc2FuaXRpemVyIHN0cmlwcyBpbi1iYW5kIHNlY3JldHMgdW5jb25kaXRpb25hbGx5IHJhdGhlciB0aGFuIGJ5XG4vLyAgICAgZGVjbGFyYXRpb24pLiBNaXJyb3JpbmcgdGhhdCBwb3N0dXJlIGhlcmUgbWVhbnMgYSBuZXcgYmxvY2sgdHlwZSB0aGF0XG4vLyAgICAgZW1iZWRzIGJsYW5rcyBpcyB3aXJlZCBpbnRvIGNoZWNraW5nIHRoZSBkYXkgaXQgcmVuZGVycywgd2l0aCBubyByZWdpc3RyeVxuLy8gICAgIGVkaXQgXHUyMDE0IHRoZSBmYWlsdXJlIG1vZGUgdGhpcyBhdm9pZHMgaXMgYSBzdHVkZW50J3MgYW5zd2VyIHNpbGVudGx5IG5ldmVyXG4vLyAgICAgcmVhY2hpbmcgdGhlIGdyYWRlci5cbi8vXG4vLyAgMi4gVU5TVVBQT1JURUQgSVMgUkVDT1JERUQsIE5FVkVSIERST1BQRUQuIFdpcmUgdjIgKFY5KSBnYXZlIHRoZSBncmFwaFxuLy8gICAgIGZhbWlseSBpdHMgYGdyYXBoc2AgY2F0ZWdvcnksIHNvIGB1bnN1cHBvcnRlZGAgaXMgZW1wdHkgdG9kYXkgXHUyMDE0IGJ1dCB0aGVcbi8vICAgICBtZWNoYW5pc20gc3RheXMuIEl0IGlzIHRoZSBob25lc3QgYW5zd2VyIHdoZW5ldmVyIGEgZ3JhZGFibGUgYmxvY2sgaGFzXG4vLyAgICAgbm8gd2F5IHRvIHJlYWNoIHRoZSBncmFkZXIgKGEgZnV0dXJlIGJsb2NrIHR5cGUgYWhlYWQgb2YgaXRzIHdpcmVcbi8vICAgICBidW1wKS4gQSBzaWxlbnQgb21pc3Npb24gd291bGQgcmVhZCBhcyBcImFsbCBjaGVja2VkXCIgd2hpbGUgYSBzdHVkZW50J3Ncbi8vICAgICB3b3JrIHdlbnQgdW5ncmFkZWQsIHdoaWNoIGlzIHRoZSBmYWlsdXJlIHRoaXMgZXhpc3RzIHRvIHByZXZlbnQuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyBmYW1pbHlPZiB9IGZyb20gJy4uL3JlZ2lzdHJ5L3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB0eXBlIHsgQmxvY2tUeXBlIH0gZnJvbSAnLi4vcmVnaXN0cnkvdHlwZXMuanMnO1xuaW1wb3J0IHR5cGUge1xuICBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50LFxuICBTYW5pdGl6ZWRCbG9jayxcbn0gZnJvbSAnLi4vc2FuaXRpemUvc2FuaXRpemVkLXR5cGVzLmpzJztcbmltcG9ydCB0eXBlIHsgU2VjdGlvbkl0ZW1JZHMgfSBmcm9tICcuLi9zdG9yZS9zdG9yZS5qcyc7XG5cbi8qKiBCbG9jayB0eXBlcyB3aG9zZSByZXNwb25zZXMgaGF2ZSBubyB3aXJlLXYxIGNhdGVnb3J5IChzZWUgZGVzaWduIHBvaW50IDIpLiAqL1xuY29uc3QgR1JBUEhfRkFNSUxZOiBSZWFkb25seVNldDxzdHJpbmc+ID0gbmV3IFNldChbXG4gICdpbnRlcmFjdGl2ZV9ncmFwaCcsXG4gICdudW1iZXJfbGluZScsXG4gICdkYXRhX3Bsb3QnLFxuXSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VjdGlvbkluZGV4IHtcbiAgc2VjdGlvbklkOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUaGUgYXV0aG9yZWQgYHtjaGVja3BvaW50fWAgbWFya2VyLCBjYXJyaWVkIHRocm91Z2ggZnJvbSB0aGUgc2VydmVkXG4gICAqIHNlY3Rpb24gc28gdGhlIGNoZWNrLWdyb3VwIGZvbGQgKGNoZWNrR3JvdXBzLnRzKSBuZXZlciBuZWVkcyBhIHNlY29uZCB3YWxrXG4gICAqIG9mIHRoZSBkb2N1bWVudCB0byBhbnN3ZXIgXCJkb2VzIGNoZWNraW5nIHN0b3AgaGVyZT9cIiAoNUEpLlxuICAgKi9cbiAgaXNDaGVja3BvaW50OiBib29sZWFuO1xuICAvKiogSWRzIHRvIHNlbmQgd2hlbiBjaGVja2luZyB0aGlzIHNlY3Rpb24uICovXG4gIGl0ZW1zOiBTZWN0aW9uSXRlbUlkcztcbiAgLyoqIEJsb2NrIGlkcyBwcmVzZW50IGluIHRoaXMgc2VjdGlvbiwgZG9jdW1lbnQgb3JkZXIgKGNvbnRhaW5lcnMgaW5jbHVkZWQpLiAqL1xuICBibG9ja0lkczogc3RyaW5nW107XG4gIC8qKiBHcmFkYWJsZSBibG9jayBpZHMgdGhpcyB3aXJlIHZlcnNpb24gY2Fubm90IGNhcnJ5IFx1MjAxNCBzdXJmYWNlZCwgbm90IGhpZGRlbi4gKi9cbiAgdW5zdXBwb3J0ZWQ6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERvY3VtZW50SW5kZXgge1xuICBzZWN0aW9uczogU2VjdGlvbkluZGV4W107XG4gIGJ5U2VjdGlvbjogUmVjb3JkPHN0cmluZywgU2VjdGlvbkluZGV4PjtcbiAgLyoqIEV2ZXJ5IGdyYWRhYmxlLWJ1dC11bmNhcnJ5YWJsZSBibG9jayBpZCBhY3Jvc3MgdGhlIGRvY3VtZW50LiAqL1xuICB1bnN1cHBvcnRlZDogc3RyaW5nW107XG59XG5cbi8qKiBEZWVwLXdhbGsgYW55IHZhbHVlIGZvciBpbi1iYW5kIHJlc3BvbnNlIGlkczogYmxhbmsgdG9rZW5zIGFuZCBtYXRoLWdhcFxuICogcHJvbXB0cywgd2hlcmV2ZXIgdGhleSBzaXQuIERvZXMgTk9UIGRlc2NlbmQgaW50byBuZXN0ZWQgQmxvY2sgYXJyYXlzIFx1MjAxNFxuICogY2hpbGQgYmxvY2tzIGFyZSB2aXNpdGVkIGJ5IHRoZSBjYWxsZXIgc28gdGhlaXIgb3duIGlkcyBhdHRyaWJ1dGUgdG8gdGhlbS4gKi9cbmZ1bmN0aW9uIGNvbGxlY3RJbkJhbmRJZHMoXG4gIHZhbHVlOiB1bmtub3duLFxuICBvdXQ6IHN0cmluZ1tdLFxuICBpc0NoaWxkQmxvY2tBcnJheTogKHZhbHVlOiB1bmtub3duKSA9PiBib29sZWFuLFxuKTogdm9pZCB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIGlmIChpc0NoaWxkQmxvY2tBcnJheSh2YWx1ZSkpIHJldHVybjtcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdmFsdWUpIGNvbGxlY3RJbkJhbmRJZHMoaXRlbSwgb3V0LCBpc0NoaWxkQmxvY2tBcnJheSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnIHx8IHZhbHVlID09PSBudWxsKSByZXR1cm47XG5cbiAgY29uc3Qgbm9kZSA9IHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBpZiAobm9kZS50eXBlID09PSAnYmxhbmsnICYmIHR5cGVvZiBub2RlLmlkID09PSAnc3RyaW5nJykge1xuICAgIG91dC5wdXNoKG5vZGUuaWQpO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBBIE1hdGhQcm9tcHQgY2FycmllcjogYGxhdGV4YCArIGBwcm9tcHRzYC4gTWF0Y2hlZCBTVFJVQ1RVUkFMTFkgcmF0aGVyXG4gIC8vIHRoYW4gYnkgbm9kZSB0eXBlIGJlY2F1c2UgdGhlIHNhbWUgY2FycmllciBzaGFwZSBpcyBib3RoIGFuIGlubGluZVxuICAvLyBtYXRoX2lubGluZSBub2RlIGFuZCBhIHRvcC1sZXZlbCBtYXRoX2Jsb2NrIFx1MjAxNCBhbmQgdGhlIHNjaGVtYSBhZG1pdHMgaXQgaW5cbiAgLy8gZWl0aGVyIHBvc2l0aW9uICh0aGUgcmVhc29uIHRoZSBTMiBzYW5pdGl6ZXIgd2Fsa3MgdW5jb25kaXRpb25hbGx5IHRvbykuXG4gIGlmICh0eXBlb2Ygbm9kZS5sYXRleCA9PT0gJ3N0cmluZycgJiYgQXJyYXkuaXNBcnJheShub2RlLnByb21wdHMpKSB7XG4gICAgZm9yIChjb25zdCBwcm9tcHQgb2Ygbm9kZS5wcm9tcHRzKSB7XG4gICAgICBjb25zdCBpZCA9IChwcm9tcHQgYXMgeyBpZD86IHVua25vd24gfSB8IG51bGwpPy5pZDtcbiAgICAgIGlmICh0eXBlb2YgaWQgPT09ICdzdHJpbmcnKSBvdXQucHVzaChpZCk7XG4gICAgfVxuICAgIC8vIEtlZXAgd2Fsa2luZyBzaWJsaW5nczogYSBtYXRoX2Jsb2NrIGFsc28gY2FycmllcyBjb250ZW50IGZpZWxkcy5cbiAgfVxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIE9iamVjdC52YWx1ZXMobm9kZSkpIHtcbiAgICBjb2xsZWN0SW5CYW5kSWRzKGNoaWxkLCBvdXQsIGlzQ2hpbGRCbG9ja0FycmF5KTtcbiAgfVxufVxuXG4vKiogQSB2YWx1ZSBpcyBhIGNoaWxkLWJsb2NrIGFycmF5IGlmIGl0IGxvb2tzIGxpa2UgQmxvY2tbXSAob2JqZWN0cyBjYXJyeWluZyBhXG4gKiBgdHlwZWAgdGhlIHJlZ2lzdHJ5IGtub3dzIEFORCBhbiBgaWRgKS4gU3RydWN0dXJhbCByYXRoZXIgdGhhblxuICogcmVnaXN0cnktZGVjbGFyZWQgc28gYSBjb250YWluZXIgdGhhdCBmb3JnZXRzIGl0cyBjaGlsZEJsb2NrcyBkZWNsYXJhdGlvblxuICogc3RpbGwgY2FuJ3QgZ2V0IGl0cyBjaGlsZHJlbidzIGlkcyBtaXMtYXR0cmlidXRlZC5cbiAqXG4gKiBFeHBvcnRlZCBiZWNhdXNlIHRoZSBhbnN3ZXIta2V5IGV4dHJhY3Rpb24sIHRoZSBjZW5zdXMsIEFORCB0aGUgZ3JhZGluZ1xuICogd2FsayAoc2luY2UgQTI0LCAyMDI2LTA4LTA2IFx1MjAxNCBpdCBjYXJyaWVkIGEgcHJpdmF0ZSBjb3B5IGZvciBhIHNsaWNlXG4gKiBnZW5lcmF0aW9uKSBhbGwgYW5zd2VyIHRoZSBzYW1lIHF1ZXN0aW9uIChcImlzIHRoaXMgYSBuZXN0ZWQgYmxvY2ssIG9yXG4gKiBjb250ZW50IG9mIHRoaXMgb25lP1wiKS4gVHdvIGNvcGllcyBvZiBhIHN1YnRsZSBoZXVyaXN0aWMgZHJpZnQ7IHRoaXMgb25lXG4gKiBpcyBUSEUgc291cmNlLCB3aXRoIHplcm8gY29waWVzIHJlbWFpbmluZy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb29rc0xpa2VCbG9ja0FycmF5KHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiZcbiAgICB2YWx1ZS5sZW5ndGggPiAwICYmXG4gICAgdmFsdWUuZXZlcnkoXG4gICAgICAoaXRlbSkgPT5cbiAgICAgICAgdHlwZW9mIGl0ZW0gPT09ICdvYmplY3QnICYmXG4gICAgICAgIGl0ZW0gIT09IG51bGwgJiZcbiAgICAgICAgdHlwZW9mIChpdGVtIGFzIHsgaWQ/OiB1bmtub3duIH0pLmlkID09PSAnc3RyaW5nJyAmJlxuICAgICAgICB0eXBlb2YgKGl0ZW0gYXMgeyB0eXBlPzogdW5rbm93biB9KS50eXBlID09PSAnc3RyaW5nJyxcbiAgICApICYmXG4gICAgLy8gSW5saW5lIG5vZGVzIGNhcnJ5IGB0eXBlYCBidXQgbmV2ZXIgYGlkYCArIGJsb2NrLWlzaCBzaGFwZSB0b2dldGhlcjtcbiAgICAvLyByZXF1aXJlIGF0IGxlYXN0IG9uZSBrbm93biBjb250YWluZXItaXNoIGtleSB0byBhdm9pZCBmYWxzZSBwb3NpdGl2ZXMuXG4gICAgdmFsdWUuZXZlcnkoKGl0ZW0pID0+IHtcbiAgICAgIGNvbnN0IHQgPSAoaXRlbSBhcyB7IHR5cGU6IHN0cmluZyB9KS50eXBlO1xuICAgICAgcmV0dXJuIHQgIT09ICd0ZXh0JyAmJiB0ICE9PSAnYmxhbmsnICYmIHQgIT09ICdtYXRoX2lubGluZScgJiYgdCAhPT0gJ2hhcmRfYnJlYWsnO1xuICAgIH0pXG4gICk7XG59XG5cbi8qKiBOZXN0ZWQgYmxvY2tzLCBmb3VuZCBzdHJ1Y3R1cmFsbHkgKHNlZSBsb29rc0xpa2VCbG9ja0FycmF5KS4gR2VuZXJpYyBvdmVyIHRoZVxuICogYmxvY2sgc2hhcGUgc28gdGhlIHNlcnZlZC1kb2N1bWVudCB3YWxrIGhlcmUgYW5kIHRoZSBhdXRob3JlZC1kb2N1bWVudCB3YWxrIGluXG4gKiB0aGUgYW5zd2VyLWtleSBleHRyYWN0aW9uIHNoYXJlIE9ORSBkZWZpbml0aW9uIG9mIFwiY2hpbGQgYmxvY2tcIi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGlsZEJsb2Nrc09mPFQgZXh0ZW5kcyBvYmplY3Q+KGJsb2NrOiBUKTogVFtdIHtcbiAgY29uc3Qgb3V0OiBUW10gPSBbXTtcbiAgZm9yIChjb25zdCB2YWx1ZSBvZiBPYmplY3QudmFsdWVzKGJsb2NrIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KSkge1xuICAgIGlmIChsb29rc0xpa2VCbG9ja0FycmF5KHZhbHVlKSkgb3V0LnB1c2goLi4uKHZhbHVlIGFzIFRbXSkpO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIHZpc2l0KGJsb2NrOiBTYW5pdGl6ZWRCbG9jaywgaW5kZXg6IFNlY3Rpb25JbmRleCk6IHZvaWQge1xuICBjb25zdCB0eXBlID0gKGJsb2NrIGFzIHsgdHlwZTogc3RyaW5nIH0pLnR5cGUgYXMgQmxvY2tUeXBlO1xuICBjb25zdCBpZCA9IChibG9jayBhcyB7IGlkOiBzdHJpbmcgfSkuaWQ7XG4gIGluZGV4LmJsb2NrSWRzLnB1c2goaWQpO1xuXG4gIC8vIEluLWJhbmQgaWRzIChibGFua3MgKyBtYXRoIGdhcHMpIGJlbG9uZyB0byBUSElTIGJsb2NrLCBhdCBhbnkgZGVwdGhcbiAgLy8gc2hvcnQgb2YgYSBuZXN0ZWQgYmxvY2suXG4gIGNvbnN0IGluQmFuZDogc3RyaW5nW10gPSBbXTtcbiAgY29sbGVjdEluQmFuZElkcyhibG9jaywgaW5CYW5kLCBsb29rc0xpa2VCbG9ja0FycmF5KTtcbiAgaWYgKGluQmFuZC5sZW5ndGggPiAwKSB7XG4gICAgaW5kZXguaXRlbXMuYmxhbmtzID0gWy4uLihpbmRleC5pdGVtcy5ibGFua3MgPz8gW10pLCAuLi5pbkJhbmRdO1xuICB9XG5cbiAgLy8gUGVyLWJsb2NrLWlkIGNhdGVnb3JpZXMuIGZhbWlseU9mIHJlc29sdmVzIGRpc3BsYXktbW9kZSBpbnN0YW5jZXMgdG9cbiAgLy8gJ3N0YXRpYycsIHNvIGEgZGlzcGxheSBncmFwaCBjb250cmlidXRlcyBub3RoaW5nIFx1MjAxNCBjb3JyZWN0LCBpdCB0YWtlcyBub1xuICAvLyBpbnB1dC5cbiAgY29uc3QgZmFtaWx5ID0gZmFtaWx5T2YoYmxvY2sgYXMgbmV2ZXIpO1xuICBpZiAoZmFtaWx5ICE9PSAnc3RhdGljJykge1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnbXVsdGlwbGVfY2hvaWNlJzpcbiAgICAgICAgaW5kZXguaXRlbXMuY2hvaWNlcyA9IFsuLi4oaW5kZXguaXRlbXMuY2hvaWNlcyA/PyBbXSksIGlkXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtYXRjaGluZyc6XG4gICAgICAgIGluZGV4Lml0ZW1zLm1hdGNoZXMgPSBbLi4uKGluZGV4Lml0ZW1zLm1hdGNoZXMgPz8gW10pLCBpZF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb3JkZXJpbmcnOlxuICAgICAgICBpbmRleC5pdGVtcy5vcmRlcmluZ3MgPSBbLi4uKGluZGV4Lml0ZW1zLm9yZGVyaW5ncyA/PyBbXSksIGlkXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzZWxmX2V4cGxhbmF0aW9uJzpcbiAgICAgIGNhc2UgJ3Nob3J0X2Fuc3dlcic6XG4gICAgICBjYXNlICdlc3NheSc6XG4gICAgICAgIGluZGV4Lml0ZW1zLmZyZWVUZXh0ID0gWy4uLihpbmRleC5pdGVtcy5mcmVlVGV4dCA/PyBbXSksIGlkXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBXaXJlIHYyIGNhcnJpZXMgZ2VvbWV0cmljIHdvcmsgZm9yIHRoZSB3aG9sZSBncmFwaCBmYW1pbHk7IHRoZVxuICAgICAgICAvLyBzZXJ2ZXIgZGlzcGF0Y2hlcyBvbiB0aGUgc2VydmVkIGludGVyYWN0aW9uIHR5cGUuXG4gICAgICAgIGlmIChHUkFQSF9GQU1JTFkuaGFzKHR5cGUpKSB7XG4gICAgICAgICAgaW5kZXguaXRlbXMuZ3JhcGhzID0gWy4uLihpbmRleC5pdGVtcy5ncmFwaHMgPz8gW10pLCBpZF07XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZEJsb2Nrc09mKGJsb2NrKSkgdmlzaXQoY2hpbGQsIGluZGV4KTtcbn1cblxuLyoqIEluZGV4IGEgc2VydmVkIGRvY3VtZW50OiBwZXItc2VjdGlvbiBjaGVjayBwYXlsb2FkIGlkcyArIHRoZSB1bnN1cHBvcnRlZFxuICogcm9zdGVyLiBQdXJlOyBzYWZlIHRvIHJlY29tcHV0ZSBvbiBldmVyeSByZW5kZXIgKHRoZSBkb2N1bWVudCBpcyBpbW11dGFibGVcbiAqIHBlciB2ZXJzaW9uKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmRleERvY3VtZW50KGRvYzogU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCk6IERvY3VtZW50SW5kZXgge1xuICBjb25zdCBzZWN0aW9uczogU2VjdGlvbkluZGV4W10gPSBbXTtcbiAgZm9yIChjb25zdCBzZWN0aW9uIG9mIGRvYy5zZWN0aW9ucykge1xuICAgIGNvbnN0IGluZGV4OiBTZWN0aW9uSW5kZXggPSB7XG4gICAgICBzZWN0aW9uSWQ6IHNlY3Rpb24uaWQsXG4gICAgICBpc0NoZWNrcG9pbnQ6IHNlY3Rpb24uaXNDaGVja3BvaW50ID09PSB0cnVlLFxuICAgICAgaXRlbXM6IHt9LFxuICAgICAgYmxvY2tJZHM6IFtdLFxuICAgICAgdW5zdXBwb3J0ZWQ6IFtdLFxuICAgIH07XG4gICAgZm9yIChjb25zdCByb3cgb2Ygc2VjdGlvbi5yb3dzKSB7XG4gICAgICBmb3IgKGNvbnN0IGNvbHVtbiBvZiByb3cuY29sdW1ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGJsb2NrIG9mIGNvbHVtbi5ibG9ja3MpIHZpc2l0KGJsb2NrLCBpbmRleCk7XG4gICAgICB9XG4gICAgfVxuICAgIHNlY3Rpb25zLnB1c2goaW5kZXgpO1xuICB9XG4gIHJldHVybiB7XG4gICAgc2VjdGlvbnMsXG4gICAgYnlTZWN0aW9uOiBPYmplY3QuZnJvbUVudHJpZXMoc2VjdGlvbnMubWFwKChzKSA9PiBbcy5zZWN0aW9uSWQsIHNdKSksXG4gICAgdW5zdXBwb3J0ZWQ6IHNlY3Rpb25zLmZsYXRNYXAoKHMpID0+IHMudW5zdXBwb3J0ZWQpLFxuICB9O1xufVxuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBncmFkaW5nL3dhbGsudHMgXHUyMDE0IHJhdyBkb2N1bWVudCBcdTIxOTIgdGhlIGdyYWRhYmxlIGludmVudG9yeSBvZiBvbmUgc2VjdGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzZXJ2ZXIncyBjb3VudGVycGFydCB0byB0aGUgdmlld2VyJ3MgY29udGFpbmVyL2Jsb2NrSW5kZXgudHMuIFNhbWUgd2Fsayxcbi8vIG9wcG9zaXRlIHNpZGUgb2YgdGhlIHdpcmU6IGJsb2NrSW5kZXggdGVsbHMgdGhlIENMSUVOVCB3aGljaCBpZHMgdG8gc2VuZCxcbi8vIHRoaXMgdGVsbHMgdGhlIFNFUlZFUiB3aGF0IGVhY2ggb2YgdGhvc2UgaWRzIGlzIHdvcnRoLiBUaGV5IG11c3QgYWdyZWUsIGFuZFxuLy8gdGhlIGdvbGRlbiBjb3JwdXMgcGx1cyB0aGUgY29uZm9ybWFuY2Ugc3VpdGUgYXJlIHdoYXQgaG9sZCB0aGVtIHRvZ2V0aGVyLlxuLy9cbi8vIFR3byBwcm9wZXJ0aWVzIGluaGVyaXRlZCBkZWxpYmVyYXRlbHkgZnJvbSBibG9ja0luZGV4OlxuLy9cbi8vICAxLiBJTi1CQU5EIElEUyBDT01FIEZST00gQSBERUVQIFdBTEssIG5vdCBhIHBlci10eXBlIGZpZWxkIGxpc3QuIEEgYmxhbmtcbi8vICAgICBsaXZlcyBpbiBmaWxsX2luX2JsYW5rLmNvbnRlbnQsIGJ1dCBhbHNvIGluc2lkZSBhIGZhZGVkX3dvcmtlZF9leGFtcGxlJ3Ncbi8vICAgICBuZXN0ZWQgc3RlcHMsIGFuZCBhIHByb21wdGVkIG1hdGhfaW5saW5lIG1heSBhcHBlYXIgaW4gQU5ZIGNvbnRlbnQgYXJyYXkuXG4vLyAgICAgV2Fsa2luZyB1bmNvbmRpdGlvbmFsbHkgbWVhbnMgYSBuZXcgYmxvY2sgdHlwZSB0aGF0IGVtYmVkcyBibGFua3MgaXNcbi8vICAgICBncmFkYWJsZSB0aGUgZGF5IGl0IHJlbmRlcnMsIHdpdGggbm8gcmVnaXN0cnkgZWRpdC4gVGhlIGZhaWx1cmUgdGhpc1xuLy8gICAgIGF2b2lkcyBpcyB0aGUgd29yc3Qga2luZDogYSBzdHVkZW50IGFuc3dlciB0aGF0IGlzIHN1Ym1pdHRlZCwgc3RvcmVkLCBhbmRcbi8vICAgICBuZXZlciBzY29yZWQuXG4vL1xuLy8gIDIuIENPTlRBSU5FUlMgQVRUUklCVVRFIFRPIFRIRSBDSElMRC4gQSBibGFuayBpbnNpZGUgYSBmYWRlZCBleGFtcGxlIGJlbG9uZ3Ncbi8vICAgICB0byB0aGF0IGV4YW1wbGUncyBzdGVwLCBub3QgdG8gdGhlIGNvbnRhaW5lciwgc28gaWRzIGxpbmUgdXAgd2l0aCB3aGF0XG4vLyAgICAgdGhlIGNsaWVudCBzZW50LlxuLy9cbi8vIFRoaXMgd2FsayByZWFkcyB0aGUgUkFXIGRvY3VtZW50LiBUaGF0IGlzIHdoYXQgbWFrZXMgYG9yZGVyaW5nYCBncmFkYWJsZSBhdFxuLy8gYWxsIChpdHMgYXV0aG9yZWQgaXRlbSBvcmRlciBJUyB0aGUga2V5KSBhbmQgd2hhdCBnaXZlcyB0aGUgZ3JhZGVyIHRoZSBhbnN3ZXJcbi8vIGtleXMsIGhpbnRzLCBhbmQgc29sdXRpb25zIHRoZSBzZXJ2ZWQgZG9jdW1lbnQgaGFkIHN0cmlwcGVkLlxuLy9cbi8vIE1BTEZPUk1FRC1ET0NVTUVOVCBQT1NUVVJFIChydWxlZCBCOC9EMTAsIDIwMjYtMDgtMDY7IGxhbmRlZCByZWQtZ3JlZW4pOlxuLy8gdGhlIHdhbGsgY2FycmllcyBhbiBJTlRFR1JJVFkgR0FURS4gVGhlIHJ1bGUgdGhhdCBkZWNpZGVzIGV2ZXJ5IGNoZWNrIGJlbG93OlxuLy8gYSBncmFkZXItcmVhZCBmaWVsZCB0aGF0IGlzIFBSRVNFTlQgd2l0aCBhIHNoYXBlIHRoZSBzY2hlbWEgY2Fubm90IGF1dGhvciBpc1xuLy8gc3RydWN0dXJhbGx5IGJyb2tlbiBcdTIxOTIgTWFsZm9ybWVkRG9jdW1lbnRFcnJvciAodGhlIGhhbmRsZXIgbWFwcyBpdCB0byB0aGVcbi8vIHdpcmUgY29kZSBgbWFsZm9ybWVkX2RvY3VtZW50YCwgdGhlIGNsaWVudCB0byBpdHMgb3duIG5vbi1yZXRyeWFibGUgY29weSkuXG4vLyBBIGZpZWxkIHRoYXQgaXMgQUJTRU5ULCBvciBhdXRob3JlZCBlbXB0eSwgZ3JhZGVzIGV4YWN0bHkgYXMgaXQgYWx3YXlzIGhhcyBcdTIwMTRcbi8vIGF1dGhvcmVkLWVtcHR5IGlzIGEgdGVhY2hlciBtaWQtZWRpdCwgbm90IGNvcnJ1cHRpb24sIGFuZCByZWZ1c2luZyBpdCB3b3VsZFxuLy8gYnJlYWsgbGVnaXRpbWF0ZSBkb2N1bWVudHMuIEJlZm9yZSB0aGUgZ2F0ZSwgZXZlcnkgZmllbGQgd2FzIHNpbGVudGx5XG4vLyBuYXJyb3dlZCwgc28gYSBicm9rZW4gYmxvY2sgcHJvZHVjZWQgYSBNQVJLIChncmFkZWQgYWdhaW5zdCBhIGNvZXJjZWQtZW1wdHlcbi8vIGtleSkgXHUyMDE0IGEgY29uZmlkZW50IHdyb25nIHZlcmRpY3Qgbm9ib2R5IGNvdWxkIHNlZSAoczQtYXVkaXQgbWlzc2VkLTkpO1xuLy8gc2VydmVyLWF1dGhvcml0YXRpdmUgZ3JhZGluZyBtYWtlcyB0aGF0IHdvcnNlIHRoYW4gYSB0eXBlZCBmYWlsdXJlLlxuLy9cbi8vIFR3byBkZWxpYmVyYXRlIHNjb3BlIGVkZ2VzOlxuLy8gICAqIFRoZSBncmFwaCBmYW1pbHkgaXMgTk9UIGdhdGVkIGhlcmUuIHNjb3JlR3JhcGhCbG9jayBkaXNwYXRjaGVzIG9uIHRoZVxuLy8gICAgIHNlcnZlZCBpbnRlcmFjdGlvbiBhbmQgUkVGVVNFUyB3b3JrIHRoYXQgZGlzYWdyZWVzIChudWxsIFx1MjE5MiBubyBtYXJrKSBcdTIwMTRcbi8vICAgICBpdCBhbHJlYWR5IGZhaWxzIHNhZmUgcmF0aGVyIHRoYW4gY29lcmNpbmcsIHdoaWNoIGlzIHRoZSBwcm9wZXJ0eSB0aGVcbi8vICAgICBnYXRlIGV4aXN0cyB0byBhZGQgZWxzZXdoZXJlLlxuLy8gICAqIE9uIHRvZGF5J3MgaGFuZGxlciBwYXRoIHRoZSB1cGdyYWRlIHN0ZXAncyBab2QgdmFsaWRhdGlvbiBtZWFucyBub1xuLy8gICAgIFNUT1JBQkxFIGRvY3VtZW50IHJlYWNoZXMgdGhpcyB3YWxrIGJyb2tlbiBcdTIwMTQgdGhlIGdhdGUgaXMgdGhlIGVuZ2luZSdzXG4vLyAgICAgb3duIGNvbnRyYWN0IChkZWZlbnNlIGluIGRlcHRoIGJlaGluZCB0aGUgaGFuZGxlcidzIGBhcyBuZXZlcmAgY2FzdCksXG4vLyAgICAgc28gc2FmZXR5IHN0b3BzIGRlcGVuZGluZyBvbiBldmVyeSBjYWxsZXIgdmFsaWRhdGluZyBmaXJzdC4gUzcncyByZWFsXG4vLyAgICAgbWFsZm9ybWVkIGNhc2UgKHNjaGVtYVZlcnNpb24tMSBkb2N1bWVudHMpIGlzIHJlZnVzZWQgdXBzdHJlYW0gYnkgdGhlXG4vLyAgICAgdXBncmFkZSBwYXRoIGl0c2VsZi5cbi8vXG4vLyBUaGUgY2Vuc3VzIChyZWFkIHBhdGgpIG9wdHMgT1VUIHZpYSBgeyBpbnRlZ3JpdHk6ICdjb2VyY2UnIH1gIFx1MjAxNCBhIGNlbnN1c2VkXG4vLyBtYWxmb3JtZWQgZG9jdW1lbnQgbWVyZWx5IG1pc2NvdW50cywgYW5kIHRoZSByZWFkIHBhdGgncyBydWxlZCBwb3N0dXJlIGlzXG4vLyB3aXRoaG9sZC1hbmQtc2VydmUsIG5vdCBmYWlsLiBHcmFkaW5nIGFsd2F5cyBydW5zIHRoZSBnYXRlLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHtcbiAgY2hpbGRCbG9ja3NPZixcbiAgbG9va3NMaWtlQmxvY2tBcnJheSxcbn0gZnJvbSAnLi4vLi4vY29udGFpbmVyL2Jsb2NrSW5kZXguanMnO1xuaW1wb3J0IHsgUFJPTVBUX0NBUlJJRVJfVFlQRVMgfSBmcm9tICcuLi8uLi9zYW5pdGl6ZS9wcm9tcHRDYXJyaWVycy5qcyc7XG5pbXBvcnQgdHlwZSB7IEJsYW5rS2V5IH0gZnJvbSAnLi9ibGFua3MuanMnO1xuaW1wb3J0IHR5cGUgeyBSYXdHcmFwaEJsb2NrIH0gZnJvbSAnLi9ncmFwaHMuanMnO1xuXG4vKiogTG9vc2VseS10eXBlZCByYXcgYmxvY2s6IHRoZSBzZXJ2ZXIgZGlzcGF0Y2hlcyBvbiBgdHlwZWAgc3RyaW5ncyBhbmQgcmVhZHNcbiAqIGZpZWxkcyB0aGUgc2FuaXRpemVkIHR5cGVzIGRlbGliZXJhdGVseSBkb24ndCBhZG1pdC4gKi9cbmV4cG9ydCB0eXBlIFJhd0Jsb2NrID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj4gJiB7IGlkPzogc3RyaW5nOyB0eXBlPzogc3RyaW5nIH07XG5cbi8qKiBTdHJ1Y3R1cmFsbHkgYnJva2VuIGRvY3VtZW50IChlbmctcmV2aWV3IEI4L0QxMCk6IGEgZ3JhZGVyLXJlYWQgZmllbGQgd2FzXG4gKiBwcmVzZW50IHdpdGggYSBzaGFwZSB0aGUgc2NoZW1hIGNhbm5vdCBhdXRob3IuIFRocm93biBpbnN0ZWFkIG9mIGdyYWRpbmcsXG4gKiBiZWNhdXNlIGEgc2lsZW50bHkgd3JvbmcgbWFyayBpcyB3b3JzZSB0aGFuIGEgdHlwZWQgZmFpbHVyZS4gVGhlIGhhbmRsZXJcbiAqIG1hcHMgdGhpcyB0byB0aGUgd2lyZSBjb2RlIGBtYWxmb3JtZWRfZG9jdW1lbnRgLiAqL1xuZXhwb3J0IGNsYXNzIE1hbGZvcm1lZERvY3VtZW50RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIHJlYWRvbmx5IHByb2JsZW1zOiBzdHJpbmdbXTtcbiAgY29uc3RydWN0b3IocHJvYmxlbXM6IHN0cmluZ1tdKSB7XG4gICAgc3VwZXIoYFN0cnVjdHVyYWxseSBicm9rZW4gZG9jdW1lbnQ6ICR7cHJvYmxlbXMuam9pbignOyAnKX1gKTtcbiAgICB0aGlzLm5hbWUgPSAnTWFsZm9ybWVkRG9jdW1lbnRFcnJvcic7XG4gICAgdGhpcy5wcm9ibGVtcyA9IHByb2JsZW1zO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgR3JhZGFibGVJbnZlbnRvcnkge1xuICAvKiogQmxhbmsgKyBtYXRoLWdhcCBrZXlzLCBpbiBkb2N1bWVudCBvcmRlciwgZ3JvdXBlZCBwZXIgb3duaW5nIGJsb2NrIHNvXG4gICAqIGludGVyY2hhbmdlYWJsZSBydW5zIGNhbiBiZSByZXNvbHZlZCB3aXRoaW4gdGhlaXIgYmxvY2suICovXG4gIGJsYW5rR3JvdXBzQnlCbG9jazogQXJyYXk8eyBibG9ja0lkOiBzdHJpbmc7IGtleXM6IEJsYW5rS2V5W10gfT47XG4gIG11bHRpcGxlQ2hvaWNlOiBBcnJheTx7XG4gICAgYmxvY2tJZDogc3RyaW5nO1xuICAgIGNvcnJlY3RJZHM6IHN0cmluZ1tdO1xuICAgIGNob2ljZXM6IEFycmF5PHtcbiAgICAgIGlkOiBzdHJpbmc7XG4gICAgICBjb3JyZWN0PzogYm9vbGVhbjtcbiAgICAgIGZlZWRiYWNrPzogdW5rbm93bltdO1xuICAgICAgbWlzY29uY2VwdGlvbklkPzogc3RyaW5nO1xuICAgIH0+O1xuICB9PjtcbiAgbWF0Y2hpbmc6IEFycmF5PHtcbiAgICBibG9ja0lkOiBzdHJpbmc7XG4gICAga2V5OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICAgIGl0ZW1JZHM6IHN0cmluZ1tdO1xuICB9PjtcbiAgb3JkZXJpbmc6IEFycmF5PHsgYmxvY2tJZDogc3RyaW5nOyBhdXRob3JlZE9yZGVyOiBzdHJpbmdbXSB9PjtcbiAgZ3JhcGhzOiBBcnJheTx7IGJsb2NrSWQ6IHN0cmluZzsgYmxvY2s6IFJhd0dyYXBoQmxvY2sgfT47XG4gIC8qKiBFdmVyeSBmcmVlLXRleHQgYmxvY2sgaW4gdGhlIHNlY3Rpb24gXHUyMDE0IHJlY29yZGVkLCBuZXZlciBqdWRnZWQuICovXG4gIGZyZWVUZXh0OiBzdHJpbmdbXTtcbiAgLyoqIGJsb2NrSWQgXHUyMTkyIGF1dGhvcmVkIHNvbHV0aW9uIGNvbnRlbnQsIGZvciBFVkVSWSBibG9jayBpbiB0aGUgc2VjdGlvbiB0aGF0XG4gICAqIGhhcyBvbmUuIEluY2x1ZGVzIFNUQVRJQyBibG9ja3MgKGEgYHByb2JsZW1gJ3Mgd29ya2VkIGV4cGxhbmF0aW9uKSwgd2hpY2hcbiAgICogaXMgdGhlIHdob2xlIHJlYXNvbiB0aGlzIGlzIGNvbGxlY3RlZCBieSB3YWxraW5nIGJsb2NrcyByYXRoZXIgdGhhbiBieVxuICAgKiB3YWxraW5nIHRoZSBibG9ja3MgdGhhdCBwcm9kdWNlZCByZXNwb25zZXMuICovXG4gIHNvbHV0aW9uczogQXJyYXk8eyBibG9ja0lkOiBzdHJpbmc7IHNvbHV0aW9uOiB1bmtub3duW10gfT47XG59XG5cbi8vIEV4cG9ydGVkIGZvciB0aGUgcm9zdGVyLWJvbmQgdGVzdCBPTkxZIChyb3N0ZXJCb25kcy50ZXN0LnRzKSBcdTIwMTQgdGhlc2UgdHdvXG4vLyBTZXRzIHJlc3RhdGUgcmVnaXN0cnkgZmFjdHMgKGZhbWlseSAncmVjb3JkZWQnOyBkZXJpdmVRdWVzdGlvblNoYXBlKSB0aGF0XG4vLyB0aGlzIG1vZHVsZSBkZWxpYmVyYXRlbHkgZG9lcyBub3QgaW1wb3J0IHRoZSByZWdpc3RyeSB0byBkZXJpdmUsIGFuZCBhXG4vLyBoYW5kLWxpc3QgdGhhdCByZXN0YXRlcyBhIHJlZ2lzdHJ5IGZhY3QgaXMgYSBjbGFpbSB0aGF0IG5lZWRzIGEgZ3VhcmQgKEE3LFxuLy8gcG9saWN5IFAxMGIpLiBQcm9kdWN0aW9uIGNvZGUgbXVzdCBrZWVwIGNvbnN1bWluZyB0aGVtIGZyb20gaGVyZS5cbmV4cG9ydCBjb25zdCBGUkVFX1RFWFRfVFlQRVMgPSBuZXcgU2V0KFtcbiAgJ3NlbGZfZXhwbGFuYXRpb24nLFxuICAnc2hvcnRfYW5zd2VyJyxcbiAgJ2Vzc2F5Jyxcbl0pO1xuZXhwb3J0IGNvbnN0IEdSQVBIX1RZUEVTID0gbmV3IFNldChbXG4gICdpbnRlcmFjdGl2ZV9ncmFwaCcsXG4gICdudW1iZXJfbGluZScsXG4gICdkYXRhX3Bsb3QnLFxuXSk7XG5cbi8qKiBQcm9qZWN0IGEgcmF3IEJsYW5rVG9rZW4gb250byB0aGUgZ3JhZGluZyBrZXkgc2hhcGUuICovXG5mdW5jdGlvbiBibGFua1Rva2VuVG9LZXkobm9kZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBCbGFua0tleSB7XG4gIGNvbnN0IGFuc3dlciA9IHR5cGVvZiBub2RlLmFuc3dlciA9PT0gJ3N0cmluZycgPyBub2RlLmFuc3dlciA6ICcnO1xuICBjb25zdCBhY2NlcHRhYmxlID0gQXJyYXkuaXNBcnJheShub2RlLmFjY2VwdGFibGVBbnN3ZXJzKVxuICAgID8gKG5vZGUuYWNjZXB0YWJsZUFuc3dlcnMgYXMgdW5rbm93bltdKS5maWx0ZXIoXG4gICAgICAgIChhKTogYSBpcyBzdHJpbmcgPT4gdHlwZW9mIGEgPT09ICdzdHJpbmcnLFxuICAgICAgKVxuICAgIDogW107XG4gIGNvbnN0IGFuc3dlclR5cGUgPSBub2RlLmFuc3dlclR5cGU7XG4gIHJldHVybiB7XG4gICAgaWQ6IFN0cmluZyhub2RlLmlkID8/ICcnKSxcbiAgICAvLyBgYW5zd2VyYCBmaXJzdCwgdGhlbiB0aGUgYWx0ZXJuYXRlcyBcdTIwMTQgb25lIGxpc3QsIG1hdGNoaW5nIGhvdyB0aGVcbiAgICAvLyByZW5kZXJlciBqb2lucyB0aGVtIGludG8gZGF0YS1ibGFuay1hbnN3ZXJzLlxuICAgIGFuc3dlcnM6IFthbnN3ZXIsIC4uLmFjY2VwdGFibGVdLFxuICAgIGFuc3dlclR5cGU6XG4gICAgICBhbnN3ZXJUeXBlID09PSAnbnVtZXJpYycgfHwgYW5zd2VyVHlwZSA9PT0gJ21hdGgnID8gYW5zd2VyVHlwZSA6ICd0ZXh0JyxcbiAgICB0b2xlcmFuY2U6IHR5cGVvZiBub2RlLnRvbGVyYW5jZSA9PT0gJ251bWJlcicgPyBub2RlLnRvbGVyYW5jZSA6IDAsXG4gICAgZXF1aXZhbGVuY2U6IG5vZGUuZXF1aXZhbGVuY2UgPT09ICdleGFjdC1mb3JtJyA/ICdleGFjdC1mb3JtJyA6ICd2YWx1ZScsXG4gICAgbWlzdGFrZUZlZWRiYWNrOiBBcnJheS5pc0FycmF5KG5vZGUubWlzdGFrZUZlZWRiYWNrKVxuICAgICAgPyAobm9kZS5taXN0YWtlRmVlZGJhY2sgYXMgQXJyYXk8e1xuICAgICAgICAgIG1hdGNoOiBzdHJpbmc7XG4gICAgICAgICAgZmVlZGJhY2s6IHVua25vd25bXTtcbiAgICAgICAgICBtaXNjb25jZXB0aW9uSWQ/OiBzdHJpbmc7XG4gICAgICAgIH0+KVxuICAgICAgOiBbXSxcbiAgICBoaW50OiBBcnJheS5pc0FycmF5KG5vZGUuaGludCkgPyAobm9kZS5oaW50IGFzIHVua25vd25bXSkgOiB1bmRlZmluZWQsXG4gICAgaW50ZXJjaGFuZ2VhYmxlV2l0aFByZXZpb3VzOiBub2RlLmludGVyY2hhbmdlYWJsZVdpdGhQcmV2aW91cyA9PT0gdHJ1ZSxcbiAgICAvLyBVbml0LWJlYXJpbmcgbnVtZXJpYyBibGFua3M6IHRoZSByZXF1aXJlZCB1bml0ICsgYWNjZXB0ZWQgYWx0ZXJuYXRlcy5cbiAgICAuLi4odHlwZW9mIG5vZGUudW5pdCA9PT0gJ3N0cmluZycgJiYgbm9kZS51bml0Lmxlbmd0aCA+IDBcbiAgICAgID8ge1xuICAgICAgICAgIHVuaXQ6IG5vZGUudW5pdCxcbiAgICAgICAgICAuLi4oQXJyYXkuaXNBcnJheShub2RlLmFjY2VwdGFibGVVbml0cylcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIGFjY2VwdGFibGVVbml0czogKG5vZGUuYWNjZXB0YWJsZVVuaXRzIGFzIHVua25vd25bXSkuZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgKHUpOiB1IGlzIHN0cmluZyA9PiB0eXBlb2YgdSA9PT0gJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiB7fSksXG4gICAgICAgIH1cbiAgICAgIDoge30pLFxuICB9O1xufVxuXG4vKiogUHJvamVjdCBhIHJhdyBNYXRoUHJvbXB0IG9udG8gdGhlIHNhbWUgc2hhcGUuIEEgZ2FwIGlzIEFMV0FZUyBncmFkZWQgYXMgYVxuICogbWF0aCBleHByZXNzaW9uIGFuZCBuZXZlciBjYXJyaWVzIGhpbnQvbWlzdGFrZUZlZWRiYWNrIFx1MjAxNCBhbmQgaXRzIGlkIGlzIG5vdCBhXG4gKiB1dWlkLCBidXQgaXQga2V5cyBpbnRvIHRoZSBzYW1lIGBibGFua3NgIHJlc3BvbnNlIG1hcC4gKi9cbmZ1bmN0aW9uIG1hdGhQcm9tcHRUb0tleShub2RlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IEJsYW5rS2V5IHtcbiAgY29uc3QgYW5zd2VyID0gdHlwZW9mIG5vZGUuYW5zd2VyID09PSAnc3RyaW5nJyA/IG5vZGUuYW5zd2VyIDogJyc7XG4gIGNvbnN0IGFjY2VwdGFibGUgPSBBcnJheS5pc0FycmF5KG5vZGUuYWNjZXB0YWJsZUFuc3dlcnMpXG4gICAgPyAobm9kZS5hY2NlcHRhYmxlQW5zd2VycyBhcyB1bmtub3duW10pLmZpbHRlcihcbiAgICAgICAgKGEpOiBhIGlzIHN0cmluZyA9PiB0eXBlb2YgYSA9PT0gJ3N0cmluZycsXG4gICAgICApXG4gICAgOiBbXTtcbiAgcmV0dXJuIHtcbiAgICBpZDogU3RyaW5nKG5vZGUuaWQgPz8gJycpLFxuICAgIGFuc3dlcnM6IFthbnN3ZXIsIC4uLmFjY2VwdGFibGVdLFxuICAgIGFuc3dlclR5cGU6ICdtYXRoJyxcbiAgICB0b2xlcmFuY2U6IHR5cGVvZiBub2RlLnRvbGVyYW5jZSA9PT0gJ251bWJlcicgPyBub2RlLnRvbGVyYW5jZSA6IDAsXG4gICAgZXF1aXZhbGVuY2U6IG5vZGUuZXF1aXZhbGVuY2UgPT09ICdleGFjdC1mb3JtJyA/ICdleGFjdC1mb3JtJyA6ICd2YWx1ZScsXG4gICAgbWlzdGFrZUZlZWRiYWNrOiBbXSxcbiAgICBoaW50OiB1bmRlZmluZWQsXG4gICAgLy8gQSBnYXAgbmV2ZXIgam9pbnMgYW4gaW50ZXJjaGFuZ2VhYmxlIHJ1bjogdGhlIGZsYWcgaXMgYSBCbGFua1Rva2VuIGZpZWxkLlxuICAgIGludGVyY2hhbmdlYWJsZVdpdGhQcmV2aW91czogZmFsc2UsXG4gIH07XG59XG5cbi8vIFBST01QVF9DQVJSSUVSX1RZUEVTIGlzIGltcG9ydGVkIGZyb20gc2FuaXRpemUvcHJvbXB0Q2FycmllcnMudHMgXHUyMDE0IHRoZSBPTkVcbi8vIGRlY2xhcmF0aW9uIGJvdGggdGhlIHNhbml0aXplcidzIGRlZXAgc3RyaXAgYW5kIHRoaXMgd2FsayBjb25zdW1lIChBNykuXG5cbi8vIC0tLS0gVGhlIGludGVncml0eSBnYXRlIChCOC9EMTApIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFYWNoIGhlbHBlciBiZWxvdyBBUFBFTkRTIHByb2JsZW1zIGFuZCBuZXZlciBjaGFuZ2VzIHdoYXQgaXMgY29sbGVjdGVkIFx1MjAxNCBpblxuLy8gJ2NvZXJjZScgbW9kZSB0aGUgaW52ZW50b3J5IG11c3Qgc3RheSBieXRlLWlkZW50aWNhbCB0byB0aGUgcHJlLWdhdGUgd2Fsayxcbi8vIGFuZCBpbiAndGhyb3cnIG1vZGUgdGhlIGNvbGxlY3RlZCBpbnZlbnRvcnkgaXMgZGlzY2FyZGVkIGFueXdheS4gRXZlcnlcbi8vIG1lc3NhZ2UgbGVhZHMgd2l0aCB0aGUgb3duaW5nIGJsb2NrIGlkOiB0aGUgZXJyb3IncyBwcm9ibGVtcyBsaXN0IGlzIHdoYXRcbi8vIHR1cm5zIFwiY2hlY2tpbmcgaXMgYnJva2VuXCIgaW50byBhIGZpbmRhYmxlIGRlZmVjdCBpbiBhbiBlZGdlIGxvZy5cblxuLyoqIFRoZSBhbnN3ZXJUeXBlIC8gZXF1aXZhbGVuY2Ugdm9jYWJ1bGFyaWVzIHRoZSBwcm9qZWN0aW9ucyBjb2VyY2UgdG93YXJkLlxuICogQSB2YWx1ZSBPVVRTSURFIHRoZW0gaXMgYSBzaGFwZSB0aGUgc2NoZW1hIGNhbm5vdCBhdXRob3IgXHUyMDE0IGNvZXJjaW5nIGl0XG4gKiBzaWxlbnRseSBjaGFuZ2VzIGdyYWRpbmcgc2VtYW50aWNzIChlLmcuIGEgbWF0aCBhbnN3ZXIgZ3JhZGVkIGJ5dGUtd2lzZSkuICovXG5jb25zdCBBTlNXRVJfVFlQRVMgPSBuZXcgU2V0KFsndGV4dCcsICdudW1lcmljJywgJ21hdGgnXSk7XG5jb25zdCBFUVVJVkFMRU5DRVMgPSBuZXcgU2V0KFsndmFsdWUnLCAnZXhhY3QtZm9ybSddKTtcblxuLyoqIHByZXNlbnQtd2l0aC10aGUtd3Jvbmctc2hhcGUsIHRoZSBydWxlJ3Mgb25lIHByZWRpY2F0ZTogYWJzZW50IGlzIGFsd2F5c1xuICogZmluZSAoYXV0aG9yZWQtZW1wdHkpLCBhIGJhZCBzaGFwZSBuZXZlciBpcy4gKi9cbmZ1bmN0aW9uIGJhZCh2YWx1ZTogdW5rbm93biwgb2s6ICh2OiB1bmtub3duKSA9PiBib29sZWFuKTogYm9vbGVhbiB7XG4gIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmICFvayh2YWx1ZSk7XG59XG5cbmNvbnN0IGlzU3RyaW5nID0gKHY6IHVua25vd24pID0+IHR5cGVvZiB2ID09PSAnc3RyaW5nJztcbmNvbnN0IGlzTnVtYmVyID0gKHY6IHVua25vd24pID0+IHR5cGVvZiB2ID09PSAnbnVtYmVyJztcbmNvbnN0IGlzQm9vbGVhbiA9ICh2OiB1bmtub3duKSA9PiB0eXBlb2YgdiA9PT0gJ2Jvb2xlYW4nO1xuY29uc3QgaXNBcnJheVYgPSAodjogdW5rbm93bikgPT4gQXJyYXkuaXNBcnJheSh2KTtcbmNvbnN0IGlzUGxhaW5PYmplY3QgPSAodjogdW5rbm93bikgPT5cbiAgdiAhPT0gbnVsbCAmJiB0eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkodik7XG5cbi8qKiBNYXRjaGluZy9vcmRlcmluZyBpdGVtIGVudHJpZXM6IGBTdHJpbmcoaS5pZClgIG1pbnRlZCAndW5kZWZpbmVkJy1zdHlsZVxuICogaWRzIHRoZSBjbGllbnQgY291bGQgbmV2ZXIgc2VuZCBiYWNrLiBBbiBlbnRyeSB0aGF0IGV4aXN0cyBidXQgbGFja3MgaXRzXG4gKiBpZGVudGl0eSBpcyBicm9rZW4sIG5vdCBhdXRob3JlZC1lbXB0eSBcdTIwMTQgYW4gRU1QVFkgaXRlbXMgYXJyYXkgaXMgdGhlXG4gKiBhdXRob3JlZC1lbXB0eSBmb3JtIGFuZCBzdGF5cyBmaW5lLiAqL1xuZnVuY3Rpb24gY2hlY2tJdGVtSWRzKFxuICBpdGVtczogQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+LFxuICBibG9ja0lkOiBzdHJpbmcsXG4gIHByb2JsZW1zOiBzdHJpbmdbXSxcbik6IHZvaWQge1xuICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcbiAgICBpZiAoIWlzUGxhaW5PYmplY3QoaXRlbSkpIHtcbiAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7YmxvY2tJZH06IGFuIGl0ZW0gZW50cnkgdGhhdCBpcyBub3QgYW4gb2JqZWN0YCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaXRlbS5pZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7YmxvY2tJZH06IGFuIGl0ZW0gd2l0aG91dCBhIHN0cmluZyBpZGApO1xuICAgIH1cbiAgfVxufVxuXG4vKiogVGhlIGZpZWxkcyBibGFua1Rva2VuVG9LZXkgLyBtYXRoUHJvbXB0VG9LZXkgbmFycm93LCBjaGVja2VkIGluc3RlYWQgb2ZcbiAqIGNvZXJjZWQuIGBmb3JQcm9tcHRgIHNraXBzIHRoZSB0aHJlZSBCbGFua1Rva2VuLW9ubHkgZmllbGRzLiAqL1xuZnVuY3Rpb24gY2hlY2tLZXlGaWVsZHMoXG4gIG5vZGU6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuICB3aGVyZTogc3RyaW5nLFxuICBwcm9ibGVtczogc3RyaW5nW10sXG4gIGZvclByb21wdDogYm9vbGVhbixcbik6IHZvaWQge1xuICBpZiAoYmFkKG5vZGUuYW5zd2VyLCBpc1N0cmluZykpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogYW5zd2VyIGlzIG5vdCBhIHN0cmluZ2ApO1xuICB9XG4gIGlmIChiYWQobm9kZS5hY2NlcHRhYmxlQW5zd2VycywgaXNBcnJheVYpKSB7XG4gICAgcHJvYmxlbXMucHVzaChgJHt3aGVyZX06IGFjY2VwdGFibGVBbnN3ZXJzIGlzIG5vdCBhbiBhcnJheWApO1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkobm9kZS5hY2NlcHRhYmxlQW5zd2VycykpIHtcbiAgICAvLyBUaGUgcHJvamVjdGlvbiBGSUxURVJTIG5vbi1zdHJpbmcgZW50cmllcyBcdTIwMTQgYW4gYXV0aG9yZWQgYWx0ZXJuYXRlIHRoYXRcbiAgICAvLyBzaWxlbnRseSB2YW5pc2hlcyBtYXJrcyBhIGNvcnJlY3Qgc3R1ZGVudCB3cm9uZy5cbiAgICBpZiAoIW5vZGUuYWNjZXB0YWJsZUFuc3dlcnMuZXZlcnkoaXNTdHJpbmcpKSB7XG4gICAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogYWNjZXB0YWJsZUFuc3dlcnMgaGFzIGEgbm9uLXN0cmluZyBlbnRyeWApO1xuICAgIH1cbiAgfVxuICBpZiAoYmFkKG5vZGUuYW5zd2VyVHlwZSwgKHYpID0+IEFOU1dFUl9UWVBFUy5oYXModiBhcyBzdHJpbmcpKSkge1xuICAgIHByb2JsZW1zLnB1c2goYCR7d2hlcmV9OiBhbnN3ZXJUeXBlIGlzIG91dHNpZGUgdGhlIHZvY2FidWxhcnlgKTtcbiAgfVxuICBpZiAoYmFkKG5vZGUudG9sZXJhbmNlLCBpc051bWJlcikpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogdG9sZXJhbmNlIGlzIG5vdCBhIG51bWJlcmApO1xuICB9XG4gIGlmIChiYWQobm9kZS5lcXVpdmFsZW5jZSwgKHYpID0+IEVRVUlWQUxFTkNFUy5oYXModiBhcyBzdHJpbmcpKSkge1xuICAgIHByb2JsZW1zLnB1c2goYCR7d2hlcmV9OiBlcXVpdmFsZW5jZSBpcyBvdXRzaWRlIHRoZSB2b2NhYnVsYXJ5YCk7XG4gIH1cbiAgaWYgKGZvclByb21wdCkgcmV0dXJuO1xuICBpZiAoYmFkKG5vZGUubWlzdGFrZUZlZWRiYWNrLCBpc0FycmF5VikpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogbWlzdGFrZUZlZWRiYWNrIGlzIG5vdCBhbiBhcnJheWApO1xuICB9XG4gIGlmIChiYWQobm9kZS5oaW50LCBpc0FycmF5VikpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogaGludCBpcyBub3QgYW4gYXJyYXlgKTtcbiAgfVxuICBpZiAoYmFkKG5vZGUuaW50ZXJjaGFuZ2VhYmxlV2l0aFByZXZpb3VzLCBpc0Jvb2xlYW4pKSB7XG4gICAgLy8gYD09PSB0cnVlYCBuYXJyb3dpbmcgd291bGQgc2lsZW50bHkgZGVncmFkZSB0aGUgZ3JvdXAgdG8gcG9zaXRpb25hbFxuICAgIC8vIGdyYWRpbmcgXHUyMDE0IGEgc3dhcHBlZC1idXQtY29ycmVjdCBwYWlyIG1hcmtlZCB3cm9uZy5cbiAgICBwcm9ibGVtcy5wdXNoKGAke3doZXJlfTogaW50ZXJjaGFuZ2VhYmxlV2l0aFByZXZpb3VzIGlzIG5vdCBhIGJvb2xlYW5gKTtcbiAgfVxufVxuXG4vKiogQ29sbGVjdCBpbi1iYW5kIGtleXMgKGJsYW5rcyArIG1hdGggZ2FwcykgYmVsb25naW5nIHRvIFRISVMgYmxvY2ssIGF0IGFueVxuICogZGVwdGggc2hvcnQgb2YgYSBuZXN0ZWQgY2hpbGQgYmxvY2suICovXG5mdW5jdGlvbiBjb2xsZWN0SW5CYW5kS2V5cyhcbiAgdmFsdWU6IHVua25vd24sXG4gIG91dDogQmxhbmtLZXlbXSxcbiAgaXNDaGlsZEJsb2NrQXJyYXk6ICh2YWx1ZTogdW5rbm93bikgPT4gYm9vbGVhbixcbiAgYmxvY2tJZDogc3RyaW5nLFxuICBwcm9ibGVtczogc3RyaW5nW10sXG4pOiB2b2lkIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgaWYgKGlzQ2hpbGRCbG9ja0FycmF5KHZhbHVlKSkgcmV0dXJuO1xuICAgIGZvciAoY29uc3QgaXRlbSBvZiB2YWx1ZSkge1xuICAgICAgY29sbGVjdEluQmFuZEtleXMoaXRlbSwgb3V0LCBpc0NoaWxkQmxvY2tBcnJheSwgYmxvY2tJZCwgcHJvYmxlbXMpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHJldHVybjtcbiAgY29uc3Qgbm9kZSA9IHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIGlmIChub2RlLnR5cGUgPT09ICdibGFuaycgJiYgdHlwZW9mIG5vZGUuaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgLy8gTm90IGV2ZW4gcmVjb2duaXplZCBhcyBhIGJsYW5rIFx1MjAxNCB0aGUgdHlwZWQgYW5zd2VyIHdvdWxkIHZhbmlzaC4gVGhlIGlkXG4gICAgLy8gaXMgdGhlIHRva2VuJ3MgaWRlbnRpdHksIHNvIGFuIGVudHJ5IHdpdGhvdXQgb25lIGlzIGJyb2tlbiwgbm90XG4gICAgLy8gYXV0aG9yZWQtZW1wdHkuIEZhbGxzIHRocm91Z2ggdG8gdGhlIGNoaWxkIHdhbGsgZXhhY3RseSBhcyB0aGVcbiAgICAvLyBwcmUtZ2F0ZSBjb2RlIGRpZCwgc28gJ2NvZXJjZScgbW9kZSBzdGF5cyBieXRlLWlkZW50aWNhbC5cbiAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2Jsb2NrSWR9OiBhIGJsYW5rIHRva2VuIHdpdGhvdXQgYSBzdHJpbmcgaWRgKTtcbiAgfVxuICBpZiAobm9kZS50eXBlID09PSAnYmxhbmsnICYmIHR5cGVvZiBub2RlLmlkID09PSAnc3RyaW5nJykge1xuICAgIGNoZWNrS2V5RmllbGRzKG5vZGUsIGBibG9jayAke2Jsb2NrSWR9OiBibGFuayAke25vZGUuaWR9YCwgcHJvYmxlbXMsIGZhbHNlKTtcbiAgICBvdXQucHVzaChibGFua1Rva2VuVG9LZXkobm9kZSkpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodHlwZW9mIG5vZGUudHlwZSA9PT0gJ3N0cmluZycgJiYgUFJPTVBUX0NBUlJJRVJfVFlQRVMuaGFzKG5vZGUudHlwZSkpIHtcbiAgICBpZiAoYmFkKG5vZGUucHJvbXB0cywgaXNBcnJheVYpKSB7XG4gICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2Jsb2NrSWR9OiBwcm9tcHRzIGlzIG5vdCBhbiBhcnJheWApO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShub2RlLnByb21wdHMpKSB7XG4gICAgICBmb3IgKGNvbnN0IHByb21wdCBvZiBub2RlLnByb21wdHMpIHtcbiAgICAgICAgaWYgKHByb21wdCA9PT0gbnVsbCB8fCB0eXBlb2YgcHJvbXB0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7YmxvY2tJZH06IGEgcHJvbXB0IGVudHJ5IHRoYXQgaXMgbm90IGFuIG9iamVjdGApO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHAgPSBwcm9tcHQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgICAgIGlmICh0eXBlb2YgcC5pZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2Jsb2NrSWR9OiBhIHByb21wdCB3aXRob3V0IGEgc3RyaW5nIGlkYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hlY2tLZXlGaWVsZHMocCwgYGJsb2NrICR7YmxvY2tJZH06IHByb21wdCAke3AuaWR9YCwgcHJvYmxlbXMsIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIG91dC5wdXNoKG1hdGhQcm9tcHRUb0tleShwKSk7XG4gICAgICB9XG4gICAgICAvLyBLZWVwIHdhbGtpbmcgc2libGluZ3M6IGEgbWF0aF9ibG9jayBjYXJyaWVzIGNvbnRlbnQgZmllbGRzIHRvby5cbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBjaGlsZCBvZiBPYmplY3QudmFsdWVzKG5vZGUpKSB7XG4gICAgY29sbGVjdEluQmFuZEtleXMoY2hpbGQsIG91dCwgaXNDaGlsZEJsb2NrQXJyYXksIGJsb2NrSWQsIHByb2JsZW1zKTtcbiAgfVxufVxuXG4vLyBsb29rc0xpa2VCbG9ja0FycmF5IC8gY2hpbGRCbG9ja3NPZiBhcmUgSU1QT1JURUQgZnJvbSBjb250YWluZXIvYmxvY2tJbmRleCBcdTIwMTRcbi8vIHRoaXMgZmlsZSBjYXJyaWVkIGEgcHJpdmF0ZSwgbG9naWNhbGx5LWlkZW50aWNhbCBjb3B5IG9mIHRoZSBzdWJ0bGVcbi8vIGhldXJpc3RpYyB1bnRpbCAyMDI2LTA4LTA2IChBMjQpLCBoZWRnZWQgXCJtaXJyb3JpbmcgYmxvY2tJbmRleCdzXCIgd2hpbGUgdGhlXG4vLyBzb3VyY2UgZmlsZSBjbGFpbWVkIFwidGhpcyBvbmUgaXMgdGhlIHNvdXJjZVwiOiB0aGUgY29weSB0aGF0IHdvdWxkIHNpbGVudGx5XG4vLyBkcmlmdCwgYW5kIGRyaWZ0ZWQgYXR0cmlidXRpb24gbWlzLWdyYWRlcyBpbnZpc2libHkuIFNhbWUgcGFja2FnZSwgYW5kIHRoZVxuLy8gY2Vuc3VzIGFscmVhZHkgaW1wb3J0cyBjaGlsZEJsb2Nrc09mIHNlcnZlci1zaWRlLCBzbyB0aGUgYnVuZGxlIGJvdW5kYXJ5XG4vLyB3YXMgcHJvdmVuIGJlZm9yZSB0aGlzIGpvaW5lZCBpdC5cblxuZnVuY3Rpb24gdmlzaXQoXG4gIGJsb2NrOiBSYXdCbG9jayxcbiAgaW52OiBHcmFkYWJsZUludmVudG9yeSxcbiAgcHJvYmxlbXM6IHN0cmluZ1tdLFxuKTogdm9pZCB7XG4gIGNvbnN0IGlkID0gdHlwZW9mIGJsb2NrLmlkID09PSAnc3RyaW5nJyA/IGJsb2NrLmlkIDogJyc7XG4gIGNvbnN0IHR5cGUgPSB0eXBlb2YgYmxvY2sudHlwZSA9PT0gJ3N0cmluZycgPyBibG9jay50eXBlIDogJyc7XG4gIGlmIChiYWQoYmxvY2suaWQsIGlzU3RyaW5nKSkge1xuICAgIC8vIFNraXBwZWQgZW50aXJlbHkgYnkgdGhlIHByZS1nYXRlIHdhbGs6IHRoZSBzdHVkZW50J3MgYW5zd2VyIGZvciBpdCB3YXNcbiAgICAvLyBzdWJtaXR0ZWQsIHN0b3JlZCwgYW5kIG5ldmVyIHNjb3JlZCBcdTIwMTQgdGhlIGV4YWN0IGZhaWx1cmUgdGhlIGRlZXAgd2Fsa1xuICAgIC8vIGV4aXN0cyB0byBwcmV2ZW50LlxuICAgIHByb2JsZW1zLnB1c2goYGEgYmxvY2sgd2hvc2UgaWQgaXMgbm90IGEgc3RyaW5nICgke0pTT04uc3RyaW5naWZ5KGJsb2NrLmlkKX0pYCk7XG4gIH1cbiAgaWYgKGJhZChibG9jay50eXBlLCBpc1N0cmluZykpIHtcbiAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkIHx8ICc8bm8gaWQ+J306IHR5cGUgaXMgbm90IGEgc3RyaW5nYCk7XG4gIH1cbiAgaWYgKGJhZChibG9jay5zb2x1dGlvbiwgaXNBcnJheVYpKSB7XG4gICAgLy8gU2lsZW50bHkgZHJvcHBlZCBiZWZvcmU6IHRoZSBzZWN0aW9uIHNheXMgXCJjaGVja2VkXCIgYnV0IHRoZSB3b3JrZWRcbiAgICAvLyBleHBsYW5hdGlvbiBuZXZlciB1bmxvY2tzIFx1MjAxNCBhIGNvbnRlbnQgYnVnIGZyb20gdGhlIHN0dWRlbnQncyBzZWF0LlxuICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWQgfHwgJzxubyBpZD4nfTogc29sdXRpb24gaXMgbm90IGFuIGFycmF5YCk7XG4gIH1cbiAgaWYgKCFpZCkgcmV0dXJuO1xuXG4gIC8vIFNvbHV0aW9ucyBhcmUgY29sbGVjdGVkIGZvciBFVkVSWSBibG9jayB0aGF0IGhhcyBvbmUsIGluY2x1ZGluZyBzdGF0aWNzLlxuICAvLyBBIGdyYWRlciB0aGF0IHdhbGtlZCBvbmx5IHJlc3BvbmRpbmcgYmxvY2tzIHdvdWxkIG5ldmVyIHVubG9jayBhXG4gIC8vIGBwcm9ibGVtYCdzIHdvcmtlZCBzb2x1dGlvbiwgYW5kIHRvIGEgc3R1ZGVudCB0aGF0IHJlYWRzIGFzIGEgY29udGVudCBidWdcbiAgLy8gKHRoZSBzZWN0aW9uIHNheXMgXCJjaGVja2VkXCIgYnV0IG9uZSBib3ggc3RheXMgc2h1dCkuXG4gIGlmIChBcnJheS5pc0FycmF5KGJsb2NrLnNvbHV0aW9uKSAmJiBibG9jay5zb2x1dGlvbi5sZW5ndGggPiAwKSB7XG4gICAgaW52LnNvbHV0aW9ucy5wdXNoKHsgYmxvY2tJZDogaWQsIHNvbHV0aW9uOiBibG9jay5zb2x1dGlvbiBhcyB1bmtub3duW10gfSk7XG4gIH1cblxuICBjb25zdCBpbkJhbmQ6IEJsYW5rS2V5W10gPSBbXTtcbiAgY29sbGVjdEluQmFuZEtleXMoYmxvY2ssIGluQmFuZCwgbG9va3NMaWtlQmxvY2tBcnJheSwgaWQsIHByb2JsZW1zKTtcbiAgaWYgKGluQmFuZC5sZW5ndGggPiAwKSB7XG4gICAgaW52LmJsYW5rR3JvdXBzQnlCbG9jay5wdXNoKHsgYmxvY2tJZDogaWQsIGtleXM6IGluQmFuZCB9KTtcbiAgfVxuXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ211bHRpcGxlX2Nob2ljZSc6IHtcbiAgICAgIGlmIChiYWQoYmxvY2suY2hvaWNlcywgaXNBcnJheVYpKSB7XG4gICAgICAgIC8vIENvZXJjZWQgdG8gW10gYmVmb3JlOiB0aGUgc2VsZWN0aW9uIGdyYWRlZCBhZ2FpbnN0IGFuIEVNUFRZIGtleSBhbmRcbiAgICAgICAgLy8gdGhlIHN0dWRlbnQgd2FzIG1hcmtlZCB3cm9uZyB3aXRoIGNvbmZpZGVuY2UuXG4gICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBjaG9pY2VzIGlzIG5vdCBhbiBhcnJheWApO1xuICAgICAgfVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYmxvY2suY2hvaWNlcykpIHtcbiAgICAgICAgZm9yIChjb25zdCBjIG9mIGJsb2NrLmNob2ljZXMpIHtcbiAgICAgICAgICBpZiAoIWlzUGxhaW5PYmplY3QoYykpIHtcbiAgICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBhIGNob2ljZSBlbnRyeSB0aGF0IGlzIG5vdCBhbiBvYmplY3RgKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBjaG9pY2UgPSBjIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgICAgICAgIGlmICh0eXBlb2YgY2hvaWNlLmlkICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgLy8gU3RyaW5nKGMuaWQpIG1pbnRlZCBpZHMgdGhlIHNlcnZlZCBwYWdlIG5ldmVyIHJlbmRlcmVkLlxuICAgICAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGEgY2hvaWNlIHdpdGhvdXQgYSBzdHJpbmcgaWRgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGJhZChjaG9pY2UuY29ycmVjdCwgaXNCb29sZWFuKSkge1xuICAgICAgICAgICAgLy8gYD09PSB0cnVlYCBuYXJyb3dpbmcgc2lsZW50bHkgZW1wdGllZCB0aGUga2V5LlxuICAgICAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGEgY2hvaWNlIHdob3NlIGNvcnJlY3QgZmxhZyBpcyBub3QgYSBib29sZWFuYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChiYWQoY2hvaWNlLmZlZWRiYWNrLCBpc0FycmF5VikpIHtcbiAgICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBhIGNob2ljZSB3aG9zZSBmZWVkYmFjayBpcyBub3QgYW4gYXJyYXlgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGNob2ljZXMgPSBBcnJheS5pc0FycmF5KGJsb2NrLmNob2ljZXMpXG4gICAgICAgID8gKGJsb2NrLmNob2ljZXMgYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KVxuICAgICAgICA6IFtdO1xuICAgICAgaW52Lm11bHRpcGxlQ2hvaWNlLnB1c2goe1xuICAgICAgICBibG9ja0lkOiBpZCxcbiAgICAgICAgY29ycmVjdElkczogY2hvaWNlc1xuICAgICAgICAgIC5maWx0ZXIoKGMpID0+IGMuY29ycmVjdCA9PT0gdHJ1ZSlcbiAgICAgICAgICAubWFwKChjKSA9PiBTdHJpbmcoYy5pZCkpLFxuICAgICAgICBjaG9pY2VzOiBjaG9pY2VzLm1hcCgoYykgPT4gKHtcbiAgICAgICAgICBpZDogU3RyaW5nKGMuaWQpLFxuICAgICAgICAgIGNvcnJlY3Q6IGMuY29ycmVjdCA9PT0gdHJ1ZSxcbiAgICAgICAgICAuLi4oQXJyYXkuaXNBcnJheShjLmZlZWRiYWNrKVxuICAgICAgICAgICAgPyB7IGZlZWRiYWNrOiBjLmZlZWRiYWNrIGFzIHVua25vd25bXSB9XG4gICAgICAgICAgICA6IHt9KSxcbiAgICAgICAgICAuLi4odHlwZW9mIGMubWlzY29uY2VwdGlvbklkID09PSAnc3RyaW5nJyAmJiBjLm1pc2NvbmNlcHRpb25JZFxuICAgICAgICAgICAgPyB7IG1pc2NvbmNlcHRpb25JZDogYy5taXNjb25jZXB0aW9uSWQgfVxuICAgICAgICAgICAgOiB7fSksXG4gICAgICAgIH0pKSxcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgJ21hdGNoaW5nJzoge1xuICAgICAgaWYgKGJhZChibG9jay5pdGVtcywgaXNBcnJheVYpKSB7XG4gICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBpdGVtcyBpcyBub3QgYW4gYXJyYXlgKTtcbiAgICAgIH1cbiAgICAgIGlmIChiYWQoYmxvY2sua2V5LCBpc1BsYWluT2JqZWN0KSkge1xuICAgICAgICAvLyBUaGUgYmFyZSBjYXN0IHBhc3NlZCBhbnl0aGluZyB0aHJvdWdoOiBsb29rdXBzIG9uIGEgYnJva2VuIGtleVxuICAgICAgICAvLyByZXR1cm4gdW5kZWZpbmVkIGFuZCBldmVyeSBwbGFjZWQgcGFpciBpcyB3cm9uZy5cbiAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGtleSBpcyBub3QgYW4gb2JqZWN0YCk7XG4gICAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QoYmxvY2sua2V5KSkge1xuICAgICAgICBpZiAoIU9iamVjdC52YWx1ZXMoYmxvY2sua2V5IGFzIG9iamVjdCkuZXZlcnkoaXNTdHJpbmcpKSB7XG4gICAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGtleSBoYXMgYSBub24tc3RyaW5nIHRhcmdldGApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBpdGVtcyA9IEFycmF5LmlzQXJyYXkoYmxvY2suaXRlbXMpXG4gICAgICAgID8gKGJsb2NrLml0ZW1zIGFzIEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PilcbiAgICAgICAgOiBbXTtcbiAgICAgIGNoZWNrSXRlbUlkcyhpdGVtcywgaWQsIHByb2JsZW1zKTtcbiAgICAgIGludi5tYXRjaGluZy5wdXNoKHtcbiAgICAgICAgYmxvY2tJZDogaWQsXG4gICAgICAgIGtleTogKGJsb2NrLmtleSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSA/PyB7fSxcbiAgICAgICAgaXRlbUlkczogaXRlbXMubWFwKChpKSA9PiBTdHJpbmcoaS5pZCkpLFxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSAnb3JkZXJpbmcnOiB7XG4gICAgICBpZiAoYmFkKGJsb2NrLml0ZW1zLCBpc0FycmF5VikpIHtcbiAgICAgICAgLy8gYXV0aG9yZWRPcmRlciBjb2VyY2VkIHRvIFtdIGJlZm9yZTogYSBkZWxpYmVyYXRlIGFycmFuZ2VtZW50IGdyYWRlZFxuICAgICAgICAvLyBhZ2FpbnN0IGFuIGVtcHR5IGtleSBhbmQgd2FzIG1hcmtlZCB3cm9uZy5cbiAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGl0ZW1zIGlzIG5vdCBhbiBhcnJheWApO1xuICAgICAgfVxuICAgICAgY29uc3QgaXRlbXMgPSBBcnJheS5pc0FycmF5KGJsb2NrLml0ZW1zKVxuICAgICAgICA/IChibG9jay5pdGVtcyBhcyBBcnJheTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4pXG4gICAgICAgIDogW107XG4gICAgICBjaGVja0l0ZW1JZHMoaXRlbXMsIGlkLCBwcm9ibGVtcyk7XG4gICAgICAvLyBUaGUgYXV0aG9yZWQgb3JkZXIgSVMgdGhlIGtleSBcdTIwMTQgYXZhaWxhYmxlIG9ubHkgYmVjYXVzZSB0aGlzIHdhbGtzIHRoZVxuICAgICAgLy8gcmF3IGRvY3VtZW50IHJhdGhlciB0aGFuIHRoZSBzZXJ2ZWQgb25lLlxuICAgICAgaW52Lm9yZGVyaW5nLnB1c2goeyBibG9ja0lkOiBpZCwgYXV0aG9yZWRPcmRlcjogaXRlbXMubWFwKChpKSA9PiBTdHJpbmcoaS5pZCkpIH0pO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgLy8gQSB0YWJsZSBjb250cmlidXRlcyBOTyBwZXItdHlwZSBpbnZlbnRvcnk6IGl0cyBncmFkYWJsZSBjb250ZW50IGlzXG4gICAgICAvLyBibGFuayB0b2tlbnMsIGFscmVhZHkgY29sbGVjdGVkIChhbmQgZ2F0ZWQpIGJ5IHRoZSBpbi1iYW5kIHdhbGsgYWJvdmUsXG4gICAgICAvLyB3aGVyZXZlciBpbiB0aGUgY2VsbHMgdGhleSBzaXQuIFRoYXQgaXMgdGhlIHdob2xlIGRlc2lnbi5cbiAgICAgIC8vXG4gICAgICAvLyBXaGF0IHRoYXQgd2FsayBjYW5ub3Qgc2VlIGlzIGEgU0tFTEVUT04gcHJlc2VudCB3aXRoIHRoZSB3cm9uZyBzaGFwZS5cbiAgICAgIC8vIGByb3dzOiAnbm9wZSdgLCBvciBhIGBjZWxsc2Agb2JqZWN0LCBzaW1wbHkgeWllbGRzIG5vIGtleXMgXHUyMDE0IHNvIHRoZVxuICAgICAgLy8gc2VjdGlvbiBcImNoZWNrc1wiIHN1Y2Nlc3NmdWxseSB3aGlsZSB0aGUgc3R1ZGVudCdzIHRhYmxlIGFuc3dlcnMgZ29cbiAgICAgIC8vIHVuc2NvcmVkIGFuZCB1bnJlcG9ydGVkLiBUaGF0IGlzIHRoZSBzYW1lIHdvcnN0LWNhc2UgdGhlIHNlY3Rpb24tbGV2ZWxcbiAgICAgIC8vIHJvd3MgY2hlY2sgZ3VhcmRzIGFnYWluc3QsIG9uZSBsZXZlbCBkb3duLCBhbmQgdGhlIHJlYXNvbiB0aGlzIGNhc2VcbiAgICAgIC8vIGV4aXN0cyBhdCBhbGwgZGVzcGl0ZSBhZGRpbmcgbm90aGluZyB0byB0aGUgaW52ZW50b3J5LlxuICAgICAgaWYgKGJhZChibG9jay5yb3dzLCBpc0FycmF5VikpIHtcbiAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IHJvd3MgaXMgbm90IGFuIGFycmF5YCk7XG4gICAgICB9XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShibG9jay5yb3dzKSkge1xuICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiBibG9jay5yb3dzKSB7XG4gICAgICAgICAgaWYgKCFpc1BsYWluT2JqZWN0KHJvdykpIHtcbiAgICAgICAgICAgIHByb2JsZW1zLnB1c2goYGJsb2NrICR7aWR9OiBhIHJvdyB0aGF0IGlzIG5vdCBhbiBvYmplY3RgKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBjZWxscyA9IChyb3cgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmNlbGxzO1xuICAgICAgICAgIGlmIChiYWQoY2VsbHMsIGlzQXJyYXlWKSkge1xuICAgICAgICAgICAgcHJvYmxlbXMucHVzaChgYmxvY2sgJHtpZH06IGEgcm93IHdob3NlIGNlbGxzIGlzIG5vdCBhbiBhcnJheWApO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvciAoY29uc3QgY2VsbCBvZiBBcnJheS5pc0FycmF5KGNlbGxzKSA/IGNlbGxzIDogW10pIHtcbiAgICAgICAgICAgIGlmICghaXNQbGFpbk9iamVjdChjZWxsKSkge1xuICAgICAgICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkfTogYSBjZWxsIHRoYXQgaXMgbm90IGFuIG9iamVjdGApO1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiYWQoKGNlbGwgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmNvbnRlbnQsIGlzQXJyYXlWKSkge1xuICAgICAgICAgICAgICBwcm9ibGVtcy5wdXNoKGBibG9jayAke2lkfTogYSBjZWxsIHdob3NlIGNvbnRlbnQgaXMgbm90IGFuIGFycmF5YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBkZWZhdWx0OlxuICAgICAgaWYgKEZSRUVfVEVYVF9UWVBFUy5oYXModHlwZSkpIHtcbiAgICAgICAgaW52LmZyZWVUZXh0LnB1c2goaWQpO1xuICAgICAgfSBlbHNlIGlmIChHUkFQSF9UWVBFUy5oYXModHlwZSkpIHtcbiAgICAgICAgaW52LmdyYXBocy5wdXNoKHsgYmxvY2tJZDogaWQsIGJsb2NrOiBibG9jayBhcyB1bmtub3duIGFzIFJhd0dyYXBoQmxvY2sgfSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgfVxuXG4gIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRCbG9ja3NPZihibG9jaykpIHZpc2l0KGNoaWxkLCBpbnYsIHByb2JsZW1zKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSYXdTZWN0aW9uIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIHJvd3M/OiBBcnJheTx7IGNvbHVtbnM/OiBBcnJheTx7IGJsb2Nrcz86IFJhd0Jsb2NrW10gfT4gfT47XG59XG5cbi8qKiBGaW5kIGEgc2VjdGlvbiBieSBpZCBpbiB0aGUgcmF3IGRvY3VtZW50LiBSZXR1cm5zIG51bGwgd2hlbiBhYnNlbnQgXHUyMDE0IHRoZVxuICogaGFuZGxlciB0dXJucyB0aGF0IGludG8gYSA0MDAgcmF0aGVyIHRoYW4gZ3JhZGluZyBub3RoaW5nIGFuZCByZXBvcnRpbmdcbiAqIHN1Y2Nlc3MuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZFNlY3Rpb24oXG4gIGRvYzogeyBzZWN0aW9ucz86IFJhd1NlY3Rpb25bXSB9LFxuICBzZWN0aW9uSWQ6IHN0cmluZyxcbik6IFJhd1NlY3Rpb24gfCBudWxsIHtcbiAgZm9yIChjb25zdCBzZWN0aW9uIG9mIGRvYy5zZWN0aW9ucyA/PyBbXSkge1xuICAgIGlmIChzZWN0aW9uLmlkID09PSBzZWN0aW9uSWQpIHJldHVybiBzZWN0aW9uO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdhbGtPcHRpb25zIHtcbiAgLyoqXG4gICAqICd0aHJvdycgKGRlZmF1bHQpOiB0aGUgQjgvRDEwIGludGVncml0eSBnYXRlIFx1MjAxNCBhIHN0cnVjdHVyYWxseSBicm9rZW5cbiAgICogZG9jdW1lbnQgcmFpc2VzIE1hbGZvcm1lZERvY3VtZW50RXJyb3IgaW5zdGVhZCBvZiBncmFkaW5nLiBUaGUgZGVmYXVsdCBvblxuICAgKiBwdXJwb3NlOiBhIG5ldyBjYWxsZXIgZ2V0cyB0aGUgZ2F0ZSB1bmxlc3MgaXQgYXJndWVzIGl0cyB3YXkgb3V0LlxuICAgKlxuICAgKiAnY29lcmNlJzogdGhlIHByZS1nYXRlIGRlZmVuc2l2ZSBuYXJyb3dpbmcsIGJ5dGUtaWRlbnRpY2FsIGludmVudG9yeS5cbiAgICogUmVzZXJ2ZWQgZm9yIHRoZSBSRUFEIHBhdGggKGNlbnN1cyksIHdob3NlIHJ1bGVkIGZhaWx1cmUgcG9zdHVyZSBpc1xuICAgKiB3aXRoaG9sZC1hbmQtc2VydmUgXHUyMDE0IGEgY2Vuc3VzZWQgbWFsZm9ybWVkIGRvY3VtZW50IG1lcmVseSBtaXNjb3VudHMsXG4gICAqIHdoZXJlIGEgZ3JhZGVkIG9uZSBtaW50cyBhIHdyb25nIG1hcmsuXG4gICAqL1xuICBpbnRlZ3JpdHk/OiAndGhyb3cnIHwgJ2NvZXJjZSc7XG59XG5cbi8qKiBCdWlsZCB0aGUgZ3JhZGFibGUgaW52ZW50b3J5IGZvciBvbmUgc2VjdGlvbiBvZiB0aGUgUkFXIGRvY3VtZW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVudG9yeVNlY3Rpb24oXG4gIHNlY3Rpb246IFJhd1NlY3Rpb24sXG4gIG9wdGlvbnM6IFdhbGtPcHRpb25zID0ge30sXG4pOiBHcmFkYWJsZUludmVudG9yeSB7XG4gIGNvbnN0IGludjogR3JhZGFibGVJbnZlbnRvcnkgPSB7XG4gICAgYmxhbmtHcm91cHNCeUJsb2NrOiBbXSxcbiAgICBtdWx0aXBsZUNob2ljZTogW10sXG4gICAgbWF0Y2hpbmc6IFtdLFxuICAgIG9yZGVyaW5nOiBbXSxcbiAgICBncmFwaHM6IFtdLFxuICAgIGZyZWVUZXh0OiBbXSxcbiAgICBzb2x1dGlvbnM6IFtdLFxuICB9O1xuICBjb25zdCBwcm9ibGVtczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVGhlIHNrZWxldG9uIHJ1bnMgdGhlIHNhbWUgcHJlc2VudC12cy1hYnNlbnQgcnVsZSBhcyB0aGUgYmxvY2tzOiByb3dzXG4gIC8vIGNvZXJjZWQgdG8gW10gaXMgdGhlIHdvcnN0IHNpbGVudCBvdXRjb21lIG9mIGFsbCBcdTIwMTQgdGhlIHdob2xlIHNlY3Rpb25cbiAgLy8gXCJjaGVja3NcIiBzdWNjZXNzZnVsbHkgd2l0aCB6ZXJvIGl0ZW1zLlxuICBjb25zdCByYXcgPSBzZWN0aW9uIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBpZiAoYmFkKHJhdy5yb3dzLCBpc0FycmF5VikpIHtcbiAgICBwcm9ibGVtcy5wdXNoKCdzZWN0aW9uOiByb3dzIGlzIG5vdCBhbiBhcnJheScpO1xuICB9XG4gIGZvciAoY29uc3Qgcm93IG9mIEFycmF5LmlzQXJyYXkocmF3LnJvd3MpID8gKHNlY3Rpb24ucm93cyA/PyBbXSkgOiBbXSkge1xuICAgIGlmICghaXNQbGFpbk9iamVjdChyb3cpKSB7XG4gICAgICBwcm9ibGVtcy5wdXNoKCdzZWN0aW9uOiBhIHJvdyB0aGF0IGlzIG5vdCBhbiBvYmplY3QnKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoYmFkKHJvdy5jb2x1bW5zLCBpc0FycmF5VikpIHtcbiAgICAgIHByb2JsZW1zLnB1c2goJ3NlY3Rpb246IGEgcm93IHdob3NlIGNvbHVtbnMgaXMgbm90IGFuIGFycmF5Jyk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgY29sdW1uIG9mIEFycmF5LmlzQXJyYXkocm93LmNvbHVtbnMpID8gcm93LmNvbHVtbnMgOiBbXSkge1xuICAgICAgaWYgKCFpc1BsYWluT2JqZWN0KGNvbHVtbikpIHtcbiAgICAgICAgcHJvYmxlbXMucHVzaCgnc2VjdGlvbjogYSBjb2x1bW4gdGhhdCBpcyBub3QgYW4gb2JqZWN0Jyk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKGJhZChjb2x1bW4uYmxvY2tzLCBpc0FycmF5VikpIHtcbiAgICAgICAgcHJvYmxlbXMucHVzaCgnc2VjdGlvbjogYSBjb2x1bW4gd2hvc2UgYmxvY2tzIGlzIG5vdCBhbiBhcnJheScpO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBibG9jayBvZiBBcnJheS5pc0FycmF5KGNvbHVtbi5ibG9ja3MpID8gY29sdW1uLmJsb2NrcyA6IFtdKSB7XG4gICAgICAgIGlmICghaXNQbGFpbk9iamVjdChibG9jaykpIHtcbiAgICAgICAgICBwcm9ibGVtcy5wdXNoKCdzZWN0aW9uOiBhIGJsb2NrcyBlbnRyeSB0aGF0IGlzIG5vdCBhbiBvYmplY3QnKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB2aXNpdChibG9jaywgaW52LCBwcm9ibGVtcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChwcm9ibGVtcy5sZW5ndGggPiAwICYmIG9wdGlvbnMuaW50ZWdyaXR5ICE9PSAnY29lcmNlJykge1xuICAgIHRocm93IG5ldyBNYWxmb3JtZWREb2N1bWVudEVycm9yKHByb2JsZW1zKTtcbiAgfVxuICByZXR1cm4gaW52O1xufVxuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBjZW5zdXMvY2Vuc3VzLnRzIFx1MjAxNCBhIHB1Ymxpc2hlZCB2ZXJzaW9uJ3MgYmxvY2sgY2Vuc3VzICsgaXRlbSBhdHRyaWJ1dGlvbiAoUzcpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUDNBJ3MgXCJwdWJsaXNoLXRpbWUgcmVnaXN0cnkgY2Vuc3VzXCIsIGJ1aWx0IHRoZSB3YXkgUzIgbWFkZSBwb3NzaWJsZTogdGhlXG4vLyBjZW5zdXMgaXMgREVSSVZFRCBmcm9tIHRoZSBzdG9yZWQgdmVyc2lvbiBzbmFwc2hvdCwgbmV2ZXIgd3JpdHRlbiBieVxuLy8gcHVibGlzaC1hY3Rpdml0eS4gRXZlcnkgcHVibGlzaGVkIHZlcnNpb24ncyBkb2N1bWVudCBhbHJlYWR5IGxpdmVzIGluXG4vLyBhY3Rpdml0eV92ZXJzaW9ucy5jb250ZW50IGZvcmV2ZXIsIHNvIHRoZSB0YWxseSBjYW4gYmUgY29tcHV0ZWQgd2hlbmV2ZXIgdGhlXG4vLyBkb2N1bWVudCBpcyBuZXh0IHJlYWQgXHUyMDE0IGFuZCBgcHVibGlzaC1hY3Rpdml0eWAsIHdoaWNoIFM5IHJld3JpdGVzLCBpcyBuZXZlclxuLy8gdG91Y2hlZCAodGhpcyBpcyB3aGF0IGRpc3NvbHZlZCBmaW5kaW5nIFI2KGIpOiBub3RoaW5nIGdldHMgd3JpdHRlbiB0d2ljZSkuXG4vLyBTYW1lIHBvc3R1cmUgYXMgMDAyNSdzIGRlcml2ZWQgc3R1ZGVudCBkb3JtYW5jeTogZG9uJ3QgbWFyayB3aGF0IHlvdSBjYW5cbi8vIGRlcml2ZS5cbi8vXG4vLyBUd28gcHJvZHVjdHMsIGJvdGggcGVyIHZlcnNpb246XG4vL1xuLy8gICBjb3VudHMgXHUyMDE0IGNlbnN1c0tleSBcdTIxOTIgaG93IG1hbnkgYmxvY2sgaW5zdGFuY2VzIG9mIHRoYXQga2luZCB0aGUgdmVyc2lvblxuLy8gICAgIGNvbnRhaW5zLiBUaGUga2V5IGNvbWVzIGZyb20gdGhlIHJlZ2lzdHJ5J3MgY2Vuc3VzS2V5T2YoKSwgc28gYVxuLy8gICAgIHZhcmlhbnQtY2FycnlpbmcgYmxvY2sgdGFsbGllcyBwZXIgdmFyaWFudCAoYGRhdGFfcGxvdC5idWlsZF9oaXN0b2dyYW1gKVxuLy8gICAgIGFuZCBhIG5ldyBibG9jayB0eXBlIGlzIGNvdW50ZWQgdGhlIGRheSBpdCByZWdpc3RlcnMuXG4vL1xuLy8gICBpdGVtcyBcdTIwMTQgZXZlcnkgUkVTUE9OU0UgaWQgaW4gdGhlIHZlcnNpb24gbWFwcGVkIHRvIHRoZSBjZW5zdXMga2V5IG9mIHRoZVxuLy8gICAgIGJsb2NrIGl0IGJlbG9uZ3MgdG8uIFRoaXMgaXMgd2hhdCBsZXRzIGFuIGFnZ3JlZ2F0ZSBvdmVyIHNlY3Rpb25fY2hlY2tzXG4vLyAgICAgc2F5IFwiMyBvZiA0IHdyb25nIGFuc3dlcnMgd2VyZSBvbiBmaWxsX2luX2JsYW5rXCIgXHUyMDE0IHZlcmRpY3RzIGFyZSBrZXllZCBieVxuLy8gICAgIGl0ZW0gaWQgKGJsYW5rL2dhcCBpZHMgZm9yIHRoZSBibGFua3MgY2F0ZWdvcnksIGJsb2NrIGlkcyBlbHNld2hlcmUpLCBhbmRcbi8vICAgICBub3RoaW5nIGVsc2UgaW4gdGhlIGRhdGFiYXNlIGtub3dzIHdoYXQgYW4gaXRlbSBpZCBJUy5cbi8vXG4vLyBXSFkgVEhFIElURU0gTUFQIFJFVVNFUyBUSEUgR1JBRElORyBXQUxLIChydWxpbmcgUzctNSkuIFRoZSBzZXQgb2YgaWRzIHRoYXRcbi8vIGNhbiBhcHBlYXIgaW4gYSB2ZXJkaWN0IG1hcCBpcyBkZWNpZGVkIGJ5IE9ORSB0aGluZzogd2hhdCB0aGUgZ3JhZGVyIGFjY2VwdHNcbi8vIChpbnZlbnRvcnlTZWN0aW9uLCBzZXJ2ZXIvZ3JhZGluZy93YWxrLnRzKS4gQSBzZWNvbmQgZW51bWVyYXRpb24gd3JpdHRlbiBoZXJlXG4vLyB3b3VsZCBkcmlmdCBmcm9tIGl0IFx1MjAxNCBhbmQgZHJpZnRlZCBhdHRyaWJ1dGlvbiBpcyBzaWxlbnQsIGNvdW50aW5nIGEgc3R1ZGVudCdzXG4vLyBhbnN3ZXIgdW5kZXIgdGhlIHdyb25nIGJsb2NrIHR5cGUgb3IgZHJvcHBpbmcgaXQuIFNvIHRoaXMgbW9kdWxlIG93bnMgbm8gaWRcbi8vIHJ1bGVzIGF0IGFsbDogaXQgYXNrcyB0aGUgZ3JhZGVyJ3MgaW52ZW50b3J5IGZvciB0aGUgaWRzIGFuZCBvbmx5IHN1cHBsaWVzXG4vLyB0aGUgaWQgXHUyMTkyIGNlbnN1cy1rZXkgam9pbi4gdGVzdHMvY2Vuc3VzLnRlc3QudHMgcGlucyB0aGUgZXF1YWxpdHkuXG4vL1xuLy8gQlVORExFIE5PVEU6IHdhbGsudHMgaW1wb3J0cyBpdHMgdHdvIGNvbGxhYm9yYXRvcnMgYXMgYGltcG9ydCB0eXBlYCBvbmx5LCBzb1xuLy8gcHVsbGluZyBpdCBpbiBoZXJlIGNvc3RzIHRoZSByZWFkIGJ1bmRsZSBub3RoaW5nIGF0IHJ1bnRpbWUgXHUyMDE0IG5vIG1hdGhqcywgbm9cbi8vIHNjb3JlcnMgKHRoZSBncmFwaC1raXQvc2NvcmVycyBkaXNjaXBsaW5lLCBjaGVja2VkIGJ5IHRoZSBidW5kbGUncyBzaXplXG4vLyBjZWlsaW5nIGFuZCBhIGdyZXAtYWJzZW5jZSB0ZXN0KS5cbi8vXG4vLyAgIGRvY3VtZW50IFx1MjUwMFx1MjUwMFx1MjVCQSBlYWNoQmxvY2sgKHJvd3NcdTIxOTJjb2x1bW5zXHUyMTkyYmxvY2tzLCBjaGlsZCBibG9ja3MsIHJlZmVyZW5jZVBhbmVsKVxuLy8gICAgICAgICAgICAgICAgICAgXHUyNTAyXG4vLyAgICAgICAgICAgICAgICAgICBcdTI1MUNcdTI1MDBcdTI1QkEgY291bnRzOiAgdGFsbHkgb2YgY2Vuc3VzS2V5T2YoYmxvY2spXG4vLyAgICAgICAgICAgICAgICAgICBcdTI1MTRcdTI1MDBcdTI1QkEgaW5kZXg6ICAgYmxvY2tJZCBcdTIxOTIgY2Vuc3VzS2V5XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjVCMlxuLy8gICBzZWN0aW9ucyBcdTI1MDBcdTI1MDBcdTI1QkEgaW52ZW50b3J5U2VjdGlvbiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MTggIChibGFuay9nYXAgaWRzLCBNQy9tYXRjaGluZy9vcmRlcmluZy9cbi8vICAgICAgICAgICAgICAgICh0aGUgZ3JhZGVyJ3Mgb3duICAgICAgIGdyYXBoL2ZyZWUtdGV4dCBibG9jayBpZHMpXG4vLyAgICAgICAgICAgICAgICAgYWNjZXB0ZWQtaWQgc2V0KSAgIFx1MjUwMFx1MjUwMFx1MjVCQSBpdGVtc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHR5cGUgeyBBY3Rpdml0eURvY3VtZW50LCBCbG9jayB9IGZyb20gJ0BhY3Rpdml0eS9zY2hlbWEnO1xuaW1wb3J0IHsgY2hpbGRCbG9ja3NPZiB9IGZyb20gJy4uL2NvbnRhaW5lci9ibG9ja0luZGV4LmpzJztcbmltcG9ydCB7IGJsb2NrUmVnaXN0cnksIGNlbnN1c0tleU9mIH0gZnJvbSAnLi4vcmVnaXN0cnkvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgaW52ZW50b3J5U2VjdGlvbiB9IGZyb20gJy4uL3NlcnZlci9ncmFkaW5nL3dhbGsuanMnO1xuaW1wb3J0IHR5cGUgeyBSYXdTZWN0aW9uIH0gZnJvbSAnLi4vc2VydmVyL2dyYWRpbmcvd2Fsay5qcyc7XG5cbi8qKiBDZW5zdXMga2V5IGZvciBhIGJsb2NrIHdob3NlIHR5cGUgdGhlIHJlZ2lzdHJ5IGRvZXNuJ3Qga25vdy4gVW5yZWFjaGFibGUgZm9yXG4gKiBhIHNjaGVtYS12YWxpZCBkb2N1bWVudCAodGhlIHJlZ2lzdHJ5IGNvbXBsZXRlbmVzcyBndWFyZCBtYWtlcyBldmVyeSBibG9ja1xuICogdHlwZSByZWdpc3RlcmVkKSwgYW5kIGRlbGliZXJhdGVseSBhIFZJU0lCTEUgYnVja2V0IHJhdGhlciB0aGFuIGEgdGhyb3c6IHRoaXNcbiAqIHJ1bnMgb24gdGhlIHJlYWQgcGF0aCwgd2hlcmUgdGhlIHJ1bGVkIHdyaXRlIG9yZGVyaW5nIG1lYW5zIGEgdGhyb3duIGNlbnN1c1xuICogd291bGQgY29zdCB0aGUgdmVyc2lvbiBpdHMgY2FjaGUgcm93IG9uIGV2ZXJ5IHJlYWQuIEEgc3VyZmFjZWQgYF91bmtub3duYFxuICogcm93IGlzIGEgYnVnIHJlcG9ydDsgYSBjcmFzaCBoZXJlIHdvdWxkIGJlIGEgc2lsZW50IHBlcmZvcm1hbmNlIGNsaWZmLiAqL1xuZXhwb3J0IGNvbnN0IFVOS05PV05fQ0VOU1VTX0tFWSA9ICdfdW5rbm93bic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2Vuc3VzQ291bnQge1xuICBjZW5zdXNLZXk6IHN0cmluZztcbiAgYmxvY2tDb3VudDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENlbnN1c0l0ZW0ge1xuICAvKiogVGhlIGlkIGEgdmVyZGljdCBtYXAgaXMga2V5ZWQgYnk6IGEgYmxhbmsgaWQsIGFuIGluLWVxdWF0aW9uIGdhcCBpZFxuICAgKiAoYGdgK2hleCksIG9yIGEgZ3JhZGFibGUvcmVjb3JkZWQgYmxvY2sgaWQuICovXG4gIGl0ZW1JZDogc3RyaW5nO1xuICBjZW5zdXNLZXk6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBWZXJzaW9uQ2Vuc3VzIHtcbiAgLyoqIERvY3VtZW50IG9yZGVyIG9mIGZpcnN0IGFwcGVhcmFuY2UuICovXG4gIGNvdW50czogQ2Vuc3VzQ291bnRbXTtcbiAgaXRlbXM6IENlbnN1c0l0ZW1bXTtcbn1cblxuLyoqIFRoZSByZWdpc3RyeSdzIGtleSBydWxlLCBndWFyZGVkIG9uIGl0cyBvbmUgcHJlY29uZGl0aW9uIChhIHJlZ2lzdGVyZWRcbiAqIHR5cGUpLiBUaGUgcnVsZSBpdHNlbGYgaXMgTk9UIHJlc3RhdGVkIGhlcmUgXHUyMDE0IGNlbnN1c0tleU9mIHN0YXlzIHRoZSBzb3VyY2UsXG4gKiB2YXJpYW50IHN1ZmZpeCBpbmNsdWRlZC4gKi9cbmZ1bmN0aW9uIHNhZmVDZW5zdXNLZXkoYmxvY2s6IEJsb2NrKTogc3RyaW5nIHtcbiAgY29uc3QgdHlwZSA9IChibG9jayBhcyB7IHR5cGU/OiB1bmtub3duIH0pLnR5cGU7XG4gIGlmICh0eXBlb2YgdHlwZSAhPT0gJ3N0cmluZycgfHwgISh0eXBlIGluIGJsb2NrUmVnaXN0cnkpKSB7XG4gICAgcmV0dXJuIFVOS05PV05fQ0VOU1VTX0tFWTtcbiAgfVxuICByZXR1cm4gY2Vuc3VzS2V5T2YoYmxvY2spO1xufVxuXG4vKiogVmlzaXQgYSBibG9jayBhbmQsIGRlcHRoLWZpcnN0LCBldmVyeSBibG9jayBuZXN0ZWQgaW5zaWRlIGl0LiBDaGlsZCBibG9ja3NcbiAqIGFyZSBmb3VuZCBTVFJVQ1RVUkFMTFkgdmlhIGJsb2NrSW5kZXgncyBjaGlsZEJsb2Nrc09mIFx1MjAxNCB0aGUgZG9jdW1lbnRlZCBzaW5nbGVcbiAqIGRlZmluaXRpb24gb2YgXCJpcyB0aGlzIGEgbmVzdGVkIGJsb2NrIG9yIGNvbnRlbnQgb2YgdGhpcyBvbmU/XCIsIHNoYXJlZCB3aXRoXG4gKiB0aGUgc2VydmVkLWRvY3VtZW50IGluZGV4IGFuZCB0aGUgYW5zd2VyLWtleSBleHRyYWN0aW9uLiBBIGZhZGVkIGV4YW1wbGUnc1xuICogc3RlcHMgdGhlcmVmb3JlIGNvdW50IGFzIHRoZW1zZWx2ZXMsIGV4YWN0bHkgYXMgdGhleSBncmFkZSBhcyB0aGVtc2VsdmVzLiAqL1xuZnVuY3Rpb24gdmlzaXREZWVwKGJsb2NrOiBCbG9jaywgdmlzaXQ6IChibG9jazogQmxvY2spID0+IHZvaWQpOiB2b2lkIHtcbiAgdmlzaXQoYmxvY2spO1xuICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkQmxvY2tzT2YoYmxvY2sgYXMgdW5rbm93biBhcyBvYmplY3QpKSB7XG4gICAgdmlzaXREZWVwKGNoaWxkIGFzIHVua25vd24gYXMgQmxvY2ssIHZpc2l0KTtcbiAgfVxufVxuXG4vKiogRXZlcnkgYmxvY2sgaW5zdGFuY2UgaW4gdGhlIGRvY3VtZW50LCBpbiBkb2N1bWVudCBvcmRlcjogc2VjdGlvbiBjb250ZW50XG4gKiBmaXJzdCAocm93cyBcdTIxOTIgY29sdW1ucyBcdTIxOTIgYmxvY2tzKSwgdGhlbiB0aGUgcmVmZXJlbmNlIHBhbmVsLiBUaGUgcGFuZWwgaXNcbiAqIHNjYWZmb2xkIFx1MjAxNCBpdCBpcyBuZXZlciBjaGVja2VkLCBzbyBpdCBjb250cmlidXRlcyBjb3VudHMgYW5kIG5vIGl0ZW1zIFx1MjAxNCBidXRcbiAqIGl0IElTIGF1dGhvcmVkIGNvbnRlbnQgYSB0ZWFjaGVyIGNob3NlLCBzbyBsZWF2aW5nIGl0IG91dCB3b3VsZCB1bmRlcmNvdW50XG4gKiB3aGF0IHRoZSBhY3Rpdml0eSBhY3R1YWxseSB1c2VzLiAqL1xuZnVuY3Rpb24gZWFjaEJsb2NrKGRvYzogQWN0aXZpdHlEb2N1bWVudCwgdmlzaXQ6IChibG9jazogQmxvY2spID0+IHZvaWQpOiB2b2lkIHtcbiAgZm9yIChjb25zdCBzZWN0aW9uIG9mIGRvYy5zZWN0aW9ucyA/PyBbXSkge1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHNlY3Rpb24ucm93cyA/PyBbXSkge1xuICAgICAgZm9yIChjb25zdCBjb2x1bW4gb2Ygcm93LmNvbHVtbnMgPz8gW10pIHtcbiAgICAgICAgZm9yIChjb25zdCBibG9jayBvZiBjb2x1bW4uYmxvY2tzID8/IFtdKSB2aXNpdERlZXAoYmxvY2ssIHZpc2l0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBibG9jayBvZiBkb2MucmVmZXJlbmNlUGFuZWw/LmJsb2NrcyA/PyBbXSkgdmlzaXREZWVwKGJsb2NrLCB2aXNpdCk7XG59XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgY2Vuc3VzIG9mIGFuIFVQR1JBREVEIGRvY3VtZW50IChwb3N0LXVwZ3JhZGUsIHByZS1zYW5pdGl6ZSkuXG4gKlxuICogUHJlLXNhbml0aXplIG9uIHB1cnBvc2U6IGBvcmRlcmluZ2AncyBhdXRob3JlZCBpdGVtIG9yZGVyIGFuZCB0aGUgYmxhbmtcbiAqIGFuc3dlciBrZXlzIGFyZSBnb25lIGZyb20gdGhlIHNlcnZlZCBhcnRpZmFjdCwgYW5kIHRoZSBncmFkaW5nIGludmVudG9yeSB0aGlzXG4gKiBqb2lucyBhZ2FpbnN0IHJlYWRzIHRoZSBzYW1lIHJhdyBzaGFwZSB0aGUgZ3JhZGVyIGRvZXMuIE5vdGhpbmcgZGVyaXZlZCBoZXJlXG4gKiBpcyBzZWNyZXQgXHUyMDE0IGEgY291bnQgb2YgYmxvY2sga2luZHMgYW5kIGEgbGlzdCBvZiByZXNwb25zZSBpZHMgdGhlIGNsaWVudFxuICogYWxyZWFkeSBob2xkcyBcdTIwMTQgc28gdGhlIG91dHB1dCBjcm9zc2VzIG5vIHNhbml0aXplciBib3VuZGFyeS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNlbnN1c09mRG9jdW1lbnQoZG9jOiBBY3Rpdml0eURvY3VtZW50KTogVmVyc2lvbkNlbnN1cyB7XG4gIGNvbnN0IGNvdW50cyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG4gIGNvbnN0IGtleUJ5QmxvY2tJZCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cbiAgZWFjaEJsb2NrKGRvYywgKGJsb2NrKSA9PiB7XG4gICAgY29uc3Qga2V5ID0gc2FmZUNlbnN1c0tleShibG9jayk7XG4gICAgY291bnRzLnNldChrZXksIChjb3VudHMuZ2V0KGtleSkgPz8gMCkgKyAxKTtcbiAgICBjb25zdCBpZCA9IChibG9jayBhcyB7IGlkPzogdW5rbm93biB9KS5pZDtcbiAgICBpZiAodHlwZW9mIGlkID09PSAnc3RyaW5nJykga2V5QnlCbG9ja0lkLnNldChpZCwga2V5KTtcbiAgfSk7XG5cbiAgY29uc3QgaXRlbXM6IENlbnN1c0l0ZW1bXSA9IFtdO1xuICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IHB1c2ggPSAoaXRlbUlkOiBzdHJpbmcsIGJsb2NrSWQ6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgIGlmICghaXRlbUlkIHx8IHNlZW4uaGFzKGl0ZW1JZCkpIHJldHVybjtcbiAgICBzZWVuLmFkZChpdGVtSWQpO1xuICAgIGl0ZW1zLnB1c2goe1xuICAgICAgaXRlbUlkLFxuICAgICAgY2Vuc3VzS2V5OiBrZXlCeUJsb2NrSWQuZ2V0KGJsb2NrSWQpID8/IFVOS05PV05fQ0VOU1VTX0tFWSxcbiAgICB9KTtcbiAgfTtcblxuICBmb3IgKGNvbnN0IHNlY3Rpb24gb2YgZG9jLnNlY3Rpb25zID8/IFtdKSB7XG4gICAgLy8gJ2NvZXJjZScgb3B0cyBPVVQgb2YgdGhlIEI4L0QxMCBpbnRlZ3JpdHkgZ2F0ZSwgZGVsaWJlcmF0ZWx5OiB0aGlzIGlzXG4gICAgLy8gdGhlIFJFQUQgcGF0aCwgd2hvc2UgcnVsZWQgZmFpbHVyZSBwb3N0dXJlIGlzIHdpdGhob2xkLWFuZC1zZXJ2ZSAodGhlXG4gICAgLy8gY2FjaGUtZmlsbCBjYWxsZXIgYWxyZWFkeSBmYWlscyBzYWZlKS4gQSBjZW5zdXNlZCBtYWxmb3JtZWQgZG9jdW1lbnRcbiAgICAvLyBtZXJlbHkgbWlzY291bnRzOyBvbmx5IEdSQURJTkcgb25lIG1pbnRzIGEgd3JvbmcgbWFyaywgc28gb25seSBncmFkaW5nXG4gICAgLy8gcnVucyB0aGUgZ2F0ZS5cbiAgICBjb25zdCBpbnYgPSBpbnZlbnRvcnlTZWN0aW9uKHNlY3Rpb24gYXMgdW5rbm93biBhcyBSYXdTZWN0aW9uLCB7XG4gICAgICBpbnRlZ3JpdHk6ICdjb2VyY2UnLFxuICAgIH0pO1xuICAgIC8vIEJsYW5rcyBhbmQgbWF0aCBnYXBzIGF0dHJpYnV0ZSB0byB0aGVpciBPV05JTkcgYmxvY2sgKHRoZSB3YWxrIGFscmVhZHlcbiAgICAvLyByZXNvbHZlcyBjb250YWluZXJzIHRvIHRoZSBjaGlsZCksIHdoaWNoIGlzIHdoeSBhIGJsYW5rIGluc2lkZSBhIGZhZGVkXG4gICAgLy8gZXhhbXBsZSBjb3VudHMgYXMgZmFkZWRfd29ya2VkX2V4YW1wbGUgYW5kIG5vdCBhcyBmaWxsX2luX2JsYW5rLlxuICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgaW52LmJsYW5rR3JvdXBzQnlCbG9jaykge1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgZ3JvdXAua2V5cykgcHVzaChrZXkuaWQsIGdyb3VwLmJsb2NrSWQpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IG1jIG9mIGludi5tdWx0aXBsZUNob2ljZSkgcHVzaChtYy5ibG9ja0lkLCBtYy5ibG9ja0lkKTtcbiAgICBmb3IgKGNvbnN0IG0gb2YgaW52Lm1hdGNoaW5nKSBwdXNoKG0uYmxvY2tJZCwgbS5ibG9ja0lkKTtcbiAgICBmb3IgKGNvbnN0IG8gb2YgaW52Lm9yZGVyaW5nKSBwdXNoKG8uYmxvY2tJZCwgby5ibG9ja0lkKTtcbiAgICBmb3IgKGNvbnN0IGcgb2YgaW52LmdyYXBocykgcHVzaChnLmJsb2NrSWQsIGcuYmxvY2tJZCk7XG4gICAgZm9yIChjb25zdCBpZCBvZiBpbnYuZnJlZVRleHQpIHB1c2goaWQsIGlkKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY291bnRzOiBbLi4uY291bnRzXS5tYXAoKFtjZW5zdXNLZXksIGJsb2NrQ291bnRdKSA9PiAoe1xuICAgICAgY2Vuc3VzS2V5LFxuICAgICAgYmxvY2tDb3VudCxcbiAgICB9KSksXG4gICAgaXRlbXMsXG4gIH07XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHNhbml0aXplL3NlcnZlU2VlZC50cyBcdTIwMTQgdGhlIE9ORSBzcGVsbGluZyBvZiB0aGUgc2VydmUtc2h1ZmZsZSBzZWVkIChHMSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc2VlZCB0aGF0IGRlY2lkZXMgd2hhdCBhcnJhbmdlbWVudCBlYWNoIHN0dWRlbnQgaXMgU0VSVkVEIFx1MjAxNCBhbmRcbi8vIHRoZXJlZm9yZSB3aGF0IHRoZSBncmFkZXIgbXVzdCByZWNvbXB1dGUgdG8gdGVsbCBcImFycmFuZ2VkIGRlbGliZXJhdGVseVwiXG4vLyBmcm9tIFwibmV2ZXIgdG91Y2hlZFwiICh0aGUgb3JkZXJpbmcgb21pc3Npb24gcnVsZSkuIFVudGlsIDIwMjYtMDgtMDYgdGhlXG4vLyBjb250cmFjdCBleGlzdGVkIGFzIHR3byBzcGVsbGluZ3MgYWdyZWVpbmcgYnkgbHVjazogdGhlIHJlYWQgcGF0aCBjb21wb3NlZFxuLy8gYCR7dmVyc2lvbklkfToke3VzZXJJZH1gIGlubGluZSB3aGlsZSB0aGUgZ3JhZGluZyBzaWRlIGhhZCBpdHMgb3duXG4vLyBzZXJ2ZVNlZWQoKSAoczItcmV0cm8gZmluZGluZyA3KS4gVHdvIHN0cmluZ3MgZHJpZnRpbmcgaGVyZSB3b3VsZCBzaWxlbnRseVxuLy8gbWlzLWdyYWRlIGEgc3Vic2V0IG9mIHN0dWRlbnRzIFx1MjAxNCBjbG9zZSB0byB1bmRpYWdub3NhYmxlIGZyb20gYSBidWcgcmVwb3J0LlxuLy9cbi8vIERlcGVuZGVuY3ktZnJlZSBsZWFmIE9OIFBVUlBPU0U6IGltcG9ydGVkIGJ5IHRoZSByZWFkIGJ1bmRsZSAodGhlIGhhbmRsZXIpXG4vLyBhbmQgdGhlIGdyYWRpbmcgYnVuZGxlIChzZXJ2ZWRPcmRlciksIHNvIGl0IG11c3QgbmV2ZXIgZ3JvdyBhbiBpbXBvcnQuXG4vL1xuLy8gTkIgdGhlIHNlZWRlZCBzaHVmZmxlIGJlaGluZCB0aGlzIHNlZWQgaXMgbG9hZC1iZWFyaW5nIGZvciBTNCdzIG9yZGVyaW5nXG4vLyBvbWlzc2lvbiBydWxlIGFuZCBjYXJyaWVzIGFuIHVuZXhwbGFpbmVkIG9uZS1vZmYgZmxha2UgaW4gU1RBVEUncyB3YXRjaFxuLy8gaXRlbXMgKHNhbml0aXplLnRlc3QgXCJkaWZmZXJzIGFjcm9zcyBzdHVkZW50c1wiLCAyMDI2LTA4LTAxLCAxLWluLTE0KSBcdTIwMTQgaWZcbi8vIHRoYXQgdGVzdCBtaXNiZWhhdmVzIGFmdGVyIGFueSBjaGFuZ2UgaGVyZSwgdHJlYXQgaXQgYXMgdGhlIHNlY29uZCBzaWdodGluZy5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBDb21wb3NlIHRoZSBzZWVkIHRoZSByZWFkIHBhdGggc2VydmVzIHdpdGggYW5kIHRoZSBncmFkZXIgcmVjb21wdXRlcyBmcm9tLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlcnZlU2VlZCh2ZXJzaW9uSWQ6IHN0cmluZywgc3R1ZGVudElkOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7dmVyc2lvbklkfToke3N0dWRlbnRJZH1gO1xufVxuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBzZXJ2ZXIvand0LnRzIFx1MjAxNCB0aGUgT05FIHVudmVyaWZpZWQgYHN1YmAgcmVhZGVyIChHMilcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWNvZGVkIFdJVEhPVVQgdmVyaWZpY2F0aW9uLCBkZWxpYmVyYXRlbHk6IGJ5IHRoZSB0aW1lIGVpdGhlciBoYW5kbGVyIGNhbGxzXG4vLyB0aGlzLCBpdHMgdXNlci1zY29wZWQgUlBDIGhhcyBhbHJlYWR5IHN1Y2NlZWRlZCwgd2hpY2ggbWVhbnMgUG9zdGdSRVNUXG4vLyB2ZXJpZmllZCB0aGUgdG9rZW4ncyBzaWduYXR1cmUuIFRoaXMgb25seSByZS1yZWFkcyB0aGUgYHN1YmAgY2xhaW0gXHUyMDE0IHRvIGtleVxuLy8gdGhlIHN0dWRlbnQncyBzZXJ2ZSBzaHVmZmxlIChyZWFkIHBhdGgpIGFuZCB0aGVpciBzZWN0aW9uX2NoZWNrcyByb3dcbi8vIChjaGVjayBwYXRoKS4gTkVWRVIgYW4gYXV0aG9yaXphdGlvbiBpbnB1dC5cbi8vXG4vLyBXYXMgcGFzdGVkIGJ5dGUtaWRlbnRpY2FsbHkgaW50byBib3RoIGhhbmRsZXJzIGFzIGp3dFN1YiAvIGp3dFN1YmplY3Rcbi8vIChzMi1yZXRybyBmaW5kaW5nIDgpOyBvbmUgY29weSwgb25lIG5hbWUsIHNpbmNlIDIwMjYtMDgtMDYuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vKiogVGhlIHRva2VuJ3MgYHN1YmAgY2xhaW0sIG9yIG51bGwgd2hlbiB0aGUgaGVhZGVyIGNhcnJpZXMgbm8gcmVhZGFibGUgSldULiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGp3dFN1YihhdXRoSGVhZGVyOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgdG9rZW4gPSBhdXRoSGVhZGVyLnJlcGxhY2UoL15CZWFyZXJcXHMrL2ksICcnKTtcbiAgY29uc3QgcGF5bG9hZCA9IHRva2VuLnNwbGl0KCcuJylbMV07XG4gIGlmICghcGF5bG9hZCkgcmV0dXJuIG51bGw7XG4gIHRyeSB7XG4gICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoXG4gICAgICBhdG9iKHBheWxvYWQucmVwbGFjZSgvLS9nLCAnKycpLnJlcGxhY2UoL18vZywgJy8nKSksXG4gICAgKSBhcyB7IHN1Yj86IHVua25vd24gfTtcbiAgICByZXR1cm4gdHlwZW9mIGpzb24uc3ViID09PSAnc3RyaW5nJyA/IGpzb24uc3ViIDogbnVsbDtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2VydmVyL3V1aWQudHMgXHUyMDE0IE9ORSBpZC1zaGFwZSBydWxlIGZvciB0aGUgQVBJIHN1cmZhY2UgKEcyKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRIRSBERUNJU0lPTiAoZW5nLXJldmlldyBHMiwgMjAyNi0wOC0wNik6IFNUUklDVCBldmVyeXdoZXJlIGluIHNoYXJlZCBzZXJ2ZXJcbi8vIHNvdXJjZS4gVVVJRF9SRSBleGlzdGVkIGF0IGZvdXIgc2l0ZXMgd2l0aCB0d28gc3RyaWN0bmVzc2VzIFx1MjAxNCB0aGUgcmVhZCBBUElcbi8vIGFjY2VwdGVkIGFueSBoZXggbmliYmxlcyB3aGlsZSB0aGUgY2hlY2sgQVBJIHJlcXVpcmVkIGEgcmVhbCB2ZXJzaW9uIG5pYmJsZVxuLy8gYW5kIFJGQyB2YXJpYW50IFx1MjAxNCBzbyB0aGUgc2FtZSBhY3Rpdml0eSBpZCBjb3VsZCBiZSB2YWxpZCBvbiBvbmUgZW5kcG9pbnQgYW5kXG4vLyByZWplY3RlZCBieSB0aGUgb3RoZXIsIHdpdGggbm8gcmVjb3JkZWQgd2h5IChzMi1hdWRpdCBjb3JyZWN0aW9ucyAzLzUpLlxuLy8gRXZlcnkgbGVnaXRpbWF0ZSBpZCBpcyBhIFBvc3RncmVzIGdlbl9yYW5kb21fdXVpZCgpICh2NCwgUkZDIHZhcmlhbnQpLCBzb1xuLy8gc3RyaWN0IGNvc3RzIG5vIHJlYWwgY2xpZW50IGFueXRoaW5nIGFuZCByZWplY3RzIGdhcmJhZ2UgZWFybGllci5cbi8vXG4vLyBUaGUgdHdvIHJlbWFpbmluZyBMT09TRSBjb3BpZXMgbGl2ZSBpbiBpbmdlc3Qtc3VibWlzc2lvbiBhbmQgZ2V0LWZlZWRiYWNrJ3Ncbi8vIERlbm8gZmlsZXMsIGRlbGliZXJhdGVseSB1bnRvdWNoZWQ6IGJvdGggZnVuY3Rpb25zIHNlcnZlIG9ubHkgdGhlIGFub255bW91c1xuLy8gcHVibGlzaGVkLXBhZ2Ugd2lyZSBhbmQgYXJlIGRlbGV0ZWQgYXQgUzkgKGN1dG92ZXIgY2hlY2tsaXN0IEMxNSkgXHUyMDE0XG4vLyB0aWdodGVuaW5nIGEgc3VyZmFjZSBzY2hlZHVsZWQgZm9yIGRlbW9saXRpb24gd291bGQgYnV5IHR3byByZWRlcGxveXMgb2YgYVxuLy8gZG9vbWVkIGZ1bmN0aW9uLiBUaGVpciBjb3BpZXMgY2FycnkgYSBwb2ludGVyIGhlcmUuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vKiogUkZDIDQxMjIgdjFcdTIwMTN2NSwgdmFyaWFudCAxMHh4IFx1MjAxNCB3aGF0IGdlbl9yYW5kb21fdXVpZCgpIGFuZCBldmVyeSBsZWdpdGltYXRlXG4gKiBjbGllbnQgaWQgYWN0dWFsbHkgbG9vayBsaWtlLiAqL1xuZXhwb3J0IGNvbnN0IFVVSURfUkUgPVxuICAvXlswLTlhLWZdezh9LVswLTlhLWZdezR9LVsxLTVdWzAtOWEtZl17M30tWzg5YWJdWzAtOWEtZl17M30tWzAtOWEtZl17MTJ9JC9pO1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBzZXJ2ZXIvZ2V0LWFjdGl2aXR5LWhhbmRsZXIudHMgXHUyMDE0IHRoZSBnZXQtYWN0aXZpdHkgcmVxdWVzdCBoYW5kbGVyIChTMilcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgZnVsbCBicmFuY2hpbmcgbG9naWMgb2YgdGhlIGdldC1hY3Rpdml0eSBFZGdlIEZ1bmN0aW9uLCBleHRyYWN0ZWQgaGVyZSBzb1xuLy8gaXQgbGl2ZXMgaW4gdGhlIFRFU1RFRCwgQ0ktZHJpZnQtZ3VhcmRlZCB2aWV3ZXItc2VydmVyIGJ1bmRsZSBpbnN0ZWFkIG9mIGluXG4vLyB1bnRlc3RhYmxlIERlbm8gZ2x1ZSAodGhlIFMyIHJldmlldyBmb3VuZCB0aGUgMzc0LWxpbmUgZnVuY3Rpb24gd2FzIHRoZSBtb3N0XG4vLyBicmFuY2gtaGVhdnkgaW4gdGhlIHJlcG8gd2l0aCB6ZXJvIGF1dG9tYXRlZCBjb3ZlcmFnZSkuIFRoZSBEZW5vIGVudHJ5IHBvaW50XG4vLyAoc3VwYWJhc2UvZnVuY3Rpb25zL2dldC1hY3Rpdml0eS9pbmRleC50cykgaXMgbm93IHRoaW4gd2lyaW5nOiBpdCByZWFkcyBlbnYsXG4vLyBidWlsZHMgdGhlIFN1cGFiYXNlIGNsaWVudHMgYmVoaW5kIHRoZSBgR2V0QWN0aXZpdHlEYmAgcG9ydCwgcGFzc2VzIHRoZVxuLy8gX3NoYXJlZC9jb3JzLnRzIGhlbHBlcnMgYmVoaW5kIHRoZSBgQ29yc0tpdGAgcG9ydCwgYW5kIHNlcnZlcyB0aGUgaGFuZGxlclxuLy8gdGhpcyBmYWN0b3J5IHJldHVybnMuIEV2ZXJ5dGhpbmcgb2JzZXJ2YWJsZSBcdTIwMTQgc3RhdHVzIGNvZGVzLCBlcnJvciBjb2Rlcyxcbi8vIGNhY2hlIGhlYWRlcnMsIHJlc3BvbnNlIGVudmVsb3BlcyBcdTIwMTQgaXMgZGVjaWRlZCBIRVJFIGFuZCBwaW5uZWQgYnlcbi8vIHRlc3RzL2dldC1hY3Rpdml0eS1oYW5kbGVyLnRlc3QudHMuXG4vL1xuLy8gVGhyZWUgR0VUIG1vZGVzIG9uIG9uZSBmdW5jdGlvbjpcbi8vXG4vLyAgIDEuIE1FVEEgKGFub255bW91cywgcmF0ZS1saW1pdGVkIFx1MjAxNCBydWxpbmcgMy4yQSk6XG4vLyAgICAgICAgR0VUID9hY3Rpdml0eV9pZD08dXVpZD4mbWV0YT0xXG4vLyAgICAgIFx1MjE5MiB7IHRpdGxlLCB0ZWFjaGVyX25hbWUgfSBhbmQgTk9USElORyBlbHNlIFx1MjAxNCB0aGUgcHJlLWF1dGggaW50ZXJzdGl0aWFsXG4vLyAgICAgICAgY29udHJhY3QgKFwiTXJzLiBKYWZhcmkncyAnTGluZWFyIFN5c3RlbXMnXCIgKyBcInVzZSB5b3VyIEBkaXN0cmljdC5vcmdcbi8vICAgICAgICBhY2NvdW50XCIpLiBTYW1lIGRhdGEgYW55IHB1Ymxpc2hlZCBwYWdlIGFscmVhZHkgc2hvd3MgcHVibGljbHkuXG4vL1xuLy8gICAxYi4gQ0xBU1MgTUVUQSAoYW5vbnltb3VzLCBzYW1lIGxpbWl0ZXIgXHUyMDE0IFM5IERyb3AgMiwgRC0zL0UtMik6XG4vLyAgICAgICAgR0VUID9qb2luX2NvZGU9PGNvZGU+Jm1ldGE9MVxuLy8gICAgICBcdTIxOTIgeyBjbGFzc19uYW1lIH0gYW5kIE5PVEhJTkcgZWxzZSBcdTIwMTQgdGhlIGpvaW4gZ2F0ZSdzIFwiSm9pbiA8Y2xhc3MgbmFtZT5cIlxuLy8gICAgICAgIGluc3RlYWQgb2YgdGhlIGJhcmUgY29kZS4gUmlkZXMgVEhJUyBicmFuY2ggcmF0aGVyIHRoYW4gYSBkaXJlY3QgYW5vblxuLy8gICAgICAgIFBvc3RnUkVTVCBncmFudCBzbyB0aGUgb25lIGFub255bW91cyBzdXJmYWNlIGtlZXBzIGl0cyByZXF1ZXN0XG4vLyAgICAgICAgc2hhcGluZyAoRS0yJ3MgcmVqZWN0aW9uIHJlYXNvbikuIEVudW1lcmF0aW9uIHBvc3R1cmUgcmVjb3JkZWQgaW5cbi8vICAgICAgICAwMDMwJ3MgaGVhZGVyIChPVi00KTogY29kZXMgXHUyMjQ4Ml4yOS43LCB0aGUgbGltaXRlciBpcyBvcHBvcnR1bmlzdGljXG4vLyAgICAgICAgbm90IGEgZ3VhcmFudGVlLCBwYXlvZmYgaXMgYSBjbGFzcyBuYW1lLCByZWNvdmVyeSBpcyBCMTRcbi8vICAgICAgICByZW1vdmUtYW5kLXJlZ2VuZXJhdGU7IHJldmlzaXQgdHJpZ2dlcnMgbmFtZWQgdGhlcmUuXG4vL1xuLy8gICAyLiBSRVNPTFZFIChhdXRoZW50aWNhdGVkKTpcbi8vICAgICAgICBHRVQgP2FjdGl2aXR5X2lkPTx1dWlkPlxuLy8gICAgICBcdTIxOTIgeyBhY3Rpdml0eV9pZCwgdmVyc2lvbl9pZCwgdmVyc2lvbl9udW0sIHRpdGxlIH0gZm9yIHRoZSBDVVJSRU5UXG4vLyAgICAgICAgcHVibGlzaGVkIHZlcnNpb24uIFNlcnZlZCBgbm8tY2FjaGVgIHNvIGEgcmVwdWJsaXNoIGlzIHZpc2libGUgb24gdGhlXG4vLyAgICAgICAgbmV4dCBvcGVuIChyZXZhbGlkYXRlLCBkb24ndCByZS1kb3dubG9hZCBcdTIwMTQgc2FtZSBwb3N0dXJlIGFzIHRoZSBSMlxuLy8gICAgICAgIGxpdmUgYWxpYXMpLlxuLy9cbi8vICAgMy4gQ09OVEVOVCAoYXV0aGVudGljYXRlZCk6XG4vLyAgICAgICAgR0VUID9hY3Rpdml0eV9pZD08dXVpZD4mdmVyc2lvbl9pZD08dXVpZD5cbi8vICAgICAgXHUyMTkyIHRoZSBVUEdSQURFRCAoNEEpICsgU0FOSVRJWkVEIChUVjQtQSkgZG9jdW1lbnQgZm9yIHRoYXQgdmVyc2lvbiwgcGx1c1xuLy8gICAgICAgIHBlci1zdHVkZW50IHNlcnZlLXRpbWUgc2h1ZmZsZXMuIFRoZSBVUkwgaXMgdmVyc2lvbi1rZXllZCwgc28gdGhlXG4vLyAgICAgICAgcmVzcG9uc2UgaXMgc2VydmVkIGBwcml2YXRlLCBtYXgtYWdlPTMxNTM2MDAwLCBpbW11dGFibGVgIFx1MjAxNCB0aGVcbi8vICAgICAgICBicm93c2VyIG5ldmVyIHJlZmV0Y2hlcyBhIHZlcnNpb24gaXQgaGFzLiBPbmx5IHRoZSBDVVJSRU5UIHZlcnNpb24gaXNcbi8vICAgICAgICBzZXJ2ZWQgKGEgc3RhbGUgdmVyc2lvbl9pZCA0MDRzIHdpdGggY29kZSAnc3RhbGVfdmVyc2lvbic7IHRoZSB2aWV3ZXJcbi8vICAgICAgICByZS1yZXNvbHZlcyksIHNvIGEgcmVwdWJsaXNoIGludmFsaWRhdGVzIGJ5IGNoYW5naW5nIHRoZSBVUkwsIG5ldmVyXG4vLyAgICAgICAgYnkgZXhwaXJpbmcgYSBjYWNoZS5cbi8vXG4vLyBQaXBlbGluZSAoY29udGVudCBtb2RlKTogZ2V0X3B1Ymxpc2hlZF9hY3Rpdml0eSBSUEMgYXMgdGhlIENBTExFUiAodGhlIERCXG4vLyBlbmZvcmNlcyBhdXRoICsgcHVibGlzaGVkLW9ubHk7IGRyYWZ0IGNvbnRlbnQgaXMgdW5yZWFjaGFibGUgaGVyZSkgXHUyMTkyXG4vLyBkdXJhYmxlIHBlci12ZXJzaW9uIGNhY2hlIGxvb2t1cCBpbiBhY3Rpdml0eV92ZXJzaW9uX3JlYWRzIGtleWVkIGJ5XG4vLyAodmVyc2lvbl9pZCwgU0FOSVRJWkVSX1JFVikgXHUyMTkyIG9uIG1pc3MgdGhlIGNhY2hlLWZpbGwgcGF0aCBiZWxvdyBcdTIxOTJcbi8vIGFwcGx5U2VydmVTaHVmZmxlcyBzZWVkZWQgYCR7dmVyc2lvbl9pZH06JHt1c2VyX2lkfWAgKGRldGVybWluaXN0aWM6IHJlbG9hZHNcbi8vIG5ldmVyIHJlc2h1ZmZsZTsgdGhlIGNhY2hlZCBhcnRpZmFjdCBzdGF5cyBzdHVkZW50LWluZGVwZW5kZW50KS5cbi8vXG4vLyAgIGNhY2hlIE1JU1MgXHUyNTAwXHUyNTAwXHUyNUJBIHJlYWRWZXJzaW9uIFx1MjUwMFx1MjUwMFx1MjVCQSB1cGdyYWRlIFx1MjUwMFx1MjUwMFx1MjVCQSBzYW5pdGl6ZVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyNTAyXG4vLyAgICAgICAgICAgICAgICAgICAgXHUyNTBDXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTE4XG4vLyAgICAgICAgICAgICAgICAgICAgXHUyNUJDXG4vLyAgICAgICAgICAgICAgd3JpdGVDZW5zdXMgKFM3KSBcdTI1MDBcdTI1MDBmYWlsc1x1MjUwMFx1MjUwMFx1MjVCQSBOTyBjYWNoZSByb3c6IG5leHQgcmVhZCByZXRyaWVzXG4vLyAgICAgICAgICAgICAgICAgICAgXHUyNTAyIG9rICAgICAgICAgICAgICAgICAgKHNlbGYtaGVhbGluZzsgc2VlIHRoZSBvcmRlcmluZ1xuLy8gICAgICAgICAgICAgICAgICAgIFx1MjVCQyAgICAgICAgICAgICAgICAgICAgICBub3RlIGF0IHRoZSBjYWxsIHNpdGUpXG4vLyAgICAgICAgICAgICAgdXBzZXJ0Q2FjaGUgXHUyNTAwXHUyNTAwXHUyNUJBIGRlbGV0ZVN0YWxlQ2FjaGUgKG9sZC1yZXYgR0MgZm9yIHRoaXMgdmVyc2lvbilcbi8vXG4vLyBUaGUgYW5hbHl0aWNzIHdyaXRlcyBhcmUgYSBTSURFLUNIQU5ORUw6IGV2ZXJ5IG9uZSBvZiB0aGVtIGNhbiBmYWlsIHdpdGhvdXRcbi8vIGNoYW5naW5nIHRoZSBzdHVkZW50J3MgcmVzcG9uc2UuIEEgY2FjaGUgSElUIGRvZXMgbm9uZSBvZiB0aGlzIHdvcmsuXG4vL1xuLy8gQWNjZXNzIHJ1bGUgKFMyIGRlY2lzaW9uIDIpOiBBTlkgYXV0aGVudGljYXRlZCB1c2VyIChzdHVkZW50IG9yIHRlYWNoZXIpIG1heVxuLy8gcmVhZCB0aGUgcHVibGlzaGVkIGN1cnJlbnQgdmVyc2lvbiBvZiBhIG5vbi1kZWxldGVkIGFjdGl2aXR5IFx1MjAxNCB0aGUgUjJcbi8vIGxpbmstc2hhcmUgbW9kZWwgYmVoaW5kIHNpZ24taW4uIENsYXNzZXMgZ2F0ZSBpZGVudGl0eSAodGhlIDEzKyBhc3NlcnRpb24pLFxuLy8gbm90IGFjdGl2aXR5IGFjY2Vzcy5cbi8vXG4vLyBLbm93biByZXNpZHVhbCAoZG9jdW1lbnRlZCwgYWNjZXB0ZWQpOiB0aGUgYnJvd3NlciBIVFRQIGNhY2hlIGlzIHBlclxuLy8gcHJvZmlsZSwgbm90IHBlciBhY2NvdW50LiBPbiBhIHNoYXJlZCBDaHJvbWVib29rIHByb2ZpbGUsIHN0dWRlbnQgQiBjYW4gYmVcbi8vIHNlcnZlZCBzdHVkZW50IEEncyBjYWNoZWQgY29udGVudCByZXNwb25zZSBcdTIwMTQgaWRlbnRpY2FsIGV4Y2VwdCB0aGUgb3JkZXJpbmdcbi8vIHBlcm11dGF0aW9uIChzZWVkZWQgcGVyIHN0dWRlbnQpLiBObyBrZXkgbWF0ZXJpYWwgZGlmZmVycywgYW5kIGdyYWRpbmdcbi8vIHJlZmVyZW5jZXMgaXRlbSBpZHMgKG9yZGVyLWluZGVwZW5kZW50KSwgc28gdGhlIHdvcnN0IGNhc2UgaXMgYSBjb3NtZXRpY1xuLy8gcGVybXV0YXRpb24gc3dhcDsgUzEncyBzaWduT3V0RXZlcnl0aGluZyBwdXJnZXMgdmlld2VyIFNUT1JBR0UsIG5vdCB0aGVcbi8vIEhUVFAgY2FjaGUsIGFuZCBwdXR0aW5nIHRoZSB1c2VyIGlkIGluIHRoZSBVUkwgdG8gc3BsaXQgY2FjaGUga2V5cyB3b3VsZFxuLy8gbGVhayBhbiBpZGVudGlmaWVyIGludG8gbG9ncyBmb3Igbm8gc2VjdXJpdHkgZ2Fpbi5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IFVwZ3JhZGVFcnJvciwgdXBncmFkZUFjdGl2aXR5RG9jdW1lbnQgfSBmcm9tICdAYWN0aXZpdHkvc2NoZW1hJztcbmltcG9ydCB7IGNlbnN1c09mRG9jdW1lbnQgfSBmcm9tICcuLi9jZW5zdXMvY2Vuc3VzLmpzJztcbmltcG9ydCB0eXBlIHsgVmVyc2lvbkNlbnN1cyB9IGZyb20gJy4uL2NlbnN1cy9jZW5zdXMuanMnO1xuaW1wb3J0IHsgU0FOSVRJWkVSX1JFViwgc2FuaXRpemVBY3Rpdml0eURvY3VtZW50IH0gZnJvbSAnLi4vc2FuaXRpemUvc2FuaXRpemUuanMnO1xuaW1wb3J0IHsgc2VydmVTZWVkIH0gZnJvbSAnLi4vc2FuaXRpemUvc2VydmVTZWVkLmpzJztcbmltcG9ydCB7IGp3dFN1YiB9IGZyb20gJy4vand0LmpzJztcbmltcG9ydCB7IFVVSURfUkUgfSBmcm9tICcuL3V1aWQuanMnO1xuaW1wb3J0IHsgYXBwbHlTZXJ2ZVNodWZmbGVzIH0gZnJvbSAnLi4vc2FuaXRpemUvc2h1ZmZsZS5qcyc7XG5pbXBvcnQgdHlwZSB7IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQgfSBmcm9tICcuLi9zYW5pdGl6ZS9zYW5pdGl6ZWQtdHlwZXMuanMnO1xuXG4vKiogQnVtcCB3aGVuIHRoZSByZXNwb25zZSBlbnZlbG9wZSBjaGFuZ2VzIHNoYXBlICh0aGUgZG9jIElOU0lERSBpdCBpc1xuICogdmVyc2lvbmVkIGJ5IHRoZSBzY2hlbWEgKyBTQU5JVElaRVJfUkVWLCBub3QgYnkgdGhpcykuICovXG5leHBvcnQgY29uc3QgQVBJX1ZFUlNJT04gPSAxO1xuXG4vLyBVVUlEX1JFIGlzIGltcG9ydGVkIChzZXJ2ZXIvdXVpZC50cywgRzIpOiB0aGlzIGZpbGUncyBsb29zZSBsb2NhbCBjb3B5XG4vLyBhY2NlcHRlZCBpZHMgdGhlIGNoZWNrIEFQSSByZWplY3RlZCBcdTIwMTQgb25lIHNoYXBlIHJ1bGUgbm93LCBzdHJpY3QuXG5cbi8vIC0tLS0gUG9ydHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgaGFuZGxlciBuZXZlciB0b3VjaGVzIHN1cGFiYXNlLWpzIG9yIERlbm8gZGlyZWN0bHk7IHRoZSBlbnRyeSBwb2ludFxuLy8gaW1wbGVtZW50cyB0aGVzZSBhZ2FpbnN0IHRoZSByZWFsIGNsaWVudHMsIHRlc3RzIGltcGxlbWVudCB0aGVtIHdpdGggZmFrZXMuXG5cbi8qKiBUaGUgYHsgZGF0YSwgZXJyb3IgfWAgc2hhcGUgZXZlcnkgc3VwYWJhc2UtanMgcXVlcnkgcmVzb2x2ZXMgdG8uICovXG5leHBvcnQgaW50ZXJmYWNlIERiUmVzdWx0PFQ+IHtcbiAgZGF0YTogVCB8IG51bGw7XG4gIGVycm9yOiB7IG1lc3NhZ2U/OiBzdHJpbmcgfSB8IG51bGw7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVibGlzaGVkQWN0aXZpdHlSb3cge1xuICB2ZXJzaW9uX2lkOiBzdHJpbmc7XG4gIHZlcnNpb25fbnVtOiBudW1iZXI7XG4gIHRpdGxlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2V0QWN0aXZpdHlEYiB7XG4gIC8qKiBgZ2V0X2FjdGl2aXR5X3B1YmxpY19tZXRhYCBSUEMgYXMgYW5vbiAocG9zdGdyZXMtb3duZWQgREVGSU5FUjsgMDAxN1xuICAgKiBkb2N1bWVudHMgdGhlIGRlbGliZXJhdGUgZ3JhbnQgXHUyMDE0IG9uZSBvZiBleGFjdGx5IFRXTyBhbm9uIFJQQ3Mgc2luY2VcbiAgICogMDAzMCwgd2l0aCBjbGFzc01ldGEncyBiZWxvdzsgdmVyaWZ5LTAwMTcgXHUwMEE3RCArIHZlcmlmeS0wMDI4IFx1MDBBN0EgYm90aCBwaW5cbiAgICogdGhlIHJvc3RlcikuICovXG4gIHB1YmxpY01ldGEoXG4gICAgYWN0aXZpdHlJZDogc3RyaW5nLFxuICApOiBQcm9taXNlPERiUmVzdWx0PHsgdGl0bGU6IHN0cmluZzsgdGVhY2hlcl9uYW1lOiBzdHJpbmcgfCBudWxsIH0+PjtcbiAgLyoqIGBnZXRfY2xhc3NfcHVibGljX21ldGFgIFJQQyBhcyBhbm9uICgwMDMwOyB0aGUgam9pbiBnYXRlJ3MgcHJlLWF1dGhcbiAgICogY2xhc3MtbmFtZSBsb29rdXAgXHUyMDE0IHRoZSByb3N0ZXIncyBTRUNPTkQgYW5vbiBSUEMsIGFzc2VydGVkIGluXG4gICAqIHZlcmlmeS0wMDI4IFx1MDBBN0EpLiAqL1xuICBjbGFzc01ldGEoam9pbkNvZGU6IHN0cmluZyk6IFByb21pc2U8RGJSZXN1bHQ8eyBuYW1lOiBzdHJpbmcgfT4+O1xuICAvKiogYGdldF9wdWJsaXNoZWRfYWN0aXZpdHlgIFJQQyBhcyB0aGUgQ0FMTEVSIChBdXRob3JpemF0aW9uIGhlYWRlciBwYXNzZWRcbiAgICogdGhyb3VnaCksIHNvIHRoZSBEQiBlbmZvcmNlcyBhdXRoICsgcHVibGlzaGVkLW9ubHkgXHUyMDE0IG5vdCB0aGlzIGhhbmRsZXIuICovXG4gIHB1Ymxpc2hlZEFjdGl2aXR5KFxuICAgIGF1dGhIZWFkZXI6IHN0cmluZyxcbiAgICBhY3Rpdml0eUlkOiBzdHJpbmcsXG4gICk6IFByb21pc2U8RGJSZXN1bHQ8UHVibGlzaGVkQWN0aXZpdHlSb3c+PjtcbiAgLyoqIENhY2hlIHJvdyBmcm9tIGFjdGl2aXR5X3ZlcnNpb25fcmVhZHMgKHNlcnZpY2Ugcm9sZSkuICovXG4gIHJlYWRDYWNoZShcbiAgICB2ZXJzaW9uSWQ6IHN0cmluZyxcbiAgICBzYW5pdGl6ZXJSZXY6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxEYlJlc3VsdDx7IGNvbnRlbnQ6IHVua25vd24gfT4+O1xuICAvKiogVmVyc2lvbiByb3cgZnJvbSBhY3Rpdml0eV92ZXJzaW9ucyAoc2VydmljZSByb2xlKS4gKi9cbiAgcmVhZFZlcnNpb24odmVyc2lvbklkOiBzdHJpbmcpOiBQcm9taXNlPERiUmVzdWx0PHsgY29udGVudDogdW5rbm93biB9Pj47XG4gIC8qKiBVcHNlcnQga2V5ZWQgKHZlcnNpb25faWQsIHNhbml0aXplcl9yZXYpIFx1MjAxNCBjb25jdXJyZW50IG1pc3NlcyB3cml0ZSB0aGVcbiAgICogc2FtZSBkZXRlcm1pbmlzdGljIGFydGlmYWN0LCBzbyBsYXN0LXdyaXRlLXdpbnMgaXMgaGFybWxlc3MuICovXG4gIHVwc2VydENhY2hlKHJvdzoge1xuICAgIHZlcnNpb25faWQ6IHN0cmluZztcbiAgICBzYW5pdGl6ZXJfcmV2OiBzdHJpbmc7XG4gICAgc2NoZW1hX3ZlcnNpb246IG51bWJlcjtcbiAgICBjb250ZW50OiB1bmtub3duO1xuICB9KTogUHJvbWlzZTx7IGVycm9yOiB7IG1lc3NhZ2U/OiBzdHJpbmcgfSB8IG51bGwgfT47XG4gIC8qKiBSZXBsYWNlIHRoaXMgdmVyc2lvbidzIGNlbnN1cyArIGl0ZW0tYXR0cmlidXRpb24gcm93cyAoUzcpLiBJZGVtcG90ZW50OlxuICAgKiB0aGUgY2Vuc3VzIGlzIGEgcHVyZSBmdW5jdGlvbiBvZiBhbiBpbW11dGFibGUgdmVyc2lvbiwgc28gYSByZS1ydW4gd3JpdGVzXG4gICAqIGlkZW50aWNhbCByb3dzLiAqL1xuICB3cml0ZUNlbnN1cyhcbiAgICB2ZXJzaW9uSWQ6IHN0cmluZyxcbiAgICBjZW5zdXM6IFZlcnNpb25DZW5zdXMsXG4gICk6IFByb21pc2U8eyBlcnJvcjogeyBtZXNzYWdlPzogc3RyaW5nIH0gfCBudWxsIH0+O1xuICAvKiogRGVsZXRlIHRoaXMgdmVyc2lvbidzIGNhY2hlIHJvd3Mgd3JpdHRlbiB1bmRlciBhbnkgT1RIRVIgc2FuaXRpemVyIHJldiBcdTIwMTRcbiAgICogdGhlIGV4YWN0IGhhbGYgb2YgdGhlIFI2KGEpIEdDLiBPbmx5IHRoaXMgY29kZSBrbm93cyB0aGUgY3VycmVudCByZXYsIHNvXG4gICAqIG9ubHkgdGhpcyBjb2RlIGNhbiBiZSBwcmVjaXNlIGFib3V0IGl0OyB0aGUgc2NoZWR1bGVkIGpvYiBzd2VlcHMgdGhlIHRhaWxcbiAgICogb2YgdmVyc2lvbnMgdGhhdCBhcmUgbmV2ZXIgcmVhZCBhZ2Fpbi4gKi9cbiAgZGVsZXRlU3RhbGVDYWNoZShcbiAgICB2ZXJzaW9uSWQ6IHN0cmluZyxcbiAgICBrZWVwUmV2OiBzdHJpbmcsXG4gICk6IFByb21pc2U8eyBlcnJvcjogeyBtZXNzYWdlPzogc3RyaW5nIH0gfCBudWxsIH0+O1xufVxuXG4vKiogVGhlIF9zaGFyZWQvY29ycy50cyBoZWxwZXIgc3VyZmFjZSAoZW52LXJlYWRpbmcsIHNvIGl0IHN0YXlzIERlbm8tc2lkZSkuICovXG5leHBvcnQgaW50ZXJmYWNlIENvcnNLaXQge1xuICBjb3JzSGVhZGVycyhyZXE6IFJlcXVlc3QpOiBIZWFkZXJzSW5pdDtcbiAgaGFuZGxlUHJlZmxpZ2h0KHJlcTogUmVxdWVzdCk6IFJlc3BvbnNlIHwgbnVsbDtcbiAganNvblJlc3BvbnNlKHJlcTogUmVxdWVzdCwgYm9keTogdW5rbm93biwgaW5pdD86IFJlc3BvbnNlSW5pdCk6IFJlc3BvbnNlO1xuICBlcnJvclJlc3BvbnNlKFxuICAgIHJlcTogUmVxdWVzdCxcbiAgICBzdGF0dXM6IG51bWJlcixcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgZGV0YWlscz86IHVua25vd24sXG4gICk6IFJlc3BvbnNlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEdldEFjdGl2aXR5SGFuZGxlckRlcHMge1xuICBkYjogR2V0QWN0aXZpdHlEYjtcbiAgY29yczogQ29yc0tpdDtcbiAgLyoqIEluamVjdGFibGUgY2xvY2sgZm9yIHRoZSByYXRlIGxpbWl0ZXIgKHRlc3RzKS4gRGVmYXVsdHMgdG8gRGF0ZS5ub3cuICovXG4gIG5vdz86ICgpID0+IG51bWJlcjtcbn1cblxuLy8gLS0tLSBNZXRhLWJyYW5jaCByYXRlIGxpbWl0aW5nIChwZXIgaXNvbGF0ZSBcdTIwMTQgTUVBU1VSRUQgQVMgTkVBUkxZIElORVJUKSAtLS0tXG4vLyBBIHNsaWRpbmcgb25lLW1pbnV0ZSB3aW5kb3cgcGVyIGNsaWVudCBJUC5cbi8vXG4vLyBSRUFEIFRISVMgQkVGT1JFIENIQU5HSU5HIFRIRSBUSFJFU0hPTEQgT1IgR0lWSU5HIFRISVMgU0hBUkVEIFNUQVRFLlxuLy9cbi8vICoqIEEgQ0xBU1NST09NIElTIE9ORSBJUC4gKiogRXZlcnkgc3R1ZGVudCBpbiBhIHNjaG9vbCBzaXRzIGJlaGluZCB0aGUgc2FtZVxuLy8gTkFULCBzbyBcIm9wZW4gdGhpcyBsaW5rIG5vd1wiIHByb2R1Y2VzIG9uZSBtZXRhIHJlcXVlc3QgcGVyIHN0dWRlbnQgXHUyMDE0IDMwK1xuLy8gd2l0aGluIHNlY29uZHMsIGh1bmRyZWRzIHBlciBtaW51dGUgYXQgYSBiZWxsIGNoYW5nZSBhY3Jvc3MgYSBjYW1wdXMgXHUyMDE0IGFsbFxuLy8gZnJvbSBhIFNJTkdMRSBhZGRyZXNzLiBBIHBlci1wZXJzb24gdGhyZXNob2xkIGlzIHRoZXJlZm9yZSBvZmYgYnkgfjIgb3JkZXJzXG4vLyBvZiBtYWduaXR1ZGUgYWdhaW5zdCB0aGUgcmVhbCB0b3BvbG9neSwgYW5kIHRoaXMgZW5kcG9pbnQgc2VydmVzIHRoZSBQUkUtQVVUSFxuLy8gaW50ZXJzdGl0aWFsOiBhIDQyOSBoZXJlIGlzIHRoZSBmaXJzdCBzY3JlZW4gYSBzdHVkZW50IGV2ZXIgc2VlcywgYmVmb3JlIHRoZXlcbi8vIGNhbiBldmVuIHNpZ24gaW4uIFRoZSBmYWlsdXJlIHdvdWxkIHByZXNlbnQgYXMgXCJzb21lIHN0dWRlbnRzIGNhbid0IG9wZW4gdGhlXG4vLyBhY3Rpdml0eSwgb3RoZXJzIGNhbiwgYXBwYXJlbnRseSBhdCByYW5kb21cIiBcdTIwMTQgbWlzZXJhYmxlIHRvIGRpYWdub3NlIG1pZC1jbGFzcy5cbi8vIFRoZSBjZWlsaW5nIGJlbG93IGlzIGRlbGliZXJhdGVseSBnZW5lcm91cyBmb3IgdGhhdCByZWFzb24uIFJBSVNJTkcgaXQgaXNcbi8vIHNhZmU7IExPV0VSSU5HIGl0IHRvd2FyZCBhIHBlci1wZXJzb24gbnVtYmVyIGlzIHRoZSBidWcuXG4vL1xuLy8gVGhpcyBjb25zdHJhaW50IGlzIG5vdCBzcGVjaWZpYyB0byB0aGlzIGZ1bmN0aW9uOiBwZXItSVAgbGltaXRpbmcgaXMgdGhlXG4vLyB3cm9uZyBwcmltaXRpdmUgYW55d2hlcmUgaW4gdGhpcyBwcm9kdWN0LCBiZWNhdXNlIG91ciB1c2VycyBhcnJpdmUgdGhpcnR5LWF0LVxuLy8gYS10aW1lIGZyb20gb25lIGFkZHJlc3MuIFNlZSBERUNJU0lPTlMubWQgXHUyMTkyIFwiUmVhZCBBUEkgUzJcIiAocmF0ZS1saW1pdFxuLy8gZmluZGluZykgYmVmb3JlIHJlYWNoaW5nIGZvciBJUC1iYXNlZCB0aHJvdHRsaW5nIGVsc2V3aGVyZS5cbi8vXG4vLyBNRUFTVVJFRCAyMDI2LTA3LTI4IG9uIHRoZSBsaXZlIGRlcGxveW1lbnQ6IDk1IHNlcXVlbnRpYWwgYW5vbnltb3VzIHJlcXVlc3RzXG4vLyBmcm9tIE9ORSBJUCBwcm9kdWNlZCBaRVJPIDQyOXMuIFN1cGFiYXNlJ3MgRWRnZSBSdW50aW1lIHJlY3ljbGVzIGlzb2xhdGVzXG4vLyBhZ2dyZXNzaXZlbHksIHNvIHRoaXMgcGVyLWhhbmRsZXIgTWFwIGlzIGVtcHR5IG9uIG1vc3QgcmVxdWVzdHMgXHUyMDE0IHRoZVxuLy8gZWZmZWN0aXZlIGxpbWl0IGlzIGZhciBsb29zZXIgdGhhbiB0aGUgY29uc3RhbnRzIGltcGx5LCBhbmQgb24gYSBkaXN0cmlidXRlZFxuLy8gYnVyc3QgaXQgaXMgbm8gbGltaXQgYXQgYWxsLiBTbyB0aGlzIGlzIG9wcG9ydHVuaXN0aWMgdGhyb3R0bGluZyBvZiBhIHNpbmdsZVxuLy8gaG90IGlzb2xhdGUsIE5PVCBhIGd1YXJhbnRlZSBcdTIwMTQgZG8gbm90IGRlc2NyaWJlIGl0IGFzIG9uZS5cbi8vXG4vLyBLZXB0IHJhdGhlciB0aGFuIGRlbGV0ZWQgYmVjYXVzZSBpdCBjb3N0cyBub3RoaW5nIGFuZCBkb2VzIGJsdW50IGEgcnVuYXdheVxuLy8gY2xpZW50LiBXaGF0IGl0IGd1YXJkcyBpcyB0aGUgdGl0bGUgKyB0ZWFjaGVyIGRpc3BsYXkgbmFtZSBvZiBhIFBVQkxJU0hFRFxuLy8gYWN0aXZpdHksIHRvIGEgY2FsbGVyIHdobyBhbHJlYWR5IGhvbGRzIGl0cyBVVUlEIFx1MjAxNCBkYXRhIGV2ZXJ5IHB1Ymxpc2hlZCBwYWdlXG4vLyBzaG93cyBwdWJsaWNseSB0b2RheSwgd2l0aCBVVUlEIGVudW1lcmF0aW9uIGluZmVhc2libGUuXG4vL1xuLy8gSWYgYSBSRUFMIGxpbWl0IGlzIGV2ZXIgbmVlZGVkICh0cmlnZ2VyOiB0aGlzIHJlc3BvbnNlIHN0YXJ0cyByZXR1cm5pbmdcbi8vIGFueXRoaW5nIHJpY2hlciB0aGFuIHRob3NlIHR3byBmaWVsZHMpLCBpdCBtdXN0IG1vdmUgdG8gc2hhcmVkIHN0YXRlIFx1MjAxNCBhXG4vLyBzbWFsbCBEQiBjb3VudGVyIHRhYmxlIFx1MjAxNCBiZWNhdXNlIG5vIGluLW1lbW9yeSBzY2hlbWUgY2FuIHdvcmsgaGVyZS4gUG9ydCB0aGVcbi8vIFNDSE9PTC1TQUZFIGNlaWxpbmcgd2l0aCBpdDsgZG8gbm90IHJlaW50cm9kdWNlIGEgcGVyLXBlcnNvbiBudW1iZXIuXG4vL1xuLy8gVGhlIGF1dGhlZCBicmFuY2hlcyBhcmUgTk9UIHJhdGUtbGltaXRlZCBoZXJlOyB0aGUgSldUIGlzIHRoZWlyIGdhdGUuXG5cbi8qKiBKb2luLWNvZGUgcmVxdWVzdCBzaGFwaW5nOiAwMDE0IG1pbnRzIDYgY2hhcnMgZnJvbSBhIDMxLWNoYXIgYWxwaGFiZXQsIGJ1dFxuICogdGhlIGdhdGUgaGVyZSBpcyBkZWxpYmVyYXRlbHkgbG9vc2VyIChhbnkgNFx1MjAxMzEyIGFscGhhbnVtZXJpY3MpIFx1MjAxNCB0aGUgUlBDJ3NcbiAqIG5vcm1hbGl6ZWQgbG9va3VwIGlzIHRoZSByZWFsIGp1ZGdlOyB0aGlzIG9ubHkgYm91bmNlcyBnYXJiYWdlIGJlZm9yZSBpdFxuICogY29zdHMgYSByb3VuZCB0cmlwLiBUaWdodGVuaW5nIHRoaXMgdG8gdG9kYXkncyBtaW50IGZvcm1hdCB3b3VsZCB0dXJuIGFcbiAqIGZ1dHVyZSBjb2RlLWZvcm1hdCBjaGFuZ2UgaW50byBhIHNpbGVudCA0MDAuICovXG5leHBvcnQgY29uc3QgSk9JTl9DT0RFX1JFID0gL15bQS1aYS16MC05XXs0LDEyfSQvO1xuXG5leHBvcnQgY29uc3QgTUVUQV9XSU5ET1dfTVMgPSA2MF8wMDA7XG4vKiogU2Nob29sLXNhZmUgY2VpbGluZzogc2l6ZWQgZm9yIGEgd2hvbGUgY2FtcHVzIGJlaGluZCBvbmUgTkFUIGF0IGEgYmVsbFxuICogY2hhbmdlLCBub3QgZm9yIG9uZSBwZXJzb24uIFNlZSB0aGUgdG9wb2xvZ3kgbm90ZSBhYm92ZS4gKi9cbmV4cG9ydCBjb25zdCBNRVRBX01BWF9QRVJfV0lORE9XID0gNjAwO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWV0YVJhdGVMaW1pdGVyKFxuICBub3c6ICgpID0+IG51bWJlciA9IERhdGUubm93LFxuKTogKGlwOiBzdHJpbmcpID0+IGJvb2xlYW4ge1xuICBjb25zdCBtZXRhSGl0cyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXJbXT4oKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIG1ldGFSYXRlTGltaXRlZChpcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdCA9IG5vdygpO1xuICAgIGNvbnN0IGhpdHMgPSAobWV0YUhpdHMuZ2V0KGlwKSA/PyBbXSkuZmlsdGVyKFxuICAgICAgKGhpdCkgPT4gdCAtIGhpdCA8IE1FVEFfV0lORE9XX01TLFxuICAgICk7XG4gICAgaWYgKGhpdHMubGVuZ3RoID49IE1FVEFfTUFYX1BFUl9XSU5ET1cpIHtcbiAgICAgIG1ldGFIaXRzLnNldChpcCwgaGl0cyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaGl0cy5wdXNoKHQpO1xuICAgIG1ldGFIaXRzLnNldChpcCwgaGl0cyk7XG4gICAgLy8gQm91bmQgdGhlIG1hcCBzbyBhIHNjYW4gYWNyb3NzIG1hbnkgSVBzIGNhbid0IGdyb3cgbWVtb3J5IHVuYm91bmRlZC5cbiAgICBpZiAobWV0YUhpdHMuc2l6ZSA+IDEwXzAwMCkgbWV0YUhpdHMuY2xlYXIoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG59XG5cbi8vIGp3dFN1YiBpcyBpbXBvcnRlZCAoc2VydmVyL2p3dC50cywgRzIpIFx1MjAxNCBpdCB3YXMgcGFzdGVkIGJ5dGUtaWRlbnRpY2FsbHlcbi8vIGludG8gYm90aCBoYW5kbGVyczsgc2VlIHRoYXQgbGVhZiBmb3IgdGhlIG5vLXZlcmlmaWNhdGlvbiByZWFzb25pbmcuXG5cbi8vIC0tLS0gVGhlIGhhbmRsZXIgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVHZXRBY3Rpdml0eUhhbmRsZXIoXG4gIGRlcHM6IEdldEFjdGl2aXR5SGFuZGxlckRlcHMsXG4pOiAocmVxOiBSZXF1ZXN0KSA9PiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gIGNvbnN0IHsgZGIsIGNvcnMgfSA9IGRlcHM7XG4gIGNvbnN0IG1ldGFSYXRlTGltaXRlZCA9IGNyZWF0ZU1ldGFSYXRlTGltaXRlcihkZXBzLm5vdyA/PyBEYXRlLm5vdyk7XG5cbiAgcmV0dXJuIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZUdldEFjdGl2aXR5KHJlcTogUmVxdWVzdCk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICBjb25zdCBwcmVmbGlnaHQgPSBjb3JzLmhhbmRsZVByZWZsaWdodChyZXEpO1xuICAgIGlmIChwcmVmbGlnaHQpIHJldHVybiBwcmVmbGlnaHQ7XG4gICAgaWYgKHJlcS5tZXRob2QgIT09ICdHRVQnKSB7XG4gICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDA1LCAnTWV0aG9kIG5vdCBhbGxvd2VkJyk7XG4gICAgfVxuXG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsKTtcbiAgICBjb25zdCBhY3Rpdml0eUlkID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ2FjdGl2aXR5X2lkJykgPz8gJyc7XG4gICAgY29uc3QgdmVyc2lvbklkID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ3ZlcnNpb25faWQnKTtcbiAgICBjb25zdCBtZXRhT25seSA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KCdtZXRhJykgPT09ICcxJztcbiAgICBjb25zdCBqb2luQ29kZSA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KCdqb2luX2NvZGUnKTtcblxuICAgIC8vIC0tLS0gMWIuIENMQVNTIE1FVEEgKGFub255bW91cykgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gSGFuZGxlZCBiZWZvcmUgdGhlIGFjdGl2aXR5X2lkIHNoYXBlIGNoZWNrOiB0aGlzIGJyYW5jaCBoYXMgbm9cbiAgICAvLyBhY3Rpdml0eS4gam9pbl9jb2RlIGV4aXN0cyBPTkxZIGFzIGEgbWV0YSBsb29rdXAgXHUyMDE0IGFueSBvdGhlciB1c2Ugb2YgdGhlXG4gICAgLy8gcGFyYW0gaXMgYSBtYWxmb3JtZWQgcmVxdWVzdCwgbm90IGEgbW9kZS5cbiAgICBpZiAoam9pbkNvZGUgIT09IG51bGwpIHtcbiAgICAgIGlmICghbWV0YU9ubHkpIHtcbiAgICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQwMCwgJ2pvaW5fY29kZSByZXF1aXJlcyBtZXRhPTEnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvZGUgPSBqb2luQ29kZS50cmltKCk7XG4gICAgICBpZiAoIUpPSU5fQ09ERV9SRS50ZXN0KGNvZGUpKSB7XG4gICAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDAsICdqb2luX2NvZGUgbXVzdCBiZSBhIGNsYXNzIGNvZGUnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGlwID1cbiAgICAgICAgcmVxLmhlYWRlcnMuZ2V0KCd4LWZvcndhcmRlZC1mb3InKT8uc3BsaXQoJywnKVswXT8udHJpbSgpID8/ICd1bmtub3duJztcbiAgICAgIC8vIFRoZSBTQU1FIGxpbWl0ZXIgaW5zdGFuY2UgYXMgdGhlIGFjdGl2aXR5IG1ldGEgYnJhbmNoIFx1MjAxNCBvbmUgYW5vbnltb3VzXG4gICAgICAvLyB3aW5kb3cgcGVyIElQIGFjcm9zcyBib3RoIGxvb2t1cHMgKFAzJ3MgbGl2ZW5lc3Mgcm93IGZpcmVzIGl0IGhlcmUpLlxuICAgICAgaWYgKG1ldGFSYXRlTGltaXRlZChpcCkpIHtcbiAgICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQyOSwgJ1RvbyBtYW55IHJlcXVlc3RzJyk7XG4gICAgICB9XG4gICAgICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBkYi5jbGFzc01ldGEoY29kZSk7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW2dldC1hY3Rpdml0eV0gY2xhc3MgbWV0YSBSUEMgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNTAwLCAnTG9va3VwIGZhaWxlZCcpO1xuICAgICAgfVxuICAgICAgLy8gTm8gcm93ID0gdW5rbm93biBvciBkZWxldGVkIGNsYXNzIFx1MjAxNCB0aGUgREVGSU5JVElWRSBuZWdhdGl2ZSBEUi02J3NcbiAgICAgIC8vIHByZS1PQXV0aCB3YXJuaW5nIGtleXMgb24gKG5ldHdvcmsgZmFpbHVyZSBhYm92ZSBpcyB0aGUgc2lsZW50IG9uZSkuXG4gICAgICBpZiAoIWRhdGEpIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDQsICdOb3QgYXZhaWxhYmxlJyk7XG4gICAgICByZXR1cm4gY29ycy5qc29uUmVzcG9uc2UoXG4gICAgICAgIHJlcSxcbiAgICAgICAgLy8gVGhlIHdpcmUtbGVhayBjb250cmFjdDogdGhlIGNsYXNzIE5BTUUgYW5kIG5vdGhpbmcgZWxzZS5cbiAgICAgICAgeyBhcGlfdmVyc2lvbjogQVBJX1ZFUlNJT04sIGNsYXNzX25hbWU6IGRhdGEubmFtZSB9LFxuICAgICAgICB7IGhlYWRlcnM6IHsgJ0NhY2hlLUNvbnRyb2wnOiAnbm8tY2FjaGUnIH0gfSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKCFVVUlEX1JFLnRlc3QoYWN0aXZpdHlJZCkpIHtcbiAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDAsICdhY3Rpdml0eV9pZCBtdXN0IGJlIGEgVVVJRCcpO1xuICAgIH1cblxuICAgIC8vIC0tLS0gMS4gTUVUQSAoYW5vbnltb3VzKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaWYgKG1ldGFPbmx5KSB7XG4gICAgICBjb25zdCBpcCA9XG4gICAgICAgIHJlcS5oZWFkZXJzLmdldCgneC1mb3J3YXJkZWQtZm9yJyk/LnNwbGl0KCcsJylbMF0/LnRyaW0oKSA/PyAndW5rbm93bic7XG4gICAgICBpZiAobWV0YVJhdGVMaW1pdGVkKGlwKSkge1xuICAgICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDI5LCAnVG9vIG1hbnkgcmVxdWVzdHMnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IGRiLnB1YmxpY01ldGEoYWN0aXZpdHlJZCk7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW2dldC1hY3Rpdml0eV0gbWV0YSBSUEMgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNTAwLCAnTG9va3VwIGZhaWxlZCcpO1xuICAgICAgfVxuICAgICAgaWYgKCFkYXRhKSByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDA0LCAnTm90IGF2YWlsYWJsZScpO1xuICAgICAgcmV0dXJuIGNvcnMuanNvblJlc3BvbnNlKFxuICAgICAgICByZXEsXG4gICAgICAgIHtcbiAgICAgICAgICBhcGlfdmVyc2lvbjogQVBJX1ZFUlNJT04sXG4gICAgICAgICAgdGl0bGU6IGRhdGEudGl0bGUsXG4gICAgICAgICAgdGVhY2hlcl9uYW1lOiBkYXRhLnRlYWNoZXJfbmFtZSxcbiAgICAgICAgfSxcbiAgICAgICAgeyBoZWFkZXJzOiB7ICdDYWNoZS1Db250cm9sJzogJ25vLWNhY2hlJyB9IH0sXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIC0tLS0gQXV0aCAocmVzb2x2ZSArIGNvbnRlbnQpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGNvbnN0IGF1dGhIZWFkZXIgPSByZXEuaGVhZGVycy5nZXQoJ0F1dGhvcml6YXRpb24nKTtcbiAgICBpZiAoIWF1dGhIZWFkZXIpIHtcbiAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDEsICdNaXNzaW5nIEF1dGhvcml6YXRpb24gaGVhZGVyJyk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBkYXRhOiBjdXJyZW50LCBlcnJvcjogcnBjRXJyb3IgfSA9IGF3YWl0IGRiLnB1Ymxpc2hlZEFjdGl2aXR5KFxuICAgICAgYXV0aEhlYWRlcixcbiAgICAgIGFjdGl2aXR5SWQsXG4gICAgKTtcbiAgICBpZiAocnBjRXJyb3IpIHtcbiAgICAgIGNvbnN0IG1zZyA9IHJwY0Vycm9yLm1lc3NhZ2UgPz8gJyc7XG4gICAgICAvLyBQb3N0Z1JFU1Qgc3VyZmFjZXMgYSBiYWQvZXhwaXJlZCBKV1QgYXMgYSA0MDEtY2xhc3MgZXJyb3I7IHRoZSBSUENcbiAgICAgIC8vIHJhaXNlcyAnTm90IGF2YWlsYWJsZScgZm9yIG1pc3NpbmcvdW5wdWJsaXNoZWQvZGVsZXRlZCBhY3Rpdml0aWVzLlxuICAgICAgY29uc3Qgc3RhdHVzID0gbXNnLmluY2x1ZGVzKCdOb3QgYXZhaWxhYmxlJylcbiAgICAgICAgPyA0MDRcbiAgICAgICAgOiAvSldUfHRva2VufGF1dGgvaS50ZXN0KG1zZylcbiAgICAgICAgICA/IDQwMVxuICAgICAgICAgIDogNTAwO1xuICAgICAgaWYgKHN0YXR1cyA9PT0gNTAwKSBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBSUEMgZXJyb3I6JywgcnBjRXJyb3IpO1xuICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShcbiAgICAgICAgcmVxLFxuICAgICAgICBzdGF0dXMsXG4gICAgICAgIHN0YXR1cyA9PT0gNDA0ID8gJ05vdCBhdmFpbGFibGUnIDogbXNnLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKCFjdXJyZW50KSByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDA0LCAnTm90IGF2YWlsYWJsZScpO1xuICAgIGNvbnN0IHJvdyA9IGN1cnJlbnQ7XG5cbiAgICAvLyAtLS0tIDIuIFJFU09MVkUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpZiAoIXZlcnNpb25JZCkge1xuICAgICAgcmV0dXJuIGNvcnMuanNvblJlc3BvbnNlKFxuICAgICAgICByZXEsXG4gICAgICAgIHtcbiAgICAgICAgICBhcGlfdmVyc2lvbjogQVBJX1ZFUlNJT04sXG4gICAgICAgICAgYWN0aXZpdHlfaWQ6IGFjdGl2aXR5SWQsXG4gICAgICAgICAgdmVyc2lvbl9pZDogcm93LnZlcnNpb25faWQsXG4gICAgICAgICAgdmVyc2lvbl9udW06IHJvdy52ZXJzaW9uX251bSxcbiAgICAgICAgICB0aXRsZTogcm93LnRpdGxlLFxuICAgICAgICB9LFxuICAgICAgICB7IGhlYWRlcnM6IHsgJ0NhY2hlLUNvbnRyb2wnOiAnbm8tY2FjaGUnIH0gfSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gLS0tLSAzLiBDT05URU5UIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaWYgKCFVVUlEX1JFLnRlc3QodmVyc2lvbklkKSkge1xuICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQwMCwgJ3ZlcnNpb25faWQgbXVzdCBiZSBhIFVVSUQnKTtcbiAgICB9XG4gICAgaWYgKHZlcnNpb25JZCAhPT0gcm93LnZlcnNpb25faWQpIHtcbiAgICAgIC8vIFJlcHVibGlzaGVkIHNpbmNlIHJlc29sdmUgXHUyMDE0IHRoZSB2aWV3ZXIgcmUtcmVzb2x2ZXMgYW5kIHJlZmV0Y2hlcy4gNDA0XG4gICAgICAvLyAobm90IDQwOSkgc28gbm8gc3RhbGUtVVJMIHJlc3BvbnNlIGlzIGV2ZXIgY2FjaGVhYmxlIGFzIGNvbnRlbnQuXG4gICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDA0LCAnTm90IHRoZSBjdXJyZW50IHZlcnNpb24nLCB7XG4gICAgICAgIGNvZGU6ICdzdGFsZV92ZXJzaW9uJyxcbiAgICAgICAgY3VycmVudF92ZXJzaW9uX2lkOiByb3cudmVyc2lvbl9pZCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIER1cmFibGUgcGVyLXZlcnNpb24gY2FjaGUgKGFjdGl2aXR5X3ZlcnNpb25fcmVhZHMsIHNlcnZpY2Utcm9sZSBvbmx5KS5cbiAgICBsZXQgc2FuaXRpemVkOiBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgY29uc3QgeyBkYXRhOiBjYWNoZWQsIGVycm9yOiBjYWNoZUVyciB9ID0gYXdhaXQgZGIucmVhZENhY2hlKFxuICAgICAgdmVyc2lvbklkLFxuICAgICAgU0FOSVRJWkVSX1JFVixcbiAgICApO1xuICAgIGlmIChjYWNoZUVycikge1xuICAgICAgLy8gQ2FjaGUgcmVhZCBmYWlsdXJlIGlzIG5vbi1mYXRhbCBcdTIwMTQgZmFsbCB0aHJvdWdoIHRvIHRoZSBzb3VyY2Ugb2YgdHJ1dGguXG4gICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBjYWNoZSByZWFkIGZhaWxlZDonLCBjYWNoZUVycik7XG4gICAgfVxuICAgIGlmIChjYWNoZWQpIHtcbiAgICAgIHNhbml0aXplZCA9IGNhY2hlZC5jb250ZW50IGFzIFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQ7XG4gICAgfVxuXG4gICAgaWYgKCFzYW5pdGl6ZWQpIHtcbiAgICAgIGNvbnN0IHsgZGF0YTogdmVyc2lvbiwgZXJyb3I6IHZFcnIgfSA9IGF3YWl0IGRiLnJlYWRWZXJzaW9uKHZlcnNpb25JZCk7XG4gICAgICBpZiAodkVyciB8fCAhdmVyc2lvbikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSB2ZXJzaW9uIHJlYWQgZmFpbGVkOicsIHZFcnIpO1xuICAgICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNTAwLCAnVmVyc2lvbiByZWFkIGZhaWxlZCcpO1xuICAgICAgfVxuICAgICAgbGV0IHVwZ3JhZGVkO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdXBncmFkZWQgPSB1cGdyYWRlQWN0aXZpdHlEb2N1bWVudCh2ZXJzaW9uLmNvbnRlbnQpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIFRoZSBleHBsaWNpdCBmYWlsdXJlIHN0YXRlIHRoZSBmYWlsdXJlLW1vZGVzIHRhYmxlIHByb21pc2VzIFx1MjAxNCBhXG4gICAgICAgIC8vIHNlcnZlZCA1MDAgd2l0aCBhIHJlYXNvbiwgbmV2ZXIgYSBtaXMtcGFyc2VkIGRvY3VtZW50LlxuICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSB1cGdyYWRlIGZhaWxlZDonLCBlcnIpO1xuICAgICAgICBjb25zdCBkZXRhaWwgPVxuICAgICAgICAgIGVyciBpbnN0YW5jZW9mIFVwZ3JhZGVFcnJvciA/IGVyci5tZXNzYWdlIDogJ1VwZ3JhZGUgZmFpbGVkJztcbiAgICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDUwMCwgJ0FjdGl2aXR5IGNvbnRlbnQgY2Fubm90IGJlIHNlcnZlZCcsIHtcbiAgICAgICAgICBjb2RlOiAndXBncmFkZV9mYWlsZWQnLFxuICAgICAgICAgIGRldGFpbCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUFjdGl2aXR5RG9jdW1lbnQodXBncmFkZWQuZG9jKTtcblxuICAgICAgLy8gLS0tLSBBbmFseXRpY3Mgc2lkZS1jaGFubmVsIChTNykgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIE9SREVSIElTIExPQUQtQkVBUklORzogY2Vuc3VzIEZJUlNULCBhbmQgdGhlIGNhY2hlIHJvdyBpcyB3cml0dGVuIG9ubHlcbiAgICAgIC8vIGlmIGl0IHN1Y2NlZWRlZCAocnVsaW5nIFM3LTkpLlxuICAgICAgLy9cbiAgICAgIC8vIFRoZSBjYWNoZSByb3cgaXMgd2hhdCBtYWtlcyBldmVyeSBsYXRlciByZWFkIGEgSElUIFx1MjAxNCBhbmQgYSBISVQgZG9lcyBub1xuICAgICAgLy8gYW5hbHl0aWNzIHdvcmsgYXQgYWxsLiBTbyB3cml0aW5nIHRoZSBjYWNoZSByb3cgYWZ0ZXIgYSBGQUlMRUQgY2Vuc3VzXG4gICAgICAvLyB3b3VsZCBzdHJhbmQgdGhpcyB2ZXJzaW9uIHdpdGggbm8gY2Vuc3VzIHVudGlsIHRoZSBuZXh0IFNBTklUSVpFUl9SRVZcbiAgICAgIC8vIGJ1bXAsIHdoaWxlIGV2ZXJ5IGNoZWNrIG9uIGl0IGFnZ3JlZ2F0ZWQgYXMgdW5hdHRyaWJ1dGVkLiBTaWxlbnQsIGFuZFxuICAgICAgLy8gcGVybWFuZW50LiBXaXRoaG9sZGluZyB0aGUgY2FjaGUgcm93IGluc3RlYWQgbWVhbnMgdGhlIG5leHQgcmVhZCBpc1xuICAgICAgLy8gYW5vdGhlciBtaXNzIHRoYXQgcmV0cmllcyBib3RoOiB0aGUgZmFpbHVyZSBzZWxmLWhlYWxzLCBhbmQgaXRzIG9ubHlcbiAgICAgIC8vIGNvc3QgaXMgcmVjb21wdXRpbmcgYSBkb2N1bWVudCB3ZSBhbHJlYWR5IGtub3cgaG93IHRvIHJlY29tcHV0ZS5cbiAgICAgIC8vXG4gICAgICAvLyBUaGUgY2Vuc3VzIGl0c2VsZiBpcyB0b3RhbCAobmV2ZXIgdGhyb3dzIFx1MjAxNCBzZWUgVU5LTk9XTl9DRU5TVVNfS0VZKSwgc29cbiAgICAgIC8vIHdoYXQgdGhpcyBvcmRlcmluZyBhY3R1YWxseSBndWFyZHMgYWdhaW5zdCBpcyBhIHRyYW5zaWVudCBEQiBmYWlsdXJlLFxuICAgICAgLy8gd2hpY2ggaXMgZXhhY3RseSB0aGUga2luZCB0aGF0IGEgcmV0cnkgZml4ZXMuXG4gICAgICBsZXQgY2Vuc3VzT2sgPSB0cnVlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBlcnJvcjogY2Vuc3VzRXJyIH0gPSBhd2FpdCBkYi53cml0ZUNlbnN1cyhcbiAgICAgICAgICB2ZXJzaW9uSWQsXG4gICAgICAgICAgY2Vuc3VzT2ZEb2N1bWVudCh1cGdyYWRlZC5kb2MpLFxuICAgICAgICApO1xuICAgICAgICBpZiAoY2Vuc3VzRXJyKSB7XG4gICAgICAgICAgY2Vuc3VzT2sgPSBmYWxzZTtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBjZW5zdXMgd3JpdGUgZmFpbGVkOicsIGNlbnN1c0Vycik7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjZW5zdXNPayA9IGZhbHNlO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBjZW5zdXMgdGhyZXc6JywgZXJyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNlbnN1c09rKSB7XG4gICAgICAgIGNvbnN0IHsgZXJyb3I6IHVwc2VydEVyciB9ID0gYXdhaXQgZGIudXBzZXJ0Q2FjaGUoe1xuICAgICAgICAgIHZlcnNpb25faWQ6IHZlcnNpb25JZCxcbiAgICAgICAgICBzYW5pdGl6ZXJfcmV2OiBTQU5JVElaRVJfUkVWLFxuICAgICAgICAgIHNjaGVtYV92ZXJzaW9uOiB1cGdyYWRlZC5kb2Muc2NoZW1hVmVyc2lvbixcbiAgICAgICAgICBjb250ZW50OiBzYW5pdGl6ZWQsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodXBzZXJ0RXJyKSB7XG4gICAgICAgICAgLy8gTm9uLWZhdGFsOiB0aGUgcmVzcG9uc2UgaXMgYWxyZWFkeSBjb21wdXRlZDsgdGhlIG5leHQgcmVxdWVzdFxuICAgICAgICAgIC8vIHJldHJpZXMuXG4gICAgICAgICAgY29uc29sZS5lcnJvcignW2dldC1hY3Rpdml0eV0gY2FjaGUgdXBzZXJ0IGZhaWxlZDonLCB1cHNlcnRFcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFRoaXMgdmVyc2lvbiBpcyBub3cgY2FjaGVkIHVuZGVyIHRoZSBDVVJSRU5UIHJldiwgc28gYW55IHJvdyBpdFxuICAgICAgICAgIC8vIGhhcyB1bmRlciBhbiBvbGRlciByZXYgaXMgZGVhZCB3ZWlnaHQgbm90aGluZyB3aWxsIGV2ZXIgcmVhZC5cbiAgICAgICAgICBjb25zdCB7IGVycm9yOiBnY0VyciB9ID0gYXdhaXQgZGIuZGVsZXRlU3RhbGVDYWNoZShcbiAgICAgICAgICAgIHZlcnNpb25JZCxcbiAgICAgICAgICAgIFNBTklUSVpFUl9SRVYsXG4gICAgICAgICAgKTtcbiAgICAgICAgICBpZiAoZ2NFcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIHN0YWxlLWNhY2hlIEdDIGZhaWxlZDonLCBnY0Vycik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdXNlcklkID0gand0U3ViKGF1dGhIZWFkZXIpID8/ICdhbm9ueW1vdXMnO1xuICAgIC8vIHNlcnZlU2VlZCwgaW1wb3J0ZWQgKEcxKTogdGhlIGdyYWRpbmcgc2lkZSByZWNvbXB1dGVzIHRoaXMgc3R1ZGVudCdzXG4gICAgLy8gYXJyYW5nZW1lbnQgZnJvbSB0aGUgU0FNRSBzeW1ib2wgXHUyMDE0IHR3byBzcGVsbGluZ3MgYWdyZWVpbmcgYnkgbHVjayB3YXNcbiAgICAvLyB0aGUgczIgcmV0cm8ncyBzaGFycGVzdCBzZWFtIGZpbmRpbmcuXG4gICAgY29uc3Qgc2VydmVkID0gYXBwbHlTZXJ2ZVNodWZmbGVzKHNhbml0aXplZCwgc2VydmVTZWVkKHZlcnNpb25JZCwgdXNlcklkKSk7XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxuICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBhcGlfdmVyc2lvbjogQVBJX1ZFUlNJT04sXG4gICAgICAgIGFjdGl2aXR5X2lkOiBhY3Rpdml0eUlkLFxuICAgICAgICB2ZXJzaW9uOiB7XG4gICAgICAgICAgaWQ6IHZlcnNpb25JZCxcbiAgICAgICAgICBudW06IHJvdy52ZXJzaW9uX251bSxcbiAgICAgICAgICBzY2hlbWFfdmVyc2lvbjogc2VydmVkLnNjaGVtYVZlcnNpb24sXG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlOiByb3cudGl0bGUsXG4gICAgICAgIGFjdGl2aXR5OiBzZXJ2ZWQsXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgc3RhdHVzOiAyMDAsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAuLi5jb3JzLmNvcnNIZWFkZXJzKHJlcSksXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAvLyBWZXJzaW9uLWtleWVkIFVSTCBcdTIxOTIgaW1tdXRhYmxlLiBwcml2YXRlOiBzdHVkZW50IGNvbnRlbnQgbmV2ZXIgbGFuZHNcbiAgICAgICAgICAvLyBpbiBzaGFyZWQgY2FjaGVzLiBBIHJlcHVibGlzaCBjaGFuZ2VzIHRoZSBVUkwgdmlhIHJlc29sdmUsIHNvIHRoaXNcbiAgICAgICAgICAvLyBuZXZlciBuZWVkcyB0byBleHBpcmUuXG4gICAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAncHJpdmF0ZSwgbWF4LWFnZT0zMTUzNjAwMCwgaW1tdXRhYmxlJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgKTtcbiAgfTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBTyxJQUFJO0FBQUEsQ0FDVixTQUFVQSxPQUFNO0FBQ2IsRUFBQUEsTUFBSyxjQUFjLENBQUMsTUFBTTtBQUFBLEVBQUU7QUFDNUIsV0FBUyxTQUFTLE1BQU07QUFBQSxFQUFFO0FBQzFCLEVBQUFBLE1BQUssV0FBVztBQUNoQixXQUFTLFlBQVksSUFBSTtBQUNyQixVQUFNLElBQUksTUFBTTtBQUFBLEVBQ3BCO0FBQ0EsRUFBQUEsTUFBSyxjQUFjO0FBQ25CLEVBQUFBLE1BQUssY0FBYyxDQUFDLFVBQVU7QUFDMUIsVUFBTSxNQUFNLENBQUM7QUFDYixlQUFXLFFBQVEsT0FBTztBQUN0QixVQUFJLElBQUksSUFBSTtBQUFBLElBQ2hCO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFDQSxFQUFBQSxNQUFLLHFCQUFxQixDQUFDLFFBQVE7QUFD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VCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsTUFBTTtBQUFBLEVBQzdEO0FBQUEsRUFDQSxJQUFJLGFBQWE7QUFDYixXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsVUFBVTtBQUFBLEVBQ2pFO0FBQUEsRUFDQSxJQUFJLFVBQVU7QUFDVixXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsT0FBTztBQUFBLEVBQzlEO0FBQUEsRUFDQSxJQUFJLFFBQVE7QUFDUixXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsS0FBSztBQUFBLEVBQzVEO0FBQUEsRUFDQSxJQUFJLFVBQVU7QUFDVixXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsT0FBTztBQUFBLEVBQzlEO0FBQUEsRUFDQSxJQUFJLFNBQVM7QUFDVCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsTUFBTTtBQUFBLEVBQzdEO0FBQUEsRUFDQSxJQUFJLFdBQVc7QUFDWCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsUUFBUTtBQUFBLEVBQy9EO0FBQUEsRUFDQSxJQUFJLFNBQVM7QUFDVCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsTUFBTTtBQUFBLEVBQzdEO0FBQUEsRUFDQSxJQUFJLFVBQVU7QUFDVixXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsT0FBTztBQUFBLEVBQzlEO0FBQUEsRUFDQSxJQUFJLFNBQVM7QUFDVCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFL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SSxNQUFNLEdBQUc7QUFBQSxZQUNoQztBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQ0EsY0FBSSxPQUFPO0FBQ1Qsb0JBQVEsTUFBTSx5Q0FBeUMsS0FBSztBQUFBLFVBQzlEO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsVUFBTSxTQUFTLE9BQU8sVUFBVSxLQUFLO0FBSXJDLFVBQU0sU0FBUyxtQkFBbUIsV0FBVyxVQUFVLFdBQVcsTUFBTSxDQUFDO0FBRXpFLFdBQU8sSUFBSTtBQUFBLE1BQ1QsS0FBSyxVQUFVO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixTQUFTO0FBQUEsVUFDUCxJQUFJO0FBQUEsVUFDSixLQUFLLElBQUk7QUFBQSxVQUNULGdCQUFnQixPQUFPO0FBQUEsUUFDekI7QUFBQSxRQUNBLE9BQU8sSUFBSTtBQUFBLFFBQ1gsVUFBVTtBQUFBLE1BQ1osQ0FBQztBQUFBLE1BQ0Q7QUFBQSxRQUNFLFFBQVE7QUFBQSxRQUNSLFNBQVM7QUFBQSxVQUNQLEdBQUcsS0FBSyxZQUFZLEdBQUc7QUFBQSxVQUN2QixnQkFBZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUloQixpQkFBaUI7QUFBQSxRQUNuQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogWyJ1dGlsIiwgIm9iamVjdFV0aWwiLCAiZXJyb3JVdGlsIiwgImVycm9yTWFwIiwgImN0eCIsICJyZXN1bHQiLCAiaXNzdWVzIiwgImVsZW1lbnRzIiwgInByb2Nlc3NlZCIsICJyZXN1bHQiLCAiciIsICJab2RGaXJzdFBhcnR5VHlwZUtpbmQiLCAidmlzaXQiXQp9Cg==
