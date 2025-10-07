import React from 'react';
import type { Raffle } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface RaffleHistoryProps {
  raffles: Raffle[];
  onLoadRaffle: (raffleId: string) => void;
  onClearHistory: () => void;
}

export const RaffleHistory: React.FC<RaffleHistoryProps> = ({ raffles, onLoadRaffle, onClearHistory }) => {
  if (raffles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Historial de Sorteos</h2>
        <button
          onClick={onClearHistory}
          className="text-sm text-red-600 hover:text-red-800 flex items-center transition"
          aria-label="Limpiar todo el historial de sorteos"
        >
          <TrashIcon className="w-4 h-4 mr-1" />
          Limpiar Todo
        </button>
      </div>
      <ul className="space-y-3 max-h-80 overflow-y-auto">
        {raffles.map((raffle) => (
          <li key={raffle.id}>
            <button
              onClick={() => onLoadRaffle(raffle.id)}
              className="w-full text-left p-3 bg-gray-50 hover:bg-primary/10 rounded-md border border-gray-200 transition focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <p className="font-semibold text-primary truncate">{raffle.title}</p>
              <p className="text-xs text-gray-500">
                {new Date(raffle.date).toLocaleString('es-ES')} - {raffle.awards.length} premio(s)
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};