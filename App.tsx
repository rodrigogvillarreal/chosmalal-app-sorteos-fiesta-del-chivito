import React, { useState, useCallback, useEffect } from 'react';
import { RaffleControls } from './components/RaffleControls';
import { WinnerDisplay } from './components/WinnerDisplay';
import { RaffleHistory } from './components/RaffleHistory';
import { useRaffles } from './hooks/useRaffles';
import type { Participant, Raffle, Award, Location } from './types';
import { parseFile, parseLocationFile } from './utils/fileParser';

interface DuplicateWarningInfo {
  allParticipants: Participant[];
  uniqueParticipants: Participant[];
  duplicates: Map<string, number>;
}

interface LocationDuplicateWarningInfo {
  allLocations: Location[];
  uniqueLocations: Location[];
  duplicates: Map<string, number>;
}

const App: React.FC = () => {
  const {
    raffles,
    currentRaffle,
    setCurrentRaffle,
    saveRaffle,
    clearHistory,
    loadRaffle,
  } = useRaffles();
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [raffleTitle, setRaffleTitle] = useState<string>('Sorteo Stands Fiesta del Chivito 2025');
  const [numberOfWinners, setNumberOfWinners] = useState<number>(1);
  const [awards, setAwards] = useState<Award[]>([]);
  const [waitlist, setWaitlist] = useState<Participant[]>([]);
  const [isRaffling, setIsRaffling] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [participantFile, setParticipantFile] = useState<File | null>(null);
  const [locationFile, setLocationFile] = useState<File | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarningInfo | null>(null);
  const [locationDuplicateWarning, setLocationDuplicateWarning] = useState<LocationDuplicateWarningInfo | null>(null);
  const [locationsForDraw, setLocationsForDraw] = useState<Location[]>([]);
  const [participantCsvHeader, setParticipantCsvHeader] = useState<string[] | null>(null);

  useEffect(() => {
    if (currentRaffle) {
      setParticipants(currentRaffle.participants);
      setLocations(currentRaffle.locations);
      setRaffleTitle(currentRaffle.title);
      setAwards(currentRaffle.awards);
      setNumberOfWinners(currentRaffle.awards.length > 0 ? currentRaffle.awards.length : 1);
      setWaitlist(currentRaffle.waitlist || []);
      setParticipantCsvHeader(currentRaffle.participantCsvHeader || null);
      setIsRaffling(false);
      setParticipantFile(null);
      setLocationFile(null);
      setDuplicateWarning(null);
      setLocationDuplicateWarning(null);
    }
  }, [currentRaffle]);

  const handleFileChange = async (selectedFile: File | null) => {
    setParticipantFile(selectedFile);
    setParticipants([]);
    setError('');
    setDuplicateWarning(null);
    setParticipantCsvHeader(null);

    if (!selectedFile) {
      return;
    }

    try {
      const result = await parseFile(selectedFile);
      if(result.header) {
        setParticipantCsvHeader(result.header);
      }
      if (result.allParticipants.length === 0) {
        setError('El archivo está vacío o el formato es incorrecto. Cada participante debe estar en una nueva línea.');
      } else if (result.duplicates.size > 0) {
        setDuplicateWarning(result);
      } else {
        setParticipants(result.allParticipants);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido durante el análisis del archivo.');
      setParticipants([]);
    }
  };

  const handleLocationFileChange = async (selectedFile: File | null) => {
    setLocationFile(selectedFile);
    setLocations([]);
    setError('');
    setLocationDuplicateWarning(null);
    if (!selectedFile) return;
    try {
        const result = await parseLocationFile(selectedFile);
        if (result.allLocations.length === 0) {
            setError('El archivo de ubicaciones está vacío.');
        } else if (result.duplicates.size > 0) {
            setLocationDuplicateWarning(result);
        } else {
            setLocations(result.allLocations);
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al procesar el archivo de ubicaciones.');
        setLocations([]);
    }
  };
  
  const handleKeepDuplicates = () => {
    if (duplicateWarning) {
      setParticipants(duplicateWarning.allParticipants);
      setDuplicateWarning(null);
    }
  };

  const handleRemoveDuplicates = () => {
    if (duplicateWarning) {
      setParticipants(duplicateWarning.uniqueParticipants);
      setDuplicateWarning(null);
    }
  };

  const handleKeepLocationDuplicates = () => {
    if (locationDuplicateWarning) {
      setLocations(locationDuplicateWarning.allLocations);
      setLocationDuplicateWarning(null);
    }
  };

  const handleRemoveLocationDuplicates = () => {
    if (locationDuplicateWarning) {
      setLocations(locationDuplicateWarning.uniqueLocations);
      setLocationDuplicateWarning(null);
    }
  };

  const startRaffle = useCallback(() => {
    if (participants.length === 0) {
      setError('Por favor, sube una lista de participantes.');
      return;
    }
    if (numberOfWinners <= 0) {
      setError('El número de ganadores debe ser al menos 1.');
      return;
    }
    if (numberOfWinners > participants.length) {
      setError('El número de ganadores no puede exceder el número de participantes.');
      return;
    }
    if (locations.length > 0 && numberOfWinners > locations.length) {
      setError('El número de ganadores no puede exceder el número de ubicaciones disponibles.');
      return;
    }
    if (!raffleTitle.trim()) {
      setError('Por favor, proporciona un título para el sorteo.');
      return;
    }
    setError('');
    setIsRaffling(true);
    setAwards([]);
    setWaitlist([]);

    const awardsToGenerate = numberOfWinners;
    const isCustomLocations = locations.length > 0;
    const isReverseDraw = !isCustomLocations;

    const locationsPool = isCustomLocations
      ? locations
      : Array.from({ length: awardsToGenerate }, (_, i) => ({ id: `${i}`, name: `Ganador #${i + 1}` }));

    const shuffledParticipants = [...participants].sort(() => 0.5 - Math.random());
    const selectedWinners = shuffledParticipants.slice(0, awardsToGenerate);
    const remainingParticipants = shuffledParticipants.slice(awardsToGenerate);

    const finalAssignedLocations = isCustomLocations
      ? [...locationsPool].sort(() => 0.5 - Math.random()).slice(0, awardsToGenerate)
      : locationsPool;

    const finalAwards: Award[] = selectedWinners.map((winner, index) => ({
      winner,
      location: finalAssignedLocations[index],
    }));

    const awardsForAnimation = isReverseDraw ? [...finalAwards].reverse() : finalAwards;
    const drawOrderLocations = isReverseDraw ? [...finalAssignedLocations].reverse() : finalAssignedLocations;
    setLocationsForDraw(drawOrderLocations);

    awardsForAnimation.forEach((award, index) => {
      setTimeout(() => {
        setAwards(prev => [...prev, award]);
        if (index === awardsForAnimation.length - 1) {
          setIsRaffling(false);
          setWaitlist(remainingParticipants);
          
          if (isReverseDraw) {
            setAwards(finalAwards);
          }

          const newRaffle: Raffle = {
            id: currentRaffle?.id || Date.now().toString(),
            title: raffleTitle,
            date: new Date().toISOString(),
            participants: participants,
            locations: locations,
            awards: finalAwards,
            waitlist: remainingParticipants,
            participantCsvHeader: participantCsvHeader || undefined,
          };
          saveRaffle(newRaffle);
        }
      }, (index + 1) * 3000);
    });
  }, [participants, locations, numberOfWinners, raffleTitle, saveRaffle, currentRaffle, participantCsvHeader]);

  const resetForNewRaffle = useCallback(() => {
    setCurrentRaffle(null);
    setParticipants([]);
    setLocations([]);
    setRaffleTitle('Sorteo Stands Fiesta del Chivito 2025');
    setNumberOfWinners(1);
    setAwards([]);
    setWaitlist([]);
    setIsRaffling(false);
    setError('');
    setParticipantFile(null);
    setLocationFile(null);
    setDuplicateWarning(null);
    setLocationDuplicateWarning(null);
    setLocationsForDraw([]);
    setParticipantCsvHeader(null);
  }, [setCurrentRaffle]);

  const handleLoadRaffle = useCallback((raffleId: string) => {
    loadRaffle(raffleId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loadRaffle]);

  const isFinished = !isRaffling && awards.length > 0 && awards.length === numberOfWinners;

  return (
    <div className="min-h-screen bg-secondary text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <img 
            src="https://chosmalal.gob.ar/assets/images/resources/Logo01-chml.png" 
            alt="Logo Municipalidad de Chos Malal" 
            className="mx-auto mb-4 h-24"
          />
          <h1 className="text-4xl font-bold text-primary tracking-tight">Municipalidad de Chos Malal, Neuquén</h1>
          <p className="mt-2 text-lg text-gray-600" dangerouslySetInnerHTML={{ __html: "Sorteo de lugares para Stand en Fiesta Nacional del Chivito edici&oacute;n 2025 <br />Fecha del evento: del 21 al 23 de noviembre del 2025" }}></p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
             <RaffleControls
                raffleTitle={raffleTitle}
                setRaffleTitle={setRaffleTitle}
                numberOfWinners={numberOfWinners}
                setNumberOfWinners={setNumberOfWinners}
                participantsCount={participants.length}
                locationsCount={locations.length}
                participantFile={participantFile}
                locationFile={locationFile}
                handleParticipantFileChange={handleFileChange}
                handleLocationFileChange={handleLocationFileChange}
                startRaffle={startRaffle}
                resetRaffle={resetForNewRaffle}
                isRaffling={isRaffling}
                isFinished={isFinished}
                error={error}
                duplicateWarning={duplicateWarning ? { duplicates: duplicateWarning.duplicates } : null}
                onKeepDuplicates={handleKeepDuplicates}
                onRemoveDuplicates={handleRemoveDuplicates}
                locationDuplicateWarning={locationDuplicateWarning ? { duplicates: locationDuplicateWarning.duplicates } : null}
                onKeepLocationDuplicates={handleKeepLocationDuplicates}
                onRemoveLocationDuplicates={handleRemoveLocationDuplicates}
              />
            <RaffleHistory 
              raffles={raffles}
              onLoadRaffle={handleLoadRaffle}
              onClearHistory={clearHistory}
            />
          </div>
          
          <main className="lg:col-span-2">
            <WinnerDisplay
              isRaffling={isRaffling}
              isFinished={isFinished}
              participants={participants}
              awards={awards}
              waitlist={waitlist}
              locationsForCurrentDraw={locationsForDraw}
              allAvailableLocations={locations}
              raffleTitle={raffleTitle}
              raffleDate={currentRaffle?.date}
              participantCsvHeader={participantCsvHeader}
            />
          </main>
        </div>
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Municipalidad de Chos Malal. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;