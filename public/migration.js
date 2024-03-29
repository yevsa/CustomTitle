export const migrateSettings = settings => {
  settings = JSON.parse(JSON.stringify(settings));
  
  // Migration 1.4 -> 1.5
  if ('ruleset' in settings) {
    settings.rules = settings.ruleset;
    delete settings.ruleset;
  }
  
  if ('separator' in settings) {
    settings.options.separator = settings.separator;
    delete settings.separator;
  }
  
  return settings;
};
