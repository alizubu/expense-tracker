import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white">
            Create your account
          </h1>
          <p className="text-slate-400 mt-2">
            Start tracking your expenses for free
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-[#16161E] border border-white/10 shadow-xl",
              headerTitle: "text-white",
              headerSubtitle: "text-slate-400",
              formFieldLabel: "text-slate-300",
              formFieldInput:
                "bg-[#1C1C27] border-white/10 text-white placeholder:text-slate-500",
              formButtonPrimary:
                "bg-violet-600 hover:bg-violet-700 text-white",
              footerActionLink: "text-violet-400 hover:text-violet-300",
            },
          }}
        />
      </div>
    </div>
  );
}
