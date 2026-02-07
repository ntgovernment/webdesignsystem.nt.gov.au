class n{container;config;constructor(t,e={}){this.container=t,this.config={title:e.title||"Web Design System",logoSrc:e.logoSrc||"https://nt.gov.au/_design/latest/images/ntg-primary-reverse.svg",logoAlt:e.logoAlt||"NT Government Logo",icon:e.icon||"fa-magnifying-glass",onMenuClick:e.onMenuClick},this.render()}render(){if(this.container.innerHTML=`
      <div class="nt-header">
        <div class="nt-header__inner">
          <div class="nt-header__left">
            <div class="nt-header__logo-section">
              <img src="${this.config.logoSrc}" alt="${this.config.logoAlt}" class="nt-header__logo" />
              <div class="nt-header__title">${this.config.title}</div>
            </div>
          </div>
          <div class="nt-header__right">
            <div class="nt-header__actions">
              <button class="nt-header__menu-button" aria-label="Menu">
                <div class="nt-header__icon-container">
                  <i class="fa-light ${this.config.icon}"></i>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    `,this.config.onMenuClick){const t=this.container.querySelector(".nt-header__menu-button");t&&t.addEventListener("click",this.config.onMenuClick)}}updateConfig(t){this.config={...this.config,...t},this.render()}destroy(){this.container.innerHTML=""}}if(typeof document<"u"){const i=()=>{const t=document.getElementById("nt-header-root");if(t){const e={title:t.getAttribute("data-title")||void 0,logoSrc:t.getAttribute("data-logo-src")||void 0,logoAlt:t.getAttribute("data-logo-alt")||void 0,icon:t.getAttribute("data-icon")||void 0};new n(t,e)}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",i):i()}typeof window<"u"&&(window.NTGHeader=n);
