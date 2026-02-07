import React from "react";
import "./Header.css";

export interface HeaderProps {
  /**
   * The title text to display in the header
   * @default "Web Design System"
   */
  title?: string;

  /**
   * URL to the logo image
   * @default "https://nt.gov.au/_design/latest/images/ntg-primary-reverse.svg"
   */
  logoSrc?: string;

  /**
   * Alt text for the logo
   * @default "NT Government Logo"
   */
  logoAlt?: string;

  /**
   * Font Awesome icon class for the menu button
   * @default "fa-magnifying-glass"
   */
  icon?: string;

  /**
   * Callback function when the menu button is clicked
   */
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Web Design System",
  logoSrc = "https://nt.gov.au/_design/latest/images/ntg-primary-reverse.svg",
  logoAlt = "NT Government Logo",
  icon = "fa-magnifying-glass",
  onMenuClick,
}) => {
  return (
    <div className="nt-header">
      <div className="nt-header__inner">
        <div className="nt-header__left">
          <div className="nt-header__logo-section">
            <img src={logoSrc} alt={logoAlt} className="nt-header__logo" />
            <div className="nt-header__title">{title}</div>
          </div>
        </div>
        <div className="nt-header__right">
          <div className="nt-header__actions">
            <button
              className="nt-header__menu-button"
              onClick={onMenuClick}
              aria-label="Menu"
            >
              <div className="nt-header__icon-container">
                <i className={`fa-light ${icon}`}></i>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
