class h{container;props;activeThemeIndex=0;iframes=new Map;constructor(e){this.container=e,console.log("[ThemeSwitcher] Initializing for container:",e),console.log("[ThemeSwitcher] Raw data-hydration-props:",e.getAttribute("data-hydration-props")),console.log("[ThemeSwitcher] Dataset hydrationProps:",e.dataset.hydrationProps);try{this.props=JSON.parse(e.dataset.hydrationProps||"{}"),console.log("[ThemeSwitcher] Parsed props successfully:",this.props)}catch(t){console.error("[ThemeSwitcher] Failed to parse hydration props:",t),console.error("[ThemeSwitcher] Raw value:",e.dataset.hydrationProps),this.renderError(`Failed to parse props: ${t instanceof Error?t.message:String(t)}`),this.props={themes:[]};return}if(!this.props.themes||this.props.themes.length===0){console.error("[ThemeSwitcher] No themes provided in props"),this.renderError("No themes provided");return}if(this.props.themes.length>3){console.error("[ThemeSwitcher] Too many themes:",this.props.themes.length),this.renderError("Maximum 3 themes allowed");return}for(const t of this.props.themes)if(!t.name||!t.url){console.error("[ThemeSwitcher] Invalid theme object:",t),this.renderError("Each theme must have a name and url");return}console.log("[ThemeSwitcher] Validation passed, rendering",this.props.themes.length,"theme(s)"),this.activeThemeIndex=this.getInitialThemeIndex(),this.render(),this.setupEventListeners(),console.log("[ThemeSwitcher] Initialization complete")}getInitialThemeIndex(){const{themes:e,defaultTheme:t}=this.props;if(t){const i=e.findIndex(n=>n.name===t);if(i!==-1)return i}return 0}renderError(e){this.container.innerHTML=`
      <div class="nt-theme-switcher-error" style="padding: 2rem; background: #fee; border: 2px solid #c33; color: #c33; border-radius: 4px;">
        <strong>Theme Switcher Error:</strong> ${this.escapeHtml(e)}
      </div>
    `}render(){const{themes:e,height:t="600px"}=this.props;if(e.length===1){this.container.innerHTML=`
        <div class="nt-theme-switcher__content">
          <iframe
            src="${this.escapeHtml(e[0].url)}"
            class="nt-theme-switcher__iframe"
            style="height: ${this.escapeHtml(t)};"
            title="${this.escapeHtml(e[0].name)}"
            frameborder="0"
            data-theme-index="0"
          ></iframe>
        </div>
      `;return}const i=e.map((s,r)=>{const o=r===this.activeThemeIndex;return`
        <button
          class="nt-theme-switcher__tab ${o?"nt-theme-switcher__tab--active":""}"
          data-theme-index="${r}"
          aria-selected="${o}"
          role="tab"
        >
          ${this.escapeHtml(s.name)}
        </button>
      `}).join(""),n=e.map((s,r)=>{const o=r===this.activeThemeIndex;return`
        <iframe
          src="${this.escapeHtml(s.url)}"
          class="nt-theme-switcher__iframe"
          style="height: ${this.escapeHtml(t)}; display: ${o?"block":"none"};"
          title="${this.escapeHtml(s.name)}"
          frameborder="0"
          data-theme-index="${r}"
        ></iframe>
      `}).join("");this.container.innerHTML=`
      <div class="nt-theme-switcher__tabs" role="tablist">
        ${i}
      </div>
      <div class="nt-theme-switcher__content">
        ${n}
      </div>
    `,this.container.querySelectorAll(".nt-theme-switcher__iframe").forEach(s=>{const r=parseInt(s.dataset.themeIndex||"0",10);this.iframes.set(r,s)})}escapeHtml(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}setupEventListeners(){this.container.querySelectorAll(".nt-theme-switcher__tab").forEach(t=>{t.addEventListener("click",()=>{const i=parseInt(t.dataset.themeIndex||"0",10);this.switchTheme(i)})})}switchTheme(e){if(e===this.activeThemeIndex)return;const t=this.activeThemeIndex;this.activeThemeIndex=e,this.container.querySelectorAll(".nt-theme-switcher__tab").forEach((r,o)=>{o===e?(r.classList.add("nt-theme-switcher__tab--active"),r.setAttribute("aria-selected","true")):(r.classList.remove("nt-theme-switcher__tab--active"),r.setAttribute("aria-selected","false"))});const n=this.iframes.get(t),s=this.iframes.get(e);n&&(n.style.display="none"),s&&(s.style.display="block")}}(function(){if(typeof document<"u"){const a=()=>{console.log("[ThemeSwitcher] Auto-initialization starting, readyState:",document.readyState);const e=document.querySelectorAll('[data-hydration-component="theme-switcher"]');console.log("[ThemeSwitcher] Found",e.length,"container(s) to hydrate"),e.length===0&&console.warn('[ThemeSwitcher] No elements found with data-hydration-component="theme-switcher"'),e.forEach((t,i)=>{console.log(`[ThemeSwitcher] Hydrating container ${i+1}/${e.length}`);try{new h(t)}catch(n){console.error(`[ThemeSwitcher] Failed to initialize container ${i+1}:`,n)}}),console.log("[ThemeSwitcher] Auto-initialization complete")};document.readyState==="loading"?(console.log("[ThemeSwitcher] Document still loading, waiting for DOMContentLoaded"),document.addEventListener("DOMContentLoaded",a)):(console.log("[ThemeSwitcher] Document already loaded, initializing immediately"),a())}})();
