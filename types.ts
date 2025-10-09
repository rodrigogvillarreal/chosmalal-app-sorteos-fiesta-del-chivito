
export interface Participant {
  id: string;
  name: string;
  location?: string;
  csvData?: string[]; // For CSV imports, store all columns
}

export type Winner = Participant;

export interface Location {
  id:string;
  name: string;
}

export interface Award {
  winner: Participant;
  location: Location;
}

export interface Raffle {
  id: string;
  title: string;
  date: string;
  participants: Participant[];
  locations: Location[];
  awards: Award[];
  waitlist?: Participant[];
  participantCsvHeader?: string[];
}