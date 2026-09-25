export type Room = {
  id: string;
  title: string;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'TEAM';
  description?: string;
  inviteCode?: string;
  memberCount?: number;
};
