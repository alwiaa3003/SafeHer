import { Router } from 'express';
import { categories, listCrimes, summary, trends } from '../controllers/crimesController.js';
import { health, listDataSources, listValidation } from '../controllers/referenceController.js';
import { getGeography, listGeography } from '../controllers/geographyController.js';
import { districtBoundaries, districtMeta, districtStatistics } from '../controllers/policeDistrictsController.js';
import { reversePlace, searchPlaces } from '../controllers/placesController.js';
import { cacheFor, PUBLIC_DATA_CACHE, requireDatabase, validateParams, validateQuery } from '../middleware/index.js';
import {
  categoriesQuery,
  crimesQuery,
  dataSourcesQuery,
  districtStatisticsQuery,
  geographyQuery,
  noQuery,
  objectIdParams,
  placeReverseQuery,
  placeSearchQuery,
  seriesQuery,
  validationQuery,
} from '../validators/queries.js';

export const apiRouter = Router();

const noStore = cacheFor('no-store');

apiRouter.get('/health', noStore, validateQuery(noQuery), health);

// Place search does not use the database, so it stays available if MongoDB is down.
// Searches are personal, so shared caches must not keep them (the server keeps its own cache).
apiRouter.get('/places/search', noStore, validateQuery(placeSearchQuery), searchPlaces);
apiRouter.get('/places/reverse', noStore, validateQuery(placeReverseQuery), reversePlace);

apiRouter.use(requireDatabase, cacheFor(PUBLIC_DATA_CACHE));
apiRouter.get('/crimes', validateQuery(crimesQuery), listCrimes);
apiRouter.get('/crimes/summary', validateQuery(seriesQuery), summary);
apiRouter.get('/crimes/trends', validateQuery(seriesQuery), trends);
apiRouter.get('/crimes/categories', validateQuery(categoriesQuery), categories);
apiRouter.get('/data-sources', validateQuery(dataSourcesQuery), listDataSources);
apiRouter.get('/validation', validateQuery(validationQuery), listValidation);
apiRouter.get('/geography', validateQuery(geographyQuery), listGeography);
apiRouter.get('/geography/:id', validateQuery(noQuery), validateParams(objectIdParams), getGeography);
apiRouter.get('/police-districts/meta', validateQuery(noQuery), districtMeta);
apiRouter.get('/police-districts/statistics', validateQuery(districtStatisticsQuery), districtStatistics);
apiRouter.get('/police-districts/boundaries', validateQuery(noQuery), districtBoundaries);
