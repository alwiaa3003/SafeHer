# Exhaustive Delhi Crime Data: Master Source Inventory

**Status:** Research only, 10 November 2026.
- No contact, account registration, RTI request or import.
- No code or Atlas change.

**Comparison CSV:** [exhaustive-delhi-crime-dataset-comparison.csv](exhaustive-delhi-crime-dataset-comparison.csv), 58 sources.
- 32 from earlier rounds (`I01`–`I32`), re-classified on the new scale.
- 26 new this round (`E01`–`E26`).

## 1. What earlier rounds established (Phase 1 record)

| Record | Sources |
|---|---|
| Examined | 32 candidates in the [incident-level inventory](incident-level-data-source-inventory.md); the FIR portal ([FIR feasibility](delhi-fir-location-feasibility.md)); 12 Delhi HC judgments ([convicted-offender assessment](convicted-offender-data-assessment.md)); 19 geospatial candidates (`C01`–`C19`, [geospatial assessment](geospatial-data-assessment.md)) |
| Downloaded and inspected | NCRB tables; GSDL boundary metadata; SafeCity research split; Jassal Dataverse files; 12 judgments; Delhi Police RTI manuals; 24 structural FIR-search records (no documents) |
| Search or metadata only | Kaggle I14 and I22 (metadata API), Safetipin, Praja, Esri, Dataful, India Data Portal, OpenCity |
| Inaccessible | AIKosh, Baselight mirrors, India Code, FIR document view, NDAP |
| Registration or permission needed | Kaggle downloads, data.gov.in API, Safecity, GSDL, the raw Delhi Police PCR data |
| Rejected, with reasons | The `evidence` column of the CSV |
| Not previously investigated | Delhi Police internal mapping systems; NCW complaint statistics; academic FIR datasets traced to custodians; Parliament answers; World Bank and Figshare replication data; ACLED and GDELT; Shodhganga; DCW; archives |

## 2. New sources this round

| ID | Source | What was verified | Classification |
|---|---|---|---|
| **E01** | Delhi Police **Digital Mapping Division**, daily "Green Diary" maps | Narayan (2024), pp.132–134. The DMD manually plots verified heinous call events in ArcGIS (rape, robbery, eve-teasing, snatching) and prints 23 maps daily. Call-takers "are therefore trained to assume the location from where the caller is calling as the location of the crime", sometimes plot at police stations, put road-only addresses at the road's middle, and when unsure "would choose a nearby slum" | AVAILABLE_WITH_PERMISSION, low location validity |
| **E02** | **CMAPS** (Delhi Police with ISRO-ADRIN, MoU Dec 2015) | CAG Report No. 15 of 2020, para 9.2.4: "CMAPS largely fetches data from PA-100 only and complete integration with CCTNS was yet to be achieved (as of September 2019)". Access is by login for station heads and senior officers | AVAILABLE_WITH_PERMISSION, mainly call locations |
| E03 | Himmat Plus SOS app | CAG para 9.3.1: sends SOS "along with the location coordinates of distress caller" | UNSUITABLE (caller location) |
| **E04** | **NCW complaint statistics** (`ncwapps.nic.in`) | A public page with no captcha. Years 2000–2026; report by nature, state, or both. **Delhi has 15 district units matching police-district names.** Figures render client-side and were not retrieved | AGGREGATE_ONLY, women-specific |
| E05 | Dataful mirror of NCW | 1,188,938 rows, year × month × state × district × nature (66 values) | AGGREGATE_ONLY |
| E06 | MHA parliamentary answers | State, UT and metro annexures from NCRB. **No police-station table found** | AGGREGATE_ONLY |
| **E07** | **Garg FIR dataset**, Delhi 2016–2019 (supersedes I15) | Paper read. About 300,000 FIRs, scraped from the portal and parsed by OCR. FIRs carry "a precise description of the incident's location". The author is geocoding to census wards; names are extracted by NER. Not released | ACADEMIC_DATASET_POTENTIAL (aggregates only) |
| E08 | "Up in the Air" (OSF) | FIR data is Bihar; also uses an NCW district-month panel | NOT_INCIDENT_LEVEL for Delhi |
| E09–E10 | Narayan (2024); Marda and Narayan (FAT* 2020) | Ethnographies that identify custodians and data quality | NOT_INCIDENT_LEVEL |
| E11–E12 | SSRN "Crimescape of Delhi" (403); CrimRxiv "Mapping Sexual Harassment in Public Places" (Delhi; data source not named) | Not established | REQUIRES_FURTHER_VERIFICATION |
| E13 | World Bank package RR_IND_2024_244 (Borker) | 26,560 SafetiPin safety audits, Nov 2013–Jan 2016, under a custom licence with "no redistribution". Perception, not crime | AVAILABLE_WITH_PERMISSION (perception) |
| E14 | Safety alarm RCT (Figshare, CC BY 4.0) | Downloaded. Headers only: self-reported victimisation per respondent, **no location fields** | NOT_INCIDENT_LEVEL |
| E15–E17 | Delhi Metro survey; police-attitude surveys; Hugging Face 2025 mirror | Metadata | NOT_INCIDENT_LEVEL / UNSUITABLE |
| E18–E19 | ACLED; GDELT | Media-coded events at town level or place centroids; ACLED needs an account | UNSUITABLE / REQUIRES_FURTHER_VERIFICATION |
| E20–E21 | Project Durga; an AI "unsafe areas" map | NCRB-derived aggregates or risk surfaces | AGGREGATE_ONLY / UNSUITABLE |
| E22 | DCW 181 helpline | Citywide totals in news only | REQUIRES_FURTHER_VERIFICATION |
| E23–E24 | Two Shodhganga theses (Nangia; Tripathi) | Server unreachable | INACCESSIBLE |
| E25 | CAG Report No. 15 of 2020 | Read, chapter 9 | NOT_INCIDENT_LEVEL (evidence) |
| E26 | Internet Archive (Delhi Police pages) | The CDX API gave no usable response | INACCESSIBLE |

