import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useUserProfile } from './useUserProfile';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };
  return { supabase: mockSupabase };
});

// We need to import the mocked supabase to reset it
import { supabase } from '@/integrations/supabase/client';

describe('useUserProfile', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.mocked(supabase.from).mockClear();
    vi.mocked(supabase.select).mockClear();
    vi.mocked(supabase.eq).mockClear();
    vi.mocked(supabase.single).mockClear();
  });

  it('should fetch and return a user profile', async () => {
    const mockProfile = {
      id: 'test-user-id',
      username: 'testuser',
      points: 100,
    };
    vi.mocked(supabase.single).mockResolvedValue({ data: mockProfile, error: null });

    const { result } = renderHook(() => useUserProfile('test-user-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.error).toBeNull();
    });

    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.select).toHaveBeenCalledWith('*');
    expect(supabase.eq).toHaveBeenCalledWith('id', 'test-user-id');
    expect(supabase.single).toHaveBeenCalled();
  });

  it('should return null if no user is found', async () => {
    vi.mocked(supabase.single).mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useUserProfile('non-existent-user-id'));

    await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.profile).toBeNull();
    });
  });

  it('should handle errors during fetch', async () => {
    const mockError = new Error('Failed to fetch');
    vi.mocked(supabase.single).mockResolvedValue({ data: null, error: mockError });

    const { result } = renderHook(() => useUserProfile('test-user-id'));

    await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.profile).toBeNull();
        expect(result.current.error).toEqual(mockError);
    });
  });

  it('should not fetch if userId is undefined', () => {
    renderHook(() => useUserProfile(undefined));
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
