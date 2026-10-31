document.addEventListener('DOMContentLoaded', () => {
  const openMeetBtn = document.getElementById('openMeetBtn');
  if (openMeetBtn) {
    openMeetBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://meet.google.com/qjf-scxg-pbw' });
    });
  }

  const items = document.querySelectorAll('.item');
  items.forEach(el => {
    el.addEventListener('click', async () => {
      const state = el.dataset.state;
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'SET_MEME', state: state }).catch(() => {});
      }
    });
  });
});
