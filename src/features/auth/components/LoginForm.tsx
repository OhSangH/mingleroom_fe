import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { loginApi } from '@/features/auth/api/api';
import { useState } from 'react';
import Alert from '@mui/material/Alert';

const schema = z.object({
  email: z.email('이메일 형식이 올바르지 않습니다.'),
  password: z.string().min(1, '비밀번호를 입력해 주세요'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginForm() {
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError('');
    try { await loginApi(values); }
    catch (error) { setSubmitError(error instanceof Error ? error.message : '로그인하지 못했습니다.'); }
  };

  return (
    <form className='space-y-5' onSubmit={handleSubmit(onSubmit)}>
      {submitError && <Alert severity='error'>{submitError}</Alert>}
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
        {isSubmitting ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  );
}
