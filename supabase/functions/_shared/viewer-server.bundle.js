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
    print: { breakInside: "avoid", treatment: "underline-blanks" },
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
    print: { breakInside: "avoid", treatment: "letter-bank" },
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

// packages/viewer/src/sanitize/promptCarriers.ts
var PROMPT_CARRIER_TYPES = /* @__PURE__ */ new Set([
  "math_inline",
  "math_block"
]);

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
  if (typeof node.type === "string" && PROMPT_CARRIER_TYPES.has(node.type) && Array.isArray(node.prompts)) {
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
function visit(block, inv) {
  const id = typeof block.id === "string" ? block.id : "";
  const type = typeof block.type === "string" ? block.type : "";
  if (!id) return;
  if (Array.isArray(block.solution) && block.solution.length > 0) {
    inv.solutions.push({ blockId: id, solution: block.solution });
  }
  const inBand = [];
  collectInBandKeys(block, inBand, looksLikeBlockArray);
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
  for (const child of childBlocksOf(block)) visit(child, inv);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvZXh0ZXJuYWwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvaGVscGVycy91dGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL1pvZEVycm9yLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2xvY2FsZXMvZW4uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3pvZEAzLjI1Ljc2L25vZGVfbW9kdWxlcy96b2QvdjMvZXJyb3JzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2hlbHBlcnMvcGFyc2VVdGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL2hlbHBlcnMvZXJyb3JVdGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS96b2RAMy4yNS43Ni9ub2RlX21vZHVsZXMvem9kL3YzL3R5cGVzLmpzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvc2l6aW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2ltYWdlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvZ3JhcGgtcHJpbWl0aXZlcy50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9ncmFwaC1maWd1cmUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9pbmxpbmUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvcGFyYWdyYXBoLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2hlYWRpbmcudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9sYWJlbC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9tYXRoLWJsb2NrLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2NhbGxvdXQudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvcHJvYmxlbS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9maWxsLWluLWJsYW5rLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2xpc3QudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvaW50ZXJhY3RpdmUtZ3JhcGgudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvbXVsdGlwbGUtY2hvaWNlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL21hdGNoaW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL29yZGVyaW5nLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL251bWJlci1saW5lLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2RhdGEtcGxvdC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9sZWFybmluZy1vYmplY3RpdmVzLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL3dvcmtlZC1leGFtcGxlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL2ZhZGVkLXdvcmtlZC1leGFtcGxlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvYmxvY2tzL3NlbGYtZXhwbGFuYXRpb24udHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hL3NyYy9ibG9ja3MvZnJlZS1yZXNwb25zZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2Jsb2Nrcy9pbmRleC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2xheW91dC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL2RvY3VtZW50LnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYS9zcmMvdXBncmFkZS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWEvc3JjL3N1Ym1pc3Npb24udHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9yZWdpc3RyeS9yZWdpc3RyeS50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3Nhbml0aXplL3Byb21wdENhcnJpZXJzLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvc2FuaXRpemUvc2FuaXRpemUudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9zYW5pdGl6ZS9zaHVmZmxlLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvY29udGFpbmVyL2Jsb2NrSW5kZXgudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9zZXJ2ZXIvZ3JhZGluZy93YWxrLnRzIiwgIi4uLy4uLy4uL3BhY2thZ2VzL3ZpZXdlci9zcmMvY2Vuc3VzL2NlbnN1cy50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3Nhbml0aXplL3NlcnZlU2VlZC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3NlcnZlci9qd3QudHMiLCAiLi4vLi4vLi4vcGFja2FnZXMvdmlld2VyL3NyYy9zZXJ2ZXIvdXVpZC50cyIsICIuLi8uLi8uLi9wYWNrYWdlcy92aWV3ZXIvc3JjL3NlcnZlci9nZXQtYWN0aXZpdHktaGFuZGxlci50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0ICogZnJvbSBcIi4vZXJyb3JzLmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9oZWxwZXJzL3BhcnNlVXRpbC5qc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vaGVscGVycy90eXBlQWxpYXNlcy5qc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vaGVscGVycy91dGlsLmpzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi90eXBlcy5qc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vWm9kRXJyb3IuanNcIjtcbiIsICJleHBvcnQgdmFyIHV0aWw7XG4oZnVuY3Rpb24gKHV0aWwpIHtcbiAgICB1dGlsLmFzc2VydEVxdWFsID0gKF8pID0+IHsgfTtcbiAgICBmdW5jdGlvbiBhc3NlcnRJcyhfYXJnKSB7IH1cbiAgICB1dGlsLmFzc2VydElzID0gYXNzZXJ0SXM7XG4gICAgZnVuY3Rpb24gYXNzZXJ0TmV2ZXIoX3gpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgfVxuICAgIHV0aWwuYXNzZXJ0TmV2ZXIgPSBhc3NlcnROZXZlcjtcbiAgICB1dGlsLmFycmF5VG9FbnVtID0gKGl0ZW1zKSA9PiB7XG4gICAgICAgIGNvbnN0IG9iaiA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcbiAgICAgICAgICAgIG9ialtpdGVtXSA9IGl0ZW07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9O1xuICAgIHV0aWwuZ2V0VmFsaWRFbnVtVmFsdWVzID0gKG9iaikgPT4ge1xuICAgICAgICBjb25zdCB2YWxpZEtleXMgPSB1dGlsLm9iamVjdEtleXMob2JqKS5maWx0ZXIoKGspID0+IHR5cGVvZiBvYmpbb2JqW2tdXSAhPT0gXCJudW1iZXJcIik7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkID0ge307XG4gICAgICAgIGZvciAoY29uc3QgayBvZiB2YWxpZEtleXMpIHtcbiAgICAgICAgICAgIGZpbHRlcmVkW2tdID0gb2JqW2tdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1dGlsLm9iamVjdFZhbHVlcyhmaWx0ZXJlZCk7XG4gICAgfTtcbiAgICB1dGlsLm9iamVjdFZhbHVlcyA9IChvYmopID0+IHtcbiAgICAgICAgcmV0dXJuIHV0aWwub2JqZWN0S2V5cyhvYmopLm1hcChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIG9ialtlXTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICB1dGlsLm9iamVjdEtleXMgPSB0eXBlb2YgT2JqZWN0LmtleXMgPT09IFwiZnVuY3Rpb25cIiAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhbi9iYW5cbiAgICAgICAgPyAob2JqKSA9PiBPYmplY3Qua2V5cyhvYmopIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFuL2JhblxuICAgICAgICA6IChvYmplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGtleXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG9iamVjdCkge1xuICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBrZXlzO1xuICAgICAgICB9O1xuICAgIHV0aWwuZmluZCA9IChhcnIsIGNoZWNrZXIpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGFycikge1xuICAgICAgICAgICAgaWYgKGNoZWNrZXIoaXRlbSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIHV0aWwuaXNJbnRlZ2VyID0gdHlwZW9mIE51bWJlci5pc0ludGVnZXIgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICA/ICh2YWwpID0+IE51bWJlci5pc0ludGVnZXIodmFsKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhbi9iYW5cbiAgICAgICAgOiAodmFsKSA9PiB0eXBlb2YgdmFsID09PSBcIm51bWJlclwiICYmIE51bWJlci5pc0Zpbml0ZSh2YWwpICYmIE1hdGguZmxvb3IodmFsKSA9PT0gdmFsO1xuICAgIGZ1bmN0aW9uIGpvaW5WYWx1ZXMoYXJyYXksIHNlcGFyYXRvciA9IFwiIHwgXCIpIHtcbiAgICAgICAgcmV0dXJuIGFycmF5Lm1hcCgodmFsKSA9PiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIiA/IGAnJHt2YWx9J2AgOiB2YWwpKS5qb2luKHNlcGFyYXRvcik7XG4gICAgfVxuICAgIHV0aWwuam9pblZhbHVlcyA9IGpvaW5WYWx1ZXM7XG4gICAgdXRpbC5qc29uU3RyaW5naWZ5UmVwbGFjZXIgPSAoXywgdmFsdWUpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJiaWdpbnRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG59KSh1dGlsIHx8ICh1dGlsID0ge30pKTtcbmV4cG9ydCB2YXIgb2JqZWN0VXRpbDtcbihmdW5jdGlvbiAob2JqZWN0VXRpbCkge1xuICAgIG9iamVjdFV0aWwubWVyZ2VTaGFwZXMgPSAoZmlyc3QsIHNlY29uZCkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uZmlyc3QsXG4gICAgICAgICAgICAuLi5zZWNvbmQsIC8vIHNlY29uZCBvdmVyd3JpdGVzIGZpcnN0XG4gICAgICAgIH07XG4gICAgfTtcbn0pKG9iamVjdFV0aWwgfHwgKG9iamVjdFV0aWwgPSB7fSkpO1xuZXhwb3J0IGNvbnN0IFpvZFBhcnNlZFR5cGUgPSB1dGlsLmFycmF5VG9FbnVtKFtcbiAgICBcInN0cmluZ1wiLFxuICAgIFwibmFuXCIsXG4gICAgXCJudW1iZXJcIixcbiAgICBcImludGVnZXJcIixcbiAgICBcImZsb2F0XCIsXG4gICAgXCJib29sZWFuXCIsXG4gICAgXCJkYXRlXCIsXG4gICAgXCJiaWdpbnRcIixcbiAgICBcInN5bWJvbFwiLFxuICAgIFwiZnVuY3Rpb25cIixcbiAgICBcInVuZGVmaW5lZFwiLFxuICAgIFwibnVsbFwiLFxuICAgIFwiYXJyYXlcIixcbiAgICBcIm9iamVjdFwiLFxuICAgIFwidW5rbm93blwiLFxuICAgIFwicHJvbWlzZVwiLFxuICAgIFwidm9pZFwiLFxuICAgIFwibmV2ZXJcIixcbiAgICBcIm1hcFwiLFxuICAgIFwic2V0XCIsXG5dKTtcbmV4cG9ydCBjb25zdCBnZXRQYXJzZWRUeXBlID0gKGRhdGEpID0+IHtcbiAgICBjb25zdCB0ID0gdHlwZW9mIGRhdGE7XG4gICAgc3dpdGNoICh0KSB7XG4gICAgICAgIGNhc2UgXCJ1bmRlZmluZWRcIjpcbiAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLnVuZGVmaW5lZDtcbiAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuc3RyaW5nO1xuICAgICAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICAgICAgICByZXR1cm4gTnVtYmVyLmlzTmFOKGRhdGEpID8gWm9kUGFyc2VkVHlwZS5uYW4gOiBab2RQYXJzZWRUeXBlLm51bWJlcjtcbiAgICAgICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLmJvb2xlYW47XG4gICAgICAgIGNhc2UgXCJmdW5jdGlvblwiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuZnVuY3Rpb247XG4gICAgICAgIGNhc2UgXCJiaWdpbnRcIjpcbiAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLmJpZ2ludDtcbiAgICAgICAgY2FzZSBcInN5bWJvbFwiOlxuICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuc3ltYm9sO1xuICAgICAgICBjYXNlIFwib2JqZWN0XCI6XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLmFycmF5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5udWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGEudGhlbiAmJiB0eXBlb2YgZGF0YS50aGVuID09PSBcImZ1bmN0aW9uXCIgJiYgZGF0YS5jYXRjaCAmJiB0eXBlb2YgZGF0YS5jYXRjaCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUucHJvbWlzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgTWFwICE9PSBcInVuZGVmaW5lZFwiICYmIGRhdGEgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gWm9kUGFyc2VkVHlwZS5tYXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIFNldCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuc2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBEYXRlICE9PSBcInVuZGVmaW5lZFwiICYmIGRhdGEgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFpvZFBhcnNlZFR5cGUuZGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLm9iamVjdDtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBab2RQYXJzZWRUeXBlLnVua25vd247XG4gICAgfVxufTtcbiIsICJpbXBvcnQgeyB1dGlsIH0gZnJvbSBcIi4vaGVscGVycy91dGlsLmpzXCI7XG5leHBvcnQgY29uc3QgWm9kSXNzdWVDb2RlID0gdXRpbC5hcnJheVRvRW51bShbXG4gICAgXCJpbnZhbGlkX3R5cGVcIixcbiAgICBcImludmFsaWRfbGl0ZXJhbFwiLFxuICAgIFwiY3VzdG9tXCIsXG4gICAgXCJpbnZhbGlkX3VuaW9uXCIsXG4gICAgXCJpbnZhbGlkX3VuaW9uX2Rpc2NyaW1pbmF0b3JcIixcbiAgICBcImludmFsaWRfZW51bV92YWx1ZVwiLFxuICAgIFwidW5yZWNvZ25pemVkX2tleXNcIixcbiAgICBcImludmFsaWRfYXJndW1lbnRzXCIsXG4gICAgXCJpbnZhbGlkX3JldHVybl90eXBlXCIsXG4gICAgXCJpbnZhbGlkX2RhdGVcIixcbiAgICBcImludmFsaWRfc3RyaW5nXCIsXG4gICAgXCJ0b29fc21hbGxcIixcbiAgICBcInRvb19iaWdcIixcbiAgICBcImludmFsaWRfaW50ZXJzZWN0aW9uX3R5cGVzXCIsXG4gICAgXCJub3RfbXVsdGlwbGVfb2ZcIixcbiAgICBcIm5vdF9maW5pdGVcIixcbl0pO1xuZXhwb3J0IGNvbnN0IHF1b3RlbGVzc0pzb24gPSAob2JqKSA9PiB7XG4gICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KG9iaiwgbnVsbCwgMik7XG4gICAgcmV0dXJuIGpzb24ucmVwbGFjZSgvXCIoW15cIl0rKVwiOi9nLCBcIiQxOlwiKTtcbn07XG5leHBvcnQgY2xhc3MgWm9kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgZ2V0IGVycm9ycygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNzdWVzO1xuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcihpc3N1ZXMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5pc3N1ZXMgPSBbXTtcbiAgICAgICAgdGhpcy5hZGRJc3N1ZSA9IChzdWIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaXNzdWVzID0gWy4uLnRoaXMuaXNzdWVzLCBzdWJdO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFkZElzc3VlcyA9IChzdWJzID0gW10pID0+IHtcbiAgICAgICAgICAgIHRoaXMuaXNzdWVzID0gWy4uLnRoaXMuaXNzdWVzLCAuLi5zdWJzXTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgYWN0dWFsUHJvdG8gPSBuZXcudGFyZ2V0LnByb3RvdHlwZTtcbiAgICAgICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGJhbi9iYW5cbiAgICAgICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBhY3R1YWxQcm90byk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9fcHJvdG9fXyA9IGFjdHVhbFByb3RvO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubmFtZSA9IFwiWm9kRXJyb3JcIjtcbiAgICAgICAgdGhpcy5pc3N1ZXMgPSBpc3N1ZXM7XG4gICAgfVxuICAgIGZvcm1hdChfbWFwcGVyKSB7XG4gICAgICAgIGNvbnN0IG1hcHBlciA9IF9tYXBwZXIgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChpc3N1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc3N1ZS5tZXNzYWdlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZmllbGRFcnJvcnMgPSB7IF9lcnJvcnM6IFtdIH07XG4gICAgICAgIGNvbnN0IHByb2Nlc3NFcnJvciA9IChlcnJvcikgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCBpc3N1ZSBvZiBlcnJvci5pc3N1ZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNzdWUuY29kZSA9PT0gXCJpbnZhbGlkX3VuaW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNzdWUudW5pb25FcnJvcnMubWFwKHByb2Nlc3NFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLmNvZGUgPT09IFwiaW52YWxpZF9yZXR1cm5fdHlwZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NFcnJvcihpc3N1ZS5yZXR1cm5UeXBlRXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfYXJndW1lbnRzXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0Vycm9yKGlzc3VlLmFyZ3VtZW50c0Vycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUucGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGRFcnJvcnMuX2Vycm9ycy5wdXNoKG1hcHBlcihpc3N1ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnIgPSBmaWVsZEVycm9ycztcbiAgICAgICAgICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IGlzc3VlLnBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbCA9IGlzc3VlLnBhdGhbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXJtaW5hbCA9IGkgPT09IGlzc3VlLnBhdGgubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGVybWluYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyW2VsXSA9IGN1cnJbZWxdIHx8IHsgX2Vycm9yczogW10gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAodHlwZW9mIGVsID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBjdXJyW2VsXSA9IGN1cnJbZWxdIHx8IHsgX2Vycm9yczogW10gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHR5cGVvZiBlbCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgY29uc3QgZXJyb3JBcnJheTogYW55ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBlcnJvckFycmF5Ll9lcnJvcnMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGN1cnJbZWxdID0gY3VycltlbF0gfHwgZXJyb3JBcnJheTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyW2VsXSA9IGN1cnJbZWxdIHx8IHsgX2Vycm9yczogW10gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyW2VsXS5fZXJyb3JzLnB1c2gobWFwcGVyKGlzc3VlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyID0gY3VycltlbF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHByb2Nlc3NFcnJvcih0aGlzKTtcbiAgICAgICAgcmV0dXJuIGZpZWxkRXJyb3JzO1xuICAgIH1cbiAgICBzdGF0aWMgYXNzZXJ0KHZhbHVlKSB7XG4gICAgICAgIGlmICghKHZhbHVlIGluc3RhbmNlb2YgWm9kRXJyb3IpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vdCBhIFpvZEVycm9yOiAke3ZhbHVlfWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tZXNzYWdlO1xuICAgIH1cbiAgICBnZXQgbWVzc2FnZSgpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMuaXNzdWVzLCB1dGlsLmpzb25TdHJpbmdpZnlSZXBsYWNlciwgMik7XG4gICAgfVxuICAgIGdldCBpc0VtcHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc3N1ZXMubGVuZ3RoID09PSAwO1xuICAgIH1cbiAgICBmbGF0dGVuKG1hcHBlciA9IChpc3N1ZSkgPT4gaXNzdWUubWVzc2FnZSkge1xuICAgICAgICBjb25zdCBmaWVsZEVycm9ycyA9IHt9O1xuICAgICAgICBjb25zdCBmb3JtRXJyb3JzID0gW107XG4gICAgICAgIGZvciAoY29uc3Qgc3ViIG9mIHRoaXMuaXNzdWVzKSB7XG4gICAgICAgICAgICBpZiAoc3ViLnBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpcnN0RWwgPSBzdWIucGF0aFswXTtcbiAgICAgICAgICAgICAgICBmaWVsZEVycm9yc1tmaXJzdEVsXSA9IGZpZWxkRXJyb3JzW2ZpcnN0RWxdIHx8IFtdO1xuICAgICAgICAgICAgICAgIGZpZWxkRXJyb3JzW2ZpcnN0RWxdLnB1c2gobWFwcGVyKHN1YikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9ybUVycm9ycy5wdXNoKG1hcHBlcihzdWIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBmb3JtRXJyb3JzLCBmaWVsZEVycm9ycyB9O1xuICAgIH1cbiAgICBnZXQgZm9ybUVycm9ycygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxhdHRlbigpO1xuICAgIH1cbn1cblpvZEVycm9yLmNyZWF0ZSA9IChpc3N1ZXMpID0+IHtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBab2RFcnJvcihpc3N1ZXMpO1xuICAgIHJldHVybiBlcnJvcjtcbn07XG4iLCAiaW1wb3J0IHsgWm9kSXNzdWVDb2RlIH0gZnJvbSBcIi4uL1pvZEVycm9yLmpzXCI7XG5pbXBvcnQgeyB1dGlsLCBab2RQYXJzZWRUeXBlIH0gZnJvbSBcIi4uL2hlbHBlcnMvdXRpbC5qc1wiO1xuY29uc3QgZXJyb3JNYXAgPSAoaXNzdWUsIF9jdHgpID0+IHtcbiAgICBsZXQgbWVzc2FnZTtcbiAgICBzd2l0Y2ggKGlzc3VlLmNvZGUpIHtcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlOlxuICAgICAgICAgICAgaWYgKGlzc3VlLnJlY2VpdmVkID09PSBab2RQYXJzZWRUeXBlLnVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIlJlcXVpcmVkXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEV4cGVjdGVkICR7aXNzdWUuZXhwZWN0ZWR9LCByZWNlaXZlZCAke2lzc3VlLnJlY2VpdmVkfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9saXRlcmFsOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGxpdGVyYWwgdmFsdWUsIGV4cGVjdGVkICR7SlNPTi5zdHJpbmdpZnkoaXNzdWUuZXhwZWN0ZWQsIHV0aWwuanNvblN0cmluZ2lmeVJlcGxhY2VyKX1gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLnVucmVjb2duaXplZF9rZXlzOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBVbnJlY29nbml6ZWQga2V5KHMpIGluIG9iamVjdDogJHt1dGlsLmpvaW5WYWx1ZXMoaXNzdWUua2V5cywgXCIsIFwiKX1gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmludmFsaWRfdW5pb246XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgaW5wdXRgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmludmFsaWRfdW5pb25fZGlzY3JpbWluYXRvcjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBkaXNjcmltaW5hdG9yIHZhbHVlLiBFeHBlY3RlZCAke3V0aWwuam9pblZhbHVlcyhpc3N1ZS5vcHRpb25zKX1gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmludmFsaWRfZW51bV92YWx1ZTpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBlbnVtIHZhbHVlLiBFeHBlY3RlZCAke3V0aWwuam9pblZhbHVlcyhpc3N1ZS5vcHRpb25zKX0sIHJlY2VpdmVkICcke2lzc3VlLnJlY2VpdmVkfSdgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmludmFsaWRfYXJndW1lbnRzOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGZ1bmN0aW9uIGFyZ3VtZW50c2A7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9yZXR1cm5fdHlwZTpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBmdW5jdGlvbiByZXR1cm4gdHlwZWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUuaW52YWxpZF9kYXRlOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnZhbGlkIGRhdGVgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nOlxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpc3N1ZS52YWxpZGF0aW9uID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKFwiaW5jbHVkZXNcIiBpbiBpc3N1ZS52YWxpZGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dDogbXVzdCBpbmNsdWRlIFwiJHtpc3N1ZS52YWxpZGF0aW9uLmluY2x1ZGVzfVwiYDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpc3N1ZS52YWxpZGF0aW9uLnBvc2l0aW9uID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gYCR7bWVzc2FnZX0gYXQgb25lIG9yIG1vcmUgcG9zaXRpb25zIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byAke2lzc3VlLnZhbGlkYXRpb24ucG9zaXRpb259YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChcInN0YXJ0c1dpdGhcIiBpbiBpc3N1ZS52YWxpZGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgSW52YWxpZCBpbnB1dDogbXVzdCBzdGFydCB3aXRoIFwiJHtpc3N1ZS52YWxpZGF0aW9uLnN0YXJ0c1dpdGh9XCJgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChcImVuZHNXaXRoXCIgaW4gaXNzdWUudmFsaWRhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgaW5wdXQ6IG11c3QgZW5kIHdpdGggXCIke2lzc3VlLnZhbGlkYXRpb24uZW5kc1dpdGh9XCJgO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXRpbC5hc3NlcnROZXZlcihpc3N1ZS52YWxpZGF0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS52YWxpZGF0aW9uICE9PSBcInJlZ2V4XCIpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgJHtpc3N1ZS52YWxpZGF0aW9ufWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gXCJJbnZhbGlkXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUudG9vX3NtYWxsOlxuICAgICAgICAgICAgaWYgKGlzc3VlLnR5cGUgPT09IFwiYXJyYXlcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYEFycmF5IG11c3QgY29udGFpbiAke2lzc3VlLmV4YWN0ID8gXCJleGFjdGx5XCIgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgYXQgbGVhc3RgIDogYG1vcmUgdGhhbmB9ICR7aXNzdWUubWluaW11bX0gZWxlbWVudChzKWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcInN0cmluZ1wiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgU3RyaW5nIG11c3QgY29udGFpbiAke2lzc3VlLmV4YWN0ID8gXCJleGFjdGx5XCIgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgYXQgbGVhc3RgIDogYG92ZXJgfSAke2lzc3VlLm1pbmltdW19IGNoYXJhY3RlcihzKWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcIm51bWJlclwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgTnVtYmVyIG11c3QgYmUgJHtpc3N1ZS5leGFjdCA/IGBleGFjdGx5IGVxdWFsIHRvIGAgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIGAgOiBgZ3JlYXRlciB0aGFuIGB9JHtpc3N1ZS5taW5pbXVtfWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcImJpZ2ludFwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgTnVtYmVyIG11c3QgYmUgJHtpc3N1ZS5leGFjdCA/IGBleGFjdGx5IGVxdWFsIHRvIGAgOiBpc3N1ZS5pbmNsdXNpdmUgPyBgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIGAgOiBgZ3JlYXRlciB0aGFuIGB9JHtpc3N1ZS5taW5pbXVtfWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcImRhdGVcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYERhdGUgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHkgZXF1YWwgdG8gYCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gYCA6IGBncmVhdGVyIHRoYW4gYH0ke25ldyBEYXRlKE51bWJlcihpc3N1ZS5taW5pbXVtKSl9YDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gXCJJbnZhbGlkIGlucHV0XCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUudG9vX2JpZzpcbiAgICAgICAgICAgIGlmIChpc3N1ZS50eXBlID09PSBcImFycmF5XCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBBcnJheSBtdXN0IGNvbnRhaW4gJHtpc3N1ZS5leGFjdCA/IGBleGFjdGx5YCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBhdCBtb3N0YCA6IGBsZXNzIHRoYW5gfSAke2lzc3VlLm1heGltdW19IGVsZW1lbnQocylgO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJzdHJpbmdcIilcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYFN0cmluZyBtdXN0IGNvbnRhaW4gJHtpc3N1ZS5leGFjdCA/IGBleGFjdGx5YCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBhdCBtb3N0YCA6IGB1bmRlcmB9ICR7aXNzdWUubWF4aW11bX0gY2hhcmFjdGVyKHMpYDtcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLnR5cGUgPT09IFwibnVtYmVyXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBOdW1iZXIgbXVzdCBiZSAke2lzc3VlLmV4YWN0ID8gYGV4YWN0bHlgIDogaXNzdWUuaW5jbHVzaXZlID8gYGxlc3MgdGhhbiBvciBlcXVhbCB0b2AgOiBgbGVzcyB0aGFuYH0gJHtpc3N1ZS5tYXhpbXVtfWA7XG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS50eXBlID09PSBcImJpZ2ludFwiKVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgQmlnSW50IG11c3QgYmUgJHtpc3N1ZS5leGFjdCA/IGBleGFjdGx5YCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBsZXNzIHRoYW4gb3IgZXF1YWwgdG9gIDogYGxlc3MgdGhhbmB9ICR7aXNzdWUubWF4aW11bX1gO1xuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUudHlwZSA9PT0gXCJkYXRlXCIpXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBEYXRlIG11c3QgYmUgJHtpc3N1ZS5leGFjdCA/IGBleGFjdGx5YCA6IGlzc3VlLmluY2x1c2l2ZSA/IGBzbWFsbGVyIHRoYW4gb3IgZXF1YWwgdG9gIDogYHNtYWxsZXIgdGhhbmB9ICR7bmV3IERhdGUoTnVtYmVyKGlzc3VlLm1heGltdW0pKX1gO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkludmFsaWQgaW5wdXRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5jdXN0b206XG4gICAgICAgICAgICBtZXNzYWdlID0gYEludmFsaWQgaW5wdXRgO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgWm9kSXNzdWVDb2RlLmludmFsaWRfaW50ZXJzZWN0aW9uX3R5cGVzOlxuICAgICAgICAgICAgbWVzc2FnZSA9IGBJbnRlcnNlY3Rpb24gcmVzdWx0cyBjb3VsZCBub3QgYmUgbWVyZ2VkYDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFpvZElzc3VlQ29kZS5ub3RfbXVsdGlwbGVfb2Y6XG4gICAgICAgICAgICBtZXNzYWdlID0gYE51bWJlciBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgJHtpc3N1ZS5tdWx0aXBsZU9mfWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBab2RJc3N1ZUNvZGUubm90X2Zpbml0ZTpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIk51bWJlciBtdXN0IGJlIGZpbml0ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gX2N0eC5kZWZhdWx0RXJyb3I7XG4gICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGlzc3VlKTtcbiAgICB9XG4gICAgcmV0dXJuIHsgbWVzc2FnZSB9O1xufTtcbmV4cG9ydCBkZWZhdWx0IGVycm9yTWFwO1xuIiwgImltcG9ydCBkZWZhdWx0RXJyb3JNYXAgZnJvbSBcIi4vbG9jYWxlcy9lbi5qc1wiO1xubGV0IG92ZXJyaWRlRXJyb3JNYXAgPSBkZWZhdWx0RXJyb3JNYXA7XG5leHBvcnQgeyBkZWZhdWx0RXJyb3JNYXAgfTtcbmV4cG9ydCBmdW5jdGlvbiBzZXRFcnJvck1hcChtYXApIHtcbiAgICBvdmVycmlkZUVycm9yTWFwID0gbWFwO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldEVycm9yTWFwKCkge1xuICAgIHJldHVybiBvdmVycmlkZUVycm9yTWFwO1xufVxuIiwgImltcG9ydCB7IGdldEVycm9yTWFwIH0gZnJvbSBcIi4uL2Vycm9ycy5qc1wiO1xuaW1wb3J0IGRlZmF1bHRFcnJvck1hcCBmcm9tIFwiLi4vbG9jYWxlcy9lbi5qc1wiO1xuZXhwb3J0IGNvbnN0IG1ha2VJc3N1ZSA9IChwYXJhbXMpID0+IHtcbiAgICBjb25zdCB7IGRhdGEsIHBhdGgsIGVycm9yTWFwcywgaXNzdWVEYXRhIH0gPSBwYXJhbXM7XG4gICAgY29uc3QgZnVsbFBhdGggPSBbLi4ucGF0aCwgLi4uKGlzc3VlRGF0YS5wYXRoIHx8IFtdKV07XG4gICAgY29uc3QgZnVsbElzc3VlID0ge1xuICAgICAgICAuLi5pc3N1ZURhdGEsXG4gICAgICAgIHBhdGg6IGZ1bGxQYXRoLFxuICAgIH07XG4gICAgaWYgKGlzc3VlRGF0YS5tZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLmlzc3VlRGF0YSxcbiAgICAgICAgICAgIHBhdGg6IGZ1bGxQYXRoLFxuICAgICAgICAgICAgbWVzc2FnZTogaXNzdWVEYXRhLm1lc3NhZ2UsXG4gICAgICAgIH07XG4gICAgfVxuICAgIGxldCBlcnJvck1lc3NhZ2UgPSBcIlwiO1xuICAgIGNvbnN0IG1hcHMgPSBlcnJvck1hcHNcbiAgICAgICAgLmZpbHRlcigobSkgPT4gISFtKVxuICAgICAgICAuc2xpY2UoKVxuICAgICAgICAucmV2ZXJzZSgpO1xuICAgIGZvciAoY29uc3QgbWFwIG9mIG1hcHMpIHtcbiAgICAgICAgZXJyb3JNZXNzYWdlID0gbWFwKGZ1bGxJc3N1ZSwgeyBkYXRhLCBkZWZhdWx0RXJyb3I6IGVycm9yTWVzc2FnZSB9KS5tZXNzYWdlO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5pc3N1ZURhdGEsXG4gICAgICAgIHBhdGg6IGZ1bGxQYXRoLFxuICAgICAgICBtZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgfTtcbn07XG5leHBvcnQgY29uc3QgRU1QVFlfUEFUSCA9IFtdO1xuZXhwb3J0IGZ1bmN0aW9uIGFkZElzc3VlVG9Db250ZXh0KGN0eCwgaXNzdWVEYXRhKSB7XG4gICAgY29uc3Qgb3ZlcnJpZGVNYXAgPSBnZXRFcnJvck1hcCgpO1xuICAgIGNvbnN0IGlzc3VlID0gbWFrZUlzc3VlKHtcbiAgICAgICAgaXNzdWVEYXRhOiBpc3N1ZURhdGEsXG4gICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgZXJyb3JNYXBzOiBbXG4gICAgICAgICAgICBjdHguY29tbW9uLmNvbnRleHR1YWxFcnJvck1hcCwgLy8gY29udGV4dHVhbCBlcnJvciBtYXAgaXMgZmlyc3QgcHJpb3JpdHlcbiAgICAgICAgICAgIGN0eC5zY2hlbWFFcnJvck1hcCwgLy8gdGhlbiBzY2hlbWEtYm91bmQgbWFwIGlmIGF2YWlsYWJsZVxuICAgICAgICAgICAgb3ZlcnJpZGVNYXAsIC8vIHRoZW4gZ2xvYmFsIG92ZXJyaWRlIG1hcFxuICAgICAgICAgICAgb3ZlcnJpZGVNYXAgPT09IGRlZmF1bHRFcnJvck1hcCA/IHVuZGVmaW5lZCA6IGRlZmF1bHRFcnJvck1hcCwgLy8gdGhlbiBnbG9iYWwgZGVmYXVsdCBtYXBcbiAgICAgICAgXS5maWx0ZXIoKHgpID0+ICEheCksXG4gICAgfSk7XG4gICAgY3R4LmNvbW1vbi5pc3N1ZXMucHVzaChpc3N1ZSk7XG59XG5leHBvcnQgY2xhc3MgUGFyc2VTdGF0dXMge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnZhbHVlID0gXCJ2YWxpZFwiO1xuICAgIH1cbiAgICBkaXJ0eSgpIHtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgPT09IFwidmFsaWRcIilcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBcImRpcnR5XCI7XG4gICAgfVxuICAgIGFib3J0KCkge1xuICAgICAgICBpZiAodGhpcy52YWx1ZSAhPT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gXCJhYm9ydGVkXCI7XG4gICAgfVxuICAgIHN0YXRpYyBtZXJnZUFycmF5KHN0YXR1cywgcmVzdWx0cykge1xuICAgICAgICBjb25zdCBhcnJheVZhbHVlID0gW107XG4gICAgICAgIGZvciAoY29uc3QgcyBvZiByZXN1bHRzKSB7XG4gICAgICAgICAgICBpZiAocy5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgaWYgKHMuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICBhcnJheVZhbHVlLnB1c2gocy52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBhcnJheVZhbHVlIH07XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBtZXJnZU9iamVjdEFzeW5jKHN0YXR1cywgcGFpcnMpIHtcbiAgICAgICAgY29uc3Qgc3luY1BhaXJzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgcGFpciBvZiBwYWlycykge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgcGFpci5rZXk7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IHBhaXIudmFsdWU7XG4gICAgICAgICAgICBzeW5jUGFpcnMucHVzaCh7XG4gICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFBhcnNlU3RhdHVzLm1lcmdlT2JqZWN0U3luYyhzdGF0dXMsIHN5bmNQYWlycyk7XG4gICAgfVxuICAgIHN0YXRpYyBtZXJnZU9iamVjdFN5bmMoc3RhdHVzLCBwYWlycykge1xuICAgICAgICBjb25zdCBmaW5hbE9iamVjdCA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHsga2V5LCB2YWx1ZSB9ID0gcGFpcjtcbiAgICAgICAgICAgIGlmIChrZXkuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIGlmIChrZXkudmFsdWUgIT09IFwiX19wcm90b19fXCIgJiYgKHR5cGVvZiB2YWx1ZS52YWx1ZSAhPT0gXCJ1bmRlZmluZWRcIiB8fCBwYWlyLmFsd2F5c1NldCkpIHtcbiAgICAgICAgICAgICAgICBmaW5hbE9iamVjdFtrZXkudmFsdWVdID0gdmFsdWUudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBmaW5hbE9iamVjdCB9O1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBJTlZBTElEID0gT2JqZWN0LmZyZWV6ZSh7XG4gICAgc3RhdHVzOiBcImFib3J0ZWRcIixcbn0pO1xuZXhwb3J0IGNvbnN0IERJUlRZID0gKHZhbHVlKSA9PiAoeyBzdGF0dXM6IFwiZGlydHlcIiwgdmFsdWUgfSk7XG5leHBvcnQgY29uc3QgT0sgPSAodmFsdWUpID0+ICh7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZSB9KTtcbmV4cG9ydCBjb25zdCBpc0Fib3J0ZWQgPSAoeCkgPT4geC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiO1xuZXhwb3J0IGNvbnN0IGlzRGlydHkgPSAoeCkgPT4geC5zdGF0dXMgPT09IFwiZGlydHlcIjtcbmV4cG9ydCBjb25zdCBpc1ZhbGlkID0gKHgpID0+IHguc3RhdHVzID09PSBcInZhbGlkXCI7XG5leHBvcnQgY29uc3QgaXNBc3luYyA9ICh4KSA9PiB0eXBlb2YgUHJvbWlzZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiB4IGluc3RhbmNlb2YgUHJvbWlzZTtcbiIsICJleHBvcnQgdmFyIGVycm9yVXRpbDtcbihmdW5jdGlvbiAoZXJyb3JVdGlsKSB7XG4gICAgZXJyb3JVdGlsLmVyclRvT2JqID0gKG1lc3NhZ2UpID0+IHR5cGVvZiBtZXNzYWdlID09PSBcInN0cmluZ1wiID8geyBtZXNzYWdlIH0gOiBtZXNzYWdlIHx8IHt9O1xuICAgIC8vIGJpb21lLWlnbm9yZSBsaW50OlxuICAgIGVycm9yVXRpbC50b1N0cmluZyA9IChtZXNzYWdlKSA9PiB0eXBlb2YgbWVzc2FnZSA9PT0gXCJzdHJpbmdcIiA/IG1lc3NhZ2UgOiBtZXNzYWdlPy5tZXNzYWdlO1xufSkoZXJyb3JVdGlsIHx8IChlcnJvclV0aWwgPSB7fSkpO1xuIiwgImltcG9ydCB7IFpvZEVycm9yLCBab2RJc3N1ZUNvZGUsIH0gZnJvbSBcIi4vWm9kRXJyb3IuanNcIjtcbmltcG9ydCB7IGRlZmF1bHRFcnJvck1hcCwgZ2V0RXJyb3JNYXAgfSBmcm9tIFwiLi9lcnJvcnMuanNcIjtcbmltcG9ydCB7IGVycm9yVXRpbCB9IGZyb20gXCIuL2hlbHBlcnMvZXJyb3JVdGlsLmpzXCI7XG5pbXBvcnQgeyBESVJUWSwgSU5WQUxJRCwgT0ssIFBhcnNlU3RhdHVzLCBhZGRJc3N1ZVRvQ29udGV4dCwgaXNBYm9ydGVkLCBpc0FzeW5jLCBpc0RpcnR5LCBpc1ZhbGlkLCBtYWtlSXNzdWUsIH0gZnJvbSBcIi4vaGVscGVycy9wYXJzZVV0aWwuanNcIjtcbmltcG9ydCB7IHV0aWwsIFpvZFBhcnNlZFR5cGUsIGdldFBhcnNlZFR5cGUgfSBmcm9tIFwiLi9oZWxwZXJzL3V0aWwuanNcIjtcbmNsYXNzIFBhcnNlSW5wdXRMYXp5UGF0aCB7XG4gICAgY29uc3RydWN0b3IocGFyZW50LCB2YWx1ZSwgcGF0aCwga2V5KSB7XG4gICAgICAgIHRoaXMuX2NhY2hlZFBhdGggPSBbXTtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgIHRoaXMuZGF0YSA9IHZhbHVlO1xuICAgICAgICB0aGlzLl9wYXRoID0gcGF0aDtcbiAgICAgICAgdGhpcy5fa2V5ID0ga2V5O1xuICAgIH1cbiAgICBnZXQgcGF0aCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9jYWNoZWRQYXRoLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5fa2V5KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlZFBhdGgucHVzaCguLi50aGlzLl9wYXRoLCAuLi50aGlzLl9rZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVkUGF0aC5wdXNoKC4uLnRoaXMuX3BhdGgsIHRoaXMuX2tleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZFBhdGg7XG4gICAgfVxufVxuY29uc3QgaGFuZGxlUmVzdWx0ID0gKGN0eCwgcmVzdWx0KSA9PiB7XG4gICAgaWYgKGlzVmFsaWQocmVzdWx0KSkge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQudmFsdWUgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmICghY3R4LmNvbW1vbi5pc3N1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWYWxpZGF0aW9uIGZhaWxlZCBidXQgbm8gaXNzdWVzIGRldGVjdGVkLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBnZXQgZXJyb3IoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2Vycm9yKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZXJyb3I7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgWm9kRXJyb3IoY3R4LmNvbW1vbi5pc3N1ZXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2Vycm9yID0gZXJyb3I7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Vycm9yO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG59O1xuZnVuY3Rpb24gcHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpIHtcbiAgICBpZiAoIXBhcmFtcylcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIGNvbnN0IHsgZXJyb3JNYXAsIGludmFsaWRfdHlwZV9lcnJvciwgcmVxdWlyZWRfZXJyb3IsIGRlc2NyaXB0aW9uIH0gPSBwYXJhbXM7XG4gICAgaWYgKGVycm9yTWFwICYmIChpbnZhbGlkX3R5cGVfZXJyb3IgfHwgcmVxdWlyZWRfZXJyb3IpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgdXNlIFwiaW52YWxpZF90eXBlX2Vycm9yXCIgb3IgXCJyZXF1aXJlZF9lcnJvclwiIGluIGNvbmp1bmN0aW9uIHdpdGggY3VzdG9tIGVycm9yIG1hcC5gKTtcbiAgICB9XG4gICAgaWYgKGVycm9yTWFwKVxuICAgICAgICByZXR1cm4geyBlcnJvck1hcDogZXJyb3JNYXAsIGRlc2NyaXB0aW9uIH07XG4gICAgY29uc3QgY3VzdG9tTWFwID0gKGlzcywgY3R4KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbWVzc2FnZSB9ID0gcGFyYW1zO1xuICAgICAgICBpZiAoaXNzLmNvZGUgPT09IFwiaW52YWxpZF9lbnVtX3ZhbHVlXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB7IG1lc3NhZ2U6IG1lc3NhZ2UgPz8gY3R4LmRlZmF1bHRFcnJvciB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgY3R4LmRhdGEgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB7IG1lc3NhZ2U6IG1lc3NhZ2UgPz8gcmVxdWlyZWRfZXJyb3IgPz8gY3R4LmRlZmF1bHRFcnJvciB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc3MuY29kZSAhPT0gXCJpbnZhbGlkX3R5cGVcIilcbiAgICAgICAgICAgIHJldHVybiB7IG1lc3NhZ2U6IGN0eC5kZWZhdWx0RXJyb3IgfTtcbiAgICAgICAgcmV0dXJuIHsgbWVzc2FnZTogbWVzc2FnZSA/PyBpbnZhbGlkX3R5cGVfZXJyb3IgPz8gY3R4LmRlZmF1bHRFcnJvciB9O1xuICAgIH07XG4gICAgcmV0dXJuIHsgZXJyb3JNYXA6IGN1c3RvbU1hcCwgZGVzY3JpcHRpb24gfTtcbn1cbmV4cG9ydCBjbGFzcyBab2RUeXBlIHtcbiAgICBnZXQgZGVzY3JpcHRpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuZGVzY3JpcHRpb247XG4gICAgfVxuICAgIF9nZXRUeXBlKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBnZXRQYXJzZWRUeXBlKGlucHV0LmRhdGEpO1xuICAgIH1cbiAgICBfZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCkge1xuICAgICAgICByZXR1cm4gKGN0eCB8fCB7XG4gICAgICAgICAgICBjb21tb246IGlucHV0LnBhcmVudC5jb21tb24sXG4gICAgICAgICAgICBkYXRhOiBpbnB1dC5kYXRhLFxuICAgICAgICAgICAgcGFyc2VkVHlwZTogZ2V0UGFyc2VkVHlwZShpbnB1dC5kYXRhKSxcbiAgICAgICAgICAgIHNjaGVtYUVycm9yTWFwOiB0aGlzLl9kZWYuZXJyb3JNYXAsXG4gICAgICAgICAgICBwYXRoOiBpbnB1dC5wYXRoLFxuICAgICAgICAgICAgcGFyZW50OiBpbnB1dC5wYXJlbnQsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGF0dXM6IG5ldyBQYXJzZVN0YXR1cygpLFxuICAgICAgICAgICAgY3R4OiB7XG4gICAgICAgICAgICAgICAgY29tbW9uOiBpbnB1dC5wYXJlbnQuY29tbW9uLFxuICAgICAgICAgICAgICAgIGRhdGE6IGlucHV0LmRhdGEsXG4gICAgICAgICAgICAgICAgcGFyc2VkVHlwZTogZ2V0UGFyc2VkVHlwZShpbnB1dC5kYXRhKSxcbiAgICAgICAgICAgICAgICBzY2hlbWFFcnJvck1hcDogdGhpcy5fZGVmLmVycm9yTWFwLFxuICAgICAgICAgICAgICAgIHBhdGg6IGlucHV0LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBpbnB1dC5wYXJlbnQsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cbiAgICBfcGFyc2VTeW5jKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3BhcnNlKGlucHV0KTtcbiAgICAgICAgaWYgKGlzQXN5bmMocmVzdWx0KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3luY2hyb25vdXMgcGFyc2UgZW5jb3VudGVyZWQgcHJvbWlzZS5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgX3BhcnNlQXN5bmMoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcGFyc2UoaW5wdXQpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCk7XG4gICAgfVxuICAgIHBhcnNlKGRhdGEsIHBhcmFtcykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLnNhZmVQYXJzZShkYXRhLCBwYXJhbXMpO1xuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LmRhdGE7XG4gICAgICAgIHRocm93IHJlc3VsdC5lcnJvcjtcbiAgICB9XG4gICAgc2FmZVBhcnNlKGRhdGEsIHBhcmFtcykge1xuICAgICAgICBjb25zdCBjdHggPSB7XG4gICAgICAgICAgICBjb21tb246IHtcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICAgICAgICAgIGFzeW5jOiBwYXJhbXM/LmFzeW5jID8/IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbnRleHR1YWxFcnJvck1hcDogcGFyYW1zPy5lcnJvck1hcCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBwYXJhbXM/LnBhdGggfHwgW10sXG4gICAgICAgICAgICBzY2hlbWFFcnJvck1hcDogdGhpcy5fZGVmLmVycm9yTWFwLFxuICAgICAgICAgICAgcGFyZW50OiBudWxsLFxuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHBhcnNlZFR5cGU6IGdldFBhcnNlZFR5cGUoZGF0YSksXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3BhcnNlU3luYyh7IGRhdGEsIHBhdGg6IGN0eC5wYXRoLCBwYXJlbnQ6IGN0eCB9KTtcbiAgICAgICAgcmV0dXJuIGhhbmRsZVJlc3VsdChjdHgsIHJlc3VsdCk7XG4gICAgfVxuICAgIFwifnZhbGlkYXRlXCIoZGF0YSkge1xuICAgICAgICBjb25zdCBjdHggPSB7XG4gICAgICAgICAgICBjb21tb246IHtcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICAgICAgICAgIGFzeW5jOiAhIXRoaXNbXCJ+c3RhbmRhcmRcIl0uYXN5bmMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF0aDogW10sXG4gICAgICAgICAgICBzY2hlbWFFcnJvck1hcDogdGhpcy5fZGVmLmVycm9yTWFwLFxuICAgICAgICAgICAgcGFyZW50OiBudWxsLFxuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHBhcnNlZFR5cGU6IGdldFBhcnNlZFR5cGUoZGF0YSksXG4gICAgICAgIH07XG4gICAgICAgIGlmICghdGhpc1tcIn5zdGFuZGFyZFwiXS5hc3luYykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wYXJzZVN5bmMoeyBkYXRhLCBwYXRoOiBbXSwgcGFyZW50OiBjdHggfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzVmFsaWQocmVzdWx0KVxuICAgICAgICAgICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHQudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc3N1ZXM6IGN0eC5jb21tb24uaXNzdWVzLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnI/Lm1lc3NhZ2U/LnRvTG93ZXJDYXNlKCk/LmluY2x1ZGVzKFwiZW5jb3VudGVyZWRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpc1tcIn5zdGFuZGFyZFwiXS5hc3luYyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN0eC5jb21tb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgICAgIGFzeW5jOiB0cnVlLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnNlQXN5bmMoeyBkYXRhLCBwYXRoOiBbXSwgcGFyZW50OiBjdHggfSkudGhlbigocmVzdWx0KSA9PiBpc1ZhbGlkKHJlc3VsdClcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHQudmFsdWUsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IGN0eC5jb21tb24uaXNzdWVzLFxuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jIHBhcnNlQXN5bmMoZGF0YSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc2FmZVBhcnNlQXN5bmMoZGF0YSwgcGFyYW1zKTtcbiAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5kYXRhO1xuICAgICAgICB0aHJvdyByZXN1bHQuZXJyb3I7XG4gICAgfVxuICAgIGFzeW5jIHNhZmVQYXJzZUFzeW5jKGRhdGEsIHBhcmFtcykge1xuICAgICAgICBjb25zdCBjdHggPSB7XG4gICAgICAgICAgICBjb21tb246IHtcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICAgICAgICAgIGNvbnRleHR1YWxFcnJvck1hcDogcGFyYW1zPy5lcnJvck1hcCxcbiAgICAgICAgICAgICAgICBhc3luYzogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXRoOiBwYXJhbXM/LnBhdGggfHwgW10sXG4gICAgICAgICAgICBzY2hlbWFFcnJvck1hcDogdGhpcy5fZGVmLmVycm9yTWFwLFxuICAgICAgICAgICAgcGFyZW50OiBudWxsLFxuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHBhcnNlZFR5cGU6IGdldFBhcnNlZFR5cGUoZGF0YSksXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG1heWJlQXN5bmNSZXN1bHQgPSB0aGlzLl9wYXJzZSh7IGRhdGEsIHBhdGg6IGN0eC5wYXRoLCBwYXJlbnQ6IGN0eCB9KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgKGlzQXN5bmMobWF5YmVBc3luY1Jlc3VsdCkgPyBtYXliZUFzeW5jUmVzdWx0IDogUHJvbWlzZS5yZXNvbHZlKG1heWJlQXN5bmNSZXN1bHQpKTtcbiAgICAgICAgcmV0dXJuIGhhbmRsZVJlc3VsdChjdHgsIHJlc3VsdCk7XG4gICAgfVxuICAgIHJlZmluZShjaGVjaywgbWVzc2FnZSkge1xuICAgICAgICBjb25zdCBnZXRJc3N1ZVByb3BlcnRpZXMgPSAodmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIG1lc3NhZ2UgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBtZXNzYWdlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2UodmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVmaW5lbWVudCgodmFsLCBjdHgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNoZWNrKHZhbCk7XG4gICAgICAgICAgICBjb25zdCBzZXRFcnJvciA9ICgpID0+IGN0eC5hZGRJc3N1ZSh7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmN1c3RvbSxcbiAgICAgICAgICAgICAgICAuLi5nZXRJc3N1ZVByb3BlcnRpZXModmFsKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBQcm9taXNlICE9PSBcInVuZGVmaW5lZFwiICYmIHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRFcnJvcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgc2V0RXJyb3IoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlZmluZW1lbnQoY2hlY2ssIHJlZmluZW1lbnREYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZpbmVtZW50KCh2YWwsIGN0eCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjaGVjayh2YWwpKSB7XG4gICAgICAgICAgICAgICAgY3R4LmFkZElzc3VlKHR5cGVvZiByZWZpbmVtZW50RGF0YSA9PT0gXCJmdW5jdGlvblwiID8gcmVmaW5lbWVudERhdGEodmFsLCBjdHgpIDogcmVmaW5lbWVudERhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgX3JlZmluZW1lbnQocmVmaW5lbWVudCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEVmZmVjdHMoe1xuICAgICAgICAgICAgc2NoZW1hOiB0aGlzLFxuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFZmZlY3RzLFxuICAgICAgICAgICAgZWZmZWN0OiB7IHR5cGU6IFwicmVmaW5lbWVudFwiLCByZWZpbmVtZW50IH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdXBlclJlZmluZShyZWZpbmVtZW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZpbmVtZW50KHJlZmluZW1lbnQpO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihkZWYpIHtcbiAgICAgICAgLyoqIEFsaWFzIG9mIHNhZmVQYXJzZUFzeW5jICovXG4gICAgICAgIHRoaXMuc3BhID0gdGhpcy5zYWZlUGFyc2VBc3luYztcbiAgICAgICAgdGhpcy5fZGVmID0gZGVmO1xuICAgICAgICB0aGlzLnBhcnNlID0gdGhpcy5wYXJzZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnNhZmVQYXJzZSA9IHRoaXMuc2FmZVBhcnNlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucGFyc2VBc3luYyA9IHRoaXMucGFyc2VBc3luYy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnNhZmVQYXJzZUFzeW5jID0gdGhpcy5zYWZlUGFyc2VBc3luYy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnNwYSA9IHRoaXMuc3BhLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucmVmaW5lID0gdGhpcy5yZWZpbmUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5yZWZpbmVtZW50ID0gdGhpcy5yZWZpbmVtZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc3VwZXJSZWZpbmUgPSB0aGlzLnN1cGVyUmVmaW5lLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub3B0aW9uYWwgPSB0aGlzLm9wdGlvbmFsLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMubnVsbGFibGUgPSB0aGlzLm51bGxhYmxlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMubnVsbGlzaCA9IHRoaXMubnVsbGlzaC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmFycmF5ID0gdGhpcy5hcnJheS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnByb21pc2UgPSB0aGlzLnByb21pc2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5vciA9IHRoaXMub3IuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5hbmQgPSB0aGlzLmFuZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybSA9IHRoaXMudHJhbnNmb3JtLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnJhbmQgPSB0aGlzLmJyYW5kLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZGVmYXVsdCA9IHRoaXMuZGVmYXVsdC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmNhdGNoID0gdGhpcy5jYXRjaC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmRlc2NyaWJlID0gdGhpcy5kZXNjcmliZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnBpcGUgPSB0aGlzLnBpcGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5yZWFkb25seSA9IHRoaXMucmVhZG9ubHkuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5pc051bGxhYmxlID0gdGhpcy5pc051bGxhYmxlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuaXNPcHRpb25hbCA9IHRoaXMuaXNPcHRpb25hbC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzW1wifnN0YW5kYXJkXCJdID0ge1xuICAgICAgICAgICAgdmVyc2lvbjogMSxcbiAgICAgICAgICAgIHZlbmRvcjogXCJ6b2RcIixcbiAgICAgICAgICAgIHZhbGlkYXRlOiAoZGF0YSkgPT4gdGhpc1tcIn52YWxpZGF0ZVwiXShkYXRhKSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgb3B0aW9uYWwoKSB7XG4gICAgICAgIHJldHVybiBab2RPcHRpb25hbC5jcmVhdGUodGhpcywgdGhpcy5fZGVmKTtcbiAgICB9XG4gICAgbnVsbGFibGUoKSB7XG4gICAgICAgIHJldHVybiBab2ROdWxsYWJsZS5jcmVhdGUodGhpcywgdGhpcy5fZGVmKTtcbiAgICB9XG4gICAgbnVsbGlzaCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubnVsbGFibGUoKS5vcHRpb25hbCgpO1xuICAgIH1cbiAgICBhcnJheSgpIHtcbiAgICAgICAgcmV0dXJuIFpvZEFycmF5LmNyZWF0ZSh0aGlzKTtcbiAgICB9XG4gICAgcHJvbWlzZSgpIHtcbiAgICAgICAgcmV0dXJuIFpvZFByb21pc2UuY3JlYXRlKHRoaXMsIHRoaXMuX2RlZik7XG4gICAgfVxuICAgIG9yKG9wdGlvbikge1xuICAgICAgICByZXR1cm4gWm9kVW5pb24uY3JlYXRlKFt0aGlzLCBvcHRpb25dLCB0aGlzLl9kZWYpO1xuICAgIH1cbiAgICBhbmQoaW5jb21pbmcpIHtcbiAgICAgICAgcmV0dXJuIFpvZEludGVyc2VjdGlvbi5jcmVhdGUodGhpcywgaW5jb21pbmcsIHRoaXMuX2RlZik7XG4gICAgfVxuICAgIHRyYW5zZm9ybSh0cmFuc2Zvcm0pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RFZmZlY3RzKHtcbiAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXModGhpcy5fZGVmKSxcbiAgICAgICAgICAgIHNjaGVtYTogdGhpcyxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRWZmZWN0cyxcbiAgICAgICAgICAgIGVmZmVjdDogeyB0eXBlOiBcInRyYW5zZm9ybVwiLCB0cmFuc2Zvcm0gfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGRlZmF1bHQoZGVmKSB7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRWYWx1ZUZ1bmMgPSB0eXBlb2YgZGVmID09PSBcImZ1bmN0aW9uXCIgPyBkZWYgOiAoKSA9PiBkZWY7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRGVmYXVsdCh7XG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHRoaXMuX2RlZiksXG4gICAgICAgICAgICBpbm5lclR5cGU6IHRoaXMsXG4gICAgICAgICAgICBkZWZhdWx0VmFsdWU6IGRlZmF1bHRWYWx1ZUZ1bmMsXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZERlZmF1bHQsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBicmFuZCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RCcmFuZGVkKHtcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQnJhbmRlZCxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMsXG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHRoaXMuX2RlZiksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjYXRjaChkZWYpIHtcbiAgICAgICAgY29uc3QgY2F0Y2hWYWx1ZUZ1bmMgPSB0eXBlb2YgZGVmID09PSBcImZ1bmN0aW9uXCIgPyBkZWYgOiAoKSA9PiBkZWY7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQ2F0Y2goe1xuICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyh0aGlzLl9kZWYpLFxuICAgICAgICAgICAgaW5uZXJUeXBlOiB0aGlzLFxuICAgICAgICAgICAgY2F0Y2hWYWx1ZTogY2F0Y2hWYWx1ZUZ1bmMsXG4gICAgICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZENhdGNoLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZGVzY3JpYmUoZGVzY3JpcHRpb24pIHtcbiAgICAgICAgY29uc3QgVGhpcyA9IHRoaXMuY29uc3RydWN0b3I7XG4gICAgICAgIHJldHVybiBuZXcgVGhpcyh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBpcGUodGFyZ2V0KSB7XG4gICAgICAgIHJldHVybiBab2RQaXBlbGluZS5jcmVhdGUodGhpcywgdGFyZ2V0KTtcbiAgICB9XG4gICAgcmVhZG9ubHkoKSB7XG4gICAgICAgIHJldHVybiBab2RSZWFkb25seS5jcmVhdGUodGhpcyk7XG4gICAgfVxuICAgIGlzT3B0aW9uYWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNhZmVQYXJzZSh1bmRlZmluZWQpLnN1Y2Nlc3M7XG4gICAgfVxuICAgIGlzTnVsbGFibGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNhZmVQYXJzZShudWxsKS5zdWNjZXNzO1xuICAgIH1cbn1cbmNvbnN0IGN1aWRSZWdleCA9IC9eY1teXFxzLV17OCx9JC9pO1xuY29uc3QgY3VpZDJSZWdleCA9IC9eWzAtOWEtel0rJC87XG5jb25zdCB1bGlkUmVnZXggPSAvXlswLTlBLUhKS01OUC1UVi1aXXsyNn0kL2k7XG4vLyBjb25zdCB1dWlkUmVnZXggPVxuLy8gICAvXihbYS1mMC05XXs4fS1bYS1mMC05XXs0fS1bMS01XVthLWYwLTldezN9LVthLWYwLTldezR9LVthLWYwLTldezEyfXwwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDApJC9pO1xuY29uc3QgdXVpZFJlZ2V4ID0gL15bMC05YS1mQS1GXXs4fVxcYi1bMC05YS1mQS1GXXs0fVxcYi1bMC05YS1mQS1GXXs0fVxcYi1bMC05YS1mQS1GXXs0fVxcYi1bMC05YS1mQS1GXXsxMn0kL2k7XG5jb25zdCBuYW5vaWRSZWdleCA9IC9eW2EtejAtOV8tXXsyMX0kL2k7XG5jb25zdCBqd3RSZWdleCA9IC9eW0EtWmEtejAtOS1fXStcXC5bQS1aYS16MC05LV9dK1xcLltBLVphLXowLTktX10qJC87XG5jb25zdCBkdXJhdGlvblJlZ2V4ID0gL15bLStdP1AoPyEkKSg/Oig/OlstK10/XFxkK1kpfCg/OlstK10/XFxkK1suLF1cXGQrWSQpKT8oPzooPzpbLStdP1xcZCtNKXwoPzpbLStdP1xcZCtbLixdXFxkK00kKSk/KD86KD86Wy0rXT9cXGQrVyl8KD86Wy0rXT9cXGQrWy4sXVxcZCtXJCkpPyg/Oig/OlstK10/XFxkK0QpfCg/OlstK10/XFxkK1suLF1cXGQrRCQpKT8oPzpUKD89W1xcZCstXSkoPzooPzpbLStdP1xcZCtIKXwoPzpbLStdP1xcZCtbLixdXFxkK0gkKSk/KD86KD86Wy0rXT9cXGQrTSl8KD86Wy0rXT9cXGQrWy4sXVxcZCtNJCkpPyg/OlstK10/XFxkKyg/OlsuLF1cXGQrKT9TKT8pPz8kLztcbi8vIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzQ2MTgxLzE1NTAxNTVcbi8vIG9sZCB2ZXJzaW9uOiB0b28gc2xvdywgZGlkbid0IHN1cHBvcnQgdW5pY29kZVxuLy8gY29uc3QgZW1haWxSZWdleCA9IC9eKCgoW2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKyhcXC4oW2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKykqKXwoKFxceDIyKSgoKChcXHgyMHxcXHgwOSkqKFxceDBkXFx4MGEpKT8oXFx4MjB8XFx4MDkpKyk/KChbXFx4MDEtXFx4MDhcXHgwYlxceDBjXFx4MGUtXFx4MWZcXHg3Zl18XFx4MjF8W1xceDIzLVxceDViXXxbXFx4NWQtXFx4N2VdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoXFxcXChbXFx4MDEtXFx4MDlcXHgwYlxceDBjXFx4MGQtXFx4N2ZdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpKSooKChcXHgyMHxcXHgwOSkqKFxceDBkXFx4MGEpKT8oXFx4MjB8XFx4MDkpKyk/KFxceDIyKSkpQCgoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4pKygoW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKSQvaTtcbi8vb2xkIGVtYWlsIHJlZ2V4XG4vLyBjb25zdCBlbWFpbFJlZ2V4ID0gL14oKFtePD4oKVtcXF0uLDs6XFxzQFwiXSsoXFwuW148PigpW1xcXS4sOzpcXHNAXCJdKykqKXwoXCIuK1wiKSlAKCg/IS0pKFtePD4oKVtcXF0uLDs6XFxzQFwiXStcXC4pK1tePD4oKVtcXF0uLDs6XFxzQFwiXXsxLH0pW14tPD4oKVtcXF0uLDs6XFxzQFwiXSQvaTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuLy8gY29uc3QgZW1haWxSZWdleCA9XG4vLyAgIC9eKChbXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFxcWygoKDI1WzAtNV0pfCgyWzAtNF1bMC05XSl8KDFbMC05XXsyfSl8KFswLTldezEsMn0pKVxcLil7M30oKDI1WzAtNV0pfCgyWzAtNF1bMC05XSl8KDFbMC05XXsyfSl8KFswLTldezEsMn0pKVxcXSl8KFxcW0lQdjY6KChbYS1mMC05XXsxLDR9Oil7N318OjooW2EtZjAtOV17MSw0fTopezAsNn18KFthLWYwLTldezEsNH06KXsxfTooW2EtZjAtOV17MSw0fTopezAsNX18KFthLWYwLTldezEsNH06KXsyfTooW2EtZjAtOV17MSw0fTopezAsNH18KFthLWYwLTldezEsNH06KXszfTooW2EtZjAtOV17MSw0fTopezAsM318KFthLWYwLTldezEsNH06KXs0fTooW2EtZjAtOV17MSw0fTopezAsMn18KFthLWYwLTldezEsNH06KXs1fTooW2EtZjAtOV17MSw0fTopezAsMX0pKFthLWYwLTldezEsNH18KCgoMjVbMC01XSl8KDJbMC00XVswLTldKXwoMVswLTldezJ9KXwoWzAtOV17MSwyfSkpXFwuKXszfSgoMjVbMC01XSl8KDJbMC00XVswLTldKXwoMVswLTldezJ9KXwoWzAtOV17MSwyfSkpKVxcXSl8KFtBLVphLXowLTldKFtBLVphLXowLTktXSpbQS1aYS16MC05XSkqKFxcLltBLVphLXpdezIsfSkrKSkkLztcbi8vIGNvbnN0IGVtYWlsUmVnZXggPVxuLy8gICAvXlthLXpBLVowLTlcXC5cXCFcXCNcXCRcXCVcXCZcXCdcXCpcXCtcXC9cXD1cXD9cXF5cXF9cXGBcXHtcXHxcXH1cXH5cXC1dK0BbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKiQvO1xuLy8gY29uc3QgZW1haWxSZWdleCA9XG4vLyAgIC9eKD86W2EtejAtOSEjJCUmJyorLz0/Xl9ge3x9fi1dKyg/OlxcLlthLXowLTkhIyQlJicqKy89P15fYHt8fX4tXSspKnxcIig/OltcXHgwMS1cXHgwOFxceDBiXFx4MGNcXHgwZS1cXHgxZlxceDIxXFx4MjMtXFx4NWJcXHg1ZC1cXHg3Zl18XFxcXFtcXHgwMS1cXHgwOVxceDBiXFx4MGNcXHgwZS1cXHg3Zl0pKlwiKUAoPzooPzpbYS16MC05XSg/OlthLXowLTktXSpbYS16MC05XSk/XFwuKStbYS16MC05XSg/OlthLXowLTktXSpbYS16MC05XSk/fFxcWyg/Oig/OjI1WzAtNV18MlswLTRdWzAtOV18WzAxXT9bMC05XVswLTldPylcXC4pezN9KD86MjVbMC01XXwyWzAtNF1bMC05XXxbMDFdP1swLTldWzAtOV0/fFthLXowLTktXSpbYS16MC05XTooPzpbXFx4MDEtXFx4MDhcXHgwYlxceDBjXFx4MGUtXFx4MWZcXHgyMS1cXHg1YVxceDUzLVxceDdmXXxcXFxcW1xceDAxLVxceDA5XFx4MGJcXHgwY1xceDBlLVxceDdmXSkrKVxcXSkkL2k7XG5jb25zdCBlbWFpbFJlZ2V4ID0gL14oPyFcXC4pKD8hLipcXC5cXC4pKFtBLVowLTlfJytcXC1cXC5dKilbQS1aMC05XystXUAoW0EtWjAtOV1bQS1aMC05XFwtXSpcXC4pK1tBLVpdezIsfSQvaTtcbi8vIGNvbnN0IGVtYWlsUmVnZXggPVxuLy8gICAvXlthLXowLTkuISMkJSZcdTIwMTkqKy89P15fYHt8fX4tXStAW2EtejAtOS1dKyg/OlxcLlthLXowLTlcXC1dKykqJC9pO1xuLy8gZnJvbSBodHRwczovL3RoZWtldmluc2NvdHQuY29tL2Vtb2ppcy1pbi1qYXZhc2NyaXB0LyN3cml0aW5nLWEtcmVndWxhci1leHByZXNzaW9uXG5jb25zdCBfZW1vamlSZWdleCA9IGBeKFxcXFxwe0V4dGVuZGVkX1BpY3RvZ3JhcGhpY318XFxcXHB7RW1vamlfQ29tcG9uZW50fSkrJGA7XG5sZXQgZW1vamlSZWdleDtcbi8vIGZhc3Rlciwgc2ltcGxlciwgc2FmZXJcbmNvbnN0IGlwdjRSZWdleCA9IC9eKD86KD86MjVbMC01XXwyWzAtNF1bMC05XXwxWzAtOV1bMC05XXxbMS05XVswLTldfFswLTldKVxcLil7M30oPzoyNVswLTVdfDJbMC00XVswLTldfDFbMC05XVswLTldfFsxLTldWzAtOV18WzAtOV0pJC87XG5jb25zdCBpcHY0Q2lkclJlZ2V4ID0gL14oPzooPzoyNVswLTVdfDJbMC00XVswLTldfDFbMC05XVswLTldfFsxLTldWzAtOV18WzAtOV0pXFwuKXszfSg/OjI1WzAtNV18MlswLTRdWzAtOV18MVswLTldWzAtOV18WzEtOV1bMC05XXxbMC05XSlcXC8oM1swLTJdfFsxMl0/WzAtOV0pJC87XG4vLyBjb25zdCBpcHY2UmVnZXggPVxuLy8gL14oKFthLWYwLTldezEsNH06KXs3fXw6OihbYS1mMC05XXsxLDR9Oil7MCw2fXwoW2EtZjAtOV17MSw0fTopezF9OihbYS1mMC05XXsxLDR9Oil7MCw1fXwoW2EtZjAtOV17MSw0fTopezJ9OihbYS1mMC05XXsxLDR9Oil7MCw0fXwoW2EtZjAtOV17MSw0fTopezN9OihbYS1mMC05XXsxLDR9Oil7MCwzfXwoW2EtZjAtOV17MSw0fTopezR9OihbYS1mMC05XXsxLDR9Oil7MCwyfXwoW2EtZjAtOV17MSw0fTopezV9OihbYS1mMC05XXsxLDR9Oil7MCwxfSkoW2EtZjAtOV17MSw0fXwoKCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSlcXC4pezN9KCgyNVswLTVdKXwoMlswLTRdWzAtOV0pfCgxWzAtOV17Mn0pfChbMC05XXsxLDJ9KSkpJC87XG5jb25zdCBpcHY2UmVnZXggPSAvXigoWzAtOWEtZkEtRl17MSw0fTopezcsN31bMC05YS1mQS1GXXsxLDR9fChbMC05YS1mQS1GXXsxLDR9Oil7MSw3fTp8KFswLTlhLWZBLUZdezEsNH06KXsxLDZ9OlswLTlhLWZBLUZdezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDV9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDJ9fChbMC05YS1mQS1GXXsxLDR9Oil7MSw0fSg6WzAtOWEtZkEtRl17MSw0fSl7MSwzfXwoWzAtOWEtZkEtRl17MSw0fTopezEsM30oOlswLTlhLWZBLUZdezEsNH0pezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDJ9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDV9fFswLTlhLWZBLUZdezEsNH06KCg6WzAtOWEtZkEtRl17MSw0fSl7MSw2fSl8OigoOlswLTlhLWZBLUZdezEsNH0pezEsN318Oil8ZmU4MDooOlswLTlhLWZBLUZdezAsNH0pezAsNH0lWzAtOWEtekEtWl17MSx9fDo6KGZmZmYoOjB7MSw0fSl7MCwxfTopezAsMX0oKDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKVxcLil7MywzfSgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSl8KFswLTlhLWZBLUZdezEsNH06KXsxLDR9OigoMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pXFwuKXszLDN9KDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKSkkLztcbmNvbnN0IGlwdjZDaWRyUmVnZXggPSAvXigoWzAtOWEtZkEtRl17MSw0fTopezcsN31bMC05YS1mQS1GXXsxLDR9fChbMC05YS1mQS1GXXsxLDR9Oil7MSw3fTp8KFswLTlhLWZBLUZdezEsNH06KXsxLDZ9OlswLTlhLWZBLUZdezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDV9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDJ9fChbMC05YS1mQS1GXXsxLDR9Oil7MSw0fSg6WzAtOWEtZkEtRl17MSw0fSl7MSwzfXwoWzAtOWEtZkEtRl17MSw0fTopezEsM30oOlswLTlhLWZBLUZdezEsNH0pezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDJ9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDV9fFswLTlhLWZBLUZdezEsNH06KCg6WzAtOWEtZkEtRl17MSw0fSl7MSw2fSl8OigoOlswLTlhLWZBLUZdezEsNH0pezEsN318Oil8ZmU4MDooOlswLTlhLWZBLUZdezAsNH0pezAsNH0lWzAtOWEtekEtWl17MSx9fDo6KGZmZmYoOjB7MSw0fSl7MCwxfTopezAsMX0oKDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKVxcLil7MywzfSgyNVswLTVdfCgyWzAtNF18MXswLDF9WzAtOV0pezAsMX1bMC05XSl8KFswLTlhLWZBLUZdezEsNH06KXsxLDR9OigoMjVbMC01XXwoMlswLTRdfDF7MCwxfVswLTldKXswLDF9WzAtOV0pXFwuKXszLDN9KDI1WzAtNV18KDJbMC00XXwxezAsMX1bMC05XSl7MCwxfVswLTldKSlcXC8oMTJbMC04XXwxWzAxXVswLTldfFsxLTldP1swLTldKSQvO1xuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNzg2MDM5Mi9kZXRlcm1pbmUtaWYtc3RyaW5nLWlzLWluLWJhc2U2NC11c2luZy1qYXZhc2NyaXB0XG5jb25zdCBiYXNlNjRSZWdleCA9IC9eKFswLTlhLXpBLVorL117NH0pKigoWzAtOWEtekEtWisvXXsyfT09KXwoWzAtOWEtekEtWisvXXszfT0pKT8kLztcbi8vIGh0dHBzOi8vYmFzZTY0Lmd1cnUvc3RhbmRhcmRzL2Jhc2U2NHVybFxuY29uc3QgYmFzZTY0dXJsUmVnZXggPSAvXihbMC05YS16QS1aLV9dezR9KSooKFswLTlhLXpBLVotX117Mn0oPT0pPyl8KFswLTlhLXpBLVotX117M30oPSk/KSk/JC87XG4vLyBzaW1wbGVcbi8vIGNvbnN0IGRhdGVSZWdleFNvdXJjZSA9IGBcXFxcZHs0fS1cXFxcZHsyfS1cXFxcZHsyfWA7XG4vLyBubyBsZWFwIHllYXIgdmFsaWRhdGlvblxuLy8gY29uc3QgZGF0ZVJlZ2V4U291cmNlID0gYFxcXFxkezR9LSgoMFsxMzU3OF18MTB8MTIpLTMxfCgwWzEzLTldfDFbMC0yXSktMzB8KDBbMS05XXwxWzAtMl0pLSgwWzEtOV18MVxcXFxkfDJcXFxcZCkpYDtcbi8vIHdpdGggbGVhcCB5ZWFyIHZhbGlkYXRpb25cbmNvbnN0IGRhdGVSZWdleFNvdXJjZSA9IGAoKFxcXFxkXFxcXGRbMjQ2OF1bMDQ4XXxcXFxcZFxcXFxkWzEzNTc5XVsyNl18XFxcXGRcXFxcZDBbNDhdfFswMjQ2OF1bMDQ4XTAwfFsxMzU3OV1bMjZdMDApLTAyLTI5fFxcXFxkezR9LSgoMFsxMzU3OF18MVswMl0pLSgwWzEtOV18WzEyXVxcXFxkfDNbMDFdKXwoMFs0NjldfDExKS0oMFsxLTldfFsxMl1cXFxcZHwzMCl8KDAyKS0oMFsxLTldfDFcXFxcZHwyWzAtOF0pKSlgO1xuY29uc3QgZGF0ZVJlZ2V4ID0gbmV3IFJlZ0V4cChgXiR7ZGF0ZVJlZ2V4U291cmNlfSRgKTtcbmZ1bmN0aW9uIHRpbWVSZWdleFNvdXJjZShhcmdzKSB7XG4gICAgbGV0IHNlY29uZHNSZWdleFNvdXJjZSA9IGBbMC01XVxcXFxkYDtcbiAgICBpZiAoYXJncy5wcmVjaXNpb24pIHtcbiAgICAgICAgc2Vjb25kc1JlZ2V4U291cmNlID0gYCR7c2Vjb25kc1JlZ2V4U291cmNlfVxcXFwuXFxcXGR7JHthcmdzLnByZWNpc2lvbn19YDtcbiAgICB9XG4gICAgZWxzZSBpZiAoYXJncy5wcmVjaXNpb24gPT0gbnVsbCkge1xuICAgICAgICBzZWNvbmRzUmVnZXhTb3VyY2UgPSBgJHtzZWNvbmRzUmVnZXhTb3VyY2V9KFxcXFwuXFxcXGQrKT9gO1xuICAgIH1cbiAgICBjb25zdCBzZWNvbmRzUXVhbnRpZmllciA9IGFyZ3MucHJlY2lzaW9uID8gXCIrXCIgOiBcIj9cIjsgLy8gcmVxdWlyZSBzZWNvbmRzIGlmIHByZWNpc2lvbiBpcyBub256ZXJvXG4gICAgcmV0dXJuIGAoWzAxXVxcXFxkfDJbMC0zXSk6WzAtNV1cXFxcZCg6JHtzZWNvbmRzUmVnZXhTb3VyY2V9KSR7c2Vjb25kc1F1YW50aWZpZXJ9YDtcbn1cbmZ1bmN0aW9uIHRpbWVSZWdleChhcmdzKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4ke3RpbWVSZWdleFNvdXJjZShhcmdzKX0kYCk7XG59XG4vLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzMxNDMyMzFcbmV4cG9ydCBmdW5jdGlvbiBkYXRldGltZVJlZ2V4KGFyZ3MpIHtcbiAgICBsZXQgcmVnZXggPSBgJHtkYXRlUmVnZXhTb3VyY2V9VCR7dGltZVJlZ2V4U291cmNlKGFyZ3MpfWA7XG4gICAgY29uc3Qgb3B0cyA9IFtdO1xuICAgIG9wdHMucHVzaChhcmdzLmxvY2FsID8gYFo/YCA6IGBaYCk7XG4gICAgaWYgKGFyZ3Mub2Zmc2V0KVxuICAgICAgICBvcHRzLnB1c2goYChbKy1dXFxcXGR7Mn06P1xcXFxkezJ9KWApO1xuICAgIHJlZ2V4ID0gYCR7cmVnZXh9KCR7b3B0cy5qb2luKFwifFwiKX0pYDtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXiR7cmVnZXh9JGApO1xufVxuZnVuY3Rpb24gaXNWYWxpZElQKGlwLCB2ZXJzaW9uKSB7XG4gICAgaWYgKCh2ZXJzaW9uID09PSBcInY0XCIgfHwgIXZlcnNpb24pICYmIGlwdjRSZWdleC50ZXN0KGlwKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKCh2ZXJzaW9uID09PSBcInY2XCIgfHwgIXZlcnNpb24pICYmIGlwdjZSZWdleC50ZXN0KGlwKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gaXNWYWxpZEpXVChqd3QsIGFsZykge1xuICAgIGlmICghand0UmVnZXgudGVzdChqd3QpKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgW2hlYWRlcl0gPSBqd3Quc3BsaXQoXCIuXCIpO1xuICAgICAgICBpZiAoIWhlYWRlcilcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy8gQ29udmVydCBiYXNlNjR1cmwgdG8gYmFzZTY0XG4gICAgICAgIGNvbnN0IGJhc2U2NCA9IGhlYWRlclxuICAgICAgICAgICAgLnJlcGxhY2UoLy0vZywgXCIrXCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvXy9nLCBcIi9cIilcbiAgICAgICAgICAgIC5wYWRFbmQoaGVhZGVyLmxlbmd0aCArICgoNCAtIChoZWFkZXIubGVuZ3RoICUgNCkpICUgNCksIFwiPVwiKTtcbiAgICAgICAgY29uc3QgZGVjb2RlZCA9IEpTT04ucGFyc2UoYXRvYihiYXNlNjQpKTtcbiAgICAgICAgaWYgKHR5cGVvZiBkZWNvZGVkICE9PSBcIm9iamVjdFwiIHx8IGRlY29kZWQgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChcInR5cFwiIGluIGRlY29kZWQgJiYgZGVjb2RlZD8udHlwICE9PSBcIkpXVFwiKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoIWRlY29kZWQuYWxnKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoYWxnICYmIGRlY29kZWQuYWxnICE9PSBhbGcpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5mdW5jdGlvbiBpc1ZhbGlkQ2lkcihpcCwgdmVyc2lvbikge1xuICAgIGlmICgodmVyc2lvbiA9PT0gXCJ2NFwiIHx8ICF2ZXJzaW9uKSAmJiBpcHY0Q2lkclJlZ2V4LnRlc3QoaXApKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoKHZlcnNpb24gPT09IFwidjZcIiB8fCAhdmVyc2lvbikgJiYgaXB2NkNpZHJSZWdleC50ZXN0KGlwKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZXhwb3J0IGNsYXNzIFpvZFN0cmluZyBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5fZGVmLmNvZXJjZSkge1xuICAgICAgICAgICAgaW5wdXQuZGF0YSA9IFN0cmluZyhpbnB1dC5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLnN0cmluZykge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5zdHJpbmcsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdGF0dXMgPSBuZXcgUGFyc2VTdGF0dXMoKTtcbiAgICAgICAgbGV0IGN0eCA9IHVuZGVmaW5lZDtcbiAgICAgICAgZm9yIChjb25zdCBjaGVjayBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2sua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5kYXRhLmxlbmd0aCA8IGNoZWNrLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5kYXRhLmxlbmd0aCA+IGNoZWNrLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibGVuZ3RoXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b29CaWcgPSBpbnB1dC5kYXRhLmxlbmd0aCA+IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb1NtYWxsID0gaW5wdXQuZGF0YS5sZW5ndGggPCBjaGVjay52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodG9vQmlnIHx8IHRvb1NtYWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodG9vQmlnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGFjdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodG9vU21hbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZW1haWxcIikge1xuICAgICAgICAgICAgICAgIGlmICghZW1haWxSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiZW1haWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImVtb2ppXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVtb2ppUmVnZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgZW1vamlSZWdleCA9IG5ldyBSZWdFeHAoX2Vtb2ppUmVnZXgsIFwidVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFlbW9qaVJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJlbW9qaVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwidXVpZFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF1dWlkUmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcInV1aWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm5hbm9pZFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFuYW5vaWRSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwibmFub2lkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJjdWlkXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWN1aWRSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiY3VpZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiY3VpZDJcIikge1xuICAgICAgICAgICAgICAgIGlmICghY3VpZDJSZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiY3VpZDJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInVsaWRcIikge1xuICAgICAgICAgICAgICAgIGlmICghdWxpZFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJ1bGlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ1cmxcIikge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIG5ldyBVUkwoaW5wdXQuZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJ1cmxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInJlZ2V4XCIpIHtcbiAgICAgICAgICAgICAgICBjaGVjay5yZWdleC5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRlc3RSZXN1bHQgPSBjaGVjay5yZWdleC50ZXN0KGlucHV0LmRhdGEpO1xuICAgICAgICAgICAgICAgIGlmICghdGVzdFJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcInJlZ2V4XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ0cmltXCIpIHtcbiAgICAgICAgICAgICAgICBpbnB1dC5kYXRhID0gaW5wdXQuZGF0YS50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImluY2x1ZGVzXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlucHV0LmRhdGEuaW5jbHVkZXMoY2hlY2sudmFsdWUsIGNoZWNrLnBvc2l0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiB7IGluY2x1ZGVzOiBjaGVjay52YWx1ZSwgcG9zaXRpb246IGNoZWNrLnBvc2l0aW9uIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJ0b0xvd2VyQ2FzZVwiKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQuZGF0YSA9IGlucHV0LmRhdGEudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwidG9VcHBlckNhc2VcIikge1xuICAgICAgICAgICAgICAgIGlucHV0LmRhdGEgPSBpbnB1dC5kYXRhLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInN0YXJ0c1dpdGhcIikge1xuICAgICAgICAgICAgICAgIGlmICghaW5wdXQuZGF0YS5zdGFydHNXaXRoKGNoZWNrLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiB7IHN0YXJ0c1dpdGg6IGNoZWNrLnZhbHVlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJlbmRzV2l0aFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpbnB1dC5kYXRhLmVuZHNXaXRoKGNoZWNrLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiB7IGVuZHNXaXRoOiBjaGVjay52YWx1ZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiZGF0ZXRpbWVcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gZGF0ZXRpbWVSZWdleChjaGVjayk7XG4gICAgICAgICAgICAgICAgaWYgKCFyZWdleC50ZXN0KGlucHV0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiZGF0ZXRpbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImRhdGVcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gZGF0ZVJlZ2V4O1xuICAgICAgICAgICAgICAgIGlmICghcmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcInRpbWVcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gdGltZVJlZ2V4KGNoZWNrKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJ0aW1lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJkdXJhdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkdXJhdGlvblJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJkdXJhdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiaXBcIikge1xuICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZElQKGlucHV0LmRhdGEsIGNoZWNrLnZlcnNpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb246IFwiaXBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImp3dFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkSldUKGlucHV0LmRhdGEsIGNoZWNrLmFsZykpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJqd3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImNpZHJcIikge1xuICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZENpZHIoaW5wdXQuZGF0YSwgY2hlY2sudmVyc2lvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJjaWRyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJiYXNlNjRcIikge1xuICAgICAgICAgICAgICAgIGlmICghYmFzZTY0UmVnZXgudGVzdChpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uOiBcImJhc2U2NFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwiYmFzZTY0dXJsXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWJhc2U2NHVybFJlZ2V4LnRlc3QoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdGlvbjogXCJiYXNlNjR1cmxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3N0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGNoZWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHN0YXR1cy52YWx1ZSwgdmFsdWU6IGlucHV0LmRhdGEgfTtcbiAgICB9XG4gICAgX3JlZ2V4KHJlZ2V4LCB2YWxpZGF0aW9uLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlZmluZW1lbnQoKGRhdGEpID0+IHJlZ2V4LnRlc3QoZGF0YSksIHtcbiAgICAgICAgICAgIHZhbGlkYXRpb24sXG4gICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9zdHJpbmcsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfYWRkQ2hlY2soY2hlY2spIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RTdHJpbmcoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgY2hlY2tdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZW1haWwobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImVtYWlsXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgdXJsKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJ1cmxcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBlbW9qaShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiZW1vamlcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICB1dWlkKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJ1dWlkXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgbmFub2lkKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJuYW5vaWRcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpIH0pO1xuICAgIH1cbiAgICBjdWlkKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJjdWlkXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgY3VpZDIobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImN1aWQyXCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgdWxpZChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwidWxpZFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIGJhc2U2NChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiYmFzZTY0XCIsIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSB9KTtcbiAgICB9XG4gICAgYmFzZTY0dXJsKG1lc3NhZ2UpIHtcbiAgICAgICAgLy8gYmFzZTY0dXJsIGVuY29kaW5nIGlzIGEgbW9kaWZpY2F0aW9uIG9mIGJhc2U2NCB0aGF0IGNhbiBzYWZlbHkgYmUgdXNlZCBpbiBVUkxzIGFuZCBmaWxlbmFtZXNcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwiYmFzZTY0dXJsXCIsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBqd3Qob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImp3dFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucykgfSk7XG4gICAgfVxuICAgIGlwKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJpcFwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoob3B0aW9ucykgfSk7XG4gICAgfVxuICAgIGNpZHIob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soeyBraW5kOiBcImNpZHJcIiwgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG9wdGlvbnMpIH0pO1xuICAgIH1cbiAgICBkYXRldGltZShvcHRpb25zKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgICAgICBraW5kOiBcImRhdGV0aW1lXCIsXG4gICAgICAgICAgICAgICAgcHJlY2lzaW9uOiBudWxsLFxuICAgICAgICAgICAgICAgIG9mZnNldDogZmFsc2UsXG4gICAgICAgICAgICAgICAgbG9jYWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG9wdGlvbnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJkYXRldGltZVwiLFxuICAgICAgICAgICAgcHJlY2lzaW9uOiB0eXBlb2Ygb3B0aW9ucz8ucHJlY2lzaW9uID09PSBcInVuZGVmaW5lZFwiID8gbnVsbCA6IG9wdGlvbnM/LnByZWNpc2lvbixcbiAgICAgICAgICAgIG9mZnNldDogb3B0aW9ucz8ub2Zmc2V0ID8/IGZhbHNlLFxuICAgICAgICAgICAgbG9jYWw6IG9wdGlvbnM/LmxvY2FsID8/IGZhbHNlLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG9wdGlvbnM/Lm1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZGF0ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7IGtpbmQ6IFwiZGF0ZVwiLCBtZXNzYWdlIH0pO1xuICAgIH1cbiAgICB0aW1lKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAgICAgIGtpbmQ6IFwidGltZVwiLFxuICAgICAgICAgICAgICAgIHByZWNpc2lvbjogbnVsbCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBvcHRpb25zLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwidGltZVwiLFxuICAgICAgICAgICAgcHJlY2lzaW9uOiB0eXBlb2Ygb3B0aW9ucz8ucHJlY2lzaW9uID09PSBcInVuZGVmaW5lZFwiID8gbnVsbCA6IG9wdGlvbnM/LnByZWNpc2lvbixcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihvcHRpb25zPy5tZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGR1cmF0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHsga2luZDogXCJkdXJhdGlvblwiLCAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkgfSk7XG4gICAgfVxuICAgIHJlZ2V4KHJlZ2V4LCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcInJlZ2V4XCIsXG4gICAgICAgICAgICByZWdleDogcmVnZXgsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbmNsdWRlcyh2YWx1ZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJpbmNsdWRlc1wiLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgcG9zaXRpb246IG9wdGlvbnM/LnBvc2l0aW9uLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG9wdGlvbnM/Lm1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc3RhcnRzV2l0aCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJzdGFydHNXaXRoXCIsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbmRzV2l0aCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJlbmRzV2l0aFwiLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbWluKG1pbkxlbmd0aCwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtaW5cIixcbiAgICAgICAgICAgIHZhbHVlOiBtaW5MZW5ndGgsXG4gICAgICAgICAgICAuLi5lcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtYXgobWF4TGVuZ3RoLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IG1heExlbmd0aCxcbiAgICAgICAgICAgIC4uLmVycm9yVXRpbC5lcnJUb09iaihtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGxlbmd0aChsZW4sIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibGVuZ3RoXCIsXG4gICAgICAgICAgICB2YWx1ZTogbGVuLFxuICAgICAgICAgICAgLi4uZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRXF1aXZhbGVudCB0byBgLm1pbigxKWBcbiAgICAgKi9cbiAgICBub25lbXB0eShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbigxLCBlcnJvclV0aWwuZXJyVG9PYmoobWVzc2FnZSkpO1xuICAgIH1cbiAgICB0cmltKCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFN0cmluZyh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFsuLi50aGlzLl9kZWYuY2hlY2tzLCB7IGtpbmQ6IFwidHJpbVwiIH1dLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgdG9Mb3dlckNhc2UoKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kU3RyaW5nKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogWy4uLnRoaXMuX2RlZi5jaGVja3MsIHsga2luZDogXCJ0b0xvd2VyQ2FzZVwiIH1dLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgdG9VcHBlckNhc2UoKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kU3RyaW5nKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogWy4uLnRoaXMuX2RlZi5jaGVja3MsIHsga2luZDogXCJ0b1VwcGVyQ2FzZVwiIH1dLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0IGlzRGF0ZXRpbWUoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiZGF0ZXRpbWVcIik7XG4gICAgfVxuICAgIGdldCBpc0RhdGUoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiZGF0ZVwiKTtcbiAgICB9XG4gICAgZ2V0IGlzVGltZSgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJ0aW1lXCIpO1xuICAgIH1cbiAgICBnZXQgaXNEdXJhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJkdXJhdGlvblwiKTtcbiAgICB9XG4gICAgZ2V0IGlzRW1haWwoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiZW1haWxcIik7XG4gICAgfVxuICAgIGdldCBpc1VSTCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJ1cmxcIik7XG4gICAgfVxuICAgIGdldCBpc0Vtb2ppKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImVtb2ppXCIpO1xuICAgIH1cbiAgICBnZXQgaXNVVUlEKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcInV1aWRcIik7XG4gICAgfVxuICAgIGdldCBpc05BTk9JRCgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fZGVmLmNoZWNrcy5maW5kKChjaCkgPT4gY2gua2luZCA9PT0gXCJuYW5vaWRcIik7XG4gICAgfVxuICAgIGdldCBpc0NVSUQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiY3VpZFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzQ1VJRDIoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiY3VpZDJcIik7XG4gICAgfVxuICAgIGdldCBpc1VMSUQoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwidWxpZFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzSVAoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiaXBcIik7XG4gICAgfVxuICAgIGdldCBpc0NJRFIoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX2RlZi5jaGVja3MuZmluZCgoY2gpID0+IGNoLmtpbmQgPT09IFwiY2lkclwiKTtcbiAgICB9XG4gICAgZ2V0IGlzQmFzZTY0KCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImJhc2U2NFwiKTtcbiAgICB9XG4gICAgZ2V0IGlzQmFzZTY0dXJsKCkge1xuICAgICAgICAvLyBiYXNlNjR1cmwgZW5jb2RpbmcgaXMgYSBtb2RpZmljYXRpb24gb2YgYmFzZTY0IHRoYXQgY2FuIHNhZmVseSBiZSB1c2VkIGluIFVSTHMgYW5kIGZpbGVuYW1lc1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImJhc2U2NHVybFwiKTtcbiAgICB9XG4gICAgZ2V0IG1pbkxlbmd0aCgpIHtcbiAgICAgICAgbGV0IG1pbiA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWluID09PSBudWxsIHx8IGNoLnZhbHVlID4gbWluKVxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWluO1xuICAgIH1cbiAgICBnZXQgbWF4TGVuZ3RoKCkge1xuICAgICAgICBsZXQgbWF4ID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGlmIChtYXggPT09IG51bGwgfHwgY2gudmFsdWUgPCBtYXgpXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXg7XG4gICAgfVxufVxuWm9kU3RyaW5nLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFN0cmluZyh7XG4gICAgICAgIGNoZWNrczogW10sXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kU3RyaW5nLFxuICAgICAgICBjb2VyY2U6IHBhcmFtcz8uY29lcmNlID8/IGZhbHNlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzk2NjQ4NC93aHktZG9lcy1tb2R1bHVzLW9wZXJhdG9yLXJldHVybi1mcmFjdGlvbmFsLW51bWJlci1pbi1qYXZhc2NyaXB0LzMxNzExMDM0IzMxNzExMDM0XG5mdW5jdGlvbiBmbG9hdFNhZmVSZW1haW5kZXIodmFsLCBzdGVwKSB7XG4gICAgY29uc3QgdmFsRGVjQ291bnQgPSAodmFsLnRvU3RyaW5nKCkuc3BsaXQoXCIuXCIpWzFdIHx8IFwiXCIpLmxlbmd0aDtcbiAgICBjb25zdCBzdGVwRGVjQ291bnQgPSAoc3RlcC50b1N0cmluZygpLnNwbGl0KFwiLlwiKVsxXSB8fCBcIlwiKS5sZW5ndGg7XG4gICAgY29uc3QgZGVjQ291bnQgPSB2YWxEZWNDb3VudCA+IHN0ZXBEZWNDb3VudCA/IHZhbERlY0NvdW50IDogc3RlcERlY0NvdW50O1xuICAgIGNvbnN0IHZhbEludCA9IE51bWJlci5wYXJzZUludCh2YWwudG9GaXhlZChkZWNDb3VudCkucmVwbGFjZShcIi5cIiwgXCJcIikpO1xuICAgIGNvbnN0IHN0ZXBJbnQgPSBOdW1iZXIucGFyc2VJbnQoc3RlcC50b0ZpeGVkKGRlY0NvdW50KS5yZXBsYWNlKFwiLlwiLCBcIlwiKSk7XG4gICAgcmV0dXJuICh2YWxJbnQgJSBzdGVwSW50KSAvIDEwICoqIGRlY0NvdW50O1xufVxuZXhwb3J0IGNsYXNzIFpvZE51bWJlciBleHRlbmRzIFpvZFR5cGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLm1pbiA9IHRoaXMuZ3RlO1xuICAgICAgICB0aGlzLm1heCA9IHRoaXMubHRlO1xuICAgICAgICB0aGlzLnN0ZXAgPSB0aGlzLm11bHRpcGxlT2Y7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5fZGVmLmNvZXJjZSkge1xuICAgICAgICAgICAgaW5wdXQuZGF0YSA9IE51bWJlcihpbnB1dC5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLm51bWJlcikge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5udW1iZXIsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY3R4ID0gdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBzdGF0dXMgPSBuZXcgUGFyc2VTdGF0dXMoKTtcbiAgICAgICAgZm9yIChjb25zdCBjaGVjayBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2sua2luZCA9PT0gXCJpbnRcIikge1xuICAgICAgICAgICAgICAgIGlmICghdXRpbC5pc0ludGVnZXIoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcImludGVnZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBcImZsb2F0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2sua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb1NtYWxsID0gY2hlY2suaW5jbHVzaXZlID8gaW5wdXQuZGF0YSA8IGNoZWNrLnZhbHVlIDogaW5wdXQuZGF0YSA8PSBjaGVjay52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodG9vU21hbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogY2hlY2suaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b29CaWcgPSBjaGVjay5pbmNsdXNpdmUgPyBpbnB1dC5kYXRhID4gY2hlY2sudmFsdWUgOiBpbnB1dC5kYXRhID49IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29CaWcpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwibnVtYmVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IGNoZWNrLmluY2x1c2l2ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm11bHRpcGxlT2ZcIikge1xuICAgICAgICAgICAgICAgIGlmIChmbG9hdFNhZmVSZW1haW5kZXIoaW5wdXQuZGF0YSwgY2hlY2sudmFsdWUpICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0LCBjdHgpO1xuICAgICAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5ub3RfbXVsdGlwbGVfb2YsXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZU9mOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcImZpbml0ZVwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLm5vdF9maW5pdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdXRpbC5hc3NlcnROZXZlcihjaGVjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBpbnB1dC5kYXRhIH07XG4gICAgfVxuICAgIGd0ZSh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1pblwiLCB2YWx1ZSwgdHJ1ZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgZ3QodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtaW5cIiwgdmFsdWUsIGZhbHNlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBsdGUodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtYXhcIiwgdmFsdWUsIHRydWUsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIGx0KHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWF4XCIsIHZhbHVlLCBmYWxzZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgc2V0TGltaXQoa2luZCwgdmFsdWUsIGluY2x1c2l2ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZE51bWJlcih7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjaGVja3M6IFtcbiAgICAgICAgICAgICAgICAuLi50aGlzLl9kZWYuY2hlY2tzLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAga2luZCxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgX2FkZENoZWNrKGNoZWNrKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kTnVtYmVyKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogWy4uLnRoaXMuX2RlZi5jaGVja3MsIGNoZWNrXSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGludChtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImludFwiLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcG9zaXRpdmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtaW5cIixcbiAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5lZ2F0aXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWF4XCIsXG4gICAgICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBub25wb3NpdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1heFwiLFxuICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBub25uZWdhdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtdWx0aXBsZU9mKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm11bHRpcGxlT2ZcIixcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGZpbml0ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcImZpbml0ZVwiLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc2FmZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IE51bWJlci5NSU5fU0FGRV9JTlRFR0VSLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KS5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtYXhcIixcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUixcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldCBtaW5WYWx1ZSgpIHtcbiAgICAgICAgbGV0IG1pbiA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWluID09PSBudWxsIHx8IGNoLnZhbHVlID4gbWluKVxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWluO1xuICAgIH1cbiAgICBnZXQgbWF4VmFsdWUoKSB7XG4gICAgICAgIGxldCBtYXggPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heCA9PT0gbnVsbCB8fCBjaC52YWx1ZSA8IG1heClcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICB9XG4gICAgZ2V0IGlzSW50KCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLl9kZWYuY2hlY2tzLmZpbmQoKGNoKSA9PiBjaC5raW5kID09PSBcImludFwiIHx8IChjaC5raW5kID09PSBcIm11bHRpcGxlT2ZcIiAmJiB1dGlsLmlzSW50ZWdlcihjaC52YWx1ZSkpKTtcbiAgICB9XG4gICAgZ2V0IGlzRmluaXRlKCkge1xuICAgICAgICBsZXQgbWF4ID0gbnVsbDtcbiAgICAgICAgbGV0IG1pbiA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwiZmluaXRlXCIgfHwgY2gua2luZCA9PT0gXCJpbnRcIiB8fCBjaC5raW5kID09PSBcIm11bHRpcGxlT2ZcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2gua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChtaW4gPT09IG51bGwgfHwgY2gudmFsdWUgPiBtaW4pXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY2gua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGlmIChtYXggPT09IG51bGwgfHwgY2gudmFsdWUgPCBtYXgpXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBOdW1iZXIuaXNGaW5pdGUobWluKSAmJiBOdW1iZXIuaXNGaW5pdGUobWF4KTtcbiAgICB9XG59XG5ab2ROdW1iZXIuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTnVtYmVyKHtcbiAgICAgICAgY2hlY2tzOiBbXSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2ROdW1iZXIsXG4gICAgICAgIGNvZXJjZTogcGFyYW1zPy5jb2VyY2UgfHwgZmFsc2UsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kQmlnSW50IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMubWluID0gdGhpcy5ndGU7XG4gICAgICAgIHRoaXMubWF4ID0gdGhpcy5sdGU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5fZGVmLmNvZXJjZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpbnB1dC5kYXRhID0gQmlnSW50KGlucHV0LmRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRJbnZhbGlkSW5wdXQoaW5wdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuYmlnaW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2V0SW52YWxpZElucHV0KGlucHV0KTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY3R4ID0gdW5kZWZpbmVkO1xuICAgICAgICBjb25zdCBzdGF0dXMgPSBuZXcgUGFyc2VTdGF0dXMoKTtcbiAgICAgICAgZm9yIChjb25zdCBjaGVjayBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2sua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb1NtYWxsID0gY2hlY2suaW5jbHVzaXZlID8gaW5wdXQuZGF0YSA8IGNoZWNrLnZhbHVlIDogaW5wdXQuZGF0YSA8PSBjaGVjay52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodG9vU21hbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiYmlnaW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBjaGVjay52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogY2hlY2suaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b29CaWcgPSBjaGVjay5pbmNsdXNpdmUgPyBpbnB1dC5kYXRhID4gY2hlY2sudmFsdWUgOiBpbnB1dC5kYXRhID49IGNoZWNrLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh0b29CaWcpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImJpZ2ludFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IGNoZWNrLmluY2x1c2l2ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGNoZWNrLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm11bHRpcGxlT2ZcIikge1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dC5kYXRhICUgY2hlY2sudmFsdWUgIT09IEJpZ0ludCgwKSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUubm90X211bHRpcGxlX29mLFxuICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGVPZjogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdXRpbC5hc3NlcnROZXZlcihjaGVjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiBpbnB1dC5kYXRhIH07XG4gICAgfVxuICAgIF9nZXRJbnZhbGlkSW5wdXQoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5iaWdpbnQsXG4gICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICB9XG4gICAgZ3RlKHZhbHVlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldExpbWl0KFwibWluXCIsIHZhbHVlLCB0cnVlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBndCh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1pblwiLCB2YWx1ZSwgZmFsc2UsIGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSk7XG4gICAgfVxuICAgIGx0ZSh2YWx1ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRMaW1pdChcIm1heFwiLCB2YWx1ZSwgdHJ1ZSwgZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpKTtcbiAgICB9XG4gICAgbHQodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0TGltaXQoXCJtYXhcIiwgdmFsdWUsIGZhbHNlLCBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkpO1xuICAgIH1cbiAgICBzZXRMaW1pdChraW5kLCB2YWx1ZSwgaW5jbHVzaXZlLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQmlnSW50KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGNoZWNrczogW1xuICAgICAgICAgICAgICAgIC4uLnRoaXMuX2RlZi5jaGVja3MsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBraW5kLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBfYWRkQ2hlY2soY2hlY2spIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RCaWdJbnQoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgY2hlY2tdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcG9zaXRpdmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtaW5cIixcbiAgICAgICAgICAgIHZhbHVlOiBCaWdJbnQoMCksXG4gICAgICAgICAgICBpbmNsdXNpdmU6IGZhbHNlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbmVnYXRpdmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtYXhcIixcbiAgICAgICAgICAgIHZhbHVlOiBCaWdJbnQoMCksXG4gICAgICAgICAgICBpbmNsdXNpdmU6IGZhbHNlLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbm9ucG9zaXRpdmUobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtYXhcIixcbiAgICAgICAgICAgIHZhbHVlOiBCaWdJbnQoMCksXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBub25uZWdhdGl2ZShtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hZGRDaGVjayh7XG4gICAgICAgICAgICBraW5kOiBcIm1pblwiLFxuICAgICAgICAgICAgdmFsdWU6IEJpZ0ludCgwKSxcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG11bHRpcGxlT2YodmFsdWUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibXVsdGlwbGVPZlwiLFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXQgbWluVmFsdWUoKSB7XG4gICAgICAgIGxldCBtaW4gPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuX2RlZi5jaGVja3MpIHtcbiAgICAgICAgICAgIGlmIChjaC5raW5kID09PSBcIm1pblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1pbiA9PT0gbnVsbCB8fCBjaC52YWx1ZSA+IG1pbilcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2gudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1pbjtcbiAgICB9XG4gICAgZ2V0IG1heFZhbHVlKCkge1xuICAgICAgICBsZXQgbWF4ID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtYXhcIikge1xuICAgICAgICAgICAgICAgIGlmIChtYXggPT09IG51bGwgfHwgY2gudmFsdWUgPCBtYXgpXG4gICAgICAgICAgICAgICAgICAgIG1heCA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXg7XG4gICAgfVxufVxuWm9kQmlnSW50LmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEJpZ0ludCh7XG4gICAgICAgIGNoZWNrczogW10sXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQmlnSW50LFxuICAgICAgICBjb2VyY2U6IHBhcmFtcz8uY29lcmNlID8/IGZhbHNlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZEJvb2xlYW4gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RlZi5jb2VyY2UpIHtcbiAgICAgICAgICAgIGlucHV0LmRhdGEgPSBCb29sZWFuKGlucHV0LmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuYm9vbGVhbikge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5ib29sZWFuLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZEJvb2xlYW4uY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kQm9vbGVhbih7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQm9vbGVhbixcbiAgICAgICAgY29lcmNlOiBwYXJhbXM/LmNvZXJjZSB8fCBmYWxzZSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2REYXRlIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY29lcmNlKSB7XG4gICAgICAgICAgICBpbnB1dC5kYXRhID0gbmV3IERhdGUoaW5wdXQuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5kYXRlKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmRhdGUsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoTnVtYmVyLmlzTmFOKGlucHV0LmRhdGEuZ2V0VGltZSgpKSkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfZGF0ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc3RhdHVzID0gbmV3IFBhcnNlU3RhdHVzKCk7XG4gICAgICAgIGxldCBjdHggPSB1bmRlZmluZWQ7XG4gICAgICAgIGZvciAoY29uc3QgY2hlY2sgb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoZWNrLmtpbmQgPT09IFwibWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuZGF0YS5nZXRUaW1lKCkgPCBjaGVjay52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCwgY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY2hlY2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4YWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltdW06IGNoZWNrLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJkYXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjaGVjay5raW5kID09PSBcIm1heFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0LmRhdGEuZ2V0VGltZSgpID4gY2hlY2sudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQsIGN0eCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjaGVjay5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogY2hlY2sudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImRhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHV0aWwuYXNzZXJ0TmV2ZXIoY2hlY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGF0dXM6IHN0YXR1cy52YWx1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBuZXcgRGF0ZShpbnB1dC5kYXRhLmdldFRpbWUoKSksXG4gICAgICAgIH07XG4gICAgfVxuICAgIF9hZGRDaGVjayhjaGVjaykge1xuICAgICAgICByZXR1cm4gbmV3IFpvZERhdGUoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgY2hlY2tzOiBbLi4udGhpcy5fZGVmLmNoZWNrcywgY2hlY2tdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbWluKG1pbkRhdGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FkZENoZWNrKHtcbiAgICAgICAgICAgIGtpbmQ6IFwibWluXCIsXG4gICAgICAgICAgICB2YWx1ZTogbWluRGF0ZS5nZXRUaW1lKCksXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtYXgobWF4RGF0ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWRkQ2hlY2soe1xuICAgICAgICAgICAga2luZDogXCJtYXhcIixcbiAgICAgICAgICAgIHZhbHVlOiBtYXhEYXRlLmdldFRpbWUoKSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldCBtaW5EYXRlKCkge1xuICAgICAgICBsZXQgbWluID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCBjaCBvZiB0aGlzLl9kZWYuY2hlY2tzKSB7XG4gICAgICAgICAgICBpZiAoY2gua2luZCA9PT0gXCJtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmIChtaW4gPT09IG51bGwgfHwgY2gudmFsdWUgPiBtaW4pXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNoLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtaW4gIT0gbnVsbCA/IG5ldyBEYXRlKG1pbikgOiBudWxsO1xuICAgIH1cbiAgICBnZXQgbWF4RGF0ZSgpIHtcbiAgICAgICAgbGV0IG1heCA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgY2ggb2YgdGhpcy5fZGVmLmNoZWNrcykge1xuICAgICAgICAgICAgaWYgKGNoLmtpbmQgPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWF4ID09PSBudWxsIHx8IGNoLnZhbHVlIDwgbWF4KVxuICAgICAgICAgICAgICAgICAgICBtYXggPSBjaC52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF4ICE9IG51bGwgPyBuZXcgRGF0ZShtYXgpIDogbnVsbDtcbiAgICB9XG59XG5ab2REYXRlLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZERhdGUoe1xuICAgICAgICBjaGVja3M6IFtdLFxuICAgICAgICBjb2VyY2U6IHBhcmFtcz8uY29lcmNlIHx8IGZhbHNlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZERhdGUsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kU3ltYm9sIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUuc3ltYm9sKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLnN5bWJvbCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG59XG5ab2RTeW1ib2wuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kU3ltYm9sKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RTeW1ib2wsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kVW5kZWZpbmVkIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLnVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG59XG5ab2RVbmRlZmluZWQuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kVW5kZWZpbmVkKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RVbmRlZmluZWQsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kTnVsbCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLm51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUubnVsbCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPSyhpbnB1dC5kYXRhKTtcbiAgICB9XG59XG5ab2ROdWxsLmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE51bGwoe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE51bGwsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kQW55IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIC8vIHRvIHByZXZlbnQgaW5zdGFuY2VzIG9mIG90aGVyIGNsYXNzZXMgZnJvbSBleHRlbmRpbmcgWm9kQW55LiB0aGlzIGNhdXNlcyBpc3N1ZXMgd2l0aCBjYXRjaGFsbCBpbiBab2RPYmplY3QuXG4gICAgICAgIHRoaXMuX2FueSA9IHRydWU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuWm9kQW55LmNyZWF0ZSA9IChwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZEFueSh7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kQW55LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZFVua25vd24gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgLy8gcmVxdWlyZWRcbiAgICAgICAgdGhpcy5fdW5rbm93biA9IHRydWU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxufVxuWm9kVW5rbm93bi5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RVbmtub3duKHtcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RVbmtub3duLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZE5ldmVyIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUubmV2ZXIsXG4gICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICB9XG59XG5ab2ROZXZlci5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2ROZXZlcih7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTmV2ZXIsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kVm9pZCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBwYXJzZWRUeXBlID0gdGhpcy5fZ2V0VHlwZShpbnB1dCk7XG4gICAgICAgIGlmIChwYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLnVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gdGhpcy5fZ2V0T3JSZXR1cm5DdHgoaW5wdXQpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS52b2lkLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9LKGlucHV0LmRhdGEpO1xuICAgIH1cbn1cblpvZFZvaWQuY3JlYXRlID0gKHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kVm9pZCh7XG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kVm9pZCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RBcnJheSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCwgc3RhdHVzIH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCBkZWYgPSB0aGlzLl9kZWY7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5hcnJheSkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5hcnJheSxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZWYuZXhhY3RMZW5ndGggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHRvb0JpZyA9IGN0eC5kYXRhLmxlbmd0aCA+IGRlZi5leGFjdExlbmd0aC52YWx1ZTtcbiAgICAgICAgICAgIGNvbnN0IHRvb1NtYWxsID0gY3R4LmRhdGEubGVuZ3RoIDwgZGVmLmV4YWN0TGVuZ3RoLnZhbHVlO1xuICAgICAgICAgICAgaWYgKHRvb0JpZyB8fCB0b29TbWFsbCkge1xuICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiB0b29CaWcgPyBab2RJc3N1ZUNvZGUudG9vX2JpZyA6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgICAgIG1pbmltdW06ICh0b29TbWFsbCA/IGRlZi5leGFjdExlbmd0aC52YWx1ZSA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgICAgIG1heGltdW06ICh0b29CaWcgPyBkZWYuZXhhY3RMZW5ndGgudmFsdWUgOiB1bmRlZmluZWQpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZi5leGFjdExlbmd0aC5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChkZWYubWluTGVuZ3RoICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoY3R4LmRhdGEubGVuZ3RoIDwgZGVmLm1pbkxlbmd0aC52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX3NtYWxsLFxuICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBkZWYubWluTGVuZ3RoLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBkZWYubWluTGVuZ3RoLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZi5tYXhMZW5ndGggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjdHguZGF0YS5sZW5ndGggPiBkZWYubWF4TGVuZ3RoLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fYmlnLFxuICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBkZWYubWF4TGVuZ3RoLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBkZWYubWF4TGVuZ3RoLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbLi4uY3R4LmRhdGFdLm1hcCgoaXRlbSwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWYudHlwZS5fcGFyc2VBc3luYyhuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgaXRlbSwgY3R4LnBhdGgsIGkpKTtcbiAgICAgICAgICAgIH0pKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VBcnJheShzdGF0dXMsIHJlc3VsdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXN1bHQgPSBbLi4uY3R4LmRhdGFdLm1hcCgoaXRlbSwgaSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGRlZi50eXBlLl9wYXJzZVN5bmMobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIGl0ZW0sIGN0eC5wYXRoLCBpKSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VBcnJheShzdGF0dXMsIHJlc3VsdCk7XG4gICAgfVxuICAgIGdldCBlbGVtZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnR5cGU7XG4gICAgfVxuICAgIG1pbihtaW5MZW5ndGgsIG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RBcnJheSh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBtaW5MZW5ndGg6IHsgdmFsdWU6IG1pbkxlbmd0aCwgbWVzc2FnZTogZXJyb3JVdGlsLnRvU3RyaW5nKG1lc3NhZ2UpIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtYXgobWF4TGVuZ3RoLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kQXJyYXkoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgbWF4TGVuZ3RoOiB7IHZhbHVlOiBtYXhMZW5ndGgsIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbGVuZ3RoKGxlbiwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEFycmF5KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIGV4YWN0TGVuZ3RoOiB7IHZhbHVlOiBsZW4sIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgbm9uZW1wdHkobWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5taW4oMSwgbWVzc2FnZSk7XG4gICAgfVxufVxuWm9kQXJyYXkuY3JlYXRlID0gKHNjaGVtYSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RBcnJheSh7XG4gICAgICAgIHR5cGU6IHNjaGVtYSxcbiAgICAgICAgbWluTGVuZ3RoOiBudWxsLFxuICAgICAgICBtYXhMZW5ndGg6IG51bGwsXG4gICAgICAgIGV4YWN0TGVuZ3RoOiBudWxsLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEFycmF5LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZnVuY3Rpb24gZGVlcFBhcnRpYWxpZnkoc2NoZW1hKSB7XG4gICAgaWYgKHNjaGVtYSBpbnN0YW5jZW9mIFpvZE9iamVjdCkge1xuICAgICAgICBjb25zdCBuZXdTaGFwZSA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzY2hlbWEuc2hhcGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkU2NoZW1hID0gc2NoZW1hLnNoYXBlW2tleV07XG4gICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gWm9kT3B0aW9uYWwuY3JlYXRlKGRlZXBQYXJ0aWFsaWZ5KGZpZWxkU2NoZW1hKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4uc2NoZW1hLl9kZWYsXG4gICAgICAgICAgICBzaGFwZTogKCkgPT4gbmV3U2hhcGUsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChzY2hlbWEgaW5zdGFuY2VvZiBab2RBcnJheSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZEFycmF5KHtcbiAgICAgICAgICAgIC4uLnNjaGVtYS5fZGVmLFxuICAgICAgICAgICAgdHlwZTogZGVlcFBhcnRpYWxpZnkoc2NoZW1hLmVsZW1lbnQpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoc2NoZW1hIGluc3RhbmNlb2YgWm9kT3B0aW9uYWwpIHtcbiAgICAgICAgcmV0dXJuIFpvZE9wdGlvbmFsLmNyZWF0ZShkZWVwUGFydGlhbGlmeShzY2hlbWEudW53cmFwKCkpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoc2NoZW1hIGluc3RhbmNlb2YgWm9kTnVsbGFibGUpIHtcbiAgICAgICAgcmV0dXJuIFpvZE51bGxhYmxlLmNyZWF0ZShkZWVwUGFydGlhbGlmeShzY2hlbWEudW53cmFwKCkpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoc2NoZW1hIGluc3RhbmNlb2YgWm9kVHVwbGUpIHtcbiAgICAgICAgcmV0dXJuIFpvZFR1cGxlLmNyZWF0ZShzY2hlbWEuaXRlbXMubWFwKChpdGVtKSA9PiBkZWVwUGFydGlhbGlmeShpdGVtKSkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNjaGVtYTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgWm9kT2JqZWN0IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMuX2NhY2hlZCA9IG51bGw7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAZGVwcmVjYXRlZCBJbiBtb3N0IGNhc2VzLCB0aGlzIGlzIG5vIGxvbmdlciBuZWVkZWQgLSB1bmtub3duIHByb3BlcnRpZXMgYXJlIG5vdyBzaWxlbnRseSBzdHJpcHBlZC5cbiAgICAgICAgICogSWYgeW91IHdhbnQgdG8gcGFzcyB0aHJvdWdoIHVua25vd24gcHJvcGVydGllcywgdXNlIGAucGFzc3Rocm91Z2goKWAgaW5zdGVhZC5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubm9uc3RyaWN0ID0gdGhpcy5wYXNzdGhyb3VnaDtcbiAgICAgICAgLy8gZXh0ZW5kPFxuICAgICAgICAvLyAgIEF1Z21lbnRhdGlvbiBleHRlbmRzIFpvZFJhd1NoYXBlLFxuICAgICAgICAvLyAgIE5ld091dHB1dCBleHRlbmRzIHV0aWwuZmxhdHRlbjx7XG4gICAgICAgIC8vICAgICBbayBpbiBrZXlvZiBBdWdtZW50YXRpb24gfCBrZXlvZiBPdXRwdXRdOiBrIGV4dGVuZHMga2V5b2YgQXVnbWVudGF0aW9uXG4gICAgICAgIC8vICAgICAgID8gQXVnbWVudGF0aW9uW2tdW1wiX291dHB1dFwiXVxuICAgICAgICAvLyAgICAgICA6IGsgZXh0ZW5kcyBrZXlvZiBPdXRwdXRcbiAgICAgICAgLy8gICAgICAgPyBPdXRwdXRba11cbiAgICAgICAgLy8gICAgICAgOiBuZXZlcjtcbiAgICAgICAgLy8gICB9PixcbiAgICAgICAgLy8gICBOZXdJbnB1dCBleHRlbmRzIHV0aWwuZmxhdHRlbjx7XG4gICAgICAgIC8vICAgICBbayBpbiBrZXlvZiBBdWdtZW50YXRpb24gfCBrZXlvZiBJbnB1dF06IGsgZXh0ZW5kcyBrZXlvZiBBdWdtZW50YXRpb25cbiAgICAgICAgLy8gICAgICAgPyBBdWdtZW50YXRpb25ba11bXCJfaW5wdXRcIl1cbiAgICAgICAgLy8gICAgICAgOiBrIGV4dGVuZHMga2V5b2YgSW5wdXRcbiAgICAgICAgLy8gICAgICAgPyBJbnB1dFtrXVxuICAgICAgICAvLyAgICAgICA6IG5ldmVyO1xuICAgICAgICAvLyAgIH0+XG4gICAgICAgIC8vID4oXG4gICAgICAgIC8vICAgYXVnbWVudGF0aW9uOiBBdWdtZW50YXRpb25cbiAgICAgICAgLy8gKTogWm9kT2JqZWN0PFxuICAgICAgICAvLyAgIGV4dGVuZFNoYXBlPFQsIEF1Z21lbnRhdGlvbj4sXG4gICAgICAgIC8vICAgVW5rbm93bktleXMsXG4gICAgICAgIC8vICAgQ2F0Y2hhbGwsXG4gICAgICAgIC8vICAgTmV3T3V0cHV0LFxuICAgICAgICAvLyAgIE5ld0lucHV0XG4gICAgICAgIC8vID4ge1xuICAgICAgICAvLyAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgLy8gICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgLy8gICAgIHNoYXBlOiAoKSA9PiAoe1xuICAgICAgICAvLyAgICAgICAuLi50aGlzLl9kZWYuc2hhcGUoKSxcbiAgICAgICAgLy8gICAgICAgLi4uYXVnbWVudGF0aW9uLFxuICAgICAgICAvLyAgICAgfSksXG4gICAgICAgIC8vICAgfSkgYXMgYW55O1xuICAgICAgICAvLyB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAZGVwcmVjYXRlZCBVc2UgYC5leHRlbmRgIGluc3RlYWRcbiAgICAgICAgICogICovXG4gICAgICAgIHRoaXMuYXVnbWVudCA9IHRoaXMuZXh0ZW5kO1xuICAgIH1cbiAgICBfZ2V0Q2FjaGVkKCkge1xuICAgICAgICBpZiAodGhpcy5fY2FjaGVkICE9PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZDtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB0aGlzLl9kZWYuc2hhcGUoKTtcbiAgICAgICAgY29uc3Qga2V5cyA9IHV0aWwub2JqZWN0S2V5cyhzaGFwZSk7XG4gICAgICAgIHRoaXMuX2NhY2hlZCA9IHsgc2hhcGUsIGtleXMgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZDtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUub2JqZWN0KSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm9iamVjdCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IHsgc2hhcGUsIGtleXM6IHNoYXBlS2V5cyB9ID0gdGhpcy5fZ2V0Q2FjaGVkKCk7XG4gICAgICAgIGNvbnN0IGV4dHJhS2V5cyA9IFtdO1xuICAgICAgICBpZiAoISh0aGlzLl9kZWYuY2F0Y2hhbGwgaW5zdGFuY2VvZiBab2ROZXZlciAmJiB0aGlzLl9kZWYudW5rbm93bktleXMgPT09IFwic3RyaXBcIikpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIGN0eC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzaGFwZUtleXMuaW5jbHVkZXMoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBleHRyYUtleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYWlycyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBzaGFwZUtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleVZhbGlkYXRvciA9IHNoYXBlW2tleV07XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGN0eC5kYXRhW2tleV07XG4gICAgICAgICAgICBwYWlycy5wdXNoKHtcbiAgICAgICAgICAgICAgICBrZXk6IHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlOiBrZXkgfSxcbiAgICAgICAgICAgICAgICB2YWx1ZToga2V5VmFsaWRhdG9yLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgdmFsdWUsIGN0eC5wYXRoLCBrZXkpKSxcbiAgICAgICAgICAgICAgICBhbHdheXNTZXQ6IGtleSBpbiBjdHguZGF0YSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9kZWYuY2F0Y2hhbGwgaW5zdGFuY2VvZiBab2ROZXZlcikge1xuICAgICAgICAgICAgY29uc3QgdW5rbm93bktleXMgPSB0aGlzLl9kZWYudW5rbm93bktleXM7XG4gICAgICAgICAgICBpZiAodW5rbm93bktleXMgPT09IFwicGFzc3Rocm91Z2hcIikge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGV4dHJhS2V5cykge1xuICAgICAgICAgICAgICAgICAgICBwYWlycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogeyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGtleSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHsgc3RhdHVzOiBcInZhbGlkXCIsIHZhbHVlOiBjdHguZGF0YVtrZXldIH0sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHVua25vd25LZXlzID09PSBcInN0cmljdFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV4dHJhS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnVucmVjb2duaXplZF9rZXlzLFxuICAgICAgICAgICAgICAgICAgICAgICAga2V5czogZXh0cmFLZXlzLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodW5rbm93bktleXMgPT09IFwic3RyaXBcIikge1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnRlcm5hbCBab2RPYmplY3QgZXJyb3I6IGludmFsaWQgdW5rbm93bktleXMgdmFsdWUuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBydW4gY2F0Y2hhbGwgdmFsaWRhdGlvblxuICAgICAgICAgICAgY29uc3QgY2F0Y2hhbGwgPSB0aGlzLl9kZWYuY2F0Y2hhbGw7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBleHRyYUtleXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGN0eC5kYXRhW2tleV07XG4gICAgICAgICAgICAgICAgcGFpcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGtleTogeyBzdGF0dXM6IFwidmFsaWRcIiwgdmFsdWU6IGtleSB9LFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY2F0Y2hhbGwuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCB2YWx1ZSwgY3R4LnBhdGgsIGtleSkgLy8sIGN0eC5jaGlsZChrZXkpLCB2YWx1ZSwgZ2V0UGFyc2VkVHlwZSh2YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgYWx3YXlzU2V0OiBrZXkgaW4gY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICAgICAgICAgIC50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzeW5jUGFpcnMgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgcGFpci5rZXk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgcGFpci52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgc3luY1BhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbHdheXNTZXQ6IHBhaXIuYWx3YXlzU2V0LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN5bmNQYWlycztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oKHN5bmNQYWlycykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBQYXJzZVN0YXR1cy5tZXJnZU9iamVjdFN5bmMoc3RhdHVzLCBzeW5jUGFpcnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VPYmplY3RTeW5jKHN0YXR1cywgcGFpcnMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBzaGFwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5zaGFwZSgpO1xuICAgIH1cbiAgICBzdHJpY3QobWVzc2FnZSkge1xuICAgICAgICBlcnJvclV0aWwuZXJyVG9PYmo7XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHVua25vd25LZXlzOiBcInN0cmljdFwiLFxuICAgICAgICAgICAgLi4uKG1lc3NhZ2UgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICBlcnJvck1hcDogKGlzc3VlLCBjdHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRFcnJvciA9IHRoaXMuX2RlZi5lcnJvck1hcD8uKGlzc3VlLCBjdHgpLm1lc3NhZ2UgPz8gY3R4LmRlZmF1bHRFcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc3N1ZS5jb2RlID09PSBcInVucmVjb2duaXplZF9rZXlzXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JVdGlsLmVyclRvT2JqKG1lc3NhZ2UpLm1lc3NhZ2UgPz8gZGVmYXVsdEVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZmF1bHRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDoge30pLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc3RyaXAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHVua25vd25LZXlzOiBcInN0cmlwXCIsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwYXNzdGhyb3VnaCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgdW5rbm93bktleXM6IFwicGFzc3Rocm91Z2hcIixcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGNvbnN0IEF1Z21lbnRGYWN0b3J5ID1cbiAgICAvLyAgIDxEZWYgZXh0ZW5kcyBab2RPYmplY3REZWY+KGRlZjogRGVmKSA9PlxuICAgIC8vICAgPEF1Z21lbnRhdGlvbiBleHRlbmRzIFpvZFJhd1NoYXBlPihcbiAgICAvLyAgICAgYXVnbWVudGF0aW9uOiBBdWdtZW50YXRpb25cbiAgICAvLyAgICk6IFpvZE9iamVjdDxcbiAgICAvLyAgICAgZXh0ZW5kU2hhcGU8UmV0dXJuVHlwZTxEZWZbXCJzaGFwZVwiXT4sIEF1Z21lbnRhdGlvbj4sXG4gICAgLy8gICAgIERlZltcInVua25vd25LZXlzXCJdLFxuICAgIC8vICAgICBEZWZbXCJjYXRjaGFsbFwiXVxuICAgIC8vICAgPiA9PiB7XG4gICAgLy8gICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAvLyAgICAgICAuLi5kZWYsXG4gICAgLy8gICAgICAgc2hhcGU6ICgpID0+ICh7XG4gICAgLy8gICAgICAgICAuLi5kZWYuc2hhcGUoKSxcbiAgICAvLyAgICAgICAgIC4uLmF1Z21lbnRhdGlvbixcbiAgICAvLyAgICAgICB9KSxcbiAgICAvLyAgICAgfSkgYXMgYW55O1xuICAgIC8vICAgfTtcbiAgICBleHRlbmQoYXVnbWVudGF0aW9uKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiAoe1xuICAgICAgICAgICAgICAgIC4uLnRoaXMuX2RlZi5zaGFwZSgpLFxuICAgICAgICAgICAgICAgIC4uLmF1Z21lbnRhdGlvbixcbiAgICAgICAgICAgIH0pLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHJpb3IgdG8gem9kQDEuMC4xMiB0aGVyZSB3YXMgYSBidWcgaW4gdGhlXG4gICAgICogaW5mZXJyZWQgdHlwZSBvZiBtZXJnZWQgb2JqZWN0cy4gUGxlYXNlXG4gICAgICogdXBncmFkZSBpZiB5b3UgYXJlIGV4cGVyaWVuY2luZyBpc3N1ZXMuXG4gICAgICovXG4gICAgbWVyZ2UobWVyZ2luZykge1xuICAgICAgICBjb25zdCBtZXJnZWQgPSBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIHVua25vd25LZXlzOiBtZXJnaW5nLl9kZWYudW5rbm93bktleXMsXG4gICAgICAgICAgICBjYXRjaGFsbDogbWVyZ2luZy5fZGVmLmNhdGNoYWxsLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+ICh7XG4gICAgICAgICAgICAgICAgLi4udGhpcy5fZGVmLnNoYXBlKCksXG4gICAgICAgICAgICAgICAgLi4ubWVyZ2luZy5fZGVmLnNoYXBlKCksXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kT2JqZWN0LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG1lcmdlZDtcbiAgICB9XG4gICAgLy8gbWVyZ2U8XG4gICAgLy8gICBJbmNvbWluZyBleHRlbmRzIEFueVpvZE9iamVjdCxcbiAgICAvLyAgIEF1Z21lbnRhdGlvbiBleHRlbmRzIEluY29taW5nW1wic2hhcGVcIl0sXG4gICAgLy8gICBOZXdPdXRwdXQgZXh0ZW5kcyB7XG4gICAgLy8gICAgIFtrIGluIGtleW9mIEF1Z21lbnRhdGlvbiB8IGtleW9mIE91dHB1dF06IGsgZXh0ZW5kcyBrZXlvZiBBdWdtZW50YXRpb25cbiAgICAvLyAgICAgICA/IEF1Z21lbnRhdGlvbltrXVtcIl9vdXRwdXRcIl1cbiAgICAvLyAgICAgICA6IGsgZXh0ZW5kcyBrZXlvZiBPdXRwdXRcbiAgICAvLyAgICAgICA/IE91dHB1dFtrXVxuICAgIC8vICAgICAgIDogbmV2ZXI7XG4gICAgLy8gICB9LFxuICAgIC8vICAgTmV3SW5wdXQgZXh0ZW5kcyB7XG4gICAgLy8gICAgIFtrIGluIGtleW9mIEF1Z21lbnRhdGlvbiB8IGtleW9mIElucHV0XTogayBleHRlbmRzIGtleW9mIEF1Z21lbnRhdGlvblxuICAgIC8vICAgICAgID8gQXVnbWVudGF0aW9uW2tdW1wiX2lucHV0XCJdXG4gICAgLy8gICAgICAgOiBrIGV4dGVuZHMga2V5b2YgSW5wdXRcbiAgICAvLyAgICAgICA/IElucHV0W2tdXG4gICAgLy8gICAgICAgOiBuZXZlcjtcbiAgICAvLyAgIH1cbiAgICAvLyA+KFxuICAgIC8vICAgbWVyZ2luZzogSW5jb21pbmdcbiAgICAvLyApOiBab2RPYmplY3Q8XG4gICAgLy8gICBleHRlbmRTaGFwZTxULCBSZXR1cm5UeXBlPEluY29taW5nW1wiX2RlZlwiXVtcInNoYXBlXCJdPj4sXG4gICAgLy8gICBJbmNvbWluZ1tcIl9kZWZcIl1bXCJ1bmtub3duS2V5c1wiXSxcbiAgICAvLyAgIEluY29taW5nW1wiX2RlZlwiXVtcImNhdGNoYWxsXCJdLFxuICAgIC8vICAgTmV3T3V0cHV0LFxuICAgIC8vICAgTmV3SW5wdXRcbiAgICAvLyA+IHtcbiAgICAvLyAgIGNvbnN0IG1lcmdlZDogYW55ID0gbmV3IFpvZE9iamVjdCh7XG4gICAgLy8gICAgIHVua25vd25LZXlzOiBtZXJnaW5nLl9kZWYudW5rbm93bktleXMsXG4gICAgLy8gICAgIGNhdGNoYWxsOiBtZXJnaW5nLl9kZWYuY2F0Y2hhbGwsXG4gICAgLy8gICAgIHNoYXBlOiAoKSA9PlxuICAgIC8vICAgICAgIG9iamVjdFV0aWwubWVyZ2VTaGFwZXModGhpcy5fZGVmLnNoYXBlKCksIG1lcmdpbmcuX2RlZi5zaGFwZSgpKSxcbiAgICAvLyAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgLy8gICB9KSBhcyBhbnk7XG4gICAgLy8gICByZXR1cm4gbWVyZ2VkO1xuICAgIC8vIH1cbiAgICBzZXRLZXkoa2V5LCBzY2hlbWEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXVnbWVudCh7IFtrZXldOiBzY2hlbWEgfSk7XG4gICAgfVxuICAgIC8vIG1lcmdlPEluY29taW5nIGV4dGVuZHMgQW55Wm9kT2JqZWN0PihcbiAgICAvLyAgIG1lcmdpbmc6IEluY29taW5nXG4gICAgLy8gKTogLy9ab2RPYmplY3Q8VCAmIEluY29taW5nW1wiX3NoYXBlXCJdLCBVbmtub3duS2V5cywgQ2F0Y2hhbGw+ID0gKG1lcmdpbmcpID0+IHtcbiAgICAvLyBab2RPYmplY3Q8XG4gICAgLy8gICBleHRlbmRTaGFwZTxULCBSZXR1cm5UeXBlPEluY29taW5nW1wiX2RlZlwiXVtcInNoYXBlXCJdPj4sXG4gICAgLy8gICBJbmNvbWluZ1tcIl9kZWZcIl1bXCJ1bmtub3duS2V5c1wiXSxcbiAgICAvLyAgIEluY29taW5nW1wiX2RlZlwiXVtcImNhdGNoYWxsXCJdXG4gICAgLy8gPiB7XG4gICAgLy8gICAvLyBjb25zdCBtZXJnZWRTaGFwZSA9IG9iamVjdFV0aWwubWVyZ2VTaGFwZXMoXG4gICAgLy8gICAvLyAgIHRoaXMuX2RlZi5zaGFwZSgpLFxuICAgIC8vICAgLy8gICBtZXJnaW5nLl9kZWYuc2hhcGUoKVxuICAgIC8vICAgLy8gKTtcbiAgICAvLyAgIGNvbnN0IG1lcmdlZDogYW55ID0gbmV3IFpvZE9iamVjdCh7XG4gICAgLy8gICAgIHVua25vd25LZXlzOiBtZXJnaW5nLl9kZWYudW5rbm93bktleXMsXG4gICAgLy8gICAgIGNhdGNoYWxsOiBtZXJnaW5nLl9kZWYuY2F0Y2hhbGwsXG4gICAgLy8gICAgIHNoYXBlOiAoKSA9PlxuICAgIC8vICAgICAgIG9iamVjdFV0aWwubWVyZ2VTaGFwZXModGhpcy5fZGVmLnNoYXBlKCksIG1lcmdpbmcuX2RlZi5zaGFwZSgpKSxcbiAgICAvLyAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgLy8gICB9KSBhcyBhbnk7XG4gICAgLy8gICByZXR1cm4gbWVyZ2VkO1xuICAgIC8vIH1cbiAgICBjYXRjaGFsbChpbmRleCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBjYXRjaGFsbDogaW5kZXgsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwaWNrKG1hc2spIHtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdXRpbC5vYmplY3RLZXlzKG1hc2spKSB7XG4gICAgICAgICAgICBpZiAobWFza1trZXldICYmIHRoaXMuc2hhcGVba2V5XSkge1xuICAgICAgICAgICAgICAgIHNoYXBlW2tleV0gPSB0aGlzLnNoYXBlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+IHNoYXBlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgb21pdChtYXNrKSB7XG4gICAgICAgIGNvbnN0IHNoYXBlID0ge307XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHV0aWwub2JqZWN0S2V5cyh0aGlzLnNoYXBlKSkge1xuICAgICAgICAgICAgaWYgKCFtYXNrW2tleV0pIHtcbiAgICAgICAgICAgICAgICBzaGFwZVtrZXldID0gdGhpcy5zaGFwZVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiBzaGFwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgZGVlcFBhcnRpYWwoKSB7XG4gICAgICAgIHJldHVybiBkZWVwUGFydGlhbGlmeSh0aGlzKTtcbiAgICB9XG4gICAgcGFydGlhbChtYXNrKSB7XG4gICAgICAgIGNvbnN0IG5ld1NoYXBlID0ge307XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHV0aWwub2JqZWN0S2V5cyh0aGlzLnNoYXBlKSkge1xuICAgICAgICAgICAgY29uc3QgZmllbGRTY2hlbWEgPSB0aGlzLnNoYXBlW2tleV07XG4gICAgICAgICAgICBpZiAobWFzayAmJiAhbWFza1trZXldKSB7XG4gICAgICAgICAgICAgICAgbmV3U2hhcGVba2V5XSA9IGZpZWxkU2NoZW1hO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3U2hhcGVba2V5XSA9IGZpZWxkU2NoZW1hLm9wdGlvbmFsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgc2hhcGU6ICgpID0+IG5ld1NoYXBlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmVxdWlyZWQobWFzaykge1xuICAgICAgICBjb25zdCBuZXdTaGFwZSA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB1dGlsLm9iamVjdEtleXModGhpcy5zaGFwZSkpIHtcbiAgICAgICAgICAgIGlmIChtYXNrICYmICFtYXNrW2tleV0pIHtcbiAgICAgICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gdGhpcy5zaGFwZVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmllbGRTY2hlbWEgPSB0aGlzLnNoYXBlW2tleV07XG4gICAgICAgICAgICAgICAgbGV0IG5ld0ZpZWxkID0gZmllbGRTY2hlbWE7XG4gICAgICAgICAgICAgICAgd2hpbGUgKG5ld0ZpZWxkIGluc3RhbmNlb2YgWm9kT3B0aW9uYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3RmllbGQgPSBuZXdGaWVsZC5fZGVmLmlubmVyVHlwZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3U2hhcGVba2V5XSA9IG5ld0ZpZWxkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHNoYXBlOiAoKSA9PiBuZXdTaGFwZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGtleW9mKCkge1xuICAgICAgICByZXR1cm4gY3JlYXRlWm9kRW51bSh1dGlsLm9iamVjdEtleXModGhpcy5zaGFwZSkpO1xuICAgIH1cbn1cblpvZE9iamVjdC5jcmVhdGUgPSAoc2hhcGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgc2hhcGU6ICgpID0+IHNoYXBlLFxuICAgICAgICB1bmtub3duS2V5czogXCJzdHJpcFwiLFxuICAgICAgICBjYXRjaGFsbDogWm9kTmV2ZXIuY3JlYXRlKCksXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kT2JqZWN0LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuWm9kT2JqZWN0LnN0cmljdENyZWF0ZSA9IChzaGFwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xuICAgICAgICBzaGFwZTogKCkgPT4gc2hhcGUsXG4gICAgICAgIHVua25vd25LZXlzOiBcInN0cmljdFwiLFxuICAgICAgICBjYXRjaGFsbDogWm9kTmV2ZXIuY3JlYXRlKCksXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kT2JqZWN0LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuWm9kT2JqZWN0LmxhenljcmVhdGUgPSAoc2hhcGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcbiAgICAgICAgc2hhcGUsXG4gICAgICAgIHVua25vd25LZXlzOiBcInN0cmlwXCIsXG4gICAgICAgIGNhdGNoYWxsOiBab2ROZXZlci5jcmVhdGUoKSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RPYmplY3QsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kVW5pb24gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLl9kZWYub3B0aW9ucztcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzdWx0cyhyZXN1bHRzKSB7XG4gICAgICAgICAgICAvLyByZXR1cm4gZmlyc3QgaXNzdWUtZnJlZSB2YWxpZGF0aW9uIGlmIGl0IGV4aXN0c1xuICAgICAgICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQucmVzdWx0LnN0YXR1cyA9PT0gXCJ2YWxpZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQucmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnJlc3VsdC5zdGF0dXMgPT09IFwiZGlydHlcIikge1xuICAgICAgICAgICAgICAgICAgICAvLyBhZGQgaXNzdWVzIGZyb20gZGlydHkgb3B0aW9uXG4gICAgICAgICAgICAgICAgICAgIGN0eC5jb21tb24uaXNzdWVzLnB1c2goLi4ucmVzdWx0LmN0eC5jb21tb24uaXNzdWVzKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmV0dXJuIGludmFsaWRcbiAgICAgICAgICAgIGNvbnN0IHVuaW9uRXJyb3JzID0gcmVzdWx0cy5tYXAoKHJlc3VsdCkgPT4gbmV3IFpvZEVycm9yKHJlc3VsdC5jdHguY29tbW9uLmlzc3VlcykpO1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdW5pb24sXG4gICAgICAgICAgICAgICAgdW5pb25FcnJvcnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwob3B0aW9ucy5tYXAoYXN5bmMgKG9wdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkQ3R4ID0ge1xuICAgICAgICAgICAgICAgICAgICAuLi5jdHgsXG4gICAgICAgICAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4uY3R4LmNvbW1vbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzc3VlczogW10sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogbnVsbCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdDogYXdhaXQgb3B0aW9uLl9wYXJzZUFzeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGNoaWxkQ3R4LFxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgY3R4OiBjaGlsZEN0eCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkpLnRoZW4oaGFuZGxlUmVzdWx0cyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgZGlydHkgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBjb25zdCBpc3N1ZXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEN0eCA9IHtcbiAgICAgICAgICAgICAgICAgICAgLi4uY3R4LFxuICAgICAgICAgICAgICAgICAgICBjb21tb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLmN0eC5jb21tb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBvcHRpb24uX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjaGlsZEN0eCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gXCJ2YWxpZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwiZGlydHlcIiAmJiAhZGlydHkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlydHkgPSB7IHJlc3VsdCwgY3R4OiBjaGlsZEN0eCB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRDdHguY29tbW9uLmlzc3Vlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNzdWVzLnB1c2goY2hpbGRDdHguY29tbW9uLmlzc3Vlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRpcnR5KSB7XG4gICAgICAgICAgICAgICAgY3R4LmNvbW1vbi5pc3N1ZXMucHVzaCguLi5kaXJ0eS5jdHguY29tbW9uLmlzc3Vlcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpcnR5LnJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHVuaW9uRXJyb3JzID0gaXNzdWVzLm1hcCgoaXNzdWVzKSA9PiBuZXcgWm9kRXJyb3IoaXNzdWVzKSk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF91bmlvbixcbiAgICAgICAgICAgICAgICB1bmlvbkVycm9ycyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IG9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYub3B0aW9ucztcbiAgICB9XG59XG5ab2RVbmlvbi5jcmVhdGUgPSAodHlwZXMsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kVW5pb24oe1xuICAgICAgICBvcHRpb25zOiB0eXBlcyxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RVbmlvbixcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vLy8vLy8vLy9cbi8vLy8vLy8vLy8gICAgICBab2REaXNjcmltaW5hdGVkVW5pb24gICAgICAvLy8vLy8vLy8vXG4vLy8vLy8vLy8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5jb25zdCBnZXREaXNjcmltaW5hdG9yID0gKHR5cGUpID0+IHtcbiAgICBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZExhenkpIHtcbiAgICAgICAgcmV0dXJuIGdldERpc2NyaW1pbmF0b3IodHlwZS5zY2hlbWEpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kRWZmZWN0cykge1xuICAgICAgICByZXR1cm4gZ2V0RGlzY3JpbWluYXRvcih0eXBlLmlubmVyVHlwZSgpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZExpdGVyYWwpIHtcbiAgICAgICAgcmV0dXJuIFt0eXBlLnZhbHVlXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZEVudW0pIHtcbiAgICAgICAgcmV0dXJuIHR5cGUub3B0aW9ucztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZE5hdGl2ZUVudW0pIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGJhbi9iYW5cbiAgICAgICAgcmV0dXJuIHV0aWwub2JqZWN0VmFsdWVzKHR5cGUuZW51bSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2REZWZhdWx0KSB7XG4gICAgICAgIHJldHVybiBnZXREaXNjcmltaW5hdG9yKHR5cGUuX2RlZi5pbm5lclR5cGUpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kVW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBbdW5kZWZpbmVkXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZE51bGwpIHtcbiAgICAgICAgcmV0dXJuIFtudWxsXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZE9wdGlvbmFsKSB7XG4gICAgICAgIHJldHVybiBbdW5kZWZpbmVkLCAuLi5nZXREaXNjcmltaW5hdG9yKHR5cGUudW53cmFwKCkpXTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFpvZE51bGxhYmxlKSB7XG4gICAgICAgIHJldHVybiBbbnVsbCwgLi4uZ2V0RGlzY3JpbWluYXRvcih0eXBlLnVud3JhcCgpKV07XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RCcmFuZGVkKSB7XG4gICAgICAgIHJldHVybiBnZXREaXNjcmltaW5hdG9yKHR5cGUudW53cmFwKCkpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgWm9kUmVhZG9ubHkpIHtcbiAgICAgICAgcmV0dXJuIGdldERpc2NyaW1pbmF0b3IodHlwZS51bndyYXAoKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgaW5zdGFuY2VvZiBab2RDYXRjaCkge1xuICAgICAgICByZXR1cm4gZ2V0RGlzY3JpbWluYXRvcih0eXBlLl9kZWYuaW5uZXJUeXBlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG59O1xuZXhwb3J0IGNsYXNzIFpvZERpc2NyaW1pbmF0ZWRVbmlvbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLm9iamVjdCkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5vYmplY3QsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkaXNjcmltaW5hdG9yID0gdGhpcy5kaXNjcmltaW5hdG9yO1xuICAgICAgICBjb25zdCBkaXNjcmltaW5hdG9yVmFsdWUgPSBjdHguZGF0YVtkaXNjcmltaW5hdG9yXTtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5vcHRpb25zTWFwLmdldChkaXNjcmltaW5hdG9yVmFsdWUpO1xuICAgICAgICBpZiAoIW9wdGlvbikge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdW5pb25fZGlzY3JpbWluYXRvcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBBcnJheS5mcm9tKHRoaXMub3B0aW9uc01hcC5rZXlzKCkpLFxuICAgICAgICAgICAgICAgIHBhdGg6IFtkaXNjcmltaW5hdG9yXSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb24uX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9uLl9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGRpc2NyaW1pbmF0b3IoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuZGlzY3JpbWluYXRvcjtcbiAgICB9XG4gICAgZ2V0IG9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYub3B0aW9ucztcbiAgICB9XG4gICAgZ2V0IG9wdGlvbnNNYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYub3B0aW9uc01hcDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBkaXNjcmltaW5hdGVkIHVuaW9uIHNjaGVtYS4gSXRzIGJlaGF2aW91ciBpcyB2ZXJ5IHNpbWlsYXIgdG8gdGhhdCBvZiB0aGUgbm9ybWFsIHoudW5pb24oKSBjb25zdHJ1Y3Rvci5cbiAgICAgKiBIb3dldmVyLCBpdCBvbmx5IGFsbG93cyBhIHVuaW9uIG9mIG9iamVjdHMsIGFsbCBvZiB3aGljaCBuZWVkIHRvIHNoYXJlIGEgZGlzY3JpbWluYXRvciBwcm9wZXJ0eS4gVGhpcyBwcm9wZXJ0eSBtdXN0XG4gICAgICogaGF2ZSBhIGRpZmZlcmVudCB2YWx1ZSBmb3IgZWFjaCBvYmplY3QgaW4gdGhlIHVuaW9uLlxuICAgICAqIEBwYXJhbSBkaXNjcmltaW5hdG9yIHRoZSBuYW1lIG9mIHRoZSBkaXNjcmltaW5hdG9yIHByb3BlcnR5XG4gICAgICogQHBhcmFtIHR5cGVzIGFuIGFycmF5IG9mIG9iamVjdCBzY2hlbWFzXG4gICAgICogQHBhcmFtIHBhcmFtc1xuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGUoZGlzY3JpbWluYXRvciwgb3B0aW9ucywgcGFyYW1zKSB7XG4gICAgICAgIC8vIEdldCBhbGwgdGhlIHZhbGlkIGRpc2NyaW1pbmF0b3IgdmFsdWVzXG4gICAgICAgIGNvbnN0IG9wdGlvbnNNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIC8vIHRyeSB7XG4gICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBvcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBkaXNjcmltaW5hdG9yVmFsdWVzID0gZ2V0RGlzY3JpbWluYXRvcih0eXBlLnNoYXBlW2Rpc2NyaW1pbmF0b3JdKTtcbiAgICAgICAgICAgIGlmICghZGlzY3JpbWluYXRvclZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEEgZGlzY3JpbWluYXRvciB2YWx1ZSBmb3Iga2V5IFxcYCR7ZGlzY3JpbWluYXRvcn1cXGAgY291bGQgbm90IGJlIGV4dHJhY3RlZCBmcm9tIGFsbCBzY2hlbWEgb3B0aW9uc2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCB2YWx1ZSBvZiBkaXNjcmltaW5hdG9yVmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnNNYXAuaGFzKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYERpc2NyaW1pbmF0b3IgcHJvcGVydHkgJHtTdHJpbmcoZGlzY3JpbWluYXRvcil9IGhhcyBkdXBsaWNhdGUgdmFsdWUgJHtTdHJpbmcodmFsdWUpfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvcHRpb25zTWFwLnNldCh2YWx1ZSwgdHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2REaXNjcmltaW5hdGVkVW5pb24oe1xuICAgICAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2REaXNjcmltaW5hdGVkVW5pb24sXG4gICAgICAgICAgICBkaXNjcmltaW5hdG9yLFxuICAgICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgICAgIG9wdGlvbnNNYXAsXG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG1lcmdlVmFsdWVzKGEsIGIpIHtcbiAgICBjb25zdCBhVHlwZSA9IGdldFBhcnNlZFR5cGUoYSk7XG4gICAgY29uc3QgYlR5cGUgPSBnZXRQYXJzZWRUeXBlKGIpO1xuICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBhIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKGFUeXBlID09PSBab2RQYXJzZWRUeXBlLm9iamVjdCAmJiBiVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS5vYmplY3QpIHtcbiAgICAgICAgY29uc3QgYktleXMgPSB1dGlsLm9iamVjdEtleXMoYik7XG4gICAgICAgIGNvbnN0IHNoYXJlZEtleXMgPSB1dGlsLm9iamVjdEtleXMoYSkuZmlsdGVyKChrZXkpID0+IGJLZXlzLmluZGV4T2Yoa2V5KSAhPT0gLTEpO1xuICAgICAgICBjb25zdCBuZXdPYmogPSB7IC4uLmEsIC4uLmIgfTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2Ygc2hhcmVkS2V5cykge1xuICAgICAgICAgICAgY29uc3Qgc2hhcmVkVmFsdWUgPSBtZXJnZVZhbHVlcyhhW2tleV0sIGJba2V5XSk7XG4gICAgICAgICAgICBpZiAoIXNoYXJlZFZhbHVlLnZhbGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdPYmpba2V5XSA9IHNoYXJlZFZhbHVlLmRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIGRhdGE6IG5ld09iaiB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChhVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS5hcnJheSAmJiBiVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS5hcnJheSkge1xuICAgICAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXdBcnJheSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1BID0gYVtpbmRleF07XG4gICAgICAgICAgICBjb25zdCBpdGVtQiA9IGJbaW5kZXhdO1xuICAgICAgICAgICAgY29uc3Qgc2hhcmVkVmFsdWUgPSBtZXJnZVZhbHVlcyhpdGVtQSwgaXRlbUIpO1xuICAgICAgICAgICAgaWYgKCFzaGFyZWRWYWx1ZS52YWxpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3QXJyYXkucHVzaChzaGFyZWRWYWx1ZS5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgZGF0YTogbmV3QXJyYXkgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYVR5cGUgPT09IFpvZFBhcnNlZFR5cGUuZGF0ZSAmJiBiVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS5kYXRlICYmICthID09PSArYikge1xuICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgZGF0YTogYSB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlIH07XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFpvZEludGVyc2VjdGlvbiBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCBoYW5kbGVQYXJzZWQgPSAocGFyc2VkTGVmdCwgcGFyc2VkUmlnaHQpID0+IHtcbiAgICAgICAgICAgIGlmIChpc0Fib3J0ZWQocGFyc2VkTGVmdCkgfHwgaXNBYm9ydGVkKHBhcnNlZFJpZ2h0KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbWVyZ2VkID0gbWVyZ2VWYWx1ZXMocGFyc2VkTGVmdC52YWx1ZSwgcGFyc2VkUmlnaHQudmFsdWUpO1xuICAgICAgICAgICAgaWYgKCFtZXJnZWQudmFsaWQpIHtcbiAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfaW50ZXJzZWN0aW9uX3R5cGVzLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzRGlydHkocGFyc2VkTGVmdCkgfHwgaXNEaXJ0eShwYXJzZWRSaWdodCkpIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogbWVyZ2VkLmRhdGEgfTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAgICAgdGhpcy5fZGVmLmxlZnQuX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHRoaXMuX2RlZi5yaWdodC5fcGFyc2VBc3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdKS50aGVuKChbbGVmdCwgcmlnaHRdKSA9PiBoYW5kbGVQYXJzZWQobGVmdCwgcmlnaHQpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVQYXJzZWQodGhpcy5fZGVmLmxlZnQuX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgICAgICB9KSwgdGhpcy5fZGVmLnJpZ2h0Ll9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgIGRhdGE6IGN0eC5kYXRhLFxuICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfVxufVxuWm9kSW50ZXJzZWN0aW9uLmNyZWF0ZSA9IChsZWZ0LCByaWdodCwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RJbnRlcnNlY3Rpb24oe1xuICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICByaWdodDogcmlnaHQsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kSW50ZXJzZWN0aW9uLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuLy8gdHlwZSBab2RUdXBsZUl0ZW1zID0gW1pvZFR5cGVBbnksIC4uLlpvZFR5cGVBbnlbXV07XG5leHBvcnQgY2xhc3MgWm9kVHVwbGUgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLmFycmF5KSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLmFycmF5LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5kYXRhLmxlbmd0aCA8IHRoaXMuX2RlZi5pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS50b29fc21hbGwsXG4gICAgICAgICAgICAgICAgbWluaW11bTogdGhpcy5fZGVmLml0ZW1zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzdCA9IHRoaXMuX2RlZi5yZXN0O1xuICAgICAgICBpZiAoIXJlc3QgJiYgY3R4LmRhdGEubGVuZ3RoID4gdGhpcy5fZGVmLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19iaWcsXG4gICAgICAgICAgICAgICAgbWF4aW11bTogdGhpcy5fZGVmLml0ZW1zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXRlbXMgPSBbLi4uY3R4LmRhdGFdXG4gICAgICAgICAgICAubWFwKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuX2RlZi5pdGVtc1tpdGVtSW5kZXhdIHx8IHRoaXMuX2RlZi5yZXN0O1xuICAgICAgICAgICAgaWYgKCFzY2hlbWEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4gc2NoZW1hLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgaXRlbSwgY3R4LnBhdGgsIGl0ZW1JbmRleCkpO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmZpbHRlcigoeCkgPT4gISF4KTsgLy8gZmlsdGVyIG51bGxzXG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoaXRlbXMpLnRoZW4oKHJlc3VsdHMpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VBcnJheShzdGF0dXMsIHJlc3VsdHMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VBcnJheShzdGF0dXMsIGl0ZW1zKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgaXRlbXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaXRlbXM7XG4gICAgfVxuICAgIHJlc3QocmVzdCkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFR1cGxlKHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIHJlc3QsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblpvZFR1cGxlLmNyZWF0ZSA9IChzY2hlbWFzLCBwYXJhbXMpID0+IHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoc2NoZW1hcykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgcGFzcyBhbiBhcnJheSBvZiBzY2hlbWFzIHRvIHoudHVwbGUoWyAuLi4gXSlcIik7XG4gICAgfVxuICAgIHJldHVybiBuZXcgWm9kVHVwbGUoe1xuICAgICAgICBpdGVtczogc2NoZW1hcyxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RUdXBsZSxcbiAgICAgICAgcmVzdDogbnVsbCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RSZWNvcmQgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBnZXQga2V5U2NoZW1hKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmtleVR5cGU7XG4gICAgfVxuICAgIGdldCB2YWx1ZVNjaGVtYSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi52YWx1ZVR5cGU7XG4gICAgfVxuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUub2JqZWN0KSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm9iamVjdCxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhaXJzID0gW107XG4gICAgICAgIGNvbnN0IGtleVR5cGUgPSB0aGlzLl9kZWYua2V5VHlwZTtcbiAgICAgICAgY29uc3QgdmFsdWVUeXBlID0gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gY3R4LmRhdGEpIHtcbiAgICAgICAgICAgIHBhaXJzLnB1c2goe1xuICAgICAgICAgICAgICAgIGtleToga2V5VHlwZS5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIGtleSwgY3R4LnBhdGgsIGtleSkpLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVR5cGUuX3BhcnNlKG5ldyBQYXJzZUlucHV0TGF6eVBhdGgoY3R4LCBjdHguZGF0YVtrZXldLCBjdHgucGF0aCwga2V5KSksXG4gICAgICAgICAgICAgICAgYWx3YXlzU2V0OiBrZXkgaW4gY3R4LmRhdGEsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgcmV0dXJuIFBhcnNlU3RhdHVzLm1lcmdlT2JqZWN0QXN5bmMoc3RhdHVzLCBwYWlycyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUGFyc2VTdGF0dXMubWVyZ2VPYmplY3RTeW5jKHN0YXR1cywgcGFpcnMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBlbGVtZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnZhbHVlVHlwZTtcbiAgICB9XG4gICAgc3RhdGljIGNyZWF0ZShmaXJzdCwgc2Vjb25kLCB0aGlyZCkge1xuICAgICAgICBpZiAoc2Vjb25kIGluc3RhbmNlb2YgWm9kVHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBab2RSZWNvcmQoe1xuICAgICAgICAgICAgICAgIGtleVR5cGU6IGZpcnN0LFxuICAgICAgICAgICAgICAgIHZhbHVlVHlwZTogc2Vjb25kLFxuICAgICAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kUmVjb3JkLFxuICAgICAgICAgICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXModGhpcmQpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBab2RSZWNvcmQoe1xuICAgICAgICAgICAga2V5VHlwZTogWm9kU3RyaW5nLmNyZWF0ZSgpLFxuICAgICAgICAgICAgdmFsdWVUeXBlOiBmaXJzdCxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kUmVjb3JkLFxuICAgICAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhzZWNvbmQpLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgWm9kTWFwIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgZ2V0IGtleVNjaGVtYSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5rZXlUeXBlO1xuICAgIH1cbiAgICBnZXQgdmFsdWVTY2hlbWEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWVUeXBlO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLm1hcCkge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5tYXAsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBrZXlUeXBlID0gdGhpcy5fZGVmLmtleVR5cGU7XG4gICAgICAgIGNvbnN0IHZhbHVlVHlwZSA9IHRoaXMuX2RlZi52YWx1ZVR5cGU7XG4gICAgICAgIGNvbnN0IHBhaXJzID0gWy4uLmN0eC5kYXRhLmVudHJpZXMoKV0ubWFwKChba2V5LCB2YWx1ZV0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGtleToga2V5VHlwZS5fcGFyc2UobmV3IFBhcnNlSW5wdXRMYXp5UGF0aChjdHgsIGtleSwgY3R4LnBhdGgsIFtpbmRleCwgXCJrZXlcIl0pKSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVUeXBlLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgdmFsdWUsIGN0eC5wYXRoLCBbaW5kZXgsIFwidmFsdWVcIl0pKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYykge1xuICAgICAgICAgICAgY29uc3QgZmluYWxNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHBhaXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IHBhaXIua2V5O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IHBhaXIudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkuc3RhdHVzID09PSBcImFib3J0ZWRcIiB8fCB2YWx1ZS5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5LnN0YXR1cyA9PT0gXCJkaXJ0eVwiIHx8IHZhbHVlLnN0YXR1cyA9PT0gXCJkaXJ0eVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaW5hbE1hcC5zZXQoa2V5LnZhbHVlLCB2YWx1ZS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogZmluYWxNYXAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZmluYWxNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhaXIgb2YgcGFpcnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBwYWlyLmtleTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHBhaXIudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKGtleS5zdGF0dXMgPT09IFwiYWJvcnRlZFwiIHx8IHZhbHVlLnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChrZXkuc3RhdHVzID09PSBcImRpcnR5XCIgfHwgdmFsdWUuc3RhdHVzID09PSBcImRpcnR5XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsTWFwLnNldChrZXkudmFsdWUsIHZhbHVlLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogZmluYWxNYXAgfTtcbiAgICAgICAgfVxuICAgIH1cbn1cblpvZE1hcC5jcmVhdGUgPSAoa2V5VHlwZSwgdmFsdWVUeXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZE1hcCh7XG4gICAgICAgIHZhbHVlVHlwZSxcbiAgICAgICAga2V5VHlwZSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RNYXAsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kU2V0IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzLCBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5zZXQpIHtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX3R5cGUsXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFpvZFBhcnNlZFR5cGUuc2V0LFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVmID0gdGhpcy5fZGVmO1xuICAgICAgICBpZiAoZGVmLm1pblNpemUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjdHguZGF0YS5zaXplIDwgZGVmLm1pblNpemUudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLnRvb19zbWFsbCxcbiAgICAgICAgICAgICAgICAgICAgbWluaW11bTogZGVmLm1pblNpemUudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic2V0XCIsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBkZWYubWluU2l6ZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChkZWYubWF4U2l6ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGN0eC5kYXRhLnNpemUgPiBkZWYubWF4U2l6ZS52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUudG9vX2JpZyxcbiAgICAgICAgICAgICAgICAgICAgbWF4aW11bTogZGVmLm1heFNpemUudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic2V0XCIsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZXhhY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBkZWYubWF4U2l6ZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlVHlwZSA9IHRoaXMuX2RlZi52YWx1ZVR5cGU7XG4gICAgICAgIGZ1bmN0aW9uIGZpbmFsaXplU2V0KGVsZW1lbnRzKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWRTZXQgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmRpcnR5KCk7XG4gICAgICAgICAgICAgICAgcGFyc2VkU2V0LmFkZChlbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogcGFyc2VkU2V0IH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSBbLi4uY3R4LmRhdGEudmFsdWVzKCldLm1hcCgoaXRlbSwgaSkgPT4gdmFsdWVUeXBlLl9wYXJzZShuZXcgUGFyc2VJbnB1dExhenlQYXRoKGN0eCwgaXRlbSwgY3R4LnBhdGgsIGkpKSk7XG4gICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoZWxlbWVudHMpLnRoZW4oKGVsZW1lbnRzKSA9PiBmaW5hbGl6ZVNldChlbGVtZW50cykpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZpbmFsaXplU2V0KGVsZW1lbnRzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBtaW4obWluU2l6ZSwgbWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gbmV3IFpvZFNldCh7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBtaW5TaXplOiB7IHZhbHVlOiBtaW5TaXplLCBtZXNzYWdlOiBlcnJvclV0aWwudG9TdHJpbmcobWVzc2FnZSkgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG1heChtYXhTaXplLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kU2V0KHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIG1heFNpemU6IHsgdmFsdWU6IG1heFNpemUsIG1lc3NhZ2U6IGVycm9yVXRpbC50b1N0cmluZyhtZXNzYWdlKSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc2l6ZShzaXplLCBtZXNzYWdlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbihzaXplLCBtZXNzYWdlKS5tYXgoc2l6ZSwgbWVzc2FnZSk7XG4gICAgfVxuICAgIG5vbmVtcHR5KG1lc3NhZ2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWluKDEsIG1lc3NhZ2UpO1xuICAgIH1cbn1cblpvZFNldC5jcmVhdGUgPSAodmFsdWVUeXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFNldCh7XG4gICAgICAgIHZhbHVlVHlwZSxcbiAgICAgICAgbWluU2l6ZTogbnVsbCxcbiAgICAgICAgbWF4U2l6ZTogbnVsbCxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RTZXQsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kRnVuY3Rpb24gZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy52YWxpZGF0ZSA9IHRoaXMuaW1wbGVtZW50O1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5mdW5jdGlvbikge1xuICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCB7XG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogWm9kUGFyc2VkVHlwZS5mdW5jdGlvbixcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VBcmdzSXNzdWUoYXJncywgZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBtYWtlSXNzdWUoe1xuICAgICAgICAgICAgICAgIGRhdGE6IGFyZ3MsXG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgZXJyb3JNYXBzOiBbY3R4LmNvbW1vbi5jb250ZXh0dWFsRXJyb3JNYXAsIGN0eC5zY2hlbWFFcnJvck1hcCwgZ2V0RXJyb3JNYXAoKSwgZGVmYXVsdEVycm9yTWFwXS5maWx0ZXIoKHgpID0+ICEheCksXG4gICAgICAgICAgICAgICAgaXNzdWVEYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFpvZElzc3VlQ29kZS5pbnZhbGlkX2FyZ3VtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgYXJndW1lbnRzRXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBtYWtlUmV0dXJuc0lzc3VlKHJldHVybnMsIGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFrZUlzc3VlKHtcbiAgICAgICAgICAgICAgICBkYXRhOiByZXR1cm5zLFxuICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgIGVycm9yTWFwczogW2N0eC5jb21tb24uY29udGV4dHVhbEVycm9yTWFwLCBjdHguc2NoZW1hRXJyb3JNYXAsIGdldEVycm9yTWFwKCksIGRlZmF1bHRFcnJvck1hcF0uZmlsdGVyKCh4KSA9PiAhIXgpLFxuICAgICAgICAgICAgICAgIGlzc3VlRGF0YToge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9yZXR1cm5fdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuVHlwZUVycm9yOiBlcnJvcixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFyYW1zID0geyBlcnJvck1hcDogY3R4LmNvbW1vbi5jb250ZXh0dWFsRXJyb3JNYXAgfTtcbiAgICAgICAgY29uc3QgZm4gPSBjdHguZGF0YTtcbiAgICAgICAgaWYgKHRoaXMuX2RlZi5yZXR1cm5zIGluc3RhbmNlb2YgWm9kUHJvbWlzZSkge1xuICAgICAgICAgICAgLy8gV291bGQgbG92ZSBhIHdheSB0byBhdm9pZCBkaXNhYmxpbmcgdGhpcyBydWxlLCBidXQgd2UgbmVlZFxuICAgICAgICAgICAgLy8gYW4gYWxpYXMgKHVzaW5nIGFuIGFycm93IGZ1bmN0aW9uIHdhcyB3aGF0IGNhdXNlZCAyNjUxKS5cbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuICAgICAgICAgICAgY29uc3QgbWUgPSB0aGlzO1xuICAgICAgICAgICAgcmV0dXJuIE9LKGFzeW5jIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgWm9kRXJyb3IoW10pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZEFyZ3MgPSBhd2FpdCBtZS5fZGVmLmFyZ3MucGFyc2VBc3luYyhhcmdzLCBwYXJhbXMpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yLmFkZElzc3VlKG1ha2VBcmdzSXNzdWUoYXJncywgZSkpO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBSZWZsZWN0LmFwcGx5KGZuLCB0aGlzLCBwYXJzZWRBcmdzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWRSZXR1cm5zID0gYXdhaXQgbWUuX2RlZi5yZXR1cm5zLl9kZWYudHlwZVxuICAgICAgICAgICAgICAgICAgICAucGFyc2VBc3luYyhyZXN1bHQsIHBhcmFtcylcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yLmFkZElzc3VlKG1ha2VSZXR1cm5zSXNzdWUocmVzdWx0LCBlKSk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZWRSZXR1cm5zO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBXb3VsZCBsb3ZlIGEgd2F5IHRvIGF2b2lkIGRpc2FibGluZyB0aGlzIHJ1bGUsIGJ1dCB3ZSBuZWVkXG4gICAgICAgICAgICAvLyBhbiBhbGlhcyAodXNpbmcgYW4gYXJyb3cgZnVuY3Rpb24gd2FzIHdoYXQgY2F1c2VkIDI2NTEpLlxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG4gICAgICAgICAgICBjb25zdCBtZSA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4gT0soZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWRBcmdzID0gbWUuX2RlZi5hcmdzLnNhZmVQYXJzZShhcmdzLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIGlmICghcGFyc2VkQXJncy5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBab2RFcnJvcihbbWFrZUFyZ3NJc3N1ZShhcmdzLCBwYXJzZWRBcmdzLmVycm9yKV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBSZWZsZWN0LmFwcGx5KGZuLCB0aGlzLCBwYXJzZWRBcmdzLmRhdGEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZFJldHVybnMgPSBtZS5fZGVmLnJldHVybnMuc2FmZVBhcnNlKHJlc3VsdCwgcGFyYW1zKTtcbiAgICAgICAgICAgICAgICBpZiAoIXBhcnNlZFJldHVybnMuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgWm9kRXJyb3IoW21ha2VSZXR1cm5zSXNzdWUocmVzdWx0LCBwYXJzZWRSZXR1cm5zLmVycm9yKV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VkUmV0dXJucy5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcGFyYW1ldGVycygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5hcmdzO1xuICAgIH1cbiAgICByZXR1cm5UeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnJldHVybnM7XG4gICAgfVxuICAgIGFyZ3MoLi4uaXRlbXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RGdW5jdGlvbih7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICBhcmdzOiBab2RUdXBsZS5jcmVhdGUoaXRlbXMpLnJlc3QoWm9kVW5rbm93bi5jcmVhdGUoKSksXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm5zKHJldHVyblR5cGUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RGdW5jdGlvbih7XG4gICAgICAgICAgICAuLi50aGlzLl9kZWYsXG4gICAgICAgICAgICByZXR1cm5zOiByZXR1cm5UeXBlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaW1wbGVtZW50KGZ1bmMpIHtcbiAgICAgICAgY29uc3QgdmFsaWRhdGVkRnVuYyA9IHRoaXMucGFyc2UoZnVuYyk7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZWRGdW5jO1xuICAgIH1cbiAgICBzdHJpY3RJbXBsZW1lbnQoZnVuYykge1xuICAgICAgICBjb25zdCB2YWxpZGF0ZWRGdW5jID0gdGhpcy5wYXJzZShmdW5jKTtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlZEZ1bmM7XG4gICAgfVxuICAgIHN0YXRpYyBjcmVhdGUoYXJncywgcmV0dXJucywgcGFyYW1zKSB7XG4gICAgICAgIHJldHVybiBuZXcgWm9kRnVuY3Rpb24oe1xuICAgICAgICAgICAgYXJnczogKGFyZ3MgPyBhcmdzIDogWm9kVHVwbGUuY3JlYXRlKFtdKS5yZXN0KFpvZFVua25vd24uY3JlYXRlKCkpKSxcbiAgICAgICAgICAgIHJldHVybnM6IHJldHVybnMgfHwgWm9kVW5rbm93bi5jcmVhdGUoKSxcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRnVuY3Rpb24sXG4gICAgICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RMYXp5IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgZ2V0IHNjaGVtYSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5nZXR0ZXIoKTtcbiAgICB9XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCBsYXp5U2NoZW1hID0gdGhpcy5fZGVmLmdldHRlcigpO1xuICAgICAgICByZXR1cm4gbGF6eVNjaGVtYS5fcGFyc2UoeyBkYXRhOiBjdHguZGF0YSwgcGF0aDogY3R4LnBhdGgsIHBhcmVudDogY3R4IH0pO1xuICAgIH1cbn1cblpvZExhenkuY3JlYXRlID0gKGdldHRlciwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RMYXp5KHtcbiAgICAgICAgZ2V0dGVyOiBnZXR0ZXIsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kTGF6eSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RMaXRlcmFsIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGlmIChpbnB1dC5kYXRhICE9PSB0aGlzLl9kZWYudmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9saXRlcmFsLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiB0aGlzLl9kZWYudmFsdWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZTogaW5wdXQuZGF0YSB9O1xuICAgIH1cbiAgICBnZXQgdmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudmFsdWU7XG4gICAgfVxufVxuWm9kTGl0ZXJhbC5jcmVhdGUgPSAodmFsdWUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTGl0ZXJhbCh7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RMaXRlcmFsLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZnVuY3Rpb24gY3JlYXRlWm9kRW51bSh2YWx1ZXMsIHBhcmFtcykge1xuICAgIHJldHVybiBuZXcgWm9kRW51bSh7XG4gICAgICAgIHZhbHVlcyxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFbnVtLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59XG5leHBvcnQgY2xhc3MgWm9kRW51bSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBpZiAodHlwZW9mIGlucHV0LmRhdGEgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGNvbnN0IGV4cGVjdGVkVmFsdWVzID0gdGhpcy5fZGVmLnZhbHVlcztcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiB1dGlsLmpvaW5WYWx1ZXMoZXhwZWN0ZWRWYWx1ZXMpLFxuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHgucGFyc2VkVHlwZSxcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZSA9IG5ldyBTZXQodGhpcy5fZGVmLnZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9jYWNoZS5oYXMoaW5wdXQuZGF0YSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgICAgIGNvbnN0IGV4cGVjdGVkVmFsdWVzID0gdGhpcy5fZGVmLnZhbHVlcztcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9lbnVtX3ZhbHVlLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGV4cGVjdGVkVmFsdWVzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxuICAgIGdldCBvcHRpb25zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnZhbHVlcztcbiAgICB9XG4gICAgZ2V0IGVudW0oKSB7XG4gICAgICAgIGNvbnN0IGVudW1WYWx1ZXMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCB2YWwgb2YgdGhpcy5fZGVmLnZhbHVlcykge1xuICAgICAgICAgICAgZW51bVZhbHVlc1t2YWxdID0gdmFsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbnVtVmFsdWVzO1xuICAgIH1cbiAgICBnZXQgVmFsdWVzKCkge1xuICAgICAgICBjb25zdCBlbnVtVmFsdWVzID0ge307XG4gICAgICAgIGZvciAoY29uc3QgdmFsIG9mIHRoaXMuX2RlZi52YWx1ZXMpIHtcbiAgICAgICAgICAgIGVudW1WYWx1ZXNbdmFsXSA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZW51bVZhbHVlcztcbiAgICB9XG4gICAgZ2V0IEVudW0oKSB7XG4gICAgICAgIGNvbnN0IGVudW1WYWx1ZXMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCB2YWwgb2YgdGhpcy5fZGVmLnZhbHVlcykge1xuICAgICAgICAgICAgZW51bVZhbHVlc1t2YWxdID0gdmFsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbnVtVmFsdWVzO1xuICAgIH1cbiAgICBleHRyYWN0KHZhbHVlcywgbmV3RGVmID0gdGhpcy5fZGVmKSB7XG4gICAgICAgIHJldHVybiBab2RFbnVtLmNyZWF0ZSh2YWx1ZXMsIHtcbiAgICAgICAgICAgIC4uLnRoaXMuX2RlZixcbiAgICAgICAgICAgIC4uLm5ld0RlZixcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGV4Y2x1ZGUodmFsdWVzLCBuZXdEZWYgPSB0aGlzLl9kZWYpIHtcbiAgICAgICAgcmV0dXJuIFpvZEVudW0uY3JlYXRlKHRoaXMub3B0aW9ucy5maWx0ZXIoKG9wdCkgPT4gIXZhbHVlcy5pbmNsdWRlcyhvcHQpKSwge1xuICAgICAgICAgICAgLi4udGhpcy5fZGVmLFxuICAgICAgICAgICAgLi4ubmV3RGVmLFxuICAgICAgICB9KTtcbiAgICB9XG59XG5ab2RFbnVtLmNyZWF0ZSA9IGNyZWF0ZVpvZEVudW07XG5leHBvcnQgY2xhc3MgWm9kTmF0aXZlRW51bSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCBuYXRpdmVFbnVtVmFsdWVzID0gdXRpbC5nZXRWYWxpZEVudW1WYWx1ZXModGhpcy5fZGVmLnZhbHVlcyk7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuX2dldE9yUmV0dXJuQ3R4KGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5wYXJzZWRUeXBlICE9PSBab2RQYXJzZWRUeXBlLnN0cmluZyAmJiBjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5udW1iZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4cGVjdGVkVmFsdWVzID0gdXRpbC5vYmplY3RWYWx1ZXMobmF0aXZlRW51bVZhbHVlcyk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogdXRpbC5qb2luVmFsdWVzKGV4cGVjdGVkVmFsdWVzKSxcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICAgICAgY29kZTogWm9kSXNzdWVDb2RlLmludmFsaWRfdHlwZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9jYWNoZSkge1xuICAgICAgICAgICAgdGhpcy5fY2FjaGUgPSBuZXcgU2V0KHV0aWwuZ2V0VmFsaWRFbnVtVmFsdWVzKHRoaXMuX2RlZi52YWx1ZXMpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2NhY2hlLmhhcyhpbnB1dC5kYXRhKSkge1xuICAgICAgICAgICAgY29uc3QgZXhwZWN0ZWRWYWx1ZXMgPSB1dGlsLm9iamVjdFZhbHVlcyhuYXRpdmVFbnVtVmFsdWVzKTtcbiAgICAgICAgICAgIGFkZElzc3VlVG9Db250ZXh0KGN0eCwge1xuICAgICAgICAgICAgICAgIHJlY2VpdmVkOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF9lbnVtX3ZhbHVlLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGV4cGVjdGVkVmFsdWVzLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT0soaW5wdXQuZGF0YSk7XG4gICAgfVxuICAgIGdldCBlbnVtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnZhbHVlcztcbiAgICB9XG59XG5ab2ROYXRpdmVFbnVtLmNyZWF0ZSA9ICh2YWx1ZXMsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kTmF0aXZlRW51bSh7XG4gICAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE5hdGl2ZUVudW0sXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kUHJvbWlzZSBleHRlbmRzIFpvZFR5cGUge1xuICAgIHVud3JhcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi50eXBlO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBjdHggfSA9IHRoaXMuX3Byb2Nlc3NJbnB1dFBhcmFtcyhpbnB1dCk7XG4gICAgICAgIGlmIChjdHgucGFyc2VkVHlwZSAhPT0gWm9kUGFyc2VkVHlwZS5wcm9taXNlICYmIGN0eC5jb21tb24uYXN5bmMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLnByb21pc2UsXG4gICAgICAgICAgICAgICAgcmVjZWl2ZWQ6IGN0eC5wYXJzZWRUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9taXNpZmllZCA9IGN0eC5wYXJzZWRUeXBlID09PSBab2RQYXJzZWRUeXBlLnByb21pc2UgPyBjdHguZGF0YSA6IFByb21pc2UucmVzb2x2ZShjdHguZGF0YSk7XG4gICAgICAgIHJldHVybiBPSyhwcm9taXNpZmllZC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnR5cGUucGFyc2VBc3luYyhkYXRhLCB7XG4gICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgZXJyb3JNYXA6IGN0eC5jb21tb24uY29udGV4dHVhbEVycm9yTWFwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pKTtcbiAgICB9XG59XG5ab2RQcm9taXNlLmNyZWF0ZSA9IChzY2hlbWEsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kUHJvbWlzZSh7XG4gICAgICAgIHR5cGU6IHNjaGVtYSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RQcm9taXNlLFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuZXhwb3J0IGNsYXNzIFpvZEVmZmVjdHMgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBpbm5lclR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuc2NoZW1hO1xuICAgIH1cbiAgICBzb3VyY2VUeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLnNjaGVtYS5fZGVmLnR5cGVOYW1lID09PSBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kRWZmZWN0c1xuICAgICAgICAgICAgPyB0aGlzLl9kZWYuc2NoZW1hLnNvdXJjZVR5cGUoKVxuICAgICAgICAgICAgOiB0aGlzLl9kZWYuc2NoZW1hO1xuICAgIH1cbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgY29uc3QgZWZmZWN0ID0gdGhpcy5fZGVmLmVmZmVjdCB8fCBudWxsO1xuICAgICAgICBjb25zdCBjaGVja0N0eCA9IHtcbiAgICAgICAgICAgIGFkZElzc3VlOiAoYXJnKSA9PiB7XG4gICAgICAgICAgICAgICAgYWRkSXNzdWVUb0NvbnRleHQoY3R4LCBhcmcpO1xuICAgICAgICAgICAgICAgIGlmIChhcmcuZmF0YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0IHBhdGgoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN0eC5wYXRoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgY2hlY2tDdHguYWRkSXNzdWUgPSBjaGVja0N0eC5hZGRJc3N1ZS5iaW5kKGNoZWNrQ3R4KTtcbiAgICAgICAgaWYgKGVmZmVjdC50eXBlID09PSBcInByZXByb2Nlc3NcIikge1xuICAgICAgICAgICAgY29uc3QgcHJvY2Vzc2VkID0gZWZmZWN0LnRyYW5zZm9ybShjdHguZGF0YSwgY2hlY2tDdHgpO1xuICAgICAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHByb2Nlc3NlZCkudGhlbihhc3luYyAocHJvY2Vzc2VkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMudmFsdWUgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcHJvY2Vzc2VkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERJUlRZKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMudmFsdWUgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBESVJUWShyZXN1bHQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cy52YWx1ZSA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2RlZi5zY2hlbWEuX3BhcnNlU3luYyh7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHByb2Nlc3NlZCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IFwiZGlydHlcIilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERJUlRZKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cy52YWx1ZSA9PT0gXCJkaXJ0eVwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRElSVFkocmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChlZmZlY3QudHlwZSA9PT0gXCJyZWZpbmVtZW50XCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGVSZWZpbmVtZW50ID0gKGFjYykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGVmZmVjdC5yZWZpbmVtZW50KGFjYywgY2hlY2tDdHgpO1xuICAgICAgICAgICAgICAgIGlmIChjdHguY29tbW9uLmFzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmMgcmVmaW5lbWVudCBlbmNvdW50ZXJlZCBkdXJpbmcgc3luY2hyb25vdXMgcGFyc2Ugb3BlcmF0aW9uLiBVc2UgLnBhcnNlQXN5bmMgaW5zdGVhZC5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5uZXIgPSB0aGlzLl9kZWYuc2NoZW1hLl9wYXJzZVN5bmMoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChpbm5lci5zdGF0dXMgPT09IFwiYWJvcnRlZFwiKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSU5WQUxJRDtcbiAgICAgICAgICAgICAgICBpZiAoaW5uZXIuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgIC8vIHJldHVybiB2YWx1ZSBpcyBpZ25vcmVkXG4gICAgICAgICAgICAgICAgZXhlY3V0ZVJlZmluZW1lbnQoaW5uZXIudmFsdWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogaW5uZXIudmFsdWUgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9kZWYuc2NoZW1hLl9wYXJzZUFzeW5jKHsgZGF0YTogY3R4LmRhdGEsIHBhdGg6IGN0eC5wYXRoLCBwYXJlbnQ6IGN0eCB9KS50aGVuKChpbm5lcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5uZXIuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5uZXIuc3RhdHVzID09PSBcImRpcnR5XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4ZWN1dGVSZWZpbmVtZW50KGlubmVyLnZhbHVlKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHN0YXR1czogc3RhdHVzLnZhbHVlLCB2YWx1ZTogaW5uZXIudmFsdWUgfTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVmZmVjdC50eXBlID09PSBcInRyYW5zZm9ybVwiKSB7XG4gICAgICAgICAgICBpZiAoY3R4LmNvbW1vbi5hc3luYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlID0gdGhpcy5fZGVmLnNjaGVtYS5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzVmFsaWQoYmFzZSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGVmZmVjdC50cmFuc2Zvcm0oYmFzZS52YWx1ZSwgY2hlY2tDdHgpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQXN5bmNocm9ub3VzIHRyYW5zZm9ybSBlbmNvdW50ZXJlZCBkdXJpbmcgc3luY2hyb25vdXMgcGFyc2Ugb3BlcmF0aW9uLiBVc2UgLnBhcnNlQXN5bmMgaW5zdGVhZC5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBzdGF0dXMudmFsdWUsIHZhbHVlOiByZXN1bHQgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9kZWYuc2NoZW1hLl9wYXJzZUFzeW5jKHsgZGF0YTogY3R4LmRhdGEsIHBhdGg6IGN0eC5wYXRoLCBwYXJlbnQ6IGN0eCB9KS50aGVuKChiYXNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZChiYXNlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGVmZmVjdC50cmFuc2Zvcm0oYmFzZS52YWx1ZSwgY2hlY2tDdHgpKS50aGVuKChyZXN1bHQpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHN0YXR1cy52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB1dGlsLmFzc2VydE5ldmVyKGVmZmVjdCk7XG4gICAgfVxufVxuWm9kRWZmZWN0cy5jcmVhdGUgPSAoc2NoZW1hLCBlZmZlY3QsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kRWZmZWN0cyh7XG4gICAgICAgIHNjaGVtYSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2RFZmZlY3RzLFxuICAgICAgICBlZmZlY3QsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5ab2RFZmZlY3RzLmNyZWF0ZVdpdGhQcmVwcm9jZXNzID0gKHByZXByb2Nlc3MsIHNjaGVtYSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2RFZmZlY3RzKHtcbiAgICAgICAgc2NoZW1hLFxuICAgICAgICBlZmZlY3Q6IHsgdHlwZTogXCJwcmVwcm9jZXNzXCIsIHRyYW5zZm9ybTogcHJlcHJvY2VzcyB9LFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZEVmZmVjdHMsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgeyBab2RFZmZlY3RzIGFzIFpvZFRyYW5zZm9ybWVyIH07XG5leHBvcnQgY2xhc3MgWm9kT3B0aW9uYWwgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS51bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBPSyh1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlLl9wYXJzZShpbnB1dCk7XG4gICAgfVxuICAgIHVud3JhcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGU7XG4gICAgfVxufVxuWm9kT3B0aW9uYWwuY3JlYXRlID0gKHR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kT3B0aW9uYWwoe1xuICAgICAgICBpbm5lclR5cGU6IHR5cGUsXG4gICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kT3B0aW9uYWwsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kTnVsbGFibGUgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkVHlwZSA9IHRoaXMuX2dldFR5cGUoaW5wdXQpO1xuICAgICAgICBpZiAocGFyc2VkVHlwZSA9PT0gWm9kUGFyc2VkVHlwZS5udWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gT0sobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKGlucHV0KTtcbiAgICB9XG4gICAgdW53cmFwKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVmLmlubmVyVHlwZTtcbiAgICB9XG59XG5ab2ROdWxsYWJsZS5jcmVhdGUgPSAodHlwZSwgcGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2ROdWxsYWJsZSh7XG4gICAgICAgIGlubmVyVHlwZTogdHlwZSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2ROdWxsYWJsZSxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2REZWZhdWx0IGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBsZXQgZGF0YSA9IGN0eC5kYXRhO1xuICAgICAgICBpZiAoY3R4LnBhcnNlZFR5cGUgPT09IFpvZFBhcnNlZFR5cGUudW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBkYXRhID0gdGhpcy5fZGVmLmRlZmF1bHRWYWx1ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlLl9wYXJzZSh7XG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGF0aDogY3R4LnBhdGgsXG4gICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlbW92ZURlZmF1bHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlO1xuICAgIH1cbn1cblpvZERlZmF1bHQuY3JlYXRlID0gKHR5cGUsIHBhcmFtcykgPT4ge1xuICAgIHJldHVybiBuZXcgWm9kRGVmYXVsdCh7XG4gICAgICAgIGlubmVyVHlwZTogdHlwZSxcbiAgICAgICAgdHlwZU5hbWU6IFpvZEZpcnN0UGFydHlUeXBlS2luZC5ab2REZWZhdWx0LFxuICAgICAgICBkZWZhdWx0VmFsdWU6IHR5cGVvZiBwYXJhbXMuZGVmYXVsdCA9PT0gXCJmdW5jdGlvblwiID8gcGFyYW1zLmRlZmF1bHQgOiAoKSA9PiBwYXJhbXMuZGVmYXVsdCxcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjbGFzcyBab2RDYXRjaCBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCB7IGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgLy8gbmV3Q3R4IGlzIHVzZWQgdG8gbm90IGNvbGxlY3QgaXNzdWVzIGZyb20gaW5uZXIgdHlwZXMgaW4gY3R4XG4gICAgICAgIGNvbnN0IG5ld0N0eCA9IHtcbiAgICAgICAgICAgIC4uLmN0eCxcbiAgICAgICAgICAgIGNvbW1vbjoge1xuICAgICAgICAgICAgICAgIC4uLmN0eC5jb21tb24sXG4gICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2RlZi5pbm5lclR5cGUuX3BhcnNlKHtcbiAgICAgICAgICAgIGRhdGE6IG5ld0N0eC5kYXRhLFxuICAgICAgICAgICAgcGF0aDogbmV3Q3R4LnBhdGgsXG4gICAgICAgICAgICBwYXJlbnQ6IHtcbiAgICAgICAgICAgICAgICAuLi5uZXdDdHgsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGlzQXN5bmMocmVzdWx0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFwidmFsaWRcIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC5zdGF0dXMgPT09IFwidmFsaWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgPyByZXN1bHQudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy5fZGVmLmNhdGNoVmFsdWUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldCBlcnJvcigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBab2RFcnJvcihuZXdDdHguY29tbW9uLmlzc3Vlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogbmV3Q3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXR1czogXCJ2YWxpZFwiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHQuc3RhdHVzID09PSBcInZhbGlkXCJcbiAgICAgICAgICAgICAgICAgICAgPyByZXN1bHQudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgOiB0aGlzLl9kZWYuY2F0Y2hWYWx1ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZXQgZXJyb3IoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBab2RFcnJvcihuZXdDdHguY29tbW9uLmlzc3Vlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IG5ld0N0eC5kYXRhLFxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlQ2F0Y2goKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlO1xuICAgIH1cbn1cblpvZENhdGNoLmNyZWF0ZSA9ICh0eXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZENhdGNoKHtcbiAgICAgICAgaW5uZXJUeXBlOiB0eXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZENhdGNoLFxuICAgICAgICBjYXRjaFZhbHVlOiB0eXBlb2YgcGFyYW1zLmNhdGNoID09PSBcImZ1bmN0aW9uXCIgPyBwYXJhbXMuY2F0Y2ggOiAoKSA9PiBwYXJhbXMuY2F0Y2gsXG4gICAgICAgIC4uLnByb2Nlc3NDcmVhdGVQYXJhbXMocGFyYW1zKSxcbiAgICB9KTtcbn07XG5leHBvcnQgY2xhc3MgWm9kTmFOIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFR5cGUgPSB0aGlzLl9nZXRUeXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHBhcnNlZFR5cGUgIT09IFpvZFBhcnNlZFR5cGUubmFuKSB7XG4gICAgICAgICAgICBjb25zdCBjdHggPSB0aGlzLl9nZXRPclJldHVybkN0eChpbnB1dCk7XG4gICAgICAgICAgICBhZGRJc3N1ZVRvQ29udGV4dChjdHgsIHtcbiAgICAgICAgICAgICAgICBjb2RlOiBab2RJc3N1ZUNvZGUuaW52YWxpZF90eXBlLFxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBab2RQYXJzZWRUeXBlLm5hbixcbiAgICAgICAgICAgICAgICByZWNlaXZlZDogY3R4LnBhcnNlZFR5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBJTlZBTElEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogXCJ2YWxpZFwiLCB2YWx1ZTogaW5wdXQuZGF0YSB9O1xuICAgIH1cbn1cblpvZE5hTi5jcmVhdGUgPSAocGFyYW1zKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBab2ROYU4oe1xuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZE5hTixcbiAgICAgICAgLi4ucHJvY2Vzc0NyZWF0ZVBhcmFtcyhwYXJhbXMpLFxuICAgIH0pO1xufTtcbmV4cG9ydCBjb25zdCBCUkFORCA9IFN5bWJvbChcInpvZF9icmFuZFwiKTtcbmV4cG9ydCBjbGFzcyBab2RCcmFuZGVkIGV4dGVuZHMgWm9kVHlwZSB7XG4gICAgX3BhcnNlKGlucHV0KSB7XG4gICAgICAgIGNvbnN0IHsgY3R4IH0gPSB0aGlzLl9wcm9jZXNzSW5wdXRQYXJhbXMoaW5wdXQpO1xuICAgICAgICBjb25zdCBkYXRhID0gY3R4LmRhdGE7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudHlwZS5fcGFyc2Uoe1xuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgcGFyZW50OiBjdHgsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB1bndyYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYudHlwZTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgWm9kUGlwZWxpbmUgZXh0ZW5kcyBab2RUeXBlIHtcbiAgICBfcGFyc2UoaW5wdXQpIHtcbiAgICAgICAgY29uc3QgeyBzdGF0dXMsIGN0eCB9ID0gdGhpcy5fcHJvY2Vzc0lucHV0UGFyYW1zKGlucHV0KTtcbiAgICAgICAgaWYgKGN0eC5jb21tb24uYXN5bmMpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZUFzeW5jID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluUmVzdWx0ID0gYXdhaXQgdGhpcy5fZGVmLmluLl9wYXJzZUFzeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogY3R4LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoaW5SZXN1bHQuc3RhdHVzID09PSBcImFib3J0ZWRcIilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICAgICAgaWYgKGluUmVzdWx0LnN0YXR1cyA9PT0gXCJkaXJ0eVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5kaXJ0eSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gRElSVFkoaW5SZXN1bHQudmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZi5vdXQuX3BhcnNlQXN5bmMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogaW5SZXN1bHQudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogY3R4LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUFzeW5jKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBpblJlc3VsdCA9IHRoaXMuX2RlZi5pbi5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICBkYXRhOiBjdHguZGF0YSxcbiAgICAgICAgICAgICAgICBwYXRoOiBjdHgucGF0aCxcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGluUmVzdWx0LnN0YXR1cyA9PT0gXCJhYm9ydGVkXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIElOVkFMSUQ7XG4gICAgICAgICAgICBpZiAoaW5SZXN1bHQuc3RhdHVzID09PSBcImRpcnR5XCIpIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMuZGlydHkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFwiZGlydHlcIixcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGluUmVzdWx0LnZhbHVlLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGVmLm91dC5fcGFyc2VTeW5jKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogaW5SZXN1bHQudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGN0eC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IGN0eCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgY3JlYXRlKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBab2RQaXBlbGluZSh7XG4gICAgICAgICAgICBpbjogYSxcbiAgICAgICAgICAgIG91dDogYixcbiAgICAgICAgICAgIHR5cGVOYW1lOiBab2RGaXJzdFBhcnR5VHlwZUtpbmQuWm9kUGlwZWxpbmUsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBab2RSZWFkb25seSBleHRlbmRzIFpvZFR5cGUge1xuICAgIF9wYXJzZShpbnB1dCkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9kZWYuaW5uZXJUeXBlLl9wYXJzZShpbnB1dCk7XG4gICAgICAgIGNvbnN0IGZyZWV6ZSA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNWYWxpZChkYXRhKSkge1xuICAgICAgICAgICAgICAgIGRhdGEudmFsdWUgPSBPYmplY3QuZnJlZXplKGRhdGEudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBpc0FzeW5jKHJlc3VsdCkgPyByZXN1bHQudGhlbigoZGF0YSkgPT4gZnJlZXplKGRhdGEpKSA6IGZyZWV6ZShyZXN1bHQpO1xuICAgIH1cbiAgICB1bndyYXAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kZWYuaW5uZXJUeXBlO1xuICAgIH1cbn1cblpvZFJlYWRvbmx5LmNyZWF0ZSA9ICh0eXBlLCBwYXJhbXMpID0+IHtcbiAgICByZXR1cm4gbmV3IFpvZFJlYWRvbmx5KHtcbiAgICAgICAgaW5uZXJUeXBlOiB0eXBlLFxuICAgICAgICB0eXBlTmFtZTogWm9kRmlyc3RQYXJ0eVR5cGVLaW5kLlpvZFJlYWRvbmx5LFxuICAgICAgICAuLi5wcm9jZXNzQ3JlYXRlUGFyYW1zKHBhcmFtcyksXG4gICAgfSk7XG59O1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLyAgICAgICAgICAgICAgICAgICAgLy8vLy8vLy8vL1xuLy8vLy8vLy8vLyAgICAgIHouY3VzdG9tICAgICAgLy8vLy8vLy8vL1xuLy8vLy8vLy8vLyAgICAgICAgICAgICAgICAgICAgLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZnVuY3Rpb24gY2xlYW5QYXJhbXMocGFyYW1zLCBkYXRhKSB7XG4gICAgY29uc3QgcCA9IHR5cGVvZiBwYXJhbXMgPT09IFwiZnVuY3Rpb25cIiA/IHBhcmFtcyhkYXRhKSA6IHR5cGVvZiBwYXJhbXMgPT09IFwic3RyaW5nXCIgPyB7IG1lc3NhZ2U6IHBhcmFtcyB9IDogcGFyYW1zO1xuICAgIGNvbnN0IHAyID0gdHlwZW9mIHAgPT09IFwic3RyaW5nXCIgPyB7IG1lc3NhZ2U6IHAgfSA6IHA7XG4gICAgcmV0dXJuIHAyO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGN1c3RvbShjaGVjaywgX3BhcmFtcyA9IHt9LCBcbi8qKlxuICogQGRlcHJlY2F0ZWRcbiAqXG4gKiBQYXNzIGBmYXRhbGAgaW50byB0aGUgcGFyYW1zIG9iamVjdCBpbnN0ZWFkOlxuICpcbiAqIGBgYHRzXG4gKiB6LnN0cmluZygpLmN1c3RvbSgodmFsKSA9PiB2YWwubGVuZ3RoID4gNSwgeyBmYXRhbDogZmFsc2UgfSlcbiAqIGBgYFxuICpcbiAqL1xuZmF0YWwpIHtcbiAgICBpZiAoY2hlY2spXG4gICAgICAgIHJldHVybiBab2RBbnkuY3JlYXRlKCkuc3VwZXJSZWZpbmUoKGRhdGEsIGN0eCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgciA9IGNoZWNrKGRhdGEpO1xuICAgICAgICAgICAgaWYgKHIgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHIudGhlbigocikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IGNsZWFuUGFyYW1zKF9wYXJhbXMsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgX2ZhdGFsID0gcGFyYW1zLmZhdGFsID8/IGZhdGFsID8/IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguYWRkSXNzdWUoeyBjb2RlOiBcImN1c3RvbVwiLCAuLi5wYXJhbXMsIGZhdGFsOiBfZmF0YWwgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IGNsZWFuUGFyYW1zKF9wYXJhbXMsIGRhdGEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IF9mYXRhbCA9IHBhcmFtcy5mYXRhbCA/PyBmYXRhbCA/PyB0cnVlO1xuICAgICAgICAgICAgICAgIGN0eC5hZGRJc3N1ZSh7IGNvZGU6IFwiY3VzdG9tXCIsIC4uLnBhcmFtcywgZmF0YWw6IF9mYXRhbCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIFpvZEFueS5jcmVhdGUoKTtcbn1cbmV4cG9ydCB7IFpvZFR5cGUgYXMgU2NoZW1hLCBab2RUeXBlIGFzIFpvZFNjaGVtYSB9O1xuZXhwb3J0IGNvbnN0IGxhdGUgPSB7XG4gICAgb2JqZWN0OiBab2RPYmplY3QubGF6eWNyZWF0ZSxcbn07XG5leHBvcnQgdmFyIFpvZEZpcnN0UGFydHlUeXBlS2luZDtcbihmdW5jdGlvbiAoWm9kRmlyc3RQYXJ0eVR5cGVLaW5kKSB7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kU3RyaW5nXCJdID0gXCJab2RTdHJpbmdcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2ROdW1iZXJcIl0gPSBcIlpvZE51bWJlclwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE5hTlwiXSA9IFwiWm9kTmFOXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kQmlnSW50XCJdID0gXCJab2RCaWdJbnRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RCb29sZWFuXCJdID0gXCJab2RCb29sZWFuXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kRGF0ZVwiXSA9IFwiWm9kRGF0ZVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFN5bWJvbFwiXSA9IFwiWm9kU3ltYm9sXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kVW5kZWZpbmVkXCJdID0gXCJab2RVbmRlZmluZWRcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2ROdWxsXCJdID0gXCJab2ROdWxsXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kQW55XCJdID0gXCJab2RBbnlcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RVbmtub3duXCJdID0gXCJab2RVbmtub3duXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTmV2ZXJcIl0gPSBcIlpvZE5ldmVyXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kVm9pZFwiXSA9IFwiWm9kVm9pZFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEFycmF5XCJdID0gXCJab2RBcnJheVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZE9iamVjdFwiXSA9IFwiWm9kT2JqZWN0XCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kVW5pb25cIl0gPSBcIlpvZFVuaW9uXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kRGlzY3JpbWluYXRlZFVuaW9uXCJdID0gXCJab2REaXNjcmltaW5hdGVkVW5pb25cIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RJbnRlcnNlY3Rpb25cIl0gPSBcIlpvZEludGVyc2VjdGlvblwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFR1cGxlXCJdID0gXCJab2RUdXBsZVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFJlY29yZFwiXSA9IFwiWm9kUmVjb3JkXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTWFwXCJdID0gXCJab2RNYXBcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RTZXRcIl0gPSBcIlpvZFNldFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEZ1bmN0aW9uXCJdID0gXCJab2RGdW5jdGlvblwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZExhenlcIl0gPSBcIlpvZExhenlcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RMaXRlcmFsXCJdID0gXCJab2RMaXRlcmFsXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kRW51bVwiXSA9IFwiWm9kRW51bVwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZEVmZmVjdHNcIl0gPSBcIlpvZEVmZmVjdHNcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2ROYXRpdmVFbnVtXCJdID0gXCJab2ROYXRpdmVFbnVtXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kT3B0aW9uYWxcIl0gPSBcIlpvZE9wdGlvbmFsXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kTnVsbGFibGVcIl0gPSBcIlpvZE51bGxhYmxlXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kRGVmYXVsdFwiXSA9IFwiWm9kRGVmYXVsdFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZENhdGNoXCJdID0gXCJab2RDYXRjaFwiO1xuICAgIFpvZEZpcnN0UGFydHlUeXBlS2luZFtcIlpvZFByb21pc2VcIl0gPSBcIlpvZFByb21pc2VcIjtcbiAgICBab2RGaXJzdFBhcnR5VHlwZUtpbmRbXCJab2RCcmFuZGVkXCJdID0gXCJab2RCcmFuZGVkXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kUGlwZWxpbmVcIl0gPSBcIlpvZFBpcGVsaW5lXCI7XG4gICAgWm9kRmlyc3RQYXJ0eVR5cGVLaW5kW1wiWm9kUmVhZG9ubHlcIl0gPSBcIlpvZFJlYWRvbmx5XCI7XG59KShab2RGaXJzdFBhcnR5VHlwZUtpbmQgfHwgKFpvZEZpcnN0UGFydHlUeXBlS2luZCA9IHt9KSk7XG4vLyByZXF1aXJlcyBUUyA0LjQrXG5jbGFzcyBDbGFzcyB7XG4gICAgY29uc3RydWN0b3IoLi4uXykgeyB9XG59XG5jb25zdCBpbnN0YW5jZU9mVHlwZSA9IChcbi8vIGNvbnN0IGluc3RhbmNlT2ZUeXBlID0gPFQgZXh0ZW5kcyBuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk+KFxuY2xzLCBwYXJhbXMgPSB7XG4gICAgbWVzc2FnZTogYElucHV0IG5vdCBpbnN0YW5jZSBvZiAke2Nscy5uYW1lfWAsXG59KSA9PiBjdXN0b20oKGRhdGEpID0+IGRhdGEgaW5zdGFuY2VvZiBjbHMsIHBhcmFtcyk7XG5jb25zdCBzdHJpbmdUeXBlID0gWm9kU3RyaW5nLmNyZWF0ZTtcbmNvbnN0IG51bWJlclR5cGUgPSBab2ROdW1iZXIuY3JlYXRlO1xuY29uc3QgbmFuVHlwZSA9IFpvZE5hTi5jcmVhdGU7XG5jb25zdCBiaWdJbnRUeXBlID0gWm9kQmlnSW50LmNyZWF0ZTtcbmNvbnN0IGJvb2xlYW5UeXBlID0gWm9kQm9vbGVhbi5jcmVhdGU7XG5jb25zdCBkYXRlVHlwZSA9IFpvZERhdGUuY3JlYXRlO1xuY29uc3Qgc3ltYm9sVHlwZSA9IFpvZFN5bWJvbC5jcmVhdGU7XG5jb25zdCB1bmRlZmluZWRUeXBlID0gWm9kVW5kZWZpbmVkLmNyZWF0ZTtcbmNvbnN0IG51bGxUeXBlID0gWm9kTnVsbC5jcmVhdGU7XG5jb25zdCBhbnlUeXBlID0gWm9kQW55LmNyZWF0ZTtcbmNvbnN0IHVua25vd25UeXBlID0gWm9kVW5rbm93bi5jcmVhdGU7XG5jb25zdCBuZXZlclR5cGUgPSBab2ROZXZlci5jcmVhdGU7XG5jb25zdCB2b2lkVHlwZSA9IFpvZFZvaWQuY3JlYXRlO1xuY29uc3QgYXJyYXlUeXBlID0gWm9kQXJyYXkuY3JlYXRlO1xuY29uc3Qgb2JqZWN0VHlwZSA9IFpvZE9iamVjdC5jcmVhdGU7XG5jb25zdCBzdHJpY3RPYmplY3RUeXBlID0gWm9kT2JqZWN0LnN0cmljdENyZWF0ZTtcbmNvbnN0IHVuaW9uVHlwZSA9IFpvZFVuaW9uLmNyZWF0ZTtcbmNvbnN0IGRpc2NyaW1pbmF0ZWRVbmlvblR5cGUgPSBab2REaXNjcmltaW5hdGVkVW5pb24uY3JlYXRlO1xuY29uc3QgaW50ZXJzZWN0aW9uVHlwZSA9IFpvZEludGVyc2VjdGlvbi5jcmVhdGU7XG5jb25zdCB0dXBsZVR5cGUgPSBab2RUdXBsZS5jcmVhdGU7XG5jb25zdCByZWNvcmRUeXBlID0gWm9kUmVjb3JkLmNyZWF0ZTtcbmNvbnN0IG1hcFR5cGUgPSBab2RNYXAuY3JlYXRlO1xuY29uc3Qgc2V0VHlwZSA9IFpvZFNldC5jcmVhdGU7XG5jb25zdCBmdW5jdGlvblR5cGUgPSBab2RGdW5jdGlvbi5jcmVhdGU7XG5jb25zdCBsYXp5VHlwZSA9IFpvZExhenkuY3JlYXRlO1xuY29uc3QgbGl0ZXJhbFR5cGUgPSBab2RMaXRlcmFsLmNyZWF0ZTtcbmNvbnN0IGVudW1UeXBlID0gWm9kRW51bS5jcmVhdGU7XG5jb25zdCBuYXRpdmVFbnVtVHlwZSA9IFpvZE5hdGl2ZUVudW0uY3JlYXRlO1xuY29uc3QgcHJvbWlzZVR5cGUgPSBab2RQcm9taXNlLmNyZWF0ZTtcbmNvbnN0IGVmZmVjdHNUeXBlID0gWm9kRWZmZWN0cy5jcmVhdGU7XG5jb25zdCBvcHRpb25hbFR5cGUgPSBab2RPcHRpb25hbC5jcmVhdGU7XG5jb25zdCBudWxsYWJsZVR5cGUgPSBab2ROdWxsYWJsZS5jcmVhdGU7XG5jb25zdCBwcmVwcm9jZXNzVHlwZSA9IFpvZEVmZmVjdHMuY3JlYXRlV2l0aFByZXByb2Nlc3M7XG5jb25zdCBwaXBlbGluZVR5cGUgPSBab2RQaXBlbGluZS5jcmVhdGU7XG5jb25zdCBvc3RyaW5nID0gKCkgPT4gc3RyaW5nVHlwZSgpLm9wdGlvbmFsKCk7XG5jb25zdCBvbnVtYmVyID0gKCkgPT4gbnVtYmVyVHlwZSgpLm9wdGlvbmFsKCk7XG5jb25zdCBvYm9vbGVhbiA9ICgpID0+IGJvb2xlYW5UeXBlKCkub3B0aW9uYWwoKTtcbmV4cG9ydCBjb25zdCBjb2VyY2UgPSB7XG4gICAgc3RyaW5nOiAoKGFyZykgPT4gWm9kU3RyaW5nLmNyZWF0ZSh7IC4uLmFyZywgY29lcmNlOiB0cnVlIH0pKSxcbiAgICBudW1iZXI6ICgoYXJnKSA9PiBab2ROdW1iZXIuY3JlYXRlKHsgLi4uYXJnLCBjb2VyY2U6IHRydWUgfSkpLFxuICAgIGJvb2xlYW46ICgoYXJnKSA9PiBab2RCb29sZWFuLmNyZWF0ZSh7XG4gICAgICAgIC4uLmFyZyxcbiAgICAgICAgY29lcmNlOiB0cnVlLFxuICAgIH0pKSxcbiAgICBiaWdpbnQ6ICgoYXJnKSA9PiBab2RCaWdJbnQuY3JlYXRlKHsgLi4uYXJnLCBjb2VyY2U6IHRydWUgfSkpLFxuICAgIGRhdGU6ICgoYXJnKSA9PiBab2REYXRlLmNyZWF0ZSh7IC4uLmFyZywgY29lcmNlOiB0cnVlIH0pKSxcbn07XG5leHBvcnQgeyBhbnlUeXBlIGFzIGFueSwgYXJyYXlUeXBlIGFzIGFycmF5LCBiaWdJbnRUeXBlIGFzIGJpZ2ludCwgYm9vbGVhblR5cGUgYXMgYm9vbGVhbiwgZGF0ZVR5cGUgYXMgZGF0ZSwgZGlzY3JpbWluYXRlZFVuaW9uVHlwZSBhcyBkaXNjcmltaW5hdGVkVW5pb24sIGVmZmVjdHNUeXBlIGFzIGVmZmVjdCwgZW51bVR5cGUgYXMgZW51bSwgZnVuY3Rpb25UeXBlIGFzIGZ1bmN0aW9uLCBpbnN0YW5jZU9mVHlwZSBhcyBpbnN0YW5jZW9mLCBpbnRlcnNlY3Rpb25UeXBlIGFzIGludGVyc2VjdGlvbiwgbGF6eVR5cGUgYXMgbGF6eSwgbGl0ZXJhbFR5cGUgYXMgbGl0ZXJhbCwgbWFwVHlwZSBhcyBtYXAsIG5hblR5cGUgYXMgbmFuLCBuYXRpdmVFbnVtVHlwZSBhcyBuYXRpdmVFbnVtLCBuZXZlclR5cGUgYXMgbmV2ZXIsIG51bGxUeXBlIGFzIG51bGwsIG51bGxhYmxlVHlwZSBhcyBudWxsYWJsZSwgbnVtYmVyVHlwZSBhcyBudW1iZXIsIG9iamVjdFR5cGUgYXMgb2JqZWN0LCBvYm9vbGVhbiwgb251bWJlciwgb3B0aW9uYWxUeXBlIGFzIG9wdGlvbmFsLCBvc3RyaW5nLCBwaXBlbGluZVR5cGUgYXMgcGlwZWxpbmUsIHByZXByb2Nlc3NUeXBlIGFzIHByZXByb2Nlc3MsIHByb21pc2VUeXBlIGFzIHByb21pc2UsIHJlY29yZFR5cGUgYXMgcmVjb3JkLCBzZXRUeXBlIGFzIHNldCwgc3RyaWN0T2JqZWN0VHlwZSBhcyBzdHJpY3RPYmplY3QsIHN0cmluZ1R5cGUgYXMgc3RyaW5nLCBzeW1ib2xUeXBlIGFzIHN5bWJvbCwgZWZmZWN0c1R5cGUgYXMgdHJhbnNmb3JtZXIsIHR1cGxlVHlwZSBhcyB0dXBsZSwgdW5kZWZpbmVkVHlwZSBhcyB1bmRlZmluZWQsIHVuaW9uVHlwZSBhcyB1bmlvbiwgdW5rbm93blR5cGUgYXMgdW5rbm93biwgdm9pZFR5cGUgYXMgdm9pZCwgfTtcbmV4cG9ydCBjb25zdCBORVZFUiA9IElOVkFMSUQ7XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHNpemluZy50cyBcdTIwMTQgU2hhcmVkIHBlci1ibG9jayBzaXppbmcgZnJhZ21lbnQgKHZhcmlhYmxlIGJsb2NrIHNpemluZywgRHJvcCAxKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE9uZSB1bmlmaWVkIG1lY2hhbmlzbSBmb3IgXCJ0aGlzIGJsb2NrIHJlbmRlcnMgbmFycm93ZXIgdGhhbiBpdHMgY29udGFpbmVyXCI6XG4vLyBhbiBvcHRpb25hbCB3aWR0aCBGUkFDVElPTiBwbHVzIGFuIG9wdGlvbmFsIGFsaWdubWVudC4gQXBwbGllZCB0b2RheSB0b1xuLy8gSW1hZ2VCbG9jayBhbmQgTWF0aEJsb2NrICh0aGUgc2l6YWJsZSBzZXQgd2l0aCBhIHJlYWwgYXV0aG9yaW5nIHN1cmZhY2UpO1xuLy8gZXh0ZW5kcyB0byBvdGhlciBibG9ja3MgYWRkaXRpdmVseSB3aGVuIHRoZWlyIGVkaXRpbmcgVUkgbGFuZHMuIERlc2lnbjpcbi8vIGRvY3MvZGVzaWduL3ZhcmlhYmxlLWJsb2NrLXNpemluZy5tZC5cbi8vXG4vLyBSZWZsb3ctc2FmZSBieSBjb25zdHJ1Y3Rpb246IHdpZHRoIGlzIHJlbGF0aXZlIChhIGZyYWN0aW9uIG9mIHdoYXRldmVyXG4vLyBjb250YWluZXIgdGhlIGJsb2NrIHNpdHMgaW4gXHUyMDE0IHBhZ2Ugb3IgY29sdW1uIGNlbGwpLCBuZXZlciBhYnNvbHV0ZSBwaXhlbHMsXG4vLyBhbmQgYSBuYXJyb3dlZCBibG9jayBzdGF5cyBpbiBub3JtYWwgZmxvdyAobm8gd3JhcC1hcm91bmQvZmxvYXQpLCBzbyBwcmludFxuLy8gcGFnaW5hdGlvbiBhbmQgdGhlIGZvbGRhYmxlJ3MgaGVpZ2h0IG1lYXN1cmVtZW50IGtlZXAgd29ya2luZy5cbi8vXG4vLyB3aWR0aCBcdTIwMTQgZnJhY3Rpb24gb2YgdGhlIGNvbnRhaW5lcidzIGNvbnRlbnQgd2lkdGgsIGluICgwLCAxXS4gQWJzZW50ID0gZnVsbFxuLy8gd2lkdGggKHRvZGF5J3MgYmVoYXZpb3IpLiBUaGUgZWRpdG9yIFVJIHNuYXBzIHRvIGNsZWFuIHN0b3BzICgyNS8zMy81MC82Ni9cbi8vIDc1LzEwMCUpIGJ1dCB0aGUgc2NoZW1hIGFjY2VwdHMgYW55IGZyYWN0aW9uIHNvIGZpbmUtZ3JhaW5lZCBkcmFncyB2YWxpZGF0ZS5cbi8vXG4vLyBhbGlnbiBcdTIwMTQgd2hlcmUgdGhlIG5hcnJvd2VkIGJsb2NrIHNpdHMgaG9yaXpvbnRhbGx5LiBBYnNlbnQgPSBjZW50ZXIgKHRoZVxuLy8gbmF0dXJhbCByZWFkIGZvciBmaWd1cmVzIG9uIGEgd29ya3NoZWV0KTsgb25seSBtZWFuaW5nZnVsIHdoZW4gd2lkdGggaXNcbi8vIHByZXNlbnQsIGFuZCB0aGUgcmVuZGVyZXIgaWdub3JlcyBpdCBvdGhlcndpc2UuIFN0b3JlZCBvbmx5IHdoZW4gd2lkdGggaXNcbi8vIHNldCBhbmQgdGhlIHZhbHVlIGlzICdsZWZ0Jy8ncmlnaHQnLCBzbyByb3VuZC10cmlwIGVxdWFsaXR5IGhvbGRzIGZvciB0aGVcbi8vIGRlZmF1bHQgY2FzZS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG5leHBvcnQgY29uc3QgQmxvY2tBbGlnbiA9IHouZW51bShbJ2xlZnQnLCAnY2VudGVyJywgJ3JpZ2h0J10pO1xuZXhwb3J0IHR5cGUgQmxvY2tBbGlnbiA9IHouaW5mZXI8dHlwZW9mIEJsb2NrQWxpZ24+O1xuXG4vLyBGcmFjdGlvbiBvZiBjb250YWluZXIgd2lkdGguIGd0KDApIG5vdCBtaW4oMCkgXHUyMDE0IGEgemVyby13aWR0aCBibG9jayBpcyBhXG4vLyBoaWRkZW4gYmxvY2ssIHdoaWNoIGlzIGEgZGlmZmVyZW50IChub25leGlzdGVudCkgZmVhdHVyZS5cbmV4cG9ydCBjb25zdCBCbG9ja1dpZHRoRnJhY3Rpb24gPSB6Lm51bWJlcigpLmd0KDApLm1heCgxKTtcblxuLy8gU3ByZWFkIGludG8gYSBibG9jaydzIHoub2JqZWN0KHsuLi59KSBzaGFwZS4gQSBwbGFpbiBvYmplY3QgKG5vdCBhIFpvZFxuLy8gc2NoZW1hKSBzbyBlYWNoIGJsb2NrIGtlZXBzIGEgZmxhdCBmaWVsZCBsaXN0IGFuZCBkaXNjcmltaW5hdGVkVW5pb24ga2VlcHNcbi8vIHdvcmtpbmcgdW50b3VjaGVkLlxuZXhwb3J0IGNvbnN0IHNpemluZ0ZpZWxkcyA9IHtcbiAgd2lkdGg6IEJsb2NrV2lkdGhGcmFjdGlvbi5vcHRpb25hbCgpLFxuICBhbGlnbjogQmxvY2tBbGlnbi5vcHRpb25hbCgpLFxufTtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IHNpemluZ0ZpZWxkcyB9IGZyb20gJy4uL3NpemluZy5qcyc7XG5cbi8vIEEgY3JvcCB3aW5kb3c6IHRoZSB2aXNpYmxlIHJlY3RhbmdsZSBpbnNpZGUgdGhlIHNvdXJjZSBpbWFnZSwgYXMgZnJhY3Rpb25zIG9mXG4vLyB0aGUgc291cmNlJ3Mgb3duIHdpZHRoL2hlaWdodC4geCx5ID0gdG9wLWxlZnQgb2YgdGhlIHdpbmRvdzsgdyxoID0gaXRzIHNpemUuXG4vLyBUaGUgd2luZG93IG11c3Qgc3RheSBpbnNpZGUgdGhlIHNvdXJjZSAoeCt3IFx1MjI2NCAxLCB5K2ggXHUyMjY0IDEpLiBBIHRpbnkgZXBzaWxvblxuLy8gYWJzb3JicyBmbG9hdCBlcnJvciBmcm9tIHRoZSBlZGl0b3IncyBweFx1MjE5MmZyYWN0aW9uIG1hdGguIFRoZSByZW5kZXJlciBpcyBwdXJlXG4vLyAobm8gaW1hZ2UgZGltZW5zaW9ucyksIHNvIHRoZSBjcm9wIHBpeGVsIGFzcGVjdCBpcyBkZXJpdmVkIGZyb20gdGhlIHNlcGFyYXRlbHlcbi8vIHN0b3JlZCBgc3JjQXNwZWN0YCAoc2VlIEltYWdlQmxvY2spLiBEZXNpZ246IGRvY3MvZGVzaWduL2ltYWdlLWNyb3AubWQuXG5jb25zdCBDUk9QX0VQU0lMT04gPSAxZS02O1xuZXhwb3J0IGNvbnN0IENyb3BSZWN0ID0gelxuICAub2JqZWN0KHtcbiAgICB4OiB6Lm51bWJlcigpLm1pbigwKS5sdCgxKSxcbiAgICB5OiB6Lm51bWJlcigpLm1pbigwKS5sdCgxKSxcbiAgICB3OiB6Lm51bWJlcigpLmd0KDApLm1heCgxKSxcbiAgICBoOiB6Lm51bWJlcigpLmd0KDApLm1heCgxKSxcbiAgfSlcbiAgLnJlZmluZShcbiAgICAoYykgPT4gYy54ICsgYy53IDw9IDEgKyBDUk9QX0VQU0lMT04gJiYgYy55ICsgYy5oIDw9IDEgKyBDUk9QX0VQU0lMT04sXG4gICAgeyBtZXNzYWdlOiAnY3JvcCB3aW5kb3cgbXVzdCBzdGF5IHdpdGhpbiB0aGUgc291cmNlICh4K3cgXHUyMjY0IDEsIHkraCBcdTIyNjQgMSknIH0sXG4gICk7XG5leHBvcnQgdHlwZSBDcm9wUmVjdCA9IHouaW5mZXI8dHlwZW9mIENyb3BSZWN0PjtcblxuLy8gUGhhc2UgMTogVVJMLW9ubHkuIE5vIHVwbG9hZCBwaXBlbGluZTsgdGVhY2hlcnMgcGFzdGUgYSBwdWJsaWMgVVJMLlxuLy8gUGhhc2UgMis6IGEgc2VwYXJhdGUgdmFyaWFudCB3aXRoIGEgU3VwYWJhc2UgU3RvcmFnZSB1cGxvYWQsIHdpdGggc3JjXG4vLyBwb2ludGluZyB0byBhIHNpZ25lZCBVUkwuIFNjaGVtYSBpcyBmb3J3YXJkLWNvbXBhdGlibGUgXHUyMDE0IGFkZGluZyBhIG5ld1xuLy8gYHNvdXJjZWAgZGlzY3JpbWluYXRvciBmaWVsZCBsYXRlciBpcyBub24tYnJlYWtpbmcgaWYgZXhpc3Rpbmcgcm93cyBhcmVcbi8vIHRyZWF0ZWQgYXMgYHNvdXJjZTogJ3VybCdgIGJ5IGRlZmF1bHQuXG5leHBvcnQgY29uc3QgSW1hZ2VCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2ltYWdlJyksXG4gIHNyYzogei5zdHJpbmcoKS51cmwoKSxcbiAgLy8gYWx0IGlzIHJlcXVpcmVkIGZvciBhY2Nlc3NpYmlsaXR5IGJ1dCBkZWZhdWx0cyB0byBlbXB0eSBzdHJpbmcgZm9yXG4gIC8vIGRlY29yYXRpdmUgaW1hZ2VzLiBFZGl0b3JzIHNob3VsZCB3YXJuIChub3QgYmxvY2spIG9uIGVtcHR5IGFsdC5cbiAgYWx0OiB6LnN0cmluZygpLmRlZmF1bHQoJycpLFxuICBjYXB0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIC8vIFZhcmlhYmxlIGJsb2NrIHNpemluZzogb3B0aW9uYWwgd2lkdGggZnJhY3Rpb24gKyBhbGlnbm1lbnQgKHNpemluZy50cykuXG4gIC8vIFRoaXMgSVMgdGhlIGltYWdlIGRpc3BsYXktc2l6ZSBtZWNoYW5pc20gXHUyMDE0IG5vIHNlcGFyYXRlIGludHJpbnNpYyBzaXplLlxuICAuLi5zaXppbmdGaWVsZHMsXG4gIC8vIENyb3AgKHJlZnJhbWUpIFx1MjAxNCB0aGUgdmlzaWJsZSBzdWItcmVjdGFuZ2xlIG9mIHRoZSBzb3VyY2UgKGRvY3MvZGVzaWduL1xuICAvLyBpbWFnZS1jcm9wLm1kKS4gYHNyY0FzcGVjdGAgKHRoZSBzb3VyY2UncyBuYXR1cmFsIFcvSCByYXRpbykgbGV0cyB0aGUgcHVyZVxuICAvLyByZW5kZXJlciBkZXJpdmUgdGhlIGNyb3AgcGl4ZWwgYXNwZWN0IEEgPSBzcmNBc3BlY3RcdTAwQjcody9oKSB3aXRob3V0IHJlYWRpbmdcbiAgLy8gaW1hZ2UgZGltZW5zaW9ucy4gU3RvcmVkIEJPVEgtT1ItTkVJVEhFUjogYW4gdW5jcm9wcGVkIGltYWdlIGNhcnJpZXNcbiAgLy8gbmVpdGhlciAoYnl0ZS1pZGVudGljYWwgdG8gdG9kYXkpLiBUaGUgcGFpcmluZyBpcyBlbmZvcmNlZCBpbiB0aGUgZWRpdG9yICtcbiAgLy8gc2VyaWFsaXplIChub3QgYSBzY2hlbWEgLnJlZmluZSBcdTIwMTQgSW1hZ2VCbG9jayBpcyBhIGRpc2NyaW1pbmF0ZWRVbmlvbiBtZW1iZXJcbiAgLy8gYW5kIHJlZmluZWQgb2JqZWN0cyBjYW4ndCBiZSBkaXNjcmltaW5hdGVkKTsgc2VlIHNlcmlhbGl6ZS50cyArIENSLUlOVi1ib3RoLlxuICBjcm9wOiBDcm9wUmVjdC5vcHRpb25hbCgpLFxuICBzcmNBc3BlY3Q6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBJbWFnZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgSW1hZ2VCbG9jaz47XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGdyYXBoLXByaW1pdGl2ZXMudHMgXHUyMDE0IGNvb3JkaW5hdGUtcGxhbmUgcHJpbWl0aXZlcywgZGVwZW5kZW5jeS1mcmVlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGF4aXMgLyBmdW5jdGlvbi1tb2RlbCAvIGRyYXdhYmxlIHZvY2FidWxhcnkgc2hhcmVkIGJ5IGV2ZXJ5IGdyYXBoLXNoYXBlZFxuLy8gc3VyZmFjZTogaW50ZXJhY3RpdmVfZ3JhcGggKHRoZSBncmFkZWQgYmxvY2spLCBncmFwaF9maWd1cmUgKHRoZSBzdGF0aWNcbi8vIHBpY3R1cmUpLCBtdWx0aXBsZV9jaG9pY2UgY2hvaWNlIGZpZ3VyZXMsIG1hdGNoaW5nIHNpZGVzLCBudW1iZXJfbGluZVxuLy8gKEVuZHBvaW50U3R5bGUpLCBhbmQgZGF0YV9wbG90LlxuLy9cbi8vIFRoZXNlIHNjaGVtYXMgbGl2ZSBIRVJFLCBpbiBhIGxlYWYgbW9kdWxlIHRoYXQgaW1wb3J0cyBub3RoaW5nIGJ1dCB6b2QsXG4vLyByYXRoZXIgdGhhbiBpbiBibG9ja3MvaW50ZXJhY3RpdmUtZ3JhcGgudHMgd2hlcmUgdGhleSBncmV3IHVwLiBUaGUgcmVhc29uIGlzXG4vLyBhIGhhcmQgb25lLCBub3QgdGlkaW5lc3M6IGludGVyYWN0aXZlLWdyYXBoLnRzIGltcG9ydHMgSW5saW5lTm9kZSBmcm9tXG4vLyBpbmxpbmUudHMgKGl0cyBwcm9tcHQvZmVlZGJhY2svc29sdXRpb24gZmllbGRzKSwgc28gYW55dGhpbmcgcmVhY2hpbmcgdGhlc2Vcbi8vIHByaW1pdGl2ZXMgVEhST1VHSCBpdCBpbmhlcml0cyBhIGRlcGVuZGVuY3kgb24gaW5saW5lLnRzLiBXaGVuIGlubGluZS50c1xuLy8gaXRzZWxmIG5lZWRzIHRoZW0gXHUyMDE0IERlZmluaXRpb25CbG9jayBhZG1pdHMgYSBncmFwaF9maWd1cmUsIHNlZSBpbmxpbmUudHMgXHUyMDE0XG4vLyB0aGF0IGNsb3NlcyB0aGUgY3ljbGUgaW5saW5lLnRzIC0+IGdyYXBoLWZpZ3VyZS50cyAtPiBpbnRlcmFjdGl2ZS1ncmFwaC50cyAtPlxuLy8gaW5saW5lLnRzLCBhbmQgdGhlIGN5Y2xlIGlzIGZhdGFsIHJhdGhlciB0aGFuIGNvc21ldGljOiBpbnRlcmFjdGl2ZS1ncmFwaC50c1xuLy8gZXZhbHVhdGVzIGB6LmFycmF5KElubGluZU5vZGUpYCBhdCBtb2R1bGUgc2NvcGUsIHNvIGEgcGFydGlhbGx5LWluaXRpYWxpemVkXG4vLyBpbmxpbmUuanMgdGhyb3dzIGEgVERaIFJlZmVyZW5jZUVycm9yIGF0IGltcG9ydCB0aW1lLlxuLy9cbi8vIGJsb2Nrcy9pbnRlcmFjdGl2ZS1ncmFwaC50cyByZS1leHBvcnRzIGV2ZXJ5dGhpbmcgaGVyZSwgc28gZXZlcnkgZXhpc3Rpbmdcbi8vIGltcG9ydGVyIGtlZXBzIGl0cyBjdXJyZW50IGltcG9ydCBwYXRoIGFuZCBpZGVudGl0eSBcdTIwMTQgbm90aGluZyBtb3ZlZCBmcm9tIGFcbi8vIGNvbnN1bWVyJ3MgcG9pbnQgb2Ygdmlldy4gTmV3IGlubGluZS1yZWFjaGFibGUgY29kZSAoZ3JhcGgtZmlndXJlLnRzKSBpbXBvcnRzXG4vLyBmcm9tIHRoaXMgbW9kdWxlIGRpcmVjdGx5LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5cbi8vIC0tLS0gQXhpcyBjb25maWd1cmF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgY29vcmRpbmF0ZSBwbGFuZSB0aGUgc3R1ZGVudCB3b3JrcyBpbi4gR3JhcGggdW5pdHMgdGhyb3VnaG91dCBcdTIwMTQgdG9sZXJhbmNlXG4vLyBhbmQgZ3JpZCBzdGVwcyBhcmUgaW4gdGhlIHNhbWUgdW5pdHMsIG5ldmVyIHBpeGVscywgc28gYSBwdWJsaXNoZWQgcGFnZSB0aGF0XG4vLyByZS1sYXlzLW91dCBhdCBhIGRpZmZlcmVudCBzaXplIHN0aWxsIHNjb3JlcyBpZGVudGljYWxseS5cbmV4cG9ydCBjb25zdCBBeGlzQ29uZmlnID0gei5vYmplY3Qoe1xuICB4TWluOiB6Lm51bWJlcigpLFxuICB4TWF4OiB6Lm51bWJlcigpLFxuICB5TWluOiB6Lm51bWJlcigpLFxuICB5TWF4OiB6Lm51bWJlcigpLFxuICB4R3JpZFN0ZXA6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5kZWZhdWx0KDEpLFxuICB5R3JpZFN0ZXA6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5kZWZhdWx0KDEpLFxuICBzaG93R3JpZDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgLy8gV2hlbiB0cnVlLCBhIGRyYWdnZWQgaGFuZGxlIHNuYXBzIHRvIHRoZSBuZWFyZXN0IGdyaWQgaW50ZXJzZWN0aW9uLiBLZXlib2FyZFxuICAvLyBudWRnZSBhbHdheXMgbW92ZXMgYnkgb25lIGdyaWQgc3RlcCByZWdhcmRsZXNzIChTaGlmdCA9IDAuMSBzdGVwLCBmaW5lKS5cbiAgc25hcFRvR3JpZDogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbn0pO1xuZXhwb3J0IHR5cGUgQXhpc0NvbmZpZyA9IHouaW5mZXI8dHlwZW9mIEF4aXNDb25maWc+O1xuXG4vLyAtLS0tIEVuZHBvaW50IHN0eWxlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gb3BlbiA9IGhvbGxvdyBkb3QsIHZhbHVlIEVYQ0xVREVEIChhIHN0cmljdCBpbmVxdWFsaXR5IGJvdW5kYXJ5LCBhbiBvcGVuXG4vLyBpbnRlcnZhbCBlbmQpOyBjbG9zZWQgPSBmaWxsZWQgZG90LCB2YWx1ZSBJTkNMVURFRC4gQSBzaGFyZWQgdm9jYWJ1bGFyeSB1c2VkXG4vLyBieSBpbmVxdWFsaXR5IGJvdW5kYXJpZXMgKERyb3AgNDogc3RyaWN0IFx1MjE5MiBvcGVuKSwgZG9tYWluLXJlc3RyaWN0ZWQgcmF5cyBhbmRcbi8vIHNlZ21lbnRzIChEcm9wIDYpLCBkaXNwbGF5IHNlZ21lbnRzLCBhbmQgdGhlIGZ1dHVyZSBudW1iZXItbGluZSBmYW1pbHkuIEFkZGVkXG4vLyBhcyBhIGZvdW5kYXRpb24gbm93IChEcm9wIDIpOyBjb25zdW1lcnMgcmVuZGVyL3Njb3JlIGl0IGluIHRoZWlyIG93biBkcm9wcy5cbmV4cG9ydCBjb25zdCBFbmRwb2ludFN0eWxlID0gei5lbnVtKFsnb3BlbicsICdjbG9zZWQnXSk7XG5leHBvcnQgdHlwZSBFbmRwb2ludFN0eWxlID0gei5pbmZlcjx0eXBlb2YgRW5kcG9pbnRTdHlsZT47XG5cbi8vIERvbWFpbiByZXN0cmljdGlvbiBvbiBhIGRyYXduIGN1cnZlIChEcm9wIDUvNik6IHJheXMgYW5kIHNlZ21lbnRzIG9mIGFcbi8vIGZ1bmN0aW9uLiBTdHlsZXMgbWFyayB3aGV0aGVyIGVhY2ggZW5kcG9pbnQgaXMgaW5jbHVkZWQgKGNsb3NlZCkgb3Igbm90LlxuZXhwb3J0IGNvbnN0IEN1cnZlRG9tYWluID0gei5vYmplY3Qoe1xuICBtaW46IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgbWluU3R5bGU6IEVuZHBvaW50U3R5bGUub3B0aW9uYWwoKSxcbiAgbWF4OiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIG1heFN0eWxlOiBFbmRwb2ludFN0eWxlLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIEN1cnZlRG9tYWluID0gei5pbmZlcjx0eXBlb2YgQ3VydmVEb21haW4+O1xuXG4vLyAtLS0tIEZ1bmN0aW9uIG1vZGVscyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRWFjaCBmYW1pbHkgY2FycmllcyBpdHMgcGFyYW1ldGVycyArIGEgcGVyLXBhcmFtZXRlciB0b2xlcmFuY2UsIGFuZCBpdHNcbi8vIHBhcmFtZXRlciBuYW1lcyBNQVRDSCB0aGUga2l0J3MgcmVncmVzc2lvbiBmaXR0ZXJzIChncmFwaC1raXQgZml0TGluZWFyIC9cbi8vIGZpdFF1YWRyYXRpYyAvIGZpdEV4cG9uZW50aWFsIC8gZml0TG9nYXJpdGhtaWMpIHNvIGEgZml0dGVkIGN1cnZlIHNjb3Jlc1xuLy8gYWdhaW5zdCB0aGUga2V5IHdpdGggbm8gdHJhbnNsYXRpb24uIEZvcm1zOlxuLy8gICBsaW5lYXIgICAgICAgeSA9IHNsb3BlXHUwMEI3eCArIGludGVyY2VwdFxuLy8gICBxdWFkcmF0aWMgICAgeSA9IGFcdTAwQjd4XHUwMEIyICsgYlx1MDBCN3ggKyBjXG4vLyAgIGV4cG9uZW50aWFsICB5ID0gYVx1MDBCN2JcdTAyRTMgICAgICAgICAgICAoYiA+IDApXG4vLyAgIGxvZ2FyaXRobWljICB5ID0gYSArIGJcdTAwQjdsbih4KSAgICAgKHggPiAwKVxuLy8gICB2ZXJ0aWNhbCAgICAgeCA9IGsgICAgICAgICAgICAgICAoTk9UIGEgeSA9IGYoeCkgY3VydmUgXHUyMDE0IHNjb3JlZCBvbiB4KVxuZXhwb3J0IGNvbnN0IExpbmVhck1vZGVsID0gei5vYmplY3Qoe1xuICBmYW1pbHk6IHoubGl0ZXJhbCgnbGluZWFyJyksXG4gIHNsb3BlOiB6Lm51bWJlcigpLFxuICBpbnRlcmNlcHQ6IHoubnVtYmVyKCksXG4gIHNsb3BlVG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxuICBpbnRlcmNlcHRUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIExpbmVhck1vZGVsID0gei5pbmZlcjx0eXBlb2YgTGluZWFyTW9kZWw+O1xuXG5leHBvcnQgY29uc3QgUXVhZHJhdGljTW9kZWwgPSB6Lm9iamVjdCh7XG4gIGZhbWlseTogei5saXRlcmFsKCdxdWFkcmF0aWMnKSxcbiAgYTogei5udW1iZXIoKSxcbiAgYjogei5udW1iZXIoKSxcbiAgYzogei5udW1iZXIoKSxcbiAgYVRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgYlRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgY1RvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgUXVhZHJhdGljTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBRdWFkcmF0aWNNb2RlbD47XG5cbmV4cG9ydCBjb25zdCBFeHBvbmVudGlhbE1vZGVsID0gei5vYmplY3Qoe1xuICBmYW1pbHk6IHoubGl0ZXJhbCgnZXhwb25lbnRpYWwnKSxcbiAgYTogei5udW1iZXIoKSxcbiAgYjogei5udW1iZXIoKSxcbiAgYVRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbiAgYlRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgRXhwb25lbnRpYWxNb2RlbCA9IHouaW5mZXI8dHlwZW9mIEV4cG9uZW50aWFsTW9kZWw+O1xuXG5leHBvcnQgY29uc3QgTG9nYXJpdGhtaWNNb2RlbCA9IHoub2JqZWN0KHtcbiAgZmFtaWx5OiB6LmxpdGVyYWwoJ2xvZ2FyaXRobWljJyksXG4gIGE6IHoubnVtYmVyKCksXG4gIGI6IHoubnVtYmVyKCksXG4gIGFUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG4gIGJUb2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIExvZ2FyaXRobWljTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBMb2dhcml0aG1pY01vZGVsPjtcblxuLy8gQSB2ZXJ0aWNhbCBsaW5lIHggPSBrLiBJdCBoYXMgbm8geSA9IGYoeCkgcmVwcmVzZW50YXRpb24gKGluZmluaXRlIHNsb3BlKSwgc29cbi8vIGl0IGNhbid0IHJpZGUgdGhlIHJlZ3Jlc3Npb24gZml0dGVycyBcdTIwMTQgdGhlIGtpdCBzY29yZXMgaXQgZGlyZWN0bHkgb24gdGhlXG4vLyBzdHVkZW50J3MgeC4gS2VwdCBpbiBGdW5jdGlvbk1vZGVsIChub3QgYSBzZXBhcmF0ZSBpbnRlcmFjdGlvbikgc28gYXV0aG9yaW5nIGFcbi8vIHZlcnRpY2FsIGxpbmUgaXMgdGhlIHNhbWUgXCJ0eXBlIGFuIGVxdWF0aW9uXCIgZmxvdyBhcyBhbnkgb3RoZXIgZmFtaWx5LlxuZXhwb3J0IGNvbnN0IFZlcnRpY2FsTW9kZWwgPSB6Lm9iamVjdCh7XG4gIGZhbWlseTogei5saXRlcmFsKCd2ZXJ0aWNhbCcpLFxuICB4OiB6Lm51bWJlcigpLFxuICB4VG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjEpLFxufSk7XG5leHBvcnQgdHlwZSBWZXJ0aWNhbE1vZGVsID0gei5pbmZlcjx0eXBlb2YgVmVydGljYWxNb2RlbD47XG5cbi8vIERpc2NyaW1pbmF0ZWQgb24gYGZhbWlseWAgc28gY29uc3VtZXJzIGJyYW5jaCB1bmlmb3JtbHkuIEdyb3dpbmcgYSBmYW1pbHkgaXMgYVxuLy8gbmV3IG1lbWJlciBoZXJlICsgYSBuZXcgZml0L3Njb3JlIGJyYW5jaCBpbiB0aGUga2l0IFx1MjAxNCBubyBvdGhlciBibG9jayB0b3VjaGVkLlxuZXhwb3J0IGNvbnN0IEZ1bmN0aW9uTW9kZWwgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbignZmFtaWx5JywgW1xuICBMaW5lYXJNb2RlbCxcbiAgUXVhZHJhdGljTW9kZWwsXG4gIEV4cG9uZW50aWFsTW9kZWwsXG4gIExvZ2FyaXRobWljTW9kZWwsXG4gIFZlcnRpY2FsTW9kZWwsXG5dKTtcbmV4cG9ydCB0eXBlIEZ1bmN0aW9uTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBGdW5jdGlvbk1vZGVsPjtcblxuLy8gLS0tLSBEcmF3YWJsZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGBEcmF3YWJsZWAgaXMgZGlzY3JpbWluYXRlZCBvbiBga2luZGAuIGBjdXJ2ZWAgUkVVU0VTIEZ1bmN0aW9uTW9kZWwsIHNvIHRoZVxuLy8gZGF5IHF1YWRyYXRpYy9leHBvbmVudGlhbC9sb2dhcml0aG1pYyBsYW5kIHRoZXkgbGlnaHQgdXAgaGVyZSBBTkQgaW5cbi8vIHBsb3RfZnVuY3Rpb24gYXQgb25jZS4gQSBgbGFiZWxgIHRleHQtYW5ub3RhdGlvbiBkcmF3YWJsZSBpcyBkZWxpYmVyYXRlbHlcbi8vIGRlZmVycmVkIChwb2ludC5sYWJlbCBjb3ZlcnMgdGhlIGNvbW1vbiBjYXNlKSBcdTIwMTQgWUFHTkksIGFkZGl0aXZlIHdoZW4gbmVlZGVkLlxuLy8gQXV0aG9yZWQgcGVyLWRyYXdhYmxlIGNvbG9yLiBTdG9yZWQgYXMgYSBwYWxldHRlIEtFWSAobm90IGEgaGV4KSBzbyBjb2xvcnNcbi8vIHN0YXkgc2VtYW50aWM7IHRoZSBrZXkgbGlzdCBpcyBkZWZpbmVkIEhFUkUgKGRlcGVuZGVuY3ktZnJlZSkgYW5kIHRoZSBrZXkgLT5cbi8vIGhleCBtYXAgbGl2ZXMgaW4gQGFjdGl2aXR5L2dyYXBoLWtpdCdzIERSQVdBQkxFX1BBTEVUVEUuIEEgZHJpZnQgZ3VhcmQgdGVzdFxuLy8ga2VlcHMgdGhlIHR3byBsaXN0cyBpbiBsb2Nrc3RlcC4gT3B0aW9uYWw6IGFic2VudCA9IHRoZSBzaGFyZWQgZGVmYXVsdCBjb2xvci5cbmV4cG9ydCBjb25zdCBEcmF3YWJsZUNvbG9yID0gei5lbnVtKFtcbiAgJ2JsdWUnLFxuICAnaW5kaWdvJyxcbiAgJ3RlYWwnLFxuICAnZ3JlZW4nLFxuICAnYW1iZXInLFxuICAncmVkJyxcbiAgJ3Zpb2xldCcsXG4gICdzbGF0ZScsXG5dKTtcbmV4cG9ydCB0eXBlIERyYXdhYmxlQ29sb3JUID0gei5pbmZlcjx0eXBlb2YgRHJhd2FibGVDb2xvcj47XG5cbmNvbnN0IFBvaW50RHJhd2FibGUgPSB6Lm9iamVjdCh7XG4gIGtpbmQ6IHoubGl0ZXJhbCgncG9pbnQnKSxcbiAgYXQ6IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgbGFiZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgLy8gb3BlbiA9IGhvbGxvdyAoZXhjbHVkZWQpLCBjbG9zZWQgPSBmaWxsZWQuIERlZmF1bHQgY2xvc2VkLlxuICBzdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxuICBjb2xvcjogRHJhd2FibGVDb2xvci5vcHRpb25hbCgpLFxufSk7XG5jb25zdCBDdXJ2ZURyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ2N1cnZlJyksXG4gIG1vZGVsOiBGdW5jdGlvbk1vZGVsLFxuICAvLyBEcm9wIDU6IGRhc2hlZCBib3VuZGFyeSArIGhhbGYtcGxhbmUgc2hhZGluZyB0dXJuIGEgZGlzcGxheSBjdXJ2ZSBpbnRvIGFcbiAgLy8gcGljdHVyZWQgaW5lcXVhbGl0eTsgZG9tYWluIHJlc3RyaWN0cyBpdCB0byBhIHJheS9zZWdtZW50LlxuICBzdHlsZTogei5lbnVtKFsnc29saWQnLCAnZGFzaGVkJ10pLm9wdGlvbmFsKCksXG4gIHNoYWRlOiB6LmVudW0oWydhYm92ZScsICdiZWxvdycsICdsZWZ0JywgJ3JpZ2h0J10pLm9wdGlvbmFsKCksXG4gIGRvbWFpbjogQ3VydmVEb21haW4ub3B0aW9uYWwoKSxcbiAgLy8gQ29udGludWF0aW9uIGFycm93aGVhZHMgb24gVU5CT1VOREVEIGVuZHMgKHRleHRib29rIGNvbnZlbnRpb246IGFycm93ID1cbiAgLy8gXCJrZWVwcyBnb2luZ1wiLCBkb3QgPSBcInN0b3BzIGhlcmVcIikuIERyYXduIHdoZXJlIHRoZSBjdXJ2ZSBleGl0cyB0aGUgdmlzaWJsZVxuICAvLyB3aW5kb3c7IGFuIGF1dGhvcmVkIGRvbWFpbiBib3VuZCBzdXBwcmVzc2VzIHRoYXQgZW5kJ3MgYXJyb3cgKGl0IGdldHMgdGhlXG4gIC8vIG9wZW4vY2xvc2VkIGRvdCBpbnN0ZWFkKS4gdW5kZWZpbmVkID0gdHJ1ZSBcdTIwMTQgYXJyb3dzIGFyZSB0aGUgY29udmVudGlvbixcbiAgLy8gdGhpcyBmbGFnIGlzIHRoZSBvcHQtb3V0IChhdXRob3IgY2FsbCAyMDI2LTA3LTEwKS5cbiAgYXJyb3dzOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICBjb2xvcjogRHJhd2FibGVDb2xvci5vcHRpb25hbCgpLFxufSk7XG5cbi8vIERyb3AgNTogcGxvdCBBTlkgcGFyc2VhYmxlIGZvcm11bGEgKHNpbih4KSwgcmF0aW9uYWxzLCBcdTIwMjYpIGJ5IHNhbXBsaW5nIFx1MjAxNCB0aGVcbi8vIGVzY2FwZSBoYXRjaCB0aGUgZ3JhZGVkIGZhbWlsaWVzIGRlbGliZXJhdGVseSBkb24ndCBjb3Zlci4gRGlzcGxheS1vbmx5LlxuY29uc3QgRXhwcmVzc2lvbkRyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ2V4cHJlc3Npb24nKSxcbiAgZXhwcmVzc2lvbjogei5zdHJpbmcoKS5taW4oMSksXG4gIHN0eWxlOiB6LmVudW0oWydzb2xpZCcsICdkYXNoZWQnXSkub3B0aW9uYWwoKSxcbiAgLy8gQ29udGludWF0aW9uIGFycm93aGVhZHMgYXQgYm90aCB3aW5kb3cgZXhpdHMgKHNlZSBDdXJ2ZURyYXdhYmxlLmFycm93cykuXG4gIGFycm93czogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgY29sb3I6IERyYXdhYmxlQ29sb3Iub3B0aW9uYWwoKSxcbn0pO1xuY29uc3QgU2VnbWVudERyYXdhYmxlID0gei5vYmplY3Qoe1xuICBraW5kOiB6LmxpdGVyYWwoJ3NlZ21lbnQnKSxcbiAgZnJvbTogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICB0bzogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICAvLyBEcm9wIDU6IG9wZW4vY2xvc2VkIGVuZHBvaW50IGRvdHMgKFtmcm9tLCB0b10pLiBEZWZhdWx0IGNsb3NlZC5cbiAgZW5kcG9pbnRzOiB6LnR1cGxlKFtFbmRwb2ludFN0eWxlLCBFbmRwb2ludFN0eWxlXSkub3B0aW9uYWwoKSxcbiAgY29sb3I6IERyYXdhYmxlQ29sb3Iub3B0aW9uYWwoKSxcbn0pO1xuXG4vLyBEcm9wIDU6IGEgcmF5IFx1MjAxNCBzdGFydHMgYXQgYGZyb21gIChvcGVuL2Nsb3NlZCksIHBhc3NlcyB0aHJvdWdoIGB0aHJvdWdoYCxcbi8vIHJ1bnMgdG8gdGhlIHdpbmRvdyBlZGdlLiBUaGUgcGh5c2ljcy1jbGFzcyBzdGFwbGUuXG5jb25zdCBSYXlEcmF3YWJsZSA9IHoub2JqZWN0KHtcbiAga2luZDogei5saXRlcmFsKCdyYXknKSxcbiAgZnJvbTogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICB0aHJvdWdoOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIGZyb21TdHlsZTogRW5kcG9pbnRTdHlsZS5vcHRpb25hbCgpLFxuICAvLyBDb250aW51YXRpb24gYXJyb3doZWFkIG9uIHRoZSB1bmJvdW5kZWQgZW5kIChzZWUgQ3VydmVEcmF3YWJsZS5hcnJvd3MpLlxuICBhcnJvd3M6IHouYm9vbGVhbigpLm9wdGlvbmFsKCksXG4gIGNvbG9yOiBEcmF3YWJsZUNvbG9yLm9wdGlvbmFsKCksXG59KTtcbmNvbnN0IFBvbHlnb25EcmF3YWJsZSA9IHoub2JqZWN0KHtcbiAga2luZDogei5saXRlcmFsKCdwb2x5Z29uJyksXG4gIHZlcnRpY2VzOiB6LmFycmF5KHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSkubWluKDMpLFxuICBmaWxsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gIGNvbG9yOiBEcmF3YWJsZUNvbG9yLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCBjb25zdCBEcmF3YWJsZSA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCdraW5kJywgW1xuICBQb2ludERyYXdhYmxlLFxuICBDdXJ2ZURyYXdhYmxlLFxuICBFeHByZXNzaW9uRHJhd2FibGUsXG4gIFNlZ21lbnREcmF3YWJsZSxcbiAgUmF5RHJhd2FibGUsXG4gIFBvbHlnb25EcmF3YWJsZSxcbl0pO1xuZXhwb3J0IHR5cGUgRHJhd2FibGUgPSB6LmluZmVyPHR5cGVvZiBEcmF3YWJsZT47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG4vLyBGcm9tIHRoZSBsZWFmIHByaW1pdGl2ZXMgbW9kdWxlLCBOT1QgZnJvbSAuL2ludGVyYWN0aXZlLWdyYXBoLmpzIFx1MjAxNCB0aGF0IGZpbGVcbi8vIGltcG9ydHMgaW5saW5lLnRzLCBhbmQgaW5saW5lLnRzIGltcG9ydHMgVEhJUyBvbmUgKGEgZGVmaW5pdGlvbiBtYXkgY29udGFpbiBhXG4vLyBncmFwaCBmaWd1cmUpLCBzbyByb3V0aW5nIHRocm91Z2ggaXQgd291bGQgY2xvc2UgYSBmYXRhbCBtb2R1bGUgY3ljbGUuIFNlZVxuLy8gLi4vZ3JhcGgtcHJpbWl0aXZlcy50cy5cbmltcG9ydCB7IEF4aXNDb25maWcsIERyYXdhYmxlIH0gZnJvbSAnLi4vZ3JhcGgtcHJpbWl0aXZlcy5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBHcmFwaEZpZ3VyZUJsb2NrIFx1MjAxNCBhIHN0YXRpYyBjb29yZGluYXRlLXBsYW5lIHBpY3R1cmUgKG5ldmVyIGludGVyYWN0aXZlKS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIHB1cmUgQ09OVEVOVCBibG9jayAoZGF0YS1ibG9jay1jYXRlZ29yeT1cImNvbnRlbnRcIik6IG5vbi1pbnRlcmFjdGl2ZSxcbi8vIG5vbi1udW1iZXJlZCwgbm8gcnVudGltZSB3aXJpbmcsIG5vIHN1Ym1pc3Npb24gd2lyZSBpbXBhY3QuIFRoZSBzdGFuZGFsb25lXG4vLyBwcm9tb3Rpb24gb2YgdGhlIE1DL21hdGNoaW5nIENob2ljZUdyYXBoIGZpZ3VyZSAoeyBheGlzLCBkcmF3YWJsZXMgfSkgdG8gYVxuLy8gYmxvY2ssIGJ1aWx0IGZvciB0aGUgcmVmZXJlbmNlIHBhbmVsIFx1MjAxNCBcInRoZXNlIHR3byBsaW5lcyBhcmUgcGFyYWxsZWxcIi1zdHlsZVxuLy8gcGljdHVyZXMgb24gYSBmb3JtdWxhIHNoZWV0LlxuLy9cbi8vIFJlbmRlcmVkIHNlcnZlci1zaWRlIGFzIGlubGluZSBTVkcgYnkgdGhlIHJlbmRlcmVyJ3MgZ3JhcGgtc3ZnIGVuZ2luZSwgbmV2ZXJcbi8vIHRoZSBpbnRlcmFjdGl2ZSBraXQgXHUyMDE0IHNvIGl0IHdvcmtzIG9uIHBhcGVyLCBpbiB0aGUgcHJpbnQgYm94LCBhbmQgaW4gdGhlXG4vLyBmbG9hdGluZyBwYW5lbCB3aXRoIHplcm8gSlMuIENvbnNlcXVlbmNlIChzYW1lIGFzIENob2ljZUdyYXBoKTogYGV4cHJlc3Npb25gXG4vLyBkcmF3YWJsZXMgbmVlZCB0aGUga2l0J3MgZm9ybXVsYSBwYXJzZXIgYW5kIGFyZSBOT1QgZHJhd247IGF1dGhvcmluZ1xuLy8gc3VyZmFjZXMgZG9uJ3Qgb2ZmZXIgdGhlbSBoZXJlLlxuLy9cbi8vIERlbGliZXJhdGVseSBOT1QgYSBkaXNwbGF5LW1vZGUgaW50ZXJhY3RpdmVfZ3JhcGg6IHRoYXQgYmxvY2sgaXMgYSBudW1iZXJlZC1cbi8vIHF1ZXN0aW9uIGZhbWlseSB3aXRoIHByb21wdC9zb2x1dGlvbi9jb25maWRlbmNlIGNocm9tZSBhbmQga2l0IGh5ZHJhdGlvbi5cbi8vIFRoaXMgb25lIGNhbiBuZXZlciBhY2NlcHQgc3R1ZGVudCBpbnB1dCBieSBjb25zdHJ1Y3Rpb24sIHdoaWNoIGlzIHRoZVxuLy8gcmVmZXJlbmNlIHBhbmVsJ3MgY29udHJhY3QuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgY29uc3QgR3JhcGhGaWd1cmVCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2dyYXBoX2ZpZ3VyZScpLFxuICBheGlzOiBBeGlzQ29uZmlnLFxuICBkcmF3YWJsZXM6IHouYXJyYXkoRHJhd2FibGUpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBHcmFwaEZpZ3VyZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgR3JhcGhGaWd1cmVCbG9jaz47XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGlubGluZS50cyBcdTIwMTQgSW5saW5lIGNvbnRlbnQgbm9kZXNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBJbmxpbmUgbm9kZXMgYXJlIHRoZSBhdG9tcyBpbnNpZGUgYSBibG9jaydzIGBjb250ZW50YCBhcnJheS4gTW9zdCBibG9ja3Ncbi8vIGFjY2VwdCB0aGUgSW5saW5lTm9kZSB1bmlvbiAodGV4dCArIGlubGluZSBtYXRoKS4gVGhlIGZpbGxfaW5fYmxhbmsgYmxvY2tcbi8vIGlzIHNwZWNpYWw6IGl0IGFjY2VwdHMgYW4gZXh0ZW5kZWQgdW5pb24gdGhhdCBhbHNvIGluY2x1ZGVzIEJsYW5rVG9rZW4uXG4vL1xuLy8gRGlzY3JpbWluYXRpb246IGV2ZXJ5IGlubGluZSBub2RlIGhhcyBhIGB0eXBlYCBsaXRlcmFsLiBab2Qnc1xuLy8gZGlzY3JpbWluYXRlZFVuaW9uIGtleXMgb24gaXQsIHdoaWNoIGdpdmVzIHVzIG5hcnJvdyB0eXBlcyBhZnRlciBwYXJzaW5nXG4vLyBhbmQgY2xlYXIgZXJyb3IgbWVzc2FnZXMgb24gbWFsZm9ybWVkIGRhdGEuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbi8vIEJvdGggaW1wb3J0cyBhcmUgTEVBRi1TQUZFIFx1MjAxNCBuZWl0aGVyIG1vZHVsZSBpbXBvcnRzIGlubGluZS50cywgc28gbmVpdGhlclxuLy8gY3JlYXRlcyBhIGN5Y2xlLiBzaXppbmcuanMgYW5kIGJsb2Nrcy9pbWFnZS5qcydzIENyb3BSZWN0IGFyZSB6b2Qtb25seTtcbi8vIGJsb2Nrcy9ncmFwaC1maWd1cmUuanMgcmVhY2hlcyBpdHMgYXhpcy9kcmF3YWJsZSBwcmltaXRpdmVzIHZpYSB0aGUgbGVhZlxuLy8gZ3JhcGgtcHJpbWl0aXZlcy50cyBwcmVjaXNlbHkgc28gdGhhdCB0aGlzIGltcG9ydCBpcyBwb3NzaWJsZS4gRG8gbm90IHN3YXBcbi8vIGVpdGhlciBmb3IgYSBibG9ja3MvIG1vZHVsZSB0aGF0IGNhcnJpZXMgSW5saW5lTm9kZS5cbmltcG9ydCB7IHNpemluZ0ZpZWxkcywgdHlwZSBCbG9ja0FsaWduIH0gZnJvbSAnLi9zaXppbmcuanMnO1xuaW1wb3J0IHsgQ3JvcFJlY3QgfSBmcm9tICcuL2Jsb2Nrcy9pbWFnZS5qcyc7XG5pbXBvcnQgeyBHcmFwaEZpZ3VyZUJsb2NrIH0gZnJvbSAnLi9ibG9ja3MvZ3JhcGgtZmlndXJlLmpzJztcblxuLy8gLS0tLSBNYXJrcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE1hcmtzIGFyZSBmb3JtYXR0aW5nIGFwcGxpZWQgdG8gYSBydW4gb2YgdGV4dCBcdTIwMTQgbm90IG5lc3RlZCBlbGVtZW50cyAobm9cbi8vIDxlbT48c3Ryb25nPi4uLjwvc3Ryb25nPjwvZW0+IHN0cnVjdHVyZSk7IGEgc2luZ2xlIFRleHROb2RlIGNhbiBjYXJyeVxuLy8gc2V2ZXJhbC4gT3JkZXIgZG9lc24ndCBtYXR0ZXIgXHUyMDE0IHJlbmRlciBvdXRwdXQgaXMgY2Fub25pY2FsaXplZC5cbi8vXG4vLyBFYWNoIG1hcmsgaXMgYW4gT0JKRUNUIHdpdGggYSBgdHlwZWAgZGlzY3JpbWluYW50LiBTaW1wbGUgbWFya3MgKGJvbGQsIGV0Yy4pXG4vLyBjYXJyeSBvbmx5IGB0eXBlYDsgYXR0cmlidXRlLWNhcnJ5aW5nIG1hcmtzIChlLmcuIGBkZWZpbml0aW9uYCkgaGFuZyB0aGVpclxuLy8gZGF0YSBvZmYgdGhlIHNhbWUgb2JqZWN0LiBMZWdhY3kgZG9jdW1lbnRzIHN0b3JlZCBtYXJrcyBhcyBiYXJlIHN0cmluZ3Ncbi8vICgnYm9sZCcpOyB0aGUgcHJlcHJvY2VzcyBiZWxvdyB1cGdyYWRlcyB0aG9zZSB0byB0aGUgb2JqZWN0IGZvcm0gb24gcmVhZCwgc29cbi8vIG9sZCBhY3Rpdml0aWVzIGtlZXAgcGFyc2luZyB3aXRob3V0IGEgc2NoZW1hVmVyc2lvbiBidW1wLiBOZXcgY29kZSBhbHdheXNcbi8vIHdyaXRlcyB0aGUgb2JqZWN0IGZvcm0uXG5leHBvcnQgY29uc3QgU0lNUExFX01BUktfVFlQRVMgPSBbXG4gICdib2xkJyxcbiAgJ2l0YWxpYycsXG4gICd1bmRlcmxpbmUnLFxuICAnY29kZScsXG4gICdzdWJzY3JpcHQnLFxuICAnc3VwZXJzY3JpcHQnLFxuXSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIFNpbXBsZU1hcmtUeXBlID0gKHR5cGVvZiBTSU1QTEVfTUFSS19UWVBFUylbbnVtYmVyXTtcblxuY29uc3QgQm9sZE1hcmsgPSB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnYm9sZCcpIH0pO1xuY29uc3QgSXRhbGljTWFyayA9IHoub2JqZWN0KHsgdHlwZTogei5saXRlcmFsKCdpdGFsaWMnKSB9KTtcbmNvbnN0IFVuZGVybGluZU1hcmsgPSB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgndW5kZXJsaW5lJykgfSk7XG5jb25zdCBDb2RlTWFyayA9IHoub2JqZWN0KHsgdHlwZTogei5saXRlcmFsKCdjb2RlJykgfSk7XG5jb25zdCBTdWJzY3JpcHRNYXJrID0gei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ3N1YnNjcmlwdCcpIH0pO1xuY29uc3QgU3VwZXJzY3JpcHRNYXJrID0gei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ3N1cGVyc2NyaXB0JykgfSk7XG5cbi8vIFRoZSBhdHRyaWJ1dGUtZnJlZSBtYXJrcyBhcyBhIHVuaW9uLiBEZWZpbml0aW9uIGNvbnRlbnQgKGJlbG93KSBhbGxvd3Mgb25seVxuLy8gdGhlc2UgXHUyMDE0IGEgZGVmaW5pdGlvbiBjYW4gYmUgZm9ybWF0dGVkIGJ1dCBjYW5ub3QgaXRzZWxmIGNvbnRhaW4gYSBuZXN0ZWRcbi8vIGRlZmluaXRpb24sIHdoaWNoIGFsc28ga2VlcHMgdGhlIHNjaGVtYSBub24tcmVjdXJzaXZlLlxuY29uc3QgU2ltcGxlTWFyayA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBCb2xkTWFyayxcbiAgSXRhbGljTWFyayxcbiAgVW5kZXJsaW5lTWFyayxcbiAgQ29kZU1hcmssXG4gIFN1YnNjcmlwdE1hcmssXG4gIFN1cGVyc2NyaXB0TWFyayxcbl0pO1xuXG4vLyAtLS0tIE1hdGggcHJvbXB0IChNb2RlbCBBOiBpbi1lcXVhdGlvbiBibGFuaykgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBncmFkZWFibGUgZ2FwIElOU0lERSBhIHJlbmRlcmVkIGVxdWF0aW9uIFx1MjAxNCB0aGUgTWF0aExpdmUgYFxccGxhY2Vob2xkZXJbaWRde31gXG4vLyBmZWF0dXJlLiBgaWRgIG1hdGNoZXMgdGhlIHBsYWNlaG9sZGVyIG1hcmtlciBpbiB0aGUgb3duaW5nIG5vZGUncyBgbGF0ZXhgOyB0aGVcbi8vIHN0dWRlbnQncyB0eXBlZCBtYXRoIGV4cHJlc3Npb24gaXMgZ3JhZGVkIGV4YWN0bHkgbGlrZSBhICdtYXRoJyBmaWxsLWluLWJsYW5rXG4vLyAobnVtZXJpYy1zYW1wbGluZyBlcXVpdmFsZW5jZSwgMmEgXHUyMjYxIGErYSBcdTIyNjEgYSoyKS4gTW9kZWwgQSByZXVzZXMgdGhlIGV4aXN0aW5nXG4vLyBgc3VibWlzc2lvbnMucmVzcG9uc2VzLmJsYW5rc2AgbWFwIGtleWVkIGJ5IHRoaXMgaWQsIHNvIHByb21wdHMgbmVlZCBOTyBuZXdcbi8vIHdpcmUgc2hhcGUuIEEgZ2FwIGlzIGluaGVyZW50bHkgYSBtYXRoIGFuc3dlciwgc28gdGhlcmUgaXMgbm8gYGFuc3dlclR5cGVgXG4vLyBoZXJlIFx1MjAxNCBgZXF1aXZhbGVuY2VgICsgYHRvbGVyYW5jZWAgYXJlIHRoZSBzYW1lIGdyYWRpbmcga25vYnMgYSAnbWF0aCdcbi8vIEJsYW5rVG9rZW4gY2FycmllcywgcmV1c2VkIHZlcmJhdGltLiBTZWUgZG9jcy9kZXNpZ24vbWF0aC1ibGFua3MubWQgKE1vZGVsIEEpLlxuZXhwb3J0IGNvbnN0IE1hdGhQcm9tcHQgPSB6Lm9iamVjdCh7XG4gIC8vIE1hdGNoZXMgdGhlIGBcXHBsYWNlaG9sZGVyW2lkXXt9YCBtYXJrZXIgaW4gdGhlIG93bmluZyBub2RlJ3MgbGF0ZXguIE5PVCBhXG4gIC8vIHV1aWQ6IE1hdGhMaXZlIHBsYWNlaG9sZGVyIGlkcyBtYXkgbm90IGNvbnRhaW4gc3BhY2VzL3NwZWNpYWwgY2hhcmFjdGVyc1xuICAvLyAodXVpZCBoeXBoZW5zIGFyZSB1bnNhZmUpLCBzbyB0aGUgZWRpdG9yIG1pbnRzIGEgTWF0aExpdmUtc2FmZSB0b2tlbi5cbiAgLy8gRG9jdW1lbnQtd2lkZSB1bmlxdWVuZXNzIChpdCBrZXlzIGludG8gdGhlIGJsYW5rcyBtYXApIGlzIGFuIGF1dGhvcmluZy10aW1lXG4gIC8vIGludmFyaWFudCwgbm90IGEgc2NoZW1hIGNvbnN0cmFpbnQuXG4gIGlkOiB6LnN0cmluZygpLm1pbigxKSxcbiAgYW5zd2VyOiB6LnN0cmluZygpLm1pbigxKSxcbiAgLy8gQWx0ZXJuYXRpdmUgYWNjZXB0YWJsZSBmb3JtcyAoXCJhbHNvIGFjY2VwdFwiKS4gRW1wdHkgYXJyYXkgaXMgdGhlIGNvbW1vbiBjYXNlLlxuICBhY2NlcHRhYmxlQW5zd2Vyczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgLy8gRXF1aXZhbGVuY2UgbW9kZTogJ3ZhbHVlJyAoZGVmYXVsdCwgYW55IGV4cHJlc3Npb24gdGhhdCBldmFsdWF0ZXMgZXF1YWwpIG9yXG4gIC8vICdleGFjdC1mb3JtJyAobm9ybWFsaXplZC1zdHJpbmcgbWF0Y2gpLiBBYnNlbnQgPSAndmFsdWUnLiBNaXJyb3JzIEJsYW5rVG9rZW4uXG4gIGVxdWl2YWxlbmNlOiB6LmVudW0oWyd2YWx1ZScsICdleGFjdC1mb3JtJ10pLm9wdGlvbmFsKCksXG4gIC8vIEFic29sdXRlIHNhbXBsaW5nIHRvbGVyYW5jZS4gQWJzZW50ID0gbm8gZXh0cmEgc2xhY2suIE1pcnJvcnMgQmxhbmtUb2tlbi5cbiAgdG9sZXJhbmNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNYXRoUHJvbXB0ID0gei5pbmZlcjx0eXBlb2YgTWF0aFByb21wdD47XG5cbi8vIC0tLS0gSW5saW5lIG1hdGggLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBMYVRlWCBzb3VyY2UgZm9yIEthVGVYLiBTdG9yZWQgdmVyYmF0aW07IHJlbmRlcmVkIGF0IHJlbmRlciB0aW1lLiBUaGVcbi8vIHJlbmRlcmVyIGlzIHRvbGVyYW50IG9mIGludmFsaWQgTGFUZVggKHJlbmRlcnMgYW4gZXJyb3IgaW5kaWNhdG9yIHJhdGhlclxuLy8gdGhhbiBjcmFzaGluZykgc28gc2F2aW5nIGEgZG9jIHdpdGggYnJva2VuIG1hdGggZG9lc24ndCBsb2NrIHRoZSBlZGl0b3IuXG5leHBvcnQgY29uc3QgSW5saW5lTWF0aE5vZGUgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnbWF0aF9pbmxpbmUnKSxcbiAgbGF0ZXg6IHouc3RyaW5nKCksXG4gIC8vIE1vZGVsIEE6IG9wdGlvbmFsIGluLWVxdWF0aW9uIGdyYWRlYWJsZSBnYXBzIChcdTAwQTdNYXRoUHJvbXB0KS4gT3B0aW9uYWwgd2l0aFxuICAvLyBOTyBkZWZhdWx0IHNvIGEgbWF0aCBub2RlIGF1dGhvcmVkIGJlZm9yZSBNb2RlbCBBIFx1MjAxNCBvciBvbmUgd2l0aCBubyBnYXBzIFx1MjAxNFxuICAvLyByZS1zZXJpYWxpemVzIEJZVEUtSURFTlRJQ0FMTFkgKGEgYC5kZWZhdWx0KFtdKWAgd291bGQgbWF0ZXJpYWxpemUgYHByb21wdHM6XG4gIC8vIFtdYCBvbiBldmVyeSBsZWdhY3kgbm9kZSkuIFNhbWUgb3B0aW9uYWwtbm8tZGVmYXVsdCBkaXNjaXBsaW5lIGFzXG4gIC8vIEJsYW5rVG9rZW4uYW5zd2VyVHlwZS90b2xlcmFuY2UuIFNlZSBkb2NzL2Rlc2lnbi9tYXRoLWJsYW5rcy5tZCAoTW9kZWwgQSkuXG4gIHByb21wdHM6IHouYXJyYXkoTWF0aFByb21wdCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgSW5saW5lTWF0aE5vZGUgPSB6LmluZmVyPHR5cGVvZiBJbmxpbmVNYXRoTm9kZT47XG5cbi8vIC0tLS0gSGFyZCBicmVhayAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIHNvZnQgbGluZSBicmVhayBpbnNpZGUgYSBibG9jayAoVGlwdGFwJ3MgaGFyZEJyZWFrIC8gU2hpZnQrRW50ZXIpLCBhc1xuLy8gb3Bwb3NlZCB0byBhIG5ldyBibG9jay4gQ2FycmllcyBubyBkYXRhIFx1MjAxNCBpdCByZW5kZXJzIGFzIDxicj4uIFdpdGhvdXQgdGhpc1xuLy8gbm9kZSB0aGUgYnJlYWsgaXMgZHJvcHBlZCBvbiBzZXJpYWxpemUgYW5kIGFkamFjZW50IHRleHQgcnVucyBjb25jYXRlbmF0ZS5cbmV4cG9ydCBjb25zdCBIYXJkQnJlYWtOb2RlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2hhcmRfYnJlYWsnKSxcbn0pO1xuZXhwb3J0IHR5cGUgSGFyZEJyZWFrTm9kZSA9IHouaW5mZXI8dHlwZW9mIEhhcmRCcmVha05vZGU+O1xuXG4vLyAtLS0tIERlZmluaXRpb24gY29udGVudCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHJpY2ggY29udGVudCBzaG93biBpbiBhIGRlZmluaXRpb24ncyBwb3BvdmVyOiBmb3JtYXR0ZWQgdGV4dCArIGlubGluZVxuLy8gbWF0aCAodGhlIHNhbWUgYWxwaGFiZXQgdGhlIGJsYW5rIGhpbnQgdXNlcyksIGF1dGhvcmVkIHZpYSB0aGUgc2hhcmVkXG4vLyBJbmxpbmVSaWNoVGV4dEVkaXRvci4gQSBkZWZpbml0aW9uJ3MgdGV4dCBydW4gY2FycmllcyBTaW1wbGVNYXJrIG9ubHkgXHUyMDE0IG5vXG4vLyBuZXN0ZWQgZGVmaW5pdGlvbnMgXHUyMDE0IHdoaWNoIGFsc28gYnJlYWtzIHRoZSByZWN1cnNpb24gdGhhdCByZXVzaW5nIElubGluZU5vZGVcbi8vIGhlcmUgd291bGQgY3JlYXRlIChEZWZpbml0aW9uTWFyayBcdTIxOTIgY29udGVudCBcdTIxOTIgdGV4dCBcdTIxOTIgbWFya3MgXHUyMTkyIERlZmluaXRpb25NYXJrKS5cbmNvbnN0IERlZmluaXRpb25Db250ZW50VGV4dCA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCd0ZXh0JyksXG4gIHRleHQ6IHouc3RyaW5nKCksXG4gIG1hcmtzOiB6LmFycmF5KFNpbXBsZU1hcmspLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgY29uc3QgRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmUgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgRGVmaW5pdGlvbkNvbnRlbnRUZXh0LFxuICBJbmxpbmVNYXRoTm9kZSxcbiAgSGFyZEJyZWFrTm9kZSxcbl0pO1xuZXhwb3J0IHR5cGUgRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmUgPSB6LmluZmVyPHR5cGVvZiBEZWZpbml0aW9uQ29udGVudElubGluZT47XG5cbi8vIC0tLS0gRGVmaW5pdGlvbiBibG9ja3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIGRlZmluaXRpb24ncyBjb250ZW50IGlzIGEgQkxPQ0sgc2VxdWVuY2UsIHNvIGEgdm9jYWJ1bGFyeSBwb3BvdmVyIGNhbiBob2xkXG4vLyB3aGF0IGEgcmVmZXJlbmNlIHNoZWV0IGhvbGRzOiBhIGRpc3BsYXkgZXF1YXRpb24sIGEgc2hvcnQgcHJvcGVydHkgbGlzdCwgYVxuLy8gZmlndXJlLiBTZWUgZG9jcy9kZXNpZ24vZGVmaW5pdGlvbi1yaWNoLWNvbnRlbnQubWQuXG4vL1xuLy8gVGhlIHVuaW9uIGlzIGEgY3VyYXRlZCBzdWJzZXQgb2YgdGhlIHJlZmVyZW5jZSBwYW5lbCdzIGNvbnRlbnQgYmxvY2tzLCBhbmRcbi8vIGV2ZXJ5IHRleHQtYmVhcmluZyBtZW1iZXIgaXMgZGVmaW5lZCBMT0NBTExZIG92ZXIgRGVmaW5pdGlvbkNvbnRlbnRJbmxpbmVcbi8vIHJhdGhlciB0aGFuIHJldXNpbmcgaXRzIGJsb2Nrcy8gc2libGluZy4gVGhhdCBpcyB3aGF0IGtlZXBzIHRoZSBzY2hlbWFcbi8vIE5PTi1SRUNVUlNJVkU6IGJsb2Nrcy9wYXJhZ3JhcGgudHMgYW5kIGZyaWVuZHMgY2FycnkgSW5saW5lTm9kZSwgd2hvc2Vcbi8vIFRleHROb2RlIGNhcnJpZXMgTWFyaywgd2hpY2ggaW5jbHVkZXMgRGVmaW5pdGlvbk1hcmsgXHUyMDE0IHNvIHJldXNpbmcgdGhlbSB3b3VsZFxuLy8gY2xvc2UgdGhlIGN5Y2xlIERlZmluaXRpb25NYXJrIC0+IGJsb2NrIC0+IHRleHQgLT4gbWFyayAtPiBEZWZpbml0aW9uTWFyayBhbmRcbi8vIGFkbWl0IGRlZmluaXRpb25zIG5lc3RlZCBpbnNpZGUgZGVmaW5pdGlvbnMgYXQgYXJiaXRyYXJ5IGRlcHRoLiBJdCB3b3VsZCBhbHNvXG4vLyBsYW5kIG9uIHRoZSBzYW1lIHRzYyBkZWNsYXJhdGlvbi1zZXJpYWxpemF0aW9uIGxpbWl0IChUUzcwNTYpIHRoYXQgYWxyZWFkeVxuLy8gZm9yY2VkIHRoZSBoYW5kLXdyaXR0ZW4gYGludGVyZmFjZSBBY3Rpdml0eURvY3VtZW50YCBpbiBkb2N1bWVudC50cy5cbi8vXG4vLyBFeGNsdWRlZCBvbiBwdXJwb3NlIChhdXRob3IgcnVsaW5ncywgZGVzaWduIGRvYyBEMi9EMyk6IGNvbHVtbnMgKHVucmVhZGFibGVcbi8vIGluIGEgfjI4cmVtIHBvcG92ZXIgXHUyMDE0IGEgZGVmaW5pdGlvbiB0aGF0IG5lZWRzIHR3by1jb2x1bW4gbGF5b3V0IElTIHRoZVxuLy8gcmVmZXJlbmNlIHBhbmVsKSwgY2FsbG91dCAoYSBub3RlIGJveCBpbnNpZGUgYSBub3RlIGJveCksIGFuZCBldmVyeVxuLy8gcXVlc3Rpb24vaW50ZXJhY3RpdmUgYmxvY2sgKGEgZGVmaW5pdGlvbiBpcyBuZXZlciBncmFkZWFibGUpLlxuLy9cbi8vIGBpZGAgaXMgT1BUSU9OQUwgb24gdGhlIGxvY2FsbHktZGVmaW5lZCBtZW1iZXJzLCB1bmxpa2UgZXZlcnkgYmxvY2tzLyBzaWJsaW5nXG4vLyB3aGVyZSBpdCBpcyBhIHJlcXVpcmVkIHV1aWQuIFR3byByZWFzb25zOiBub3RoaW5nIGFkZHJlc3NlcyBhIGRlZmluaXRpb24gYmxvY2tcbi8vIChpdCBpcyBuZXZlciBzY29yZWQsIG5ldmVyIGEgc3VibWlzc2lvbiBrZXksIG5ldmVyIGEgcnVudGltZSByZWYgXHUyMDE0IG9ubHkgdGhlXG4vLyBlZGl0b3Igd2FudHMgaXQsIGFuZCB0aGUgZWRpdG9yIGFsd2F5cyBtaW50cyBvbmUpLCBhbmQgdGhlIGxlZ2FjeSB1cGdyYWRlcyBpblxuLy8gdGhlIE1hcmsgcHJlcHJvY2VzcyBiZWxvdyBtdXN0IGJlIERFVEVSTUlOSVNUSUMuIEEgcmVxdWlyZWQgdXVpZCB3b3VsZCBmb3JjZVxuLy8gY3J5cHRvLnJhbmRvbVVVSUQoKSBhdCBwYXJzZSB0aW1lLCBzbyBwYXJzaW5nIG9uZSBzdG9yZWQgZG9jdW1lbnQgdHdpY2Ugd291bGRcbi8vIHlpZWxkIGRpZmZlcmVudCBpZHMgYW5kIGJyZWFrIHJlLXNlcmlhbGl6YXRpb24gYnl0ZS1pZGVudGl0eS5cblxuLy8gRXZlcnkgc2NoZW1hIGJlbG93IGNhcnJpZXMgYW4gRVhQTElDSVQgaW50ZXJmYWNlICsgYHouWm9kVHlwZTxcdTIwMjY+YCBhbm5vdGF0aW9uXG4vLyByYXRoZXIgdGhhbiByZWx5aW5nIG9uIHouaW5mZXIuIFRoaXMgaXMgbm90IHN0eWxlOiB3aXRob3V0IGl0LCBhZGRpbmcgYVxuLy8gNy1tZW1iZXIgYmxvY2sgdW5pb24gaW5zaWRlIGEgbWFyayB0aGF0IGV2ZXJ5IGJsb2NrJ3MgaW5saW5lIGNvbnRlbnQgY2FuXG4vLyByZWFjaCBvdmVyZmxvd3MgdHNjJ3MgZGVjbGFyYXRpb24tc2VyaWFsaXphdGlvbiBsaW1pdCBhbmQgZmFpbHMgdGhlIGJ1aWxkIHdpdGhcbi8vIFRTNzA1NiBpbiBmaXZlIGRvd25zdHJlYW0gZmlsZXMgKGJsb2Nrcy9pbmRleC50cydzIEJsb2NrLCBkb2N1bWVudC50cyxcbi8vIGxheW91dC50cykuIE5hbWluZyB0aGUgdHlwZXMgc3RvcHMgdGhlIHN0cnVjdHVyYWwgZXhwYW5zaW9uIGF0IHRoaXMgYm91bmRhcnkgXHUyMDE0XG4vLyB0aGUgc2FtZSByZW1lZHkgYGludGVyZmFjZSBBY3Rpdml0eURvY3VtZW50YCBhbHJlYWR5IGFwcGxpZXMgaW4gZG9jdW1lbnQudHMuXG4vLyBUaGUgYW5ub3RhdGlvbnMgYXJlIGNoZWNrZWQgYWdhaW5zdCB0aGUgb2JqZWN0IHNjaGVtYXMsIHNvIG5vdGhpbmcgaGVyZSBsb3Nlc1xuLy8gdHlwZSBzYWZldHksIGFuZCB0aGUgcnVudGltZSBvYmplY3RzIGFyZSB1bnRvdWNoZWQgKGEgZGlzY3JpbWluYXRlZFVuaW9uIHN0aWxsXG4vLyBwYXJzZXMgYXMgYSBkaXNjcmltaW5hdGVkVW5pb24pLlxuXG5jb25zdCBEZWZpbml0aW9uQmxvY2tJZCA9IHouc3RyaW5nKCkudXVpZCgpLm9wdGlvbmFsKCk7XG5cbi8vIFNoYXJlZCBzaXppbmcgZnJhZ21lbnQsIHNwZWxsZWQgb3V0IGZvciB0aGUgaW50ZXJmYWNlcyBhYm92ZS5cbmludGVyZmFjZSBEZWZpbml0aW9uU2l6aW5nIHtcbiAgd2lkdGg/OiBudW1iZXI7XG4gIGFsaWduPzogQmxvY2tBbGlnbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZWZpbml0aW9uUGFyYWdyYXBoQmxvY2sge1xuICBpZD86IHN0cmluZztcbiAgdHlwZTogJ3BhcmFncmFwaCc7XG4gIGNvbnRlbnQ6IERlZmluaXRpb25Db250ZW50SW5saW5lW107XG59XG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25IZWFkaW5nQmxvY2sge1xuICBpZD86IHN0cmluZztcbiAgdHlwZTogJ2hlYWRpbmcnO1xuICBsZXZlbDogMSB8IDIgfCAzO1xuICBjb250ZW50OiBEZWZpbml0aW9uQ29udGVudElubGluZVtdO1xufVxuZXhwb3J0IGludGVyZmFjZSBEZWZpbml0aW9uTWF0aEJsb2NrIGV4dGVuZHMgRGVmaW5pdGlvblNpemluZyB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAnbWF0aF9ibG9jayc7XG4gIGxhdGV4OiBzdHJpbmc7XG59XG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25JbWFnZUJsb2NrIGV4dGVuZHMgRGVmaW5pdGlvblNpemluZyB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAnaW1hZ2UnO1xuICBzcmM6IHN0cmluZztcbiAgYWx0OiBzdHJpbmc7XG4gIGNyb3A/OiBDcm9wUmVjdDtcbiAgc3JjQXNwZWN0PzogbnVtYmVyO1xufVxuXG5jb25zdCBEZWZpbml0aW9uUGFyYWdyYXBoQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgdHlwZTogei5saXRlcmFsKCdwYXJhZ3JhcGgnKSxcbiAgY29udGVudDogei5hcnJheShEZWZpbml0aW9uQ29udGVudElubGluZSkuZGVmYXVsdChbXSksXG59KTtcblxuLy8gU2FtZSB0aHJlZS1sZXZlbCBjYXAgYXMgSGVhZGluZ0Jsb2NrLiBUaGUgcG9wb3ZlciBzdHlsZXNoZWV0IHNjb3BlcyB0aGVzZVxuLy8gZG93biBzbyBhIHBhbmVsLXNjYWxlIGgxIHJlYWRzIGNvcnJlY3RseSBhdCBwb3BvdmVyIHNjYWxlLlxuY29uc3QgRGVmaW5pdGlvbkhlYWRpbmdCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IERlZmluaXRpb25CbG9ja0lkLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2hlYWRpbmcnKSxcbiAgbGV2ZWw6IHoudW5pb24oW3oubGl0ZXJhbCgxKSwgei5saXRlcmFsKDIpLCB6LmxpdGVyYWwoMyldKSxcbiAgY29udGVudDogei5hcnJheShEZWZpbml0aW9uQ29udGVudElubGluZSkuZGVmYXVsdChbXSksXG59KTtcblxuLy8gRGlzcGxheSBtYXRoLiBBIGRlZmluaXRpb24tbG9jYWwgc2hhcGUgcmF0aGVyIHRoYW4gYmxvY2tzL21hdGgtYmxvY2sudHMnc1xuLy8gTWF0aEJsb2NrLCB3aGljaCBjYXJyaWVzIGBwcm9tcHRzYCAoaW4tZXF1YXRpb24gZ3JhZGVhYmxlIGdhcHMpIGFuZFxuLy8gYHNvbHV0aW9uOiBJbmxpbmVOb2RlW11gIFx1MjAxNCB0aGUgZmlyc3QgaXMgbWVhbmluZ2xlc3MgaGVyZSAoYSBkZWZpbml0aW9uIGlzXG4vLyBuZXZlciBncmFkZWFibGUsIHRoZSBzYW1lIHBvc3R1cmUgdGhlIHJlZmVyZW5jZSBwYW5lbCBhbHJlYWR5IHRha2VzKSBhbmQgdGhlXG4vLyBzZWNvbmQgaXMgZXhhY3RseSB0aGUgcmVjdXJzaXZlIGVkZ2UgZGVzY3JpYmVkIGFib3ZlLiBTaXppbmcgcmlkZXMgYWxvbmc7XG4vLyBsYWJlbEZpZWxkcyBkbyBub3QgKGEgZGVmaW5pdGlvbiBibG9jayBpcyBuZXZlciBudW1iZXJlZCkuXG5jb25zdCBEZWZpbml0aW9uTWF0aEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogRGVmaW5pdGlvbkJsb2NrSWQsXG4gIHR5cGU6IHoubGl0ZXJhbCgnbWF0aF9ibG9jaycpLFxuICBsYXRleDogei5zdHJpbmcoKSxcbiAgLi4uc2l6aW5nRmllbGRzLFxufSk7XG5cbi8vIElsbHVzdHJhdGl2ZSBpbWFnZS4gRGVmaW5pdGlvbi1sb2NhbCBmb3IgdGhlIG9wdGlvbmFsLWlkIHJlYXNvbiBhYm92ZSwgYnV0IGl0XG4vLyByZXVzZXMgdGhlIHNoYXJlZCBzaXppbmcgKyBjcm9wIHZvY2FidWxhcnkgdmVyYmF0aW0sIHNvIHJlZnJhbWluZyBhIHRleHRib29rXG4vLyBmaWd1cmUgZG93biB0byB0aGUgcmVsZXZhbnQgY29ybmVyIHdvcmtzIGV4YWN0bHkgYXMgaXQgZG9lcyBpbiB0aGUgYm9keS5cbi8vIGBjYXB0aW9uYCBpcyBkZWxpYmVyYXRlbHkgYWJzZW50IChZQUdOSSBcdTIwMTQgYWx0IGNvdmVycyBhY2Nlc3NpYmlsaXR5LCBhbmQgYVxuLy8gY2FwdGlvbmVkIGZpZ3VyZSBpbiBhIHBvcG92ZXIgaXMgdGhlIHJlZmVyZW5jZSBwYW5lbCdzIGpvYik7IGFkZGl0aXZlIGxhdGVyLlxuY29uc3QgRGVmaW5pdGlvbkltYWdlQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgdHlwZTogei5saXRlcmFsKCdpbWFnZScpLFxuICBzcmM6IHouc3RyaW5nKCksXG4gIGFsdDogei5zdHJpbmcoKS5kZWZhdWx0KCcnKSxcbiAgLi4uc2l6aW5nRmllbGRzLFxuICBjcm9wOiBDcm9wUmVjdC5vcHRpb25hbCgpLFxuICBzcmNBc3BlY3Q6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxufSk7XG5cbi8vIE5lc3RlZCBsaXN0cywgbWlycm9yaW5nIGJsb2Nrcy9saXN0LnRzJ3Mgc2hhcGUgc28gVGFiLXRvLWluZGVudCBpbiB0aGVcbi8vIGRlZmluaXRpb24gZGlhbG9nIHJvdW5kLXRyaXBzLiBTYW1lIHJlY3Vyc2lvbiBtZWNoYW5pYzogb25seSB0aGUgY3ljbGljIGVkZ2Vcbi8vIChpdGVtIC0+IGxpc3QgLT4gaXRlbSkgaXMgei5sYXp5KCksIGxlYXZpbmcgdGhlIGxpc3QgYmxvY2tzIGFzIHBsYWluXG4vLyB6Lm9iamVjdHMgc28gdGhleSBzdGF5IHVzYWJsZSBhcyBkaXNjcmltaW5hdGVkVW5pb24gbWVtYmVycyBiZWxvdy5cbmV4cG9ydCBpbnRlcmZhY2UgRGVmaW5pdGlvbkxpc3RJdGVtIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIGNvbnRlbnQ6IERlZmluaXRpb25Db250ZW50SW5saW5lW107XG4gIGNoaWxkcmVuPzogQXJyYXk8RGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jayB8IERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrPjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jayB7XG4gIGlkPzogc3RyaW5nO1xuICB0eXBlOiAnYnVsbGV0X2xpc3QnO1xuICBpdGVtczogRGVmaW5pdGlvbkxpc3RJdGVtW107XG59XG5leHBvcnQgaW50ZXJmYWNlIERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIHR5cGU6ICdvcmRlcmVkX2xpc3QnO1xuICBpdGVtczogRGVmaW5pdGlvbkxpc3RJdGVtW107XG59XG5cbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uTGlzdEl0ZW06IHouWm9kVHlwZTxcbiAgRGVmaW5pdGlvbkxpc3RJdGVtLFxuICB6LlpvZFR5cGVEZWYsXG4gIHVua25vd25cbj4gPSB6LmxhenkoKCkgPT5cbiAgei5vYmplY3Qoe1xuICAgIGlkOiBEZWZpbml0aW9uQmxvY2tJZCxcbiAgICBjb250ZW50OiB6LmFycmF5KERlZmluaXRpb25Db250ZW50SW5saW5lKS5kZWZhdWx0KFtdKSxcbiAgICBjaGlsZHJlbjogelxuICAgICAgLmFycmF5KHoudW5pb24oW0RlZmluaXRpb25CdWxsZXRMaXN0QmxvY2ssIERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrXSkpXG4gICAgICAub3B0aW9uYWwoKSxcbiAgfSksXG4pO1xuXG5leHBvcnQgY29uc3QgRGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IERlZmluaXRpb25CbG9ja0lkLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2J1bGxldF9saXN0JyksXG4gIGl0ZW1zOiB6LmFycmF5KERlZmluaXRpb25MaXN0SXRlbSkuZGVmYXVsdChbXSksXG59KTtcblxuZXhwb3J0IGNvbnN0IERlZmluaXRpb25PcmRlcmVkTGlzdEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogRGVmaW5pdGlvbkJsb2NrSWQsXG4gIHR5cGU6IHoubGl0ZXJhbCgnb3JkZXJlZF9saXN0JyksXG4gIGl0ZW1zOiB6LmFycmF5KERlZmluaXRpb25MaXN0SXRlbSkuZGVmYXVsdChbXSksXG59KTtcblxuLy8gR3JhcGhGaWd1cmVCbG9jayBpcyB0aGUgT05FIG1lbWJlciByZXVzZWQgdmVyYmF0aW06IGl0IGlzIGFscmVhZHkgaW5saW5lLWZyZWVcbi8vIChheGlzICsgZHJhd2FibGVzIG9ubHkpLCBzbyBpdCBpbnRyb2R1Y2VzIG5vIGN5Y2xlLCBhbmQgaXQgaGFzIG5vIGxlZ2FjeVxuLy8gdXBncmFkZSBwYXRoIHRoYXQgd291bGQgbmVlZCB0byBtaW50IGl0cyByZXF1aXJlZCB1dWlkLiBJbXBvcnRpbmcgaXQgaXMgc2FmZVxuLy8gb25seSBiZWNhdXNlIGl0cyBvd24gZ3JhcGggcHJpbWl0aXZlcyBub3cgY29tZSBmcm9tIHRoZSBsZWFmXG4vLyBncmFwaC1wcmltaXRpdmVzLnRzIHJhdGhlciB0aGFuIHRocm91Z2ggYmxvY2tzL2ludGVyYWN0aXZlLWdyYXBoLnRzIFx1MjAxNCBzZWUgdGhlXG4vLyBoZWFkZXIgY29tbWVudCB0aGVyZS5cbmV4cG9ydCB0eXBlIERlZmluaXRpb25CbG9jayA9XG4gIHwgRGVmaW5pdGlvblBhcmFncmFwaEJsb2NrXG4gIHwgRGVmaW5pdGlvbkhlYWRpbmdCbG9ja1xuICB8IERlZmluaXRpb25NYXRoQmxvY2tcbiAgfCBEZWZpbml0aW9uSW1hZ2VCbG9ja1xuICB8IERlZmluaXRpb25CdWxsZXRMaXN0QmxvY2tcbiAgfCBEZWZpbml0aW9uT3JkZXJlZExpc3RCbG9ja1xuICB8IEdyYXBoRmlndXJlQmxvY2s7XG5cbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uQmxvY2s6IHouWm9kVHlwZTxcbiAgRGVmaW5pdGlvbkJsb2NrLFxuICB6LlpvZFR5cGVEZWYsXG4gIHVua25vd25cbj4gPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgRGVmaW5pdGlvblBhcmFncmFwaEJsb2NrLFxuICBEZWZpbml0aW9uSGVhZGluZ0Jsb2NrLFxuICBEZWZpbml0aW9uTWF0aEJsb2NrLFxuICBEZWZpbml0aW9uSW1hZ2VCbG9jayxcbiAgRGVmaW5pdGlvbkJ1bGxldExpc3RCbG9jayxcbiAgRGVmaW5pdGlvbk9yZGVyZWRMaXN0QmxvY2ssXG4gIEdyYXBoRmlndXJlQmxvY2ssXG5dKTtcblxuLy8gRGVmaW5pdGlvbk1hcmsgXHUyMDE0IGlubGluZSB2b2NhYnVsYXJ5IGRlZmluaXRpb24gKFBoYXNlIDIpLiBgY29udGVudGAgaXMgdGhlXG4vLyByaWNoIGRlZmluaXRpb24gc2hvd24gaW4gdGhlIHB1Ymxpc2hlZC1wYWdlIHBvcG92ZXIsIG5vdyBhIGJsb2NrIHNlcXVlbmNlXG4vLyAoc2VlIERlZmluaXRpb25CbG9jayBhYm92ZSkuIGBnbG9zc2FyeUtleWAgaXMgcmVzZXJ2ZWQgZm9yIHRoZSBQaGFzZSA0IHRlbmFudFxuLy8gZ2xvc3Nhcnkgc3RvcmUgKHJlc29sdmVkIGF0IHB1Ymxpc2gpIGFuZCBpcyB1bnVzZWQgaW4gUGhhc2UgMi4gVGhlIHJlbmRlcmVyXG4vLyBlbWl0cyBgPHNwYW4gY2xhc3M9XCJkZWZpbml0aW9uXCIgXHUyMDI2PmAgcGx1cyBhIGhpZGRlbiA8dGVtcGxhdGU+IGNhcnJ5aW5nIHRoZVxuLy8gcmVuZGVyZWQgY29udGVudDsgc2VlIFJVTlRJTUUubWQsIGRvY3MvZGVzaWduL3ZvY2FidWxhcnktZGVmaW5pdGlvbnMubWQsIGFuZFxuLy8gZG9jcy9kZXNpZ24vZGVmaW5pdGlvbi1yaWNoLWNvbnRlbnQubWQuXG4vLyBOT1QgYW5ub3RhdGVkIGFzIHouWm9kVHlwZSwgdW5saWtlIERlZmluaXRpb25CbG9jayBhYm92ZTogdGhpcyBzY2hlbWEgaXMgYVxuLy8gbWVtYmVyIG9mIHRoZSBgTWFya2AgZGlzY3JpbWluYXRlZFVuaW9uIGJlbG93LCBhbmQgei5kaXNjcmltaW5hdGVkVW5pb24gbmVlZHNcbi8vIHJlYWwgWm9kT2JqZWN0cyB0byBpbnRyb3NwZWN0IHRoZSBgdHlwZWAgZGlzY3JpbWluYXRvci4gVGhlIG5hbWVkXG4vLyBEZWZpbml0aW9uQmxvY2sgYWxpYXMgaXMgd2hhdCBrZWVwcyB0aGUgaW5mZXJyZWQgdHlwZSBoZXJlIHNtYWxsIGVub3VnaCBcdTIwMTQgdGhlXG4vLyBzYW1lIHJlYXNvbiBsaXN0LnRzIGtlZXBzIGl0cyBsaXN0IGJsb2NrcyBhcyBwbGFpbiB6Lm9iamVjdHMgYW5kIHB1dHMgdGhlXG4vLyB6LmxhenkoKSBvbmx5IG9uIHRoZSBjeWNsaWMgZWRnZS5cbmV4cG9ydCBjb25zdCBEZWZpbml0aW9uTWFyayA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdkZWZpbml0aW9uJyksXG4gIGNvbnRlbnQ6IHouYXJyYXkoRGVmaW5pdGlvbkJsb2NrKS5kZWZhdWx0KFtdKSxcbiAgZ2xvc3NhcnlLZXk6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGVmaW5pdGlvbk1hcmsgPSB6LmluZmVyPHR5cGVvZiBEZWZpbml0aW9uTWFyaz47XG5cbi8vIEEgZGVmaW5pdGlvbidzIGNvbnRlbnQgaXMgYSBibG9jayBhcnJheSB0b2RheSwgYnV0IHR3byBvbGRlciBzaGFwZXMgYXJlIHN0aWxsXG4vLyBvdXQgdGhlcmUgaW4gc3RvcmVkIGRvY3VtZW50cy4gQm90aCB1cGdyYWRlcyBiZWxvdyBhcmUgcHVyZSwgZGV0ZXJtaW5pc3RpY1xuLy8gcmVhZC10aW1lIHJld3JpdGVzIFx1MjAxNCB0aGV5IG1pbnQgbm8gaWRzIGFuZCBubyByYW5kb21uZXNzLCBzbyBwYXJzaW5nIHRoZSBzYW1lXG4vLyBzdG9yZWQgZG9jdW1lbnQgdHdpY2UgeWllbGRzIGlkZW50aWNhbCBvdXRwdXQuXG4vL1xuLy8gVGhleSBDT01QT1NFLCBvbGRlc3QgZmlyc3QsIGJlY2F1c2UgYSBkb2N1bWVudCBjYW4gY2FycnkgdGhlIG9sZGVzdCBzaGFwZTpcbi8vICAgdjEgIHsgZGVmaW5pdGlvbjogJ2Egc3RyaW5nJyB9ICAgICAgICAgICAgICAgICAgICAocHJlLXJpY2gtY29udGVudClcbi8vICAgdjIgIHsgY29udGVudDogW2lubGluZVx1MjAyNl0sIGltYWdlPzoge3NyYywgYWx0fSB9ICAgIChQaGFzZSAyIHJpY2ggaW5saW5lKVxuLy8gICB2MyAgeyBjb250ZW50OiBbYmxvY2tcdTIwMjZdIH0gICAgICAgICAgICAgICAgICAgICAgICAgKGN1cnJlbnQpXG4vLyBzbyB2MSBcdTIxOTIgdjIgXHUyMTkyIHYzIG11c3QgcnVuIGluIHNlcXVlbmNlIG9uIGEgc2luZ2xlIG1hcmsuXG4vLyBFeHBvcnRlZCBiZWNhdXNlIHRoZSBhcHAncyBzZXJpYWxpemVyIG5lZWRzIHRoZSBJREVOVElDQUwgbm9ybWFsaXphdGlvbiB3aGVuXG4vLyBpdCByZWFkcyBhIGRlZmluaXRpb24gbWFyaydzIFRpcHRhcCBhdHRycyBcdTIwMTQgYW4gZWRpdG9yIHNlc3Npb24gb3BlbmVkIGJlZm9yZVxuLy8gdGhlIGJsb2NrIG1pZ3JhdGlvbiBzdGlsbCBjYXJyaWVzIHRoZSB2MiBhdHRyIHNoYXBlLiBPbmUgaW1wbGVtZW50YXRpb24sIHNvXG4vLyB0aGUgc2NoZW1hIGFuZCB0aGUgc2VyaWFsaXplciBjYW5ub3QgZHJpZnQgYXBhcnQgb24gd2hhdCBhbiBvbGQgbWFyayBtZWFucy5cbmV4cG9ydCBmdW5jdGlvbiB1cGdyYWRlRGVmaW5pdGlvbk1hcmsobTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB1bmtub3duIHtcbiAgbGV0IGNvbnRlbnQgPSBtLmNvbnRlbnQ7XG4gIGNvbnN0IHJlc3QgPSB7IC4uLm0gfTtcblxuICAvLyB2MSBcdTIxOTIgdjI6IGEgcGxhaW4gYGRlZmluaXRpb25gIHN0cmluZyBiZWNvbWVzIGEgc2luZ2xlIGlubGluZSB0ZXh0IHJ1bi5cbiAgaWYgKHR5cGVvZiByZXN0LmRlZmluaXRpb24gPT09ICdzdHJpbmcnICYmIGNvbnRlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHRleHQgPSByZXN0LmRlZmluaXRpb247XG4gICAgY29udGVudCA9IHRleHQgPyBbeyB0eXBlOiAndGV4dCcsIHRleHQgfV0gOiBbXTtcbiAgfVxuICBkZWxldGUgcmVzdC5kZWZpbml0aW9uO1xuXG4gIC8vIHYyIFx1MjE5MiB2MzogYW4gSU5MSU5FIGNvbnRlbnQgYXJyYXkgYmVjb21lcyBvbmUgcGFyYWdyYXBoIGJsb2NrLiBEZXRlY3RlZCBieVxuICAvLyBzaGFwZSwgbm90IGJ5IGEgdmVyc2lvbiBmaWVsZCBcdTIwMTQgYW4gaW5saW5lIG5vZGUgaXMgYSB0ZXh0IC8gbWF0aF9pbmxpbmUgL1xuICAvLyBoYXJkX2JyZWFrLCBub25lIG9mIHdoaWNoIGlzIGEgYmxvY2sgYHR5cGVgLCBzbyB0aGUgZmlyc3QgZWxlbWVudFxuICAvLyBkaXNjcmltaW5hdGVzIHVuYW1iaWd1b3VzbHkuIEFuIGVtcHR5IGFycmF5IGlzIGFscmVhZHkgdmFsaWQgYXQgYm90aFxuICAvLyB2ZXJzaW9ucyBhbmQgaXMgbGVmdCBhbG9uZS5cbiAgY29uc3QgSU5MSU5FX1RZUEVTID0gWyd0ZXh0JywgJ21hdGhfaW5saW5lJywgJ2hhcmRfYnJlYWsnXTtcbiAgaWYgKEFycmF5LmlzQXJyYXkoY29udGVudCkgJiYgY29udGVudC5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZmlyc3QgPSBjb250ZW50WzBdIGFzIHsgdHlwZT86IHVua25vd24gfSB8IHVuZGVmaW5lZDtcbiAgICBpZiAodHlwZW9mIGZpcnN0Py50eXBlID09PSAnc3RyaW5nJyAmJiBJTkxJTkVfVFlQRVMuaW5jbHVkZXMoZmlyc3QudHlwZSkpIHtcbiAgICAgIGNvbnRlbnQgPSBbeyB0eXBlOiAncGFyYWdyYXBoJywgY29udGVudCB9XTtcbiAgICB9XG4gIH1cblxuICAvLyB2MiBcdTIxOTIgdjMgKEQ3KTogdGhlIHNlcGFyYXRlIGBpbWFnZWAgYXR0ciBiZWNvbWVzIGEgdHJhaWxpbmcgaW1hZ2UgYmxvY2ssIHNvXG4gIC8vIHRoZXJlIGlzIGV4YWN0bHkgb25lIHdheSB0byBleHByZXNzIGFuIGltYWdlIGluIGEgZGVmaW5pdGlvbi4gQXBwZW5kZWRcbiAgLy8gQUZURVIgdGhlIHRleHQsIG1hdGNoaW5nIHdoZXJlIHRoZSBvbGQgcG9wb3ZlciByZW5kZXJlZCBpdC5cbiAgY29uc3QgaW1hZ2UgPSByZXN0LmltYWdlO1xuICBkZWxldGUgcmVzdC5pbWFnZTtcbiAgaWYgKGltYWdlICE9PSBudWxsICYmIHR5cGVvZiBpbWFnZSA9PT0gJ29iamVjdCcpIHtcbiAgICBjb25zdCB7IHNyYywgYWx0IH0gPSBpbWFnZSBhcyB7IHNyYz86IHVua25vd247IGFsdD86IHVua25vd24gfTtcbiAgICBpZiAodHlwZW9mIHNyYyA9PT0gJ3N0cmluZycgJiYgc3JjKSB7XG4gICAgICBjb25zdCBibG9ja3MgPSBBcnJheS5pc0FycmF5KGNvbnRlbnQpID8gWy4uLmNvbnRlbnRdIDogW107XG4gICAgICBibG9ja3MucHVzaCh7XG4gICAgICAgIHR5cGU6ICdpbWFnZScsXG4gICAgICAgIHNyYyxcbiAgICAgICAgYWx0OiB0eXBlb2YgYWx0ID09PSAnc3RyaW5nJyA/IGFsdCA6ICcnLFxuICAgICAgfSk7XG4gICAgICBjb250ZW50ID0gYmxvY2tzO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IC4uLnJlc3QsIGNvbnRlbnQ6IGNvbnRlbnQgPz8gW10gfTtcbn1cblxuZXhwb3J0IGNvbnN0IE1hcmsgPSB6LnByZXByb2Nlc3MoXG4gIChtKSA9PiB7XG4gICAgLy8gTGVnYWN5OiBtYXJrcyB3ZXJlIGJhcmUgc3RyaW5ncyAoJ2JvbGQnKS5cbiAgICBpZiAodHlwZW9mIG0gPT09ICdzdHJpbmcnKSByZXR1cm4geyB0eXBlOiBtIH07XG4gICAgaWYgKFxuICAgICAgbSAhPT0gbnVsbCAmJlxuICAgICAgdHlwZW9mIG0gPT09ICdvYmplY3QnICYmXG4gICAgICAobSBhcyB7IHR5cGU/OiB1bmtub3duIH0pLnR5cGUgPT09ICdkZWZpbml0aW9uJ1xuICAgICkge1xuICAgICAgcmV0dXJuIHVwZ3JhZGVEZWZpbml0aW9uTWFyayhtIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICB9XG4gICAgcmV0dXJuIG07XG4gIH0sXG4gIHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICAgIEJvbGRNYXJrLFxuICAgIEl0YWxpY01hcmssXG4gICAgVW5kZXJsaW5lTWFyayxcbiAgICBDb2RlTWFyayxcbiAgICBTdWJzY3JpcHRNYXJrLFxuICAgIFN1cGVyc2NyaXB0TWFyayxcbiAgICBEZWZpbml0aW9uTWFyayxcbiAgXSksXG4pO1xuZXhwb3J0IHR5cGUgTWFyayA9IHouaW5mZXI8dHlwZW9mIE1hcms+O1xuLy8gVGhlIHNldCBvZiBtYXJrIGB0eXBlYCBkaXNjcmltaW5hbnRzLCBmb3IgY2FsbGVycyB0aGF0IGFsbG93LWxpc3QgYnkgbmFtZS5cbmV4cG9ydCB0eXBlIE1hcmtUeXBlID0gTWFya1sndHlwZSddO1xuXG4vLyAtLS0tIFRleHQgbm9kZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGNvbnN0IFRleHROb2RlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3RleHQnKSxcbiAgdGV4dDogei5zdHJpbmcoKSxcbiAgLy8gRGVmYXVsdCB0byBlbXB0eSBtYXJrcyBhcnJheSBzbyBjYWxsZXJzIGRvbid0IG5lZWQgdG8gc3BlY2lmeSB3aGVuIG5vbmUuXG4gIG1hcmtzOiB6LmFycmF5KE1hcmspLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBUZXh0Tm9kZSA9IHouaW5mZXI8dHlwZW9mIFRleHROb2RlPjtcblxuLy8gLS0tLSBJbmxpbmVOb2RlIHVuaW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIElubGluZU5vZGUgaXMgdGhlIHN0YW5kYXJkIGlubGluZSBhbHBoYWJldC4gVXNlZCBieSBhbGwgYmxvY2tzIGV4Y2VwdFxuLy8gZmlsbF9pbl9ibGFuay4gRGVmaW5lZCBiZWZvcmUgQmxhbmtUb2tlbiBiZWNhdXNlIHRoZSBibGFuaydzIHJpY2ggZmVlZGJhY2tcbi8vIGZpZWxkcyAoaGludCwgbWlzdGFrZUZlZWRiYWNrKSByZXVzZSB0aGlzIHVuaW9uLlxuZXhwb3J0IGNvbnN0IElubGluZU5vZGUgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgVGV4dE5vZGUsXG4gIElubGluZU1hdGhOb2RlLFxuICBIYXJkQnJlYWtOb2RlLFxuXSk7XG5leHBvcnQgdHlwZSBJbmxpbmVOb2RlID0gei5pbmZlcjx0eXBlb2YgSW5saW5lTm9kZT47XG5cbi8vIC0tLS0gQmxhbmsgdG9rZW4gKGZpbGwtaW4tdGhlLWJsYW5rIG9ubHkpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCbGFua3MgbGl2ZSBJTlNJREUgdGhlIGlubGluZSBjb250ZW50IHN0cmVhbSBvZiBhIGZpbGxfaW5fYmxhbmsgYmxvY2sgXHUyMDE0XG4vLyBzdHVkZW50cyBzZWUgYSBwcm9tcHQgd2l0aCBvbmUgb3IgbW9yZSBpbmxpbmUgYmxhbmtzLiBFYWNoIGJsYW5rIGhhcyBhXG4vLyBzdGFibGUgaWQgKHJlZmVyZW5jZWQgaW4gc3VibWlzc2lvbnMucmVzcG9uc2VzLmJsYW5rc1s8aWQ+XSkgYW5kIGFuIGFuc3dlclxuLy8ga2V5LlxuLy9cbi8vIHdpZHRoIGlzIGluIENTUyBjaGFycyAoYGNoYCB1bml0cykgXHUyMDE0IHVzZWQgdG8gc2l6ZSB0aGUgaW5wdXQuIE9wdGlvbmFsXG4vLyBiZWNhdXNlIHRoZSByZW5kZXJlciBoYXMgYSBzZW5zaWJsZSBkZWZhdWx0ICh+NiBjaGFycykuXG4vL1xuLy8gaGludCBhbmQgbWlzdGFrZUZlZWRiYWNrIGFyZSB0aGUgcGVyLWJsYW5rIGZlZWRiYWNrIGxheWVycyAoYmxvY2stbGV2ZWxcbi8vIGZpZWxkcyBcdTIwMTQgc29sdXRpb24sIGhhc0NvbmZpZGVuY2VSYXRpbmcsIHNraWxscyBcdTIwMTQgbGl2ZSBvbiBGaWxsSW5CbGFua0Jsb2NrKS5cbi8vIEJvdGggY2FycnkgcmljaCBpbmxpbmUgY29udGVudCAoSW5saW5lTm9kZVtdOiBmb3JtYXR0ZWQgdGV4dCArIGlubGluZSBtYXRoKVxuLy8gc28gZmVlZGJhY2sgY2FuIGluY2x1ZGUgdGhlIHNhbWUgZm9ybWF0dGluZyBhbmQgbWF0aCBhcyBwcm9ibGVtIHByb3NlLlxuLy8gVGhlIHJ1bnRpbWUgcmVhZHMgYm90aCBhdCBpbml0IGJ1dCBkb2VzIE5PVCBpbmplY3QgYW55dGhpbmcgaW50byB0aGUgRE9NXG4vLyB1bnRpbCB0aGUgc3R1ZGVudCBjbGlja3MgXCJDaGVjayB0aGlzIHNlY3Rpb24uXCIgT24gYSB3cm9uZyBhbnN3ZXIsIHRoZVxuLy8gcnVudGltZSBmaXJzdCBsb29rcyBmb3IgYSBtYXRjaGluZyBtaXN0YWtlRmVlZGJhY2sgZW50cnkgKGV4YWN0IHN0cmluZ1xuLy8gbWF0Y2ggZm9yIFBoYXNlIDEpOyBpZiBub25lIG1hdGNoZXMsIGl0IGZhbGxzIGJhY2sgdG8gaGludDsgaWYgaGludCBpc1xuLy8gYWxzbyBhYnNlbnQsIGl0IHNob3dzIHRoZSBnZW5lcmljIFx1MjcxNy5cbmV4cG9ydCBjb25zdCBCbGFua1Rva2VuID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2JsYW5rJyksXG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgYW5zd2VyOiB6LnN0cmluZygpLm1pbigxKSxcbiAgLy8gQWx0ZXJuYXRpdmUgY29ycmVjdCBhbnN3ZXJzLiBFbXB0eSBhcnJheSBpcyB0aGUgY29tbW9uIGNhc2UuXG4gIGFjY2VwdGFibGVBbnN3ZXJzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICB3aWR0aDogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC8vIE9wdGlvbmFsIHRlYWNoZXItYXV0aG9yZWQgbnVkZ2Ugc2hvd24gd2hlbiB0aGlzIGJsYW5rIGlzIHdyb25nIGFuZCBub1xuICAvLyBtaXN0YWtlRmVlZGJhY2sgZW50cnkgbWF0Y2hlcy4gUmljaCBpbmxpbmUgY29udGVudCAoZm9ybWF0dGVkIHRleHQgKyBtYXRoKS5cbiAgaGludDogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICAvLyBPcHRpb25hbCBsaXN0IG9mIGFudGljaXBhdGVkIHdyb25nIGFuc3dlcnMgcGFpcmVkIHdpdGggc3BlY2lmaWMgZmVlZGJhY2suXG4gIC8vIElmIHRoZSBzdHVkZW50J3Mgd3JvbmcgYW5zd2VyIG1hdGNoZXMgYSBgbWF0Y2hgIHN0cmluZyAoUGhhc2UgMTogZXhhY3RcbiAgLy8gbWF0Y2g7IHRoZSBzdHJhdGVneS1kaXNwYXRjaCBob29rIGluIHRoZSBydW50aW1lIHN1cHBvcnRzIHNtYXJ0ZXJcbiAgLy8gbWF0Y2hpbmcgbGF0ZXIpLCB0aGUgY29ycmVzcG9uZGluZyBmZWVkYmFjayBpcyBzaG93biBpbnN0ZWFkIG9mIHRoZVxuICAvLyBnZW5lcmljIGhpbnQuIEZpcnN0IG1hdGNoIHdpbnMuIGBmZWVkYmFja2AgaXMgcmljaCBpbmxpbmUgY29udGVudC5cbiAgbWlzdGFrZUZlZWRiYWNrOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICBtYXRjaDogei5zdHJpbmcoKSxcbiAgICBmZWVkYmFjazogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgfSkpLm9wdGlvbmFsKCksXG4gIC8vIE9yZGVyLWluZGVwZW5kZW50IGFuc3dlciBncm91cGluZy4gV2hlbiB0cnVlLCB0aGlzIGJsYW5rJ3MgYW5zd2VyIGlzXG4gIC8vIGludGVyY2hhbmdlYWJsZSB3aXRoIHRoZSBibGFuayBpbW1lZGlhdGVseSBiZWZvcmUgaXQgKGluIGRvY3VtZW50IG9yZGVyLFxuICAvLyB3aXRoaW4gdGhlIHNhbWUgYmxvY2spIFx1MjAxNCBlLmcuIGZhY3RvcmluZyBgKHggKyBcdTI2MTApKHggKyBcdTI2MTApYCB3aGVyZSAoMiwzKSBhbmRcbiAgLy8gKDMsMikgYXJlIGJvdGggY29ycmVjdCBidXQgKDIsMikgaXMgbm90LiBBIFwiZ3JvdXBcIiBpcyBhIG1heGltYWwgcnVuIG9mXG4gIC8vIGFkamFjZW50IGJsYW5rcyBlYWNoIGZsYWdnZWQgaGVyZTsgdGhlIHJlbmRlcmVyIGNvbXBpbGVzIHJ1bnMgaW50byBhXG4gIC8vIHNoYXJlZCBgZGF0YS1ibGFuay1ncm91cGAgaWQsIGFuZCB0aGUgcnVudGltZSBzY29yZXMgdGhlIGdyb3VwIHdpdGhcbiAgLy8gY29uc3VtZS1vbmNlIG1hdGNoaW5nIChlYWNoIGNvcnJlY3QgYW5zd2VyIGNhbiBzYXRpc2Z5IG9ubHkgb25lIGJsYW5rKS5cbiAgLy9cbiAgLy8gVGhpcyBib29sZWFuIGlzIGF1dGhvcmluZyAqc3VnYXIqOiB0aGUgZ2VuZXJhbCBtb2RlbCBsaXZlcyBpbiB0aGUgcnVudGltZVxuICAvLyBkYXRhLWF0dHJpYnV0ZSBjb250cmFjdCAoZ3JvdXAgaWRzKSwgc28gcmljaGVyIGdyb3VwaW5nIChub24tYWRqYWNlbnQsXG4gIC8vIGNyb3NzLWJsb2NrKSBjYW4gYmUgYWRkZWQgbGF0ZXIgYXMgYW4gYWRkaXRpdmUgYGdyb3VwYCBmaWVsZCB3aXRob3V0IGFcbiAgLy8gYnJlYWtpbmcgY2hhbmdlLiBUaGUgZmlyc3QgYmxhbmsgaW4gYSBibG9jayBpZ25vcmVzIHRoaXMgZmxhZyAobm9cbiAgLy8gcHJldmlvdXMgYmxhbmsgdG8gZ3JvdXAgd2l0aCkuXG4gIGludGVyY2hhbmdlYWJsZVdpdGhQcmV2aW91czogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIEFuc3dlciBpbnRlcnByZXRhdGlvbiBtb2RlLiBBYnNlbnQgKD0gJ3RleHQnKSBrZWVwcyB0aGUgUGhhc2UgMSBiZWhhdmlvcjpcbiAgLy8gZXhhY3Qgc3RyaW5nIG1hdGNoIGFnYWluc3QgYW5zd2VyICsgYWNjZXB0YWJsZUFuc3dlcnMuICdudW1lcmljJyB0ZWxscyB0aGVcbiAgLy8gcnVudGltZSB0byBwYXJzZSBCT1RIIHRoZSB0eXBlZCB2YWx1ZSBhbmQgZWFjaCBrZXkgZW50cnkgbnVtZXJpY2FsbHlcbiAgLy8gKGRlY2ltYWxzLCBmcmFjdGlvbnMgbGlrZSAzLzIsIG1peGVkIG51bWJlcnMgbGlrZSBcIjEgMS8yXCIsIGNvbW1hXG4gIC8vIHNlcGFyYXRvcnMsIGEgbGVhZGluZyAkKSBhbmQgY29tcGFyZSB3aXRoaW4gYHRvbGVyYW5jZWAgXHUyMDE0IHNvIDAuNSwgMS8yLFxuICAvLyBhbmQgLjUwIGFsbCBzYXRpc2Z5IGFuIGFuc3dlciBvZiBcIjEvMlwiLiBPcHRpb25hbCByYXRoZXIgdGhhbiBkZWZhdWx0ZWQgc29cbiAgLy8gZG9jdW1lbnRzIHN0b3JlZCBiZWZvcmUgdGhpcyBmaWVsZCBleGlzdGVkIHJlLXNlcmlhbGl6ZSBieXRlLWlkZW50aWNhbGx5LlxuICAvLyAnbWF0aCcgKE1vZGVsIEIgbWF0aCBibGFua3MpIGdyYWRlcyB0aGUgdHlwZWQgdmFsdWUgYXMgYSBtYXRoIEVYUFJFU1NJT046XG4gIC8vIHRoZSBydW50aW1lIGxhenktbG9hZHMgdGhlIGdyYXBoLWtpdCBhbmQgY29tcGFyZXMgYnkgbnVtZXJpYy1zYW1wbGluZ1xuICAvLyBlcXVpdmFsZW5jZSAoMmEgXHUyMjYxIGErYSBcdTIyNjEgYSoyKSwgTk9UIHN0cmluZyBtYXRjaC4gU2VlIGRvY3MvZGVzaWduL21hdGgtYmxhbmtzLm1kLlxuICBhbnN3ZXJUeXBlOiB6LmVudW0oWyd0ZXh0JywgJ251bWVyaWMnLCAnbWF0aCddKS5vcHRpb25hbCgpLFxuICAvLyBBYnNvbHV0ZSBjb21wYXJpc29uIHRvbGVyYW5jZS4gRm9yICdudW1lcmljJzogfHR5cGVkIC0ga2V5fCA8PSB0b2xlcmFuY2UuXG4gIC8vIEZvciAnbWF0aCc6IHRoZSBhYnNvbHV0ZSB0b2xlcmFuY2UgcGFzc2VkIHRvIHRoZSBzYW1wbGluZyBjb21wYXJpc29uLlxuICAvLyBBYnNlbnQgPSBleGFjdCBlcXVhbGl0eSAobnVtZXJpYykgLyBubyBleHRyYSBzbGFjayAobWF0aCkuXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbiAgLy8gRXF1aXZhbGVuY2UgbW9kZSBmb3IgJ21hdGgnIGJsYW5rczogJ3ZhbHVlJyAoZGVmYXVsdCwgYW55IGV4cHJlc3Npb24gdGhhdFxuICAvLyBldmFsdWF0ZXMgZXF1YWwpIG9yICdleGFjdC1mb3JtJyAobm9ybWFsaXplZC1zdHJpbmcgbWF0Y2ggXHUyMDE0IFwid3JpdGUgaXQgaW5cbiAgLy8gdGhpcyBmb3JtXCIpLiBPbmx5IG1lYW5pbmdmdWwgd2hlbiBhbnN3ZXJUeXBlIGlzICdtYXRoJzsgYWJzZW50ID0gJ3ZhbHVlJy5cbiAgZXF1aXZhbGVuY2U6IHouZW51bShbJ3ZhbHVlJywgJ2V4YWN0LWZvcm0nXSkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQmxhbmtUb2tlbiA9IHouaW5mZXI8dHlwZW9mIEJsYW5rVG9rZW4+O1xuXG4vLyAtLS0tIEZpbGxJbkJsYW5rSW5saW5lIHVuaW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRmlsbEluQmxhbmtJbmxpbmUgaXMgdGhlIGV4dGVuZGVkIGFscGhhYmV0IGZvciBmaWxsX2luX2JsYW5rIGJsb2NrcyBvbmx5LlxuLy8gSW5jbHVkZXMgQmxhbmtUb2tlbiBpbiBhZGRpdGlvbiB0byB0aGUgc3RhbmRhcmQgaW5saW5lIG5vZGVzLlxuZXhwb3J0IGNvbnN0IEZpbGxJbkJsYW5rSW5saW5lID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFRleHROb2RlLFxuICBJbmxpbmVNYXRoTm9kZSxcbiAgSGFyZEJyZWFrTm9kZSxcbiAgQmxhbmtUb2tlbixcbl0pO1xuZXhwb3J0IHR5cGUgRmlsbEluQmxhbmtJbmxpbmUgPSB6LmluZmVyPHR5cGVvZiBGaWxsSW5CbGFua0lubGluZT47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuZXhwb3J0IGNvbnN0IFBhcmFncmFwaEJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgncGFyYWdyYXBoJyksXG4gIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG59KTtcbmV4cG9ydCB0eXBlIFBhcmFncmFwaEJsb2NrID0gei5pbmZlcjx0eXBlb2YgUGFyYWdyYXBoQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vIFRocmVlIGxldmVscyBpcyBhIGRlbGliZXJhdGUgY29uc3RyYWludC4gV29ya3NoZWV0cyBkb24ndCBuZWVkIGRlZXBlclxuLy8gaGllcmFyY2h5IGFuZCBjYXBwaW5nIGl0IGF0IDMga2VlcHMgdGhlIHZpc3VhbCBoaWVyYXJjaHkgbWVhbmluZ2Z1bC5cbmV4cG9ydCBjb25zdCBIZWFkaW5nTGV2ZWwgPSB6LnVuaW9uKFt6LmxpdGVyYWwoMSksIHoubGl0ZXJhbCgyKSwgei5saXRlcmFsKDMpXSk7XG5leHBvcnQgdHlwZSBIZWFkaW5nTGV2ZWwgPSB6LmluZmVyPHR5cGVvZiBIZWFkaW5nTGV2ZWw+O1xuXG5leHBvcnQgY29uc3QgSGVhZGluZ0Jsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnaGVhZGluZycpLFxuICBsZXZlbDogSGVhZGluZ0xldmVsLFxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxufSk7XG5leHBvcnQgdHlwZSBIZWFkaW5nQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBIZWFkaW5nQmxvY2s+O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBsYWJlbC50cyBcdTIwMTQgU2hhcmVkIHBlci1ibG9jayBkaXNwbGF5LWxhYmVsIGZyYWdtZW50IChudW1iZXJpbmcvbGFiZWwgZGVjb3VwbGUpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRGVjb3VwbGVzIFwiaXMgdGhpcyBncmFkZWFibGU/XCIgZnJvbSBcImRvZXMgaXQgd2VhciBhIHByb2JsZW0gbnVtYmVyP1wiLiBBXG4vLyBncmFkZWFibGUgYmxvY2sgaXMgYWx3YXlzIHNjb3JlZCBhbmQgYWx3YXlzIHJldmlld2FibGU7IHRoaXMgZmllbGQgY29udHJvbHNcbi8vIG9ubHkgd2hhdCBzaG93cyBvbiB0aGUgcGFnZTpcbi8vXG4vLyAgIGF1dG8gICBcdTIwMTQgdGhlIGRlZmF1bHQ6IGEgbnVtYmVyZWQgcHJvYmxlbSwgY29uc3VtaW5nIG9uZSBzbG90IG9mIHRoZVxuLy8gICAgICAgICAgICBkb2N1bWVudC13aWRlIHNlcXVlbmNlICh0b2RheSdzIGJlaGF2aW9yIGZvciBldmVyeSBncmFkZWFibGUgYmxvY2spLlxuLy8gICBjdXN0b20gXHUyMDE0IHNob3cgYXV0aG9yZWQgdGV4dCAoXCJXYXJtLXVwXCIsIFwiQ2hhbGxlbmdlXCIpIGluc3RlYWQgb2YgYSBudW1iZXIsXG4vLyAgICAgICAgICAgIGFuZCBET04nVCBjb25zdW1lIGEgc2VxdWVuY2Ugc2xvdCAob3V0LW9mLXNlcXVlbmNlIGxhYmVsKS5cbi8vICAgbm9uZSAgIFx1MjAxNCBzaG93IG5vdGhpbmc7IERPTidUIGNvbnN1bWUgYSBzbG90LiBUaGUgbm90ZXMga2V5d29yZC1ibGFuayBjYXNlOlxuLy8gICAgICAgICAgICBhIGdyYWRlYWJsZSBnYXAgdGhhdCBrZWVwcyBzdHVkZW50cyByZWFkaW5nIHdpdGhvdXQgbG9va2luZyBsaWtlIGFcbi8vICAgICAgICAgICAgcXVpeiBxdWVzdGlvbi4gU3RpbGwgc2NvcmVkLCBzdGlsbCBpbiB0aGUgdGVhY2hlcidzIHJlc3VsdHMgdmlld1xuLy8gICAgICAgICAgICAobG9jYXRlZCBieSBpdHMgc3Vycm91bmRpbmcgdGV4dCwgbm90IGEgbnVtYmVyKS5cbi8vXG4vLyBPcHRpb25hbCB3aXRoIE5PIGRlZmF1bHQsIGV4YWN0bHkgbGlrZSBzaXppbmdGaWVsZHMgYW5kIG1hdGhfYmxvY2sucHJvbXB0czpcbi8vIGFuIGFic2VudCBgbGFiZWxgIG1lYW5zIGBhdXRvYCwgc28gYSBibG9jayBhdXRob3JlZCBiZWZvcmUgdGhpcyBmZWF0dXJlIFx1MjAxNCBvclxuLy8gb25lIGxlZnQgYXQgdGhlIGRlZmF1bHQgXHUyMDE0IHJlLXNlcmlhbGl6ZXMgQllURS1JREVOVElDQUxMWS4gVGhlIHJlbmRlcmVyIGFuZFxuLy8gZWRpdG9yIHRyZWF0IGB1bmRlZmluZWRgIGFuZCBge21vZGU6J2F1dG8nfWAgaWRlbnRpY2FsbHkuXG4vL1xuLy8gVGhlIHBlci1ibG9jayBtYW51YWwgaW50ZWdlciBgbnVtYmVyYCBvdmVycmlkZSBpcyBvcnRob2dvbmFsIGFuZCBzdGlsbCBsaXZlc1xuLy8gb24gdGhlIGluZGl2aWR1YWwgYmxvY2tzOiBpdCByZWxhYmVscyB0aGUgc2hvd24gaW50ZWdlciB3aGlsZSBTVEFZSU5HIGluXG4vLyBzZXF1ZW5jZSwgYW5kIGl0IGFwcGxpZXMgb25seSB3aGVuIHRoZSBsYWJlbCBtb2RlIGlzIGF1dG8gKGN1c3RvbS9ub25lIHdpbikuXG4vLyBTZWUgZG9jcy9kZXNpZ24gKyBibG9jay1wcmVkaWNhdGVzLnRzLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5cbmV4cG9ydCBjb25zdCBCbG9ja0xhYmVsID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ21vZGUnLCBbXG4gIHoub2JqZWN0KHsgbW9kZTogei5saXRlcmFsKCdhdXRvJykgfSksXG4gIC8vIG1pbigxKTogYW4gZW1wdHkgY3VzdG9tIGxhYmVsIGlzIG1lYW5pbmdsZXNzIFx1MjAxNCBhdXRob3IgZWl0aGVyIHdhbnRzIHRleHQgb3JcbiAgLy8gd2FudHMgYG5vbmVgLiBLZWVwcyByb3VuZC10cmlwIGhvbmVzdCAobm8gZW1wdHktc3RyaW5nIGdob3N0cykuXG4gIHoub2JqZWN0KHsgbW9kZTogei5saXRlcmFsKCdjdXN0b20nKSwgdGV4dDogei5zdHJpbmcoKS5taW4oMSkgfSksXG4gIHoub2JqZWN0KHsgbW9kZTogei5saXRlcmFsKCdub25lJykgfSksXG5dKTtcbmV4cG9ydCB0eXBlIEJsb2NrTGFiZWwgPSB6LmluZmVyPHR5cGVvZiBCbG9ja0xhYmVsPjtcblxuLy8gU3ByZWFkIGludG8gYSBncmFkZWFibGUgYmxvY2sncyB6Lm9iamVjdCh7Li4ufSkgc2hhcGUuIFBsYWluIG9iamVjdCAobm90IGEgWm9kXG4vLyBzY2hlbWEpIHNvIGVhY2ggYmxvY2sga2VlcHMgYSBmbGF0IGZpZWxkIGxpc3QgYW5kIGRpc2NyaW1pbmF0ZWRVbmlvbiBrZWVwc1xuLy8gd29ya2luZywgbWlycm9yaW5nIHNpemluZ0ZpZWxkcy5cbmV4cG9ydCBjb25zdCBsYWJlbEZpZWxkcyA9IHtcbiAgbGFiZWw6IEJsb2NrTGFiZWwub3B0aW9uYWwoKSxcbn07XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBzaXppbmdGaWVsZHMgfSBmcm9tICcuLi9zaXppbmcuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5pbXBvcnQgeyBNYXRoUHJvbXB0LCBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gRGlzcGxheSBtYXRoIChjZW50ZXJlZCwgZnVsbCB3aWR0aCBieSBkZWZhdWx0KS4gSW5saW5lIG1hdGggaXMgaW4gaW5saW5lLnRzXG4vLyBhcyBJbmxpbmVNYXRoTm9kZS4gVGhleSdyZSBzZXBhcmF0ZSBub2RlIHR5cGVzIGJlY2F1c2UgdGhleSByZW5kZXJcbi8vIGRpZmZlcmVudGx5IGFuZCBoYXZlIGRpZmZlcmVudCBzZW1hbnRpYyBtZWFuaW5nLlxuZXhwb3J0IGNvbnN0IE1hdGhCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ21hdGhfYmxvY2snKSxcbiAgbGF0ZXg6IHouc3RyaW5nKCksXG4gIC8vIE1vZGVsIEE6IG9wdGlvbmFsIGluLWVxdWF0aW9uIGdyYWRlYWJsZSBnYXBzIChcdTAwQTdNYXRoUHJvbXB0LCBpbmxpbmUudHMpLlxuICAvLyBPcHRpb25hbCB3aXRoIE5PIGRlZmF1bHQgc28gYSBtYXRoIGJsb2NrIGF1dGhvcmVkIGJlZm9yZSBNb2RlbCBBIFx1MjAxNCBvciBvbmVcbiAgLy8gd2l0aCBubyBnYXBzIFx1MjAxNCByZS1zZXJpYWxpemVzIEJZVEUtSURFTlRJQ0FMTFkuIFNlZSBkb2NzL2Rlc2lnbi9tYXRoLWJsYW5rcy5tZC5cbiAgcHJvbXB0czogei5hcnJheShNYXRoUHJvbXB0KS5vcHRpb25hbCgpLFxuICAvLyBXb3JrZWQgZXhwbGFuYXRpb24gcmV2ZWFsZWQgcG9zdC1jaGVjaywgbWlycm9yaW5nIEZpbGxJbkJsYW5rQmxvY2suc29sdXRpb24uXG4gIC8vIE9wdGlvbmFsOyBvbmx5IG1lYW5pbmdmdWwgb24gYSBnYXAtYmVhcmluZyBlcXVhdGlvbi4gTmV2ZXIgbGVha3MgdGhlIGdhcFxuICAvLyBhbnN3ZXIgZGlyZWN0bHkgKHRoZSBzYW5jdGlvbmVkIHJldmVhbCwgcGVyIHRoZSBydW50aW1lJ3Mgbm8tbGVhayBzdGFuY2UpLlxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICAvLyBWYXJpYWJsZSBibG9jayBzaXppbmc6IG9wdGlvbmFsIHdpZHRoIGZyYWN0aW9uICsgYWxpZ25tZW50IChzaXppbmcudHMpLlxuICAuLi5zaXppbmdGaWVsZHMsXG4gIC8vIFBlci1ibG9jayBkaXNwbGF5IGxhYmVsIFx1MjAxNCBhIGdhcC1iZWFyaW5nIGVxdWF0aW9uIGlzIGEgbnVtYmVyZWQgcHJvYmxlbSBieVxuICAvLyBkZWZhdWx0OyBjdXN0b20vbm9uZSBvcHQgb3V0IChudW1iZXJpbmcvbGFiZWwgZGVjb3VwbGUpLiBJbmVydCBvbiBhXG4gIC8vIHByb21wdC1mcmVlIGRpc3BsYXkgZXF1YXRpb24gKGl0J3MgbmV2ZXIgbnVtYmVyZWQgcmVnYXJkbGVzcykuIFNlZSBsYWJlbC50cy5cbiAgLi4ubGFiZWxGaWVsZHMsXG59KTtcbmV4cG9ydCB0eXBlIE1hdGhCbG9jayA9IHouaW5mZXI8dHlwZW9mIE1hdGhCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gRm91ciB2YXJpYW50cyBpcyBhIGRlbGliZXJhdGUgY29uc3RyYWludC4gTW9yZSB0aGFuIHRoaXMgYW5kIHN0eWxpbmdcbi8vIGJlY29tZXMgaW5jb25zaXN0ZW50IGFjcm9zcyB3b3Jrc2hlZXRzLiBBZGRpbmcgYSBuZXcgdmFyaWFudCBsYXRlciBpcyBhXG4vLyBicmVha2luZyBzY2hlbWEgY2hhbmdlIFx1MjAxNCBjb25zaWRlciB0aGF0IGJlZm9yZSBleHRlbmRpbmcuXG5leHBvcnQgY29uc3QgQ2FsbG91dFZhcmlhbnQgPSB6LmVudW0oWydpbmZvJywgJ3dhcm5pbmcnLCAnc3VjY2VzcycsICdub3RlJ10pO1xuZXhwb3J0IHR5cGUgQ2FsbG91dFZhcmlhbnQgPSB6LmluZmVyPHR5cGVvZiBDYWxsb3V0VmFyaWFudD47XG5cbmV4cG9ydCBjb25zdCBDYWxsb3V0QmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdjYWxsb3V0JyksXG4gIHZhcmlhbnQ6IENhbGxvdXRWYXJpYW50LFxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxufSk7XG5leHBvcnQgdHlwZSBDYWxsb3V0QmxvY2sgPSB6LmluZmVyPHR5cGVvZiBDYWxsb3V0QmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vIEF1dG8tbnVtYmVyZWQgYXQgcmVuZGVyIHRpbWUgYnkgd2Fsa2luZyB0aGUgZG9jdW1lbnQgYW5kIGNvdW50aW5nIHByb2JsZW1cbi8vIGJsb2NrcyBpbiBvcmRlci4gVGhlIG9wdGlvbmFsIGBudW1iZXJgIGZpZWxkIG92ZXJyaWRlcyB0aGUgYXV0by1udW1iZXJcbi8vIChyYXJlIGNhc2VzIGxpa2UgXCJQcm9ibGVtIDVhXCIgb3IgaGFuZC1udW1iZXJlZCBsZWdhY3kgd29ya3NoZWV0cykuXG4vL1xuLy8gc29sdXRpb246IG9wdGlvbmFsIHdvcmtlZCBleHBsYW5hdGlvbiBzaG93biB0byBhbGwgc3R1ZGVudHMgYWZ0ZXIgdGhlXG4vLyBzZWN0aW9uIGlzIGNoZWNrZWQgKG9yIGFmdGVyIGZpbmFsIHN1Ym1pdCBpbiBzaW5nbGUtbW9kZSBhY3Rpdml0aWVzKSxcbi8vIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGV5IGFuc3dlcmVkIGNvcnJlY3RseS4gRGlmZmVyZW50IGZyb20gaGludCBcdTIwMTRcbi8vIGhpbnRzIG51ZGdlIGR1cmluZyB0aGUgYXR0ZW1wdDsgc29sdXRpb25zIGV4cGxhaW4gYWZ0ZXIuIFRoZSBydW50aW1lXG4vLyByZWFkcyB0aGlzIG9uIGluaXQgYnV0IGRvZXMgTk9UIGluamVjdCBpdCBpbnRvIHRoZSBET00gdW50aWwgYWZ0ZXJcbi8vIGNoZWNrIChQaGFzZSAxIHNlY3VyaXR5IGNlaWxpbmcgXHUyMDE0IGRvbid0IG1ha2UgdGhlIGxlYWsgd29yc2UpLlxuLy9cbi8vIHNraWxsczogb3B0aW9uYWwgYXJyYXkgb2YgdW5pdmVyc2FsIHNraWxsIHRhZ3MgdGhpcyBwcm9ibGVtIHRhcmdldHMuXG4vLyBBY3Rpdml0eS1sZXZlbCBza2lsbHMgbGl2ZSBvbiBBY3Rpdml0eU1ldGE7IHRoaXMgZmllbGQgY2FwdHVyZXNcbi8vIHByb2JsZW0tbGV2ZWwgZ3JhbnVsYXJpdHkgZm9yIGZ1dHVyZSBwZXItc2tpbGwgYW5hbHl0aWNzLiBFZGl0b3IgVUkgaXNcbi8vIFBoYXNlIDI7IHRoZSBmaWVsZCBleGlzdHMgaW4gUGhhc2UgMSBzbyBhbmFseXRpY3MgY2FuIHJlYWNoIGJhY2suXG5leHBvcnQgY29uc3QgUHJvYmxlbUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogei5saXRlcmFsKCdwcm9ibGVtJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBQcm9ibGVtQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBQcm9ibGVtQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgRmlsbEluQmxhbmtJbmxpbmUsIElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5cbi8vIFRoZSBhcmNoaXRlY3R1cmFsbHkgaW50ZXJlc3RpbmcgYmxvY2suIGNvbnRlbnQgaXMgYW4gYXJyYXkgb2YgaW5saW5lIG5vZGVzXG4vLyB0aGF0IG1heSBpbmNsdWRlIEJsYW5rVG9rZW4gXHUyMDE0IHN0dWRlbnRzIHNlZSBwcm9zZSB3aXRoIGVkaXRhYmxlIGJsYW5rcy5cbi8vIEVhY2ggYmxhbmsncyBpZCBpcyBhIHN0YWJsZSByZWZlcmVuY2UgdXNlZCBpbiBzdWJtaXNzaW9ucy5yZXNwb25zZXMsIHNvXG4vLyByZW9yZGVyaW5nIGJsb2NrcyBkb2Vzbid0IGJyZWFrIGdyYWRpbmcgb24gcGFzdCBzdWJtaXNzaW9ucy5cbi8vXG4vLyBhdXRvLW51bWJlcmVkIGxpa2UgUHJvYmxlbUJsb2NrIGZvciB0aGUgcHJvYmxlbSBoZWFkZXIgKGUuZy4sIFwiUHJvYmxlbSAzXCIpLlxuLy8gV2h5IG5vdCBqdXN0IHVzZSBQcm9ibGVtQmxvY2s/IFRoZXkgaGF2ZSBkaWZmZXJlbnQgcmVuZGVyaW5nIGFuZCBkaWZmZXJlbnRcbi8vIHN0dWRlbnQgaW50ZXJhY3Rpb247IGNvbmZsYXRpbmcgdGhlbSB3b3VsZCBmb3JjZSBldmVyeSBwcm9ibGVtIHRvIGVpdGhlclxuLy8gaGF2ZSBvciBub3QgaGF2ZSBibGFua3MsIGluc3RlYWQgb2YgYmVpbmcgYSBwZXItcHJvYmxlbSBkZWNpc2lvbi5cbi8vXG4vLyBQZXItYmxhbmsgZmllbGRzIChoaW50LCBtaXN0YWtlRmVlZGJhY2spIGxpdmUgb24gQmxhbmtUb2tlbiBpbiBpbmxpbmUudHMuXG4vLyBQZXItYmxvY2sgZmllbGRzIGJlbG93OlxuLy8gICAtIHNvbHV0aW9uOiBvbmUgd29ya2VkIGV4cGxhbmF0aW9uIGZvciB0aGUgd2hvbGUgcHJvYmxlbSAoYSBcInNpbXBsaWZ5XG4vLyAgICAgX194XHUwMEIyICsgX194IC0gMTJcIiBwcm9tcHQgaGFzIG9uZSBzb2x1dGlvbiBjb3ZlcmluZyBhbGwgYmxhbmtzLCBub3Qgb25lXG4vLyAgICAgcGVyIGJsYW5rKS4gU2hvd24gcG9zdC1jaGVjayByZWdhcmRsZXNzIG9mIGNvcnJlY3RuZXNzLlxuLy8gICAtIGhhc0NvbmZpZGVuY2VSYXRpbmc6IHdoZW4gdHJ1ZSwgc3R1ZGVudHMgc2VlIGEgMy1wb2ludCBjb25maWRlbmNlXG4vLyAgICAgc2VsZWN0b3IgKHVuc3VyZSAvIHRoaW5rX3NvIC8gY2VydGFpbikgZm9yIHRoaXMgcHJvYmxlbSBiZWZvcmVcbi8vICAgICBjaGVja2luZy4gQXNrZWQgb25jZSBwZXIgcHJvYmxlbSwgbm90IHBlciBibGFuay4gVGhlIHJ1bnRpbWUgc3RvcmVzXG4vLyAgICAgdGhlIHJhdGluZyBwZXItYmxhbmsgaW4gU3VibWlzc2lvblJlc3BvbnNlcyAoYXBwbGllZCB1bmlmb3JtbHkgdG9cbi8vICAgICBldmVyeSBibGFuayBpbiB0aGlzIHByb2JsZW0pLlxuLy8gICAtIHNraWxsczogdW5pdmVyc2FsIHNraWxsIHRhZ3MgKHNlZSBBY3Rpdml0eU1ldGEuc2tpbGxzKS4gRWRpdG9yIFVJIGZvclxuLy8gICAgIHRoaXMgZmllbGQgaXMgUGhhc2UgMjsgZmllbGQgZXhpc3RzIGluIFBoYXNlIDEgc28gcGVyLXNraWxsIGFuYWx5dGljc1xuLy8gICAgIGNhbiByZWFjaCBiYWNrIHRvIFBoYXNlIDEgcHJvYmxlbXMgd2hlbiB0aGUgZWRpdG9yIGxhbmRzLlxuLy8gICAtIHdvcmtTcGFjZTogcGVyLXByb2JsZW0gb3ZlcnJpZGUgKGluIHJlbSkgZm9yIHRoZSBibGFuayB3b3JraW5nIHNwYWNlXG4vLyAgICAgcHJpbnRlZCBiZWxvdyB0aGlzIHByb2JsZW0uIE9wdGlvbmFsIHdpdGggTk8gZGVmYXVsdCBvbiBwdXJwb3NlOiBhblxuLy8gICAgIGFic2VudCB2YWx1ZSBtZWFucyBcImluaGVyaXQgdGhlIGFjdGl2aXR5LWxldmVsIHByaW50LndvcmtTcGFjZVwiLCB3aGljaFxuLy8gICAgIGlzIGV4YWN0bHkgdGhlIENTUy1jdXN0b20tcHJvcGVydHkgaW5oZXJpdGFuY2UgdGhlIHJlbmRlcmVyIHJlbGllcyBvblxuLy8gICAgICh0aGUgYmxvY2sgc2V0cyBpdHMgb3duIC0tcHJpbnQtd29yay1zcGFjZSBvbmx5IHdoZW4gdGhpcyBpcyBwcmVzZW50KS5cbi8vICAgICBBIGRlZmF1bHQgaGVyZSB3b3VsZCBwaW4gZXZlcnkgYmxvY2sgdG8gYSBjb25jcmV0ZSB2YWx1ZSBhbmQgZGVmZWF0XG4vLyAgICAgdGhhdCBpbmhlcml0YW5jZS4gUHJpbnQtb25seTsgaWdub3JlZCBvbiBzY3JlZW4uXG5leHBvcnQgY29uc3QgRmlsbEluQmxhbmtCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB6LmxpdGVyYWwoJ2ZpbGxfaW5fYmxhbmsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogei5hcnJheShGaWxsSW5CbGFua0lubGluZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NvbmZpZGVuY2VSYXRpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtTcGFjZTogei5udW1iZXIoKS5taW4oMCkub3B0aW9uYWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGVyLWJsb2NrIGRpc3BsYXkgbGFiZWwgKGF1dG8vY3VzdG9tL25vbmUpLiBBYnNlbnQgPSBhdXRvID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdG9kYXkncyBudW1iZXJlZCBiZWhhdmlvci4gU2VlIGxhYmVsLnRzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5sYWJlbEZpZWxkcyxcbn0pO1xuZXhwb3J0IHR5cGUgRmlsbEluQmxhbmtCbG9jayA9IHouaW5mZXI8dHlwZW9mIEZpbGxJbkJsYW5rQmxvY2s+O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBsaXN0LnRzIFx1MjAxNCBCdWxsZXQgYW5kIG9yZGVyZWQgbGlzdCBibG9ja3Ncbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBMaXN0cyBuZXN0LiBBIExpc3RJdGVtIGhvbGRzIGlubGluZSBjb250ZW50IHBsdXMgYW4gb3B0aW9uYWwgYGNoaWxkcmVuYFxuLy8gYXJyYXkgb2YgbmVzdGVkIGxpc3QgYmxvY2tzOyBidWxsZXQgYW5kIG9yZGVyZWQgbGlzdHMgY2FuIG1peCBmcmVlbHkgYXRcbi8vIGFueSBkZXB0aC4gVGhpcyBtaXJyb3JzIFRpcHRhcCdzIGxpc3RJdGVtID4gcGFyYWdyYXBoICsgKGJ1bGxldExpc3QgfFxuLy8gb3JkZXJlZExpc3QpIHNoYXBlIGVuZC10by1lbmQsIHNvIFRhYi10by1pbmRlbnQgaW4gdGhlIGVkaXRvciBwcmVzZXJ2ZXNcbi8vIGhpZXJhcmNoeSB0aHJvdWdoIGF1dG9zYXZlLlxuLy9cbi8vIFJlY3Vyc2lvbiBtZWNoYW5pYzogb25seSB0aGUgY3ljbGljIGVkZ2UgKExpc3RJdGVtLmNoaWxkcmVuIFx1MjE5MiBsaXN0IGJsb2NrIFx1MjE5MlxuLy8gTGlzdEl0ZW0pIG5lZWRzIHoubGF6eSgpLiBCdWxsZXRMaXN0QmxvY2sgYW5kIE9yZGVyZWRMaXN0QmxvY2sgYXJlIHBsYWluXG4vLyB6Lm9iamVjdHMsIHdoaWNoIGtlZXBzIHRoZW0gdXNhYmxlIGFzIG1lbWJlcnMgb2Ygei5kaXNjcmltaW5hdGVkVW5pb24gaW5cbi8vIGJsb2Nrcy9pbmRleC50cy4gRGlzY3JpbWluYXRlZCB1bmlvbnMgbmVlZCBab2RPYmplY3RzIHRvIGludHJvc3BlY3QgdGhlXG4vLyBgdHlwZWAgZGlzY3JpbWluYXRvcjsgYSB0b3AtbGV2ZWwgei5sYXp5KCkgd3JhcHBlciB3b3VsZCBkZWZlYXQgdGhhdC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vIC0tLS0gVHlwZVNjcmlwdCBpbnRlcmZhY2VzIChmb3J3YXJkIGRlY2xhcmF0aW9ucyBmb3IgdGhlIHJlY3Vyc2l2ZSB0eXBlcykgLS0tXG5cbmV4cG9ydCBpbnRlcmZhY2UgTGlzdEl0ZW0ge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY29udGVudDogei5pbmZlcjx0eXBlb2YgSW5saW5lTm9kZT5bXTtcbiAgICBjaGlsZHJlbj86IEFycmF5PEJ1bGxldExpc3RCbG9jayB8IE9yZGVyZWRMaXN0QmxvY2s+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1bGxldExpc3RCbG9jayB7XG4gICAgaWQ6IHN0cmluZztcbiAgICB0eXBlOiAnYnVsbGV0X2xpc3QnO1xuICAgIGl0ZW1zOiBMaXN0SXRlbVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE9yZGVyZWRMaXN0QmxvY2sge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgdHlwZTogJ29yZGVyZWRfbGlzdCc7XG4gICAgaXRlbXM6IExpc3RJdGVtW107XG59XG5cbi8vIC0tLS0gWm9kIHNjaGVtYXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIExhenkgYmVjYXVzZSBMaXN0SXRlbS5jaGlsZHJlbiByZWZlcnMgdG8gdGhlIGxpc3QgYmxvY2tzLCB3aGljaCByZWZlciBiYWNrXG4vLyB0byBMaXN0SXRlbS4gVGhlIGFycm93IGJvZHkgb25seSBydW5zIGF0IHBhcnNlIHRpbWUsIGJ5IHdoaWNoIHBvaW50IGFsbFxuLy8gdGhyZWUgZXhwb3J0cyBhcmUgYm91bmQuXG5leHBvcnQgY29uc3QgTGlzdEl0ZW06IHouWm9kVHlwZTxMaXN0SXRlbSwgei5ab2RUeXBlRGVmLCB1bmtub3duPiA9IHoubGF6eSgoKSA9Plxuei5vYmplY3Qoe1xuICAgIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgICAgICAgIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gICAgICAgICBjaGlsZHJlbjogelxuICAgICAgICAgLmFycmF5KHoudW5pb24oW0J1bGxldExpc3RCbG9jaywgT3JkZXJlZExpc3RCbG9ja10pKVxuICAgICAgICAgLm9wdGlvbmFsKCksXG59KSxcbik7XG5cbmV4cG9ydCBjb25zdCBCdWxsZXRMaXN0QmxvY2sgPSB6Lm9iamVjdCh7XG4gICAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHoubGl0ZXJhbCgnYnVsbGV0X2xpc3QnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogei5hcnJheShMaXN0SXRlbSksXG59KTtcblxuZXhwb3J0IGNvbnN0IE9yZGVyZWRMaXN0QmxvY2sgPSB6Lm9iamVjdCh7XG4gICAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB6LmxpdGVyYWwoJ29yZGVyZWRfbGlzdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogei5hcnJheShMaXN0SXRlbSksXG59KTtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5pbXBvcnQgeyBzaXppbmdGaWVsZHMgfSBmcm9tICcuLi9zaXppbmcuanMnO1xuaW1wb3J0IHtcbiAgQXhpc0NvbmZpZyxcbiAgQ3VydmVEb21haW4sXG4gIERyYXdhYmxlLFxuICBFbmRwb2ludFN0eWxlLFxuICBGdW5jdGlvbk1vZGVsLFxufSBmcm9tICcuLi9ncmFwaC1wcmltaXRpdmVzLmpzJztcblxuLy8gVGhlIGNvb3JkaW5hdGUtcGxhbmUgcHJpbWl0aXZlcyAoQXhpc0NvbmZpZywgRW5kcG9pbnRTdHlsZSwgQ3VydmVEb21haW4sIHRoZVxuLy8gRnVuY3Rpb25Nb2RlbCBmYW1pbHksIERyYXdhYmxlQ29sb3IsIERyYXdhYmxlKSBNT1ZFRCB0byAuLi9ncmFwaC1wcmltaXRpdmVzLnRzXG4vLyBcdTIwMTQgYSBsZWFmIG1vZHVsZSB0aGF0IGltcG9ydHMgbm90aGluZyBidXQgem9kLiBUaGV5IGFyZSByZS1leHBvcnRlZCBoZXJlLCB3aXRoXG4vLyBpZGVudGljYWwgaWRlbnRpdGllcywgc28gZXZlcnkgZXhpc3RpbmcgaW1wb3J0IHBhdGgga2VlcHMgd29ya2luZy5cbi8vXG4vLyBXaHkgdGhleSBtb3ZlZDogdGhpcyBmaWxlIGltcG9ydHMgSW5saW5lTm9kZSwgc28gcmVhY2hpbmcgdGhlIHByaW1pdGl2ZXNcbi8vIHRocm91Z2ggaXQgZHJhZ3MgaW4gaW5saW5lLnRzLiBpbmxpbmUudHMgbm93IG5lZWRzIGdyYXBoX2ZpZ3VyZSAoYSBkZWZpbml0aW9uXG4vLyBtYXkgY29udGFpbiBvbmUpLCB3aGljaCB3b3VsZCBjbG9zZSB0aGUgY3ljbGUgaW5saW5lIC0+IGdyYXBoLWZpZ3VyZSAtPlxuLy8gaW50ZXJhY3RpdmUtZ3JhcGggLT4gaW5saW5lLiBUaGF0IGN5Y2xlIGlzIGZhdGFsLCBub3QgY29zbWV0aWM6IHRoZVxuLy8gYHouYXJyYXkoSW5saW5lTm9kZSlgIGNhbGxzIGJlbG93IHJ1biBhdCBtb2R1bGUgc2NvcGUgYW5kIHdvdWxkIGhpdCBhIFREWlxuLy8gUmVmZXJlbmNlRXJyb3Igb24gYSBwYXJ0aWFsbHktaW5pdGlhbGl6ZWQgaW5saW5lLmpzLiBTZWUgZ3JhcGgtcHJpbWl0aXZlcy50cy5cbmV4cG9ydCB7XG4gIEF4aXNDb25maWcsXG4gIEVuZHBvaW50U3R5bGUsXG4gIEN1cnZlRG9tYWluLFxuICBMaW5lYXJNb2RlbCxcbiAgUXVhZHJhdGljTW9kZWwsXG4gIEV4cG9uZW50aWFsTW9kZWwsXG4gIExvZ2FyaXRobWljTW9kZWwsXG4gIFZlcnRpY2FsTW9kZWwsXG4gIEZ1bmN0aW9uTW9kZWwsXG4gIERyYXdhYmxlQ29sb3IsXG4gIERyYXdhYmxlLFxufSBmcm9tICcuLi9ncmFwaC1wcmltaXRpdmVzLmpzJztcbmV4cG9ydCB0eXBlIHsgRHJhd2FibGVDb2xvclQgfSBmcm9tICcuLi9ncmFwaC1wcmltaXRpdmVzLmpzJztcblxuLy8gVGhlIGludGVyYWN0aXZlIGdyYXBoIGJsb2NrIChQaGFzZSAyLjcsIFN0YWdlIDUpLiBVbmxpa2UgZXZlcnkgb3RoZXIgYmxvY2ssXG4vLyB0aGUgc3R1ZGVudCdzIGFuc3dlciBpcyBHRU9NRVRSSUMgXHUyMDE0IGEgcG9pbnQgdGhleSBwbG90IG9uIGEgY29vcmRpbmF0ZSBwbGFuZSBcdTIwMTRcbi8vIG5vdCB0ZXh0LiBUaHJlZSBzdHJ1Y3R1cmFsIGNvbnNlcXVlbmNlcyAoc2VlIGRvY3MvZGVzaWduL2ludGVyYWN0aXZlLWdyYXBoLVxuLy8gYmxvY2subWQpOiB0aGUgYW5zd2VyIGlzIGEgc3RydWN0dXJlZCB2YWx1ZSAoaXRzIG93biBzdWJtaXNzaW9uIG1hcCwgbm90IHRoZVxuLy8gYmxhbmtzIG1hcCksIHNjb3JpbmcgaXMgdG9sZXJhbmNlLWJhc2VkIGdlb21ldHJpYyBjb21wYXJpc29uICh0aGUgZ3JhcGgta2l0XG4vLyBzY29yZXMgaXQsIG5vdCB0aGUgcnVudGltZSdzIHN0cmluZyBzdHJhdGVnaWVzKSwgYW5kIHRoZSB3aWRnZXQgaXMgbGFyZ2Vcbi8vIChKU1hHcmFwaCByaWRlcyB0aGUgbGF6eS1sb2FkZWQgQGFjdGl2aXR5L2dyYXBoLWtpdCwgbmV2ZXIgdGhlIGJhc2UgcnVudGltZSkuXG4vL1xuLy8gU2xpY2UgMSAoMi43YSkgc2hpcHMgT05FIGludGVyYWN0aW9uIFx1MjAxNCBwbG90X3BvaW50LiBUaGUgaW50ZXJhY3Rpb24gaXMgYVxuLy8gZGlzY3JpbWluYXRlZCB1bmlvbiBmcm9tIGRheSBvbmUgc28gcGxvdF9saW5lICgyLjdiKSBhbmQgc2hhZGVfcmVnaW9uICgyLjdjKVxuLy8gYXJlIGVhY2ggYSBuZXcgdmFyaWFudCArIGEgbmV3IHNjb3Jpbmcgc3RyYXRlZ3kgd2l0aCBOTyBzY2hlbWEgbWlncmF0aW9uIGFuZFxuLy8gbm8gY2hhbmdlIHRvIGFueSBvdGhlciBibG9jayB0eXBlIFx1MjAxNCBleGFjdGx5IGhvdyB0aGUgdG9wLWxldmVsIEJsb2NrIHVuaW9uXG4vLyBncm93cy5cblxuLy8gLS0tLSBJbnRlcmFjdGlvbiB2YXJpYW50cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVhY2ggdmFyaWFudCBjYXJyaWVzIGl0cyBPV04gYW5zd2VyIGtleSArIHRvbGVyYW5jZS4gcGxvdF9wb2ludCBpcyB0aGUgb25seVxuLy8gdmFyaWFudCBpbiBzbGljZSAxOyB0aGUgdW5pb24gc2hhcGUgaXMgaGVyZSBzbyB0aGUgbmV4dCB2YXJpYW50cyBzbG90IGluLlxuZXhwb3J0IGNvbnN0IFBvaW50SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9wb2ludCcpLFxuICAvLyBPbmUgb3IgbW9yZSBjb3JyZWN0IHBvaW50czsgdGhlIHN0dWRlbnQgbXVzdCBwbG90IGFsbCBvZiB0aGVtLiBBIHNpbmdsZVxuICAvLyBwb2ludCBpcyB0aGUgY29tbW9uIGNhc2U7IG11bHRpcGxlIHN1cHBvcnRzIGUuZy4gXCJwbG90IHRoZSB0d28gcm9vdHMuXCJcbiAgY29ycmVjdFBvaW50czogei5hcnJheSh6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSkpLm1pbigxKSxcbiAgLy8gUGVyLXBvaW50IHRvbGVyYW5jZSBpbiBncmFwaCB1bml0cyAoYSBFdWNsaWRlYW4vZWFjaC1heGlzIHJhZGl1cywgYXBwbGllZFxuICAvLyBieSB0aGUga2l0J3Mgc2NvcmVyKS4gMC4xIGRlZmF1bHQgc3VpdHMgYSBzbmFwLXRvLWdyaWQgc2luZ2xlIHBvaW50LlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMSksXG59KTtcbmV4cG9ydCB0eXBlIFBvaW50SW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBQb2ludEludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBwbG90X2Z1bmN0aW9uOiBwbG90IGEgY3VydmUgb2YgYSBnaXZlbiBmYW1pbHkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc3R1ZGVudCBwbGFjZXMgTiBwb2ludHMgYW5kIHRoZSB3aWRnZXQgZml0cyArIGRyYXdzIGEgY3VydmUgVEhST1VHSCB0aGVtXG4vLyAoTiA9IHRoZSBmYW1pbHkncyBwYXJhbWV0ZXIgY291bnQ6IGxpbmVhciAyLCBxdWFkcmF0aWMgMywgZXhwb25lbnRpYWwgMixcbi8vIGxvZ2FyaXRobWljIDIpLiBTY29yZWQgb24gdGhlIGZpdHRlZCBjdXJ2ZSdzIFBBUkFNRVRFUlMgKG5vdCB0aGUgZXhhY3QgcG9pbnRcbi8vIHBvc2l0aW9ucyksIHNvIGFueSBwb2ludHMgb24gdGhlIGNvcnJlY3QgY3VydmUgYXJlIGFjY2VwdGVkLiBUaGUgcGFyYW1ldGVyc1xuLy8gY29tZSBmcm9tIHRoZSBTQU1FIHJlZ3Jlc3Npb24gZml0IGVuZ2luZSB0aGUgY2FsY3VsYXRvciB1c2VzIChmaXRMaW5lYXIsIFx1MjAyNikuXG4vL1xuLy8gYG1vZGVsYCBpcyBhIGRpc2NyaW1pbmF0ZWQgdW5pb24gb24gYGZhbWlseWAgKEZ1bmN0aW9uTW9kZWwsIG5vdyBpblxuLy8gLi4vZ3JhcGgtcHJpbWl0aXZlcy50cyBhbmQgcmUtZXhwb3J0ZWQgYWJvdmUpOiBsaW5lYXIsIHF1YWRyYXRpYywgZXhwb25lbnRpYWwsXG4vLyBsb2dhcml0aG1pYywgdmVydGljYWwuIEdyb3dpbmcgYSBmYW1pbHkgaXMgYSBuZXcgbWVtYmVyIHRoZXJlICsgYSBuZXcgZml0XG4vLyBicmFuY2ggaW4gdGhlIGtpdCdzIHNjb3JlciBcdTIwMTQgYWRkaXRpdmUsIG5vdCBhIHJld3JpdGUuXG5cbi8vIHBsb3RfZnVuY3Rpb24gY2FycmllcyBhbiBBUlJBWSBvZiBjdXJ2ZXMgKHNoaXBzIGFzIG9uZSkuIE9uZSBjdXJ2ZSBpcyB0aGVcbi8vIGNvbW1vbiBjYXNlOyBtdWx0aXBsZSBpcyBhIHN5c3RlbSBvZiBlcXVhdGlvbnMgKFwiZ3JhcGggYm90aCBsaW5lc1wiKSwgc2NvcmVkXG4vLyBhcyBvbmUgb2JqZWN0IGVhY2ggXHUyMDE0IHNvIHN5c3RlbXMgYXJlIGFkZGl0aXZlLCBub3QgYSByZXNoYXBlIChEcm9wIDIgZGVjaXNpb24pLlxuZXhwb3J0IGNvbnN0IEZ1bmN0aW9uSW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9mdW5jdGlvbicpLFxuICBtb2RlbHM6IHouYXJyYXkoRnVuY3Rpb25Nb2RlbCkubWluKDEpLFxuICAvLyBEcm9wIDY6IG9wdGlvbmFsIHBlci1jdXJ2ZSBkb21haW4gcmVzdHJpY3Rpb25zIChcImdyYXBoIHkgPSAyeCArIDMgZm9yXG4gIC8vIHggPj0gMFwiKSwgcGFyYWxsZWwgdG8gbW9kZWxzIGJ5IGluZGV4LiBUaGUgZnJlZWZvcm0gcGFyc2VyIGZpbGxzIHRoZXNlIGZyb21cbiAgLy8gYSBgZm9yIFx1MjAyNmAgY2xhdXNlOyB0aGUgd2lkZ2V0J3MgZW5kcG9pbnQtZHJhZyBVWCBpcyB0aGUgcGxhbm5lZCBmb2xsb3ctdXAgXHUyMDE0XG4gIC8vIHVudGlsIGl0IGxhbmRzLCB0aGUgZG9tYWluIGlzIGF1dGhvcmluZyBtZXRhZGF0YSBkcmF3biBvbiB0aGUga2V5LCBhbmRcbiAgLy8gc2NvcmluZyByZW1haW5zIG9uIHRoZSBjdXJ2ZSBwYXJhbWV0ZXJzLlxuICBkb21haW5zOiB6LmFycmF5KEN1cnZlRG9tYWluLm51bGxhYmxlKCkpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIEZ1bmN0aW9uSW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBGdW5jdGlvbkludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBzaGFkZV9yZWdpb246IHNoYWRlIGEgcG9seWdvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHN0dWRlbnQgZHJhZ3MgdGhlIHZlcnRpY2VzIG9mIGEgcG9seWdvbiAob25lIGhhbmRsZSBwZXIgdmVydGV4KSB0byBjb3ZlciBhXG4vLyB0YXJnZXQgcmVnaW9uLCB3aGljaCBpcyBzaGFkZWQgYXMgdGhleSBtb3ZlLiBTY29yZWQgYnkgQVJFQSBPVkVSTEFQIHdpdGggdGhlXG4vLyBjb3JyZWN0IHBvbHlnb24gKGludGVyc2VjdGlvbi1vdmVyLXVuaW9uIFx1MjI2NSBtaW5PdmVybGFwKSwgc28gdGhlIGV4YWN0IHZlcnRleFxuLy8gcG9zaXRpb25zIGRvbid0IG1hdHRlciBcdTIwMTQgb25seSB0aGF0IHRoZSBzaGFkZWQgcmVnaW9uIG1hdGNoZXMuIEEgcG9seWdvbiwgbm90IGFcbi8vIGN1cnZlLCBzbyBpdCdzIGl0cyBvd24gaW50ZXJhY3Rpb24gKG5vdCBhIHBsb3RfZnVuY3Rpb24gZmFtaWx5KS5cbi8vIE9uZSB0YXJnZXQgcG9seWdvbjogdmVydGljZXMgaW4gb3JkZXIgKG1pbiAzKSArIHRoZSBtaW5pbXVtIGludGVyc2VjdGlvbi1vdmVyLVxuLy8gdW5pb24gd2l0aCB0aGUgc3R1ZGVudCdzIHBvbHlnb24gdG8gY291bnQgYXMgY29ycmVjdC5cbmV4cG9ydCBjb25zdCBSZWdpb25BbnN3ZXIgPSB6Lm9iamVjdCh7XG4gIGNvcnJlY3RWZXJ0aWNlczogei5hcnJheSh6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSkpLm1pbigzKSxcbiAgLy8gMC45IGlzIHN0cmljdCAobmVhci1leGFjdCBvbiBhIHNuYXBwZWQgZ3JpZCk7IGxvd2VyIGl0IGZvciBoYW5kLWRyYWdnZWQgL1xuICAvLyBhcHByb3hpbWF0ZSByZWdpb25zLlxuICBtaW5PdmVybGFwOiB6Lm51bWJlcigpLm1pbigwKS5tYXgoMSkuZGVmYXVsdCgwLjkpLFxufSk7XG5leHBvcnQgdHlwZSBSZWdpb25BbnN3ZXIgPSB6LmluZmVyPHR5cGVvZiBSZWdpb25BbnN3ZXI+O1xuXG4vLyBzaGFkZV9yZWdpb24gY2FycmllcyBhbiBBUlJBWSBvZiB0YXJnZXQgcG9seWdvbnMgKHNoaXBzIGFzIG9uZSksIGVhY2ggc2NvcmVkXG4vLyBhcyBvbmUgb2JqZWN0IFx1MjAxNCBzbyBcInNoYWRlIGJvdGggcmVnaW9uc1wiIGlzIGFkZGl0aXZlLCBtYXRjaGluZyBwbG90X2Z1bmN0aW9uLlxuZXhwb3J0IGNvbnN0IFJlZ2lvbkludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3NoYWRlX3JlZ2lvbicpLFxuICByZWdpb25zOiB6LmFycmF5KFJlZ2lvbkFuc3dlcikubWluKDEpLFxufSk7XG5leHBvcnQgdHlwZSBSZWdpb25JbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIFJlZ2lvbkludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBncmFwaF9pbmVxdWFsaXR5OiBncmFwaCBhbiBpbmVxdWFsaXR5IChEcm9wIDQpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHN0dWRlbnQgcGxhY2VzIHRoZSBib3VuZGFyeSAoc2FtZSBoYW5kbGVzIGFzIHBsb3RfZnVuY3Rpb24pLCB0b2dnbGVzIHRoZVxuLy8gbGluZSBkb3R0ZWQgKHN0cmljdCkgb3Igc29saWQgKGluY2x1c2l2ZSksIGFuZCBjbGlja3MgYSBzaWRlIHRvIHNoYWRlLiBBbGxcbi8vIHRocmVlIGFyZSBncmFkZWQgXHUyMDE0IGNob29zaW5nIHRoZW0gSVMgdGhlIHNraWxsLiBUaGUgYm91bmRhcnkgaXMgYSBGdW5jdGlvbk1vZGVsLFxuLy8gc28gcXVhZHJhdGljIGluZXF1YWxpdGllcyAoeSA+IHhcdTAwQjIpIHdvcmsgdGhlIGRheSB0aGUgZmFtaWx5IGRvZXM7IGEgdmVydGljYWxcbi8vIGJvdW5kYXJ5ICh4ID4gMykgc2hhZGVzIGxlZnQvcmlnaHQgaW5zdGVhZCBvZiBhYm92ZS9iZWxvdy5cbmV4cG9ydCBjb25zdCBTaGFkZVNpZGVWYWx1ZSA9IHouZW51bShbJ2Fib3ZlJywgJ2JlbG93JywgJ2xlZnQnLCAncmlnaHQnXSk7XG5leHBvcnQgdHlwZSBTaGFkZVNpZGVWYWx1ZSA9IHouaW5mZXI8dHlwZW9mIFNoYWRlU2lkZVZhbHVlPjtcblxuZXhwb3J0IGNvbnN0IEluZXF1YWxpdHlBbnN3ZXIgPSB6Lm9iamVjdCh7XG4gIGJvdW5kYXJ5OiBGdW5jdGlvbk1vZGVsLFxuICAvLyB0cnVlID0gc3RyaWN0ICg8IC8gPiwgZG90dGVkIGJvdW5kYXJ5KTsgZmFsc2UgPSBpbmNsdXNpdmUgKFx1MjI2NCAvIFx1MjI2NSwgc29saWQpLlxuICBzdHJpY3Q6IHouYm9vbGVhbigpLFxuICBzaGFkZVNpZGU6IFNoYWRlU2lkZVZhbHVlLFxufSk7XG5leHBvcnQgdHlwZSBJbmVxdWFsaXR5QW5zd2VyID0gei5pbmZlcjx0eXBlb2YgSW5lcXVhbGl0eUFuc3dlcj47XG5cbi8vIEFuIEFSUkFZIG9mIGluZXF1YWxpdGllcyAoc2hpcHMgYXMgb25lKTsgc3lzdGVtcyAoXCJzaGFkZSB3aGVyZSBCT1RIIGhvbGRcIilcbi8vIGJlY29tZSBhZGRpdGl2ZSBtZW1iZXJzLCBtYXRjaGluZyBwbG90X2Z1bmN0aW9uL3NoYWRlX3JlZ2lvbi5cbmV4cG9ydCBjb25zdCBJbmVxdWFsaXR5SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnZ3JhcGhfaW5lcXVhbGl0eScpLFxuICBpbmVxdWFsaXRpZXM6IHouYXJyYXkoSW5lcXVhbGl0eUFuc3dlcikubWluKDEpLFxufSk7XG5leHBvcnQgdHlwZSBJbmVxdWFsaXR5SW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBJbmVxdWFsaXR5SW50ZXJhY3Rpb24+O1xuXG4vLyAtLS0tIGRpc3BsYXk6IGEgc3RhdGljICh1bmdyYWRlZCkgZ3JhcGggLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBibG9jayBkcmF3cyBhIGZpeGVkIHBpY3R1cmUgXHUyMDE0IHBvaW50cywgY3VydmVzLCBzZWdtZW50cywgZmlsbGVkIHBvbHlnb25zIFx1MjAxNFxuLy8gYW5kIGNvbGxlY3RzIE5PIGFuc3dlci4gVHdvIGpvYnMgZnJvbSBvbmUgc2hhcGU6IGEgc3RpbXVsdXMgYSBncmFkZWQgcXVlc3Rpb25cbi8vIHJlZmVycyB0byAoXCJ1c2luZyB0aGUgZ3JhcGggYmVsb3csIFx1MjAyNlwiKSwgYW5kIGEgc3RhbmRhbG9uZSBleGVtcGxhciB3aXRoIG5vXG4vLyBxdWVzdGlvbiBhdCBhbGwgKGFuIGVtcHR5IHByb21wdCkuIEJlY2F1c2UgYGRpc3BsYXlgIGlzIGp1c3QgYW5vdGhlciBtZW1iZXIgb2Zcbi8vIHRoZSBgdHlwZWAgdW5pb24sIGEgc3RpbXVsdXMtd2l0aC1hbi1hbnN3ZXIgbGF0ZXIgaXMgYWRkaXRpdmUgXHUyMDE0IGEgbmV3IGFuc3dlclxuLy8gZmllbGQgYmVzaWRlIHRoZSBkcmF3YWJsZXMgXHUyMDE0IG5vdCBhIG5ldyBibG9jayBmYW1pbHkuXG4vL1xuLy8gYERyYXdhYmxlYCAodGhlIHBvaW50IC8gY3VydmUgLyBleHByZXNzaW9uIC8gc2VnbWVudCAvIHJheSAvIHBvbHlnb24gdW5pb24sXG4vLyBkaXNjcmltaW5hdGVkIG9uIGBraW5kYCkgYW5kIGl0cyBgRHJhd2FibGVDb2xvcmAgcGFsZXR0ZSBrZXlzIG5vdyBsaXZlIGluXG4vLyAuLi9ncmFwaC1wcmltaXRpdmVzLnRzIGFuZCBhcmUgcmUtZXhwb3J0ZWQgYWJvdmUuXG5cbmV4cG9ydCBjb25zdCBEaXNwbGF5SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnZGlzcGxheScpLFxuICBkcmF3YWJsZXM6IHouYXJyYXkoRHJhd2FibGUpLmRlZmF1bHQoW10pLFxufSk7XG5leHBvcnQgdHlwZSBEaXNwbGF5SW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBEaXNwbGF5SW50ZXJhY3Rpb24+O1xuXG4vLyAtLS0tIHBsb3RfcmF5IC8gcGxvdF9zZWdtZW50OiBkcmF3IGEgcmF5IG9yIHNlZ21lbnQgZGlyZWN0bHkgLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGaXJzdC1jbGFzcyByZXBsYWNlbWVudHMgZm9yIHRoZSBkb21haW4tZ2xpZGVyIGFwcHJvYWNoICh3aGljaCBhc2tlZCBzdHVkZW50c1xuLy8gdG8gZGVmaW5lIGFuIGluZmluaXRlIGxpbmUsIHRoZW4gbWFyayBlbmRwb2ludHMgb24gaXQgd2l0aCBzZXBhcmF0ZSBjb250cm9scyBcdTIwMTRcbi8vIHRoZSBkcmF3biBsaW5lIG5ldmVyIGV2ZW4gY2xpcHBlZCkuIEhlcmUgdGhlIHN0dWRlbnQgZHJhZ3MgVFdPIGhhbmRsZXMgXHUyMDE0IHRoZVxuLy8gZW5kcG9pbnQocykgXHUyMDE0IGFuZCB0aGUgd2lkZ2V0IGRyYXdzIGFuIEFDVFVBTCByYXkvc2VnbWVudCB0aHJvdWdoIHRoZW1cbi8vIChKU1hHcmFwaCBzdHJhaWdodEZpcnN0L3N0cmFpZ2h0TGFzdCksIHdpdGggb3Blbi9jbG9zZWQgZW5kcG9pbnQgcGlsbHMuXG4vLyBBcnJheXMtb2Ytb25lIGxpa2UgbW9kZWxzL3JlZ2lvbnMvaW5lcXVhbGl0aWVzLCBzbyBzeXN0ZW1zIHN0YXkgYWRkaXRpdmUuXG4vLyAocGxvdF9mdW5jdGlvbidzIGRvbWFpbnNbXSByZW1haW5zIHNjb3JlZCBmb3IgYWxyZWFkeS1wdWJsaXNoZWQgcGFnZXMsIGJ1dFxuLy8gYXV0aG9yaW5nIHN0ZWVycyBoZXJlIG5vdy4pXG5leHBvcnQgY29uc3QgUmF5QW5zd2VyID0gei5vYmplY3Qoe1xuICAvLyBUaGUgcmF5J3MgZW5kcG9pbnQgKHNjb3JlZCBvbiBwb3NpdGlvbiArIG9wZW4vY2xvc2VkIHN0eWxlKS5cbiAgZnJvbTogei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pLFxuICAvLyBBbnkgc2Vjb25kIHBvaW50IE9OIHRoZSByYXkgXHUyMDE0IG5hbWVzIHRoZSBkaXJlY3Rpb247IHRoZSBzdHVkZW50J3MgdGhyb3VnaFxuICAvLyBoYW5kbGUgbWF5IHNpdCBhbnl3aGVyZSBhbG9uZyB0aGUgY29ycmVjdCByYXkuXG4gIHRocm91Z2g6IHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSxcbiAgZnJvbVN0eWxlOiBFbmRwb2ludFN0eWxlLmRlZmF1bHQoJ2Nsb3NlZCcpLFxuICAvLyBFbmRwb2ludCBwb3NpdGlvbiB0b2xlcmFuY2UgaW4gZ3JhcGggdW5pdHMgKG1hdGNoZXMgdGhlIGRvbWFpbi1nbGlkZXJcbiAgLy8gZGVmYXVsdCkuIERpcmVjdGlvbiBpcyBzY29yZWQgYnkgdW5pdC12ZWN0b3IgYWxpZ25tZW50IGtpdC1zaWRlLlxuICB0b2xlcmFuY2U6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5kZWZhdWx0KDAuMjUpLFxufSk7XG5leHBvcnQgdHlwZSBSYXlBbnN3ZXIgPSB6LmluZmVyPHR5cGVvZiBSYXlBbnN3ZXI+O1xuXG5leHBvcnQgY29uc3QgUmF5SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9yYXknKSxcbiAgcmF5czogei5hcnJheShSYXlBbnN3ZXIpLm1pbigxKSxcbn0pO1xuZXhwb3J0IHR5cGUgUmF5SW50ZXJhY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBSYXlJbnRlcmFjdGlvbj47XG5cbmV4cG9ydCBjb25zdCBTZWdtZW50QW5zd2VyID0gei5vYmplY3Qoe1xuICBmcm9tOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIHRvOiB6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSksXG4gIC8vIFtmcm9tLWVuZHBvaW50IHN0eWxlLCB0by1lbmRwb2ludCBzdHlsZV0uIFNjb3JlZCBvcmRlci1pbmRlcGVuZGVudGx5IFx1MjAxNFxuICAvLyB0aGUgc3R1ZGVudCBtYXkgZHJhdyB0aGUgc2VnbWVudCBpbiBlaXRoZXIgZGlyZWN0aW9uLlxuICBlbmRwb2ludHM6IHoudHVwbGUoW0VuZHBvaW50U3R5bGUsIEVuZHBvaW50U3R5bGVdKS5kZWZhdWx0KFsnY2xvc2VkJywgJ2Nsb3NlZCddKSxcbiAgdG9sZXJhbmNlOiB6Lm51bWJlcigpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwLjI1KSxcbn0pO1xuZXhwb3J0IHR5cGUgU2VnbWVudEFuc3dlciA9IHouaW5mZXI8dHlwZW9mIFNlZ21lbnRBbnN3ZXI+O1xuXG5leHBvcnQgY29uc3QgU2VnbWVudEludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3Rfc2VnbWVudCcpLFxuICBzZWdtZW50czogei5hcnJheShTZWdtZW50QW5zd2VyKS5taW4oMSksXG59KTtcbmV4cG9ydCB0eXBlIFNlZ21lbnRJbnRlcmFjdGlvbiA9IHouaW5mZXI8dHlwZW9mIFNlZ21lbnRJbnRlcmFjdGlvbj47XG5cbi8vIFRoZSBpbnRlcmFjdGlvbiB1bmlvbi4gcGxvdF9wb2ludCArIHBsb3RfZnVuY3Rpb24gKyBzaGFkZV9yZWdpb24gYXJlIGdyYWRlZDtcbi8vIGRpc3BsYXkgaXMgdGhlIHVuZ3JhZGVkIHN0YXRpYyBncmFwaC4gTW9yZSBhcmUgZnV0dXJlIG1lbWJlcnMuIEtlcHRcbi8vIGRpc2NyaW1pbmF0ZWQgb24gYHR5cGVgIHNvIHRoZSB3aXJlIGZvcm1hdCBhbHdheXMgY2FycmllcyBpdCBhbmQgY29uc3VtZXJzXG4vLyBicmFuY2ggdW5pZm9ybWx5LlxuZXhwb3J0IGNvbnN0IEdyYXBoSW50ZXJhY3Rpb24gPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgUG9pbnRJbnRlcmFjdGlvbixcbiAgRnVuY3Rpb25JbnRlcmFjdGlvbixcbiAgUmVnaW9uSW50ZXJhY3Rpb24sXG4gIEluZXF1YWxpdHlJbnRlcmFjdGlvbixcbiAgUmF5SW50ZXJhY3Rpb24sXG4gIFNlZ21lbnRJbnRlcmFjdGlvbixcbiAgRGlzcGxheUludGVyYWN0aW9uLFxuXSk7XG5leHBvcnQgdHlwZSBHcmFwaEludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgR3JhcGhJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gVGhlIGJsb2NrIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBdXRvLW51bWJlcmVkIGxpa2UgUHJvYmxlbUJsb2NrIC8gRmlsbEluQmxhbmtCbG9jay4gaGFzQ29uZmlkZW5jZVJhdGluZyArXG4vLyBza2lsbHMgZm9sbG93IHRoZSBzYW1lIG9wdC1pbiBwYXR0ZXJucyBGaWxsSW5CbGFua0Jsb2NrIGVzdGFibGlzaGVkOyBzb2x1dGlvblxuLy8gaXMgc2hvd24gcG9zdC1jaGVjayByZWdhcmRsZXNzIG9mIGNvcnJlY3RuZXNzLlxuZXhwb3J0IGNvbnN0IEludGVyYWN0aXZlR3JhcGhCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2ludGVyYWN0aXZlX2dyYXBoJyksXG4gIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC4uLmxhYmVsRmllbGRzLFxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGF4aXNDb25maWc6IEF4aXNDb25maWcsXG4gIGludGVyYWN0aW9uOiBHcmFwaEludGVyYWN0aW9uLFxuICAvLyBXaGVuIHRydWUsIGEgbXVsdGktcGFydCBncmFwaCAoc2V2ZXJhbCBwb2ludHMsIGEgc3lzdGVtIG9mIGN1cnZlcy9yZWdpb25zLFxuICAvLyBvciBcdTIwMTQgZnJvbSBEcm9wIDQgXHUyMDE0IGFuIGluZXF1YWxpdHkncyBsaW5lICsgc2lkZSArIHN0eWxlKSBzY29yZXMgZnJhY3Rpb25hbGx5XG4gIC8vIHBlciBvYmplY3QgYW5kIHRoZSBkYXNoYm9hcmQgaXRlbWl6ZXMgaXQ7IHdoZW4gZmFsc2UgKGRlZmF1bHQpIGl0IGlzIGFsbC1vci1cbiAgLy8gbm90aGluZy4gVGhlIGZsYWcgKyB0aGUga2l0J3MgcGVyLW9iamVjdCBzY29yaW5nIGVuZ2luZSBsYW5kIGhlcmUgKERyb3AgMik7XG4gIC8vIHRoZSBydW50aW1lICsgc3VibWlzc2lvbiBjb25zdW1lIHRoZSBmcmFjdGlvbiBhdCB0aGUgRHJvcCA0IHdpcmUgYnVtcC5cbiAgcGFydGlhbENyZWRpdDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIFdoZW4gdHJ1ZSwgdGhlIHN0dWRlbnQgZ2V0cyBhIFwiY2Fubm90IGJlIGdyYXBoZWQgLyBubyBzb2x1dGlvblwiIGNob2ljZSwgYW5kXG4gIC8vIHRoZSBhbnN3ZXIga2V5IG1heSBtYXJrIFRIQVQgYXMgdGhlIGNvcnJlY3QgYW5zd2VyICh0cmljayBxdWVzdGlvbnMpLiBUaGVcbiAgLy8gZmxhZyBsYW5kcyBoZXJlIChEcm9wIDIpOyB0aGUgc3R1ZGVudCBjb250cm9sICsgbm8tc29sdXRpb24gcmVzcG9uc2UgcmlkZSB0aGVcbiAgLy8gRHJvcCA0IHdpcmUgYnVtcC5cbiAgYWxsb3dOb1NvbHV0aW9uOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgLy8gVHJpY2sgcXVlc3Rpb25zOiB3aGVuIHRydWUgKHJlcXVpcmVzIGFsbG93Tm9Tb2x1dGlvbiksIFwibm8gc29sdXRpb25cIiBJUyB0aGVcbiAgLy8gY29ycmVjdCBhbnN3ZXIgYW5kIHRoZSBkcmF3biBhbnN3ZXIga2V5IGlzIGEgZGVjb3kuIEEgc3R1ZGVudCB3aG8gc2VsZWN0c1xuICAvLyBuby1zb2x1dGlvbiBpcyBjb3JyZWN0OyBvbmUgd2hvIGRyYXdzIGFueXRoaW5nIGlzIG5vdC5cbiAgbm9Tb2x1dGlvbkNvcnJlY3Q6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAvLyBCdWlsdC1pbiBtaXN0YWtlIGNsYXNzaWZpZXJzIChzd2FwcGVkIGNvb3JkaW5hdGVzLCBzd2FwcGVkIHNsb3BlL2ludGVyY2VwdCxcbiAgLy8gcmlnaHQtYm91bmRhcnktd3Jvbmctc2lkZSwgXHUyMDI2KSBzaG93IGEgdGFyZ2V0ZWQgbnVkZ2UgaW5zdGVhZCBvZiB0aGUgZ2VuZXJpY1xuICAvLyBcIk5vdCBxdWl0ZVwiIGFmdGVyIGEgY2hlY2suIERlZmF1bHQgT047IGEgdGVhY2hlciBjYW4gc3dpdGNoIHRoZW0gb2ZmLiBUaGVcbiAgLy8gY2xhc3NpZmllciBjYXRhbG9ndWUgKyBtZXNzYWdlcyBsaXZlIGtpdC1zaWRlIChncmFwaC1zY29yZS50cykgXHUyMDE0IHRoaXMgZmxhZ1xuICAvLyBvbmx5IGdhdGVzIHRoZW0uXG4gIGJ1aWx0aW5GZWVkYmFjazogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgLy8gQXV0aG9yZWQgYW50aWNpcGF0ZWQgbWlzdGFrZXMgXHUyMDE0IHRoZSBncmFwaCB0d2luIG9mIEJsYW5rVG9rZW4ubWlzdGFrZUZlZWRiYWNrLlxuICAvLyBgbWF0Y2hgIGlzIGEgZnJlZWZvcm0gZ3JhcGggYW5zd2VyIGluIHRoZSBTQU1FIHN5bnRheCB0aGUgYXV0aG9yaW5nIGZvcm11bGFcbiAgLy8gZmllbGQgYWNjZXB0cyAoXCIoNCwgMylcIiwgXCJ5ID0geCArIDJcIiwgXCJ5IDwgMnggKyAxXCIpOyB0aGUga2l0IHBhcnNlcyBpdCB3aXRoXG4gIC8vIHRoZSBzYW1lIHBhcnNlciBhbmQgY29tcGFyZXMgYWdhaW5zdCB0aGUgc3R1ZGVudCdzIGFuc3dlciB3aXRoIHRoZSBzYW1lXG4gIC8vIHRvbGVyYW5jZXMgYXMgc2NvcmluZy4gRmlyc3QgbWF0Y2ggd2lucywgYW5kIGFuIGF1dGhvcmVkIG1hdGNoIGJlYXRzIGFcbiAgLy8gYnVpbHQtaW4gY2xhc3NpZmllci4gYGZlZWRiYWNrYCBpcyByaWNoIGlubGluZSBjb250ZW50LCBzaG93biAocG9zdC1jaGVja1xuICAvLyBvbmx5KSBpbiB0aGUgYmxvY2sncyBmZWVkYmFjayBsaW5lLlxuICBtaXN0YWtlRmVlZGJhY2s6IHouYXJyYXkoei5vYmplY3Qoe1xuICAgIG1hdGNoOiB6LnN0cmluZygpLFxuICAgIGZlZWRiYWNrOiB6LmFycmF5KElubGluZU5vZGUpLFxuICB9KSkuZGVmYXVsdChbXSksXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIGhhc0NvbmZpZGVuY2VSYXRpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIC8vIFZhcmlhYmxlIGJsb2NrIHNpemluZzogb3B0aW9uYWwgd2lkdGggZnJhY3Rpb24gKyBhbGlnbm1lbnQgKHNpemluZy50cykuXG4gIC8vIEF1dGhvci1zZXQgZGlzcGxheSBmb290cHJpbnQgZm9yIHRoZSBmaWd1cmU7IHJlbmRlcmVyIGhvbm9ycyBpdCB2aWEgdGhlXG4gIC8vIHNoYXJlZCAuYmxvY2stc2l6ZWQgcGF0aC4gQWRkaXRpdmUvb3B0aW9uYWwgXHUyMDE0IG5vIHNjaGVtYVZlcnNpb24gYnVtcC5cbiAgLi4uc2l6aW5nRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBJbnRlcmFjdGl2ZUdyYXBoQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBJbnRlcmFjdGl2ZUdyYXBoQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5pbXBvcnQgeyBsYWJlbEZpZWxkcyB9IGZyb20gJy4uL2xhYmVsLmpzJztcbmltcG9ydCB7IEF4aXNDb25maWcsIERyYXdhYmxlIH0gZnJvbSAnLi9pbnRlcmFjdGl2ZS1ncmFwaC5qcyc7XG5cbi8vIE11bHRpcGxlLWNob2ljZSBxdWVzdGlvbiBibG9jay4gT25lIHByb21wdCwgMisgY2hvaWNlcywgcmFkaW8gKHNpbmdsZSkgb3Jcbi8vIGNoZWNrYm94IChcInNlbGVjdCBhbGwgdGhhdCBhcHBseVwiKSB2aWEgbXVsdGlTZWxlY3QuIFNjb3JlZCBhbGwtb3Itbm90aGluZzpcbi8vIHRoZSBzZWxlY3RlZCBzZXQgbXVzdCBlcXVhbCB0aGUgY29ycmVjdCBzZXQgKHBlci1jaG9pY2UgcGFydGlhbCBjcmVkaXQgaXMgYVxuLy8gZnV0dXJlIGFkZGl0aXZlIGZsYWcsIG1pcnJvcmluZyB0aGUgZ3JhcGggYmxvY2sncyBwYXJ0aWFsQ3JlZGl0IHByZWNlZGVudCkuXG4vL1xuLy8gQ2hvaWNlIGNvbnRlbnQgaXMgcmljaCBpbmxpbmUgKGZvcm1hdHRlZCB0ZXh0ICsgaW5saW5lIG1hdGgpIFx1MjAxNCB0aGUgc2FtZVxuLy8gYWxwaGFiZXQgYXMgcHJvYmxlbSBwcm9zZSwgc28gbWF0aCBhbnN3ZXIgY2hvaWNlcyByZW5kZXIgcHJvcGVybHkuIFJpY2hlclxuLy8gY2hvaWNlcyBhcmUgQURESVRJVkUgRklFTERTIG9uIE11bHRpcGxlQ2hvaWNlT3B0aW9uLCBub3QgYSB1bmlvbiByZXdvcmsgXHUyMDE0XG4vLyBkZWNpZGVkIGF0IGRlc2lnbiB0aW1lLCBleGVyY2lzZWQgMjAyNi0wNy0xMCB3aGVuIHRoZSBvcHRpb25hbCBgaW1hZ2VgIGFuZFxuLy8gYGdyYXBoYCBmaWd1cmVzIGxhbmRlZCB3aXRob3V0IGEgc2NoZW1hVmVyc2lvbiBidW1wLlxuLy9cbi8vIFBlci1jaG9pY2UgYGZlZWRiYWNrYCBpcyB0aGUgTUMgYW5hbG9ndWUgb2YgYSBibGFuaydzIG1pc3Rha2VGZWVkYmFjazpcbi8vIGRpc3RyYWN0b3JzIGFyZSB1c3VhbGx5IGF1dGhvcmVkIEJFQ0FVU0UgdGhleSdyZSBhbnRpY2lwYXRlZCBtaXN0YWtlcywgc29cbi8vIGVhY2ggY2hvaWNlIGNhbiBjYXJyeSBhbiBleHBsYW5hdGlvbiBzaG93biBwb3N0LWNoZWNrIHdoZW4gaXQgd2FzIHNlbGVjdGVkLlxuLy9cbi8vIEJsb2NrLWxldmVsIGZpZWxkcyBtaXJyb3IgRmlsbEluQmxhbmtCbG9jayBmb3IgcGFyaXR5IChzb2x1dGlvbixcbi8vIGhhc0NvbmZpZGVuY2VSYXRpbmcsIHNraWxscywgd29ya1NwYWNlKSBcdTIwMTQgb25lIHByb2JsZW0gY2hyb21lLCBvbmUgcnVudGltZVxuLy8gdHJlYXRtZW50LCBvbmUgZGFzaGJvYXJkIHJvdyBzaGFwZS5cbi8vXG4vLyBEZWxpYmVyYXRlbHkgTk9UIHNjaGVtYS1lbmZvcmNlZDogXCJhdCBsZWFzdCBvbmUgY2hvaWNlIGlzIG1hcmtlZCBjb3JyZWN0LlwiXG4vLyBBIG1pZC1lZGl0IGRyYWZ0ICh0ZWFjaGVyIGhhc24ndCBwaWNrZWQgdGhlIHJpZ2h0IGFuc3dlciB5ZXQpIG11c3Qgc3RpbGxcbi8vIGF1dG9zYXZlOyB0aGUgZWRpdG9yIHN1cmZhY2VzIHRoZSB3YXJuaW5nIGluc3RlYWQuIEEgemVyby1jb3JyZWN0IGJsb2NrIGlzXG4vLyB3ZWxsLWRlZmluZWQgYXQgcnVudGltZSAobXVsdGktc2VsZWN0OiBzZWxlY3Rpbmcgbm90aGluZyBpcy4uLiBzdGlsbCBhblxuLy8gb21pc3Npb247IG5vdGhpbmcgc2NvcmVzIGNvcnJlY3QpIFx1MjAxNCB3cm9uZyBhdXRob3JpbmcsIG5vdCBhIGNyYXNoLlxuXG4vLyBPcHRpb25hbCBpbGx1c3RyYXRpdmUgaW1hZ2Ugb24gYSBjaG9pY2UgKFwid2hpY2ggZGlhZ3JhbSBzaG93c1x1MjAyNlwiKS4gTWlycm9yc1xuLy8gRGVmaW5pdGlvbkltYWdlIC8gUGhhc2UtMSBJbWFnZUJsb2NrOiBVUkwtb25seSwgbm8gdXBsb2FkIHBpcGVsaW5lOyBhbHRcbi8vIHJlcXVpcmVkIGJ1dCBkZWZhdWx0aW5nIHRvICcnIGZvciBkZWNvcmF0aXZlIGZpZ3VyZXMgKGVkaXRvciB3YXJucykuXG5leHBvcnQgY29uc3QgQ2hvaWNlSW1hZ2UgPSB6Lm9iamVjdCh7XG4gIHNyYzogei5zdHJpbmcoKS51cmwoKSxcbiAgYWx0OiB6LnN0cmluZygpLmRlZmF1bHQoJycpLFxufSk7XG5leHBvcnQgdHlwZSBDaG9pY2VJbWFnZSA9IHouaW5mZXI8dHlwZW9mIENob2ljZUltYWdlPjtcblxuLy8gT3B0aW9uYWwgc3RhdGljIGdyYXBoIG9uIGEgY2hvaWNlIChcIndoaWNoIGdyYXBoIHNob3dzXHUyMDI2XCIpLiBSZXVzZXMgdGhlXG4vLyBpbnRlcmFjdGl2ZS1ncmFwaCB2b2NhYnVsYXJ5IChBeGlzQ29uZmlnICsgZGlzcGxheSBEcmF3YWJsZXMpIGJ1dCBpc1xuLy8gcmVuZGVyZWQgc2VydmVyLXNpZGUgYXMgaW5saW5lIFNWRyBieSB0aGUgcmVuZGVyZXIncyBncmFwaC1zdmcgZW5naW5lIFx1MjAxNFxuLy8gbmV2ZXIgdGhlIGludGVyYWN0aXZlIGtpdC4gQ29uc2VxdWVuY2U6IGBleHByZXNzaW9uYCBkcmF3YWJsZXMgbmVlZCB0aGVcbi8vIGtpdCdzIHBhcnNlciBhbmQgYXJlIE5PVCBkcmF3bjsgdGhlIGVkaXRvciBkb2Vzbid0IG9mZmVyIHRoZW0gaGVyZS5cbmV4cG9ydCBjb25zdCBDaG9pY2VHcmFwaCA9IHoub2JqZWN0KHtcbiAgYXhpczogQXhpc0NvbmZpZyxcbiAgZHJhd2FibGVzOiB6LmFycmF5KERyYXdhYmxlKS5kZWZhdWx0KFtdKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ2hvaWNlR3JhcGggPSB6LmluZmVyPHR5cGVvZiBDaG9pY2VHcmFwaD47XG5cbmV4cG9ydCBjb25zdCBNdWx0aXBsZUNob2ljZU9wdGlvbiA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAvLyBSaWNoIGlubGluZSBjb250ZW50IChmb3JtYXR0ZWQgdGV4dCArIGlubGluZSBtYXRoKS4gTm9uLWVtcHR5IGlzIGFuXG4gIC8vIGVkaXRvciBjb25jZXJuLCBub3QgYSBzY2hlbWEgb25lIChtaWQtZWRpdCBkcmFmdHMgbXVzdCBzYXZlKS5cbiAgY29udGVudDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgY29ycmVjdDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIC8vIE9wdGlvbmFsIHBlci1jaG9pY2UgZXhwbGFuYXRpb24sIHJldmVhbGVkIHBvc3QtY2hlY2sgd2hlbiB0aGlzIGNob2ljZSB3YXNcbiAgLy8gc2VsZWN0ZWQuIFJpY2ggaW5saW5lIGNvbnRlbnQsIGxpa2UgYmxhbmsgbWlzdGFrZUZlZWRiYWNrIGVudHJpZXMuXG4gIGZlZWRiYWNrOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIC8vIE9wdGlvbmFsIGZpZ3VyZSBiZWxvdyB0aGUgY2hvaWNlIHRleHQgXHUyMDE0IHRoZSBhZGRpdGl2ZSB3aWRlbmluZyB0aGUgaGVhZGVyXG4gIC8vIGNvbW1lbnQgcmVzZXJ2ZWQuIEJvdGggbWF5IHRlY2huaWNhbGx5IGNvZXhpc3QgKGltYWdlIHJlbmRlcnMgZmlyc3QpO1xuICAvLyB0aGUgZWRpdG9yIFVJIHRyZWF0cyB0aGVtIGFzIGEgc2luZ2xlIGZpZ3VyZSBzbG90LlxuICBpbWFnZTogQ2hvaWNlSW1hZ2Uub3B0aW9uYWwoKSxcbiAgZ3JhcGg6IENob2ljZUdyYXBoLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE11bHRpcGxlQ2hvaWNlT3B0aW9uID0gei5pbmZlcjx0eXBlb2YgTXVsdGlwbGVDaG9pY2VPcHRpb24+O1xuXG5leHBvcnQgY29uc3QgTXVsdGlwbGVDaG9pY2VCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ211bHRpcGxlX2Nob2ljZScpLFxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAuLi5sYWJlbEZpZWxkcyxcbiAgLy8gVGhlIHF1ZXN0aW9uIHByb3NlIChyaWNoIGlubGluZSBjb250ZW50LCBsaWtlIGEgcHJvYmxlbSBzdGF0ZW1lbnQpLlxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGNob2ljZXM6IHouYXJyYXkoTXVsdGlwbGVDaG9pY2VPcHRpb24pLm1pbigyKSxcbiAgLy8gZmFsc2UgPSBzaW5nbGUgYW5zd2VyIChyYWRpb3MsIGV4YWN0bHkgb25lIHNlbGVjdGFibGUpOyB0cnVlID0gXCJzZWxlY3RcbiAgLy8gYWxsIHRoYXQgYXBwbHlcIiAoY2hlY2tib3hlcykuIFNjb3JpbmcgaXMgc2V0IGVxdWFsaXR5IGVpdGhlciB3YXkuXG4gIG11bHRpU2VsZWN0OiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgLy8gS2VlcCB0aGUgYXV0aG9yZWQgY2hvaWNlIG9yZGVyIG9uIHBhcGVyIChTNS41IEQxN0EpLiBQcmludGVkIFZFUlNJT05TXG4gIC8vIHNodWZmbGUgY2hvaWNlcyB0byBkaXNjb3VyYWdlIGNvcHlpbmcsIHdoaWNoIGlzIHdyb25nIGZvciBhIHF1ZXN0aW9uIHdob3NlXG4gIC8vIG9yZGVyIGNhcnJpZXMgbWVhbmluZyBcdTIwMTQgXCJhbGwgb2YgdGhlIGFib3ZlXCIgaGFzIHRvIHN0YXkgbGFzdCwgYW5kIFwiYm90aCBBXG4gIC8vIGFuZCBCXCIgbmFtZXMgcG9zaXRpb25zIG91dHJpZ2h0LiBPcHRpb25hbCB3aXRoIG5vIGRlZmF1bHQgc28gYSBkb2N1bWVudFxuICAvLyB3cml0dGVuIGJlZm9yZSB0aGlzIHJlLXNlcmlhbGl6ZXMgYnl0ZS1pZGVudGljYWxseTsgYWJzZW50IG1lYW5zIHNodWZmbGUsXG4gIC8vIHdoaWNoIGlzIHRoZSByaWdodCBkZWZhdWx0IGZvciB0aGUgb3ZlcndoZWxtaW5nIG1ham9yaXR5IG9mIHF1ZXN0aW9ucy5cbiAgbG9ja0Nob2ljZU9yZGVyOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICAvLyBXb3JrZWQgZXhwbGFuYXRpb24gZm9yIHRoZSB3aG9sZSBwcm9ibGVtLCByZXZlYWxlZCBwb3N0LWNoZWNrIHJlZ2FyZGxlc3NcbiAgLy8gb2YgY29ycmVjdG5lc3MgKHNhbWUgY29udHJhY3QgYXMgRmlsbEluQmxhbmtCbG9jay5zb2x1dGlvbikuXG4gIHNvbHV0aW9uOiB6LmFycmF5KElubGluZU5vZGUpLm9wdGlvbmFsKCksXG4gIGhhc0NvbmZpZGVuY2VSYXRpbmc6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIC8vIFBlci1wcm9ibGVtIHByaW50IHdvcmstc3BhY2Ugb3ZlcnJpZGUgKHJlbSk7IGFic2VudCA9IGluaGVyaXQgdGhlXG4gIC8vIGFjdGl2aXR5LWxldmVsIGRlZmF1bHQgKHNlZSBGaWxsSW5CbGFua0Jsb2NrLndvcmtTcGFjZSBmb3IgdGhlIENTU1xuICAvLyBjdXN0b20tcHJvcGVydHkgcmVhc29uaW5nKS5cbiAgd29ya1NwYWNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNdWx0aXBsZUNob2ljZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgTXVsdGlwbGVDaG9pY2VCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuaW1wb3J0IHsgQ2hvaWNlSW1hZ2UsIENob2ljZUdyYXBoIH0gZnJvbSAnLi9tdWx0aXBsZS1jaG9pY2UuanMnO1xuXG4vLyBNYXRjaGluZyBxdWVzdGlvbiBibG9jay4gVHdvIGNvbHVtbnM6IGxlZnQgXCJpdGVtc1wiIChzdGVtcywgZG9jdW1lbnQgb3JkZXIpXG4vLyBhbmQgcmlnaHQgXCJ0YXJnZXRzXCIgKGxldHRlcmVkIEEsIEIsIENcdTIwMjYsIHNodWZmbGVkIGF0IHB1Ymxpc2ggdGltZSkuIFRoZVxuLy8gc3R1ZGVudCBkcmFncyBhIHRhcmdldCBjYXJkIG9udG8gYW4gaXRlbTsgdGhlIGNhcmQgZG9ja3MgbmV4dCB0byB0aGUgc3RlbS5cbi8vIERlc2lnbjogZG9jcy9kZXNpZ24vbWF0Y2hpbmctb3JkZXJpbmctcXVlc3Rpb25zLm1kIChkZWNpZGVkIDIwMjYtMDctMTApLlxuLy9cbi8vIERpc3RyYWN0b3JzOiB0YXJnZXRzIG1heSBleGNlZWQgaXRlbXMgXHUyMDE0IGFuIHVubWF0Y2hlZCB0YXJnZXQgaXMgc2ltcGx5XG4vLyByZWZlcmVuY2VkIGJ5IG5vIGtleSBlbnRyeS4gYWxsb3dUYXJnZXRSZXVzZSAob2ZmIGJ5IGRlZmF1bHQpIGxldHMgc2V2ZXJhbFxuLy8gaXRlbXMgc2hhcmUgb25lIHRhcmdldCAoXCJjYXRlZ29yaXphdGlvbi1saXRlXCI6IGNsYXNzaWZ5IGVhY2ggZXhwcmVzc2lvbiBhc1xuLy8gbGluZWFyL3F1YWRyYXRpYy9leHBvbmVudGlhbCk7IHRoZSBVSSB0aGVuIENPUElFUyB0aGUgY2FyZCBvbiBkb2NrIGluc3RlYWRcbi8vIG9mIG1vdmluZyBpdC5cbi8vXG4vLyBTY29yZWQgUEVSIFBBSVIgKGVhcm5lZC90b3RhbCBcdTIwMTQgdGhlIGZyYWN0aW9uYWwgQ2hlY2twb2ludFJlc3VsdCBwcmVjZWRlbnRcbi8vIGZyb20gd2lyZSB2NCk6IGVhY2ggaXRlbSBpcyBvbmUgcG9pbnQsIGNvcnJlY3Qgd2hlbiB0aGUgc3R1ZGVudCdzIHRhcmdldFxuLy8gZm9yIGl0IGVxdWFscyBrZXlbaXRlbUlkXS4gQmxvY2sgYGNvcnJlY3RgID0gZXZlcnkgcGFpciByaWdodC4gTm8gYmlwYXJ0aXRlXG4vLyBtYWNoaW5lcnkgXHUyMDE0IHRoZSBzdHVkZW50J3MgcGFpcmluZyBJUyB0aGUgYXNzaWdubWVudCAoY29udHJhc3QgYmxhbmsgZ3JvdXBzLFxuLy8gd2hlcmUgdHlwZWQgdmFsdWVzIG11c3QgYmUgbWF0Y2hlZCB0byBzbG90cykuXG4vL1xuLy8gRmlndXJlczogaXRlbXMgYW5kIHRhcmdldHMgYm90aCB0YWtlIHRoZSBvcHRpb25hbCBpbWFnZS9ncmFwaCBmaWd1cmUgc2xvdFxuLy8gc2hpcHBlZCBmb3IgTUMgY2hvaWNlcyAoQ2hvaWNlSW1hZ2UvQ2hvaWNlR3JhcGggXHUyMDE0IFVSTC1vbmx5IGltYWdlOyBzdGF0aWNcbi8vIGdyYXBoIHZpYSB0aGUgcmVuZGVyZXIncyBraXQtZnJlZSBTVkcgZW5naW5lLCBzbyBgZXhwcmVzc2lvbmAgZHJhd2FibGVzIGFyZVxuLy8gZXhjbHVkZWQgdGhlcmUgYW5kIHRoZSBlZGl0b3IgZG9lc24ndCBvZmZlciB0aGVtKS4gXCJNYXRjaCB0aGUgZ3JhcGggdG8gaXRzXG4vLyBlcXVhdGlvblwiIGlzIHRoZSBtYXJxdWVlIGNhc2UuXG4vL1xuLy8gRGVsaWJlcmF0ZWx5IE5PVCBzY2hlbWEtZW5mb3JjZWQ6IFwia2V5IGNvdmVycyBldmVyeSBpdGVtXCIgLyBcImtleSByZWZlcmVuY2VzXG4vLyByZWFsIHRhcmdldHMuXCIgQSBtaWQtZWRpdCBkcmFmdCAodGVhY2hlciBzdGlsbCBhc3NpZ25pbmcgYW5zd2VycykgbXVzdFxuLy8gYXV0b3NhdmU7IHRoZSBlZGl0b3Igc3VyZmFjZXMgdGhlIHdhcm5pbmcgaW5zdGVhZCAodGhlIE1DIHplcm8tY29ycmVjdFxuLy8gcHJlY2VkZW50KS4gVGhlIHJ1bnRpbWUgdHJlYXRzIGFuIGl0ZW0gbWlzc2luZyBmcm9tIHRoZSBrZXkgYXMgbmV2ZXJcbi8vIGNvcnJlY3QgXHUyMDE0IHdyb25nIGF1dGhvcmluZywgbm90IGEgY3Jhc2guXG5cbmV4cG9ydCBjb25zdCBNYXRjaGluZ0l0ZW0gPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgLy8gUmljaCBpbmxpbmUgY29udGVudCAoZm9ybWF0dGVkIHRleHQgKyBpbmxpbmUgbWF0aCkuIE5vbi1lbXB0eSBpcyBhblxuICAvLyBlZGl0b3IgY29uY2Vybiwgbm90IGEgc2NoZW1hIG9uZSAobWlkLWVkaXQgZHJhZnRzIG11c3Qgc2F2ZSkuXG4gIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIC8vIE9wdGlvbmFsIGZpZ3VyZSBiZWxvdyB0aGUgaXRlbSB0ZXh0IChzYW1lIHNpbmdsZS1maWd1cmUtc2xvdCB0cmVhdG1lbnRcbiAgLy8gYXMgTUMgY2hvaWNlczsgaW1hZ2UgcmVuZGVycyBmaXJzdCBpZiBib3RoIGFyZSBzb21laG93IHNldCkuXG4gIGltYWdlOiBDaG9pY2VJbWFnZS5vcHRpb25hbCgpLFxuICBncmFwaDogQ2hvaWNlR3JhcGgub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgTWF0Y2hpbmdJdGVtID0gei5pbmZlcjx0eXBlb2YgTWF0Y2hpbmdJdGVtPjtcblxuZXhwb3J0IGNvbnN0IE1hdGNoaW5nVGFyZ2V0ID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIGNvbnRlbnQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIGltYWdlOiBDaG9pY2VJbWFnZS5vcHRpb25hbCgpLFxuICBncmFwaDogQ2hvaWNlR3JhcGgub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgTWF0Y2hpbmdUYXJnZXQgPSB6LmluZmVyPHR5cGVvZiBNYXRjaGluZ1RhcmdldD47XG5cbmV4cG9ydCBjb25zdCBNYXRjaGluZ0Jsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnbWF0Y2hpbmcnKSxcbiAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLi4ubGFiZWxGaWVsZHMsXG4gIC8vIFRoZSBxdWVzdGlvbiBwcm9zZSAocmljaCBpbmxpbmUgY29udGVudCwgbGlrZSBhIHByb2JsZW0gc3RhdGVtZW50KS5cbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICAvLyBMZWZ0IGNvbHVtbiwgZG9jdW1lbnQgb3JkZXIuXG4gIGl0ZW1zOiB6LmFycmF5KE1hdGNoaW5nSXRlbSkubWluKDIpLFxuICAvLyBSaWdodCBjb2x1bW47IG1heSBleGNlZWQgaXRlbXMgKGV4dHJhIHRhcmdldHMgYXJlIGRpc3RyYWN0b3JzKS4gTGV0dGVyc1xuICAvLyBhcmUgYXNzaWduZWQgYnkgcG9zaXRpb24gQUZURVIgdGhlIHB1Ymxpc2gtdGltZSBzaHVmZmxlLCBuZXZlciBhdXRob3JlZC5cbiAgdGFyZ2V0czogei5hcnJheShNYXRjaGluZ1RhcmdldCkubWluKDIpLFxuICAvLyBUaGUgY29ycmVjdCBwYWlyaW5nOiBpdGVtIGlkIFx1MjE5MiB0YXJnZXQgaWQuIFBhcnRpYWwgZHVyaW5nIGF1dGhvcmluZyAoc2VlXG4gIC8vIGhlYWRlcik7IG11bHRpcGxlIGl0ZW1zIG1heSBzaGFyZSBhIHRhcmdldCBvbmx5IHVuZGVyIGFsbG93VGFyZ2V0UmV1c2UuXG4gIGtleTogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIHouc3RyaW5nKCkudXVpZCgpKSxcbiAgLy8gZmFsc2UgPSBvbmUtdG8tb25lIChkb2NraW5nIG1vdmVzIHRoZSBjYXJkOyBhIHVzZWQgdGFyZ2V0IGNhbid0IGJlIHVzZWRcbiAgLy8gYWdhaW4pLiB0cnVlID0gbWFueS10by1vbmUgYWxsb3dlZCAoZG9ja2luZyBjb3BpZXMgdGhlIGNhcmQpLlxuICBhbGxvd1RhcmdldFJldXNlOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgLy8gTUMtcGFyaXR5IHByb2JsZW0gY2hyb21lIChvbmUgcHJvYmxlbSBzaGFwZSwgb25lIGRhc2hib2FyZCByb3cgc2hhcGUpLlxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICBoYXNDb25maWRlbmNlUmF0aW5nOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICB3b3JrU3BhY2U6IHoubnVtYmVyKCkubWluKDApLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE1hdGNoaW5nQmxvY2sgPSB6LmluZmVyPHR5cGVvZiBNYXRjaGluZ0Jsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IElubGluZU5vZGUgfSBmcm9tICcuLi9pbmxpbmUuanMnO1xuaW1wb3J0IHsgbGFiZWxGaWVsZHMgfSBmcm9tICcuLi9sYWJlbC5qcyc7XG5cbi8vIE9yZGVyaW5nIC8gc2VxdWVuY2luZyBxdWVzdGlvbiBibG9jay4gVGhlIEFVVEhPUkVEIG9yZGVyIG9mIGBpdGVtc2AgSVMgdGhlXG4vLyBjb3JyZWN0IG9yZGVyOyBzdHVkZW50cyBzZWUgdGhlIGxpc3Qgc2h1ZmZsZWQgYXQgcHVibGlzaCB0aW1lIGFuZCBkcmFnIGl0XG4vLyBiYWNrIGludG8gc2VxdWVuY2UuIERlc2lnbjogZG9jcy9kZXNpZ24vbWF0Y2hpbmctb3JkZXJpbmctcXVlc3Rpb25zLm1kXG4vLyAoZGVjaWRlZCAyMDI2LTA3LTEwKS5cbi8vXG4vLyBTY29yZWQgQUxMLU9SLU5PVEhJTkcgb24gZXhhY3Qgc2VxdWVuY2UgZXF1YWxpdHkgKGF1dGhvciBjYWxsOiBwYXJ0aWFsLVxuLy8gY3JlZGl0IG1ldHJpY3MgZm9yIG9yZGVyaW5ncyBhcmUgZWl0aGVyIG1pc2xlYWRpbmcgXHUyMDE0IHBvc2l0aW9uIG1hdGNoZXNcbi8vIHB1bmlzaCBhbiBvZmYtYnktb25lIHNoaWZ0IGFic3VyZGx5IFx1MjAxNCBvciBvcGFxdWUgdG8gdGVhY2hlcnM7IHJldmlzaXQgb25seVxuLy8gb24gb2JzZXJ2ZWQgZGVtYW5kKS4gSW50ZXJjaGFuZ2VhYmxlIGFkamFjZW50IGl0ZW1zOiBZQUdOSSwgYWRkaXRpdmUgbGF0ZXIuXG4vL1xuLy8gQW4gdW50b3VjaGVkIGxpc3QgaXMgYW4gT01JU1NJT04sIG5vdCBhbiBhbnN3ZXI6IGEgc2h1ZmZsZWQgbGlzdCBpcyBhbHdheXNcbi8vICpzb21lKiBzZXF1ZW5jZSwgc28gdGhlIHJ1bnRpbWUgb25seSByZWNvcmRzIGEgcmVzcG9uc2Ugb25jZSB0aGUgc3R1ZGVudFxuLy8gaGFzIG1vdmVkIHNvbWV0aGluZy5cbi8vXG4vLyBObyBmaWd1cmUgc2xvdCBvbiBpdGVtcyBpbiB2MSAobm8gY2xlYXIgdXNlIGNhc2UgeWV0OyBhZGRpdGl2ZSBsYXRlciBcdTIwMTRcbi8vIHRoZSBNQy9tYXRjaGluZyBDaG9pY2VJbWFnZS9DaG9pY2VHcmFwaCBwYXR0ZXJuIGlzIHNpdHRpbmcgdGhlcmUpLlxuXG5leHBvcnQgY29uc3QgT3JkZXJpbmdJdGVtID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIC8vIFJpY2ggaW5saW5lIGNvbnRlbnQgKGZvcm1hdHRlZCB0ZXh0ICsgaW5saW5lIG1hdGgpLiBOb24tZW1wdHkgaXMgYW5cbiAgLy8gZWRpdG9yIGNvbmNlcm4sIG5vdCBhIHNjaGVtYSBvbmUgKG1pZC1lZGl0IGRyYWZ0cyBtdXN0IHNhdmUpLlxuICBjb250ZW50OiB6LmFycmF5KElubGluZU5vZGUpLFxufSk7XG5leHBvcnQgdHlwZSBPcmRlcmluZ0l0ZW0gPSB6LmluZmVyPHR5cGVvZiBPcmRlcmluZ0l0ZW0+O1xuXG5leHBvcnQgY29uc3QgT3JkZXJpbmdCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ29yZGVyaW5nJyksXG4gIG51bWJlcjogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC4uLmxhYmVsRmllbGRzLFxuICAvLyBUaGUgcXVlc3Rpb24gcHJvc2UgKHJpY2ggaW5saW5lIGNvbnRlbnQsIGxpa2UgYSBwcm9ibGVtIHN0YXRlbWVudCkuXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgLy8gQXV0aG9yZWQgb3JkZXIgPSBjb3JyZWN0IG9yZGVyLiBUaGUgcmVuZGVyZXIgc2h1ZmZsZXMgZGV0ZXJtaW5pc3RpY2FsbHlcbiAgLy8gKHNlZWRlZCBieSBibG9jayBpZCkgZm9yIHRoZSBzdHVkZW50LWZhY2luZyBhcnJhbmdlbWVudC5cbiAgaXRlbXM6IHouYXJyYXkoT3JkZXJpbmdJdGVtKS5taW4oMiksXG4gIC8vIE1DLXBhcml0eSBwcm9ibGVtIGNocm9tZSAob25lIHByb2JsZW0gc2hhcGUsIG9uZSBkYXNoYm9hcmQgcm93IHNoYXBlKS5cbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgaGFzQ29uZmlkZW5jZVJhdGluZzogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgd29ya1NwYWNlOiB6Lm51bWJlcigpLm1pbigwKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBPcmRlcmluZ0Jsb2NrID0gei5pbmZlcjx0eXBlb2YgT3JkZXJpbmdCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuaW1wb3J0IHsgRW5kcG9pbnRTdHlsZSB9IGZyb20gJy4vaW50ZXJhY3RpdmUtZ3JhcGguanMnO1xuaW1wb3J0IHsgc2l6aW5nRmllbGRzIH0gZnJvbSAnLi4vc2l6aW5nLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIG51bWJlci1saW5lLnRzIFx1MjAxNCB0aGUgbnVtYmVyX2xpbmUgYmxvY2sgKDEtRCBncmFkZWQsIEstOCAvIGVhcmx5IGFsZ2VicmEpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIDEtRCBzaWJsaW5nIG9mIGludGVyYWN0aXZlX2dyYXBoLiBUaGUgc3R1ZGVudCdzIGFuc3dlciBpcyBHRU9NRVRSSUMgXHUyMDE0IGFcbi8vIHBvaW50IChvciBzZXZlcmFsKSBwbG90dGVkIG9uIGEgc2luZ2xlIG51bWJlciBsaW5lLCBvciBhbiBpbnRlcnZhbC9yYXkgd2l0aFxuLy8gb3Blbi9jbG9zZWQgZW5kcG9pbnRzIChcImdyYXBoIHggPj0gLTJcIikuIFNhbWUgdGhyZWUgc3RydWN0dXJhbCBjb25zZXF1ZW5jZXNcbi8vIGFzIHRoZSBncmFwaCBibG9jayAoc2VlIGRvY3MvZGVzaWduL251bWJlci1saW5lLWJsb2NrLm1kKTogYSBzdHJ1Y3R1cmVkXG4vLyBhbnN3ZXIgd2l0aCBpdHMgT1dOIHN1Ym1pc3Npb24gbWFwIChudW1iZXJMaW5lUmVzcG9uc2VzLCBub3QgdGhlIGJsYW5rcyBtYXApLFxuLy8gdG9sZXJhbmNlLWJhc2VkIGdlb21ldHJpYyBzY29yaW5nIGRvbmUgYnkgdGhlIGxhenkgZ3JhcGgta2l0IChub3QgdGhlXG4vLyBydW50aW1lJ3Mgc3RyaW5nIHN0cmF0ZWdpZXMpLCBhbmQgYSB3aWRnZXQgdGhhdCByaWRlcyBAYWN0aXZpdHkvZ3JhcGgta2l0LlxuLy9cbi8vIEEgU0VQQVJBVEUgYmxvY2sgZmFtaWx5LCBub3QgYSBHcmFwaEludGVyYWN0aW9uIHZhcmlhbnQgKGF1dGhvciBjYWxsLCBTVEFURVxuLy8gMjAyNi0wNy0xMCk6IG51bWJlciBsaW5lcyBhcmUgMS1EIGFuZCBtdXN0IG5vdCBiZSBmb3JjZWQgdW5kZXIgdGhlIGdyYXBoXG4vLyBibG9jaydzIDItRCBBeGlzQ29uZmlnLiBFbmRwb2ludFN0eWxlIGlzIHNoYXJlZCBmcm9tIGludGVyYWN0aXZlLWdyYXBoLnRzIFx1MjAxNFxuLy8gaXQgd2FzIHJlc2VydmVkIHRoZXJlIFwiZm9yIHRoZSBmdXR1cmUgbnVtYmVyLWxpbmUgZmFtaWx5XCIgZnJvbSBEcm9wIDIuXG4vL1xuLy8gU2xpY2UgMSBzaGlwcyBUV08gaW50ZXJhY3Rpb25zIChwbG90X3BvaW50LCBwbG90X2ludGVydmFsKSwgZGlzY3JpbWluYXRlZCBvblxuLy8gYHR5cGVgIGZyb20gZGF5IG9uZSBzbyBwbG90X3JheSAvIGRpc3BsYXkgc2xvdCBpbiBhZGRpdGl2ZWx5IGxhdGVyLCBleGFjdGx5XG4vLyBob3cgR3JhcGhJbnRlcmFjdGlvbiBncm93cy5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIC0tLS0gTGluZSBjb25maWd1cmF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgMS1EIGFuYWxvZ3VlIG9mIEF4aXNDb25maWcuIExpbmUgdW5pdHMgdGhyb3VnaG91dCBcdTIwMTQgdG9sZXJhbmNlIGFuZCB0aWNrXG4vLyBzdGVwcyBhcmUgaW4gdGhlIHNhbWUgdW5pdHMsIG5ldmVyIHBpeGVscywgc28gYSBwYWdlIHRoYXQgcmUtbGF5cy1vdXQgYXQgYVxuLy8gZGlmZmVyZW50IHdpZHRoIHN0aWxsIHNjb3JlcyBpZGVudGljYWxseS5cbmV4cG9ydCBjb25zdCBOdW1iZXJMaW5lQ29uZmlnID0gei5vYmplY3Qoe1xuICBtaW46IHoubnVtYmVyKCksXG4gIG1heDogei5udW1iZXIoKSxcbiAgLy8gU3BhY2luZyBiZXR3ZWVuIExBQkVMRUQgdGlja3MgKGxpbmUgdW5pdHMpLlxuICB0aWNrU3RlcDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLmRlZmF1bHQoMSksXG4gIC8vIFVubGFiZWxlZCBtaW5vciB0aWNrcyBkcmF3biBiZXR3ZWVuIGVhY2ggcGFpciBvZiBsYWJlbGVkIHRpY2tzICgwID0gbm9uZSkuXG4gIC8vIFZpc3VhbCBvbmx5IFx1MjAxNCBuZXZlciBzY29yZWQuXG4gIG1pbm9yVGlja3NQZXJTdGVwOiB6Lm51bWJlcigpLmludCgpLm5vbm5lZ2F0aXZlKCkuZGVmYXVsdCgwKSxcbiAgLy8gV2hlbiB0cnVlLCBhIGRyYWdnZWQgaGFuZGxlIHNuYXBzIHRvIHRoZSBuZWFyZXN0IHRpY2sgKG1pbm9yIGlmIHByZXNlbnQsXG4gIC8vIGVsc2UgdGhlIGxhYmVsZWQgc3RlcCkuIEtleWJvYXJkIG51ZGdlIGFsd2F5cyBtb3ZlcyBieSBvbmUgdGljayByZWdhcmRsZXNzXG4gIC8vIChTaGlmdCA9IGZpbmUsIG9uZS10ZW50aCBvZiBhIHRpY2spLlxuICBzbmFwVG9UaWNrOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxufSk7XG5leHBvcnQgdHlwZSBOdW1iZXJMaW5lQ29uZmlnID0gei5pbmZlcjx0eXBlb2YgTnVtYmVyTGluZUNvbmZpZz47XG5cbi8vIC0tLS0gSW50ZXJhY3Rpb24gdmFyaWFudHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBwbG90X3BvaW50OiB0aGUgc3R1ZGVudCBwbGFjZXMgb25lIG9yIG1vcmUgcG9pbnRzIG9uIHRoZSBsaW5lLiBNdWx0aS1wb2ludFxuLy8gKFwicGxvdCAtMiBhbmQgNVwiKSBpcyBzY29yZWQgY29uc3VtZS1vbmNlLCBhbGwtb3Itbm90aGluZyBcdTIwMTQgZXZlcnkgY29ycmVjdFxuLy8gcG9zaXRpb24gbXVzdCBiZSBtYXRjaGVkIChtaXJyb3JzIHRoZSBncmFwaCBibG9jaydzIE4taGFuZGxlIHBsb3RfcG9pbnQpLlxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3RfcG9pbnQnKSxcbiAgLy8gQ29ycmVjdCBwb3NpdGlvbnMgaW4gbGluZSB1bml0cy4gQSBzaW5nbGUgcG9pbnQgaXMgdGhlIGNvbW1vbiBjYXNlLlxuICBjb3JyZWN0UG9pbnRzOiB6LmFycmF5KHoubnVtYmVyKCkpLm1pbigxKSxcbiAgLy8gTWF0Y2ggcmFkaXVzIGluIGxpbmUgdW5pdHMgKGEgcG9pbnQgaXMgY29ycmVjdCB3aXRoaW4gKy8tIHRvbGVyYW5jZSkuXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZVBvaW50SW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgTnVtYmVyTGluZVBvaW50SW50ZXJhY3Rpb25cbj47XG5cbi8vIEFuIGludGVydmFsIG9yIHJheSBvbiB0aGUgbGluZS4gQSBwcmVzZW50IGJvdW5kIGNhcnJpZXMgYW4gb3Blbi9jbG9zZWQgc3R5bGVcbi8vICh0aGUgaW5lcXVhbGl0eSBkaXN0aW5jdGlvbjogeCA+IDMgb3BlbiB2cyB4ID49IDMgY2xvc2VkKS4gQW4gQUJTRU5UIGJvdW5kIGlzXG4vLyB1bmJvdW5kZWQgdGhhdCBkaXJlY3Rpb24gXHUyMDE0IHNvIGEgcmF5IGlzIGp1c3QgYW4gaW50ZXJ2YWwgd2l0aCBvbmUgc2lkZSBvbWl0dGVkXG4vLyAoXCJ4ID49IDNcIiA9IG1pbiAzIGNsb3NlZCwgbm8gbWF4OyBcInggPCA1XCIgPSBtYXggNSBvcGVuLCBubyBtaW4pLiBUaGUgc2hhZGVkXG4vLyByZWdpb24gaXMgdW5hbWJpZ3VvdXMgZnJvbSB3aGljaCBib3VuZHMgYXJlIHByZXNlbnQsIHNvIG5vIHNlcGFyYXRlIHNpZGUgZmxhZ1xuLy8gaXMgbmVlZGVkICh1bmxpa2UgdGhlIDItRCBncmFwaCBpbmVxdWFsaXR5KS4gQXQgbGVhc3Qgb25lIGJvdW5kIG11c3QgYmVcbi8vIHByZXNlbnQgKGEgdHdvLXNpZGVkLXVuYm91bmRlZCBpbnRlcnZhbCBpcyB0aGUgd2hvbGUgbGluZSBcdTIwMTQgbWVhbmluZ2xlc3MpOyB0aGVcbi8vIGZhY3RvcnkgKyBhdXRob3IgVUkgZ3VhcmFudGVlIGl0IGFuZCB0aGUgc2NvcmVyIGFzc3VtZXMgaXQuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUludGVydmFsID0gei5vYmplY3Qoe1xuICBtaW46IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgbWluU3R5bGU6IEVuZHBvaW50U3R5bGUub3B0aW9uYWwoKSxcbiAgbWF4OiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIG1heFN0eWxlOiBFbmRwb2ludFN0eWxlLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVJbnRlcnZhbCA9IHouaW5mZXI8dHlwZW9mIE51bWJlckxpbmVJbnRlcnZhbD47XG5cbmV4cG9ydCBjb25zdCBOdW1iZXJMaW5lSW50ZXJ2YWxJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X2ludGVydmFsJyksXG4gIGNvcnJlY3RJbnRlcnZhbDogTnVtYmVyTGluZUludGVydmFsLFxuICAvLyBNYXRjaCByYWRpdXMgaW4gbGluZSB1bml0cywgYXBwbGllZCB0byBlYWNoIHByZXNlbnQgZW5kcG9pbnQuXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC4xKSxcbn0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgTnVtYmVyTGluZUludGVydmFsSW50ZXJhY3Rpb25cbj47XG5cbi8vIERpc2NyaW1pbmF0ZWQgb24gYHR5cGVgIHNvIGNvbnN1bWVycyBicmFuY2ggdW5pZm9ybWx5IGFuZCB0aGUgd2lyZSBmb3JtYXRcbi8vIGFsd2F5cyBjYXJyaWVzIGl0LiBHcm93aW5nIGEgdmFyaWFudCBpcyBhIG5ldyBtZW1iZXIgaGVyZSArIGEgbmV3IHNjb3JlclxuLy8gYnJhbmNoIGluIHRoZSBraXQgXHUyMDE0IG5vIG90aGVyIGJsb2NrIHRvdWNoZWQuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUludGVyYWN0aW9uID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIE51bWJlckxpbmVQb2ludEludGVyYWN0aW9uLFxuICBOdW1iZXJMaW5lSW50ZXJ2YWxJbnRlcmFjdGlvbixcbl0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZUludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgTnVtYmVyTGluZUludGVyYWN0aW9uPjtcblxuLy8gLS0tLSBUaGUgYmxvY2sgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEF1dG8tbnVtYmVyZWQgbGlrZSB0aGUgb3RoZXIgcXVlc3Rpb24gYmxvY2tzLiBoYXNDb25maWRlbmNlUmF0aW5nICsgc2tpbGxzICtcbi8vIHNvbHV0aW9uIGZvbGxvdyB0aGUgc2FtZSBvcHQtaW4gcGF0dGVybnMgRmlsbEluQmxhbmtCbG9jayAvIEludGVyYWN0aXZlR3JhcGhcbi8vIGVzdGFibGlzaGVkLiBEZWxpYmVyYXRlbHkgTEVBTiBmb3Igc2xpY2UgMSAobm8gcGFydGlhbENyZWRpdCAvIGFsbG93Tm9Tb2x1dGlvblxuLy8gLyBtaXN0YWtlRmVlZGJhY2spIFx1MjAxNCBhbGwtb3Itbm90aGluZyBzY29yaW5nIChkZXNpZ24gZGVjaXNpb24gNik7IHRob3NlIGZpZWxkc1xuLy8gYXJlIGFkZGl0aXZlIGxhdGVyIGlmIGFza2VkIGZvciAoWUFHTkkpLCBleGFjdGx5IGFzIHRoZSBncmFwaCBibG9jayByZXNlcnZlZFxuLy8gdGhlbSBhY3Jvc3MgZHJvcHMuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnbnVtYmVyX2xpbmUnKSxcbiAgbnVtYmVyOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLi4ubGFiZWxGaWVsZHMsXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgY29uZmlnOiBOdW1iZXJMaW5lQ29uZmlnLFxuICBpbnRlcmFjdGlvbjogTnVtYmVyTGluZUludGVyYWN0aW9uLFxuICBzb2x1dGlvbjogei5hcnJheShJbmxpbmVOb2RlKS5vcHRpb25hbCgpLFxuICBoYXNDb25maWRlbmNlUmF0aW5nOiB6LmJvb2xlYW4oKS5kZWZhdWx0KGZhbHNlKSxcbiAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICAvLyBWYXJpYWJsZSBibG9jayBzaXppbmc6IG9wdGlvbmFsIHdpZHRoIGZyYWN0aW9uICsgYWxpZ25tZW50IChzaXppbmcudHMpLlxuICAvLyBBZGRpdGl2ZS9vcHRpb25hbCBcdTIwMTQgbm8gc2NoZW1hVmVyc2lvbiBidW1wLlxuICAuLi5zaXppbmdGaWVsZHMsXG59KTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVCbG9jayA9IHouaW5mZXI8dHlwZW9mIE51bWJlckxpbmVCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcbmltcG9ydCB7IGxhYmVsRmllbGRzIH0gZnJvbSAnLi4vbGFiZWwuanMnO1xuaW1wb3J0IHsgTnVtYmVyTGluZUNvbmZpZyB9IGZyb20gJy4vbnVtYmVyLWxpbmUuanMnO1xuaW1wb3J0IHsgc2l6aW5nRmllbGRzIH0gZnJvbSAnLi4vc2l6aW5nLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGRhdGEtcGxvdC50cyBcdTIwMTQgdGhlIGRhdGFfcGxvdCBibG9jayAoc3RhdGlzdGljcyBjaGFydHMpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHN0YXRpc3RpY3Mgc2libGluZyBvZiBpbnRlcmFjdGl2ZV9ncmFwaCAoMi1EIGZ1bmN0aW9ucykgYW5kIG51bWJlcl9saW5lXG4vLyAoMS1EIGdlb21ldHJ5KS4gQSBkYXRhX3Bsb3QgcmVuZGVycyBhIGRvdCBwbG90LCBoaXN0b2dyYW0sIG9yIGJveCBwbG90IGZyb20gYVxuLy8gZGF0YXNldCBcdTIwMTQgZWl0aGVyIGFzIGEgc3RhdGljIFNUSU1VTFVTIHRoZSBzdHVkZW50IHJlYWRzIChcIndoYXQgaXMgdGhlIG1lZGlhblxuLy8gb2YgdGhpcyBib3ggcGxvdD9cIiwgcGFpcmVkIHdpdGggYSBzaWJsaW5nIG51bWVyaWMvTUMgYmxvY2spIG9yIGFzIGEgZ3JhZGVkXG4vLyBDT05TVFJVQ1RJT04gdGhlIHN0dWRlbnQgYnVpbGRzIChcIm1ha2UgYSBkb3QgcGxvdCBvZiB0aGVzZSB2YWx1ZXNcIikuXG4vL1xuLy8gQSBTRVBBUkFURSBibG9jayBmYW1pbHksIG5vdCBhIEdyYXBoSW50ZXJhY3Rpb24gdmFyaWFudCAodGF4b25vbXkgZml4ZWRcbi8vIDIwMjYtMDctMTAsIFNUQVRFKTogc3RhdHMgY2hhcnRzIGFyZSB0aGVpciBvd24gc2hhcGUgYW5kIG11c3Qgbm90IGJlIGZvcmNlZFxuLy8gdW5kZXIgdGhlIGdyYXBoIGJsb2NrJ3MgMi1EIEF4aXNDb25maWcuIERlc2lnbiArIDkgZGVjaXNpb25zIGluXG4vLyBkb2NzL2Rlc2lnbi9kYXRhLXBsb3QtYmxvY2subWQgKGF1dGhvciBhcHByb3ZlZCB0aGUgcmVjb21tZW5kZWQgYW5zd2VycykuXG4vL1xuLy8gVEhFIEFOU1dFUiBJUyBDT01QVVRFRCBGUk9NIFRIRSBEQVRBIChkZXNpZ24gZGVjaXNpb24gM2EpOiBhIGRvdCBwbG90LFxuLy8gaGlzdG9ncmFtLCBhbmQgYm94IHBsb3QgYXJlIGVhY2ggYSBkZXRlcm1pbmlzdGljIGZ1bmN0aW9uIG9mIGBkYXRhYCwgc28gdGhlXG4vLyBhdXRob3IgZW50ZXJzIHRoZSByYXcgZGF0YXNldCBPTkNFIGFuZCB0aGUgY29ycmVjdCBwbG90IGlzIGRlcml2ZWQgYnkgdGhlIGtpdFxuLy8gc2NvcmVyIFx1MjAxNCB0aGVyZSBpcyBubyBzZXBhcmF0ZWx5LWF1dGhvcmVkIGFuc3dlciBrZXkgdG8gZHJpZnQgZnJvbSB0aGUgZGF0YS5cbi8vIFRoZSBzYW1lIGBkYXRhYCByZW5kZXJzIHRoZSBjaGFydCBpbiBkaXNwbGF5IG1vZGUgYW5kIGlzIHRoZSBzb3VyY2UgdGhlXG4vLyBzdHVkZW50IHBsb3RzIChhbmQgdGhlIGtleSBpdCdzIHNjb3JlZCBhZ2FpbnN0KSBpbiBidWlsZCBtb2RlLlxuLy9cbi8vIFNsaWNlIDEgc2hpcHMgVFdPIGludGVyYWN0aW9ucyBcdTIwMTQgYGRpc3BsYXlgIChhbGwgdGhyZWUgY2hhcnQgdHlwZXMsIHVuZ3JhZGVkXG4vLyBzdGltdWx1cykgYW5kIGBidWlsZF9kb3RwbG90YCAodGhlIHNpbXBsZXN0IGdyYWRlZCBjb25zdHJ1Y3Rpb24pIFx1MjAxNFxuLy8gZGlzY3JpbWluYXRlZCBvbiBgdHlwZWAgZnJvbSBkYXkgb25lIHNvIGBidWlsZF9oaXN0b2dyYW1gIC8gYGJ1aWxkX2JveHBsb3RgXG4vLyBzbG90IGluIGFkZGl0aXZlbHkgbGF0ZXIsIGV4YWN0bHkgaG93IEdyYXBoSW50ZXJhY3Rpb24gYW5kIE51bWJlckxpbmVJbnRlcmFjdGlvblxuLy8gZ3Jvdy4gU2FtZSB0aHJlZSBzdHJ1Y3R1cmFsIGNvbnNlcXVlbmNlcyBhcyB0aGUgZ3JhcGgvbnVtYmVyLWxpbmUgYmxvY2tzOiBhXG4vLyBzdHJ1Y3R1cmVkIGFuc3dlciB3aXRoIGl0cyBPV04gc3VibWlzc2lvbiBtYXAgKGRhdGFQbG90UmVzcG9uc2VzLCBub3QgdGhlXG4vLyBibGFua3MgbWFwKSwgZnJlcXVlbmN5L3N1bW1hcnkgc2NvcmluZyBkb25lIGJ5IHRoZSBsYXp5IGdyYXBoLWtpdCAobm90IHRoZVxuLy8gcnVudGltZSdzIHN0cmluZyBzdHJhdGVnaWVzKSwgYW5kIGEgd2lkZ2V0IHRoYXQgcmlkZXMgQGFjdGl2aXR5L2dyYXBoLWtpdC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIC0tLS0gQ2hhcnQgY29uZmlndXJhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgbnVtZXJpYyBheGlzIGlzIHJldXNlZCBWRVJCQVRJTSBmcm9tIE51bWJlckxpbmVDb25maWcgKGRlc2lnbiBkZWNpc2lvbiA1KTpcbi8vIGEgZG90IHBsb3Qgc3RhY2tzIGRvdHMgYWJvdmUgdGhlaXIgdmFsdWUgb24gYSAxLUQgbnVtYmVyIGxpbmUsIGFuZCBhIGJveCBwbG90XG4vLyBzaXRzIG9uIHRoYXQgc2FtZSBheGlzLCBzbyB0aGUgdGljay9taW5vci9zbmFwIHNlbWFudGljcyBhcmUgaWRlbnRpY2FsLiBUaGVcbi8vIGhpc3RvZ3JhbS1vbmx5IGV4dHJhcyAoZXF1YWwtd2lkdGggYmlucyArIGFuIG9wdGlvbmFsIHktc2NhbGUgY2VpbGluZykgYXJlXG4vLyBjb25zdWx0ZWQgb25seSB3aGVuIHRoZSBjaGFydCBpcyBhIGhpc3RvZ3JhbTsgdW5lcXVhbC1iaW4gYGJpbkVkZ2VzYCBpcyBhXG4vLyBkb2N1bWVudGVkIGxhdGVyIGxldmVyIChZQUdOSSBpbiBzbGljZSAxKS5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdENvbmZpZyA9IE51bWJlckxpbmVDb25maWcuZXh0ZW5kKHtcbiAgLy8gRXF1YWwtd2lkdGggYmluIHNpemUgc3Bhbm5pbmcgW21pbiwgbWF4XTsgb25seSByZWFkIHdoZW4gY2hhcnQgPT1cbiAgLy8gJ2hpc3RvZ3JhbScuIEFic2VudCBcdTIxOTIgdGhlIGhpc3RvZ3JhbSBmYWxscyBiYWNrIHRvIGB0aWNrU3RlcGAgYXMgdGhlIGJpblxuICAvLyB3aWR0aC4gUG9zaXRpdmUuXG4gIGJpbldpZHRoOiB6Lm51bWJlcigpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgLy8gRml4ZWQgY2VpbGluZyBmb3IgdGhlIGhpc3RvZ3JhbS9kb3QtcGxvdCB2ZXJ0aWNhbCBzY2FsZS4gQWJzZW50IFx1MjE5MiB0aGVcbiAgLy8gc2NhbGUgYXV0by1maXRzIHRoZSB0YWxsZXN0IGJhci9zdGFjayBmcm9tIGBkYXRhYC4gQSBmaXhlZCB2YWx1ZSBrZWVwc1xuICAvLyBzZXZlcmFsIHBsb3RzIG9uIGEgcGFnZSB2aXN1YWxseSBjb21wYXJhYmxlLiBQb3NpdGl2ZSBpbnRlZ2VyIChmcmVxdWVuY3kpLlxuICBtYXhGcmVxdWVuY3k6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdENvbmZpZyA9IHouaW5mZXI8dHlwZW9mIERhdGFQbG90Q29uZmlnPjtcblxuLy8gVGhlIGNoYXJ0IHNoYXBlLiBTaGFyZWQgYnkgdGhlIGBkaXNwbGF5YCBtZW1iZXIgKHdoaWNoIG9uZSB0byByZW5kZXIpIGFuZFxuLy8gaW1wbGllZCBieSBlYWNoIGBidWlsZF8qYCBtZW1iZXIuIE5hbWVkIGJ5IHNoYXBlLCBub3QgYnkgZ3JhZGUgYmFuZC5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdENoYXJ0ID0gei5lbnVtKFsnZG90cGxvdCcsICdoaXN0b2dyYW0nLCAnYm94cGxvdCddKTtcbmV4cG9ydCB0eXBlIERhdGFQbG90Q2hhcnQgPSB6LmluZmVyPHR5cGVvZiBEYXRhUGxvdENoYXJ0PjtcblxuLy8gLS0tLSBJbnRlcmFjdGlvbiB2YXJpYW50cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGRpc3BsYXk6IGEgc3RhdGljLCB1bmdyYWRlZCBjaGFydCBvZiBgZGF0YWAgXHUyMDE0IGEgc3RpbXVsdXMgdGhlIHN0dWRlbnQgcmVhZHMuXG4vLyBMaWtlIGludGVyYWN0aXZlX2dyYXBoJ3MgYGRpc3BsYXlgIG1lbWJlciBpdCBwdWxscyBubyBwcm9ibGVtIG51bWJlciwgaXNcbi8vIG5ldmVyIHNjb3JlZCwgYW5kIG5ldmVyIGpvaW5zIHRoZSBzdWJtaXNzaW9uIHBheWxvYWQ7IGEgXCJyZWFkIHRoaXMgY2hhcnQgdGhlblxuLy8gYW5zd2VyXCIgdGFzayBjb21wb3NlcyBhIGRpc3BsYXkgZGF0YV9wbG90IHdpdGggYSBzaWJsaW5nIG51bWVyaWMvTUMgYmxvY2tcbi8vICh0aGUgcGF0dGVybiB0aGF0IHJlcGxhY2VkIHRoZSByZXRpcmVkIGFuc3dlci1zdXJmYWNlLWFzLWEtZmllbGQgc2VhbSkuXG5leHBvcnQgY29uc3QgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb24gPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnZGlzcGxheScpLFxuICBjaGFydDogRGF0YVBsb3RDaGFydCxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgRGF0YVBsb3REaXNwbGF5SW50ZXJhY3Rpb25cbj47XG5cbi8vIGJ1aWxkX2RvdHBsb3Q6IHRoZSBzdHVkZW50IHN0YWNrcyBkb3RzIGFib3ZlIHRoZSBheGlzIHRvIHJlcHJvZHVjZSB0aGVcbi8vIGZyZXF1ZW5jeSBkaXN0cmlidXRpb24gb2YgYGRhdGFgLiBTY29yZWQgYWxsLW9yLW5vdGhpbmcgb24gZnJlcXVlbmN5LW1hcFxuLy8gZXF1YWxpdHkgKGRlc2lnbiBkZWNpc2lvbiA4KSBcdTIwMTQgZG90IHZhbHVlcyBhcmUgZGlzY3JldGUgKHRoZSB3aWRnZXQgc25hcHMgZWFjaFxuLy8gZG90IHRvIGEgdGljayksIHNvIHRoZSBjb21wYXJpc29uIGlzIGV4YWN0LCBubyB0b2xlcmFuY2UgZmllbGQuIFRoZSBjb3JyZWN0XG4vLyBkaXN0cmlidXRpb24gaXMgQ09NUFVURUQgZnJvbSBgZGF0YWAgKGRlY2lzaW9uIDNhKTsgbm90aGluZyB0byBhdXRob3IgaGVyZVxuLy8gYmV5b25kIHRoZSBkYXRhc2V0IGl0c2VsZiwgc28gdGhpcyBpcyBhIGJhcmUgbWFya2VyIHZhcmlhbnQgdGhhdCBncm93c1xuLy8gYnVpbGRfaGlzdG9ncmFtIC8gYnVpbGRfYm94cGxvdCBzaWJsaW5ncyBsYXRlci5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdERvdHBsb3RJbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdidWlsZF9kb3RwbG90JyksXG59KTtcbmV4cG9ydCB0eXBlIERhdGFQbG90RG90cGxvdEludGVyYWN0aW9uID0gei5pbmZlcjxcbiAgdHlwZW9mIERhdGFQbG90RG90cGxvdEludGVyYWN0aW9uXG4+O1xuXG4vLyBidWlsZF9oaXN0b2dyYW06IHRoZSBzdHVkZW50IHNldHMgZWFjaCBiYXIncyBmcmVxdWVuY3kgdG8gcmVwcm9kdWNlIHRoZVxuLy8gaGlzdG9ncmFtIG9mIGBkYXRhYCAoYmlubmVkIGJ5IGNvbmZpZy5iaW5XaWR0aCBvdmVyIFttaW4sbWF4XSkuIFNjb3JlZFxuLy8gYWxsLW9yLW5vdGhpbmcgb24gZXhhY3QgcGVyLWJpbiBpbnRlZ2VyLWZyZXF1ZW5jeSBlcXVhbGl0eSAoYSBiYXIgaXMgYSB3aG9sZVxuLy8gY291bnQgXHUyMDE0IG5vIHRvbGVyYW5jZSksIHRoZSBmcmVxdWVuY3ktZGlzdHJpYnV0aW9uIHR3aW4gb2YgYnVpbGRfZG90cGxvdC4gVGhlXG4vLyBjb3JyZWN0IGhlaWdodHMgYXJlIENPTVBVVEVEIGZyb20gYGRhdGFgLCBzbyB0aGlzIHRvbyBpcyBhIGJhcmUgbWFya2VyIHZhcmlhbnQuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RIaXN0b2dyYW1JbnRlcmFjdGlvbiA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdidWlsZF9oaXN0b2dyYW0nKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RIaXN0b2dyYW1JbnRlcmFjdGlvbiA9IHouaW5mZXI8XG4gIHR5cGVvZiBEYXRhUGxvdEhpc3RvZ3JhbUludGVyYWN0aW9uXG4+O1xuXG4vLyBidWlsZF9ib3hwbG90OiB0aGUgc3R1ZGVudCBkcmFncyB0aGUgZml2ZS1udW1iZXItc3VtbWFyeSBoYW5kbGVzIChtaW4sIFExLFxuLy8gbWVkaWFuLCBRMywgbWF4KSB0byBidWlsZCB0aGUgYm94ICsgd2hpc2tlcnMgb2YgYGRhdGFgLiBTY29yZWQgYWxsLW9yLW5vdGhpbmdcbi8vIHdpdGggZWFjaCBoYW5kbGUgd2l0aGluIGB0b2xlcmFuY2VgIGxpbmUgdW5pdHMgb2YgdGhlIGNvbXB1dGVkIHN1bW1hcnkuIFVubGlrZVxuLy8gdGhlIGZyZXF1ZW5jeSBidWlsZHMgdGhpcyBjYXJyaWVzIGEgdG9sZXJhbmNlIGJlY2F1c2UgYm94IHBvc2l0aW9ucyBhcmVcbi8vIGNvbnRpbnVvdXMgYW5kIHRoZSB0d28gY29tbW9uIHF1YXJ0aWxlIG1ldGhvZHMgY2FuIGRpZmZlciBieSBhIGRhdGEgcG9pbnQgb25cbi8vIGV2ZW4tbGVuZ3RoIHNldHMgXHUyMDE0IHRoZSBrZXkgdXNlcyB0aGUgVEktODQgZXhjbHVzaXZlLW1lZGlhbiBtZXRob2QgKGxvY2tlZCxcbi8vIGRlc2lnbiBkZWNpc2lvbiA0KSBhbmQgdGhlIHRvbGVyYW5jZSBhYnNvcmJzIHRoZSBhZGphY2VudC1tZXRob2QgYW5zd2VyLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90Qm94cGxvdEludGVyYWN0aW9uID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2J1aWxkX2JveHBsb3QnKSxcbiAgLy8gTWF0Y2ggcmFkaXVzIGluIGxpbmUgdW5pdHMsIGFwcGxpZWQgdG8gZWFjaCBvZiB0aGUgZml2ZSBoYW5kbGVzLiBEZWZhdWx0XG4gIC8vIGhhbGYgYSB1bml0IHRpY2suXG4gIHRvbGVyYW5jZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLmRlZmF1bHQoMC41KSxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RCb3hwbG90SW50ZXJhY3Rpb24gPSB6LmluZmVyPFxuICB0eXBlb2YgRGF0YVBsb3RCb3hwbG90SW50ZXJhY3Rpb25cbj47XG5cbi8vIERpc2NyaW1pbmF0ZWQgb24gYHR5cGVgIHNvIGNvbnN1bWVycyBicmFuY2ggdW5pZm9ybWx5IGFuZCB0aGUgd2lyZSBmb3JtYXRcbi8vIGFsd2F5cyBjYXJyaWVzIGl0LiBHcm93aW5nIGEgdmFyaWFudCBpcyBhIG5ldyBtZW1iZXIgaGVyZSArIGEgbmV3IHNjb3JlclxuLy8gYnJhbmNoIGluIHRoZSBraXQgXHUyMDE0IG5vIG90aGVyIGJsb2NrIHRvdWNoZWQuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RJbnRlcmFjdGlvbiA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBEYXRhUGxvdERpc3BsYXlJbnRlcmFjdGlvbixcbiAgRGF0YVBsb3REb3RwbG90SW50ZXJhY3Rpb24sXG4gIERhdGFQbG90SGlzdG9ncmFtSW50ZXJhY3Rpb24sXG4gIERhdGFQbG90Qm94cGxvdEludGVyYWN0aW9uLFxuXSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdEludGVyYWN0aW9uID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3RJbnRlcmFjdGlvbj47XG5cbi8vIC0tLS0gVGhlIGJsb2NrIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBdXRvLW51bWJlcmVkIGxpa2UgdGhlIG90aGVyIHF1ZXN0aW9uIGJsb2NrcyBXSEVOIEdSQURFRCBcdTIwMTQgYSBgZGlzcGxheWBcbi8vIGRhdGFfcGxvdCBwdWxscyBubyBudW1iZXIgKHRoZSByZW5kZXJlcidzIGlzTnVtYmVyZWRCbG9jayByZXR1cm5zIGZhbHNlIGZvclxuLy8gaXQsIGV4YWN0bHkgYXMgaXQgZG9lcyBmb3IgYSBkaXNwbGF5IGludGVyYWN0aXZlX2dyYXBoKS4gaGFzQ29uZmlkZW5jZVJhdGluZ1xuLy8gKyBza2lsbHMgKyBzb2x1dGlvbiBmb2xsb3cgdGhlIHNhbWUgb3B0LWluIHBhdHRlcm5zIHRoZSBncmFwaCAvIG51bWJlci1saW5lXG4vLyBibG9ja3MgZXN0YWJsaXNoZWQsIGFuZCAobGlrZSB0aGVtKSBtYXR0ZXIgb25seSBpbiBidWlsZCBtb2RlLiBEZWxpYmVyYXRlbHlcbi8vIExFQU4gZm9yIHNsaWNlIDEgKG5vIHBhcnRpYWxDcmVkaXQgLyBtaXN0YWtlRmVlZGJhY2spIFx1MjAxNCBhbGwtb3Itbm90aGluZ1xuLy8gc2NvcmluZyAoZGVjaXNpb24gOCk7IHRob3NlIGZpZWxkcyBhcmUgYWRkaXRpdmUgbGF0ZXIgaWYgYXNrZWQgZm9yIChZQUdOSSkuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2RhdGFfcGxvdCcpLFxuICBudW1iZXI6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICAuLi5sYWJlbEZpZWxkcyxcbiAgcHJvbXB0OiB6LmFycmF5KElubGluZU5vZGUpLFxuICAvLyBUaGUgZGF0YXNldC4gU2luZ2xlIHNvdXJjZSBvZiB0cnV0aDogdGhlIGNoYXJ0IGlzIGRyYXduIGZyb20gaXQgYW5kLCBpblxuICAvLyBidWlsZCBtb2RlLCB0aGUgY29ycmVjdCBhbnN3ZXIgaXMgZGVyaXZlZCBmcm9tIGl0LiBOb24tZW1wdHkuXG4gIGRhdGE6IHouYXJyYXkoei5udW1iZXIoKSkubWluKDEpLFxuICBjb25maWc6IERhdGFQbG90Q29uZmlnLFxuICBpbnRlcmFjdGlvbjogRGF0YVBsb3RJbnRlcmFjdGlvbixcbiAgc29sdXRpb246IHouYXJyYXkoSW5saW5lTm9kZSkub3B0aW9uYWwoKSxcbiAgaGFzQ29uZmlkZW5jZVJhdGluZzogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gIHNraWxsczogei5hcnJheSh6LnN0cmluZygpKS5kZWZhdWx0KFtdKSxcbiAgLy8gVmFyaWFibGUgYmxvY2sgc2l6aW5nOiBvcHRpb25hbCB3aWR0aCBmcmFjdGlvbiArIGFsaWdubWVudCAoc2l6aW5nLnRzKS5cbiAgLy8gQWRkaXRpdmUvb3B0aW9uYWwgXHUyMDE0IG5vIHNjaGVtYVZlcnNpb24gYnVtcC5cbiAgLi4uc2l6aW5nRmllbGRzLFxufSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdEJsb2NrID0gei5pbmZlcjx0eXBlb2YgRGF0YVBsb3RCbG9jaz47XG4iLCAiaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XG5pbXBvcnQgeyBJbmxpbmVOb2RlIH0gZnJvbSAnLi4vaW5saW5lLmpzJztcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrIFx1MjAxNCBhIHRpdGxlZCBsaXN0IG9mIGxlYXJuaW5nIG9iamVjdGl2ZXMuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQSBwdXJlIENPTlRFTlQgYmxvY2sgKGRhdGEtYmxvY2stY2F0ZWdvcnk9XCJjb250ZW50XCIpOiBub24taW50ZXJhY3RpdmUsXG4vLyBub24tbnVtYmVyZWQsIG5vIHJ1bnRpbWUgd2lyaW5nLCBubyBzdWJtaXNzaW9uIHdpcmUgaW1wYWN0LiBQZWRhZ29naWNhbGx5IGl0XG4vLyBmcm9udHMgYW4gYWN0aXZpdHkgKG9yIGEgc2VjdGlvbikgd2l0aCB0aGUgXCJzdHVkZW50cyB3aWxsIGJlIGFibGUgdG9cdTIwMjZcIiBnb2Fsc1xuLy8gdGhhdCBTd2VsbGVyLXN0eWxlIHNjYWZmb2xkaW5nIGlzIGJ1aWx0IGFyb3VuZC5cbi8vXG4vLyBTaGFwZTogYW4gZWRpdGFibGUgYHRpdGxlYCAoZGVmYXVsdGVkLCBidXQgdGhlIHRlYWNoZXIgY2FuIHJlbmFtZSBpdCkgcGx1cyBhXG4vLyBsaXN0IG9mIGBpdGVtc2AsIGVhY2ggYSByaWNoIGlubGluZSBydW4gKHRleHQgKyBpbmxpbmUgbWF0aCArIG1hcmtzKSBcdTIwMTQgdGhlXG4vLyBzYW1lIGFscGhhYmV0IHBhcmFncmFwaHMgdXNlLiBJdGVtcyBtYXAgMToxIHRvIGVkaXRhYmxlIHBhcmFncmFwaHMgaW4gdGhlXG4vLyBlZGl0b3IgTm9kZVZpZXc7IHRoZSByZW5kZXJlciBlbWl0cyB0aGVtIGFzIGEgPHVsPi5cbi8vXG4vLyBgaXRlbXNgIG1heSBiZSBlbXB0eTogdGhlIGVkaXRvcidzIGNvbnRlbnQgc3BlYyBrZWVwcyBhdCBsZWFzdCBvbmUgcGFyYWdyYXBoXG4vLyBsaXZlLCBidXQgYSBzZXJpYWxpemVkIHJvdW5kLXRyaXAgY2FuIGxlZ2l0aW1hdGVseSBwcm9kdWNlIGFuIGVtcHR5IGxpc3Rcbi8vIChlLmcuIGV2ZXJ5IGl0ZW0gY2xlYXJlZCksIGFuZCB0aGF0IG11c3Qgbm90IGZhaWwgcHVibGlzaCB2YWxpZGF0aW9uLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnbGVhcm5pbmdfb2JqZWN0aXZlcycpLFxuICB0aXRsZTogei5zdHJpbmcoKSxcbiAgaXRlbXM6IHouYXJyYXkoei5hcnJheShJbmxpbmVOb2RlKSksXG59KTtcbmV4cG9ydCB0eXBlIExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrID0gei5pbmZlcjx0eXBlb2YgTGVhcm5pbmdPYmplY3RpdmVzQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgUGFyYWdyYXBoQmxvY2sgfSBmcm9tICcuL3BhcmFncmFwaC5qcyc7XG5pbXBvcnQgeyBIZWFkaW5nQmxvY2sgfSBmcm9tICcuL2hlYWRpbmcuanMnO1xuaW1wb3J0IHsgTWF0aEJsb2NrIH0gZnJvbSAnLi9tYXRoLWJsb2NrLmpzJztcbmltcG9ydCB7IEltYWdlQmxvY2sgfSBmcm9tICcuL2ltYWdlLmpzJztcbmltcG9ydCB7IEJ1bGxldExpc3RCbG9jaywgT3JkZXJlZExpc3RCbG9jayB9IGZyb20gJy4vbGlzdC5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBXb3JrZWRFeGFtcGxlQmxvY2sgXHUyMDE0IGEgdGl0bGVkLCBib3hlZCBmdWxseS13b3JrZWQgZXhhbXBsZSB0byBzdHVkeS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBBIHB1cmUgQ09OVEVOVCBibG9jayAoZGF0YS1ibG9jay1jYXRlZ29yeT1cImNvbnRlbnRcIik6IG5vbi1pbnRlcmFjdGl2ZSxcbi8vIG5vbi1udW1iZXJlZCwgbm8gcnVudGltZSB3aXJpbmcsIG5vIHN1Ym1pc3Npb24gd2lyZSBpbXBhY3QuIERyYXdzIG9uXG4vLyBTd2VsbGVyJ3MgY29nbml0aXZlLWxvYWQgdGhlb3J5IFx1MjAxNCBhIHdvcmtlZCBleGFtcGxlIGEgc3R1ZGVudCByZWFkcyBiZWZvcmVcbi8vIGF0dGVtcHRpbmcgdGhlIGFuYWxvZ291cyBwcm9ibGVtLlxuLy9cbi8vIFVubGlrZSBhIGNhbGxvdXQgKGlubGluZS1vbmx5IGJvZHkpLCBhIHdvcmtlZCBleGFtcGxlIGhvbGRzIE5FU1RFRCBCTE9DS1xuLy8gY29udGVudCBzbyBhIG11bHRpLXN0ZXAsIG1hdGgtaGVhdnkgc29sdXRpb24gcmVuZGVycyBwcm9wZXJseTogcGFyYWdyYXBocyxcbi8vIGJsb2NrIG1hdGgsIGxpc3RzLCBhbmQgaW1hZ2VzLiBUaGUgY2hpbGQgdW5pb24gaXMgZGVsaWJlcmF0ZWx5IGEgY3VyYXRlZFxuLy8gc3Vic2V0IG9mIHRoZSBCbG9jayB1bmlvbiBcdTIwMTQgbGVhZiBDT05URU5UIGJsb2NrcyBvbmx5LiBJdCBleGNsdWRlczpcbi8vICAgLSBxdWVzdGlvbiBibG9ja3MgKGEgd29ya2VkIGV4YW1wbGUgaXMgY29udGVudCwgbmV2ZXIgc2NvcmVkKSxcbi8vICAgLSBjb2x1bW5zIGFuZCB3b3JrZWRfZXhhbXBsZSBpdHNlbGYgKHNvIG5lc3RpbmcgdGVybWluYXRlcyBcdTIwMTQgbm8gcmVjdXJzaW9uLFxuLy8gICAgIHRoZSBzYW1lIGRpc2NpcGxpbmUgYXMgQ29sdW1uQ2VsbEJsb2NrIGZvcmJpZGRpbmcgY29sdW1ucy1pbi1jb2x1bW5zKS5cbi8vIFRoaXMgYWxzbyBrZWVwcyB0aGUgZGFzaGJvYXJkIGluZGV4IHVudG91Y2hlZDogYSB3b3JrZWQgZXhhbXBsZSBjYW4gbmV2ZXJcbi8vIGNvbnRhaW4gYSBxdWVzdGlvbiwgc28gYnVpbGRBY3Rpdml0eUluZGV4IG5ldmVyIG5lZWRzIHRvIHJlY3Vyc2UgaW50byBpdC5cbi8vXG4vLyBUaGUgc3Vic2V0IG1hdGNoZXMgdGhlIGVkaXRvci1tYXBwYWJsZSBjb250ZW50IG5vZGVzIDE6MSAoV29ya2VkRXhhbXBsZS50cydzXG4vLyBjb250ZW50IGV4cHJlc3Npb24pLCBzbyBzZXJpYWxpemUgcm91bmQtdHJpcHMgd2l0aG91dCBzaWxlbnRseSBkcm9wcGluZyBhXG4vLyBjaGlsZC4gYGNvbnRlbnRgIG1heSBiZSBlbXB0eSBmb3IgdGhlIHNhbWUgcmVhc29uIExlYXJuaW5nT2JqZWN0aXZlcy5pdGVtc1xuLy8gbWF5IGJlIFx1MjAxNCBhbiBhbGwtdW5tYXBwYWJsZSByb3VuZCB0cmlwIChlLmcuIGEgc2luZ2xlIGVtcHR5IGltYWdlKSBtdXN0IG5vdFxuLy8gZmFpbCBwdWJsaXNoIHZhbGlkYXRpb24uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgY29uc3QgV29ya2VkRXhhbXBsZUNoaWxkID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXG4gIFBhcmFncmFwaEJsb2NrLFxuICBIZWFkaW5nQmxvY2ssXG4gIE1hdGhCbG9jayxcbiAgSW1hZ2VCbG9jayxcbiAgQnVsbGV0TGlzdEJsb2NrLFxuICBPcmRlcmVkTGlzdEJsb2NrLFxuXSk7XG5leHBvcnQgdHlwZSBXb3JrZWRFeGFtcGxlQ2hpbGQgPSB6LmluZmVyPHR5cGVvZiBXb3JrZWRFeGFtcGxlQ2hpbGQ+O1xuXG5leHBvcnQgY29uc3QgV29ya2VkRXhhbXBsZUJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnd29ya2VkX2V4YW1wbGUnKSxcbiAgdGl0bGU6IHouc3RyaW5nKCksXG4gIGNvbnRlbnQ6IHouYXJyYXkoV29ya2VkRXhhbXBsZUNoaWxkKSxcbn0pO1xuZXhwb3J0IHR5cGUgV29ya2VkRXhhbXBsZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgV29ya2VkRXhhbXBsZUJsb2NrPjtcbiIsICJpbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IFBhcmFncmFwaEJsb2NrIH0gZnJvbSAnLi9wYXJhZ3JhcGguanMnO1xuaW1wb3J0IHsgSGVhZGluZ0Jsb2NrIH0gZnJvbSAnLi9oZWFkaW5nLmpzJztcbmltcG9ydCB7IE1hdGhCbG9jayB9IGZyb20gJy4vbWF0aC1ibG9jay5qcyc7XG5pbXBvcnQgeyBJbWFnZUJsb2NrIH0gZnJvbSAnLi9pbWFnZS5qcyc7XG5pbXBvcnQgeyBCdWxsZXRMaXN0QmxvY2ssIE9yZGVyZWRMaXN0QmxvY2sgfSBmcm9tICcuL2xpc3QuanMnO1xuaW1wb3J0IHsgRmlsbEluQmxhbmtCbG9jayB9IGZyb20gJy4vZmlsbC1pbi1ibGFuay5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBGYWRlZFdvcmtlZEV4YW1wbGVCbG9jayBcdTIwMTQgYSBzY2FmZm9sZGVkIChcImZhZGVkXCIpIHdvcmtlZCBleGFtcGxlLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBpbnRlcmFjdGl2ZSBzaWJsaW5nIG9mIHdvcmtlZF9leGFtcGxlIChSZW5rbC9BdGtpbnNvbiBjb21wbGV0aW9uXG4vLyBwcm9ibGVtcyk6IGVhcmx5IHN0ZXBzIGFyZSBmdWxseSBzaG93biwgbGF0ZXIgc3RlcHMgYXJlIEZBREVEIFx1MjAxNCB0aGUgc3R1ZGVudFxuLy8gZmlsbHMgdGhlbSBpbi4gU3RydWN0dXJhbGx5IGl0J3MgYSB3b3JrZWRfZXhhbXBsZSBmcmFtZSB3aG9zZSBjaGlsZCB1bmlvblxuLy8gQUxTTyBhZG1pdHMgZmlsbF9pbl9ibGFuayBibG9ja3M6IGEgc2hvd24gc3RlcCBpcyBhIHBhcmFncmFwaCAvIGJsb2NrIG1hdGggL1xuLy8gbGlzdCAvIGltYWdlOyBhIGZhZGVkIHN0ZXAgaXMgYSBmaWxsX2luX2JsYW5rIGJsb2NrIGNhcnJ5aW5nIHRoZSBibGFua3MuXG4vL1xuLy8gUmV1c2Ugb3ZlciByZWludmVudGlvbiAoZGVjaWRlZCBhdCBkZXNpZ24sIDIwMjYtMDctMTIpOlxuLy8gICAtIFRoZSBmYWRlZCBzdGVwcyBBUkUgZmlsbF9pbl9ibGFuayBibG9ja3MsIHNvIHRoZSBydW50aW1lIHNjb3JlcyB0aGVtIHdpdGhcbi8vICAgICBaRVJPIG5ldyBydW50aW1lIGNvZGUgXHUyMDE0IGluaXQudHMgYWxyZWFkeSBzY2FucyBlYWNoIC5hY3Rpdml0eS1zZWN0aW9uIGZvclxuLy8gICAgIGBbZGF0YS1ibG9jay10eXBlPVwiZmlsbF9pbl9ibGFua1wiXWAgYW5kIGZpbmRzIE5FU1RFRCBvbmVzLiBUaGV5IHJpZGUgdGhlXG4vLyAgICAgZXhpc3RpbmcgQmxhbmtSZXNwb25zZSBtYXAsIHNvIHRoZXJlIGlzIE5PIHN1Ym1pc3Npb24gd2lyZS9zdG9yYWdlIGJ1bXAuXG4vLyAgIC0gU2NvcmluZyByaWRlcyB0aGUgY2hpbGQgYmxhbmtzOyB0aGlzIGZyYW1lIHJlYWRzIG5vIHR5cGUtc3BlY2lmaWNcbi8vICAgICBhdHRyaWJ1dGVzIGl0c2VsZiBcdTIxOTIgaXQgaXMgYSBDT05UQUlORVIgKGxpa2UgYHByb2JsZW1gKSwgbm90IElOVEVSQUNUSVZFLlxuLy8gICAtIE51bWJlcmluZyAocmV2aXNlZCAyMDI2LTA3LTEzKTogdGhlIFdIT0xFIGJveCBpcyBvbmUgbnVtYmVyZWQgcHJvYmxlbSBcdTIwMTRcbi8vICAgICBpdHMgbnVtYmVyIGxlYWRzIHRoZSB0aXRsZSwgYW5kIHRoZSBmYWRlZCBmaWxsX2luX2JsYW5rIHN0ZXBzIGFyZSBsZXR0ZXJlZFxuLy8gICAgIChhKS8oYilcdTIwMjYgTE9DQUxMWSAoc2hvd1N0ZXBMYWJlbHMgdG9nZ2xlcyB0aGVtIG9mZiksIHNvIHRoZXkgbm8gbG9uZ2VyXG4vLyAgICAgY29uc3VtZSB3b3Jrc2hlZXQgcHJvYmxlbSBudW1iZXJzLiBTZWUgcmVuZGVyRmFkZWRXb3JrZWRFeGFtcGxlIGFuZCB0aGVcbi8vICAgICBlZGl0b3IncyBwcm9ibGVtTnVtYmVyQXQgKHdoaWNoIHRyZWF0cyB0aGUgYm94IGFzIGF0b21pYykuIFRoaXMgcmV2ZXJzZWRcbi8vICAgICB0aGUgb3JpZ2luYWwgXCJzdGVwcyBudW1iZXIgYXMgb3JkaW5hcnkgcHJvYmxlbXNcIiBjaG9pY2UsIHdoaWNoIHdhc3RlZFxuLy8gICAgIHdyaXRpbmcvcHJpbnQgd2lkdGggYW5kIHBvbGx1dGVkIHRoZSB3b3Jrc2hlZXQncyBudW1iZXJpbmcuXG4vL1xuLy8gVGhlIGNoaWxkIHVuaW9uIHN0aWxsIGV4Y2x1ZGVzIHF1ZXN0aW9ucyBPVEhFUiB0aGFuIGZpbGxfaW5fYmxhbmssIHBsdXNcbi8vIGNvbHVtbnMgLyB3b3JrZWRfZXhhbXBsZSAvIGZhZGVkX3dvcmtlZF9leGFtcGxlIGl0c2VsZiBcdTIwMTQgc28gbmVzdGluZ1xuLy8gdGVybWluYXRlcyBhbmQgdGhlIGRhc2hib2FyZCBpbmRleCByZWN1cnNlcyBvbmx5IG9uZSBwcmVkaWN0YWJsZSBsZXZlbC5cbi8vIGBjb250ZW50YCBtYXkgYmUgZW1wdHkgZm9yIHRoZSBzYW1lIHJvdW5kLXRyaXAtc2FmZXR5IHJlYXNvbiBhc1xuLy8gd29ya2VkX2V4YW1wbGUuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5leHBvcnQgY29uc3QgRmFkZWRXb3JrZWRFeGFtcGxlQ2hpbGQgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgUGFyYWdyYXBoQmxvY2ssXG4gIEhlYWRpbmdCbG9jayxcbiAgTWF0aEJsb2NrLFxuICBJbWFnZUJsb2NrLFxuICBCdWxsZXRMaXN0QmxvY2ssXG4gIE9yZGVyZWRMaXN0QmxvY2ssXG4gIEZpbGxJbkJsYW5rQmxvY2ssXG5dKTtcbmV4cG9ydCB0eXBlIEZhZGVkV29ya2VkRXhhbXBsZUNoaWxkID0gei5pbmZlcjx0eXBlb2YgRmFkZWRXb3JrZWRFeGFtcGxlQ2hpbGQ+O1xuXG5leHBvcnQgY29uc3QgRmFkZWRXb3JrZWRFeGFtcGxlQmxvY2sgPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgdHlwZTogei5saXRlcmFsKCdmYWRlZF93b3JrZWRfZXhhbXBsZScpLFxuICB0aXRsZTogei5zdHJpbmcoKSxcbiAgY29udGVudDogei5hcnJheShGYWRlZFdvcmtlZEV4YW1wbGVDaGlsZCksXG4gIC8vIFRoZSB3aG9sZSBib3ggaXMgT05FIG51bWJlcmVkIHByb2JsZW0gKGl0cyBudW1iZXIgbGVhZHMgdGhlIHRpdGxlKTsgdGhlXG4gIC8vIGZhZGVkIGZpbGxfaW5fYmxhbmsgc3RlcHMgYXJlIGxldHRlcmVkIChhKSwgKGIpXHUyMDI2IFdJVEhJTiB0aGUgYm94IGluc3RlYWQgb2ZcbiAgLy8gY29uc3VtaW5nIHdvcmtzaGVldCBwcm9ibGVtIG51bWJlcnMuIHNob3dTdGVwTGFiZWxzIHRvZ2dsZXMgdGhvc2UgbGV0dGVyc1xuICAvLyBvZmYgcGVyIGJveCAoYmFyZSBibGFua3MsIG5vIGd1dHRlcikgZm9yIHRlYWNoZXJzIHdobyB3YW50IG1heGltdW0gd3JpdGluZ1xuICAvLyByb29tLiBEZWZhdWx0ZWQgc28gcHJlLWV4aXN0aW5nIGRvY3VtZW50cyAobm8gZmllbGQpIHJlbmRlciBsYWJlbGxlZC5cbiAgc2hvd1N0ZXBMYWJlbHM6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG59KTtcbmV4cG9ydCB0eXBlIEZhZGVkV29ya2VkRXhhbXBsZUJsb2NrID0gei5pbmZlcjx0eXBlb2YgRmFkZWRXb3JrZWRFeGFtcGxlQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBTZWxmRXhwbGFuYXRpb25CbG9jayBcdTIwMTQgYW4gdW5ncmFkZWQgZnJlZS10ZXh0IHJlZmxlY3Rpb24gcHJvbXB0LlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE1ldGFjb2duaXRpdmUgc2VsZi1leHBsYW5hdGlvbiAoQ2hpIGV0IGFsLik6IHRoZSBzdHVkZW50IHdyaXRlcyBXSFksIGluIHRoZWlyXG4vLyBvd24gd29yZHMuIERlbGliZXJhdGVseSBVTkdSQURFRCAoYXV0aG9yIGRlY2lzaW9uLCAyMDI2LTA3LTEyKSBcdTIwMTQgdGhlIHJ1bnRpbWVcbi8vIGNhcHR1cmVzIHRoZSB0ZXh0IGFuZCB0aGUgdGVhY2hlciBkYXNoYm9hcmQgc2hvd3MgaXQgcmF3OyB0aGVyZSBpcyBubyBhbnN3ZXJcbi8vIGtleSwgbm8gY29ycmVjdC9pbmNvcnJlY3QsIGFuZCBpdCBuZXZlciBjb250cmlidXRlcyB0byB0aGUgc2NvcmUuIFRoaXMga2VlcHNcbi8vIGl0IGNsZWFyIG9mIFBoYXNlIDIuNiBydWJyaWMgZ3JhZGluZy5cbi8vXG4vLyBJdCBpcyB0aGUgRklSU1QgZnJlZS10ZXh0IHJlc3BvbnNlIHR5cGUsIHNvIGl0IGludHJvZHVjZXMgdGhlIGBmcmVlUmVzcG9uc2VzYFxuLy8gbWFwIG9uIFN1Ym1pc3Npb25SZXNwb25zZXMgKHdpcmUgdjggXHUyMTkyIHY5KSBcdTIwMTQgdGhlIG1hcCBuYW1lIHRoZSBzY2hlbWEgcmVzZXJ2ZWRcbi8vIGZvciBleGFjdGx5IHRoaXMgc2hhcGUuIFBoYXNlIDIuNiBzaG9ydF9hbnN3ZXIgLyBlc3NheSByZXVzZSB0aGUgc2FtZSBtYXAgKGFcbi8vIHN0cmluZyBwZXIgYmxvY2spIHdpdGggbm8gZnVydGhlciB3aXJlIGJ1bXA7IGdyYWRpbmcsIHdoZW4gaXQgbGFuZHMsIGxpdmVzIGluXG4vLyBhIHNlcGFyYXRlIHRhYmxlLCBub3QgaW4gdGhlIHJlc3BvbnNlIHNoYXBlLlxuLy9cbi8vIFNoYXBlOiBhIGBwcm9tcHRgIChyaWNoIGlubGluZSBcdTIwMTQgdGV4dCArIGlubGluZSBtYXRoICsgbWFya3MsIGxpa2UgZXZlcnkgb3RoZXJcbi8vIHF1ZXN0aW9uIHByb21wdCkgcGx1cyBhbiBvcHRpb25hbCBgcGxhY2Vob2xkZXJgIChhIHNlbnRlbmNlLXN0YXJ0ZXIgLyBoaW50XG4vLyBzaG93biBpbiB0aGUgZW1wdHkgdGV4dGFyZWEpLiBObyBhbnN3ZXIga2V5LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IFNlbGZFeHBsYW5hdGlvbkJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnc2VsZl9leHBsYW5hdGlvbicpLFxuICBwcm9tcHQ6IHouYXJyYXkoSW5saW5lTm9kZSksXG4gIHBsYWNlaG9sZGVyOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFNlbGZFeHBsYW5hdGlvbkJsb2NrID0gei5pbmZlcjx0eXBlb2YgU2VsZkV4cGxhbmF0aW9uQmxvY2s+O1xuIiwgImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuaW1wb3J0IHsgSW5saW5lTm9kZSB9IGZyb20gJy4uL2lubGluZS5qcyc7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBmcmVlLXJlc3BvbnNlLnRzIFx1MjAxNCBzaG9ydF9hbnN3ZXIgKyBlc3NheSAobWFudWFsbHktZ3JhZGVkIGZyZWUgdGV4dClcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgUGhhc2UgMi42IGdyYWRlZCBmcmVlLXRleHQgc2libGluZ3Mgb2Ygc2VsZl9leHBsYW5hdGlvbi4gQWxsIHRocmVlIHdyaXRlXG4vLyB0aGVpciBzdHVkZW50IHRleHQgaW50byB0aGUgU0FNRSBgZnJlZVJlc3BvbnNlc2AgbWFwICh3aXJlIHY5KSBcdTIwMTQgdGhlIHJlc3BvbnNlXG4vLyBzaGFwZSBpcyBpZGVudGljYWwgKGEgc3RyaW5nKTsgd2hhdCBkaWZmZXJzIGlzIGludGVudCArIGdyYWRpbmc6XG4vLyAgIC0gc2VsZl9leHBsYW5hdGlvbiBcdTIwMTQgdW5ncmFkZWQgcmVmbGVjdGlvbiAoYWxyZWFkeSBzaGlwcGVkKS5cbi8vICAgLSBzaG9ydF9hbnN3ZXIgICAgIFx1MjAxNCBhIGJyaWVmIGdyYWRlZCByZXNwb25zZSAobWFudWFsIHJ1YnJpYyBncmFkaW5nLCAyLjYpLlxuLy8gICAtIGVzc2F5ICAgICAgICAgICAgXHUyMDE0IGEgbG9uZyBncmFkZWQgcmVzcG9uc2U7IGFkZHMgb3B0aW9uYWwgd29yZC1jb3VudFxuLy8gICAgICAgICAgICAgICAgICAgICAgICBndWlkYW5jZSAoYSB0YXJnZXQgcmFuZ2Ugc2hvd24gYXMgYSBsaXZlIGNvdW50ZXIpLlxuLy8gR3JhZGluZyBpdHNlbGYgbGl2ZXMgaW4gYSBzZXBhcmF0ZSBgZ3JhZGVzYCB0YWJsZSAoUGhhc2UgMi42IGxhdGVyIHNsaWNlcyksXG4vLyBuZXZlciBpbiB0aGUgc3VibWlzc2lvbiBqc29uYiBcdTIwMTQgZ3JhZGVzIGFyZSBtdXRhYmxlLCBzdWJtaXNzaW9ucyBhcmUgbm90LiBUaGVzZVxuLy8gYmxvY2tzIGNhcnJ5IE5PIGFuc3dlciBrZXkgYW5kIGFyZSBuZXZlciBhdXRvLXNjb3JlZCBieSB0aGUgcnVudGltZS5cbi8vXG4vLyB3b3JkQ291bnRIaW50IChlc3NheSBvbmx5KTogYW4gb3B0aW9uYWwge21pbj8sIG1heD99IHRhcmdldC4gVGhlIHJlbmRlcmVyXG4vLyBzaG93cyBhIGxpdmUgd29yZCBjb3VudGVyOyB0aGUgY291bnQgaXRzZWxmIGlzIGNvbXB1dGVkLW9uLXJlYWQgKG5ldmVyIHN0b3JlZFxuLy8gaW4gdGhlIHdpcmUgXHUyMDE0IGl0J3MgZGVyaXZhYmxlIGZyb20gdGhlIHRleHQpLCBzbyB0aGlzIGlzIGRpc3BsYXkgZ3VpZGFuY2Ugb25seS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIE9uZSBydWJyaWMgY3JpdGVyaW9uOiBhIGxhYmVsIChcIlRoZXNpcyBjbGFyaXR5XCIpLCB0aGUgcG9pbnRzIGl0J3Mgd29ydGgsIGFuZFxuLy8gYW4gb3B0aW9uYWwgZGVzY3JpcHRpb24gb2Ygd2hhdCBmdWxsIGNyZWRpdCBsb29rcyBsaWtlLiBMZXZlbGVkIGRlc2NyaXB0b3Jcbi8vIGdyaWRzICg0LzMvMi8xIGNvbHVtbnMpIGFyZSBhIGZ1dHVyZSBBRERJVElWRSBleHRlbnNpb24gb2YgdGhpcyBzaGFwZS5cbmV4cG9ydCBjb25zdCBSdWJyaWNDcml0ZXJpb24gPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgbGFiZWw6IHouc3RyaW5nKCkubWluKDEpLFxuICBtYXhQb2ludHM6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5maW5pdGUoKSxcbiAgZGVzY3JpcHRpb246IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgUnVicmljQ3JpdGVyaW9uID0gei5pbmZlcjx0eXBlb2YgUnVicmljQ3JpdGVyaW9uPjtcblxuLy8gQSBibG9jaydzIGdyYWRpbmcgcnVicmljLiBMaXZlcyBJTiB0aGUgZG9jdW1lbnQgKGF1dGhvciBkZWNpc2lvbiAyMDI2LTA3LTEzLFxuLy8gZG9jcy9kZXNpZ24vbWFudWFsLWdyYWRpbmcubWQpOiBzdWJtaXNzaW9ucyBwaW4gdG8gYWN0aXZpdHlfdmVyc2lvbnMsIHNvIHRoZVxuLy8gZ3JhZGluZyBVSSByZWFkcyB0aGUgZXhhY3QgcnVicmljIHRoZSBzdHVkZW50IHdhcyBhc3Nlc3NlZCBhZ2FpbnN0IFx1MjAxNCB2ZXJzaW9uXG4vLyBwaW5uaW5nIElTIHRoZSBcInJ1YnJpYyBlZGl0cyBhcHBseSBwcm9zcGVjdGl2ZWx5XCIgbWVjaGFuaXNtLiBUaGUgcmVuZGVyZXJcbi8vIG5ldmVyIGVtaXRzIGl0ICh0ZWFjaGVyLXNpZGUgZGF0YTsgc3RheXMgb3V0IG9mIHN0dWRlbnQgSFRNTCkuIEdyYWRlc1xuLy8gdGhlbXNlbHZlcyBhcmUgbXV0YWJsZSBhbmQgbGl2ZSBpbiB0aGUgYGdyYWRlc2AgVEFCTEUsIGtleWVkIGJ5XG4vLyAoc3VibWlzc2lvbl9pZCwgYmxvY2tfaWQpICsgY3JpdGVyaW9uIGlkLlxuZXhwb3J0IGNvbnN0IFJ1YnJpYyA9IHoub2JqZWN0KHtcbiAgY3JpdGVyaWE6IHouYXJyYXkoUnVicmljQ3JpdGVyaW9uKS5taW4oMSksXG59KTtcbmV4cG9ydCB0eXBlIFJ1YnJpYyA9IHouaW5mZXI8dHlwZW9mIFJ1YnJpYz47XG5cbmV4cG9ydCBjb25zdCBTaG9ydEFuc3dlckJsb2NrID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIHR5cGU6IHoubGl0ZXJhbCgnc2hvcnRfYW5zd2VyJyksXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgcGxhY2Vob2xkZXI6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgcnVicmljOiBSdWJyaWMub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgU2hvcnRBbnN3ZXJCbG9jayA9IHouaW5mZXI8dHlwZW9mIFNob3J0QW5zd2VyQmxvY2s+O1xuXG5leHBvcnQgY29uc3QgV29yZENvdW50SGludCA9IHpcbiAgLm9iamVjdCh7XG4gICAgbWluOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCkub3B0aW9uYWwoKSxcbiAgICBtYXg6IHoubnVtYmVyKCkuaW50KCkucG9zaXRpdmUoKS5vcHRpb25hbCgpLFxuICB9KVxuICAvLyBHdWFyZCBhZ2FpbnN0IGFuIGludmVydGVkIHJhbmdlIChtaW4gPiBtYXgpIFx1MjAxNCBhIG5vbnNlbnNlIGhpbnQgdGhlIGVkaXRvclxuICAvLyBzaG91bGRuJ3QgYmUgYWJsZSB0byBwcm9kdWNlLCBidXQgdmFsaWRhdGlvbiBpcyB0aGUgc2NoZW1hJ3Mgam9iLlxuICAucmVmaW5lKFxuICAgIChoKSA9PiBoLm1pbiA9PT0gdW5kZWZpbmVkIHx8IGgubWF4ID09PSB1bmRlZmluZWQgfHwgaC5taW4gPD0gaC5tYXgsXG4gICAgeyBtZXNzYWdlOiAnd29yZENvdW50SGludC5taW4gbXVzdCBiZSBcdTIyNjQgbWF4JyB9LFxuICApO1xuZXhwb3J0IHR5cGUgV29yZENvdW50SGludCA9IHouaW5mZXI8dHlwZW9mIFdvcmRDb3VudEhpbnQ+O1xuXG5leHBvcnQgY29uc3QgRXNzYXlCbG9jayA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICB0eXBlOiB6LmxpdGVyYWwoJ2Vzc2F5JyksXG4gIHByb21wdDogei5hcnJheShJbmxpbmVOb2RlKSxcbiAgcGxhY2Vob2xkZXI6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgd29yZENvdW50SGludDogV29yZENvdW50SGludC5vcHRpb25hbCgpLFxuICBydWJyaWM6IFJ1YnJpYy5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBFc3NheUJsb2NrID0gei5pbmZlcjx0eXBlb2YgRXNzYXlCbG9jaz47XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGJsb2Nrcy9pbmRleC50cyBcdTIwMTQgQmxvY2sgZGlzY3JpbWluYXRlZCB1bmlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNpbmdsZSBzb3VyY2Ugb2YgdHJ1dGggZm9yIFwid2hhdCBibG9jayB0eXBlcyBleGlzdCBpbiBQaGFzZSAxLlwiIEFkZGluZyBhXG4vLyBuZXcgYmxvY2sgdHlwZSBtZWFuczogbmV3IGZpbGUgdW5kZXIgYmxvY2tzLywgbmV3IGVudHJ5IGhlcmUsIG5ldyBmYWN0b3J5XG4vLyBpbiBmYWN0b3JpZXMudHMsIG5ldyByZW5kZXJlciBpbiBAYWN0aXZpdHkvcmVuZGVyZXIvYmxvY2tzLy4gVGhyZWUgcGxhY2VzLFxuLy8gYWx3YXlzIGluIHRoYXQgb3JkZXIuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcblxuaW1wb3J0IHsgUGFyYWdyYXBoQmxvY2sgfSBmcm9tICcuL3BhcmFncmFwaC5qcyc7XG5pbXBvcnQgeyBIZWFkaW5nQmxvY2sgfSBmcm9tICcuL2hlYWRpbmcuanMnO1xuaW1wb3J0IHsgTWF0aEJsb2NrIH0gZnJvbSAnLi9tYXRoLWJsb2NrLmpzJztcbmltcG9ydCB7IEltYWdlQmxvY2ssIENyb3BSZWN0IH0gZnJvbSAnLi9pbWFnZS5qcyc7XG5pbXBvcnQgeyBDYWxsb3V0QmxvY2sgfSBmcm9tICcuL2NhbGxvdXQuanMnO1xuaW1wb3J0IHsgUHJvYmxlbUJsb2NrIH0gZnJvbSAnLi9wcm9ibGVtLmpzJztcbmltcG9ydCB7IEZpbGxJbkJsYW5rQmxvY2sgfSBmcm9tICcuL2ZpbGwtaW4tYmxhbmsuanMnO1xuaW1wb3J0IHsgQnVsbGV0TGlzdEJsb2NrLCBPcmRlcmVkTGlzdEJsb2NrLCBMaXN0SXRlbSB9IGZyb20gJy4vbGlzdC5qcyc7XG5pbXBvcnQgeyBJbnRlcmFjdGl2ZUdyYXBoQmxvY2sgfSBmcm9tICcuL2ludGVyYWN0aXZlLWdyYXBoLmpzJztcbmltcG9ydCB7IE11bHRpcGxlQ2hvaWNlQmxvY2sgfSBmcm9tICcuL211bHRpcGxlLWNob2ljZS5qcyc7XG5pbXBvcnQgeyBNYXRjaGluZ0Jsb2NrIH0gZnJvbSAnLi9tYXRjaGluZy5qcyc7XG5pbXBvcnQgeyBPcmRlcmluZ0Jsb2NrIH0gZnJvbSAnLi9vcmRlcmluZy5qcyc7XG5pbXBvcnQgeyBOdW1iZXJMaW5lQmxvY2sgfSBmcm9tICcuL251bWJlci1saW5lLmpzJztcbmltcG9ydCB7IERhdGFQbG90QmxvY2sgfSBmcm9tICcuL2RhdGEtcGxvdC5qcyc7XG5pbXBvcnQgeyBMZWFybmluZ09iamVjdGl2ZXNCbG9jayB9IGZyb20gJy4vbGVhcm5pbmctb2JqZWN0aXZlcy5qcyc7XG5pbXBvcnQgeyBXb3JrZWRFeGFtcGxlQmxvY2sgfSBmcm9tICcuL3dvcmtlZC1leGFtcGxlLmpzJztcbmltcG9ydCB7IEdyYXBoRmlndXJlQmxvY2sgfSBmcm9tICcuL2dyYXBoLWZpZ3VyZS5qcyc7XG5pbXBvcnQgeyBGYWRlZFdvcmtlZEV4YW1wbGVCbG9jayB9IGZyb20gJy4vZmFkZWQtd29ya2VkLWV4YW1wbGUuanMnO1xuaW1wb3J0IHsgU2VsZkV4cGxhbmF0aW9uQmxvY2sgfSBmcm9tICcuL3NlbGYtZXhwbGFuYXRpb24uanMnO1xuaW1wb3J0IHsgU2hvcnRBbnN3ZXJCbG9jaywgRXNzYXlCbG9jayB9IGZyb20gJy4vZnJlZS1yZXNwb25zZS5qcyc7XG5cbmV4cG9ydCBjb25zdCBCbG9jayA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBQYXJhZ3JhcGhCbG9jayxcbiAgSGVhZGluZ0Jsb2NrLFxuICBNYXRoQmxvY2ssXG4gIEltYWdlQmxvY2ssXG4gIENhbGxvdXRCbG9jayxcbiAgUHJvYmxlbUJsb2NrLFxuICBGaWxsSW5CbGFua0Jsb2NrLFxuICBCdWxsZXRMaXN0QmxvY2ssXG4gIE9yZGVyZWRMaXN0QmxvY2ssXG4gIEludGVyYWN0aXZlR3JhcGhCbG9jayxcbiAgTXVsdGlwbGVDaG9pY2VCbG9jayxcbiAgTWF0Y2hpbmdCbG9jayxcbiAgT3JkZXJpbmdCbG9jayxcbiAgTnVtYmVyTGluZUJsb2NrLFxuICBEYXRhUGxvdEJsb2NrLFxuICBMZWFybmluZ09iamVjdGl2ZXNCbG9jayxcbiAgV29ya2VkRXhhbXBsZUJsb2NrLFxuICBGYWRlZFdvcmtlZEV4YW1wbGVCbG9jayxcbiAgU2VsZkV4cGxhbmF0aW9uQmxvY2ssXG4gIFNob3J0QW5zd2VyQmxvY2ssXG4gIEVzc2F5QmxvY2ssXG4gIEdyYXBoRmlndXJlQmxvY2ssXG5dKTtcbmV4cG9ydCB0eXBlIEJsb2NrID0gei5pbmZlcjx0eXBlb2YgQmxvY2s+O1xuXG4vLyBOT1RFOiBsYXlvdXQgaXMgTk9UIGEgYmxvY2suIFJvd3MvQ29sdW1ucyAocGFja2FnZXMvc2NoZW1hL3NyYy9sYXlvdXQudHMpIGFyZVxuLy8gdGhlIHN0cnVjdHVyYWwgY29udGFpbmVyIEFCT1ZFIGJsb2NrcyBcdTIwMTQgYSBDb2x1bW4gaG9sZHMgQmxvY2tbXSwgbmV2ZXIgdGhlXG4vLyByZXZlcnNlIFx1MjAxNCBzbyB0aGUgQmxvY2sgdW5pb24gaXMgbGVhZiBibG9ja3Mgb25seSBhbmQgY2FuIG5ldmVyIG5lc3QgYSByb3cuXG5cbi8vIFJlLWV4cG9ydCBpbmRpdmlkdWFsIGJsb2NrIHR5cGVzIHNvIGNvbnN1bWVycyBjYW4gaW1wb3J0IHRoZW0gYnkgbmFtZS5cbmV4cG9ydCB7XG4gIFBhcmFncmFwaEJsb2NrLFxuICBIZWFkaW5nQmxvY2ssXG4gIE1hdGhCbG9jayxcbiAgSW1hZ2VCbG9jayxcbiAgQ3JvcFJlY3QsXG4gIENhbGxvdXRCbG9jayxcbiAgUHJvYmxlbUJsb2NrLFxuICBGaWxsSW5CbGFua0Jsb2NrLFxuICBCdWxsZXRMaXN0QmxvY2ssXG4gIE9yZGVyZWRMaXN0QmxvY2ssXG4gIExpc3RJdGVtLFxuICBJbnRlcmFjdGl2ZUdyYXBoQmxvY2ssXG59O1xuZXhwb3J0IHtcbiAgTXVsdGlwbGVDaG9pY2VCbG9jayxcbiAgTXVsdGlwbGVDaG9pY2VPcHRpb24sXG4gIENob2ljZUltYWdlLFxuICBDaG9pY2VHcmFwaCxcbn0gZnJvbSAnLi9tdWx0aXBsZS1jaG9pY2UuanMnO1xuZXhwb3J0IHsgTWF0Y2hpbmdCbG9jaywgTWF0Y2hpbmdJdGVtLCBNYXRjaGluZ1RhcmdldCB9IGZyb20gJy4vbWF0Y2hpbmcuanMnO1xuZXhwb3J0IHsgT3JkZXJpbmdCbG9jaywgT3JkZXJpbmdJdGVtIH0gZnJvbSAnLi9vcmRlcmluZy5qcyc7XG5leHBvcnQge1xuICBOdW1iZXJMaW5lQmxvY2ssXG4gIE51bWJlckxpbmVDb25maWcsXG4gIE51bWJlckxpbmVJbnRlcmFjdGlvbixcbiAgTnVtYmVyTGluZVBvaW50SW50ZXJhY3Rpb24sXG4gIE51bWJlckxpbmVJbnRlcnZhbEludGVyYWN0aW9uLFxuICBOdW1iZXJMaW5lSW50ZXJ2YWwsXG59IGZyb20gJy4vbnVtYmVyLWxpbmUuanMnO1xuZXhwb3J0IHtcbiAgRGF0YVBsb3RCbG9jayxcbiAgRGF0YVBsb3RDb25maWcsXG4gIERhdGFQbG90Q2hhcnQsXG4gIERhdGFQbG90SW50ZXJhY3Rpb24sXG4gIERhdGFQbG90RGlzcGxheUludGVyYWN0aW9uLFxuICBEYXRhUGxvdERvdHBsb3RJbnRlcmFjdGlvbixcbiAgRGF0YVBsb3RIaXN0b2dyYW1JbnRlcmFjdGlvbixcbiAgRGF0YVBsb3RCb3hwbG90SW50ZXJhY3Rpb24sXG59IGZyb20gJy4vZGF0YS1wbG90LmpzJztcbmV4cG9ydCB7IExlYXJuaW5nT2JqZWN0aXZlc0Jsb2NrIH0gZnJvbSAnLi9sZWFybmluZy1vYmplY3RpdmVzLmpzJztcbmV4cG9ydCB7IFdvcmtlZEV4YW1wbGVCbG9jaywgV29ya2VkRXhhbXBsZUNoaWxkIH0gZnJvbSAnLi93b3JrZWQtZXhhbXBsZS5qcyc7XG5leHBvcnQgeyBHcmFwaEZpZ3VyZUJsb2NrIH0gZnJvbSAnLi9ncmFwaC1maWd1cmUuanMnO1xuZXhwb3J0IHtcbiAgRmFkZWRXb3JrZWRFeGFtcGxlQmxvY2ssXG4gIEZhZGVkV29ya2VkRXhhbXBsZUNoaWxkLFxufSBmcm9tICcuL2ZhZGVkLXdvcmtlZC1leGFtcGxlLmpzJztcbmV4cG9ydCB7IFNlbGZFeHBsYW5hdGlvbkJsb2NrIH0gZnJvbSAnLi9zZWxmLWV4cGxhbmF0aW9uLmpzJztcbmV4cG9ydCB7XG4gIFNob3J0QW5zd2VyQmxvY2ssXG4gIEVzc2F5QmxvY2ssXG4gIFdvcmRDb3VudEhpbnQsXG4gIFJ1YnJpYyxcbiAgUnVicmljQ3JpdGVyaW9uLFxufSBmcm9tICcuL2ZyZWUtcmVzcG9uc2UuanMnO1xuZXhwb3J0IHtcbiAgQXhpc0NvbmZpZyxcbiAgUG9pbnRJbnRlcmFjdGlvbixcbiAgRnVuY3Rpb25JbnRlcmFjdGlvbixcbiAgRnVuY3Rpb25Nb2RlbCxcbiAgUmVnaW9uSW50ZXJhY3Rpb24sXG4gIFJheUludGVyYWN0aW9uLFxuICBSYXlBbnN3ZXIsXG4gIFNlZ21lbnRJbnRlcmFjdGlvbixcbiAgU2VnbWVudEFuc3dlcixcbiAgRW5kcG9pbnRTdHlsZSxcbiAgRHJhd2FibGUsXG4gIERyYXdhYmxlQ29sb3IsXG4gIERpc3BsYXlJbnRlcmFjdGlvbixcbiAgR3JhcGhJbnRlcmFjdGlvbixcbn0gZnJvbSAnLi9pbnRlcmFjdGl2ZS1ncmFwaC5qcyc7XG5leHBvcnQgdHlwZSB7IEhlYWRpbmdMZXZlbCB9IGZyb20gJy4vaGVhZGluZy5qcyc7XG5leHBvcnQgdHlwZSB7IENhbGxvdXRWYXJpYW50IH0gZnJvbSAnLi9jYWxsb3V0LmpzJztcbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gbGF5b3V0LnRzIFx1MjAxNCBTdHJ1Y3R1cmFsIGxheW91dCBsYXllcjogUm93ICsgQ29sdW1uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIGRvY3VtZW50IGJvZHkgaXMgYSBzdGFjayBvZiBST1dTLiBBIHJvdyBsYXlzIGl0cyBjaGlsZCBjb2x1bW5zIHNpZGUgYnlcbi8vIHNpZGU7IGVhY2ggY29sdW1uIGhvbGRzIGl0cyBvd24gU1RBQ0sgb2YgYmxvY2tzIChibG9jayspLiBPbmUgY29sdW1uIGlzIHRoZVxuLy8gaWRlbnRpdHkvZGVmYXVsdCBcdTIwMTQgYSAxLWNvbHVtbiByb3cgaXMgdGhlIG5vcm1hbCBmdWxsLXdpZHRoIHZlcnRpY2FsIGZsb3csIGFuZFxuLy8gXCJhZGQgY29sdW1uc1wiIHNwbGl0cyBhIHJvdyBpbnRvIG1vcmUgY29sdW1ucy4gVGhpcyByZXBsYWNlcyB0aGUgb2xkIGBjb2x1bW5zYFxuLy8gYmxvY2sgdHlwZTogbGF5b3V0IGlzIG5vdyB0aGUgdW5pdmVyc2FsIGNvbnRhaW5lciBpbnN0ZWFkIG9mIGFuIGluc2VydGVkXG4vLyBibG9jaywgd2hpY2ggaXMgaG93IHF1YWxpdHkgcHJpbnQgZW5naW5lcyAoSW5EZXNpZ24sIHByaW50IENTUykgYW5kIHdlYlxuLy8gbGF5b3V0IHRvb2xzIG1vZGVsIGEgZG9jdW1lbnQuXG4vL1xuLy8gTm8gcmVjdXJzaW9uOiBgcm93YCBhbmQgYGNvbHVtbmAgYXJlIE5PVCBtZW1iZXJzIG9mIHRoZSBCbG9jayB1bmlvbiAoQmxvY2sgaXNcbi8vIGxlYWYgYmxvY2tzIG9ubHkpLCBzbyBhIENvbHVtbidzIGBibG9ja3M6IEJsb2NrW11gIGNhbiBuZXZlciBjb250YWluIGEgUm93LlxuLy8gVGhlIG9sZCBjb2x1bW5zLWluLWNvbHVtbnMgZ3VhcmQgKGFuIGVudW1lcmF0ZWQgY2VsbCB1bmlvbikgaXMgdGhlcmVmb3JlIGFcbi8vIHN0cnVjdHVyYWwgZmFjdCBoZXJlLCBub3QgYW4gZW5mb3JjZWQgZXhjbHVzaW9uLlxuLy9cbi8vIHdpZHRoIGlzIGFuIG9wdGlvbmFsIHVuaXRsZXNzIHdlaWdodCBwZXIgY29sdW1uOiBhIGNvbHVtbiB3aXRoIHdpZHRoIDIgYmVzaWRlXG4vLyBhIGNvbHVtbiB3aXRoIHdpZHRoIDEgdGFrZXMgMi8zIG9mIHRoZSByb3cuIEFic2VudCBcdTIxOTIgZXF1YWwgc3BsaXQuIFRoaXMgaXMgdGhlXG4vLyByZWFzb24gbGF5b3V0IGlzIHN0cnVjdHVyYWwgcmF0aGVyIHRoYW4gYSBDU1MgdG9nZ2xlIFx1MjAxNCBcIndpZGUgd29ya2VkIGV4YW1wbGUgK1xuLy8gbmFycm93IGFuc3dlciBzdHJpcFwiIG5lZWRzIHVuZXF1YWwgd2lkdGhzLlxuLy9cbi8vIG1pbkhlaWdodCBpcyBhIHJlc2VydmVkIHdvcmstc3BhY2UgZmxvb3IgaW4gcmVtLiBUaGUgY2VsbCBzdGlsbCBHUk9XUyB3aXRoXG4vLyBjb250ZW50IChhIGZsb29yLCBub3QgYSBmaXhlZCBoZWlnaHQgXHUyMDE0IGZpeGVkIGhlaWdodHMgYnJlYWsgcHJpbnQgcmVmbG93IGFuZFxuLy8gdGhlIGZvbGRhYmxlJ3MgaGVpZ2h0IG1lYXN1cmVtZW50KS4gcmVtIHNvIHRoZSByZXNlcnZlZCBzcGFjZSBzY2FsZXMgd2l0aCB0aGVcbi8vIHByaW50IGZvbnQtc2l6ZSBjb25maWcuIEFic2VudCA9IGNvbnRlbnQtZGV0ZXJtaW5lZCBoZWlnaHQuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcblxuaW1wb3J0IHsgQmxvY2sgfSBmcm9tICcuL2Jsb2Nrcy9pbmRleC5qcyc7XG5cbi8vIGdyaWRMaW5lcyB0dXJucyBhIHJvdyBpbnRvIGEgcnVsZWQgZ3JpZDogYSBib3JkZXIgYXJvdW5kIHRoZSB3aG9sZSByb3csIHJ1bGVzXG4vLyBiZXR3ZWVuIHRoZSBjZWxscywgYW5kIHJ1bGVzIGJldHdlZW4gdGhlIHN0YWNrZWQgYmxvY2tzIHdpdGhpbiBhIGNlbGwuXG4vLyBFc3BlY2lhbGx5IHVzZWZ1bCBpbiBwcmludCAoYm94ZWQgcmVnaW9ucyB0byB3cml0ZSBpbiAvIGN1dCBvdXQpLiBUcmktc3RhdGUgc29cbi8vIGEgcm93IGNhbiBkZWZlciB0byB0aGUgYWN0aXZpdHktd2lkZSBkZWZhdWx0OlxuLy8gICAnaW5oZXJpdCcgXHUyMDE0IGZvbGxvdyBtZXRhLnByaW50LmdyaWRMaW5lcyAodGhlIGFjdGl2aXR5IGRlZmF1bHQ7IHRoZSByZW5kZXJlclxuLy8gICAgICAgICAgICAgICByZXNvbHZlcyB0aGlzKS4gRGVmYXVsdCwgc28gYSBmcmVzaGx5IGF1dGhvcmVkIHJvdyB0cmFja3MgdGhlXG4vLyAgICAgICAgICAgICAgIGFjdGl2aXR5IHNldHRpbmcgd2l0aG91dCBwZXItcm93IGZpZGRsaW5nLlxuLy8gICAnb24nICAgICAgXHUyMDE0IGFsd2F5cyBydWxlZCwgcmVnYXJkbGVzcyBvZiB0aGUgYWN0aXZpdHkgZGVmYXVsdC5cbi8vICAgJ29mZicgICAgIFx1MjAxNCBuZXZlciBydWxlZCwgcmVnYXJkbGVzcyBvZiB0aGUgYWN0aXZpdHkgZGVmYXVsdC5cbmV4cG9ydCBjb25zdCBDb2x1bW5HcmlkTGluZXMgPSB6LmVudW0oWydpbmhlcml0JywgJ29uJywgJ29mZiddKTtcbmV4cG9ydCB0eXBlIENvbHVtbkdyaWRMaW5lcyA9IHouaW5mZXI8dHlwZW9mIENvbHVtbkdyaWRMaW5lcz47XG5cbmV4cG9ydCBjb25zdCBDb2x1bW4gPSB6Lm9iamVjdCh7XG4gIGlkOiB6LnN0cmluZygpLnV1aWQoKSxcbiAgLy8gUGVyLWNvbHVtbiB3aWR0aCB3ZWlnaHQgKGZyIHVuaXRzKS4gT3B0aW9uYWw7IGFic2VudCA9IGVxdWFsIHNwbGl0LlxuICB3aWR0aDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC8vIFJlc2VydmVkIHdvcmstc3BhY2UgZmxvb3IgaW4gcmVtIChhIG1pbi1oZWlnaHQsIG5vdCBhIGZpeGVkIGhlaWdodCkuXG4gIG1pbkhlaWdodDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC8vIEEgY29sdW1uIGhvbGRzIGEgbm9uLWVtcHR5IFNUQUNLIG9mIGJsb2NrcyAoYmxvY2srKS4gQSBjb2x1bW4gY2FuIGhvbGQgYVxuICAvLyBoZWFkaW5nIGZvbGxvd2VkIGJ5IHNldmVyYWwgcHJvYmxlbXMgXHUyMDE0IHRoZSB0aGluZyBhIGRvY3VtZW50IHRvb2wgbmVlZHMgYW5kXG4gIC8vIGEgb25lLWJsb2NrLXBlci1yb3cgbW9kZWwgY2FuJ3QgZXhwcmVzcy5cbiAgYmxvY2tzOiB6LmFycmF5KEJsb2NrKS5taW4oMSksXG59KTtcbmV4cG9ydCB0eXBlIENvbHVtbiA9IHouaW5mZXI8dHlwZW9mIENvbHVtbj47XG5cbi8vIDEuLjYgY29sdW1ucy4gVGhlIGVkaXRvciBzdXJmYWNlcyBhIG5vbi1ibG9ja2luZyB3YXJuaW5nIGFib3ZlIDMgKHRvbyBuYXJyb3dcbi8vIHRvIHJlYWQgb24gcGFwZXIgb3IgYSBDaHJvbWVib29rKSwgYnV0IHRoZSBzY2hlbWEgYWNjZXB0cyB1cCB0byA2IHNvIGFuXG4vLyBpbnRlbnRpb25hbCBkZW5zZSBsYXlvdXQgc3RpbGwgdmFsaWRhdGVzLiBPbmUgY29sdW1uIGlzIHRoZSBpZGVudGl0eSBzdGF0ZTpcbi8vIGEgZnVsbC13aWR0aCByb3cgdGhhdCBcInJlbW92ZSBjb2x1bW5cIiBjYW5ub3QgZGlzc29sdmUgYmVsb3cuXG5leHBvcnQgY29uc3QgUm93ID0gei5vYmplY3Qoe1xuICBpZDogei5zdHJpbmcoKS51dWlkKCksXG4gIGNvbHVtbnM6IHouYXJyYXkoQ29sdW1uKS5taW4oMSkubWF4KDYpLFxuICBncmlkTGluZXM6IENvbHVtbkdyaWRMaW5lcy5kZWZhdWx0KCdpbmhlcml0JyksXG59KTtcbmV4cG9ydCB0eXBlIFJvdyA9IHouaW5mZXI8dHlwZW9mIFJvdz47XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGRvY3VtZW50LnRzIFx1MjAxNCBUb3AtbGV2ZWwgQWN0aXZpdHlEb2N1bWVudCBhbmQgU2VjdGlvbiBzY2hlbWFzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQWN0aXZpdHlEb2N1bWVudCBpcyB3aGF0IGdldHMgc3RvcmVkIGluIGFjdGl2aXRpZXMuZHJhZnRfY29udGVudCBhbmRcbi8vIGFjdGl2aXR5X3ZlcnNpb25zLmNvbnRlbnQuIFRoZSBzaGFwZSBsaXZlcyBpbiB0aGlzIHBhY2thZ2UgYXMgdGhlIHNpbmdsZVxuLy8gc291cmNlIG9mIHRydXRoIFx1MjAxNCB0aGUgcmVuZGVyZXIgcGFyc2VzIGl0LCB0aGUgZWRpdG9yIHByb2R1Y2VzIGl0IHZpYSB0aGVcbi8vIHNlcmlhbGl6ZSBsYXllciwgdGhlIGRhdGFiYXNlIHN0b3JlcyBpdCBhcyBqc29uYi5cbi8vXG4vLyBzY2hlbWFWZXJzaW9uIGlzIHRoZSBtaWdyYXRpb24gYW5jaG9yLiBJdCBpcyBjdXJyZW50bHkgMi4gVGhlIDFcdTIxOTIyIHJlc2hhcGVcbi8vIChibG9jay1zdHJlYW0gc2VjdGlvbnMgXHUyMTkyIHJvd3Mtb2YtY29sdW1ucykgd2FzIGEgR1JFRU5GSUVMRCBIQVJELUNVVDogdGhlcmUgd2FzXG4vLyBubyBwcm9kdWN0aW9uIGRhdGEgdG8gcHJlc2VydmUsIHNvIHRoZXJlIGlzIGRlbGliZXJhdGVseSBOTyBtaWdyYXRlKDFcdTIxOTIyKSBhbmRcbi8vIE5PIG1pZ3JhdGUtb24tcmVhZCBcdTIwMTQgdGhlIHBhcnNlciBpcyB6LmxpdGVyYWwoMikgYW5kIFJFSkVDVFMgYSB2MSBkb2N1bWVudFxuLy8gKGEgc3RyYXkgdjEgZmFpbHMgbG91ZGx5IGF0IHBhcnNlIHJhdGhlciB0aGFuIG1pcy1wYXJzaW5nIGludG8gZ2FyYmFnZSkuXG4vLyBXaGVuIGEgRlVUVVJFIHNjaGVtYSBuZWVkcyBhIG5vbi10cml2aWFsIG1pZ3JhdGlvbiBhZ2FpbnN0IHJlYWwgc3RvcmVkIGRhdGEsXG4vLyBidW1wIHRoZSB2ZXJzaW9uIGFuZCBhZGQgYSBtaWdyYXRlKE4gLT4gTisxKSB0aGF0IHJ1bnMgb24gcmVhZCAob2xkXG4vLyBhY3Rpdml0eV92ZXJzaW9ucyByb3dzIHN0YXkgYXQgdGhlaXIgb3JpZ2luYWwgc2NoZW1hVmVyc2lvbiBmb3JldmVyOyBtaWdyYXRlXG4vLyBvbiByZWFkLCBuZXZlciBieSBtdXRhdGluZyBzdG9yZWQgdmVyc2lvbnMpLiBUaGUgZ3JlZW5maWVsZCBoYXJkLWN1dCBpcyBhXG4vLyBvbmUtdGltZSBleGNlcHRpb24sIG5vdCB0aGUgZ2VuZXJhbCBwb2xpY3kuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IEJsb2NrIH0gZnJvbSAnLi9ibG9ja3MvaW5kZXguanMnO1xuaW1wb3J0IHsgUm93IH0gZnJvbSAnLi9sYXlvdXQuanMnO1xuXG4vLyBTZWN0aW9uOiBhIGNvbGxlY3Rpb24gb2YgUk9XUyB3aXRoIGFuIG9wdGlvbmFsIHRpdGxlLiBTZWN0aW9ucyBhcmUgdGhlXG4vLyB2ZXJ0aWNhbCBjaGVja3BvaW50IHByaW1pdGl2ZTsgcm93cyBhcmUgdGhlIGhvcml6b250YWwtc3BsaXQgcHJpbWl0aXZlXG4vLyAobGF5b3V0LnRzKS4gQSBzZWN0aW9uIGlzIHVzdWFsbHkgb25lIDEtY29sdW1uIHJvdyB3aG9zZSBjb2x1bW4gc3RhY2tzIG1hbnlcbi8vIGJsb2NrczsgYSBjb2x1bW5lZCByZWdpb24gaXMgYSBtdWx0aS1jb2x1bW4gcm93LiBTZWN0aW9ucyBhcmUgb3JnYW5pemF0aW9uYWxcbi8vIG9ubHkgXHUyMDE0IHRoZXkgZG9uJ3QgY29uc3RyYWluIGNvbnRlbnQgYmV5b25kIGhvbGRpbmcgcm93cy5cbi8vXG4vLyBpc0NoZWNrcG9pbnQgbWFya3MgdGhpcyBzZWN0aW9uIGFzIGhhdmluZyBhIFwiQ2hlY2sgdGhpcyBzZWN0aW9uXCIgYnV0dG9uIGF0XG4vLyBpdHMgYm90dG9tIGluIHRoZSBwdWJsaXNoZWQgSFRNTC4gT25seSBtZWFuaW5nZnVsIHdoZW4gdGhlIGFjdGl2aXR5J3Ncbi8vIHN1Ym1pc3Npb25Nb2RlIGlzICdsb2NrZWQnIG9yICdmcmVlJyAoaWdub3JlZCBpbiAnc2luZ2xlJyBtb2RlIFx1MjAxNCBub1xuLy8gY2hlY2twb2ludCBidXR0b25zIHJlbmRlciBhbnl3aGVyZSkuXG5leHBvcnQgY29uc3QgU2VjdGlvbiA9IHoub2JqZWN0KHtcbiAgaWQ6IHouc3RyaW5nKCkudXVpZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0NoZWNrcG9pbnQ6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dzOiB6LmFycmF5KFJvdyksXG59KTtcbmV4cG9ydCB0eXBlIFNlY3Rpb24gPSB6LmluZmVyPHR5cGVvZiBTZWN0aW9uPjtcblxuLy8gTWV0YTogdGhlIGFjdGl2aXR5J3MgdGl0bGUsIGNvdXJzZSwgdW5pdCwgZXRjLiBOb3QgdXNlZCBpbiByZW5kZXJpbmcgb2Zcbi8vIHRoZSBib2R5IFx1MjAxNCBkcml2ZXMgdGhlIHB1Ymxpc2hlZCBIVE1MJ3MgPHRpdGxlPiBhbmQgaGVhZGVyIGJhbm5lci5cbi8vXG4vLyBzdWJtaXNzaW9uTW9kZSBjb250cm9scyB0aGUgc3R1ZGVudC1mYWNpbmcgZmxvdzpcbi8vICAgJ3NpbmdsZScgXHUyMDE0IG9uZSBzdWJtaXQgYXQgdGhlIGVuZCwgbm8gY2hlY2twb2ludHMgKHRoZSBvcmlnaW5hbCBQaGFzZSAxIG1vZGVsKVxuLy8gICAnbG9ja2VkJyBcdTIwMTQgcGVyLXNlY3Rpb24gY2hlY2twb2ludHM7IGlucHV0cyBmcmVlemUgYWZ0ZXIgZWFjaCBzZWN0aW9uIGlzIGNoZWNrZWRcbi8vICAgJ2ZyZWUnICAgXHUyMDE0IHBlci1zZWN0aW9uIGNoZWNrcG9pbnRzOyBzdHVkZW50IGNhbiByZXZpc2UgYW55IGNoZWNrZWQgc2VjdGlvbiBmcmVlbHlcbi8vXG4vLyByZXZpc2lvbk1vZGUgY29udHJvbHMgcG9zdC1zdWJtaXNzaW9uIGJlaGF2aW9yOlxuLy8gICAnZnJlZScgICBcdTIwMTQgYWZ0ZXIgZmluYWwgc3VibWl0LCBzdHVkZW50IGNhbiByZXZpc2UgYW5kIHJlc3VibWl0IChuZXcgYXR0ZW1wdCByb3cpXG4vLyAgICdsb2NrZWQnIFx1MjAxNCBmaW5hbCBzdWJtaXQgaXMgZmluYWw7IG5vIHJlc3VibWlzc2lvbnNcbi8vIHJldmlzaW9uTW9kZSBpcyBpZ25vcmVkIHdoZW4gc3VibWlzc2lvbk1vZGUgPT09ICdzaW5nbGUnLlxuLy9cbi8vIGdyYWRpbmdNb2RlIGNvbnRyb2xzIHdobyBzY29yZXMgdGhlIGFjdGl2aXR5OlxuLy8gICAnYXV0bycgICBcdTIwMTQgUGhhc2UgMSBkZWZhdWx0LiBSdW50aW1lIGNvbXB1dGVzIHNjb3JlcyBjbGllbnQtc2lkZSBmcm9tXG4vLyAgICAgICAgICAgICAgYW5zd2VyIGtleXMgYmFrZWQgaW50byB0aGUgcHVibGlzaGVkIEhUTUwuXG4vLyAgICdtYW51YWwnIFx1MjAxNCBQaGFzZSAyLjYrLiBObyBhdXRvLXNjb3Jpbmc7IHN1Ym1pc3Npb25zIGxhbmQgaW4gdGhlXG4vLyAgICAgICAgICAgICAgdGVhY2hlciBkYXNoYm9hcmQgcGVuZGluZyBydWJyaWMgYXBwbGljYXRpb24uXG4vLyAgICdtaXhlZCcgIFx1MjAxNCBQaGFzZSAyLjYrLiBTb21lIGJsb2NrcyBhdXRvLWdyYWRlZCwgc29tZSBtYW51YWxseSBncmFkZWRcbi8vICAgICAgICAgICAgICAoZS5nLiwgNSBNQyBxdWVzdGlvbnMgKyAxIGVzc2F5KS4gRmluYWwgc2NvcmUgY29tYmluZXMgYm90aC5cbi8vIEluZXJ0IGluIFBoYXNlIDEgXHUyMDE0IG5vIG1hbnVhbC1ncmFkZWQgYmxvY2sgdHlwZXMgZXhpc3QgeWV0LCBzbyB0aGVcbi8vIHJ1bnRpbWUgdHJlYXRzICdtYW51YWwnLydtaXhlZCcgdGhlIHNhbWUgYXMgJ2F1dG8nIHVudGlsIFBoYXNlIDIuNlxuLy8gbGFuZHMgcGVyLWJsb2NrIGdyYWRpbmcgbWV0YWRhdGEuIEZpZWxkIGV4aXN0cyBub3cgc28gZXhpc3Rpbmcgc3RvcmVkXG4vLyBkb2N1bWVudHMgcGFyc2UgY2xlYW5seSB3aGVuIHRob3NlIGJsb2NrIHR5cGVzIGFycml2ZS5cbi8vXG4vLyBhY3Rpdml0eVR5cGUgZHJpdmVzIHByZXNlbnRhdGlvbjogYW4gZXhpdF90aWNrZXQgcmVuZGVycyBhcyBhIHNpbmdsZS1wYWdlXG4vLyBmb2N1c2VkIGxheW91dDsgYSB3b3Jrc2hlZXQgcmVuZGVycyB3aXRoIGZ1bGwgc2VjdGlvbiBuYXZpZ2F0aW9uOyBldGMuXG4vL1xuLy8gYW5zd2VyRmVlZGJhY2sgY29udHJvbHMgV0hFTiBhIGJsYW5rJ3MgY29ycmVjdC9pbmNvcnJlY3Qgc2lnbmFsICh0aGVcbi8vIGdyZWVuL3JlZCBib3JkZXIgKyBhcmlhLWludmFsaWQgKyB0YXJnZXRlZCBtaXN0YWtlIGZlZWRiYWNrKSBiZWNvbWVzXG4vLyB2aXNpYmxlIHRvIHRoZSBzdHVkZW50OlxuLy8gICAnaW1tZWRpYXRlJyBcdTIwMTQgdGhlIGJsYW5rIHNlbGYtY2hlY2tzIG9uIGJsdXIsIHNvIHRoZSBzdHVkZW50IHNlZXNcbi8vICAgICAgICAgICAgICAgICBjb3JyZWN0L2luY29ycmVjdCBhcyBzb29uIGFzIHRoZXkgbGVhdmUgdGhlIGZpZWxkLiBBXG4vLyAgICAgICAgICAgICAgICAgc2VsZi1jaGVjayBwcmFjdGljZSBleHBlcmllbmNlLlxuLy8gICAnb25fY2hlY2snICBcdTIwMTQgY29ycmVjdG5lc3MgaXMgaGlkZGVuIHVudGlsIHRoZSBzdHVkZW50IGNoZWNrcyB0aGUgc2VjdGlvblxuLy8gICAgICAgICAgICAgICAgIChsb2NrZWQvZnJlZSkgb3Igc3VibWl0cyAoc2luZ2xlKS4gQW4gYXNzZXNzbWVudC1zdHlsZVxuLy8gICAgICAgICAgICAgICAgIGV4cGVyaWVuY2UgdGhhdCBkb2Vzbid0IGxlYWsgYW5zd2VycyBiZWZvcmUgdGhlIGdhdGUuXG4vLyBPcnRob2dvbmFsIHRvIHN1Ym1pc3Npb25Nb2RlIFx1MjAxNCBhbnkgY2hlY2twb2ludCBiZWhhdmlvciBjYW4gcGFpciB3aXRoXG4vLyBlaXRoZXIgZmVlZGJhY2sgdGltaW5nICh0aGUgc2FtZSByZWFzb24gcmV2aXNpb25Nb2RlIGlzIGl0cyBvd24gZmllbGQpLlxuLy8gRGVmYXVsdCAnb25fY2hlY2snOiB0aGUgY2hlY2twb2ludCBtb2RlbCBpbXBsaWVzIFwiYW5zd2VyLCB0aGVuIGNoZWNrXCIsXG4vLyBhbmQgbGVha2luZyBjb3JyZWN0bmVzcyBvbiBibHVyIHVuZGVyY3V0IHRoYXQuIE5PVEUgdGhlIHJ1bnRpbWUgZGVmYXVsdHMgYVxuLy8gTUlTU0lORyBhbnN3ZXJGZWVkYmFjayAoYWN0aXZpdGllcyBwdWJsaXNoZWQgYmVmb3JlIHRoaXMgZmllbGQgZXhpc3RlZCkgdG9cbi8vICdpbW1lZGlhdGUnLCBwcmVzZXJ2aW5nIHRoZWlyIG9yaWdpbmFsIGJlaGF2aW9yIFx1MjAxNCB0aGUgc2NoZW1hIGRlZmF1bHQgYW5kXG4vLyB0aGUgcnVudGltZSBiYWNrLWNvbXBhdCBmYWxsYmFjayBkaWZmZXIgb24gcHVycG9zZS5cbi8vXG4vLyBza2lsbHMgaXMgYW4gYXJyYXkgb2YgdW5pdmVyc2FsIHNraWxsIHRhZ3MgZGVzY3JpYmluZyB3aGF0IHRoZSBhY3Rpdml0eVxuLy8gdGVhY2hlcy4gQWN0aW9uLW9yaWVudGVkLCBmcmFtZXdvcmstbmV1dHJhbDogXCJzaW1wbGlmeWluZyByYXRpb25hbFxuLy8gZXhwcmVzc2lvbnNcIiwgXCJmYWN0b3JpbmcgcXVhZHJhdGljc1wiLCBcImdyYXBoaW5nIHBhcmFib2xhc1wiLiBBIHRlYWNoZXIgd2hvXG4vLyB3YW50cyB0byB1c2UgVEVLUyBvciBDQ1NTIGNvZGVzIGNhbiBcdTIwMTQgdGhlIGZpZWxkIGRvZXNuJ3QgdmFsaWRhdGUgYWdhaW5zdFxuLy8gYW55IGZyYW1ld29yay4gUGhhc2UgNSBtYXJrZXRwbGFjZSBhZGRzIGNvbnRyb2xsZWQgdm9jYWJ1bGFyeSBvbiB0b3AuXG4vL1xuLy8gcHJpbnQgaXMgdGhlIHRlYWNoZXItY29uZmlndXJhYmxlIHByaW50IGxheWVyIChzZWUgUHJpbnRDb25maWcgYmVsb3cpLiBJdFxuLy8gaXMgYWx3YXlzIHByZXNlbnQgYWZ0ZXIgcGFyc2UgKGRlZmF1bHQge30pLCBzbyBldmVyeSBjb25zdW1lciBjYW4gcmVhZFxuLy8gZG9jLm1ldGEucHJpbnQuKiB3aXRob3V0IGFuIHVuZGVmaW5lZCBjaGVjazsgZG9jdW1lbnRzIHN0b3JlZCBiZWZvcmUgdGhpc1xuLy8gZmllbGQgZXhpc3RlZCBnZXQgdGhlIGRlZmF1bHRzIGFwcGxpZWQgb24gcmVhZC4gVGhlIGRlZmF1bHRzIGtlZXAgdGhlXG4vLyBTdGFnZSAxMSBiYXNlbGluZSBwYWdlIGdlb21ldHJ5IChzaW5nbGUgY29sdW1uLCAwLjVpbiBtYXJnaW4sIGxldHRlcikgYW5kXG4vLyBhZGQgdGhlIHByaW50IHR5cG9ncmFwaHkgU3RhZ2UgMTEgZGVsaWJlcmF0ZWx5IGRlZmVycmVkIHRvIHRoaXMgZmVhdHVyZVxuLy8gKDExcHQgYm9keSwgMXJlbSBwcm9ibGVtIHNwYWNpbmcpIFx1MjAxNCBzbyBhIGZyZXNobHkgcHVibGlzaGVkIHBhZ2UgcHJpbnRzIGluIGFcbi8vIHNlbnNpYmxlIGRlZmF1bHQgc3R5bGUsIGFuZCB0aGUgdGVhY2hlciB0dW5lcyBmcm9tIHRoZXJlLlxuXG4vLyBQcmludEhlYWRlcjogd2hpY2ggbGFiZWxlZCBmaWxsLWluIGxpbmVzIGFwcGVhciBhdCB0aGUgdG9wIG9mIGEgcHJpbnRlZFxuLy8gc2hlZXQuIE5hbWUgKyBEYXRlIGFyZSB0aGUgbmVhci11bml2ZXJzYWwgcGFpciwgc28gdGhleSBkZWZhdWx0IG9uOyB0aGVcbi8vIHJlc3QgZGVmYXVsdCBvZmYuIGN1c3RvbSBob2xkcyBleHRyYSB0ZWFjaGVyLWF1dGhvcmVkIGxhYmVscyAoZS5nLlxuLy8gXCJCbG9ja1wiLCBcIlRlYWNoZXJcIikgcmVuZGVyZWQgYXMgdGhlaXIgb3duIGZpbGwtaW4gbGluZXMuIFRoZSBoZWFkZXIgaXNcbi8vIHByaW50LW9ubHkgXHUyMDE0IGl0IG5ldmVyIHNob3dzIG9uIHNjcmVlbiAodGhlIG9uLXNjcmVlbiBpZGVudGl0eSBwcm9tcHQgaXMgdGhlXG4vLyBsaXZlIG5hbWUgZmllbGQpOyBzZWUgcmVuZGVyUHJpbnRIZWFkZXIgKyB0aGUgQG1lZGlhIHByaW50IHJ1bGVzLlxuZXhwb3J0IGNvbnN0IFByaW50SGVhZGVyID0gei5vYmplY3Qoe1xuICBuYW1lOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZTogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZDogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZTogei5ib29sZWFuKCkuZGVmYXVsdChmYWxzZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXN0b206IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG59KTtcbmV4cG9ydCB0eXBlIFByaW50SGVhZGVyID0gei5pbmZlcjx0eXBlb2YgUHJpbnRIZWFkZXI+O1xuXG4vLyBQcmludENvbmZpZzogdGhlIHRlYWNoZXIncyBwcmludCBzZXR0aW5ncyBmb3IgYW4gYWN0aXZpdHkuIEV2ZXJ5IGZpZWxkIGlzXG4vLyBkZWZhdWx0ZWQgc28gUHJpbnRDb25maWcucGFyc2Uoe30pIHlpZWxkcyBhIGNvbXBsZXRlLCBiYXNlbGluZS1lcXVpdmFsZW50XG4vLyBjb25maWcgXHUyMDE0IHRoYXQgaXMgd2hhdCBBY3Rpdml0eU1ldGEucHJpbnQgZmFsbHMgYmFjayB0by5cbi8vXG4vLyAgIHBhcGVyU2l6ZSAgICAgIFx1MjAxNCAnbGV0dGVyJyB8ICdhNCcuIERyaXZlcyB0aGUgQHBhZ2Ugc2l6ZSBrZXl3b3JkLiBEZWZhdWx0XG4vLyAgICAgICAgICAgICAgICAgICAgbGV0dGVyIGZvciBub3cgKE5aL0E0IGlzIGEgb25lLWxpbmUgZmxpcCBsYXRlcik7IGVtaXR0ZWRcbi8vICAgICAgICAgICAgICAgICAgICBhcyBhIExJVEVSQUwgQHBhZ2UgcnVsZSwgbmV2ZXIgYSBDU1MgdmFyLCBiZWNhdXNlIEBwYWdlXG4vLyAgICAgICAgICAgICAgICAgICAgcnVsZXMgY2Fubm90IHJlbGlhYmx5IHJlYWQgY3VzdG9tIHByb3BlcnRpZXMuXG4vLyAgIGNvbHVtbnMgICAgICAgIFx1MjAxNCAxLi4zLiBjb2x1bW4tY291bnQgaW4gcHJpbnQ7IDEgaXMgYSBuby1vcCAoc2luZ2xlIGNvbCkuXG4vLyAgICAgICAgICAgICAgICAgICAgRE9STUFOVDogdGhlIGF1dGhvci1mYWNpbmcgY29udHJvbCB3YXMgcmV0aXJlZCB3aGVuXG4vLyAgICAgICAgICAgICAgICAgICAgc3RydWN0dXJhbCBhdXRob3JlZCBjb2x1bW5zICh0aGUgUm93L0NvbHVtbiBsYXlvdXRcbi8vICAgICAgICAgICAgICAgICAgICBwcmltaXRpdmUpIGxhbmRlZCBcdTIwMTQgYSBtdWx0aS1jb2x1bW4gcm93IHJlbmRlcnMgY29uc2lzdGVudGx5XG4vLyAgICAgICAgICAgICAgICAgICAgb24gc2NyZWVuLCBpbiB3b3Jrc2hlZXQgcHJpbnQsIGFuZCBpbnNpZGUgYSBmb2xkYWJsZSwgc29cbi8vICAgICAgICAgICAgICAgICAgICB0aGlzIHBlci1tb2RlIHByaW50IHNldHRpbmcgYmVjYW1lIHJlZHVuZGFudC4gVGhlIGZpZWxkICtcbi8vICAgICAgICAgICAgICAgICAgICBpdHMgcmVuZGVyZXIgdmFyL0NTUyBhcmUga2VwdCAobm90IGRlbGV0ZWQpIHNvIHZhbHVlc1xuLy8gICAgICAgICAgICAgICAgICAgIGFscmVhZHkgc2F2ZWQgb24gZXhpc3RpbmcgYWN0aXZpdGllcyBrZWVwIHByaW50aW5nIGFzXG4vLyAgICAgICAgICAgICAgICAgICAgYXV0aG9yZWQsIGFuZCBzbyB0aGUgY29udHJvbCBjYW4gYmUgcmUtZXhwb3NlZCBsYXRlciB3aXRoXG4vLyAgICAgICAgICAgICAgICAgICAgbm8gc2NoZW1hL3JlbmRlcmVyIGNoYW5nZS4gTmV3IGFjdGl2aXRpZXMgZGVmYXVsdCB0byAxLlxuLy8gICB3b3JrU3BhY2UgICAgICBcdTIwMTQgcmVtIG9mIGJsYW5rIHNwYWNlIGJlbG93IGVhY2ggcHJvYmxlbSBmb3IgaGFuZC13b3JraW5nLlxuLy8gICAgICAgICAgICAgICAgICAgIEFjdGl2aXR5LWxldmVsIGRlZmF1bHQ7IGEgZmlsbC1pbi1ibGFuayBibG9jayBtYXkgb3ZlcnJpZGVcbi8vICAgICAgICAgICAgICAgICAgICBpdCBwZXItcHJvYmxlbSB2aWEgRmlsbEluQmxhbmtCbG9jay53b3JrU3BhY2UuXG4vLyAgIGZvbnRTaXplICAgICAgIFx1MjAxNCBwdC4gQXBwbGllZCB0byAuYWN0aXZpdHktY29udGFpbmVyIGluIHByaW50IG9ubHkuXG4vLyAgIHByb2JsZW1TcGFjaW5nIFx1MjAxNCByZW0gb2YgdmVydGljYWwgbWFyZ2luIGFyb3VuZCBlYWNoIHByb2JsZW0gaW4gcHJpbnQuXG4vLyAgIG1hcmdpbiAgICAgICAgIFx1MjAxNCBpbmNoZXMuIFRoZSBAcGFnZSBtYXJnaW4gKGxpdGVyYWwsIGxpa2UgcGFwZXJTaXplKS5cbi8vICAgZ3JpZExpbmVzICAgICAgXHUyMDE0IGFjdGl2aXR5LXdpZGUgZGVmYXVsdCBmb3IgcnVsZWQgcm93cy4gQSBSb3cgd2l0aFxuLy8gICAgICAgICAgICAgICAgICAgIGdyaWRMaW5lczonaW5oZXJpdCcgKHRoZSBwZXItcm93IGRlZmF1bHQpIHJlc29sdmVzIHRvIHRoaXM7XG4vLyAgICAgICAgICAgICAgICAgICAgJ29uJy8nb2ZmJyBvbiBhIHJvdyBvdmVycmlkZSBpdC4gT2ZmIGJ5IGRlZmF1bHQgXHUyMDE0IHJ1bGVkXG4vLyAgICAgICAgICAgICAgICAgICAgZ3JpZHMgYXJlIG9wdC1pbi5cbi8vICAgcHJpbnRSZWZlcmVuY2VQYW5lbCBcdTIwMTQgd2hldGhlciB0aGUgYWN0aXZpdHkncyByZWZlcmVuY2UgcGFuZWwgcHJpbnRzIGFzIGFcbi8vICAgICAgICAgICAgICAgICAgICBib3ggYXQgdGhlIHRvcCBvZiB0aGUgd29ya3NoZWV0LiBPbiBieSBkZWZhdWx0OyBhIHRlYWNoZXJcbi8vICAgICAgICAgICAgICAgICAgICB3aXRoIGEgY2xhc3Mgc2V0IG9mIGNoYXJ0cyBjYW4gdHVybiBpdCBvZmYgc28gaXQgaXNuJ3Rcbi8vICAgICAgICAgICAgICAgICAgICByZXByaW50ZWQgcGVyIGFjdGl2aXR5LiBUaGUgb24tU0NSRUVOIHJlZmVyZW5jZSB0b29sYmFyIGlzXG4vLyAgICAgICAgICAgICAgICAgICAgdW5hZmZlY3RlZCBcdTIwMTQgdGhpcyBnYXRlcyBwcmludCBhbG9uZS4gUmVhZCBieSB0aGUgcmVuZGVyZXJcbi8vICAgICAgICAgICAgICAgICAgICB0byBkZWNpZGUgd2hldGhlciB0byBlbWl0IHRoZSBwcmludCBib3g7IG5vdCBhIGNvbnRhaW5lclxuLy8gICAgICAgICAgICAgICAgICAgIENTUyB2YXIuXG4vLyAgIHByaW50RGVmaW5pdGlvbkdsb3NzYXJ5IFx1MjAxNCB3aGV0aGVyIGlubGluZSB2b2NhYnVsYXJ5IGRlZmluaXRpb25zIHByaW50IGFzIGFcbi8vICAgICAgICAgICAgICAgICAgICBnbG9zc2FyeSBhcHBlbmRpeCBhdCB0aGUgRU5EIG9mIHRoZSB3b3Jrc2hlZXQuIE9GRiBieVxuLy8gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQsIHVubGlrZSBwcmludFJlZmVyZW5jZVBhbmVsOiBvbiBzY3JlZW4gYSBkZWZpbml0aW9uXG4vLyAgICAgICAgICAgICAgICAgICAgaXMgYSBwb3BvdmVyIGEgc3R1ZGVudCBvcGVucyBvbiBkZW1hbmQsIGFuZCBtb3N0IGFyZSBhXG4vLyAgICAgICAgICAgICAgICAgICAgc2hvcnQgZ2xvc3MgdGhhdCB3b3VsZCBvbmx5IHBhZCB0aGUgcHJpbnRvdXQuIEEgdGVhY2hlciB3aG9cbi8vICAgICAgICAgICAgICAgICAgICBoYXMgcHV0IGEgZm9ybXVsYSBvciBhIGRpYWdyYW0gaW4gYSBkZWZpbml0aW9uIHR1cm5zIHRoaXNcbi8vICAgICAgICAgICAgICAgICAgICBvbiBzbyBpdCBzdXJ2aXZlcyBvbiBwYXBlciAoZGVmaW5pdGlvbiBwb3BvdmVycyBhcmVcbi8vICAgICAgICAgICAgICAgICAgICBkaXNwbGF5Om5vbmUgaW4gcHJpbnQpLiBSZWFkIGJ5IHRoZSByZW5kZXJlciB0byBkZWNpZGVcbi8vICAgICAgICAgICAgICAgICAgICB3aGV0aGVyIHRvIGVtaXQgdGhlIGFwcGVuZGl4OyBub3QgYSBjb250YWluZXIgQ1NTIHZhci5cbi8vICAgaGVhZGVyICAgICAgICAgXHUyMDE0IHNlZSBQcmludEhlYWRlci5cbi8vXG4vLyBjb2x1bW5zL3dvcmtTcGFjZS9mb250U2l6ZS9wcm9ibGVtU3BhY2luZyByaWRlIGFzIC0tcHJpbnQtKiBDU1MgdmFycyBvbiB0aGVcbi8vIGNvbnRhaW5lciAobm9ybWFsIHNlbGVjdG9ycyBjYW4gcmVhZCB0aGVtKTsgcGFwZXJTaXplL21hcmdpbiBhcmUgZW1pdHRlZCBhc1xuLy8gYSBwZXItZG9jdW1lbnQgbGl0ZXJhbCBAcGFnZSBydWxlLiBncmlkTGluZXMgaXMgbm90IGEgY29udGFpbmVyIHZhciBcdTIwMTQgaXQgaXNcbi8vIHJlc29sdmVkIHBlciByb3cgYXQgcmVuZGVyIHRpbWUgKHNlZSByZW5kZXJSb3cpLlxuZXhwb3J0IGNvbnN0IFByaW50Q29uZmlnID0gei5vYmplY3Qoe1xuICBwYXBlclNpemU6IHouZW51bShbJ2xldHRlcicsICdhNCddKS5kZWZhdWx0KCdsZXR0ZXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5zOiB6Lm51bWJlcigpLmludCgpLm1pbigxKS5tYXgoMykuZGVmYXVsdCgxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrU3BhY2U6IHoubnVtYmVyKCkubWluKDApLmRlZmF1bHQoMCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IHoubnVtYmVyKCkucG9zaXRpdmUoKS5kZWZhdWx0KDExKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ibGVtU3BhY2luZzogei5udW1iZXIoKS5taW4oMCkuZGVmYXVsdCgxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46IHoubnVtYmVyKCkubWluKDApLmRlZmF1bHQoMC41KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmlkTGluZXM6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaW50UmVmZXJlbmNlUGFuZWw6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpbnREZWZpbml0aW9uR2xvc3Nhcnk6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcjogUHJpbnRIZWFkZXIuZGVmYXVsdCh7fSksXG59KTtcbmV4cG9ydCB0eXBlIFByaW50Q29uZmlnID0gei5pbmZlcjx0eXBlb2YgUHJpbnRDb25maWc+O1xuXG4vLyBUeXBvZ3JhcGh5OiB0aGUgYWN0aXZpdHktd2lkZSBmb250ICsgYmFzZSBib2R5IHNpemUgKGF1dGhvci1hcHByb3ZlZFxuLy8gMjAyNi0wNy0wOCkuIE9ORSBmb250IGFuZCBPTkUgYmFzZSBzaXplIGZvciB0aGUgd2hvbGUgYWN0aXZpdHkgXHUyMDE0IHB1Ymxpc2hlZFxuLy8gcGFnZSwgZWRpdG9yIGNhbnZhcywgYW5kIHByaW50IHZpZXcgYWxsIHJlYWQgdGhlIHNhbWUgY29uZmlnIHNvIGF1dGhvcmluZyBpc1xuLy8gV1lTSVdZRy4gT3B0aW9uYWwgYW5kIGFkZGl0aXZlOiBkb2N1bWVudHMgc3RvcmVkIGJlZm9yZSB0aGlzIGZpZWxkIGV4aXN0ZWRcbi8vIHBhcnNlIHVuY2hhbmdlZCAobm8gc2NoZW1hVmVyc2lvbiBidW1wKSwgYW5kIHRoZSBlZGl0b3Igb21pdHMgdGhlIGZpZWxkXG4vLyBlbnRpcmVseSB3aGlsZSBpdCBob2xkcyB0aGUgZGVmYXVsdHMgc28gdW50b3VjaGVkIGRvY3VtZW50cyBzdGF5XG4vLyBzdHJ1Y3R1cmFsbHkgaWRlbnRpY2FsLlxuLy9cbi8vICAgZm9udCAgICAgXHUyMDE0IGFuIGlkIGludG8gdGhlIHJlbmRlcmVyJ3MgRk9OVF9SRUdJU1RSWSAodGhlIENTUyBzcGVjaWZpY3MgXHUyMDE0XG4vLyAgICAgICAgICAgICAgZmFtaWx5IG5hbWUsIGZhbGxiYWNrIHN0YWNrLCBXT0ZGMiBmaWxlcyBcdTIwMTQgbGl2ZSByZW5kZXJlci1zaWRlO1xuLy8gICAgICAgICAgICAgIHRoZSBzY2hlbWEgb25seSBjb25zdHJhaW5zIHRoZSBtZW51KS4gJ2RlZmF1bHQnID0gdGhlIGN1cnJlbnRcbi8vICAgICAgICAgICAgICBzeXN0ZW0gc3RhY2ssIG5vIGZvbnQgZG93bmxvYWQuIFRoZSBvdGhlciBmb3VyIGFyZSBTSUwgT0ZMXG4vLyAgICAgICAgICAgICAgZmFjZXMgc2VsZi1ob3N0ZWQgYXMgV09GRjIgb24gUjIgKG5vIEdvb2dsZSBDRE4gZGVwZW5kZW5jeSBvblxuLy8gICAgICAgICAgICAgIHB1Ymxpc2hlZCBwYWdlcykuXG4vLyAgIGZvbnRTaXplIFx1MjAxNCBiYXNlIEJPRFkgc2l6ZSBpbiBweCwgYXBwbGllZCBvbiBzY3JlZW4gdmlhXG4vLyAgICAgICAgICAgICAgLS1hY3Rpdml0eS1mb250LXNpemUuIFByaW50IGJvZHkgc2l6aW5nIHN0YXlzIG93bmVkIGJ5XG4vLyAgICAgICAgICAgICAgbWV0YS5wcmludC5mb250U2l6ZSAocHQpIFx1MjAxNCB0aGUgQG1lZGlhIHByaW50IHJ1bGUgb3ZlcnJpZGVzIHRoZVxuLy8gICAgICAgICAgICAgIHNjcmVlbiBzaXplLCBzbyB0aGUgdHdvIG5ldmVyIGZpZ2h0LiBIZWFkaW5ncyBhcmUgZW0tcmVsYXRpdmVcbi8vICAgICAgICAgICAgICBhbmQgc2NhbGUgb2ZmIHdoaWNoZXZlciBiYXNlIGlzIGluIGVmZmVjdC5cbi8vXG4vLyBQZXItc3BhbiBmb250L3NpemUgbWFya3MgYXJlIFBBUktFRCBidXQgZGVzaWduZWQgZm9yOiB0aGlzIGFjdGl2aXR5LXdpZGVcbi8vIGxheWVyIG9ubHkgc2V0cyBDU1MgdmFycyArIEBmb250LWZhY2UsIHNvIGEgZnV0dXJlIGB0ZXh0U3R5bGVgIG1hcmsgY2FuXG4vLyBzbG90IGluIGFkZGl0aXZlbHkgKHNwYW4tbGV2ZWwgaW5saW5lIHN0eWxlcyB3aW4gdGhlIGNhc2NhZGU7IHRoZVxuLy8gcmVuZGVyZXIncyBmb250RmFjZUNzcyBhbHJlYWR5IHRha2VzIGEgTElTVCBvZiBmYW1pbGllcyB0byBlbWJlZCkuXG5leHBvcnQgY29uc3QgQWN0aXZpdHlGb250ID0gei5lbnVtKFtcbiAgJ2RlZmF1bHQnLFxuICAnbGV4ZW5kJyxcbiAgJ2F0a2luc29uLWh5cGVybGVnaWJsZScsXG4gICdhbmRpa2EnLFxuICAnY29taWMtbmV1ZScsXG5dKTtcbmV4cG9ydCB0eXBlIEFjdGl2aXR5Rm9udCA9IHouaW5mZXI8dHlwZW9mIEFjdGl2aXR5Rm9udD47XG5cbmV4cG9ydCBjb25zdCBUeXBvZ3JhcGh5ID0gei5vYmplY3Qoe1xuICBmb250OiBBY3Rpdml0eUZvbnQuZGVmYXVsdCgnZGVmYXVsdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiB6Lm51bWJlcigpLm1pbigxMikubWF4KDI0KS5kZWZhdWx0KDE2KSxcbn0pO1xuZXhwb3J0IHR5cGUgVHlwb2dyYXBoeSA9IHouaW5mZXI8dHlwZW9mIFR5cG9ncmFwaHk+O1xuXG5leHBvcnQgY29uc3QgQWN0aXZpdHlNZXRhID0gei5vYmplY3Qoe1xuICB0aXRsZTogei5zdHJpbmcoKS5taW4oMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291cnNlOiB6LnN0cmluZygpLmRlZmF1bHQoJ0FsZ2VicmEgSUknKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml0OiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWlzc2lvbk1vZGU6IHouZW51bShbJ3NpbmdsZScsICdsb2NrZWQnLCAnZnJlZSddKS5kZWZhdWx0KCdmcmVlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV2aXNpb25Nb2RlOiB6LmVudW0oWydmcmVlJywgJ2xvY2tlZCddKS5kZWZhdWx0KCdmcmVlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JhZGluZ01vZGU6IHouZW51bShbJ2F1dG8nLCAnbWFudWFsJywgJ21peGVkJ10pLmRlZmF1bHQoJ2F1dG8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpdml0eVR5cGU6IHouZW51bShbJ3dvcmtzaGVldCcsICdleGl0X3RpY2tldCcsICd3YXJtX3VwJywgJ3JldmlldyddKS5kZWZhdWx0KCd3b3Jrc2hlZXQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXJGZWVkYmFjazogei5lbnVtKFsnaW1tZWRpYXRlJywgJ29uX2NoZWNrJ10pLmRlZmF1bHQoJ29uX2NoZWNrJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaW50OiBQcmludENvbmZpZy5kZWZhdWx0KHt9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBvZ3JhcGh5OiBUeXBvZ3JhcGh5Lm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIEFjdGl2aXR5TWV0YSA9IHouaW5mZXI8dHlwZW9mIEFjdGl2aXR5TWV0YT47XG5cbi8vIFRoZSB0b3AtbGV2ZWwgZG9jdW1lbnQuIEFsd2F5cyB2YWxpZGF0ZSB1c2VyLWZhY2luZyBpbnB1dCB0aHJvdWdoIHRoaXNcbi8vIGJlZm9yZSBzdG9yaW5nLiBUaGUgRWRnZSBGdW5jdGlvbnMgcGFyc2UgaW5jb21pbmcgZHJhZnRzIHdpdGggdGhpcyBzY2hlbWFcbi8vIGFuZCByZWplY3QgbWFsZm9ybWVkIGRvY3VtZW50cyB3aXRoIGEgNDAwLlxuLy8gUmVmZXJlbmNlUGFuZWw6IG9wdGlvbmFsIHN0aWNreS1zaWRlYmFyIGNvbnRlbnQgc3R1ZGVudHMgY29uc3VsdCB3aGlsZVxuLy8gd29ya2luZyBcdTIwMTQgZm9ybXVsYSBjaGFydHMsIHBlcmlvZGljIHRhYmxlcywgdm9jYWJ1bGFyeSBsaXN0cywgY29udmVyc2lvblxuLy8gdGFibGVzLCB1bml0LWNpcmNsZSBkaWFncmFtcywgc2VudGVuY2Utc3RlbSBwcm9tcHRzLCBmb3JlaWduLWxhbmd1YWdlXG4vLyB2ZXJiIHRhYmxlcywgcHJpbWFyeS1zb3VyY2UgZXhjZXJwdHMsIG1hcHMuIFRoZSBibG9ja3MgYXJyYXkgdXNlcyB0aGVcbi8vIHNhbWUgQmxvY2sgc2NoZW1hIGFzIHNlY3Rpb24gY29udGVudDsgbm8gbmV3IGJsb2NrIHR5cGVzIGFyZSBuZWVkZWRcbi8vIGZvciB0aGUgcGFuZWwuXG4vL1xuLy8gUGhhc2UgMTogdGhlIHNjaGVtYSBhY2NlcHRzIHRoZSBmaWVsZCBhcyBmb3J3YXJkLWNvbXBhdDsgdGhlIGVkaXRvclxuLy8gZG9lc24ndCBzdXJmYWNlIGl0LCBhbmQgdGhlIHJlbmRlcmVyIGlnbm9yZXMgaXQuIFBoYXNlIDIgd2lyZXMgdXAgdGhlXG4vLyBhdXRob3JpbmcgVUkgYW5kIHRoZSBzaWRlYmFyIGxheW91dCBpbiBwdWJsaXNoZWQgSFRNTC4gRmllbGQgaXNcbi8vIG9wdGlvbmFsIHdpdGggbm8gZGVmYXVsdCBvbiBBY3Rpdml0eURvY3VtZW50LCBzbyBleGlzdGluZyBzdG9yZWRcbi8vIGRvY3VtZW50cyBwYXJzZSBjbGVhbmx5LlxuLy9cbi8vIFJlbmRlcmVyIHdpbGwgdHJlYXQgcmVmZXJlbmNlIGNvbnRlbnQgYXMgZGF0YS1ibG9jay1jYXRlZ29yeT1cInNjYWZmb2xkXCJcbi8vIChQaGFzZSAyKykgXHUyMDE0IGRvZXNuJ3QgY29udHJpYnV0ZSB0byBzY29yaW5nIG9yIGNoZWNrcG9pbnQgYmVoYXZpb3IuXG5leHBvcnQgY29uc3QgUmVmZXJlbmNlUGFuZWwgPSB6Lm9iamVjdCh7XG4gIHRpdGxlOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBibG9ja3M6IHouYXJyYXkoQmxvY2spLFxufSk7XG5leHBvcnQgdHlwZSBSZWZlcmVuY2VQYW5lbCA9IHouaW5mZXI8dHlwZW9mIFJlZmVyZW5jZVBhbmVsPjtcblxuLy8gQ2FsY3VsYXRvciB0b29sOiBhbiBhY3Rpdml0eS1sZXZlbCBzY2FmZm9sZCwgYSBzaWJsaW5nIHRvIHRoZSByZWZlcmVuY2Vcbi8vIHBhbmVsIFx1MjAxNCBhIHRlYWNoZXItY29uZmlndXJhYmxlIG9uLXNjcmVlbiBjYWxjdWxhdG9yIGEgc3R1ZGVudCBzdW1tb25zIHdoaWxlXG4vLyB3b3JraW5nIChsaWtlIHRoZSBjYWxjdWxhdG9yIGFsbG93ZWQgb24gYSBkaWdpdGFsIFNBVCkuIEl0IGlzIE5FVkVSIHNjb3JlZCxcbi8vIHByb2R1Y2VzIG5vIHN1Ym1pc3Npb24sIGFuZCBjYXJyaWVzIG5vIGFuc3dlciBrZXk7IHRoZSByZW5kZXJlciB0cmVhdHMgaXQgYXNcbi8vIGRhdGEtYmxvY2stY2F0ZWdvcnk9XCJzY2FmZm9sZFwiIChvdXRzaWRlIGFueSAuYWN0aXZpdHktc2VjdGlvbiwgc28gdGhlIHNjb3Jpbmdcbi8vIHJ1bnRpbWUgbmV2ZXIgc2VlcyBpdCkuIEl0IHRyYXZlbHMgaW4gdGhlIHdpcmUgZm9ybWF0LCBjb25maWd1cmVkIG9uY2UgcGVyXG4vLyBhY3Rpdml0eSwgYW5kIGlzIG9wdGlvbmFsIHNvIGV4aXN0aW5nIHN0b3JlZCBkb2N1bWVudHMgcGFyc2UgdW5jaGFuZ2VkIFx1MjAxNCBub1xuLy8gc2NoZW1hVmVyc2lvbiBidW1wIChzYW1lIGZvcndhcmQtY29tcGF0IHN0b3J5IGFzIHJlZmVyZW5jZVBhbmVsL3ByaW50KS5cbi8vXG4vLyBSZXN0cmljdGlvbnMgYXJlIFBFUk1JU1NJVkUgYnkgZGVmYXVsdDogYW4gZW5hYmxlZC1idXQtdW5jb25maWd1cmVkXG4vLyBjYWxjdWxhdG9yIGlzIGEgZnVsbCB0b29sOyB0ZWFjaGVycyBvcHQgSU5UTyByZXN0cmljdGlvbnMsIG5ldmVyIG91dCBvZlxuLy8gY2FwYWJpbGl0eS4gTGF0ZXIgZmxhZ3MgKGxvY2tWaWV3cG9ydCwgYWxsb3dlZFJlZ3Jlc3Npb25Nb2RlbHMsXG4vLyBtYXhFeHByZXNzaW9uc1x1MjAyNikgYXJlIGFkZGVkIGFkZGl0aXZlbHkgYXMgZ3JhcGhpbmctdHJhY2sgc3RhZ2VzIGxhbmQgXHUyMDE0IGFsbFxuLy8gb3B0aW9uYWwvZGVmYXVsdGVkLCBzbyBzdGlsbCBubyBzY2hlbWFWZXJzaW9uIGJ1bXAuXG4vL1xuLy8gYG1vZGVgIGlzIHRoZSBjYXBhYmlsaXR5IGNlaWxpbmcuIFRoZSBlbnVtIGNhcnJpZXMgdGhlIGZ1bGwgY29udHJhY3Qgbm93LCBidXRcbi8vIHRoZSBkZWZhdWx0IGlzICdzY2llbnRpZmljJyBiZWNhdXNlIHRoYXQgaXMgdGhlIG9ubHkgY2FwYWJpbGl0eSBTdGFnZSAxXG4vLyBpbXBsZW1lbnRzIFx1MjAxNCBhbiBlbmFibGVkIGNhbGN1bGF0b3IgZG9lcyBleGFjdGx5IHdoYXQgaXMgYnVpbHQuIFRoZSBkZWZhdWx0XG4vLyBtYXkgZmxpcCB0byAnZ3JhcGhpbmcnIG9uY2UgdGhlIGJvYXJkIGxheWVyIGxhbmRzIChTdGFnZSAyKS5cbi8vIFN0YWdlIDM6IHdoaWNoIGZpdCBtb2RlbHMgdGhlIGdyYXBoaW5nIGNhbGN1bGF0b3IncyBkYXRhL3JlZ3Jlc3Npb24gcGFuZWxcbi8vIG9mZmVycy4gUGVybWlzc2l2ZSBkZWZhdWx0IChhbGwgdGhyZWUpOyBhbiBFTVBUWSBhcnJheSB0dXJucyByZWdyZXNzaW9uIG9mZlxuLy8gZW50aXJlbHkgKG5vIGRhdGEgcGFuZWwpLiBPbmx5IG1lYW5pbmdmdWwgdW5kZXIgbW9kZSAnZ3JhcGhpbmcnIFx1MjAxNCB0aGVcbi8vICdzY2llbnRpZmljJyBjZWlsaW5nIGFscmVhZHkgZXhjbHVkZXMgdGhlIGJvYXJkIHRoZSBmaXRzIGRyYXcgb24uXG4vLyAnbG9nYXJpdGhtaWMnIGpvaW5lZCAyMDI2LTA3LTExIChjYWxjdWxhdG9yLXBhcml0eSBiYXRjaCk6IHRoZSBraXQgY29tcHV0ZWRcbi8vIGxvZyBmaXRzIGFsbCBhbG9uZzsgdGhlIGVudW0gd2FzIHRoZSBvbmx5IGdhcC4gTk9URSBhIHN0b3JlZCBkb2MgdGhhdCBjYXJyaWVzXG4vLyB0aGUgZXhwbGljaXQgdGhyZWUtbW9kZWwgYXJyYXkgc3RheXMgdGhyZWUtbW9kZWwgKGluZGlzdGluZ3Vpc2hhYmxlIGZyb20gYVxuLy8gZGVsaWJlcmF0ZSByZXN0cmljdGlvbikgdW50aWwgdGhlIHRlYWNoZXIgdG91Y2hlcyB0aGUgY29uZmlnIFx1MjAxNCBhY2NlcHRlZCBhdFxuLy8gdGhlIGRlc2lnbiBwYXNzOyB0aGUgcGVybWlzc2l2ZSBkZWZhdWx0IG9ubHkgYXBwbGllcyB3aGVuIHRoZSBmaWVsZCBpcyBhYnNlbnQuXG5leHBvcnQgY29uc3QgUmVncmVzc2lvbk1vZGVsID0gei5lbnVtKFtcbiAgJ2xpbmVhcicsXG4gICdxdWFkcmF0aWMnLFxuICAnZXhwb25lbnRpYWwnLFxuICAnbG9nYXJpdGhtaWMnLFxuXSk7XG5leHBvcnQgdHlwZSBSZWdyZXNzaW9uTW9kZWwgPSB6LmluZmVyPHR5cGVvZiBSZWdyZXNzaW9uTW9kZWw+O1xuXG5leHBvcnQgY29uc3QgQ2FsY3VsYXRvclJlc3RyaWN0aW9ucyA9IHoub2JqZWN0KHtcbiAgbW9kZTogei5lbnVtKFsnc2NpZW50aWZpYycsICdncmFwaGluZyddKS5kZWZhdWx0KCdzY2llbnRpZmljJyksXG4gIGFsbG93VHJpZzogei5ib29sZWFuKCkuZGVmYXVsdCh0cnVlKSxcbiAgYWxsb3dMb2dFeHA6IHouYm9vbGVhbigpLmRlZmF1bHQodHJ1ZSksXG4gIC8vIEluZXF1YWxpdHkgcm93cyBpbiB0aGUgZ3JhcGhpbmcgZXhwcmVzc2lvbiBsaXN0IChjYWxjdWxhdG9yLXBhcml0eSBiYXRjaCkuXG4gIC8vIEFkZGl0aXZlICsgZGVmYXVsdGVkIGxpa2UgdGhlIG90aGVyIGdhdGVzIFx1MjAxNCBubyBzY2hlbWFWZXJzaW9uIGJ1bXA7IHRoZSBraXRcbiAgLy8gcmVhZHMgYSBtaXNzaW5nIHZhbHVlIGFzIHBlcm1pc3NpdmUsIHNvIG9sZCBwdWJsaXNoZWQgcGFnZXMgc3RheSBmdWxsLXRvb2wuXG4gIGFsbG93SW5lcXVhbGl0aWVzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxuICBhbGxvd2VkUmVncmVzc2lvbk1vZGVsczogelxuICAgIC5hcnJheShSZWdyZXNzaW9uTW9kZWwpXG4gICAgLmRlZmF1bHQoWydsaW5lYXInLCAncXVhZHJhdGljJywgJ2V4cG9uZW50aWFsJywgJ2xvZ2FyaXRobWljJ10pLFxuICAvLyBTdGFnZSA0OiBjYXAgb24gdGhlIGdyYXBoaW5nIGV4cHJlc3Npb24gbGlzdC4gQUJTRU5UID0gdW5saW1pdGVkICh0aGVcbiAgLy8gcGVybWlzc2l2ZSBkZWZhdWx0IFx1MjAxNCBvcHRpb25hbCwgbm90IGRlZmF1bHRlZCwgc28gaXQgc3RheXMgb3V0IG9mIHN0b3JlZFxuICAvLyBkb2NzIHVubGVzcyBhIHRlYWNoZXIgc2V0cyBpdCkuIEdyYXBoaW5nIG1vZGUgb25seS5cbiAgbWF4RXhwcmVzc2lvbnM6IHoubnVtYmVyKCkuaW50KCkubWluKDEpLm1heCg1MCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgQ2FsY3VsYXRvclJlc3RyaWN0aW9ucyA9IHouaW5mZXI8dHlwZW9mIENhbGN1bGF0b3JSZXN0cmljdGlvbnM+O1xuXG5leHBvcnQgY29uc3QgQ2FsY3VsYXRvclRvb2wgPSB6Lm9iamVjdCh7XG4gIGVuYWJsZWQ6IHouYm9vbGVhbigpLmRlZmF1bHQoZmFsc2UpLFxuICByZXN0cmljdGlvbnM6IENhbGN1bGF0b3JSZXN0cmljdGlvbnMuZGVmYXVsdCh7fSksXG59KTtcbmV4cG9ydCB0eXBlIENhbGN1bGF0b3JUb29sID0gei5pbmZlcjx0eXBlb2YgQ2FsY3VsYXRvclRvb2w+O1xuXG4vLyBUaGUgZXhwbGljaXQgdHlwZSArIHouWm9kVHlwZSBhbm5vdGF0aW9uIChpbnN0ZWFkIG9mIHouaW5mZXIpIGV4aXN0cyBiZWNhdXNlXG4vLyB0aGUgZnVsbHkgaW5mZXJyZWQgZG9jdW1lbnQgdHlwZSBvdXRncmV3IHRzYydzIGRlY2xhcmF0aW9uLXNlcmlhbGl6YXRpb25cbi8vIGxpbWl0IChUUzcwNTYpIHdoZW4gdGhlIEJsb2NrIHVuaW9uIHJlYWNoZWQgMTQgbWVtYmVycy4gU3RydWN0dXJhbGx5XG4vLyBpZGVudGljYWwgdG8gd2hhdCBpbmZlcmVuY2UgcHJvZHVjZWQ7IG5vdGhpbmcgaGVyZSBsb3NlcyB0eXBlIHNhZmV0eSBcdTIwMTRcbi8vIHRoZSBhbm5vdGF0aW9uIGlzIGNoZWNrZWQgYWdhaW5zdCB0aGUgb2JqZWN0IHNjaGVtYS5cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZpdHlEb2N1bWVudCB7XG4gIHNjaGVtYVZlcnNpb246IDI7XG4gIG1ldGE6IEFjdGl2aXR5TWV0YTtcbiAgc2VjdGlvbnM6IFNlY3Rpb25bXTtcbiAgcmVmZXJlbmNlUGFuZWw/OiBSZWZlcmVuY2VQYW5lbDtcbiAgY2FsY3VsYXRvcj86IENhbGN1bGF0b3JUb29sO1xufVxuZXhwb3J0IGNvbnN0IEFjdGl2aXR5RG9jdW1lbnQ6IHouWm9kVHlwZTxBY3Rpdml0eURvY3VtZW50LCB6LlpvZFR5cGVEZWYsIHVua25vd24+ID1cbiAgei5vYmplY3Qoe1xuICAgIHNjaGVtYVZlcnNpb246IHoubGl0ZXJhbCgyKSxcbiAgICBtZXRhOiBBY3Rpdml0eU1ldGEsXG4gICAgc2VjdGlvbnM6IHouYXJyYXkoU2VjdGlvbiksXG4gICAgcmVmZXJlbmNlUGFuZWw6IFJlZmVyZW5jZVBhbmVsLm9wdGlvbmFsKCksXG4gICAgY2FsY3VsYXRvcjogQ2FsY3VsYXRvclRvb2wub3B0aW9uYWwoKSxcbiAgfSk7XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHVwZ3JhZGUudHMgXHUyMDE0IHNlcnZlci1zaWRlIHVwZ3JhZGUtb24tcmVhZCAoY29tcG9uZW50cy1hcy1kYXRhIHJ1bGluZyA0QSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgcmVhZCBBUEkgKFMyKSB1cGdyYWRlcyBldmVyeSBzdG9yZWQgYWN0aXZpdHlfdmVyc2lvbnMuY29udGVudCB0byB0aGVcbi8vIENVUlJFTlQgc2NoZW1hIGJlZm9yZSBzYW5pdGl6aW5nIGFuZCBzZXJ2aW5nIGl0LCBzbyB0aGUgdmlld2VyIG9ubHkgZXZlclxuLy8gc2VlcyB0aGUgbGF0ZXN0IHNoYXBlLiBUaGlzIG1vZHVsZSBpcyB0aGF0IHNlYW0uXG4vL1xuLy8gVGhlIGNoYWluIGlzIEVNUFRZIHRvZGF5LCBkZWxpYmVyYXRlbHk6IHNjaGVtYVZlcnNpb24gaXMgMiBhbmQgdGhlIDFcdTIxOTIyXG4vLyByZXNoYXBlIHdhcyBhIGdyZWVuZmllbGQgaGFyZC1jdXQgd2l0aCBubyBtaWdyYXRlIHBhdGggKGRvY3VtZW50LnRzIGhlYWRlciBcdTIwMTRcbi8vIGEgc3RyYXkgdjEgZmFpbHMgbG91ZGx5IHJhdGhlciB0aGFuIG1pcy1wYXJzaW5nKS4gV2hlbiBzY2hlbWFWZXJzaW9uIDNcbi8vIGxhbmRzLCBpdHMgbWlncmF0aW9uIGlzIG9uZSBwdXJlIGVudHJ5IGluIFVQR1JBREVTIGJlbG93OyBzdG9yZWQgcm93cyBzdGF5XG4vLyBhdCB0aGVpciBvcmlnaW5hbCB2ZXJzaW9uIGZvcmV2ZXIgYW5kIGFyZSB1cGdyYWRlZCBvbiByZWFkLCBuZXZlciBtdXRhdGVkLlxuLy9cbi8vIERpc3RpbmN0IGZyb20gdGhlIHR3byBvdGhlciBcInVwZ3JhZGVcIiBsYXllcnMsIG9uIHB1cnBvc2U6XG4vLyAgIC0gTWFyay9kZWZpbml0aW9uIGxlZ2FjeSBwcmVwcm9jZXNzaW5nIChpbmxpbmUudHMpIHJ1bnMgSU5TSURFXG4vLyAgICAgQWN0aXZpdHlEb2N1bWVudC5wYXJzZSBcdTIwMTQgYWRkaXRpdmUgc2hhcGUgZHJpZnQgd2l0aGluIG9uZSBzY2hlbWFWZXJzaW9uLlxuLy8gICAtIG1pZ3JhdGVTdWJtaXNzaW9uUmVzcG9uc2VzIChzdWJtaXNzaW9uLnRzKSBpcyB0aGUgU1VCTUlTU0lPTiB3aXJlJ3Ncbi8vICAgICBsYWRkZXIgXHUyMDE0IGEgZGlmZmVyZW50IGRvY3VtZW50IHdpdGggaXRzIG93biB2ZXJzaW9uaW5nLlxuLy8gVGhpcyBtb2R1bGUgb3ducyBvbmx5IHRoZSB0b3AtbGV2ZWwgQWN0aXZpdHlEb2N1bWVudCBzY2hlbWFWZXJzaW9uLlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgQWN0aXZpdHlEb2N1bWVudCB9IGZyb20gJy4vZG9jdW1lbnQuanMnO1xuXG4vKiogVGhlIHNjaGVtYVZlcnNpb24gdGhpcyBidWlsZCBwYXJzZXMgYW5kIHNlcnZlcy4gR3VhcmQtdGVzdGVkIGFnYWluc3QgdGhlXG4gKiBBY3Rpdml0eURvY3VtZW50IGxpdGVyYWwgc28gdGhlIGNvbnN0YW50IGNhbid0IGRyaWZ0IGZyb20gdGhlIHBhcnNlci4gKi9cbmV4cG9ydCBjb25zdCBBQ1RJVklUWV9TQ0hFTUFfVkVSU0lPTiA9IDI7XG5cbi8qKiBUaHJvd24gd2hlbiBzdG9yZWQgY29udGVudCBjYW5ub3QgYmUgYnJvdWdodCB0byB0aGUgY3VycmVudCBzY2hlbWEuIFRoZVxuICogcmVhZCBBUEkgbWFwcyB0aGlzIHRvIGFuIGV4cGxpY2l0IGVycm9yIHN0YXRlIChmYWlsdXJlLW1vZGVzIHRhYmxlOiBcInVwZ3JhZGVcbiAqIGNoYWluIGJ1ZyBvbiBvbGQgdmVyc2lvblwiIFx1MjE5MiBjbGVhciBlcnJvciwgbmV2ZXIgYSB3aGl0ZSBzY3JlZW4pLiAqL1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIC8qKiBUaGUgc2NoZW1hVmVyc2lvbiB0aGUgc3RvcmVkIGRvY3VtZW50IGNsYWltZWQsIHdoZW4gcmVhZGFibGUuICovXG4gICAgcmVhZG9ubHkgc3RvcmVkVmVyc2lvbj86IG51bWJlcixcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gJ1VwZ3JhZGVFcnJvcic7XG4gIH1cbn1cblxuLyoqIE9uZSBzdGVwIG9mIHRoZSBjaGFpbjogYSBQVVJFIGpzb24gXHUyMTkyIGpzb24gcmV3cml0ZSBmcm9tIGBmcm9tYCB0byBgZnJvbSsxYC5cbiAqIE5vIEkvTywgbm8gcmFuZG9tbmVzcywgbm8gRGF0ZSBcdTIwMTQgdXBncmFkaW5nIHRoZSBzYW1lIHN0b3JlZCByb3cgdHdpY2UgbXVzdFxuICogeWllbGQgaWRlbnRpY2FsIG91dHB1dCAodGhlIHBlci12ZXJzaW9uIHJlYWQgY2FjaGUgZGVwZW5kcyBvbiBpdCkuICovXG5pbnRlcmZhY2UgVXBncmFkZVN0ZXAge1xuICByZWFkb25seSBmcm9tOiBudW1iZXI7XG4gIHJlYWRvbmx5IHJ1bjogKHJhdzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG4vLyBUaGUgY2hhaW4uIEFwcGVuZC1vbmx5OyBlYWNoIGVudHJ5IGJ1bXBzIGV4YWN0bHkgb25lIHZlcnNpb24uIEVtcHR5IHRvZGF5IFx1MjAxNFxuLy8gc2VlIHRoZSBoZWFkZXIgZm9yIHdoeSB2MSBkZWxpYmVyYXRlbHkgaGFzIG5vIGVudHJ5LlxuY29uc3QgVVBHUkFERVM6IHJlYWRvbmx5IFVwZ3JhZGVTdGVwW10gPSBbXTtcblxuZXhwb3J0IGludGVyZmFjZSBVcGdyYWRlUmVzdWx0IHtcbiAgLyoqIFRoZSBkb2N1bWVudCwgcGFyc2VkIGFuZCB2YWxpZGF0ZWQgYXQgdGhlIENVUlJFTlQgc2NoZW1hLiAqL1xuICBkb2M6IEFjdGl2aXR5RG9jdW1lbnQ7XG4gIC8qKiBUaGUgc2NoZW1hVmVyc2lvbiB0aGUgc3RvcmVkIGNvbnRlbnQgYXJyaXZlZCBhdCAoPT09IGN1cnJlbnQgd2hlbiBub1xuICAgKiBjaGFpbiBzdGVwIHJhbikuIENhbGxlcnMgbWF5IGxvZyBpdDsgdGhlIGNhY2hlIHN0b3JlcyB0aGUgdGFyZ2V0LiAqL1xuICBmcm9tU2NoZW1hVmVyc2lvbjogbnVtYmVyO1xufVxuXG4vKipcbiAqIEJyaW5nIHJhdyBzdG9yZWQgY29udGVudCAoYWN0aXZpdHlfdmVyc2lvbnMuY29udGVudCkgdG8gdGhlIGN1cnJlbnQgc2NoZW1hXG4gKiBhbmQgdmFsaWRhdGUgaXQuIFRocm93cyBVcGdyYWRlRXJyb3Igb24gYW55IGNvbnRlbnQgdGhpcyBidWlsZCBjYW5ub3Qgc2VydmVcbiAqIFx1MjAxNCBhbiB1bmtub3duL2Z1dHVyZSB2ZXJzaW9uLCBhIHZlcnNpb24gd2l0aCBubyBjaGFpbiBwYXRoLCBvciBjb250ZW50IHRoYXRcbiAqIGZhaWxzIHZhbGlkYXRpb24gYWZ0ZXIgdXBncmFkaW5nLiBOZXZlciByZXR1cm5zIGEgcGFydGlhbGx5LXVwZ3JhZGVkIGRvYy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZ3JhZGVBY3Rpdml0eURvY3VtZW50KHJhdzogdW5rbm93bik6IFVwZ3JhZGVSZXN1bHQge1xuICBpZiAocmF3ID09PSBudWxsIHx8IHR5cGVvZiByYXcgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkocmF3KSkge1xuICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoJ1N0b3JlZCBjb250ZW50IGlzIG5vdCBhbiBvYmplY3QnKTtcbiAgfVxuICBjb25zdCBzdG9yZWQgPSByYXcgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGNvbnN0IHZlcnNpb24gPSBzdG9yZWQuc2NoZW1hVmVyc2lvbjtcbiAgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcih2ZXJzaW9uKSkge1xuICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoJ1N0b3JlZCBjb250ZW50IGhhcyBubyBpbnRlZ2VyIHNjaGVtYVZlcnNpb24nKTtcbiAgfVxuICBpZiAodmVyc2lvbiA+IEFDVElWSVRZX1NDSEVNQV9WRVJTSU9OKSB7XG4gICAgLy8gQ29udGVudCB3cml0dGVuIGJ5IGEgTkVXRVIgYnVpbGQgdGhhbiB0aGlzIG9uZSAoZGVwbG95LW9yZGVyIHNsaXApLlxuICAgIHRocm93IG5ldyBVcGdyYWRlRXJyb3IoXG4gICAgICBgU3RvcmVkIHNjaGVtYVZlcnNpb24gJHt2ZXJzaW9ufSBpcyBuZXdlciB0aGFuIHRoaXMgYnVpbGQncyBgICtcbiAgICAgICAgYCR7QUNUSVZJVFlfU0NIRU1BX1ZFUlNJT059IFx1MjAxNCByZWZ1c2luZyB0byBndWVzc2AsXG4gICAgICB2ZXJzaW9uLFxuICAgICk7XG4gIH1cblxuICBsZXQgY3VycmVudCA9IHN0b3JlZDtcbiAgbGV0IGF0ID0gdmVyc2lvbjtcbiAgd2hpbGUgKGF0IDwgQUNUSVZJVFlfU0NIRU1BX1ZFUlNJT04pIHtcbiAgICBjb25zdCBzdGVwID0gVVBHUkFERVMuZmluZCgodSkgPT4gdS5mcm9tID09PSBhdCk7XG4gICAgaWYgKCFzdGVwKSB7XG4gICAgICAvLyB2MSBsYW5kcyBoZXJlIGJ5IGRlc2lnbiAoZ3JlZW5maWVsZCBoYXJkLWN1dDogbm8gbWlncmF0ZSgxXHUyMTkyMikpLlxuICAgICAgdGhyb3cgbmV3IFVwZ3JhZGVFcnJvcihcbiAgICAgICAgYE5vIHVwZ3JhZGUgcGF0aCBmcm9tIHNjaGVtYVZlcnNpb24gJHthdH0gXHUyMDE0IGNhbm5vdCBzZXJ2ZWAsXG4gICAgICAgIHZlcnNpb24sXG4gICAgICApO1xuICAgIH1cbiAgICBjdXJyZW50ID0gc3RlcC5ydW4oY3VycmVudCk7XG4gICAgYXQgKz0gMTtcbiAgfVxuXG4gIGNvbnN0IHBhcnNlZCA9IEFjdGl2aXR5RG9jdW1lbnQuc2FmZVBhcnNlKGN1cnJlbnQpO1xuICBpZiAoIXBhcnNlZC5zdWNjZXNzKSB7XG4gICAgdGhyb3cgbmV3IFVwZ3JhZGVFcnJvcihcbiAgICAgIGBDb250ZW50IGZhaWxlZCB2YWxpZGF0aW9uIGF0IHNjaGVtYVZlcnNpb24gJHthdH06IGAgK1xuICAgICAgICBwYXJzZWQuZXJyb3IuaXNzdWVzXG4gICAgICAgICAgLnNsaWNlKDAsIDMpXG4gICAgICAgICAgLm1hcCgoaSkgPT4gYCR7aS5wYXRoLmpvaW4oJy4nKX06ICR7aS5tZXNzYWdlfWApXG4gICAgICAgICAgLmpvaW4oJzsgJyksXG4gICAgICB2ZXJzaW9uLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHsgZG9jOiBwYXJzZWQuZGF0YSwgZnJvbVNjaGVtYVZlcnNpb246IHZlcnNpb24gfTtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc3VibWlzc2lvbi50cyBcdTIwMTQgU3VibWlzc2lvblJlc3BvbnNlcyBzY2hlbWFcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc2hhcGUgb2Ygc3VibWlzc2lvbnMucmVzcG9uc2VzIGpzb25iLiBLZXllZCBieSBzdGFibGUgYmxhbmsuaWQgZnJvbVxuLy8gdGhlIGRvY3VtZW50IHNvIHBlci1ibGFuayBhZ2dyZWdhdGlvbiBxdWVyaWVzIHdvcmsgZXZlbiB3aGVuIGJsb2NrcyBhcmVcbi8vIHJlb3JkZXJlZCBiZXR3ZWVuIGRvY3VtZW50IHZlcnNpb25zLlxuLy9cbi8vIHNjaGVtYVZlcnNpb24gaGVyZSBpcyBpbmRlcGVuZGVudCBvZiBBY3Rpdml0eURvY3VtZW50LnNjaGVtYVZlcnNpb24gXHUyMDE0XG4vLyB0aGV5IGV2b2x2ZSBzZXBhcmF0ZWx5LiBXaGVuIHRoaXMgc2NoZW1hIGNoYW5nZXMgKGUuZy4sIGFkZGluZyBwYXJ0aWFsLVxuLy8gY3JlZGl0IHNjb3JpbmcpLCBidW1wIFRISVMgc2NoZW1hVmVyc2lvbiBhbmQgbWlncmF0ZSBvbiByZWFkLlxuLy9cbi8vIE5vdGU6IGF0dGVtcHRfbnVtYmVyIGxpdmVzIG9uIHRoZSBzdWJtaXNzaW9ucyB0YWJsZSBhcyBhIGNvbHVtbiwgbm90IGluXG4vLyB0aGlzIGpzb25iLiBUaGUgRWRnZSBGdW5jdGlvbiBkZXJpdmVzIGl0IHNlcnZlci1zaWRlIGZyb21cbi8vIG1heChhdHRlbXB0X251bWJlcikgKyAxIGZvciB0aGUgc3R1ZGVudCdzIGlkZW50aXR5LCBhbmQgc3RvcmVzIGl0IGluXG4vLyB0aGUgaW5kZXhlZCBjb2x1bW4uIFRoZSBjbGllbnQgbWF5IHNlbmQgYSB2YWx1ZSBmb3Igb3B0aW1pc3RpYyBVSSwgYnV0XG4vLyB0aGUgc2VydmVyJ3MgdmFsdWUgaXMgY2Fub25pY2FsIGFuZCB0aGUganNvbmIgZG9lc24ndCBlY2hvIGl0LlxuLy9cbi8vIE1pZ3JhdGlvbiBoaXN0b3J5OlxuLy8gICB2MSBcdTIxOTIgdjIgKFN0YWdlIDlhKTogYWRkcyBvcHRpb25hbCBjb25maWRlbmNlIHBlciBibGFuayBhbmQgb3B0aW9uYWxcbi8vICAgICAgICAgICAgICAgICAgICAgICBjaGVja3BvaW50UmVzdWx0cy4gdjEgc3VibWlzc2lvbnMgbWlncmF0ZS1vbi1yZWFkXG4vLyAgICAgICAgICAgICAgICAgICAgICAgdG8gdjIgYnkgc2V0dGluZyBzY2hlbWFWZXJzaW9uOiAyIChvdGhlciBmaWVsZHNcbi8vICAgICAgICAgICAgICAgICAgICAgICBhcmUgdW5jaGFuZ2VkIG9yIG9wdGlvbmFsLWFuZC1hYnNlbnQgaW4gdjEpLlxuLy8gICB2MiBcdTIxOTIgdjMgKFN0YWdlIDUsIFBoYXNlIDIuNyk6IGFkZHMgdGhlIG9wdGlvbmFsIGdyYXBoUmVzcG9uc2VzIG1hcCBmb3Jcbi8vICAgICAgICAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZS1ncmFwaCBibG9ja3MuIHYyIHN1Ym1pc3Npb25zIG1pZ3JhdGUtb24tXG4vLyAgICAgICAgICAgICAgICAgICAgICAgcmVhZCB0byB2MyBieSBzZXR0aW5nIHNjaGVtYVZlcnNpb246IDMgKGdyYXBoUmVzcG9uc2VzXG4vLyAgICAgICAgICAgICAgICAgICAgICAgc2ltcGx5IGFic2VudCBcdTIwMTQgdmFsaWQgZm9yIGFuIG9wdGlvbmFsIGZpZWxkKS5cbi8vICAgdjQgXHUyMTkyIHY1IChtdWx0aXBsZSBjaG9pY2UpOiBhZGRzIHRoZSBvcHRpb25hbCBgY2hvaWNlc2AgbWFwIGZvclxuLy8gICAgICAgICAgICAgICAgICAgICAgIG11bHRpcGxlX2Nob2ljZSBibG9ja3MgKENob2ljZVJlc3BvbnNlOiBzZWxlY3RlZFxuLy8gICAgICAgICAgICAgICAgICAgICAgIGNob2ljZSBpZHMgKyBjb3JyZWN0ICsgY29uZmlkZW5jZSkuIHY0IHJvd3MgbWlncmF0ZVxuLy8gICAgICAgICAgICAgICAgICAgICAgIG9uIHJlYWQgYnkgc2V0dGluZyBzY2hlbWFWZXJzaW9uOiA1LlxuLy8gICB2NSBcdTIxOTIgdjYgKG1hdGNoaW5nICsgb3JkZXJpbmcpOiBhZGRzIHRoZSBvcHRpb25hbCBgbWF0Y2hlc2AgbWFwXG4vLyAgICAgICAgICAgICAgICAgICAgICAgKE1hdGNoUmVzcG9uc2U6IGl0ZW1cdTIxOTJ0YXJnZXQgcGFpcnMgKyBwZXItcGFpclxuLy8gICAgICAgICAgICAgICAgICAgICAgIGVhcm5lZC90b3RhbCkgYW5kIGBvcmRlcmluZ3NgIG1hcCAoT3JkZXJSZXNwb25zZTpcbi8vICAgICAgICAgICAgICAgICAgICAgICB0aGUgYXJyYW5nZWQgaXRlbS1pZCBzZXF1ZW5jZSwgYWxsLW9yLW5vdGhpbmcpLlxuLy8gICAgICAgICAgICAgICAgICAgICAgIHY1IHJvd3MgbWlncmF0ZSBvbiByZWFkIGJ5IHNldHRpbmcgc2NoZW1hVmVyc2lvbjogNi5cbi8vICAgdjYgXHUyMTkyIHY3IChudW1iZXIgbGluZSk6IGFkZHMgdGhlIG9wdGlvbmFsIGBudW1iZXJMaW5lUmVzcG9uc2VzYCBtYXBcbi8vICAgICAgICAgICAgICAgICAgICAgICAoTnVtYmVyTGluZVJlc3BvbnNlOiBwbG90dGVkIDEtRCBwb2ludHMsIG9yIGFuXG4vLyAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWwvcmF5IHdpdGggb3Blbi9jbG9zZWQgYm91bmRzOyBhbGwtb3Itbm90aGluZykuXG4vLyAgICAgICAgICAgICAgICAgICAgICAgdjYgcm93cyBtaWdyYXRlIG9uIHJlYWQgYnkgc2V0dGluZyBzY2hlbWFWZXJzaW9uOiA3LlxuLy8gICB2NyBcdTIxOTIgdjggKGRhdGEgcGxvdCk6IGFkZHMgdGhlIG9wdGlvbmFsIGBkYXRhUGxvdFJlc3BvbnNlc2AgbWFwXG4vLyAgICAgICAgICAgICAgICAgICAgICAgKERhdGFQbG90UmVzcG9uc2U6IHRoZSBzdHVkZW50J3MgYnVpbHQgY2hhcnQsIGUuZy4gdGhlXG4vLyAgICAgICAgICAgICAgICAgICAgICAgcGxvdHRlZCBkb3QtcGxvdCB2YWx1ZXM7IGFsbC1vci1ub3RoaW5nKS4gZGlzcGxheS1tb2RlXG4vLyAgICAgICAgICAgICAgICAgICAgICAgZGF0YV9wbG90cyBhcmUgdW5ncmFkZWQgc3RpbXVsaSBhbmQgbmV2ZXIgYXBwZWFyIGhlcmUuXG4vLyAgICAgICAgICAgICAgICAgICAgICAgdjcgcm93cyBtaWdyYXRlIG9uIHJlYWQgYnkgc2V0dGluZyBzY2hlbWFWZXJzaW9uOiA4LlxuLy8gICB2OCBcdTIxOTIgdjkgKHNlbGYtZXhwbGFuYXRpb24pOiBhZGRzIHRoZSBvcHRpb25hbCBgZnJlZVJlc3BvbnNlc2AgbWFwXG4vLyAgICAgICAgICAgICAgICAgICAgICAgKEZyZWVSZXNwb25zZTogdW5ncmFkZWQgZnJlZSB0ZXh0LCBqdXN0IHsgdGV4dCB9KS4gTmV2ZXJcbi8vICAgICAgICAgICAgICAgICAgICAgICBzY29yZWQuIHY4IHJvd3MgbWlncmF0ZSBvbiByZWFkIGJ5IHNldHRpbmdcbi8vICAgICAgICAgICAgICAgICAgICAgICBzY2hlbWFWZXJzaW9uOiA5LlxuLy9cbi8vIEV4dGVuc2lvbiBwYXR0ZXJuIFx1MjAxNCBhZGRpbmcgbmV3IHJlc3BvbnNlIHNoYXBlcyAoUGhhc2UgMispOlxuLy8gICBXaGVuIGEgbmV3IHF1ZXN0aW9uIGNhdGVnb3J5IG5lZWRzIGEgZGlmZmVyZW50IHJlc3BvbnNlIHNoYXBlIFx1MjAxNCBNQ1xuLy8gICBzZWxlY3Rpb25zLCBvcmRlcmluZyBhcnJhbmdlbWVudHMsIG1hdGNoaW5nIHBhaXJzLCBncmFwaCBpbnB1dHMsIGZpbGVcbi8vICAgdXBsb2FkcywgZXNzYXkgdGV4dCwgYW5ub3RhdGlvbnMgXHUyMDE0IGl0IGdldHMgaXRzIG93biBrZXllZC1ieS11dWlkXG4vLyAgIG9wdGlvbmFsIG1hcCBvbiBTdWJtaXNzaW9uUmVzcG9uc2VzLCBzaWJsaW5nIHRvIGBibGFua3NgLiBEb24ndCB3aWRlblxuLy8gICBCbGFua1Jlc3BvbnNlLmFuc3dlciB0byBhIHVuaW9uIHdpdGggb2JqZWN0IHR5cGVzOyB0aGF0IGZvcmNlcyBldmVyeVxuLy8gICBjb25zdW1lciAodGVhY2hlciBkYXNoYm9hcmQsIGZ1dHVyZSBhbmFseXRpY3MsIHBlci1ibGFuayBhZ2dyZWdhdGlvblxuLy8gICBxdWVyaWVzKSB0byBhZGQgdHlwZSBndWFyZHMgb24gd2hhdCBzaG91bGQgcmVtYWluIGEgdXVpZC1rZXllZC1zdHJpbmdcbi8vICAgbWFwLiBUeXBlIHB1cml0eSBhdCB0aGUgY29uc3VtZXIgYm91bmRhcnkgaXMgdGhlIGdvYWwuXG4vL1xuLy8gICBQbGFubmVkIGZ1dHVyZSBtYXBzIChlYWNoIGxhbmRzIHdpdGggdGhlIGJsb2NrIHR5cGUgdGhhdCBuZWVkcyBpdCk6XG4vLyAgICAgY2hvaWNlcyAgICAgICAgIFx1MjAxNCBTSElQUEVEIGF0IHY1IChtdWx0aXBsZSBjaG9pY2UsIHNpbmdsZSArIG11bHRpLXNlbGVjdClcbi8vICAgICBtYXRjaGVzICAgICAgICAgXHUyMDE0IFNISVBQRUQgYXQgdjYgKG1hdGNoaW5nIHBhaXJzLCBwZXItcGFpciBlYXJuZWQvdG90YWwpXG4vLyAgICAgb3JkZXJpbmdzICAgICAgIFx1MjAxNCBTSElQUEVEIGF0IHY2IChvcmRlcmluZyAvIHNlcXVlbmNpbmcsIGFsbC1vci1ub3RoaW5nKVxuLy8gICAgIGZyZWVSZXNwb25zZXMgICBcdTIwMTQgU0hJUFBFRCBhdCB2OSAoc2VsZi1leHBsYW5hdGlvbjsgUGhhc2UgMi42IHNob3J0X2Fuc3dlclxuLy8gICAgICAgICAgICAgICAgICAgICAgIC8gZXNzYXkgcmV1c2UgdGhlIHNhbWUgbWFwLCBubyBmdXJ0aGVyIHdpcmUgYnVtcClcbi8vICAgICBncmFwaFJlc3BvbnNlcyAgXHUyMDE0IFBoYXNlIDIuNyBpbnRlcmFjdGl2ZSBncmFwaHNcbi8vICAgICBudW1iZXJMaW5lUmVzcG9uc2VzIFx1MjAxNCBQaGFzZSAyLjcgbnVtYmVyLWxpbmUgYmxvY2tzICgxLUQpXG4vLyAgICAgZGF0YVBsb3RSZXNwb25zZXMgXHUyMDE0IFBoYXNlIDIuNyBkYXRhLXBsb3QgYmxvY2tzIChzdGF0cyBjaGFydHMpXG4vLyAgICAgZmlsZXMgICAgICAgICAgIFx1MjAxNCBQaGFzZSAyLjggYXVkaW8gLyB2aWRlbyAvIGZpbGUgdXBsb2FkXG4vLyAgICAgYW5ub3RhdGlvbnMgICAgIFx1MjAxNCBQaGFzZSAyLjkgaGlnaGxpZ2h0IC8gbGFiZWwgLyByZWdpb25cbi8vXG4vLyAgIEVhY2ggYWRkaXRpb24gaXMgYW4gb3B0aW9uYWwgZmllbGQgYXQgYSBzY2hlbWFWZXJzaW9uIGJ1bXA7IG9sZGVyXG4vLyAgIHN1Ym1pc3Npb25zIHJlYWQgZm9yd2FyZCB0aHJvdWdoIG1pZ3JhdGVTdWJtaXNzaW9uUmVzcG9uc2VzLCB3aGljaFxuLy8gICByZXR1cm5zIHRoZSBjdXJyZW50IHNoYXBlIHdpdGggYWJzZW50IG1hcHMgc2ltcGx5IHVuZGVmaW5lZC5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG4vLyBDb25maWRlbmNlIHJhdGluZyBjYXB0dXJlZCBiZWZvcmUgYSBzdHVkZW50IGNoZWNrcyBhIHNlY3Rpb24uIE9ubHlcbi8vIHByZXNlbnQgd2hlbiB0aGUgYmxhbmsncyBwYXJlbnQgRmlsbEluQmxhbmtCbG9jayBoYXMgaGFzQ29uZmlkZW5jZVJhdGluZ1xuLy8gPT09IHRydWUuIFRocmVlLXBvaW50IHNjYWxlIGNhcHR1cmVzIG1ldGFjb2duaXRpdmUgY2FsaWJyYXRpb24gd2l0aG91dFxuLy8gYmVpbmcgc28gZ3JhbnVsYXIgdGhhdCBzdHVkZW50cyBjYW4ndCBkZWNpZGUuXG5leHBvcnQgY29uc3QgQ29uZmlkZW5jZUxldmVsID0gei5lbnVtKFsndW5zdXJlJywgJ3RoaW5rX3NvJywgJ2NlcnRhaW4nXSk7XG5leHBvcnQgdHlwZSBDb25maWRlbmNlTGV2ZWwgPSB6LmluZmVyPHR5cGVvZiBDb25maWRlbmNlTGV2ZWw+O1xuXG4vLyBPbmUgYmxhbmsncyByZXNwb25zZTogd2hhdCB0aGUgc3R1ZGVudCB0eXBlZCwgd2hldGhlciB0aGUgcnVudGltZSBzY29yZWRcbi8vIGl0IGNvcnJlY3QsIGFuZCBvcHRpb25hbGx5IHRoZWlyIGNvbmZpZGVuY2UgcmF0aW5nLiBUaGUgYGNvcnJlY3RgIGJvb2xlYW5cbi8vIGlzIGNvbXB1dGVkIENMSUVOVC1TSURFIGluIHRoZSBydW50aW1lIEpTIG9mIHRoZSBwdWJsaXNoZWQgSFRNTCBcdTIwMTQgdGhlXG4vLyBhbnN3ZXIga2V5IGlzIGJha2VkIGludG8gdGhlIEhUTUwsIHNvIHRoaXMgaXMgY29udmVuaWVuY2UgZm9yIHRoZVxuLy8gdGVhY2hlciB2aWV3ZXIsIG5vdCBhdXRob3JpdGF0aXZlIGdyYWRpbmcuIChTZWUgdGhlIHNlY3VyaXR5IGNlaWxpbmdcbi8vIGRpc2N1c3Npb246IFBoYXNlIDUrIG1hcmtldHBsYWNlIHJlcXVpcmVzIHNlcnZlci1zaWRlIGdyYWRpbmcuKVxuZXhwb3J0IGNvbnN0IEJsYW5rUmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIGFuc3dlcjogei5zdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ycmVjdDogei5ib29sZWFuKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBCbGFua1Jlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgQmxhbmtSZXNwb25zZT47XG5cbi8vIE9uZSBpbnRlcmFjdGl2ZS1ncmFwaCBibG9jaydzIHJlc3BvbnNlIChQaGFzZSAyLjcpLiBNaXJyb3JzIHRoZSBibG9jaydzXG4vLyBpbnRlcmFjdGlvbiBkaXNjcmltaW5hdGVkIHVuaW9uIFx1MjAxNCBlYWNoIHZhcmlhbnQgY2FycmllcyB0aGUgc3R1ZGVudCdzXG4vLyBzdHJ1Y3R1cmVkIGdlb21ldHJpYyBpbnB1dCBwbHVzIHRoZSBzYW1lIGNvcnJlY3RuZXNzL2NvbmZpZGVuY2UgZmllbGRzXG4vLyBibGFua3MgaGF2ZS4gTGlrZSBCbGFua1Jlc3BvbnNlLCBgY29ycmVjdGAgaXMgY29tcHV0ZWQgQ0xJRU5ULVNJREUgaW4gdGhlXG4vLyBwdWJsaXNoZWQgcGFnZSdzIGxhenktbG9hZGVkIGtpdCAodGhlIGFuc3dlciBrZXkgaXMgYmFrZWQgaW50byB0aGUgSFRNTCkgXHUyMDE0XG4vLyBjb252ZW5pZW5jZSBmb3IgdGhlIHRlYWNoZXIgdmlld2VyLCBub3QgYXV0aG9yaXRhdGl2ZSBncmFkaW5nLiBLZXB0IGFcbi8vIGRpc2NyaW1pbmF0ZWQgdW5pb24gc28gcGxvdF9saW5lIC8gc2hhZGVfcmVnaW9uIGFkZCBhIHZhcmlhbnQgaGVyZSB3aXRoIG5vXG4vLyBjaGFuZ2UgdG8gY29uc3VtZXJzIHRoYXQgYnJhbmNoIG9uIGB0eXBlYC4gU2xpY2UgMSAoMi43YSkgc2hpcHMgcGxvdF9wb2ludC5cbmV4cG9ydCBjb25zdCBQb2ludFJlc3BvbnNlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3RfcG9pbnQnKSxcbiAgLy8gRXZlcnkgcG9pbnQgdGhlIHN0dWRlbnQgcGxvdHRlZCwgaW4gZ3JhcGggdW5pdHMuIE9yZGVyIGZvbGxvd3MgdGhlIGJsb2NrJ3NcbiAgLy8gY29ycmVjdFBvaW50cyBmb3IgbXVsdGktcG9pbnQgcXVlc3Rpb25zOyBhIHNpbmdsZSBwb2ludCBpcyB0aGUgY29tbW9uIGNhc2UuXG4gIHN0dWRlbnRQb2ludHM6IHouYXJyYXkoei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pKSxcbiAgY29ycmVjdDogei5ib29sZWFuKCksXG4gIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBQb2ludFJlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgUG9pbnRSZXNwb25zZT47XG5cbi8vIHBsb3RfZnVuY3Rpb24gKFBoYXNlIDIuNyAyLjdiKTogdGhlIHN0dWRlbnQgcGxhY2VkIE4gcG9pbnRzIGRlZmluaW5nIGEgY3VydmUuXG4vLyBXZSBzdG9yZSB0aGUgcmF3IHBvaW50cyAodW5pZm9ybSB3aXRoIHBsb3RfcG9pbnQpOyB0aGUgZml0dGVkIHBhcmFtZXRlcnMgYXJlXG4vLyByZS1kZXJpdmFibGUgZnJvbSB0aGVtIHdpdGggdGhlIHNhbWUgZW5naW5lIHRoYXQgc2NvcmVkIGl0LCBzbyB0aGUgZGFzaGJvYXJkXG4vLyBjYW4gc2hvdyBcInN0dWRlbnQncyBsaW5lXCIgd2l0aG91dCBhIHNlY29uZCBzdG9yZWQgc2hhcGUuXG5leHBvcnQgY29uc3QgRnVuY3Rpb25SZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X2Z1bmN0aW9uJyksXG4gIHN0dWRlbnRQb2ludHM6IHouYXJyYXkoei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pKSxcbiAgY29ycmVjdDogei5ib29sZWFuKCksXG4gIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBGdW5jdGlvblJlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgRnVuY3Rpb25SZXNwb25zZT47XG5cbi8vIHNoYWRlX3JlZ2lvbiAoMi43Yyk6IHN0dWRlbnRQb2ludHMgYXJlIHRoZSBwb2x5Z29uJ3MgdmVydGljZXMgaW4gb3JkZXIuXG5leHBvcnQgY29uc3QgUmVnaW9uUmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnc2hhZGVfcmVnaW9uJyksXG4gIHN0dWRlbnRQb2ludHM6IHouYXJyYXkoei50dXBsZShbei5udW1iZXIoKSwgei5udW1iZXIoKV0pKSxcbiAgY29ycmVjdDogei5ib29sZWFuKCksXG4gIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBSZWdpb25SZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIFJlZ2lvblJlc3BvbnNlPjtcblxuLy8gZ3JhcGhfaW5lcXVhbGl0eSAoRHJvcCA0KTogdGhlIGJvdW5kYXJ5IGhhbmRsZXMgKyB0aGUgdHdvIGdyYWRlZCBjaG9pY2VzLlxuLy8gc2lkZSBsZWZ0L3JpZ2h0IGFwcGVhcnMgd2l0aCB2ZXJ0aWNhbCBib3VuZGFyaWVzOyBhYm92ZS9iZWxvdyBvdGhlcndpc2UuXG5leHBvcnQgY29uc3QgSW5lcXVhbGl0eVJlc3BvbnNlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2dyYXBoX2luZXF1YWxpdHknKSxcbiAgc3R1ZGVudFBvaW50czogei5hcnJheSh6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSkpLFxuICBzdHJpY3Q6IHouYm9vbGVhbigpLFxuICBzaWRlOiB6LmVudW0oWydhYm92ZScsICdiZWxvdycsICdsZWZ0JywgJ3JpZ2h0J10pLFxuICBjb3JyZWN0OiB6LmJvb2xlYW4oKSxcbiAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIEluZXF1YWxpdHlSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIEluZXF1YWxpdHlSZXNwb25zZT47XG5cbi8vIHBsb3RfcmF5IC8gcGxvdF9zZWdtZW50IChEcm9wIEMgXHUyMDE0IGZpcnN0LWNsYXNzIHJheXMvc2VnbWVudHMpLiBzdHVkZW50UG9pbnRzXG4vLyBjYXJyaWVzIFtmcm9tLCB0aHJvdWdoXSBmb3IgYSByYXkgYW5kIFtlbmQsIGVuZF0gZm9yIGEgc2VnbWVudDsgdGhlIGVuZHBvaW50XG4vLyBzdHlsZSBjaG9pY2VzIHJpZGUgYWxvbmdzaWRlLiB2NC1vbmx5IG1lbWJlcnM6IHBhZ2VzIHRoYXQgZW1pdCB0aGVtIGFyZVxuLy8gcHVibGlzaGVkIEFGVEVSIHRoZSBEcm9wIEMgaW5nZXN0IGRlcGxveSwgYW5kIGFkZGluZyB1bmlvbiBtZW1iZXJzIEFDQ0VQVFNcbi8vIE1PUkUgXHUyMDE0IG5vIHN0b3JlZCByb3cgaXMgaW52YWxpZGF0ZWQgYW5kIG5vIHZlcnNpb24gYnVtcCBpcyBuZWVkZWQuXG5leHBvcnQgY29uc3QgUmF5UmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9yYXknKSxcbiAgc3R1ZGVudFBvaW50czogei5hcnJheSh6LnR1cGxlKFt6Lm51bWJlcigpLCB6Lm51bWJlcigpXSkpLFxuICAvLyBUaGUgc3R1ZGVudCdzIGNob3NlbiBTSEFQRSAocmF5IGRpcmVjdGlvbiAvIHNlZ21lbnQpIFx1MjAxNCBhIGdyYWRlZCBwYXJ0IG9mXG4gIC8vIHRoZSBhbnN3ZXIgc2luY2UgdGhlIHNoYXBlLXRvZ2dsZSB3aWRnZXQ7IGFic2VudCA9IG5ldmVyIGNob3NlbiAob3IgYVxuICAvLyBwcmUtdG9nZ2xlIHN1Ym1pc3Npb24pLiBPcHRpb25hbCArIGFkZGl0aXZlIHdpdGhpbiB2NC5cbiAgc2hhcGU6IHouZW51bShbJ3JheV9wb3NpdGl2ZScsICdyYXlfbmVnYXRpdmUnLCAnc2VnbWVudCddKS5vcHRpb25hbCgpLFxuICBmcm9tU3R5bGU6IHouZW51bShbJ29wZW4nLCAnY2xvc2VkJ10pLFxuICBjb3JyZWN0OiB6LmJvb2xlYW4oKSxcbiAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFJheVJlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgUmF5UmVzcG9uc2U+O1xuXG5leHBvcnQgY29uc3QgU2VnbWVudFJlc3BvbnNlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ3Bsb3Rfc2VnbWVudCcpLFxuICBzdHVkZW50UG9pbnRzOiB6LmFycmF5KHoudHVwbGUoW3oubnVtYmVyKCksIHoubnVtYmVyKCldKSksXG4gIHNoYXBlOiB6LmVudW0oWydyYXlfcG9zaXRpdmUnLCAncmF5X25lZ2F0aXZlJywgJ3NlZ21lbnQnXSkub3B0aW9uYWwoKSxcbiAgZW5kcG9pbnRzOiB6LnR1cGxlKFt6LmVudW0oWydvcGVuJywgJ2Nsb3NlZCddKSwgei5lbnVtKFsnb3BlbicsICdjbG9zZWQnXSldKSxcbiAgY29ycmVjdDogei5ib29sZWFuKCksXG4gIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBTZWdtZW50UmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBTZWdtZW50UmVzcG9uc2U+O1xuXG4vLyBncmFwaF9pbmVxdWFsaXR5X3N5c3RlbSAoR3JhcGggc3lzdGVtcyk6IHRoZSBzdHVkZW50J3MgYW5zd2VyIHRvIGEgU1lTVEVNIG9mXG4vLyBpbmVxdWFsaXRpZXMgXHUyMDE0IGEgZ3JhcGhfaW5lcXVhbGl0eSB3aXRoIGluZXF1YWxpdGllcy5sZW5ndGggPiAxLiBgcGFydHNgIGlzIG9uZVxuLy8gSW5lcXVhbGl0eVJlc3BvbnNlIHBlciBhdXRob3JlZCBib3VuZGFyeSB0aGUgc3R1ZGVudCBwbG90dGVkIChlYWNoIGNhcnJpZXMgaXRzXG4vLyBvd24gYm91bmRhcnkgcG9pbnRzICsgc2lkZSArIHN0eWxlLCBzbyBtaXhlZCBzdHJpY3QvaW5jbHVzaXZlIGJvdW5kYXJpZXMgYXJlXG4vLyBwZXItcGFydCkuIGBjb3JyZWN0YCBpcyB0aGUgbWF0Y2gtYWxsIEFORCBcdTIwMTQgZXZlcnkgYXV0aG9yZWQgaW5lcXVhbGl0eSBwYWlyZWQsXG4vLyBvcmRlci1pbmRlcGVuZGVudGx5LCB3aXRoIGEgZGlzdGluY3Qgc3R1ZGVudCBwYXJ0OyBgZWFybmVkYC9gdG90YWxgICh2aWFcbi8vIFY0RXh0cmFzIGJlbG93KSBjYXJyeSBwZXItaW5lcXVhbGl0eSBwYXJ0aWFsIGNyZWRpdCAobWF0Y2hlZCAvIE4pIHdoZW4gdGhlXG4vLyBibG9jaydzIHBhcnRpYWxDcmVkaXQgZmxhZyBpcyBvbi4gTGlrZSBCbGFua1Jlc3BvbnNlLCBgY29ycmVjdGAgaXMgY29tcHV0ZWRcbi8vIENMSUVOVC1TSURFIGluIHRoZSBwdWJsaXNoZWQgcGFnZSdzIGxhenkga2l0IFx1MjAxNCBjb252ZW5pZW5jZSBmb3IgdGhlIHRlYWNoZXJcbi8vIHZpZXdlciwgbm90IGF1dGhvcml0YXRpdmUgZ3JhZGluZy4gQSBORVcgYWRkaXRpdmUgbWVtYmVyOiBwYWdlcyB0aGF0IGVtaXQgaXRcbi8vIGFyZSBwdWJsaXNoZWQgQUZURVIgdGhlIGluZ2VzdCByZWRlcGxveSwgYW5kIHdpZGVuaW5nIHRoZSB1bmlvbiBvbmx5IEFDQ0VQVFNcbi8vIE1PUkUsIHNvIG5vIHN1Ym1pc3Npb24uc2NoZW1hVmVyc2lvbiBidW1wICh0aGUgcGxvdF9yYXkgLyBwbG90X3NlZ21lbnRcbi8vIHByZWNlZGVudCkuIE49MSBuZXZlciBlbWl0cyB0aGlzIFx1MjAxNCB0aGUgcnVudGltZSBrZWVwcyB0aGUgcGxhaW4gc2luZ2xlXG4vLyBJbmVxdWFsaXR5UmVzcG9uc2UgZm9yIG9uZSBib3VuZGFyeSAoYnl0ZS1pZGVudGljYWwgdG8gdG9kYXkpLlxuZXhwb3J0IGNvbnN0IFN5c3RlbUluZXF1YWxpdHlSZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdncmFwaF9pbmVxdWFsaXR5X3N5c3RlbScpLFxuICAvLyBPbmUgcGVyIGJvdW5kYXJ5OyBhdCBsZWFzdCB0d28gZm9yIGEgcmVhbCBzeXN0ZW0sIGJ1dCBtaW4oMSkga2VlcHMgdGhlXG4gIC8vIHNjb3Jlci9wYXJzZSB0b3RhbCAoYW4gdW5kZXItY291bnQgY2FuJ3QgbWF0Y2ggZXZlcnkgYXV0aG9yZWQga2V5IFx1MjE5MiB3cm9uZykuXG4gIHBhcnRzOiB6LmFycmF5KEluZXF1YWxpdHlSZXNwb25zZSkubWluKDEpLFxuICBjb3JyZWN0OiB6LmJvb2xlYW4oKSxcbiAgY29uZmlkZW5jZTogQ29uZmlkZW5jZUxldmVsLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFN5c3RlbUluZXF1YWxpdHlSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIFN5c3RlbUluZXF1YWxpdHlSZXNwb25zZT47XG5cbi8vIHBsb3RfZnVuY3Rpb25fc3lzdGVtIChHcmFwaCBzeXN0ZW1zIFBoYXNlIDIpOiB0aGUgc3R1ZGVudCdzIGFuc3dlciB0byBhIFNZU1RFTVxuLy8gb2YgZnVuY3Rpb25zIFx1MjAxNCBhIHBsb3RfZnVuY3Rpb24gd2l0aCBtb2RlbHMubGVuZ3RoID4gMSAoXCJncmFwaCBib3RoIGxpbmVzXCIpLlxuLy8gYHBhcnRzYCBpcyBvbmUgRnVuY3Rpb25SZXNwb25zZSBwZXIgY3VydmUgdGhlIHN0dWRlbnQgcGxvdHRlZCAoZWFjaCBjYXJyaWVzIHRoZVxuLy8gcmF3IHBvaW50cyB0aGF0IGRlZmluZSB0aGF0IGN1cnZlKS4gYGNvcnJlY3RgIGlzIHRoZSBtYXRjaC1hbGwgQU5EIFx1MjAxNCBldmVyeVxuLy8gYXV0aG9yZWQgbW9kZWwgcGFpcmVkLCBvcmRlci1pbmRlcGVuZGVudGx5LCB3aXRoIGEgZGlzdGluY3Qgc3R1ZGVudCBjdXJ2ZTtcbi8vIGBlYXJuZWRgL2B0b3RhbGAgKHZpYSBWNEV4dHJhcykgY2FycnkgcGVyLWN1cnZlIHBhcnRpYWwgY3JlZGl0IChtYXRjaGVkIC8gTikuXG4vLyBBZGRpdGl2ZSBtZW1iZXIgXHUyMDE0IHNhbWUgcGxvdF9yYXkgLyBwbG90X3NlZ21lbnQgcHJlY2VkZW50LCBubyBzY2hlbWFWZXJzaW9uXG4vLyBidW1wLiBOPTEgbmV2ZXIgZW1pdHMgdGhpcyBcdTIwMTQgdGhlIHJ1bnRpbWUga2VlcHMgdGhlIHBsYWluIHNpbmdsZSBGdW5jdGlvblJlc3BvbnNlXG4vLyBmb3Igb25lIGN1cnZlIChieXRlLWlkZW50aWNhbCB0byB0b2RheSkuXG5leHBvcnQgY29uc3QgU3lzdGVtRnVuY3Rpb25SZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X2Z1bmN0aW9uX3N5c3RlbScpLFxuICAvLyBPbmUgcGVyIGN1cnZlOyBtaW4oMSkga2VlcHMgdGhlIHBhcnNlIHRvdGFsIChhbiB1bmRlci1jb3VudCBjYW4ndCBtYXRjaFxuICAvLyBldmVyeSBhdXRob3JlZCBtb2RlbCBcdTIxOTIgd3JvbmcpLlxuICBwYXJ0czogei5hcnJheShGdW5jdGlvblJlc3BvbnNlKS5taW4oMSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgU3lzdGVtRnVuY3Rpb25SZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIFN5c3RlbUZ1bmN0aW9uUmVzcG9uc2U+O1xuXG5leHBvcnQgY29uc3QgR3JhcGhSZXNwb25zZSA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBQb2ludFJlc3BvbnNlLFxuICBGdW5jdGlvblJlc3BvbnNlLFxuICBSZWdpb25SZXNwb25zZSxcbiAgSW5lcXVhbGl0eVJlc3BvbnNlLFxuXSk7XG5leHBvcnQgdHlwZSBHcmFwaFJlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgR3JhcGhSZXNwb25zZT47XG5cbi8vIHY0IGdyYXBoIHJlc3BvbnNlcyB3aWRlbiBldmVyeSB2YXJpYW50IHdpdGggdGhlIERyb3AgNCBvcHRpb25hbHM6IGBub1NvbHV0aW9uYFxuLy8gKHRoZSBzdHVkZW50IGNob3NlIFwiY2Fubm90IGJlIGdyYXBoZWRcIjsgc3R1ZGVudFBvaW50cyBtYXkgYmUgZW1wdHkpIGFuZFxuLy8gYGVhcm5lZGAvYHRvdGFsYCAocGVyLXBhcnQgcGFydGlhbCBjcmVkaXQsIHByZXNlbnQgb25seSB3aGVuIHRoZSBibG9jaydzXG4vLyBwYXJ0aWFsQ3JlZGl0IGZsYWcgaXMgb24pLiBBcHBsaWVkIGFzIGFuIGV4dGVuc2lvbiBvZiBlYWNoIHZhcmlhbnQgc28gdjMgcm93c1xuLy8gKG5vIHN1Y2ggZmllbGRzKSByZW1haW4gdmFsaWQgdjQgcm93cy5cbmNvbnN0IFY0RXh0cmFzID0ge1xuICBub1NvbHV0aW9uOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICBlYXJuZWQ6IHoubnVtYmVyKCkubm9ubmVnYXRpdmUoKS5vcHRpb25hbCgpLFxuICB0b3RhbDogei5udW1iZXIoKS5wb3NpdGl2ZSgpLm9wdGlvbmFsKCksXG4gIC8vIERvbWFpbi1yZXN0cmljdGVkIHBsb3RfZnVuY3Rpb24gKHJheXMvc2VnbWVudHMpOiB0aGUgc3R1ZGVudCdzIGVuZHBvaW50XG4gIC8vIHBvc2l0aW9ucyArIG9wZW4vY2xvc2VkIGNob2ljZXMuIE9wdGlvbmFsIGFuZCBhZGRpdGl2ZSB3aXRoaW4gdjQuXG4gIGRvbWFpbjogelxuICAgIC5vYmplY3Qoe1xuICAgICAgbWluWDogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICAgICAgbWluU3R5bGU6IHouZW51bShbJ29wZW4nLCAnY2xvc2VkJ10pLm9wdGlvbmFsKCksXG4gICAgICBtYXhYOiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gICAgICBtYXhTdHlsZTogei5lbnVtKFsnb3BlbicsICdjbG9zZWQnXSkub3B0aW9uYWwoKSxcbiAgICB9KVxuICAgIC5vcHRpb25hbCgpLFxufTtcbmV4cG9ydCBjb25zdCBHcmFwaFJlc3BvbnNlVjQgPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcbiAgUG9pbnRSZXNwb25zZS5leHRlbmQoVjRFeHRyYXMpLFxuICBGdW5jdGlvblJlc3BvbnNlLmV4dGVuZChWNEV4dHJhcyksXG4gIFJlZ2lvblJlc3BvbnNlLmV4dGVuZChWNEV4dHJhcyksXG4gIEluZXF1YWxpdHlSZXNwb25zZS5leHRlbmQoVjRFeHRyYXMpLFxuICBSYXlSZXNwb25zZS5leHRlbmQoVjRFeHRyYXMpLFxuICBTZWdtZW50UmVzcG9uc2UuZXh0ZW5kKFY0RXh0cmFzKSxcbiAgLy8gR3JhcGggc3lzdGVtczogYWRkaXRpdmUgbWVtYmVycy4gZWFybmVkL3RvdGFsIChWNEV4dHJhcykgY2FycnkgdGhlXG4gIC8vIHBlci1vYmplY3QgcGFydGlhbCBjcmVkaXQ7IG5vU29sdXRpb24vZG9tYWluIHJpZGUgYWxvbmcgYnV0IGFyZSB1bnVzZWQgYnkgYVxuICAvLyBzeXN0ZW0gKGtlcHQgZm9yIHVuaW9uIHVuaWZvcm1pdHksIGxpa2UgZXZlcnkgb3RoZXIgbWVtYmVyKS5cbiAgU3lzdGVtSW5lcXVhbGl0eVJlc3BvbnNlLmV4dGVuZChWNEV4dHJhcyksXG4gIFN5c3RlbUZ1bmN0aW9uUmVzcG9uc2UuZXh0ZW5kKFY0RXh0cmFzKSxcbl0pO1xuZXhwb3J0IHR5cGUgR3JhcGhSZXNwb25zZVY0ID0gei5pbmZlcjx0eXBlb2YgR3JhcGhSZXNwb25zZVY0PjtcblxuLy8gUGVyLXNlY3Rpb24gY2hlY2twb2ludCByZXN1bHQsIGNhcHR1cmVkIHdoZW4gYSBzdHVkZW50IGNsaWNrcyBcIkNoZWNrIHRoaXNcbi8vIHNlY3Rpb25cIiBpbiBsb2NrZWQvZnJlZSBzdWJtaXNzaW9uIG1vZGVzLiBLZXllZCBieSBzZWN0aW9uLmlkIGluIHRoZVxuLy8gcGFyZW50IFN1Ym1pc3Npb25SZXNwb25zZXMuY2hlY2twb2ludFJlc3VsdHMgbWFwLiBOb3QgcHJlc2VudCBpblxuLy8gc2luZ2xlLW1vZGUgc3VibWlzc2lvbnMgb3IgZm9yIHNlY3Rpb25zIHdpdGhvdXQgaXNDaGVja3BvaW50ID0gdHJ1ZS5cbmV4cG9ydCBjb25zdCBDaGVja3BvaW50UmVzdWx0ID0gei5vYmplY3Qoe1xuICBjaGVja2VkQXQ6IHouc3RyaW5nKCkuZGF0ZXRpbWUoKSwgICAgICAgICAgICAgICAgICAvLyBJU08gdGltZXN0YW1wIGZyb20gcnVudGltZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZTogei5udW1iZXIoKS5ub25uZWdhdGl2ZSgpLCAvLyBmcmFjdGlvbmFsIHVuZGVyIHBhcnRpYWxDcmVkaXQgKHY0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbDogei5udW1iZXIoKS5pbnQoKS5wb3NpdGl2ZSgpLFxufSk7XG5leHBvcnQgdHlwZSBDaGVja3BvaW50UmVzdWx0ID0gei5pbmZlcjx0eXBlb2YgQ2hlY2twb2ludFJlc3VsdD47XG5cbi8vIC0tLS0gQmxhbmstbWFwIGtleSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgYGJsYW5rc2AgbWFwIGlzIGtleWVkIGJ5IEJMQU5LIGlkIFx1MjAxNCBidXQgdHdvIGRpZmZlcmVudCBpZCBzaGFwZXMgbGVnaXRpbWF0ZWx5XG4vLyBsYW5kIGluIGl0LCBiZWNhdXNlIE1vZGVsIEEgKGluLWVxdWF0aW9uIG1hdGggZ2FwcykgZGVsaWJlcmF0ZWx5IHJldXNlcyB0aGlzIG1hcFxuLy8gcmF0aGVyIHRoYW4gYWRkaW5nIGEgd2lyZSBzaGFwZTpcbi8vXG4vLyAgIDEuIEJsYW5rVG9rZW4uaWQgICAgICBcdTIwMTQgYSB1dWlkLlxuLy8gICAyLiBNYXRoUHJvbXB0LmlkICAgICAgXHUyMDE0ICdnJyArIGEgaHlwaGVuLXN0cmlwcGVkIHV1aWQgKFwiZ2NhYjYyYlx1MjAyNmYwMGUwYVwiKS5cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgTk9UIGEgdXVpZCwgYW5kIGNhbm5vdCBiZTogdGhlIGlkIGlzIGVtYmVkZGVkIGluIGFcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgYFxccGxhY2Vob2xkZXJbaWRde31gIG1hcmtlciwgYW5kIE1hdGhMaXZlIHJlamVjdHNcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgaHlwaGVucyB0aGVyZSAoc2VlIE1hdGhQcm9tcHQgaW4gaW5saW5lLnRzLCBhbmQgdGhlXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbnRpbmcgc2l0ZSBpbiBhcHAvbGliL21hcmtkb3duVG9UaXB0YXAudHMpLlxuLy9cbi8vIFRoZSBydW50aW1lIHJlZ2lzdGVycyBib3RoIGludG8gdGhlIFNBTUUgcmVmcy5ibGFua3MgbWFwIG9uIHB1cnBvc2UgKHNlZVxuLy8gcnVudGltZS9pbml0LnRzIFwiTWF0aCBwcm9tcHRzIChNb2RlbCBBKVwiKSwgc28gc3VibWl0IGdhdGhlcnMgdGhlbSB0b2dldGhlci5cbi8vXG4vLyBSRUdSRVNTSU9OIFRISVMgRklYRVMgKGZvdW5kIDIwMjYtMDctMjkgYnkgc3VibWl0dGluZyBhIHJlYWwgcHVibGlzaGVkIHBhZ2UpOlxuLy8gdGhpcyBrZXkgd2FzIGB6LnN0cmluZygpLnV1aWQoKWAsIHNvIEVWRVJZIHN1Ym1pc3Npb24gZnJvbSBhbiBhY3Rpdml0eVxuLy8gY29udGFpbmluZyBhIG1hdGggZ2FwIHdhcyByZWplY3RlZCBieSBpbmdlc3Qtc3VibWlzc2lvbiB3aXRoXG4vLyBgcmVzcG9uc2VzIGZhaWxlZCBzY2hlbWEgdmFsaWRhdGlvbiAvIEludmFsaWQgdXVpZGAuIE1vZGVsIEEgc2hpcHBlZFxuLy8gMjAyNi0wNy0yMiBhbmQgd2FzIG5ldmVyIHN1Ym1pdHRhYmxlIFx1MjAxNCBpdHMgdW5pdCB0ZXN0cyBjb3ZlcmVkIHRoZSBkb2N1bWVudFxuLy8gc2NoZW1hIGFuZCB0aGUgY2FwdHVyZSBicmlkZ2UsIGJ1dCBub3RoaW5nIGNvbnN0cnVjdGVkIGEgU3VibWlzc2lvblJlc3BvbnNlcyxcbi8vIHNvIHRoZSB0d28gY29ycmVjdCBoYWx2ZXMgbmV2ZXIgbWV0LiBXaWRlbmluZyB0aGUgS0VZIGlzIHRoZSB3aG9sZSBmaXg7IHRoZVxuLy8gdmFsdWUgc2hhcGUgaXMgdW50b3VjaGVkLlxuY29uc3QgQkxBTktfSURfS0VZID0gelxuICAuc3RyaW5nKClcbiAgLnJlZmluZShcbiAgICAocykgPT5cbiAgICAgIC9eWzAtOWEtZl17OH0tWzAtOWEtZl17NH0tWzAtOWEtZl17NH0tWzAtOWEtZl17NH0tWzAtOWEtZl17MTJ9JC9pLnRlc3QocykgfHxcbiAgICAgIC9eZ1swLTlhLWZdezMyfSQvaS50ZXN0KHMpLFxuICAgIHsgbWVzc2FnZTogJ0JsYW5rIGlkIG11c3QgYmUgYSB1dWlkIG9yIGEgbWF0aC1nYXAgaWQgKGcgKyAzMiBoZXgpJyB9LFxuICApO1xuXG4vLyAtLS0tIHYxIChsZWdhY3kpIHNoYXBlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHJlLVN0YWdlLTlhIHN1Ym1pc3Npb25zLiBLZXB0IHNvIHdlIGNhbiByZWFkIG9sZCByb3dzIGZyb20gdGhlIGRhdGFiYXNlXG4vLyBhbmQgbWlncmF0ZSB0aGVtIGZvcndhcmQgb24gcmVhZC4gTmV2ZXIgd3JpdHRlbiBieSBuZXcgY29kZS5cbmV4cG9ydCBjb25zdCBTdWJtaXNzaW9uUmVzcG9uc2VzVjEgPSB6Lm9iamVjdCh7XG4gIHNjaGVtYVZlcnNpb246IHoubGl0ZXJhbCgxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBibGFua3M6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCB6Lm9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6IHouc3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ycmVjdDogei5ib29sZWFuKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpLFxufSk7XG5leHBvcnQgdHlwZSBTdWJtaXNzaW9uUmVzcG9uc2VzVjEgPSB6LmluZmVyPHR5cGVvZiBTdWJtaXNzaW9uUmVzcG9uc2VzVjE+O1xuXG4vLyAtLS0tIHYyIChsZWdhY3kpIHNoYXBlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHJlLVN0YWdlLTUgc3VibWlzc2lvbnMuIEtlcHQgc28gd2UgY2FuIHJlYWQgb2xkIHJvd3MgYW5kIG1pZ3JhdGUgdGhlbVxuLy8gZm9yd2FyZCBvbiByZWFkLiBOZXZlciB3cml0dGVuIGJ5IG5ldyBjb2RlLlxuZXhwb3J0IGNvbnN0IFN1Ym1pc3Npb25SZXNwb25zZXNWMiA9IHoub2JqZWN0KHtcbiAgc2NoZW1hVmVyc2lvbjogei5saXRlcmFsKDIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJsYW5rczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIEJsYW5rUmVzcG9uc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrcG9pbnRSZXN1bHRzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQ2hlY2twb2ludFJlc3VsdCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgU3VibWlzc2lvblJlc3BvbnNlc1YyID0gei5pbmZlcjx0eXBlb2YgU3VibWlzc2lvblJlc3BvbnNlc1YyPjtcblxuLy8gLS0tLSB2MyAobGVnYWN5KSBzaGFwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHJlLURyb3AtNCBzdWJtaXNzaW9ucyAoYW5kIHBhZ2VzIHB1Ymxpc2hlZCBiZWZvcmUgdGhlIHY0IHJ1bnRpbWUgdGhhdCBhcmVcbi8vIHN0aWxsIGxpdmUpLiBLZXB0IHNvIGluZ2VzdCBrZWVwcyBBQ0NFUFRJTkcgdjMgcG9zdHMgYW5kIHN0b3JlZCByb3dzIG1pZ3JhdGVcbi8vIGZvcndhcmQgb24gcmVhZC4gTmV2ZXIgd3JpdHRlbiBieSBuZXcgY29kZS5cbmV4cG9ydCBjb25zdCBTdWJtaXNzaW9uUmVzcG9uc2VzVjMgPSB6Lm9iamVjdCh7XG4gIHNjaGVtYVZlcnNpb246IHoubGl0ZXJhbCgzKSxcbiAgYmxhbmtzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQmxhbmtSZXNwb25zZSksXG4gIGNoZWNrcG9pbnRSZXN1bHRzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQ2hlY2twb2ludFJlc3VsdCkub3B0aW9uYWwoKSxcbiAgZ3JhcGhSZXNwb25zZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBHcmFwaFJlc3BvbnNlKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBTdWJtaXNzaW9uUmVzcG9uc2VzVjMgPSB6LmluZmVyPHR5cGVvZiBTdWJtaXNzaW9uUmVzcG9uc2VzVjM+O1xuXG4vLyAtLS0tIHY0IChsZWdhY3kpIHNoYXBlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQcmUtbXVsdGlwbGUtY2hvaWNlIHN1Ym1pc3Npb25zIChhbmQgcGFnZXMgcHVibGlzaGVkIGJlZm9yZSB0aGUgdjUgcnVudGltZVxuLy8gdGhhdCBhcmUgc3RpbGwgbGl2ZSkuIEtlcHQgc28gaW5nZXN0IGtlZXBzIEFDQ0VQVElORyB2NCBwb3N0cyBhbmQgc3RvcmVkIHJvd3Ncbi8vIG1pZ3JhdGUgZm9yd2FyZCBvbiByZWFkLiBOZXZlciB3cml0dGVuIGJ5IG5ldyBjb2RlLlxuZXhwb3J0IGNvbnN0IFN1Ym1pc3Npb25SZXNwb25zZXNWNCA9IHoub2JqZWN0KHtcbiAgc2NoZW1hVmVyc2lvbjogei5saXRlcmFsKDQpLFxuICBibGFua3M6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBCbGFua1Jlc3BvbnNlKSxcbiAgY2hlY2twb2ludFJlc3VsdHM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBDaGVja3BvaW50UmVzdWx0KS5vcHRpb25hbCgpLFxuICBncmFwaFJlc3BvbnNlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIEdyYXBoUmVzcG9uc2VWNCkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgU3VibWlzc2lvblJlc3BvbnNlc1Y0ID0gei5pbmZlcjx0eXBlb2YgU3VibWlzc2lvblJlc3BvbnNlc1Y0PjtcblxuLy8gT25lIG11bHRpcGxlX2Nob2ljZSBibG9jaydzIHJlc3BvbnNlOiB3aGljaCBjaG9pY2UgaWRzIHRoZSBzdHVkZW50IHNlbGVjdGVkXG4vLyAob25lIGZvciBzaW5nbGUtc2VsZWN0LCBhbnkgbnVtYmVyIGZvciBtdWx0aS1zZWxlY3QpIHBsdXMgdGhlIHNhbWVcbi8vIGNvcnJlY3RuZXNzL2NvbmZpZGVuY2UgZmllbGRzIGJsYW5rcyBoYXZlLiBMaWtlIEJsYW5rUmVzcG9uc2UsIGBjb3JyZWN0YCBpc1xuLy8gY29tcHV0ZWQgQ0xJRU5ULVNJREUgaW4gdGhlIHB1Ymxpc2hlZCBwYWdlJ3MgcnVudGltZSAodGhlIGFuc3dlciBrZXkgaXNcbi8vIGJha2VkIGludG8gdGhlIEhUTUwpIFx1MjAxNCBjb252ZW5pZW5jZSBmb3IgdGhlIHRlYWNoZXIgdmlld2VyLCBub3QgYXV0aG9yaXRhdGl2ZVxuLy8gZ3JhZGluZy4gQWxsLW9yLW5vdGhpbmc6IGNvcnJlY3QgbWVhbnMgdGhlIHNlbGVjdGVkIFNFVCBlcXVhbHMgdGhlIGNvcnJlY3Rcbi8vIHNldCAocGVyLWNob2ljZSBwYXJ0aWFsIGNyZWRpdCBpcyBhIGZ1dHVyZSBhZGRpdGl2ZSBmaWVsZCwgbWlycm9yaW5nIHRoZVxuLy8gZ3JhcGggYmxvY2sncyBlYXJuZWQvdG90YWwgcHJlY2VkZW50KS5cbmV4cG9ydCBjb25zdCBDaG9pY2VSZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgLy8gU2VsZWN0ZWQgY2hvaWNlIGlkcyAoTXVsdGlwbGVDaG9pY2VPcHRpb24uaWQpLCBpbiBkb2N1bWVudCBvcmRlci5cbiAgLy8gTm9uLWVtcHR5OiBhbiB1bmFuc3dlcmVkIGJsb2NrIGlzIHNpbXBseSBhYnNlbnQgZnJvbSB0aGUgbWFwIChhblxuICAvLyBvbWlzc2lvbiksIGxpa2UgYW4gdW5hbnN3ZXJlZCBncmFwaC5cbiAgc2VsZWN0ZWQ6IHouYXJyYXkoei5zdHJpbmcoKS51dWlkKCkpLm1pbigxKSxcbiAgY29ycmVjdDogei5ib29sZWFuKCksXG4gIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBDaG9pY2VSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIENob2ljZVJlc3BvbnNlPjtcblxuLy8gLS0tLSB2NSAobGVnYWN5KSBzaGFwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHJlLW1hdGNoaW5nL29yZGVyaW5nIHN1Ym1pc3Npb25zIChhbmQgcGFnZXMgcHVibGlzaGVkIGJlZm9yZSB0aGUgdjYgcnVudGltZVxuLy8gdGhhdCBhcmUgc3RpbGwgbGl2ZSkuIEtlcHQgc28gaW5nZXN0IGtlZXBzIEFDQ0VQVElORyB2NSBwb3N0cyBhbmQgc3RvcmVkIHJvd3Ncbi8vIG1pZ3JhdGUgZm9yd2FyZCBvbiByZWFkLiBOZXZlciB3cml0dGVuIGJ5IG5ldyBjb2RlLlxuZXhwb3J0IGNvbnN0IFN1Ym1pc3Npb25SZXNwb25zZXNWNSA9IHoub2JqZWN0KHtcbiAgc2NoZW1hVmVyc2lvbjogei5saXRlcmFsKDUpLFxuICBibGFua3M6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBCbGFua1Jlc3BvbnNlKSxcbiAgY2hlY2twb2ludFJlc3VsdHM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBDaGVja3BvaW50UmVzdWx0KS5vcHRpb25hbCgpLFxuICBncmFwaFJlc3BvbnNlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIEdyYXBoUmVzcG9uc2VWNCkub3B0aW9uYWwoKSxcbiAgY2hvaWNlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIENob2ljZVJlc3BvbnNlKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBTdWJtaXNzaW9uUmVzcG9uc2VzVjUgPSB6LmluZmVyPHR5cGVvZiBTdWJtaXNzaW9uUmVzcG9uc2VzVjU+O1xuXG4vLyBPbmUgbWF0Y2hpbmcgYmxvY2sncyByZXNwb25zZTogd2hpY2ggdGFyZ2V0IHRoZSBzdHVkZW50IGRvY2tlZCBvbiBlYWNoIGl0ZW0uXG4vLyBMaWtlIEJsYW5rUmVzcG9uc2UsIGBjb3JyZWN0YCBpcyBjb21wdXRlZCBDTElFTlQtU0lERSBpbiB0aGUgcHVibGlzaGVkIHBhZ2Unc1xuLy8gcnVudGltZSAodGhlIGFuc3dlciBrZXkgaXMgYmFrZWQgaW50byB0aGUgSFRNTCkgXHUyMDE0IGNvbnZlbmllbmNlIGZvciB0aGUgdGVhY2hlclxuLy8gdmlld2VyLCBub3QgYXV0aG9yaXRhdGl2ZSBncmFkaW5nLiBTY29yZWQgUEVSIFBBSVI6IGBlYXJuZWRgIG9mIGB0b3RhbGAgaXRlbXNcbi8vIGNhcnJ5IHRoZSBrZXllZCB0YXJnZXQgKGB0b3RhbGAgPSB0aGUgYmxvY2sncyBpdGVtIGNvdW50LCBzbyBhbiB1bnBhaXJlZCBpdGVtXG4vLyB3aXRoaW4gYW4gYW5zd2VyZWQgYmxvY2sgc2NvcmVzIGFzIGEgd3JvbmcgcGFpcik7IGBjb3JyZWN0YCA9IGVhcm5lZCA9PT0gdG90YWwuXG5leHBvcnQgY29uc3QgTWF0Y2hSZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgLy8gaXRlbSBpZCBcdTIxOTIgZG9ja2VkIHRhcmdldCBpZC4gTm9uLWVtcHR5OiBhIGJsb2NrIHdpdGggbm8gcGFpcnMgbWFkZSBpcyBhblxuICAvLyBvbWlzc2lvbiAoYWJzZW50IGZyb20gdGhlIG1hcCksIGxpa2UgYW4gdW5hbnN3ZXJlZCBncmFwaCBvciBNQyBibG9jay5cbiAgcGFpcnM6IHpcbiAgICAucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCB6LnN0cmluZygpLnV1aWQoKSlcbiAgICAucmVmaW5lKChwYWlycykgPT4gT2JqZWN0LmtleXMocGFpcnMpLmxlbmd0aCA+IDAsIHtcbiAgICAgIG1lc3NhZ2U6ICdhbiBhbnN3ZXJlZCBtYXRjaGluZyBibG9jayBoYXMgYXQgbGVhc3Qgb25lIHBhaXInLFxuICAgIH0pLFxuICBjb3JyZWN0OiB6LmJvb2xlYW4oKSxcbiAgZWFybmVkOiB6Lm51bWJlcigpLmludCgpLm5vbm5lZ2F0aXZlKCksXG4gIHRvdGFsOiB6Lm51bWJlcigpLmludCgpLnBvc2l0aXZlKCksXG4gIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBNYXRjaFJlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgTWF0Y2hSZXNwb25zZT47XG5cbi8vIE9uZSBvcmRlcmluZyBibG9jaydzIHJlc3BvbnNlOiB0aGUgc3R1ZGVudCdzIGZ1bGwgYXJyYW5nZW1lbnQgKGV2ZXJ5IGl0ZW0gaWQsXG4vLyBpbiB0aGVpciBjaG9zZW4gc2VxdWVuY2UpLiBBbGwtb3Itbm90aGluZzogYGNvcnJlY3RgID0gdGhlIHNlcXVlbmNlIGVxdWFsc1xuLy8gdGhlIGF1dGhvcmVkIG9yZGVyIGV4YWN0bHkuIEFuIHVudG91Y2hlZCAoc3RpbGwtc2h1ZmZsZWQpIGxpc3QgaXMgYW5cbi8vIG9taXNzaW9uIFx1MjAxNCB0aGUgcnVudGltZSBvbmx5IHJlY29yZHMgYSByZXNwb25zZSBvbmNlIHRoZSBzdHVkZW50IGhhcyBtb3ZlZFxuLy8gc29tZXRoaW5nLlxuZXhwb3J0IGNvbnN0IE9yZGVyUmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIG9yZGVyOiB6LmFycmF5KHouc3RyaW5nKCkudXVpZCgpKS5taW4oMiksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgT3JkZXJSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIE9yZGVyUmVzcG9uc2U+O1xuXG4vLyBPbmUgbnVtYmVyX2xpbmUgYmxvY2sncyByZXNwb25zZSAoMS1EKS4gTGlrZSBCbGFua1Jlc3BvbnNlLCBgY29ycmVjdGAgaXNcbi8vIGNvbXB1dGVkIENMSUVOVC1TSURFIGluIHRoZSBwdWJsaXNoZWQgcGFnZSdzIGxhenkga2l0ICh0aGUgYW5zd2VyIGtleSBpcyBiYWtlZFxuLy8gaW50byB0aGUgSFRNTCkgXHUyMDE0IGNvbnZlbmllbmNlIGZvciB0aGUgdGVhY2hlciB2aWV3ZXIsIG5vdCBhdXRob3JpdGF0aXZlXG4vLyBncmFkaW5nLiBEaXNjcmltaW5hdGVkIG9uIGB0eXBlYCBzbyBwbG90X3JheSAvIGRpc3BsYXkgYWRkIGEgdmFyaWFudCBoZXJlIHdpdGhcbi8vIG5vIGNvbnN1bWVyIGNoYW5nZS4gU2xpY2UgMSBzaGlwcyBwbG90X3BvaW50ICsgcGxvdF9pbnRlcnZhbC5cbmV4cG9ydCBjb25zdCBOdW1iZXJMaW5lUG9pbnRSZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdwbG90X3BvaW50JyksXG4gIC8vIEV2ZXJ5IHBvc2l0aW9uIHRoZSBzdHVkZW50IHBsb3R0ZWQsIGluIGxpbmUgdW5pdHMuIE9yZGVyIGZvbGxvd3MgdGhlIGJsb2NrJ3NcbiAgLy8gY29ycmVjdFBvaW50cyBmb3IgbXVsdGktcG9pbnQgcXVlc3Rpb25zOyBhIHNpbmdsZSBwb2ludCBpcyB0aGUgY29tbW9uIGNhc2UuXG4gIHN0dWRlbnRQb2ludHM6IHouYXJyYXkoei5udW1iZXIoKSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgTnVtYmVyTGluZVBvaW50UmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBOdW1iZXJMaW5lUG9pbnRSZXNwb25zZT47XG5cbi8vIHBsb3RfaW50ZXJ2YWw6IHRoZSBzdHVkZW50J3MgaW50ZXJ2YWwvcmF5IFx1MjAxNCBwcmVzZW50IGJvdW5kcyArIG9wZW4vY2xvc2VkXG4vLyBzdHlsZXMsIHNhbWUgc2hhcGUgYXMgdGhlIGJsb2NrJ3MgY29ycmVjdEludGVydmFsLiBBbiBhYnNlbnQgYm91bmQgaXMgYW5cbi8vIHVuYm91bmRlZCAocmF5KSBlbmQuXG5leHBvcnQgY29uc3QgTnVtYmVyTGluZUludGVydmFsUmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgncGxvdF9pbnRlcnZhbCcpLFxuICBtaW46IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgbWluU3R5bGU6IHouZW51bShbJ29wZW4nLCAnY2xvc2VkJ10pLm9wdGlvbmFsKCksXG4gIG1heDogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBtYXhTdHlsZTogei5lbnVtKFsnb3BlbicsICdjbG9zZWQnXSkub3B0aW9uYWwoKSxcbiAgY29ycmVjdDogei5ib29sZWFuKCksXG4gIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBOdW1iZXJMaW5lSW50ZXJ2YWxSZXNwb25zZSA9IHouaW5mZXI8XG4gIHR5cGVvZiBOdW1iZXJMaW5lSW50ZXJ2YWxSZXNwb25zZVxuPjtcblxuZXhwb3J0IGNvbnN0IE51bWJlckxpbmVSZXNwb25zZSA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBOdW1iZXJMaW5lUG9pbnRSZXNwb25zZSxcbiAgTnVtYmVyTGluZUludGVydmFsUmVzcG9uc2UsXG5dKTtcbmV4cG9ydCB0eXBlIE51bWJlckxpbmVSZXNwb25zZSA9IHouaW5mZXI8dHlwZW9mIE51bWJlckxpbmVSZXNwb25zZT47XG5cbi8vIE9uZSBkYXRhX3Bsb3QgYmxvY2sncyByZXNwb25zZS4gTGlrZSBCbGFua1Jlc3BvbnNlLCBgY29ycmVjdGAgaXMgY29tcHV0ZWRcbi8vIENMSUVOVC1TSURFIGluIHRoZSBwdWJsaXNoZWQgcGFnZSdzIGxhenkga2l0ICh0aGUgYW5zd2VyIGtleSBcdTIwMTQgdGhlIGZyZXF1ZW5jeVxuLy8gZGlzdHJpYnV0aW9uIG9mIHRoZSBibG9jaydzIGRhdGFzZXQgXHUyMDE0IGlzIGRlcml2ZWQgaW4gdGhlIEhUTUwpIFx1MjAxNCBjb252ZW5pZW5jZVxuLy8gZm9yIHRoZSB0ZWFjaGVyIHZpZXdlciwgbm90IGF1dGhvcml0YXRpdmUgZ3JhZGluZy4gRGlzY3JpbWluYXRlZCBvbiBgdHlwZWBcbi8vIHNvIGJ1aWxkX2hpc3RvZ3JhbSAvIGJ1aWxkX2JveHBsb3QgYWRkIGEgdmFyaWFudCBoZXJlIHdpdGggbm8gY29uc3VtZXJcbi8vIGNoYW5nZS4gU2xpY2UgMSBzaGlwcyBidWlsZF9kb3RwbG90OyBgZGlzcGxheWAgZGF0YV9wbG90cyBhcmUgdW5ncmFkZWRcbi8vIHN0aW11bGkgYW5kIG5ldmVyIHByb2R1Y2UgYSByZXNwb25zZS5cbmV4cG9ydCBjb25zdCBEYXRhUGxvdERvdHBsb3RSZXNwb25zZSA9IHoub2JqZWN0KHtcbiAgdHlwZTogei5saXRlcmFsKCdidWlsZF9kb3RwbG90JyksXG4gIC8vIEV2ZXJ5IGRvdCB0aGUgc3R1ZGVudCBwbGFjZWQsIGFzIGl0cyB2YWx1ZSBvbiB0aGUgYXhpcyAoYSBtdWx0aXNldCBcdTIwMTQgdGhlXG4gIC8vIGZyZXF1ZW5jeSBtYXAgZGVyaXZlcyBmcm9tIGNvdW50aW5nKS4gTm9uLWVtcHR5OiBhIGJsb2NrIHdpdGggbm8gZG90cyBpcyBhblxuICAvLyBvbWlzc2lvbiAoYWJzZW50IGZyb20gdGhlIG1hcCksIGxpa2UgYW4gdW5hbnN3ZXJlZCBncmFwaCBvciBudW1iZXIgbGluZS5cbiAgc3R1ZGVudFZhbHVlczogei5hcnJheSh6Lm51bWJlcigpKS5taW4oMSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3REb3RwbG90UmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBEYXRhUGxvdERvdHBsb3RSZXNwb25zZT47XG5cbi8vIGJ1aWxkX2hpc3RvZ3JhbTogdGhlIHN0dWRlbnQncyBwZXItYmluIGZyZXF1ZW5jaWVzLCBpbiBiaW4gb3JkZXIgKGxlZnRcdTIxOTJyaWdodCkuXG4vLyBOb24tZW1wdHk7IGFuIHVudG91Y2hlZCBoaXN0b2dyYW0gaXMgYW4gb21pc3Npb24gKGFic2VudCBmcm9tIHRoZSBtYXApLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90SGlzdG9ncmFtUmVzcG9uc2UgPSB6Lm9iamVjdCh7XG4gIHR5cGU6IHoubGl0ZXJhbCgnYnVpbGRfaGlzdG9ncmFtJyksXG4gIHN0dWRlbnRCaW5zOiB6LmFycmF5KHoubnVtYmVyKCkpLm1pbigxKSxcbiAgY29ycmVjdDogei5ib29sZWFuKCksXG4gIGNvbmZpZGVuY2U6IENvbmZpZGVuY2VMZXZlbC5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBEYXRhUGxvdEhpc3RvZ3JhbVJlc3BvbnNlID0gei5pbmZlcjxcbiAgdHlwZW9mIERhdGFQbG90SGlzdG9ncmFtUmVzcG9uc2Vcbj47XG5cbi8vIGJ1aWxkX2JveHBsb3Q6IHRoZSBzdHVkZW50J3MgcGxhY2VkIGZpdmUtbnVtYmVyIHN1bW1hcnkgKGxpbmUgdW5pdHMpLlxuZXhwb3J0IGNvbnN0IERhdGFQbG90Qm94cGxvdFJlc3BvbnNlID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmxpdGVyYWwoJ2J1aWxkX2JveHBsb3QnKSxcbiAgc3R1ZGVudEZpdmU6IHoub2JqZWN0KHtcbiAgICBtaW46IHoubnVtYmVyKCksXG4gICAgcTE6IHoubnVtYmVyKCksXG4gICAgbWVkaWFuOiB6Lm51bWJlcigpLFxuICAgIHEzOiB6Lm51bWJlcigpLFxuICAgIG1heDogei5udW1iZXIoKSxcbiAgfSksXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxuICBjb25maWRlbmNlOiBDb25maWRlbmNlTGV2ZWwub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgRGF0YVBsb3RCb3hwbG90UmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBEYXRhUGxvdEJveHBsb3RSZXNwb25zZT47XG5cbi8vIFRoZSB0aHJlZSBidWlsZCB2YXJpYW50cyBhcmUgYWRkaXRpdmUgbWVtYmVyczogd2lkZW5pbmcgdGhlIHVuaW9uIG9ubHkgQUNDRVBUU1xuLy8gTU9SRSwgc28gcGFnZXMgdGhhdCBlbWl0IGhpc3RvZ3JhbS9ib3ggcmVzcG9uc2VzIChwdWJsaXNoZWQgYWZ0ZXIgdGhlIGluZ2VzdFxuLy8gdGhhdCBjYXJyaWVzIHRoaXMgd2lkZW5lZCB1bmlvbikgbmVlZCBubyB3aXJlLWZvcm1hdCBidW1wIFx1MjAxNCB0aGUgc2FtZSBkaXNjaXBsaW5lXG4vLyB0aGUgZ3JhcGggYmxvY2sncyBwbG90X3JheS9wbG90X3NlZ21lbnQgdXNlZCB3aXRoaW4gdjQuIEEgYnVpbGRfZG90cGxvdC1vbmx5XG4vLyBwYWdlIGtlZXBzIHZhbGlkYXRpbmcuXG5leHBvcnQgY29uc3QgRGF0YVBsb3RSZXNwb25zZSA9IHouZGlzY3JpbWluYXRlZFVuaW9uKCd0eXBlJywgW1xuICBEYXRhUGxvdERvdHBsb3RSZXNwb25zZSxcbiAgRGF0YVBsb3RIaXN0b2dyYW1SZXNwb25zZSxcbiAgRGF0YVBsb3RCb3hwbG90UmVzcG9uc2UsXG5dKTtcbmV4cG9ydCB0eXBlIERhdGFQbG90UmVzcG9uc2UgPSB6LmluZmVyPHR5cGVvZiBEYXRhUGxvdFJlc3BvbnNlPjtcblxuLy8gLS0tLSB2NiAobGVnYWN5KSBzaGFwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHJlLW51bWJlci1saW5lIHN1Ym1pc3Npb25zIChhbmQgcGFnZXMgcHVibGlzaGVkIGJlZm9yZSB0aGUgdjcgcnVudGltZSB0aGF0XG4vLyBhcmUgc3RpbGwgbGl2ZSkuIEtlcHQgc28gaW5nZXN0IGtlZXBzIEFDQ0VQVElORyB2NiBwb3N0cyBhbmQgc3RvcmVkIHJvd3Ncbi8vIG1pZ3JhdGUgZm9yd2FyZCBvbiByZWFkLiBOZXZlciB3cml0dGVuIGJ5IG5ldyBjb2RlLlxuZXhwb3J0IGNvbnN0IFN1Ym1pc3Npb25SZXNwb25zZXNWNiA9IHoub2JqZWN0KHtcbiAgc2NoZW1hVmVyc2lvbjogei5saXRlcmFsKDYpLFxuICBibGFua3M6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBCbGFua1Jlc3BvbnNlKSxcbiAgY2hlY2twb2ludFJlc3VsdHM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBDaGVja3BvaW50UmVzdWx0KS5vcHRpb25hbCgpLFxuICBncmFwaFJlc3BvbnNlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIEdyYXBoUmVzcG9uc2VWNCkub3B0aW9uYWwoKSxcbiAgY2hvaWNlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIENob2ljZVJlc3BvbnNlKS5vcHRpb25hbCgpLFxuICBtYXRjaGVzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgTWF0Y2hSZXNwb25zZSkub3B0aW9uYWwoKSxcbiAgb3JkZXJpbmdzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgT3JkZXJSZXNwb25zZSkub3B0aW9uYWwoKSxcbn0pO1xuZXhwb3J0IHR5cGUgU3VibWlzc2lvblJlc3BvbnNlc1Y2ID0gei5pbmZlcjx0eXBlb2YgU3VibWlzc2lvblJlc3BvbnNlc1Y2PjtcblxuLy8gLS0tLSB2NyAobGVnYWN5KSBzaGFwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHJlLWRhdGEtcGxvdCBzdWJtaXNzaW9ucyAoYW5kIHBhZ2VzIHB1Ymxpc2hlZCBiZWZvcmUgdGhlIHY4IHJ1bnRpbWUgdGhhdCBhcmVcbi8vIHN0aWxsIGxpdmUpLiBLZXB0IHNvIGluZ2VzdCBrZWVwcyBBQ0NFUFRJTkcgdjcgcG9zdHMgYW5kIHN0b3JlZCByb3dzIG1pZ3JhdGVcbi8vIGZvcndhcmQgb24gcmVhZC4gTmV2ZXIgd3JpdHRlbiBieSBuZXcgY29kZS5cbmV4cG9ydCBjb25zdCBTdWJtaXNzaW9uUmVzcG9uc2VzVjcgPSB6Lm9iamVjdCh7XG4gIHNjaGVtYVZlcnNpb246IHoubGl0ZXJhbCg3KSxcbiAgYmxhbmtzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQmxhbmtSZXNwb25zZSksXG4gIGNoZWNrcG9pbnRSZXN1bHRzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQ2hlY2twb2ludFJlc3VsdCkub3B0aW9uYWwoKSxcbiAgZ3JhcGhSZXNwb25zZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBHcmFwaFJlc3BvbnNlVjQpLm9wdGlvbmFsKCksXG4gIGNob2ljZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBDaG9pY2VSZXNwb25zZSkub3B0aW9uYWwoKSxcbiAgbWF0Y2hlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIE1hdGNoUmVzcG9uc2UpLm9wdGlvbmFsKCksXG4gIG9yZGVyaW5nczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIE9yZGVyUmVzcG9uc2UpLm9wdGlvbmFsKCksXG4gIG51bWJlckxpbmVSZXNwb25zZXM6IHpcbiAgICAucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBOdW1iZXJMaW5lUmVzcG9uc2UpXG4gICAgLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFN1Ym1pc3Npb25SZXNwb25zZXNWNyA9IHouaW5mZXI8dHlwZW9mIFN1Ym1pc3Npb25SZXNwb25zZXNWNz47XG5cbi8vIE9uZSBzZWxmX2V4cGxhbmF0aW9uIGJsb2NrJ3MgcmVzcG9uc2U6IHRoZSBmcmVlIHRleHQgdGhlIHN0dWRlbnQgd3JvdGUuXG4vLyBVTkdSQURFRCBcdTIwMTQgdGhlcmUgaXMgbm8gYGNvcnJlY3RgIGZpZWxkIGFuZCBpdCBuZXZlciBjb250cmlidXRlcyB0byB0aGUgc2NvcmU7XG4vLyB0aGUgdGVhY2hlciBkYXNoYm9hcmQgc2hvd3MgdGhlIHRleHQgcmF3LiBUaGlzIGlzIHRoZSBzaGFwZSB0aGUgcmVzZXJ2ZWRcbi8vIGBmcmVlUmVzcG9uc2VzYCBtYXAgY2FycmllcywgYW5kIGl0IGlzIGRlbGliZXJhdGVseSBtaW5pbWFsIChqdXN0IGEgc3RyaW5nKVxuLy8gc28gUGhhc2UgMi42IHNob3J0X2Fuc3dlciAvIGVzc2F5IHJldXNlIGl0IHVuY2hhbmdlZCBcdTIwMTQgdGhlaXIgZ3JhZGluZyBsaXZlcyBpblxuLy8gYSBzZXBhcmF0ZSB0YWJsZSwgbm90IGluIHRoZSByZXNwb25zZS4gTm9uLWVtcHR5OiBhbiB1bnRvdWNoZWQgcHJvbXB0IGlzIGFuXG4vLyBvbWlzc2lvbiAoYWJzZW50IGZyb20gdGhlIG1hcCksIGxpa2UgYW55IG90aGVyIHVuYW5zd2VyZWQgYmxvY2suXG5leHBvcnQgY29uc3QgRnJlZVJlc3BvbnNlID0gei5vYmplY3Qoe1xuICB0ZXh0OiB6LnN0cmluZygpLm1pbigxKSxcbn0pO1xuZXhwb3J0IHR5cGUgRnJlZVJlc3BvbnNlID0gei5pbmZlcjx0eXBlb2YgRnJlZVJlc3BvbnNlPjtcblxuLy8gLS0tLSB2OCAobGVnYWN5KSBzaGFwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHJlLXNlbGYtZXhwbGFuYXRpb24gc3VibWlzc2lvbnMgKGFuZCBwYWdlcyBwdWJsaXNoZWQgYmVmb3JlIHRoZSB2OSBydW50aW1lXG4vLyB0aGF0IGFyZSBzdGlsbCBsaXZlKS4gS2VwdCBzbyBpbmdlc3Qga2VlcHMgQUNDRVBUSU5HIHY4IHBvc3RzIGFuZCBzdG9yZWQgcm93c1xuLy8gbWlncmF0ZSBmb3J3YXJkIG9uIHJlYWQuIE5ldmVyIHdyaXR0ZW4gYnkgbmV3IGNvZGUuXG5leHBvcnQgY29uc3QgU3VibWlzc2lvblJlc3BvbnNlc1Y4ID0gei5vYmplY3Qoe1xuICBzY2hlbWFWZXJzaW9uOiB6LmxpdGVyYWwoOCksXG4gIGJsYW5rczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIEJsYW5rUmVzcG9uc2UpLFxuICBjaGVja3BvaW50UmVzdWx0czogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIENoZWNrcG9pbnRSZXN1bHQpLm9wdGlvbmFsKCksXG4gIGdyYXBoUmVzcG9uc2VzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgR3JhcGhSZXNwb25zZVY0KS5vcHRpb25hbCgpLFxuICBjaG9pY2VzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQ2hvaWNlUmVzcG9uc2UpLm9wdGlvbmFsKCksXG4gIG1hdGNoZXM6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBNYXRjaFJlc3BvbnNlKS5vcHRpb25hbCgpLFxuICBvcmRlcmluZ3M6IHoucmVjb3JkKHouc3RyaW5nKCkudXVpZCgpLCBPcmRlclJlc3BvbnNlKS5vcHRpb25hbCgpLFxuICBudW1iZXJMaW5lUmVzcG9uc2VzOiB6XG4gICAgLnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgTnVtYmVyTGluZVJlc3BvbnNlKVxuICAgIC5vcHRpb25hbCgpLFxuICBkYXRhUGxvdFJlc3BvbnNlczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIERhdGFQbG90UmVzcG9uc2UpLm9wdGlvbmFsKCksXG59KTtcbmV4cG9ydCB0eXBlIFN1Ym1pc3Npb25SZXNwb25zZXNWOCA9IHouaW5mZXI8dHlwZW9mIFN1Ym1pc3Npb25SZXNwb25zZXNWOD47XG5cbi8vIC0tLS0gdjkgKGN1cnJlbnQpIHNoYXBlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIE5ldyBzdWJtaXNzaW9ucyB3cml0ZSB0aGlzIHNoYXBlLiB2OCBcdTIxOTIgdjkgKHNlbGYtZXhwbGFuYXRpb24pOiBhZGRzIHRoZVxuLy8gb3B0aW9uYWwgYGZyZWVSZXNwb25zZXNgIG1hcCAodW5ncmFkZWQgZnJlZSB0ZXh0KS4gQXBwbGljYXRpb24gY29kZSB0aGF0IHJlYWRzXG4vLyBzdWJtaXNzaW9ucyBjYWxscyBtaWdyYXRlU3VibWlzc2lvblJlc3BvbnNlcygpIG9uY2UgYWZ0ZXIgcmVhZGluZyB0byBoYW5kbGVcbi8vIHYxXHUyMDEzdjkgdW5pZm9ybWx5LlxuZXhwb3J0IGNvbnN0IFN1Ym1pc3Npb25SZXNwb25zZXMgPSB6Lm9iamVjdCh7XG4gIHNjaGVtYVZlcnNpb246IHoubGl0ZXJhbCg5KSxcbiAgLy8gS2V5ZWQgYnkgYmxhbmsuaWQgXHUyMDE0IGEgdXVpZCwgT1IgYSBtYXRoLWdhcCBpZCAoTW9kZWwgQSkuIFNlZSBCTEFOS19JRF9LRVkuXG4gIC8vIE9ubHkgdGhlIENVUlJFTlQgdmVyc2lvbiBpcyB3aWRlbmVkOiBnYXBzIHBvc3RkYXRlIHY5IGFuZCBzaGlwcGVkIHdpdGhvdXQgYVxuICAvLyB3aXJlIGJ1bXAsIHNvIGV2ZXJ5IGdhcC1iZWFyaW5nIHBhZ2Ugc2VuZHMgdjkuIFRoZSBmcm96ZW4gdjFcdTIwMTN2OCBzaGFwZXMgc3RheVxuICAvLyB1dWlkLW9ubHksIHdoaWNoIGlzIHdoYXQgdGhleSBjb3VsZCBldmVyIGhhdmUgY29udGFpbmVkLlxuICBibGFua3M6IHoucmVjb3JkKEJMQU5LX0lEX0tFWSwgQmxhbmtSZXNwb25zZSksXG4gIC8vIEtleWVkIGJ5IHNlY3Rpb24uaWQuIE9ubHkgcHJlc2VudCBpbiBsb2NrZWQvZnJlZSBzdWJtaXNzaW9uIG1vZGVzIGZvclxuICAvLyBzZWN0aW9ucyB0aGF0IHdlcmUgYWN0dWFsbHkgY2hlY2twb2ludC1jaGVja2VkLiBBYnNlbnQgaW4gc2luZ2xlIG1vZGVcbiAgLy8gYW5kIGFic2VudCBmb3Igbm9uLWNoZWNrcG9pbnQgc2VjdGlvbnMuXG4gIGNoZWNrcG9pbnRSZXN1bHRzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQ2hlY2twb2ludFJlc3VsdCkub3B0aW9uYWwoKSxcbiAgLy8gS2V5ZWQgYnkgaW50ZXJhY3RpdmVfZ3JhcGggYmxvY2suaWQgKHV1aWQpLiBBYnNlbnQgd2hlbiB0aGUgYWN0aXZpdHlcbiAgLy8gaGFzIG5vIGdyYXBoIGJsb2NrcyBvciBub25lIHdlcmUgYW5zd2VyZWQuIFNpYmxpbmcgdG8gYGJsYW5rc2AsIG5ldmVyXG4gIC8vIG1lcmdlZCBpbnRvIGl0IFx1MjAxNCBnZW9tZXRyaWMgYW5zd2VycyBhcmUgc2hhcGVkIGRpZmZlcmVudGx5IGFuZCB0aGVcbiAgLy8gZGFzaGJvYXJkIHJlbmRlcnMgdGhlbSBkaWZmZXJlbnRseSAoc2VlIHRoZSBleHRlbnNpb24gcGF0dGVybiBhYm92ZSkuXG4gIGdyYXBoUmVzcG9uc2VzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgR3JhcGhSZXNwb25zZVY0KS5vcHRpb25hbCgpLFxuICAvLyBLZXllZCBieSBtdWx0aXBsZV9jaG9pY2UgYmxvY2suaWQgKHV1aWQpLiBBYnNlbnQgd2hlbiB0aGUgYWN0aXZpdHkgaGFzXG4gIC8vIG5vIE1DIGJsb2NrcyBvciBub25lIHdlcmUgYW5zd2VyZWQgKHNhbWUgb21pc3Npb24gcnVsZSBhcyBncmFwaHMpLlxuICBjaG9pY2VzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgQ2hvaWNlUmVzcG9uc2UpLm9wdGlvbmFsKCksXG4gIC8vIEtleWVkIGJ5IG1hdGNoaW5nIGJsb2NrLmlkICh1dWlkKS4gU2FtZSBvbWlzc2lvbiBydWxlLlxuICBtYXRjaGVzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgTWF0Y2hSZXNwb25zZSkub3B0aW9uYWwoKSxcbiAgLy8gS2V5ZWQgYnkgb3JkZXJpbmcgYmxvY2suaWQgKHV1aWQpLiBTYW1lIG9taXNzaW9uIHJ1bGUuXG4gIG9yZGVyaW5nczogei5yZWNvcmQoei5zdHJpbmcoKS51dWlkKCksIE9yZGVyUmVzcG9uc2UpLm9wdGlvbmFsKCksXG4gIC8vIEtleWVkIGJ5IG51bWJlcl9saW5lIGJsb2NrLmlkICh1dWlkKS4gQWJzZW50IHdoZW4gdGhlIGFjdGl2aXR5IGhhcyBub1xuICAvLyBudW1iZXItbGluZSBibG9ja3Mgb3Igbm9uZSB3ZXJlIGFuc3dlcmVkLiBTaWJsaW5nIHRvIGBncmFwaFJlc3BvbnNlc2AsXG4gIC8vIG5ldmVyIG1lcmdlZCBcdTIwMTQgMS1EIGdlb21ldHJpYyBhbnN3ZXJzIGFyZSBzaGFwZWQgZGlmZmVyZW50bHkgYW5kIHRoZVxuICAvLyBkYXNoYm9hcmQgcmVuZGVycyB0aGVtIGRpZmZlcmVudGx5LlxuICBudW1iZXJMaW5lUmVzcG9uc2VzOiB6XG4gICAgLnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgTnVtYmVyTGluZVJlc3BvbnNlKVxuICAgIC5vcHRpb25hbCgpLFxuICAvLyBLZXllZCBieSBkYXRhX3Bsb3QgYmxvY2suaWQgKHV1aWQpLiBBYnNlbnQgd2hlbiB0aGUgYWN0aXZpdHkgaGFzIG5vXG4gIC8vIGdyYWRlZCBkYXRhLXBsb3QgYmxvY2tzIG9yIG5vbmUgd2VyZSBhbnN3ZXJlZCAoZGlzcGxheSBkYXRhX3Bsb3RzIGFyZVxuICAvLyB1bmdyYWRlZCBhbmQgbmV2ZXIgYXBwZWFyKS4gU2libGluZyB0byB0aGUgb3RoZXIgZ2VvbWV0cmljIG1hcHMuXG4gIGRhdGFQbG90UmVzcG9uc2VzOiB6XG4gICAgLnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgRGF0YVBsb3RSZXNwb25zZSlcbiAgICAub3B0aW9uYWwoKSxcbiAgLy8gS2V5ZWQgYnkgc2VsZl9leHBsYW5hdGlvbiBibG9jay5pZCAodXVpZCkuIFVuZ3JhZGVkIGZyZWUgdGV4dCBcdTIwMTQgbmV2ZXIgaW5cbiAgLy8gdGhlIHNjb3JlLiBBYnNlbnQgd2hlbiB0aGUgYWN0aXZpdHkgaGFzIG5vIHNlbGYtZXhwbGFuYXRpb24gYmxvY2tzIG9yIG5vbmVcbiAgLy8gd2VyZSB3cml0dGVuLiBQaGFzZSAyLjYgc2hvcnRfYW5zd2VyIC8gZXNzYXkgd2lsbCByZXVzZSB0aGlzIHNhbWUgbWFwLlxuICBmcmVlUmVzcG9uc2VzOiB6LnJlY29yZCh6LnN0cmluZygpLnV1aWQoKSwgRnJlZVJlc3BvbnNlKS5vcHRpb25hbCgpLFxufSk7XG5leHBvcnQgdHlwZSBTdWJtaXNzaW9uUmVzcG9uc2VzID0gei5pbmZlcjx0eXBlb2YgU3VibWlzc2lvblJlc3BvbnNlcz47XG5cbi8vIC0tLS0gTWlncmF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSZWFkcyBhIHN0b3JlZCBzdWJtaXNzaW9uIG9mIGFueSBzaGFwZSBhbmQgcmV0dXJucyB0aGUgY3VycmVudCAodjgpIHNoYXBlLlxuLy8gQXBwbGljYXRpb24gY29kZSB0aGF0IGNvbnN1bWVzIHN1Ym1pc3Npb25zIGNhbGxzIHRoaXMgb25jZSBhZnRlciByZWFkaW5nXG4vLyBmcm9tIHRoZSBkYXRhYmFzZTsgb2xkZXIgaW5wdXQgc2hhcGVzIGFyZSBuZXZlciBwcm9wYWdhdGVkIHBhc3QgdGhpcyBsYXllci5cbi8vIFRoZSBFZGdlIEZ1bmN0aW9uIHdyaXRlcyBvbmx5IHRoZSBjdXJyZW50IHNoYXBlLlxuLy9cbi8vIEV2ZXJ5IHByb21vdGlvbiBpcyBcImJ1bXAgdGhlIHZlcnNpb24sIGNhcnJ5IHRoZSBtYXBzIGZvcndhcmRcIiBcdTIwMTQgZWFjaCBuZXdcbi8vIHZlcnNpb24gb25seSBBRERFRCBhbiBvcHRpb25hbCBtYXAgKG9yIHdpZGVuZWQgYSB1bmlvbiksIHNvIG9sZGVyIGRhdGEgaXNcbi8vIGFsd2F5cyBhIHZhbGlkIGluc3RhbmNlIG9mIHRoZSBuZXdlciBzaGFwZSB3aXRoIHRoZSBuZXcgZmllbGRzIGFic2VudC5cbmV4cG9ydCBmdW5jdGlvbiBtaWdyYXRlU3VibWlzc2lvblJlc3BvbnNlcyhyYXc6IHVua25vd24pOiBTdWJtaXNzaW9uUmVzcG9uc2VzIHtcbiAgLy8gVHJ5IHRoZSBjdXJyZW50IHNoYXBlIGZpcnN0ICh0aGUgY29tbW9uIGNhc2UgZm9yIG5ldyBkYXRhKS5cbiAgY29uc3QgdjkgPSBTdWJtaXNzaW9uUmVzcG9uc2VzLnNhZmVQYXJzZShyYXcpO1xuICBpZiAodjkuc3VjY2VzcykgcmV0dXJuIHY5LmRhdGE7XG5cbiAgLy8gdjg6IHByb21vdGUgYnkgYnVtcGluZyB0aGUgdmVyc2lvbiBcdTIwMTQgZnJlZVJlc3BvbnNlcyBzaW1wbHkgYWJzZW50LlxuICBjb25zdCB2OCA9IFN1Ym1pc3Npb25SZXNwb25zZXNWOC5zYWZlUGFyc2UocmF3KTtcbiAgaWYgKHY4LnN1Y2Nlc3MpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2NoZW1hVmVyc2lvbjogOSxcbiAgICAgIGJsYW5rczogdjguZGF0YS5ibGFua3MsXG4gICAgICAuLi4odjguZGF0YS5jaGVja3BvaW50UmVzdWx0cyAmJiB7XG4gICAgICAgIGNoZWNrcG9pbnRSZXN1bHRzOiB2OC5kYXRhLmNoZWNrcG9pbnRSZXN1bHRzLFxuICAgICAgfSksXG4gICAgICAuLi4odjguZGF0YS5ncmFwaFJlc3BvbnNlcyAmJiB7IGdyYXBoUmVzcG9uc2VzOiB2OC5kYXRhLmdyYXBoUmVzcG9uc2VzIH0pLFxuICAgICAgLi4uKHY4LmRhdGEuY2hvaWNlcyAmJiB7IGNob2ljZXM6IHY4LmRhdGEuY2hvaWNlcyB9KSxcbiAgICAgIC4uLih2OC5kYXRhLm1hdGNoZXMgJiYgeyBtYXRjaGVzOiB2OC5kYXRhLm1hdGNoZXMgfSksXG4gICAgICAuLi4odjguZGF0YS5vcmRlcmluZ3MgJiYgeyBvcmRlcmluZ3M6IHY4LmRhdGEub3JkZXJpbmdzIH0pLFxuICAgICAgLi4uKHY4LmRhdGEubnVtYmVyTGluZVJlc3BvbnNlcyAmJiB7XG4gICAgICAgIG51bWJlckxpbmVSZXNwb25zZXM6IHY4LmRhdGEubnVtYmVyTGluZVJlc3BvbnNlcyxcbiAgICAgIH0pLFxuICAgICAgLi4uKHY4LmRhdGEuZGF0YVBsb3RSZXNwb25zZXMgJiYge1xuICAgICAgICBkYXRhUGxvdFJlc3BvbnNlczogdjguZGF0YS5kYXRhUGxvdFJlc3BvbnNlcyxcbiAgICAgIH0pLFxuICAgIH07XG4gIH1cblxuICAvLyB2NzogcHJvbW90ZSBieSBidW1waW5nIHRoZSB2ZXJzaW9uIFx1MjAxNCBkYXRhUGxvdFJlc3BvbnNlcyBzaW1wbHkgYWJzZW50LlxuICBjb25zdCB2NyA9IFN1Ym1pc3Npb25SZXNwb25zZXNWNy5zYWZlUGFyc2UocmF3KTtcbiAgaWYgKHY3LnN1Y2Nlc3MpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2NoZW1hVmVyc2lvbjogOSxcbiAgICAgIGJsYW5rczogdjcuZGF0YS5ibGFua3MsXG4gICAgICAuLi4odjcuZGF0YS5jaGVja3BvaW50UmVzdWx0cyAmJiB7XG4gICAgICAgIGNoZWNrcG9pbnRSZXN1bHRzOiB2Ny5kYXRhLmNoZWNrcG9pbnRSZXN1bHRzLFxuICAgICAgfSksXG4gICAgICAuLi4odjcuZGF0YS5ncmFwaFJlc3BvbnNlcyAmJiB7IGdyYXBoUmVzcG9uc2VzOiB2Ny5kYXRhLmdyYXBoUmVzcG9uc2VzIH0pLFxuICAgICAgLi4uKHY3LmRhdGEuY2hvaWNlcyAmJiB7IGNob2ljZXM6IHY3LmRhdGEuY2hvaWNlcyB9KSxcbiAgICAgIC4uLih2Ny5kYXRhLm1hdGNoZXMgJiYgeyBtYXRjaGVzOiB2Ny5kYXRhLm1hdGNoZXMgfSksXG4gICAgICAuLi4odjcuZGF0YS5vcmRlcmluZ3MgJiYgeyBvcmRlcmluZ3M6IHY3LmRhdGEub3JkZXJpbmdzIH0pLFxuICAgICAgLi4uKHY3LmRhdGEubnVtYmVyTGluZVJlc3BvbnNlcyAmJiB7XG4gICAgICAgIG51bWJlckxpbmVSZXNwb25zZXM6IHY3LmRhdGEubnVtYmVyTGluZVJlc3BvbnNlcyxcbiAgICAgIH0pLFxuICAgIH07XG4gIH1cblxuICAvLyB2NjogcHJvbW90ZSBieSBidW1waW5nIHRoZSB2ZXJzaW9uIFx1MjAxNCBudW1iZXJMaW5lUmVzcG9uc2VzIHNpbXBseSBhYnNlbnQuXG4gIGNvbnN0IHY2ID0gU3VibWlzc2lvblJlc3BvbnNlc1Y2LnNhZmVQYXJzZShyYXcpO1xuICBpZiAodjYuc3VjY2Vzcykge1xuICAgIHJldHVybiB7XG4gICAgICBzY2hlbWFWZXJzaW9uOiA5LFxuICAgICAgYmxhbmtzOiB2Ni5kYXRhLmJsYW5rcyxcbiAgICAgIC4uLih2Ni5kYXRhLmNoZWNrcG9pbnRSZXN1bHRzICYmIHtcbiAgICAgICAgY2hlY2twb2ludFJlc3VsdHM6IHY2LmRhdGEuY2hlY2twb2ludFJlc3VsdHMsXG4gICAgICB9KSxcbiAgICAgIC4uLih2Ni5kYXRhLmdyYXBoUmVzcG9uc2VzICYmIHsgZ3JhcGhSZXNwb25zZXM6IHY2LmRhdGEuZ3JhcGhSZXNwb25zZXMgfSksXG4gICAgICAuLi4odjYuZGF0YS5jaG9pY2VzICYmIHsgY2hvaWNlczogdjYuZGF0YS5jaG9pY2VzIH0pLFxuICAgICAgLi4uKHY2LmRhdGEubWF0Y2hlcyAmJiB7IG1hdGNoZXM6IHY2LmRhdGEubWF0Y2hlcyB9KSxcbiAgICAgIC4uLih2Ni5kYXRhLm9yZGVyaW5ncyAmJiB7IG9yZGVyaW5nczogdjYuZGF0YS5vcmRlcmluZ3MgfSksXG4gICAgfTtcbiAgfVxuXG4gIC8vIHY1OiBwcm9tb3RlIGJ5IGJ1bXBpbmcgdGhlIHZlcnNpb24gXHUyMDE0IG1hdGNoZXMvb3JkZXJpbmdzIHNpbXBseSBhYnNlbnQuXG4gIGNvbnN0IHY1ID0gU3VibWlzc2lvblJlc3BvbnNlc1Y1LnNhZmVQYXJzZShyYXcpO1xuICBpZiAodjUuc3VjY2Vzcykge1xuICAgIHJldHVybiB7XG4gICAgICBzY2hlbWFWZXJzaW9uOiA5LFxuICAgICAgYmxhbmtzOiB2NS5kYXRhLmJsYW5rcyxcbiAgICAgIC4uLih2NS5kYXRhLmNoZWNrcG9pbnRSZXN1bHRzICYmIHtcbiAgICAgICAgY2hlY2twb2ludFJlc3VsdHM6IHY1LmRhdGEuY2hlY2twb2ludFJlc3VsdHMsXG4gICAgICB9KSxcbiAgICAgIC4uLih2NS5kYXRhLmdyYXBoUmVzcG9uc2VzICYmIHsgZ3JhcGhSZXNwb25zZXM6IHY1LmRhdGEuZ3JhcGhSZXNwb25zZXMgfSksXG4gICAgICAuLi4odjUuZGF0YS5jaG9pY2VzICYmIHsgY2hvaWNlczogdjUuZGF0YS5jaG9pY2VzIH0pLFxuICAgIH07XG4gIH1cblxuICAvLyB2NDogcHJvbW90ZSBcdTIwMTQgdGhlIGNob2ljZXMvbWF0Y2hlcy9vcmRlcmluZ3MgbWFwcyBhcmUgc2ltcGx5IGFic2VudC5cbiAgY29uc3QgdjQgPSBTdWJtaXNzaW9uUmVzcG9uc2VzVjQuc2FmZVBhcnNlKHJhdyk7XG4gIGlmICh2NC5zdWNjZXNzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjaGVtYVZlcnNpb246IDksXG4gICAgICBibGFua3M6IHY0LmRhdGEuYmxhbmtzLFxuICAgICAgLi4uKHY0LmRhdGEuY2hlY2twb2ludFJlc3VsdHMgJiYge1xuICAgICAgICBjaGVja3BvaW50UmVzdWx0czogdjQuZGF0YS5jaGVja3BvaW50UmVzdWx0cyxcbiAgICAgIH0pLFxuICAgICAgLi4uKHY0LmRhdGEuZ3JhcGhSZXNwb25zZXMgJiYgeyBncmFwaFJlc3BvbnNlczogdjQuZGF0YS5ncmFwaFJlc3BvbnNlcyB9KSxcbiAgICB9O1xuICB9XG5cbiAgLy8gdjM6IHByb21vdGUgXHUyMDE0IGV2ZXJ5IHYzIGdyYXBoIHJlc3BvbnNlIGlzIGEgdmFsaWQgdjQrIHJlc3BvbnNlICh0aGUgdjRcbiAgLy8gZmllbGRzIGFyZSBvcHRpb25hbCBhbmQgdGhlIHVuaW9uIG9ubHkgd2lkZW5lZCkuXG4gIGNvbnN0IHYzID0gU3VibWlzc2lvblJlc3BvbnNlc1YzLnNhZmVQYXJzZShyYXcpO1xuICBpZiAodjMuc3VjY2Vzcykge1xuICAgIHJldHVybiB7XG4gICAgICBzY2hlbWFWZXJzaW9uOiA5LFxuICAgICAgYmxhbmtzOiB2My5kYXRhLmJsYW5rcyxcbiAgICAgIC4uLih2My5kYXRhLmNoZWNrcG9pbnRSZXN1bHRzICYmIHtcbiAgICAgICAgY2hlY2twb2ludFJlc3VsdHM6IHYzLmRhdGEuY2hlY2twb2ludFJlc3VsdHMsXG4gICAgICB9KSxcbiAgICAgIC4uLih2My5kYXRhLmdyYXBoUmVzcG9uc2VzICYmIHsgZ3JhcGhSZXNwb25zZXM6IHYzLmRhdGEuZ3JhcGhSZXNwb25zZXMgfSksXG4gICAgfTtcbiAgfVxuXG4gIC8vIHYyOiBwcm9tb3RlOyBibGFua3MgKyBjaGVja3BvaW50UmVzdWx0cyBjYXJyeSBvdmVyLlxuICBjb25zdCB2MiA9IFN1Ym1pc3Npb25SZXNwb25zZXNWMi5zYWZlUGFyc2UocmF3KTtcbiAgaWYgKHYyLnN1Y2Nlc3MpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2NoZW1hVmVyc2lvbjogOSxcbiAgICAgIGJsYW5rczogdjIuZGF0YS5ibGFua3MsXG4gICAgICAuLi4odjIuZGF0YS5jaGVja3BvaW50UmVzdWx0cyAmJiB7XG4gICAgICAgIGNoZWNrcG9pbnRSZXN1bHRzOiB2Mi5kYXRhLmNoZWNrcG9pbnRSZXN1bHRzLFxuICAgICAgfSksXG4gICAgfTtcbiAgfVxuXG4gIC8vIEZhbGwgYmFjayB0byB2MSBhbmQgbWlncmF0ZSBmb3J3YXJkLiBUaGlzIHdpbGwgdGhyb3cgaWYgdGhlIGlucHV0IG1hdGNoZXNcbiAgLy8gbm8ga25vd24gc2hhcGUsIHdoaWNoIGlzIHRoZSBjb3JyZWN0IGJlaGF2aW9yIFx1MjAxNCBjb3JydXB0ZWQgb3IgdW5rbm93bi1cbiAgLy8gdmVyc2lvbiBzdWJtaXNzaW9ucyBzaG91bGQgZmFpbCBsb3VkbHksIG5vdCBzaWxlbnRseSBwYXNzLlxuICBjb25zdCB2MSA9IFN1Ym1pc3Npb25SZXNwb25zZXNWMS5wYXJzZShyYXcpO1xuICByZXR1cm4ge1xuICAgIHNjaGVtYVZlcnNpb246IDksXG4gICAgYmxhbmtzOiB2MS5ibGFua3MsXG4gIH07XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHJlZ2lzdHJ5L3JlZ2lzdHJ5LnRzIFx1MjAxNCB0aGUgc2luZ2xlIGJsb2NrIHJlZ2lzdHJ5IChTMCwgcnVsaW5nIFExQSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBPbmUgZW50cnkgcGVyIHNjaGVtYSBibG9jayB0eXBlLiBUaGUgZ3VhcmQgc3VpdGUgKHRlc3RzL3JlZ2lzdHJ5LnRlc3QudHMpXG4vLyBwcm92ZXM6IGNvdmVyYWdlIGlzIGV4YWN0IGFnYWluc3QgdGhlIEJsb2NrIHVuaW9uLCBudW1iZXJpbmcgZGVjbGFyYXRpb25zXG4vLyBhZ3JlZSB3aXRoIGJsb2NrLXByZWRpY2F0ZXMudHMsIGZhbWlsaWVzIGFncmVlIHdpdGggaXNHcmFkZWFibGUsIHZhcmlhbnRzXG4vLyBhZ3JlZSB3aXRoIHRoZSBzY2hlbWEncyBpbnRlcmFjdGlvbiB1bmlvbnMsIGFuZCBldmVyeSBpbnRlcmFjdGl2ZSBlbnRyeVxuLy8gY2FycmllcyBhbiBhMTF5IHN0b3J5LiBBZGQgYSBibG9jayB0eXBlIHRvIHRoZSBzY2hlbWEgYW5kIHRoaXMgZmlsZSBmYWlscyB0b1xuLy8gY29tcGlsZSAoQmxvY2tSZWdpc3RyeSBpcyBrZXllZCBieSB0aGUgdW5pb24pIFx1MjAxNCB0aGF0IGlzIHRoZSBwb2ludC5cbi8vXG4vLyBQcmludCBkZWNsYXJhdGlvbnMgc3RhcnRlZCBGQUlUSEZVTCB0byB0aGUgYmFzZWxpbmUgcHJpbnQgbGF5ZXJcbi8vIChyZW5kZXJlci9zcmMvcnVudGltZS9zdHlsZXMudHMgQG1lZGlhIHByaW50KSwgaW5jbHVkaW5nIGl0cyBrbm93biBvZGRpdGllcyxcbi8vIHNvIHRoYXQgaW1wcm92aW5nIHRoZW0gd291bGQgYmUgYSBkZWxpYmVyYXRlIGRlY2lzaW9uIHJhdGhlciB0aGFuIGEgc2lsZW50XG4vLyByZWdpc3RyeSBzaWRlIGVmZmVjdC4gUzUgKHRoZSBwcmludCBzbGljZSkgSVMgdGhhdCBkZWNpc2lvbiBwb2ludCwgYW5kIGl0XG4vLyBydWxlZCAoUzUtT1Y2KTogbWF0aF9ibG9jaywgZGF0YV9wbG90LCBhbmQgc2VsZl9leHBsYW5hdGlvbiBub3cgZGVjbGFyZVxuLy8gYnJlYWstaW5zaWRlOiBhdm9pZCBcdTIwMTQgYSBudW1iZXJlZCBlcXVhdGlvbiwgYSBjaGFydCwgb3IgYSBwcm9tcHQgc2VwYXJhdGVkXG4vLyBmcm9tIGl0cyB3cml0aW5nIGJveCBpcyBhIHByaW50IGJ1ZyBvbiBhbnkgc3VyZmFjZSBcdTIwMTQgYW5kIHRoZSBhdXRob3IgZXh0ZW5kZWRcbi8vIGl0IHRvIHNob3J0X2Fuc3dlciBhbmQgZXNzYXksIHRoZSB0d28gdW5uYW1lZCBzaWJsaW5ncyB0aGF0IHNoYXJlXG4vLyBzZWxmX2V4cGxhbmF0aW9uJ3Mgd3JpdGluZy1ib3ggc3RydWN0dXJlLiBUaGUgcGFyaXR5IGdhdGUgYXNzZXJ0c1xuLy8gVEhJUyBzcGVjIG9uIGJvdGggc3VyZmFjZXMgcmF0aGVyIHRoYW4gZGlmZmluZyBhZ2FpbnN0IHJlbmRlcmVyIG91dHB1dFxuLy8gKHByaW50RXhwZWN0YXRpb25zLnRzKSwgd2hpY2ggaXMgZXhhY3RseSB3aGF0IG1ha2VzIHRoZSBpbXByb3ZlbWVudFxuLy8gZXhwcmVzc2libGU7IHB1Ymxpc2hlZCBwYWdlcyBrZWVwIHRoZWlyIGN1cnJlbnQgYmVoYXZpb3IgdW50aWwgdGhleSByZXRpcmUuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQge1xuICBpc0dyYWRlYWJsZSxcbiAgaXNQYWdlTnVtYmVyZWQsXG4gIHR5cGUgQmxvY2ssXG59IGZyb20gJ0BhY3Rpdml0eS9zY2hlbWEnO1xuaW1wb3J0IHR5cGUge1xuICBCbG9ja0NhdGVnb3J5LFxuICBCbG9ja1JlZ2lzdHJ5LFxuICBCbG9ja1R5cGUsXG4gIENoZWNrZWRTdGF0ZUZhbWlseSxcbn0gZnJvbSAnLi90eXBlcy5qcyc7XG5cbi8qKiBCbGFua1Rva2VuIGZpZWxkcyBzdHJpcHBlZCBmcm9tIGlubGluZSBjb250ZW50IHdoZXJldmVyXG4gKiBTYW5pdGl6ZVNwZWMuaW5saW5lQmxhbmtTZWNyZXRzIGlzIHNldC4gYGhpbnRgIGRlbGliZXJhdGVseSBzdXJ2aXZlcyBcdTIwMTQgaXQgaXNcbiAqIGEgcHJlLWNoZWNrIGFmZm9yZGFuY2UgdGhlIHN0dWRlbnQgbWF5IG9wZW47IHBlci1taXN0YWtlIGZlZWRiYWNrIGlzXG4gKiByZXR1cm5lZCBieSB0aGUgY2hlY2sgUlBDIChydWxpbmcgMi4xQSksIHNvIHRoZSB3aG9sZSBtaXN0YWtlRmVlZGJhY2sgYXJyYXlcbiAqIChtYXRjaCBzdHJpbmdzIEFORCBmZWVkYmFjayB0ZXh0KSBzdHJpcHMuIGBhbnN3ZXJUeXBlYCBzdXJ2aXZlczogaXQgc2hhcGVzXG4gKiB0aGUgaW5wdXQgKG51bWVyaWMga2V5Ym9hcmRzKS4gKi9cbmV4cG9ydCBjb25zdCBCTEFOS19TRUNSRVRfRklFTERTID0gW1xuICAnYW5zd2VyJyxcbiAgJ2FjY2VwdGFibGVBbnN3ZXJzJyxcbiAgJ21pc3Rha2VGZWVkYmFjaycsXG4gICd0b2xlcmFuY2UnLFxuICAnZXF1aXZhbGVuY2UnLFxuXSBhcyBjb25zdDtcblxuLyoqIE1hdGhQcm9tcHQgZmllbGRzIHN0cmlwcGVkIHdoZXJldmVyIGEgcHJvbXB0cyBhcnJheSBhcHBlYXJzIChtYXRoX2Jsb2NrXG4gKiBibG9ja3MgQU5EIG1hdGhfaW5saW5lIG5vZGVzKS4gVGhlIGdhcCBtYXJrZXJzIGluIHRoZSBsYXRleCBhcmUgdGhlIGdhcHNcbiAqIHRoZW1zZWx2ZXMgKGFscmVhZHkgc2VydmVkIGVtcHR5IHRvZGF5IFx1MjAxNCBzZXJpYWxpemUudHMgcHJlY2VkZW50KTsgdGhlXG4gKiBwcm9tcHQncyBhbnN3ZXIvZ3JhZGluZyBjb25maWcgaXMgdGhlIHNlY3JldC4gYGFjY2VwdGFibGVBbnN3ZXJzYCB3YXNcbiAqIE1JU1NJTkcgZnJvbSB0aGUgUzAgZGVjbGFyYXRpb24gKFwiYWxzbyBhY2NlcHRcIiBhbHRlcm5hdGl2ZSBhbnN3ZXJzIFx1MjAxNCBhIHJlYWxcbiAqIGtleSBsZWFrKSBcdTIwMTQgY2F1Z2h0IGJ5IFMyJ3MgY3Jvc3MtY2hlY2sgYWdhaW5zdCB0aGUgTWF0aFByb21wdCBzY2hlbWEgYW5kXG4gKiBhZGRlZCBiZWZvcmUgdGhlIGZpcnN0IHNhbml0aXplZCBieXRlIHdhcyBzZXJ2ZWQuICovXG5leHBvcnQgY29uc3QgTUFUSF9QUk9NUFRfU0VDUkVUX0ZJRUxEUyA9IFtcbiAgJ2Fuc3dlcicsXG4gICdhY2NlcHRhYmxlQW5zd2VycycsXG4gICdlcXVpdmFsZW5jZScsXG4gICd0b2xlcmFuY2UnLFxuXSBhcyBjb25zdDtcblxuZXhwb3J0IGNvbnN0IGJsb2NrUmVnaXN0cnk6IEJsb2NrUmVnaXN0cnkgPSB7XG4gIHBhcmFncmFwaDoge1xuICAgIHR5cGU6ICdwYXJhZ3JhcGgnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdwYXJhZ3JhcGgnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ3Byb3NlJyB9LFxuICB9LFxuXG4gIGhlYWRpbmc6IHtcbiAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ2hlYWRpbmcnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ3Byb3NlJywga2VlcFdpdGhOZXh0OiB0cnVlIH0sXG4gIH0sXG5cbiAgbWF0aF9ibG9jazoge1xuICAgIHR5cGU6ICdtYXRoX2Jsb2NrJyxcbiAgICAvLyBHYXAtYmVhcmluZyAoTW9kZWwgQSBwcm9tcHRzKSBcdTIxOTIgYXV0by1ncmFkYWJsZSArIG51bWJlcmVkICsgaW50ZXJhY3RpdmU7XG4gICAgLy8gYSBwbGFpbiBkaXNwbGF5IGVxdWF0aW9uIHJlc29sdmVzIHN0YXRpYyB0aHJvdWdoIGZhbWlseU9mKCkuXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLCAvLyBmYWl0aGZ1bDogcmVuZGVyZXIgZW1pdHMgY29udGVudCBldmVuIHdoZW4gZ2FwLWJlYXJpbmdcbiAgICBudW1iZXJlZDogJ3doZW5fZ3JhZGFibGUnLFxuICAgIGFuYWx5dGljc0tleTogJ21hdGhfYmxvY2snLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbJ3NvbHV0aW9uJ10sIGlubGluZUJsYW5rU2VjcmV0czogdHJ1ZSB9LFxuICAgIC8vIFdBUyBhIGZhaXRoZnVsIG9kZGl0eSAoYWJzZW50IGZyb20gdGhlIGJhc2VsaW5lIGJyZWFrLWluc2lkZTphdm9pZCBsaXN0LFxuICAgIC8vIHNvIGEgbnVtYmVyZWQgZGlzcGxheSBlcXVhdGlvbiBjb3VsZCBzcGxpdCBhY3Jvc3MgYSBwYWdlKS4gRklYRUQgYnlcbiAgICAvLyBydWxpbmcgUzUtT1Y2IFx1MjAxNCBzdGlsbCBub3QgaW4gdGhlIHNob3dBbnN3ZXJzIHNldCwgd2hpY2ggaXMgdGhlIHNlcGFyYXRlXG4gICAgLy8gYW5zd2VyLWtleS12YXJpYW50IHF1ZXN0aW9uIFM1LjUgb3ducy5cbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAndW5kZXJsaW5lLWJsYW5rcycgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ0VhY2ggaW4tZXF1YXRpb24gZ2FwIGlzIGEgdGV4dCBpbnB1dCBpbiB0YWIgb3JkZXIsIGxhYmVsZWQgd2l0aCBpdHMgJyArXG4gICAgICAgICdwb3NpdGlvbiAoXCJnYXAgMSBvZiAyIGluIHByb2JsZW0gM1wiKS4gVmFsdWVzIHR5cGUgYXMgcGxhaW4gdGV4dDsgJyArXG4gICAgICAgICd2ZXJkaWN0cyBhcmUgYW5ub3VuY2VkIHZpYSB0aGUgc2hhcmVkIHN0YXRlLXBpbGwgYXJpYS1saXZlIHJlZ2lvbi4nLFxuICAgIH0sXG4gIH0sXG5cbiAgaW1hZ2U6IHtcbiAgICB0eXBlOiAnaW1hZ2UnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdpbWFnZScsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdXRvJywgdHJlYXRtZW50OiAnZmlndXJlJyB9LFxuICB9LFxuXG4gIGNhbGxvdXQ6IHtcbiAgICB0eXBlOiAnY2FsbG91dCcsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ2NhbGxvdXQnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ3ZhcmlhbnQtYm9yZGVyLWJveCcgfSxcbiAgfSxcblxuICBwcm9ibGVtOiB7XG4gICAgdHlwZTogJ3Byb2JsZW0nLFxuICAgIC8vIE51bWJlcmVkIGxlZ2FjeSBwcm9zZSBwcm9ibGVtOyBjYXJyaWVzIGEgc29sdXRpb24gYnV0IG5vIGF1dG8tZ3JhZGVkXG4gICAgLy8gcmVzcG9uc2UgKGlzR3JhZGVhYmxlOiBmYWxzZSkgXHUyMTkyIHN0YXRpYyBmYW1pbHksIG5vIHN0YXRlIGNocm9tZS4gU2NoZW1hXG4gICAgLy8gb3JwaGFuOiBubyBlZGl0b3IgTm9kZVZpZXc7IHN0aWxsIHJlbmRlcmFibGUsIHNvIGl0IGtlZXBzIGFuIGVudHJ5LlxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ3Byb2JsZW0nLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbJ3NvbHV0aW9uJ10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAncHJvc2UnIH0sXG4gIH0sXG5cbiAgZmlsbF9pbl9ibGFuazoge1xuICAgIHR5cGU6ICdmaWxsX2luX2JsYW5rJyxcbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdmaWxsX2luX2JsYW5rJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogWydzb2x1dGlvbiddLCBpbmxpbmVCbGFua1NlY3JldHM6IHRydWUgfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAndW5kZXJsaW5lLWJsYW5rcycgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ0VhY2ggYmxhbmsgaXMgYSB0ZXh0IGlucHV0IGluIHRhYiBvcmRlciB3aXRoIGEgbGFiZWwgbmFtaW5nIGl0cyAnICtcbiAgICAgICAgJ3Byb2JsZW0gYW5kIHN1Yi1wYXJ0IChcImJsYW5rIChhKSwgcHJvYmxlbSAzXCIpLiBIaW50IGFuZCBtaXN0YWtlICcgK1xuICAgICAgICAnYWZmb3JkYW5jZXMgYXJlIGJ1dHRvbnMgcmVhY2hhYmxlIGJ5IFRhYjsgdGhlIG9wZW5lZCBwb3BvdmVyIHRyYXBzICcgK1xuICAgICAgICAnbm8gZm9jdXMgYW5kIGNsb3NlcyBvbiBFc2NhcGUuIFZlcmRpY3RzIGFubm91bmNlIHZpYSBhcmlhLWxpdmUuJyxcbiAgICB9LFxuICB9LFxuXG4gIGJ1bGxldF9saXN0OiB7XG4gICAgdHlwZTogJ2J1bGxldF9saXN0JyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnYnVsbGV0X2xpc3QnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ3Byb3NlJyB9LFxuICB9LFxuXG4gIG9yZGVyZWRfbGlzdDoge1xuICAgIHR5cGU6ICdvcmRlcmVkX2xpc3QnLFxuICAgIGZhbWlseTogJ3N0YXRpYycsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2NvbnRhaW5lcicsXG4gICAgY2F0ZWdvcnk6ICdjb250ZW50JyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdvcmRlcmVkX2xpc3QnLFxuICAgIHNhbml0aXplOiB7IHN0cmlwOiBbXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXV0bycsIHRyZWF0bWVudDogJ3Byb3NlJyB9LFxuICB9LFxuXG4gIGludGVyYWN0aXZlX2dyYXBoOiB7XG4gICAgdHlwZTogJ2ludGVyYWN0aXZlX2dyYXBoJyxcbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJywgLy8gZGlzcGxheSB2YXJpYW50IHJlc29sdmVzIHN0YXRpYyB2aWEgZmFtaWx5T2YoKVxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsIC8vIGRpc3BsYXkgdmFyaWFudCByZXNvbHZlcyBjb250ZW50IHZpYSBjYXRlZ29yeU9mKClcbiAgICBudW1iZXJlZDogJ3doZW5fZ3JhZGFibGUnLFxuICAgIGFuYWx5dGljc0tleTogJ2ludGVyYWN0aXZlX2dyYXBoJyxcbiAgICB2YXJpYW50czogW1xuICAgICAgJ3Bsb3RfcG9pbnQnLFxuICAgICAgJ3Bsb3RfZnVuY3Rpb24nLFxuICAgICAgJ3NoYWRlX3JlZ2lvbicsXG4gICAgICAnZ3JhcGhfaW5lcXVhbGl0eScsXG4gICAgICAncGxvdF9yYXknLFxuICAgICAgJ3Bsb3Rfc2VnbWVudCcsXG4gICAgICAnZGlzcGxheScsXG4gICAgXSxcbiAgICBzYW5pdGl6ZToge1xuICAgICAgLy8gVGhlIHdpZGdldCBuZWVkcyBoYW5kbGUgY291bnQgLyBmYW1pbHksIHdoaWNoIGxpdmUgaW4gdGhlIGtleSB0aGVcbiAgICAgIC8vIHZpZXdlciBuZXZlciBnZXRzLiBEZXJpdmVkICsgd2hpdGVsaXN0ZWQ7IHNlZSBTYW5pdGl6ZVNwZWMuXG4gICAgICBkZXJpdmVRdWVzdGlvblNoYXBlOiB0cnVlLFxuICAgICAgLy8gVmFyaWFudC1zY29wZWQga2V5czogcGF0aHMgdGhhdCBkb24ndCBleGlzdCBvbiBhbiBpbnN0YW5jZSdzXG4gICAgICAvLyBpbnRlcmFjdGlvbiBzaW1wbHkgZG9uJ3QgbWF0Y2guIGBhbGxvd05vU29sdXRpb25gIFNVUlZJVkVTIChpdCByZW5kZXJzXG4gICAgICAvLyB0aGUgXCJubyBzb2x1dGlvblwiIGNvbnRyb2wpOyBgbm9Tb2x1dGlvbkNvcnJlY3RgIGlzIHRoZSBhbnN3ZXIuXG4gICAgICBzdHJpcDogW1xuICAgICAgICAnaW50ZXJhY3Rpb24uY29ycmVjdFBvaW50cycsXG4gICAgICAgICdpbnRlcmFjdGlvbi50b2xlcmFuY2UnLFxuICAgICAgICAnaW50ZXJhY3Rpb24ubW9kZWxzJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLmRvbWFpbnMnLFxuICAgICAgICAnaW50ZXJhY3Rpb24ucmVnaW9ucycsXG4gICAgICAgICdpbnRlcmFjdGlvbi5pbmVxdWFsaXRpZXMnLFxuICAgICAgICAnaW50ZXJhY3Rpb24ucmF5cycsXG4gICAgICAgICdpbnRlcmFjdGlvbi5zZWdtZW50cycsXG4gICAgICAgICdtaXN0YWtlRmVlZGJhY2snLFxuICAgICAgICAnc29sdXRpb24nLFxuICAgICAgICAnbm9Tb2x1dGlvbkNvcnJlY3QnLFxuICAgICAgICAncGFydGlhbENyZWRpdCcsXG4gICAgICAgICdidWlsdGluRmVlZGJhY2snLFxuICAgICAgXSxcbiAgICB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdzdGF0aWMtc3ZnJyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnVGhlIGNhbnZhcyBpcyBmb2N1c2FibGU7IGhhbmRsZXMgbW92ZSBieSBhcnJvdyBrZXlzIHdpdGggcG9zaXRpb24gJyArXG4gICAgICAgICduYXJyYXRpb24gdG8gYSB2aXN1YWxseS1oaWRkZW4gYXJpYS1saXZlIHJlZ2lvbiAoYSB2aXNpYmxlIHJlYWRvdXQgJyArXG4gICAgICAgICd3b3VsZCBoYW5kIG92ZXIgdGhlIGFuc3dlciBcdTIwMTQgcmVhZGluZyB0aGUgZ3JpZCBpcyB0aGUgc2tpbGwpLiAnICtcbiAgICAgICAgJ1Bvc3QtY2hlY2sgcmVzdWx0cyBhcmUgdmlzaWJsZSB0ZXh0LiBUb3VjaCB0YXJnZXRzIG1lZXQgNDRweC4nLFxuICAgIH0sXG4gIH0sXG5cbiAgbXVsdGlwbGVfY2hvaWNlOiB7XG4gICAgdHlwZTogJ211bHRpcGxlX2Nob2ljZScsXG4gICAgZmFtaWx5OiAnYXV0b19ncmFkYWJsZScsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ2Fsd2F5cycsXG4gICAgYW5hbHl0aWNzS2V5OiAnbXVsdGlwbGVfY2hvaWNlJyxcbiAgICBzYW5pdGl6ZToge1xuICAgICAgLy8gUGVyLWNob2ljZSBmZWVkYmFjayByZXR1cm5zIHZpYSB0aGUgY2hlY2sgUlBDICgyLjFBKSwgbGlrZSBibGFua3MnLlxuICAgICAgc3RyaXA6IFsnY2hvaWNlc1tdLmNvcnJlY3QnLCAnY2hvaWNlc1tdLmZlZWRiYWNrJywgJ3NvbHV0aW9uJ10sXG4gICAgfSxcbiAgICBwcmludDoge1xuICAgICAgYnJlYWtJbnNpZGU6ICdhdm9pZCcsXG4gICAgICB0cmVhdG1lbnQ6ICdjaG9pY2UtbGV0dGVycycsXG4gICAgICAvLyBQcmludGVkIHZlcnNpb25zIHJlYXJyYW5nZSB0aGUgY2hvaWNlczsgYSBxdWVzdGlvbiB0aGF0IHNheXMgXCJhbGwgb2ZcbiAgICAgIC8vIHRoZSBhYm92ZVwiIG9wdHMgb3V0IHBlci1ibG9jayAoRDE3QSkuIE5PVCBzZXJ2ZVNodWZmbGVkOiB0aGUgc3R1ZGVudFxuICAgICAgLy8gc2NyZWVuIGtlZXBzIHRoZSBhdXRob3JlZCBvcmRlciwgYmVjYXVzZSB0aGUgYW5zd2VyIGlzIHRoZSBjaG9pY2UgaWRcbiAgICAgIC8vIGFuZCByZWFycmFuZ2luZyBpdCB0aGVyZSBidXlzIG5vdGhpbmcuXG4gICAgICBzaHVmZmxlZDogWydjaG9pY2VzJ10sXG4gICAgICBzaHVmZmxlTG9ja2VkQnk6ICdsb2NrQ2hvaWNlT3JkZXInLFxuICAgIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdOYXRpdmUgcmFkaW8gKHNpbmdsZSkgLyBjaGVja2JveCAobXVsdGkpIGlucHV0cyBncm91cGVkIGluIGEgJyArXG4gICAgICAgICdmaWVsZHNldCB3aG9zZSBsZWdlbmQgaXMgdGhlIHByb21wdDsgZnVsbCBsYWJlbCBjbGljayB0YXJnZXRzLiAnICtcbiAgICAgICAgJ1N0YW5kYXJkIGFycm93LWtleSByYWRpbyBiZWhhdmlvcjsgdmVyZGljdHMgYW5ub3VuY2UgdmlhIGFyaWEtbGl2ZS4nLFxuICAgIH0sXG4gIH0sXG5cbiAgbWF0Y2hpbmc6IHtcbiAgICB0eXBlOiAnbWF0Y2hpbmcnLFxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICdhbHdheXMnLFxuICAgIGFuYWx5dGljc0tleTogJ21hdGNoaW5nJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogWydrZXknLCAnc29sdXRpb24nXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdsZXR0ZXItYmFuaycgfSxcbiAgICBhMTF5OiB7XG4gICAgICBzdG9yeTpcbiAgICAgICAgJ1BvaW50ZXIgZHJhZyB3aXRoIGEga2V5Ym9hcmQgc2VsZWN0LXRoZW4tcGxhY2UgZ3JhbW1hciB1bmRlcm5lYXRoOiAnICtcbiAgICAgICAgJ3RhcmdldCBjYXJkcyBhcmUgZm9jdXNhYmxlLCBTcGFjZS9FbnRlciBsaWZ0cywgYXJyb3dzIGNob29zZSBhIGRvY2ssICcgK1xuICAgICAgICAnU3BhY2UvRW50ZXIgcGxhY2VzLCBFc2NhcGUgY2FuY2Vscy4gRXZlcnkgbW92ZSBuYXJyYXRlcyB0byBhICcgK1xuICAgICAgICAndmlzdWFsbHktaGlkZGVuIGFyaWEtbGl2ZSByZWdpb24gKFwiQ2FyZCBCIHBsYWNlZCBvbiBpdGVtIDJcIikuJyxcbiAgICB9LFxuICB9LFxuXG4gIG9yZGVyaW5nOiB7XG4gICAgdHlwZTogJ29yZGVyaW5nJyxcbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdvcmRlcmluZycsXG4gICAgc2FuaXRpemU6IHtcbiAgICAgIHN0cmlwOiBbJ3NvbHV0aW9uJ10sXG4gICAgICAvLyBUaGUgYXV0aG9yZWQgaXRlbXMgb3JkZXIgSVMgdGhlIGtleSBcdTIwMTQgdGhlIHNlcnZlciBzZXJ2ZXMgYSBzaHVmZmxlXG4gICAgICAvLyAoc3RhYmxlIHBlciB2ZXJzaW9uICsgc3R1ZGVudCBzbyByZWxvYWRzIGRvbid0IHJlc2h1ZmZsZSkuXG4gICAgICBzZXJ2ZVNodWZmbGVkOiBbJ2l0ZW1zJ10sXG4gICAgfSxcbiAgICBwcmludDoge1xuICAgICAgYnJlYWtJbnNpZGU6ICdhdm9pZCcsXG4gICAgICB0cmVhdG1lbnQ6ICdudW1iZXItYm94ZXMnLFxuICAgICAgLy8gVGhlIGF1dGhvcmVkIG9yZGVyIGlzIHRoZSBhbnN3ZXIsIHNvIHBhcGVyIG11c3QgbmV2ZXIgc2hvdyBpdC4gVGhlXG4gICAgICAvLyBzZXJ2ZXIgYWxyZWFkeSBzaHVmZmxlcyBmb3Igc3R1ZGVudHMgKHNlcnZlU2h1ZmZsZWQgYWJvdmUpOyB0ZWFjaGVyXG4gICAgICAvLyBwcmludCBnZXRzIGl0cyBvd24sIGJlY2F1c2UgdGhhdCBwYXRoIGRlbGliZXJhdGVseSBkb2VzIG5vdCBydW4gdGhlXG4gICAgICAvLyBwZXItc3R1ZGVudCBzZXJ2ZSBzaHVmZmxlLlxuICAgICAgc2h1ZmZsZWQ6IFsnaXRlbXMnXSxcbiAgICB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnUm93cyBhcmUgZm9jdXNhYmxlIGFuZCByZW9yZGVyIHZpYSB0aGUgc2hhcmVkIGxpZnQgZ3JhbW1hcjogJyArXG4gICAgICAgICdTcGFjZS9FbnRlciBsaWZ0cywgYXJyb3dzIG1vdmUgdGhlIHJvdywgU3BhY2UvRW50ZXIgZHJvcHMsIEVzY2FwZSAnICtcbiAgICAgICAgJ2NhbmNlbHM7IHBvc2l0aW9ucyBuYXJyYXRlIHRvIGEgdmlzdWFsbHktaGlkZGVuIGFyaWEtbGl2ZSByZWdpb24uJyxcbiAgICB9LFxuICB9LFxuXG4gIG51bWJlcl9saW5lOiB7XG4gICAgdHlwZTogJ251bWJlcl9saW5lJyxcbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnaW50ZXJhY3RpdmUnLFxuICAgIGNhdGVnb3J5OiAncXVlc3Rpb24nLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdudW1iZXJfbGluZScsXG4gICAgdmFyaWFudHM6IFsncGxvdF9wb2ludCcsICdwbG90X2ludGVydmFsJ10sXG4gICAgc2FuaXRpemU6IHtcbiAgICAgIC8vIFRoZSB3aWRnZXQgbmVlZHMgaGFuZGxlIGNvdW50IC8gZmFtaWx5LCB3aGljaCBsaXZlIGluIHRoZSBrZXkgdGhlXG4gICAgICAvLyB2aWV3ZXIgbmV2ZXIgZ2V0cy4gRGVyaXZlZCArIHdoaXRlbGlzdGVkOyBzZWUgU2FuaXRpemVTcGVjLlxuICAgICAgZGVyaXZlUXVlc3Rpb25TaGFwZTogdHJ1ZSxcbiAgICAgIHN0cmlwOiBbXG4gICAgICAgICdpbnRlcmFjdGlvbi5jb3JyZWN0UG9pbnRzJyxcbiAgICAgICAgJ2ludGVyYWN0aW9uLnRvbGVyYW5jZScsXG4gICAgICAgICdpbnRlcmFjdGlvbi5jb3JyZWN0SW50ZXJ2YWwnLFxuICAgICAgICAnc29sdXRpb24nLFxuICAgICAgXSxcbiAgICB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdzdGF0aWMtc3ZnJyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnVGhlIGxpbmUgaXMgZm9jdXNhYmxlOyBwb2ludHMvaW50ZXJ2YWwgZW5kcG9pbnRzIG1vdmUgYnkgYXJyb3cga2V5cyAnICtcbiAgICAgICAgJ3dpdGggdmFsdWUgbmFycmF0aW9uIHRvIGEgdmlzdWFsbHktaGlkZGVuIGFyaWEtbGl2ZSByZWdpb24gKHZpc2libGUgJyArXG4gICAgICAgICdyZWFkb3V0IHdvdWxkIHJldmVhbCB0aGUgYW5zd2VyKS4gUG9zdC1jaGVjayByZXN1bHRzIGFyZSB2aXNpYmxlLicsXG4gICAgfSxcbiAgfSxcblxuICBkYXRhX3Bsb3Q6IHtcbiAgICB0eXBlOiAnZGF0YV9wbG90JyxcbiAgICBmYW1pbHk6ICdhdXRvX2dyYWRhYmxlJywgLy8gZGlzcGxheSB2YXJpYW50IHJlc29sdmVzIHN0YXRpYyB2aWEgZmFtaWx5T2YoKVxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsIC8vIGRpc3BsYXkgdmFyaWFudCByZXNvbHZlcyBjb250ZW50IHZpYSBjYXRlZ29yeU9mKClcbiAgICBudW1iZXJlZDogJ3doZW5fZ3JhZGFibGUnLFxuICAgIGFuYWx5dGljc0tleTogJ2RhdGFfcGxvdCcsXG4gICAgdmFyaWFudHM6IFsnZGlzcGxheScsICdidWlsZF9kb3RwbG90JywgJ2J1aWxkX2hpc3RvZ3JhbScsICdidWlsZF9ib3hwbG90J10sXG4gICAgc2FuaXRpemU6IHtcbiAgICAgIC8vIFRoZSB3aWRnZXQgbmVlZHMgaGFuZGxlIGNvdW50IC8gZmFtaWx5LCB3aGljaCBsaXZlIGluIHRoZSBrZXkgdGhlXG4gICAgICAvLyB2aWV3ZXIgbmV2ZXIgZ2V0cy4gRGVyaXZlZCArIHdoaXRlbGlzdGVkOyBzZWUgU2FuaXRpemVTcGVjLlxuICAgICAgZGVyaXZlUXVlc3Rpb25TaGFwZTogdHJ1ZSxcbiAgICAgIHN0cmlwOiBbJ3NvbHV0aW9uJywgJ2ludGVyYWN0aW9uLnRvbGVyYW5jZSddLFxuICAgICAgZGVyaXZhYmxlRnJvbVNlcnZlZDpcbiAgICAgICAgJ1RoZSBkYXRhIHNldCBpcyB0aGUgd29ya2luZyBtYXRlcmlhbCB0aGUgc3R1ZGVudCBidWlsZHMgdGhlIGNoYXJ0ICcgK1xuICAgICAgICAnRlJPTSwgYW5kIHRoZSBjb3JyZWN0IGNoYXJ0IGlzIGNvbXB1dGVkIGZyb20gaXQgXHUyMDE0IHdpdGhob2xkaW5nIHRoZSAnICtcbiAgICAgICAgJ2RhdGEgd291bGQgcmVtb3ZlIHRoZSB0YXNrLiBTZXJ2ZXItYXV0aG9yaXRhdGl2ZSBncmFkaW5nIHN0aWxsIGdhdGVzICcgK1xuICAgICAgICAndmVyZGljdHM7IHRoZSBsZWFrIHRlc3RzIHdoaXRlbGlzdCBgZGF0YWAgZm9yIHRoaXMgYmxvY2sgZXhwbGljaXRseS4nLFxuICAgIH0sXG4gICAgLy8gV0FTIGEgZmFpdGhmdWwgb2RkaXR5IChhYnNlbnQgZnJvbSB0aGUgYmFzZWxpbmUgYnJlYWstaW5zaWRlOmF2b2lkIGxpc3QsXG4gICAgLy8gdW5saWtlIHRoZSBncmFwaCBhbmQgbnVtYmVyLWxpbmUgY2FudmFzZXMpLiBGSVhFRCBieSBydWxpbmcgUzUtT1Y2IFx1MjAxNCBhXG4gICAgLy8gY2hhcnQgc3BsaXQgYWNyb3NzIGEgcGFnZSBib3VuZGFyeSBpcyB1bnJlYWRhYmxlLlxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdzdGF0aWMtc3ZnJyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnQ2hhcnQtYnVpbGRpbmcgY29udHJvbHMgYXJlIGZvY3VzYWJsZTsgZG90cy9iYXJzL2JveCBoYW5kbGVzIGFkanVzdCAnICtcbiAgICAgICAgJ2J5IGFycm93IGtleXMgd2l0aCB2YWx1ZSBuYXJyYXRpb24gdG8gYSB2aXN1YWxseS1oaWRkZW4gYXJpYS1saXZlICcgK1xuICAgICAgICAncmVnaW9uLiBQb3N0LWNoZWNrIHJlc3VsdHMgYXJlIHZpc2libGUgdGV4dC4nLFxuICAgIH0sXG4gIH0sXG5cbiAgbGVhcm5pbmdfb2JqZWN0aXZlczoge1xuICAgIHR5cGU6ICdsZWFybmluZ19vYmplY3RpdmVzJyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnbGVhcm5pbmdfb2JqZWN0aXZlcycsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ2JvcmRlcmVkLWJveCcgfSxcbiAgfSxcblxuICB3b3JrZWRfZXhhbXBsZToge1xuICAgIHR5cGU6ICd3b3JrZWRfZXhhbXBsZScsXG4gICAgZmFtaWx5OiAnc3RhdGljJyxcbiAgICBpbnRlcmFjdGl2aXR5OiAnY29udGFpbmVyJyxcbiAgICBjYXRlZ29yeTogJ2NvbnRlbnQnLFxuICAgIG51bWJlcmVkOiAnbmV2ZXInLFxuICAgIGFuYWx5dGljc0tleTogJ3dvcmtlZF9leGFtcGxlJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10sIGNoaWxkQmxvY2tzOiBbJ2NvbnRlbnQnXSB9LFxuICAgIHByaW50OiB7IGJyZWFrSW5zaWRlOiAnYXZvaWQnLCB0cmVhdG1lbnQ6ICdib3JkZXJlZC1ib3gnIH0sXG4gIH0sXG5cbiAgZmFkZWRfd29ya2VkX2V4YW1wbGU6IHtcbiAgICB0eXBlOiAnZmFkZWRfd29ya2VkX2V4YW1wbGUnLFxuICAgIC8vIFRoZSBib3ggY291bnRzIGFzIE9ORSBudW1iZXJlZCBwcm9ibGVtOyBncmFkaW5nIHJpZGVzIGl0cyBjaGlsZFxuICAgIC8vIGZpbGxfaW5fYmxhbmsgc3RlcHMsIGVhY2ggc2FuaXRpemVkIGJ5IGl0cyBvd24gZW50cnkgdmlhIGNoaWxkQmxvY2tzLlxuICAgIGZhbWlseTogJ2F1dG9fZ3JhZGFibGUnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnc2NhZmZvbGQnLFxuICAgIG51bWJlcmVkOiAnYWx3YXlzJyxcbiAgICBhbmFseXRpY3NLZXk6ICdmYWRlZF93b3JrZWRfZXhhbXBsZScsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdLCBjaGlsZEJsb2NrczogWydjb250ZW50J10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnYm9yZGVyZWQtYm94JyB9LFxuICB9LFxuXG4gIHNlbGZfZXhwbGFuYXRpb246IHtcbiAgICB0eXBlOiAnc2VsZl9leHBsYW5hdGlvbicsXG4gICAgZmFtaWx5OiAncmVjb3JkZWQnLFxuICAgIGludGVyYWN0aXZpdHk6ICdpbnRlcmFjdGl2ZScsXG4gICAgY2F0ZWdvcnk6ICdxdWVzdGlvbicsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnc2VsZl9leHBsYW5hdGlvbicsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFtdIH0sXG4gICAgLy8gV0FTIGEgZmFpdGhmdWwgb2RkaXR5OiB0aGUgYmFzZWxpbmUgYXZvaWQgcmlkZXMgdGhlIHRleHRhcmVhLCBub3QgdGhlXG4gICAgLy8gYmxvY2ssIHNvIGEgbG9uZyBwcm9tcHQgY291bGQgc2VwYXJhdGUgZnJvbSBpdHMgd3JpdGluZyBib3guIEZJWEVEIGJ5XG4gICAgLy8gcnVsaW5nIFM1LU9WNiBcdTIwMTQgYSBwcm9tcHQgb24gb25lIHBhZ2UgYW5kIGl0cyBhbnN3ZXIgc3BhY2Ugb24gdGhlIG5leHQgaXNcbiAgICAvLyB0aGUgc2FtZSBkZWZlY3QgY2xhc3MgYXMgYSBzcGxpdCBlcXVhdGlvbi5cbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnd3JpdGluZy1ib3gnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdBIGxhYmVsZWQgdGV4dGFyZWEgaW4gdGFiIG9yZGVyLiBPbiBjaGVjayB0aGUgYmxvY2sgYW5ub3VuY2VzICcgK1xuICAgICAgICAnXCJSZWNvcmRlZCBcdTIwMTQgeW91ciB0ZWFjaGVyIHdpbGwgcmV2aWV3XCIgdmlhIGFyaWEtbGl2ZTsgbmV2ZXIgYSB2ZXJkaWN0LicsXG4gICAgfSxcbiAgfSxcblxuICBzaG9ydF9hbnN3ZXI6IHtcbiAgICB0eXBlOiAnc2hvcnRfYW5zd2VyJyxcbiAgICBmYW1pbHk6ICdyZWNvcmRlZCcsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdzaG9ydF9hbnN3ZXInLFxuICAgIC8vIFJ1YnJpY3MgYXJlIHRlYWNoZXItc2lkZSBkYXRhIFx1MjAxNCBhbHJlYWR5IGNvcnJlY3RseSB3aXRoaGVsZCBmcm9tIHN0dWRlbnRcbiAgICAvLyBIVE1MIHRvZGF5OyB0aGUgcmVnaXN0cnkgbWFrZXMgdGhhdCBhIGRlY2xhcmVkIGludmFyaWFudC5cbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogWydydWJyaWMnXSB9LFxuICAgIC8vIFNhbWUgZm9ybWVyIG9kZGl0eSBhcyBzZWxmX2V4cGxhbmF0aW9uLCBhbmQgZml4ZWQgd2l0aCBpdDogdGhlIGJhc2VsaW5lXG4gICAgLy8gYXZvaWQgcmlkZXMgdGhlIHRleHRhcmVhLCBub3QgdGhlIGJsb2NrLCBzbyBhIHByb21wdCBjb3VsZCBwcmludCBvbiBvbmVcbiAgICAvLyBwYWdlIHdpdGggaXRzIGFuc3dlciBzcGFjZSBvbiB0aGUgbmV4dC4gUzUtT1Y2IG5hbWVkIG9ubHkgdGhlIHRocmVlXG4gICAgLy8gdHlwZXMgaXRzIGNvbW1lbnRzIGZsYWdnZWQ7IHRoZSBhdXRob3IgZXh0ZW5kZWQgdGhlIHJ1bGluZyB0byB0aGUgdHdvXG4gICAgLy8gdW5uYW1lZCBzaWJsaW5ncyBvZiB0aGUgc2FtZSBmYW1pbHkgcmF0aGVyIHRoYW4gbGVhdmUgdGhlIGRlZmVjdCBpblxuICAgIC8vIHBsYWNlIGZvciB0aGVtICh0aGUgcGxvdF9yYXkvcGxvdF9zZWdtZW50IGxlc3NvbjogYXVkaXQgdGhlIGZhbWlseSkuXG4gICAgcHJpbnQ6IHsgYnJlYWtJbnNpZGU6ICdhdm9pZCcsIHRyZWF0bWVudDogJ3dyaXRpbmctYm94JyB9LFxuICAgIGExMXk6IHtcbiAgICAgIHN0b3J5OlxuICAgICAgICAnQSBsYWJlbGVkIHRleHRhcmVhIGluIHRhYiBvcmRlci4gUmVjb3JkZWQgc3RhdGUgYW5ub3VuY2VzIHZpYSAnICtcbiAgICAgICAgJ2FyaWEtbGl2ZTsgdGVhY2hlciBmZWVkYmFjaywgb25jZSByZWxlYXNlZCwgcmVuZGVycyBhcyBhIGxhYmVsZWQgJyArXG4gICAgICAgICdyZWdpb24gYW5ub3VuY2VkIG9uIGFycml2YWwuJyxcbiAgICB9LFxuICB9LFxuXG4gIGVzc2F5OiB7XG4gICAgdHlwZTogJ2Vzc2F5JyxcbiAgICBmYW1pbHk6ICdyZWNvcmRlZCcsXG4gICAgaW50ZXJhY3Rpdml0eTogJ2ludGVyYWN0aXZlJyxcbiAgICBjYXRlZ29yeTogJ3F1ZXN0aW9uJyxcbiAgICBudW1iZXJlZDogJ25ldmVyJyxcbiAgICBhbmFseXRpY3NLZXk6ICdlc3NheScsXG4gICAgc2FuaXRpemU6IHsgc3RyaXA6IFsncnVicmljJ10gfSxcbiAgICAvLyBFeHRlbmRlZCB3aXRoIHNob3J0X2Fuc3dlciArIHNlbGZfZXhwbGFuYXRpb24gXHUyMDE0IHNlZSB0aGUgbm90ZSB0aGVyZS5cbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F2b2lkJywgdHJlYXRtZW50OiAnd3JpdGluZy1ib3gnIH0sXG4gICAgYTExeToge1xuICAgICAgc3Rvcnk6XG4gICAgICAgICdBIGxhYmVsZWQgdGV4dGFyZWEgaW4gdGFiIG9yZGVyLiBUaGUgbGl2ZSB3b3JkIGNvdW50ZXIgaXMgJyArXG4gICAgICAgICdhcmlhLWxpdmU9cG9saXRlIGFuZCBkZWJvdW5jZWQgc28gaXQgbmV2ZXIgY2hhdHRlcnMgcGVyIGtleXN0cm9rZS4gJyArXG4gICAgICAgICdSZWNvcmRlZCBzdGF0ZSBhbmQgcmVsZWFzZWQgdGVhY2hlciBmZWVkYmFjayBhbm5vdW5jZSB2aWEgYXJpYS1saXZlLicsXG4gICAgfSxcbiAgfSxcblxuICBncmFwaF9maWd1cmU6IHtcbiAgICB0eXBlOiAnZ3JhcGhfZmlndXJlJyxcbiAgICBmYW1pbHk6ICdzdGF0aWMnLFxuICAgIGludGVyYWN0aXZpdHk6ICdjb250YWluZXInLFxuICAgIGNhdGVnb3J5OiAnY29udGVudCcsXG4gICAgbnVtYmVyZWQ6ICduZXZlcicsXG4gICAgYW5hbHl0aWNzS2V5OiAnZ3JhcGhfZmlndXJlJyxcbiAgICBzYW5pdGl6ZTogeyBzdHJpcDogW10gfSxcbiAgICBwcmludDogeyBicmVha0luc2lkZTogJ2F1dG8nLCB0cmVhdG1lbnQ6ICdmaWd1cmUnIH0sXG4gIH0sXG59O1xuXG4vKiogRXZlcnkgcmVnaXN0ZXJlZCB0eXBlLCBpbiByZWdpc3RyeSBkZWNsYXJhdGlvbiBvcmRlci4gKi9cbmV4cG9ydCBjb25zdCByZWdpc3RlcmVkQmxvY2tUeXBlcyA9IE9iamVjdC5rZXlzKGJsb2NrUmVnaXN0cnkpIGFzIEJsb2NrVHlwZVtdO1xuXG4vKiogUmVzb2x2ZSBhbiBJTlNUQU5DRSdzIGNoZWNrZWQtc3RhdGUgZmFtaWx5LiBBIHR5cGUncyBkZWNsYXJlZCBmYW1pbHkgaXNcbiAqIG1heGltYWw7IHVuZ3JhZGFibGUgaW5zdGFuY2VzIG9mIGdyYWRhYmxlIHR5cGVzIChkaXNwbGF5IGdyYXBoL2RhdGEgcGxvdCxcbiAqIHByb21wdGxlc3MgbWF0aCBibG9jaykgcmVzb2x2ZSB0byBzdGF0aWMgXHUyMDE0IG9uZSBydWxlIGVuZ2luZSwgaXNHcmFkZWFibGUuICovXG5leHBvcnQgZnVuY3Rpb24gZmFtaWx5T2YoYmxvY2s6IEJsb2NrKTogQ2hlY2tlZFN0YXRlRmFtaWx5IHtcbiAgY29uc3QgZW50cnkgPSBibG9ja1JlZ2lzdHJ5W2Jsb2NrLnR5cGVdO1xuICBpZiAoZW50cnkuZmFtaWx5ID09PSAnc3RhdGljJykgcmV0dXJuICdzdGF0aWMnO1xuICByZXR1cm4gaXNHcmFkZWFibGUoYmxvY2spID8gZW50cnkuZmFtaWx5IDogJ3N0YXRpYyc7XG59XG5cbi8qKiBSZXNvbHZlIGFuIElOU1RBTkNFJ3MgY2F0ZWdvcnk6IGEgZGlzcGxheS1tb2RlIGdyYXBoL2RhdGEgcGxvdCBzZXJ2ZXMgYXNcbiAqIGNvbnRlbnQsIG1hdGNoaW5nIHRoZSByZW5kZXJlcidzIGRhdGEtYmxvY2stY2F0ZWdvcnkgZW1pc3Npb24uICovXG5leHBvcnQgZnVuY3Rpb24gY2F0ZWdvcnlPZihibG9jazogQmxvY2spOiBCbG9ja0NhdGVnb3J5IHtcbiAgY29uc3QgZW50cnkgPSBibG9ja1JlZ2lzdHJ5W2Jsb2NrLnR5cGVdO1xuICBpZiAoZW50cnkuY2F0ZWdvcnkgPT09ICdxdWVzdGlvbicgJiYgZW50cnkubnVtYmVyZWQgPT09ICd3aGVuX2dyYWRhYmxlJykge1xuICAgIHJldHVybiBpc0dyYWRlYWJsZShibG9jaykgPyAncXVlc3Rpb24nIDogJ2NvbnRlbnQnO1xuICB9XG4gIHJldHVybiBlbnRyeS5jYXRlZ29yeTtcbn1cblxuLyoqIENlbnN1cyBrZXkgZm9yIGFuIGluc3RhbmNlIChQM0EpOiB0aGUgYW5hbHl0aWNzIGtleSwgd2l0aCB0aGUgaW50ZXJhY3Rpb25cbiAqIHZhcmlhbnQgYXBwZW5kZWQgZm9yIHRoZSBibG9ja3MgdGhhdCBoYXZlIG9uZSBcdTIwMTQgYGRhdGFfcGxvdC5idWlsZF9oaXN0b2dyYW1gLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNlbnN1c0tleU9mKGJsb2NrOiBCbG9jayk6IHN0cmluZyB7XG4gIGNvbnN0IGVudHJ5ID0gYmxvY2tSZWdpc3RyeVtibG9jay50eXBlXTtcbiAgaWYgKCdpbnRlcmFjdGlvbicgaW4gYmxvY2sgJiYgZW50cnkudmFyaWFudHMpIHtcbiAgICByZXR1cm4gYCR7ZW50cnkuYW5hbHl0aWNzS2V5fS4ke2Jsb2NrLmludGVyYWN0aW9uLnR5cGV9YDtcbiAgfVxuICByZXR1cm4gZW50cnkuYW5hbHl0aWNzS2V5O1xufVxuXG4vKiogV2hldGhlciBhbiBJTlNUQU5DRSBkcmF3cyBhIHByb2JsZW0gbnVtYmVyIChkZWxlZ2F0ZXMgdG8gdGhlIHNjaGVtYSBydWxlXG4gKiBlbmdpbmUgXHUyMDE0IHJlLWV4cG9ydGVkIGhlcmUgc28gdmlld2VyIGNvZGUgaGFzIG9uZSBpbXBvcnQgc3VyZmFjZSkuICovXG5leHBvcnQgeyBpc1BhZ2VOdW1iZXJlZCB9O1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBwcm9tcHRDYXJyaWVycy50cyBcdTIwMTQgdGhlIE9ORSBsaXN0IG9mIGlubGluZSB0eXBlcyB3aG9zZSBgcHJvbXB0c2AgY2Fycnkga2V5c1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEEgbWF0aCBub2RlJ3MgYHByb21wdHNgIGFycmF5IGhvbGRzIGluLWJhbmQgYW5zd2VyIG1hdGVyaWFsLCBzbyBib3RoIHRoZVxuLy8gc2FuaXRpemVyJ3MgZGVlcCBzdHJpcCAobGF5ZXIgMykgYW5kIHRoZSBncmFkaW5nIHdhbGsncyBrZXkgY29sbGVjdGlvbiBtdXN0XG4vLyBhZ3JlZSBvbiBleGFjdGx5IHdoaWNoIG5vZGUgdHlwZXMgY2FycnkgcHJvbXB0cy4gVW50aWwgMjAyNi0wOC0wNiB0aGlzIFNldFxuLy8gd2FzIGRlY2xhcmVkIHR3aWNlIHdpdGggaWRlbnRpY2FsIGNvbnRlbnRzIChzYW5pdGl6ZS50cyBhbmQgZ3JhZGluZy93YWxrLnRzXG4vLyBcdTIwMTQgczQtcmV0cm8gZmluZGluZyAxMCwgZml4ZWQgYnkgZW5nLXJldmlldyBBNyk6IHR3byBzcGVsbGluZ3Mgb2YgYSBzZWN1cml0eS1cbi8vIHJlbGV2YW50IHJvc3RlciwgYm9uZGVkIGJ5IG5vdGhpbmcuIEEgdHlwZSBhZGRlZCB0byBvbmUgYW5kIG5vdCB0aGUgb3RoZXJcbi8vIHdvdWxkIGVpdGhlciBsZWFrIGEgcHJvbXB0IGtleSB0byBzdHVkZW50cyAoc2FuaXRpemUgc2lkZSBtaXNzaW5nKSBvciBncmFkZVxuLy8gYWdhaW5zdCBhIGtleSB0aGUgd2lyZSBuZXZlciBjYXJyaWVkICh3YWxrIHNpZGUgbWlzc2luZykgXHUyMDE0IGJvdGggc2lsZW50LlxuLy9cbi8vIFRoaXMgbW9kdWxlIGlzIGEgZGVwZW5kZW5jeS1mcmVlIGxlYWYgT04gUFVSUE9TRTogaXQgaXMgaW1wb3J0ZWQgYnkgdGhlIHJlYWRcbi8vIGJ1bmRsZSAodmlhIHNhbml0aXplLnRzKSBBTkQgdGhlIGdyYWRpbmcgYnVuZGxlICh2aWEgd2Fsay50cyksIHNvIGl0IG11c3Rcbi8vIG5ldmVyIGdyb3cgYW4gaW1wb3J0IHRoYXQgZWl0aGVyIGJ1bmRsZSBjYW4ndCBhZmZvcmQuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vKiogSW5saW5lIG5vZGUgdHlwZXMgd2hvc2UgYHByb21wdHNgIGFycmF5cyBjYXJyeSBpbi1iYW5kIGFuc3dlciBrZXlzLiAqL1xuZXhwb3J0IGNvbnN0IFBST01QVF9DQVJSSUVSX1RZUEVTOiBSZWFkb25seVNldDxzdHJpbmc+ID0gbmV3IFNldChbXG4gICdtYXRoX2lubGluZScsXG4gICdtYXRoX2Jsb2NrJyxcbl0pO1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBzYW5pdGl6ZS9zYW5pdGl6ZS50cyBcdTIwMTQgdGhlIGFuc3dlci1rZXkgc2FuaXRpemVyIChTMi9UMywgcnVsaW5nIFRWNC1BKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEEgR0VORVJJQyBzdHJpcCB0cmFuc2Zvcm0gZHJpdmVuIGVudGlyZWx5IGJ5IHRoZSByZWdpc3RyeSdzIFNhbml0aXplU3BlY1xuLy8gZGVjbGFyYXRpb25zIFx1MjAxNCBpdCBob2xkcyBubyBwZXItdHlwZSBrbm93bGVkZ2Ugb2YgaXRzIG93biAocnVsaW5nIFExQTogdGhlXG4vLyByZWdpc3RyeSBkZWNsYXJlcywgdHJhbnNmb3JtcyBvYmV5KS4gUnVucyBzZXJ2ZXItc2lkZSBpbiB0aGUgZ2V0LWFjdGl2aXR5XG4vLyBFZGdlIEZ1bmN0aW9uLCBjb21wb3NlZCB3aXRoIHVwZ3JhZGUtb24tcmVhZDsgdGhlIG91dHB1dCBpcyB3aGF0IHRoZSBkdXJhYmxlXG4vLyBwZXItdmVyc2lvbiBjYWNoZSBzdG9yZXMgYW5kIHRoZSB2aWV3ZXIgcmVjZWl2ZXMuIEFuc3dlcnMgTkVWRVIgcmVhY2ggYVxuLy8gc3R1ZGVudCBjbGllbnQgKHJ1bGluZyBRMkIpIFx1MjAxNCB0aGUgd2lyZS1sZXZlbCBsZWFrIHRlc3RzIGluXG4vLyB0ZXN0cy9zYW5pdGl6ZS50ZXN0LnRzIGFzc2VydCB0aGUgb3V0Y29tZSwgbm90IHRoZSBtZWNoYW5pc20uXG4vL1xuLy8gVGhyZWUgbGF5ZXJzLCBpbiBvcmRlciwgcGVyIGJsb2NrOlxuLy8gICAxLiBEZWNsYXJlZCBzdHJpcHMgXHUyMDE0IHRoZSBlbnRyeSdzIGBzdHJpcGAgcGF0aHMsIGluIHRoZSB0aW55IGdyYW1tYXJcbi8vICAgICAgdHlwZXMudHMgZG9jdW1lbnRzICgnZmllbGQnLCAnZmllbGRbXS5zdWInLCAnaW50ZXJhY3Rpb24uZmllbGQnKS5cbi8vICAgMi4gQ2hpbGQgcmVjdXJzaW9uIFx1MjAxNCBgY2hpbGRCbG9ja3NgIGZpZWxkcyByZS1lbnRlciB0aGUgc2FuaXRpemVyLCBzbyBhXG4vLyAgICAgIGZpbGxfaW5fYmxhbmsgbmVzdGVkIGluIGEgd29ya2VkIGV4YW1wbGUgaXMgc3RyaXBwZWQgYnkgSVRTIE9XTiBlbnRyeS5cbi8vICAgMy4gSW4tYmFuZCBkZWVwIHdhbGsgXHUyMDE0IEJsYW5rVG9rZW4gYW5kIE1hdGhQcm9tcHQgc2VjcmV0cyBhcmUgc3RyaXBwZWQgZnJvbVxuLy8gICAgICBldmVyeSBvYmplY3QgdGhlIGJsb2NrIGNhcnJpZXMsIFVOQ09ORElUSU9OQUxMWSAobm90IGdhdGVkIG9uIHRoZVxuLy8gICAgICBlbnRyeSdzIGBpbmxpbmVCbGFua1NlY3JldHNgIGZsYWcpLiBEZWZlbnNlIGluIGRlcHRoOiB0aGUgc2NoZW1hIGFkbWl0c1xuLy8gICAgICBhIHByb21wdGVkIG1hdGhfaW5saW5lIGluc2lkZSBhbnkgY29udGVudCBhcnJheSBcdTIwMTQgYSBwYXJhZ3JhcGgsIGEgaGludCxcbi8vICAgICAgYSBsaXN0IGl0ZW0gXHUyMDE0IGFuZCBhIGRlY2xhcmF0aW9uIG1pc3MgdGhlcmUgbXVzdCBub3QgYmVjb21lIGEgc2lsZW50XG4vLyAgICAgIGxlYWsuIFRoZSBmbGFnIHN0YXlzIGRlY2xhcmF0aXZlIChzZWUgdHlwZXMudHMpLlxuLy9cbi8vIFdoYXQgc2FuaXRpemUgZG9lcyBOT1QgZG86IHRoZSBwZXItc3R1ZGVudCBgc2VydmVTaHVmZmxlZGAgcmVvcmRlci4gVGhhdCBpc1xuLy8gc2VydmUtdGltZSB3b3JrIChzaHVmZmxlLnRzKSBwcmVjaXNlbHkgc28gVEhJUyBvdXRwdXQgaXMgY2FjaGVhYmxlIHBlclxuLy8gdmVyc2lvbiBcdTIwMTQgdGhlIG9yZGVyIHNlY3JldCBjYW4ndCBiZSBoYW5kbGVkIGJ5IGEgc3RyaXAsIGFuZCB0aGUgc2h1ZmZsZVxuLy8gY2FuJ3QgYmUgaGFuZGxlZCBieSB0aGUgY2FjaGUuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgdHlwZSB7IEFjdGl2aXR5RG9jdW1lbnQsIEJsb2NrIH0gZnJvbSAnQGFjdGl2aXR5L3NjaGVtYSc7XG5pbXBvcnQge1xuICBCTEFOS19TRUNSRVRfRklFTERTLFxuICBNQVRIX1BST01QVF9TRUNSRVRfRklFTERTLFxuICBibG9ja1JlZ2lzdHJ5LFxuICByZWdpc3RlcmVkQmxvY2tUeXBlcyxcbn0gZnJvbSAnLi4vcmVnaXN0cnkvcmVnaXN0cnkuanMnO1xuaW1wb3J0IHsgUFJPTVBUX0NBUlJJRVJfVFlQRVMgfSBmcm9tICcuL3Byb21wdENhcnJpZXJzLmpzJztcbmltcG9ydCB0eXBlIHtcbiAgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCxcbiAgU2FuaXRpemVkQmxvY2ssXG59IGZyb20gJy4vc2FuaXRpemVkLXR5cGVzLmpzJztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNhbml0aXplciByZXZpc2lvbiBcdTIwMTQgdGhlIGR1cmFibGUgY2FjaGUncyBpbnZhbGlkYXRpb24ga2V5XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHJlYWQgY2FjaGUgc3RvcmVzIHNhbml0aXplZCBvdXRwdXQgcGVyICh2ZXJzaW9uX2lkLCBTQU5JVElaRVJfUkVWKS4gVGhlXG4vLyByZXYgaXMgQ09NUFVURUQgZnJvbSB0aGUgcmVnaXN0cnkncyBzYW5pdGl6ZSBkZWNsYXJhdGlvbnMgKyB0aGUgc2VjcmV0LWZpZWxkXG4vLyBsaXN0cywgc28gY2hhbmdpbmcgYW55IHNwZWMgYXV0b21hdGljYWxseSBvcnBoYW5zIGV2ZXJ5IHN0YWxlIGNhY2hlIHJvdyBcdTIwMTQgYVxuLy8gc2FuaXRpemVyIGZpeCB0aGF0IHJlcXVpcmVkIGEgaGFuZC1idW1wZWQgY29uc3RhbnQgdG8gdGFrZSBlZmZlY3QgaXMgZXhhY3RseVxuLy8gdGhlIGZvcmdldHRhYmxlLXN0ZXAgY2xhc3MgdGhpcyByZXBvIGRvY3VtZW50cyAoZ3JhcGgta2l0IG1hbmlmZXN0LCAwMDE1J3Ncbi8vIGdyYW50IHN0YW56YXMpLiBCdW1wIFNBTklUSVpFUl9BTEdPX1JFViBieSBoYW5kIE9OTFkgd2hlbiB0aGUgdHJhbnNmb3JtXG4vLyBsb2dpYyBpdHNlbGYgY2hhbmdlcyBpbiBhIHdheSB0aGUgZGVjbGFyYXRpb25zIGRvbid0IGNhcHR1cmUuXG5cbmV4cG9ydCBjb25zdCBTQU5JVElaRVJfQUxHT19SRVYgPSAxO1xuXG4vKiogRk5WLTFhIDMyLWJpdCwgaGV4LiBUaW55LCBkZXBlbmRlbmN5LWZyZWUsIHN0YWJsZSBhY3Jvc3MgSlMgcnVudGltZXMgXHUyMDE0XG4gKiB0aGlzIGlzIGEgY2FjaGUtYnVzdGluZyBmaW5nZXJwcmludCwgbm90IHNlY3VyaXR5IG1hdGVyaWFsLiAqL1xuZnVuY3Rpb24gZm52MWEodGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IGhhc2ggPSAweDgxMWM5ZGM1O1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRleHQubGVuZ3RoOyBpKyspIHtcbiAgICBoYXNoIF49IHRleHQuY2hhckNvZGVBdChpKTtcbiAgICBoYXNoID0gTWF0aC5pbXVsKGhhc2gsIDB4MDEwMDAxOTMpO1xuICB9XG4gIHJldHVybiAoaGFzaCA+Pj4gMCkudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDgsICcwJyk7XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVTYW5pdGl6ZXJSZXYoKTogc3RyaW5nIHtcbiAgY29uc3Qgc3BlY3MgPSBbLi4ucmVnaXN0ZXJlZEJsb2NrVHlwZXNdXG4gICAgLnNvcnQoKVxuICAgIC5tYXAoKHR5cGUpID0+IFt0eXBlLCBibG9ja1JlZ2lzdHJ5W3R5cGVdLnNhbml0aXplXSk7XG4gIGNvbnN0IG1hdGVyaWFsID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgIGFsZ286IFNBTklUSVpFUl9BTEdPX1JFVixcbiAgICBibGFuazogQkxBTktfU0VDUkVUX0ZJRUxEUyxcbiAgICBwcm9tcHQ6IE1BVEhfUFJPTVBUX1NFQ1JFVF9GSUVMRFMsXG4gICAgc3BlY3MsXG4gIH0pO1xuICByZXR1cm4gYCR7U0FOSVRJWkVSX0FMR09fUkVWfS0ke2ZudjFhKG1hdGVyaWFsKX1gO1xufVxuXG4vKiogVGhlIGNhY2hlIGtleSBjb21wb25lbnQuIFN0YWJsZSBmb3IgYSBnaXZlbiByZWdpc3RyeSArIGFsZ29yaXRobTsgY2hhbmdlc1xuICogd2hlbmV2ZXIgYW55IHNhbml0aXplIGRlY2xhcmF0aW9uIGNoYW5nZXMuICovXG5leHBvcnQgY29uc3QgU0FOSVRJWkVSX1JFViA9IGNvbXB1dGVTYW5pdGl6ZXJSZXYoKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSBzdHJpcCBncmFtbWFyIChleGFjdGx5IHdoYXQgdHlwZXMudHMgZG9jdW1lbnRzIFx1MjAxNCBub3RoaW5nIG1vcmUpXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBhcHBseVN0cmlwUGF0aChibG9jazogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIHBhdGg6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBhcnJheUlkeCA9IHBhdGguaW5kZXhPZignW10uJyk7XG4gIGlmIChhcnJheUlkeCAhPT0gLTEpIHtcbiAgICAvLyAnZmllbGRbXS5zdWInIFx1MjAxNCBkZWxldGUgYHN1YmAgZnJvbSBldmVyeSBlbGVtZW50IG9mIGFycmF5IGBmaWVsZGAuXG4gICAgY29uc3QgZmllbGQgPSBwYXRoLnNsaWNlKDAsIGFycmF5SWR4KTtcbiAgICBjb25zdCBzdWIgPSBwYXRoLnNsaWNlKGFycmF5SWR4ICsgMyk7XG4gICAgY29uc3QgYXJyID0gYmxvY2tbZmllbGRdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgIGZvciAoY29uc3QgZWwgb2YgYXJyKSB7XG4gICAgICAgIGlmIChlbCAhPT0gbnVsbCAmJiB0eXBlb2YgZWwgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgZGVsZXRlIChlbCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilbc3ViXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgZG90SWR4ID0gcGF0aC5pbmRleE9mKCcuJyk7XG4gIGlmIChkb3RJZHggIT09IC0xKSB7XG4gICAgLy8gJ3BhcmVudC5maWVsZCcgXHUyMDE0IGRlbGV0ZSBgZmllbGRgIGZyb20gdGhlIG5lc3RlZCBvYmplY3Qgd2hlbiBwcmVzZW50LlxuICAgIC8vIFZhcmlhbnQtc2NvcGVkIGtleXMgc2ltcGx5IGRvbid0IG1hdGNoIG9uIG90aGVyIHZhcmlhbnRzLlxuICAgIGNvbnN0IHBhcmVudCA9IGJsb2NrW3BhdGguc2xpY2UoMCwgZG90SWR4KV07XG4gICAgaWYgKHBhcmVudCAhPT0gbnVsbCAmJiB0eXBlb2YgcGFyZW50ID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShwYXJlbnQpKSB7XG4gICAgICBkZWxldGUgKHBhcmVudCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilbcGF0aC5zbGljZShkb3RJZHggKyAxKV07XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuICAvLyAnZmllbGQnIFx1MjAxNCBkZWxldGUgdGhlIGJsb2NrJ3MgdG9wLWxldmVsIGZpZWxkLlxuICBkZWxldGUgYmxvY2tbcGF0aF07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBJbi1iYW5kIHNlY3JldHMgXHUyMDE0IHRoZSB1bmNvbmRpdGlvbmFsIGRlZXAgd2FsayAobGF5ZXIgMylcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQUk9NUFRfQ0FSUklFUl9UWVBFUyBpcyBzaW5nbGUtc291cmNlZCAocHJvbXB0Q2FycmllcnMudHMpIFx1MjAxNCB0aGUgZ3JhZGluZ1xuLy8gd2FsayBjb25zdW1lcyB0aGUgc2FtZSByb3N0ZXIsIGFuZCB0d28gZGVjbGFyYXRpb25zIGRyaWZ0ZWQtcmlzayBhIHNpbGVudFxuLy8gbGVhayBvciBhIHNpbGVudCBtaXMtZ3JhZGUgKEE3KS5cblxuZnVuY3Rpb24gc3RyaXBJbkJhbmRTZWNyZXRzKHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIGZvciAoY29uc3QgZWwgb2YgdmFsdWUpIHN0cmlwSW5CYW5kU2VjcmV0cyhlbCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSByZXR1cm47XG4gIGNvbnN0IG9iaiA9IHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIGlmIChvYmoudHlwZSA9PT0gJ2JsYW5rJykge1xuICAgIGZvciAoY29uc3QgZmllbGQgb2YgQkxBTktfU0VDUkVUX0ZJRUxEUykgZGVsZXRlIG9ialtmaWVsZF07XG4gIH1cbiAgaWYgKFxuICAgIHR5cGVvZiBvYmoudHlwZSA9PT0gJ3N0cmluZycgJiZcbiAgICBQUk9NUFRfQ0FSUklFUl9UWVBFUy5oYXMob2JqLnR5cGUpICYmXG4gICAgQXJyYXkuaXNBcnJheShvYmoucHJvbXB0cylcbiAgKSB7XG4gICAgZm9yIChjb25zdCBwcm9tcHQgb2Ygb2JqLnByb21wdHMpIHtcbiAgICAgIGlmIChwcm9tcHQgIT09IG51bGwgJiYgdHlwZW9mIHByb21wdCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yIChjb25zdCBmaWVsZCBvZiBNQVRIX1BST01QVF9TRUNSRVRfRklFTERTKSB7XG4gICAgICAgICAgZGVsZXRlIChwcm9tcHQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW2ZpZWxkXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvYmopKSBzdHJpcEluQmFuZFNlY3JldHMob2JqW2tleV0pO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUGVyLWJsb2NrIHNhbml0aXplXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogTXV0YXRpbmcgY29yZSBcdTIwMTQgb3BlcmF0ZXMgb24gYW4gYWxyZWFkeS1jbG9uZWQgYmxvY2suICovXG5cbi8vIC0tLS0gRGVyaXZlZCBxdWVzdGlvbiBzaGFwZSAodGhlIG9uZSBBRERJVElWRSBzdGVwKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc2FuaXRpemVyJ3Mgam9iIGlzIHJlbW92YWw7IHRoaXMgaXMgdGhlIHNpbmdsZSBleGNlcHRpb24sIGFuZCBpdCBpc1xuLy8gZmVuY2VkIGFjY29yZGluZ2x5LlxuLy9cbi8vIFdoeSBpdCBleGlzdHM6IHRoZSBncmFwaCB3aWRnZXRzIHRha2UgdGhlaXIgaGFuZGxlIGNvdW50IGFuZCBjdXJ2ZSBmYW1pbHlcbi8vIGZyb20gdGhlIGFuc3dlciBrZXkuIFRoZSB2aWV3ZXIgbmV2ZXIgcmVjZWl2ZXMgYSBrZXksIHNvIHdpdGhvdXQgdGhpcyBhXG4vLyBzZXJ2ZWQgZ3JhcGggcXVlc3Rpb24gY2Fubm90IGJlIGxhaWQgb3V0IFx1MjAxNCB0aGVyZSBpcyBubyB3YXkgdG8ga25vdyB3aGV0aGVyXG4vLyB0byBkcmF3IG9uZSBoYW5kbGUgb3IgdGhyZWUuXG4vL1xuLy8gV2h5IGl0IGlzIHNhZmU6IHdoYXQgbGVhdmVzIGhlcmUgaXMgcXVlc3Rpb24gU0hBUEUsIHdoaWNoIHRoZSBzdHVkZW50IGNhblxuLy8gYWxyZWFkeSBzZWUgKGhvdyBtYW55IGhhbmRsZXM7IHdoaWNoIGZhbWlseSdzIGN1cnZlIGZvbGxvd3MgdGhlaXIgZHJhZ3MpLFxuLy8gbmV2ZXIgdGhlIGNvb3JkaW5hdGVzLCB0b2xlcmFuY2VzLCBvciBjb2VmZmljaWVudHMgdGhhdCBtYWtlIGFuIGFuc3dlci4gVGhlXG4vLyBndWFyYW50ZWUgaXMgU1RSVUNUVVJBTCByYXRoZXIgdGhhbiBhIHByb21pc2UgYWJvdXQgdGhpcyBjb2RlOiBldmVyeSB2YWx1ZVxuLy8gcGFzc2VzIGEgd2hpdGVsaXN0IG9uIHRoZSB3YXkgb3V0IFx1MjAxNCBzbWFsbCBwb3NpdGl2ZSBpbnRlZ2Vycywgb3IgYSBmYW1pbHlcbi8vIG5hbWUgZnJvbSBhIGNsb3NlZCBzZXQgXHUyMDE0IHNvIGEgY29vcmRpbmF0ZSBjYW5ub3QgdHJhdmVsIHRoaXMgcGF0aCBldmVuIGlmIGFcbi8vIGZ1dHVyZSBlZGl0IHRyaWVkIHRvIHNlbmQgb25lLiBBbnl0aGluZyBmYWlsaW5nIHRoZSB3aGl0ZWxpc3QgaXMgZHJvcHBlZCxcbi8vIG5vdCBwYXNzZWQgdGhyb3VnaCAoZmFpbCBjbG9zZWQsIGxpa2UgdGhlIHVua25vd24tYmxvY2stdHlwZSB0aHJvdykuXG5cbi8qKiBVcHBlciBib3VuZCBvbiBhIGhhbmRsZSBjb3VudC4gRmFyIGFib3ZlIGFueSByZWFsIHF1ZXN0aW9uOyBleGlzdHMgc28gYVxuICogY29ycnVwdCBvciBob3N0aWxlIGxlbmd0aCBjYW4ndCBiZWNvbWUgYW4gYWJzdXJkIGFsbG9jYXRpb24gZG93bnN0cmVhbS4gKi9cbmNvbnN0IE1BWF9IQU5ETEVTID0gMjQ7XG5cbi8qKiBDdXJ2ZSBmYW1pbGllcyB0aGUgd2lkZ2V0IGxheXMgb3V0LiBDbG9zZWQgc2V0OiBhbiB1bnJlY29nbml6ZWQgZmFtaWx5IGlzXG4gKiBkcm9wcGVkIGFuZCB0aGUgd2lkZ2V0IGZhbGxzIGJhY2sgdG8gaXRzIG93biBkZWZhdWx0LiAqL1xuY29uc3QgS05PV05fRkFNSUxJRVM6IFJlYWRvbmx5U2V0PHN0cmluZz4gPSBuZXcgU2V0KFtcbiAgJ2xpbmVhcicsXG4gICdxdWFkcmF0aWMnLFxuICAnZXhwb25lbnRpYWwnLFxuICAnbG9nYXJpdGhtaWMnLFxuICAndmVydGljYWwnLFxuICAnYWJzb2x1dGUnLFxuICAnc3FydCcsXG4gICdjdWJpYycsXG5dKTtcblxuZXhwb3J0IGludGVyZmFjZSBRdWVzdGlvblNoYXBlIHtcbiAgaGFuZGxlQ291bnQ/OiBudW1iZXI7XG4gIGZhbWlseT86IHN0cmluZztcbiAgdmVydGV4Q291bnQ/OiBudW1iZXI7XG59XG5cbi8qKiBBIGNvdW50IHN1cnZpdmVzIG9ubHkgYXMgYSBzbWFsbCBwb3NpdGl2ZSBpbnRlZ2VyLiAqL1xuZnVuY3Rpb24gc2FmZUNvdW50KHZhbHVlOiB1bmtub3duKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiZcbiAgICBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSAmJlxuICAgIHZhbHVlID4gMCAmJlxuICAgIHZhbHVlIDw9IE1BWF9IQU5ETEVTXG4gICAgPyB2YWx1ZVxuICAgIDogdW5kZWZpbmVkO1xufVxuXG4vKiogQSBmYW1pbHkgc3Vydml2ZXMgb25seSBpZiBpdCBpcyBhIGtub3duIG5hbWUuICovXG5mdW5jdGlvbiBzYWZlRmFtaWx5KHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgS05PV05fRkFNSUxJRVMuaGFzKHZhbHVlKVxuICAgID8gdmFsdWVcbiAgICA6IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBEZXJpdmUgdGhlIHNlcnZlZCBxdWVzdGlvbiBzaGFwZSBmcm9tIGFuIFVOU0FOSVRJWkVEIGJsb2NrIChpdCByZWFkcyB0aGVcbiAqIGFuc3dlciBrZXksIHNvIGl0IG11c3QgcnVuIGJlZm9yZSB0aGUgc3RyaXBzKS4gUmV0dXJucyB1bmRlZmluZWQgd2hlbiB0aGVyZVxuICogaXMgbm90aGluZyB0byBzYXkgXHUyMDE0IGEgZGlzcGxheS1tb2RlIGdyYXBoIHRha2VzIG5vIGlucHV0IGFuZCBnZXRzIG5vIHNoYXBlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVyaXZlUXVlc3Rpb25TaGFwZShcbiAgYmxvY2s6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuKTogUXVlc3Rpb25TaGFwZSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGludGVyYWN0aW9uID0gYmxvY2suaW50ZXJhY3Rpb24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XG4gIGNvbnN0IGtpbmQgPSB0eXBlb2YgaW50ZXJhY3Rpb24/LnR5cGUgPT09ICdzdHJpbmcnID8gaW50ZXJhY3Rpb24udHlwZSA6IG51bGw7XG4gIGlmICgha2luZCB8fCBraW5kID09PSAnZGlzcGxheScpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgY29uc3Qgc2hhcGU6IFF1ZXN0aW9uU2hhcGUgPSB7fTtcblxuICAvLyBQb2ludC1zdHlsZSBpbnRlcmFjdGlvbnM6IG9uZSBoYW5kbGUgcGVyIGF1dGhvcmVkIHRhcmdldC4gVGhpcyBtaXJyb3JzXG4gIC8vIGV4YWN0bHkgd2hhdCB0aGUgZ3JhZGVkIHdpZGdldCBhbHJlYWR5IGRvZXMgd2l0aCB0aGUga2V5XG4gIC8vIChjb3VudCA9IGNvcnJlY3RQb2ludHMubGVuZ3RoKSwgc28gYSBzdHVkZW50IHNlZXMgdGhlIHNhbWUgd2lkZ2V0IGVpdGhlclxuICAvLyB3YXkgXHUyMDE0IHRoZSBudW1iZXIgb2YgaGFuZGxlcyBpcyBub3QgdGhlIHNlY3JldCwgdGhlaXIgcG9zaXRpb25zIGFyZS5cbiAgY29uc3QgcG9pbnRzID0gaW50ZXJhY3Rpb24/LmNvcnJlY3RQb2ludHM7XG4gIGlmIChBcnJheS5pc0FycmF5KHBvaW50cykpIHtcbiAgICBjb25zdCBjb3VudCA9IHNhZmVDb3VudChwb2ludHMubGVuZ3RoKTtcbiAgICBpZiAoY291bnQgIT09IHVuZGVmaW5lZCkgc2hhcGUuaGFuZGxlQ291bnQgPSBjb3VudDtcbiAgfVxuXG4gIC8vIEN1cnZlIGZhbWlsaWVzOiB0aGUgc2hhcGUgb2YgdGhlIGN1cnZlIHRoYXQgZm9sbG93cyB0aGUgc3R1ZGVudCdzIGRyYWdzLlxuICBjb25zdCBtb2RlbHMgPSBpbnRlcmFjdGlvbj8ubW9kZWxzO1xuICBpZiAoQXJyYXkuaXNBcnJheShtb2RlbHMpICYmIG1vZGVscy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZmFtaWx5ID0gc2FmZUZhbWlseShcbiAgICAgIChtb2RlbHNbMF0gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsKT8uZmFtaWx5LFxuICAgICk7XG4gICAgaWYgKGZhbWlseSAhPT0gdW5kZWZpbmVkKSBzaGFwZS5mYW1pbHkgPSBmYW1pbHk7XG4gIH1cblxuICAvLyBBbiBpbmVxdWFsaXR5J3MgYm91bmRhcnkgcmlkZXMgdGhlIHNhbWUgZmFtaWx5IG1hY2hpbmVyeS5cbiAgY29uc3QgaW5lcXVhbGl0aWVzID0gaW50ZXJhY3Rpb24/LmluZXF1YWxpdGllcztcbiAgaWYgKEFycmF5LmlzQXJyYXkoaW5lcXVhbGl0aWVzKSAmJiBpbmVxdWFsaXRpZXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGJvdW5kYXJ5ID0gKGluZXF1YWxpdGllc1swXSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGwpXG4gICAgICA/LmJvdW5kYXJ5IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGZhbWlseSA9IHNhZmVGYW1pbHkoYm91bmRhcnk/LmZhbWlseSk7XG4gICAgaWYgKGZhbWlseSAhPT0gdW5kZWZpbmVkKSBzaGFwZS5mYW1pbHkgPSBmYW1pbHk7XG4gIH1cblxuICAvLyBQb2x5Z29uIHZlcnRleCBjb3VudCBmb3Igc2hhZGVfcmVnaW9uLlxuICBjb25zdCByZWdpb25zID0gaW50ZXJhY3Rpb24/LnJlZ2lvbnM7XG4gIGlmIChBcnJheS5pc0FycmF5KHJlZ2lvbnMpICYmIHJlZ2lvbnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IHZlcnRpY2VzID0gKHJlZ2lvbnNbMF0gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsKVxuICAgICAgPy5jb3JyZWN0VmVydGljZXM7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmVydGljZXMpKSB7XG4gICAgICBjb25zdCBjb3VudCA9IHNhZmVDb3VudCh2ZXJ0aWNlcy5sZW5ndGgpO1xuICAgICAgaWYgKGNvdW50ICE9PSB1bmRlZmluZWQpIHNoYXBlLnZlcnRleENvdW50ID0gY291bnQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5rZXlzKHNoYXBlKS5sZW5ndGggPiAwID8gc2hhcGUgOiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplQmxvY2tNdXQoYmxvY2s6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZCB7XG4gIGNvbnN0IHR5cGUgPSBibG9jay50eXBlO1xuICBjb25zdCBlbnRyeSA9XG4gICAgdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnICYmIHR5cGUgaW4gYmxvY2tSZWdpc3RyeVxuICAgICAgPyBibG9ja1JlZ2lzdHJ5W3R5cGUgYXMga2V5b2YgdHlwZW9mIGJsb2NrUmVnaXN0cnldXG4gICAgICA6IHVuZGVmaW5lZDtcbiAgaWYgKCFlbnRyeSkge1xuICAgIC8vIEEgdmFsaWRhdGVkIEFjdGl2aXR5RG9jdW1lbnQgY2FuJ3QgZ2V0IGhlcmUgKHRoZSByZWdpc3RyeSBjb3ZlcmFnZSBndWFyZFxuICAgIC8vIHByb3ZlcyBleGFjdCBhZ3JlZW1lbnQgd2l0aCB0aGUgQmxvY2sgdW5pb24pIFx1MjAxNCBidXQgdGhlIHNhbml0aXplciBzaXRzIG9uXG4gICAgLy8gdGhlIHdpcmUgYm91bmRhcnksIHNvIGFuIHVua25vd24gdHlwZSBmYWlscyBDTE9TRUQsIG5ldmVyIHBhc3NlcyB0aHJvdWdoLlxuICAgIHRocm93IG5ldyBFcnJvcihgc2FuaXRpemU6IHVua25vd24gYmxvY2sgdHlwZSAke1N0cmluZyh0eXBlKX1gKTtcbiAgfVxuXG4gIC8vIERlcml2ZWQgc2hhcGUgaXMgY29tcHV0ZWQgQkVGT1JFIHRoZSBzdHJpcHMgKGl0IHJlYWRzIHRoZSBhbnN3ZXIga2V5KSBhbmRcbiAgLy8gYXR0YWNoZWQgYWZ0ZXIsIHNvIHRoZSBzZXJ2ZWQgYmxvY2sgY2FycmllcyBvbmx5IHRoZSB3aGl0ZWxpc3RlZCByZXN1bHQuXG4gIGNvbnN0IHNoYXBlID0gZW50cnkuc2FuaXRpemUuZGVyaXZlUXVlc3Rpb25TaGFwZVxuICAgID8gZGVyaXZlUXVlc3Rpb25TaGFwZShibG9jaylcbiAgICA6IHVuZGVmaW5lZDtcblxuICBmb3IgKGNvbnN0IHBhdGggb2YgZW50cnkuc2FuaXRpemUuc3RyaXApIGFwcGx5U3RyaXBQYXRoKGJsb2NrLCBwYXRoKTtcblxuICBpZiAoc2hhcGUpIGJsb2NrLnF1ZXN0aW9uU2hhcGUgPSBzaGFwZTtcblxuICBmb3IgKGNvbnN0IGZpZWxkIG9mIGVudHJ5LnNhbml0aXplLmNoaWxkQmxvY2tzID8/IFtdKSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBibG9ja1tmaWVsZF07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChjaGlsZCAhPT0gbnVsbCAmJiB0eXBlb2YgY2hpbGQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgc2FuaXRpemVCbG9ja011dChjaGlsZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdHJpcEluQmFuZFNlY3JldHMoYmxvY2spO1xufVxuXG4vKipcbiAqIFNhbml0aXplIGEgbG9vc2UgSU5MSU5FLUNPTlRFTlQgYXJyYXkgcHVsbGVkIG91dCBvZiB0aGUgcmF3IGRvY3VtZW50IChwdXJlKS5cbiAqXG4gKiBTNCdzIGdyYWRpbmcgUlBDIGlzIGEgc2Vjb25kIHNlcnZlclx1MjE5MmNsaWVudCBjaGFubmVsOiBpdCByZXR1cm5zIGF1dGhvcmVkXG4gKiBgZmVlZGJhY2tgIGFuZCBgc29sdXRpb25gIGNvbnRlbnQgdGhhdCB0aGUgcmVhZCBBUEkgZGVsaWJlcmF0ZWx5IHN0cmlwcGVkIGFuZFxuICogdGhlIHNlcnZlciByZWxlYXNlcyBvbmx5IGFmdGVyIGEgY2hlY2suIFRob3NlIGFyZSBgSW5saW5lTm9kZVtdYCwgYW5kIGFuXG4gKiBpbmxpbmUgYXJyYXkgY2FuIGNhcnJ5IGluLWJhbmQgc2VjcmV0cyBcdTIwMTQgYSBwcm9tcHRlZCBgbWF0aF9pbmxpbmVgIHNpdHRpbmdcbiAqIGluc2lkZSBhIHNvbHV0aW9uIHBhcmFncmFwaCwgb3IgYSBwYXN0ZWQgYmxhbmsgdG9rZW4gXHUyMDE0IHNvIGl0IG11c3QgZ28gdGhyb3VnaFxuICogdGhlIFNBTUUgdW5jb25kaXRpb25hbCBkZWVwIHdhbGsgdGhlIHNlcnZlZCBkb2N1bWVudCBkb2VzLiBXaXRob3V0IHRoaXMsIGFuXG4gKiBhdXRob3JlZCBzb2x1dGlvbiBjb250YWluaW5nIGEgYmxhbmsgd291bGQgaGFuZCBldmVyeSBjaGVja2luZyBzdHVkZW50IHRoYXRcbiAqIGJsYW5rJ3MgYW5zd2Vycywgc2lsZW50bHkuXG4gKlxuICogUmV1c2luZyBgc3RyaXBJbkJhbmRTZWNyZXRzYCByYXRoZXIgdGhhbiByZWltcGxlbWVudGluZyBpdCBpcyB0aGUgcG9pbnQ6IHRoZVxuICogc2VjcmV0LWZpZWxkIGxpc3RzIGxpdmUgaW4gdGhlIHJlZ2lzdHJ5LCBhbmQgYSBmdXR1cmUgYWRkaXRpb24gdG8gdGhlbSBoYXMgdG9cbiAqIHByb3RlY3QgYm90aCBjaGFubmVscyBhdXRvbWF0aWNhbGx5IG9yIGl0IHByb3RlY3RzIG5laXRoZXIuXG4gKlxuICogUmV0dXJucyBhIGNsb25lOyB0aGUgY2FsbGVyJ3MgYXJyYXkgaXMgbmV2ZXIgbXV0YXRlZCAoaXQgYmVsb25ncyB0byB0aGVcbiAqIGNhY2hlZCByYXcgZG9jdW1lbnQpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVJbmxpbmVDb250ZW50PFQ+KG5vZGVzOiBUW10pOiBUW10ge1xuICBjb25zdCBjbG9uZSA9IHN0cnVjdHVyZWRDbG9uZShub2Rlcyk7XG4gIHN0cmlwSW5CYW5kU2VjcmV0cyhjbG9uZSk7XG4gIHJldHVybiBjbG9uZTtcbn1cblxuLyoqIFNhbml0aXplIE9ORSBibG9jayAocHVyZSkuIEV4cG9zZWQgZm9yIHRlc3RzIGFuZCBwZXItYmxvY2sgdG9vbGluZzsgdGhlXG4gKiBkb2N1bWVudC1sZXZlbCBlbnRyeSBwb2ludCBiZWxvdyBpcyB3aGF0IHRoZSByZWFkIEFQSSB1c2VzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplQmxvY2soYmxvY2s6IEJsb2NrKTogU2FuaXRpemVkQmxvY2sge1xuICBjb25zdCBjbG9uZSA9IHN0cnVjdHVyZWRDbG9uZShibG9jaykgYXMgdW5rbm93biBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgc2FuaXRpemVCbG9ja011dChjbG9uZSk7XG4gIHJldHVybiBjbG9uZSBhcyB1bmtub3duIGFzIFNhbml0aXplZEJsb2NrO1xufVxuXG4vKipcbiAqIFNhbml0aXplIGEgZnVsbCB1cGdyYWRlZCBkb2N1bWVudCAocHVyZSkuIEV2ZXJ5IGJvZHkgYmxvY2sgZ29lcyB0aHJvdWdoIGl0c1xuICogcmVnaXN0cnkgZW50cnk7IHRoZSBpbi1iYW5kIGRlZXAgd2FsayB0aGVuIGNvdmVycyB0aGUgcmVzdCBvZiB0aGUgZG9jdW1lbnRcbiAqIChyZWZlcmVuY2UgcGFuZWwsIG1ldGEpIGFzIGRlZmVuc2UgaW4gZGVwdGggXHUyMDE0IHRob3NlIHN1cmZhY2VzIGNhcnJ5IG5vXG4gKiBkZWNsYXJlZCBhbnN3ZXIga2V5cywgYnV0IGEgcHJvbXB0ZWQgbWF0aCBub2RlIG11c3Qgbm90IGxlYWsgZnJvbSBhbnl3aGVyZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplQWN0aXZpdHlEb2N1bWVudChcbiAgZG9jOiBBY3Rpdml0eURvY3VtZW50LFxuKTogU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCB7XG4gIGNvbnN0IGNsb25lID0gc3RydWN0dXJlZENsb25lKGRvYykgYXMgdW5rbm93biBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiAmIHtcbiAgICBzZWN0aW9uczogQXJyYXk8e1xuICAgICAgcm93czogQXJyYXk8eyBjb2x1bW5zOiBBcnJheTx7IGJsb2NrczogdW5rbm93bltdIH0+IH0+O1xuICAgIH0+O1xuICB9O1xuICBmb3IgKGNvbnN0IHNlY3Rpb24gb2YgY2xvbmUuc2VjdGlvbnMpIHtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiBzZWN0aW9uLnJvd3MpIHtcbiAgICAgIGZvciAoY29uc3QgY29sdW1uIG9mIHJvdy5jb2x1bW5zKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgY29sdW1uLmJsb2Nrcykge1xuICAgICAgICAgIGlmIChibG9jayAhPT0gbnVsbCAmJiB0eXBlb2YgYmxvY2sgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBzYW5pdGl6ZUJsb2NrTXV0KGJsb2NrIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gRXZlcnl0aGluZyBvdXRzaWRlIHRoZSBib2R5IGJsb2NrcyAobWV0YSwgcmVmZXJlbmNlUGFuZWwpIFx1MjAxNCBpbi1iYW5kXG4gIC8vIHNlY3JldHMgb25seTsgdGhlcmUgYXJlIG5vIGRlY2xhcmVkIHN0cmlwcyBvdXRzaWRlIGJsb2Nrcy5cbiAgc3RyaXBJbkJhbmRTZWNyZXRzKGNsb25lKTtcbiAgcmV0dXJuIGNsb25lIGFzIHVua25vd24gYXMgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudDtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2FuaXRpemUvc2h1ZmZsZS50cyBcdTIwMTQgc2VydmUtdGltZSBkZXRlcm1pbmlzdGljIHNodWZmbGVzIChTMiwgU2FuaXRpemVTcGVjKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoZSByZWdpc3RyeSdzIGBzZXJ2ZVNodWZmbGVkYCBtYXJrcyBhcnJheXMgd2hvc2UgQVVUSE9SRUQgT1JERVIgaXMgdGhlXG4vLyBhbnN3ZXIga2V5IChvcmRlcmluZy5pdGVtcykgXHUyMDE0IGEgc3RyaXAgY2FuJ3QgaGVscCB3aGVuIHRoZSBvcmRlciBpdHNlbGYgaXNcbi8vIHRoZSBzZWNyZXQsIHNvIHRoZSBzZXJ2ZXIgc2VydmVzIGEgcGVybXV0YXRpb24uIFJlcXVpcmVtZW50cyBmcm9tIHRoZSBzcGVjOlxuLy9cbi8vICAgLSBEZXRlcm1pbmlzdGljIHBlciAodmVyc2lvbiwgc3R1ZGVudCk6IHRoZSByZWFkIEFQSSBzZWVkcyB3aXRoXG4vLyAgICAgYCR7dmVyc2lvbl9pZH06JHt1c2VyX2lkfWAsIHNvIGEgcmVsb2FkIChvciBhbiBIVFRQLWNhY2hlIG1pc3MpIHNlcnZlc1xuLy8gICAgIHRoZSBTQU1FIG9yZGVyIFx1MjAxNCB0aGUgc3R1ZGVudCdzIHNjcmVlbiBuZXZlciByZXNodWZmbGVzIHVuZGVyIHRoZW0uXG4vLyAgIC0gQXBwbGllZCBhdCBTRVJWRSB0aW1lLCBhZnRlciB0aGUgcGVyLXZlcnNpb24gY2FjaGU6IHRoZSBjYWNoZWQgYXJ0aWZhY3Rcbi8vICAgICBpcyBzdHVkZW50LWluZGVwZW5kZW50ICh0aGF0J3Mgd2hhdCBtYWtlcyBpdCBjYWNoZWFibGUpOyB0aGlzIHRyYW5zZm9ybVxuLy8gICAgIGlzIGNoZWFwIGVub3VnaCB0byBydW4gcGVyIHJlcXVlc3QuXG4vLyAgIC0gUGVyLWJsb2NrIHN1Yi1zZWVkaW5nOiB0d28gb3JkZXJpbmcgYmxvY2tzIGluIG9uZSBhY3Rpdml0eSBnZXRcbi8vICAgICBpbmRlcGVuZGVudCBwZXJtdXRhdGlvbnMgKGJsb2NrIGlkICsgZmllbGQgam9pbiB0aGUgc2VlZCkuXG4vL1xuLy8gR3JhZGluZyBpcyBvcmRlci1pbmRlcGVuZGVudCAocmVzcG9uc2VzIHJlZmVyZW5jZSBpdGVtIGlkcywgYW5kIHRoZSBzZXJ2ZXJcbi8vIGdyYWRlcyBhZ2FpbnN0IHRoZSBhdXRob3JlZCBrZXkpLCBzbyB0aGUgcGVybXV0YXRpb24gaXMgcHJlc2VudGF0aW9uLW9ubHkgXHUyMDE0XG4vLyBidXQgaXRzIHN0YWJpbGl0eSBpcyBhIFVYIGNvbnRyYWN0LCBub3QgYSBuaWNldHkuXG4vL1xuLy8gVGhlIFBSTkcgaXMgYSBzZWVkZWQgeG9yc2hpZnQtc3R5bGUgZ2VuZXJhdG9yIChtdWxiZXJyeTMyKSBvdmVyIGFuIEZOVi0xYVxuLy8gc2VlZCBcdTIwMTQgZGV0ZXJtaW5pc3RpYyBhY3Jvc3MgSlMgcnVudGltZXMsIGRlcGVuZGVuY3ktZnJlZS4gTm90IGNyeXB0b2dyYXBoaWMsXG4vLyBkZWxpYmVyYXRlbHk6IHRoZSB0aHJlYXQgbW9kZWwgaXMgXCJkb24ndCBzZXJ2ZSB0aGUgYXV0aG9yZWQgb3JkZXIsXCIgbm90XG4vLyBcIm1ha2UgdGhlIHBlcm11dGF0aW9uIHVucHJlZGljdGFibGUgdG8gYSBkZXRlcm1pbmVkIHN0dWRlbnQgd2l0aCBhIGRlYnVnZ2VyXCJcbi8vICh0aGUgYW5zd2VyIGtleSBuZXZlciBsZWF2ZXMgdGhlIHNlcnZlciBlaXRoZXIgd2F5KS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IGJsb2NrUmVnaXN0cnkgfSBmcm9tICcuLi9yZWdpc3RyeS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgdHlwZSB7IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQgfSBmcm9tICcuL3Nhbml0aXplZC10eXBlcy5qcyc7XG5cbi8qKiBGTlYtMWEgMzItYml0IG92ZXIgYSBzdHJpbmcgXHUyMTkyIHVpbnQzMiBzZWVkLiAqL1xuZnVuY3Rpb24gc2VlZEZyb20odGV4dDogc3RyaW5nKTogbnVtYmVyIHtcbiAgbGV0IGhhc2ggPSAweDgxMWM5ZGM1O1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRleHQubGVuZ3RoOyBpKyspIHtcbiAgICBoYXNoIF49IHRleHQuY2hhckNvZGVBdChpKTtcbiAgICBoYXNoID0gTWF0aC5pbXVsKGhhc2gsIDB4MDEwMDAxOTMpO1xuICB9XG4gIHJldHVybiBoYXNoID4+PiAwO1xufVxuXG4vKiogbXVsYmVycnkzMiBcdTIwMTQgdGlueSBkZXRlcm1pbmlzdGljIFBSTkcsIHVuaWZvcm0gZW5vdWdoIGZvciBhIHNodWZmbGUuICovXG5mdW5jdGlvbiBtdWxiZXJyeTMyKHNlZWQ6IG51bWJlcik6ICgpID0+IG51bWJlciB7XG4gIGxldCBhID0gc2VlZCA+Pj4gMDtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBhID0gKGEgKyAweDZkMmI3OWY1KSA+Pj4gMDtcbiAgICBsZXQgdCA9IGE7XG4gICAgdCA9IE1hdGguaW11bCh0IF4gKHQgPj4+IDE1KSwgdCB8IDEpO1xuICAgIHQgXj0gdCArIE1hdGguaW11bCh0IF4gKHQgPj4+IDcpLCB0IHwgNjEpO1xuICAgIHJldHVybiAoKHQgXiAodCA+Pj4gMTQpKSA+Pj4gMCkgLyA0Mjk0OTY3Mjk2O1xuICB9O1xufVxuXG4vKipcbiAqIEZpc2hlclx1MjAxM1lhdGVzIHdpdGggYSBzZWVkZWQgUFJORyAocHVyZSBcdTIwMTQgcmV0dXJucyBhIG5ldyBhcnJheSkuXG4gKlxuICogTkVWRVIgUkVUVVJOUyBUSEUgSURFTlRJVFkgZm9yIDIrIGl0ZW1zOyBpdCByb3RhdGVzIGJ5IG9uZSBpZiB0aGUgZGVhbCBsYW5kc1xuICogdGhlcmUuIFRoaXMgaXMgbm90IHRpZGluZXNzIFx1MjAxNCBpdCBpcyB0aGUgd2hvbGUgcG9pbnQgb2Ygc2h1ZmZsaW5nIHRoZXNlXG4gKiBmaWVsZHMuIFRoZSBhcnJheXMgdGhhdCByZWFjaCBoZXJlIGFyZSB0aGUgb25lcyB3aG9zZSBBVVRIT1JFRCBPUkRFUiBJUyBUSEVcbiAqIEFOU1dFUiwgc28gYW4gaWRlbnRpdHkgZGVhbCBzZXJ2ZXMgdGhlIHN0dWRlbnQgYSBwcmUtc29sdmVkIHF1ZXN0aW9uLiBBIGZhaXJcbiAqIHNodWZmbGUgbGFuZHMgb24gaXQgMS9uISBvZiB0aGUgdGltZSwgd2hpY2ggc291bmRzIG5lZ2xpZ2libGUgdW50aWwgeW91XG4gKiBub3RpY2UgdGhhdCBvcmRlcmluZyBibG9ja3MgYXJlIGFsbG93ZWQgYXMgZmV3IGFzIHR3byBpdGVtcyBcdTIwMTQgb25lIGNsYXNzIGluXG4gKiB0d28sIGZvciB0aGF0IHF1ZXN0aW9uLiBUaGUgcmVuZGVyZXIgaGFzIGFsd2F5cyBndWFyYW50ZWVkIHRoaXNcbiAqIChyZW5kZXJlci9zcmMvYmxvY2tzL3NodWZmbGUudHMpIGFuZCB0aGUgdmlld2VyIG11c3Qgbm90IHJlZ3Jlc3MgaXQgYXRcbiAqIGN1dG92ZXIuXG4gKlxuICogUzQncyBncmFkaW5nIGtlZXBzIGl0cyBvd24gZGVmZW5zaXZlIGd1YXJkIGZvciB0aGUgc2VydmVkLW9yZGVyLWVxdWFscy1cbiAqIGF1dGhvcmVkLW9yZGVyIGNhc2UgKGdyYWRpbmcvY2hvaWNlcy50cykgYW5kIHNob3VsZCBrZWVwIGl0OiBpdCBhbHNvIGNvdmVyc1xuICogZG9jdW1lbnRzIHNlcnZlZCB1bnNodWZmbGVkLCB3aGljaCB0aGlzIGNhbm5vdCBzcGVhayBmb3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWVkZWRTaHVmZmxlPFQ+KGl0ZW1zOiByZWFkb25seSBUW10sIHNlZWRLZXk6IHN0cmluZyk6IFRbXSB7XG4gIGNvbnN0IG91dCA9IFsuLi5pdGVtc107XG4gIGNvbnN0IG5leHQgPSBtdWxiZXJyeTMyKHNlZWRGcm9tKHNlZWRLZXkpKTtcbiAgZm9yIChsZXQgaSA9IG91dC5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgY29uc3QgaiA9IE1hdGguZmxvb3IobmV4dCgpICogKGkgKyAxKSk7XG4gICAgY29uc3QgYSA9IG91dFtpXSE7XG4gICAgb3V0W2ldID0gb3V0W2pdITtcbiAgICBvdXRbal0gPSBhO1xuICB9XG4gIGlmIChvdXQubGVuZ3RoID4gMSAmJiBvdXQuZXZlcnkoKHZhbHVlLCBpKSA9PiB2YWx1ZSA9PT0gaXRlbXNbaV0pKSB7XG4gICAgb3V0LnB1c2gob3V0LnNoaWZ0KCkgYXMgVCk7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBcHBseSBldmVyeSByZWdpc3RyeS1kZWNsYXJlZCBgc2VydmVTaHVmZmxlZGAgcmVvcmRlciB0byBhIFNBTklUSVpFRFxuICogZG9jdW1lbnQgKHB1cmUgXHUyMDE0IHRoZSBpbnB1dCwgdHlwaWNhbGx5IHRoZSBzaGFyZWQgY2FjaGVkIGFydGlmYWN0LCBpcyBub3RcbiAqIG11dGF0ZWQpLiBgc2VlZEtleWAgaXMgdGhlIHBlci0odmVyc2lvbiwgc3R1ZGVudCkgaWRlbnRpdHk7IGVhY2ggc2h1ZmZsZWRcbiAqIGFycmF5IGlzIHN1Yi1zZWVkZWQgd2l0aCB0aGUgYmxvY2sgaWQgYW5kIGZpZWxkIG5hbWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVNlcnZlU2h1ZmZsZXMoXG4gIGRvYzogU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCxcbiAgc2VlZEtleTogc3RyaW5nLFxuKTogU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCB7XG4gIGNvbnN0IGNsb25lID0gc3RydWN0dXJlZENsb25lKGRvYykgYXMgdW5rbm93biBhcyB7XG4gICAgc2VjdGlvbnM6IEFycmF5PHtcbiAgICAgIHJvd3M6IEFycmF5PHsgY29sdW1uczogQXJyYXk8eyBibG9ja3M6IHVua25vd25bXSB9PiB9PjtcbiAgICB9PjtcbiAgfTtcblxuICBjb25zdCBzaHVmZmxlQmxvY2sgPSAoYmxvY2s6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZCA9PiB7XG4gICAgY29uc3QgdHlwZSA9IGJsb2NrLnR5cGU7XG4gICAgY29uc3QgZW50cnkgPVxuICAgICAgdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnICYmIHR5cGUgaW4gYmxvY2tSZWdpc3RyeVxuICAgICAgICA/IGJsb2NrUmVnaXN0cnlbdHlwZSBhcyBrZXlvZiB0eXBlb2YgYmxvY2tSZWdpc3RyeV1cbiAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgaWYgKCFlbnRyeSkgcmV0dXJuOyAvLyBzYW5pdGl6ZSBhbHJlYWR5IGZhaWxlZCBjbG9zZWQgb24gdW5rbm93biB0eXBlc1xuICAgIGZvciAoY29uc3QgZmllbGQgb2YgZW50cnkuc2FuaXRpemUuc2VydmVTaHVmZmxlZCA/PyBbXSkge1xuICAgICAgY29uc3QgYXJyID0gYmxvY2tbZmllbGRdO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgICBibG9ja1tmaWVsZF0gPSBzZWVkZWRTaHVmZmxlKFxuICAgICAgICAgIGFycixcbiAgICAgICAgICBgJHtzZWVkS2V5fToke1N0cmluZyhibG9jay5pZCA/PyAnJyl9OiR7ZmllbGR9YCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVjdXJzZSB3aGVyZSB0aGUgcmVnaXN0cnkgZGVjbGFyZXMgbmVzdGVkIGJsb2NrcywgbWlycm9yaW5nIHNhbml0aXplLlxuICAgIGZvciAoY29uc3QgZmllbGQgb2YgZW50cnkuc2FuaXRpemUuY2hpbGRCbG9ja3MgPz8gW10pIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gYmxvY2tbZmllbGRdO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgICBpZiAoY2hpbGQgIT09IG51bGwgJiYgdHlwZW9mIGNoaWxkID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgc2h1ZmZsZUJsb2NrKGNoaWxkIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZm9yIChjb25zdCBzZWN0aW9uIG9mIGNsb25lLnNlY3Rpb25zKSB7XG4gICAgZm9yIChjb25zdCByb3cgb2Ygc2VjdGlvbi5yb3dzKSB7XG4gICAgICBmb3IgKGNvbnN0IGNvbHVtbiBvZiByb3cuY29sdW1ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGJsb2NrIG9mIGNvbHVtbi5ibG9ja3MpIHtcbiAgICAgICAgICBpZiAoYmxvY2sgIT09IG51bGwgJiYgdHlwZW9mIGJsb2NrID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgc2h1ZmZsZUJsb2NrKGJsb2NrIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNsb25lIGFzIHVua25vd24gYXMgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudDtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gY29udGFpbmVyL2Jsb2NrSW5kZXgudHMgXHUyMDE0IHNlcnZlZCBkb2N1bWVudCBcdTIxOTIgcGVyLXNlY3Rpb24gcmVzcG9uc2UgaWRzIChTMyBWNClcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc3RvcmUgaXMgZGVsaWJlcmF0ZWx5IGRvY3VtZW50LXNoYXBlLWFnbm9zdGljIChzdG9yZS50cyk6IGl0IGhvbGRzXG4vLyBpZC1rZXllZCByZXNwb25zZSBtYXBzIGFuZCBpcyBUT0xEIHdoaWNoIGlkcyBiZWxvbmcgdG8gYSBzZWN0aW9uIGF0IGNoZWNrXG4vLyB0aW1lLiBUaGlzIG1vZHVsZSBpcyB3aGF0IHRlbGxzIGl0IFx1MjAxNCBvbmUgd2FsayBvdmVyIHRoZSBTRVJWRUQgKHNhbml0aXplZClcbi8vIGRvY3VtZW50IHByb2R1Y2luZywgcGVyIHNlY3Rpb24sIHRoZSBpdGVtIGlkcyBpbiBlYWNoIHdpcmUgY2F0ZWdvcnkuXG4vL1xuLy8gVHdvIGRlc2lnbiBwb2ludHMgd29ydGgga2VlcGluZzpcbi8vXG4vLyAgMS4gSU4tQkFORCBJRFMgQ09NRSBGUk9NIEEgREVFUCBXQUxLLCBub3QgYSBwZXItdHlwZSBmaWVsZCBsaXN0LiBBIGJsYW5rXG4vLyAgICAgdG9rZW4gbGl2ZXMgaW4gZmlsbF9pbl9ibGFuay5jb250ZW50LCBidXQgYWxzbyBpbnNpZGUgYVxuLy8gICAgIGZhZGVkX3dvcmtlZF9leGFtcGxlJ3MgbmVzdGVkIHN0ZXBzOyBhIHByb21wdGVkIG1hdGhfaW5saW5lIG1heSBhcHBlYXIgaW5cbi8vICAgICBBTlkgY29udGVudCBhcnJheSAodGhlIHNjaGVtYSBhZG1pdHMgaXQsIHdoaWNoIGlzIGV4YWN0bHkgd2h5IHRoZSBTMlxuLy8gICAgIHNhbml0aXplciBzdHJpcHMgaW4tYmFuZCBzZWNyZXRzIHVuY29uZGl0aW9uYWxseSByYXRoZXIgdGhhbiBieVxuLy8gICAgIGRlY2xhcmF0aW9uKS4gTWlycm9yaW5nIHRoYXQgcG9zdHVyZSBoZXJlIG1lYW5zIGEgbmV3IGJsb2NrIHR5cGUgdGhhdFxuLy8gICAgIGVtYmVkcyBibGFua3MgaXMgd2lyZWQgaW50byBjaGVja2luZyB0aGUgZGF5IGl0IHJlbmRlcnMsIHdpdGggbm8gcmVnaXN0cnlcbi8vICAgICBlZGl0IFx1MjAxNCB0aGUgZmFpbHVyZSBtb2RlIHRoaXMgYXZvaWRzIGlzIGEgc3R1ZGVudCdzIGFuc3dlciBzaWxlbnRseSBuZXZlclxuLy8gICAgIHJlYWNoaW5nIHRoZSBncmFkZXIuXG4vL1xuLy8gIDIuIFVOU1VQUE9SVEVEIElTIFJFQ09SREVELCBORVZFUiBEUk9QUEVELiBXaXJlIHYyIChWOSkgZ2F2ZSB0aGUgZ3JhcGhcbi8vICAgICBmYW1pbHkgaXRzIGBncmFwaHNgIGNhdGVnb3J5LCBzbyBgdW5zdXBwb3J0ZWRgIGlzIGVtcHR5IHRvZGF5IFx1MjAxNCBidXQgdGhlXG4vLyAgICAgbWVjaGFuaXNtIHN0YXlzLiBJdCBpcyB0aGUgaG9uZXN0IGFuc3dlciB3aGVuZXZlciBhIGdyYWRhYmxlIGJsb2NrIGhhc1xuLy8gICAgIG5vIHdheSB0byByZWFjaCB0aGUgZ3JhZGVyIChhIGZ1dHVyZSBibG9jayB0eXBlIGFoZWFkIG9mIGl0cyB3aXJlXG4vLyAgICAgYnVtcCkuIEEgc2lsZW50IG9taXNzaW9uIHdvdWxkIHJlYWQgYXMgXCJhbGwgY2hlY2tlZFwiIHdoaWxlIGEgc3R1ZGVudCdzXG4vLyAgICAgd29yayB3ZW50IHVuZ3JhZGVkLCB3aGljaCBpcyB0aGUgZmFpbHVyZSB0aGlzIGV4aXN0cyB0byBwcmV2ZW50LlxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuaW1wb3J0IHsgZmFtaWx5T2YgfSBmcm9tICcuLi9yZWdpc3RyeS9yZWdpc3RyeS5qcyc7XG5pbXBvcnQgdHlwZSB7IEJsb2NrVHlwZSB9IGZyb20gJy4uL3JlZ2lzdHJ5L3R5cGVzLmpzJztcbmltcG9ydCB0eXBlIHtcbiAgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCxcbiAgU2FuaXRpemVkQmxvY2ssXG59IGZyb20gJy4uL3Nhbml0aXplL3Nhbml0aXplZC10eXBlcy5qcyc7XG5pbXBvcnQgdHlwZSB7IFNlY3Rpb25JdGVtSWRzIH0gZnJvbSAnLi4vc3RvcmUvc3RvcmUuanMnO1xuXG4vKiogQmxvY2sgdHlwZXMgd2hvc2UgcmVzcG9uc2VzIGhhdmUgbm8gd2lyZS12MSBjYXRlZ29yeSAoc2VlIGRlc2lnbiBwb2ludCAyKS4gKi9cbmNvbnN0IEdSQVBIX0ZBTUlMWTogUmVhZG9ubHlTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoW1xuICAnaW50ZXJhY3RpdmVfZ3JhcGgnLFxuICAnbnVtYmVyX2xpbmUnLFxuICAnZGF0YV9wbG90Jyxcbl0pO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlY3Rpb25JbmRleCB7XG4gIHNlY3Rpb25JZDogc3RyaW5nO1xuICAvKiogSWRzIHRvIHNlbmQgd2hlbiBjaGVja2luZyB0aGlzIHNlY3Rpb24uICovXG4gIGl0ZW1zOiBTZWN0aW9uSXRlbUlkcztcbiAgLyoqIEJsb2NrIGlkcyBwcmVzZW50IGluIHRoaXMgc2VjdGlvbiwgZG9jdW1lbnQgb3JkZXIgKGNvbnRhaW5lcnMgaW5jbHVkZWQpLiAqL1xuICBibG9ja0lkczogc3RyaW5nW107XG4gIC8qKiBHcmFkYWJsZSBibG9jayBpZHMgdGhpcyB3aXJlIHZlcnNpb24gY2Fubm90IGNhcnJ5IFx1MjAxNCBzdXJmYWNlZCwgbm90IGhpZGRlbi4gKi9cbiAgdW5zdXBwb3J0ZWQ6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERvY3VtZW50SW5kZXgge1xuICBzZWN0aW9uczogU2VjdGlvbkluZGV4W107XG4gIGJ5U2VjdGlvbjogUmVjb3JkPHN0cmluZywgU2VjdGlvbkluZGV4PjtcbiAgLyoqIEV2ZXJ5IGdyYWRhYmxlLWJ1dC11bmNhcnJ5YWJsZSBibG9jayBpZCBhY3Jvc3MgdGhlIGRvY3VtZW50LiAqL1xuICB1bnN1cHBvcnRlZDogc3RyaW5nW107XG59XG5cbi8qKiBEZWVwLXdhbGsgYW55IHZhbHVlIGZvciBpbi1iYW5kIHJlc3BvbnNlIGlkczogYmxhbmsgdG9rZW5zIGFuZCBtYXRoLWdhcFxuICogcHJvbXB0cywgd2hlcmV2ZXIgdGhleSBzaXQuIERvZXMgTk9UIGRlc2NlbmQgaW50byBuZXN0ZWQgQmxvY2sgYXJyYXlzIFx1MjAxNFxuICogY2hpbGQgYmxvY2tzIGFyZSB2aXNpdGVkIGJ5IHRoZSBjYWxsZXIgc28gdGhlaXIgb3duIGlkcyBhdHRyaWJ1dGUgdG8gdGhlbS4gKi9cbmZ1bmN0aW9uIGNvbGxlY3RJbkJhbmRJZHMoXG4gIHZhbHVlOiB1bmtub3duLFxuICBvdXQ6IHN0cmluZ1tdLFxuICBpc0NoaWxkQmxvY2tBcnJheTogKHZhbHVlOiB1bmtub3duKSA9PiBib29sZWFuLFxuKTogdm9pZCB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIGlmIChpc0NoaWxkQmxvY2tBcnJheSh2YWx1ZSkpIHJldHVybjtcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdmFsdWUpIGNvbGxlY3RJbkJhbmRJZHMoaXRlbSwgb3V0LCBpc0NoaWxkQmxvY2tBcnJheSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnIHx8IHZhbHVlID09PSBudWxsKSByZXR1cm47XG5cbiAgY29uc3Qgbm9kZSA9IHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICBpZiAobm9kZS50eXBlID09PSAnYmxhbmsnICYmIHR5cGVvZiBub2RlLmlkID09PSAnc3RyaW5nJykge1xuICAgIG91dC5wdXNoKG5vZGUuaWQpO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBBIE1hdGhQcm9tcHQgY2FycmllcjogYGxhdGV4YCArIGBwcm9tcHRzYC4gTWF0Y2hlZCBTVFJVQ1RVUkFMTFkgcmF0aGVyXG4gIC8vIHRoYW4gYnkgbm9kZSB0eXBlIGJlY2F1c2UgdGhlIHNhbWUgY2FycmllciBzaGFwZSBpcyBib3RoIGFuIGlubGluZVxuICAvLyBtYXRoX2lubGluZSBub2RlIGFuZCBhIHRvcC1sZXZlbCBtYXRoX2Jsb2NrIFx1MjAxNCBhbmQgdGhlIHNjaGVtYSBhZG1pdHMgaXQgaW5cbiAgLy8gZWl0aGVyIHBvc2l0aW9uICh0aGUgcmVhc29uIHRoZSBTMiBzYW5pdGl6ZXIgd2Fsa3MgdW5jb25kaXRpb25hbGx5IHRvbykuXG4gIGlmICh0eXBlb2Ygbm9kZS5sYXRleCA9PT0gJ3N0cmluZycgJiYgQXJyYXkuaXNBcnJheShub2RlLnByb21wdHMpKSB7XG4gICAgZm9yIChjb25zdCBwcm9tcHQgb2Ygbm9kZS5wcm9tcHRzKSB7XG4gICAgICBjb25zdCBpZCA9IChwcm9tcHQgYXMgeyBpZD86IHVua25vd24gfSB8IG51bGwpPy5pZDtcbiAgICAgIGlmICh0eXBlb2YgaWQgPT09ICdzdHJpbmcnKSBvdXQucHVzaChpZCk7XG4gICAgfVxuICAgIC8vIEtlZXAgd2Fsa2luZyBzaWJsaW5nczogYSBtYXRoX2Jsb2NrIGFsc28gY2FycmllcyBjb250ZW50IGZpZWxkcy5cbiAgfVxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIE9iamVjdC52YWx1ZXMobm9kZSkpIHtcbiAgICBjb2xsZWN0SW5CYW5kSWRzKGNoaWxkLCBvdXQsIGlzQ2hpbGRCbG9ja0FycmF5KTtcbiAgfVxufVxuXG4vKiogQSB2YWx1ZSBpcyBhIGNoaWxkLWJsb2NrIGFycmF5IGlmIGl0IGxvb2tzIGxpa2UgQmxvY2tbXSAob2JqZWN0cyBjYXJyeWluZyBhXG4gKiBgdHlwZWAgdGhlIHJlZ2lzdHJ5IGtub3dzIEFORCBhbiBgaWRgKS4gU3RydWN0dXJhbCByYXRoZXIgdGhhblxuICogcmVnaXN0cnktZGVjbGFyZWQgc28gYSBjb250YWluZXIgdGhhdCBmb3JnZXRzIGl0cyBjaGlsZEJsb2NrcyBkZWNsYXJhdGlvblxuICogc3RpbGwgY2FuJ3QgZ2V0IGl0cyBjaGlsZHJlbidzIGlkcyBtaXMtYXR0cmlidXRlZC5cbiAqXG4gKiBFeHBvcnRlZCBiZWNhdXNlIHRoZSBhbnN3ZXIta2V5IGV4dHJhY3Rpb24sIHRoZSBjZW5zdXMsIEFORCB0aGUgZ3JhZGluZ1xuICogd2FsayAoc2luY2UgQTI0LCAyMDI2LTA4LTA2IFx1MjAxNCBpdCBjYXJyaWVkIGEgcHJpdmF0ZSBjb3B5IGZvciBhIHNsaWNlXG4gKiBnZW5lcmF0aW9uKSBhbGwgYW5zd2VyIHRoZSBzYW1lIHF1ZXN0aW9uIChcImlzIHRoaXMgYSBuZXN0ZWQgYmxvY2ssIG9yXG4gKiBjb250ZW50IG9mIHRoaXMgb25lP1wiKS4gVHdvIGNvcGllcyBvZiBhIHN1YnRsZSBoZXVyaXN0aWMgZHJpZnQ7IHRoaXMgb25lXG4gKiBpcyBUSEUgc291cmNlLCB3aXRoIHplcm8gY29waWVzIHJlbWFpbmluZy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb29rc0xpa2VCbG9ja0FycmF5KHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiZcbiAgICB2YWx1ZS5sZW5ndGggPiAwICYmXG4gICAgdmFsdWUuZXZlcnkoXG4gICAgICAoaXRlbSkgPT5cbiAgICAgICAgdHlwZW9mIGl0ZW0gPT09ICdvYmplY3QnICYmXG4gICAgICAgIGl0ZW0gIT09IG51bGwgJiZcbiAgICAgICAgdHlwZW9mIChpdGVtIGFzIHsgaWQ/OiB1bmtub3duIH0pLmlkID09PSAnc3RyaW5nJyAmJlxuICAgICAgICB0eXBlb2YgKGl0ZW0gYXMgeyB0eXBlPzogdW5rbm93biB9KS50eXBlID09PSAnc3RyaW5nJyxcbiAgICApICYmXG4gICAgLy8gSW5saW5lIG5vZGVzIGNhcnJ5IGB0eXBlYCBidXQgbmV2ZXIgYGlkYCArIGJsb2NrLWlzaCBzaGFwZSB0b2dldGhlcjtcbiAgICAvLyByZXF1aXJlIGF0IGxlYXN0IG9uZSBrbm93biBjb250YWluZXItaXNoIGtleSB0byBhdm9pZCBmYWxzZSBwb3NpdGl2ZXMuXG4gICAgdmFsdWUuZXZlcnkoKGl0ZW0pID0+IHtcbiAgICAgIGNvbnN0IHQgPSAoaXRlbSBhcyB7IHR5cGU6IHN0cmluZyB9KS50eXBlO1xuICAgICAgcmV0dXJuIHQgIT09ICd0ZXh0JyAmJiB0ICE9PSAnYmxhbmsnICYmIHQgIT09ICdtYXRoX2lubGluZScgJiYgdCAhPT0gJ2hhcmRfYnJlYWsnO1xuICAgIH0pXG4gICk7XG59XG5cbi8qKiBOZXN0ZWQgYmxvY2tzLCBmb3VuZCBzdHJ1Y3R1cmFsbHkgKHNlZSBsb29rc0xpa2VCbG9ja0FycmF5KS4gR2VuZXJpYyBvdmVyIHRoZVxuICogYmxvY2sgc2hhcGUgc28gdGhlIHNlcnZlZC1kb2N1bWVudCB3YWxrIGhlcmUgYW5kIHRoZSBhdXRob3JlZC1kb2N1bWVudCB3YWxrIGluXG4gKiB0aGUgYW5zd2VyLWtleSBleHRyYWN0aW9uIHNoYXJlIE9ORSBkZWZpbml0aW9uIG9mIFwiY2hpbGQgYmxvY2tcIi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGlsZEJsb2Nrc09mPFQgZXh0ZW5kcyBvYmplY3Q+KGJsb2NrOiBUKTogVFtdIHtcbiAgY29uc3Qgb3V0OiBUW10gPSBbXTtcbiAgZm9yIChjb25zdCB2YWx1ZSBvZiBPYmplY3QudmFsdWVzKGJsb2NrIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KSkge1xuICAgIGlmIChsb29rc0xpa2VCbG9ja0FycmF5KHZhbHVlKSkgb3V0LnB1c2goLi4uKHZhbHVlIGFzIFRbXSkpO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIHZpc2l0KGJsb2NrOiBTYW5pdGl6ZWRCbG9jaywgaW5kZXg6IFNlY3Rpb25JbmRleCk6IHZvaWQge1xuICBjb25zdCB0eXBlID0gKGJsb2NrIGFzIHsgdHlwZTogc3RyaW5nIH0pLnR5cGUgYXMgQmxvY2tUeXBlO1xuICBjb25zdCBpZCA9IChibG9jayBhcyB7IGlkOiBzdHJpbmcgfSkuaWQ7XG4gIGluZGV4LmJsb2NrSWRzLnB1c2goaWQpO1xuXG4gIC8vIEluLWJhbmQgaWRzIChibGFua3MgKyBtYXRoIGdhcHMpIGJlbG9uZyB0byBUSElTIGJsb2NrLCBhdCBhbnkgZGVwdGhcbiAgLy8gc2hvcnQgb2YgYSBuZXN0ZWQgYmxvY2suXG4gIGNvbnN0IGluQmFuZDogc3RyaW5nW10gPSBbXTtcbiAgY29sbGVjdEluQmFuZElkcyhibG9jaywgaW5CYW5kLCBsb29rc0xpa2VCbG9ja0FycmF5KTtcbiAgaWYgKGluQmFuZC5sZW5ndGggPiAwKSB7XG4gICAgaW5kZXguaXRlbXMuYmxhbmtzID0gWy4uLihpbmRleC5pdGVtcy5ibGFua3MgPz8gW10pLCAuLi5pbkJhbmRdO1xuICB9XG5cbiAgLy8gUGVyLWJsb2NrLWlkIGNhdGVnb3JpZXMuIGZhbWlseU9mIHJlc29sdmVzIGRpc3BsYXktbW9kZSBpbnN0YW5jZXMgdG9cbiAgLy8gJ3N0YXRpYycsIHNvIGEgZGlzcGxheSBncmFwaCBjb250cmlidXRlcyBub3RoaW5nIFx1MjAxNCBjb3JyZWN0LCBpdCB0YWtlcyBub1xuICAvLyBpbnB1dC5cbiAgY29uc3QgZmFtaWx5ID0gZmFtaWx5T2YoYmxvY2sgYXMgbmV2ZXIpO1xuICBpZiAoZmFtaWx5ICE9PSAnc3RhdGljJykge1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnbXVsdGlwbGVfY2hvaWNlJzpcbiAgICAgICAgaW5kZXguaXRlbXMuY2hvaWNlcyA9IFsuLi4oaW5kZXguaXRlbXMuY2hvaWNlcyA/PyBbXSksIGlkXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtYXRjaGluZyc6XG4gICAgICAgIGluZGV4Lml0ZW1zLm1hdGNoZXMgPSBbLi4uKGluZGV4Lml0ZW1zLm1hdGNoZXMgPz8gW10pLCBpZF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb3JkZXJpbmcnOlxuICAgICAgICBpbmRleC5pdGVtcy5vcmRlcmluZ3MgPSBbLi4uKGluZGV4Lml0ZW1zLm9yZGVyaW5ncyA/PyBbXSksIGlkXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzZWxmX2V4cGxhbmF0aW9uJzpcbiAgICAgIGNhc2UgJ3Nob3J0X2Fuc3dlcic6XG4gICAgICBjYXNlICdlc3NheSc6XG4gICAgICAgIGluZGV4Lml0ZW1zLmZyZWVUZXh0ID0gWy4uLihpbmRleC5pdGVtcy5mcmVlVGV4dCA/PyBbXSksIGlkXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBXaXJlIHYyIGNhcnJpZXMgZ2VvbWV0cmljIHdvcmsgZm9yIHRoZSB3aG9sZSBncmFwaCBmYW1pbHk7IHRoZVxuICAgICAgICAvLyBzZXJ2ZXIgZGlzcGF0Y2hlcyBvbiB0aGUgc2VydmVkIGludGVyYWN0aW9uIHR5cGUuXG4gICAgICAgIGlmIChHUkFQSF9GQU1JTFkuaGFzKHR5cGUpKSB7XG4gICAgICAgICAgaW5kZXguaXRlbXMuZ3JhcGhzID0gWy4uLihpbmRleC5pdGVtcy5ncmFwaHMgPz8gW10pLCBpZF07XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZEJsb2Nrc09mKGJsb2NrKSkgdmlzaXQoY2hpbGQsIGluZGV4KTtcbn1cblxuLyoqIEluZGV4IGEgc2VydmVkIGRvY3VtZW50OiBwZXItc2VjdGlvbiBjaGVjayBwYXlsb2FkIGlkcyArIHRoZSB1bnN1cHBvcnRlZFxuICogcm9zdGVyLiBQdXJlOyBzYWZlIHRvIHJlY29tcHV0ZSBvbiBldmVyeSByZW5kZXIgKHRoZSBkb2N1bWVudCBpcyBpbW11dGFibGVcbiAqIHBlciB2ZXJzaW9uKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmRleERvY3VtZW50KGRvYzogU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudCk6IERvY3VtZW50SW5kZXgge1xuICBjb25zdCBzZWN0aW9uczogU2VjdGlvbkluZGV4W10gPSBbXTtcbiAgZm9yIChjb25zdCBzZWN0aW9uIG9mIGRvYy5zZWN0aW9ucykge1xuICAgIGNvbnN0IGluZGV4OiBTZWN0aW9uSW5kZXggPSB7XG4gICAgICBzZWN0aW9uSWQ6IHNlY3Rpb24uaWQsXG4gICAgICBpdGVtczoge30sXG4gICAgICBibG9ja0lkczogW10sXG4gICAgICB1bnN1cHBvcnRlZDogW10sXG4gICAgfTtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiBzZWN0aW9uLnJvd3MpIHtcbiAgICAgIGZvciAoY29uc3QgY29sdW1uIG9mIHJvdy5jb2x1bW5zKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgY29sdW1uLmJsb2NrcykgdmlzaXQoYmxvY2ssIGluZGV4KTtcbiAgICAgIH1cbiAgICB9XG4gICAgc2VjdGlvbnMucHVzaChpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBzZWN0aW9ucyxcbiAgICBieVNlY3Rpb246IE9iamVjdC5mcm9tRW50cmllcyhzZWN0aW9ucy5tYXAoKHMpID0+IFtzLnNlY3Rpb25JZCwgc10pKSxcbiAgICB1bnN1cHBvcnRlZDogc2VjdGlvbnMuZmxhdE1hcCgocykgPT4gcy51bnN1cHBvcnRlZCksXG4gIH07XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGdyYWRpbmcvd2Fsay50cyBcdTIwMTQgcmF3IGRvY3VtZW50IFx1MjE5MiB0aGUgZ3JhZGFibGUgaW52ZW50b3J5IG9mIG9uZSBzZWN0aW9uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhlIHNlcnZlcidzIGNvdW50ZXJwYXJ0IHRvIHRoZSB2aWV3ZXIncyBjb250YWluZXIvYmxvY2tJbmRleC50cy4gU2FtZSB3YWxrLFxuLy8gb3Bwb3NpdGUgc2lkZSBvZiB0aGUgd2lyZTogYmxvY2tJbmRleCB0ZWxscyB0aGUgQ0xJRU5UIHdoaWNoIGlkcyB0byBzZW5kLFxuLy8gdGhpcyB0ZWxscyB0aGUgU0VSVkVSIHdoYXQgZWFjaCBvZiB0aG9zZSBpZHMgaXMgd29ydGguIFRoZXkgbXVzdCBhZ3JlZSwgYW5kXG4vLyB0aGUgZ29sZGVuIGNvcnB1cyBwbHVzIHRoZSBjb25mb3JtYW5jZSBzdWl0ZSBhcmUgd2hhdCBob2xkIHRoZW0gdG9nZXRoZXIuXG4vL1xuLy8gVHdvIHByb3BlcnRpZXMgaW5oZXJpdGVkIGRlbGliZXJhdGVseSBmcm9tIGJsb2NrSW5kZXg6XG4vL1xuLy8gIDEuIElOLUJBTkQgSURTIENPTUUgRlJPTSBBIERFRVAgV0FMSywgbm90IGEgcGVyLXR5cGUgZmllbGQgbGlzdC4gQSBibGFua1xuLy8gICAgIGxpdmVzIGluIGZpbGxfaW5fYmxhbmsuY29udGVudCwgYnV0IGFsc28gaW5zaWRlIGEgZmFkZWRfd29ya2VkX2V4YW1wbGUnc1xuLy8gICAgIG5lc3RlZCBzdGVwcywgYW5kIGEgcHJvbXB0ZWQgbWF0aF9pbmxpbmUgbWF5IGFwcGVhciBpbiBBTlkgY29udGVudCBhcnJheS5cbi8vICAgICBXYWxraW5nIHVuY29uZGl0aW9uYWxseSBtZWFucyBhIG5ldyBibG9jayB0eXBlIHRoYXQgZW1iZWRzIGJsYW5rcyBpc1xuLy8gICAgIGdyYWRhYmxlIHRoZSBkYXkgaXQgcmVuZGVycywgd2l0aCBubyByZWdpc3RyeSBlZGl0LiBUaGUgZmFpbHVyZSB0aGlzXG4vLyAgICAgYXZvaWRzIGlzIHRoZSB3b3JzdCBraW5kOiBhIHN0dWRlbnQgYW5zd2VyIHRoYXQgaXMgc3VibWl0dGVkLCBzdG9yZWQsIGFuZFxuLy8gICAgIG5ldmVyIHNjb3JlZC5cbi8vXG4vLyAgMi4gQ09OVEFJTkVSUyBBVFRSSUJVVEUgVE8gVEhFIENISUxELiBBIGJsYW5rIGluc2lkZSBhIGZhZGVkIGV4YW1wbGUgYmVsb25nc1xuLy8gICAgIHRvIHRoYXQgZXhhbXBsZSdzIHN0ZXAsIG5vdCB0byB0aGUgY29udGFpbmVyLCBzbyBpZHMgbGluZSB1cCB3aXRoIHdoYXRcbi8vICAgICB0aGUgY2xpZW50IHNlbnQuXG4vL1xuLy8gVGhpcyB3YWxrIHJlYWRzIHRoZSBSQVcgZG9jdW1lbnQuIFRoYXQgaXMgd2hhdCBtYWtlcyBgb3JkZXJpbmdgIGdyYWRhYmxlIGF0XG4vLyBhbGwgKGl0cyBhdXRob3JlZCBpdGVtIG9yZGVyIElTIHRoZSBrZXkpIGFuZCB3aGF0IGdpdmVzIHRoZSBncmFkZXIgdGhlIGFuc3dlclxuLy8ga2V5cywgaGludHMsIGFuZCBzb2x1dGlvbnMgdGhlIHNlcnZlZCBkb2N1bWVudCBoYWQgc3RyaXBwZWQuXG4vL1xuLy8gTUFMRk9STUVELURPQ1VNRU5UIFBPU1RVUkUgKGludGVyaW0gXHUyMDE0IGRlY2xhcmVkIHBlciBBMzQsIERFQ0lERUQgcGVyIEQxMCk6XG4vLyB0b2RheSB0aGlzIHdhbGsgVEhST1dTIE5PVEhJTkcuIEV2ZXJ5IGZpZWxkIGlzIGRlZmVuc2l2ZWx5IG5hcnJvd2VkLCBzbyBhXG4vLyBzdHJ1Y3R1cmFsbHkgYnJva2VuIGJsb2NrIHByb2R1Y2VzIGEgTUFSSyAodW5zY29yZWQsIG9yIGdyYWRlZCBhZ2FpbnN0IGFuXG4vLyBlbXB0eSBrZXkpIHJhdGhlciB0aGFuIGEgdHlwZWQgZmFpbHVyZSBcdTIwMTQgdGhlIHN0dWRlbnQgc2VlcyBhIGNvbmZpZGVudCB3cm9uZ1xuLy8gdmVyZGljdCBhbmQgbm9ib2R5IHNlZXMgYW4gZXJyb3IuIFRoYXQgcG9zdHVyZSB3YXMgdW5kZWNsYXJlZCBmb3IgYSBzbGljZVxuLy8gZ2VuZXJhdGlvbiAoczQtYXVkaXQgbWlzc2VkLTkpOyBpdCBpcyBub3cgZGVjbGFyZWQgQU5EIHJ1bGVkIGFnYWluc3Q6IHRoZVxuLy8gMjAyNi0wOC0wNiBlbmcgcmV2aWV3IChEMTApIHJ1bGVkIGEgdHlwZWQgYG1hbGZvcm1lZF9kb2N1bWVudGAgZmFpbHVyZSBcdTIwMTRcbi8vIHdhbGsgZ2FpbnMgYW4gaW50ZWdyaXR5IGdhdGUgZGlzdGluZ3Vpc2hpbmcgYXV0aG9yZWQtZW1wdHkgKGxlZ2l0aW1hdGVseVxuLy8gdW5ncmFkYWJsZSwgdG9kYXkncyBiZWhhdmlvciBzdGF5cykgZnJvbSBzdHJ1Y3R1cmFsbHktYnJva2VuIChmYWlsIHR5cGVkKSxcbi8vIHdpdGggY29ycHVzIGNhc2VzIGFuZCBhIGNsaWVudCBtYXBwaW5nLiBVbnRpbCB0aGF0IHNsaWNlIGxhbmRzLCBzaWxlbnRcbi8vIGNvZXJjaW9uIGlzIHRoZSBLTk9XTiBiZWhhdmlvciBoZXJlLCBub3QgYW4gYWNjaWRlbnQuIEluIGl0cyBmYXZvcjogdGhlXG4vLyBkZWZlbnNpdmUgbmFycm93aW5nIGlzIHdoYXQgY29udGFpbmVkIFM3J3MgcmVhbC13b3JsZCBtYWxmb3JtZWQgY2FzZVxuLy8gKHNjaGVtYVZlcnNpb24tMSBkb2N1bWVudHMpIHNhZmVseS5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7XG4gIGNoaWxkQmxvY2tzT2YsXG4gIGxvb2tzTGlrZUJsb2NrQXJyYXksXG59IGZyb20gJy4uLy4uL2NvbnRhaW5lci9ibG9ja0luZGV4LmpzJztcbmltcG9ydCB7IFBST01QVF9DQVJSSUVSX1RZUEVTIH0gZnJvbSAnLi4vLi4vc2FuaXRpemUvcHJvbXB0Q2FycmllcnMuanMnO1xuaW1wb3J0IHR5cGUgeyBCbGFua0tleSB9IGZyb20gJy4vYmxhbmtzLmpzJztcbmltcG9ydCB0eXBlIHsgUmF3R3JhcGhCbG9jayB9IGZyb20gJy4vZ3JhcGhzLmpzJztcblxuLyoqIExvb3NlbHktdHlwZWQgcmF3IGJsb2NrOiB0aGUgc2VydmVyIGRpc3BhdGNoZXMgb24gYHR5cGVgIHN0cmluZ3MgYW5kIHJlYWRzXG4gKiBmaWVsZHMgdGhlIHNhbml0aXplZCB0eXBlcyBkZWxpYmVyYXRlbHkgZG9uJ3QgYWRtaXQuICovXG5leHBvcnQgdHlwZSBSYXdCbG9jayA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+ICYgeyBpZD86IHN0cmluZzsgdHlwZT86IHN0cmluZyB9O1xuXG5leHBvcnQgaW50ZXJmYWNlIEdyYWRhYmxlSW52ZW50b3J5IHtcbiAgLyoqIEJsYW5rICsgbWF0aC1nYXAga2V5cywgaW4gZG9jdW1lbnQgb3JkZXIsIGdyb3VwZWQgcGVyIG93bmluZyBibG9jayBzb1xuICAgKiBpbnRlcmNoYW5nZWFibGUgcnVucyBjYW4gYmUgcmVzb2x2ZWQgd2l0aGluIHRoZWlyIGJsb2NrLiAqL1xuICBibGFua0dyb3Vwc0J5QmxvY2s6IEFycmF5PHsgYmxvY2tJZDogc3RyaW5nOyBrZXlzOiBCbGFua0tleVtdIH0+O1xuICBtdWx0aXBsZUNob2ljZTogQXJyYXk8e1xuICAgIGJsb2NrSWQ6IHN0cmluZztcbiAgICBjb3JyZWN0SWRzOiBzdHJpbmdbXTtcbiAgICBjaG9pY2VzOiBBcnJheTx7IGlkOiBzdHJpbmc7IGZlZWRiYWNrPzogdW5rbm93bltdIH0+O1xuICB9PjtcbiAgbWF0Y2hpbmc6IEFycmF5PHtcbiAgICBibG9ja0lkOiBzdHJpbmc7XG4gICAga2V5OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICAgIGl0ZW1JZHM6IHN0cmluZ1tdO1xuICB9PjtcbiAgb3JkZXJpbmc6IEFycmF5PHsgYmxvY2tJZDogc3RyaW5nOyBhdXRob3JlZE9yZGVyOiBzdHJpbmdbXSB9PjtcbiAgZ3JhcGhzOiBBcnJheTx7IGJsb2NrSWQ6IHN0cmluZzsgYmxvY2s6IFJhd0dyYXBoQmxvY2sgfT47XG4gIC8qKiBFdmVyeSBmcmVlLXRleHQgYmxvY2sgaW4gdGhlIHNlY3Rpb24gXHUyMDE0IHJlY29yZGVkLCBuZXZlciBqdWRnZWQuICovXG4gIGZyZWVUZXh0OiBzdHJpbmdbXTtcbiAgLyoqIGJsb2NrSWQgXHUyMTkyIGF1dGhvcmVkIHNvbHV0aW9uIGNvbnRlbnQsIGZvciBFVkVSWSBibG9jayBpbiB0aGUgc2VjdGlvbiB0aGF0XG4gICAqIGhhcyBvbmUuIEluY2x1ZGVzIFNUQVRJQyBibG9ja3MgKGEgYHByb2JsZW1gJ3Mgd29ya2VkIGV4cGxhbmF0aW9uKSwgd2hpY2hcbiAgICogaXMgdGhlIHdob2xlIHJlYXNvbiB0aGlzIGlzIGNvbGxlY3RlZCBieSB3YWxraW5nIGJsb2NrcyByYXRoZXIgdGhhbiBieVxuICAgKiB3YWxraW5nIHRoZSBibG9ja3MgdGhhdCBwcm9kdWNlZCByZXNwb25zZXMuICovXG4gIHNvbHV0aW9uczogQXJyYXk8eyBibG9ja0lkOiBzdHJpbmc7IHNvbHV0aW9uOiB1bmtub3duW10gfT47XG59XG5cbi8vIEV4cG9ydGVkIGZvciB0aGUgcm9zdGVyLWJvbmQgdGVzdCBPTkxZIChyb3N0ZXJCb25kcy50ZXN0LnRzKSBcdTIwMTQgdGhlc2UgdHdvXG4vLyBTZXRzIHJlc3RhdGUgcmVnaXN0cnkgZmFjdHMgKGZhbWlseSAncmVjb3JkZWQnOyBkZXJpdmVRdWVzdGlvblNoYXBlKSB0aGF0XG4vLyB0aGlzIG1vZHVsZSBkZWxpYmVyYXRlbHkgZG9lcyBub3QgaW1wb3J0IHRoZSByZWdpc3RyeSB0byBkZXJpdmUsIGFuZCBhXG4vLyBoYW5kLWxpc3QgdGhhdCByZXN0YXRlcyBhIHJlZ2lzdHJ5IGZhY3QgaXMgYSBjbGFpbSB0aGF0IG5lZWRzIGEgZ3VhcmQgKEE3LFxuLy8gcG9saWN5IFAxMGIpLiBQcm9kdWN0aW9uIGNvZGUgbXVzdCBrZWVwIGNvbnN1bWluZyB0aGVtIGZyb20gaGVyZS5cbmV4cG9ydCBjb25zdCBGUkVFX1RFWFRfVFlQRVMgPSBuZXcgU2V0KFtcbiAgJ3NlbGZfZXhwbGFuYXRpb24nLFxuICAnc2hvcnRfYW5zd2VyJyxcbiAgJ2Vzc2F5Jyxcbl0pO1xuZXhwb3J0IGNvbnN0IEdSQVBIX1RZUEVTID0gbmV3IFNldChbXG4gICdpbnRlcmFjdGl2ZV9ncmFwaCcsXG4gICdudW1iZXJfbGluZScsXG4gICdkYXRhX3Bsb3QnLFxuXSk7XG5cbi8qKiBQcm9qZWN0IGEgcmF3IEJsYW5rVG9rZW4gb250byB0aGUgZ3JhZGluZyBrZXkgc2hhcGUuICovXG5mdW5jdGlvbiBibGFua1Rva2VuVG9LZXkobm9kZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBCbGFua0tleSB7XG4gIGNvbnN0IGFuc3dlciA9IHR5cGVvZiBub2RlLmFuc3dlciA9PT0gJ3N0cmluZycgPyBub2RlLmFuc3dlciA6ICcnO1xuICBjb25zdCBhY2NlcHRhYmxlID0gQXJyYXkuaXNBcnJheShub2RlLmFjY2VwdGFibGVBbnN3ZXJzKVxuICAgID8gKG5vZGUuYWNjZXB0YWJsZUFuc3dlcnMgYXMgdW5rbm93bltdKS5maWx0ZXIoXG4gICAgICAgIChhKTogYSBpcyBzdHJpbmcgPT4gdHlwZW9mIGEgPT09ICdzdHJpbmcnLFxuICAgICAgKVxuICAgIDogW107XG4gIGNvbnN0IGFuc3dlclR5cGUgPSBub2RlLmFuc3dlclR5cGU7XG4gIHJldHVybiB7XG4gICAgaWQ6IFN0cmluZyhub2RlLmlkID8/ICcnKSxcbiAgICAvLyBgYW5zd2VyYCBmaXJzdCwgdGhlbiB0aGUgYWx0ZXJuYXRlcyBcdTIwMTQgb25lIGxpc3QsIG1hdGNoaW5nIGhvdyB0aGVcbiAgICAvLyByZW5kZXJlciBqb2lucyB0aGVtIGludG8gZGF0YS1ibGFuay1hbnN3ZXJzLlxuICAgIGFuc3dlcnM6IFthbnN3ZXIsIC4uLmFjY2VwdGFibGVdLFxuICAgIGFuc3dlclR5cGU6XG4gICAgICBhbnN3ZXJUeXBlID09PSAnbnVtZXJpYycgfHwgYW5zd2VyVHlwZSA9PT0gJ21hdGgnID8gYW5zd2VyVHlwZSA6ICd0ZXh0JyxcbiAgICB0b2xlcmFuY2U6IHR5cGVvZiBub2RlLnRvbGVyYW5jZSA9PT0gJ251bWJlcicgPyBub2RlLnRvbGVyYW5jZSA6IDAsXG4gICAgZXF1aXZhbGVuY2U6IG5vZGUuZXF1aXZhbGVuY2UgPT09ICdleGFjdC1mb3JtJyA/ICdleGFjdC1mb3JtJyA6ICd2YWx1ZScsXG4gICAgbWlzdGFrZUZlZWRiYWNrOiBBcnJheS5pc0FycmF5KG5vZGUubWlzdGFrZUZlZWRiYWNrKVxuICAgICAgPyAobm9kZS5taXN0YWtlRmVlZGJhY2sgYXMgQXJyYXk8eyBtYXRjaDogc3RyaW5nOyBmZWVkYmFjazogdW5rbm93bltdIH0+KVxuICAgICAgOiBbXSxcbiAgICBoaW50OiBBcnJheS5pc0FycmF5KG5vZGUuaGludCkgPyAobm9kZS5oaW50IGFzIHVua25vd25bXSkgOiB1bmRlZmluZWQsXG4gICAgaW50ZXJjaGFuZ2VhYmxlV2l0aFByZXZpb3VzOiBub2RlLmludGVyY2hhbmdlYWJsZVdpdGhQcmV2aW91cyA9PT0gdHJ1ZSxcbiAgfTtcbn1cblxuLyoqIFByb2plY3QgYSByYXcgTWF0aFByb21wdCBvbnRvIHRoZSBzYW1lIHNoYXBlLiBBIGdhcCBpcyBBTFdBWVMgZ3JhZGVkIGFzIGFcbiAqIG1hdGggZXhwcmVzc2lvbiBhbmQgbmV2ZXIgY2FycmllcyBoaW50L21pc3Rha2VGZWVkYmFjayBcdTIwMTQgYW5kIGl0cyBpZCBpcyBub3QgYVxuICogdXVpZCwgYnV0IGl0IGtleXMgaW50byB0aGUgc2FtZSBgYmxhbmtzYCByZXNwb25zZSBtYXAuICovXG5mdW5jdGlvbiBtYXRoUHJvbXB0VG9LZXkobm9kZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBCbGFua0tleSB7XG4gIGNvbnN0IGFuc3dlciA9IHR5cGVvZiBub2RlLmFuc3dlciA9PT0gJ3N0cmluZycgPyBub2RlLmFuc3dlciA6ICcnO1xuICBjb25zdCBhY2NlcHRhYmxlID0gQXJyYXkuaXNBcnJheShub2RlLmFjY2VwdGFibGVBbnN3ZXJzKVxuICAgID8gKG5vZGUuYWNjZXB0YWJsZUFuc3dlcnMgYXMgdW5rbm93bltdKS5maWx0ZXIoXG4gICAgICAgIChhKTogYSBpcyBzdHJpbmcgPT4gdHlwZW9mIGEgPT09ICdzdHJpbmcnLFxuICAgICAgKVxuICAgIDogW107XG4gIHJldHVybiB7XG4gICAgaWQ6IFN0cmluZyhub2RlLmlkID8/ICcnKSxcbiAgICBhbnN3ZXJzOiBbYW5zd2VyLCAuLi5hY2NlcHRhYmxlXSxcbiAgICBhbnN3ZXJUeXBlOiAnbWF0aCcsXG4gICAgdG9sZXJhbmNlOiB0eXBlb2Ygbm9kZS50b2xlcmFuY2UgPT09ICdudW1iZXInID8gbm9kZS50b2xlcmFuY2UgOiAwLFxuICAgIGVxdWl2YWxlbmNlOiBub2RlLmVxdWl2YWxlbmNlID09PSAnZXhhY3QtZm9ybScgPyAnZXhhY3QtZm9ybScgOiAndmFsdWUnLFxuICAgIG1pc3Rha2VGZWVkYmFjazogW10sXG4gICAgaGludDogdW5kZWZpbmVkLFxuICAgIC8vIEEgZ2FwIG5ldmVyIGpvaW5zIGFuIGludGVyY2hhbmdlYWJsZSBydW46IHRoZSBmbGFnIGlzIGEgQmxhbmtUb2tlbiBmaWVsZC5cbiAgICBpbnRlcmNoYW5nZWFibGVXaXRoUHJldmlvdXM6IGZhbHNlLFxuICB9O1xufVxuXG4vLyBQUk9NUFRfQ0FSUklFUl9UWVBFUyBpcyBpbXBvcnRlZCBmcm9tIHNhbml0aXplL3Byb21wdENhcnJpZXJzLnRzIFx1MjAxNCB0aGUgT05FXG4vLyBkZWNsYXJhdGlvbiBib3RoIHRoZSBzYW5pdGl6ZXIncyBkZWVwIHN0cmlwIGFuZCB0aGlzIHdhbGsgY29uc3VtZSAoQTcpLlxuXG4vKiogQ29sbGVjdCBpbi1iYW5kIGtleXMgKGJsYW5rcyArIG1hdGggZ2FwcykgYmVsb25naW5nIHRvIFRISVMgYmxvY2ssIGF0IGFueVxuICogZGVwdGggc2hvcnQgb2YgYSBuZXN0ZWQgY2hpbGQgYmxvY2suICovXG5mdW5jdGlvbiBjb2xsZWN0SW5CYW5kS2V5cyhcbiAgdmFsdWU6IHVua25vd24sXG4gIG91dDogQmxhbmtLZXlbXSxcbiAgaXNDaGlsZEJsb2NrQXJyYXk6ICh2YWx1ZTogdW5rbm93bikgPT4gYm9vbGVhbixcbik6IHZvaWQge1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBpZiAoaXNDaGlsZEJsb2NrQXJyYXkodmFsdWUpKSByZXR1cm47XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHZhbHVlKSBjb2xsZWN0SW5CYW5kS2V5cyhpdGVtLCBvdXQsIGlzQ2hpbGRCbG9ja0FycmF5KTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHJldHVybjtcbiAgY29uc3Qgbm9kZSA9IHZhbHVlIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIGlmIChub2RlLnR5cGUgPT09ICdibGFuaycgJiYgdHlwZW9mIG5vZGUuaWQgPT09ICdzdHJpbmcnKSB7XG4gICAgb3V0LnB1c2goYmxhbmtUb2tlblRvS2V5KG5vZGUpKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKFxuICAgIHR5cGVvZiBub2RlLnR5cGUgPT09ICdzdHJpbmcnICYmXG4gICAgUFJPTVBUX0NBUlJJRVJfVFlQRVMuaGFzKG5vZGUudHlwZSkgJiZcbiAgICBBcnJheS5pc0FycmF5KG5vZGUucHJvbXB0cylcbiAgKSB7XG4gICAgZm9yIChjb25zdCBwcm9tcHQgb2Ygbm9kZS5wcm9tcHRzKSB7XG4gICAgICBpZiAocHJvbXB0ICE9PSBudWxsICYmIHR5cGVvZiBwcm9tcHQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG91dC5wdXNoKG1hdGhQcm9tcHRUb0tleShwcm9tcHQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gS2VlcCB3YWxraW5nIHNpYmxpbmdzOiBhIG1hdGhfYmxvY2sgY2FycmllcyBjb250ZW50IGZpZWxkcyB0b28uXG4gIH1cbiAgZm9yIChjb25zdCBjaGlsZCBvZiBPYmplY3QudmFsdWVzKG5vZGUpKSB7XG4gICAgY29sbGVjdEluQmFuZEtleXMoY2hpbGQsIG91dCwgaXNDaGlsZEJsb2NrQXJyYXkpO1xuICB9XG59XG5cbi8vIGxvb2tzTGlrZUJsb2NrQXJyYXkgLyBjaGlsZEJsb2Nrc09mIGFyZSBJTVBPUlRFRCBmcm9tIGNvbnRhaW5lci9ibG9ja0luZGV4IFx1MjAxNFxuLy8gdGhpcyBmaWxlIGNhcnJpZWQgYSBwcml2YXRlLCBsb2dpY2FsbHktaWRlbnRpY2FsIGNvcHkgb2YgdGhlIHN1YnRsZVxuLy8gaGV1cmlzdGljIHVudGlsIDIwMjYtMDgtMDYgKEEyNCksIGhlZGdlZCBcIm1pcnJvcmluZyBibG9ja0luZGV4J3NcIiB3aGlsZSB0aGVcbi8vIHNvdXJjZSBmaWxlIGNsYWltZWQgXCJ0aGlzIG9uZSBpcyB0aGUgc291cmNlXCI6IHRoZSBjb3B5IHRoYXQgd291bGQgc2lsZW50bHlcbi8vIGRyaWZ0LCBhbmQgZHJpZnRlZCBhdHRyaWJ1dGlvbiBtaXMtZ3JhZGVzIGludmlzaWJseS4gU2FtZSBwYWNrYWdlLCBhbmQgdGhlXG4vLyBjZW5zdXMgYWxyZWFkeSBpbXBvcnRzIGNoaWxkQmxvY2tzT2Ygc2VydmVyLXNpZGUsIHNvIHRoZSBidW5kbGUgYm91bmRhcnlcbi8vIHdhcyBwcm92ZW4gYmVmb3JlIHRoaXMgam9pbmVkIGl0LlxuXG5mdW5jdGlvbiB2aXNpdChibG9jazogUmF3QmxvY2ssIGludjogR3JhZGFibGVJbnZlbnRvcnkpOiB2b2lkIHtcbiAgY29uc3QgaWQgPSB0eXBlb2YgYmxvY2suaWQgPT09ICdzdHJpbmcnID8gYmxvY2suaWQgOiAnJztcbiAgY29uc3QgdHlwZSA9IHR5cGVvZiBibG9jay50eXBlID09PSAnc3RyaW5nJyA/IGJsb2NrLnR5cGUgOiAnJztcbiAgaWYgKCFpZCkgcmV0dXJuO1xuXG4gIC8vIFNvbHV0aW9ucyBhcmUgY29sbGVjdGVkIGZvciBFVkVSWSBibG9jayB0aGF0IGhhcyBvbmUsIGluY2x1ZGluZyBzdGF0aWNzLlxuICAvLyBBIGdyYWRlciB0aGF0IHdhbGtlZCBvbmx5IHJlc3BvbmRpbmcgYmxvY2tzIHdvdWxkIG5ldmVyIHVubG9jayBhXG4gIC8vIGBwcm9ibGVtYCdzIHdvcmtlZCBzb2x1dGlvbiwgYW5kIHRvIGEgc3R1ZGVudCB0aGF0IHJlYWRzIGFzIGEgY29udGVudCBidWdcbiAgLy8gKHRoZSBzZWN0aW9uIHNheXMgXCJjaGVja2VkXCIgYnV0IG9uZSBib3ggc3RheXMgc2h1dCkuXG4gIGlmIChBcnJheS5pc0FycmF5KGJsb2NrLnNvbHV0aW9uKSAmJiBibG9jay5zb2x1dGlvbi5sZW5ndGggPiAwKSB7XG4gICAgaW52LnNvbHV0aW9ucy5wdXNoKHsgYmxvY2tJZDogaWQsIHNvbHV0aW9uOiBibG9jay5zb2x1dGlvbiBhcyB1bmtub3duW10gfSk7XG4gIH1cblxuICBjb25zdCBpbkJhbmQ6IEJsYW5rS2V5W10gPSBbXTtcbiAgY29sbGVjdEluQmFuZEtleXMoYmxvY2ssIGluQmFuZCwgbG9va3NMaWtlQmxvY2tBcnJheSk7XG4gIGlmIChpbkJhbmQubGVuZ3RoID4gMCkge1xuICAgIGludi5ibGFua0dyb3Vwc0J5QmxvY2sucHVzaCh7IGJsb2NrSWQ6IGlkLCBrZXlzOiBpbkJhbmQgfSk7XG4gIH1cblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdtdWx0aXBsZV9jaG9pY2UnOiB7XG4gICAgICBjb25zdCBjaG9pY2VzID0gQXJyYXkuaXNBcnJheShibG9jay5jaG9pY2VzKVxuICAgICAgICA/IChibG9jay5jaG9pY2VzIGFzIEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PilcbiAgICAgICAgOiBbXTtcbiAgICAgIGludi5tdWx0aXBsZUNob2ljZS5wdXNoKHtcbiAgICAgICAgYmxvY2tJZDogaWQsXG4gICAgICAgIGNvcnJlY3RJZHM6IGNob2ljZXNcbiAgICAgICAgICAuZmlsdGVyKChjKSA9PiBjLmNvcnJlY3QgPT09IHRydWUpXG4gICAgICAgICAgLm1hcCgoYykgPT4gU3RyaW5nKGMuaWQpKSxcbiAgICAgICAgY2hvaWNlczogY2hvaWNlcy5tYXAoKGMpID0+ICh7XG4gICAgICAgICAgaWQ6IFN0cmluZyhjLmlkKSxcbiAgICAgICAgICAuLi4oQXJyYXkuaXNBcnJheShjLmZlZWRiYWNrKVxuICAgICAgICAgICAgPyB7IGZlZWRiYWNrOiBjLmZlZWRiYWNrIGFzIHVua25vd25bXSB9XG4gICAgICAgICAgICA6IHt9KSxcbiAgICAgICAgfSkpLFxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSAnbWF0Y2hpbmcnOiB7XG4gICAgICBjb25zdCBpdGVtcyA9IEFycmF5LmlzQXJyYXkoYmxvY2suaXRlbXMpXG4gICAgICAgID8gKGJsb2NrLml0ZW1zIGFzIEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PilcbiAgICAgICAgOiBbXTtcbiAgICAgIGludi5tYXRjaGluZy5wdXNoKHtcbiAgICAgICAgYmxvY2tJZDogaWQsXG4gICAgICAgIGtleTogKGJsb2NrLmtleSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSA/PyB7fSxcbiAgICAgICAgaXRlbUlkczogaXRlbXMubWFwKChpKSA9PiBTdHJpbmcoaS5pZCkpLFxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSAnb3JkZXJpbmcnOiB7XG4gICAgICBjb25zdCBpdGVtcyA9IEFycmF5LmlzQXJyYXkoYmxvY2suaXRlbXMpXG4gICAgICAgID8gKGJsb2NrLml0ZW1zIGFzIEFycmF5PFJlY29yZDxzdHJpbmcsIHVua25vd24+PilcbiAgICAgICAgOiBbXTtcbiAgICAgIC8vIFRoZSBhdXRob3JlZCBvcmRlciBJUyB0aGUga2V5IFx1MjAxNCBhdmFpbGFibGUgb25seSBiZWNhdXNlIHRoaXMgd2Fsa3MgdGhlXG4gICAgICAvLyByYXcgZG9jdW1lbnQgcmF0aGVyIHRoYW4gdGhlIHNlcnZlZCBvbmUuXG4gICAgICBpbnYub3JkZXJpbmcucHVzaCh7IGJsb2NrSWQ6IGlkLCBhdXRob3JlZE9yZGVyOiBpdGVtcy5tYXAoKGkpID0+IFN0cmluZyhpLmlkKSkgfSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgZGVmYXVsdDpcbiAgICAgIGlmIChGUkVFX1RFWFRfVFlQRVMuaGFzKHR5cGUpKSB7XG4gICAgICAgIGludi5mcmVlVGV4dC5wdXNoKGlkKTtcbiAgICAgIH0gZWxzZSBpZiAoR1JBUEhfVFlQRVMuaGFzKHR5cGUpKSB7XG4gICAgICAgIGludi5ncmFwaHMucHVzaCh7IGJsb2NrSWQ6IGlkLCBibG9jazogYmxvY2sgYXMgdW5rbm93biBhcyBSYXdHcmFwaEJsb2NrIH0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cblxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkQmxvY2tzT2YoYmxvY2spKSB2aXNpdChjaGlsZCwgaW52KTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSYXdTZWN0aW9uIHtcbiAgaWQ/OiBzdHJpbmc7XG4gIHJvd3M/OiBBcnJheTx7IGNvbHVtbnM/OiBBcnJheTx7IGJsb2Nrcz86IFJhd0Jsb2NrW10gfT4gfT47XG59XG5cbi8qKiBGaW5kIGEgc2VjdGlvbiBieSBpZCBpbiB0aGUgcmF3IGRvY3VtZW50LiBSZXR1cm5zIG51bGwgd2hlbiBhYnNlbnQgXHUyMDE0IHRoZVxuICogaGFuZGxlciB0dXJucyB0aGF0IGludG8gYSA0MDAgcmF0aGVyIHRoYW4gZ3JhZGluZyBub3RoaW5nIGFuZCByZXBvcnRpbmdcbiAqIHN1Y2Nlc3MuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZFNlY3Rpb24oXG4gIGRvYzogeyBzZWN0aW9ucz86IFJhd1NlY3Rpb25bXSB9LFxuICBzZWN0aW9uSWQ6IHN0cmluZyxcbik6IFJhd1NlY3Rpb24gfCBudWxsIHtcbiAgZm9yIChjb25zdCBzZWN0aW9uIG9mIGRvYy5zZWN0aW9ucyA/PyBbXSkge1xuICAgIGlmIChzZWN0aW9uLmlkID09PSBzZWN0aW9uSWQpIHJldHVybiBzZWN0aW9uO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKiogQnVpbGQgdGhlIGdyYWRhYmxlIGludmVudG9yeSBmb3Igb25lIHNlY3Rpb24gb2YgdGhlIFJBVyBkb2N1bWVudC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlbnRvcnlTZWN0aW9uKHNlY3Rpb246IFJhd1NlY3Rpb24pOiBHcmFkYWJsZUludmVudG9yeSB7XG4gIGNvbnN0IGludjogR3JhZGFibGVJbnZlbnRvcnkgPSB7XG4gICAgYmxhbmtHcm91cHNCeUJsb2NrOiBbXSxcbiAgICBtdWx0aXBsZUNob2ljZTogW10sXG4gICAgbWF0Y2hpbmc6IFtdLFxuICAgIG9yZGVyaW5nOiBbXSxcbiAgICBncmFwaHM6IFtdLFxuICAgIGZyZWVUZXh0OiBbXSxcbiAgICBzb2x1dGlvbnM6IFtdLFxuICB9O1xuICBmb3IgKGNvbnN0IHJvdyBvZiBzZWN0aW9uLnJvd3MgPz8gW10pIHtcbiAgICBmb3IgKGNvbnN0IGNvbHVtbiBvZiByb3cuY29sdW1ucyA/PyBbXSkge1xuICAgICAgZm9yIChjb25zdCBibG9jayBvZiBjb2x1bW4uYmxvY2tzID8/IFtdKSB2aXNpdChibG9jaywgaW52KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGludjtcbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gY2Vuc3VzL2NlbnN1cy50cyBcdTIwMTQgYSBwdWJsaXNoZWQgdmVyc2lvbidzIGJsb2NrIGNlbnN1cyArIGl0ZW0gYXR0cmlidXRpb24gKFM3KVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFAzQSdzIFwicHVibGlzaC10aW1lIHJlZ2lzdHJ5IGNlbnN1c1wiLCBidWlsdCB0aGUgd2F5IFMyIG1hZGUgcG9zc2libGU6IHRoZVxuLy8gY2Vuc3VzIGlzIERFUklWRUQgZnJvbSB0aGUgc3RvcmVkIHZlcnNpb24gc25hcHNob3QsIG5ldmVyIHdyaXR0ZW4gYnlcbi8vIHB1Ymxpc2gtYWN0aXZpdHkuIEV2ZXJ5IHB1Ymxpc2hlZCB2ZXJzaW9uJ3MgZG9jdW1lbnQgYWxyZWFkeSBsaXZlcyBpblxuLy8gYWN0aXZpdHlfdmVyc2lvbnMuY29udGVudCBmb3JldmVyLCBzbyB0aGUgdGFsbHkgY2FuIGJlIGNvbXB1dGVkIHdoZW5ldmVyIHRoZVxuLy8gZG9jdW1lbnQgaXMgbmV4dCByZWFkIFx1MjAxNCBhbmQgYHB1Ymxpc2gtYWN0aXZpdHlgLCB3aGljaCBTOSByZXdyaXRlcywgaXMgbmV2ZXJcbi8vIHRvdWNoZWQgKHRoaXMgaXMgd2hhdCBkaXNzb2x2ZWQgZmluZGluZyBSNihiKTogbm90aGluZyBnZXRzIHdyaXR0ZW4gdHdpY2UpLlxuLy8gU2FtZSBwb3N0dXJlIGFzIDAwMjUncyBkZXJpdmVkIHN0dWRlbnQgZG9ybWFuY3k6IGRvbid0IG1hcmsgd2hhdCB5b3UgY2FuXG4vLyBkZXJpdmUuXG4vL1xuLy8gVHdvIHByb2R1Y3RzLCBib3RoIHBlciB2ZXJzaW9uOlxuLy9cbi8vICAgY291bnRzIFx1MjAxNCBjZW5zdXNLZXkgXHUyMTkyIGhvdyBtYW55IGJsb2NrIGluc3RhbmNlcyBvZiB0aGF0IGtpbmQgdGhlIHZlcnNpb25cbi8vICAgICBjb250YWlucy4gVGhlIGtleSBjb21lcyBmcm9tIHRoZSByZWdpc3RyeSdzIGNlbnN1c0tleU9mKCksIHNvIGFcbi8vICAgICB2YXJpYW50LWNhcnJ5aW5nIGJsb2NrIHRhbGxpZXMgcGVyIHZhcmlhbnQgKGBkYXRhX3Bsb3QuYnVpbGRfaGlzdG9ncmFtYClcbi8vICAgICBhbmQgYSBuZXcgYmxvY2sgdHlwZSBpcyBjb3VudGVkIHRoZSBkYXkgaXQgcmVnaXN0ZXJzLlxuLy9cbi8vICAgaXRlbXMgXHUyMDE0IGV2ZXJ5IFJFU1BPTlNFIGlkIGluIHRoZSB2ZXJzaW9uIG1hcHBlZCB0byB0aGUgY2Vuc3VzIGtleSBvZiB0aGVcbi8vICAgICBibG9jayBpdCBiZWxvbmdzIHRvLiBUaGlzIGlzIHdoYXQgbGV0cyBhbiBhZ2dyZWdhdGUgb3ZlciBzZWN0aW9uX2NoZWNrc1xuLy8gICAgIHNheSBcIjMgb2YgNCB3cm9uZyBhbnN3ZXJzIHdlcmUgb24gZmlsbF9pbl9ibGFua1wiIFx1MjAxNCB2ZXJkaWN0cyBhcmUga2V5ZWQgYnlcbi8vICAgICBpdGVtIGlkIChibGFuay9nYXAgaWRzIGZvciB0aGUgYmxhbmtzIGNhdGVnb3J5LCBibG9jayBpZHMgZWxzZXdoZXJlKSwgYW5kXG4vLyAgICAgbm90aGluZyBlbHNlIGluIHRoZSBkYXRhYmFzZSBrbm93cyB3aGF0IGFuIGl0ZW0gaWQgSVMuXG4vL1xuLy8gV0hZIFRIRSBJVEVNIE1BUCBSRVVTRVMgVEhFIEdSQURJTkcgV0FMSyAocnVsaW5nIFM3LTUpLiBUaGUgc2V0IG9mIGlkcyB0aGF0XG4vLyBjYW4gYXBwZWFyIGluIGEgdmVyZGljdCBtYXAgaXMgZGVjaWRlZCBieSBPTkUgdGhpbmc6IHdoYXQgdGhlIGdyYWRlciBhY2NlcHRzXG4vLyAoaW52ZW50b3J5U2VjdGlvbiwgc2VydmVyL2dyYWRpbmcvd2Fsay50cykuIEEgc2Vjb25kIGVudW1lcmF0aW9uIHdyaXR0ZW4gaGVyZVxuLy8gd291bGQgZHJpZnQgZnJvbSBpdCBcdTIwMTQgYW5kIGRyaWZ0ZWQgYXR0cmlidXRpb24gaXMgc2lsZW50LCBjb3VudGluZyBhIHN0dWRlbnQnc1xuLy8gYW5zd2VyIHVuZGVyIHRoZSB3cm9uZyBibG9jayB0eXBlIG9yIGRyb3BwaW5nIGl0LiBTbyB0aGlzIG1vZHVsZSBvd25zIG5vIGlkXG4vLyBydWxlcyBhdCBhbGw6IGl0IGFza3MgdGhlIGdyYWRlcidzIGludmVudG9yeSBmb3IgdGhlIGlkcyBhbmQgb25seSBzdXBwbGllc1xuLy8gdGhlIGlkIFx1MjE5MiBjZW5zdXMta2V5IGpvaW4uIHRlc3RzL2NlbnN1cy50ZXN0LnRzIHBpbnMgdGhlIGVxdWFsaXR5LlxuLy9cbi8vIEJVTkRMRSBOT1RFOiB3YWxrLnRzIGltcG9ydHMgaXRzIHR3byBjb2xsYWJvcmF0b3JzIGFzIGBpbXBvcnQgdHlwZWAgb25seSwgc29cbi8vIHB1bGxpbmcgaXQgaW4gaGVyZSBjb3N0cyB0aGUgcmVhZCBidW5kbGUgbm90aGluZyBhdCBydW50aW1lIFx1MjAxNCBubyBtYXRoanMsIG5vXG4vLyBzY29yZXJzICh0aGUgZ3JhcGgta2l0L3Njb3JlcnMgZGlzY2lwbGluZSwgY2hlY2tlZCBieSB0aGUgYnVuZGxlJ3Mgc2l6ZVxuLy8gY2VpbGluZyBhbmQgYSBncmVwLWFic2VuY2UgdGVzdCkuXG4vL1xuLy8gICBkb2N1bWVudCBcdTI1MDBcdTI1MDBcdTI1QkEgZWFjaEJsb2NrIChyb3dzXHUyMTkyY29sdW1uc1x1MjE5MmJsb2NrcywgY2hpbGQgYmxvY2tzLCByZWZlcmVuY2VQYW5lbClcbi8vICAgICAgICAgICAgICAgICAgIFx1MjUwMlxuLy8gICAgICAgICAgICAgICAgICAgXHUyNTFDXHUyNTAwXHUyNUJBIGNvdW50czogIHRhbGx5IG9mIGNlbnN1c0tleU9mKGJsb2NrKVxuLy8gICAgICAgICAgICAgICAgICAgXHUyNTE0XHUyNTAwXHUyNUJBIGluZGV4OiAgIGJsb2NrSWQgXHUyMTkyIGNlbnN1c0tleVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdTI1QjJcbi8vICAgc2VjdGlvbnMgXHUyNTAwXHUyNTAwXHUyNUJBIGludmVudG9yeVNlY3Rpb24gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTE4ICAoYmxhbmsvZ2FwIGlkcywgTUMvbWF0Y2hpbmcvb3JkZXJpbmcvXG4vLyAgICAgICAgICAgICAgICAodGhlIGdyYWRlcidzIG93biAgICAgICBncmFwaC9mcmVlLXRleHQgYmxvY2sgaWRzKVxuLy8gICAgICAgICAgICAgICAgIGFjY2VwdGVkLWlkIHNldCkgICBcdTI1MDBcdTI1MDBcdTI1QkEgaXRlbXNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB0eXBlIHsgQWN0aXZpdHlEb2N1bWVudCwgQmxvY2sgfSBmcm9tICdAYWN0aXZpdHkvc2NoZW1hJztcbmltcG9ydCB7IGNoaWxkQmxvY2tzT2YgfSBmcm9tICcuLi9jb250YWluZXIvYmxvY2tJbmRleC5qcyc7XG5pbXBvcnQgeyBibG9ja1JlZ2lzdHJ5LCBjZW5zdXNLZXlPZiB9IGZyb20gJy4uL3JlZ2lzdHJ5L3JlZ2lzdHJ5LmpzJztcbmltcG9ydCB7IGludmVudG9yeVNlY3Rpb24gfSBmcm9tICcuLi9zZXJ2ZXIvZ3JhZGluZy93YWxrLmpzJztcbmltcG9ydCB0eXBlIHsgUmF3U2VjdGlvbiB9IGZyb20gJy4uL3NlcnZlci9ncmFkaW5nL3dhbGsuanMnO1xuXG4vKiogQ2Vuc3VzIGtleSBmb3IgYSBibG9jayB3aG9zZSB0eXBlIHRoZSByZWdpc3RyeSBkb2Vzbid0IGtub3cuIFVucmVhY2hhYmxlIGZvclxuICogYSBzY2hlbWEtdmFsaWQgZG9jdW1lbnQgKHRoZSByZWdpc3RyeSBjb21wbGV0ZW5lc3MgZ3VhcmQgbWFrZXMgZXZlcnkgYmxvY2tcbiAqIHR5cGUgcmVnaXN0ZXJlZCksIGFuZCBkZWxpYmVyYXRlbHkgYSBWSVNJQkxFIGJ1Y2tldCByYXRoZXIgdGhhbiBhIHRocm93OiB0aGlzXG4gKiBydW5zIG9uIHRoZSByZWFkIHBhdGgsIHdoZXJlIHRoZSBydWxlZCB3cml0ZSBvcmRlcmluZyBtZWFucyBhIHRocm93biBjZW5zdXNcbiAqIHdvdWxkIGNvc3QgdGhlIHZlcnNpb24gaXRzIGNhY2hlIHJvdyBvbiBldmVyeSByZWFkLiBBIHN1cmZhY2VkIGBfdW5rbm93bmBcbiAqIHJvdyBpcyBhIGJ1ZyByZXBvcnQ7IGEgY3Jhc2ggaGVyZSB3b3VsZCBiZSBhIHNpbGVudCBwZXJmb3JtYW5jZSBjbGlmZi4gKi9cbmV4cG9ydCBjb25zdCBVTktOT1dOX0NFTlNVU19LRVkgPSAnX3Vua25vd24nO1xuXG5leHBvcnQgaW50ZXJmYWNlIENlbnN1c0NvdW50IHtcbiAgY2Vuc3VzS2V5OiBzdHJpbmc7XG4gIGJsb2NrQ291bnQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDZW5zdXNJdGVtIHtcbiAgLyoqIFRoZSBpZCBhIHZlcmRpY3QgbWFwIGlzIGtleWVkIGJ5OiBhIGJsYW5rIGlkLCBhbiBpbi1lcXVhdGlvbiBnYXAgaWRcbiAgICogKGBnYCtoZXgpLCBvciBhIGdyYWRhYmxlL3JlY29yZGVkIGJsb2NrIGlkLiAqL1xuICBpdGVtSWQ6IHN0cmluZztcbiAgY2Vuc3VzS2V5OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmVyc2lvbkNlbnN1cyB7XG4gIC8qKiBEb2N1bWVudCBvcmRlciBvZiBmaXJzdCBhcHBlYXJhbmNlLiAqL1xuICBjb3VudHM6IENlbnN1c0NvdW50W107XG4gIGl0ZW1zOiBDZW5zdXNJdGVtW107XG59XG5cbi8qKiBUaGUgcmVnaXN0cnkncyBrZXkgcnVsZSwgZ3VhcmRlZCBvbiBpdHMgb25lIHByZWNvbmRpdGlvbiAoYSByZWdpc3RlcmVkXG4gKiB0eXBlKS4gVGhlIHJ1bGUgaXRzZWxmIGlzIE5PVCByZXN0YXRlZCBoZXJlIFx1MjAxNCBjZW5zdXNLZXlPZiBzdGF5cyB0aGUgc291cmNlLFxuICogdmFyaWFudCBzdWZmaXggaW5jbHVkZWQuICovXG5mdW5jdGlvbiBzYWZlQ2Vuc3VzS2V5KGJsb2NrOiBCbG9jayk6IHN0cmluZyB7XG4gIGNvbnN0IHR5cGUgPSAoYmxvY2sgYXMgeyB0eXBlPzogdW5rbm93biB9KS50eXBlO1xuICBpZiAodHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnIHx8ICEodHlwZSBpbiBibG9ja1JlZ2lzdHJ5KSkge1xuICAgIHJldHVybiBVTktOT1dOX0NFTlNVU19LRVk7XG4gIH1cbiAgcmV0dXJuIGNlbnN1c0tleU9mKGJsb2NrKTtcbn1cblxuLyoqIFZpc2l0IGEgYmxvY2sgYW5kLCBkZXB0aC1maXJzdCwgZXZlcnkgYmxvY2sgbmVzdGVkIGluc2lkZSBpdC4gQ2hpbGQgYmxvY2tzXG4gKiBhcmUgZm91bmQgU1RSVUNUVVJBTExZIHZpYSBibG9ja0luZGV4J3MgY2hpbGRCbG9ja3NPZiBcdTIwMTQgdGhlIGRvY3VtZW50ZWQgc2luZ2xlXG4gKiBkZWZpbml0aW9uIG9mIFwiaXMgdGhpcyBhIG5lc3RlZCBibG9jayBvciBjb250ZW50IG9mIHRoaXMgb25lP1wiLCBzaGFyZWQgd2l0aFxuICogdGhlIHNlcnZlZC1kb2N1bWVudCBpbmRleCBhbmQgdGhlIGFuc3dlci1rZXkgZXh0cmFjdGlvbi4gQSBmYWRlZCBleGFtcGxlJ3NcbiAqIHN0ZXBzIHRoZXJlZm9yZSBjb3VudCBhcyB0aGVtc2VsdmVzLCBleGFjdGx5IGFzIHRoZXkgZ3JhZGUgYXMgdGhlbXNlbHZlcy4gKi9cbmZ1bmN0aW9uIHZpc2l0RGVlcChibG9jazogQmxvY2ssIHZpc2l0OiAoYmxvY2s6IEJsb2NrKSA9PiB2b2lkKTogdm9pZCB7XG4gIHZpc2l0KGJsb2NrKTtcbiAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZEJsb2Nrc09mKGJsb2NrIGFzIHVua25vd24gYXMgb2JqZWN0KSkge1xuICAgIHZpc2l0RGVlcChjaGlsZCBhcyB1bmtub3duIGFzIEJsb2NrLCB2aXNpdCk7XG4gIH1cbn1cblxuLyoqIEV2ZXJ5IGJsb2NrIGluc3RhbmNlIGluIHRoZSBkb2N1bWVudCwgaW4gZG9jdW1lbnQgb3JkZXI6IHNlY3Rpb24gY29udGVudFxuICogZmlyc3QgKHJvd3MgXHUyMTkyIGNvbHVtbnMgXHUyMTkyIGJsb2NrcyksIHRoZW4gdGhlIHJlZmVyZW5jZSBwYW5lbC4gVGhlIHBhbmVsIGlzXG4gKiBzY2FmZm9sZCBcdTIwMTQgaXQgaXMgbmV2ZXIgY2hlY2tlZCwgc28gaXQgY29udHJpYnV0ZXMgY291bnRzIGFuZCBubyBpdGVtcyBcdTIwMTQgYnV0XG4gKiBpdCBJUyBhdXRob3JlZCBjb250ZW50IGEgdGVhY2hlciBjaG9zZSwgc28gbGVhdmluZyBpdCBvdXQgd291bGQgdW5kZXJjb3VudFxuICogd2hhdCB0aGUgYWN0aXZpdHkgYWN0dWFsbHkgdXNlcy4gKi9cbmZ1bmN0aW9uIGVhY2hCbG9jayhkb2M6IEFjdGl2aXR5RG9jdW1lbnQsIHZpc2l0OiAoYmxvY2s6IEJsb2NrKSA9PiB2b2lkKTogdm9pZCB7XG4gIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBkb2Muc2VjdGlvbnMgPz8gW10pIHtcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiBzZWN0aW9uLnJvd3MgPz8gW10pIHtcbiAgICAgIGZvciAoY29uc3QgY29sdW1uIG9mIHJvdy5jb2x1bW5zID8/IFtdKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2sgb2YgY29sdW1uLmJsb2NrcyA/PyBbXSkgdmlzaXREZWVwKGJsb2NrLCB2aXNpdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgYmxvY2sgb2YgZG9jLnJlZmVyZW5jZVBhbmVsPy5ibG9ja3MgPz8gW10pIHZpc2l0RGVlcChibG9jaywgdmlzaXQpO1xufVxuXG4vKipcbiAqIENvbXB1dGUgdGhlIGNlbnN1cyBvZiBhbiBVUEdSQURFRCBkb2N1bWVudCAocG9zdC11cGdyYWRlLCBwcmUtc2FuaXRpemUpLlxuICpcbiAqIFByZS1zYW5pdGl6ZSBvbiBwdXJwb3NlOiBgb3JkZXJpbmdgJ3MgYXV0aG9yZWQgaXRlbSBvcmRlciBhbmQgdGhlIGJsYW5rXG4gKiBhbnN3ZXIga2V5cyBhcmUgZ29uZSBmcm9tIHRoZSBzZXJ2ZWQgYXJ0aWZhY3QsIGFuZCB0aGUgZ3JhZGluZyBpbnZlbnRvcnkgdGhpc1xuICogam9pbnMgYWdhaW5zdCByZWFkcyB0aGUgc2FtZSByYXcgc2hhcGUgdGhlIGdyYWRlciBkb2VzLiBOb3RoaW5nIGRlcml2ZWQgaGVyZVxuICogaXMgc2VjcmV0IFx1MjAxNCBhIGNvdW50IG9mIGJsb2NrIGtpbmRzIGFuZCBhIGxpc3Qgb2YgcmVzcG9uc2UgaWRzIHRoZSBjbGllbnRcbiAqIGFscmVhZHkgaG9sZHMgXHUyMDE0IHNvIHRoZSBvdXRwdXQgY3Jvc3NlcyBubyBzYW5pdGl6ZXIgYm91bmRhcnkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjZW5zdXNPZkRvY3VtZW50KGRvYzogQWN0aXZpdHlEb2N1bWVudCk6IFZlcnNpb25DZW5zdXMge1xuICBjb25zdCBjb3VudHMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuICBjb25zdCBrZXlCeUJsb2NrSWQgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXG4gIGVhY2hCbG9jayhkb2MsIChibG9jaykgPT4ge1xuICAgIGNvbnN0IGtleSA9IHNhZmVDZW5zdXNLZXkoYmxvY2spO1xuICAgIGNvdW50cy5zZXQoa2V5LCAoY291bnRzLmdldChrZXkpID8/IDApICsgMSk7XG4gICAgY29uc3QgaWQgPSAoYmxvY2sgYXMgeyBpZD86IHVua25vd24gfSkuaWQ7XG4gICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3N0cmluZycpIGtleUJ5QmxvY2tJZC5zZXQoaWQsIGtleSk7XG4gIH0pO1xuXG4gIGNvbnN0IGl0ZW1zOiBDZW5zdXNJdGVtW10gPSBbXTtcbiAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCBwdXNoID0gKGl0ZW1JZDogc3RyaW5nLCBibG9ja0lkOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICBpZiAoIWl0ZW1JZCB8fCBzZWVuLmhhcyhpdGVtSWQpKSByZXR1cm47XG4gICAgc2Vlbi5hZGQoaXRlbUlkKTtcbiAgICBpdGVtcy5wdXNoKHtcbiAgICAgIGl0ZW1JZCxcbiAgICAgIGNlbnN1c0tleToga2V5QnlCbG9ja0lkLmdldChibG9ja0lkKSA/PyBVTktOT1dOX0NFTlNVU19LRVksXG4gICAgfSk7XG4gIH07XG5cbiAgZm9yIChjb25zdCBzZWN0aW9uIG9mIGRvYy5zZWN0aW9ucyA/PyBbXSkge1xuICAgIGNvbnN0IGludiA9IGludmVudG9yeVNlY3Rpb24oc2VjdGlvbiBhcyB1bmtub3duIGFzIFJhd1NlY3Rpb24pO1xuICAgIC8vIEJsYW5rcyBhbmQgbWF0aCBnYXBzIGF0dHJpYnV0ZSB0byB0aGVpciBPV05JTkcgYmxvY2sgKHRoZSB3YWxrIGFscmVhZHlcbiAgICAvLyByZXNvbHZlcyBjb250YWluZXJzIHRvIHRoZSBjaGlsZCksIHdoaWNoIGlzIHdoeSBhIGJsYW5rIGluc2lkZSBhIGZhZGVkXG4gICAgLy8gZXhhbXBsZSBjb3VudHMgYXMgZmFkZWRfd29ya2VkX2V4YW1wbGUgYW5kIG5vdCBhcyBmaWxsX2luX2JsYW5rLlxuICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgaW52LmJsYW5rR3JvdXBzQnlCbG9jaykge1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgZ3JvdXAua2V5cykgcHVzaChrZXkuaWQsIGdyb3VwLmJsb2NrSWQpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IG1jIG9mIGludi5tdWx0aXBsZUNob2ljZSkgcHVzaChtYy5ibG9ja0lkLCBtYy5ibG9ja0lkKTtcbiAgICBmb3IgKGNvbnN0IG0gb2YgaW52Lm1hdGNoaW5nKSBwdXNoKG0uYmxvY2tJZCwgbS5ibG9ja0lkKTtcbiAgICBmb3IgKGNvbnN0IG8gb2YgaW52Lm9yZGVyaW5nKSBwdXNoKG8uYmxvY2tJZCwgby5ibG9ja0lkKTtcbiAgICBmb3IgKGNvbnN0IGcgb2YgaW52LmdyYXBocykgcHVzaChnLmJsb2NrSWQsIGcuYmxvY2tJZCk7XG4gICAgZm9yIChjb25zdCBpZCBvZiBpbnYuZnJlZVRleHQpIHB1c2goaWQsIGlkKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY291bnRzOiBbLi4uY291bnRzXS5tYXAoKFtjZW5zdXNLZXksIGJsb2NrQ291bnRdKSA9PiAoe1xuICAgICAgY2Vuc3VzS2V5LFxuICAgICAgYmxvY2tDb3VudCxcbiAgICB9KSksXG4gICAgaXRlbXMsXG4gIH07XG59XG4iLCAiLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIHNhbml0aXplL3NlcnZlU2VlZC50cyBcdTIwMTQgdGhlIE9ORSBzcGVsbGluZyBvZiB0aGUgc2VydmUtc2h1ZmZsZSBzZWVkIChHMSlcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgc2VlZCB0aGF0IGRlY2lkZXMgd2hhdCBhcnJhbmdlbWVudCBlYWNoIHN0dWRlbnQgaXMgU0VSVkVEIFx1MjAxNCBhbmRcbi8vIHRoZXJlZm9yZSB3aGF0IHRoZSBncmFkZXIgbXVzdCByZWNvbXB1dGUgdG8gdGVsbCBcImFycmFuZ2VkIGRlbGliZXJhdGVseVwiXG4vLyBmcm9tIFwibmV2ZXIgdG91Y2hlZFwiICh0aGUgb3JkZXJpbmcgb21pc3Npb24gcnVsZSkuIFVudGlsIDIwMjYtMDgtMDYgdGhlXG4vLyBjb250cmFjdCBleGlzdGVkIGFzIHR3byBzcGVsbGluZ3MgYWdyZWVpbmcgYnkgbHVjazogdGhlIHJlYWQgcGF0aCBjb21wb3NlZFxuLy8gYCR7dmVyc2lvbklkfToke3VzZXJJZH1gIGlubGluZSB3aGlsZSB0aGUgZ3JhZGluZyBzaWRlIGhhZCBpdHMgb3duXG4vLyBzZXJ2ZVNlZWQoKSAoczItcmV0cm8gZmluZGluZyA3KS4gVHdvIHN0cmluZ3MgZHJpZnRpbmcgaGVyZSB3b3VsZCBzaWxlbnRseVxuLy8gbWlzLWdyYWRlIGEgc3Vic2V0IG9mIHN0dWRlbnRzIFx1MjAxNCBjbG9zZSB0byB1bmRpYWdub3NhYmxlIGZyb20gYSBidWcgcmVwb3J0LlxuLy9cbi8vIERlcGVuZGVuY3ktZnJlZSBsZWFmIE9OIFBVUlBPU0U6IGltcG9ydGVkIGJ5IHRoZSByZWFkIGJ1bmRsZSAodGhlIGhhbmRsZXIpXG4vLyBhbmQgdGhlIGdyYWRpbmcgYnVuZGxlIChzZXJ2ZWRPcmRlciksIHNvIGl0IG11c3QgbmV2ZXIgZ3JvdyBhbiBpbXBvcnQuXG4vL1xuLy8gTkIgdGhlIHNlZWRlZCBzaHVmZmxlIGJlaGluZCB0aGlzIHNlZWQgaXMgbG9hZC1iZWFyaW5nIGZvciBTNCdzIG9yZGVyaW5nXG4vLyBvbWlzc2lvbiBydWxlIGFuZCBjYXJyaWVzIGFuIHVuZXhwbGFpbmVkIG9uZS1vZmYgZmxha2UgaW4gU1RBVEUncyB3YXRjaFxuLy8gaXRlbXMgKHNhbml0aXplLnRlc3QgXCJkaWZmZXJzIGFjcm9zcyBzdHVkZW50c1wiLCAyMDI2LTA4LTAxLCAxLWluLTE0KSBcdTIwMTQgaWZcbi8vIHRoYXQgdGVzdCBtaXNiZWhhdmVzIGFmdGVyIGFueSBjaGFuZ2UgaGVyZSwgdHJlYXQgaXQgYXMgdGhlIHNlY29uZCBzaWdodGluZy5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8qKiBDb21wb3NlIHRoZSBzZWVkIHRoZSByZWFkIHBhdGggc2VydmVzIHdpdGggYW5kIHRoZSBncmFkZXIgcmVjb21wdXRlcyBmcm9tLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlcnZlU2VlZCh2ZXJzaW9uSWQ6IHN0cmluZywgc3R1ZGVudElkOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7dmVyc2lvbklkfToke3N0dWRlbnRJZH1gO1xufVxuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBzZXJ2ZXIvand0LnRzIFx1MjAxNCB0aGUgT05FIHVudmVyaWZpZWQgYHN1YmAgcmVhZGVyIChHMilcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWNvZGVkIFdJVEhPVVQgdmVyaWZpY2F0aW9uLCBkZWxpYmVyYXRlbHk6IGJ5IHRoZSB0aW1lIGVpdGhlciBoYW5kbGVyIGNhbGxzXG4vLyB0aGlzLCBpdHMgdXNlci1zY29wZWQgUlBDIGhhcyBhbHJlYWR5IHN1Y2NlZWRlZCwgd2hpY2ggbWVhbnMgUG9zdGdSRVNUXG4vLyB2ZXJpZmllZCB0aGUgdG9rZW4ncyBzaWduYXR1cmUuIFRoaXMgb25seSByZS1yZWFkcyB0aGUgYHN1YmAgY2xhaW0gXHUyMDE0IHRvIGtleVxuLy8gdGhlIHN0dWRlbnQncyBzZXJ2ZSBzaHVmZmxlIChyZWFkIHBhdGgpIGFuZCB0aGVpciBzZWN0aW9uX2NoZWNrcyByb3dcbi8vIChjaGVjayBwYXRoKS4gTkVWRVIgYW4gYXV0aG9yaXphdGlvbiBpbnB1dC5cbi8vXG4vLyBXYXMgcGFzdGVkIGJ5dGUtaWRlbnRpY2FsbHkgaW50byBib3RoIGhhbmRsZXJzIGFzIGp3dFN1YiAvIGp3dFN1YmplY3Rcbi8vIChzMi1yZXRybyBmaW5kaW5nIDgpOyBvbmUgY29weSwgb25lIG5hbWUsIHNpbmNlIDIwMjYtMDgtMDYuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vKiogVGhlIHRva2VuJ3MgYHN1YmAgY2xhaW0sIG9yIG51bGwgd2hlbiB0aGUgaGVhZGVyIGNhcnJpZXMgbm8gcmVhZGFibGUgSldULiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGp3dFN1YihhdXRoSGVhZGVyOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgdG9rZW4gPSBhdXRoSGVhZGVyLnJlcGxhY2UoL15CZWFyZXJcXHMrL2ksICcnKTtcbiAgY29uc3QgcGF5bG9hZCA9IHRva2VuLnNwbGl0KCcuJylbMV07XG4gIGlmICghcGF5bG9hZCkgcmV0dXJuIG51bGw7XG4gIHRyeSB7XG4gICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoXG4gICAgICBhdG9iKHBheWxvYWQucmVwbGFjZSgvLS9nLCAnKycpLnJlcGxhY2UoL18vZywgJy8nKSksXG4gICAgKSBhcyB7IHN1Yj86IHVua25vd24gfTtcbiAgICByZXR1cm4gdHlwZW9mIGpzb24uc3ViID09PSAnc3RyaW5nJyA/IGpzb24uc3ViIDogbnVsbDtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiIsICIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gc2VydmVyL3V1aWQudHMgXHUyMDE0IE9ORSBpZC1zaGFwZSBydWxlIGZvciB0aGUgQVBJIHN1cmZhY2UgKEcyKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRIRSBERUNJU0lPTiAoZW5nLXJldmlldyBHMiwgMjAyNi0wOC0wNik6IFNUUklDVCBldmVyeXdoZXJlIGluIHNoYXJlZCBzZXJ2ZXJcbi8vIHNvdXJjZS4gVVVJRF9SRSBleGlzdGVkIGF0IGZvdXIgc2l0ZXMgd2l0aCB0d28gc3RyaWN0bmVzc2VzIFx1MjAxNCB0aGUgcmVhZCBBUElcbi8vIGFjY2VwdGVkIGFueSBoZXggbmliYmxlcyB3aGlsZSB0aGUgY2hlY2sgQVBJIHJlcXVpcmVkIGEgcmVhbCB2ZXJzaW9uIG5pYmJsZVxuLy8gYW5kIFJGQyB2YXJpYW50IFx1MjAxNCBzbyB0aGUgc2FtZSBhY3Rpdml0eSBpZCBjb3VsZCBiZSB2YWxpZCBvbiBvbmUgZW5kcG9pbnQgYW5kXG4vLyByZWplY3RlZCBieSB0aGUgb3RoZXIsIHdpdGggbm8gcmVjb3JkZWQgd2h5IChzMi1hdWRpdCBjb3JyZWN0aW9ucyAzLzUpLlxuLy8gRXZlcnkgbGVnaXRpbWF0ZSBpZCBpcyBhIFBvc3RncmVzIGdlbl9yYW5kb21fdXVpZCgpICh2NCwgUkZDIHZhcmlhbnQpLCBzb1xuLy8gc3RyaWN0IGNvc3RzIG5vIHJlYWwgY2xpZW50IGFueXRoaW5nIGFuZCByZWplY3RzIGdhcmJhZ2UgZWFybGllci5cbi8vXG4vLyBUaGUgdHdvIHJlbWFpbmluZyBMT09TRSBjb3BpZXMgbGl2ZSBpbiBpbmdlc3Qtc3VibWlzc2lvbiBhbmQgZ2V0LWZlZWRiYWNrJ3Ncbi8vIERlbm8gZmlsZXMsIGRlbGliZXJhdGVseSB1bnRvdWNoZWQ6IGJvdGggZnVuY3Rpb25zIHNlcnZlIG9ubHkgdGhlIGFub255bW91c1xuLy8gcHVibGlzaGVkLXBhZ2Ugd2lyZSBhbmQgYXJlIGRlbGV0ZWQgYXQgUzkgKGN1dG92ZXIgY2hlY2tsaXN0IEMxNSkgXHUyMDE0XG4vLyB0aWdodGVuaW5nIGEgc3VyZmFjZSBzY2hlZHVsZWQgZm9yIGRlbW9saXRpb24gd291bGQgYnV5IHR3byByZWRlcGxveXMgb2YgYVxuLy8gZG9vbWVkIGZ1bmN0aW9uLiBUaGVpciBjb3BpZXMgY2FycnkgYSBwb2ludGVyIGhlcmUuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4vKiogUkZDIDQxMjIgdjFcdTIwMTN2NSwgdmFyaWFudCAxMHh4IFx1MjAxNCB3aGF0IGdlbl9yYW5kb21fdXVpZCgpIGFuZCBldmVyeSBsZWdpdGltYXRlXG4gKiBjbGllbnQgaWQgYWN0dWFsbHkgbG9vayBsaWtlLiAqL1xuZXhwb3J0IGNvbnN0IFVVSURfUkUgPVxuICAvXlswLTlhLWZdezh9LVswLTlhLWZdezR9LVsxLTVdWzAtOWEtZl17M30tWzg5YWJdWzAtOWEtZl17M30tWzAtOWEtZl17MTJ9JC9pO1xuIiwgIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBzZXJ2ZXIvZ2V0LWFjdGl2aXR5LWhhbmRsZXIudHMgXHUyMDE0IHRoZSBnZXQtYWN0aXZpdHkgcmVxdWVzdCBoYW5kbGVyIChTMilcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgZnVsbCBicmFuY2hpbmcgbG9naWMgb2YgdGhlIGdldC1hY3Rpdml0eSBFZGdlIEZ1bmN0aW9uLCBleHRyYWN0ZWQgaGVyZSBzb1xuLy8gaXQgbGl2ZXMgaW4gdGhlIFRFU1RFRCwgQ0ktZHJpZnQtZ3VhcmRlZCB2aWV3ZXItc2VydmVyIGJ1bmRsZSBpbnN0ZWFkIG9mIGluXG4vLyB1bnRlc3RhYmxlIERlbm8gZ2x1ZSAodGhlIFMyIHJldmlldyBmb3VuZCB0aGUgMzc0LWxpbmUgZnVuY3Rpb24gd2FzIHRoZSBtb3N0XG4vLyBicmFuY2gtaGVhdnkgaW4gdGhlIHJlcG8gd2l0aCB6ZXJvIGF1dG9tYXRlZCBjb3ZlcmFnZSkuIFRoZSBEZW5vIGVudHJ5IHBvaW50XG4vLyAoc3VwYWJhc2UvZnVuY3Rpb25zL2dldC1hY3Rpdml0eS9pbmRleC50cykgaXMgbm93IHRoaW4gd2lyaW5nOiBpdCByZWFkcyBlbnYsXG4vLyBidWlsZHMgdGhlIFN1cGFiYXNlIGNsaWVudHMgYmVoaW5kIHRoZSBgR2V0QWN0aXZpdHlEYmAgcG9ydCwgcGFzc2VzIHRoZVxuLy8gX3NoYXJlZC9jb3JzLnRzIGhlbHBlcnMgYmVoaW5kIHRoZSBgQ29yc0tpdGAgcG9ydCwgYW5kIHNlcnZlcyB0aGUgaGFuZGxlclxuLy8gdGhpcyBmYWN0b3J5IHJldHVybnMuIEV2ZXJ5dGhpbmcgb2JzZXJ2YWJsZSBcdTIwMTQgc3RhdHVzIGNvZGVzLCBlcnJvciBjb2Rlcyxcbi8vIGNhY2hlIGhlYWRlcnMsIHJlc3BvbnNlIGVudmVsb3BlcyBcdTIwMTQgaXMgZGVjaWRlZCBIRVJFIGFuZCBwaW5uZWQgYnlcbi8vIHRlc3RzL2dldC1hY3Rpdml0eS1oYW5kbGVyLnRlc3QudHMuXG4vL1xuLy8gVGhyZWUgR0VUIG1vZGVzIG9uIG9uZSBmdW5jdGlvbjpcbi8vXG4vLyAgIDEuIE1FVEEgKGFub255bW91cywgcmF0ZS1saW1pdGVkIFx1MjAxNCBydWxpbmcgMy4yQSk6XG4vLyAgICAgICAgR0VUID9hY3Rpdml0eV9pZD08dXVpZD4mbWV0YT0xXG4vLyAgICAgIFx1MjE5MiB7IHRpdGxlLCB0ZWFjaGVyX25hbWUgfSBhbmQgTk9USElORyBlbHNlIFx1MjAxNCB0aGUgcHJlLWF1dGggaW50ZXJzdGl0aWFsXG4vLyAgICAgICAgY29udHJhY3QgKFwiTXJzLiBKYWZhcmkncyAnTGluZWFyIFN5c3RlbXMnXCIgKyBcInVzZSB5b3VyIEBkaXN0cmljdC5vcmdcbi8vICAgICAgICBhY2NvdW50XCIpLiBTYW1lIGRhdGEgYW55IHB1Ymxpc2hlZCBwYWdlIGFscmVhZHkgc2hvd3MgcHVibGljbHkuXG4vL1xuLy8gICAyLiBSRVNPTFZFIChhdXRoZW50aWNhdGVkKTpcbi8vICAgICAgICBHRVQgP2FjdGl2aXR5X2lkPTx1dWlkPlxuLy8gICAgICBcdTIxOTIgeyBhY3Rpdml0eV9pZCwgdmVyc2lvbl9pZCwgdmVyc2lvbl9udW0sIHRpdGxlIH0gZm9yIHRoZSBDVVJSRU5UXG4vLyAgICAgICAgcHVibGlzaGVkIHZlcnNpb24uIFNlcnZlZCBgbm8tY2FjaGVgIHNvIGEgcmVwdWJsaXNoIGlzIHZpc2libGUgb24gdGhlXG4vLyAgICAgICAgbmV4dCBvcGVuIChyZXZhbGlkYXRlLCBkb24ndCByZS1kb3dubG9hZCBcdTIwMTQgc2FtZSBwb3N0dXJlIGFzIHRoZSBSMlxuLy8gICAgICAgIGxpdmUgYWxpYXMpLlxuLy9cbi8vICAgMy4gQ09OVEVOVCAoYXV0aGVudGljYXRlZCk6XG4vLyAgICAgICAgR0VUID9hY3Rpdml0eV9pZD08dXVpZD4mdmVyc2lvbl9pZD08dXVpZD5cbi8vICAgICAgXHUyMTkyIHRoZSBVUEdSQURFRCAoNEEpICsgU0FOSVRJWkVEIChUVjQtQSkgZG9jdW1lbnQgZm9yIHRoYXQgdmVyc2lvbiwgcGx1c1xuLy8gICAgICAgIHBlci1zdHVkZW50IHNlcnZlLXRpbWUgc2h1ZmZsZXMuIFRoZSBVUkwgaXMgdmVyc2lvbi1rZXllZCwgc28gdGhlXG4vLyAgICAgICAgcmVzcG9uc2UgaXMgc2VydmVkIGBwcml2YXRlLCBtYXgtYWdlPTMxNTM2MDAwLCBpbW11dGFibGVgIFx1MjAxNCB0aGVcbi8vICAgICAgICBicm93c2VyIG5ldmVyIHJlZmV0Y2hlcyBhIHZlcnNpb24gaXQgaGFzLiBPbmx5IHRoZSBDVVJSRU5UIHZlcnNpb24gaXNcbi8vICAgICAgICBzZXJ2ZWQgKGEgc3RhbGUgdmVyc2lvbl9pZCA0MDRzIHdpdGggY29kZSAnc3RhbGVfdmVyc2lvbic7IHRoZSB2aWV3ZXJcbi8vICAgICAgICByZS1yZXNvbHZlcyksIHNvIGEgcmVwdWJsaXNoIGludmFsaWRhdGVzIGJ5IGNoYW5naW5nIHRoZSBVUkwsIG5ldmVyXG4vLyAgICAgICAgYnkgZXhwaXJpbmcgYSBjYWNoZS5cbi8vXG4vLyBQaXBlbGluZSAoY29udGVudCBtb2RlKTogZ2V0X3B1Ymxpc2hlZF9hY3Rpdml0eSBSUEMgYXMgdGhlIENBTExFUiAodGhlIERCXG4vLyBlbmZvcmNlcyBhdXRoICsgcHVibGlzaGVkLW9ubHk7IGRyYWZ0IGNvbnRlbnQgaXMgdW5yZWFjaGFibGUgaGVyZSkgXHUyMTkyXG4vLyBkdXJhYmxlIHBlci12ZXJzaW9uIGNhY2hlIGxvb2t1cCBpbiBhY3Rpdml0eV92ZXJzaW9uX3JlYWRzIGtleWVkIGJ5XG4vLyAodmVyc2lvbl9pZCwgU0FOSVRJWkVSX1JFVikgXHUyMTkyIG9uIG1pc3MgdGhlIGNhY2hlLWZpbGwgcGF0aCBiZWxvdyBcdTIxOTJcbi8vIGFwcGx5U2VydmVTaHVmZmxlcyBzZWVkZWQgYCR7dmVyc2lvbl9pZH06JHt1c2VyX2lkfWAgKGRldGVybWluaXN0aWM6IHJlbG9hZHNcbi8vIG5ldmVyIHJlc2h1ZmZsZTsgdGhlIGNhY2hlZCBhcnRpZmFjdCBzdGF5cyBzdHVkZW50LWluZGVwZW5kZW50KS5cbi8vXG4vLyAgIGNhY2hlIE1JU1MgXHUyNTAwXHUyNTAwXHUyNUJBIHJlYWRWZXJzaW9uIFx1MjUwMFx1MjUwMFx1MjVCQSB1cGdyYWRlIFx1MjUwMFx1MjUwMFx1MjVCQSBzYW5pdGl6ZVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyNTAyXG4vLyAgICAgICAgICAgICAgICAgICAgXHUyNTBDXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTE4XG4vLyAgICAgICAgICAgICAgICAgICAgXHUyNUJDXG4vLyAgICAgICAgICAgICAgd3JpdGVDZW5zdXMgKFM3KSBcdTI1MDBcdTI1MDBmYWlsc1x1MjUwMFx1MjUwMFx1MjVCQSBOTyBjYWNoZSByb3c6IG5leHQgcmVhZCByZXRyaWVzXG4vLyAgICAgICAgICAgICAgICAgICAgXHUyNTAyIG9rICAgICAgICAgICAgICAgICAgKHNlbGYtaGVhbGluZzsgc2VlIHRoZSBvcmRlcmluZ1xuLy8gICAgICAgICAgICAgICAgICAgIFx1MjVCQyAgICAgICAgICAgICAgICAgICAgICBub3RlIGF0IHRoZSBjYWxsIHNpdGUpXG4vLyAgICAgICAgICAgICAgdXBzZXJ0Q2FjaGUgXHUyNTAwXHUyNTAwXHUyNUJBIGRlbGV0ZVN0YWxlQ2FjaGUgKG9sZC1yZXYgR0MgZm9yIHRoaXMgdmVyc2lvbilcbi8vXG4vLyBUaGUgYW5hbHl0aWNzIHdyaXRlcyBhcmUgYSBTSURFLUNIQU5ORUw6IGV2ZXJ5IG9uZSBvZiB0aGVtIGNhbiBmYWlsIHdpdGhvdXRcbi8vIGNoYW5naW5nIHRoZSBzdHVkZW50J3MgcmVzcG9uc2UuIEEgY2FjaGUgSElUIGRvZXMgbm9uZSBvZiB0aGlzIHdvcmsuXG4vL1xuLy8gQWNjZXNzIHJ1bGUgKFMyIGRlY2lzaW9uIDIpOiBBTlkgYXV0aGVudGljYXRlZCB1c2VyIChzdHVkZW50IG9yIHRlYWNoZXIpIG1heVxuLy8gcmVhZCB0aGUgcHVibGlzaGVkIGN1cnJlbnQgdmVyc2lvbiBvZiBhIG5vbi1kZWxldGVkIGFjdGl2aXR5IFx1MjAxNCB0aGUgUjJcbi8vIGxpbmstc2hhcmUgbW9kZWwgYmVoaW5kIHNpZ24taW4uIENsYXNzZXMgZ2F0ZSBpZGVudGl0eSAodGhlIDEzKyBhc3NlcnRpb24pLFxuLy8gbm90IGFjdGl2aXR5IGFjY2Vzcy5cbi8vXG4vLyBLbm93biByZXNpZHVhbCAoZG9jdW1lbnRlZCwgYWNjZXB0ZWQpOiB0aGUgYnJvd3NlciBIVFRQIGNhY2hlIGlzIHBlclxuLy8gcHJvZmlsZSwgbm90IHBlciBhY2NvdW50LiBPbiBhIHNoYXJlZCBDaHJvbWVib29rIHByb2ZpbGUsIHN0dWRlbnQgQiBjYW4gYmVcbi8vIHNlcnZlZCBzdHVkZW50IEEncyBjYWNoZWQgY29udGVudCByZXNwb25zZSBcdTIwMTQgaWRlbnRpY2FsIGV4Y2VwdCB0aGUgb3JkZXJpbmdcbi8vIHBlcm11dGF0aW9uIChzZWVkZWQgcGVyIHN0dWRlbnQpLiBObyBrZXkgbWF0ZXJpYWwgZGlmZmVycywgYW5kIGdyYWRpbmdcbi8vIHJlZmVyZW5jZXMgaXRlbSBpZHMgKG9yZGVyLWluZGVwZW5kZW50KSwgc28gdGhlIHdvcnN0IGNhc2UgaXMgYSBjb3NtZXRpY1xuLy8gcGVybXV0YXRpb24gc3dhcDsgUzEncyBzaWduT3V0RXZlcnl0aGluZyBwdXJnZXMgdmlld2VyIFNUT1JBR0UsIG5vdCB0aGVcbi8vIEhUVFAgY2FjaGUsIGFuZCBwdXR0aW5nIHRoZSB1c2VyIGlkIGluIHRoZSBVUkwgdG8gc3BsaXQgY2FjaGUga2V5cyB3b3VsZFxuLy8gbGVhayBhbiBpZGVudGlmaWVyIGludG8gbG9ncyBmb3Igbm8gc2VjdXJpdHkgZ2Fpbi5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmltcG9ydCB7IFVwZ3JhZGVFcnJvciwgdXBncmFkZUFjdGl2aXR5RG9jdW1lbnQgfSBmcm9tICdAYWN0aXZpdHkvc2NoZW1hJztcbmltcG9ydCB7IGNlbnN1c09mRG9jdW1lbnQgfSBmcm9tICcuLi9jZW5zdXMvY2Vuc3VzLmpzJztcbmltcG9ydCB0eXBlIHsgVmVyc2lvbkNlbnN1cyB9IGZyb20gJy4uL2NlbnN1cy9jZW5zdXMuanMnO1xuaW1wb3J0IHsgU0FOSVRJWkVSX1JFViwgc2FuaXRpemVBY3Rpdml0eURvY3VtZW50IH0gZnJvbSAnLi4vc2FuaXRpemUvc2FuaXRpemUuanMnO1xuaW1wb3J0IHsgc2VydmVTZWVkIH0gZnJvbSAnLi4vc2FuaXRpemUvc2VydmVTZWVkLmpzJztcbmltcG9ydCB7IGp3dFN1YiB9IGZyb20gJy4vand0LmpzJztcbmltcG9ydCB7IFVVSURfUkUgfSBmcm9tICcuL3V1aWQuanMnO1xuaW1wb3J0IHsgYXBwbHlTZXJ2ZVNodWZmbGVzIH0gZnJvbSAnLi4vc2FuaXRpemUvc2h1ZmZsZS5qcyc7XG5pbXBvcnQgdHlwZSB7IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQgfSBmcm9tICcuLi9zYW5pdGl6ZS9zYW5pdGl6ZWQtdHlwZXMuanMnO1xuXG4vKiogQnVtcCB3aGVuIHRoZSByZXNwb25zZSBlbnZlbG9wZSBjaGFuZ2VzIHNoYXBlICh0aGUgZG9jIElOU0lERSBpdCBpc1xuICogdmVyc2lvbmVkIGJ5IHRoZSBzY2hlbWEgKyBTQU5JVElaRVJfUkVWLCBub3QgYnkgdGhpcykuICovXG5leHBvcnQgY29uc3QgQVBJX1ZFUlNJT04gPSAxO1xuXG4vLyBVVUlEX1JFIGlzIGltcG9ydGVkIChzZXJ2ZXIvdXVpZC50cywgRzIpOiB0aGlzIGZpbGUncyBsb29zZSBsb2NhbCBjb3B5XG4vLyBhY2NlcHRlZCBpZHMgdGhlIGNoZWNrIEFQSSByZWplY3RlZCBcdTIwMTQgb25lIHNoYXBlIHJ1bGUgbm93LCBzdHJpY3QuXG5cbi8vIC0tLS0gUG9ydHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUaGUgaGFuZGxlciBuZXZlciB0b3VjaGVzIHN1cGFiYXNlLWpzIG9yIERlbm8gZGlyZWN0bHk7IHRoZSBlbnRyeSBwb2ludFxuLy8gaW1wbGVtZW50cyB0aGVzZSBhZ2FpbnN0IHRoZSByZWFsIGNsaWVudHMsIHRlc3RzIGltcGxlbWVudCB0aGVtIHdpdGggZmFrZXMuXG5cbi8qKiBUaGUgYHsgZGF0YSwgZXJyb3IgfWAgc2hhcGUgZXZlcnkgc3VwYWJhc2UtanMgcXVlcnkgcmVzb2x2ZXMgdG8uICovXG5leHBvcnQgaW50ZXJmYWNlIERiUmVzdWx0PFQ+IHtcbiAgZGF0YTogVCB8IG51bGw7XG4gIGVycm9yOiB7IG1lc3NhZ2U/OiBzdHJpbmcgfSB8IG51bGw7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVibGlzaGVkQWN0aXZpdHlSb3cge1xuICB2ZXJzaW9uX2lkOiBzdHJpbmc7XG4gIHZlcnNpb25fbnVtOiBudW1iZXI7XG4gIHRpdGxlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2V0QWN0aXZpdHlEYiB7XG4gIC8qKiBgZ2V0X2FjdGl2aXR5X3B1YmxpY19tZXRhYCBSUEMgYXMgYW5vbiAodGhlIG9uZSBhbm9uLWNhbGxhYmxlIFJQQyBcdTIwMTRcbiAgICogcG9zdGdyZXMtb3duZWQgREVGSU5FUjsgMDAxNyBkb2N1bWVudHMgdGhlIGRlbGliZXJhdGUgZ3JhbnQpLiAqL1xuICBwdWJsaWNNZXRhKFxuICAgIGFjdGl2aXR5SWQ6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxEYlJlc3VsdDx7IHRpdGxlOiBzdHJpbmc7IHRlYWNoZXJfbmFtZTogc3RyaW5nIHwgbnVsbCB9Pj47XG4gIC8qKiBgZ2V0X3B1Ymxpc2hlZF9hY3Rpdml0eWAgUlBDIGFzIHRoZSBDQUxMRVIgKEF1dGhvcml6YXRpb24gaGVhZGVyIHBhc3NlZFxuICAgKiB0aHJvdWdoKSwgc28gdGhlIERCIGVuZm9yY2VzIGF1dGggKyBwdWJsaXNoZWQtb25seSBcdTIwMTQgbm90IHRoaXMgaGFuZGxlci4gKi9cbiAgcHVibGlzaGVkQWN0aXZpdHkoXG4gICAgYXV0aEhlYWRlcjogc3RyaW5nLFxuICAgIGFjdGl2aXR5SWQ6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxEYlJlc3VsdDxQdWJsaXNoZWRBY3Rpdml0eVJvdz4+O1xuICAvKiogQ2FjaGUgcm93IGZyb20gYWN0aXZpdHlfdmVyc2lvbl9yZWFkcyAoc2VydmljZSByb2xlKS4gKi9cbiAgcmVhZENhY2hlKFxuICAgIHZlcnNpb25JZDogc3RyaW5nLFxuICAgIHNhbml0aXplclJldjogc3RyaW5nLFxuICApOiBQcm9taXNlPERiUmVzdWx0PHsgY29udGVudDogdW5rbm93biB9Pj47XG4gIC8qKiBWZXJzaW9uIHJvdyBmcm9tIGFjdGl2aXR5X3ZlcnNpb25zIChzZXJ2aWNlIHJvbGUpLiAqL1xuICByZWFkVmVyc2lvbih2ZXJzaW9uSWQ6IHN0cmluZyk6IFByb21pc2U8RGJSZXN1bHQ8eyBjb250ZW50OiB1bmtub3duIH0+PjtcbiAgLyoqIFVwc2VydCBrZXllZCAodmVyc2lvbl9pZCwgc2FuaXRpemVyX3JldikgXHUyMDE0IGNvbmN1cnJlbnQgbWlzc2VzIHdyaXRlIHRoZVxuICAgKiBzYW1lIGRldGVybWluaXN0aWMgYXJ0aWZhY3QsIHNvIGxhc3Qtd3JpdGUtd2lucyBpcyBoYXJtbGVzcy4gKi9cbiAgdXBzZXJ0Q2FjaGUocm93OiB7XG4gICAgdmVyc2lvbl9pZDogc3RyaW5nO1xuICAgIHNhbml0aXplcl9yZXY6IHN0cmluZztcbiAgICBzY2hlbWFfdmVyc2lvbjogbnVtYmVyO1xuICAgIGNvbnRlbnQ6IHVua25vd247XG4gIH0pOiBQcm9taXNlPHsgZXJyb3I6IHsgbWVzc2FnZT86IHN0cmluZyB9IHwgbnVsbCB9PjtcbiAgLyoqIFJlcGxhY2UgdGhpcyB2ZXJzaW9uJ3MgY2Vuc3VzICsgaXRlbS1hdHRyaWJ1dGlvbiByb3dzIChTNykuIElkZW1wb3RlbnQ6XG4gICAqIHRoZSBjZW5zdXMgaXMgYSBwdXJlIGZ1bmN0aW9uIG9mIGFuIGltbXV0YWJsZSB2ZXJzaW9uLCBzbyBhIHJlLXJ1biB3cml0ZXNcbiAgICogaWRlbnRpY2FsIHJvd3MuICovXG4gIHdyaXRlQ2Vuc3VzKFxuICAgIHZlcnNpb25JZDogc3RyaW5nLFxuICAgIGNlbnN1czogVmVyc2lvbkNlbnN1cyxcbiAgKTogUHJvbWlzZTx7IGVycm9yOiB7IG1lc3NhZ2U/OiBzdHJpbmcgfSB8IG51bGwgfT47XG4gIC8qKiBEZWxldGUgdGhpcyB2ZXJzaW9uJ3MgY2FjaGUgcm93cyB3cml0dGVuIHVuZGVyIGFueSBPVEhFUiBzYW5pdGl6ZXIgcmV2IFx1MjAxNFxuICAgKiB0aGUgZXhhY3QgaGFsZiBvZiB0aGUgUjYoYSkgR0MuIE9ubHkgdGhpcyBjb2RlIGtub3dzIHRoZSBjdXJyZW50IHJldiwgc29cbiAgICogb25seSB0aGlzIGNvZGUgY2FuIGJlIHByZWNpc2UgYWJvdXQgaXQ7IHRoZSBzY2hlZHVsZWQgam9iIHN3ZWVwcyB0aGUgdGFpbFxuICAgKiBvZiB2ZXJzaW9ucyB0aGF0IGFyZSBuZXZlciByZWFkIGFnYWluLiAqL1xuICBkZWxldGVTdGFsZUNhY2hlKFxuICAgIHZlcnNpb25JZDogc3RyaW5nLFxuICAgIGtlZXBSZXY6IHN0cmluZyxcbiAgKTogUHJvbWlzZTx7IGVycm9yOiB7IG1lc3NhZ2U/OiBzdHJpbmcgfSB8IG51bGwgfT47XG59XG5cbi8qKiBUaGUgX3NoYXJlZC9jb3JzLnRzIGhlbHBlciBzdXJmYWNlIChlbnYtcmVhZGluZywgc28gaXQgc3RheXMgRGVuby1zaWRlKS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29yc0tpdCB7XG4gIGNvcnNIZWFkZXJzKHJlcTogUmVxdWVzdCk6IEhlYWRlcnNJbml0O1xuICBoYW5kbGVQcmVmbGlnaHQocmVxOiBSZXF1ZXN0KTogUmVzcG9uc2UgfCBudWxsO1xuICBqc29uUmVzcG9uc2UocmVxOiBSZXF1ZXN0LCBib2R5OiB1bmtub3duLCBpbml0PzogUmVzcG9uc2VJbml0KTogUmVzcG9uc2U7XG4gIGVycm9yUmVzcG9uc2UoXG4gICAgcmVxOiBSZXF1ZXN0LFxuICAgIHN0YXR1czogbnVtYmVyLFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBkZXRhaWxzPzogdW5rbm93bixcbiAgKTogUmVzcG9uc2U7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2V0QWN0aXZpdHlIYW5kbGVyRGVwcyB7XG4gIGRiOiBHZXRBY3Rpdml0eURiO1xuICBjb3JzOiBDb3JzS2l0O1xuICAvKiogSW5qZWN0YWJsZSBjbG9jayBmb3IgdGhlIHJhdGUgbGltaXRlciAodGVzdHMpLiBEZWZhdWx0cyB0byBEYXRlLm5vdy4gKi9cbiAgbm93PzogKCkgPT4gbnVtYmVyO1xufVxuXG4vLyAtLS0tIE1ldGEtYnJhbmNoIHJhdGUgbGltaXRpbmcgKHBlciBpc29sYXRlIFx1MjAxNCBNRUFTVVJFRCBBUyBORUFSTFkgSU5FUlQpIC0tLS1cbi8vIEEgc2xpZGluZyBvbmUtbWludXRlIHdpbmRvdyBwZXIgY2xpZW50IElQLlxuLy9cbi8vIFJFQUQgVEhJUyBCRUZPUkUgQ0hBTkdJTkcgVEhFIFRIUkVTSE9MRCBPUiBHSVZJTkcgVEhJUyBTSEFSRUQgU1RBVEUuXG4vL1xuLy8gKiogQSBDTEFTU1JPT00gSVMgT05FIElQLiAqKiBFdmVyeSBzdHVkZW50IGluIGEgc2Nob29sIHNpdHMgYmVoaW5kIHRoZSBzYW1lXG4vLyBOQVQsIHNvIFwib3BlbiB0aGlzIGxpbmsgbm93XCIgcHJvZHVjZXMgb25lIG1ldGEgcmVxdWVzdCBwZXIgc3R1ZGVudCBcdTIwMTQgMzArXG4vLyB3aXRoaW4gc2Vjb25kcywgaHVuZHJlZHMgcGVyIG1pbnV0ZSBhdCBhIGJlbGwgY2hhbmdlIGFjcm9zcyBhIGNhbXB1cyBcdTIwMTQgYWxsXG4vLyBmcm9tIGEgU0lOR0xFIGFkZHJlc3MuIEEgcGVyLXBlcnNvbiB0aHJlc2hvbGQgaXMgdGhlcmVmb3JlIG9mZiBieSB+MiBvcmRlcnNcbi8vIG9mIG1hZ25pdHVkZSBhZ2FpbnN0IHRoZSByZWFsIHRvcG9sb2d5LCBhbmQgdGhpcyBlbmRwb2ludCBzZXJ2ZXMgdGhlIFBSRS1BVVRIXG4vLyBpbnRlcnN0aXRpYWw6IGEgNDI5IGhlcmUgaXMgdGhlIGZpcnN0IHNjcmVlbiBhIHN0dWRlbnQgZXZlciBzZWVzLCBiZWZvcmUgdGhleVxuLy8gY2FuIGV2ZW4gc2lnbiBpbi4gVGhlIGZhaWx1cmUgd291bGQgcHJlc2VudCBhcyBcInNvbWUgc3R1ZGVudHMgY2FuJ3Qgb3BlbiB0aGVcbi8vIGFjdGl2aXR5LCBvdGhlcnMgY2FuLCBhcHBhcmVudGx5IGF0IHJhbmRvbVwiIFx1MjAxNCBtaXNlcmFibGUgdG8gZGlhZ25vc2UgbWlkLWNsYXNzLlxuLy8gVGhlIGNlaWxpbmcgYmVsb3cgaXMgZGVsaWJlcmF0ZWx5IGdlbmVyb3VzIGZvciB0aGF0IHJlYXNvbi4gUkFJU0lORyBpdCBpc1xuLy8gc2FmZTsgTE9XRVJJTkcgaXQgdG93YXJkIGEgcGVyLXBlcnNvbiBudW1iZXIgaXMgdGhlIGJ1Zy5cbi8vXG4vLyBUaGlzIGNvbnN0cmFpbnQgaXMgbm90IHNwZWNpZmljIHRvIHRoaXMgZnVuY3Rpb246IHBlci1JUCBsaW1pdGluZyBpcyB0aGVcbi8vIHdyb25nIHByaW1pdGl2ZSBhbnl3aGVyZSBpbiB0aGlzIHByb2R1Y3QsIGJlY2F1c2Ugb3VyIHVzZXJzIGFycml2ZSB0aGlydHktYXQtXG4vLyBhLXRpbWUgZnJvbSBvbmUgYWRkcmVzcy4gU2VlIERFQ0lTSU9OUy5tZCBcdTIxOTIgXCJSZWFkIEFQSSBTMlwiIChyYXRlLWxpbWl0XG4vLyBmaW5kaW5nKSBiZWZvcmUgcmVhY2hpbmcgZm9yIElQLWJhc2VkIHRocm90dGxpbmcgZWxzZXdoZXJlLlxuLy9cbi8vIE1FQVNVUkVEIDIwMjYtMDctMjggb24gdGhlIGxpdmUgZGVwbG95bWVudDogOTUgc2VxdWVudGlhbCBhbm9ueW1vdXMgcmVxdWVzdHNcbi8vIGZyb20gT05FIElQIHByb2R1Y2VkIFpFUk8gNDI5cy4gU3VwYWJhc2UncyBFZGdlIFJ1bnRpbWUgcmVjeWNsZXMgaXNvbGF0ZXNcbi8vIGFnZ3Jlc3NpdmVseSwgc28gdGhpcyBwZXItaGFuZGxlciBNYXAgaXMgZW1wdHkgb24gbW9zdCByZXF1ZXN0cyBcdTIwMTQgdGhlXG4vLyBlZmZlY3RpdmUgbGltaXQgaXMgZmFyIGxvb3NlciB0aGFuIHRoZSBjb25zdGFudHMgaW1wbHksIGFuZCBvbiBhIGRpc3RyaWJ1dGVkXG4vLyBidXJzdCBpdCBpcyBubyBsaW1pdCBhdCBhbGwuIFNvIHRoaXMgaXMgb3Bwb3J0dW5pc3RpYyB0aHJvdHRsaW5nIG9mIGEgc2luZ2xlXG4vLyBob3QgaXNvbGF0ZSwgTk9UIGEgZ3VhcmFudGVlIFx1MjAxNCBkbyBub3QgZGVzY3JpYmUgaXQgYXMgb25lLlxuLy9cbi8vIEtlcHQgcmF0aGVyIHRoYW4gZGVsZXRlZCBiZWNhdXNlIGl0IGNvc3RzIG5vdGhpbmcgYW5kIGRvZXMgYmx1bnQgYSBydW5hd2F5XG4vLyBjbGllbnQuIFdoYXQgaXQgZ3VhcmRzIGlzIHRoZSB0aXRsZSArIHRlYWNoZXIgZGlzcGxheSBuYW1lIG9mIGEgUFVCTElTSEVEXG4vLyBhY3Rpdml0eSwgdG8gYSBjYWxsZXIgd2hvIGFscmVhZHkgaG9sZHMgaXRzIFVVSUQgXHUyMDE0IGRhdGEgZXZlcnkgcHVibGlzaGVkIHBhZ2Vcbi8vIHNob3dzIHB1YmxpY2x5IHRvZGF5LCB3aXRoIFVVSUQgZW51bWVyYXRpb24gaW5mZWFzaWJsZS5cbi8vXG4vLyBJZiBhIFJFQUwgbGltaXQgaXMgZXZlciBuZWVkZWQgKHRyaWdnZXI6IHRoaXMgcmVzcG9uc2Ugc3RhcnRzIHJldHVybmluZ1xuLy8gYW55dGhpbmcgcmljaGVyIHRoYW4gdGhvc2UgdHdvIGZpZWxkcyksIGl0IG11c3QgbW92ZSB0byBzaGFyZWQgc3RhdGUgXHUyMDE0IGFcbi8vIHNtYWxsIERCIGNvdW50ZXIgdGFibGUgXHUyMDE0IGJlY2F1c2Ugbm8gaW4tbWVtb3J5IHNjaGVtZSBjYW4gd29yayBoZXJlLiBQb3J0IHRoZVxuLy8gU0NIT09MLVNBRkUgY2VpbGluZyB3aXRoIGl0OyBkbyBub3QgcmVpbnRyb2R1Y2UgYSBwZXItcGVyc29uIG51bWJlci5cbi8vXG4vLyBUaGUgYXV0aGVkIGJyYW5jaGVzIGFyZSBOT1QgcmF0ZS1saW1pdGVkIGhlcmU7IHRoZSBKV1QgaXMgdGhlaXIgZ2F0ZS5cblxuZXhwb3J0IGNvbnN0IE1FVEFfV0lORE9XX01TID0gNjBfMDAwO1xuLyoqIFNjaG9vbC1zYWZlIGNlaWxpbmc6IHNpemVkIGZvciBhIHdob2xlIGNhbXB1cyBiZWhpbmQgb25lIE5BVCBhdCBhIGJlbGxcbiAqIGNoYW5nZSwgbm90IGZvciBvbmUgcGVyc29uLiBTZWUgdGhlIHRvcG9sb2d5IG5vdGUgYWJvdmUuICovXG5leHBvcnQgY29uc3QgTUVUQV9NQVhfUEVSX1dJTkRPVyA9IDYwMDtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1ldGFSYXRlTGltaXRlcihcbiAgbm93OiAoKSA9PiBudW1iZXIgPSBEYXRlLm5vdyxcbik6IChpcDogc3RyaW5nKSA9PiBib29sZWFuIHtcbiAgY29uc3QgbWV0YUhpdHMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyW10+KCk7XG4gIHJldHVybiBmdW5jdGlvbiBtZXRhUmF0ZUxpbWl0ZWQoaXA6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHQgPSBub3coKTtcbiAgICBjb25zdCBoaXRzID0gKG1ldGFIaXRzLmdldChpcCkgPz8gW10pLmZpbHRlcihcbiAgICAgIChoaXQpID0+IHQgLSBoaXQgPCBNRVRBX1dJTkRPV19NUyxcbiAgICApO1xuICAgIGlmIChoaXRzLmxlbmd0aCA+PSBNRVRBX01BWF9QRVJfV0lORE9XKSB7XG4gICAgICBtZXRhSGl0cy5zZXQoaXAsIGhpdHMpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGhpdHMucHVzaCh0KTtcbiAgICBtZXRhSGl0cy5zZXQoaXAsIGhpdHMpO1xuICAgIC8vIEJvdW5kIHRoZSBtYXAgc28gYSBzY2FuIGFjcm9zcyBtYW55IElQcyBjYW4ndCBncm93IG1lbW9yeSB1bmJvdW5kZWQuXG4gICAgaWYgKG1ldGFIaXRzLnNpemUgPiAxMF8wMDApIG1ldGFIaXRzLmNsZWFyKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xufVxuXG4vLyBqd3RTdWIgaXMgaW1wb3J0ZWQgKHNlcnZlci9qd3QudHMsIEcyKSBcdTIwMTQgaXQgd2FzIHBhc3RlZCBieXRlLWlkZW50aWNhbGx5XG4vLyBpbnRvIGJvdGggaGFuZGxlcnM7IHNlZSB0aGF0IGxlYWYgZm9yIHRoZSBuby12ZXJpZmljYXRpb24gcmVhc29uaW5nLlxuXG4vLyAtLS0tIFRoZSBoYW5kbGVyIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlR2V0QWN0aXZpdHlIYW5kbGVyKFxuICBkZXBzOiBHZXRBY3Rpdml0eUhhbmRsZXJEZXBzLFxuKTogKHJlcTogUmVxdWVzdCkgPT4gUHJvbWlzZTxSZXNwb25zZT4ge1xuICBjb25zdCB7IGRiLCBjb3JzIH0gPSBkZXBzO1xuICBjb25zdCBtZXRhUmF0ZUxpbWl0ZWQgPSBjcmVhdGVNZXRhUmF0ZUxpbWl0ZXIoZGVwcy5ub3cgPz8gRGF0ZS5ub3cpO1xuXG4gIHJldHVybiBhc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRBY3Rpdml0eShyZXE6IFJlcXVlc3QpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgY29uc3QgcHJlZmxpZ2h0ID0gY29ycy5oYW5kbGVQcmVmbGlnaHQocmVxKTtcbiAgICBpZiAocHJlZmxpZ2h0KSByZXR1cm4gcHJlZmxpZ2h0O1xuICAgIGlmIChyZXEubWV0aG9kICE9PSAnR0VUJykge1xuICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQwNSwgJ01ldGhvZCBub3QgYWxsb3dlZCcpO1xuICAgIH1cblxuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocmVxLnVybCk7XG4gICAgY29uc3QgYWN0aXZpdHlJZCA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KCdhY3Rpdml0eV9pZCcpID8/ICcnO1xuICAgIGNvbnN0IHZlcnNpb25JZCA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KCd2ZXJzaW9uX2lkJyk7XG4gICAgY29uc3QgbWV0YU9ubHkgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgnbWV0YScpID09PSAnMSc7XG5cbiAgICBpZiAoIVVVSURfUkUudGVzdChhY3Rpdml0eUlkKSkge1xuICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQwMCwgJ2FjdGl2aXR5X2lkIG11c3QgYmUgYSBVVUlEJyk7XG4gICAgfVxuXG4gICAgLy8gLS0tLSAxLiBNRVRBIChhbm9ueW1vdXMpIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpZiAobWV0YU9ubHkpIHtcbiAgICAgIGNvbnN0IGlwID1cbiAgICAgICAgcmVxLmhlYWRlcnMuZ2V0KCd4LWZvcndhcmRlZC1mb3InKT8uc3BsaXQoJywnKVswXT8udHJpbSgpID8/ICd1bmtub3duJztcbiAgICAgIGlmIChtZXRhUmF0ZUxpbWl0ZWQoaXApKSB7XG4gICAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MjksICdUb28gbWFueSByZXF1ZXN0cycpO1xuICAgICAgfVxuICAgICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgZGIucHVibGljTWV0YShhY3Rpdml0eUlkKTtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBtZXRhIFJQQyBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA1MDAsICdMb29rdXAgZmFpbGVkJyk7XG4gICAgICB9XG4gICAgICBpZiAoIWRhdGEpIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDQsICdOb3QgYXZhaWxhYmxlJyk7XG4gICAgICByZXR1cm4gY29ycy5qc29uUmVzcG9uc2UoXG4gICAgICAgIHJlcSxcbiAgICAgICAge1xuICAgICAgICAgIGFwaV92ZXJzaW9uOiBBUElfVkVSU0lPTixcbiAgICAgICAgICB0aXRsZTogZGF0YS50aXRsZSxcbiAgICAgICAgICB0ZWFjaGVyX25hbWU6IGRhdGEudGVhY2hlcl9uYW1lLFxuICAgICAgICB9LFxuICAgICAgICB7IGhlYWRlcnM6IHsgJ0NhY2hlLUNvbnRyb2wnOiAnbm8tY2FjaGUnIH0gfSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gLS0tLSBBdXRoIChyZXNvbHZlICsgY29udGVudCkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgY29uc3QgYXV0aEhlYWRlciA9IHJlcS5oZWFkZXJzLmdldCgnQXV0aG9yaXphdGlvbicpO1xuICAgIGlmICghYXV0aEhlYWRlcikge1xuICAgICAgcmV0dXJuIGNvcnMuZXJyb3JSZXNwb25zZShyZXEsIDQwMSwgJ01pc3NpbmcgQXV0aG9yaXphdGlvbiBoZWFkZXInKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGRhdGE6IGN1cnJlbnQsIGVycm9yOiBycGNFcnJvciB9ID0gYXdhaXQgZGIucHVibGlzaGVkQWN0aXZpdHkoXG4gICAgICBhdXRoSGVhZGVyLFxuICAgICAgYWN0aXZpdHlJZCxcbiAgICApO1xuICAgIGlmIChycGNFcnJvcikge1xuICAgICAgY29uc3QgbXNnID0gcnBjRXJyb3IubWVzc2FnZSA/PyAnJztcbiAgICAgIC8vIFBvc3RnUkVTVCBzdXJmYWNlcyBhIGJhZC9leHBpcmVkIEpXVCBhcyBhIDQwMS1jbGFzcyBlcnJvcjsgdGhlIFJQQ1xuICAgICAgLy8gcmFpc2VzICdOb3QgYXZhaWxhYmxlJyBmb3IgbWlzc2luZy91bnB1Ymxpc2hlZC9kZWxldGVkIGFjdGl2aXRpZXMuXG4gICAgICBjb25zdCBzdGF0dXMgPSBtc2cuaW5jbHVkZXMoJ05vdCBhdmFpbGFibGUnKVxuICAgICAgICA/IDQwNFxuICAgICAgICA6IC9KV1R8dG9rZW58YXV0aC9pLnRlc3QobXNnKVxuICAgICAgICAgID8gNDAxXG4gICAgICAgICAgOiA1MDA7XG4gICAgICBpZiAoc3RhdHVzID09PSA1MDApIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIFJQQyBlcnJvcjonLCBycGNFcnJvcik7XG4gICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKFxuICAgICAgICByZXEsXG4gICAgICAgIHN0YXR1cyxcbiAgICAgICAgc3RhdHVzID09PSA0MDQgPyAnTm90IGF2YWlsYWJsZScgOiBtc2csXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoIWN1cnJlbnQpIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDQsICdOb3QgYXZhaWxhYmxlJyk7XG4gICAgY29uc3Qgcm93ID0gY3VycmVudDtcblxuICAgIC8vIC0tLS0gMi4gUkVTT0xWRSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGlmICghdmVyc2lvbklkKSB7XG4gICAgICByZXR1cm4gY29ycy5qc29uUmVzcG9uc2UoXG4gICAgICAgIHJlcSxcbiAgICAgICAge1xuICAgICAgICAgIGFwaV92ZXJzaW9uOiBBUElfVkVSU0lPTixcbiAgICAgICAgICBhY3Rpdml0eV9pZDogYWN0aXZpdHlJZCxcbiAgICAgICAgICB2ZXJzaW9uX2lkOiByb3cudmVyc2lvbl9pZCxcbiAgICAgICAgICB2ZXJzaW9uX251bTogcm93LnZlcnNpb25fbnVtLFxuICAgICAgICAgIHRpdGxlOiByb3cudGl0bGUsXG4gICAgICAgIH0sXG4gICAgICAgIHsgaGVhZGVyczogeyAnQ2FjaGUtQ29udHJvbCc6ICduby1jYWNoZScgfSB9LFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyAtLS0tIDMuIENPTlRFTlQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpZiAoIVVVSURfUkUudGVzdCh2ZXJzaW9uSWQpKSB7XG4gICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNDAwLCAndmVyc2lvbl9pZCBtdXN0IGJlIGEgVVVJRCcpO1xuICAgIH1cbiAgICBpZiAodmVyc2lvbklkICE9PSByb3cudmVyc2lvbl9pZCkge1xuICAgICAgLy8gUmVwdWJsaXNoZWQgc2luY2UgcmVzb2x2ZSBcdTIwMTQgdGhlIHZpZXdlciByZS1yZXNvbHZlcyBhbmQgcmVmZXRjaGVzLiA0MDRcbiAgICAgIC8vIChub3QgNDA5KSBzbyBubyBzdGFsZS1VUkwgcmVzcG9uc2UgaXMgZXZlciBjYWNoZWFibGUgYXMgY29udGVudC5cbiAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA0MDQsICdOb3QgdGhlIGN1cnJlbnQgdmVyc2lvbicsIHtcbiAgICAgICAgY29kZTogJ3N0YWxlX3ZlcnNpb24nLFxuICAgICAgICBjdXJyZW50X3ZlcnNpb25faWQ6IHJvdy52ZXJzaW9uX2lkLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRHVyYWJsZSBwZXItdmVyc2lvbiBjYWNoZSAoYWN0aXZpdHlfdmVyc2lvbl9yZWFkcywgc2VydmljZS1yb2xlIG9ubHkpLlxuICAgIGxldCBzYW5pdGl6ZWQ6IFNhbml0aXplZEFjdGl2aXR5RG9jdW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCB7IGRhdGE6IGNhY2hlZCwgZXJyb3I6IGNhY2hlRXJyIH0gPSBhd2FpdCBkYi5yZWFkQ2FjaGUoXG4gICAgICB2ZXJzaW9uSWQsXG4gICAgICBTQU5JVElaRVJfUkVWLFxuICAgICk7XG4gICAgaWYgKGNhY2hlRXJyKSB7XG4gICAgICAvLyBDYWNoZSByZWFkIGZhaWx1cmUgaXMgbm9uLWZhdGFsIFx1MjAxNCBmYWxsIHRocm91Z2ggdG8gdGhlIHNvdXJjZSBvZiB0cnV0aC5cbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIGNhY2hlIHJlYWQgZmFpbGVkOicsIGNhY2hlRXJyKTtcbiAgICB9XG4gICAgaWYgKGNhY2hlZCkge1xuICAgICAgc2FuaXRpemVkID0gY2FjaGVkLmNvbnRlbnQgYXMgU2FuaXRpemVkQWN0aXZpdHlEb2N1bWVudDtcbiAgICB9XG5cbiAgICBpZiAoIXNhbml0aXplZCkge1xuICAgICAgY29uc3QgeyBkYXRhOiB2ZXJzaW9uLCBlcnJvcjogdkVyciB9ID0gYXdhaXQgZGIucmVhZFZlcnNpb24odmVyc2lvbklkKTtcbiAgICAgIGlmICh2RXJyIHx8ICF2ZXJzaW9uKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIHZlcnNpb24gcmVhZCBmYWlsZWQ6JywgdkVycik7XG4gICAgICAgIHJldHVybiBjb3JzLmVycm9yUmVzcG9uc2UocmVxLCA1MDAsICdWZXJzaW9uIHJlYWQgZmFpbGVkJyk7XG4gICAgICB9XG4gICAgICBsZXQgdXBncmFkZWQ7XG4gICAgICB0cnkge1xuICAgICAgICB1cGdyYWRlZCA9IHVwZ3JhZGVBY3Rpdml0eURvY3VtZW50KHZlcnNpb24uY29udGVudCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gVGhlIGV4cGxpY2l0IGZhaWx1cmUgc3RhdGUgdGhlIGZhaWx1cmUtbW9kZXMgdGFibGUgcHJvbWlzZXMgXHUyMDE0IGFcbiAgICAgICAgLy8gc2VydmVkIDUwMCB3aXRoIGEgcmVhc29uLCBuZXZlciBhIG1pcy1wYXJzZWQgZG9jdW1lbnQuXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIHVwZ3JhZGUgZmFpbGVkOicsIGVycik7XG4gICAgICAgIGNvbnN0IGRldGFpbCA9XG4gICAgICAgICAgZXJyIGluc3RhbmNlb2YgVXBncmFkZUVycm9yID8gZXJyLm1lc3NhZ2UgOiAnVXBncmFkZSBmYWlsZWQnO1xuICAgICAgICByZXR1cm4gY29ycy5lcnJvclJlc3BvbnNlKHJlcSwgNTAwLCAnQWN0aXZpdHkgY29udGVudCBjYW5ub3QgYmUgc2VydmVkJywge1xuICAgICAgICAgIGNvZGU6ICd1cGdyYWRlX2ZhaWxlZCcsXG4gICAgICAgICAgZGV0YWlsLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHNhbml0aXplZCA9IHNhbml0aXplQWN0aXZpdHlEb2N1bWVudCh1cGdyYWRlZC5kb2MpO1xuXG4gICAgICAvLyAtLS0tIEFuYWx5dGljcyBzaWRlLWNoYW5uZWwgKFM3KSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gT1JERVIgSVMgTE9BRC1CRUFSSU5HOiBjZW5zdXMgRklSU1QsIGFuZCB0aGUgY2FjaGUgcm93IGlzIHdyaXR0ZW4gb25seVxuICAgICAgLy8gaWYgaXQgc3VjY2VlZGVkIChydWxpbmcgUzctOSkuXG4gICAgICAvL1xuICAgICAgLy8gVGhlIGNhY2hlIHJvdyBpcyB3aGF0IG1ha2VzIGV2ZXJ5IGxhdGVyIHJlYWQgYSBISVQgXHUyMDE0IGFuZCBhIEhJVCBkb2VzIG5vXG4gICAgICAvLyBhbmFseXRpY3Mgd29yayBhdCBhbGwuIFNvIHdyaXRpbmcgdGhlIGNhY2hlIHJvdyBhZnRlciBhIEZBSUxFRCBjZW5zdXNcbiAgICAgIC8vIHdvdWxkIHN0cmFuZCB0aGlzIHZlcnNpb24gd2l0aCBubyBjZW5zdXMgdW50aWwgdGhlIG5leHQgU0FOSVRJWkVSX1JFVlxuICAgICAgLy8gYnVtcCwgd2hpbGUgZXZlcnkgY2hlY2sgb24gaXQgYWdncmVnYXRlZCBhcyB1bmF0dHJpYnV0ZWQuIFNpbGVudCwgYW5kXG4gICAgICAvLyBwZXJtYW5lbnQuIFdpdGhob2xkaW5nIHRoZSBjYWNoZSByb3cgaW5zdGVhZCBtZWFucyB0aGUgbmV4dCByZWFkIGlzXG4gICAgICAvLyBhbm90aGVyIG1pc3MgdGhhdCByZXRyaWVzIGJvdGg6IHRoZSBmYWlsdXJlIHNlbGYtaGVhbHMsIGFuZCBpdHMgb25seVxuICAgICAgLy8gY29zdCBpcyByZWNvbXB1dGluZyBhIGRvY3VtZW50IHdlIGFscmVhZHkga25vdyBob3cgdG8gcmVjb21wdXRlLlxuICAgICAgLy9cbiAgICAgIC8vIFRoZSBjZW5zdXMgaXRzZWxmIGlzIHRvdGFsIChuZXZlciB0aHJvd3MgXHUyMDE0IHNlZSBVTktOT1dOX0NFTlNVU19LRVkpLCBzb1xuICAgICAgLy8gd2hhdCB0aGlzIG9yZGVyaW5nIGFjdHVhbGx5IGd1YXJkcyBhZ2FpbnN0IGlzIGEgdHJhbnNpZW50IERCIGZhaWx1cmUsXG4gICAgICAvLyB3aGljaCBpcyBleGFjdGx5IHRoZSBraW5kIHRoYXQgYSByZXRyeSBmaXhlcy5cbiAgICAgIGxldCBjZW5zdXNPayA9IHRydWU7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7IGVycm9yOiBjZW5zdXNFcnIgfSA9IGF3YWl0IGRiLndyaXRlQ2Vuc3VzKFxuICAgICAgICAgIHZlcnNpb25JZCxcbiAgICAgICAgICBjZW5zdXNPZkRvY3VtZW50KHVwZ3JhZGVkLmRvYyksXG4gICAgICAgICk7XG4gICAgICAgIGlmIChjZW5zdXNFcnIpIHtcbiAgICAgICAgICBjZW5zdXNPayA9IGZhbHNlO1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIGNlbnN1cyB3cml0ZSBmYWlsZWQ6JywgY2Vuc3VzRXJyKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNlbnN1c09rID0gZmFsc2U7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tnZXQtYWN0aXZpdHldIGNlbnN1cyB0aHJldzonLCBlcnIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY2Vuc3VzT2spIHtcbiAgICAgICAgY29uc3QgeyBlcnJvcjogdXBzZXJ0RXJyIH0gPSBhd2FpdCBkYi51cHNlcnRDYWNoZSh7XG4gICAgICAgICAgdmVyc2lvbl9pZDogdmVyc2lvbklkLFxuICAgICAgICAgIHNhbml0aXplcl9yZXY6IFNBTklUSVpFUl9SRVYsXG4gICAgICAgICAgc2NoZW1hX3ZlcnNpb246IHVwZ3JhZGVkLmRvYy5zY2hlbWFWZXJzaW9uLFxuICAgICAgICAgIGNvbnRlbnQ6IHNhbml0aXplZCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh1cHNlcnRFcnIpIHtcbiAgICAgICAgICAvLyBOb24tZmF0YWw6IHRoZSByZXNwb25zZSBpcyBhbHJlYWR5IGNvbXB1dGVkOyB0aGUgbmV4dCByZXF1ZXN0XG4gICAgICAgICAgLy8gcmV0cmllcy5cbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdbZ2V0LWFjdGl2aXR5XSBjYWNoZSB1cHNlcnQgZmFpbGVkOicsIHVwc2VydEVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVGhpcyB2ZXJzaW9uIGlzIG5vdyBjYWNoZWQgdW5kZXIgdGhlIENVUlJFTlQgcmV2LCBzbyBhbnkgcm93IGl0XG4gICAgICAgICAgLy8gaGFzIHVuZGVyIGFuIG9sZGVyIHJldiBpcyBkZWFkIHdlaWdodCBub3RoaW5nIHdpbGwgZXZlciByZWFkLlxuICAgICAgICAgIGNvbnN0IHsgZXJyb3I6IGdjRXJyIH0gPSBhd2FpdCBkYi5kZWxldGVTdGFsZUNhY2hlKFxuICAgICAgICAgICAgdmVyc2lvbklkLFxuICAgICAgICAgICAgU0FOSVRJWkVSX1JFVixcbiAgICAgICAgICApO1xuICAgICAgICAgIGlmIChnY0Vycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW2dldC1hY3Rpdml0eV0gc3RhbGUtY2FjaGUgR0MgZmFpbGVkOicsIGdjRXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB1c2VySWQgPSBqd3RTdWIoYXV0aEhlYWRlcikgPz8gJ2Fub255bW91cyc7XG4gICAgLy8gc2VydmVTZWVkLCBpbXBvcnRlZCAoRzEpOiB0aGUgZ3JhZGluZyBzaWRlIHJlY29tcHV0ZXMgdGhpcyBzdHVkZW50J3NcbiAgICAvLyBhcnJhbmdlbWVudCBmcm9tIHRoZSBTQU1FIHN5bWJvbCBcdTIwMTQgdHdvIHNwZWxsaW5ncyBhZ3JlZWluZyBieSBsdWNrIHdhc1xuICAgIC8vIHRoZSBzMiByZXRybydzIHNoYXJwZXN0IHNlYW0gZmluZGluZy5cbiAgICBjb25zdCBzZXJ2ZWQgPSBhcHBseVNlcnZlU2h1ZmZsZXMoc2FuaXRpemVkLCBzZXJ2ZVNlZWQodmVyc2lvbklkLCB1c2VySWQpKTtcblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoXG4gICAgICBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGFwaV92ZXJzaW9uOiBBUElfVkVSU0lPTixcbiAgICAgICAgYWN0aXZpdHlfaWQ6IGFjdGl2aXR5SWQsXG4gICAgICAgIHZlcnNpb246IHtcbiAgICAgICAgICBpZDogdmVyc2lvbklkLFxuICAgICAgICAgIG51bTogcm93LnZlcnNpb25fbnVtLFxuICAgICAgICAgIHNjaGVtYV92ZXJzaW9uOiBzZXJ2ZWQuc2NoZW1hVmVyc2lvbixcbiAgICAgICAgfSxcbiAgICAgICAgdGl0bGU6IHJvdy50aXRsZSxcbiAgICAgICAgYWN0aXZpdHk6IHNlcnZlZCxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBzdGF0dXM6IDIwMCxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIC4uLmNvcnMuY29yc0hlYWRlcnMocmVxKSxcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIC8vIFZlcnNpb24ta2V5ZWQgVVJMIFx1MjE5MiBpbW11dGFibGUuIHByaXZhdGU6IHN0dWRlbnQgY29udGVudCBuZXZlciBsYW5kc1xuICAgICAgICAgIC8vIGluIHNoYXJlZCBjYWNoZXMuIEEgcmVwdWJsaXNoIGNoYW5nZXMgdGhlIFVSTCB2aWEgcmVzb2x2ZSwgc28gdGhpc1xuICAgICAgICAgIC8vIG5ldmVyIG5lZWRzIHRvIGV4cGlyZS5cbiAgICAgICAgICAnQ2FjaGUtQ29udHJvbCc6ICdwcml2YXRlLCBtYXgtYWdlPTMxNTM2MDAwLCBpbW11dGFibGUnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICApO1xuICB9O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0FPLElBQUk7QUFBQSxDQUNWLFNBQVVBLE9BQU07QUFDYixFQUFBQSxN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VSxTQUFTLE9BQU87QUFBQSxJQUNqQyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsVUFBVSxPQUFPO0FBQ2IsV0FBTyxJQUFJLFdBQVU7QUFBQSxNQUNqQixHQUFHLEtBQUs7QUFBQSxNQUNSLFFBQVEsQ0FBQyxHQUFHLEtBQUssS0FBSyxRQUFRLEtBQUs7QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsTUFBTSxTQUFTO0FBQ1gsV0FBTyxLQUFLLFVBQVUsRUFBRSxNQUFNLFNBQVMsR0FBRyxVQUFVLFNBQVMsT0FBTyxFQUFFLENBQUM7QUFBQSxFQUMzRTtBQUFBLEVBQ0EsSUFBSSxTQUFTO0FBQ1QsV0FBTyxLQUFLLFVBQVUsRUFBRSxNQUFNLE9BQU8sR0FBRyxVQUFVLFNBQVMsT0FBTyxFQUFFLENBQUM7QUFBQSxFQUN6RTtBQUFBLEVBQ0EsTUFBTSxTQUFTO0FBQ1gsV0FBTyxLQUFLLFVBQVUsRUFBRSxNQUFNLFNBQVMsR0FBRyxVQUFVLFNBQVMsT0FBTyxFQUFFLENBQUM7QUFBQSxFQUMzRTtBQUFBLEVBQ0EsS0FBSyxTQUFTO0FBQ1YsV0FBTyxLQUFLLFVBQVUsRUFBRSxNQUFNLFFBQVEsR0FBRyxVQUFVLFNBQVMsT0FBTyxFQUFFLENBQUM7QUFBQSxFQUMxRTtBQUFBLEVBQ0EsT0FBTyxTQUFTO0FBQ1osV0FBTyxLQUFLLFVBQVUsRUFBRSxNQUFNLFVBQVUsR0FBRyxVQUFVLFNBQVMsT0FBTyxFQUFFLENBQUM7QUFBQSxFQUM1RTtBQUFBLEVBQ0EsS0FBSyxTQUFTO0FBQ1YsV0FBTyxLQUFLLFVBQVUsRUFBRSxNQUFNLFFBQVEsR0FBRyxVQUFVLFNBQVMsT0FBTyxFQUFFLENBQUM7QUFBQSxFQUMxRTtBQUFBLEVBQ0EsTUFBTSxTQUFTO0FBQ1gsV0FBTyxLQUFLLFVBQVUsRUFBRSxNQUFNLFNBQVMsR0FBRyxVQUFVLFNBQVMsT0FBTyxFQUFFLENBQUM7QUFBQSxFQUMzRTtBQUFBLEVBQ0EsS0FBSyxTQUFTO0FBQ1YsV0FBTyxLQUFLLFVBQVUsRUFBRSxNQUFNLFFBQVEsR0FB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TUFDakIsR0FBRyxLQUFLO0FBQUEsTUFDUixRQUFRLENBQUMsR0FBRyxLQUFLLEtBQUssUUFBUSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQUEsSUFDekQsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLElBQUksYUFBYTtBQUNiLFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxVQUFVO0FBQUEsRUFDakU7QUFBQSxFQUNBLElBQUksU0FBUztBQUNULFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxNQUFNO0FBQUEsRUFDN0Q7QUFBQSxFQUNBLElBQUksU0FBUztBQUNULFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxNQUFNO0FBQUEsRUFDN0Q7QUFBQSxFQUNBLElBQUksYUFBYTtBQUNiLFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxVQUFVO0FBQUEsRUFDakU7QUFBQSxFQUNBLElBQUksVUFBVTtBQUNWLFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxPQUFPO0FBQUEsRUFDOUQ7QUFBQSxFQUNBLElBQUksUUFBUTtBQUNSLFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxLQUFLO0FBQUEsRUFDNUQ7QUFBQSxFQUNBLElBQUksVUFBVTtBQUNWLFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxPQUFPO0FBQUEsRUFDOUQ7QUFBQSxFQUNBLElBQUksU0FBUztBQUNULFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxNQUFNO0FBQUEsRUFDN0Q7QUFBQSxFQUNBLElBQUksV0FBVztBQUNYLFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxRQUFRO0FBQUEsRUFDL0Q7QUFBQSxFQUNBLElBQUksU0FBUztBQUNULFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxNQUFNO0FBQUEsRUFDN0Q7QUFBQSxFQUNBLElBQUksVUFBVTtBQUNWLFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxPQUFPO0FBQUEsRUFDOUQ7QUFBQSxFQUNBLElBQUksU0FBUztBQUNULFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxNQUFNO0FBQUEsRUFDN0Q7QUFBQSxFQUNBLElBQUksT0FBTztBQUNQLFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxJQUFJO0FBQUEsRUFDM0Q7QUFBQSxFQUNBLElBQUksU0FBUztBQUNULFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxNQUFNO0FBQUEsRUFDN0Q7QUFBQSxFQUNBLElBQUksV0FBVztBQUNYLFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxRQUFRO0FBQUEsRUFDL0Q7QUFBQSxFQUNBLElBQUksY0FBYztBQUVkLFdBQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxXQUFXO0FBQUEsRUFDbEU7QUFBQSxFQUNBLElBQUksWUFBWTtBQUNaLFFBQUksTUFBTTtBQUNWLGVBQVcsTUFBTSxLQUFLLEtBQUssUUFBUTtBQUMvQixVQUFJLEdBQUcsU0FBUyxPQUFPO0FBQ25CLFlBQUksUUFBUSxRQUFRLEdBQUcsUUFBUTtBQUMzQixnQkFBTSxHQUFHO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUNBLElBQUksWUFBWTtBQUNaLFFBQUksTUFBTTtBQUNWLGVBQVcsTUFBTSxLQUFLLEtBQUssUUFBUTtBQUMvQixVQUFJLEdBQUcsU0FBUyxPQUFPO0FBQ25CLFlBQUksUUFBUSxRQUFRLEdBQUcsUUFBUTtBQUMzQixnQkFBTSxHQUFHO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFDSjtBQUNBLFVBQVUsU0FBUyxDQUFDLFdBQVc7QUFDM0IsU0FBTyxJQUFJLFVBQVU7QUFBQSxJQUNqQixRQUFRLENBQUM7QUFBQSxJQUNULFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsUUFBUSxRQUFRLFVBQVU7QUFBQSxJQUMxQixHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBRUEsU0FBUyxtQkFBbUIsS0FBSyxNQUFNO0FBQ25DLFFBQU0sZUFBZSxJQUFJLFNBQVMsRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLEtBQUssSUFBSTtBQUN6RCxRQUFNLGdCQUFnQixLQUFLLFNBQVMsRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLEtBQUssSUFBSTtBQUMzRCxRQUFNLFdBQVcsY0FBYyxlQUFlLGNBQWM7QUFDNUQsUUFBTSxTQUFTLE9BQU8sU0FBUyxJQUFJLFFBQVEsUUFBUSxFQUFFLFFBQVEsS0FBSyxFQUFFLENBQUM7QUFDckUsUUFBTSxVQUFVLE9BQU8sU0FBUyxLQUFLLFFBQVEsUUFBUSxFQUFFLFFBQVEsS0FBSyxFQUFFLENBQUM7QUFDdkUsU0FBUSxTQUFTLFVBQVcsTUFBTTtBQUN0QztBQUNPLElBQU0sWUFBTixNQUFNLG1CQUFrQixRQUFRO0FBQUEsRUFDbkMsY0FBYztBQUNWLFVBQU0sR0FBRyxTQUFTO0FBQ2xCLFNBQUssTUFBTSxLQUFLO0FBQ2hCLFNBQUssTUFBTSxLQUFLO0FBQ2hCLFNBQUssT0FBTyxLQUFLO0FBQUEsRUFDckI7QUFBQSxFQUNBLE9BQU8sT0FBTztBQUNWLFFBQUksS0FBSyxLQUFLLFFBQVE7QUFDbEIsWUFBTSxPQUFPLE9BQU8sTUFBTSxJQUFJO0FBQUEsSUFDbEM7QUFDQSxVQUFNLGFBQWEsS0FBSyxTQUFTLEtBQUs7QUFDdEMsUUFBSSxlQUFlLGNBQWMsUUFBUTtBQUNyQyxZQUFNQSxPQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDdEMsd0JBQWtCQSxNQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVUEsS0FBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFFBQUksTUFBTTtBQUNWLFVBQU0sU0FBUyxJQUFJLFlBQVk7QUFDL0IsZUFBVyxTQUFTLEtBQUssS0FBSyxRQUFRO0FBQ2xDLFVBQUksTUFBTSxTQUFTLE9BQU87QUFDdEIsWUFBSSxDQUFDLEtBQUssVUFBVSxNQUFNLElBQUksR0FBRztBQUM3QixnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixNQUFNLGFBQWE7QUFBQSxZQUNuQixVQUFVO0FBQUEsWUFDVixVQUFVO0FBQUEsWUFDVixTQUFTLE1BQU07QUFBQSxVQUNuQixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixXQUNTLE1BQU0sU0FBUyxPQUFPO0FBQzNCLGNBQU0sV0FBVyxNQUFNLFlBQVksTUFBTSxPQUFPLE1BQU0sUUFBUSxNQUFNLFFBQVEsTUFBTTtBQUNsRixZQUFJLFVBQVU7QUFDVixnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixNQUFNLGFBQWE7QUFBQSxZQUNuQixTQUFTLE1BQU07QUFBQSxZQUNmLE1BQU07QUFBQSxZQUNOLFdBQVcsTUFBTTtBQUFBLFlBQ2pCLE9BQU87QUFBQSxZQUNQLFNBQVMsTUFBTTtBQUFBLFVBQ25CLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLFdBQ1MsTUFBTSxTQUFTLE9BQU87QUFDM0IsY0FBTSxTQUFTLE1BQU0sWUFBWSxNQUFNLE9BQU8sTUFBTSxRQUFRLE1BQU0sUUFBUSxNQUFNO0FBQ2hGLFlBQUksUUFBUTtBQUNSLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFNBQVMsTUFBTTtBQUFBLFlBQ2YsTUFBTTtBQUFBLFlBQ04sV0FBVyxNQUFNO0FBQUEsWUFDakIsT0FBTztBQUFBLFlBQ1AsU0FBUyxNQUFNO0FBQUEsVUFDbkIsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osV0FDUyxNQUFNLFNBQVMsY0FBYztBQUNsQyxZQUFJLG1CQUFtQixNQUFNLE1BQU0sTUFBTSxLQUFLLE1BQU0sR0FBRztBQUNuRCxnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixNQUFNLGFBQWE7QUFBQSxZQUNuQixZQUFZLE1BQU07QUFBQSxZQUNsQixTQUFTLE1BQU07QUFBQSxVQUNuQixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixXQUNTLE1BQU0sU0FBUyxVQUFVO0FBQzlCLFlBQUksQ0FBQyxPQUFPLFNBQVMsTUFBTSxJQUFJLEdBQUc7QUFDOUIsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsTUFBTSxhQUFhO0FBQUEsWUFDbkIsU0FBUyxNQUFNO0FBQUEsVUFDbkIsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osT0FDSztBQUNELGFBQUssWUFBWSxLQUFLO0FBQUEsTUFDMUI7QUFBQSxJQUNKO0FBQ0EsV0FBTyxFQUFFLFFBQVEsT0FBTyxPQUFPLE9BQU8sTUFBTSxLQUFLO0FBQUEsRUFDckQ7QUFBQSxFQUNBLElBQUksT0FBTyxTQUFTO0FBQ2hCLFdBQU8sS0FBSyxTQUFTLE9BQU8sT0FBTyxNQUFNLFVBQVUsU0FBUyxPQUFPLENBQUM7QUFBQSxFQUN4RTtBQUFBLEVBQ0EsR0FBRyxPQUFPLFNBQVM7QUFDZixXQUFPLEtBQUssU0FBUyxPQUFPLE9BQU8sT0FBTyxVQUFVLFNBQVMsT0FBTyxDQUFDO0FBQUEsRUFDekU7QUFBQSxFQUNBLElBQUksT0FBTyxTQUFTO0FBQ2hCLFdBQU8sS0FBSyxTQUFTLE9BQU8sT0FBTyxNQUFNLFVBQVUsU0FBUyxPQUFPLENBQUM7QUFBQSxFQUN4RTtBQUFBLEVBQ0EsR0FBRyxPQUFPLFNBQVM7QUFDZixXQUFPLEtBQUssU0FBUyxPQUFPLE9BQU8sT0FBTyxVQUFVLFNBQVMsT0FBTyxDQUFDO0FBQUEsRUFDekU7QUFBQSxFQUNBLFNBQVMsTUFBTSxPQUFPLFdBQVcsU0FBUztBQUN0QyxXQUFPLElBQUksV0FBVTtBQUFBLE1BQ2pCLEdBQUcsS0FBSztBQUFBLE1BQ1IsUUFBUTtBQUFBLFFBQ0osR0FBRyxLQUFLLEtBQUs7QUFBQSxRQUNiO0FBQUEsVUFDSTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQSxTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsUUFDdkM7QUFBQSxNQUNKO0FBQUEsSUFDSixDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsVUFBVSxPQUFPO0FBQ2IsV0FBTyxJQUFJLFdBQVU7QUFBQSxNQUNqQixHQUFHLEtBQUs7QUFBQSxNQUNSLFFBQVEsQ0FBQyxHQUFHLEtBQUssS0FBSyxRQUFRLEtBQUs7QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsSUFBSSxTQUFTO0FBQ1QsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFNBQVMsU0FBUztBQUNkLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLE1BQ1AsV0FBVztBQUFBLE1BQ1gsU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxTQUFTLFNBQVM7QUFDZCxXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxNQUNQLFdBQVc7QUFBQSxNQUNYLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsWUFBWSxTQUFTO0FBQ2pCLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLE1BQ1AsV0FBVztBQUFBLE1BQ1gsU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxZQUFZLFNBQVM7QUFDakIsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsTUFDUCxXQUFXO0FBQUEsTUFDWCxTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFdBQVcsT0FBTyxTQUFTO0FBQ3ZCLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ047QUFBQSxNQUNBLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsT0FBTyxTQUFTO0FBQ1osV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLEtBQUssU0FBUztBQUNWLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ04sV0FBVztBQUFBLE1BQ1gsT0FBTyxPQUFPO0FBQUEsTUFDZCxTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDdkMsQ0FBQyxFQUFFLFVBQVU7QUFBQSxNQUNULE1BQU07QUFBQSxNQUNOLFdBQVc7QUFBQSxNQUNYLE9BQU8sT0FBTztBQUFBLE1BQ2QsU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxJQUFJLFdBQVc7QUFDWCxRQUFJLE1BQU07QUFDVixlQUFXLE1BQU0sS0FBSyxLQUFLLFFBQVE7QUFDL0IsVUFBSSxHQUFHLFNBQVMsT0FBTztBQUNuQixZQUFJLFFBQVEsUUFBUSxHQUFHLFFBQVE7QUFDM0IsZ0JBQU0sR0FBRztBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxJQUFJLFdBQVc7QUFDWCxRQUFJLE1BQU07QUFDVixlQUFXLE1BQU0sS0FBSyxLQUFLLFFBQVE7QUFDL0IsVUFBSSxHQUFHLFNBQVMsT0FBTztBQUNuQixZQUFJLFFBQVEsUUFBUSxHQUFHLFFBQVE7QUFDM0IsZ0JBQU0sR0FBRztBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxJQUFJLFFBQVE7QUFDUixXQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssT0FBTyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsU0FBVSxHQUFHLFNBQVMsZ0JBQWdCLEtBQUssVUFBVSxHQUFHLEtBQUssQ0FBRTtBQUFBLEVBQ3RIO0FBQUEsRUFDQSxJQUFJLFdBQVc7QUFDWCxRQUFJLE1BQU07QUFDVixRQUFJLE1BQU07QUFDVixlQUFXLE1BQU0sS0FBSyxLQUFLLFFBQVE7QUFDL0IsVUFBSSxHQUFHLFNBQVMsWUFBWSxHQUFHLFNBQVMsU0FBUyxHQUFHLFNBQVMsY0FBYztBQUN2RSxlQUFPO0FBQUEsTUFDWCxXQUNTLEdBQUcsU0FBUyxPQUFPO0FBQ3hCLFlBQUksUUFBUSxRQUFRLEdBQUcsUUFBUTtBQUMzQixnQkFBTSxHQUFHO0FBQUEsTUFDakIsV0FDUyxHQUFHLFNBQVMsT0FBTztBQUN4QixZQUFJLFFBQVEsUUFBUSxHQUFHLFFBQVE7QUFDM0IsZ0JBQU0sR0FBRztBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUNBLFdBQU8sT0FBTyxTQUFTLEdBQUcsS0FBSyxPQUFPLFNBQVMsR0FBRztBQUFBLEVBQ3REO0FBQ0o7QUFDQSxVQUFVLFNBQVMsQ0FBQyxXQUFXO0FBQzNCLFNBQU8sSUFBSSxVQUFVO0FBQUEsSUFDakIsUUFBUSxDQUFDO0FBQUEsSUFDVCxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLFFBQVEsUUFBUSxVQUFVO0FBQUEsSUFDMUIsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sWUFBTixNQUFNLG1CQUFrQixRQUFRO0FBQUEsRUFDbkMsY0FBYztBQUNWLFVBQU0sR0FBRyxTQUFTO0FBQ2xCLFNBQUssTUFBTSxLQUFLO0FBQ2hCLFNBQUssTUFBTSxLQUFLO0FBQUEsRUFDcEI7QUFBQSxFQUNBLE9BQU8sT0FBTztBQUNWLFFBQUksS0FBSyxLQUFLLFFBQVE7QUFDbEIsVUFBSTtBQUNBLGNBQU0sT0FBTyxPQUFPLE1BQU0sSUFBSTtBQUFBLE1BQ2xDLFFBQ007QUFDRixlQUFPLEtBQUssaUJBQWlCLEtBQUs7QUFBQSxNQUN0QztBQUFBLElBQ0o7QUFDQSxVQUFNLGFBQWEsS0FBSyxTQUFTLEtBQUs7QUFDdEMsUUFBSSxlQUFlLGNBQWMsUUFBUTtBQUNyQyxhQUFPLEtBQUssaUJBQWlCLEtBQUs7QUFBQSxJQUN0QztBQUNBLFFBQUksTUFBTTtBQUNWLFVBQU0sU0FBUyxJQUFJLFlBQVk7QUFDL0IsZUFBVyxTQUFTLEtBQUssS0FBSyxRQUFRO0FBQ2xDLFVBQUksTUFBTSxTQUFTLE9BQU87QUFDdEIsY0FBTSxXQUFXLE1BQU0sWUFBWSxNQUFNLE9BQU8sTUFBTSxRQUFRLE1BQU0sUUFBUSxNQUFNO0FBQ2xGLFlBQUksVUFBVTtBQUNWLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLE1BQU0sYUFBYTtBQUFBLFlBQ25CLE1BQU07QUFBQSxZQUNOLFNBQVMsTUFBTTtBQUFBLFlBQ2YsV0FBVyxNQUFNO0FBQUEsWUFDakIsU0FBUyxNQUFNO0FBQUEsVUFDbkIsQ0FBQztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0osV0FDUyxNQUFNLFNBQVMsT0FBTztBQUMzQixjQUFNLFNBQVMsTUFBTSxZQUFZLE1BQU0sT0FBTyxNQUFNLFFBQVEsTUFBTSxRQUFRLE1BQU07QUFDaEYsWUFBSSxRQUFRO0FBQ1IsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsTUFBTSxhQUFhO0FBQUEsWUFDbkIsTUFBTTtBQUFBLFlBQ04sU0FBUyxNQUFNO0FBQUEsWUFDZixXQUFXLE1BQU07QUFBQSxZQUNqQixTQUFTLE1BQU07QUFBQSxVQUNuQixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixXQUNTLE1BQU0sU0FBUyxjQUFjO0FBQ2xDLFlBQUksTUFBTSxPQUFPLE1BQU0sVUFBVSxPQUFPLENBQUMsR0FBRztBQUN4QyxnQkFBTSxLQUFLLGdCQUFnQixPQUFPLEdBQUc7QUFDckMsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixNQUFNLGFBQWE7QUFBQSxZQUNuQixZQUFZLE1BQU07QUFBQSxZQUNsQixTQUFTLE1BQU07QUFBQSxVQUNuQixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixPQUNLO0FBQ0QsYUFBSyxZQUFZLEtBQUs7QUFBQSxNQUMxQjtBQUFBLElBQ0o7QUFDQSxXQUFPLEVBQUUsUUFBUSxPQUFPLE9BQU8sT0FBTyxNQUFNLEtBQUs7QUFBQSxFQUNyRDtBQUFBLEVBQ0EsaUJBQWlCLE9BQU87QUFDcEIsVUFBTSxNQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDdEMsc0JBQWtCLEtBQUs7QUFBQSxNQUNuQixNQUFNLGFBQWE7QUFBQSxNQUNuQixVQUFVLGNBQWM7QUFBQSxNQUN4QixVQUFVLElBQUk7QUFBQSxJQUNsQixDQUFDO0FBQ0QsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUNBLElBQUksT0FBTyxTQUFTO0FBQ2hCLFdBQU8sS0FBSyxTQUFTLE9BQU8sT0FBTyxNQUFNLFVBQVUsU0FBUyxPQUFPLENBQUM7QUFBQSxFQUN4RTtBQUFBLEVBQ0EsR0FBRyxPQUFPLFNBQVM7QUFDZixXQUFPLEtBQUssU0FBUyxPQUFPLE9BQU8sT0FBTyxVQUFVLFNBQVMsT0FBTyxDQUFDO0FBQUEsRUFDekU7QUFBQSxFQUNBLElBQUksT0FBTyxTQUFTO0FBQ2hCLFdBQU8sS0FBSyxTQUFTLE9BQU8sT0FBTyxNQUFNLFVBQVUsU0FBUyxPQUFPLENBQUM7QUFBQSxFQUN4RTtBQUFBLEVBQ0EsR0FBRyxPQUFPLFNBQVM7QUFDZixXQUFPLEtBQUssU0FBUyxPQUFPLE9BQU8sT0FBTyxVQUFVLFNBQVMsT0FBTyxDQUFDO0FBQUEsRUFDekU7QUFBQSxFQUNBLFNBQVMsTUFBTSxPQUFPLFdBQVcsU0FBUztBQUN0QyxXQUFPLElBQUksV0FBVTtBQUFBLE1BQ2pCLEdBQUcsS0FBSztBQUFBLE1BQ1IsUUFBUTtBQUFBLFFBQ0osR0FBRyxLQUFLLEtBQUs7QUFBQSxRQUNiO0FBQUEsVUFDSTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQSxTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsUUFDdkM7QUFBQSxNQUNKO0FBQUEsSUFDSixDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsVUFBVSxPQUFPO0FBQ2IsV0FBTyxJQUFJLFdBQVU7QUFBQSxNQUNqQixHQUFHLEtBQUs7QUFBQSxNQUNSLFFBQVEsQ0FBQyxHQUFHLEtBQUssS0FBSyxRQUFRLEtBQUs7QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsU0FBUyxTQUFTO0FBQ2QsV0FBTyxLQUFLLFVBQVU7QUFBQSxNQUNsQixNQUFNO0FBQUEsTUFDTixPQUFPLE9BQU8sQ0FBQztBQUFBLE1BQ2YsV0FBVztBQUFBLE1BQ1gsU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxTQUFTLFNBQVM7QUFDZCxXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOLE9BQU8sT0FBTyxDQUFDO0FBQUEsTUFDZixXQUFXO0FBQUEsTUFDWCxTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFlBQVksU0FBUztBQUNqQixXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOLE9BQU8sT0FBTyxDQUFDO0FBQUEsTUFDZixXQUFXO0FBQUEsTUFDWCxTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFlBQVksU0FBUztBQUNqQixXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOLE9BQU8sT0FBTyxDQUFDO0FBQUEsTUFDZixXQUFXO0FBQUEsTUFDWCxTQUFTLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFdBQVcsT0FBTyxTQUFTO0FBQ3ZCLFdBQU8sS0FBSyxVQUFVO0FBQUEsTUFDbEIsTUFBTTtBQUFBLE1BQ047QUFBQSxNQUNBLFNBQVMsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsSUFBSSxXQUFXO0FBQ1gsUUFBSSxNQUFNO0FBQ1YsZUFBVyxNQUFNLEtBQUssS0FBSyxRQUFRO0FBQy9CLFVBQUksR0FBRyxTQUFTLE9BQU87QUFDbkIsWUFBSSxRQUFRLFFBQVEsR0FBRyxRQUFRO0FBQzNCLGdCQUFNLEdBQUc7QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsSUFBSSxXQUFXO0FBQ1gsUUFBSSxNQUFNO0FBQ1YsZUFBVyxNQUFNLEtBQUssS0FBSyxRQUFRO0FBQy9CLFVBQUksR0FBRyxTQUFTLE9BQU87QUFDbkIsWUFBSSxRQUFRLFFBQVEsR0FBRyxRQUFRO0FBQzNCLGdCQUFNLEdBQUc7QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUNKO0FBQ0EsVUFBVSxTQUFTLENBQUMsV0FBVztBQUMzQixTQUFPLElBQUksVUFBVTtBQUFBLElBQ2pCLFFBQVEsQ0FBQztBQUFBLElBQ1QsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxRQUFRLFFBQVEsVUFBVTtBQUFBLElBQzFCLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLGFBQU4sY0FBeUIsUUFBUTtBQUFBLEVBQ3BDLE9BQU8sT0FBTztBQUNWLFFBQUksS0FBSyxLQUFLLFFBQVE7QUFDbEIsWUFBTSxPQUFPLFFBQVEsTUFBTSxJQUFJO0FBQUEsSUFDbkM7QUFDQSxVQUFNLGFBQWEsS0FBSyxTQUFTLEtBQUs7QUFDdEMsUUFBSSxlQUFlLGNBQWMsU0FBUztBQUN0QyxZQUFNLE1BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0Qyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVUsSUFBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFdBQU8sR0FBRyxNQUFNLElBQUk7QUFBQSxFQUN4QjtBQUNKO0FBQ0EsV0FBVyxTQUFTLENBQUMsV0FBVztBQUM1QixTQUFPLElBQUksV0FBVztBQUFBLElBQ2xCLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsUUFBUSxRQUFRLFVBQVU7QUFBQSxJQUMxQixHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxVQUFOLE1BQU0saUJBQWdCLFFBQVE7QUFBQSxFQUNqQyxPQUFPLE9BQU87QUFDVixRQUFJLEtBQUssS0FBSyxRQUFRO0FBQ2xCLFlBQU0sT0FBTyxJQUFJLEtBQUssTUFBTSxJQUFJO0FBQUEsSUFDcEM7QUFDQSxVQUFNLGFBQWEsS0FBSyxTQUFTLEtBQUs7QUFDdEMsUUFBSSxlQUFlLGNBQWMsTUFBTTtBQUNuQyxZQUFNQSxPQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDdEMsd0JBQWtCQSxNQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVUEsS0FBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFFBQUksT0FBTyxNQUFNLE1BQU0sS0FBSyxRQUFRLENBQUMsR0FBRztBQUNwQyxZQUFNQSxPQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDdEMsd0JBQWtCQSxNQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsTUFDdkIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsVUFBTSxTQUFTLElBQUksWUFBWTtBQUMvQixRQUFJLE1BQU07QUFDVixlQUFXLFNBQVMsS0FBSyxLQUFLLFFBQVE7QUFDbEMsVUFBSSxNQUFNLFNBQVMsT0FBTztBQUN0QixZQUFJLE1BQU0sS0FBSyxRQUFRLElBQUksTUFBTSxPQUFPO0FBQ3BDLGdCQUFNLEtBQUssZ0JBQWdCLE9BQU8sR0FBRztBQUNyQyw0QkFBa0IsS0FBSztBQUFBLFlBQ25CLE1BQU0sYUFBYTtBQUFBLFlBQ25CLFNBQVMsTUFBTTtBQUFBLFlBQ2YsV0FBVztBQUFBLFlBQ1gsT0FBTztBQUFBLFlBQ1AsU0FBUyxNQUFNO0FBQUEsWUFDZixNQUFNO0FBQUEsVUFDVixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixXQUNTLE1BQU0sU0FBUyxPQUFPO0FBQzNCLFlBQUksTUFBTSxLQUFLLFFBQVEsSUFBSSxNQUFNLE9BQU87QUFDcEMsZ0JBQU0sS0FBSyxnQkFBZ0IsT0FBTyxHQUFHO0FBQ3JDLDRCQUFrQixLQUFLO0FBQUEsWUFDbkIsTUFBTSxhQUFhO0FBQUEsWUFDbkIsU0FBUyxNQUFNO0FBQUEsWUFDZixXQUFXO0FBQUEsWUFDWCxPQUFPO0FBQUEsWUFDUCxTQUFTLE1BQU07QUFBQSxZQUNmLE1BQU07QUFBQSxVQUNWLENBQUM7QUFDRCxpQkFBTyxNQUFNO0FBQUEsUUFDakI7QUFBQSxNQUNKLE9BQ0s7QUFDRCxhQUFLLFlBQVksS0FBSztBQUFBLE1BQzFCO0FBQUEsSUFDSjtBQUNBLFdBQU87QUFBQSxNQUNILFFBQVEsT0FBTztBQUFBLE1BQ2YsT0FBTyxJQUFJLEtBQUssTUFBTSxLQUFLLFFBQVEsQ0FBQztBQUFBLElBQ3hDO0FBQUEsRUFDSjtBQUFBLEVBQ0EsVUFBVSxPQUFPO0FBQ2IsV0FBTyxJQUFJLFNBQVE7QUFBQSxNQUNmLEdBQUcsS0FBSztBQUFBLE1BQ1IsUUFBUSxDQUFDLEdBQUcsS0FBSyxLQUFLLFFBQVEsS0FBSztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxJQUFJLFNBQVMsU0FBUztBQUNsQixXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOLE9BQU8sUUFBUSxRQUFRO0FBQUEsTUFDdkIsU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxJQUFJLFNBQVMsU0FBUztBQUNsQixXQUFPLEtBQUssVUFBVTtBQUFBLE1BQ2xCLE1BQU07QUFBQSxNQUNOLE9BQU8sUUFBUSxRQUFRO0FBQUEsTUFDdkIsU0FBUyxVQUFVLFNBQVMsT0FBTztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxJQUFJLFVBQVU7QUFDVixRQUFJLE1BQU07QUFDVixlQUFXLE1BQU0sS0FBSyxLQUFLLFFBQVE7QUFDL0IsVUFBSSxHQUFHLFNBQVMsT0FBTztBQUNuQixZQUFJLFFBQVEsUUFBUSxHQUFHLFFBQVE7QUFDM0IsZ0JBQU0sR0FBRztBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUNBLFdBQU8sT0FBTyxPQUFPLElBQUksS0FBSyxHQUFHLElBQUk7QUFBQSxFQUN6QztBQUFBLEVBQ0EsSUFBSSxVQUFVO0FBQ1YsUUFBSSxNQUFNO0FBQ1YsZUFBVyxNQUFNLEtBQUssS0FBSyxRQUFRO0FBQy9CLFVBQUksR0FBRyxTQUFTLE9BQU87QUFDbkIsWUFBSSxRQUFRLFFBQVEsR0FBRyxRQUFRO0FBQzNCLGdCQUFNLEdBQUc7QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFDQSxXQUFPLE9BQU8sT0FBTyxJQUFJLEtBQUssR0FBRyxJQUFJO0FBQUEsRUFDekM7QUFDSjtBQUNBLFFBQVEsU0FBUyxDQUFDLFdBQVc7QUFDekIsU0FBTyxJQUFJLFFBQVE7QUFBQSxJQUNmLFFBQVEsQ0FBQztBQUFBLElBQ1QsUUFBUSxRQUFRLFVBQVU7QUFBQSxJQUMxQixVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLFlBQU4sY0FBd0IsUUFBUTtBQUFBLEVBQ25DLE9BQU8sT0FBTztBQUNWLFVBQU0sYUFBYSxLQUFLLFNBQVMsS0FBSztBQUN0QyxRQUFJLGVBQWUsY0FBYyxRQUFRO0FBQ3JDLFlBQU0sTUFBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ3RDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVSxJQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsV0FBTyxHQUFHLE1BQU0sSUFBSTtBQUFBLEVBQ3hCO0FBQ0o7QUFDQSxVQUFVLFNBQVMsQ0FBQyxXQUFXO0FBQzNCLFNBQU8sSUFBSSxVQUFVO0FBQUEsSUFDakIsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxlQUFOLGNBQTJCLFFBQVE7QUFBQSxFQUN0QyxPQUFPLE9BQU87QUFDVixVQUFNLGFBQWEsS0FBSyxTQUFTLEtBQUs7QUFDdEMsUUFBSSxlQUFlLGNBQWMsV0FBVztBQUN4QyxZQUFNLE1BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0Qyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVUsSUFBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFdBQU8sR0FBRyxNQUFNLElBQUk7QUFBQSxFQUN4QjtBQUNKO0FBQ0EsYUFBYSxTQUFTLENBQUMsV0FBVztBQUM5QixTQUFPLElBQUksYUFBYTtBQUFBLElBQ3BCLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sVUFBTixjQUFzQixRQUFRO0FBQUEsRUFDakMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxhQUFhLEtBQUssU0FBUyxLQUFLO0FBQ3RDLFFBQUksZUFBZSxjQUFjLE1BQU07QUFDbkMsWUFBTSxNQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDdEMsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVLElBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxXQUFPLEdBQUcsTUFBTSxJQUFJO0FBQUEsRUFDeEI7QUFDSjtBQUNBLFFBQVEsU0FBUyxDQUFDLFdBQVc7QUFDekIsU0FBTyxJQUFJLFFBQVE7QUFBQSxJQUNmLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sU0FBTixjQUFxQixRQUFRO0FBQUEsRUFDaEMsY0FBYztBQUNWLFVBQU0sR0FBRyxTQUFTO0FBRWxCLFNBQUssT0FBTztBQUFBLEVBQ2hCO0FBQUEsRUFDQSxPQUFPLE9BQU87QUFDVixXQUFPLEdBQUcsTUFBTSxJQUFJO0FBQUEsRUFDeEI7QUFDSjtBQUNBLE9BQU8sU0FBUyxDQUFDLFdBQVc7QUFDeEIsU0FBTyxJQUFJLE9BQU87QUFBQSxJQUNkLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sYUFBTixjQUF5QixRQUFRO0FBQUEsRUFDcEMsY0FBYztBQUNWLFVBQU0sR0FBRyxTQUFTO0FBRWxCLFNBQUssV0FBVztBQUFBLEVBQ3BCO0FBQUEsRUFDQSxPQUFPLE9BQU87QUFDVixXQUFPLEdBQUcsTUFBTSxJQUFJO0FBQUEsRUFDeEI7QUFDSjtBQUNBLFdBQVcsU0FBUyxDQUFDLFdBQVc7QUFDNUIsU0FBTyxJQUFJLFdBQVc7QUFBQSxJQUNsQixVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLFdBQU4sY0FBdUIsUUFBUTtBQUFBLEVBQ2xDLE9BQU8sT0FBTztBQUNWLFVBQU0sTUFBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ3RDLHNCQUFrQixLQUFLO0FBQUEsTUFDbkIsTUFBTSxhQUFhO0FBQUEsTUFDbkIsVUFBVSxjQUFjO0FBQUEsTUFDeEIsVUFBVSxJQUFJO0FBQUEsSUFDbEIsQ0FBQztBQUNELFdBQU87QUFBQSxFQUNYO0FBQ0o7QUFDQSxTQUFTLFNBQVMsQ0FBQyxXQUFXO0FBQzFCLFNBQU8sSUFBSSxTQUFTO0FBQUEsSUFDaEIsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxVQUFOLGNBQXNCLFFBQVE7QUFBQSxFQUNqQyxPQUFPLE9BQU87QUFDVixVQUFNLGFBQWEsS0FBSyxTQUFTLEtBQUs7QUFDdEMsUUFBSSxlQUFlLGNBQWMsV0FBVztBQUN4QyxZQUFNLE1BQU0sS0FBSyxnQkFBZ0IsS0FBSztBQUN0Qyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVUsSUFBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFdBQU8sR0FBRyxNQUFNLElBQUk7QUFBQSxFQUN4QjtBQUNKO0FBQ0EsUUFBUSxTQUFTLENBQUMsV0FBVztBQUN6QixTQUFPLElBQUksUUFBUTtBQUFBLElBQ2YsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxXQUFOLE1BQU0sa0JBQWlCLFFBQVE7QUFBQSxFQUNsQyxPQUFPLE9BQU87QUFDVixVQUFNLEVBQUUsS0FBSyxPQUFPLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUN0RCxVQUFNLE1BQU0sS0FBSztBQUNqQixRQUFJLElBQUksZUFBZSxjQUFjLE9BQU87QUFDeEMsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixVQUFVLGNBQWM7QUFBQSxRQUN4QixVQUFVLElBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxRQUFJLElBQUksZ0JBQWdCLE1BQU07QUFDMUIsWUFBTSxTQUFTLElBQUksS0FBSyxTQUFTLElBQUksWUFBWTtBQUNqRCxZQUFNLFdBQVcsSUFBSSxLQUFLLFNBQVMsSUFBSSxZQUFZO0FBQ25ELFVBQUksVUFBVSxVQUFVO0FBQ3BCLDBCQUFrQixLQUFLO0FBQUEsVUFDbkIsTUFBTSxTQUFTLGFBQWEsVUFBVSxhQUFhO0FBQUEsVUFDbkQsU0FBVSxXQUFXLElBQUksWUFBWSxRQUFRO0FBQUEsVUFDN0MsU0FBVSxTQUFTLElBQUksWUFBWSxRQUFRO0FBQUEsVUFDM0MsTUFBTTtBQUFBLFVBQ04sV0FBVztBQUFBLFVBQ1gsT0FBTztBQUFBLFVBQ1AsU0FBUyxJQUFJLFlBQVk7QUFBQSxRQUM3QixDQUFDO0FBQ0QsZUFBTyxNQUFNO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQ0EsUUFBSSxJQUFJLGNBQWMsTUFBTTtBQUN4QixVQUFJLElBQUksS0FBSyxTQUFTLElBQUksVUFBVSxPQUFPO0FBQ3ZDLDBCQUFrQixLQUFLO0FBQUEsVUFDbkIsTUFBTSxhQUFhO0FBQUEsVUFDbkIsU0FBUyxJQUFJLFVBQVU7QUFBQSxVQUN2QixNQUFNO0FBQUEsVUFDTixXQUFXO0FBQUEsVUFDWCxPQUFPO0FBQUEsVUFDUCxTQUFTLElBQUksVUFBVTtBQUFBLFFBQzNCLENBQUM7QUFDRCxlQUFPLE1BQU07QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFDQSxRQUFJLElBQUksY0FBYyxNQUFNO0FBQ3hCLFVBQUksSUFBSSxLQUFLLFNBQVMsSUFBSSxVQUFVLE9BQU87QUFDdkMsMEJBQWtCLEtBQUs7QUFBQSxVQUNuQixNQUFNLGFBQWE7QUFBQSxVQUNuQixTQUFTLElBQUksVUFBVTtBQUFBLFVBQ3ZCLE1BQU07QUFBQSxVQUNOLFdBQVc7QUFBQSxVQUNYLE9BQU87QUFBQSxVQUNQLFNBQVMsSUFBSSxVQUFVO0FBQUEsUUFDM0IsQ0FBQztBQUNELGVBQU8sTUFBTTtBQUFBLE1BQ2pCO0FBQUEsSUFDSjtBQUNBLFFBQUksSUFBSSxPQUFPLE9BQU87QUFDbEIsYUFBTyxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLE1BQU07QUFDOUMsZUFBTyxJQUFJLEtBQUssWUFBWSxJQUFJLG1CQUFtQixLQUFLLE1BQU0sSUFBSSxNQUFNLENBQUMsQ0FBQztBQUFBLE1BQzlFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQ0MsWUFBVztBQUNqQixlQUFPLFlBQVksV0FBVyxRQUFRQSxPQUFNO0FBQUEsTUFDaEQsQ0FBQztBQUFBLElBQ0w7QUFDQSxVQUFNLFNBQVMsQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLE1BQU07QUFDMUMsYUFBTyxJQUFJLEtBQUssV0FBVyxJQUFJLG1CQUFtQixLQUFLLE1BQU0sSUFBSSxNQUFNLENBQUMsQ0FBQztBQUFBLElBQzdFLENBQUM7QUFDRCxXQUFPLFlBQVksV0FBVyxRQUFRLE1BQU07QUFBQSxFQUNoRDtBQUFBLEVBQ0EsSUFBSSxVQUFVO0FBQ1YsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsSUFBSSxXQUFXLFNBQVM7QUFDcEIsV0FBTyxJQUFJLFVBQVM7QUFBQSxNQUNoQixHQUFHLEtBQUs7QUFBQSxNQUNSLFdBQVcsRUFBRSxPQUFPLFdBQVcsU0FBUyxVQUFVLFNBQVMsT0FBTyxFQUFFO0FBQUEsSUFDeEUsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLElBQUksV0FBVyxTQUFTO0FBQ3BCLFdBQU8sSUFBSSxVQUFTO0FBQUEsTUFDaEIsR0FBRyxLQUFLO0FBQUEsTUFDUixXQUFXLEVBQUUsT0FBTyxXQUFXLFNBQVMsVUFBVSxTQUFTLE9BQU8sRUFBRTtBQUFBLElBQ3hFLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxPQUFPLEtBQUssU0FBUztBQUNqQixXQUFPLElBQUksVUFBUztBQUFBLE1BQ2hCLEdBQUcsS0FBSztBQUFBLE1BQ1IsYUFBYSxFQUFFLE9BQU8sS0FBSyxTQUFTLFVBQVUsU0FBUyxPQUFPLEVBQUU7QUFBQSxJQUNwRSxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsU0FBUyxTQUFTO0FBQ2QsV0FBTyxLQUFLLElBQUksR0FBRyxPQUFPO0FBQUEsRUFDOUI7QUFDSjtBQUNBLFNBQVMsU0FBUyxDQUFDLFFBQVEsV0FBVztBQUNsQyxTQUFPLElBQUksU0FBUztBQUFBLElBQ2hCLE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxJQUNYLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNBLFNBQVMsZUFBZSxRQUFRO0FBQzVCLE1BQUksa0JBQWtCLFdBQVc7QUFDN0IsVUFBTSxXQUFXLENBQUM7QUFDbEIsZUFBVyxPQUFPLE9BQU8sT0FBTztBQUM1QixZQUFNLGNBQWMsT0FBTyxNQUFNLEdBQUc7QUFDcEMsZUFBUyxHQUFHLElBQUksWUFBWSxPQUFPLGVBQWUsV0FBVyxDQUFDO0FBQUEsSUFDbEU7QUFDQSxXQUFPLElBQUksVUFBVTtBQUFBLE1BQ2pCLEdBQUcsT0FBTztBQUFBLE1BQ1YsT0FBTyxNQUFNO0FBQUEsSUFDakIsQ0FBQztBQUFBLEVBQ0wsV0FDUyxrQkFBa0IsVUFBVTtBQUNqQyxXQUFPLElBQUksU0FBUztBQUFBLE1BQ2hCLEdBQUcsT0FBTztBQUFBLE1BQ1YsTUFBTSxlQUFlLE9BQU8sT0FBTztBQUFBLElBQ3ZDLENBQUM7QUFBQSxFQUNMLFdBQ1Msa0JBQWtCLGFBQWE7QUFDcEMsV0FBTyxZQUFZLE9BQU8sZUFBZSxPQUFPLE9BQU8sQ0FBQyxDQUFDO0FBQUEsRUFDN0QsV0FDUyxrQkFBa0IsYUFBYTtBQUNwQyxXQUFPLFlBQVksT0FBTyxlQUFlLE9BQU8sT0FBTyxDQUFDLENBQUM7QUFBQSxFQUM3RCxXQUNTLGtCQUFrQixVQUFVO0FBQ2pDLFdBQU8sU0FBUyxPQUFPLE9BQU8sTUFBTSxJQUFJLENBQUMsU0FBUyxlQUFlLElBQUksQ0FBQyxDQUFDO0FBQUEsRUFDM0UsT0FDSztBQUNELFdBQU87QUFBQSxFQUNYO0FBQ0o7QUFDTyxJQUFNLFlBQU4sTUFBTSxtQkFBa0IsUUFBUTtBQUFBLEVBQ25DLGNBQWM7QUFDVixVQUFNLEdBQUcsU0FBUztBQUNsQixTQUFLLFVBQVU7QUFLZixTQUFLLFlBQVksS0FBSztBQXFDdEIsU0FBSyxVQUFVLEtBQUs7QUFBQSxFQUN4QjtBQUFBLEVBQ0EsYUFBYTtBQUNULFFBQUksS0FBSyxZQUFZO0FBQ2pCLGFBQU8sS0FBSztBQUNoQixVQUFNLFFBQVEsS0FBSyxLQUFLLE1BQU07QUFDOUIsVUFBTSxPQUFPLEtBQUssV0FBVyxLQUFLO0FBQ2xDLFNBQUssVUFBVSxFQUFFLE9BQU8sS0FBSztBQUM3QixXQUFPLEtBQUs7QUFBQSxFQUNoQjtBQUFBLEVBQ0EsT0FBTyxPQUFPO0FBQ1YsVUFBTSxhQUFhLEtBQUssU0FBUyxLQUFLO0FBQ3RDLFFBQUksZUFBZSxjQUFjLFFBQVE7QUFDckMsWUFBTUQsT0FBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ3RDLHdCQUFrQkEsTUFBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVVBLEtBQUk7QUFBQSxNQUNsQixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxVQUFNLEVBQUUsUUFBUSxJQUFJLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUN0RCxVQUFNLEVBQUUsT0FBTyxNQUFNLFVBQVUsSUFBSSxLQUFLLFdBQVc7QUFDbkQsVUFBTSxZQUFZLENBQUM7QUFDbkIsUUFBSSxFQUFFLEtBQUssS0FBSyxvQkFBb0IsWUFBWSxLQUFLLEtBQUssZ0JBQWdCLFVBQVU7QUFDaEYsaUJBQVcsT0FBTyxJQUFJLE1BQU07QUFDeEIsWUFBSSxDQUFDLFVBQVUsU0FBUyxHQUFHLEdBQUc7QUFDMUIsb0JBQVUsS0FBSyxHQUFHO0FBQUEsUUFDdEI7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUNBLFVBQU0sUUFBUSxDQUFDO0FBQ2YsZUFBVyxPQUFPLFdBQVc7QUFDekIsWUFBTSxlQUFlLE1BQU0sR0FBRztBQUM5QixZQUFNLFFBQVEsSUFBSSxLQUFLLEdBQUc7QUFDMUIsWUFBTSxLQUFLO0FBQUEsUUFDUCxLQUFLLEVBQUUsUUFBUSxTQUFTLE9BQU8sSUFBSTtBQUFBLFFBQ25DLE9BQU8sYUFBYSxPQUFPLElBQUksbUJBQW1CLEtBQUssT0FBTyxJQUFJLE1BQU0sR0FBRyxDQUFDO0FBQUEsUUFDNUUsV0FBVyxPQUFPLElBQUk7QUFBQSxNQUMxQixDQUFDO0FBQUEsSUFDTDtBQUNBLFFBQUksS0FBSyxLQUFLLG9CQUFvQixVQUFVO0FBQ3hDLFlBQU0sY0FBYyxLQUFLLEtBQUs7QUFDOUIsVUFBSSxnQkFBZ0IsZUFBZTtBQUMvQixtQkFBVyxPQUFPLFdBQVc7QUFDekIsZ0JBQU0sS0FBSztBQUFBLFlBQ1AsS0FBSyxFQUFFLFFBQVEsU0FBUyxPQUFPLElBQUk7QUFBQSxZQUNuQyxPQUFPLEVBQUUsUUFBUSxTQUFTLE9BQU8sSUFBSSxLQUFLLEdBQUcsRUFBRTtBQUFBLFVBQ25ELENBQUM7QUFBQSxRQUNMO0FBQUEsTUFDSixXQUNTLGdCQUFnQixVQUFVO0FBQy9CLFlBQUksVUFBVSxTQUFTLEdBQUc7QUFDdEIsNEJBQWtCLEtBQUs7QUFBQSxZQUNuQixNQUFNLGFBQWE7QUFBQSxZQUNuQixNQUFNO0FBQUEsVUFDVixDQUFDO0FBQ0QsaUJBQU8sTUFBTTtBQUFBLFFBQ2pCO0FBQUEsTUFDSixXQUNTLGdCQUFnQixTQUFTO0FBQUEsTUFDbEMsT0FDSztBQUNELGNBQU0sSUFBSSxNQUFNLHNEQUFzRDtBQUFBLE1BQzFFO0FBQUEsSUFDSixPQUNLO0FBRUQsWUFBTSxXQUFXLEtBQUssS0FBSztBQUMzQixpQkFBVyxPQUFPLFdBQVc7QUFDekIsY0FBTSxRQUFRLElBQUksS0FBSyxHQUFHO0FBQzFCLGNBQU0sS0FBSztBQUFBLFVBQ1AsS0FBSyxFQUFFLFFBQVEsU0FBUyxPQUFPLElBQUk7QUFBQSxVQUNuQyxPQUFPLFNBQVM7QUFBQSxZQUFPLElBQUksbUJBQW1CLEtBQUssT0FBTyxJQUFJLE1BQU0sR0FBRztBQUFBO0FBQUEsVUFDdkU7QUFBQSxVQUNBLFdBQVcsT0FBTyxJQUFJO0FBQUEsUUFDMUIsQ0FBQztBQUFBLE1BQ0w7QUFBQSxJQUNKO0FBQ0EsUUFBSSxJQUFJLE9BQU8sT0FBTztBQUNsQixhQUFPLFFBQVEsUUFBUSxFQUNsQixLQUFLLFlBQVk7QUFDbEIsY0FBTSxZQUFZLENBQUM7QUFDbkIsbUJBQVcsUUFBUSxPQUFPO0FBQ3RCLGdCQUFNLE1BQU0sTUFBTSxLQUFLO0FBQ3ZCLGdCQUFNLFFBQVEsTUFBTSxLQUFLO0FBQ3pCLG9CQUFVLEtBQUs7QUFBQSxZQUNYO0FBQUEsWUFDQTtBQUFBLFlBQ0EsV0FBVyxLQUFLO0FBQUEsVUFDcEIsQ0FBQztBQUFBLFFBQ0w7QUFDQSxlQUFPO0FBQUEsTUFDWCxDQUFDLEVBQ0ksS0FBSyxDQUFDLGNBQWM7QUFDckIsZUFBTyxZQUFZLGdCQUFnQixRQUFRLFNBQVM7QUFBQSxNQUN4RCxDQUFDO0FBQUEsSUFDTCxPQUNLO0FBQ0QsYUFBTyxZQUFZLGdCQUFnQixRQUFRLEtBQUs7QUFBQSxJQUNwRDtBQUFBLEVBQ0o7QUFBQSxFQUNBLElBQUksUUFBUTtBQUNSLFdBQU8sS0FBSyxLQUFLLE1BQU07QUFBQSxFQUMzQjtBQUFBLEVBQ0EsT0FBTyxTQUFTO0FBQ1osY0FBVTtBQUNWLFdBQU8sSUFBSSxXQUFVO0FBQUEsTUFDakIsR0FBRyxLQUFLO0FBQUEsTUFDUixhQUFhO0FBQUEsTUFDYixHQUFJLFlBQVksU0FDVjtBQUFBLFFBQ0UsVUFBVSxDQUFDLE9BQU8sUUFBUTtBQUN0QixnQkFBTSxlQUFlLEtBQUssS0FBSyxXQUFXLE9BQU8sR0FBRyxFQUFFLFdBQVcsSUFBSTtBQUNyRSxjQUFJLE1BQU0sU0FBUztBQUNmLG1CQUFPO0FBQUEsY0FDSCxTQUFTLFVBQVUsU0FBUyxPQUFPLEVBQUUsV0FBVztBQUFBLFlBQ3BEO0FBQ0osaUJBQU87QUFBQSxZQUNILFNBQVM7QUFBQSxVQUNiO0FBQUEsUUFDSjtBQUFBLE1BQ0osSUFDRSxDQUFDO0FBQUEsSUFDWCxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsUUFBUTtBQUNKLFdBQU8sSUFBSSxXQUFVO0FBQUEsTUFDakIsR0FBRyxLQUFLO0FBQUEsTUFDUixhQUFhO0FBQUEsSUFDakIsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLGNBQWM7QUFDVixXQUFPLElBQUksV0FBVTtBQUFBLE1BQ2pCLEdBQUcsS0FBSztBQUFBLE1BQ1IsYUFBYTtBQUFBLElBQ2pCLENBQUM7QUFBQSxFQUNMO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBa0JBLE9BQU8sY0FBYztBQUNqQixXQUFPLElBQUksV0FBVTtBQUFBLE1BQ2pCLEdBQUcsS0FBSztBQUFBLE1BQ1IsT0FBTyxPQUFPO0FBQUEsUUFDVixHQUFHLEtBQUssS0FBSyxNQUFNO0FBQUEsUUFDbkIsR0FBRztBQUFBLE1BQ1A7QUFBQSxJQUNKLENBQUM7QUFBQSxFQUNMO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTUEsTUFBTSxTQUFTO0FBQ1gsVUFBTSxTQUFTLElBQUksV0FBVTtBQUFBLE1BQ3pCLGFBQWEsUUFBUSxLQUFLO0FBQUEsTUFDMUIsVUFBVSxRQUFRLEtBQUs7QUFBQSxNQUN2QixPQUFPLE9BQU87QUFBQSxRQUNWLEdBQUcsS0FBSyxLQUFLLE1BQU07QUFBQSxRQUNuQixHQUFHLFFBQVEsS0FBSyxNQUFNO0FBQUEsTUFDMUI7QUFBQSxNQUNBLFVBQVUsc0JBQXNCO0FBQUEsSUFDcEMsQ0FBQztBQUNELFdBQU87QUFBQSxFQUNYO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBb0NBLE9BQU8sS0FBSyxRQUFRO0FBQ2hCLFdBQU8sS0FBSyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDO0FBQUEsRUFDekM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQXNCQSxTQUFTLE9BQU87QUFDWixXQUFPLElBQUksV0FBVTtBQUFBLE1BQ2pCLEdBQUcsS0FBSztBQUFBLE1BQ1IsVUFBVTtBQUFBLElBQ2QsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLEtBQUssTUFBTTtBQUNQLFVBQU0sUUFBUSxDQUFDO0FBQ2YsZUFBVyxPQUFPLEtBQUssV0FBVyxJQUFJLEdBQUc7QUFDckMsVUFBSSxLQUFLLEdBQUcsS0FBSyxLQUFLLE1BQU0sR0FBRyxHQUFHO0FBQzlCLGNBQU0sR0FBRyxJQUFJLEtBQUssTUFBTSxHQUFHO0FBQUEsTUFDL0I7QUFBQSxJQUNKO0FBQ0EsV0FBTyxJQUFJLFdBQVU7QUFBQSxNQUNqQixHQUFHLEtBQUs7QUFBQSxNQUNSLE9BQU8sTUFBTTtBQUFBLElBQ2pCLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxLQUFLLE1BQU07QUFDUCxVQUFNLFFBQVEsQ0FBQztBQUNmLGVBQVcsT0FBTyxLQUFLLFdBQVcsS0FBSyxLQUFLLEdBQUc7QUFDM0MsVUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHO0FBQ1osY0FBTSxHQUFHLElBQUksS0FBSyxNQUFNLEdBQUc7QUFBQSxNQUMvQjtBQUFBLElBQ0o7QUFDQSxXQUFPLElBQUksV0FBVTtBQUFBLE1BQ2pCLEdBQUcsS0FBSztBQUFBLE1BQ1IsT0FBTyxNQUFNO0FBQUEsSUFDakIsQ0FBQztBQUFBLEVBQ0w7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUlBLGNBQWM7QUFDVixXQUFPLGVBQWUsSUFBSTtBQUFBLEVBQzlCO0FBQUEsRUFDQSxRQUFRLE1BQU07QUFDVixVQUFNLFdBQVcsQ0FBQztBQUNsQixlQUFXLE9BQU8sS0FBSyxXQUFXLEtBQUssS0FBSyxHQUFHO0FBQzNDLFlBQU0sY0FBYyxLQUFLLE1BQU0sR0FBRztBQUNsQyxVQUFJLFFBQVEsQ0FBQyxLQUFLLEdBQUcsR0FBRztBQUNwQixpQkFBUyxHQUFHLElBQUk7QUFBQSxNQUNwQixPQUNLO0FBQ0QsaUJBQVMsR0FBRyxJQUFJLFlBQVksU0FBUztBQUFBLE1BQ3pDO0FBQUEsSUFDSjtBQUNBLFdBQU8sSUFBSSxXQUFVO0FBQUEsTUFDakIsR0FBRyxLQUFLO0FBQUEsTUFDUixPQUFPLE1BQU07QUFBQSxJQUNqQixDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsU0FBUyxNQUFNO0FBQ1gsVUFBTSxXQUFXLENBQUM7QUFDbEIsZUFBVyxPQUFPLEtBQUssV0FBVyxLQUFLLEtBQUssR0FBRztBQUMzQyxVQUFJLFFBQVEsQ0FBQyxLQUFLLEdBQUcsR0FBRztBQUNwQixpQkFBUyxHQUFHLElBQUksS0FBSyxNQUFNLEdBQUc7QUFBQSxNQUNsQyxPQUNLO0FBQ0QsY0FBTSxjQUFjLEtBQUssTUFBTSxHQUFHO0FBQ2xDLFlBQUksV0FBVztBQUNmLGVBQU8sb0JBQW9CLGFBQWE7QUFDcEMscUJBQVcsU0FBUyxLQUFLO0FBQUEsUUFDN0I7QUFDQSxpQkFBUyxHQUFHLElBQUk7QUFBQSxNQUNwQjtBQUFBLElBQ0o7QUFDQSxXQUFPLElBQUksV0FBVTtBQUFBLE1BQ2pCLEdBQUcsS0FBSztBQUFBLE1BQ1IsT0FBTyxNQUFNO0FBQUEsSUFDakIsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFFBQVE7QUFDSixXQUFPLGNBQWMsS0FBSyxXQUFXLEtBQUssS0FBSyxDQUFDO0FBQUEsRUFDcEQ7QUFDSjtBQUNBLFVBQVUsU0FBUyxDQUFDLE9BQU8sV0FBVztBQUNsQyxTQUFPLElBQUksVUFBVTtBQUFBLElBQ2pCLE9BQU8sTUFBTTtBQUFBLElBQ2IsYUFBYTtBQUFBLElBQ2IsVUFBVSxTQUFTLE9BQU87QUFBQSxJQUMxQixVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDQSxVQUFVLGVBQWUsQ0FBQyxPQUFPLFdBQVc7QUFDeEMsU0FBTyxJQUFJLFVBQVU7QUFBQSxJQUNqQixPQUFPLE1BQU07QUFBQSxJQUNiLGFBQWE7QUFBQSxJQUNiLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDMUIsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ0EsVUFBVSxhQUFhLENBQUMsT0FBTyxXQUFXO0FBQ3RDLFNBQU8sSUFBSSxVQUFVO0FBQUEsSUFDakI7QUFBQSxJQUNBLGFBQWE7QUFBQSxJQUNiLFVBQVUsU0FBUyxPQUFPO0FBQUEsSUFDMUIsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxXQUFOLGNBQXVCLFFBQVE7QUFBQSxFQUNsQyxPQUFPLE9BQU87QUFDVixVQUFNLEVBQUUsSUFBSSxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFDOUMsVUFBTSxVQUFVLEtBQUssS0FBSztBQUMxQixhQUFTLGNBQWMsU0FBUztBQUU1QixpQkFBVyxVQUFVLFNBQVM7QUFDMUIsWUFBSSxPQUFPLE9BQU8sV0FBVyxTQUFTO0FBQ2xDLGlCQUFPLE9BQU87QUFBQSxRQUNsQjtBQUFBLE1BQ0o7QUFDQSxpQkFBVyxVQUFVLFNBQVM7QUFDMUIsWUFBSSxPQUFPLE9BQU8sV0FBVyxTQUFTO0FBRWxDLGNBQUksT0FBTyxPQUFPLEtBQUssR0FBRyxPQUFPLElBQUksT0FBTyxNQUFNO0FBQ2xELGlCQUFPLE9BQU87QUFBQSxRQUNsQjtBQUFBLE1BQ0o7QUFFQSxZQUFNLGNBQWMsUUFBUSxJQUFJLENBQUMsV0FBVyxJQUFJLFNBQVMsT0FBTyxJQUFJLE9BQU8sTUFBTSxDQUFDO0FBQ2xGLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkI7QUFBQSxNQUNKLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFFBQUksSUFBSSxPQUFPLE9BQU87QUFDbEIsYUFBTyxRQUFRLElBQUksUUFBUSxJQUFJLE9BQU8sV0FBVztBQUM3QyxjQUFNLFdBQVc7QUFBQSxVQUNiLEdBQUc7QUFBQSxVQUNILFFBQVE7QUFBQSxZQUNKLEdBQUcsSUFBSTtBQUFBLFlBQ1AsUUFBUSxDQUFDO0FBQUEsVUFDYjtBQUFBLFVBQ0EsUUFBUTtBQUFBLFFBQ1o7QUFDQSxlQUFPO0FBQUEsVUFDSCxRQUFRLE1BQU0sT0FBTyxZQUFZO0FBQUEsWUFDN0IsTUFBTSxJQUFJO0FBQUEsWUFDVixNQUFNLElBQUk7QUFBQSxZQUNWLFFBQVE7QUFBQSxVQUNaLENBQUM7QUFBQSxVQUNELEtBQUs7QUFBQSxRQUNUO0FBQUEsTUFDSixDQUFDLENBQUMsRUFBRSxLQUFLLGFBQWE7QUFBQSxJQUMxQixPQUNLO0FBQ0QsVUFBSSxRQUFRO0FBQ1osWUFBTSxTQUFTLENBQUM7QUFDaEIsaUJBQVcsVUFBVSxTQUFTO0FBQzFCLGNBQU0sV0FBVztBQUFBLFVBQ2IsR0FBRztBQUFBLFVBQ0gsUUFBUTtBQUFBLFlBQ0osR0FBRyxJQUFJO0FBQUEsWUFDUCxRQUFRLENBQUM7QUFBQSxVQUNiO0FBQUEsVUFDQSxRQUFRO0FBQUEsUUFDWjtBQUNBLGNBQU0sU0FBUyxPQUFPLFdBQVc7QUFBQSxVQUM3QixNQUFNLElBQUk7QUFBQSxVQUNWLE1BQU0sSUFBSTtBQUFBLFVBQ1YsUUFBUTtBQUFBLFFBQ1osQ0FBQztBQUNELFlBQUksT0FBTyxXQUFXLFNBQVM7QUFDM0IsaUJBQU87QUFBQSxRQUNYLFdBQ1MsT0FBTyxXQUFXLFdBQVcsQ0FBQyxPQUFPO0FBQzFDLGtCQUFRLEVBQUUsUUFBUSxLQUFLLFNBQVM7QUFBQSxRQUNwQztBQUNBLFlBQUksU0FBUyxPQUFPLE9BQU8sUUFBUTtBQUMvQixpQkFBTyxLQUFLLFNBQVMsT0FBTyxNQUFNO0FBQUEsUUFDdEM7QUFBQSxNQUNKO0FBQ0EsVUFBSSxPQUFPO0FBQ1AsWUFBSSxPQUFPLE9BQU8sS0FBSyxHQUFHLE1BQU0sSUFBSSxPQUFPLE1BQU07QUFDakQsZUFBTyxNQUFNO0FBQUEsTUFDakI7QUFDQSxZQUFNLGNBQWMsT0FBTyxJQUFJLENBQUNFLFlBQVcsSUFBSSxTQUFTQSxPQUFNLENBQUM7QUFDL0Qsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQjtBQUFBLE1BQ0osQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSjtBQUFBLEVBQ0EsSUFBSSxVQUFVO0FBQ1YsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUNKO0FBQ0EsU0FBUyxTQUFTLENBQUMsT0FBTyxXQUFXO0FBQ2pDLFNBQU8sSUFBSSxTQUFTO0FBQUEsSUFDaEIsU0FBUztBQUFBLElBQ1QsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBUUEsSUFBTSxtQkFBbUIsQ0FBQyxTQUFTO0FBQy9CLE1BQUksZ0JBQWdCLFNBQVM7QUFDekIsV0FBTyxpQkFBaUIsS0FBSyxNQUFNO0FBQUEsRUFDdkMsV0FDUyxnQkFBZ0IsWUFBWTtBQUNqQyxXQUFPLGlCQUFpQixLQUFLLFVBQVUsQ0FBQztBQUFBLEVBQzVDLFdBQ1MsZ0JBQWdCLFlBQVk7QUFDakMsV0FBTyxDQUFDLEtBQUssS0FBSztBQUFBLEVBQ3RCLFdBQ1MsZ0JBQWdCLFNBQVM7QUFDOUIsV0FBTyxLQUFLO0FBQUEsRUFDaEIsV0FDUyxnQkFBZ0IsZUFBZTtBQUVwQyxXQUFPLEtBQUssYUFBYSxLQUFLLElBQUk7QUFBQSxFQUN0QyxXQUNTLGdCQUFnQixZQUFZO0FBQ2pDLFdBQU8saUJBQWlCLEtBQUssS0FBSyxTQUFTO0FBQUEsRUFDL0MsV0FDUyxnQkFBZ0IsY0FBYztBQUNuQyxXQUFPLENBQUMsTUFBUztBQUFBLEVBQ3JCLFdBQ1MsZ0JBQWdCLFNBQVM7QUFDOUIsV0FBTyxDQUFDLElBQUk7QUFBQSxFQUNoQixXQUNTLGdCQUFnQixhQUFhO0FBQ2xDLFdBQU8sQ0FBQyxRQUFXLEdBQUcsaUJBQWlCLEtBQUssT0FBTyxDQUFDLENBQUM7QUFBQSxFQUN6RCxXQUNTLGdCQUFnQixhQUFhO0FBQ2xDLFdBQU8sQ0FBQyxNQUFNLEdBQUcsaUJBQWlCLEtBQUssT0FBTyxDQUFDLENBQUM7QUFBQSxFQUNwRCxXQUNTLGdCQUFnQixZQUFZO0FBQ2pDLFdBQU8saUJBQWlCLEtBQUssT0FBTyxDQUFDO0FBQUEsRUFDekMsV0FDUyxnQkFBZ0IsYUFBYTtBQUNsQyxXQUFPLGlCQUFpQixLQUFLLE9BQU8sQ0FBQztBQUFBLEVBQ3pDLFdBQ1MsZ0JBQWdCLFVBQVU7QUFDL0IsV0FBTyxpQkFBaUIsS0FBSyxLQUFLLFNBQVM7QUFBQSxFQUMvQyxPQUNLO0FBQ0QsV0FBTyxDQUFDO0FBQUEsRUFDWjtBQUNKO0FBQ08sSUFBTSx3QkFBTixNQUFNLCtCQUE4QixRQUFRO0FBQUEsRUFDL0MsT0FBTyxPQUFPO0FBQ1YsVUFBTSxFQUFFLElBQUksSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBQzlDLFFBQUksSUFBSSxlQUFlLGNBQWMsUUFBUTtBQUN6Qyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVUsSUFBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFVBQU0sZ0JBQWdCLEtBQUs7QUFDM0IsVUFBTSxxQkFBcUIsSUFBSSxLQUFLLGFBQWE7QUFDakQsVUFBTSxTQUFTLEtBQUssV0FBVyxJQUFJLGtCQUFrQjtBQUNyRCxRQUFJLENBQUMsUUFBUTtBQUNULHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsU0FBUyxNQUFNLEtBQUssS0FBSyxXQUFXLEtBQUssQ0FBQztBQUFBLFFBQzFDLE1BQU0sQ0FBQyxhQUFhO0FBQUEsTUFDeEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsUUFBSSxJQUFJLE9BQU8sT0FBTztBQUNsQixhQUFPLE9BQU8sWUFBWTtBQUFBLFFBQ3RCLE1BQU0sSUFBSTtBQUFBLFFBQ1YsTUFBTSxJQUFJO0FBQUEsUUFDVixRQUFRO0FBQUEsTUFDWixDQUFDO0FBQUEsSUFDTCxPQUNLO0FBQ0QsYUFBTyxPQUFPLFdBQVc7QUFBQSxRQUNyQixNQUFNLElBQUk7QUFBQSxRQUNWLE1BQU0sSUFBSTtBQUFBLFFBQ1YsUUFBUTtBQUFBLE1BQ1osQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBQUEsRUFDQSxJQUFJLGdCQUFnQjtBQUNoQixXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQUEsRUFDQSxJQUFJLFVBQVU7QUFDVixXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQUEsRUFDQSxJQUFJLGFBQWE7QUFDYixXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBU0EsT0FBTyxPQUFPLGVBQWUsU0FBUyxRQUFRO0FBRTFDLFVBQU0sYUFBYSxvQkFBSSxJQUFJO0FBRTNCLGVBQVcsUUFBUSxTQUFTO0FBQ3hCLFlBQU0sc0JBQXNCLGlCQUFpQixLQUFLLE1BQU0sYUFBYSxDQUFDO0FBQ3RFLFVBQUksQ0FBQyxvQkFBb0IsUUFBUTtBQUM3QixjQUFNLElBQUksTUFBTSxtQ0FBbUMsYUFBYSxtREFBbUQ7QUFBQSxNQUN2SDtBQUNBLGlCQUFXLFNBQVMscUJBQXFCO0FBQ3JDLFlBQUksV0FBVyxJQUFJLEtBQUssR0FBRztBQUN2QixnQkFBTSxJQUFJLE1BQU0sMEJBQTBCLE9BQU8sYUFBYSxDQUFDLHdCQUF3QixPQUFPLEtBQUssQ0FBQyxFQUFFO0FBQUEsUUFDMUc7QUFDQSxtQkFBVyxJQUFJLE9BQU8sSUFBSTtBQUFBLE1BQzlCO0FBQUEsSUFDSjtBQUNBLFdBQU8sSUFBSSx1QkFBc0I7QUFBQSxNQUM3QixVQUFVLHNCQUFzQjtBQUFBLE1BQ2hDO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxJQUNqQyxDQUFDO0FBQUEsRUFDTDtBQUNKO0FBQ0EsU0FBUyxZQUFZLEdBQUcsR0FBRztBQUN2QixRQUFNLFFBQVEsY0FBYyxDQUFDO0FBQzdCLFFBQU0sUUFBUSxjQUFjLENBQUM7QUFDN0IsTUFBSSxNQUFNLEdBQUc7QUFDVCxXQUFPLEVBQUUsT0FBTyxNQUFNLE1BQU0sRUFBRTtBQUFBLEVBQ2xDLFdBQ1MsVUFBVSxjQUFjLFVBQVUsVUFBVSxjQUFjLFFBQVE7QUFDdkUsVUFBTSxRQUFRLEtBQUssV0FBVyxDQUFDO0FBQy9CLFVBQU0sYUFBYSxLQUFLLFdBQVcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxRQUFRLE1BQU0sUUFBUSxHQUFHLE1BQU0sRUFBRTtBQUMvRSxVQUFNLFNBQVMsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFO0FBQzVCLGVBQVcsT0FBTyxZQUFZO0FBQzFCLFlBQU0sY0FBYyxZQUFZLEVBQUUsR0FBRyxHQUFHLEVBQUUsR0FBRyxDQUFDO0FBQzlDLFVBQUksQ0FBQyxZQUFZLE9BQU87QUFDcEIsZUFBTyxFQUFFLE9BQU8sTUFBTTtBQUFBLE1BQzFCO0FBQ0EsYUFBTyxHQUFHLElBQUksWUFBWTtBQUFBLElBQzlCO0FBQ0EsV0FBTyxFQUFFLE9BQU8sTUFBTSxNQUFNLE9BQU87QUFBQSxFQUN2QyxXQUNTLFVBQVUsY0FBYyxTQUFTLFVBQVUsY0FBYyxPQUFPO0FBQ3JFLFFBQUksRUFBRSxXQUFXLEVBQUUsUUFBUTtBQUN2QixhQUFPLEVBQUUsT0FBTyxNQUFNO0FBQUEsSUFDMUI7QUFDQSxVQUFNLFdBQVcsQ0FBQztBQUNsQixhQUFTLFFBQVEsR0FBRyxRQUFRLEVBQUUsUUFBUSxTQUFTO0FBQzNDLFlBQU0sUUFBUSxFQUFFLEtBQUs7QUFDckIsWUFBTSxRQUFRLEVBQUUsS0FBSztBQUNyQixZQUFNLGNBQWMsWUFBWSxPQUFPLEtBQUs7QUFDNUMsVUFBSSxDQUFDLFlBQVksT0FBTztBQUNwQixlQUFPLEVBQUUsT0FBTyxNQUFNO0FBQUEsTUFDMUI7QUFDQSxlQUFTLEtBQUssWUFBWSxJQUFJO0FBQUEsSUFDbEM7QUFDQSxXQUFPLEVBQUUsT0FBTyxNQUFNLE1BQU0sU0FBUztBQUFBLEVBQ3pDLFdBQ1MsVUFBVSxjQUFjLFFBQVEsVUFBVSxjQUFjLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRztBQUNoRixXQUFPLEVBQUUsT0FBTyxNQUFNLE1BQU0sRUFBRTtBQUFBLEVBQ2xDLE9BQ0s7QUFDRCxXQUFPLEVBQUUsT0FBTyxNQUFNO0FBQUEsRUFDMUI7QUFDSjtBQUNPLElBQU0sa0JBQU4sY0FBOEIsUUFBUTtBQUFBLEVBQ3pDLE9BQU8sT0FBTztBQUNWLFVBQU0sRUFBRSxRQUFRLElBQUksSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBQ3RELFVBQU0sZUFBZSxDQUFDLFlBQVksZ0JBQWdCO0FBQzlDLFVBQUksVUFBVSxVQUFVLEtBQUssVUFBVSxXQUFXLEdBQUc7QUFDakQsZUFBTztBQUFBLE1BQ1g7QUFDQSxZQUFNLFNBQVMsWUFBWSxXQUFXLE9BQU8sWUFBWSxLQUFLO0FBQzlELFVBQUksQ0FBQyxPQUFPLE9BQU87QUFDZiwwQkFBa0IsS0FBSztBQUFBLFVBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ3ZCLENBQUM7QUFDRCxlQUFPO0FBQUEsTUFDWDtBQUNBLFVBQUksUUFBUSxVQUFVLEtBQUssUUFBUSxXQUFXLEdBQUc7QUFDN0MsZUFBTyxNQUFNO0FBQUEsTUFDakI7QUFDQSxhQUFPLEVBQUUsUUFBUSxPQUFPLE9BQU8sT0FBTyxPQUFPLEtBQUs7QUFBQSxJQUN0RDtBQUNBLFFBQUksSUFBSSxPQUFPLE9BQU87QUFDbEIsYUFBTyxRQUFRLElBQUk7QUFBQSxRQUNmLEtBQUssS0FBSyxLQUFLLFlBQVk7QUFBQSxVQUN2QixNQUFNLElBQUk7QUFBQSxVQUNWLE1BQU0sSUFBSTtBQUFBLFVBQ1YsUUFBUTtBQUFBLFFBQ1osQ0FBQztBQUFBLFFBQ0QsS0FBSyxLQUFLLE1BQU0sWUFBWTtBQUFBLFVBQ3hCLE1BQU0sSUFBSTtBQUFBLFVBQ1YsTUFBTSxJQUFJO0FBQUEsVUFDVixRQUFRO0FBQUEsUUFDWixDQUFDO0FBQUEsTUFDTCxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsTUFBTSxLQUFLLE1BQU0sYUFBYSxNQUFNLEtBQUssQ0FBQztBQUFBLElBQ3hELE9BQ0s7QUFDRCxhQUFPLGFBQWEsS0FBSyxLQUFLLEtBQUssV0FBVztBQUFBLFFBQzFDLE1BQU0sSUFBSTtBQUFBLFFBQ1YsTUFBTSxJQUFJO0FBQUEsUUFDVixRQUFRO0FBQUEsTUFDWixDQUFDLEdBQUcsS0FBSyxLQUFLLE1BQU0sV0FBVztBQUFBLFFBQzNCLE1BQU0sSUFBSTtBQUFBLFFBQ1YsTUFBTSxJQUFJO0FBQUEsUUFDVixRQUFRO0FBQUEsTUFDWixDQUFDLENBQUM7QUFBQSxJQUNOO0FBQUEsRUFDSjtBQUNKO0FBQ0EsZ0JBQWdCLFNBQVMsQ0FBQyxNQUFNLE9BQU8sV0FBVztBQUM5QyxTQUFPLElBQUksZ0JBQWdCO0FBQUEsSUFDdkI7QUFBQSxJQUNBO0FBQUEsSUFDQSxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFFTyxJQUFNLFdBQU4sTUFBTSxrQkFBaUIsUUFBUTtBQUFBLEVBQ2xDLE9BQU8sT0FBTztBQUNWLFVBQU0sRUFBRSxRQUFRLElBQUksSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBQ3RELFFBQUksSUFBSSxlQUFlLGNBQWMsT0FBTztBQUN4Qyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVUsSUFBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFFBQUksSUFBSSxLQUFLLFNBQVMsS0FBSyxLQUFLLE1BQU0sUUFBUTtBQUMxQyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFNBQVMsS0FBSyxLQUFLLE1BQU07QUFBQSxRQUN6QixXQUFXO0FBQUEsUUFDWCxPQUFPO0FBQUEsUUFDUCxNQUFNO0FBQUEsTUFDVixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxVQUFNLE9BQU8sS0FBSyxLQUFLO0FBQ3ZCLFFBQUksQ0FBQyxRQUFRLElBQUksS0FBSyxTQUFTLEtBQUssS0FBSyxNQUFNLFFBQVE7QUFDbkQsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixNQUFNLGFBQWE7QUFBQSxRQUNuQixTQUFTLEtBQUssS0FBSyxNQUFNO0FBQUEsUUFDekIsV0FBVztBQUFBLFFBQ1gsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLE1BQ1YsQ0FBQztBQUNELGFBQU8sTUFBTTtBQUFBLElBQ2pCO0FBQ0EsVUFBTSxRQUFRLENBQUMsR0FBRyxJQUFJLElBQUksRUFDckIsSUFBSSxDQUFDLE1BQU0sY0FBYztBQUMxQixZQUFNLFNBQVMsS0FBSyxLQUFLLE1BQU0sU0FBUyxLQUFLLEtBQUssS0FBSztBQUN2RCxVQUFJLENBQUM7QUFDRCxlQUFPO0FBQ1gsYUFBTyxPQUFPLE9BQU8sSUFBSSxtQkFBbUIsS0FBSyxNQUFNLElBQUksTUFBTSxTQUFTLENBQUM7QUFBQSxJQUMvRSxDQUFDLEVBQ0ksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDdEIsUUFBSSxJQUFJLE9BQU8sT0FBTztBQUNsQixhQUFPLFFBQVEsSUFBSSxLQUFLLEVBQUUsS0FBSyxDQUFDLFlBQVk7QUFDeEMsZUFBTyxZQUFZLFdBQVcsUUFBUSxPQUFPO0FBQUEsTUFDakQsQ0FBQztBQUFBLElBQ0wsT0FDSztBQUNELGFBQU8sWUFBWSxXQUFXLFFBQVEsS0FBSztBQUFBLElBQy9DO0FBQUEsRUFDSjtBQUFBLEVBQ0EsSUFBSSxRQUFRO0FBQ1IsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsS0FBSyxNQUFNO0FBQ1AsV0FBTyxJQUFJLFVBQVM7QUFBQSxNQUNoQixHQUFHLEtBQUs7QUFBQSxNQUNSO0FBQUEsSUFDSixDQUFDO0FBQUEsRUFDTDtBQUNKO0FBQ0EsU0FBUyxTQUFTLENBQUMsU0FBUyxXQUFXO0FBQ25DLE1BQUksQ0FBQyxNQUFNLFFBQVEsT0FBTyxHQUFHO0FBQ3pCLFVBQU0sSUFBSSxNQUFNLHVEQUF1RDtBQUFBLEVBQzNFO0FBQ0EsU0FBTyxJQUFJLFNBQVM7QUFBQSxJQUNoQixPQUFPO0FBQUEsSUFDUCxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLE1BQU07QUFBQSxJQUNOLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLFlBQU4sTUFBTSxtQkFBa0IsUUFBUTtBQUFBLEVBQ25DLElBQUksWUFBWTtBQUNaLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFBQSxFQUNBLElBQUksY0FBYztBQUNkLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFBQSxFQUNBLE9BQU8sT0FBTztBQUNWLFVBQU0sRUFBRSxRQUFRLElBQUksSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBQ3RELFFBQUksSUFBSSxlQUFlLGNBQWMsUUFBUTtBQUN6Qyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVUsSUFBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFVBQU0sUUFBUSxDQUFDO0FBQ2YsVUFBTSxVQUFVLEtBQUssS0FBSztBQUMxQixVQUFNLFlBQVksS0FBSyxLQUFLO0FBQzVCLGVBQVcsT0FBTyxJQUFJLE1BQU07QUFDeEIsWUFBTSxLQUFLO0FBQUEsUUFDUCxLQUFLLFFBQVEsT0FBTyxJQUFJLG1CQUFtQixLQUFLLEtBQUssSUFBSSxNQUFNLEdBQUcsQ0FBQztBQUFBLFFBQ25FLE9BQU8sVUFBVSxPQUFPLElBQUksbUJBQW1CLEtBQUssSUFBSSxLQUFLLEdBQUcsR0FBRyxJQUFJLE1BQU0sR0FBRyxDQUFDO0FBQUEsUUFDakYsV0FBVyxPQUFPLElBQUk7QUFBQSxNQUMxQixDQUFDO0FBQUEsSUFDTDtBQUNBLFFBQUksSUFBSSxPQUFPLE9BQU87QUFDbEIsYUFBTyxZQUFZLGlCQUFpQixRQUFRLEtBQUs7QUFBQSxJQUNyRCxPQUNLO0FBQ0QsYUFBTyxZQUFZLGdCQUFnQixRQUFRLEtBQUs7QUFBQSxJQUNwRDtBQUFBLEVBQ0o7QUFBQSxFQUNBLElBQUksVUFBVTtBQUNWLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFBQSxFQUNBLE9BQU8sT0FBTyxPQUFPLFFBQVEsT0FBTztBQUNoQyxRQUFJLGtCQUFrQixTQUFTO0FBQzNCLGFBQU8sSUFBSSxXQUFVO0FBQUEsUUFDakIsU0FBUztBQUFBLFFBQ1QsV0FBVztBQUFBLFFBQ1gsVUFBVSxzQkFBc0I7QUFBQSxRQUNoQyxHQUFHLG9CQUFvQixLQUFLO0FBQUEsTUFDaEMsQ0FBQztBQUFBLElBQ0w7QUFDQSxXQUFPLElBQUksV0FBVTtBQUFBLE1BQ2pCLFNBQVMsVUFBVSxPQUFPO0FBQUEsTUFDMUIsV0FBVztBQUFBLE1BQ1gsVUFBVSxzQkFBc0I7QUFBQSxNQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsSUFDakMsQ0FBQztBQUFBLEVBQ0w7QUFDSjtBQUNPLElBQU0sU0FBTixjQUFxQixRQUFRO0FBQUEsRUFDaEMsSUFBSSxZQUFZO0FBQ1osV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsSUFBSSxjQUFjO0FBQ2QsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsT0FBTyxPQUFPO0FBQ1YsVUFBTSxFQUFFLFFBQVEsSUFBSSxJQUFJLEtBQUssb0JBQW9CLEtBQUs7QUFDdEQsUUFBSSxJQUFJLGVBQWUsY0FBYyxLQUFLO0FBQ3RDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVSxJQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsVUFBTSxVQUFVLEtBQUssS0FBSztBQUMxQixVQUFNLFlBQVksS0FBSyxLQUFLO0FBQzVCLFVBQU0sUUFBUSxDQUFDLEdBQUcsSUFBSSxLQUFLLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxHQUFHLFVBQVU7QUFDL0QsYUFBTztBQUFBLFFBQ0gsS0FBSyxRQUFRLE9BQU8sSUFBSSxtQkFBbUIsS0FBSyxLQUFLLElBQUksTUFBTSxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUM7QUFBQSxRQUM5RSxPQUFPLFVBQVUsT0FBTyxJQUFJLG1CQUFtQixLQUFLLE9BQU8sSUFBSSxNQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsQ0FBQztBQUFBLE1BQzFGO0FBQUEsSUFDSixDQUFDO0FBQ0QsUUFBSSxJQUFJLE9BQU8sT0FBTztBQUNsQixZQUFNLFdBQVcsb0JBQUksSUFBSTtBQUN6QixhQUFPLFFBQVEsUUFBUSxFQUFFLEtBQUssWUFBWTtBQUN0QyxtQkFBVyxRQUFRLE9BQU87QUFDdEIsZ0JBQU0sTUFBTSxNQUFNLEtBQUs7QUFDdkIsZ0JBQU0sUUFBUSxNQUFNLEtBQUs7QUFDekIsY0FBSSxJQUFJLFdBQVcsYUFBYSxNQUFNLFdBQVcsV0FBVztBQUN4RCxtQkFBTztBQUFBLFVBQ1g7QUFDQSxjQUFJLElBQUksV0FBVyxXQUFXLE1BQU0sV0FBVyxTQUFTO0FBQ3BELG1CQUFPLE1BQU07QUFBQSxVQUNqQjtBQUNBLG1CQUFTLElBQUksSUFBSSxPQUFPLE1BQU0sS0FBSztBQUFBLFFBQ3ZDO0FBQ0EsZUFBTyxFQUFFLFFBQVEsT0FBTyxPQUFPLE9BQU8sU0FBUztBQUFBLE1BQ25ELENBQUM7QUFBQSxJQUNMLE9BQ0s7QUFDRCxZQUFNLFdBQVcsb0JBQUksSUFBSTtBQUN6QixpQkFBVyxRQUFRLE9BQU87QUFDdEIsY0FBTSxNQUFNLEtBQUs7QUFDakIsY0FBTSxRQUFRLEtBQUs7QUFDbkIsWUFBSSxJQUFJLFdBQVcsYUFBYSxNQUFNLFdBQVcsV0FBVztBQUN4RCxpQkFBTztBQUFBLFFBQ1g7QUFDQSxZQUFJLElBQUksV0FBVyxXQUFXLE1BQU0sV0FBVyxTQUFTO0FBQ3BELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUNBLGlCQUFTLElBQUksSUFBSSxPQUFPLE1BQU0sS0FBSztBQUFBLE1BQ3ZDO0FBQ0EsYUFBTyxFQUFFLFFBQVEsT0FBTyxPQUFPLE9BQU8sU0FBUztBQUFBLElBQ25EO0FBQUEsRUFDSjtBQUNKO0FBQ0EsT0FBTyxTQUFTLENBQUMsU0FBUyxXQUFXLFdBQVc7QUFDNUMsU0FBTyxJQUFJLE9BQU87QUFBQSxJQUNkO0FBQUEsSUFDQTtBQUFBLElBQ0EsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxTQUFOLE1BQU0sZ0JBQWUsUUFBUTtBQUFBLEVBQ2hDLE9BQU8sT0FBTztBQUNWLFVBQU0sRUFBRSxRQUFRLElBQUksSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBQ3RELFFBQUksSUFBSSxlQUFlLGNBQWMsS0FBSztBQUN0Qyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVUsSUFBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFVBQU0sTUFBTSxLQUFLO0FBQ2pCLFFBQUksSUFBSSxZQUFZLE1BQU07QUFDdEIsVUFBSSxJQUFJLEtBQUssT0FBTyxJQUFJLFFBQVEsT0FBTztBQUNuQywwQkFBa0IsS0FBSztBQUFBLFVBQ25CLE1BQU0sYUFBYTtBQUFBLFVBQ25CLFNBQVMsSUFBSSxRQUFRO0FBQUEsVUFDckIsTUFBTTtBQUFBLFVBQ04sV0FBVztBQUFBLFVBQ1gsT0FBTztBQUFBLFVBQ1AsU0FBUyxJQUFJLFFBQVE7QUFBQSxRQUN6QixDQUFDO0FBQ0QsZUFBTyxNQUFNO0FBQUEsTUFDakI7QUFBQSxJQUNKO0FBQ0EsUUFBSSxJQUFJLFlBQVksTUFBTTtBQUN0QixVQUFJLElBQUksS0FBSyxPQUFPLElBQUksUUFBUSxPQUFPO0FBQ25DLDBCQUFrQixLQUFLO0FBQUEsVUFDbkIsTUFBTSxhQUFhO0FBQUEsVUFDbkIsU0FBUyxJQUFJLFFBQVE7QUFBQSxVQUNyQixNQUFNO0FBQUEsVUFDTixXQUFXO0FBQUEsVUFDWCxPQUFPO0FBQUEsVUFDUCxTQUFTLElBQUksUUFBUTtBQUFBLFFBQ3pCLENBQUM7QUFDRCxlQUFPLE1BQU07QUFBQSxNQUNqQjtBQUFBLElBQ0o7QUFDQSxVQUFNLFlBQVksS0FBSyxLQUFLO0FBQzVCLGFBQVMsWUFBWUMsV0FBVTtBQUMzQixZQUFNLFlBQVksb0JBQUksSUFBSTtBQUMxQixpQkFBVyxXQUFXQSxXQUFVO0FBQzVCLFlBQUksUUFBUSxXQUFXO0FBQ25CLGlCQUFPO0FBQ1gsWUFBSSxRQUFRLFdBQVc7QUFDbkIsaUJBQU8sTUFBTTtBQUNqQixrQkFBVSxJQUFJLFFBQVEsS0FBSztBQUFBLE1BQy9CO0FBQ0EsYUFBTyxFQUFFLFFBQVEsT0FBTyxPQUFPLE9BQU8sVUFBVTtBQUFBLElBQ3BEO0FBQ0EsVUFBTSxXQUFXLENBQUMsR0FBRyxJQUFJLEtBQUssT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sTUFBTSxVQUFVLE9BQU8sSUFBSSxtQkFBbUIsS0FBSyxNQUFNLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztBQUN6SCxRQUFJLElBQUksT0FBTyxPQUFPO0FBQ2xCLGFBQU8sUUFBUSxJQUFJLFFBQVEsRUFBRSxLQUFLLENBQUNBLGNBQWEsWUFBWUEsU0FBUSxDQUFDO0FBQUEsSUFDekUsT0FDSztBQUNELGFBQU8sWUFBWSxRQUFRO0FBQUEsSUFDL0I7QUFBQSxFQUNKO0FBQUEsRUFDQSxJQUFJLFNBQVMsU0FBUztBQUNsQixXQUFPLElBQUksUUFBTztBQUFBLE1BQ2QsR0FBRyxLQUFLO0FBQUEsTUFDUixTQUFTLEVBQUUsT0FBTyxTQUFTLFNBQVMsVUFBVSxTQUFTLE9BQU8sRUFBRTtBQUFBLElBQ3BFLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxJQUFJLFNBQVMsU0FBUztBQUNsQixXQUFPLElBQUksUUFBTztBQUFBLE1BQ2QsR0FBRyxLQUFLO0FBQUEsTUFDUixTQUFTLEVBQUUsT0FBTyxTQUFTLFNBQVMsVUFBVSxTQUFTLE9BQU8sRUFBRTtBQUFBLElBQ3BFLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxLQUFLLE1BQU0sU0FBUztBQUNoQixXQUFPLEtBQUssSUFBSSxNQUFNLE9BQU8sRUFBRSxJQUFJLE1BQU0sT0FBTztBQUFBLEVBQ3BEO0FBQUEsRUFDQSxTQUFTLFNBQVM7QUFDZCxXQUFPLEtBQUssSUFBSSxHQUFHLE9BQU87QUFBQSxFQUM5QjtBQUNKO0FBQ0EsT0FBTyxTQUFTLENBQUMsV0FBVyxXQUFXO0FBQ25DLFNBQU8sSUFBSSxPQUFPO0FBQUEsSUFDZDtBQUFBLElBQ0EsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxjQUFOLE1BQU0scUJBQW9CLFFBQVE7QUFBQSxFQUNyQyxjQUFjO0FBQ1YsVUFBTSxHQUFHLFNBQVM7QUFDbEIsU0FBSyxXQUFXLEtBQUs7QUFBQSxFQUN6QjtBQUFBLEVBQ0EsT0FBTyxPQUFPO0FBQ1YsVUFBTSxFQUFFLElBQUksSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBQzlDLFFBQUksSUFBSSxlQUFlLGNBQWMsVUFBVTtBQUMzQyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsY0FBYztBQUFBLFFBQ3hCLFVBQVUsSUFBSTtBQUFBLE1BQ2xCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLGFBQVMsY0FBYyxNQUFNLE9BQU87QUFDaEMsYUFBTyxVQUFVO0FBQUEsUUFDYixNQUFNO0FBQUEsUUFDTixNQUFNLElBQUk7QUFBQSxRQUNWLFdBQVcsQ0FBQyxJQUFJLE9BQU8sb0JBQW9CLElBQUksZ0JBQWdCLFlBQVksR0FBRyxVQUFlLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFBQSxRQUNoSCxXQUFXO0FBQUEsVUFDUCxNQUFNLGFBQWE7QUFBQSxVQUNuQixnQkFBZ0I7QUFBQSxRQUNwQjtBQUFBLE1BQ0osQ0FBQztBQUFBLElBQ0w7QUFDQSxhQUFTLGlCQUFpQixTQUFTLE9BQU87QUFDdEMsYUFBTyxVQUFVO0FBQUEsUUFDYixNQUFNO0FBQUEsUUFDTixNQUFNLElBQUk7QUFBQSxRQUNWLFdBQVcsQ0FBQyxJQUFJLE9BQU8sb0JBQW9CLElBQUksZ0JBQWdCLFlBQVksR0FBRyxVQUFlLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFBQSxRQUNoSCxXQUFXO0FBQUEsVUFDUCxNQUFNLGFBQWE7QUFBQSxVQUNuQixpQkFBaUI7QUFBQSxRQUNyQjtBQUFBLE1BQ0osQ0FBQztBQUFBLElBQ0w7QUFDQSxVQUFNLFNBQVMsRUFBRSxVQUFVLElBQUksT0FBTyxtQkFBbUI7QUFDekQsVUFBTSxLQUFLLElBQUk7QUFDZixRQUFJLEtBQUssS0FBSyxtQkFBbUIsWUFBWTtBQUl6QyxZQUFNLEtBQUs7QUFDWCxhQUFPLEdBQUcsa0JBQW1CLE1BQU07QUFDL0IsY0FBTSxRQUFRLElBQUksU0FBUyxDQUFDLENBQUM7QUFDN0IsY0FBTSxhQUFhLE1BQU0sR0FBRyxLQUFLLEtBQUssV0FBVyxNQUFNLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTTtBQUN4RSxnQkFBTSxTQUFTLGNBQWMsTUFBTSxDQUFDLENBQUM7QUFDckMsZ0JBQU07QUFBQSxRQUNWLENBQUM7QUFDRCxjQUFNLFNBQVMsTUFBTSxRQUFRLE1BQU0sSUFBSSxNQUFNLFVBQVU7QUFDdkQsY0FBTSxnQkFBZ0IsTUFBTSxHQUFHLEtBQUssUUFBUSxLQUFLLEtBQzVDLFdBQVcsUUFBUSxNQUFNLEVBQ3pCLE1BQU0sQ0FBQyxNQUFNO0FBQ2QsZ0JBQU0sU0FBUyxpQkFBaUIsUUFBUSxDQUFDLENBQUM7QUFDMUMsZ0JBQU07QUFBQSxRQUNWLENBQUM7QUFDRCxlQUFPO0FBQUEsTUFDWCxDQUFDO0FBQUEsSUFDTCxPQUNLO0FBSUQsWUFBTSxLQUFLO0FBQ1gsYUFBTyxHQUFHLFlBQWEsTUFBTTtBQUN6QixjQUFNLGFBQWEsR0FBRyxLQUFLLEtBQUssVUFBVSxNQUFNLE1BQU07QUFDdEQsWUFBSSxDQUFDLFdBQVcsU0FBUztBQUNyQixnQkFBTSxJQUFJLFNBQVMsQ0FBQyxjQUFjLE1BQU0sV0FBVyxLQUFLLENBQUMsQ0FBQztBQUFBLFFBQzlEO0FBQ0EsY0FBTSxTQUFTLFFBQVEsTUFBTSxJQUFJLE1BQU0sV0FBVyxJQUFJO0FBQ3RELGNBQU0sZ0JBQWdCLEdBQUcsS0FBSyxRQUFRLFVBQVUsUUFBUSxNQUFNO0FBQzlELFlBQUksQ0FBQyxjQUFjLFNBQVM7QUFDeEIsZ0JBQU0sSUFBSSxTQUFTLENBQUMsaUJBQWlCLFFBQVEsY0FBYyxLQUFLLENBQUMsQ0FBQztBQUFBLFFBQ3RFO0FBQ0EsZUFBTyxjQUFjO0FBQUEsTUFDekIsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBQUEsRUFDQSxhQUFhO0FBQ1QsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsYUFBYTtBQUNULFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFBQSxFQUNBLFFBQVEsT0FBTztBQUNYLFdBQU8sSUFBSSxhQUFZO0FBQUEsTUFDbkIsR0FBRyxLQUFLO0FBQUEsTUFDUixNQUFNLFNBQVMsT0FBTyxLQUFLLEVBQUUsS0FBSyxXQUFXLE9BQU8sQ0FBQztBQUFBLElBQ3pELENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxRQUFRLFlBQVk7QUFDaEIsV0FBTyxJQUFJLGFBQVk7QUFBQSxNQUNuQixHQUFHLEtBQUs7QUFBQSxNQUNSLFNBQVM7QUFBQSxJQUNiLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxVQUFVLE1BQU07QUFDWixVQUFNLGdCQUFnQixLQUFLLE1BQU0sSUFBSTtBQUNyQyxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsZ0JBQWdCLE1BQU07QUFDbEIsVUFBTSxnQkFBZ0IsS0FBSyxNQUFNLElBQUk7QUFDckMsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUNBLE9BQU8sT0FBTyxNQUFNLFNBQVMsUUFBUTtBQUNqQyxXQUFPLElBQUksYUFBWTtBQUFBLE1BQ25CLE1BQU8sT0FBTyxPQUFPLFNBQVMsT0FBTyxDQUFDLENBQUMsRUFBRSxLQUFLLFdBQVcsT0FBTyxDQUFDO0FBQUEsTUFDakUsU0FBUyxXQUFXLFdBQVcsT0FBTztBQUFBLE1BQ3RDLFVBQVUsc0JBQXNCO0FBQUEsTUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLElBQ2pDLENBQUM7QUFBQSxFQUNMO0FBQ0o7QUFDTyxJQUFNLFVBQU4sY0FBc0IsUUFBUTtBQUFBLEVBQ2pDLElBQUksU0FBUztBQUNULFdBQU8sS0FBSyxLQUFLLE9BQU87QUFBQSxFQUM1QjtBQUFBLEVBQ0EsT0FBTyxPQUFPO0FBQ1YsVUFBTSxFQUFFLElBQUksSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBQzlDLFVBQU0sYUFBYSxLQUFLLEtBQUssT0FBTztBQUNwQyxXQUFPLFdBQVcsT0FBTyxFQUFFLE1BQU0sSUFBSSxNQUFNLE1BQU0sSUFBSSxNQUFNLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDNUU7QUFDSjtBQUNBLFFBQVEsU0FBUyxDQUFDLFFBQVEsV0FBVztBQUNqQyxTQUFPLElBQUksUUFBUTtBQUFBLElBQ2Y7QUFBQSxJQUNBLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sYUFBTixjQUF5QixRQUFRO0FBQUEsRUFDcEMsT0FBTyxPQUFPO0FBQ1YsUUFBSSxNQUFNLFNBQVMsS0FBSyxLQUFLLE9BQU87QUFDaEMsWUFBTSxNQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDdEMsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixVQUFVLElBQUk7QUFBQSxRQUNkLE1BQU0sYUFBYTtBQUFBLFFBQ25CLFVBQVUsS0FBSyxLQUFLO0FBQUEsTUFDeEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsV0FBTyxFQUFFLFFBQVEsU0FBUyxPQUFPLE1BQU0sS0FBSztBQUFBLEVBQ2hEO0FBQUEsRUFDQSxJQUFJLFFBQVE7QUFDUixXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQ0o7QUFDQSxXQUFXLFNBQVMsQ0FBQyxPQUFPLFdBQVc7QUFDbkMsU0FBTyxJQUFJLFdBQVc7QUFBQSxJQUNsQjtBQUFBLElBQ0EsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ0EsU0FBUyxjQUFjLFFBQVEsUUFBUTtBQUNuQyxTQUFPLElBQUksUUFBUTtBQUFBLElBQ2Y7QUFBQSxJQUNBLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sVUFBTixNQUFNLGlCQUFnQixRQUFRO0FBQUEsRUFDakMsT0FBTyxPQUFPO0FBQ1YsUUFBSSxPQUFPLE1BQU0sU0FBUyxVQUFVO0FBQ2hDLFlBQU0sTUFBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ3RDLFlBQU0saUJBQWlCLEtBQUssS0FBSztBQUNqQyx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLFVBQVUsS0FBSyxXQUFXLGNBQWM7QUFBQSxRQUN4QyxVQUFVLElBQUk7QUFBQSxRQUNkLE1BQU0sYUFBYTtBQUFBLE1BQ3ZCLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDWDtBQUNBLFFBQUksQ0FBQyxLQUFLLFFBQVE7QUFDZCxXQUFLLFNBQVMsSUFBSSxJQUFJLEtBQUssS0FBSyxNQUFNO0FBQUEsSUFDMUM7QUFDQSxRQUFJLENBQUMsS0FBSyxPQUFPLElBQUksTUFBTSxJQUFJLEdBQUc7QUFDOUIsWUFBTSxNQUFNLEtBQUssZ0JBQWdCLEtBQUs7QUFDdEMsWUFBTSxpQkFBaUIsS0FBSyxLQUFLO0FBQ2pDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsVUFBVSxJQUFJO0FBQUEsUUFDZCxNQUFNLGFBQWE7QUFBQSxRQUNuQixTQUFTO0FBQUEsTUFDYixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxXQUFPLEdBQUcsTUFBTSxJQUFJO0FBQUEsRUFDeEI7QUFBQSxFQUNBLElBQUksVUFBVTtBQUNWLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFBQSxFQUNBLElBQUksT0FBTztBQUNQLFVBQU0sYUFBYSxDQUFDO0FBQ3BCLGVBQVcsT0FBTyxLQUFLLEtBQUssUUFBUTtBQUNoQyxpQkFBVyxHQUFHLElBQUk7QUFBQSxJQUN0QjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxJQUFJLFNBQVM7QUFDVCxVQUFNLGFBQWEsQ0FBQztBQUNwQixlQUFXLE9BQU8sS0FBSyxLQUFLLFFBQVE7QUFDaEMsaUJBQVcsR0FBRyxJQUFJO0FBQUEsSUFDdEI7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsSUFBSSxPQUFPO0FBQ1AsVUFBTSxhQUFhLENBQUM7QUFDcEIsZUFBVyxPQUFPLEtBQUssS0FBSyxRQUFRO0FBQ2hDLGlCQUFXLEdBQUcsSUFBSTtBQUFBLElBQ3RCO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUNBLFFBQVEsUUFBUSxTQUFTLEtBQUssTUFBTTtBQUNoQyxXQUFPLFNBQVEsT0FBTyxRQUFRO0FBQUEsTUFDMUIsR0FBRyxLQUFLO0FBQUEsTUFDUixHQUFHO0FBQUEsSUFDUCxDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsUUFBUSxRQUFRLFNBQVMsS0FBSyxNQUFNO0FBQ2hDLFdBQU8sU0FBUSxPQUFPLEtBQUssUUFBUSxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sU0FBUyxHQUFHLENBQUMsR0FBRztBQUFBLE1BQ3ZFLEdBQUcsS0FBSztBQUFBLE1BQ1IsR0FBRztBQUFBLElBQ1AsQ0FBQztBQUFBLEVBQ0w7QUFDSjtBQUNBLFFBQVEsU0FBUztBQUNWLElBQU0sZ0JBQU4sY0FBNEIsUUFBUTtBQUFBLEVBQ3ZDLE9BQU8sT0FBTztBQUNWLFVBQU0sbUJBQW1CLEtBQUssbUJBQW1CLEtBQUssS0FBSyxNQUFNO0FBQ2pFLFVBQU0sTUFBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ3RDLFFBQUksSUFBSSxlQUFlLGNBQWMsVUFBVSxJQUFJLGVBQWUsY0FBYyxRQUFRO0FBQ3BGLFlBQU0saUJBQWlCLEtBQUssYUFBYSxnQkFBZ0I7QUFDekQsd0JBQWtCLEtBQUs7QUFBQSxRQUNuQixVQUFVLEtBQUssV0FBVyxjQUFjO0FBQUEsUUFDeEMsVUFBVSxJQUFJO0FBQUEsUUFDZCxNQUFNLGFBQWE7QUFBQSxNQUN2QixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1g7QUFDQSxRQUFJLENBQUMsS0FBSyxRQUFRO0FBQ2QsV0FBSyxTQUFTLElBQUksSUFBSSxLQUFLLG1CQUFtQixLQUFLLEtBQUssTUFBTSxDQUFDO0FBQUEsSUFDbkU7QUFDQSxRQUFJLENBQUMsS0FBSyxPQUFPLElBQUksTUFBTSxJQUFJLEdBQUc7QUFDOUIsWUFBTSxpQkFBaUIsS0FBSyxhQUFhLGdCQUFnQjtBQUN6RCx3QkFBa0IsS0FBSztBQUFBLFFBQ25CLFVBQVUsSUFBSTtBQUFBLFFBQ2QsTUFBTSxhQUFhO0FBQUEsUUFDbkIsU0FBUztBQUFBLE1BQ2IsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsV0FBTyxHQUFHLE1BQU0sSUFBSTtBQUFBLEVBQ3hCO0FBQUEsRUFDQSxJQUFJLE9BQU87QUFDUCxXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQ0o7QUFDQSxjQUFjLFNBQVMsQ0FBQyxRQUFRLFdBQVc7QUFDdkMsU0FBTyxJQUFJLGNBQWM7QUFBQSxJQUNyQjtBQUFBLElBQ0EsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxhQUFOLGNBQXlCLFFBQVE7QUFBQSxFQUNwQyxTQUFTO0FBQ0wsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsT0FBTyxPQUFPO0FBQ1YsVUFBTSxFQUFFLElBQUksSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBQzlDLFFBQUksSUFBSSxlQUFlLGNBQWMsV0FBVyxJQUFJLE9BQU8sVUFBVSxPQUFPO0FBQ3hFLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVSxJQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsVUFBTSxjQUFjLElBQUksZUFBZSxjQUFjLFVBQVUsSUFBSSxPQUFPLFFBQVEsUUFBUSxJQUFJLElBQUk7QUFDbEcsV0FBTyxHQUFHLFlBQVksS0FBSyxDQUFDLFNBQVM7QUFDakMsYUFBTyxLQUFLLEtBQUssS0FBSyxXQUFXLE1BQU07QUFBQSxRQUNuQyxNQUFNLElBQUk7QUFBQSxRQUNWLFVBQVUsSUFBSSxPQUFPO0FBQUEsTUFDekIsQ0FBQztBQUFBLElBQ0wsQ0FBQyxDQUFDO0FBQUEsRUFDTjtBQUNKO0FBQ0EsV0FBVyxTQUFTLENBQUMsUUFBUSxXQUFXO0FBQ3BDLFNBQU8sSUFBSSxXQUFXO0FBQUEsSUFDbEIsTUFBTTtBQUFBLElBQ04sVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBQ08sSUFBTSxhQUFOLGNBQXlCLFFBQVE7QUFBQSxFQUNwQyxZQUFZO0FBQ1IsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsYUFBYTtBQUNULFdBQU8sS0FBSyxLQUFLLE9BQU8sS0FBSyxhQUFhLHNCQUFzQixhQUMxRCxLQUFLLEtBQUssT0FBTyxXQUFXLElBQzVCLEtBQUssS0FBSztBQUFBLEVBQ3BCO0FBQUEsRUFDQSxPQUFPLE9BQU87QUFDVixVQUFNLEVBQUUsUUFBUSxJQUFJLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUN0RCxVQUFNLFNBQVMsS0FBSyxLQUFLLFVBQVU7QUFDbkMsVUFBTSxXQUFXO0FBQUEsTUFDYixVQUFVLENBQUMsUUFBUTtBQUNmLDBCQUFrQixLQUFLLEdBQUc7QUFDMUIsWUFBSSxJQUFJLE9BQU87QUFDWCxpQkFBTyxNQUFNO0FBQUEsUUFDakIsT0FDSztBQUNELGlCQUFPLE1BQU07QUFBQSxRQUNqQjtBQUFBLE1BQ0o7QUFBQSxNQUNBLElBQUksT0FBTztBQUNQLGVBQU8sSUFBSTtBQUFBLE1BQ2Y7QUFBQSxJQUNKO0FBQ0EsYUFBUyxXQUFXLFNBQVMsU0FBUyxLQUFLLFFBQVE7QUFDbkQsUUFBSSxPQUFPLFNBQVMsY0FBYztBQUM5QixZQUFNLFlBQVksT0FBTyxVQUFVLElBQUksTUFBTSxRQUFRO0FBQ3JELFVBQUksSUFBSSxPQUFPLE9BQU87QUFDbEIsZUFBTyxRQUFRLFFBQVEsU0FBUyxFQUFFLEtBQUssT0FBT0MsZUFBYztBQUN4RCxjQUFJLE9BQU8sVUFBVTtBQUNqQixtQkFBTztBQUNYLGdCQUFNLFNBQVMsTUFBTSxLQUFLLEtBQUssT0FBTyxZQUFZO0FBQUEsWUFDOUMsTUFBTUE7QUFBQSxZQUNOLE1BQU0sSUFBSTtBQUFBLFlBQ1YsUUFBUTtBQUFBLFVBQ1osQ0FBQztBQUNELGNBQUksT0FBTyxXQUFXO0FBQ2xCLG1CQUFPO0FBQ1gsY0FBSSxPQUFPLFdBQVc7QUFDbEIsbUJBQU8sTUFBTSxPQUFPLEtBQUs7QUFDN0IsY0FBSSxPQUFPLFVBQVU7QUFDakIsbUJBQU8sTUFBTSxPQUFPLEtBQUs7QUFDN0IsaUJBQU87QUFBQSxRQUNYLENBQUM7QUFBQSxNQUNMLE9BQ0s7QUFDRCxZQUFJLE9BQU8sVUFBVTtBQUNqQixpQkFBTztBQUNYLGNBQU0sU0FBUyxLQUFLLEtBQUssT0FBTyxXQUFXO0FBQUEsVUFDdkMsTUFBTTtBQUFBLFVBQ04sTUFBTSxJQUFJO0FBQUEsVUFDVixRQUFRO0FBQUEsUUFDWixDQUFDO0FBQ0QsWUFBSSxPQUFPLFdBQVc7QUFDbEIsaUJBQU87QUFDWCxZQUFJLE9BQU8sV0FBVztBQUNsQixpQkFBTyxNQUFNLE9BQU8sS0FBSztBQUM3QixZQUFJLE9BQU8sVUFBVTtBQUNqQixpQkFBTyxNQUFNLE9BQU8sS0FBSztBQUM3QixlQUFPO0FBQUEsTUFDWDtBQUFBLElBQ0o7QUFDQSxRQUFJLE9BQU8sU0FBUyxjQUFjO0FBQzlCLFlBQU0sb0JBQW9CLENBQUMsUUFBUTtBQUMvQixjQUFNLFNBQVMsT0FBTyxXQUFXLEtBQUssUUFBUTtBQUM5QyxZQUFJLElBQUksT0FBTyxPQUFPO0FBQ2xCLGlCQUFPLFFBQVEsUUFBUSxNQUFNO0FBQUEsUUFDakM7QUFDQSxZQUFJLGtCQUFrQixTQUFTO0FBQzNCLGdCQUFNLElBQUksTUFBTSwyRkFBMkY7QUFBQSxRQUMvRztBQUNBLGVBQU87QUFBQSxNQUNYO0FBQ0EsVUFBSSxJQUFJLE9BQU8sVUFBVSxPQUFPO0FBQzVCLGNBQU0sUUFBUSxLQUFLLEtBQUssT0FBTyxXQUFXO0FBQUEsVUFDdEMsTUFBTSxJQUFJO0FBQUEsVUFDVixNQUFNLElBQUk7QUFBQSxVQUNWLFFBQVE7QUFBQSxRQUNaLENBQUM7QUFDRCxZQUFJLE1BQU0sV0FBVztBQUNqQixpQkFBTztBQUNYLFlBQUksTUFBTSxXQUFXO0FBQ2pCLGlCQUFPLE1BQU07QUFFakIsMEJBQWtCLE1BQU0sS0FBSztBQUM3QixlQUFPLEVBQUUsUUFBUSxPQUFPLE9BQU8sT0FBTyxNQUFNLE1BQU07QUFBQSxNQUN0RCxPQUNLO0FBQ0QsZUFBTyxLQUFLLEtBQUssT0FBTyxZQUFZLEVBQUUsTUFBTSxJQUFJLE1BQU0sTUFBTSxJQUFJLE1BQU0sUUFBUSxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsVUFBVTtBQUNqRyxjQUFJLE1BQU0sV0FBVztBQUNqQixtQkFBTztBQUNYLGNBQUksTUFBTSxXQUFXO0FBQ2pCLG1CQUFPLE1BQU07QUFDakIsaUJBQU8sa0JBQWtCLE1BQU0sS0FBSyxFQUFFLEtBQUssTUFBTTtBQUM3QyxtQkFBTyxFQUFFLFFBQVEsT0FBTyxPQUFPLE9BQU8sTUFBTSxNQUFNO0FBQUEsVUFDdEQsQ0FBQztBQUFBLFFBQ0wsQ0FBQztBQUFBLE1BQ0w7QUFBQSxJQUNKO0FBQ0EsUUFBSSxPQUFPLFNBQVMsYUFBYTtBQUM3QixVQUFJLElBQUksT0FBTyxVQUFVLE9BQU87QUFDNUIsY0FBTSxPQUFPLEtBQUssS0FBSyxPQUFPLFdBQVc7QUFBQSxVQUNyQyxNQUFNLElBQUk7QUFBQSxVQUNWLE1BQU0sSUFBSTtBQUFBLFVBQ1YsUUFBUTtBQUFBLFFBQ1osQ0FBQztBQUNELFlBQUksQ0FBQyxRQUFRLElBQUk7QUFDYixpQkFBTztBQUNYLGNBQU0sU0FBUyxPQUFPLFVBQVUsS0FBSyxPQUFPLFFBQVE7QUFDcEQsWUFBSSxrQkFBa0IsU0FBUztBQUMzQixnQkFBTSxJQUFJLE1BQU0saUdBQWlHO0FBQUEsUUFDckg7QUFDQSxlQUFPLEVBQUUsUUFBUSxPQUFPLE9BQU8sT0FBTyxPQUFPO0FBQUEsTUFDakQsT0FDSztBQUNELGVBQU8sS0FBSyxLQUFLLE9BQU8sWUFBWSxFQUFFLE1BQU0sSUFBSSxNQUFNLE1BQU0sSUFBSSxNQUFNLFFBQVEsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLFNBQVM7QUFDaEcsY0FBSSxDQUFDLFFBQVEsSUFBSTtBQUNiLG1CQUFPO0FBQ1gsaUJBQU8sUUFBUSxRQUFRLE9BQU8sVUFBVSxLQUFLLE9BQU8sUUFBUSxDQUFDLEVBQUUsS0FBSyxDQUFDLFlBQVk7QUFBQSxZQUM3RSxRQUFRLE9BQU87QUFBQSxZQUNmLE9BQU87QUFBQSxVQUNYLEVBQUU7QUFBQSxRQUNOLENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSjtBQUNBLFNBQUssWUFBWSxNQUFNO0FBQUEsRUFDM0I7QUFDSjtBQUNBLFdBQVcsU0FBUyxDQUFDLFFBQVEsUUFBUSxXQUFXO0FBQzVDLFNBQU8sSUFBSSxXQUFXO0FBQUEsSUFDbEI7QUFBQSxJQUNBLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEM7QUFBQSxJQUNBLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDQSxXQUFXLHVCQUF1QixDQUFDLFlBQVksUUFBUSxXQUFXO0FBQzlELFNBQU8sSUFBSSxXQUFXO0FBQUEsSUFDbEI7QUFBQSxJQUNBLFFBQVEsRUFBRSxNQUFNLGNBQWMsV0FBVyxXQUFXO0FBQUEsSUFDcEQsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxHQUFHLG9CQUFvQixNQUFNO0FBQUEsRUFDakMsQ0FBQztBQUNMO0FBRU8sSUFBTSxjQUFOLGNBQTBCLFFBQVE7QUFBQSxFQUNyQyxPQUFPLE9BQU87QUFDVixVQUFNLGFBQWEsS0FBSyxTQUFTLEtBQUs7QUFDdEMsUUFBSSxlQUFlLGNBQWMsV0FBVztBQUN4QyxhQUFPLEdBQUcsTUFBUztBQUFBLElBQ3ZCO0FBQ0EsV0FBTyxLQUFLLEtBQUssVUFBVSxPQUFPLEtBQUs7QUFBQSxFQUMzQztBQUFBLEVBQ0EsU0FBUztBQUNMLFdBQU8sS0FBSyxLQUFLO0FBQUEsRUFDckI7QUFDSjtBQUNBLFlBQVksU0FBUyxDQUFDLE1BQU0sV0FBVztBQUNuQyxTQUFPLElBQUksWUFBWTtBQUFBLElBQ25CLFdBQVc7QUFBQSxJQUNYLFVBQVUsc0JBQXNCO0FBQUEsSUFDaEMsR0FBRyxvQkFBb0IsTUFBTTtBQUFBLEVBQ2pDLENBQUM7QUFDTDtBQUNPLElBQU0sY0FBTixjQUEwQixRQUFRO0FBQUEsRUFDckMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxhQUFhLEtBQUssU0FBUyxLQUFLO0FBQ3RDLFFBQUksZUFBZSxjQUFjLE1BQU07QUFDbkMsYUFBTyxHQUFHLElBQUk7QUFBQSxJQUNsQjtBQUNBLFdBQU8sS0FBSyxLQUFLLFVBQVUsT0FBTyxLQUFLO0FBQUEsRUFDM0M7QUFBQSxFQUNBLFNBQVM7QUFDTCxXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQ0o7QUFDQSxZQUFZLFNBQVMsQ0FBQyxNQUFNLFdBQVc7QUFDbkMsU0FBTyxJQUFJLFlBQVk7QUFBQSxJQUNuQixXQUFXO0FBQUEsSUFDWCxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLGFBQU4sY0FBeUIsUUFBUTtBQUFBLEVBQ3BDLE9BQU8sT0FBTztBQUNWLFVBQU0sRUFBRSxJQUFJLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUM5QyxRQUFJLE9BQU8sSUFBSTtBQUNmLFFBQUksSUFBSSxlQUFlLGNBQWMsV0FBVztBQUM1QyxhQUFPLEtBQUssS0FBSyxhQUFhO0FBQUEsSUFDbEM7QUFDQSxXQUFPLEtBQUssS0FBSyxVQUFVLE9BQU87QUFBQSxNQUM5QjtBQUFBLE1BQ0EsTUFBTSxJQUFJO0FBQUEsTUFDVixRQUFRO0FBQUEsSUFDWixDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsZ0JBQWdCO0FBQ1osV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUNKO0FBQ0EsV0FBVyxTQUFTLENBQUMsTUFBTSxXQUFXO0FBQ2xDLFNBQU8sSUFBSSxXQUFXO0FBQUEsSUFDbEIsV0FBVztBQUFBLElBQ1gsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxjQUFjLE9BQU8sT0FBTyxZQUFZLGFBQWEsT0FBTyxVQUFVLE1BQU0sT0FBTztBQUFBLElBQ25GLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLFdBQU4sY0FBdUIsUUFBUTtBQUFBLEVBQ2xDLE9BQU8sT0FBTztBQUNWLFVBQU0sRUFBRSxJQUFJLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUU5QyxVQUFNLFNBQVM7QUFBQSxNQUNYLEdBQUc7QUFBQSxNQUNILFFBQVE7QUFBQSxRQUNKLEdBQUcsSUFBSTtBQUFBLFFBQ1AsUUFBUSxDQUFDO0FBQUEsTUFDYjtBQUFBLElBQ0o7QUFDQSxVQUFNLFNBQVMsS0FBSyxLQUFLLFVBQVUsT0FBTztBQUFBLE1BQ3RDLE1BQU0sT0FBTztBQUFBLE1BQ2IsTUFBTSxPQUFPO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDSixHQUFHO0FBQUEsTUFDUDtBQUFBLElBQ0osQ0FBQztBQUNELFFBQUksUUFBUSxNQUFNLEdBQUc7QUFDakIsYUFBTyxPQUFPLEtBQUssQ0FBQ0MsWUFBVztBQUMzQixlQUFPO0FBQUEsVUFDSCxRQUFRO0FBQUEsVUFDUixPQUFPQSxRQUFPLFdBQVcsVUFDbkJBLFFBQU8sUUFDUCxLQUFLLEtBQUssV0FBVztBQUFBLFlBQ25CLElBQUksUUFBUTtBQUNSLHFCQUFPLElBQUksU0FBUyxPQUFPLE9BQU8sTUFBTTtBQUFBLFlBQzVDO0FBQUEsWUFDQSxPQUFPLE9BQU87QUFBQSxVQUNsQixDQUFDO0FBQUEsUUFDVDtBQUFBLE1BQ0osQ0FBQztBQUFBLElBQ0wsT0FDSztBQUNELGFBQU87QUFBQSxRQUNILFFBQVE7QUFBQSxRQUNSLE9BQU8sT0FBTyxXQUFXLFVBQ25CLE9BQU8sUUFDUCxLQUFLLEtBQUssV0FBVztBQUFBLFVBQ25CLElBQUksUUFBUTtBQUNSLG1CQUFPLElBQUksU0FBUyxPQUFPLE9BQU8sTUFBTTtBQUFBLFVBQzVDO0FBQUEsVUFDQSxPQUFPLE9BQU87QUFBQSxRQUNsQixDQUFDO0FBQUEsTUFDVDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxjQUFjO0FBQ1YsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUNKO0FBQ0EsU0FBUyxTQUFTLENBQUMsTUFBTSxXQUFXO0FBQ2hDLFNBQU8sSUFBSSxTQUFTO0FBQUEsSUFDaEIsV0FBVztBQUFBLElBQ1gsVUFBVSxzQkFBc0I7QUFBQSxJQUNoQyxZQUFZLE9BQU8sT0FBTyxVQUFVLGFBQWEsT0FBTyxRQUFRLE1BQU0sT0FBTztBQUFBLElBQzdFLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLFNBQU4sY0FBcUIsUUFBUTtBQUFBLEVBQ2hDLE9BQU8sT0FBTztBQUNWLFVBQU0sYUFBYSxLQUFLLFNBQVMsS0FBSztBQUN0QyxRQUFJLGVBQWUsY0FBYyxLQUFLO0FBQ2xDLFlBQU0sTUFBTSxLQUFLLGdCQUFnQixLQUFLO0FBQ3RDLHdCQUFrQixLQUFLO0FBQUEsUUFDbkIsTUFBTSxhQUFhO0FBQUEsUUFDbkIsVUFBVSxjQUFjO0FBQUEsUUFDeEIsVUFBVSxJQUFJO0FBQUEsTUFDbEIsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNYO0FBQ0EsV0FBTyxFQUFFLFFBQVEsU0FBUyxPQUFPLE1BQU0sS0FBSztBQUFBLEVBQ2hEO0FBQ0o7QUFDQSxPQUFPLFNBQVMsQ0FBQyxXQUFXO0FBQ3hCLFNBQU8sSUFBSSxPQUFPO0FBQUEsSUFDZCxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFDTyxJQUFNLFFBQVEsT0FBTyxXQUFXO0FBQ2hDLElBQU0sYUFBTixjQUF5QixRQUFRO0FBQUEsRUFDcEMsT0FBTyxPQUFPO0FBQ1YsVUFBTSxFQUFFLElBQUksSUFBSSxLQUFLLG9CQUFvQixLQUFLO0FBQzlDLFVBQU0sT0FBTyxJQUFJO0FBQ2pCLFdBQU8sS0FBSyxLQUFLLEtBQUssT0FBTztBQUFBLE1BQ3pCO0FBQUEsTUFDQSxNQUFNLElBQUk7QUFBQSxNQUNWLFFBQVE7QUFBQSxJQUNaLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxTQUFTO0FBQ0wsV0FBTyxLQUFLLEtBQUs7QUFBQSxFQUNyQjtBQUNKO0FBQ08sSUFBTSxjQUFOLE1BQU0scUJBQW9CLFFBQVE7QUFBQSxFQUNyQyxPQUFPLE9BQU87QUFDVixVQUFNLEVBQUUsUUFBUSxJQUFJLElBQUksS0FBSyxvQkFBb0IsS0FBSztBQUN0RCxRQUFJLElBQUksT0FBTyxPQUFPO0FBQ2xCLFlBQU0sY0FBYyxZQUFZO0FBQzVCLGNBQU0sV0FBVyxNQUFNLEtBQUssS0FBSyxHQUFHLFlBQVk7QUFBQSxVQUM1QyxNQUFNLElBQUk7QUFBQSxVQUNWLE1BQU0sSUFBSTtBQUFBLFVBQ1YsUUFBUTtBQUFBLFFBQ1osQ0FBQztBQUNELFlBQUksU0FBUyxXQUFXO0FBQ3BCLGlCQUFPO0FBQ1gsWUFBSSxTQUFTLFdBQVcsU0FBUztBQUM3QixpQkFBTyxNQUFNO0FBQ2IsaUJBQU8sTUFBTSxTQUFTLEtBQUs7QUFBQSxRQUMvQixPQUNLO0FBQ0QsaUJBQU8sS0FBSyxLQUFLLElBQUksWUFBWTtBQUFBLFlBQzdCLE1BQU0sU0FBUztBQUFBLFlBQ2YsTUFBTSxJQUFJO0FBQUEsWUFDVixRQUFRO0FBQUEsVUFDWixDQUFDO0FBQUEsUUFDTDtBQUFBLE1BQ0o7QUFDQSxhQUFPLFlBQVk7QUFBQSxJQUN2QixPQUNLO0FBQ0QsWUFBTSxXQUFXLEtBQUssS0FBSyxHQUFHLFdBQVc7QUFBQSxRQUNyQyxNQUFNLElBQUk7QUFBQSxRQUNWLE1BQU0sSUFBSTtBQUFBLFFBQ1YsUUFBUTtBQUFBLE1BQ1osQ0FBQztBQUNELFVBQUksU0FBUyxXQUFXO0FBQ3BCLGVBQU87QUFDWCxVQUFJLFNBQVMsV0FBVyxTQUFTO0FBQzdCLGVBQU8sTUFBTTtBQUNiLGVBQU87QUFBQSxVQUNILFFBQVE7QUFBQSxVQUNSLE9BQU8sU0FBUztBQUFBLFFBQ3BCO0FBQUEsTUFDSixPQUNLO0FBQ0QsZUFBTyxLQUFLLEtBQUssSUFBSSxXQUFXO0FBQUEsVUFDNUIsTUFBTSxTQUFTO0FBQUEsVUFDZixNQUFNLElBQUk7QUFBQSxVQUNWLFFBQVE7QUFBQSxRQUNaLENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBLE9BQU8sT0FBTyxHQUFHLEdBQUc7QUFDaEIsV0FBTyxJQUFJLGFBQVk7QUFBQSxNQUNuQixJQUFJO0FBQUEsTUFDSixLQUFLO0FBQUEsTUFDTCxVQUFVLHNCQUFzQjtBQUFBLElBQ3BDLENBQUM7QUFBQSxFQUNMO0FBQ0o7QUFDTyxJQUFNLGNBQU4sY0FBMEIsUUFBUTtBQUFBLEVBQ3JDLE9BQU8sT0FBTztBQUNWLFVBQU0sU0FBUyxLQUFLLEtBQUssVUFBVSxPQUFPLEtBQUs7QUFDL0MsVUFBTSxTQUFTLENBQUMsU0FBUztBQUNyQixVQUFJLFFBQVEsSUFBSSxHQUFHO0FBQ2YsYUFBSyxRQUFRLE9BQU8sT0FBTyxLQUFLLEtBQUs7QUFBQSxNQUN6QztBQUNBLGFBQU87QUFBQSxJQUNYO0FBQ0EsV0FBTyxRQUFRLE1BQU0sSUFBSSxPQUFPLEtBQUssQ0FBQyxTQUFTLE9BQU8sSUFBSSxDQUFDLElBQUksT0FBTyxNQUFNO0FBQUEsRUFDaEY7QUFBQSxFQUNBLFNBQVM7QUFDTCxXQUFPLEtBQUssS0FBSztBQUFBLEVBQ3JCO0FBQ0o7QUFDQSxZQUFZLFNBQVMsQ0FBQyxNQUFNLFdBQVc7QUFDbkMsU0FBTyxJQUFJLFlBQVk7QUFBQSxJQUNuQixXQUFXO0FBQUEsSUFDWCxVQUFVLHNCQUFzQjtBQUFBLElBQ2hDLEdBQUcsb0JBQW9CLE1BQU07QUFBQSxFQUNqQyxDQUFDO0FBQ0w7QUFRQSxTQUFTLFlBQVksUUFBUSxNQUFNO0FBQy9CLFFBQU0sSUFBSSxPQUFPLFdBQVcsYUFBYSxPQUFPLElBQUksSUFBSSxPQUFPLFdBQVcsV0FBVyxFQUFFLFNBQVMsT0FBTyxJQUFJO0FBQzNHLFFBQU0sS0FBSyxPQUFPLE1BQU0sV0FBVyxFQUFFLFNBQVMsRUFBRSxJQUFJO0FBQ3BELFNBQU87QUFDWDtBQUNPLFNBQVMsT0FBTyxPQUFPLFVBQVUsQ0FBQyxHQVd6QyxPQUFPO0FBQ0gsTUFBSTtBQUNBLFdBQU8sT0FBTyxPQUFPLEVBQUUsWUFBWSxDQUFDLE1BQU0sUUFBUTtBQUM5QyxZQUFNLElBQUksTUFBTSxJQUFJO0FBQ3BCLFVBQUksYUFBYSxTQUFTO0FBQ3RCLGVBQU8sRUFBRSxLQUFLLENBQUNDLE9BQU07QUFDakIsY0FBSSxDQUFDQSxJQUFHO0FBQ0osa0JBQU0sU0FBUyxZQUFZLFNBQVMsSUFBSTtBQUN4QyxrQkFBTSxTQUFTLE9BQU8sU0FBUyxTQUFTO0FBQ3hDLGdCQUFJLFNBQVMsRUFBRSxNQUFNLFVBQVUsR0FBRyxRQUFRLE9BQU8sT0FBTyxDQUFDO0FBQUEsVUFDN0Q7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMO0FBQ0EsVUFBSSxDQUFDLEdBQUc7QUFDSixjQUFNLFNBQVMsWUFBWSxTQUFTLElBQUk7QUFDeEMsY0FBTSxTQUFTLE9BQU8sU0FBUyxTQUFTO0FBQ3hDLFlBQUksU0FBUyxFQUFFLE1BQU0sVUFBVSxHQUFHLFFBQVEsT0FBTyxPQUFPLENBQUM7QUFBQSxNQUM3RDtBQUNBO0FBQUEsSUFDSixDQUFDO0FBQ0wsU0FBTyxPQUFPLE9BQU87QUFDekI7QUFFTyxJQUFNLE9BQU87QUFBQSxFQUNoQixRQUFRLFVBQVU7QUFDdEI7QUFDTyxJQUFJO0FBQUEsQ0FDVixTQUFVQyx3QkFBdUI7QUFDOUIsRUFBQUEsdUJBQXNCLFdBQVcsSUFBSTtBQUNyQyxFQUFBQSx1QkFBc0IsV0FBVyxJQUFJO0FBQ3JDLEVBQUFBLHVCQUFzQixRQUFRLElBQUk7QUFDbEMsRUFBQUEsdUJBQXNCLFdBQVcsSUFBSTtBQUNyQyxFQUFBQSx1QkFBc0IsWUFBWSxJQUFJO0FBQ3RDLEVBQUFBLHVCQUFzQixTQUFTLElBQUk7QUFDbkMsRUFBQUEsdUJBQXNCLFdBQVcsSUFBSTtBQUNyQyxFQUFBQSx1QkFBc0IsY0FBYyxJQUFJO0FBQ3hDLEVBQUFBLHVCQUFzQixTQUFTLElBQUk7QUFDbkMsRUFBQUEsdUJBQXNCLFFBQVEsSUFBSTtBQUNsQyxFQUFBQSx1QkFBc0IsWUFBWSxJQUFJO0FBQ3RDLEVBQUFBLHVCQUFzQixVQUFVLElBQUk7QUFDcEMsRUFBQUEsdUJBQXNCLFNBQVMsSUFBSTtBQUNuQyxFQUFBQSx1QkFBc0IsVUFBVSxJQUFJO0FBQ3BDLEVBQUFBLHVCQUFzQixXQUFXLElBQUk7QUFDckMsRUFBQUEsdUJBQXNCLFVBQVUsSUFBSTtBQUNwQyxFQUFBQSx1QkFBc0IsdUJBQXVCLElBQUk7QUFDakQsRUFBQUEsdUJBQXNCLGlCQUFpQixJQUFJO0FBQzNDLEVBQUFBLHVCQUFzQixVQUFVLElBQUk7QUFDcEMsRUFBQUEsdUJBQXNCLFdBQVcsSUFBSTtBQUNyQyxFQUFBQSx1QkFBc0IsUUFBUSxJQUFJO0FBQ2xDLEVBQUFBLHVCQUFzQixRQUFRLElBQUk7QUFDbEMsRUFBQUEsdUJBQXNCLGFBQWEsSUFBSTtBQUN2QyxFQUFBQSx1QkFBc0IsU0FBUyxJQUFJO0FBQ25DLEVBQUFBLHVCQUFzQixZQUFZLElBQUk7QUFDdEMsRUFBQUEsdUJBQXNCLFNBQVMsSUFBSTtBQUNuQyxFQUFBQSx1QkFBc0IsWUFBWSxJQUFJO0FBQ3RDLEVBQUFBLHVCQUFzQixlQUFlLElBQUk7QUFDekMsRUFBQUEsdUJBQXNCLGFBQWEsSUFBSTtBQUN2QyxFQUFBQSx1QkFBc0IsYUFBYSxJQUFJO0FBQ3ZDLEVBQUFBLHVCQUFzQixZQUFZLElBQUk7QUFDdEMsRUFBQUEsdUJBQXNCLFVBQVUsSUFBSTtBQUNwQyxFQUFBQSx1QkFBc0IsWUFBWSxJQUFJO0FBQ3RDLEVBQUFBLHVCQUFzQixZQUFZLElBQUk7QUFDdEMsRUFBQUEsdUJBQXNCLGFBQWEsSUFBSTtBQUN2QyxFQUFBQSx1QkFBc0IsYUFBYSxJQUFJO0FBQzNDLEdBQUcsMEJBQTBCLHdCQUF3QixDQUFDLEVBQUU7QUFLeEQsSUFBTSxpQkFBaUIsQ0FFdkIsS0FBSyxTQUFTO0FBQUEsRUFDVixTQUFTLHlCQUF5QixJQUFJLElBQUk7QUFDOUMsTUFBTSxPQUFPLENBQUMsU0FBUyxnQkFBZ0IsS0FBSyxNQUFNO0FBQ2xELElBQU0sYUFBYSxVQUFVO0FBQzdCLElBQU0sYUFBYSxVQUFVO0FBQzdCLElBQU0sVUFBVSxPQUFPO0FBQ3ZCLElBQU0sYUFBYSxVQUFVO0FBQzdCLElBQU0sY0FBYyxXQUFXO0FBQy9CLElBQU0sV0FBVyxRQUFRO0FBQ3pCLElBQU0sYUFBYSxVQUFVO0FBQzdCLElBQU0sZ0JBQWdCLGFBQWE7QUFDbkMsSUFBTSxXQUFXLFFBQVE7QUFDekIsSUFBTSxVQUFVLE9BQU87QUFDdkIsSUFBTSxjQUFjLFdBQVc7QUFDL0IsSUFBTSxZQUFZLFNBQVM7QUFDM0IsSUFBTSxXQUFXLFFBQVE7QUFDekIsSUFBTSxZQUFZLFNBQVM7QUFDM0IsSUFBTSxhQUFhLFVBQVU7QUFDN0IsSUFBTSxtQkFBbUIsVUFBVTtBQUNuQyxJQUFNLFlBQVksU0FBUztBQUMzQixJQUFNLHlCQUF5QixzQkFBc0I7QUFDckQsSUFBTSxtQkFBbUIsZ0JBQWdCO0FBQ3pDLElBQU0sWUFBWSxTQUFTO0FBQzNCLElBQU0sYUFBYSxVQUFVO0FBQzdCLElBQU0sVUFBVSxPQUFPO0FBQ3ZCLElBQU0sVUFBVSxPQUFPO0FBQ3ZCLElBQU0sZUFBZSxZQUFZO0FBQ2pDLElBQU0sV0FBVyxRQUFRO0FBQ3pCLElBQU0sY0FBYyxXQUFXO0FBQy9CLElBQU0sV0FBVyxRQUFRO0FBQ3pCLElBQU0saUJBQWlCLGNBQWM7QUFDckMsSUFBTSxjQUFjLFdBQVc7QUFDL0IsSUFBTSxjQUFjLFdBQVc7QUFDL0IsSUFBTSxlQUFlLFlBQVk7QUFDakMsSUFBTSxlQUFlLFlBQVk7QUFDakMsSUFBTSxpQkFBaUIsV0FBVztBQUNsQyxJQUFNLGVBQWUsWUFBWTtBQUNqQyxJQUFNLFVBQVUsTUFBTSxXQUFXLEVBQUUsU0FBUztBQUM1QyxJQUFNLFVBQVUsTUFBTSxXQUFXLEVBQUUsU0FBUztBQUM1QyxJQUFNLFdBQVcsTUFBTSxZQUFZLEVBQUUsU0FBUztBQUN2QyxJQUFNLFNBQVM7QUFBQSxFQUNsQixRQUFTLENBQUMsUUFBUSxVQUFVLE9BQU8sRUFBRSxHQUFHLEtBQUssUUFBUSxLQUFLLENBQUM7QUFBQSxFQUMzRCxRQUFTLENBQUMsUUFBUSxVQUFVLE9BQU8sRUFBRSxHQUFHLEtBQUssUUFBUSxLQUFLLENBQUM7QUFBQSxFQUMzRCxTQUFVLENBQUMsUUFBUSxXQUFXLE9BQU87QUFBQSxJQUNqQyxHQUFHO0FBQUEsSUFDSCxRQUFRO0FBQUEsRUFDWixDQUFDO0FBQUEsRUFDRCxRQUFTLENBQUMsUUFBUSxVQUFVLE9BQU8sRUFBRSxHQUFHLEtBQUssUUFBUSxLQUFLLENBQUM7QUFBQSxFQUMzRCxNQUFPLENBQUMsUUFBUSxRQUFRLE9BQU8sRUFBRSxHQUFHLEtBQUssUUFBUSxLQUFLLENBQUM7QUFDM0Q7QUFFTyxJQUFNLFFBQVE7OztBQ2psSGQsSUFBTSxhQUFhLGlCQUFFLEtBQUssQ0FBQyxRQUFRLFVBQVUsT0FBTyxDQUFDO0FBS3JELElBQU0scUJBQXFCLGlCQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUM7QUFLakQsSUFBTSxlQUFlO0FBQUEsRUFDMUIsT0FBTyxtQkFBbUIsU0FBUztBQUFBLEVBQ25DLE9BQU8sV0FBVyxTQUFTO0FBQzdCOzs7QUMvQkEsSUFBTSxlQUFlO0FBQ2QsSUFBTSxXQUFXLGlCQUNyQixPQUFPO0FBQUEsRUFDTixHQUFHLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUM7QUFBQSxFQUN6QixHQUFHLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUM7QUFBQSxFQUN6QixHQUFHLGlCQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxFQUN6QixHQUFHLGlCQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUM7QUFDM0IsQ0FBQyxFQUNBO0FBQUEsRUFDQyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxJQUFJLGdCQUFnQixFQUFFLElBQUksRUFBRSxLQUFLLElBQUk7QUFBQSxFQUN6RCxFQUFFLFNBQVMsdUVBQTZEO0FBQzFFO0FBUUssSUFBTSxhQUFhLGlCQUFFLE9BQU87QUFBQSxFQUNqQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLE9BQU87QUFBQSxFQUN2QixLQUFLLGlCQUFFLE9BQU8sRUFBRSxJQUFJO0FBQUE7QUFBQTtBQUFBLEVBR3BCLEtBQUssaUJBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRTtBQUFBLEVBQzFCLFNBQVMsaUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUEsRUFHN0IsR0FBRztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFRSCxNQUFNLFNBQVMsU0FBUztBQUFBLEVBQ3hCLFdBQVcsaUJBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQzVDLENBQUM7OztBQ2pCTSxJQUFNLGFBQWEsaUJBQUUsT0FBTztBQUFBLEVBQ2pDLE1BQU0saUJBQUUsT0FBTztBQUFBLEVBQ2YsTUFBTSxpQkFBRSxPQUFPO0FBQUEsRUFDZixNQUFNLGlCQUFFLE9BQU87QUFBQSxFQUNmLE1BQU0saUJBQUUsT0FBTztBQUFBLEVBQ2YsV0FBVyxpQkFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQztBQUFBLEVBQzFDLFdBQVcsaUJBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUM7QUFBQSxFQUMxQyxVQUFVLGlCQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFBQTtBQUFBO0FBQUEsRUFHbEMsWUFBWSxpQkFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQ3RDLENBQUM7QUFTTSxJQUFNLGdCQUFnQixpQkFBRSxLQUFLLENBQUMsUUFBUSxRQUFRLENBQUM7QUFLL0MsSUFBTSxjQUFjLGlCQUFFLE9BQU87QUFBQSxFQUNsQyxLQUFLLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUEsRUFDekIsVUFBVSxjQUFjLFNBQVM7QUFBQSxFQUNqQyxLQUFLLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUEsRUFDekIsVUFBVSxjQUFjLFNBQVM7QUFDbkMsQ0FBQztBQWFNLElBQU0sY0FBYyxpQkFBRSxPQUFPO0FBQUEsRUFDbEMsUUFBUSxpQkFBRSxRQUFRLFFBQVE7QUFBQSxFQUMxQixPQUFPLGlCQUFFLE9BQU87QUFBQSxFQUNoQixXQUFXLGlCQUFFLE9BQU87QUFBQSxFQUNwQixnQkFBZ0IsaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFBQSxFQUNwRCxvQkFBb0IsaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFDMUQsQ0FBQztBQUdNLElBQU0saUJBQWlCLGlCQUFFLE9BQU87QUFBQSxFQUNyQyxRQUFRLGlCQUFFLFFBQVEsV0FBVztBQUFBLEVBQzdCLEdBQUcsaUJBQUUsT0FBTztBQUFBLEVBQ1osR0FBRyxpQkFBRSxPQUFPO0FBQUEsRUFDWixHQUFHLGlCQUFFLE9BQU87QUFBQSxFQUNaLFlBQVksaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFBQSxFQUNoRCxZQUFZLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQUEsRUFDaEQsWUFBWSxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUNsRCxDQUFDO0FBR00sSUFBTSxtQkFBbUIsaUJBQUUsT0FBTztBQUFBLEVBQ3ZDLFFBQVEsaUJBQUUsUUFBUSxhQUFhO0FBQUEsRUFDL0IsR0FBRyxpQkFBRSxPQUFPO0FBQUEsRUFDWixHQUFHLGlCQUFFLE9BQU87QUFBQSxFQUNaLFlBQVksaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFBQSxFQUNoRCxZQUFZLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQ2xELENBQUM7QUFHTSxJQUFNLG1CQUFtQixpQkFBRSxPQUFPO0FBQUEsRUFDdkMsUUFBUSxpQkFBRSxRQUFRLGFBQWE7QUFBQSxFQUMvQixHQUFHLGlCQUFFLE9BQU87QUFBQSxFQUNaLEdBQUcsaUJBQUUsT0FBTztBQUFBLEVBQ1osWUFBWSxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUFBLEVBQ2hELFlBQVksaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFDbEQsQ0FBQztBQU9NLElBQU0sZ0JBQWdCLGlCQUFFLE9BQU87QUFBQSxFQUNwQyxRQUFRLGlCQUFFLFFBQVEsVUFBVTtBQUFBLEVBQzVCLEdBQUcsaUJBQUUsT0FBTztBQUFBLEVBQ1osWUFBWSxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUNsRCxDQUFDO0FBS00sSUFBTSxnQkFBZ0IsaUJBQUUsbUJBQW1CLFVBQVU7QUFBQSxFQUMxRDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBWU0sSUFBTSxnQkFBZ0IsaUJBQUUsS0FBSztBQUFBLEVBQ2xDO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFHRCxJQUFNLGdCQUFnQixpQkFBRSxPQUFPO0FBQUEsRUFDN0IsTUFBTSxpQkFBRSxRQUFRLE9BQU87QUFBQSxFQUN2QixJQUFJLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxPQUFPLEdBQUcsaUJBQUUsT0FBTyxDQUFDLENBQUM7QUFBQSxFQUNwQyxPQUFPLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUE7QUFBQSxFQUUzQixPQUFPLGNBQWMsU0FBUztBQUFBLEVBQzlCLE9BQU8sY0FBYyxTQUFTO0FBQ2hDLENBQUM7QUFDRCxJQUFNLGdCQUFnQixpQkFBRSxPQUFPO0FBQUEsRUFDN0IsTUFBTSxpQkFBRSxRQUFRLE9BQU87QUFBQSxFQUN2QixPQUFPO0FBQUE7QUFBQTtBQUFBLEVBR1AsT0FBTyxpQkFBRSxLQUFLLENBQUMsU0FBUyxRQUFRLENBQUMsRUFBRSxTQUFTO0FBQUEsRUFDNUMsT0FBTyxpQkFBRSxLQUFLLENBQUMsU0FBUyxTQUFTLFFBQVEsT0FBTyxDQUFDLEVBQUUsU0FBUztBQUFBLEVBQzVELFFBQVEsWUFBWSxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTTdCLFFBQVEsaUJBQUUsUUFBUSxFQUFFLFNBQVM7QUFBQSxFQUM3QixPQUFPLGNBQWMsU0FBUztBQUNoQyxDQUFDO0FBSUQsSUFBTSxxQkFBcUIsaUJBQUUsT0FBTztBQUFBLEVBQ2xDLE1BQU0saUJBQUUsUUFBUSxZQUFZO0FBQUEsRUFDNUIsWUFBWSxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDO0FBQUEsRUFDNUIsT0FBTyxpQkFBRSxLQUFLLENBQUMsU0FBUyxRQUFRLENBQUMsRUFBRSxTQUFTO0FBQUE7QUFBQSxFQUU1QyxRQUFRLGlCQUFFLFFBQVEsRUFBRSxTQUFTO0FBQUEsRUFDN0IsT0FBTyxjQUFjLFNBQVM7QUFDaEMsQ0FBQztBQUNELElBQU0sa0JBQWtCLGlCQUFFLE9BQU87QUFBQSxFQUMvQixNQUFNLGlCQUFFLFFBQVEsU0FBUztBQUFBLEVBQ3pCLE1BQU0saUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQztBQUFBLEVBQ3RDLElBQUksaUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQztBQUFBO0FBQUEsRUFFcEMsV0FBVyxpQkFBRSxNQUFNLENBQUMsZUFBZSxhQUFhLENBQUMsRUFBRSxTQUFTO0FBQUEsRUFDNUQsT0FBTyxjQUFjLFNBQVM7QUFDaEMsQ0FBQztBQUlELElBQU0sY0FBYyxpQkFBRSxPQUFPO0FBQUEsRUFDM0IsTUFBTSxpQkFBRSxRQUFRLEtBQUs7QUFBQSxFQUNyQixNQUFNLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxPQUFPLEdBQUcsaUJBQUUsT0FBTyxDQUFDLENBQUM7QUFBQSxFQUN0QyxTQUFTLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxPQUFPLEdBQUcsaUJBQUUsT0FBTyxDQUFDLENBQUM7QUFBQSxFQUN6QyxXQUFXLGNBQWMsU0FBUztBQUFBO0FBQUEsRUFFbEMsUUFBUSxpQkFBRSxRQUFRLEVBQUUsU0FBUztBQUFBLEVBQzdCLE9BQU8sY0FBYyxTQUFTO0FBQ2hDLENBQUM7QUFDRCxJQUFNLGtCQUFrQixpQkFBRSxPQUFPO0FBQUEsRUFDL0IsTUFBTSxpQkFBRSxRQUFRLFNBQVM7QUFBQSxFQUN6QixVQUFVLGlCQUFFLE1BQU0saUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsRUFDMUQsUUFBUSxpQkFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDaEMsT0FBTyxjQUFjLFNBQVM7QUFDaEMsQ0FBQztBQUNNLElBQU0sV0FBVyxpQkFBRSxtQkFBbUIsUUFBUTtBQUFBLEVBQ25EO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDOzs7QUNuTU0sSUFBTSxtQkFBbUIsaUJBQUUsT0FBTztBQUFBLEVBQ3ZDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsY0FBYztBQUFBLEVBQzlCLE1BQU07QUFBQSxFQUNOLFdBQVcsaUJBQUUsTUFBTSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDekMsQ0FBQzs7O0FDVUQsSUFBTSxXQUFXLGlCQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFFLFFBQVEsTUFBTSxFQUFFLENBQUM7QUFDckQsSUFBTSxhQUFhLGlCQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFFLFFBQVEsUUFBUSxFQUFFLENBQUM7QUFDekQsSUFBTSxnQkFBZ0IsaUJBQUUsT0FBTyxFQUFFLE1BQU0saUJBQUUsUUFBUSxXQUFXLEVBQUUsQ0FBQztBQUMvRCxJQUFNLFdBQVcsaUJBQUUsT0FBTyxFQUFFLE1BQU0saUJBQUUsUUFBUSxNQUFNLEVBQUUsQ0FBQztBQUNyRCxJQUFNLGdCQUFnQixpQkFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBRSxRQUFRLFdBQVcsRUFBRSxDQUFDO0FBQy9ELElBQU0sa0JBQWtCLGlCQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFFLFFBQVEsYUFBYSxFQUFFLENBQUM7QUFLbkUsSUFBTSxhQUFhLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDOUM7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFXTSxJQUFNLGFBQWEsaUJBQUUsT0FBTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU1qQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUM7QUFBQSxFQUNwQixRQUFRLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUM7QUFBQTtBQUFBLEVBRXhCLG1CQUFtQixpQkFBRSxNQUFNLGlCQUFFLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBR2pELGFBQWEsaUJBQUUsS0FBSyxDQUFDLFNBQVMsWUFBWSxDQUFDLEVBQUUsU0FBUztBQUFBO0FBQUEsRUFFdEQsV0FBVyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsU0FBUztBQUN4QyxDQUFDO0FBT00sSUFBTSxpQkFBaUIsaUJBQUUsT0FBTztBQUFBLEVBQ3JDLE1BQU0saUJBQUUsUUFBUSxhQUFhO0FBQUEsRUFDN0IsT0FBTyxpQkFBRSxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTWhCLFNBQVMsaUJBQUUsTUFBTSxVQUFVLEVBQUUsU0FBUztBQUN4QyxDQUFDO0FBT00sSUFBTSxnQkFBZ0IsaUJBQUUsT0FBTztBQUFBLEVBQ3BDLE1BQU0saUJBQUUsUUFBUSxZQUFZO0FBQzlCLENBQUM7QUFTRCxJQUFNLHdCQUF3QixpQkFBRSxPQUFPO0FBQUEsRUFDckMsTUFBTSxpQkFBRSxRQUFRLE1BQU07QUFBQSxFQUN0QixNQUFNLGlCQUFFLE9BQU87QUFBQSxFQUNmLE9BQU8saUJBQUUsTUFBTSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQUNNLElBQU0sMEJBQTBCLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDbEU7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUEwQ0QsSUFBTSxvQkFBb0IsaUJBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTO0FBaUNyRCxJQUFNLDJCQUEyQixpQkFBRSxPQUFPO0FBQUEsRUFDeEMsSUFBSTtBQUFBLEVBQ0osTUFBTSxpQkFBRSxRQUFRLFdBQVc7QUFBQSxFQUMzQixTQUFTLGlCQUFFLE1BQU0sdUJBQXVCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdEQsQ0FBQztBQUlELElBQU0seUJBQXlCLGlCQUFFLE9BQU87QUFBQSxFQUN0QyxJQUFJO0FBQUEsRUFDSixNQUFNLGlCQUFFLFFBQVEsU0FBUztBQUFBLEVBQ3pCLE9BQU8saUJBQUUsTUFBTSxDQUFDLGlCQUFFLFFBQVEsQ0FBQyxHQUFHLGlCQUFFLFFBQVEsQ0FBQyxHQUFHLGlCQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFBQSxFQUN6RCxTQUFTLGlCQUFFLE1BQU0sdUJBQXVCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdEQsQ0FBQztBQVFELElBQU0sc0JBQXNCLGlCQUFFLE9BQU87QUFBQSxFQUNuQyxJQUFJO0FBQUEsRUFDSixNQUFNLGlCQUFFLFFBQVEsWUFBWTtBQUFBLEVBQzVCLE9BQU8saUJBQUUsT0FBTztBQUFBLEVBQ2hCLEdBQUc7QUFDTCxDQUFDO0FBT0QsSUFBTSx1QkFBdUIsaUJBQUUsT0FBTztBQUFBLEVBQ3BDLElBQUk7QUFBQSxFQUNKLE1BQU0saUJBQUUsUUFBUSxPQUFPO0FBQUEsRUFDdkIsS0FBSyxpQkFBRSxPQUFPO0FBQUEsRUFDZCxLQUFLLGlCQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUU7QUFBQSxFQUMxQixHQUFHO0FBQUEsRUFDSCxNQUFNLFNBQVMsU0FBUztBQUFBLEVBQ3hCLFdBQVcsaUJBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQzVDLENBQUM7QUFzQk0sSUFBTSxxQkFJVCxpQkFBRTtBQUFBLEVBQUssTUFDVCxpQkFBRSxPQUFPO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixTQUFTLGlCQUFFLE1BQU0sdUJBQXVCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQSxJQUNwRCxVQUFVLGlCQUNQLE1BQU0saUJBQUUsTUFBTSxDQUFDLDJCQUEyQiwwQkFBMEIsQ0FBQyxDQUFDLEVBQ3RFLFNBQVM7QUFBQSxFQUNkLENBQUM7QUFDSDtBQUVPLElBQU0sNEJBQTRCLGlCQUFFLE9BQU87QUFBQSxFQUNoRCxJQUFJO0FBQUEsRUFDSixNQUFNLGlCQUFFLFFBQVEsYUFBYTtBQUFBLEVBQzdCLE9BQU8saUJBQUUsTUFBTSxrQkFBa0IsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBRU0sSUFBTSw2QkFBNkIsaUJBQUUsT0FBTztBQUFBLEVBQ2pELElBQUk7QUFBQSxFQUNKLE1BQU0saUJBQUUsUUFBUSxjQUFjO0FBQUEsRUFDOUIsT0FBTyxpQkFBRSxNQUFNLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFpQk0sSUFBTSxrQkFJVCxpQkFBRSxtQkFBbUIsUUFBUTtBQUFBLEVBQy9CO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQWVNLElBQU0saUJBQWlCLGlCQUFFLE9BQU87QUFBQSxFQUNyQyxNQUFNLGlCQUFFLFFBQVEsWUFBWTtBQUFBLEVBQzVCLFNBQVMsaUJBQUUsTUFBTSxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQSxFQUM1QyxhQUFhLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQ25DLENBQUM7QUFpQk0sU0FBUyxzQkFBc0IsR0FBcUM7QUFDekUsTUFBSSxVQUFVLEVBQUU7QUFDaEIsUUFBTSxPQUFPLEVBQUUsR0FBRyxFQUFFO0FBR3BCLE1BQUksT0FBTyxLQUFLLGVBQWUsWUFBWSxZQUFZLFFBQVc7QUFDaEUsVUFBTSxPQUFPLEtBQUs7QUFDbEIsY0FBVSxPQUFPLENBQUMsRUFBRSxNQUFNLFFBQVEsS0FBSyxDQUFDLElBQUksQ0FBQztBQUFBLEVBQy9DO0FBQ0EsU0FBTyxLQUFLO0FBT1osUUFBTSxlQUFlLENBQUMsUUFBUSxlQUFlLFlBQVk7QUFDekQsTUFBSSxNQUFNLFFBQVEsT0FBTyxLQUFLLFFBQVEsU0FBUyxHQUFHO0FBQ2hELFVBQU0sUUFBUSxRQUFRLENBQUM7QUFDdkIsUUFBSSxPQUFPLE9BQU8sU0FBUyxZQUFZLGFBQWEsU0FBUyxNQUFNLElBQUksR0FBRztBQUN4RSxnQkFBVSxDQUFDLEVBQUUsTUFBTSxhQUFhLFFBQVEsQ0FBQztBQUFBLElBQzNDO0FBQUEsRUFDRjtBQUtBLFFBQU0sUUFBUSxLQUFLO0FBQ25CLFNBQU8sS0FBSztBQUNaLE1BQUksVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVO0FBQy9DLFVBQU0sRUFBRSxLQUFLLElBQUksSUFBSTtBQUNyQixRQUFJLE9BQU8sUUFBUSxZQUFZLEtBQUs7QUFDbEMsWUFBTSxTQUFTLE1BQU0sUUFBUSxPQUFPLElBQUksQ0FBQyxHQUFHLE9BQU8sSUFBSSxDQUFDO0FBQ3hELGFBQU8sS0FBSztBQUFBLFFBQ1YsTUFBTTtBQUFBLFFBQ047QUFBQSxRQUNBLEtBQUssT0FBTyxRQUFRLFdBQVcsTUFBTTtBQUFBLE1BQ3ZDLENBQUM7QUFDRCxnQkFBVTtBQUFBLElBQ1o7QUFBQSxFQUNGO0FBRUEsU0FBTyxFQUFFLEdBQUcsTUFBTSxTQUFTLFdBQVcsQ0FBQyxFQUFFO0FBQzNDO0FBRU8sSUFBTSxPQUFPLGlCQUFFO0FBQUEsRUFDcEIsQ0FBQyxNQUFNO0FBRUwsUUFBSSxPQUFPLE1BQU0sU0FBVSxRQUFPLEVBQUUsTUFBTSxFQUFFO0FBQzVDLFFBQ0UsTUFBTSxRQUNOLE9BQU8sTUFBTSxZQUNaLEVBQXlCLFNBQVMsY0FDbkM7QUFDQSxhQUFPLHNCQUFzQixDQUE0QjtBQUFBLElBQzNEO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsSUFDM0I7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGLENBQUM7QUFDSDtBQU1PLElBQU0sV0FBVyxpQkFBRSxPQUFPO0FBQUEsRUFDL0IsTUFBTSxpQkFBRSxRQUFRLE1BQU07QUFBQSxFQUN0QixNQUFNLGlCQUFFLE9BQU87QUFBQTtBQUFBLEVBRWYsT0FBTyxpQkFBRSxNQUFNLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBT00sSUFBTSxhQUFhLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDckQ7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFxQk0sSUFBTSxhQUFhLGlCQUFFLE9BQU87QUFBQSxFQUNqQyxNQUFNLGlCQUFFLFFBQVEsT0FBTztBQUFBLEVBQ3ZCLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixRQUFRLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUM7QUFBQTtBQUFBLEVBRXhCLG1CQUFtQixpQkFBRSxNQUFNLGlCQUFFLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQUEsRUFDakQsT0FBTyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQUE7QUFBQTtBQUFBLEVBRzVDLE1BQU0saUJBQUUsTUFBTSxVQUFVLEVBQUUsU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU1uQyxpQkFBaUIsaUJBQUUsTUFBTSxpQkFBRSxPQUFPO0FBQUEsSUFDaEMsT0FBTyxpQkFBRSxPQUFPO0FBQUEsSUFDaEIsVUFBVSxpQkFBRSxNQUFNLFVBQVU7QUFBQSxFQUM5QixDQUFDLENBQUMsRUFBRSxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQWNiLDZCQUE2QixpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQVd0RCxZQUFZLGlCQUFFLEtBQUssQ0FBQyxRQUFRLFdBQVcsTUFBTSxDQUFDLEVBQUUsU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSXpELFdBQVcsaUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUl0QyxhQUFhLGlCQUFFLEtBQUssQ0FBQyxTQUFTLFlBQVksQ0FBQyxFQUFFLFNBQVM7QUFDeEQsQ0FBQztBQU1NLElBQU0sb0JBQW9CLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDNUQ7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDOzs7QUM5Z0JNLElBQU0saUJBQWlCLGlCQUFFLE9BQU87QUFBQSxFQUNyQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLFdBQVc7QUFBQSxFQUMzQixTQUFTLGlCQUFFLE1BQU0sVUFBVTtBQUM3QixDQUFDOzs7QUNGTSxJQUFNLGVBQWUsaUJBQUUsTUFBTSxDQUFDLGlCQUFFLFFBQVEsQ0FBQyxHQUFHLGlCQUFFLFFBQVEsQ0FBQyxHQUFHLGlCQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFHdkUsSUFBTSxlQUFlLGlCQUFFLE9BQU87QUFBQSxFQUNuQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLFNBQVM7QUFBQSxFQUN6QixPQUFPO0FBQUEsRUFDUCxTQUFTLGlCQUFFLE1BQU0sVUFBVTtBQUM3QixDQUFDOzs7QUNnQk0sSUFBTSxhQUFhLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDckQsaUJBQUUsT0FBTyxFQUFFLE1BQU0saUJBQUUsUUFBUSxNQUFNLEVBQUUsQ0FBQztBQUFBO0FBQUE7QUFBQSxFQUdwQyxpQkFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBRSxRQUFRLFFBQVEsR0FBRyxNQUFNLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQUEsRUFDL0QsaUJBQUUsT0FBTyxFQUFFLE1BQU0saUJBQUUsUUFBUSxNQUFNLEVBQUUsQ0FBQztBQUN0QyxDQUFDO0FBTU0sSUFBTSxjQUFjO0FBQUEsRUFDekIsT0FBTyxXQUFXLFNBQVM7QUFDN0I7OztBQ25DTyxJQUFNLFlBQVksaUJBQUUsT0FBTztBQUFBLEVBQ2hDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsWUFBWTtBQUFBLEVBQzVCLE9BQU8saUJBQUUsT0FBTztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSWhCLFNBQVMsaUJBQUUsTUFBTSxVQUFVLEVBQUUsU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSXRDLFVBQVUsaUJBQUUsTUFBTSxVQUFVLEVBQUUsU0FBUztBQUFBO0FBQUEsRUFFdkMsR0FBRztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSUgsR0FBRztBQUNMLENBQUM7OztBQ3BCTSxJQUFNLGlCQUFpQixpQkFBRSxLQUFLLENBQUMsUUFBUSxXQUFXLFdBQVcsTUFBTSxDQUFDO0FBR3BFLElBQU0sZUFBZSxpQkFBRSxPQUFPO0FBQUEsRUFDbkMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxTQUFTO0FBQUEsRUFDekIsU0FBUztBQUFBLEVBQ1QsU0FBUyxpQkFBRSxNQUFNLFVBQVU7QUFDN0IsQ0FBQzs7O0FDSU0sSUFBTSxlQUFlLGlCQUFFLE9BQU87QUFBQSxFQUNuQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDZSxNQUFNLGlCQUFFLFFBQVEsU0FBUztBQUFBLEVBQ3pCLFFBQVEsaUJBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUztBQUFBLEVBQzdDLFNBQVMsaUJBQUUsTUFBTSxVQUFVO0FBQUEsRUFDM0IsVUFBVSxpQkFBRSxNQUFNLFVBQVUsRUFBRSxTQUFTO0FBQUEsRUFDdkMsUUFBUSxpQkFBRSxNQUFNLGlCQUFFLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzNFLENBQUM7OztBQ1NNLElBQU0sbUJBQW1CLGlCQUFFLE9BQU87QUFBQSxFQUN2QyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDbUIsTUFBTSxpQkFBRSxRQUFRLGVBQWU7QUFBQSxFQUMvQixRQUFRLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFBQSxFQUM3QyxTQUFTLGlCQUFFLE1BQU0saUJBQWlCO0FBQUEsRUFDbEMsVUFBVSxpQkFBRSxNQUFNLFVBQVUsRUFBRSxTQUFTO0FBQUEsRUFDdkMscUJBQXFCLGlCQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUM5QyxRQUFRLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQSxFQUN0QyxXQUFXLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxTQUFTO0FBQUE7QUFBQTtBQUFBLEVBR3RDLEdBQUc7QUFDNUMsQ0FBQzs7O0FDRk0sSUFBTSxXQUF1RCxpQkFBRTtBQUFBLEVBQUssTUFDM0UsaUJBQUUsT0FBTztBQUFBLElBQ0wsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLElBQ2YsU0FBUyxpQkFBRSxNQUFNLFVBQVU7QUFBQSxJQUMzQixVQUFVLGlCQUNULE1BQU0saUJBQUUsTUFBTSxDQUFDLGlCQUFpQixnQkFBZ0IsQ0FBQyxDQUFDLEVBQ2xELFNBQVM7QUFBQSxFQUNuQixDQUFDO0FBQ0Q7QUFFTyxJQUFNLGtCQUFrQixpQkFBRSxPQUFPO0FBQUEsRUFDcEMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ2dCLE1BQU0saUJBQUUsUUFBUSxhQUFhO0FBQUEsRUFDN0IsT0FBTyxpQkFBRSxNQUFNLFFBQVE7QUFDL0QsQ0FBQztBQUVNLElBQU0sbUJBQW1CLGlCQUFFLE9BQU87QUFBQSxFQUNyQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDaUIsTUFBTSxpQkFBRSxRQUFRLGNBQWM7QUFBQSxFQUM5QixPQUFPLGlCQUFFLE1BQU0sUUFBUTtBQUNoRSxDQUFDOzs7QUNUTSxJQUFNLG1CQUFtQixpQkFBRSxPQUFPO0FBQUEsRUFDdkMsTUFBTSxpQkFBRSxRQUFRLFlBQVk7QUFBQTtBQUFBO0FBQUEsRUFHNUIsZUFBZSxpQkFBRSxNQUFNLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxPQUFPLEdBQUcsaUJBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBO0FBQUE7QUFBQSxFQUcvRCxXQUFXLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQ2pELENBQUM7QUFrQk0sSUFBTSxzQkFBc0IsaUJBQUUsT0FBTztBQUFBLEVBQzFDLE1BQU0saUJBQUUsUUFBUSxlQUFlO0FBQUEsRUFDL0IsUUFBUSxpQkFBRSxNQUFNLGFBQWEsRUFBRSxJQUFJLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNcEMsU0FBUyxpQkFBRSxNQUFNLFlBQVksU0FBUyxDQUFDLEVBQUUsU0FBUztBQUNwRCxDQUFDO0FBV00sSUFBTSxlQUFlLGlCQUFFLE9BQU87QUFBQSxFQUNuQyxpQkFBaUIsaUJBQUUsTUFBTSxpQkFBRSxNQUFNLENBQUMsaUJBQUUsT0FBTyxHQUFHLGlCQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQTtBQUFBO0FBQUEsRUFHakUsWUFBWSxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsUUFBUSxHQUFHO0FBQ2xELENBQUM7QUFLTSxJQUFNLG9CQUFvQixpQkFBRSxPQUFPO0FBQUEsRUFDeEMsTUFBTSxpQkFBRSxRQUFRLGNBQWM7QUFBQSxFQUM5QixTQUFTLGlCQUFFLE1BQU0sWUFBWSxFQUFFLElBQUksQ0FBQztBQUN0QyxDQUFDO0FBU00sSUFBTSxpQkFBaUIsaUJBQUUsS0FBSyxDQUFDLFNBQVMsU0FBUyxRQUFRLE9BQU8sQ0FBQztBQUdqRSxJQUFNLG1CQUFtQixpQkFBRSxPQUFPO0FBQUEsRUFDdkMsVUFBVTtBQUFBO0FBQUEsRUFFVixRQUFRLGlCQUFFLFFBQVE7QUFBQSxFQUNsQixXQUFXO0FBQ2IsQ0FBQztBQUtNLElBQU0sd0JBQXdCLGlCQUFFLE9BQU87QUFBQSxFQUM1QyxNQUFNLGlCQUFFLFFBQVEsa0JBQWtCO0FBQUEsRUFDbEMsY0FBYyxpQkFBRSxNQUFNLGdCQUFnQixFQUFFLElBQUksQ0FBQztBQUMvQyxDQUFDO0FBZU0sSUFBTSxxQkFBcUIsaUJBQUUsT0FBTztBQUFBLEVBQ3pDLE1BQU0saUJBQUUsUUFBUSxTQUFTO0FBQUEsRUFDekIsV0FBVyxpQkFBRSxNQUFNLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN6QyxDQUFDO0FBWU0sSUFBTSxZQUFZLGlCQUFFLE9BQU87QUFBQTtBQUFBLEVBRWhDLE1BQU0saUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQztBQUFBO0FBQUE7QUFBQSxFQUd0QyxTQUFTLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxPQUFPLEdBQUcsaUJBQUUsT0FBTyxDQUFDLENBQUM7QUFBQSxFQUN6QyxXQUFXLGNBQWMsUUFBUSxRQUFRO0FBQUE7QUFBQTtBQUFBLEVBR3pDLFdBQVcsaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLElBQUk7QUFDbEQsQ0FBQztBQUdNLElBQU0saUJBQWlCLGlCQUFFLE9BQU87QUFBQSxFQUNyQyxNQUFNLGlCQUFFLFFBQVEsVUFBVTtBQUFBLEVBQzFCLE1BQU0saUJBQUUsTUFBTSxTQUFTLEVBQUUsSUFBSSxDQUFDO0FBQ2hDLENBQUM7QUFHTSxJQUFNLGdCQUFnQixpQkFBRSxPQUFPO0FBQUEsRUFDcEMsTUFBTSxpQkFBRSxNQUFNLENBQUMsaUJBQUUsT0FBTyxHQUFHLGlCQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQUEsRUFDdEMsSUFBSSxpQkFBRSxNQUFNLENBQUMsaUJBQUUsT0FBTyxHQUFHLGlCQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBR3BDLFdBQVcsaUJBQUUsTUFBTSxDQUFDLGVBQWUsYUFBYSxDQUFDLEVBQUUsUUFBUSxDQUFDLFVBQVUsUUFBUSxDQUFDO0FBQUEsRUFDL0UsV0FBVyxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsSUFBSTtBQUNsRCxDQUFDO0FBR00sSUFBTSxxQkFBcUIsaUJBQUUsT0FBTztBQUFBLEVBQ3pDLE1BQU0saUJBQUUsUUFBUSxjQUFjO0FBQUEsRUFDOUIsVUFBVSxpQkFBRSxNQUFNLGFBQWEsRUFBRSxJQUFJLENBQUM7QUFDeEMsQ0FBQztBQU9NLElBQU0sbUJBQW1CLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDM0Q7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBT00sSUFBTSx3QkFBd0IsaUJBQUUsT0FBTztBQUFBLEVBQzVDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsbUJBQW1CO0FBQUEsRUFDbkMsUUFBUSxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQUEsRUFDN0MsR0FBRztBQUFBLEVBQ0gsUUFBUSxpQkFBRSxNQUFNLFVBQVU7QUFBQSxFQUMxQixZQUFZO0FBQUEsRUFDWixhQUFhO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTWIsZUFBZSxpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUt4QyxpQkFBaUIsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSTFDLG1CQUFtQixpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTTVDLGlCQUFpQixpQkFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQVF6QyxpQkFBaUIsaUJBQUUsTUFBTSxpQkFBRSxPQUFPO0FBQUEsSUFDaEMsT0FBTyxpQkFBRSxPQUFPO0FBQUEsSUFDaEIsVUFBVSxpQkFBRSxNQUFNLFVBQVU7QUFBQSxFQUM5QixDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUFBLEVBQ2QsVUFBVSxpQkFBRSxNQUFNLFVBQVUsRUFBRSxTQUFTO0FBQUEsRUFDdkMscUJBQXFCLGlCQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUM5QyxRQUFRLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUl0QyxHQUFHO0FBQ0wsQ0FBQzs7O0FDN09NLElBQU0sY0FBYyxpQkFBRSxPQUFPO0FBQUEsRUFDbEMsS0FBSyxpQkFBRSxPQUFPLEVBQUUsSUFBSTtBQUFBLEVBQ3BCLEtBQUssaUJBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRTtBQUM1QixDQUFDO0FBUU0sSUFBTSxjQUFjLGlCQUFFLE9BQU87QUFBQSxFQUNsQyxNQUFNO0FBQUEsRUFDTixXQUFXLGlCQUFFLE1BQU0sUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFHTSxJQUFNLHVCQUF1QixpQkFBRSxPQUFPO0FBQUEsRUFDM0MsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBO0FBQUE7QUFBQSxFQUdwQixTQUFTLGlCQUFFLE1BQU0sVUFBVTtBQUFBLEVBQzNCLFNBQVMsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBO0FBQUE7QUFBQSxFQUdsQyxVQUFVLGlCQUFFLE1BQU0sVUFBVSxFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUl2QyxPQUFPLFlBQVksU0FBUztBQUFBLEVBQzVCLE9BQU8sWUFBWSxTQUFTO0FBQzlCLENBQUM7QUFHTSxJQUFNLHNCQUFzQixpQkFBRSxPQUFPO0FBQUEsRUFDMUMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxpQkFBaUI7QUFBQSxFQUNqQyxRQUFRLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFBQSxFQUM3QyxHQUFHO0FBQUE7QUFBQSxFQUVILFFBQVEsaUJBQUUsTUFBTSxVQUFVO0FBQUEsRUFDMUIsU0FBUyxpQkFBRSxNQUFNLG9CQUFvQixFQUFFLElBQUksQ0FBQztBQUFBO0FBQUE7QUFBQSxFQUc1QyxhQUFhLGlCQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU90QyxpQkFBaUIsaUJBQUUsUUFBUSxFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUEsRUFHdEMsVUFBVSxpQkFBRSxNQUFNLFVBQVUsRUFBRSxTQUFTO0FBQUEsRUFDdkMscUJBQXFCLGlCQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUM5QyxRQUFRLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUl0QyxXQUFXLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxTQUFTO0FBQ3hDLENBQUM7OztBQzVETSxJQUFNLGVBQWUsaUJBQUUsT0FBTztBQUFBLEVBQ25DLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQTtBQUFBO0FBQUEsRUFHcEIsU0FBUyxpQkFBRSxNQUFNLFVBQVU7QUFBQTtBQUFBO0FBQUEsRUFHM0IsT0FBTyxZQUFZLFNBQVM7QUFBQSxFQUM1QixPQUFPLFlBQVksU0FBUztBQUM5QixDQUFDO0FBR00sSUFBTSxpQkFBaUIsaUJBQUUsT0FBTztBQUFBLEVBQ3JDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixTQUFTLGlCQUFFLE1BQU0sVUFBVTtBQUFBLEVBQzNCLE9BQU8sWUFBWSxTQUFTO0FBQUEsRUFDNUIsT0FBTyxZQUFZLFNBQVM7QUFDOUIsQ0FBQztBQUdNLElBQU0sZ0JBQWdCLGlCQUFFLE9BQU87QUFBQSxFQUNwQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLFVBQVU7QUFBQSxFQUMxQixRQUFRLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFBQSxFQUM3QyxHQUFHO0FBQUE7QUFBQSxFQUVILFFBQVEsaUJBQUUsTUFBTSxVQUFVO0FBQUE7QUFBQSxFQUUxQixPQUFPLGlCQUFFLE1BQU0sWUFBWSxFQUFFLElBQUksQ0FBQztBQUFBO0FBQUE7QUFBQSxFQUdsQyxTQUFTLGlCQUFFLE1BQU0sY0FBYyxFQUFFLElBQUksQ0FBQztBQUFBO0FBQUE7QUFBQSxFQUd0QyxLQUFLLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDO0FBQUE7QUFBQTtBQUFBLEVBR2xELGtCQUFrQixpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUE7QUFBQSxFQUUzQyxVQUFVLGlCQUFFLE1BQU0sVUFBVSxFQUFFLFNBQVM7QUFBQSxFQUN2QyxxQkFBcUIsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQzlDLFFBQVEsaUJBQUUsTUFBTSxpQkFBRSxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUFBLEVBQ3RDLFdBQVcsaUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLFNBQVM7QUFDeEMsQ0FBQzs7O0FDeERNLElBQU0sZUFBZSxpQkFBRSxPQUFPO0FBQUEsRUFDbkMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBO0FBQUE7QUFBQSxFQUdwQixTQUFTLGlCQUFFLE1BQU0sVUFBVTtBQUM3QixDQUFDO0FBR00sSUFBTSxnQkFBZ0IsaUJBQUUsT0FBTztBQUFBLEVBQ3BDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsVUFBVTtBQUFBLEVBQzFCLFFBQVEsaUJBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUztBQUFBLEVBQzdDLEdBQUc7QUFBQTtBQUFBLEVBRUgsUUFBUSxpQkFBRSxNQUFNLFVBQVU7QUFBQTtBQUFBO0FBQUEsRUFHMUIsT0FBTyxpQkFBRSxNQUFNLFlBQVksRUFBRSxJQUFJLENBQUM7QUFBQTtBQUFBLEVBRWxDLFVBQVUsaUJBQUUsTUFBTSxVQUFVLEVBQUUsU0FBUztBQUFBLEVBQ3ZDLHFCQUFxQixpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUEsRUFDOUMsUUFBUSxpQkFBRSxNQUFNLGlCQUFFLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQUEsRUFDdEMsV0FBVyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsU0FBUztBQUN4QyxDQUFDOzs7QUNiTSxJQUFNLG1CQUFtQixpQkFBRSxPQUFPO0FBQUEsRUFDdkMsS0FBSyxpQkFBRSxPQUFPO0FBQUEsRUFDZCxLQUFLLGlCQUFFLE9BQU87QUFBQTtBQUFBLEVBRWQsVUFBVSxpQkFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQztBQUFBO0FBQUE7QUFBQSxFQUd6QyxtQkFBbUIsaUJBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJM0QsWUFBWSxpQkFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQ3RDLENBQUM7QUFPTSxJQUFNLDZCQUE2QixpQkFBRSxPQUFPO0FBQUEsRUFDakQsTUFBTSxpQkFBRSxRQUFRLFlBQVk7QUFBQTtBQUFBLEVBRTVCLGVBQWUsaUJBQUUsTUFBTSxpQkFBRSxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQTtBQUFBLEVBRXhDLFdBQVcsaUJBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEdBQUc7QUFDakQsQ0FBQztBQWFNLElBQU0scUJBQXFCLGlCQUFFLE9BQU87QUFBQSxFQUN6QyxLQUFLLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUEsRUFDekIsVUFBVSxjQUFjLFNBQVM7QUFBQSxFQUNqQyxLQUFLLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUEsRUFDekIsVUFBVSxjQUFjLFNBQVM7QUFDbkMsQ0FBQztBQUdNLElBQU0sZ0NBQWdDLGlCQUFFLE9BQU87QUFBQSxFQUNwRCxNQUFNLGlCQUFFLFFBQVEsZUFBZTtBQUFBLEVBQy9CLGlCQUFpQjtBQUFBO0FBQUEsRUFFakIsV0FBVyxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsR0FBRztBQUNqRCxDQUFDO0FBUU0sSUFBTSx3QkFBd0IsaUJBQUUsbUJBQW1CLFFBQVE7QUFBQSxFQUNoRTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBVU0sSUFBTSxrQkFBa0IsaUJBQUUsT0FBTztBQUFBLEVBQ3RDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsYUFBYTtBQUFBLEVBQzdCLFFBQVEsaUJBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUztBQUFBLEVBQzdDLEdBQUc7QUFBQSxFQUNILFFBQVEsaUJBQUUsTUFBTSxVQUFVO0FBQUEsRUFDMUIsUUFBUTtBQUFBLEVBQ1IsYUFBYTtBQUFBLEVBQ2IsVUFBVSxpQkFBRSxNQUFNLFVBQVUsRUFBRSxTQUFTO0FBQUEsRUFDdkMscUJBQXFCLGlCQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUM5QyxRQUFRLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQTtBQUFBO0FBQUEsRUFHdEMsR0FBRztBQUNMLENBQUM7OztBQ3pFTSxJQUFNLGlCQUFpQixpQkFBaUIsT0FBTztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSXBELFVBQVUsaUJBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJekMsY0FBYyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTO0FBQ3JELENBQUM7QUFLTSxJQUFNLGdCQUFnQixpQkFBRSxLQUFLLENBQUMsV0FBVyxhQUFhLFNBQVMsQ0FBQztBQVNoRSxJQUFNLDZCQUE2QixpQkFBRSxPQUFPO0FBQUEsRUFDakQsTUFBTSxpQkFBRSxRQUFRLFNBQVM7QUFBQSxFQUN6QixPQUFPO0FBQ1QsQ0FBQztBQVlNLElBQU0sNkJBQTZCLGlCQUFFLE9BQU87QUFBQSxFQUNqRCxNQUFNLGlCQUFFLFFBQVEsZUFBZTtBQUNqQyxDQUFDO0FBVU0sSUFBTSwrQkFBK0IsaUJBQUUsT0FBTztBQUFBLEVBQ25ELE1BQU0saUJBQUUsUUFBUSxpQkFBaUI7QUFDbkMsQ0FBQztBQVlNLElBQU0sNkJBQTZCLGlCQUFFLE9BQU87QUFBQSxFQUNqRCxNQUFNLGlCQUFFLFFBQVEsZUFBZTtBQUFBO0FBQUE7QUFBQSxFQUcvQixXQUFXLGlCQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxHQUFHO0FBQ2pELENBQUM7QUFRTSxJQUFNLHNCQUFzQixpQkFBRSxtQkFBbUIsUUFBUTtBQUFBLEVBQzlEO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQVdNLElBQU0sZ0JBQWdCLGlCQUFFLE9BQU87QUFBQSxFQUNwQyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLFdBQVc7QUFBQSxFQUMzQixRQUFRLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFBQSxFQUM3QyxHQUFHO0FBQUEsRUFDSCxRQUFRLGlCQUFFLE1BQU0sVUFBVTtBQUFBO0FBQUE7QUFBQSxFQUcxQixNQUFNLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsRUFDL0IsUUFBUTtBQUFBLEVBQ1IsYUFBYTtBQUFBLEVBQ2IsVUFBVSxpQkFBRSxNQUFNLFVBQVUsRUFBRSxTQUFTO0FBQUEsRUFDdkMscUJBQXFCLGlCQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUs7QUFBQSxFQUM5QyxRQUFRLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQTtBQUFBO0FBQUEsRUFHdEMsR0FBRztBQUNMLENBQUM7OztBQ3JJTSxJQUFNLDBCQUEwQixpQkFBRSxPQUFPO0FBQUEsRUFDOUMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxxQkFBcUI7QUFBQSxFQUNyQyxPQUFPLGlCQUFFLE9BQU87QUFBQSxFQUNoQixPQUFPLGlCQUFFLE1BQU0saUJBQUUsTUFBTSxVQUFVLENBQUM7QUFDcEMsQ0FBQzs7O0FDTU0sSUFBTSxxQkFBcUIsaUJBQUUsbUJBQW1CLFFBQVE7QUFBQSxFQUM3RDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQUdNLElBQU0scUJBQXFCLGlCQUFFLE9BQU87QUFBQSxFQUN6QyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLGdCQUFnQjtBQUFBLEVBQ2hDLE9BQU8saUJBQUUsT0FBTztBQUFBLEVBQ2hCLFNBQVMsaUJBQUUsTUFBTSxrQkFBa0I7QUFDckMsQ0FBQzs7O0FDUk0sSUFBTSwwQkFBMEIsaUJBQUUsbUJBQW1CLFFBQVE7QUFBQSxFQUNsRTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFHTSxJQUFNLDBCQUEwQixpQkFBRSxPQUFPO0FBQUEsRUFDOUMsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxzQkFBc0I7QUFBQSxFQUN0QyxPQUFPLGlCQUFFLE9BQU87QUFBQSxFQUNoQixTQUFTLGlCQUFFLE1BQU0sdUJBQXVCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTXhDLGdCQUFnQixpQkFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQzFDLENBQUM7OztBQ3RDTSxJQUFNLHVCQUF1QixpQkFBRSxPQUFPO0FBQUEsRUFDM0MsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3BCLE1BQU0saUJBQUUsUUFBUSxrQkFBa0I7QUFBQSxFQUNsQyxRQUFRLGlCQUFFLE1BQU0sVUFBVTtBQUFBLEVBQzFCLGFBQWEsaUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFDbkMsQ0FBQzs7O0FDSE0sSUFBTSxrQkFBa0IsaUJBQUUsT0FBTztBQUFBLEVBQ3RDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixPQUFPLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUM7QUFBQSxFQUN2QixXQUFXLGlCQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTztBQUFBLEVBQ3hDLGFBQWEsaUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFDbkMsQ0FBQztBQVVNLElBQU0sU0FBUyxpQkFBRSxPQUFPO0FBQUEsRUFDN0IsVUFBVSxpQkFBRSxNQUFNLGVBQWUsRUFBRSxJQUFJLENBQUM7QUFDMUMsQ0FBQztBQUdNLElBQU0sbUJBQW1CLGlCQUFFLE9BQU87QUFBQSxFQUN2QyxJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsTUFBTSxpQkFBRSxRQUFRLGNBQWM7QUFBQSxFQUM5QixRQUFRLGlCQUFFLE1BQU0sVUFBVTtBQUFBLEVBQzFCLGFBQWEsaUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQSxFQUNqQyxRQUFRLE9BQU8sU0FBUztBQUMxQixDQUFDO0FBR00sSUFBTSxnQkFBZ0IsaUJBQzFCLE9BQU87QUFBQSxFQUNOLEtBQUssaUJBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUztBQUFBLEVBQzFDLEtBQUssaUJBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUztBQUM1QyxDQUFDLEVBR0E7QUFBQSxFQUNDLENBQUMsTUFBTSxFQUFFLFFBQVEsVUFBYSxFQUFFLFFBQVEsVUFBYSxFQUFFLE9BQU8sRUFBRTtBQUFBLEVBQ2hFLEVBQUUsU0FBUyx1Q0FBa0M7QUFDL0M7QUFHSyxJQUFNLGFBQWEsaUJBQUUsT0FBTztBQUFBLEVBQ2pDLElBQUksaUJBQUUsT0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNwQixNQUFNLGlCQUFFLFFBQVEsT0FBTztBQUFBLEVBQ3ZCLFFBQVEsaUJBQUUsTUFBTSxVQUFVO0FBQUEsRUFDMUIsYUFBYSxpQkFBRSxPQUFPLEVBQUUsU0FBUztBQUFBLEVBQ2pDLGVBQWUsY0FBYyxTQUFTO0FBQUEsRUFDdEMsUUFBUSxPQUFPLFNBQVM7QUFDMUIsQ0FBQzs7O0FDMUNNLElBQU0sUUFBUSxpQkFBRSxtQkFBbUIsUUFBUTtBQUFBLEVBQ2hEO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQzs7O0FDZk0sSUFBTSxrQkFBa0IsaUJBQUUsS0FBSyxDQUFDLFdBQVcsTUFBTSxLQUFLLENBQUM7QUFHdkQsSUFBTSxTQUFTLGlCQUFFLE9BQU87QUFBQSxFQUM3QixJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUE7QUFBQSxFQUVwQixPQUFPLGlCQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUztBQUFBO0FBQUEsRUFFdEMsV0FBVyxpQkFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUkxQyxRQUFRLGlCQUFFLE1BQU0sS0FBSyxFQUFFLElBQUksQ0FBQztBQUM5QixDQUFDO0FBT00sSUFBTSxNQUFNLGlCQUFFLE9BQU87QUFBQSxFQUMxQixJQUFJLGlCQUFFLE9BQU8sRUFBRSxLQUFLO0FBQUEsRUFDcEIsU0FBUyxpQkFBRSxNQUFNLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxFQUNyQyxXQUFXLGdCQUFnQixRQUFRLFNBQVM7QUFDOUMsQ0FBQzs7O0FDOUJNLElBQU0sVUFBVSxpQkFBRSxPQUFPO0FBQUEsRUFDOUIsSUFBSSxpQkFBRSxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ1UsT0FBTyxpQkFBRSxPQUFPLEVBQUUsU0FBUztBQUFBLEVBQzNCLGNBQWMsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQ3ZDLE1BQU0saUJBQUUsTUFBTSxHQUFHO0FBQ2pELENBQUM7QUFxRU0sSUFBTSxjQUFjLGlCQUFFLE9BQU87QUFBQSxFQUNsQyxNQUFNLGlCQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFBQSxFQUNJLE1BQU0saUJBQUUsUUFBUSxFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQzlCLFFBQVEsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQ2pDLE9BQU8saUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQ2hDLE9BQU8saUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQ2hDLFFBQVEsaUJBQUUsTUFBTSxpQkFBRSxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMxRSxDQUFDO0FBcURNLElBQU0sY0FBYyxpQkFBRSxPQUFPO0FBQUEsRUFDbEMsV0FBVyxpQkFBRSxLQUFLLENBQUMsVUFBVSxJQUFJLENBQUMsRUFBRSxRQUFRLFFBQVE7QUFBQSxFQUNqQixTQUFTLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDakQsV0FBVyxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDdEMsVUFBVSxpQkFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRTtBQUFBLEVBQzFDLGdCQUFnQixpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsUUFBUSxDQUFDO0FBQUEsRUFDM0MsUUFBUSxpQkFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsUUFBUSxHQUFHO0FBQUEsRUFDckMsV0FBVyxpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUEsRUFDcEMscUJBQXFCLGlCQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFBQSxFQUM3Qyx5QkFBeUIsaUJBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSztBQUFBLEVBQ2xELFFBQVEsWUFBWSxRQUFRLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBMkJNLElBQU0sZUFBZSxpQkFBRSxLQUFLO0FBQUEsRUFDakM7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQUdNLElBQU0sYUFBYSxpQkFBRSxPQUFPO0FBQUEsRUFDakMsTUFBTSxhQUFhLFFBQVEsU0FBUztBQUFBLEVBQ0QsVUFBVSxpQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFO0FBQ3BGLENBQUM7QUFHTSxJQUFNLGVBQWUsaUJBQUUsT0FBTztBQUFBLEVBQ25DLE9BQU8saUJBQUUsT0FBTyxFQUFFLElBQUksQ0FBQztBQUFBLEVBQ1ksUUFBUSxpQkFBRSxPQUFPLEVBQUUsUUFBUSxZQUFZO0FBQUEsRUFDdkMsTUFBTSxpQkFBRSxPQUFPLEVBQUUsU0FBUztBQUFBLEVBQzFCLGdCQUFnQixpQkFBRSxLQUFLLENBQUMsVUFBVSxVQUFVLE1BQU0sQ0FBQyxFQUFFLFFBQVEsTUFBTTtBQUFBLEVBQ25FLGNBQWMsaUJBQUUsS0FBSyxDQUFDLFFBQVEsUUFBUSxDQUFDLEVBQUUsUUFBUSxNQUFNO0FBQUEsRUFDdkQsYUFBYSxpQkFBRSxLQUFLLENBQUMsUUFBUSxVQUFVLE9BQU8sQ0FBQyxFQUFFLFFBQVEsTUFBTTtBQUFBLEVBQy9ELGNBQWMsaUJBQUUsS0FBSyxDQUFDLGFBQWEsZUFBZSxXQUFXLFFBQVEsQ0FBQyxFQUFFLFFBQVEsV0FBVztBQUFBLEVBQzNGLGdCQUFnQixpQkFBRSxLQUFLLENBQUMsYUFBYSxVQUFVLENBQUMsRUFBRSxRQUFRLFVBQVU7QUFBQSxFQUNwRSxRQUFRLGlCQUFFLE1BQU0saUJBQUUsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQSxFQUN0QyxPQUFPLFlBQVksUUFBUSxDQUFDLENBQUM7QUFBQSxFQUM3QixZQUFZLFdBQVcsU0FBUztBQUNyRSxDQUFDO0FBcUJNLElBQU0saUJBQWlCLGlCQUFFLE9BQU87QUFBQSxFQUNyQyxPQUFPLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUEsRUFDVSxRQUFRLGlCQUFFLE1BQU0sS0FBSztBQUM1RCxDQUFDO0FBK0JNLElBQU0sa0JBQWtCLGlCQUFFLEtBQUs7QUFBQSxFQUNwQztBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFHTSxJQUFNLHlCQUF5QixpQkFBRSxPQUFPO0FBQUEsRUFDN0MsTUFBTSxpQkFBRSxLQUFLLENBQUMsY0FBYyxVQUFVLENBQUMsRUFBRSxRQUFRLFlBQVk7QUFBQSxFQUM3RCxXQUFXLGlCQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFBQSxFQUNuQyxhQUFhLGlCQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUlyQyxtQkFBbUIsaUJBQUUsUUFBUSxFQUFFLFFBQVEsSUFBSTtBQUFBLEVBQzNDLHlCQUF5QixpQkFDdEIsTUFBTSxlQUFlLEVBQ3JCLFFBQVEsQ0FBQyxVQUFVLGFBQWEsZUFBZSxhQUFhLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUloRSxnQkFBZ0IsaUJBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxTQUFTO0FBQzNELENBQUM7QUFHTSxJQUFNLGlCQUFpQixpQkFBRSxPQUFPO0FBQUEsRUFDckMsU0FBUyxpQkFBRSxRQUFRLEVBQUUsUUFBUSxLQUFLO0FBQUEsRUFDbEMsY0FBYyx1QkFBdUIsUUFBUSxDQUFDLENBQUM7QUFDakQsQ0FBQztBQWVNLElBQU0sbUJBQ1gsaUJBQUUsT0FBTztBQUFBLEVBQ1AsZUFBZSxpQkFBRSxRQUFRLENBQUM7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixVQUFVLGlCQUFFLE1BQU0sT0FBTztBQUFBLEVBQ3pCLGdCQUFnQixlQUFlLFNBQVM7QUFBQSxFQUN4QyxZQUFZLGVBQWUsU0FBUztBQUN0QyxDQUFDOzs7QUMxVEksSUFBTSwwQkFBMEI7QUFLaEMsSUFBTSxlQUFOLGNBQTJCLE1BQU07QUFBQSxFQUN0QyxZQUNFLFNBRVMsZUFDVDtBQUNBLFVBQU0sT0FBTztBQUZKO0FBR1QsU0FBSyxPQUFPO0FBQUEsRUFDZDtBQUNGO0FBWUEsSUFBTSxXQUFtQyxDQUFDO0FBZ0JuQyxTQUFTLHdCQUF3QixLQUE2QjtBQUNuRSxNQUFJLFFBQVEsUUFBUSxPQUFPLFFBQVEsWUFBWSxNQUFNLFFBQVEsR0FBRyxHQUFHO0FBQ2pFLFVBQU0sSUFBSSxhQUFhLGlDQUFpQztBQUFBLEVBQzFEO0FBQ0EsUUFBTSxTQUFTO0FBQ2YsUUFBTSxVQUFVLE9BQU87QUFDdkIsTUFBSSxPQUFPLFlBQVksWUFBWSxDQUFDLE9BQU8sVUFBVSxPQUFPLEdBQUc7QUFDN0QsVUFBTSxJQUFJLGFBQWEsNkNBQTZDO0FBQUEsRUFDdEU7QUFDQSxNQUFJLFVBQVUseUJBQXlCO0FBRXJDLFVBQU0sSUFBSTtBQUFBLE1BQ1Isd0JBQXdCLE9BQU8sK0JBQzFCLHVCQUF1QjtBQUFBLE1BQzVCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxNQUFJLFVBQVU7QUFDZCxNQUFJLEtBQUs7QUFDVCxTQUFPLEtBQUsseUJBQXlCO0FBQ25DLFVBQU0sT0FBTyxTQUFTLEtBQUssQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFO0FBQy9DLFFBQUksQ0FBQyxNQUFNO0FBRVQsWUFBTSxJQUFJO0FBQUEsUUFDUixzQ0FBc0MsRUFBRTtBQUFBLFFBQ3hDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFDQSxjQUFVLEtBQUssSUFBSSxPQUFPO0FBQzFCLFVBQU07QUFBQSxFQUNSO0FBRUEsUUFBTSxTQUFTLGlCQUFpQixVQUFVLE9BQU87QUFDakQsTUFBSSxDQUFDLE9BQU8sU0FBUztBQUNuQixVQUFNLElBQUk7QUFBQSxNQUNSLDhDQUE4QyxFQUFFLE9BQzlDLE9BQU8sTUFBTSxPQUNWLE1BQU0sR0FBRyxDQUFDLEVBQ1YsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLEtBQUssS0FBSyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUM5QyxLQUFLLElBQUk7QUFBQSxNQUNkO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDQSxTQUFPLEVBQUUsS0FBSyxPQUFPLE1BQU0sbUJBQW1CLFFBQVE7QUFDeEQ7OztBQzlCTyxJQUFNLGtCQUFrQixpQkFBRSxLQUFLLENBQUMsVUFBVSxZQUFZLFNBQVMsQ0FBQztBQVNoRSxJQUFNLGdCQUFnQixpQkFBRSxPQUFPO0FBQUEsRUFDcEMsUUFBUSxpQkFBRSxPQUFPO0FBQUEsRUFDbUIsU0FBUyxpQkFBRSxRQUFRO0FBQUEsRUFDbkIsWUFBWSxnQkFBZ0IsU0FBUztBQUMzRSxDQUFDO0FBV00sSUFBTSxnQkFBZ0IsaUJBQUUsT0FBTztBQUFBLEVBQ3BDLE1BQU0saUJBQUUsUUFBUSxZQUFZO0FBQUE7QUFBQTtBQUFBLEVBRzVCLGVBQWUsaUJBQUUsTUFBTSxpQkFBRSxNQUFNLENBQUMsaUJBQUUsT0FBTyxHQUFHLGlCQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFBQSxFQUN4RCxTQUFTLGlCQUFFLFFBQVE7QUFBQSxFQUNuQixZQUFZLGdCQUFnQixTQUFTO0FBQ3ZDLENBQUM7QUFPTSxJQUFNLG1CQUFtQixpQkFBRSxPQUFPO0FBQUEsRUFDdkMsTUFBTSxpQkFBRSxRQUFRLGVBQWU7QUFBQSxFQUMvQixlQUFlLGlCQUFFLE1BQU0saUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQUEsRUFDeEQsU0FBUyxpQkFBRSxRQUFRO0FBQUEsRUFDbkIsWUFBWSxnQkFBZ0IsU0FBUztBQUN2QyxDQUFDO0FBSU0sSUFBTSxpQkFBaUIsaUJBQUUsT0FBTztBQUFBLEVBQ3JDLE1BQU0saUJBQUUsUUFBUSxjQUFjO0FBQUEsRUFDOUIsZUFBZSxpQkFBRSxNQUFNLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxPQUFPLEdBQUcsaUJBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUFBLEVBQ3hELFNBQVMsaUJBQUUsUUFBUTtBQUFBLEVBQ25CLFlBQVksZ0JBQWdCLFNBQVM7QUFDdkMsQ0FBQztBQUtNLElBQU0scUJBQXFCLGlCQUFFLE9BQU87QUFBQSxFQUN6QyxNQUFNLGlCQUFFLFFBQVEsa0JBQWtCO0FBQUEsRUFDbEMsZUFBZSxpQkFBRSxNQUFNLGlCQUFFLE1BQU0sQ0FBQyxpQkFBRSxPQUFPLEdBQUcsaUJBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUFBLEVBQ3hELFFBQVEsaUJBQUUsUUFBUTtBQUFBLEVBQ2xCLE1BQU0saUJBQUUsS0FBSyxDQUFDLFNBQVMsU0FBUyxRQUFRLE9BQU8sQ0FBQztBQUFBLEVBQ2hELFNBQVMsaUJBQUUsUUFBUTtBQUFBLEVBQ25CLFlBQVksZ0JBQWdCLFNBQVM7QUFDdkMsQ0FBQztBQVFNLElBQU0sY0FBYyxpQkFBRSxPQUFPO0FBQUEsRUFDbEMsTUFBTSxpQkFBRSxRQUFRLFVBQVU7QUFBQSxFQUMxQixlQUFlLGlCQUFFLE1BQU0saUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJeEQsT0FBTyxpQkFBRSxLQUFLLENBQUMsZ0JBQWdCLGdCQUFnQixTQUFTLENBQUMsRUFBRSxTQUFTO0FBQUEsRUFDcEUsV0FBVyxpQkFBRSxLQUFLLENBQUMsUUFBUSxRQUFRLENBQUM7QUFBQSxFQUNwQyxTQUFTLGlCQUFFLFFBQVE7QUFBQSxFQUNuQixZQUFZLGdCQUFnQixTQUFTO0FBQ3ZDLENBQUM7QUFHTSxJQUFNLGtCQUFrQixpQkFBRSxPQUFPO0FBQUEsRUFDdEMsTUFBTSxpQkFBRSxRQUFRLGNBQWM7QUFBQSxFQUM5QixlQUFlLGlCQUFFLE1BQU0saUJBQUUsTUFBTSxDQUFDLGlCQUFFLE9BQU8sR0FBRyxpQkFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQUEsRUFDeEQsT0FBTyxpQkFBRSxLQUFLLENBQUMsZ0JBQWdCLGdCQUFnQixTQUFTLENBQUMsRUFBRSxTQUFTO0FBQUEsRUFDcEUsV0FBVyxpQkFBRSxNQUFNLENBQUMsaUJBQUUsS0FBSyxDQUFDLFFBQVEsUUFBUSxDQUFDLEdBQUcsaUJBQUUsS0FBSyxDQUFDLFFBQVEsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUFBLEVBQzNFLFNBQVMsaUJBQUUsUUFBUTtBQUFBLEVBQ25CLFlBQVksZ0JBQWdCLFNBQVM7QUFDdkMsQ0FBQztBQWlCTSxJQUFNLDJCQUEyQixpQkFBRSxPQUFPO0FBQUEsRUFDL0MsTUFBTSxpQkFBRSxRQUFRLHlCQUF5QjtBQUFBO0FBQUE7QUFBQSxFQUd6QyxPQUFPLGlCQUFFLE1BQU0sa0JBQWtCLEVBQUUsSUFBSSxDQUFDO0FBQUEsRUFDeEMsU0FBUyxpQkFBRSxRQUFRO0FBQUEsRUFDbkIsWUFBWSxnQkFBZ0IsU0FBUztBQUN2QyxDQUFDO0FBWU0sSUFBTSx5QkFBeUIsaUJBQUUsT0FBTztBQUFBLEVBQzdDLE1BQU0saUJBQUUsUUFBUSxzQkFBc0I7QUFBQTtBQUFBO0FBQUEsRUFHdEMsT0FBTyxpQkFBRSxNQUFNLGdCQUFnQixFQUFFLElBQUksQ0FBQztBQUFBLEVBQ3RDLFNBQVMsaUJBQUUsUUFBUTtBQUFBLEVBQ25CLFlBQVksZ0JBQWdCLFNBQVM7QUFDdkMsQ0FBQztBQUdNLElBQU0sZ0JBQWdCLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDeEQ7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBUUQsSUFBTSxXQUFXO0FBQUEsRUFDZixZQUFZLGlCQUFFLFFBQVEsRUFBRSxTQUFTO0FBQUEsRUFDakMsUUFBUSxpQkFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFNBQVM7QUFBQSxFQUMxQyxPQUFPLGlCQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUztBQUFBO0FBQUE7QUFBQSxFQUd0QyxRQUFRLGlCQUNMLE9BQU87QUFBQSxJQUNOLE1BQU0saUJBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQSxJQUMxQixVQUFVLGlCQUFFLEtBQUssQ0FBQyxRQUFRLFFBQVEsQ0FBQyxFQUFFLFNBQVM7QUFBQSxJQUM5QyxNQUFNLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUEsSUFDMUIsVUFBVSxpQkFBRSxLQUFLLENBQUMsUUFBUSxRQUFRLENBQUMsRUFBRSxTQUFTO0FBQUEsRUFDaEQsQ0FBQyxFQUNBLFNBQVM7QUFDZDtBQUNPLElBQU0sa0JBQWtCLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDMUQsY0FBYyxPQUFPLFFBQVE7QUFBQSxFQUM3QixpQkFBaUIsT0FBTyxRQUFRO0FBQUEsRUFDaEMsZUFBZSxPQUFPLFFBQVE7QUFBQSxFQUM5QixtQkFBbUIsT0FBTyxRQUFRO0FBQUEsRUFDbEMsWUFBWSxPQUFPLFFBQVE7QUFBQSxFQUMzQixnQkFBZ0IsT0FBTyxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJL0IseUJBQXlCLE9BQU8sUUFBUTtBQUFBLEVBQ3hDLHVCQUF1QixPQUFPLFFBQVE7QUFDeEMsQ0FBQztBQU9NLElBQU0sbUJBQW1CLGlCQUFFLE9BQU87QUFBQSxFQUN2QyxXQUFXLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUE7QUFBQSxFQUNRLE9BQU8saUJBQUUsT0FBTyxFQUFFLFlBQVk7QUFBQTtBQUFBLEVBQzlCLE9BQU8saUJBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTO0FBQzFFLENBQUM7QUEwQkQsSUFBTSxlQUFlLGlCQUNsQixPQUFPLEVBQ1A7QUFBQSxFQUNDLENBQUMsTUFDQyxrRUFBa0UsS0FBSyxDQUFDLEtBQ3hFLG1CQUFtQixLQUFLLENBQUM7QUFBQSxFQUMzQixFQUFFLFNBQVMsd0RBQXdEO0FBQ3JFO0FBS0ssSUFBTSx3QkFBd0IsaUJBQUUsT0FBTztBQUFBLEVBQzVDLGVBQWUsaUJBQUUsUUFBUSxDQUFDO0FBQUEsRUFDa0IsUUFBUSxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsaUJBQUUsT0FBTztBQUFBLElBQzNDLFFBQVEsaUJBQUUsT0FBTztBQUFBLElBQzBCLFNBQVMsaUJBQUUsUUFBUTtBQUFBLEVBQ2hFLENBQUMsQ0FBQztBQUNoRCxDQUFDO0FBTU0sSUFBTSx3QkFBd0IsaUJBQUUsT0FBTztBQUFBLEVBQzVDLGVBQWUsaUJBQUUsUUFBUSxDQUFDO0FBQUEsRUFDa0IsUUFBUSxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsYUFBYTtBQUFBLEVBQ2pELG1CQUFtQixpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsZ0JBQWdCLEVBQUUsU0FBUztBQUN4SCxDQUFDO0FBT00sSUFBTSx3QkFBd0IsaUJBQUUsT0FBTztBQUFBLEVBQzVDLGVBQWUsaUJBQUUsUUFBUSxDQUFDO0FBQUEsRUFDMUIsUUFBUSxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsYUFBYTtBQUFBLEVBQ2pELG1CQUFtQixpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsZ0JBQWdCLEVBQUUsU0FBUztBQUFBLEVBQzFFLGdCQUFnQixpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsYUFBYSxFQUFFLFNBQVM7QUFDdEUsQ0FBQztBQU9NLElBQU0sd0JBQXdCLGlCQUFFLE9BQU87QUFBQSxFQUM1QyxlQUFlLGlCQUFFLFFBQVEsQ0FBQztBQUFBLEVBQzFCLFFBQVEsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGFBQWE7QUFBQSxFQUNqRCxtQkFBbUIsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGdCQUFnQixFQUFFLFNBQVM7QUFBQSxFQUMxRSxnQkFBZ0IsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGVBQWUsRUFBRSxTQUFTO0FBQ3hFLENBQUM7QUFXTSxJQUFNLGlCQUFpQixpQkFBRSxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJckMsVUFBVSxpQkFBRSxNQUFNLGlCQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxFQUMxQyxTQUFTLGlCQUFFLFFBQVE7QUFBQSxFQUNuQixZQUFZLGdCQUFnQixTQUFTO0FBQ3ZDLENBQUM7QUFPTSxJQUFNLHdCQUF3QixpQkFBRSxPQUFPO0FBQUEsRUFDNUMsZUFBZSxpQkFBRSxRQUFRLENBQUM7QUFBQSxFQUMxQixRQUFRLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxhQUFhO0FBQUEsRUFDakQsbUJBQW1CLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxnQkFBZ0IsRUFBRSxTQUFTO0FBQUEsRUFDMUUsZ0JBQWdCLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxlQUFlLEVBQUUsU0FBUztBQUFBLEVBQ3RFLFNBQVMsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGNBQWMsRUFBRSxTQUFTO0FBQ2hFLENBQUM7QUFTTSxJQUFNLGdCQUFnQixpQkFBRSxPQUFPO0FBQUE7QUFBQTtBQUFBLEVBR3BDLE9BQU8saUJBQ0osT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGlCQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFDM0MsT0FBTyxDQUFDLFVBQVUsT0FBTyxLQUFLLEtBQUssRUFBRSxTQUFTLEdBQUc7QUFBQSxJQUNoRCxTQUFTO0FBQUEsRUFDWCxDQUFDO0FBQUEsRUFDSCxTQUFTLGlCQUFFLFFBQVE7QUFBQSxFQUNuQixRQUFRLGlCQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsWUFBWTtBQUFBLEVBQ3JDLE9BQU8saUJBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTO0FBQUEsRUFDakMsWUFBWSxnQkFBZ0IsU0FBUztBQUN2QyxDQUFDO0FBUU0sSUFBTSxnQkFBZ0IsaUJBQUUsT0FBTztBQUFBLEVBQ3BDLE9BQU8saUJBQUUsTUFBTSxpQkFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsRUFDdkMsU0FBUyxpQkFBRSxRQUFRO0FBQUEsRUFDbkIsWUFBWSxnQkFBZ0IsU0FBUztBQUN2QyxDQUFDO0FBUU0sSUFBTSwwQkFBMEIsaUJBQUUsT0FBTztBQUFBLEVBQzlDLE1BQU0saUJBQUUsUUFBUSxZQUFZO0FBQUE7QUFBQTtBQUFBLEVBRzVCLGVBQWUsaUJBQUUsTUFBTSxpQkFBRSxPQUFPLENBQUM7QUFBQSxFQUNqQyxTQUFTLGlCQUFFLFFBQVE7QUFBQSxFQUNuQixZQUFZLGdCQUFnQixTQUFTO0FBQ3ZDLENBQUM7QUFNTSxJQUFNLDZCQUE2QixpQkFBRSxPQUFPO0FBQUEsRUFDakQsTUFBTSxpQkFBRSxRQUFRLGVBQWU7QUFBQSxFQUMvQixLQUFLLGlCQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUEsRUFDekIsVUFBVSxpQkFBRSxLQUFLLENBQUMsUUFBUSxRQUFRLENBQUMsRUFBRSxTQUFTO0FBQUEsRUFDOUMsS0FBSyxpQkFBRSxPQUFPLEVBQUUsU0FBUztBQUFBLEVBQ3pCLFVBQVUsaUJBQUUsS0FBSyxDQUFDLFFBQVEsUUFBUSxDQUFDLEVBQUUsU0FBUztBQUFBLEVBQzlDLFNBQVMsaUJBQUUsUUFBUTtBQUFBLEVBQ25CLFlBQVksZ0JBQWdCLFNBQVM7QUFDdkMsQ0FBQztBQUtNLElBQU0scUJBQXFCLGlCQUFFLG1CQUFtQixRQUFRO0FBQUEsRUFDN0Q7QUFBQSxFQUNBO0FBQ0YsQ0FBQztBQVVNLElBQU0sMEJBQTBCLGlCQUFFLE9BQU87QUFBQSxFQUM5QyxNQUFNLGlCQUFFLFFBQVEsZUFBZTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSS9CLGVBQWUsaUJBQUUsTUFBTSxpQkFBRSxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxFQUN4QyxTQUFTLGlCQUFFLFFBQVE7QUFBQSxFQUNuQixZQUFZLGdCQUFnQixTQUFTO0FBQ3ZDLENBQUM7QUFLTSxJQUFNLDRCQUE0QixpQkFBRSxPQUFPO0FBQUEsRUFDaEQsTUFBTSxpQkFBRSxRQUFRLGlCQUFpQjtBQUFBLEVBQ2pDLGFBQWEsaUJBQUUsTUFBTSxpQkFBRSxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxFQUN0QyxTQUFTLGlCQUFFLFFBQVE7QUFBQSxFQUNuQixZQUFZLGdCQUFnQixTQUFTO0FBQ3ZDLENBQUM7QUFNTSxJQUFNLDBCQUEwQixpQkFBRSxPQUFPO0FBQUEsRUFDOUMsTUFBTSxpQkFBRSxRQUFRLGVBQWU7QUFBQSxFQUMvQixhQUFhLGlCQUFFLE9BQU87QUFBQSxJQUNwQixLQUFLLGlCQUFFLE9BQU87QUFBQSxJQUNkLElBQUksaUJBQUUsT0FBTztBQUFBLElBQ2IsUUFBUSxpQkFBRSxPQUFPO0FBQUEsSUFDakIsSUFBSSxpQkFBRSxPQUFPO0FBQUEsSUFDYixLQUFLLGlCQUFFLE9BQU87QUFBQSxFQUNoQixDQUFDO0FBQUEsRUFDRCxTQUFTLGlCQUFFLFFBQVE7QUFBQSxFQUNuQixZQUFZLGdCQUFnQixTQUFTO0FBQ3ZDLENBQUM7QUFRTSxJQUFNLG1CQUFtQixpQkFBRSxtQkFBbUIsUUFBUTtBQUFBLEVBQzNEO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBT00sSUFBTSx3QkFBd0IsaUJBQUUsT0FBTztBQUFBLEVBQzVDLGVBQWUsaUJBQUUsUUFBUSxDQUFDO0FBQUEsRUFDMUIsUUFBUSxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsYUFBYTtBQUFBLEVBQ2pELG1CQUFtQixpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsZ0JBQWdCLEVBQUUsU0FBUztBQUFBLEVBQzFFLGdCQUFnQixpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsZUFBZSxFQUFFLFNBQVM7QUFBQSxFQUN0RSxTQUFTLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxjQUFjLEVBQUUsU0FBUztBQUFBLEVBQzlELFNBQVMsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGFBQWEsRUFBRSxTQUFTO0FBQUEsRUFDN0QsV0FBVyxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsYUFBYSxFQUFFLFNBQVM7QUFDakUsQ0FBQztBQU9NLElBQU0sd0JBQXdCLGlCQUFFLE9BQU87QUFBQSxFQUM1QyxlQUFlLGlCQUFFLFFBQVEsQ0FBQztBQUFBLEVBQzFCLFFBQVEsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGFBQWE7QUFBQSxFQUNqRCxtQkFBbUIsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGdCQUFnQixFQUFFLFNBQVM7QUFBQSxFQUMxRSxnQkFBZ0IsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGVBQWUsRUFBRSxTQUFTO0FBQUEsRUFDdEUsU0FBUyxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsY0FBYyxFQUFFLFNBQVM7QUFBQSxFQUM5RCxTQUFTLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxhQUFhLEVBQUUsU0FBUztBQUFBLEVBQzdELFdBQVcsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGFBQWEsRUFBRSxTQUFTO0FBQUEsRUFDL0QscUJBQXFCLGlCQUNsQixPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsa0JBQWtCLEVBQzVDLFNBQVM7QUFDZCxDQUFDO0FBVU0sSUFBTSxlQUFlLGlCQUFFLE9BQU87QUFBQSxFQUNuQyxNQUFNLGlCQUFFLE9BQU8sRUFBRSxJQUFJLENBQUM7QUFDeEIsQ0FBQztBQU9NLElBQU0sd0JBQXdCLGlCQUFFLE9BQU87QUFBQSxFQUM1QyxlQUFlLGlCQUFFLFFBQVEsQ0FBQztBQUFBLEVBQzFCLFFBQVEsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGFBQWE7QUFBQSxFQUNqRCxtQkFBbUIsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGdCQUFnQixFQUFFLFNBQVM7QUFBQSxFQUMxRSxnQkFBZ0IsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGVBQWUsRUFBRSxTQUFTO0FBQUEsRUFDdEUsU0FBUyxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsY0FBYyxFQUFFLFNBQVM7QUFBQSxFQUM5RCxTQUFTLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxhQUFhLEVBQUUsU0FBUztBQUFBLEVBQzdELFdBQVcsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGFBQWEsRUFBRSxTQUFTO0FBQUEsRUFDL0QscUJBQXFCLGlCQUNsQixPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsa0JBQWtCLEVBQzVDLFNBQVM7QUFBQSxFQUNaLG1CQUFtQixpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsZ0JBQWdCLEVBQUUsU0FBUztBQUM1RSxDQUFDO0FBUU0sSUFBTSxzQkFBc0IsaUJBQUUsT0FBTztBQUFBLEVBQzFDLGVBQWUsaUJBQUUsUUFBUSxDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUsxQixRQUFRLGlCQUFFLE9BQU8sY0FBYyxhQUFhO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJNUMsbUJBQW1CLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxnQkFBZ0IsRUFBRSxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUsxRSxnQkFBZ0IsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGVBQWUsRUFBRSxTQUFTO0FBQUE7QUFBQTtBQUFBLEVBR3RFLFNBQVMsaUJBQUUsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGNBQWMsRUFBRSxTQUFTO0FBQUE7QUFBQSxFQUU5RCxTQUFTLGlCQUFFLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxhQUFhLEVBQUUsU0FBUztBQUFBO0FBQUEsRUFFN0QsV0FBVyxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsYUFBYSxFQUFFLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSy9ELHFCQUFxQixpQkFDbEIsT0FBTyxpQkFBRSxPQUFPLEVBQUUsS0FBSyxHQUFHLGtCQUFrQixFQUM1QyxTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJWixtQkFBbUIsaUJBQ2hCLE9BQU8saUJBQUUsT0FBTyxFQUFFLEtBQUssR0FBRyxnQkFBZ0IsRUFDMUMsU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBLEVBSVosZUFBZSxpQkFBRSxPQUFPLGlCQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsWUFBWSxFQUFFLFNBQVM7QUFDcEUsQ0FBQzs7O0FDamtCTSxJQUFNLHNCQUFzQjtBQUFBLEVBQ2pDO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGO0FBU08sSUFBTSw0QkFBNEI7QUFBQSxFQUN2QztBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGO0FBRU8sSUFBTSxnQkFBK0I7QUFBQSxFQUMxQyxXQUFXO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUU7QUFBQSxJQUN0QixPQUFPLEVBQUUsYUFBYSxRQUFRLFdBQVcsUUFBUTtBQUFBLEVBQ25EO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUU7QUFBQSxJQUN0QixPQUFPLEVBQUUsYUFBYSxRQUFRLFdBQVcsU0FBUyxjQUFjLEtBQUs7QUFBQSxFQUN2RTtBQUFBLEVBRUEsWUFBWTtBQUFBLElBQ1YsTUFBTTtBQUFBO0FBQUE7QUFBQSxJQUdOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEdBQUcsb0JBQW9CLEtBQUs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSzFELE9BQU8sRUFBRSxhQUFhLFNBQVMsV0FBVyxtQkFBbUI7QUFBQSxJQUM3RCxNQUFNO0FBQUEsTUFDSixPQUNFO0FBQUEsSUFHSjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE9BQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUFBLElBQ3RCLE9BQU8sRUFBRSxhQUFhLFFBQVEsV0FBVyxTQUFTO0FBQUEsRUFDcEQ7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUFBLElBQ3RCLE9BQU8sRUFBRSxhQUFhLFFBQVEsV0FBVyxxQkFBcUI7QUFBQSxFQUNoRTtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSU4sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUU7QUFBQSxJQUNoQyxPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsUUFBUTtBQUFBLEVBQ3BEO0FBQUEsRUFFQSxlQUFlO0FBQUEsSUFDYixNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVUsR0FBRyxvQkFBb0IsS0FBSztBQUFBLElBQzFELE9BQU8sRUFBRSxhQUFhLFNBQVMsV0FBVyxtQkFBbUI7QUFBQSxJQUM3RCxNQUFNO0FBQUEsTUFDSixPQUNFO0FBQUEsSUFJSjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLGFBQWE7QUFBQSxJQUNYLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUFBLElBQ3RCLE9BQU8sRUFBRSxhQUFhLFFBQVEsV0FBVyxRQUFRO0FBQUEsRUFDbkQ7QUFBQSxFQUVBLGNBQWM7QUFBQSxJQUNaLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUFBLElBQ3RCLE9BQU8sRUFBRSxhQUFhLFFBQVEsV0FBVyxRQUFRO0FBQUEsRUFDbkQ7QUFBQSxFQUVBLG1CQUFtQjtBQUFBLElBQ2pCLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFVBQVU7QUFBQTtBQUFBO0FBQUEsTUFHUixxQkFBcUI7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUlyQixPQUFPO0FBQUEsUUFDTDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsYUFBYTtBQUFBLElBQ3ZELE1BQU07QUFBQSxNQUNKLE9BQ0U7QUFBQSxJQUlKO0FBQUEsRUFDRjtBQUFBLEVBRUEsaUJBQWlCO0FBQUEsSUFDZixNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVO0FBQUE7QUFBQSxNQUVSLE9BQU8sQ0FBQyxxQkFBcUIsc0JBQXNCLFVBQVU7QUFBQSxJQUMvRDtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsYUFBYTtBQUFBLE1BQ2IsV0FBVztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLWCxVQUFVLENBQUMsU0FBUztBQUFBLE1BQ3BCLGlCQUFpQjtBQUFBLElBQ25CO0FBQUEsSUFDQSxNQUFNO0FBQUEsTUFDSixPQUNFO0FBQUEsSUFHSjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLFVBQVU7QUFBQSxJQUNSLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsT0FBTyxVQUFVLEVBQUU7QUFBQSxJQUN2QyxPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsY0FBYztBQUFBLElBQ3hELE1BQU07QUFBQSxNQUNKLE9BQ0U7QUFBQSxJQUlKO0FBQUEsRUFDRjtBQUFBLEVBRUEsVUFBVTtBQUFBLElBQ1IsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVTtBQUFBLE1BQ1IsT0FBTyxDQUFDLFVBQVU7QUFBQTtBQUFBO0FBQUEsTUFHbEIsZUFBZSxDQUFDLE9BQU87QUFBQSxJQUN6QjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsYUFBYTtBQUFBLE1BQ2IsV0FBVztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLWCxVQUFVLENBQUMsT0FBTztBQUFBLElBQ3BCO0FBQUEsSUFDQSxNQUFNO0FBQUEsTUFDSixPQUNFO0FBQUEsSUFHSjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLGFBQWE7QUFBQSxJQUNYLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsQ0FBQyxjQUFjLGVBQWU7QUFBQSxJQUN4QyxVQUFVO0FBQUE7QUFBQTtBQUFBLE1BR1IscUJBQXFCO0FBQUEsTUFDckIsT0FBTztBQUFBLFFBQ0w7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTyxFQUFFLGFBQWEsU0FBUyxXQUFXLGFBQWE7QUFBQSxJQUN2RCxNQUFNO0FBQUEsTUFDSixPQUNFO0FBQUEsSUFHSjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLFdBQVc7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLENBQUMsV0FBVyxpQkFBaUIsbUJBQW1CLGVBQWU7QUFBQSxJQUN6RSxVQUFVO0FBQUE7QUFBQTtBQUFBLE1BR1IscUJBQXFCO0FBQUEsTUFDckIsT0FBTyxDQUFDLFlBQVksdUJBQXVCO0FBQUEsTUFDM0MscUJBQ0U7QUFBQSxJQUlKO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJQSxPQUFPLEVBQUUsYUFBYSxTQUFTLFdBQVcsYUFBYTtBQUFBLElBQ3ZELE1BQU07QUFBQSxNQUNKLE9BQ0U7QUFBQSxJQUdKO0FBQUEsRUFDRjtBQUFBLEVBRUEscUJBQXFCO0FBQUEsSUFDbkIsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLElBQ2YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUFFO0FBQUEsSUFDdEIsT0FBTyxFQUFFLGFBQWEsU0FBUyxXQUFXLGVBQWU7QUFBQSxFQUMzRDtBQUFBLEVBRUEsZ0JBQWdCO0FBQUEsSUFDZCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsYUFBYSxDQUFDLFNBQVMsRUFBRTtBQUFBLElBQ2hELE9BQU8sRUFBRSxhQUFhLFNBQVMsV0FBVyxlQUFlO0FBQUEsRUFDM0Q7QUFBQSxFQUVBLHNCQUFzQjtBQUFBLElBQ3BCLE1BQU07QUFBQTtBQUFBO0FBQUEsSUFHTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsYUFBYSxDQUFDLFNBQVMsRUFBRTtBQUFBLElBQ2hELE9BQU8sRUFBRSxhQUFhLFNBQVMsV0FBVyxlQUFlO0FBQUEsRUFDM0Q7QUFBQSxFQUVBLGtCQUFrQjtBQUFBLElBQ2hCLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLdEIsT0FBTyxFQUFFLGFBQWEsU0FBUyxXQUFXLGNBQWM7QUFBQSxJQUN4RCxNQUFNO0FBQUEsTUFDSixPQUNFO0FBQUEsSUFFSjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLGNBQWM7QUFBQSxJQUNaLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQTtBQUFBO0FBQUEsSUFHZCxVQUFVLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBTzlCLE9BQU8sRUFBRSxhQUFhLFNBQVMsV0FBVyxjQUFjO0FBQUEsSUFDeEQsTUFBTTtBQUFBLE1BQ0osT0FDRTtBQUFBLElBR0o7QUFBQSxFQUNGO0FBQUEsRUFFQSxPQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixVQUFVO0FBQUEsSUFDVixVQUFVO0FBQUEsSUFDVixjQUFjO0FBQUEsSUFDZCxVQUFVLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRTtBQUFBO0FBQUEsSUFFOUIsT0FBTyxFQUFFLGFBQWEsU0FBUyxXQUFXLGNBQWM7QUFBQSxJQUN4RCxNQUFNO0FBQUEsTUFDSixPQUNFO0FBQUEsSUFHSjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLGNBQWM7QUFBQSxJQUNaLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxJQUNmLFVBQVU7QUFBQSxJQUNWLFVBQVU7QUFBQSxJQUNWLGNBQWM7QUFBQSxJQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtBQUFBLElBQ3RCLE9BQU8sRUFBRSxhQUFhLFFBQVEsV0FBVyxTQUFTO0FBQUEsRUFDcEQ7QUFDRjtBQUdPLElBQU0sdUJBQXVCLE9BQU8sS0FBSyxhQUFhO0FBdUJ0RCxTQUFTLFlBQVksT0FBc0I7QUFDaEQsUUFBTSxRQUFRLGNBQWMsTUFBTSxJQUFJO0FBQ3RDLE1BQUksaUJBQWlCLFNBQVMsTUFBTSxVQUFVO0FBQzVDLFdBQU8sR0FBRyxNQUFNLFlBQVksSUFBSSxNQUFNLFlBQVksSUFBSTtBQUFBLEVBQ3hEO0FBQ0EsU0FBTyxNQUFNO0FBQ2Y7OztBQzdlTyxJQUFNLHVCQUE0QyxvQkFBSSxJQUFJO0FBQUEsRUFDL0Q7QUFBQSxFQUNBO0FBQ0YsQ0FBQzs7O0FDZ0NNLElBQU0scUJBQXFCO0FBSWxDLFNBQVMsTUFBTSxNQUFzQjtBQUNuQyxNQUFJLE9BQU87QUFDWCxXQUFTLElBQUksR0FBRyxJQUFJLEtBQUssUUFBUSxLQUFLO0FBQ3BDLFlBQVEsS0FBSyxXQUFXLENBQUM7QUFDekIsV0FBTyxLQUFLLEtBQUssTUFBTSxRQUFVO0FBQUEsRUFDbkM7QUFDQSxVQUFRLFNBQVMsR0FBRyxTQUFTLEVBQUUsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNsRDtBQUVBLFNBQVMsc0JBQThCO0FBQ3JDLFFBQU0sUUFBUSxDQUFDLEdBQUcsb0JBQW9CLEVBQ25DLEtBQUssRUFDTCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sY0FBYyxJQUFJLEVBQUUsUUFBUSxDQUFDO0FBQ3JELFFBQU0sV0FBVyxLQUFLLFVBQVU7QUFBQSxJQUM5QixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsSUFDUjtBQUFBLEVBQ0YsQ0FBQztBQUNELFNBQU8sR0FBRyxrQkFBa0IsSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUNqRDtBQUlPLElBQU0sZ0JBQWdCLG9CQUFvQjtBQU1qRCxTQUFTLGVBQWUsT0FBZ0MsTUFBb0I7QUFDMUUsUUFBTSxXQUFXLEtBQUssUUFBUSxLQUFLO0FBQ25DLE1BQUksYUFBYSxJQUFJO0FBRW5CLFVBQU0sUUFBUSxLQUFLLE1BQU0sR0FBRyxRQUFRO0FBQ3BDLFVBQU0sTUFBTSxLQUFLLE1BQU0sV0FBVyxDQUFDO0FBQ25DLFVBQU0sTUFBTSxNQUFNLEtBQUs7QUFDdkIsUUFBSSxNQUFNLFFBQVEsR0FBRyxHQUFHO0FBQ3RCLGlCQUFXLE1BQU0sS0FBSztBQUNwQixZQUFJLE9BQU8sUUFBUSxPQUFPLE9BQU8sVUFBVTtBQUN6QyxpQkFBUSxHQUErQixHQUFHO0FBQUEsUUFDNUM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUNBO0FBQUEsRUFDRjtBQUNBLFFBQU0sU0FBUyxLQUFLLFFBQVEsR0FBRztBQUMvQixNQUFJLFdBQVcsSUFBSTtBQUdqQixVQUFNLFNBQVMsTUFBTSxLQUFLLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDMUMsUUFBSSxXQUFXLFFBQVEsT0FBTyxXQUFXLFlBQVksQ0FBQyxNQUFNLFFBQVEsTUFBTSxHQUFHO0FBQzNFLGFBQVEsT0FBbUMsS0FBSyxNQUFNLFNBQVMsQ0FBQyxDQUFDO0FBQUEsSUFDbkU7QUFDQTtBQUFBLEVBQ0Y7QUFFQSxTQUFPLE1BQU0sSUFBSTtBQUNuQjtBQVNBLFNBQVMsbUJBQW1CLE9BQXNCO0FBQ2hELE1BQUksTUFBTSxRQUFRLEtBQUssR0FBRztBQUN4QixlQUFXLE1BQU0sTUFBTyxvQkFBbUIsRUFBRTtBQUM3QztBQUFBLEVBQ0Y7QUFDQSxNQUFJLFVBQVUsUUFBUSxPQUFPLFVBQVUsU0FBVTtBQUNqRCxRQUFNLE1BQU07QUFFWixNQUFJLElBQUksU0FBUyxTQUFTO0FBQ3hCLGVBQVcsU0FBUyxvQkFBcUIsUUFBTyxJQUFJLEtBQUs7QUFBQSxFQUMzRDtBQUNBLE1BQ0UsT0FBTyxJQUFJLFNBQVMsWUFDcEIscUJBQXFCLElBQUksSUFBSSxJQUFJLEtBQ2pDLE1BQU0sUUFBUSxJQUFJLE9BQU8sR0FDekI7QUFDQSxlQUFXLFVBQVUsSUFBSSxTQUFTO0FBQ2hDLFVBQUksV0FBVyxRQUFRLE9BQU8sV0FBVyxVQUFVO0FBQ2pELG1CQUFXLFNBQVMsMkJBQTJCO0FBQzdDLGlCQUFRLE9BQW1DLEtBQUs7QUFBQSxRQUNsRDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLGFBQVcsT0FBTyxPQUFPLEtBQUssR0FBRyxFQUFHLG9CQUFtQixJQUFJLEdBQUcsQ0FBQztBQUNqRTtBQTRCQSxJQUFNLGNBQWM7QUFJcEIsSUFBTSxpQkFBc0Msb0JBQUksSUFBSTtBQUFBLEVBQ2xEO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFTRCxTQUFTLFVBQVUsT0FBb0M7QUFDckQsU0FBTyxPQUFPLFVBQVUsWUFDdEIsT0FBTyxVQUFVLEtBQUssS0FDdEIsUUFBUSxLQUNSLFNBQVMsY0FDUCxRQUNBO0FBQ047QUFHQSxTQUFTLFdBQVcsT0FBb0M7QUFDdEQsU0FBTyxPQUFPLFVBQVUsWUFBWSxlQUFlLElBQUksS0FBSyxJQUN4RCxRQUNBO0FBQ047QUFPTyxTQUFTLG9CQUNkLE9BQzJCO0FBQzNCLFFBQU0sY0FBYyxNQUFNO0FBQzFCLFFBQU0sT0FBTyxPQUFPLGFBQWEsU0FBUyxXQUFXLFlBQVksT0FBTztBQUN4RSxNQUFJLENBQUMsUUFBUSxTQUFTLFVBQVcsUUFBTztBQUV4QyxRQUFNLFFBQXVCLENBQUM7QUFNOUIsUUFBTSxTQUFTLGFBQWE7QUFDNUIsTUFBSSxNQUFNLFFBQVEsTUFBTSxHQUFHO0FBQ3pCLFVBQU0sUUFBUSxVQUFVLE9BQU8sTUFBTTtBQUNyQyxRQUFJLFVBQVUsT0FBVyxPQUFNLGNBQWM7QUFBQSxFQUMvQztBQUdBLFFBQU0sU0FBUyxhQUFhO0FBQzVCLE1BQUksTUFBTSxRQUFRLE1BQU0sS0FBSyxPQUFPLFNBQVMsR0FBRztBQUM5QyxVQUFNLFNBQVM7QUFBQSxNQUNaLE9BQU8sQ0FBQyxHQUFzQztBQUFBLElBQ2pEO0FBQ0EsUUFBSSxXQUFXLE9BQVcsT0FBTSxTQUFTO0FBQUEsRUFDM0M7QUFHQSxRQUFNLGVBQWUsYUFBYTtBQUNsQyxNQUFJLE1BQU0sUUFBUSxZQUFZLEtBQUssYUFBYSxTQUFTLEdBQUc7QUFDMUQsVUFBTSxXQUFZLGFBQWEsQ0FBQyxHQUM1QjtBQUNKLFVBQU0sU0FBUyxXQUFXLFVBQVUsTUFBTTtBQUMxQyxRQUFJLFdBQVcsT0FBVyxPQUFNLFNBQVM7QUFBQSxFQUMzQztBQUdBLFFBQU0sVUFBVSxhQUFhO0FBQzdCLE1BQUksTUFBTSxRQUFRLE9BQU8sS0FBSyxRQUFRLFNBQVMsR0FBRztBQUNoRCxVQUFNLFdBQVksUUFBUSxDQUFDLEdBQ3ZCO0FBQ0osUUFBSSxNQUFNLFFBQVEsUUFBUSxHQUFHO0FBQzNCLFlBQU0sUUFBUSxVQUFVLFNBQVMsTUFBTTtBQUN2QyxVQUFJLFVBQVUsT0FBVyxPQUFNLGNBQWM7QUFBQSxJQUMvQztBQUFBLEVBQ0Y7QUFFQSxTQUFPLE9BQU8sS0FBSyxLQUFLLEVBQUUsU0FBUyxJQUFJLFFBQVE7QUFDakQ7QUFFQSxTQUFTLGlCQUFpQixPQUFzQztBQUM5RCxRQUFNLE9BQU8sTUFBTTtBQUNuQixRQUFNLFFBQ0osT0FBTyxTQUFTLFlBQVksUUFBUSxnQkFDaEMsY0FBYyxJQUFrQyxJQUNoRDtBQUNOLE1BQUksQ0FBQyxPQUFPO0FBSVYsVUFBTSxJQUFJLE1BQU0sZ0NBQWdDLE9BQU8sSUFBSSxDQUFDLEVBQUU7QUFBQSxFQUNoRTtBQUlBLFFBQU0sUUFBUSxNQUFNLFNBQVMsc0JBQ3pCLG9CQUFvQixLQUFLLElBQ3pCO0FBRUosYUFBVyxRQUFRLE1BQU0sU0FBUyxNQUFPLGdCQUFlLE9BQU8sSUFBSTtBQUVuRSxNQUFJLE1BQU8sT0FBTSxnQkFBZ0I7QUFFakMsYUFBVyxTQUFTLE1BQU0sU0FBUyxlQUFlLENBQUMsR0FBRztBQUNwRCxVQUFNLFdBQVcsTUFBTSxLQUFLO0FBQzVCLFFBQUksTUFBTSxRQUFRLFFBQVEsR0FBRztBQUMzQixpQkFBVyxTQUFTLFVBQVU7QUFDNUIsWUFBSSxVQUFVLFFBQVEsT0FBTyxVQUFVLFVBQVU7QUFDL0MsMkJBQWlCLEtBQWdDO0FBQUEsUUFDbkQ7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxxQkFBbUIsS0FBSztBQUMxQjtBQTZCTyxTQUFTLGNBQWMsT0FBOEI7QUFDMUQsUUFBTSxRQUFRLGdCQUFnQixLQUFLO0FBQ25DLG1CQUFpQixLQUFLO0FBQ3RCLFNBQU87QUFDVDtBQVFPLFNBQVMseUJBQ2QsS0FDMkI7QUFDM0IsUUFBTSxRQUFRLGdCQUFnQixHQUFHO0FBS2pDLGFBQVcsV0FBVyxNQUFNLFVBQVU7QUFDcEMsZUFBVyxPQUFPLFFBQVEsTUFBTTtBQUM5QixpQkFBVyxVQUFVLElBQUksU0FBUztBQUNoQyxtQkFBVyxTQUFTLE9BQU8sUUFBUTtBQUNqQyxjQUFJLFVBQVUsUUFBUSxPQUFPLFVBQVUsVUFBVTtBQUMvQyw2QkFBaUIsS0FBZ0M7QUFBQSxVQUNuRDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFHQSxxQkFBbUIsS0FBSztBQUN4QixTQUFPO0FBQ1Q7OztBQ25WQSxTQUFTLFNBQVMsTUFBc0I7QUFDdEMsTUFBSSxPQUFPO0FBQ1gsV0FBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLFFBQVEsS0FBSztBQUNwQyxZQUFRLEtBQUssV0FBVyxDQUFDO0FBQ3pCLFdBQU8sS0FBSyxLQUFLLE1BQU0sUUFBVTtBQUFBLEVBQ25DO0FBQ0EsU0FBTyxTQUFTO0FBQ2xCO0FBR0EsU0FBUyxXQUFXLE1BQTRCO0FBQzlDLE1BQUksSUFBSSxTQUFTO0FBQ2pCLFNBQU8sTUFBTTtBQUNYLFFBQUssSUFBSSxlQUFnQjtBQUN6QixRQUFJLElBQUk7QUFDUixRQUFJLEtBQUssS0FBSyxJQUFLLE1BQU0sSUFBSyxJQUFJLENBQUM7QUFDbkMsU0FBSyxJQUFJLEtBQUssS0FBSyxJQUFLLE1BQU0sR0FBSSxJQUFJLEVBQUU7QUFDeEMsYUFBUyxJQUFLLE1BQU0sUUFBUyxLQUFLO0FBQUEsRUFDcEM7QUFDRjtBQW1CTyxTQUFTLGNBQWlCLE9BQXFCLFNBQXNCO0FBQzFFLFFBQU0sTUFBTSxDQUFDLEdBQUcsS0FBSztBQUNyQixRQUFNLE9BQU8sV0FBVyxTQUFTLE9BQU8sQ0FBQztBQUN6QyxXQUFTLElBQUksSUFBSSxTQUFTLEdBQUcsSUFBSSxHQUFHLEtBQUs7QUFDdkMsVUFBTSxJQUFJLEtBQUssTUFBTSxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQ3JDLFVBQU0sSUFBSSxJQUFJLENBQUM7QUFDZixRQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDZCxRQUFJLENBQUMsSUFBSTtBQUFBLEVBQ1g7QUFDQSxNQUFJLElBQUksU0FBUyxLQUFLLElBQUksTUFBTSxDQUFDLE9BQU8sTUFBTSxVQUFVLE1BQU0sQ0FBQyxDQUFDLEdBQUc7QUFDakUsUUFBSSxLQUFLLElBQUksTUFBTSxDQUFNO0FBQUEsRUFDM0I7QUFDQSxTQUFPO0FBQ1Q7QUFRTyxTQUFTLG1CQUNkLEtBQ0EsU0FDMkI7QUFDM0IsUUFBTSxRQUFRLGdCQUFnQixHQUFHO0FBTWpDLFFBQU0sZUFBZSxDQUFDLFVBQXlDO0FBQzdELFVBQU0sT0FBTyxNQUFNO0FBQ25CLFVBQU0sUUFDSixPQUFPLFNBQVMsWUFBWSxRQUFRLGdCQUNoQyxjQUFjLElBQWtDLElBQ2hEO0FBQ04sUUFBSSxDQUFDLE1BQU87QUFDWixlQUFXLFNBQVMsTUFBTSxTQUFTLGlCQUFpQixDQUFDLEdBQUc7QUFDdEQsWUFBTSxNQUFNLE1BQU0sS0FBSztBQUN2QixVQUFJLE1BQU0sUUFBUSxHQUFHLEdBQUc7QUFDdEIsY0FBTSxLQUFLLElBQUk7QUFBQSxVQUNiO0FBQUEsVUFDQSxHQUFHLE9BQU8sSUFBSSxPQUFPLE1BQU0sTUFBTSxFQUFFLENBQUMsSUFBSSxLQUFLO0FBQUEsUUFDL0M7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUVBLGVBQVcsU0FBUyxNQUFNLFNBQVMsZUFBZSxDQUFDLEdBQUc7QUFDcEQsWUFBTSxXQUFXLE1BQU0sS0FBSztBQUM1QixVQUFJLE1BQU0sUUFBUSxRQUFRLEdBQUc7QUFDM0IsbUJBQVcsU0FBUyxVQUFVO0FBQzVCLGNBQUksVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVO0FBQy9DLHlCQUFhLEtBQWdDO0FBQUEsVUFDL0M7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsYUFBVyxXQUFXLE1BQU0sVUFBVTtBQUNwQyxlQUFXLE9BQU8sUUFBUSxNQUFNO0FBQzlCLGlCQUFXLFVBQVUsSUFBSSxTQUFTO0FBQ2hDLG1CQUFXLFNBQVMsT0FBTyxRQUFRO0FBQ2pDLGNBQUksVUFBVSxRQUFRLE9BQU8sVUFBVSxVQUFVO0FBQy9DLHlCQUFhLEtBQWdDO0FBQUEsVUFDL0M7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0EsU0FBTztBQUNUOzs7QUNuQ08sU0FBUyxvQkFBb0IsT0FBeUI7QUFDM0QsU0FDRSxNQUFNLFFBQVEsS0FBSyxLQUNuQixNQUFNLFNBQVMsS0FDZixNQUFNO0FBQUEsSUFDSixDQUFDLFNBQ0MsT0FBTyxTQUFTLFlBQ2hCLFNBQVMsUUFDVCxPQUFRLEtBQTBCLE9BQU8sWUFDekMsT0FBUSxLQUE0QixTQUFTO0FBQUEsRUFDakQ7QUFBQTtBQUFBLEVBR0EsTUFBTSxNQUFNLENBQUMsU0FBUztBQUNwQixVQUFNLElBQUssS0FBMEI7QUFDckMsV0FBTyxNQUFNLFVBQVUsTUFBTSxXQUFXLE1BQU0saUJBQWlCLE1BQU07QUFBQSxFQUN2RSxDQUFDO0FBRUw7QUFLTyxTQUFTLGNBQWdDLE9BQWU7QUFDN0QsUUFBTSxNQUFXLENBQUM7QUFDbEIsYUFBVyxTQUFTLE9BQU8sT0FBTyxLQUFnQyxHQUFHO0FBQ25FLFFBQUksb0JBQW9CLEtBQUssRUFBRyxLQUFJLEtBQUssR0FBSSxLQUFhO0FBQUEsRUFDNUQ7QUFDQSxTQUFPO0FBQ1Q7OztBQ3BETyxJQUFNLGtCQUFrQixvQkFBSSxJQUFJO0FBQUEsRUFDckM7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGLENBQUM7QUFDTSxJQUFNLGNBQWMsb0JBQUksSUFBSTtBQUFBLEVBQ2pDO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBR0QsU0FBUyxnQkFBZ0IsTUFBeUM7QUFDaEUsUUFBTSxTQUFTLE9BQU8sS0FBSyxXQUFXLFdBQVcsS0FBSyxTQUFTO0FBQy9ELFFBQU0sYUFBYSxNQUFNLFFBQVEsS0FBSyxpQkFBaUIsSUFDbEQsS0FBSyxrQkFBZ0M7QUFBQSxJQUNwQyxDQUFDLE1BQW1CLE9BQU8sTUFBTTtBQUFBLEVBQ25DLElBQ0EsQ0FBQztBQUNMLFFBQU0sYUFBYSxLQUFLO0FBQ3hCLFNBQU87QUFBQSxJQUNMLElBQUksT0FBTyxLQUFLLE1BQU0sRUFBRTtBQUFBO0FBQUE7QUFBQSxJQUd4QixTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVU7QUFBQSxJQUMvQixZQUNFLGVBQWUsYUFBYSxlQUFlLFNBQVMsYUFBYTtBQUFBLElBQ25FLFdBQVcsT0FBTyxLQUFLLGNBQWMsV0FBVyxLQUFLLFlBQVk7QUFBQSxJQUNqRSxhQUFhLEtBQUssZ0JBQWdCLGVBQWUsZUFBZTtBQUFBLElBQ2hFLGlCQUFpQixNQUFNLFFBQVEsS0FBSyxlQUFlLElBQzlDLEtBQUssa0JBQ04sQ0FBQztBQUFBLElBQ0wsTUFBTSxNQUFNLFFBQVEsS0FBSyxJQUFJLElBQUssS0FBSyxPQUFxQjtBQUFBLElBQzVELDZCQUE2QixLQUFLLGdDQUFnQztBQUFBLEVBQ3BFO0FBQ0Y7QUFLQSxTQUFTLGdCQUFnQixNQUF5QztBQUNoRSxRQUFNLFNBQVMsT0FBTyxLQUFLLFdBQVcsV0FBVyxLQUFLLFNBQVM7QUFDL0QsUUFBTSxhQUFhLE1BQU0sUUFBUSxLQUFLLGlCQUFpQixJQUNsRCxLQUFLLGtCQUFnQztBQUFBLElBQ3BDLENBQUMsTUFBbUIsT0FBTyxNQUFNO0FBQUEsRUFDbkMsSUFDQSxDQUFDO0FBQ0wsU0FBTztBQUFBLElBQ0wsSUFBSSxPQUFPLEtBQUssTUFBTSxFQUFFO0FBQUEsSUFDeEIsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFVO0FBQUEsSUFDL0IsWUFBWTtBQUFBLElBQ1osV0FBVyxPQUFPLEtBQUssY0FBYyxXQUFXLEtBQUssWUFBWTtBQUFBLElBQ2pFLGFBQWEsS0FBSyxnQkFBZ0IsZUFBZSxlQUFlO0FBQUEsSUFDaEUsaUJBQWlCLENBQUM7QUFBQSxJQUNsQixNQUFNO0FBQUE7QUFBQSxJQUVOLDZCQUE2QjtBQUFBLEVBQy9CO0FBQ0Y7QUFPQSxTQUFTLGtCQUNQLE9BQ0EsS0FDQSxtQkFDTTtBQUNOLE1BQUksTUFBTSxRQUFRLEtBQUssR0FBRztBQUN4QixRQUFJLGtCQUFrQixLQUFLLEVBQUc7QUFDOUIsZUFBVyxRQUFRLE1BQU8sbUJBQWtCLE1BQU0sS0FBSyxpQkFBaUI7QUFDeEU7QUFBQSxFQUNGO0FBQ0EsTUFBSSxVQUFVLFFBQVEsT0FBTyxVQUFVLFNBQVU7QUFDakQsUUFBTSxPQUFPO0FBRWIsTUFBSSxLQUFLLFNBQVMsV0FBVyxPQUFPLEtBQUssT0FBTyxVQUFVO0FBQ3hELFFBQUksS0FBSyxnQkFBZ0IsSUFBSSxDQUFDO0FBQzlCO0FBQUEsRUFDRjtBQUNBLE1BQ0UsT0FBTyxLQUFLLFNBQVMsWUFDckIscUJBQXFCLElBQUksS0FBSyxJQUFJLEtBQ2xDLE1BQU0sUUFBUSxLQUFLLE9BQU8sR0FDMUI7QUFDQSxlQUFXLFVBQVUsS0FBSyxTQUFTO0FBQ2pDLFVBQUksV0FBVyxRQUFRLE9BQU8sV0FBVyxVQUFVO0FBQ2pELFlBQUksS0FBSyxnQkFBZ0IsTUFBaUMsQ0FBQztBQUFBLE1BQzdEO0FBQUEsSUFDRjtBQUFBLEVBRUY7QUFDQSxhQUFXLFNBQVMsT0FBTyxPQUFPLElBQUksR0FBRztBQUN2QyxzQkFBa0IsT0FBTyxLQUFLLGlCQUFpQjtBQUFBLEVBQ2pEO0FBQ0Y7QUFVQSxTQUFTLE1BQU0sT0FBaUIsS0FBOEI7QUFDNUQsUUFBTSxLQUFLLE9BQU8sTUFBTSxPQUFPLFdBQVcsTUFBTSxLQUFLO0FBQ3JELFFBQU0sT0FBTyxPQUFPLE1BQU0sU0FBUyxXQUFXLE1BQU0sT0FBTztBQUMzRCxNQUFJLENBQUMsR0FBSTtBQU1ULE1BQUksTUFBTSxRQUFRLE1BQU0sUUFBUSxLQUFLLE1BQU0sU0FBUyxTQUFTLEdBQUc7QUFDOUQsUUFBSSxVQUFVLEtBQUssRUFBRSxTQUFTLElBQUksVUFBVSxNQUFNLFNBQXNCLENBQUM7QUFBQSxFQUMzRTtBQUVBLFFBQU0sU0FBcUIsQ0FBQztBQUM1QixvQkFBa0IsT0FBTyxRQUFRLG1CQUFtQjtBQUNwRCxNQUFJLE9BQU8sU0FBUyxHQUFHO0FBQ3JCLFFBQUksbUJBQW1CLEtBQUssRUFBRSxTQUFTLElBQUksTUFBTSxPQUFPLENBQUM7QUFBQSxFQUMzRDtBQUVBLFVBQVEsTUFBTTtBQUFBLElBQ1osS0FBSyxtQkFBbUI7QUFDdEIsWUFBTSxVQUFVLE1BQU0sUUFBUSxNQUFNLE9BQU8sSUFDdEMsTUFBTSxVQUNQLENBQUM7QUFDTCxVQUFJLGVBQWUsS0FBSztBQUFBLFFBQ3RCLFNBQVM7QUFBQSxRQUNULFlBQVksUUFDVCxPQUFPLENBQUMsTUFBTSxFQUFFLFlBQVksSUFBSSxFQUNoQyxJQUFJLENBQUMsTUFBTSxPQUFPLEVBQUUsRUFBRSxDQUFDO0FBQUEsUUFDMUIsU0FBUyxRQUFRLElBQUksQ0FBQyxPQUFPO0FBQUEsVUFDM0IsSUFBSSxPQUFPLEVBQUUsRUFBRTtBQUFBLFVBQ2YsR0FBSSxNQUFNLFFBQVEsRUFBRSxRQUFRLElBQ3hCLEVBQUUsVUFBVSxFQUFFLFNBQXNCLElBQ3BDLENBQUM7QUFBQSxRQUNQLEVBQUU7QUFBQSxNQUNKLENBQUM7QUFDRDtBQUFBLElBQ0Y7QUFBQSxJQUNBLEtBQUssWUFBWTtBQUNmLFlBQU0sUUFBUSxNQUFNLFFBQVEsTUFBTSxLQUFLLElBQ2xDLE1BQU0sUUFDUCxDQUFDO0FBQ0wsVUFBSSxTQUFTLEtBQUs7QUFBQSxRQUNoQixTQUFTO0FBQUEsUUFDVCxLQUFNLE1BQU0sT0FBa0MsQ0FBQztBQUFBLFFBQy9DLFNBQVMsTUFBTSxJQUFJLENBQUMsTUFBTSxPQUFPLEVBQUUsRUFBRSxDQUFDO0FBQUEsTUFDeEMsQ0FBQztBQUNEO0FBQUEsSUFDRjtBQUFBLElBQ0EsS0FBSyxZQUFZO0FBQ2YsWUFBTSxRQUFRLE1BQU0sUUFBUSxNQUFNLEtBQUssSUFDbEMsTUFBTSxRQUNQLENBQUM7QUFHTCxVQUFJLFNBQVMsS0FBSyxFQUFFLFNBQVMsSUFBSSxlQUFlLE1BQU0sSUFBSSxDQUFDLE1BQU0sT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDaEY7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUNFLFVBQUksZ0JBQWdCLElBQUksSUFBSSxHQUFHO0FBQzdCLFlBQUksU0FBUyxLQUFLLEVBQUU7QUFBQSxNQUN0QixXQUFXLFlBQVksSUFBSSxJQUFJLEdBQUc7QUFDaEMsWUFBSSxPQUFPLEtBQUssRUFBRSxTQUFTLElBQUksTUFBeUMsQ0FBQztBQUFBLE1BQzNFO0FBQ0E7QUFBQSxFQUNKO0FBRUEsYUFBVyxTQUFTLGNBQWMsS0FBSyxFQUFHLE9BQU0sT0FBTyxHQUFHO0FBQzVEO0FBcUJPLFNBQVMsaUJBQWlCLFNBQXdDO0FBQ3ZFLFFBQU0sTUFBeUI7QUFBQSxJQUM3QixvQkFBb0IsQ0FBQztBQUFBLElBQ3JCLGdCQUFnQixDQUFDO0FBQUEsSUFDakIsVUFBVSxDQUFDO0FBQUEsSUFDWCxVQUFVLENBQUM7QUFBQSxJQUNYLFFBQVEsQ0FBQztBQUFBLElBQ1QsVUFBVSxDQUFDO0FBQUEsSUFDWCxXQUFXLENBQUM7QUFBQSxFQUNkO0FBQ0EsYUFBVyxPQUFPLFFBQVEsUUFBUSxDQUFDLEdBQUc7QUFDcEMsZUFBVyxVQUFVLElBQUksV0FBVyxDQUFDLEdBQUc7QUFDdEMsaUJBQVcsU0FBUyxPQUFPLFVBQVUsQ0FBQyxFQUFHLE9BQU0sT0FBTyxHQUFHO0FBQUEsSUFDM0Q7QUFBQSxFQUNGO0FBQ0EsU0FBTztBQUNUOzs7QUMzT08sSUFBTSxxQkFBcUI7QUF1QmxDLFNBQVMsY0FBYyxPQUFzQjtBQUMzQyxRQUFNLE9BQVEsTUFBNkI7QUFDM0MsTUFBSSxPQUFPLFNBQVMsWUFBWSxFQUFFLFFBQVEsZ0JBQWdCO0FBQ3hELFdBQU87QUFBQSxFQUNUO0FBQ0EsU0FBTyxZQUFZLEtBQUs7QUFDMUI7QUFPQSxTQUFTLFVBQVUsT0FBY0MsUUFBcUM7QUFDcEUsRUFBQUEsT0FBTSxLQUFLO0FBQ1gsYUFBVyxTQUFTLGNBQWMsS0FBMEIsR0FBRztBQUM3RCxjQUFVLE9BQTJCQSxNQUFLO0FBQUEsRUFDNUM7QUFDRjtBQU9BLFNBQVMsVUFBVSxLQUF1QkEsUUFBcUM7QUFDN0UsYUFBVyxXQUFXLElBQUksWUFBWSxDQUFDLEdBQUc7QUFDeEMsZUFBVyxPQUFPLFFBQVEsUUFBUSxDQUFDLEdBQUc7QUFDcEMsaUJBQVcsVUFBVSxJQUFJLFdBQVcsQ0FBQyxHQUFHO0FBQ3RDLG1CQUFXLFNBQVMsT0FBTyxVQUFVLENBQUMsRUFBRyxXQUFVLE9BQU9BLE1BQUs7QUFBQSxNQUNqRTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0EsYUFBVyxTQUFTLElBQUksZ0JBQWdCLFVBQVUsQ0FBQyxFQUFHLFdBQVUsT0FBT0EsTUFBSztBQUM5RTtBQVdPLFNBQVMsaUJBQWlCLEtBQXNDO0FBQ3JFLFFBQU0sU0FBUyxvQkFBSSxJQUFvQjtBQUN2QyxRQUFNLGVBQWUsb0JBQUksSUFBb0I7QUFFN0MsWUFBVSxLQUFLLENBQUMsVUFBVTtBQUN4QixVQUFNLE1BQU0sY0FBYyxLQUFLO0FBQy9CLFdBQU8sSUFBSSxNQUFNLE9BQU8sSUFBSSxHQUFHLEtBQUssS0FBSyxDQUFDO0FBQzFDLFVBQU0sS0FBTSxNQUEyQjtBQUN2QyxRQUFJLE9BQU8sT0FBTyxTQUFVLGNBQWEsSUFBSSxJQUFJLEdBQUc7QUFBQSxFQUN0RCxDQUFDO0FBRUQsUUFBTSxRQUFzQixDQUFDO0FBQzdCLFFBQU0sT0FBTyxvQkFBSSxJQUFZO0FBQzdCLFFBQU0sT0FBTyxDQUFDLFFBQWdCLFlBQTBCO0FBQ3RELFFBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxNQUFNLEVBQUc7QUFDakMsU0FBSyxJQUFJLE1BQU07QUFDZixVQUFNLEtBQUs7QUFBQSxNQUNUO0FBQUEsTUFDQSxXQUFXLGFBQWEsSUFBSSxPQUFPLEtBQUs7QUFBQSxJQUMxQyxDQUFDO0FBQUEsRUFDSDtBQUVBLGFBQVcsV0FBVyxJQUFJLFlBQVksQ0FBQyxHQUFHO0FBQ3hDLFVBQU0sTUFBTSxpQkFBaUIsT0FBZ0M7QUFJN0QsZUFBVyxTQUFTLElBQUksb0JBQW9CO0FBQzFDLGlCQUFXLE9BQU8sTUFBTSxLQUFNLE1BQUssSUFBSSxJQUFJLE1BQU0sT0FBTztBQUFBLElBQzFEO0FBQ0EsZUFBVyxNQUFNLElBQUksZUFBZ0IsTUFBSyxHQUFHLFNBQVMsR0FBRyxPQUFPO0FBQ2hFLGVBQVcsS0FBSyxJQUFJLFNBQVUsTUFBSyxFQUFFLFNBQVMsRUFBRSxPQUFPO0FBQ3ZELGVBQVcsS0FBSyxJQUFJLFNBQVUsTUFBSyxFQUFFLFNBQVMsRUFBRSxPQUFPO0FBQ3ZELGVBQVcsS0FBSyxJQUFJLE9BQVEsTUFBSyxFQUFFLFNBQVMsRUFBRSxPQUFPO0FBQ3JELGVBQVcsTUFBTSxJQUFJLFNBQVUsTUFBSyxJQUFJLEVBQUU7QUFBQSxFQUM1QztBQUVBLFNBQU87QUFBQSxJQUNMLFFBQVEsQ0FBQyxHQUFHLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxXQUFXLFVBQVUsT0FBTztBQUFBLE1BQ3BEO0FBQUEsTUFDQTtBQUFBLElBQ0YsRUFBRTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7OztBQ3ZKTyxTQUFTLFVBQVUsV0FBbUIsV0FBMkI7QUFDdEUsU0FBTyxHQUFHLFNBQVMsSUFBSSxTQUFTO0FBQ2xDOzs7QUNUTyxTQUFTLE9BQU8sWUFBbUM7QUFDeEQsUUFBTSxRQUFRLFdBQVcsUUFBUSxlQUFlLEVBQUU7QUFDbEQsUUFBTSxVQUFVLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNsQyxNQUFJLENBQUMsUUFBUyxRQUFPO0FBQ3JCLE1BQUk7QUFDRixVQUFNLE9BQU8sS0FBSztBQUFBLE1BQ2hCLEtBQUssUUFBUSxRQUFRLE1BQU0sR0FBRyxFQUFFLFFBQVEsTUFBTSxHQUFHLENBQUM7QUFBQSxJQUNwRDtBQUNBLFdBQU8sT0FBTyxLQUFLLFFBQVEsV0FBVyxLQUFLLE1BQU07QUFBQSxFQUNuRCxRQUFRO0FBQ04sV0FBTztBQUFBLEVBQ1Q7QUFDRjs7O0FDTk8sSUFBTSxVQUNYOzs7QUNnRUssSUFBTSxjQUFjO0FBNkhwQixJQUFNLGlCQUFpQjtBQUd2QixJQUFNLHNCQUFzQjtBQUU1QixTQUFTLHNCQUNkLE1BQW9CLEtBQUssS0FDQTtBQUN6QixRQUFNLFdBQVcsb0JBQUksSUFBc0I7QUFDM0MsU0FBTyxTQUFTLGdCQUFnQixJQUFxQjtBQUNuRCxVQUFNLElBQUksSUFBSTtBQUNkLFVBQU0sUUFBUSxTQUFTLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRztBQUFBLE1BQ3BDLENBQUMsUUFBUSxJQUFJLE1BQU07QUFBQSxJQUNyQjtBQUNBLFFBQUksS0FBSyxVQUFVLHFCQUFxQjtBQUN0QyxlQUFTLElBQUksSUFBSSxJQUFJO0FBQ3JCLGFBQU87QUFBQSxJQUNUO0FBQ0EsU0FBSyxLQUFLLENBQUM7QUFDWCxhQUFTLElBQUksSUFBSSxJQUFJO0FBRXJCLFFBQUksU0FBUyxPQUFPLElBQVEsVUFBUyxNQUFNO0FBQzNDLFdBQU87QUFBQSxFQUNUO0FBQ0Y7QUFPTyxTQUFTLHlCQUNkLE1BQ3FDO0FBQ3JDLFFBQU0sRUFBRSxJQUFJLEtBQUssSUFBSTtBQUNyQixRQUFNLGtCQUFrQixzQkFBc0IsS0FBSyxPQUFPLEtBQUssR0FBRztBQUVsRSxTQUFPLGVBQWUsa0JBQWtCLEtBQWlDO0FBQ3ZFLFVBQU0sWUFBWSxLQUFLLGdCQUFnQixHQUFHO0FBQzFDLFFBQUksVUFBVyxRQUFPO0FBQ3RCLFFBQUksSUFBSSxXQUFXLE9BQU87QUFDeEIsYUFBTyxLQUFLLGNBQWMsS0FBSyxLQUFLLG9CQUFvQjtBQUFBLElBQzFEO0FBRUEsVUFBTSxNQUFNLElBQUksSUFBSSxJQUFJLEdBQUc7QUFDM0IsVUFBTSxhQUFhLElBQUksYUFBYSxJQUFJLGFBQWEsS0FBSztBQUMxRCxVQUFNLFlBQVksSUFBSSxhQUFhLElBQUksWUFBWTtBQUNuRCxVQUFNLFdBQVcsSUFBSSxhQUFhLElBQUksTUFBTSxNQUFNO0FBRWxELFFBQUksQ0FBQyxRQUFRLEtBQUssVUFBVSxHQUFHO0FBQzdCLGFBQU8sS0FBSyxjQUFjLEtBQUssS0FBSyw0QkFBNEI7QUFBQSxJQUNsRTtBQUdBLFFBQUksVUFBVTtBQUNaLFlBQU0sS0FDSixJQUFJLFFBQVEsSUFBSSxpQkFBaUIsR0FBRyxNQUFNLEdBQUcsRUFBRSxDQUFDLEdBQUcsS0FBSyxLQUFLO0FBQy9ELFVBQUksZ0JBQWdCLEVBQUUsR0FBRztBQUN2QixlQUFPLEtBQUssY0FBYyxLQUFLLEtBQUssbUJBQW1CO0FBQUEsTUFDekQ7QUFDQSxZQUFNLEVBQUUsTUFBTSxNQUFNLElBQUksTUFBTSxHQUFHLFdBQVcsVUFBVTtBQUN0RCxVQUFJLE9BQU87QUFDVCxnQkFBUSxNQUFNLGtDQUFrQyxLQUFLO0FBQ3JELGVBQU8sS0FBSyxjQUFjLEtBQUssS0FBSyxlQUFlO0FBQUEsTUFDckQ7QUFDQSxVQUFJLENBQUMsS0FBTSxRQUFPLEtBQUssY0FBYyxLQUFLLEtBQUssZUFBZTtBQUM5RCxhQUFPLEtBQUs7QUFBQSxRQUNWO0FBQUEsUUFDQTtBQUFBLFVBQ0UsYUFBYTtBQUFBLFVBQ2IsT0FBTyxLQUFLO0FBQUEsVUFDWixjQUFjLEtBQUs7QUFBQSxRQUNyQjtBQUFBLFFBQ0EsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLFdBQVcsRUFBRTtBQUFBLE1BQzdDO0FBQUEsSUFDRjtBQUdBLFVBQU0sYUFBYSxJQUFJLFFBQVEsSUFBSSxlQUFlO0FBQ2xELFFBQUksQ0FBQyxZQUFZO0FBQ2YsYUFBTyxLQUFLLGNBQWMsS0FBSyxLQUFLLDhCQUE4QjtBQUFBLElBQ3BFO0FBRUEsVUFBTSxFQUFFLE1BQU0sU0FBUyxPQUFPLFNBQVMsSUFBSSxNQUFNLEdBQUc7QUFBQSxNQUNsRDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQ0EsUUFBSSxVQUFVO0FBQ1osWUFBTSxNQUFNLFNBQVMsV0FBVztBQUdoQyxZQUFNLFNBQVMsSUFBSSxTQUFTLGVBQWUsSUFDdkMsTUFDQSxrQkFBa0IsS0FBSyxHQUFHLElBQ3hCLE1BQ0E7QUFDTixVQUFJLFdBQVcsSUFBSyxTQUFRLE1BQU0sNkJBQTZCLFFBQVE7QUFDdkUsYUFBTyxLQUFLO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxRQUNBLFdBQVcsTUFBTSxrQkFBa0I7QUFBQSxNQUNyQztBQUFBLElBQ0Y7QUFDQSxRQUFJLENBQUMsUUFBUyxRQUFPLEtBQUssY0FBYyxLQUFLLEtBQUssZUFBZTtBQUNqRSxVQUFNLE1BQU07QUFHWixRQUFJLENBQUMsV0FBVztBQUNkLGFBQU8sS0FBSztBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsVUFDRSxhQUFhO0FBQUEsVUFDYixhQUFhO0FBQUEsVUFDYixZQUFZLElBQUk7QUFBQSxVQUNoQixhQUFhLElBQUk7QUFBQSxVQUNqQixPQUFPLElBQUk7QUFBQSxRQUNiO0FBQUEsUUFDQSxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsV0FBVyxFQUFFO0FBQUEsTUFDN0M7QUFBQSxJQUNGO0FBR0EsUUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLEdBQUc7QUFDNUIsYUFBTyxLQUFLLGNBQWMsS0FBSyxLQUFLLDJCQUEyQjtBQUFBLElBQ2pFO0FBQ0EsUUFBSSxjQUFjLElBQUksWUFBWTtBQUdoQyxhQUFPLEtBQUssY0FBYyxLQUFLLEtBQUssMkJBQTJCO0FBQUEsUUFDN0QsTUFBTTtBQUFBLFFBQ04sb0JBQW9CLElBQUk7QUFBQSxNQUMxQixDQUFDO0FBQUEsSUFDSDtBQUdBLFFBQUksWUFBOEM7QUFDbEQsVUFBTSxFQUFFLE1BQU0sUUFBUSxPQUFPLFNBQVMsSUFBSSxNQUFNLEdBQUc7QUFBQSxNQUNqRDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQ0EsUUFBSSxVQUFVO0FBRVosY0FBUSxNQUFNLHFDQUFxQyxRQUFRO0FBQUEsSUFDN0Q7QUFDQSxRQUFJLFFBQVE7QUFDVixrQkFBWSxPQUFPO0FBQUEsSUFDckI7QUFFQSxRQUFJLENBQUMsV0FBVztBQUNkLFlBQU0sRUFBRSxNQUFNLFNBQVMsT0FBTyxLQUFLLElBQUksTUFBTSxHQUFHLFlBQVksU0FBUztBQUNyRSxVQUFJLFFBQVEsQ0FBQyxTQUFTO0FBQ3BCLGdCQUFRLE1BQU0sdUNBQXVDLElBQUk7QUFDekQsZUFBTyxLQUFLLGNBQWMsS0FBSyxLQUFLLHFCQUFxQjtBQUFBLE1BQzNEO0FBQ0EsVUFBSTtBQUNKLFVBQUk7QUFDRixtQkFBVyx3QkFBd0IsUUFBUSxPQUFPO0FBQUEsTUFDcEQsU0FBUyxLQUFLO0FBR1osZ0JBQVEsTUFBTSxrQ0FBa0MsR0FBRztBQUNuRCxjQUFNLFNBQ0osZUFBZSxlQUFlLElBQUksVUFBVTtBQUM5QyxlQUFPLEtBQUssY0FBYyxLQUFLLEtBQUsscUNBQXFDO0FBQUEsVUFDdkUsTUFBTTtBQUFBLFVBQ047QUFBQSxRQUNGLENBQUM7QUFBQSxNQUNIO0FBQ0Esa0JBQVkseUJBQXlCLFNBQVMsR0FBRztBQWlCakQsVUFBSSxXQUFXO0FBQ2YsVUFBSTtBQUNGLGNBQU0sRUFBRSxPQUFPLFVBQVUsSUFBSSxNQUFNLEdBQUc7QUFBQSxVQUNwQztBQUFBLFVBQ0EsaUJBQWlCLFNBQVMsR0FBRztBQUFBLFFBQy9CO0FBQ0EsWUFBSSxXQUFXO0FBQ2IscUJBQVc7QUFDWCxrQkFBUSxNQUFNLHVDQUF1QyxTQUFTO0FBQUEsUUFDaEU7QUFBQSxNQUNGLFNBQVMsS0FBSztBQUNaLG1CQUFXO0FBQ1gsZ0JBQVEsTUFBTSxnQ0FBZ0MsR0FBRztBQUFBLE1BQ25EO0FBRUEsVUFBSSxVQUFVO0FBQ1osY0FBTSxFQUFFLE9BQU8sVUFBVSxJQUFJLE1BQU0sR0FBRyxZQUFZO0FBQUEsVUFDaEQsWUFBWTtBQUFBLFVBQ1osZUFBZTtBQUFBLFVBQ2YsZ0JBQWdCLFNBQVMsSUFBSTtBQUFBLFVBQzdCLFNBQVM7QUFBQSxRQUNYLENBQUM7QUFDRCxZQUFJLFdBQVc7QUFHYixrQkFBUSxNQUFNLHVDQUF1QyxTQUFTO0FBQUEsUUFDaEUsT0FBTztBQUdMLGdCQUFNLEVBQUUsT0FBTyxNQUFNLElBQUksTUFBTSxHQUFHO0FBQUEsWUFDaEM7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUNBLGNBQUksT0FBTztBQUNULG9CQUFRLE1BQU0seUNBQXlDLEtBQUs7QUFBQSxVQUM5RDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUVBLFVBQU0sU0FBUyxPQUFPLFVBQVUsS0FBSztBQUlyQyxVQUFNLFNBQVMsbUJBQW1CLFdBQVcsVUFBVSxXQUFXLE1BQU0sQ0FBQztBQUV6RSxXQUFPLElBQUk7QUFBQSxNQUNULEtBQUssVUFBVTtBQUFBLFFBQ2IsYUFBYTtBQUFBLFFBQ2IsYUFBYTtBQUFBLFFBQ2IsU0FBUztBQUFBLFVBQ1AsSUFBSTtBQUFBLFVBQ0osS0FBSyxJQUFJO0FBQUEsVUFDVCxnQkFBZ0IsT0FBTztBQUFBLFFBQ3pCO0FBQUEsUUFDQSxPQUFPLElBQUk7QUFBQSxRQUNYLFVBQVU7QUFBQSxNQUNaLENBQUM7QUFBQSxNQUNEO0FBQUEsUUFDRSxRQUFRO0FBQUEsUUFDUixTQUFTO0FBQUEsVUFDUCxHQUFHLEtBQUssWUFBWSxHQUFHO0FBQUEsVUFDdkIsZ0JBQWdCO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFJaEIsaUJBQWlCO0FBQUEsUUFDbkI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjsiLAogICJuYW1lcyI6IFsidXRpbCIsICJvYmplY3RVdGlsIiwgImVycm9yVXRpbCIsICJlcnJvck1hcCIsICJjdHgiLCAicmVzdWx0IiwgImlzc3VlcyIsICJlbGVtZW50cyIsICJwcm9jZXNzZWQiLCAicmVzdWx0IiwgInIiLCAiWm9kRmlyc3RQYXJ0eVR5cGVLaW5kIiwgInZpc2l0Il0KfQo=
