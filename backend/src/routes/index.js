import { Router } from 'express';
import { categories, listCrimes, summary, trends } from '../controllers/crimesController.js';
import { health, listDataSources, listValidation } from '../controllers/referenceController.js';
import { getGeography, listGeography } from '../controllers/geographyController.js';
import { requireDatabase, validateParams, validateQuery } from '../middleware/index.js';
import {
  categoriesQuery,
  crimesQuery,
  dataSourcesQuery,
  geographyQuery,
  noQuery,
  objectIdParams,
  seriesQuery,
  validationQuery,
} from '../validators/queries.js';

export const apiRouter = Router();

apiRouter.get('/health', validateQuery(noQuery), health);

apiRouter.use(requireDatabase);
apiRouter.get('/crimes', validateQuery(crimesQuery), listCrimes);
apiRouter.get('/crimes/summary', validateQuery(seriesQuery), summary);
apiRouter.get('/crimes/trends', validateQuery(seriesQuery), trends);
apiRouter.get('/crimes/categories', validateQuery(categoriesQuery), categories);
apiRouter.get('/data-sources', validateQuery(dataSourcesQuery), listDataSources);
apiRouter.get('/validation', validateQuery(validationQuery), listValidation);
apiRouter.get('/geography', validateQuery(geographyQuery), listGeography);
apiRouter.get('/geography/:id', validateQuery(noQuery), validateParams(objectIdParams), getGeography);
