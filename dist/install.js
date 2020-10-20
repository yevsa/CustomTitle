chrome.runtime.onInstalled.addListener(
  async () => {
    const defaultData = {
      options: {
        debug: true,
        reset: false,
        preferences: {
          suppress: true,
        },
        separator: {
          enabled: true,
          value: ' | ',
        },
        ruleset: [
          {
            id: 1,
            name: 'example.com',
            enabled: true,
            text: 'Custom example.com title',
            params: [
              {
                id: 1,
                name: 'a',
                enabled: true,
                priority: 1,
                pair: true,
                text: 'Custom parameter "a" text',
                values: [
                  {
                    id: 1,
                    name: '1',
                    enabled: true,
                    text: 'Custom a=1 text',
                  }
                ]
              },
            ]
          },
          {
            id: 2,
            name: 'localhost',
            enabled: true,
            text: 'hi',
            params: [
              {
                id: 1,
                name: 'a',
                enabled: true,
                priority: 1,
                pair: true,
                text: 'Custom parameter "a" text',
                values: [
                  {
                    id: 1,
                    name: '1',
                    enabled: true,
                    text: '=^_^=',
                  },
                ],
              },
              {
                id: 2,
                name: 'b',
                enabled: true,
                priority: 2,
                pair: true,
                text: 'Custom parameter "a" text',
                values: [
                  {
                    id: 1,
                    name: '2',
                    enabled: true,
                    text: 'xD',
                  },
                ],
              },
            ]
          },
        ],
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
