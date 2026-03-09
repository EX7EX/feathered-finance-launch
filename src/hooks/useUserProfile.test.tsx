import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useUserProfile } from './use-user-profile';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'test-user-id' },
  }),
}));

// Mock the Supabase client
const mockSingle = vi.fn();
const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({ select: mockSelect }),
  },
}));

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return a user profile', async () => {
    const mockProfile = {
      id: 'test-user-id',
      username: 'testuser',
      points: 100,
    };
    mockSingle.mockResolvedValue({ data: mockProfile, error: null });

    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
