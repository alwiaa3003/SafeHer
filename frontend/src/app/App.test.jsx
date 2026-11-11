import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PIN_STORAGE_KEY } from '../layout/AppShell/useAutoHideNav';
import { OVERVIEW_HEADING } from '../pages/OverviewPage';
import { routes } from './routes';

// The four destinations in the main navigation, in order.
const navPages = [
  ['/', 'Crime Map'],
  ['/crime-trends', 'Crime Trends'],
  ['/data-sources', 'Data & Sources'],
  ['/methodology', 'Methodology'],
];
// Kept reachable by address, but not listed until they have verified data.
const unlistedPages = [
  ['/overview', 'Overview'],
  ['/crime-categories', 'Crime Categories'],
  ['/metro-comparison', 'Metro Comparison'],
];
const pages = [...navPages, ...unlistedPages];

function renderAt(path) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return { router, ...render(<RouterProvider router={router} />) };
}

const mainNav = () => screen.getByRole('navigation', { name: 'Main' });
const HEADINGS = { '/overview': OVERVIEW_HEADING };
const pageHeading = (name) =>
  screen.getByRole('heading', { level: 1, name });
const sidebar = () => document.getElementById('site-sidebar');
const shell = () => sidebar().closest('[data-nav]');
const wait = (ms) => act(() => new Promise((resolve) => setTimeout(resolve, ms)));

