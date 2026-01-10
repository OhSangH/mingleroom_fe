import AuthLayout from '@/features/auth/components/AuthLayout';
import LoginForm from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout title="다시 만나서 반가워요" subtitle="학습 세션을 계속하려면 로그인하세요.">
      <LoginForm />
    </AuthLayout>
  );
}
