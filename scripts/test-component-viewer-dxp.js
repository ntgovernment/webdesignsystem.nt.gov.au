import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";

const root = process.cwd();
const componentDirectory = path.join(
  root,
  "src/components/ComponentViewer/dxp",
);
const result = await build({
  entryPoints: [path.join(componentDirectory, "main.js")],
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
  plugins: [
    {
      name: "resolve-source-js",
      setup(buildApi) {
        buildApi.onResolve({ filter: /utils\/sanitize\.js$/ }, () => ({
          path: path.join(root, "src/utils/sanitize.ts"),
        }));
        buildApi.onResolve({ filter: /utils\/instance-id\.js$/ }, () => ({
          path: path.join(root, "src/utils/instance-id.ts"),
        }));
      },
    },
  ],
});
const source = result.outputFiles[0].text;
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const { default: componentViewer } = await import(moduleUrl);

const manifest = JSON.parse(
  fs.readFileSync(path.join(componentDirectory, "manifest.json"), "utf8"),
);
const properties = manifest.functions[0].input.properties;

assert.equal(manifest.version, "2.0.0");
assert.equal(properties.Introduction["ui:metadata"].inlineEditable, true);
assert.equal(Object.hasOwn(properties, "cssClass"), false);

const configuredHtml = await componentViewer.main({
  Introduction: "<p>Rich <strong>introduction</strong></p>",
  storybookUrl:
    "https://ntgovernment.github.io/ntg-design-system/iframe.html?id=components-button--primary&viewMode=story",
  cssClass: "legacy-custom-class",
});

assert.match(
  configuredHtml,
  /class="component-viewer__introduction" data-sq-field="Introduction"/,
);
assert.match(configuredHtml, /<p>Rich <strong>introduction<\/strong><\/p>/);
assert.match(configuredHtml, /class="nt-component-viewer"/);
assert.doesNotMatch(configuredHtml, /legacy-custom-class/);
assert.match(configuredHtml, /data-action="toggle-code"/);
assert.match(configuredHtml, /data-iframe/);

const editorHtml = await componentViewer.main(
  { storybookUrl: "https://example.com/iframe.html?id=example" },
  { ctx: { editor: true } },
);

assert.match(
  editorHtml,
  /class="component-viewer__introduction" data-sq-field="Introduction"><\/div>/,
);

const publishedHtml = await componentViewer.main({
  storybookUrl: "https://example.com/iframe.html?id=example",
});

assert.doesNotMatch(publishedHtml, /data-sq-field="Introduction"/);
assert.doesNotMatch(publishedHtml, /component-viewer__introduction/);

console.log("ComponentViewer DXP renderer tests passed");
