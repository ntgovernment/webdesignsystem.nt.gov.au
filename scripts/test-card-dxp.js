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
  fns: {
    resolveMatrixAssetByUrl: async () => {
      throw new Error("Content API unavailable");
    },
  },
});

assert.match(fallbackHtml, /data-asset-url="https:\/\/example\.nt\.gov\.au\/design"/);
assert.match(fallbackHtml, /data-asset-text="Design"/);
assert.match(fallbackHtml, /data-asset-target="_self"/);
assert.match(fallbackHtml, /<h3 class="card__title">Design<\/h3>/);

const resolvedHtml = await cardComponent.main(baseInput, {
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

console.log("Card DXP resolver regression tests passed");