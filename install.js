chrome.runtime.onInstalled.addListener(
  async () => {
    const defaultData = {
      options: {
        debug: true,
        reset: true,
        suppress: true,
        ruleset: {
          'example.com': {
            enabled: true,
            text: 'Custom example.com title',
            params: {
              'a': {
                enabled: true,
                priority: 1,
                pair: true,
                text: 'Custom parameter "a" text',
                values: {
                  '1': {
                    enabled: true,
                    text: 'Custom a=1 text',
                  }
                }
              },
            }
          },
          'localhost': {
            enabled: true,
            text: 'hi',
            params: {
              'a': {
                enabled: true,
                priority: 1,
                pair: true,
                text: 'Custom parameter "a" text',
                values: {
                  '1': {
                    enabled: true,
                    text: '=^_^=',
                  },
                },
              },
              'b': {
                enabled: true,
                priority: 2,
                pair: true,
                text: 'Custom parameter "a" text',
                values: {
                  '2': {
                    enabled: true,
                    text: 'xD',
                  },
                },
              },
            }
          },
        },
        separator: {
          enabled: true,
          value: ' | ',
        },
      },
    };
    
    const options = await new Promise(resolve => {
      chrome.storage.sync.get('options', data => resolve(data.options))
    });
    
    if (
      !options
      || options.reset
    ) chrome.storage.sync.set(defaultData);
  });
