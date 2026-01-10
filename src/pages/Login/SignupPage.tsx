import AuthLayout from '@/features/auth/components/AuthLayout';
import SignupForm from '@/features/auth/components/SignupForm';

export default function SignupPage() {
  return (
    <AuthLayout title="공간을 만들어볼까요?" subtitle="방을 만들려면 계정을 먼저 준비하세요.">
      <SignupForm />
    </AuthLayout>
  );
}
