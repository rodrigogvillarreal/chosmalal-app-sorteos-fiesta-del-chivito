import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { UsersIcon } from './icons/UsersIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { WarningIcon } from './icons/WarningIcon';
import { LocationMarkerIcon } from './icons/LocationMarkerIcon';

interface DuplicateWarningInfo {
  duplicates: Map<string, number>;
}

interface LocationDuplicateWarningInfo {
  duplicates: Map<string, number>;
}

interface RaffleControlsProps {
  raffleTitle: string;
  setRaffleTitle: (title: string) => void;
  numberOfWinners: number;
  setNumberOfWinners: (count: number) => void;
  participantsCount: number;
  locationsCount: number;
  participantFile: File | null;
  locationFile: File | null;
  handleParticipantFileChange: (file: File | null) => void;
  handleLocationFileChange: (file: File | null) => void;
  startRaffle: () => void;
  resetRaffle: () => void;
  isRaffling: boolean;
  isFinished: boolean;
  error: string;
  duplicateWarning: DuplicateWarningInfo | null;
  onKeepDuplicates: () => void;
  onRemoveDuplicates: () => void;
  locationDuplicateWarning: LocationDuplicateWarningInfo | null;
  onKeepLocationDuplicates: () => void;
  onRemoveLocationDuplicates: () => void;
}

export const RaffleControls: React.FC<RaffleControlsProps> = ({
  raffleTitle,
  setRaffleTitle,
  numberOfWinners,
  setNumberOfWinners,
  participantsCount,
  locationsCount,
  participantFile,
  locationFile,
  handleParticipantFileChange,
  handleLocationFileChange,
  startRaffle,
  resetRaffle,
  isRaffling,
  isFinished,
  error,
  duplicateWarning,
  onKeepDuplicates,
  onRemoveDuplicates,
  locationDuplicateWarning,
  onKeepLocationDuplicates,
  onRemoveLocationDuplicates,
}) => {
  const participantFileInputRef = useRef<HTMLInputElement>(null);
  const locationFileInputRef = useRef<HTMLInputElement>(null);

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>, handler: (file: File | null) => void) => {
    const selectedFile = e.target.files?.[0] || null;
    handler(selectedFile);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración del Sorteo</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="raffle-title" className="block text-sm font-medium text-gray-700 mb-1">
            Título del Sorteo
          </label>
          <input
            type="text"
            id="raffle-title"
            value={raffleTitle}
            onChange={(e) => setRaffleTitle(e.target.value)}
            placeholder="Ej: Sorteo Anual de la Empresa"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isRaffling || isFinished}
          />
        </div>

        <div className="space-y-4">
            <input
                type="file"
                ref={participantFileInputRef}
                onChange={(e) => onFileSelected(e, handleParticipantFileChange)}
                className="hidden"
                accept=".csv,.txt,.json"
                disabled={isRaffling || isFinished}
            />
            <button
                onClick={() => participantFileInputRef.current?.click()}
                disabled={isRaffling || isFinished}
                className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:border-primary hover:bg-primary/10 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
            >
                <UploadIcon className="w-5 h-5 mr-2" />
                {participantFile ? `Archivo: ${participantFile.name}` : 'Subir Participantes (CSV, TXT, JSON)'}
            </button>
            {participantsCount > 0 && !duplicateWarning && (
                <p className="mt-2 text-sm text-gray-600 flex items-center">
                    <UsersIcon className="w-4 h-4 mr-1.5" />
                    {participantsCount} participantes cargados.
                </p>
            )}
        </div>
        
        {duplicateWarning && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <WarningIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Advertencia de Duplicados</h3>
                <div className="mt-2 text-sm text-yellow-700"><p>Se encontraron {duplicateWarning.duplicates.size} nombres duplicados.</p></div>
                <div className="mt-4"><div className="flex space-x-3">
                    <button type="button" onClick={onRemoveDuplicates} className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Eliminar duplicados</button>
                    <button type="button" onClick={onKeepDuplicates} className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Continuar igualmente</button>
                </div></div>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
            <input
                type="file"
                ref={locationFileInputRef}
                onChange={(e) => onFileSelected(e, handleLocationFileChange)}
                className="hidden"
                accept=".csv,.txt,.json"
                disabled={isRaffling || isFinished}
            />
            <button
                onClick={() => locationFileInputRef.current?.click()}
                disabled={isRaffling || isFinished}
                className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:border-primary hover:bg-primary/10 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
            >
                <LocationMarkerIcon className="w-5 h-5 mr-2" />
                {locationFile ? `Archivo: ${locationFile.name}` : 'Subir Ubicaciones (CSV, TXT, JSON)'}
            </button>
             {locationsCount > 0 && !locationDuplicateWarning && (
                <p className="mt-2 text-sm text-gray-600 flex items-center">
                    <TrophyIcon className="w-4 h-4 mr-1.5" />
                    {locationsCount} ubicaciones disponibles.
                </p>
            )}
        </div>

        {locationDuplicateWarning && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <WarningIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Advertencia de Ubicaciones Duplicadas</h3>
                <div className="mt-2 text-sm text-yellow-700"><p>Se encontraron {locationDuplicateWarning.duplicates.size} nombres de ubicaciones duplicados.</p></div>
                <div className="mt-4"><div className="flex space-x-3">
                    <button type="button" onClick={onRemoveLocationDuplicates} className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Eliminar duplicados</button>
                    <button type="button" onClick={onKeepLocationDuplicates} className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Continuar igualmente</button>
                </div></div>
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="num-winners" className="block text-sm font-medium text-gray-700 mb-1">
            Número de Ganadores {locationsCount > 0 ? 'a sortear' : ''}
          </label>
          <input
            type="number"
            id="num-winners"
            value={numberOfWinners}
            onChange={(e) => setNumberOfWinners(Math.max(1, parseInt(e.target.value, 10) || 1))}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary transition bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isRaffling || isFinished}
          />
          {locationsCount > 0 && numberOfWinners > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                Se sortearán {numberOfWinners} de las {locationsCount} ubicaciones disponibles.
            </p>
          )}
        </div>
      </div>
      
      {error && <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

      <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
        {isFinished ? (
          <button
            onClick={resetRaffle}
            className="w-full flex-1 justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
          >
            Iniciar Nuevo Sorteo
          </button>
        ) : (
          <button
            onClick={startRaffle}
            disabled={isRaffling || participantsCount === 0 || !!duplicateWarning || !!locationDuplicateWarning}
            className="w-full flex-1 justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
          >
            <TrophyIcon className="w-5 h-5 mr-2" />
            {isRaffling ? 'Sorteando...' : 'Iniciar Sorteo'}
          </button>
        )}
      </div>
    </div>
  );
};