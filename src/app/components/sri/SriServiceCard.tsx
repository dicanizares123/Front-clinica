"use client";

import Link from "next/link";

interface SriServiceCardProps {
  title: string;
  description: string;
  imageSrc: string;
  href: string;
}

export default function SriServiceCard({
  title,
  description,
  imageSrc,
  href,
}: SriServiceCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200 flex flex-col items-center text-center h-full">
        {/* Logo */}
        <div className="w-24 h-24 mb-4 flex items-center justify-center">
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Título */}
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>

        {/* Descripción */}
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
