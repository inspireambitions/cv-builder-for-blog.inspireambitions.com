const SHARE_TRACKING_PARAMS = ["_gl"];

export function removeShareTrackingParams() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  let changed = false;

  for (const parameter of SHARE_TRACKING_PARAMS) {
    if (url.searchParams.has(parameter)) {
      url.searchParams.delete(parameter);
      changed = true;
    }
  }

  if (!changed) return;

  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`
  );
}

export function getCleanBuilderUrl() {
  if (typeof window === "undefined") {
    return new URL("https://cv.inspireambitions.com/");
  }

  return new URL(window.location.pathname, window.location.origin);
}
