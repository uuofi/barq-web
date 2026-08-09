/**
 * The design-system barrel.
 *
 * Pages import from `@/components/ui` and never reach into an individual
 * file — so a component can be split or renamed without touching eleven
 * pages, and there is one obvious place to look for "what can I build a page
 * out of".
 */

export { default as Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { default as Section, SectionHeading } from './Section';
export type { SectionCanvas } from './Section';

export { default as IconBadge } from './IconBadge';

export { default as FeatureCard, FeatureGrid } from './FeatureCard';

export { default as CheckList } from './CheckList';

export { default as StepFlow } from './StepFlow';
export type { FlowStep } from './StepFlow';

export { default as StatBand } from './StatBand';
export type { Stat } from './StatBand';

export { default as CtaBand } from './CtaBand';
export type { CtaAction } from './CtaBand';

export { default as PageHero } from './PageHero';

export { default as ImageSlot } from './ImageSlot';

export { TextField, TextAreaField, SelectField, ChoiceGroup } from './Field';
export type { Choice } from './Field';
