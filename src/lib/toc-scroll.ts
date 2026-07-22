/** Offset for in-page nav — fixed site header + breathing room. */
export function getTocScrollOffsetPx(): number {
  const header = document.querySelector<HTMLElement>(".site-header");
  const headerPx = header?.getBoundingClientRect().height ?? 56;

  return headerPx + 16;
}

/** Pick the section link that matches what the reader is viewing. */
export function resolveActiveTocHeading(
  ids: string[],
  offsetPx: number,
): string | null {
  let active: string | null = null;

  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) {
      continue;
    }

    const top = el.getBoundingClientRect().top;
    if (top <= offsetPx + 8) {
      active = id;
    } else {
      break;
    }
  }

  if (!active) {
    return null;
  }

  const activeEl = document.getElementById(active);
  if (!activeEl) {
    return active;
  }

  const activeTop = activeEl.getBoundingClientRect().top;
  const activeIndex = ids.indexOf(active);
  const nextId = ids[activeIndex + 1];

  if (nextId && activeTop < 0) {
    const nextEl = document.getElementById(nextId);
    if (nextEl) {
      const nextTop = nextEl.getBoundingClientRect().top;
      if (nextTop <= offsetPx + 80) {
        return nextId;
      }
    }
  }

  return active;
}

export function scrollToTocHeading(id: string): void {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }

  const align = (behavior: ScrollBehavior = "instant") => {
    const offset = getTocScrollOffsetPx();
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior });
  };

  align("smooth");

  // Re-align once layout settles (e.g. auto-hiding header).
  requestAnimationFrame(() => {
    requestAnimationFrame(() => align("instant"));
  });
}
