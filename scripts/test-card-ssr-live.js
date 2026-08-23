import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createMatrixDataServiceClient,
  DEFAULT_MATRIX_DATA_SERVICE_ENDPOINT,
  DEFAULT_MATRIX_DATA_SERVICE_KEY,
} from "../src/utils/matrix-data-service.js";

const DEFAULT_PAGE_URL = "https://cmsexternal.nt.gov.au/webds/_nocache";
const fixtureUrl = new URL(
  "../src/components/Card/dxp/resolved-asset-cards.data.json",
  import.meta.url,
);

const pageUrl = process.env.CARD_SSR_PAGE_URL || DEFAULT_PAGE_URL;
const input = JSON.parse(await readFile(fixtureUrl, "utf8"));
const destinations = input.Cards.map((card) => card.PageAsset.url);
const liveFetch = (...args) => fetch(...args);

const firstMetadataValue = (metadata, key) => {
  const value = metadata?.[key];
  return Array.isArray(value) ? value[0] : value;
};

const describeResolvedAsset = async (client, destination) => {
  const asset = await client.getAssetByUrl(destination);
  assert.ok(asset, `No Matrix asset resolved for ${destination}`);

  const title = firstMetadataValue(asset.metadata, "content-cardTitle");
  const icon = firstMetadataValue(asset.metadata, "content-cardIcon");
  const imageId = firstMetadataValue(
    asset.metadata,
    "content-cardImagePhoto",
  );
  const image = imageId ? await client.getAssetById(imageId) : null;

  return {
    destination,
    id: asset.id,
    title: title || "",
    icon: icon || "",
    imageId: imageId || "",
    imageUrl:
      image?.url ||
      image?.urls?.[0] ||
      image?.web_path ||
      image?.attributes?.url ||
      image?.attributes?.urls?.[0] ||
      image?.attributes?.web_path ||
      "",
  };
};

const response = await liveFetch(pageUrl, {
  headers: { "Cache-Control": "no-cache" },
});
assert.equal(response.ok, true, `SSR page returned HTTP ${response.status}`);
const html = await response.text();

const deployedResults = destinations.map((destination) => {
  const anchor = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)]
    .map((match) => match[0])
    .find(
      (value) =>
        value.includes(`href="${destination}"`) &&
        /\sdata-sq-field="Cards\[\d+\]\.PageAsset"/i.test(value),
    );

  return {
    destination,
    rendered: Boolean(anchor),
    hasAssetData: /\sdata-asset-[\w-]+=/i.test(anchor || ""),
    hasMetadata: /\sdata-metadata-[\w-]+=/i.test(anchor || ""),
    hasMedia: /<(?:img|span)\b/i.test(anchor || ""),
  };
});

const client = createMatrixDataServiceClient({
  endpoint: DEFAULT_MATRIX_DATA_SERVICE_ENDPOINT,
  key: DEFAULT_MATRIX_DATA_SERVICE_KEY,
  fetchImpl: liveFetch,
});
assert.ok(client, "Matrix data-service client could not be created");

const apiResults = [];
for (const destination of destinations) {
  apiResults.push(await describeResolvedAsset(client, destination));
}

console.log("Deployed SSR results:");
console.table(deployedResults);
console.log("Matrix data-service results:");
console.table(apiResults);

for (const result of deployedResults) {
  assert.equal(result.rendered, true, `Card link missing for ${result.destination}`);
  assert.equal(
    result.hasMetadata,
    true,
    `Card SSR fell back without destination metadata for ${result.destination}`,
  );
}

for (const result of apiResults) {
  assert.ok(result.id, `Matrix asset ID missing for ${result.destination}`);
  assert.ok(
    result.title || result.icon || result.imageId,
    `Card metadata is empty for ${result.destination}`,
  );
  if (result.imageId) {
    assert.ok(result.imageUrl, `Related image ${result.imageId} has no URL`);
  }
}

console.log("Live Card SSR asset checks passed");