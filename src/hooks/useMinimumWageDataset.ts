import { useEffect, useState } from 'react';
import {
  fetchLiveMinimumWageDataset,
  loadSnapshotMinimumWageDataset,
  readCachedMinimumWageDataset,
  type MinimumWageDataset,
} from '../lib/wagesService';

export const useMinimumWageDataset = (enabled = true): MinimumWageDataset | null => {
  const [dataset, setDataset] = useState<MinimumWageDataset | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    const cached = readCachedMinimumWageDataset();

    if (cached) {
      setDataset(cached.dataset);
    } else {
      void loadSnapshotMinimumWageDataset().then((snapshot) => {
        if (active) {
          setDataset((current) => current ?? snapshot);
        }
      });
    }

    if (!cached || !cached.fresh) {
      void fetchLiveMinimumWageDataset().then((live) => {
        if (active && live) {
          setDataset(live);
        }
      });
    }

    return () => {
      active = false;
    };
  }, [enabled]);

  return dataset;
};
