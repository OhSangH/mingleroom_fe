import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import type { Workspace } from '@/features/dashboard/api';

type WorkspaceSelectProps = {
  workspaces: Workspace[];
  value?: string;
  onChange: (workspaceId?: string) => void;
};

export default function WorkspaceSelect({ workspaces, value, onChange }: WorkspaceSelectProps) {
  return (
    <TextField
      select
      label="워크스페이스"
      value={value ?? 'all'}
      onChange={(event) => {
        const next = event.target.value;
        onChange(next === 'all' ? undefined : next);
      }}
      size="small"
      className="min-w-[200px]"
    >
      <MenuItem value="all">전체 워크스페이스</MenuItem>
      {workspaces.map((workspace) => (
        <MenuItem key={workspace.id} value={workspace.id}>
          {workspace.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
