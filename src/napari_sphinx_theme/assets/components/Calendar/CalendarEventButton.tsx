import dayjs from 'dayjs';
import { useCallback, useRef, useState } from 'react';
import { useClickAway } from 'react-use';

import { CalendarEventPopup } from './CalendarEventPopup';
import {} from './context';
import { CalendarEvent } from './types';
import { formatEventTime } from './utils';

interface Props {
  date: dayjs.Dayjs;
  event: CalendarEvent;
  width?: number;
}

/**
 * Component for rendering the event time and title as a button that shows a
 * popup with more information about the calendar event.
 */
export function CalendarEventButton({ date, event, width }: Props) {
  const [popupOpen, setPopupOpen] = useState(false);
  const eventButtonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const onClose = useCallback(() => setPopupOpen(false), []);

  useClickAway(popupRef, onClose);

  return (
    <li className="tw-list-none tw-p-0" style={{ width }}>
      <CalendarEventPopup
        anchorEl={eventButtonRef.current}
        event={event}
        open={popupOpen}
        ref={popupRef}
        onClose={onClose}
      />

      <button
        className="tw-flex tw-w-full tw-space-x-1 !tw-bg-[transparent] screen-900:!tw-bg-napari-light tw-border-none"
        style={{ width }}
        onClick={(clickEvent) => {
          clickEvent.preventDefault();
          setPopupOpen(true);
        }}
        type="button"
        ref={eventButtonRef}
      >
        <div className="tw-ml-1 tw-flex tw-space-x-1">
          <span className="tw-font-semibold">{formatEventTime(date)}</span>

          <span className="tw-overflow-ellipsis tw-flex-nowrap tw-text-left">
            {event.title}
          </span>
        </div>
      </button>
    </li>
  );
}
