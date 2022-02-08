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
  const anchorElRef = useRef<HTMLDivElement>(null);
  const paperElRef = useRef<HTMLDivElement>(null);

  const closeFilter = useCallback(() => setOpen(false), []);

  useClickAway(paperElRef, closeFilter);

  const filterBody = (
    <div
      className={clsx(
        'flex flex-col col-start-2',
        'justify-center w-full',
        'screen-900:flex-row screen-900:space-x-2',
      )}
    >
      <span className="font-semibold">show:</span>

      {ENABLED_FILTERS.map((filterKey) => (
        <FilterCheckbox filterKey={filterKey} key={filterKey} />
      ))}
    </div>
  );

  return (
    <div className="flex py-3 px-6 screen-900:justify-center">
      <div
        className={clsx(
          'grid grid-cols-[2rem,1fr,min-content] items-center w-full',
          'screen-900:w-max screen-900:space-x-2',
          'screen-900:flex screen-900:flex-row',
        )}
        ref={anchorElRef}
      >
        <div className="screen-900:hidden">
          <FilterList className="w-4 h-4" />
        </div>

        <div className="screen-900:hidden">
          <Button
            classes={{
              label: 'underline',
            }}
            onClick={() => setOpen((prev) => !prev)}
            variant="text"
          >
            filter events
          </Button>
        </div>

        <div className="screen-900:hidden justify-self-end">
          <IconButton
            className={clsx(open || 'opacity-0')}
            onClick={closeFilter}
          >
            <Close className="text-black" />
          </IconButton>
        </div>

        <div className="screen-900:hidden">
          <Popper open={open} anchorEl={anchorElRef.current}>
            <Paper
              className={clsx(
                'grid grid-cols-[2rem,1fr,min-content]',
                'items-center px-9',
                'naapri-calendar__popup',
              )}
              ref={paperElRef}
              elevation={0}
            >
              {filterBody}
            </Paper>
          </Popper>
        </div>

        <div className="hidden screen-900:flex">{filterBody}</div>
      </div>
    </div>
  );
}
