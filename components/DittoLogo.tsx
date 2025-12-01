import React from 'react';

export const DittoLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <img 
      src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png" 
      alt="Ditto"
      className={`drop-shadow-lg object-contain ${className}`}
    />
  );
}