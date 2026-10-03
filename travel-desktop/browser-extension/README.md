# Selected-field browser companion

Opt-in Chrome Manifest V3 extension, distributed as source for the hackathon prototype. It requests activeTab, scripting, session storage and **only loopback** host access (`http://127.0.0.1/*`); it does not request all-sites access, cookies or browsing history. Official design references: [activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab), [extension network requests](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests), [session storage](https://developer.chrome.com/docs/extensions/reference/api/storage).

## Installation and pairing

1. Review the source and manifest. In Chrome's Extensions page, enable Developer mode and Load unpacked this directory. Installation/permission approval is an employee action; the app does not install the extension automatically.
2. Sign in to Averill. Work → Share one browser draft field → Start browser pairing → Copy pairing details. Pairing expires after two minutes unless the extension connects.
3. In the intended HTTP/HTTPS draft tab, click the extension. Paste the copied pairing JSON and choose Share this tab. Click **one** draft field. Clicking another eligible field explicitly changes the shared field.
4. Averill clears the old observation as typing starts; it receives the chosen field after a 1.2-second pause, blur or selection. A periodic local read detects changes made by the editor itself when no typing debounce is pending. Whole draft/page extraction is not performed. A DOM field can include text beyond its current scroll position.
5. Review current sources in Averill. The employee makes all edits. Stop in Averill, the floating control or the extension revokes local pairing. Hiding/closing/navigating the tab stops sharing; a lost connection expires after 15 seconds. Pair again to resume.

## Limits and privacy

Only top-frame fields are supported. Cross-origin frames, shadow DOM, native select popups, closed editors and platform-specific controls require their own acceptance. Password/email/tel inputs and fields labelled as payment, credentials, recipient or personnel are excluded. Credential-shaped strings/payment numbers are redacted again in the desktop. The short-lived pairing token remains in extension session storage and is absent from public workspace snapshots. Paste it only into this extension, never a website. No provider request, edit, send or post is automatic.

The local server checks loopback Host, an extension Origin, a random 256-bit token, one tab/origin and monotonic event sequence. A new session/person, Stop, lost heartbeat or app exit invalidates it. The extension relay never accepts an arbitrary destination URL from a page. Installation in the owner's Chrome profile and field transport on local fake pages were verified on 4 October 2026. Real-platform drafts and the remaining installed-browser edge cases remain manual acceptance gates.

## Evidence and requirements

`npm test` covers bridge authorization, stale/cross-tab rejection, edit invalidation, expiry, session rotation and source-backed structured field checks. `npm run verify:browser` exercises native IPC/UI and the actual content-script pause code in a synthetic DOM with a test extension client. This does not establish installed-extension or actual-platform success.

Approved files may contain explicit lines such as `Field requirement: email | audience | "Travel subscribers — Denmark".` Supported keys: audience, date, time, asset, procedure, version, disclosure. A requirement is checked only when its matching field was actually selected; other fields are labelled unobserved. OCR cannot invent field metadata, asset geometry, schedule state or publication.

Actual installed Chrome evidence: [4 October acceptance](../../docs/INSTALLED_EXTENSION_2026-10-04.md). Brevo selected-field correction/Stop passed; LinkedIn and Instagram transport were verified separately from task-specific rule acceptance.
