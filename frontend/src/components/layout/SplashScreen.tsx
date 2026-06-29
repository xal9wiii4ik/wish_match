import { Spinner } from "@/components/ui";

import { Logo } from "./Logo";

export function SplashScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface">
      <Logo />
      <Spinner className="h-6 w-6 text-brand-400" />
    </div>
  );
}
