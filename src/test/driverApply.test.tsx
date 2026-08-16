import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AppProviders from '@/app/providers/AppProviders';
import { routeMeta } from '@/app/router/routes';
import { paths } from '@/app/router/paths';
import { apiClient } from '@/lib/http/apiClient';
import { RequestError } from '@/lib/http/RequestError';
import { endpoints } from '@/lib/http/endpoints';
import DriverApplyPage from '@/features/apply/DriverApplyPage';
import ApplySuccessPage from '@/features/apply/ApplySuccessPage';
import {
  DRIVER_INITIAL_VALUES,
  driverApplicationSchema,
  type DriverFormValues,
} from '@/features/apply/apply.schema';

/**
 * The driver application form.
 *
 * The property under test throughout is the one the whole change exists for:
 * this form asks for exactly what the driver app's own sign-up screen asks for
 * (photo, governorate, name, phone, password ×2, terms), and a completed
 * submission reaches the backend as a real `pending_review` account — the thing
 * the admin approvals queue lists.
 */

const VALID: DriverFormValues = {
  photoUrl: 'https://api.example.com/uploads/driver-photos/abc.jpg',
  governorate: 'najaf',
  fullName: 'علي محمد',
  phone: '07712345678',
  password: 'secret123',
  confirmPassword: 'secret123',
  agreeTerms: true,
};

describe('driverApplicationSchema', () => {
  it('accepts a complete application', () => {
    expect(driverApplicationSchema.safeParse(VALID).success).toBe(true);
  });

  it('requires every field the app requires, and nothing it does not', () => {
    // Each of these alone must sink the form — the set IS the contract with
    // delivery-app/app/(auth)/driver-register.tsx.
    expect(driverApplicationSchema.safeParse({ ...VALID, photoUrl: '' }).success).toBe(false);
    expect(driverApplicationSchema.safeParse({ ...VALID, governorate: '' }).success).toBe(false);
    expect(driverApplicationSchema.safeParse({ ...VALID, fullName: '' }).success).toBe(false);
    expect(driverApplicationSchema.safeParse({ ...VALID, phone: '' }).success).toBe(false);
    expect(driverApplicationSchema.safeParse({ ...VALID, agreeTerms: false }).success).toBe(false);

    // And the fields the old five-step wizard demanded are not in the shape at
    // all, so an application without them is still complete.
    expect(Object.keys(DRIVER_INITIAL_VALUES).sort()).toEqual(
      ['agreeTerms', 'confirmPassword', 'fullName', 'governorate', 'password', 'phone', 'photoUrl'].sort()
    );
  });

  it('enforces the backend rules the applicant would otherwise hit as a 422', () => {
    // 07 + 9 digits (auth.validators.js), 6-char minimum, matching confirmation.
    expect(driverApplicationSchema.safeParse({ ...VALID, phone: '0771234' }).success).toBe(false);
    expect(driverApplicationSchema.safeParse({ ...VALID, phone: '08712345678' }).success).toBe(false);
    expect(driverApplicationSchema.safeParse({ ...VALID, password: 'short' }).success).toBe(false);
    expect(
      driverApplicationSchema.safeParse({ ...VALID, confirmPassword: 'different1' }).success
    ).toBe(false);
  });

  it('rejects a governorate that is not one the platform serves', () => {
    // The closed list is what stops a tampered <select> from partitioning an
    // account into a governorate that does not exist.
    expect(driverApplicationSchema.safeParse({ ...VALID, governorate: 'baghdad' }).success).toBe(
      false
    );
  });

  it('narrows the governorate on the way out, so no cast is needed at submit', () => {
    const parsed = driverApplicationSchema.parse(VALID);
    expect(parsed.governorate).toBe('najaf');
  });
});

