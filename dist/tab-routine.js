import { getSettings } from './utils/getSettings.js';

export async function tabRoutine(tabId, changeInfo, tab) {
  try {
    const settings = await getSettings();
    const url = new URL('url' in changeInfo ? changeInfo.url : tab.url);
    const hostname = url.hostname;
    const rule = settings.rules.find(set => {
      const noW = hostname.replace(/^www./, '');
      return set.name === hostname
        || set.name === noW
        || set.name.includes(noW)
    });
    
    if (!rule) {
      console.log(`No rule for ${url.hostname}`);
      return;
    } else {
      console.log(`Rule found for ${url.hostname}!`);
      
      if (settings.debug) {
        console.debug(`----- ${url.hostname} -----`);
        console.debug('tab', tab);
        console.debug('rule', rule);
      }
    }
    
    if (rule.enabled) {
      rule.params.sort((a, b) => a.priority - b.priority);
      const considerCase = str => settings.options.caseSensitive ? str : str.toLowerCase();
      
      const separator = settings.options.separator.enabled && settings.options.separator.value || '';
      let searchParams = [...url.searchParams];
      if (!settings.options.caseSensitive) {
        searchParams = searchParams.map(el => [el[0], el[1].toLowerCase()]);
      }
      const urlParams = Object.fromEntries(searchParams);
      
      if (settings.debug) {
        console.debug('urlParams', urlParams);
      }
      
      const title = rule.params
        .reduce((chunks, param) => {
          const paramName = considerCase(param.name);
          
          if (param.enabled && paramName in urlParams) {
            const value = param.values.find(value => {
              return considerCase(value.name) === urlParams[paramName];
            });
            
            if (value) {
              chunks.push(value.text);
            }
          }
          
          return chunks;
        }, [rule.text])
        .join(separator)
        .replace(/'/g, '\'');
      
      if (settings.debug) {
        console.debug('title', title);
      }
      
      await chrome.scripting.executeScript(
        {
          target: { tabId },
          args: [title, settings.options.suppress],
          func: function (title, shouldSuppress) {
            document.title = title;
            
            if (shouldSuppress) {
              try {
                if ('_tnc_titleUpdater' in window) {
                  clearInterval(window._tnc_titleUpdater);
                }
  
                try {
                  window._tnc_titleUpdater = setInterval(() => {
                    if (document.title !== title) {
                      document.title = title;
                    }
                  }, 1000);
                } catch (e) {
                  console.warn('[CustomTitle] Title blocker setup failed', e);
                }
              } catch (e) {
                console.error('[CustomTitle]', e);
              }
            }
          }
        }
      );
      
      if (settings.options.suppress) {
        console.log('Set up title blocker', title);
      }
    }
  } catch (e) {
    console.error(e);
  }
}
