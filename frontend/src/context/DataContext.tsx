import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Matter } from '../types';
import { matterApi } from '../services/api';

interface DataContextType {
  matters: Matter[];
  isLoading: boolean;
  error: string | null;
  refreshMatters: () => Promise<void>;
  updateMatter: (updated: Matter) => Promise<void>;
  createMatter: (matterData: Partial<Matter>) => Promise<Matter | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatters = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await matterApi.getAll();
      setMatters(response.data);
    } catch (err: any) {
      console.error('Failed to fetch matters', err);
      if (err.response?.status !== 401) {
        setError('Could not connect to the backend server. Make sure Django is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatters();
  }, []);


  const updateMatter = async (updated: Matter) => {
    try {
      await matterApi.update(Number(updated.id), updated);
      setMatters(prev => prev.map(m => m.id === updated.id ? updated : m));
    } catch (err) {
      console.error('Failed to update matter', err);
    }
  };

  const createMatter = async (matterData: Partial<Matter>) => {
    try {
      // In a real app we would link to the active organization id. Hardcoding 1 for now if needed.
      if (!matterData.organization) matterData.organization = 1;
      const response = await matterApi.create(matterData);
      setMatters(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      console.error('Failed to create matter', err);
      return null;
    }
  };

  return (
    <DataContext.Provider value={{ matters, isLoading, error, refreshMatters: fetchMatters, updateMatter, createMatter }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
