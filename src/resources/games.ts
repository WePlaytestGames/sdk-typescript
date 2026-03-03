import type { HttpClient } from '../http.js';
import type { Game, GameCreateParams, GameUpdateParams, Build, PaginationParams } from '../types.js';
import { makePaginated, type Paginated } from '../pagination.js';

export class GamesResource {
  constructor(private http: HttpClient) {}

  /** List your games (paginated) */
  list(params?: PaginationParams): Paginated<Game> {
    return makePaginated(
      async (p) => {
        const res = await this.http.getPage<{ games: Game[] }>('/games', {
          limit: p.limit,
          cursor: p.cursor,
        });
        return { data: res.data.games, meta: res.meta };
      },
      params ?? {},
    );
  }

  /** Create a new game */
  async create(params: GameCreateParams): Promise<Game> {
    const data = await this.http.post<{ game: Game }>('/games', params);
    return data.game;
  }

  /** Get a game by ID */
  async get(gameId: string): Promise<Game> {
    const data = await this.http.get<{ game: Game }>(`/games/${gameId}`);
    return data.game;
  }

  /** Update a game */
  async update(gameId: string, params: GameUpdateParams): Promise<Game> {
    const data = await this.http.patch<{ game: Game }>(`/games/${gameId}`, params);
    return data.game;
  }

  /** List builds for a game (paginated) */
  builds(gameId: string, params?: PaginationParams): Paginated<Build> {
    return makePaginated(
      async (p) => {
        const res = await this.http.getPage<{ builds: Build[] }>(`/games/${gameId}/builds`, {
          limit: p.limit,
          cursor: p.cursor,
        });
        return { data: res.data.builds, meta: res.meta };
      },
      params ?? {},
    );
  }
}
