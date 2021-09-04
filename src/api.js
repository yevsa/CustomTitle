import { mock } from '@/utils/mock';
import { migrateSettings } from '../public/migration';

const STORAGE_KEYS = Object.freeze({
  settings: 'settings'
});

const isChromeEnv = 'chrome' in window;

export const loadData = async () => {
  if (!isChromeEnv) return mock[0].settings;
  
  const chunksQuantity = await new Promise(resolve => {
    chrome.storage.sync.get('chunks', ({ chunks }) => resolve(chunks));
  });
  
  const promises = [];
  for (let i = 0; i < chunksQuantity; i++) {
    promises.push(new Promise(resolve => {
      const key = `${STORAGE_KEYS.settings}_${i}`;
      chrome.storage.sync.get(key, r => {
        resolve(r[key]);
      });
    }));
  }
  
  const chunks = await Promise.all(promises);
  const json = chunks.reduce((str, chunk) => str + chunk, '');
  
  try {
    return migrateSettings(JSON.parse(json).settings);
  } catch (e) {
    console.error('[CustomTitle] Could not load settings', e);
    return {};
  }
};
