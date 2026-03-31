var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-xQ0DPc/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/pages-SHtVQz/functionsWorker-0.33427323613664994.mjs
var __create = Object.create;
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var __esm = /* @__PURE__ */ __name((fn, res) => /* @__PURE__ */ __name(function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
}, "__init"), "__esm");
var __commonJS = /* @__PURE__ */ __name((cb, mod) => /* @__PURE__ */ __name(function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
}, "__require"), "__commonJS");
var __copyProps = /* @__PURE__ */ __name((to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp2(to, key, { get: /* @__PURE__ */ __name(() => from[key], "get"), enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
}, "__copyProps");
var __toESM = /* @__PURE__ */ __name((mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target,
  mod
)), "__toESM");
function checkURL2(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls2.has(url.toString())) {
      urls2.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL2, "checkURL");
var urls2;
var init_checked_fetch = __esm({
  "../.wrangler/tmp/bundle-U0bSxL/checked-fetch.js"() {
    urls2 = /* @__PURE__ */ new Set();
    __name2(checkURL2, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL2(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});
async function onRequestPost(context) {
  const { request, env } = context;
  const user = context.data?.user;
  if (user?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const { userId } = await request.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400 });
    }
    await env.DB.batch([
      env.DB.prepare("DELETE FROM users WHERE id = ?").bind(userId)
      // Se esiste un record atleta con lo stesso zwid (estratto dal database prima della cancellazione)
      // lo eliminiamo qui. Altrimenti l'admin può farlo manualmente dalla lista atleti.
    ]);
    return new Response(JSON.stringify({ success: true, message: "Utente eliminato correttamente." }));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
__name(onRequestPost, "onRequestPost");
var init_delete_user = __esm({
  "api/admin/delete_user.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    __name2(onRequestPost, "onRequestPost");
  }
});
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0);
  const buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers) {
    buf.set(buffer, i);
    i += buffer.length;
  }
  return buf;
}
__name(concat, "concat");
function encode(string) {
  const bytes = new Uint8Array(string.length);
  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);
    if (code > 127) {
      throw new TypeError("non-ASCII string encountered in encode()");
    }
    bytes[i] = code;
  }
  return bytes;
}
__name(encode, "encode");
var encoder;
var decoder;
var MAX_INT32;
var init_buffer_utils = __esm({
  "../node_modules/jose/dist/webapi/lib/buffer_utils.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    encoder = new TextEncoder();
    decoder = new TextDecoder();
    MAX_INT32 = 2 ** 32;
    __name2(concat, "concat");
    __name2(encode, "encode");
  }
});
function encodeBase64(input) {
  if (Uint8Array.prototype.toBase64) {
    return input.toBase64();
  }
  const CHUNK_SIZE = 32768;
  const arr = [];
  for (let i = 0; i < input.length; i += CHUNK_SIZE) {
    arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)));
  }
  return btoa(arr.join(""));
}
__name(encodeBase64, "encodeBase64");
function decodeBase64(encoded) {
  if (Uint8Array.fromBase64) {
    return Uint8Array.fromBase64(encoded);
  }
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
__name(decodeBase64, "decodeBase64");
var init_base64 = __esm({
  "../node_modules/jose/dist/webapi/lib/base64.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    __name2(encodeBase64, "encodeBase64");
    __name2(decodeBase64, "decodeBase64");
  }
});
function decode(input) {
  if (Uint8Array.fromBase64) {
    return Uint8Array.fromBase64(typeof input === "string" ? input : decoder.decode(input), {
      alphabet: "base64url"
    });
  }
  let encoded = input;
  if (encoded instanceof Uint8Array) {
    encoded = decoder.decode(encoded);
  }
  encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return decodeBase64(encoded);
  } catch {
    throw new TypeError("The input to be decoded is not correctly encoded.");
  }
}
__name(decode, "decode");
function encode2(input) {
  let unencoded = input;
  if (typeof unencoded === "string") {
    unencoded = encoder.encode(unencoded);
  }
  if (Uint8Array.prototype.toBase64) {
    return unencoded.toBase64({ alphabet: "base64url", omitPadding: true });
  }
  return encodeBase64(unencoded).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
__name(encode2, "encode2");
var init_base64url = __esm({
  "../node_modules/jose/dist/webapi/util/base64url.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_buffer_utils();
    init_base64();
    __name2(decode, "decode");
    __name2(encode2, "encode");
  }
});
function getHashLength(hash2) {
  return parseInt(hash2.name.slice(4), 10);
}
__name(getHashLength, "getHashLength");
function checkHashLength(algorithm, expected) {
  const actual = getHashLength(algorithm.hash);
  if (actual !== expected)
    throw unusable(`SHA-${expected}`, "algorithm.hash");
}
__name(checkHashLength, "checkHashLength");
function getNamedCurve(alg) {
  switch (alg) {
    case "ES256":
      return "P-256";
    case "ES384":
      return "P-384";
    case "ES512":
      return "P-521";
    default:
      throw new Error("unreachable");
  }
}
__name(getNamedCurve, "getNamedCurve");
function checkUsage(key, usage) {
  if (usage && !key.usages.includes(usage)) {
    throw new TypeError(`CryptoKey does not support this operation, its usages must include ${usage}.`);
  }
}
__name(checkUsage, "checkUsage");
function checkSigCryptoKey(key, alg, usage) {
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512": {
      if (!isAlgorithm(key.algorithm, "HMAC"))
        throw unusable("HMAC");
      checkHashLength(key.algorithm, parseInt(alg.slice(2), 10));
      break;
    }
    case "RS256":
    case "RS384":
    case "RS512": {
      if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5"))
        throw unusable("RSASSA-PKCS1-v1_5");
      checkHashLength(key.algorithm, parseInt(alg.slice(2), 10));
      break;
    }
    case "PS256":
    case "PS384":
    case "PS512": {
      if (!isAlgorithm(key.algorithm, "RSA-PSS"))
        throw unusable("RSA-PSS");
      checkHashLength(key.algorithm, parseInt(alg.slice(2), 10));
      break;
    }
    case "Ed25519":
    case "EdDSA": {
      if (!isAlgorithm(key.algorithm, "Ed25519"))
        throw unusable("Ed25519");
      break;
    }
    case "ML-DSA-44":
    case "ML-DSA-65":
    case "ML-DSA-87": {
      if (!isAlgorithm(key.algorithm, alg))
        throw unusable(alg);
      break;
    }
    case "ES256":
    case "ES384":
    case "ES512": {
      if (!isAlgorithm(key.algorithm, "ECDSA"))
        throw unusable("ECDSA");
      const expected = getNamedCurve(alg);
      const actual = key.algorithm.namedCurve;
      if (actual !== expected)
        throw unusable(expected, "algorithm.namedCurve");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  checkUsage(key, usage);
}
__name(checkSigCryptoKey, "checkSigCryptoKey");
var unusable;
var isAlgorithm;
var init_crypto_key = __esm({
  "../node_modules/jose/dist/webapi/lib/crypto_key.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    unusable = /* @__PURE__ */ __name2((name, prop = "algorithm.name") => new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`), "unusable");
    isAlgorithm = /* @__PURE__ */ __name2((algorithm, name) => algorithm.name === name, "isAlgorithm");
    __name2(getHashLength, "getHashLength");
    __name2(checkHashLength, "checkHashLength");
    __name2(getNamedCurve, "getNamedCurve");
    __name2(checkUsage, "checkUsage");
    __name2(checkSigCryptoKey, "checkSigCryptoKey");
  }
});
function message(msg, actual, ...types) {
  types = types.filter(Boolean);
  if (types.length > 2) {
    const last = types.pop();
    msg += `one of type ${types.join(", ")}, or ${last}.`;
  } else if (types.length === 2) {
    msg += `one of type ${types[0]} or ${types[1]}.`;
  } else {
    msg += `of type ${types[0]}.`;
  }
  if (actual == null) {
    msg += ` Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += ` Received function ${actual.name}`;
  } else if (typeof actual === "object" && actual != null) {
    if (actual.constructor?.name) {
      msg += ` Received an instance of ${actual.constructor.name}`;
    }
  }
  return msg;
}
__name(message, "message");
var invalidKeyInput;
var withAlg;
var init_invalid_key_input = __esm({
  "../node_modules/jose/dist/webapi/lib/invalid_key_input.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    __name2(message, "message");
    invalidKeyInput = /* @__PURE__ */ __name2((actual, ...types) => message("Key must be ", actual, ...types), "invalidKeyInput");
    withAlg = /* @__PURE__ */ __name2((alg, actual, ...types) => message(`Key for the ${alg} algorithm must be `, actual, ...types), "withAlg");
  }
});
var JOSEError;
var JWTClaimValidationFailed;
var JWTExpired;
var JOSEAlgNotAllowed;
var JOSENotSupported;
var JWSInvalid;
var JWTInvalid;
var JWSSignatureVerificationFailed;
var init_errors = __esm({
  "../node_modules/jose/dist/webapi/util/errors.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    JOSEError = class extends Error {
      static {
        __name(this, "JOSEError");
      }
      static {
        __name2(this, "JOSEError");
      }
      static code = "ERR_JOSE_GENERIC";
      code = "ERR_JOSE_GENERIC";
      constructor(message2, options) {
        super(message2, options);
        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
      }
    };
    JWTClaimValidationFailed = class extends JOSEError {
      static {
        __name(this, "JWTClaimValidationFailed");
      }
      static {
        __name2(this, "JWTClaimValidationFailed");
      }
      static code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
      code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
      claim;
      reason;
      payload;
      constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
        super(message2, { cause: { claim, reason, payload } });
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
      }
    };
    JWTExpired = class extends JOSEError {
      static {
        __name(this, "JWTExpired");
      }
      static {
        __name2(this, "JWTExpired");
      }
      static code = "ERR_JWT_EXPIRED";
      code = "ERR_JWT_EXPIRED";
      claim;
      reason;
      payload;
      constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
        super(message2, { cause: { claim, reason, payload } });
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
      }
    };
    JOSEAlgNotAllowed = class extends JOSEError {
      static {
        __name(this, "JOSEAlgNotAllowed");
      }
      static {
        __name2(this, "JOSEAlgNotAllowed");
      }
      static code = "ERR_JOSE_ALG_NOT_ALLOWED";
      code = "ERR_JOSE_ALG_NOT_ALLOWED";
    };
    JOSENotSupported = class extends JOSEError {
      static {
        __name(this, "JOSENotSupported");
      }
      static {
        __name2(this, "JOSENotSupported");
      }
      static code = "ERR_JOSE_NOT_SUPPORTED";
      code = "ERR_JOSE_NOT_SUPPORTED";
    };
    JWSInvalid = class extends JOSEError {
      static {
        __name(this, "JWSInvalid");
      }
      static {
        __name2(this, "JWSInvalid");
      }
      static code = "ERR_JWS_INVALID";
      code = "ERR_JWS_INVALID";
    };
    JWTInvalid = class extends JOSEError {
      static {
        __name(this, "JWTInvalid");
      }
      static {
        __name2(this, "JWTInvalid");
      }
      static code = "ERR_JWT_INVALID";
      code = "ERR_JWT_INVALID";
    };
    JWSSignatureVerificationFailed = class extends JOSEError {
      static {
        __name(this, "JWSSignatureVerificationFailed");
      }
      static {
        __name2(this, "JWSSignatureVerificationFailed");
      }
      static code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
      code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
      constructor(message2 = "signature verification failed", options) {
        super(message2, options);
      }
    };
  }
});
var isCryptoKey;
var isKeyObject;
var isKeyLike;
var init_is_key_like = __esm({
  "../node_modules/jose/dist/webapi/lib/is_key_like.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    isCryptoKey = /* @__PURE__ */ __name2((key) => {
      if (key?.[Symbol.toStringTag] === "CryptoKey")
        return true;
      try {
        return key instanceof CryptoKey;
      } catch {
        return false;
      }
    }, "isCryptoKey");
    isKeyObject = /* @__PURE__ */ __name2((key) => key?.[Symbol.toStringTag] === "KeyObject", "isKeyObject");
    isKeyLike = /* @__PURE__ */ __name2((key) => isCryptoKey(key) || isKeyObject(key), "isKeyLike");
  }
});
function assertNotSet(value, name) {
  if (value) {
    throw new TypeError(`${name} can only be called once`);
  }
}
__name(assertNotSet, "assertNotSet");
function decodeBase64url(value, label, ErrorClass) {
  try {
    return decode(value);
  } catch {
    throw new ErrorClass(`Failed to base64url decode the ${label}`);
  }
}
__name(decodeBase64url, "decodeBase64url");
var unprotected;
var init_helpers = __esm({
  "../node_modules/jose/dist/webapi/lib/helpers.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_base64url();
    unprotected = Symbol();
    __name2(assertNotSet, "assertNotSet");
    __name2(decodeBase64url, "decodeBase64url");
  }
});
function isObject(input) {
  if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") {
    return false;
  }
  if (Object.getPrototypeOf(input) === null) {
    return true;
  }
  let proto = input;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(input) === proto;
}
__name(isObject, "isObject");
function isDisjoint(...headers) {
  const sources = headers.filter(Boolean);
  if (sources.length === 0 || sources.length === 1) {
    return true;
  }
  let acc;
  for (const header of sources) {
    const parameters = Object.keys(header);
    if (!acc || acc.size === 0) {
      acc = new Set(parameters);
      continue;
    }
    for (const parameter of parameters) {
      if (acc.has(parameter)) {
        return false;
      }
      acc.add(parameter);
    }
  }
  return true;
}
__name(isDisjoint, "isDisjoint");
var isObjectLike;
var isJWK;
var isPrivateJWK;
var isPublicJWK;
var isSecretJWK;
var init_type_checks = __esm({
  "../node_modules/jose/dist/webapi/lib/type_checks.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    isObjectLike = /* @__PURE__ */ __name2((value) => typeof value === "object" && value !== null, "isObjectLike");
    __name2(isObject, "isObject");
    __name2(isDisjoint, "isDisjoint");
    isJWK = /* @__PURE__ */ __name2((key) => isObject(key) && typeof key.kty === "string", "isJWK");
    isPrivateJWK = /* @__PURE__ */ __name2((key) => key.kty !== "oct" && (key.kty === "AKP" && typeof key.priv === "string" || typeof key.d === "string"), "isPrivateJWK");
    isPublicJWK = /* @__PURE__ */ __name2((key) => key.kty !== "oct" && key.d === void 0 && key.priv === void 0, "isPublicJWK");
    isSecretJWK = /* @__PURE__ */ __name2((key) => key.kty === "oct" && typeof key.k === "string", "isSecretJWK");
  }
});
function checkKeyLength(alg, key) {
  if (alg.startsWith("RS") || alg.startsWith("PS")) {
    const { modulusLength } = key.algorithm;
    if (typeof modulusLength !== "number" || modulusLength < 2048) {
      throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
    }
  }
}
__name(checkKeyLength, "checkKeyLength");
function subtleAlgorithm(alg, algorithm) {
  const hash2 = `SHA-${alg.slice(-3)}`;
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512":
      return { hash: hash2, name: "HMAC" };
    case "PS256":
    case "PS384":
    case "PS512":
      return { hash: hash2, name: "RSA-PSS", saltLength: parseInt(alg.slice(-3), 10) >> 3 };
    case "RS256":
    case "RS384":
    case "RS512":
      return { hash: hash2, name: "RSASSA-PKCS1-v1_5" };
    case "ES256":
    case "ES384":
    case "ES512":
      return { hash: hash2, name: "ECDSA", namedCurve: algorithm.namedCurve };
    case "Ed25519":
    case "EdDSA":
      return { name: "Ed25519" };
    case "ML-DSA-44":
    case "ML-DSA-65":
    case "ML-DSA-87":
      return { name: alg };
    default:
      throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  }
}
__name(subtleAlgorithm, "subtleAlgorithm");
async function getSigKey(alg, key, usage) {
  if (key instanceof Uint8Array) {
    if (!alg.startsWith("HS")) {
      throw new TypeError(invalidKeyInput(key, "CryptoKey", "KeyObject", "JSON Web Key"));
    }
    return crypto.subtle.importKey("raw", key, { hash: `SHA-${alg.slice(-3)}`, name: "HMAC" }, false, [usage]);
  }
  checkSigCryptoKey(key, alg, usage);
  return key;
}
__name(getSigKey, "getSigKey");
async function sign(alg, key, data) {
  const cryptoKey = await getSigKey(alg, key, "sign");
  checkKeyLength(alg, cryptoKey);
  const signature = await crypto.subtle.sign(subtleAlgorithm(alg, cryptoKey.algorithm), cryptoKey, data);
  return new Uint8Array(signature);
}
__name(sign, "sign");
async function verify(alg, key, signature, data) {
  const cryptoKey = await getSigKey(alg, key, "verify");
  checkKeyLength(alg, cryptoKey);
  const algorithm = subtleAlgorithm(alg, cryptoKey.algorithm);
  try {
    return await crypto.subtle.verify(algorithm, cryptoKey, signature, data);
  } catch {
    return false;
  }
}
__name(verify, "verify");
var init_signing = __esm({
  "../node_modules/jose/dist/webapi/lib/signing.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_errors();
    init_crypto_key();
    init_invalid_key_input();
    __name2(checkKeyLength, "checkKeyLength");
    __name2(subtleAlgorithm, "subtleAlgorithm");
    __name2(getSigKey, "getSigKey");
    __name2(sign, "sign");
    __name2(verify, "verify");
  }
});
function subtleMapping(jwk) {
  let algorithm;
  let keyUsages;
  switch (jwk.kty) {
    case "AKP": {
      switch (jwk.alg) {
        case "ML-DSA-44":
        case "ML-DSA-65":
        case "ML-DSA-87":
          algorithm = { name: jwk.alg };
          keyUsages = jwk.priv ? ["sign"] : ["verify"];
          break;
        default:
          throw new JOSENotSupported(unsupportedAlg);
      }
      break;
    }
    case "RSA": {
      switch (jwk.alg) {
        case "PS256":
        case "PS384":
        case "PS512":
          algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RS256":
        case "RS384":
        case "RS512":
          algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RSA-OAEP":
        case "RSA-OAEP-256":
        case "RSA-OAEP-384":
        case "RSA-OAEP-512":
          algorithm = {
            name: "RSA-OAEP",
            hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
          };
          keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
          break;
        default:
          throw new JOSENotSupported(unsupportedAlg);
      }
      break;
    }
    case "EC": {
      switch (jwk.alg) {
        case "ES256":
        case "ES384":
        case "ES512":
          algorithm = {
            name: "ECDSA",
            namedCurve: { ES256: "P-256", ES384: "P-384", ES512: "P-521" }[jwk.alg]
          };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: "ECDH", namedCurve: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported(unsupportedAlg);
      }
      break;
    }
    case "OKP": {
      switch (jwk.alg) {
        case "Ed25519":
        case "EdDSA":
          algorithm = { name: "Ed25519" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported(unsupportedAlg);
      }
      break;
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
  }
  return { algorithm, keyUsages };
}
__name(subtleMapping, "subtleMapping");
async function jwkToKey(jwk) {
  if (!jwk.alg) {
    throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
  }
  const { algorithm, keyUsages } = subtleMapping(jwk);
  const keyData = { ...jwk };
  if (keyData.kty !== "AKP") {
    delete keyData.alg;
  }
  delete keyData.use;
  return crypto.subtle.importKey("jwk", keyData, algorithm, jwk.ext ?? (jwk.d || jwk.priv ? false : true), jwk.key_ops ?? keyUsages);
}
__name(jwkToKey, "jwkToKey");
var unsupportedAlg;
var init_jwk_to_key = __esm({
  "../node_modules/jose/dist/webapi/lib/jwk_to_key.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_errors();
    unsupportedAlg = 'Invalid or unsupported JWK "alg" (Algorithm) Parameter value';
    __name2(subtleMapping, "subtleMapping");
    __name2(jwkToKey, "jwkToKey");
  }
});
async function normalizeKey(key, alg) {
  if (key instanceof Uint8Array) {
    return key;
  }
  if (isCryptoKey(key)) {
    return key;
  }
  if (isKeyObject(key)) {
    if (key.type === "secret") {
      return key.export();
    }
    if ("toCryptoKey" in key && typeof key.toCryptoKey === "function") {
      try {
        return handleKeyObject(key, alg);
      } catch (err) {
        if (err instanceof TypeError) {
          throw err;
        }
      }
    }
    let jwk = key.export({ format: "jwk" });
    return handleJWK(key, jwk, alg);
  }
  if (isJWK(key)) {
    if (key.k) {
      return decode(key.k);
    }
    return handleJWK(key, key, alg, true);
  }
  throw new Error("unreachable");
}
__name(normalizeKey, "normalizeKey");
var unusableForAlg;
var cache;
var handleJWK;
var handleKeyObject;
var init_normalize_key = __esm({
  "../node_modules/jose/dist/webapi/lib/normalize_key.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_type_checks();
    init_base64url();
    init_jwk_to_key();
    init_is_key_like();
    unusableForAlg = "given KeyObject instance cannot be used for this algorithm";
    handleJWK = /* @__PURE__ */ __name2(async (key, jwk, alg, freeze = false) => {
      cache ||= /* @__PURE__ */ new WeakMap();
      let cached = cache.get(key);
      if (cached?.[alg]) {
        return cached[alg];
      }
      const cryptoKey = await jwkToKey({ ...jwk, alg });
      if (freeze)
        Object.freeze(key);
      if (!cached) {
        cache.set(key, { [alg]: cryptoKey });
      } else {
        cached[alg] = cryptoKey;
      }
      return cryptoKey;
    }, "handleJWK");
    handleKeyObject = /* @__PURE__ */ __name2((keyObject, alg) => {
      cache ||= /* @__PURE__ */ new WeakMap();
      let cached = cache.get(keyObject);
      if (cached?.[alg]) {
        return cached[alg];
      }
      const isPublic = keyObject.type === "public";
      const extractable = isPublic ? true : false;
      let cryptoKey;
      if (keyObject.asymmetricKeyType === "x25519") {
        switch (alg) {
          case "ECDH-ES":
          case "ECDH-ES+A128KW":
          case "ECDH-ES+A192KW":
          case "ECDH-ES+A256KW":
            break;
          default:
            throw new TypeError(unusableForAlg);
        }
        cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, isPublic ? [] : ["deriveBits"]);
      }
      if (keyObject.asymmetricKeyType === "ed25519") {
        if (alg !== "EdDSA" && alg !== "Ed25519") {
          throw new TypeError(unusableForAlg);
        }
        cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, [
          isPublic ? "verify" : "sign"
        ]);
      }
      switch (keyObject.asymmetricKeyType) {
        case "ml-dsa-44":
        case "ml-dsa-65":
        case "ml-dsa-87": {
          if (alg !== keyObject.asymmetricKeyType.toUpperCase()) {
            throw new TypeError(unusableForAlg);
          }
          cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, [
            isPublic ? "verify" : "sign"
          ]);
        }
      }
      if (keyObject.asymmetricKeyType === "rsa") {
        let hash2;
        switch (alg) {
          case "RSA-OAEP":
            hash2 = "SHA-1";
            break;
          case "RS256":
          case "PS256":
          case "RSA-OAEP-256":
            hash2 = "SHA-256";
            break;
          case "RS384":
          case "PS384":
          case "RSA-OAEP-384":
            hash2 = "SHA-384";
            break;
          case "RS512":
          case "PS512":
          case "RSA-OAEP-512":
            hash2 = "SHA-512";
            break;
          default:
            throw new TypeError(unusableForAlg);
        }
        if (alg.startsWith("RSA-OAEP")) {
          return keyObject.toCryptoKey({
            name: "RSA-OAEP",
            hash: hash2
          }, extractable, isPublic ? ["encrypt"] : ["decrypt"]);
        }
        cryptoKey = keyObject.toCryptoKey({
          name: alg.startsWith("PS") ? "RSA-PSS" : "RSASSA-PKCS1-v1_5",
          hash: hash2
        }, extractable, [isPublic ? "verify" : "sign"]);
      }
      if (keyObject.asymmetricKeyType === "ec") {
        const nist = /* @__PURE__ */ new Map([
          ["prime256v1", "P-256"],
          ["secp384r1", "P-384"],
          ["secp521r1", "P-521"]
        ]);
        const namedCurve = nist.get(keyObject.asymmetricKeyDetails?.namedCurve);
        if (!namedCurve) {
          throw new TypeError(unusableForAlg);
        }
        const expectedCurve = { ES256: "P-256", ES384: "P-384", ES512: "P-521" };
        if (expectedCurve[alg] && namedCurve === expectedCurve[alg]) {
          cryptoKey = keyObject.toCryptoKey({
            name: "ECDSA",
            namedCurve
          }, extractable, [isPublic ? "verify" : "sign"]);
        }
        if (alg.startsWith("ECDH-ES")) {
          cryptoKey = keyObject.toCryptoKey({
            name: "ECDH",
            namedCurve
          }, extractable, isPublic ? [] : ["deriveBits"]);
        }
      }
      if (!cryptoKey) {
        throw new TypeError(unusableForAlg);
      }
      if (!cached) {
        cache.set(keyObject, { [alg]: cryptoKey });
      } else {
        cached[alg] = cryptoKey;
      }
      return cryptoKey;
    }, "handleKeyObject");
    __name2(normalizeKey, "normalizeKey");
  }
});
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  }
  if (!protectedHeader || protectedHeader.crit === void 0) {
    return /* @__PURE__ */ new Set();
  }
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  }
  let recognized;
  if (recognizedOption !== void 0) {
    recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
  } else {
    recognized = recognizedDefault;
  }
  for (const parameter of protectedHeader.crit) {
    if (!recognized.has(parameter)) {
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    }
    if (joseHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    }
    if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
    }
  }
  return new Set(protectedHeader.crit);
}
__name(validateCrit, "validateCrit");
var init_validate_crit = __esm({
  "../node_modules/jose/dist/webapi/lib/validate_crit.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_errors();
    __name2(validateCrit, "validateCrit");
  }
});
function validateAlgorithms(option, algorithms) {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== "string"))) {
    throw new TypeError(`"${option}" option must be an array of strings`);
  }
  if (!algorithms) {
    return void 0;
  }
  return new Set(algorithms);
}
__name(validateAlgorithms, "validateAlgorithms");
var init_validate_algorithms = __esm({
  "../node_modules/jose/dist/webapi/lib/validate_algorithms.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    __name2(validateAlgorithms, "validateAlgorithms");
  }
});
function checkKeyType(alg, key, usage) {
  switch (alg.substring(0, 2)) {
    case "A1":
    case "A2":
    case "di":
    case "HS":
    case "PB":
      symmetricTypeCheck(alg, key, usage);
      break;
    default:
      asymmetricTypeCheck(alg, key, usage);
  }
}
__name(checkKeyType, "checkKeyType");
var tag;
var jwkMatchesOp;
var symmetricTypeCheck;
var asymmetricTypeCheck;
var init_check_key_type = __esm({
  "../node_modules/jose/dist/webapi/lib/check_key_type.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_invalid_key_input();
    init_is_key_like();
    init_type_checks();
    tag = /* @__PURE__ */ __name2((key) => key?.[Symbol.toStringTag], "tag");
    jwkMatchesOp = /* @__PURE__ */ __name2((alg, key, usage) => {
      if (key.use !== void 0) {
        let expected;
        switch (usage) {
          case "sign":
          case "verify":
            expected = "sig";
            break;
          case "encrypt":
          case "decrypt":
            expected = "enc";
            break;
        }
        if (key.use !== expected) {
          throw new TypeError(`Invalid key for this operation, its "use" must be "${expected}" when present`);
        }
      }
      if (key.alg !== void 0 && key.alg !== alg) {
        throw new TypeError(`Invalid key for this operation, its "alg" must be "${alg}" when present`);
      }
      if (Array.isArray(key.key_ops)) {
        let expectedKeyOp;
        switch (true) {
          case (usage === "sign" || usage === "verify"):
          case alg === "dir":
          case alg.includes("CBC-HS"):
            expectedKeyOp = usage;
            break;
          case alg.startsWith("PBES2"):
            expectedKeyOp = "deriveBits";
            break;
          case /^A\d{3}(?:GCM)?(?:KW)?$/.test(alg):
            if (!alg.includes("GCM") && alg.endsWith("KW")) {
              expectedKeyOp = usage === "encrypt" ? "wrapKey" : "unwrapKey";
            } else {
              expectedKeyOp = usage;
            }
            break;
          case (usage === "encrypt" && alg.startsWith("RSA")):
            expectedKeyOp = "wrapKey";
            break;
          case usage === "decrypt":
            expectedKeyOp = alg.startsWith("RSA") ? "unwrapKey" : "deriveBits";
            break;
        }
        if (expectedKeyOp && key.key_ops?.includes?.(expectedKeyOp) === false) {
          throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${expectedKeyOp}" when present`);
        }
      }
      return true;
    }, "jwkMatchesOp");
    symmetricTypeCheck = /* @__PURE__ */ __name2((alg, key, usage) => {
      if (key instanceof Uint8Array)
        return;
      if (isJWK(key)) {
        if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
      }
      if (!isKeyLike(key)) {
        throw new TypeError(withAlg(alg, key, "CryptoKey", "KeyObject", "JSON Web Key", "Uint8Array"));
      }
      if (key.type !== "secret") {
        throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
      }
    }, "symmetricTypeCheck");
    asymmetricTypeCheck = /* @__PURE__ */ __name2((alg, key, usage) => {
      if (isJWK(key)) {
        switch (usage) {
          case "decrypt":
          case "sign":
            if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage))
              return;
            throw new TypeError(`JSON Web Key for this operation must be a private JWK`);
          case "encrypt":
          case "verify":
            if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage))
              return;
            throw new TypeError(`JSON Web Key for this operation must be a public JWK`);
        }
      }
      if (!isKeyLike(key)) {
        throw new TypeError(withAlg(alg, key, "CryptoKey", "KeyObject", "JSON Web Key"));
      }
      if (key.type === "secret") {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
      }
      if (key.type === "public") {
        switch (usage) {
          case "sign":
            throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
          case "decrypt":
            throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
        }
      }
      if (key.type === "private") {
        switch (usage) {
          case "verify":
            throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
          case "encrypt":
            throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
        }
      }
    }, "asymmetricTypeCheck");
    __name2(checkKeyType, "checkKeyType");
  }
});
async function flattenedVerify(jws, key, options) {
  if (!isObject(jws)) {
    throw new JWSInvalid("Flattened JWS must be an object");
  }
  if (jws.protected === void 0 && jws.header === void 0) {
    throw new JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
  }
  if (jws.protected !== void 0 && typeof jws.protected !== "string") {
    throw new JWSInvalid("JWS Protected Header incorrect type");
  }
  if (jws.payload === void 0) {
    throw new JWSInvalid("JWS Payload missing");
  }
  if (typeof jws.signature !== "string") {
    throw new JWSInvalid("JWS Signature missing or incorrect type");
  }
  if (jws.header !== void 0 && !isObject(jws.header)) {
    throw new JWSInvalid("JWS Unprotected Header incorrect type");
  }
  let parsedProt = {};
  if (jws.protected) {
    try {
      const protectedHeader = decode(jws.protected);
      parsedProt = JSON.parse(decoder.decode(protectedHeader));
    } catch {
      throw new JWSInvalid("JWS Protected Header is invalid");
    }
  }
  if (!isDisjoint(parsedProt, jws.header)) {
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  }
  const joseHeader = {
    ...parsedProt,
    ...jws.header
  };
  const extensions = validateCrit(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, parsedProt, joseHeader);
  let b64 = true;
  if (extensions.has("b64")) {
    b64 = parsedProt.b64;
    if (typeof b64 !== "boolean") {
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    }
  }
  const { alg } = joseHeader;
  if (typeof alg !== "string" || !alg) {
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  }
  const algorithms = options && validateAlgorithms("algorithms", options.algorithms);
  if (algorithms && !algorithms.has(alg)) {
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  }
  if (b64) {
    if (typeof jws.payload !== "string") {
      throw new JWSInvalid("JWS Payload must be a string");
    }
  } else if (typeof jws.payload !== "string" && !(jws.payload instanceof Uint8Array)) {
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  }
  let resolvedKey = false;
  if (typeof key === "function") {
    key = await key(parsedProt, jws);
    resolvedKey = true;
  }
  checkKeyType(alg, key, "verify");
  const data = concat(jws.protected !== void 0 ? encode(jws.protected) : new Uint8Array(), encode("."), typeof jws.payload === "string" ? b64 ? encode(jws.payload) : encoder.encode(jws.payload) : jws.payload);
  const signature = decodeBase64url(jws.signature, "signature", JWSInvalid);
  const k = await normalizeKey(key, alg);
  const verified = await verify(alg, k, signature, data);
  if (!verified) {
    throw new JWSSignatureVerificationFailed();
  }
  let payload;
  if (b64) {
    payload = decodeBase64url(jws.payload, "payload", JWSInvalid);
  } else if (typeof jws.payload === "string") {
    payload = encoder.encode(jws.payload);
  } else {
    payload = jws.payload;
  }
  const result = { payload };
  if (jws.protected !== void 0) {
    result.protectedHeader = parsedProt;
  }
  if (jws.header !== void 0) {
    result.unprotectedHeader = jws.header;
  }
  if (resolvedKey) {
    return { ...result, key: k };
  }
  return result;
}
__name(flattenedVerify, "flattenedVerify");
var init_verify = __esm({
  "../node_modules/jose/dist/webapi/jws/flattened/verify.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_base64url();
    init_signing();
    init_errors();
    init_buffer_utils();
    init_helpers();
    init_type_checks();
    init_type_checks();
    init_check_key_type();
    init_validate_crit();
    init_validate_algorithms();
    init_normalize_key();
    __name2(flattenedVerify, "flattenedVerify");
  }
});
async function compactVerify(jws, key, options) {
  if (jws instanceof Uint8Array) {
    jws = decoder.decode(jws);
  }
  if (typeof jws !== "string") {
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  }
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3) {
    throw new JWSInvalid("Invalid Compact JWS");
  }
  const verified = await flattenedVerify({ payload, protected: protectedHeader, signature }, key, options);
  const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
