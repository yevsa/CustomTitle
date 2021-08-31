import { saveData } from './settings/saveData.js';

export async function installer() {
  const defaultData = {
    settings: {
      debug: false,
      reset: false,
      options: {
        suppress: true,
        caseSensitive: true,
        separator: {
          enabled: true,
          value: ' | '
        }
      },
      rules: [
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
                  text: 'My a=1 text'
                }
              ]
            }
          ]
        }
      ]
    }
  };
  
  try {
    await saveData(defaultData);
    console.log('Default data installed');
  } catch (e) {
    console.error('Error occured during saving data', e);
  }
}
