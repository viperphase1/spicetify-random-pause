// random-pause.js
(function RandomPause() {
  const ready = Spicetify?.Player &&
                Spicetify?.Menu &&
                Spicetify?.React &&
                Spicetify?.ReactDOM &&
                Spicetify?.showNotification;

  if (!ready) {
    setTimeout(RandomPause, 500);
    return;
  }

  console.log("[Random Pause] Initializing...");

  let enabled = false;
  let timer = null;
  let autoResuming = false; // Track if we're doing an auto-resume

  const MIN_DELAY = 5000;   // 5 seconds
  const MAX_DELAY = 20000;  // 20 seconds
  const PAUSE_DURATION = 10000; // 10 seconds pause

  function randomDelay() {
    return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;
  }

  function schedulePause() {
    clearTimeout(timer);

    if (!enabled) return;

    timer = setTimeout(() => {
      if (enabled && Spicetify.Player.isPlaying()) {
        Spicetify.Player.pause();
        // Resume after 10 seconds
        timer = setTimeout(() => {
          if (enabled) {
            autoResuming = true;
            Spicetify.Player.play();
          }
        }, PAUSE_DURATION);
      }
    }, randomDelay());
  }

  // Re-schedule on play (manual or auto)
  Spicetify.Player.addEventListener("onplaypause", (e) => {
    if (e.data.isPaused === false && enabled) {
      if (autoResuming) {
        autoResuming = false;
      }
      schedulePause();
    }
  });

  // Re-schedule on song change
  Spicetify.Player.addEventListener("songchange", schedulePause);

  // Menu toggle
  const menuItem = new Spicetify.Menu.Item(
    "Random Pause",
    false,
    (self) => {
      enabled = !enabled;
      self.setState(enabled);
      if (enabled) {
        schedulePause();
        Spicetify.showNotification("Random Pause enabled");
      } else {
        clearTimeout(timer);
        Spicetify.showNotification("Random Pause disabled");
      }
    }
  );

  menuItem.register();
  console.log("[Random Pause] Menu item registered");
})();
