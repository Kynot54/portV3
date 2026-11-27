// Stand-in for app.cal.com/embed/embed.js in e2e: runs the queued calls and
// renders a placeholder iframe for "inline".
(function () {
  const queued = (window.Cal && window.Cal.q) || [];
  function Cal(cmd, opts) {
    if (cmd !== "inline") return;
    const el =
      typeof opts.elementOrSelector === "string"
        ? document.querySelector(opts.elementOrSelector)
        : opts.elementOrSelector;
    const frame = document.createElement("iframe");
    frame.title = "Cal stub";
    // Which event was asked for, so tests can tell the two calendars apart.
    frame.dataset.calLink = opts.calLink;
    // A real (tiny) document: Firefox crashes when axe injects into an empty about:blank frame.
    frame.srcdoc =
      "<!doctype html><html lang=en><title>Cal stub</title><p>Calendar</p></html>";
    frame.style.width = "100%";
    frame.style.height = "480px";
    el.append(frame);
  }
  window.Cal = Cal;
  queued.forEach((args) => Cal(...args));
})();
