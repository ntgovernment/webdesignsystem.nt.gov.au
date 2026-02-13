# Squiz DXP Component Schemas

This directory contains JSON schemas for validating Squiz DXP component manifests and configurations.

## Schema Files

### component-manifest.schema.json

Main component manifest schema defining the structure of DXP component `manifest.json` files.

**Key Properties:**

- `$schema`: Reference to this schema version
- `namespace`: Component namespace (e.g., "web-design-system")
- `name`: Component name (lowercase with hyphens)
- `displayName`: Human-readable component name
- `description`: Component description
- `icon`: Component icon (references component-icons.schema.json)
- `type`: "edge" or "server" runtime
- `version`: Semver version (e.g., "1.0.0")
- `functions`: Array of component functions
- `previews`: Preview configurations

### component-icons.schema.json

Font Awesome icon definitions for DXP components.

**Icon Format:**

```json
{
  "icon": {
    "id": "code",
    "color": {
      "type": "enum",
      "value": "blue"
    }
  }
}
```

**Available Icons:**
The schema includes 180+ Font Awesome icons curated for government design system use:

- **Navigation**: home, bars, chevron-_, arrow-_
- **Actions**: edit, trash, save, copy, download, upload
- **Content**: file-_, folder-_, envelope, book
- **Status**: check-circle, exclamation-triangle, info-circle
- **User**: user, lock, key, sign-in/out
- **Settings**: gear, cog, wrench
- **Data**: chart-bar, table, list

**Icon Naming:**

- Use bare icon names: `"code"`, `"magnifying-glass"`, `"home"`
- NOT full class names: ~~`"fa-light fa-code"`~~
- Icons are rendered as `fa-light fa-{id}` in the NT Gov Design System

**Color Options:**

- **Hex**: `{"type": "hex", "value": "#0066cc"}`
- **Enum**: `{"type": "enum", "value": "blue"}` (gray, blue, green, orange, red, purple, teal, yellow, pink)

### component-input.schema.json

Input validation schema for component functions. Extends content-meta.schema.json with DXP-specific constraints.

### content-meta.schema.json

Core JSON Schema meta-schema with Squiz Matrix extensions:

- Custom types: `FormattedText`, `SquizImage`, `SquizLink`
- Custom formats: `matrix-asset-uri`, `multi-line`, `phone`
- Matrix asset type enumeration

## Usage

### In Component Manifests

Reference the schema in your `manifest.json`:

```json
{
  "$schema": "http://localhost:3000/schemas/v1.json#",
  "namespace": "web-design-system",
  "name": "component-viewer",
  "displayName": "Component Viewer",
  "description": "Interactive component viewer with Storybook integration",
  "icon": {
    "id": "code",
    "color": {
      "type": "enum",
      "value": "blue"
    }
  },
  "type": "edge",
  "version": "1.0.0",
  "mainFunction": "render",
  "functions": [
    {
      "name": "render",
      "entry": "main.js",
      "input": {
        "type": "object",
        "properties": {
          "storybookUrl": {
            "type": "string",
            "title": "Storybook URL"
          }
        },
        "required": ["storybookUrl"]
      },
      "output": {
        "responseType": "html"
      }
    }
  ]
}
```

### Local Validation

The `$schema` property references the DXP CLI's local schema server during deployment. For IDE validation, you can optionally reference local schemas:

```json
{
  "$schema": "../schemas/component-manifest.schema.json"
}
```

**Note:** The DXP CLI uses `http://localhost:3000/schemas/v1.json#` during deployment, so this should remain in production manifests.

### Deployment

Deploy components using the Squiz DXP CLI:

```bash
dxp-next cmp deploy deploy/dxp-components/component-viewer
```

The CLI validates manifests against these schemas before deployment.

## Schema References

- **Squiz DXP Documentation**: [https://developers.squiz.net/dxp/](https://developers.squiz.net/dxp/)
- **JSON Schema Spec**: [https://json-schema.org/](https://json-schema.org/)
- **Font Awesome Icons**: [https://fontawesome.com/](https://fontawesome.com/)
- **NT Gov Font Awesome Kit**: `9bf658a5c7` (fa-light variants)

## Notes

- **MatrixAsset.schema.json**: Referenced by component-manifest.schema.json but not included. The DXP CLI provides this schema during runtime.
- **Icon Style**: All icons use `fa-light` style in the NT Gov Design System
- **Schema Versioning**: Schemas follow Squiz DXP versioning (currently v1)
- **Validation**: Schemas are validated during `dxp-next cmp deploy`

## Adding Custom Icons

To add custom Font Awesome icons, edit [component-icons.schema.json](component-icons.schema.json):

1. Add icon name to the `properties.id.enum` array
2. Use bare icon name (no "fa-" prefix)
3. Icon must be available in Font Awesome kit `9bf658a5c7`

Example:

```json
{
  "enum": ["home", "code", "your-new-icon"]
}
```
