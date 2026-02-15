# Deploy PageCard to Squiz DXP

This checklist prepares and deploys the `PageCard` component to Squiz DXP via your Git File Bridge.

Steps

1. Review `deploy/` contents locally (bundles and nesters):
   - `deploy/web-design-system.min.css`
   - `deploy/web-design-system.min.js`
   - `deploy/nesters/page-card.html`

2. Commit deployment files to the repository branch used by your Git File Bridge:

```bash
git add deploy DEPLOY_PAGECARD.md
git commit -m "chore(deploy): add PageCard nester and deployment checklist"
git push
```

3. Verify Git File Bridge sync:
   - Check the bridge logs or Matrix asset change history to confirm files arrived.
   - Note the Squiz Matrix asset ID where the files were published (used below as `ASSET_ID`).

4. Update paint layouts to reference the deployed bundles (replace `ASSET_ID`):

```html
<link
  rel="stylesheet"
  href="%globals_asset_url_with_hash:ASSET_ID:deploy/web-design-system.min.css%"
/>
<script src="%globals_asset_url_with_hash:ASSET_ID:deploy/web-design-system.min.js%"></script>
```

5. Register/verify the nester in a paint layout (example):

```html
%nester_asset_name:page-card.html%
<!-- include where you want the component to render -->
```

6. Test in Squiz Matrix author and preview environments:
   - Add the `PageCard` component in the DXP component configuration (asset picker selects `assetId` values).
   - Verify rendered output, images, links and accessibility features in preview and public-facing pages.

7. Rollback plan
   - To roll back, revert the commit and push the revert, or restore previous files in the Git File Bridge target.

Notes

- If you need me to push the commit, reply `push` and I will run the git push step.
- If your Git File Bridge requires a different branch or path, update the commands accordingly.
