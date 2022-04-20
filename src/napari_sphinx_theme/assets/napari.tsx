import '@/scss/napari.scss';
import '@/utils/setupDayjsPlugins';

import StylesProvider from '@material-ui/styles/StylesProvider';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import { ReactNode } from 'react';
import { render } from 'react-dom';

import { Calendar } from '@/components/Calendar';
import { Close, Menu, Search } from '@/components/icons';
import { theme } from '@/theme';

function MaterialUIProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <StylesProvider injectFirst>{children}</StylesProvider>
    </ThemeProvider>
  );
}

function setParentTocVisible(link: Element | null, open: boolean) {
  if (!link) return;
  const nav = document.querySelector('#bd-toc-nav');

  function toggleVisible(node: Element) {
    if (open) {
      node.classList.add('visible');
    } else {
      node.classList.remove('visible');
    }
  }

  if (link.nextElementSibling?.classList.contains('nav')) {
    toggleVisible(link.nextElementSibling);
  }

  let node: Element | null = link;
  while (node !== nav) {
    if (node?.classList.contains('nav')) {
      toggleVisible(node);
    }

    node = node?.parentElement ?? null;
  }
}

function highlightActivePageTocItem() {
  const headerLinks = Array.from(document.querySelectorAll('#bd-toc-nav a'));
  const headerLinkMap = new Map<string, Element>();
  const headers: Element[] = [];

  for (const headerLink of headerLinks) {
    const headerId = headerLink.getAttribute('href');

    if (headerId) {
      headerLinkMap.set(headerId, headerLink);
      const header = document.querySelector(headerId);
      if (header) {
        headers.push(header);
      }
    }
  }

  const appBarHeight = document.querySelector('.navbar')?.clientHeight ?? 0;

  const initialHeader = window.location.hash;
  let activeHeaderIndex = headers.findIndex(
    (header) => header.id === initialHeader.slice(1),
  );
  let activeHeader = initialHeader
    ? document.querySelector(initialHeader)
    : null;
  let activeLink = headerLinkMap.get(initialHeader);

  if (activeLink) {
    activeLink.classList.add('active');
    setParentTocVisible(activeLink, true);
  }

  function highlight() {
    const firstHeaderIndex = headers.findIndex(
      (header) => header.getBoundingClientRect().top > appBarHeight + 16,
    );
    const firstHeaderInViewport = headers[firstHeaderIndex];

    if (!firstHeaderInViewport) return;

    if (
      firstHeaderInViewport.getBoundingClientRect().top <
      appBarHeight + 16 + 32
    ) {
      activeHeader = firstHeaderInViewport;
      activeHeaderIndex = firstHeaderIndex;
    } else {
      activeHeaderIndex = firstHeaderIndex - 1;
      activeHeader = headers[activeHeaderIndex];
    }

    if (activeLink?.classList.contains('active')) {
      activeLink?.classList.remove('active');
      setParentTocVisible(activeLink, false);
    }

    activeLink = headerLinkMap.get(`#${activeHeader.id}`);

    if (activeLink && !activeLink?.classList.contains('active')) {
      activeLink?.classList.add('active');
      setParentTocVisible(activeLink, true);
    }
  }

  window.addEventListener('scroll', highlight);
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

/**
 * We have design right now that asks for the footer item to stay attached to
 * the right part of the footer. Since CSS is cascading, we can't apply styling
 * to a parent element due to the existence of a child element, so we need to do
 * it in JS.
 */
function addNapariFooterItemClass() {
  const napariCopyright = document.querySelector(
    '.napari-footer .napari-copyright',
  );

  if (napariCopyright) {
    napariCopyright.parentElement?.classList.add(
      'footer-item--with-napari-copyright',
    );
  }
}

function addInPageTocInteractivity() {
  const pageTocs = Array.from(document.querySelectorAll('.contents > ul'));

  function addTocLevelClass(node: Element, level = 1) {
    node.classList.add(`toc-l${level}`);

    Array.from(node.querySelectorAll(':scope > li > ul')).forEach((list) =>
      addTocLevelClass(list, level + 1),
    );
  }

  for (const toc of pageTocs) {
    addTocLevelClass(toc);
  }
}

function addVersionIcons() {
  function addIcons(type: 'added' | 'changed' | 'deprecated', icon: ReactNode) {
    const containers = Array.from(
      document.querySelectorAll(`.versionmodified.${type}`),
    );

    containers.forEach((container) =>
      render(
        <>
          {icon}
          <span>{container.textContent}</span>
        </>,
        container,
      ),
    );
  }

  const newVersionIcon = (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.49908 1.65512L9.95566 3.33551L10.3194 3.75516L10.8679 3.66818L13.0648 3.3198L13.1039 5.54044L13.1137 6.09516L13.5895 6.38048L15.4975 7.52455L14.093 9.25617L13.7431 9.68746L13.9243 10.2124L14.6487 12.311L12.468 12.7337L11.923 12.8393L11.7244 13.3578L10.9285 15.4366L8.98578 14.3569L8.5 14.0869L8.01422 14.3569L6.07001 15.4374L5.26964 13.3564L5.07068 12.8391L4.52656 12.7337L2.34586 12.311L3.07027 10.2124L3.2512 9.68823L2.90243 9.25713L1.50131 7.52529L3.41052 6.38048L3.88724 6.09462L3.89613 5.53884L3.93163 3.32009L6.12669 3.66818L6.67442 3.75503L7.03816 3.33642L8.49908 1.65512Z"
        stroke="black"
        strokeWidth="2"
        strokeMiterlimit="10"
      />
    </svg>
  );
  const changedIcon = (
    <svg
      width="15"
      height="19"
      viewBox="0 0 15 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.09629 15.2467C5.15929 15.0452 4.28581 14.6175 3.55204 14.0009C2.81826 13.3844 2.24647 12.5977 1.88652 11.7094C1.52658 10.8211 1.38942 9.85827 1.487 8.90483C1.58459 7.95139 1.91394 7.0363 2.44636 6.23936"
        stroke="black"
        strokeWidth="2"
        strokeMiterlimit="10"
      />
      <path
        d="M5.65749 17.9298L5.80979 12.4373L8.47721 15.2579L5.65749 17.9298Z"
        fill="black"
      />
      <path
        d="M8.54294 3.7498C9.47994 3.95131 10.3534 4.37899 11.0872 4.99555C11.821 5.61212 12.3928 6.39884 12.7527 7.28711C13.1127 8.17537 13.2498 9.13821 13.1522 10.0917C13.0546 11.0451 12.7253 11.9602 12.1929 12.7571"
        stroke="black"
        strokeWidth="2"
        strokeMiterlimit="10"
      />
      <path
        d="M8.98598 1.07007L8.83279 6.55809L6.16537 3.73748L8.98598 1.07007Z"
        fill="black"
      />
      <path
        d="M6.73219 15.345C5.7241 15.2435 4.75939 14.8829 3.93179 14.2984C3.10419 13.7139 2.44182 12.9253 2.00901 12.0092C1.5762 11.0931 1.38767 10.0806 1.46173 9.07016C1.53579 8.05967 1.86992 7.08551 2.43167 6.2423"
        stroke="black"
        strokeWidth="2"
        strokeMiterlimit="10"
      />
      <path
        d="M8.02777 3.66483C9.02361 3.78551 9.97196 4.15917 10.7825 4.75021C11.593 5.34124 12.2387 6.12997 12.658 7.04125C13.0773 7.95253 13.2564 8.95599 13.178 9.95606C13.0997 10.9561 12.7665 11.9195 12.2104 12.7543"
        stroke="black"
        strokeWidth="2"
        strokeMiterlimit="10"
      />
    </svg>
  );

  const deperecatedIcon = (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 5.39257L5.39257 1H11.6074L16 5.39257V11.6074L11.6074 16H5.39257L1 11.6074V5.39257Z"
        stroke="black"
        strokeWidth="2"
        strokeMiterlimit="10"
      />
      <path
        d="M7.792 10.14C7.74533 10.14 7.70333 10.126 7.666 10.098C7.638 10.0607 7.624 10.0187 7.624 9.972L7.442 3.868C7.442 3.82133 7.456 3.784 7.484 3.756C7.52133 3.71867 7.56333 3.7 7.61 3.7H9.248C9.29467 3.7 9.332 3.71867 9.36 3.756C9.39733 3.784 9.416 3.82133 9.416 3.868L9.206 9.972C9.206 10.0187 9.18733 10.0607 9.15 10.098C9.122 10.126 9.08467 10.14 9.038 10.14H7.792ZM8.338 13.486C8.02067 13.486 7.75467 13.3833 7.54 13.178C7.33467 12.9633 7.232 12.6973 7.232 12.38C7.232 12.0533 7.33467 11.7873 7.54 11.582C7.74533 11.3767 8.01133 11.274 8.338 11.274C8.66467 11.274 8.926 11.3767 9.122 11.582C9.32733 11.7873 9.43 12.0533 9.43 12.38C9.43 12.6973 9.32733 12.9633 9.122 13.178C8.91667 13.3833 8.65533 13.486 8.338 13.486Z"
        fill="black"
      />
    </svg>
  );

  addIcons('added', newVersionIcon);
  addIcons('changed', changedIcon);
  addIcons('deprecated', deperecatedIcon);
}

function replaceSidebarIcons() {
  const sidebarExternalLinks = Array.from(
    document.querySelectorAll('.bd-sidebar a.external'),
  );

  for (const link of sidebarExternalLinks) {
    render(
      <>
        <span>{link.textContent}</span>

        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="12" height="12" fill="white" />
          <path
            d="M6.42858 0.857143H0.857147V11.1429H11.1429V6"
            stroke="black"
            strokeWidth="1.5"
          />
          <path
            d="M7.71428 0.857143H11.1429V4.28571"
            stroke="black"
            strokeWidth="1.5"
          />
          <path
            d="M11.1429 0.857143L4.28572 7.71429"
            stroke="black"
            strokeWidth="1.5"
          />
        </svg>
      </>,

      link,
    );
  }
}

function renderCalendars() {
  const calendarNodes = Array.from(
    document.querySelectorAll('.napari-calendar'),
  );

  calendarNodes.forEach((node) =>
    render(
      <MaterialUIProvider>
        <Calendar filter={node.classList.contains('show-filters')} />
      </MaterialUIProvider>,
      node,
    ),
  );
}

function fixSearchInput() {
  const searchInput = document.querySelector('input[type=search]');
  searchInput?.setAttribute('type', 'text');
}

function fixSearchContainer() {
  const oldSearchButton = document.querySelector<HTMLInputElement>(
    '#search-documentation ~ form > input[type=submit]',
  );
  const searchButton = document.createElement('button');
  searchButton.classList.add('search-button');

  if (oldSearchButton) {
    oldSearchButton.replaceWith(searchButton);
    render(<Search />, searchButton);
  }

  const searchTitle = document.querySelector('#search-results > h2');
  const searchSummary = document.querySelector(
    '#search-results > .search-summary',
  );

  if (searchTitle && searchSummary) {
    const infoContainer = document.createElement('div');
    infoContainer.classList.add('search-info');

    searchTitle.remove();
    searchSummary.remove();

    infoContainer.append(searchTitle);
    infoContainer.append(searchSummary);

    const searchResults = document.querySelector('#search-results');
    searchResults?.prepend(infoContainer);
  }
}

function fixSearchText() {
  const searchTitle = document.querySelector('.search-info > h2');
  const searchSummary = document.querySelector(
    '.search-info > .search-summary',
  );

  if (searchTitle) {
    searchTitle.textContent = 'Results';

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes?.[0]?.textContent === 'Search Results') {
          searchTitle.textContent = 'Results';
        }
      }
    });

    observer.observe(searchTitle, { childList: true });
  }

  if (searchSummary) {
    searchSummary.textContent =
      '0 matching pages found. Please make sure that all words are spelled correctly.';

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const match = /Search finished, found ([\d]+) page/.exec(
          mutation.addedNodes?.[0]?.textContent ?? '',
        );

        if (match) {
          const count = +match[1];
          searchSummary.textContent = `${count} matching pages found`;
        }
      }
    });

    observer.observe(searchSummary, { childList: true });
  }
}