**Repository sweeps with no Delhi incident dataset:**
- Zenodo and Dataverse, in earlier rounds;
- Hugging Face ("delhi crime", "delhi police", "crime against women india": no hits);
- Dryad (0 results);
- Figshare (only E14–E16);
- the OpenAlex dataset type (15 results, none relevant);
- OSF search (no response).

## 3. Not yet investigated (honest gaps)

- UN Women Safe Cities Delhi (Jagori) baseline data.
- The India Human Development Survey crime module (ICPSR).
- Archived Delhi Police annual reports (the archive query failed).
- DCW annual reports.
- ICRW metro surveys.
- The contents of ACLED and GDELT.
- Shodhganga appendices.
- Data access for the SSRN and CrimRxiv papers.

All are recorded in the [progress file](exhaustive-delhi-crime-research-progress.md).

## 4. Downloaded this round

| File | Location | SHA-256 |
|---|---|---|
| Narayan chapter PDF | session scratchpad | `cfa35b7c826118b3845f2edfd6e7fd869319a9e7dd3b84c2b133edaef01262c8` |
| CAG chapter 9 PDF | session scratchpad | `9bbf0e4c6fc9dc427a43431f159980cfa085f28791c8ee42ae2f9db78d55f5e5` |
| Garg working paper PDF | session scratchpad | `0b341f873bcaeed0e5a30e0167e5a87af5297f57f247162dd9f3e3936d1fc0b9` |
| OSF "Up in the Air" PDF | session scratchpad | `c55ac1df599d388cd2c1d66824ba722f6aa2bfd174ede93f6cb0c83eaebbb184` |
| Harada RCT XLSX | `docs/source-reports/incident-data-2026-11-10/figshare-29455115/` (Git-ignored) | `761a914314e9b3355d682993be9d81a305334903c2833940a799afb316a89b29` |

No personal record was downloaded. NCW figures were not retrieved.

## 5. Addendum, acquisition round (10 November 2026)

This addendum corrects the table above. The original text is kept as a record.

- **E07:** the 2 November 2026 version of the Garg paper (*Eyes on the Street*, SHA-256 `42b55e6b719f6362d9b2ed3b7c413c4967a6280179b078dc67dc7c5ea8163b25`) reports **point geocoding complete**: 261,493 of 296,869 IPC reports (88.08%), geocoded from the Place of Occurrence text with ArcGIS. It does not report ward-level crime counts. The classification remains ACADEMIC_DATASET_POTENTIAL, aggregates only.
- **E04:** NCW figures are server-rendered by district, nature and month in the normal form flow. The footer reads "All Rights Reserved".

Details are in the [permission request review](safeher-permission-request-review.md), §2 and §6.
