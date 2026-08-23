import { escapeHtml, escapeAttr } from "../../../utils/sanitize.js";
import {
  createMatrixDataServiceClient,
  DEFAULT_MATRIX_DATA_SERVICE_ENDPOINT,
  DEFAULT_MATRIX_DATA_SERVICE_KEY,
} from "../../../utils/matrix-data-service.js";

const DEFAULT_MATRIX_ASSET_DOMAIN = "ntg";

const resolveDataServiceOptions = (info) => {
  const dataService = info?.ctx?.matrixDataService || {};
  if (dataService.enabled === false) return null;

  const runtimeFetch = info?.fns
    ? (...args) => info.fns.fetch(...args)
    : undefined;

  return createMatrixDataServiceClient({
    endpoint: dataService.endpoint || DEFAULT_MATRIX_DATA_SERVICE_ENDPOINT,
    key: dataService.key || DEFAULT_MATRIX_DATA_SERVICE_KEY,
    fetchImpl: dataService.fetch || runtimeFetch,
  });
};

const resolveColumnClass = (cardsPerRow) => {
  switch (cardsPerRow) {
    case "2":
    case "3":
    case "4":
      return `nt-card--columns-${cardsPerRow}`;
    default:
      return "";
  }
};

const resolveLinkUrl = (link) => {
  if (!link) return "";
  if (typeof link === "string") return link;
  return link.url || link.href || "";
};

const resolveLinkTitle = (link) => {
  if (!link || typeof link === "string") return "";
  return link.text || link.title || link.name || "";
};

const resolveLinkTarget = (link) => {
  if (!link || typeof link === "string") return "";
  return link.target || "";
};

const resolveMediaVisibility = (
  showImage,
  showIcon,
  legacyMediaType,
  legacyMode,
) => {
  if (typeof showImage === "boolean" || typeof showIcon === "boolean") {
    return {
      showImage: typeof showImage === "boolean" ? showImage : true,
      showIcon: typeof showIcon === "boolean" ? showIcon : false,
    };
  }

  const legacyIcon = legacyMediaType === "Icon" || legacyMode === "Mini Cards";
  return { showImage: !legacyIcon, showIcon: legacyIcon };
};

const unwrapResolved = (result) => {
  if (!result || typeof result !== "object") return null;
  if ("data" in result) return result.data ?? null;
  return result;
};

const isRecord = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const resolveAssetAttributes = (asset) => {
  if (!isRecord(asset)) return {};
  if (!isRecord(asset.attributes)) return asset;

  const { attributes, ...resourceFields } = asset;
  return { ...resourceFields, ...attributes };
};

const resolveAssetMetadata = (asset, attributes, envelope) => {
  if (isRecord(attributes.metadata)) return attributes.metadata;
  if (isRecord(asset?.metadata)) return asset.metadata;
  return isRecord(envelope?.metadata) ? envelope.metadata : {};
};

const normalizeResolvedAsset = (result) => {
  const asset = unwrapResolved(result);
  const attributes = resolveAssetAttributes(asset);

  return {
    asset,
    attributes,
    metadata: resolveAssetMetadata(asset, attributes, result),
  };
};

const resolveAssetValue = (asset, attributes, key) =>
  attributes[key] ?? asset?.[key];

const normalizeDataAttributeName = (key) =>
  String(key)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const serializeDataAttributeValue = (value) => {
  if (value === null || value === undefined) return null;
  if (["string", "number", "boolean"].includes(typeof value)) {
    return String(value);
  }

  if (typeof value !== "object") return null;

  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
};

const renderDataAttributes = (source, prefix, excludedKeys = []) => {
  if (!isRecord(source)) return "";

  const excluded = new Set(excludedKeys);
  const attributes = new Map();

  Object.entries(source).forEach(([key, value]) => {
    if (excluded.has(key)) return;

    const name = normalizeDataAttributeName(key);
    const serializedValue = serializeDataAttributeValue(value);
    if (!name || serializedValue === null) return;

    attributes.set(`data-${prefix}-${name}`, serializedValue);
  });

  return [...attributes.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => ` ${name}="${escapeAttr(value)}"`)
    .join("");
};

const resolveAsset = async (uri, info) => {
  if (!uri) return null;

  const dataServiceAsset = await resolveViaDataServiceById(
    parseAssetUriId(uri),
    info,
  );
  if (dataServiceAsset) return dataServiceAsset;

  try {
    return normalizeResolvedAsset(await info.fns.resolveUri(uri)).asset;
  } catch {
    return null;
  }
};

const parseAssetUriDomain = (uri) => {
  const match = /^matrix-asset:\/\/([a-zA-Z0-9.-]+)\/\d+(?::.+)?$/.exec(
    String(uri ?? ""),
  );
  return match ? match[1] : "";
};

const parseAssetUriId = (uri) => {
  const match = /^matrix-asset:\/\/[a-zA-Z0-9.-]+\/(\d+)(?::.+)?$/.exec(
    String(uri ?? ""),
  );
  return match ? match[1] : "";
};

