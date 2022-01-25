import { CalendarFooter } from './CalendarFooter';
import { CalendarMonthView } from './CalendarMonthView';
import { CalendarNavigation } from './CalendarNavigation';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarFilter } from './CalenderFilter';
import { CalendarProvider } from './context';
import { CopyCalendarButton } from './CopyCalendarButton';

/**
 * Component for showing napari Google Calendar events with controls for
 * filtering and copying events to the user's calendar.
 *
 * For screens smaller than 900px, a week view is rendered with events for the
 * current week. Otherwise, a month view is used.
 */
export function Calendar() {
  return (
    <div className="flex flex-col flex-1 items-stretch">
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

        <div className="flex flex-col flex-1 items-stretch border border-napari-light">
          <CalendarNavigation />

          <div className="screen-900:hidden">
            <CalendarNavigation week />
          </div>

          <CalendarFilter />

          <div className="hidden screen-900:flex flex-col flex-1 items-stretch">
            <CalendarMonthView />
          </div>

          <div className="screen-900:hidden">
            <CalendarWeekView />
          </div>

          <CalendarFooter />
        </div>
      </CalendarProvider>
    </div>
  );
}
