# Auth0 Universal Login Screen Mappings

Complete mapping of screen files to Auth0 prompt/screen API endpoints.

## Total Screens: 81

### Captcha (1 screen)
- `interstitial-captcha` → `captcha/interstitial-captcha`

### Common (1 screen)
- `redeem-ticket` → `common/redeem-ticket`

### Consent (2 screens)
- `consent` → `consent/consent`
- `customized-consent` → `customized-consent/customized-consent`

### Device Flow (4 screens)
- `device-code-activation` → `device-flow/device-code-activation`
- `device-code-activation-allowed` → `device-flow/device-code-activation-allowed`
- `device-code-activation-denied` → `device-flow/device-code-activation-denied`
- `device-code-confirmation` → `device-flow/device-code-confirmation`

### Email Identifier Challenge (1 screen)
- `email-identifier-challenge` → `email-identifier-challenge/email-identifier-challenge`

### Email OTP Challenge (1 screen)
- `email-otp-challenge` → `email-otp-challenge/email-otp-challenge`

### Email Verification (1 screen)
- `email-verification-result` → `email-verification/email-verification-result`

### Invitation (1 screen)
- `accept-invitation` → `invitation/accept-invitation`

### Login (4 screens)
- `login` → `login/login`
- `login-email-verification` → `login-email-verification/login-email-verification`
- `login-id` → `login-id/login-id`
- `login-password` → `login-password/login-password`

### Login Passwordless (2 screens)
- `login-passwordless-email-code` → `login-passwordless/login-passwordless-email-code`
- `login-passwordless-sms-otp` → `login-passwordless/login-passwordless-sms-otp`

### Logout (3 screens)
- `logout` → `logout/logout`
- `logout-aborted` → `logout/logout-aborted`
- `logout-complete` → `logout/logout-complete`

### MFA (4 screens)
- `mfa-begin-enroll-options` → `mfa/mfa-begin-enroll-options`
- `mfa-detect-browser-capabilities` → `mfa/mfa-detect-browser-capabilities`
- `mfa-enroll-result` → `mfa/mfa-enroll-result`
- `mfa-login-options` → `mfa/mfa-login-options`

### MFA Email (2 screens)
- `mfa-email-challenge` → `mfa-email/mfa-email-challenge`
- `mfa-email-list` → `mfa-email/mfa-email-list`

### MFA OTP (3 screens)
- `mfa-otp-challenge` → `mfa-otp/mfa-otp-challenge`
- `mfa-otp-enrollment-code` → `mfa-otp/mfa-otp-enrollment-code`
- `mfa-otp-enrollment-qr` → `mfa-otp/mfa-otp-enrollment-qr`

### MFA Phone (2 screens)
- `mfa-phone-challenge` → `mfa-phone/mfa-phone-challenge`
- `mfa-phone-enrollment` → `mfa-phone/mfa-phone-enrollment`

### MFA Push (4 screens)
- `mfa-push-challenge-push` → `mfa-push/mfa-push-challenge-push`
- `mfa-push-enrollment-qr` → `mfa-push/mfa-push-enrollment-qr`
- `mfa-push-list` → `mfa-push/mfa-push-list`
- `mfa-push-welcome` → `mfa-push/mfa-push-welcome`

### MFA Recovery Code (3 screens)
- `mfa-recovery-code-challenge` → `mfa-recovery-code/mfa-recovery-code-challenge`
- `mfa-recovery-code-challenge-new-code` → `mfa-recovery-code/mfa-recovery-code-challenge-new-code`
- `mfa-recovery-code-enrollment` → `mfa-recovery-code/mfa-recovery-code-enrollment`

### MFA SMS (4 screens)
- `mfa-country-codes` → `mfa-sms/mfa-country-codes`
- `mfa-sms-challenge` → `mfa-sms/mfa-sms-challenge`
- `mfa-sms-enrollment` → `mfa-sms/mfa-sms-enrollment`
- `mfa-sms-list` → `mfa-sms/mfa-sms-list`

### MFA Voice (2 screens)
- `mfa-voice-challenge` → `mfa-voice/mfa-voice-challenge`
- `mfa-voice-enrollment` → `mfa-voice/mfa-voice-enrollment`

### MFA WebAuthn (8 screens)
- `mfa-webauthn-change-key-nickname` → `mfa-webauthn/mfa-webauthn-change-key-nickname`
- `mfa-webauthn-enrollment-success` → `mfa-webauthn/mfa-webauthn-enrollment-success`
- `mfa-webauthn-error` → `mfa-webauthn/mfa-webauthn-error`
- `mfa-webauthn-not-available-error` → `mfa-webauthn/mfa-webauthn-not-available-error`
- `mfa-webauthn-platform-challenge` → `mfa-webauthn/mfa-webauthn-platform-challenge`
- `mfa-webauthn-platform-enrollment` → `mfa-webauthn/mfa-webauthn-platform-enrollment`
- `mfa-webauthn-roaming-challenge` → `mfa-webauthn/mfa-webauthn-roaming-challenge`
- `mfa-webauthn-roaming-enrollment` → `mfa-webauthn/mfa-webauthn-roaming-enrollment`

