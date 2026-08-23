const DEFAULT_MATRIX_DATA_SERVICE_ENDPOINT =
  "https://cmsexternal.nt.gov.au/webds/_design/javascript-api/data-service.js";
const DEFAULT_MATRIX_DATA_SERVICE_KEY = "5805955303";

const tokenCache = new Map();

const isRecord = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizeAssetId = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }

  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;

  const matrixUriMatch =
    /^matrix-asset:\/\/[a-zA-Z0-9.-]+\/(\d+)(?::.+)?$/.exec(trimmed);
  return matrixUriMatch ? matrixUriMatch[1] : "";
};

const collectAssetIds = (value, assetIds = []) => {
  const direct = normalizeAssetId(value);
  if (direct) {
    assetIds.push(direct);
    return assetIds;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectAssetIds(item, assetIds);
    }
    return assetIds;
  }

  if (!isRecord(value)) return assetIds;

  const preferredKeys = ["assetid", "asset_id", "id", "asset", "assetId"];
  for (const key of preferredKeys) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
    collectAssetIds(value[key], assetIds);
  }

  if (assetIds.length === 0) {
    for (const nestedValue of Object.values(value)) {
      collectAssetIds(nestedValue, assetIds);
    }
  }

  return assetIds;
};

const toPayload = (response) => {
  if (isRecord(response) && isRecord(response.data)) return response.data;
  return response;
};

const readMetadata = (value) => {
  if (isRecord(value)) return value;
  return {};
};

const readAttributes = (...sources) => {
  for (const source of sources) {
    if (!isRecord(source)) continue;

    if (isRecord(source.attributes)) return source.attributes;
    if (isRecord(source.data?.attributes)) return source.data.attributes;

    const attrs = source.attrs;
    if (isRecord(attrs)) return attrs;
  }

  return {};
};

const readGeneralFields = (...sources) => {
  for (const source of sources) {
    if (!isRecord(source)) continue;

    if (isRecord(source.general)) return source.general;
    if (isRecord(source.data?.general)) return source.data.general;

    const knownKeys = ["id", "type", "name", "url", "uri", "matrixAssetUri"];
    const fields = {};
    for (const key of knownKeys) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        fields[key] = source[key];
      }
    }

    if (Object.keys(fields).length > 0) return fields;
  }

  return {};
};

const fetchJson = async (fetchImpl, url, options) => {
  const response = await fetchImpl(url, options);
  if (!response.ok) {
    throw new Error(
      `Matrix data-service request failed with status ${response.status}`,
    );
  }

  const payload = await response.json();
  if (isRecord(payload) && (payload.error || payload.errorCode)) {
    throw new Error(
      payload.error || `Matrix data-service error: ${payload.errorCode}`,
    );
  }

  return payload;
};

const readResponseCookies = (response) => {
  const setCookieValues =
    typeof response.headers?.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : String(response.headers?.get?.("set-cookie") || "")
          .split(/,(?=\s*[^;,]+=)/)
          .filter(Boolean);

  return setCookieValues
    .map((value) => value.split(";", 1)[0].trim())
    .filter(Boolean)
    .join("; ");
};

const getNonceToken = async (fetchImpl, endpoint, cacheKey, origin) => {
  if (tokenCache.has(cacheKey)) return tokenCache.get(cacheKey);

  const tokenRequest = (async () => {
    const response = await fetchImpl(`${endpoint}?SQ_ACTION=getToken`, {
      headers: { Origin: origin },
    });
    if (!response.ok) {
      throw new Error(
        `Matrix token request failed with status ${response.status}`,
      );
    }

    const token = (await response.text()).trim();
    if (!token) {
      throw new Error("Matrix token request returned an empty token");
    }

    return {
      token,
      cookie: readResponseCookies(response),
    };
  })();

  tokenCache.set(cacheKey, tokenRequest);

  try {
    return await tokenRequest;
  } catch (error) {
    tokenCache.delete(cacheKey);
    throw error;
  }
};

export const createMatrixDataServiceClient = (options = {}) => {
  const endpoint = options.endpoint || DEFAULT_MATRIX_DATA_SERVICE_ENDPOINT;
  const key = options.key || DEFAULT_MATRIX_DATA_SERVICE_KEY;
  const fetchImpl = options.fetchImpl || globalThis.fetch;

  if (typeof fetchImpl !== "function" || !endpoint || !key) {
    return null;
  }

  const cacheKey = `${endpoint}|${key}`;
  const origin = new URL(endpoint).origin;

  const post = async (type, params = {}) => {
    const nonce = await getNonceToken(fetchImpl, endpoint, cacheKey, origin);
    const body = { ...params, type, nonce_token: nonce.token };
    const headers = {
      "Content-Type": "application/json",
      Origin: origin,
      "X-SquizMatrix-JSAPI-Key": key,
    };
    if (nonce.cookie) headers.Cookie = nonce.cookie;

    return fetchJson(fetchImpl, endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  };

  const getAssetById = async (assetId) => {
    const normalizedId = normalizeAssetId(assetId);
    if (!normalizedId) return null;

    const [generalResult, metadataResult, attributesResult] =
      await Promise.allSettled([
        post("getGeneral", { id: normalizedId, get_attributes: 1 }),
        post("getMetadata", { id: normalizedId }),
        post("getAttributes", { id: normalizedId }),
      ]);

    const generalRaw =
      generalResult.status === "fulfilled" ? generalResult.value : {};
    const metadataRaw =
      metadataResult.status === "fulfilled" ? metadataResult.value : {};
    const attributesRaw =
      attributesResult.status === "fulfilled" ? attributesResult.value : {};

    if (
      generalResult.status === "rejected" &&
      metadataResult.status === "rejected" &&
      attributesResult.status === "rejected"
    ) {
      throw generalResult.reason;
    }

    const generalPayload = toPayload(generalRaw);
    const metadataPayload = toPayload(metadataRaw);
    const attributesPayload = toPayload(attributesRaw);

    const general = readGeneralFields(generalPayload, generalRaw);
    const attributes = {
      ...readAttributes(generalPayload, generalRaw),
      ...readAttributes(attributesPayload, attributesRaw),
    };
    const metadata = readMetadata(
      metadataPayload?.metadata || metadataPayload || metadataRaw?.metadata,
    );

    return {
      ...general,
      ...attributes,
      id: general.id || normalizedId,
      attributes,
      metadata,
      matrixAssetUri:
        general.matrixAssetUri ||
        general.uri ||
        attributes.matrixAssetUri ||
        attributes.uri ||
        "",
    };
  };

  const getAssetByUrl = async (assetUrl) => {
    if (typeof assetUrl !== "string" || !assetUrl.trim()) return null;

    const lineageRaw = await post("getLineageFromUrl", {
      asset_url: encodeURI(assetUrl),
    });

    const assetIds = collectAssetIds(toPayload(lineageRaw));
    if (assetIds.length === 0) collectAssetIds(lineageRaw, assetIds);
    const assetId = assetIds.at(-1) || "";

    if (!assetId) return null;
    return getAssetById(assetId);
  };

  return {
    getAssetById,
    getAssetByUrl,
  };
};

export {
  DEFAULT_MATRIX_DATA_SERVICE_ENDPOINT,
  DEFAULT_MATRIX_DATA_SERVICE_KEY,
};
