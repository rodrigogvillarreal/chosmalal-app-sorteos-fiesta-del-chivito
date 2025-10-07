import type { Participant, Location } from '../types';

interface ParseResult {
  allParticipants: Participant[];
  uniqueParticipants: Participant[];
  duplicates: Map<string, number>;
}

interface LocationParseResult {
  allLocations: Location[];
  uniqueLocations: Location[];
  duplicates: Map<string, number>;
}


export const parseFile = (file: File): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) {
          resolve({ allParticipants: [], uniqueParticipants: [], duplicates: new Map() });
          return;
        }

        const fileName = file.name.toLowerCase();
        let participants: Participant[] = [];

        if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
          const lines = content.split(/\r\n|\n/).filter(line => line.trim() !== '');
          if (lines.length === 0) {
            resolve({ allParticipants: [], uniqueParticipants: [], duplicates: new Map() });
            return;
          }
          const header = lines[0].toLowerCase().split(',');
          const nameIndex = header.findIndex(h => h.includes('name') || h.includes('nombre'));
          const locationIndex = header.findIndex(h => h.includes('location') || h.includes('ciudad') || h.includes('ubicacion'));

          const dataLines = nameIndex !== -1 ? lines.slice(1) : lines;
          
          if (nameIndex === -1 && lines.length > 0) {
              participants = dataLines.map((line, index) => ({
                id: `${Date.now()}-${index}`,
                name: line.split(',')[0].trim(), // Assume name is the first column if no header
              }));
          } else {
            participants = dataLines.map((line, index) => {
              const columns = line.split(',');
              return {
                id: `${Date.now()}-${index}`,
                name: columns[nameIndex]?.trim() || `Participante ${index + 1}`,
                location: columns[locationIndex]?.trim(),
              };
            });
          }
        } else if (fileName.endsWith('.json')) {
          const data = JSON.parse(content);
          if (Array.isArray(data)) {
            participants = data.map((item, index) => ({
              id: item.id || `${Date.now()}-${index}`,
              name: item.name || `Participante ${index + 1}`,
              location: item.location,
            }));
          } else {
            reject(new Error('El archivo JSON debe contener un array de participantes.'));
            return;
          }
        } else {
          reject(new Error('Tipo de archivo no soportado. Por favor, usa CSV, TXT o JSON.'));
          return;
        }

        // Check for duplicates
        const nameCounts = new Map<string, number>();
        const duplicates = new Map<string, number>();
        const uniqueParticipants: Participant[] = [];
        const seenNames = new Set<string>();

        for (const p of participants) {
            const normalizedName = p.name.trim().toLowerCase();
            nameCounts.set(normalizedName, (nameCounts.get(normalizedName) || 0) + 1);

            if (!seenNames.has(normalizedName)) {
                uniqueParticipants.push(p);
                seenNames.add(normalizedName);
            }
        }

        for (const [name, count] of nameCounts.entries()) {
            if (count > 1) {
                duplicates.set(name, count);
            }
        }

        resolve({ allParticipants: participants, uniqueParticipants, duplicates });
      } catch (error) {
        reject(new Error('Error al analizar el archivo. Por favor, revisa el formato del archivo.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('No se pudo leer el archivo.'));
    };

    reader.readAsText(file);
  });
};

export const parseLocationFile = (file: File): Promise<LocationParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) {
          resolve({ allLocations: [], uniqueLocations: [], duplicates: new Map() });
          return;
        }

        const fileName = file.name.toLowerCase();
        let locations: Location[] = [];

        if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
          const lines = content.split(/\r\n|\n/).filter(line => line.trim() !== '');
          locations = lines.map((line, index) => ({
            id: `${Date.now()}-${index}`,
            name: line.split(',')[0].trim(),
          }));
        } else if (fileName.endsWith('.json')) {
          const data = JSON.parse(content);
          if (Array.isArray(data)) {
            locations = data.map((item, index) => {
              if (typeof item === 'string') {
                return {
                  id: `${Date.now()}-${index}`,
                  name: item.trim(),
                };
              }
              return {
                id: item.id || `${Date.now()}-${index}`,
                name: item.name || `Ubicación ${index + 1}`,
              };
            });
          } else {
            reject(new Error('El archivo JSON debe contener un array de ubicaciones.'));
            return;
          }
        } else {
          reject(new Error('Tipo de archivo no soportado. Por favor, usa CSV, TXT o JSON.'));
          return;
        }
        
        // Check for duplicates
        const nameCounts = new Map<string, number>();
        const duplicates = new Map<string, number>();
        const uniqueLocations: Location[] = [];
        const seenNames = new Set<string>();

        for (const loc of locations) {
            const normalizedName = loc.name.trim().toLowerCase();
            nameCounts.set(normalizedName, (nameCounts.get(normalizedName) || 0) + 1);

            if (!seenNames.has(normalizedName)) {
                uniqueLocations.push(loc);
                seenNames.add(normalizedName);
            }
        }

        for (const [name, count] of nameCounts.entries()) {
            if (count > 1) {
                duplicates.set(name, count);
            }
        }

        resolve({ allLocations: locations, uniqueLocations, duplicates });

      } catch (error) {
        reject(new Error('Error al analizar el archivo de ubicaciones. Por favor, revisa el formato del archivo.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('No se pudo leer el archivo de ubicaciones.'));
    };

    reader.readAsText(file);
  });
}