### Organizations (2 screens)
- `organization-picker` → `organizations/organization-picker`
- `organization-selection` → `organizations/organization-selection`

### Passkeys (2 screens)
- `passkey-enrollment` → `passkeys/passkey-enrollment`
- `passkey-enrollment-local` → `passkeys/passkey-enrollment-local`

### Phone Identifier Challenge (1 screen)
- `phone-identifier-challenge` → `phone-identifier-challenge/phone-identifier-challenge`

### Phone Identifier Enrollment (1 screen)
- `phone-identifier-enrollment` → `phone-identifier-enrollment/phone-identifier-enrollment`

### Reset Password (14 screens)
- `reset-password` → `reset-password/reset-password`
- `reset-password-email` → `reset-password/reset-password-email`
- `reset-password-error` → `reset-password/reset-password-error`
- `reset-password-mfa-email-challenge` → `reset-password/reset-password-mfa-email-challenge`
- `reset-password-mfa-otp-challenge` → `reset-password/reset-password-mfa-otp-challenge`
- `reset-password-mfa-phone-challenge` → `reset-password/reset-password-mfa-phone-challenge`
- `reset-password-mfa-push-challenge-push` → `reset-password/reset-password-mfa-push-challenge-push`
- `reset-password-mfa-recovery-code-challenge` → `reset-password/reset-password-mfa-recovery-code-challenge`
- `reset-password-mfa-sms-challenge` → `reset-password/reset-password-mfa-sms-challenge`
- `reset-password-mfa-voice-challenge` → `reset-password/reset-password-mfa-voice-challenge`
- `reset-password-mfa-webauthn-platform-challenge` → `reset-password/reset-password-mfa-webauthn-platform-challenge`
- `reset-password-mfa-webauthn-roaming-challenge` → `reset-password/reset-password-mfa-webauthn-roaming-challenge`
- `reset-password-request` → `reset-password/reset-password-request`
- `reset-password-success` → `reset-password/reset-password-success`

### Signup (3 screens)
- `signup` → `signup/signup`
- `signup-id` → `signup-id/signup-id`
- `signup-password` → `signup-password/signup-password`

### Brute Force Protection (3 screens)
- `brute-force-protection-unblock` → `login/brute-force-protection-unblock`
- `brute-force-protection-unblock-success` → `login/brute-force-protection-unblock-success`
- `brute-force-protection-unblock-failure` → `login/brute-force-protection-unblock-failure`

## Usage

Deploy specific screens:
```bash
npm run deploy:screen login mfa-otp-enrollment-code
```

Deploy all screens:
```bash
npm run deploy
```

## API Endpoint Format

```
PATCH https://{domain}/api/v2/prompts/{prompt}/screen/{screen}/rendering
```

Example:
```
PATCH https://tenant.auth0.com/api/v2/prompts/mfa-otp/screen/mfa-otp-enrollment-code/rendering
```

## Build Status

After running `npm run build`, you can check which screens built successfully:
- ✅ **75 screens** built successfully with full functionality
- ⚠️ **6 screens** have placeholders (cannot be built)

### Screens with Build Issues

These screens cannot be built due to SDK or dependency limitations:

#### Brute Force Protection (3 screens)
- `brute-force-protection-unblock`
- `brute-force-protection-unblock-success`  
- `brute-force-protection-unblock-failure`

**Reason**: The `@auth0/auth0-acul-js` package exports these in package.json but the actual implementation files don't exist in `dist/screens/`. These screens are not yet implemented in the SDK (as of v0.1.0-beta.9).

#### Signup (3 screens)
- `signup`
- `signup-id`
- `signup-password`

**Reason**: The sample code imports custom components from relative paths that are part of Auth0's internal monorepo structure:
```tsx
import { Logo } from '../../components/Logo';
import { Title } from './components/Title';
import { FederatedLogin } from './components/FederatedLogin';
// etc.
```

These components don't exist in the standalone samples and cannot be bundled.

### Screens Successfully Fixed

The following screens had issues that were automatically fixed by `scripts/fix-samples.js`:

- ✅ `login` - Removed invalid `getActiveIdentifiers()` SDK call
- ✅ `interstitial-captcha` - Fixed typo in import path (`intersitial` → `interstitial`)
- ✅ `get-current-screen-options` - Converted to informational placeholder (utility function, not a screen)
- ✅ `get-current-theme-options` - Converted to informational placeholder (utility function, not a screen)

### Deployment Notes

The 6 screens with build issues can still be "deployed" to Auth0, but they will only load placeholder JavaScript that displays a warning in the console. The other **75 screens work perfectly** and can be deployed and tested.
