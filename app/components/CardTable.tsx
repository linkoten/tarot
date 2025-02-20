import Image from "next/image";
import { ReactNode } from "react";

interface CardTableProps {
  children: ReactNode;
}

export default function CardTable({ children }: CardTableProps) {
  return (
    <div className=" w-full h-full">
      {/* Main green background with texture */}
      <div className="absolute inset-0 bg-emerald-700 bg-opacity-90">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.2) 100%)",
          }}
        />
      </div>

      {/* Corner letters */}
      <div className="absolute inset-0 p-4">
        <div className="relative w-full h-full">
          {/* Top left - S */}
          <div className="absolute top-0 left-0 w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-800 rounded-full opacity-50" />
            <span className="relative text-2xl font-serif text-emerald-100">
              S
            </span>
          </div>

          {/* Top right - O */}
          <div className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-800 rounded-full opacity-50" />
            <span className="relative text-2xl font-serif text-emerald-100">
              O
            </span>
          </div>

          {/* Bottom left - F */}
          <div className="absolute bottom-0 left-0 w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-800 rounded-full opacity-50" />
            <span className="relative text-2xl font-serif text-emerald-100">
              E
            </span>
          </div>

          {/* Bottom right - N */}
          <div className="absolute bottom-0 right-0 w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-800 rounded-full opacity-50" />
            <span className="relative text-2xl font-serif text-emerald-100">
              N
            </span>
          </div>

          {/* Border lines connecting corners */}
          <div className="absolute inset-0 border-2 border-emerald-600 rounded-3xl" />

          {/* Center circle with cards */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 aspect-square">
            <div className="relative w-full h-full">
              {/* Circular spotlight effect */}
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-30" />

              {/* Cards */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-4/5 h-4/5 transform -rotate-12">
                  <Image
                    src="https://i.ibb.co/xV5m40p/Capture7.png"
                    alt="Vintage playing cards showing numbers 1 and 21"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render children (CurrentPli and other components) */}
      {children}
    </div>
  );
}
