# Convicted-Offender and Incident Features: Production Recommendations

**Status:** Research recommendations only. First recorded 10 November 2026 and extended the same day.
- A research decision is not production approval.
- Nothing here has been implemented or imported, and the Crime Map is unchanged.

**Evidence:**
- [Data assessment](convicted-offender-data-assessment.md)
- [Privacy and legal review](convicted-offender-privacy-and-legal-review.md)
- [Case sample](convicted-offender-case-sample.csv)

## 1. Feasibility questions

| # | Question | Answer | Evidence |
|---|---|---|---|
| 1 | Can SafeHer obtain enough official Delhi judgments? | **For a small research sample, yes. For a comprehensive or representative set, no.** | 12 Delhi HC judgments obtained and verified. CAPTCHAs on every search; no official API; Delhi HC reproduction needs permission (assessment §2) |
| 2 | Can convictions be verified reliably? | **Yes, per person, from operative paragraphs, at the HC appeal stage.** | 9 people with a conviction standing after first appeal; 3 people whose trial conviction was overturned; 2 cases with no conviction (CSV) |
| 3 | Can appeal status be maintained? | **Not today.** Only by dated, manual, CAPTCHA-protected Supreme Court checks | Assessment §4; OR-23 |
| 4 | Can incident locations be extracted with useful precision? | **No.** No coordinates; 9 of 12 are police-station-registration only; 10 of 12 incidents are in homes | Assessment §5 |
| 5 | Can offender identities be published lawfully and responsibly? | **Not without case-by-case legal advice.** 0 of 12 cleared; one identity potentially publishable after review | Legal review §3–§10 |
| 6 | Can source information be collected and reused? | **Linking: yes. Reproduction: permission needed.** The Delhi HC allows direct links without prior permission (no framing); reproduction needs permission by email | Legal review §8 |
| 7 | Can court judgments be linked to map markers? | **No.** There is no verified incident coordinate, and geocoding would invent one | Assessment §5 |
| 8 | Are there alternative incident-level datasets? | **None suitable.** All are aggregate, allegations, court-located, outside Delhi or restricted | Assessment §6 |
| 9 | Can SafeHer produce a useful first release with this evidence? | **Yes, but not with markers or profiles.** See §6 | |
| 10 | What should be postponed or abandoned? | **Abandon** named offender profiles, name search, offender photos, court-derived red markers and automated portal collection. **Postpone** district aggregates of court cases and map-linked case summaries | §2 |

## 2. Feature decisions

| Feature | Decision | Reason |
|---|---|---|
| Local research register of court cases (non-identifying fields; judgments kept out of Git) | `APPROVED_FOR_PROTOTYPE` | Done in this milestone; local only |
| Data model design (§3) | `APPROVED_FOR_PROTOTYPE` | Design only. Implementing it needs separate approval |
| Evidence page: what court records can and cannot support (no names, no case table) | `APPROVED_FOR_PROTOTYPE` | Uses only SafeHer's own findings and links to statutes |
| Anonymised case-outcome table (case number, court, date, provisions, outcome, link) | `REQUIRES_LEGAL_REVIEW` | Needs Delhi HC permission and advice on structured extracts (legal review §11, Q3–Q4) |
| Outbound links to official judgment PDFs | `REQUIRES_LEGAL_REVIEW` | The Delhi HC policy permits linking (new window, inform the court), but linking a named judgment from a crime map may still identify victims |
| Map-linked anonymised case summaries | `REQUIRES_MORE_DATA` | No case has publishable incident geography |
| Police-district aggregate of court cases | `REQUIRES_MORE_DATA` | Needs a licensed, dated boundary and a representative dataset; a hand sample is not representative |
| Red incident markers from court judgments | `NOT_RECOMMENDED` | No coordinates; homes are victim-identifying; geocoding invents points |
| Named convicted-offender profiles | `NOT_RECOMMENDED` | Victim identification in most cases; finality unverifiable; right-to-be-forgotten exposure; defamation risk |
| Offender name search | `NOT_RECOMMENDED` | Creates the harm the Delhi HC masking framework addresses |
| Offender photographs | `NOT_RECOMMENDED` | Prohibited by project rules; no lawful, reliable source |
| Automated collection from eCourts, Delhi HC or SC portals | `NOT_RECOMMENDED` | CAPTCHAs must not be bypassed; no official API |
| Manual, dated status re-checks | `REQUIRES_LEGAL_REVIEW` | A lawyer should set what check is sufficient |
| Date filters on the map | `REQUIRES_MORE_DATA` | Only meaningful with eligible incident records |

## 3. Data model (conceptual; not implemented)

