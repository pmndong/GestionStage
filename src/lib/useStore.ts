import { useEffect, useState } from 'react';
import { getStore, subscribe } from './store';
import type { AppStore } from '../types';

export function useStore(): AppStore {
  const [data, setData] = useState<AppStore>(() => getStore());

  useEffect(() => {
    const unsub = subscribe(() => setData({ ...getStore() }));
    return () => { unsub(); };
  }, []);

  return data;
}