// Narrow or touch screens: no wide layout and no hover.
function stubNarrowScreen() {
  vi.stubGlobal('matchMedia', vi.fn((query) => ({
    matches: query.includes('max-width'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })));
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('routing', () => {
  it.each(pages)('renders %s as %s and sets the tab title', async (path, title) => {
    renderAt(path);
    expect(
      await screen.findByRole('heading', { level: 1, name: HEADINGS[path] ?? title }),
    ).toBeInTheDocument();
    expect(document.title).toBe(`${title} · SafeHer`);
  });

  it.each(['/geographic-explorer', '/crime-map'])('redirects %s to the Crime Map', async (path) => {
    const { router } = renderAt(path);
    expect(await screen.findByRole('heading', { level: 1, name: 'Crime Map' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });

  it('shows a not-found page inside the layout for unknown addresses', () => {
    renderAt('/no-such-page');
    expect(pageHeading('Page not found')).toBeInTheDocument();
    expect(mainNav()).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Return to the Crime Map' })).toHaveAttribute('href', '/');
  });
});

describe('navigation', () => {
  it('lists Crime Map and Crime Trends under Explore, and Data & Sources and Methodology under Information', () => {
    renderAt('/crime-trends');
    const nav = mainNav();
    expect(within(nav).getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Explore', 'Information']);
    const links = within(nav).getAllByRole('link');
    expect(links.map((link) => [link.getAttribute('href'), link.textContent])).toEqual(navPages);
  });

  it('does not list Overview, Crime Categories or Metro Comparison', () => {
    renderAt('/crime-trends');
    const nav = within(mainNav());
    for (const [, title] of unlistedPages) expect(nav.queryByRole('link', { name: title })).toBeNull();
  });

  it('navigates, marks the current page and moves focus to the content', async () => {
    const user = userEvent.setup();
    renderAt('/methodology');
    const nav = within(mainNav());

    await user.click(nav.getByRole('link', { name: 'Crime Trends' }));

    expect(pageHeading('Crime Trends')).toBeInTheDocument();
    expect(nav.getByRole('link', { name: 'Crime Trends' })).toHaveAttribute('aria-current', 'page');
    expect(nav.getByRole('link', { name: 'Crime Map' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('marks Crime Map as current on the homepage', () => {
    renderAt('/');
    expect(within(mainNav()).getByRole('link', { name: 'Crime Map' })).toHaveAttribute('aria-current', 'page');
  });
});

describe('standard pages: mobile menu', () => {
  it('opens, blocks the page behind it and closes after navigating', async () => {
    const user = userEvent.setup();
    renderAt('/crime-trends');

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById('main-content')).toHaveAttribute('inert');

    await user.click(within(mainNav()).getByRole('link', { name: 'Methodology' }));
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('main-content')).not.toHaveAttribute('inert');
  });

  it('closes on Escape and returns focus to the menu button', async () => {
    const user = userEvent.setup();
    renderAt('/crime-trends');

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.keyboard('{Escape}');

    const button = screen.getByRole('button', { name: 'Open menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });
});

describe('Crime Map: auto-hiding navigation on wide screens', () => {
  it('starts hidden and unfocusable, with only an edge handle showing', () => {
    renderAt('/');
    expect(shell()).toHaveAttribute('data-nav', 'hidden');
    expect(sidebar()).toHaveAttribute('inert');
    expect(screen.getByRole('button', { name: 'Show navigation' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Open menu' })).toBeNull();
    expect(document.getElementById('main-content')).not.toHaveAttribute('inert');
  });

  it('slides in when the pointer reaches the left edge, and stays open while moving into it', async () => {
    renderAt('/');
    fireEvent.mouseEnter(screen.getByTestId('nav-edge'));
    await waitFor(() => expect(shell()).toHaveAttribute('data-nav', 'overlay'));
    expect(sidebar()).not.toHaveAttribute('inert');

    // From the edge handle into a link: the pointer never leaves the navigation region.
    const handle = screen.getByRole('button', { name: 'Hide navigation' });
    const link = within(mainNav()).getByRole('link', { name: 'Methodology' });
    fireEvent.mouseOut(handle, { relatedTarget: link });
    fireEvent.mouseOver(link, { relatedTarget: handle });
    await wait(400);
    expect(shell()).toHaveAttribute('data-nav', 'overlay');

    // Leaving it for the map hides it again.
    fireEvent.mouseLeave(link, { relatedTarget: document.body });
    await waitFor(() => expect(shell()).toHaveAttribute('data-nav', 'hidden'));
    expect(sidebar()).toHaveAttribute('inert');
  });

  it('stays docked when pinned, and remembers the choice', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('button', { name: 'Show navigation' }));
    await user.click(screen.getByRole('button', { name: 'Pin navigation open' }));

    expect(shell()).toHaveAttribute('data-nav', 'docked');
    expect(screen.getByRole('button', { name: 'Unpin navigation' })).toHaveAttribute('aria-pressed', 'true');
    expect(window.localStorage.getItem(PIN_STORAGE_KEY)).toBe('1');

    fireEvent.mouseLeave(sidebar(), { relatedTarget: document.body });
    await wait(400);
    expect(shell()).toHaveAttribute('data-nav', 'docked');

    await user.click(screen.getByRole('button', { name: 'Unpin navigation' }));
    expect(shell()).toHaveAttribute('data-nav', 'hidden');
    expect(window.localStorage.getItem(PIN_STORAGE_KEY)).toBe('0');
    expect(screen.getByRole('button', { name: 'Show navigation' })).toHaveFocus();
  });

  it('opens and closes from the edge handle, moving focus into the navigation', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('button', { name: 'Show navigation' }));
    expect(shell()).toHaveAttribute('data-nav', 'overlay');
    expect(within(mainNav()).getByRole('link', { name: 'Crime Map' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Hide navigation' }));
    expect(shell()).toHaveAttribute('data-nav', 'hidden');
  });

  it('closes on Escape and returns focus to the handle', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('button', { name: 'Show navigation' }));
    await user.keyboard('{Escape}');
    expect(shell()).toHaveAttribute('data-nav', 'hidden');
    expect(screen.getByRole('button', { name: 'Show navigation' })).toHaveFocus();
  });

  it('closes after choosing a destination, and other pages use the standard layout', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('button', { name: 'Show navigation' }));
    await user.click(within(mainNav()).getByRole('link', { name: 'Crime Trends' }));
    expect(pageHeading('Crime Trends')).toBeInTheDocument();
    expect(sidebar()).not.toHaveAttribute('inert');
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });
});

describe('Crime Map: navigation drawer on narrow and touch screens', () => {
  beforeEach(() => {
    stubNarrowScreen();
  });

  it('does not rely on hover: a menu button opens a modal drawer', async () => {
    const user = userEvent.setup();
    renderAt('/');
    expect(screen.queryByTestId('nav-edge')).toBeNull();
    expect(screen.queryByRole('button', { name: /Pin navigation/ })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Show navigation' }));
    expect(shell()).toHaveAttribute('data-nav', 'drawer');
    expect(document.getElementById('main-content')).toHaveAttribute('inert');
    expect(within(mainNav()).getByRole('link', { name: 'Crime Map' })).toHaveFocus();
  });

  it('closes when tapping outside, returning focus to the menu button', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('button', { name: 'Show navigation' }));
    await user.click(screen.getByTestId('menu-backdrop'));
    expect(shell()).toHaveAttribute('data-nav', 'hidden');
    expect(document.getElementById('main-content')).not.toHaveAttribute('inert');
    expect(screen.getByRole('button', { name: 'Show navigation' })).toHaveFocus();
  });

  it('closes after choosing a destination', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('button', { name: 'Show navigation' }));
    await user.click(within(mainNav()).getByRole('link', { name: 'Methodology' }));
    expect(pageHeading('Methodology')).toBeInTheDocument();
    expect(document.getElementById('main-content')).not.toHaveAttribute('inert');
  });
});

describe('content safeguards', () => {
  // These pages show API figures or API record text by design; their own tests check them.
  const withoutFigures = pages.filter(([path]) => !['/overview', '/crime-trends', '/data-sources'].includes(path));

  it.each(withoutFigures)('%s shows no statistics once loaded', async (path) => {
    renderAt(path);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const text = screen.getByRole('main').textContent;
    expect(text).not.toMatch(/\d{1,3},\d{3}/);
  });
});

describe('methodology page', () => {
  it('explains the limits and is no longer a placeholder', () => {
    renderAt('/methodology');
    const main = screen.getByRole('main');
    expect(main).not.toHaveTextContent('Not built yet');
    for (const name of [
      'Where the annual figures come from',
      'What the reporting unit means',
      'How evidence and validation status are handled',
      'How 2019 was sourced',
      'Why Table 3A.2 is not in production',
      'The police-district crime map',
      'What district figures cannot tell you',
    ]) {
      expect(within(main).getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
    // The map's provenance: source, unit, missing-data rule, boundary licence and the notices.
    expect(main).toHaveTextContent('District-wise Crime against Women');
    expect(main).toHaveTextContent(/never shown as zero, estimated, or filled/);
    expect(main).toHaveTextContent(/All Rights\s+Reserved/);
    expect(main).toHaveTextContent('Registered cases, not proven offences. District-level statistics do not identify individual incident locations. Not a safety score.');
    expect(within(main).getByRole('link', { name: 'Crime Map' })).toHaveAttribute('href', '/');
  });
});

describe('accessibility', () => {
  it.each(pages)('%s has no detectable axe violations once loaded', async (path) => {
    const { container } = renderAt(path);
    await new Promise((resolve) => setTimeout(resolve, 0));
    // Colour contrast needs a real browser layout, which jsdom does not have.
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('offers a skip link to the main content', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main-content');
  });
});
