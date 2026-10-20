# クラウド環境の再開手順

2026-10-18：以下の手順は現在環境で起動・機能テスト済みです。設定ドラフトへの保存は `stale_base`（元の設定版が公開または更新済み）で拒否され、反映されていません。インストール・秘密情報・ネットワーク変更は不要です。

設定にも反映する場合は、現行の環境設定から新しいセットアップチャットを開き、[更新提案JSON](environment-setup-proposal.json)を渡してください。新しいドラフトを読み、既存の要件と照合してから start_skill のみ更新します。旧ドラフトを読み直して再送しても競合は解決しません。

このファイルとJSONはリポジトリから取得でき、現在のワークスペースを引き継がないチャットにも渡せます。実行中のゲーム開発はこの競合とは独立して続けられます。

---

# 蒼刃の剣士 development workflow

Use the existing checkout at /workspace/sisaku-GPT-GAME. Each cloud task is isolated; do not create a worktree unless the user requests one. Read repository instructions and preserve user changes. Application changes must be authorized by the task; onboarding alone must not alter tracked source files.

The distributed index.html is standalone and needs no network assets or application packages. Development sources live in src/. Run `node scripts/build.cjs` after authorized source edits and `node scripts/build.cjs --check` to verify the artifact. Never edit the generated HTML directly.

Verify `node -p "require('playwright/package.json').version"`, `python --version`, and `/usr/bin/chromium --version`. This snapshot has Playwright 1.62.1, Python 3.12.14, Chromium 154 and Node 24. No application secrets are needed.

From /workspace/sisaku-GPT-GAME, first check whether a matching HTTP service exists. If not, start `python -m http.server 8000 --bind 127.0.0.1` as a managed background process. Verify with `curl --noproxy 127.0.0.1 --fail --silent http://127.0.0.1:8000/ -o /tmp/swordsman-served.html` and `cmp index.html /tmp/swordsman-served.html`. Restart the service in fresh tasks; processes do not survive environment snapshots. If port 8000 belongs to another service, use 8001 and set BASE_URL=http://127.0.0.1:8001 for tests. Do not stop unrelated services.

Run `node scripts/test.cjs` for the functional browser suites; it stops with the first failing exit status. Run `node tests/stage-journey.cjs` for all six regions with five rooms and three styles, and `NOVICE=1 node tests/stage-journey.cjs` for the first stage without timed dodge. `node scripts/test.cjs --journeys` includes all. The public player flow is tested by campaign.cjs, regions.cjs, campaign-usability.cjs and stage-journey.cjs. Legacy combat fixtures test underlying mechanics separately; do not mistake them for the new player flow. Inspect errors and screenshots under /tmp. Read docs/REQUIREMENTS.md and docs/IMPROVEMENT-LOG.md for limitations.

The host Chromium policy blocks file:// navigation; portability.cjs reports that check unrun and validates the single HTML over HTTP with storage available and unavailable. Human first-play enjoyment and physical mobile usability remain unverified. Do not present localhost addresses as user-facing preview links. Saving these instructions does not publish a deployment or environment snapshot.
