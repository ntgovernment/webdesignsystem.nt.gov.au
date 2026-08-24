import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";

const root = process.cwd();
const componentDirectory = path.join(root, "src/components/Tab");
const sanitizePath = path.join(root, "src/utils/sanitize.ts");
const transformerPath = path.join(componentDirectory, "Tab.transformer.ts");

const transformerSource = fs.readFileSync(transformerPath, "utf8");
assert.match(
  transformerSource,
  /button\.setAttribute\("tabindex", "0"\)/,
);
assert.doesNotMatch(transformerSource, /tabindex[^\n]*"-1"/);

const manifest = JSON.parse(
  fs.readFileSync(
    path.join(componentDirectory, "dxp/manifest.json"),
    "utf8",
  ),
);
assert.equal(
  manifest.functions[0].input.properties.title["ui:metadata"].inlineEditable,
  true,
);

const rendererBuild = await build({
  entryPoints: [path.join(componentDirectory, "dxp/main.js")],
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
const rendererSource = rendererBuild.outputFiles[0].text;
const rendererUrl = `data:text/javascript;base64,${Buffer.from(rendererSource).toString("base64")}`;
const { default: tabComponent } = await import(rendererUrl);

const defaultHtml = await tabComponent.main({ title: "Overview" });
assert.match(defaultHtml, /class="sq-inline-viper-content nt-tab-marker"/);
assert.match(defaultHtml, /data-tab-title="Overview"/);
assert.match(defaultHtml, /data-tab-id="overview"/);
assert.match(
  defaultHtml,
  /style="min-height: 18\.5px; border: 1px solid transparent;"/,
);
assert.match(defaultHtml, /<p data-sq-field="title">Overview<\/p>/);
assert.match(
  defaultHtml,
  /<hr><p data-sq-field="title">Overview<\/p><hr><p><\/p><p><\/p>/,
);

const customAnchorHtml = await tabComponent.main({
  title: "Usage & setup",
  anchor: "usage-setup",
});
assert.match(customAnchorHtml, /data-tab-id="usage-setup"/);
assert.match(customAnchorHtml, /<p data-sq-field="title">Usage &amp; setup<\/p>/);

const escapedHtml = await tabComponent.main({
  title: '<script>alert("tab")</script>',
  anchor: 'unsafe" data-risk="true',
});
assert.doesNotMatch(escapedHtml, /<script>|data-risk="true"/);
assert.match(
  escapedHtml,
  /&lt;script&gt;alert\(&quot;tab&quot;\)&lt;\/script&gt;/,
);

const transformerBuild = await build({
  entryPoints: [transformerPath],
  bundle: true,
  format: "iife",
  platform: "browser",
  write: false,
  outdir: "tab-test-output",
  loader: { ".css": "css" },
});
const transformerJavaScript = transformerBuild.outputFiles.find((file) =>
  file.path.endsWith(".js"),
)?.text;
const transformerCss = transformerBuild.outputFiles.find((file) =>
  file.path.endsWith(".css"),
)?.text;

assert.ok(transformerJavaScript, "Transformer JavaScript bundle was emitted");
assert.ok(transformerCss, "Transformer CSS bundle was emitted");
assert.match(transformerJavaScript, /sq-inline-viper-content/);
assert.match(transformerJavaScript, /nt-tab-marker/);
assert.match(transformerJavaScript, /ArrowLeft/);
assert.match(transformerJavaScript, /ArrowRight/);
assert.match(transformerJavaScript, /aria-selected/);
assert.match(transformerJavaScript, /tabindex/);
assert.match(transformerCss, /nt-tab-transformer__button:focus-visible/);

console.log("Tab renderer and transformer bundle tests passed");
