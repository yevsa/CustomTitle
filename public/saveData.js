export const saveData = data => {
  return new Promise(resolve => {
    const json = JSON.stringify(data);
    let chunks = 0;
    let index = 0;
    const storageObj = {};
    
    const debug = 0;
    const saveNet = 10000;
  
    if (debug) console.warn('json len', json.length, 'jsonjson len', JSON.stringify(json).length);
    
    // handling QUOTA_BYTES_PER_ITEM limitation by splitting json into chunks
    do {
      const stringifyMultiplier = 0.70; // Chrome stringifies saved data before comparing to quota
      const quota = Math.floor(chrome.storage.sync.QUOTA_BYTES_PER_ITEM * stringifyMultiplier);
      const key = `settings_${chunks}`;
      const keySize = new TextEncoder().encode(key).length;
      
      const encoding = new TextEncoder().encodeInto(json.substring(index), new Uint8Array(quota - keySize));
      
      storageObj[key] = json.substring(index, index + encoding.read);
      
      if (debug) {
        console.warn('chunks', chunks, 'index', index, 'quota', quota);
        console.warn('r', encoding.read, 'w', encoding.written);
        console.log('string', storageObj[key].length, storageObj[key].substring(0, 20));
      }
      
      chunks++;
      index += encoding.read;
    } while (index < json.length && chunks < saveNet);
    
    storageObj.chunks = chunks;
    
    // saving all parts
    chrome.storage.sync.set(storageObj, resolve);
  });
};
