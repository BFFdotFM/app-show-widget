// const HOST = 'http:localhost:8090';
const HOST = 'https://bff.fm';

let lastShowHash = null;

function fetchNextShow() {
  return window.fetch(`${HOST}/api/data/shows/next.json`, {
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'omit',
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
  })
    .then(response => response.json())
    .catch(error => {
      console.error('HTTP error fetching next show info', error);
      return false;
    });
}

/**
 * Create a comparable representation of the show data in order to see whether it
 * has meaningfully changed.
 */
function hashShow(showInfo) {
  if (!showInfo.show) {
    return null;
  }
  return [
    showInfo.show,
    showInfo.host,
    showInfo.image
  ].join(':');
 }

export default function refresh() {
  fetchNextShow().then(function nextShowResponse(data) {

    if (!data || !data.show) {
      document.dispatchEvent(new CustomEvent('data:nextshow:cleared', {
        bubbles: false,
        detail: data
      }));
      return;
    }

    let showHash = hashShow(data);
    if (showHash !== lastShowHash) {
      lastShowHash = showHash;
      document.dispatchEvent(new CustomEvent('data:nextshow:changed', {
        bubbles: false,
        detail: data
      }));
    }
  });
}
