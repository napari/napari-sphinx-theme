import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Close from '@material-ui/icons/Close';
import FilterList from '@material-ui/icons/FilterList';
import clsx from 'clsx';
import { set } from 'lodash';
import { useCallback, useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import { useSnapshot } from 'valtio';

import { Checkbox as CheckboxIcon } from '@/components/icons';

import { FILTER_LABEL_BY_KEY } from './constants';
import { useCalendar } from './context';
import { FilterKey } from './types';

interface FilterCheckboxProps {
  filterKey: FilterKey;
}

/**
 * Wrapper component over checkboxes that are connected to the filter state by
 * the `filterKey` prop.
 */
function FilterCheckbox({ filterKey }: FilterCheckboxProps) {
  const { calendarState } = useCalendar();
  const checked = useSnapshot(calendarState).filters[filterKey];

  return (
    <FormControlLabel
      className="tw-m-0 tw-flex tw-items-center"
      control={
        <Checkbox
          checkedIcon={<CheckboxIcon checked />}
          icon={<CheckboxIcon />}
          color="primary"
          checked={checked}
          onChange={(event) =>
            set(calendarState.filters, filterKey, event.target.checked)
          }
        />
      }
      classes={{ label: 'font-semibold' }}
      label={FILTER_LABEL_BY_KEY[filterKey]}
    />
  );
}

const ENABLED_FILTERS: FilterKey[] = ['community', 'workingGroup', 'other'];

/**
 * Component that renders the filter toolbar above the calendar. This component
 * is used for filtering events by a specific type.
 */
export function CalendarFilter() {
  const [open, setOpen] = useState(false);
  const [popupWidth, setPopupWidth] = useState<string | number>('100%');
  const anchorElRef = useRef<HTMLDivElement>(null);
  const paperElRef = useRef<HTMLDivElement>(null);

  const closeFilter = useCallback(() => setOpen(false), []);

  useClickAway(paperElRef, closeFilter);

  const filterBody = (
    <div
      className={clsx(
        'tw-flex tw-flex-col tw-col-start-2',
        'tw-items-start tw-w-full',
        'screen-900:tw-items-center screen-900:tw-flex-row screen-900:tw-space-x-2',
      )}
    >
      <span className="tw-font-semibold tw-ml-2 screen-900:tw-m-0">show:</span>

      {ENABLED_FILTERS.map((filterKey) => (
        <FilterCheckbox filterKey={filterKey} key={filterKey} />
      ))}
    </div>
  );

  return (
    <div className="tw-flex tw-py-3 tw-px-6 screen-900:tw-justify-center">
      <div
        className={clsx(
          'tw-grid tw-grid-cols-[2rem,1fr,min-content] tw-items-center tw-w-full',
          'screen-900:tw-w-max screen-900:tw-space-x-2',
          'screen-900:tw-flex screen-900:tw-flex-row',
        )}
        ref={anchorElRef}
      >
        <div className="screen-900:tw-hidden">
          <FilterList className="tw-w-4 tw-h-4" />
        </div>

        <div className="screen-900:tw-hidden">
          <Button
            classes={{
              label: 'tw-underline tw-font-normal',
            }}
            onClick={() => {
              setOpen((prev) => !prev);
              const width = anchorElRef.current?.parentElement?.offsetWidth;

              if (width) {
                setPopupWidth(width);
              }
            }}
            variant="text"
          >
            filter events
          </Button>
        </div>

        <div className="screen-900:tw-hidden tw-justify-self-end">
          <IconButton
            className={clsx(open || 'tw-opacity-0')}
            onClick={closeFilter}
          >
            <Close className="tw-text-black" />
          </IconButton>
        </div>

        <div className="screen-900:tw-hidden">
          <Popper open={open} anchorEl={anchorElRef.current}>
            <Paper
              className={clsx(
                'tw-grid tw-grid-cols-[2rem,1fr,min-content]',
                'tw-items-center tw-px-6 tw-py-5',
                'napari-calendar__popup',
              )}
              ref={paperElRef}
              elevation={0}
              style={{
                width: popupWidth,
              }}
            >
              {filterBody}
            </Paper>
          </Popper>
        </div>

        <div className="tw-hidden screen-900:tw-flex">{filterBody}</div>
      </div>
    </div>
  );
}
