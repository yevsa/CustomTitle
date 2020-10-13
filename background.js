chrome.tabs.onUpdated.addListener(
  async (tabId, changeInfo, tab) => {
    try {
      const options = await new Promise(resolve => {
        chrome.storage.sync.get('options', data => resolve(data.options))
      });
  
      const { status } = changeInfo;
      const url = new URL(tab.url);
      const { hostname } = url;
  
      const tabRuleset = options.ruleset?.[hostname];
  
      if (tabRuleset) {
        tabRuleset.params = Object.fromEntries(
          Object.entries(tabRuleset.params).sort((a, b) => {
            return a[1].priority - b[1].priority;
          })
        );
      }
  
      if (
        status === 'complete'
        && tabRuleset?.enabled
      ) {
        if (options.debug) {
          console.warn(`
        ----- ${hostname} -----
        `);
    
          // alert(JSON.stringify(options, null, 2));
        }
        
        const separator = options.separator.enabled && options.separator.value || '';
        
        const urlParams = Object.fromEntries(
          url.search
            .slice(1)
            .split('&')
            .map(pair => pair.split('='))
        );
    
        const activeParams = Object.entries(tabRuleset.params)
          .filter(pair => {
            const valueKey = pair[0];
            const options = pair[1];
        
            return options?.enabled
              && Object.keys(options.values).includes(urlParams[valueKey]);
          });
    
        const domainValue = tabRuleset.text;
        const paramsValue = activeParams
          .map(pair => {
            const values = JSON.parse(JSON.stringify(pair[1].values));
        
            Object.entries(values).forEach(pair => {
              if (!pair[1].enabled) delete values[pair[0]];
            });
        
            return {
              ...pair[1],
              values,
            };
          })
          .filter(({ values }) => Object.keys(values).length)
          .map(({ pair, text, values }) => {
            const chunks = [];
        
            if (!pair) chunks.push(text);
            chunks.push(
              Object.values(values)
                .map(({ text }) => text)
            );
        
            return chunks.join(separator);
          })
          .join(separator);
    
        const title = [domainValue, paramsValue].join(separator);
    
        console.log('title', title);
    
        chrome.tabs.executeScript(tabId, {
          code: `
          document.title = '${title}';
          setInterval(() => document.title = '${title}', 1000);
        `,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
)
