import React, { useState } from "react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
}

export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  delayDuration = 300,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => setIsVisible(true), delayDuration);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const getPositionStyles = () => {
    let position: React.CSSProperties = {
      position: "absolute",
      zIndex: 50,
      padding: "0.5rem",
      borderRadius: "0.25rem",
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    };

    switch (side) {
      case "top":
        position.bottom = "100%";
        position.marginBottom = "0.5rem";
        break;
      case "right":
        position.left = "100%";
        position.marginLeft = "0.5rem";
        break;
      case "bottom":
        position.top = "100%";
        position.marginTop = "0.5rem";
        break;
      case "left":
        position.right = "100%";
        position.marginRight = "0.5rem";
        break;
    }

    switch (align) {
      case "start":
        position[side === "left" || side === "right" ? "top" : "left"] = 0;
        break;
      case "center":
        position[side === "left" || side === "right" ? "top" : "left"] = "50%";
        position.transform = side === "left" || side === "right" 
          ? "translateY(-50%)" 
          : "translateX(-50%)";
        break;
      case "end":
        position[side === "left" || side === "right" ? "bottom" : "right"] = 0;
        break;
    }

    return position;
  };

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div style={getPositionStyles()}>
          {content}
        </div>
      )}
    </div>
  );
}

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const TooltipTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const TooltipContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
}; 