import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background-primary p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-heading text-text-primary">Welcome Back</h1>
          <p className="mt-2 text-text-muted">Sign in to your expense tracker</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-background-card border border-white/[0.08] shadow-2xl rounded-2xl w-full",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-text-primary",
              socialButtonsBlockButtonText: "text-text-primary font-medium",
              dividerLine: "bg-white/[0.08]",
              dividerText: "text-text-muted",
              formFieldLabel: "text-text-muted",
              formFieldInput: "bg-white/[0.02] border border-white/[0.1] text-text-primary focus:border-brand-purple rounded-xl",
              formButtonPrimary: "bg-brand-purple hover:bg-brand-purple-light text-white font-semibold rounded-xl",
              footerActionText: "text-text-muted",
              footerActionLink: "text-brand-purple hover:text-brand-purple-light"
            }
          }}
        />
      </div>
    </div>
  );
}
