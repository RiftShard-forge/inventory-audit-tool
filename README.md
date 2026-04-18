# Inventory Audit Tool

A modular, browser-based asset audit platform for IT teams. Upload ManageEngine and Rippling exports, run automated audits across asset categories, and download structured reports — no Google Sheets required.

Built by [RiftShard-forge](https://github.com/RiftShard-forge).

---

## Features

- Upload MEData and Rippling CSV exports and run audits in the browser
- Modular architecture — enable or disable asset modules independently
- Flags terminated users, unaccounted assets, and suppressed (blacklisted) devices
- Exports structured `.xlsx` reports with separate tabs per audit category
- Persistent configuration — known models, whitelists, blacklists, and site mappings saved between sessions
- Run history log with lifetime totals

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v18 or higher
- npm v9 or higher

### Installation

```bash
git clone https://github.com/RiftShard-forge/inventory-audit-tool.git
cd inventory-audit-tool
npm install
npm start
```

The app will open at `http://localhost:3000`.

---

## How to Use

1. **Export your data** — export the processed Rippling roster (RDExport or COExport tab) and your ManageEngine MEData report as CSV files
2. **Upload files** — go to Run Audit, drop in both CSV files
3. **Select module** — choose Workstations, Monitors, or Headsets
4. **Run** — click Run Audit and review the results
5. **Download** — click Download .xlsx to save your report

---
## Project Structure
```
src/
├── components/       # Reusable UI components
├── config/           # Config manager and default config template
├── modules/          # Future module-specific logic
├── pages/            # App pages (RunAudit, ModuleManager, Settings, History)
├── utils/            # Audit engine and Excel export utility
├── App.js            # Root component and navigation
└── index.js          # Entry point
```
---

## Audit Modules

| Module | Source | Flags |
|---|---|---|
| Workstations | ManageEngine Workstations export | Terminated users, unaccounted assets |
| Monitors | ManageEngine Monitors export | Terminated users, unaccounted assets |
| Headsets | ManageEngine Headsets export | Terminated users, unaccounted assets |

---

## Configuration

Each module has its own configuration panel under **Module Manager**:

- **Known Models** — model names that will not be flagged as outstanding
- **Whitelist** — serial numbers always marked as clean
- **Blacklist** — serial numbers suppressed from audit results

Site name mappings are managed under **Settings** and applied automatically on every audit run.

---

## Compliance Note

This repository contains no company-specific data. All configuration values, site names, and roster data are managed locally in your browser or provided at runtime via CSV upload. No sensitive data is committed to this repository.

To use this tool in your environment:
1. Clone the repository
2. Run `npm install && npm start`
3. Configure your site mappings under Settings
4. Add your known models and lists under Module Manager

---

## Roadmap

### Phase 2 — Core Audit Enhancements
- [ ] Dynamic column detection — auto-map CSV headers instead of hardcoded column names
- [ ] Dynamic site name detection — detect site names from CSV and suggest mappings
- [ ] Mutual exclusivity for modules — selecting one module auto-disables others
- [ ] In-app results preview — view audit results in a table before downloading
- [ ] Column visibility control — choose which columns appear in output and preview

### Phase 3 — Output & Reporting
- [ ] Dynamic output format options — flexible report structure choices
- [ ] Specialist to Inventory Manager CSV template — standardized handoff template
- [ ] Inventory Manager to ManageEngine import — generate ManageEngine-ready bulk update CSV

### Phase 4 — Data Pipeline Migration
- [ ] Migrate Rippling data pipeline — replace Google Sheets workflow with built-in importer
- [ ] Associate lookup tool — search employee info by government ID with per-specialist session isolation

### Phase 5 — Access & Security
- [ ] User roles — admin vs read-only access control
- [ ] API integration layer — auto-generate ManageEngine tickets and send email notifications on audit findings

---

## Tech Stack

- [React](https://react.dev) — UI framework
- [SheetJS](https://sheetjs.com) — Excel file generation
- [FileSaver.js](https://github.com/eligrey/FileSaver.js) — browser file downloads

---

## License

Personal project — all rights reserved.