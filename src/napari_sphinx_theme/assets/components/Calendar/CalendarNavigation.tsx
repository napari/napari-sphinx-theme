import IconButton from '@material-ui/core/IconButton';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import clsx from 'clsx';
import { useSnapshot } from 'valtio';

import { useCalendar } from './context';

interface Props {
  week?: boolean;
}

/**
 * Component that shows the current month and year, and buttons to go the
 * previous / next month.
 */
export function CalendarNavigation({ week: isWeekView }: Props) {
  const { calendarState } = useCalendar();
  const { activeStartDate } = useSnapshot(calendarState);
  const unitType = isWeekView ? 'week' : 'month';

  return (
    <nav
      className={clsx(
        'tw-flex tw-items-center tw-justify-between',
        isWeekView ? 'tw-bg-napari-light' : 'tw-bg-napari-primary',
      )}
    >
      <IconButton
        onClick={() => {
          calendarState.activeStartDate = activeStartDate.subtract(1, unitType);
        }}
      >
        <ChevronLeft className="tw-text-black" />
      </IconButton>

      <span
        className={clsx(
          'tw-font-bold',
          isWeekView ? 'tw-text-base' : 'tw-text-3xl',
        )}
      >
        {isWeekView
          ? [
              activeStartDate.startOf('week').format('MMM DD'),
              activeStartDate.endOf('week').format('MMM DD'),
            ].join(' - ')
          : activeStartDate.format('MMMM YYYY')}
      </span>

      <IconButton
        onClick={() => {
          calendarState.activeStartDate = activeStartDate.add(1, unitType);
        }}
      >
        <ChevronRight className="tw-text-black" />
      </IconButton>
    </nav>
  );
}
