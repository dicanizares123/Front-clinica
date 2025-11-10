"use client";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between whitespace-nowrap mb-8">
      <div className="flex items-center gap-4 text-text-light dark:text-text-dark">
        <div>
          <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
