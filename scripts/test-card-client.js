import assert from "node:assert/strict";
import path from "node:path";
import { build } from "esbuild";

const result = await build({
  entryPoints: [path.join(process.cwd(), "src/components/Card/Card.vanilla.ts")],
  bundle: true,
  define: { "import.meta.env.DEV": "false" },
  format: "esm",
  platform: "node",
  write: false,
  plugins: [
    {
      name: "ignore-css",
      setup(buildApi) {
        buildApi.onLoad({ filter: /\.css$/ }, () => ({
          contents: "",
          loader: "js",
        }));
      },
    },
  ],
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`;
const { resolveImageCandidates, selectImageCandidate } = await import(moduleUrl);

const candidates = resolveImageCandidates({
  web_path:
    "https://cmsexternal.nt.gov.au/__data/assets/image/0003/1592553/design.webp",
  width: 1600,
  height: 900,
  varieties: {
    data: {
      v1: {
        url: "https://cdn.example.nt.gov.au/design-small.webp",
        variety_width: 400,
        variety_height: 225,
      },
      v2: {
        urls: ["https://cdn.example.nt.gov.au/design-medium.webp"],
        variety_width: 800,
        variety_height: 450,
      },
    },
  },
});

assert.deepEqual(
  candidates.map(({ url, width, height }) => ({ url, width, height })),
  [
    {
      url: "https://cdn.example.nt.gov.au/design-small.webp",
      width: 400,
      height: 225,
    },
    {
      url: "https://cdn.example.nt.gov.au/design-medium.webp",
      width: 800,
      height: 450,
    },
    {
      url: "https://cmsexternal.nt.gov.au/__data/assets/image/0003/1592553/design.webp",
      width: 1600,
      height: 900,
    },
  ],
);
assert.equal(selectImageCandidate(candidates, 300, 168.75, 1)?.width, 400);
assert.equal(selectImageCandidate(candidates, 300, 168.75, 2)?.width, 800);
assert.equal(selectImageCandidate(candidates, 900, 506.25, 2)?.width, 1600);

console.log("Card client image selection tests passed");