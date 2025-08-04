import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`text-3xl font-serif font-normal tracking-widest flex items-baseline space-x-2 select-none ${className}`}>
    <span className="text-[#E6397E]">Everything</span>
    <span className="text-black ml-1">MATERNITY</span>
  </span>
);

export default Logo; 