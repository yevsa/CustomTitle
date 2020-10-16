chrome.runtime.onInstalled.addListener(
  async () => {
    const defaultData = {
      options: {
        debug: true,
        reset: true,
        suppress: true,
        ruleset: [
          {
            name: 'example.com',
            enabled: true,
            text: 'Custom example.com title',
            params: [
              {
                name: 'a',
                enabled: true,
                priority: 1,
                pair: true,
                text: 'Custom parameter "a" text',
                values: [
                  {
                    name: '1',
                    enabled: true,
                    text: 'Custom a=1 text',
                  }
                ]
              },
            ]
          },
          {
            name: 'localhost',
            enabled: true,
            text: 'hi',
            params: [
              {
                name: 'a',
                enabled: true,
                priority: 1,
                pair: true,
                text: 'Custom parameter "a" text',
                values: [
                  {
                    name: '1',
                    enabled: true,
                    text: '=^_^=',
                  },
                ],
              },
              {
                name: 'b',
                enabled: true,
                priority: 2,
                pair: true,
                text: 'Custom parameter "a" text',
                values: [
                  {
                    name: '2',
                    enabled: true,
                    text: 'xD',
                  },
                ],
              },
            ]
          },
        ],
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
