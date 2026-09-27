export function validateRoomId(id: string) {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) throw new Error('올바른 회의실 번호를 입력하세요.');
  return id;
}
