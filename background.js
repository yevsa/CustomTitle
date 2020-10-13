chrome.tabs.onUpdated.addListener(
  async (tabId, changeInfo, tab) => {
    const options = await new Promise(resolve => {
      chrome.storage.sync.get('options', data => resolve(data))
    });
    
    if (options.debug) console.clear();
    
    const { status } = changeInfo;
    const url = new URL(tab.url);
    const { hostname } = url;
    
    const tabRuleset = options.ruleset[hostname];
    
    tabRuleset.params = Object.fromEntries(
      Object.entries(tabRuleset.params).sort((a,b) => {
        return a[1].priority - b[1].priority;
      })
    );
    
    if (
      status === 'complete'
      && tabRuleset?.enabled
    ) {
      const urlParams = Object.fromEntries(
        url.search
          .slice(1)
          .split('&')
          .map(pair => pair.split('='))
      );
      
      const activeParams = Object.fromEntries(
        Object.entries(tabRuleset.params)
          .filter(pair => {
            const valueKey = pair[0];
            const options = pair[1];
            
            return options?.enabled
              && Object.keys(options.values).includes(urlParams[valueKey]);
          })
      );
      
      
      
      const title = 'hehe :D';
      chrome.tabs.executeScript(tabId, {
        code: `
          document.title = '${title}';
          setInterval(() => document.title = '${title}', 1000);
        `,
      }, () => console.log('finished'));
    }
  }
)
