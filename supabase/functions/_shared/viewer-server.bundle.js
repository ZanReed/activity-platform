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
    // WAS a faithful oddity (absent from the baseline break-inside:avoid list,
    // so a numbered display equation could split across a page). FIXED by
    // ruling S5-OV6 — still not in the showAnswers set, which is the separate
    // answer-key-variant question S5.5 owns.
    print: { breakInside: "avoid", treatment: "underline-blanks" },
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
    print: {
      breakInside: "avoid",
      treatment: "choice-letters",
      answerKeyVariant: true,
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
    print: {
      breakInside: "avoid",
      treatment: "number-boxes",
      answerKeyVariant: true,
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
      // The widget needs handle count / family, which live in the key the
      // viewer never gets. Derived + whitelisted; see SanitizeSpec.
      deriveQuestionShape: true,
      strip: ["solution", "interaction.tolerance"],
      derivableFromServed: "The data set is the working material the student builds the chart FROM, and the correct chart is computed from it \u2014 withholding the data would remove the task. Server-authoritative grading still gates verdicts; the leak tests whitelist `data` for this block explicitly."
    },
    // WAS a faithful oddity (absent from the baseline break-inside:avoid list,
    // unlike the graph and number-line canvases). FIXED by ruling S5-OV6 — a
    // chart split across a page boundary is unreadable.
    print: { breakInside: "avoid", treatment: "static-svg", answerKeyVariant: true },
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
    numbered: "never",
    analyticsKey: "short_answer",
    // Rubrics are teacher-side data — already correctly withheld from student
    // HTML today; the registry makes that a declared invariant.
    sanitize: { strip: ["rubric"] },
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
    numbered: "never",
    analyticsKey: "essay",
    sanitize: { strip: ["rubric"] },
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
var FREE_TEXT_TYPES = /* @__PURE__ */ new Set(["self_explanation", "short_answer", "essay"]);
var GRAPH_TYPES = /* @__PURE__ */ new Set(["interactive_graph", "number_line", "data_plot"]);
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
var PROMPT_CARRIER_TYPES2 = /* @__PURE__ */ new Set(["math_inline", "math_block"]);
function collectInBandKeys(value, out, isChildBlockArray) {
  if (Array.isArray(value)) {
    if (isChildBlockArray(value)) return;
    for (const item of value) collectInBandKeys(item, out, isChildBlockArray);
    return;
  }
  if (value === null || typeof value !== "object") return;
  const node = value;
  if (node.type === "blank" && typeof node.id === "string") {
    out.push(blankTokenToKey(node));
    return;
  }
  if (typeof node.type === "string" && PROMPT_CARRIER_TYPES2.has(node.type) && Array.isArray(node.prompts)) {
    for (const prompt of node.prompts) {
      if (prompt !== null && typeof prompt === "object") {
        out.push(mathPromptToKey(prompt));
      }
    }
  }
  for (const child of Object.values(node)) {
    collectInBandKeys(child, out, isChildBlockArray);
  }
}
function looksLikeBlockArray2(value) {
  return Array.isArray(value) && value.length > 0 && value.every(
    (item) => typeof item === "object" && item !== null && typeof item.id === "string" && typeof item.type === "string"
  ) && value.every((item) => {
    const t = item.type;
    return t !== "text" && t !== "blank" && t !== "math_inline" && t !== "hard_break";
  });
}
function childBlocksOf2(block) {
  const out = [];
  for (const value of Object.values(block)) {
    if (looksLikeBlockArray2(value)) out.push(...value);
  }
  return out;
}
function visit(block, inv) {
  const id = typeof block.id === "string" ? block.id : "";
  const type = typeof block.type === "string" ? block.type : "";
  if (!id) return;
  if (Array.isArray(block.solution) && block.solution.length > 0) {
    inv.solutions.push({ blockId: id, solution: block.solution });
  }
  const inBand = [];
  collectInBandKeys(block, inBand, looksLikeBlockArray2);
  if (inBand.length > 0) {
    inv.blankGroupsByBlock.push({ blockId: id, keys: inBand });
  }
  switch (type) {
    case "multiple_choice": {
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
      const items = Array.isArray(block.items) ? block.items : [];
      inv.matching.push({
        blockId: id,
        key: block.key ?? {},
        itemIds: items.map((i) => String(i.id))
      });
      break;
    }
    case "ordering": {
      const items = Array.isArray(block.items) ? block.items : [];
      inv.ordering.push({ blockId: id, authoredOrder: items.map((i) => String(i.id)) });
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
  for (const child of childBlocksOf2(block)) visit(child, inv);
}
function inventorySection(section) {
  const inv = {
    blankGroupsByBlock: [],
    multipleChoice: [],
    matching: [],
    ordering: [],
    graphs: [],
    freeText: [],
    solutions: []
  };
  for (const row of section.rows ?? []) {
    for (const column of row.columns ?? []) {
      for (const block of column.blocks ?? []) visit(block, inv);
    }
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
    const inv = inventorySection(section);
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

// packages/viewer/src/server/get-activity-handler.ts
var API_VERSION = 1;
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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
    const served = applyServeShuffles(sanitized, `${versionId}:${userId}`);
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
  API_VERSION,
  META_MAX_PER_WINDOW,
  META_WINDOW_MS,
  SANITIZER_ALGO_REV,
  SANITIZER_REV,
  UNKNOWN_CENSUS_KEY,
  UpgradeError,
  applyServeShuffles,
  censusOfDocument,
  createGetActivityHandler,
  createMetaRateLimiter,
  jwtSub,
  sanitizeActivityDocument,
  sanitizeBlock,
  seededShuffle,
  upgradeActivityDocument
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvZXh0ZXJuYWwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvaGVscGVycy91dGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL1pvZEVycm9yLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2xvY2FsZXMvZW4uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvZXJyb3JzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2hlbHBlcnMvcGFyc2VVdGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2hlbHBlcnMvZXJyb3JVdGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL3R5cGVzLmpzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvc2l6aW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2ltYWdlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvZ3JhcGgtcHJpbWl0aXZlcy50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9ncmFwaC1maWd1cmUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9pbmxpbmUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvcGFyYWdyYXBoLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2hlYWRpbmcudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9sYWJlbC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9tYXRoLWJsb2NrLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2NhbGxvdXQudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvcHJvYmxlbS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9maWxsLWluLWJsYW5rLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2xpc3QudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvaW50ZXJhY3RpdmUtZ3JhcGgudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvbXVsdGlwbGUtY2hvaWNlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL21hdGNoaW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL29yZGVyaW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL251bWJlci1saW5lLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2RhdGEtcGxvdC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9sZWFybmluZy1vYmplY3RpdmVzLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL3dvcmtlZC1leGFtcGxlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2ZhZGVkLXdvcmtlZC1leGFtcGxlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL3NlbGYtZXhwbGFuYXRpb24udHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvZnJlZS1yZXNwb25zZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9pbmRleC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2xheW91dC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2RvY3VtZW50LnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvdXBncmFkZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL3N1Ym1pc3Npb24udHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9yZWdpc3RyeS9yZWdpc3RyeS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3Nhbml0aXplL3Nhbml0aXplLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2FuaXRpemUvc2h1ZmZsZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL2NvbnRhaW5lci9ibG9ja0luZGV4LnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2VydmVyL2dyYWRpbmcvd2Fsay50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL2NlbnN1cy9jZW5zdXMudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9zZXJ2ZXIvZ2V0LWFjdGl2aXR5LWhhbmRsZXIudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCAqIGZyb20gXCIuL2Vycm9ycy5qc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vaGVscGVycy9wYXJzZVV0aWwuanNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2hlbHBlcnMvdHlwZUFsaWFzZXMuanNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2hlbHBlcnMvdXRpbC5qc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vdHlwZXMuanNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL1pvZEVycm9yLmpzXCI7XG4iLCAiZXhwb3J0IHZhciB1dGlsO1xuKGZ1bmN0aW9uICh1dGlsKSB7XG4gICAgdXRpbC5hc3NlcnRFcXVhbCA9IChfKSA9PiB7IH07XG4gICAgZnVuY3Rpb24gYXNzZXJ0SXMoX2FyZykgeyB9XG4gICAgdXRpbC5hc3NlcnRJcyA9IGFzc2VydElzO1xuICAgIGZ1bmN0aW9uIGFzc2VydE5ldmVyKF94KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIH1cbiAgICB1dGlsLmFzc2VydE5ldmVyID0gYXNzZXJ0TmV2ZXI7XG4gICAgdXRpbC5hcnJheVRvRW51bSA9IChpdGVtcykgPT4ge1xuICAgICAgICBjb25zdCBvYmogPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgICAgICAgICBvYmpbaXRlbV0gPSBpdGVtO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfTtcbiAgICB1dGlsLmdldFZhbGlkRW51bVZhbHVlcyA9IChvYmopID0+IHtcbiAgICAgICAgY29uc3QgdmFsaWRLZXlzID0gdXRpbC5vYmplY3RLZXlzKG9iaikuZmlsdGVyKChrKSA9PiB0eXBlb2Ygb2JqW29ialtrXV0gIT09IFwibnVtYmVyXCIpO1xuICAgICAgICBjb25zdCBmaWx0ZXJlZCA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGsgb2YgdmFsaWRLZXlzKSB7XG4gICAgICAgICAgICBmaWx0ZXJlZFtrXSA9IG9ialtrXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdXRpbC5vYmplY3RWYWx1ZXMoZmlsdGVyZWQpO1xuICAgIH07XG4gICAgdXRpbC5vYmplY3RWYWx1ZXMgPSAob2JqKSA9PiB7XG4gICAgICAgIHJldHVybiB1dGlsLm9iamVjdEtleXMob2JqKS5tYXAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmpbZV07XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgdXRpbC5vYmplY3RLZXlzID0gdHlwZW9mIE9iamVjdC5rZXlzID09PSBcImZ1bmN0aW9uXCIgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYW4vYmFuXG4gICAgICAgID8gKG9iaikgPT4gT2JqZWN0LmtleXMob2JqKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhbi9iYW5cbiAgICAgICAgOiAob2JqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBrZXlzID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ga2V5cztcbiAgICAgICAgfTtcbiAgICB1dGlsLmZpbmQgPSAoYXJyLCBjaGVja2VyKSA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBhcnIpIHtcbiAgICAgICAgICAgIGlmIChjaGVja2VyKGl0ZW0pKVxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICB1dGlsLmlzSW50ZWdlciA9IHR5cGVvZiBOdW1iZXIuaXNJbnRlZ2VyID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgPyAodmFsKSA9PiBOdW1iZXIuaXNJbnRlZ2VyKHZhbCkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYW4vYmFuXG4gICAgICAgIDogKHZhbCkgPT4gdHlwZW9mIHZhbCA9PT0gXCJudW1iZXJcIiAmJiBOdW1iZXIuaXNGaW5pdGUodmFsKSAmJiBNYXRoLmZsb29yKHZhbCkgPT09IHZhbDtcbiAgICBmdW5jdGlvbiBqb2luVmFsdWVzKGFycmF5LCBzZXBhcmF0b3IgPSBcIiB8IFwiKSB7XG4gICAgICAgIHJldHVybiBhcnJheS5tYXAoKHZhbCkgPT4gKHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCIgPyBgJyR7dmFsfSdgIDogdmFsKSkuam9pbihzZXBhcmF0b3IpO1xuICAgIH1cbiAgICB1dGlsLmpvaW5WYWx1ZXMgPSBqb2luVmFsdWVzO1xuICAgIHV0aWwuanNvblN0cmluZ2lmeVJlcGxhY2VyID0gKF8sIHZhbHVlKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiYmlnaW50XCIpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xufSkodXRpbCB8fCAodXRpbCA9IHt9KSk7XG5leHBvcnQgdmFyIG9iamVjdFV0aWw7XG4oZnVuY3Rpb24gKG9iamVjdFV0aWwpIHtcbiAgICBvYmplY3RVdGlsLm1lcmdlU2hhcGVzID0gKGZpcnN0LCBzZWNvbmQpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLmZpcnN0LFxuICAgICAgICAgICAgLi4uc2Vjb25kLCAvLyBzZWNvbmQgb3ZlcndyaXRlcyBmaXJzdFxuICAgICAgICB9O1xuICAgIH07XG59KShvYmplY3RVdGlsIHx8IChvYmplY3RVdGlsID0ge30pKTtcbmV4cG9ydCBjb25zdCBab2RQYXJzZWRUeXBlID0gdXRpbC5hcnJheVRvRW51bShbXG4gICAgXCJzdHJpbmdcIixcbiAgICBcIm5hblwiLFxuICAgIFwibnVtYmVyXCIsXG4gICAgXCJpbnRlZ2VyXCIsXG4gICAgXCJmbG9hdFwiLFxuICAgIFwiYm9vbGVhblwiLFxuICAgIFwiZGF0ZVwiLFxuICAgIFwiYmlnaW50XCIsXG4gICAgXCJzeW1ib2xcIixcbiAgICBcImZ1bmN0aW9uXCIsXG4gICAgXCJ1bmRlZmluZWRcIixcbiAgICBcIm51bGxcIixcbiAgICBcImFycmF5XCIsXG4gICAgXCJvYmplY3RcIixcbiAgICBcInVua25vd25cIixcbiAgICBcInByb21pc2VcIixcbiAgICBcInZvaWRcIixcbiAgICBcIm5ldmVyXCIsXG4gICAgXCJtYXBcIixcbiAgICBcInNldFwiLFxuXSk7XG5leHBvcnQgY29uc3QgZ2V0UGFyc2VkVHlwZSA9IChkYXRhKSA9PiB7XG4gICAgY29uc3QgdCA9IHR5cGVvZiBkYXRhO1xuICAgIHN3aXRjaCAodCkge1xuICAgICAgICBjYXNlIFwidW5kZWZpbmVkXCI6XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS51bmRlZmluZWQ7XG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLnN0cmluZztcbiAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICAgICAgcmV0dXJuIE51bWJlci5pc05hTihkYXRhKSA/IFpvZFBhcnNlZFR5cGUubmFuIDogWm9kUGFyc2VkVHlwZS5udW1iZXI7XG4gICAgICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5ib29sZWFuO1xuICAgICAgICBjYXNlIFwiZnVuY3Rpb25cIjpcbiAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLmZ1bmN0aW9uO1xuICAgICAgICBjYXNlIFwiYmlnaW50XCI6XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5iaWdpbnQ7XG4gICAgICAgIGNhc2UgXCJzeW1ib2xcIjpcbiAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLnN5bWJvbDtcbiAgICAgICAgY2FzZSBcIm9iamVjdFwiOlxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5hcnJheTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkYXRhID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUubnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkYXRhLnRoZW4gJiYgdHlwZW9mIGRhdGEudGhlbiA9PT0gXCJmdW5jdGlvblwiICYmIGRhdGEuY2F0Y2ggJiYgdHlwZW9mIGRhdGEuY2F0Y2ggPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLnByb21pc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIE1hcCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUubWFwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBTZXQgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLnNldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgRGF0ZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLmRhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5vYmplY3Q7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS51bmtub3duO1xuICAgIH1cbn07XG4iLCAiaW1wb3J0IHsgdXRpbCB9IGZyb20gXCIuL2hlbHBlcnMvdXRpbC5qc1wiO1xuZXhwb3J0IGNvbnN0IFpvZElzc3VlQ29kZSA9IHV0aWwuYXJyYXlUb0VudW0oW1xuICAgIFwiaW52YWxpZF90eXBlXCIsXG4gICAgXCJpbnZhbGlkX2xpdGVyYWxcIixcbiAgICBcImN1c3RvbVwiLFxuICAgIFwiaW52YWxpZF91bmlvblwiLFxuICAgIFwiaW52YWxpZF91bmlvbl9kaXNjcmltaW5hdG9yXCIsXG4gICAgXCJpbnZhbGlkX2VudW1fdmFsdWVcIixcbiAgICBcInVucmVjb2duaXplZF9rZXlzXCIsXG4gICAgXCJpbnZhbGlkX2FyZ3VtZW50c1wiLFxuICAgIFwiaW52YWxpZF9yZXR1cm5fdHlwZVwiLFxuICAgIFwiaW52YWxpZF9kYXRlXCIsXG4gICAgXCJpbnZhbGlkX3N0cmluZ1wiLFxuICAgIFwidG9vX3NtYWxsXCIsXG4gICAgXCJ0b29fYmlnXCIsXG4gICAgXCJpbnZhbGlkX2ludGVyc2VjdGlvbl90eXBlc1wiLFxuICAgIFwibm90X211bHRpcGxlX29mXCIsXG4gICAgXCJub3RfZmluaXRlXCIsXG5dKTtcbmV4cG9ydCBjb25zdCBxdW90ZWxlc3NKc29uID0gKG9iaikgPT4ge1xuICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShvYmosIG51bGwsIDIpO1xuICAgIHJldHVybiBqc29uLnJlcGxhY2UoL1wiKFteXCJdKylcIjovZywgXCIkMTpcIik7XG59O1xuZXhwb3J0IGNsYXNzIFpvZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGdldCBlcnJvcnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzc3VlcztcbiAgICB9XG4gICAgY29uc3RydWN0b3IoaXNzdWVzKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuaXNzdWVzID0gW107XG4gICAgICAgIHRoaXMuYWRkSXNzdWUgPSAoc3ViKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmlzc3VlcyA9IFsuLi50aGlzLmlzc3Vlcywgc3ViXTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hZGRJc3N1ZXMgPSAoc3VicyA9IFtdKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmlzc3VlcyA9IFsuLi50aGlzLmlzc3VlcywgLi4uc3Vic107XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGFjdHVhbFByb3RvID0gbmV3LnRhcmdldC5wcm90b3R5cGU7XG4gICAgICAgIGlmIChPYmplY3Quc2V0UHJvdG90eXBlT2YpIHtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBiYW4vYmFuXG4gICAgICAgICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgYWN0dWFsUHJvdG8pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fX3Byb3RvX18gPSBhY3R1YWxQcm90bztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5hbWUgPSBcIlpvZEVycm9yXCI7XG4gICAgICAgIHRoaXMuaXNzdWVzID0gaXNzdWVzO1xuICAgIH1cbiAgICBmb3JtYXQoX21hcHBlcikge1xuICAgICAgICBjb25zdCBtYXBwZXIgPSBfbWFwcGVyIHx8XG4gICAgICAgICAgICBmdW5jdGlvbiAoaXNzdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNzdWUubWVzc2FnZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNvbnN0IGZpZWxkRXJyb3JzID0geyBfZXJyb3JzOiBbXSB9O1xuICAgICAgICBjb25zdCBwcm9jZXNzRXJyb3IgPSAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaXNzdWUgb2YgZXJyb3IuaXNzdWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzc3VlLmNvZGUgPT09IFwiaW52YWxpZF91bmlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzc3VlLnVuaW9uRXJyb3JzLm1hcChwcm9jZXNzRXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfcmV0dXJuX3R5cGVcIikge1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzRXJyb3IoaXNzdWUucmV0dXJuVHlwZUVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUuY29kZSA9PT0gXCJpbnZhbGlkX2FyZ3VtZW50c1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NFcnJvcihpc3N1ZS5hcmd1bWVudHNFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkRXJyb3JzLl9lcnJvcnMucHVzaChtYXBwZXIoaXNzdWUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyID0gZmllbGRFcnJvcnM7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGkgPCBpc3N1ZS5wYXRoLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZWwgPSBpc3N1ZS5wYXRoW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGVybWluYWwgPSBpID09PSBpc3N1ZS5wYXRoLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRlcm1pbmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycltlbF0gPSBjdXJyW2VsXSB8fCB7IF9lcnJvcnM6IFtdIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgKHR5cGVvZiBlbCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgY3VycltlbF0gPSBjdXJyW2VsXSB8fCB7IF9lcnJvcnM6IFtdIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gfSBlbHNlIGlmICh0eXBlb2YgZWwgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGNvbnN0IGVycm9yQXJyYXk6IGFueSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgZXJyb3JBcnJheS5fZXJyb3JzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBjdXJyW2VsXSA9IGN1cnJbZWxdIHx8IGVycm9yQXJyYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycltlbF0gPSBjdXJyW2VsXSB8fCB7IF9lcnJvcnM6IFtdIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycltlbF0uX2Vycm9ycy5wdXNoKG1hcHBlcihpc3N1ZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyciA9IGN1cnJbZWxdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBwcm9jZXNzRXJyb3IodGhpcyk7XG4gICAgICAgIHJldHVybiBmaWVsZEVycm9ycztcbiAgICB9XG4gICAgc3RhdGljIGFzc2VydCh2YWx1ZSkge1xuICAgICAgICBpZiAoISh2YWx1ZSBpbnN0YW5jZW9mIFpvZEVycm9yKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBOb3QgYSBab2RFcnJvcjogJHt2YWx1ZX1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZTtcbiAgICB9XG4gICAgZ2V0IG1lc3NhZ2UoKSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLmlzc3VlcywgdXRpbC5qc29uU3RyaW5naWZ5UmVwbGFjZXIsIDIpO1xuICAgIH1cbiAgICBnZXQgaXNFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNzdWVzLmxlbmd0aCA9PT0gMDtcbiAgICB9XG4gICAgZmxhdHRlbihtYXBwZXIgPSAoaXNzdWUpID0+IGlzc3VlLm1lc3NhZ2UpIHtcbiAgICAgICAgY29uc3QgZmllbGRFcnJvcnMgPSB7fTtcbiAgICAgICAgY29uc3QgZm9ybUVycm9ycyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHN1YiBvZiB0aGlzLmlzc3Vlcykge1xuICAgICAgICAgICAgaWYgKHN1Yi5wYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaXJzdEVsID0gc3ViLnBhdGhbMF07XG4gICAgICAgICAgICAgICAgZmllbGRFcnJvcnNbZmlyc3RFbF0gPSBmaWVsZEVycm9yc1tmaXJzdEVsXSB8fCBbXTtcbiAgICAgICAgICAgICAgICBmaWVsZEVycm9yc1tmaXJzdEVsXS5wdXNoKG1hcHBlcihzdWIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcm1FcnJvcnMucHVzaChtYXBwZXIoc3ViKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgZm9ybUVycm9ycywgZmllbGRFcnJvcnMgfTtcbiAgICB9XG4gICAgZ2V0IGZvcm1FcnJvcnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZsYXR0ZW4oKTtcbiAgICB9XG59XG5ab2RFcnJvci5jcmVhdGUgPSAoaXNzdWVzKSA9PiB7XG4gICAgY29uc3QgZXJyb3IgPSBuZXcgWm9kRXJyb3IoaXNzdWVzKTtcbiAgICByZXR1cm4gZXJyb3I7XG59O1xuIiwgImltcG9ydCB7IFpvZElzc3VlQ29kZSB9IGZyb20gXCIuLi9ab2RFcnJvci5qc1wiO1xuaW1wb3J0IHsgdXRpbCwgWm9kUGFyc2VkVHlwZSB9IGZyb20gXCIuLi9oZWxwZXJzL3V0aWwuanNcIjtcbmNvbnN0IGVycm9yTWFwID0gKGlzc3VlLCBfY3R4KSA9PiB7XG4gICAgbGV0IG1lc3NhZ2U7XG4gICAgc3dpdGNoIChpc3N1ZS5jb2RlKSB7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZTpcbiAgICAgICAgICAgIGlmIChpc3N1ZS5yZWNlaXZlZCA9PT0gWm9kUGFyc2VkVHlwZS51bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gXCJSZXF1aXJlZFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBFeHBlY3RlZCAke2lzc3VlLmV4cGVjdGVkfSwgcmVjZWl2ZWQgJHtpc3N1ZS5yZWNlaXZlZH1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmludmFsaWRfbGl0ZXJhbDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBsaXRlcmFsIHZhbHVlLCBleHBlY3RlZCAke0pTT04uc3RyaW5naWZ5KGlzc3VlLmV4cGVjdGVkLCB1dGlsLmpzb25TdHJpbmdpZnlSZXBsYWNlcil9YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS51bnJlY29nbml6ZWRfa2V5czpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgVW5yZWNvZ25pemVkIGtleShzKSBpbiBvYmplY3Q6ICR7dXRpbC5qb2luVmFsdWVzKGlzc3VlLmtleXMsIFwiLCBcIil9YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX3VuaW9uOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGlucHV0YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX3VuaW9uX2Rpc2NyaW1pbmF0b3I6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgZGlzY3JpbWluYXRvciB2YWx1ZS4gRXhwZWN0ZWQgJHt1dGlsLmpvaW5WYWx1ZXMoaXNzdWUub3B0aW9ucyl9YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX2VudW1fdmFsdWU6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgZW51bSB2YWx1ZS4gRXhwZWN0ZWQgJHt1dGlsLmpvaW5WYWx1ZXMoaXNzdWUub3B0aW9ucyl9LCByZWNlaXZlZCAnJHtpc3N1ZS5yZWNlaXZlZH0nYDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX2FyZ3VtZW50czpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBmdW5jdGlvbiBhcmd1bWVudHNgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmludmFsaWRfcmV0dXJuX3R5cGU6XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgZnVuY3Rpb24gcmV0dXJuIHR5cGVgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmludmFsaWRfZGF0ZTpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBkYXRlYDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZzpcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaXNzdWUudmFsaWRhdGlvbiA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIGlmIChcImluY2x1ZGVzXCIgaW4gaXNzdWUudmFsaWRhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgaW5wdXQ6IG11c3QgaW5jbHVkZSBcIiR7aXNzdWUudmFsaWRhdGlvbi5pbmNsdWRlc31cImA7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaXNzdWUudmFsaWRhdGlvbi5wb3NpdGlvbiA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGAke21lc3NhZ2V9IGF0IG9uZSBvciBtb3JlIHBvc2l0aW9ucyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gJHtpc3N1ZS52YWxpZGF0aW9uLnBvc2l0aW9ufWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoXCJzdGFydHNXaXRoXCIgaW4gaXNzdWUudmFsaWRhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgaW5wdXQ6IG11c3Qgc3RhcnQgd2l0aCBcIiR7aXNzdWUudmFsaWRhdGlvbi5zdGFydHNXaXRofVwiYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoXCJlbmRzV2l0aFwiIGluIGlzc3VlLnZhbGlkYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGlucHV0OiBtdXN0IGVuZCB3aXRoIFwiJHtpc3N1ZS52YWxpZGF0aW9uLmVuZHNXaXRofVwiYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoaXNzdWUudmFsaWRhdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudmFsaWRhdGlvbiAhPT0gXCJyZWdleFwiKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkICR7aXNzdWUudmFsaWRhdGlvbn1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiSW52YWxpZFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLnRvb19zbWFsbDpcbiAgICAgICAgICAgIGlmIChpc3N1ZS50eXBlID09PSBcImFycmF5XCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBBcnJheSBtdXN0IGNvbnRhaW4gJHtpc3N1ZS5leGFjdCA/IFwiZXhhY3RseVwiIDogaXNzdWUuaW5jbHVzaXZlID8gYGF0IGxlYXN0YCA6IGBtb3JlIHRoYW5gfSAke2lzc3VlLm1pbmltdW19IGVsZW1lbnQocylgO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJzdHJpbmdcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYFN0cmluZyBtdXN0IGNvbnRhaW4gJHtpc3N1ZS5leGFjdCA/IFwiZXhhY3RseVwiIDogaXNzdWUuaW5jbHVzaXZlID8gYGF0IGxlYXN0YCA6IGBvdmVyYH0gJHtpc3N1ZS5taW5pbXVtfSBjaGFyYWN0ZXIocylgO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJudW1iZXJcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYE51bWJlciBtdXN0IGJlICR7aXNzdWUuZXhhY3QgPyBgZXhhY3RseSBlcXVhbCB0byBgIDogaXNzdWUuaW5jbHVzaXZlID8gYGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBgIDogYGdyZWF0ZXIgdGhhbiBgfSR7aXNzdWUubWluaW11bX1gO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJiaWdpbnRcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYE51bWJlciBtdXN0IGJlICR7aXNzdWUuZXhhY3QgPyBgZXhhY3RseSBlcXVhbCB0byBgIDogaXNzdWUuaW5jbHVzaXZlID8gYGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBgIDogYGdyZWF0ZXIgdGhhbiBgfSR7aXNzdWUubWluaW11bX1gO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJkYXRlXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBEYXRlIG11c3QgYmUgJHtpc3N1ZS5leGFjdCA/IGBleGFjdGx5IGVxdWFsIHRvIGAgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIGAgOiBgZ3JlYXRlciB0aGFuIGB9JHtuZXcgRGF0ZShOdW1iZXIoaXNzdWUubWluaW11bSkpfWA7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiSW52YWxpZCBpbnB1dFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLnRvb19iaWc6XG4gICAgICAgICAgICBpZiAoaXNzdWUudHlwZSA9PT0gXCJhcnJheVwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgQXJyYXkgbXVzdCBjb250YWluICR7aXNzdWUuZXhhY3QgPyBgZXhhY3RseWAgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgYXQgbW9zdGAgOiBgbGVzcyB0aGFuYH0gJHtpc3N1ZS5tYXhpbXVtfSBlbGVtZW50KHMpYDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwic3RyaW5nXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBTdHJpbmcgbXVzdCBjb250YWluICR7aXNzdWUuZXhhY3QgPyBgZXhhY3RseWAgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgYXQgbW9zdGAgOiBgdW5kZXJgfSAke2lzc3VlLm1heGltdW19IGNoYXJhY3RlcihzKWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcIm51bWJlclwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgTnVtYmVyIG11c3QgYmUgJHtpc3N1ZS5leGFjdCA/IGBleGFjdGx5YCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBsZXNzIHRoYW4gb3IgZXF1YWwgdG9gIDogYGxlc3MgdGhhbmB9ICR7aXNzdWUubWF4aW11bX1gO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJiaWdpbnRcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEJpZ0ludCBtdXN0IGJlICR7aXNzdWUuZXhhY3QgPyBgZXhhY3RseWAgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgbGVzcyB0aGFuIG9yIGVxdWFsIHRvYCA6IGBsZXNzIHRoYW5gfSAke2lzc3VlLm1heGltdW19YDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwiZGF0ZVwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgRGF0ZSBtdXN0IGJlICR7aXNzdWUuZXhhY3QgPyBgZXhhY3RseWAgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgc21hbGxlciB0aGFuIG9yIGVxdWFsIHRvYCA6IGBzbWFsbGVyIHRoYW5gfSAke25ldyBEYXRlKE51bWJlcihpc3N1ZS5tYXhpbXVtKSl9YDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gXCJJbnZhbGlkIGlucHV0XCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuY3VzdG9tOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGlucHV0YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5pbnZhbGlkX2ludGVyc2VjdGlvbl90eXBlczpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW50ZXJzZWN0aW9uIHJlc3VsdHMgY291bGQgbm90IGJlIG1lcmdlZGA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUubm90X211bHRpcGxlX29mOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBOdW1iZXIgbXVzdCBiZSBhIG11bHRpcGxlIG9mICR7aXNzdWUubXVsdGlwbGVPZn1gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLm5vdF9maW5pdGU6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJOdW1iZXIgbXVzdCBiZSBmaW5pdGVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbWVzc2FnZSA9IF9jdHguZGVmYXVsdEVycm9yO1xuICAgICAgICAgICAgdXRpbC5hc3NlcnROZXZlcihpc3N1ZSk7XG4gICAgfVxuICAgIHJldHVybiB7IG1lc3NhZ2UgfTtcbn07XG5leHBvcnQgZGVmYXVsdCBlcnJvck1hcDtcbiIsICJpbXBvcnQgZGVmYXVsdEVycm9yTWFwIGZyb20gXCIuL2xvY2FsZXMvZW4uanNcIjtcbmxldCBvdmVycmlkZUVycm9yTWFwID0gZGVmYXVsdEVycm9yTWFwO1xuZXhwb3J0IHsgZGVmYXVsdEVycm9yTWFwIH07XG5leHBvcnQgZnVuY3Rpb24gc2V0RXJyb3JNYXAobWFwKSB7XG4gICAgb3ZlcnJpZGVFcnJvck1hcCA9IG1hcDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRFcnJvck1hcCgpIHtcbiAgICByZXR1cm4gb3ZlcnJpZGVFcnJvck1hcDtcbn1cbiIsICJpbXBvcnQgeyBnZXRFcnJvck1hcCB9IGZyb20gXCIuLi9lcnJvcnMuanNcIjtcbmltcG9ydCBkZWZhdWx0RXJyb3JNYXAgZnJvbSBcIi4uL2xvY2FsZXMvZW4uanNcIjtcbmV4cG9ydCBjb25zdCBtYWtlSXNzdWUgPSAocGFyYW1zKSA9PiB7XG4gICAgY29uc3QgeyBkYXRhLCBwYXRoLCBlcnJvck1hcHMsIGlzc3VlRGF0YSB9ID0gcGFyYW1zO1xuICAgIGNvbnN0IGZ1bGxQYXRoID0gWy4uLnBhdGgsIC4uLihpc3N1ZURhdGEucGF0aCB8fCBbXSldO1xuICAgIGNvbnN0IGZ1bGxJc3N1ZSA9IHtcbiAgICAgICAgLi4uaXNzdWVEYXRhLFxuICAgICAgICBwYXRoOiBmdWxsUGF0aCxcbiAgICB9O1xuICAgIGlmIChpc3N1ZURhdGEubWVzc2FnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5pc3N1ZURhdGEsXG4gICAgICAgICAgICBwYXRoOiBmdWxsUGF0aCxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGlzc3VlRGF0YS5tZXNzYWdlLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBsZXQgZXJyb3JNZXNzYWdlID0gXCJcIjtcbiAgICBjb25zdCBtYXBzID0gZXJyb3JNYXBzXG4gICAgICAgIC5maWx0ZXIoKG0pID0+ICEhbSlcbiAgICAgICAgLnNsaWNlKClcbiAgICAgICAgLnJldmVyc2UoKTtcbiAgICBmb3IgKGNvbnN0IG1hcCBvZiBtYXBzKSB7XG4gICAgICAgIGVycm9yTWVzc2FnZSA9IG1hcChmdWxsSXNzdWUsIHsgZGF0YSwgZGVmYXVsdEVycm9yOiBlcnJvck1lc3NhZ2UgfSkubWVzc2FnZTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLi4uaXNzdWVEYXRhLFxuICAgICAgICBwYXRoOiBmdWxsUGF0aCxcbiAgICAgICAgbWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgIH07XG59O1xuZXhwb3J0IGNvbnN0IEVNUFRZX1BBVEggPSBbXTtcbmV4cG9ydCBmdW5jdGlvbiBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIGlzc3VlRGF0YSkge1xuICAgIGNvbnN0IG92ZXJyaWRlTWFwID0gZ2V0RXJyb3JNYXAoKTtcbiAgICBjb25zdCBpc3N1ZSA9IG1ha2VJc3N1ZSh7XG4gICAgICAgIGlzc3VlRGF0YTogaXNzdWVEYXRhLFxuICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgIGVycm9yTWFwczogW1xuICAgICAgICAgICAgY3R4LmNvbW1vbi5jb250ZXh0dWFsRXJyb3JNYXAsIC8vIGNvbnRleHR1YWwgZXJyb3IgbWFwIGlzIGZpcnN0IHByaW9yaXR5XG4gICAgICAgICAgICBjdHguc2NoZW1hRXJyb3JNYXAsIC8vIHRoZW4gc2NoZW1hLWJvdW5kIG1hcCBpZiBhdmFpbGFibGVcbiAgICAgICAgICAgIG92ZXJyaWRlTWFwLCAvLyB0aGVuIGdsb2JhbCBvdmVycmlkZSBtYXBcbiAgICAgICAgICAgIG92ZXJyaWRlTWFwID09PSBkZWZhdWx0RXJyb3JNYXAgPyB1bmRlZmluZWQgOiBkZWZhdWx0RXJyb3JNYXAsIC8vIHRoZW4gZ2xvYmFsIGRlZmF1bHQgbWFwXG4gICAgICAgIF0uZmlsdGVyKCh4KSA9PiAhIXgpLFxuICAgIH0pO1xuICAgIGN0eC5jb21tb24uaXNzdWVzLnB1c2goaXNzdWUpO1xufVxuZXhwb3J0IGNsYXNzIFBhcnNlU3RhdHVzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IFwidmFsaWRcIjtcbiAgICB9XG4gICAgZGlydHkoKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlID09PSBcInZhbGlkXCIpXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gXCJkaXJ0eVwiO1xuICAgIH1cbiAgICBhYm9ydCgpIHtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgIT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFwiYWJvcnRlZFwiO1xuICAgIH1cbiAgICBzdGF0aWMgbWVyZ2VBcnJheShzdGF0dXMsIHJlc3VsdHMpIHtcbiAgICAgICAgY29uc3QgYXJyYXlWYWx1ZSA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHMgb2YgcmVzdWx0cykge1xuICAgICAgICAgICAgaWYgKHMuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgIGlmIChzLnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgYXJyYXlWYWx1ZS5wdXNoKHMudmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogYXJyYXlWYWx1ZSB9O1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgbWVyZ2VPYmplY3RBc3luYyhzdGF0dXMsIHBhaXJzKSB7XG4gICAgICAgIGNvbnN0IHN5bmNQYWlycyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IHBhaXIua2V5O1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBhd2FpdCBwYWlyLnZhbHVlO1xuICAgICAgICAgICAgc3luY1BhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZU9iamVjdFN5bmMoc3RhdHVzLCBzeW5jUGFpcnMpO1xuICAgIH1cbiAgICBzdGF0aWMgbWVyZ2VPYmplY3RTeW5jKHN0YXR1cywgcGFpcnMpIHtcbiAgICAgICAgY29uc3QgZmluYWxPYmplY3QgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHBhaXJzKSB7XG4gICAgICAgICAgICBjb25zdCB7IGtleSwgdmFsdWUgfSA9IHBhaXI7XG4gICAgICAgICAgICBpZiAoa2V5LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICBpZiAodmFsdWUuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgIGlmIChrZXkuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICBpZiAodmFsdWUuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICBpZiAoa2V5LnZhbHVlICE9PSBcIl9fcHJvdG9fX1wiICYmICh0eXBlb2YgdmFsdWUudmFsdWUgIT09IFwidW5kZWZpbmVkXCIgfHwgcGFpci5hbHdheXNTZXQpKSB7XG4gICAgICAgICAgICAgICAgZmluYWxPYmplY3Rba2V5LnZhbHVlXSA9IHZhbHVlLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogZmluYWxPYmplY3QgfTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgSU5WQUxJRCA9IE9iamVjdC5mcmVlemUoe1xuICAgIHN0YXR1czogXCJhYm9ydGVkXCIsXG59KTtcbmV4cG9ydCBjb25zdCBESVJUWSA9ICh2YWx1ZSkgPT4gKHsgc3RhdHVzOiBcImRpcnR5XCIsIHZhbHVlIH0pO1xuZXhwb3J0IGNvbnN0IE9LID0gKHZhbHVlKSA9PiAoeyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWUgfSk7XG5leHBvcnQgY29uc3QgaXNBYm9ydGVkID0gKHgpID0+IHguc3RhdHVzID09PSBcImFib3J0ZWRcIjtcbmV4cG9ydCBjb25zdCBpc0RpcnR5ID0gKHgpID0+IHguc3RhdHVzID09PSBcImRpcnR5XCI7XG5leHBvcnQgY29uc3QgaXNWYWxpZCA9ICh4KSA9PiB4LnN0YXR1cyA9PT0gXCJ2YWxpZFwiO1xuZXhwb3J0IGNvbnN0IGlzQXN5bmMgPSAoeCkgPT4gdHlwZW9mIFByb21pc2UgIT09IFwidW5kZWZpbmVkXCIgJiYgeCBpbnN0YW5jZW9mIFByb21pc2U7XG4iLCAiZXhwb3J0IHZhciBlcnJvclV0aWw7XG4oZnVuY3Rpb24gKGVycm9yVXRpbCkge1xuICAgIGVycm9yVXRpbC5lcnJUb09iaiA9IChtZXNzYWdlKSA9PiB0eXBlb2YgbWVzc2FnZSA9PT0gXCJzdHJpbmdcIiA/IHsgbWVzc2FnZSB9IDogbWVzc2FnZSB8fCB7fTtcbiAgICAvLyBiaW9tZS1pZ25vcmUgbGludDpcbiAgICBlcnJvclV0aWwudG9TdHJpbmcgPSAobWVzc2FnZSkgPT4gdHlwZW9mIG1lc3NhZ2UgPT09IFwic3RyaW5nXCIgPyBtZXNzYWdlIDogbWVzc2FnZT8ubWVzc2FnZTtcbn0pKGVycm9yVXRpbCB8fCAoZXJyb3JVdGlsID0ge30pKTtcbiIsICJpbXBvcnQgeyBab2RFcnJvciwgWm9kSXNzdWVDb2RlLCB9IGZyb20gXCIuL1pvZEVycm9yLmpzXCI7XG5pbXBvcnQgeyBkZWZhdWx0RXJyb3JNYXAsIGdldEVycm9yTWFwIH0gZnJvbSBcIi4vZXJyb3JzLmpzXCI7XG5pbXBvcnQgeyBlcnJvclV0aWwgfSBmcm9tIFwiLi9oZWxwZXJzL2Vycm9yVXRpbC5qc1wiO1xuaW1wb3J0IHsgRElSVFksIElOVkFMSUQsIE9LLCBQYXJzZVN0YXR1cywgYWRkSXNzdWVUb0NvbnRleHQsIGlzQWJvcnRlZCwgaXNBc3luYywgaXNEaXJ0eSwgaXNWYWxpZCwgbWFrZUlzc3VlLCB9IGZyb20gXCIuL2hlbHBlcnMvcGFyc2VVdGlsLmpzXCI7XG5pbXBvcnQgeyB1dGlsLCBab2RQYXJzZWRUeXBlLCBnZXRQYXJzZWRUeXBlIH0gZnJvbSBcIi4vaGVscGVycy91dGlsLmpzXCI7XG5jbGFzcyBQYXJzZUlucHV0TGF6eVBhdGgge1xuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgdmFsdWUsIHBhdGgsIGtleSkge1xuICAgICAgICB0aGlzLl9jYWNoZWRQYXRoID0gW107XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgICAgICB0aGlzLmRhdGEgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5fcGF0aCA9IHBhdGg7XG4gICAgICAgIHRoaXMuX2tleSA9IGtleTtcbiAgICB9XG4gICAgZ2V0IHBhdGgoKSB7XG4gICAgICAgIGlmICghdGhpcy5fY2FjaGVkUGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMuX2tleSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZWRQYXRoLnB1c2goLi4udGhpcy5fcGF0aCwgLi4udGhpcy5fa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlZFBhdGgucHVzaCguLi50aGlzLl9wYXRoLCB0aGlzLl9rZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRQYXRoO1xuICAgIH1cbn1cbmNvbnN0IGhhbmRsZVJlc3VsdCA9IChjdHgsIHJlc3VsdCkgPT4ge1xuICAgIGlmIChpc1ZhbGlkKHJlc3VsdCkpIHtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0LnZhbHVlIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoIWN0eC5jb21tb24uaXNzdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVmFsaWRhdGlvbiBmYWlsZWQgYnV0IG5vIGlzc3VlcyBkZXRlY3RlZC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZ2V0IGVycm9yKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9lcnJvcilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Vycm9yO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IFpvZEVycm9yKGN0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9lcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9lcnJvcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxufTtcbmZ1bmN0aW9uIHByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSB7XG4gICAgaWYgKCFwYXJhbXMpXG4gICAgICAgIHJldHVybiB7fTtcbiAgICBjb25zdCB7IGVycm9yTWFwLCBpbnZhbGlkX3R5cGVfZXJyb3IsIHJlcXVpcmVkX2Vycm9yLCBkZXNjcmlwdGlvbiB9ID0gcGFyYW1zO1xuICAgIGlmIChlcnJvck1hcCAmJiAoaW52YWxpZF90eXBlX2Vycm9yIHx8IHJlcXVpcmVkX2Vycm9yKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IHVzZSBcImludmFsaWRfdHlwZV9lcnJvclwiIG9yIFwicmVxdWlyZWRfZXJyb3JcIiBpbiBjb25qdW5jdGlvbiB3aXRoIGN1c3RvbSBlcnJvciBtYXAuYCk7XG4gICAgfVxuICAgIGlmIChlcnJvck1hcClcbiAgICAgICAgcmV0dXJuIHsgZXJyb3JNYXA6IGVycm9yTWFwLCBkZXNjcmlwdGlvbiB9O1xuICAgIGNvbnN0IGN1c3RvbU1hcCA9IChpc3MsIGN0eCkgPT4ge1xuICAgICAgICBjb25zdCB7IG1lc3NhZ2UgfSA9IHBhcmFtcztcbiAgICAgICAgaWYgKGlzcy5jb2RlID09PSBcImludmFsaWRfZW51bV92YWx1ZVwiKSB7XG4gICAgICAgICAgICByZXR1cm4geyBtZXNzYWdlOiBtZXNzYWdlID8/IGN0eC5kZWZhdWx0RXJyb3IgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGN0eC5kYXRhID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4geyBtZXNzYWdlOiBtZXNzYWdlID8/IHJlcXVpcmVkX2Vycm9yID8/IGN0eC5kZWZhdWx0RXJyb3IgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNzLmNvZGUgIT09IFwiaW52YWxpZF90eXBlXCIpXG4gICAgICAgICAgICByZXR1cm4geyBtZXNzYWdlOiBjdHguZGVmYXVsdEVycm9yIH07XG4gICAgICAgIHJldHVybiB7IG1lc3NhZ2U6IG1lc3NhZ2UgPz8gaW52YWxpZF90eXBlX2Vycm9yID8/IGN0eC5kZWZhdWx0RXJyb3IgfTtcbiAgICB9O1xuICAgIHJldHVybiB7IGVycm9yTWFwOiBjdXN0b21NYXAsIGRlc2NyaXB0aW9uIH07XG59XG5leHBvcnQgY2xhc3MgWm9kVHlwZSB7XG4gICAgZ2V0IGRlc2NyaXB0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmRlc2NyaXB0aW9uO1xuICAgIH1cbiAgICBfZ2V0VHlwZShpbnB1dCkge1xuICAgICAgICByZXR1cm4gZ2V0UGFyc2VkVHlwZShpbnB1dC5kYXRhKTtcbiAgICB9XG4gICAgX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpIHtcbiAgICAgICAgcmV0dXJuIChjdHggfHwge1xuICAgICAgICAgICAgY29tbW9uOiBpbnB1dC5wYXJlbnQuY29tbW9uLFxuICAgICAgICAgICAgZGF0YTogaW5wdXQuZGF0YSxcbiAgICAgICAgICAgIHBhcnNlZFR5cGU6IGdldFBhcnNlZFR5cGUoaW5wdXQuZGF0YSksXG4gICAgICAgICAgICBzY2hlbWFFcnJvck1hcDogdGhpcy5fZGVmLmVycm9yTWFwLFxuICAgICAgICAgICAgcGF0aDogaW5wdXQucGF0aCxcbiAgICAgICAgICAgIHBhcmVudDogaW5wdXQucGFyZW50LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhdHVzOiBuZXcgUGFyc2VTdGF0dXMoKSxcbiAgICAgICAgICAgIGN0eDoge1xuICAgICAgICAgICAgICAgIGNvbW1vbjogaW5wdXQucGFyZW50LmNvbW1vbixcbiAgICAgICAgICAgICAgICBkYXRhOiBpbnB1dC5kYXRhLFxuICAgICAgICAgICAgICAgIHBhcnNlZFR5cGU6IGdldFBhcnNlZFR5cGUoaW5wdXQuZGF0YSksXG4gICAgICAgICAgICAgICAgc2NoZW1hRXJyb3JNYXA6IHRoaXMuX2RlZi5lcnJvck1hcCxcbiAgICAgICAgICAgICAgICBwYXRoOiBpbnB1dC5wYXRoLFxuICAgICAgICAgICAgICAgIHBhcmVudDogaW5wdXQucGFyZW50LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgX3BhcnNlU3luYyhpbnB1dCkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wYXJzZShpbnB1dCk7XG4gICAgICAgIGlmIChpc0FzeW5jKHJlc3VsdCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlN5bmNocm9ub3VzIHBhcnNlIGVuY291bnRlcmVkIHByb21pc2UuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIF9wYXJzZUFzeW5jKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3BhcnNlKGlucHV0KTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXN1bHQpO1xuICAgIH1cbiAgICBwYXJzZShkYXRhLCBwYXJhbXMpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5zYWZlUGFyc2UoZGF0YSwgcGFyYW1zKTtcbiAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5kYXRhO1xuICAgICAgICB0aHJvdyByZXN1bHQuZXJyb3I7XG4gICAgfVxuICAgIHNhZmVQYXJzZShkYXRhLCBwYXJhbXMpIHtcbiAgICAgICAgY29uc3QgY3R4ID0ge1xuICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgICAgICBhc3luYzogcGFyYW1zPy5hc3luYyA/PyBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250ZXh0dWFsRXJyb3JNYXA6IHBhcmFtcz8uZXJyb3JNYXAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogcGFyYW1zPy5wYXRoIHx8IFtdLFxuICAgICAgICAgICAgc2NoZW1hRXJyb3JNYXA6IHRoaXMuX2RlZi5lcnJvck1hcCxcbiAgICAgICAgICAgIHBhcmVudDogbnVsbCxcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBwYXJzZWRUeXBlOiBnZXRQYXJzZWRUeXBlKGRhdGEpLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wYXJzZVN5bmMoeyBkYXRhLCBwYXRoOiBjdHgucGF0aCwgcGFyZW50OiBjdHggfSk7XG4gICAgICAgIHJldHVybiBoYW5kbGVSZXN1bHQoY3R4LCByZXN1bHQpO1xuICAgIH1cbiAgICBcIn52YWxpZGF0ZVwiKGRhdGEpIHtcbiAgICAgICAgY29uc3QgY3R4ID0ge1xuICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgICAgICBhc3luYzogISF0aGlzW1wifnN0YW5kYXJkXCJdLmFzeW5jLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdGg6IFtdLFxuICAgICAgICAgICAgc2NoZW1hRXJyb3JNYXA6IHRoaXMuX2RlZi5lcnJvck1hcCxcbiAgICAgICAgICAgIHBhcmVudDogbnVsbCxcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBwYXJzZWRUeXBlOiBnZXRQYXJzZWRUeXBlKGRhdGEpLFxuICAgICAgICB9O1xuICAgICAgICBpZiAoIXRoaXNbXCJ+c3RhbmRhcmRcIl0uYXN5bmMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcGFyc2VTeW5jKHsgZGF0YSwgcGF0aDogW10sIHBhcmVudDogY3R4IH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBpc1ZhbGlkKHJlc3VsdClcbiAgICAgICAgICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmVzdWx0LnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiBjdHguY29tbW9uLmlzc3VlcyxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyPy5tZXNzYWdlPy50b0xvd2VyQ2FzZSgpPy5pbmNsdWRlcyhcImVuY291bnRlcmVkXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNbXCJ+c3RhbmRhcmRcIl0uYXN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdHguY29tbW9uID0ge1xuICAgICAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICBhc3luYzogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJzZUFzeW5jKHsgZGF0YSwgcGF0aDogW10sIHBhcmVudDogY3R4IH0pLnRoZW4oKHJlc3VsdCkgPT4gaXNWYWxpZChyZXN1bHQpXG4gICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogcmVzdWx0LnZhbHVlLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgaXNzdWVzOiBjdHguY29tbW9uLmlzc3VlcyxcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICBhc3luYyBwYXJzZUFzeW5jKGRhdGEsIHBhcmFtcykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnNhZmVQYXJzZUFzeW5jKGRhdGEsIHBhcmFtcyk7XG4gICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcylcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuZGF0YTtcbiAgICAgICAgdGhyb3cgcmVzdWx0LmVycm9yO1xuICAgIH1cbiAgICBhc3luYyBzYWZlUGFyc2VBc3luYyhkYXRhLCBwYXJhbXMpIHtcbiAgICAgICAgY29uc3QgY3R4ID0ge1xuICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgICAgICBjb250ZXh0dWFsRXJyb3JNYXA6IHBhcmFtcz8uZXJyb3JNYXAsXG4gICAgICAgICAgICAgICAgYXN5bmM6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogcGFyYW1zPy5wYXRoIHx8IFtdLFxuICAgICAgICAgICAgc2NoZW1hRXJyb3JNYXA6IHRoaXMuX2RlZi5lcnJvck1hcCxcbiAgICAgICAgICAgIHBhcmVudDogbnVsbCxcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBwYXJzZWRUeXBlOiBnZXRQYXJzZWRUeXBlKGRhdGEpLFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBtYXliZUFzeW5jUmVzdWx0ID0gdGhpcy5fcGFyc2UoeyBkYXRhLCBwYXRoOiBjdHgucGF0aCwgcGFyZW50OiBjdHggfSk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IChpc0FzeW5jKG1heWJlQXN5bmNSZXN1bHQpID8gbWF5YmVBc3luY1Jlc3VsdCA6IFByb21pc2UucmVzb2x2ZShtYXliZUFzeW5jUmVzdWx0KSk7XG4gICAgICAgIHJldHVybiBoYW5kbGVSZXN1bHQoY3R4LCByZXN1bHQpO1xuICAgIH1cbiAgICByZWZpbmUoY2hlY2ssIG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc3QgZ2V0SXNzdWVQcm9wZXJ0aWVzID0gKHZhbCkgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBtZXNzYWdlID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiBtZXNzYWdlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgbWVzc2FnZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIG1lc3NhZ2UgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlKHZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmluZW1lbnQoKHZhbCwgY3R4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBjaGVjayh2YWwpO1xuICAgICAgICAgICAgY29uc3Qgc2V0RXJyb3IgPSAoKSA9PiBjdHguYWRkSXNzdWUoe1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5jdXN0b20sXG4gICAgICAgICAgICAgICAgLi4uZ2V0SXNzdWVQcm9wZXJ0aWVzKHZhbCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgUHJvbWlzZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiByZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0RXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHNldEVycm9yKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZWZpbmVtZW50KGNoZWNrLCByZWZpbmVtZW50RGF0YSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVmaW5lbWVudCgodmFsLCBjdHgpID0+IHtcbiAgICAgICAgICAgIGlmICghY2hlY2sodmFsKSkge1xuICAgICAgICAgICAgICAgIGN0eC5hZGRJc3N1ZSh0eXBlb2YgcmVmaW5lbWVudERhdGEgPT09IFwiZnVuY3Rpb25cIiA/IHJlZmluZW1lbnREYXRhKHZhbCwgY3R4KSA6IHJlZmluZW1lbnREYXRhKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9yZWZpbmVtZW50KHJlZmluZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RFZmZlY3RzKHtcbiAgICAgICAgICAgIHNjaGVtYTogdGhpcyxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRWZmZWN0cyxcbiAgICAgICAgICAgIGVmZmVjdDogeyB0eXBlOiBcInJlZmluZW1lbnRcIiwgcmVmaW5lbWVudCB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc3VwZXJSZWZpbmUocmVmaW5lbWVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVmaW5lbWVudChyZWZpbmVtZW50KTtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoZGVmKSB7XG4gICAgICAgIC8qKiBBbGlhcyBvZiBzYWZlUGFyc2VBc3luYyAqL1xuICAgICAgICB0aGlzLnNwYSA9IHRoaXMuc2FmZVBhcnNlQXN5bmM7XG4gICAgICAgIHRoaXMuX2RlZiA9IGRlZjtcbiAgICAgICAgdGhpcy5wYXJzZSA9IHRoaXMucGFyc2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zYWZlUGFyc2UgPSB0aGlzLnNhZmVQYXJzZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnBhcnNlQXN5bmMgPSB0aGlzLnBhcnNlQXN5bmMuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zYWZlUGFyc2VBc3luYyA9IHRoaXMuc2FmZVBhcnNlQXN5bmMuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zcGEgPSB0aGlzLnNwYS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnJlZmluZSA9IHRoaXMucmVmaW5lLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucmVmaW5lbWVudCA9IHRoaXMucmVmaW5lbWVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnN1cGVyUmVmaW5lID0gdGhpcy5zdXBlclJlZmluZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9wdGlvbmFsID0gdGhpcy5vcHRpb25hbC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm51bGxhYmxlID0gdGhpcy5udWxsYWJsZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm51bGxpc2ggPSB0aGlzLm51bGxpc2guYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5hcnJheSA9IHRoaXMuYXJyYXkuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5wcm9taXNlID0gdGhpcy5wcm9taXNlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub3IgPSB0aGlzLm9yLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYW5kID0gdGhpcy5hbmQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0gPSB0aGlzLnRyYW5zZm9ybS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJyYW5kID0gdGhpcy5icmFuZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmRlZmF1bHQgPSB0aGlzLmRlZmF1bHQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5jYXRjaCA9IHRoaXMuY2F0Y2guYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5kZXNjcmliZSA9IHRoaXMuZGVzY3JpYmUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5waXBlID0gdGhpcy5waXBlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucmVhZG9ubHkgPSB0aGlzLnJlYWRvbmx5LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaXNOdWxsYWJsZSA9IHRoaXMuaXNOdWxsYWJsZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmlzT3B0aW9uYWwgPSB0aGlzLmlzT3B0aW9uYWwuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpc1tcIn5zdGFuZGFyZFwiXSA9IHtcbiAgICAgICAgICAgIHZlcnNpb246IDEsXG4gICAgICAgICAgICB2ZW5kb3I6IFwiem9kXCIsXG4gICAgICAgICAgICB2YWxpZGF0ZTogKGRhdGEpID0+IHRoaXNbXCJ+dmFsaWRhdGVcIl0oZGF0YSksXG4gICAgICAgIH07XG4gICAgfVxuICAgIG9wdGlvbmFsKCkge1xuICAgICAgICByZXR1cm4gWm9kT3B0aW9uYWwuY3JlYXRlKHRoaXMsIHRoaXMuX2RlZik7XG4gICAgfVxuICAgIG51bGxhYmxlKCkge1xuICAgICAgICByZXR1cm4gWm9kTnVsbGFibGUuY3JlYXRlKHRoaXMsIHRoaXMuX2RlZik7XG4gICAgfVxuICAgIG51bGxpc2goKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm51bGxhYmxlKCkub3B0aW9uYWwoKTtcbiAgICB9XG4gICAgYXJyYXkoKSB7XG4gICAgICAgIHJldHVybiBab2RBcnJheS5jcmVhdGUodGhpcyk7XG4gICAgfVxuICAgIHByb21pc2UoKSB7XG4gICAgICAgIHJldHVybiBab2RQcm9taXNlLmNyZWF0ZSh0aGlzLCB0aGlzLl9kZWYpO1xuICAgIH1cbiAgICBvcihvcHRpb24pIHtcbiAgICAgICAgcmV0dXJuIFpvZFVuaW9uLmNyZWF0ZShbdGhpcywgb3B0aW9uXSwgdGhpcy5fZGVmKTtcbiAgICB9XG4gICAgYW5kKGluY29taW5nKSB7XG4gICAgICAgIHJldHVybiBab2RJbnRlcnNlY3Rpb24uY3JlYXRlKHRoaXMsIGluY29taW5nLCB0aGlzLl9kZWYpO1xuICAgIH1cbiAgICB0cmFuc2Zvcm0odHJhbnNmb3JtKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRWZmZWN0cyh7XG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHRoaXMuX2RlZiksXG4gICAgICAgICAgICBzY2hlbWE6IHRoaXMsXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVmZmVjdHMsXG4gICAgICAgICAgICBlZmZlY3Q6IHsgdHlwZTogXCJ0cmFuc2Zvcm1cIiwgdHJhbnNmb3JtIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBkZWZhdWx0KGRlZikge1xuICAgICAgICBjb25zdCBkZWZhdWx0VmFsdWVGdW5jID0gdHlwZW9mIGRlZiA9PT0gXCJmdW5jdGlvblwiID8gZGVmIDogKCkgPT4gZGVmO1xuICAgICAgICByZXR1cm4gbmV3IFpvZERlZmF1bHQoe1xuICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyh0aGlzLl9kZWYpLFxuICAgICAgICAgICAgaW5uZXJUeXBlOiB0aGlzLFxuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBkZWZhdWx0VmFsdWVGdW5jLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2REZWZhdWx0LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYnJhbmQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQnJhbmRlZCh7XG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEJyYW5kZWQsXG4gICAgICAgICAgICB0eXBlOiB0aGlzLFxuICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyh0aGlzLl9kZWYpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgY2F0Y2goZGVmKSB7XG4gICAgICAgIGNvbnN0IGNhdGNoVmFsdWVGdW5jID0gdHlwZW9mIGRlZiA9PT0gXCJmdW5jdGlvblwiID8gZGVmIDogKCkgPT4gZGVmO1xuICAgICAgICByZXR1cm4gbmV3IFpvZENhdGNoKHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXModGhpcy5fZGVmKSxcbiAgICAgICAgICAgIGlubmVyVHlwZTogdGhpcyxcbiAgICAgICAgICAgIGNhdGNoVmFsdWU6IGNhdGNoVmFsdWVGdW5jLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RDYXRjaCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGRlc2NyaWJlKGRlc2NyaXB0aW9uKSB7XG4gICAgICAgIGNvbnN0IFRoaXMgPSB0aGlzLmNvbnN0cnVjdG9yO1xuICAgICAgICByZXR1cm4gbmV3IFRoaXMoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwaXBlKHRhcmdldCkge1xuICAgICAgICByZXR1cm4gWm9kUGlwZWxpbmUuY3JlYXRlKHRoaXMsIHRhcmdldCk7XG4gICAgfVxuICAgIHJlYWRvbmx5KCkge1xuICAgICAgICByZXR1cm4gWm9kUmVhZG9ubHkuY3JlYXRlKHRoaXMpO1xuICAgIH1cbiAgICBpc09wdGlvbmFsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zYWZlUGFyc2UodW5kZWZpbmVkKS5zdWNjZXNzO1xuICAgIH1cbiAgICBpc051bGxhYmxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zYWZlUGFyc2UobnVsbCkuc3VjY2VzcztcbiAgICB9XG59XG5jb25zdCBjdWlkUmVnZXggPSAvXmNbXlxccy1dezgsfSQvaTtcbmNvbnN0IGN1aWQyUmVnZXggPSAvXlswLTlhLXpdKyQvO1xuY29uc3QgdWxpZFJlZ2V4ID0gL15bMC05QS1ISktNTlAtVFYtWl17MjZ9JC9pO1xuLy8gY29uc3QgdXVpZFJlZ2V4ID1cbi8vICAgL14oW2EtZjAtOV17OH0tW2EtZjAtOV17NH0tWzEtNV1bYS1mMC05XXszfS1bYS1mMC05XXs0fS1bYS1mMC05XXsxMn18MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwKSQvaTtcbmNvbnN0IHV1aWRSZWdleCA9IC9eWzAtOWEtZkEtRl17OH1cXGItWzAtOWEtZkEtRl17NH1cXGItWzAtOWEtZkEtRl17NH1cXGItWzAtOWEtZkEtRl17NH1cXGItWzAtOWEtZkEtRl17MTJ9JC9pO1xuY29uc3QgbmFub2lkUmVnZXggPSAvXlthLXowLTlfLV17MjF9JC9pO1xuY29uc3Qgand0UmVnZXggPSAvXltBLVphLXowLTktX10rXFwuW0EtWmEtejAtOS1fXStcXC5bQS1aYS16MC05LV9dKiQvO1xuY29uc3QgZHVyYXRpb25SZWdleCA9IC9eWy0rXT9QKD8hJCkoPzooPzpbLStdP1xcZCtZKXwoPzpbLStdP1xcZCtbLixdXFxkK1kkKSk/KD86KD86Wy0rXT9cXGQrTSl8KD86Wy0rXT9cXGQrWy4sXVxcZCtNJCkpPyg/Oig/OlstK10/XFxkK1cpfCg/OlstK10/XFxkK1suLF1cXGQrVyQpKT8oPzooPzpbLStdP1xcZCtEKXwoPzpbLStdP1xcZCtbLixdXFxkK0QkKSk/KD86VCg/PVtcXGQrLV0pKD86KD86Wy0rXT9cXGQrSCl8KD86Wy0rXT9cXGQrWy4sXVxcZCtIJCkpPyg/Oig/OlstK10/XFxkK00pfCg/OlstK10/XFxkK1suLF1cXGQrTSQpKT8oPzpbLStdP1xcZCsoPzpbLixdXFxkKyk/Uyk/KT8/JC87XG4vLyBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS80NjE4MS8xNTUwMTU1XG4vLyBvbGQgdmVyc2lvbjogdG9vIHNsb3csIGRpZG4ndCBzdXBwb3J0IHVuaWNvZGVcbi8vIGNvbnN0IGVtYWlsUmVnZXggPSAvXigoKFthLXpdfFxcZHxbISNcXCQlJidcXCpcXCtcXC1cXC89XFw/XFxeX2B7XFx8fX5dfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSsoXFwuKFthLXpdfFxcZHxbISNcXCQlJidcXCpcXCtcXC1cXC89XFw/XFxeX2B7XFx8fX5dfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSspKil8KChcXHgyMikoKCgoXFx4MjB8XFx4MDkpKihcXHgwZFxceDBhKSk/KFxceDIwfFxceDA5KSspPygoW1xceDAxLVxceDA4XFx4MGJcXHgwY1xceDBlLVxceDFmXFx4N2ZdfFxceDIxfFtcXHgyMy1cXHg1Yl18W1xceDVkLVxceDdlXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KFxcXFwoW1xceDAxLVxceDA5XFx4MGJcXHgwY1xceDBkLVxceDdmXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKSkqKCgoXFx4MjB8XFx4MDkpKihcXHgwZFxceDBhKSk/KFxceDIwfFxceDA5KSspPyhcXHgyMikpKUAoKChbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuKSsoKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKShbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSooW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSkkL2k7XG4vL29sZCBlbWFpbCByZWdleFxuLy8gY29uc3QgZW1haWxSZWdleCA9IC9eKChbXjw+KClbXFxdLiw7Olxcc0BcIl0rKFxcLltePD4oKVtcXF0uLDs6XFxzQFwiXSspKil8KFwiLitcIikpQCgoPyEtKShbXjw+KClbXFxdLiw7Olxcc0BcIl0rXFwuKStbXjw+KClbXFxdLiw7Olxcc0BcIl17MSx9KVteLTw+KClbXFxdLiw7Olxcc0BcIl0kL2k7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbi8vIGNvbnN0IGVtYWlsUmVnZXggPVxuLy8gICAvXigoW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKyhcXC5bXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKSopfChcXFwiLitcXFwiKSlAKChcXFsoKCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSlcXC4pezN9KCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSlcXF0pfChcXFtJUHY2OigoW2EtZjAtOV17MSw0fTopezd9fDo6KFthLWYwLTldezEsNH06KXswLDZ9fChbYS1mMC05XXsxLDR9Oil7MX06KFthLWYwLTldezEsNH06KXswLDV9fChbYS1mMC05XXsxLDR9Oil7Mn06KFthLWYwLTldezEsNH06KXswLDR9fChbYS1mMC05XXsxLDR9Oil7M306KFthLWYwLTldezEsNH06KXswLDN9fChbYS1mMC05XXsxLDR9Oil7NH06KFthLWYwLTldezEsNH06KXswLDJ9fChbYS1mMC05XXsxLDR9Oil7NX06KFthLWYwLTldezEsNH06KXswLDF9KShbYS1mMC05XXsxLDR9fCgoKDI1WzAtNV0pfCgyWzAtNF1bMC05XSl8KDFbMC05XXsyfSl8KFswLTldezEsMn0pKVxcLil7M30oKDI1WzAtNV0pfCgyWzAtNF1bMC05XSl8KDFbMC05XXsyfSl8KFswLTldezEsMn0pKSlcXF0pfChbQS1aYS16MC05XShbQS1aYS16MC05LV0qW0EtWmEtejAtOV0pKihcXC5bQS1aYS16XXsyLH0pKykpJC87XG4vLyBjb25zdCBlbWFpbFJlZ2V4ID1cbi8vICAgL15bYS16QS1aMC05XFwuXFwhXFwjXFwkXFwlXFwmXFwnXFwqXFwrXFwvXFw9XFw/XFxeXFxfXFxgXFx7XFx8XFx9XFx+XFwtXStAW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KD86XFwuW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KSokLztcbi8vIGNvbnN0IGVtYWlsUmVnZXggPVxuLy8gICAvXig/OlthLXowLTkhIyQlJicqKy89P15fYHt8fX4tXSsoPzpcXC5bYS16MC05ISMkJSYnKisvPT9eX2B7fH1+LV0rKSp8XCIoPzpbXFx4MDEtXFx4MDhcXHgwYlxceDBjXFx4MGUtXFx4MWZcXHgyMVxceDIzLVxceDViXFx4NWQtXFx4N2ZdfFxcXFxbXFx4MDEtXFx4MDlcXHgwYlxceDBjXFx4MGUtXFx4N2ZdKSpcIilAKD86KD86W2EtejAtOV0oPzpbYS16MC05LV0qW2EtejAtOV0pP1xcLikrW2EtejAtOV0oPzpbYS16MC05LV0qW2EtejAtOV0pP3xcXFsoPzooPzoyNVswLTVdfDJbMC00XVswLTldfFswMV0/WzAtOV1bMC05XT8pXFwuKXszfSg/OjI1WzAtNV18MlswLTRdWzAtOV18WzAxXT9bMC05XVswLTldP3xbYS16MC05LV0qW2EtejAtOV06KD86W1xceDAxLVxceDA4XFx4MGJcXHgwY1xceDBlLVxceDFmXFx4MjEtXFx4NWFcXHg1My1cXHg3Zl18XFxcXFtcXHgwMS1cXHgwOVxceDBiXFx4MGNcXHgwZS1cXHg3Zl0pKylcXF0pJC9pO1xuY29uc3QgZW1haWxSZWdleCA9IC9eKD8hXFwuKSg/IS4qXFwuXFwuKShbQS1aMC05XycrXFwtXFwuXSopW0EtWjAtOV8rLV1AKFtBLVowLTldW0EtWjAtOVxcLV0qXFwuKStbQS1aXXsyLH0kL2k7XG4vLyBjb25zdCBlbWFpbFJlZ2V4ID1cbi8vICAgL15bYS16MC05LiEjJCUmXHUyMDE5KisvPT9eX2B7fH1+LV0rQFthLXowLTktXSsoPzpcXC5bYS16MC05XFwtXSspKiQvaTtcbi8vIGZyb20gaHR0cHM6Ly90aGVrZXZpbnNjb3R0LmNvbS9lbW9qaXMtaW4tamF2YXNjcmlwdC8jd3JpdGluZy1hLXJlZ3VsYXItZXhwcmVzc2lvblxuY29uc3QgX2Vtb2ppUmVnZXggPSBgXihcXFxccHtFeHRlbmRlZF9QaWN0b2dyYXBoaWN9fFxcXFxwe0Vtb2ppX0NvbXBvbmVudH0pKyRgO1xubGV0IGVtb2ppUmVnZXg7XG4vLyBmYXN0ZXIsIHNpbXBsZXIsIHNhZmVyXG5jb25zdCBpcHY0UmVnZXggPSAvXig/Oig/OjI1WzAtNV18MlswLTRdWzAtOV18MVswLTldWzAtOV18WzEtOV1bMC05XXxbMC05XSlcXC4pezN9KD86MjVbMC01XXwyWzAtNF1bMC05XXwxWzAtOV1bMC05XXxbMS05XVswLTldfFswLTldKSQvO1xuY29uc3QgaXB2NENpZHJSZWdleCA9IC9eKD86KD86MjVbMC01XXwyWzAtNF1bMC05XXwxWzAtOV1bMC05XXxbMS05XVswLTldfFswLTldKVxcLil7M30oPzoyNVswLTVdfDJbMC00XVswLTldfDFbMC05XVswLTldfFsxLTldWzAtOV18WzAtOV0pXFwvKDNbMC0yXXxbMTJdP1swLTldKSQvO1xuLy8gY29uc3QgaXB2NlJlZ2V4ID1cbi8vIC9eKChbYS1mMC05XXsxLDR9Oil7N318OjooW2EtZjAtOV17MSw0fTopezAsNn18KFthLWYwLTldezEsNH06KXsxfTooW2EtZjAtOV17MSw0fTopezAsNX18KFthLWYwLTldezEsNH06KXsyfTooW2EtZjAtOV17MSw0fTopezAsNH18KFthLWYwLTldezEsNH06KXszfTooW2EtZjAtOV17MSw0fTopezAsM318KFthLWYwLTldezEsNH06KXs0fTooW2EtZjAtOV17MSw0fTopezAsMn18KFthLWYwLTldezEsNH06KXs1fTooW2EtZjAtOV17MSw0fTopezAsMX0pKFthLWYwLTldezEsNH18KCgoMjVbMC01XSl8KDJbMC00XVswLTldKXwoMVswLTldezJ9KXwoWzAtOV17MSwyfSkpXFwuKXszfSgoMjVbMC01XSl8KDJbMC00XVswLTldKXwoMVswLTldezJ9KXwoWzAtOV17MSwyfSkpKSQvO1xuY29uc3QgaXB2NlJlZ2V4ID0gL14oKFswLTlhLWZBLUZdezEsNH06KXs3LDd9WzAtOWEtZkEtRl17MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsN306fChbMC05YS1mQS1GXXsxLDR9Oil7MSw2fTpbMC05YS1mQS1GXXsxLDR9fChbMC05YS1mQS1GXXsxLDR9Oil7MSw1fSg6WzAtOWEtZkEtRl17MSw0fSl7MSwyfXwoWzAtOWEtZkEtRl17MSw0fTopezEsNH0oOlswLTlhLWZBLUZdezEsNH0pezEsM318KFswLTlhLWZBLUZdezEsNH06KXsxLDN9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDR9fChbMC05YS1mQS1GXXsxLDR9Oil7MSwyfSg6WzAtOWEtZkEtRl17MSw0fSl7MSw1fXxbMC05YS1mQS1GXXsxLDR9OigoOlswLTlhLWZBLUZdezEsNH0pezEsNn0pfDooKDpbMC05YS1mQS1GXXsxLDR9KXsxLDd9fDopfGZlODA6KDpbMC05YS1mQS1GXXswLDR9KXswLDR9JVswLTlhLXpBLVpdezEsfXw6OihmZmZmKDowezEsNH0pezAsMX06KXswLDF9KCgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSlcXC4pezMsM30oMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pfChbMC05YS1mQS1GXXsxLDR9Oil7MSw0fTooKDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKVxcLil7MywzfSgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSkpJC87XG5jb25zdCBpcHY2Q2lkclJlZ2V4ID0gL14oKFswLTlhLWZBLUZdezEsNH06KXs3LDd9WzAtOWEtZkEtRl17MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsN306fChbMC05YS1mQS1GXXsxLDR9Oil7MSw2fTpbMC05YS1mQS1GXXsxLDR9fChbMC05YS1mQS1GXXsxLDR9Oil7MSw1fSg6WzAtOWEtZkEtRl17MSw0fSl7MSwyfXwoWzAtOWEtZkEtRl17MSw0fTopezEsNH0oOlswLTlhLWZBLUZdezEsNH0pezEsM318KFswLTlhLWZBLUZdezEsNH06KXsxLDN9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDR9fChbMC05YS1mQS1GXXsxLDR9Oil7MSwyfSg6WzAtOWEtZkEtRl17MSw0fSl7MSw1fXxbMC05YS1mQS1GXXsxLDR9OigoOlswLTlhLWZBLUZdezEsNH0pezEsNn0pfDooKDpbMC05YS1mQS1GXXsxLDR9KXsxLDd9fDopfGZlODA6KDpbMC05YS1mQS1GXXswLDR9KXswLDR9JVswLTlhLXpBLVpdezEsfXw6OihmZmZmKDowezEsNH0pezAsMX06KXswLDF9KCgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSlcXC4pezMsM30oMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pfChbMC05YS1mQS1GXXsxLDR9Oil7MSw0fTooKDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKVxcLil7MywzfSgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSkpXFwvKDEyWzAtOF18MVswMV1bMC05XXxbMS05XT9bMC05XSkkLztcbi8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzc4NjAzOTIvZGV0ZXJtaW5lLWlmLXN0cmluZy1pcy1pbi1iYXNlNjQtdXNpbmctamF2YXNjcmlwdFxuY29uc3QgYmFzZTY0UmVnZXggPSAvXihbMC05YS16QS1aKy9dezR9KSooKFswLTlhLXpBLVorL117Mn09PSl8KFswLTlhLXpBLVorL117M309KSk/JC87XG4vLyBodHRwczovL2Jhc2U2NC5ndXJ1L3N0YW5kYXJkcy9iYXNlNjR1cmxcbmNvbnN0IGJhc2U2NHVybFJlZ2V4ID0gL14oWzAtOWEtekEtWi1fXXs0fSkqKChbMC05YS16QS1aLV9dezJ9KD09KT8pfChbMC05YS16QS1aLV9dezN9KD0pPykpPyQvO1xuLy8gc2ltcGxlXG4vLyBjb25zdCBkYXRlUmVnZXhTb3VyY2UgPSBgXFxcXGR7NH0tXFxcXGR7Mn0tXFxcXGR7Mn1gO1xuLy8gbm8gbGVhcCB5ZWFyIHZhbGlkYXRpb25cbi8vIGNvbnN0IGRhdGVSZWdleFNvdXJjZSA9IGBcXFxcZHs0fS0oKDBbMTM1NzhdfDEwfDEyKS0zMXwoMFsxMy05XXwxWzAtMl0pLTMwfCgwWzEtOV18MVswLTJdKS0oMFsxLTldfDFcXFxcZHwyXFxcXGQpKWA7XG4vLyB3aXRoIGxlYXAgeWVhciB2YWxpZGF0aW9uXG5jb25zdCBkYXRlUmVnZXhTb3VyY2UgPSBgKChcXFxcZFxcXFxkWzI0NjhdWzA0OF18XFxcXGRcXFxcZFsxMzU3OV1bMjZdfFxcXFxkXFxcXGQwWzQ4XXxbMDI0NjhdWzA0OF0wMHxbMTM1NzldWzI2XTAwKS0wMi0yOXxcXFxcZHs0fS0oKDBbMTM1NzhdfDFbMDJdKS0oMFsxLTldfFsxMl1cXFxcZHwzWzAxXSl8KDBbNDY5XXwxMSktKDBbMS05XXxbMTJdXFxcXGR8MzApfCgwMiktKDBbMS05XXwxXFxcXGR8MlswLThdKSkpYDtcbmNvbnN0IGRhdGVSZWdleCA9IG5ldyBSZWdFeHAoYF4ke2RhdGVSZWdleFNvdXJjZX0kYCk7XG5mdW5jdGlvbiB0aW1lUmVnZXhTb3VyY2UoYXJncykge1xuICAgIGxldCBzZWNvbmRzUmVnZXhTb3VyY2UgPSBgWzAtNV1cXFxcZGA7XG4gICAgaWYgKGFyZ3MucHJlY2lzaW9uKSB7XG4gICAgICAgIHNlY29uZHNSZWdleFNvdXJjZSA9IGAke3NlY29uZHNSZWdleFNvdXJjZX1cXFxcLlxcXFxkeyR7YXJncy5wcmVjaXNpb259fWA7XG4gICAgfVxuICAgIGVsc2UgaWYgKGFyZ3MucHJlY2lzaW9uID09IG51bGwpIHtcbiAgICAgICAgc2Vjb25kc1JlZ2V4U291cmNlID0gYCR7c2Vjb25kc1JlZ2V4U291cmNlfShcXFxcLlxcXFxkKyk/YDtcbiAgICB9XG4gICAgY29uc3Qgc2Vjb25kc1F1YW50aWZpZXIgPSBhcmdzLnByZWNpc2lvbiA/IFwiK1wiIDogXCI/XCI7IC8vIHJlcXVpcmUgc2Vjb25kcyBpZiBwcmVjaXNpb24gaXMgbm9uemVyb1xuICAgIHJldHVybiBgKFswMV1cXFxcZHwyWzAtM10pOlswLTVdXFxcXGQoOiR7c2Vjb25kc1JlZ2V4U291cmNlfSkke3NlY29uZHNRdWFudGlmaWVyfWA7XG59XG5mdW5jdGlvbiB0aW1lUmVnZXgoYXJncykge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHt0aW1lUmVnZXhTb3VyY2UoYXJncyl9JGApO1xufVxuLy8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zMTQzMjMxXG5leHBvcnQgZnVuY3Rpb24gZGF0ZXRpbWVSZWdleChhcmdzKSB7XG4gICAgbGV0IHJlZ2V4ID0gYCR7ZGF0ZVJlZ2V4U291cmNlfVQke3RpbWVSZWdleFNvdXJjZShhcmdzKX1gO1xuICAgIGNvbnN0IG9wdHMgPSBbXTtcbiAgICBvcHRzLnB1c2goYXJncy5sb2NhbCA/IGBaP2AgOiBgWmApO1xuICAgIGlmIChhcmdzLm9mZnNldClcbiAgICAgICAgb3B0cy5wdXNoKGAoWystXVxcXFxkezJ9Oj9cXFxcZHsyfSlgKTtcbiAgICByZWdleCA9IGAke3JlZ2V4fSgke29wdHMuam9pbihcInxcIil9KWA7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4ke3JlZ2V4fSRgKTtcbn1cbmZ1bmN0aW9uIGlzVmFsaWRJUChpcCwgdmVyc2lvbikge1xuICAgIGlmICgodmVyc2lvbiA9PT0gXCJ2NFwiIHx8ICF2ZXJzaW9uKSAmJiBpcHY0UmVnZXgudGVzdChpcCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICgodmVyc2lvbiA9PT0gXCJ2NlwiIHx8ICF2ZXJzaW9uKSAmJiBpcHY2UmVnZXgudGVzdChpcCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIGlzVmFsaWRKV1Qoand0LCBhbGcpIHtcbiAgICBpZiAoIWp3dFJlZ2V4LnRlc3Qoand0KSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IFtoZWFkZXJdID0gand0LnNwbGl0KFwiLlwiKTtcbiAgICAgICAgaWYgKCFoZWFkZXIpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vIENvbnZlcnQgYmFzZTY0dXJsIHRvIGJhc2U2NFxuICAgICAgICBjb25zdCBiYXNlNjQgPSBoZWFkZXJcbiAgICAgICAgICAgIC5yZXBsYWNlKC8tL2csIFwiK1wiKVxuICAgICAgICAgICAgLnJlcGxhY2UoL18vZywgXCIvXCIpXG4gICAgICAgICAgICAucGFkRW5kKGhlYWRlci5sZW5ndGggKyAoKDQgLSAoaGVhZGVyLmxlbmd0aCAlIDQpKSAlIDQpLCBcIj1cIik7XG4gICAgICAgIGNvbnN0IGRlY29kZWQgPSBKU09OLnBhcnNlKGF0b2IoYmFzZTY0KSk7XG4gICAgICAgIGlmICh0eXBlb2YgZGVjb2RlZCAhPT0gXCJvYmplY3RcIiB8fCBkZWNvZGVkID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoXCJ0eXBcIiBpbiBkZWNvZGVkICYmIGRlY29kZWQ/LnR5cCAhPT0gXCJKV1RcIilcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKCFkZWNvZGVkLmFsZylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKGFsZyAmJiBkZWNvZGVkLmFsZyAhPT0gYWxnKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuZnVuY3Rpb24gaXNWYWxpZENpZHIoaXAsIHZlcnNpb24pIHtcbiAgICBpZiAoKHZlcnNpb24gPT09IFwidjRcIiB8fCAhdmVyc2lvbikgJiYgaXB2NENpZHJSZWdleC50ZXN0KGlwKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKCh2ZXJzaW9uID09PSBcInY2XCIgfHwgIXZlcnNpb24pICYmIGlwdjZDaWRyUmVnZXgudGVzdChpcCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmV4cG9ydCBjbGFzcyBab2RTdHJpbmcgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RlZi5jb2VyY2UpIHtcbiAgICAgICAgICAgIGlucHV0LmRhdGEgPSBTdHJpbmcoaW5wdXQuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5zdHJpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuc3RyaW5nLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc3RhdHVzID0gbmV3IFBhcnNlU3RhdHVzKCk7XG4gICAgICAgIGxldCBjdHggPSB1bmRlZmluZWQ7XG4gICAgICAgIGZvciAoY29uc3QgY2hlY2sgb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoZWNrLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuZGF0YS5sZW5ndGggPCBjaGVjay52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuZGF0YS5sZW5ndGggPiBjaGVjay52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImxlbmd0aFwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vQmlnID0gaW5wdXQuZGF0YS5sZW5ndGggPiBjaGVjay52YWx1ZTtcbiAgICAgICAgICAgICAgICBjb25zdCB0b29TbWFsbCA9IGlucHV0LmRhdGEubGVuZ3RoIDwgY2hlY2sudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHRvb0JpZyB8fCB0b29TbWFsbCkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvb0JpZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRvb1NtYWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImVtYWlsXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVtYWlsUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImVtYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJlbW9qaVwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFlbW9qaVJlZ2V4KSB7XG4gICAgICAgICAgICAgICAgICAgIGVtb2ppUmVnZXggPSBuZXcgUmVnRXhwKF9lbW9qaVJlZ2V4LCBcInVcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghZW1vamlSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiZW1vamlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInV1aWRcIikge1xuICAgICAgICAgICAgICAgIGlmICghdXVpZFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJ1dWlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJuYW5vaWRcIikge1xuICAgICAgICAgICAgICAgIGlmICghbmFub2lkUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcIm5hbm9pZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiY3VpZFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjdWlkUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImN1aWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImN1aWQyXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWN1aWQyUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImN1aWQyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ1bGlkXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXVsaWRSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwidWxpZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwidXJsXCIpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBuZXcgVVJMKGlucHV0LmRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwidXJsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJyZWdleFwiKSB7XG4gICAgICAgICAgICAgICAgY2hlY2sucmVnZXgubGFzdEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXN0UmVzdWx0ID0gY2hlY2sucmVnZXgudGVzdChpbnB1dC5kYXRhKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRlc3RSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJyZWdleFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwidHJpbVwiKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQuZGF0YSA9IGlucHV0LmRhdGEudHJpbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJpbmNsdWRlc1wiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpbnB1dC5kYXRhLmluY2x1ZGVzKGNoZWNrLnZhbHVlLCBjaGVjay5wb3NpdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogeyBpbmNsdWRlczogY2hlY2sudmFsdWUsIHBvc2l0aW9uOiBjaGVjay5wb3NpdGlvbiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwidG9Mb3dlckNhc2VcIikge1xuICAgICAgICAgICAgICAgIGlucHV0LmRhdGEgPSBpbnB1dC5kYXRhLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInRvVXBwZXJDYXNlXCIpIHtcbiAgICAgICAgICAgICAgICBpbnB1dC5kYXRhID0gaW5wdXQuZGF0YS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJzdGFydHNXaXRoXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0LmRhdGEuc3RhcnRzV2l0aChjaGVjay52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogeyBzdGFydHNXaXRoOiBjaGVjay52YWx1ZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZW5kc1dpdGhcIikge1xuICAgICAgICAgICAgICAgIGlmICghaW5wdXQuZGF0YS5lbmRzV2l0aChjaGVjay52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogeyBlbmRzV2l0aDogY2hlY2sudmFsdWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImRhdGV0aW1lXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWdleCA9IGRhdGV0aW1lUmVnZXgoY2hlY2spO1xuICAgICAgICAgICAgICAgIGlmICghcmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImRhdGV0aW1lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJkYXRlXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWdleCA9IGRhdGVSZWdleDtcbiAgICAgICAgICAgICAgICBpZiAoIXJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJkYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ0aW1lXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWdleCA9IHRpbWVSZWdleChjaGVjayk7XG4gICAgICAgICAgICAgICAgaWYgKCFyZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwidGltZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZHVyYXRpb25cIikge1xuICAgICAgICAgICAgICAgIGlmICghZHVyYXRpb25SZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiZHVyYXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImlwXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzVmFsaWRJUChpbnB1dC5kYXRhLCBjaGVjay52ZXJzaW9uKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImlwXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJqd3RcIikge1xuICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZEpXVChpbnB1dC5kYXRhLCBjaGVjay5hbGcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiand0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJjaWRyXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzVmFsaWRDaWRyKGlucHV0LmRhdGEsIGNoZWNrLnZlcnNpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiY2lkclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiYmFzZTY0XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWJhc2U2NFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJiYXNlNjRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImJhc2U2NHVybFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFiYXNlNjR1cmxSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiYmFzZTY0dXJsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdXRpbC5hc3NlcnROZXZlcihjaGVjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBpbnB1dC5kYXRhIH07XG4gICAgfVxuICAgIF9yZWdleChyZWdleCwgdmFsaWRhdGlvbiwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWZpbmVtZW50KChkYXRhKSA9PiByZWdleC50ZXN0KGRhdGEpLCB7XG4gICAgICAgICAgICB2YWxpZGF0aW9uLFxuICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgX2FkZENoZWNrKGNoZWNrKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kU3RyaW5nKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogWy4uLnRoaXMuX2RlZi5jaGVja3MsIGNoZWNrXSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVtYWlsKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJlbWFpbFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIHVybChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwidXJsXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgZW1vamkobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImVtb2ppXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgdXVpZChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwidXVpZFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIG5hbm9pZChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwibmFub2lkXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgY3VpZChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiY3VpZFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIGN1aWQyKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJjdWlkMlwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIHVsaWQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcInVsaWRcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBiYXNlNjQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImJhc2U2NFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIGJhc2U2NHVybChtZXNzYWdlKSB7XG4gICAgICAgIC8vIGJhc2U2NHVybCBlbmNvZGluZyBpcyBhIG1vZGlmaWNhdGlvbiBvZiBiYXNlNjQgdGhhdCBjYW4gc2FmZWx5IGJlIHVzZWQgaW4gVVJMcyBhbmQgZmlsZW5hbWVzXG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImJhc2U2NHVybFwiLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgand0KG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJqd3RcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG9wdGlvbnMpIH0pO1xuICAgIH1cbiAgICBpcChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiaXBcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG9wdGlvbnMpIH0pO1xuICAgIH1cbiAgICBjaWRyKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJjaWRyXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihvcHRpb25zKSB9KTtcbiAgICB9XG4gICAgZGF0ZXRpbWUob3B0aW9ucykge1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICAgICAga2luZDogXCJkYXRldGltZVwiLFxuICAgICAgICAgICAgICAgIHByZWNpc2lvbjogbnVsbCxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGxvY2FsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBvcHRpb25zLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwiZGF0ZXRpbWVcIixcbiAgICAgICAgICAgIHByZWNpc2lvbjogdHlwZW9mIG9wdGlvbnM/LnByZWNpc2lvbiA9PT0gXCJ1bmRlZmluZWRcIiA/IG51bGwgOiBvcHRpb25zPy5wcmVjaXNpb24sXG4gICAgICAgICAgICBvZmZzZXQ6IG9wdGlvbnM/Lm9mZnNldCA/PyBmYWxzZSxcbiAgICAgICAgICAgIGxvY2FsOiBvcHRpb25zPy5sb2NhbCA/PyBmYWxzZSxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihvcHRpb25zPy5tZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGRhdGUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImRhdGVcIiwgbWVzc2FnZSB9KTtcbiAgICB9XG4gICAgdGltZShvcHRpb25zKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgICAgICBraW5kOiBcInRpbWVcIixcbiAgICAgICAgICAgICAgICBwcmVjaXNpb246IG51bGwsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogb3B0aW9ucyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcInRpbWVcIixcbiAgICAgICAgICAgIHByZWNpc2lvbjogdHlwZW9mIG9wdGlvbnM/LnByZWNpc2lvbiA9PT0gXCJ1bmRlZmluZWRcIiA/IG51bGwgOiBvcHRpb25zPy5wcmVjaXNpb24sXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucz8ubWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBkdXJhdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiZHVyYXRpb25cIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICByZWdleChyZWdleCwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJyZWdleFwiLFxuICAgICAgICAgICAgcmVnZXg6IHJlZ2V4LFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW5jbHVkZXModmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwiaW5jbHVkZXNcIixcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBvcHRpb25zPy5wb3NpdGlvbixcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihvcHRpb25zPy5tZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN0YXJ0c1dpdGgodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwic3RhcnRzV2l0aFwiLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZW5kc1dpdGgodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwiZW5kc1dpdGhcIixcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1pbihtaW5MZW5ndGgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICB2YWx1ZTogbWluTGVuZ3RoLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbWF4KG1heExlbmd0aCwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtYXhcIixcbiAgICAgICAgICAgIHZhbHVlOiBtYXhMZW5ndGgsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBsZW5ndGgobGVuLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImxlbmd0aFwiLFxuICAgICAgICAgICAgdmFsdWU6IGxlbixcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEVxdWl2YWxlbnQgdG8gYC5taW4oMSlgXG4gICAgICovXG4gICAgbm9uZW1wdHkobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5taW4oMSwgZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgdHJpbSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTdHJpbmcoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgeyBraW5kOiBcInRyaW1cIiB9XSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHRvTG93ZXJDYXNlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFN0cmluZyh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCB7IGtpbmQ6IFwidG9Mb3dlckNhc2VcIiB9XSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHRvVXBwZXJDYXNlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFN0cmluZyh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCB7IGtpbmQ6IFwidG9VcHBlckNhc2VcIiB9XSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldCBpc0RhdGV0aW1lKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImRhdGV0aW1lXCIpO1xuICAgIH1cbiAgICBnZXQgaXNEYXRlKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImRhdGVcIik7XG4gICAgfVxuICAgIGdldCBpc1RpbWUoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwidGltZVwiKTtcbiAgICB9XG4gICAgZ2V0IGlzRHVyYXRpb24oKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiZHVyYXRpb25cIik7XG4gICAgfVxuICAgIGdldCBpc0VtYWlsKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImVtYWlsXCIpO1xuICAgIH1cbiAgICBnZXQgaXNVUkwoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwidXJsXCIpO1xuICAgIH1cbiAgICBnZXQgaXNFbW9qaSgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJlbW9qaVwiKTtcbiAgICB9XG4gICAgZ2V0IGlzVVVJRCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJ1dWlkXCIpO1xuICAgIH1cbiAgICBnZXQgaXNOQU5PSUQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwibmFub2lkXCIpO1xuICAgIH1cbiAgICBnZXQgaXNDVUlEKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImN1aWRcIik7XG4gICAgfVxuICAgIGdldCBpc0NVSUQyKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImN1aWQyXCIpO1xuICAgIH1cbiAgICBnZXQgaXNVTElEKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcInVsaWRcIik7XG4gICAgfVxuICAgIGdldCBpc0lQKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImlwXCIpO1xuICAgIH1cbiAgICBnZXQgaXNDSURSKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImNpZHJcIik7XG4gICAgfVxuICAgIGdldCBpc0Jhc2U2NCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJiYXNlNjRcIik7XG4gICAgfVxuICAgIGdldCBpc0Jhc2U2NHVybCgpIHtcbiAgICAgICAgLy8gYmFzZTY0dXJsIGVuY29kaW5nIGlzIGEgbW9kaWZpY2F0aW9uIG9mIGJhc2U2NCB0aGF0IGNhbiBzYWZlbHkgYmUgdXNlZCBpbiBVUkxzIGFuZCBmaWxlbmFtZXNcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJiYXNlNjR1cmxcIik7XG4gICAgfVxuICAgIGdldCBtaW5MZW5ndGgoKSB7XG4gICAgICAgIGxldCBtaW4gPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pbiA9PT0gbnVsbCB8fCBjaC52YWx1ZSA+IG1pbilcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pbjtcbiAgICB9XG4gICAgZ2V0IG1heExlbmd0aCgpIHtcbiAgICAgICAgbGV0IG1heCA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWF4ID09PSBudWxsIHx8IGNoLnZhbHVlIDwgbWF4KVxuICAgICAgICAgICAgICAgICAgICBtYXggPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF4O1xuICAgIH1cbn1cblpvZFN0cmluZy5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RTdHJpbmcoe1xuICAgICAgICBjaGVja3M6IFtdLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFN0cmluZyxcbiAgICAgICAgY29lcmNlOiBwYXJhbXM/LmNvZXJjZSA/PyBmYWxzZSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbi8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM5NjY0ODQvd2h5LWRvZXMtbW9kdWx1cy1vcGVyYXRvci1yZXR1cm4tZnJhY3Rpb25hbC1udW1iZXItaW4tamF2YXNjcmlwdC8zMTcxMTAzNCMzMTcxMTAzNFxuZnVuY3Rpb24gZmxvYXRTYWZlUmVtYWluZGVyKHZhbCwgc3RlcCkge1xuICAgIGNvbnN0IHZhbERlY0NvdW50ID0gKHZhbC50b1N0cmluZygpLnNwbGl0KFwiLlwiKVsxXSB8fCBcIlwiKS5sZW5ndGg7XG4gICAgY29uc3Qgc3RlcERlY0NvdW50ID0gKHN0ZXAudG9TdHJpbmcoKS5zcGxpdChcIi5cIilbMV0gfHwgXCJcIikubGVuZ3RoO1xuICAgIGNvbnN0IGRlY0NvdW50ID0gdmFsRGVjQ291bnQgPiBzdGVwRGVjQ291bnQgPyB2YWxEZWNDb3VudCA6IHN0ZXBEZWNDb3VudDtcbiAgICBjb25zdCB2YWxJbnQgPSBOdW1iZXIucGFyc2VJbnQodmFsLnRvRml4ZWQoZGVjQ291bnQpLnJlcGxhY2UoXCIuXCIsIFwiXCIpKTtcbiAgICBjb25zdCBzdGVwSW50ID0gTnVtYmVyLnBhcnNlSW50KHN0ZXAudG9GaXhlZChkZWNDb3VudCkucmVwbGFjZShcIi5cIiwgXCJcIikpO1xuICAgIHJldHVybiAodmFsSW50ICUgc3RlcEludCkgLyAxMCAqKiBkZWNDb3VudDtcbn1cbmV4cG9ydCBjbGFzcyBab2ROdW1iZXIgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5taW4gPSB0aGlzLmd0ZTtcbiAgICAgICAgdGhpcy5tYXggPSB0aGlzLmx0ZTtcbiAgICAgICAgdGhpcy5zdGVwID0gdGhpcy5tdWx0aXBsZU9mO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RlZi5jb2VyY2UpIHtcbiAgICAgICAgICAgIGlucHV0LmRhdGEgPSBOdW1iZXIoaW5wdXQuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5udW1iZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUubnVtYmVyLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGN0eCA9IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3Qgc3RhdHVzID0gbmV3IFBhcnNlU3RhdHVzKCk7XG4gICAgICAgIGZvciAoY29uc3QgY2hlY2sgb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoZWNrLmtpbmQgPT09IFwiaW50XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXV0aWwuaXNJbnRlZ2VyKGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZDogXCJpbnRlZ2VyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWNlaXZlZDogXCJmbG9hdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b29TbWFsbCA9IGNoZWNrLmluY2x1c2l2ZSA/IGlucHV0LmRhdGEgPCBjaGVjay52YWx1ZSA6IGlucHV0LmRhdGEgPD0gY2hlY2sudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHRvb1NtYWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwibnVtYmVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IGNoZWNrLmluY2x1c2l2ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vQmlnID0gY2hlY2suaW5jbHVzaXZlID8gaW5wdXQuZGF0YSA+IGNoZWNrLnZhbHVlIDogaW5wdXQuZGF0YSA+PSBjaGVjay52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodG9vQmlnKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiBjaGVjay5pbmNsdXNpdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJtdWx0aXBsZU9mXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZmxvYXRTYWZlUmVtYWluZGVyKGlucHV0LmRhdGEsIGNoZWNrLnZhbHVlKSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUubm90X211bHRpcGxlX29mLFxuICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGVPZjogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJmaW5pdGVcIikge1xuICAgICAgICAgICAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5ub3RfZmluaXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoY2hlY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogaW5wdXQuZGF0YSB9O1xuICAgIH1cbiAgICBndGUodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtaW5cIiwgdmFsdWUsIHRydWUsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIGd0KHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWluXCIsIHZhbHVlLCBmYWxzZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgbHRlKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWF4XCIsIHZhbHVlLCB0cnVlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBsdCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1heFwiLCB2YWx1ZSwgZmFsc2UsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIHNldExpbWl0KGtpbmQsIHZhbHVlLCBpbmNsdXNpdmUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2ROdW1iZXIoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbXG4gICAgICAgICAgICAgICAgLi4udGhpcy5fZGVmLmNoZWNrcyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGtpbmQsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIF9hZGRDaGVjayhjaGVjaykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZE51bWJlcih7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCBjaGVja10sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbnQobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJpbnRcIixcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBvc2l0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBuZWdhdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IGZhbHNlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbm9ucG9zaXRpdmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtYXhcIixcbiAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbm9ubmVnYXRpdmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtaW5cIixcbiAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbXVsdGlwbGVPZih2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtdWx0aXBsZU9mXCIsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBmaW5pdGUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJmaW5pdGVcIixcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHNhZmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtaW5cIixcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUixcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSkuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQgbWluVmFsdWUoKSB7XG4gICAgICAgIGxldCBtaW4gPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pbiA9PT0gbnVsbCB8fCBjaC52YWx1ZSA+IG1pbilcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pbjtcbiAgICB9XG4gICAgZ2V0IG1heFZhbHVlKCkge1xuICAgICAgICBsZXQgbWF4ID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGlmIChtYXggPT09IG51bGwgfHwgY2gudmFsdWUgPCBtYXgpXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXg7XG4gICAgfVxuICAgIGdldCBpc0ludCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJpbnRcIiB8fCAoY2gua2luZCA9PT0gXCJtdWx0aXBsZU9mXCIgJiYgdXRpbC5pc0ludGVnZXIoY2gudmFsdWUpKSk7XG4gICAgfVxuICAgIGdldCBpc0Zpbml0ZSgpIHtcbiAgICAgICAgbGV0IG1heCA9IG51bGw7XG4gICAgICAgIGxldCBtaW4gPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcImZpbml0ZVwiIHx8IGNoLmtpbmQgPT09IFwiaW50XCIgfHwgY2gua2luZCA9PT0gXCJtdWx0aXBsZU9mXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWluID09PSBudWxsIHx8IGNoLnZhbHVlID4gbWluKVxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWF4ID09PSBudWxsIHx8IGNoLnZhbHVlIDwgbWF4KVxuICAgICAgICAgICAgICAgICAgICBtYXggPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKG1pbikgJiYgTnVtYmVyLmlzRmluaXRlKG1heCk7XG4gICAgfVxufVxuWm9kTnVtYmVyLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE51bWJlcih7XG4gICAgICAgIGNoZWNrczogW10sXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTnVtYmVyLFxuICAgICAgICBjb2VyY2U6IHBhcmFtcz8uY29lcmNlIHx8IGZhbHNlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZEJpZ0ludCBleHRlbmRzIFpvZFR5cGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLm1pbiA9IHRoaXMuZ3RlO1xuICAgICAgICB0aGlzLm1heCA9IHRoaXMubHRlO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RlZi5jb2VyY2UpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaW5wdXQuZGF0YSA9IEJpZ0ludChpbnB1dC5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0SW52YWxpZElucHV0KGlucHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLmJpZ2ludCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldEludmFsaWRJbnB1dChpbnB1dCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGN0eCA9IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3Qgc3RhdHVzID0gbmV3IFBhcnNlU3RhdHVzKCk7XG4gICAgICAgIGZvciAoY29uc3QgY2hlY2sgb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoZWNrLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b29TbWFsbCA9IGNoZWNrLmluY2x1c2l2ZSA/IGlucHV0LmRhdGEgPCBjaGVjay52YWx1ZSA6IGlucHV0LmRhdGEgPD0gY2hlY2sudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHRvb1NtYWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImJpZ2ludFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IGNoZWNrLmluY2x1c2l2ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9vQmlnID0gY2hlY2suaW5jbHVzaXZlID8gaW5wdXQuZGF0YSA+IGNoZWNrLnZhbHVlIDogaW5wdXQuZGF0YSA+PSBjaGVjay52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodG9vQmlnKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJiaWdpbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiBjaGVjay5pbmNsdXNpdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJtdWx0aXBsZU9mXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuZGF0YSAlIGNoZWNrLnZhbHVlICE9PSBCaWdJbnQoMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLm5vdF9tdWx0aXBsZV9vZixcbiAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpcGxlT2Y6IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoY2hlY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogaW5wdXQuZGF0YSB9O1xuICAgIH1cbiAgICBfZ2V0SW52YWxpZElucHV0KGlucHV0KSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuYmlnaW50LFxuICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgfVxuICAgIGd0ZSh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1pblwiLCB2YWx1ZSwgdHJ1ZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgZ3QodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtaW5cIiwgdmFsdWUsIGZhbHNlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBsdGUodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtYXhcIiwgdmFsdWUsIHRydWUsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIGx0KHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWF4XCIsIHZhbHVlLCBmYWxzZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgc2V0TGltaXQoa2luZCwgdmFsdWUsIGluY2x1c2l2ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEJpZ0ludCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFtcbiAgICAgICAgICAgICAgICAuLi50aGlzLl9kZWYuY2hlY2tzLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2luZCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgX2FkZENoZWNrKGNoZWNrKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQmlnSW50KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogWy4uLnRoaXMuX2RlZi5jaGVja3MsIGNoZWNrXSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBvc2l0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICB2YWx1ZTogQmlnSW50KDApLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5lZ2F0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICB2YWx1ZTogQmlnSW50KDApLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbnBvc2l0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICB2YWx1ZTogQmlnSW50KDApLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbm9ubmVnYXRpdmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtaW5cIixcbiAgICAgICAgICAgIHZhbHVlOiBCaWdJbnQoMCksXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtdWx0aXBsZU9mKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm11bHRpcGxlT2ZcIixcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0IG1pblZhbHVlKCkge1xuICAgICAgICBsZXQgbWluID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChtaW4gPT09IG51bGwgfHwgY2gudmFsdWUgPiBtaW4pXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtaW47XG4gICAgfVxuICAgIGdldCBtYXhWYWx1ZSgpIHtcbiAgICAgICAgbGV0IG1heCA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWF4ID09PSBudWxsIHx8IGNoLnZhbHVlIDwgbWF4KVxuICAgICAgICAgICAgICAgICAgICBtYXggPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF4O1xuICAgIH1cbn1cblpvZEJpZ0ludC5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RCaWdJbnQoe1xuICAgICAgICBjaGVja3M6IFtdLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEJpZ0ludCxcbiAgICAgICAgY29lcmNlOiBwYXJhbXM/LmNvZXJjZSA/PyBmYWxzZSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RCb29sZWFuIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY29lcmNlKSB7XG4gICAgICAgICAgICBpbnB1dC5kYXRhID0gQm9vbGVhbihpbnB1dC5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLmJvb2xlYW4pIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuYm9vbGVhbixcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG59XG5ab2RCb29sZWFuLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEJvb2xlYW4oe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEJvb2xlYW4sXG4gICAgICAgIGNvZXJjZTogcGFyYW1zPy5jb2VyY2UgfHwgZmFsc2UsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kRGF0ZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5fZGVmLmNvZXJjZSkge1xuICAgICAgICAgICAgaW5wdXQuZGF0YSA9IG5ldyBEYXRlKGlucHV0LmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuZGF0ZSkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5kYXRlLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKE51bWJlci5pc05hTihpbnB1dC5kYXRhLmdldFRpbWUoKSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX2RhdGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IG5ldyBQYXJzZVN0YXR1cygpO1xuICAgICAgICBsZXQgY3R4ID0gdW5kZWZpbmVkO1xuICAgICAgICBmb3IgKGNvbnN0IGNoZWNrIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaGVjay5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEuZ2V0VGltZSgpIDwgY2hlY2sudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiZGF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5kYXRhLmdldFRpbWUoKSA+IGNoZWNrLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJkYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGNoZWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhdHVzOiBzdGF0dXMudmFsdWUsXG4gICAgICAgICAgICB2YWx1ZTogbmV3IERhdGUoaW5wdXQuZGF0YS5nZXRUaW1lKCkpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBfYWRkQ2hlY2soY2hlY2spIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2REYXRlKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogWy4uLnRoaXMuX2RlZi5jaGVja3MsIGNoZWNrXSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1pbihtaW5EYXRlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IG1pbkRhdGUuZ2V0VGltZSgpLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbWF4KG1heERhdGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICB2YWx1ZTogbWF4RGF0ZS5nZXRUaW1lKCksXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQgbWluRGF0ZSgpIHtcbiAgICAgICAgbGV0IG1pbiA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWluID09PSBudWxsIHx8IGNoLnZhbHVlID4gbWluKVxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWluICE9IG51bGwgPyBuZXcgRGF0ZShtaW4pIDogbnVsbDtcbiAgICB9XG4gICAgZ2V0IG1heERhdGUoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heCAhPSBudWxsID8gbmV3IERhdGUobWF4KSA6IG51bGw7XG4gICAgfVxufVxuWm9kRGF0ZS5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2REYXRlKHtcbiAgICAgICAgY2hlY2tzOiBbXSxcbiAgICAgICAgY29lcmNlOiBwYXJhbXM/LmNvZXJjZSB8fCBmYWxzZSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2REYXRlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZFN5bWJvbCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLnN5bWJvbCkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5zeW1ib2wsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuWm9kU3ltYm9sLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFN5bWJvbCh7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kU3ltYm9sLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZFVuZGVmaW5lZCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLnVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS51bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuWm9kVW5kZWZpbmVkLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFVuZGVmaW5lZCh7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kVW5kZWZpbmVkLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZE51bGwgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5udWxsKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm51bGwsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuWm9kTnVsbC5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2ROdWxsKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2ROdWxsLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZEFueSBleHRlbmRzIFpvZFR5cGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICAvLyB0byBwcmV2ZW50IGluc3RhbmNlcyBvZiBvdGhlciBjbGFzc2VzIGZyb20gZXh0ZW5kaW5nIFpvZEFueS4gdGhpcyBjYXVzZXMgaXNzdWVzIHdpdGggY2F0Y2hhbGwgaW4gWm9kT2JqZWN0LlxuICAgICAgICB0aGlzLl9hbnkgPSB0cnVlO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZEFueS5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RBbnkoe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEFueSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RVbmtub3duIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIC8vIHJlcXVpcmVkXG4gICAgICAgIHRoaXMuX3Vua25vd24gPSB0cnVlO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZFVua25vd24uY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kVW5rbm93bih7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kVW5rbm93bixcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2ROZXZlciBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm5ldmVyLFxuICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgfVxufVxuWm9kTmV2ZXIuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTmV2ZXIoe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE5ldmVyLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZFZvaWQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS51bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUudm9pZCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG59XG5ab2RWb2lkLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFZvaWQoe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFZvaWQsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kQXJyYXkgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHgsIHN0YXR1cyB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3QgZGVmID0gdGhpcy5fZGVmO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuYXJyYXkpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuYXJyYXksXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVmLmV4YWN0TGVuZ3RoICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCB0b29CaWcgPSBjdHguZGF0YS5sZW5ndGggPiBkZWYuZXhhY3RMZW5ndGgudmFsdWU7XG4gICAgICAgICAgICBjb25zdCB0b29TbWFsbCA9IGN0eC5kYXRhLmxlbmd0aCA8IGRlZi5leGFjdExlbmd0aC52YWx1ZTtcbiAgICAgICAgICAgIGlmICh0b29CaWcgfHwgdG9vU21hbGwpIHtcbiAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogdG9vQmlnID8gWm9kSXNzdWVDb2RlLnRvb19iaWcgOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiAodG9vU21hbGwgPyBkZWYuZXhhY3RMZW5ndGgudmFsdWUgOiB1bmRlZmluZWQpLFxuICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiAodG9vQmlnID8gZGVmLmV4YWN0TGVuZ3RoLnZhbHVlIDogdW5kZWZpbmVkKSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGV4YWN0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBkZWYuZXhhY3RMZW5ndGgubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVmLm1pbkxlbmd0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGN0eC5kYXRhLmxlbmd0aCA8IGRlZi5taW5MZW5ndGgudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgbWluaW11bTogZGVmLm1pbkxlbmd0aC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGVmLm1pbkxlbmd0aC5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChkZWYubWF4TGVuZ3RoICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoY3R4LmRhdGEubGVuZ3RoID4gZGVmLm1heExlbmd0aC52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogZGVmLm1heExlbmd0aC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGVmLm1heExlbmd0aC5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoWy4uLmN0eC5kYXRhXS5tYXAoKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmLnR5cGUuX3BhcnNlQXN5bmMobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIGl0ZW0sIGN0eC5wYXRoLCBpKSk7XG4gICAgICAgICAgICB9KSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFBhcnNlU3RhdHVzLm1lcmdlQXJyYXkoc3RhdHVzLCByZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gWy4uLmN0eC5kYXRhXS5tYXAoKGl0ZW0sIGkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBkZWYudHlwZS5fcGFyc2VTeW5jKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBpdGVtLCBjdHgucGF0aCwgaSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIFBhcnNlU3RhdHVzLm1lcmdlQXJyYXkoc3RhdHVzLCByZXN1bHQpO1xuICAgIH1cbiAgICBnZXQgZWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi50eXBlO1xuICAgIH1cbiAgICBtaW4obWluTGVuZ3RoLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQXJyYXkoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgbWluTGVuZ3RoOiB7IHZhbHVlOiBtaW5MZW5ndGgsIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbWF4KG1heExlbmd0aCwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEFycmF5KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIG1heExlbmd0aDogeyB2YWx1ZTogbWF4TGVuZ3RoLCBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGxlbmd0aChsZW4sIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RBcnJheSh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBleGFjdExlbmd0aDogeyB2YWx1ZTogbGVuLCBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5vbmVtcHR5KG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluKDEsIG1lc3NhZ2UpO1xuICAgIH1cbn1cblpvZEFycmF5LmNyZWF0ZSA9IChzY2hlbWEsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kQXJyYXkoe1xuICAgICAgICB0eXBlOiBzY2hlbWEsXG4gICAgICAgIG1pbkxlbmd0aDogbnVsbCxcbiAgICAgICAgbWF4TGVuZ3RoOiBudWxsLFxuICAgICAgICBleGFjdExlbmd0aDogbnVsbCxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RBcnJheSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmZ1bmN0aW9uIGRlZXBQYXJ0aWFsaWZ5KHNjaGVtYSkge1xuICAgIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2RPYmplY3QpIHtcbiAgICAgICAgY29uc3QgbmV3U2hhcGUgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc2NoZW1hLnNoYXBlKSB7XG4gICAgICAgICAgICBjb25zdCBmaWVsZFNjaGVtYSA9IHNjaGVtYS5zaGFwZVtrZXldO1xuICAgICAgICAgICAgbmV3U2hhcGVba2V5XSA9IFpvZE9wdGlvbmFsLmNyZWF0ZShkZWVwUGFydGlhbGlmeShmaWVsZFNjaGVtYSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnNjaGVtYS5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+IG5ld1NoYXBlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoc2NoZW1hIGluc3RhbmNlb2YgWm9kQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RBcnJheSh7XG4gICAgICAgICAgICAuLi5zY2hlbWEuX2RlZixcbiAgICAgICAgICAgIHR5cGU6IGRlZXBQYXJ0aWFsaWZ5KHNjaGVtYS5lbGVtZW50KSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHNjaGVtYSBpbnN0YW5jZW9mIFpvZE9wdGlvbmFsKSB7XG4gICAgICAgIHJldHVybiBab2RPcHRpb25hbC5jcmVhdGUoZGVlcFBhcnRpYWxpZnkoc2NoZW1hLnVud3JhcCgpKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHNjaGVtYSBpbnN0YW5jZW9mIFpvZE51bGxhYmxlKSB7XG4gICAgICAgIHJldHVybiBab2ROdWxsYWJsZS5jcmVhdGUoZGVlcFBhcnRpYWxpZnkoc2NoZW1hLnVud3JhcCgpKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHNjaGVtYSBpbnN0YW5jZW9mIFpvZFR1cGxlKSB7XG4gICAgICAgIHJldHVybiBab2RUdXBsZS5jcmVhdGUoc2NoZW1hLml0ZW1zLm1hcCgoaXRlbSkgPT4gZGVlcFBhcnRpYWxpZnkoaXRlbSkpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBzY2hlbWE7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFpvZE9iamVjdCBleHRlbmRzIFpvZFR5cGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLl9jYWNoZWQgPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogQGRlcHJlY2F0ZWQgSW4gbW9zdCBjYXNlcywgdGhpcyBpcyBubyBsb25nZXIgbmVlZGVkIC0gdW5rbm93biBwcm9wZXJ0aWVzIGFyZSBub3cgc2lsZW50bHkgc3RyaXBwZWQuXG4gICAgICAgICAqIElmIHlvdSB3YW50IHRvIHBhc3MgdGhyb3VnaCB1bmtub3duIHByb3BlcnRpZXMsIHVzZSBgLnBhc3N0aHJvdWdoKClgIGluc3RlYWQuXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm5vbnN0cmljdCA9IHRoaXMucGFzc3Rocm91Z2g7XG4gICAgICAgIC8vIGV4dGVuZDxcbiAgICAgICAgLy8gICBBdWdtZW50YXRpb24gZXh0ZW5kcyBab2RSYXdTaGFwZSxcbiAgICAgICAgLy8gICBOZXdPdXRwdXQgZXh0ZW5kcyB1dGlsLmZsYXR0ZW48e1xuICAgICAgICAvLyAgICAgW2sgaW4ga2V5b2YgQXVnbWVudGF0aW9uIHwga2V5b2YgT3V0cHV0XTogayBleHRlbmRzIGtleW9mIEF1Z21lbnRhdGlvblxuICAgICAgICAvLyAgICAgICA/IEF1Z21lbnRhdGlvbltrXVtcIl9vdXRwdXRcIl1cbiAgICAgICAgLy8gICAgICAgOiBrIGV4dGVuZHMga2V5b2YgT3V0cHV0XG4gICAgICAgIC8vICAgICAgID8gT3V0cHV0W2tdXG4gICAgICAgIC8vICAgICAgIDogbmV2ZXI7XG4gICAgICAgIC8vICAgfT4sXG4gICAgICAgIC8vICAgTmV3SW5wdXQgZXh0ZW5kcyB1dGlsLmZsYXR0ZW48e1xuICAgICAgICAvLyAgICAgW2sgaW4ga2V5b2YgQXVnbWVudGF0aW9uIHwga2V5b2YgSW5wdXRdOiBrIGV4dGVuZHMga2V5b2YgQXVnbWVudGF0aW9uXG4gICAgICAgIC8vICAgICAgID8gQXVnbWVudGF0aW9uW2tdW1wiX2lucHV0XCJdXG4gICAgICAgIC8vICAgICAgIDogayBleHRlbmRzIGtleW9mIElucHV0XG4gICAgICAgIC8vICAgICAgID8gSW5wdXRba11cbiAgICAgICAgLy8gICAgICAgOiBuZXZlcjtcbiAgICAgICAgLy8gICB9PlxuICAgICAgICAvLyA+KFxuICAgICAgICAvLyAgIGF1Z21lbnRhdGlvbjogQXVnbWVudGF0aW9uXG4gICAgICAgIC8vICk6IFpvZE9iamVjdDxcbiAgICAgICAgLy8gICBleHRlbmRTaGFwZTxULCBBdWdtZW50YXRpb24+LFxuICAgICAgICAvLyAgIFVua25vd25LZXlzLFxuICAgICAgICAvLyAgIENhdGNoYWxsLFxuICAgICAgICAvLyAgIE5ld091dHB1dCxcbiAgICAgICAgLy8gICBOZXdJbnB1dFxuICAgICAgICAvLyA+IHtcbiAgICAgICAgLy8gICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgIC8vICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgIC8vICAgICBzaGFwZTogKCkgPT4gKHtcbiAgICAgICAgLy8gICAgICAgLi4udGhpcy5fZGVmLnNoYXBlKCksXG4gICAgICAgIC8vICAgICAgIC4uLmF1Z21lbnRhdGlvbixcbiAgICAgICAgLy8gICAgIH0pLFxuICAgICAgICAvLyAgIH0pIGFzIGFueTtcbiAgICAgICAgLy8gfVxuICAgICAgICAvKipcbiAgICAgICAgICogQGRlcHJlY2F0ZWQgVXNlIGAuZXh0ZW5kYCBpbnN0ZWFkXG4gICAgICAgICAqICAqL1xuICAgICAgICB0aGlzLmF1Z21lbnQgPSB0aGlzLmV4dGVuZDtcbiAgICB9XG4gICAgX2dldENhY2hlZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NhY2hlZCAhPT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jYWNoZWQ7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gdGhpcy5fZGVmLnNoYXBlKCk7XG4gICAgICAgIGNvbnN0IGtleXMgPSB1dGlsLm9iamVjdEtleXMoc2hhcGUpO1xuICAgICAgICB0aGlzLl9jYWNoZWQgPSB7IHNoYXBlLCBrZXlzIH07XG4gICAgICAgIHJldHVybiB0aGlzLl9jYWNoZWQ7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLm9iamVjdCkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5vYmplY3QsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCB7IHNoYXBlLCBrZXlzOiBzaGFwZUtleXMgfSA9IHRoaXMuX2dldENhY2hlZCgpO1xuICAgICAgICBjb25zdCBleHRyYUtleXMgPSBbXTtcbiAgICAgICAgaWYgKCEodGhpcy5fZGVmLmNhdGNoYWxsIGluc3RhbmNlb2YgWm9kTmV2ZXIgJiYgdGhpcy5fZGVmLnVua25vd25LZXlzID09PSBcInN0cmlwXCIpKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBjdHguZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmICghc2hhcGVLZXlzLmluY2x1ZGVzKGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFLZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFpcnMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2Ygc2hhcGVLZXlzKSB7XG4gICAgICAgICAgICBjb25zdCBrZXlWYWxpZGF0b3IgPSBzaGFwZVtrZXldO1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBjdHguZGF0YVtrZXldO1xuICAgICAgICAgICAgcGFpcnMucHVzaCh7XG4gICAgICAgICAgICAgICAga2V5OiB7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZToga2V5IH0sXG4gICAgICAgICAgICAgICAgdmFsdWU6IGtleVZhbGlkYXRvci5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIHZhbHVlLCBjdHgucGF0aCwga2V5KSksXG4gICAgICAgICAgICAgICAgYWx3YXlzU2V0OiBrZXkgaW4gY3R4LmRhdGEsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fZGVmLmNhdGNoYWxsIGluc3RhbmNlb2YgWm9kTmV2ZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHVua25vd25LZXlzID0gdGhpcy5fZGVmLnVua25vd25LZXlzO1xuICAgICAgICAgICAgaWYgKHVua25vd25LZXlzID09PSBcInBhc3N0aHJvdWdoXCIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBleHRyYUtleXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFpcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlOiBrZXkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZTogY3R4LmRhdGFba2V5XSB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh1bmtub3duS2V5cyA9PT0gXCJzdHJpY3RcIikge1xuICAgICAgICAgICAgICAgIGlmIChleHRyYUtleXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS51bnJlY29nbml6ZWRfa2V5cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleXM6IGV4dHJhS2V5cyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHVua25vd25LZXlzID09PSBcInN0cmlwXCIpIHtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW50ZXJuYWwgWm9kT2JqZWN0IGVycm9yOiBpbnZhbGlkIHVua25vd25LZXlzIHZhbHVlLmApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gcnVuIGNhdGNoYWxsIHZhbGlkYXRpb25cbiAgICAgICAgICAgIGNvbnN0IGNhdGNoYWxsID0gdGhpcy5fZGVmLmNhdGNoYWxsO1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgZXh0cmFLZXlzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBjdHguZGF0YVtrZXldO1xuICAgICAgICAgICAgICAgIHBhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBrZXk6IHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlOiBrZXkgfSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGNhdGNoYWxsLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgdmFsdWUsIGN0eC5wYXRoLCBrZXkpIC8vLCBjdHguY2hpbGQoa2V5KSwgdmFsdWUsIGdldFBhcnNlZFR5cGUodmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIGFsd2F5c1NldDoga2V5IGluIGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgICAgICAgICAudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3luY1BhaXJzID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHBhaXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IHBhaXIua2V5O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IHBhaXIudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHN5bmNQYWlycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWx3YXlzU2V0OiBwYWlyLmFsd2F5c1NldCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBzeW5jUGFpcnM7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKChzeW5jUGFpcnMpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VPYmplY3RTeW5jKHN0YXR1cywgc3luY1BhaXJzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFBhcnNlU3RhdHVzLm1lcmdlT2JqZWN0U3luYyhzdGF0dXMsIHBhaXJzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgc2hhcGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuc2hhcGUoKTtcbiAgICB9XG4gICAgc3RyaWN0KG1lc3NhZ2UpIHtcbiAgICAgICAgZXJyb3JVdGlsLmVyclRvT2JqO1xuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICB1bmtub3duS2V5czogXCJzdHJpY3RcIixcbiAgICAgICAgICAgIC4uLihtZXNzYWdlICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNYXA6IChpc3N1ZSwgY3R4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZWZhdWx0RXJyb3IgPSB0aGlzLl9kZWYuZXJyb3JNYXA/Lihpc3N1ZSwgY3R4KS5tZXNzYWdlID8/IGN0eC5kZWZhdWx0RXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNzdWUuY29kZSA9PT0gXCJ1bnJlY29nbml6ZWRfa2V5c1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKS5tZXNzYWdlID8/IGRlZmF1bHRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBkZWZhdWx0RXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA6IHt9KSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHN0cmlwKCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICB1bmtub3duS2V5czogXCJzdHJpcFwiLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcGFzc3Rocm91Z2goKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHVua25vd25LZXlzOiBcInBhc3N0aHJvdWdoXCIsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBjb25zdCBBdWdtZW50RmFjdG9yeSA9XG4gICAgLy8gICA8RGVmIGV4dGVuZHMgWm9kT2JqZWN0RGVmPihkZWY6IERlZikgPT5cbiAgICAvLyAgIDxBdWdtZW50YXRpb24gZXh0ZW5kcyBab2RSYXdTaGFwZT4oXG4gICAgLy8gICAgIGF1Z21lbnRhdGlvbjogQXVnbWVudGF0aW9uXG4gICAgLy8gICApOiBab2RPYmplY3Q8XG4gICAgLy8gICAgIGV4dGVuZFNoYXBlPFJldHVyblR5cGU8RGVmW1wic2hhcGVcIl0+LCBBdWdtZW50YXRpb24+LFxuICAgIC8vICAgICBEZWZbXCJ1bmtub3duS2V5c1wiXSxcbiAgICAvLyAgICAgRGVmW1wiY2F0Y2hhbGxcIl1cbiAgICAvLyAgID4gPT4ge1xuICAgIC8vICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgLy8gICAgICAgLi4uZGVmLFxuICAgIC8vICAgICAgIHNoYXBlOiAoKSA9PiAoe1xuICAgIC8vICAgICAgICAgLi4uZGVmLnNoYXBlKCksXG4gICAgLy8gICAgICAgICAuLi5hdWdtZW50YXRpb24sXG4gICAgLy8gICAgICAgfSksXG4gICAgLy8gICAgIH0pIGFzIGFueTtcbiAgICAvLyAgIH07XG4gICAgZXh0ZW5kKGF1Z21lbnRhdGlvbikge1xuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi50aGlzLl9kZWYuc2hhcGUoKSxcbiAgICAgICAgICAgICAgICAuLi5hdWdtZW50YXRpb24sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFByaW9yIHRvIHpvZEAxLjAuMTIgdGhlcmUgd2FzIGEgYnVnIGluIHRoZVxuICAgICAqIGluZmVycmVkIHR5cGUgb2YgbWVyZ2VkIG9iamVjdHMuIFBsZWFzZVxuICAgICAqIHVwZ3JhZGUgaWYgeW91IGFyZSBleHBlcmllbmNpbmcgaXNzdWVzLlxuICAgICAqL1xuICAgIG1lcmdlKG1lcmdpbmcpIHtcbiAgICAgICAgY29uc3QgbWVyZ2VkID0gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICB1bmtub3duS2V5czogbWVyZ2luZy5fZGVmLnVua25vd25LZXlzLFxuICAgICAgICAgICAgY2F0Y2hhbGw6IG1lcmdpbmcuX2RlZi5jYXRjaGFsbCxcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiAoe1xuICAgICAgICAgICAgICAgIC4uLnRoaXMuX2RlZi5zaGFwZSgpLFxuICAgICAgICAgICAgICAgIC4uLm1lcmdpbmcuX2RlZi5zaGFwZSgpLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9iamVjdCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtZXJnZWQ7XG4gICAgfVxuICAgIC8vIG1lcmdlPFxuICAgIC8vICAgSW5jb21pbmcgZXh0ZW5kcyBBbnlab2RPYmplY3QsXG4gICAgLy8gICBBdWdtZW50YXRpb24gZXh0ZW5kcyBJbmNvbWluZ1tcInNoYXBlXCJdLFxuICAgIC8vICAgTmV3T3V0cHV0IGV4dGVuZHMge1xuICAgIC8vICAgICBbayBpbiBrZXlvZiBBdWdtZW50YXRpb24gfCBrZXlvZiBPdXRwdXRdOiBrIGV4dGVuZHMga2V5b2YgQXVnbWVudGF0aW9uXG4gICAgLy8gICAgICAgPyBBdWdtZW50YXRpb25ba11bXCJfb3V0cHV0XCJdXG4gICAgLy8gICAgICAgOiBrIGV4dGVuZHMga2V5b2YgT3V0cHV0XG4gICAgLy8gICAgICAgPyBPdXRwdXRba11cbiAgICAvLyAgICAgICA6IG5ldmVyO1xuICAgIC8vICAgfSxcbiAgICAvLyAgIE5ld0lucHV0IGV4dGVuZHMge1xuICAgIC8vICAgICBbayBpbiBrZXlvZiBBdWdtZW50YXRpb24gfCBrZXlvZiBJbnB1dF06IGsgZXh0ZW5kcyBrZXlvZiBBdWdtZW50YXRpb25cbiAgICAvLyAgICAgICA/IEF1Z21lbnRhdGlvbltrXVtcIl9pbnB1dFwiXVxuICAgIC8vICAgICAgIDogayBleHRlbmRzIGtleW9mIElucHV0XG4gICAgLy8gICAgICAgPyBJbnB1dFtrXVxuICAgIC8vICAgICAgIDogbmV2ZXI7XG4gICAgLy8gICB9XG4gICAgLy8gPihcbiAgICAvLyAgIG1lcmdpbmc6IEluY29taW5nXG4gICAgLy8gKTogWm9kT2JqZWN0PFxuICAgIC8vICAgZXh0ZW5kU2hhcGU8VCwgUmV0dXJuVHlwZTxJbmNvbWluZ1tcIl9kZWZcIl1bXCJzaGFwZVwiXT4+LFxuICAgIC8vICAgSW5jb21pbmdbXCJfZGVmXCJdW1widW5rbm93bktleXNcIl0sXG4gICAgLy8gICBJbmNvbWluZ1tcIl9kZWZcIl1bXCJjYXRjaGFsbFwiXSxcbiAgICAvLyAgIE5ld091dHB1dCxcbiAgICAvLyAgIE5ld0lucHV0XG4gICAgLy8gPiB7XG4gICAgLy8gICBjb25zdCBtZXJnZWQ6IGFueSA9IG5ldyBab2RPYmplY3Qoe1xuICAgIC8vICAgICB1bmtub3duS2V5czogbWVyZ2luZy5fZGVmLnVua25vd25LZXlzLFxuICAgIC8vICAgICBjYXRjaGFsbDogbWVyZ2luZy5fZGVmLmNhdGNoYWxsLFxuICAgIC8vICAgICBzaGFwZTogKCkgPT5cbiAgICAvLyAgICAgICBvYmplY3RVdGlsLm1lcmdlU2hhcGVzKHRoaXMuX2RlZi5zaGFwZSgpLCBtZXJnaW5nLl9kZWYuc2hhcGUoKSksXG4gICAgLy8gICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kT2JqZWN0LFxuICAgIC8vICAgfSkgYXMgYW55O1xuICAgIC8vICAgcmV0dXJuIG1lcmdlZDtcbiAgICAvLyB9XG4gICAgc2V0S2V5KGtleSwgc2NoZW1hKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1Z21lbnQoeyBba2V5XTogc2NoZW1hIH0pO1xuICAgIH1cbiAgICAvLyBtZXJnZTxJbmNvbWluZyBleHRlbmRzIEFueVpvZE9iamVjdD4oXG4gICAgLy8gICBtZXJnaW5nOiBJbmNvbWluZ1xuICAgIC8vICk6IC8vWm9kT2JqZWN0PFQgJiBJbmNvbWluZ1tcIl9zaGFwZVwiXSwgVW5rbm93bktleXMsIENhdGNoYWxsPiA9IChtZXJnaW5nKSA9PiB7XG4gICAgLy8gWm9kT2JqZWN0PFxuICAgIC8vICAgZXh0ZW5kU2hhcGU8VCwgUmV0dXJuVHlwZTxJbmNvbWluZ1tcIl9kZWZcIl1bXCJzaGFwZVwiXT4+LFxuICAgIC8vICAgSW5jb21pbmdbXCJfZGVmXCJdW1widW5rbm93bktleXNcIl0sXG4gICAgLy8gICBJbmNvbWluZ1tcIl9kZWZcIl1bXCJjYXRjaGFsbFwiXVxuICAgIC8vID4ge1xuICAgIC8vICAgLy8gY29uc3QgbWVyZ2VkU2hhcGUgPSBvYmplY3RVdGlsLm1lcmdlU2hhcGVzKFxuICAgIC8vICAgLy8gICB0aGlzLl9kZWYuc2hhcGUoKSxcbiAgICAvLyAgIC8vICAgbWVyZ2luZy5fZGVmLnNoYXBlKClcbiAgICAvLyAgIC8vICk7XG4gICAgLy8gICBjb25zdCBtZXJnZWQ6IGFueSA9IG5ldyBab2RPYmplY3Qoe1xuICAgIC8vICAgICB1bmtub3duS2V5czogbWVyZ2luZy5fZGVmLnVua25vd25LZXlzLFxuICAgIC8vICAgICBjYXRjaGFsbDogbWVyZ2luZy5fZGVmLmNhdGNoYWxsLFxuICAgIC8vICAgICBzaGFwZTogKCkgPT5cbiAgICAvLyAgICAgICBvYmplY3RVdGlsLm1lcmdlU2hhcGVzKHRoaXMuX2RlZi5zaGFwZSgpLCBtZXJnaW5nLl9kZWYuc2hhcGUoKSksXG4gICAgLy8gICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kT2JqZWN0LFxuICAgIC8vICAgfSkgYXMgYW55O1xuICAgIC8vICAgcmV0dXJuIG1lcmdlZDtcbiAgICAvLyB9XG4gICAgY2F0Y2hhbGwoaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2F0Y2hhbGw6IGluZGV4LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcGljayhtYXNrKSB7XG4gICAgICAgIGNvbnN0IHNoYXBlID0ge307XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHV0aWwub2JqZWN0S2V5cyhtYXNrKSkge1xuICAgICAgICAgICAgaWYgKG1hc2tba2V5XSAmJiB0aGlzLnNoYXBlW2tleV0pIHtcbiAgICAgICAgICAgICAgICBzaGFwZVtrZXldID0gdGhpcy5zaGFwZVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiBzaGFwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG9taXQobWFzaykge1xuICAgICAgICBjb25zdCBzaGFwZSA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB1dGlsLm9iamVjdEtleXModGhpcy5zaGFwZSkpIHtcbiAgICAgICAgICAgIGlmICghbWFza1trZXldKSB7XG4gICAgICAgICAgICAgICAgc2hhcGVba2V5XSA9IHRoaXMuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gc2hhcGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIGRlZXBQYXJ0aWFsKCkge1xuICAgICAgICByZXR1cm4gZGVlcFBhcnRpYWxpZnkodGhpcyk7XG4gICAgfVxuICAgIHBhcnRpYWwobWFzaykge1xuICAgICAgICBjb25zdCBuZXdTaGFwZSA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB1dGlsLm9iamVjdEtleXModGhpcy5zaGFwZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkU2NoZW1hID0gdGhpcy5zaGFwZVtrZXldO1xuICAgICAgICAgICAgaWYgKG1hc2sgJiYgIW1hc2tba2V5XSkge1xuICAgICAgICAgICAgICAgIG5ld1NoYXBlW2tleV0gPSBmaWVsZFNjaGVtYTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1NoYXBlW2tleV0gPSBmaWVsZFNjaGVtYS5vcHRpb25hbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiBuZXdTaGFwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlcXVpcmVkKG1hc2spIHtcbiAgICAgICAgY29uc3QgbmV3U2hhcGUgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdXRpbC5vYmplY3RLZXlzKHRoaXMuc2hhcGUpKSB7XG4gICAgICAgICAgICBpZiAobWFzayAmJiAhbWFza1trZXldKSB7XG4gICAgICAgICAgICAgICAgbmV3U2hhcGVba2V5XSA9IHRoaXMuc2hhcGVba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpZWxkU2NoZW1hID0gdGhpcy5zaGFwZVtrZXldO1xuICAgICAgICAgICAgICAgIGxldCBuZXdGaWVsZCA9IGZpZWxkU2NoZW1hO1xuICAgICAgICAgICAgICAgIHdoaWxlIChuZXdGaWVsZCBpbnN0YW5jZW9mIFpvZE9wdGlvbmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld0ZpZWxkID0gbmV3RmllbGQuX2RlZi5pbm5lclR5cGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1NoYXBlW2tleV0gPSBuZXdGaWVsZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gbmV3U2hhcGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBrZXlvZigpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVpvZEVudW0odXRpbC5vYmplY3RLZXlzKHRoaXMuc2hhcGUpKTtcbiAgICB9XG59XG5ab2RPYmplY3QuY3JlYXRlID0gKHNoYXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgIHNoYXBlOiAoKSA9PiBzaGFwZSxcbiAgICAgICAgdW5rbm93bktleXM6IFwic3RyaXBcIixcbiAgICAgICAgY2F0Y2hhbGw6IFpvZE5ldmVyLmNyZWF0ZSgpLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9iamVjdCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcblpvZE9iamVjdC5zdHJpY3RDcmVhdGUgPSAoc2hhcGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgc2hhcGU6ICgpID0+IHNoYXBlLFxuICAgICAgICB1bmtub3duS2V5czogXCJzdHJpY3RcIixcbiAgICAgICAgY2F0Y2hhbGw6IFpvZE5ldmVyLmNyZWF0ZSgpLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9iamVjdCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcblpvZE9iamVjdC5sYXp5Y3JlYXRlID0gKHNoYXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgIHNoYXBlLFxuICAgICAgICB1bmtub3duS2V5czogXCJzdHJpcFwiLFxuICAgICAgICBjYXRjaGFsbDogWm9kTmV2ZXIuY3JlYXRlKCksXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kT2JqZWN0LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZFVuaW9uIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5fZGVmLm9wdGlvbnM7XG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3VsdHMocmVzdWx0cykge1xuICAgICAgICAgICAgLy8gcmV0dXJuIGZpcnN0IGlzc3VlLWZyZWUgdmFsaWRhdGlvbiBpZiBpdCBleGlzdHNcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnJlc3VsdC5zdGF0dXMgPT09IFwidmFsaWRcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LnJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5yZXN1bHQuc3RhdHVzID09PSBcImRpcnR5XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGlzc3VlcyBmcm9tIGRpcnR5IG9wdGlvblxuICAgICAgICAgICAgICAgICAgICBjdHguY29tbW9uLmlzc3Vlcy5wdXNoKC4uLnJlc3VsdC5jdHguY29tbW9uLmlzc3Vlcyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQucmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHJldHVybiBpbnZhbGlkXG4gICAgICAgICAgICBjb25zdCB1bmlvbkVycm9ycyA9IHJlc3VsdHMubWFwKChyZXN1bHQpID0+IG5ldyBab2RFcnJvcihyZXN1bHQuY3R4LmNvbW1vbi5pc3N1ZXMpKTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3VuaW9uLFxuICAgICAgICAgICAgICAgIHVuaW9uRXJyb3JzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKG9wdGlvbnMubWFwKGFzeW5jIChvcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEN0eCA9IHtcbiAgICAgICAgICAgICAgICAgICAgLi4uY3R4LFxuICAgICAgICAgICAgICAgICAgICBjb21tb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLmN0eC5jb21tb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IGF3YWl0IG9wdGlvbi5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjaGlsZEN0eCxcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIGN0eDogY2hpbGRDdHgsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKS50aGVuKGhhbmRsZVJlc3VsdHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IGRpcnR5ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgY29uc3QgaXNzdWVzID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRDdHggPSB7XG4gICAgICAgICAgICAgICAgICAgIC4uLmN0eCxcbiAgICAgICAgICAgICAgICAgICAgY29tbW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5jdHguY29tbW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBudWxsLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gb3B0aW9uLl9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY2hpbGRDdHgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwidmFsaWRcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChyZXN1bHQuc3RhdHVzID09PSBcImRpcnR5XCIgJiYgIWRpcnR5KSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcnR5ID0geyByZXN1bHQsIGN0eDogY2hpbGRDdHggfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkQ3R4LmNvbW1vbi5pc3N1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzc3Vlcy5wdXNoKGNoaWxkQ3R4LmNvbW1vbi5pc3N1ZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkaXJ0eSkge1xuICAgICAgICAgICAgICAgIGN0eC5jb21tb24uaXNzdWVzLnB1c2goLi4uZGlydHkuY3R4LmNvbW1vbi5pc3N1ZXMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkaXJ0eS5yZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB1bmlvbkVycm9ycyA9IGlzc3Vlcy5tYXAoKGlzc3VlcykgPT4gbmV3IFpvZEVycm9yKGlzc3VlcykpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdW5pb24sXG4gICAgICAgICAgICAgICAgdW5pb25FcnJvcnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBvcHRpb25zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLm9wdGlvbnM7XG4gICAgfVxufVxuWm9kVW5pb24uY3JlYXRlID0gKHR5cGVzLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFVuaW9uKHtcbiAgICAgICAgb3B0aW9uczogdHlwZXMsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kVW5pb24sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgWm9kRGlzY3JpbWluYXRlZFVuaW9uICAgICAgLy8vLy8vLy8vL1xuLy8vLy8vLy8vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuY29uc3QgZ2V0RGlzY3JpbWluYXRvciA9ICh0eXBlKSA9PiB7XG4gICAgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RMYXp5KSB7XG4gICAgICAgIHJldHVybiBnZXREaXNjcmltaW5hdG9yKHR5cGUuc2NoZW1hKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZEVmZmVjdHMpIHtcbiAgICAgICAgcmV0dXJuIGdldERpc2NyaW1pbmF0b3IodHlwZS5pbm5lclR5cGUoKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RMaXRlcmFsKSB7XG4gICAgICAgIHJldHVybiBbdHlwZS52YWx1ZV07XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RFbnVtKSB7XG4gICAgICAgIHJldHVybiB0eXBlLm9wdGlvbnM7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2ROYXRpdmVFbnVtKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBiYW4vYmFuXG4gICAgICAgIHJldHVybiB1dGlsLm9iamVjdFZhbHVlcyh0eXBlLmVudW0pO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kRGVmYXVsdCkge1xuICAgICAgICByZXR1cm4gZ2V0RGlzY3JpbWluYXRvcih0eXBlLl9kZWYuaW5uZXJUeXBlKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZFVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gW3VuZGVmaW5lZF07XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2ROdWxsKSB7XG4gICAgICAgIHJldHVybiBbbnVsbF07XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RPcHRpb25hbCkge1xuICAgICAgICByZXR1cm4gW3VuZGVmaW5lZCwgLi4uZ2V0RGlzY3JpbWluYXRvcih0eXBlLnVud3JhcCgpKV07XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2ROdWxsYWJsZSkge1xuICAgICAgICByZXR1cm4gW251bGwsIC4uLmdldERpc2NyaW1pbmF0b3IodHlwZS51bndyYXAoKSldO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kQnJhbmRlZCkge1xuICAgICAgICByZXR1cm4gZ2V0RGlzY3JpbWluYXRvcih0eXBlLnVud3JhcCgpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZFJlYWRvbmx5KSB7XG4gICAgICAgIHJldHVybiBnZXREaXNjcmltaW5hdG9yKHR5cGUudW53cmFwKCkpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kQ2F0Y2gpIHtcbiAgICAgICAgcmV0dXJuIGdldERpc2NyaW1pbmF0b3IodHlwZS5fZGVmLmlubmVyVHlwZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxufTtcbmV4cG9ydCBjbGFzcyBab2REaXNjcmltaW5hdGVkVW5pb24gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5vYmplY3QpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUub2JqZWN0LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGlzY3JpbWluYXRvciA9IHRoaXMuZGlzY3JpbWluYXRvcjtcbiAgICAgICAgY29uc3QgZGlzY3JpbWluYXRvclZhbHVlID0gY3R4LmRhdGFbZGlzY3JpbWluYXRvcl07XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMub3B0aW9uc01hcC5nZXQoZGlzY3JpbWluYXRvclZhbHVlKTtcbiAgICAgICAgaWYgKCFvcHRpb24pIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3VuaW9uX2Rpc2NyaW1pbmF0b3IsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogQXJyYXkuZnJvbSh0aGlzLm9wdGlvbnNNYXAua2V5cygpKSxcbiAgICAgICAgICAgICAgICBwYXRoOiBbZGlzY3JpbWluYXRvcl0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9uLl9wYXJzZUFzeW5jKHtcbiAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBkaXNjcmltaW5hdG9yKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmRpc2NyaW1pbmF0b3I7XG4gICAgfVxuICAgIGdldCBvcHRpb25zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLm9wdGlvbnM7XG4gICAgfVxuICAgIGdldCBvcHRpb25zTWFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLm9wdGlvbnNNYXA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoZSBjb25zdHJ1Y3RvciBvZiB0aGUgZGlzY3JpbWluYXRlZCB1bmlvbiBzY2hlbWEuIEl0cyBiZWhhdmlvdXIgaXMgdmVyeSBzaW1pbGFyIHRvIHRoYXQgb2YgdGhlIG5vcm1hbCB6LnVuaW9uKCkgY29uc3RydWN0b3IuXG4gICAgICogSG93ZXZlciwgaXQgb25seSBhbGxvd3MgYSB1bmlvbiBvZiBvYmplY3RzLCBhbGwgb2Ygd2hpY2ggbmVlZCB0byBzaGFyZSBhIGRpc2NyaW1pbmF0b3IgcHJvcGVydHkuIFRoaXMgcHJvcGVydHkgbXVzdFxuICAgICAqIGhhdmUgYSBkaWZmZXJlbnQgdmFsdWUgZm9yIGVhY2ggb2JqZWN0IGluIHRoZSB1bmlvbi5cbiAgICAgKiBAcGFyYW0gZGlzY3JpbWluYXRvciB0aGUgbmFtZSBvZiB0aGUgZGlzY3JpbWluYXRvciBwcm9wZXJ0eVxuICAgICAqIEBwYXJhbSB0eXBlcyBhbiBhcnJheSBvZiBvYmplY3Qgc2NoZW1hc1xuICAgICAqIEBwYXJhbSBwYXJhbXNcbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlKGRpc2NyaW1pbmF0b3IsIG9wdGlvbnMsIHBhcmFtcykge1xuICAgICAgICAvLyBHZXQgYWxsIHRoZSB2YWxpZCBkaXNjcmltaW5hdG9yIHZhbHVlc1xuICAgICAgICBjb25zdCBvcHRpb25zTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAvLyB0cnkge1xuICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2Ygb3B0aW9ucykge1xuICAgICAgICAgICAgY29uc3QgZGlzY3JpbWluYXRvclZhbHVlcyA9IGdldERpc2NyaW1pbmF0b3IodHlwZS5zaGFwZVtkaXNjcmltaW5hdG9yXSk7XG4gICAgICAgICAgICBpZiAoIWRpc2NyaW1pbmF0b3JWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBIGRpc2NyaW1pbmF0b3IgdmFsdWUgZm9yIGtleSBcXGAke2Rpc2NyaW1pbmF0b3J9XFxgIGNvdWxkIG5vdCBiZSBleHRyYWN0ZWQgZnJvbSBhbGwgc2NoZW1hIG9wdGlvbnNgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgZGlzY3JpbWluYXRvclZhbHVlcykge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zTWFwLmhhcyh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEaXNjcmltaW5hdG9yIHByb3BlcnR5ICR7U3RyaW5nKGRpc2NyaW1pbmF0b3IpfSBoYXMgZHVwbGljYXRlIHZhbHVlICR7U3RyaW5nKHZhbHVlKX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb3B0aW9uc01hcC5zZXQodmFsdWUsIHR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgWm9kRGlzY3JpbWluYXRlZFVuaW9uKHtcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRGlzY3JpbWluYXRlZFVuaW9uLFxuICAgICAgICAgICAgZGlzY3JpbWluYXRvcixcbiAgICAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgICAgICBvcHRpb25zTWFwLFxuICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5mdW5jdGlvbiBtZXJnZVZhbHVlcyhhLCBiKSB7XG4gICAgY29uc3QgYVR5cGUgPSBnZXRQYXJzZWRUeXBlKGEpO1xuICAgIGNvbnN0IGJUeXBlID0gZ2V0UGFyc2VkVHlwZShiKTtcbiAgICBpZiAoYSA9PT0gYikge1xuICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgZGF0YTogYSB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChhVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS5vYmplY3QgJiYgYlR5cGUgPT09IFpvZFBhcnNlZFR5cGUub2JqZWN0KSB7XG4gICAgICAgIGNvbnN0IGJLZXlzID0gdXRpbC5vYmplY3RLZXlzKGIpO1xuICAgICAgICBjb25zdCBzaGFyZWRLZXlzID0gdXRpbC5vYmplY3RLZXlzKGEpLmZpbHRlcigoa2V5KSA9PiBiS2V5cy5pbmRleE9mKGtleSkgIT09IC0xKTtcbiAgICAgICAgY29uc3QgbmV3T2JqID0geyAuLi5hLCAuLi5iIH07XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHNoYXJlZEtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHNoYXJlZFZhbHVlID0gbWVyZ2VWYWx1ZXMoYVtrZXldLCBiW2tleV0pO1xuICAgICAgICAgICAgaWYgKCFzaGFyZWRWYWx1ZS52YWxpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3T2JqW2tleV0gPSBzaGFyZWRWYWx1ZS5kYXRhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBuZXdPYmogfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYVR5cGUgPT09IFpvZFBhcnNlZFR5cGUuYXJyYXkgJiYgYlR5cGUgPT09IFpvZFBhcnNlZFR5cGUuYXJyYXkpIHtcbiAgICAgICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV3QXJyYXkgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGEubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtQSA9IGFbaW5kZXhdO1xuICAgICAgICAgICAgY29uc3QgaXRlbUIgPSBiW2luZGV4XTtcbiAgICAgICAgICAgIGNvbnN0IHNoYXJlZFZhbHVlID0gbWVyZ2VWYWx1ZXMoaXRlbUEsIGl0ZW1CKTtcbiAgICAgICAgICAgIGlmICghc2hhcmVkVmFsdWUudmFsaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld0FycmF5LnB1c2goc2hhcmVkVmFsdWUuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIGRhdGE6IG5ld0FycmF5IH07XG4gICAgfVxuICAgIGVsc2UgaWYgKGFUeXBlID09PSBab2RQYXJzZWRUeXBlLmRhdGUgJiYgYlR5cGUgPT09IFpvZFBhcnNlZFR5cGUuZGF0ZSAmJiArYSA9PT0gK2IpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIGRhdGE6IGEgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSB9O1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RJbnRlcnNlY3Rpb24gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3QgaGFuZGxlUGFyc2VkID0gKHBhcnNlZExlZnQsIHBhcnNlZFJpZ2h0KSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNBYm9ydGVkKHBhcnNlZExlZnQpIHx8IGlzQWJvcnRlZChwYXJzZWRSaWdodCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IG1lcmdlVmFsdWVzKHBhcnNlZExlZnQudmFsdWUsIHBhcnNlZFJpZ2h0LnZhbHVlKTtcbiAgICAgICAgICAgIGlmICghbWVyZ2VkLnZhbGlkKSB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX2ludGVyc2VjdGlvbl90eXBlcyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0RpcnR5KHBhcnNlZExlZnQpIHx8IGlzRGlydHkocGFyc2VkUmlnaHQpKSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IG1lcmdlZC5kYXRhIH07XG4gICAgICAgIH07XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlZi5sZWZ0Ll9wYXJzZUFzeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWYucmlnaHQuX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgXSkudGhlbigoW2xlZnQsIHJpZ2h0XSkgPT4gaGFuZGxlUGFyc2VkKGxlZnQsIHJpZ2h0KSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlUGFyc2VkKHRoaXMuX2RlZi5sZWZ0Ll9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgfSksIHRoaXMuX2RlZi5yaWdodC5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblpvZEludGVyc2VjdGlvbi5jcmVhdGUgPSAobGVmdCwgcmlnaHQsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kSW50ZXJzZWN0aW9uKHtcbiAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgcmlnaHQ6IHJpZ2h0LFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEludGVyc2VjdGlvbixcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbi8vIHR5cGUgWm9kVHVwbGVJdGVtcyA9IFtab2RUeXBlQW55LCAuLi5ab2RUeXBlQW55W11dO1xuZXhwb3J0IGNsYXNzIFpvZFR1cGxlIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5hcnJheSkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5hcnJheSxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjdHguZGF0YS5sZW5ndGggPCB0aGlzLl9kZWYuaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgIG1pbmltdW06IHRoaXMuX2RlZi5pdGVtcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3QgPSB0aGlzLl9kZWYucmVzdDtcbiAgICAgICAgaWYgKCFyZXN0ICYmIGN0eC5kYXRhLmxlbmd0aCA+IHRoaXMuX2RlZi5pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgIG1heGltdW06IHRoaXMuX2RlZi5pdGVtcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gWy4uLmN0eC5kYXRhXVxuICAgICAgICAgICAgLm1hcCgoaXRlbSwgaXRlbUluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzY2hlbWEgPSB0aGlzLl9kZWYuaXRlbXNbaXRlbUluZGV4XSB8fCB0aGlzLl9kZWYucmVzdDtcbiAgICAgICAgICAgIGlmICghc2NoZW1hKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHNjaGVtYS5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIGl0ZW0sIGN0eC5wYXRoLCBpdGVtSW5kZXgpKTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5maWx0ZXIoKHgpID0+ICEheCk7IC8vIGZpbHRlciBudWxsc1xuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKGl0ZW1zKS50aGVuKChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFBhcnNlU3RhdHVzLm1lcmdlQXJyYXkoc3RhdHVzLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFBhcnNlU3RhdHVzLm1lcmdlQXJyYXkoc3RhdHVzLCBpdGVtcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGl0ZW1zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLml0ZW1zO1xuICAgIH1cbiAgICByZXN0KHJlc3QpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RUdXBsZSh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICByZXN0LFxuICAgICAgICB9KTtcbiAgICB9XG59XG5ab2RUdXBsZS5jcmVhdGUgPSAoc2NoZW1hcywgcGFyYW1zKSA9PiB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHNjaGVtYXMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IHBhc3MgYW4gYXJyYXkgb2Ygc2NoZW1hcyB0byB6LnR1cGxlKFsgLi4uIF0pXCIpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFpvZFR1cGxlKHtcbiAgICAgICAgaXRlbXM6IHNjaGVtYXMsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kVHVwbGUsXG4gICAgICAgIHJlc3Q6IG51bGwsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kUmVjb3JkIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgZ2V0IGtleVNjaGVtYSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5rZXlUeXBlO1xuICAgIH1cbiAgICBnZXQgdmFsdWVTY2hlbWEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWVUeXBlO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLm9iamVjdCkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5vYmplY3QsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYWlycyA9IFtdO1xuICAgICAgICBjb25zdCBrZXlUeXBlID0gdGhpcy5fZGVmLmtleVR5cGU7XG4gICAgICAgIGNvbnN0IHZhbHVlVHlwZSA9IHRoaXMuX2RlZi52YWx1ZVR5cGU7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGN0eC5kYXRhKSB7XG4gICAgICAgICAgICBwYWlycy5wdXNoKHtcbiAgICAgICAgICAgICAgICBrZXk6IGtleVR5cGUuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBrZXksIGN0eC5wYXRoLCBrZXkpKSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVUeXBlLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgY3R4LmRhdGFba2V5XSwgY3R4LnBhdGgsIGtleSkpLFxuICAgICAgICAgICAgICAgIGFsd2F5c1NldDoga2V5IGluIGN0eC5kYXRhLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZU9iamVjdEFzeW5jKHN0YXR1cywgcGFpcnMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFBhcnNlU3RhdHVzLm1lcmdlT2JqZWN0U3luYyhzdGF0dXMsIHBhaXJzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgZWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi52YWx1ZVR5cGU7XG4gICAgfVxuICAgIHN0YXRpYyBjcmVhdGUoZmlyc3QsIHNlY29uZCwgdGhpcmQpIHtcbiAgICAgICAgaWYgKHNlY29uZCBpbnN0YW5jZW9mIFpvZFR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgWm9kUmVjb3JkKHtcbiAgICAgICAgICAgICAgICBrZXlUeXBlOiBmaXJzdCxcbiAgICAgICAgICAgICAgICB2YWx1ZVR5cGU6IHNlY29uZCxcbiAgICAgICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFJlY29yZCxcbiAgICAgICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHRoaXJkKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgWm9kUmVjb3JkKHtcbiAgICAgICAgICAgIGtleVR5cGU6IFpvZFN0cmluZy5jcmVhdGUoKSxcbiAgICAgICAgICAgIHZhbHVlVHlwZTogZmlyc3QsXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFJlY29yZCxcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMoc2Vjb25kKSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFpvZE1hcCBleHRlbmRzIFpvZFR5cGUge1xuICAgIGdldCBrZXlTY2hlbWEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYua2V5VHlwZTtcbiAgICB9XG4gICAgZ2V0IHZhbHVlU2NoZW1hKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5tYXApIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUubWFwLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qga2V5VHlwZSA9IHRoaXMuX2RlZi5rZXlUeXBlO1xuICAgICAgICBjb25zdCB2YWx1ZVR5cGUgPSB0aGlzLl9kZWYudmFsdWVUeXBlO1xuICAgICAgICBjb25zdCBwYWlycyA9IFsuLi5jdHguZGF0YS5lbnRyaWVzKCldLm1hcCgoW2tleSwgdmFsdWVdLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBrZXk6IGtleVR5cGUuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBrZXksIGN0eC5wYXRoLCBbaW5kZXgsIFwia2V5XCJdKSksXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlVHlwZS5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIHZhbHVlLCBjdHgucGF0aCwgW2luZGV4LCBcInZhbHVlXCJdKSksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbmFsTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBwYWlyLmtleTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBhd2FpdCBwYWlyLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIgfHwgdmFsdWUuc3RhdHVzID09PSBcImFib3J0ZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiZGlydHlcIiB8fCB2YWx1ZS5zdGF0dXMgPT09IFwiZGlydHlcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmluYWxNYXAuc2V0KGtleS52YWx1ZSwgdmFsdWUudmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGZpbmFsTWFwIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbmFsTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHBhaXJzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gcGFpci5rZXk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYWlyLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmIChrZXkuc3RhdHVzID09PSBcImFib3J0ZWRcIiB8fCB2YWx1ZS5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoa2V5LnN0YXR1cyA9PT0gXCJkaXJ0eVwiIHx8IHZhbHVlLnN0YXR1cyA9PT0gXCJkaXJ0eVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbE1hcC5zZXQoa2V5LnZhbHVlLCB2YWx1ZS52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGZpbmFsTWFwIH07XG4gICAgICAgIH1cbiAgICB9XG59XG5ab2RNYXAuY3JlYXRlID0gKGtleVR5cGUsIHZhbHVlVHlwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RNYXAoe1xuICAgICAgICB2YWx1ZVR5cGUsXG4gICAgICAgIGtleVR5cGUsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTWFwLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZFNldCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuc2V0KSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLnNldCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRlZiA9IHRoaXMuX2RlZjtcbiAgICAgICAgaWYgKGRlZi5taW5TaXplICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoY3R4LmRhdGEuc2l6ZSA8IGRlZi5taW5TaXplLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGRlZi5taW5TaXplLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInNldFwiLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGVmLm1pblNpemUubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVmLm1heFNpemUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjdHguZGF0YS5zaXplID4gZGVmLm1heFNpemUudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgIG1heGltdW06IGRlZi5tYXhTaXplLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInNldFwiLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGVmLm1heFNpemUubWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWx1ZVR5cGUgPSB0aGlzLl9kZWYudmFsdWVUeXBlO1xuICAgICAgICBmdW5jdGlvbiBmaW5hbGl6ZVNldChlbGVtZW50cykge1xuICAgICAgICAgICAgY29uc3QgcGFyc2VkU2V0ID0gbmV3IFNldCgpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIHBhcnNlZFNldC5hZGQoZWxlbWVudC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IHBhcnNlZFNldCB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gWy4uLmN0eC5kYXRhLnZhbHVlcygpXS5tYXAoKGl0ZW0sIGkpID0+IHZhbHVlVHlwZS5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIGl0ZW0sIGN0eC5wYXRoLCBpKSkpO1xuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKGVsZW1lbnRzKS50aGVuKChlbGVtZW50cykgPT4gZmluYWxpemVTZXQoZWxlbWVudHMpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmaW5hbGl6ZVNldChlbGVtZW50cyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbWluKG1pblNpemUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTZXQoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgbWluU2l6ZTogeyB2YWx1ZTogbWluU2l6ZSwgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtYXgobWF4U2l6ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFNldCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBtYXhTaXplOiB7IHZhbHVlOiBtYXhTaXplLCBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHNpemUoc2l6ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5taW4oc2l6ZSwgbWVzc2FnZSkubWF4KHNpemUsIG1lc3NhZ2UpO1xuICAgIH1cbiAgICBub25lbXB0eShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbigxLCBtZXNzYWdlKTtcbiAgICB9XG59XG5ab2RTZXQuY3JlYXRlID0gKHZhbHVlVHlwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RTZXQoe1xuICAgICAgICB2YWx1ZVR5cGUsXG4gICAgICAgIG1pblNpemU6IG51bGwsXG4gICAgICAgIG1heFNpemU6IG51bGwsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kU2V0LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZEZ1bmN0aW9uIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMudmFsaWRhdGUgPSB0aGlzLmltcGxlbWVudDtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuZnVuY3Rpb24pIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuZnVuY3Rpb24sXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBtYWtlQXJnc0lzc3VlKGFyZ3MsIGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFrZUlzc3VlKHtcbiAgICAgICAgICAgICAgICBkYXRhOiBhcmdzLFxuICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgIGVycm9yTWFwczogW2N0eC5jb21tb24uY29udGV4dHVhbEVycm9yTWFwLCBjdHguc2NoZW1hRXJyb3JNYXAsIGdldEVycm9yTWFwKCksIGRlZmF1bHRFcnJvck1hcF0uZmlsdGVyKCh4KSA9PiAhIXgpLFxuICAgICAgICAgICAgICAgIGlzc3VlRGF0YToge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9hcmd1bWVudHMsXG4gICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50c0Vycm9yOiBlcnJvcixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gbWFrZVJldHVybnNJc3N1ZShyZXR1cm5zLCBlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIG1ha2VJc3N1ZSh7XG4gICAgICAgICAgICAgICAgZGF0YTogcmV0dXJucyxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBlcnJvck1hcHM6IFtjdHguY29tbW9uLmNvbnRleHR1YWxFcnJvck1hcCwgY3R4LnNjaGVtYUVycm9yTWFwLCBnZXRFcnJvck1hcCgpLCBkZWZhdWx0RXJyb3JNYXBdLmZpbHRlcigoeCkgPT4gISF4KSxcbiAgICAgICAgICAgICAgICBpc3N1ZURhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfcmV0dXJuX3R5cGUsXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblR5cGVFcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHsgZXJyb3JNYXA6IGN0eC5jb21tb24uY29udGV4dHVhbEVycm9yTWFwIH07XG4gICAgICAgIGNvbnN0IGZuID0gY3R4LmRhdGE7XG4gICAgICAgIGlmICh0aGlzLl9kZWYucmV0dXJucyBpbnN0YW5jZW9mIFpvZFByb21pc2UpIHtcbiAgICAgICAgICAgIC8vIFdvdWxkIGxvdmUgYSB3YXkgdG8gYXZvaWQgZGlzYWJsaW5nIHRoaXMgcnVsZSwgYnV0IHdlIG5lZWRcbiAgICAgICAgICAgIC8vIGFuIGFsaWFzICh1c2luZyBhbiBhcnJvdyBmdW5jdGlvbiB3YXMgd2hhdCBjYXVzZWQgMjY1MSkuXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcbiAgICAgICAgICAgIGNvbnN0IG1lID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiBPSyhhc3luYyBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IFpvZEVycm9yKFtdKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWRBcmdzID0gYXdhaXQgbWUuX2RlZi5hcmdzLnBhcnNlQXN5bmMoYXJncywgcGFyYW1zKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvci5hZGRJc3N1ZShtYWtlQXJnc0lzc3VlKGFyZ3MsIGUpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgUmVmbGVjdC5hcHBseShmbiwgdGhpcywgcGFyc2VkQXJncyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkUmV0dXJucyA9IGF3YWl0IG1lLl9kZWYucmV0dXJucy5fZGVmLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgLnBhcnNlQXN5bmMocmVzdWx0LCBwYXJhbXMpXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvci5hZGRJc3N1ZShtYWtlUmV0dXJuc0lzc3VlKHJlc3VsdCwgZSkpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VkUmV0dXJucztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gV291bGQgbG92ZSBhIHdheSB0byBhdm9pZCBkaXNhYmxpbmcgdGhpcyBydWxlLCBidXQgd2UgbmVlZFxuICAgICAgICAgICAgLy8gYW4gYWxpYXMgKHVzaW5nIGFuIGFycm93IGZ1bmN0aW9uIHdhcyB3aGF0IGNhdXNlZCAyNjUxKS5cbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuICAgICAgICAgICAgY29uc3QgbWUgPSB0aGlzO1xuICAgICAgICAgICAgcmV0dXJuIE9LKGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkQXJncyA9IG1lLl9kZWYuYXJncy5zYWZlUGFyc2UoYXJncywgcGFyYW1zKTtcbiAgICAgICAgICAgICAgICBpZiAoIXBhcnNlZEFyZ3Muc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgWm9kRXJyb3IoW21ha2VBcmdzSXNzdWUoYXJncywgcGFyc2VkQXJncy5lcnJvcildKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gUmVmbGVjdC5hcHBseShmbiwgdGhpcywgcGFyc2VkQXJncy5kYXRhKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWRSZXR1cm5zID0gbWUuX2RlZi5yZXR1cm5zLnNhZmVQYXJzZShyZXN1bHQsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJzZWRSZXR1cm5zLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFpvZEVycm9yKFttYWtlUmV0dXJuc0lzc3VlKHJlc3VsdCwgcGFyc2VkUmV0dXJucy5lcnJvcildKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlZFJldHVybnMuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHBhcmFtZXRlcnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuYXJncztcbiAgICB9XG4gICAgcmV0dXJuVHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5yZXR1cm5zO1xuICAgIH1cbiAgICBhcmdzKC4uLml0ZW1zKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRnVuY3Rpb24oe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgYXJnczogWm9kVHVwbGUuY3JlYXRlKGl0ZW1zKS5yZXN0KFpvZFVua25vd24uY3JlYXRlKCkpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJucyhyZXR1cm5UeXBlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRnVuY3Rpb24oe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgcmV0dXJuczogcmV0dXJuVHlwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGltcGxlbWVudChmdW5jKSB7XG4gICAgICAgIGNvbnN0IHZhbGlkYXRlZEZ1bmMgPSB0aGlzLnBhcnNlKGZ1bmMpO1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVkRnVuYztcbiAgICB9XG4gICAgc3RyaWN0SW1wbGVtZW50KGZ1bmMpIHtcbiAgICAgICAgY29uc3QgdmFsaWRhdGVkRnVuYyA9IHRoaXMucGFyc2UoZnVuYyk7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZWRGdW5jO1xuICAgIH1cbiAgICBzdGF0aWMgY3JlYXRlKGFyZ3MsIHJldHVybnMsIHBhcmFtcykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEZ1bmN0aW9uKHtcbiAgICAgICAgICAgIGFyZ3M6IChhcmdzID8gYXJncyA6IFpvZFR1cGxlLmNyZWF0ZShbXSkucmVzdChab2RVbmtub3duLmNyZWF0ZSgpKSksXG4gICAgICAgICAgICByZXR1cm5zOiByZXR1cm5zIHx8IFpvZFVua25vd24uY3JlYXRlKCksXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEZ1bmN0aW9uLFxuICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgWm9kTGF6eSBleHRlbmRzIFpvZFR5cGUge1xuICAgIGdldCBzY2hlbWEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuZ2V0dGVyKCk7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3QgbGF6eVNjaGVtYSA9IHRoaXMuX2RlZi5nZXR0ZXIoKTtcbiAgICAgICAgcmV0dXJuIGxhenlTY2hlbWEuX3BhcnNlKHsgZGF0YTogY3R4LmRhdGEsIHBhdGg6IGN0eC5wYXRoLCBwYXJlbnQ6IGN0eCB9KTtcbiAgICB9XG59XG5ab2RMYXp5LmNyZWF0ZSA9IChnZXR0ZXIsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTGF6eSh7XG4gICAgICAgIGdldHRlcjogZ2V0dGVyLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZExhenksXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kTGl0ZXJhbCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAoaW5wdXQuZGF0YSAhPT0gdGhpcy5fZGVmLnZhbHVlKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfbGl0ZXJhbCxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogdGhpcy5fZGVmLnZhbHVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGlucHV0LmRhdGEgfTtcbiAgICB9XG4gICAgZ2V0IHZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnZhbHVlO1xuICAgIH1cbn1cblpvZExpdGVyYWwuY3JlYXRlID0gKHZhbHVlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZExpdGVyYWwoe1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTGl0ZXJhbCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmZ1bmN0aW9uIGNyZWF0ZVpvZEVudW0odmFsdWVzLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gbmV3IFpvZEVudW0oe1xuICAgICAgICB2YWx1ZXMsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRW51bSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufVxuZXhwb3J0IGNsYXNzIFpvZEVudW0gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dC5kYXRhICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBjb25zdCBleHBlY3RlZFZhbHVlcyA9IHRoaXMuX2RlZi52YWx1ZXM7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogdXRpbC5qb2luVmFsdWVzKGV4cGVjdGVkVmFsdWVzKSxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9jYWNoZSkge1xuICAgICAgICAgICAgdGhpcy5fY2FjaGUgPSBuZXcgU2V0KHRoaXMuX2RlZi52YWx1ZXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fY2FjaGUuaGFzKGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBjb25zdCBleHBlY3RlZFZhbHVlcyA9IHRoaXMuX2RlZi52YWx1ZXM7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfZW51bV92YWx1ZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBleHBlY3RlZFZhbHVlcyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbiAgICBnZXQgb3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi52YWx1ZXM7XG4gICAgfVxuICAgIGdldCBlbnVtKCkge1xuICAgICAgICBjb25zdCBlbnVtVmFsdWVzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgdmFsIG9mIHRoaXMuX2RlZi52YWx1ZXMpIHtcbiAgICAgICAgICAgIGVudW1WYWx1ZXNbdmFsXSA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZW51bVZhbHVlcztcbiAgICB9XG4gICAgZ2V0IFZhbHVlcygpIHtcbiAgICAgICAgY29uc3QgZW51bVZhbHVlcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHZhbCBvZiB0aGlzLl9kZWYudmFsdWVzKSB7XG4gICAgICAgICAgICBlbnVtVmFsdWVzW3ZhbF0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVudW1WYWx1ZXM7XG4gICAgfVxuICAgIGdldCBFbnVtKCkge1xuICAgICAgICBjb25zdCBlbnVtVmFsdWVzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgdmFsIG9mIHRoaXMuX2RlZi52YWx1ZXMpIHtcbiAgICAgICAgICAgIGVudW1WYWx1ZXNbdmFsXSA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZW51bVZhbHVlcztcbiAgICB9XG4gICAgZXh0cmFjdCh2YWx1ZXMsIG5ld0RlZiA9IHRoaXMuX2RlZikge1xuICAgICAgICByZXR1cm4gWm9kRW51bS5jcmVhdGUodmFsdWVzLCB7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICAuLi5uZXdEZWYsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBleGNsdWRlKHZhbHVlcywgbmV3RGVmID0gdGhpcy5fZGVmKSB7XG4gICAgICAgIHJldHVybiBab2RFbnVtLmNyZWF0ZSh0aGlzLm9wdGlvbnMuZmlsdGVyKChvcHQpID0+ICF2YWx1ZXMuaW5jbHVkZXMob3B0KSksIHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIC4uLm5ld0RlZixcbiAgICAgICAgfSk7XG4gICAgfVxufVxuWm9kRW51bS5jcmVhdGUgPSBjcmVhdGVab2RFbnVtO1xuZXhwb3J0IGNsYXNzIFpvZE5hdGl2ZUVudW0gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgbmF0aXZlRW51bVZhbHVlcyA9IHV0aWwuZ2V0VmFsaWRFbnVtVmFsdWVzKHRoaXMuX2RlZi52YWx1ZXMpO1xuICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5zdHJpbmcgJiYgY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUubnVtYmVyKSB7XG4gICAgICAgICAgICBjb25zdCBleHBlY3RlZFZhbHVlcyA9IHV0aWwub2JqZWN0VmFsdWVzKG5hdGl2ZUVudW1WYWx1ZXMpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IHV0aWwuam9pblZhbHVlcyhleHBlY3RlZFZhbHVlcyksXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5fY2FjaGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlID0gbmV3IFNldCh1dGlsLmdldFZhbGlkRW51bVZhbHVlcyh0aGlzLl9kZWYudmFsdWVzKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9jYWNoZS5oYXMoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4cGVjdGVkVmFsdWVzID0gdXRpbC5vYmplY3RWYWx1ZXMobmF0aXZlRW51bVZhbHVlcyk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfZW51bV92YWx1ZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBleHBlY3RlZFZhbHVlcyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbiAgICBnZXQgZW51bSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi52YWx1ZXM7XG4gICAgfVxufVxuWm9kTmF0aXZlRW51bS5jcmVhdGUgPSAodmFsdWVzLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE5hdGl2ZUVudW0oe1xuICAgICAgICB2YWx1ZXM6IHZhbHVlcyxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2ROYXRpdmVFbnVtLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZFByb21pc2UgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICB1bndyYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudHlwZTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUucHJvbWlzZSAmJiBjdHguY29tbW9uLmFzeW5jID09PSBmYWxzZSkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5wcm9taXNlLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvbWlzaWZpZWQgPSBjdHgucGFyc2VkVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS5wcm9taXNlID8gY3R4LmRhdGEgOiBQcm9taXNlLnJlc29sdmUoY3R4LmRhdGEpO1xuICAgICAgICByZXR1cm4gT0socHJvbWlzaWZpZWQudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi50eXBlLnBhcnNlQXN5bmMoZGF0YSwge1xuICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgIGVycm9yTWFwOiBjdHguY29tbW9uLmNvbnRleHR1YWxFcnJvck1hcCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KSk7XG4gICAgfVxufVxuWm9kUHJvbWlzZS5jcmVhdGUgPSAoc2NoZW1hLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFByb21pc2Uoe1xuICAgICAgICB0eXBlOiBzY2hlbWEsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kUHJvbWlzZSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RFZmZlY3RzIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgaW5uZXJUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnNjaGVtYTtcbiAgICB9XG4gICAgc291cmNlVHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zY2hlbWEuX2RlZi50eXBlTmFtZSA9PT0gWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVmZmVjdHNcbiAgICAgICAgICAgID8gdGhpcy5fZGVmLnNjaGVtYS5zb3VyY2VUeXBlKClcbiAgICAgICAgICAgIDogdGhpcy5fZGVmLnNjaGVtYTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IGVmZmVjdCA9IHRoaXMuX2RlZi5lZmZlY3QgfHwgbnVsbDtcbiAgICAgICAgY29uc3QgY2hlY2tDdHggPSB7XG4gICAgICAgICAgICBhZGRJc3N1ZTogKGFyZykgPT4ge1xuICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwgYXJnKTtcbiAgICAgICAgICAgICAgICBpZiAoYXJnLmZhdGFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldCBwYXRoKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjdHgucGF0aDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIGNoZWNrQ3R4LmFkZElzc3VlID0gY2hlY2tDdHguYWRkSXNzdWUuYmluZChjaGVja0N0eCk7XG4gICAgICAgIGlmIChlZmZlY3QudHlwZSA9PT0gXCJwcmVwcm9jZXNzXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb2Nlc3NlZCA9IGVmZmVjdC50cmFuc2Zvcm0oY3R4LmRhdGEsIGNoZWNrQ3R4KTtcbiAgICAgICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShwcm9jZXNzZWQpLnRoZW4oYXN5bmMgKHByb2Nlc3NlZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzLnZhbHVlID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9kZWYuc2NoZW1hLl9wYXJzZUFzeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHByb2Nlc3NlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBESVJUWShyZXN1bHQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzLnZhbHVlID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gRElSVFkocmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChzdGF0dXMudmFsdWUgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9kZWYuc2NoZW1hLl9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBwcm9jZXNzZWQsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBESVJUWShyZXN1bHQudmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0dXMudmFsdWUgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERJUlRZKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZWZmZWN0LnR5cGUgPT09IFwicmVmaW5lbWVudFwiKSB7XG4gICAgICAgICAgICBjb25zdCBleGVjdXRlUmVmaW5lbWVudCA9IChhY2MpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBlZmZlY3QucmVmaW5lbWVudChhY2MsIGNoZWNrQ3R4KTtcbiAgICAgICAgICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jIHJlZmluZW1lbnQgZW5jb3VudGVyZWQgZHVyaW5nIHN5bmNocm9ub3VzIHBhcnNlIG9wZXJhdGlvbi4gVXNlIC5wYXJzZUFzeW5jIGluc3RlYWQuXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlubmVyID0gdGhpcy5fZGVmLnNjaGVtYS5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoaW5uZXIuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgaWYgKGlubmVyLnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gdmFsdWUgaXMgaWdub3JlZFxuICAgICAgICAgICAgICAgIGV4ZWN1dGVSZWZpbmVtZW50KGlubmVyLnZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGlubmVyLnZhbHVlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnNjaGVtYS5fcGFyc2VBc3luYyh7IGRhdGE6IGN0eC5kYXRhLCBwYXRoOiBjdHgucGF0aCwgcGFyZW50OiBjdHggfSkudGhlbigoaW5uZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlubmVyLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlubmVyLnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBleGVjdXRlUmVmaW5lbWVudChpbm5lci52YWx1ZSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGlubmVyLnZhbHVlIH07XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChlZmZlY3QudHlwZSA9PT0gXCJ0cmFuc2Zvcm1cIikge1xuICAgICAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYmFzZSA9IHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKGJhc2UpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBlZmZlY3QudHJhbnNmb3JtKGJhc2UudmFsdWUsIGNoZWNrQ3R4KTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzeW5jaHJvbm91cyB0cmFuc2Zvcm0gZW5jb3VudGVyZWQgZHVyaW5nIHN5bmNocm9ub3VzIHBhcnNlIG9wZXJhdGlvbi4gVXNlIC5wYXJzZUFzeW5jIGluc3RlYWQuYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogcmVzdWx0IH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnNjaGVtYS5fcGFyc2VBc3luYyh7IGRhdGE6IGN0eC5kYXRhLCBwYXRoOiBjdHgucGF0aCwgcGFyZW50OiBjdHggfSkudGhlbigoYmFzZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzVmFsaWQoYmFzZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShlZmZlY3QudHJhbnNmb3JtKGJhc2UudmFsdWUsIGNoZWNrQ3R4KSkudGhlbigocmVzdWx0KSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBzdGF0dXMudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdXRpbC5hc3NlcnROZXZlcihlZmZlY3QpO1xuICAgIH1cbn1cblpvZEVmZmVjdHMuY3JlYXRlID0gKHNjaGVtYSwgZWZmZWN0LCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEVmZmVjdHMoe1xuICAgICAgICBzY2hlbWEsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRWZmZWN0cyxcbiAgICAgICAgZWZmZWN0LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuWm9kRWZmZWN0cy5jcmVhdGVXaXRoUHJlcHJvY2VzcyA9IChwcmVwcm9jZXNzLCBzY2hlbWEsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kRWZmZWN0cyh7XG4gICAgICAgIHNjaGVtYSxcbiAgICAgICAgZWZmZWN0OiB7IHR5cGU6IFwicHJlcHJvY2Vzc1wiLCB0cmFuc2Zvcm06IHByZXByb2Nlc3MgfSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFZmZlY3RzLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IHsgWm9kRWZmZWN0cyBhcyBab2RUcmFuc2Zvcm1lciB9O1xuZXhwb3J0IGNsYXNzIFpvZE9wdGlvbmFsIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgPT09IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gT0sodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmlubmVyVHlwZS5fcGFyc2UoaW5wdXQpO1xuICAgIH1cbiAgICB1bndyYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlO1xuICAgIH1cbn1cblpvZE9wdGlvbmFsLmNyZWF0ZSA9ICh0eXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE9wdGlvbmFsKHtcbiAgICAgICAgaW5uZXJUeXBlOiB0eXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE9wdGlvbmFsLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZE51bGxhYmxlIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgPT09IFpvZFBhcnNlZFR5cGUubnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIE9LKG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlLl9wYXJzZShpbnB1dCk7XG4gICAgfVxuICAgIHVud3JhcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuWm9kTnVsbGFibGUuY3JlYXRlID0gKHR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTnVsbGFibGUoe1xuICAgICAgICBpbm5lclR5cGU6IHR5cGUsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTnVsbGFibGUsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kRGVmYXVsdCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgbGV0IGRhdGEgPSBjdHguZGF0YTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlID09PSBab2RQYXJzZWRUeXBlLnVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZGF0YSA9IHRoaXMuX2RlZi5kZWZhdWx0VmFsdWUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmlubmVyVHlwZS5fcGFyc2Uoe1xuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZW1vdmVEZWZhdWx0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmlubmVyVHlwZTtcbiAgICB9XG59XG5ab2REZWZhdWx0LmNyZWF0ZSA9ICh0eXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZERlZmF1bHQoe1xuICAgICAgICBpbm5lclR5cGU6IHR5cGUsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRGVmYXVsdCxcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB0eXBlb2YgcGFyYW1zLmRlZmF1bHQgPT09IFwiZnVuY3Rpb25cIiA/IHBhcmFtcy5kZWZhdWx0IDogKCkgPT4gcGFyYW1zLmRlZmF1bHQsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kQ2F0Y2ggZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIC8vIG5ld0N0eCBpcyB1c2VkIHRvIG5vdCBjb2xsZWN0IGlzc3VlcyBmcm9tIGlubmVyIHR5cGVzIGluIGN0eFxuICAgICAgICBjb25zdCBuZXdDdHggPSB7XG4gICAgICAgICAgICAuLi5jdHgsXG4gICAgICAgICAgICBjb21tb246IHtcbiAgICAgICAgICAgICAgICAuLi5jdHguY29tbW9uLFxuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9kZWYuaW5uZXJUeXBlLl9wYXJzZSh7XG4gICAgICAgICAgICBkYXRhOiBuZXdDdHguZGF0YSxcbiAgICAgICAgICAgIHBhdGg6IG5ld0N0eC5wYXRoLFxuICAgICAgICAgICAgcGFyZW50OiB7XG4gICAgICAgICAgICAgICAgLi4ubmV3Q3R4LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpc0FzeW5jKHJlc3VsdCkpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBcInZhbGlkXCIsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHQuc3RhdHVzID09PSBcInZhbGlkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gcmVzdWx0LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMuX2RlZi5jYXRjaFZhbHVlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXQgZXJyb3IoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgWm9kRXJyb3IobmV3Q3R4LmNvbW1vbi5pc3N1ZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IG5ld0N0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFwidmFsaWRcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogcmVzdWx0LnN0YXR1cyA9PT0gXCJ2YWxpZFwiXG4gICAgICAgICAgICAgICAgICAgID8gcmVzdWx0LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIDogdGhpcy5fZGVmLmNhdGNoVmFsdWUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0IGVycm9yKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgWm9kRXJyb3IobmV3Q3R4LmNvbW1vbi5pc3N1ZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBuZXdDdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlbW92ZUNhdGNoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmlubmVyVHlwZTtcbiAgICB9XG59XG5ab2RDYXRjaC5jcmVhdGUgPSAodHlwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RDYXRjaCh7XG4gICAgICAgIGlubmVyVHlwZTogdHlwZSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RDYXRjaCxcbiAgICAgICAgY2F0Y2hWYWx1ZTogdHlwZW9mIHBhcmFtcy5jYXRjaCA9PT0gXCJmdW5jdGlvblwiID8gcGFyYW1zLmNhdGNoIDogKCkgPT4gcGFyYW1zLmNhdGNoLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZE5hTiBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLm5hbikge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5uYW4sXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGlucHV0LmRhdGEgfTtcbiAgICB9XG59XG5ab2ROYU4uY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTmFOKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2ROYU4sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY29uc3QgQlJBTkQgPSBTeW1ib2woXCJ6b2RfYnJhbmRcIik7XG5leHBvcnQgY2xhc3MgWm9kQnJhbmRlZCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IGN0eC5kYXRhO1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnR5cGUuX3BhcnNlKHtcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgdW53cmFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnR5cGU7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFpvZFBpcGVsaW5lIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVBc3luYyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpblJlc3VsdCA9IGF3YWl0IHRoaXMuX2RlZi5pbi5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGluUmVzdWx0LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgIGlmIChpblJlc3VsdC5zdGF0dXMgPT09IFwiZGlydHlcIikge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERJUlRZKGluUmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9kZWYub3V0Ll9wYXJzZUFzeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGluUmVzdWx0LnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVBc3luYygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaW5SZXN1bHQgPSB0aGlzLl9kZWYuaW4uX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChpblJlc3VsdC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgaWYgKGluUmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBcImRpcnR5XCIsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBpblJlc3VsdC52YWx1ZSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vdXQuX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGluUmVzdWx0LnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIGNyZWF0ZShhLCBiKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kUGlwZWxpbmUoe1xuICAgICAgICAgICAgaW46IGEsXG4gICAgICAgICAgICBvdXQ6IGIsXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFBpcGVsaW5lLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgWm9kUmVhZG9ubHkgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fZGVmLmlubmVyVHlwZS5fcGFyc2UoaW5wdXQpO1xuICAgICAgICBjb25zdCBmcmVlemUgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzVmFsaWQoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhLnZhbHVlID0gT2JqZWN0LmZyZWV6ZShkYXRhLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gaXNBc3luYyhyZXN1bHQpID8gcmVzdWx0LnRoZW4oKGRhdGEpID0+IGZyZWV6ZShkYXRhKSkgOiBmcmVlemUocmVzdWx0KTtcbiAgICB9XG4gICAgdW53cmFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmlubmVyVHlwZTtcbiAgICB9XG59XG5ab2RSZWFkb25seS5jcmVhdGUgPSAodHlwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RSZWFkb25seSh7XG4gICAgICAgIGlubmVyVHlwZTogdHlwZSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RSZWFkb25seSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8gICAgICAgICAgICAgICAgICAgIC8vLy8vLy8vLy9cbi8vLy8vLy8vLy8gICAgICB6LmN1c3RvbSAgICAgIC8vLy8vLy8vLy9cbi8vLy8vLy8vLy8gICAgICAgICAgICAgICAgICAgIC8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmZ1bmN0aW9uIGNsZWFuUGFyYW1zKHBhcmFtcywgZGF0YSkge1xuICAgIGNvbnN0IHAgPSB0eXBlb2YgcGFyYW1zID09PSBcImZ1bmN0aW9uXCIgPyBwYXJhbXMoZGF0YSkgOiB0eXBlb2YgcGFyYW1zID09PSBcInN0cmluZ1wiID8geyBtZXNzYWdlOiBwYXJhbXMgfSA6IHBhcmFtcztcbiAgICBjb25zdCBwMiA9IHR5cGVvZiBwID09PSBcInN0cmluZ1wiID8geyBtZXNzYWdlOiBwIH0gOiBwO1xuICAgIHJldHVybiBwMjtcbn1cbmV4cG9ydCBmdW5jdGlvbiBjdXN0b20oY2hlY2ssIF9wYXJhbXMgPSB7fSwgXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKlxuICogUGFzcyBgZmF0YWxgIGludG8gdGhlIHBhcmFtcyBvYmplY3QgaW5zdGVhZDpcbiAqXG4gKiBgYGB0c1xuICogei5zdHJpbmcoKS5jdXN0b20oKHZhbCkgPT4gdmFsLmxlbmd0aCA+IDUsIHsgZmF0YWw6IGZhbHNlIH0pXG4gKiBgYGBcbiAqXG4gKi9cbmZhdGFsKSB7XG4gICAgaWYgKGNoZWNrKVxuICAgICAgICByZXR1cm4gWm9kQW55LmNyZWF0ZSgpLnN1cGVyUmVmaW5lKChkYXRhLCBjdHgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHIgPSBjaGVjayhkYXRhKTtcbiAgICAgICAgICAgIGlmIChyIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByLnRoZW4oKHIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJhbXMgPSBjbGVhblBhcmFtcyhfcGFyYW1zLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IF9mYXRhbCA9IHBhcmFtcy5mYXRhbCA/PyBmYXRhbCA/PyB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmFkZElzc3VlKHsgY29kZTogXCJjdXN0b21cIiwgLi4ucGFyYW1zLCBmYXRhbDogX2ZhdGFsIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJhbXMgPSBjbGVhblBhcmFtcyhfcGFyYW1zLCBkYXRhKTtcbiAgICAgICAgICAgICAgICBjb25zdCBfZmF0YWwgPSBwYXJhbXMuZmF0YWwgPz8gZmF0YWwgPz8gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjdHguYWRkSXNzdWUoeyBjb2RlOiBcImN1c3RvbVwiLCAuLi5wYXJhbXMsIGZhdGFsOiBfZmF0YWwgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0pO1xuICAgIHJldHVybiBab2RBbnkuY3JlYXRlKCk7XG59XG5leHBvcnQgeyBab2RUeXBlIGFzIFNjaGVtYSwgWm9kVHlwZSBhcyBab2RTY2hlbWEgfTtcbmV4cG9ydCBjb25zdCBsYXRlID0ge1xuICAgIG9iamVjdDogWm9kT2JqZWN0LmxhenljcmVhdGUsXG59O1xuZXhwb3J0IHZhciBab2RGaXJzdFBhcnR5VHlwZUtpbmQ7XG4oZnVuY3Rpb24gKFpvZEZpcnN0UGFydHlUeXBlS2luZCkge1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFN0cmluZ1wiXSA9IFwiWm9kU3RyaW5nXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTnVtYmVyXCJdID0gXCJab2ROdW1iZXJcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2ROYU5cIl0gPSBcIlpvZE5hTlwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEJpZ0ludFwiXSA9IFwiWm9kQmlnSW50XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kQm9vbGVhblwiXSA9IFwiWm9kQm9vbGVhblwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZERhdGVcIl0gPSBcIlpvZERhdGVcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RTeW1ib2xcIl0gPSBcIlpvZFN5bWJvbFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFVuZGVmaW5lZFwiXSA9IFwiWm9kVW5kZWZpbmVkXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTnVsbFwiXSA9IFwiWm9kTnVsbFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEFueVwiXSA9IFwiWm9kQW55XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kVW5rbm93blwiXSA9IFwiWm9kVW5rbm93blwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE5ldmVyXCJdID0gXCJab2ROZXZlclwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFZvaWRcIl0gPSBcIlpvZFZvaWRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RBcnJheVwiXSA9IFwiWm9kQXJyYXlcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RPYmplY3RcIl0gPSBcIlpvZE9iamVjdFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFVuaW9uXCJdID0gXCJab2RVbmlvblwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZERpc2NyaW1pbmF0ZWRVbmlvblwiXSA9IFwiWm9kRGlzY3JpbWluYXRlZFVuaW9uXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kSW50ZXJzZWN0aW9uXCJdID0gXCJab2RJbnRlcnNlY3Rpb25cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RUdXBsZVwiXSA9IFwiWm9kVHVwbGVcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RSZWNvcmRcIl0gPSBcIlpvZFJlY29yZFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE1hcFwiXSA9IFwiWm9kTWFwXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kU2V0XCJdID0gXCJab2RTZXRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RGdW5jdGlvblwiXSA9IFwiWm9kRnVuY3Rpb25cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RMYXp5XCJdID0gXCJab2RMYXp5XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTGl0ZXJhbFwiXSA9IFwiWm9kTGl0ZXJhbFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEVudW1cIl0gPSBcIlpvZEVudW1cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RFZmZlY3RzXCJdID0gXCJab2RFZmZlY3RzXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTmF0aXZlRW51bVwiXSA9IFwiWm9kTmF0aXZlRW51bVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE9wdGlvbmFsXCJdID0gXCJab2RPcHRpb25hbFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE51bGxhYmxlXCJdID0gXCJab2ROdWxsYWJsZVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZERlZmF1bHRcIl0gPSBcIlpvZERlZmF1bHRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RDYXRjaFwiXSA9IFwiWm9kQ2F0Y2hcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RQcm9taXNlXCJdID0gXCJab2RQcm9taXNlXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kQnJhbmRlZFwiXSA9IFwiWm9kQnJhbmRlZFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFBpcGVsaW5lXCJdID0gXCJab2RQaXBlbGluZVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFJlYWRvbmx5XCJdID0gXCJab2RSZWFkb25seVwiO1xufSkoWm9kRmlyc3RQYXJ0eVR5cGVLaW5kIHx8IChab2RGaXJzdFBhcnR5VHlwZUtpbmQgPSB7fSkpO1xuLy8gcmVxdWlyZXMgVFMgNC40K1xuY2xhc3MgQ2xhc3Mge1xuICAgIGNvbnN0cnVjdG9yKC4uLl8pIHsgfVxufVxuY29uc3QgaW5zdGFuY2VPZlR5cGUgPSAoXG4vLyBjb25zdCBpbnN0YW5jZU9mVHlwZSA9IDxUIGV4dGVuZHMgbmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55PihcbmNscywgcGFyYW1zID0ge1xuICAgIG1lc3NhZ2U6IGBJbnB1dCBub3QgaW5zdGFuY2Ugb2YgJHtjbHMubmFtZX1gLFxufSkgPT4gY3VzdG9tKChkYXRhKSA9PiBkYXRhIGluc3RhbmNlb2YgY2xzLCBwYXJhbXMpO1xuY29uc3Qgc3RyaW5nVHlwZSA9IFpvZFN0cmluZy5jcmVhdGU7XG5jb25zdCBudW1iZXJUeXBlID0gWm9kTnVtYmVyLmNyZWF0ZTtcbmNvbnN0IG5hblR5cGUgPSBab2ROYU4uY3JlYXRlO1xuY29uc3QgYmlnSW50VHlwZSA9IFpvZEJpZ0ludC5jcmVhdGU7XG5jb25zdCBib29sZWFuVHlwZSA9IFpvZEJvb2xlYW4uY3JlYXRlO1xuY29uc3QgZGF0ZVR5cGUgPSBab2REYXRlLmNyZWF0ZTtcbmNvbnN0IHN5bWJvbFR5cGUgPSBab2RTeW1ib2wuY3JlYXRlO1xuY29uc3QgdW5kZWZpbmVkVHlwZSA9IFpvZFVuZGVmaW5lZC5jcmVhdGU7XG5jb25zdCBudWxsVHlwZSA9IFpvZE51bGwuY3JlYXRlO1xuY29uc3QgYW55VHlwZSA9IFpvZEFueS5jcmVhdGU7XG5jb25zdCB1bmtub3duVHlwZSA9IFpvZFVua25vd24uY3JlYXRlO1xuY29uc3QgbmV2ZXJUeXBlID0gWm9kTmV2ZXIuY3JlYXRlO1xuY29uc3Qgdm9pZFR5cGUgPSBab2RWb2lkLmNyZWF0ZTtcbmNvbnN0IGFycmF5VHlwZSA9IFpvZEFycmF5LmNyZWF0ZTtcbmNvbnN0IG9iamVjdFR5cGUgPSBab2RPYmplY3QuY3JlYXRlO1xuY29uc3Qgc3RyaWN0T2JqZWN0VHlwZSA9IFpvZE9iamVjdC5zdHJpY3RDcmVhdGU7XG5jb25zdCB1bmlvblR5cGUgPSBab2RVbmlvbi5jcmVhdGU7XG5jb25zdCBkaXNjcmltaW5hdGVkVW5pb25UeXBlID0gWm9kRGlzY3JpbWluYXRlZFVuaW9uLmNyZWF0ZTtcbmNvbnN0IGludGVyc2VjdGlvblR5cGUgPSBab2RJbnRlcnNlY3Rpb24uY3JlYXRlO1xuY29uc3QgdHVwbGVUeXBlID0gWm9kVHVwbGUuY3JlYXRlO1xuY29uc3QgcmVjb3JkVHlwZSA9IFpvZFJlY29yZC5jcmVhdGU7XG5jb25zdCBtYXBUeXBlID0gWm9kTWFwLmNyZWF0ZTtcbmNvbnN0IHNldFR5cGUgPSBab2RTZXQuY3JlYXRlO1xuY29uc3QgZnVuY3Rpb25UeXBlID0gWm9kRnVuY3Rpb24uY3JlYXRlO1xuY29uc3QgbGF6eVR5cGUgPSBab2RMYXp5LmNyZWF0ZTtcbmNvbnN0IGxpdGVyYWxUeXBlID0gWm9kTGl0ZXJhbC5jcmVhdGU7XG5jb25zdCBlbnVtVHlwZSA9IFpvZEVudW0uY3JlYXRlO1xuY29uc3QgbmF0aXZlRW51bVR5cGUgPSBab2ROYXRpdmVFbnVtLmNyZWF0ZTtcbmNvbnN0IHByb21pc2VUeXBlID0gWm9kUHJvbWlzZS5jcmVhdGU7XG5jb25zdCBlZmZlY3RzVHlwZSA9IFpvZEVmZmVjdHMuY3JlYXRlO1xuY29uc3Qgb3B0aW9uYWxUeXBlID0gWm9kT3B0aW9uYWwuY3JlYXRlO1xuY29uc3QgbnVsbGFibGVUeXBlID0gWm9kTnVsbGFibGUuY3JlYXRlO1xuY29uc3QgcHJlcHJvY2Vzc1R5cGUgPSBab2RFZmZlY3RzLmNyZWF0ZVdpdGhQcmVwcm9jZXNzO1xuY29uc3QgcGlwZWxpbmVUeXBlID0gWm9kUGlwZWxpbmUuY3JlYXRlO1xuY29uc3Qgb3N0cmluZyA9ICgpID0+IHN0cmluZ1R5cGUoKS5vcHRpb25hbCgpO1xuY29uc3Qgb251bWJlciA9ICgpID0+IG51bWJlclR5cGUoKS5vcHRpb25hbCgpO1xuY29uc3Qgb2Jvb2xlYW4gPSAoKSA9PiBib29sZWFuVHlwZSgpLm9wdGlvbmFsKCk7XG5leHBvcnQgY29uc3QgY29lcmNlID0ge1xuICAgIHN0cmluZzogKChhcmcpID0+IFpvZFN0cmluZy5jcmVhdGUoeyAuLi5hcmcsIGNvZXJjZTogdHJ1ZSB9KSksXG4gICAgbnVtYmVyOiAoKGFyZykgPT4gWm9kTnVtYmVyLmNyZWF0ZSh7IC4uLmFyZywgY29lcmNlOiB0cnVlIH0pKSxcbiAgICBib29sZWFuOiAoKGFyZykgPT4gWm9kQm9vbGVhbi5jcmVhdGUoe1xuICAgICAgICAuLi5hcmcsXG4gICAgICAgIGNvZXJjZTogdHJ1ZSxcbiAgICB9KSksXG4gICAgYmlnaW50OiAoKGFyZykgPT4gWm9kQmlnSW50LmNyZWF0ZSh7IC4uLmFyZywgY29lcmNlOiB0cnVlIH0pKSxcbiAgICBkYXRlOiAoKGFyZykgPT4gWm9kRGF0ZS5jcmVhdGUoeyAuLi5hcmcsIGNvZXJjZTogdHJ1ZSB9KSksXG59O1xuZXhwb3J0IHsgYW55VHlwZSBhcyBhbnksIGFycmF5VHlwZSBhcyBhcnJheSwgYmlnSW50VHlwZSBhcyBiaWdpbnQsIGJvb2xlYW5UeXBlIGFzIGJvb2xlYW4sIGRhdGVUeXBlIGFzIGRhdGUsIGRpc2NyaW1pbmF0ZWRVbmlvblR5cGUgYXMgZGlzY3JpbWluYXRlZFVuaW9uLCBlZmZlY3RzVHlwZSBhcyBlZmZlY3QsIGVudW1UeXBlIGFzIGVudW0sIGZ1bmN0aW9uVHlwZSBhcyBmdW5jdGlvbiwgaW5zdGFuY2VPZlR5cGUgYXMgaW5zdGFuY2VvZiwgaW50ZXJzZWN0aW9uVHlwZSBhcyBpbnRlcnNlY3Rpb24sIGxhenlUeXBlIGFzIGxhenksIGxpdGVyYWxUeXBlIGFzIGxpdGVyYWwsIG1hcFR5cGUgYXMgbWFwLCBuYW5UeXBlIGFzIG5hbiwgbmF0aXZlRW51bVR5cGUgYXMgbmF0aXZlRW51bSwgbmV2ZXJUeXBlIGFzIG5ldmVyLCBudWxsVHlwZSBhcyBudWxsLCBudWxsYWJsZVR5cGUgYXMgbnVsbGFibGUsIG51bWJlclR5cGUgYXMgbnVtYmVyLCBvYmplY3RUeXBlIGFzIG9iamVjdCwgb2Jvb2xlYW4sIG9udW1iZXIsIG9wdGlvbmFsVHlwZSBhcyBvcHRpb25hbCwgb3N0cmluZywgcGlwZWxpbmVUeXBlIGFzIHBpcGVsaW5lLCBwcmVwcm9jZXNzVHlwZSBhcyBwcmVwcm9jZXNzLCBwcm9taXNlVHlwZSBhcyBwcm9taXNlLCByZWNvcmRUeXBlIGFzIHJlY29yZCwgc2V0VHlwZSBhcyBzZXQsIHN0cmljdE9iamVjdFR5cGUgYXMgc3RyaWN0T2JqZWN0LCBzdHJpbmdUeXBlIGFzIHN0cmluZywgc3ltYm9sVHlwZSBhcyBzeW1ib2wsIGVmZmVjdHNUeXBlIGFzIHRyYW5zZm9ybWVyLCB0dXBsZVR5cGUgYXMgdHVwbGUsIHVuZGVmaW5lZFR5cGUgYXMgdW5kZWZpbmVkLCB1bmlvblR5cGUgYXMgdW5pb24sIHVua25vd25UeXBlIGFzIHVua25vd24sIHZvaWRUeXBlIGFzIHZvaWQsIH07XG5leHBvcnQgY29uc3QgTkVWRVIgPSBJTlZBTElEO1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBzaXppbmcudHMgXHUyMDE0IFNoYXJlZCBwZXItYmxvY2sgc2l6aW5nIGZyYWdtZW50ICh2YXJpYWJsZSBibG9jayBzaXppbmcsIERyb3AgMSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBPbmUgdW5pZmllZCBtZWNoYW5pc20gZm9yIFwidGhpcyBibG9jayByZW5kZXJzIG5hcnJvd2VyIHRoYW4gaXRzIGNvbnRhaW5lclwiOlxuLy8gYW4gb3B0aW9uYWwgd2lkdGggRlJBQ1RJT04gcGx1cyBhbiBvcHRpb25hbCBhbGlnbm1lbnQuIEFwcGxpZWQgdG9kYXkgdG9cbi8vIEltYWdlQmxvY2sgYW5kIE1hdGhCbG9jayAodGhlIHNpemFibGUgc2V0IHdpdGggYSByZWFsIGF1dGhvcmluZyBzdXJmYWNlKTtcbi8vIGV4dGVuZHMgdG8gb3RoZXIgYmxvY2tzIGFkZGl0aXZlbHkgd2hlbiB0aGVpciBlZGl0aW5nIFVJIGxhbmRzLiBEZXNpZ246XG4vLyBkb2NzL2Rlc2lnbi92YXJpYWJsZS1ibG9jay1zaXppbmcubWQuXG4vL1xuLy8gUmVmbG93LXNhZmUgYnkgY29uc3RydWN0aW9uOiB3aWR0aCBpcyByZWxhdGl2ZSAoYSBmcmFjdGlvbiBvZiB3aGF0ZXZlclxuLy8gY29udGFpbmVyIHRoZSBibG9jayBzaXRzIGluIFx1MjAxNCBwYWdlIG9yIGNvbHVtbiBjZWxsKSwgbmV2ZXIgYWJzb2x1dGUgcGl4ZWxzLFxuLy8gYW5kIGEgbmFycm93ZWQgYmxvY2sgc3RheXMgaW4gbm9ybWFsIGZsb3cgKG5vIHdyYXAtYXJvdW5kL2Zsb2F0KSwgc28gcHJpbnRcbi8vIHBhZ2luYXRpb24gYW5kIHRoZSBmb2xkYWJsZSdzIGhlaWdodCBtZWFzdXJlbWVudCBrZWVwIHdvcmtpbmcuXG4vL1xuLy8gd2lkdGggXHUyMDE0IGZyYWN0aW9uIG9mIHRoZSBjb250YWluZXIncyBjb250ZW50IHdpZHRoLCBpbiAoMCwgMV0uIEFic2VudCA9IGZ1bGxcbi8vIHdpZHRoICh0b2RheSdzIGJlaGF2aW9yKS4gVGhlIGVkaXRvciBVSSBzbmFwcyB0byBjbGVhbiBzdG9wcyAoMjUvMzMvNTAvNjYvXG4vLyA3NS8xMDAlKSBidXQgdGhlIHNjaGVtYSBhY2NlcHRzIGFueSBmcmFjdGlvbiBzbyBmaW5lLWdyYWluZWQgZHJhZ3MgdmFsaWRhdGUuXG4vL1xuLy8gYWxpZ24gXHUyMDE0IHdoZXJlIHRoZSBuYXJyb3dlZCBibG9jayBzaXRzIGhvcml6b250YWxseS4gQWJzZW50ID0gY2VudGVyICh0aGVcbi8vIG5hdHVyYWwgcmVhZCBmb3IgZmlndXJlcyBvbiBhIHdvcmtzaGVldCk7IG9ubHkgbWVhbmluZ2Z1bCB3aGVuIHdpZHRoIGlzXG4vLyBwcmVzZW50LCBhbmQgdGhlIHJlbmRlcmVyIGlnbm9yZXMgaXQgb3RoZXJ3aXNlLiBTdG9yZWQgb25seSB3aGVuIHdpZHRoIGlzXG4vLyBzZXQgYW5kIHRoZSB2YWx1ZSBpcyAnbGVmdCcvJ3JpZ2h0Jywgc28gcm91bmQtdHJpcCBlcXVhbGl0eSBob2xkcyBmb3IgdGhlXG4vLyBkZWZhdWx0IGNhc2UuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcblxuZXhwb3J0IGNvbnN0IEJsb2NrQWxpZ24gPSB6LmVudW0oWydsZWZ0JywgJ2NlbnRlcicsICdyaWdodCddKTtcbmV4cG9ydCB0eXBlIEJsb2NrQWxpZ24gPSB6LmluZmVyPHR5cGVvZiBCbG9ja0FsaWduPjtcblxuLy8gRnJhY3Rpb24gb2YgY29udGFpbmVyIHdpZHRoLiBndCgwKSBub3QgbWluKDApIFx1MjAxNCBhIHplcm8td2lkdGggYmxvY2sgaXMgYVxuLy8gaGlkZGVuIGJsb2NrLCB3aGljaCBpcyBhIGRpZmZlcmVudCAobm9uZXhpc3RlbnQpIGZlYXR1cmUuXG5leHBvcnQgY29uc3QgQmxvY2tXaWR0aEZyYWN0aW9uID0gei5udW1iZXIoKS5ndCgwKS5tYXgoMSk7XG5cbi8vIFNwcmVhZCBpbnRvIGEgYmxvY2sncyB6Lm9iamVjdCh7Li4ufSkgc2hhcGUuIEEgcGxhaW4gb2JqZWN0IChub3QgYSBab2Rcbi8vIHNjaGVtYSkgc28gZWFjaCBibG9jayBrZWVwcyBhIGZsYXQgZmllbGQgbGlzdCBhbmQgZGlzY3JpbWluYXRlZFVuaW9uIGtlZXBzXG4vLyB3b3JraW5nIHVudG91Y2hlZC5cbmV4cG9ydCBjb25zdCBzaXppbmdGaWVsZHMgPSB7XG4gIHdpZHRoOiBCbG9ja1dpZHRoRnJhY3Rpb24ub3B0aW9uYWwoKSxcbiAgYWxpZ246IEJsb2NrQWxpZ24ub3B0aW9uYWwoKSxcbn07XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBzaXppbmdGaWVsZHMgfSBmcm9tICcuLi9zaXppbmcuanMnO1xuXG4vLyBBIGNyb3Agd2luZG93OiB0aGUgdmlzaWJsZSByZWN0YW5nbGUgaW5zaWRlIHRoZSBzb3VyY2UgaW1hZ2UsIGFzIGZyYWN0aW9ucyBvZlxuLy8gdGhlIHNvdXJjZSdzIG93biB3aWR0aC9oZWlnaHQuIHgseSA9IHRvcC1sZWZ0IG9mIHRoZSB3aW5kb3c7IHcsaCA9IGl0cyBzaXplLlxuLy8gVGhlIHdpbmRvdyBtdXN0IHN0YXkgaW5zaWRlIHRoZSBzb3VyY2UgKHgrdyBcdTIyNjQgMSwgeStoIFx1MjI2NCAxKS4gQSB0aW55IGVwc2lsb25cbi8vIGFic29yYnMgZmxvYXQgZXJyb3IgZnJvbSB0aGUgZWRpdG9yJ3MgcHhcdTIxOTJmcmFjdGlvbiBtYXRoLiBUaGUgcmVuZGVyZXIgaXMgcHVyZVxuLy8gKG5vIGltYWdlIGRpbWVuc2lvbnMpLCBzbyB0aGUgY3JvcCBwaXhlbCBhc3BlY3QgaXMgZGVyaXZlZCBmcm9tIHRoZSBzZXBhcmF0ZWx5XG4vLyBzdG9yZWQgYHNyY0FzcGVjdGAgKHNlZSBJbWFnZUJsb2NrKS4gRGVzaWduOiBkb2NzL2Rlc2lnbi9pbWFnZS1jcm9wLm1kLlxuY29uc3QgQ1JPUF9FUFNJTE9OID0gMWUtNjtcbmV4cG9ydCBjb25zdCBDcm9wUmVjdCA9IHpcbiAgLm9iamVjdCh7XG4gICAgeDogei5udW1iZXIoKS5taW4oMCkubHQoMSksXG4gICAgeTogei5udW1iZXIoKS5taW4oMCkubHQoMSksXG4gICAgdzogei5udW1iZXIoKS5ndCgwKS5tYXgoMSksXG4gICAgaDogei5udW1iZXIoKS5ndCgwKS5tYXgoMSksXG4gIH0pXG4gIC5yZWZpbmUoXG4gICAgKGMpID0+IGMueCArIGMudyA8PSAxICsgQ1JPUF9FUFNJTE9OICYmIGMueSArIGMuaCA8PSAxICsgQ1JPUF9FUFNJTE9OLFxuICAgIHsgbWVzc2FnZTogJ2Nyb3Agd2luZG93IG11c3Qgc3RheSB3aXRoaW4gdGhlIHNvdXJjZSAoeCt3IFx1MjI2NCAxLCB5K2ggXHUyMjY0IDEpJyB9LFxuICApO1xuZXhwb3J0IHR5cGUgQ3JvcFJlY3QgPSB6LmluZmVyPHR5cGVvZiBDcm9wUmVjdD47XG5cbi8vIFBoYXNlIDE6IFVSTC1vbmx5LiBObyB1cGxvYWQgcGlwZWxpbmU7IHRlYWNoZXJzIHBhc3RlIGEgcHVibGljIFVSTC5cbi8vIFBoYXNlIDIrOiBhIHNlcGFyYXRlIHZhcmlhbnQgd2l0aCBhIFN1cGFiYXNlIFN0b3JhZ2UgdXBsb2FkLCB3aXRoIHNyY1xuLy8gcG9pbnRpbmcgdG8gYSBzaWduZWQgVVJMLiBTY2hlbWEgaXMgZm9yd2FyZC1jb21wYXRpYmxlIFx1MjAxNCBhZGRpbmcgYSBuZXdcbi8vIGBzb3VyY2VgIGRpc2NyaW1pbmF0b3IgZmllbGQgbGF0ZXIgaXMgbm9uLWJyZWFraW5nIGlmIGV4aXN0aW5nIHJvd3MgYXJlXG4vLyB0cmVhdGVkIGFzIGBzb3VyY2U6ICd1cmwnYCBieSBkZWZhdWx0LlxuZXhwb3J0IGNvbnN0IEltYWdlQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdpbWFnZScpLFxuICBzcmM6IHouc3RyaW5nKCkudXJsKCksXG4gIC8vIGFsdCBpcyByZXF1aXJlZCBmb3IgYWNjZXNzaWJpbGl0eSBidXQgZGVmYXVsdHMgdG8gZW1wdHkgc3RyaW5nIGZvclxuICAvLyBkZWNvcmF0aXZlIGltYWdlcy4gRWRpdG9ycyBzaG91bGQgd2FybiAobm90IGJsb2NrKSBvbiBlbXB0eSBhbHQuXG4gIGFsdDogei5zdHJpbmcoKS5kZWZhdWx0KCcnKSxcbiAgY2FwdGlvbjogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAvLyBWYXJpYWJsZSBibG9jayBzaXppbmc6IG9wdGlvbmFsIHdpZHRoIGZyYWN0aW9uICsgYWxpZ25tZW50IChzaXppbmcudHMpLlxuICAvLyBUaGlzIElTIHRoZSBpbWFnZSBkaXNwbGF5LXNpemUgbWVjaGFuaXNtIFx1MjAxNCBubyBzZXBhcmF0ZSBpbnRyaW5zaWMgc2l6ZS5cbiAgLi4uc2l6aW5nRmllbGRzLFxuICAvLyBDcm9wIChyZWZyYW1lKSBcdTIwMTQgdGhlIHZpc2libGUgc3ViLXJlY3RhbmdsZSBvZiB0aGUgc291cmNlIChkb2NzL2Rlc2lnbi9cbiAgLy8gaW1hZ2UtY3JvcC5tZCkuIGBzcmNBc3BlY3RgICh0aGUgc291cmNlJ3MgbmF0dXJhbCBXL0ggcmF0aW8pIGxldHMgdGhlIHB1cmVcbiAgLy8gcmVuZGVyZXIgZGVyaXZlIHRoZSBjcm9wIHBpeGVsIGFzcGVjdCBBID0gc3JjQXNwZWN0XHUwMEI3KHcvaCkgd2l0aG91dCByZWFkaW5nXG4gIC8vIGltYWdlIGRpbWVuc2lvbnMuIFN0b3JlZCBCT1RILU9SLU5FSVRIRVI6IGFuIHVuY3JvcHBlZCBpbWFnZSBjYXJyaWVzXG4gIC8vIG5laXRoZXIgKGJ5dGUtaWRlbnRpY2FsIHRvIHRvZGF5KS4gVGhlIHBhaXJpbmcgaXMgZW5mb3JjZWQgaW4gdGhlIGVkaXRvciArXG4gIC8vIHNlcmlhbGl6ZSAobm90IGEgc2NoZW1hIC5yZWZpbmUgXHUyMDE0IEltYWdlQmxvY2sgaXMgYSBkaXNjcmltaW5hdGVkVW5pb24gbWVtYmVyXG4gIC8vIGFuZCByZWZpbmVkIG9iamVjdHMgY2FuJ3QgYmUgZGlzY3JpbWluYXRlZCk7IHNlZSBzZXJpYWxpemUudHMgKyBDUi1JTlYtYm90aC5cbiAgY3JvcDogQ3JvcFJlY3Qub3B0aW9uYWwoKSxcbiAgc3JjQXNwZWN0OiB6Lm51bWJlcigpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgSW1hZ2VCbG9jayA9IHouaW5mZXI8dHlwZW9mIEltYWdlQmxvY2s+O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBncmFwaC1wcmltaXRpdmVzLnRzIFx1MjAxNCBjb29yZGluYXRlLXBsYW5lIHByaW1pdGl2ZXMsIGRlcGVuZGVuY3ktZnJlZVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBheGlzIC8gZnVuY3Rpb24tbW9kZWwgLyBkcmF3YWJsZSB2b2NhYnVsYXJ5IHNoYXJlZCBieSBldmVyeSBncmFwaC1zaGFwZWRcbi8vIHN1cmZhY2U6IGludGVyYWN0aXZlX2dyYXBoICh0aGUgZ3JhZGVkIGJsb2NrKSwgZ3JhcGhfZmlndXJlICh0aGUgc3RhdGljXG4vLyBwaWN0dXJlKSwgbXVsdGlwbGVfY2hvaWNlIGNob2ljZSBmaWd1cmVzLCBtYXRjaGluZyBzaWRlcywgbnVtYmVyX2xpbmVcbi8vIChFbmRwb2ludFN0eWxlKSwgYW5kIGRhdGFfcGxvdC5cbi8vXG4vLyBUaGVzZSBzY2hlbWFzIGxpdmUgSEVSRSwgaW4gYSBsZWFmIG1vZHVsZSB0aGF0IGltcG9ydHMgbm90aGluZyBidXQgem9kLFxuLy8gcmF0aGVyIHRoYW4gaW4gYmxvY2tzL2ludGVyYWN0aXZlLWdyYXBoLnRzIHdoZXJlIHRoZXkgZ3JldyB1cC4gVGhlIHJlYXNvbiBpc1xuLy8gYSBoYXJkIG9uZSwgbm90IHRpZGluZXNzOiBpbnRlcmFjdGl2ZS1ncmFwaC50cyBpbXBvcnRzIElubGluZU5vZGUgZnJvbVxuLy8gaW5saW5lLnRzIChpdHMgcHJvbXB0L2ZlZWRiYWNrL3NvbHV0aW9uIGZpZWxkcyksIHNvIGFueXRoaW5nIHJlYWNoaW5nIHRoZXNlXG4vLyBwcmltaXRpdmVzIFRIUk9VR0ggaXQgaW5oZXJpdHMgYSBkZXBlbmRlbmN5IG9uIGlubGluZS50cy4gV2hlbiBpbmxpbmUudHNcbi8vIGl0c2VsZiBuZWVkcyB0aGVtIFx1MjAxNCBEZWZpbml0aW9uQmxvY2sgYWRtaXRzIGEgZ3JhcGhfZmlndXJlLCBzZWUgaW5saW5lLnRzIFx1MjAxNFxuLy8gdGhhdCBjbG9zZXMgdGhlIGN5Y2xlIGlubGluZS50cyAtPiBncmFwaC1maWd1cmUudHMgLT4gaW50ZXJhY3RpdmUtZ3JhcGgudHMgLT5cbi8vIGlubGluZS50cywgYW5kIHRoZSBjeWNsZSBpcyBmYXRhbCByYXRoZXIgdGhhbiBjb3NtZXRpYzogaW50ZXJhY3RpdmUtZ3JhcGgudHNcbi8vIGV2YWx1YXRlcyBgei5hcnJheShJbmxpbmVOb2RlKWAgYXQgbW9kdWxlIHNjb3BlLCBzbyBhIHBhcnRpYWxseS1pbml0aWFsaXplZFxuLy8gaW5saW5lLmpzIHRocm93cyBhIFREWiBSZWZlcmVuY2VFcnJvciBhdCBpbXBvcnQgdGltZS5cbi8vXG4vLyBibG9ja3MvaW50ZXJhY3RpdmUtZ3JhcGgudHMgcmUtZXhwb3J0cyBldmVyeXRoaW5nIGhlcmUsIHNvIGV2ZXJ5IGV4aXN0aW5nXG4vLyBpbXBvcnRlciBrZWVwcyBpdHMgY3VycmVudCBpbXBvcnQgcGF0aCBhbmQgaWRlbnRpdHkgXHUyMDE0IG5vdGhpbmcgbW92ZWQgZnJvbSBhXG4vLyBjb25zdW1lcidzIHBvaW50IG9mIHZpZXcuIE5ldyBpbmxpbmUtcmVhY2hhYmxlIGNvZGUgKGdyYXBoLWZpZ3VyZS50cykgaW1wb3J0c1xuLy8gZnJvbSB0aGlzIG1vZHVsZSBkaXJlY3RseS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG4vLyAtLS0tIEF4aXMgY29uZmlndXJhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGNvb3JkaW5hdGUgcGxhbmUgdGhlIHN0dWRlbnQgd29ya3MgaW4uIEdyYXBoIHVuaXRzIHRocm91Z2hvdXQgXHUyMDE0IHRvbGVyYW5jZVxuLy8gYW5kIGdyaWQgc3RlcHMgYXJlIGluIHRoZSBzYW1lIHVuaXRzLCBuZXZlciBwaXhlbHMsIHNvIGEgcHVibGlzaGVkIHBhZ2UgdGhhdFxuLy8gcmUtbGF5cy1vdXQgYXQgYSBkaWZmZXJlbnQgc2l6ZSBzdGlsbCBzY29yZXMgaWRlbnRpY2FsbHkuXG5leHBvcnQgY29uc3QgQXhpc0NvbmZpZyA9IHoub2JqZWN0KHtcbiAgeE1pbjogei5udW1iZXIoKSxcbiAgeE1heDogei5udW1iZXIoKSxcbiAgeU1pbjogei5udW1iZXIoKSxcbiAgeU1heDogei5udW1iZXIoKSxcbiAgeEdyaWRTdGVwOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkuZGVmYXVsdCgxKSxcbiAgeUdyaWRTdGVwOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkuZGVmYXVsdCgxKSxcbiAgc2hvd0dyaWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gIC8vIFdoZW4gdHJ1ZSwgYSBkcmFnZ2VkIGhhbmRsZSBzbmFwcyB0byB0aGUgbmVhcmVzdCBncmlkIGludGVyc2VjdGlvbi4gS2V5Ym9hcmRcbiAgLy8gbnVkZ2UgYWx3YXlzIG1vdmVzIGJ5IG9uZSBncmlkIHN0ZXAgcmVnYXJkbGVzcyAoU2hpZnQgPSAwLjEgc3RlcCwgZmluZSkuXG4gIHNuYXBUb0dyaWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG59KTtcbmV4cG9ydCB0eXBlIEF4aXNDb25maWcgPSB6LmluZmVyPHR5cGVvZiBBeGlzQ29uZmlnPjtcblxuLy8gLS0tLSBFbmRwb2ludCBzdHlsZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIG9wZW4gPSBob2xsb3cgZG90LCB2YWx1ZSBFWENMVURFRCAoYSBzdHJpY3QgaW5lcXVhbGl0eSBib3VuZGFyeSwgYW4gb3BlblxuLy8gaW50ZXJ2YWwgZW5kKTsgY2xvc2VkID0gZmlsbGVkIGRvdCwgdmFsdWUgSU5DTFVERUQuIEEgc2hhcmVkIHZvY2FidWxhcnkgdXNlZFxuLy8gYnkgaW5lcXVhbGl0eSBib3VuZGFyaWVzIChEcm9wIDQ6IHN0cmljdCBcdTIxOTIgb3BlbiksIGRvbWFpbi1yZXN0cmljdGVkIHJheXMgYW5kXG4vLyBzZWdtZW50cyAoRHJvcCA2KSwgZGlzcGxheSBzZWdtZW50cywgYW5kIHRoZSBmdXR1cmUgbnVtYmVyLWxpbmUgZmFtaWx5LiBBZGRlZFxuLy8gYXMgYSBmb3VuZGF0aW9uIG5vdyAoRHJvcCAyKTsgY29uc3VtZXJzIHJlbmRlci9zY29yZSBpdCBpbiB0aGVpciBvd24gZHJvcHMuXG5leHBvcnQgY29uc3QgRW5kcG9pbnRTdHlsZSA9IHouZW51bShbJ29wZW4nLCAnY2xvc2VkJ10pO1xuZXhwb3J0IHR5cGUgRW5kcG9pbnRTdHlsZSA9IHouaW5mZXI8dHlwZW9mIEVuZHBvaW50U3R5bGU+O1xuXG4vLyBEb21haW4gcmVzdHJpY3Rpb24gb24gYSBkcmF3biBjdXJ2ZSAoRHJvcCA1LzYpOiByYXlzIGFuZCBzZWdtZW50cyBvZiBhXG4vLyBmdW5jdGlvbi4gU3R5bGVzIG1hcmsgd2hldGhlciBlYWNoIGVuZHBvaW50IGlzIGluY2x1ZGVkIChjbG9zZWQpIG9yIG5vdC5cbmV4cG9ydCBjb25zdCBDdXJ2ZURvbWFpbiA9IHoub2JqZWN0KHtcbiAgbWluOiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIG1pblN0eWxlOiBFbmRwb2ludFN0eWxlLm9wdGlvbmFsKCksXG4gIG1heDogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBtYXhTdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBDdXJ2ZURvbWFpbiA9IHouaW5mZXI8dHlwZW9mIEN1cnZlRG9tYWluPjtcblxuLy8gLS0tLSBGdW5jdGlvbiBtb2RlbHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVhY2ggZmFtaWx5IGNhcnJpZXMgaXRzIHBhcmFtZXRlcnMgKyBhIHBlci1wYXJhbWV0ZXIgdG9sZXJhbmNlLCBhbmQgaXRzXG4vLyBwYXJhbWV0ZXIgbmFtZXMgTUFUQ0ggdGhlIGtpdCdzIHJlZ3Jlc3Npb24gZml0dGVycyAoZ3JhcGgta2l0IGZpdExpbmVhciAvXG4vLyBmaXRRdWFkcmF0aWMgLyBmaXRFeHBvbmVudGlhbCAvIGZpdExvZ2FyaXRobWljKSBzbyBhIGZpdHRlZCBjdXJ2ZSBzY29yZXNcbi8vIGFnYWluc3QgdGhlIGtleSB3aXRoIG5vIHRyYW5zbGF0aW9uLiBGb3Jtczpcbi8vICAgbGluZWFyICAgICAgIHkgPSBzbG9wZVx1MDBCN3ggKyBpbnRlcmNlcHRcbi8vICAgcXVhZHJhdGljICAgIHkgPSBhXHUwMEI3eFx1MDBCMiArIGJcdTAwQjd4ICsgY1xuLy8gICBleHBvbmVudGlhbCAgeSA9IGFcdTAwQjdiXHUwMkUzICAgICAgICAgICAgKGIgPiAwKVxuLy8gICBsb2dhcml0aG1pYyAgeSA9IGEgKyBiXHUwMEI3bG4oeCkgICAgICh4ID4gMClcbi8vICAgdmVydGljYWwgICAgIHggPSBrICAgICAgICAgICAgICAgKE5PVCBhIHkgPSBmKHgpIGN1cnZlIFx1MjAxNCBzY29yZWQgb24geClcbmV4cG9ydCBjb25zdCBMaW5lYXJNb2RlbCA9IHoub2JqZWN0KHtcbiAgZmFtaWx5OiB6LmxpdGVyYWwoJ2xpbmVhcicpLFxuICBzbG9wZTogei5udW1iZXIoKSxcbiAgaW50ZXJjZXB0OiB6Lm51bWJlcigpLFxuICBzbG9wZVRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgaW50ZXJjZXB0VG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxufSk7XG5leHBvcnQgdHlwZSBMaW5lYXJNb2RlbCA9IHouaW5mZXI8dHlwZW9mIExpbmVhck1vZGVsPjtcblxuZXhwb3J0IGNvbnN0IFF1YWRyYXRpY01vZGVsID0gei5vYmplY3Qoe1xuICBmYW1pbHk6IHoubGl0ZXJhbCgncXVhZHJhdGljJyksXG4gIGE6IHoubnVtYmVyKCksXG4gIGI6IHoubnVtYmVyKCksXG4gIGM6IHoubnVtYmVyKCksXG4gIGFUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG4gIGJUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG4gIGNUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIFF1YWRyYXRpY01vZGVsID0gei5pbmZlcjx0eXBlb2YgUXVhZHJhdGljTW9kZWw+O1xuXG5leHBvcnQgY29uc3QgRXhwb25lbnRpYWxNb2RlbCA9IHoub2JqZWN0KHtcbiAgZmFtaWx5OiB6LmxpdGVyYWwoJ2V4cG9uZW50aWFsJyksXG4gIGE6IHoubnVtYmVyKCksXG4gIGI6IHoubnVtYmVyKCksXG4gIGFUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG4gIGJUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIEV4cG9uZW50aWFsTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBFeHBvbmVudGlhbE1vZGVsPjtcblxuZXhwb3J0IGNvbnN0IExvZ2FyaXRobWljTW9kZWwgPSB6Lm9iamVjdCh7XG4gIGZhbWlseTogei5saXRlcmFsKCdsb2dhcml0aG1pYycpLFxuICBhOiB6Lm51bWJlcigpLFxuICBiOiB6Lm51bWJlcigpLFxuICBhVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBiVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxufSk7XG5leHBvcnQgdHlwZSBMb2dhcml0aG1pY01vZGVsID0gei5pbmZlcjx0eXBlb2YgTG9nYXJpdGhtaWNNb2RlbD47XG5cbi8vIEEgdmVydGljYWwgbGluZSB4ID0gay4gSXQgaGFzIG5vIHkgPSBmKHgpIHJlcHJlc2VudGF0aW9uIChpbmZpbml0ZSBzbG9wZSksIHNvXG4vLyBpdCBjYW4ndCByaWRlIHRoZSByZWdyZXNzaW9uIGZpdHRlcnMgXHUyMDE0IHRoZSBraXQgc2NvcmVzIGl0IGRpcmVjdGx5IG9uIHRoZVxuLy8gc3R1ZGVudCdzIHguIEtlcHQgaW4gRnVuY3Rpb25Nb2RlbCAobm90IGEgc2VwYXJhdGUgaW50ZXJhY3Rpb24pIHNvIGF1dGhvcmluZyBhXG4vLyB2ZXJ0aWNhbCBsaW5lIGlzIHRoZSBzYW1lIFwidHlwZSBhbiBlcXVhdGlvblwiIGZsb3cgYXMgYW55IG90aGVyIGZhbWlseS5cbmV4cG9ydCBjb25zdCBWZXJ0aWNhbE1vZGVsID0gei5vYmplY3Qoe1xuICBmYW1pbHk6IHoubGl0ZXJhbCgndmVydGljYWwnKSxcbiAgeDogei5udW1iZXIoKSxcbiAgeFRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgVmVydGljYWxNb2RlbCA9IHouaW5mZXI8dHlwZW9mIFZlcnRpY2FsTW9kZWw+O1xuXG4vLyBEaXNjcmltaW5hdGVkIG9uIGBmYW1pbHlgIHNvIGNvbnN1bWVycyBicmFuY2ggdW5pZm9ybWx5LiBHcm93aW5nIGEgZmFtaWx5IGlzIGFcbi8vIG5ldyBtZW1iZXIgaGVyZSArIGEgbmV3IGZpdC9zY29yZSBicmFuY2ggaW4gdGhlIGtpdCBcdTIwMTQgbm8gb3RoZXIgYmxvY2sgdG91Y2hlZC5cbmV4cG9ydCBjb25zdCBGdW5jdGlvbk1vZGVsID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ2ZhbWlseScsIFtcbiAgTGluZWFyTW9kZWwsXG4gIFF1YWRyYXRpY01vZGVsLFxuICBFeHBvbmVudGlhbE1vZGVsLFxuICBMb2dhcml0aG1pY01vZGVsLFxuICBWZXJ0aWNhbE1vZGVsLFxuXSk7XG5leHBvcnQgdHlwZSBGdW5jdGlvbk1vZGVsID0gei5pbmZlcjx0eXBlb2YgRnVuY3Rpb25Nb2RlbD47XG5cbi8vIC0tLS0gRHJhd2FibGVzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBgRHJhd2FibGVgIGlzIGRpc2NyaW1pbmF0ZWQgb24gYGtpbmRgLiBgY3VydmVgIFJFVVNFUyBGdW5jdGlvbk1vZGVsLCBzbyB0aGVcbi8vIGRheSBxdWFkcmF0aWMvZXhwb25lbnRpYWwvbG9nYXJpdGhtaWMgbGFuZCB0aGV5IGxpZ2h0IHVwIGhlcmUgQU5EIGluXG4vLyBwbG90X2Z1bmN0aW9uIGF0IG9uY2UuIEEgYGxhYmVsYCB0ZXh0LWFubm90YXRpb24gZHJhd2FibGUgaXMgZGVsaWJlcmF0ZWx5XG4vLyBkZWZlcnJlZCAocG9pbnQubGFiZWwgY292ZXJzIHRoZSBjb21tb24gY2FzZSkgXHUyMDE0IFlBR05JLCBhZGRpdGl2ZSB3aGVuIG5lZWRlZC5cbi8vIEF1dGhvcmVkIHBlci1kcmF3YWJsZSBjb2xvci4gU3RvcmVkIGFzIGEgcGFsZXR0ZSBLRVkgKG5vdCBhIGhleCkgc28gY29sb3JzXG4vLyBzdGF5IHNlbWFudGljOyB0aGUga2V5IGxpc3QgaXMgZGVmaW5lZCBIRVJFIChkZXBlbmRlbmN5LWZyZWUpIGFuZCB0aGUga2V5IC0+XG4vLyBoZXggbWFwIGxpdmVzIGluIEBhY3Rpdml0eS9ncmFwaC1raXQncyBEUkFXQUJMRV9QQUxFVFRFLiBBIGRyaWZ0IGd1YXJkIHRlc3Rcbi8vIGtlZXBzIHRoZSB0d28gbGlzdHMgaW4gbG9ja3N0ZXAuIE9wdGlvbmFsOiBhYnNlbnQgPSB0aGUgc2hhcmVkIGRlZmF1bHQgY29sb3IuXG5leHBvcnQgY29uc3QgRHJhd2FibGVDb2xvciA9IHouZW51bShbXG4gICdibHVlJyxcbiAgJ2luZGlnbycsXG4gICd0ZWFsJyxcbiAgJ2dyZWVuJyxcbiAgJ2FtYmVyJyxcbiAgJ3JlZCcsXG4gICd2aW9sZXQnLFxuICAnc2xhdGUnLFxuXSk7XG5leHBvcnQgdHlwZSBEcmF3YWJsZUNvbG9yVCA9IHouaW5mZXI8dHlwZW9mIERyYXdhYmxlQ29sb3I+O1xuXG5jb25zdCBQb2ludERyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ3BvaW50JyksXG4gIGF0OiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIGxhYmVsOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIC8vIG9wZW4gPSBob2xsb3cgKGV4Y2x1ZGVkKSwgY2xvc2VkID0gZmlsbGVkLiBEZWZhdWx0IGNsb3NlZC5cbiAgc3R5bGU6IEVuZHBvaW50U3R5bGUub3B0aW9uYWwoKSxcbiAgY29sb3I6IERyYXdhYmxlQ29sb3Iub3B0aW9uYWwoKSxcbn0pO1xuY29uc3QgQ3VydmVEcmF3YWJsZSA9IHoub2JqZWN0KHtcbiAga2luZDogei5saXRlcmFsKCdjdXJ2ZScpLFxuICBtb2RlbDogRnVuY3Rpb25Nb2RlbCxcbiAgLy8gRHJvcCA1OiBkYXNoZWQgYm91bmRhcnkgKyBoYWxmLXBsYW5lIHNoYWRpbmcgdHVybiBhIGRpc3BsYXkgY3VydmUgaW50byBhXG4gIC8vIHBpY3R1cmVkIGluZXF1YWxpdHk7IGRvbWFpbiByZXN0cmljdHMgaXQgdG8gYSByYXkvc2VnbWVudC5cbiAgc3R5bGU6IHouZW51bShbJ3NvbGlkJywgJ2Rhc2hlZCddKS5vcHRpb25hbCgpLFxuICBzaGFkZTogei5lbnVtKFsnYWJvdmUnLCAnYmVsb3cnLCAnbGVmdCcsICdyaWdodCddKS5vcHRpb25hbCgpLFxuICBkb21haW46IEN1cnZlRG9tYWluLm9wdGlvbmFsKCksXG4gIC8vIENvbnRpbnVhdGlvbiBhcnJvd2hlYWRzIG9uIFVOQk9VTkRFRCBlbmRzICh0ZXh0Ym9vayBjb252ZW50aW9uOiBhcnJvdyA9XG4gIC8vIFwia2VlcHMgZ29pbmdcIiwgZG90ID0gXCJzdG9wcyBoZXJlXCIpLiBEcmF3biB3aGVyZSB0aGUgY3VydmUgZXhpdHMgdGhlIHZpc2libGVcbiAgLy8gd2luZG93OyBhbiBhdXRob3JlZCBkb21haW4gYm91bmQgc3VwcHJlc3NlcyB0aGF0IGVuZCdzIGFycm93IChpdCBnZXRzIHRoZVxuICAvLyBvcGVuL2Nsb3NlZCBkb3QgaW5zdGVhZCkuIHVuZGVmaW5lZCA9IHRydWUgXHUyMDE0IGFycm93cyBhcmUgdGhlIGNvbnZlbnRpb24sXG4gIC8vIHRoaXMgZmxhZyBpcyB0aGUgb3B0LW91dCAoYXV0aG9yIGNhbGwgMjAyNi0wNy0xMCkuXG4gIGFycm93czogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgY29sb3I6IERyYXdhYmxlQ29sb3Iub3B0aW9uYWwoKSxcbn0pO1xuXG4vLyBEcm9wIDU6IHBsb3QgQU5ZIHBhcnNlYWJsZSBmb3JtdWxhIChzaW4oeCksIHJhdGlvbmFscywgXHUyMDI2KSBieSBzYW1wbGluZyBcdTIwMTQgdGhlXG4vLyBlc2NhcGUgaGF0Y2ggdGhlIGdyYWRlZCBmYW1pbGllcyBkZWxpYmVyYXRlbHkgZG9uJ3QgY292ZXIuIERpc3BsYXktb25seS5cbmNvbnN0IEV4cHJlc3Npb25EcmF3YWJsZSA9IHoub2JqZWN0KHtcbiAga2luZDogei5saXRlcmFsKCdleHByZXNzaW9uJyksXG4gIGV4cHJlc3Npb246IHouc3RyaW5nKCkubWluKDEpLFxuICBzdHlsZTogei5lbnVtKFsnc29saWQnLCAnZGFzaGVkJ10pLm9wdGlvbmFsKCksXG4gIC8vIENvbnRpbnVhdGlvbiBhcnJvd2hlYWRzIGF0IGJvdGggd2luZG93IGV4aXRzIChzZWUgQ3VydmVEcmF3YWJsZS5hcnJvd3MpLlxuICBhcnJvd3M6IHouYm9vbGVhbigpLm9wdGlvbmFsKCksXG4gIGNvbG9yOiBEcmF3YWJsZUNvbG9yLm9wdGlvbmFsKCksXG59KTtcbmNvbnN0IFNlZ21lbnREcmF3YWJsZSA9IHoub2JqZWN0KHtcbiAga2luZDogei5saXRlcmFsKCdzZWdtZW50JyksXG4gIGZyb206IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgdG86IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgLy8gRHJvcCA1OiBvcGVuL2Nsb3NlZCBlbmRwb2ludCBkb3RzIChbZnJvbSwgdG9dKS4gRGVmYXVsdCBjbG9zZWQuXG4gIGVuZHBvaW50czogei50dXBsZShbRW5kcG9pbnRTdHlsZSwgRW5kcG9pbnRTdHlsZV0pLm9wdGlvbmFsKCksXG4gIGNvbG9yOiBEcmF3YWJsZUNvbG9yLm9wdGlvbmFsKCksXG59KTtcblxuLy8gRHJvcCA1OiBhIHJheSBcdTIwMTQgc3RhcnRzIGF0IGBmcm9tYCAob3Blbi9jbG9zZWQpLCBwYXNzZXMgdGhyb3VnaCBgdGhyb3VnaGAsXG4vLyBydW5zIHRvIHRoZSB3aW5kb3cgZWRnZS4gVGhlIHBoeXNpY3MtY2xhc3Mgc3RhcGxlLlxuY29uc3QgUmF5RHJhd2FibGUgPSB6Lm9iamVjdCh7XG4gIGtpbmQ6IHoubGl0ZXJhbCgncmF5JyksXG4gIGZyb206IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgdGhyb3VnaDogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICBmcm9tU3R5bGU6IEVuZHBvaW50U3R5bGUub3B0aW9uYWwoKSxcbiAgLy8gQ29udGludWF0aW9uIGFycm93aGVhZCBvbiB0aGUgdW5ib3VuZGVkIGVuZCAoc2VlIEN1cnZlRHJhd2FibGUuYXJyb3dzKS5cbiAgYXJyb3dzOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICBjb2xvcjogRHJhd2FibGVDb2xvci5vcHRpb25hbCgpLFxufSk7XG5jb25zdCBQb2x5Z29uRHJhd2FibGUgPSB6Lm9iamVjdCh7XG4gIGtpbmQ6IHoubGl0ZXJhbCgncG9seWdvbicpLFxuICB2ZXJ0aWNlczogei5hcnJheSh6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSkpLm1pbigzKSxcbiAgZmlsbGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICBjb2xvcjogRHJhd2FibGVDb2xvci5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgY29uc3QgRHJhd2FibGUgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigna2luZCcsIFtcbiAgUG9pbnREcmF3YWJsZSxcbiAgQ3VydmVEcmF3YWJsZSxcbiAgRXhwcmVzc2lvbkRyYXdhYmxlLFxuICBTZWdtZW50RHJhd2FibGUsXG4gIFJheURyYXdhYmxlLFxuICBQb2x5Z29uRHJhd2FibGUsXG5dKTtcbmV4cG9ydCB0eXBlIERyYXdhYmxlID0gei5pbmZlcjx0eXBlb2YgRHJhd2FibGU+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuLy8gRnJvbSB0aGUgbGVhZiBwcmltaXRpdmVzIG1vZHVsZSwgTk9UIGZyb20gLi9pbnRlcmFjdGl2ZS1ncmFwaC5qcyBcdTIwMTQgdGhhdCBmaWxlXG4vLyBpbXBvcnRzIGlubGluZS50cywgYW5kIGlubGluZS50cyBpbXBvcnRzIFRISVMgb25lIChhIGRlZmluaXRpb24gbWF5IGNvbnRhaW4gYVxuLy8gZ3JhcGggZmlndXJlKSwgc28gcm91dGluZyB0aHJvdWdoIGl0IHdvdWxkIGNsb3NlIGEgZmF0YWwgbW9kdWxlIGN5Y2xlLiBTZWVcbi8vIC4uL2dyYXBoLXByaW1pdGl2ZXMudHMuXG5pbXBvcnQgeyBBeGlzQ29uZmlnLCBEcmF3YWJsZSB9IGZyb20gJy4uL2dyYXBoLXByaW1pdGl2ZXMuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gR3JhcGhGaWd1cmVCbG9jayBcdTIwMTQgYSBzdGF0aWMgY29vcmRpbmF0ZS1wbGFuZSBwaWN0dXJlIChuZXZlciBpbnRlcmFjdGl2ZSkuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBwdXJlIENPTlRFTlQgYmxvY2sgKGRhdGEtYmxvY2stY2F0ZWdvcnk9XCJjb250ZW50XCIpOiBub24taW50ZXJhY3RpdmUsXG4vLyBub24tbnVtYmVyZWQsIG5vIHJ1bnRpbWUgd2lyaW5nLCBubyBzdWJtaXNzaW9uIHdpcmUgaW1wYWN0LiBUaGUgc3RhbmRhbG9uZVxuLy8gcHJvbW90aW9uIG9mIHRoZSBNQy9tYXRjaGluZyBDaG9pY2VHcmFwaCBmaWd1cmUgKHsgYXhpcywgZHJhd2FibGVzIH0pIHRvIGFcbi8vIGJsb2NrLCBidWlsdCBmb3IgdGhlIHJlZmVyZW5jZSBwYW5lbCBcdTIwMTQgXCJ0aGVzZSB0d28gbGluZXMgYXJlIHBhcmFsbGVsXCItc3R5bGVcbi8vIHBpY3R1cmVzIG9uIGEgZm9ybXVsYSBzaGVldC5cbi8vXG4vLyBSZW5kZXJlZCBzZXJ2ZXItc2lkZSBhcyBpbmxpbmUgU1ZHIGJ5IHRoZSByZW5kZXJlcidzIGdyYXBoLXN2ZyBlbmdpbmUsIG5ldmVyXG4vLyB0aGUgaW50ZXJhY3RpdmUga2l0IFx1MjAxNCBzbyBpdCB3b3JrcyBvbiBwYXBlciwgaW4gdGhlIHByaW50IGJveCwgYW5kIGluIHRoZVxuLy8gZmxvYXRpbmcgcGFuZWwgd2l0aCB6ZXJvIEpTLiBDb25zZXF1ZW5jZSAoc2FtZSBhcyBDaG9pY2VHcmFwaCk6IGBleHByZXNzaW9uYFxuLy8gZHJhd2FibGVzIG5lZWQgdGhlIGtpdCdzIGZvcm11bGEgcGFyc2VyIGFuZCBhcmUgTk9UIGRyYXduOyBhdXRob3Jpbmdcbi8vIHN1cmZhY2VzIGRvbid0IG9mZmVyIHRoZW0gaGVyZS5cbi8vXG4vLyBEZWxpYmVyYXRlbHkgTk9UIGEgZGlzcGxheS1tb2RlIGludGVyYWN0aXZlX2dyYXBoOiB0aGF0IGJsb2NrIGlzIGEgbnVtYmVyZWQtXG4vLyBxdWVzdGlvbiBmYW1pbHkgd2l0aCBwcm9tcHQvc29sdXRpb24vY29uZmlkZW5jZSBjaHJvbWUgYW5kIGtpdCBoeWRyYXRpb24uXG4vLyBUaGlzIG9uZSBjYW4gbmV2ZXIgYWNjZXB0IHN0dWRlbnQgaW5wdXQgYnkgY29uc3RydWN0aW9uLCB3aGljaCBpcyB0aGVcbi8vIHJlZmVyZW5jZSBwYW5lbCdzIGNvbnRyYWN0LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IEdyYXBoRmlndXJlQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdncmFwaF9maWd1cmUnKSxcbiAgYXhpczogQXhpc0NvbmZpZyxcbiAgZHJhd2FibGVzOiB6LmFycmF5KERyYXdhYmxlKS5kZWZhdWx0KFtdKSxcbn0pO1xuZXhwb3J0IHR5cGUgR3JhcGhGaWd1cmVCbG9jayA9IHouaW5mZXI8dHlwZW9mIEdyYXBoRmlndXJlQmxvY2s+O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBpbmxpbmUudHMgXHUyMDE0IElubGluZSBjb250ZW50IG5vZGVzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSW5saW5lIG5vZGVzIGFyZSB0aGUgYXRvbXMgaW5zaWRlIGEgYmxvY2sncyBgY29udGVudGAgYXJyYXkuIE1vc3QgYmxvY2tzXG4vLyBhY2NlcHQgdGhlIElubGluZU5vZGUgdW5pb24gKHRleHQgKyBpbmxpbmUgbWF0aCkuIFRoZSBmaWxsX2luX2JsYW5rIGJsb2NrXG4vLyBpcyBzcGVjaWFsOiBpdCBhY2NlcHRzIGFuIGV4dGVuZGVkIHVuaW9uIHRoYXQgYWxzbyBpbmNsdWRlcyBCbGFua1Rva2VuLlxuLy9cbi8vIERpc2NyaW1pbmF0aW9uOiBldmVyeSBpbmxpbmUgbm9kZSBoYXMgYSBgdHlwZWAgbGl0ZXJhbC4gWm9kJ3Ncbi8vIGRpc2NyaW1pbmF0ZWRVbmlvbiBrZXlzIG9uIGl0LCB3aGljaCBnaXZlcyB1cyBuYXJyb3cgdHlwZXMgYWZ0ZXIgcGFyc2luZ1xuLy8gYW5kIGNsZWFyIGVycm9yIG1lc3NhZ2VzIG9uIG1hbGZvcm1lZCBkYXRhLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG4vLyBCb3RoIGltcG9ydHMgYXJlIExFQUYtU0FGRSBcdTIwMTQgbmVpdGhlciBtb2R1bGUgaW1wb3J0cyBpbmxpbmUudHMsIHNvIG5laXRoZXJcbi8vIGNyZWF0ZXMgYSBjeWNsZS4gc2l6aW5nLmpzIGFuZCBibG9ja3MvaW1hZ2UuanMncyBDcm9wUmVjdCBhcmUgem9kLW9ubHk7XG4vLyBibG9ja3MvZ3JhcGgtZmlndXJlLmpzIHJlYWNoZXMgaXRzIGF4aXMvZHJhd2FibGUgcHJpbWl0aXZlcyB2aWEgdGhlIGxlYWZcbi8vIGdyYXBoLXByaW1pdGl2ZXMudHMgcHJlY2lzZWx5IHNvIHRoYXQgdGhpcyBpbXBvcnQgaXMgcG9zc2libGUuIERvIG5vdCBzd2FwXG4vLyBlaXRoZXIgZm9yIGEgYmxvY2tzLyBtb2R1bGUgdGhhdCBjYXJyaWVzIElubGluZU5vZGUuXG5pbXBvcnQgeyBzaXppbmdGaWVsZHMsIHR5cGUgQmxvY2tBbGlnbiB9IGZyb20gJy4vc2l6aW5nLmpzJztcbmltcG9ydCB7IENyb3BSZWN0IH0gZnJvbSAnLi9ibG9ja3MvaW1hZ2UuanMnO1xuaW1wb3J0IHsgR3JhcGhGaWd1cmVCbG9jayB9IGZyb20gJy4vYmxvY2tzL2dyYXBoLWZpZ3VyZS5qcyc7XG5cbi8vIC0tLS0gTWFya3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBNYXJrcyBhcmUgZm9ybWF0dGluZyBhcHBsaWVkIHRvIGEgcnVuIG9mIHRleHQgXHUyMDE0IG5vdCBuZXN0ZWQgZWxlbWVudHMgKG5vXG4vLyA8ZW0+PHN0cm9uZz4uLi48L3N0cm9uZz48L2VtPiBzdHJ1Y3R1cmUpOyBhIHNpbmdsZSBUZXh0Tm9kZSBjYW4gY2Fycnlcbi8vIHNldmVyYWwuIE9yZGVyIGRvZXNuJ3QgbWF0dGVyIFx1MjAxNCByZW5kZXIgb3V0cHV0IGlzIGNhbm9uaWNhbGl6ZWQuXG4vL1xuLy8gRWFjaCBtYXJrIGlzIGFuIE9CSkVDVCB3aXRoIGEgYHR5cGVgIGRpc2NyaW1pbmFudC4gU2ltcGxlIG1hcmtzIChib2xkLCBldGMuKVxuLy8gY2Fycnkgb25seSBgdHlwZWA7IGF0dHJpYnV0ZS1jYXJyeWluZyBtYXJrcyAoZS5nLiBgZGVmaW5pdGlvbmApIGhhbmcgdGhlaXJcbi8vIGRhdGEgb2ZmIHRoZSBzYW1lIG9iamVjdC4gTGVnYWN5IGRvY3VtZW50cyBzdG9yZWQgbWFya3MgYXMgYmFyZSBzdHJpbmdzXG4vLyAoJ2JvbGQnKTsgdGhlIHByZXByb2Nlc3MgYmVsb3cgdXBncmFkZXMgdGhvc2UgdG8gdGhlIG9iamVjdCBmb3JtIG9uIHJlYWQsIHNvXG4vLyBvbGQgYWN0aXZpdGllcyBrZWVwIHBhcnNpbmcgd2l0aG91dCBhIHNjaGVtYVZlcnNpb24gYnVtcC4gTmV3IGNvZGUgYWx3YXlzXG4vLyB3cml0ZXMgdGhlIG9iamVjdCBmb3JtLlxuZXhwb3J0IGNvbnN0IFNJTVBMRV9NQVJLX1RZUEVTID0gW1xuICAnYm9sZCcsXG4gICdpdGFsaWMnLFxuICAndW5kZXJsaW5lJyxcbiAgJ2NvZGUnLFxuICAnc3Vic2NyaXB0JyxcbiAgJ3N1cGVyc2NyaXB0Jyxcbl0gYXMgY29uc3Q7XG5leHBvcnQgdHlwZSBTaW1wbGVNYXJrVHlwZSA9ICh0eXBlb2YgU0lNUExFX01BUktfVFlQRVMpW251bWJlcl07XG5cbmNvbnN0IEJvbGRNYXJrID0gei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ2JvbGQnKSB9KTtcbmNvbnN0IEl0YWxpY01hcmsgPSB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnaXRhbGljJykgfSk7XG5jb25zdCBVbmRlcmxpbmVNYXJrID0gei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ3VuZGVybGluZScpIH0pO1xuY29uc3QgQ29kZU1hcmsgPSB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnY29kZScpIH0pO1xuY29uc3QgU3Vic2NyaXB0TWFyayA9IHoub2JqZWN0KHsgdHlwZTogei5saXRlcmFsKCdzdWJzY3JpcHQnKSB9KTtcbmNvbnN0IFN1cGVyc2NyaXB0TWFyayA9IHoub2JqZWN0KHsgdHlwZTogei5saXRlcmFsKCdzdXBlcnNjcmlwdCcpIH0pO1xuXG4vLyBUaGUgYXR0cmlidXRlLWZyZWUgbWFya3MgYXMgYSB1bmlvbi4gRGVmaW5pdGlvbiBjb250ZW50IChiZWxvdykgYWxsb3dzIG9ubHlcbi8vIHRoZXNlIFx1MjAxNCBhIGRlZmluaXRpb24gY2FuIGJlIGZvcm1hdHRlZCBidXQgY2Fubm90IGl0c2VsZiBjb250YWluIGEgbmVzdGVkXG4vLyBkZWZpbml0aW9uLCB3aGljaCBhbHNvIGtlZXBzIHRoZSBzY2hlbWEgbm9uLXJlY3Vyc2l2ZS5cbmNvbnN0IFNpbXBsZU1hcmsgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgQm9sZE1hcmssXG4gIEl0YWxpY01hcmssXG4gIFVuZGVybGluZU1hcmssXG4gIENvZGVNYXJrLFxuICBTdWJzY3JpcHRNYXJrLFxuICBTdXBlcnNjcmlwdE1hcmssXG5dKTtcblxuLy8gLS0tLSBNYXRoIHByb21wdCAoTW9kZWwgQTogaW4tZXF1YXRpb24gYmxhbmspIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEEgZ3JhZGVhYmxlIGdhcCBJTlNJREUgYSByZW5kZXJlZCBlcXVhdGlvbiBcdTIwMTQgdGhlIE1hdGhMaXZlIGBcXHBsYWNlaG9sZGVyW2lkXXt9YFxuLy8gZmVhdHVyZS4gYGlkYCBtYXRjaGVzIHRoZSBwbGFjZWhvbGRlciBtYXJrZXIgaW4gdGhlIG93bmluZyBub2RlJ3MgYGxhdGV4YDsgdGhlXG4vLyBzdHVkZW50J3MgdHlwZWQgbWF0aCBleHByZXNzaW9uIGlzIGdyYWRlZCBleGFjdGx5IGxpa2UgYSAnbWF0aCcgZmlsbC1pbi1ibGFua1xuLy8gKG51bWVyaWMtc2FtcGxpbmcgZXF1aXZhbGVuY2UsIDJhIFx1MjI2MSBhK2EgXHUyMjYxIGEqMikuIE1vZGVsIEEgcmV1c2VzIHRoZSBleGlzdGluZ1xuLy8gYHN1Ym1pc3Npb25zLnJlc3BvbnNlcy5ibGFua3NgIG1hcCBrZXllZCBieSB0aGlzIGlkLCBzbyBwcm9tcHRzIG5lZWQgTk8gbmV3XG4vLyB3aXJlIHNoYXBlLiBBIGdhcCBpcyBpbmhlcmVudGx5IGEgbWF0aCBhbnN3ZXIsIHNvIHRoZXJlIGlzIG5vIGBhbnN3ZXJUeXBlYFxuLy8gaGVyZSBcdTIwMTQgYGVxdWl2YWxlbmNlYCArIGB0b2xlcmFuY2VgIGFyZSB0aGUgc2FtZSBncmFkaW5nIGtub2JzIGEgJ21hdGgnXG4vLyBCbGFua1Rva2VuIGNhcnJpZXMsIHJldXNlZCB2ZXJiYXRpbS4gU2VlIGRvY3MvZGVzaWduL21hdGgtYmxhbmtzLm1kIChNb2RlbCBBKS5cbmV4cG9ydCBjb25zdCBNYXRoUHJvbXB0ID0gei5vYmplY3Qoe1xuICAvLyBNYXRjaGVzIHRoZSBgXFxwbGFjZWhvbGRlcltpZF17fWAgbWFya2VyIGluIHRoZSBvd25pbmcgbm9kZSdzIGxhdGV4LiBOT1QgYVxuICAvLyB1dWlkOiBNYXRoTGl2ZSBwbGFjZWhvbGRlciBpZHMgbWF5IG5vdCBjb250YWluIHNwYWNlcy9zcGVjaWFsIGNoYXJhY3RlcnNcbiAgLy8gKHV1aWQgaHlwaGVucyBhcmUgdW5zYWZlKSwgc28gdGhlIGVkaXRvciBtaW50cyBhIE1hdGhMaXZlLXNhZmUgdG9rZW4uXG4gIC8vIERvY3VtZW50LXdpZGUgdW5pcXVlbmVzcyAoaXQga2V5cyBpbnRvIHRoZSBibGFua3MgbWFwKSBpcyBhbiBhdXRob3JpbmctdGltZVxuICAvLyBpbnZhcmlhbnQsIG5vdCBhIHNjaGVtYSBjb25zdHJhaW50LlxuICBpZDogei5zdHJpbmcoKS5taW4oMSksXG4gIGFuc3dlcjogei5zdHJpbmcoKS5taW4oMSksXG4gIC8vIEFsdGVybmF0aXZlIGFjY2VwdGFibGUgZm9ybXMgKFwiYWxzbyBhY2NlcHRcIikuIEVtcHR5IGFycmF5IGlzIHRoZSBjb21tb24gY2FzZS5cbiAgYWNjZXB0YWJsZUFuc3dlcnM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIC8vIEVxdWl2YWxlbmNlIG1vZGU6ICd2YWx1ZScgKGRlZmF1bHQsIGFueSBleHByZXNzaW9uIHRoYXQgZXZhbHVhdGVzIGVxdWFsKSBvclxuICAvLyAnZXhhY3QtZm9ybScgKG5vcm1hbGl6ZWQtc3RyaW5nIG1hdGNoKS4gQWJzZW50ID0gJ3ZhbHVlJy4gTWlycm9ycyBCbGFua1Rva2VuLlxuICBlcXVpdmFsZW5jZTogei5lbnVtKFsndmFsdWUnLCAnZXhhY3QtZm9ybSddKS5vcHRpb25hbCgpLFxuICAvLyBBYnNvbHV0ZSBzYW1wbGluZyB0b2xlcmFuY2UuIEFic2VudCA9IG5vIGV4dHJhIHNsYWNrLiBNaXJyb3JzIEJsYW5rVG9rZW4uXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgTWF0aFByb21wdCA9IHouaW5mZXI8dHlwZW9mIE1hdGhQcm9tcHQ+O1xuXG4vLyAtLS0tIElubGluZSBtYXRoIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gTGFUZVggc291cmNlIGZvciBLYVRlWC4gU3RvcmVkIHZlcmJhdGltOyByZW5kZXJlZCBhdCByZW5kZXIgdGltZS4gVGhlXG4vLyByZW5kZXJlciBpcyB0b2xlcmFudCBvZiBpbnZhbGlkIExhVGVYIChyZW5kZXJzIGFuIGVycm9yIGluZGljYXRvciByYXRoZXJcbi8vIHRoYW4gY3Jhc2hpbmcpIHNvIHNhdmluZyBhIGRvYyB3aXRoIGJyb2tlbiBtYXRoIGRvZXNuJ3QgbG9jayB0aGUgZWRpdG9yLlxuZXhwb3J0IGNvbnN0IElubGluZU1hdGhOb2RlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ21hdGhfaW5saW5lJyksXG4gIGxhdGV4OiB6LnN0cmluZygpLFxuICAvLyBNb2RlbCBBOiBvcHRpb25hbCBpbi1lcXVhdGlvbiBncmFkZWFibGUgZ2FwcyAoXHUwMEE3TWF0aFByb21wdCkuIE9wdGlvbmFsIHdpdGhcbiAgLy8gTk8gZGVmYXVsdCBzbyBhIG1hdGggbm9kZSBhdXRob3JlZCBiZWZvcmUgTW9kZWwgQSBcdTIwMTQgb3Igb25lIHdpdGggbm8gZ2FwcyBcdTIwMTRcbiAgLy8gcmUtc2VyaWFsaXplcyBCWVRFLUlERU5USUNBTExZIChhIGAuZGVmYXVsdChbXSlgIHdvdWxkIG1hdGVyaWFsaXplIGBwcm9tcHRzOlxuICAvLyBbXWAgb24gZXZlcnkgbGVnYWN5IG5vZGUpLiBTYW1lIG9wdGlvbmFsLW5vLWRlZmF1bHQgZGlzY2lwbGluZSBhc1xuICAvLyBCbGFua1Rva2VuLmFuc3dlclR5cGUvdG9sZXJhbmNlLiBTZWUgZG9jcy9kZXNpZ24vbWF0aC1ibGFua3MubWQgKE1vZGVsIEEpLlxuICBwcm9tcHRzOiB6LmFycmF5KE1hdGhQcm9tcHQpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIElubGluZU1hdGhOb2RlID0gei5pbmZlcjx0eXBlb2YgSW5saW5lTWF0aE5vZGU+O1xuXG4vLyAtLS0tIEhhcmQgYnJlYWsgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBzb2Z0IGxpbmUgYnJlYWsgaW5zaWRlIGEgYmxvY2sgKFRpcHRhcCdzIGhhcmRCcmVhayAvIFNoaWZ0K0VudGVyKSwgYXNcbi8vIG9wcG9zZWQgdG8gYSBuZXcgYmxvY2suIENhcnJpZXMgbm8gZGF0YSBcdTIwMTQgaXQgcmVuZGVycyBhcyA8YnI+LiBXaXRob3V0IHRoaXNcbi8vIG5vZGUgdGhlIGJyZWFrIGlzIGRyb3BwZWQgb24gc2VyaWFsaXplIGFuZCBhZGphY2VudCB0ZXh0IHJ1bnMgY29uY2F0ZW5hdGUuXG5leHBvcnQgY29uc3QgSGFyZEJyZWFrTm9kZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdoYXJkX2JyZWFrJyksXG59KTtcbmV4cG9ydCB0eXBlIEhhcmRCcmVha05vZGUgPSB6LmluZmVyPHR5cGVvZiBIYXJkQnJlYWtOb2RlPjtcblxuLy8gLS0tLSBEZWZpbml0aW9uIGNvbnRlbnQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSByaWNoIGNvbnRlbnQgc2hvd24gaW4gYSBkZWZpbml0aW9uJ3MgcG9wb3ZlcjogZm9ybWF0dGVkIHRleHQgKyBpbmxpbmVcbi8vIG1hdGggKHRoZSBzYW1lIGFscGhhYmV0IHRoZSBibGFuayBoaW50IHVzZXMpLCBhdXRob3JlZCB2aWEgdGhlIHNoYXJlZFxuLy8gSW5saW5lUmljaFRleHRFZGl0b3IuIEEgZGVmaW5pdGlvbidzIHRleHQgcnVuIGNhcnJpZXMgU2ltcGxlTWFyayBvbmx5IFx1MjAxNCBub1xuLy8gbmVzdGVkIGRlZmluaXRpb25zIFx1MjAxNCB3aGljaCBhbHNvIGJyZWFrcyB0aGUgcmVjdXJzaW9uIHRoYXQgcmV1c2luZyBJbmxpbmVOb2RlXG4vLyBoZXJlIHdvdWxkIGNyZWF0ZSAoRGVmaW5pdGlvbk1hcmsgXHUyMTkyIGNvbnRlbnQgXHUyMTkyIHRleHQgXHUyMTkyIG1hcmtzIFx1MjE5MiBEZWZpbml0aW9uTWFyaykuXG5jb25zdCBEZWZpbml0aW9uQ29udGVudFRleHQgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgndGV4dCcpLFxuICB0ZXh0OiB6LnN0cmluZygpLFxuICBtYXJrczogei5hcnJheShTaW1wbGVNYXJrKS5kZWZhdWx0KFtdKSxcbn0pO1xuZXhwb3J0IGNvbnN0IERlZmluaXRpb25Db250ZW50SW5saW5lID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIERlZmluaXRpb25Db250ZW50VGV4dCxcbiAgSW5saW5lTWF0aE5vZGUsXG4gIEhhcmRCcmVha05vZGUsXG5dKTtcbmV4cG9ydCB0eXBlIERlZmluaXRpb25Db250ZW50SW5saW5lID0gei5pbmZlcjx0eXBlb2YgRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmU+O1xuXG4vLyAtLS0tIERlZmluaXRpb24gYmxvY2tzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBkZWZpbml0aW9uJ3MgY29udGVudCBpcyBhIEJMT0NLIHNlcXVlbmNlLCBzbyBhIHZvY2FidWxhcnkgcG9wb3ZlciBjYW4gaG9sZFxuLy8gd2hhdCBhIHJlZmVyZW5jZSBzaGVldCBob2xkczogYSBkaXNwbGF5IGVxdWF0aW9uLCBhIHNob3J0IHByb3BlcnR5IGxpc3QsIGFcbi8vIGZpZ3VyZS4gU2VlIGRvY3MvZGVzaWduL2RlZmluaXRpb24tcmljaC1jb250ZW50Lm1kLlxuLy9cbi8vIFRoZSB1bmlvbiBpcyBhIGN1cmF0ZWQgc3Vic2V0IG9mIHRoZSByZWZlcmVuY2UgcGFuZWwncyBjb250ZW50IGJsb2NrcywgYW5kXG4vLyBldmVyeSB0ZXh0LWJlYXJpbmcgbWVtYmVyIGlzIGRlZmluZWQgTE9DQUxMWSBvdmVyIERlZmluaXRpb25Db250ZW50SW5saW5lXG4vLyByYXRoZXIgdGhhbiByZXVzaW5nIGl0cyBibG9ja3MvIHNpYmxpbmcuIFRoYXQgaXMgd2hhdCBrZWVwcyB0aGUgc2NoZW1hXG4vLyBOT04tUkVDVVJTSVZFOiBibG9ja3MvcGFyYWdyYXBoLnRzIGFuZCBmcmllbmRzIGNhcnJ5IElubGluZU5vZGUsIHdob3NlXG4vLyBUZXh0Tm9kZSBjYXJyaWVzIE1hcmssIHdoaWNoIGluY2x1ZGVzIERlZmluaXRpb25NYXJrIFx1MjAxNCBzbyByZXVzaW5nIHRoZW0gd291bGRcbi8vIGNsb3NlIHRoZSBjeWNsZSBEZWZpbml0aW9uTWFyayAtPiBibG9jayAtPiB0ZXh0IC0+IG1hcmsgLT4gRGVmaW5pdGlvbk1hcmsgYW5kXG4vLyBhZG1pdCBkZWZpbml0aW9ucyBuZXN0ZWQgaW5zaWRlIGRlZmluaXRpb25zIGF0IGFyYml0cmFyeSBkZXB0aC4gSXQgd291bGQgYWxzb1xuLy8gbGFuZCBvbiB0aGUgc2FtZSB0c2MgZGVjbGFyYXRpb24tc2VyaWFsaXphdGlvbiBsaW1pdCAoVFM3MDU2KSB0aGF0IGFscmVhZHlcbi8vIGZvcmNlZCB0aGUgaGFuZC13cml0dGVuIGBpbnRlcmZhY2UgQWN0aXZpdHlEb2N1bWVudGAgaW4gZG9jdW1lbnQudHMuXG4vL1xuLy8gRXhjbHVkZWQgb24gcHVycG9zZSAoYXV0aG9yIHJ1bGluZ3MsIGRlc2lnbiBkb2MgRDIvRDMpOiBjb2x1bW5zICh1bnJlYWRhYmxlXG4vLyBpbiBhIH4yOHJlbSBwb3BvdmVyIFx1MjAxNCBhIGRlZmluaXRpb24gdGhhdCBuZWVkcyB0d28tY29sdW1uIGxheW91dCBJUyB0aGVcbi8vIHJlZmVyZW5jZSBwYW5lbCksIGNhbGxvdXQgKGEgbm90ZSBib3ggaW5zaWRlIGEgbm90ZSBib3gpLCBhbmQgZXZlcnlcbi8vIHF1ZXN0aW9uL2ludGVyYWN0aXZlIGJsb2NrIChhIGRlZmluaXRpb24gaXMgbmV2ZXIgZ3JhZGVhYmxlKS5cbi8vXG4vLyBgaWRgIGlzIE9QVElPTkFMIG9uIHRoZSBsb2NhbGx5LWRlZmluZWQgbWVtYmVycywgdW5saWtlIGV2ZXJ5IGJsb2Nrcy8gc2libGluZ1xuLy8gd2hlcmUgaXQgaXMgYSByZXF1aXJlZCB1dWlkLiBUd28gcmVhc29uczogbm90aGluZyBhZGRyZXNzZXMgYSBkZWZpbml0aW9uIGJsb2NrXG4vLyAoaXQgaXMgbmV2ZXIgc2NvcmVkLCBuZXZlciBhIHN1Ym1pc3Npb24ga2V5LCBuZXZlciBhIHJ1bnRpbWUgcmVmIFx1MjAxNCBvbmx5IHRoZVxuLy8gZWRpdG9yIHdhbnRzIGl0LCBhbmQgdGhlIGVkaXRvciBhbHdheXMgbWludHMgb25lKSwgYW5kIHRoZSBsZWdhY3kgdXBncmFkZXMgaW5cbi8vIHRoZSBNYXJrIHByZXByb2Nlc3MgYmVsb3cgbXVzdCBiZSBERVRFUk1JTklTVElDLiBBIHJlcXVpcmVkIHV1aWQgd291bGQgZm9yY2Vcbi8vIGNyeXB0by5yYW5kb21VVUlEKCkgYXQgcGFyc2UgdGltZSwgc28gcGFyc2luZyBvbmUgc3RvcmVkIGRvY3VtZW50IHR3aWNlIHdvdWxkXG4vLyB5aWVsZCBkaWZmZXJlbnQgaWRzIGFuZCBicmVhayByZS1zZXJpYWxpemF0aW9uIGJ5dGUtaWRlbnRpdHkuXG5cbi8vIEV2ZXJ5IHNjaGVtYSBiZWxvdyBjYXJyaWVzIGFuIEVYUExJQ0lUIGludGVyZmFjZSArIGB6LlpvZFR5cGU8XHUyMDI2PmAgYW5ub3RhdGlvblxuLy8gcmF0aGVyIHRoYW4gcmVseWluZyBvbiB6LmluZmVyLiBUaGlzIGlzIG5vdCBzdHlsZTogd2l0aG91dCBpdCwgYWRkaW5nIGFcbi8vIDctbWVtYmVyIGJsb2NrIHVuaW9uIGluc2lkZSBhIG1hcmsgdGhhdCBldmVyeSBibG9jaydzIGlubGluZSBjb250ZW50IGNhblxuLy8gcmVhY2ggb3ZlcmZsb3dzIHRzYydzIGRlY2xhcmF0aW9uLXNlcmlhbGl6YXRpb24gbGltaXQgYW5kIGZhaWxzIHRoZSBidWlsZCB3aXRoXG4vLyBUUzcwNTYgaW4gZml2ZSBkb3duc3RyZWFtIGZpbGVzIChibG9ja3MvaW5kZXgudHMncyBCbG9jaywgZG9jdW1lbnQudHMsXG4vLyBsYXlvdXQudHMpLiBOYW1pbmcgdGhlIHR5cGVzIHN0b3BzIHRoZSBzdHJ1Y3R1cmFsIGV4cGFuc2lvbiBhdCB0aGlzIGJvdW5kYXJ5IFx1MjAxNFxuLy8gdGhlIHNhbWUgcmVtZWR5IGBpbnRlcmZhY2UgQWN0aXZpdHlEb2N1bWVudGAgYWxyZWFkeSBhcHBsaWVzIGluIGRvY3VtZW50LnRzLlxuLy8gVGhlIGFubm90YXRpb25zIGFyZSBjaGVja2VkIGFnYWluc3QgdGhlIG9iamVjdCBzY2hlbWFzLCBzbyBub3RoaW5nIGhlcmUgbG9zZXNcbi8vIHR5cGUgc2FmZXR5LCBhbmQgdGhlIHJ1bnRpbWUgb2JqZWN0cyBhcmUgdW50b3VjaGVkIChhIGRpc2NyaW1pbmF0ZWRVbmlvbiBzdGlsbFxuLy8gcGFyc2VzIGFzIGEgZGlzY3JpbWluYXRlZFVuaW9uKS5cblxuY29uc3QgRGVmaW5pdGlvbkJsb2NrSWQgPSB6LnN0cmluZygpLnV1aWQoKS5vcHRpb25hbCgpO1xuXG4vLyBTaGFyZWQgc2l6aW5nIGZyYWdtZW50LCBzcGVsbGVkIG91dCBmb3IgdGhlIGludGVyZmFjZXMgYWJvdmUuXG5pbnRlcmZhY2UgRGVmaW5pdGlvblNpemluZyB7XG4gIHdpZHRoPzogbnVtYmVyO1xuICBhbGlnbj86IEJsb2NrQWxpZ247XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGVmaW5pdGlvblBhcmFncmFwaEJsb2NrIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIHR5cGU6ICdwYXJhZ3JhcGgnO1xuICBjb250ZW50OiBEZWZpbml0aW9uQ29udGVudElubGluZVtdO1xufVxuZXhwb3J0IGludGVyZmFjZSBEZWZpbml0aW9uSGVhZGluZ0Jsb2NrIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIHR5cGU6ICdoZWFkaW5nJztcbiAgbGV2ZWw6IDEgfCAyIHwgMztcbiAgY29udGVudDogRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmVbXTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRGVmaW5pdGlvbk1hdGhCbG9jayBleHRlbmRzIERlZmluaXRpb25TaXppbmcge1xuICBpZD86IHN0cmluZztcbiAgdHlwZTogJ21hdGhfYmxvY2snO1xuICBsYXRleDogc3RyaW5nO1xufVxuZXhwb3J0IGludGVyZmFjZSBEZWZpbml0aW9uSW1hZ2VCbG9jayBleHRlbmRzIERlZmluaXRpb25TaXppbmcge1xuICBpZD86IHN0cmluZztcbiAgdHlwZTogJ2ltYWdlJztcbiAgc3JjOiBzdHJpbmc7XG4gIGFsdDogc3RyaW5nO1xuICBjcm9wPzogQ3JvcFJlY3Q7XG4gIHNyY0FzcGVjdD86IG51bWJlcjtcbn1cblxuY29uc3QgRGVmaW5pdGlvblBhcmFncmFwaEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogRGVmaW5pdGlvbkJsb2NrSWQsXG4gIHR5cGU6IHoubGl0ZXJhbCgncGFyYWdyYXBoJyksXG4gIGNvbnRlbnQ6IHouYXJyYXkoRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmUpLmRlZmF1bHQoW10pLFxufSk7XG5cbi8vIFNhbWUgdGhyZWUtbGV2ZWwgY2FwIGFzIEhlYWRpbmdCbG9jay4gVGhlIHBvcG92ZXIgc3R5bGVzaGVldCBzY29wZXMgdGhlc2Vcbi8vIGRvd24gc28gYSBwYW5lbC1zY2FsZSBoMSByZWFkcyBjb3JyZWN0bHkgYXQgcG9wb3ZlciBzY2FsZS5cbmNvbnN0IERlZmluaXRpb25IZWFkaW5nQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgdHlwZTogei5saXRlcmFsKCdoZWFkaW5nJyksXG4gIGxldmVsOiB6LnVuaW9uKFt6LmxpdGVyYWwoMSksIHoubGl0ZXJhbCgyKSwgei5saXRlcmFsKDMpXSksXG4gIGNvbnRlbnQ6IHouYXJyYXkoRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmUpLmRlZmF1bHQoW10pLFxufSk7XG5cbi8vIERpc3BsYXkgbWF0aC4gQSBkZWZpbml0aW9uLWxvY2FsIHNoYXBlIHJhdGhlciB0aGFuIGJsb2Nrcy9tYXRoLWJsb2NrLnRzJ3Ncbi8vIE1hdGhCbG9jaywgd2hpY2ggY2FycmllcyBgcHJvbXB0c2AgKGluLWVxdWF0aW9uIGdyYWRlYWJsZSBnYXBzKSBhbmRcbi8vIGBzb2x1dGlvbjogSW5saW5lTm9kZVtdYCBcdTIwMTQgdGhlIGZpcnN0IGlzIG1lYW5pbmdsZXNzIGhlcmUgKGEgZGVmaW5pdGlvbiBpc1xuLy8gbmV2ZXIgZ3JhZGVhYmxlLCB0aGUgc2FtZSBwb3N0dXJlIHRoZSByZWZlcmVuY2UgcGFuZWwgYWxyZWFkeSB0YWtlcykgYW5kIHRoZVxuLy8gc2Vjb25kIGlzIGV4YWN0bHkgdGhlIHJlY3Vyc2l2ZSBlZGdlIGRlc2NyaWJlZCBhYm92ZS4gU2l6aW5nIHJpZGVzIGFsb25nO1xuLy8gbGFiZWxGaWVsZHMgZG8gbm90IChhIGRlZmluaXRpb24gYmxvY2sgaXMgbmV2ZXIgbnVtYmVyZWQpLlxuY29uc3QgRGVmaW5pdGlvbk1hdGhCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IERlZmluaXRpb25CbG9ja0lkLFxuICB0eXBlOiB6LmxpdGVyYWwoJ21hdGhfYmxvY2snKSxcbiAgbGF0ZXg6IHouc3RyaW5nKCksXG4gIC4uLnNpemluZ0ZpZWxkcyxcbn0pO1xuXG4vLyBJbGx1c3RyYXRpdmUgaW1hZ2UuIERlZmluaXRpb24tbG9jYWwgZm9yIHRoZSBvcHRpb25hbC1pZCByZWFzb24gYWJvdmUsIGJ1dCBpdFxuLy8gcmV1c2VzIHRoZSBzaGFyZWQgc2l6aW5nICsgY3JvcCB2b2NhYnVsYXJ5IHZlcmJhdGltLCBzbyByZWZyYW1pbmcgYSB0ZXh0Ym9va1xuLy8gZmlndXJlIGRvd24gdG8gdGhlIHJlbGV2YW50IGNvcm5lciB3b3JrcyBleGFjdGx5IGFzIGl0IGRvZXMgaW4gdGhlIGJvZHkuXG4vLyBgY2FwdGlvbmAgaXMgZGVsaWJlcmF0ZWx5IGFic2VudCAoWUFHTkkgXHUyMDE0IGFsdCBjb3ZlcnMgYWNjZXNzaWJpbGl0eSwgYW5kIGFcbi8vIGNhcHRpb25lZCBmaWd1cmUgaW4gYSBwb3BvdmVyIGlzIHRoZSByZWZlcmVuY2UgcGFuZWwncyBqb2IpOyBhZGRpdGl2ZSBsYXRlci5cbmNvbnN0IERlZmluaXRpb25JbWFnZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogRGVmaW5pdGlvbkJsb2NrSWQsXG4gIHR5cGU6IHoubGl0ZXJhbCgnaW1hZ2UnKSxcbiAgc3JjOiB6LnN0cmluZygpLFxuICBhbHQ6IHouc3RyaW5nKCkuZGVmYXVsdCgnJyksXG4gIC4uLnNpemluZ0ZpZWxkcyxcbiAgY3JvcDogQ3JvcFJlY3Qub3B0aW9uYWwoKSxcbiAgc3JjQXNwZWN0OiB6Lm51bWJlcigpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbn0pO1xuXG4vLyBOZXN0ZWQgbGlzdHMsIG1pcnJvcmluZyBibG9ja3MvbGlzdC50cydzIHNoYXBlIHNvIFRhYi10by1pbmRlbnQgaW4gdGhlXG4vLyBkZWZpbml0aW9uIGRpYWxvZyByb3VuZC10cmlwcy4gU2FtZSByZWN1cnNpb24gbWVjaGFuaWM6IG9ubHkgdGhlIGN5Y2xpYyBlZGdlXG4vLyAoaXRlbSAtPiBsaXN0IC0+IGl0ZW0pIGlzIHoubGF6eSgpLCBsZWF2aW5nIHRoZSBsaXN0IGJsb2NrcyBhcyBwbGFpblxuLy8gei5vYmplY3RzIHNvIHRoZXkgc3RheSB1c2FibGUgYXMgZGlzY3JpbWluYXRlZFVuaW9uIG1lbWJlcnMgYmVsb3cuXG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25MaXN0SXRlbSB7XG4gIGlkPzogc3RyaW5nO1xuICBjb250ZW50OiBEZWZpbml0aW9uQ29udGVudElubGluZVtdO1xuICBjaGlsZHJlbj86IEFycmF5PERlZmluaXRpb25CdWxsZXRMaXN0QmxvY2sgfCBEZWZpbml0aW9uT3JkZXJlZExpc3RCbG9jaz47XG59XG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25CdWxsZXRMaXN0QmxvY2sge1xuICBpZD86IHN0cmluZztcbiAgdHlwZTogJ2J1bGxldF9saXN0JztcbiAgaXRlbXM6IERlZmluaXRpb25MaXN0SXRlbVtdO1xufVxuZXhwb3J0IGludGVyZmFjZSBEZWZpbml0aW9uT3JkZXJlZExpc3RCbG9jayB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAnb3JkZXJlZF9saXN0JztcbiAgaXRlbXM6IERlZmluaXRpb25MaXN0SXRlbVtdO1xufVxuXG5leHBvcnQgY29uc3QgRGVmaW5pdGlvbkxpc3RJdGVtOiB6LlpvZFR5cGU8XG4gIERlZmluaXRpb25MaXN0SXRlbSxcbiAgei5ab2RUeXBlRGVmLFxuICB1bmtub3duXG4+ID0gei5sYXp5KCgpID0+XG4gIHoub2JqZWN0KHtcbiAgICBpZDogRGVmaW5pdGlvbkJsb2NrSWQsXG4gICAgY29udGVudDogei5hcnJheShEZWZpbml0aW9uQ29udGVudElubGluZSkuZGVmYXVsdChbXSksXG4gICAgY2hpbGRyZW46IHpcbiAgICAgIC5hcnJheSh6LnVuaW9uKFtEZWZpbml0aW9uQnVsbGV0TGlzdEJsb2NrLCBEZWZpbml0aW9uT3JkZXJlZExpc3RCbG9ja10pKVxuICAgICAgLm9wdGlvbmFsKCksXG4gIH0pLFxuKTtcblxuZXhwb3J0IGNvbnN0IERlZmluaXRpb25CdWxsZXRMaXN0QmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgdHlwZTogei5saXRlcmFsKCdidWxsZXRfbGlzdCcpLFxuICBpdGVtczogei5hcnJheShEZWZpbml0aW9uTGlzdEl0ZW0pLmRlZmF1bHQoW10pLFxufSk7XG5cbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uT3JkZXJlZExpc3RCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IERlZmluaXRpb25CbG9ja0lkLFxuICB0eXBlOiB6LmxpdGVyYWwoJ29yZGVyZWRfbGlzdCcpLFxuICBpdGVtczogei5hcnJheShEZWZpbml0aW9uTGlzdEl0ZW0pLmRlZmF1bHQoW10pLFxufSk7XG5cbi8vIEdyYXBoRmlndXJlQmxvY2sgaXMgdGhlIE9ORSBtZW1iZXIgcmV1c2VkIHZlcmJhdGltOiBpdCBpcyBhbHJlYWR5IGlubGluZS1mcmVlXG4vLyAoYXhpcyArIGRyYXdhYmxlcyBvbmx5KSwgc28gaXQgaW50cm9kdWNlcyBubyBjeWNsZSwgYW5kIGl0IGhhcyBubyBsZWdhY3lcbi8vIHVwZ3JhZGUgcGF0aCB0aGF0IHdvdWxkIG5lZWQgdG8gbWludCBpdHMgcmVxdWlyZWQgdXVpZC4gSW1wb3J0aW5nIGl0IGlzIHNhZmVcbi8vIG9ubHkgYmVjYXVzZSBpdHMgb3duIGdyYXBoIHByaW1pdGl2ZXMgbm93IGNvbWUgZnJvbSB0aGUgbGVhZlxuLy8gZ3JhcGgtcHJpbWl0aXZlcy50cyByYXRoZXIgdGhhbiB0aHJvdWdoIGJsb2Nrcy9pbnRlcmFjdGl2ZS1ncmFwaC50cyBcdTIwMTQgc2VlIHRoZVxuLy8gaGVhZGVyIGNvbW1lbnQgdGhlcmUuXG5leHBvcnQgdHlwZSBEZWZpbml0aW9uQmxvY2sgPVxuICB8IERlZmluaXRpb25QYXJhZ3JhcGhCbG9ja1xuICB8IERlZmluaXRpb25IZWFkaW5nQmxvY2tcbiAgfCBEZWZpbml0aW9uTWF0aEJsb2NrXG4gIHwgRGVmaW5pdGlvbkltYWdlQmxvY2tcbiAgfCBEZWZpbml0aW9uQnVsbGV0TGlzdEJsb2NrXG4gIHwgRGVmaW5pdGlvbk9yZGVyZWRMaXN0QmxvY2tcbiAgfCBHcmFwaEZpZ3VyZUJsb2NrO1xuXG5leHBvcnQgY29uc3QgRGVmaW5pdGlvbkJsb2NrOiB6LlpvZFR5cGU8XG4gIERlZmluaXRpb25CbG9jayxcbiAgei5ab2RUeXBlRGVmLFxuICB1bmtub3duXG4+ID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIERlZmluaXRpb25QYXJhZ3JhcGhCbG9jayxcbiAgRGVmaW5pdGlvbkhlYWRpbmdCbG9jayxcbiAgRGVmaW5pdGlvbk1hdGhCbG9jayxcbiAgRGVmaW5pdGlvbkltYWdlQmxvY2ssXG4gIERlZmluaXRpb25CdWxsZXRMaXN0QmxvY2ssXG4gIERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrLFxuICBHcmFwaEZpZ3VyZUJsb2NrLFxuXSk7XG5cbi8vIERlZmluaXRpb25NYXJrIFx1MjAxNCBpbmxpbmUgdm9jYWJ1bGFyeSBkZWZpbml0aW9uIChQaGFzZSAyKS4gYGNvbnRlbnRgIGlzIHRoZVxuLy8gcmljaCBkZWZpbml0aW9uIHNob3duIGluIHRoZSBwdWJsaXNoZWQtcGFnZSBwb3BvdmVyLCBub3cgYSBibG9jayBzZXF1ZW5jZVxuLy8gKHNlZSBEZWZpbml0aW9uQmxvY2sgYWJvdmUpLiBgZ2xvc3NhcnlLZXlgIGlzIHJlc2VydmVkIGZvciB0aGUgUGhhc2UgNCB0ZW5hbnRcbi8vIGdsb3NzYXJ5IHN0b3JlIChyZXNvbHZlZCBhdCBwdWJsaXNoKSBhbmQgaXMgdW51c2VkIGluIFBoYXNlIDIuIFRoZSByZW5kZXJlclxuLy8gZW1pdHMgYDxzcGFuIGNsYXNzPVwiZGVmaW5pdGlvblwiIFx1MjAyNj5gIHBsdXMgYSBoaWRkZW4gPHRlbXBsYXRlPiBjYXJyeWluZyB0aGVcbi8vIHJlbmRlcmVkIGNvbnRlbnQ7IHNlZSBSVU5USU1FLm1kLCBkb2NzL2Rlc2lnbi92b2NhYnVsYXJ5LWRlZmluaXRpb25zLm1kLCBhbmRcbi8vIGRvY3MvZGVzaWduL2RlZmluaXRpb24tcmljaC1jb250ZW50Lm1kLlxuLy8gTk9UIGFubm90YXRlZCBhcyB6LlpvZFR5cGUsIHVubGlrZSBEZWZpbml0aW9uQmxvY2sgYWJvdmU6IHRoaXMgc2NoZW1hIGlzIGFcbi8vIG1lbWJlciBvZiB0aGUgYE1hcmtgIGRpc2NyaW1pbmF0ZWRVbmlvbiBiZWxvdywgYW5kIHouZGlzY3JpbWluYXRlZFVuaW9uIG5lZWRzXG4vLyByZWFsIFpvZE9iamVjdHMgdG8gaW50cm9zcGVjdCB0aGUgYHR5cGVgIGRpc2NyaW1pbmF0b3IuIFRoZSBuYW1lZFxuLy8gRGVmaW5pdGlvbkJsb2NrIGFsaWFzIGlzIHdoYXQga2VlcHMgdGhlIGluZmVycmVkIHR5cGUgaGVyZSBzbWFsbCBlbm91Z2ggXHUyMDE0IHRoZVxuLy8gc2FtZSByZWFzb24gbGlzdC50cyBrZWVwcyBpdHMgbGlzdCBibG9ja3MgYXMgcGxhaW4gei5vYmplY3RzIGFuZCBwdXRzIHRoZVxuLy8gei5sYXp5KCkgb25seSBvbiB0aGUgY3ljbGljIGVkZ2UuXG5leHBvcnQgY29uc3QgRGVmaW5pdGlvbk1hcmsgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnZGVmaW5pdGlvbicpLFxuICBjb250ZW50OiB6LmFycmF5KERlZmluaXRpb25CbG9jaykuZGVmYXVsdChbXSksXG4gIGdsb3NzYXJ5S2V5OiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIERlZmluaXRpb25NYXJrID0gei5pbmZlcjx0eXBlb2YgRGVmaW5pdGlvbk1hcms+O1xuXG4vLyBBIGRlZmluaXRpb24ncyBjb250ZW50IGlzIGEgYmxvY2sgYXJyYXkgdG9kYXksIGJ1dCB0d28gb2xkZXIgc2hhcGVzIGFyZSBzdGlsbFxuLy8gb3V0IHRoZXJlIGluIHN0b3JlZCBkb2N1bWVudHMuIEJvdGggdXBncmFkZXMgYmVsb3cgYXJlIHB1cmUsIGRldGVybWluaXN0aWNcbi8vIHJlYWQtdGltZSByZXdyaXRlcyBcdTIwMTQgdGhleSBtaW50IG5vIGlkcyBhbmQgbm8gcmFuZG9tbmVzcywgc28gcGFyc2luZyB0aGUgc2FtZVxuLy8gc3RvcmVkIGRvY3VtZW50IHR3aWNlIHlpZWxkcyBpZGVudGljYWwgb3V0cHV0LlxuLy9cbi8vIFRoZXkgQ09NUE9TRSwgb2xkZXN0IGZpcnN0LCBiZWNhdXNlIGEgZG9jdW1lbnQgY2FuIGNhcnJ5IHRoZSBvbGRlc3Qgc2hhcGU6XG4vLyAgIHYxICB7IGRlZmluaXRpb246ICdhIHN0cmluZycgfSAgICAgICAgICAgICAgICAgICAgKHByZS1yaWNoLWNvbnRlbnQpXG4vLyAgIHYyICB7IGNvbnRlbnQ6IFtpbmxpbmVcdTIwMjZdLCBpbWFnZT86IHtzcmMsIGFsdH0gfSAgICAoUGhhc2UgMiByaWNoIGlubGluZSlcbi8vICAgdjMgIHsgY29udGVudDogW2Jsb2NrXHUyMDI2XSB9ICAgICAgICAgICAgICAgICAgICAgICAgIChjdXJyZW50KVxuLy8gc28gdjEgXHUyMTkyIHYyIFx1MjE5MiB2MyBtdXN0IHJ1biBpbiBzZXF1ZW5jZSBvbiBhIHNpbmdsZSBtYXJrLlxuLy8gRXhwb3J0ZWQgYmVjYXVzZSB0aGUgYXBwJ3Mgc2VyaWFsaXplciBuZWVkcyB0aGUgSURFTlRJQ0FMIG5vcm1hbGl6YXRpb24gd2hlblxuLy8gaXQgcmVhZHMgYSBkZWZpbml0aW9uIG1hcmsncyBUaXB0YXAgYXR0cnMgXHUyMDE0IGFuIGVkaXRvciBzZXNzaW9uIG9wZW5lZCBiZWZvcmVcbi8vIHRoZSBibG9jayBtaWdyYXRpb24gc3RpbGwgY2FycmllcyB0aGUgdjIgYXR0ciBzaGFwZS4gT25lIGltcGxlbWVudGF0aW9uLCBzb1xuLy8gdGhlIHNjaGVtYSBhbmQgdGhlIHNlcmlhbGl6ZXIgY2Fubm90IGRyaWZ0IGFwYXJ0IG9uIHdoYXQgYW4gb2xkIG1hcmsgbWVhbnMuXG5leHBvcnQgZnVuY3Rpb24gdXBncmFkZURlZmluaXRpb25NYXJrKG06IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdW5rbm93biB7XG4gIGxldCBjb250ZW50ID0gbS5jb250ZW50O1xuICBjb25zdCByZXN0ID0geyAuLi5tIH07XG5cbiAgLy8gdjEgXHUyMTkyIHYyOiBhIHBsYWluIGBkZWZpbml0aW9uYCBzdHJpbmcgYmVjb21lcyBhIHNpbmdsZSBpbmxpbmUgdGV4dCBydW4uXG4gIGlmICh0eXBlb2YgcmVzdC5kZWZpbml0aW9uID09PSAnc3RyaW5nJyAmJiBjb250ZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCB0ZXh0ID0gcmVzdC5kZWZpbml0aW9uO1xuICAgIGNvbnRlbnQgPSB0ZXh0ID8gW3sgdHlwZTogJ3RleHQnLCB0ZXh0IH1dIDogW107XG4gIH1cbiAgZGVsZXRlIHJlc3QuZGVmaW5pdGlvbjtcblxuICAvLyB2MiBcdTIxOTIgdjM6IGFuIElOTElORSBjb250ZW50IGFycmF5IGJlY29tZXMgb25lIHBhcmFncmFwaCBibG9jay4gRGV0ZWN0ZWQgYnlcbiAgLy8gc2hhcGUsIG5vdCBieSBhIHZlcnNpb24gZmllbGQgXHUyMDE0IGFuIGlubGluZSBub2RlIGlzIGEgdGV4dCAvIG1hdGhfaW5saW5lIC9cbiAgLy8gaGFyZF9icmVhaywgbm9uZSBvZiB3aGljaCBpcyBhIGJsb2NrIGB0eXBlYCwgc28gdGhlIGZpcnN0IGVsZW1lbnRcbiAgLy8gZGlzY3JpbWluYXRlcyB1bmFtYmlndW91c2x5LiBBbiBlbXB0eSBhcnJheSBpcyBhbHJlYWR5IHZhbGlkIGF0IGJvdGhcbiAgLy8gdmVyc2lvbnMgYW5kIGlzIGxlZnQgYWxvbmUuXG4gIGNvbnN0IElOTElORV9UWVBFUyA9IFsndGV4dCcsICdtYXRoX2lubGluZScsICdoYXJkX2JyZWFrJ107XG4gIGlmIChBcnJheS5pc0FycmF5KGNvbnRlbnQpICYmIGNvbnRlbnQubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGZpcnN0ID0gY29udGVudFswXSBhcyB7IHR5cGU/OiB1bmtub3duIH0gfCB1bmRlZmluZWQ7XG4gICAgaWYgKHR5cGVvZiBmaXJzdD8udHlwZSA9PT0gJ3N0cmluZycgJiYgSU5MSU5FX1RZUEVTLmluY2x1ZGVzKGZpcnN0LnR5cGUpKSB7XG4gICAgICBjb250ZW50ID0gW3sgdHlwZTogJ3BhcmFncmFwaCcsIGNvbnRlbnQgfV07XG4gICAgfVxuICB9XG5cbiAgLy8gdjIgXHUyMTkyIHYzIChENyk6IHRoZSBzZXBhcmF0ZSBgaW1hZ2VgIGF0dHIgYmVjb21lcyBhIHRyYWlsaW5nIGltYWdlIGJsb2NrLCBzb1xuICAvLyB0aGVyZSBpcyBleGFjdGx5IG9uZSB3YXkgdG8gZXhwcmVzcyBhbiBpbWFnZSBpbiBhIGRlZmluaXRpb24uIEFwcGVuZGVkXG4gIC8vIEFGVEVSIHRoZSB0ZXh0LCBtYXRjaGluZyB3aGVyZSB0aGUgb2xkIHBvcG92ZXIgcmVuZGVyZWQgaXQuXG4gIGNvbnN0IGltYWdlID0gcmVzdC5pbWFnZTtcbiAgZGVsZXRlIHJlc3QuaW1hZ2U7XG4gIGlmIChpbWFnZSAhPT0gbnVsbCAmJiB0eXBlb2YgaW1hZ2UgPT09ICdvYmplY3QnKSB7XG4gICAgY29uc3QgeyBzcmMsIGFsdCB9ID0gaW1hZ2UgYXMgeyBzcmM/OiB1bmtub3duOyBhbHQ/OiB1bmtub3duIH07XG4gICAgaWYgKHR5cGVvZiBzcmMgPT09ICdzdHJpbmcnICYmIHNyYykge1xuICAgICAgY29uc3QgYmxvY2tzID0gQXJyYXkuaXNBcnJheShjb250ZW50KSA/IFsuLi5jb250ZW50XSA6IFtdO1xuICAgICAgYmxvY2tzLnB1c2goe1xuICAgICAgICB0eXBlOiAnaW1hZ2UnLFxuICAgICAgICBzcmMsXG4gICAgICAgIGFsdDogdHlwZW9mIGFsdCA9PT0gJ3N0cmluZycgPyBhbHQgOiAnJyxcbiAgICAgIH0pO1xuICAgICAgY29udGVudCA9IGJsb2NrcztcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyAuLi5yZXN0LCBjb250ZW50OiBjb250ZW50ID8/IFtdIH07XG59XG5cbmV4cG9ydCBjb25zdCBNYXJrID0gei5wcmVwcm9jZXNzKFxuICAobSkgPT4ge1xuICAgIC8vIExlZ2FjeTogbWFya3Mgd2VyZSBiYXJlIHN0cmluZ3MgKCdib2xkJykuXG4gICAgaWYgKHR5cGVvZiBtID09PSAnc3RyaW5nJykgcmV0dXJuIHsgdHlwZTogbSB9O1xuICAgIGlmIChcbiAgICAgIG0gIT09IG51bGwgJiZcbiAgICAgIHR5cGVvZiBtID09PSAnb2JqZWN0JyAmJlxuICAgICAgKG0gYXMgeyB0eXBlPzogdW5rbm93biB9KS50eXBlID09PSAnZGVmaW5pdGlvbidcbiAgICApIHtcbiAgICAgIHJldHVybiB1cGdyYWRlRGVmaW5pdGlvbk1hcmsobSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik7XG4gICAgfVxuICAgIHJldHVybiBtO1xuICB9LFxuICB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgICBCb2xkTWFyayxcbiAgICBJdGFsaWNNYXJrLFxuICAgIFVuZGVybGluZU1hcmssXG4gICAgQ29kZU1hcmssXG4gICAgU3Vic2NyaXB0TWFyayxcbiAgICBTdXBlcnNjcmlwdE1hcmssXG4gICAgRGVmaW5pdGlvbk1hcmssXG4gIF0pLFxuKTtcbmV4cG9ydCB0eXBlIE1hcmsgPSB6LmluZmVyPHR5cGVvZiBNYXJrPjtcbi8vIFRoZSBzZXQgb2YgbWFyayBgdHlwZWAgZGlzY3JpbWluYW50cywgZm9yIGNhbGxlcnMgdGhhdCBhbGxvdy1saXN0IGJ5IG5hbWUuXG5leHBvcnQgdHlwZSBNYXJrVHlwZSA9IE1hcmtbJ3R5cGUnXTtcblxuLy8gLS0tLSBUZXh0IG5vZGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4cG9ydCBjb25zdCBUZXh0Tm9kZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCd0ZXh0JyksXG4gIHRleHQ6IHouc3RyaW5nKCksXG4gIC8vIERlZmF1bHQgdG8gZW1wdHkgbWFya3MgYXJyYXkgc28gY2FsbGVycyBkb24ndCBuZWVkIHRvIHNwZWNpZnkgd2hlbiBub25lLlxuICBtYXJrczogei5hcnJheShNYXJrKS5kZWZhdWx0KFtdKSxcbn0pO1xuZXhwb3J0IHR5cGUgVGV4dE5vZGUgPSB6LmluZmVyPHR5cGVvZiBUZXh0Tm9kZT47XG5cbi8vIC0tLS0gSW5saW5lTm9kZSB1bmlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBJbmxpbmVOb2RlIGlzIHRoZSBzdGFuZGFyZCBpbmxpbmUgYWxwaGFiZXQuIFVzZWQgYnkgYWxsIGJsb2NrcyBleGNlcHRcbi8vIGZpbGxfaW5fYmxhbmsuIERlZmluZWQgYmVmb3JlIEJsYW5rVG9rZW4gYmVjYXVzZSB0aGUgYmxhbmsncyByaWNoIGZlZWRiYWNrXG4vLyBmaWVsZHMgKGhpbnQsIG1pc3Rha2VGZWVkYmFjaykgcmV1c2UgdGhpcyB1bmlvbi5cbmV4cG9ydCBjb25zdCBJbmxpbmVOb2RlID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFRleHROb2RlLFxuICBJbmxpbmVNYXRoTm9kZSxcbiAgSGFyZEJyZWFrTm9kZSxcbl0pO1xuZXhwb3J0IHR5cGUgSW5saW5lTm9kZSA9IHouaW5mZXI8dHlwZW9mIElubGluZU5vZGU+O1xuXG4vLyAtLS0tIEJsYW5rIHRva2VuIChmaWxsLWluLXRoZS1ibGFuayBvbmx5KSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQmxhbmtzIGxpdmUgSU5TSURFIHRoZSBpbmxpbmUgY29udGVudCBzdHJlYW0gb2YgYSBmaWxsX2luX2JsYW5rIGJsb2NrIFx1MjAxNFxuLy8gc3R1ZGVudHMgc2VlIGEgcHJvbXB0IHdpdGggb25lIG9yIG1vcmUgaW5saW5lIGJsYW5rcy4gRWFjaCBibGFuayBoYXMgYVxuLy8gc3RhYmxlIGlkIChyZWZlcmVuY2VkIGluIHN1Ym1pc3Npb25zLnJlc3BvbnNlcy5ibGFua3NbPGlkPl0pIGFuZCBhbiBhbnN3ZXJcbi8vIGtleS5cbi8vXG4vLyB3aWR0aCBpcyBpbiBDU1MgY2hhcnMgKGBjaGAgdW5pdHMpIFx1MjAxNCB1c2VkIHRvIHNpemUgdGhlIGlucHV0LiBPcHRpb25hbFxuLy8gYmVjYXVzZSB0aGUgcmVuZGVyZXIgaGFzIGEgc2Vuc2libGUgZGVmYXVsdCAofjYgY2hhcnMpLlxuLy9cbi8vIGhpbnQgYW5kIG1pc3Rha2VGZWVkYmFjayBhcmUgdGhlIHBlci1ibGFuayBmZWVkYmFjayBsYXllcnMgKGJsb2NrLWxldmVsXG4vLyBmaWVsZHMgXHUyMDE0IHNvbHV0aW9uLCBoYXNDb25maWRlbmNlUmF0aW5nLCBza2lsbHMgXHUyMDE0IGxpdmUgb24gRmlsbEluQmxhbmtCbG9jaykuXG4vLyBCb3RoIGNhcnJ5IHJpY2ggaW5saW5lIGNvbnRlbnQgKElubGluZU5vZGVbXTogZm9ybWF0dGVkIHRleHQgKyBpbmxpbmUgbWF0aClcbi8vIHNvIGZlZWRiYWNrIGNhbiBpbmNsdWRlIHRoZSBzYW1lIGZvcm1hdHRpbmcgYW5kIG1hdGggYXMgcHJvYmxlbSBwcm9zZS5cbi8vIFRoZSBydW50aW1lIHJlYWRzIGJvdGggYXQgaW5pdCBidXQgZG9lcyBOT1QgaW5qZWN0IGFueXRoaW5nIGludG8gdGhlIERPTVxuLy8gdW50aWwgdGhlIHN0dWRlbnQgY2xpY2tzIFwiQ2hlY2sgdGhpcyBzZWN0aW9uLlwiIE9uIGEgd3JvbmcgYW5zd2VyLCB0aGVcbi8vIHJ1bnRpbWUgZmlyc3QgbG9va3MgZm9yIGEgbWF0Y2hpbmcgbWlzdGFrZUZlZWRiYWNrIGVudHJ5IChleGFjdCBzdHJpbmdcbi8vIG1hdGNoIGZvciBQaGFzZSAxKTsgaWYgbm9uZSBtYXRjaGVzLCBpdCBmYWxscyBiYWNrIHRvIGhpbnQ7IGlmIGhpbnQgaXNcbi8vIGFsc28gYWJzZW50LCBpdCBzaG93cyB0aGUgZ2VuZXJpYyBcdTI3MTcuXG5leHBvcnQgY29uc3QgQmxhbmtUb2tlbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdibGFuaycpLFxuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIGFuc3dlcjogei5zdHJpbmcoKS5taW4oMSksXG4gIC8vIEFsdGVybmF0aXZlIGNvcnJlY3QgYW5zd2Vycy4gRW1wdHkgYXJyYXkgaXMgdGhlIGNvbW1vbiBjYXNlLlxuICBhY2NlcHRhYmxlQW5zd2Vyczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgd2lkdGg6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAvLyBPcHRpb25hbCB0ZWFjaGVyLWF1dGhvcmVkIG51ZGdlIHNob3duIHdoZW4gdGhpcyBibGFuayBpcyB3cm9uZyBhbmQgbm9cbiAgLy8gbWlzdGFrZUZlZWRiYWNrIGVudHJ5IG1hdGNoZXMuIFJpY2ggaW5saW5lIGNvbnRlbnQgKGZvcm1hdHRlZCB0ZXh0ICsgbWF0aCkuXG4gIGhpbnQ6IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgLy8gT3B0aW9uYWwgbGlzdCBvZiBhbnRpY2lwYXRlZCB3cm9uZyBhbnN3ZXJzIHBhaXJlZCB3aXRoIHNwZWNpZmljIGZlZWRiYWNrLlxuICAvLyBJZiB0aGUgc3R1ZGVudCdzIHdyb25nIGFuc3dlciBtYXRjaGVzIGEgYG1hdGNoYCBzdHJpbmcgKFBoYXNlIDE6IGV4YWN0XG4gIC8vIG1hdGNoOyB0aGUgc3RyYXRlZ3ktZGlzcGF0Y2ggaG9vayBpbiB0aGUgcnVudGltZSBzdXBwb3J0cyBzbWFydGVyXG4gIC8vIG1hdGNoaW5nIGxhdGVyKSwgdGhlIGNvcnJlc3BvbmRpbmcgZmVlZGJhY2sgaXMgc2hvd24gaW5zdGVhZCBvZiB0aGVcbiAgLy8gZ2VuZXJpYyBoaW50LiBGaXJzdCBtYXRjaCB3aW5zLiBgZmVlZGJhY2tgIGlzIHJpY2ggaW5saW5lIGNvbnRlbnQuXG4gIG1pc3Rha2VGZWVkYmFjazogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgbWF0Y2g6IHouc3RyaW5nKCksXG4gICAgZmVlZGJhY2s6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIH0pKS5vcHRpb25hbCgpLFxuICAvLyBPcmRlci1pbmRlcGVuZGVudCBhbnN3ZXIgZ3JvdXBpbmcuIFdoZW4gdHJ1ZSwgdGhpcyBibGFuaydzIGFuc3dlciBpc1xuICAvLyBpbnRlcmNoYW5nZWFibGUgd2l0aCB0aGUgYmxhbmsgaW1tZWRpYXRlbHkgYmVmb3JlIGl0IChpbiBkb2N1bWVudCBvcmRlcixcbiAgLy8gd2l0aGluIHRoZSBzYW1lIGJsb2NrKSBcdTIwMTQgZS5nLiBmYWN0b3JpbmcgYCh4ICsgXHUyNjEwKSh4ICsgXHUyNjEwKWAgd2hlcmUgKDIsMykgYW5kXG4gIC8vICgzLDIpIGFyZSBib3RoIGNvcnJlY3QgYnV0ICgyLDIpIGlzIG5vdC4gQSBcImdyb3VwXCIgaXMgYSBtYXhpbWFsIHJ1biBvZlxuICAvLyBhZGphY2VudCBibGFua3MgZWFjaCBmbGFnZ2VkIGhlcmU7IHRoZSByZW5kZXJlciBjb21waWxlcyBydW5zIGludG8gYVxuICAvLyBzaGFyZWQgYGRhdGEtYmxhbmstZ3JvdXBgIGlkLCBhbmQgdGhlIHJ1bnRpbWUgc2NvcmVzIHRoZSBncm91cCB3aXRoXG4gIC8vIGNvbnN1bWUtb25jZSBtYXRjaGluZyAoZWFjaCBjb3JyZWN0IGFuc3dlciBjYW4gc2F0aXNmeSBvbmx5IG9uZSBibGFuaykuXG4gIC8vXG4gIC8vIFRoaXMgYm9vbGVhbiBpcyBhdXRob3JpbmcgKnN1Z2FyKjogdGhlIGdlbmVyYWwgbW9kZWwgbGl2ZXMgaW4gdGhlIHJ1bnRpbWVcbiAgLy8gZGF0YS1hdHRyaWJ1dGUgY29udHJhY3QgKGdyb3VwIGlkcyksIHNvIHJpY2hlciBncm91cGluZyAobm9uLWFkamFjZW50LFxuICAvLyBjcm9zcy1ibG9jaykgY2FuIGJlIGFkZGVkIGxhdGVyIGFzIGFuIGFkZGl0aXZlIGBncm91cGAgZmllbGQgd2l0aG91dCBhXG4gIC8vIGJyZWFraW5nIGNoYW5nZS4gVGhlIGZpcnN0IGJsYW5rIGluIGEgYmxvY2sgaWdub3JlcyB0aGlzIGZsYWcgKG5vXG4gIC8vIHByZXZpb3VzIGJsYW5rIHRvIGdyb3VwIHdpdGgpLlxuICBpbnRlcmNoYW5nZWFibGVXaXRoUHJldmlvdXM6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAvLyBBbnN3ZXIgaW50ZXJwcmV0YXRpb24gbW9kZS4gQWJzZW50ICg9ICd0ZXh0Jykga2VlcHMgdGhlIFBoYXNlIDEgYmVoYXZpb3I6XG4gIC8vIGV4YWN0IHN0cmluZyBtYXRjaCBhZ2FpbnN0IGFuc3dlciArIGFjY2VwdGFibGVBbnN3ZXJzLiAnbnVtZXJpYycgdGVsbHMgdGhlXG4gIC8vIHJ1bnRpbWUgdG8gcGFyc2UgQk9USCB0aGUgdHlwZWQgdmFsdWUgYW5kIGVhY2gga2V5IGVudHJ5IG51bWVyaWNhbGx5XG4gIC8vIChkZWNpbWFscywgZnJhY3Rpb25zIGxpa2UgMy8yLCBtaXhlZCBudW1iZXJzIGxpa2UgXCIxIDEvMlwiLCBjb21tYVxuICAvLyBzZXBhcmF0b3JzLCBhIGxlYWRpbmcgJCkgYW5kIGNvbXBhcmUgd2l0aGluIGB0b2xlcmFuY2VgIFx1MjAxNCBzbyAwLjUsIDEvMixcbiAgLy8gYW5kIC41MCBhbGwgc2F0aXNmeSBhbiBhbnN3ZXIgb2YgXCIxLzJcIi4gT3B0aW9uYWwgcmF0aGVyIHRoYW4gZGVmYXVsdGVkIHNvXG4gIC8vIGRvY3VtZW50cyBzdG9yZWQgYmVmb3JlIHRoaXMgZmllbGQgZXhpc3RlZCByZS1zZXJpYWxpemUgYnl0ZS1pZGVudGljYWxseS5cbiAgLy8gJ21hdGgnIChNb2RlbCBCIG1hdGggYmxhbmtzKSBncmFkZXMgdGhlIHR5cGVkIHZhbHVlIGFzIGEgbWF0aCBFWFBSRVNTSU9OOlxuICAvLyB0aGUgcnVudGltZSBsYXp5LWxvYWRzIHRoZSBncmFwaC1raXQgYW5kIGNvbXBhcmVzIGJ5IG51bWVyaWMtc2FtcGxpbmdcbiAgLy8gZXF1aXZhbGVuY2UgKDJhIFx1MjI2MSBhK2EgXHUyMjYxIGEqMiksIE5PVCBzdHJpbmcgbWF0Y2guIFNlZSBkb2NzL2Rlc2lnbi9tYXRoLWJsYW5rcy5tZC5cbiAgYW5zd2VyVHlwZTogei5lbnVtKFsndGV4dCcsICdudW1lcmljJywgJ21hdGgnXSkub3B0aW9uYWwoKSxcbiAgLy8gQWJzb2x1dGUgY29tcGFyaXNvbiB0b2xlcmFuY2UuIEZvciAnbnVtZXJpYyc6IHx0eXBlZCAtIGtleXwgPD0gdG9sZXJhbmNlLlxuICAvLyBGb3IgJ21hdGgnOiB0aGUgYWJzb2x1dGUgdG9sZXJhbmNlIHBhc3NlZCB0byB0aGUgc2FtcGxpbmcgY29tcGFyaXNvbi5cbiAgLy8gQWJzZW50ID0gZXhhY3QgZXF1YWxpdHkgKG51bWVyaWMpIC8gbm8gZXh0cmEgc2xhY2sgKG1hdGgpLlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubWluKDApLm9wdGlvbmFsKCksXG4gIC8vIEVxdWl2YWxlbmNlIG1vZGUgZm9yICdtYXRoJyBibGFua3M6ICd2YWx1ZScgKGRlZmF1bHQsIGFueSBleHByZXNzaW9uIHRoYXRcbiAgLy8gZXZhbHVhdGVzIGVxdWFsKSBvciAnZXhhY3QtZm9ybScgKG5vcm1hbGl6ZWQtc3RyaW5nIG1hdGNoIFx1MjAxNCBcIndyaXRlIGl0IGluXG4gIC8vIHRoaXMgZm9ybVwiKS4gT25seSBtZWFuaW5nZnVsIHdoZW4gYW5zd2VyVHlwZSBpcyAnbWF0aCc7IGFic2VudCA9ICd2YWx1ZScuXG4gIGVxdWl2YWxlbmNlOiB6LmVudW0oWyd2YWx1ZScsICdleGFjdC1mb3JtJ10pLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIEJsYW5rVG9rZW4gPSB6LmluZmVyPHR5cGVvZiBCbGFua1Rva2VuPjtcblxuLy8gLS0tLSBGaWxsSW5CbGFua0lubGluZSB1bmlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZpbGxJbkJsYW5rSW5saW5lIGlzIHRoZSBleHRlbmRlZCBhbHBoYWJldCBmb3IgZmlsbF9pbl9ibGFuayBibG9ja3Mgb25seS5cbi8vIEluY2x1ZGVzIEJsYW5rVG9rZW4gaW4gYWRkaXRpb24gdG8gdGhlIHN0YW5kYXJkIGlubGluZSBub2Rlcy5cbmV4cG9ydCBjb25zdCBGaWxsSW5CbGFua0lubGluZSA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBUZXh0Tm9kZSxcbiAgSW5saW5lTWF0aE5vZGUsXG4gIEhhcmRCcmVha05vZGUsXG4gIEJsYW5rVG9rZW4sXG5dKTtcbmV4cG9ydCB0eXBlIEZpbGxJbkJsYW5rSW5saW5lID0gei5pbmZlcjx0eXBlb2YgRmlsbEluQmxhbmtJbmxpbmU+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbmV4cG9ydCBjb25zdCBQYXJhZ3JhcGhCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ3BhcmFncmFwaCcpLFxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxufSk7XG5leHBvcnQgdHlwZSBQYXJhZ3JhcGhCbG9jayA9IHouaW5mZXI8dHlwZW9mIFBhcmFncmFwaEJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG4vLyBUaHJlZSBsZXZlbHMgaXMgYSBkZWxpYmVyYXRlIGNvbnN0cmFpbnQuIFdvcmtzaGVldHMgZG9uJ3QgbmVlZCBkZWVwZXJcbi8vIGhpZXJhcmNoeSBhbmQgY2FwcGluZyBpdCBhdCAzIGtlZXBzIHRoZSB2aXN1YWwgaGllcmFyY2h5IG1lYW5pbmdmdWwuXG5leHBvcnQgY29uc3QgSGVhZGluZ0xldmVsID0gei51bmlvbihbei5saXRlcmFsKDEpLCB6LmxpdGVyYWwoMiksIHoubGl0ZXJhbCgzKV0pO1xuZXhwb3J0IHR5cGUgSGVhZGluZ0xldmVsID0gei5pbmZlcjx0eXBlb2YgSGVhZGluZ0xldmVsPjtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmdCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2hlYWRpbmcnKSxcbiAgbGV2ZWw6IEhlYWRpbmdMZXZlbCxcbiAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbn0pO1xuZXhwb3J0IHR5cGUgSGVhZGluZ0Jsb2NrID0gei5pbmZlcjx0eXBlb2YgSGVhZGluZ0Jsb2NrPjtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gbGFiZWwudHMgXHUyMDE0IFNoYXJlZCBwZXItYmxvY2sgZGlzcGxheS1sYWJlbCBmcmFnbWVudCAobnVtYmVyaW5nL2xhYmVsIGRlY291cGxlKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERlY291cGxlcyBcImlzIHRoaXMgZ3JhZGVhYmxlP1wiIGZyb20gXCJkb2VzIGl0IHdlYXIgYSBwcm9ibGVtIG51bWJlcj9cIi4gQVxuLy8gZ3JhZGVhYmxlIGJsb2NrIGlzIGFsd2F5cyBzY29yZWQgYW5kIGFsd2F5cyByZXZpZXdhYmxlOyB0aGlzIGZpZWxkIGNvbnRyb2xzXG4vLyBvbmx5IHdoYXQgc2hvd3Mgb24gdGhlIHBhZ2U6XG4vL1xuLy8gICBhdXRvICAgXHUyMDE0IHRoZSBkZWZhdWx0OiBhIG51bWJlcmVkIHByb2JsZW0sIGNvbnN1bWluZyBvbmUgc2xvdCBvZiB0aGVcbi8vICAgICAgICAgICAgZG9jdW1lbnQtd2lkZSBzZXF1ZW5jZSAodG9kYXkncyBiZWhhdmlvciBmb3IgZXZlcnkgZ3JhZGVhYmxlIGJsb2NrKS5cbi8vICAgY3VzdG9tIFx1MjAxNCBzaG93IGF1dGhvcmVkIHRleHQgKFwiV2FybS11cFwiLCBcIkNoYWxsZW5nZVwiKSBpbnN0ZWFkIG9mIGEgbnVtYmVyLFxuLy8gICAgICAgICAgICBhbmQgRE9OJ1QgY29uc3VtZSBhIHNlcXVlbmNlIHNsb3QgKG91dC1vZi1zZXF1ZW5jZSBsYWJlbCkuXG4vLyAgIG5vbmUgICBcdTIwMTQgc2hvdyBub3RoaW5nOyBET04nVCBjb25zdW1lIGEgc2xvdC4gVGhlIG5vdGVzIGtleXdvcmQtYmxhbmsgY2FzZTpcbi8vICAgICAgICAgICAgYSBncmFkZWFibGUgZ2FwIHRoYXQga2VlcHMgc3R1ZGVudHMgcmVhZGluZyB3aXRob3V0IGxvb2tpbmcgbGlrZSBhXG4vLyAgICAgICAgICAgIHF1aXogcXVlc3Rpb24uIFN0aWxsIHNjb3JlZCwgc3RpbGwgaW4gdGhlIHRlYWNoZXIncyByZXN1bHRzIHZpZXdcbi8vICAgICAgICAgICAgKGxvY2F0ZWQgYnkgaXRzIHN1cnJvdW5kaW5nIHRleHQsIG5vdCBhIG51bWJlcikuXG4vL1xuLy8gT3B0aW9uYWwgd2l0aCBOTyBkZWZhdWx0LCBleGFjdGx5IGxpa2Ugc2l6aW5nRmllbGRzIGFuZCBtYXRoX2Jsb2NrLnByb21wdHM6XG4vLyBhbiBhYnNlbnQgYGxhYmVsYCBtZWFucyBgYXV0b2AsIHNvIGEgYmxvY2sgYXV0aG9yZWQgYmVmb3JlIHRoaXMgZmVhdHVyZSBcdTIwMTQgb3Jcbi8vIG9uZSBsZWZ0IGF0IHRoZSBkZWZhdWx0IFx1MjAxNCByZS1zZXJpYWxpemVzIEJZVEUtSURFTlRJQ0FMTFkuIFRoZSByZW5kZXJlciBhbmRcbi8vIGVkaXRvciB0cmVhdCBgdW5kZWZpbmVkYCBhbmQgYHttb2RlOidhdXRvJ31gIGlkZW50aWNhbGx5LlxuLy9cbi8vIFRoZSBwZXItYmxvY2sgbWFudWFsIGludGVnZXIgYG51bWJlcmAgb3ZlcnJpZGUgaXMgb3J0aG9nb25hbCBhbmQgc3RpbGwgbGl2ZXNcbi8vIG9uIHRoZSBpbmRpdmlkdWFsIGJsb2NrczogaXQgcmVsYWJlbHMgdGhlIHNob3duIGludGVnZXIgd2hpbGUgU1RBWUlORyBpblxuLy8gc2VxdWVuY2UsIGFuZCBpdCBhcHBsaWVzIG9ubHkgd2hlbiB0aGUgbGFiZWwgbW9kZSBpcyBhdXRvIChjdXN0b20vbm9uZSB3aW4pLlxuLy8gU2VlIGRvY3MvZGVzaWduICsgYmxvY2stcHJlZGljYXRlcy50cy5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG5leHBvcnQgY29uc3QgQmxvY2tMYWJlbCA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCdtb2RlJywgW1xuICB6Lm9iamVjdCh7IG1vZGU6IHoubGl0ZXJhbCgnYXV0bycpIH0pLFxuICAvLyBtaW4oMSk6IGFuIGVtcHR5IGN1c3RvbSBsYWJlbCBpcyBtZWFuaW5nbGVzcyBcdTIwMTQgYXV0aG9yIGVpdGhlciB3YW50cyB0ZXh0IG9yXG4gIC8vIHdhbnRzIGBub25lYC4gS2VlcHMgcm91bmQtdHJpcCBob25lc3QgKG5vIGVtcHR5LXN0cmluZyBnaG9zdHMpLlxuICB6Lm9iamVjdCh7IG1vZGU6IHoubGl0ZXJhbCgnY3VzdG9tJyksIHRleHQ6IHouc3RyaW5nKCkubWluKDEpIH0pLFxuICB6Lm9iamVjdCh7IG1vZGU6IHoubGl0ZXJhbCgnbm9uZScpIH0pLFxuXSk7XG5leHBvcnQgdHlwZSBCbG9ja0xhYmVsID0gei5pbmZlcjx0eXBlb2YgQmxvY2tMYWJlbD47XG5cbi8vIFNwcmVhZCBpbnRvIGEgZ3JhZGVhYmxlIGJsb2NrJ3Mgei5vYmplY3Qoey4uLn0pIHNoYXBlLiBQbGFpbiBvYmplY3QgKG5vdCBhIFpvZFxuLy8gc2NoZW1hKSBzbyBlYWNoIGJsb2NrIGtlZXBzIGEgZmxhdCBmaWVsZCBsaXN0IGFuZCBkaXNjcmltaW5hdGVkVW5pb24ga2VlcHNcbi8vIHdvcmtpbmcsIG1pcnJvcmluZyBzaXppbmdGaWVsZHMuXG5leHBvcnQgY29uc3QgbGFiZWxGaWVsZHMgPSB7XG4gIGxhYmVsOiBCbG9ja0xhYmVsLm9wdGlvbmFsKCksXG59O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgc2l6aW5nRmllbGRzIH0gZnJvbSAnLi4vc2l6aW5nLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuaW1wb3J0IHsgTWF0aFByb21wdCwgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vIERpc3BsYXkgbWF0aCAoY2VudGVyZWQsIGZ1bGwgd2lkdGggYnkgZGVmYXVsdCkuIElubGluZSBtYXRoIGlzIGluIGlubGluZS50c1xuLy8gYXMgSW5saW5lTWF0aE5vZGUuIFRoZXkncmUgc2VwYXJhdGUgbm9kZSB0eXBlcyBiZWNhdXNlIHRoZXkgcmVuZGVyXG4vLyBkaWZmZXJlbnRseSBhbmQgaGF2ZSBkaWZmZXJlbnQgc2VtYW50aWMgbWVhbmluZy5cbmV4cG9ydCBjb25zdCBNYXRoQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdtYXRoX2Jsb2NrJyksXG4gIGxhdGV4OiB6LnN0cmluZygpLFxuICAvLyBNb2RlbCBBOiBvcHRpb25hbCBpbi1lcXVhdGlvbiBncmFkZWFibGUgZ2FwcyAoXHUwMEE3TWF0aFByb21wdCwgaW5saW5lLnRzKS5cbiAgLy8gT3B0aW9uYWwgd2l0aCBOTyBkZWZhdWx0IHNvIGEgbWF0aCBibG9jayBhdXRob3JlZCBiZWZvcmUgTW9kZWwgQSBcdTIwMTQgb3Igb25lXG4gIC8vIHdpdGggbm8gZ2FwcyBcdTIwMTQgcmUtc2VyaWFsaXplcyBCWVRFLUlERU5USUNBTExZLiBTZWUgZG9jcy9kZXNpZ24vbWF0aC1ibGFua3MubWQuXG4gIHByb21wdHM6IHouYXJyYXkoTWF0aFByb21wdCkub3B0aW9uYWwoKSxcbiAgLy8gV29ya2VkIGV4cGxhbmF0aW9uIHJldmVhbGVkIHBvc3QtY2hlY2ssIG1pcnJvcmluZyBGaWxsSW5CbGFua0Jsb2NrLnNvbHV0aW9uLlxuICAvLyBPcHRpb25hbDsgb25seSBtZWFuaW5nZnVsIG9uIGEgZ2FwLWJlYXJpbmcgZXF1YXRpb24uIE5ldmVyIGxlYWtzIHRoZSBnYXBcbiAgLy8gYW5zd2VyIGRpcmVjdGx5ICh0aGUgc2FuY3Rpb25lZCByZXZlYWwsIHBlciB0aGUgcnVudGltZSdzIG5vLWxlYWsgc3RhbmNlKS5cbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgLy8gVmFyaWFibGUgYmxvY2sgc2l6aW5nOiBvcHRpb25hbCB3aWR0aCBmcmFjdGlvbiArIGFsaWdubWVudCAoc2l6aW5nLnRzKS5cbiAgLi4uc2l6aW5nRmllbGRzLFxuICAvLyBQZXItYmxvY2sgZGlzcGxheSBsYWJlbCBcdTIwMTQgYSBnYXAtYmVhcmluZyBlcXVhdGlvbiBpcyBhIG51bWJlcmVkIHByb2JsZW0gYnlcbiAgLy8gZGVmYXVsdDsgY3VzdG9tL25vbmUgb3B0IG91dCAobnVtYmVyaW5nL2xhYmVsIGRlY291cGxlKS4gSW5lcnQgb24gYVxuICAvLyBwcm9tcHQtZnJlZSBkaXNwbGF5IGVxdWF0aW9uIChpdCdzIG5ldmVyIG51bWJlcmVkIHJlZ2FyZGxlc3MpLiBTZWUgbGFiZWwudHMuXG4gIC4uLmxhYmVsRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBNYXRoQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBNYXRoQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vIEZvdXIgdmFyaWFudHMgaXMgYSBkZWxpYmVyYXRlIGNvbnN0cmFpbnQuIE1vcmUgdGhhbiB0aGlzIGFuZCBzdHlsaW5nXG4vLyBiZWNvbWVzIGluY29uc2lzdGVudCBhY3Jvc3Mgd29ya3NoZWV0cy4gQWRkaW5nIGEgbmV3IHZhcmlhbnQgbGF0ZXIgaXMgYVxuLy8gYnJlYWtpbmcgc2NoZW1hIGNoYW5nZSBcdTIwMTQgY29uc2lkZXIgdGhhdCBiZWZvcmUgZXh0ZW5kaW5nLlxuZXhwb3J0IGNvbnN0IENhbGxvdXRWYXJpYW50ID0gei5lbnVtKFsnaW5mbycsICd3YXJuaW5nJywgJ3N1Y2Nlc3MnLCAnbm90ZSddKTtcbmV4cG9ydCB0eXBlIENhbGxvdXRWYXJpYW50ID0gei5pbmZlcjx0eXBlb2YgQ2FsbG91dFZhcmlhbnQ+O1xuXG5leHBvcnQgY29uc3QgQ2FsbG91dEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnY2FsbG91dCcpLFxuICB2YXJpYW50OiBDYWxsb3V0VmFyaWFudCxcbiAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ2FsbG91dEJsb2NrID0gei5pbmZlcjx0eXBlb2YgQ2FsbG91dEJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG4vLyBBdXRvLW51bWJlcmVkIGF0IHJlbmRlciB0aW1lIGJ5IHdhbGtpbmcgdGhlIGRvY3VtZW50IGFuZCBjb3VudGluZyBwcm9ibGVtXG4vLyBibG9ja3MgaW4gb3JkZXIuIFRoZSBvcHRpb25hbCBgbnVtYmVyYCBmaWVsZCBvdmVycmlkZXMgdGhlIGF1dG8tbnVtYmVyXG4vLyAocmFyZSBjYXNlcyBsaWtlIFwiUHJvYmxlbSA1YVwiIG9yIGhhbmQtbnVtYmVyZWQgbGVnYWN5IHdvcmtzaGVldHMpLlxuLy9cbi8vIHNvbHV0aW9uOiBvcHRpb25hbCB3b3JrZWQgZXhwbGFuYXRpb24gc2hvd24gdG8gYWxsIHN0dWRlbnRzIGFmdGVyIHRoZVxuLy8gc2VjdGlvbiBpcyBjaGVja2VkIChvciBhZnRlciBmaW5hbCBzdWJtaXQgaW4gc2luZ2xlLW1vZGUgYWN0aXZpdGllcyksXG4vLyByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhleSBhbnN3ZXJlZCBjb3JyZWN0bHkuIERpZmZlcmVudCBmcm9tIGhpbnQgXHUyMDE0XG4vLyBoaW50cyBudWRnZSBkdXJpbmcgdGhlIGF0dGVtcHQ7IHNvbHV0aW9ucyBleHBsYWluIGFmdGVyLiBUaGUgcnVudGltZVxuLy8gcmVhZHMgdGhpcyBvbiBpbml0IGJ1dCBkb2VzIE5PVCBpbmplY3QgaXQgaW50byB0aGUgRE9NIHVudGlsIGFmdGVyXG4vLyBjaGVjayAoUGhhc2UgMSBzZWN1cml0eSBjZWlsaW5nIFx1MjAxNCBkb24ndCBtYWtlIHRoZSBsZWFrIHdvcnNlKS5cbi8vXG4vLyBza2lsbHM6IG9wdGlvbmFsIGFycmF5IG9mIHVuaXZlcnNhbCBza2lsbCB0YWdzIHRoaXMgcHJvYmxlbSB0YXJnZXRzLlxuLy8gQWN0aXZpdHktbGV2ZWwgc2tpbGxzIGxpdmUgb24gQWN0aXZpdHlNZXRhOyB0aGlzIGZpZWxkIGNhcHR1cmVzXG4vLyBwcm9ibGVtLWxldmVsIGdyYW51bGFyaXR5IGZvciBmdXR1cmUgcGVyLXNraWxsIGFuYWx5dGljcy4gRWRpdG9yIFVJIGlzXG4vLyBQaGFzZSAyOyB0aGUgZmllbGQgZXhpc3RzIGluIFBoYXNlIDEgc28gYW5hbHl0aWNzIGNhbiByZWFjaCBiYWNrLlxuZXhwb3J0IGNvbnN0IFByb2JsZW1CbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHoubGl0ZXJhbCgncHJvYmxlbScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbn0pO1xuZXhwb3J0IHR5cGUgUHJvYmxlbUJsb2NrID0gei5pbmZlcjx0eXBlb2YgUHJvYmxlbUJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IEZpbGxJbkJsYW5rSW5saW5lLCBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuXG4vLyBUaGUgYXJjaGl0ZWN0dXJhbGx5IGludGVyZXN0aW5nIGJsb2NrLiBjb250ZW50IGlzIGFuIGFycmF5IG9mIGlubGluZSBub2Rlc1xuLy8gdGhhdCBtYXkgaW5jbHVkZSBCbGFua1Rva2VuIFx1MjAxNCBzdHVkZW50cyBzZWUgcHJvc2Ugd2l0aCBlZGl0YWJsZSBibGFua3MuXG4vLyBFYWNoIGJsYW5rJ3MgaWQgaXMgYSBzdGFibGUgcmVmZXJlbmNlIHVzZWQgaW4gc3VibWlzc2lvbnMucmVzcG9uc2VzLCBzb1xuLy8gcmVvcmRlcmluZyBibG9ja3MgZG9lc24ndCBicmVhayBncmFkaW5nIG9uIHBhc3Qgc3VibWlzc2lvbnMuXG4vL1xuLy8gYXV0by1udW1iZXJlZCBsaWtlIFByb2JsZW1CbG9jayBmb3IgdGhlIHByb2JsZW0gaGVhZGVyIChlLmcuLCBcIlByb2JsZW0gM1wiKS5cbi8vIFdoeSBub3QganVzdCB1c2UgUHJvYmxlbUJsb2NrPyBUaGV5IGhhdmUgZGlmZmVyZW50IHJlbmRlcmluZyBhbmQgZGlmZmVyZW50XG4vLyBzdHVkZW50IGludGVyYWN0aW9uOyBjb25mbGF0aW5nIHRoZW0gd291bGQgZm9yY2UgZXZlcnkgcHJvYmxlbSB0byBlaXRoZXJcbi8vIGhhdmUgb3Igbm90IGhhdmUgYmxhbmtzLCBpbnN0ZWFkIG9mIGJlaW5nIGEgcGVyLXByb2JsZW0gZGVjaXNpb24uXG4vL1xuLy8gUGVyLWJsYW5rIGZpZWxkcyAoaGludCwgbWlzdGFrZUZlZWRiYWNrKSBsaXZlIG9uIEJsYW5rVG9rZW4gaW4gaW5saW5lLnRzLlxuLy8gUGVyLWJsb2NrIGZpZWxkcyBiZWxvdzpcbi8vICAgLSBzb2x1dGlvbjogb25lIHdvcmtlZCBleHBsYW5hdGlvbiBmb3IgdGhlIHdob2xlIHByb2JsZW0gKGEgXCJzaW1wbGlmeVxuLy8gICAgIF9feFx1MDBCMiArIF9feCAtIDEyXCIgcHJvbXB0IGhhcyBvbmUgc29sdXRpb24gY292ZXJpbmcgYWxsIGJsYW5rcywgbm90IG9uZVxuLy8gICAgIHBlciBibGFuaykuIFNob3duIHBvc3QtY2hlY2sgcmVnYXJkbGVzcyBvZiBjb3JyZWN0bmVzcy5cbi8vICAgLSBoYXNDb25maWRlbmNlUmF0aW5nOiB3aGVuIHRydWUsIHN0dWRlbnRzIHNlZSBhIDMtcG9pbnQgY29uZmlkZW5jZVxuLy8gICAgIHNlbGVjdG9yICh1bnN1cmUgLyB0aGlua19zbyAvIGNlcnRhaW4pIGZvciB0aGlzIHByb2JsZW0gYmVmb3JlXG4vLyAgICAgY2hlY2tpbmcuIEFza2VkIG9uY2UgcGVyIHByb2JsZW0sIG5vdCBwZXIgYmxhbmsuIFRoZSBydW50aW1lIHN0b3Jlc1xuLy8gICAgIHRoZSByYXRpbmcgcGVyLWJsYW5rIGluIFN1Ym1pc3Npb25SZXNwb25zZXMgKGFwcGxpZWQgdW5pZm9ybWx5IHRvXG4vLyAgICAgZXZlcnkgYmxhbmsgaW4gdGhpcyBwcm9ibGVtKS5cbi8vICAgLSBza2lsbHM6IHVuaXZlcnNhbCBza2lsbCB0YWdzIChzZWUgQWN0aXZpdHlNZXRhLnNraWxscykuIEVkaXRvciBVSSBmb3Jcbi8vICAgICB0aGlzIGZpZWxkIGlzIFBoYXNlIDI7IGZpZWxkIGV4aXN0cyBpbiBQaGFzZSAxIHNvIHBlci1za2lsbCBhbmFseXRpY3Ncbi8vICAgICBjYW4gcmVhY2ggYmFjayB0byBQaGFzZSAxIHByb2JsZW1zIHdoZW4gdGhlIGVkaXRvciBsYW5kcy5cbi8vICAgLSB3b3JrU3BhY2U6IHBlci1wcm9ibGVtIG92ZXJyaWRlIChpbiByZW0pIGZvciB0aGUgYmxhbmsgd29ya2luZyBzcGFjZVxuLy8gICAgIHByaW50ZWQgYmVsb3cgdGhpcyBwcm9ibGVtLiBPcHRpb25hbCB3aXRoIE5PIGRlZmF1bHQgb24gcHVycG9zZTogYW5cbi8vICAgICBhYnNlbnQgdmFsdWUgbWVhbnMgXCJpbmhlcml0IHRoZSBhY3Rpdml0eS1sZXZlbCBwcmludC53b3JrU3BhY2VcIiwgd2hpY2hcbi8vICAgICBpcyBleGFjdGx5IHRoZSBDU1MtY3VzdG9tLXByb3BlcnR5IGluaGVyaXRhbmNlIHRoZSByZW5kZXJlciByZWxpZXMgb25cbi8vICAgICAodGhlIGJsb2NrIHNldHMgaXRzIG93biAtLXByaW50LXdvcmstc3BhY2Ugb25seSB3aGVuIHRoaXMgaXMgcHJlc2VudCkuXG4vLyAgICAgQSBkZWZhdWx0IGhlcmUgd291bGQgcGluIGV2ZXJ5IGJsb2NrIHRvIGEgY29uY3JldGUgdmFsdWUgYW5kIGRlZmVhdFxuLy8gICAgIHRoYXQgaW5oZXJpdGFuY2UuIFByaW50LW9ubHk7IGlnbm9yZWQgb24gc2NyZWVuLlxuZXhwb3J0IGNvbnN0IEZpbGxJbkJsYW5rQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogei5saXRlcmFsKCdmaWxsX2luX2JsYW5rJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHouYXJyYXkoRmlsbEluQmxhbmtJbmxpbmUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNDb25maWRlbmNlUmF0aW5nOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrU3BhY2U6IHoubnVtYmVyKCkubWluKDApLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFBlci1ibG9jayBkaXNwbGF5IGxhYmVsIChhdXRvL2N1c3RvbS9ub25lKS4gQWJzZW50ID0gYXV0byA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRvZGF5J3MgbnVtYmVyZWQgYmVoYXZpb3IuIFNlZSBsYWJlbC50cy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ubGFiZWxGaWVsZHMsXG59KTtcbmV4cG9ydCB0eXBlIEZpbGxJbkJsYW5rQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBGaWxsSW5CbGFua0Jsb2NrPjtcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gbGlzdC50cyBcdTIwMTQgQnVsbGV0IGFuZCBvcmRlcmVkIGxpc3QgYmxvY2tzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gTGlzdHMgbmVzdC4gQSBMaXN0SXRlbSBob2xkcyBpbmxpbmUgY29udGVudCBwbHVzIGFuIG9wdGlvbmFsIGBjaGlsZHJlbmBcbi8vIGFycmF5IG9mIG5lc3RlZCBsaXN0IGJsb2NrczsgYnVsbGV0IGFuZCBvcmRlcmVkIGxpc3RzIGNhbiBtaXggZnJlZWx5IGF0XG4vLyBhbnkgZGVwdGguIFRoaXMgbWlycm9ycyBUaXB0YXAncyBsaXN0SXRlbSA+IHBhcmFncmFwaCArIChidWxsZXRMaXN0IHxcbi8vIG9yZGVyZWRMaXN0KSBzaGFwZSBlbmQtdG8tZW5kLCBzbyBUYWItdG8taW5kZW50IGluIHRoZSBlZGl0b3IgcHJlc2VydmVzXG4vLyBoaWVyYXJjaHkgdGhyb3VnaCBhdXRvc2F2ZS5cbi8vXG4vLyBSZWN1cnNpb24gbWVjaGFuaWM6IG9ubHkgdGhlIGN5Y2xpYyBlZGdlIChMaXN0SXRlbS5jaGlsZHJlbiBcdTIxOTIgbGlzdCBibG9jayBcdTIxOTJcbi8vIExpc3RJdGVtKSBuZWVkcyB6LmxhenkoKS4gQnVsbGV0TGlzdEJsb2NrIGFuZCBPcmRlcmVkTGlzdEJsb2NrIGFyZSBwbGFpblxuLy8gei5vYmplY3RzLCB3aGljaCBrZWVwcyB0aGVtIHVzYWJsZSBhcyBtZW1iZXJzIG9mIHouZGlzY3JpbWluYXRlZFVuaW9uIGluXG4vLyBibG9ja3MvaW5kZXgudHMuIERpc2NyaW1pbmF0ZWQgdW5pb25zIG5lZWQgWm9kT2JqZWN0cyB0byBpbnRyb3NwZWN0IHRoZVxuLy8gYHR5cGVgIGRpc2NyaW1pbmF0b3I7IGEgdG9wLWxldmVsIHoubGF6eSgpIHdyYXBwZXIgd291bGQgZGVmZWF0IHRoYXQuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG4vLyAtLS0tIFR5cGVTY3JpcHQgaW50ZXJmYWNlcyAoZm9yd2FyZCBkZWNsYXJhdGlvbnMgZm9yIHRoZSByZWN1cnNpdmUgdHlwZXMpIC0tLVxuXG5leHBvcnQgaW50ZXJmYWNlIExpc3RJdGVtIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIGNvbnRlbnQ6IHouaW5mZXI8dHlwZW9mIElubGluZU5vZGU+W107XG4gICAgY2hpbGRyZW4/OiBBcnJheTxCdWxsZXRMaXN0QmxvY2sgfCBPcmRlcmVkTGlzdEJsb2NrPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCdWxsZXRMaXN0QmxvY2sge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgdHlwZTogJ2J1bGxldF9saXN0JztcbiAgICBpdGVtczogTGlzdEl0ZW1bXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPcmRlcmVkTGlzdEJsb2NrIHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHR5cGU6ICdvcmRlcmVkX2xpc3QnO1xuICAgIGl0ZW1zOiBMaXN0SXRlbVtdO1xufVxuXG4vLyAtLS0tIFpvZCBzY2hlbWFzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vLyBMYXp5IGJlY2F1c2UgTGlzdEl0ZW0uY2hpbGRyZW4gcmVmZXJzIHRvIHRoZSBsaXN0IGJsb2Nrcywgd2hpY2ggcmVmZXIgYmFja1xuLy8gdG8gTGlzdEl0ZW0uIFRoZSBhcnJvdyBib2R5IG9ubHkgcnVucyBhdCBwYXJzZSB0aW1lLCBieSB3aGljaCBwb2ludCBhbGxcbi8vIHRocmVlIGV4cG9ydHMgYXJlIGJvdW5kLlxuZXhwb3J0IGNvbnN0IExpc3RJdGVtOiB6LlpvZFR5cGU8TGlzdEl0ZW0sIHouWm9kVHlwZURlZiwgdW5rbm93bj4gPSB6LmxhenkoKCkgPT5cbnoub2JqZWN0KHtcbiAgICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gICAgICAgICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxuICAgICAgICAgY2hpbGRyZW46IHpcbiAgICAgICAgIC5hcnJheSh6LnVuaW9uKFtCdWxsZXRMaXN0QmxvY2ssIE9yZGVyZWRMaXN0QmxvY2tdKSlcbiAgICAgICAgIC5vcHRpb25hbCgpLFxufSksXG4pO1xuXG5leHBvcnQgY29uc3QgQnVsbGV0TGlzdEJsb2NrID0gei5vYmplY3Qoe1xuICAgIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB6LmxpdGVyYWwoJ2J1bGxldF9saXN0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IHouYXJyYXkoTGlzdEl0ZW0pLFxufSk7XG5cbmV4cG9ydCBjb25zdCBPcmRlcmVkTGlzdEJsb2NrID0gei5vYmplY3Qoe1xuICAgIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogei5saXRlcmFsKCdvcmRlcmVkX2xpc3QnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IHouYXJyYXkoTGlzdEl0ZW0pLFxufSk7XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuaW1wb3J0IHsgc2l6aW5nRmllbGRzIH0gZnJvbSAnLi4vc2l6aW5nLmpzJztcbmltcG9ydCB7XG4gIEF4aXNDb25maWcsXG4gIEN1cnZlRG9tYWluLFxuICBEcmF3YWJsZSxcbiAgRW5kcG9pbnRTdHlsZSxcbiAgRnVuY3Rpb25Nb2RlbCxcbn0gZnJvbSAnLi4vZ3JhcGgtcHJpbWl0aXZlcy5qcyc7XG5cbi8vIFRoZSBjb29yZGluYXRlLXBsYW5lIHByaW1pdGl2ZXMgKEF4aXNDb25maWcsIEVuZHBvaW50U3R5bGUsIEN1cnZlRG9tYWluLCB0aGVcbi8vIEZ1bmN0aW9uTW9kZWwgZmFtaWx5LCBEcmF3YWJsZUNvbG9yLCBEcmF3YWJsZSkgTU9WRUQgdG8gLi4vZ3JhcGgtcHJpbWl0aXZlcy50c1xuLy8gXHUyMDE0IGEgbGVhZiBtb2R1bGUgdGhhdCBpbXBvcnRzIG5vdGhpbmcgYnV0IHpvZC4gVGhleSBhcmUgcmUtZXhwb3J0ZWQgaGVyZSwgd2l0aFxuLy8gaWRlbnRpY2FsIGlkZW50aXRpZXMsIHNvIGV2ZXJ5IGV4aXN0aW5nIGltcG9ydCBwYXRoIGtlZXBzIHdvcmtpbmcuXG4vL1xuLy8gV2h5IHRoZXkgbW92ZWQ6IHRoaXMgZmlsZSBpbXBvcnRzIElubGluZU5vZGUsIHNvIHJlYWNoaW5nIHRoZSBwcmltaXRpdmVzXG4vLyB0aHJvdWdoIGl0IGRyYWdzIGluIGlubGluZS50cy4gaW5saW5lLnRzIG5vdyBuZWVkcyBncmFwaF9maWd1cmUgKGEgZGVmaW5pdGlvblxuLy8gbWF5IGNvbnRhaW4gb25lKSwgd2hpY2ggd291bGQgY2xvc2UgdGhlIGN5Y2xlIGlubGluZSAtPiBncmFwaC1maWd1cmUgLT5cbi8vIGludGVyYWN0aXZlLWdyYXBoIC0+IGlubGluZS4gVGhhdCBjeWNsZSBpcyBmYXRhbCwgbm90IGNvc21ldGljOiB0aGVcbi8vIGB6LmFycmF5KElubGluZU5vZGUpYCBjYWxscyBiZWxvdyBydW4gYXQgbW9kdWxlIHNjb3BlIGFuZCB3b3VsZCBoaXQgYSBURFpcbi8vIFJlZmVyZW5jZUVycm9yIG9uIGEgcGFydGlhbGx5LWluaXRpYWxpemVkIGlubGluZS5qcy4gU2VlIGdyYXBoLXByaW1pdGl2ZXMudHMuXG5leHBvcnQge1xuICBBeGlzQ29uZmlnLFxuICBFbmRwb2ludFN0eWxlLFxuICBDdXJ2ZURvbWFpbixcbiAgTGluZWFyTW9kZWwsXG4gIFF1YWRyYXRpY01vZGVsLFxuICBFeHBvbmVudGlhbE1vZGVsLFxuICBMb2dhcml0aG1pY01vZGVsLFxuICBWZXJ0aWNhbE1vZGVsLFxuICBGdW5jdGlvbk1vZGVsLFxuICBEcmF3YWJsZUNvbG9yLFxuICBEcmF3YWJsZSxcbn0gZnJvbSAnLi4vZ3JhcGgtcHJpbWl0aXZlcy5qcyc7XG5leHBvcnQgdHlwZSB7IERyYXdhYmxlQ29sb3JUIH0gZnJvbSAnLi4vZ3JhcGgtcHJpbWl0aXZlcy5qcyc7XG5cbi8vIFRoZSBpbnRlcmFjdGl2ZSBncmFwaCBibG9jayAoUGhhc2UgMi43LCBTdGFnZSA1KS4gVW5saWtlIGV2ZXJ5IG90aGVyIGJsb2NrLFxuLy8gdGhlIHN0dWRlbnQncyBhbnN3ZXIgaXMgR0VPTUVUUklDIFx1MjAxNCBhIHBvaW50IHRoZXkgcGxvdCBvbiBhIGNvb3JkaW5hdGUgcGxhbmUgXHUyMDE0XG4vLyBub3QgdGV4dC4gVGhyZWUgc3RydWN0dXJhbCBjb25zZXF1ZW5jZXMgKHNlZSBkb2NzL2Rlc2lnbi9pbnRlcmFjdGl2ZS1ncmFwaC1cbi8vIGJsb2NrLm1kKTogdGhlIGFuc3dlciBpcyBhIHN0cnVjdHVyZWQgdmFsdWUgKGl0cyBvd24gc3VibWlzc2lvbiBtYXAsIG5vdCB0aGVcbi8vIGJsYW5rcyBtYXApLCBzY29yaW5nIGlzIHRvbGVyYW5jZS1iYXNlZCBnZW9tZXRyaWMgY29tcGFyaXNvbiAodGhlIGdyYXBoLWtpdFxuLy8gc2NvcmVzIGl0LCBub3QgdGhlIHJ1bnRpbWUncyBzdHJpbmcgc3RyYXRlZ2llcyksIGFuZCB0aGUgd2lkZ2V0IGlzIGxhcmdlXG4vLyAoSlNYR3JhcGggcmlkZXMgdGhlIGxhenktbG9hZGVkIEBhY3Rpdml0eS9ncmFwaC1raXQsIG5ldmVyIHRoZSBiYXNlIHJ1bnRpbWUpLlxuLy9cbi8vIFNsaWNlIDEgKDIuN2EpIHNoaXBzIE9ORSBpbnRlcmFjdGlvbiBcdTIwMTQgcGxvdF9wb2ludC4gVGhlIGludGVyYWN0aW9uIGlzIGFcbi8vIGRpc2NyaW1pbmF0ZWQgdW5pb24gZnJvbSBkYXkgb25lIHNvIHBsb3RfbGluZSAoMi43YikgYW5kIHNoYWRlX3JlZ2lvbiAoMi43Yylcbi8vIGFyZSBlYWNoIGEgbmV3IHZhcmlhbnQgKyBhIG5ldyBzY29yaW5nIHN0cmF0ZWd5IHdpdGggTk8gc2NoZW1hIG1pZ3JhdGlvbiBhbmRcbi8vIG5vIGNoYW5nZSB0byBhbnkgb3RoZXIgYmxvY2sgdHlwZSBcdTIwMTQgZXhhY3RseSBob3cgdGhlIHRvcC1sZXZlbCBCbG9jayB1bmlvblxuLy8gZ3Jvd3MuXG5cbi8vIC0tLS0gSW50ZXJhY3Rpb24gdmFyaWFudHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBFYWNoIHZhcmlhbnQgY2FycmllcyBpdHMgT1dOIGFuc3dlciBrZXkgKyB0b2xlcmFuY2UuIHBsb3RfcG9pbnQgaXMgdGhlIG9ubHlcbi8vIHZhcmlhbnQgaW4gc2xpY2UgMTsgdGhlIHVuaW9uIHNoYXBlIGlzIGhlcmUgc28gdGhlIG5leHQgdmFyaWFudHMgc2xvdCBpbi5cbmV4cG9ydCBjb25zdCBQb2ludEludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3RfcG9pbnQnKSxcbiAgLy8gT25lIG9yIG1vcmUgY29ycmVjdCBwb2ludHM7IHRoZSBzdHVkZW50IG11c3QgcGxvdCBhbGwgb2YgdGhlbS4gQSBzaW5nbGVcbiAgLy8gcG9pbnQgaXMgdGhlIGNvbW1vbiBjYXNlOyBtdWx0aXBsZSBzdXBwb3J0cyBlLmcuIFwicGxvdCB0aGUgdHdvIHJvb3RzLlwiXG4gIGNvcnJlY3RQb2ludHM6IHouYXJyYXkoei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pKS5taW4oMSksXG4gIC8vIFBlci1wb2ludCB0b2xlcmFuY2UgaW4gZ3JhcGggdW5pdHMgKGEgRXVjbGlkZWFuL2VhY2gtYXhpcyByYWRpdXMsIGFwcGxpZWRcbiAgLy8gYnkgdGhlIGtpdCdzIHNjb3JlcikuIDAuMSBkZWZhdWx0IHN1aXRzIGEgc25hcC10by1ncmlkIHNpbmdsZSBwb2ludC5cbiAgdG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxufSk7XG5leHBvcnQgdHlwZSBQb2ludEludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgUG9pbnRJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gcGxvdF9mdW5jdGlvbjogcGxvdCBhIGN1cnZlIG9mIGEgZ2l2ZW4gZmFtaWx5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHN0dWRlbnQgcGxhY2VzIE4gcG9pbnRzIGFuZCB0aGUgd2lkZ2V0IGZpdHMgKyBkcmF3cyBhIGN1cnZlIFRIUk9VR0ggdGhlbVxuLy8gKE4gPSB0aGUgZmFtaWx5J3MgcGFyYW1ldGVyIGNvdW50OiBsaW5lYXIgMiwgcXVhZHJhdGljIDMsIGV4cG9uZW50aWFsIDIsXG4vLyBsb2dhcml0aG1pYyAyKS4gU2NvcmVkIG9uIHRoZSBmaXR0ZWQgY3VydmUncyBQQVJBTUVURVJTIChub3QgdGhlIGV4YWN0IHBvaW50XG4vLyBwb3NpdGlvbnMpLCBzbyBhbnkgcG9pbnRzIG9uIHRoZSBjb3JyZWN0IGN1cnZlIGFyZSBhY2NlcHRlZC4gVGhlIHBhcmFtZXRlcnNcbi8vIGNvbWUgZnJvbSB0aGUgU0FNRSByZWdyZXNzaW9uIGZpdCBlbmdpbmUgdGhlIGNhbGN1bGF0b3IgdXNlcyAoZml0TGluZWFyLCBcdTIwMjYpLlxuLy9cbi8vIGBtb2RlbGAgaXMgYSBkaXNjcmltaW5hdGVkIHVuaW9uIG9uIGBmYW1pbHlgIChGdW5jdGlvbk1vZGVsLCBub3cgaW5cbi8vIC4uL2dyYXBoLXByaW1pdGl2ZXMudHMgYW5kIHJlLWV4cG9ydGVkIGFib3ZlKTogbGluZWFyLCBxdWFkcmF0aWMsIGV4cG9uZW50aWFsLFxuLy8gbG9nYXJpdGhtaWMsIHZlcnRpY2FsLiBHcm93aW5nIGEgZmFtaWx5IGlzIGEgbmV3IG1lbWJlciB0aGVyZSArIGEgbmV3IGZpdFxuLy8gYnJhbmNoIGluIHRoZSBraXQncyBzY29yZXIgXHUyMDE0IGFkZGl0aXZlLCBub3QgYSByZXdyaXRlLlxuXG4vLyBwbG90X2Z1bmN0aW9uIGNhcnJpZXMgYW4gQVJSQVkgb2YgY3VydmVzIChzaGlwcyBhcyBvbmUpLiBPbmUgY3VydmUgaXMgdGhlXG4vLyBjb21tb24gY2FzZTsgbXVsdGlwbGUgaXMgYSBzeXN0ZW0gb2YgZXF1YXRpb25zIChcImdyYXBoIGJvdGggbGluZXNcIiksIHNjb3JlZFxuLy8gYXMgb25lIG9iamVjdCBlYWNoIFx1MjAxNCBzbyBzeXN0ZW1zIGFyZSBhZGRpdGl2ZSwgbm90IGEgcmVzaGFwZSAoRHJvcCAyIGRlY2lzaW9uKS5cbmV4cG9ydCBjb25zdCBGdW5jdGlvbkludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3RfZnVuY3Rpb24nKSxcbiAgbW9kZWxzOiB6LmFycmF5KEZ1bmN0aW9uTW9kZWwpLm1pbigxKSxcbiAgLy8gRHJvcCA2OiBvcHRpb25hbCBwZXItY3VydmUgZG9tYWluIHJlc3RyaWN0aW9ucyAoXCJncmFwaCB5ID0gMnggKyAzIGZvclxuICAvLyB4ID49IDBcIiksIHBhcmFsbGVsIHRvIG1vZGVscyBieSBpbmRleC4gVGhlIGZyZWVmb3JtIHBhcnNlciBmaWxscyB0aGVzZSBmcm9tXG4gIC8vIGEgYGZvciBcdTIwMjZgIGNsYXVzZTsgdGhlIHdpZGdldCdzIGVuZHBvaW50LWRyYWcgVVggaXMgdGhlIHBsYW5uZWQgZm9sbG93LXVwIFx1MjAxNFxuICAvLyB1bnRpbCBpdCBsYW5kcywgdGhlIGRvbWFpbiBpcyBhdXRob3JpbmcgbWV0YWRhdGEgZHJhd24gb24gdGhlIGtleSwgYW5kXG4gIC8vIHNjb3JpbmcgcmVtYWlucyBvbiB0aGUgY3VydmUgcGFyYW1ldGVycy5cbiAgZG9tYWluczogei5hcnJheShDdXJ2ZURvbWFpbi5udWxsYWJsZSgpKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBGdW5jdGlvbkludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgRnVuY3Rpb25JbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gc2hhZGVfcmVnaW9uOiBzaGFkZSBhIHBvbHlnb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzdHVkZW50IGRyYWdzIHRoZSB2ZXJ0aWNlcyBvZiBhIHBvbHlnb24gKG9uZSBoYW5kbGUgcGVyIHZlcnRleCkgdG8gY292ZXIgYVxuLy8gdGFyZ2V0IHJlZ2lvbiwgd2hpY2ggaXMgc2hhZGVkIGFzIHRoZXkgbW92ZS4gU2NvcmVkIGJ5IEFSRUEgT1ZFUkxBUCB3aXRoIHRoZVxuLy8gY29ycmVjdCBwb2x5Z29uIChpbnRlcnNlY3Rpb24tb3Zlci11bmlvbiBcdTIyNjUgbWluT3ZlcmxhcCksIHNvIHRoZSBleGFjdCB2ZXJ0ZXhcbi8vIHBvc2l0aW9ucyBkb24ndCBtYXR0ZXIgXHUyMDE0IG9ubHkgdGhhdCB0aGUgc2hhZGVkIHJlZ2lvbiBtYXRjaGVzLiBBIHBvbHlnb24sIG5vdCBhXG4vLyBjdXJ2ZSwgc28gaXQncyBpdHMgb3duIGludGVyYWN0aW9uIChub3QgYSBwbG90X2Z1bmN0aW9uIGZhbWlseSkuXG4vLyBPbmUgdGFyZ2V0IHBvbHlnb246IHZlcnRpY2VzIGluIG9yZGVyIChtaW4gMykgKyB0aGUgbWluaW11bSBpbnRlcnNlY3Rpb24tb3Zlci1cbi8vIHVuaW9uIHdpdGggdGhlIHN0dWRlbnQncyBwb2x5Z29uIHRvIGNvdW50IGFzIGNvcnJlY3QuXG5leHBvcnQgY29uc3QgUmVnaW9uQW5zd2VyID0gei5vYmplY3Qoe1xuICBjb3JyZWN0VmVydGljZXM6IHouYXJyYXkoei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pKS5taW4oMyksXG4gIC8vIDAuOSBpcyBzdHJpY3QgKG5lYXItZXhhY3Qgb24gYSBzbmFwcGVkIGdyaWQpOyBsb3dlciBpdCBmb3IgaGFuZC1kcmFnZ2VkIC9cbiAgLy8gYXBwcm94aW1hdGUgcmVnaW9ucy5cbiAgbWluT3ZlcmxhcDogei5udW1iZXIoKS5taW4oMCkubWF4KDEpLmRlZmF1bHQoMC45KSxcbn0pO1xuZXhwb3J0IHR5cGUgUmVnaW9uQW5zd2VyID0gei5pbmZlcjx0eXBlb2YgUmVnaW9uQW5zd2VyPjtcblxuLy8gc2hhZGVfcmVnaW9uIGNhcnJpZXMgYW4gQVJSQVkgb2YgdGFyZ2V0IHBvbHlnb25zIChzaGlwcyBhcyBvbmUpLCBlYWNoIHNjb3JlZFxuLy8gYXMgb25lIG9iamVjdCBcdTIwMTQgc28gXCJzaGFkZSBib3RoIHJlZ2lvbnNcIiBpcyBhZGRpdGl2ZSwgbWF0Y2hpbmcgcGxvdF9mdW5jdGlvbi5cbmV4cG9ydCBjb25zdCBSZWdpb25JbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdzaGFkZV9yZWdpb24nKSxcbiAgcmVnaW9uczogei5hcnJheShSZWdpb25BbnN3ZXIpLm1pbigxKSxcbn0pO1xuZXhwb3J0IHR5cGUgUmVnaW9uSW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBSZWdpb25JbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gZ3JhcGhfaW5lcXVhbGl0eTogZ3JhcGggYW4gaW5lcXVhbGl0eSAoRHJvcCA0KSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzdHVkZW50IHBsYWNlcyB0aGUgYm91bmRhcnkgKHNhbWUgaGFuZGxlcyBhcyBwbG90X2Z1bmN0aW9uKSwgdG9nZ2xlcyB0aGVcbi8vIGxpbmUgZG90dGVkIChzdHJpY3QpIG9yIHNvbGlkIChpbmNsdXNpdmUpLCBhbmQgY2xpY2tzIGEgc2lkZSB0byBzaGFkZS4gQWxsXG4vLyB0aHJlZSBhcmUgZ3JhZGVkIFx1MjAxNCBjaG9vc2luZyB0aGVtIElTIHRoZSBza2lsbC4gVGhlIGJvdW5kYXJ5IGlzIGEgRnVuY3Rpb25Nb2RlbCxcbi8vIHNvIHF1YWRyYXRpYyBpbmVxdWFsaXRpZXMgKHkgPiB4XHUwMEIyKSB3b3JrIHRoZSBkYXkgdGhlIGZhbWlseSBkb2VzOyBhIHZlcnRpY2FsXG4vLyBib3VuZGFyeSAoeCA+IDMpIHNoYWRlcyBsZWZ0L3JpZ2h0IGluc3RlYWQgb2YgYWJvdmUvYmVsb3cuXG5leHBvcnQgY29uc3QgU2hhZGVTaWRlVmFsdWUgPSB6LmVudW0oWydhYm92ZScsICdiZWxvdycsICdsZWZ0JywgJ3JpZ2h0J10pO1xuZXhwb3J0IHR5cGUgU2hhZGVTaWRlVmFsdWUgPSB6LmluZmVyPHR5cGVvZiBTaGFkZVNpZGVWYWx1ZT47XG5cbmV4cG9ydCBjb25zdCBJbmVxdWFsaXR5QW5zd2VyID0gei5vYmplY3Qoe1xuICBib3VuZGFyeTogRnVuY3Rpb25Nb2RlbCxcbiAgLy8gdHJ1ZSA9IHN0cmljdCAoPCAvID4sIGRvdHRlZCBib3VuZGFyeSk7IGZhbHNlID0gaW5jbHVzaXZlIChcdTIyNjQgLyBcdTIyNjUsIHNvbGlkKS5cbiAgc3RyaWN0OiB6LmJvb2xlYW4oKSxcbiAgc2hhZGVTaWRlOiBTaGFkZVNpZGVWYWx1ZSxcbn0pO1xuZXhwb3J0IHR5cGUgSW5lcXVhbGl0eUFuc3dlciA9IHouaW5mZXI8dHlwZW9mIEluZXF1YWxpdHlBbnN3ZXI+O1xuXG4vLyBBbiBBUlJBWSBvZiBpbmVxdWFsaXRpZXMgKHNoaXBzIGFzIG9uZSk7IHN5c3RlbXMgKFwic2hhZGUgd2hlcmUgQk9USCBob2xkXCIpXG4vLyBiZWNvbWUgYWRkaXRpdmUgbWVtYmVycywgbWF0Y2hpbmcgcGxvdF9mdW5jdGlvbi9zaGFkZV9yZWdpb24uXG5leHBvcnQgY29uc3QgSW5lcXVhbGl0eUludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2dyYXBoX2luZXF1YWxpdHknKSxcbiAgaW5lcXVhbGl0aWVzOiB6LmFycmF5KEluZXF1YWxpdHlBbnN3ZXIpLm1pbigxKSxcbn0pO1xuZXhwb3J0IHR5cGUgSW5lcXVhbGl0eUludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgSW5lcXVhbGl0eUludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBkaXNwbGF5OiBhIHN0YXRpYyAodW5ncmFkZWQpIGdyYXBoIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgYmxvY2sgZHJhd3MgYSBmaXhlZCBwaWN0dXJlIFx1MjAxNCBwb2ludHMsIGN1cnZlcywgc2VnbWVudHMsIGZpbGxlZCBwb2x5Z29ucyBcdTIwMTRcbi8vIGFuZCBjb2xsZWN0cyBOTyBhbnN3ZXIuIFR3byBqb2JzIGZyb20gb25lIHNoYXBlOiBhIHN0aW11bHVzIGEgZ3JhZGVkIHF1ZXN0aW9uXG4vLyByZWZlcnMgdG8gKFwidXNpbmcgdGhlIGdyYXBoIGJlbG93LCBcdTIwMjZcIiksIGFuZCBhIHN0YW5kYWxvbmUgZXhlbXBsYXIgd2l0aCBub1xuLy8gcXVlc3Rpb24gYXQgYWxsIChhbiBlbXB0eSBwcm9tcHQpLiBCZWNhdXNlIGBkaXNwbGF5YCBpcyBqdXN0IGFub3RoZXIgbWVtYmVyIG9mXG4vLyB0aGUgYHR5cGVgIHVuaW9uLCBhIHN0aW11bHVzLXdpdGgtYW4tYW5zd2VyIGxhdGVyIGlzIGFkZGl0aXZlIFx1MjAxNCBhIG5ldyBhbnN3ZXJcbi8vIGZpZWxkIGJlc2lkZSB0aGUgZHJhd2FibGVzIFx1MjAxNCBub3QgYSBuZXcgYmxvY2sgZmFtaWx5LlxuLy9cbi8vIGBEcmF3YWJsZWAgKHRoZSBwb2ludCAvIGN1cnZlIC8gZXhwcmVzc2lvbiAvIHNlZ21lbnQgLyByYXkgLyBwb2x5Z29uIHVuaW9uLFxuLy8gZGlzY3JpbWluYXRlZCBvbiBga2luZGApIGFuZCBpdHMgYERyYXdhYmxlQ29sb3JgIHBhbGV0dGUga2V5cyBub3cgbGl2ZSBpblxuLy8gLi4vZ3JhcGgtcHJpbWl0aXZlcy50cyBhbmQgYXJlIHJlLWV4cG9ydGVkIGFib3ZlLlxuXG5leHBvcnQgY29uc3QgRGlzcGxheUludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2Rpc3BsYXknKSxcbiAgZHJhd2FibGVzOiB6LmFycmF5KERyYXdhYmxlKS5kZWZhdWx0KFtdKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGlzcGxheUludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgRGlzcGxheUludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBwbG90X3JheSAvIHBsb3Rfc2VnbWVudDogZHJhdyBhIHJheSBvciBzZWdtZW50IGRpcmVjdGx5IC0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRmlyc3QtY2xhc3MgcmVwbGFjZW1lbnRzIGZvciB0aGUgZG9tYWluLWdsaWRlciBhcHByb2FjaCAod2hpY2ggYXNrZWQgc3R1ZGVudHNcbi8vIHRvIGRlZmluZSBhbiBpbmZpbml0ZSBsaW5lLCB0aGVuIG1hcmsgZW5kcG9pbnRzIG9uIGl0IHdpdGggc2VwYXJhdGUgY29udHJvbHMgXHUyMDE0XG4vLyB0aGUgZHJhd24gbGluZSBuZXZlciBldmVuIGNsaXBwZWQpLiBIZXJlIHRoZSBzdHVkZW50IGRyYWdzIFRXTyBoYW5kbGVzIFx1MjAxNCB0aGVcbi8vIGVuZHBvaW50KHMpIFx1MjAxNCBhbmQgdGhlIHdpZGdldCBkcmF3cyBhbiBBQ1RVQUwgcmF5L3NlZ21lbnQgdGhyb3VnaCB0aGVtXG4vLyAoSlNYR3JhcGggc3RyYWlnaHRGaXJzdC9zdHJhaWdodExhc3QpLCB3aXRoIG9wZW4vY2xvc2VkIGVuZHBvaW50IHBpbGxzLlxuLy8gQXJyYXlzLW9mLW9uZSBsaWtlIG1vZGVscy9yZWdpb25zL2luZXF1YWxpdGllcywgc28gc3lzdGVtcyBzdGF5IGFkZGl0aXZlLlxuLy8gKHBsb3RfZnVuY3Rpb24ncyBkb21haW5zW10gcmVtYWlucyBzY29yZWQgZm9yIGFscmVhZHktcHVibGlzaGVkIHBhZ2VzLCBidXRcbi8vIGF1dGhvcmluZyBzdGVlcnMgaGVyZSBub3cuKVxuZXhwb3J0IGNvbnN0IFJheUFuc3dlciA9IHoub2JqZWN0KHtcbiAgLy8gVGhlIHJheSdzIGVuZHBvaW50IChzY29yZWQgb24gcG9zaXRpb24gKyBvcGVuL2Nsb3NlZCBzdHlsZSkuXG4gIGZyb206IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgLy8gQW55IHNlY29uZCBwb2ludCBPTiB0aGUgcmF5IFx1MjAxNCBuYW1lcyB0aGUgZGlyZWN0aW9uOyB0aGUgc3R1ZGVudCdzIHRocm91Z2hcbiAgLy8gaGFuZGxlIG1heSBzaXQgYW55d2hlcmUgYWxvbmcgdGhlIGNvcnJlY3QgcmF5LlxuICB0aHJvdWdoOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIGZyb21TdHlsZTogRW5kcG9pbnRTdHlsZS5kZWZhdWx0KCdjbG9zZWQnKSxcbiAgLy8gRW5kcG9pbnQgcG9zaXRpb24gdG9sZXJhbmNlIGluIGdyYXBoIHVuaXRzIChtYXRjaGVzIHRoZSBkb21haW4tZ2xpZGVyXG4gIC8vIGRlZmF1bHQpLiBEaXJlY3Rpb24gaXMgc2NvcmVkIGJ5IHVuaXQtdmVjdG9yIGFsaWdubWVudCBraXQtc2lkZS5cbiAgdG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjI1KSxcbn0pO1xuZXhwb3J0IHR5cGUgUmF5QW5zd2VyID0gei5pbmZlcjx0eXBlb2YgUmF5QW5zd2VyPjtcblxuZXhwb3J0IGNvbnN0IFJheUludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3RfcmF5JyksXG4gIHJheXM6IHouYXJyYXkoUmF5QW5zd2VyKS5taW4oMSksXG59KTtcbmV4cG9ydCB0eXBlIFJheUludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgUmF5SW50ZXJhY3Rpb24+O1xuXG5leHBvcnQgY29uc3QgU2VnbWVudEFuc3dlciA9IHoub2JqZWN0KHtcbiAgZnJvbTogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICB0bzogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICAvLyBbZnJvbS1lbmRwb2ludCBzdHlsZSwgdG8tZW5kcG9pbnQgc3R5bGVdLiBTY29yZWQgb3JkZXItaW5kZXBlbmRlbnRseSBcdTIwMTRcbiAgLy8gdGhlIHN0dWRlbnQgbWF5IGRyYXcgdGhlIHNlZ21lbnQgaW4gZWl0aGVyIGRpcmVjdGlvbi5cbiAgZW5kcG9pbnRzOiB6LnR1cGxlKFtFbmRwb2ludFN0eWxlLCBFbmRwb2ludFN0eWxlXSkuZGVmYXVsdChbJ2Nsb3NlZCcsICdjbG9zZWQnXSksXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4yNSksXG59KTtcbmV4cG9ydCB0eXBlIFNlZ21lbnRBbnN3ZXIgPSB6LmluZmVyPHR5cGVvZiBTZWdtZW50QW5zd2VyPjtcblxuZXhwb3J0IGNvbnN0IFNlZ21lbnRJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X3NlZ21lbnQnKSxcbiAgc2VnbWVudHM6IHouYXJyYXkoU2VnbWVudEFuc3dlcikubWluKDEpLFxufSk7XG5leHBvcnQgdHlwZSBTZWdtZW50SW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBTZWdtZW50SW50ZXJhY3Rpb24+O1xuXG4vLyBUaGUgaW50ZXJhY3Rpb24gdW5pb24uIHBsb3RfcG9pbnQgKyBwbG90X2Z1bmN0aW9uICsgc2hhZGVfcmVnaW9uIGFyZSBncmFkZWQ7XG4vLyBkaXNwbGF5IGlzIHRoZSB1bmdyYWRlZCBzdGF0aWMgZ3JhcGguIE1vcmUgYXJlIGZ1dHVyZSBtZW1iZXJzLiBLZXB0XG4vLyBkaXNjcmltaW5hdGVkIG9uIGB0eXBlYCBzbyB0aGUgd2lyZSBmb3JtYXQgYWx3YXlzIGNhcnJpZXMgaXQgYW5kIGNvbnN1bWVyc1xuLy8gYnJhbmNoIHVuaWZvcm1seS5cbmV4cG9ydCBjb25zdCBHcmFwaEludGVyYWN0aW9uID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFBvaW50SW50ZXJhY3Rpb24sXG4gIEZ1bmN0aW9uSW50ZXJhY3Rpb24sXG4gIFJlZ2lvbkludGVyYWN0aW9uLFxuICBJbmVxdWFsaXR5SW50ZXJhY3Rpb24sXG4gIFJheUludGVyYWN0aW9uLFxuICBTZWdtZW50SW50ZXJhY3Rpb24sXG4gIERpc3BsYXlJbnRlcmFjdGlvbixcbl0pO1xuZXhwb3J0IHR5cGUgR3JhcGhJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIEdyYXBoSW50ZXJhY3Rpb24+O1xuXG4vLyAtLS0tIFRoZSBibG9jayAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQXV0by1udW1iZXJlZCBsaWtlIFByb2JsZW1CbG9jayAvIEZpbGxJbkJsYW5rQmxvY2suIGhhc0NvbmZpZGVuY2VSYXRpbmcgK1xuLy8gc2tpbGxzIGZvbGxvdyB0aGUgc2FtZSBvcHQtaW4gcGF0dGVybnMgRmlsbEluQmxhbmtCbG9jayBlc3RhYmxpc2hlZDsgc29sdXRpb25cbi8vIGlzIHNob3duIHBvc3QtY2hlY2sgcmVnYXJkbGVzcyBvZiBjb3JyZWN0bmVzcy5cbmV4cG9ydCBjb25zdCBJbnRlcmFjdGl2ZUdyYXBoQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdpbnRlcmFjdGl2ZV9ncmFwaCcpLFxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAuLi5sYWJlbEZpZWxkcyxcbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICBheGlzQ29uZmlnOiBBeGlzQ29uZmlnLFxuICBpbnRlcmFjdGlvbjogR3JhcGhJbnRlcmFjdGlvbixcbiAgLy8gV2hlbiB0cnVlLCBhIG11bHRpLXBhcnQgZ3JhcGggKHNldmVyYWwgcG9pbnRzLCBhIHN5c3RlbSBvZiBjdXJ2ZXMvcmVnaW9ucyxcbiAgLy8gb3IgXHUyMDE0IGZyb20gRHJvcCA0IFx1MjAxNCBhbiBpbmVxdWFsaXR5J3MgbGluZSArIHNpZGUgKyBzdHlsZSkgc2NvcmVzIGZyYWN0aW9uYWxseVxuICAvLyBwZXIgb2JqZWN0IGFuZCB0aGUgZGFzaGJvYXJkIGl0ZW1pemVzIGl0OyB3aGVuIGZhbHNlIChkZWZhdWx0KSBpdCBpcyBhbGwtb3ItXG4gIC8vIG5vdGhpbmcuIFRoZSBmbGFnICsgdGhlIGtpdCdzIHBlci1vYmplY3Qgc2NvcmluZyBlbmdpbmUgbGFuZCBoZXJlIChEcm9wIDIpO1xuICAvLyB0aGUgcnVudGltZSArIHN1Ym1pc3Npb24gY29uc3VtZSB0aGUgZnJhY3Rpb24gYXQgdGhlIERyb3AgNCB3aXJlIGJ1bXAuXG4gIHBhcnRpYWxDcmVkaXQ6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAvLyBXaGVuIHRydWUsIHRoZSBzdHVkZW50IGdldHMgYSBcImNhbm5vdCBiZSBncmFwaGVkIC8gbm8gc29sdXRpb25cIiBjaG9pY2UsIGFuZFxuICAvLyB0aGUgYW5zd2VyIGtleSBtYXkgbWFyayBUSEFUIGFzIHRoZSBjb3JyZWN0IGFuc3dlciAodHJpY2sgcXVlc3Rpb25zKS4gVGhlXG4gIC8vIGZsYWcgbGFuZHMgaGVyZSAoRHJvcCAyKTsgdGhlIHN0dWRlbnQgY29udHJvbCArIG5vLXNvbHV0aW9uIHJlc3BvbnNlIHJpZGUgdGhlXG4gIC8vIERyb3AgNCB3aXJlIGJ1bXAuXG4gIGFsbG93Tm9Tb2x1dGlvbjogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIFRyaWNrIHF1ZXN0aW9uczogd2hlbiB0cnVlIChyZXF1aXJlcyBhbGxvd05vU29sdXRpb24pLCBcIm5vIHNvbHV0aW9uXCIgSVMgdGhlXG4gIC8vIGNvcnJlY3QgYW5zd2VyIGFuZCB0aGUgZHJhd24gYW5zd2VyIGtleSBpcyBhIGRlY295LiBBIHN0dWRlbnQgd2hvIHNlbGVjdHNcbiAgLy8gbm8tc29sdXRpb24gaXMgY29ycmVjdDsgb25lIHdobyBkcmF3cyBhbnl0aGluZyBpcyBub3QuXG4gIG5vU29sdXRpb25Db3JyZWN0OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgLy8gQnVpbHQtaW4gbWlzdGFrZSBjbGFzc2lmaWVycyAoc3dhcHBlZCBjb29yZGluYXRlcywgc3dhcHBlZCBzbG9wZS9pbnRlcmNlcHQsXG4gIC8vIHJpZ2h0LWJvdW5kYXJ5LXdyb25nLXNpZGUsIFx1MjAyNikgc2hvdyBhIHRhcmdldGVkIG51ZGdlIGluc3RlYWQgb2YgdGhlIGdlbmVyaWNcbiAgLy8gXCJOb3QgcXVpdGVcIiBhZnRlciBhIGNoZWNrLiBEZWZhdWx0IE9OOyBhIHRlYWNoZXIgY2FuIHN3aXRjaCB0aGVtIG9mZi4gVGhlXG4gIC8vIGNsYXNzaWZpZXIgY2F0YWxvZ3VlICsgbWVzc2FnZXMgbGl2ZSBraXQtc2lkZSAoZ3JhcGgtc2NvcmUudHMpIFx1MjAxNCB0aGlzIGZsYWdcbiAgLy8gb25seSBnYXRlcyB0aGVtLlxuICBidWlsdGluRmVlZGJhY2s6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gIC8vIEF1dGhvcmVkIGFudGljaXBhdGVkIG1pc3Rha2VzIFx1MjAxNCB0aGUgZ3JhcGggdHdpbiBvZiBCbGFua1Rva2VuLm1pc3Rha2VGZWVkYmFjay5cbiAgLy8gYG1hdGNoYCBpcyBhIGZyZWVmb3JtIGdyYXBoIGFuc3dlciBpbiB0aGUgU0FNRSBzeW50YXggdGhlIGF1dGhvcmluZyBmb3JtdWxhXG4gIC8vIGZpZWxkIGFjY2VwdHMgKFwiKDQsIDMpXCIsIFwieSA9IHggKyAyXCIsIFwieSA8IDJ4ICsgMVwiKTsgdGhlIGtpdCBwYXJzZXMgaXQgd2l0aFxuICAvLyB0aGUgc2FtZSBwYXJzZXIgYW5kIGNvbXBhcmVzIGFnYWluc3QgdGhlIHN0dWRlbnQncyBhbnN3ZXIgd2l0aCB0aGUgc2FtZVxuICAvLyB0b2xlcmFuY2VzIGFzIHNjb3JpbmcuIEZpcnN0IG1hdGNoIHdpbnMsIGFuZCBhbiBhdXRob3JlZCBtYXRjaCBiZWF0cyBhXG4gIC8vIGJ1aWx0LWluIGNsYXNzaWZpZXIuIGBmZWVkYmFja2AgaXMgcmljaCBpbmxpbmUgY29udGVudCwgc2hvd24gKHBvc3QtY2hlY2tcbiAgLy8gb25seSkgaW4gdGhlIGJsb2NrJ3MgZmVlZGJhY2sgbGluZS5cbiAgbWlzdGFrZUZlZWRiYWNrOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICBtYXRjaDogei5zdHJpbmcoKSxcbiAgICBmZWVkYmFjazogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgfSkpLmRlZmF1bHQoW10pLFxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICBoYXNDb25maWRlbmNlUmF0aW5nOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICAvLyBWYXJpYWJsZSBibG9jayBzaXppbmc6IG9wdGlvbmFsIHdpZHRoIGZyYWN0aW9uICsgYWxpZ25tZW50IChzaXppbmcudHMpLlxuICAvLyBBdXRob3Itc2V0IGRpc3BsYXkgZm9vdHByaW50IGZvciB0aGUgZmlndXJlOyByZW5kZXJlciBob25vcnMgaXQgdmlhIHRoZVxuICAvLyBzaGFyZWQgLmJsb2NrLXNpemVkIHBhdGguIEFkZGl0aXZlL29wdGlvbmFsIFx1MjAxNCBubyBzY2hlbWFWZXJzaW9uIGJ1bXAuXG4gIC4uLnNpemluZ0ZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgSW50ZXJhY3RpdmVHcmFwaEJsb2NrID0gei5pbmZlcjx0eXBlb2YgSW50ZXJhY3RpdmVHcmFwaEJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5pbXBvcnQgeyBBeGlzQ29uZmlnLCBEcmF3YWJsZSB9IGZyb20gJy4vaW50ZXJhY3RpdmUtZ3JhcGguanMnO1xuXG4vLyBNdWx0aXBsZS1jaG9pY2UgcXVlc3Rpb24gYmxvY2suIE9uZSBwcm9tcHQsIDIrIGNob2ljZXMsIHJhZGlvIChzaW5nbGUpIG9yXG4vLyBjaGVja2JveCAoXCJzZWxlY3QgYWxsIHRoYXQgYXBwbHlcIikgdmlhIG11bHRpU2VsZWN0LiBTY29yZWQgYWxsLW9yLW5vdGhpbmc6XG4vLyB0aGUgc2VsZWN0ZWQgc2V0IG11c3QgZXF1YWwgdGhlIGNvcnJlY3Qgc2V0IChwZXItY2hvaWNlIHBhcnRpYWwgY3JlZGl0IGlzIGFcbi8vIGZ1dHVyZSBhZGRpdGl2ZSBmbGFnLCBtaXJyb3JpbmcgdGhlIGdyYXBoIGJsb2NrJ3MgcGFydGlhbENyZWRpdCBwcmVjZWRlbnQpLlxuLy9cbi8vIENob2ljZSBjb250ZW50IGlzIHJpY2ggaW5saW5lIChmb3JtYXR0ZWQgdGV4dCArIGlubGluZSBtYXRoKSBcdTIwMTQgdGhlIHNhbWVcbi8vIGFscGhhYmV0IGFzIHByb2JsZW0gcHJvc2UsIHNvIG1hdGggYW5zd2VyIGNob2ljZXMgcmVuZGVyIHByb3Blcmx5LiBSaWNoZXJcbi8vIGNob2ljZXMgYXJlIEFERElUSVZFIEZJRUxEUyBvbiBNdWx0aXBsZUNob2ljZU9wdGlvbiwgbm90IGEgdW5pb24gcmV3b3JrIFx1MjAxNFxuLy8gZGVjaWRlZCBhdCBkZXNpZ24gdGltZSwgZXhlcmNpc2VkIDIwMjYtMDctMTAgd2hlbiB0aGUgb3B0aW9uYWwgYGltYWdlYCBhbmRcbi8vIGBncmFwaGAgZmlndXJlcyBsYW5kZWQgd2l0aG91dCBhIHNjaGVtYVZlcnNpb24gYnVtcC5cbi8vXG4vLyBQZXItY2hvaWNlIGBmZWVkYmFja2AgaXMgdGhlIE1DIGFuYWxvZ3VlIG9mIGEgYmxhbmsncyBtaXN0YWtlRmVlZGJhY2s6XG4vLyBkaXN0cmFjdG9ycyBhcmUgdXN1YWxseSBhdXRob3JlZCBCRUNBVVNFIHRoZXkncmUgYW50aWNpcGF0ZWQgbWlzdGFrZXMsIHNvXG4vLyBlYWNoIGNob2ljZSBjYW4gY2FycnkgYW4gZXhwbGFuYXRpb24gc2hvd24gcG9zdC1jaGVjayB3aGVuIGl0IHdhcyBzZWxlY3RlZC5cbi8vXG4vLyBCbG9jay1sZXZlbCBmaWVsZHMgbWlycm9yIEZpbGxJbkJsYW5rQmxvY2sgZm9yIHBhcml0eSAoc29sdXRpb24sXG4vLyBoYXNDb25maWRlbmNlUmF0aW5nLCBza2lsbHMsIHdvcmtTcGFjZSkgXHUyMDE0IG9uZSBwcm9ibGVtIGNocm9tZSwgb25lIHJ1bnRpbWVcbi8vIHRyZWF0bWVudCwgb25lIGRhc2hib2FyZCByb3cgc2hhcGUuXG4vL1xuLy8gRGVsaWJlcmF0ZWx5IE5PVCBzY2hlbWEtZW5mb3JjZWQ6IFwiYXQgbGVhc3Qgb25lIGNob2ljZSBpcyBtYXJrZWQgY29ycmVjdC5cIlxuLy8gQSBtaWQtZWRpdCBkcmFmdCAodGVhY2hlciBoYXNuJ3QgcGlja2VkIHRoZSByaWdodCBhbnN3ZXIgeWV0KSBtdXN0IHN0aWxsXG4vLyBhdXRvc2F2ZTsgdGhlIGVkaXRvciBzdXJmYWNlcyB0aGUgd2FybmluZyBpbnN0ZWFkLiBBIHplcm8tY29ycmVjdCBibG9jayBpc1xuLy8gd2VsbC1kZWZpbmVkIGF0IHJ1bnRpbWUgKG11bHRpLXNlbGVjdDogc2VsZWN0aW5nIG5vdGhpbmcgaXMuLi4gc3RpbGwgYW5cbi8vIG9taXNzaW9uOyBub3RoaW5nIHNjb3JlcyBjb3JyZWN0KSBcdTIwMTQgd3JvbmcgYXV0aG9yaW5nLCBub3QgYSBjcmFzaC5cblxuLy8gT3B0aW9uYWwgaWxsdXN0cmF0aXZlIGltYWdlIG9uIGEgY2hvaWNlIChcIndoaWNoIGRpYWdyYW0gc2hvd3NcdTIwMjZcIikuIE1pcnJvcnNcbi8vIERlZmluaXRpb25JbWFnZSAvIFBoYXNlLTEgSW1hZ2VCbG9jazogVVJMLW9ubHksIG5vIHVwbG9hZCBwaXBlbGluZTsgYWx0XG4vLyByZXF1aXJlZCBidXQgZGVmYXVsdGluZyB0byAnJyBmb3IgZGVjb3JhdGl2ZSBmaWd1cmVzIChlZGl0b3Igd2FybnMpLlxuZXhwb3J0IGNvbnN0IENob2ljZUltYWdlID0gei5vYmplY3Qoe1xuICBzcmM6IHouc3RyaW5nKCkudXJsKCksXG4gIGFsdDogei5zdHJpbmcoKS5kZWZhdWx0KCcnKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ2hvaWNlSW1hZ2UgPSB6LmluZmVyPHR5cGVvZiBDaG9pY2VJbWFnZT47XG5cbi8vIE9wdGlvbmFsIHN0YXRpYyBncmFwaCBvbiBhIGNob2ljZSAoXCJ3aGljaCBncmFwaCBzaG93c1x1MjAyNlwiKS4gUmV1c2VzIHRoZVxuLy8gaW50ZXJhY3RpdmUtZ3JhcGggdm9jYWJ1bGFyeSAoQXhpc0NvbmZpZyArIGRpc3BsYXkgRHJhd2FibGVzKSBidXQgaXNcbi8vIHJlbmRlcmVkIHNlcnZlci1zaWRlIGFzIGlubGluZSBTVkcgYnkgdGhlIHJlbmRlcmVyJ3MgZ3JhcGgtc3ZnIGVuZ2luZSBcdTIwMTRcbi8vIG5ldmVyIHRoZSBpbnRlcmFjdGl2ZSBraXQuIENvbnNlcXVlbmNlOiBgZXhwcmVzc2lvbmAgZHJhd2FibGVzIG5lZWQgdGhlXG4vLyBraXQncyBwYXJzZXIgYW5kIGFyZSBOT1QgZHJhd247IHRoZSBlZGl0b3IgZG9lc24ndCBvZmZlciB0aGVtIGhlcmUuXG5leHBvcnQgY29uc3QgQ2hvaWNlR3JhcGggPSB6Lm9iamVjdCh7XG4gIGF4aXM6IEF4aXNDb25maWcsXG4gIGRyYXdhYmxlczogei5hcnJheShEcmF3YWJsZSkuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCB0eXBlIENob2ljZUdyYXBoID0gei5pbmZlcjx0eXBlb2YgQ2hvaWNlR3JhcGg+O1xuXG5leHBvcnQgY29uc3QgTXVsdGlwbGVDaG9pY2VPcHRpb24gPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgLy8gUmljaCBpbmxpbmUgY29udGVudCAoZm9ybWF0dGVkIHRleHQgKyBpbmxpbmUgbWF0aCkuIE5vbi1lbXB0eSBpcyBhblxuICAvLyBlZGl0b3IgY29uY2Vybiwgbm90IGEgc2NoZW1hIG9uZSAobWlkLWVkaXQgZHJhZnRzIG11c3Qgc2F2ZSkuXG4gIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAvLyBPcHRpb25hbCBwZXItY2hvaWNlIGV4cGxhbmF0aW9uLCByZXZlYWxlZCBwb3N0LWNoZWNrIHdoZW4gdGhpcyBjaG9pY2Ugd2FzXG4gIC8vIHNlbGVjdGVkLiBSaWNoIGlubGluZSBjb250ZW50LCBsaWtlIGJsYW5rIG1pc3Rha2VGZWVkYmFjayBlbnRyaWVzLlxuICBmZWVkYmFjazogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICAvLyBPcHRpb25hbCBmaWd1cmUgYmVsb3cgdGhlIGNob2ljZSB0ZXh0IFx1MjAxNCB0aGUgYWRkaXRpdmUgd2lkZW5pbmcgdGhlIGhlYWRlclxuICAvLyBjb21tZW50IHJlc2VydmVkLiBCb3RoIG1heSB0ZWNobmljYWxseSBjb2V4aXN0IChpbWFnZSByZW5kZXJzIGZpcnN0KTtcbiAgLy8gdGhlIGVkaXRvciBVSSB0cmVhdHMgdGhlbSBhcyBhIHNpbmdsZSBmaWd1cmUgc2xvdC5cbiAgaW1hZ2U6IENob2ljZUltYWdlLm9wdGlvbmFsKCksXG4gIGdyYXBoOiBDaG9pY2VHcmFwaC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNdWx0aXBsZUNob2ljZU9wdGlvbiA9IHouaW5mZXI8dHlwZW9mIE11bHRpcGxlQ2hvaWNlT3B0aW9uPjtcblxuZXhwb3J0IGNvbnN0IE11bHRpcGxlQ2hvaWNlQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdtdWx0aXBsZV9jaG9pY2UnKSxcbiAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLi4ubGFiZWxGaWVsZHMsXG4gIC8vIFRoZSBxdWVzdGlvbiBwcm9zZSAocmljaCBpbmxpbmUgY29udGVudCwgbGlrZSBhIHByb2JsZW0gc3RhdGVtZW50KS5cbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICBjaG9pY2VzOiB6LmFycmF5KE11bHRpcGxlQ2hvaWNlT3B0aW9uKS5taW4oMiksXG4gIC8vIGZhbHNlID0gc2luZ2xlIGFuc3dlciAocmFkaW9zLCBleGFjdGx5IG9uZSBzZWxlY3RhYmxlKTsgdHJ1ZSA9IFwic2VsZWN0XG4gIC8vIGFsbCB0aGF0IGFwcGx5XCIgKGNoZWNrYm94ZXMpLiBTY29yaW5nIGlzIHNldCBlcXVhbGl0eSBlaXRoZXIgd2F5LlxuICBtdWx0aVNlbGVjdDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIEtlZXAgdGhlIGF1dGhvcmVkIGNob2ljZSBvcmRlciBvbiBwYXBlciAoUzUuNSBEMTdBKS4gUHJpbnRlZCBWRVJTSU9OU1xuICAvLyBzaHVmZmxlIGNob2ljZXMgdG8gZGlzY291cmFnZSBjb3B5aW5nLCB3aGljaCBpcyB3cm9uZyBmb3IgYSBxdWVzdGlvbiB3aG9zZVxuICAvLyBvcmRlciBjYXJyaWVzIG1lYW5pbmcgXHUyMDE0IFwiYWxsIG9mIHRoZSBhYm92ZVwiIGhhcyB0byBzdGF5IGxhc3QsIGFuZCBcImJvdGggQVxuICAvLyBhbmQgQlwiIG5hbWVzIHBvc2l0aW9ucyBvdXRyaWdodC4gT3B0aW9uYWwgd2l0aCBubyBkZWZhdWx0IHNvIGEgZG9jdW1lbnRcbiAgLy8gd3JpdHRlbiBiZWZvcmUgdGhpcyByZS1zZXJpYWxpemVzIGJ5dGUtaWRlbnRpY2FsbHk7IGFic2VudCBtZWFucyBzaHVmZmxlLFxuICAvLyB3aGljaCBpcyB0aGUgcmlnaHQgZGVmYXVsdCBmb3IgdGhlIG92ZXJ3aGVsbWluZyBtYWpvcml0eSBvZiBxdWVzdGlvbnMuXG4gIGxvY2tDaG9pY2VPcmRlcjogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgLy8gV29ya2VkIGV4cGxhbmF0aW9uIGZvciB0aGUgd2hvbGUgcHJvYmxlbSwgcmV2ZWFsZWQgcG9zdC1jaGVjayByZWdhcmRsZXNzXG4gIC8vIG9mIGNvcnJlY3RuZXNzIChzYW1lIGNvbnRyYWN0IGFzIEZpbGxJbkJsYW5rQmxvY2suc29sdXRpb24pLlxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICBoYXNDb25maWRlbmNlUmF0aW5nOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICAvLyBQZXItcHJvYmxlbSBwcmludCB3b3JrLXNwYWNlIG92ZXJyaWRlIChyZW0pOyBhYnNlbnQgPSBpbmhlcml0IHRoZVxuICAvLyBhY3Rpdml0eS1sZXZlbCBkZWZhdWx0IChzZWUgRmlsbEluQmxhbmtCbG9jay53b3JrU3BhY2UgZm9yIHRoZSBDU1NcbiAgLy8gY3VzdG9tLXByb3BlcnR5IHJlYXNvbmluZykuXG4gIHdvcmtTcGFjZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgTXVsdGlwbGVDaG9pY2VCbG9jayA9IHouaW5mZXI8dHlwZW9mIE11bHRpcGxlQ2hvaWNlQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcbmltcG9ydCB7IENob2ljZUltYWdlLCBDaG9pY2VHcmFwaCB9IGZyb20gJy4vbXVsdGlwbGUtY2hvaWNlLmpzJztcblxuLy8gTWF0Y2hpbmcgcXVlc3Rpb24gYmxvY2suIFR3byBjb2x1bW5zOiBsZWZ0IFwiaXRlbXNcIiAoc3RlbXMsIGRvY3VtZW50IG9yZGVyKVxuLy8gYW5kIHJpZ2h0IFwidGFyZ2V0c1wiIChsZXR0ZXJlZCBBLCBCLCBDXHUyMDI2LCBzaHVmZmxlZCBhdCBwdWJsaXNoIHRpbWUpLiBUaGVcbi8vIHN0dWRlbnQgZHJhZ3MgYSB0YXJnZXQgY2FyZCBvbnRvIGFuIGl0ZW07IHRoZSBjYXJkIGRvY2tzIG5leHQgdG8gdGhlIHN0ZW0uXG4vLyBEZXNpZ246IGRvY3MvZGVzaWduL21hdGNoaW5nLW9yZGVyaW5nLXF1ZXN0aW9ucy5tZCAoZGVjaWRlZCAyMDI2LTA3LTEwKS5cbi8vXG4vLyBEaXN0cmFjdG9yczogdGFyZ2V0cyBtYXkgZXhjZWVkIGl0ZW1zIFx1MjAxNCBhbiB1bm1hdGNoZWQgdGFyZ2V0IGlzIHNpbXBseVxuLy8gcmVmZXJlbmNlZCBieSBubyBrZXkgZW50cnkuIGFsbG93VGFyZ2V0UmV1c2UgKG9mZiBieSBkZWZhdWx0KSBsZXRzIHNldmVyYWxcbi8vIGl0ZW1zIHNoYXJlIG9uZSB0YXJnZXQgKFwiY2F0ZWdvcml6YXRpb24tbGl0ZVwiOiBjbGFzc2lmeSBlYWNoIGV4cHJlc3Npb24gYXNcbi8vIGxpbmVhci9xdWFkcmF0aWMvZXhwb25lbnRpYWwpOyB0aGUgVUkgdGhlbiBDT1BJRVMgdGhlIGNhcmQgb24gZG9jayBpbnN0ZWFkXG4vLyBvZiBtb3ZpbmcgaXQuXG4vL1xuLy8gU2NvcmVkIFBFUiBQQUlSIChlYXJuZWQvdG90YWwgXHUyMDE0IHRoZSBmcmFjdGlvbmFsIENoZWNrcG9pbnRSZXN1bHQgcHJlY2VkZW50XG4vLyBmcm9tIHdpcmUgdjQpOiBlYWNoIGl0ZW0gaXMgb25lIHBvaW50LCBjb3JyZWN0IHdoZW4gdGhlIHN0dWRlbnQncyB0YXJnZXRcbi8vIGZvciBpdCBlcXVhbHMga2V5W2l0ZW1JZF0uIEJsb2NrIGBjb3JyZWN0YCA9IGV2ZXJ5IHBhaXIgcmlnaHQuIE5vIGJpcGFydGl0ZVxuLy8gbWFjaGluZXJ5IFx1MjAxNCB0aGUgc3R1ZGVudCdzIHBhaXJpbmcgSVMgdGhlIGFzc2lnbm1lbnQgKGNvbnRyYXN0IGJsYW5rIGdyb3Vwcyxcbi8vIHdoZXJlIHR5cGVkIHZhbHVlcyBtdXN0IGJlIG1hdGNoZWQgdG8gc2xvdHMpLlxuLy9cbi8vIEZpZ3VyZXM6IGl0ZW1zIGFuZCB0YXJnZXRzIGJvdGggdGFrZSB0aGUgb3B0aW9uYWwgaW1hZ2UvZ3JhcGggZmlndXJlIHNsb3Rcbi8vIHNoaXBwZWQgZm9yIE1DIGNob2ljZXMgKENob2ljZUltYWdlL0Nob2ljZUdyYXBoIFx1MjAxNCBVUkwtb25seSBpbWFnZTsgc3RhdGljXG4vLyBncmFwaCB2aWEgdGhlIHJlbmRlcmVyJ3Mga2l0LWZyZWUgU1ZHIGVuZ2luZSwgc28gYGV4cHJlc3Npb25gIGRyYXdhYmxlcyBhcmVcbi8vIGV4Y2x1ZGVkIHRoZXJlIGFuZCB0aGUgZWRpdG9yIGRvZXNuJ3Qgb2ZmZXIgdGhlbSkuIFwiTWF0Y2ggdGhlIGdyYXBoIHRvIGl0c1xuLy8gZXF1YXRpb25cIiBpcyB0aGUgbWFycXVlZSBjYXNlLlxuLy9cbi8vIERlbGliZXJhdGVseSBOT1Qgc2NoZW1hLWVuZm9yY2VkOiBcImtleSBjb3ZlcnMgZXZlcnkgaXRlbVwiIC8gXCJrZXkgcmVmZXJlbmNlc1xuLy8gcmVhbCB0YXJnZXRzLlwiIEEgbWlkLWVkaXQgZHJhZnQgKHRlYWNoZXIgc3RpbGwgYXNzaWduaW5nIGFuc3dlcnMpIG11c3Rcbi8vIGF1dG9zYXZlOyB0aGUgZWRpdG9yIHN1cmZhY2VzIHRoZSB3YXJuaW5nIGluc3RlYWQgKHRoZSBNQyB6ZXJvLWNvcnJlY3Rcbi8vIHByZWNlZGVudCkuIFRoZSBydW50aW1lIHRyZWF0cyBhbiBpdGVtIG1pc3NpbmcgZnJvbSB0aGUga2V5IGFzIG5ldmVyXG4vLyBjb3JyZWN0IFx1MjAxNCB3cm9uZyBhdXRob3JpbmcsIG5vdCBhIGNyYXNoLlxuXG5leHBvcnQgY29uc3QgTWF0Y2hpbmdJdGVtID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIC8vIFJpY2ggaW5saW5lIGNvbnRlbnQgKGZvcm1hdHRlZCB0ZXh0ICsgaW5saW5lIG1hdGgpLiBOb24tZW1wdHkgaXMgYW5cbiAgLy8gZWRpdG9yIGNvbmNlcm4sIG5vdCBhIHNjaGVtYSBvbmUgKG1pZC1lZGl0IGRyYWZ0cyBtdXN0IHNhdmUpLlxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxuICAvLyBPcHRpb25hbCBmaWd1cmUgYmVsb3cgdGhlIGl0ZW0gdGV4dCAoc2FtZSBzaW5nbGUtZmlndXJlLXNsb3QgdHJlYXRtZW50XG4gIC8vIGFzIE1DIGNob2ljZXM7IGltYWdlIHJlbmRlcnMgZmlyc3QgaWYgYm90aCBhcmUgc29tZWhvdyBzZXQpLlxuICBpbWFnZTogQ2hvaWNlSW1hZ2Uub3B0aW9uYWwoKSxcbiAgZ3JhcGg6IENob2ljZUdyYXBoLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE1hdGNoaW5nSXRlbSA9IHouaW5mZXI8dHlwZW9mIE1hdGNoaW5nSXRlbT47XG5cbmV4cG9ydCBjb25zdCBNYXRjaGluZ1RhcmdldCA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxuICBpbWFnZTogQ2hvaWNlSW1hZ2Uub3B0aW9uYWwoKSxcbiAgZ3JhcGg6IENob2ljZUdyYXBoLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE1hdGNoaW5nVGFyZ2V0ID0gei5pbmZlcjx0eXBlb2YgTWF0Y2hpbmdUYXJnZXQ+O1xuXG5leHBvcnQgY29uc3QgTWF0Y2hpbmdCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ21hdGNoaW5nJyksXG4gIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC4uLmxhYmVsRmllbGRzLFxuICAvLyBUaGUgcXVlc3Rpb24gcHJvc2UgKHJpY2ggaW5saW5lIGNvbnRlbnQsIGxpa2UgYSBwcm9ibGVtIHN0YXRlbWVudCkuXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgLy8gTGVmdCBjb2x1bW4sIGRvY3VtZW50IG9yZGVyLlxuICBpdGVtczogei5hcnJheShNYXRjaGluZ0l0ZW0pLm1pbigyKSxcbiAgLy8gUmlnaHQgY29sdW1uOyBtYXkgZXhjZWVkIGl0ZW1zIChleHRyYSB0YXJnZXRzIGFyZSBkaXN0cmFjdG9ycykuIExldHRlcnNcbiAgLy8gYXJlIGFzc2lnbmVkIGJ5IHBvc2l0aW9uIEFGVEVSIHRoZSBwdWJsaXNoLXRpbWUgc2h1ZmZsZSwgbmV2ZXIgYXV0aG9yZWQuXG4gIHRhcmdldHM6IHouYXJyYXkoTWF0Y2hpbmdUYXJnZXQpLm1pbigyKSxcbiAgLy8gVGhlIGNvcnJlY3QgcGFpcmluZzogaXRlbSBpZCBcdTIxOTIgdGFyZ2V0IGlkLiBQYXJ0aWFsIGR1cmluZyBhdXRob3JpbmcgKHNlZVxuICAvLyBoZWFkZXIpOyBtdWx0aXBsZSBpdGVtcyBtYXkgc2hhcmUgYSB0YXJnZXQgb25seSB1bmRlciBhbGxvd1RhcmdldFJldXNlLlxuICBrZXk6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCB6LnN0cmluZygpLnV1aWQoKSksXG4gIC8vIGZhbHNlID0gb25lLXRvLW9uZSAoZG9ja2luZyBtb3ZlcyB0aGUgY2FyZDsgYSB1c2VkIHRhcmdldCBjYW4ndCBiZSB1c2VkXG4gIC8vIGFnYWluKS4gdHJ1ZSA9IG1hbnktdG8tb25lIGFsbG93ZWQgKGRvY2tpbmcgY29waWVzIHRoZSBjYXJkKS5cbiAgYWxsb3dUYXJnZXRSZXVzZTogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIE1DLXBhcml0eSBwcm9ibGVtIGNocm9tZSAob25lIHByb2JsZW0gc2hhcGUsIG9uZSBkYXNoYm9hcmQgcm93IHNoYXBlKS5cbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgaGFzQ29uZmlkZW5jZVJhdGluZzogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgd29ya1NwYWNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNYXRjaGluZ0Jsb2NrID0gei5pbmZlcjx0eXBlb2YgTWF0Y2hpbmdCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuXG4vLyBPcmRlcmluZyAvIHNlcXVlbmNpbmcgcXVlc3Rpb24gYmxvY2suIFRoZSBBVVRIT1JFRCBvcmRlciBvZiBgaXRlbXNgIElTIHRoZVxuLy8gY29ycmVjdCBvcmRlcjsgc3R1ZGVudHMgc2VlIHRoZSBsaXN0IHNodWZmbGVkIGF0IHB1Ymxpc2ggdGltZSBhbmQgZHJhZyBpdFxuLy8gYmFjayBpbnRvIHNlcXVlbmNlLiBEZXNpZ246IGRvY3MvZGVzaWduL21hdGNoaW5nLW9yZGVyaW5nLXF1ZXN0aW9ucy5tZFxuLy8gKGRlY2lkZWQgMjAyNi0wNy0xMCkuXG4vL1xuLy8gU2NvcmVkIEFMTC1PUi1OT1RISU5HIG9uIGV4YWN0IHNlcXVlbmNlIGVxdWFsaXR5IChhdXRob3IgY2FsbDogcGFydGlhbC1cbi8vIGNyZWRpdCBtZXRyaWNzIGZvciBvcmRlcmluZ3MgYXJlIGVpdGhlciBtaXNsZWFkaW5nIFx1MjAxNCBwb3NpdGlvbiBtYXRjaGVzXG4vLyBwdW5pc2ggYW4gb2ZmLWJ5LW9uZSBzaGlmdCBhYnN1cmRseSBcdTIwMTQgb3Igb3BhcXVlIHRvIHRlYWNoZXJzOyByZXZpc2l0IG9ubHlcbi8vIG9uIG9ic2VydmVkIGRlbWFuZCkuIEludGVyY2hhbmdlYWJsZSBhZGphY2VudCBpdGVtczogWUFHTkksIGFkZGl0aXZlIGxhdGVyLlxuLy9cbi8vIEFuIHVudG91Y2hlZCBsaXN0IGlzIGFuIE9NSVNTSU9OLCBub3QgYW4gYW5zd2VyOiBhIHNodWZmbGVkIGxpc3QgaXMgYWx3YXlzXG4vLyAqc29tZSogc2VxdWVuY2UsIHNvIHRoZSBydW50aW1lIG9ubHkgcmVjb3JkcyBhIHJlc3BvbnNlIG9uY2UgdGhlIHN0dWRlbnRcbi8vIGhhcyBtb3ZlZCBzb21ldGhpbmcuXG4vL1xuLy8gTm8gZmlndXJlIHNsb3Qgb24gaXRlbXMgaW4gdjEgKG5vIGNsZWFyIHVzZSBjYXNlIHlldDsgYWRkaXRpdmUgbGF0ZXIgXHUyMDE0XG4vLyB0aGUgTUMvbWF0Y2hpbmcgQ2hvaWNlSW1hZ2UvQ2hvaWNlR3JhcGggcGF0dGVybiBpcyBzaXR0aW5nIHRoZXJlKS5cblxuZXhwb3J0IGNvbnN0IE9yZGVyaW5nSXRlbSA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAvLyBSaWNoIGlubGluZSBjb250ZW50IChmb3JtYXR0ZWQgdGV4dCArIGlubGluZSBtYXRoKS4gTm9uLWVtcHR5IGlzIGFuXG4gIC8vIGVkaXRvciBjb25jZXJuLCBub3QgYSBzY2hlbWEgb25lIChtaWQtZWRpdCBkcmFmdHMgbXVzdCBzYXZlKS5cbiAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbn0pO1xuZXhwb3J0IHR5cGUgT3JkZXJpbmdJdGVtID0gei5pbmZlcjx0eXBlb2YgT3JkZXJpbmdJdGVtPjtcblxuZXhwb3J0IGNvbnN0IE9yZGVyaW5nQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdvcmRlcmluZycpLFxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAuLi5sYWJlbEZpZWxkcyxcbiAgLy8gVGhlIHF1ZXN0aW9uIHByb3NlIChyaWNoIGlubGluZSBjb250ZW50LCBsaWtlIGEgcHJvYmxlbSBzdGF0ZW1lbnQpLlxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIC8vIEF1dGhvcmVkIG9yZGVyID0gY29ycmVjdCBvcmRlci4gVGhlIHJlbmRlcmVyIHNodWZmbGVzIGRldGVybWluaXN0aWNhbGx5XG4gIC8vIChzZWVkZWQgYnkgYmxvY2sgaWQpIGZvciB0aGUgc3R1ZGVudC1mYWNpbmcgYXJyYW5nZW1lbnQuXG4gIGl0ZW1zOiB6LmFycmF5KE9yZGVyaW5nSXRlbSkubWluKDIpLFxuICAvLyBNQy1wYXJpdHkgcHJvYmxlbSBjaHJvbWUgKG9uZSBwcm9ibGVtIHNoYXBlLCBvbmUgZGFzaGJvYXJkIHJvdyBzaGFwZSkuXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIGhhc0NvbmZpZGVuY2VSYXRpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIHdvcmtTcGFjZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgT3JkZXJpbmdCbG9jayA9IHouaW5mZXI8dHlwZW9mIE9yZGVyaW5nQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcbmltcG9ydCB7IEVuZHBvaW50U3R5bGUgfSBmcm9tICcuL2ludGVyYWN0aXZlLWdyYXBoLmpzJztcbmltcG9ydCB7IHNpemluZ0ZpZWxkcyB9IGZyb20gJy4uL3NpemluZy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBudW1iZXItbGluZS50cyBcdTIwMTQgdGhlIG51bWJlcl9saW5lIGJsb2NrICgxLUQgZ3JhZGVkLCBLLTggLyBlYXJseSBhbGdlYnJhKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSAxLUQgc2libGluZyBvZiBpbnRlcmFjdGl2ZV9ncmFwaC4gVGhlIHN0dWRlbnQncyBhbnN3ZXIgaXMgR0VPTUVUUklDIFx1MjAxNCBhXG4vLyBwb2ludCAob3Igc2V2ZXJhbCkgcGxvdHRlZCBvbiBhIHNpbmdsZSBudW1iZXIgbGluZSwgb3IgYW4gaW50ZXJ2YWwvcmF5IHdpdGhcbi8vIG9wZW4vY2xvc2VkIGVuZHBvaW50cyAoXCJncmFwaCB4ID49IC0yXCIpLiBTYW1lIHRocmVlIHN0cnVjdHVyYWwgY29uc2VxdWVuY2VzXG4vLyBhcyB0aGUgZ3JhcGggYmxvY2sgKHNlZSBkb2NzL2Rlc2lnbi9udW1iZXItbGluZS1ibG9jay5tZCk6IGEgc3RydWN0dXJlZFxuLy8gYW5zd2VyIHdpdGggaXRzIE9XTiBzdWJtaXNzaW9uIG1hcCAobnVtYmVyTGluZVJlc3BvbnNlcywgbm90IHRoZSBibGFua3MgbWFwKSxcbi8vIHRvbGVyYW5jZS1iYXNlZCBnZW9tZXRyaWMgc2NvcmluZyBkb25lIGJ5IHRoZSBsYXp5IGdyYXBoLWtpdCAobm90IHRoZVxuLy8gcnVudGltZSdzIHN0cmluZyBzdHJhdGVnaWVzKSwgYW5kIGEgd2lkZ2V0IHRoYXQgcmlkZXMgQGFjdGl2aXR5L2dyYXBoLWtpdC5cbi8vXG4vLyBBIFNFUEFSQVRFIGJsb2NrIGZhbWlseSwgbm90IGEgR3JhcGhJbnRlcmFjdGlvbiB2YXJpYW50IChhdXRob3IgY2FsbCwgU1RBVEVcbi8vIDIwMjYtMDctMTApOiBudW1iZXIgbGluZXMgYXJlIDEtRCBhbmQgbXVzdCBub3QgYmUgZm9yY2VkIHVuZGVyIHRoZSBncmFwaFxuLy8gYmxvY2sncyAyLUQgQXhpc0NvbmZpZy4gRW5kcG9pbnRTdHlsZSBpcyBzaGFyZWQgZnJvbSBpbnRlcmFjdGl2ZS1ncmFwaC50cyBcdTIwMTRcbi8vIGl0IHdhcyByZXNlcnZlZCB0aGVyZSBcImZvciB0aGUgZnV0dXJlIG51bWJlci1saW5lIGZhbWlseVwiIGZyb20gRHJvcCAyLlxuLy9cbi8vIFNsaWNlIDEgc2hpcHMgVFdPIGludGVyYWN0aW9ucyAocGxvdF9wb2ludCwgcGxvdF9pbnRlcnZhbCksIGRpc2NyaW1pbmF0ZWQgb25cbi8vIGB0eXBlYCBmcm9tIGRheSBvbmUgc28gcGxvdF9yYXkgLyBkaXNwbGF5IHNsb3QgaW4gYWRkaXRpdmVseSBsYXRlciwgZXhhY3RseVxuLy8gaG93IEdyYXBoSW50ZXJhY3Rpb24gZ3Jvd3MuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyAtLS0tIExpbmUgY29uZmlndXJhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIDEtRCBhbmFsb2d1ZSBvZiBBeGlzQ29uZmlnLiBMaW5lIHVuaXRzIHRocm91Z2hvdXQgXHUyMDE0IHRvbGVyYW5jZSBhbmQgdGlja1xuLy8gc3RlcHMgYXJlIGluIHRoZSBzYW1lIHVuaXRzLCBuZXZlciBwaXhlbHMsIHNvIGEgcGFnZSB0aGF0IHJlLWxheXMtb3V0IGF0IGFcbi8vIGRpZmZlcmVudCB3aWR0aCBzdGlsbCBzY29yZXMgaWRlbnRpY2FsbHkuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUNvbmZpZyA9IHoub2JqZWN0KHtcbiAgbWluOiB6Lm51bWJlcigpLFxuICBtYXg6IHoubnVtYmVyKCksXG4gIC8vIFNwYWNpbmcgYmV0d2VlbiBMQUJFTEVEIHRpY2tzIChsaW5lIHVuaXRzKS5cbiAgdGlja1N0ZXA6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5kZWZhdWx0KDEpLFxuICAvLyBVbmxhYmVsZWQgbWlub3IgdGlja3MgZHJhd24gYmV0d2VlbiBlYWNoIHBhaXIgb2YgbGFiZWxlZCB0aWNrcyAoMCA9IG5vbmUpLlxuICAvLyBWaXN1YWwgb25seSBcdTIwMTQgbmV2ZXIgc2NvcmVkLlxuICBtaW5vclRpY2tzUGVyU3RlcDogei5udW1iZXIoKS5pbnQoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMCksXG4gIC8vIFdoZW4gdHJ1ZSwgYSBkcmFnZ2VkIGhhbmRsZSBzbmFwcyB0byB0aGUgbmVhcmVzdCB0aWNrIChtaW5vciBpZiBwcmVzZW50LFxuICAvLyBlbHNlIHRoZSBsYWJlbGVkIHN0ZXApLiBLZXlib2FyZCBudWRnZSBhbHdheXMgbW92ZXMgYnkgb25lIHRpY2sgcmVnYXJkbGVzc1xuICAvLyAoU2hpZnQgPSBmaW5lLCBvbmUtdGVudGggb2YgYSB0aWNrKS5cbiAgc25hcFRvVGljazogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbn0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZUNvbmZpZyA9IHouaW5mZXI8dHlwZW9mIE51bWJlckxpbmVDb25maWc+O1xuXG4vLyAtLS0tIEludGVyYWN0aW9uIHZhcmlhbnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gcGxvdF9wb2ludDogdGhlIHN0dWRlbnQgcGxhY2VzIG9uZSBvciBtb3JlIHBvaW50cyBvbiB0aGUgbGluZS4gTXVsdGktcG9pbnRcbi8vIChcInBsb3QgLTIgYW5kIDVcIikgaXMgc2NvcmVkIGNvbnN1bWUtb25jZSwgYWxsLW9yLW5vdGhpbmcgXHUyMDE0IGV2ZXJ5IGNvcnJlY3Rcbi8vIHBvc2l0aW9uIG11c3QgYmUgbWF0Y2hlZCAobWlycm9ycyB0aGUgZ3JhcGggYmxvY2sncyBOLWhhbmRsZSBwbG90X3BvaW50KS5cbmV4cG9ydCBjb25zdCBOdW1iZXJMaW5lUG9pbnRJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X3BvaW50JyksXG4gIC8vIENvcnJlY3QgcG9zaXRpb25zIGluIGxpbmUgdW5pdHMuIEEgc2luZ2xlIHBvaW50IGlzIHRoZSBjb21tb24gY2FzZS5cbiAgY29ycmVjdFBvaW50czogei5hcnJheSh6Lm51bWJlcigpKS5taW4oMSksXG4gIC8vIE1hdGNoIHJhZGl1cyBpbiBsaW5lIHVuaXRzIChhIHBvaW50IGlzIGNvcnJlY3Qgd2l0aGluICsvLSB0b2xlcmFuY2UpLlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uXG4+O1xuXG4vLyBBbiBpbnRlcnZhbCBvciByYXkgb24gdGhlIGxpbmUuIEEgcHJlc2VudCBib3VuZCBjYXJyaWVzIGFuIG9wZW4vY2xvc2VkIHN0eWxlXG4vLyAodGhlIGluZXF1YWxpdHkgZGlzdGluY3Rpb246IHggPiAzIG9wZW4gdnMgeCA+PSAzIGNsb3NlZCkuIEFuIEFCU0VOVCBib3VuZCBpc1xuLy8gdW5ib3VuZGVkIHRoYXQgZGlyZWN0aW9uIFx1MjAxNCBzbyBhIHJheSBpcyBqdXN0IGFuIGludGVydmFsIHdpdGggb25lIHNpZGUgb21pdHRlZFxuLy8gKFwieCA+PSAzXCIgPSBtaW4gMyBjbG9zZWQsIG5vIG1heDsgXCJ4IDwgNVwiID0gbWF4IDUgb3Blbiwgbm8gbWluKS4gVGhlIHNoYWRlZFxuLy8gcmVnaW9uIGlzIHVuYW1iaWd1b3VzIGZyb20gd2hpY2ggYm91bmRzIGFyZSBwcmVzZW50LCBzbyBubyBzZXBhcmF0ZSBzaWRlIGZsYWdcbi8vIGlzIG5lZWRlZCAodW5saWtlIHRoZSAyLUQgZ3JhcGggaW5lcXVhbGl0eSkuIEF0IGxlYXN0IG9uZSBib3VuZCBtdXN0IGJlXG4vLyBwcmVzZW50IChhIHR3by1zaWRlZC11bmJvdW5kZWQgaW50ZXJ2YWwgaXMgdGhlIHdob2xlIGxpbmUgXHUyMDE0IG1lYW5pbmdsZXNzKTsgdGhlXG4vLyBmYWN0b3J5ICsgYXV0aG9yIFVJIGd1YXJhbnRlZSBpdCBhbmQgdGhlIHNjb3JlciBhc3N1bWVzIGl0LlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVJbnRlcnZhbCA9IHoub2JqZWN0KHtcbiAgbWluOiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIG1pblN0eWxlOiBFbmRwb2ludFN0eWxlLm9wdGlvbmFsKCksXG4gIG1heDogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBtYXhTdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBOdW1iZXJMaW5lSW50ZXJ2YWwgPSB6LmluZmVyPHR5cGVvZiBOdW1iZXJMaW5lSW50ZXJ2YWw+O1xuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9pbnRlcnZhbCcpLFxuICBjb3JyZWN0SW50ZXJ2YWw6IE51bWJlckxpbmVJbnRlcnZhbCxcbiAgLy8gTWF0Y2ggcmFkaXVzIGluIGxpbmUgdW5pdHMsIGFwcGxpZWQgdG8gZWFjaCBwcmVzZW50IGVuZHBvaW50LlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVJbnRlcnZhbEludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIE51bWJlckxpbmVJbnRlcnZhbEludGVyYWN0aW9uXG4+O1xuXG4vLyBEaXNjcmltaW5hdGVkIG9uIGB0eXBlYCBzbyBjb25zdW1lcnMgYnJhbmNoIHVuaWZvcm1seSBhbmQgdGhlIHdpcmUgZm9ybWF0XG4vLyBhbHdheXMgY2FycmllcyBpdC4gR3Jvd2luZyBhIHZhcmlhbnQgaXMgYSBuZXcgbWVtYmVyIGhlcmUgKyBhIG5ldyBzY29yZXJcbi8vIGJyYW5jaCBpbiB0aGUga2l0IFx1MjAxNCBubyBvdGhlciBibG9jayB0b3VjaGVkLlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVJbnRlcmFjdGlvbiA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBOdW1iZXJMaW5lUG9pbnRJbnRlcmFjdGlvbixcbiAgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb24sXG5dKTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIE51bWJlckxpbmVJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gVGhlIGJsb2NrIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBdXRvLW51bWJlcmVkIGxpa2UgdGhlIG90aGVyIHF1ZXN0aW9uIGJsb2Nrcy4gaGFzQ29uZmlkZW5jZVJhdGluZyArIHNraWxscyArXG4vLyBzb2x1dGlvbiBmb2xsb3cgdGhlIHNhbWUgb3B0LWluIHBhdHRlcm5zIEZpbGxJbkJsYW5rQmxvY2sgLyBJbnRlcmFjdGl2ZUdyYXBoXG4vLyBlc3RhYmxpc2hlZC4gRGVsaWJlcmF0ZWx5IExFQU4gZm9yIHNsaWNlIDEgKG5vIHBhcnRpYWxDcmVkaXQgLyBhbGxvd05vU29sdXRpb25cbi8vIC8gbWlzdGFrZUZlZWRiYWNrKSBcdTIwMTQgYWxsLW9yLW5vdGhpbmcgc2NvcmluZyAoZGVzaWduIGRlY2lzaW9uIDYpOyB0aG9zZSBmaWVsZHNcbi8vIGFyZSBhZGRpdGl2ZSBsYXRlciBpZiBhc2tlZCBmb3IgKFlBR05JKSwgZXhhY3RseSBhcyB0aGUgZ3JhcGggYmxvY2sgcmVzZXJ2ZWRcbi8vIHRoZW0gYWNyb3NzIGRyb3BzLlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ251bWJlcl9saW5lJyksXG4gIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC4uLmxhYmVsRmllbGRzLFxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGNvbmZpZzogTnVtYmVyTGluZUNvbmZpZyxcbiAgaW50ZXJhY3Rpb246IE51bWJlckxpbmVJbnRlcmFjdGlvbixcbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgaGFzQ29uZmlkZW5jZVJhdGluZzogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgLy8gVmFyaWFibGUgYmxvY2sgc2l6aW5nOiBvcHRpb25hbCB3aWR0aCBmcmFjdGlvbiArIGFsaWdubWVudCAoc2l6aW5nLnRzKS5cbiAgLy8gQWRkaXRpdmUvb3B0aW9uYWwgXHUyMDE0IG5vIHNjaGVtYVZlcnNpb24gYnVtcC5cbiAgLi4uc2l6aW5nRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBOdW1iZXJMaW5lQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBOdW1iZXJMaW5lQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcbmltcG9ydCB7IE51bWJlckxpbmVDb25maWcgfSBmcm9tICcuL251bWJlci1saW5lLmpzJztcbmltcG9ydCB7IHNpemluZ0ZpZWxkcyB9IGZyb20gJy4uL3NpemluZy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBkYXRhLXBsb3QudHMgXHUyMDE0IHRoZSBkYXRhX3Bsb3QgYmxvY2sgKHN0YXRpc3RpY3MgY2hhcnRzKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzdGF0aXN0aWNzIHNpYmxpbmcgb2YgaW50ZXJhY3RpdmVfZ3JhcGggKDItRCBmdW5jdGlvbnMpIGFuZCBudW1iZXJfbGluZVxuLy8gKDEtRCBnZW9tZXRyeSkuIEEgZGF0YV9wbG90IHJlbmRlcnMgYSBkb3QgcGxvdCwgaGlzdG9ncmFtLCBvciBib3ggcGxvdCBmcm9tIGFcbi8vIGRhdGFzZXQgXHUyMDE0IGVpdGhlciBhcyBhIHN0YXRpYyBTVElNVUxVUyB0aGUgc3R1ZGVudCByZWFkcyAoXCJ3aGF0IGlzIHRoZSBtZWRpYW5cbi8vIG9mIHRoaXMgYm94IHBsb3Q/XCIsIHBhaXJlZCB3aXRoIGEgc2libGluZyBudW1lcmljL01DIGJsb2NrKSBvciBhcyBhIGdyYWRlZFxuLy8gQ09OU1RSVUNUSU9OIHRoZSBzdHVkZW50IGJ1aWxkcyAoXCJtYWtlIGEgZG90IHBsb3Qgb2YgdGhlc2UgdmFsdWVzXCIpLlxuLy9cbi8vIEEgU0VQQVJBVEUgYmxvY2sgZmFtaWx5LCBub3QgYSBHcmFwaEludGVyYWN0aW9uIHZhcmlhbnQgKHRheG9ub215IGZpeGVkXG4vLyAyMDI2LTA3LTEwLCBTVEFURSk6IHN0YXRzIGNoYXJ0cyBhcmUgdGhlaXIgb3duIHNoYXBlIGFuZCBtdXN0IG5vdCBiZSBmb3JjZWRcbi8vIHVuZGVyIHRoZSBncmFwaCBibG9jaydzIDItRCBBeGlzQ29uZmlnLiBEZXNpZ24gKyA5IGRlY2lzaW9ucyBpblxuLy8gZG9jcy9kZXNpZ24vZGF0YS1wbG90LWJsb2NrLm1kIChhdXRob3IgYXBwcm92ZWQgdGhlIHJlY29tbWVuZGVkIGFuc3dlcnMpLlxuLy9cbi8vIFRIRSBBTlNXRVIgSVMgQ09NUFVURUQgRlJPTSBUSEUgREFUQSAoZGVzaWduIGRlY2lzaW9uIDNhKTogYSBkb3QgcGxvdCxcbi8vIGhpc3RvZ3JhbSwgYW5kIGJveCBwbG90IGFyZSBlYWNoIGEgZGV0ZXJtaW5pc3RpYyBmdW5jdGlvbiBvZiBgZGF0YWAsIHNvIHRoZVxuLy8gYXV0aG9yIGVudGVycyB0aGUgcmF3IGRhdGFzZXQgT05DRSBhbmQgdGhlIGNvcnJlY3QgcGxvdCBpcyBkZXJpdmVkIGJ5IHRoZSBraXRcbi8vIHNjb3JlciBcdTIwMTQgdGhlcmUgaXMgbm8gc2VwYXJhdGVseS1hdXRob3JlZCBhbnN3ZXIga2V5IHRvIGRyaWZ0IGZyb20gdGhlIGRhdGEuXG4vLyBUaGUgc2FtZSBgZGF0YWAgcmVuZGVycyB0aGUgY2hhcnQgaW4gZGlzcGxheSBtb2RlIGFuZCBpcyB0aGUgc291cmNlIHRoZVxuLy8gc3R1ZGVudCBwbG90cyAoYW5kIHRoZSBrZXkgaXQncyBzY29yZWQgYWdhaW5zdCkgaW4gYnVpbGQgbW9kZS5cbi8vXG4vLyBTbGljZSAxIHNoaXBzIFRXTyBpbnRlcmFjdGlvbnMgXHUyMDE0IGBkaXNwbGF5YCAoYWxsIHRocmVlIGNoYXJ0IHR5cGVzLCB1bmdyYWRlZFxuLy8gc3RpbXVsdXMpIGFuZCBgYnVpbGRfZG90cGxvdGAgKHRoZSBzaW1wbGVzdCBncmFkZWQgY29uc3RydWN0aW9uKSBcdTIwMTRcbi8vIGRpc2NyaW1pbmF0ZWQgb24gYHR5cGVgIGZyb20gZGF5IG9uZSBzbyBgYnVpbGRfaGlzdG9ncmFtYCAvIGBidWlsZF9ib3hwbG90YFxuLy8gc2xvdCBpbiBhZGRpdGl2ZWx5IGxhdGVyLCBleGFjdGx5IGhvdyBHcmFwaEludGVyYWN0aW9uIGFuZCBOdW1iZXJMaW5lSW50ZXJhY3Rpb25cbi8vIGdyb3cuIFNhbWUgdGhyZWUgc3RydWN0dXJhbCBjb25zZXF1ZW5jZXMgYXMgdGhlIGdyYXBoL251bWJlci1saW5lIGJsb2NrczogYVxuLy8gc3RydWN0dXJlZCBhbnN3ZXIgd2l0aCBpdHMgT1dOIHN1Ym1pc3Npb24gbWFwIChkYXRhUGxvdFJlc3BvbnNlcywgbm90IHRoZVxuLy8gYmxhbmtzIG1hcCksIGZyZXF1ZW5jeS9zdW1tYXJ5IHNjb3JpbmcgZG9uZSBieSB0aGUgbGF6eSBncmFwaC1raXQgKG5vdCB0aGVcbi8vIHJ1bnRpbWUncyBzdHJpbmcgc3RyYXRlZ2llcyksIGFuZCBhIHdpZGdldCB0aGF0IHJpZGVzIEBhY3Rpdml0eS9ncmFwaC1raXQuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyAtLS0tIENoYXJ0IGNvbmZpZ3VyYXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIG51bWVyaWMgYXhpcyBpcyByZXVzZWQgVkVSQkFUSU0gZnJvbSBOdW1iZXJMaW5lQ29uZmlnIChkZXNpZ24gZGVjaXNpb24gNSk6XG4vLyBhIGRvdCBwbG90IHN0YWNrcyBkb3RzIGFib3ZlIHRoZWlyIHZhbHVlIG9uIGEgMS1EIG51bWJlciBsaW5lLCBhbmQgYSBib3ggcGxvdFxuLy8gc2l0cyBvbiB0aGF0IHNhbWUgYXhpcywgc28gdGhlIHRpY2svbWlub3Ivc25hcCBzZW1hbnRpY3MgYXJlIGlkZW50aWNhbC4gVGhlXG4vLyBoaXN0b2dyYW0tb25seSBleHRyYXMgKGVxdWFsLXdpZHRoIGJpbnMgKyBhbiBvcHRpb25hbCB5LXNjYWxlIGNlaWxpbmcpIGFyZVxuLy8gY29uc3VsdGVkIG9ubHkgd2hlbiB0aGUgY2hhcnQgaXMgYSBoaXN0b2dyYW07IHVuZXF1YWwtYmluIGBiaW5FZGdlc2AgaXMgYVxuLy8gZG9jdW1lbnRlZCBsYXRlciBsZXZlciAoWUFHTkkgaW4gc2xpY2UgMSkuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RDb25maWcgPSBOdW1iZXJMaW5lQ29uZmlnLmV4dGVuZCh7XG4gIC8vIEVxdWFsLXdpZHRoIGJpbiBzaXplIHNwYW5uaW5nIFttaW4sIG1heF07IG9ubHkgcmVhZCB3aGVuIGNoYXJ0ID09XG4gIC8vICdoaXN0b2dyYW0nLiBBYnNlbnQgXHUyMTkyIHRoZSBoaXN0b2dyYW0gZmFsbHMgYmFjayB0byBgdGlja1N0ZXBgIGFzIHRoZSBiaW5cbiAgLy8gd2lkdGguIFBvc2l0aXZlLlxuICBiaW5XaWR0aDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC8vIEZpeGVkIGNlaWxpbmcgZm9yIHRoZSBoaXN0b2dyYW0vZG90LXBsb3QgdmVydGljYWwgc2NhbGUuIEFic2VudCBcdTIxOTIgdGhlXG4gIC8vIHNjYWxlIGF1dG8tZml0cyB0aGUgdGFsbGVzdCBiYXIvc3RhY2sgZnJvbSBgZGF0YWAuIEEgZml4ZWQgdmFsdWUga2VlcHNcbiAgLy8gc2V2ZXJhbCBwbG90cyBvbiBhIHBhZ2UgdmlzdWFsbHkgY29tcGFyYWJsZS4gUG9zaXRpdmUgaW50ZWdlciAoZnJlcXVlbmN5KS5cbiAgbWF4RnJlcXVlbmN5OiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RDb25maWcgPSB6LmluZmVyPHR5cGVvZiBEYXRhUGxvdENvbmZpZz47XG5cbi8vIFRoZSBjaGFydCBzaGFwZS4gU2hhcmVkIGJ5IHRoZSBgZGlzcGxheWAgbWVtYmVyICh3aGljaCBvbmUgdG8gcmVuZGVyKSBhbmRcbi8vIGltcGxpZWQgYnkgZWFjaCBgYnVpbGRfKmAgbWVtYmVyLiBOYW1lZCBieSBzaGFwZSwgbm90IGJ5IGdyYWRlIGJhbmQuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RDaGFydCA9IHouZW51bShbJ2RvdHBsb3QnLCAnaGlzdG9ncmFtJywgJ2JveHBsb3QnXSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdENoYXJ0ID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3RDaGFydD47XG5cbi8vIC0tLS0gSW50ZXJhY3Rpb24gdmFyaWFudHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBkaXNwbGF5OiBhIHN0YXRpYywgdW5ncmFkZWQgY2hhcnQgb2YgYGRhdGFgIFx1MjAxNCBhIHN0aW11bHVzIHRoZSBzdHVkZW50IHJlYWRzLlxuLy8gTGlrZSBpbnRlcmFjdGl2ZV9ncmFwaCdzIGBkaXNwbGF5YCBtZW1iZXIgaXQgcHVsbHMgbm8gcHJvYmxlbSBudW1iZXIsIGlzXG4vLyBuZXZlciBzY29yZWQsIGFuZCBuZXZlciBqb2lucyB0aGUgc3VibWlzc2lvbiBwYXlsb2FkOyBhIFwicmVhZCB0aGlzIGNoYXJ0IHRoZW5cbi8vIGFuc3dlclwiIHRhc2sgY29tcG9zZXMgYSBkaXNwbGF5IGRhdGFfcGxvdCB3aXRoIGEgc2libGluZyBudW1lcmljL01DIGJsb2NrXG4vLyAodGhlIHBhdHRlcm4gdGhhdCByZXBsYWNlZCB0aGUgcmV0aXJlZCBhbnN3ZXItc3VyZmFjZS1hcy1hLWZpZWxkIHNlYW0pLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90RGlzcGxheUludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2Rpc3BsYXknKSxcbiAgY2hhcnQ6IERhdGFQbG90Q2hhcnQsXG59KTtcbmV4cG9ydCB0eXBlIERhdGFQbG90RGlzcGxheUludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIERhdGFQbG90RGlzcGxheUludGVyYWN0aW9uXG4+O1xuXG4vLyBidWlsZF9kb3RwbG90OiB0aGUgc3R1ZGVudCBzdGFja3MgZG90cyBhYm92ZSB0aGUgYXhpcyB0byByZXByb2R1Y2UgdGhlXG4vLyBmcmVxdWVuY3kgZGlzdHJpYnV0aW9uIG9mIGBkYXRhYC4gU2NvcmVkIGFsbC1vci1ub3RoaW5nIG9uIGZyZXF1ZW5jeS1tYXBcbi8vIGVxdWFsaXR5IChkZXNpZ24gZGVjaXNpb24gOCkgXHUyMDE0IGRvdCB2YWx1ZXMgYXJlIGRpc2NyZXRlICh0aGUgd2lkZ2V0IHNuYXBzIGVhY2hcbi8vIGRvdCB0byBhIHRpY2spLCBzbyB0aGUgY29tcGFyaXNvbiBpcyBleGFjdCwgbm8gdG9sZXJhbmNlIGZpZWxkLiBUaGUgY29ycmVjdFxuLy8gZGlzdHJpYnV0aW9uIGlzIENPTVBVVEVEIGZyb20gYGRhdGFgIChkZWNpc2lvbiAzYSk7IG5vdGhpbmcgdG8gYXV0aG9yIGhlcmVcbi8vIGJleW9uZCB0aGUgZGF0YXNldCBpdHNlbGYsIHNvIHRoaXMgaXMgYSBiYXJlIG1hcmtlciB2YXJpYW50IHRoYXQgZ3Jvd3Ncbi8vIGJ1aWxkX2hpc3RvZ3JhbSAvIGJ1aWxkX2JveHBsb3Qgc2libGluZ3MgbGF0ZXIuXG5leHBvcnQgY29uc3QgRGF0YVBsb3REb3RwbG90SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnYnVpbGRfZG90cGxvdCcpLFxufSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdERvdHBsb3RJbnRlcmFjdGlvbiA9IHouaW5mZXI8XG4gIHR5cGVvZiBEYXRhUGxvdERvdHBsb3RJbnRlcmFjdGlvblxuPjtcblxuLy8gYnVpbGRfaGlzdG9ncmFtOiB0aGUgc3R1ZGVudCBzZXRzIGVhY2ggYmFyJ3MgZnJlcXVlbmN5IHRvIHJlcHJvZHVjZSB0aGVcbi8vIGhpc3RvZ3JhbSBvZiBgZGF0YWAgKGJpbm5lZCBieSBjb25maWcuYmluV2lkdGggb3ZlciBbbWluLG1heF0pLiBTY29yZWRcbi8vIGFsbC1vci1ub3RoaW5nIG9uIGV4YWN0IHBlci1iaW4gaW50ZWdlci1mcmVxdWVuY3kgZXF1YWxpdHkgKGEgYmFyIGlzIGEgd2hvbGVcbi8vIGNvdW50IFx1MjAxNCBubyB0b2xlcmFuY2UpLCB0aGUgZnJlcXVlbmN5LWRpc3RyaWJ1dGlvbiB0d2luIG9mIGJ1aWxkX2RvdHBsb3QuIFRoZVxuLy8gY29ycmVjdCBoZWlnaHRzIGFyZSBDT01QVVRFRCBmcm9tIGBkYXRhYCwgc28gdGhpcyB0b28gaXMgYSBiYXJlIG1hcmtlciB2YXJpYW50LlxuZXhwb3J0IGNvbnN0IERhdGFQbG90SGlzdG9ncmFtSW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnYnVpbGRfaGlzdG9ncmFtJyksXG59KTtcbmV4cG9ydCB0eXBlIERhdGFQbG90SGlzdG9ncmFtSW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgRGF0YVBsb3RIaXN0b2dyYW1JbnRlcmFjdGlvblxuPjtcblxuLy8gYnVpbGRfYm94cGxvdDogdGhlIHN0dWRlbnQgZHJhZ3MgdGhlIGZpdmUtbnVtYmVyLXN1bW1hcnkgaGFuZGxlcyAobWluLCBRMSxcbi8vIG1lZGlhbiwgUTMsIG1heCkgdG8gYnVpbGQgdGhlIGJveCArIHdoaXNrZXJzIG9mIGBkYXRhYC4gU2NvcmVkIGFsbC1vci1ub3RoaW5nXG4vLyB3aXRoIGVhY2ggaGFuZGxlIHdpdGhpbiBgdG9sZXJhbmNlYCBsaW5lIHVuaXRzIG9mIHRoZSBjb21wdXRlZCBzdW1tYXJ5LiBVbmxpa2Vcbi8vIHRoZSBmcmVxdWVuY3kgYnVpbGRzIHRoaXMgY2FycmllcyBhIHRvbGVyYW5jZSBiZWNhdXNlIGJveCBwb3NpdGlvbnMgYXJlXG4vLyBjb250aW51b3VzIGFuZCB0aGUgdHdvIGNvbW1vbiBxdWFydGlsZSBtZXRob2RzIGNhbiBkaWZmZXIgYnkgYSBkYXRhIHBvaW50IG9uXG4vLyBldmVuLWxlbmd0aCBzZXRzIFx1MjAxNCB0aGUga2V5IHVzZXMgdGhlIFRJLTg0IGV4Y2x1c2l2ZS1tZWRpYW4gbWV0aG9kIChsb2NrZWQsXG4vLyBkZXNpZ24gZGVjaXNpb24gNCkgYW5kIHRoZSB0b2xlcmFuY2UgYWJzb3JicyB0aGUgYWRqYWNlbnQtbWV0aG9kIGFuc3dlci5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdEJveHBsb3RJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdidWlsZF9ib3hwbG90JyksXG4gIC8vIE1hdGNoIHJhZGl1cyBpbiBsaW5lIHVuaXRzLCBhcHBsaWVkIHRvIGVhY2ggb2YgdGhlIGZpdmUgaGFuZGxlcy4gRGVmYXVsdFxuICAvLyBoYWxmIGEgdW5pdCB0aWNrLlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuNSksXG59KTtcbmV4cG9ydCB0eXBlIERhdGFQbG90Qm94cGxvdEludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIERhdGFQbG90Qm94cGxvdEludGVyYWN0aW9uXG4+O1xuXG4vLyBEaXNjcmltaW5hdGVkIG9uIGB0eXBlYCBzbyBjb25zdW1lcnMgYnJhbmNoIHVuaWZvcm1seSBhbmQgdGhlIHdpcmUgZm9ybWF0XG4vLyBhbHdheXMgY2FycmllcyBpdC4gR3Jvd2luZyBhIHZhcmlhbnQgaXMgYSBuZXcgbWVtYmVyIGhlcmUgKyBhIG5ldyBzY29yZXJcbi8vIGJyYW5jaCBpbiB0aGUga2l0IFx1MjAxNCBubyBvdGhlciBibG9jayB0b3VjaGVkLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90SW50ZXJhY3Rpb24gPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb24sXG4gIERhdGFQbG90RG90cGxvdEludGVyYWN0aW9uLFxuICBEYXRhUGxvdEhpc3RvZ3JhbUludGVyYWN0aW9uLFxuICBEYXRhUGxvdEJveHBsb3RJbnRlcmFjdGlvbixcbl0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIERhdGFQbG90SW50ZXJhY3Rpb24+O1xuXG4vLyAtLS0tIFRoZSBibG9jayAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQXV0by1udW1iZXJlZCBsaWtlIHRoZSBvdGhlciBxdWVzdGlvbiBibG9ja3MgV0hFTiBHUkFERUQgXHUyMDE0IGEgYGRpc3BsYXlgXG4vLyBkYXRhX3Bsb3QgcHVsbHMgbm8gbnVtYmVyICh0aGUgcmVuZGVyZXIncyBpc051bWJlcmVkQmxvY2sgcmV0dXJucyBmYWxzZSBmb3Jcbi8vIGl0LCBleGFjdGx5IGFzIGl0IGRvZXMgZm9yIGEgZGlzcGxheSBpbnRlcmFjdGl2ZV9ncmFwaCkuIGhhc0NvbmZpZGVuY2VSYXRpbmdcbi8vICsgc2tpbGxzICsgc29sdXRpb24gZm9sbG93IHRoZSBzYW1lIG9wdC1pbiBwYXR0ZXJucyB0aGUgZ3JhcGggLyBudW1iZXItbGluZVxuLy8gYmxvY2tzIGVzdGFibGlzaGVkLCBhbmQgKGxpa2UgdGhlbSkgbWF0dGVyIG9ubHkgaW4gYnVpbGQgbW9kZS4gRGVsaWJlcmF0ZWx5XG4vLyBMRUFOIGZvciBzbGljZSAxIChubyBwYXJ0aWFsQ3JlZGl0IC8gbWlzdGFrZUZlZWRiYWNrKSBcdTIwMTQgYWxsLW9yLW5vdGhpbmdcbi8vIHNjb3JpbmcgKGRlY2lzaW9uIDgpOyB0aG9zZSBmaWVsZHMgYXJlIGFkZGl0aXZlIGxhdGVyIGlmIGFza2VkIGZvciAoWUFHTkkpLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90QmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdkYXRhX3Bsb3QnKSxcbiAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLi4ubGFiZWxGaWVsZHMsXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgLy8gVGhlIGRhdGFzZXQuIFNpbmdsZSBzb3VyY2Ugb2YgdHJ1dGg6IHRoZSBjaGFydCBpcyBkcmF3biBmcm9tIGl0IGFuZCwgaW5cbiAgLy8gYnVpbGQgbW9kZSwgdGhlIGNvcnJlY3QgYW5zd2VyIGlzIGRlcml2ZWQgZnJvbSBpdC4gTm9uLWVtcHR5LlxuICBkYXRhOiB6LmFycmF5KHoubnVtYmVyKCkpLm1pbigxKSxcbiAgY29uZmlnOiBEYXRhUGxvdENvbmZpZyxcbiAgaW50ZXJhY3Rpb246IERhdGFQbG90SW50ZXJhY3Rpb24sXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIGhhc0NvbmZpZGVuY2VSYXRpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIC8vIFZhcmlhYmxlIGJsb2NrIHNpemluZzogb3B0aW9uYWwgd2lkdGggZnJhY3Rpb24gKyBhbGlnbm1lbnQgKHNpemluZy50cykuXG4gIC8vIEFkZGl0aXZlL29wdGlvbmFsIFx1MjAxNCBubyBzY2hlbWFWZXJzaW9uIGJ1bXAuXG4gIC4uLnNpemluZ0ZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RCbG9jayA9IHouaW5mZXI8dHlwZW9mIERhdGFQbG90QmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBMZWFybmluZ09iamVjdGl2ZXNCbG9jayBcdTIwMTQgYSB0aXRsZWQgbGlzdCBvZiBsZWFybmluZyBvYmplY3RpdmVzLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEEgcHVyZSBDT05URU5UIGJsb2NrIChkYXRhLWJsb2NrLWNhdGVnb3J5PVwiY29udGVudFwiKTogbm9uLWludGVyYWN0aXZlLFxuLy8gbm9uLW51bWJlcmVkLCBubyBydW50aW1lIHdpcmluZywgbm8gc3VibWlzc2lvbiB3aXJlIGltcGFjdC4gUGVkYWdvZ2ljYWxseSBpdFxuLy8gZnJvbnRzIGFuIGFjdGl2aXR5IChvciBhIHNlY3Rpb24pIHdpdGggdGhlIFwic3R1ZGVudHMgd2lsbCBiZSBhYmxlIHRvXHUyMDI2XCIgZ29hbHNcbi8vIHRoYXQgU3dlbGxlci1zdHlsZSBzY2FmZm9sZGluZyBpcyBidWlsdCBhcm91bmQuXG4vL1xuLy8gU2hhcGU6IGFuIGVkaXRhYmxlIGB0aXRsZWAgKGRlZmF1bHRlZCwgYnV0IHRoZSB0ZWFjaGVyIGNhbiByZW5hbWUgaXQpIHBsdXMgYVxuLy8gbGlzdCBvZiBgaXRlbXNgLCBlYWNoIGEgcmljaCBpbmxpbmUgcnVuICh0ZXh0ICsgaW5saW5lIG1hdGggKyBtYXJrcykgXHUyMDE0IHRoZVxuLy8gc2FtZSBhbHBoYWJldCBwYXJhZ3JhcGhzIHVzZS4gSXRlbXMgbWFwIDE6MSB0byBlZGl0YWJsZSBwYXJhZ3JhcGhzIGluIHRoZVxuLy8gZWRpdG9yIE5vZGVWaWV3OyB0aGUgcmVuZGVyZXIgZW1pdHMgdGhlbSBhcyBhIDx1bD4uXG4vL1xuLy8gYGl0ZW1zYCBtYXkgYmUgZW1wdHk6IHRoZSBlZGl0b3IncyBjb250ZW50IHNwZWMga2VlcHMgYXQgbGVhc3Qgb25lIHBhcmFncmFwaFxuLy8gbGl2ZSwgYnV0IGEgc2VyaWFsaXplZCByb3VuZC10cmlwIGNhbiBsZWdpdGltYXRlbHkgcHJvZHVjZSBhbiBlbXB0eSBsaXN0XG4vLyAoZS5nLiBldmVyeSBpdGVtIGNsZWFyZWQpLCBhbmQgdGhhdCBtdXN0IG5vdCBmYWlsIHB1Ymxpc2ggdmFsaWRhdGlvbi5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBjb25zdCBMZWFybmluZ09iamVjdGl2ZXNCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2xlYXJuaW5nX29iamVjdGl2ZXMnKSxcbiAgdGl0bGU6IHouc3RyaW5nKCksXG4gIGl0ZW1zOiB6LmFycmF5KHouYXJyYXkoSW5saW5lTm9kZSkpLFxufSk7XG5leHBvcnQgdHlwZSBMZWFybmluZ09iamVjdGl2ZXNCbG9jayA9IHouaW5mZXI8dHlwZW9mIExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IFBhcmFncmFwaEJsb2NrIH0gZnJvbSAnLi9wYXJhZ3JhcGguanMnO1xuaW1wb3J0IHsgSGVhZGluZ0Jsb2NrIH0gZnJvbSAnLi9oZWFkaW5nLmpzJztcbmltcG9ydCB7IE1hdGhCbG9jayB9IGZyb20gJy4vbWF0aC1ibG9jay5qcyc7XG5pbXBvcnQgeyBJbWFnZUJsb2NrIH0gZnJvbSAnLi9pbWFnZS5qcyc7XG5pbXBvcnQgeyBCdWxsZXRMaXN0QmxvY2ssIE9yZGVyZWRMaXN0QmxvY2sgfSBmcm9tICcuL2xpc3QuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gV29ya2VkRXhhbXBsZUJsb2NrIFx1MjAxNCBhIHRpdGxlZCwgYm94ZWQgZnVsbHktd29ya2VkIGV4YW1wbGUgdG8gc3R1ZHkuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBwdXJlIENPTlRFTlQgYmxvY2sgKGRhdGEtYmxvY2stY2F0ZWdvcnk9XCJjb250ZW50XCIpOiBub24taW50ZXJhY3RpdmUsXG4vLyBub24tbnVtYmVyZWQsIG5vIHJ1bnRpbWUgd2lyaW5nLCBubyBzdWJtaXNzaW9uIHdpcmUgaW1wYWN0LiBEcmF3cyBvblxuLy8gU3dlbGxlcidzIGNvZ25pdGl2ZS1sb2FkIHRoZW9yeSBcdTIwMTQgYSB3b3JrZWQgZXhhbXBsZSBhIHN0dWRlbnQgcmVhZHMgYmVmb3JlXG4vLyBhdHRlbXB0aW5nIHRoZSBhbmFsb2dvdXMgcHJvYmxlbS5cbi8vXG4vLyBVbmxpa2UgYSBjYWxsb3V0IChpbmxpbmUtb25seSBib2R5KSwgYSB3b3JrZWQgZXhhbXBsZSBob2xkcyBORVNURUQgQkxPQ0tcbi8vIGNvbnRlbnQgc28gYSBtdWx0aS1zdGVwLCBtYXRoLWhlYXZ5IHNvbHV0aW9uIHJlbmRlcnMgcHJvcGVybHk6IHBhcmFncmFwaHMsXG4vLyBibG9jayBtYXRoLCBsaXN0cywgYW5kIGltYWdlcy4gVGhlIGNoaWxkIHVuaW9uIGlzIGRlbGliZXJhdGVseSBhIGN1cmF0ZWRcbi8vIHN1YnNldCBvZiB0aGUgQmxvY2sgdW5pb24gXHUyMDE0IGxlYWYgQ09OVEVOVCBibG9ja3Mgb25seS4gSXQgZXhjbHVkZXM6XG4vLyAgIC0gcXVlc3Rpb24gYmxvY2tzIChhIHdvcmtlZCBleGFtcGxlIGlzIGNvbnRlbnQsIG5ldmVyIHNjb3JlZCksXG4vLyAgIC0gY29sdW1ucyBhbmQgd29ya2VkX2V4YW1wbGUgaXRzZWxmIChzbyBuZXN0aW5nIHRlcm1pbmF0ZXMgXHUyMDE0IG5vIHJlY3Vyc2lvbixcbi8vICAgICB0aGUgc2FtZSBkaXNjaXBsaW5lIGFzIENvbHVtbkNlbGxCbG9jayBmb3JiaWRkaW5nIGNvbHVtbnMtaW4tY29sdW1ucykuXG4vLyBUaGlzIGFsc28ga2VlcHMgdGhlIGRhc2hib2FyZCBpbmRleCB1bnRvdWNoZWQ6IGEgd29ya2VkIGV4YW1wbGUgY2FuIG5ldmVyXG4vLyBjb250YWluIGEgcXVlc3Rpb24sIHNvIGJ1aWxkQWN0aXZpdHlJbmRleCBuZXZlciBuZWVkcyB0byByZWN1cnNlIGludG8gaXQuXG4vL1xuLy8gVGhlIHN1YnNldCBtYXRjaGVzIHRoZSBlZGl0b3ItbWFwcGFibGUgY29udGVudCBub2RlcyAxOjEgKFdvcmtlZEV4YW1wbGUudHMnc1xuLy8gY29udGVudCBleHByZXNzaW9uKSwgc28gc2VyaWFsaXplIHJvdW5kLXRyaXBzIHdpdGhvdXQgc2lsZW50bHkgZHJvcHBpbmcgYVxuLy8gY2hpbGQuIGBjb250ZW50YCBtYXkgYmUgZW1wdHkgZm9yIHRoZSBzYW1lIHJlYXNvbiBMZWFybmluZ09iamVjdGl2ZXMuaXRlbXNcbi8vIG1heSBiZSBcdTIwMTQgYW4gYWxsLXVubWFwcGFibGUgcm91bmQgdHJpcCAoZS5nLiBhIHNpbmdsZSBlbXB0eSBpbWFnZSkgbXVzdCBub3Rcbi8vIGZhaWwgcHVibGlzaCB2YWxpZGF0aW9uLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IFdvcmtlZEV4YW1wbGVDaGlsZCA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBQYXJhZ3JhcGhCbG9jayxcbiAgSGVhZGluZ0Jsb2NrLFxuICBNYXRoQmxvY2ssXG4gIEltYWdlQmxvY2ssXG4gIEJ1bGxldExpc3RCbG9jayxcbiAgT3JkZXJlZExpc3RCbG9jayxcbl0pO1xuZXhwb3J0IHR5cGUgV29ya2VkRXhhbXBsZUNoaWxkID0gei5pbmZlcjx0eXBlb2YgV29ya2VkRXhhbXBsZUNoaWxkPjtcblxuZXhwb3J0IGNvbnN0IFdvcmtlZEV4YW1wbGVCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ3dvcmtlZF9leGFtcGxlJyksXG4gIHRpdGxlOiB6LnN0cmluZygpLFxuICBjb250ZW50OiB6LmFycmF5KFdvcmtlZEV4YW1wbGVDaGlsZCksXG59KTtcbmV4cG9ydCB0eXBlIFdvcmtlZEV4YW1wbGVCbG9jayA9IHouaW5mZXI8dHlwZW9mIFdvcmtlZEV4YW1wbGVCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBQYXJhZ3JhcGhCbG9jayB9IGZyb20gJy4vcGFyYWdyYXBoLmpzJztcbmltcG9ydCB7IEhlYWRpbmdCbG9jayB9IGZyb20gJy4vaGVhZGluZy5qcyc7XG5pbXBvcnQgeyBNYXRoQmxvY2sgfSBmcm9tICcuL21hdGgtYmxvY2suanMnO1xuaW1wb3J0IHsgSW1hZ2VCbG9jayB9IGZyb20gJy4vaW1hZ2UuanMnO1xuaW1wb3J0IHsgQnVsbGV0TGlzdEJsb2NrLCBPcmRlcmVkTGlzdEJsb2NrIH0gZnJvbSAnLi9saXN0LmpzJztcbmltcG9ydCB7IEZpbGxJbkJsYW5rQmxvY2sgfSBmcm9tICcuL2ZpbGwtaW4tYmxhbmsuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRmFkZWRXb3JrZWRFeGFtcGxlQmxvY2sgXHUyMDE0IGEgc2NhZmZvbGRlZCAoXCJmYWRlZFwiKSB3b3JrZWQgZXhhbXBsZS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgaW50ZXJhY3RpdmUgc2libGluZyBvZiB3b3JrZWRfZXhhbXBsZSAoUmVua2wvQXRraW5zb24gY29tcGxldGlvblxuLy8gcHJvYmxlbXMpOiBlYXJseSBzdGVwcyBhcmUgZnVsbHkgc2hvd24sIGxhdGVyIHN0ZXBzIGFyZSBGQURFRCBcdTIwMTQgdGhlIHN0dWRlbnRcbi8vIGZpbGxzIHRoZW0gaW4uIFN0cnVjdHVyYWxseSBpdCdzIGEgd29ya2VkX2V4YW1wbGUgZnJhbWUgd2hvc2UgY2hpbGQgdW5pb25cbi8vIEFMU08gYWRtaXRzIGZpbGxfaW5fYmxhbmsgYmxvY2tzOiBhIHNob3duIHN0ZXAgaXMgYSBwYXJhZ3JhcGggLyBibG9jayBtYXRoIC9cbi8vIGxpc3QgLyBpbWFnZTsgYSBmYWRlZCBzdGVwIGlzIGEgZmlsbF9pbl9ibGFuayBibG9jayBjYXJyeWluZyB0aGUgYmxhbmtzLlxuLy9cbi8vIFJldXNlIG92ZXIgcmVpbnZlbnRpb24gKGRlY2lkZWQgYXQgZGVzaWduLCAyMDI2LTA3LTEyKTpcbi8vICAgLSBUaGUgZmFkZWQgc3RlcHMgQVJFIGZpbGxfaW5fYmxhbmsgYmxvY2tzLCBzbyB0aGUgcnVudGltZSBzY29yZXMgdGhlbSB3aXRoXG4vLyAgICAgWkVSTyBuZXcgcnVudGltZSBjb2RlIFx1MjAxNCBpbml0LnRzIGFscmVhZHkgc2NhbnMgZWFjaCAuYWN0aXZpdHktc2VjdGlvbiBmb3Jcbi8vICAgICBgW2RhdGEtYmxvY2stdHlwZT1cImZpbGxfaW5fYmxhbmtcIl1gIGFuZCBmaW5kcyBORVNURUQgb25lcy4gVGhleSByaWRlIHRoZVxuLy8gICAgIGV4aXN0aW5nIEJsYW5rUmVzcG9uc2UgbWFwLCBzbyB0aGVyZSBpcyBOTyBzdWJtaXNzaW9uIHdpcmUvc3RvcmFnZSBidW1wLlxuLy8gICAtIFNjb3JpbmcgcmlkZXMgdGhlIGNoaWxkIGJsYW5rczsgdGhpcyBmcmFtZSByZWFkcyBubyB0eXBlLXNwZWNpZmljXG4vLyAgICAgYXR0cmlidXRlcyBpdHNlbGYgXHUyMTkyIGl0IGlzIGEgQ09OVEFJTkVSIChsaWtlIGBwcm9ibGVtYCksIG5vdCBJTlRFUkFDVElWRS5cbi8vICAgLSBOdW1iZXJpbmcgKHJldmlzZWQgMjAyNi0wNy0xMyk6IHRoZSBXSE9MRSBib3ggaXMgb25lIG51bWJlcmVkIHByb2JsZW0gXHUyMDE0XG4vLyAgICAgaXRzIG51bWJlciBsZWFkcyB0aGUgdGl0bGUsIGFuZCB0aGUgZmFkZWQgZmlsbF9pbl9ibGFuayBzdGVwcyBhcmUgbGV0dGVyZWRcbi8vICAgICAoYSkvKGIpXHUyMDI2IExPQ0FMTFkgKHNob3dTdGVwTGFiZWxzIHRvZ2dsZXMgdGhlbSBvZmYpLCBzbyB0aGV5IG5vIGxvbmdlclxuLy8gICAgIGNvbnN1bWUgd29ya3NoZWV0IHByb2JsZW0gbnVtYmVycy4gU2VlIHJlbmRlckZhZGVkV29ya2VkRXhhbXBsZSBhbmQgdGhlXG4vLyAgICAgZWRpdG9yJ3MgcHJvYmxlbU51bWJlckF0ICh3aGljaCB0cmVhdHMgdGhlIGJveCBhcyBhdG9taWMpLiBUaGlzIHJldmVyc2VkXG4vLyAgICAgdGhlIG9yaWdpbmFsIFwic3RlcHMgbnVtYmVyIGFzIG9yZGluYXJ5IHByb2JsZW1zXCIgY2hvaWNlLCB3aGljaCB3YXN0ZWRcbi8vICAgICB3cml0aW5nL3ByaW50IHdpZHRoIGFuZCBwb2xsdXRlZCB0aGUgd29ya3NoZWV0J3MgbnVtYmVyaW5nLlxuLy9cbi8vIFRoZSBjaGlsZCB1bmlvbiBzdGlsbCBleGNsdWRlcyBxdWVzdGlvbnMgT1RIRVIgdGhhbiBmaWxsX2luX2JsYW5rLCBwbHVzXG4vLyBjb2x1bW5zIC8gd29ya2VkX2V4YW1wbGUgLyBmYWRlZF93b3JrZWRfZXhhbXBsZSBpdHNlbGYgXHUyMDE0IHNvIG5lc3Rpbmdcbi8vIHRlcm1pbmF0ZXMgYW5kIHRoZSBkYXNoYm9hcmQgaW5kZXggcmVjdXJzZXMgb25seSBvbmUgcHJlZGljdGFibGUgbGV2ZWwuXG4vLyBgY29udGVudGAgbWF5IGJlIGVtcHR5IGZvciB0aGUgc2FtZSByb3VuZC10cmlwLXNhZmV0eSByZWFzb24gYXNcbi8vIHdvcmtlZF9leGFtcGxlLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IEZhZGVkV29ya2VkRXhhbXBsZUNoaWxkID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFBhcmFncmFwaEJsb2NrLFxuICBIZWFkaW5nQmxvY2ssXG4gIE1hdGhCbG9jayxcbiAgSW1hZ2VCbG9jayxcbiAgQnVsbGV0TGlzdEJsb2NrLFxuICBPcmRlcmVkTGlzdEJsb2NrLFxuICBGaWxsSW5CbGFua0Jsb2NrLFxuXSk7XG5leHBvcnQgdHlwZSBGYWRlZFdvcmtlZEV4YW1wbGVDaGlsZCA9IHouaW5mZXI8dHlwZW9mIEZhZGVkV29ya2VkRXhhbXBsZUNoaWxkPjtcblxuZXhwb3J0IGNvbnN0IEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnZmFkZWRfd29ya2VkX2V4YW1wbGUnKSxcbiAgdGl0bGU6IHouc3RyaW5nKCksXG4gIGNvbnRlbnQ6IHouYXJyYXkoRmFkZWRXb3JrZWRFeGFtcGxlQ2hpbGQpLFxuICAvLyBUaGUgd2hvbGUgYm94IGlzIE9ORSBudW1iZXJlZCBwcm9ibGVtIChpdHMgbnVtYmVyIGxlYWRzIHRoZSB0aXRsZSk7IHRoZVxuICAvLyBmYWRlZCBmaWxsX2luX2JsYW5rIHN0ZXBzIGFyZSBsZXR0ZXJlZCAoYSksIChiKVx1MjAyNiBXSVRISU4gdGhlIGJveCBpbnN0ZWFkIG9mXG4gIC8vIGNvbnN1bWluZyB3b3Jrc2hlZXQgcHJvYmxlbSBudW1iZXJzLiBzaG93U3RlcExhYmVscyB0b2dnbGVzIHRob3NlIGxldHRlcnNcbiAgLy8gb2ZmIHBlciBib3ggKGJhcmUgYmxhbmtzLCBubyBndXR0ZXIpIGZvciB0ZWFjaGVycyB3aG8gd2FudCBtYXhpbXVtIHdyaXRpbmdcbiAgLy8gcm9vbS4gRGVmYXVsdGVkIHNvIHByZS1leGlzdGluZyBkb2N1bWVudHMgKG5vIGZpZWxkKSByZW5kZXIgbGFiZWxsZWQuXG4gIHNob3dTdGVwTGFiZWxzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxufSk7XG5leHBvcnQgdHlwZSBGYWRlZFdvcmtlZEV4YW1wbGVCbG9jayA9IHouaW5mZXI8dHlwZW9mIEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gU2VsZkV4cGxhbmF0aW9uQmxvY2sgXHUyMDE0IGFuIHVuZ3JhZGVkIGZyZWUtdGV4dCByZWZsZWN0aW9uIHByb21wdC5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBNZXRhY29nbml0aXZlIHNlbGYtZXhwbGFuYXRpb24gKENoaSBldCBhbC4pOiB0aGUgc3R1ZGVudCB3cml0ZXMgV0hZLCBpbiB0aGVpclxuLy8gb3duIHdvcmRzLiBEZWxpYmVyYXRlbHkgVU5HUkFERUQgKGF1dGhvciBkZWNpc2lvbiwgMjAyNi0wNy0xMikgXHUyMDE0IHRoZSBydW50aW1lXG4vLyBjYXB0dXJlcyB0aGUgdGV4dCBhbmQgdGhlIHRlYWNoZXIgZGFzaGJvYXJkIHNob3dzIGl0IHJhdzsgdGhlcmUgaXMgbm8gYW5zd2VyXG4vLyBrZXksIG5vIGNvcnJlY3QvaW5jb3JyZWN0LCBhbmQgaXQgbmV2ZXIgY29udHJpYnV0ZXMgdG8gdGhlIHNjb3JlLiBUaGlzIGtlZXBzXG4vLyBpdCBjbGVhciBvZiBQaGFzZSAyLjYgcnVicmljIGdyYWRpbmcuXG4vL1xuLy8gSXQgaXMgdGhlIEZJUlNUIGZyZWUtdGV4dCByZXNwb25zZSB0eXBlLCBzbyBpdCBpbnRyb2R1Y2VzIHRoZSBgZnJlZVJlc3BvbnNlc2Bcbi8vIG1hcCBvbiBTdWJtaXNzaW9uUmVzcG9uc2VzICh3aXJlIHY4IFx1MjE5MiB2OSkgXHUyMDE0IHRoZSBtYXAgbmFtZSB0aGUgc2NoZW1hIHJlc2VydmVkXG4vLyBmb3IgZXhhY3RseSB0aGlzIHNoYXBlLiBQaGFzZSAyLjYgc2hvcnRfYW5zd2VyIC8gZXNzYXkgcmV1c2UgdGhlIHNhbWUgbWFwIChhXG4vLyBzdHJpbmcgcGVyIGJsb2NrKSB3aXRoIG5vIGZ1cnRoZXIgd2lyZSBidW1wOyBncmFkaW5nLCB3aGVuIGl0IGxhbmRzLCBsaXZlcyBpblxuLy8gYSBzZXBhcmF0ZSB0YWJsZSwgbm90IGluIHRoZSByZXNwb25zZSBzaGFwZS5cbi8vXG4vLyBTaGFwZTogYSBgcHJvbXB0YCAocmljaCBpbmxpbmUgXHUyMDE0IHRleHQgKyBpbmxpbmUgbWF0aCArIG1hcmtzLCBsaWtlIGV2ZXJ5IG90aGVyXG4vLyBxdWVzdGlvbiBwcm9tcHQpIHBsdXMgYW4gb3B0aW9uYWwgYHBsYWNlaG9sZGVyYCAoYSBzZW50ZW5jZS1zdGFydGVyIC8gaGludFxuLy8gc2hvd24gaW4gdGhlIGVtcHR5IHRleHRhcmVhKS4gTm8gYW5zd2VyIGtleS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBjb25zdCBTZWxmRXhwbGFuYXRpb25CbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ3NlbGZfZXhwbGFuYXRpb24nKSxcbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICBwbGFjZWhvbGRlcjogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBTZWxmRXhwbGFuYXRpb25CbG9jayA9IHouaW5mZXI8dHlwZW9mIFNlbGZFeHBsYW5hdGlvbkJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gZnJlZS1yZXNwb25zZS50cyBcdTIwMTQgc2hvcnRfYW5zd2VyICsgZXNzYXkgKG1hbnVhbGx5LWdyYWRlZCBmcmVlIHRleHQpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIFBoYXNlIDIuNiBncmFkZWQgZnJlZS10ZXh0IHNpYmxpbmdzIG9mIHNlbGZfZXhwbGFuYXRpb24uIEFsbCB0aHJlZSB3cml0ZVxuLy8gdGhlaXIgc3R1ZGVudCB0ZXh0IGludG8gdGhlIFNBTUUgYGZyZWVSZXNwb25zZXNgIG1hcCAod2lyZSB2OSkgXHUyMDE0IHRoZSByZXNwb25zZVxuLy8gc2hhcGUgaXMgaWRlbnRpY2FsIChhIHN0cmluZyk7IHdoYXQgZGlmZmVycyBpcyBpbnRlbnQgKyBncmFkaW5nOlxuLy8gICAtIHNlbGZfZXhwbGFuYXRpb24gXHUyMDE0IHVuZ3JhZGVkIHJlZmxlY3Rpb24gKGFscmVhZHkgc2hpcHBlZCkuXG4vLyAgIC0gc2hvcnRfYW5zd2VyICAgICBcdTIwMTQgYSBicmllZiBncmFkZWQgcmVzcG9uc2UgKG1hbnVhbCBydWJyaWMgZ3JhZGluZywgMi42KS5cbi8vICAgLSBlc3NheSAgICAgICAgICAgIFx1MjAxNCBhIGxvbmcgZ3JhZGVkIHJlc3BvbnNlOyBhZGRzIG9wdGlvbmFsIHdvcmQtY291bnRcbi8vICAgICAgICAgICAgICAgICAgICAgICAgZ3VpZGFuY2UgKGEgdGFyZ2V0IHJhbmdlIHNob3duIGFzIGEgbGl2ZSBjb3VudGVyKS5cbi8vIEdyYWRpbmcgaXRzZWxmIGxpdmVzIGluIGEgc2VwYXJhdGUgYGdyYWRlc2AgdGFibGUgKFBoYXNlIDIuNiBsYXRlciBzbGljZXMpLFxuLy8gbmV2ZXIgaW4gdGhlIHN1Ym1pc3Npb24ganNvbmIgXHUyMDE0IGdyYWRlcyBhcmUgbXV0YWJsZSwgc3VibWlzc2lvbnMgYXJlIG5vdC4gVGhlc2Vcbi8vIGJsb2NrcyBjYXJyeSBOTyBhbnN3ZXIga2V5IGFuZCBhcmUgbmV2ZXIgYXV0by1zY29yZWQgYnkgdGhlIHJ1bnRpbWUuXG4vL1xuLy8gd29yZENvdW50SGludCAoZXNzYXkgb25seSk6IGFuIG9wdGlvbmFsIHttaW4/LCBtYXg/fSB0YXJnZXQuIFRoZSByZW5kZXJlclxuLy8gc2hvd3MgYSBsaXZlIHdvcmQgY291bnRlcjsgdGhlIGNvdW50IGl0c2VsZiBpcyBjb21wdXRlZC1vbi1yZWFkIChuZXZlciBzdG9yZWRcbi8vIGluIHRoZSB3aXJlIFx1MjAxNCBpdCdzIGRlcml2YWJsZSBmcm9tIHRoZSB0ZXh0KSwgc28gdGhpcyBpcyBkaXNwbGF5IGd1aWRhbmNlIG9ubHkuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vLyBPbmUgcnVicmljIGNyaXRlcmlvbjogYSBsYWJlbCAoXCJUaGVzaXMgY2xhcml0eVwiKSwgdGhlIHBvaW50cyBpdCdzIHdvcnRoLCBhbmRcbi8vIGFuIG9wdGlvbmFsIGRlc2NyaXB0aW9uIG9mIHdoYXQgZnVsbCBjcmVkaXQgbG9va3MgbGlrZS4gTGV2ZWxlZCBkZXNjcmlwdG9yXG4vLyBncmlkcyAoNC8zLzIvMSBjb2x1bW5zKSBhcmUgYSBmdXR1cmUgQURESVRJVkUgZXh0ZW5zaW9uIG9mIHRoaXMgc2hhcGUuXG5leHBvcnQgY29uc3QgUnVicmljQ3JpdGVyaW9uID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIGxhYmVsOiB6LnN0cmluZygpLm1pbigxKSxcbiAgbWF4UG9pbnRzOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkuZmluaXRlKCksXG4gIGRlc2NyaXB0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFJ1YnJpY0NyaXRlcmlvbiA9IHouaW5mZXI8dHlwZW9mIFJ1YnJpY0NyaXRlcmlvbj47XG5cbi8vIEEgYmxvY2sncyBncmFkaW5nIHJ1YnJpYy4gTGl2ZXMgSU4gdGhlIGRvY3VtZW50IChhdXRob3IgZGVjaXNpb24gMjAyNi0wNy0xMyxcbi8vIGRvY3MvZGVzaWduL21hbnVhbC1ncmFkaW5nLm1kKTogc3VibWlzc2lvbnMgcGluIHRvIGFjdGl2aXR5X3ZlcnNpb25zLCBzbyB0aGVcbi8vIGdyYWRpbmcgVUkgcmVhZHMgdGhlIGV4YWN0IHJ1YnJpYyB0aGUgc3R1ZGVudCB3YXMgYXNzZXNzZWQgYWdhaW5zdCBcdTIwMTQgdmVyc2lvblxuLy8gcGlubmluZyBJUyB0aGUgXCJydWJyaWMgZWRpdHMgYXBwbHkgcHJvc3BlY3RpdmVseVwiIG1lY2hhbmlzbS4gVGhlIHJlbmRlcmVyXG4vLyBuZXZlciBlbWl0cyBpdCAodGVhY2hlci1zaWRlIGRhdGE7IHN0YXlzIG91dCBvZiBzdHVkZW50IEhUTUwpLiBHcmFkZXNcbi8vIHRoZW1zZWx2ZXMgYXJlIG11dGFibGUgYW5kIGxpdmUgaW4gdGhlIGBncmFkZXNgIFRBQkxFLCBrZXllZCBieVxuLy8gKHN1Ym1pc3Npb25faWQsIGJsb2NrX2lkKSArIGNyaXRlcmlvbiBpZC5cbmV4cG9ydCBjb25zdCBSdWJyaWMgPSB6Lm9iamVjdCh7XG4gIGNyaXRlcmlhOiB6LmFycmF5KFJ1YnJpY0NyaXRlcmlvbikubWluKDEpLFxufSk7XG5leHBvcnQgdHlwZSBSdWJyaWMgPSB6LmluZmVyPHR5cGVvZiBSdWJyaWM+O1xuXG5leHBvcnQgY29uc3QgU2hvcnRBbnN3ZXJCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ3Nob3J0X2Fuc3dlcicpLFxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIHBsYWNlaG9sZGVyOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIHJ1YnJpYzogUnVicmljLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFNob3J0QW5zd2VyQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBTaG9ydEFuc3dlckJsb2NrPjtcblxuZXhwb3J0IGNvbnN0IFdvcmRDb3VudEhpbnQgPSB6XG4gIC5vYmplY3Qoe1xuICAgIG1pbjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gICAgbWF4OiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgfSlcbiAgLy8gR3VhcmQgYWdhaW5zdCBhbiBpbnZlcnRlZCByYW5nZSAobWluID4gbWF4KSBcdTIwMTQgYSBub25zZW5zZSBoaW50IHRoZSBlZGl0b3JcbiAgLy8gc2hvdWxkbid0IGJlIGFibGUgdG8gcHJvZHVjZSwgYnV0IHZhbGlkYXRpb24gaXMgdGhlIHNjaGVtYSdzIGpvYi5cbiAgLnJlZmluZShcbiAgICAoaCkgPT4gaC5taW4gPT09IHVuZGVmaW5lZCB8fCBoLm1heCA9PT0gdW5kZWZpbmVkIHx8IGgubWluIDw9IGgubWF4LFxuICAgIHsgbWVzc2FnZTogJ3dvcmRDb3VudEhpbnQubWluIG11c3QgYmUgXHUyMjY0IG1heCcgfSxcbiAgKTtcbmV4cG9ydCB0eXBlIFdvcmRDb3VudEhpbnQgPSB6LmluZmVyPHR5cGVvZiBXb3JkQ291bnRIaW50PjtcblxuZXhwb3J0IGNvbnN0IEVzc2F5QmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdlc3NheScpLFxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIHBsYWNlaG9sZGVyOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIHdvcmRDb3VudEhpbnQ6IFdvcmRDb3VudEhpbnQub3B0aW9uYWwoKSxcbiAgcnVicmljOiBSdWJyaWMub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgRXNzYXlCbG9jayA9IHouaW5mZXI8dHlwZW9mIEVzc2F5QmxvY2s+O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBibG9ja3MvaW5kZXgudHMgXHUyMDE0IEJsb2NrIGRpc2NyaW1pbmF0ZWQgdW5pb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTaW5nbGUgc291cmNlIG9mIHRydXRoIGZvciBcIndoYXQgYmxvY2sgdHlwZXMgZXhpc3QgaW4gUGhhc2UgMS5cIiBBZGRpbmcgYVxuLy8gbmV3IGJsb2NrIHR5cGUgbWVhbnM6IG5ldyBmaWxlIHVuZGVyIGJsb2Nrcy8sIG5ldyBlbnRyeSBoZXJlLCBuZXcgZmFjdG9yeVxuLy8gaW4gZmFjdG9yaWVzLnRzLCBuZXcgcmVuZGVyZXIgaW4gQGFjdGl2aXR5L3JlbmRlcmVyL2Jsb2Nrcy8uIFRocmVlIHBsYWNlcyxcbi8vIGFsd2F5cyBpbiB0aGF0IG9yZGVyLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5cbmltcG9ydCB7IFBhcmFncmFwaEJsb2NrIH0gZnJvbSAnLi9wYXJhZ3JhcGguanMnO1xuaW1wb3J0IHsgSGVhZGluZ0Jsb2NrIH0gZnJvbSAnLi9oZWFkaW5nLmpzJztcbmltcG9ydCB7IE1hdGhCbG9jayB9IGZyb20gJy4vbWF0aC1ibG9jay5qcyc7XG5pbXBvcnQgeyBJbWFnZUJsb2NrLCBDcm9wUmVjdCB9IGZyb20gJy4vaW1hZ2UuanMnO1xuaW1wb3J0IHsgQ2FsbG91dEJsb2NrIH0gZnJvbSAnLi9jYWxsb3V0LmpzJztcbmltcG9ydCB7IFByb2JsZW1CbG9jayB9IGZyb20gJy4vcHJvYmxlbS5qcyc7XG5pbXBvcnQgeyBGaWxsSW5CbGFua0Jsb2NrIH0gZnJvbSAnLi9maWxsLWluLWJsYW5rLmpzJztcbmltcG9ydCB7IEJ1bGxldExpc3RCbG9jaywgT3JkZXJlZExpc3RCbG9jaywgTGlzdEl0ZW0gfSBmcm9tICcuL2xpc3QuanMnO1xuaW1wb3J0IHsgSW50ZXJhY3RpdmVHcmFwaEJsb2NrIH0gZnJvbSAnLi9pbnRlcmFjdGl2ZS1ncmFwaC5qcyc7XG5pbXBvcnQgeyBNdWx0aXBsZUNob2ljZUJsb2NrIH0gZnJvbSAnLi9tdWx0aXBsZS1jaG9pY2UuanMnO1xuaW1wb3J0IHsgTWF0Y2hpbmdCbG9jayB9IGZyb20gJy4vbWF0Y2hpbmcuanMnO1xuaW1wb3J0IHsgT3JkZXJpbmdCbG9jayB9IGZyb20gJy4vb3JkZXJpbmcuanMnO1xuaW1wb3J0IHsgTnVtYmVyTGluZUJsb2NrIH0gZnJvbSAnLi9udW1iZXItbGluZS5qcyc7XG5pbXBvcnQgeyBEYXRhUGxvdEJsb2NrIH0gZnJvbSAnLi9kYXRhLXBsb3QuanMnO1xuaW1wb3J0IHsgTGVhcm5pbmdPYmplY3RpdmVzQmxvY2sgfSBmcm9tICcuL2xlYXJuaW5nLW9iamVjdGl2ZXMuanMnO1xuaW1wb3J0IHsgV29ya2VkRXhhbXBsZUJsb2NrIH0gZnJvbSAnLi93b3JrZWQtZXhhbXBsZS5qcyc7XG5pbXBvcnQgeyBHcmFwaEZpZ3VyZUJsb2NrIH0gZnJvbSAnLi9ncmFwaC1maWd1cmUuanMnO1xuaW1wb3J0IHsgRmFkZWRXb3JrZWRFeGFtcGxlQmxvY2sgfSBmcm9tICcuL2ZhZGVkLXdvcmtlZC1leGFtcGxlLmpzJztcbmltcG9ydCB7IFNlbGZFeHBsYW5hdGlvbkJsb2NrIH0gZnJvbSAnLi9zZWxmLWV4cGxhbmF0aW9uLmpzJztcbmltcG9ydCB7IFNob3J0QW5zd2VyQmxvY2ssIEVzc2F5QmxvY2sgfSBmcm9tICcuL2ZyZWUtcmVzcG9uc2UuanMnO1xuXG5leHBvcnQgY29uc3QgQmxvY2sgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgUGFyYWdyYXBoQmxvY2ssXG4gIEhlYWRpbmdCbG9jayxcbiAgTWF0aEJsb2NrLFxuICBJbWFnZUJsb2NrLFxuICBDYWxsb3V0QmxvY2ssXG4gIFByb2JsZW1CbG9jayxcbiAgRmlsbEluQmxhbmtCbG9jayxcbiAgQnVsbGV0TGlzdEJsb2NrLFxuICBPcmRlcmVkTGlzdEJsb2NrLFxuICBJbnRlcmFjdGl2ZUdyYXBoQmxvY2ssXG4gIE11bHRpcGxlQ2hvaWNlQmxvY2ssXG4gIE1hdGNoaW5nQmxvY2ssXG4gIE9yZGVyaW5nQmxvY2ssXG4gIE51bWJlckxpbmVCbG9jayxcbiAgRGF0YVBsb3RCbG9jayxcbiAgTGVhcm5pbmdPYmplY3RpdmVzQmxvY2ssXG4gIFdvcmtlZEV4YW1wbGVCbG9jayxcbiAgRmFkZWRXb3JrZWRFeGFtcGxlQmxvY2ssXG4gIFNlbGZFeHBsYW5hdGlvbkJsb2NrLFxuICBTaG9ydEFuc3dlckJsb2NrLFxuICBFc3NheUJsb2NrLFxuICBHcmFwaEZpZ3VyZUJsb2NrLFxuXSk7XG5leHBvcnQgdHlwZSBCbG9jayA9IHouaW5mZXI8dHlwZW9mIEJsb2NrPjtcblxuLy8gTk9URTogbGF5b3V0IGlzIE5PVCBhIGJsb2NrLiBSb3dzL0NvbHVtbnMgKHBhY2thZ2VzL3NjaGVtYS9zcmMvbGF5b3V0LnRzKSBhcmVcbi8vIHRoZSBzdHJ1Y3R1cmFsIGNvbnRhaW5lciBBQk9WRSBibG9ja3MgXHUyMDE0IGEgQ29sdW1uIGhvbGRzIEJsb2NrW10sIG5ldmVyIHRoZVxuLy8gcmV2ZXJzZSBcdTIwMTQgc28gdGhlIEJsb2NrIHVuaW9uIGlzIGxlYWYgYmxvY2tzIG9ubHkgYW5kIGNhbiBuZXZlciBuZXN0IGEgcm93LlxuXG4vLyBSZS1leHBvcnQgaW5kaXZpZHVhbCBibG9jayB0eXBlcyBzbyBjb25zdW1lcnMgY2FuIGltcG9ydCB0aGVtIGJ5IG5hbWUuXG5leHBvcnQge1xuICBQYXJhZ3JhcGhCbG9jayxcbiAgSGVhZGluZ0Jsb2NrLFxuICBNYXRoQmxvY2ssXG4gIEltYWdlQmxvY2ssXG4gIENyb3BSZWN0LFxuICBDYWxsb3V0QmxvY2ssXG4gIFByb2JsZW1CbG9jayxcbiAgRmlsbEluQmxhbmtCbG9jayxcbiAgQnVsbGV0TGlzdEJsb2NrLFxuICBPcmRlcmVkTGlzdEJsb2NrLFxuICBMaXN0SXRlbSxcbiAgSW50ZXJhY3RpdmVHcmFwaEJsb2NrLFxufTtcbmV4cG9ydCB7XG4gIE11bHRpcGxlQ2hvaWNlQmxvY2ssXG4gIE11bHRpcGxlQ2hvaWNlT3B0aW9uLFxuICBDaG9pY2VJbWFnZSxcbiAgQ2hvaWNlR3JhcGgsXG59IGZyb20gJy4vbXVsdGlwbGUtY2hvaWNlLmpzJztcbmV4cG9ydCB7IE1hdGNoaW5nQmxvY2ssIE1hdGNoaW5nSXRlbSwgTWF0Y2hpbmdUYXJnZXQgfSBmcm9tICcuL21hdGNoaW5nLmpzJztcbmV4cG9ydCB7IE9yZGVyaW5nQmxvY2ssIE9yZGVyaW5nSXRlbSB9IGZyb20gJy4vb3JkZXJpbmcuanMnO1xuZXhwb3J0IHtcbiAgTnVtYmVyTGluZUJsb2NrLFxuICBOdW1iZXJMaW5lQ29uZmlnLFxuICBOdW1iZXJMaW5lSW50ZXJhY3Rpb24sXG4gIE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uLFxuICBOdW1iZXJMaW5lSW50ZXJ2YWxJbnRlcmFjdGlvbixcbiAgTnVtYmVyTGluZUludGVydmFsLFxufSBmcm9tICcuL251bWJlci1saW5lLmpzJztcbmV4cG9ydCB7XG4gIERhdGFQbG90QmxvY2ssXG4gIERhdGFQbG90Q29uZmlnLFxuICBEYXRhUGxvdENoYXJ0LFxuICBEYXRhUGxvdEludGVyYWN0aW9uLFxuICBEYXRhUGxvdERpc3BsYXlJbnRlcmFjdGlvbixcbiAgRGF0YVBsb3REb3RwbG90SW50ZXJhY3Rpb24sXG4gIERhdGFQbG90SGlzdG9ncmFtSW50ZXJhY3Rpb24sXG4gIERhdGFQbG90Qm94cGxvdEludGVyYWN0aW9uLFxufSBmcm9tICcuL2RhdGEtcGxvdC5qcyc7XG5leHBvcnQgeyBMZWFybmluZ09iamVjdGl2ZXNCbG9jayB9IGZyb20gJy4vbGVhcm5pbmctb2JqZWN0aXZlcy5qcyc7XG5leHBvcnQgeyBXb3JrZWRFeGFtcGxlQmxvY2ssIFdvcmtlZEV4YW1wbGVDaGlsZCB9IGZyb20gJy4vd29ya2VkLWV4YW1wbGUuanMnO1xuZXhwb3J0IHsgR3JhcGhGaWd1cmVCbG9jayB9IGZyb20gJy4vZ3JhcGgtZmlndXJlLmpzJztcbmV4cG9ydCB7XG4gIEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrLFxuICBGYWRlZFdvcmtlZEV4YW1wbGVDaGlsZCxcbn0gZnJvbSAnLi9mYWRlZC13b3JrZWQtZXhhbXBsZS5qcyc7XG5leHBvcnQgeyBTZWxmRXhwbGFuYXRpb25CbG9jayB9IGZyb20gJy4vc2VsZi1leHBsYW5hdGlvbi5qcyc7XG5leHBvcnQge1xuICBTaG9ydEFuc3dlckJsb2NrLFxuICBFc3NheUJsb2NrLFxuICBXb3JkQ291bnRIaW50LFxuICBSdWJyaWMsXG4gIFJ1YnJpY0NyaXRlcmlvbixcbn0gZnJvbSAnLi9mcmVlLXJlc3BvbnNlLmpzJztcbmV4cG9ydCB7XG4gIEF4aXNDb25maWcsXG4gIFBvaW50SW50ZXJhY3Rpb24sXG4gIEZ1bmN0aW9uSW50ZXJhY3Rpb24sXG4gIEZ1bmN0aW9uTW9kZWwsXG4gIFJlZ2lvbkludGVyYWN0aW9uLFxuICBSYXlJbnRlcmFjdGlvbixcbiAgUmF5QW5zd2VyLFxuICBTZWdtZW50SW50ZXJhY3Rpb24sXG4gIFNlZ21lbnRBbnN3ZXIsXG4gIEVuZHBvaW50U3R5bGUsXG4gIERyYXdhYmxlLFxuICBEcmF3YWJsZUNvbG9yLFxuICBEaXNwbGF5SW50ZXJhY3Rpb24sXG4gIEdyYXBoSW50ZXJhY3Rpb24sXG59IGZyb20gJy4vaW50ZXJhY3RpdmUtZ3JhcGguanMnO1xuZXhwb3J0IHR5cGUgeyBIZWFkaW5nTGV2ZWwgfSBmcm9tICcuL2hlYWRpbmcuanMnO1xuZXhwb3J0IHR5cGUgeyBDYWxsb3V0VmFyaWFudCB9IGZyb20gJy4vY2FsbG91dC5qcyc7XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGxheW91dC50cyBcdTIwMTQgU3RydWN0dXJhbCBsYXlvdXQgbGF5ZXI6IFJvdyArIENvbHVtblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBkb2N1bWVudCBib2R5IGlzIGEgc3RhY2sgb2YgUk9XUy4gQSByb3cgbGF5cyBpdHMgY2hpbGQgY29sdW1ucyBzaWRlIGJ5XG4vLyBzaWRlOyBlYWNoIGNvbHVtbiBob2xkcyBpdHMgb3duIFNUQUNLIG9mIGJsb2NrcyAoYmxvY2srKS4gT25lIGNvbHVtbiBpcyB0aGVcbi8vIGlkZW50aXR5L2RlZmF1bHQgXHUyMDE0IGEgMS1jb2x1bW4gcm93IGlzIHRoZSBub3JtYWwgZnVsbC13aWR0aCB2ZXJ0aWNhbCBmbG93LCBhbmRcbi8vIFwiYWRkIGNvbHVtbnNcIiBzcGxpdHMgYSByb3cgaW50byBtb3JlIGNvbHVtbnMuIFRoaXMgcmVwbGFjZXMgdGhlIG9sZCBgY29sdW1uc2Bcbi8vIGJsb2NrIHR5cGU6IGxheW91dCBpcyBub3cgdGhlIHVuaXZlcnNhbCBjb250YWluZXIgaW5zdGVhZCBvZiBhbiBpbnNlcnRlZFxuLy8gYmxvY2ssIHdoaWNoIGlzIGhvdyBxdWFsaXR5IHByaW50IGVuZ2luZXMgKEluRGVzaWduLCBwcmludCBDU1MpIGFuZCB3ZWJcbi8vIGxheW91dCB0b29scyBtb2RlbCBhIGRvY3VtZW50LlxuLy9cbi8vIE5vIHJlY3Vyc2lvbjogYHJvd2AgYW5kIGBjb2x1bW5gIGFyZSBOT1QgbWVtYmVycyBvZiB0aGUgQmxvY2sgdW5pb24gKEJsb2NrIGlzXG4vLyBsZWFmIGJsb2NrcyBvbmx5KSwgc28gYSBDb2x1bW4ncyBgYmxvY2tzOiBCbG9ja1tdYCBjYW4gbmV2ZXIgY29udGFpbiBhIFJvdy5cbi8vIFRoZSBvbGQgY29sdW1ucy1pbi1jb2x1bW5zIGd1YXJkIChhbiBlbnVtZXJhdGVkIGNlbGwgdW5pb24pIGlzIHRoZXJlZm9yZSBhXG4vLyBzdHJ1Y3R1cmFsIGZhY3QgaGVyZSwgbm90IGFuIGVuZm9yY2VkIGV4Y2x1c2lvbi5cbi8vXG4vLyB3aWR0aCBpcyBhbiBvcHRpb25hbCB1bml0bGVzcyB3ZWlnaHQgcGVyIGNvbHVtbjogYSBjb2x1bW4gd2l0aCB3aWR0aCAyIGJlc2lkZVxuLy8gYSBjb2x1bW4gd2l0aCB3aWR0aCAxIHRha2VzIDIvMyBvZiB0aGUgcm93LiBBYnNlbnQgXHUyMTkyIGVxdWFsIHNwbGl0LiBUaGlzIGlzIHRoZVxuLy8gcmVhc29uIGxheW91dCBpcyBzdHJ1Y3R1cmFsIHJhdGhlciB0aGFuIGEgQ1NTIHRvZ2dsZSBcdTIwMTQgXCJ3aWRlIHdvcmtlZCBleGFtcGxlICtcbi8vIG5hcnJvdyBhbnN3ZXIgc3RyaXBcIiBuZWVkcyB1bmVxdWFsIHdpZHRocy5cbi8vXG4vLyBtaW5IZWlnaHQgaXMgYSByZXNlcnZlZCB3b3JrLXNwYWNlIGZsb29yIGluIHJlbS4gVGhlIGNlbGwgc3RpbGwgR1JPV1Mgd2l0aFxuLy8gY29udGVudCAoYSBmbG9vciwgbm90IGEgZml4ZWQgaGVpZ2h0IFx1MjAxNCBmaXhlZCBoZWlnaHRzIGJyZWFrIHByaW50IHJlZmxvdyBhbmRcbi8vIHRoZSBmb2xkYWJsZSdzIGhlaWdodCBtZWFzdXJlbWVudCkuIHJlbSBzbyB0aGUgcmVzZXJ2ZWQgc3BhY2Ugc2NhbGVzIHdpdGggdGhlXG4vLyBwcmludCBmb250LXNpemUgY29uZmlnLiBBYnNlbnQgPSBjb250ZW50LWRldGVybWluZWQgaGVpZ2h0LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5cbmltcG9ydCB7IEJsb2NrIH0gZnJvbSAnLi9ibG9ja3MvaW5kZXguanMnO1xuXG4vLyBncmlkTGluZXMgdHVybnMgYSByb3cgaW50byBhIHJ1bGVkIGdyaWQ6IGEgYm9yZGVyIGFyb3VuZCB0aGUgd2hvbGUgcm93LCBydWxlc1xuLy8gYmV0d2VlbiB0aGUgY2VsbHMsIGFuZCBydWxlcyBiZXR3ZWVuIHRoZSBzdGFja2VkIGJsb2NrcyB3aXRoaW4gYSBjZWxsLlxuLy8gRXNwZWNpYWxseSB1c2VmdWwgaW4gcHJpbnQgKGJveGVkIHJlZ2lvbnMgdG8gd3JpdGUgaW4gLyBjdXQgb3V0KS4gVHJpLXN0YXRlIHNvXG4vLyBhIHJvdyBjYW4gZGVmZXIgdG8gdGhlIGFjdGl2aXR5LXdpZGUgZGVmYXVsdDpcbi8vICAgJ2luaGVyaXQnIFx1MjAxNCBmb2xsb3cgbWV0YS5wcmludC5ncmlkTGluZXMgKHRoZSBhY3Rpdml0eSBkZWZhdWx0OyB0aGUgcmVuZGVyZXJcbi8vICAgICAgICAgICAgICAgcmVzb2x2ZXMgdGhpcykuIERlZmF1bHQsIHNvIGEgZnJlc2hseSBhdXRob3JlZCByb3cgdHJhY2tzIHRoZVxuLy8gICAgICAgICAgICAgICBhY3Rpdml0eSBzZXR0aW5nIHdpdGhvdXQgcGVyLXJvdyBmaWRkbGluZy5cbi8vICAgJ29uJyAgICAgIFx1MjAxNCBhbHdheXMgcnVsZWQsIHJlZ2FyZGxlc3Mgb2YgdGhlIGFjdGl2aXR5IGRlZmF1bHQuXG4vLyAgICdvZmYnICAgICBcdTIwMTQgbmV2ZXIgcnVsZWQsIHJlZ2FyZGxlc3Mgb2YgdGhlIGFjdGl2aXR5IGRlZmF1bHQuXG5leHBvcnQgY29uc3QgQ29sdW1uR3JpZExpbmVzID0gei5lbnVtKFsnaW5oZXJpdCcsICdvbicsICdvZmYnXSk7XG5leHBvcnQgdHlwZSBDb2x1bW5HcmlkTGluZXMgPSB6LmluZmVyPHR5cGVvZiBDb2x1bW5HcmlkTGluZXM+O1xuXG5leHBvcnQgY29uc3QgQ29sdW1uID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIC8vIFBlci1jb2x1bW4gd2lkdGggd2VpZ2h0IChmciB1bml0cykuIE9wdGlvbmFsOyBhYnNlbnQgPSBlcXVhbCBzcGxpdC5cbiAgd2lkdGg6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAvLyBSZXNlcnZlZCB3b3JrLXNwYWNlIGZsb29yIGluIHJlbSAoYSBtaW4taGVpZ2h0LCBub3QgYSBmaXhlZCBoZWlnaHQpLlxuICBtaW5IZWlnaHQ6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAvLyBBIGNvbHVtbiBob2xkcyBhIG5vbi1lbXB0eSBTVEFDSyBvZiBibG9ja3MgKGJsb2NrKykuIEEgY29sdW1uIGNhbiBob2xkIGFcbiAgLy8gaGVhZGluZyBmb2xsb3dlZCBieSBzZXZlcmFsIHByb2JsZW1zIFx1MjAxNCB0aGUgdGhpbmcgYSBkb2N1bWVudCB0b29sIG5lZWRzIGFuZFxuICAvLyBhIG9uZS1ibG9jay1wZXItcm93IG1vZGVsIGNhbid0IGV4cHJlc3MuXG4gIGJsb2Nrczogei5hcnJheShCbG9jaykubWluKDEpLFxufSk7XG5leHBvcnQgdHlwZSBDb2x1bW4gPSB6LmluZmVyPHR5cGVvZiBDb2x1bW4+O1xuXG4vLyAxLi42IGNvbHVtbnMuIFRoZSBlZGl0b3Igc3VyZmFjZXMgYSBub24tYmxvY2tpbmcgd2FybmluZyBhYm92ZSAzICh0b28gbmFycm93XG4vLyB0byByZWFkIG9uIHBhcGVyIG9yIGEgQ2hyb21lYm9vayksIGJ1dCB0aGUgc2NoZW1hIGFjY2VwdHMgdXAgdG8gNiBzbyBhblxuLy8gaW50ZW50aW9uYWwgZGVuc2UgbGF5b3V0IHN0aWxsIHZhbGlkYXRlcy4gT25lIGNvbHVtbiBpcyB0aGUgaWRlbnRpdHkgc3RhdGU6XG4vLyBhIGZ1bGwtd2lkdGggcm93IHRoYXQgXCJyZW1vdmUgY29sdW1uXCIgY2Fubm90IGRpc3NvbHZlIGJlbG93LlxuZXhwb3J0IGNvbnN0IFJvdyA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICBjb2x1bW5zOiB6LmFycmF5KENvbHVtbikubWluKDEpLm1heCg2KSxcbiAgZ3JpZExpbmVzOiBDb2x1bW5HcmlkTGluZXMuZGVmYXVsdCgnaW5oZXJpdCcpLFxufSk7XG5leHBvcnQgdHlwZSBSb3cgPSB6LmluZmVyPHR5cGVvZiBSb3c+O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBkb2N1bWVudC50cyBcdTIwMTQgVG9wLWxldmVsIEFjdGl2aXR5RG9jdW1lbnQgYW5kIFNlY3Rpb24gc2NoZW1hc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEFjdGl2aXR5RG9jdW1lbnQgaXMgd2hhdCBnZXRzIHN0b3JlZCBpbiBhY3Rpdml0aWVzLmRyYWZ0X2NvbnRlbnQgYW5kXG4vLyBhY3Rpdml0eV92ZXJzaW9ucy5jb250ZW50LiBUaGUgc2hhcGUgbGl2ZXMgaW4gdGhpcyBwYWNrYWdlIGFzIHRoZSBzaW5nbGVcbi8vIHNvdXJjZSBvZiB0cnV0aCBcdTIwMTQgdGhlIHJlbmRlcmVyIHBhcnNlcyBpdCwgdGhlIGVkaXRvciBwcm9kdWNlcyBpdCB2aWEgdGhlXG4vLyBzZXJpYWxpemUgbGF5ZXIsIHRoZSBkYXRhYmFzZSBzdG9yZXMgaXQgYXMganNvbmIuXG4vL1xuLy8gc2NoZW1hVmVyc2lvbiBpcyB0aGUgbWlncmF0aW9uIGFuY2hvci4gSXQgaXMgY3VycmVudGx5IDIuIFRoZSAxXHUyMTkyMiByZXNoYXBlXG4vLyAoYmxvY2stc3RyZWFtIHNlY3Rpb25zIFx1MjE5MiByb3dzLW9mLWNvbHVtbnMpIHdhcyBhIEdSRUVORklFTEQgSEFSRC1DVVQ6IHRoZXJlIHdhc1xuLy8gbm8gcHJvZHVjdGlvbiBkYXRhIHRvIHByZXNlcnZlLCBzbyB0aGVyZSBpcyBkZWxpYmVyYXRlbHkgTk8gbWlncmF0ZSgxXHUyMTkyMikgYW5kXG4vLyBOTyBtaWdyYXRlLW9uLXJlYWQgXHUyMDE0IHRoZSBwYXJzZXIgaXMgei5saXRlcmFsKDIpIGFuZCBSRUpFQ1RTIGEgdjEgZG9jdW1lbnRcbi8vIChhIHN0cmF5IHYxIGZhaWxzIGxvdWRseSBhdCBwYXJzZSByYXRoZXIgdGhhbiBtaXMtcGFyc2luZyBpbnRvIGdhcmJhZ2UpLlxuLy8gV2hlbiBhIEZVVFVSRSBzY2hlbWEgbmVlZHMgYSBub24tdHJpdmlhbCBtaWdyYXRpb24gYWdhaW5zdCByZWFsIHN0b3JlZCBkYXRhLFxuLy8gYnVtcCB0aGUgdmVyc2lvbiBhbmQgYWRkIGEgbWlncmF0ZShOIC0+IE4rMSkgdGhhdCBydW5zIG9uIHJlYWQgKG9sZFxuLy8gYWN0aXZpdHlfdmVyc2lvbnMgcm93cyBzdGF5IGF0IHRoZWlyIG9yaWdpbmFsIHNjaGVtYVZlcnNpb24gZm9yZXZlcjsgbWlncmF0ZVxuLy8gb24gcmVhZCwgbmV2ZXIgYnkgbXV0YXRpbmcgc3RvcmVkIHZlcnNpb25zKS4gVGhlIGdyZWVuZmllbGQgaGFyZC1jdXQgaXMgYVxuLy8gb25lLXRpbWUgZXhjZXB0aW9uLCBub3QgdGhlIGdlbmVyYWwgcG9saWN5LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBCbG9jayB9IGZyb20gJy4vYmxvY2tzL2luZGV4LmpzJztcbmltcG9ydCB7IFJvdyB9IGZyb20gJy4vbGF5b3V0LmpzJztcblxuLy8gU2VjdGlvbjogYSBjb2xsZWN0aW9uIG9mIFJPV1Mgd2l0aCBhbiBvcHRpb25hbCB0aXRsZS4gU2VjdGlvbnMgYXJlIHRoZVxuLy8gdmVydGljYWwgY2hlY2twb2ludCBwcmltaXRpdmU7IHJvd3MgYXJlIHRoZSBob3Jpem9udGFsLXNwbGl0IHByaW1pdGl2ZVxuLy8gKGxheW91dC50cykuIEEgc2VjdGlvbiBpcyB1c3VhbGx5IG9uZSAxLWNvbHVtbiByb3cgd2hvc2UgY29sdW1uIHN0YWNrcyBtYW55XG4vLyBibG9ja3M7IGEgY29sdW1uZWQgcmVnaW9uIGlzIGEgbXVsdGktY29sdW1uIHJvdy4gU2VjdGlvbnMgYXJlIG9yZ2FuaXphdGlvbmFsXG4vLyBvbmx5IFx1MjAxNCB0aGV5IGRvbid0IGNvbnN0cmFpbiBjb250ZW50IGJleW9uZCBob2xkaW5nIHJvd3MuXG4vL1xuLy8gaXNDaGVja3BvaW50IG1hcmtzIHRoaXMgc2VjdGlvbiBhcyBoYXZpbmcgYSBcIkNoZWNrIHRoaXMgc2VjdGlvblwiIGJ1dHRvbiBhdFxuLy8gaXRzIGJvdHRvbSBpbiB0aGUgcHVibGlzaGVkIEhUTUwuIE9ubHkgbWVhbmluZ2Z1bCB3aGVuIHRoZSBhY3Rpdml0eSdzXG4vLyBzdWJtaXNzaW9uTW9kZSBpcyAnbG9ja2VkJyBvciAnZnJlZScgKGlnbm9yZWQgaW4gJ3NpbmdsZScgbW9kZSBcdTIwMTQgbm9cbi8vIGNoZWNrcG9pbnQgYnV0dG9ucyByZW5kZXIgYW55d2hlcmUpLlxuZXhwb3J0IGNvbnN0IFNlY3Rpb24gPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDaGVja3BvaW50OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93czogei5hcnJheShSb3cpLFxufSk7XG5leHBvcnQgdHlwZSBTZWN0aW9uID0gei5pbmZlcjx0eXBlb2YgU2VjdGlvbj47XG5cbi8vIE1ldGE6IHRoZSBhY3Rpdml0eSdzIHRpdGxlLCBjb3Vyc2UsIHVuaXQsIGV0Yy4gTm90IHVzZWQgaW4gcmVuZGVyaW5nIG9mXG4vLyB0aGUgYm9keSBcdTIwMTQgZHJpdmVzIHRoZSBwdWJsaXNoZWQgSFRNTCdzIDx0aXRsZT4gYW5kIGhlYWRlciBiYW5uZXIuXG4vL1xuLy8gc3VibWlzc2lvbk1vZGUgY29udHJvbHMgdGhlIHN0dWRlbnQtZmFjaW5nIGZsb3c6XG4vLyAgICdzaW5nbGUnIFx1MjAxNCBvbmUgc3VibWl0IGF0IHRoZSBlbmQsIG5vIGNoZWNrcG9pbnRzICh0aGUgb3JpZ2luYWwgUGhhc2UgMSBtb2RlbClcbi8vICAgJ2xvY2tlZCcgXHUyMDE0IHBlci1zZWN0aW9uIGNoZWNrcG9pbnRzOyBpbnB1dHMgZnJlZXplIGFmdGVyIGVhY2ggc2VjdGlvbiBpcyBjaGVja2VkXG4vLyAgICdmcmVlJyAgIFx1MjAxNCBwZXItc2VjdGlvbiBjaGVja3BvaW50czsgc3R1ZGVudCBjYW4gcmV2aXNlIGFueSBjaGVja2VkIHNlY3Rpb24gZnJlZWx5XG4vL1xuLy8gcmV2aXNpb25Nb2RlIGNvbnRyb2xzIHBvc3Qtc3VibWlzc2lvbiBiZWhhdmlvcjpcbi8vICAgJ2ZyZWUnICAgXHUyMDE0IGFmdGVyIGZpbmFsIHN1Ym1pdCwgc3R1ZGVudCBjYW4gcmV2aXNlIGFuZCByZXN1Ym1pdCAobmV3IGF0dGVtcHQgcm93KVxuLy8gICAnbG9ja2VkJyBcdTIwMTQgZmluYWwgc3VibWl0IGlzIGZpbmFsOyBubyByZXN1Ym1pc3Npb25zXG4vLyByZXZpc2lvbk1vZGUgaXMgaWdub3JlZCB3aGVuIHN1Ym1pc3Npb25Nb2RlID09PSAnc2luZ2xlJy5cbi8vXG4vLyBncmFkaW5nTW9kZSBjb250cm9scyB3aG8gc2NvcmVzIHRoZSBhY3Rpdml0eTpcbi8vICAgJ2F1dG8nICAgXHUyMDE0IFBoYXNlIDEgZGVmYXVsdC4gUnVudGltZSBjb21wdXRlcyBzY29yZXMgY2xpZW50LXNpZGUgZnJvbVxuLy8gICAgICAgICAgICAgIGFuc3dlciBrZXlzIGJha2VkIGludG8gdGhlIHB1Ymxpc2hlZCBIVE1MLlxuLy8gICAnbWFudWFsJyBcdTIwMTQgUGhhc2UgMi42Ky4gTm8gYXV0by1zY29yaW5nOyBzdWJtaXNzaW9ucyBsYW5kIGluIHRoZVxuLy8gICAgICAgICAgICAgIHRlYWNoZXIgZGFzaGJvYXJkIHBlbmRpbmcgcnVicmljIGFwcGxpY2F0aW9uLlxuLy8gICAnbWl4ZWQnICBcdTIwMTQgUGhhc2UgMi42Ky4gU29tZSBibG9ja3MgYXV0by1ncmFkZWQsIHNvbWUgbWFudWFsbHkgZ3JhZGVkXG4vLyAgICAgICAgICAgICAgKGUuZy4sIDUgTUMgcXVlc3Rpb25zICsgMSBlc3NheSkuIEZpbmFsIHNjb3JlIGNvbWJpbmVzIGJvdGguXG4vLyBJbmVydCBpbiBQaGFzZSAxIFx1MjAxNCBubyBtYW51YWwtZ3JhZGVkIGJsb2NrIHR5cGVzIGV4aXN0IHlldCwgc28gdGhlXG4vLyBydW50aW1lIHRyZWF0cyAnbWFudWFsJy8nbWl4ZWQnIHRoZSBzYW1lIGFzICdhdXRvJyB1bnRpbCBQaGFzZSAyLjZcbi8vIGxhbmRzIHBlci1ibG9jayBncmFkaW5nIG1ldGFkYXRhLiBGaWVsZCBleGlzdHMgbm93IHNvIGV4aXN0aW5nIHN0b3JlZFxuLy8gZG9jdW1lbnRzIHBhcnNlIGNsZWFubHkgd2hlbiB0aG9zZSBibG9jayB0eXBlcyBhcnJpdmUuXG4vL1xuLy8gYWN0aXZpdHlUeXBlIGRyaXZlcyBwcmVzZW50YXRpb246IGFuIGV4aXRfdGlja2V0IHJlbmRlcnMgYXMgYSBzaW5nbGUtcGFnZVxuLy8gZm9jdXNlZCBsYXlvdXQ7IGEgd29ya3NoZWV0IHJlbmRlcnMgd2l0aCBmdWxsIHNlY3Rpb24gbmF2aWdhdGlvbjsgZXRjLlxuLy9cbi8vIGFuc3dlckZlZWRiYWNrIGNvbnRyb2xzIFdIRU4gYSBibGFuaydzIGNvcnJlY3QvaW5jb3JyZWN0IHNpZ25hbCAodGhlXG4vLyBncmVlbi9yZWQgYm9yZGVyICsgYXJpYS1pbnZhbGlkICsgdGFyZ2V0ZWQgbWlzdGFrZSBmZWVkYmFjaykgYmVjb21lc1xuLy8gdmlzaWJsZSB0byB0aGUgc3R1ZGVudDpcbi8vICAgJ2ltbWVkaWF0ZScgXHUyMDE0IHRoZSBibGFuayBzZWxmLWNoZWNrcyBvbiBibHVyLCBzbyB0aGUgc3R1ZGVudCBzZWVzXG4vLyAgICAgICAgICAgICAgICAgY29ycmVjdC9pbmNvcnJlY3QgYXMgc29vbiBhcyB0aGV5IGxlYXZlIHRoZSBmaWVsZC4gQVxuLy8gICAgICAgICAgICAgICAgIHNlbGYtY2hlY2sgcHJhY3RpY2UgZXhwZXJpZW5jZS5cbi8vICAgJ29uX2NoZWNrJyAgXHUyMDE0IGNvcnJlY3RuZXNzIGlzIGhpZGRlbiB1bnRpbCB0aGUgc3R1ZGVudCBjaGVja3MgdGhlIHNlY3Rpb25cbi8vICAgICAgICAgICAgICAgICAobG9ja2VkL2ZyZWUpIG9yIHN1Ym1pdHMgKHNpbmdsZSkuIEFuIGFzc2Vzc21lbnQtc3R5bGVcbi8vICAgICAgICAgICAgICAgICBleHBlcmllbmNlIHRoYXQgZG9lc24ndCBsZWFrIGFuc3dlcnMgYmVmb3JlIHRoZSBnYXRlLlxuLy8gT3J0aG9nb25hbCB0byBzdWJtaXNzaW9uTW9kZSBcdTIwMTQgYW55IGNoZWNrcG9pbnQgYmVoYXZpb3IgY2FuIHBhaXIgd2l0aFxuLy8gZWl0aGVyIGZlZWRiYWNrIHRpbWluZyAodGhlIHNhbWUgcmVhc29uIHJldmlzaW9uTW9kZSBpcyBpdHMgb3duIGZpZWxkKS5cbi8vIERlZmF1bHQgJ29uX2NoZWNrJzogdGhlIGNoZWNrcG9pbnQgbW9kZWwgaW1wbGllcyBcImFuc3dlciwgdGhlbiBjaGVja1wiLFxuLy8gYW5kIGxlYWtpbmcgY29ycmVjdG5lc3Mgb24gYmx1ciB1bmRlcmN1dCB0aGF0LiBOT1RFIHRoZSBydW50aW1lIGRlZmF1bHRzIGFcbi8vIE1JU1NJTkcgYW5zd2VyRmVlZGJhY2sgKGFjdGl2aXRpZXMgcHVibGlzaGVkIGJlZm9yZSB0aGlzIGZpZWxkIGV4aXN0ZWQpIHRvXG4vLyAnaW1tZWRpYXRlJywgcHJlc2VydmluZyB0aGVpciBvcmlnaW5hbCBiZWhhdmlvciBcdTIwMTQgdGhlIHNjaGVtYSBkZWZhdWx0IGFuZFxuLy8gdGhlIHJ1bnRpbWUgYmFjay1jb21wYXQgZmFsbGJhY2sgZGlmZmVyIG9uIHB1cnBvc2UuXG4vL1xuLy8gc2tpbGxzIGlzIGFuIGFycmF5IG9mIHVuaXZlcnNhbCBza2lsbCB0YWdzIGRlc2NyaWJpbmcgd2hhdCB0aGUgYWN0aXZpdHlcbi8vIHRlYWNoZXMuIEFjdGlvbi1vcmllbnRlZCwgZnJhbWV3b3JrLW5ldXRyYWw6IFwic2ltcGxpZnlpbmcgcmF0aW9uYWxcbi8vIGV4cHJlc3Npb25zXCIsIFwiZmFjdG9yaW5nIHF1YWRyYXRpY3NcIiwgXCJncmFwaGluZyBwYXJhYm9sYXNcIi4gQSB0ZWFjaGVyIHdob1xuLy8gd2FudHMgdG8gdXNlIFRFS1Mgb3IgQ0NTUyBjb2RlcyBjYW4gXHUyMDE0IHRoZSBmaWVsZCBkb2Vzbid0IHZhbGlkYXRlIGFnYWluc3Rcbi8vIGFueSBmcmFtZXdvcmsuIFBoYXNlIDUgbWFya2V0cGxhY2UgYWRkcyBjb250cm9sbGVkIHZvY2FidWxhcnkgb24gdG9wLlxuLy9cbi8vIHByaW50IGlzIHRoZSB0ZWFjaGVyLWNvbmZpZ3VyYWJsZSBwcmludCBsYXllciAoc2VlIFByaW50Q29uZmlnIGJlbG93KS4gSXRcbi8vIGlzIGFsd2F5cyBwcmVzZW50IGFmdGVyIHBhcnNlIChkZWZhdWx0IHt9KSwgc28gZXZlcnkgY29uc3VtZXIgY2FuIHJlYWRcbi8vIGRvYy5tZXRhLnByaW50Liogd2l0aG91dCBhbiB1bmRlZmluZWQgY2hlY2s7IGRvY3VtZW50cyBzdG9yZWQgYmVmb3JlIHRoaXNcbi8vIGZpZWxkIGV4aXN0ZWQgZ2V0IHRoZSBkZWZhdWx0cyBhcHBsaWVkIG9uIHJlYWQuIFRoZSBkZWZhdWx0cyBrZWVwIHRoZVxuLy8gU3RhZ2UgMTEgYmFzZWxpbmUgcGFnZSBnZW9tZXRyeSAoc2luZ2xlIGNvbHVtbiwgMC41aW4gbWFyZ2luLCBsZXR0ZXIpIGFuZFxuLy8gYWRkIHRoZSBwcmludCB0eXBvZ3JhcGh5IFN0YWdlIDExIGRlbGliZXJhdGVseSBkZWZlcnJlZCB0byB0aGlzIGZlYXR1cmVcbi8vICgxMXB0IGJvZHksIDFyZW0gcHJvYmxlbSBzcGFjaW5nKSBcdTIwMTQgc28gYSBmcmVzaGx5IHB1Ymxpc2hlZCBwYWdlIHByaW50cyBpbiBhXG4vLyBzZW5zaWJsZSBkZWZhdWx0IHN0eWxlLCBhbmQgdGhlIHRlYWNoZXIgdHVuZXMgZnJvbSB0aGVyZS5cblxuLy8gUHJpbnRIZWFkZXI6IHdoaWNoIGxhYmVsZWQgZmlsbC1pbiBsaW5lcyBhcHBlYXIgYXQgdGhlIHRvcCBvZiBhIHByaW50ZWRcbi8vIHNoZWV0LiBOYW1lICsgRGF0ZSBhcmUgdGhlIG5lYXItdW5pdmVyc2FsIHBhaXIsIHNvIHRoZXkgZGVmYXVsdCBvbjsgdGhlXG4vLyByZXN0IGRlZmF1bHQgb2ZmLiBjdXN0b20gaG9sZHMgZXh0cmEgdGVhY2hlci1hdXRob3JlZCBsYWJlbHMgKGUuZy5cbi8vIFwiQmxvY2tcIiwgXCJUZWFjaGVyXCIpIHJlbmRlcmVkIGFzIHRoZWlyIG93biBmaWxsLWluIGxpbmVzLiBUaGUgaGVhZGVyIGlzXG4vLyBwcmludC1vbmx5IFx1MjAxNCBpdCBuZXZlciBzaG93cyBvbiBzY3JlZW4gKHRoZSBvbi1zY3JlZW4gaWRlbnRpdHkgcHJvbXB0IGlzIHRoZVxuLy8gbGl2ZSBuYW1lIGZpZWxkKTsgc2VlIHJlbmRlclByaW50SGVhZGVyICsgdGhlIEBtZWRpYSBwcmludCBydWxlcy5cbmV4cG9ydCBjb25zdCBQcmludEhlYWRlciA9IHoub2JqZWN0KHtcbiAgbmFtZTogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGU6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2Q6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmU6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VzdG9tOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBQcmludEhlYWRlciA9IHouaW5mZXI8dHlwZW9mIFByaW50SGVhZGVyPjtcblxuLy8gUHJpbnRDb25maWc6IHRoZSB0ZWFjaGVyJ3MgcHJpbnQgc2V0dGluZ3MgZm9yIGFuIGFjdGl2aXR5LiBFdmVyeSBmaWVsZCBpc1xuLy8gZGVmYXVsdGVkIHNvIFByaW50Q29uZmlnLnBhcnNlKHt9KSB5aWVsZHMgYSBjb21wbGV0ZSwgYmFzZWxpbmUtZXF1aXZhbGVudFxuLy8gY29uZmlnIFx1MjAxNCB0aGF0IGlzIHdoYXQgQWN0aXZpdHlNZXRhLnByaW50IGZhbGxzIGJhY2sgdG8uXG4vL1xuLy8gICBwYXBlclNpemUgICAgICBcdTIwMTQgJ2xldHRlcicgfCAnYTQnLiBEcml2ZXMgdGhlIEBwYWdlIHNpemUga2V5d29yZC4gRGVmYXVsdFxuLy8gICAgICAgICAgICAgICAgICAgIGxldHRlciBmb3Igbm93IChOWi9BNCBpcyBhIG9uZS1saW5lIGZsaXAgbGF0ZXIpOyBlbWl0dGVkXG4vLyAgICAgICAgICAgICAgICAgICAgYXMgYSBMSVRFUkFMIEBwYWdlIHJ1bGUsIG5ldmVyIGEgQ1NTIHZhciwgYmVjYXVzZSBAcGFnZVxuLy8gICAgICAgICAgICAgICAgICAgIHJ1bGVzIGNhbm5vdCByZWxpYWJseSByZWFkIGN1c3RvbSBwcm9wZXJ0aWVzLlxuLy8gICBjb2x1bW5zICAgICAgICBcdTIwMTQgMS4uMy4gY29sdW1uLWNvdW50IGluIHByaW50OyAxIGlzIGEgbm8tb3AgKHNpbmdsZSBjb2wpLlxuLy8gICAgICAgICAgICAgICAgICAgIERPUk1BTlQ6IHRoZSBhdXRob3ItZmFjaW5nIGNvbnRyb2wgd2FzIHJldGlyZWQgd2hlblxuLy8gICAgICAgICAgICAgICAgICAgIHN0cnVjdHVyYWwgYXV0aG9yZWQgY29sdW1ucyAodGhlIFJvdy9Db2x1bW4gbGF5b3V0XG4vLyAgICAgICAgICAgICAgICAgICAgcHJpbWl0aXZlKSBsYW5kZWQgXHUyMDE0IGEgbXVsdGktY29sdW1uIHJvdyByZW5kZXJzIGNvbnNpc3RlbnRseVxuLy8gICAgICAgICAgICAgICAgICAgIG9uIHNjcmVlbiwgaW4gd29ya3NoZWV0IHByaW50LCBhbmQgaW5zaWRlIGEgZm9sZGFibGUsIHNvXG4vLyAgICAgICAgICAgICAgICAgICAgdGhpcyBwZXItbW9kZSBwcmludCBzZXR0aW5nIGJlY2FtZSByZWR1bmRhbnQuIFRoZSBmaWVsZCArXG4vLyAgICAgICAgICAgICAgICAgICAgaXRzIHJlbmRlcmVyIHZhci9DU1MgYXJlIGtlcHQgKG5vdCBkZWxldGVkKSBzbyB2YWx1ZXNcbi8vICAgICAgICAgICAgICAgICAgICBhbHJlYWR5IHNhdmVkIG9uIGV4aXN0aW5nIGFjdGl2aXRpZXMga2VlcCBwcmludGluZyBhc1xuLy8gICAgICAgICAgICAgICAgICAgIGF1dGhvcmVkLCBhbmQgc28gdGhlIGNvbnRyb2wgY2FuIGJlIHJlLWV4cG9zZWQgbGF0ZXIgd2l0aFxuLy8gICAgICAgICAgICAgICAgICAgIG5vIHNjaGVtYS9yZW5kZXJlciBjaGFuZ2UuIE5ldyBhY3Rpdml0aWVzIGRlZmF1bHQgdG8gMS5cbi8vICAgd29ya1NwYWNlICAgICAgXHUyMDE0IHJlbSBvZiBibGFuayBzcGFjZSBiZWxvdyBlYWNoIHByb2JsZW0gZm9yIGhhbmQtd29ya2luZy5cbi8vICAgICAgICAgICAgICAgICAgICBBY3Rpdml0eS1sZXZlbCBkZWZhdWx0OyBhIGZpbGwtaW4tYmxhbmsgYmxvY2sgbWF5IG92ZXJyaWRlXG4vLyAgICAgICAgICAgICAgICAgICAgaXQgcGVyLXByb2JsZW0gdmlhIEZpbGxJbkJsYW5rQmxvY2sud29ya1NwYWNlLlxuLy8gICBmb250U2l6ZSAgICAgICBcdTIwMTQgcHQuIEFwcGxpZWQgdG8gLmFjdGl2aXR5LWNvbnRhaW5lciBpbiBwcmludCBvbmx5LlxuLy8gICBwcm9ibGVtU3BhY2luZyBcdTIwMTQgcmVtIG9mIHZlcnRpY2FsIG1hcmdpbiBhcm91bmQgZWFjaCBwcm9ibGVtIGluIHByaW50LlxuLy8gICBtYXJnaW4gICAgICAgICBcdTIwMTQgaW5jaGVzLiBUaGUgQHBhZ2UgbWFyZ2luIChsaXRlcmFsLCBsaWtlIHBhcGVyU2l6ZSkuXG4vLyAgIGdyaWRMaW5lcyAgICAgIFx1MjAxNCBhY3Rpdml0eS13aWRlIGRlZmF1bHQgZm9yIHJ1bGVkIHJvd3MuIEEgUm93IHdpdGhcbi8vICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6J2luaGVyaXQnICh0aGUgcGVyLXJvdyBkZWZhdWx0KSByZXNvbHZlcyB0byB0aGlzO1xuLy8gICAgICAgICAgICAgICAgICAgICdvbicvJ29mZicgb24gYSByb3cgb3ZlcnJpZGUgaXQuIE9mZiBieSBkZWZhdWx0IFx1MjAxNCBydWxlZFxuLy8gICAgICAgICAgICAgICAgICAgIGdyaWRzIGFyZSBvcHQtaW4uXG4vLyAgIHByaW50UmVmZXJlbmNlUGFuZWwgXHUyMDE0IHdoZXRoZXIgdGhlIGFjdGl2aXR5J3MgcmVmZXJlbmNlIHBhbmVsIHByaW50cyBhcyBhXG4vLyAgICAgICAgICAgICAgICAgICAgYm94IGF0IHRoZSB0b3Agb2YgdGhlIHdvcmtzaGVldC4gT24gYnkgZGVmYXVsdDsgYSB0ZWFjaGVyXG4vLyAgICAgICAgICAgICAgICAgICAgd2l0aCBhIGNsYXNzIHNldCBvZiBjaGFydHMgY2FuIHR1cm4gaXQgb2ZmIHNvIGl0IGlzbid0XG4vLyAgICAgICAgICAgICAgICAgICAgcmVwcmludGVkIHBlciBhY3Rpdml0eS4gVGhlIG9uLVNDUkVFTiByZWZlcmVuY2UgdG9vbGJhciBpc1xuLy8gICAgICAgICAgICAgICAgICAgIHVuYWZmZWN0ZWQgXHUyMDE0IHRoaXMgZ2F0ZXMgcHJpbnQgYWxvbmUuIFJlYWQgYnkgdGhlIHJlbmRlcmVyXG4vLyAgICAgICAgICAgICAgICAgICAgdG8gZGVjaWRlIHdoZXRoZXIgdG8gZW1pdCB0aGUgcHJpbnQgYm94OyBub3QgYSBjb250YWluZXJcbi8vICAgICAgICAgICAgICAgICAgICBDU1MgdmFyLlxuLy8gICBwcmludERlZmluaXRpb25HbG9zc2FyeSBcdTIwMTQgd2hldGhlciBpbmxpbmUgdm9jYWJ1bGFyeSBkZWZpbml0aW9ucyBwcmludCBhcyBhXG4vLyAgICAgICAgICAgICAgICAgICAgZ2xvc3NhcnkgYXBwZW5kaXggYXQgdGhlIEVORCBvZiB0aGUgd29ya3NoZWV0LiBPRkYgYnlcbi8vICAgICAgICAgICAgICAgICAgICBkZWZhdWx0LCB1bmxpa2UgcHJpbnRSZWZlcmVuY2VQYW5lbDogb24gc2NyZWVuIGEgZGVmaW5pdGlvblxuLy8gICAgICAgICAgICAgICAgICAgIGlzIGEgcG9wb3ZlciBhIHN0dWRlbnQgb3BlbnMgb24gZGVtYW5kLCBhbmQgbW9zdCBhcmUgYVxuLy8gICAgICAgICAgICAgICAgICAgIHNob3J0IGdsb3NzIHRoYXQgd291bGQgb25seSBwYWQgdGhlIHByaW50b3V0LiBBIHRlYWNoZXIgd2hvXG4vLyAgICAgICAgICAgICAgICAgICAgaGFzIHB1dCBhIGZvcm11bGEgb3IgYSBkaWFncmFtIGluIGEgZGVmaW5pdGlvbiB0dXJucyB0aGlzXG4vLyAgICAgICAgICAgICAgICAgICAgb24gc28gaXQgc3Vydml2ZXMgb24gcGFwZXIgKGRlZmluaXRpb24gcG9wb3ZlcnMgYXJlXG4vLyAgICAgICAgICAgICAgICAgICAgZGlzcGxheTpub25lIGluIHByaW50KS4gUmVhZCBieSB0aGUgcmVuZGVyZXIgdG8gZGVjaWRlXG4vLyAgICAgICAgICAgICAgICAgICAgd2hldGhlciB0byBlbWl0IHRoZSBhcHBlbmRpeDsgbm90IGEgY29udGFpbmVyIENTUyB2YXIuXG4vLyAgIGhlYWRlciAgICAgICAgIFx1MjAxNCBzZWUgUHJpbnRIZWFkZXIuXG4vL1xuLy8gY29sdW1ucy93b3JrU3BhY2UvZm9udFNpemUvcHJvYmxlbVNwYWNpbmcgcmlkZSBhcyAtLXByaW50LSogQ1NTIHZhcnMgb24gdGhlXG4vLyBjb250YWluZXIgKG5vcm1hbCBzZWxlY3RvcnMgY2FuIHJlYWQgdGhlbSk7IHBhcGVyU2l6ZS9tYXJnaW4gYXJlIGVtaXR0ZWQgYXNcbi8vIGEgcGVyLWRvY3VtZW50IGxpdGVyYWwgQHBhZ2UgcnVsZS4gZ3JpZExpbmVzIGlzIG5vdCBhIGNvbnRhaW5lciB2YXIgXHUyMDE0IGl0IGlzXG4vLyByZXNvbHZlZCBwZXIgcm93IGF0IHJlbmRlciB0aW1lIChzZWUgcmVuZGVyUm93KS5cbmV4cG9ydCBjb25zdCBQcmludENvbmZpZyA9IHoub2JqZWN0KHtcbiAgcGFwZXJTaXplOiB6LmVudW0oWydsZXR0ZXInLCAnYTQnXSkuZGVmYXVsdCgnbGV0dGVyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uczogei5udW1iZXIoKS5pbnQoKS5taW4oMSkubWF4KDMpLmRlZmF1bHQoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya1NwYWNlOiB6Lm51bWJlcigpLm1pbigwKS5kZWZhdWx0KDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkuZGVmYXVsdCgxMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvYmxlbVNwYWNpbmc6IHoubnVtYmVyKCkubWluKDApLmRlZmF1bHQoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiB6Lm51bWJlcigpLm1pbigwKS5kZWZhdWx0KDAuNSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZExpbmVzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmludFJlZmVyZW5jZVBhbmVsOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaW50RGVmaW5pdGlvbkdsb3NzYXJ5OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXI6IFByaW50SGVhZGVyLmRlZmF1bHQoe30pLFxufSk7XG5leHBvcnQgdHlwZSBQcmludENvbmZpZyA9IHouaW5mZXI8dHlwZW9mIFByaW50Q29uZmlnPjtcblxuLy8gVHlwb2dyYXBoeTogdGhlIGFjdGl2aXR5LXdpZGUgZm9udCArIGJhc2UgYm9keSBzaXplIChhdXRob3ItYXBwcm92ZWRcbi8vIDIwMjYtMDctMDgpLiBPTkUgZm9udCBhbmQgT05FIGJhc2Ugc2l6ZSBmb3IgdGhlIHdob2xlIGFjdGl2aXR5IFx1MjAxNCBwdWJsaXNoZWRcbi8vIHBhZ2UsIGVkaXRvciBjYW52YXMsIGFuZCBwcmludCB2aWV3IGFsbCByZWFkIHRoZSBzYW1lIGNvbmZpZyBzbyBhdXRob3JpbmcgaXNcbi8vIFdZU0lXWUcuIE9wdGlvbmFsIGFuZCBhZGRpdGl2ZTogZG9jdW1lbnRzIHN0b3JlZCBiZWZvcmUgdGhpcyBmaWVsZCBleGlzdGVkXG4vLyBwYXJzZSB1bmNoYW5nZWQgKG5vIHNjaGVtYVZlcnNpb24gYnVtcCksIGFuZCB0aGUgZWRpdG9yIG9taXRzIHRoZSBmaWVsZFxuLy8gZW50aXJlbHkgd2hpbGUgaXQgaG9sZHMgdGhlIGRlZmF1bHRzIHNvIHVudG91Y2hlZCBkb2N1bWVudHMgc3RheVxuLy8gc3RydWN0dXJhbGx5IGlkZW50aWNhbC5cbi8vXG4vLyAgIGZvbnQgICAgIFx1MjAxNCBhbiBpZCBpbnRvIHRoZSByZW5kZXJlcidzIEZPTlRfUkVHSVNUUlkgKHRoZSBDU1Mgc3BlY2lmaWNzIFx1MjAxNFxuLy8gICAgICAgICAgICAgIGZhbWlseSBuYW1lLCBmYWxsYmFjayBzdGFjaywgV09GRjIgZmlsZXMgXHUyMDE0IGxpdmUgcmVuZGVyZXItc2lkZTtcbi8vICAgICAgICAgICAgICB0aGUgc2NoZW1hIG9ubHkgY29uc3RyYWlucyB0aGUgbWVudSkuICdkZWZhdWx0JyA9IHRoZSBjdXJyZW50XG4vLyAgICAgICAgICAgICAgc3lzdGVtIHN0YWNrLCBubyBmb250IGRvd25sb2FkLiBUaGUgb3RoZXIgZm91ciBhcmUgU0lMIE9GTFxuLy8gICAgICAgICAgICAgIGZhY2VzIHNlbGYtaG9zdGVkIGFzIFdPRkYyIG9uIFIyIChubyBHb29nbGUgQ0ROIGRlcGVuZGVuY3kgb25cbi8vICAgICAgICAgICAgICBwdWJsaXNoZWQgcGFnZXMpLlxuLy8gICBmb250U2l6ZSBcdTIwMTQgYmFzZSBCT0RZIHNpemUgaW4gcHgsIGFwcGxpZWQgb24gc2NyZWVuIHZpYVxuLy8gICAgICAgICAgICAgIC0tYWN0aXZpdHktZm9udC1zaXplLiBQcmludCBib2R5IHNpemluZyBzdGF5cyBvd25lZCBieVxuLy8gICAgICAgICAgICAgIG1ldGEucHJpbnQuZm9udFNpemUgKHB0KSBcdTIwMTQgdGhlIEBtZWRpYSBwcmludCBydWxlIG92ZXJyaWRlcyB0aGVcbi8vICAgICAgICAgICAgICBzY3JlZW4gc2l6ZSwgc28gdGhlIHR3byBuZXZlciBmaWdodC4gSGVhZGluZ3MgYXJlIGVtLXJlbGF0aXZlXG4vLyAgICAgICAgICAgICAgYW5kIHNjYWxlIG9mZiB3aGljaGV2ZXIgYmFzZSBpcyBpbiBlZmZlY3QuXG4vL1xuLy8gUGVyLXNwYW4gZm9udC9zaXplIG1hcmtzIGFyZSBQQVJLRUQgYnV0IGRlc2lnbmVkIGZvcjogdGhpcyBhY3Rpdml0eS13aWRlXG4vLyBsYXllciBvbmx5IHNldHMgQ1NTIHZhcnMgKyBAZm9udC1mYWNlLCBzbyBhIGZ1dHVyZSBgdGV4dFN0eWxlYCBtYXJrIGNhblxuLy8gc2xvdCBpbiBhZGRpdGl2ZWx5IChzcGFuLWxldmVsIGlubGluZSBzdHlsZXMgd2luIHRoZSBjYXNjYWRlOyB0aGVcbi8vIHJlbmRlcmVyJ3MgZm9udEZhY2VDc3MgYWxyZWFkeSB0YWtlcyBhIExJU1Qgb2YgZmFtaWxpZXMgdG8gZW1iZWQpLlxuZXhwb3J0IGNvbnN0IEFjdGl2aXR5Rm9udCA9IHouZW51bShbXG4gICdkZWZhdWx0JyxcbiAgJ2xleGVuZCcsXG4gICdhdGtpbnNvbi1oeXBlcmxlZ2libGUnLFxuICAnYW5kaWthJyxcbiAgJ2NvbWljLW5ldWUnLFxuXSk7XG5leHBvcnQgdHlwZSBBY3Rpdml0eUZvbnQgPSB6LmluZmVyPHR5cGVvZiBBY3Rpdml0eUZvbnQ+O1xuXG5leHBvcnQgY29uc3QgVHlwb2dyYXBoeSA9IHoub2JqZWN0KHtcbiAgZm9udDogQWN0aXZpdHlGb250LmRlZmF1bHQoJ2RlZmF1bHQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogei5udW1iZXIoKS5taW4oMTIpLm1heCgyNCkuZGVmYXVsdCgxNiksXG59KTtcbmV4cG9ydCB0eXBlIFR5cG9ncmFwaHkgPSB6LmluZmVyPHR5cGVvZiBUeXBvZ3JhcGh5PjtcblxuZXhwb3J0IGNvbnN0IEFjdGl2aXR5TWV0YSA9IHoub2JqZWN0KHtcbiAgdGl0bGU6IHouc3RyaW5nKCkubWluKDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdXJzZTogei5zdHJpbmcoKS5kZWZhdWx0KCdBbGdlYnJhIElJJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pdDogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pc3Npb25Nb2RlOiB6LmVudW0oWydzaW5nbGUnLCAnbG9ja2VkJywgJ2ZyZWUnXSkuZGVmYXVsdCgnZnJlZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldmlzaW9uTW9kZTogei5lbnVtKFsnZnJlZScsICdsb2NrZWQnXSkuZGVmYXVsdCgnZnJlZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyYWRpbmdNb2RlOiB6LmVudW0oWydhdXRvJywgJ21hbnVhbCcsICdtaXhlZCddKS5kZWZhdWx0KCdhdXRvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZpdHlUeXBlOiB6LmVudW0oWyd3b3Jrc2hlZXQnLCAnZXhpdF90aWNrZXQnLCAnd2FybV91cCcsICdyZXZpZXcnXSkuZGVmYXVsdCgnd29ya3NoZWV0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyRmVlZGJhY2s6IHouZW51bShbJ2ltbWVkaWF0ZScsICdvbl9jaGVjayddKS5kZWZhdWx0KCdvbl9jaGVjaycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmludDogUHJpbnRDb25maWcuZGVmYXVsdCh7fSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwb2dyYXBoeTogVHlwb2dyYXBoeS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBBY3Rpdml0eU1ldGEgPSB6LmluZmVyPHR5cGVvZiBBY3Rpdml0eU1ldGE+O1xuXG4vLyBUaGUgdG9wLWxldmVsIGRvY3VtZW50LiBBbHdheXMgdmFsaWRhdGUgdXNlci1mYWNpbmcgaW5wdXQgdGhyb3VnaCB0aGlzXG4vLyBiZWZvcmUgc3RvcmluZy4gVGhlIEVkZ2UgRnVuY3Rpb25zIHBhcnNlIGluY29taW5nIGRyYWZ0cyB3aXRoIHRoaXMgc2NoZW1hXG4vLyBhbmQgcmVqZWN0IG1hbGZvcm1lZCBkb2N1bWVudHMgd2l0aCBhIDQwMC5cbi8vIFJlZmVyZW5jZVBhbmVsOiBvcHRpb25hbCBzdGlja3ktc2lkZWJhciBjb250ZW50IHN0dWRlbnRzIGNvbnN1bHQgd2hpbGVcbi8vIHdvcmtpbmcgXHUyMDE0IGZvcm11bGEgY2hhcnRzLCBwZXJpb2RpYyB0YWJsZXMsIHZvY2FidWxhcnkgbGlzdHMsIGNvbnZlcnNpb25cbi8vIHRhYmxlcywgdW5pdC1jaXJjbGUgZGlhZ3JhbXMsIHNlbnRlbmNlLXN0ZW0gcHJvbXB0cywgZm9yZWlnbi1sYW5ndWFnZVxuLy8gdmVyYiB0YWJsZXMsIHByaW1hcnktc291cmNlIGV4Y2VycHRzLCBtYXBzLiBUaGUgYmxvY2tzIGFycmF5IHVzZXMgdGhlXG4vLyBzYW1lIEJsb2NrIHNjaGVtYSBhcyBzZWN0aW9uIGNvbnRlbnQ7IG5vIG5ldyBibG9jayB0eXBlcyBhcmUgbmVlZGVkXG4vLyBmb3IgdGhlIHBhbmVsLlxuLy9cbi8vIFBoYXNlIDE6IHRoZSBzY2hlbWEgYWNjZXB0cyB0aGUgZmllbGQgYXMgZm9yd2FyZC1jb21wYXQ7IHRoZSBlZGl0b3Jcbi8vIGRvZXNuJ3Qgc3VyZmFjZSBpdCwgYW5kIHRoZSByZW5kZXJlciBpZ25vcmVzIGl0LiBQaGFzZSAyIHdpcmVzIHVwIHRoZVxuLy8gYXV0aG9yaW5nIFVJIGFuZCB0aGUgc2lkZWJhciBsYXlvdXQgaW4gcHVibGlzaGVkIEhUTUwuIEZpZWxkIGlzXG4vLyBvcHRpb25hbCB3aXRoIG5vIGRlZmF1bHQgb24gQWN0aXZpdHlEb2N1bWVudCwgc28gZXhpc3Rpbmcgc3RvcmVkXG4vLyBkb2N1bWVudHMgcGFyc2UgY2xlYW5seS5cbi8vXG4vLyBSZW5kZXJlciB3aWxsIHRyZWF0IHJlZmVyZW5jZSBjb250ZW50IGFzIGRhdGEtYmxvY2stY2F0ZWdvcnk9XCJzY2FmZm9sZFwiXG4vLyAoUGhhc2UgMispIFx1MjAxNCBkb2Vzbid0IGNvbnRyaWJ1dGUgdG8gc2NvcmluZyBvciBjaGVja3BvaW50IGJlaGF2aW9yLlxuZXhwb3J0IGNvbnN0IFJlZmVyZW5jZVBhbmVsID0gei5vYmplY3Qoe1xuICB0aXRsZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tzOiB6LmFycmF5KEJsb2NrKSxcbn0pO1xuZXhwb3J0IHR5cGUgUmVmZXJlbmNlUGFuZWwgPSB6LmluZmVyPHR5cGVvZiBSZWZlcmVuY2VQYW5lbD47XG5cbi8vIENhbGN1bGF0b3IgdG9vbDogYW4gYWN0aXZpdHktbGV2ZWwgc2NhZmZvbGQsIGEgc2libGluZyB0byB0aGUgcmVmZXJlbmNlXG4vLyBwYW5lbCBcdTIwMTQgYSB0ZWFjaGVyLWNvbmZpZ3VyYWJsZSBvbi1zY3JlZW4gY2FsY3VsYXRvciBhIHN0dWRlbnQgc3VtbW9ucyB3aGlsZVxuLy8gd29ya2luZyAobGlrZSB0aGUgY2FsY3VsYXRvciBhbGxvd2VkIG9uIGEgZGlnaXRhbCBTQVQpLiBJdCBpcyBORVZFUiBzY29yZWQsXG4vLyBwcm9kdWNlcyBubyBzdWJtaXNzaW9uLCBhbmQgY2FycmllcyBubyBhbnN3ZXIga2V5OyB0aGUgcmVuZGVyZXIgdHJlYXRzIGl0IGFzXG4vLyBkYXRhLWJsb2NrLWNhdGVnb3J5PVwic2NhZmZvbGRcIiAob3V0c2lkZSBhbnkgLmFjdGl2aXR5LXNlY3Rpb24sIHNvIHRoZSBzY29yaW5nXG4vLyBydW50aW1lIG5ldmVyIHNlZXMgaXQpLiBJdCB0cmF2ZWxzIGluIHRoZSB3aXJlIGZvcm1hdCwgY29uZmlndXJlZCBvbmNlIHBlclxuLy8gYWN0aXZpdHksIGFuZCBpcyBvcHRpb25hbCBzbyBleGlzdGluZyBzdG9yZWQgZG9jdW1lbnRzIHBhcnNlIHVuY2hhbmdlZCBcdTIwMTQgbm9cbi8vIHNjaGVtYVZlcnNpb24gYnVtcCAoc2FtZSBmb3J3YXJkLWNvbXBhdCBzdG9yeSBhcyByZWZlcmVuY2VQYW5lbC9wcmludCkuXG4vL1xuLy8gUmVzdHJpY3Rpb25zIGFyZSBQRVJNSVNTSVZFIGJ5IGRlZmF1bHQ6IGFuIGVuYWJsZWQtYnV0LXVuY29uZmlndXJlZFxuLy8gY2FsY3VsYXRvciBpcyBhIGZ1bGwgdG9vbDsgdGVhY2hlcnMgb3B0IElOVE8gcmVzdHJpY3Rpb25zLCBuZXZlciBvdXQgb2Zcbi8vIGNhcGFiaWxpdHkuIExhdGVyIGZsYWdzIChsb2NrVmlld3BvcnQsIGFsbG93ZWRSZWdyZXNzaW9uTW9kZWxzLFxuLy8gbWF4RXhwcmVzc2lvbnNcdTIwMjYpIGFyZSBhZGRlZCBhZGRpdGl2ZWx5IGFzIGdyYXBoaW5nLXRyYWNrIHN0YWdlcyBsYW5kIFx1MjAxNCBhbGxcbi8vIG9wdGlvbmFsL2RlZmF1bHRlZCwgc28gc3RpbGwgbm8gc2NoZW1hVmVyc2lvbiBidW1wLlxuLy9cbi8vIGBtb2RlYCBpcyB0aGUgY2FwYWJpbGl0eSBjZWlsaW5nLiBUaGUgZW51bSBjYXJyaWVzIHRoZSBmdWxsIGNvbnRyYWN0IG5vdywgYnV0XG4vLyB0aGUgZGVmYXVsdCBpcyAnc2NpZW50aWZpYycgYmVjYXVzZSB0aGF0IGlzIHRoZSBvbmx5IGNhcGFiaWxpdHkgU3RhZ2UgMVxuLy8gaW1wbGVtZW50cyBcdTIwMTQgYW4gZW5hYmxlZCBjYWxjdWxhdG9yIGRvZXMgZXhhY3RseSB3aGF0IGlzIGJ1aWx0LiBUaGUgZGVmYXVsdFxuLy8gbWF5IGZsaXAgdG8gJ2dyYXBoaW5nJyBvbmNlIHRoZSBib2FyZCBsYXllciBsYW5kcyAoU3RhZ2UgMikuXG4vLyBTdGFnZSAzOiB3aGljaCBmaXQgbW9kZWxzIHRoZSBncmFwaGluZyBjYWxjdWxhdG9yJ3MgZGF0YS9yZWdyZXNzaW9uIHBhbmVsXG4vLyBvZmZlcnMuIFBlcm1pc3NpdmUgZGVmYXVsdCAoYWxsIHRocmVlKTsgYW4gRU1QVFkgYXJyYXkgdHVybnMgcmVncmVzc2lvbiBvZmZcbi8vIGVudGlyZWx5IChubyBkYXRhIHBhbmVsKS4gT25seSBtZWFuaW5nZnVsIHVuZGVyIG1vZGUgJ2dyYXBoaW5nJyBcdTIwMTQgdGhlXG4vLyAnc2NpZW50aWZpYycgY2VpbGluZyBhbHJlYWR5IGV4Y2x1ZGVzIHRoZSBib2FyZCB0aGUgZml0cyBkcmF3IG9uLlxuLy8gJ2xvZ2FyaXRobWljJyBqb2luZWQgMjAyNi0wNy0xMSAoY2FsY3VsYXRvci1wYXJpdHkgYmF0Y2gpOiB0aGUga2l0IGNvbXB1dGVkXG4vLyBsb2cgZml0cyBhbGwgYWxvbmc7IHRoZSBlbnVtIHdhcyB0aGUgb25seSBnYXAuIE5PVEUgYSBzdG9yZWQgZG9jIHRoYXQgY2Fycmllc1xuLy8gdGhlIGV4cGxpY2l0IHRocmVlLW1vZGVsIGFycmF5IHN0YXlzIHRocmVlLW1vZGVsIChpbmRpc3Rpbmd1aXNoYWJsZSBmcm9tIGFcbi8vIGRlbGliZXJhdGUgcmVzdHJpY3Rpb24pIHVudGlsIHRoZSB0ZWFjaGVyIHRvdWNoZXMgdGhlIGNvbmZpZyBcdTIwMTQgYWNjZXB0ZWQgYXRcbi8vIHRoZSBkZXNpZ24gcGFzczsgdGhlIHBlcm1pc3NpdmUgZGVmYXVsdCBvbmx5IGFwcGxpZXMgd2hlbiB0aGUgZmllbGQgaXMgYWJzZW50LlxuZXhwb3J0IGNvbnN0IFJlZ3Jlc3Npb25Nb2RlbCA9IHouZW51bShbXG4gICdsaW5lYXInLFxuICAncXVhZHJhdGljJyxcbiAgJ2V4cG9uZW50aWFsJyxcbiAgJ2xvZ2FyaXRobWljJyxcbl0pO1xuZXhwb3J0IHR5cGUgUmVncmVzc2lvbk1vZGVsID0gei5pbmZlcjx0eXBlb2YgUmVncmVzc2lvbk1vZGVsPjtcblxuZXhwb3J0IGNvbnN0IENhbGN1bGF0b3JSZXN0cmljdGlvbnMgPSB6Lm9iamVjdCh7XG4gIG1vZGU6IHouZW51bShbJ3NjaWVudGlmaWMnLCAnZ3JhcGhpbmcnXSkuZGVmYXVsdCgnc2NpZW50aWZpYycpLFxuICBhbGxvd1RyaWc6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gIGFsbG93TG9nRXhwOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAvLyBJbmVxdWFsaXR5IHJvd3MgaW4gdGhlIGdyYXBoaW5nIGV4cHJlc3Npb24gbGlzdCAoY2FsY3VsYXRvci1wYXJpdHkgYmF0Y2gpLlxuICAvLyBBZGRpdGl2ZSArIGRlZmF1bHRlZCBsaWtlIHRoZSBvdGhlciBnYXRlcyBcdTIwMTQgbm8gc2NoZW1hVmVyc2lvbiBidW1wOyB0aGUga2l0XG4gIC8vIHJlYWRzIGEgbWlzc2luZyB2YWx1ZSBhcyBwZXJtaXNzaXZlLCBzbyBvbGQgcHVibGlzaGVkIHBhZ2VzIHN0YXkgZnVsbC10b29sLlxuICBhbGxvd0luZXF1YWxpdGllczogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgYWxsb3dlZFJlZ3Jlc3Npb25Nb2RlbHM6IHpcbiAgICAuYXJyYXkoUmVncmVzc2lvbk1vZGVsKVxuICAgIC5kZWZhdWx0KFsnbGluZWFyJywgJ3F1YWRyYXRpYycsICdleHBvbmVudGlhbCcsICdsb2dhcml0aG1pYyddKSxcbiAgLy8gU3RhZ2UgNDogY2FwIG9uIHRoZSBncmFwaGluZyBleHByZXNzaW9uIGxpc3QuIEFCU0VOVCA9IHVubGltaXRlZCAodGhlXG4gIC8vIHBlcm1pc3NpdmUgZGVmYXVsdCBcdTIwMTQgb3B0aW9uYWwsIG5vdCBkZWZhdWx0ZWQsIHNvIGl0IHN0YXlzIG91dCBvZiBzdG9yZWRcbiAgLy8gZG9jcyB1bmxlc3MgYSB0ZWFjaGVyIHNldHMgaXQpLiBHcmFwaGluZyBtb2RlIG9ubHkuXG4gIG1heEV4cHJlc3Npb25zOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoNTApLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIENhbGN1bGF0b3JSZXN0cmljdGlvbnMgPSB6LmluZmVyPHR5cGVvZiBDYWxjdWxhdG9yUmVzdHJpY3Rpb25zPjtcblxuZXhwb3J0IGNvbnN0IENhbGN1bGF0b3JUb29sID0gei5vYmplY3Qoe1xuICBlbmFibGVkOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgcmVzdHJpY3Rpb25zOiBDYWxjdWxhdG9yUmVzdHJpY3Rpb25zLmRlZmF1bHQoe30pLFxufSk7XG5leHBvcnQgdHlwZSBDYWxjdWxhdG9yVG9vbCA9IHouaW5mZXI8dHlwZW9mIENhbGN1bGF0b3JUb29sPjtcblxuLy8gVGhlIGV4cGxpY2l0IHR5cGUgKyB6LlpvZFR5cGUgYW5ub3RhdGlvbiAoaW5zdGVhZCBvZiB6LmluZmVyKSBleGlzdHMgYmVjYXVzZVxuLy8gdGhlIGZ1bGx5IGluZmVycmVkIGRvY3VtZW50IHR5cGUgb3V0Z3JldyB0c2MncyBkZWNsYXJhdGlvbi1zZXJpYWxpemF0aW9uXG4vLyBsaW1pdCAoVFM3MDU2KSB3aGVuIHRoZSBCbG9jayB1bmlvbiByZWFjaGVkIDE0IG1lbWJlcnMuIFN0cnVjdHVyYWxseVxuLy8gaWRlbnRpY2FsIHRvIHdoYXQgaW5mZXJlbmNlIHByb2R1Y2VkOyBub3RoaW5nIGhlcmUgbG9zZXMgdHlwZSBzYWZldHkgXHUyMDE0XG4vLyB0aGUgYW5ub3RhdGlvbiBpcyBjaGVja2VkIGFnYWluc3QgdGhlIG9iamVjdCBzY2hlbWEuXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2aXR5RG9jdW1lbnQge1xuICBzY2hlbWFWZXJzaW9uOiAyO1xuICBtZXRhOiBBY3Rpdml0eU1ldGE7XG4gIHNlY3Rpb25zOiBTZWN0aW9uW107XG4gIHJlZmVyZW5jZVBhbmVsPzogUmVmZXJlbmNlUGFuZWw7XG4gIGNhbGN1bGF0b3I/OiBDYWxjdWxhdG9yVG9vbDtcbn1cbmV4cG9ydCBjb25zdCBBY3Rpdml0eURvY3VtZW50OiB6LlpvZFR5cGU8QWN0aXZpdHlEb2N1bWVudCwgei5ab2RUeXBlRGVmLCB1bmtub3duPiA9XG4gIHoub2JqZWN0KHtcbiAgICBzY2hlbWFWZXJzaW9uOiB6LmxpdGVyYWwoMiksXG4gICAgbWV0YTogQWN0aXZpdHlNZXRhLFxuICAgIHNlY3Rpb25zOiB6LmFycmF5KFNlY3Rpb24pLFxuICAgIHJlZmVyZW5jZVBhbmVsOiBSZWZlcmVuY2VQYW5lbC5vcHRpb25hbCgpLFxuICAgIGNhbGN1bGF0b3I6IENhbGN1bGF0b3JUb29sLm9wdGlvbmFsKCksXG4gIH0pO1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyB1cGdyYWRlLnRzIFx1MjAxNCBzZXJ2ZXItc2lkZSB1cGdyYWRlLW9uLXJlYWQgKGNvbXBvbmVudHMtYXMtZGF0YSBydWxpbmcgNEEpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHJlYWQgQVBJIChTMikgdXBncmFkZXMgZXZlcnkgc3RvcmVkIGFjdGl2aXR5X3ZlcnNpb25zLmNvbnRlbnQgdG8gdGhlXG4vLyBDVVJSRU5UIHNjaGVtYSBiZWZvcmUgc2FuaXRpemluZyBhbmQgc2VydmluZyBpdCwgc28gdGhlIHZpZXdlciBvbmx5IGV2ZXJcbi8vIHNlZXMgdGhlIGxhdGVzdCBzaGFwZS4gVGhpcyBtb2R1bGUgaXMgdGhhdCBzZWFtLlxuLy9cbi8vIFRoZSBjaGFpbiBpcyBFTVBUWSB0b2RheSwgZGVsaWJlcmF0ZWx5OiBzY2hlbWFWZXJzaW9uIGlzIDIgYW5kIHRoZSAxXHUyMTkyMlxuLy8gcmVzaGFwZSB3YXMgYSBncmVlbmZpZWxkIGhhcmQtY3V0IHdpdGggbm8gbWlncmF0ZSBwYXRoIChkb2N1bWVudC50cyBoZWFkZXIgXHUyMDE0XG4vLyBhIHN0cmF5IHYxIGZhaWxzIGxvdWRseSByYXRoZXIgdGhhbiBtaXMtcGFyc2luZykuIFdoZW4gc2NoZW1hVmVyc2lvbiAzXG4vLyBsYW5kcywgaXRzIG1pZ3JhdGlvbiBpcyBvbmUgcHVyZSBlbnRyeSBpbiBVUEdSQURFUyBiZWxvdzsgc3RvcmVkIHJvd3Mgc3RheVxuLy8gYXQgdGhlaXIgb3JpZ2luYWwgdmVyc2lvbiBmb3JldmVyIGFuZCBhcmUgdXBncmFkZWQgb24gcmVhZCwgbmV2ZXIgbXV0YXRlZC5cbi8vXG4vLyBEaXN0aW5jdCBmcm9tIHRoZSB0d28gb3RoZXIgXCJ1cGdyYWRlXCIgbGF5ZXJzLCBvbiBwdXJwb3NlOlxuLy8gICAtIE1hcmsvZGVmaW5pdGlvbiBsZWdhY3kgcHJlcHJvY2Vzc2luZyAoaW5saW5lLnRzKSBydW5zIElOU0lERVxuLy8gICAgIEFjdGl2aXR5RG9jdW1lbnQucGFyc2UgXHUyMDE0IGFkZGl0aXZlIHNoYXBlIGRyaWZ0IHdpdGhpbiBvbmUgc2NoZW1hVmVyc2lvbi5cbi8vICAgLSBtaWdyYXRlU3VibWlzc2lvblJlc3BvbnNlcyAoc3VibWlzc2lvbi50cykgaXMgdGhlIFNVQk1JU1NJT04gd2lyZSdzXG4vLyAgICAgbGFkZGVyIFx1MjAxNCBhIGRpZmZlcmVudCBkb2N1bWVudCB3aXRoIGl0cyBvd24gdmVyc2lvbmluZy5cbi8vIFRoaXMgbW9kdWxlIG93bnMgb25seSB0aGUgdG9wLWxldmVsIEFjdGl2aXR5RG9jdW1lbnQgc2NoZW1hVmVyc2lvbi5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IEFjdGl2aXR5RG9jdW1lbnQgfSBmcm9tICcuL2RvY3VtZW50LmpzJztcblxuLyoqIFRoZSBzY2hlbWFWZXJzaW9uIHRoaXMgYnVpbGQgcGFyc2VzIGFuZCBzZXJ2ZXMuIEd1YXJkLXRlc3RlZCBhZ2FpbnN0IHRoZVxuICogQWN0aXZpdHlEb2N1bWVudCBsaXRlcmFsIHNvIHRoZSBjb25zdGFudCBjYW4ndCBkcmlmdCBmcm9tIHRoZSBwYXJzZXIuICovXG5leHBvcnQgY29uc3QgQUNUSVZJVFlfU0NIRU1BX1ZFUlNJT04gPSAyO1xuXG4vKiogVGhyb3duIHdoZW4gc3RvcmVkIGNvbnRlbnQgY2Fubm90IGJlIGJyb3VnaHQgdG8gdGhlIGN1cnJlbnQgc2NoZW1hLiBUaGVcbiAqIHJlYWQgQVBJIG1hcHMgdGhpcyB0byBhbiBleHBsaWNpdCBlcnJvciBzdGF0ZSAoZmFpbHVyZS1tb2RlcyB0YWJsZTogXCJ1cGdyYWRlXG4gKiBjaGFpbiBidWcgb24gb2xkIHZlcnNpb25cIiBcdTIxOTIgY2xlYXIgZXJyb3IsIG5ldmVyIGEgd2hpdGUgc2NyZWVuKS4gKi9cbmV4cG9ydCBjbGFzcyBVcGdyYWRlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICAvKiogVGhlIHNjaGVtYVZlcnNpb24gdGhlIHN0b3JlZCBkb2N1bWVudCBjbGFpbWVkLCB3aGVuIHJlYWRhYmxlLiAqL1xuICAgIHJlYWRvbmx5IHN0b3JlZFZlcnNpb24/OiBudW1iZXIsXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubmFtZSA9ICdVcGdyYWRlRXJyb3InO1xuICB9XG59XG5cbi8qKiBPbmUgc3RlcCBvZiB0aGUgY2hhaW46IGEgUFVSRSBqc29uIFx1MjE5MiBqc29uIHJld3JpdGUgZnJvbSBgZnJvbWAgdG8gYGZyb20rMWAuXG4gKiBObyBJL08sIG5vIHJhbmRvbW5lc3MsIG5vIERhdGUgXHUyMDE0IHVwZ3JhZGluZyB0aGUgc2FtZSBzdG9yZWQgcm93IHR3aWNlIG11c3RcbiAqIHlpZWxkIGlkZW50aWNhbCBvdXRwdXQgKHRoZSBwZXItdmVyc2lvbiByZWFkIGNhY2hlIGRlcGVuZHMgb24gaXQpLiAqL1xuaW50ZXJmYWNlIFVwZ3JhZGVTdGVwIHtcbiAgcmVhZG9ubHkgZnJvbTogbnVtYmVyO1xuICByZWFkb25seSBydW46IChyYXc6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuLy8gVGhlIGNoYWluLiBBcHBlbmQtb25seTsgZWFjaCBlbnRyeSBidW1wcyBleGFjdGx5IG9uZSB2ZXJzaW9uLiBFbXB0eSB0b2RheSBcdTIwMTRcbi8vIHNlZSB0aGUgaGVhZGVyIGZvciB3aHkgdjEgZGVsaWJlcmF0ZWx5IGhhcyBubyBlbnRyeS5cbmNvbnN0IFVQR1JBREVTOiByZWFkb25seSBVcGdyYWRlU3RlcFtdID0gW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgVXBncmFkZVJlc3VsdCB7XG4gIC8qKiBUaGUgZG9jdW1lbnQsIHBhcnNlZCBhbmQgdmFsaWRhdGVkIGF0IHRoZSBDVVJSRU5UIHNjaGVtYS4gKi9cbiAgZG9jOiBBY3Rpdml0eURvY3VtZW50O1xuICAvKiogVGhlIHNjaGVtYVZlcnNpb24gdGhlIHN0b3JlZCBjb250ZW50IGFycml2ZWQgYXQgKD09PSBjdXJyZW50IHdoZW4gbm9cbiAgICogY2hhaW4gc3RlcCByYW4pLiBDYWxsZXJzIG1heSBsb2cgaXQ7IHRoZSBjYWNoZSBzdG9yZXMgdGhlIHRhcmdldC4gKi9cbiAgZnJvbVNjaGVtYVZlcnNpb246IG51bWJlcjtcbn1cblxuLyoqXG4gKiBCcmluZyByYXcgc3RvcmVkIGNvbnRlbnQgKGFjdGl2aXR5X3ZlcnNpb25zLmNvbnRlbnQpIHRvIHRoZSBjdXJyZW50IHNjaGVtYVxuICogYW5kIHZhbGlkYXRlIGl0LiBUaHJvd3MgVXBncmFkZUVycm9yIG9uIGFueSBjb250ZW50IHRoaXMgYnVpbGQgY2Fubm90IHNlcnZlXG4gKiBcdTIwMTQgYW4gdW5rbm93bi9mdXR1cmUgdmVyc2lvbiwgYSB2ZXJzaW9uIHdpdGggbm8gY2hhaW4gcGF0aCwgb3IgY29udGVudCB0aGF0XG4gKiBmYWlscyB2YWxpZGF0aW9uIGFmdGVyIHVwZ3JhZGluZy4gTmV2ZXIgcmV0dXJucyBhIHBhcnRpYWxseS11cGdyYWRlZCBkb2MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGdyYWRlQWN0aXZpdHlEb2N1bWVudChyYXc6IHVua25vd24pOiBVcGdyYWRlUmVzdWx0IHtcbiAgaWYgKHJhdyA9PT0gbnVsbCB8fCB0eXBlb2YgcmF3ICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KHJhdykpIHtcbiAgICB0aHJvdyBuZXcgVXBncmFkZUVycm9yKCdTdG9yZWQgY29udGVudCBpcyBub3QgYW4gb2JqZWN0Jyk7XG4gIH1cbiAgY29uc3Qgc3RvcmVkID0gcmF3IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBjb25zdCB2ZXJzaW9uID0gc3RvcmVkLnNjaGVtYVZlcnNpb247XG4gIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIodmVyc2lvbikpIHtcbiAgICB0aHJvdyBuZXcgVXBncmFkZUVycm9yKCdTdG9yZWQgY29udGVudCBoYXMgbm8gaW50ZWdlciBzY2hlbWFWZXJzaW9uJyk7XG4gIH1cbiAgaWYgKHZlcnNpb24gPiBBQ1RJVklUWV9TQ0hFTUFfVkVSU0lPTikge1xuICAgIC8vIENvbnRlbnQgd3JpdHRlbiBieSBhIE5FV0VSIGJ1aWxkIHRoYW4gdGhpcyBvbmUgKGRlcGxveS1vcmRlciBzbGlwKS5cbiAgICB0aHJvdyBuZXcgVXBncmFkZUVycm9yKFxuICAgICAgYFN0b3JlZCBzY2hlbWFWZXJzaW9uICR7dmVyc2lvbn0gaXMgbmV3ZXIgdGhhbiB0aGlzIGJ1aWxkJ3MgYCArXG4gICAgICAgIGAke0FDVElWSVRZX1NDSEVNQV9WRVJTSU9OfSBcdTIwMTQgcmVmdXNpbmcgdG8gZ3Vlc3NgLFxuICAgICAgdmVyc2lvbixcbiAgICApO1xuICB9XG5cbiAgbGV0IGN1cnJlbnQgPSBzdG9yZWQ7XG4gIGxldCBhdCA9IHZlcnNpb247XG4gIHdoaWxlIChhdCA8IEFDVElWSVRZX1NDSEVNQV9WRVJTSU9OKSB7XG4gICAgY29uc3Qgc3RlcCA9IFVQR1JBREVTLmZpbmQoKHUpID0+IHUuZnJvbSA9PT0gYXQpO1xuICAgIGlmICghc3RlcCkge1xuICAgICAgLy8gdjEgbGFuZHMgaGVyZSBieSBkZXNpZ24gKGdyZWVuZmllbGQgaGFyZC1jdXQ6IG5vIG1pZ3JhdGUoMVx1MjE5MjIpKS5cbiAgICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoXG4gICAgICAgIGBObyB1cGdyYWRlIHBhdGggZnJvbSBzY2hlbWFWZXJzaW9uICR7YXR9IFx1MjAxNCBjYW5ub3Qgc2VydmVgLFxuICAgICAgICB2ZXJzaW9uLFxuICAgICAgKTtcbiAgICB9XG4gICAgY3VycmVudCA9IHN0ZXAucnVuKGN1cnJlbnQpO1xuICAgIGF0ICs9IDE7XG4gIH1cblxuICBjb25zdCBwYXJzZWQgPSBBY3Rpdml0eURvY3VtZW50LnNhZmVQYXJzZShjdXJyZW50KTtcbiAgaWYgKCFwYXJzZWQuc3VjY2Vzcykge1xuICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoXG4gICAgICBgQ29udGVudCBmYWlsZWQgdmFsaWRhdGlvbiBhdCBzY2hlbWFWZXJzaW9uICR7YXR9OiBgICtcbiAgICAgICAgcGFyc2VkLmVycm9yLmlzc3Vlc1xuICAgICAgICAgIC5zbGljZSgwLCAzKVxuICAgICAgICAgIC5tYXAoKGkpID0+IGAke2kucGF0aC5qb2luKCcuJyl9OiAke2kubWVzc2FnZX1gKVxuICAgICAgICAgIC5qb2luKCc7ICcpLFxuICAgICAgdmVyc2lvbixcbiAgICApO1xuICB9XG4gIHJldHVybiB7IGRvYzogcGFyc2VkLmRhdGEsIGZyb21TY2hlbWFWZXJzaW9uOiB2ZXJzaW9uIH07XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHN1Ym1pc3Npb24udHMgXHUyMDE0IFN1Ym1pc3Npb25SZXNwb25zZXMgc2NoZW1hXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHNoYXBlIG9mIHN1Ym1pc3Npb25zLnJlc3BvbnNlcyBqc29uYi4gS2V5ZWQgYnkgc3RhYmxlIGJsYW5rLmlkIGZyb21cbi8vIHRoZSBkb2N1bWVudCBzbyBwZXItYmxhbmsgYWdncmVnYXRpb24gcXVlcmllcyB3b3JrIGV2ZW4gd2hlbiBibG9ja3MgYXJlXG4vLyByZW9yZGVyZWQgYmV0d2VlbiBkb2N1bWVudCB2ZXJzaW9ucy5cbi8vXG4vLyBzY2hlbWFWZXJzaW9uIGhlcmUgaXMgaW5kZXBlbmRlbnQgb2YgQWN0aXZpdHlEb2N1bWVudC5zY2hlbWFWZXJzaW9uIFx1MjAxNFxuLy8gdGhleSBldm9sdmUgc2VwYXJhdGVseS4gV2hlbiB0aGlzIHNjaGVtYSBjaGFuZ2VzIChlLmcuLCBhZGRpbmcgcGFydGlhbC1cbi8vIGNyZWRpdCBzY29yaW5nKSwgYnVtcCBUSElTIHNjaGVtYVZlcnNpb24gYW5kIG1pZ3JhdGUgb24gcmVhZC5cbi8vXG4vLyBOb3RlOiBhdHRlbXB0X251bWJlciBsaXZlcyBvbiB0aGUgc3VibWlzc2lvbnMgdGFibGUgYXMgYSBjb2x1bW4sIG5vdCBpblxuLy8gdGhpcyBqc29uYi4gVGhlIEVkZ2UgRnVuY3Rpb24gZGVyaXZlcyBpdCBzZXJ2ZXItc2lkZSBmcm9tXG4vLyBtYXgoYXR0ZW1wdF9udW1iZXIpICsgMSBmb3IgdGhlIHN0dWRlbnQncyBpZGVudGl0eSwgYW5kIHN0b3JlcyBpdCBpblxuLy8gdGhlIGluZGV4ZWQgY29sdW1uLiBUaGUgY2xpZW50IG1heSBzZW5kIGEgdmFsdWUgZm9yIG9wdGltaXN0aWMgVUksIGJ1dFxuLy8gdGhlIHNlcnZlcidzIHZhbHVlIGlzIGNhbm9uaWNhbCBhbmQgdGhlIGpzb25iIGRvZXNuJ3QgZWNobyBpdC5cbi8vXG4vLyBNaWdyYXRpb24gaGlzdG9yeTpcbi8vICAgdjEgXHUyMTkyIHYyIChTdGFnZSA5YSk6IGFkZHMgb3B0aW9uYWwgY29uZmlkZW5jZSBwZXIgYmxhbmsgYW5kIG9wdGlvbmFsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgY2hlY2twb2ludFJlc3VsdHMuIHYxIHN1Ym1pc3Npb25zIG1pZ3JhdGUtb24tcmVhZFxuLy8gICAgICAgICAgICAgICAgICAgICAgIHRvIHYyIGJ5IHNldHRpbmcgc2NoZW1hVmVyc2lvbjogMiAob3RoZXIgZmllbGRzXG4vLyAgICAgICAgICAgICAgICAgICAgICAgYXJlIHVuY2hhbmdlZCBvciBvcHRpb25hbC1hbmQtYWJzZW50IGluIHYxKS5cbi8vICAgdjIgXHUyMTkyIHYzIChTdGFnZSA1LCBQaGFzZSAyLjcpOiBhZGRzIHRoZSBvcHRpb25hbCBncmFwaFJlc3BvbnNlcyBtYXAgZm9yXG4vLyAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJhY3RpdmUtZ3JhcGggYmxvY2tzLiB2MiBzdWJtaXNzaW9ucyBtaWdyYXRlLW9uLVxuLy8gICAgICAgICAgICAgICAgICAgICAgIHJlYWQgdG8gdjMgYnkgc2V0dGluZyBzY2hlbWFWZXJzaW9uOiAzIChncmFwaFJlc3BvbnNlc1xuLy8gICAgICAgICAgICAgICAgICAgICAgIHNpbXBseSBhYnNlbnQgXHUyMDE0IHZhbGlkIGZvciBhbiBvcHRpb25hbCBmaWVsZCkuXG4vLyAgIHY0IFx1MjE5MiB2NSAobXVsdGlwbGUgY2hvaWNlKTogYWRkcyB0aGUgb3B0aW9uYWwgYGNob2ljZXNgIG1hcCBmb3Jcbi8vICAgICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZV9jaG9pY2UgYmxvY2tzIChDaG9pY2VSZXNwb25zZTogc2VsZWN0ZWRcbi8vICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2UgaWRzICsgY29ycmVjdCArIGNvbmZpZGVuY2UpLiB2NCByb3dzIG1pZ3JhdGVcbi8vICAgICAgICAgICAgICAgICAgICAgICBvbiByZWFkIGJ5IHNldHRpbmcgc2NoZW1hVmVyc2lvbjogNS5cbi8vICAgdjUgXHUyMTkyIHY2IChtYXRjaGluZyArIG9yZGVyaW5nKTogYWRkcyB0aGUgb3B0aW9uYWwgYG1hdGNoZXNgIG1hcFxuLy8gICAgICAgICAgICAgICAgICAgICAgIChNYXRjaFJlc3BvbnNlOiBpdGVtXHUyMTkydGFyZ2V0IHBhaXJzICsgcGVyLXBhaXJcbi8vICAgICAgICAgICAgICAgICAgICAgICBlYXJuZWQvdG90YWwpIGFuZCBgb3JkZXJpbmdzYCBtYXAgKE9yZGVyUmVzcG9uc2U6XG4vLyAgICAgICAgICAgICAgICAgICAgICAgdGhlIGFycmFuZ2VkIGl0ZW0taWQgc2VxdWVuY2UsIGFsbC1vci1ub3RoaW5nKS5cbi8vICAgICAgICAgICAgICAgICAgICAgICB2NSByb3dzIG1pZ3JhdGUgb24gcmVhZCBieSBzZXR0aW5nIHNjaGVtYVZlcnNpb246IDYuXG4vLyAgIHY2IFx1MjE5MiB2NyAobnVtYmVyIGxpbmUpOiBhZGRzIHRoZSBvcHRpb25hbCBgbnVtYmVyTGluZVJlc3BvbnNlc2AgbWFwXG4vLyAgICAgICAgICAgICAgICAgICAgICAgKE51bWJlckxpbmVSZXNwb25zZTogcGxvdHRlZCAxLUQgcG9pbnRzLCBvciBhblxuLy8gICAgICAgICAgICAgICAgICAgICAgIGludGVydmFsL3JheSB3aXRoIG9wZW4vY2xvc2VkIGJvdW5kczsgYWxsLW9yLW5vdGhpbmcpLlxuLy8gICAgICAgICAgICAgICAgICAgICAgIHY2IHJvd3MgbWlncmF0ZSBvbiByZWFkIGJ5IHNldHRpbmcgc2NoZW1hVmVyc2lvbjogNy5cbi8vICAgdjcgXHUyMTkyIHY4IChkYXRhIHBsb3QpOiBhZGRzIHRoZSBvcHRpb25hbCBgZGF0YVBsb3RSZXNwb25zZXNgIG1hcFxuLy8gICAgICAgICAgICAgICAgICAgICAgIChEYXRhUGxvdFJlc3BvbnNlOiB0aGUgc3R1ZGVudCdzIGJ1aWx0IGNoYXJ0LCBlLmcuIHRoZVxuLy8gICAgICAgICAgICAgICAgICAgICAgIHBsb3R0ZWQgZG90LXBsb3QgdmFsdWVzOyBhbGwtb3Itbm90aGluZykuIGRpc3BsYXktbW9kZVxuLy8gICAgICAgICAgICAgICAgICAgICAgIGRhdGFfcGxvdHMgYXJlIHVuZ3JhZGVkIHN0aW11bGkgYW5kIG5ldmVyIGFwcGVhciBoZXJlLlxuLy8gICAgICAgICAgICAgICAgICAgICAgIHY3IHJvd3MgbWlncmF0ZSBvbiByZWFkIGJ5IHNldHRpbmcgc2NoZW1hVmVyc2lvbjogOC5cbi8vICAgdjggXHUyMTkyIHY5IChzZWxmLWV4cGxhbmF0aW9uKTogYWRkcyB0aGUgb3B0aW9uYWwgYGZyZWVSZXNwb25zZXNgIG1hcFxuLy8gICAgICAgICAgICAgICAgICAgICAgIChGcmVlUmVzcG9uc2U6IHVuZ3JhZGVkIGZyZWUgdGV4dCwganVzdCB7IHRleHQgfSkuIE5ldmVyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgc2NvcmVkLiB2OCByb3dzIG1pZ3JhdGUgb24gcmVhZCBieSBzZXR0aW5nXG4vLyAgICAgICAgICAgICAgICAgICAgICAgc2NoZW1hVmVyc2lvbjogOS5cbi8vXG4vLyBFeHRlbnNpb24gcGF0dGVybiBcdTIwMTQgYWRkaW5nIG5ldyByZXNwb25zZSBzaGFwZXMgKFBoYXNlIDIrKTpcbi8vICAgV2hlbiBhIG5ldyBxdWVzdGlvbiBjYXRlZ29yeSBuZWVkcyBhIGRpZmZlcmVudCByZXNwb25zZSBzaGFwZSBcdTIwMTQgTUNcbi8vICAgc2VsZWN0aW9ucywgb3JkZXJpbmcgYXJyYW5nZW1lbnRzLCBtYXRjaGluZyBwYWlycywgZ3JhcGggaW5wdXRzLCBmaWxlXG4vLyAgIHVwbG9hZHMsIGVzc2F5IHRleHQsIGFubm90YXRpb25zIFx1MjAxNCBpdCBnZXRzIGl0cyBvd24ga2V5ZWQtYnktdXVpZFxuLy8gICBvcHRpb25hbCBtYXAgb24gU3VibWlzc2lvblJlc3BvbnNlcywgc2libGluZyB0byBgYmxhbmtzYC4gRG9uJ3Qgd2lkZW5cbi8vICAgQmxhbmtSZXNwb25zZS5hbnN3ZXIgdG8gYSB1bmlvbiB3aXRoIG9iamVjdCB0eXBlczsgdGhhdCBmb3JjZXMgZXZlcnlcbi8vICAgY29uc3VtZXIgKHRlYWNoZXIgZGFzaGJvYXJkLCBmdXR1cmUgYW5hbHl0aWNzLCBwZXItYmxhbmsgYWdncmVnYXRpb25cbi8vICAgcXVlcmllcykgdG8gYWRkIHR5cGUgZ3VhcmRzIG9uIHdoYXQgc2hvdWxkIHJlbWFpbiBhIHV1aWQta2V5ZWQtc3RyaW5nXG4vLyAgIG1hcC4gVHlwZSBwdXJpdHkgYXQgdGhlIGNvbnN1bWVyIGJvdW5kYXJ5IGlzIHRoZSBnb2FsLlxuLy9cbi8vICAgUGxhbm5lZCBmdXR1cmUgbWFwcyAoZWFjaCBsYW5kcyB3aXRoIHRoZSBibG9jayB0eXBlIHRoYXQgbmVlZHMgaXQpOlxuLy8gICAgIGNob2ljZXMgICAgICAgICBcdTIwMTQgU0hJUFBFRCBhdCB2NSAobXVsdGlwbGUgY2hvaWNlLCBzaW5nbGUgKyBtdWx0aS1zZWxlY3QpXG4vLyAgICAgbWF0Y2hlcyAgICAgICAgIFx1MjAxNCBTSElQUEVEIGF0IHY2IChtYXRjaGluZyBwYWlycywgcGVyLXBhaXIgZWFybmVkL3RvdGFsKVxuLy8gICAgIG9yZGVyaW5ncyAgICAgICBcdTIwMTQgU0hJUFBFRCBhdCB2NiAob3JkZXJpbmcgLyBzZXF1ZW5jaW5nLCBhbGwtb3Itbm90aGluZylcbi8vICAgICBmcmVlUmVzcG9uc2VzICAgXHUyMDE0IFNISVBQRUQgYXQgdjkgKHNlbGYtZXhwbGFuYXRpb247IFBoYXNlIDIuNiBzaG9ydF9hbnN3ZXJcbi8vICAgICAgICAgICAgICAgICAgICAgICAvIGVzc2F5IHJldXNlIHRoZSBzYW1lIG1hcCwgbm8gZnVydGhlciB3aXJlIGJ1bXApXG4vLyAgICAgZ3JhcGhSZXNwb25zZXMgIFx1MjAxNCBQaGFzZSAyLjcgaW50ZXJhY3RpdmUgZ3JhcGhzXG4vLyAgICAgbnVtYmVyTGluZVJlc3BvbnNlcyBcdTIwMTQgUGhhc2UgMi43IG51bWJlci1saW5lIGJsb2NrcyAoMS1EKVxuLy8gICAgIGRhdGFQbG90UmVzcG9uc2VzIFx1MjAxNCBQaGFzZSAyLjcgZGF0YS1wbG90IGJsb2NrcyAoc3RhdHMgY2hhcnRzKVxuLy8gICAgIGZpbGVzICAgICAgICAgICBcdTIwMTQgUGhhc2UgMi44IGF1ZGlvIC8gdmlkZW8gLyBmaWxlIHVwbG9hZFxuLy8gICAgIGFubm90YXRpb25zICAgICBcdTIwMTQgUGhhc2UgMi45IGhpZ2hsaWdodCAvIGxhYmVsIC8gcmVnaW9uXG4vL1xuLy8gICBFYWNoIGFkZGl0aW9uIGlzIGFuIG9wdGlvbmFsIGZpZWxkIGF0IGEgc2NoZW1hVmVyc2lvbiBidW1wOyBvbGRlclxuLy8gICBzdWJtaXNzaW9ucyByZWFkIGZvcndhcmQgdGhyb3VnaCBtaWdyYXRlU3VibWlzc2lvblJlc3BvbnNlcywgd2hpY2hcbi8vICAgcmV0dXJucyB0aGUgY3VycmVudCBzaGFwZSB3aXRoIGFic2VudCBtYXBzIHNpbXBseSB1bmRlZmluZWQuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcblxuLy8gQ29uZmlkZW5jZSByYXRpbmcgY2FwdHVyZWQgYmVmb3JlIGEgc3R1ZGVudCBjaGVja3MgYSBzZWN0aW9uLiBPbmx5XG4vLyBwcmVzZW50IHdoZW4gdGhlIGJsYW5rJ3MgcGFyZW50IEZpbGxJbkJsYW5rQmxvY2sgaGFzIGhhc0NvbmZpZGVuY2VSYXRpbmdcbi8vID09PSB0cnVlLiBUaHJlZS1wb2ludCBzY2FsZSBjYXB0dXJlcyBtZXRhY29nbml0aXZlIGNhbGlicmF0aW9uIHdpdGhvdXRcbi8vIGJlaW5nIHNvIGdyYW51bGFyIHRoYXQgc3R1ZGVudHMgY2FuJ3QgZGVjaWRlLlxuZXhwb3J0IGNvbnN0IENvbmZpZGVuY2VMZXZlbCA9IHouZW51bShbJ3Vuc3VyZScsICd0aGlua19zbycsICdjZXJ0YWluJ10pO1xuZXhwb3J0IHR5cGUgQ29uZmlkZW5jZUxldmVsID0gei5pbmZlcjx0eXBlb2YgQ29uZmlkZW5jZUxldmVsPjtcblxuLy8gT25lIGJsYW5rJ3MgcmVzcG9uc2U6IHdoYXQgdGhlIHN0dWRlbnQgdHlwZWQsIHdoZXRoZXIgdGhlIHJ1bnRpbWUgc2NvcmVkXG4vLyBpdCBjb3JyZWN0LCBhbmQgb3B0aW9uYWxseSB0aGVpciBjb25maWRlbmNlIHJhdGluZy4gVGhlIGBjb3JyZWN0YCBib29sZWFuXG4vLyBpcyBjb21wdXRlZCBDTElFTlQtU0lERSBpbiB0aGUgcnVudGltZSBKUyBvZiB0aGUgcHVibGlzaGVkIEhUTUwgXHUyMDE0IHRoZVxuLy8gYW5zd2VyIGtleSBpcyBiYWtlZCBpbnRvIHRoZSBIVE1MLCBzbyB0aGlzIGlzIGNvbnZlbmllbmNlIGZvciB0aGVcbi8vIHRlYWNoZXIgdmlld2VyLCBub3QgYXV0aG9yaXRhdGl2ZSBncmFkaW5nLiAoU2VlIHRoZSBzZWN1cml0eSBjZWlsaW5nXG4vLyBkaXNjdXNzaW9uOiBQaGFzZSA1KyBtYXJrZXRwbGFjZSByZXF1aXJlcyBzZXJ2ZXItc2lkZSBncmFkaW5nLilcbmV4cG9ydCBjb25zdCBCbGFua1Jlc3BvbnNlID0gei5vYmplY3Qoe1xuICBhbnN3ZXI6IHouc3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQmxhbmtSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIEJsYW5rUmVzcG9uc2U+O1xuXG4vLyBPbmUgaW50ZXJhY3RpdmUtZ3JhcGggYmxvY2sncyByZXNwb25zZSAoUGhhc2UgMi43KS4gTWlycm9ycyB0aGUgYmxvY2snc1xuLy8gaW50ZXJhY3Rpb24gZGlzY3JpbWluYXRlZCB1bmlvbiBcdTIwMTQgZWFjaCB2YXJpYW50IGNhcnJpZXMgdGhlIHN0dWRlbnQnc1xuLy8gc3RydWN0dXJlZCBnZW9tZXRyaWMgaW5wdXQgcGx1cyB0aGUgc2FtZSBjb3JyZWN0bmVzcy9jb25maWRlbmNlIGZpZWxkc1xuLy8gYmxhbmtzIGhhdmUuIExpa2UgQmxhbmtSZXNwb25zZSwgYGNvcnJlY3RgIGlzIGNvbXB1dGVkIENMSUVOVC1TSURFIGluIHRoZVxuLy8gcHVibGlzaGVkIHBhZ2UncyBsYXp5LWxvYWRlZCBraXQgKHRoZSBhbnN3ZXIga2V5IGlzIGJha2VkIGludG8gdGhlIEhUTUwpIFx1MjAxNFxuLy8gY29udmVuaWVuY2UgZm9yIHRoZSB0ZWFjaGVyIHZpZXdlciwgbm90IGF1dGhvcml0YXRpdmUgZ3JhZGluZy4gS2VwdCBhXG4vLyBkaXNjcmltaW5hdGVkIHVuaW9uIHNvIHBsb3RfbGluZSAvIHNoYWRlX3JlZ2lvbiBhZGQgYSB2YXJpYW50IGhlcmUgd2l0aCBub1xuLy8gY2hhbmdlIHRvIGNvbnN1bWVycyB0aGF0IGJyYW5jaCBvbiBgdHlwZWAuIFNsaWNlIDEgKDIuN2EpIHNoaXBzIHBsb3RfcG9pbnQuXG5leHBvcnQgY29uc3QgUG9pbnRSZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X3BvaW50JyksXG4gIC8vIEV2ZXJ5IHBvaW50IHRoZSBzdHVkZW50IHBsb3R0ZWQsIGluIGdyYXBoIHVuaXRzLiBPcmRlciBmb2xsb3dzIHRoZSBibG9jaydzXG4gIC8vIGNvcnJlY3RQb2ludHMgZm9yIG11bHRpLXBvaW50IHF1ZXN0aW9uczsgYSBzaW5nbGUgcG9pbnQgaXMgdGhlIGNvbW1vbiBjYXNlLlxuICBzdHVkZW50UG9pbnRzOiB6LmFycmF5KHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgUG9pbnRSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIFBvaW50UmVzcG9uc2U+O1xuXG4vLyBwbG90X2Z1bmN0aW9uIChQaGFzZSAyLjcgMi43Yik6IHRoZSBzdHVkZW50IHBsYWNlZCBOIHBvaW50cyBkZWZpbmluZyBhIGN1cnZlLlxuLy8gV2Ugc3RvcmUgdGhlIHJhdyBwb2ludHMgKHVuaWZvcm0gd2l0aCBwbG90X3BvaW50KTsgdGhlIGZpdHRlZCBwYXJhbWV0ZXJzIGFyZVxuLy8gcmUtZGVyaXZhYmxlIGZyb20gdGhlbSB3aXRoIHRoZSBzYW1lIGVuZ2luZSB0aGF0IHNjb3JlZCBpdCwgc28gdGhlIGRhc2hib2FyZFxuLy8gY2FuIHNob3cgXCJzdHVkZW50J3MgbGluZVwiIHdpdGhvdXQgYSBzZWNvbmQgc3RvcmVkIHNoYXBlLlxuZXhwb3J0IGNvbnN0IEZ1bmN0aW9uUmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9mdW5jdGlvbicpLFxuICBzdHVkZW50UG9pbnRzOiB6LmFycmF5KHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgRnVuY3Rpb25SZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIEZ1bmN0aW9uUmVzcG9uc2U+O1xuXG4vLyBzaGFkZV9yZWdpb24gKDIuN2MpOiBzdHVkZW50UG9pbnRzIGFyZSB0aGUgcG9seWdvbidzIHZlcnRpY2VzIGluIG9yZGVyLlxuZXhwb3J0IGNvbnN0IFJlZ2lvblJlc3BvbnNlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3NoYWRlX3JlZ2lvbicpLFxuICBzdHVkZW50UG9pbnRzOiB6LmFycmF5KHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgUmVnaW9uUmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBSZWdpb25SZXNwb25zZT47XG5cbi8vIGdyYXBoX2luZXF1YWxpdHkgKERyb3AgNCk6IHRoZSBib3VuZGFyeSBoYW5kbGVzICsgdGhlIHR3byBncmFkZWQgY2hvaWNlcy5cbi8vIHNpZGUgbGVmdC9yaWdodCBhcHBlYXJzIHdpdGggdmVydGljYWwgYm91bmRhcmllczsgYWJvdmUvYmVsb3cgb3RoZXJ3aXNlLlxuZXhwb3J0IGNvbnN0IEluZXF1YWxpdHlSZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdncmFwaF9pbmVxdWFsaXR5JyksXG4gIHN0dWRlbnRQb2ludHM6IHouYXJyYXkoei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pKSxcbiAgc3RyaWN0OiB6LmJvb2xlYW4oKSxcbiAgc2lkZTogei5lbnVtKFsnYWJvdmUnLCAnYmVsb3cnLCAnbGVmdCcsICdyaWdodCddKSxcbiAgY29ycmVjdDogei5ib29sZWFuKCksXG4gIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBJbmVxdWFsaXR5UmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBJbmVxdWFsaXR5UmVzcG9uc2U+O1xuXG4vLyBwbG90X3JheSAvIHBsb3Rfc2VnbWVudCAoRHJvcCBDIFx1MjAxNCBmaXJzdC1jbGFzcyByYXlzL3NlZ21lbnRzKS4gc3R1ZGVudFBvaW50c1xuLy8gY2FycmllcyBbZnJvbSwgdGhyb3VnaF0gZm9yIGEgcmF5IGFuZCBbZW5kLCBlbmRdIGZvciBhIHNlZ21lbnQ7IHRoZSBlbmRwb2ludFxuLy8gc3R5bGUgY2hvaWNlcyByaWRlIGFsb25nc2lkZS4gdjQtb25seSBtZW1iZXJzOiBwYWdlcyB0aGF0IGVtaXQgdGhlbSBhcmVcbi8vIHB1Ymxpc2hlZCBBRlRFUiB0aGUgRHJvcCBDIGluZ2VzdCBkZXBsb3ksIGFuZCBhZGRpbmcgdW5pb24gbWVtYmVycyBBQ0NFUFRTXG4vLyBNT1JFIFx1MjAxNCBubyBzdG9yZWQgcm93IGlzIGludmFsaWRhdGVkIGFuZCBubyB2ZXJzaW9uIGJ1bXAgaXMgbmVlZGVkLlxuZXhwb3J0IGNvbnN0IFJheVJlc3BvbnNlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3RfcmF5JyksXG4gIHN0dWRlbnRQb2ludHM6IHouYXJyYXkoei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pKSxcbiAgLy8gVGhlIHN0dWRlbnQncyBjaG9zZW4gU0hBUEUgKHJheSBkaXJlY3Rpb24gLyBzZWdtZW50KSBcdTIwMTQgYSBncmFkZWQgcGFydCBvZlxuICAvLyB0aGUgYW5zd2VyIHNpbmNlIHRoZSBzaGFwZS10b2dnbGUgd2lkZ2V0OyBhYnNlbnQgPSBuZXZlciBjaG9zZW4gKG9yIGFcbiAgLy8gcHJlLXRvZ2dsZSBzdWJtaXNzaW9uKS4gT3B0aW9uYWwgKyBhZGRpdGl2ZSB3aXRoaW4gdjQuXG4gIHNoYXBlOiB6LmVudW0oWydyYXlfcG9zaXRpdmUnLCAncmF5X25lZ2F0aXZlJywgJ3NlZ21lbnQnXSkub3B0aW9uYWwoKSxcbiAgZnJvbVN0eWxlOiB6LmVudW0oWydvcGVuJywgJ2Nsb3NlZCddKSxcbiAgY29ycmVjdDogei5ib29sZWFuKCksXG4gIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBSYXlSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIFJheVJlc3BvbnNlPjtcblxuZXhwb3J0IGNvbnN0IFNlZ21lbnRSZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X3NlZ21lbnQnKSxcbiAgc3R1ZGVudFBvaW50czogei5hcnJheSh6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSkpLFxuICBzaGFwZTogei5lbnVtKFsncmF5X3Bvc2l0aXZlJywgJ3JheV9uZWdhdGl2ZScsICdzZWdtZW50J10pLm9wdGlvbmFsKCksXG4gIGVuZHBvaW50czogei50dXBsZShbei5lbnVtKFsnb3BlbicsICdjbG9zZWQnXSksIHouZW51bShbJ29wZW4nLCAnY2xvc2VkJ10pXSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgU2VnbWVudFJlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgU2VnbWVudFJlc3BvbnNlPjtcblxuLy8gZ3JhcGhfaW5lcXVhbGl0eV9zeXN0ZW0gKEdyYXBoIHN5c3RlbXMpOiB0aGUgc3R1ZGVudCdzIGFuc3dlciB0byBhIFNZU1RFTSBvZlxuLy8gaW5lcXVhbGl0aWVzIFx1MjAxNCBhIGdyYXBoX2luZXF1YWxpdHkgd2l0aCBpbmVxdWFsaXRpZXMubGVuZ3RoID4gMS4gYHBhcnRzYCBpcyBvbmVcbi8vIEluZXF1YWxpdHlSZXNwb25zZSBwZXIgYXV0aG9yZWQgYm91bmRhcnkgdGhlIHN0dWRlbnQgcGxvdHRlZCAoZWFjaCBjYXJyaWVzIGl0c1xuLy8gb3duIGJvdW5kYXJ5IHBvaW50cyArIHNpZGUgKyBzdHlsZSwgc28gbWl4ZWQgc3RyaWN0L2luY2x1c2l2ZSBib3VuZGFyaWVzIGFyZVxuLy8gcGVyLXBhcnQpLiBgY29ycmVjdGAgaXMgdGhlIG1hdGNoLWFsbCBBTkQgXHUyMDE0IGV2ZXJ5IGF1dGhvcmVkIGluZXF1YWxpdHkgcGFpcmVkLFxuLy8gb3JkZXItaW5kZXBlbmRlbnRseSwgd2l0aCBhIGRpc3RpbmN0IHN0dWRlbnQgcGFydDsgYGVhcm5lZGAvYHRvdGFsYCAodmlhXG4vLyBWNEV4dHJhcyBiZWxvdykgY2FycnkgcGVyLWluZXF1YWxpdHkgcGFydGlhbCBjcmVkaXQgKG1hdGNoZWQgLyBOKSB3aGVuIHRoZVxuLy8gYmxvY2sncyBwYXJ0aWFsQ3JlZGl0IGZsYWcgaXMgb24uIExpa2UgQmxhbmtSZXNwb25zZSwgYGNvcnJlY3RgIGlzIGNvbXB1dGVkXG4vLyBDTElFTlQtU0lERSBpbiB0aGUgcHVibGlzaGVkIHBhZ2UncyBsYXp5IGtpdCBcdTIwMTQgY29udmVuaWVuY2UgZm9yIHRoZSB0ZWFjaGVyXG4vLyB2aWV3ZXIsIG5vdCBhdXRob3JpdGF0aXZlIGdyYWRpbmcuIEEgTkVXIGFkZGl0aXZlIG1lbWJlcjogcGFnZXMgdGhhdCBlbWl0IGl0XG4vLyBhcmUgcHVibGlzaGVkIEFGVEVSIHRoZSBpbmdlc3QgcmVkZXBsb3ksIGFuZCB3aWRlbmluZyB0aGUgdW5pb24gb25seSBBQ0NFUFRTXG4vLyBNT1JFLCBzbyBubyBzdWJtaXNzaW9uLnNjaGVtYVZlcnNpb24gYnVtcCAodGhlIHBsb3RfcmF5IC8gcGxvdF9zZWdtZW50XG4vLyBwcmVjZWRlbnQpLiBOPTEgbmV2ZXIgZW1pdHMgdGhpcyBcdTIwMTQgdGhlIHJ1bnRpbWUga2VlcHMgdGhlIHBsYWluIHNpbmdsZVxuLy8gSW5lcXVhbGl0eVJlc3BvbnNlIGZvciBvbmUgYm91bmRhcnkgKGJ5dGUtaWRlbnRpY2FsIHRvIHRvZGF5KS5cbmV4cG9ydCBjb25zdCBTeXN0ZW1JbmVxdWFsaXR5UmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnZ3JhcGhfaW5lcXVhbGl0eV9zeXN0ZW0nKSxcbiAgLy8gT25lIHBlciBib3VuZGFyeTsgYXQgbGVhc3QgdHdvIGZvciBhIHJlYWwgc3lzdGVtLCBidXQgbWluKDEpIGtlZXBzIHRoZVxuICAvLyBzY29yZXIvcGFyc2UgdG90YWwgKGFuIHVuZGVyLWNvdW50IGNhbid0IG1hdGNoIGV2ZXJ5IGF1dGhvcmVkIGtleSBcdTIxOTIgd3JvbmcpLlxuICBwYXJ0czogei5hcnJheShJbmVxdWFsaXR5UmVzcG9uc2UpLm1pbigxKSxcbiAgY29ycmVjdDogei5ib29sZWFuKCksXG4gIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBTeXN0ZW1JbmVxdWFsaXR5UmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBTeXN0ZW1JbmVxdWFsaXR5UmVzcG9uc2U+O1xuXG4vLyBwbG90X2Z1bmN0aW9uX3N5c3RlbSAoR3JhcGggc3lzdGVtcyBQaGFzZSAyKTogdGhlIHN0dWRlbnQncyBhbnN3ZXIgdG8gYSBTWVNURU1cbi8vIG9mIGZ1bmN0aW9ucyBcdTIwMTQgYSBwbG90X2Z1bmN0aW9uIHdpdGggbW9kZWxzLmxlbmd0aCA+IDEgKFwiZ3JhcGggYm90aCBsaW5lc1wiKS5cbi8vIGBwYXJ0c2AgaXMgb25lIEZ1bmN0aW9uUmVzcG9uc2UgcGVyIGN1cnZlIHRoZSBzdHVkZW50IHBsb3R0ZWQgKGVhY2ggY2FycmllcyB0aGVcbi8vIHJhdyBwb2ludHMgdGhhdCBkZWZpbmUgdGhhdCBjdXJ2ZSkuIGBjb3JyZWN0YCBpcyB0aGUgbWF0Y2gtYWxsIEFORCBcdTIwMTQgZXZlcnlcbi8vIGF1dGhvcmVkIG1vZGVsIHBhaXJlZCwgb3JkZXItaW5kZXBlbmRlbnRseSwgd2l0aCBhIGRpc3RpbmN0IHN0dWRlbnQgY3VydmU7XG4vLyBgZWFybmVkYC9gdG90YWxgICh2aWEgVjRFeHRyYXMpIGNhcnJ5IHBlci1jdXJ2ZSBwYXJ0aWFsIGNyZWRpdCAobWF0Y2hlZCAvIE4pLlxuLy8gQWRkaXRpdmUgbWVtYmVyIFx1MjAxNCBzYW1lIHBsb3RfcmF5IC8gcGxvdF9zZWdtZW50IHByZWNlZGVudCwgbm8gc2NoZW1hVmVyc2lvblxuLy8gYnVtcC4gTj0xIG5ldmVyIGVtaXRzIHRoaXMgXHUyMDE0IHRoZSBydW50aW1lIGtlZXBzIHRoZSBwbGFpbiBzaW5nbGUgRnVuY3Rpb25SZXNwb25zZVxuLy8gZm9yIG9uZSBjdXJ2ZSAoYnl0ZS1pZGVudGljYWwgdG8gdG9kYXkpLlxuZXhwb3J0IGNvbnN0IFN5c3RlbUZ1bmN0aW9uUmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9mdW5jdGlvbl9zeXN0ZW0nKSxcbiAgLy8gT25lIHBlciBjdXJ2ZTsgbWluKDEpIGtlZXBzIHRoZSBwYXJzZSB0b3RhbCAoYW4gdW5kZXItY291bnQgY2FuJ3QgbWF0Y2hcbiAgLy8gZXZlcnkgYXV0aG9yZWQgbW9kZWwgXHUyMTkyIHdyb25nKS5cbiAgcGFydHM6IHouYXJyYXkoRnVuY3Rpb25SZXNwb25zZSkubWluKDEpLFxuICBjb3JyZWN0OiB6LmJvb2xlYW4oKSxcbiAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFN5c3RlbUZ1bmN0aW9uUmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBTeXN0ZW1GdW5jdGlvblJlc3BvbnNlPjtcblxuZXhwb3J0IGNvbnN0IEdyYXBoUmVzcG9uc2UgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgUG9pbnRSZXNwb25zZSxcbiAgRnVuY3Rpb25SZXNwb25zZSxcbiAgUmVnaW9uUmVzcG9uc2UsXG4gIEluZXF1YWxpdHlSZXNwb25zZSxcbl0pO1xuZXhwb3J0IHR5cGUgR3JhcGhSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIEdyYXBoUmVzcG9uc2U+O1xuXG4vLyB2NCBncmFwaCByZXNwb25zZXMgd2lkZW4gZXZlcnkgdmFyaWFudCB3aXRoIHRoZSBEcm9wIDQgb3B0aW9uYWxzOiBgbm9Tb2x1dGlvbmBcbi8vICh0aGUgc3R1ZGVudCBjaG9zZSBcImNhbm5vdCBiZSBncmFwaGVkXCI7IHN0dWRlbnRQb2ludHMgbWF5IGJlIGVtcHR5KSBhbmRcbi8vIGBlYXJuZWRgL2B0b3RhbGAgKHBlci1wYXJ0IHBhcnRpYWwgY3JlZGl0LCBwcmVzZW50IG9ubHkgd2hlbiB0aGUgYmxvY2snc1xuLy8gcGFydGlhbENyZWRpdCBmbGFnIGlzIG9uKS4gQXBwbGllZCBhcyBhbiBleHRlbnNpb24gb2YgZWFjaCB2YXJpYW50IHNvIHYzIHJvd3Ncbi8vIChubyBzdWNoIGZpZWxkcykgcmVtYWluIHZhbGlkIHY0IHJvd3MuXG5jb25zdCBWNEV4dHJhcyA9IHtcbiAgbm9Tb2x1dGlvbjogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgZWFybmVkOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkub3B0aW9uYWwoKSxcbiAgdG90YWw6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAvLyBEb21haW4tcmVzdHJpY3RlZCBwbG90X2Z1bmN0aW9uIChyYXlzL3NlZ21lbnRzKTogdGhlIHN0dWRlbnQncyBlbmRwb2ludFxuICAvLyBwb3NpdGlvbnMgKyBvcGVuL2Nsb3NlZCBjaG9pY2VzLiBPcHRpb25hbCBhbmQgYWRkaXRpdmUgd2l0aGluIHY0LlxuICBkb21haW46IHpcbiAgICAub2JqZWN0KHtcbiAgICAgIG1pblg6IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgICAgIG1pblN0eWxlOiB6LmVudW0oWydvcGVuJywgJ2Nsb3NlZCddKS5vcHRpb25hbCgpLFxuICAgICAgbWF4WDogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICAgICAgbWF4U3R5bGU6IHouZW51bShbJ29wZW4nLCAnY2xvc2VkJ10pLm9wdGlvbmFsKCksXG4gICAgfSlcbiAgICAub3B0aW9uYWwoKSxcbn07XG5leHBvcnQgY29uc3QgR3JhcGhSZXNwb25zZVY0ID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFBvaW50UmVzcG9uc2UuZXh0ZW5kKFY0RXh0cmFzKSxcbiAgRnVuY3Rpb25SZXNwb25zZS5leHRlbmQoVjRFeHRyYXMpLFxuICBSZWdpb25SZXNwb25zZS5leHRlbmQoVjRFeHRyYXMpLFxuICBJbmVxdWFsaXR5UmVzcG9uc2UuZXh0ZW5kKFY0RXh0cmFzKSxcbiAgUmF5UmVzcG9uc2UuZXh0ZW5kKFY0RXh0cmFzKSxcbiAgU2VnbWVudFJlc3BvbnNlLmV4dGVuZChWNEV4dHJhcyksXG4gIC8vIEdyYXBoIHN5c3RlbXM6IGFkZGl0aXZlIG1lbWJlcnMuIGVhcm5lZC90b3RhbCAoVjRFeHRyYXMpIGNhcnJ5IHRoZVxuICAvLyBwZXItb2JqZWN0IHBhcnRpYWwgY3JlZGl0OyBub1NvbHV0aW9uL2RvbWFpbiByaWRlIGFsb25nIGJ1dCBhcmUgdW51c2VkIGJ5IGFcbiAgLy8gc3lzdGVtIChrZXB0IGZvciB1bmlvbiB1bmlmb3JtaXR5LCBsaWtlIGV2ZXJ5IG90aGVyIG1lbWJlcikuXG4gIFN5c3RlbUluZXF1YWxpdHlSZXNwb25zZS5leHRlbmQoVjRFeHRyYXMpLFxuICBTeXN0ZW1GdW5jdGlvblJlc3BvbnNlLmV4dGVuZChWNEV4dHJhcyksXG5dKTtcbmV4cG9ydCB0eXBlIEdyYXBoUmVzcG9uc2VWNCA9IHouaW5mZXI8dHlwZW9mIEdyYXBoUmVzcG9uc2VWND47XG5cbi8vIFBlci1zZWN0aW9uIGNoZWNrcG9pbnQgcmVzdWx0LCBjYXB0dXJlZCB3aGVuIGEgc3R1ZGVudCBjbGlja3MgXCJDaGVjayB0aGlzXG4vLyBzZWN0aW9uXCIgaW4gbG9ja2VkL2ZyZWUgc3VibWlzc2lvbiBtb2Rlcy4gS2V5ZWQgYnkgc2VjdGlvbi5pZCBpbiB0aGVcbi8vIHBhcmVudCBTdWJtaXNzaW9uUmVzcG9uc2VzLmNoZWNrcG9pbnRSZXN1bHRzIG1hcC4gTm90IHByZXNlbnQgaW5cbi8vIHNpbmdsZS1tb2RlIHN1Ym1pc3Npb25zIG9yIGZvciBzZWN0aW9ucyB3aXRob3V0IGlzQ2hlY2twb2ludCA9IHRydWUuXG5leHBvcnQgY29uc3QgQ2hlY2twb2ludFJlc3VsdCA9IHoub2JqZWN0KHtcbiAgY2hlY2tlZEF0OiB6LnN0cmluZygpLmRhdGV0aW1lKCksICAgICAgICAgICAgICAgICAgLy8gSVNPIHRpbWVzdGFtcCBmcm9tIHJ1bnRpbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmU6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKSwgLy8gZnJhY3Rpb25hbCB1bmRlciBwYXJ0aWFsQ3JlZGl0ICh2NClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG90YWw6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ2hlY2twb2ludFJlc3VsdCA9IHouaW5mZXI8dHlwZW9mIENoZWNrcG9pbnRSZXN1bHQ+O1xuXG4vLyAtLS0tIEJsYW5rLW1hcCBrZXkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGBibGFua3NgIG1hcCBpcyBrZXllZCBieSBCTEFOSyBpZCBcdTIwMTQgYnV0IHR3byBkaWZmZXJlbnQgaWQgc2hhcGVzIGxlZ2l0aW1hdGVseVxuLy8gbGFuZCBpbiBpdCwgYmVjYXVzZSBNb2RlbCBBIChpbi1lcXVhdGlvbiBtYXRoIGdhcHMpIGRlbGliZXJhdGVseSByZXVzZXMgdGhpcyBtYXBcbi8vIHJhdGhlciB0aGFuIGFkZGluZyBhIHdpcmUgc2hhcGU6XG4vL1xuLy8gICAxLiBCbGFua1Rva2VuLmlkICAgICAgXHUyMDE0IGEgdXVpZC5cbi8vICAgMi4gTWF0aFByb21wdC5pZCAgICAgIFx1MjAxNCAnZycgKyBhIGh5cGhlbi1zdHJpcHBlZCB1dWlkIChcImdjYWI2MmJcdTIwMjZmMDBlMGFcIikuXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PVCBhIHV1aWQsIGFuZCBjYW5ub3QgYmU6IHRoZSBpZCBpcyBlbWJlZGRlZCBpbiBhXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgIGBcXHBsYWNlaG9sZGVyW2lkXXt9YCBtYXJrZXIsIGFuZCBNYXRoTGl2ZSByZWplY3RzXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgIGh5cGhlbnMgdGhlcmUgKHNlZSBNYXRoUHJvbXB0IGluIGlubGluZS50cywgYW5kIHRoZVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICBtaW50aW5nIHNpdGUgaW4gYXBwL2xpYi9tYXJrZG93blRvVGlwdGFwLnRzKS5cbi8vXG4vLyBUaGUgcnVudGltZSByZWdpc3RlcnMgYm90aCBpbnRvIHRoZSBTQU1FIHJlZnMuYmxhbmtzIG1hcCBvbiBwdXJwb3NlIChzZWVcbi8vIHJ1bnRpbWUvaW5pdC50cyBcIk1hdGggcHJvbXB0cyAoTW9kZWwgQSlcIiksIHNvIHN1Ym1pdCBnYXRoZXJzIHRoZW0gdG9nZXRoZXIuXG4vL1xuLy8gUkVHUkVTU0lPTiBUSElTIEZJWEVTIChmb3VuZCAyMDI2LTA3LTI5IGJ5IHN1Ym1pdHRpbmcgYSByZWFsIHB1Ymxpc2hlZCBwYWdlKTpcbi8vIHRoaXMga2V5IHdhcyBgei5zdHJpbmcoKS51dWlkKClgLCBzbyBFVkVSWSBzdWJtaXNzaW9uIGZyb20gYW4gYWN0aXZpdHlcbi8vIGNvbnRhaW5pbmcgYSBtYXRoIGdhcCB3YXMgcmVqZWN0ZWQgYnkgaW5nZXN0LXN1Ym1pc3Npb24gd2l0aFxuLy8gYHJlc3BvbnNlcyBmYWlsZWQgc2NoZW1hIHZhbGlkYXRpb24gLyBJbnZhbGlkIHV1aWRgLiBNb2RlbCBBIHNoaXBwZWRcbi8vIDIwMjYtMDctMjIgYW5kIHdhcyBuZXZlciBzdWJtaXR0YWJsZSBcdTIwMTQgaXRzIHVuaXQgdGVzdHMgY292ZXJlZCB0aGUgZG9jdW1lbnRcbi8vIHNjaGVtYSBhbmQgdGhlIGNhcHR1cmUgYnJpZGdlLCBidXQgbm90aGluZyBjb25zdHJ1Y3RlZCBhIFN1Ym1pc3Npb25SZXNwb25zZXMsXG4vLyBzbyB0aGUgdHdvIGNvcnJlY3QgaGFsdmVzIG5ldmVyIG1ldC4gV2lkZW5pbmcgdGhlIEtFWSBpcyB0aGUgd2hvbGUgZml4OyB0aGVcbi8vIHZhbHVlIHNoYXBlIGlzIHVudG91Y2hlZC5cbmNvbnN0IEJMQU5LX0lEX0tFWSA9IHpcbiAgLnN0cmluZygpXG4gIC5yZWZpbmUoXG4gICAgKHMpID0+XG4gICAgICAvXlswLTlhLWZdezh9LVswLTlhLWZdezR9LVswLTlhLWZdezR9LVswLTlhLWZdezR9LVswLTlhLWZdezEyfSQvaS50ZXN0KHMpIHx8XG4gICAgICAvXmdbMC05YS1mXXszMn0kL2kudGVzdChzKSxcbiAgICB7IG1lc3NhZ2U6ICdCbGFuayBpZCBtdXN0IGJlIGEgdXVpZCBvciBhIG1hdGgtZ2FwIGlkIChnICsgMzIgaGV4KScgfSxcbiAgKTtcblxuLy8gLS0tLSB2MSAobGVnYWN5KSBzaGFwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFByZS1TdGFnZS05YSBzdWJtaXNzaW9ucy4gS2VwdCBzbyB3ZSBjYW4gcmVhZCBvbGQgcm93cyBmcm9tIHRoZSBkYXRhYmFzZVxuLy8gYW5kIG1pZ3JhdGUgdGhlbSBmb3J3YXJkIG9uIHJlYWQuIE5ldmVyIHdyaXR0ZW4gYnkgbmV3IGNvZGUuXG5leHBvcnQgY29uc3QgU3VibWlzc2lvblJlc3BvbnNlc1YxID0gei5vYmplY3Qoe1xuICBzY2hlbWFWZXJzaW9uOiB6LmxpdGVyYWwoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxhbmtzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgei5vYmplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiB6LnN0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbn0pO1xuZXhwb3J0IHR5cGUgU3VibWlzc2lvblJlc3BvbnNlc1YxID0gei5pbmZlcjx0eXBlb2YgU3VibWlzc2lvblJlc3BvbnNlc1YxPjtcblxuLy8gLS0tLSB2MiAobGVnYWN5KSBzaGFwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFByZS1TdGFnZS01IHN1Ym1pc3Npb25zLiBLZXB0IHNvIHdlIGNhbiByZWFkIG9sZCByb3dzIGFuZCBtaWdyYXRlIHRoZW1cbi8vIGZvcndhcmQgb24gcmVhZC4gTmV2ZXIgd3JpdHRlbiBieSBuZXcgY29kZS5cbmV4cG9ydCBjb25zdCBTdWJtaXNzaW9uUmVzcG9uc2VzVjIgPSB6Lm9iamVjdCh7XG4gIHNjaGVtYVZlcnNpb246IHoubGl0ZXJhbCgyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBibGFua3M6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBCbGFua1Jlc3BvbnNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja3BvaW50UmVzdWx0czogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIENoZWNrcG9pbnRSZXN1bHQpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFN1Ym1pc3Npb25SZXNwb25zZXNWMiA9IHouaW5mZXI8dHlwZW9mIFN1Ym1pc3Npb25SZXNwb25zZXNWMj47XG5cbi8vIC0tLS0gdjMgKGxlZ2FjeSkgc2hhcGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFByZS1Ecm9wLTQgc3VibWlzc2lvbnMgKGFuZCBwYWdlcyBwdWJsaXNoZWQgYmVmb3JlIHRoZSB2NCBydW50aW1lIHRoYXQgYXJlXG4vLyBzdGlsbCBsaXZlKS4gS2VwdCBzbyBpbmdlc3Qga2VlcHMgQUNDRVBUSU5HIHYzIHBvc3RzIGFuZCBzdG9yZWQgcm93cyBtaWdyYXRlXG4vLyBmb3J3YXJkIG9uIHJlYWQuIE5ldmVyIHdyaXR0ZW4gYnkgbmV3IGNvZGUuXG5leHBvcnQgY29uc3QgU3VibWlzc2lvblJlc3BvbnNlc1YzID0gei5vYmplY3Qoe1xuICBzY2hlbWFWZXJzaW9uOiB6LmxpdGVyYWwoMyksXG4gIGJsYW5rczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIEJsYW5rUmVzcG9uc2UpLFxuICBjaGVja3BvaW50UmVzdWx0czogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIENoZWNrcG9pbnRSZXN1bHQpLm9wdGlvbmFsKCksXG4gIGdyYXBoUmVzcG9uc2VzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgR3JhcGhSZXNwb25zZSkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgU3VibWlzc2lvblJlc3BvbnNlc1YzID0gei5pbmZlcjx0eXBlb2YgU3VibWlzc2lvblJlc3BvbnNlc1YzPjtcblxuLy8gLS0tLSB2NCAobGVnYWN5KSBzaGFwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHJlLW11bHRpcGxlLWNob2ljZSBzdWJtaXNzaW9ucyAoYW5kIHBhZ2VzIHB1Ymxpc2hlZCBiZWZvcmUgdGhlIHY1IHJ1bnRpbWVcbi8vIHRoYXQgYXJlIHN0aWxsIGxpdmUpLiBLZXB0IHNvIGluZ2VzdCBrZWVwcyBBQ0NFUFRJTkcgdjQgcG9zdHMgYW5kIHN0b3JlZCByb3dzXG4vLyBtaWdyYXRlIGZvcndhcmQgb24gcmVhZC4gTmV2ZXIgd3JpdHRlbiBieSBuZXcgY29kZS5cbmV4cG9ydCBjb25zdCBTdWJtaXNzaW9uUmVzcG9uc2VzVjQgPSB6Lm9iamVjdCh7XG4gIHNjaGVtYVZlcnNpb246IHoubGl0ZXJhbCg0KSxcbiAgYmxhbmtzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQmxhbmtSZXNwb25zZSksXG4gIGNoZWNrcG9pbnRSZXN1bHRzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQ2hlY2twb2ludFJlc3VsdCkub3B0aW9uYWwoKSxcbiAgZ3JhcGhSZXNwb25zZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBHcmFwaFJlc3BvbnNlVjQpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFN1Ym1pc3Npb25SZXNwb25zZXNWNCA9IHouaW5mZXI8dHlwZW9mIFN1Ym1pc3Npb25SZXNwb25zZXNWND47XG5cbi8vIE9uZSBtdWx0aXBsZV9jaG9pY2UgYmxvY2sncyByZXNwb25zZTogd2hpY2ggY2hvaWNlIGlkcyB0aGUgc3R1ZGVudCBzZWxlY3RlZFxuLy8gKG9uZSBmb3Igc2luZ2xlLXNlbGVjdCwgYW55IG51bWJlciBmb3IgbXVsdGktc2VsZWN0KSBwbHVzIHRoZSBzYW1lXG4vLyBjb3JyZWN0bmVzcy9jb25maWRlbmNlIGZpZWxkcyBibGFua3MgaGF2ZS4gTGlrZSBCbGFua1Jlc3BvbnNlLCBgY29ycmVjdGAgaXNcbi8vIGNvbXB1dGVkIENMSUVOVC1TSURFIGluIHRoZSBwdWJsaXNoZWQgcGFnZSdzIHJ1bnRpbWUgKHRoZSBhbnN3ZXIga2V5IGlzXG4vLyBiYWtlZCBpbnRvIHRoZSBIVE1MKSBcdTIwMTQgY29udmVuaWVuY2UgZm9yIHRoZSB0ZWFjaGVyIHZpZXdlciwgbm90IGF1dGhvcml0YXRpdmVcbi8vIGdyYWRpbmcuIEFsbC1vci1ub3RoaW5nOiBjb3JyZWN0IG1lYW5zIHRoZSBzZWxlY3RlZCBTRVQgZXF1YWxzIHRoZSBjb3JyZWN0XG4vLyBzZXQgKHBlci1jaG9pY2UgcGFydGlhbCBjcmVkaXQgaXMgYSBmdXR1cmUgYWRkaXRpdmUgZmllbGQsIG1pcnJvcmluZyB0aGVcbi8vIGdyYXBoIGJsb2NrJ3MgZWFybmVkL3RvdGFsIHByZWNlZGVudCkuXG5leHBvcnQgY29uc3QgQ2hvaWNlUmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIC8vIFNlbGVjdGVkIGNob2ljZSBpZHMgKE11bHRpcGxlQ2hvaWNlT3B0aW9uLmlkKSwgaW4gZG9jdW1lbnQgb3JkZXIuXG4gIC8vIE5vbi1lbXB0eTogYW4gdW5hbnN3ZXJlZCBibG9jayBpcyBzaW1wbHkgYWJzZW50IGZyb20gdGhlIG1hcCAoYW5cbiAgLy8gb21pc3Npb24pLCBsaWtlIGFuIHVuYW5zd2VyZWQgZ3JhcGguXG4gIHNlbGVjdGVkOiB6LmFycmF5KHouc3RyaW5nKCkudXVpZCgpKS5taW4oMSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ2hvaWNlUmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBDaG9pY2VSZXNwb25zZT47XG5cbi8vIC0tLS0gdjUgKGxlZ2FjeSkgc2hhcGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFByZS1tYXRjaGluZy9vcmRlcmluZyBzdWJtaXNzaW9ucyAoYW5kIHBhZ2VzIHB1Ymxpc2hlZCBiZWZvcmUgdGhlIHY2IHJ1bnRpbWVcbi8vIHRoYXQgYXJlIHN0aWxsIGxpdmUpLiBLZXB0IHNvIGluZ2VzdCBrZWVwcyBBQ0NFUFRJTkcgdjUgcG9zdHMgYW5kIHN0b3JlZCByb3dzXG4vLyBtaWdyYXRlIGZvcndhcmQgb24gcmVhZC4gTmV2ZXIgd3JpdHRlbiBieSBuZXcgY29kZS5cbmV4cG9ydCBjb25zdCBTdWJtaXNzaW9uUmVzcG9uc2VzVjUgPSB6Lm9iamVjdCh7XG4gIHNjaGVtYVZlcnNpb246IHoubGl0ZXJhbCg1KSxcbiAgYmxhbmtzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQmxhbmtSZXNwb25zZSksXG4gIGNoZWNrcG9pbnRSZXN1bHRzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQ2hlY2twb2ludFJlc3VsdCkub3B0aW9uYWwoKSxcbiAgZ3JhcGhSZXNwb25zZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBHcmFwaFJlc3BvbnNlVjQpLm9wdGlvbmFsKCksXG4gIGNob2ljZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBDaG9pY2VSZXNwb25zZSkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgU3VibWlzc2lvblJlc3BvbnNlc1Y1ID0gei5pbmZlcjx0eXBlb2YgU3VibWlzc2lvblJlc3BvbnNlc1Y1PjtcblxuLy8gT25lIG1hdGNoaW5nIGJsb2NrJ3MgcmVzcG9uc2U6IHdoaWNoIHRhcmdldCB0aGUgc3R1ZGVudCBkb2NrZWQgb24gZWFjaCBpdGVtLlxuLy8gTGlrZSBCbGFua1Jlc3BvbnNlLCBgY29ycmVjdGAgaXMgY29tcHV0ZWQgQ0xJRU5ULVNJREUgaW4gdGhlIHB1Ymxpc2hlZCBwYWdlJ3Ncbi8vIHJ1bnRpbWUgKHRoZSBhbnN3ZXIga2V5IGlzIGJha2VkIGludG8gdGhlIEhUTUwpIFx1MjAxNCBjb252ZW5pZW5jZSBmb3IgdGhlIHRlYWNoZXJcbi8vIHZpZXdlciwgbm90IGF1dGhvcml0YXRpdmUgZ3JhZGluZy4gU2NvcmVkIFBFUiBQQUlSOiBgZWFybmVkYCBvZiBgdG90YWxgIGl0ZW1zXG4vLyBjYXJyeSB0aGUga2V5ZWQgdGFyZ2V0IChgdG90YWxgID0gdGhlIGJsb2NrJ3MgaXRlbSBjb3VudCwgc28gYW4gdW5wYWlyZWQgaXRlbVxuLy8gd2l0aGluIGFuIGFuc3dlcmVkIGJsb2NrIHNjb3JlcyBhcyBhIHdyb25nIHBhaXIpOyBgY29ycmVjdGAgPSBlYXJuZWQgPT09IHRvdGFsLlxuZXhwb3J0IGNvbnN0IE1hdGNoUmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIC8vIGl0ZW0gaWQgXHUyMTkyIGRvY2tlZCB0YXJnZXQgaWQuIE5vbi1lbXB0eTogYSBibG9jayB3aXRoIG5vIHBhaXJzIG1hZGUgaXMgYW5cbiAgLy8gb21pc3Npb24gKGFic2VudCBmcm9tIHRoZSBtYXApLCBsaWtlIGFuIHVuYW5zd2VyZWQgZ3JhcGggb3IgTUMgYmxvY2suXG4gIHBhaXJzOiB6XG4gICAgLnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgei5zdHJpbmcoKS51dWlkKCkpXG4gICAgLnJlZmluZSgocGFpcnMpID0+IE9iamVjdC5rZXlzKHBhaXJzKS5sZW5ndGggPiAwLCB7XG4gICAgICBtZXNzYWdlOiAnYW4gYW5zd2VyZWQgbWF0Y2hpbmcgYmxvY2sgaGFzIGF0IGxlYXN0IG9uZSBwYWlyJyxcbiAgICB9KSxcbiAgY29ycmVjdDogei5ib29sZWFuKCksXG4gIGVhcm5lZDogei5udW1iZXIoKS5pbnQoKS5ub25uZWdhdGl2ZSgpLFxuICB0b3RhbDogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgTWF0Y2hSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIE1hdGNoUmVzcG9uc2U+O1xuXG4vLyBPbmUgb3JkZXJpbmcgYmxvY2sncyByZXNwb25zZTogdGhlIHN0dWRlbnQncyBmdWxsIGFycmFuZ2VtZW50IChldmVyeSBpdGVtIGlkLFxuLy8gaW4gdGhlaXIgY2hvc2VuIHNlcXVlbmNlKS4gQWxsLW9yLW5vdGhpbmc6IGBjb3JyZWN0YCA9IHRoZSBzZXF1ZW5jZSBlcXVhbHNcbi8vIHRoZSBhdXRob3JlZCBvcmRlciBleGFjdGx5LiBBbiB1bnRvdWNoZWQgKHN0aWxsLXNodWZmbGVkKSBsaXN0IGlzIGFuXG4vLyBvbWlzc2lvbiBcdTIwMTQgdGhlIHJ1bnRpbWUgb25seSByZWNvcmRzIGEgcmVzcG9uc2Ugb25jZSB0aGUgc3R1ZGVudCBoYXMgbW92ZWRcbi8vIHNvbWV0aGluZy5cbmV4cG9ydCBjb25zdCBPcmRlclJlc3BvbnNlID0gei5vYmplY3Qoe1xuICBvcmRlcjogei5hcnJheSh6LnN0cmluZygpLnV1aWQoKSkubWluKDIpLFxuICBjb3JyZWN0OiB6LmJvb2xlYW4oKSxcbiAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE9yZGVyUmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBPcmRlclJlc3BvbnNlPjtcblxuLy8gT25lIG51bWJlcl9saW5lIGJsb2NrJ3MgcmVzcG9uc2UgKDEtRCkuIExpa2UgQmxhbmtSZXNwb25zZSwgYGNvcnJlY3RgIGlzXG4vLyBjb21wdXRlZCBDTElFTlQtU0lERSBpbiB0aGUgcHVibGlzaGVkIHBhZ2UncyBsYXp5IGtpdCAodGhlIGFuc3dlciBrZXkgaXMgYmFrZWRcbi8vIGludG8gdGhlIEhUTUwpIFx1MjAxNCBjb252ZW5pZW5jZSBmb3IgdGhlIHRlYWNoZXIgdmlld2VyLCBub3QgYXV0aG9yaXRhdGl2ZVxuLy8gZ3JhZGluZy4gRGlzY3JpbWluYXRlZCBvbiBgdHlwZWAgc28gcGxvdF9yYXkgLyBkaXNwbGF5IGFkZCBhIHZhcmlhbnQgaGVyZSB3aXRoXG4vLyBubyBjb25zdW1lciBjaGFuZ2UuIFNsaWNlIDEgc2hpcHMgcGxvdF9wb2ludCArIHBsb3RfaW50ZXJ2YWwuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZVBvaW50UmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9wb2ludCcpLFxuICAvLyBFdmVyeSBwb3NpdGlvbiB0aGUgc3R1ZGVudCBwbG90dGVkLCBpbiBsaW5lIHVuaXRzLiBPcmRlciBmb2xsb3dzIHRoZSBibG9jaydzXG4gIC8vIGNvcnJlY3RQb2ludHMgZm9yIG11bHRpLXBvaW50IHF1ZXN0aW9uczsgYSBzaW5nbGUgcG9pbnQgaXMgdGhlIGNvbW1vbiBjYXNlLlxuICBzdHVkZW50UG9pbnRzOiB6LmFycmF5KHoubnVtYmVyKCkpLFxuICBjb3JyZWN0OiB6LmJvb2xlYW4oKSxcbiAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVQb2ludFJlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgTnVtYmVyTGluZVBvaW50UmVzcG9uc2U+O1xuXG4vLyBwbG90X2ludGVydmFsOiB0aGUgc3R1ZGVudCdzIGludGVydmFsL3JheSBcdTIwMTQgcHJlc2VudCBib3VuZHMgKyBvcGVuL2Nsb3NlZFxuLy8gc3R5bGVzLCBzYW1lIHNoYXBlIGFzIHRoZSBibG9jaydzIGNvcnJlY3RJbnRlcnZhbC4gQW4gYWJzZW50IGJvdW5kIGlzIGFuXG4vLyB1bmJvdW5kZWQgKHJheSkgZW5kLlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVJbnRlcnZhbFJlc3BvbnNlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3RfaW50ZXJ2YWwnKSxcbiAgbWluOiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIG1pblN0eWxlOiB6LmVudW0oWydvcGVuJywgJ2Nsb3NlZCddKS5vcHRpb25hbCgpLFxuICBtYXg6IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgbWF4U3R5bGU6IHouZW51bShbJ29wZW4nLCAnY2xvc2VkJ10pLm9wdGlvbmFsKCksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZUludGVydmFsUmVzcG9uc2UgPSB6LmluZmVyPFxuICB0eXBlb2YgTnVtYmVyTGluZUludGVydmFsUmVzcG9uc2Vcbj47XG5cbmV4cG9ydCBjb25zdCBOdW1iZXJMaW5lUmVzcG9uc2UgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgTnVtYmVyTGluZVBvaW50UmVzcG9uc2UsXG4gIE51bWJlckxpbmVJbnRlcnZhbFJlc3BvbnNlLFxuXSk7XG5leHBvcnQgdHlwZSBOdW1iZXJMaW5lUmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBOdW1iZXJMaW5lUmVzcG9uc2U+O1xuXG4vLyBPbmUgZGF0YV9wbG90IGJsb2NrJ3MgcmVzcG9uc2UuIExpa2UgQmxhbmtSZXNwb25zZSwgYGNvcnJlY3RgIGlzIGNvbXB1dGVkXG4vLyBDTElFTlQtU0lERSBpbiB0aGUgcHVibGlzaGVkIHBhZ2UncyBsYXp5IGtpdCAodGhlIGFuc3dlciBrZXkgXHUyMDE0IHRoZSBmcmVxdWVuY3lcbi8vIGRpc3RyaWJ1dGlvbiBvZiB0aGUgYmxvY2sncyBkYXRhc2V0IFx1MjAxNCBpcyBkZXJpdmVkIGluIHRoZSBIVE1MKSBcdTIwMTQgY29udmVuaWVuY2Vcbi8vIGZvciB0aGUgdGVhY2hlciB2aWV3ZXIsIG5vdCBhdXRob3JpdGF0aXZlIGdyYWRpbmcuIERpc2NyaW1pbmF0ZWQgb24gYHR5cGVgXG4vLyBzbyBidWlsZF9oaXN0b2dyYW0gLyBidWlsZF9ib3hwbG90IGFkZCBhIHZhcmlhbnQgaGVyZSB3aXRoIG5vIGNvbnN1bWVyXG4vLyBjaGFuZ2UuIFNsaWNlIDEgc2hpcHMgYnVpbGRfZG90cGxvdDsgYGRpc3BsYXlgIGRhdGFfcGxvdHMgYXJlIHVuZ3JhZGVkXG4vLyBzdGltdWxpIGFuZCBuZXZlciBwcm9kdWNlIGEgcmVzcG9uc2UuXG5leHBvcnQgY29uc3QgRGF0YVBsb3REb3RwbG90UmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnYnVpbGRfZG90cGxvdCcpLFxuICAvLyBFdmVyeSBkb3QgdGhlIHN0dWRlbnQgcGxhY2VkLCBhcyBpdHMgdmFsdWUgb24gdGhlIGF4aXMgKGEgbXVsdGlzZXQgXHUyMDE0IHRoZVxuICAvLyBmcmVxdWVuY3kgbWFwIGRlcml2ZXMgZnJvbSBjb3VudGluZykuIE5vbi1lbXB0eTogYSBibG9jayB3aXRoIG5vIGRvdHMgaXMgYW5cbiAgLy8gb21pc3Npb24gKGFic2VudCBmcm9tIHRoZSBtYXApLCBsaWtlIGFuIHVuYW5zd2VyZWQgZ3JhcGggb3IgbnVtYmVyIGxpbmUuXG4gIHN0dWRlbnRWYWx1ZXM6IHouYXJyYXkoei5udW1iZXIoKSkubWluKDEpLFxuICBjb3JyZWN0OiB6LmJvb2xlYW4oKSxcbiAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIERhdGFQbG90RG90cGxvdFJlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3REb3RwbG90UmVzcG9uc2U+O1xuXG4vLyBidWlsZF9oaXN0b2dyYW06IHRoZSBzdHVkZW50J3MgcGVyLWJpbiBmcmVxdWVuY2llcywgaW4gYmluIG9yZGVyIChsZWZ0XHUyMTkycmlnaHQpLlxuLy8gTm9uLWVtcHR5OyBhbiB1bnRvdWNoZWQgaGlzdG9ncmFtIGlzIGFuIG9taXNzaW9uIChhYnNlbnQgZnJvbSB0aGUgbWFwKS5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdEhpc3RvZ3JhbVJlc3BvbnNlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2J1aWxkX2hpc3RvZ3JhbScpLFxuICBzdHVkZW50Qmluczogei5hcnJheSh6Lm51bWJlcigpKS5taW4oMSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RIaXN0b2dyYW1SZXNwb25zZSA9IHouaW5mZXI8XG4gIHR5cGVvZiBEYXRhUGxvdEhpc3RvZ3JhbVJlc3BvbnNlXG4+O1xuXG4vLyBidWlsZF9ib3hwbG90OiB0aGUgc3R1ZGVudCdzIHBsYWNlZCBmaXZlLW51bWJlciBzdW1tYXJ5IChsaW5lIHVuaXRzKS5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdEJveHBsb3RSZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdidWlsZF9ib3hwbG90JyksXG4gIHN0dWRlbnRGaXZlOiB6Lm9iamVjdCh7XG4gICAgbWluOiB6Lm51bWJlcigpLFxuICAgIHExOiB6Lm51bWJlcigpLFxuICAgIG1lZGlhbjogei5udW1iZXIoKSxcbiAgICBxMzogei5udW1iZXIoKSxcbiAgICBtYXg6IHoubnVtYmVyKCksXG4gIH0pLFxuICBjb3JyZWN0OiB6LmJvb2xlYW4oKSxcbiAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIERhdGFQbG90Qm94cGxvdFJlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3RCb3hwbG90UmVzcG9uc2U+O1xuXG4vLyBUaGUgdGhyZWUgYnVpbGQgdmFyaWFudHMgYXJlIGFkZGl0aXZlIG1lbWJlcnM6IHdpZGVuaW5nIHRoZSB1bmlvbiBvbmx5IEFDQ0VQVFNcbi8vIE1PUkUsIHNvIHBhZ2VzIHRoYXQgZW1pdCBoaXN0b2dyYW0vYm94IHJlc3BvbnNlcyAocHVibGlzaGVkIGFmdGVyIHRoZSBpbmdlc3Rcbi8vIHRoYXQgY2FycmllcyB0aGlzIHdpZGVuZWQgdW5pb24pIG5lZWQgbm8gd2lyZS1mb3JtYXQgYnVtcCBcdTIwMTQgdGhlIHNhbWUgZGlzY2lwbGluZVxuLy8gdGhlIGdyYXBoIGJsb2NrJ3MgcGxvdF9yYXkvcGxvdF9zZWdtZW50IHVzZWQgd2l0aGluIHY0LiBBIGJ1aWxkX2RvdHBsb3Qtb25seVxuLy8gcGFnZSBrZWVwcyB2YWxpZGF0aW5nLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90UmVzcG9uc2UgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgRGF0YVBsb3REb3RwbG90UmVzcG9uc2UsXG4gIERhdGFQbG90SGlzdG9ncmFtUmVzcG9uc2UsXG4gIERhdGFQbG90Qm94cGxvdFJlc3BvbnNlLFxuXSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdFJlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3RSZXNwb25zZT47XG5cbi8vIC0tLS0gdjYgKGxlZ2FjeSkgc2hhcGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFByZS1udW1iZXItbGluZSBzdWJtaXNzaW9ucyAoYW5kIHBhZ2VzIHB1Ymxpc2hlZCBiZWZvcmUgdGhlIHY3IHJ1bnRpbWUgdGhhdFxuLy8gYXJlIHN0aWxsIGxpdmUpLiBLZXB0IHNvIGluZ2VzdCBrZWVwcyBBQ0NFUFRJTkcgdjYgcG9zdHMgYW5kIHN0b3JlZCByb3dzXG4vLyBtaWdyYXRlIGZvcndhcmQgb24gcmVhZC4gTmV2ZXIgd3JpdHRlbiBieSBuZXcgY29kZS5cbmV4cG9ydCBjb25zdCBTdWJtaXNzaW9uUmVzcG9uc2VzVjYgPSB6Lm9iamVjdCh7XG4gIHNjaGVtYVZlcnNpb246IHoubGl0ZXJhbCg2KSxcbiAgYmxhbmtzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQmxhbmtSZXNwb25zZSksXG4gIGNoZWNrcG9pbnRSZXN1bHRzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQ2hlY2twb2ludFJlc3VsdCkub3B0aW9uYWwoKSxcbiAgZ3JhcGhSZXNwb25zZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBHcmFwaFJlc3BvbnNlVjQpLm9wdGlvbmFsKCksXG4gIGNob2ljZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBDaG9pY2VSZXNwb25zZSkub3B0aW9uYWwoKSxcbiAgbWF0Y2hlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIE1hdGNoUmVzcG9uc2UpLm9wdGlvbmFsKCksXG4gIG9yZGVyaW5nczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIE9yZGVyUmVzcG9uc2UpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFN1Ym1pc3Npb25SZXNwb25zZXNWNiA9IHouaW5mZXI8dHlwZW9mIFN1Ym1pc3Npb25SZXNwb25zZXNWNj47XG5cbi8vIC0tLS0gdjcgKGxlZ2FjeSkgc2hhcGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFByZS1kYXRhLXBsb3Qgc3VibWlzc2lvbnMgKGFuZCBwYWdlcyBwdWJsaXNoZWQgYmVmb3JlIHRoZSB2OCBydW50aW1lIHRoYXQgYXJlXG4vLyBzdGlsbCBsaXZlKS4gS2VwdCBzbyBpbmdlc3Qga2VlcHMgQUNDRVBUSU5HIHY3IHBvc3RzIGFuZCBzdG9yZWQgcm93cyBtaWdyYXRlXG4vLyBmb3J3YXJkIG9uIHJlYWQuIE5ldmVyIHdyaXR0ZW4gYnkgbmV3IGNvZGUuXG5leHBvcnQgY29uc3QgU3VibWlzc2lvblJlc3BvbnNlc1Y3ID0gei5vYmplY3Qoe1xuICBzY2hlbWFWZXJzaW9uOiB6LmxpdGVyYWwoNyksXG4gIGJsYW5rczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIEJsYW5rUmVzcG9uc2UpLFxuICBjaGVja3BvaW50UmVzdWx0czogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIENoZWNrcG9pbnRSZXN1bHQpLm9wdGlvbmFsKCksXG4gIGdyYXBoUmVzcG9uc2VzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgR3JhcGhSZXNwb25zZVY0KS5vcHRpb25hbCgpLFxuICBjaG9pY2VzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQ2hvaWNlUmVzcG9uc2UpLm9wdGlvbmFsKCksXG4gIG1hdGNoZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBNYXRjaFJlc3BvbnNlKS5vcHRpb25hbCgpLFxuICBvcmRlcmluZ3M6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBPcmRlclJlc3BvbnNlKS5vcHRpb25hbCgpLFxuICBudW1iZXJMaW5lUmVzcG9uc2VzOiB6XG4gICAgLnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgTnVtYmVyTGluZVJlc3BvbnNlKVxuICAgIC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBTdWJtaXNzaW9uUmVzcG9uc2VzVjcgPSB6LmluZmVyPHR5cGVvZiBTdWJtaXNzaW9uUmVzcG9uc2VzVjc+O1xuXG4vLyBPbmUgc2VsZl9leHBsYW5hdGlvbiBibG9jaydzIHJlc3BvbnNlOiB0aGUgZnJlZSB0ZXh0IHRoZSBzdHVkZW50IHdyb3RlLlxuLy8gVU5HUkFERUQgXHUyMDE0IHRoZXJlIGlzIG5vIGBjb3JyZWN0YCBmaWVsZCBhbmQgaXQgbmV2ZXIgY29udHJpYnV0ZXMgdG8gdGhlIHNjb3JlO1xuLy8gdGhlIHRlYWNoZXIgZGFzaGJvYXJkIHNob3dzIHRoZSB0ZXh0IHJhdy4gVGhpcyBpcyB0aGUgc2hhcGUgdGhlIHJlc2VydmVkXG4vLyBgZnJlZVJlc3BvbnNlc2AgbWFwIGNhcnJpZXMsIGFuZCBpdCBpcyBkZWxpYmVyYXRlbHkgbWluaW1hbCAoanVzdCBhIHN0cmluZylcbi8vIHNvIFBoYXNlIDIuNiBzaG9ydF9hbnN3ZXIgLyBlc3NheSByZXVzZSBpdCB1bmNoYW5nZWQgXHUyMDE0IHRoZWlyIGdyYWRpbmcgbGl2ZXMgaW5cbi8vIGEgc2VwYXJhdGUgdGFibGUsIG5vdCBpbiB0aGUgcmVzcG9uc2UuIE5vbi1lbXB0eTogYW4gdW50b3VjaGVkIHByb21wdCBpcyBhblxuLy8gb21pc3Npb24gKGFic2VudCBmcm9tIHRoZSBtYXApLCBsaWtlIGFueSBvdGhlciB1bmFuc3dlcmVkIGJsb2NrLlxuZXhwb3J0IGNvbnN0IEZyZWVSZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgdGV4dDogei5zdHJpbmcoKS5taW4oMSksXG59KTtcbmV4cG9ydCB0eXBlIEZyZWVSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIEZyZWVSZXNwb25zZT47XG5cbi8vIC0tLS0gdjggKGxlZ2FjeSkgc2hhcGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFByZS1zZWxmLWV4cGxhbmF0aW9uIHN1Ym1pc3Npb25zIChhbmQgcGFnZXMgcHVibGlzaGVkIGJlZm9yZSB0aGUgdjkgcnVudGltZVxuLy8gdGhhdCBhcmUgc3RpbGwgbGl2ZSkuIEtlcHQgc28gaW5nZXN0IGtlZXBzIEFDQ0VQVElORyB2OCBwb3N0cyBhbmQgc3RvcmVkIHJvd3Ncbi8vIG1pZ3JhdGUgZm9yd2FyZCBvbiByZWFkLiBOZXZlciB3cml0dGVuIGJ5IG5ldyBjb2RlLlxuZXhwb3J0IGNvbnN0IFN1Ym1pc3Npb25SZXNwb25zZXNWOCA9IHoub2JqZWN0KHtcbiAgc2NoZW1hVmVyc2lvbjogei5saXRlcmFsKDgpLFxuICBibGFua3M6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBCbGFua1Jlc3BvbnNlKSxcbiAgY2hlY2twb2ludFJlc3VsdHM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBDaGVja3BvaW50UmVzdWx0KS5vcHRpb25hbCgpLFxuICBncmFwaFJlc3BvbnNlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIEdyYXBoUmVzcG9uc2VWNCkub3B0aW9uYWwoKSxcbiAgY2hvaWNlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIENob2ljZVJlc3BvbnNlKS5vcHRpb25hbCgpLFxuICBtYXRjaGVzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgTWF0Y2hSZXNwb25zZSkub3B0aW9uYWwoKSxcbiAgb3JkZXJpbmdzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgT3JkZXJSZXNwb25zZSkub3B0aW9uYWwoKSxcbiAgbnVtYmVyTGluZVJlc3BvbnNlczogelxuICAgIC5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIE51bWJlckxpbmVSZXNwb25zZSlcbiAgICAub3B0aW9uYWwoKSxcbiAgZGF0YVBsb3RSZXNwb25zZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBEYXRhUGxvdFJlc3BvbnNlKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBTdWJtaXNzaW9uUmVzcG9uc2VzVjggPSB6LmluZmVyPHR5cGVvZiBTdWJtaXNzaW9uUmVzcG9uc2VzVjg+O1xuXG4vLyAtLS0tIHY5IChjdXJyZW50KSBzaGFwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBOZXcgc3VibWlzc2lvbnMgd3JpdGUgdGhpcyBzaGFwZS4gdjggXHUyMTkyIHY5IChzZWxmLWV4cGxhbmF0aW9uKTogYWRkcyB0aGVcbi8vIG9wdGlvbmFsIGBmcmVlUmVzcG9uc2VzYCBtYXAgKHVuZ3JhZGVkIGZyZWUgdGV4dCkuIEFwcGxpY2F0aW9uIGNvZGUgdGhhdCByZWFkc1xuLy8gc3VibWlzc2lvbnMgY2FsbHMgbWlncmF0ZVN1Ym1pc3Npb25SZXNwb25zZXMoKSBvbmNlIGFmdGVyIHJlYWRpbmcgdG8gaGFuZGxlXG4vLyB2MVx1MjAxM3Y5IHVuaWZvcm1seS5cbmV4cG9ydCBjb25zdCBTdWJtaXNzaW9uUmVzcG9uc2VzID0gei5vYmplY3Qoe1xuICBzY2hlbWFWZXJzaW9uOiB6LmxpdGVyYWwoOSksXG4gIC8vIEtleWVkIGJ5IGJsYW5rLmlkIFx1MjAxNCBhIHV1aWQsIE9SIGEgbWF0aC1nYXAgaWQgKE1vZGVsIEEpLiBTZWUgQkxBTktfSURfS0VZLlxuICAvLyBPbmx5IHRoZSBDVVJSRU5UIHZlcnNpb24gaXMgd2lkZW5lZDogZ2FwcyBwb3N0ZGF0ZSB2OSBhbmQgc2hpcHBlZCB3aXRob3V0IGFcbiAgLy8gd2lyZSBidW1wLCBzbyBldmVyeSBnYXAtYmVhcmluZyBwYWdlIHNlbmRzIHY5LiBUaGUgZnJvemVuIHYxXHUyMDEzdjggc2hhcGVzIHN0YXlcbiAgLy8gdXVpZC1vbmx5LCB3aGljaCBpcyB3aGF0IHRoZXkgY291bGQgZXZlciBoYXZlIGNvbnRhaW5lZC5cbiAgYmxhbmtzOiB6LnJlY29yZChCTEFOS19JRF9LRVksIEJsYW5rUmVzcG9uc2UpLFxuICAvLyBLZXllZCBieSBzZWN0aW9uLmlkLiBPbmx5IHByZXNlbnQgaW4gbG9ja2VkL2ZyZWUgc3VibWlzc2lvbiBtb2RlcyBmb3JcbiAgLy8gc2VjdGlvbnMgdGhhdCB3ZXJlIGFjdHVhbGx5IGNoZWNrcG9pbnQtY2hlY2tlZC4gQWJzZW50IGluIHNpbmdsZSBtb2RlXG4gIC8vIGFuZCBhYnNlbnQgZm9yIG5vbi1jaGVja3BvaW50IHNlY3Rpb25zLlxuICBjaGVja3BvaW50UmVzdWx0czogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIENoZWNrcG9pbnRSZXN1bHQpLm9wdGlvbmFsKCksXG4gIC8vIEtleWVkIGJ5IGludGVyYWN0aXZlX2dyYXBoIGJsb2NrLmlkICh1dWlkKS4gQWJzZW50IHdoZW4gdGhlIGFjdGl2aXR5XG4gIC8vIGhhcyBubyBncmFwaCBibG9ja3Mgb3Igbm9uZSB3ZXJlIGFuc3dlcmVkLiBTaWJsaW5nIHRvIGBibGFua3NgLCBuZXZlclxuICAvLyBtZXJnZWQgaW50byBpdCBcdTIwMTQgZ2VvbWV0cmljIGFuc3dlcnMgYXJlIHNoYXBlZCBkaWZmZXJlbnRseSBhbmQgdGhlXG4gIC8vIGRhc2hib2FyZCByZW5kZXJzIHRoZW0gZGlmZmVyZW50bHkgKHNlZSB0aGUgZXh0ZW5zaW9uIHBhdHRlcm4gYWJvdmUpLlxuICBncmFwaFJlc3BvbnNlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIEdyYXBoUmVzcG9uc2VWNCkub3B0aW9uYWwoKSxcbiAgLy8gS2V5ZWQgYnkgbXVsdGlwbGVfY2hvaWNlIGJsb2NrLmlkICh1dWlkKS4gQWJzZW50IHdoZW4gdGhlIGFjdGl2aXR5IGhhc1xuICAvLyBubyBNQyBibG9ja3Mgb3Igbm9uZSB3ZXJlIGFuc3dlcmVkIChzYW1lIG9taXNzaW9uIHJ1bGUgYXMgZ3JhcGhzKS5cbiAgY2hvaWNlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIENob2ljZVJlc3BvbnNlKS5vcHRpb25hbCgpLFxuICAvLyBLZXllZCBieSBtYXRjaGluZyBibG9jay5pZCAodXVpZCkuIFNhbWUgb21pc3Npb24gcnVsZS5cbiAgbWF0Y2hlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIE1hdGNoUmVzcG9uc2UpLm9wdGlvbmFsKCksXG4gIC8vIEtleWVkIGJ5IG9yZGVyaW5nIGJsb2NrLmlkICh1dWlkKS4gU2FtZSBvbWlzc2lvbiBydWxlLlxuICBvcmRlcmluZ3M6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBPcmRlclJlc3BvbnNlKS5vcHRpb25hbCgpLFxuICAvLyBLZXllZCBieSBudW1iZXJfbGluZSBibG9jay5pZCAodXVpZCkuIEFic2VudCB3aGVuIHRoZSBhY3Rpdml0eSBoYXMgbm9cbiAgLy8gbnVtYmVyLWxpbmUgYmxvY2tzIG9yIG5vbmUgd2VyZSBhbnN3ZXJlZC4gU2libGluZyB0byBgZ3JhcGhSZXNwb25zZXNgLFxuICAvLyBuZXZlciBtZXJnZWQgXHUyMDE0IDEtRCBnZW9tZXRyaWMgYW5zd2VycyBhcmUgc2hhcGVkIGRpZmZlcmVudGx5IGFuZCB0aGVcbiAgLy8gZGFzaGJvYXJkIHJlbmRlcnMgdGhlbSBkaWZmZXJlbnRseS5cbiAgbnVtYmVyTGluZVJlc3BvbnNlczogelxuICAgIC5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIE51bWJlckxpbmVSZXNwb25zZSlcbiAgICAub3B0aW9uYWwoKSxcbiAgLy8gS2V5ZWQgYnkgZGF0YV9wbG90IGJsb2NrLmlkICh1dWlkKS4gQWJzZW50IHdoZW4gdGhlIGFjdGl2aXR5IGhhcyBub1xuICAvLyBncmFkZWQgZGF0YS1wbG90IGJsb2NrcyBvciBub25lIHdlcmUgYW5zd2VyZWQgKGRpc3BsYXkgZGF0YV9wbG90cyBhcmVcbiAgLy8gdW5ncmFkZWQgYW5kIG5ldmVyIGFwcGVhcikuIFNpYmxpbmcgdG8gdGhlIG90aGVyIGdlb21ldHJpYyBtYXBzLlxuICBkYXRhUGxvdFJlc3BvbnNlczogelxuICAgIC5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIERhdGFQbG90UmVzcG9uc2UpXG4gICAgLm9wdGlvbmFsKCksXG4gIC8vIEtleWVkIGJ5IHNlbGZfZXhwbGFuYXRpb24gYmxvY2suaWQgKHV1aWQpLiBVbmdyYWRlZCBmcmVlIHRleHQgXHUyMDE0IG5ldmVyIGluXG4gIC8vIHRoZSBzY29yZS4gQWJzZW50IHdoZW4gdGhlIGFjdGl2aXR5IGhhcyBubyBzZWxmLWV4cGxhbmF0aW9uIGJsb2NrcyBvciBub25lXG4gIC8vIHdlcmUgd3JpdHRlbi4gUGhhc2UgMi42IHNob3J0X2Fuc3dlciAvIGVzc2F5IHdpbGwgcmV1c2UgdGhpcyBzYW1lIG1hcC5cbiAgZnJlZVJlc3BvbnNlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIEZyZWVSZXNwb25zZSkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgU3VibWlzc2lvblJlc3BvbnNlcyA9IHouaW5mZXI8dHlwZW9mIFN1Ym1pc3Npb25SZXNwb25zZXM+O1xuXG4vLyAtLS0tIE1pZ3JhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUmVhZHMgYSBzdG9yZWQgc3VibWlzc2lvbiBvZiBhbnkgc2hhcGUgYW5kIHJldHVybnMgdGhlIGN1cnJlbnQgKHY4KSBzaGFwZS5cbi8vIEFwcGxpY2F0aW9uIGNvZGUgdGhhdCBjb25zdW1lcyBzdWJtaXNzaW9ucyBjYWxscyB0aGlzIG9uY2UgYWZ0ZXIgcmVhZGluZ1xuLy8gZnJvbSB0aGUgZGF0YWJhc2U7IG9sZGVyIGlucHV0IHNoYXBlcyBhcmUgbmV2ZXIgcHJvcGFnYXRlZCBwYXN0IHRoaXMgbGF5ZXIuXG4vLyBUaGUgRWRnZSBGdW5jdGlvbiB3cml0ZXMgb25seSB0aGUgY3VycmVudCBzaGFwZS5cbi8vXG4vLyBFdmVyeSBwcm9tb3Rpb24gaXMgXCJidW1wIHRoZSB2ZXJzaW9uLCBjYXJyeSB0aGUgbWFwcyBmb3J3YXJkXCIgXHUyMDE0IGVhY2ggbmV3XG4vLyB2ZXJzaW9uIG9ubHkgQURERUQgYW4gb3B0aW9uYWwgbWFwIChvciB3aWRlbmVkIGEgdW5pb24pLCBzbyBvbGRlciBkYXRhIGlzXG4vLyBhbHdheXMgYSB2YWxpZCBpbnN0YW5jZSBvZiB0aGUgbmV3ZXIgc2hhcGUgd2l0aCB0aGUgbmV3IGZpZWxkcyBhYnNlbnQuXG5leHBvcnQgZnVuY3Rpb24gbWlncmF0ZVN1Ym1pc3Npb25SZXNwb25zZXMocmF3OiB1bmtub3duKTogU3VibWlzc2lvblJlc3BvbnNlcyB7XG4gIC8vIFRyeSB0aGUgY3VycmVudCBzaGFwZSBmaXJzdCAodGhlIGNvbW1vbiBjYXNlIGZvciBuZXcgZGF0YSkuXG4gIGNvbnN0IHY5ID0gU3VibWlzc2lvblJlc3BvbnNlcy5zYWZlUGFyc2UocmF3KTtcbiAgaWYgKHY5LnN1Y2Nlc3MpIHJldHVybiB2OS5kYXRhO1xuXG4gIC8vIHY4OiBwcm9tb3RlIGJ5IGJ1bXBpbmcgdGhlIHZlcnNpb24gXHUyMDE0IGZyZWVSZXNwb25zZXMgc2ltcGx5IGFic2VudC5cbiAgY29uc3QgdjggPSBTdWJtaXNzaW9uUmVzcG9uc2VzVjguc2FmZVBhcnNlKHJhdyk7XG4gIGlmICh2OC5zdWNjZXNzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjaGVtYVZlcnNpb246IDksXG4gICAgICBibGFua3M6IHY4LmRhdGEuYmxhbmtzLFxuICAgICAgLi4uKHY4LmRhdGEuY2hlY2twb2ludFJlc3VsdHMgJiYge1xuICAgICAgICBjaGVja3BvaW50UmVzdWx0czogdjguZGF0YS5jaGVja3BvaW50UmVzdWx0cyxcbiAgICAgIH0pLFxuICAgICAgLi4uKHY4LmRhdGEuZ3JhcGhSZXNwb25zZXMgJiYgeyBncmFwaFJlc3BvbnNlczogdjguZGF0YS5ncmFwaFJlc3BvbnNlcyB9KSxcbiAgICAgIC4uLih2OC5kYXRhLmNob2ljZXMgJiYgeyBjaG9pY2VzOiB2OC5kYXRhLmNob2ljZXMgfSksXG4gICAgICAuLi4odjguZGF0YS5tYXRjaGVzICYmIHsgbWF0Y2hlczogdjguZGF0YS5tYXRjaGVzIH0pLFxuICAgICAgLi4uKHY4LmRhdGEub3JkZXJpbmdzICYmIHsgb3JkZXJpbmdzOiB2OC5kYXRhLm9yZGVyaW5ncyB9KSxcbiAgICAgIC4uLih2OC5kYXRhLm51bWJlckxpbmVSZXNwb25zZXMgJiYge1xuICAgICAgICBudW1iZXJMaW5lUmVzcG9uc2VzOiB2OC5kYXRhLm51bWJlckxpbmVSZXNwb25zZXMsXG4gICAgICB9KSxcbiAgICAgIC4uLih2OC5kYXRhLmRhdGFQbG90UmVzcG9uc2VzICYmIHtcbiAgICAgICAgZGF0YVBsb3RSZXNwb25zZXM6IHY4LmRhdGEuZGF0YVBsb3RSZXNwb25zZXMsXG4gICAgICB9KSxcbiAgICB9O1xuICB9XG5cbiAgLy8gdjc6IHByb21vdGUgYnkgYnVtcGluZyB0aGUgdmVyc2lvbiBcdTIwMTQgZGF0YVBsb3RSZXNwb25zZXMgc2ltcGx5IGFic2VudC5cbiAgY29uc3QgdjcgPSBTdWJtaXNzaW9uUmVzcG9uc2VzVjcuc2FmZVBhcnNlKHJhdyk7XG4gIGlmICh2Ny5zdWNjZXNzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjaGVtYVZlcnNpb246IDksXG4gICAgICBibGFua3M6IHY3LmRhdGEuYmxhbmtzLFxuICAgICAgLi4uKHY3LmRhdGEuY2hlY2twb2ludFJlc3VsdHMgJiYge1xuICAgICAgICBjaGVja3BvaW50UmVzdWx0czogdjcuZGF0YS5jaGVja3BvaW50UmVzdWx0cyxcbiAgICAgIH0pLFxuICAgICAgLi4uKHY3LmRhdGEuZ3JhcGhSZXNwb25zZXMgJiYgeyBncmFwaFJlc3BvbnNlczogdjcuZGF0YS5ncmFwaFJlc3BvbnNlcyB9KSxcbiAgICAgIC4uLih2Ny5kYXRhLmNob2ljZXMgJiYgeyBjaG9pY2VzOiB2Ny5kYXRhLmNob2ljZXMgfSksXG4gICAgICAuLi4odjcuZGF0YS5tYXRjaGVzICYmIHsgbWF0Y2hlczogdjcuZGF0YS5tYXRjaGVzIH0pLFxuICAgICAgLi4uKHY3LmRhdGEub3JkZXJpbmdzICYmIHsgb3JkZXJpbmdzOiB2Ny5kYXRhLm9yZGVyaW5ncyB9KSxcbiAgICAgIC4uLih2Ny5kYXRhLm51bWJlckxpbmVSZXNwb25zZXMgJiYge1xuICAgICAgICBudW1iZXJMaW5lUmVzcG9uc2VzOiB2Ny5kYXRhLm51bWJlckxpbmVSZXNwb25zZXMsXG4gICAgICB9KSxcbiAgICB9O1xuICB9XG5cbiAgLy8gdjY6IHByb21vdGUgYnkgYnVtcGluZyB0aGUgdmVyc2lvbiBcdTIwMTQgbnVtYmVyTGluZVJlc3BvbnNlcyBzaW1wbHkgYWJzZW50LlxuICBjb25zdCB2NiA9IFN1Ym1pc3Npb25SZXNwb25zZXNWNi5zYWZlUGFyc2UocmF3KTtcbiAgaWYgKHY2LnN1Y2Nlc3MpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2NoZW1hVmVyc2lvbjogOSxcbiAgICAgIGJsYW5rczogdjYuZGF0YS5ibGFua3MsXG4gICAgICAuLi4odjYuZGF0YS5jaGVja3BvaW50UmVzdWx0cyAmJiB7XG4gICAgICAgIGNoZWNrcG9pbnRSZXN1bHRzOiB2Ni5kYXRhLmNoZWNrcG9pbnRSZXN1bHRzLFxuICAgICAgfSksXG4gICAgICAuLi4odjYuZGF0YS5ncmFwaFJlc3BvbnNlcyAmJiB7IGdyYXBoUmVzcG9uc2VzOiB2Ni5kYXRhLmdyYXBoUmVzcG9uc2VzIH0pLFxuICAgICAgLi4uKHY2LmRhdGEuY2hvaWNlcyAmJiB7IGNob2ljZXM6IHY2LmRhdGEuY2hvaWNlcyB9KSxcbiAgICAgIC4uLih2Ni5kYXRhLm1hdGNoZXMgJiYgeyBtYXRjaGVzOiB2Ni5kYXRhLm1hdGNoZXMgfSksXG4gICAgICAuLi4odjYuZGF0YS5vcmRlcmluZ3MgJiYgeyBvcmRlcmluZ3M6IHY2LmRhdGEub3JkZXJpbmdzIH0pLFxuICAgIH07XG4gIH1cblxuICAvLyB2NTogcHJvbW90ZSBieSBidW1waW5nIHRoZSB2ZXJzaW9uIFx1MjAxNCBtYXRjaGVzL29yZGVyaW5ncyBzaW1wbHkgYWJzZW50LlxuICBjb25zdCB2NSA9IFN1Ym1pc3Npb25SZXNwb25zZXNWNS5zYWZlUGFyc2UocmF3KTtcbiAgaWYgKHY1LnN1Y2Nlc3MpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2NoZW1hVmVyc2lvbjogOSxcbiAgICAgIGJsYW5rczogdjUuZGF0YS5ibGFua3MsXG4gICAgICAuLi4odjUuZGF0YS5jaGVja3BvaW50UmVzdWx0cyAmJiB7XG4gICAgICAgIGNoZWNrcG9pbnRSZXN1bHRzOiB2NS5kYXRhLmNoZWNrcG9pbnRSZXN1bHRzLFxuICAgICAgfSksXG4gICAgICAuLi4odjUuZGF0YS5ncmFwaFJlc3BvbnNlcyAmJiB7IGdyYXBoUmVzcG9uc2VzOiB2NS5kYXRhLmdyYXBoUmVzcG9uc2VzIH0pLFxuICAgICAgLi4uKHY1LmRhdGEuY2hvaWNlcyAmJiB7IGNob2ljZXM6IHY1LmRhdGEuY2hvaWNlcyB9KSxcbiAgICB9O1xuICB9XG5cbiAgLy8gdjQ6IHByb21vdGUgXHUyMDE0IHRoZSBjaG9pY2VzL21hdGNoZXMvb3JkZXJpbmdzIG1hcHMgYXJlIHNpbXBseSBhYnNlbnQuXG4gIGNvbnN0IHY0ID0gU3VibWlzc2lvblJlc3BvbnNlc1Y0LnNhZmVQYXJzZShyYXcpO1xuICBpZiAodjQuc3VjY2Vzcykge1xuICAgIHJldHVybiB7XG4gICAgICBzY2hlbWFWZXJzaW9uOiA5LFxuICAgICAgYmxhbmtzOiB2NC5kYXRhLmJsYW5rcyxcbiAgICAgIC4uLih2NC5kYXRhLmNoZWNrcG9pbnRSZXN1bHRzICYmIHtcbiAgICAgICAgY2hlY2twb2ludFJlc3VsdHM6IHY0LmRhdGEuY2hlY2twb2ludFJlc3VsdHMsXG4gICAgICB9KSxcbiAgICAgIC4uLih2NC5kYXRhLmdyYXBoUmVzcG9uc2VzICYmIHsgZ3JhcGhSZXNwb25zZXM6IHY0LmRhdGEuZ3JhcGhSZXNwb25zZXMgfSksXG4gICAgfTtcbiAgfVxuXG4gIC8vIHYzOiBwcm9tb3RlIFx1MjAxNCBldmVyeSB2MyBncmFwaCByZXNwb25zZSBpcyBhIHZhbGlkIHY0KyByZXNwb25zZSAodGhlIHY0XG4gIC8vIGZpZWxkcyBhcmUgb3B0aW9uYWwgYW5kIHRoZSB1bmlvbiBvbmx5IHdpZGVuZWQpLlxuICBjb25zdCB2MyA9IFN1Ym1pc3Npb25SZXNwb25zZXNWMy5zYWZlUGFyc2UocmF3KTtcbiAgaWYgKHYzLnN1Y2Nlc3MpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2NoZW1hVmVyc2lvbjogOSxcbiAgICAgIGJsYW5rczogdjMuZGF0YS5ibGFua3MsXG4gICAgICAuLi4odjMuZGF0YS5jaGVja3BvaW50UmVzdWx0cyAmJiB7XG4gICAgICAgIGNoZWNrcG9pbnRSZXN1bHRzOiB2My5kYXRhLmNoZWNrcG9pbnRSZXN1bHRzLFxuICAgICAgfSksXG4gICAgICAuLi4odjMuZGF0YS5ncmFwaFJlc3BvbnNlcyAmJiB7IGdyYXBoUmVzcG9uc2VzOiB2My5kYXRhLmdyYXBoUmVzcG9uc2VzIH0pLFxuICAgIH07XG4gIH1cblxuICAvLyB2MjogcHJvbW90ZTsgYmxhbmtzICsgY2hlY2twb2ludFJlc3VsdHMgY2Fycnkgb3Zlci5cbiAgY29uc3QgdjIgPSBTdWJtaXNzaW9uUmVzcG9uc2VzVjIuc2FmZVBhcnNlKHJhdyk7XG4gIGlmICh2Mi5zdWNjZXNzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjaGVtYVZlcnNpb246IDksXG4gICAgICBibGFua3M6IHYyLmRhdGEuYmxhbmtzLFxuICAgICAgLi4uKHYyLmRhdGEuY2hlY2twb2ludFJlc3VsdHMgJiYge1xuICAgICAgICBjaGVja3BvaW50UmVzdWx0czogdjIuZGF0YS5jaGVja3BvaW50UmVzdWx0cyxcbiAgICAgIH0pLFxuICAgIH07XG4gIH1cblxuICAvLyBGYWxsIGJhY2sgdG8gdjEgYW5kIG1pZ3JhdGUgZm9yd2FyZC4gVGhpcyB3aWxsIHRocm93IGlmIHRoZSBpbnB1dCBtYXRjaGVzXG4gIC8vIG5vIGtub3duIHNoYXBlLCB3aGljaCBpcyB0aGUgY29ycmVjdCBiZWhhdmlvciBcdTIwMTQgY29ycnVwdGVkIG9yIHVua25vd24tXG4gIC8vIHZlcnNpb24gc3VibWlzc2lvbnMgc2hvdWxkIGZhaWwgbG91ZGx5LCBub3Qgc2lsZW50bHkgcGFzcy5cbiAgY29uc3QgdjEgPSBTdWJtaXNzaW9uUmVzcG9uc2VzVjEucGFyc2UocmF3KTtcbiAgcmV0dXJuIHtcbiAgICBzY2hlbWFWZXJzaW9uOiA5LFxuICAgIGJsYW5rczogdjEuYmxhbmtzLFxuICB9O1xufVxuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyByZWdpc3RyeS9yZWdpc3RyeS50cyBcdTIwMTQgdGhlIHNpbmdsZSBibG9jayByZWdpc3RyeSAoUzAsIHJ1bGluZyBRMUEpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gT25lIGVudHJ5IHBlciBzY2hlbWEgYmxvY2sgdHlwZS4gVGhlIGd1YXJkIHN1aXRlICh0ZXN0cy9yZWdpc3RyeS50ZXN0LnRzKVxuLy8gcHJvdmVzOiBjb3ZlcmFnZSBpcyBleGFjdCBhZ2FpbnN0IHRoZSBCbG9jayB1bmlvbiwgbnVtYmVyaW5nIGRlY2xhcmF0aW9uc1xuLy8gYWdyZWUgd2l0aCBibG9jay1wcmVkaWNhdGVzLnRzLCBmYW1pbGllcyBhZ3JlZSB3aXRoIGlzR3JhZGVhYmxlLCB2YXJpYW50c1xuLy8gYWdyZWUgd2l0aCB0aGUgc2NoZW1hJ3MgaW50ZXJhY3Rpb24gdW5pb25zLCBhbmQgZXZlcnkgaW50ZXJhY3RpdmUgZW50cnlcbi8vIGNhcnJpZXMgYW4gYTExeSBzdG9yeS4gQWRkIGEgYmxvY2sgdHlwZSB0byB0aGUgc2NoZW1hIGFuZCB0aGlzIGZpbGUgZmFpbHMgdG9cbi8vIGNvbXBpbGUgKEJsb2NrUmVnaXN0cnkgaXMga2V5ZWQgYnkgdGhlIHVuaW9uKSBcdTIwMTQgdGhhdCBpcyB0aGUgcG9pbnQuXG4vL1xuLy8gUHJpbnQgZGVjbGFyYXRpb25zIHN0YXJ0ZWQgRkFJVEhGVUwgdG8gdGhlIGJhc2VsaW5lIHByaW50IGxheWVyXG4vLyAocmVuZGVyZXIvc3JjL3J1bnRpbWUvc3R5bGVzLnRzIEBtZWRpYSBwcmludCksIGluY2x1ZGluZyBpdHMga25vd24gb2RkaXRpZXMsXG4vLyBzbyB0aGF0IGltcHJvdmluZyB0aGVtIHdvdWxkIGJlIGEgZGVsaWJlcmF0ZSBkZWNpc2lvbiByYXRoZXIgdGhhbiBhIHNpbGVudFxuLy8gcmVnaXN0cnkgc2lkZSBlZmZlY3QuIFM1ICh0aGUgcHJpbnQgc2xpY2UpIElTIHRoYXQgZGVjaXNpb24gcG9pbnQsIGFuZCBpdFxuLy8gcnVsZWQgKFM1LU9WNik6IG1hdGhfYmxvY2ssIGRhdGFfcGxvdCwgYW5kIHNlbGZfZXhwbGFuYXRpb24gbm93IGRlY2xhcmVcbi8vIGJyZWFrLWluc2lkZTogYXZvaWQgXHUyMDE0IGEgbnVtYmVyZWQgZXF1YXRpb24sIGEgY2hhcnQsIG9yIGEgcHJvbXB0IHNlcGFyYXRlZFxuLy8gZnJvbSBpdHMgd3JpdGluZyBib3ggaXMgYSBwcmludCBidWcgb24gYW55IHN1cmZhY2UgXHUyMDE0IGFuZCB0aGUgYXV0aG9yIGV4dGVuZGVkXG4vLyBpdCB0byBzaG9ydF9hbnN3ZXIgYW5kIGVzc2F5LCB0aGUgdHdvIHVubmFtZWQgc2libGluZ3MgdGhhdCBzaGFyZVxuLy8gc2VsZl9leHBsYW5hdGlvbidzIHdyaXRpbmctYm94IHN0cnVjdHVyZS4gVGhlIHBhcml0eSBnYXRlIGFzc2VydHNcbi8vIFRISVMgc3BlYyBvbiBib3RoIHN1cmZhY2VzIHJhdGhlciB0aGFuIGRpZmZpbmcgYWdhaW5zdCByZW5kZXJlciBvdXRwdXRcbi8vIChwcmludEV4cGVjdGF0aW9ucy50cyksIHdoaWNoIGlzIGV4YWN0bHkgd2hhdCBtYWtlcyB0aGUgaW1wcm92ZW1lbnRcbi8vIGV4cHJlc3NpYmxlOyBwdWJsaXNoZWQgcGFnZXMga2VlcCB0aGVpciBjdXJyZW50IGJlaGF2aW9yIHVudGlsIHRoZXkgcmV0aXJlLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHtcbiAgaXNHcmFkZWFibGUsXG4gIGlzUGFnZU51bWJlcmVkLFxuICB0eXBlIEJsb2NrLFxufSBmcm9tICdAYWN0aXZpdHkvc2NoZW1hJztcbmltcG9ydCB0eXBlIHtcbiAgQmxvY2tDYXRlZ29yeSxcbiAgQmxvY2tSZWdpc3RyeSxcbiAgQmxvY2tUeXBlLFxuICBDaGVja2VkU3RhdGVGYW1pbHksXG59IGZyb20gJy4vdHlwZXMuanMnO1xuXG4vKiogQmxhbmtUb2tlbiBmaWVsZHMgc3RyaXBwZWQgZnJvbSBpbmxpbmUgY29udGVudCB3aGVyZXZlclxuICogU2FuaXRpemVTcGVjLmlubGluZUJsYW5rU2VjcmV0cyBpcyBzZXQuIGBoaW50YCBkZWxpYmVyYXRlbHkgc3Vydml2ZXMgXHUyMDE0IGl0IGlzXG4gKiBhIHByZS1jaGVjayBhZmZvcmRhbmNlIHRoZSBzdHVkZW50IG1heSBvcGVuOyBwZXItbWlzdGFrZSBmZWVkYmFjayBpc1xuICogcmV0dXJuZWQgYnkgdGhlIGNoZWNrIFJQQyAocnVsaW5nIDIuMUEpLCBzbyB0aGUgd2hvbGUgbWlzdGFrZUZlZWRiYWNrIGFycmF5XG4gKiAobWF0Y2ggc3RyaW5ncyBBTkQgZmVlZGJhY2sgdGV4dCkgc3RyaXBzLiBgYW5zd2VyVHlwZWAgc3Vydml2ZXM6IGl0IHNoYXBlc1xuICogdGhlIGlucHV0IChudW1lcmljIGtleWJvYXJkcykuICovXG5leHBvcnQgY29uc3QgQkxBTktfU0VDUkVUX0ZJRUxEUyA9IFtcbiAgJ2Fuc3dlcicsXG4gICdhY2NlcHRhYmxlQW5zd2VycycsXG4gICdtaXN0YWtlRmVlZGJhY2snLFxuICAndG9sZXJhbmNlJyxcbiAgJ2VxdWl2YWxlbmNlJyxcbl0gYXMgY29uc3Q7XG5cbi8qKiBNYXRoUHJvbXB0IGZpZWxkcyBzdHJpcHBlZCB3aGVyZXZlciBhIHByb21wdHMgYXJyYXkgYXBwZWFycyAobWF0aF9ibG9ja1xuICogYmxvY2tzIEFORCBtYXRoX2lubGluZSBub2RlcykuIFRoZSBnYXAgbWFya2VycyBpbiB0aGUgbGF0ZXggYXJlIHRoZSBnYXBzXG4gKiB0aGVtc2VsdmVzIChhbHJlYWR5IHNlcnZlZCBlbXB0eSB0b2RheSBcdTIwMTQgc2VyaWFsaXplLnRzIHByZWNlZGVudCk7IHRoZVxuICogcHJvbXB0J3MgYW5zd2VyL2dyYWRpbmcgY29uZmlnIGlzIHRoZSBzZWNyZXQuIGBhY2NlcHRhYmxlQW5zd2Vyc2Agd2FzXG4gKiBNSVNTSU5HIGZyb20gdGhlIFMwIGRlY2xhcmF0aW9uIChcImFsc28gYWNjZXB0XCIgYWx0ZXJuYXRpdmUgYW5zd2VycyBcdTIwMTQgYSByZWFsXG4gKiBrZXkgbGVhaykgXHUyMDE0IGNhdWdodCBieSBTMidzIGNyb3NzLWNoZWNrIGFnYWluc3QgdGhlIE1hdGhQcm9tcHQgc2NoZW1hIGFuZFxuICogYWRkZWQgYmVmb3JlIHRoZSBmaXJzdCBzYW5pdGl6ZWQgYnl0ZSB3YXMgc2VydmVkLiAqL1xuZXhwb3J0IGNvbnN0IE1BVEhfUFJPTVBUX1NFQ1JFVF9GSUVMRFMgPSBbXG4gICdhbnN3ZXInLFxuICAnYWNjZXB0YWJsZUFuc3dlcnMnLFxuICAnZXF1aXZhbGVuY2UnLFxuICAndG9sZXJhbmNlJyxcbl0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBibG9ja1JlZ2lzdHJ5OiBCbG9ja1JlZ2lzdHJ5ID0ge1xuICBwYXJhZ3JhcGg6IHtcbiAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAncGFyYWdyYXBoJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICdwcm9zZScgfSxcbiAgfSxcblxuICBoZWFkaW5nOiB7XG4gICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdoZWFkaW5nJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICdwcm9zZScsIGtlZXBXaXRoTmV4dDogdHJ1ZSB9LFxuICB9LFxuXG4gIG1hdGhfYmxvY2s6IHtcbiAgICB0eXBlOiAnbWF0aF9ibG9jaycsXG4gICAgLy8gR2FwLWJlYXJpbmcgKE1vZGVsIEEgcHJvbXB0cykgXHUyMTkyIGF1dG8tZ3JhZGFibGUgKyBudW1iZXJlZCArIGludGVyYWN0aXZlO1xuICAgIC8vIGEgcGxhaW4gZGlzcGxheSBlcXVhdGlvbiByZXNvbHZlcyBzdGF0aWMgdGhyb3VnaCBmYW1pbHlPZigpLlxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JywgLy8gZmFpdGhmdWw6IHJlbmRlcmVyIGVtaXRzIGNvbnRlbnQgZXZlbiB3aGVuIGdhcC1iZWFyaW5nXG4gICAgbnVtYmVyZWQ6ICd3aGVuX2dyYWRhYmxlJyxcbiAgICBhbmFseXRpY3NLZXk6ICdtYXRoX2Jsb2NrJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogWydzb2x1dGlvbiddLCBpbmxpbmVCbGFua1NlY3JldHM6IHRydWUgfSxcbiAgICAvLyBXQVMgYSBmYWl0aGZ1bCBvZGRpdHkgKGFic2VudCBmcm9tIHRoZSBiYXNlbGluZSBicmVhay1pbnNpZGU6YXZvaWQgbGlzdCxcbiAgICAvLyBzbyBhIG51bWJlcmVkIGRpc3BsYXkgZXF1YXRpb24gY291bGQgc3BsaXQgYWNyb3NzIGEgcGFnZSkuIEZJWEVEIGJ5XG4gICAgLy8gcnVsaW5nIFM1LU9WNiBcdTIwMTQgc3RpbGwgbm90IGluIHRoZSBzaG93QW5zd2VycyBzZXQsIHdoaWNoIGlzIHRoZSBzZXBhcmF0ZVxuICAgIC8vIGFuc3dlci1rZXktdmFyaWFudCBxdWVzdGlvbiBTNS41IG93bnMuXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3VuZGVybGluZS1ibGFua3MnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdFYWNoIGluLWVxdWF0aW9uIGdhcCBpcyBhIHRleHQgaW5wdXQgaW4gdGFiIG9yZGVyLCBsYWJlbGVkIHdpdGggaXRzICcgK1xuICAgICAgICAncG9zaXRpb24gKFwiZ2FwIDEgb2YgMiBpbiBwcm9ibGVtIDNcIikuIFZhbHVlcyB0eXBlIGFzIHBsYWluIHRleHQ7ICcgK1xuICAgICAgICAndmVyZGljdHMgYXJlIGFubm91bmNlZCB2aWEgdGhlIHNoYXJlZCBzdGF0ZS1waWxsIGFyaWEtbGl2ZSByZWdpb24uJyxcbiAgICB9LFxuICB9LFxuXG4gIGltYWdlOiB7XG4gICAgdHlwZTogJ2ltYWdlJyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnaW1hZ2UnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ2ZpZ3VyZScgfSxcbiAgfSxcblxuICBjYWxsb3V0OiB7XG4gICAgdHlwZTogJ2NhbGxvdXQnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdjYWxsb3V0JyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICd2YXJpYW50LWJvcmRlci1ib3gnIH0sXG4gIH0sXG5cbiAgcHJvYmxlbToge1xuICAgIHR5cGU6ICdwcm9ibGVtJyxcbiAgICAvLyBOdW1iZXJlZCBsZWdhY3kgcHJvc2UgcHJvYmxlbTsgY2FycmllcyBhIHNvbHV0aW9uIGJ1dCBubyBhdXRvLWdyYWRlZFxuICAgIC8vIHJlc3BvbnNlIChpc0dyYWRlYWJsZTogZmFsc2UpIFx1MjE5MiBzdGF0aWMgZmFtaWx5LCBubyBzdGF0ZSBjaHJvbWUuIFNjaGVtYVxuICAgIC8vIG9ycGhhbjogbm8gZWRpdG9yIE5vZGVWaWV3OyBzdGlsbCByZW5kZXJhYmxlLCBzbyBpdCBrZWVwcyBhbiBlbnRyeS5cbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdwcm9ibGVtJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogWydzb2x1dGlvbiddIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3Byb3NlJyB9LFxuICB9LFxuXG4gIGZpbGxfaW5fYmxhbms6IHtcbiAgICB0eXBlOiAnZmlsbF9pbl9ibGFuaycsXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAnZmlsbF9pbl9ibGFuaycsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFsnc29sdXRpb24nXSwgaW5saW5lQmxhbmtTZWNyZXRzOiB0cnVlIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3VuZGVybGluZS1ibGFua3MnLCBhbnN3ZXJLZXlWYXJpYW50OiB0cnVlIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdFYWNoIGJsYW5rIGlzIGEgdGV4dCBpbnB1dCBpbiB0YWIgb3JkZXIgd2l0aCBhIGxhYmVsIG5hbWluZyBpdHMgJyArXG4gICAgICAgICdwcm9ibGVtIGFuZCBzdWItcGFydCAoXCJibGFuayAoYSksIHByb2JsZW0gM1wiKS4gSGludCBhbmQgbWlzdGFrZSAnICtcbiAgICAgICAgJ2FmZm9yZGFuY2VzIGFyZSBidXR0b25zIHJlYWNoYWJsZSBieSBUYWI7IHRoZSBvcGVuZWQgcG9wb3ZlciB0cmFwcyAnICtcbiAgICAgICAgJ25vIGZvY3VzIGFuZCBjbG9zZXMgb24gRXNjYXBlLiBWZXJkaWN0cyBhbm5vdW5jZSB2aWEgYXJpYS1saXZlLicsXG4gICAgfSxcbiAgfSxcblxuICBidWxsZXRfbGlzdDoge1xuICAgIHR5cGU6ICdidWxsZXRfbGlzdCcsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ2J1bGxldF9saXN0JyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICdwcm9zZScgfSxcbiAgfSxcblxuICBvcmRlcmVkX2xpc3Q6IHtcbiAgICB0eXBlOiAnb3JkZXJlZF9saXN0JyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnb3JkZXJlZF9saXN0JyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICdwcm9zZScgfSxcbiAgfSxcblxuICBpbnRlcmFjdGl2ZV9ncmFwaDoge1xuICAgIHR5cGU6ICdpbnRlcmFjdGl2ZV9ncmFwaCcsXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsIC8vIGRpc3BsYXkgdmFyaWFudCByZXNvbHZlcyBzdGF0aWMgdmlhIGZhbWlseU9mKClcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLCAvLyBkaXNwbGF5IHZhcmlhbnQgcmVzb2x2ZXMgY29udGVudCB2aWEgY2F0ZWdvcnlPZigpXG4gICAgbnVtYmVyZWQ6ICd3aGVuX2dyYWRhYmxlJyxcbiAgICBhbmFseXRpY3NLZXk6ICdpbnRlcmFjdGl2ZV9ncmFwaCcsXG4gICAgdmFyaWFudHM6IFtcbiAgICAgICdwbG90X3BvaW50JyxcbiAgICAgICdwbG90X2Z1bmN0aW9uJyxcbiAgICAgICdzaGFkZV9yZWdpb24nLFxuICAgICAgJ2dyYXBoX2luZXF1YWxpdHknLFxuICAgICAgJ3Bsb3RfcmF5JyxcbiAgICAgICdwbG90X3NlZ21lbnQnLFxuICAgICAgJ2Rpc3BsYXknLFxuICAgIF0sXG4gICAgc2FuaXRpemU6IHtcbiAgICAgIC8vIFRoZSB3aWRnZXQgbmVlZHMgaGFuZGxlIGNvdW50IC8gZmFtaWx5LCB3aGljaCBsaXZlIGluIHRoZSBrZXkgdGhlXG4gICAgICAvLyB2aWV3ZXIgbmV2ZXIgZ2V0cy4gRGVyaXZlZCArIHdoaXRlbGlzdGVkOyBzZWUgU2FuaXRpemVTcGVjLlxuICAgICAgZGVyaXZlUXVlc3Rpb25TaGFwZTogdHJ1ZSxcbiAgICAgIC8vIFZhcmlhbnQtc2NvcGVkIGtleXM6IHBhdGhzIHRoYXQgZG9uJ3QgZXhpc3Qgb24gYW4gaW5zdGFuY2Unc1xuICAgICAgLy8gaW50ZXJhY3Rpb24gc2ltcGx5IGRvbid0IG1hdGNoLiBgYWxsb3dOb1NvbHV0aW9uYCBTVVJWSVZFUyAoaXQgcmVuZGVyc1xuICAgICAgLy8gdGhlIFwibm8gc29sdXRpb25cIiBjb250cm9sKTsgYG5vU29sdXRpb25Db3JyZWN0YCBpcyB0aGUgYW5zd2VyLlxuICAgICAgc3RyaXA6IFtcbiAgICAgICAgJ2ludGVyYWN0aW9uLmNvcnJlY3RQb2ludHMnLFxuICAgICAgICAnaW50ZXJhY3Rpb24udG9sZXJhbmNlJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLm1vZGVscycsXG4gICAgICAgICdpbnRlcmFjdGlvbi5kb21haW5zJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLnJlZ2lvbnMnLFxuICAgICAgICAnaW50ZXJhY3Rpb24uaW5lcXVhbGl0aWVzJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLnJheXMnLFxuICAgICAgICAnaW50ZXJhY3Rpb24uc2VnbWVudHMnLFxuICAgICAgICAnbWlzdGFrZUZlZWRiYWNrJyxcbiAgICAgICAgJ3NvbHV0aW9uJyxcbiAgICAgICAgJ25vU29sdXRpb25Db3JyZWN0JyxcbiAgICAgICAgJ3BhcnRpYWxDcmVkaXQnLFxuICAgICAgICAnYnVpbHRpbkZlZWRiYWNrJyxcbiAgICAgIF0sXG4gICAgfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnc3RhdGljLXN2ZycsIGFuc3dlcktleVZhcmlhbnQ6IHRydWUgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ1RoZSBjYW52YXMgaXMgZm9jdXNhYmxlOyBoYW5kbGVzIG1vdmUgYnkgYXJyb3cga2V5cyB3aXRoIHBvc2l0aW9uICcgK1xuICAgICAgICAnbmFycmF0aW9uIHRvIGEgdmlzdWFsbHktaGlkZGVuIGFyaWEtbGl2ZSByZWdpb24gKGEgdmlzaWJsZSByZWFkb3V0ICcgK1xuICAgICAgICAnd291bGQgaGFuZCBvdmVyIHRoZSBhbnN3ZXIgXHUyMDE0IHJlYWRpbmcgdGhlIGdyaWQgaXMgdGhlIHNraWxsKS4gJyArXG4gICAgICAgICdQb3N0LWNoZWNrIHJlc3VsdHMgYXJlIHZpc2libGUgdGV4dC4gVG91Y2ggdGFyZ2V0cyBtZWV0IDQ0cHguJyxcbiAgICB9LFxuICB9LFxuXG4gIG11bHRpcGxlX2Nob2ljZToge1xuICAgIHR5cGU6ICdtdWx0aXBsZV9jaG9pY2UnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ211bHRpcGxlX2Nob2ljZScsXG4gICAgc2FuaXRpemU6IHtcbiAgICAgIC8vIFBlci1jaG9pY2UgZmVlZGJhY2sgcmV0dXJucyB2aWEgdGhlIGNoZWNrIFJQQyAoMi4xQSksIGxpa2UgYmxhbmtzJy5cbiAgICAgIHN0cmlwOiBbJ2Nob2ljZXNbXS5jb3JyZWN0JywgJ2Nob2ljZXNbXS5mZWVkYmFjaycsICdzb2x1dGlvbiddLFxuICAgIH0sXG4gICAgcHJpbnQ6IHtcbiAgICAgIGJyZWFrSW5zaWRlOiAnYXZvaWQnLFxuICAgICAgdHJlYXRtZW50OiAnY2hvaWNlLWxldHRlcnMnLFxuICAgICAgYW5zd2VyS2V5VmFyaWFudDogdHJ1ZSxcbiAgICAgIC8vIFByaW50ZWQgdmVyc2lvbnMgcmVhcnJhbmdlIHRoZSBjaG9pY2VzOyBhIHF1ZXN0aW9uIHRoYXQgc2F5cyBcImFsbCBvZlxuICAgICAgLy8gdGhlIGFib3ZlXCIgb3B0cyBvdXQgcGVyLWJsb2NrIChEMTdBKS4gTk9UIHNlcnZlU2h1ZmZsZWQ6IHRoZSBzdHVkZW50XG4gICAgICAvLyBzY3JlZW4ga2VlcHMgdGhlIGF1dGhvcmVkIG9yZGVyLCBiZWNhdXNlIHRoZSBhbnN3ZXIgaXMgdGhlIGNob2ljZSBpZFxuICAgICAgLy8gYW5kIHJlYXJyYW5naW5nIGl0IHRoZXJlIGJ1eXMgbm90aGluZy5cbiAgICAgIHNodWZmbGVkOiBbJ2Nob2ljZXMnXSxcbiAgICAgIHNodWZmbGVMb2NrZWRCeTogJ2xvY2tDaG9pY2VPcmRlcicsXG4gICAgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ05hdGl2ZSByYWRpbyAoc2luZ2xlKSAvIGNoZWNrYm94IChtdWx0aSkgaW5wdXRzIGdyb3VwZWQgaW4gYSAnICtcbiAgICAgICAgJ2ZpZWxkc2V0IHdob3NlIGxlZ2VuZCBpcyB0aGUgcHJvbXB0OyBmdWxsIGxhYmVsIGNsaWNrIHRhcmdldHMuICcgK1xuICAgICAgICAnU3RhbmRhcmQgYXJyb3cta2V5IHJhZGlvIGJlaGF2aW9yOyB2ZXJkaWN0cyBhbm5vdW5jZSB2aWEgYXJpYS1saXZlLicsXG4gICAgfSxcbiAgfSxcblxuICBtYXRjaGluZzoge1xuICAgIHR5cGU6ICdtYXRjaGluZycsXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAnbWF0Y2hpbmcnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbJ2tleScsICdzb2x1dGlvbiddIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ2xldHRlci1iYW5rJywgYW5zd2VyS2V5VmFyaWFudDogdHJ1ZSB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnUG9pbnRlciBkcmFnIHdpdGggYSBrZXlib2FyZCBzZWxlY3QtdGhlbi1wbGFjZSBncmFtbWFyIHVuZGVybmVhdGg6ICcgK1xuICAgICAgICAndGFyZ2V0IGNhcmRzIGFyZSBmb2N1c2FibGUsIFNwYWNlL0VudGVyIGxpZnRzLCBhcnJvd3MgY2hvb3NlIGEgZG9jaywgJyArXG4gICAgICAgICdTcGFjZS9FbnRlciBwbGFjZXMsIEVzY2FwZSBjYW5jZWxzLiBFdmVyeSBtb3ZlIG5hcnJhdGVzIHRvIGEgJyArXG4gICAgICAgICd2aXN1YWxseS1oaWRkZW4gYXJpYS1saXZlIHJlZ2lvbiAoXCJDYXJkIEIgcGxhY2VkIG9uIGl0ZW0gMlwiKS4nLFxuICAgIH0sXG4gIH0sXG5cbiAgb3JkZXJpbmc6IHtcbiAgICB0eXBlOiAnb3JkZXJpbmcnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ29yZGVyaW5nJyxcbiAgICBzYW5pdGl6ZToge1xuICAgICAgc3RyaXA6IFsnc29sdXRpb24nXSxcbiAgICAgIC8vIFRoZSBhdXRob3JlZCBpdGVtcyBvcmRlciBJUyB0aGUga2V5IFx1MjAxNCB0aGUgc2VydmVyIHNlcnZlcyBhIHNodWZmbGVcbiAgICAgIC8vIChzdGFibGUgcGVyIHZlcnNpb24gKyBzdHVkZW50IHNvIHJlbG9hZHMgZG9uJ3QgcmVzaHVmZmxlKS5cbiAgICAgIHNlcnZlU2h1ZmZsZWQ6IFsnaXRlbXMnXSxcbiAgICB9LFxuICAgIHByaW50OiB7XG4gICAgICBicmVha0luc2lkZTogJ2F2b2lkJyxcbiAgICAgIHRyZWF0bWVudDogJ251bWJlci1ib3hlcycsXG4gICAgICBhbnN3ZXJLZXlWYXJpYW50OiB0cnVlLFxuICAgICAgLy8gVGhlIGF1dGhvcmVkIG9yZGVyIGlzIHRoZSBhbnN3ZXIsIHNvIHBhcGVyIG11c3QgbmV2ZXIgc2hvdyBpdC4gVGhlXG4gICAgICAvLyBzZXJ2ZXIgYWxyZWFkeSBzaHVmZmxlcyBmb3Igc3R1ZGVudHMgKHNlcnZlU2h1ZmZsZWQgYWJvdmUpOyB0ZWFjaGVyXG4gICAgICAvLyBwcmludCBnZXRzIGl0cyBvd24sIGJlY2F1c2UgdGhhdCBwYXRoIGRlbGliZXJhdGVseSBkb2VzIG5vdCBydW4gdGhlXG4gICAgICAvLyBwZXItc3R1ZGVudCBzZXJ2ZSBzaHVmZmxlLlxuICAgICAgc2h1ZmZsZWQ6IFsnaXRlbXMnXSxcbiAgICB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnUm93cyBhcmUgZm9jdXNhYmxlIGFuZCByZW9yZGVyIHZpYSB0aGUgc2hhcmVkIGxpZnQgZ3JhbW1hcjogJyArXG4gICAgICAgICdTcGFjZS9FbnRlciBsaWZ0cywgYXJyb3dzIG1vdmUgdGhlIHJvdywgU3BhY2UvRW50ZXIgZHJvcHMsIEVzY2FwZSAnICtcbiAgICAgICAgJ2NhbmNlbHM7IHBvc2l0aW9ucyBuYXJyYXRlIHRvIGEgdmlzdWFsbHktaGlkZGVuIGFyaWEtbGl2ZSByZWdpb24uJyxcbiAgICB9LFxuICB9LFxuXG4gIG51bWJlcl9saW5lOiB7XG4gICAgdHlwZTogJ251bWJlcl9saW5lJyxcbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdudW1iZXJfbGluZScsXG4gICAgdmFyaWFudHM6IFsncGxvdF9wb2ludCcsICdwbG90X2ludGVydmFsJ10sXG4gICAgc2FuaXRpemU6IHtcbiAgICAgIC8vIFRoZSB3aWRnZXQgbmVlZHMgaGFuZGxlIGNvdW50IC8gZmFtaWx5LCB3aGljaCBsaXZlIGluIHRoZSBrZXkgdGhlXG4gICAgICAvLyB2aWV3ZXIgbmV2ZXIgZ2V0cy4gRGVyaXZlZCArIHdoaXRlbGlzdGVkOyBzZWUgU2FuaXRpemVTcGVjLlxuICAgICAgZGVyaXZlUXVlc3Rpb25TaGFwZTogdHJ1ZSxcbiAgICAgIHN0cmlwOiBbXG4gICAgICAgICdpbnRlcmFjdGlvbi5jb3JyZWN0UG9pbnRzJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLnRvbGVyYW5jZScsXG4gICAgICAgICdpbnRlcmFjdGlvbi5jb3JyZWN0SW50ZXJ2YWwnLFxuICAgICAgICAnc29sdXRpb24nLFxuICAgICAgXSxcbiAgICB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdzdGF0aWMtc3ZnJywgYW5zd2VyS2V5VmFyaWFudDogdHJ1ZSB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnVGhlIGxpbmUgaXMgZm9jdXNhYmxlOyBwb2ludHMvaW50ZXJ2YWwgZW5kcG9pbnRzIG1vdmUgYnkgYXJyb3cga2V5cyAnICtcbiAgICAgICAgJ3dpdGggdmFsdWUgbmFycmF0aW9uIHRvIGEgdmlzdWFsbHktaGlkZGVuIGFyaWEtbGl2ZSByZWdpb24gKHZpc2libGUgJyArXG4gICAgICAgICdyZWFkb3V0IHdvdWxkIHJldmVhbCB0aGUgYW5zd2VyKS4gUG9zdC1jaGVjayByZXN1bHRzIGFyZSB2aXNpYmxlLicsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhX3Bsb3Q6IHtcbiAgICB0eXBlOiAnZGF0YV9wbG90JyxcbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJywgLy8gZGlzcGxheSB2YXJpYW50IHJlc29sdmVzIHN0YXRpYyB2aWEgZmFtaWx5T2YoKVxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsIC8vIGRpc3BsYXkgdmFyaWFudCByZXNvbHZlcyBjb250ZW50IHZpYSBjYXRlZ29yeU9mKClcbiAgICBudW1iZXJlZDogJ3doZW5fZ3JhZGFibGUnLFxuICAgIGFuYWx5dGljc0tleTogJ2RhdGFfcGxvdCcsXG4gICAgdmFyaWFudHM6IFsnZGlzcGxheScsICdidWlsZF9kb3RwbG90JywgJ2J1aWxkX2hpc3RvZ3JhbScsICdidWlsZF9ib3hwbG90J10sXG4gICAgc2FuaXRpemU6IHtcbiAgICAgIC8vIFRoZSB3aWRnZXQgbmVlZHMgaGFuZGxlIGNvdW50IC8gZmFtaWx5LCB3aGljaCBsaXZlIGluIHRoZSBrZXkgdGhlXG4gICAgICAvLyB2aWV3ZXIgbmV2ZXIgZ2V0cy4gRGVyaXZlZCArIHdoaXRlbGlzdGVkOyBzZWUgU2FuaXRpemVTcGVjLlxuICAgICAgZGVyaXZlUXVlc3Rpb25TaGFwZTogdHJ1ZSxcbiAgICAgIHN0cmlwOiBbJ3NvbHV0aW9uJywgJ2ludGVyYWN0aW9uLnRvbGVyYW5jZSddLFxuICAgICAgZGVyaXZhYmxlRnJvbVNlcnZlZDpcbiAgICAgICAgJ1RoZSBkYXRhIHNldCBpcyB0aGUgd29ya2luZyBtYXRlcmlhbCB0aGUgc3R1ZGVudCBidWlsZHMgdGhlIGNoYXJ0ICcgK1xuICAgICAgICAnRlJPTSwgYW5kIHRoZSBjb3JyZWN0IGNoYXJ0IGlzIGNvbXB1dGVkIGZyb20gaXQgXHUyMDE0IHdpdGhob2xkaW5nIHRoZSAnICtcbiAgICAgICAgJ2RhdGEgd291bGQgcmVtb3ZlIHRoZSB0YXNrLiBTZXJ2ZXItYXV0aG9yaXRhdGl2ZSBncmFkaW5nIHN0aWxsIGdhdGVzICcgK1xuICAgICAgICAndmVyZGljdHM7IHRoZSBsZWFrIHRlc3RzIHdoaXRlbGlzdCBgZGF0YWAgZm9yIHRoaXMgYmxvY2sgZXhwbGljaXRseS4nLFxuICAgIH0sXG4gICAgLy8gV0FTIGEgZmFpdGhmdWwgb2RkaXR5IChhYnNlbnQgZnJvbSB0aGUgYmFzZWxpbmUgYnJlYWstaW5zaWRlOmF2b2lkIGxpc3QsXG4gICAgLy8gdW5saWtlIHRoZSBncmFwaCBhbmQgbnVtYmVyLWxpbmUgY2FudmFzZXMpLiBGSVhFRCBieSBydWxpbmcgUzUtT1Y2IFx1MjAxNCBhXG4gICAgLy8gY2hhcnQgc3BsaXQgYWNyb3NzIGEgcGFnZSBib3VuZGFyeSBpcyB1bnJlYWRhYmxlLlxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdzdGF0aWMtc3ZnJywgYW5zd2VyS2V5VmFyaWFudDogdHJ1ZSB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnQ2hhcnQtYnVpbGRpbmcgY29udHJvbHMgYXJlIGZvY3VzYWJsZTsgZG90cy9iYXJzL2JveCBoYW5kbGVzIGFkanVzdCAnICtcbiAgICAgICAgJ2J5IGFycm93IGtleXMgd2l0aCB2YWx1ZSBuYXJyYXRpb24gdG8gYSB2aXN1YWxseS1oaWRkZW4gYXJpYS1saXZlICcgK1xuICAgICAgICAncmVnaW9uLiBQb3N0LWNoZWNrIHJlc3VsdHMgYXJlIHZpc2libGUgdGV4dC4nLFxuICAgIH0sXG4gIH0sXG5cbiAgbGVhcm5pbmdfb2JqZWN0aXZlczoge1xuICAgIHR5cGU6ICdsZWFybmluZ19vYmplY3RpdmVzJyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnbGVhcm5pbmdfb2JqZWN0aXZlcycsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ2JvcmRlcmVkLWJveCcgfSxcbiAgfSxcblxuICB3b3JrZWRfZXhhbXBsZToge1xuICAgIHR5cGU6ICd3b3JrZWRfZXhhbXBsZScsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ3dvcmtlZF9leGFtcGxlJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10sIGNoaWxkQmxvY2tzOiBbJ2NvbnRlbnQnXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdib3JkZXJlZC1ib3gnIH0sXG4gIH0sXG5cbiAgZmFkZWRfd29ya2VkX2V4YW1wbGU6IHtcbiAgICB0eXBlOiAnZmFkZWRfd29ya2VkX2V4YW1wbGUnLFxuICAgIC8vIFRoZSBib3ggY291bnRzIGFzIE9ORSBudW1iZXJlZCBwcm9ibGVtOyBncmFkaW5nIHJpZGVzIGl0cyBjaGlsZFxuICAgIC8vIGZpbGxfaW5fYmxhbmsgc3RlcHMsIGVhY2ggc2FuaXRpemVkIGJ5IGl0cyBvd24gZW50cnkgdmlhIGNoaWxkQmxvY2tzLlxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnc2NhZmZvbGQnLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdmYWRlZF93b3JrZWRfZXhhbXBsZScsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdLCBjaGlsZEJsb2NrczogWydjb250ZW50J10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnYm9yZGVyZWQtYm94JyB9LFxuICB9LFxuXG4gIHNlbGZfZXhwbGFuYXRpb246IHtcbiAgICB0eXBlOiAnc2VsZl9leHBsYW5hdGlvbicsXG4gICAgZmFtaWx5OiAncmVjb3JkZWQnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnc2VsZl9leHBsYW5hdGlvbicsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgLy8gV0FTIGEgZmFpdGhmdWwgb2RkaXR5OiB0aGUgYmFzZWxpbmUgYXZvaWQgcmlkZXMgdGhlIHRleHRhcmVhLCBub3QgdGhlXG4gICAgLy8gYmxvY2ssIHNvIGEgbG9uZyBwcm9tcHQgY291bGQgc2VwYXJhdGUgZnJvbSBpdHMgd3JpdGluZyBib3guIEZJWEVEIGJ5XG4gICAgLy8gcnVsaW5nIFM1LU9WNiBcdTIwMTQgYSBwcm9tcHQgb24gb25lIHBhZ2UgYW5kIGl0cyBhbnN3ZXIgc3BhY2Ugb24gdGhlIG5leHQgaXNcbiAgICAvLyB0aGUgc2FtZSBkZWZlY3QgY2xhc3MgYXMgYSBzcGxpdCBlcXVhdGlvbi5cbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnd3JpdGluZy1ib3gnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdBIGxhYmVsZWQgdGV4dGFyZWEgaW4gdGFiIG9yZGVyLiBPbiBjaGVjayB0aGUgYmxvY2sgYW5ub3VuY2VzICcgK1xuICAgICAgICAnXCJSZWNvcmRlZCBcdTIwMTQgeW91ciB0ZWFjaGVyIHdpbGwgcmV2aWV3XCIgdmlhIGFyaWEtbGl2ZTsgbmV2ZXIgYSB2ZXJkaWN0LicsXG4gICAgfSxcbiAgfSxcblxuICBzaG9ydF9hbnN3ZXI6IHtcbiAgICB0eXBlOiAnc2hvcnRfYW5zd2VyJyxcbiAgICBmYW1pbHk6ICdyZWNvcmRlZCcsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdzaG9ydF9hbnN3ZXInLFxuICAgIC8vIFJ1YnJpY3MgYXJlIHRlYWNoZXItc2lkZSBkYXRhIFx1MjAxNCBhbHJlYWR5IGNvcnJlY3RseSB3aXRoaGVsZCBmcm9tIHN0dWRlbnRcbiAgICAvLyBIVE1MIHRvZGF5OyB0aGUgcmVnaXN0cnkgbWFrZXMgdGhhdCBhIGRlY2xhcmVkIGludmFyaWFudC5cbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogWydydWJyaWMnXSB9LFxuICAgIC8vIFNhbWUgZm9ybWVyIG9kZGl0eSBhcyBzZWxmX2V4cGxhbmF0aW9uLCBhbmQgZml4ZWQgd2l0aCBpdDogdGhlIGJhc2VsaW5lXG4gICAgLy8gYXZvaWQgcmlkZXMgdGhlIHRleHRhcmVhLCBub3QgdGhlIGJsb2NrLCBzbyBhIHByb21wdCBjb3VsZCBwcmludCBvbiBvbmVcbiAgICAvLyBwYWdlIHdpdGggaXRzIGFuc3dlciBzcGFjZSBvbiB0aGUgbmV4dC4gUzUtT1Y2IG5hbWVkIG9ubHkgdGhlIHRocmVlXG4gICAgLy8gdHlwZXMgaXRzIGNvbW1lbnRzIGZsYWdnZWQ7IHRoZSBhdXRob3IgZXh0ZW5kZWQgdGhlIHJ1bGluZyB0byB0aGUgdHdvXG4gICAgLy8gdW5uYW1lZCBzaWJsaW5ncyBvZiB0aGUgc2FtZSBmYW1pbHkgcmF0aGVyIHRoYW4gbGVhdmUgdGhlIGRlZmVjdCBpblxuICAgIC8vIHBsYWNlIGZvciB0aGVtICh0aGUgcGxvdF9yYXkvcGxvdF9zZWdtZW50IGxlc3NvbjogYXVkaXQgdGhlIGZhbWlseSkuXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3dyaXRpbmctYm94JyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnQSBsYWJlbGVkIHRleHRhcmVhIGluIHRhYiBvcmRlci4gUmVjb3JkZWQgc3RhdGUgYW5ub3VuY2VzIHZpYSAnICtcbiAgICAgICAgJ2FyaWEtbGl2ZTsgdGVhY2hlciBmZWVkYmFjaywgb25jZSByZWxlYXNlZCwgcmVuZGVycyBhcyBhIGxhYmVsZWQgJyArXG4gICAgICAgICdyZWdpb24gYW5ub3VuY2VkIG9uIGFycml2YWwuJyxcbiAgICB9LFxuICB9LFxuXG4gIGVzc2F5OiB7XG4gICAgdHlwZTogJ2Vzc2F5JyxcbiAgICBmYW1pbHk6ICdyZWNvcmRlZCcsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdlc3NheScsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFsncnVicmljJ10gfSxcbiAgICAvLyBFeHRlbmRlZCB3aXRoIHNob3J0X2Fuc3dlciArIHNlbGZfZXhwbGFuYXRpb24gXHUyMDE0IHNlZSB0aGUgbm90ZSB0aGVyZS5cbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnd3JpdGluZy1ib3gnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdBIGxhYmVsZWQgdGV4dGFyZWEgaW4gdGFiIG9yZGVyLiBUaGUgbGl2ZSB3b3JkIGNvdW50ZXIgaXMgJyArXG4gICAgICAgICdhcmlhLWxpdmU9cG9saXRlIGFuZCBkZWJvdW5jZWQgc28gaXQgbmV2ZXIgY2hhdHRlcnMgcGVyIGtleXN0cm9rZS4gJyArXG4gICAgICAgICdSZWNvcmRlZCBzdGF0ZSBhbmQgcmVsZWFzZWQgdGVhY2hlciBmZWVkYmFjayBhbm5vdW5jZSB2aWEgYXJpYS1saXZlLicsXG4gICAgfSxcbiAgfSxcblxuICBncmFwaF9maWd1cmU6IHtcbiAgICB0eXBlOiAnZ3JhcGhfZmlndXJlJyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnZ3JhcGhfZmlndXJlJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICdmaWd1cmUnIH0sXG4gIH0sXG59O1xuXG4vKiogRXZlcnkgcmVnaXN0ZXJlZCB0eXBlLCBpbiByZWdpc3RyeSBkZWNsYXJhdGlvbiBvcmRlci4gKi9cbmV4cG9ydCBjb25zdCByZWdpc3RlcmVkQmxvY2tUeXBlcyA9IE9iamVjdC5rZXlzKGJsb2NrUmVnaXN0cnkpIGFzIEJsb2NrVHlwZVtdO1xuXG4vKiogUmVzb2x2ZSBhbiBJTlNUQU5DRSdzIGNoZWNrZWQtc3RhdGUgZmFtaWx5LiBBIHR5cGUncyBkZWNsYXJlZCBmYW1pbHkgaXNcbiAqIG1heGltYWw7IHVuZ3JhZGFibGUgaW5zdGFuY2VzIG9mIGdyYWRhYmxlIHR5cGVzIChkaXNwbGF5IGdyYXBoL2RhdGEgcGxvdCxcbiAqIHByb21wdGxlc3MgbWF0aCBibG9jaykgcmVzb2x2ZSB0byBzdGF0aWMgXHUyMDE0IG9uZSBydWxlIGVuZ2luZSwgaXNHcmFkZWFibGUuICovXG5leHBvcnQgZnVuY3Rpb24gZmFtaWx5T2YoYmxvY2s6IEJsb2NrKTogQ2hlY2tlZFN0YXRlRmFtaWx5IHtcbiAgY29uc3QgZW50cnkgPSBibG9ja1JlZ2lzdHJ5W2Jsb2NrLnR5cGVdO1xuICBpZiAoZW50cnkuZmFtaWx5ID09PSAnc3RhdGljJykgcmV0dXJuICdzdGF0aWMnO1xuICByZXR1cm4gaXNHcmFkZWFibGUoYmxvY2spID8gZW50cnkuZmFtaWx5IDogJ3N0YXRpYyc7XG59XG5cbi8qKiBSZXNvbHZlIGFuIElOU1RBTkNFJ3MgY2F0ZWdvcnk6IGEgZGlzcGxheS1tb2RlIGdyYXBoL2RhdGEgcGxvdCBzZXJ2ZXMgYXNcbiAqIGNvbnRlbnQsIG1hdGNoaW5nIHRoZSByZW5kZXJlcidzIGRhdGEtYmxvY2stY2F0ZWdvcnkgZW1pc3Npb24uICovXG5leHBvcnQgZnVuY3Rpb24gY2F0ZWdvcnlPZihibG9jazogQmxvY2spOiBCbG9ja0NhdGVnb3J5IHtcbiAgY29uc3QgZW50cnkgPSBibG9ja1JlZ2lzdHJ5W2Jsb2NrLnR5cGVdO1xuICBpZiAoZW50cnkuY2F0ZWdvcnkgPT09ICdxdWVzdGlvbicgJiYgZW50cnkubnVtYmVyZWQgPT09ICd3aGVuX2dyYWRhYmxlJykge1xuICAgIHJldHVybiBpc0dyYWRlYWJsZShibG9jaykgPyAncXVlc3Rpb24nIDogJ2NvbnRlbnQnO1xuICB9XG4gIHJldHVybiBlbnRyeS5jYXRlZ29yeTtcbn1cblxuLyoqIENlbnN1cyBrZXkgZm9yIGFuIGluc3RhbmNlIChQM0EpOiB0aGUgYW5hbHl0aWNzIGtleSwgd2l0aCB0aGUgaW50ZXJhY3Rpb25cbiAqIHZhcmlhbnQgYXBwZW5kZWQgZm9yIHRoZSBibG9ja3MgdGhhdCBoYXZlIG9uZSBcdTIwMTQgYGRhdGFfcGxvdC5idWlsZF9oaXN0b2dyYW1gLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNlbnN1c0tleU9mKGJsb2NrOiBCbG9jayk6IHN0cmluZyB7XG4gIGNvbnN0IGVudHJ5ID0gYmxvY2tSZWdpc3RyeVtibG9jay50eXBlXTtcbiAgaWYgKCdpbnRlcmFjdGlvbicgaW4gYmxvY2sgJiYgZW50cnkudmFyaWFudHMpIHtcbiAgICByZXR1cm4gYCR7ZW50cnkuYW5hbHl0aWNzS2V5fS4ke2Jsb2NrLmludGVyYWN0aW9uLnR5cGV9YDtcbiAgfVxuICByZXR1cm4gZW50cnkuYW5hbHl0aWNzS2V5O1xufVxuXG4vKiogV2hldGhlciBhbiBJTlNUQU5DRSBkcmF3cyBhIHByb2JsZW0gbnVtYmVyIChkZWxlZ2F0ZXMgdG8gdGhlIHNjaGVtYSBydWxlXG4gKiBlbmdpbmUgXHUyMDE0IHJlLWV4cG9ydGVkIGhlcmUgc28gdmlld2VyIGNvZGUgaGFzIG9uZSBpbXBvcnQgc3VyZmFjZSkuICovXG5leHBvcnQgeyBpc1BhZ2VOdW1iZXJlZCB9O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBzYW5pdGl6ZS9zYW5pdGl6ZS50cyBcdTIwMTQgdGhlIGFuc3dlci1rZXkgc2FuaXRpemVyIChTMi9UMywgcnVsaW5nIFRWNC1BKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEEgR0VORVJJQyBzdHJpcCB0cmFuc2Zvcm0gZHJpdmVuIGVudGlyZWx5IGJ5IHRoZSByZWdpc3RyeSdzIFNhbml0aXplU3BlY1xuLy8gZGVjbGFyYXRpb25zIFx1MjAxNCBpdCBob2xkcyBubyBwZXItdHlwZSBrbm93bGVkZ2Ugb2YgaXRzIG93biAocnVsaW5nIFExQTogdGhlXG4vLyByZWdpc3RyeSBkZWNsYXJlcywgdHJhbnNmb3JtcyBvYmV5KS4gUnVucyBzZXJ2ZXItc2lkZSBpbiB0aGUgZ2V0LWFjdGl2aXR5XG4vLyBFZGdlIEZ1bmN0aW9uLCBjb21wb3NlZCB3aXRoIHVwZ3JhZGUtb24tcmVhZDsgdGhlIG91dHB1dCBpcyB3aGF0IHRoZSBkdXJhYmxlXG4vLyBwZXItdmVyc2lvbiBjYWNoZSBzdG9yZXMgYW5kIHRoZSB2aWV3ZXIgcmVjZWl2ZXMuIEFuc3dlcnMgTkVWRVIgcmVhY2ggYVxuLy8gc3R1ZGVudCBjbGllbnQgKHJ1bGluZyBRMkIpIFx1MjAxNCB0aGUgd2lyZS1sZXZlbCBsZWFrIHRlc3RzIGluXG4vLyB0ZXN0cy9zYW5pdGl6ZS50ZXN0LnRzIGFzc2VydCB0aGUgb3V0Y29tZSwgbm90IHRoZSBtZWNoYW5pc20uXG4vL1xuLy8gVGhyZWUgbGF5ZXJzLCBpbiBvcmRlciwgcGVyIGJsb2NrOlxuLy8gICAxLiBEZWNsYXJlZCBzdHJpcHMgXHUyMDE0IHRoZSBlbnRyeSdzIGBzdHJpcGAgcGF0aHMsIGluIHRoZSB0aW55IGdyYW1tYXJcbi8vICAgICAgdHlwZXMudHMgZG9jdW1lbnRzICgnZmllbGQnLCAnZmllbGRbXS5zdWInLCAnaW50ZXJhY3Rpb24uZmllbGQnKS5cbi8vICAgMi4gQ2hpbGQgcmVjdXJzaW9uIFx1MjAxNCBgY2hpbGRCbG9ja3NgIGZpZWxkcyByZS1lbnRlciB0aGUgc2FuaXRpemVyLCBzbyBhXG4vLyAgICAgIGZpbGxfaW5fYmxhbmsgbmVzdGVkIGluIGEgd29ya2VkIGV4YW1wbGUgaXMgc3RyaXBwZWQgYnkgSVRTIE9XTiBlbnRyeS5cbi8vICAgMy4gSW4tYmFuZCBkZWVwIHdhbGsgXHUyMDE0IEJsYW5rVG9rZW4gYW5kIE1hdGhQcm9tcHQgc2VjcmV0cyBhcmUgc3RyaXBwZWQgZnJvbVxuLy8gICAgICBldmVyeSBvYmplY3QgdGhlIGJsb2NrIGNhcnJpZXMsIFVOQ09ORElUSU9OQUxMWSAobm90IGdhdGVkIG9uIHRoZVxuLy8gICAgICBlbnRyeSdzIGBpbmxpbmVCbGFua1NlY3JldHNgIGZsYWcpLiBEZWZlbnNlIGluIGRlcHRoOiB0aGUgc2NoZW1hIGFkbWl0c1xuLy8gICAgICBhIHByb21wdGVkIG1hdGhfaW5saW5lIGluc2lkZSBhbnkgY29udGVudCBhcnJheSBcdTIwMTQgYSBwYXJhZ3JhcGgsIGEgaGludCxcbi8vICAgICAgYSBsaXN0IGl0ZW0gXHUyMDE0IGFuZCBhIGRlY2xhcmF0aW9uIG1pc3MgdGhlcmUgbXVzdCBub3QgYmVjb21lIGEgc2lsZW50XG4vLyAgICAgIGxlYWsuIFRoZSBmbGFnIHN0YXlzIGRlY2xhcmF0aXZlIChzZWUgdHlwZXMudHMpLlxuLy9cbi8vIFdoYXQgc2FuaXRpemUgZG9lcyBOT1QgZG86IHRoZSBwZXItc3R1ZGVudCBgc2VydmVTaHVmZmxlZGAgcmVvcmRlci4gVGhhdCBpc1xuLy8gc2VydmUtdGltZSB3b3JrIChzaHVmZmxlLnRzKSBwcmVjaXNlbHkgc28gVEhJUyBvdXRwdXQgaXMgY2FjaGVhYmxlIHBlclxuLy8gdmVyc2lvbiBcdTIwMTQgdGhlIG9yZGVyIHNlY3JldCBjYW4ndCBiZSBoYW5kbGVkIGJ5IGEgc3RyaXAsIGFuZCB0aGUgc2h1ZmZsZVxuLy8gY2FuJ3QgYmUgaGFuZGxlZCBieSB0aGUgY2FjaGUuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgdHlwZSB7IEFjdGl2aXR5RG9jdW1lbnQsIEJsb2NrIH0gZnJvbSAnQGFjdGl2aXR5L3NjaGVtYSc7XG5pbXBvcnQge1xuICBCTEFOS19TRUNSRVRfRklFTERTLFxuICBNQVRIX1BST01QVF9TRUNSRVRfRklFTERTLFxuICBibG9ja1JlZ2lzdHJ5LFxuICByZWdpc3RlcmVkQmxvY2tUeXBlcyxcbn0gZnJvbSAnLi4vcmVnaXN0cnkvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHR5cGUge1xuICBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50LFxuICBTYW5pdGl6ZWRCbG9jayxcbn0gZnJvbSAnLi9zYW5pdGl6ZWQtdHlwZXMuanMnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2FuaXRpemVyIHJldmlzaW9uIFx1MjAxNCB0aGUgZHVyYWJsZSBjYWNoZSdzIGludmFsaWRhdGlvbiBrZXlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgcmVhZCBjYWNoZSBzdG9yZXMgc2FuaXRpemVkIG91dHB1dCBwZXIgKHZlcnNpb25faWQsIFNBTklUSVpFUl9SRVYpLiBUaGVcbi8vIHJldiBpcyBDT01QVVRFRCBmcm9tIHRoZSByZWdpc3RyeSdzIHNhbml0aXplIGRlY2xhcmF0aW9ucyArIHRoZSBzZWNyZXQtZmllbGRcbi8vIGxpc3RzLCBzbyBjaGFuZ2luZyBhbnkgc3BlYyBhdXRvbWF0aWNhbGx5IG9ycGhhbnMgZXZlcnkgc3RhbGUgY2FjaGUgcm93IFx1MjAxNCBhXG4vLyBzYW5pdGl6ZXIgZml4IHRoYXQgcmVxdWlyZWQgYSBoYW5kLWJ1bXBlZCBjb25zdGFudCB0byB0YWtlIGVmZmVjdCBpcyBleGFjdGx5XG4vLyB0aGUgZm9yZ2V0dGFibGUtc3RlcCBjbGFzcyB0aGlzIHJlcG8gZG9jdW1lbnRzIChncmFwaC1raXQgbWFuaWZlc3QsIDAwMTUnc1xuLy8gZ3JhbnQgc3RhbnphcykuIEJ1bXAgU0FOSVRJWkVSX0FMR09fUkVWIGJ5IGhhbmQgT05MWSB3aGVuIHRoZSB0cmFuc2Zvcm1cbi8vIGxvZ2ljIGl0c2VsZiBjaGFuZ2VzIGluIGEgd2F5IHRoZSBkZWNsYXJhdGlvbnMgZG9uJ3QgY2FwdHVyZS5cblxuZXhwb3J0IGNvbnN0IFNBTklUSVpFUl9BTEdPX1JFViA9IDE7XG5cbi8qKiBGTlYtMWEgMzItYml0LCBoZXguIFRpbnksIGRlcGVuZGVuY3ktZnJlZSwgc3RhYmxlIGFjcm9zcyBKUyBydW50aW1lcyBcdTIwMTRcbiAqIHRoaXMgaXMgYSBjYWNoZS1idXN0aW5nIGZpbmdlcnByaW50LCBub3Qgc2VjdXJpdHkgbWF0ZXJpYWwuICovXG5mdW5jdGlvbiBmbnYxYSh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgaGFzaCA9IDB4ODExYzlkYzU7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdGV4dC5sZW5ndGg7IGkrKykge1xuICAgIGhhc2ggXj0gdGV4dC5jaGFyQ29kZUF0KGkpO1xuICAgIGhhc2ggPSBNYXRoLmltdWwoaGFzaCwgMHgwMTAwMDE5Myk7XG4gIH1cbiAgcmV0dXJuIChoYXNoID4+PiAwKS50b1N0cmluZygxNikucGFkU3RhcnQoOCwgJzAnKTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVNhbml0aXplclJldigpOiBzdHJpbmcge1xuICBjb25zdCBzcGVjcyA9IFsuLi5yZWdpc3RlcmVkQmxvY2tUeXBlc11cbiAgICAuc29ydCgpXG4gICAgLm1hcCgodHlwZSkgPT4gW3R5cGUsIGJsb2NrUmVnaXN0cnlbdHlwZV0uc2FuaXRpemVdKTtcbiAgY29uc3QgbWF0ZXJpYWwgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgYWxnbzogU0FOSVRJWkVSX0FMR09fUkVWLFxuICAgIGJsYW5rOiBCTEFOS19TRUNSRVRfRklFTERTLFxuICAgIHByb21wdDogTUFUSF9QUk9NUFRfU0VDUkVUX0ZJRUxEUyxcbiAgICBzcGVjcyxcbiAgfSk7XG4gIHJldHVybiBgJHtTQU5JVElaRVJfQUxHT19SRVZ9LSR7Zm52MWEobWF0ZXJpYWwpfWA7XG59XG5cbi8qKiBUaGUgY2FjaGUga2V5IGNvbXBvbmVudC4gU3RhYmxlIGZvciBhIGdpdmVuIHJlZ2lzdHJ5ICsgYWxnb3JpdGhtOyBjaGFuZ2VzXG4gKiB3aGVuZXZlciBhbnkgc2FuaXRpemUgZGVjbGFyYXRpb24gY2hhbmdlcy4gKi9cbmV4cG9ydCBjb25zdCBTQU5JVElaRVJfUkVWID0gY29tcHV0ZVNhbml0aXplclJldigpO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHN0cmlwIGdyYW1tYXIgKGV4YWN0bHkgd2hhdCB0eXBlcy50cyBkb2N1bWVudHMgXHUyMDE0IG5vdGhpbmcgbW9yZSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIGFwcGx5U3RyaXBQYXRoKGJsb2NrOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgcGF0aDogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IGFycmF5SWR4ID0gcGF0aC5pbmRleE9mKCdbXS4nKTtcbiAgaWYgKGFycmF5SWR4ICE9PSAtMSkge1xuICAgIC8vICdmaWVsZFtdLnN1YicgXHUyMDE0IGRlbGV0ZSBgc3ViYCBmcm9tIGV2ZXJ5IGVsZW1lbnQgb2YgYXJyYXkgYGZpZWxkYC5cbiAgICBjb25zdCBmaWVsZCA9IHBhdGguc2xpY2UoMCwgYXJyYXlJZHgpO1xuICAgIGNvbnN0IHN1YiA9IHBhdGguc2xpY2UoYXJyYXlJZHggKyAzKTtcbiAgICBjb25zdCBhcnIgPSBibG9ja1tmaWVsZF07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgZm9yIChjb25zdCBlbCBvZiBhcnIpIHtcbiAgICAgICAgaWYgKGVsICE9PSBudWxsICYmIHR5cGVvZiBlbCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBkZWxldGUgKGVsIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVtzdWJdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBkb3RJZHggPSBwYXRoLmluZGV4T2YoJy4nKTtcbiAgaWYgKGRvdElkeCAhPT0gLTEpIHtcbiAgICAvLyAncGFyZW50LmZpZWxkJyBcdTIwMTQgZGVsZXRlIGBmaWVsZGAgZnJvbSB0aGUgbmVzdGVkIG9iamVjdCB3aGVuIHByZXNlbnQuXG4gICAgLy8gVmFyaWFudC1zY29wZWQga2V5cyBzaW1wbHkgZG9uJ3QgbWF0Y2ggb24gb3RoZXIgdmFyaWFudHMuXG4gICAgY29uc3QgcGFyZW50ID0gYmxvY2tbcGF0aC5zbGljZSgwLCBkb3RJZHgpXTtcbiAgICBpZiAocGFyZW50ICE9PSBudWxsICYmIHR5cGVvZiBwYXJlbnQgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHBhcmVudCkpIHtcbiAgICAgIGRlbGV0ZSAocGFyZW50IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVtwYXRoLnNsaWNlKGRvdElkeCArIDEpXTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vICdmaWVsZCcgXHUyMDE0IGRlbGV0ZSB0aGUgYmxvY2sncyB0b3AtbGV2ZWwgZmllbGQuXG4gIGRlbGV0ZSBibG9ja1twYXRoXTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEluLWJhbmQgc2VjcmV0cyBcdTIwMTQgdGhlIHVuY29uZGl0aW9uYWwgZGVlcCB3YWxrIChsYXllciAzKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgUFJPTVBUX0NBUlJJRVJfVFlQRVMgPSBuZXcgU2V0KFsnbWF0aF9pbmxpbmUnLCAnbWF0aF9ibG9jayddKTtcblxuZnVuY3Rpb24gc3RyaXBJbkJhbmRTZWNyZXRzKHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIGZvciAoY29uc3QgZWwgb2YgdmFsdWUpIHN0cmlwSW5CYW5kU2VjcmV0cyhlbCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSByZXR1cm47XG4gIGNvbnN0IG9iaiA9IHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIGlmIChvYmoudHlwZSA9PT0gJ2JsYW5rJykge1xuICAgIGZvciAoY29uc3QgZmllbGQgb2YgQkxBTktfU0VDUkVUX0ZJRUxEUykgZGVsZXRlIG9ialtmaWVsZF07XG4gIH1cbiAgaWYgKFxuICAgIHR5cGVvZiBvYmoudHlwZSA9PT0gJ3N0cmluZycgJiZcbiAgICBQUk9NUFRfQ0FSUklFUl9UWVBFUy5oYXMob2JqLnR5cGUpICYmXG4gICAgQXJyYXkuaXNBcnJheShvYmoucHJvbXB0cylcbiAgKSB7XG4gICAgZm9yIChjb25zdCBwcm9tcHQgb2Ygb2JqLnByb21wdHMpIHtcbiAgICAgIGlmIChwcm9tcHQgIT09IG51bGwgJiYgdHlwZW9mIHByb21wdCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yIChjb25zdCBmaWVsZCBvZiBNQVRIX1BST01QVF9TRUNSRVRfRklFTERTKSB7XG4gICAgICAgICAgZGVsZXRlIChwcm9tcHQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW2ZpZWxkXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvYmopKSBzdHJpcEluQmFuZFNlY3JldHMob2JqW2tleV0pO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUGVyLWJsb2NrIHNhbml0aXplXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogTXV0YXRpbmcgY29yZSBcdTIwMTQgb3BlcmF0ZXMgb24gYW4gYWxyZWFkeS1jbG9uZWQgYmxvY2suICovXG5cbi8vIC0tLS0gRGVyaXZlZCBxdWVzdGlvbiBzaGFwZSAodGhlIG9uZSBBRERJVElWRSBzdGVwKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc2FuaXRpemVyJ3Mgam9iIGlzIHJlbW92YWw7IHRoaXMgaXMgdGhlIHNpbmdsZSBleGNlcHRpb24sIGFuZCBpdCBpc1xuLy8gZmVuY2VkIGFjY29yZGluZ2x5LlxuLy9cbi8vIFdoeSBpdCBleGlzdHM6IHRoZSBncmFwaCB3aWRnZXRzIHRha2UgdGhlaXIgaGFuZGxlIGNvdW50IGFuZCBjdXJ2ZSBmYW1pbHlcbi8vIGZyb20gdGhlIGFuc3dlciBrZXkuIFRoZSB2aWV3ZXIgbmV2ZXIgcmVjZWl2ZXMgYSBrZXksIHNvIHdpdGhvdXQgdGhpcyBhXG4vLyBzZXJ2ZWQgZ3JhcGggcXVlc3Rpb24gY2Fubm90IGJlIGxhaWQgb3V0IFx1MjAxNCB0aGVyZSBpcyBubyB3YXkgdG8ga25vdyB3aGV0aGVyXG4vLyB0byBkcmF3IG9uZSBoYW5kbGUgb3IgdGhyZWUuXG4vL1xuLy8gV2h5IGl0IGlzIHNhZmU6IHdoYXQgbGVhdmVzIGhlcmUgaXMgcXVlc3Rpb24gU0hBUEUsIHdoaWNoIHRoZSBzdHVkZW50IGNhblxuLy8gYWxyZWFkeSBzZWUgKGhvdyBtYW55IGhhbmRsZXM7IHdoaWNoIGZhbWlseSdzIGN1cnZlIGZvbGxvd3MgdGhlaXIgZHJhZ3MpLFxuLy8gbmV2ZXIgdGhlIGNvb3JkaW5hdGVzLCB0b2xlcmFuY2VzLCBvciBjb2VmZmljaWVudHMgdGhhdCBtYWtlIGFuIGFuc3dlci4gVGhlXG4vLyBndWFyYW50ZWUgaXMgU1RSVUNUVVJBTCByYXRoZXIgdGhhbiBhIHByb21pc2UgYWJvdXQgdGhpcyBjb2RlOiBldmVyeSB2YWx1ZVxuLy8gcGFzc2VzIGEgd2hpdGVsaXN0IG9uIHRoZSB3YXkgb3V0IFx1MjAxNCBzbWFsbCBwb3NpdGl2ZSBpbnRlZ2Vycywgb3IgYSBmYW1pbHlcbi8vIG5hbWUgZnJvbSBhIGNsb3NlZCBzZXQgXHUyMDE0IHNvIGEgY29vcmRpbmF0ZSBjYW5ub3QgdHJhdmVsIHRoaXMgcGF0aCBldmVuIGlmIGFcbi8vIGZ1dHVyZSBlZGl0IHRyaWVkIHRvIHNlbmQgb25lLiBBbnl0aGluZyBmYWlsaW5nIHRoZSB3aGl0ZWxpc3QgaXMgZHJvcHBlZCxcbi8vIG5vdCBwYXNzZWQgdGhyb3VnaCAoZmFpbCBjbG9zZWQsIGxpa2UgdGhlIHVua25vd24tYmxvY2stdHlwZSB0aHJvdykuXG5cbi8qKiBVcHBlciBib3VuZCBvbiBhIGhhbmRsZSBjb3VudC4gRmFyIGFib3ZlIGFueSByZWFsIHF1ZXN0aW9uOyBleGlzdHMgc28gYVxuICogY29ycnVwdCBvciBob3N0aWxlIGxlbmd0aCBjYW4ndCBiZWNvbWUgYW4gYWJzdXJkIGFsbG9jYXRpb24gZG93bnN0cmVhbS4gKi9cbmNvbnN0IE1BWF9IQU5ETEVTID0gMjQ7XG5cbi8qKiBDdXJ2ZSBmYW1pbGllcyB0aGUgd2lkZ2V0IGxheXMgb3V0LiBDbG9zZWQgc2V0OiBhbiB1bnJlY29nbml6ZWQgZmFtaWx5IGlzXG4gKiBkcm9wcGVkIGFuZCB0aGUgd2lkZ2V0IGZhbGxzIGJhY2sgdG8gaXRzIG93biBkZWZhdWx0LiAqL1xuY29uc3QgS05PV05fRkFNSUxJRVM6IFJlYWRvbmx5U2V0PHN0cmluZz4gPSBuZXcgU2V0KFtcbiAgJ2xpbmVhcicsXG4gICdxdWFkcmF0aWMnLFxuICAnZXhwb25lbnRpYWwnLFxuICAnbG9nYXJpdGhtaWMnLFxuICAndmVydGljYWwnLFxuICAnYWJzb2x1dGUnLFxuICAnc3FydCcsXG4gICdjdWJpYycsXG5dKTtcblxuZXhwb3J0IGludGVyZmFjZSBRdWVzdGlvblNoYXBlIHtcbiAgaGFuZGxlQ291bnQ/OiBudW1iZXI7XG4gIGZhbWlseT86IHN0cmluZztcbiAgdmVydGV4Q291bnQ/OiBudW1iZXI7XG59XG5cbi8qKiBBIGNvdW50IHN1cnZpdmVzIG9ubHkgYXMgYSBzbWFsbCBwb3NpdGl2ZSBpbnRlZ2VyLiAqL1xuZnVuY3Rpb24gc2FmZUNvdW50KHZhbHVlOiB1bmtub3duKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiZcbiAgICBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSAmJlxuICAgIHZhbHVlID4gMCAmJlxuICAgIHZhbHVlIDw9IE1BWF9IQU5ETEVTXG4gICAgPyB2YWx1ZVxuICAgIDogdW5kZWZpbmVkO1xufVxuXG4vKiogQSBmYW1pbHkgc3Vydml2ZXMgb25seSBpZiBpdCBpcyBhIGtub3duIG5hbWUuICovXG5mdW5jdGlvbiBzYWZlRmFtaWx5KHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgS05PV05fRkFNSUxJRVMuaGFzKHZhbHVlKVxuICAgID8gdmFsdWVcbiAgICA6IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBEZXJpdmUgdGhlIHNlcnZlZCBxdWVzdGlvbiBzaGFwZSBmcm9tIGFuIFVOU0FOSVRJWkVEIGJsb2NrIChpdCByZWFkcyB0aGVcbiAqIGFuc3dlciBrZXksIHNvIGl0IG11c3QgcnVuIGJlZm9yZSB0aGUgc3RyaXBzKS4gUmV0dXJucyB1bmRlZmluZWQgd2hlbiB0aGVyZVxuICogaXMgbm90aGluZyB0byBzYXkgXHUyMDE0IGEgZGlzcGxheS1tb2RlIGdyYXBoIHRha2VzIG5vIGlucHV0IGFuZCBnZXRzIG5vIHNoYXBlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVyaXZlUXVlc3Rpb25TaGFwZShcbiAgYmxvY2s6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogUXVlc3Rpb25TaGFwZSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGludGVyYWN0aW9uID0gYmxvY2suaW50ZXJhY3Rpb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XG4gIGNvbnN0IGtpbmQgPSB0eXBlb2YgaW50ZXJhY3Rpb24/LnR5cGUgPT09ICdzdHJpbmcnID8gaW50ZXJhY3Rpb24udHlwZSA6IG51bGw7XG4gIGlmICgha2luZCB8fCBraW5kID09PSAnZGlzcGxheScpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgY29uc3Qgc2hhcGU6IFF1ZXN0aW9uU2hhcGUgPSB7fTtcblxuICAvLyBQb2ludC1zdHlsZSBpbnRlcmFjdGlvbnM6IG9uZSBoYW5kbGUgcGVyIGF1dGhvcmVkIHRhcmdldC4gVGhpcyBtaXJyb3JzXG4gIC8vIGV4YWN0bHkgd2hhdCB0aGUgZ3JhZGVkIHdpZGdldCBhbHJlYWR5IGRvZXMgd2l0aCB0aGUga2V5XG4gIC8vIChjb3VudCA9IGNvcnJlY3RQb2ludHMubGVuZ3RoKSwgc28gYSBzdHVkZW50IHNlZXMgdGhlIHNhbWUgd2lkZ2V0IGVpdGhlclxuICAvLyB3YXkgXHUyMDE0IHRoZSBudW1iZXIgb2YgaGFuZGxlcyBpcyBub3QgdGhlIHNlY3JldCwgdGhlaXIgcG9zaXRpb25zIGFyZS5cbiAgY29uc3QgcG9pbnRzID0gaW50ZXJhY3Rpb24/LmNvcnJlY3RQb2ludHM7XG4gIGlmIChBcnJheS5pc0FycmF5KHBvaW50cykpIHtcbiAgICBjb25zdCBjb3VudCA9IHNhZmVDb3VudChwb2ludHMubGVuZ3RoKTtcbiAgICBpZiAoY291bnQgIT09IHVuZGVmaW5lZCkgc2hhcGUuaGFuZGxlQ291bnQgPSBjb3VudDtcbiAgfVxuXG4gIC8vIEN1cnZlIGZhbWlsaWVzOiB0aGUgc2hhcGUgb2YgdGhlIGN1cnZlIHRoYXQgZm9sbG93cyB0aGUgc3R1ZGVudCdzIGRyYWdzLlxuICBjb25zdCBtb2RlbHMgPSBpbnRlcmFjdGlvbj8ubW9kZWxzO1xuICBpZiAoQXJyYXkuaXNBcnJheShtb2RlbHMpICYmIG1vZGVscy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZmFtaWx5ID0gc2FmZUZhbWlseShcbiAgICAgIChtb2RlbHNbMF0gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsKT8uZmFtaWx5LFxuICAgICk7XG4gICAgaWYgKGZhbWlseSAhPT0gdW5kZWZpbmVkKSBzaGFwZS5mYW1pbHkgPSBmYW1pbHk7XG4gIH1cblxuICAvLyBBbiBpbmVxdWFsaXR5J3MgYm91bmRhcnkgcmlkZXMgdGhlIHNhbWUgZmFtaWx5IG1hY2hpbmVyeS5cbiAgY29uc3QgaW5lcXVhbGl0aWVzID0gaW50ZXJhY3Rpb24/LmluZXF1YWxpdGllcztcbiAgaWYgKEFycmF5LmlzQXJyYXkoaW5lcXVhbGl0aWVzKSAmJiBpbmVxdWFsaXRpZXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGJvdW5kYXJ5ID0gKGluZXF1YWxpdGllc1swXSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGwpXG4gICAgICA/LmJvdW5kYXJ5IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGZhbWlseSA9IHNhZmVGYW1pbHkoYm91bmRhcnk/LmZhbWlseSk7XG4gICAgaWYgKGZhbWlseSAhPT0gdW5kZWZpbmVkKSBzaGFwZS5mYW1pbHkgPSBmYW1pbHk7XG4gIH1cblxuICAvLyBQb2x5Z29uIHZlcnRleCBjb3VudCBmb3Igc2hhZGVfcmVnaW9uLlxuICBjb25zdCByZWdpb25zID0gaW50ZXJhY3Rpb24/LnJlZ2lvbnM7XG4gIGlmIChBcnJheS5pc0FycmF5KHJlZ2lvbnMpICYmIHJlZ2lvbnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IHZlcnRpY2VzID0gKHJlZ2lvbnNbMF0gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsKVxuICAgICAgPy5jb3JyZWN0VmVydGljZXM7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmVydGljZXMpKSB7XG4gICAgICBjb25zdCBjb3VudCA9IHNhZmVDb3VudCh2ZXJ0aWNlcy5sZW5ndGgpO1xuICAgICAgaWYgKGNvdW50ICE9PSB1bmRlZmluZWQpIHNoYXBlLnZlcnRleENvdW50ID0gY291bnQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5rZXlzKHNoYXBlKS5sZW5ndGggPiAwID8gc2hhcGUgOiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplQmxvY2tNdXQoYmxvY2s6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZCB7XG4gIGNvbnN0IHR5cGUgPSBibG9jay50eXBlO1xuICBjb25zdCBlbnRyeSA9XG4gICAgdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnICYmIHR5cGUgaW4gYmxvY2tSZWdpc3RyeVxuICAgICAgPyBibG9ja1JlZ2lzdHJ5W3R5cGUgYXMga2V5b2YgdHlwZW9mIGJsb2NrUmVnaXN0cnldXG4gICAgICA6IHVuZGVmaW5lZDtcbiAgaWYgKCFlbnRyeSkge1xuICAgIC8vIEEgdmFsaWRhdGVkIEFjdGl2aXR5RG9jdW1lbnQgY2FuJ3QgZ2V0IGhlcmUgKHRoZSByZWdpc3RyeSBjb3ZlcmFnZSBndWFyZFxuICAgIC8vIHByb3ZlcyBleGFjdCBhZ3JlZW1lbnQgd2l0aCB0aGUgQmxvY2sgdW5pb24pIFx1MjAxNCBidXQgdGhlIHNhbml0aXplciBzaXRzIG9uXG4gICAgLy8gdGhlIHdpcmUgYm91bmRhcnksIHNvIGFuIHVua25vd24gdHlwZSBmYWlscyBDTE9TRUQsIG5ldmVyIHBhc3NlcyB0aHJvdWdoLlxuICAgIHRocm93IG5ldyBFcnJvcihgc2FuaXRpemU6IHVua25vd24gYmxvY2sgdHlwZSAke1N0cmluZyh0eXBlKX1gKTtcbiAgfVxuXG4gIC8vIERlcml2ZWQgc2hhcGUgaXMgY29tcHV0ZWQgQkVGT1JFIHRoZSBzdHJpcHMgKGl0IHJlYWRzIHRoZSBhbnN3ZXIga2V5KSBhbmRcbiAgLy8gYXR0YWNoZWQgYWZ0ZXIsIHNvIHRoZSBzZXJ2ZWQgYmxvY2sgY2FycmllcyBvbmx5IHRoZSB3aGl0ZWxpc3RlZCByZXN1bHQuXG4gIGNvbnN0IHNoYXBlID0gZW50cnkuc2FuaXRpemUuZGVyaXZlUXVlc3Rpb25TaGFwZVxuICAgID8gZGVyaXZlUXVlc3Rpb25TaGFwZShibG9jaylcbiAgICA6IHVuZGVmaW5lZDtcblxuICBmb3IgKGNvbnN0IHBhdGggb2YgZW50cnkuc2FuaXRpemUuc3RyaXApIGFwcGx5U3RyaXBQYXRoKGJsb2NrLCBwYXRoKTtcblxuICBpZiAoc2hhcGUpIGJsb2NrLnF1ZXN0aW9uU2hhcGUgPSBzaGFwZTtcblxuICBmb3IgKGNvbnN0IGZpZWxkIG9mIGVudHJ5LnNhbml0aXplLmNoaWxkQmxvY2tzID8/IFtdKSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBibG9ja1tmaWVsZF07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChjaGlsZCAhPT0gbnVsbCAmJiB0eXBlb2YgY2hpbGQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgc2FuaXRpemVCbG9ja011dChjaGlsZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdHJpcEluQmFuZFNlY3JldHMoYmxvY2spO1xufVxuXG4vKipcbiAqIFNhbml0aXplIGEgbG9vc2UgSU5MSU5FLUNPTlRFTlQgYXJyYXkgcHVsbGVkIG91dCBvZiB0aGUgcmF3IGRvY3VtZW50IChwdXJlKS5cbiAqXG4gKiBTNCdzIGdyYWRpbmcgUlBDIGlzIGEgc2Vjb25kIHNlcnZlclx1MjE5MmNsaWVudCBjaGFubmVsOiBpdCByZXR1cm5zIGF1dGhvcmVkXG4gKiBgZmVlZGJhY2tgIGFuZCBgc29sdXRpb25gIGNvbnRlbnQgdGhhdCB0aGUgcmVhZCBBUEkgZGVsaWJlcmF0ZWx5IHN0cmlwcGVkIGFuZFxuICogdGhlIHNlcnZlciByZWxlYXNlcyBvbmx5IGFmdGVyIGEgY2hlY2suIFRob3NlIGFyZSBgSW5saW5lTm9kZVtdYCwgYW5kIGFuXG4gKiBpbmxpbmUgYXJyYXkgY2FuIGNhcnJ5IGluLWJhbmQgc2VjcmV0cyBcdTIwMTQgYSBwcm9tcHRlZCBgbWF0aF9pbmxpbmVgIHNpdHRpbmdcbiAqIGluc2lkZSBhIHNvbHV0aW9uIHBhcmFncmFwaCwgb3IgYSBwYXN0ZWQgYmxhbmsgdG9rZW4gXHUyMDE0IHNvIGl0IG11c3QgZ28gdGhyb3VnaFxuICogdGhlIFNBTUUgdW5jb25kaXRpb25hbCBkZWVwIHdhbGsgdGhlIHNlcnZlZCBkb2N1bWVudCBkb2VzLiBXaXRob3V0IHRoaXMsIGFuXG4gKiBhdXRob3JlZCBzb2x1dGlvbiBjb250YWluaW5nIGEgYmxhbmsgd291bGQgaGFuZCBldmVyeSBjaGVja2luZyBzdHVkZW50IHRoYXRcbiAqIGJsYW5rJ3MgYW5zd2Vycywgc2lsZW50bHkuXG4gKlxuICogUmV1c2luZyBgc3RyaXBJbkJhbmRTZWNyZXRzYCByYXRoZXIgdGhhbiByZWltcGxlbWVudGluZyBpdCBpcyB0aGUgcG9pbnQ6IHRoZVxuICogc2VjcmV0LWZpZWxkIGxpc3RzIGxpdmUgaW4gdGhlIHJlZ2lzdHJ5LCBhbmQgYSBmdXR1cmUgYWRkaXRpb24gdG8gdGhlbSBoYXMgdG9cbiAqIHByb3RlY3QgYm90aCBjaGFubmVscyBhdXRvbWF0aWNhbGx5IG9yIGl0IHByb3RlY3RzIG5laXRoZXIuXG4gKlxuICogUmV0dXJucyBhIGNsb25lOyB0aGUgY2FsbGVyJ3MgYXJyYXkgaXMgbmV2ZXIgbXV0YXRlZCAoaXQgYmVsb25ncyB0byB0aGVcbiAqIGNhY2hlZCByYXcgZG9jdW1lbnQpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVJbmxpbmVDb250ZW50PFQ+KG5vZGVzOiBUW10pOiBUW10ge1xuICBjb25zdCBjbG9uZSA9IHN0cnVjdHVyZWRDbG9uZShub2Rlcyk7XG4gIHN0cmlwSW5CYW5kU2VjcmV0cyhjbG9uZSk7XG4gIHJldHVybiBjbG9uZTtcbn1cblxuLyoqIFNhbml0aXplIE9ORSBibG9jayAocHVyZSkuIEV4cG9zZWQgZm9yIHRlc3RzIGFuZCBwZXItYmxvY2sgdG9vbGluZzsgdGhlXG4gKiBkb2N1bWVudC1sZXZlbCBlbnRyeSBwb2ludCBiZWxvdyBpcyB3aGF0IHRoZSByZWFkIEFQSSB1c2VzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplQmxvY2soYmxvY2s6IEJsb2NrKTogU2FuaXRpemVkQmxvY2sge1xuICBjb25zdCBjbG9uZSA9IHN0cnVjdHVyZWRDbG9uZShibG9jaykgYXMgdW5rbm93biBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgc2FuaXRpemVCbG9ja011dChjbG9uZSk7XG4gIHJldHVybiBjbG9uZSBhcyB1bmtub3duIGFzIFNhbml0aXplZEJsb2NrO1xufVxuXG4vKipcbiAqIFNhbml0aXplIGEgZnVsbCB1cGdyYWRlZCBkb2N1bWVudCAocHVyZSkuIEV2ZXJ5IGJvZHkgYmxvY2sgZ29lcyB0aHJvdWdoIGl0c1xuICogcmVnaXN0cnkgZW50cnk7IHRoZSBpbi1iYW5kIGRlZXAgd2FsayB0aGVuIGNvdmVycyB0aGUgcmVzdCBvZiB0aGUgZG9jdW1lbnRcbiAqIChyZWZlcmVuY2UgcGFuZWwsIG1ldGEpIGFzIGRlZmVuc2UgaW4gZGVwdGggXHUyMDE0IHRob3NlIHN1cmZhY2VzIGNhcnJ5IG5vXG4gKiBkZWNsYXJlZCBhbnN3ZXIga2V5cywgYnV0IGEgcHJvbXB0ZWQgbWF0aCBub2RlIG11c3Qgbm90IGxlYWsgZnJvbSBhbnl3aGVyZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplQWN0aXZpdHlEb2N1bWVudChcbiAgZG9jOiBBY3Rpdml0eURvY3VtZW50LFxuKTogU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCB7XG4gIGNvbnN0IGNsb25lID0gc3RydWN0dXJlZENsb25lKGRvYykgYXMgdW5rbm93biBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiAmIHtcbiAgICBzZWN0aW9uczogQXJyYXk8e1xuICAgICAgcm93czogQXJyYXk8eyBjb2x1bW5zOiBBcnJheTx7IGJsb2NrczogdW5rbm93bltdIH0+IH0+O1xuICAgIH0+O1xuICB9O1xuICBmb3IgKGNvbnN0IHNlY3Rpb24gb2YgY2xvbmUuc2VjdGlvbnMpIHtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiBzZWN0aW9uLnJvd3MpIHtcbiAgICAgIGZvciAoY29uc3QgY29sdW1uIG9mIHJvdy5jb2x1bW5zKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgY29sdW1uLmJsb2Nrcykge1xuICAgICAgICAgIGlmIChibG9jayAhPT0gbnVsbCAmJiB0eXBlb2YgYmxvY2sgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBzYW5pdGl6ZUJsb2NrTXV0KGJsb2NrIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gRXZlcnl0aGluZyBvdXRzaWRlIHRoZSBib2R5IGJsb2NrcyAobWV0YSwgcmVmZXJlbmNlUGFuZWwpIFx1MjAxNCBpbi1iYW5kXG4gIC8vIHNlY3JldHMgb25seTsgdGhlcmUgYXJlIG5vIGRlY2xhcmVkIHN0cmlwcyBvdXRzaWRlIGJsb2Nrcy5cbiAgc3RyaXBJbkJhbmRTZWNyZXRzKGNsb25lKTtcbiAgcmV0dXJuIGNsb25lIGFzIHVua25vd24gYXMgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudDtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2FuaXRpemUvc2h1ZmZsZS50cyBcdTIwMTQgc2VydmUtdGltZSBkZXRlcm1pbmlzdGljIHNodWZmbGVzIChTMiwgU2FuaXRpemVTcGVjKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSByZWdpc3RyeSdzIGBzZXJ2ZVNodWZmbGVkYCBtYXJrcyBhcnJheXMgd2hvc2UgQVVUSE9SRUQgT1JERVIgaXMgdGhlXG4vLyBhbnN3ZXIga2V5IChvcmRlcmluZy5pdGVtcykgXHUyMDE0IGEgc3RyaXAgY2FuJ3QgaGVscCB3aGVuIHRoZSBvcmRlciBpdHNlbGYgaXNcbi8vIHRoZSBzZWNyZXQsIHNvIHRoZSBzZXJ2ZXIgc2VydmVzIGEgcGVybXV0YXRpb24uIFJlcXVpcmVtZW50cyBmcm9tIHRoZSBzcGVjOlxuLy9cbi8vICAgLSBEZXRlcm1pbmlzdGljIHBlciAodmVyc2lvbiwgc3R1ZGVudCk6IHRoZSByZWFkIEFQSSBzZWVkcyB3aXRoXG4vLyAgICAgYCR7dmVyc2lvbl9pZH06JHt1c2VyX2lkfWAsIHNvIGEgcmVsb2FkIChvciBhbiBIVFRQLWNhY2hlIG1pc3MpIHNlcnZlc1xuLy8gICAgIHRoZSBTQU1FIG9yZGVyIFx1MjAxNCB0aGUgc3R1ZGVudCdzIHNjcmVlbiBuZXZlciByZXNodWZmbGVzIHVuZGVyIHRoZW0uXG4vLyAgIC0gQXBwbGllZCBhdCBTRVJWRSB0aW1lLCBhZnRlciB0aGUgcGVyLXZlcnNpb24gY2FjaGU6IHRoZSBjYWNoZWQgYXJ0aWZhY3Rcbi8vICAgICBpcyBzdHVkZW50LWluZGVwZW5kZW50ICh0aGF0J3Mgd2hhdCBtYWtlcyBpdCBjYWNoZWFibGUpOyB0aGlzIHRyYW5zZm9ybVxuLy8gICAgIGlzIGNoZWFwIGVub3VnaCB0byBydW4gcGVyIHJlcXVlc3QuXG4vLyAgIC0gUGVyLWJsb2NrIHN1Yi1zZWVkaW5nOiB0d28gb3JkZXJpbmcgYmxvY2tzIGluIG9uZSBhY3Rpdml0eSBnZXRcbi8vICAgICBpbmRlcGVuZGVudCBwZXJtdXRhdGlvbnMgKGJsb2NrIGlkICsgZmllbGQgam9pbiB0aGUgc2VlZCkuXG4vL1xuLy8gR3JhZGluZyBpcyBvcmRlci1pbmRlcGVuZGVudCAocmVzcG9uc2VzIHJlZmVyZW5jZSBpdGVtIGlkcywgYW5kIHRoZSBzZXJ2ZXJcbi8vIGdyYWRlcyBhZ2FpbnN0IHRoZSBhdXRob3JlZCBrZXkpLCBzbyB0aGUgcGVybXV0YXRpb24gaXMgcHJlc2VudGF0aW9uLW9ubHkgXHUyMDE0XG4vLyBidXQgaXRzIHN0YWJpbGl0eSBpcyBhIFVYIGNvbnRyYWN0LCBub3QgYSBuaWNldHkuXG4vL1xuLy8gVGhlIFBSTkcgaXMgYSBzZWVkZWQgeG9yc2hpZnQtc3R5bGUgZ2VuZXJhdG9yIChtdWxiZXJyeTMyKSBvdmVyIGFuIEZOVi0xYVxuLy8gc2VlZCBcdTIwMTQgZGV0ZXJtaW5pc3RpYyBhY3Jvc3MgSlMgcnVudGltZXMsIGRlcGVuZGVuY3ktZnJlZS4gTm90IGNyeXB0b2dyYXBoaWMsXG4vLyBkZWxpYmVyYXRlbHk6IHRoZSB0aHJlYXQgbW9kZWwgaXMgXCJkb24ndCBzZXJ2ZSB0aGUgYXV0aG9yZWQgb3JkZXIsXCIgbm90XG4vLyBcIm1ha2UgdGhlIHBlcm11dGF0aW9uIHVucHJlZGljdGFibGUgdG8gYSBkZXRlcm1pbmVkIHN0dWRlbnQgd2l0aCBhIGRlYnVnZ2VyXCJcbi8vICh0aGUgYW5zd2VyIGtleSBuZXZlciBsZWF2ZXMgdGhlIHNlcnZlciBlaXRoZXIgd2F5KS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IGJsb2NrUmVnaXN0cnkgfSBmcm9tICcuLi9yZWdpc3RyeS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgdHlwZSB7IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQgfSBmcm9tICcuL3Nhbml0aXplZC10eXBlcy5qcyc7XG5cbi8qKiBGTlYtMWEgMzItYml0IG92ZXIgYSBzdHJpbmcgXHUyMTkyIHVpbnQzMiBzZWVkLiAqL1xuZnVuY3Rpb24gc2VlZEZyb20odGV4dDogc3RyaW5nKTogbnVtYmVyIHtcbiAgbGV0IGhhc2ggPSAweDgxMWM5ZGM1O1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRleHQubGVuZ3RoOyBpKyspIHtcbiAgICBoYXNoIF49IHRleHQuY2hhckNvZGVBdChpKTtcbiAgICBoYXNoID0gTWF0aC5pbXVsKGhhc2gsIDB4MDEwMDAxOTMpO1xuICB9XG4gIHJldHVybiBoYXNoID4+PiAwO1xufVxuXG4vKiogbXVsYmVycnkzMiBcdTIwMTQgdGlueSBkZXRlcm1pbmlzdGljIFBSTkcsIHVuaWZvcm0gZW5vdWdoIGZvciBhIHNodWZmbGUuICovXG5mdW5jdGlvbiBtdWxiZXJyeTMyKHNlZWQ6IG51bWJlcik6ICgpID0+IG51bWJlciB7XG4gIGxldCBhID0gc2VlZCA+Pj4gMDtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBhID0gKGEgKyAweDZkMmI3OWY1KSA+Pj4gMDtcbiAgICBsZXQgdCA9IGE7XG4gICAgdCA9IE1hdGguaW11bCh0IF4gKHQgPj4+IDE1KSwgdCB8IDEpO1xuICAgIHQgXj0gdCArIE1hdGguaW11bCh0IF4gKHQgPj4+IDcpLCB0IHwgNjEpO1xuICAgIHJldHVybiAoKHQgXiAodCA+Pj4gMTQpKSA+Pj4gMCkgLyA0Mjk0OTY3Mjk2O1xuICB9O1xufVxuXG4vKipcbiAqIEZpc2hlclx1MjAxM1lhdGVzIHdpdGggYSBzZWVkZWQgUFJORyAocHVyZSBcdTIwMTQgcmV0dXJucyBhIG5ldyBhcnJheSkuXG4gKlxuICogTkVWRVIgUkVUVVJOUyBUSEUgSURFTlRJVFkgZm9yIDIrIGl0ZW1zOyBpdCByb3RhdGVzIGJ5IG9uZSBpZiB0aGUgZGVhbCBsYW5kc1xuICogdGhlcmUuIFRoaXMgaXMgbm90IHRpZGluZXNzIFx1MjAxNCBpdCBpcyB0aGUgd2hvbGUgcG9pbnQgb2Ygc2h1ZmZsaW5nIHRoZXNlXG4gKiBmaWVsZHMuIFRoZSBhcnJheXMgdGhhdCByZWFjaCBoZXJlIGFyZSB0aGUgb25lcyB3aG9zZSBBVVRIT1JFRCBPUkRFUiBJUyBUSEVcbiAqIEFOU1dFUiwgc28gYW4gaWRlbnRpdHkgZGVhbCBzZXJ2ZXMgdGhlIHN0dWRlbnQgYSBwcmUtc29sdmVkIHF1ZXN0aW9uLiBBIGZhaXJcbiAqIHNodWZmbGUgbGFuZHMgb24gaXQgMS9uISBvZiB0aGUgdGltZSwgd2hpY2ggc291bmRzIG5lZ2xpZ2libGUgdW50aWwgeW91XG4gKiBub3RpY2UgdGhhdCBvcmRlcmluZyBibG9ja3MgYXJlIGFsbG93ZWQgYXMgZmV3IGFzIHR3byBpdGVtcyBcdTIwMTQgb25lIGNsYXNzIGluXG4gKiB0d28sIGZvciB0aGF0IHF1ZXN0aW9uLiBUaGUgcmVuZGVyZXIgaGFzIGFsd2F5cyBndWFyYW50ZWVkIHRoaXNcbiAqIChyZW5kZXJlci9zcmMvYmxvY2tzL3NodWZmbGUudHMpIGFuZCB0aGUgdmlld2VyIG11c3Qgbm90IHJlZ3Jlc3MgaXQgYXRcbiAqIGN1dG92ZXIuXG4gKlxuICogUzQncyBncmFkaW5nIGtlZXBzIGl0cyBvd24gZGVmZW5zaXZlIGd1YXJkIGZvciB0aGUgc2VydmVkLW9yZGVyLWVxdWFscy1cbiAqIGF1dGhvcmVkLW9yZGVyIGNhc2UgKGdyYWRpbmcvY2hvaWNlcy50cykgYW5kIHNob3VsZCBrZWVwIGl0OiBpdCBhbHNvIGNvdmVyc1xuICogZG9jdW1lbnRzIHNlcnZlZCB1bnNodWZmbGVkLCB3aGljaCB0aGlzIGNhbm5vdCBzcGVhayBmb3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWVkZWRTaHVmZmxlPFQ+KGl0ZW1zOiByZWFkb25seSBUW10sIHNlZWRLZXk6IHN0cmluZyk6IFRbXSB7XG4gIGNvbnN0IG91dCA9IFsuLi5pdGVtc107XG4gIGNvbnN0IG5leHQgPSBtdWxiZXJyeTMyKHNlZWRGcm9tKHNlZWRLZXkpKTtcbiAgZm9yIChsZXQgaSA9IG91dC5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgY29uc3QgaiA9IE1hdGguZmxvb3IobmV4dCgpICogKGkgKyAxKSk7XG4gICAgY29uc3QgYSA9IG91dFtpXSE7XG4gICAgb3V0W2ldID0gb3V0W2pdITtcbiAgICBvdXRbal0gPSBhO1xuICB9XG4gIGlmIChvdXQubGVuZ3RoID4gMSAmJiBvdXQuZXZlcnkoKHZhbHVlLCBpKSA9PiB2YWx1ZSA9PT0gaXRlbXNbaV0pKSB7XG4gICAgb3V0LnB1c2gob3V0LnNoaWZ0KCkgYXMgVCk7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBcHBseSBldmVyeSByZWdpc3RyeS1kZWNsYXJlZCBgc2VydmVTaHVmZmxlZGAgcmVvcmRlciB0byBhIFNBTklUSVpFRFxuICogZG9jdW1lbnQgKHB1cmUgXHUyMDE0IHRoZSBpbnB1dCwgdHlwaWNhbGx5IHRoZSBzaGFyZWQgY2FjaGVkIGFydGlmYWN0LCBpcyBub3RcbiAqIG11dGF0ZWQpLiBgc2VlZEtleWAgaXMgdGhlIHBlci0odmVyc2lvbiwgc3R1ZGVudCkgaWRlbnRpdHk7IGVhY2ggc2h1ZmZsZWRcbiAqIGFycmF5IGlzIHN1Yi1zZWVkZWQgd2l0aCB0aGUgYmxvY2sgaWQgYW5kIGZpZWxkIG5hbWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVNlcnZlU2h1ZmZsZXMoXG4gIGRvYzogU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCxcbiAgc2VlZEtleTogc3RyaW5nLFxuKTogU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCB7XG4gIGNvbnN0IGNsb25lID0gc3RydWN0dXJlZENsb25lKGRvYykgYXMgdW5rbm93biBhcyB7XG4gICAgc2VjdGlvbnM6IEFycmF5PHtcbiAgICAgIHJvd3M6IEFycmF5PHsgY29sdW1uczogQXJyYXk8eyBibG9ja3M6IHVua25vd25bXSB9PiB9PjtcbiAgICB9PjtcbiAgfTtcblxuICBjb25zdCBzaHVmZmxlQmxvY2sgPSAoYmxvY2s6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZCA9PiB7XG4gICAgY29uc3QgdHlwZSA9IGJsb2NrLnR5cGU7XG4gICAgY29uc3QgZW50cnkgPVxuICAgICAgdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnICYmIHR5cGUgaW4gYmxvY2tSZWdpc3RyeVxuICAgICAgICA/IGJsb2NrUmVnaXN0cnlbdHlwZSBhcyBrZXlvZiB0eXBlb2YgYmxvY2tSZWdpc3RyeV1cbiAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgaWYgKCFlbnRyeSkgcmV0dXJuOyAvLyBzYW5pdGl6ZSBhbHJlYWR5IGZhaWxlZCBjbG9zZWQgb24gdW5rbm93biB0eXBlc1xuICAgIGZvciAoY29uc3QgZmllbGQgb2YgZW50cnkuc2FuaXRpemUuc2VydmVTaHVmZmxlZCA/PyBbXSkge1xuICAgICAgY29uc3QgYXJyID0gYmxvY2tbZmllbGRdO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgICBibG9ja1tmaWVsZF0gPSBzZWVkZWRTaHVmZmxlKFxuICAgICAgICAgIGFycixcbiAgICAgICAgICBgJHtzZWVkS2V5fToke1N0cmluZyhibG9jay5pZCA/PyAnJyl9OiR7ZmllbGR9YCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVjdXJzZSB3aGVyZSB0aGUgcmVnaXN0cnkgZGVjbGFyZXMgbmVzdGVkIGJsb2NrcywgbWlycm9yaW5nIHNhbml0aXplLlxuICAgIGZvciAoY29uc3QgZmllbGQgb2YgZW50cnkuc2FuaXRpemUuY2hpbGRCbG9ja3MgPz8gW10pIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gYmxvY2tbZmllbGRdO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgICBpZiAoY2hpbGQgIT09IG51bGwgJiYgdHlwZW9mIGNoaWxkID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgc2h1ZmZsZUJsb2NrKGNoaWxkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZm9yIChjb25zdCBzZWN0aW9uIG9mIGNsb25lLnNlY3Rpb25zKSB7XG4gICAgZm9yIChjb25zdCByb3cgb2Ygc2VjdGlvbi5yb3dzKSB7XG4gICAgICBmb3IgKGNvbnN0IGNvbHVtbiBvZiByb3cuY29sdW1ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGJsb2NrIG9mIGNvbHVtbi5ibG9ja3MpIHtcbiAgICAgICAgICBpZiAoYmxvY2sgIT09IG51bGwgJiYgdHlwZW9mIGJsb2NrID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgc2h1ZmZsZUJsb2NrKGJsb2NrIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNsb25lIGFzIHVua25vd24gYXMgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudDtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gY29udGFpbmVyL2Jsb2NrSW5kZXgudHMgXHUyMDE0IHNlcnZlZCBkb2N1bWVudCBcdTIxOTIgcGVyLXNlY3Rpb24gcmVzcG9uc2UgaWRzIChTMyBWNClcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc3RvcmUgaXMgZGVsaWJlcmF0ZWx5IGRvY3VtZW50LXNoYXBlLWFnbm9zdGljIChzdG9yZS50cyk6IGl0IGhvbGRzXG4vLyBpZC1rZXllZCByZXNwb25zZSBtYXBzIGFuZCBpcyBUT0xEIHdoaWNoIGlkcyBiZWxvbmcgdG8gYSBzZWN0aW9uIGF0IGNoZWNrXG4vLyB0aW1lLiBUaGlzIG1vZHVsZSBpcyB3aGF0IHRlbGxzIGl0IFx1MjAxNCBvbmUgd2FsayBvdmVyIHRoZSBTRVJWRUQgKHNhbml0aXplZClcbi8vIGRvY3VtZW50IHByb2R1Y2luZywgcGVyIHNlY3Rpb24sIHRoZSBpdGVtIGlkcyBpbiBlYWNoIHdpcmUgY2F0ZWdvcnkuXG4vL1xuLy8gVHdvIGRlc2lnbiBwb2ludHMgd29ydGgga2VlcGluZzpcbi8vXG4vLyAgMS4gSU4tQkFORCBJRFMgQ09NRSBGUk9NIEEgREVFUCBXQUxLLCBub3QgYSBwZXItdHlwZSBmaWVsZCBsaXN0LiBBIGJsYW5rXG4vLyAgICAgdG9rZW4gbGl2ZXMgaW4gZmlsbF9pbl9ibGFuay5jb250ZW50LCBidXQgYWxzbyBpbnNpZGUgYVxuLy8gICAgIGZhZGVkX3dvcmtlZF9leGFtcGxlJ3MgbmVzdGVkIHN0ZXBzOyBhIHByb21wdGVkIG1hdGhfaW5saW5lIG1heSBhcHBlYXIgaW5cbi8vICAgICBBTlkgY29udGVudCBhcnJheSAodGhlIHNjaGVtYSBhZG1pdHMgaXQsIHdoaWNoIGlzIGV4YWN0bHkgd2h5IHRoZSBTMlxuLy8gICAgIHNhbml0aXplciBzdHJpcHMgaW4tYmFuZCBzZWNyZXRzIHVuY29uZGl0aW9uYWxseSByYXRoZXIgdGhhbiBieVxuLy8gICAgIGRlY2xhcmF0aW9uKS4gTWlycm9yaW5nIHRoYXQgcG9zdHVyZSBoZXJlIG1lYW5zIGEgbmV3IGJsb2NrIHR5cGUgdGhhdFxuLy8gICAgIGVtYmVkcyBibGFua3MgaXMgd2lyZWQgaW50byBjaGVja2luZyB0aGUgZGF5IGl0IHJlbmRlcnMsIHdpdGggbm8gcmVnaXN0cnlcbi8vICAgICBlZGl0IFx1MjAxNCB0aGUgZmFpbHVyZSBtb2RlIHRoaXMgYXZvaWRzIGlzIGEgc3R1ZGVudCdzIGFuc3dlciBzaWxlbnRseSBuZXZlclxuLy8gICAgIHJlYWNoaW5nIHRoZSBncmFkZXIuXG4vL1xuLy8gIDIuIFVOU1VQUE9SVEVEIElTIFJFQ09SREVELCBORVZFUiBEUk9QUEVELiBXaXJlIHYyIChWOSkgZ2F2ZSB0aGUgZ3JhcGhcbi8vICAgICBmYW1pbHkgaXRzIGBncmFwaHNgIGNhdGVnb3J5LCBzbyBgdW5zdXBwb3J0ZWRgIGlzIGVtcHR5IHRvZGF5IFx1MjAxNCBidXQgdGhlXG4vLyAgICAgbWVjaGFuaXNtIHN0YXlzLiBJdCBpcyB0aGUgaG9uZXN0IGFuc3dlciB3aGVuZXZlciBhIGdyYWRhYmxlIGJsb2NrIGhhc1xuLy8gICAgIG5vIHdheSB0byByZWFjaCB0aGUgZ3JhZGVyIChhIGZ1dHVyZSBibG9jayB0eXBlIGFoZWFkIG9mIGl0cyB3aXJlXG4vLyAgICAgYnVtcCkuIEEgc2lsZW50IG9taXNzaW9uIHdvdWxkIHJlYWQgYXMgXCJhbGwgY2hlY2tlZFwiIHdoaWxlIGEgc3R1ZGVudCdzXG4vLyAgICAgd29yayB3ZW50IHVuZ3JhZGVkLCB3aGljaCBpcyB0aGUgZmFpbHVyZSB0aGlzIGV4aXN0cyB0byBwcmV2ZW50LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgZmFtaWx5T2YgfSBmcm9tICcuLi9yZWdpc3RyeS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgdHlwZSB7IEJsb2NrVHlwZSB9IGZyb20gJy4uL3JlZ2lzdHJ5L3R5cGVzLmpzJztcbmltcG9ydCB0eXBlIHtcbiAgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCxcbiAgU2FuaXRpemVkQmxvY2ssXG59IGZyb20gJy4uL3Nhbml0aXplL3Nhbml0aXplZC10eXBlcy5qcyc7XG5pbXBvcnQgdHlwZSB7IFNlY3Rpb25JdGVtSWRzIH0gZnJvbSAnLi4vc3RvcmUvc3RvcmUuanMnO1xuXG4vKiogQmxvY2sgdHlwZXMgd2hvc2UgcmVzcG9uc2VzIGhhdmUgbm8gd2lyZS12MSBjYXRlZ29yeSAoc2VlIGRlc2lnbiBwb2ludCAyKS4gKi9cbmNvbnN0IEdSQVBIX0ZBTUlMWTogUmVhZG9ubHlTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoW1xuICAnaW50ZXJhY3RpdmVfZ3JhcGgnLFxuICAnbnVtYmVyX2xpbmUnLFxuICAnZGF0YV9wbG90Jyxcbl0pO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlY3Rpb25JbmRleCB7XG4gIHNlY3Rpb25JZDogc3RyaW5nO1xuICAvKiogSWRzIHRvIHNlbmQgd2hlbiBjaGVja2luZyB0aGlzIHNlY3Rpb24uICovXG4gIGl0ZW1zOiBTZWN0aW9uSXRlbUlkcztcbiAgLyoqIEJsb2NrIGlkcyBwcmVzZW50IGluIHRoaXMgc2VjdGlvbiwgZG9jdW1lbnQgb3JkZXIgKGNvbnRhaW5lcnMgaW5jbHVkZWQpLiAqL1xuICBibG9ja0lkczogc3RyaW5nW107XG4gIC8qKiBHcmFkYWJsZSBibG9jayBpZHMgdGhpcyB3aXJlIHZlcnNpb24gY2Fubm90IGNhcnJ5IFx1MjAxNCBzdXJmYWNlZCwgbm90IGhpZGRlbi4gKi9cbiAgdW5zdXBwb3J0ZWQ6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERvY3VtZW50SW5kZXgge1xuICBzZWN0aW9uczogU2VjdGlvbkluZGV4W107XG4gIGJ5U2VjdGlvbjogUmVjb3JkPHN0cmluZywgU2VjdGlvbkluZGV4PjtcbiAgLyoqIEV2ZXJ5IGdyYWRhYmxlLWJ1dC11bmNhcnJ5YWJsZSBibG9jayBpZCBhY3Jvc3MgdGhlIGRvY3VtZW50LiAqL1xuICB1bnN1cHBvcnRlZDogc3RyaW5nW107XG59XG5cbi8qKiBEZWVwLXdhbGsgYW55IHZhbHVlIGZvciBpbi1iYW5kIHJlc3BvbnNlIGlkczogYmxhbmsgdG9rZW5zIGFuZCBtYXRoLWdhcFxuICogcHJvbXB0cywgd2hlcmV2ZXIgdGhleSBzaXQuIERvZXMgTk9UIGRlc2NlbmQgaW50byBuZXN0ZWQgQmxvY2sgYXJyYXlzIFx1MjAxNFxuICogY2hpbGQgYmxvY2tzIGFyZSB2aXNpdGVkIGJ5IHRoZSBjYWxsZXIgc28gdGhlaXIgb3duIGlkcyBhdHRyaWJ1dGUgdG8gdGhlbS4gKi9cbmZ1bmN0aW9uIGNvbGxlY3RJbkJhbmRJZHMoXG4gIHZhbHVlOiB1bmtub3duLFxuICBvdXQ6IHN0cmluZ1tdLFxuICBpc0NoaWxkQmxvY2tBcnJheTogKHZhbHVlOiB1bmtub3duKSA9PiBib29sZWFuLFxuKTogdm9pZCB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIGlmIChpc0NoaWxkQmxvY2tBcnJheSh2YWx1ZSkpIHJldHVybjtcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdmFsdWUpIGNvbGxlY3RJbkJhbmRJZHMoaXRlbSwgb3V0LCBpc0NoaWxkQmxvY2tBcnJheSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnIHx8IHZhbHVlID09PSBudWxsKSByZXR1cm47XG5cbiAgY29uc3Qgbm9kZSA9IHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBpZiAobm9kZS50eXBlID09PSAnYmxhbmsnICYmIHR5cGVvZiBub2RlLmlkID09PSAnc3RyaW5nJykge1xuICAgIG91dC5wdXNoKG5vZGUuaWQpO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBBIE1hdGhQcm9tcHQgY2FycmllcjogYGxhdGV4YCArIGBwcm9tcHRzYC4gTWF0Y2hlZCBTVFJVQ1RVUkFMTFkgcmF0aGVyXG4gIC8vIHRoYW4gYnkgbm9kZSB0eXBlIGJlY2F1c2UgdGhlIHNhbWUgY2FycmllciBzaGFwZSBpcyBib3RoIGFuIGlubGluZVxuICAvLyBtYXRoX2lubGluZSBub2RlIGFuZCBhIHRvcC1sZXZlbCBtYXRoX2Jsb2NrIFx1MjAxNCBhbmQgdGhlIHNjaGVtYSBhZG1pdHMgaXQgaW5cbiAgLy8gZWl0aGVyIHBvc2l0aW9uICh0aGUgcmVhc29uIHRoZSBTMiBzYW5pdGl6ZXIgd2Fsa3MgdW5jb25kaXRpb25hbGx5IHRvbykuXG4gIGlmICh0eXBlb2Ygbm9kZS5sYXRleCA9PT0gJ3N0cmluZycgJiYgQXJyYXkuaXNBcnJheShub2RlLnByb21wdHMpKSB7XG4gICAgZm9yIChjb25zdCBwcm9tcHQgb2Ygbm9kZS5wcm9tcHRzKSB7XG4gICAgICBjb25zdCBpZCA9IChwcm9tcHQgYXMgeyBpZD86IHVua25vd24gfSB8IG51bGwpPy5pZDtcbiAgICAgIGlmICh0eXBlb2YgaWQgPT09ICdzdHJpbmcnKSBvdXQucHVzaChpZCk7XG4gICAgfVxuICAgIC8vIEtlZXAgd2Fsa2luZyBzaWJsaW5nczogYSBtYXRoX2Jsb2NrIGFsc28gY2FycmllcyBjb250ZW50IGZpZWxkcy5cbiAgfVxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIE9iamVjdC52YWx1ZXMobm9kZSkpIHtcbiAgICBjb2xsZWN0SW5CYW5kSWRzKGNoaWxkLCBvdXQsIGlzQ2hpbGRCbG9ja0FycmF5KTtcbiAgfVxufVxuXG4vKiogQSB2YWx1ZSBpcyBhIGNoaWxkLWJsb2NrIGFycmF5IGlmIGl0IGxvb2tzIGxpa2UgQmxvY2tbXSAob2JqZWN0cyBjYXJyeWluZyBhXG4gKiBgdHlwZWAgdGhlIHJlZ2lzdHJ5IGtub3dzIEFORCBhbiBgaWRgKS4gU3RydWN0dXJhbCByYXRoZXIgdGhhblxuICogcmVnaXN0cnktZGVjbGFyZWQgc28gYSBjb250YWluZXIgdGhhdCBmb3JnZXRzIGl0cyBjaGlsZEJsb2NrcyBkZWNsYXJhdGlvblxuICogc3RpbGwgY2FuJ3QgZ2V0IGl0cyBjaGlsZHJlbidzIGlkcyBtaXMtYXR0cmlidXRlZC5cbiAqXG4gKiBFeHBvcnRlZCBiZWNhdXNlIHRoZSBhbnN3ZXIta2V5IGV4dHJhY3Rpb24gd2Fsa3MgdGhlIEFVVEhPUkVEIGRvY3VtZW50IHdpdGhcbiAqIHRoZSBzYW1lIHF1ZXN0aW9uIHRvIGFuc3dlciAoXCJpcyB0aGlzIGEgbmVzdGVkIGJsb2NrLCBvciBjb250ZW50IG9mIHRoaXNcbiAqIG9uZT9cIikuIFR3byBjb3BpZXMgb2YgYSBzdWJ0bGUgaGV1cmlzdGljIGRyaWZ0OyB0aGlzIG9uZSBpcyB0aGUgc291cmNlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvb2tzTGlrZUJsb2NrQXJyYXkodmFsdWU6IHVua25vd24pOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBBcnJheS5pc0FycmF5KHZhbHVlKSAmJlxuICAgIHZhbHVlLmxlbmd0aCA+IDAgJiZcbiAgICB2YWx1ZS5ldmVyeShcbiAgICAgIChpdGVtKSA9PlxuICAgICAgICB0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgaXRlbSAhPT0gbnVsbCAmJlxuICAgICAgICB0eXBlb2YgKGl0ZW0gYXMgeyBpZD86IHVua25vd24gfSkuaWQgPT09ICdzdHJpbmcnICYmXG4gICAgICAgIHR5cGVvZiAoaXRlbSBhcyB7IHR5cGU/OiB1bmtub3duIH0pLnR5cGUgPT09ICdzdHJpbmcnLFxuICAgICkgJiZcbiAgICAvLyBJbmxpbmUgbm9kZXMgY2FycnkgYHR5cGVgIGJ1dCBuZXZlciBgaWRgICsgYmxvY2staXNoIHNoYXBlIHRvZ2V0aGVyO1xuICAgIC8vIHJlcXVpcmUgYXQgbGVhc3Qgb25lIGtub3duIGNvbnRhaW5lci1pc2gga2V5IHRvIGF2b2lkIGZhbHNlIHBvc2l0aXZlcy5cbiAgICB2YWx1ZS5ldmVyeSgoaXRlbSkgPT4ge1xuICAgICAgY29uc3QgdCA9IChpdGVtIGFzIHsgdHlwZTogc3RyaW5nIH0pLnR5cGU7XG4gICAgICByZXR1cm4gdCAhPT0gJ3RleHQnICYmIHQgIT09ICdibGFuaycgJiYgdCAhPT0gJ21hdGhfaW5saW5lJyAmJiB0ICE9PSAnaGFyZF9icmVhayc7XG4gICAgfSlcbiAgKTtcbn1cblxuLyoqIE5lc3RlZCBibG9ja3MsIGZvdW5kIHN0cnVjdHVyYWxseSAoc2VlIGxvb2tzTGlrZUJsb2NrQXJyYXkpLiBHZW5lcmljIG92ZXIgdGhlXG4gKiBibG9jayBzaGFwZSBzbyB0aGUgc2VydmVkLWRvY3VtZW50IHdhbGsgaGVyZSBhbmQgdGhlIGF1dGhvcmVkLWRvY3VtZW50IHdhbGsgaW5cbiAqIHRoZSBhbnN3ZXIta2V5IGV4dHJhY3Rpb24gc2hhcmUgT05FIGRlZmluaXRpb24gb2YgXCJjaGlsZCBibG9ja1wiLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoaWxkQmxvY2tzT2Y8VCBleHRlbmRzIG9iamVjdD4oYmxvY2s6IFQpOiBUW10ge1xuICBjb25zdCBvdXQ6IFRbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHZhbHVlIG9mIE9iamVjdC52YWx1ZXMoYmxvY2sgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pKSB7XG4gICAgaWYgKGxvb2tzTGlrZUJsb2NrQXJyYXkodmFsdWUpKSBvdXQucHVzaCguLi4odmFsdWUgYXMgVFtdKSk7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gdmlzaXQoYmxvY2s6IFNhbml0aXplZEJsb2NrLCBpbmRleDogU2VjdGlvbkluZGV4KTogdm9pZCB7XG4gIGNvbnN0IHR5cGUgPSAoYmxvY2sgYXMgeyB0eXBlOiBzdHJpbmcgfSkudHlwZSBhcyBCbG9ja1R5cGU7XG4gIGNvbnN0IGlkID0gKGJsb2NrIGFzIHsgaWQ6IHN0cmluZyB9KS5pZDtcbiAgaW5kZXguYmxvY2tJZHMucHVzaChpZCk7XG5cbiAgLy8gSW4tYmFuZCBpZHMgKGJsYW5rcyArIG1hdGggZ2FwcykgYmVsb25nIHRvIFRISVMgYmxvY2ssIGF0IGFueSBkZXB0aFxuICAvLyBzaG9ydCBvZiBhIG5lc3RlZCBibG9jay5cbiAgY29uc3QgaW5CYW5kOiBzdHJpbmdbXSA9IFtdO1xuICBjb2xsZWN0SW5CYW5kSWRzKGJsb2NrLCBpbkJhbmQsIGxvb2tzTGlrZUJsb2NrQXJyYXkpO1xuICBpZiAoaW5CYW5kLmxlbmd0aCA+IDApIHtcbiAgICBpbmRleC5pdGVtcy5ibGFua3MgPSBbLi4uKGluZGV4Lml0ZW1zLmJsYW5rcyA/PyBbXSksIC4uLmluQmFuZF07XG4gIH1cblxuICAvLyBQZXItYmxvY2staWQgY2F0ZWdvcmllcy4gZmFtaWx5T2YgcmVzb2x2ZXMgZGlzcGxheS1tb2RlIGluc3RhbmNlcyB0b1xuICAvLyAnc3RhdGljJywgc28gYSBkaXNwbGF5IGdyYXBoIGNvbnRyaWJ1dGVzIG5vdGhpbmcgXHUyMDE0IGNvcnJlY3QsIGl0IHRha2VzIG5vXG4gIC8vIGlucHV0LlxuICBjb25zdCBmYW1pbHkgPSBmYW1pbHlPZihibG9jayBhcyBuZXZlcik7XG4gIGlmIChmYW1pbHkgIT09ICdzdGF0aWMnKSB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdtdWx0aXBsZV9jaG9pY2UnOlxuICAgICAgICBpbmRleC5pdGVtcy5jaG9pY2VzID0gWy4uLihpbmRleC5pdGVtcy5jaG9pY2VzID8/IFtdKSwgaWRdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ21hdGNoaW5nJzpcbiAgICAgICAgaW5kZXguaXRlbXMubWF0Y2hlcyA9IFsuLi4oaW5kZXguaXRlbXMubWF0Y2hlcyA/PyBbXSksIGlkXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdvcmRlcmluZyc6XG4gICAgICAgIGluZGV4Lml0ZW1zLm9yZGVyaW5ncyA9IFsuLi4oaW5kZXguaXRlbXMub3JkZXJpbmdzID8/IFtdKSwgaWRdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NlbGZfZXhwbGFuYXRpb24nOlxuICAgICAgY2FzZSAnc2hvcnRfYW5zd2VyJzpcbiAgICAgIGNhc2UgJ2Vzc2F5JzpcbiAgICAgICAgaW5kZXguaXRlbXMuZnJlZVRleHQgPSBbLi4uKGluZGV4Lml0ZW1zLmZyZWVUZXh0ID8/IFtdKSwgaWRdO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIFdpcmUgdjIgY2FycmllcyBnZW9tZXRyaWMgd29yayBmb3IgdGhlIHdob2xlIGdyYXBoIGZhbWlseTsgdGhlXG4gICAgICAgIC8vIHNlcnZlciBkaXNwYXRjaGVzIG9uIHRoZSBzZXJ2ZWQgaW50ZXJhY3Rpb24gdHlwZS5cbiAgICAgICAgaWYgKEdSQVBIX0ZBTUlMWS5oYXModHlwZSkpIHtcbiAgICAgICAgICBpbmRleC5pdGVtcy5ncmFwaHMgPSBbLi4uKGluZGV4Lml0ZW1zLmdyYXBocyA/PyBbXSksIGlkXTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkQmxvY2tzT2YoYmxvY2spKSB2aXNpdChjaGlsZCwgaW5kZXgpO1xufVxuXG4vKiogSW5kZXggYSBzZXJ2ZWQgZG9jdW1lbnQ6IHBlci1zZWN0aW9uIGNoZWNrIHBheWxvYWQgaWRzICsgdGhlIHVuc3VwcG9ydGVkXG4gKiByb3N0ZXIuIFB1cmU7IHNhZmUgdG8gcmVjb21wdXRlIG9uIGV2ZXJ5IHJlbmRlciAodGhlIGRvY3VtZW50IGlzIGltbXV0YWJsZVxuICogcGVyIHZlcnNpb24pLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluZGV4RG9jdW1lbnQoZG9jOiBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50KTogRG9jdW1lbnRJbmRleCB7XG4gIGNvbnN0IHNlY3Rpb25zOiBTZWN0aW9uSW5kZXhbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHNlY3Rpb24gb2YgZG9jLnNlY3Rpb25zKSB7XG4gICAgY29uc3QgaW5kZXg6IFNlY3Rpb25JbmRleCA9IHtcbiAgICAgIHNlY3Rpb25JZDogc2VjdGlvbi5pZCxcbiAgICAgIGl0ZW1zOiB7fSxcbiAgICAgIGJsb2NrSWRzOiBbXSxcbiAgICAgIHVuc3VwcG9ydGVkOiBbXSxcbiAgICB9O1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHNlY3Rpb24ucm93cykge1xuICAgICAgZm9yIChjb25zdCBjb2x1bW4gb2Ygcm93LmNvbHVtbnMpIHtcbiAgICAgICAgZm9yIChjb25zdCBibG9jayBvZiBjb2x1bW4uYmxvY2tzKSB2aXNpdChibG9jaywgaW5kZXgpO1xuICAgICAgfVxuICAgIH1cbiAgICBzZWN0aW9ucy5wdXNoKGluZGV4KTtcbiAgfVxuICByZXR1cm4ge1xuICAgIHNlY3Rpb25zLFxuICAgIGJ5U2VjdGlvbjogT2JqZWN0LmZyb21FbnRyaWVzKHNlY3Rpb25zLm1hcCgocykgPT4gW3Muc2VjdGlvbklkLCBzXSkpLFxuICAgIHVuc3VwcG9ydGVkOiBzZWN0aW9ucy5mbGF0TWFwKChzKSA9PiBzLnVuc3VwcG9ydGVkKSxcbiAgfTtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gZ3JhZGluZy93YWxrLnRzIFx1MjAxNCByYXcgZG9jdW1lbnQgXHUyMTkyIHRoZSBncmFkYWJsZSBpbnZlbnRvcnkgb2Ygb25lIHNlY3Rpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc2VydmVyJ3MgY291bnRlcnBhcnQgdG8gdGhlIHZpZXdlcidzIGNvbnRhaW5lci9ibG9ja0luZGV4LnRzLiBTYW1lIHdhbGssXG4vLyBvcHBvc2l0ZSBzaWRlIG9mIHRoZSB3aXJlOiBibG9ja0luZGV4IHRlbGxzIHRoZSBDTElFTlQgd2hpY2ggaWRzIHRvIHNlbmQsXG4vLyB0aGlzIHRlbGxzIHRoZSBTRVJWRVIgd2hhdCBlYWNoIG9mIHRob3NlIGlkcyBpcyB3b3J0aC4gVGhleSBtdXN0IGFncmVlLCBhbmRcbi8vIHRoZSBnb2xkZW4gY29ycHVzIHBsdXMgdGhlIGNvbmZvcm1hbmNlIHN1aXRlIGFyZSB3aGF0IGhvbGQgdGhlbSB0b2dldGhlci5cbi8vXG4vLyBUd28gcHJvcGVydGllcyBpbmhlcml0ZWQgZGVsaWJlcmF0ZWx5IGZyb20gYmxvY2tJbmRleDpcbi8vXG4vLyAgMS4gSU4tQkFORCBJRFMgQ09NRSBGUk9NIEEgREVFUCBXQUxLLCBub3QgYSBwZXItdHlwZSBmaWVsZCBsaXN0LiBBIGJsYW5rXG4vLyAgICAgbGl2ZXMgaW4gZmlsbF9pbl9ibGFuay5jb250ZW50LCBidXQgYWxzbyBpbnNpZGUgYSBmYWRlZF93b3JrZWRfZXhhbXBsZSdzXG4vLyAgICAgbmVzdGVkIHN0ZXBzLCBhbmQgYSBwcm9tcHRlZCBtYXRoX2lubGluZSBtYXkgYXBwZWFyIGluIEFOWSBjb250ZW50IGFycmF5LlxuLy8gICAgIFdhbGtpbmcgdW5jb25kaXRpb25hbGx5IG1lYW5zIGEgbmV3IGJsb2NrIHR5cGUgdGhhdCBlbWJlZHMgYmxhbmtzIGlzXG4vLyAgICAgZ3JhZGFibGUgdGhlIGRheSBpdCByZW5kZXJzLCB3aXRoIG5vIHJlZ2lzdHJ5IGVkaXQuIFRoZSBmYWlsdXJlIHRoaXNcbi8vICAgICBhdm9pZHMgaXMgdGhlIHdvcnN0IGtpbmQ6IGEgc3R1ZGVudCBhbnN3ZXIgdGhhdCBpcyBzdWJtaXR0ZWQsIHN0b3JlZCwgYW5kXG4vLyAgICAgbmV2ZXIgc2NvcmVkLlxuLy9cbi8vICAyLiBDT05UQUlORVJTIEFUVFJJQlVURSBUTyBUSEUgQ0hJTEQuIEEgYmxhbmsgaW5zaWRlIGEgZmFkZWQgZXhhbXBsZSBiZWxvbmdzXG4vLyAgICAgdG8gdGhhdCBleGFtcGxlJ3Mgc3RlcCwgbm90IHRvIHRoZSBjb250YWluZXIsIHNvIGlkcyBsaW5lIHVwIHdpdGggd2hhdFxuLy8gICAgIHRoZSBjbGllbnQgc2VudC5cbi8vXG4vLyBUaGlzIHdhbGsgcmVhZHMgdGhlIFJBVyBkb2N1bWVudC4gVGhhdCBpcyB3aGF0IG1ha2VzIGBvcmRlcmluZ2AgZ3JhZGFibGUgYXRcbi8vIGFsbCAoaXRzIGF1dGhvcmVkIGl0ZW0gb3JkZXIgSVMgdGhlIGtleSkgYW5kIHdoYXQgZ2l2ZXMgdGhlIGdyYWRlciB0aGUgYW5zd2VyXG4vLyBrZXlzLCBoaW50cywgYW5kIHNvbHV0aW9ucyB0aGUgc2VydmVkIGRvY3VtZW50IGhhZCBzdHJpcHBlZC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB0eXBlIHsgQmxhbmtLZXkgfSBmcm9tICcuL2JsYW5rcy5qcyc7XG5pbXBvcnQgdHlwZSB7IFJhd0dyYXBoQmxvY2sgfSBmcm9tICcuL2dyYXBocy5qcyc7XG5cbi8qKiBMb29zZWx5LXR5cGVkIHJhdyBibG9jazogdGhlIHNlcnZlciBkaXNwYXRjaGVzIG9uIGB0eXBlYCBzdHJpbmdzIGFuZCByZWFkc1xuICogZmllbGRzIHRoZSBzYW5pdGl6ZWQgdHlwZXMgZGVsaWJlcmF0ZWx5IGRvbid0IGFkbWl0LiAqL1xuZXhwb3J0IHR5cGUgUmF3QmxvY2sgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiAmIHsgaWQ/OiBzdHJpbmc7IHR5cGU/OiBzdHJpbmcgfTtcblxuZXhwb3J0IGludGVyZmFjZSBHcmFkYWJsZUludmVudG9yeSB7XG4gIC8qKiBCbGFuayArIG1hdGgtZ2FwIGtleXMsIGluIGRvY3VtZW50IG9yZGVyLCBncm91cGVkIHBlciBvd25pbmcgYmxvY2sgc29cbiAgICogaW50ZXJjaGFuZ2VhYmxlIHJ1bnMgY2FuIGJlIHJlc29sdmVkIHdpdGhpbiB0aGVpciBibG9jay4gKi9cbiAgYmxhbmtHcm91cHNCeUJsb2NrOiBBcnJheTx7IGJsb2NrSWQ6IHN0cmluZzsga2V5czogQmxhbmtLZXlbXSB9PjtcbiAgbXVsdGlwbGVDaG9pY2U6IEFycmF5PHtcbiAgICBibG9ja0lkOiBzdHJpbmc7XG4gICAgY29ycmVjdElkczogc3RyaW5nW107XG4gICAgY2hvaWNlczogQXJyYXk8eyBpZDogc3RyaW5nOyBmZWVkYmFjaz86IHVua25vd25bXSB9PjtcbiAgfT47XG4gIG1hdGNoaW5nOiBBcnJheTx7XG4gICAgYmxvY2tJZDogc3RyaW5nO1xuICAgIGtleTogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgICBpdGVtSWRzOiBzdHJpbmdbXTtcbiAgfT47XG4gIG9yZGVyaW5nOiBBcnJheTx7IGJsb2NrSWQ6IHN0cmluZzsgYXV0aG9yZWRPcmRlcjogc3RyaW5nW10gfT47XG4gIGdyYXBoczogQXJyYXk8eyBibG9ja0lkOiBzdHJpbmc7IGJsb2NrOiBSYXdHcmFwaEJsb2NrIH0+O1xuICAvKiogRXZlcnkgZnJlZS10ZXh0IGJsb2NrIGluIHRoZSBzZWN0aW9uIFx1MjAxNCByZWNvcmRlZCwgbmV2ZXIganVkZ2VkLiAqL1xuICBmcmVlVGV4dDogc3RyaW5nW107XG4gIC8qKiBibG9ja0lkIFx1MjE5MiBhdXRob3JlZCBzb2x1dGlvbiBjb250ZW50LCBmb3IgRVZFUlkgYmxvY2sgaW4gdGhlIHNlY3Rpb24gdGhhdFxuICAgKiBoYXMgb25lLiBJbmNsdWRlcyBTVEFUSUMgYmxvY2tzIChhIGBwcm9ibGVtYCdzIHdvcmtlZCBleHBsYW5hdGlvbiksIHdoaWNoXG4gICAqIGlzIHRoZSB3aG9sZSByZWFzb24gdGhpcyBpcyBjb2xsZWN0ZWQgYnkgd2Fsa2luZyBibG9ja3MgcmF0aGVyIHRoYW4gYnlcbiAgICogd2Fsa2luZyB0aGUgYmxvY2tzIHRoYXQgcHJvZHVjZWQgcmVzcG9uc2VzLiAqL1xuICBzb2x1dGlvbnM6IEFycmF5PHsgYmxvY2tJZDogc3RyaW5nOyBzb2x1dGlvbjogdW5rbm93bltdIH0+O1xufVxuXG5jb25zdCBGUkVFX1RFWFRfVFlQRVMgPSBuZXcgU2V0KFsnc2VsZl9leHBsYW5hdGlvbicsICdzaG9ydF9hbnN3ZXInLCAnZXNzYXknXSk7XG5jb25zdCBHUkFQSF9UWVBFUyA9IG5ldyBTZXQoWydpbnRlcmFjdGl2ZV9ncmFwaCcsICdudW1iZXJfbGluZScsICdkYXRhX3Bsb3QnXSk7XG5cbi8qKiBQcm9qZWN0IGEgcmF3IEJsYW5rVG9rZW4gb250byB0aGUgZ3JhZGluZyBrZXkgc2hhcGUuICovXG5mdW5jdGlvbiBibGFua1Rva2VuVG9LZXkobm9kZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBCbGFua0tleSB7XG4gIGNvbnN0IGFuc3dlciA9IHR5cGVvZiBub2RlLmFuc3dlciA9PT0gJ3N0cmluZycgPyBub2RlLmFuc3dlciA6ICcnO1xuICBjb25zdCBhY2NlcHRhYmxlID0gQXJyYXkuaXNBcnJheShub2RlLmFjY2VwdGFibGVBbnN3ZXJzKVxuICAgID8gKG5vZGUuYWNjZXB0YWJsZUFuc3dlcnMgYXMgdW5rbm93bltdKS5maWx0ZXIoXG4gICAgICAgIChhKTogYSBpcyBzdHJpbmcgPT4gdHlwZW9mIGEgPT09ICdzdHJpbmcnLFxuICAgICAgKVxuICAgIDogW107XG4gIGNvbnN0IGFuc3dlclR5cGUgPSBub2RlLmFuc3dlclR5cGU7XG4gIHJldHVybiB7XG4gICAgaWQ6IFN0cmluZyhub2RlLmlkID8/ICcnKSxcbiAgICAvLyBgYW5zd2VyYCBmaXJzdCwgdGhlbiB0aGUgYWx0ZXJuYXRlcyBcdTIwMTQgb25lIGxpc3QsIG1hdGNoaW5nIGhvdyB0aGVcbiAgICAvLyByZW5kZXJlciBqb2lucyB0aGVtIGludG8gZGF0YS1ibGFuay1hbnN3ZXJzLlxuICAgIGFuc3dlcnM6IFthbnN3ZXIsIC4uLmFjY2VwdGFibGVdLFxuICAgIGFuc3dlclR5cGU6XG4gICAgICBhbnN3ZXJUeXBlID09PSAnbnVtZXJpYycgfHwgYW5zd2VyVHlwZSA9PT0gJ21hdGgnID8gYW5zd2VyVHlwZSA6ICd0ZXh0JyxcbiAgICB0b2xlcmFuY2U6IHR5cGVvZiBub2RlLnRvbGVyYW5jZSA9PT0gJ251bWJlcicgPyBub2RlLnRvbGVyYW5jZSA6IDAsXG4gICAgZXF1aXZhbGVuY2U6IG5vZGUuZXF1aXZhbGVuY2UgPT09ICdleGFjdC1mb3JtJyA/ICdleGFjdC1mb3JtJyA6ICd2YWx1ZScsXG4gICAgbWlzdGFrZUZlZWRiYWNrOiBBcnJheS5pc0FycmF5KG5vZGUubWlzdGFrZUZlZWRiYWNrKVxuICAgICAgPyAobm9kZS5taXN0YWtlRmVlZGJhY2sgYXMgQXJyYXk8eyBtYXRjaDogc3RyaW5nOyBmZWVkYmFjazogdW5rbm93bltdIH0+KVxuICAgICAgOiBbXSxcbiAgICBoaW50OiBBcnJheS5pc0FycmF5KG5vZGUuaGludCkgPyAobm9kZS5oaW50IGFzIHVua25vd25bXSkgOiB1bmRlZmluZWQsXG4gICAgaW50ZXJjaGFuZ2VhYmxlV2l0aFByZXZpb3VzOiBub2RlLmludGVyY2hhbmdlYWJsZVdpdGhQcmV2aW91cyA9PT0gdHJ1ZSxcbiAgfTtcbn1cblxuLyoqIFByb2plY3QgYSByYXcgTWF0aFByb21wdCBvbnRvIHRoZSBzYW1lIHNoYXBlLiBBIGdhcCBpcyBBTFdBWVMgZ3JhZGVkIGFzIGFcbiAqIG1hdGggZXhwcmVzc2lvbiBhbmQgbmV2ZXIgY2FycmllcyBoaW50L21pc3Rha2VGZWVkYmFjayBcdTIwMTQgYW5kIGl0cyBpZCBpcyBub3QgYVxuICogdXVpZCwgYnV0IGl0IGtleXMgaW50byB0aGUgc2FtZSBgYmxhbmtzYCByZXNwb25zZSBtYXAuICovXG5mdW5jdGlvbiBtYXRoUHJvbXB0VG9LZXkobm9kZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBCbGFua0tleSB7XG4gIGNvbnN0IGFuc3dlciA9IHR5cGVvZiBub2RlLmFuc3dlciA9PT0gJ3N0cmluZycgPyBub2RlLmFuc3dlciA6ICcnO1xuICBjb25zdCBhY2NlcHRhYmxlID0gQXJyYXkuaXNBcnJheShub2RlLmFjY2VwdGFibGVBbnN3ZXJzKVxuICAgID8gKG5vZGUuYWNjZXB0YWJsZUFuc3dlcnMgYXMgdW5rbm93bltdKS5maWx0ZXIoXG4gICAgICAgIChhKTogYSBpcyBzdHJpbmcgPT4gdHlwZW9mIGEgPT09ICdzdHJpbmcnLFxuICAgICAgKVxuICAgIDogW107XG4gIHJldHVybiB7XG4gICAgaWQ6IFN0cmluZyhub2RlLmlkID8/ICcnKSxcbiAgICBhbnN3ZXJzOiBbYW5zd2VyLCAuLi5hY2NlcHRhYmxlXSxcbiAgICBhbnN3ZXJUeXBlOiAnbWF0aCcsXG4gICAgdG9sZXJhbmNlOiB0eXBlb2Ygbm9kZS50b2xlcmFuY2UgPT09ICdudW1iZXInID8gbm9kZS50b2xlcmFuY2UgOiAwLFxuICAgIGVxdWl2YWxlbmNlOiBub2RlLmVxdWl2YWxlbmNlID09PSAnZXhhY3QtZm9ybScgPyAnZXhhY3QtZm9ybScgOiAndmFsdWUnLFxuICAgIG1pc3Rha2VGZWVkYmFjazogW10sXG4gICAgaGludDogdW5kZWZpbmVkLFxuICAgIC8vIEEgZ2FwIG5ldmVyIGpvaW5zIGFuIGludGVyY2hhbmdlYWJsZSBydW46IHRoZSBmbGFnIGlzIGEgQmxhbmtUb2tlbiBmaWVsZC5cbiAgICBpbnRlcmNoYW5nZWFibGVXaXRoUHJldmlvdXM6IGZhbHNlLFxuICB9O1xufVxuXG5jb25zdCBQUk9NUFRfQ0FSUklFUl9UWVBFUyA9IG5ldyBTZXQoWydtYXRoX2lubGluZScsICdtYXRoX2Jsb2NrJ10pO1xuXG4vKiogQ29sbGVjdCBpbi1iYW5kIGtleXMgKGJsYW5rcyArIG1hdGggZ2FwcykgYmVsb25naW5nIHRvIFRISVMgYmxvY2ssIGF0IGFueVxuICogZGVwdGggc2hvcnQgb2YgYSBuZXN0ZWQgY2hpbGQgYmxvY2suICovXG5mdW5jdGlvbiBjb2xsZWN0SW5CYW5kS2V5cyhcbiAgdmFsdWU6IHVua25vd24sXG4gIG91dDogQmxhbmtLZXlbXSxcbiAgaXNDaGlsZEJsb2NrQXJyYXk6ICh2YWx1ZTogdW5rbm93bikgPT4gYm9vbGVhbixcbik6IHZvaWQge1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBpZiAoaXNDaGlsZEJsb2NrQXJyYXkodmFsdWUpKSByZXR1cm47XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHZhbHVlKSBjb2xsZWN0SW5CYW5kS2V5cyhpdGVtLCBvdXQsIGlzQ2hpbGRCbG9ja0FycmF5KTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHJldHVybjtcbiAgY29uc3Qgbm9kZSA9IHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIGlmIChub2RlLnR5cGUgPT09ICdibGFuaycgJiYgdHlwZW9mIG5vZGUuaWQgPT09ICdzdHJpbmcnKSB7XG4gICAgb3V0LnB1c2goYmxhbmtUb2tlblRvS2V5KG5vZGUpKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKFxuICAgIHR5cGVvZiBub2RlLnR5cGUgPT09ICdzdHJpbmcnICYmXG4gICAgUFJPTVBUX0NBUlJJRVJfVFlQRVMuaGFzKG5vZGUudHlwZSkgJiZcbiAgICBBcnJheS5pc0FycmF5KG5vZGUucHJvbXB0cylcbiAgKSB7XG4gICAgZm9yIChjb25zdCBwcm9tcHQgb2Ygbm9kZS5wcm9tcHRzKSB7XG4gICAgICBpZiAocHJvbXB0ICE9PSBudWxsICYmIHR5cGVvZiBwcm9tcHQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG91dC5wdXNoKG1hdGhQcm9tcHRUb0tleShwcm9tcHQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gS2VlcCB3YWxraW5nIHNpYmxpbmdzOiBhIG1hdGhfYmxvY2sgY2FycmllcyBjb250ZW50IGZpZWxkcyB0b28uXG4gIH1cbiAgZm9yIChjb25zdCBjaGlsZCBvZiBPYmplY3QudmFsdWVzKG5vZGUpKSB7XG4gICAgY29sbGVjdEluQmFuZEtleXMoY2hpbGQsIG91dCwgaXNDaGlsZEJsb2NrQXJyYXkpO1xuICB9XG59XG5cbi8qKiBTdHJ1Y3R1cmFsIGNoaWxkLWJsb2NrIGRldGVjdGlvbiwgbWlycm9yaW5nIGJsb2NrSW5kZXgnczogYW4gYXJyYXkgb2ZcbiAqIG9iamVjdHMgZWFjaCBjYXJyeWluZyBgaWRgICsgYSBub24taW5saW5lIGB0eXBlYC4gU3RydWN0dXJhbCByYXRoZXIgdGhhblxuICogcmVnaXN0cnktZGVjbGFyZWQgc28gYSBjb250YWluZXIgdGhhdCBmb3JnZXRzIGl0cyBkZWNsYXJhdGlvbiBzdGlsbCBjYW5ub3RcbiAqIGdldCBpdHMgY2hpbGRyZW4ncyBpZHMgbWlzLWF0dHJpYnV0ZWQgdG8gaXRzZWxmLiAqL1xuZnVuY3Rpb24gbG9va3NMaWtlQmxvY2tBcnJheSh2YWx1ZTogdW5rbm93bik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIEFycmF5LmlzQXJyYXkodmFsdWUpICYmXG4gICAgdmFsdWUubGVuZ3RoID4gMCAmJlxuICAgIHZhbHVlLmV2ZXJ5KFxuICAgICAgKGl0ZW0pID0+XG4gICAgICAgIHR5cGVvZiBpdGVtID09PSAnb2JqZWN0JyAmJlxuICAgICAgICBpdGVtICE9PSBudWxsICYmXG4gICAgICAgIHR5cGVvZiAoaXRlbSBhcyB7IGlkPzogdW5rbm93biB9KS5pZCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgdHlwZW9mIChpdGVtIGFzIHsgdHlwZT86IHVua25vd24gfSkudHlwZSA9PT0gJ3N0cmluZycsXG4gICAgKSAmJlxuICAgIHZhbHVlLmV2ZXJ5KChpdGVtKSA9PiB7XG4gICAgICBjb25zdCB0ID0gKGl0ZW0gYXMgeyB0eXBlOiBzdHJpbmcgfSkudHlwZTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHQgIT09ICd0ZXh0JyAmJiB0ICE9PSAnYmxhbmsnICYmIHQgIT09ICdtYXRoX2lubGluZScgJiYgdCAhPT0gJ2hhcmRfYnJlYWsnXG4gICAgICApO1xuICAgIH0pXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNoaWxkQmxvY2tzT2YoYmxvY2s6IFJhd0Jsb2NrKTogUmF3QmxvY2tbXSB7XG4gIGNvbnN0IG91dDogUmF3QmxvY2tbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHZhbHVlIG9mIE9iamVjdC52YWx1ZXMoYmxvY2spKSB7XG4gICAgaWYgKGxvb2tzTGlrZUJsb2NrQXJyYXkodmFsdWUpKSBvdXQucHVzaCguLi4odmFsdWUgYXMgUmF3QmxvY2tbXSkpO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIHZpc2l0KGJsb2NrOiBSYXdCbG9jaywgaW52OiBHcmFkYWJsZUludmVudG9yeSk6IHZvaWQge1xuICBjb25zdCBpZCA9IHR5cGVvZiBibG9jay5pZCA9PT0gJ3N0cmluZycgPyBibG9jay5pZCA6ICcnO1xuICBjb25zdCB0eXBlID0gdHlwZW9mIGJsb2NrLnR5cGUgPT09ICdzdHJpbmcnID8gYmxvY2sudHlwZSA6ICcnO1xuICBpZiAoIWlkKSByZXR1cm47XG5cbiAgLy8gU29sdXRpb25zIGFyZSBjb2xsZWN0ZWQgZm9yIEVWRVJZIGJsb2NrIHRoYXQgaGFzIG9uZSwgaW5jbHVkaW5nIHN0YXRpY3MuXG4gIC8vIEEgZ3JhZGVyIHRoYXQgd2Fsa2VkIG9ubHkgcmVzcG9uZGluZyBibG9ja3Mgd291bGQgbmV2ZXIgdW5sb2NrIGFcbiAgLy8gYHByb2JsZW1gJ3Mgd29ya2VkIHNvbHV0aW9uLCBhbmQgdG8gYSBzdHVkZW50IHRoYXQgcmVhZHMgYXMgYSBjb250ZW50IGJ1Z1xuICAvLyAodGhlIHNlY3Rpb24gc2F5cyBcImNoZWNrZWRcIiBidXQgb25lIGJveCBzdGF5cyBzaHV0KS5cbiAgaWYgKEFycmF5LmlzQXJyYXkoYmxvY2suc29sdXRpb24pICYmIGJsb2NrLnNvbHV0aW9uLmxlbmd0aCA+IDApIHtcbiAgICBpbnYuc29sdXRpb25zLnB1c2goeyBibG9ja0lkOiBpZCwgc29sdXRpb246IGJsb2NrLnNvbHV0aW9uIGFzIHVua25vd25bXSB9KTtcbiAgfVxuXG4gIGNvbnN0IGluQmFuZDogQmxhbmtLZXlbXSA9IFtdO1xuICBjb2xsZWN0SW5CYW5kS2V5cyhibG9jaywgaW5CYW5kLCBsb29rc0xpa2VCbG9ja0FycmF5KTtcbiAgaWYgKGluQmFuZC5sZW5ndGggPiAwKSB7XG4gICAgaW52LmJsYW5rR3JvdXBzQnlCbG9jay5wdXNoKHsgYmxvY2tJZDogaWQsIGtleXM6IGluQmFuZCB9KTtcbiAgfVxuXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ211bHRpcGxlX2Nob2ljZSc6IHtcbiAgICAgIGNvbnN0IGNob2ljZXMgPSBBcnJheS5pc0FycmF5KGJsb2NrLmNob2ljZXMpXG4gICAgICAgID8gKGJsb2NrLmNob2ljZXMgYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KVxuICAgICAgICA6IFtdO1xuICAgICAgaW52Lm11bHRpcGxlQ2hvaWNlLnB1c2goe1xuICAgICAgICBibG9ja0lkOiBpZCxcbiAgICAgICAgY29ycmVjdElkczogY2hvaWNlc1xuICAgICAgICAgIC5maWx0ZXIoKGMpID0+IGMuY29ycmVjdCA9PT0gdHJ1ZSlcbiAgICAgICAgICAubWFwKChjKSA9PiBTdHJpbmcoYy5pZCkpLFxuICAgICAgICBjaG9pY2VzOiBjaG9pY2VzLm1hcCgoYykgPT4gKHtcbiAgICAgICAgICBpZDogU3RyaW5nKGMuaWQpLFxuICAgICAgICAgIC4uLihBcnJheS5pc0FycmF5KGMuZmVlZGJhY2spXG4gICAgICAgICAgICA/IHsgZmVlZGJhY2s6IGMuZmVlZGJhY2sgYXMgdW5rbm93bltdIH1cbiAgICAgICAgICAgIDoge30pLFxuICAgICAgICB9KSksXG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjYXNlICdtYXRjaGluZyc6IHtcbiAgICAgIGNvbnN0IGl0ZW1zID0gQXJyYXkuaXNBcnJheShibG9jay5pdGVtcylcbiAgICAgICAgPyAoYmxvY2suaXRlbXMgYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KVxuICAgICAgICA6IFtdO1xuICAgICAgaW52Lm1hdGNoaW5nLnB1c2goe1xuICAgICAgICBibG9ja0lkOiBpZCxcbiAgICAgICAga2V5OiAoYmxvY2sua2V5IGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4pID8/IHt9LFxuICAgICAgICBpdGVtSWRzOiBpdGVtcy5tYXAoKGkpID0+IFN0cmluZyhpLmlkKSksXG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjYXNlICdvcmRlcmluZyc6IHtcbiAgICAgIGNvbnN0IGl0ZW1zID0gQXJyYXkuaXNBcnJheShibG9jay5pdGVtcylcbiAgICAgICAgPyAoYmxvY2suaXRlbXMgYXMgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KVxuICAgICAgICA6IFtdO1xuICAgICAgLy8gVGhlIGF1dGhvcmVkIG9yZGVyIElTIHRoZSBrZXkgXHUyMDE0IGF2YWlsYWJsZSBvbmx5IGJlY2F1c2UgdGhpcyB3YWxrcyB0aGVcbiAgICAgIC8vIHJhdyBkb2N1bWVudCByYXRoZXIgdGhhbiB0aGUgc2VydmVkIG9uZS5cbiAgICAgIGludi5vcmRlcmluZy5wdXNoKHsgYmxvY2tJZDogaWQsIGF1dGhvcmVkT3JkZXI6IGl0ZW1zLm1hcCgoaSkgPT4gU3RyaW5nKGkuaWQpKSB9KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBkZWZhdWx0OlxuICAgICAgaWYgKEZSRUVfVEVYVF9UWVBFUy5oYXModHlwZSkpIHtcbiAgICAgICAgaW52LmZyZWVUZXh0LnB1c2goaWQpO1xuICAgICAgfSBlbHNlIGlmIChHUkFQSF9UWVBFUy5oYXModHlwZSkpIHtcbiAgICAgICAgaW52LmdyYXBocy5wdXNoKHsgYmxvY2tJZDogaWQsIGJsb2NrOiBibG9jayBhcyB1bmtub3duIGFzIFJhd0dyYXBoQmxvY2sgfSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgfVxuXG4gIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRCbG9ja3NPZihibG9jaykpIHZpc2l0KGNoaWxkLCBpbnYpO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJhd1NlY3Rpb24ge1xuICBpZD86IHN0cmluZztcbiAgcm93cz86IEFycmF5PHsgY29sdW1ucz86IEFycmF5PHsgYmxvY2tzPzogUmF3QmxvY2tbXSB9PiB9Pjtcbn1cblxuLyoqIEZpbmQgYSBzZWN0aW9uIGJ5IGlkIGluIHRoZSByYXcgZG9jdW1lbnQuIFJldHVybnMgbnVsbCB3aGVuIGFic2VudCBcdTIwMTQgdGhlXG4gKiBoYW5kbGVyIHR1cm5zIHRoYXQgaW50byBhIDQwMCByYXRoZXIgdGhhbiBncmFkaW5nIG5vdGhpbmcgYW5kIHJlcG9ydGluZ1xuICogc3VjY2Vzcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kU2VjdGlvbihcbiAgZG9jOiB7IHNlY3Rpb25zPzogUmF3U2VjdGlvbltdIH0sXG4gIHNlY3Rpb25JZDogc3RyaW5nLFxuKTogUmF3U2VjdGlvbiB8IG51bGwge1xuICBmb3IgKGNvbnN0IHNlY3Rpb24gb2YgZG9jLnNlY3Rpb25zID8/IFtdKSB7XG4gICAgaWYgKHNlY3Rpb24uaWQgPT09IHNlY3Rpb25JZCkgcmV0dXJuIHNlY3Rpb247XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKiBCdWlsZCB0aGUgZ3JhZGFibGUgaW52ZW50b3J5IGZvciBvbmUgc2VjdGlvbiBvZiB0aGUgUkFXIGRvY3VtZW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVudG9yeVNlY3Rpb24oc2VjdGlvbjogUmF3U2VjdGlvbik6IEdyYWRhYmxlSW52ZW50b3J5IHtcbiAgY29uc3QgaW52OiBHcmFkYWJsZUludmVudG9yeSA9IHtcbiAgICBibGFua0dyb3Vwc0J5QmxvY2s6IFtdLFxuICAgIG11bHRpcGxlQ2hvaWNlOiBbXSxcbiAgICBtYXRjaGluZzogW10sXG4gICAgb3JkZXJpbmc6IFtdLFxuICAgIGdyYXBoczogW10sXG4gICAgZnJlZVRleHQ6IFtdLFxuICAgIHNvbHV0aW9uczogW10sXG4gIH07XG4gIGZvciAoY29uc3Qgcm93IG9mIHNlY3Rpb24ucm93cyA/PyBbXSkge1xuICAgIGZvciAoY29uc3QgY29sdW1uIG9mIHJvdy5jb2x1bW5zID8/IFtdKSB7XG4gICAgICBmb3IgKGNvbnN0IGJsb2NrIG9mIGNvbHVtbi5ibG9ja3MgPz8gW10pIHZpc2l0KGJsb2NrLCBpbnYpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaW52O1xufVxuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBjZW5zdXMvY2Vuc3VzLnRzIFx1MjAxNCBhIHB1Ymxpc2hlZCB2ZXJzaW9uJ3MgYmxvY2sgY2Vuc3VzICsgaXRlbSBhdHRyaWJ1dGlvbiAoUzcpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUDNBJ3MgXCJwdWJsaXNoLXRpbWUgcmVnaXN0cnkgY2Vuc3VzXCIsIGJ1aWx0IHRoZSB3YXkgUzIgbWFkZSBwb3NzaWJsZTogdGhlXG4vLyBjZW5zdXMgaXMgREVSSVZFRCBmcm9tIHRoZSBzdG9yZWQgdmVyc2lvbiBzbmFwc2hvdCwgbmV2ZXIgd3JpdHRlbiBieVxuLy8gcHVibGlzaC1hY3Rpdml0eS4gRXZlcnkgcHVibGlzaGVkIHZlcnNpb24ncyBkb2N1bWVudCBhbHJlYWR5IGxpdmVzIGluXG4vLyBhY3Rpdml0eV92ZXJzaW9ucy5jb250ZW50IGZvcmV2ZXIsIHNvIHRoZSB0YWxseSBjYW4gYmUgY29tcHV0ZWQgd2hlbmV2ZXIgdGhlXG4vLyBkb2N1bWVudCBpcyBuZXh0IHJlYWQgXHUyMDE0IGFuZCBgcHVibGlzaC1hY3Rpdml0eWAsIHdoaWNoIFM5IHJld3JpdGVzLCBpcyBuZXZlclxuLy8gdG91Y2hlZCAodGhpcyBpcyB3aGF0IGRpc3NvbHZlZCBmaW5kaW5nIFI2KGIpOiBub3RoaW5nIGdldHMgd3JpdHRlbiB0d2ljZSkuXG4vLyBTYW1lIHBvc3R1cmUgYXMgMDAyNSdzIGRlcml2ZWQgc3R1ZGVudCBkb3JtYW5jeTogZG9uJ3QgbWFyayB3aGF0IHlvdSBjYW5cbi8vIGRlcml2ZS5cbi8vXG4vLyBUd28gcHJvZHVjdHMsIGJvdGggcGVyIHZlcnNpb246XG4vL1xuLy8gICBjb3VudHMgXHUyMDE0IGNlbnN1c0tleSBcdTIxOTIgaG93IG1hbnkgYmxvY2sgaW5zdGFuY2VzIG9mIHRoYXQga2luZCB0aGUgdmVyc2lvblxuLy8gICAgIGNvbnRhaW5zLiBUaGUga2V5IGNvbWVzIGZyb20gdGhlIHJlZ2lzdHJ5J3MgY2Vuc3VzS2V5T2YoKSwgc28gYVxuLy8gICAgIHZhcmlhbnQtY2FycnlpbmcgYmxvY2sgdGFsbGllcyBwZXIgdmFyaWFudCAoYGRhdGFfcGxvdC5idWlsZF9oaXN0b2dyYW1gKVxuLy8gICAgIGFuZCBhIG5ldyBibG9jayB0eXBlIGlzIGNvdW50ZWQgdGhlIGRheSBpdCByZWdpc3RlcnMuXG4vL1xuLy8gICBpdGVtcyBcdTIwMTQgZXZlcnkgUkVTUE9OU0UgaWQgaW4gdGhlIHZlcnNpb24gbWFwcGVkIHRvIHRoZSBjZW5zdXMga2V5IG9mIHRoZVxuLy8gICAgIGJsb2NrIGl0IGJlbG9uZ3MgdG8uIFRoaXMgaXMgd2hhdCBsZXRzIGFuIGFnZ3JlZ2F0ZSBvdmVyIHNlY3Rpb25fY2hlY2tzXG4vLyAgICAgc2F5IFwiMyBvZiA0IHdyb25nIGFuc3dlcnMgd2VyZSBvbiBmaWxsX2luX2JsYW5rXCIgXHUyMDE0IHZlcmRpY3RzIGFyZSBrZXllZCBieVxuLy8gICAgIGl0ZW0gaWQgKGJsYW5rL2dhcCBpZHMgZm9yIHRoZSBibGFua3MgY2F0ZWdvcnksIGJsb2NrIGlkcyBlbHNld2hlcmUpLCBhbmRcbi8vICAgICBub3RoaW5nIGVsc2UgaW4gdGhlIGRhdGFiYXNlIGtub3dzIHdoYXQgYW4gaXRlbSBpZCBJUy5cbi8vXG4vLyBXSFkgVEhFIElURU0gTUFQIFJFVVNFUyBUSEUgR1JBRElORyBXQUxLIChydWxpbmcgUzctNSkuIFRoZSBzZXQgb2YgaWRzIHRoYXRcbi8vIGNhbiBhcHBlYXIgaW4gYSB2ZXJkaWN0IG1hcCBpcyBkZWNpZGVkIGJ5IE9ORSB0aGluZzogd2hhdCB0aGUgZ3JhZGVyIGFjY2VwdHNcbi8vIChpbnZlbnRvcnlTZWN0aW9uLCBzZXJ2ZXIvZ3JhZGluZy93YWxrLnRzKS4gQSBzZWNvbmQgZW51bWVyYXRpb24gd3JpdHRlbiBoZXJlXG4vLyB3b3VsZCBkcmlmdCBmcm9tIGl0IFx1MjAxNCBhbmQgZHJpZnRlZCBhdHRyaWJ1dGlvbiBpcyBzaWxlbnQsIGNvdW50aW5nIGEgc3R1ZGVudCdzXG4vLyBhbnN3ZXIgdW5kZXIgdGhlIHdyb25nIGJsb2NrIHR5cGUgb3IgZHJvcHBpbmcgaXQuIFNvIHRoaXMgbW9kdWxlIG93bnMgbm8gaWRcbi8vIHJ1bGVzIGF0IGFsbDogaXQgYXNrcyB0aGUgZ3JhZGVyJ3MgaW52ZW50b3J5IGZvciB0aGUgaWRzIGFuZCBvbmx5IHN1cHBsaWVzXG4vLyB0aGUgaWQgXHUyMTkyIGNlbnN1cy1rZXkgam9pbi4gdGVzdHMvY2Vuc3VzLnRlc3QudHMgcGlucyB0aGUgZXF1YWxpdHkuXG4vL1xuLy8gQlVORExFIE5PVEU6IHdhbGsudHMgaW1wb3J0cyBpdHMgdHdvIGNvbGxhYm9yYXRvcnMgYXMgYGltcG9ydCB0eXBlYCBvbmx5LCBzb1xuLy8gcHVsbGluZyBpdCBpbiBoZXJlIGNvc3RzIHRoZSByZWFkIGJ1bmRsZSBub3RoaW5nIGF0IHJ1bnRpbWUgXHUyMDE0IG5vIG1hdGhqcywgbm9cbi8vIHNjb3JlcnMgKHRoZSBncmFwaC1raXQvc2NvcmVycyBkaXNjaXBsaW5lLCBjaGVja2VkIGJ5IHRoZSBidW5kbGUncyBzaXplXG4vLyBjZWlsaW5nIGFuZCBhIGdyZXAtYWJzZW5jZSB0ZXN0KS5cbi8vXG4vLyAgIGRvY3VtZW50IFx1MjUwMFx1MjUwMFx1MjVCQSBlYWNoQmxvY2sgKHJvd3NcdTIxOTJjb2x1bW5zXHUyMTkyYmxvY2tzLCBjaGlsZCBibG9ja3MsIHJlZmVyZW5jZVBhbmVsKVxuLy8gICAgICAgICAgICAgICAgICAgXHUyNTAyXG4vLyAgICAgICAgICAgICAgICAgICBcdTI1MUNcdTI1MDBcdTI1QkEgY291bnRzOiAgdGFsbHkgb2YgY2Vuc3VzS2V5T2YoYmxvY2spXG4vLyAgICAgICAgICAgICAgICAgICBcdTI1MTRcdTI1MDBcdTI1QkEgaW5kZXg6ICAgYmxvY2tJZCBcdTIxOTIgY2Vuc3VzS2V5XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjVCMlxuLy8gICBzZWN0aW9ucyBcdTI1MDBcdTI1MDBcdTI1QkEgaW52ZW50b3J5U2VjdGlvbiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MTggIChibGFuay9nYXAgaWRzLCBNQy9tYXRjaGluZy9vcmRlcmluZy9cbi8vICAgICAgICAgICAgICAgICh0aGUgZ3JhZGVyJ3Mgb3duICAgICAgIGdyYXBoL2ZyZWUtdGV4dCBibG9jayBpZHMpXG4vLyAgICAgICAgICAgICAgICAgYWNjZXB0ZWQtaWQgc2V0KSAgIFx1MjUwMFx1MjUwMFx1MjVCQSBpdGVtc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHR5cGUgeyBBY3Rpdml0eURvY3VtZW50LCBCbG9jayB9IGZyb20gJ0BhY3Rpdml0eS9zY2hlbWEnO1xuaW1wb3J0IHsgY2hpbGRCbG9ja3NPZiB9IGZyb20gJy4uL2NvbnRhaW5lci9ibG9ja0luZGV4LmpzJztcbmltcG9ydCB7IGJsb2NrUmVnaXN0cnksIGNlbnN1c0tleU9mIH0gZnJvbSAnLi4vcmVnaXN0cnkvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgaW52ZW50b3J5U2VjdGlvbiB9IGZyb20gJy4uL3NlcnZlci9ncmFkaW5nL3dhbGsuanMnO1xuaW1wb3J0IHR5cGUgeyBSYXdTZWN0aW9uIH0gZnJvbSAnLi4vc2VydmVyL2dyYWRpbmcvd2Fsay5qcyc7XG5cbi8qKiBDZW5zdXMga2V5IGZvciBhIGJsb2NrIHdob3NlIHR5cGUgdGhlIHJlZ2lzdHJ5IGRvZXNuJ3Qga25vdy4gVW5yZWFjaGFibGUgZm9yXG4gKiBhIHNjaGVtYS12YWxpZCBkb2N1bWVudCAodGhlIHJlZ2lzdHJ5IGNvbXBsZXRlbmVzcyBndWFyZCBtYWtlcyBldmVyeSBibG9ja1xuICogdHlwZSByZWdpc3RlcmVkKSwgYW5kIGRlbGliZXJhdGVseSBhIFZJU0lCTEUgYnVja2V0IHJhdGhlciB0aGFuIGEgdGhyb3c6IHRoaXNcbiAqIHJ1bnMgb24gdGhlIHJlYWQgcGF0aCwgd2hlcmUgdGhlIHJ1bGVkIHdyaXRlIG9yZGVyaW5nIG1lYW5zIGEgdGhyb3duIGNlbnN1c1xuICogd291bGQgY29zdCB0aGUgdmVyc2lvbiBpdHMgY2FjaGUgcm93IG9uIGV2ZXJ5IHJlYWQuIEEgc3VyZmFjZWQgYF91bmtub3duYFxuICogcm93IGlzIGEgYnVnIHJlcG9ydDsgYSBjcmFzaCBoZXJlIHdvdWxkIGJlIGEgc2lsZW50IHBlcmZvcm1hbmNlIGNsaWZmLiAqL1xuZXhwb3J0IGNvbnN0IFVOS05PV05fQ0VOU1VTX0tFWSA9ICdfdW5rbm93bic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2Vuc3VzQ291bnQge1xuICBjZW5zdXNLZXk6IHN0cmluZztcbiAgYmxvY2tDb3VudDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENlbnN1c0l0ZW0ge1xuICAvKiogVGhlIGlkIGEgdmVyZGljdCBtYXAgaXMga2V5ZWQgYnk6IGEgYmxhbmsgaWQsIGFuIGluLWVxdWF0aW9uIGdhcCBpZFxuICAgKiAoYGdgK2hleCksIG9yIGEgZ3JhZGFibGUvcmVjb3JkZWQgYmxvY2sgaWQuICovXG4gIGl0ZW1JZDogc3RyaW5nO1xuICBjZW5zdXNLZXk6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBWZXJzaW9uQ2Vuc3VzIHtcbiAgLyoqIERvY3VtZW50IG9yZGVyIG9mIGZpcnN0IGFwcGVhcmFuY2UuICovXG4gIGNvdW50czogQ2Vuc3VzQ291bnRbXTtcbiAgaXRlbXM6IENlbnN1c0l0ZW1bXTtcbn1cblxuLyoqIFRoZSByZWdpc3RyeSdzIGtleSBydWxlLCBndWFyZGVkIG9uIGl0cyBvbmUgcHJlY29uZGl0aW9uIChhIHJlZ2lzdGVyZWRcbiAqIHR5cGUpLiBUaGUgcnVsZSBpdHNlbGYgaXMgTk9UIHJlc3RhdGVkIGhlcmUgXHUyMDE0IGNlbnN1c0tleU9mIHN0YXlzIHRoZSBzb3VyY2UsXG4gKiB2YXJpYW50IHN1ZmZpeCBpbmNsdWRlZC4gKi9cbmZ1bmN0aW9uIHNhZmVDZW5zdXNLZXkoYmxvY2s6IEJsb2NrKTogc3RyaW5nIHtcbiAgY29uc3QgdHlwZSA9IChibG9jayBhcyB7IHR5cGU/OiB1bmtub3duIH0pLnR5cGU7XG4gIGlmICh0eXBlb2YgdHlwZSAhPT0gJ3N0cmluZycgfHwgISh0eXBlIGluIGJsb2NrUmVnaXN0cnkpKSB7XG4gICAgcmV0dXJuIFVOS05PV05fQ0VOU1VTX0tFWTtcbiAgfVxuICByZXR1cm4gY2Vuc3VzS2V5T2YoYmxvY2spO1xufVxuXG4vKiogVmlzaXQgYSBibG9jayBhbmQsIGRlcHRoLWZpcnN0LCBldmVyeSBibG9jayBuZXN0ZWQgaW5zaWRlIGl0LiBDaGlsZCBibG9ja3NcbiAqIGFyZSBmb3VuZCBTVFJVQ1RVUkFMTFkgdmlhIGJsb2NrSW5kZXgncyBjaGlsZEJsb2Nrc09mIFx1MjAxNCB0aGUgZG9jdW1lbnRlZCBzaW5nbGVcbiAqIGRlZmluaXRpb24gb2YgXCJpcyB0aGlzIGEgbmVzdGVkIGJsb2NrIG9yIGNvbnRlbnQgb2YgdGhpcyBvbmU/XCIsIHNoYXJlZCB3aXRoXG4gKiB0aGUgc2VydmVkLWRvY3VtZW50IGluZGV4IGFuZCB0aGUgYW5zd2VyLWtleSBleHRyYWN0aW9uLiBBIGZhZGVkIGV4YW1wbGUnc1xuICogc3RlcHMgdGhlcmVmb3JlIGNvdW50IGFzIHRoZW1zZWx2ZXMsIGV4YWN0bHkgYXMgdGhleSBncmFkZSBhcyB0aGVtc2VsdmVzLiAqL1xuZnVuY3Rpb24gdmlzaXREZWVwKGJsb2NrOiBCbG9jaywgdmlzaXQ6IChibG9jazogQmxvY2spID0+IHZvaWQpOiB2b2lkIHtcbiAgdmlzaXQoYmxvY2spO1xuICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkQmxvY2tzT2YoYmxvY2sgYXMgdW5rbm93biBhcyBvYmplY3QpKSB7XG4gICAgdmlzaXREZWVwKGNoaWxkIGFzIHVua25vd24gYXMgQmxvY2ssIHZpc2l0KTtcbiAgfVxufVxuXG4vKiogRXZlcnkgYmxvY2sgaW5zdGFuY2UgaW4gdGhlIGRvY3VtZW50LCBpbiBkb2N1bWVudCBvcmRlcjogc2VjdGlvbiBjb250ZW50XG4gKiBmaXJzdCAocm93cyBcdTIxOTIgY29sdW1ucyBcdTIxOTIgYmxvY2tzKSwgdGhlbiB0aGUgcmVmZXJlbmNlIHBhbmVsLiBUaGUgcGFuZWwgaXNcbiAqIHNjYWZmb2xkIFx1MjAxNCBpdCBpcyBuZXZlciBjaGVja2VkLCBzbyBpdCBjb250cmlidXRlcyBjb3VudHMgYW5kIG5vIGl0ZW1zIFx1MjAxNCBidXRcbiAqIGl0IElTIGF1dGhvcmVkIGNvbnRlbnQgYSB0ZWFjaGVyIGNob3NlLCBzbyBsZWF2aW5nIGl0IG91dCB3b3VsZCB1bmRlcmNvdW50XG4gKiB3aGF0IHRoZSBhY3Rpdml0eSBhY3R1YWxseSB1c2VzLiAqL1xuZnVuY3Rpb24gZWFjaEJsb2NrKGRvYzogQWN0aXZpdHlEb2N1bWVudCwgdmlzaXQ6IChibG9jazogQmxvY2spID0+IHZvaWQpOiB2b2lkIHtcbiAgZm9yIChjb25zdCBzZWN0aW9uIG9mIGRvYy5zZWN0aW9ucyA/PyBbXSkge1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHNlY3Rpb24ucm93cyA/PyBbXSkge1xuICAgICAgZm9yIChjb25zdCBjb2x1bW4gb2Ygcm93LmNvbHVtbnMgPz8gW10pIHtcbiAgICAgICAgZm9yIChjb25zdCBibG9jayBvZiBjb2x1bW4uYmxvY2tzID8/IFtdKSB2aXNpdERlZXAoYmxvY2ssIHZpc2l0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBibG9jayBvZiBkb2MucmVmZXJlbmNlUGFuZWw/LmJsb2NrcyA/PyBbXSkgdmlzaXREZWVwKGJsb2NrLCB2aXNpdCk7XG59XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgY2Vuc3VzIG9mIGFuIFVQR1JBREVEIGRvY3VtZW50IChwb3N0LXVwZ3JhZGUsIHByZS1zYW5pdGl6ZSkuXG4gKlxuICogUHJlLXNhbml0aXplIG9uIHB1cnBvc2U6IGBvcmRlcmluZ2AncyBhdXRob3JlZCBpdGVtIG9yZGVyIGFuZCB0aGUgYmxhbmtcbiAqIGFuc3dlciBrZXlzIGFyZSBnb25lIGZyb20gdGhlIHNlcnZlZCBhcnRpZmFjdCwgYW5kIHRoZSBncmFkaW5nIGludmVudG9yeSB0aGlzXG4gKiBqb2lucyBhZ2FpbnN0IHJlYWRzIHRoZSBzYW1lIHJhdyBzaGFwZSB0aGUgZ3JhZGVyIGRvZXMuIE5vdGhpbmcgZGVyaXZlZCBoZXJlXG4gKiBpcyBzZWNyZXQgXHUyMDE0IGEgY291bnQgb2YgYmxvY2sga2luZHMgYW5kIGEgbGlzdCBvZiByZXNwb25zZSBpZHMgdGhlIGNsaWVudFxuICogYWxyZWFkeSBob2xkcyBcdTIwMTQgc28gdGhlIG91dHB1dCBjcm9zc2VzIG5vIHNhbml0aXplciBib3VuZGFyeS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNlbnN1c09mRG9jdW1lbnQoZG9jOiBBY3Rpdml0eURvY3VtZW50KTogVmVyc2lvbkNlbnN1cyB7XG4gIGNvbnN0IGNvdW50cyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG4gIGNvbnN0IGtleUJ5QmxvY2tJZCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cbiAgZWFjaEJsb2NrKGRvYywgKGJsb2NrKSA9PiB7XG4gICAgY29uc3Qga2V5ID0gc2FmZUNlbnN1c0tleShibG9jayk7XG4gICAgY291bnRzLnNldChrZXksIChjb3VudHMuZ2V0KGtleSkgPz8gMCkgKyAxKTtcbiAgICBjb25zdCBpZCA9IChibG9jayBhcyB7IGlkPzogdW5rbm93biB9KS5pZDtcbiAgICBpZiAodHlwZW9mIGlkID09PSAnc3RyaW5nJykga2V5QnlCbG9ja0lkLnNldChpZCwga2V5KTtcbiAgfSk7XG5cbiAgY29uc3QgaXRlbXM6IENlbnN1c0l0ZW1bXSA9IFtdO1xuICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IHB1c2ggPSAoaXRlbUlkOiBzdHJpbmcsIGJsb2NrSWQ6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgIGlmICghaXRlbUlkIHx8IHNlZW4uaGFzKGl0ZW1JZCkpIHJldHVybjtcbiAgICBzZWVuLmFkZChpdGVtSWQpO1xuICAgIGl0ZW1zLnB1c2goe1xuICAgICAgaXRlbUlkLFxuICAgICAgY2Vuc3VzS2V5OiBrZXlCeUJsb2NrSWQuZ2V0KGJsb2NrSWQpID8/IFVOS05PV05fQ0VOU1VTX0tFWSxcbiAgICB9KTtcbiAgfTtcblxuICBmb3IgKGNvbnN0IHNlY3Rpb24gb2YgZG9jLnNlY3Rpb25zID8/IFtdKSB7XG4gICAgY29uc3QgaW52ID0gaW52ZW50b3J5U2VjdGlvbihzZWN0aW9uIGFzIHVua25vd24gYXMgUmF3U2VjdGlvbik7XG4gICAgLy8gQmxhbmtzIGFuZCBtYXRoIGdhcHMgYXR0cmlidXRlIHRvIHRoZWlyIE9XTklORyBibG9jayAodGhlIHdhbGsgYWxyZWFkeVxuICAgIC8vIHJlc29sdmVzIGNvbnRhaW5lcnMgdG8gdGhlIGNoaWxkKSwgd2hpY2ggaXMgd2h5IGEgYmxhbmsgaW5zaWRlIGEgZmFkZWRcbiAgICAvLyBleGFtcGxlIGNvdW50cyBhcyBmYWRlZF93b3JrZWRfZXhhbXBsZSBhbmQgbm90IGFzIGZpbGxfaW5fYmxhbmsuXG4gICAgZm9yIChjb25zdCBncm91cCBvZiBpbnYuYmxhbmtHcm91cHNCeUJsb2NrKSB7XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBncm91cC5rZXlzKSBwdXNoKGtleS5pZCwgZ3JvdXAuYmxvY2tJZCk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgbWMgb2YgaW52Lm11bHRpcGxlQ2hvaWNlKSBwdXNoKG1jLmJsb2NrSWQsIG1jLmJsb2NrSWQpO1xuICAgIGZvciAoY29uc3QgbSBvZiBpbnYubWF0Y2hpbmcpIHB1c2gobS5ibG9ja0lkLCBtLmJsb2NrSWQpO1xuICAgIGZvciAoY29uc3QgbyBvZiBpbnYub3JkZXJpbmcpIHB1c2goby5ibG9ja0lkLCBvLmJsb2NrSWQpO1xuICAgIGZvciAoY29uc3QgZyBvZiBpbnYuZ3JhcGhzKSBwdXNoKGcuYmxvY2tJZCwgZy5ibG9ja0lkKTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIGludi5mcmVlVGV4dCkgcHVzaChpZCwgaWQpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjb3VudHM6IFsuLi5jb3VudHNdLm1hcCgoW2NlbnN1c0tleSwgYmxvY2tDb3VudF0pID0+ICh7XG4gICAgICBjZW5zdXNLZXksXG4gICAgICBibG9ja0NvdW50LFxuICAgIH0pKSxcbiAgICBpdGVtcyxcbiAgfTtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2VydmVyL2dldC1hY3Rpdml0eS1oYW5kbGVyLnRzIFx1MjAxNCB0aGUgZ2V0LWFjdGl2aXR5IHJlcXVlc3QgaGFuZGxlciAoUzIpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGZ1bGwgYnJhbmNoaW5nIGxvZ2ljIG9mIHRoZSBnZXQtYWN0aXZpdHkgRWRnZSBGdW5jdGlvbiwgZXh0cmFjdGVkIGhlcmUgc29cbi8vIGl0IGxpdmVzIGluIHRoZSBURVNURUQsIENJLWRyaWZ0LWd1YXJkZWQgdmlld2VyLXNlcnZlciBidW5kbGUgaW5zdGVhZCBvZiBpblxuLy8gdW50ZXN0YWJsZSBEZW5vIGdsdWUgKHRoZSBTMiByZXZpZXcgZm91bmQgdGhlIDM3NC1saW5lIGZ1bmN0aW9uIHdhcyB0aGUgbW9zdFxuLy8gYnJhbmNoLWhlYXZ5IGluIHRoZSByZXBvIHdpdGggemVybyBhdXRvbWF0ZWQgY292ZXJhZ2UpLiBUaGUgRGVubyBlbnRyeSBwb2ludFxuLy8gKHN1cGFiYXNlL2Z1bmN0aW9ucy9nZXQtYWN0aXZpdHkvaW5kZXgudHMpIGlzIG5vdyB0aGluIHdpcmluZzogaXQgcmVhZHMgZW52LFxuLy8gYnVpbGRzIHRoZSBTdXBhYmFzZSBjbGllbnRzIGJlaGluZCB0aGUgYEdldEFjdGl2aXR5RGJgIHBvcnQsIHBhc3NlcyB0aGVcbi8vIF9zaGFyZWQvY29ycy50cyBoZWxwZXJzIGJlaGluZCB0aGUgYENvcnNLaXRgIHBvcnQsIGFuZCBzZXJ2ZXMgdGhlIGhhbmRsZXJcbi8vIHRoaXMgZmFjdG9yeSByZXR1cm5zLiBFdmVyeXRoaW5nIG9ic2VydmFibGUgXHUyMDE0IHN0YXR1cyBjb2RlcywgZXJyb3IgY29kZXMsXG4vLyBjYWNoZSBoZWFkZXJzLCByZXNwb25zZSBlbnZlbG9wZXMgXHUyMDE0IGlzIGRlY2lkZWQgSEVSRSBhbmQgcGlubmVkIGJ5XG4vLyB0ZXN0cy9nZXQtYWN0aXZpdHktaGFuZGxlci50ZXN0LnRzLlxuLy9cbi8vIFRocmVlIEdFVCBtb2RlcyBvbiBvbmUgZnVuY3Rpb246XG4vL1xuLy8gICAxLiBNRVRBIChhbm9ueW1vdXMsIHJhdGUtbGltaXRlZCBcdTIwMTQgcnVsaW5nIDMuMkEpOlxuLy8gICAgICAgIEdFVCA/YWN0aXZpdHlfaWQ9PHV1aWQ+Jm1ldGE9MVxuLy8gICAgICBcdTIxOTIgeyB0aXRsZSwgdGVhY2hlcl9uYW1lIH0gYW5kIE5PVEhJTkcgZWxzZSBcdTIwMTQgdGhlIHByZS1hdXRoIGludGVyc3RpdGlhbFxuLy8gICAgICAgIGNvbnRyYWN0IChcIk1ycy4gSmFmYXJpJ3MgJ0xpbmVhciBTeXN0ZW1zJ1wiICsgXCJ1c2UgeW91ciBAZGlzdHJpY3Qub3JnXG4vLyAgICAgICAgYWNjb3VudFwiKS4gU2FtZSBkYXRhIGFueSBwdWJsaXNoZWQgcGFnZSBhbHJlYWR5IHNob3dzIHB1YmxpY2x5LlxuLy9cbi8vICAgMi4gUkVTT0xWRSAoYXV0aGVudGljYXRlZCk6XG4vLyAgICAgICAgR0VUID9hY3Rpdml0eV9pZD08dXVpZD5cbi8vICAgICAgXHUyMTkyIHsgYWN0aXZpdHlfaWQsIHZlcnNpb25faWQsIHZlcnNpb25fbnVtLCB0aXRsZSB9IGZvciB0aGUgQ1VSUkVOVFxuLy8gICAgICAgIHB1Ymxpc2hlZCB2ZXJzaW9uLiBTZXJ2ZWQgYG5vLWNhY2hlYCBzbyBhIHJlcHVibGlzaCBpcyB2aXNpYmxlIG9uIHRoZVxuLy8gICAgICAgIG5leHQgb3BlbiAocmV2YWxpZGF0ZSwgZG9uJ3QgcmUtZG93bmxvYWQgXHUyMDE0IHNhbWUgcG9zdHVyZSBhcyB0aGUgUjJcbi8vICAgICAgICBsaXZlIGFsaWFzKS5cbi8vXG4vLyAgIDMuIENPTlRFTlQgKGF1dGhlbnRpY2F0ZWQpOlxuLy8gICAgICAgIEdFVCA/YWN0aXZpdHlfaWQ9PHV1aWQ+JnZlcnNpb25faWQ9PHV1aWQ+XG4vLyAgICAgIFx1MjE5MiB0aGUgVVBHUkFERUQgKDRBKSArIFNBTklUSVpFRCAoVFY0LUEpIGRvY3VtZW50IGZvciB0aGF0IHZlcnNpb24sIHBsdXNcbi8vICAgICAgICBwZXItc3R1ZGVudCBzZXJ2ZS10aW1lIHNodWZmbGVzLiBUaGUgVVJMIGlzIHZlcnNpb24ta2V5ZWQsIHNvIHRoZVxuLy8gICAgICAgIHJlc3BvbnNlIGlzIHNlcnZlZCBgcHJpdmF0ZSwgbWF4LWFnZT0zMTUzNjAwMCwgaW1tdXRhYmxlYCBcdTIwMTQgdGhlXG4vLyAgICAgICAgYnJvd3NlciBuZXZlciByZWZldGNoZXMgYSB2ZXJzaW9uIGl0IGhhcy4gT25seSB0aGUgQ1VSUkVOVCB2ZXJzaW9uIGlzXG4vLyAgICAgICAgc2VydmVkIChhIHN0YWxlIHZlcnNpb25faWQgNDA0cyB3aXRoIGNvZGUgJ3N0YWxlX3ZlcnNpb24nOyB0aGUgdmlld2VyXG4vLyAgICAgICAgcmUtcmVzb2x2ZXMpLCBzbyBhIHJlcHVibGlzaCBpbnZhbGlkYXRlcyBieSBjaGFuZ2luZyB0aGUgVVJMLCBuZXZlclxuLy8gICAgICAgIGJ5IGV4cGlyaW5nIGEgY2FjaGUuXG4vL1xuLy8gUGlwZWxpbmUgKGNvbnRlbnQgbW9kZSk6IGdldF9wdWJsaXNoZWRfYWN0aXZpdHkgUlBDIGFzIHRoZSBDQUxMRVIgKHRoZSBEQlxuLy8gZW5mb3JjZXMgYXV0aCArIHB1Ymxpc2hlZC1vbmx5OyBkcmFmdCBjb250ZW50IGlzIHVucmVhY2hhYmxlIGhlcmUpIFx1MjE5MlxuLy8gZHVyYWJsZSBwZXItdmVyc2lvbiBjYWNoZSBsb29rdXAgaW4gYWN0aXZpdHlfdmVyc2lvbl9yZWFkcyBrZXllZCBieVxuLy8gKHZlcnNpb25faWQsIFNBTklUSVpFUl9SRVYpIFx1MjE5MiBvbiBtaXNzIHRoZSBjYWNoZS1maWxsIHBhdGggYmVsb3cgXHUyMTkyXG4vLyBhcHBseVNlcnZlU2h1ZmZsZXMgc2VlZGVkIGAke3ZlcnNpb25faWR9OiR7dXNlcl9pZH1gIChkZXRlcm1pbmlzdGljOiByZWxvYWRzXG4vLyBuZXZlciByZXNodWZmbGU7IHRoZSBjYWNoZWQgYXJ0aWZhY3Qgc3RheXMgc3R1ZGVudC1pbmRlcGVuZGVudCkuXG4vL1xuLy8gICBjYWNoZSBNSVNTIFx1MjUwMFx1MjUwMFx1MjVCQSByZWFkVmVyc2lvbiBcdTI1MDBcdTI1MDBcdTI1QkEgdXBncmFkZSBcdTI1MDBcdTI1MDBcdTI1QkEgc2FuaXRpemVcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjUwMlxuLy8gICAgICAgICAgICAgICAgICAgIFx1MjUwQ1x1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUxOFxuLy8gICAgICAgICAgICAgICAgICAgIFx1MjVCQ1xuLy8gICAgICAgICAgICAgIHdyaXRlQ2Vuc3VzIChTNykgXHUyNTAwXHUyNTAwZmFpbHNcdTI1MDBcdTI1MDBcdTI1QkEgTk8gY2FjaGUgcm93OiBuZXh0IHJlYWQgcmV0cmllc1xuLy8gICAgICAgICAgICAgICAgICAgIFx1MjUwMiBvayAgICAgICAgICAgICAgICAgIChzZWxmLWhlYWxpbmc7IHNlZSB0aGUgb3JkZXJpbmdcbi8vICAgICAgICAgICAgICAgICAgICBcdTI1QkMgICAgICAgICAgICAgICAgICAgICAgbm90ZSBhdCB0aGUgY2FsbCBzaXRlKVxuLy8gICAgICAgICAgICAgIHVwc2VydENhY2hlIFx1MjUwMFx1MjUwMFx1MjVCQSBkZWxldGVTdGFsZUNhY2hlIChvbGQtcmV2IEdDIGZvciB0aGlzIHZlcnNpb24pXG4vL1xuLy8gVGhlIGFuYWx5dGljcyB3cml0ZXMgYXJlIGEgU0lERS1DSEFOTkVMOiBldmVyeSBvbmUgb2YgdGhlbSBjYW4gZmFpbCB3aXRob3V0XG4vLyBjaGFuZ2luZyB0aGUgc3R1ZGVudCdzIHJlc3BvbnNlLiBBIGNhY2hlIEhJVCBkb2VzIG5vbmUgb2YgdGhpcyB3b3JrLlxuLy9cbi8vIEFjY2VzcyBydWxlIChTMiBkZWNpc2lvbiAyKTogQU5ZIGF1dGhlbnRpY2F0ZWQgdXNlciAoc3R1ZGVudCBvciB0ZWFjaGVyKSBtYXlcbi8vIHJlYWQgdGhlIHB1Ymxpc2hlZCBjdXJyZW50IHZlcnNpb24gb2YgYSBub24tZGVsZXRlZCBhY3Rpdml0eSBcdTIwMTQgdGhlIFIyXG4vLyBsaW5rLXNoYXJlIG1vZGVsIGJlaGluZCBzaWduLWluLiBDbGFzc2VzIGdhdGUgaWRlbnRpdHkgKHRoZSAxMysgYXNzZXJ0aW9uKSxcbi8vIG5vdCBhY3Rpdml0eSBhY2Nlc3MuXG4vL1xuLy8gS25vd24gcmVzaWR1YWwgKGRvY3VtZW50ZWQsIGFjY2VwdGVkKTogdGhlIGJyb3dzZXIgSFRUUCBjYWNoZSBpcyBwZXJcbi8vIHByb2ZpbGUsIG5vdCBwZXIgYWNjb3VudC4gT24gYSBzaGFyZWQgQ2hyb21lYm9vayBwcm9maWxlLCBzdHVkZW50IEIgY2FuIGJlXG4vLyBzZXJ2ZWQgc3R1ZGVudCBBJ3MgY2FjaGVkIGNvbnRlbnQgcmVzcG9uc2UgXHUyMDE0IGlkZW50aWNhbCBleGNlcHQgdGhlIG9yZGVyaW5nXG4vLyBwZXJtdXRhdGlvbiAoc2VlZGVkIHBlciBzdHVkZW50KS4gTm8ga2V5IG1hdGVyaWFsIGRpZmZlcnMsIGFuZCBncmFkaW5nXG4vLyByZWZlcmVuY2VzIGl0ZW0gaWRzIChvcmRlci1pbmRlcGVuZGVudCksIHNvIHRoZSB3b3JzdCBjYXNlIGlzIGEgY29zbWV0aWNcbi8vIHBlcm11dGF0aW9uIHN3YXA7IFMxJ3Mgc2lnbk91dEV2ZXJ5dGhpbmcgcHVyZ2VzIHZpZXdlciBTVE9SQUdFLCBub3QgdGhlXG4vLyBIVFRQIGNhY2hlLCBhbmQgcHV0dGluZyB0aGUgdXNlciBpZCBpbiB0aGUgVVJMIHRvIHNwbGl0IGNhY2hlIGtleXMgd291bGRcbi8vIGxlYWsgYW4gaWRlbnRpZmllciBpbnRvIGxvZ3MgZm9yIG5vIHNlY3VyaXR5IGdhaW4uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyBVcGdyYWRlRXJyb3IsIHVwZ3JhZGVBY3Rpdml0eURvY3VtZW50IH0gZnJvbSAnQGFjdGl2aXR5L3NjaGVtYSc7XG5pbXBvcnQgeyBjZW5zdXNPZkRvY3VtZW50IH0gZnJvbSAnLi4vY2Vuc3VzL2NlbnN1cy5qcyc7XG5pbXBvcnQgdHlwZSB7IFZlcnNpb25DZW5zdXMgfSBmcm9tICcuLi9jZW5zdXMvY2Vuc3VzLmpzJztcbmltcG9ydCB7IFNBTklUSVpFUl9SRVYsIHNhbml0aXplQWN0aXZpdHlEb2N1bWVudCB9IGZyb20gJy4uL3Nhbml0aXplL3Nhbml0aXplLmpzJztcbmltcG9ydCB7IGFwcGx5U2VydmVTaHVmZmxlcyB9IGZyb20gJy4uL3Nhbml0aXplL3NodWZmbGUuanMnO1xuaW1wb3J0IHR5cGUgeyBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50IH0gZnJvbSAnLi4vc2FuaXRpemUvc2FuaXRpemVkLXR5cGVzLmpzJztcblxuLyoqIEJ1bXAgd2hlbiB0aGUgcmVzcG9uc2UgZW52ZWxvcGUgY2hhbmdlcyBzaGFwZSAodGhlIGRvYyBJTlNJREUgaXQgaXNcbiAqIHZlcnNpb25lZCBieSB0aGUgc2NoZW1hICsgU0FOSVRJWkVSX1JFViwgbm90IGJ5IHRoaXMpLiAqL1xuZXhwb3J0IGNvbnN0IEFQSV9WRVJTSU9OID0gMTtcblxuY29uc3QgVVVJRF9SRSA9XG4gIC9eWzAtOWEtZl17OH0tWzAtOWEtZl17NH0tWzAtOWEtZl17NH0tWzAtOWEtZl17NH0tWzAtOWEtZl17MTJ9JC9pO1xuXG4vLyAtLS0tIFBvcnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGhhbmRsZXIgbmV2ZXIgdG91Y2hlcyBzdXBhYmFzZS1qcyBvciBEZW5vIGRpcmVjdGx5OyB0aGUgZW50cnkgcG9pbnRcbi8vIGltcGxlbWVudHMgdGhlc2UgYWdhaW5zdCB0aGUgcmVhbCBjbGllbnRzLCB0ZXN0cyBpbXBsZW1lbnQgdGhlbSB3aXRoIGZha2VzLlxuXG4vKiogVGhlIGB7IGRhdGEsIGVycm9yIH1gIHNoYXBlIGV2ZXJ5IHN1cGFiYXNlLWpzIHF1ZXJ5IHJlc29sdmVzIHRvLiAqL1xuZXhwb3J0IGludGVyZmFjZSBEYlJlc3VsdDxUPiB7XG4gIGRhdGE6IFQgfCBudWxsO1xuICBlcnJvcjogeyBtZXNzYWdlPzogc3RyaW5nIH0gfCBudWxsO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFB1Ymxpc2hlZEFjdGl2aXR5Um93IHtcbiAgdmVyc2lvbl9pZDogc3RyaW5nO1xuICB2ZXJzaW9uX251bTogbnVtYmVyO1xuICB0aXRsZTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEdldEFjdGl2aXR5RGIge1xuICAvKiogYGdldF9hY3Rpdml0eV9wdWJsaWNfbWV0YWAgUlBDIGFzIGFub24gKHRoZSBvbmUgYW5vbi1jYWxsYWJsZSBSUEMgXHUyMDE0XG4gICAqIHBvc3RncmVzLW93bmVkIERFRklORVI7IDAwMTcgZG9jdW1lbnRzIHRoZSBkZWxpYmVyYXRlIGdyYW50KS4gKi9cbiAgcHVibGljTWV0YShcbiAgICBhY3Rpdml0eUlkOiBzdHJpbmcsXG4gICk6IFByb21pc2U8RGJSZXN1bHQ8eyB0aXRsZTogc3RyaW5nOyB0ZWFjaGVyX25hbWU6IHN0cmluZyB8IG51bGwgfT4+O1xuICAvKiogYGdldF9wdWJsaXNoZWRfYWN0aXZpdHlgIFJQQyBhcyB0aGUgQ0FMTEVSIChBdXRob3JpemF0aW9uIGhlYWRlciBwYXNzZWRcbiAgICogdGhyb3VnaCksIHNvIHRoZSBEQiBlbmZvcmNlcyBhdXRoICsgcHVibGlzaGVkLW9ubHkgXHUyMDE0IG5vdCB0aGlzIGhhbmRsZXIuICovXG4gIHB1Ymxpc2hlZEFjdGl2aXR5KFxuICAgIGF1dGhIZWFkZXI6IHN0cmluZyxcbiAgICBhY3Rpdml0eUlkOiBzdHJpbmcsXG4gICk6IFByb21pc2U8RGJSZXN1bHQ8UHVibGlzaGVkQWN0aXZpdHlSb3c+PjtcbiAgLyoqIENhY2hlIHJvdyBmcm9tIGFjdGl2aXR5X3ZlcnNpb25fcmVhZHMgKHNlcnZpY2Ugcm9sZSkuICovXG4gIHJlYWRDYWNoZShcbiAgICB2ZXJzaW9uSWQ6IHN0cmluZyxcbiAgICBzYW5pdGl6ZXJSZXY6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxEYlJlc3VsdDx7IGNvbnRlbnQ6IHVua25vd24gfT4+O1xuICAvKiogVmVyc2lvbiByb3cgZnJvbSBhY3Rpdml0eV92ZXJzaW9ucyAoc2VydmljZSByb2xlKS4gKi9cbiAgcmVhZFZlcnNpb24odmVyc2lvbklkOiBzdHJpbmcpOiBQcm9taXNlPERiUmVzdWx0PHsgY29udGVudDogdW5rbm93biB9Pj47XG4gIC8qKiBVcHNlcnQga2V5ZWQgKHZlcnNpb25faWQsIHNhbml0aXplcl9yZXYpIFx1MjAxNCBjb25jdXJyZW50IG1pc3NlcyB3cml0ZSB0aGVcbiAgICogc2FtZSBkZXRlcm1pbmlzdGljIGFydGlmYWN0LCBzbyBsYXN0LXdyaXRlLXdpbnMgaXMgaGFybWxlc3MuICovXG4gIHVwc2VydENhY2hlKHJvdzoge1xuICAgIHZlcnNpb25faWQ6IHN0cmluZztcbiAgICBzYW5pdGl6ZXJfcmV2OiBzdHJpbmc7XG4gICAgc2NoZW1hX3ZlcnNpb246IG51bWJlcjtcbiAgICBjb250ZW50OiB1bmtub3duO1xuICB9KTogUHJvbWlzZTx7IGVycm9yOiB7IG1lc3NhZ2U/OiBzdHJpbmcgfSB8IG51bGwgfT47XG4gIC8qKiBSZXBsYWNlIHRoaXMgdmVyc2lvbidzIGNlbnN1cyArIGl0ZW0tYXR0cmlidXRpb24gcm93cyAoUzcpLiBJZGVtcG90ZW50OlxuICAgKiB0aGUgY2Vuc3VzIGlzIGEgcHVyZSBmdW5jdGlvbiBvZiBhbiBpbW11dGFibGUgdmVyc2lvbiwgc28gYSByZS1ydW4gd3JpdGVzXG4gICAqIGlkZW50aWNhbCByb3dzLiAqL1xuICB3cml0ZUNlbnN1cyhcbiAgICB2ZXJzaW9uSWQ6IHN0cmluZyxcbiAgICBjZW5zdXM6IFZlcnNpb25DZW5zdXMsXG4gICk6IFByb21pc2U8eyBlcnJvcjogeyBtZXNzYWdlPzogc3RyaW5nIH0gfCBudWxsIH0+O1xuICAvKiogRGVsZXRlIHRoaXMgdmVyc2lvbidzIGNhY2hlIHJvd3Mgd3JpdHRlbiB1bmRlciBhbnkgT1RIRVIgc2FuaXRpemVyIHJldiBcdTIwMTRcbiAgICogdGhlIGV4YWN0IGhhbGYgb2YgdGhlIFI2KGEpIEdDLiBPbmx5IHRoaXMgY29kZSBrbm93cyB0aGUgY3VycmVudCByZXYsIHNvXG4gICAqIG9ubHkgdGhpcyBjb2RlIGNhbiBiZSBwcmVjaXNlIGFib3V0IGl0OyB0aGUgc2NoZWR1bGVkIGpvYiBzd2VlcHMgdGhlIHRhaWxcbiAgICogb2YgdmVyc2lvbnMgdGhhdCBhcmUgbmV2ZXIgcmVhZCBhZ2Fpbi4gKi9cbiAgZGVsZXRlU3RhbGVDYWNoZShcbiAgICB2ZXJzaW9uSWQ6IHN0cmluZyxcbiAgICBrZWVwUmV2OiBzdHJpbmcsXG4gICk6IFByb21pc2U8eyBlcnJvcjogeyBtZXNzYWdlPzogc3RyaW5nIH0gfCBudWxsIH0+O1xufVxuXG4vKiogVGhlIF9zaGFyZWQvY29ycy50cyBoZWxwZXIgc3VyZmFjZSAoZW52LXJlYWRpbmcsIHNvIGl0IHN0YXlzIERlbm8tc2lkZSkuICovXG5leHBvcnQgaW50ZXJmYWNlIENvcnNLaXQge1xuICBjb3JzSGVhZGVycyhyZXE6IFJlcXVlc3QpOiBIZWFkZXJzSW5pdDtcbiAgaGFuZGxlUHJlZmxpZ2h0KHJlcTogUmVxdWVzdCk6IFJlc3BvbnNlIHwgbnVsbDtcbiAganNvblJlc3BvbnNlKHJlcTogUmVxdWVzdCwgYm9keTogdW5rbm93biwgaW5pdD86IFJlc3BvbnNlSW5pdCk6IFJlc3BvbnNlO1xuICBlcnJvclJlc3BvbnNlKFxuICAgIHJlcTogUmVxdWVzdCxcbiAgICBzdGF0dXM6IG51bWJlcixcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgZGV0YWlscz86IHVua25vd24sXG4gICk6IFJlc3BvbnNlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEdldEFjdGl2aXR5SGFuZGxlckRlcHMge1xuICBkYjogR2V0QWN0aXZpdHlEYjtcbiAgY29yczogQ29yc0tpdDtcbiAgLyoqIEluamVjdGFibGUgY2xvY2sgZm9yIHRoZSByYXRlIGxpbWl0ZXIgKHRlc3RzKS4gRGVmYXVsdHMgdG8gRGF0ZS5ub3cuICovXG4gIG5vdz86ICgpID0+IG51bWJlcjtcbn1cblxuLy8gLS0tLSBNZXRhLWJyYW5jaCByYXRlIGxpbWl0aW5nIChwZXIgaXNvbGF0ZSBcdTIwMTQgTUVBU1VSRUQgQVMgTkVBUkxZIElORVJUKSAtLS0tXG4vLyBBIHNsaWRpbmcgb25lLW1pbnV0ZSB3aW5kb3cgcGVyIGNsaWVudCBJUC5cbi8vXG4vLyBSRUFEIFRISVMgQkVGT1JFIENIQU5HSU5HIFRIRSBUSFJFU0hPTEQgT1IgR0lWSU5HIFRISVMgU0hBUkVEIFNUQVRFLlxuLy9cbi8vICoqIEEgQ0xBU1NST09NIElTIE9ORSBJUC4gKiogRXZlcnkgc3R1ZGVudCBpbiBhIHNjaG9vbCBzaXRzIGJlaGluZCB0aGUgc2FtZVxuLy8gTkFULCBzbyBcIm9wZW4gdGhpcyBsaW5rIG5vd1wiIHByb2R1Y2VzIG9uZSBtZXRhIHJlcXVlc3QgcGVyIHN0dWRlbnQgXHUyMDE0IDMwK1xuLy8gd2l0aGluIHNlY29uZHMsIGh1bmRyZWRzIHBlciBtaW51dGUgYXQgYSBiZWxsIGNoYW5nZSBhY3Jvc3MgYSBjYW1wdXMgXHUyMDE0IGFsbFxuLy8gZnJvbSBhIFNJTkdMRSBhZGRyZXNzLiBBIHBlci1wZXJzb24gdGhyZXNob2xkIGlzIHRoZXJlZm9yZSBvZmYgYnkgfjIgb3JkZXJzXG4vLyBvZiBtYWduaXR1ZGUgYWdhaW5zdCB0aGUgcmVhbCB0b3BvbG9neSwgYW5kIHRoaXMgZW5kcG9pbnQgc2VydmVzIHRoZSBQUkUtQVVUSFxuLy8gaW50ZXJzdGl0aWFsOiBhIDQyOSBoZXJlIGlzIHRoZSBmaXJzdCBzY3JlZW4gYSBzdHVkZW50IGV2ZXIgc2VlcywgYmVmb3JlIHRoZXlcbi8vIGNhbiBldmVuIHNpZ24gaW4uIFRoZSBmYWlsdXJlIHdvdWxkIHByZXNlbnQgYXMgXCJzb21lIHN0dWRlbnRzIGNhbid0IG9wZW4gdGhlXG4vLyBhY3Rpdml0eSwgb3RoZXJzIGNhbiwgYXBwYXJlbnRseSBhdCByYW5kb21cIiBcdTIwMTQgbWlzZXJhYmxlIHRvIGRpYWdub3NlIG1pZC1jbGFzcy5cbi8vIFRoZSBjZWlsaW5nIGJlbG93IGlzIGRlbGliZXJhdGVseSBnZW5lcm91cyBmb3IgdGhhdCByZWFzb24uIFJBSVNJTkcgaXQgaXNcbi8vIHNhZmU7IExPV0VSSU5HIGl0IHRvd2FyZCBhIHBlci1wZXJzb24gbnVtYmVyIGlzIHRoZSBidWcuXG4vL1xuLy8gVGhpcyBjb25zdHJhaW50IGlzIG5vdCBzcGVjaWZpYyB0byB0aGlzIGZ1bmN0aW9uOiBwZXItSVAgbGltaXRpbmcgaXMgdGhlXG4vLyB3cm9uZyBwcmltaXRpdmUgYW55d2hlcmUgaW4gdGhpcyBwcm9kdWN0LCBiZWNhdXNlIG91ciB1c2VycyBhcnJpdmUgdGhpcnR5LWF0LVxuLy8gYS10aW1lIGZyb20gb25lIGFkZHJlc3MuIFNlZSBERUNJU0lPTlMubWQgXHUyMTkyIFwiUmVhZCBBUEkgUzJcIiAocmF0ZS1saW1pdFxuLy8gZmluZGluZykgYmVmb3JlIHJlYWNoaW5nIGZvciBJUC1iYXNlZCB0aHJvdHRsaW5nIGVsc2V3aGVyZS5cbi8vXG4vLyBNRUFTVVJFRCAyMDI2LTA3LTI4IG9uIHRoZSBsaXZlIGRlcGxveW1lbnQ6IDk1IHNlcXVlbnRpYWwgYW5vbnltb3VzIHJlcXVlc3RzXG4vLyBmcm9tIE9ORSBJUCBwcm9kdWNlZCBaRVJPIDQyOXMuIFN1cGFiYXNlJ3MgRWRnZSBSdW50aW1lIHJlY3ljbGVzIGlzb2xhdGVzXG4vLyBhZ2dyZXNzaXZlbHksIHNvIHRoaXMgcGVyLWhhbmRsZXIgTWFwIGlzIGVtcHR5IG9uIG1vc3QgcmVxdWVzdHMgXHUyMDE0IHRoZVxuLy8gZWZmZWN0aXZlIGxpbWl0IGlzIGZhciBsb29zZXIgdGhhbiB0aGUgY29uc3RhbnRzIGltcGx5LCBhbmQgb24gYSBkaXN0cmlidXRlZFxuLy8gYnVyc3QgaXQgaXMgbm8gbGltaXQgYXQgYWxsLiBTbyB0aGlzIGlzIG9wcG9ydHVuaXN0aWMgdGhyb3R0bGluZyBvZiBhIHNpbmdsZVxuLy8gaG90IGlzb2xhdGUsIE5PVCBhIGd1YXJhbnRlZSBcdTIwMTQgZG8gbm90IGRlc2NyaWJlIGl0IGFzIG9uZS5cbi8vXG4vLyBLZXB0IHJhdGhlciB0aGFuIGRlbGV0ZWQgYmVjYXVzZSBpdCBjb3N0cyBub3RoaW5nIGFuZCBkb2VzIGJsdW50IGEgcnVuYXdheVxuLy8gY2xpZW50LiBXaGF0IGl0IGd1YXJkcyBpcyB0aGUgdGl0bGUgKyB0ZWFjaGVyIGRpc3BsYXkgbmFtZSBvZiBhIFBVQkxJU0hFRFxuLy8gYWN0aXZpdHksIHRvIGEgY2FsbGVyIHdobyBhbHJlYWR5IGhvbGRzIGl0cyBVVUlEIFx1MjAxNCBkYXRhIGV2ZXJ5IHB1Ymxpc2hlZCBwYWdlXG4vLyBzaG93cyBwdWJsaWNseSB0b2RheSwgd2l0aCBVVUlEIGVudW1lcmF0aW9uIGluZmVhc2libGUuXG4vL1xuLy8gSWYgYSBSRUFMIGxpbWl0IGlzIGV2ZXIgbmVlZGVkICh0cmlnZ2VyOiB0aGlzIHJlc3BvbnNlIHN0YXJ0cyByZXR1cm5pbmdcbi8vIGFueXRoaW5nIHJpY2hlciB0aGFuIHRob3NlIHR3byBmaWVsZHMpLCBpdCBtdXN0IG1vdmUgdG8gc2hhcmVkIHN0YXRlIFx1MjAxNCBhXG4vLyBzbWFsbCBEQiBjb3VudGVyIHRhYmxlIFx1MjAxNCBiZWNhdXNlIG5vIGluLW1lbW9yeSBzY2hlbWUgY2FuIHdvcmsgaGVyZS4gUG9ydCB0aGVcbi8vIFNDSE9PTC1TQUZFIGNlaWxpbmcgd2l0aCBpdDsgZG8gbm90IHJlaW50cm9kdWNlIGEgcGVyLXBlcnNvbiBudW1iZXIuXG4vL1xuLy8gVGhlIGF1dGhlZCBicmFuY2hlcyBhcmUgTk9UIHJhdGUtbGltaXRlZCBoZXJlOyB0aGUgSldUIGlzIHRoZWlyIGdhdGUuXG5cbmV4cG9ydCBjb25zdCBNRVRBX1dJTkRPV19NUyA9IDYwXzAwMDtcbi8qKiBTY2hvb2wtc2FmZSBjZWlsaW5nOiBzaXplZCBmb3IgYSB3aG9sZSBjYW1wdXMgYmVoaW5kIG9uZSBOQVQgYXQgYSBiZWxsXG4gKiBjaGFuZ2UsIG5vdCBmb3Igb25lIHBlcnNvbi4gU2VlIHRoZSB0b3BvbG9neSBub3RlIGFib3ZlLiAqL1xuZXhwb3J0IGNvbnN0IE1FVEFfTUFYX1BFUl9XSU5ET1cgPSA2MDA7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNZXRhUmF0ZUxpbWl0ZXIoXG4gIG5vdzogKCkgPT4gbnVtYmVyID0gRGF0ZS5ub3csXG4pOiAoaXA6IHN0cmluZykgPT4gYm9vbGVhbiB7XG4gIGNvbnN0IG1ldGFIaXRzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcltdPigpO1xuICByZXR1cm4gZnVuY3Rpb24gbWV0YVJhdGVMaW1pdGVkKGlwOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB0ID0gbm93KCk7XG4gICAgY29uc3QgaGl0cyA9IChtZXRhSGl0cy5nZXQoaXApID8/IFtdKS5maWx0ZXIoXG4gICAgICAoaGl0KSA9PiB0IC0gaGl0IDwgTUVUQV9XSU5ET1dfTVMsXG4gICAgKTtcbiAgICBpZiAoaGl0cy5sZW5ndGggPj0gTUVUQV9NQVhfUEVSX1dJTkRPVykge1xuICAgICAgbWV0YUhpdHMuc2V0KGlwLCBoaXRzKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBoaXRzLnB1c2godCk7XG4gICAgbWV0YUhpdHMuc2V0KGlwLCBoaXRzKTtcbiAgICAvLyBCb3VuZCB0aGUgbWFwIHNvIGEgc2NhbiBhY3Jvc3MgbWFueSBJUHMgY2FuJ3QgZ3JvdyBtZW1vcnkgdW5ib3VuZGVkLlxuICAgIGlmIChtZXRhSGl0cy5zaXplID4gMTBfMDAwKSBtZXRhSGl0cy5jbGVhcigpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbn1cblxuLy8gLS0tLSBKV1Qgc3ViamVjdCAoc2h1ZmZsZSBzZWVkIG9ubHkpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERlY29kZWQgV0lUSE9VVCB2ZXJpZmljYXRpb24gXHUyMDE0IGRlbGliZXJhdGVseS4gVGhlIHVzZXItc2NvcGVkIFJQQyBjYWxsIGhhc1xuLy8gYWxyZWFkeSBzdWNjZWVkZWQgYnkgdGhlIHRpbWUgdGhpcyBydW5zLCB3aGljaCBtZWFucyBQb3N0Z1JFU1QgdmVyaWZpZWQgdGhlXG4vLyB0b2tlbidzIHNpZ25hdHVyZTsgdGhpcyBvbmx5IHJlLXJlYWRzIHRoZSBgc3ViYCBjbGFpbSBmb3IgdGhlIHNodWZmbGUgc2VlZC5cbi8vIE5ldmVyIHVzZSB0aGlzIGZvciBhdXRob3JpemF0aW9uLlxuZXhwb3J0IGZ1bmN0aW9uIGp3dFN1YihhdXRoSGVhZGVyOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgdG9rZW4gPSBhdXRoSGVhZGVyLnJlcGxhY2UoL15CZWFyZXJcXHMrL2ksICcnKTtcbiAgY29uc3QgcGF5bG9hZCA9IHRva2VuLnNwbGl0KCcuJylbMV07XG4gIGlmICghcGF5bG9hZCkgcmV0dXJuIG51bGw7XG4gIHRyeSB7XG4gICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoXG4gICAgICBhdG9iKHBheWxvYWQucmVwbGFjZSgvLS9nLCAnKycpLnJlcGxhY2UoL18vZywgJy8nKSksXG4gICAgKSBhcyB7IHN1Yj86IHVua25vd24gfTtcbiAgICByZXR1cm4gdHlwZW9mIGpzb24uc3ViID09PSAnc3RyaW5nJyA/IGpzb24uc3ViIDogbnVsbDtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLy8gLS0tLSBUaGUgaGFuZGxlciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUdldEFjdGl2aXR5SGFuZGxlcihcbiAgZGVwczogR2V0QWN0aXZpdHlIYW5kbGVyRGVwcyxcbik6IChyZXE6IFJlcXVlc3QpID0+IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgY29uc3QgeyBkYiwgY29ycyB9ID0gZGVwcztcbiAgY29uc3QgbWV0YVJhdGVMaW1pdGVkID0gY3JlYXRlTWV0YVJhdGVMaW1pdGVyKGRlcHMubm93ID8/IERhdGUubm93KTtcblxuICByZXR1cm4gYXN5bmMgZnVuY3Rpb24gaGFuZGxlR2V0QWN0aXZpdHkocmVxOiBSZXF1ZXN0KTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIGNvbnN0IHByZWZsaWdodCA9IGNvcnMuaGFuZGxlUHJlZmxpZ2h0KHJlcSk7XG4gICAgaWYgKHByZWZsaWdodCkgcmV0dXJuIHByZWZsaWdodDtcbiAgICBpZiAocmVxLm1ldGhvZCAhPT0gJ0dFVCcpIHtcbiAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDUsICdNZXRob2Qgbm90IGFsbG93ZWQnKTtcbiAgICB9XG5cbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHJlcS51cmwpO1xuICAgIGNvbnN0IGFjdGl2aXR5SWQgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgnYWN0aXZpdHlfaWQnKSA/PyAnJztcbiAgICBjb25zdCB2ZXJzaW9uSWQgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgndmVyc2lvbl9pZCcpO1xuICAgIGNvbnN0IG1ldGFPbmx5ID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ21ldGEnKSA9PT0gJzEnO1xuXG4gICAgaWYgKCFVVUlEX1JFLnRlc3QoYWN0aXZpdHlJZCkpIHtcbiAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDAsICdhY3Rpdml0eV9pZCBtdXN0IGJlIGEgVVVJRCcpO1xuICAgIH1cblxuICAgIC8vIC0tLS0gMS4gTUVUQSAoYW5vbnltb3VzKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaWYgKG1ldGFPbmx5KSB7XG4gICAgICBjb25zdCBpcCA9XG4gICAgICAgIHJlcS5oZWFkZXJzLmdldCgneC1mb3J3YXJkZWQtZm9yJyk/LnNwbGl0KCcsJylbMF0/LnRyaW0oKSA/PyAndW5rbm93bic7XG4gICAgICBpZiAobWV0YVJhdGVMaW1pdGVkKGlwKSkge1xuICAgICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDI5LCAnVG9vIG1hbnkgcmVxdWVzdHMnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IGRiLnB1YmxpY01ldGEoYWN0aXZpdHlJZCk7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW2dldC1hY3Rpdml0eV0gbWV0YSBSUEMgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNTAwLCAnTG9va3VwIGZhaWxlZCcpO1xuICAgICAgfVxuICAgICAgaWYgKCFkYXRhKSByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDA0LCAnTm90IGF2YWlsYWJsZScpO1xuICAgICAgcmV0dXJuIGNvcnMuanNvblJlc3BvbnNlKFxuICAgICAgICByZXEsXG4gICAgICAgIHtcbiAgICAgICAgICBhcGlfdmVyc2lvbjogQVBJX1ZFUlNJT04sXG4gICAgICAgICAgdGl0bGU6IGRhdGEudGl0bGUsXG4gICAgICAgICAgdGVhY2hlcl9uYW1lOiBkYXRhLnRlYWNoZXJfbmFtZSxcbiAgICAgICAgfSxcbiAgICAgICAgeyBoZWFkZXJzOiB7ICdDYWNoZS1Db250cm9sJzogJ25vLWNhY2hlJyB9IH0sXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIC0tLS0gQXV0aCAocmVzb2x2ZSArIGNvbnRlbnQpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGNvbnN0IGF1dGhIZWFkZXIgPSByZXEuaGVhZGVycy5nZXQoJ0F1dGhvcml6YXRpb24nKTtcbiAgICBpZiAoIWF1dGhIZWFkZXIpIHtcbiAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDEsICdNaXNzaW5nIEF1dGhvcml6YXRpb24gaGVhZGVyJyk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBkYXRhOiBjdXJyZW50LCBlcnJvcjogcnBjRXJyb3IgfSA9IGF3YWl0IGRiLnB1Ymxpc2hlZEFjdGl2aXR5KFxuICAgICAgYXV0aEhlYWRlcixcbiAgICAgIGFjdGl2aXR5SWQsXG4gICAgKTtcbiAgICBpZiAocnBjRXJyb3IpIHtcbiAgICAgIGNvbnN0IG1zZyA9IHJwY0Vycm9yLm1lc3NhZ2UgPz8gJyc7XG4gICAgICAvLyBQb3N0Z1JFU1Qgc3VyZmFjZXMgYSBiYWQvZXhwaXJlZCBKV1QgYXMgYSA0MDEtY2xhc3MgZXJyb3I7IHRoZSBSUENcbiAgICAgIC8vIHJhaXNlcyAnTm90IGF2YWlsYWJsZScgZm9yIG1pc3NpbmcvdW5wdWJsaXNoZWQvZGVsZXRlZCBhY3Rpdml0aWVzLlxuICAgICAgY29uc3Qgc3RhdHVzID0gbXNnLmluY2x1ZGVzKCdOb3QgYXZhaWxhYmxlJylcbiAgICAgICAgPyA0MDRcbiAgICAgICAgOiAvSldUfHRva2VufGF1dGgvaS50ZXN0KG1zZylcbiAgICAgICAgICA/IDQwMVxuICAgICAgICAgIDogNTAwO1xuICAgICAgaWYgKHN0YXR1cyA9PT0gNTAwKSBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBSUEMgZXJyb3I6JywgcnBjRXJyb3IpO1xuICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShcbiAgICAgICAgcmVxLFxuICAgICAgICBzdGF0dXMsXG4gICAgICAgIHN0YXR1cyA9PT0gNDA0ID8gJ05vdCBhdmFpbGFibGUnIDogbXNnLFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKCFjdXJyZW50KSByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDA0LCAnTm90IGF2YWlsYWJsZScpO1xuICAgIGNvbnN0IHJvdyA9IGN1cnJlbnQ7XG5cbiAgICAvLyAtLS0tIDIuIFJFU09MVkUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpZiAoIXZlcnNpb25JZCkge1xuICAgICAgcmV0dXJuIGNvcnMuanNvblJlc3BvbnNlKFxuICAgICAgICByZXEsXG4gICAgICAgIHtcbiAgICAgICAgICBhcGlfdmVyc2lvbjogQVBJX1ZFUlNJT04sXG4gICAgICAgICAgYWN0aXZpdHlfaWQ6IGFjdGl2aXR5SWQsXG4gICAgICAgICAgdmVyc2lvbl9pZDogcm93LnZlcnNpb25faWQsXG4gICAgICAgICAgdmVyc2lvbl9udW06IHJvdy52ZXJzaW9uX251bSxcbiAgICAgICAgICB0aXRsZTogcm93LnRpdGxlLFxuICAgICAgICB9LFxuICAgICAgICB7IGhlYWRlcnM6IHsgJ0NhY2hlLUNvbnRyb2wnOiAnbm8tY2FjaGUnIH0gfSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gLS0tLSAzLiBDT05URU5UIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaWYgKCFVVUlEX1JFLnRlc3QodmVyc2lvbklkKSkge1xuICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQwMCwgJ3ZlcnNpb25faWQgbXVzdCBiZSBhIFVVSUQnKTtcbiAgICB9XG4gICAgaWYgKHZlcnNpb25JZCAhPT0gcm93LnZlcnNpb25faWQpIHtcbiAgICAgIC8vIFJlcHVibGlzaGVkIHNpbmNlIHJlc29sdmUgXHUyMDE0IHRoZSB2aWV3ZXIgcmUtcmVzb2x2ZXMgYW5kIHJlZmV0Y2hlcy4gNDA0XG4gICAgICAvLyAobm90IDQwOSkgc28gbm8gc3RhbGUtVVJMIHJlc3BvbnNlIGlzIGV2ZXIgY2FjaGVhYmxlIGFzIGNvbnRlbnQuXG4gICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDA0LCAnTm90IHRoZSBjdXJyZW50IHZlcnNpb24nLCB7XG4gICAgICAgIGNvZGU6ICdzdGFsZV92ZXJzaW9uJyxcbiAgICAgICAgY3VycmVudF92ZXJzaW9uX2lkOiByb3cudmVyc2lvbl9pZCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIER1cmFibGUgcGVyLXZlcnNpb24gY2FjaGUgKGFjdGl2aXR5X3ZlcnNpb25fcmVhZHMsIHNlcnZpY2Utcm9sZSBvbmx5KS5cbiAgICBsZXQgc2FuaXRpemVkOiBTYW5pdGl6ZWRBY3Rpdml0eURvY3VtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgY29uc3QgeyBkYXRhOiBjYWNoZWQsIGVycm9yOiBjYWNoZUVyciB9ID0gYXdhaXQgZGIucmVhZENhY2hlKFxuICAgICAgdmVyc2lvbklkLFxuICAgICAgU0FOSVRJWkVSX1JFVixcbiAgICApO1xuICAgIGlmIChjYWNoZUVycikge1xuICAgICAgLy8gQ2FjaGUgcmVhZCBmYWlsdXJlIGlzIG5vbi1mYXRhbCBcdTIwMTQgZmFsbCB0aHJvdWdoIHRvIHRoZSBzb3VyY2Ugb2YgdHJ1dGguXG4gICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBjYWNoZSByZWFkIGZhaWxlZDonLCBjYWNoZUVycik7XG4gICAgfVxuICAgIGlmIChjYWNoZWQpIHtcbiAgICAgIHNhbml0aXplZCA9IGNhY2hlZC5jb250ZW50IGFzIFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQ7XG4gICAgfVxuXG4gICAgaWYgKCFzYW5pdGl6ZWQpIHtcbiAgICAgIGNvbnN0IHsgZGF0YTogdmVyc2lvbiwgZXJyb3I6IHZFcnIgfSA9IGF3YWl0IGRiLnJlYWRWZXJzaW9uKHZlcnNpb25JZCk7XG4gICAgICBpZiAodkVyciB8fCAhdmVyc2lvbikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSB2ZXJzaW9uIHJlYWQgZmFpbGVkOicsIHZFcnIpO1xuICAgICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNTAwLCAnVmVyc2lvbiByZWFkIGZhaWxlZCcpO1xuICAgICAgfVxuICAgICAgbGV0IHVwZ3JhZGVkO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdXBncmFkZWQgPSB1cGdyYWRlQWN0aXZpdHlEb2N1bWVudCh2ZXJzaW9uLmNvbnRlbnQpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIFRoZSBleHBsaWNpdCBmYWlsdXJlIHN0YXRlIHRoZSBmYWlsdXJlLW1vZGVzIHRhYmxlIHByb21pc2VzIFx1MjAxNCBhXG4gICAgICAgIC8vIHNlcnZlZCA1MDAgd2l0aCBhIHJlYXNvbiwgbmV2ZXIgYSBtaXMtcGFyc2VkIGRvY3VtZW50LlxuICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSB1cGdyYWRlIGZhaWxlZDonLCBlcnIpO1xuICAgICAgICBjb25zdCBkZXRhaWwgPVxuICAgICAgICAgIGVyciBpbnN0YW5jZW9mIFVwZ3JhZGVFcnJvciA/IGVyci5tZXNzYWdlIDogJ1VwZ3JhZGUgZmFpbGVkJztcbiAgICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDUwMCwgJ0FjdGl2aXR5IGNvbnRlbnQgY2Fubm90IGJlIHNlcnZlZCcsIHtcbiAgICAgICAgICBjb2RlOiAndXBncmFkZV9mYWlsZWQnLFxuICAgICAgICAgIGRldGFpbCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBzYW5pdGl6ZWQgPSBzYW5pdGl6ZUFjdGl2aXR5RG9jdW1lbnQodXBncmFkZWQuZG9jKTtcblxuICAgICAgLy8gLS0tLSBBbmFseXRpY3Mgc2lkZS1jaGFubmVsIChTNykgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgIC8vIE9SREVSIElTIExPQUQtQkVBUklORzogY2Vuc3VzIEZJUlNULCBhbmQgdGhlIGNhY2hlIHJvdyBpcyB3cml0dGVuIG9ubHlcbiAgICAgIC8vIGlmIGl0IHN1Y2NlZWRlZCAocnVsaW5nIFM3LTkpLlxuICAgICAgLy9cbiAgICAgIC8vIFRoZSBjYWNoZSByb3cgaXMgd2hhdCBtYWtlcyBldmVyeSBsYXRlciByZWFkIGEgSElUIFx1MjAxNCBhbmQgYSBISVQgZG9lcyBub1xuICAgICAgLy8gYW5hbHl0aWNzIHdvcmsgYXQgYWxsLiBTbyB3cml0aW5nIHRoZSBjYWNoZSByb3cgYWZ0ZXIgYSBGQUlMRUQgY2Vuc3VzXG4gICAgICAvLyB3b3VsZCBzdHJhbmQgdGhpcyB2ZXJzaW9uIHdpdGggbm8gY2Vuc3VzIHVudGlsIHRoZSBuZXh0IFNBTklUSVpFUl9SRVZcbiAgICAgIC8vIGJ1bXAsIHdoaWxlIGV2ZXJ5IGNoZWNrIG9uIGl0IGFnZ3JlZ2F0ZWQgYXMgdW5hdHRyaWJ1dGVkLiBTaWxlbnQsIGFuZFxuICAgICAgLy8gcGVybWFuZW50LiBXaXRoaG9sZGluZyB0aGUgY2FjaGUgcm93IGluc3RlYWQgbWVhbnMgdGhlIG5leHQgcmVhZCBpc1xuICAgICAgLy8gYW5vdGhlciBtaXNzIHRoYXQgcmV0cmllcyBib3RoOiB0aGUgZmFpbHVyZSBzZWxmLWhlYWxzLCBhbmQgaXRzIG9ubHlcbiAgICAgIC8vIGNvc3QgaXMgcmVjb21wdXRpbmcgYSBkb2N1bWVudCB3ZSBhbHJlYWR5IGtub3cgaG93IHRvIHJlY29tcHV0ZS5cbiAgICAgIC8vXG4gICAgICAvLyBUaGUgY2Vuc3VzIGl0c2VsZiBpcyB0b3RhbCAobmV2ZXIgdGhyb3dzIFx1MjAxNCBzZWUgVU5LTk9XTl9DRU5TVVNfS0VZKSwgc29cbiAgICAgIC8vIHdoYXQgdGhpcyBvcmRlcmluZyBhY3R1YWxseSBndWFyZHMgYWdhaW5zdCBpcyBhIHRyYW5zaWVudCBEQiBmYWlsdXJlLFxuICAgICAgLy8gd2hpY2ggaXMgZXhhY3RseSB0aGUga2luZCB0aGF0IGEgcmV0cnkgZml4ZXMuXG4gICAgICBsZXQgY2Vuc3VzT2sgPSB0cnVlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBlcnJvcjogY2Vuc3VzRXJyIH0gPSBhd2FpdCBkYi53cml0ZUNlbnN1cyhcbiAgICAgICAgICB2ZXJzaW9uSWQsXG4gICAgICAgICAgY2Vuc3VzT2ZEb2N1bWVudCh1cGdyYWRlZC5kb2MpLFxuICAgICAgICApO1xuICAgICAgICBpZiAoY2Vuc3VzRXJyKSB7XG4gICAgICAgICAgY2Vuc3VzT2sgPSBmYWxzZTtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBjZW5zdXMgd3JpdGUgZmFpbGVkOicsIGNlbnN1c0Vycik7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjZW5zdXNPayA9IGZhbHNlO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBjZW5zdXMgdGhyZXc6JywgZXJyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNlbnN1c09rKSB7XG4gICAgICAgIGNvbnN0IHsgZXJyb3I6IHVwc2VydEVyciB9ID0gYXdhaXQgZGIudXBzZXJ0Q2FjaGUoe1xuICAgICAgICAgIHZlcnNpb25faWQ6IHZlcnNpb25JZCxcbiAgICAgICAgICBzYW5pdGl6ZXJfcmV2OiBTQU5JVElaRVJfUkVWLFxuICAgICAgICAgIHNjaGVtYV92ZXJzaW9uOiB1cGdyYWRlZC5kb2Muc2NoZW1hVmVyc2lvbixcbiAgICAgICAgICBjb250ZW50OiBzYW5pdGl6ZWQsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodXBzZXJ0RXJyKSB7XG4gICAgICAgICAgLy8gTm9uLWZhdGFsOiB0aGUgcmVzcG9uc2UgaXMgYWxyZWFkeSBjb21wdXRlZDsgdGhlIG5leHQgcmVxdWVzdFxuICAgICAgICAgIC8vIHJldHJpZXMuXG4gICAgICAgICAgY29uc29sZS5lcnJvcignW2dldC1hY3Rpdml0eV0gY2FjaGUgdXBzZXJ0IGZhaWxlZDonLCB1cHNlcnRFcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFRoaXMgdmVyc2lvbiBpcyBub3cgY2FjaGVkIHVuZGVyIHRoZSBDVVJSRU5UIHJldiwgc28gYW55IHJvdyBpdFxuICAgICAgICAgIC8vIGhhcyB1bmRlciBhbiBvbGRlciByZXYgaXMgZGVhZCB3ZWlnaHQgbm90aGluZyB3aWxsIGV2ZXIgcmVhZC5cbiAgICAgICAgICBjb25zdCB7IGVycm9yOiBnY0VyciB9ID0gYXdhaXQgZGIuZGVsZXRlU3RhbGVDYWNoZShcbiAgICAgICAgICAgIHZlcnNpb25JZCxcbiAgICAgICAgICAgIFNBTklUSVpFUl9SRVYsXG4gICAgICAgICAgKTtcbiAgICAgICAgICBpZiAoZ2NFcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIHN0YWxlLWNhY2hlIEdDIGZhaWxlZDonLCBnY0Vycik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdXNlcklkID0gand0U3ViKGF1dGhIZWFkZXIpID8/ICdhbm9ueW1vdXMnO1xuICAgIGNvbnN0IHNlcnZlZCA9IGFwcGx5U2VydmVTaHVmZmxlcyhzYW5pdGl6ZWQsIGAke3ZlcnNpb25JZH06JHt1c2VySWR9YCk7XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxuICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBhcGlfdmVyc2lvbjogQVBJX1ZFUlNJT04sXG4gICAgICAgIGFjdGl2aXR5X2lkOiBhY3Rpdml0eUlkLFxuICAgICAgICB2ZXJzaW9uOiB7XG4gICAgICAgICAgaWQ6IHZlcnNpb25JZCxcbiAgICAgICAgICBudW06IHJvdy52ZXJzaW9uX251bSxcbiAgICAgICAgICBzY2hlbWFfdmVyc2lvbjogc2VydmVkLnNjaGVtYVZlcnNpb24sXG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlOiByb3cudGl0bGUsXG4gICAgICAgIGFjdGl2aXR5OiBzZXJ2ZWQsXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgc3RhdHVzOiAyMDAsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAuLi5jb3JzLmNvcnNIZWFkZXJzKHJlcSksXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAvLyBWZXJzaW9uLWtleWVkIFVSTCBcdTIxOTIgaW1tdXRhYmxlLiBwcml2YXRlOiBzdHVkZW50IGNvbnRlbnQgbmV2ZXIgbGFuZHNcbiAgICAgICAgICAvLyBpbiBzaGFyZWQgY2FjaGVzLiBBIHJlcHVibGlzaCBjaGFuZ2VzIHRoZSBVUkwgdmlhIHJlc29sdmUsIHNvIHRoaXNcbiAgICAgICAgICAvLyBuZXZlciBuZWVkcyB0byBleHBpcmUuXG4gICAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAncHJpdmF0ZSwgbWF4LWFnZT0zMTUzNjAwMCwgaW1tdXRhYmxlJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgKTtcbiAgfTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7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TyxHQUFHLFNBQVMsS0FBSztBQUFBLEVBQzVEO0FBQUEsRUFDQSxJQUFJLFVBQVU7QUFDVixXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsT0FBTztBQUFBLEVBQzlEO0FBQUEsRUFDQSxJQUFJLFNBQVM7QUFDVCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsTUFBTTtBQUFBLEVBQzdEO0FBQUEsRUFDQSxJQUFJLFdBQVc7QUFDWCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsUUFBUTtBQUFBLEVBQy9EO0FBQUEsRUFDQSxJQUFJLFNBQVM7QUFDVCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsTUFBTTtBQUFBLEVBQzdEO0FBQUEsRUFDQSxJQUFJLFVBQVU7QUFDVixXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsT0FBTztBQUFBLEVBQzlEO0FBQUEsRUFDQSxJQUFJLFNBQVM7QUFDVCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsTUFBTTtBQUFBLEVBQzdEO0FBQUEsRUFDQSxJQUFJLE9BQU87QUFDUCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsSUFBSTtBQUFBLEVBQzNEO0FBQUEsRUFDQSxJQUFJLFNBQVM7QUFDVCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsTUFBTTtBQUFBLEVBQzdEO0FBQUEsRUFDQSxJQUFJLFdBQVc7QUFDWCxXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsUUFBUTtBQUFBLEVBQy9EO0FBQUEsRUFD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QUFNLEVBQUUsT0FBTyxVQUFVLElBQUksTUFBTSxHQUFHLFlBQVk7QUFBQSxVQUNoRCxZQUFZO0FBQUEsVUFDWixlQUFlO0FBQUEsVUFDZixnQkFBZ0IsU0FBUyxJQUFJO0FBQUEsVUFDN0IsU0FBUztBQUFBLFFBQ1gsQ0FBQztBQUNELFlBQUksV0FBVztBQUdiLGtCQUFRLE1BQU0sdUNBQXVDLFNBQVM7QUFBQSxRQUNoRSxPQUFPO0FBR0wsZ0JBQU0sRUFBRSxPQUFPLE1BQU0sSUFBSSxNQUFNLEdBQUc7QUFBQSxZQUNoQztBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQ0EsY0FBSSxPQUFPO0FBQ1Qsb0JBQVEsTUFBTSx5Q0FBeUMsS0FBSztBQUFBLFVBQzlEO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsVUFBTSxTQUFTLE9BQU8sVUFBVSxLQUFLO0FBQ3JDLFVBQU0sU0FBUyxtQkFBbUIsV0FBVyxHQUFHLFNBQVMsSUFBSSxNQUFNLEVBQUU7QUFFckUsV0FBTyxJQUFJO0FBQUEsTUFDVCxLQUFLLFVBQVU7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLFNBQVM7QUFBQSxVQUNQLElBQUk7QUFBQSxVQUNKLEtBQUssSUFBSTtBQUFBLFVBQ1QsZ0JBQWdCLE9BQU87QUFBQSxRQUN6QjtBQUFBLFFBQ0EsT0FBTyxJQUFJO0FBQUEsUUFDWCxVQUFVO0FBQUEsTUFDWixDQUFDO0FBQUEsTUFDRDtBQUFBLFFBQ0UsUUFBUTtBQUFBLFFBQ1IsU0FBUztBQUFBLFVBQ1AsR0FBRyxLQUFLLFlBQVksR0FBRztBQUFBLFVBQ3ZCLGdCQUFnQjtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBSWhCLGlCQUFpQjtBQUFBLFFBQ25CO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbInV0aWwiLCAib2JqZWN0VXRpbCIsICJlcnJvclV0aWwiLCAiZXJyb3JNYXAiLCAiY3R4IiwgInJlc3VsdCIsICJpc3N1ZXMiLCAiZWxlbWVudHMiLCAicHJvY2Vzc2VkIiwgInJlc3VsdCIsICJyIiwgIlpvZEZpcnN0UGFydHlUeXBlS2luZCIsICJQUk9NUFRfQ0FSUklFUl9UWVBFUyIsICJsb29rc0xpa2VCbG9ja0FycmF5IiwgImNoaWxkQmxvY2tzT2YiLCAidmlzaXQiXQp9Cg==
