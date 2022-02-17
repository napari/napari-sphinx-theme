import '@/scss/napari.scss';
import '@/utils/setupDayjsPlugins';

import { last, throttle } from 'lodash';
import { render } from 'react-dom';

import { Calendar } from '@/components/Calendar';

const HIGHLIGHT_HEADER_THROTTLE_MS = 100;

/**
 * Applies the `active-link` to the deepest child link in the active link
 * hierarchy. This depends on Bootstrap scroll spy adding the `active` class to
 * the TOC links. This is required because for napari, we only want to highlight
 * only the current link and not its parents.
 */
function highlightActiveLink() {
  let prevLink: Element | null = null;

  function highlight() {
    const activeLinks = Array.from(
      document.querySelectorAll('#bd-toc-nav a.active'),
    );

    if (activeLinks.length === 0) {
      return;
    }

    const activeChildLink = last(activeLinks) ?? null;
    prevLink?.classList.remove('active-child');
    activeChildLink?.classList.add('active-child');
    prevLink = activeChildLink;
  }

  window.addEventListener(
    'scroll',
    throttle(highlight, HIGHLIGHT_HEADER_THROTTLE_MS),
  );

  // Wait a bit before highlighting to give time for the Bootstrap scrollspy to
  // kick in.
  setTimeout(highlight, 200);
}

/**
 * Links that have inline code in it experience an issue with underlining where
 * there are spaces between the underline. This is because the inline code uses
 * a wrapper `code` element, which breaks up the flow of the underline. To fix
 * this, we replace the code element with its children.
 */
function fixCodeLinks() {
  const codeLinks = Array.from(document.querySelectorAll('a > code'));

  for (const codeLink of codeLinks) {
    codeLink.replaceWith(...codeLink.childNodes);
  }
}

function main() {
  const calendarNodes = Array.from(
    document.querySelectorAll('[data-component=calendar]'),
  );

  calendarNodes.forEach((node) => render(<Calendar />, node));

  highlightActiveLink();
  fixCodeLinks();
}

document.addEventListener('DOMContentLoaded', main);
