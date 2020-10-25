chrome.runtime.onInstalled.addListener(
  async () => {
    const defaultData = {
      settings: {
        debug: false,
        reset: false,
        options: {
          suppress: true,
          caseSensitive: true,
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
            text: 'My domain title',
            params: [
              {
                id: 1,
                name: 'a',
                enabled: true,
                priority: 1,
                pair: true,
                text: 'My parameter a title',
                values: [
                  {
                    id: 1,
                    name: '1',
                    enabled: true,
                    text: 'My a=1 text',
                  }
                ]
              },
            ]
          },
        ],
      },
    };
    
    const settings = await new Promise(resolve => {
      chrome.storage.sync.get('settings', data => resolve(data.settings))
    });
    
    if (
      !settings
      || settings.reset
    ) {
      chrome.storage.sync.set(defaultData);
    }
  }
);
