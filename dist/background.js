chrome.tabs.onUpdated.addListener(
  async (tabId, changeInfo, tab) => {
    try {
      const options = await new Promise(resolve => {
        chrome.storage.sync.get('options', data => resolve(data.options))
      });
      
      const url = new URL(tab.url);
      const hostname = url.hostname;
      const tabRuleset = options.ruleset.find(set => set.name === hostname);
      
      if (
        changeInfo.status === 'complete'
        && tabRuleset?.enabled
      ) {
        if (options.debug) {
          console.warn(`
        ----- ${hostname} -----
        `);
        }
  
        tabRuleset.params.sort((a, b) => a.priority - b.priority);
        
        const separator = options.separator.enabled && options.separator.value || '';
        
        const urlParams = Object.fromEntries(
          url.search
            .slice(1)
            .split('&')
            .map(pair => pair.split('='))
        );
        
        console.log('urlParams', urlParams);
        
        const title = tabRuleset.params
          .reduce((chunks, param) => {
            if (param.enabled && param.name in urlParams) {
              const value = param.values.find(value => value.name === urlParams[param.name]);
              
              if (value) {
                chunks.push(value.text)
              }
            }
            
            return chunks;
          }, [tabRuleset.text])
          .join(separator);
        
        console.log('title', title);
        
        chrome.tabs.executeScript(tabId, {
          code: `
          document.title = '${title}';
          clearInterval(tcmTitleUpdater);
          var tcmTitleUpdater = setInterval(() => document.title = '${title}', 1000);
        `,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
)
