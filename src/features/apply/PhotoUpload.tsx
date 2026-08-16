import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadIcon, CloseIcon, PersonIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import { RequestError } from '@/lib/http/RequestError';
import { useUploadDriverPhoto } from './useApplyRegistration';
import preparePhoto from './preparePhoto';
import styles from './ApplyLayout.module.css';

/**
 * What the backend's multer config accepts (upload.middleware.js). Enforced
 * here too so an unusable file is refused instantly instead of after a 5MB
 * round-trip that ends in a 400.
 */
const ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_BYTES = 5 * 1024 * 1024;

interface PhotoUploadProps {
  /** The uploaded photo's URL, or '' when there isn't one yet. */
  value: string;
  /** Fires with the new URL once the upload succeeds, and with '' when cleared. */
  onChange: (photoUrl: string) => void;
  /** Validation error from the form (e.g. submitted with no photo). */
  error?: string;
  /** Reports in-flight uploads so the page can block submit while one runs. */
  onUploadingChange?: (uploading: boolean) => void;
}

/**
 * The applicant's photo — the driver form's first field, mirroring the
 * <PhotoPicker> on the app's own sign-up screen.
 *
 * The upload happens the moment a file is chosen rather than at submit. That is
 * the same choice the app makes, for the same two reasons: the slow part
 * finishes while the applicant is still filling in the rest of the form, and a
 * rejected file (too large, wrong format, server down) is reported next to the
 * control that caused it instead of surfacing as a failed submission of the
 * whole application.
 *
 * Consequently the form never holds a `File` at all — only the URL the upload
 * returned, which is exactly what gets sent as `driver.photoUrl`.
 */
