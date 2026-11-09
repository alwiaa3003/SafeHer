import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { OVERVIEW_HEADING } from '../pages/OverviewPage';
import { routes } from './routes';

const pages = [
  ['/', 'Overview'],
  ['/crime-trends', 'Crime Trends'],
  ['/crime-categories', 'Crime Categories'],
  ['/metro-comparison', 'Metro Comparison'],
  ['/geographic-explorer', 'Geographic Explorer'],
  ['/data-sources', 'Data Sources'],
  ['/methodology', 'Methodology'],
];

function renderAt(path) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

const mainNav = () => screen.getByRole('navigation', { name: 'Main' });
const pageHeading = (name) =>
  screen.getByRole('heading', { level: 1, name });

describe('routing', () => {
  it.each(pages)('renders %s as %s and sets the tab title', (path, title) => {
    renderAt(path);
    expect(
      pageHeading(path === '/' ? OVERVIEW_HEADING : title),
    ).toBeInTheDocument();
    expect(document.title).toBe(`${title} · SafeHer`);
  });

  it('shows a not-found page inside the layout for unknown addresses', () => {
    renderAt('/no-such-page');
    expect(pageHeading('Page not found')).toBeInTheDocument();
    expect(mainNav()).toBeInTheDocument();
  });
});

describe('sidebar', () => {
  it('links to all seven pages', () => {
    renderAt('/');
    const links = within(mainNav()).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual(
      pages.map(([, title]) => title),
    );
  });

  it('navigates, marks the current page and moves focus to the content', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const nav = within(mainNav());

    await user.click(nav.getByRole('link', { name: 'Crime Trends' }));

    expect(pageHeading('Crime Trends')).toBeInTheDocument();
    expect(nav.getByRole('link', { name: 'Crime Trends' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(nav.getByRole('link', { name: 'Overview' })).not.toHaveAttribute(
      'aria-current',
    );
    expect(screen.getByRole('main')).toHaveFocus();
  });
});

describe('mobile menu', () => {
  it('opens, blocks the page behind it and closes after navigating', async () => {
    const user = userEvent.setup();
    renderAt('/');

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(
      screen.getByRole('button', { name: 'Close menu' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById('main-content')).toHaveAttribute('inert');

    await user.click(
      within(mainNav()).getByRole('link', { name: 'Methodology' }),
    );
    expect(
      screen.getByRole('button', { name: 'Open menu' }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('main-content')).not.toHaveAttribute(
      'inert',
    );
  });

  it('closes on Escape and returns focus to the menu button', async () => {
    const user = userEvent.setup();
    renderAt('/');

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.keyboard('{Escape}');

    const button = screen.getByRole('button', { name: 'Open menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });
});

describe('content safeguards', () => {
  const pageShells = pages.filter(([path]) => path !== '/');

  it.each(pageShells)('%s page shell shows no statistics', (path) => {
    renderAt(path);
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
      'Why 2019 is missing',
      'Why Table 3A.2 is not in production',
      'Why the Geographic Explorer shows no crime values',
      'Why district-level conclusions cannot be made',
    ]) {
      expect(within(main).getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });
});

describe('accessibility', () => {
  it.each(pages)('%s has no detectable axe violations', async (path) => {
    const { container } = renderAt(path);
    // Colour contrast needs a real browser layout, which jsdom does not have.
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('offers a skip link to the main content', () => {
    renderAt('/');
    expect(
      screen.getByRole('link', { name: 'Skip to content' }),
    ).toHaveAttribute('href', '#main-content');
  });
});
