"use client";

import Link from "next/link";

interface SriServiceCardProps {
  title: string;
  description: string;
  imageSrc: string;
  href: string;
  fullWidth?: boolean;
}

export default function SriServiceCard({
  title,
  description,
  imageSrc,
  href,
  fullWidth = false,
}: SriServiceCardProps) {
  return (
    <Link href={href} className="block h-full">
      <div className={`bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-gray-200 h-full ${fullWidth ? 'flex flex-row items-center gap-6' : 'flex flex-col items-center text-center'}`}>
        {/* Logo */}
        <div className={`flex items-center justify-center flex-shrink-0 ${fullWidth ? 'w-20 h-20' : 'w-24 h-24 mb-4'}`}>
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Contenido */}
        <div className={fullWidth ? 'flex-1' : ''}>
          {/* Título */}
          <h3 className={`text-lg font-bold text-gray-800 mb-2 ${fullWidth ? 'text-left' : ''}`}>{title}</h3>

          {/* Descripción */}
          <p className={`text-sm text-gray-600 leading-relaxed ${fullWidth ? 'text-left' : ''}`}>{description}</p>
        </div>
      </div>
    </Link>
  );
}