**Principles:**
- Incidents and identities live in separate collections. An incident can be shown with no person attached.
- One case can have many accused, offences and stages.
- Original legal labels are kept exactly. IPC and BNS are never merged; a mapping, if ever made, is a separate reviewed record.
- Verification status and publication status are separate fields.
- Every fact cites a source and a page and paragraph.
- Records are append-only for status and reviews, so corrections and appeal updates leave history.

```
courtCases                     one per proceeding
  caseKey           "SH-CASE-01" (unique, stable)
  court             { name, level: district|high_court|supreme_court, bench, judicialDistrict }
  caseNumber        as printed
  neutralCitation   string | null   only if printed in an official source
  decisionDate      date
  originatingCase   { caseKey?, court, caseNumber, firNumber, firYear, firPoliceStation }
  titleStored       false (fixed): titles contain names
  sourceIds         [ -> sourceReferences ]

offences                       one per provision per accused per case
  caseKey, accusedKey
  legalFramework    IPC | BNS | POCSO | DP Act | ...
  sectionOriginal   "376(2)(n)"   exactly as printed
  categoryLabel     SafeHer label; mapping recorded, not inferred
  stageCharged      fir | chargesheet | charge | conviction
  victimIsChild     boolean | null
  identityBar       [ bns72 | pocso23 | jj74 | bnss366 | court_masked | none_found ]
  citationIds       [ -> citations ]

accusedPersons                 opaque per-case keys: no names
  caseKey, accusedKey ("A1")
  juvenile          boolean | null   if true, the whole case is excluded
  courtMasked       boolean

convictions                    one per accused per stage
  caseKey, accusedKey
  stage             trial | high_court_appeal | supreme_court | review
  outcome           convicted | acquitted | discharged | conviction_affirmed |
                    conviction_set_aside | partly_affirmed | not_maintainable
  evidenceClass     VERIFIED_CONVICTION | CONVICTION_OVERTURNED | CONVICTION_NOT_ESTABLISHED |
                    APPEAL_STATUS_UNKNOWN | INSUFFICIENT_EVIDENCE
  decisionDate
  sentence          [{ sectionOriginal, term, unit, fine, concurrent }] | null
  citationIds

legalStatusHistory             append-only
  caseKey, accusedKey, checkedAt, checkedBy
  checkedSource     sci_case_status_manual | dhc_case_status_manual | ...
  finding           no_later_proceeding_found | slp_pending | slp_dismissed | reversed | not_checked
  searchDescription what was searched, recorded verbatim
  (never "final" by inference)

incidentGeography              no person reference
  caseKey
  precisionClass    EXACT_COORDINATE_VERIFIED | NAMED_LOCATION | LOCALITY_ONLY |
                    DISTRICT_ONLY | COURT_LOCATION_ONLY | NO_GEOGRAPHIC_INFORMATION
  placeType         home | school | workplace | public_place | transport | online | multiple | unknown
  victimLinked      boolean   if true, finer than DISTRICT_ONLY is never displayed
  firPoliceStation  string    flagged as the registration station
  policeDistrict    string | null   only via a licensed, dated boundary
  geometry          null unless EXACT_COORDINATE_VERIFIED, public_place and approved
  citationIds

geographicDecisions            append-only
  caseKey, displayLevel (none | district_aggregate | generalised_area | point),
  reasons [string], reviewer, reviewedAt, expiresAt

sourceReferences
  sourceId, url, publisher, retrievedAt, sha256, localPathIgnored,
  reuseTerms, linkingTerms, permissionStatus (not_requested | requested | granted | refused)

citations
  citationId, sourceId, page, paragraph, quoteHash   (a hash, not quoted text)

publicationReviews             append-only; one per scope
  caseKey, accusedKey | null
  scope             case_facts | geography | identity | link
  classification    POTENTIALLY_PUBLISHABLE | REQUIRES_LEGAL_REVIEW | MUST_NOT_PUBLISH
  reasons, legalReviewer, reviewedAt, expiresAt
  approvedForPublic false by default

personIdentities               restricted; stays empty unless a lawyer approves its existence
  caseKey, accusedKey, displayName, identityReviewId
  never read by any public route; deleted on a masking or de-indexing order

verificationLog                append-only audit of every human check
  entity, entityKey, field, action (extracted | rechecked | corrected), by, at, note
```

**Public API rules:**
- Join only `courtCases`, `offences` and `convictions` where a `case_facts` review is approved and unexpired.
- Never read `personIdentities`.
- Expose geography only per an approved, unexpired `geographicDecisions` record.

## 4. Map integration (future design; not implemented)

