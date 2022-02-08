import '@/scss/napari.scss';
import '@/utils/setupDayjsPlugins';

import { render } from 'react-dom';

import { Calendar } from '@/components/Calendar';

export function main() {
  const calendarNodes = Array.from(
    document.querySelectorAll('[data-component=calendar]'),
  );

  calendarNodes.forEach((node) => render(<Calendar />, node));
}

document.addEventListener('DOMContentLoaded', main);
