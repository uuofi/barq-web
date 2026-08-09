import { isGovernorate, type Governorate } from '@/config/constants';

/**
 * The cities plotted on the coverage map.
 *
 * `x`/`y` are coordinates inside the map's own 400×460 viewBox, projected
 * from real longitude/latitude (38.7–48.8°E → 0–400, 37.5–29.0°N → 0–460).
 * Keeping them in viewBox units rather than percentages means the pins scale
 * with the outline automatically and never drift off the landmass.
 *
 * `governorate` links a pin to the backend's closed governorate enum. A city
 * whose id is in that enum is live; every other pin is explicitly marked
 * "قريباً". That distinction is not cosmetic — this page must never advertise
 * a city the dispatch layer cannot route an order to, which is the same rule
 * `config/constants.ts` exists to enforce.
 */

export interface MapCity {
  id: string;
  labelKey: string;
  x: number;
  y: number;
  /**
   * Label offset from the pin, in viewBox units.
   *
   * Hand-placed rather than computed: the real cities cluster (Mosul sits
   * 34 units from Erbil, Najaf 32 from Diwaniyah) and at that spacing two
   * centred labels overlap into an unreadable smear. Each pair is separated
   * by pushing one label above its pin and the other below, or out to the
   * side where there is empty map.
   */
  labelDx: number;
  labelDy: number;
  /** Set only for cities the backend can actually dispatch in. */
  governorate?: Governorate;
}

export const MAP_CITIES: MapCity[] = [
  { id: 'mosul', labelKey: 'coverage.city.mosul', x: 176, y: 63, labelDx: 0, labelDy: -14 },
  { id: 'erbil', labelKey: 'coverage.city.erbil', x: 210, y: 71, labelDx: 0, labelDy: 21 },
  { id: 'kirkuk', labelKey: 'coverage.city.kirkuk', x: 225, y: 110, labelDx: 34, labelDy: 5 },
  { id: 'baghdad', labelKey: 'coverage.city.baghdad', x: 224, y: 227, labelDx: 0, labelDy: -14 },
  { id: 'karbala', labelKey: 'coverage.city.karbala', x: 211, y: 265, labelDx: -36, labelDy: 4 },
  {
    id: 'najaf',
    labelKey: 'coverage.city.najaf',
    x: 219,
    y: 300,
    labelDx: 0,
    labelDy: 21,
    governorate: 'najaf',
  },
  {
    id: 'diwaniyah',
    labelKey: 'coverage.city.diwaniyah',
    x: 251,
    y: 297,
    labelDx: 6,
    labelDy: -14,
    governorate: 'diwaniyah',
  },
  { id: 'basra', labelKey: 'coverage.city.basra', x: 359, y: 378, labelDx: 0, labelDy: -14 },
];

/** True when the backend's governorate enum actually covers this pin. */
export const isCityLive = (city: MapCity): boolean =>
  city.governorate !== undefined && isGovernorate(city.governorate);

export interface CoverageStat {
  id: string;
  value: string;
  labelKey: string;
}

export const COVERAGE_STATS: CoverageStat[] = [
  { id: 'cities', value: '+5', labelKey: 'coverage.stat.cities' },
  { id: 'areas', value: '+100', labelKey: 'coverage.stat.areas' },
  { id: 'orders', value: '+5000', labelKey: 'coverage.stat.orders' },
];
