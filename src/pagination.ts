import type { Meta, PaginationParams } from './types.js';

export interface Page<T> {
  data: T[];
  meta: Meta;
}

export interface Paginated<T> extends AsyncIterable<T> {
  /** Fetch a single page of results */
  getPage(): Promise<Page<T>>;
}

export function makePaginated<T>(
  fetchPage: (params: PaginationParams) => Promise<Page<T>>,
  initialParams: PaginationParams,
): Paginated<T> {
  return {
    getPage() {
      return fetchPage(initialParams);
    },
    async *[Symbol.asyncIterator]() {
      let cursor = initialParams.cursor;
      let isFirstPage = true;
      do {
        const params: PaginationParams = { ...initialParams };
        if (!isFirstPage || cursor) {
          params.cursor = cursor;
        }
        const page = await fetchPage(params);
        yield* page.data;
        cursor = page.meta.hasMore && page.meta.cursor ? page.meta.cursor : undefined;
        isFirstPage = false;
      } while (cursor);
    },
  };
}
