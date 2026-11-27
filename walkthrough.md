# Security Summary

**Reviewed Files**: 28
**Issues Resolved**: 14

### Issues Resolved
| Area | File | Line | What Was Happening | Impact | Status | How It Was Fixed |
|---|---|---|---|---|---|---|
| False Ad Ownership & Guest Delete Bypass | `src/components/Product/ProductDetailModal.tsx` | 70 | Logged-out visitors or guests matched fallback seller markers (`'user-me'` / `'Rahim Tech'`) and saw ad Edit/Delete buttons. | High | Fixed | Replaced loose seller ID fallbacks with strict `isAdOwner()` requiring an active authenticated user matching owner ID, email, or normalized phone. |
| Logged-Out Dashboard & Logout UI Leakage | `src/components/Navbar/Navbar.tsx` | 91 | Legacy session markers caused the Logout button, Dashboard tab, and Profile menu to appear even when logged out. | Medium | Fixed | Added `isEffectiveLoggedIn()` checks across Navbar, Dashboard, and Profile views and hid logged-in-only controls when unauthenticated. |
| Logged-Out Interactive Actions & Mutations | `src/context/MarketContext.tsx` | 815 | Logged-out sessions could toggle wishlist/likes, reactions, seller follows, reviews, alerts, chat messages, and ad mutations locally. | High | Fixed | Enforced early `isEffectiveLoggedIn()` / `isAdOwner()` / `isEffectiveAdmin()` guards on all interactive actions and mutations, prompting login instead. |
| Client-Only Admin Query Parameter Spoofing | `api/products.ts` | 133 | Passing `?role=admin` in the query string exposed pending/rejected ads and bypassed moderation filters. | High | Fixed | Replaced query-parameter trust with cryptographic `verifyAdminRequest(req)` verification and filtered unlisted ads from non-owners. |
| Unauthenticated Product & Chat Mutations | `server.ts` | 875 | Anyone could create, modify, or delete ads (`POST`/`PUT`/`DELETE /api/products`) and read/modify/delete chat threads without authentication or ownership checks. | Critical | Fixed | Added caller identity extraction, ownership verification (`isBackendAdOwner`), participant verification (`isBackendChatParticipant`), and forced new non-admin ads to `pending`. |
| Unauthenticated State & Lockdown PIN Leakage | `server.ts` | 219 | Public `GET /api/sync/state` leaked `masterUnlockPin`, `adminStaffAccounts`, `securityEvents`, `adminActiveSession`, and user records, while `POST /api/sync/state` allowed unauthenticated writes. | Critical | Fixed | Stripped all sensitive admin/PII keys from public responses via `sanitizeStateForCaller`, scrubbed legacy default PIN `'7860'` on boot and sync, and restricted state writes to verified admins. |
| Fail-Open SMS & Payment Gateway Endpoints | `api/sms.ts` | 790 | Gateway config/admin actions fell back to allowing access (`return true`) whenever `SMS_ADMIN_SECRET` was unset in the environment. | Critical | Fixed | Removed fail-open fallback so admin gateway routes require either a valid HMAC admin Bearer session (`verifyAdminRequest`) or a configured non-empty `x-admin-secret` matched via `timingSafeEqual`. |
| Hardcoded Lockdown Backdoor PIN | `src/components/Maintenance/MasterLockdownScreen.tsx` | 25 | Client bundle contained fallback master unlock PIN `'7860'` and validated unlock attempts locally in browser code. | Critical | Fixed | Removed all hardcoded fallback PINs from client and server defaults and routed unlocking through server-verified `POST /api/admin/unlock-lockdown`. |
| Emergency Recovery OTP Bypass via Network Error | `src/pages/AdminPage.tsx` | 146 | Any failed SMS request (including offline/blocked browser requests) generated a local emergency OTP code on screen. | High | Fixed | Restricted fallback recovery display strictly to explicit `res.code === 'NOT_CONFIGURED'` server responses. |
| Permissive Payment OTP Acceptance | `src/components/Forms/DirectPaymentModal.tsx` | 117 | Direct payment verification accepted arbitrary 6-digit inputs instead of matching the issued OTP. | Medium | Fixed | Enforced strict length and exact equality check (`cleanOtp === generatedOtp`). |
| Plaintext Password Persistence in Storage & Cloud | `src/components/Auth/AuthModal.tsx` | 707 | User registration/sync paths stored raw passwords in `localStorage` and Firestore `users/{uid}` documents. | High | Fixed | Stripped password fields via `sanitizeUserProfileForCloud()` before persisting to `localStorage`, state, or Firestore. |
| Weak Admin Endpoint Authorization | `server.ts` | 544 | Admin staff, audit log, and security event endpoints lacked uniform server-side token validation. | High | Fixed | Protected all `/api/admin/*` routes with `isAuthorizedAdminRequest(req)` checking signed admin Bearer tokens and configured admin secrets. |
| Wildcard CORS Across API Routes | `api/sync/state.ts` | 12 | Serverless APIs returned `Access-Control-Allow-Origin: *`, allowing arbitrary cross-origin requests. | Medium | Fixed | Restricted CORS origin headers to trusted allowlisted origins (`marketbd.net`, `www.marketbd.net`, and local dev port `3000`). |
| Permissive Firestore Collection Rules | `firestore.rules` | 41 | Rules allowed overly broad chat reads/deletes (`buyerId is string`), unconstrained notifications, and unchecked product/user updates. | High | Fixed | Hardened rules to require `isSignedIn()`, owner/participant/admin checks, role-escalation guards, and deployed the updated ruleset live. |

