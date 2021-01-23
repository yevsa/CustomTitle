export const mock = [
  {
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
          text: 'New domain title',
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
  },
];
