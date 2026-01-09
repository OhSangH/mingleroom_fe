import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { createRoom } from '@/features/dashboard/api';

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type CreateRoomDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreateRoomDialog({ open, onClose }: CreateRoomDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    await createRoom(values);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>회의실 만들기</DialogTitle>
      <DialogContent className="space-y-4 pt-4">
        <TextField
          label="회의실 이름"
          fullWidth
          {...register('title')}
          error={Boolean(errors.title)}
          helperText={errors.title?.message}
        />
        <TextField
          label="설명"
          fullWidth
          {...register('description')}
          error={Boolean(errors.description)}
          helperText={errors.description?.message}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          취소
        </Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? '생성 중...' : '생성'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
