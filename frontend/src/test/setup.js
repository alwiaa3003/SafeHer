import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, vi } from 'vitest';

window.scrollTo = vi.fn();

// jsdom has no canvas. Tests inspect the props given to the chart instead,
// and rendering is checked separately in a real browser.
vi.mock('react-chartjs-2', () => ({
  Line: vi.fn(({ role, 'aria-label': ariaLabel }) =>
    createElement('div', { role, 'aria-label': ariaLabel }),
  ),
}));

afterEach(() => {
  cleanup();
});
