import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils/cn';
import { MAP_CITIES, isCityLive } from './coverage.content';
import styles from './IraqMap.module.css';

/**
 * A stylised outline of Iraq, traced from the national border at low
 * resolution — enough vertices to be recognisable, few enough to stay a
 * readable path. Coordinates are in the 400×460 viewBox this component
 * declares, projected from longitude 38.7–48.8°E and latitude 37.5–29.0°N.
 */
const IRAQ_OUTLINE =
  'M162 5 L241 16 L265 81 L293 135 L268 190 L287 243 L344 270 L357 310 ' +
  'L370 358 L392 406 L372 414 L356 400 L309 454 L238 379 L131 325 L14 280 ' +
  'L8 240 L91 168 L99 108 L144 22 Z';

/**
 * The coverage map.
 *
 * The SVG is `aria-hidden` and the same information is published beneath it as
 * a real list (see `CoveragePage`). A map is a picture of a data set; a
 * screen-reader user needs the data set, not a description of the picture, and
 * duplicating every city into `<title>` elements inside the SVG would make the
 * page announce all eight cities twice.
 */
export const IraqMap = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.map}
        viewBox="0 0 400 460"
        role="presentation"
        aria-hidden="true"
        focusable="false"
      >
        <path className={styles.outline} d={IRAQ_OUTLINE} />

        {MAP_CITIES.map((city) => {
          const live = isCityLive(city);
          return (
            <g key={city.id} className={live ? styles.pinLive : styles.pinSoon}>
              <circle className={styles.pinHalo} cx={city.x} cy={city.y} r={9} />
              <circle className={styles.pinDot} cx={city.x} cy={city.y} r={live ? 5.5 : 4} />
              <text
                className={styles.pinLabel}
                x={city.x + city.labelDx}
                y={city.y + city.labelDy}
                // Centre-anchored regardless of writing direction: `start` and
                // `end` swap sides between Arabic and English, which would
                // move every label the moment the locale changed and undo the
                // hand-placed offsets.
                textAnchor="middle"
                // The label is Arabic inside an SVG that has no inherited
                // direction; stating it here keeps the text shaped correctly.
                direction="rtl"
              >
                {t(city.labelKey)}
              </text>
            </g>
          );
        })}
      </svg>

      <ul role="list" className={styles.legend}>
        <li className={styles.legendItem}>
          <span className={cn(styles.legendSwatch, styles.legendLive)} aria-hidden="true" />
          {t('coverage.available')}
        </li>
        <li className={styles.legendItem}>
          <span className={cn(styles.legendSwatch, styles.legendSoon)} aria-hidden="true" />
          {t('coverage.comingSoon')}
        </li>
      </ul>
    </div>
  );
};

export default IraqMap;
