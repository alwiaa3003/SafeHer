import { z } from 'zod';
import { GEOGRAPHY_TYPES, REPORTING_UNIT_TYPES, SOURCE_TYPES, VALIDATION_RESULTS, VALIDATION_STATUSES, LEGAL_REGIMES } from '../models/constants.js';

const year = z.string().regex(/^\d{4}$/, 'Must be a four-digit year').transform(Number);
const text = z.string().trim().min(1).max(100);
const pageNumber = z.string().regex(/^[1-9]\d{0,5}$/, 'Must be a positive whole number').transform(Number);
const limit = z
  .string()
  .regex(/^\d{1,3}$/, 'Must be a whole number')
  .transform(Number)
  .refine((value) => value >= 1 && value <= 100, 'Must be between 1 and 100');

const pagination = { page: pageNumber.optional(), limit: limit.optional() };
const reportingUnitType = z.enum(REPORTING_UNIT_TYPES).optional();

const orderedYears = (query) =>
  query.fromYear === undefined || query.toYear === undefined || query.fromYear <= query.toYear;
const orderedMessage = { message: 'fromYear must not be after toYear', path: ['fromYear'] };

export const crimesQuery = z
  .strictObject({
    year: year.optional(),
    fromYear: year.optional(),
    toYear: year.optional(),
    reportingUnit: text.optional(),
    reportingUnitType,
    validationStatus: z.enum(VALIDATION_STATUSES).optional(),
    ...pagination,
  })
  .refine(orderedYears, orderedMessage);

export const seriesQuery = z
  .strictObject({
    reportingUnit: text,
    reportingUnitType,
    fromYear: year.optional(),
    toYear: year.optional(),
  })
  .refine(orderedYears, orderedMessage);

export const categoriesQuery = z.strictObject({
  reportingYear: year.optional(),
  publicationYear: year.optional(),
  legalFramework: z.enum(LEGAL_REGIMES).optional(),
  ...pagination,
});

export const dataSourcesQuery = z.strictObject({
  sourceType: z.enum(SOURCE_TYPES).optional(),
  publicationYear: year.optional(),
  tableReference: text.optional(),
  ...pagination,
});

export const validationQuery = z.strictObject({
  year: year.optional(),
  reportingUnit: text.optional(),
  result: z.enum(VALIDATION_RESULTS).optional(),
  checkName: text.optional(),
  ...pagination,
});

export const geographyQuery = z.strictObject({
  geographyType: z.enum(GEOGRAPHY_TYPES).optional(),
  ...pagination,
});

export const objectIdParams = z.strictObject({
  id: z.string().regex(/^[0-9a-f]{24}$/i, 'Must be a valid id'),
});

export const noQuery = z.strictObject({});

// District categories are short slugs such as "total" or "rape".
export const districtStatisticsQuery = z.strictObject({
  category: z.string().regex(/^[a-z0-9-]{1,60}$/, 'Must be a category key from /api/police-districts/meta'),
  year: year.optional(),
});

// Place search accepts free text only; reverse lookup is limited to the Delhi region.
const coordinate = (min, max, name) =>
  z
    .string()
    .regex(/^-?\d{1,3}(\.\d{1,8})?$/, `${name} must be a decimal number`)
    .transform(Number)
    .refine((value) => value >= min && value <= max, `${name} must be within the Delhi region`);

export const placeSearchQuery = z.strictObject({
  q: z.string().trim().min(2, 'Enter at least two characters').max(120),
});

export const placeReverseQuery = z.strictObject({
  lat: coordinate(28.2, 29.1, 'lat'),
  lon: coordinate(76.6, 77.6, 'lon'),
});
