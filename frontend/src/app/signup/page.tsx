import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      <AuthForm mode="signup" />
    </main>
  );
}
