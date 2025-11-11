"use client";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "blue" | "green" | "purple" | "orange";
}

const colorClasses = {
  blue: "bg-blue-100 text-blue-500",
  green: "bg-green-100 text-green-500",
  purple: "bg-purple-100 text-purple-500",
  orange: "bg-orange-100 text-orange-500",
};

export default function StatsCard({
  title,
  value,
  icon,
  color,
}: StatsCardProps) {
  return (
    <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-xl flex items-center gap-4">
      <div className={`${colorClasses[color]} rounded-full p-3`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {title}
        </p>
        <p className="text-2xl font-bold text-text-light dark:text-text-dark">
          {value}
        </p>
      </div>
    </div>
  );
}
