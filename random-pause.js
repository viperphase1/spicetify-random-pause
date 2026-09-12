// random-pause.js
(function RandomPause() {
  const ready = Spicetify?.Player &&
                Spicetify?.Playbar &&
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

  // Playbar button - pause bars with question mark
  const icon = `<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="2" width="2.5" height="12" rx="0.6"/>
    <rect x="5.5" y="2" width="2.5" height="12" rx="0.6"/>
    <path d="M11.5 2.5c2 0 3.2 1.2 3.2 2.8 0 1.8-1.5 2.3-2.3 3.2-.5.5-.6 1-.6 1.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="11.8" cy="13.5" r="1.2"/>
  </svg>`;

  try {
    const button = new Spicetify.Playbar.Button(
      "Random Pause",
      icon,
      (self) => {
        enabled = !enabled;
        self.active = enabled;
        if (enabled) {
          schedulePause();
          Spicetify.showNotification("Random Pause enabled");
        } else {
          clearTimeout(timer);
          Spicetify.showNotification("Random Pause disabled");
        }
      },
      false,  // disabled
      false   // active (initial state)
    );
    console.log("[Random Pause] Playbar button created:", button);
  } catch (e) {
    console.error("[Random Pause] Failed to create Playbar button:", e);
    // Fallback to menu
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
    console.log("[Random Pause] Fell back to Menu item");
  }
})();
