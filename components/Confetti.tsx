import React from 'react';

const CONFETTI_COUNT = 150;
const COLORS = ['#34d399', '#fde047', '#60a5fa', '#f87171', '#a78bfa', '#f472b6'];

interface ConfettiPieceProps {
  style: React.CSSProperties;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ style }) => (
  <div
    className="absolute w-2 h-4"
    style={style}
  />
);

export const Confetti: React.FC = React.memo(() => {
  const confettiPieces = Array.from({ length: CONFETTI_COUNT }).map((_, index) => {
    const style: React.CSSProperties = {
      left: `${Math.random() * 100}%`,
      backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s forwards`,
      transform: `rotate(${Math.random() * 360}deg)`,
      opacity: 0, // Inicia invisible, la animación lo hará visible
    };
    return <ConfettiPiece key={index} style={style} />;
  });

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-50">
      {confettiPieces}
    </div>
  );
});