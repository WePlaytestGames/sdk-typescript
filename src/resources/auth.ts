import type { HttpClient } from '../http.js';
import type {
  User,
  RegisterParams,
  RegisterResponse,
  RegisterWithApiKeyParams,
  RegisterWithApiKeyResponse,
  UpdateProfileParams,
  ChangePasswordParams,
} from '../types.js';

export class AuthResource {
  constructor(private http: HttpClient) {}

  /** Register a new game owner account */
  async register(params: RegisterParams): Promise<RegisterResponse> {
    return this.http.post<RegisterResponse>('/auth/register', params);
  }

  /** Register a new game owner account and receive an API key */
  async registerWithApiKey(params: RegisterWithApiKeyParams): Promise<RegisterWithApiKeyResponse> {
    return this.http.post<RegisterWithApiKeyResponse>('/auth/register/api-key', params);
  }

  /** Get current user profile */
  async me(): Promise<User> {
    return this.http.get<User>('/auth/me');
  }

  /** Update profile */
  async updateProfile(params: UpdateProfileParams): Promise<{ message: string }> {
    return this.http.patch<{ message: string }>('/auth/profile', params);
  }

  /** Change password */
  async changePassword(params: ChangePasswordParams): Promise<{ message: string }> {
    return this.http.post<{ message: string }>('/auth/change-password', params);
  }
}
