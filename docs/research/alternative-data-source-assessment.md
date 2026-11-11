# Alternative Data Source Assessment

10 November 2026. Most entries rely on [the earlier geospatial assessment](geospatial-data-assessment.md). New searches this round found no open geocoded data for crimes against women in Delhi. No private or restricted data was collected.

| Source | Collection and meaning | Verified or self-reported | Geocoded | Timestamps | Women-specific | Licence or permission | Privacy risk | Can combine with NCRB? | Status |
|---|---|---|---|---|---|---|---|---|---|
| Safecity (Red Dot Foundation) | Crowdsourced reports of harassment and abuse | Self-reported; reports are approved before display | Reported locations; precision unknown | Yes in a historic file | Yes | Written permission required; no public request process found | High | No | **Restricted** |
| Delhi Police annual figures | Press releases of police totals | Official police statistics, different classification from NCRB | No | Annual or part-year | Selected heads | Not established | Low | No, separate series | **Context only** |
| Delhi Police PCR data, masked (Kaggle) | Police call records for snatching and robbery | Calls, not FIRs | Masked; method unstated | Unconfirmed | No | Login required; licence unverified | Medium | No | **Unverified** |
| Delhi Statistical Handbook | Delhi Government tables citing Delhi Police | Official | No | Annual | Selected heads | Terms not reviewed | Low | No, separate series | **Possible separate series** |
| Praja white papers | RTI-derived NGO reports | Secondary | No | Annual | Selected heads | Terms not reviewed | Low | No | **Context only** |
| Garg FIR study | Researcher-assembled FIR data | Official source, restricted | Station level | Day | Includes harassment | Not released | High | No | **Unavailable** |
| FIR PDFs | Individual legal records | Allegations | Station level | Yes | Mixed | Not established | Very high, may name people | No | **Excluded** |
| Safetipin audits | Perception audits | Audit data, not crime | Audit points | Audit period | Perception | Not published | Medium | No | **Unsuitable as crime data** |

## Conclusions

- No usable open, geocoded, women-specific incident dataset was found.
- Allegations, registered cases, calls and convictions are different things and must stay separate.
- Any Safecity use needs written permission, coarse aggregation and suppression of small counts.
- A public map of sensitive incident locations should not be built. Indian law restricts identifying victims of sexual offences.
