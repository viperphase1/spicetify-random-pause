// pass-the-parcel.js
(function RandomPause() {
  if (!Spicetify?.Player) {
    setTimeout(RandomPause, 300);
    return;
  }

  let enabled = false;
  let timer = null;

  const MIN_DELAY = 5000;   // 5 seconds
  const MAX_DELAY = 20000;  // 20 seconds

  function randomDelay() {
    return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;
  }

  function schedulePause() {
    clearTimeout(timer);

    if (!enabled || !Spicetify.Player.isPlaying()) return;

    timer = setTimeout(() => {
      if (enabled && Spicetify.Player.isPlaying()) {
        Spicetify.Player.pause();
      }
    }, randomDelay());
  }

  // Re-schedule whenever playback changes
  Spicetify.Player.addEventListener("play", schedulePause);
  Spicetify.Player.addEventListener("songchange", schedulePause);

  // Menu toggle
  const menuItem = new Spicetify.Menu.Item(
    "Random Pause",
    false,
    (state) => {
      enabled = state;
      if (enabled) {
        schedulePause();
      } else {
        clearTimeout(timer);
      }
    }
  );

  menuItem.register();
})();
