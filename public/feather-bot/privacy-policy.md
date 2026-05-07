# Privacy Policy (Feather Bot)

**Effective date:** 08-05-2026

This Privacy Policy explains what data **Feather Bot** (“the bot”, “we”, “us”) processes when you use it on Discord, why we process it, and what choices you have.

## Scope

This policy applies to data processed by the bot through Discord interactions (slash commands, buttons, modals, and DMs) and related backend services the bot calls to provide features.

## Data we process

### Discord account and server identifiers

To operate inside Discord and provide personalized features, the bot may process:

- Discord user ID (required to reply, DM, store per-user settings).
- Discord username/tag (shown in some outputs; stored for account linking and moderation workflows).
- Guild ID and channel ID (used for notification routing and issue reports).

**Important:** The bot is configured with the Discord **Guilds** intent only, and does **not** read general message content from servers.

### Data you provide to the bot

Depending on the commands you use, you may provide:

- Minecraft username (for profile lookup and optional verification/linking).
- Issue reports (`/report`): issue description, reproduction steps, and optional attachment links (Discord-hosted URLs).
- Operator DMs (`/message`): message text and optional attachments to be sent to a target user.
- Bazaar aliases/alerts (`/bz mapping`, `/bz alert`): alias names, target prices, and alert direction.
- Notification settings (`/notify`, `/vote`): your chosen rule parameters (event type, lead time, occurrences, etc.).

### Game/profile data (fetched from third parties)

When you request player, SkyBlock, auctions, bazaar, leaderboards, or similar features, the bot fetches and displays game-related data from third-party APIs (see “Third-party services”).

## How we use data

We use the data above to:

- Execute commands and render responses inside Discord.
- Store per-user preferences (e.g., reminders, bazaar mappings/alerts, vote tracking).
- Support optional verification workflows linking Discord <=> Minecraft usernames.
- Deliver scheduled reminders via DM (vote reminders, contest/zoo/new year/season notifications).
- Allow operators to manage bot functions (operator list, verification, unlinking).
- Generate charts for bazaar history (images).
- Maintain and optionally publish leaderboard submission data.

## Where data is stored

The bot stores some data locally on the machine where it is hosted. In this repository, that data is persisted under `data/` (and `leaderboards/` when used), including:

- `data/accounts.db`: Discord ID + Discord username + linked Minecraft username (verification/linking).
- `data/notify-contest.db`: notification rules (user/guild/channel IDs and rule settings) and vote history.
- `data/bazaar-store.json`: bazaar alias mappings and bazaar alerts.
- `data/bazaar.db`: bazaar price snapshots by item ID (no Discord identifiers).
- `data/ops.json`: operator Discord IDs (and an optional `OWNER_ID` from environment).
- `data/leaderboard-submissions.json` and files under `leaderboards/`: leaderboard submission content (Minecraft usernames/profile IDs and submitted stats/collections), depending on configuration.

The bot also uses an in-memory cache for interactive UI state (typically minutes to ~30 minutes) which is not written to disk.

## Third-party services and sharing

The bot shares data with third parties only as needed to provide features.

### Network requests

#### Discord (platform API)

- Discord API (via `discord.js`): used to register slash commands, respond to interactions, fetch users/channels/messages for bot features, and send DMs/notifications.
- Discord webhooks (via Discord Webhook URLs): used for account verification workflows and issue reports (see below).

#### CraftersMC API (`api.craftersmc.net`)

The bot uses GET requests to the CraftersMC API including:

- `GET /v1/player/:username`
- `GET /v1/skyblock/profile/:profileId`
- `GET /v1/network/status`
- `GET /v1/skyblock/auctions` (paged)
- `GET /v1/skyblock/auctions/ended` (paged)
- `GET /v1/skyblock/auction/:auctionId`
- `GET /v1/skyblock/auctions/player/:uuid`

For bazaar features specifically:

- `GET /v1/skyblock/bazaar/items`
- `GET /v1/skyblock/bazaar/:itemId/details`

#### CraftersMC Guides endpoints

- Bazaar history:
  - `GET https://bazaar.craftersmcguides.workers.dev/api/items/${itemId}/history`
- Leaderboards:
  - `GET https://leaderboards.craftersmcguides.workers.dev/api/leaderboards/multi`
  - `GET https://leaderboards.craftersmcguides.workers.dev/api/leaderboards/collections`
  - `GET https://leaderboards.craftersmcguides.workers.dev/api/leaderboards/boss-time`
  - `GET https://leaderboards.craftersmcguides.workers.dev/api/leaderboards/farming-contests`

#### CraftersMC Wiki (`craftersmc.wiki.gg`)

- `GET https://craftersmc.wiki.gg/api.php` (MediaWiki API) for search and page details, including:
  - `action=query&list=search...`
  - `action=query&prop=extracts|pageimages...`
  - `action=parse&prop=wikitext...`

#### QuickChart (`quickchart.io`)

- `GET https://quickchart.io/chart?...` to generate bazaar graph images. The request includes chart configuration data (timestamps/prices/averages) and is not intended to include Discord identifiers.

#### GitHub

- `GET https://api.github.com/repos/:owner/:repo/contents/:path` (download/read leaderboard files)
- `PUT https://api.github.com/repos/:owner/:repo/contents/:path` (upload/update leaderboard files)

#### Discord webhooks

- `POST https://discord.com/api/webhooks/...` for:
  - verification request notifications (`/account`)
  - account link notifications (`/verify`)
  - issue reports (`/report`) (sent to a webhook when configured; otherwise the report may be posted to a Discord channel)

#### External links (opened by users)

Some commands provide links (for example, the vote link used by `/vote`). If you open these links, your browsing is governed by the third party’s privacy practices.

We do not sell personal data.

## Retention

Retention depends on the feature:

- Account links are kept until unlinked (e.g., via operator action or bot owner maintenance).
- Notification rules and bazaar alerts/mappings are kept until you remove them.
- Vote history is automatically **purged outside the current month** (UTC) when recorded/queried.
- Bazaar price snapshots and leaderboard files may be retained until the host deletes them.
- In-memory interaction context expires automatically after its TTL (minutes).

## Your choices and controls

You can manage or request removal of certain data via bot commands, depending on server configuration and permissions:

- Account link removal: `/unlink` (operator) or by contacting the bot owner/operators.
- Notification removal: `/notify remove`.
- Bazaar mapping/alert removal: `/bz mapping ... remove`, `/bz alert ... remove`.
- Vote reminders: managed through `/vote` and removal through `/notify remove` (vote rule IDs).

If you need help deleting data that isn’t exposed via commands, contact the bot owner/operators (see “Contact”).

## Security

We take reasonable steps to protect stored data (e.g., limiting stored fields to what’s needed). However, no method of storage or transmission is 100% secure.

## Children’s privacy

The bot is not directed to children under 13 (or the minimum age required in your jurisdiction). Do not use the bot if you are under the applicable age for Discord and online services.

## Changes to this policy

We may update this policy from time to time. The “Effective date” at the top reflects the latest version included with this codebase.

## Contact

For privacy questions or deletion requests, contact the bot owner/operators or the project support server referenced by the bot’s `/info` command.
