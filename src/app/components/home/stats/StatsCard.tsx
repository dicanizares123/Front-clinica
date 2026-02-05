"use client";

interface StatsCardProps {
  title?: string;
  value?: string | number;
  icon?: string;
  imageSrc?: string;
  color?: "blue" | "green" | "purple" | "orange";
  className?: string; // Permitir clases personalizadas
  titleClassName?: string;
  valueClassName?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export default function StatsCard({
  title,
  value,
  icon,
  imageSrc,
  color,
  className = "",
  titleClassName = "text-gray-600",
  valueClassName = "text-gray-900",
  onClick,
  clickable = false,
}: StatsCardProps) {
  return (
    <div
      onClick={onClick}
      className={`border border-gray-300/50 p-4 rounded-xl shadow-sm flex items-center justify-between ${
        className || "bg-gradient-to-br from-white to-gray-50"
      } ${
        clickable
          ? "cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
          : ""
      }`}
    >
      <div>
        {title && (
          <p
            className={`text-xs font-semibold uppercase tracking-wider mb-1 ${titleClassName}`}
          >
            {title}
          </p>
        )}
        {value && (
          <p className={`text-2xl font-bold ${valueClassName}`}>{value}</p>
        )}
      </div>
      <div className={`text-${color}-500`}>
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={title || "Icon"}
            className="w-auto h-8 object-contain"
          />
        ) : (
          <span className="material-symbols-outlined !text-[32px]">{icon}</span>
        )}
      </div>
    </div>
  );
}
