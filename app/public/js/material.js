// Copied from the following documentation.
// Docs: https://github.com/material-components/material-web/blob/main/docs/quick-start.md
import "https://esm.run/@material/web@2.2.0/all.js";
import { styles as typescaleStyles } from "https://esm.run/@material/web@2.2.0/typography/md-typescale-styles.js";

// Allows MaterialUI's stylesheet to the existing DOM's stylesheet.
document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
