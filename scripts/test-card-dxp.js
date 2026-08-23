import assert from "node:assert/strict";
import path from "node:path";
import { build } from "esbuild";

const root = process.cwd();
const entryPoint = path.join(root, "src/components/Card/dxp/main.js");
const sanitizePath = path.join(root, "src/utils/sanitize.ts");
const result = await build({
  entryPoints: [entryPoint],
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
  plugins: [
    {
      name: "resolve-source-js",
      setup(buildApi) {
        buildApi.onResolve({ filter: /utils\/sanitize\.js$/ }, () => ({
          path: sanitizePath,
        }));
      },
    },
  ],
});
const source = result.outputFiles[0].text;
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const { default: cardComponent } = await import(moduleUrl);

const baseInput = {
  showImage: true,
  showIcon: true,
  Cards: [
    {
      PageAsset: {
        url: "https://example.nt.gov.au/design",
        text: "Design",
        target: "_self",
      },
    },
  ],
};

const fallbackHtml = await cardComponent.main(baseInput, {
  ctx: {
    matrixDataService: {
      enabled: false,
    },
  },
  fns: {
    resolveMatrixAssetByUrl: async () => {
      throw new Error("Content API unavailable");
    },
  },
});

assert.match(
  fallbackHtml,
  /data-asset-url="https:\/\/example\.nt\.gov\.au\/design"/,
);
assert.match(fallbackHtml, /data-asset-text="Design"/);
assert.match(fallbackHtml, /data-asset-target="_self"/);
assert.match(fallbackHtml, /<h3 class="card__title">Design<\/h3>/);

const resolvedHtml = await cardComponent.main(baseInput, {
  ctx: {
    matrixDataService: {
      enabled: false,
    },
  },
  fns: {
    resolveMatrixAssetByUrl: async () => ({
      data: {
        id: "123",
        type: "page",
        attributes: {
          url: "https://example.nt.gov.au/design",
          name: "Design asset",
          metadata: {
            "content-cardTitle": ["Design metadata"],
            "content-cardIcon": ["fa-light fa-pen-ruler"],
            "content-cardImagePhoto": ["456"],
          },
        },
      },
    }),
    resolveUri: async () => ({
      data: {
        id: "456",
        type: "image",
        attributes: {
          url: "https://example.nt.gov.au/design.jpg",
          alt: "Design tools",
        },
      },
    }),
  },
});

assert.match(resolvedHtml, /data-asset-id="123"/);
assert.match(resolvedHtml, /data-asset-type="page"/);
assert.match(
  resolvedHtml,
  /data-metadata-content-card-title="\[&quot;Design metadata&quot;\]"/,
);
assert.match(
  resolvedHtml,
  /<img src="https:\/\/example\.nt\.gov\.au\/design\.jpg" alt="Design tools" \/>/,
);
assert.match(resolvedHtml, /class="card__icon fa-light fa-pen-ruler"/);

const originalFetch = globalThis.fetch;
let tokenRequestCount = 0;

globalThis.fetch = async (url, options = {}) => {
  const requestUrl = String(url);

  if (requestUrl.includes("SQ_ACTION=getToken")) {
    tokenRequestCount += 1;
    assert.equal(options.headers?.Origin, "https://cmsexternal.nt.gov.au");
    assert.equal(options.credentials, "include");
    return {
      ok: true,
      headers: {
        get: (name) =>
          name === "set-cookie"
            ? "SQ_SYSTEM_SESSION_INTER=mock-session; Path=/; HttpOnly"
            : null,
      },
      text: async () => "mock-token",
    };
  }

  assert.equal(options.headers?.Origin, "https://cmsexternal.nt.gov.au");
  assert.equal(options.headers?.["X-SquizMatrix-JSAPI-Key"], "5805955303");
  assert.equal(options.headers?.Cookie, "SQ_SYSTEM_SESSION_INTER=mock-session");
  assert.equal(options.credentials, "include");

  const payload = JSON.parse(options.body || "{}");
  const type = payload.type;
  const id = String(payload.id || "");

  if (type === "getLineageFromUrl") {
    return {
      ok: true,
      json: async () => ({
        data: [{ assetid: "1" }, { assetid: "100" }, { assetid: "123" }],
      }),
    };
  }

  if (type === "getGeneral" && id === "123") {
    return {
      ok: true,
      json: async () => ({
        id: "123",
        type: "page",
        uri: "matrix-asset://ntg/123",
        url: "https://example.nt.gov.au/design",
        name: "Design asset",
      }),
    };
  }

  if (type === "getMetadata" && id === "123") {
    return {
      ok: true,
      json: async () => ({
        "content-cardTitle": ["Design metadata from service"],
        "content-cardIcon": ["fa-light fa-cloud"],
        "content-cardImagePhoto": ["456"],
      }),
    };
  }

  if (type === "getAttributes" && id === "123") {
    return {
      ok: true,
      json: async () => ({
        attributes: {
          url: "https://example.nt.gov.au/design",
          name: "Design asset",
        },
      }),
    };
  }

  if (type === "getGeneral" && id === "456") {
    return {
      ok: true,
      json: async () => ({
        id: "456",
        type: "image",
        uri: "matrix-asset://ntg/456",
        urls: ["https://example.nt.gov.au/design-from-service.jpg"],
      }),
    };
  }

  if (type === "getMetadata" && id === "456") {
    return {
      ok: true,
      json: async () => ({}),
    };
  }

  if (type === "getAttributes" && id === "456") {
    return {
      ok: true,
      json: async () => ({
        attributes: {
          alt: "Service image alt",
        },
      }),
    };
  }

  throw new Error(
    `Unexpected data-service request: ${requestUrl} ${type} ${id}`,
  );
};

const dataServiceHtml = await cardComponent.main(baseInput, {
  ctx: {
    matrixDataService: {
      endpoint:
        "https://cmsexternal.nt.gov.au/webds/_design/javascript-api/data-service.js",
      key: "5805955303",
    },
  },
});

globalThis.fetch = originalFetch;

assert.match(
  dataServiceHtml,
  /<h3 class="card__title">Design metadata from service<\/h3>/,
);
assert.match(dataServiceHtml, /class="card__icon fa-light fa-cloud"/);
assert.match(
  dataServiceHtml,
  /<img src="https:\/\/example\.nt\.gov\.au\/design-from-service\.jpg" alt="Service image alt" \/>/,
);
assert.match(dataServiceHtml, /data-asset-id="123"/);
assert.match(
  dataServiceHtml,
  /data-metadata-content-card-title="\[&quot;Design metadata from service&quot;\]"/,
);
assert.equal(tokenRequestCount, 1);

console.log("Card DXP resolver regression tests passed");
