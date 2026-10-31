/**
 * CAT MEME CAM - CONTENT SCRIPT (Google Meet)
 * 100% CSP compliant: No inline script execution.
 * Loads assets_data.js (Base64) first, then injects inject.js.
 */

(function() {
  'use strict';

  function injectCoreScript() {
    if (window.__CAT_MEME_CORE_LOADED__) return;
    window.__CAT_MEME_CORE_LOADED__ = true;

    const injectScript = document.createElement('script');
    injectScript.src = chrome.runtime.getURL('inject.js');
    injectScript.dataset.extensionId = chrome.runtime.id;
    injectScript.dataset.assetBase = chrome.runtime.getURL('');

    const insert = () => {
      const parent = document.head || document.documentElement;
      if (parent) {
        parent.appendChild(injectScript);
      } else {
        setTimeout(insert, 10);
      }
    };
    insert();
  }

  const DETECTOR_FILES = [
    'detectors/detect_close_up.js',
    'detectors/detect_heart.js',
    'detectors/detect_pointing.js',
    'detectors/detect_head_pat.js',
    'detectors/detect_thumbs_up.js',
    'detectors/detect_fist.js',
    'detectors/detect_shh.js',
    'detectors/detect_huh.js',
    'detectors/detect_side_look.js',
    'detectors/detect_thinking.js'
  ];

  function loadScript(path) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = chrome.runtime.getURL(path);
      s.onload = () => resolve(true);
      s.onerror = (e) => {
        console.warn('[Cat Meme Cam] Warning loading script ' + path + ':', e);
        resolve(false);
      };

      const insert = () => {
        const parent = document.head || document.documentElement;
        if (parent) {
          parent.appendChild(s);
        } else {
          setTimeout(insert, 10);
        }
      };
      insert();
    });
  }

  async function startPipeline() {
    // 1. Tải Base64 Assets
    await loadScript('assets_data.js');

    // 2. Tải tất cả các file detector riêng biệt
    await Promise.all(DETECTOR_FILES.map(file => loadScript(file)));

    // 3. Khởi động core inject.js
    injectCoreScript();
  }

  startPipeline();

  // Relay messages between popup and page
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.type === 'SET_MEME') {
      window.postMessage({ type: 'CAT_MEME_SET_STATE', state: message.state }, '*');
      sendResponse({ status: 'ok' });
    }
    return true;
  });

  console.log('[Cat Meme Cam] Content script active on Meet.');
})();