function fixSearchResults() {
  const searchResults = document.querySelector('ul.search');

  if (searchResults) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const result = mutation.addedNodes?.[0] as Element | null;

        if (result) {
          const icon = (
            <svg
              width="13"
              height="16"
              viewBox="0 0 13 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1.22656H7L12 6.22656V15.2266H1V1.22656Z"
                stroke="black"
              />
              <path d="M6.5 0.726562V6.72656H12.5" stroke="black" />
            </svg>
          );
          const iconContainer = document.createElement('span');

          render(icon, iconContainer);
          result.prepend(iconContainer);
        }
      }
    });

    observer.observe(searchResults, { childList: true });
  }
}

function renderAppBarMenuButton() {
  const menuButton = document.querySelector('.navbar-toggler');

  if (menuButton) {
    render(<Menu />, menuButton);

    const observer = new MutationObserver((mutations) =>
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          if (menuButton.classList.contains('collapsed')) {
            render(<Menu />, menuButton);
          } else {
            render(<Close />, menuButton);
          }
        }
      }),
    );

    observer.observe(menuButton, {
      attributes: true,
    });
  }
}

function addClassToCodeBlocksWithLineNumbers() {
  Array.from(document.querySelectorAll('.highlight')).forEach(
    (el) => el.querySelector('.linenos') && el.classList.add('line-numbers'),
  );
}

function addAutoLoopAndControlsToVideos() {
  // Videos can be included with the image or figure directives, but the element
  // has no attributes, which can make them look like still images.
  Array.from(document.getElementsByTagName('video')).forEach((e) => {
    e.setAttribute('controls', '');
    e.setAttribute('autoplay', '');
    e.setAttribute('loop', '');
    e.setAttribute('muted', '');
  });
}

function main() {
  highlightActivePageTocItem();
  fixCodeLinks();
  addNapariFooterItemClass();
  addInPageTocInteractivity();
  addVersionIcons();
  replaceSidebarIcons();
  renderCalendars();
  renderAppBarMenuButton();
  addClassToCodeBlocksWithLineNumbers();
  addAutoLoopAndControlsToVideos();
  // Wrap in setTimeout so that it runs after sphinx search JS.
  setTimeout(fixSearchInput);
  setTimeout(fixSearchContainer);
  setTimeout(fixSearchText);
  setTimeout(fixSearchResults);
}

document.addEventListener('DOMContentLoaded', main);
