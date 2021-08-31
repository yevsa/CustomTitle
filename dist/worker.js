import { tabRoutine } from './tab-routine.js';
import { installer } from './install.js';

chrome.runtime.onInstalled.addListener(installer);
chrome.tabs.onUpdated.addListener(tabRoutine);
chrome.action.onClicked.addListener(() => chrome.tabs.create({ url: 'settings/index.html' }));
