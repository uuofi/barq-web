import { Fragment, type ComponentType, type SVGProps } from 'react';
import { ArrowLeftIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import IconBadge from './IconBadge';
import styles from './StepFlow.module.css';

export interface FlowStep {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  caption?: string;
}

interface StepFlowProps {
  steps: FlowStep[];
  onDark?: boolean;
  /** Shows the 1..n ordinal chip on each medallion. */
  numbered?: boolean;
  badgeSize?: 'md' | 'lg' | 'xl';
  /** Accessible name for the list, e.g. "كيف يعمل الطلب؟". */
  label: string;
  className?: string;
}

/**
 * A left-to-right (in RTL: right-to-left) process flow.
 *
 * The sequence IS the content here — a screen-reader user needs to hear
 * "1 of 5" as much as a sighted user needs to see the arrows.
 *
 * It is built from ARIA list roles rather than a real `<ol>` because the
 * connector arrows are laid out as siblings of the steps. Inside an `<ol>`
 * they would have to be `<li>`s (nothing else is valid there), which would
 * make a 5-step flow announce as "9 items" and every step's position as
 * double what it is. `aria-hidden` does not fix that: it hides the arrow's
 * content, not its slot in the parent's item count. With explicit roles the
 * arrows are plain `<div>`s outside the list's accessibility tree, and the
 * count matches what is on screen.
 */
export const StepFlow = ({
  steps,
  onDark = false,
  numbered = false,
  badgeSize = 'lg',
  label,
  className,
}: StepFlowProps) => (
  <div
    role="list"
    aria-label={label}
    className={cn(styles.flow, onDark && styles.onDark, className)}
  >
    {steps.map((step, index) => (
      <Fragment key={step.label}>
        {index > 0 ? (
          <div className={styles.arrow} aria-hidden="true">
            <ArrowLeftIcon />
          </div>
        ) : null}
        <div role="listitem" className={styles.step}>
          <span className={styles.medallionWrap}>
            <IconBadge
              icon={step.icon}
              size={badgeSize}
              shape="circle"
              tone={onDark ? 'onDark' : 'default'}
            />
            {numbered ? <span className={styles.ordinal}>{index + 1}</span> : null}
          </span>
          <span className={styles.label}>{step.label}</span>
          {step.caption ? <span className={styles.caption}>{step.caption}</span> : null}
        </div>
      </Fragment>
    ))}
  </div>
);

export default StepFlow;