export const PhotoUpload = ({ value, onChange, error, onUploadingChange }: PhotoUploadProps) => {
  const { t } = useTranslation();
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const upload = useUploadDriverPhoto();
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * A local object URL, so the applicant sees their photo immediately instead
   * of waiting for the upload and then for the server to serve it back. Kept
   * separate from `value` (the remote URL) because the two have different
   * lifetimes — this one has to be revoked.
   */
  const [preview, setPreview] = useState<string | null>(null);
  /** Client-side rejection (size/format); server failures come from `upload`. */
  const [localError, setLocalError] = useState<string | undefined>();
  /** Decoding + downscaling, which happens before the request goes out. */
  const [preparing, setPreparing] = useState(false);

  // One flag for "the photo is not ready yet", covering both phases. The page
  // uses it to block submit, so it must stay true across the handover from
  // downscaling to uploading — a gap between them would let a submit slip
  // through with photoUrl still empty.
  const busy = preparing || upload.isPending;

  useEffect(() => {
    if (!preview) return undefined;
    // Revoking on replace/unmount, not on upload success: the preview stays on
    // screen for as long as the form does. Without this every retaken photo
    // leaks its blob for the lifetime of the tab.
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    onUploadingChange?.(busy);
  }, [busy, onUploadingChange]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    setLocalError(undefined);
    upload.reset();

    if (!ACCEPT.split(',').includes(file.type)) {
      setLocalError(t('apply.driver.form.photoFormat'));
      return;
    }

    setPreview(URL.createObjectURL(file));
    // Drop any previously uploaded URL right away: until this upload resolves
    // the preview on screen and the stored URL would otherwise disagree, and a
    // submit landing in that gap would send the OLD photo.
    onChange('');

    // Shrunk BEFORE the size check, not after: a 9MB camera photo is a
    // perfectly good application photo once it is 1280px wide, and rejecting
    // it for its original size would turn "take a picture of yourself" into a
    // task requiring an image editor. Only a file that is still too big after
    // downscaling — which in practice means it never decoded — is refused.
    setPreparing(true);
    let prepared: File;
    try {
      prepared = await preparePhoto(file);
    } finally {
      setPreparing(false);
    }

    if (prepared.size > MAX_BYTES) {
      setLocalError(t('apply.driver.form.photoTooLarge'));
      return;
    }

    upload.mutate(prepared, {
      onSuccess: ({ url }) => onChange(url),
    });
  };

  const clear = () => {
    setPreview(null);
    setLocalError(undefined);
    upload.reset();
    onChange('');
    // The native input keeps its last selection, and re-picking the same file
    // would then fire no `change` event at all.
    if (inputRef.current) inputRef.current.value = '';
  };

  const uploadError = upload.isError ? describeUploadFailure(upload.error, t) : undefined;

  const shownError = localError ?? uploadError ?? error;
  const hasPhoto = Boolean(preview || value);

  return (
    <div className={styles.photoField}>
      <span className={styles.photoLabel}>
        {t('apply.driver.form.photo')}
        <span className={styles.photoRequired} aria-hidden="true">
          *
        </span>
        <span className="visually-hidden">{t('forms.required')}</span>
      </span>

      <div className={styles.photoRow}>
        <div
          className={cn(
            styles.photoPreview,
            busy && styles.photoPreviewBusy,
            shownError && styles.photoPreviewInvalid
          )}
        >
          {preview ? (
            <img src={preview} alt="" className={styles.photoImage} />
          ) : (
            <PersonIcon className={styles.photoPlaceholder} aria-hidden="true" />
          )}

          {busy ? <span className={styles.photoSpinner} aria-hidden="true" /> : null}
        </div>

        <div className={styles.photoActions}>
          {/*
            A real file input, labelled — not a button that calls .click() on a
            hidden one. It stays keyboard-reachable and announces its own
            filled/empty state with no extra ARIA.
          */}
          <label className={styles.photoButton} htmlFor={inputId}>
            <UploadIcon className={styles.photoButtonIcon} aria-hidden="true" />
            {hasPhoto ? t('apply.driver.form.photoChange') : t('apply.driver.form.photoChoose')}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            className="visually-hidden"
            type="file"
            accept={ACCEPT}
            aria-invalid={Boolean(shownError) || undefined}
            aria-describedby={shownError ? errorId : undefined}
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />

          {hasPhoto ? (
            <button type="button" className={styles.photoRemove} onClick={clear}>
              <CloseIcon className={styles.photoButtonIcon} aria-hidden="true" />
              {t('apply.driver.form.photoRemove')}
            </button>
          ) : null}

          <p className={styles.photoHint}>{t('apply.driver.form.photoHint')}</p>
        </div>
      </div>

      {/*
        `aria-live` rather than `role="alert"`: the upload resolves on its own,
        so "جارٍ الرفع…" → "تم رفع الصورة" arrives without the applicant doing
        anything, and it should be announced politely rather than interrupt
        whatever field they have moved on to.
      */}
      <p className={styles.photoStatus} aria-live="polite">
        {preparing ? t('apply.driver.form.photoPreparing') : null}
        {upload.isPending ? t('apply.driver.form.photoUploading') : null}
        {!busy && value ? t('apply.driver.form.photoReady') : null}
      </p>

      {shownError ? (
        <p id={errorId} className={styles.photoError} role="alert">
          <CloseIcon className={styles.photoErrorIcon} aria-hidden="true" />
          {shownError}
        </p>
      ) : null}
    </div>
  );
};

/**
 * Turns an upload failure into a sentence that names the actual problem.
 *
 * This matters more than it looks. Every one of these arrives at the applicant
 * as "the photo didn't upload", but the thing they should DO differs
 * completely — retry, wait, use a different picture, or tell us the server is
 * down. Collapsing them into one message also makes the failure undiagnosable
 * from a screenshot, which is exactly how an upload bug stays open for days.
 */
const describeUploadFailure = (error: unknown, t: (key: string) => string): string => {
  if (!RequestError.is(error)) return t('apply.driver.form.photoUploadFailed');

  // Nothing came back at all: offline, the API host is unreachable, the dev
  // proxy has no backend behind it, or a reverse proxy cut the connection.
  if (error.isNetworkError) {
    return error.code === 'ECONNABORTED'
      ? t('apply.driver.form.photoTimeout')
      : t('apply.driver.form.photoNoConnection');
  }
  // 413 comes from the proxy in front of the API, not from our own handler —
  // its body carries no useful message, and often no CORS headers either.
  if (error.status === 413) return t('apply.driver.form.photoTooLarge');
  // The backend's own refusals (bad format, corrupt bytes, throttled, uploads
  // directory unavailable) already carry a specific message; showing it beats
  // any guess made here.
  if (error.status === 400 || error.isRateLimited || error.status === 503) {
    return error.message;
  }
  return t('apply.driver.form.photoUploadFailed');
};

export default PhotoUpload;
