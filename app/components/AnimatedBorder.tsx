import type React from "react";

interface AnimatedBorderProps {
  children: React.ReactNode;
  isActive: boolean;
}

const AnimatedBorder: React.FC<AnimatedBorderProps> = ({
  children,
  isActive,
}) => {
  return (
    <div className={`relative ${isActive ? "animate-pulse" : ""}`}>
      <div
        className={`absolute inset-0 rounded-lg ${
          isActive ? "bg-gradient-to-r from-blue-400 to-purple-500" : ""
        }`}
        style={{ padding: "2px" }}
      >
        <div className="h-full w-full bg-white rounded-lg">{children}</div>
      </div>
    </div>
  );
};

export default AnimatedBorder;
