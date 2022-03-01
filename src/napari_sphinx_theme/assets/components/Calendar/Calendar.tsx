import { CalendarFooter } from './CalendarFooter';
import { CalendarMonthView } from './CalendarMonthView';
import { CalendarNavigation } from './CalendarNavigation';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarFilter } from './CalenderFilter';
import { CalendarProvider } from './context';
import { CopyCalendarButton } from './CopyCalendarButton';

interface Props {
  filter?: boolean;
}

/**
 * Component for showing napari Google Calendar events with controls for
 * filtering and copying events to the user's calendar.
 *
 * For screens smaller than 900px, a week view is rendered with events for the
 * current week. Otherwise, a month view is used.
 */
export function Calendar({ filter }: Props) {
  return (
    <div className="tw-flex tw-flex-col tw-flex-1 tw-items-stretch">
      <CalendarProvider>
        <div>
          <CopyCalendarButton
            href={`https://calendar.google.com/calendar/u/0/r?cid=${
              process.env.GOOGLE_CALENDAR_ID ?? ''
            }`}
          >
            Copy to calendar
          </CopyCalendarButton>
        </div>

        <div className="tw-flex tw-flex-col tw-flex-1 tw-items-stretch napari-calendar__container">
          <CalendarNavigation />

          <div className="screen-900:tw-hidden">
            <CalendarNavigation week />
          </div>

          {filter && <CalendarFilter />}

          <div className="tw-hidden screen-900:tw-flex tw-flex-col tw-flex-1 tw-items-stretch">
            <CalendarMonthView />
          </div>

          <div className="screen-900:tw-hidden">
            <CalendarWeekView />
          </div>

          <CalendarFooter />
        </div>
      </CalendarProvider>
    </div>
  );
}
