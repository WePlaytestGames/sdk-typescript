import { createHmac, timingSafeEqual } from 'node:crypto';

export interface VerifyWebhookSignatureParams {
  /** The raw request body string */
  payload: string;
  /** Value of the X-WPG-Signature header */
  signature: string;
  /** Value of the X-WPG-Timestamp header (unix seconds) */
  timestamp: string;
  /** Your webhook secret */
  secret: string;
  /** Max age in seconds before rejecting as replay (default 300, 0 to disable) */
  toleranceSeconds?: number;
}

/**
 * Verify a webhook signature from We Playtest Games.
 *
 * The backend signs as `HMAC-SHA256(secret, "{timestamp}.{payload}")` and sends
 * the signature in the `X-WPG-Signature` header and the unix timestamp in
 * `X-WPG-Timestamp`.
 *
 * @returns true if the signature is valid and within the tolerance window
 */
export function verifyWebhookSignature({
  payload,
  signature,
  timestamp,
  secret,
  toleranceSeconds = 300,
}: VerifyWebhookSignatureParams): boolean {
  // Replay protection
  if (toleranceSeconds > 0) {
    const ts = Number(timestamp);
    if (Number.isNaN(ts)) return false;
    const diff = Math.abs(Math.floor(Date.now() / 1000) - ts);
    if (diff > toleranceSeconds) return false;
  }

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  // Constant-time comparison
  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length) return false;
  return timingSafeEqual(sigBuf, expBuf);
}
