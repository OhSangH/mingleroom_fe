import type { Room } from '@/entities/room/types';

export type Participant = {
  id: string;
  name: string;
  role: 'HOST' | 'MEMBER';
};

export async function fetchRoomDetail(_roomId: string): Promise<Room> {
  // TODO(7): Implement react-query queryFn for room detail.
  // - Why: room header requires the latest title and metadata.
  // - Steps: call API, map response, handle not-found errors.
  // - Done when: room detail renders from server data.
  throw new Error('TODO');
}

export async function fetchParticipants(_roomId: string): Promise<Participant[]> {
  // TODO(7): Implement react-query queryFn for participants.
  // - Why: sidebar needs member list and role info.
  // - Steps: call API, map response, handle empty rooms.
  // - Done when: participant list updates in real time.
  throw new Error('TODO');
}
