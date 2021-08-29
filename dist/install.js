chrome.runtime.onInstalled.addListener(
  async () => {
    const defaultData = {
      settings: {
        debug: false,
        reset: false,
        options: {
          suppress: true,
          caseSensitive: true,
          separator: {
            enabled: true,
            value: ' | '
          }
        },
        rules: [
          {
            id: 1,
            name: 'example.com',
            enabled: true,
            text: 'My domain title',
            params: [
              {
                id: 1,
                name: 'a',
                enabled: true,
                priority: 1,
                pair: true,
                text: 'My parameter a title',
                values: [
                  {
                    id: 1,
                    name: '1',
                    enabled: true,
                    text: 'My a=1 text'
                  }
                ]
              }
            ]
          }
        ]
      }
    };
    
    const json = JSON.stringify(defaultData);
    let chunks = 0;
    let index = 0;
    const storageObj = {};
    
    // handling QUOTA_BYTES_PER_ITEM limitation by splitting json into chunks
    do {
      const key = `settings_${chunks}`; //todo use constants STORAGE_KEYS
      let length = chrome.storage.sync.QUOTA_BYTES_PER_ITEM - key.length;
      
      if (index + length > json.length) {
        length = json.length - index;
      }
      
      storageObj[key] = json.substring(index, index + length);
      
      chunks++;
      index += length;
    } while (index < json.length);
    
    storageObj.chunks = chunks;
    
    // saving all parts
    chrome.storage.sync.set(storageObj, () => console.log('Default data installed'));
  }
);
