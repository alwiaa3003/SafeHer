# Atlas import readiness: police-district statistics

- **Date:** 10 November 2026
- **Command:** `node src/seed/policeDistricts.js --approved` (from `backend/`)
- **Supporting modes:** `npm run import:police-districts:check`, `:dry-run` and `:verify`.
- **Status:** technically ready, not executed. Atlas was not contacted for this review. The import needs the owner's explicit approval.

## What it writes

| Collection | Documents | Key |
|---|---|---|
| `dataSources` | 3 | `NCRB-DISTRICT-CAW-2020`, `-2021`, `-2022`, all with `reportingLevel: police_district` |
| `validationRecords` | 3 | `DIST-REC` PASS, one per year |
| `crimeCategories` | 23 | 1 total × 3 years + 20 categories × 2022 |
| `crimeRecords` | 529 | `reportingUnitType` `police_district` (16 units) or `police_unit_non_geographic` (7 units) |
| `geographicalUnits` | 0 | Boundaries are not part of this import. None are licensed. |

## Review

| Area | Finding |
|---|---|
| **Pre-import validation** | `assertDatasetIsSound` runs before any write, and any failure stops the import. It checks 16 districts, 23 units, known categories, validated years only, numeric printed values, no duplicates, and reconciliation of each year to the printed and Delhi UT totals. `npm run import:police-districts:check` runs it without reading `MONGODB_URI`; tested, it prints "No database was contacted". |
| **Idempotency** | `insertIfAbsent` looks up each document by its natural key and inserts only when absent. A second run inserts 0 (tested). |
| **Duplicate prevention** | Unique indexes exist on `dataSources.sourceKey`, on the category identity, and on the crime-record identity (year, unit, unit type, category, legal regime, age group, source), plus the `isCurrent` partial index. `ensureIndexes()` runs first. |
| **Existing documents** | Never updated or deleted. A document that differs on `registeredCases`, `originalValue` or `reportingUnitCode` is reported as a conflict and the command exits 1. |
| **Data-source references** | Every category and record references its year's `DataSource` `_id`. Records also carry file name, sha256 and cell reference. |
| **Category relationships** | Each record's `category` points to the `CrimeCategory` for its label, year and source. `crimeCategory` holds the stable key used by the API. |
| **Geographical-unit relationships** | None stored. Records join to boundaries by `reportingUnitCode` and units by `unitCode`, never by name. Non-geographic codes (crime-branch, eow, metro, railway, spuwac, spl-cell, vigilance) have no boundary, and the boundary importers reject those names. |
| **Effect on existing pages** | `/api/crimes` and `/api/crimes/categories` exclude district records by default. Trends and summary refuse district unit types. Tested against the Delhi-wide data. |
| **Failure handling** | Errors are printed with connection strings masked, and the exit code is 1. The server-selection timeout is 15 s. |
| **Rollback safety** | No transaction is used. A failure part-way leaves the documents written so far. Re-running completes the import safely, because inserts are idempotent. A full rollback is a targeted delete (below); nothing else is touched. |

## Rollback (only if the owner decides to remove the import)

These filters match only this import's documents:

```
crimeRecords:      { reportingUnitType: { $in: ['police_district', 'police_unit_non_geographic'] } }
validationRecords: { checkName: 'DIST-REC', reportingUnitType: 'police_district' }
crimeCategories:   { source: { $in: <the 3 NCRB-DISTRICT-CAW-* _ids> } }
dataSources:       { sourceKey: /^NCRB-DISTRICT-CAW-/ }
```

Delete in that order. No script is provided, so a deletion cannot run by accident.

## Procedure (each step that connects to Atlas needs approval)

1. **Back up:** take an Atlas backup or snapshot.
2. **Validate locally:** run `npm run import:police-districts:check`. Expected output:
   - "Dataset sound: 529 values, 23 units, 21 categories, 3 sources. No database was contacted."
   - would insert `{"dataSources":3,"validationRecords":3,"crimeCategories":23,"crimeRecords":529}`.

   Verified 10 November 2026.
3. **Check the target:** confirm `MONGODB_URI` points at the intended cluster. The value is never printed.
4. **Dry run** (read-only): `npm run import:police-districts:dry-run`.
   - It first fails if duplicate district identities exist.
   - It then reports `wouldInsert`, `unchanged` and `conflicts`, writing nothing (not even indexes).
   - On an empty target, `wouldInsert` equals the counts above.
   - Any conflict means stop and investigate.
5. **Import:** `node src/seed/policeDistricts.js --approved`. Expect `inserted` equal to the counts above and `conflicts: []`.
6. **Verify** (read-only): `npm run import:police-districts:verify`. Every line must be PASS:
   - 3 sources with matching file hashes;
   - 529 records, all current and `verified_with_note`;
   - stored values equal to the printed values;
   - 16 + 7 units;
   - totals 10,093 / 14,277 / 14,247;
   - 23 category documents and 3 DIST-REC validations;
   - no duplicates.
7. **Check the API:** restart it. `/api/police-districts/meta` should list 3 years, 21 categories, 16 districts and 7 units.

Steps 4–6 are covered by `backend/tests/importTools.test.js` against an in-memory database:
- a dry run writes nothing;
- a dry run flags a changed value without changing the stored one;
- verification passes after an import and fails on an empty database or with a planted duplicate.

## Open dependency

Importing makes the figures available to any deployed API. Public display also depends on NCRB reuse terms ([assessment](ncrb-publication-rights-assessment.md)), so approval for this import is tied to that decision.
