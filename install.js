chrome.runtime.onInstalled.addListener(() => {
  const data = {
    options: {
      debug: true,
      ruleset: {
        'example.com': {
          enabled: true,
          text: 'Custom example.com title',
          params: {
            'a': {
              enabled: true,
              priority: 1,
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
      },
      separator: {
        enabled: true,
        value: ' - ',
      },
    },
  };
  
  chrome.storage.sync.set(data);
});
