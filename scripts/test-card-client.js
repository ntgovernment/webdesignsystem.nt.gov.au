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
const { renderClientIcon, resolveImageCandidates, selectImageCandidate } =
  await import(moduleUrl);

class TestElement {
  constructor(className = "") {
    this.className = className;
    this.children = [];
    this.dataset = {};
    this.parentElement = null;
    this.attributes = new Map();
    this.classList = {
      add: (...names) => this.updateClasses(names, false),
      contains: (name) => this.className.split(/\s+/).includes(name),
      remove: (...names) => this.updateClasses(names, true),
    };
  }

  updateClasses(names, remove) {
    const classes = new Set(this.className.split(/\s+/).filter(Boolean));
    names.forEach((name) => (remove ? classes.delete(name) : classes.add(name)));
    this.className = [...classes].join(" ");
  }

  appendChild(child) {
    this.detach(child);
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  prepend(child) {
    this.detach(child);
    child.parentElement = this;
    this.children.unshift(child);
  }

  insertBefore(child, reference) {
    this.detach(child);
    const index = this.children.indexOf(reference);
    child.parentElement = this;
    this.children.splice(index < 0 ? this.children.length : index, 0, child);
    return child;
  }

  detach(child) {
    if (!child.parentElement) return;
    const index = child.parentElement.children.indexOf(child);
    if (index >= 0) child.parentElement.children.splice(index, 1);
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const className = selector.startsWith(".") ? selector.slice(1) : "";
    return this.children.flatMap((child) => [
      ...(child.classList.contains(className) ? [child] : []),
      ...child.querySelectorAll(selector),
    ]);
  }

  closest(selector) {
    const className = selector.startsWith(".") ? selector.slice(1) : "";
    if (this.classList.contains(className)) return this;
    return this.parentElement?.closest(selector) || null;
  }
}

globalThis.document = {
  createElement: () => new TestElement(),
};

const createCardFixture = ({ showImage = false, showIcon = true } = {}) => {
  const grid = new TestElement("nt-card__grid");
  grid.dataset.showImage = String(showImage);
  grid.dataset.showIcon = String(showIcon);
  const card = grid.appendChild(new TestElement("card"));
  const content = card.appendChild(new TestElement("card__content"));
  return { card, content };
};

const compactFixture = createCardFixture();
renderClientIcon(compactFixture.card, "fa-light fa-circle-info");
const compactIcon = compactFixture.card.querySelector(".card__icon");
assert.equal(compactFixture.card.children[0], compactFixture.content);
assert.equal(compactFixture.content.children[0], compactIcon);
assert.equal(compactIcon.className, "card__icon fa-light fa-circle-info");
assert.equal(compactIcon.getAttribute("aria-hidden"), "true");
assert.equal(
  compactFixture.content.classList.contains("card__content--with-icon"),
  true,
);

const displayFixture = createCardFixture({ showImage: true });
renderClientIcon(displayFixture.card, "fa-brands fa-github");
assert.equal(
  displayFixture.content.children[0],
  displayFixture.card.querySelector(".card__icon"),
);
assert.equal(
  displayFixture.content.classList.contains("card__content--with-icon"),
  true,
);

const existingFixture = createCardFixture();
const existingIcon = new TestElement("card__icon fa-light fa-old-icon");
existingFixture.card.insertBefore(existingIcon, existingFixture.content);
renderClientIcon(existingFixture.card, "fa-light fa-puzzle-piece");
assert.equal(existingFixture.card.querySelectorAll(".card__icon").length, 1);
assert.equal(existingFixture.card.querySelector(".card__icon"), existingIcon);
assert.equal(existingIcon.className, "card__icon fa-light fa-puzzle-piece");

const disabledFixture = createCardFixture({ showIcon: false });
renderClientIcon(disabledFixture.card, "fa-light fa-circle-info");
assert.equal(disabledFixture.card.querySelector(".card__icon"), null);

const emptyFixture = createCardFixture();
renderClientIcon(emptyFixture.card, "  ");
assert.equal(emptyFixture.card.querySelector(".card__icon"), null);

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

console.log("Card client icon and image tests passed");