import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import AppProviders from '@/app/providers/AppProviders';
import { routeObjects } from '@/app/router';
import { routeMeta, sitemapRoutes } from '@/app/router/routes';
import { paths } from '@/app/router/paths';
import { apiClient } from '@/lib/http/apiClient';
import { RequestError } from '@/lib/http/RequestError';
import {
  deleteAccountFormSchema,
  DELETION_CONFIRM_WORD,
} from '@/features/account/accountDeletion.schema';
import { readDeletionBlock } from '@/features/account/useDeleteAccount';

/**
 * The account-deletion page.
 *
 * Covered here are the properties that would be expensive to get wrong: that
 * the page cannot be submitted without deliberate confirmation, that a coded
 * refusal from the backend is explained rather than swallowed, and that the
 * URL stays public and crawlable — the app stores check that last one, and a
 * well-meaning `noIndex` would break a store submission silently.
 */

const renderDeletionPage = () => {
  const router = createMemoryRouter(routeObjects, { initialEntries: [paths.account.delete] });
  return render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
};

/** Waits for the lazily-loaded page to paint. */
const awaitPage = () =>
  waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'حذف الحساب' })).toBeInTheDocument());

describe('deleteAccountFormSchema', () => {
  const valid = { phone: '07712345678', password: 'secret123', confirm: DELETION_CONFIRM_WORD };

  it('accepts a registered-format phone with the exact confirmation word', () => {
    expect(deleteAccountFormSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects anything but the exact confirmation word', () => {
    expect(deleteAccountFormSchema.safeParse({ ...valid, confirm: 'حذفف' }).success).toBe(false);
    expect(deleteAccountFormSchema.safeParse({ ...valid, confirm: 'delete' }).success).toBe(false);
    expect(deleteAccountFormSchema.safeParse({ ...valid, confirm: '' }).success).toBe(false);
  });

  it('accepts a legacy-length phone — anyone who can log in can delete', () => {
    // Looser than the registration format on purpose; mirrors the backend's
    // loginValidator. See the note in accountDeletion.schema.ts.
    expect(deleteAccountFormSchema.safeParse({ ...valid, phone: '0771234' }).success).toBe(true);
    expect(deleteAccountFormSchema.safeParse({ ...valid, phone: '077-1234' }).success).toBe(false);
  });
});

describe('readDeletionBlock', () => {
  it('reads an active-orders refusal into a rendered count', () => {
    const error = new RequestError('nope', 409, [], 'ACCOUNT_HAS_ACTIVE_ORDERS', { activeOrders: 3 });
    expect(readDeletionBlock(error)).toEqual({ kind: 'activeOrders', activeOrders: 3 });
  });

  it('reads an outstanding-balance refusal into an amount and a count', () => {
    const error = new RequestError('nope', 409, [], 'ACCOUNT_HAS_OUTSTANDING_BALANCE', {
      totalOutstanding: 15000,
      unpaidCount: 3,
      currency: 'IQD',
    });
    expect(readDeletionBlock(error)).toEqual({
      kind: 'outstandingBalance',
      totalOutstanding: 15000,
      unpaidCount: 3,
    });
  });

  it('falls back to the generic message when `details` is not the shape it claims', () => {
    // A backend that changes this payload must degrade to "something went
    // wrong", never render `undefined` next to a currency symbol.
    const error = new RequestError('nope', 409, [], 'ACCOUNT_HAS_ACTIVE_ORDERS', { count: 3 });
    expect(readDeletionBlock(error)).toBeNull();
  });

  it('ignores errors it does not recognise', () => {
    expect(readDeletionBlock(new RequestError('boom', 500))).toBeNull();
    expect(readDeletionBlock(new Error('boom'))).toBeNull();
  });
});

describe('the deletion route', () => {
  it('is registered, enabled, and never feature-flagged off', () => {
    const route = routeMeta.find((r) => r.path === paths.account.delete);
    expect(route).toBeDefined();
    expect(route?.enabled).toBe(true);
  });

  it('stays in the sitemap — the app stores require a public, findable URL', () => {
    expect(sitemapRoutes.some((r) => r.path === paths.account.delete)).toBe(true);
  });

  it('is indexable (no noindex robots tag)', async () => {
    renderDeletionPage();
    await awaitPage();
    await waitFor(() => {
      const robots = document.head.querySelector('meta[name="robots"]');
      expect(robots?.getAttribute('content')).toBe('index, follow');
    });
  });
});

describe('the deletion page', () => {
  // The spy is taken on the axios instance rather than on the feature's own
  // api module, so the whole stack under test is real: schema → hook → http
  // wrapper → envelope unwrapping. Only the socket is faked.
  const spyOnRequest = () => vi.spyOn(apiClient, 'request');
  let post: ReturnType<typeof spyOnRequest>;

  beforeEach(() => {
    post = spyOnRequest();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** Fills every input and submits. `confirm` is what gets typed into the confirmation box. */
  const fillAndSubmit = (confirm: string) => {
    fireEvent.change(screen.getByLabelText('رقم الهاتف المسجّل'), {
      target: { value: '07712345678' },
    });
    fireEvent.change(screen.getByLabelText('كلمة المرور'), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByLabelText(/للتأكيد/), { target: { value: confirm } });
    fireEvent.click(screen.getByRole('button', { name: 'احذف حسابي نهائياً' }));
  };

  it('states what is deleted and what is kept before asking for anything', async () => {
    renderDeletionPage();
    await awaitPage();

    expect(screen.getByText('بيانات تُحذف نهائياً')).toBeInTheDocument();
    expect(screen.getByText('بيانات تبقى')).toBeInTheDocument();
    // The timeline must be stated on the page, not only in the receipt — and it
    // must not promise a countdown, since nothing on the server runs one: the
    // erasure happens when the administration acts on the request.
    expect(screen.getByText(/تُمحى بياناتك الشخصية نهائياً عند تنفيذ إدارة برق للطلب/)).toBeInTheDocument();
  });

  it('does not call the API when the confirmation word is wrong', async () => {
    renderDeletionPage();
    await awaitPage();

    fillAndSubmit('احذف');

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(post).not.toHaveBeenCalled();
  });

  it('replaces the form with the deactivation receipt on success', async () => {
    post.mockResolvedValue({
      data: {
        success: true,
        data: {
          deletedAt: '2026-08-05T10:00:00.000Z',
          role: 'merchant',
        },
      },
    } as never);

    renderDeletionPage();
    await awaitPage();

    fillAndSubmit(DELETION_CONFIRM_WORD);

    await waitFor(() => expect(screen.getByText('تم حذف حسابك')).toBeInTheDocument());
    expect(screen.getByText('تاريخ الإيقاف')).toBeInTheDocument();
    expect(screen.getByText('بانتظار المحو النهائي')).toBeInTheDocument();
    // A password field must not survive on screen after the account is gone.
    expect(screen.queryByLabelText('كلمة المرور')).not.toBeInTheDocument();
  });

  it('explains an active-orders refusal instead of showing a generic failure', async () => {
    post.mockRejectedValue(
      new RequestError('conflict', 409, [], 'ACCOUNT_HAS_ACTIVE_ORDERS', { activeOrders: 2 })
    );

    renderDeletionPage();
    await awaitPage();

    fillAndSubmit(DELETION_CONFIRM_WORD);

    await waitFor(() => expect(screen.getByText('لديك طلبات قيد التنفيذ')).toBeInTheDocument());
    expect(screen.getByText(/2 طلب/)).toBeInTheDocument();
  });

  it('reports bad credentials as such', async () => {
    post.mockRejectedValue(new RequestError('unauthorized', 401));

    renderDeletionPage();
    await awaitPage();

    fillAndSubmit(DELETION_CONFIRM_WORD);

    await waitFor(() =>
      expect(screen.getByText(/رقم الهاتف أو كلمة المرور غير صحيحة/)).toBeInTheDocument()
    );
  });
});
