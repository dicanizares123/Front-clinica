"use client";

interface StatsCardProps {
  title?: string;
  value?: string | number;
  icon?: string;
  imageSrc?: string;
  color: "blue" | "green" | "purple" | "orange";
  className?: string; // Permitir clases personalizadas
  titleClassName?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  imageSrc,
  color,
  className = "",
  titleClassName = "text-text-secondary",
}: StatsCardProps) {
  return (
    <div
      className={`border border-[#323a46] p-4 rounded-md shadow flex items-center justify-between ${
        className || "bg-surface-dark"
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
          <p className="text-2xl font-bold text-text-primary">{value}</p>
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
