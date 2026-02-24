/**
 * Tab Marker Transformer
 * Converts <hr><p>Title</p><hr> patterns into marked tab sections
 * for the Tab component to recognize and process
 */

export function transformTabMarkers(containerSelector = "#colour-content") {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn(
      `[TabMarkerTransformer] Container not found: ${containerSelector}`
    );
    return;
  }

  const children = Array.from(container.children);
  let markerCount = 0;
  let i = 0;

  while (i < children.length) {
    const child = children[i];

    // Look for <hr> element
    if (child.tagName === "HR") {
      // Check if next sibling is <p> with content
      const nextSibling = children[i + 1];
      if (nextSibling && nextSibling.tagName === "P") {
        const titleText = nextSibling.textContent?.trim();

        // Only mark if the <p> has content
        if (titleText) {
          // Add marker class to the <hr>
          child.classList.add("nt-tab-marker");
          child.setAttribute("data-tab-title", titleText);

          markerCount++;
          console.log(
            `[TabMarkerTransformer] Marked section "${titleText}"`
          );

          // Check if there's another <hr> after the p (closing marker)
          const secondHr = children[i + 2];
          if (secondHr && secondHr.tagName === "HR") {
            // Hide the closing <hr>
            secondHr.style.display = "none";
          }

          // Hide the title <p> tag (Tab component hides markers with display: none)
          nextSibling.style.display = "none";

          // Move past this section
          i += 3;
          continue;
        }
      }
    }

    i++;
  }

  console.log(
    `[TabMarkerTransformer] Transformation complete. Marked ${markerCount} sections.`
  );
  return markerCount;
}