const resolveViaDataServiceById = async (assetId, info) => {
  if (!assetId) return null;

  const client = resolveDataServiceOptions(info);
  if (!client) return null;

  try {
    return await client.getAssetById(assetId);
  } catch {
    return null;
  }
};

const resolveViaDataServiceByUrl = async (url, info) => {
  if (!url) return null;

  const client = resolveDataServiceOptions(info);
  if (!client) return null;

  try {
    return await client.getAssetByUrl(url);
  } catch {
    return null;
  }
};

const firstMetadataValue = (metadata, key) => {
  const value = metadata?.[key];
  return Array.isArray(value) ? value[0] : value;
};

const resolvePageAsset = async (link, info) => {
  if (!link) {
    return { asset: null, attributes: {}, metadata: {}, domain: "" };
  }

  if (typeof link === "string" && link.startsWith("matrix-asset://")) {
    const asset = await resolveAsset(link, info);
    const attributes = resolveAssetAttributes(asset);
    return {
      asset,
      attributes,
      metadata: resolveAssetMetadata(asset, attributes),
      domain: parseAssetUriDomain(link),
    };
  }

  if (typeof link !== "object") {
    return { asset: null, attributes: {}, metadata: {}, domain: "" };
  }

  const linkAttributes = resolveAssetAttributes(link);
  const linkMetadata = resolveAssetMetadata(link, linkAttributes);

  if (isRecord(link.metadata)) {
    const assetUri = link.uri || link.matrixAssetUri || "";
    return {
      asset: link,
      attributes: linkAttributes,
      metadata: linkMetadata,
      domain: parseAssetUriDomain(assetUri),
    };
  }

  const url = resolveLinkUrl(link);
  if (!url) {
    return {
      asset: link,
      attributes: linkAttributes,
      metadata: linkMetadata,
      domain: "",
    };
  }

  const dataServiceAsset = await resolveViaDataServiceByUrl(url, info);
  if (dataServiceAsset) {
    const attributes = {
      ...linkAttributes,
      ...resolveAssetAttributes(dataServiceAsset),
    };
    const metadata = {
      ...linkMetadata,
      ...resolveAssetMetadata(dataServiceAsset, attributes),
    };
    const assetUri =
      resolveAssetValue(dataServiceAsset, attributes, "uri") ||
      resolveAssetValue(dataServiceAsset, attributes, "matrixAssetUri") ||
      link.uri ||
      "";

    return {
      asset: dataServiceAsset,
      attributes,
      metadata,
      domain: parseAssetUriDomain(assetUri),
    };
  }

  try {
    const resolved = normalizeResolvedAsset(
      await info.fns.resolveMatrixAssetByUrl(url, ["metadata"]),
    );
    const attributes = { ...linkAttributes, ...resolved.attributes };
    const metadata = { ...linkMetadata, ...resolved.metadata };
    const assetUri =
      resolveAssetValue(resolved.asset, attributes, "uri") ||
      resolveAssetValue(resolved.asset, attributes, "matrixAssetUri") ||
      link.uri ||
      "";
    return {
      asset: resolved.asset,
      attributes,
      metadata,
      domain: parseAssetUriDomain(assetUri),
    };
  } catch {
    const assetUri = link.uri || link.matrixAssetUri || "";
    return {
      asset: link,
      attributes: linkAttributes,
      metadata: linkMetadata,
      domain: parseAssetUriDomain(assetUri),
    };
  }
};

const resolveImageUrl = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;

  const asset = unwrapResolved(image);
  const attributes = resolveAssetAttributes(asset);

  if (attributes.imageVariations) {
    if (attributes.imageVariations.original?.url) {
      return attributes.imageVariations.original.url;
    }

    const variation = Object.values(attributes.imageVariations).find(
      (item) => item?.url,
    );
    if (variation?.url) return variation.url;
  }

  return (
    attributes.url ||
    (Array.isArray(attributes.urls) ? attributes.urls[0] : "") ||
    attributes.href ||
    ""
  );
};

const resolveImageAlt = (image, fallbackTitle) => {
  if (!image || typeof image === "string") return fallbackTitle || "";
  const asset = unwrapResolved(image);
  const attributes = resolveAssetAttributes(asset);
  return attributes.alt || fallbackTitle || attributes.name || "";
};

const resolveMetadataImage = async (value, domain, info) => {
  if (!value || typeof value !== "string") return value;

  const imageUri = value.startsWith("matrix-asset://")
    ? value
    : /^\d+$/.test(value)
      ? `matrix-asset://${domain || DEFAULT_MATRIX_ASSET_DOMAIN}/${value}`
      : "";

  return imageUri ? await resolveAsset(imageUri, info) : value;
};

