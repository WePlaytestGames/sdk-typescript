import type { HttpClient } from '../http.js';
import type {
  SlotDetail,
  AcceptParams,
  RejectParams,
  DownloadUrlResponse,
  TranscriptResponse,
} from '../types.js';

export class SlotsResource {
  constructor(private http: HttpClient) {}

  /** Get slot details */
  async get(slotId: string): Promise<SlotDetail> {
    const data = await this.http.get<{ slot: SlotDetail }>(`/playtests/slots/${slotId}`);
    return data.slot;
  }

  /** Accept a submission */
  async accept(slotId: string, params?: AcceptParams): Promise<{ message: string }> {
    return this.http.post<{ message: string }>(`/playtests/slots/${slotId}/accept`, params);
  }

  /** Reject a submission */
  async reject(slotId: string, params?: RejectParams): Promise<{ message: string }> {
    return this.http.post<{ message: string }>(`/playtests/slots/${slotId}/reject`, params);
  }

  /** Get a pre-signed download URL for the submission video */
  async downloadUrl(slotId: string): Promise<DownloadUrlResponse> {
    return this.http.get<DownloadUrlResponse>(`/playtests/slots/${slotId}/download-url`);
  }

  /** Get the submission transcript */
  async transcript(slotId: string): Promise<TranscriptResponse> {
    return this.http.get<TranscriptResponse>(`/playtests/slots/${slotId}/transcript`);
  }
}