The current Crime Map has:
- a disabled "Verified incident markers" layer (`LayerPanel.jsx`);
- disabled category filters with their research statuses (`CategoryPanel.jsx`);
- a location panel stating that no incident data exists;
- an eligibility contract in `frontend/src/features/map/incidents.js`.

**Future flow:**
1. The user selects a category. Only categories with eligible records become enabled. Each keeps its original legal label and IPC/BNS framework.
2. Eligible records appear as red markers. A legend states what one marker means: "one verified, publicly reviewed incident location".
3. Selecting a marker opens incident details:
   - category label, date (or year), and precision class;
   - source and judgment link (opens in a new tab, per the Delhi HC policy);
   - conviction stage and outcome, for example "Conviction affirmed by the Delhi HC on [date]";
   - appeal status with its check date.
4. A link to an offender profile appears only if an identity review is approved. Under current evidence that is never.
5. Date filters appear only when records carry verified dates.
6. Precision indicators show the class. Area displays say "generalised area", never a pin.

**Marker eligibility.** All of these are required:
- `incidentGeography.precisionClass = EXACT_COORDINATE_VERIFIED`, with the coordinate stated in an authoritative source (never computed by SafeHer);
- `placeType = public_place` and `victimLinked = false`;
- an approved, unexpired `geography` publication review, and an approved `case_facts` review;
- the source cited to page and paragraph;
- a documented original category label;
- no personal data in the incident record (the current contract already enforces this);
- no juvenile involvement, and no court masking or sealing direction.

**A marker must never be created from:**
- district totals or district centroids;
- random or jittered coordinates;
- geocoded localities, landmarks, police stations or courts;
- news reports, allegations, FIRs or charge-sheets;
- synthetic data.

**Recommended change to the current contract** (for a later, approved implementation milestone):
- `PRECISION_LEVELS = ['exact', 'street', 'neighbourhood']` in `incidents.js` lets street- and neighbourhood-level records become points. This research recommends allowing only verified exact public-place coordinates as points.
- `street` and `neighbourhood` should become generalised-area displays, if they are ever approved.
- The precision vocabulary should match §3. Recorded as OR-31.

## 5. Privacy safeguards

1. Never store victim, witness or relative names, addresses, phone numbers, social-media accounts or photographs, even in research files.
2. Never store case titles; use stable case references.
3. Store judgment copies outside Git until reuse rights are established.
4. Never unmask a court-masked person or join records to re-identify anyone.
5. Generalise or suppress any location linked to a victim's home, school, workplace or shelter.
6. Apply minimum-count suppression to any area aggregate.
7. Give reviews expiry dates; re-check status before any publication.
8. Provide correction and take-down routes, and honour masking or de-indexing orders.

## 6. Recommended first release

The smallest credible release with current evidence:
- **Crime Map:** as it is now. The OSM context outline, place search and location details, with **no incident markers**.
- **Crime Trends:** verified Delhi UT NCRB annual totals with sources and statuses, as now.
- **Data & Sources and Methodology:** add a section on why court records cannot yet produce markers or offender information. It would cover:
  - the source terms and the privacy law (BNS ss.72–73, BNSS s.366, POCSO s.23, JJ s.74, *Nipun Saxena*);
  - the geographic findings;
  - the conviction-versus-finality distinction.

  This uses SafeHer's own analysis, with no names and no case table.

An anonymised case-outcome table could follow, but only after Delhi HC permission and legal advice.

## 7. Remaining blockers

| Blocker | Issue |
|---|---|
| Delhi HC reproduction permission not requested | OR-21 |
| No official bulk access or API; CAPTCHAs | OR-22 |
| Appeal finality not verifiable | OR-23 |
| No incident-level geography in judgments | OR-24 |
| Identity publication needs Indian legal advice | OR-25 |
| Official statute texts partly unverified (India Code unreachable) | OR-26 |
| *Nipun Saxena* pending before a three-judge bench | OR-27 |
| Right-to-be-forgotten judgment text not obtained | OR-28 |
| Judgment metadata gaps: no neutral citations, internal date error | OR-29 |
| No suitable alternative incident-level dataset | OR-30 |
| Map eligibility contract allows sub-exact points | OR-31 |

## 8. Next steps

These need the project owner's decision.
1. Email the Delhi HC to request permission, and inform it of any links.
2. Obtain advice from an Indian lawyer on the questions in the legal review, §11.
3. Read the *Laksh Vir Singh Yadav* judgment text, and the official POCSO, JJ Act, Copyright Act and DPDP Act texts once India Code is reachable.
4. If approved, run manual Supreme Court status checks for the 9 people whose convictions stand, recording dates and the searches made.
5. Approve the §4 contract change in a later implementation milestone, or leave the incident layer disabled.