const populateCardMedia = async (card, visibility, info) => {
  const item = card || {};
  const { asset, attributes, metadata, domain } = await resolvePageAsset(
    item.PageAsset,
    info,
  );
  const resolvedTitle =
    firstMetadataValue(metadata, "content-cardTitle") ||
    item.CardTitle ||
    resolveLinkTitle(item.PageAsset) ||
    resolveAssetValue(asset, attributes, "name") ||
    "";
  const metadataImage = firstMetadataValue(metadata, "content-cardImagePhoto");

  return {
    ...item,
    resolvedAssetInfo: asset || item.PageAsset || {},
    resolvedAssetAttributes: attributes,
    resolvedMetadata: metadata,
    resolvedTitle,
    resolvedHref:
      resolveAssetValue(asset, attributes, "url") ||
      resolveLinkUrl(item.PageAsset),
    resolvedIcon: visibility.showIcon
      ? firstMetadataValue(metadata, "content-cardIcon") || item.IconCode || ""
      : "",
    resolvedImage: visibility.showImage
      ? (await resolveMetadataImage(metadataImage, domain, info)) ||
        resolveAssetValue(asset, attributes, "thumbnail") ||
        item.CardImage ||
        ""
      : "",
  };
};

const renderDisplayMedia = (card, title, editor) => {
  const imageUrl = resolveImageUrl(card.resolvedImage);
  if (!imageUrl && !editor) return "";

  const image = imageUrl
    ? `<img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(resolveImageAlt(card.resolvedImage, title))}" />`
    : "";

  return `<div class="card__media card__media--16-9">${image}</div>`;
};

const renderCard = (card, index, visibility, editor) => {
  const item = card || {};
  const fieldPath = `Cards[${index}]`;
  const href = item.resolvedHref || resolveLinkUrl(item.PageAsset);
  const target = resolveLinkTarget(item.PageAsset);
  const title = item.resolvedTitle || "";
  const isCompact = visibility.showIcon && !visibility.showImage;
  const tagName = href ? "a" : "div";
  const hrefAttr = href ? ` href="${escapeAttr(href)}"` : "";
  const targetAttr = target ? ` target="${escapeAttr(target)}"` : "";
  const relAttr = target === "_blank" ? ' rel="noopener noreferrer"' : "";
  const assetInfo = serializeDataAttributeValue(
    item.resolvedAssetInfo || item.PageAsset || {},
  );
  const assetInfoAttribute = ` data-asset-info="${escapeAttr(assetInfo || "{}")}"`;
  const assetDataAttributes = renderDataAttributes(
    item.resolvedAssetAttributes,
    "asset",
    ["metadata"],
  );
  const metadataDataAttributes = renderDataAttributes(
    item.resolvedMetadata,
    "metadata",
  );
  const clickableClass = href ? " card--clickable" : "";
  const modeClass = isCompact ? " card--mini" : " card--display";
  const imageHtml = visibility.showImage
    ? renderDisplayMedia(item, title, editor)
    : "";
  const iconHtml =
    visibility.showIcon && item.resolvedIcon
      ? `<span class="card__icon ${escapeAttr(item.resolvedIcon)}" aria-hidden="true"></span>`
      : "";
  const leadingIcon = isCompact ? iconHtml : "";
  const bodyIcon = visibility.showImage ? iconHtml : "";
  const bodyClass = [
    "card__content",
    isCompact ? "card__content--mini" : "",
    bodyIcon ? "card__content--with-icon" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `<div class="nt-card__item" role="listitem" data-card-index="${index}">
    <${tagName} class="card card--full${modeClass}${clickableClass}" data-sq-field="${fieldPath}.PageAsset" data-metadata-image="" data-metadata-icon=""${assetInfoAttribute}${assetDataAttributes}${metadataDataAttributes}${hrefAttr}${targetAttr}${relAttr}>
      ${imageHtml}
      ${leadingIcon}
      <div class="${bodyClass}">
        ${bodyIcon}
        <h3 class="card__title">${escapeHtml(title)}</h3>
      </div>
    </${tagName}>
  </div>`;
};

const main = async (input, info) => {
  const {
    showImage,
    showIcon,
    mediaType,
    cardMode,
    cardsPerRow = "Automatic",
    Content = "",
    Description = "",
    Cards = [],
  } = input || {};
  const editor = Boolean(info?.ctx?.editor);
  const visibility = resolveMediaVisibility(
    showImage,
    showIcon,
    mediaType,
    cardMode,
  );
  const cards = Array.isArray(Cards) ? Cards : [];

  if (cards.length === 0) {
    return `<div class="nt-card nt-card--empty" role="status">No cards provided in configuration</div>`;
  }

  const content = Content || Description;
  const contentHtml =
    content || editor
      ? `<div class="nt-card__description" data-sq-field="Content">${typeof content === "string" ? content : ""}</div>`
      : "";
  const resolvedCards = await Promise.all(
    cards.map((card) => populateCardMedia(card, visibility, info)),
  );
  const cardsHtml = resolvedCards
    .map((card, index) => renderCard(card, index, visibility, editor))
    .join("");
  const modeModifier =
    visibility.showIcon && !visibility.showImage ? "mini" : "display";
  const columnClass = resolveColumnClass(cardsPerRow);
  const classes = ["nt-card", `nt-card--${modeModifier}`, columnClass]
    .filter(Boolean)
    .join(" ");

  return `<section class="${classes}">
    ${contentHtml}
    <div class="nt-card__grid" role="list" data-show-image="${visibility.showImage}" data-show-icon="${visibility.showIcon}" data-card-count="${cards.length}">
      ${cardsHtml}
    </div>
  </section>`;
};

export default {
  main,
};