describe('the driver apply page', () => {
  // Spying on the axios instance keeps the whole stack real — schema, hook,
  // http wrapper, envelope unwrapping. Only the socket is faked.
  const spyOnRequest = () => vi.spyOn(apiClient, 'request');
  let post: ReturnType<typeof spyOnRequest>;

  beforeEach(() => {
    post = spyOnRequest();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * A plain <MemoryRouter> around just the two pages this flow moves between,
   * rather than the app's full data router.
   *
   * Two reasons, both practical. A data router builds a real `Request` on every
   * navigation, and undici's strict `AbortSignal` check collides with jsdom's
   * own class in this environment — the same limitation architecture.test.tsx
   * documents, which would make the post-submit redirect unassertable. And
   * without the site chrome, a query for "سياسة الخصوصية" finds the link in the
   * consent text under test instead of also matching the one in the footer.
   */
  const renderPage = () =>
    render(
      <AppProviders>
        <MemoryRouter initialEntries={[paths.apply.driver]}>
          <Routes>
            <Route path={paths.apply.driver} element={<DriverApplyPage />} />
            <Route path={paths.apply.success} element={<ApplySuccessPage />} />
          </Routes>
        </MemoryRouter>
      </AppProviders>
    );

  const awaitPage = () =>
    waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'تقديم طلب كسائق' })).toBeInTheDocument()
    );

  /** The consent sentence's own links — scoped by the checkbox's label. */
  const termsLinks = () => {
    const checkbox = screen.getByRole('checkbox');
    const label = document.querySelector<HTMLElement>(`label[for="${checkbox.id}"]`);
    expect(label).not.toBeNull();
    return within(label as HTMLElement);
  };

  /** Everything except the photo, which needs a file event. */
  const fillTextFields = () => {
    fireEvent.change(screen.getByLabelText(/المحافظة/), { target: { value: 'najaf' } });
    fireEvent.change(screen.getByLabelText(/الاسم الكامل/), { target: { value: 'علي محمد' } });
    fireEvent.change(screen.getByLabelText(/رقم الهاتف/), { target: { value: '07712345678' } });
    fireEvent.change(screen.getByLabelText(/^كلمة المرور/), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByLabelText(/تأكيد كلمة المرور/), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
  };

  const submit = () => fireEvent.click(screen.getByRole('button', { name: 'إرسال الطلب' }));

  it('asks for the same fields as the driver app, and nothing more', async () => {
    renderPage();
    await awaitPage();

    expect(screen.getByText(/صورتك الشخصية/)).toBeInTheDocument();
    expect(screen.getByLabelText(/المحافظة/)).toBeInTheDocument();
    expect(screen.getByLabelText(/الاسم الكامل/)).toBeInTheDocument();
    expect(screen.getByLabelText(/رقم الهاتف/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^كلمة المرور/)).toBeInTheDocument();
    expect(screen.getByLabelText(/تأكيد كلمة المرور/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();

    // The old wizard's extra demands are gone — a web applicant no longer has
    // to clear steps an in-app applicant never sees.
    expect(screen.queryByLabelText(/تاريخ الميلاد/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/موديل المركبة/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/رقم لوحة المركبة/)).not.toBeInTheDocument();
    expect(screen.queryByText(/رخصة القيادة/)).not.toBeInTheDocument();
    // …and so is the step counter: this is one screen now.
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('refuses to submit without a photo, and says so', async () => {
    renderPage();
    await awaitPage();

    fillTextFields();
    submit();

    await waitFor(() =>
      expect(screen.getByText('صورتك الشخصية مطلوبة')).toBeInTheDocument()
    );
    expect(post).not.toHaveBeenCalled();
  });

  it('refuses to submit without agreeing to the terms', async () => {
    renderPage();
    await awaitPage();

    fillTextFields();
    // Untick it again.
    fireEvent.click(screen.getByRole('checkbox'));
    submit();

    await waitFor(() =>
      expect(
        screen.getByText('يجب الموافقة على سياسة الخصوصية والشروط والأحكام')
      ).toBeInTheDocument()
    );
    expect(post).not.toHaveBeenCalled();
  });

  it('links the terms and privacy documents rather than only naming them', async () => {
    renderPage();
    await awaitPage();

    const links = termsLinks();
    expect(links.getByRole('link', { name: 'سياسة الخصوصية' })).toHaveAttribute(
      'href',
      paths.legal.privacy
    );
    expect(links.getByRole('link', { name: 'الشروط والأحكام' })).toHaveAttribute(
      'href',
      paths.legal.terms
    );
    // In a new tab — following one mid-form would discard everything typed.
    expect(links.getByRole('link', { name: 'سياسة الخصوصية' })).toHaveAttribute(
      'target',
      '_blank'
    );
  });

  it('is registered as a route and stays enabled', () => {
    const route = routeMeta.find((r) => r.path === paths.apply.driver);
    expect(route).toBeDefined();
    expect(route?.enabled).toBe(true);
  });

  it('uploads the photo when it is chosen, then submits the URL it returned', async () => {
    post.mockImplementation((config) => {
      if (config?.url === endpoints.uploadDriverPhoto) {
        return Promise.resolve({
          data: { success: true, data: { url: VALID.photoUrl } },
        }) as never;
      }
      return Promise.resolve({
        data: { success: true, data: { pendingApproval: true, message: 'قيد المراجعة' } },
      }) as never;
    });

    renderPage();
    await awaitPage();

    const file = new File(['x'], 'me.jpg', { type: 'image/jpeg' });
    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [file] },
    });

    // The upload runs on selection, not at submit — that is the point of it.
    await waitFor(() => expect(screen.getByText('تم رفع الصورة')).toBeInTheDocument());

    const upload = post.mock.calls.find(([c]) => c?.url === endpoints.uploadDriverPhoto)?.[0];
    expect(upload?.data).toBeInstanceOf(FormData);
    // Cleared, so axios does not serialise the multipart body to JSON.
    expect((upload?.headers as Record<string, unknown>)?.['Content-Type']).toBeNull();

    fillTextFields();
    submit();

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'تم استلام طلبك بنجاح!' })).toBeInTheDocument()
    );

    const application = post.mock.calls.find(([c]) => c?.url === endpoints.submitApplication)?.[0];
    expect(application?.data).toEqual({
      role: 'driver',
      name: 'علي محمد',
      phone: '07712345678',
      password: 'secret123',
      governorate: 'najaf',
      driver: {
        vehicleType: 'motorcycle',
        photoUrl: VALID.photoUrl,
      },
    });
  });

  it('submits to the no-verification public endpoint, never to /auth/register', async () => {
    // /auth/register answers 202 with an SMS challenge whenever OTP is on, and
    // the web funnel deliberately sends no code. Hitting it here would strand
    // every web application on a code that never arrives.
    expect(endpoints.submitApplication).toBe('/public/applications');
    expect(endpoints.submitApplication).not.toBe('/auth/register');
  });

  it('tells a returning applicant their number is already registered', async () => {
    post.mockImplementation((config) => {
      if (config?.url === endpoints.uploadDriverPhoto) {
        return Promise.resolve({
          data: { success: true, data: { url: VALID.photoUrl } },
        }) as never;
      }
      return Promise.reject(new RequestError('conflict', 409));
    });

    renderPage();
    await awaitPage();

    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [new File(['x'], 'me.jpg', { type: 'image/jpeg' })] },
    });
    await waitFor(() => expect(screen.getByText('تم رفع الصورة')).toBeInTheDocument());

    fillTextFields();
    submit();

    await waitFor(() =>
      expect(screen.getByText(/رقم الهاتف هذا مسجّل لدينا مسبقاً/)).toBeInTheDocument()
    );
  });

  it('rejects a format the backend cannot store, without spending an upload', async () => {
    renderPage();
    await awaitPage();

    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [new File(['x'], 'scan.pdf', { type: 'application/pdf' })] },
    });

    await waitFor(() =>
      expect(
        screen.getByText('الصيغة غير مدعومة. اختر صورة JPG أو PNG أو WebP.')
      ).toBeInTheDocument()
    );
    expect(post).not.toHaveBeenCalled();
  });

  /**
   * The failure the applicant actually reported: the upload churns, then dies
   * with a message that names no cause. Each of these needs its own sentence —
   * "retry", "check your connection" and "the server refused this file" are
   * different instructions, and one generic string makes the real problem
   * invisible in a screenshot.
   */
  it.each([
    [new RequestError('تعذّر الاتصال بالخادم', 0, [], 'ERR_NETWORK'), /تحقّق من اتصالك بالإنترنت/],
    [new RequestError('انتهت مهلة الاتصال', 0, [], 'ECONNABORTED'), /استغرق رفع الصورة وقتاً طويلاً/],
    [new RequestError('Payload Too Large', 413), /حجم الصورة كبير جداً/],
    [new RequestError('Photo must be a JPEG, PNG, or WebP image', 400), /Photo must be a JPEG/],
    [new RequestError('Too many photo uploads', 429), /Too many photo uploads/],
    [new RequestError('Photo uploads are temporarily unavailable', 503), /temporarily unavailable/],
  ])('explains upload failure %#, rather than showing one generic message', async (error, expected) => {
    post.mockRejectedValue(error);

    renderPage();
    await awaitPage();

    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [new File(['x'], 'me.jpg', { type: 'image/jpeg' })] },
    });

    // Generous timeout: a NETWORK failure is retried once before it is shown
    // (see queryClient.ts — a transient blip should heal itself rather than
    // accuse the applicant's photo), and that retry is backed off ~1s.
    await waitFor(() => expect(screen.getByText(expected)).toBeInTheDocument(), { timeout: 5000 });
  });
});
