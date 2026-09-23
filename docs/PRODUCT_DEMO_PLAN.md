# Averill product demo plan

Decision record, 23 September 2026. The first complete product path is marketing. Aurelia Travel remains disposable sample data, not the product model.

## Buyer and employee journey

1. An administrator creates a local company workspace and adds departments and people. The hackathon demonstrates role switching on one computer; it does not claim network synchronization.
2. The administrator imports a selected folder or files. Each imported file records its original path, checksum, owner, department, status, version, and approval time. Import does not silently make a document authoritative.
3. A department lead reviews proposed sources, assigns source priority, approves or rejects them, and can supersede a version. An administrator can do the same across departments.
4. An employee can add personal context, propose it for department sharing, and see which material is private, pending, approved, or superseded. Only approved department sources can justify a correction to shared work.
5. The employee explicitly shares a work window. Averill observes only that window until Stop sharing, waits for a completed edit or explicit review, and shows a specific finding with the observed value, cited source, and suggested human action.
6. For Canva, the employee can import an exported design for review and explicitly share a Canva window. Window sharing needs macOS screen-recording permission. A screenshot is not equivalent to a structured Canva integration; the UI must identify what was actually inspected.
7. The employee can ask about current approved sources. Sending company content to Nebius requires an explicit per-session disclosure and consent. Tavily searches public web information with a user-visible query; company documents are not sent to Tavily.

## Authority and conflict rules

- Roles: administrator, department lead, employee. An administrator sets up the company and people; a lead may approve sources only in their department; an employee may propose sources and edit personal preferences.
- Approved sources have an explicit priority. If two active, relevant approved sources disagree, Averill shows a conflict and withholds a corrective claim until a lead resolves it. Recency alone cannot resolve the conflict.
- A source citation names the exact imported file and version. If the source is deleted, revoked, or no longer accessible, its finding must disappear or become unavailable.
- Web search results are external evidence, never an approved internal policy. An employee must deliberately promote a result through the source approval workflow.

## Hackathon acceptance path

The judges should see a fresh company setup, source import and approval, an employee entering the marketing workspace, a source-backed correction to a marketing draft, and an exported Canva design review. Then show explicit Canva window sharing and Stop sharing. An optional Nebius answer must disclose data transfer and cite the imported source. A Tavily result must display its public URL and remain separate from company policy.

The demo is complete only when these paths survive app restart, role access is enforced in the main process, source status changes affect findings, and failures (missing key, denied screen permission, unsupported file, source conflict) are shown honestly in the UI.

## Implementation order

1. Persistent local workspace, roles, document import, approval, version and conflict model.
2. Onboarding and management UI using the approved Petrol / Coral / Ice design system.
3. Marketing assistant grounded in approved imported sources while preserving the existing deterministic campaign fixture.
4. Nebius consent and Tavily public-web search with clear boundaries.
5. Exported Canva file review and explicit window capture with permission and stop controls.
6. End-to-end rehearsal, packaging, and exact-boundary documentation.
