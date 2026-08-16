import { describe, expect, it } from 'vitest';
import { apiClient } from '@/lib/http/apiClient';
import { applyApi } from '@/features/apply/apply.api';

/**
 * TEMPORARY diagnosis: drive the REAL axios stack (no mocks) against a real
 * backend on :4321, to find out why the browser upload fails while `curl -F`
 * against the same endpoint succeeds.
 */

const JPEG_1X1 = Uint8Array.from(
  atob(
    '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a' +
      'HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAA' +
      'AAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q=='
  ),
  (c) => c.charCodeAt(0)
);

describe('real upload against a live backend', () => {
  it('uploads a jpeg and gets a URL back', async () => {
    apiClient.defaults.baseURL = 'http://localhost:4321/api/v1';

    const file = new File([JPEG_1X1], 'me.jpg', { type: 'image/jpeg' });

    try {
      const result = await applyApi.uploadDriverPhoto(file);
      console.log('SUCCESS:', result);
      expect(result.url).toContain('/uploads/driver-photos/');
    } catch (error) {
      console.log('FAILED ->', {
        name: (error as Error).name,
        message: (error as Error).message,
        status: (error as { status?: number }).status,
        code: (error as { code?: string }).code,
      });
      throw error;
    }
  }, 30_000);
});
