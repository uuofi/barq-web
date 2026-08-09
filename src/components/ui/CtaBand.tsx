import Section from './Section';
import Button from './Button';
import styles from './CtaBand.module.css';

export interface CtaAction {
  label: string;
  /** Internal route. */
  to?: string;
  /** External or protocol URL. */
  href?: string;
  variant?: 'primary' | 'outline' | 'light';
}

interface CtaBandProps {
  title: string;
  subtitle?: string;
  actions: readonly CtaAction[];
  id?: string;
}

/**
 * The closing call to action.
 *
 * Every page on the site ends with one, and it is always the same shape: a
 * single sentence and at most two buttons, the first of which is the only
 * `primary` on the band. Keeping it a component rather than a per-page block
 * is what stops the eleventh page from ending with three competing CTAs.
 */
export const CtaBand = ({ title, subtitle, actions, id }: CtaBandProps) => (
  <Section canvas="ink" glow spacing="tight" id={id} data-section="cta">
    <div className={styles.inner}>
      <h2 className={styles.title}>{title}</h2>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      <div className={styles.actions}>
        {actions.map((action, index) =>
          action.to ? (
            <Button
              key={action.label}
              to={action.to}
              variant={action.variant ?? (index === 0 ? 'primary' : 'outline')}
            >
              {action.label}
            </Button>
          ) : (
            <Button
              key={action.label}
              href={action.href ?? '#'}
              variant={action.variant ?? (index === 0 ? 'primary' : 'outline')}
            >
              {action.label}
            </Button>
          )
        )}
      </div>
    </div>
  </Section>
);

export default CtaBand;
