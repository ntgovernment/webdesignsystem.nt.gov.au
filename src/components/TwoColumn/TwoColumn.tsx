import React from 'react'
import './TwoColumn.css'

export interface TwoColumnProps {
  leftContent: React.ReactNode
  rightContent: React.ReactNode
  leftWidth?: string
  rightWidth?: string
  gap?: string
  className?: string
}

export const TwoColumn: React.FC<TwoColumnProps> = ({
  leftContent,
  rightContent,
  leftWidth = '1fr',
  rightWidth = '1fr',
  gap = '2rem',
  className = '',
}) => {
  return (
    <div
      className={`nt-two-column ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `${leftWidth} ${rightWidth}`,
        gap: gap,
      }}
    >
      <div className="nt-two-column__left">{leftContent}</div>
      <div className="nt-two-column__right">{rightContent}</div>
    </div>
  )
}

export default TwoColumn
