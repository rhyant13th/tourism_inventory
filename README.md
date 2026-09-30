# Tourism Enterprise & Attraction Inventory (modular version)

Upload the WHOLE folder contents to your website (for example GitHub Pages), keeping the folders together.
`index.html` must sit at the top level.

> This app must be opened from a website (like GitHub Pages). Double-clicking `index.html` on your
> computer will NOT work, because the browser blocks the screen files from loading that way.

## Where to edit what

| I want to change...                                          | Edit this file              |
|--------------------------------------------------------------|-----------------------------|
| Admin email, logo files, Firebase project keys               | `js/config.js`              |
| Dropdown choices (municipalities, types, classifications, accreditation levels, attraction categories, Excel headings) | `js/lists.js` |
| Enterprises screen (list, form, view)                        | `js/establishments.jsx`     |
| Accreditation screen                                         | `js/accreditation.jsx`      |
| Attractions screen                                           | `js/attractions.jsx`        |
| CBTO screen                                                  | `js/cbto.jsx`               |
| Directory screen                                             | `js/directory.jsx`          |
| Analytics screen                                             | `js/analytics.jsx`          |
| Login screen                                                 | `js/login.jsx`              |
| Left menu, tabs, save button logic                           | `js/app.jsx`                |
| Backup / restore buttons                                     | `js/backup.jsx`             |
| Icons, form fields, pop-ups, confirm boxes                   | `js/ui-components.jsx`      |
| Which columns/filters appear on printouts                    | `js/print-builders.jsx`     |
| Printed table layout                                         | `js/records-print.jsx`      |
| Excel backup / import logic                                  | `js/excel-io.js`            |
| Accreditation rules (status, coverage years)                 | `js/accreditation-logic.js` |
| Firebase save / load                                         | `js/cloud.js`               |
| Small helpers (dates, totals, duplicate finder)              | `js/helpers.js`             |
| Colors and main look                                         | `css/base.css`, `css/design-override.css` |
| Left menu / page layout                                      | `css/layout.css`, `css/dashboard-theme.css` |
| Print styles                                                 | `css/directory-print.css`, `css/records-print.css` |
| Analytics look                                               | `css/analytics.css`         |
| Logo size                                                    | `css/logo.css`              |
| Logo pictures                                                | `assets/` (same file name)  |

## Rules to remember
- `.js` files are plain logic. `.jsx` files are screens (they contain HTML-like tags). Both share one global scope, so no imports are needed.
- Script order in `index.html` matters. `js/config.js` loads first, `js/app.jsx` must stay LAST.
- CSS order matters: later files override earlier ones (`design-override.css` is meant to win).
- If you add a new file, add its `<script>` line in `index.html` before `app.jsx`. Use `type="text/babel" data-presets="react"` for `.jsx` files.
- The admin email now lives in `js/config.js` (it used to be inside the App code).
