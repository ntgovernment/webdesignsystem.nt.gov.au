# NT Design System

Documentation website and component library for the Northern Territory Government design system.

This repository hosts the compiled JS and CSS files for deployment to Squiz Matrix via Git File Bridge, along with the component viewer application.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

Run the component viewer locally:

```bash
npm run dev
```

This will start a development server at `http://localhost:5173` where you can view and test all components.

### Building

Build the component viewer:

```bash
npm run build
```

Build individual components for deployment:

```bash
npm run build:components
```

### Deployment to Squiz DXP

Prepare files for Squiz DXP Component Services deployment:

```bash
npm run deploy:squiz
```

This will:
1. Build all components and the viewer
2. Copy compiled JS and CSS to the `deploy/` directory
3. Generate a deployment manifest
4. Organize files for Git File Bridge sync

The deployment structure:
```
deploy/
├── components/       # Individual component builds
├── viewer/           # Component viewer app
├── assets/           # CSS, images, and other assets
└── manifest.json     # Deployment metadata
```

## 📦 Components

### Two Column Component

A responsive two-column layout that automatically stacks on mobile devices.

```tsx
import { TwoColumn } from 'nt-design-system'

<TwoColumn
  leftContent={<div>Left content</div>}
  rightContent={<div>Right content</div>}
  leftWidth="2fr"
  rightWidth="1fr"
  gap="2rem"
/>
```

**Props:**
- `leftContent` (ReactNode): Content for the left column
- `rightContent` (ReactNode): Content for the right column
- `leftWidth` (string): CSS grid width for left column (default: '1fr')
- `rightWidth` (string): CSS grid width for right column (default: '1fr')
- `gap` (string): Gap between columns (default: '2rem')
- `className` (string): Additional CSS classes

### Theme Switcher Component

A component that allows users to switch between light and dark themes with localStorage persistence.

```tsx
import { ThemeSwitcher } from 'nt-design-system'

<ThemeSwitcher
  themes={['light', 'dark']}
  defaultTheme="light"
  storageKey="nt-design-system-theme"
/>
```

**Props:**
- `themes` (string[]): Available theme options (default: ['light', 'dark'])
- `defaultTheme` (string): Initial theme (default: 'light')
- `storageKey` (string): localStorage key for persistence
- `className` (string): Additional CSS classes

### Component Viewer

A comprehensive viewer application for browsing and testing all design system components.

```tsx
import { ComponentViewer } from 'nt-design-system'

<ComponentViewer />
```

## 🎨 Using with Squiz Matrix

### Referencing in Paint Layouts

After deploying via Git File Bridge, reference the compiled assets in your Squiz Matrix paint layouts:

```html
<!-- Component Viewer -->
<script src="%globals_asset_url:XXXXX%/viewer/index.js"></script>
<link rel="stylesheet" href="%globals_asset_url:XXXXX%/assets/index.css">

<!-- Individual Components -->
<script src="%globals_asset_url:XXXXX%/components/two-column.js"></script>
<script src="%globals_asset_url:XXXXX%/components/theme-switcher.js"></script>
```

Replace `XXXXX` with your Squiz Matrix asset ID.

## 🛠️ Tech Stack

- **Vite** - Build tool and dev server
- **React 19** - UI library
- **TypeScript** - Type safety
- **ESLint** - Code linting

## 📁 Project Structure

```
.
├── src/
│   ├── components/
│   │   ├── ComponentViewer/  # Component browser application
│   │   ├── ThemeSwitcher/    # Theme switching component
│   │   └── TwoColumn/        # Two-column layout component
│   ├── App.tsx               # Main application
│   └── main.tsx              # Entry point
├── scripts/
│   └── deploy-squiz.js       # Squiz DXP deployment script
├── deploy/                   # Deployment output (generated)
├── dist/                     # Build output (generated)
├── package.json
├── vite.config.ts
└── README.md
```

## 🔧 Configuration

### Environment Variables

- `SQUIZ_DEPLOY_PATH` - Custom deployment path (default: `./deploy`)

### Vite Configuration

The `vite.config.ts` supports multiple build modes:

- **Default mode**: Builds the component viewer application
- **Components mode**: Builds individual components as separate modules

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build component viewer for production
- `npm run build:components` - Build individual components
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run deploy:squiz` - Prepare deployment for Squiz DXP

## 📄 License

Northern Territory Government

## 🤝 Contributing

This repository is managed by the Northern Territory Government. For contributions or issues, please contact the design system team.
