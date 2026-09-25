import { describe, it, expect, vi, beforeEach } from 'vitest';
const api = vi.hoisted(()=>({get:vi.fn(),post:vi.fn(),delete:vi.fn()}));
vi.mock('@/shared/api/axios',()=>({apiClient:api}));
import {fetchRoomDetail,fetchParticipants,joinRoom,validateRoomId} from '../src/features/room/api';
import {createRoom,fetchRooms} from '../src/features/dashboard/api';
describe('actual room REST contract',()=>{
 beforeEach(()=>vi.resetAllMocks());
 it.each(['0','-1','1/../../auth','abc','9007199254740993'])('rejects invalid room id %s',id=>expect(()=>validateRoomId(id)).toThrow());
 it('maps server room and canonical member route',async()=>{
  api.get.mockResolvedValueOnce({data:{id:7,title:'실제 방',visibility:'PUBLIC'}}).mockResolvedValueOnce({data:[{userId:3,username:'발표자',roleInRoom:'PRESENTER',mute:true,handRaised:false}]});
  expect(await fetchRoomDetail('7')).toEqual({id:'7',title:'실제 방',visibility:'PUBLIC'});
  expect((await fetchParticipants('7'))[0]).toEqual({id:'3',name:'발표자',role:'PRESENTER',mute:true,handRaised:false});
  expect(api.get.mock.calls.map(c=>c[0])).toEqual(['/room/7','/room/7/members']);
 });
 it('creates with server supported fields and explicitly joins',async()=>{
  api.post.mockResolvedValue({data:{id:9,title:'검증',visibility:'PUBLIC'}});
  await createRoom({title:' 검증 '}); await joinRoom('9');
  expect(api.post).toHaveBeenNthCalledWith(1,'/room/create',{title:'검증',visibility:'PUBLIC',invitePolicy:'LINK',workspaceId:null});
  expect(api.post).toHaveBeenNthCalledWith(2,'/room/9/join/me');
 });
 it('propagates server denial without sample data',async()=>{api.get.mockRejectedValue(new Error('Forbidden'));await expect(fetchRooms()).rejects.toThrow('Forbidden');});
});
