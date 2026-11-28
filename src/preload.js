'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  windowAction: (action) => ipcRenderer.invoke('window:action', action),
  getState: () => ipcRenderer.invoke('window:get-state'),
  openExternal: (url) => ipcRenderer.invoke('desktop:open-external', url),
  pickVideo: () => ipcRenderer.invoke('media:pick-video'),
  startPhoneCast: () => ipcRenderer.invoke('phonecast:start'),
  stopPhoneCast: () => ipcRenderer.invoke('phonecast:stop'),
  openProjectionSettings: () => ipcRenderer.invoke('phonecast:open-projection-settings'),
  listCaptureSources: () => ipcRenderer.invoke('phonecast:list-capture-sources'),
  startAirplay: (options = {}) => ipcRenderer.invoke('airplay:start', options),
  setAirplayQuality: (quality) => ipcRenderer.invoke('airplay:set-quality', quality),
  stopAirplay: () => ipcRenderer.invoke('airplay:stop'),
  getAirplayStatus: () => ipcRenderer.invoke('airplay:status'),
  openAirplayNotice: () => ipcRenderer.invoke('airplay:open-notice'),
  onWindowState: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('window:state', listener);
    return () => ipcRenderer.removeListener('window:state', listener);
  },
  onGuestOpenUrl: (callback) => {
    const listener = (_event, url) => callback(url);
    ipcRenderer.on('guest:open-url', listener);
    return () => ipcRenderer.removeListener('guest:open-url', listener);
  },
  onBlockedProtocol: (callback) => {
    const listener = (_event, details) => callback(details);
    ipcRenderer.on('guest:blocked-protocol', listener);
    return () => ipcRenderer.removeListener('guest:blocked-protocol', listener);
  },
  onPhoneCastMedia: (callback) => {
    const listener = (_event, media) => callback(media);
    ipcRenderer.on('phonecast:media', listener);
    return () => ipcRenderer.removeListener('phonecast:media', listener);
  },
  onPhoneConnected: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('phonecast:phone-connected', listener);
    return () => ipcRenderer.removeListener('phonecast:phone-connected', listener);
  },
  onAirplayStatus: (callback) => {
    const listener = (_event, status) => callback(status);
    ipcRenderer.on('airplay:status', listener);
    return () => ipcRenderer.removeListener('airplay:status', listener);
  },
  onFocusSearch: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('shortcut:focus-search', listener);
    return () => ipcRenderer.removeListener('shortcut:focus-search', listener);
  },
  onReload: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('shortcut:reload', listener);
    return () => ipcRenderer.removeListener('shortcut:reload', listener);
  },
  userAgent: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'AppleWebKit/537.36 (KHTML, like Gecko)',
    'Chrome/136.0.0.0 Safari/537.36'
  ].join(' ')
});