### Safeguards Verified
| Area | File | How It's Protected |
|---|---|---|
| Admin Session Authentication | `api/admin-auth.ts` | Admin sessions use HMAC-SHA256 signed Bearer tokens verified with constant-time `timingSafeEqual` and stored with PBKDF2-SHA512 salted hashes. |
| Gateway & SMS Secret Handling | `api/sms.ts`, `api/payment-gateway.ts` | Provider API keys and payment credentials stay exclusively on the server and are masked (`••••1234`) when read by authenticated admins. |
| Client Auth & Ownership Utility | `src/utils/authOwnership.ts` | Centralizes `isEffectiveLoggedIn`, `isEffectiveAdmin`, `isAdOwner`, `sanitizeUserProfileForCloud`, and `getApiAuthHeaders` across all UI components and context actions. |
| Public Seller Phone Privacy | `api/products.ts`, `server.ts` | Automatically masks seller phone numbers (`017*****000`) for public viewers unless the seller explicitly opted in or the caller is the owner/admin. |
| Firestore Access Control | `firestore.rules` | Default-deny fallback blocks all unmatched paths; user PII, admin logs, chats, payments, and ad moderation updates enforce caller UID and admin claim checks. |

## PoC Verification

### 1. Logged-Out Ad Ownership & Deletion Spoof
#### Summary
| Field | Value |
|---|---|
| Issue Type | Missing Ownership & Authentication Check |
| Impact | High |
| Affected File | `src/components/Product/ProductDetailModal.tsx:70`, `server.ts:1023` |
| Test Scenario | Unauthenticated visitor opens an ad (or sends `DELETE /api/products/prod-test` with header `x-user-id: user-me` or no auth). |

#### How It Was Fixed
Removed `'user-me'` and `'Rahim Tech'` fallback owner matching on both client UI (`isAdOwner`) and Express backend (`extractCallerIdentity` + `isBackendAdOwner`), and gated `DELETE /api/products/:id` behind authenticated ownership or verified admin token.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | Unauthenticated user opens a listing in `ProductDetailModal` | `isAdOwner` checks `isEffectiveLoggedIn(isLoggedIn, currentUser)` and returns `false` |
| 2 | Edit/Delete action buttons are suppressed in the UI (`ProductDetailModal.tsx`) | No delete option rendered |
| 3 | Direct HTTP `DELETE /api/products/prod-test` sent with `x-user-id: user-me` (`server.ts:231-236`) | `'user-me'` is rejected in `invalidIds`, `caller.userId` is `''` |
| 4 | Route guard at `server.ts:1028` checks `!isAdmin && !caller.userId && !caller.email && !caller.phone` | **Handled Safely (`401 Unauthorized`)** |

#### Conclusion
**Fix Verified** - Neither the browser UI nor the backend API allows logged-out users or legacy `'user-me'` identifiers to display or execute ad deletions.

---

### 2. Unauthenticated Ad Moderation Bypass (`?role=admin`) & Unlisted Ad Leak
#### Summary
| Field | Value |
|---|---|
| Issue Type | Broken Access Control via Query Parameter Trust |
| Impact | High |
| Affected File | `api/products.ts:133`, `server.ts:782` |
| Test Scenario | `GET /api/products?role=admin&status=pending` without an `Authorization: Bearer` admin token. |

#### How It Was Fixed
Replaced query-parameter `?role=admin` trust with `verifyAdminRequest(req)` / `isAuthorizedAdminRequest(req)` and filtered `pending` / `rejected` / `under_review` ads unless the caller is a verified admin or the verified ad owner.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | Request hits `GET /api/products?role=admin&status=pending` | Query param `role=admin` is ignored |
| 2 | `isAuthorizedAdminRequest(req)` (`server.ts:782`) / `verifyAdminRequest(req)` (`api/products.ts:133`) validates Bearer token | Evaluates to `false` |
| 3 | Filter at `server.ts:793-809` / `api/products.ts:162-178` strips non-owned pending/rejected listings | **Handled Safely (0 unlisted ads returned)** |

