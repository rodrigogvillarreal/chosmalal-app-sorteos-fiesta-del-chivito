
import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18zM9 19V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6"
    />
     <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 11.428a2.857 2.857 0 00-4.04-4.04l-.85.85a2.857 2.857 0 004.04 4.04l.85-.85zM4.572 11.428a2.857 2.857 0 014.04-4.04l.85.85a2.857 2.857 0 01-4.04 4.04l-.85-.85z" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 01-9-9" />
  </svg>
);
