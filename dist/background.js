chrome.tabs.onUpdated.addListener(
  async (tabId, changeInfo, tab) => {
    try {
      const settings = await getSettings();
      
      const findRuleset = hostname => settings.ruleset.find(set => set.name === hostname);
      
      const url = new URL(tab.url);
      let hostname = url.hostname;
      let tabRuleset = findRuleset(hostname)
      
      if (!tabRuleset) {
        hostname = hostname.replace(/^www./, '');
        tabRuleset = findRuleset(hostname)
      }
      
      if (!tabRuleset) {
        tabRuleset = settings.ruleset.find(set => set.name.includes(hostname));
      }
      
      if (settings.debug) {
        console.warn(`
        ----- ${hostname} -----
        `);
        console.debug('tab', tab);
        console.debug('tabRuleset', tabRuleset);
      }
      
      if (
        changeInfo.status === 'complete'
        && tabRuleset?.enabled
      ) {
        const settings = await getSettings();
  
        tabRuleset.params.sort((a, b) => a.priority - b.priority);
  
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
  
        let title = tabRuleset.params
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
                chunks.push(value.text)
              }
            }
      
            return chunks;
          }, [tabRuleset.text])
          .join(separator)
          .replace(/'/g, '\'');
  
        if (settings.debug) {
          console.debug('title', title);
        }
        
        const suppressCode = `
          try {
            clearInterval(_tcm_titleUpdater);
            var _tcm_titleUpdater = setInterval(() => document.title = '${title}', 1000);
          } catch (e) {
          console.error(e)}
          `
        
        chrome.tabs.executeScript(tabId, {
          code: `;document.title = '${title}';`
            + (settings.options.suppress ? suppressCode : ''),
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
)

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
