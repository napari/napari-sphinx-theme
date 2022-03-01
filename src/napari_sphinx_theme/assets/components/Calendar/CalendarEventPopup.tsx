import Divider from '@material-ui/core/Divider';
import { PopperProps } from '@material-ui/core/Popper';
import Event from '@material-ui/icons/Event';
import Info from '@material-ui/icons/Info';
import Label from '@material-ui/icons/Label';
import LocationOn from '@material-ui/icons/LocationOn';
import clsx from 'clsx';
import dayjs from 'dayjs';
import dompurify from 'dompurify';
import FocusTrap from 'focus-trap-react';
import { upperFirst } from 'lodash';
import { ComponentType, forwardRef, useEffect, useState } from 'react';
import { RRule } from 'rrule';

import { Popup } from '@/components/Popup';
import { createUrl, isExternalUrl } from '@/utils/url';

import { FILTER_LABEL_BY_KEY } from './constants';
import { CopyCalendarButton } from './CopyCalendarButton';
import { fetchEvent } from './gapi';
import { CalendarEvent } from './types';
import { formatEventTime } from './utils';

interface CalendarMetadataProps {
  icon: ComponentType;
  label: string;
  html?: boolean;
}

function CalendarMetadata({
  html,
  icon: Icon,
  label: rawLabel,
}: CalendarMetadataProps) {
  let label: string;

  if (html) {
    const zoomDividerIndex = rawLabel.indexOf('──────────');
    label =
      zoomDividerIndex >= 0 ? rawLabel.slice(0, zoomDividerIndex) : rawLabel;
  } else {
    label = rawLabel;
  }

  const labelClassName = 'tw-break-words tw-min-w-[1%] tw-box-border';
  const isUrl = !html && (isExternalUrl(label) || label.startsWith('/'));

  return (
    <li className="tw-flex tw-space-x-1 napari-calendar__popup-metadata">
      <Icon />

      {html && (
        <p
          className={labelClassName}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            // Sanitize HTML before rendering to prevent XSS attacks.
            __html: dompurify.sanitize(label),
          }}
        />
      )}

      {!html && isUrl && (
        <a className={clsx(labelClassName, 'tw-underline')} href={label}>
          {label}
        </a>
      )}

      {!html && !isUrl && <p className={labelClassName}>{label}</p>}
    </li>
  );
}

interface Props extends Omit<PopperProps, 'children' | 'ref'> {
  event: CalendarEvent;
  onClose(): void;
}

/**
 * Component for rendering Google Calendar event information in a popup window.
 */
export const CalendarEventPopup = forwardRef<HTMLDivElement, Props>(
  ({ onClose, event, open, ...props }, ref) => {
    const [recurrence, setRecurrence] = useState<string[]>([]);

    useEffect(() => {
      async function fetchRecurrence() {
        const { calendarId, recurringEventId } = event;

        if (!open || recurrence.length > 0 || !recurringEventId) {
          return;
        }

        const calendarEvent = await fetchEvent(calendarId, recurringEventId);
        const result: string[] = [];

        for (const ruleStr of calendarEvent.recurrence ?? []) {
          try {
            const rule = new RRule({
              ...RRule.parseString(ruleStr),
              dtstart: new Date(),
            });

            result.push(upperFirst(rule.toText()));
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Error parsing rrule:', ruleStr);
          }
        }

        setRecurrence(result);
      }

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchRecurrence();
    }, [event, open, recurrence]);

    const metadata: CalendarMetadataProps[] = [
      {
        icon: Label,
        label: FILTER_LABEL_BY_KEY[event.type],
      },

      ...recurrence.map((label) => ({
        label,
        icon: Event,
      })),

      {
        icon: LocationOn,
        label: event.location,
      },
      {
        icon: Info,
        label: event.description,
        html: true,
      },
    ].filter(({ label }) => label);

    const eventHtmlId = createUrl(event.htmlLink).searchParams.get('eid') ?? '';
    const copyLink = `https://calendar.google.com/calendar/u/0/r/eventedit/copy/${eventHtmlId}`;

    return (
      <Popup
        ref={ref}
        paperClassName="tw-max-w-64 tw-max-h-96 tw-py-1 tw-flex"
        placement="top"
        open={open && !!(!event.recurringEventId || recurrence)}
        {...props}
      >
        <FocusTrap focusTrapOptions={{ onDeactivate: onClose }}>
          <div className="tw-flex tw-flex-col tw-space-y-2 tw-overflow-y-auto tw-py-4 tw-px-5">
            <p className="tw-font-bold tw-uppercase">
              {event.start.format('dddd MMM D')}
            </p>
            <p className="tw-font-bold">
              {formatEventTime(event.start)}–{formatEventTime(event.end)}{' '}
              {dayjs().format('z')}
            </p>

            <h2 className="tw-text-2xl tw-font-bold">{event.title}</h2>

            <ul className="tw-space-y-2 tw-p-0">
              {metadata
                .filter(({ label }) => label)
                .map((metadataProps) => (
                  <CalendarMetadata
                    {...metadataProps}
                    key={metadataProps.label}
                  />
                ))}
            </ul>

            <Divider />

            <div>
              <CopyCalendarButton href={copyLink}>
                Copy event to calendar
              </CopyCalendarButton>
            </div>
          </div>
        </FocusTrap>
      </Popup>
    );
  },
);
