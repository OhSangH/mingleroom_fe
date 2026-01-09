import type { Room } from '@/entities/room/types';

export type Workspace = {
  id: string;
  name: string;
  description?: string;
};

export const workspaceKeys = {
  all: ['workspaces'] as const,
  list: () => [...workspaceKeys.all, 'list'] as const,
};

export const roomKeys = {
  all: ['rooms'] as const,
  list: (workspaceId?: string) => [...roomKeys.all, 'list', workspaceId] as const,
};

export async function fetchWorkspaces(): Promise<Workspace[]> {
  // TODO(7): Implement react-query queryFn for workspaces.
  // - Why: dashboard needs data to render workspace filters.
  // - Steps: call API, map response, handle errors with retries.
  // - Done when: workspace list renders with real data.
  throw new Error('TODO');
}

export async function fetchRooms(_workspaceId?: string): Promise<Room[]> {
  // TODO(7): Implement react-query queryFn for rooms.
  // - Why: dashboard cards depend on room list data.
  // - Steps: call API, map response, add pagination if needed.
  // - Done when: room cards render from server payload.
  throw new Error('TODO');
}

export async function createRoom(_payload: { title: string; description?: string }): Promise<Room> {
  // TODO(7): Implement react-query mutationFn for room creation.
  // - Why: dialog submission must create a room on the server.
  // - Steps: call API, return created room, invalidate room list.
  // - Done when: new room appears without full refresh.
  throw new Error('TODO');
}
