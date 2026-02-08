class c{container;props;iframe=null;zoomContainer=null;codePanel=null;codeDisplay=null;currentZoom;isCodeVisible;extractedCode="";constructor(e){this.container=e;try{this.props=JSON.parse(e.dataset.hydrationProps||"{}")}catch(t){console.error("Failed to parse hydration props:",t),this.props={storybookUrl:""}}this.currentZoom=this.props.initialZoom||1,this.isCodeVisible=this.props.showCodeByDefault||!1,this.render(),this.iframe=e.querySelector("[data-iframe]"),this.zoomContainer=e.querySelector("[data-zoom-container]"),this.codePanel=e.querySelector("[data-code-panel]"),this.codeDisplay=e.querySelector("[data-code-display]"),this.setupEventListeners(),this.iframe&&this.iframe.addEventListener("load",()=>{setTimeout(()=>this.extractIframeContent(),1e3)}),this.currentZoom!==1&&this.applyZoom()}render(){const{storybookUrl:e,height:t="200px",showCodeByDefault:o=!1,enableCopy:n=!0,enableZoom:i=!0}=this.props,a=i?`
            <div class="component-viewer__zoom-controls">
              <button 
                class="component-viewer__control-btn" 
                data-action="zoom-in"
                aria-label="Zoom in"
                title="Zoom in"
              >
                <i class="fa-light fa-magnifying-glass-plus" aria-hidden="true"></i>
                <span class="component-viewer__control-label">Zoom in</span>
              </button>
              <button 
                class="component-viewer__control-btn" 
                data-action="zoom-out"
                aria-label="Zoom out"
                title="Zoom out"
              >
                <i class="fa-light fa-magnifying-glass-minus" aria-hidden="true"></i>
                <span class="component-viewer__control-label">Zoom out</span>
              </button>
              <button 
                class="component-viewer__control-btn" 
                data-action="zoom-reset"
                aria-label="Reset zoom"
                title="Reset zoom"
              >
                <i class="fa-light fa-arrows-rotate" aria-hidden="true"></i>
                <span class="component-viewer__control-label">Reset zoom</span>
              </button>
            </div>`:"",r=n?`
        <button 
          class="component-viewer__button" 
          data-action="copy"
          aria-label="Copy code to clipboard"
        >
          <i class="fa-light fa-copy" aria-hidden="true"></i>
          <span data-copy-text>Copy</span>
        </button>`:"";this.container.innerHTML=`
      <!-- Preview Section -->
      <div class="component-viewer__preview" style="height: ${this.escapeHtml(t)}">
        <div class="component-viewer__iframe-wrapper">
          
          <!-- Toolbar -->
          <div class="component-viewer__toolbar">
            ${a}
            <button 
              class="component-viewer__control-btn" 
              data-action="open-new-tab"
              aria-label="Open canvas in new tab"
              title="Open canvas in new tab"
            >
              <i class="fa-light fa-arrow-up-right-from-square" aria-hidden="true"></i>
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
      <div class="component-viewer__code ${o?"component-viewer__code--visible":""}" data-code-panel>
        <pre class="component-viewer__code-content"><code class="language-html" data-code-display></code></pre>
      </div>

      <!-- Action Buttons -->
      <div class="component-viewer__actions">
        ${r}
        <button 
          class="component-viewer__button" 
          data-action="toggle-code"
          aria-label="${o?"Hide code":"See code"}"
        >
          <i class="fa-light fa-code" aria-hidden="true"></i>
          <span data-code-toggle-text>${o?"Hide code":"See code"}</span>
        </button>
      </div>
    `}escapeHtml(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}setupEventListeners(){this.container.querySelectorAll("[data-action]").forEach(t=>{switch(t.dataset.action){case"zoom-in":t.addEventListener("click",()=>this.handleZoomIn());break;case"zoom-out":t.addEventListener("click",()=>this.handleZoomOut());break;case"zoom-reset":t.addEventListener("click",()=>this.handleZoomReset());break;case"open-new-tab":t.addEventListener("click",()=>this.handleOpenNewTab());break;case"copy":t.addEventListener("click",()=>this.handleCopy());break;case"toggle-code":t.addEventListener("click",()=>this.handleToggleCode());break}})}handleZoomIn(){this.currentZoom=Math.min(this.currentZoom+.1,2),this.applyZoom()}handleZoomOut(){this.currentZoom=Math.max(this.currentZoom-.1,.5),this.applyZoom()}handleZoomReset(){this.currentZoom=1,this.applyZoom()}applyZoom(){this.zoomContainer&&(this.zoomContainer.style.transform=`scale(${this.currentZoom})`)}handleOpenNewTab(){if(this.iframe){const e=this.iframe.getAttribute("src");e&&window.open(e,"_blank")}}async handleCopy(){const e=this.container.querySelector("[data-copy-text]");try{if(await navigator.clipboard.writeText(this.extractedCode||this.props.codeExample||""),e){const t=e.textContent;e.textContent="Copied!",setTimeout(()=>{e.textContent=t},2e3)}}catch(t){console.error("Copy failed:",t)}}handleToggleCode(){this.isCodeVisible=!this.isCodeVisible,this.codePanel&&(this.isCodeVisible?(this.codePanel.classList.add("component-viewer__code--visible"),this.extractedCode?this.codeDisplay&&this.animateTyping(this.extractedCode):this.extractIframeContent()):this.codePanel.classList.remove("component-viewer__code--visible"));const e=this.container.querySelector("[data-code-toggle-text]");e&&(e.textContent=this.isCodeVisible?"Hide code":"See code");const t=this.container.querySelector('[data-action="toggle-code"]');t&&t.setAttribute("aria-label",this.isCodeVisible?"Hide code":"See code")}extractIframeContent(){try{if(!this.iframe){this.formatCode(this.props.codeExample||"<!-- Iframe not found -->");return}const e=this.iframe.contentDocument||this.iframe.contentWindow?.document;if(!e){console.warn("Cannot access iframe document"),this.formatCode(this.props.codeExample||"<!-- Unable to access iframe -->");return}const t=["#storybook-root","[data-story-block]",".sb-story","#storybook-docs",'[id*="story"]',"#root","body"];let o=null;for(const n of t){const i=e.querySelector(n);if(i&&i.innerHTML.trim()){o=i;break}}if(o&&o.innerHTML.trim()){let n=o.innerHTML.trim();const i=document.createElement("div");i.innerHTML=n,i.children.length===1&&i.children[0].tagName.toLowerCase()==="div"&&(n=i.children[0].innerHTML.trim()),this.formatCode(n)}else this.formatCode(this.props.codeExample||"")}catch(e){console.error("Error extracting iframe content:",e),this.formatCode(this.props.codeExample||"<!-- Error extracting content -->")}}dedentCode(e){if(!e||!e.trim())return e;const t=e.split(`
`);let o=1/0;for(const i of t){if(i.trim().length===0)continue;const a=i.match(/^[ \t]*/)?.[0].length||0;a<o&&(o=a)}return o===0||o===1/0?e.trim():t.map(i=>i.trim().length===0?"":i.slice(o)).join(`
`).trim()}async formatCode(e){const t=this.dedentCode(e);this.extractedCode=t;try{if(window.prettier&&window.prettierPlugins){const o=await window.prettier.format(t,{parser:"html",plugins:window.prettierPlugins.html?[window.prettierPlugins.html]:[],printWidth:80,tabWidth:2,useTabs:!1,htmlWhitespaceSensitivity:"css"});this.extractedCode=o}else this.extractedCode=t}catch(o){console.error("Failed to format code:",o),this.extractedCode=t}this.isCodeVisible?this.animateTyping(this.extractedCode||""):this.codeDisplay&&(this.codeDisplay.textContent="")}animateTyping(e,t=12){if(!this.codeDisplay)return;this.codeDisplay.textContent="",this.codeDisplay.classList.add("typing-cursor");let o=0;const n=e.length,i=()=>{if(this.codeDisplay.textContent+=e.charAt(o),o+=1,o<n){const a=Math.floor(Math.random()*20)-10;setTimeout(i,Math.max(4,t+a))}else setTimeout(()=>{this.codeDisplay.classList.remove("typing-cursor"),window.Prism&&window.Prism.highlightElement(this.codeDisplay)},120)};if(n===0){this.codeDisplay.classList.remove("typing-cursor"),this.codeDisplay.textContent="";return}setTimeout(i,t)}}(function(){if(typeof document<"u"){const s=()=>{document.querySelectorAll('[data-hydration-component="component-viewer"]').forEach(t=>{new c(t)})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",s):s()}})();
