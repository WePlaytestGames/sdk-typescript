export { WPGClient } from './client.js';
export type { WPGClientConfig } from './client.js';
export { WPGError } from './error.js';
export type { ErrorDetail } from './error.js';
export type { Page, Paginated } from './pagination.js';
export { verifyWebhookSignature } from './webhooks.js';
export type { VerifyWebhookSignatureParams } from './webhooks.js';
export type {
  // Common
  PaginationParams,
  Meta,
  // Auth
  RegisterParams,
  RegisterResponse,
  RegisterWithApiKeyParams,
  RegisterWithApiKeyResponse,
  User,
  GameOwnerProfile,
  UpdateProfileParams,
  ChangePasswordParams,
  Category,
  Device,
  Platform,
  // Games
  Game,
  GameCreateParams,
  GameUpdateParams,
  Build,
  // Playtests
  SlotStats,
  PlaytestRequest,
  PlaytestDetail,
  PlaytestCreateParams,
  PlaytestCreateResponse,
  PlaytestUpdateParams,
  // Slots
  PlaytestSlot,
  SubmissionSummary,
  TranscriptionSummary,
  SlotDetail,
  AcceptParams,
  RejectParams,
  DownloadUrlResponse,
  TranscriptResponse,
  // Submissions
  Submission,
  SubmissionsListParams,
  // Billing
  Balance,
  Payment,
  PurchaseCreditParams,
  PurchaseCreditResponse,
  // Chat
  ChatContact,
  ChatMessage,
  SendMessageParams,
  // Notifications
  Notification,
  NotificationsListParams,
  // Webhooks
  Webhook,
  WebhookCreateParams,
  WebhookCreateResponse,
  WebhookUpdateParams,
  WebhookDelivery,
  WebhookTestResponse,
  // Dashboard
  DashboardStats,
} from './types.js';
