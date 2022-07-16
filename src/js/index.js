import enableDebugging from './debug.js';
import refreshNowPlaying from './data-track.js';
import refreshNextShow from './data-show.js';
import * as Fastly from './fastly.js';

const DEFAULT_IMAGE = 'https://aw.bff.fm/assets/art/pattern-grey/9d57e2497e07595604bbd02239b15048a321b29c.png';
const DEFAULT_COVERART = 'https://aw.bff.fm/assets/art/album-art-placeholder/a79c786a182e064925a69b40d69f20abc670e924.svg';
const DEFAULT_TITLE = 'BFF.fm';

const TRACK_UPDATE_FREQ = 10000; // 10 seconds
const SHOW_UPDATE_FREQ = 300000; // 5 minutes

export default function run() {

  document.addEventListener('data:nextshow:changed', function (e) {
    updateNextShow(e.detail);
    setVisibility();
  });
  document.addEventListener('data:nextshow:cleared', function() {
    clearNextShow();
    setVisibility();
  });
  document.addEventListener('data:nowplaying:track:changed', function (e) {
    updateNowPlayingTrack(e.detail);
    setVisibility();
  });
  document.addEventListener('data:nowplaying:track:cleared', function () {
    clearNowPlayingTrack();
    setVisibility();
  });
  document.addEventListener('data:nowplaying:show:changed', function (e) {
    updateCurrentShow(e.detail);
    refreshNextShow();
    setVisibility();
  });
  document.addEventListener('data:nowplaying:show:cleared', function () {
    clearCurrentShow();
    refreshNextShow();
    setVisibility();
  });

  window.setInterval(refreshNowPlaying, TRACK_UPDATE_FREQ);
  window.setInterval(refreshNextShow, SHOW_UPDATE_FREQ);

  enableDebugging();
  refreshNowPlaying();
  refreshNextShow();
}

function removeLoader() {
  const loader = document.querySelector('#loader');
  if (loader) {
    loader.remove();
  }
}

function replaceArtwork(widget, imageUrl, fallback) {
  const artContainer = widget.querySelector('.MetadataInfo-art');
  const image = widget.querySelector('.MetadataInfo-image');
  const newArt = artContainer.cloneNode(true);
  const newImage = newArt.querySelector('.MetadataInfo-image');

  if (imageUrl) {
    newImage.srcset = Fastly.srcSet(imageUrl);
    newImage.src = Fastly.sizeImage(imageUrl, 300);
  } else {
    newImage.srcset = '';
    newImage.src = fallback || DEFAULT_COVERART;
  }

  artContainer.parentElement.insertBefore(newArt, artContainer);
  widget.hasCover = !!imageUrl;
  widget.setAttribute('data-cover', imageUrl ? '1' : '0');

  window.requestAnimationFrame(function () {
    image.classList.add('MetadataInfo-exitingImage');
    widget.classList.add('is-animatingArtTransition');
  });

  window.setTimeout(function () {
    artContainer.remove();
    widget.classList.remove('is-animatingArtTransition');
  }, 1000);

}

function updateNowPlayingTrack(nowPlayingInfo) {
  const widget = document.querySelector('#track');
  const title = widget.querySelector('.TrackContent-title');
  const artist = widget.querySelector('.TrackContent-artist');
  const release = widget.querySelector('.TrackContent-release');

  artist.textContent = nowPlayingInfo.artist;
  title.textContent = nowPlayingInfo.title;
  release.textContent = nowPlayingInfo.album;
  replaceArtwork(widget, nowPlayingInfo.image, DEFAULT_COVERART);
  widget.isHydrated = true;
}

function clearNowPlayingTrack() {
  let widget = document.querySelector('#track');
  let title = widget.querySelector('.TrackContent-title');
  let artist = widget.querySelector('.TrackContent-artist');
  let release = widget.querySelector('.TrackContent-release');

  widget.isHydrated = false;
  title.textContent = '';
  artist.textContent = '';
  release.textContent = '';
  replaceArtwork(widget, false, DEFAULT_COVERART);
}

function updateCurrentShow(nowPlayingInfo) {
  const widget = document.querySelector('#current-show');
  const title = widget.querySelector('.ScheduleContent-show');
  const host = widget.querySelector('.ScheduleContent-host');

  title.textContent = nowPlayingInfo.program;
  host.textContent = nowPlayingInfo.presenter;
  replaceArtwork(widget, nowPlayingInfo.program_image, DEFAULT_IMAGE);

  widget.isHydrated = true;
}

function clearCurrentShow() {
  const widget = document.querySelector('#current-show');
  const title = widget.querySelector('.ScheduleContent-show');
  const host = widget.querySelector('.ScheduleContent-host');

  widget.isHydrated = false;
  title.textContent = DEFAULT_TITLE;
  host.textContent = '';
  replaceArtwork(widget, false, DEFAULT_IMAGE);
}

function updateNextShow(showInfo) {
  const widget = document.querySelector('#next-show');
  const title = widget.querySelector('.ScheduleContent-show');
  const host = widget.querySelector('.ScheduleContent-host');
  const time = widget.querySelector('.ScheduleContent-time');

  title.textContent = showInfo.show;
  host.textContent = showInfo.host;
  time.textContent = new Date(showInfo.start).toLocaleTimeString('en-us', {
    hour: 'numeric', minute: '2-digit'
  }).toLowerCase();

  replaceArtwork(widget, showInfo.image, DEFAULT_IMAGE);
  widget.isHydrated = true;
}

function clearNextShow() {
  const widget = document.querySelector('#next-show');
  const title = widget.querySelector('.ScheduleContent-show');
  const host = widget.querySelector('.ScheduleContent-host');
  const time = widget.querySelector('.ScheduleContent-time');

  widget.isHydrated = false;
  title.textContent = '';
  host.textContent = '';
  time.textContent = '';
  replaceArtwork(widget, false, DEFAULT_IMAGE);
}

function setVisibility() {
  const track = document.querySelector('#track');
  const show = document.querySelector('#current-show');
  const upcoming = document.querySelector('#next-show');

  // If the loader is still visible, remove it
  removeLoader();

  // TODO: Support timing out old tracks; reducing previous track when nolonger playing

  // Determining factors for layout
  const trackHydrated = track.isHydrated;
  const upcomingHydrated = upcoming.isHydrated;
  const trackArt = trackHydrated && track.hasCover;
  const showArt = show.isHydrated && show.hasCover;

  console.log({
    trackHydrated,
    upcomingHydrated,
    trackArt,
    showArt
  });

  // Expand the current track when an image is available, other wise expand
  // the current show
  show.classList.toggle('is-expanded', !trackArt);
  track.classList.toggle('is-expanded', trackArt);

  // Hide track data in favour of upcoming show when there is no 'previous track' data displayed
  track.classList.toggle('is-hidden', !trackHydrated);
  upcoming.classList.toggle('is-hidden', trackHydrated || !upcomingHydrated);
}

document.addEventListener('DOMContentLoaded', function (e) {
  const state = document.readyState;
  if (state === 'complete' || state === 'interactive') {
    return setTimeout(run, 0);
  }
});
