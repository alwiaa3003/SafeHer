# NCRB research pipeline

Reproduces the research tables in `docs/research/data/`. Standard-library Python only; `pdftotext` from Git for Windows reads the PDFs.

Run from this folder, in order:

```
python validate_table_3a2.py
python analyse_annual_and_district.py
python build_tables.py
python check_outputs.py
python validate_district_data.py
python validate_district_boundaries.py
python build_district_decisions.py
```

`validate_district_boundaries.py` makes read-only queries to GSDL's public ArcGIS service and stores the responses in the Git-ignored source folder. They are kept for validation only, because GSDL's reuse terms are not open.

The scripts read the Git-ignored `docs/source-reports/` and `docs/research/table-3a2-review/` folders. A fresh clone needs those files first. Nothing here connects to a database or changes production records.
