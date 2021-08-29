import { mock } from '@/utils/mock';

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
    return JSON.parse(json).settings;
  } catch (e) {
    console.error('[Tab Name Customizer] Could not load settings', e);
    return {};
  }
};

export const saveData = data => {
  return new Promise(resolve => {
    const json = JSON.stringify(data);
    let chunks = 0;
    let index = 0;
    const storageObj = {};
    
    // handling QUOTA_BYTES_PER_ITEM limitation by splitting json into chunks
    do {
      const key = `${STORAGE_KEYS.settings}_${chunks}`;
      const QUOTA_BYTES_PER_ITEM = isChromeEnv ? chrome.storage.sync.QUOTA_BYTES_PER_ITEM : 100;
      let length = QUOTA_BYTES_PER_ITEM - key.length;
      
      if (index + length > json.length) {
        length = json.length - index;
      }
      
      storageObj[key] = json.substring(index, index + length);
      
      chunks++;
      index += length;
    } while (index < json.length);
    
    storageObj.chunks = chunks;
    
    // saving all parts
    if (isChromeEnv) {
      chrome.storage.sync.set(storageObj, resolve);
    } else {
      resolve();
    }
  });
};
