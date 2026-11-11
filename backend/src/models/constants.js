export const REPORTING_UNIT_TYPES = ['state_ut', 'metro_city', 'police_district', 'police_unit_non_geographic'];
// District-file units. They are kept out of the Delhi-wide endpoints unless asked for.
export const DISTRICT_UNIT_TYPES = ['police_district', 'police_unit_non_geographic'];
export const DELHI_WIDE_UNIT_TYPES = ['state_ut', 'metro_city'];
// The geographic level a crime-statistics publication reports at.
export const REPORTING_LEVELS = ['state_ut', 'police_district'];
export const SOURCE_TYPES = ['crime_statistics', 'geographic_boundary'];
export const LEGAL_REGIMES =['ALL', 'IPC', 'BNS', 'IPC_BNS_TOTAL', 'SLL'];
export const AGE_GROUPS = ['all', 'women_18_plus', 'girls_under_18'];
export const VALIDATION_STATUSES = [
  'pending',
  'passed_automatic',
  'verified',
  'verified_with_note',
  'conflict',
  'failed',
];
export const VALIDATION_RESULTS = ['PASS', 'PASS_WITH_NOTE', 'FAIL', 'PENDING', 'NOT_APPLICABLE'];
export const COMPARABILITY_STATUSES = [
  'direct',
  'renamed',
  'split',
  'merged',
  'new_no_predecessor',
  'discontinued',
  'not_assessed',
];
export const GEOGRAPHY_TYPES = [
  'state_ut',
  'revenue_district',
  'police_district',
  'police_station',
  'municipal_ward',
  'municipal_zone',
  'other',
];
export const yearField = {
  type: Number,
  required: true,
  min: 1900,
  max: 2100,
  validate: { validator: Number.isInteger, message: 'Year must be a whole number' },
};
export const countField = {
  type: Number,
  min: 0,
  validate: { validator: Number.isInteger, message: 'Counts must be whole numbers' },
};
