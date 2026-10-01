import type { Request, Response } from 'express';
import { store, addEvent } from '../store.js';
import type { SearchResult } from '../types.js';

export function searchWebContent(req: Request, res: Response) {
  const { query, source = 'google', limit = 10 } = req.body as {
    query?: string;
    source?: string;
    limit?: number;
  };

  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  if (query.length > 500) {
    return res.status(400).json({
      error: 'Query too long',
      reason: 'Search query exceeds maximum length of 500 characters',
      suggestion: 'Try a shorter, more specific query'
    });
  }

  // Simulate web search results
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: `Results for "${query}"`,
      url: `https://google.com/search?q=${encodeURIComponent(query)}`,
      snippet: `This is a mock search result for your query: ${query}`,
      source,
      relevance: 0.95
    },
    {
      id: '2',
      title: `Learn more about ${query}`,
      url: `https://wikipedia.org/wiki/${encodeURIComponent(query)}`,
      snippet: 'Wikipedia page with comprehensive information',
      source: 'wikipedia',
      relevance: 0.85
    },
    {
      id: '3',
      title: `${query} Tutorial`,
      url: `https://youtube.com/results?search_query=${encodeURIComponent(query)}`,
      snippet: 'Video tutorials and guides related to your search',
      source: 'youtube',
      relevance: 0.80
    }
  ];

  addEvent('search', query, 'web-search-executed', `Web search performed for: ${query}`);

  return res.json({
    query,
    source,
    resultsCount: mockResults.length,
    results: mockResults.slice(0, limit)
  });
}

export function indexLibraryContent(req: Request, res: Response) {
  const { title, type = 'book', content, author, tags = [] } = req.body as {
    title?: string;
    type?: string;
    content?: string;
    author?: string;
    tags?: string[];
  };

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  if (content.length > 1000000) {
    return res.status(400).json({
      error: 'Content too large',
      reason: 'Library content exceeds maximum size of 1MB',
      suggestion: 'Break content into smaller documents or compress'
    });
  }

  const libraryItem = {
    id: crypto.randomUUID(),
    title,
    type,
    author,
    contentLength: content.length,
    indexed: true,
    tags: [...tags, 'learning', 'library'],
    searchable: true,
    createdAt: new Date().toISOString()
  };

  store.libraryItems.push(libraryItem);
  addEvent('library', libraryItem.id, 'content-indexed', `Library content indexed: ${title}`);

  return res.status(201).json({ libraryItem });
}

export function getLibraryItems(req: Request, res: Response) {
  const { type, tags } = req.query as { type?: string; tags?: string };
  let items = store.libraryItems;

  if (type) {
    items = items.filter((item) => item.type === type);
  }

  if (tags) {
    const tagList = tags.split(',');
    items = items.filter((item) => tagList.some((tag) => item.tags.includes(tag)));
  }

  return res.json({ libraryItems: items });
}

export function searchLibrary(req: Request, res: Response) {
  const { query } = req.body as { query?: string };

  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  const results = store.libraryItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase())) ||
      (item.author && item.author.toLowerCase().includes(query.toLowerCase()))
  );

  addEvent('library', 'search', 'library-searched', `Library search performed for: ${query}`);

  return res.json({ query, results });
}
