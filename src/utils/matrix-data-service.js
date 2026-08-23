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

  const matrixUriMatch = /^matrix-asset:\/\/[a-zA-Z0-9.-]+\/(\d+)(?::.+)?$/.exec(
    trimmed,
  );
  return matrixUriMatch ? matrixUriMatch[1] : "";
};

const findAssetId = (value) => {
  const direct = normalizeAssetId(value);
  if (direct) return direct;

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = findAssetId(item);
      if (nested) return nested;
    }
    return "";
  }

  if (!isRecord(value)) return "";

  const preferredKeys = ["assetid", "asset_id", "id", "asset", "assetId"];
  for (const key of preferredKeys) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
    const nested = findAssetId(value[key]);
    if (nested) return nested;
  }

  for (const nestedValue of Object.values(value)) {
    const nested = findAssetId(nestedValue);
    if (nested) return nested;
  }

  return "";
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
    throw new Error(`Matrix data-service request failed with status ${response.status}`);
  }

  return response.json();
};

const getNonceToken = async (fetchImpl, endpoint, cacheKey) => {
  if (tokenCache.has(cacheKey)) return tokenCache.get(cacheKey);

  const response = await fetchImpl(`${endpoint}?SQ_ACTION=getToken`);
  if (!response.ok) {
    throw new Error(`Matrix token request failed with status ${response.status}`);
  }

  const token = (await response.text()).trim();
  if (!token) {
    throw new Error("Matrix token request returned an empty token");
  }

  tokenCache.set(cacheKey, token);
  return token;
};

export const createMatrixDataServiceClient = (options = {}) => {
  const endpoint = options.endpoint || DEFAULT_MATRIX_DATA_SERVICE_ENDPOINT;
  const key = options.key || DEFAULT_MATRIX_DATA_SERVICE_KEY;
  const fetchImpl = options.fetchImpl || globalThis.fetch;

  if (typeof fetchImpl !== "function" || !endpoint || !key) {
    return null;
  }

  const cacheKey = `${endpoint}|${key}`;

  const post = async (type, params = {}) => {
    const nonceToken = await getNonceToken(fetchImpl, endpoint, cacheKey);
    const body = { ...params, type, nonce_token: nonceToken };

    return fetchJson(fetchImpl, endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-SquizMatrix-JSAPI-Key": key,
      },
      body: JSON.stringify(body),
    });
  };

  const getAssetById = async (assetId) => {
    const normalizedId = normalizeAssetId(assetId);
    if (!normalizedId) return null;

    const [generalRaw, metadataRaw, attributesRaw] = await Promise.all([
      post("getGeneral", { id: normalizedId, get_attributes: 1 }),
      post("getMetadata", { id: normalizedId }),
      post("getAttributes", { id: normalizedId }),
    ]);

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

    const assetId =
      findAssetId(toPayload(lineageRaw)) ||
      findAssetId(lineageRaw);

    if (!assetId) return null;
    return getAssetById(assetId);
  };

  return {
    getAssetById,
    getAssetByUrl,
  };
};

export { DEFAULT_MATRIX_DATA_SERVICE_ENDPOINT, DEFAULT_MATRIX_DATA_SERVICE_KEY };
