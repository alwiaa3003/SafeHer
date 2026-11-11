# Convicted-Offender Research: Progress Record

**Last updated:** 10 November 2026.

**State:** All research that can be done without the project owner's decisions is complete. The remaining items need permission, legal advice or approval (§4).

## 1. Completed sections

| Part | Where | Status |
|---|---|---|
| Court sources: search, download, bulk, API, restrictions, terms, linking | [Data assessment](convicted-offender-data-assessment.md) §2; [legal review](convicted-offender-privacy-and-legal-review.md) §8 | Complete |
| Case sample, 12 candidates, with evidence classes | [Case sample](convicted-offender-case-sample.csv); data assessment §3 | Complete |
| Conviction and appeal verification | Data assessment §4 | Complete within the limits; Supreme Court status not checked (OR-23) |
| Legal and privacy research | Legal review §3–§9 | Complete; some texts reproduced only (OR-26) |
| Identity-publication assessment | Legal review §10; CSV | Complete |
| Geographic precision (six classes) | Data assessment §5; CSV | Complete |
| Alternative incident-level data | Data assessment §6 | Complete |
| Data model, map integration, marker eligibility, feasibility decisions, first release | [Production recommendations](convicted-offender-production-recommendations.md) | Complete |
| Open issues | [Open research issues](open-research-issues.md): OR-21 to OR-25 updated; OR-26 to OR-31 added | Complete |

## 2. Sources examined

**Court and portal pages:**
- **Delhi HC:** case-number search, party, date and neutral-citation search pages, copyright, hyperlinking and framing, terms, and the pronouncement list of 29 May 2026.
- **eCourts:** judgments portal About, Copyright, Hyperlinking and Terms; services copyright and disclaimer.
- **Supreme Court:** judgments search and website policies.
- **Delhi District Courts:** homepage, case-status page and disclaimer.

**Statutes and judgments:**
- **Gazette:** BNS and BNSS.
- **Government reproduction:** the MIB advisory of 10 October 2018, quoting POCSO s.23 and JJ s.74.
- **Court-hosted judgments:** *Nipun Saxena* (SCR copy hosted by the Orissa HC); the Supreme Court order of 24 September 2025; *Mahender Chawla*.

**Datasets:** listed in the data assessment §6.

**Unreachable:** India Code, the Legislative Department, WCD and AIKosh.

## 3. Cases verified

| Short ID | Case reference | Case | Evidence class | Identity class |
|---|---|---|---|---|
| S01 | SH-CASE-01 | SH-CASE-01 | VERIFIED_CONVICTION | REQUIRES_LEGAL_REVIEW |
| S02 | SH-CASE-02 | SH-CASE-02 | VERIFIED_CONVICTION | REQUIRES_LEGAL_REVIEW |
| S03 | SH-CASE-03 | SH-CASE-03 | VERIFIED_CONVICTION | MUST_NOT_PUBLISH |
| S04 | SH-CASE-04 | SH-CASE-04 | VERIFIED_CONVICTION | REQUIRES_LEGAL_REVIEW |
| S05 | SH-CASE-05 | SH-CASE-05 | VERIFIED_CONVICTION | REQUIRES_LEGAL_REVIEW |
| S06 | SH-CASE-06 | SH-CASE-06 | VERIFIED_CONVICTION | REQUIRES_LEGAL_REVIEW |
| S07 | SH-CASE-07 | SH-CASE-07 | VERIFIED_CONVICTION | MUST_NOT_PUBLISH |
| S08 | SH-CASE-08 | SH-CASE-08 | VERIFIED_CONVICTION | MUST_NOT_PUBLISH |
| S09 | SH-CASE-09 | SH-CASE-09 (appeal A) and 413/2018 | VERIFIED_CONVICTION (1); CONVICTION_OVERTURNED (2) | POTENTIALLY_PUBLISHABLE (1, after review); MUST_NOT_PUBLISH (2) |
| S10 | SH-CASE-10 | SH-CASE-10 | CONVICTION_OVERTURNED | MUST_NOT_PUBLISH |
| S11 | SH-CASE-11 | SH-CASE-11 | CONVICTION_NOT_ESTABLISHED | MUST_NOT_PUBLISH |
| S12 | SH-CASE-12 | SH-CASE-12 | CONVICTION_NOT_ESTABLISHED | MUST_NOT_PUBLISH |

**Appeal status beyond the HC judgment is `UNKNOWN` for all twelve.**

**Evidence location:** judgment PDFs and extracted text are in `docs/source-reports/court-judgments-2026-11-10/`, which Git ignores.

**CSV layout change:** the CSV was restructured to the required 16-column layout on 10 November 2026. The earlier 23-column version is kept outside Git, in the session scratchpad.

## 4. Exact next actions

These need the project owner.
1. Decide whether to email the Delhi HC to request permission and to inform it of links (OR-21).
2. Obtain advice from an Indian lawyer on the legal review, §11 (OR-25).
3. If approved, run dated, manual Supreme Court status checks for the 9 people whose convictions stand (OR-23).
4. Read the official POCSO, JJ Act, Copyright Act and DPDP texts when India Code is reachable (OR-26).
5. Obtain the 2026 right-to-be-forgotten judgment text (OR-28).
6. Track *Nipun Saxena* before the three-judge bench (OR-27).
