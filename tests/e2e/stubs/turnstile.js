// Stand-in for challenges.cloudflare.com/turnstile/v0/api.js in e2e.
window.turnstile = {
  render(el, opts) {
    setTimeout(() => opts.callback("stub-token"));
    return "w1";
  },
  reset() {},
};
