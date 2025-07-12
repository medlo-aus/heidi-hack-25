import Link from "next/link";

// import { MedloLogo, MedloLogoSquare } from "@/components/Icons";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-[#242424]" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/">
            doccy
            {/* <MedloLogo className="mr-2 h-8 text-white" /> */}
          </Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Medlo streamlines the process of securing locum positions,
              ensuring transparency and simplicity in your next job."
            </p>
            <footer className="text-sm">Healthcare Professionals</footer>
          </blockquote>
        </div>
      </div>
      <div className="h-full lg:p-8">
        <div className="mx-auto flex h-full w-full flex-col justify-center space-y-6 px-4 sm:w-[350px] md:px-0">
          <Link href="/" className="mx-auto mb-12 block lg:hidden">
            doccy
            {/* <MedloLogoSquare className="h-16 w-16 first-letter:text-white" /> */}
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
