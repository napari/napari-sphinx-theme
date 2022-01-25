import '@/scss/napari.scss';
import '@/styles/furo.sass';
import '@/scripts/furo';
import '@/utils/setupDayjsPlugins';

import { Calendar } from '@/components/Calendar';
import { render } from 'react-dom';

export function main() {
  const calendarNodes = Array.from(
    document.querySelectorAll('[data-component=calendar]'),
  );

  calendarNodes.forEach((node) => render(<Calendar />, node));
}

document.addEventListener('DOMContentLoaded', main);
