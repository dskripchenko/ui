/**
 * Silent sign-in of an app that signs people in through an OpenID Connect
 * provider shared with other apps: a person signed in to the provider in
 * another app comes in without pressing "Sign in" — the app's server starts
 * the sign-in with `prompt=none`, the provider answers at once, signed in
 * or not. The server says whether to try (it stops after a refusal); the
 * app decides on each navigation.
 */
export interface SilentSignInState {
  /** Someone is signed in to the app already. */
  signedIn: boolean
  /** The app's server offers a silent sign-in (none refused in this session). */
  offered: boolean
}

/**
 * Whether to go to the provider silently now: a guest, the server offers it,
 * and the page was not reached by signing out (`?out`) or with the reason a
 * sign-in failed (`?sso`).
 */
export function shouldSignInSilently(state: SilentSignInState, query: Record<string, unknown> = {}): boolean {
  return !state.signedIn && state.offered && query.out === undefined && query.sso === undefined
}

/** The app's address that starts a silent sign-in and comes back to `back`. */
export function silentSignInUrl(back = '/', path = '/auth/oidc/redirect'): string {
  return `${path}?silent=1&back=${encodeURIComponent(back)}`
}
