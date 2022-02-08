(function () {
  // Configuration
  const DEFAULT_IMAGE = 'https://aw.bff.fm/assets/art/pattern-grey/9d57e2497e07595604bbd02239b15048a321b29c.png';
  const DEFAULT_TITLE = 'BFF.fm';
  // const HOST = 'http:localhost:8090';
  const HOST = 'https://bff.fm';
  const UPDATE_FREQ = 10000;
  const DEBUG = false;

  function debug(...args) {
    if (DEBUG) {
      console.debug(...args);
    }
  }

  // Data Fetch
  function fetchOnAir() {
    return window.fetch(`${HOST}/api/data/shows/now.json`, {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit',
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    })
      .then(response => response.json())
      .catch(error => {
        console.error('HTTP error fetching Show Playing info', error);
        return false;
      });
  }

  // Populate
  function fastlySizeImage(url, size) {
    return `${url}?width=${size}&height${size}&fit=crop`;
  }

  function fastlySrcSet(url) {
    return [100, 300, 500, 1000]
      .map(size => `${fastlySizeImage(url, size)} ${size}w`)
      .join(',');
  }

  function render(showInfo) {
    let widget = document.querySelector('.ShowWidget');
    let title = widget.querySelector('.ShowWidget-show');
    let host = widget.querySelector('.ShowWidget-host');
    let image = widget.querySelector('.ShowWidget-image');

    if (showInfo === false) {
      debug('No show info returned; reverting to defaults');
      widget.classList.add('is-missing-data');
      title.textContent = DEFAULT_TITLE;
      image.srcset = '';
      image.src = DEFAULT_IMAGE;
      return;
    }

    title.textContent = showInfo.show;
    host.textContent = showInfo.host;

    if (showInfo.image) {
      image.srcset = fastlySrcSet(showInfo.image);
      image.src = fastlySizeImage(showInfo.image, 300);
      debug('Generated image URLs', image.src, image.srcsrc);
    } else {
      debug('No image in response; reverting to default image');
      image.srcset = '';
      image.src = DEFAULT_IMAGE;
    }
    widget.classList.remove('is-missing-data');
  }
  // Init
  function run() {
    debug('Running timed update...', UPDATE_FREQ);
    fetchOnAir()
      .then(render)
      .finally(() => setTimeout(run, UPDATE_FREQ));
  }
  run();
})();
