import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Participant, Award, Location } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { Confetti } from './Confetti';

interface WinnerDisplayProps {
  isRaffling: boolean;
  isFinished: boolean;
  participants: Participant[];
  awards: Award[];
  waitlist: Participant[];
  locationsForCurrentDraw: Location[];
  allAvailableLocations: Location[];
  raffleTitle: string;
  raffleDate?: string;
}

const NameCycler: React.FC<{ participants: Participant[] }> = ({ participants }) => {
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (participants.length === 0) return;
    const intervalId = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * participants.length);
      setDisplayName(participants[randomIndex].name);
    }, 75);

    return () => clearInterval(intervalId);
  }, [participants]);

  return (
    <div className="text-4xl md:text-5xl font-bold text-primary p-4 bg-primary/10 rounded-lg min-h-[70px] flex items-center justify-center transition-all duration-300">
      {displayName}
    </div>
  );
};

export const WinnerDisplay: React.FC<WinnerDisplayProps> = ({
  isRaffling,
  isFinished,
  participants,
  awards,
  waitlist,
  locationsForCurrentDraw,
  allAvailableLocations,
  raffleTitle,
  raffleDate
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const prevAwardsCount = useRef(awards.length);
  
  const unassignedLocations = useMemo(() => {
    if (!isFinished || allAvailableLocations.length === 0) {
      return [];
    }
    const assignedLocationIds = new Set(awards.map(a => a.location.id));
    return allAvailableLocations.filter(l => !assignedLocationIds.has(l.id));
  }, [isFinished, awards, allAvailableLocations]);

  useEffect(() => {
    if (awards.length > prevAwardsCount.current) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      prevAwardsCount.current = awards.length;
      return () => clearTimeout(timer);
    }
  }, [awards]);

  const downloadResults = () => {
    const titleLine = `Título del Sorteo: ${raffleTitle}\n`;
    const dateLine = `Fecha: ${raffleDate ? new Date(raffleDate).toLocaleString('es-ES') : new Date().toLocaleString('es-ES')}\n\n`;
    const header = "Ubicación,Ganador,Ubicación del Ganador\n";
    const csvContent = awards.map(a => `"${a.location.name}","${a.winner.name}","${a.winner.location || ''}"`).join("\n");
    
    const blob = new Blob([titleLine, dateLine, header, csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const safeFilename = raffleTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.setAttribute("href", url);
      link.setAttribute("download", `ganadores_${safeFilename || 'sorteo'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const downloadWaitlist = () => {
    if (waitlist.length === 0) return;

    const titleLine = `Suplentes para el Sorteo: ${raffleTitle}\n`;
    const dateLine = `Fecha: ${raffleDate ? new Date(raffleDate).toLocaleString('es-ES') : new Date().toLocaleString('es-ES')}\n\n`;
    const header = "Orden,Nombre,Ubicación del Participante\n";
    const csvContent = waitlist
      .map((p, index) => `${index + 1},"${p.name}","${p.location || ''}"`)
      .join("\n");
      
    const blob = new Blob([titleLine, dateLine, header, csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const safeFilename = raffleTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.setAttribute("href", url);
      link.setAttribute("download", `suplentes_${safeFilename || 'sorteo'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadUnassigned = () => {
    if (unassignedLocations.length === 0) return;
    
    const content = unassignedLocations.map(l => l.name).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const safeFilename = raffleTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.setAttribute("href", url);
      link.setAttribute("download", `vacantes_${safeFilename || 'sorteo'}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderContent = () => {
    if (isRaffling || (awards.length > 0 && !isFinished)) {
      return (
        <div className="text-center">
            <p className="text-xl text-gray-600 mb-2 animate-pulse">
              Asignando premio para...
            </p>
             <p className="text-2xl font-bold text-gray-800 mb-4">
              {locationsForCurrentDraw[awards.length]?.name || `Premio ${awards.length + 1}`}
            </p>
            <NameCycler participants={participants} />
        </div>
      );
    }

    if (isFinished) {
      return (
        <div>
          <div className="bg-primary text-center p-6 rounded-t-lg -m-6 md:-m-8 mb-6 shadow-lg">
            <TrophyIcon className="w-16 h-16 text-accent mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white drop-shadow-md">¡Felicidades a los Ganadores!</h2>
            <p className="mt-2 text-xl font-semibold text-white opacity-90">{raffleTitle}</p>
            {raffleDate && (
                <p className="text-sm text-white opacity-80 mt-1">
                    {new Date(raffleDate).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
            )}
          </div>

          <ul className="space-y-3 bg-green-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            {awards.map((award, index) => (
              <li key={award.winner.id} className="p-4 bg-white rounded-md shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center">
                <span className="text-lg font-bold text-primary mr-4 mb-2 sm:mb-0">#{index + 1}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-500 text-sm">{award.location.name}</p>
                  <p className="font-bold text-gray-900 text-xl">{award.winner.name}</p>
                  {award.winner.location && <p className="text-sm text-gray-500">{award.winner.location}</p>}
                </div>
              </li>
            ))}
          </ul>

          {waitlist.length > 0 && (
            <div className="mt-8">
              <h4 className="text-2xl font-bold text-gray-700 text-center mb-4">
                Suplentes (por orden de sorteo)
              </h4>
              <ul className="space-y-3 bg-blue-50 p-4 rounded-lg max-h-80 overflow-y-auto">
                {waitlist.map((participant, index) => (
                  <li key={participant.id} className="p-4 bg-white rounded-md shadow-sm border border-gray-200 flex items-center">
                    <span className="text-lg font-bold text-gray-500 mr-4">#{index + 1}</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-xl">{participant.name}</p>
                      {participant.location && <p className="text-sm text-gray-500">{participant.location}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={downloadResults}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Exportar Ganadores
            </button>
             {waitlist.length > 0 && (
              <button
                onClick={downloadWaitlist}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
              >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Descargar Suplentes ({waitlist.length})
              </button>
            )}
            {unassignedLocations.length > 0 && (
              <button
                onClick={downloadUnassigned}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
              >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Descargar Vacantes ({unassignedLocations.length})
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-16">
        <TrophyIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-gray-700">¿Listo para Iniciar el Sorteo?</h3>
        <p className="mt-2 text-gray-500">
          Sube tus participantes y configura los ajustes para comenzar.
        </p>
      </div>
    );
  };

  return (
    <div className="relative bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200 min-h-[400px] flex flex-col justify-center overflow-hidden">
        {showConfetti && <Confetti />}
        {renderContent()}
    </div>
  );
};