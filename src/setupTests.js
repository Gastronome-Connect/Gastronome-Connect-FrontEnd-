import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock(
  "react-router/dom",
  () => jest.requireActual("react-router/dist/development/dom-export.js"),
  { virtual: true },
);

jest.mock(
  "react-router-dom",
  () => jest.requireActual("react-router-dom/dist/index.js"),
  { virtual: true },
);

class ImmediateIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe(target) {
    this.callback([
      {
        isIntersecting: true,
        target,
      },
    ]);
  }

  unobserve() {}

  disconnect() {}
}

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: jest.fn(),
});

window.IntersectionObserver = ImmediateIntersectionObserver;
window.ResizeObserver = ResizeObserverMock;
window.alert = jest.fn();