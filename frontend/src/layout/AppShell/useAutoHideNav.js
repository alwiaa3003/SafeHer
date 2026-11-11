import { useCallback, useEffect, useRef, useState } from 'react';

// Behaviour of the Crime Map's auto-hiding navigation.
// Wide screens: hidden by default. Hovering the left edge (mouse only) or using the edge handle
// reveals it over the map. Pinning docks it beside the map, which then resizes.
// Narrow or touch screens: a menu button opens a modal drawer. Nothing depends on hover.

export const WIDE_QUERY = '(min-width: 801px)';
export const HOVER_QUERY = '(hover: hover) and (pointer: fine)';
export const PIN_STORAGE_KEY = 'safeher.nav.pinned';
const OPEN_DELAY = 90;
const CLOSE_DELAY = 280;

// Without matchMedia (tests, very old browsers) the desktop behaviour is assumed.
function useMedia(query) {
  const read = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : true);
  const [matches, setMatches] = useState(read);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const list = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    list.addEventListener?.('change', onChange);
    return () => list.removeEventListener?.('change', onChange);
  }, [query]);
  return matches;
}

// Storage can be unavailable (private windows, blocked site data). Pinning then lasts for the visit.
function readPinned() {
  try {
    return window.localStorage.getItem(PIN_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writePinned(value) {
  try {
    window.localStorage.setItem(PIN_STORAGE_KEY, value ? '1' : '0');
  } catch {
    // Ignored: see readPinned.
  }
}

function hasVisibleFocus(element) {
  if (!element) return false;
  try {
    return Boolean(element.querySelector(':focus-visible'));
  } catch {
    return false;
  }
}

// The caller owns the refs (the navigation region and its handle), so the returned values
// can be read during render.
export function useAutoHideNav(enabled, { regionRef, handleRef }) {
  const isWide = useMedia(WIDE_QUERY);
  const canHover = useMedia(HOVER_QUERY) && isWide;
  const [pinned, setPinnedState] = useState(readPinned);
  // Records which layout the navigation was opened in, so a resize between
  // desktop and mobile never leaves it open in the wrong mode.
  const [openIn, setOpenIn] = useState(null);
  // Leaving the map (including with the browser's back button) closes an unpinned navigation.
  const [wasEnabled, setWasEnabled] = useState(enabled);
  if (wasEnabled !== enabled) {
    setWasEnabled(enabled);
    if (!enabled) setOpenIn(null);
  }
  const mode = isWide ? 'wide' : 'narrow';
  const open = enabled && openIn === mode;
  const docked = enabled && isWide && pinned;
  const visible = docked || open;
  const modal = open && !isWide;

  const timer = useRef(null);
  const pointerInside = useRef(false);
  // After the user closes it with the mouse still over the edge, hovering must not reopen it
  // until the pointer has left.
  const suppressHover = useRef(false);
  const focusOnOpen = useRef(false);

  const clearTimer = () => {
    clearTimeout(timer.current);
    timer.current = null;
  };

  const close = useCallback(({ restoreFocus = false } = {}) => {
    clearTimer();
    setOpenIn(null);
    if (restoreFocus) handleRef.current?.focus();
  }, [handleRef]);

  const setPinned = (value) => {
    setPinnedState(value);
    writePinned(value);
  };

  useEffect(() => () => clearTimer(), []);

  // When opened from the handle or menu button, keyboard focus moves into the navigation.
  useEffect(() => {
    if (!visible || !focusOnOpen.current) return;
    focusOnOpen.current = false;
    const target = regionRef.current?.querySelector('[aria-current="page"]') ?? regionRef.current?.querySelector('nav a');
    target?.focus();
  }, [visible, regionRef]);

  // Escape closes an unpinned navigation and returns focus to the handle.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') close({ restoreFocus: true });
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  // On wide screens the revealed navigation is not modal: pressing anywhere else closes it.
  // The mobile drawer closes through its backdrop instead, so the tap never reaches the map.
  useEffect(() => {
    if (!open || modal) return undefined;
    const onPointerDown = (event) => {
      if (!regionRef.current?.contains(event.target)) close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, modal, close, regionRef]);

  const edgeProps = {
    onMouseEnter: () => {
      if (!canHover || docked || suppressHover.current) return;
      clearTimer();
      timer.current = setTimeout(() => setOpenIn('wide'), OPEN_DELAY);
    },
  };

  const regionProps = {
    onMouseEnter: () => {
      pointerInside.current = true;
      if (open) clearTimer();
    },
    onMouseLeave: () => {
      pointerInside.current = false;
      suppressHover.current = false;
      if (!canHover || docked) return;
      clearTimer();
      if (!open) return;
      // A keyboard user working inside the navigation keeps it open.
      if (hasVisibleFocus(regionRef.current)) return;
      timer.current = setTimeout(() => setOpenIn(null), CLOSE_DELAY);
    },
    onBlur: (event) => {
      if (!open || modal) return;
      if (regionRef.current?.contains(event.relatedTarget) || pointerInside.current) return;
      close();
    },
  };

  function onHandleClick() {
    clearTimer();
    if (docked) {
      setPinned(false);
      setOpenIn(null);
      suppressHover.current = true;
      return;
    }
    if (open) {
      setOpenIn(null);
      suppressHover.current = true;
      return;
    }
    focusOnOpen.current = true;
    setOpenIn(mode);
  }

  function togglePin() {
    clearTimer();
    setOpenIn(null);
    if (pinned) {
      setPinned(false);
      suppressHover.current = true;
      handleRef.current?.focus();
    } else {
      setPinned(true);
    }
  }

  function onNavigate() {
    if (!docked) close();
  }

  let state = 'hidden';
  if (docked) state = 'docked';
  else if (modal) state = 'drawer';
  else if (open) state = 'overlay';

  return {
    isWide,
    canHover,
    pinned,
    docked,
    visible,
    modal,
    state,
    edgeProps,
    regionProps,
    onHandleClick,
    togglePin,
    onNavigate,
    close,
  };
}
