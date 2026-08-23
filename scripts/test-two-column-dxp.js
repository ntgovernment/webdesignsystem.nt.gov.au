import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";

const root = process.cwd();
const componentDirectory = path.join(root, "src/components/TwoColumn/dxp");
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
const { default: twoColumnComponent } = await import(moduleUrl);

const manifest = JSON.parse(
  fs.readFileSync(path.join(componentDirectory, "manifest.json"), "utf8"),
);
const properties = manifest.functions[0].input.properties;

assert.equal(manifest.version, "2.0.0");
assert.deepEqual(Object.keys(properties), ["leftContent", "rightContent"]);
assert.equal(properties.leftContent["ui:metadata"].inlineEditable, true);
assert.equal(properties.rightContent["ui:metadata"].inlineEditable, true);

const configuredHtml = await twoColumnComponent.render({
  leftContent: "<h2>Left</h2><p>Formatted content</p>",
  rightContent: "<h2>Right</h2><ul><li>Item</li></ul>",
});

assert.match(configuredHtml, /data-sq-field="leftContent"/);
assert.match(configuredHtml, /data-sq-field="rightContent"/);
assert.match(configuredHtml, /<h2>Left<\/h2><p>Formatted content<\/p>/);
assert.match(configuredHtml, /<h2>Right<\/h2><ul><li>Item<\/li><\/ul>/);
assert.match(configuredHtml, /class="nt-two-column"/);
assert.doesNotMatch(configuredHtml, /style=/);

const emptyHtml = await twoColumnComponent.render({});
assert.match(emptyHtml, /data-sq-field="leftContent"><\/div>/);
assert.match(emptyHtml, /data-sq-field="rightContent"><\/div>/);

console.log("TwoColumn DXP renderer tests passed");
