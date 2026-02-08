class c{container;instanceId;props;iframe=null;zoomContainer=null;codePanel=null;codeDisplay=null;currentZoom;isCodeVisible;extractedCode="";constructor(e){this.container=e,this.instanceId=e.dataset.instanceId||"";try{this.props=JSON.parse(e.dataset.hydrationProps||"{}")}catch(t){console.error("Failed to parse hydration props:",t),this.props={storybookUrl:""}}this.currentZoom=this.props.initialZoom||1,this.isCodeVisible=this.props.showCodeByDefault||!1,this.render(),this.iframe=e.querySelector("[data-iframe]"),this.zoomContainer=e.querySelector("[data-zoom-container]"),this.codePanel=e.querySelector("[data-code-panel]"),this.codeDisplay=e.querySelector("[data-code-display]"),this.setupEventListeners(),this.iframe&&this.iframe.addEventListener("load",()=>{setTimeout(()=>this.extractIframeContent(),1e3)}),this.currentZoom!==1&&this.applyZoom()}render(){const{storybookUrl:e,codeExample:t="",height:a="200px",showCodeByDefault:i=!1,enableCopy:o=!0,enableZoom:s=!0}=this.props,r=s?`
            <div class="component-viewer__zoom-controls">
              <button 
                class="component-viewer__control-btn" 
                data-action="zoom-in"
                aria-label="Zoom in"
                title="Zoom in"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 3.5a.5.5 0 01.5.5v1.5H8a.5.5 0 010 1H6.5V8a.5.5 0 01-1 0V6.5H4a.5.5 0 010-1h1.5V4a.5.5 0 01.5-.5z" fill="currentColor"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M9.544 10.206a5.5 5.5 0 11.662-.662.5.5 0 01.148.102l3 3a.5.5 0 01-.708.708l-3-3a.5.5 0 01-.102-.148zM10.5 6a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" fill="currentColor"/>
                </svg>
                <span class="component-viewer__control-label">Zoom in</span>
              </button>
              <button 
                class="component-viewer__control-btn" 
                data-action="zoom-out"
                aria-label="Zoom out"
                title="Zoom out"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 5.5a.5.5 0 000 1h4a.5.5 0 000-1H4z" fill="currentColor"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M6 11.5c1.35 0 2.587-.487 3.544-1.294a.5.5 0 00.102.148l3 3a.5.5 0 00.708-.708l-3-3a.5.5 0 00-.148-.102A5.5 5.5 0 106 11.5zm0-1a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" fill="currentColor"/>
                </svg>
                <span class="component-viewer__control-label">Zoom out</span>
              </button>
              <button 
                class="component-viewer__control-btn" 
                data-action="zoom-reset"
                aria-label="Reset zoom"
                title="Reset zoom"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.5 2.837V1.5a.5.5 0 00-1 0V4a.5.5 0 00.5.5h2.5a.5.5 0 000-1H2.258a4.5 4.5 0 11-.496 4.016.5.5 0 10-.942.337 5.502 5.502 0 008.724 2.353.5.5 0 00.102.148l3 3a.5.5 0 00.708-.708l-3-3a.5.5 0 00-.148-.102A5.5 5.5 0 101.5 2.837z" fill="currentColor"/>
                </svg>
                <span class="component-viewer__control-label">Reset zoom</span>
              </button>
            </div>`:"",l=o?`
        <button 
          class="component-viewer__button" 
          data-action="copy"
          aria-label="Copy code to clipboard"
        >
          <i class="fa-light fa-copy" aria-hidden="true"></i>
          <span data-copy-text>Copy</span>
        </button>`:"";this.container.innerHTML=`
      <!-- Preview Section -->
      <div class="component-viewer__preview" style="height: ${this.escapeHtml(a)}">
        <div class="component-viewer__iframe-wrapper">
          
          <!-- Toolbar -->
          <div class="component-viewer__toolbar">
            ${r}
            <button 
              class="component-viewer__control-btn" 
              data-action="open-new-tab"
              aria-label="Open canvas in new tab"
              title="Open canvas in new tab"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 1.004a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-4.5a.5.5 0 00-1 0v4.5H2v-10h4.5a.5.5 0 000-1H2z" fill="currentColor"/>
                <path d="M7.354 7.357L12 2.711v1.793a.5.5 0 001 0v-3a.5.5 0 00-.5-.5h-3a.5.5 0 100 1h1.793L6.646 6.65a.5.5 0 10.708.707z" fill="currentColor"/>
              </svg>
              <span class="component-viewer__control-label">Open canvas in new tab</span>
            </button>
          </div>

          <!-- Iframe Content -->
          <div class="component-viewer__iframe-content" data-zoom-container>
            <iframe
              src="${this.escapeHtml(e)}"
              class="component-viewer__iframe"
              title="Component Preview"
              frameborder="0"
              sandbox="allow-scripts allow-same-origin"
              data-iframe
            ></iframe>
          </div>
        </div>
      </div>

      <!-- Code Display Section -->
      <div class="component-viewer__code ${i?"component-viewer__code--visible":""}" data-code-panel>
        <pre class="component-viewer__code-content">
          <code class="language-html" data-code-display></code>
        </pre>
      </div>

      <!-- Action Buttons -->
      <div class="component-viewer__actions">
        ${l}
        <button 
          class="component-viewer__button" 
          data-action="toggle-code"
          aria-label="${i?"Hide code":"See code"}"
        >
          <i class="fa-light fa-code" aria-hidden="true"></i>
          <span data-code-toggle-text>${i?"Hide code":"See code"}</span>
        </button>
      </div>
    `}escapeHtml(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}setupEventListeners(){this.container.querySelectorAll("[data-action]").forEach(t=>{switch(t.dataset.action){case"zoom-in":t.addEventListener("click",()=>this.handleZoomIn());break;case"zoom-out":t.addEventListener("click",()=>this.handleZoomOut());break;case"zoom-reset":t.addEventListener("click",()=>this.handleZoomReset());break;case"open-new-tab":t.addEventListener("click",()=>this.handleOpenNewTab());break;case"copy":t.addEventListener("click",()=>this.handleCopy());break;case"toggle-code":t.addEventListener("click",()=>this.handleToggleCode());break}})}handleZoomIn(){this.currentZoom=Math.min(this.currentZoom+.1,2),this.applyZoom()}handleZoomOut(){this.currentZoom=Math.max(this.currentZoom-.1,.5),this.applyZoom()}handleZoomReset(){this.currentZoom=1,this.applyZoom()}applyZoom(){this.zoomContainer&&(this.zoomContainer.style.transform=`scale(${this.currentZoom})`)}handleOpenNewTab(){if(this.iframe){const e=this.iframe.getAttribute("src");e&&window.open(e,"_blank")}}async handleCopy(){const e=this.container.querySelector("[data-copy-text]");try{if(await navigator.clipboard.writeText(this.extractedCode||this.props.codeExample||""),e){const t=e.textContent;e.textContent="Copied!",setTimeout(()=>{e.textContent=t},2e3)}}catch(t){console.error("Copy failed:",t)}}handleToggleCode(){this.isCodeVisible=!this.isCodeVisible,this.codePanel&&(this.isCodeVisible?(this.codePanel.classList.add("component-viewer__code--visible"),this.extractedCode||this.extractIframeContent()):this.codePanel.classList.remove("component-viewer__code--visible"));const e=this.container.querySelector("[data-code-toggle-text]");e&&(e.textContent=this.isCodeVisible?"Hide code":"See code");const t=this.container.querySelector('[data-action="toggle-code"]');t&&t.setAttribute("aria-label",this.isCodeVisible?"Hide code":"See code")}extractIframeContent(){try{if(!this.iframe){this.formatCode(this.props.codeExample||"<!-- Iframe not found -->");return}const e=this.iframe.contentDocument||this.iframe.contentWindow?.document;if(!e){console.warn("Cannot access iframe document"),this.formatCode(this.props.codeExample||"<!-- Unable to access iframe -->");return}const t=["#storybook-root","[data-story-block]",".sb-story","#storybook-docs",'[id*="story"]',"#root","body"];let a=null;for(const i of t){const o=e.querySelector(i);if(o&&o.innerHTML.trim()){a=o;break}}if(a&&a.innerHTML.trim()){let i=a.innerHTML.trim();const o=document.createElement("div");o.innerHTML=i,o.children.length===1&&o.children[0].tagName.toLowerCase()==="div"&&(i=o.children[0].innerHTML.trim()),this.formatCode(i)}else this.formatCode(this.props.codeExample||"")}catch(e){console.error("Error extracting iframe content:",e),this.formatCode(this.props.codeExample||"<!-- Error extracting content -->")}}async formatCode(e){this.extractedCode=e;try{if(window.prettier&&window.prettierPlugins){const t=await window.prettier.format(e,{parser:"html",plugins:window.prettierPlugins.html?[window.prettierPlugins.html]:[],printWidth:80,tabWidth:2,useTabs:!1,htmlWhitespaceSensitivity:"css"});this.displayCode(t)}else this.displayCode(e)}catch(t){console.error("Failed to format code:",t),this.displayCode(e)}}displayCode(e){this.codeDisplay&&(this.codeDisplay.textContent=e,window.Prism&&window.Prism.highlightElement(this.codeDisplay))}}if(typeof document<"u"){const n=()=>{document.querySelectorAll('[data-hydration-component="component-viewer"]').forEach(t=>{new c(t)})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",n):n()}
