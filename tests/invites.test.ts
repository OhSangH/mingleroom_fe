import { describe,it,expect,vi,beforeEach } from 'vitest';
import { parseRoomEntry,readInviteToken,lobbyPath,authReturnPath } from '../src/features/room/invites/entry';
const api=vi.hoisted(()=>({post:vi.fn()}));
vi.mock('@/shared/api/axios',()=>({apiClient:api}));
import { redeemRoomInvite } from '../src/features/room/api';
describe('restricted invitation entry',()=>{
 beforeEach(()=>vi.resetAllMocks());
 it('preserves a URL-safe invite token from a full link',()=>{
  const entry=parseRoomEntry(' https://meeting.example/lobby/7?invite=Abc_def-123 ');
  expect(entry).toEqual({roomId:'7',token:'Abc_def-123'});
  expect(lobbyPath(entry)).toBe('/lobby/7?invite=Abc_def-123');
 });
 it('also accepts a relative lobby URL or plain room number',()=>{
  expect(parseRoomEntry('/lobby/9?invite=hello')).toEqual({roomId:'9',token:'hello'});
  expect(parseRoomEntry(' 9 ')).toEqual({roomId:'9'});
 });
 it.each(['?invite=','?invite=foo&invite=bar','?invite=%20','?invite=a%2Bb'])('never falls back to public join for malformed token %s',query=>expect(()=>readInviteToken(query)).toThrow());
 it('sends the raw token only to the restricted redemption endpoint',async()=>{
  api.post.mockResolvedValue({});await redeemRoomInvite('7','Abc_def-123');
  expect(api.post).toHaveBeenCalledExactlyOnceWith('/room/7/controls/redeem',{token:'Abc_def-123'});
 });
 it.each(['javascript:alert(1)','https://host/room/7?invite=x','/lobby/0?invite=x','/lobby/9007199254740993?invite=x'])('rejects malformed entry %s',value=>expect(()=>parseRoomEntry(value)).toThrow());
 it('preserves the invitation across auth redirects without allowing external redirects',()=>{
  expect(authReturnPath('/lobby/7?invite=abc')).toBe('/lobby/7?invite=abc');
  for(const value of ['https://evil/lobby/7','//evil/lobby/7','/login','/lobby/0',null])expect(authReturnPath(value)).toBeUndefined();
 });
});
