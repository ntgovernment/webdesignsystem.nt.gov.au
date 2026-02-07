import React, { useState, useRef, useEffect } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-okaidia.css";
import "prismjs/components/prism-markup";
import prettier from "prettier/standalone";
import prettierHtml from "prettier/plugins/html";
import "./ComponentViewer.css";

export interface ComponentViewerProps {
  storybookUrl?: string;
  storyId?: string;
  codeExample?: string;
  height?: string;
}

export const ComponentViewer: React.FC<ComponentViewerProps> = ({
  storybookUrl = "/storybook/iframe.html",
  storyId = "components-button--primary",
  codeExample = `--example-comp: {
  class: var(--ntg-type-font-default);
  class: var(--ntg-type-size-8);
  class: var(--ntg-type-weight-2);
  line-height: var(--ntg-type-lh-6);
  letter-spacing: var(--ntg-type-ls-0);
}`,
  height = "200px",
}) => {
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showCode, setShowCode] = useState(false);
  const [extractedCode, setExtractedCode] = useState<string>("");
  const [formattedCode, setFormattedCode] = useState<string>("");
  const [displayedCode, setDisplayedCode] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const codeRef = useRef<HTMLElement>(null);

  const iframeSrc = `${storybookUrl}?id=${storyId}&viewMode=story`;

  // Extract iframe content for Show Code
  useEffect(() => {
    const extractIframeContent = () => {
      try {
        const iframe = iframeRef.current;
        if (!iframe) {
          console.log("Iframe not ready yet");
          return;
        }

        try {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document;

          if (!iframeDoc) {
            console.warn("⚠ Cannot access iframe document");
            formatCode(
              "<!-- Unable to access iframe content -->\n" + codeExample,
            );
            return;
          }

          // Try multiple selectors to find the story content
          const selectors = [
            "#storybook-root",
            "[data-story-block]",
            ".sb-story",
            "#storybook-docs",
            '[id*="story"]',
            "#root",
            "body",
          ];

          let root = null;
          for (const selector of selectors) {
            const element = iframeDoc.querySelector(selector);
            if (element && element.innerHTML.trim()) {
              root = element;
              console.log(`✓ Found content with selector: ${selector}`);
              break;
            }
          }

          if (root && root.innerHTML.trim()) {
            let extractedHTML = root.innerHTML.trim();

            // Strip outer div container if present
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = extractedHTML;

            // If there's only one child element and it's a div, use its innerHTML instead
            if (
              tempDiv.children.length === 1 &&
              tempDiv.children[0].tagName.toLowerCase() === "div"
            ) {
              extractedHTML = tempDiv.children[0].innerHTML.trim();
            }

            console.log(
              "✓ Extracted HTML from iframe:",
              extractedHTML.substring(0, 200) + "...",
            );
            formatCode(extractedHTML);
          } else {
            console.log("⚠ Could not find content in iframe, using fallback");
            formatCode(codeExample);
          }
        } catch (error) {
          console.error("Error accessing iframe content:", error);
          formatCode("<!-- Error accessing iframe content -->\n" + codeExample);
        }
      } catch (error) {
        console.error("Error extracting iframe content:", error);
        formatCode(codeExample);
      }
    };

    // Wait for iframe to load before extracting
    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = () => {
        // Give the iframe content time to render
        setTimeout(extractIframeContent, 1000);
      };

      iframe.addEventListener("load", handleLoad);

      // Cleanup
      return () => {
        iframe.removeEventListener("load", handleLoad);
      };
    }
  }, [iframeSrc, codeExample]);

  // Format code with Prettier and apply syntax highlighting
  const formatCode = async (code: string) => {
    try {
      const formatted = await prettier.format(code, {
        parser: "html",
        plugins: [prettierHtml],
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        htmlWhitespaceSensitivity: "css",
      });
      setExtractedCode(code);
      setFormattedCode(formatted);
    } catch (error) {
      console.error("Failed to format code:", error);
      setExtractedCode(code);
      setFormattedCode(code);
    }
  };

  // Apply Prism syntax highlighting when code changes
  useEffect(() => {
    if (showCode && codeRef.current && formattedCode) {
      Prism.highlightElement(codeRef.current);
    }
  }, [showCode, formattedCode]);

  // Typing animation effect
  useEffect(() => {
    if (!showCode) {
      setDisplayedCode("");
      setIsTyping(false);
      return;
    }

    if (!formattedCode) return;

    setIsTyping(true);
    setDisplayedCode("");

    let currentIndex = 0;
    const codeToDisplay = formattedCode || extractedCode || codeExample;
    const typingSpeed = 2; // characters per frame

    const typeCode = () => {
      if (currentIndex < codeToDisplay.length) {
        const nextIndex = Math.min(
          currentIndex + typingSpeed,
          codeToDisplay.length,
        );
        setDisplayedCode(codeToDisplay.substring(0, nextIndex));
        currentIndex = nextIndex;
        requestAnimationFrame(typeCode);
      } else {
        setIsTyping(false);
        // Re-apply syntax highlighting after typing is complete
        if (codeRef.current) {
          Prism.highlightElement(codeRef.current);
        }
      }
    };

    requestAnimationFrame(typeCode);
  }, [showCode, formattedCode, extractedCode, codeExample]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setZoom(1);
  const handleOpenInNewTab = () => window.open(iframeSrc, "_blank");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractedCode || codeExample);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSeeCode = () => {
    setShowCode(!showCode);
  };

  return (
    <div className="nt-component-viewer">
      {/* Preview Section */}
      <div className="component-viewer__preview" style={{ height }}>
        <div className="component-viewer__iframe-wrapper">
          {/* Toolbar */}
          <div className="component-viewer__toolbar">
            <div className="component-viewer__zoom-controls">
              <button
                className="component-viewer__control-btn"
                onClick={handleZoomIn}
                aria-label="Zoom in"
                title="Zoom in"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 3.5a.5.5 0 01.5.5v1.5H8a.5.5 0 010 1H6.5V8a.5.5 0 01-1 0V6.5H4a.5.5 0 010-1h1.5V4a.5.5 0 01.5-.5z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.544 10.206a5.5 5.5 0 11.662-.662.5.5 0 01.148.102l3 3a.5.5 0 01-.708.708l-3-3a.5.5 0 01-.102-.148zM10.5 6a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                    fill="currentColor"
                  />
                </svg>
                <span className="component-viewer__control-label">Zoom in</span>
              </button>
              <button
                className="component-viewer__control-btn"
                onClick={handleZoomOut}
                aria-label="Zoom out"
                title="Zoom out"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 5.5a.5.5 0 000 1h4a.5.5 0 000-1H4z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6 11.5c1.35 0 2.587-.487 3.544-1.294a.5.5 0 00.102.148l3 3a.5.5 0 00.708-.708l-3-3a.5.5 0 00-.148-.102A5.5 5.5 0 106 11.5zm0-1a4.5 4.5 0 100-9 4.5 4.5 0 000 9z"
                    fill="currentColor"
                  />
                </svg>
                <span className="component-viewer__control-label">
                  Zoom out
                </span>
              </button>
              <button
                className="component-viewer__control-btn"
                onClick={handleZoomReset}
                aria-label="Reset zoom"
                title="Reset zoom"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.5 2.837V1.5a.5.5 0 00-1 0V4a.5.5 0 00.5.5h2.5a.5.5 0 000-1H2.258a4.5 4.5 0 11-.496 4.016.5.5 0 10-.942.337 5.502 5.502 0 008.724 2.353.5.5 0 00.102.148l3 3a.5.5 0 00.708-.708l-3-3a.5.5 0 00-.148-.102A5.5 5.5 0 101.5 2.837z"
                    fill="currentColor"
                  />
                </svg>
                <span className="component-viewer__control-label">
                  Reset zoom
                </span>
              </button>
            </div>
            <button
              className="component-viewer__control-btn"
              onClick={handleOpenInNewTab}
              aria-label="Open canvas in new tab"
              title="Open canvas in new tab"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 1.004a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-4.5a.5.5 0 00-1 0v4.5H2v-10h4.5a.5.5 0 000-1H2z"
                  fill="currentColor"
                />
                <path
                  d="M7.354 7.357L12 2.711v1.793a.5.5 0 001 0v-3a.5.5 0 00-.5-.5h-3a.5.5 0 100 1h1.793L6.646 6.65a.5.5 0 10.708.707z"
                  fill="currentColor"
                />
              </svg>
              <span className="component-viewer__control-label">
                Open canvas in new tab
              </span>
            </button>
          </div>

          {/* Iframe Content */}
          <div
            className="component-viewer__iframe-content"
            style={{ transform: `scale(${zoom})` }}
          >
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              className="component-viewer__iframe"
              title="Component Preview"
              frameBorder="0"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>

      {/* Code Display Section */}
      {showCode && (
        <div className="component-viewer__code component-viewer__code--visible">
          <pre className="component-viewer__code-content">
            <code
              ref={codeRef}
              className={`language-html ${isTyping ? "typing-cursor" : ""}`}
            >
              {displayedCode}
            </code>
          </pre>
        </div>
      )}

      {/* Action Buttons */}
      <div className="component-viewer__actions">
        <button
          className="component-viewer__button"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
        >
          <i className="fa-light fa-copy" aria-hidden="true"></i>
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
        <button
          className="component-viewer__button"
          onClick={handleSeeCode}
          aria-label={showCode ? "Hide code" : "See code"}
        >
          <i className="fa-light fa-code" aria-hidden="true"></i>
          <span>{showCode ? "Hide code" : "See code"}</span>
        </button>
      </div>
    </div>
  );
};

export default ComponentViewer;
