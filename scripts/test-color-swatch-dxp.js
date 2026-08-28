import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";

const root = process.cwd();
const componentDirectory = path.join(root, "src/components/ColorSwatch/dxp");
const entryPoint = path.join(componentDirectory, "main.js");
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
const { default: colorSwatchComponent } = await import(moduleUrl);

const manifest = JSON.parse(
  fs.readFileSync(path.join(componentDirectory, "manifest.json"), "utf8"),
);
const properties = manifest.functions[0].input.properties;

assert.equal(properties.Introduction["ui:metadata"].inlineEditable, true);
assert.equal(properties.Content, undefined);
assert.equal(
  properties.ColorValues.items.properties.Name["ui:metadata"].inlineEditable,
  true,
);
assert.equal(
  properties.ColorValues.items.properties.Hex["ui:metadata"].inlineEditable,
  true,
);
assert.deepEqual(properties.ColorValues.items.required, ["Name", "Hex"]);

const canonicalHtml = await colorSwatchComponent.main({
  Introduction: "<p>Extended <strong>palette</strong></p>",
  ColorValues: [{ Name: "Blue 03", Hex: "#1F1F5F" }],
});

assert.match(canonicalHtml, /data-sq-field="Introduction"/);
assert.match(canonicalHtml, /data-sq-field="ColorValues\[0\]\.Name"/);
assert.match(canonicalHtml, /data-sq-field="ColorValues\[0\]\.Hex"/);
assert.match(canonicalHtml, /background-color: #1F1F5F/);
assert.match(canonicalHtml, />Blue 03<\/div>/);
assert.match(canonicalHtml, />#1F1F5F<\/div>/);
assert.match(canonicalHtml, /<p>Extended <strong>palette<\/strong><\/p>/);

const legacyHtml = await colorSwatchComponent.main({
  Content: "<p>Compatibility content</p>",
  ColorValues: [{ Value: "Orange 03 #E35205" }],
});

assert.match(legacyHtml, /<p>Compatibility content<\/p>/);
assert.match(legacyHtml, /data-sq-field="Introduction"/);
assert.match(legacyHtml, />Orange 03<\/div>/);
assert.match(legacyHtml, /background-color: #E35205/);
assert.match(legacyHtml, />#E35205<\/div>/);

const legacyWithoutHexHtml = await colorSwatchComponent.main({
  ColorValues: [{ Value: "Legacy name" }],
});

assert.match(legacyWithoutHexHtml, />Legacy name<\/div>/);
assert.match(legacyWithoutHexHtml, /background-color: #cccccc/);
assert.match(legacyWithoutHexHtml, />#cccccc<\/div>/);

const precedenceHtml = await colorSwatchComponent.main({
  Introduction: "<p>Canonical introduction</p>",
  Content: "<p>Compatibility content</p>",
  ColorValues: [
    {
      Name: "Canonical name",
      Hex: "#123456",
      Value: "Legacy name #ABCDEF",
    },
  ],
});

assert.match(precedenceHtml, /Canonical introduction/);
assert.match(precedenceHtml, /Canonical name/);
assert.match(precedenceHtml, /background-color: #123456/);
assert.doesNotMatch(
  precedenceHtml,
  /Compatibility content|Legacy name|#ABCDEF/,
);

const editorHtml = await colorSwatchComponent.main(
  { ColorValues: [{ Name: "Blue", Hex: "#0000FF" }] },
  { ctx: { editor: true } },
);

assert.match(
  editorHtml,
  /class="nt-color-swatch-grid__description" data-sq-field="Introduction"><\/div>/,
);

const publishedHtml = await colorSwatchComponent.main({
  ColorValues: [{ Name: "Blue", Hex: "#0000FF" }],
});

assert.doesNotMatch(publishedHtml, /data-sq-field="Introduction"/);
assert.doesNotMatch(publishedHtml, /nt-color-swatch-grid__description/);

const escapedHtml = await colorSwatchComponent.main({
  ColorValues: [
    { Name: '<script>alert("name")</script>', Hex: '#fff" data-risk="1' },
  ],
});

assert.match(
  escapedHtml,
  /&lt;script&gt;alert\(&quot;name&quot;\)&lt;\/script&gt;/,
);
assert.match(escapedHtml, /background-color: #fff&quot; data-risk=&quot;1/);
assert.doesNotMatch(escapedHtml, /<script>|data-risk="1"/);

const emptyHtml = await colorSwatchComponent.main({ ColorValues: [] });
assert.match(emptyHtml, /No color values provided in configuration/);

console.log("ColorSwatch DXP renderer tests passed");
