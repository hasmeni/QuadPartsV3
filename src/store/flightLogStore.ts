import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FlightLogEntry {
  id: string;
  date: string;
  drone: string;
  location: string;
  duration: string;
  notes: string;
  issues: string;
}

interface FlightLogState {
  flightLogs: FlightLogEntry[];
  addFlightLog: (log: Omit<FlightLogEntry, 'id'>) => void;
  updateFlightLog: (id: string, log: Partial<FlightLogEntry>) => void;
  deleteFlightLog: (id: string) => void;
  clearAllFlightLogs: () => void;
  setFlightLogs: (logs: FlightLogEntry[]) => void;
}

export const useFlightLogStore = create<FlightLogState>()(
  persist(
    (set, get) => ({
      flightLogs: [],
      
      addFlightLog: (log) => {
        const newLog: FlightLogEntry = {
          ...log,
          id: Date.now().toString()
        };
        set((state) => ({
          flightLogs: [...state.flightLogs, newLog]
        }));
      },
      
      updateFlightLog: (id, updatedLog) => {
        set((state) => ({
          flightLogs: state.flightLogs.map((log) =>
            log.id === id ? { ...log, ...updatedLog } : log
          )
        }));
      },
      
      deleteFlightLog: (id) => {
        set((state) => ({
          flightLogs: state.flightLogs.filter((log) => log.id !== id)
        }));
      },
      
      clearAllFlightLogs: () => {
        set({ flightLogs: [] });
      },
      
      setFlightLogs: (logs) => {
        set({ flightLogs: logs });
      }
    }),
    {
      name: 'quadparts_flight_logs_data',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Handle migration from old format if needed
          return persistedState;
        }
        return persistedState;
      }
    }
  )
); 