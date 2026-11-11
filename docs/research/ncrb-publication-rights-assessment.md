# NCRB publication-rights assessment

- **Date:** 10 November 2026
- **Question:** may SafeHer publicly display its validated NCRB police-district figures (2020–2022) without asking NCRB for permission?
- **Answer:** not established. NCRB's own website copyright statement requires the Bureau's prior permission to reproduce its material. No open licence covering these files has been found. Each publishable data group is classified **REQUIRES_PERMISSION**. Whether bare statistical figures are protected at all is a legal question this research cannot settle.

This is a research note, not legal advice.

## 1. Evidence

### 1.1 NCRB website copyright statement (new this round)

`https://ncrb.gov.in/copyright-statement` ("प्रकाशनाधिकार ब्योरा"), retrieved 10 November 2026, is served only in Hindi. The English version did not load, and the earlier certificate error is noted in OR-12.

The full statement, with SafeHer's working translation:

> इस वेबसाइट पर उपलव्ध सामग्री की, आंशिक अथवा पूर्ण रूप में, ब्यूरो की पूर्व अनुमति के विना प्रतिलिपि / पुनः उत्पन्न नहीं करना चाहिए | तथापि, सामग्री को बिना पूर्व विशेष अनुमति के डाउनलोड किया जा सकता है | इस वेबसाइट की सामग्री का उपयोग किसी भ्रामक या आपत्तिपूर्ण सन्दर्भ में उपयोग नहीं किया जा सकता है | सूचना का कोई अन्य उपयोग, इस ब्यूरो की अनुमति के अधीन है |

1. Material available on this website should not be copied or reproduced, in part or in full, without the prior permission of the Bureau.
2. However, the material may be downloaded without prior specific permission.
3. Content of this website may not be used in a misleading or objectionable context.
4. Any other use of the information is subject to the permission of this Bureau.

The site footer also reads "कॉपीराइट © 2026. All Rights Reserved".

The NCRB terms-and-conditions and disclaimer pages add no licence:
- they disclaim liability;
- they say content should not be treated as a legal statement;
- they say NCRB does not authorise use of copyrighted material on linked sites.

### 1.2 The spreadsheets themselves

- **Files:** `Districtwise-Crime-against-Women_2020.xlsx`, `_2021.xlsx` and `_2022.xlsx` (sha256 `234cc32e…`, `6e92ac42…`, `12fc30d6…`).
- **Licence:** earlier rounds found no licence, copyright notice or terms inside them. Not re-opened this round: the files are unchanged and the dataset rebuild was byte-identical.

### 1.3 data.gov.in and GODL-India

- **Licence text:** data.gov.in's footer states that content is "licensed under the Government Open Data License-India" (GODL, Gazette notification of 13 February 2017).
- **What GODL grants:** a worldwide, royalty-free, non-exclusive licence to use, adapt and publish, for commercial and non-commercial purposes.
- **GODL conditions:**
  - attribution naming the provider, source and licence, with a URL or DOI;
  - no suggestion of endorsement;
  - exclusions for personal, sensitive and third-party IP data.
- **Coverage:** GODL covers resources published on data.gov.in. The only district-wise crimes-against-women resource found there is for 2013 (catalog "District-wise crimes committed against Women"). No 2020, 2021 or 2022 district-wise resource was found, only state/UT and metro-city tables for 2022.
- **Consequence:** GODL cannot be assumed to cover the NCRB spreadsheets SafeHer uses.

### 1.4 Third-party mirrors

OpenCity labels NCRB *Crime in India* PDFs "Public Domain", and India Data Portal re-hosts district tables with "No License Provided". These are the aggregators' labels, not NCRB's grant, and they do not change NCRB's statement.

## 2. Answers to the eight questions

| # | Question | Finding |
|---|---|---|
| 1 | Do the original spreadsheets carry an explicit licence? | No. |
| 2 | Do data.gov.in versions carry GODL terms? | Resources published there do. No 2020–2022 district-wise CAW resource was found, so this route does not cover SafeHer's data. |
| 3 | May SafeHer reproduce the numerical values? | NCRB asks for prior permission before reproduction "in part or in full". Whether bare figures are copyrightable is uncertain and is a legal-review question. Not established. |
| 4 | Are derived visualisations permitted? | Not addressed by NCRB. "Any other use … is subject to the permission of this Bureau", so not established. |
| 5 | Can extracted tables be redistributed? | Not without permission. SafeHer serves the figures through its API, but does not redistribute NCRB's files. |
| 6 | What attribution is required? | NCRB prescribes none. GODL would need provider, source, licence and URL. SafeHer already cites NCRB, the file and the cell reference. The proposed line is in §4. |
| 7 | Does non-commercial student use change anything? | Not under NCRB's statement, which has no educational or non-commercial exception. Indian copyright law has fair-dealing provisions for research and private study (Copyright Act 1957, s. 52). Whether they cover a public website is a legal question. |
| 8 | Are there restrictions on adaptation or republication? | Yes: reproduction needs prior permission; use in a "misleading or objectionable context" is barred; other uses need permission. |

## 3. Classification

| Data group | Status | Reason |
|---|---|---|
| 2020–2022 total crime against women, 16 geographic districts | REQUIRES_PERMISSION | NCRB copyright statement. Data is validated and reconciled. |
| 2020–2022 totals, 7 non-geographic units (table only) | REQUIRES_PERMISSION | Same. |
| 2022 headline categories (20), 23 units | REQUIRES_PERMISSION | Same. |
| 2020–2021 category columns | NOT_APPROVED_FOR_PUBLICATION | Not validated against a state table. |
| Age sub-columns; Kidnapping & Abduction group | NOT_APPROVED_FOR_PUBLICATION | Parts of a heading; OR-06 is open. |
| Delhi-wide Table 3A.1 totals already shown on other pages | REQUIRES_PERMISSION (same condition) | NCRB's statement applies equally to these. It is noted here so the owner decides both together. |
| Whether bare figures attract copyright at all | REQUIRES_LEGAL_REVIEW | Cannot be settled by research. |

None is PUBLICATION_READY or PUBLICATION_READY_WITH_ATTRIBUTION on current evidence.

## 4. Attribution to use if permission is given

> Source: National Crime Records Bureau (Ministry of Home Affairs, Government of India), *District-wise Crime against Women* 2020, 2021 and 2022, Delhi section, ncrb.gov.in. Figures are registered cases as printed; SafeHer's presentation is not endorsed by NCRB.

The panel, legend, Methodology and Data & Sources pages already carry the source and file reference. The "not endorsed" clause should be added once the terms are known, matching whatever the permission states.

## 5. Route to resolution

1. **Preferred:** send the drafted [NCRB clarification request](permission-requests/ncrb-data-reuse-clarification.md), which covers reuse, visualisation, derived maps and attribution. It is unsent and needs owner approval. NCRB's contact address on the copyright page is `dct[at]ncrb[dot]gov[dot]in`.
2. **Alternative:** legal advice on whether the figures are protected and whether fair dealing covers this use.
3. **Interim:** keep SafeHer undeployed, or limit the deployment to a private academic review audience. That is the owner's decision.