#### Conclusion
**Fix Verified** - Spoofing `?role=admin` no longer exposes pending or rejected advertisements.

---

### 3. Public Sync State Secret & Admin Data Leakage
#### Summary
| Field | Value |
|---|---|
| Issue Type | Sensitive Data Exposure & Unauthenticated Lockdown Bypass |
| Impact | Critical |
| Affected File | `server.ts:219`, `server.ts:625`, `api/sync/state.ts:27` |
| Test Scenario | Unauthenticated `GET /api/sync/state?lite=1` and `POST /api/admin/unlock-lockdown` with legacy PIN `{"pin":"7860"}`. |

#### How It Was Fixed
Scrubbed legacy `'7860'` PINs from hydrated disk state (`server.ts:219-237`) and state updates (`server.ts:691-693`), stripped `masterUnlockPin`, `adminStaffAccounts`, `securityEvents`, `adminActiveSession`, `admin_logs`, `registered_users`, and `chatThreads` via `sanitizeStateForCaller`, and enforced PIN/admin verification on `/api/admin/unlock-lockdown`.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | Server hydrates `server_sync_state.json` and detects legacy `'7860'` (`server.ts:221-237`) | Resets `masterUnlockPin` to `process.env.MASTER_UNLOCK_PIN` and persists clean JSON |
| 2 | Unauthenticated `GET /api/sync/state?lite=1` runs `sanitizeStateForCaller(sharedSyncState, false)` | `masterUnlockPin`, staff accounts, security events, and user records omitted |
| 3 | `POST /api/admin/unlock-lockdown` with `{"pin":"7860"}` checks `configuredPins` (`server.ts:628-645`) | **Handled Safely (`401 Invalid Master Unlock PIN`)** |

#### Conclusion
**Fix Verified** - Sensitive admin metadata, user records, and the legacy `'7860'` bypass PIN are completely removed from unauthenticated responses and unlock checks.

---

### 4. Fail-Open SMS & Payment Gateway Admin Endpoints
#### Summary
| Field | Value |
|---|---|
| Issue Type | Fail-Open Authorization Check |
| Impact | Critical |
| Affected File | `api/sms.ts:790`, `api/payment-gateway.ts:60` |
| Test Scenario | Unauthenticated `POST /api/sms` with `{"action":"save_config", ...}` or `POST /api/payment-gateway` when `SMS_ADMIN_SECRET` is unset. |

#### How It Was Fixed
Changed missing-secret behavior from fail-open (`return true`) to fail-closed (`return false`), requiring either a verified HMAC admin Bearer token (`verifyAdminRequest(req)`) or a configured non-empty `x-admin-secret` verified with `timingSafeEqual`.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | Unauthenticated `POST /api/sms` (`action: "save_config"`) enters handler | Calls `isAuthorizedAdminRequest(req)` |
| 2 | `verifyAdminRequest(req)` returns `false`; `configured` secret is empty or non-matching | Returns `false` instead of failing open |
| 3 | Handler rejects request prior to reading/writing `.gateway_secrets.json` | **Handled Safely (`401 Unauthorized`)** |

#### Conclusion
**Fix Verified** - Gateway configuration and balance/test-send operations reject unauthenticated requests even when `SMS_ADMIN_SECRET` is unconfigured.

---

### 5. Logged-Out Engagement & Payment OTP Verification
#### Summary
| Field | Value |
|---|---|
| Issue Type | Missing Session Guard & Broken OTP Comparison |
| Impact | Medium |
| Affected File | `src/context/MarketContext.tsx:815`, `src/components/Forms/DirectPaymentModal.tsx:117` |
| Test Scenario | Logged-out user clicks Like/Wishlist/Reaction/Follow on an ad, or submits a random 6-digit string (`"000000"`) in `DirectPaymentModal`. |

#### How It Was Fixed
Added `isEffectiveLoggedIn` guards inside `ProductDetailModal`, `DashboardPage`, and `MarketContext` mutation methods (`toggleWishlist`, `toggleReaction`, `toggleFollowSeller`, etc.), and updated `DirectPaymentModal` to require `cleanOtp === generatedOtp`.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | Logged-out visitor clicks Save/Wishlist or Reaction button | `ProductDetailModal` & `MarketContext.toggleWishlist` check `isEffectiveLoggedIn` -> opens Auth modal |
| 2 | Visitor enters `"000000"` in `DirectPaymentModal` when `generatedOtp` is `"482913"` | `cleanOtp !== generatedOtp` evaluates `true` at line 117 |
| 3 | Payment confirmation aborts with validation error | **Handled Safely (Blocked)** |

#### Conclusion
**Fix Verified** - Unauthenticated users cannot mutate likes, saves, or follows, and invalid 6-digit OTPs cannot confirm direct payments.
