/**
 * CAT MEME CAM - SERVICE WORKER
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Cat Meme Cam] Extension installed successfully.');
  chrome.storage.local.set({
    enabled: true,
    mode: 'avatar',
    activeMeme: 'neutral'
  });
});
