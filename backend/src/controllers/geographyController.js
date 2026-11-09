import { ApiError } from '../middleware/index.js';
import { GeographicalUnit } from '../models/index.js';
import { pageMeta, paging, publicGeography } from './serializers.js';

const CAVEATS = ['GEOGRAPHIC_CONTEXT_ONLY', 'NO_CRIME_VALUES_ON_BOUNDARIES'];
const PUBLISHED = { verificationStatus: 'verified', isCurrent: true, geometry: { $exists: true } };

export async function listGeography(req, res) {
  const query = req.validatedQuery;
  const filter = { ...PUBLISHED };
  if (query.geographyType) filter.geographyType = query.geographyType;

  const pager = paging(query);
  const [rows, total] = await Promise.all([
    GeographicalUnit.find(filter)
      .select('-geometry.coordinates')
      .sort({ geographyType: 1, geographyName: 1 })
      .skip(pager.skip)
      .limit(pager.limit)
      .lean(),
    GeographicalUnit.countDocuments(filter),
  ]);
  res.json({ data: rows.map((row) => publicGeography(row)), meta: { ...pageMeta(pager, total), caveats: CAVEATS } });
}

export async function getGeography(req, res) {
  const unit = await GeographicalUnit.findOne({ ...PUBLISHED, _id: req.validatedParams.id }).lean();
  if (!unit) throw new ApiError(404, 'GEOGRAPHY_NOT_FOUND', 'No verified geographic unit has this id.');
  res.json({ data: publicGeography(unit, { includeGeometry: true }), meta: { caveats: CAVEATS } });
}
