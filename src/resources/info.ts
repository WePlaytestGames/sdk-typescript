import type { HttpClient } from '../http.js';
import type { Category, Device, Platform } from '../types.js';

export class InfoResource {
  constructor(private http: HttpClient) {}

  /** List all game categories/tags */
  async categories(): Promise<Category[]> {
    const data = await this.http.get<{ categories: Category[] }>('/info/categories');
    return data.categories;
  }

  /** List all device types */
  async devices(): Promise<Device[]> {
    const data = await this.http.get<{ devices: Device[] }>('/info/devices');
    return data.devices;
  }

  /** List all platforms */
  async platforms(): Promise<Platform[]> {
    const data = await this.http.get<{ platforms: Platform[] }>('/info/platforms');
    return data.platforms;
  }
}
