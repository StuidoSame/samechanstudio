(function () {
  "use strict";

  var ENTRY_STORAGE_KEY = "same-studio-archive-entry-v1";
  var RETURN_STORAGE_KEY = "same-studio-archive-return-v1";
  var root = document.documentElement;
  var body = document.body;
  var reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  var returning = false;
  var cameFromMain = false;

  try {
    var referrer = document.referrer ? new URL(document.referrer) : null;
    cameFromMain =
      Boolean(referrer) &&
      referrer.origin === window.location.origin &&
      referrer.pathname === "/";
  } catch {
    cameFromMain = false;
  }

  try {
    var storedOrigin = JSON.parse(
      window.sessionStorage.getItem(ENTRY_STORAGE_KEY) || "null",
    );
    window.sessionStorage.removeItem(ENTRY_STORAGE_KEY);

    if (
      storedOrigin &&
      Number.isFinite(storedOrigin.x) &&
      Number.isFinite(storedOrigin.y)
    ) {
      root.style.setProperty(
        "--archive-portal-x",
        Math.max(0, Math.min(1, storedOrigin.x)) * window.innerWidth + "px",
      );
      root.style.setProperty(
        "--archive-portal-y",
        Math.max(0, Math.min(1, storedOrigin.y)) * window.innerHeight + "px",
      );
    }
  } catch {
    // The centered CSS origin remains available as a safe fallback.
  }

  if (
    !window.history.state ||
    (!window.history.state.sameStudioArchiveEntry &&
      !window.history.state.sameStudioArchiveGuard)
  ) {
    window.history.replaceState(
      { sameStudioArchiveEntry: true },
      "",
      window.location.href,
    );
    window.history.pushState(
      { sameStudioArchiveGuard: true },
      "",
      window.location.href,
    );
  } else if (window.history.state.sameStudioArchiveEntry) {
    window.history.pushState(
      { sameStudioArchiveGuard: true },
      "",
      window.location.href,
    );
  }

  function setReturnOrigin(event) {
    var x = window.innerWidth / 2;
    var y = window.innerHeight / 2;

    if (event && event.currentTarget) {
      var bounds = event.currentTarget.getBoundingClientRect();
      var keyboardActivation = event.clientX === 0 && event.clientY === 0;
      x = keyboardActivation ? bounds.left + bounds.width / 2 : event.clientX;
      y = keyboardActivation ? bounds.top + bounds.height / 2 : event.clientY;
    }

    root.style.setProperty("--archive-portal-x", x + "px");
    root.style.setProperty("--archive-portal-y", y + "px");
  }

  function finishReturn(fromBrowserBack) {
    try {
      window.sessionStorage.setItem(RETURN_STORAGE_KEY, "1");
    } catch {
      // The main page still has a no-flash dark fallback without storage.
    }

    if (cameFromMain) {
      window.history.go(fromBrowserBack ? -1 : -2);
      return;
    }

    window.location.assign("/");
  }

  function startReturn(event, fromBrowserBack) {
    if (event) event.preventDefault();
    if (returning) return;

    returning = true;
    setReturnOrigin(event);
    body.classList.remove("is-arriving");
    body.classList.add("is-returning");

    window.setTimeout(
      function () {
        finishReturn(Boolean(fromBrowserBack));
      },
      reducedMotion ? 180 : 820,
    );
  }

  Array.prototype.forEach.call(
    document.querySelectorAll("[data-archive-return]"),
    function (link) {
      link.addEventListener("click", function (event) {
        startReturn(event, false);
      });
    },
  );

  window.addEventListener("popstate", function (event) {
    if (event.state && event.state.sameStudioArchiveEntry) {
      startReturn(null, true);
    }
  });

  window.addEventListener("pageshow", function (event) {
    if (!event.persisted) return;
    returning = false;
    body.classList.remove("is-returning");
  });
})();
