import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { signup } from '@/features/auth/api/api';

const schema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    await signup(values);
  };

  return (
    <form className='space-y-5' onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label='이름'
        fullWidth
        {...register('username')}
        error={Boolean(errors.username)}
        helperText={errors.username?.message}
      />
      <TextField
        label='이메일'
        type='email'
        fullWidth
        {...register('email')}
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
      />
      <TextField
        label='비밀번호'
        type='password'
        fullWidth
        {...register('password')}
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
      />
      <Button type='submit' variant='contained' fullWidth disabled={isSubmitting}>
        {isSubmitting ? '가입 중...' : '회원가입'}
      </Button>
    </form>
  );
}
