import { migrateSettings } from '../settings/migration.js';

export async function getSettings() {
  const chunksQuantity = await new Promise(resolve => {
    chrome.storage.sync.get('chunks', ({ chunks }) => resolve(chunks));
  });
  
  const promises = [];
  for (let i = 0; i < chunksQuantity; i++) {
    promises.push(new Promise(resolve => {
      const key = `settings_${i}`;
      chrome.storage.sync.get(key, r => {
        resolve(r[key]);
      });
    }));
  }
  
  const chunks = await Promise.all(promises);
  const json = chunks.reduce((str, chunk) => str + chunk, '');
  
  return migrateSettings(JSON.parse(json).settings);
}
