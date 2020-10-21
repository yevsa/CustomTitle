chrome.tabs.onUpdated.addListener(
  async (tabId, changeInfo, tab) => {
    try {
      const settings = await new Promise(resolve => {
        chrome.storage.sync.get('settings', data => resolve(data.settings))
      });
      
      const url = new URL(tab.url);
      const hostname = url.hostname;
      const tabRuleset = settings.ruleset.find(set => set.name === hostname);
      
      if (
        changeInfo.status === 'complete'
        && tabRuleset?.enabled
      ) {
        if (settings.debug) {
          console.warn(`
        ----- ${hostname} -----
        `);
        }
        
        async function makeTitle() {
          const settings = await new Promise(resolve => {
            chrome.storage.sync.get('settings', data => resolve(data.settings))
          });
          
          const url = new URL(tab.url);
          const hostname = url.hostname;
          const tabRuleset = settings.ruleset.find(set => set.name === hostname);
          
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
          
          console.log('urlParams', urlParams);
          
          const title = tabRuleset.params
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
            .join(separator);
          
          console.log('title', title);
          
          return title;
        }
        
        const title = await makeTitle();
        
        const suppressCode = `
          clearInterval(_tcm_titleUpdater);
          var _tcm_titleUpdater = setInterval(() => document.title = '${title}', 1000);
          `
        
        chrome.tabs.executeScript(tabId, {
          code: `document.title = '${title}';` + (settings.options.suppress ? suppressCode : ''),
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
)
