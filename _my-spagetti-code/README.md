# External Links To Configure Later

The general Feedback, Help, Privacy, and Terms links are currently disabled in
the UI. Their original Bluesky destinations are listed below so they can be
replaced with this app's own website URLs when it is available.

| UI location | Link | Current destination / source |
| --- | --- | --- |
| Desktop right sidebar | Feedback | `FEEDBACK_FORM_URL` in `src/lib/constants.ts` |
| Desktop right sidebar | Privacy | `https://bsky.social/about/support/privacy-policy` |
| Desktop right sidebar | Terms | `https://bsky.social/about/support/tos` |
| Desktop right sidebar | Help | `HELP_DESK_URL` in `src/lib/constants.ts` |
| Drawer footer | Feedback | `FEEDBACK_FORM_URL` in `src/lib/constants.ts` |
| Drawer footer | Help | `HELP_DESK_URL` in `src/lib/constants.ts` |
| Drawer links | Terms of Service | `https://bsky.social/about/support/tos` |
| Drawer links | Privacy Policy | `https://bsky.social/about/support/privacy-policy` |
| Settings | Help | `HELP_DESK_URL` in `src/lib/constants.ts` |
| Settings > About | Terms of Service | `https://bsky.social/about/support/tos` |
| Settings > About | Privacy Policy | `https://bsky.social/about/support/privacy-policy` |
| Signup screen | Contact support | `FEEDBACK_FORM_URL` in `src/lib/constants.ts` |
| Support screen | Help desk | `HELP_DESK_URL` in `src/lib/constants.ts` |
| Privacy Policy screen | Privacy policy | `https://bsky.social/about/support/privacy-policy` |
| Terms of Service screen | Terms | `https://bsky.social/about/support/tos` |
| Account takedown screen | Terms of Service | `https://bsky.social/about/support/tos` |

Main UI implementations are in:

- `src/view/shell/desktop/RightNav.tsx`
- `src/view/shell/Drawer.tsx`
- `src/screens/Settings/Settings.tsx`
- `src/screens/Settings/AboutSettings.tsx`
- `src/screens/Signup/index.tsx`
- `src/screens/Takendown.tsx`
- `src/view/screens/Support.tsx`
- `src/view/screens/PrivacyPolicy.tsx`
- `src/view/screens/TermsOfService.tsx`

The Terms and Privacy links inside required signup consent and age-verification
flows are intentionally left enabled. Update those separately only after the
app's own legal pages are published.
