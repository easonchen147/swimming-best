import "@testing-library/jest-dom/vitest";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;

Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
  configurable: true,
  value: () => {},
});

class IntersectionObserverMock {
  root = null;
  rootMargin = "";
  thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}

global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;
