# Averill excellence specifications — 30 October 2026

Owner requested to-spec publication and implementation. The renderer/IPC verification seams were confirmed in chat. All issues use ready-for-agent; dependent work waits for its prerequisites. Existing issues were not modified.

| Ticket | GitHub | Dependencies | Status |
| --- | --- | --- | --- |
| EX-00 | [[EX-00] Averill excellence: intuitive navigation and useful grounded AI](https://github.com/sararr25/averill-ai/issues/58) | None | Open |
| EX-01 | [[EX-01] Context and authority correctness](https://github.com/sararr25/averill-ai/issues/59) | None | Open |
| EX-02 | [[EX-02] Answer quality baseline and regression corpus](https://github.com/sararr25/averill-ai/issues/60) | None | In progress: evaluation catalogue specified |
| EX-03 | [[EX-03] Natural intent and current task continuity](https://github.com/sararr25/averill-ai/issues/61) | EX-02 | Open |
| EX-04 | [[EX-04] Complete permission-aware source retrieval](https://github.com/sararr25/averill-ai/issues/62) | EX-03 | Open |
| EX-05 | [[EX-05] Shared answer contract and useful grounded responses](https://github.com/sararr25/averill-ai/issues/63) | EX-03, EX-04 | Open |
| EX-06 | [[EX-06] Public claim decomposition and relevant Tavily evidence](https://github.com/sararr25/averill-ai/issues/64) | EX-02, EX-03 | Open |
| EX-07 | [[EX-07] Consistent public-check explanations across surfaces](https://github.com/sararr25/averill-ai/issues/65) | EX-05, EX-06 | Open |
| EX-08 | [[EX-08] Navigable desktop information architecture](https://github.com/sararr25/averill-ai/issues/66) | EX-02 | Open |
| EX-09 | [[EX-09] Desktop task index and stable assistant workspace](https://github.com/sararr25/averill-ai/issues/67) | EX-05, EX-08 | Open |
| EX-10 | [[EX-10] Search-first library and document version families](https://github.com/sararr25/averill-ai/issues/68) | EX-04, EX-08 | Open |
| EX-11 | [[EX-11] Indexed Canva Ask Checks and Guide panel](https://github.com/sararr25/averill-ai/issues/69) | EX-05 | Open |
| EX-12 | [[EX-12] Current measurements guide progress and practice state](https://github.com/sararr25/averill-ai/issues/70) | EX-01, EX-11 | Open |
| EX-13 | [[EX-13] Relevant tool guide catalogue and recovery](https://github.com/sararr25/averill-ai/issues/71) | EX-05, EX-11 | Open |
| EX-14 | [[EX-14] Accessible navigation and resilient user-facing errors](https://github.com/sararr25/averill-ai/issues/72) | EX-09, EX-10, EX-11 | Open |
| EX-15 | [[EX-15] Private answer diagnostics and actionable feedback](https://github.com/sararr25/averill-ai/issues/73) | EX-05, EX-06 | Open |
| EX-16 | [[EX-16] Packaged provider Canva and independent usability acceptance](https://github.com/sararr25/averill-ai/issues/74) | EX-01, EX-02, EX-03, EX-04, EX-05, EX-06, EX-07, EX-08, EX-09, EX-10, EX-11, EX-12, EX-13, EX-14, EX-15 | Open |

Native blocked-by relationships verified. Specs are published; implementation completion is tracked separately.

## First increment

EX-02: 80 evaluation cases specified, 20 reserved; full scored/independently reviewed evaluation pending. EX-03: natural tool requests, current-task continuation, missing-tool recovery and local document/research recovery implemented on source. 289 unit tests and 8 Pro renderer checks pass. No issue is complete; full summaries, multi-goal coverage, visual/task context and UI redesign remain. See the current handover for evidence and the older packaged-app boundary.

## Continuation: retrieval and discovery

Complete-source lexical retrieval, bounded relevant company-answer previews, exact page/line provenance, explicit ambiguous-document choices and compact section overviews are implemented on source. To do has direct Ask/Check/Learn starting actions and Public research is visible in primary navigation. 11 synthetic Pro renderer groups, 10 accessibility groups and a real synthetic-source Nemotron request pass. These are supporting increments for EX-03/04/05/08, not completed dependent tickets; the full redesign, model synthesis, human evaluation and real Canva remain open. See the latest handover and receipts.

## Packaged technical comparison and real Canva continuation

EX-05/07/08/09/10/11/13/14 have supporting UI and source changes: task views, session question index, version families, preserved public explanations and indexed Canva guides. Two live Canva defects have matched A-fail/B-pass regressions. Final candidate is packaged; 295 unit tests and packaged-resource renderer/feedback checks pass. This supersedes the earlier source-only boundary. No ticket is closed solely by these checks: human participants remain zero, semantic/answer-quality and native accessibility acceptance remain open. See [the full technical report](../../FULL_AB_REPORT_2026-10-30.md).
