import { databaseState, pingDatabase } from '../config/database.js';
import { DataSource, ValidationRecord } from '../models/index.js';
import { sourceTypeFilter } from '../models/sourceClassification.js';
import { pageMeta, paging, publicSource, publicValidation } from './serializers.js';

export async function health(_req, res) {
  const reachable = await pingDatabase();
  res.status(reachable ? 200 : 503).json({
    status: reachable ? 'ok' : 'degraded',
    api: 'ok',
    database: { status: reachable ? 'connected' : databaseState() === 'connected' ? 'unreachable' : databaseState() },
  });
}

export async function listDataSources(req, res) {
  const query = req.validatedQuery;
  const filter = query.sourceType ? sourceTypeFilter(query.sourceType) : {};
  if (query.publicationYear !== undefined) filter.publicationYear = query.publicationYear;
  if (query.tableReference) filter.tableReference = query.tableReference;

  const pager = paging(query);
  const [rows, total] = await Promise.all([
    DataSource.find(filter).sort({ sourceType: 1, publicationYear: 1, tableReference: 1 }).skip(pager.skip).limit(pager.limit).lean(),
    DataSource.countDocuments(filter),
  ]);
  res.json({ data: rows.map(publicSource), meta: pageMeta(pager, total) });
}

export async function listValidation(req, res) {
  const query = req.validatedQuery;
  const filter = {};
  if (query.year !== undefined) filter.reportingYear = query.year;
  if (query.reportingUnit) filter.reportingUnit = query.reportingUnit;
  if (query.result) filter.result = query.result;
  if (query.checkName) filter.checkName = query.checkName;

  const pager = paging(query);
  const [rows, total] = await Promise.all([
    ValidationRecord.find(filter)
      .sort({ reportingYear: 1, checkName: 1 })
      .skip(pager.skip)
      .limit(pager.limit)
      .populate('source')
      .lean(),
    ValidationRecord.countDocuments(filter),
  ]);
  res.json({ data: rows.map(publicValidation), meta: pageMeta(pager, total) });
}
