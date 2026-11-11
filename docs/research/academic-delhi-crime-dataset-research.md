# Academic Research on Delhi Crime Data

**Status:** Research only, 10 November 2026. No author was contacted.

## 1. Method

- **OpenAlex API searches**, with no account, for:
  - "Delhi crime hotspot";
  - "crime against women Delhi spatial";
  - "Delhi police crime data GIS";
  - "Delhi FIR crime spatial";
  - "Delhi sexual harassment public transport safety";
  - "Delhi crime incidents geocoded wards";
  - several FIR and Dial 100 variants, which returned no count;
  - dataset-type works for "Delhi crime".
- **Repository APIs:** Figshare, Dryad, Hugging Face, OSF, Zenodo and Dataverse (earlier round).
- **Web searches** for Shodhganga, the World Bank repository, SSRN and CrimRxiv.
- **Full texts:** papers were read in full where open (Narayan; Garg; the OSF preprint; CAG).
- **The test applied:** whether coordinates or places are incident sites.

## 2. Papers with real Delhi incident-level data

| Paper | Data | Location meaning | Shared? | Custodian |
|---|---|---|---|---|
| **Garg, "Safe Travels: Transport Development and Women's Safety in India"** (SIOE working paper, 14 Jan 2025) | About 300,000 Delhi FIRs, 2016–2019, scraped from the public portal (`wget`), OCR'd from scanned bilingual PDFs, and aggregated to a police-station-day panel. Crimes against women are identified by IPC section, including "harassment of women in public spaces", domestic violence, kidnapping and rape | FIRs include "a precise description of the incident's location" (p.7). The author plans to "geocode the crime locations to census boundaries called 'wards'" (pp.27–28) | No | Anisha Garg, Department of Economics, University of Warwick |
| **Sriram, Sinha and Choudhary**, "Predictive Hotspot Mapping for Data-Driven Crime Prediction" (POMS 2026; arXiv 2602.23750) | Delhi PCR street-crime calls, Oct 2019 – Mar 2021 | Call-attendant-entered or geocoded event location | Masked copy on Kaggle, CC BY-NC-ND 4.0 | Authors; Delhi Police |

## 3. Papers documenting police data systems

- **Narayan, "Mapping and the construction of criminal spaces in Delhi"** (Routledge 2024, open access).
  - **Systems:** describes the DMD and CMAPS, with inputs from Dial 100 and CCTNS.
  - **Location quality:** call location stands in for incident location, station plotting is common, and road-midpoint and "nearby slum" choices are made under uncertainty.
  - **Data volume:** 23 printed maps a day.
  - **Significance:** this is the strongest evidence that incident points held by the police are not reliable incident sites.
- **Marda and Narayan, FAT\* 2020** (doi:10.1145/3351095.3372865). CMAPS data creation and its biases.

## 4. Papers using aggregates or perception data only

- **District level:**
  - Frontiers 2024, using NCRB district data;
  - GeoJournal 2024, on the spatio-temporal dynamics of crime against women;
  - "Spatial Variation of Crime Against Women in NCT of Delhi (2001–2011)".
- **No micro data:** "Identification of Hotspot of Rape Cases in NCT of Delhi" (Springer 2022) states that micro-level data was not available.
- **Perception and travel:** Borker, "Safety First" (World Bank WPS 9731), uses SafetiPin audits and a student survey.
- **Surveys:** Harada's RCT (Figshare) and Das's Delhi Metro survey (Figshare).
- **Outside Delhi:** "Up in the Air" (OSF) uses Bihar FIRs and an NCW district-month panel.

## 5. Unverified

| Item | Status |
|---|---|
| "Crimescape of Delhi: Spatial Inequalities, Urban Crime and Women's Safety" (SSRN 2026) | HTTP 403; data unknown |
| "Mapping Sexual Harassment in Public Places: Open-Source Data-Driven Contextual Analysis" (Natarajan, Kim, Solymosi, Babu; CrimRxiv 2026) | Delhi; data source not named on the landing page |
| Shodhganga theses: Nangia (built environment and crimes related to women in NCT Delhi); Tripathi (Crime, Space and Media, University of Delhi, 2019) | Server unreachable |

## 6. Assessment

**Existence.** Academic incident-level Delhi data exists in exactly one relevant form: FIR-derived datasets assembled by researchers by scraping the public portal (Garg). They contain personal data and are not released.

**What SafeHer could seek.** Only derived, de-identified aggregates, for example:
- ward-by-quarter counts by IPC section group;
- sexual offences suppressed below a threshold;
- no record-level data, no names, no FIR numbers.

Even this depends on the researcher's ethics approval and data terms. It must also be checked legally, because the source FIRs were collected at scale from a portal whose purpose is supplying FIR copies (OR-37).

**Location quality is a known problem in police-held data.** Any acquired dataset must say whether locations come from:
- the FIR occurrence text;
- the caller's location;
- the police station; or
- manual plotting.
