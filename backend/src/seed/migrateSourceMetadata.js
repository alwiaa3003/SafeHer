import { DataSource } from '../models/index.js';
import { legacyBoundaryReference, NCRB_PUBLISHER } from '../models/sourceClassification.js';

// Decides what one dataSources document needs. Touches nothing.
export function planSourceMigration(source) {
  const { sourceKey } = source;
  if (source.sourceType) return { sourceKey, action: 'unchanged' };
  if (source.publisher === NCRB_PUBLISHER && source.tableReference) {
    return { sourceKey, action: 'update', set: { sourceType: 'crime_statistics' }, unset: [] };
  }
  const boundaryReference = legacyBoundaryReference(source);
  if (boundaryReference) {
    return {
      sourceKey,
      action: 'update',
      set: { sourceType: 'geographic_boundary', boundaryReference },
      unset: ['tableReference', 'publicationYear'],
    };
  }
  return { sourceKey, action: 'needs_review' };
}

// Dry run unless apply is true. Writes only to dataSources, and only to documents
// that still have no sourceType, so running it again changes nothing.
export async function migrateSourceMetadata({ apply = false } = {}) {
  const collection = DataSource.collection;
  const sources = await collection.find({}).toArray();
  const report = { applied: apply, updated: 0, plan: [] };

  for (const source of sources) {
    const plan = planSourceMigration(source);
    report.plan.push(plan);
    if (!apply || plan.action !== 'update') continue;

    const update = { $set: plan.set };
    if (plan.unset.length > 0) update.$unset = Object.fromEntries(plan.unset.map((field) => [field, '']));
    const result = await collection.updateOne({ _id: source._id, sourceType: { $exists: false } }, update);
    report.updated += result.modifiedCount;
  }
  return report;
}
