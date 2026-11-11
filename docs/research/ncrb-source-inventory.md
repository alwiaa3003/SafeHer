# NCRB Source Inventory

Retrieval and checks: 10 November 2026. The full machine-readable inventory, with URLs and hashes, is [data/ncrb-source-inventory.csv](data/ncrb-source-inventory.csv).

Publication dates are not recorded where the file itself was not checked for them; the edition year is used instead.

## Evidence classes

| Class | Meaning in this package |
|---|---|
| Official | Downloaded from NCRB, or held NCRB report volumes |
| Third-party-hosted copy | An NCRB report hosted elsewhere. Useful for corroboration only, since integrity against NCRB's original cannot be confirmed |
| Third-party compilation | Data reshaped by another organisation |
| Prior project finding | Recorded earlier and not rechecked here unless stated |

## Held NCRB reports

| Edition | File | Size (bytes) | Table 3A.1 PDF page | Table 3A.2 PDF pages | Use |
|---|---|---:|---|---|---|
| Crime in India 2018, Volume I | `CrimeinIndia2018-VolumeI.pdf` | 20,230,244 | 241 | 242–257 | Production (3A.1); research (3A.2) |
| Crime in India 2022, Volume I | `CrimeinIndia2022-VolumeI.pdf` | 25,204,515 | 259 | 260–275 | Production (3A.1); research (3A.2) |
| Crime in India 2023, Part I | `CrimeinIndia2023-PartI.pdf` | 22,439,087 | 259 | 260–275 | Research and corroboration |
| Crime in India 2024, Volume I | `CrimeinIndia2024-VolumeI.pdf` | 17,970,562 | 329 | 330–357 | Production (3A.1); research (3A.2) |

The three one-page 3A.1 extracts still match their recorded hashes.

## Retrieved during this investigation

All are in the Git-ignored `docs/source-reports/retrieved-2026-11-10/` folder.

| Source | Period | Class | Use |
|---|---|---|---|
| NCRB State/UT Crimes against Women (xlsx) | 2014–2019 | Official | Candidate production evidence for 2019 |
| NCRB City-wise Crimes against Women (xlsx) | 2014–2019 | Official | Research only |
| NCRB State/UT Crimes against Women (xlsx) | 2021, 2022 | Official | Corroboration |
| NCRB District-wise Crimes against Women (xlsx) | 2014, 2015, 2016, 2020, 2021, 2022 | Official | Research only |
| Crime in India 2021, Volume I (English PDF, endnowfoundation.org) | 2019–2021 | Third-party-hosted copy | Corroboration only |

## Key finding: how official files were reached

NCRB's [additional tables page](https://www.ncrb.gov.in/crime-in-india-additional-table.html) looks empty on first load, but adding `?year=YYYY` returns direct file links. This is the route that made 2019 and district data retrievable.

## Not obtained

| Source | What happened |
|---|---|
| English Crime in India 2019, 2020 and 2021 from NCRB | NCRB's default Hindi year pages list front matter and snapshots only. The English view needs a browser session and rejected automated access (CSRF). |
| Table chapters of the Hindi 2019–2021 editions | Not listed in the view retrieved. |
| Additional tables for 2023 and 2024 | The page returned no file links on 10 November 2026. |
| District crimes against women for 2017–2019 | Not listed. Only Missing Persons and Juvenile district files appear. |
| data.gov.in resources | The catalogue page gives metadata only (published 11/10/2013, updated 25/10/2017). Resources are rendered by JavaScript. The API needs an API key, and none was used. |
| Parliamentary annexures | Found through search, but their hosts refused automated download, so no Delhi row was read. |
| A mirror of CII 2021 (data.opencity.in) | Returned 404. |

## Licence

No explicit NCRB reuse licence was established. NCRB's copyright page could not be opened (certificate error). Source PDFs and spreadsheets stay out of Git. The data.gov.in footer refers to the Government Open Data Licence, but terms for specific NCRB resources were not read.
