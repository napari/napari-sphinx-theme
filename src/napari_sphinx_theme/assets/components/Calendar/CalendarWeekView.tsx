import clsx from 'clsx';
import dayjs from 'dayjs';
import { ReactNode } from 'react';
import { useSnapshot } from 'valtio';

import { CalendarEventButton } from './CalendarEventButton';
import { useCalendar } from './context';
import { CalendarEvent } from './types';
import { getEventMapKey } from './utils';

interface CalendarDayListProps {
  date: dayjs.Dayjs;
  events: CalendarEvent[];
}

/**
 * Helper component for rendering all events for a specific day as a list.
 */
function CalendarDayList({ date, events }: CalendarDayListProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="tw-flex tw-px-4 napari-calendar__day-list">
      <div className="tw-flex tw-flex-col tw-items-center tw-leading-7">
        <span className="tw-font-bold tw-uppercase">{date.format('ddd')}</span>
        <span
          className={clsx(
            'tw-flex tw-items-center tw-justify-center',
            'tw-w-6 tw-h-6 tw-font-bold',

            date.isSame(dayjs(), 'week') && [
              date.isSame(dayjs(), 'day')
                ? 'tw-bg-napari-primary tw-rounded-full'
                : 'tw-bg-black tw-text-white',
            ],
          )}
        >
          {date.format('DD')}
        </span>
      </div>

      <ul className="tw-mt-4 tw-mb-6 tw-space-y-1 tw-p-0">
        {events.map((event) => (
          <CalendarEventButton
            date={event.start}
            event={event}
            key={event.title + event.start.toString()}
          />
        ))}
      </ul>
    </div>
  );
}

/**
 * Calendar component that shows napari events for the current week.
 */
export function CalendarWeekView() {
  const { calendarState, eventState } = useCalendar();
  const { activeStartDate } = useSnapshot(calendarState);
  const { events } = useSnapshot(eventState);

  const firstDayOfWeek = activeStartDate.startOf('week');
  const lastDayOfWeek = activeStartDate.endOf('week');

  const dayNodes: ReactNode[] = [];

  for (
    let currentDay = firstDayOfWeek;
    currentDay.isSameOrBefore(lastDayOfWeek, 'day');
    currentDay = currentDay.add(1, 'day')
  ) {
    dayNodes.push(
      <CalendarDayList
        key={currentDay.toString()}
        date={currentDay}
        events={(events[getEventMapKey(currentDay)] ?? []) as CalendarEvent[]}
      />,
    );
  }

  return <div className="tw-flex tw-flex-col">{dayNodes}</div>;
}
