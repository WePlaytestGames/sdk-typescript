// ========== Common ==========

export interface PaginationParams {
  limit?: number;
  cursor?: string;
}

export interface Meta {
  requestId: string;
  timestamp: string;
  cursor?: string | null;
  hasMore?: boolean;
  totalCount?: number;
}

// ========== Auth ==========

export interface RegisterParams {
  email: string;
  password: string;
  role: 'game_owner';
  companyName?: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface RegisterWithApiKeyParams extends RegisterParams {
  keyName?: string;
  scopes?: ('game_owner' | 'billing' | 'chat' | 'notifications' | 'webhooks')[];
}

export interface RegisterWithApiKeyResponse {
  apiKey: string;
  user: {
    id: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
  message: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  profile: GameOwnerProfile | null;
}

export interface GameOwnerProfile {
  id: string;
  userId: string;
  companyName: string;
  displayName: string;
  websiteUrl: string | null;
  createdAt: string;
}

export interface UpdateProfileParams {
  displayName?: string;
  companyName?: string;
  websiteUrl?: string | null;
}

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Device {
  id: string;
  name: string;
}

export interface Platform {
  id: string;
  name: string;
}

// ========== Games ==========

export interface Game {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
  buildUrl: string | null;
  coverImageUrl: string | null;
  externalUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  categories: Category[];
  devices: string[];
  platforms: string[];
}

export interface GameCreateParams {
  name: string;
  buildUrl: string;
  description?: string;
  instructions?: string;
  coverImageUrl?: string;
  externalUrl?: string;
  devices?: string[];
  platforms?: string[];
  tags?: string[];
}

export interface GameUpdateParams {
  name?: string;
  buildUrl?: string;
  description?: string;
  instructions?: string;
  coverImageUrl?: string | null;
  externalUrl?: string | null;
  devices?: string[];
  platforms?: string[];
  tags?: string[];
}

export interface Build {
  id: string;
  gameId: string;
  createdAt: string;
}

// ========== Playtests ==========

export interface SlotStats {
  open: number;
  reserved: number;
  submitted: number;
  accepted: number;
  rejected: number;
  expired: number;
}

export interface PlaytestRequest {
  id: string;
  gameId: string;
  visibility: string;
  quantity: number;
  durationMinutes: number;
  playerCount: number;
  costPerSlotCents: number | null;
  payoutCents: number | null;
  notesForTesters: string | null;
  status: string;
  isFreePublicTrial: boolean;
  targetingType: string | null;
  createdAt: string;
  slots: SlotStats;
}

export interface PlaytestDetail extends PlaytestRequest {
  gameName: string;
}

export interface PlaytestCreateParams {
  visibility?: 'public' | 'private';
  quantity?: number;
  durationMinutes?: 30 | 60 | 120 | 180;
  playerCount?: number;
  notesForTesters?: string;
  keysForTesters?: string[];
  isFreePublicTrial?: boolean;
  targetingType?: 'new' | 'past';
  pastPlaytesterScope?: 'any' | 'specific';
  targetedPlaytesterId?: string;
  selectionMode?: 'automatic' | 'manual';
  qualifications?: string;
}

export interface PlaytestApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'auto_rejected';
  qualificationsResponse: string | null;
  createdAt: string;
  reviewedAt: string | null;
  assignedSlotId: string | null;
  playtesterId: string;
  displayName: string;
  gamingExperience: string | null;
  validatedAt: string | null;
  ratingAverage: string | null;
  acceptedCount: string;
}

export interface PlaytestApplicationsResponse {
  request: {
    id: string;
    gameId: string;
    gameName: string;
    quantity: number;
    qualifications: string | null;
    selectionMode: 'automatic' | 'manual';
    applicationsExpireAt: string | null;
    scheduledAt: string | null;
  };
  counts: { approvedCount: number; pendingCount: number; slotsRemaining: number };
  applications: PlaytestApplication[];
}

export interface PlaytestCreateResponse {
  playtest: PlaytestRequest;
  requiresPayment?: boolean;
  costPerSlotCents?: number;
  totalCents?: number;
  slots?: PlaytestSlot[];
  needsAdminApproval?: boolean;
}

export interface PlaytestUpdateParams {
  notesForTesters?: string;
}

// ========== Slots ==========

export interface PlaytestSlot {
  id: string;
  requestId: string;
  status: string;
  deadlineAt: string | null;
  createdAt: string;
  playtester: { id: string; displayName: string } | null;
  submission: SubmissionSummary | null;
  rating: { score: number; comment: string | null } | null;
  rejection: { reason: string | null; createdAt: string } | null;
  transcription: TranscriptionSummary | null;
}

export interface SubmissionSummary {
  id: string;
  videoFileSize: number | null;
  notes: string | null;
  createdAt: string;
}

export interface TranscriptionSummary {
  id: string;
  status: string;
  selectedVersion: string | null;
}

export interface SlotDetail {
  id: string;
  requestId: string;
  status: string;
  deadlineAt: string | null;
  createdAt: string;
  game: { id: string; name: string };
  playtest: { id: string; visibility: string; durationMinutes: number };
  playtester: { id: string; displayName: string } | null;
  submission: SubmissionSummary | null;
  rating: { score: number; comment: string | null } | null;
  rejection: { reason: string | null; createdAt: string } | null;
  transcription: (TranscriptionSummary & { keyTakeaways: string[] | null }) | null;
}

export interface AcceptParams {
  rating?: number;
}

export interface RejectParams {
  reason?: string;
  allowRetry?: boolean;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
  expiresAt: string;
}

export interface TranscriptResponse {
  downloadUrl: string;
  filename: string;
  version: string;
  keyTakeaways: string[];
}

// ========== Submissions ==========

export interface Submission {
  slot: {
    id: string;
    requestId: string;
    status: string;
    reservedBy: string | null;
    deadlineAt: string | null;
    createdAt: string;
  };
  submission: {
    id: string;
    videoStorageKey: string;
    videoFileSize: number | null;
    notes: string | null;
    createdAt: string;
  } | null;
  game: { id: string; name: string };
  playtest: {
    id: string;
    visibility: string;
    durationMinutes: number;
    isFreePublicTrial: boolean;
  };
  playtester: { id: string; displayName: string } | null;
  awaitingAdminApproval: boolean;
  blockedReport: {
    reasonCode: string;
    notes: string | null;
    reportedAt: string;
  } | null;
  transcription: TranscriptionSummary | null;
}

export interface SubmissionsListParams extends PaginationParams {
  status?: string;
}

// ========== Billing ==========

export interface Balance {
  balanceCents: number;
  currency: string;
}

export interface Payment {
  id: string;
  amountCents: number;
  status: string;
  provider: string | null;
  externalId: string | null;
  createdAt: string;
}

export interface PurchaseCreditParams {
  amountCents: number;
  returnUrl?: string;
}

export interface PurchaseCreditResponse {
  checkoutUrl: string;
  paymentId: string;
  amountCents: number;
}

// ========== Chat ==========

export interface ChatContact {
  id: string;
  displayName: string;
  companyName?: string;
  chatMode?: string;
  isUnlocked: boolean;
  unreadCount: number;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  conversationId: string | null;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  senderType: string;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface SendMessageParams {
  content: string;
}

// ========== Notifications ==========

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsListParams extends PaginationParams {
  unread?: boolean;
}

// ========== Webhooks ==========

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  failureCount: number;
  lastFailureAt?: string | null;
  createdAt: string;
}

export interface WebhookCreateParams {
  url: string;
  events: string[];
}

export interface WebhookCreateResponse {
  webhook: Webhook;
  secret: string;
}

export interface WebhookUpdateParams {
  url?: string;
  events?: string[];
}

export interface WebhookDelivery {
  id: string;
  event: string;
  statusCode: number | null;
  attemptCount: number;
  deliveredAt: string | null;
  nextRetryAt: string | null;
  createdAt: string;
}

export interface WebhookTestResponse {
  success: boolean;
  delivery: {
    id: string;
    statusCode: number | null;
    deliveredAt: string | null;
  };
}

// ========== Dashboard ==========

export interface DashboardStats {
  totalGames: number;
  activePlaytests: number;
  pendingReviews: number;
}
