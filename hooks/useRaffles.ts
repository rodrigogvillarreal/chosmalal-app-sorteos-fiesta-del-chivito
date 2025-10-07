
import { useState, useEffect, useCallback } from 'react';
import type { Raffle, Award, Location } from '../types';

const RAFFLE_HISTORY_KEY = 'raffleHistory';

// Helper to migrate old raffle structure
const migrateRaffle = (raffle: any): Raffle => {
  if (raffle.winners && !raffle.awards) {
    const winners = raffle.winners as any[];
    const locations: Location[] = winners.map((_, i) => ({
      id: `${i + 1}`,
      name: `Ganador #${i + 1}`
    }));
    const awards: Award[] = winners.map((winner, i) => ({
      winner,
      location: locations[i],
    }));
    return {
      id: raffle.id,
      title: raffle.title,
      date: raffle.date,
      participants: raffle.participants,
      locations,
      awards
    };
  }
  return raffle as Raffle;
};

export const useRaffles = () => {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [currentRaffle, setCurrentRaffle] = useState<Raffle | null>(null);

  useEffect(() => {
    try {
      const storedRaffles = localStorage.getItem(RAFFLE_HISTORY_KEY);
      if (storedRaffles) {
        const parsedRaffles = JSON.parse(storedRaffles) as any[];
        setRaffles(parsedRaffles.map(migrateRaffle));
      }
    } catch (error) {
      console.error("Failed to load raffles from local storage:", error);
      setRaffles([]);
    }
  }, []);

  const saveRaffle = useCallback((newRaffle: Raffle) => {
    setRaffles(prevRaffles => {
      const existingIndex = prevRaffles.findIndex(r => r.id === newRaffle.id);
      let updatedRaffles;
      if (existingIndex > -1) {
        updatedRaffles = [...prevRaffles];
        updatedRaffles[existingIndex] = newRaffle;
      } else {
        updatedRaffles = [newRaffle, ...prevRaffles];
      }

      try {
        localStorage.setItem(RAFFLE_HISTORY_KEY, JSON.stringify(updatedRaffles));
      } catch (error) {
        console.error("Failed to save raffles to local storage:", error);
      }
      setCurrentRaffle(newRaffle);
      return updatedRaffles;
    });
  }, []);
  
  const loadRaffle = useCallback((raffleId: string) => {
    const raffleToLoad = raffles.find(r => r.id === raffleId);
    if (raffleToLoad) {
      setCurrentRaffle(migrateRaffle(raffleToLoad));
    }
  }, [raffles]);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(RAFFLE_HISTORY_KEY);
      setRaffles([]);
      setCurrentRaffle(null);
    } catch (error) {
      console.error("Failed to clear raffle history from local storage:", error);
    }
  }, []);

  return {
    raffles,
    currentRaffle,
    setCurrentRaffle,
    saveRaffle,
    clearHistory,
    loadRaffle
  };
};
