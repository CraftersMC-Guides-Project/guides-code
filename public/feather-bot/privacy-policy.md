# Privacy Policy (Feather Bot)

**Effective date:** September 25, 2026

This Privacy Policy describes how **Feather Bot** (“the bot”, “we”, “us”), maintained by the **CraftersMC Guides Project**, collects, uses, stores, and protects data when you use the bot within Discord or interact with its associated utilities.


## 1) Scope and Principles

This policy applies to all interactions with Feather Bot, including slash commands, context menus, interactive buttons, modal dialogs, Direct Messages (DMs), and backend API calls.

We adhere to the following principles:
- **Data Minimization:** We only collect data strictly necessary to provide bot functionality.
- **No Content Snooping:** The bot operates with the Discord **Guilds** intent only and does **not** read or store general chat message content from Discord servers.
- **No Selling of Data:** We never sell, rent, or monetize your personal data.


## 2) Information We Process

### A. Discord Account and Guild Identifiers
To execute commands and deliver personalized experiences, the bot processes:
- **Discord User ID:** Required to process interactions, route DMs (e.g., event reminders, vote cooldowns), manage alert subscriptions, and enforce button interaction ownership.
- **Discord Username & Tag:** Stored only when voluntary account linking (`/verify`, `/account`) is completed, or during operator management workflows.
- **Guild & Channel IDs:** Processed transiently to route slash command responses, notification channels, and bug report submissions.

### B. Voluntary User-Provided Information
Depending on the features you use, you may supply:
- **Minecraft Username & UUID:** Provided when querying player/profile stats, linking accounts, or submitting leaderboard scores.
- **Custom Alert Rules & Preferences:** Target buy/sell prices for `/bz alert` or `/ah alert`, custom item alias mappings, and event notification lead times (`/notify`).
- **Issue Reports (`/report`):** Bug descriptions, reproduction steps, and optional Discord image/attachment URLs.
- **Leaderboard Submissions (`/submit`, `/player`):** Minecraft player identification, profile selection, stat proofs, and submission privacy toggles.

### C. Public Game and Market Data
When lookups are executed, the bot fetches publicly accessible data from the CraftersMC game network and third-party APIs (e.g., SkyBlock profiles, skills, collections, slayers, inventory NBT data, auction listings, and bazaar order books).


## 3) How We Use Processed Data

We utilize processed information solely to:
- Render rich, interactive Discord embeds and Components V2 layouts.
- Compute accurate player statistics, Skill Averages, and inventory Networth across all 18+ storage containers.
- Deliver automated Direct Message alerts for Ethan's farming contests, SkyBlock calendar events, and server vote cooldowns.
- Maintain and display competitive rankings across the 12 cloud leaderboard categories.
- Generate bazaar price trend visualizations and calculate auction market price averages.
- Allow server administrators and bot operators to verify community members and investigate reported issues.


## 4) Data Storage and Hosting Infrastructure

Feather Bot is hosted on dedicated **AIC Cloud VPS (Paid)** infrastructure. Data is securely stored within isolated SQLite databases and JSON configuration stores on the VPS under the `data/` and `leaderboards/` directories:

| Storage File | Stored Data & Purpose | Retention Period |
| :--- | :--- | :--- |
| `data/accounts.db` | Discord ID, Discord Username, linked Minecraft UUID/Name, and link timestamp. | Kept until unlinked via `/unlink` or operator action. |
| `data/notify-contest.db` | User notification rules, event subscriptions, and monthly vote cooldown tracking. | Rules kept until deleted by user; vote logs automatically purged outside the active calendar month (UTC). |
| `data/bazaar.db` | Historical bazaar product price snapshots by item ID (no personal identifiers). | Retained for chart generation and trend analytics. |
| `data/bazaar-store.json` | User bazaar price alerts and custom item alias mappings. | Kept until removed by user via `/bz alert remove`. |
| `data/auction-history.db` | Historical auction sales and market observations (item ID, price, seller UUID). | Retained for market valuation and price average calculations. |
| `data/auction-alerts.json` | User auction threshold alert rules (Discord ID, Item ID, target price). | Kept until removed by user via `/ah alert remove`. |
| `data/ops.json` | Authorized operator Discord IDs for administrative access control. | Maintained by the bot owner. |
| `data/leaderboard-submissions.json` | Cloud leaderboard submissions, verified stat records, and category rankings. | Retained for leaderboard history and GitHub backup sync. |

### Ephemeral Memory Caching
Interactive UI components (session tokens, pagination state, multi-select dropdown states) are held in volatile in-memory cache with an automated **TTL expiration (typically 5–15 minutes)** and are never persisted to disk.


## 5) Third-Party Services & External API Routing

All external API interactions are routed centrally through `utils/api.js` with sanitization, caching, and rate-limiting:

- **Discord API (`discord.js`):** Interaction dispatching, command registration, and DM delivery.
- **Discord Webhooks:** Used for automated verification logs and `/report` issue forwarding.
- **CraftersMC API & Dedicated Cloud Endpoints:**
  - `https://proxy.craftersmcguides.workers.dev/` — Secure proxy for player profiles, inventories, auctions, and network status.
  - `https://bazaar.craftersmcguides.workers.dev/` — Bazaar item summaries and order book history.
  - **CraftersMC Guides Leaderboard REST API** — Dedicated cloud leaderboard backend service.
- **CraftersMC Community Wiki (`craftersmc.wiki.gg`):** MediaWiki API integration for item data, recipes, and infoboxes.
- **Minecraft Skin & Avatar APIs (`mc-api.io`):** Used to render 3D player skin busts and head icons.
- **QuickChart (`quickchart.io`):** Generates bazaar price chart images (chart config parameters only; no personal data transmitted).
- **GitHub REST API (`api.github.com`):** Automated backup synchronization for cloud leaderboard records.


## 6) Data Security Measures

We enforce rigorous security standards to safeguard stored data:
- **Centralized Network Dispatch:** API keys and sensitive tokens are isolated on the VPS environment and never exposed in command responses or public client payloads.
- **Interaction Ownership Protection:** UI buttons and navigation states are cryptographically validated against the invoking Discord User ID.


## 7) User Rights, Controls, and Data Deletion

You have full control over your data stored by Feather Bot:

1. **Account Unlinking:** You can request account unlinking at any time using `/unlink` (or by contacting operators).
2. **Alert & Rule Removal:**
   - Remove notification rules via `/notify remove`.
   - Remove bazaar price alerts via `/bz alert <item> remove`.
   - Remove auction alerts via `/ah alert <item> remove`.
3. **Full Data Deletion Request (Right to Erasure):**
   To request complete deletion of all records associated with your Discord User ID or Minecraft username across all databases, join our [Support Server](https://discord.gg/hdBx7Ejvcf) and open a data deletion request with the bot operators.


## 8) Children’s Privacy

Feather Bot is not intended for or directed toward children under 13 years of age (or the minimum legal age required in your country). If we become aware that personal data has been collected from an underage user without parental consent, we will promptly delete that data.


## 9) Changes to this Privacy Policy

We may update this Privacy Policy as new features, commands, or storage mechanisms are introduced. The updated policy will be published in this file with a revised effective date.


## 10) Contact Us

If you have questions, concerns, or requests regarding this Privacy Policy or your data:
- **Discord Support Server:** [Join Support](https://discord.gg/hdBx7Ejvcf)
- **GitHub Project:** [CraftersMC-Guides-Project](https://github.com/CraftersMC-Guides-Project/)
- **Website:** [CraftersMC Guides](https://craftersmc-guides.pages.dev/)
