import { apiClient } from '@/shared/api/axios';
import { endpoints } from '@/shared/api/endpoints';
import type { Room } from '@/features/room/types';
export type RoomRole = 'HOST' | 'PRESENTER' | 'MEMBER';
export type Participant = { id: string; name: string; role: RoomRole; mute: boolean; handRaised: boolean };
export type RoomDto = { id: number; title: string; visibility: 'PUBLIC' | 'PRIVATE' | 'TEAM' };
type MemberDto = { userId: number; username: string; roleInRoom: RoomRole; mute: boolean; handRaised: boolean };
export function validateRoomId(id: string) {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) throw new Error('올바른 회의실 번호를 입력하세요.');
  return id;
}
export const mapRoom = (dto: RoomDto): Room => ({ id: String(dto.id), title: dto.title, visibility: dto.visibility });
export async function fetchRoomDetail(id: string): Promise<Room> {
  return mapRoom((await apiClient.get<RoomDto>(endpoints.rooms.detail(validateRoomId(id)))).data);
}
export async function fetchParticipants(id: string): Promise<Participant[]> {
  const { data } = await apiClient.get<MemberDto[]>(endpoints.rooms.members(validateRoomId(id)));
  return data.map(m => ({ id: String(m.userId), name: m.username, role: m.roleInRoom, mute: m.mute, handRaised: m.handRaised }));
}
export async function joinRoom(id: string) { await apiClient.post(endpoints.rooms.join(validateRoomId(id))); }
export async function leaveMembership(id: string) { await apiClient.delete(endpoints.rooms.leave(validateRoomId(id))); }
