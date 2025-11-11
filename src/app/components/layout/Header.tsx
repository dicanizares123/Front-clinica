"use client";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div>
      <div className="mb-6 flex w-full justify-center mb-8 ">
        <div className="h-10 w-10">
          <span className="material-symbols-outlined !text-[60px]">
            shield_with_heart
          </span>
        </div>
      </div>
      <h2 className="text-text-primary tracking-tight text-3xl font-bold leading-tight text-center pb-4">
        Centro Psicológico Atrévete
      </h2>
      <header className="flex items-center justify-between whitespace-nowrap mb-8">
        <div className="flex items-center gap-4 text-text-light dark:text-text-dark">
          <div>
            <h3 className="text-2xl font-bold leading-tight tracking-[-0.015em]">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
