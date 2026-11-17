---
"@dskripchenko/ui": minor
---

`useColorTheme()`: the person's theme choice — light, dark or following the system — kept in localStorage for the first paint and, with `save`, where every app of theirs reads it; `adopt()` takes a choice made in another app. `shouldSignInSilently()` and `silentSignInUrl()`: silent sign-in (`prompt=none`) for apps that share an OpenID Connect provider.
