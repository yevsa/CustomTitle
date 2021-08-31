import { getSettings } from './utils/getSettings.js';

export async function tabRoutine(tabId, changeInfo, tab) {
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
      
      const separator = settings.options.separator.enabled && settings.options.separator.value || '';
      
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
      
      await chrome.scripting.executeScript(
        {
          target: { tabId },
          args: [title, settings.options.suppress],
          func: function (title, shouldSuppress) {
            document.title = title;
            
            if (shouldSuppress) {
              try {
                if ('_tnc_titleUpdater' in window) {
                  console.error('[Tab Name Customizer] Cannot suppress title change. Something is using extension\'s reserved variable');
                } else {
                  clearInterval(_tnc_titleUpdater);
                  var _tnc_titleUpdater = setInterval(() => document.title = title, 1000);
                }
              } catch (e) {
                console.error('[Tab Name Customizer]', e);
              }
            }
          }
        }
      );
    }
  } catch (e) {
    console.error(e);
  }
}
