import type { Room } from '@/features/room/types';
import { apiClient } from '@/shared/api/axios';
import { endpoints } from '@/shared/api/endpoints';
import { mapRoom, type RoomDto } from '@/features/room/api';
export type Workspace = { id: string; name: string; description?: string };
export const workspaceKeys = { all: ['workspaces'] as const, list: () => ['workspaces', 'list'] as const };
export const roomKeys = { all: ['rooms'] as const, list: () => ['rooms', 'list'] as const };
export async function fetchWorkspaces(): Promise<Workspace[]> {
  const { data } = await apiClient.get<{ id: number; name: string }[]>(endpoints.workspaces);
  return data.map(w => ({ id: String(w.id), name: w.name }));
}
export async function fetchRooms(): Promise<Room[]> {
  const { data } = await apiClient.get<RoomDto[]>(endpoints.rooms.list);
  return data.map(mapRoom);
}
export async function createRoom(payload: { title: string }): Promise<Room> {
  const { data } = await apiClient.post<RoomDto>(endpoints.rooms.create, {
    title: payload.title.trim(), visibility: 'PUBLIC', invitePolicy: 'LINK', workspaceId: null,
  });
  return mapRoom(data);
}
