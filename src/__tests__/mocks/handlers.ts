import { http, HttpResponse } from 'msw';

import type { Mission, User } from '@/types';

// Mock data
const mockMissions: Mission[] = [
  {
    id: '1',
    name: 'Test Mission 1',
    description: 'A test mission',
    status: 'active',
    priority: 'high',
    start_date: new Date().toISOString(),
    end_date: null,
    progress: 50,
    tags: ['test', 'demo'],
    assigned_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Test Mission 2',
    description: 'Another test mission',
    status: 'pending',
    priority: 'medium',
    start_date: new Date().toISOString(),
    end_date: null,
    progress: 0,
    tags: ['test'],
    assigned_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

// API handlers
export const handlers = [
  // Supabase auth endpoints
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      user: mockUser,
    });
  }),

  // Missions API
  http.get('*/rest/v1/missions', () => {
    return HttpResponse.json(mockMissions);
  }),

  http.get('*/rest/v1/missions/:id', ({ params }) => {
    const mission = mockMissions.find(m => m.id === params.id);
    if (!mission) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(mission);
  }),

  http.post('*/rest/v1/missions', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newMission = {
      id: '3',
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as Mission;
    return HttpResponse.json(newMission, { status: 201 });
  }),

  http.patch('*/rest/v1/missions/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const mission = mockMissions.find(m => m.id === params.id);
    if (!mission) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({ ...mission, ...body });
  }),

  http.delete('*/rest/v1/missions/:id', ({ params }) => {
    const mission = mockMissions.find(m => m.id === params.id);
    if (!mission) {
      return new HttpResponse(null, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Brave Search API (mock)
  http.get('https://api.search.brave.com/res/v1/web/search', () => {
    return HttpResponse.json({
      query: { original: 'test', spellcheck_off: false },
      web: {
        results: [
          {
            title: 'Test Result',
            url: 'https://example.com',
            description: 'A test search result',
          },
        ],
      },
    });
  }),
];
