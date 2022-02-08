import dayjs from 'dayjs';

export function CalendarFooter() {
  return (
    <span className="tw-flex tw-p-1 tw-bg-white tw-border-t tw-border-black">
      Times shown in {dayjs().format('z')}
    </span>
  );
}
