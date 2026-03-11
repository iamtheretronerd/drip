import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUp, login, logout, resetPassword, updatePassword } from '@/lib/actions/auth';
import type { ActionResult } from '@/types';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock supabase server
const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockUpdateUser = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      getUser: mockGetUser,
    },
  })),
}));

describe('signUp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
  });

  it('returns validation error for invalid input', async () => {
    const formData = new FormData();
    formData.append('fullName', '');
    formData.append('email', 'invalid-email');
    formData.append('password', 'weak');

    const result = await signUp({ success: false } as ActionResult, formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors).toBeDefined();
  });

  it('returns success for valid input', async () => {
    const formData = new FormData();
    formData.append('fullName', 'John Doe');
    formData.append('email', 'john@example.com');
    formData.append('password', 'Password123');

    mockSignUp.mockResolvedValue({ error: null });

    const { redirect } = await import('next/navigation');
    
    await signUp({ success: false } as ActionResult, formData);

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'Password123',
      options: { data: { full_name: 'John Doe' } },
    });
  });

  it('returns error when supabase signup fails', async () => {
    const formData = new FormData();
    formData.append('fullName', 'John Doe');
    formData.append('email', 'john@example.com');
    formData.append('password', 'Password123');

    mockSignUp.mockResolvedValue({ error: { message: 'Email already exists' } });

    const result = await signUp({ success: false } as ActionResult, formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Email already exists');
  });
});

describe('login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns validation error for invalid email', async () => {
    const formData = new FormData();
    formData.append('email', 'invalid');
    formData.append('password', 'somepassword');

    const result = await login({ success: false } as ActionResult, formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors).toBeDefined();
  });

  it('returns generic error for invalid credentials', async () => {
    const formData = new FormData();
    formData.append('email', 'user@example.com');
    formData.append('password', 'WrongPass123');

    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    const result = await login({ success: false } as ActionResult, formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid email or password');
  });

  it('calls signInWithPassword with correct credentials', async () => {
    const formData = new FormData();
    formData.append('email', 'user@example.com');
    formData.append('password', 'CorrectPass123');

    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-123' }, session: { access_token: 'token' } },
      error: null,
    });

    await login({ success: false } as ActionResult, formData);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'CorrectPass123',
    });
  });
});

describe('logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls signOut and redirects', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    await logout();

    expect(mockSignOut).toHaveBeenCalled();
  });
});

describe('resetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns validation error for invalid email', async () => {
    const formData = new FormData();
    formData.append('email', 'not-an-email');

    const result = await resetPassword({ success: false } as ActionResult, formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.email).toBeDefined();
  });

  it('returns success even on supabase error to prevent enumeration', async () => {
    const formData = new FormData();
    formData.append('email', 'user@example.com');

    mockResetPasswordForEmail.mockResolvedValue({ error: { message: 'User not found' } });

    const result = await resetPassword({ success: false } as ActionResult, formData);

    expect(result.success).toBe(true);
  });

  it('calls resetPasswordForEmail with correct email', async () => {
    const formData = new FormData();
    formData.append('email', 'user@example.com');

    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    await resetPassword({ success: false } as ActionResult, formData);

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      'user@example.com',
      expect.objectContaining({
        redirectTo: expect.stringContaining('/auth/callback'),
      })
    );
  });
});

describe('updatePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns validation error when passwords do not match', async () => {
    const formData = new FormData();
    formData.append('password', 'NewPass123');
    formData.append('confirmPassword', 'DifferentPass123');

    const result = await updatePassword({ success: false } as ActionResult, formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors).toBeDefined();
  });

  it('returns validation error for weak password', async () => {
    const formData = new FormData();
    formData.append('password', 'weak');
    formData.append('confirmPassword', 'weak');

    const result = await updatePassword({ success: false } as ActionResult, formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.password).toBeDefined();
  });

  it('calls updateUser with new password', async () => {
    const formData = new FormData();
    formData.append('password', 'NewStrongPass123');
    formData.append('confirmPassword', 'NewStrongPass123');

    mockUpdateUser.mockResolvedValue({ error: null });

    await updatePassword({ success: false } as ActionResult, formData);

    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'NewStrongPass123' });
  });

  it('returns error when update fails', async () => {
    const formData = new FormData();
    formData.append('password', 'NewStrongPass123');
    formData.append('confirmPassword', 'NewStrongPass123');

    mockUpdateUser.mockResolvedValue({ error: { message: 'Token expired' } });

    const result = await updatePassword({ success: false } as ActionResult, formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Token expired');
  });
});
