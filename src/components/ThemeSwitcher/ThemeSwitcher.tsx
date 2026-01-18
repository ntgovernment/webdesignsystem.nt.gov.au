import React, { useEffect, useState } from 'react'
import './ThemeSwitcher.css'

export interface ThemeSwitcherProps {
  themes?: string[]
  defaultTheme?: string
  storageKey?: string
  className?: string
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  themes = ['light', 'dark'],
  defaultTheme = 'light',
  storageKey = 'nt-design-system-theme',
  className = '',
}) => {
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    // Initialize state from localStorage
    const savedTheme = localStorage.getItem(storageKey)
    if (savedTheme && themes.includes(savedTheme)) {
      return savedTheme
    }
    return defaultTheme
  })

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', currentTheme)
  }, [currentTheme])

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme)
    localStorage.setItem(storageKey, theme)
  }

  return (
    <div className={`nt-theme-switcher ${className}`}>
      <label htmlFor="theme-select" className="nt-theme-switcher__label">
        Theme:
      </label>
      <select
        id="theme-select"
        className="nt-theme-switcher__select"
        value={currentTheme}
        onChange={(e) => handleThemeChange(e.target.value)}
      >
        {themes.map((theme) => (
          <option key={theme} value={theme}>
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ThemeSwitcher
