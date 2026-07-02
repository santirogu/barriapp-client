import { useMutation } from '@tanstack/react-query';
import { unwrap } from '../typed-client';
import type {
  CompleteProfileRequest,
  LoginRequest,
  RegisterRequest,
  SocialLoginRequest,
  VerifyOtpRequest,
} from '../schemas';
import { useApiClient } from './context';

/**
 * Auth mutations. These only talk to the API and return the raw result; the
 * caller persists the session by passing the returned tokens to the session
 * store's `authenticate()` (keeps this layer platform-agnostic).
 */

/**
 * Register a single-role account (discriminated by `role`). Triggers an OTP;
 * does not log in.
 */
export function useRegister() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (body: RegisterRequest) =>
      // openapi-fetch types the body as the discriminated union.
      unwrap(client.POST('/api/v1/auth/register', { body: body as never })),
  });
}

/** Complete a social account's profile (profile_incomplete → active). */
export function useCompleteProfile() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (body: CompleteProfileRequest) =>
      unwrap(client.POST('/api/v1/me/complete-profile', { body })),
  });
}

/** Verify the OTP; returns tokens on success. */
export function useVerifyOtp() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (body: VerifyOtpRequest) =>
      unwrap(client.POST('/api/v1/auth/verify-otp', { body })),
  });
}

/** Log in with phone + password; returns tokens. */
export function useLogin() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (body: LoginRequest) => unwrap(client.POST('/api/v1/auth/login', { body })),
  });
}

/** Google/Apple sign-in with a provider ID token; returns tokens. */
export function useSocialLogin() {
  const client = useApiClient();
  return useMutation({
    mutationFn: (body: SocialLoginRequest) =>
      unwrap(client.POST('/api/v1/auth/social', { body })),
  });
}

/** Best-effort server logout (the client also clears tokens locally). */
export function useLogout() {
  const client = useApiClient();
  return useMutation({
    mutationFn: () => unwrap(client.POST('/api/v1/auth/logout')),
  });
}
