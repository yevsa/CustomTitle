let domains = 1;
let params = 1;
let values = 1;

export const createDomain = param => {
  if (typeof param === 'object') {
    const domain = JSON.parse(JSON.stringify(param));
    domain.id = domains++;
    return domain;
  } else {
    return {
      id: domains++,
      name: param,
      enabled: true,
      text: '',
      params: [createParameter(1)]
    };
  }
};

export const createParameter = priority => ({
  id: params++,
  name: '',
  enabled: true,
  priority,
  pair: true,
  text: '',
  values: [createValue()]
});

export const createValue = () => ({
  id: values++,
  name: '',
  enabled: true,
  text: ''
});

