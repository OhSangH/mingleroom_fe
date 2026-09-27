import { validateRoomId } from '../id';

export type RoomEntry = { roomId: string; token?: string };
// Decode once. A present but empty/duplicated token must never become a normal join.
export function readInviteToken(search: string): string | undefined {
  const params = new URLSearchParams(search);
  if (!params.has('invite')) return undefined;
  const values = params.getAll('invite');
  if (values.length !== 1 || !/^[A-Za-z0-9_-]{1,128}$/.test(values[0])) {
    throw new Error('초대 링크가 올바르지 않습니다. 호스트에게 받은 전체 링크를 다시 확인하세요.');
  }
  return values[0];
}
export function parseRoomEntry(value: string): RoomEntry {
  const text = value.trim();
  if (/^[1-9]\d*$/.test(text)) return { roomId: validateRoomId(text) };
  let url: URL;
  try { url = new URL(text, 'https://mingleroom.invalid'); }
  catch { throw new Error('회의실 번호 또는 전체 초대 링크를 입력하세요.'); }
  const match = /^\/lobby\/([1-9]\d*)\/?$/.exec(url.pathname);
  if (!['http:', 'https:'].includes(url.protocol) || !match || url.username || url.password) {
    throw new Error('회의실 번호 또는 /lobby/로 시작하는 초대 링크를 입력하세요.');
  }
  return { roomId: validateRoomId(match[1]), token: readInviteToken(url.search) };
}
export function lobbyPath(entry: RoomEntry): string {
  return `/lobby/${validateRoomId(entry.roomId)}${entry.token === undefined ? '' : `?invite=${encodeURIComponent(entry.token)}`}`;
}
export function invitationUrl(roomId: string, token: string): string {
  readInviteToken(`?invite=${encodeURIComponent(token)}`);
  return `${window.location.origin}${lobbyPath({ roomId, token })}`;
}
// Only internal meeting routes are allowed as authentication return destinations.
export function authReturnPath(value: unknown): string | undefined {
  if (typeof value !== 'string' || !/^\/(?:lobby|room)\/[1-9]\d*(?:\?[^#]*)?$/.test(value)) return undefined;
  return value;
}
