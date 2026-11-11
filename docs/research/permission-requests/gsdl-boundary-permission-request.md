# Draft request: GeoSpatial Delhi Limited, police-district boundaries

**Status:** UNSENT DRAFT, prepared 10 November 2026. Do not send until the project owner explicitly approves it.

**History:**
- OR-04 and the [geospatial assessment](../geospatial-data-assessment.md), §10, say a GSDL request "was drafted". **No draft text exists in the repository.** It may have existed only in an earlier conversation.
- This is therefore a new draft. It includes the boundary-date question the assessment asked to add.

## Evidence the request rests on

**The layer:**
- `DP_DISTRICT_BOUNDARY`, at `https://gsdl.org.in/arcgis/rest/services/Delhi_Police/Delhi_Police/MapServer/0`.
- 16 polygons with fields DISTRICT, RANGE and AREA__SQKM.
- No date field; no copyright text in the layer metadata.

**Compatibility:** technically compatible with NCRB's 16 geographic units for 2020–2022 ([boundary compatibility](../district-boundary-compatibility.md)).

**Rights:** the website footer reads "© All Rights Reserved by GeoSpatial Delhi Limited (A Govt. of Delhi Company)".

**Disclaimer:** the home page says the data "might have been provided to GSDL by the concerned departments without ground-truthing" and "should not [be used] for critical applications like legal or boundary dispute settlement". Read on 10 November 2026.

**Contact published on gsdl.org.in:**
- cs.gsdl@gmail.com;
- (011) 2381 3287;
- 3rd Level, 'C' Wing, Vikas Bhawan-II, Civil Lines, Delhi 110054.

The ownership of the Gmail address was not verified beyond its appearance on the official site.

## Before sending (OWNER checklist)

- [ ] Fill in the sender and supervisor details.
- [ ] Consider whether to ask also for the 180 police-station polygons and the ward layer. They are not needed for the first pilot, and a narrower request is likelier to succeed. As drafted, it is limited to the district layer.

---

**Subject:** Permission to display the Delhi Police district boundary layer in a non-commercial academic web map

To: GeoSpatial Delhi Limited, 3rd Level, 'C' Wing, Vikas Bhawan-II, Civil Lines, Delhi 110054 (cs.gsdl@gmail.com)

Dear Sir or Madam,

I am [name], a [programme] student at [institution], supervised by [supervisor name]. SafeHer is a non-commercial academic web map. It presents officially published NCRB statistics on crimes against women in Delhi by police district, with full attribution and no personal data.

GSDL's public map service includes the Delhi Police district layer (`Delhi_Police/MapServer/0`, `DP_DISTRICT_BOUNDARY`, 16 polygons). The GSDL website states that all rights are reserved, so I have not used the layer in any public product. I am writing to request permission.

1. **Written permission** to use the 16 police-district polygons in SafeHer.
2. **Reproduction and adaptation rights:**
   - storing a copy;
   - simplifying the geometry for web display;
   - converting it to GeoJSON.
3. **Permission for public web-map display**, as a choropleth of published counts on a public, non-commercial academic website.
4. **Required attribution wording**, and any conditions such as a disclaimer, a link or a version statement.
5. **Update frequency** of the layer, and how changes are announced.
6. **Effective dates.** The date or period the boundaries represent, and the date of the last change. In particular: do they reflect the 16 police districts in force during 2020–2022?
7. **Authority and suitability:**
   - Are the boundaries authoritative, and which department supplied them? The GSDL disclaimer notes that data may come from departments without ground-truthing.
   - Are they suitable for joining NCRB district tables and NCW district complaint statistics?

I would be glad to share the display before publication and to follow any conditions you set.

Yours faithfully,
[Name]
[Programme, institution]
[Supervisor: name, email]