__name(compactVerify, "compactVerify");
var init_verify2 = __esm({
  "../node_modules/jose/dist/webapi/jws/compact/verify.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_verify();
    init_errors();
    init_buffer_utils();
    __name2(compactVerify, "compactVerify");
  }
});
function secs(str) {
  const matched = REGEX.exec(str);
  if (!matched || matched[4] && matched[1]) {
    throw new TypeError("Invalid time period format");
  }
  const value = parseFloat(matched[2]);
  const unit = matched[3].toLowerCase();
  let numericDate;
  switch (unit) {
    case "sec":
    case "secs":
    case "second":
    case "seconds":
    case "s":
      numericDate = Math.round(value);
      break;
    case "minute":
    case "minutes":
    case "min":
    case "mins":
    case "m":
      numericDate = Math.round(value * minute);
      break;
    case "hour":
    case "hours":
    case "hr":
    case "hrs":
    case "h":
      numericDate = Math.round(value * hour);
      break;
    case "day":
    case "days":
    case "d":
      numericDate = Math.round(value * day);
      break;
    case "week":
    case "weeks":
    case "w":
      numericDate = Math.round(value * week);
      break;
    default:
      numericDate = Math.round(value * year);
      break;
  }
  if (matched[1] === "-" || matched[4] === "ago") {
    return -numericDate;
  }
  return numericDate;
}
__name(secs, "secs");
function validateInput(label, input) {
  if (!Number.isFinite(input)) {
    throw new TypeError(`Invalid ${label} input`);
  }
  return input;
}
__name(validateInput, "validateInput");
function validateClaimsSet(protectedHeader, encodedPayload, options = {}) {
  let payload;
  try {
    payload = JSON.parse(decoder.decode(encodedPayload));
  } catch {
  }
  if (!isObject(payload)) {
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  }
  const { typ } = options;
  if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", "check_failed");
  }
  const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
  const presenceCheck = [...requiredClaims];
  if (maxTokenAge !== void 0)
    presenceCheck.push("iat");
  if (audience !== void 0)
    presenceCheck.push("aud");
  if (subject !== void 0)
    presenceCheck.push("sub");
  if (issuer !== void 0)
    presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse())) {
    if (!(claim in payload)) {
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
    }
  }
  if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
    throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, "iss", "check_failed");
  }
  if (subject && payload.sub !== subject) {
    throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, "sub", "check_failed");
  }
  if (audience && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) {
    throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, "aud", "check_failed");
  }
  let tolerance;
  switch (typeof options.clockTolerance) {
    case "string":
      tolerance = secs(options.clockTolerance);
      break;
    case "number":
      tolerance = options.clockTolerance;
      break;
    case "undefined":
      tolerance = 0;
      break;
    default:
      throw new TypeError("Invalid clockTolerance option type");
  }
  const { currentDate } = options;
  const now = epoch(currentDate || /* @__PURE__ */ new Date());
  if ((payload.iat !== void 0 || maxTokenAge) && typeof payload.iat !== "number") {
    throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, "iat", "invalid");
  }
  if (payload.nbf !== void 0) {
    if (typeof payload.nbf !== "number") {
      throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, "nbf", "invalid");
    }
    if (payload.nbf > now + tolerance) {
      throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", "check_failed");
    }
  }
  if (payload.exp !== void 0) {
    if (typeof payload.exp !== "number") {
      throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, "exp", "invalid");
    }
    if (payload.exp <= now - tolerance) {
      throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", "check_failed");
    }
  }
  if (maxTokenAge) {
    const age = now - payload.iat;
    const max = typeof maxTokenAge === "number" ? maxTokenAge : secs(maxTokenAge);
    if (age - tolerance > max) {
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", "check_failed");
    }
    if (age < 0 - tolerance) {
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", "check_failed");
    }
  }
  return payload;
}
__name(validateClaimsSet, "validateClaimsSet");
var epoch;
var minute;
var hour;
var day;
var week;
var year;
var REGEX;
var normalizeTyp;
var checkAudiencePresence;
var JWTClaimsBuilder;
var init_jwt_claims_set = __esm({
  "../node_modules/jose/dist/webapi/lib/jwt_claims_set.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_errors();
    init_buffer_utils();
    init_type_checks();
    epoch = /* @__PURE__ */ __name2((date) => Math.floor(date.getTime() / 1e3), "epoch");
    minute = 60;
    hour = minute * 60;
    day = hour * 24;
    week = day * 7;
    year = day * 365.25;
    REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
    __name2(secs, "secs");
    __name2(validateInput, "validateInput");
    normalizeTyp = /* @__PURE__ */ __name2((value) => {
      if (value.includes("/")) {
        return value.toLowerCase();
      }
      return `application/${value.toLowerCase()}`;
    }, "normalizeTyp");
    checkAudiencePresence = /* @__PURE__ */ __name2((audPayload, audOption) => {
      if (typeof audPayload === "string") {
        return audOption.includes(audPayload);
      }
      if (Array.isArray(audPayload)) {
        return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
      }
      return false;
    }, "checkAudiencePresence");
    __name2(validateClaimsSet, "validateClaimsSet");
    JWTClaimsBuilder = class {
      static {
        __name(this, "JWTClaimsBuilder");
      }
      static {
        __name2(this, "JWTClaimsBuilder");
      }
      #payload;
      constructor(payload) {
        if (!isObject(payload)) {
          throw new TypeError("JWT Claims Set MUST be an object");
        }
        this.#payload = structuredClone(payload);
      }
      data() {
        return encoder.encode(JSON.stringify(this.#payload));
      }
      get iss() {
        return this.#payload.iss;
      }
      set iss(value) {
        this.#payload.iss = value;
      }
      get sub() {
        return this.#payload.sub;
      }
      set sub(value) {
        this.#payload.sub = value;
      }
      get aud() {
        return this.#payload.aud;
      }
      set aud(value) {
        this.#payload.aud = value;
      }
      set jti(value) {
        this.#payload.jti = value;
      }
      set nbf(value) {
        if (typeof value === "number") {
          this.#payload.nbf = validateInput("setNotBefore", value);
        } else if (value instanceof Date) {
          this.#payload.nbf = validateInput("setNotBefore", epoch(value));
        } else {
          this.#payload.nbf = epoch(/* @__PURE__ */ new Date()) + secs(value);
        }
      }
      set exp(value) {
        if (typeof value === "number") {
          this.#payload.exp = validateInput("setExpirationTime", value);
        } else if (value instanceof Date) {
          this.#payload.exp = validateInput("setExpirationTime", epoch(value));
        } else {
          this.#payload.exp = epoch(/* @__PURE__ */ new Date()) + secs(value);
        }
      }
      set iat(value) {
        if (value === void 0) {
          this.#payload.iat = epoch(/* @__PURE__ */ new Date());
        } else if (value instanceof Date) {
          this.#payload.iat = validateInput("setIssuedAt", epoch(value));
        } else if (typeof value === "string") {
          this.#payload.iat = validateInput("setIssuedAt", epoch(/* @__PURE__ */ new Date()) + secs(value));
        } else {
          this.#payload.iat = validateInput("setIssuedAt", value);
        }
      }
    };
  }
});
async function jwtVerify(jwt, key, options) {
  const verified = await compactVerify(jwt, key, options);
  if (verified.protectedHeader.crit?.includes("b64") && verified.protectedHeader.b64 === false) {
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  }
  const payload = validateClaimsSet(verified.protectedHeader, verified.payload, options);
  const result = { payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
__name(jwtVerify, "jwtVerify");
var init_verify3 = __esm({
  "../node_modules/jose/dist/webapi/jwt/verify.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_verify2();
    init_jwt_claims_set();
    init_errors();
    __name2(jwtVerify, "jwtVerify");
  }
});
var FlattenedSign;
var init_sign = __esm({
  "../node_modules/jose/dist/webapi/jws/flattened/sign.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_base64url();
    init_signing();
    init_type_checks();
    init_errors();
    init_buffer_utils();
    init_check_key_type();
    init_validate_crit();
    init_normalize_key();
    init_helpers();
    FlattenedSign = class {
      static {
        __name(this, "FlattenedSign");
      }
      static {
        __name2(this, "FlattenedSign");
      }
      #payload;
      #protectedHeader;
      #unprotectedHeader;
      constructor(payload) {
        if (!(payload instanceof Uint8Array)) {
          throw new TypeError("payload must be an instance of Uint8Array");
        }
        this.#payload = payload;
      }
      setProtectedHeader(protectedHeader) {
        assertNotSet(this.#protectedHeader, "setProtectedHeader");
        this.#protectedHeader = protectedHeader;
        return this;
      }
      setUnprotectedHeader(unprotectedHeader) {
        assertNotSet(this.#unprotectedHeader, "setUnprotectedHeader");
        this.#unprotectedHeader = unprotectedHeader;
        return this;
      }
      async sign(key, options) {
        if (!this.#protectedHeader && !this.#unprotectedHeader) {
          throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
        }
        if (!isDisjoint(this.#protectedHeader, this.#unprotectedHeader)) {
          throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
        }
        const joseHeader = {
          ...this.#protectedHeader,
          ...this.#unprotectedHeader
        };
        const extensions = validateCrit(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, this.#protectedHeader, joseHeader);
        let b64 = true;
        if (extensions.has("b64")) {
          b64 = this.#protectedHeader.b64;
          if (typeof b64 !== "boolean") {
            throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
          }
        }
        const { alg } = joseHeader;
        if (typeof alg !== "string" || !alg) {
          throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
        }
        checkKeyType(alg, key, "sign");
        let payloadS;
        let payloadB;
        if (b64) {
          payloadS = encode2(this.#payload);
          payloadB = encode(payloadS);
        } else {
          payloadB = this.#payload;
          payloadS = "";
        }
        let protectedHeaderString;
        let protectedHeaderBytes;
        if (this.#protectedHeader) {
          protectedHeaderString = encode2(JSON.stringify(this.#protectedHeader));
          protectedHeaderBytes = encode(protectedHeaderString);
        } else {
          protectedHeaderString = "";
          protectedHeaderBytes = new Uint8Array();
        }
        const data = concat(protectedHeaderBytes, encode("."), payloadB);
        const k = await normalizeKey(key, alg);
        const signature = await sign(alg, k, data);
        const jws = {
          signature: encode2(signature),
          payload: payloadS
        };
        if (this.#unprotectedHeader) {
          jws.header = this.#unprotectedHeader;
        }
        if (this.#protectedHeader) {
          jws.protected = protectedHeaderString;
        }
        return jws;
      }
    };
  }
});
var CompactSign;
var init_sign2 = __esm({
  "../node_modules/jose/dist/webapi/jws/compact/sign.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_sign();
    CompactSign = class {
      static {
        __name(this, "CompactSign");
      }
      static {
        __name2(this, "CompactSign");
      }
      #flattened;
      constructor(payload) {
        this.#flattened = new FlattenedSign(payload);
      }
      setProtectedHeader(protectedHeader) {
        this.#flattened.setProtectedHeader(protectedHeader);
        return this;
      }
      async sign(key, options) {
        const jws = await this.#flattened.sign(key, options);
        if (jws.payload === void 0) {
          throw new TypeError("use the flattened module for creating JWS with b64: false");
        }
        return `${jws.protected}.${jws.payload}.${jws.signature}`;
      }
    };
  }
});
var SignJWT;
var init_sign3 = __esm({
  "../node_modules/jose/dist/webapi/jwt/sign.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_sign2();
    init_errors();
    init_jwt_claims_set();
    SignJWT = class {
      static {
        __name(this, "SignJWT");
      }
      static {
        __name2(this, "SignJWT");
      }
      #protectedHeader;
      #jwt;
      constructor(payload = {}) {
        this.#jwt = new JWTClaimsBuilder(payload);
      }
      setIssuer(issuer) {
        this.#jwt.iss = issuer;
        return this;
      }
      setSubject(subject) {
        this.#jwt.sub = subject;
        return this;
      }
      setAudience(audience) {
        this.#jwt.aud = audience;
        return this;
      }
      setJti(jwtId) {
        this.#jwt.jti = jwtId;
        return this;
      }
      setNotBefore(input) {
        this.#jwt.nbf = input;
        return this;
      }
      setExpirationTime(input) {
        this.#jwt.exp = input;
        return this;
      }
      setIssuedAt(input) {
        this.#jwt.iat = input;
        return this;
      }
      setProtectedHeader(protectedHeader) {
        this.#protectedHeader = protectedHeader;
        return this;
      }
      async sign(key, options) {
        const sig = new CompactSign(this.#jwt.data());
        sig.setProtectedHeader(this.#protectedHeader);
        if (Array.isArray(this.#protectedHeader?.crit) && this.#protectedHeader.crit.includes("b64") && this.#protectedHeader.b64 === false) {
          throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
        }
        return sig.sign(key, options);
      }
    };
  }
});
var init_webapi = __esm({
  "../node_modules/jose/dist/webapi/index.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_verify3();
    init_sign3();
  }
});
async function onRequestGet({ request, env }) {
  if (!env.DB || !env.JWT_SECRET) {
    return new Response(JSON.stringify({ message: "Server configuration error." }), { status: 500 });
  }
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ message: "Non autorizzato." }), { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "admin") {
      return new Response(JSON.stringify({ message: "Permessi insufficienti." }), { status: 403 });
    }
    const { results } = await env.DB.prepare(
      "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC"
    ).all();
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Admin List Users Error:", error);
    return new Response(JSON.stringify({ message: "Errore durante il recupero utenti." }), { status: 500 });
  }
}
__name(onRequestGet, "onRequestGet");
var init_list_users = __esm({
  "api/admin/list_users.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_webapi();
    __name2(onRequestGet, "onRequestGet");
  }
});
async function onRequestPost2({ request, env }) {
  if (!env.DB || !env.JWT_SECRET) {
    return new Response(JSON.stringify({ message: "Server configuration error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ message: "Non autorizzato." }), { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "admin") {
      return new Response(JSON.stringify({ message: "Permessi insufficienti." }), { status: 403 });
    }
    const { userId, newRole } = await request.json();
    const validRoles = ["admin", "captain", "athlete", "moderator"];
    if (!validRoles.includes(newRole)) {
      return new Response(JSON.stringify({ message: "Ruolo non valido." }), { status: 400 });
    }
    await env.DB.prepare(
      "UPDATE users SET role = ? WHERE id = ?"
    ).bind(newRole, userId).run();
    return new Response(JSON.stringify({ message: "Ruolo aggiornato con successo." }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Admin Update Role Error:", error);
    return new Response(JSON.stringify({ message: "Errore durante l'aggiornamento ruolo." }), { status: 500 });
  }
}
__name(onRequestPost2, "onRequestPost2");
var init_update_role = __esm({
  "api/admin/update_role.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_webapi();
    __name2(onRequestPost2, "onRequestPost");
  }
});
var require_crypto = __commonJS({
  "(disabled):crypto"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
  }
});
function randomBytes(len) {
  try {
    return crypto.getRandomValues(new Uint8Array(len));
  } catch {
  }
  try {
    return import_crypto.default.randomBytes(len);
  } catch {
  }
  if (!randomFallback) {
    throw Error(
      "Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative"
    );
  }
  return randomFallback(len);
}
__name(randomBytes, "randomBytes");
function setRandomFallback(random) {
  randomFallback = random;
}
__name(setRandomFallback, "setRandomFallback");
function genSaltSync(rounds, seed_length) {
  rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof rounds !== "number")
    throw Error(
      "Illegal arguments: " + typeof rounds + ", " + typeof seed_length
    );
  if (rounds < 4) rounds = 4;
  else if (rounds > 31) rounds = 31;
  var salt = [];
  salt.push("$2b$");
  if (rounds < 10) salt.push("0");
  salt.push(rounds.toString());
  salt.push("$");
  salt.push(base64_encode(randomBytes(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
  return salt.join("");
}
__name(genSaltSync, "genSaltSync");
function genSalt(rounds, seed_length, callback) {
  if (typeof seed_length === "function")
    callback = seed_length, seed_length = void 0;
  if (typeof rounds === "function") callback = rounds, rounds = void 0;
  if (typeof rounds === "undefined") rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
  else if (typeof rounds !== "number")
    throw Error("illegal arguments: " + typeof rounds);
  function _async(callback2) {
    nextTick(function() {
      try {
        callback2(null, genSaltSync(rounds));
      } catch (err) {
        callback2(err);
      }
    });
  }
  __name(_async, "_async");
  __name2(_async, "_async");
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
__name(genSalt, "genSalt");
function hashSync(password, salt) {
  if (typeof salt === "undefined") salt = GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof salt === "number") salt = genSaltSync(salt);
  if (typeof password !== "string" || typeof salt !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof salt);
  return _hash(password, salt);
}
__name(hashSync, "hashSync");
function hash(password, salt, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password === "string" && typeof salt === "number")
      genSalt(salt, function(err, salt2) {
        _hash(password, salt2, callback2, progressCallback);
      });
    else if (typeof password === "string" && typeof salt === "string")
      _hash(password, salt, callback2, progressCallback);
    else
      nextTick(
        callback2.bind(
          this,
          Error("Illegal arguments: " + typeof password + ", " + typeof salt)
        )
      );
  }
  __name(_async, "_async");
  __name2(_async, "_async");
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
__name(hash, "hash");
function safeStringCompare(known, unknown) {
  var diff = known.length ^ unknown.length;
  for (var i = 0; i < known.length; ++i) {
    diff |= known.charCodeAt(i) ^ unknown.charCodeAt(i);
  }
  return diff === 0;
}
__name(safeStringCompare, "safeStringCompare");
function compareSync(password, hash2) {
  if (typeof password !== "string" || typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof hash2);
  if (hash2.length !== 60) return false;
  return safeStringCompare(
    hashSync(password, hash2.substring(0, hash2.length - 31)),
    hash2
  );
}
__name(compareSync, "compareSync");
function compare(password, hashValue, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password !== "string" || typeof hashValue !== "string") {
      nextTick(
        callback2.bind(
          this,
          Error(
            "Illegal arguments: " + typeof password + ", " + typeof hashValue
          )
        )
      );
      return;
    }
    if (hashValue.length !== 60) {
      nextTick(callback2.bind(this, null, false));
      return;
    }
    hash(
      password,
      hashValue.substring(0, 29),
      function(err, comp) {
        if (err) callback2(err);
        else callback2(null, safeStringCompare(comp, hashValue));
      },
      progressCallback
    );
  }
  __name(_async, "_async");
  __name2(_async, "_async");
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
__name(compare, "compare");
function getRounds(hash2) {
  if (typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof hash2);
  return parseInt(hash2.split("$")[2], 10);
}
__name(getRounds, "getRounds");
function getSalt(hash2) {
  if (typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof hash2);
  if (hash2.length !== 60)
    throw Error("Illegal hash length: " + hash2.length + " != 60");
  return hash2.substring(0, 29);
}
__name(getSalt, "getSalt");
function truncates(password) {
  if (typeof password !== "string")
    throw Error("Illegal arguments: " + typeof password);
  return utf8Length(password) > 72;
}
__name(truncates, "truncates");
function utf8Length(string) {
  var len = 0, c = 0;
  for (var i = 0; i < string.length; ++i) {
    c = string.charCodeAt(i);
    if (c < 128) len += 1;
    else if (c < 2048) len += 2;
    else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
      ++i;
      len += 4;
    } else len += 3;
  }
  return len;
}
__name(utf8Length, "utf8Length");
function utf8Array(string) {
  var offset = 0, c1, c2;
  var buffer = new Array(utf8Length(string));
  for (var i = 0, k = string.length; i < k; ++i) {
    c1 = string.charCodeAt(i);
    if (c1 < 128) {
      buffer[offset++] = c1;
    } else if (c1 < 2048) {
      buffer[offset++] = c1 >> 6 | 192;
      buffer[offset++] = c1 & 63 | 128;
    } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
      c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
      ++i;
      buffer[offset++] = c1 >> 18 | 240;
      buffer[offset++] = c1 >> 12 & 63 | 128;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    } else {
      buffer[offset++] = c1 >> 12 | 224;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    }
  }
  return buffer;
}
__name(utf8Array, "utf8Array");
function base64_encode(b, len) {
  var off = 0, rs = [], c1, c2;
  if (len <= 0 || len > b.length) throw Error("Illegal len: " + len);
  while (off < len) {
    c1 = b[off++] & 255;
    rs.push(BASE64_CODE[c1 >> 2 & 63]);
    c1 = (c1 & 3) << 4;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 4 & 15;
    rs.push(BASE64_CODE[c1 & 63]);
    c1 = (c2 & 15) << 2;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 6 & 3;
    rs.push(BASE64_CODE[c1 & 63]);
    rs.push(BASE64_CODE[c2 & 63]);
  }
  return rs.join("");
}
__name(base64_encode, "base64_encode");
function base64_decode(s, len) {
  var off = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
  if (len <= 0) throw Error("Illegal len: " + len);
  while (off < slen - 1 && olen < len) {
    code = s.charCodeAt(off++);
    c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    code = s.charCodeAt(off++);
    c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c1 == -1 || c2 == -1) break;
    o = c1 << 2 >>> 0;
    o |= (c2 & 48) >> 4;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c3 == -1) break;
    o = (c2 & 15) << 4 >>> 0;
    o |= (c3 & 60) >> 2;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    o = (c3 & 3) << 6 >>> 0;
    o |= c4;
    rs.push(String.fromCharCode(o));
    ++olen;
  }
  var res = [];
  for (off = 0; off < olen; off++) res.push(rs[off].charCodeAt(0));
  return res;
}
__name(base64_decode, "base64_decode");
function _encipher(lr, off, P, S) {
  var n, l = lr[off], r = lr[off + 1];
  l ^= P[0];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[1];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[2];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[3];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[4];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[5];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[6];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[7];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[8];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[9];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[10];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[11];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[12];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[13];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[14];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[15];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[16];
  lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
  lr[off + 1] = l;
  return lr;
}
__name(_encipher, "_encipher");
function _streamtoword(data, offp) {
  for (var i = 0, word = 0; i < 4; ++i)
    word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
  return { key: word, offp };
}
__name(_streamtoword, "_streamtoword");
function _key(key, P, S) {
  var offset = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
  for (i = 0; i < plen; i += 2)
    lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
__name(_key, "_key");
function _ekskey(data, key, P, S) {
  var offp = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
  offp = 0;
  for (i = 0; i < plen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
__name(_ekskey, "_ekskey");
function _crypt(b, salt, rounds, callback, progressCallback) {
  var cdata = C_ORIG.slice(), clen = cdata.length, err;
  if (rounds < 4 || rounds > 31) {
    err = Error("Illegal number of rounds (4-31): " + rounds);
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.length !== BCRYPT_SALT_LEN) {
    err = Error(
      "Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN
    );
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  rounds = 1 << rounds >>> 0;
  var P, S, i = 0, j;
  if (typeof Int32Array === "function") {
    P = new Int32Array(P_ORIG);
    S = new Int32Array(S_ORIG);
  } else {
    P = P_ORIG.slice();
    S = S_ORIG.slice();
  }
  _ekskey(salt, b, P, S);
  function next() {
    if (progressCallback) progressCallback(i / rounds);
    if (i < rounds) {
      var start = Date.now();
      for (; i < rounds; ) {
        i = i + 1;
        _key(b, P, S);
        _key(salt, P, S);
        if (Date.now() - start > MAX_EXECUTION_TIME) break;
      }
    } else {
      for (i = 0; i < 64; i++)
        for (j = 0; j < clen >> 1; j++) _encipher(cdata, j << 1, P, S);
      var ret = [];
      for (i = 0; i < clen; i++)
        ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
      if (callback) {
        callback(null, ret);
        return;
      } else return ret;
    }
    if (callback) nextTick(next);
  }
  __name(next, "next");
  __name2(next, "next");
  if (typeof callback !== "undefined") {
    next();
  } else {
    var res;
    while (true) if (typeof (res = next()) !== "undefined") return res || [];
  }
}
__name(_crypt, "_crypt");
function _hash(password, salt, callback, progressCallback) {
  var err;
  if (typeof password !== "string" || typeof salt !== "string") {
    err = Error("Invalid string / salt: Not a string");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var minor, offset;
  if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
    err = Error("Invalid salt version: " + salt.substring(0, 2));
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.charAt(2) === "$") minor = String.fromCharCode(0), offset = 3;
  else {
    minor = salt.charAt(2);
    if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
      err = Error("Invalid salt revision: " + salt.substring(2, 4));
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else throw err;
    }
    offset = 4;
  }
  if (salt.charAt(offset + 2) > "$") {
    err = Error("Missing salt rounds");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
  password += minor >= "a" ? "\0" : "";
  var passwordb = utf8Array(password), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
  function finish(bytes) {
    var res = [];
    res.push("$2");
    if (minor >= "a") res.push(minor);
    res.push("$");
    if (rounds < 10) res.push("0");
    res.push(rounds.toString());
    res.push("$");
    res.push(base64_encode(saltb, saltb.length));
    res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
    return res.join("");
  }
  __name(finish, "finish");
  __name2(finish, "finish");
  if (typeof callback == "undefined")
    return finish(_crypt(passwordb, saltb, rounds));
  else {
    _crypt(
      passwordb,
      saltb,
      rounds,
      function(err2, bytes) {
        if (err2) callback(err2, null);
        else callback(null, finish(bytes));
      },
      progressCallback
    );
  }
}
__name(_hash, "_hash");
function encodeBase642(bytes, length) {
  return base64_encode(bytes, length);
}
__name(encodeBase642, "encodeBase642");
function decodeBase642(string, length) {
  return base64_decode(string, length);
}
__name(decodeBase642, "decodeBase642");
var import_crypto;
var randomFallback;
var nextTick;
var BASE64_CODE;
var BASE64_INDEX;
var BCRYPT_SALT_LEN;
var GENSALT_DEFAULT_LOG2_ROUNDS;
var BLOWFISH_NUM_ROUNDS;
var MAX_EXECUTION_TIME;
var P_ORIG;
var S_ORIG;
var C_ORIG;
var bcryptjs_default;
var init_bcryptjs = __esm({
  "../node_modules/bcryptjs/index.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    import_crypto = __toESM(require_crypto(), 1);
    randomFallback = null;
    __name2(randomBytes, "randomBytes");
    __name2(setRandomFallback, "setRandomFallback");
    __name2(genSaltSync, "genSaltSync");
    __name2(genSalt, "genSalt");
    __name2(hashSync, "hashSync");
    __name2(hash, "hash");
    __name2(safeStringCompare, "safeStringCompare");
    __name2(compareSync, "compareSync");
    __name2(compare, "compare");
    __name2(getRounds, "getRounds");
    __name2(getSalt, "getSalt");
    __name2(truncates, "truncates");
    nextTick = typeof setImmediate === "function" ? setImmediate : typeof scheduler === "object" && typeof scheduler.postTask === "function" ? scheduler.postTask.bind(scheduler) : setTimeout;
    __name2(utf8Length, "utf8Length");
    __name2(utf8Array, "utf8Array");
    BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
    BASE64_INDEX = [
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      0,
      1,
      54,
      55,
      56,
      57,
      58,
      59,
      60,
      61,
      62,
      63,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      -1,
      -1,
      -1,
      -1,
      -1
    ];
    __name2(base64_encode, "base64_encode");
    __name2(base64_decode, "base64_decode");
    BCRYPT_SALT_LEN = 16;
    GENSALT_DEFAULT_LOG2_ROUNDS = 10;
    BLOWFISH_NUM_ROUNDS = 16;
    MAX_EXECUTION_TIME = 100;
    P_ORIG = [
      608135816,
      2242054355,
      320440878,
      57701188,
      2752067618,
      698298832,
      137296536,
      3964562569,
      1160258022,
      953160567,
      3193202383,
      887688300,
      3232508343,
      3380367581,
      1065670069,
      3041331479,
      2450970073,
      2306472731
    ];
    S_ORIG = [
      3509652390,
      2564797868,
      805139163,
      3491422135,
      3101798381,
      1780907670,
      3128725573,
      4046225305,
      614570311,
      3012652279,
      134345442,
      2240740374,
      1667834072,
      1901547113,
      2757295779,
      4103290238,
      227898511,
      1921955416,
      1904987480,
      2182433518,
      2069144605,
      3260701109,
      2620446009,
      720527379,
      3318853667,
      677414384,
      3393288472,
      3101374703,
      2390351024,
      1614419982,
      1822297739,
      2954791486,
      3608508353,
      3174124327,
      2024746970,
      1432378464,
      3864339955,
      2857741204,
      1464375394,
      1676153920,
      1439316330,
      715854006,
      3033291828,
      289532110,
      2706671279,
      2087905683,
      3018724369,
      1668267050,
      732546397,
      1947742710,
      3462151702,
      2609353502,
      2950085171,
      1814351708,
      2050118529,
      680887927,
      999245976,
      1800124847,
      3300911131,
      1713906067,
      1641548236,
      4213287313,
      1216130144,
      1575780402,
      4018429277,
      3917837745,
      3693486850,
      3949271944,
      596196993,
      3549867205,
      258830323,
      2213823033,
      772490370,
      2760122372,
      1774776394,
      2652871518,
      566650946,
      4142492826,
      1728879713,
      2882767088,
      1783734482,
      3629395816,
      2517608232,
      2874225571,
      1861159788,
      326777828,
      3124490320,
      2130389656,
      2716951837,
      967770486,
      1724537150,
      2185432712,
      2364442137,
      1164943284,
      2105845187,
      998989502,
      3765401048,
      2244026483,
      1075463327,
      1455516326,
      1322494562,
      910128902,
      469688178,
      1117454909,
      936433444,
      3490320968,
      3675253459,
      1240580251,
      122909385,
      2157517691,
      634681816,
      4142456567,
      3825094682,
      3061402683,
      2540495037,
      79693498,
      3249098678,
      1084186820,
      1583128258,
      426386531,
      1761308591,
      1047286709,
      322548459,
      995290223,
      1845252383,
      2603652396,
      3431023940,
      2942221577,
      3202600964,
      3727903485,
      1712269319,
      422464435,
      3234572375,
      1170764815,
      3523960633,
      3117677531,
      1434042557,
      442511882,
      3600875718,
      1076654713,
      1738483198,
      4213154764,
      2393238008,
      3677496056,
      1014306527,
      4251020053,
      793779912,
      2902807211,
      842905082,
      4246964064,
      1395751752,
      1040244610,
      2656851899,
      3396308128,
      445077038,
      3742853595,
      3577915638,
      679411651,
      2892444358,
      2354009459,
      1767581616,
      3150600392,
      3791627101,
      3102740896,
      284835224,
      4246832056,
      1258075500,
      768725851,
      2589189241,
      3069724005,
      3532540348,
      1274779536,
      3789419226,
      2764799539,
      1660621633,
      3471099624,
      4011903706,
      913787905,
      3497959166,
      737222580,
      2514213453,
      2928710040,
      3937242737,
      1804850592,
      3499020752,
      2949064160,
      2386320175,
      2390070455,
      2415321851,
      4061277028,
      2290661394,
      2416832540,
      1336762016,
      1754252060,
      3520065937,
      3014181293,
      791618072,
      3188594551,
      3933548030,
      2332172193,
      3852520463,
      3043980520,
      413987798,
      3465142937,
      3030929376,
      4245938359,
      2093235073,
      3534596313,
      375366246,
      2157278981,
      2479649556,
      555357303,
      3870105701,
      2008414854,
      3344188149,
      4221384143,
      3956125452,
      2067696032,
      3594591187,
      2921233993,
      2428461,
      544322398,
      577241275,
      1471733935,
      610547355,
      4027169054,
      1432588573,
      1507829418,
      2025931657,
      3646575487,
      545086370,
      48609733,
      2200306550,
      1653985193,
      298326376,
      1316178497,
      3007786442,
      2064951626,
      458293330,
      2589141269,
      3591329599,
      3164325604,
      727753846,
      2179363840,
      146436021,
      1461446943,
      4069977195,
      705550613,
      3059967265,
      3887724982,
      4281599278,
      3313849956,
      1404054877,
      2845806497,
      146425753,
      1854211946,
      1266315497,
      3048417604,
      3681880366,
      3289982499,
      290971e4,
      1235738493,
      2632868024,
      2414719590,
      3970600049,
      1771706367,
      1449415276,
      3266420449,
      422970021,
      1963543593,
      2690192192,
      3826793022,
      1062508698,
      1531092325,
      1804592342,
      2583117782,
      2714934279,
      4024971509,
      1294809318,
      4028980673,
      1289560198,
      2221992742,
      1669523910,
      35572830,
      157838143,
      1052438473,
      1016535060,
      1802137761,
      1753167236,
      1386275462,
      3080475397,
      2857371447,
      1040679964,
      2145300060,
      2390574316,
      1461121720,
      2956646967,
      4031777805,
      4028374788,
      33600511,
      2920084762,
      1018524850,
      629373528,
      3691585981,
      3515945977,
      2091462646,
      2486323059,
      586499841,
      988145025,
      935516892,
      3367335476,
      2599673255,
      2839830854,
      265290510,
      3972581182,
      2759138881,
      3795373465,
      1005194799,
      847297441,
      406762289,
      1314163512,
      1332590856,
      1866599683,
      4127851711,
      750260880,
      613907577,
      1450815602,
      3165620655,
      3734664991,
      3650291728,
      3012275730,
      3704569646,
      1427272223,
      778793252,
      1343938022,
      2676280711,
      2052605720,
      1946737175,
      3164576444,
      3914038668,
      3967478842,
      3682934266,
      1661551462,
      3294938066,
      4011595847,
      840292616,
      3712170807,
      616741398,
      312560963,
      711312465,
      1351876610,
      322626781,
      1910503582,
      271666773,
      2175563734,
      1594956187,
      70604529,
      3617834859,
      1007753275,
      1495573769,
      4069517037,
      2549218298,
      2663038764,
      504708206,
      2263041392,
      3941167025,
      2249088522,
      1514023603,
      1998579484,
      1312622330,
      694541497,
      2582060303,
      2151582166,
      1382467621,
      776784248,
      2618340202,
      3323268794,
      2497899128,
      2784771155,
      503983604,
      4076293799,
      907881277,
      423175695,
      432175456,
      1378068232,
      4145222326,
      3954048622,
      3938656102,
      3820766613,
      2793130115,
      2977904593,
      26017576,
      3274890735,
      3194772133,
      1700274565,
      1756076034,
      4006520079,
      3677328699,
      720338349,
      1533947780,
      354530856,
      688349552,
      3973924725,
      1637815568,
      332179504,
      3949051286,
      53804574,
      2852348879,
      3044236432,
      1282449977,
      3583942155,
      3416972820,
      4006381244,
      1617046695,
      2628476075,
      3002303598,
      1686838959,
      431878346,
      2686675385,
      1700445008,
      1080580658,
      1009431731,
      832498133,
      3223435511,
      2605976345,
      2271191193,
      2516031870,
      1648197032,
      4164389018,
      2548247927,
      300782431,
      375919233,
      238389289,
      3353747414,
      2531188641,
      2019080857,
      1475708069,
      455242339,
      2609103871,
      448939670,
      3451063019,
      1395535956,
      2413381860,
      1841049896,
      1491858159,
      885456874,
      4264095073,
      4001119347,
      1565136089,
      3898914787,
      1108368660,
      540939232,
      1173283510,
      2745871338,
      3681308437,
      4207628240,
      3343053890,
      4016749493,
      1699691293,
      1103962373,
      3625875870,
      2256883143,
      3830138730,
      1031889488,
      3479347698,
      1535977030,
      4236805024,
      3251091107,
      2132092099,
      1774941330,
      1199868427,
      1452454533,
      157007616,
      2904115357,
      342012276,
      595725824,
      1480756522,
      206960106,
      497939518,
      591360097,
      863170706,
      2375253569,
      3596610801,
      1814182875,
      2094937945,
      3421402208,
      1082520231,
      3463918190,
      2785509508,
      435703966,
      3908032597,
      1641649973,
      2842273706,
      3305899714,
      1510255612,
      2148256476,
      2655287854,
      3276092548,
      4258621189,
      236887753,
      3681803219,
      274041037,
      1734335097,
      3815195456,
      3317970021,
      1899903192,
      1026095262,
      4050517792,
      356393447,
      2410691914,
      3873677099,
      3682840055,
      3913112168,
      2491498743,
      4132185628,
      2489919796,
      1091903735,
      1979897079,
      3170134830,
      3567386728,
      3557303409,
      857797738,
      1136121015,
      1342202287,
      507115054,
      2535736646,
      337727348,
      3213592640,
      1301675037,
      2528481711,
      1895095763,
      1721773893,
      3216771564,
      62756741,
      2142006736,
      835421444,
      2531993523,
      1442658625,
      3659876326,
      2882144922,
      676362277,
      1392781812,
      170690266,
      3921047035,
      1759253602,
      3611846912,
      1745797284,
      664899054,
      1329594018,
      3901205900,
      3045908486,
      2062866102,
      2865634940,
      3543621612,
      3464012697,
      1080764994,
      553557557,
      3656615353,
      3996768171,
      991055499,
      499776247,
      1265440854,
      648242737,
      3940784050,
      980351604,
      3713745714,
      1749149687,
      3396870395,
      4211799374,
      3640570775,
      1161844396,
      3125318951,
      1431517754,
      545492359,
      4268468663,
      3499529547,
      1437099964,
      2702547544,
      3433638243,
      2581715763,
      2787789398,
      1060185593,
      1593081372,
      2418618748,
      4260947970,
      69676912,
      2159744348,
      86519011,
      2512459080,
      3838209314,
      1220612927,
      3339683548,
      133810670,
      1090789135,
      1078426020,
      1569222167,
      845107691,
      3583754449,
      4072456591,
      1091646820,
      628848692,
      1613405280,
      3757631651,
      526609435,
      236106946,
      48312990,
      2942717905,
      3402727701,
      1797494240,
      859738849,
      992217954,
      4005476642,
      2243076622,
      3870952857,
      3732016268,
      765654824,
      3490871365,
      2511836413,
      1685915746,
      3888969200,
      1414112111,
      2273134842,
      3281911079,
      4080962846,
      172450625,
      2569994100,
      980381355,
      4109958455,
      2819808352,
      2716589560,
      2568741196,
      3681446669,
      3329971472,
      1835478071,
      660984891,
      3704678404,
      4045999559,
      3422617507,
      3040415634,
      1762651403,
      1719377915,
      3470491036,
      2693910283,
      3642056355,
      3138596744,
      1364962596,
      2073328063,
      1983633131,
      926494387,
      3423689081,
      2150032023,
      4096667949,
      1749200295,
      3328846651,
      309677260,
      2016342300,
      1779581495,
      3079819751,
      111262694,
      1274766160,
      443224088,
      298511866,
      1025883608,
      3806446537,
      1145181785,
      168956806,
      3641502830,
      3584813610,
      1689216846,
      3666258015,
      3200248200,
      1692713982,
      2646376535,
      4042768518,
      1618508792,
      1610833997,
      3523052358,
      4130873264,
      2001055236,
      3610705100,
      2202168115,
      4028541809,
      2961195399,
      1006657119,
      2006996926,
      3186142756,
      1430667929,
      3210227297,
      1314452623,
      4074634658,
      4101304120,
      2273951170,
      1399257539,
      3367210612,
      3027628629,
      1190975929,
      2062231137,
      2333990788,
      2221543033,
      2438960610,
      1181637006,
      548689776,
      2362791313,
      3372408396,
      3104550113,
      3145860560,
      296247880,
      1970579870,
      3078560182,
      3769228297,
      1714227617,
      3291629107,
      3898220290,
      166772364,
      1251581989,
      493813264,
      448347421,
      195405023,
      2709975567,
      677966185,
      3703036547,
      1463355134,
      2715995803,
      1338867538,
      1343315457,
      2802222074,
      2684532164,
      233230375,
      2599980071,
      2000651841,
      3277868038,
      1638401717,
      4028070440,
      3237316320,
      6314154,
      819756386,
      300326615,
      590932579,
      1405279636,
      3267499572,
      3150704214,
      2428286686,
      3959192993,
      3461946742,
      1862657033,
      1266418056,
      963775037,
      2089974820,
      2263052895,
      1917689273,
      448879540,
      3550394620,
      3981727096,
      150775221,
      3627908307,
      1303187396,
      508620638,
      2975983352,
      2726630617,
      1817252668,
      1876281319,
      1457606340,
      908771278,
      3720792119,
      3617206836,
      2455994898,
      1729034894,
      1080033504,
      976866871,
      3556439503,
      2881648439,
      1522871579,
      1555064734,
      1336096578,
      3548522304,
      2579274686,
      3574697629,
      3205460757,
      3593280638,
      3338716283,
      3079412587,
      564236357,
      2993598910,
      1781952180,
      1464380207,
      3163844217,
      3332601554,
      1699332808,
      1393555694,
      1183702653,
      3581086237,
      1288719814,
      691649499,
      2847557200,
      2895455976,
      3193889540,
      2717570544,
      1781354906,
      1676643554,
      2592534050,
      3230253752,
      1126444790,
      2770207658,
      2633158820,
      2210423226,
      2615765581,
      2414155088,
      3127139286,
      673620729,
      2805611233,
      1269405062,
      4015350505,
      3341807571,
      4149409754,
      1057255273,
      2012875353,
      2162469141,
      2276492801,
      2601117357,
      993977747,
      3918593370,
      2654263191,
      753973209,
      36408145,
      2530585658,
      25011837,
      3520020182,
      2088578344,
      530523599,
      2918365339,
      1524020338,
      1518925132,
      3760827505,
      3759777254,
      1202760957,
      3985898139,
      3906192525,
      674977740,
      4174734889,
      2031300136,
      2019492241,
      3983892565,
      4153806404,
      3822280332,
      352677332,
      2297720250,
      60907813,
      90501309,
      3286998549,
      1016092578,
      2535922412,
      2839152426,
      457141659,
      509813237,
      4120667899,
      652014361,
      1966332200,
      2975202805,
      55981186,
      2327461051,
      676427537,
      3255491064,
      2882294119,
      3433927263,
      1307055953,
      942726286,
      933058658,
      2468411793,
      3933900994,
      4215176142,
      1361170020,
      2001714738,
      2830558078,
      3274259782,
      1222529897,
      1679025792,
      2729314320,
      3714953764,
      1770335741,
      151462246,
      3013232138,
      1682292957,
      1483529935,
      471910574,
      1539241949,
      458788160,
      3436315007,
      1807016891,
      3718408830,
      978976581,
      1043663428,
      3165965781,
      1927990952,
      4200891579,
      2372276910,
      3208408903,
      3533431907,
      1412390302,
      2931980059,
      4132332400,
      1947078029,
      3881505623,
      4168226417,
      2941484381,
      1077988104,
      1320477388,
      886195818,
      18198404,
      3786409e3,
      2509781533,
      112762804,
      3463356488,
      1866414978,
      891333506,
      18488651,
      661792760,
      1628790961,
      3885187036,
      3141171499,
      876946877,
      2693282273,
      1372485963,
      791857591,
      2686433993,
      3759982718,
      3167212022,
      3472953795,
      2716379847,
      445679433,
      3561995674,
      3504004811,
      3574258232,
      54117162,
      3331405415,
      2381918588,
      3769707343,
      4154350007,
      1140177722,
      4074052095,
      668550556,
      3214352940,
      367459370,
      261225585,
      2610173221,
      4209349473,
      3468074219,
      3265815641,
      314222801,
      3066103646,
      3808782860,
      282218597,
      3406013506,
      3773591054,
      379116347,
      1285071038,
      846784868,
      2669647154,
      3771962079,
      3550491691,
      2305946142,
      453669953,
      1268987020,
      3317592352,
      3279303384,
      3744833421,
      2610507566,
      3859509063,
      266596637,
      3847019092,
      517658769,
      3462560207,
      3443424879,
      370717030,
      4247526661,
      2224018117,
      4143653529,
      4112773975,
      2788324899,
      2477274417,
      1456262402,
      2901442914,
      1517677493,
      1846949527,
      2295493580,
      3734397586,
      2176403920,
      1280348187,
      1908823572,
      3871786941,
      846861322,
      1172426758,
      3287448474,
      3383383037,
      1655181056,
      3139813346,
      901632758,
      1897031941,
      2986607138,
      3066810236,
      3447102507,
      1393639104,
      373351379,
      950779232,
      625454576,
      3124240540,
      4148612726,
      2007998917,
      544563296,
      2244738638,
      2330496472,
      2058025392,
      1291430526,
      424198748,
      50039436,
      29584100,
      3605783033,
      2429876329,
      2791104160,
      1057563949,
      3255363231,
      3075367218,
      3463963227,
      1469046755,
      985887462
    ];
    C_ORIG = [
      1332899944,
      1700884034,
      1701343084,
      1684370003,
      1668446532,
      1869963892
    ];
    __name2(_encipher, "_encipher");
    __name2(_streamtoword, "_streamtoword");
    __name2(_key, "_key");
    __name2(_ekskey, "_ekskey");
    __name2(_crypt, "_crypt");
    __name2(_hash, "_hash");
    __name2(encodeBase642, "encodeBase64");
    __name2(decodeBase642, "decodeBase64");
    bcryptjs_default = {
      setRandomFallback,
      genSaltSync,
      genSalt,
      hashSync,
      hash,
      compareSync,
      compare,
      getRounds,
      getSalt,
      truncates,
      encodeBase64: encodeBase642,
      decodeBase64: decodeBase642
    };
  }
});
async function onRequestGet2({ env }) {
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database non configurato." }), { status: 500 });
  }
  try {
    await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                role TEXT DEFAULT 'athlete',
                zwift_power_id INTEGER,
                active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();
    const email = "admin@teaminox.it";
    const password = "InoxTeam2026!";
    const username = "AdminInox";
    const role = "admin";
    const hashedPassword = await bcryptjs_default.hash(password, 10);
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) {
      await env.DB.prepare(
        "UPDATE users SET password_hash = ?, role = ?, username = ? WHERE email = ?"
      ).bind(hashedPassword, role, username, email).run();
    } else {
      await env.DB.prepare(
        "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)"
      ).bind(username, email, hashedPassword, role).run();
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Tabella 'users' verificata e Admin generato/aggiornato!",
      credentials: { email, password, role }
    }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Create Admin Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet2, "onRequestGet2");
var init_create_admin = __esm({
  "api/create-admin.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_bcryptjs();
    __name2(onRequestGet2, "onRequestGet");
  }
});
async function onRequestPost3({ request, env }) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ message: "Email e password richiesti." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const user = await env.DB.prepare(
      "SELECT * FROM users WHERE email = ?"
    ).bind(email).first();
    if (!user) {
      return new Response(JSON.stringify({ message: "Credenziali non valide." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const hashToCompare = user.password_hash;
    const isPasswordValid = await bcryptjs_default.compare(password, hashToCompare);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ message: "Credenziali non valide." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const payload = {
      zwid: user.zwift_power_id || user.id,
      // Usa zwift_power_id registrato
      username: user.username,
      role: user.role,
      exp: Math.floor(Date.now() / 1e3) + TOKEN_EXPIRY_SECONDS
    };
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const token = await new SignJWT(payload).setProtectedHeader({ alg: ALG }).setIssuedAt().setExpirationTime(`${TOKEN_EXPIRY_SECONDS}s`).sign(secret);
    return new Response(JSON.stringify({
      message: "Login effettuato.",
      token,
      role: user.role
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Login Auth Error:", error);
    return new Response(JSON.stringify({ message: "Errore interno: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost3, "onRequestPost3");
var TOKEN_EXPIRY_SECONDS;
var ALG;
var init_login_auth = __esm({
  "api/login_auth.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_bcryptjs();
    init_webapi();
    TOKEN_EXPIRY_SECONDS = 60 * 60 * 24;
    ALG = "HS256";
    __name2(onRequestPost3, "onRequestPost");
  }
});
async function onRequestPost4(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ message: "Database non configurato." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const { username, email, password, zwid } = await request.json();
    if (!username || !email || !password || !zwid || password.length < 8) {
      return new Response(JSON.stringify({ message: "Dati mancanti (Username, Email, Password, Zwift ID) o password troppo corta." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ? OR zwift_power_id = ?").bind(email, zwid).first();
    if (existing) {
      return new Response(JSON.stringify({ message: "Email o Zwift ID gi\xE0 registrati." }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }
    const hashedPassword = await bcryptjs_default.hash(password, 10);
    await env.DB.batch([
      env.DB.prepare("INSERT INTO users (username, email, password_hash, role, zwift_power_id) VALUES (?, ?, ?, ?, ?)").bind(username, email, hashedPassword, "athlete", zwid),
      env.DB.prepare("INSERT INTO athletes (zwid, name, email, role) VALUES (?, ?, ?, ?)").bind(zwid, username, email, "athlete")
    ]);
    return new Response(JSON.stringify({
      message: "Registrazione completata! Ora puoi effettuare il login.",
      zwid
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Errore registrazione:", error);
    return new Response(JSON.stringify({ message: "Errore interno: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost4, "onRequestPost4");
var init_register = __esm({
  "api/register.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_bcryptjs();
    __name2(onRequestPost4, "onRequestPost");
  }
});
async function onRequestPost5(context) {
  const { env } = context;
  try {
    const seasonId = "19";
    const action = "teamlist";
    const testParam = btoa(action);
    const INOX_CLUB_ID = "cef70cde-9149-43a2-b3ae-187643a44703";
    const bearerToken = btoa(env.WTRL_SID);
    const fetchFromWtrl = /* @__PURE__ */ __name2(async (wtrlId) => {
      const url = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=${wtrlId}&season=${seasonId}&action=${action}&test=${testParam}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "application/json",
          "Authorization": `Bearer ${bearerToken}`,
          "Wtrl-Integrity": env.WTRL_INTEGRITY,
          "Cookie": `wtrl_sid=${env.WTRL_SID}; wtrl_ouid=${env.WTRL_OUID}`,
          "X-Requested-With": "XMLHttpRequest"
        }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.payload || [];
    }, "fetchFromWtrl");
    console.log("Inizio scansione ZRL (Open) e WZRL (Women)...");
    const [openTeams, womenTeams] = await Promise.all([
      fetchFromWtrl("zrl"),
      fetchFromWtrl("wzrl")
    ]);
    const allTeams = [...openTeams, ...womenTeams];
    const inoxTeams = allTeams.filter((t) => {
      const teamName = (t.teamname || "").toUpperCase();
      const hasCorrectId = t.clubId === INOX_CLUB_ID;
      const hasInoxName = /\bINOX\b/.test(teamName);
      const isEquinox = teamName.includes("EQUINOX");
      return (hasCorrectId || hasInoxName) && !isEquinox;
    });
    console.log(`DEBUG: Trovate ${inoxTeams.length} squadre totali (Open: ${openTeams.length}, Women: ${womenTeams.length}).`);
    if (inoxTeams.length > 0) {
      const statements = inoxTeams.map((t) => {
        return env.DB.prepare(`
                INSERT INTO teams (name, category, division, wtrl_team_id, club_id)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(wtrl_team_id) DO UPDATE SET 
                    name = excluded.name,
                    category = excluded.category,
                    division = excluded.division,
                    club_id = excluded.club_id
            `).bind(t.teamname, t.division, t.zrldivision, t.id, t.clubId);
      });
      await env.DB.batch(statements);
      const inoxWtrlIds = inoxTeams.map((t) => t.id);
      if (inoxWtrlIds.length > 0) {
        const placeholders = inoxWtrlIds.map(() => "?").join(",");
        await env.DB.prepare(`
                DELETE FROM teams 
                WHERE wtrl_team_id IS NOT NULL 
                AND wtrl_team_id NOT IN (${placeholders})
            `).bind(...inoxWtrlIds).run();
      }
    }
    return new Response(JSON.stringify({
      success: true,
      count: inoxTeams.length,
      message: `Database aggiornato con ${inoxTeams.length} squadre (ZRL + WZRL).`
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost5, "onRequestPost5");
var init_sync_all_teams = __esm({
  "api/sync-all-teams.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    __name2(onRequestPost5, "onRequestPost");
  }
});
async function onRequestPost6(context) {
  const { env } = context;
  try {
    const seasonId = "19";
    const action = "schedule";
    const testParam = btoa(action);
    const bearerToken = btoa(env.WTRL_SID);
    const fetchSchedule = /* @__PURE__ */ __name2(async (cat) => {
      const url = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${seasonId}&category=${cat}&action=${action}&test=${testParam}`;
      console.log(`DEBUG SYNC ROUNDS: Fetching schedule for category ${cat} from ${url}`);
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "application/json",
          "Authorization": `Bearer ${bearerToken}`,
          "Wtrl-Integrity": env.WTRL_INTEGRITY,
          "Cookie": `wtrl_sid=${env.WTRL_SID}; wtrl_ouid=${env.WTRL_OUID}`,
          "X-Requested-With": "XMLHttpRequest",
          "wtrl-api-version": "2.7"
        }
      });
      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`WTRL Risposta Errore Categoria ${cat}: Status ${res.status}`);
        console.error(`WTRL Errore Body (${cat}): ${errorBody.substring(0, 200)}`);
        return [];
      }
      const data = await res.json();
      console.log(`DEBUG SYNC ROUNDS: WTRL response for category ${cat}. Status: ${res.status}. Data (first 300 chars): ${JSON.stringify(data).substring(0, 300)}`);
      let extractedData = data;
      if (Array.isArray(data)) {
        extractedData = data;
      } else if (data && typeof data === "object") {
        const possibleKeys = ["payload", "wtrl", "schedule", "data", "results", "rounds", "events"];
        for (const key of possibleKeys) {
          if (Array.isArray(data[key])) {
            extractedData = data[key];
            break;
          }
        }
        if (extractedData.length === 0 && Object.keys(data).length > 0) {
          const values = Object.values(data);
          if (values.length > 0 && Array.isArray(values[0])) {
            extractedData = values[0];
          } else if (values.length > 0 && typeof values[0] === "object" && values[0].race) {
            extractedData = values.filter((v) => v && v.race);
          }
        }
      }
      if (!Array.isArray(extractedData) || extractedData.length === 0) {
        console.warn(`WARN: Nessun round trovato per ${cat}. Struttura dati WTRL (primi 200 chars): ${JSON.stringify(data).substring(0, 200)}`);
        return [];
      } else {
        console.log(`DEBUG: Trovati ${extractedData.length} round per ${cat}.`);
      }
      return extractedData;
    }, "fetchSchedule");
    console.log(`Sincronizzazione Schedule Stagione ${seasonId} per categorie A e C...`);
    const [scheduleA, scheduleC] = await Promise.all([
      fetchSchedule("A"),
      fetchSchedule("C")
    ]);
    const combinedRounds = [...scheduleA, ...scheduleC];
    const uniqueRounds = [];
    const seenNames = /* @__PURE__ */ new Set();
    combinedRounds.forEach((r) => {
      if (!r) return;
      const rName = r.name || r.roundName || r.round || r.event_name || r.roundname || r.race;
      const rDate = r.eventDate || r.date || r.roundDate || r.event_date || r.rounddate || "";
      const rWorld = r.world || r.map || r.map_name || r.worldname || r.courseWorld || "";
      const rRoute = r.route || r.routeName || r.route_name || r.routename || r.courseName || "";
      const rCategory = r.subgroup_label || r.category || "Unknown";
      if (rName && !seenNames.has(rName)) {
        seenNames.add(rName);
        uniqueRounds.push({ name: rName, date: rDate, world: rWorld, route: rRoute, category: rCategory });
      }
    });
    if (uniqueRounds.length === 0) {
      throw new Error(`Nessun round valido trovato per le categorie A e C. Dati WTRL ricevuti (primi 200 chars): ${JSON.stringify(combinedRounds).substring(0, 200)}`);
    }
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS seasons (id INTEGER PRIMARY KEY, name TEXT, is_active INTEGER DEFAULT 0)`).run();
    await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS rounds (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            season_id INTEGER, 
            name TEXT, 
            date TEXT, 
            world TEXT, 
            route TEXT,
            category TEXT
        )
    `).run();
    try {
      await env.DB.prepare("ALTER TABLE rounds ADD COLUMN category TEXT").run();
      console.log("INFO: Colonna 'category' aggiunta alla tabella 'rounds'.");
    } catch (e) {
      if (e.message.includes("duplicate column")) {
        console.log("INFO: Colonna 'category' gi\xE0 presente nella tabella 'rounds'.");
      } else {
        console.error("ERRORE durante ALTER TABLE rounds:", e.message);
      }
    }
    await env.DB.prepare("INSERT OR REPLACE INTO seasons (id, name, is_active) VALUES (?, ?, ?)").bind(parseInt(seasonId), `ZRL Season ${seasonId}`, 1).run();
    await env.DB.prepare("DELETE FROM rounds WHERE season_id = ?").bind(parseInt(seasonId)).run();
    const statements = uniqueRounds.map((r) => {
      return env.DB.prepare(`INSERT INTO rounds (season_id, name, date, world, route, category) VALUES (?, ?, ?, ?, ?, ?)`).bind(parseInt(seasonId), r.name, r.date, r.world, r.route, r.category);
    });
    if (statements.length > 0) {
      await env.DB.batch(statements);
    }
    return new Response(JSON.stringify({
      success: true,
      count: uniqueRounds.length,
      message: `Sincronizzati ${uniqueRounds.length} round.`
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("ERRORE CRITICO SYNC ROUNDS:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost6, "onRequestPost6");
var init_sync_rounds = __esm({
  "api/sync-rounds.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    __name2(onRequestPost6, "onRequestPost");
  }
});
async function onRequestPost7(context) {
  const { request, env } = context;
  try {
    const { seasonId, teamId } = await request.json();
    if (!seasonId || !teamId) {
      return new Response(JSON.stringify({ error: "Dati mancanti (seasonId o teamId)" }), { status: 400 });
    }
    const wtrlUrl = `https://www.wtrl.racing/api/zrl/${seasonId}/teams/${teamId}`;
    const wtrlCookie = env.WTRL_COOKIE || "";
    console.log(`Richiesta a WTRL per Team ${teamId}, Stagione ${seasonId}...`);
    const response = await fetch(wtrlUrl, {
      headers: {
        "accept": "application/json",
        "cookie": wtrlCookie,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({
        error: `Errore WTRL: ${response.status}`,
        detail: errorText
      }), { status: response.status });
    }
    const data = await response.json();
    const members = data.members || [];
    for (const member of members) {
      if (member.zwiftId) {
        await env.DB.prepare(`
          INSERT INTO athletes (zwid, name, team)
          VALUES (?, ?, ?)
          ON CONFLICT(zwid) DO UPDATE SET name = excluded.name, team = excluded.team
        `).bind(member.zwiftId, member.name, data.teamName || "INOX").run();
      }
    }
    return new Response(JSON.stringify({
      success: true,
      message: `Sincronizzati ${members.length} atleti per il team ${data.teamName || teamId}`,
      data
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
__name(onRequestPost7, "onRequestPost7");
var init_sync_wtrl = __esm({
  "api/sync-wtrl.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    __name2(onRequestPost7, "onRequestPost");
  }
});
async function onRequestGet3(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare(`
      SELECT * FROM teams 
      ORDER BY category ASC, division ASC, name ASC
    `).all();
    return new Response(JSON.stringify({
      success: true,
      teams: results
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Errore recupero teams locali:", err.message);
    return new Response(JSON.stringify({ error: err.message, teams: [] }), { status: 500 });
  }
}
__name(onRequestGet3, "onRequestGet3");
var init_teams = __esm({
  "api/teams.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    __name2(onRequestGet3, "onRequestGet");
  }
});
async function onRequest(context) {
  const { request, env } = context;
  const { method } = request;
  const user = context.data?.user;
  const zwid = user?.zwid;
  const role = user?.role;
  if (!zwid) {
    return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid JWT" }), { status: 401 });
  }
  if (method === "GET") {
    try {
      const url = new URL(request.url);
      const isAdminRequest = url.searchParams.get("all") === "true";
      if (isAdminRequest && role === "admin") {
        const [allPrefsRes, allAvailRes, athletesRes] = await env.DB.batch([
          env.DB.prepare(`
                        SELECT p.*, a.name 
                        FROM user_time_preferences p
                        JOIN athletes a ON p.zwid = a.zwid
                    `).all(),
          env.DB.prepare(`
                        SELECT v.*, a.name 
                        FROM availability v
                        JOIN athletes a ON v.athlete_id = a.zwid
                    `).all(),
          env.DB.prepare("SELECT zwid, name, team, base_category FROM athletes").all()
        ]);
        return new Response(JSON.stringify({
          allPreferences: allPrefsRes.results,
          allAvailabilities: allAvailRes.results,
          athletes: athletesRes.results
        }), { headers: { "Content-Type": "application/json" } });
      }
      const [timeSlotsRes, preferencesRes, roundsRes] = await env.DB.batch([
        env.DB.prepare("SELECT * FROM league_times ORDER BY slot_order").all(),
        env.DB.prepare("SELECT * FROM user_time_preferences WHERE zwid = ?").bind(zwid).all(),
        env.DB.prepare(`
                    SELECT 
                        r.id, r.name, r.date, r.world, r.route,
                        (SELECT status FROM availability WHERE athlete_id = ? AND round_id = r.id) as status
                    FROM rounds r 
                    WHERE r.series_id = (SELECT id FROM series WHERE is_active = 1 LIMIT 1)
                    ORDER BY r.date ASC
                `).bind(zwid).all()
      ]);
      return new Response(JSON.stringify({
        timeSlots: timeSlotsRes.results,
        preferences: preferencesRes.results,
        rounds: roundsRes.results
      }), { headers: { "Content-Type": "application/json" } });
    } catch (e) {
      console.error("API GET Availability Error:", e.message);
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }
  if (method === "POST") {
    try {
      const body = await request.json();
      const { type, payload } = body;
      if (type === "preferences") {
        if (!Array.isArray(payload) || payload.length === 0) {
          return new Response(JSON.stringify({ error: "Invalid payload for preferences" }), { status: 400 });
        }
        const statements = payload.map(
          (p) => env.DB.prepare("INSERT OR REPLACE INTO user_time_preferences (zwid, time_slot_id, preference_level) VALUES (?, ?, ?)").bind(zwid, p.slotId, p.level)
        );
        await env.DB.batch(statements);
        return new Response(JSON.stringify({ success: true, message: "Preferences updated" }));
      } else if (type === "race") {
        if (!payload || typeof payload.roundId === "undefined" || typeof payload.status === "undefined") {
          return new Response(JSON.stringify({ error: "Invalid payload for race availability" }), { status: 400 });
        }
        await env.DB.prepare("INSERT OR REPLACE INTO availability (athlete_id, round_id, status, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)").bind(zwid, payload.roundId, payload.status).run();
        return new Response(JSON.stringify({ success: true, message: "Race availability updated" }));
      } else {
        return new Response(JSON.stringify({ error: "Invalid request type" }), { status: 400 });
      }
    } catch (e) {
      console.error("API POST Availability Error:", e.message);
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }
  return new Response("Not Found", { status: 404 });
}
__name(onRequest, "onRequest");
var init_availability = __esm({
  "api/availability.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    __name2(onRequest, "onRequest");
  }
});
async function onRequest2(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const publicPaths = ["/api/login_auth", "/api/register", "/login", "/", "/api/create-admin"];
  const isPublicPath = publicPaths.some((path) => url.pathname === path);
  const isPublicGet = request.method === "GET" && (url.pathname === "/api/series" || url.pathname === "/api/rounds" || url.pathname === "/api/results" || url.pathname === "/api/events");
  if (isPublicPath || isPublicGet || !url.pathname.startsWith("/api/")) {
    return next();
  }
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing or invalid authentication token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    context.data.user = payload;
    return next();
  } catch (err) {
    console.error("Middleware JWT Error:", err.message);
    return new Response(JSON.stringify({ error: "Unauthorized: Session expired or invalid" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequest2, "onRequest2");
var init_middleware = __esm({
  "_middleware.js"() {
    init_functionsRoutes_0_0288724258971349();
    init_checked_fetch();
    init_webapi();
    __name2(onRequest2, "onRequest");
  }
});
var routes;
var init_functionsRoutes_0_0288724258971349 = __esm({
  "../.wrangler/tmp/pages-SHtVQz/functionsRoutes-0.0288724258971349.mjs"() {
    init_delete_user();
    init_list_users();
    init_update_role();
    init_create_admin();
    init_login_auth();
    init_register();
    init_sync_all_teams();
    init_sync_rounds();
    init_sync_wtrl();
    init_teams();
    init_availability();
    init_middleware();
    routes = [
      {
        routePath: "/api/admin/delete_user",
        mountPath: "/api/admin",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost]
      },
      {
        routePath: "/api/admin/list_users",
        mountPath: "/api/admin",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet]
      },
      {
        routePath: "/api/admin/update_role",
        mountPath: "/api/admin",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost2]
      },
      {
        routePath: "/api/create-admin",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet2]
      },
      {
        routePath: "/api/login_auth",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost3]
      },
      {
        routePath: "/api/register",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost4]
      },
      {
        routePath: "/api/sync-all-teams",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost5]
      },
      {
        routePath: "/api/sync-rounds",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost6]
      },
      {
        routePath: "/api/sync-wtrl",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost7]
      },
      {
        routePath: "/api/teams",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet3]
      },
      {
        routePath: "/api/availability",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest]
      },
      {
        routePath: "/",
        mountPath: "/",
        method: "",
        middlewares: [onRequest2],
        modules: []
      }
    ];
  }
});
init_functionsRoutes_0_0288724258971349();
init_checked_fetch();
init_functionsRoutes_0_0288724258971349();
init_checked_fetch();
init_functionsRoutes_0_0288724258971349();
init_checked_fetch();
init_functionsRoutes_0_0288724258971349();
init_checked_fetch();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode2 = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode2(value, key);
        });
      } else {
        params[key.name] = decode2(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode3 = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode3(token));
    } else {
      var prefix = escapeString(encode3(token.prefix));
      var suffix = escapeString(encode3(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
init_functionsRoutes_0_0288724258971349();
init_checked_fetch();
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
init_functionsRoutes_0_0288724258971349();
init_checked_fetch();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
init_functionsRoutes_0_0288724258971349();
init_checked_fetch();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../Users/Roberto/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../Users/Roberto/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-xQ0DPc/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../Users/Roberto/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-xQ0DPc/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.33427323613664994.js.map
