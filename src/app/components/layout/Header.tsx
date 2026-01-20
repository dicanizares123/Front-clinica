"use client";

interface HeaderProps {
  subtitle?: string;
  onNotificationClick?: () => void;
  notificationPanel?: React.ReactNode;
}

export default function Header({
  subtitle,
  onNotificationClick,
  notificationPanel,
}: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        {subtitle && (
          <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="cursor-pointer hover:bg-white/5 p-2 rounded-full transition-colors relative"
            onClick={onNotificationClick}
          >
            <span className="material-symbols-outlined text-text-secondary">
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background-dark"></span>
          </div>
          {notificationPanel && (
            <div className="absolute right-0 top-full mt-2 w-[500px] z-50">
              {notificationPanel}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2"></div>
      </div>
    </div>
  );
}
