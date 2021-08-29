chrome.tabs.onUpdated.addListener(
  async (tabId, changeInfo, tab) => {
    try {
      const settings = await getSettings();
      
      const findRules = hostname => settings.rules.find(set => set.name === hostname);
      
      const url = new URL(tab.url);
      let hostname = url.hostname;
      let tabRules = findRules(hostname);
      
      if (!tabRules) {
        hostname = hostname.replace(/^www./, '');
        tabRules = findRules(hostname);
      }
      
      if (!tabRules) {
        tabRules = settings.rules.find(set => set.name.includes(hostname));
      }
      
      if (settings.debug) {
        console.warn(`
        ----- ${hostname} -----
        `);
        console.debug('tab', tab);
        console.debug('tabRules', tabRules);
      }
      
      if (
        changeInfo.status === 'complete'
        && tabRules?.enabled
      ) {
        const settings = await getSettings();
        
        tabRules.params.sort((a, b) => a.priority - b.priority);
        
        const separator = settings.separator.enabled && settings.separator.value || '';
        
        const urlParams = Object.fromEntries(
          url.search
            .slice(1)
            .split('&')
            .map(pair => {
              pair = pair.split('=');
              
              if (!settings.options.caseSensitive) {
                pair = pair.map(el => el.toLowerCase());
              }
              
              return pair;
            })
        );
        
        if (settings.debug) {
          console.debug('urlParams', urlParams);
        }
        
        let title = tabRules.params
          .reduce((chunks, param) => {
            let paramName = param.name;
            if (!settings.options.caseSensitive) {
              paramName = paramName.toLowerCase();
            }
            
            if (param.enabled && paramName in urlParams) {
              const value = param.values.find(value => {
                let valueName = value.name;
                
                if (!settings.options.caseSensitive) {
                  valueName = valueName.toLowerCase();
                }
                
                return valueName === urlParams[paramName];
              });
              
              if (value) {
                chunks.push(value.text);
              }
            }
            
            return chunks;
          }, [tabRules.text])
          .join(separator)
          .replace(/'/g, '\'');
        
        if (settings.debug) {
          console.debug('title', title);
        }
        
        const suppressCode = `
          try {
            clearInterval(_tnc_titleUpdater);
            var _tnc_titleUpdater = setInterval(() => document.title = '${title}', 1000);
          } catch (e) {
          console.error(e)}
          `;
        
        chrome.browserAction;
        
        chrome.tabs.executeScript(tabId, {
          code: `;document.title = '${title}';`
            + (settings.options.suppress ? suppressCode : '')
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
);

async function getSettings() {
  const chunksQuantity = await new Promise(resolve => {
    chrome.storage.sync.get('chunks', ({ chunks }) => resolve(chunks));
  });
  
  const promises = [];
  for (let i = 0; i < chunksQuantity; i++) {
    promises.push(new Promise(resolve => {
      const key = `settings_${i}`; //todo use constants STORAGE_KEYS
      chrome.storage.sync.get(key, r => {
        resolve(r[key]);
      });
    }));
  }
  
  const chunks = await Promise.all(promises);
  const json = chunks.reduce((str, chunk) => str + chunk, '');
  
  return JSON.parse(json).settings;
}

chrome.browserAction.onClicked.addListener(() => chrome.tabs.create({ url: 'settings/index.html' }));
