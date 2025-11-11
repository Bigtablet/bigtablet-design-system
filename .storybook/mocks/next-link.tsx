import React from "react";

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  "aria-label"?: string;
}

const Link = ({ href, children, className, onClick, ...props }: LinkProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    console.log("Mock Link clicked:", href);
    onClick?.(e as any);
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

export default Link;
