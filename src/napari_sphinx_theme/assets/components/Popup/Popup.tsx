import Paper from '@material-ui/core/Paper';
import Popper, { PopperProps } from '@material-ui/core/Popper';
import makeStyles from '@material-ui/styles/makeStyles';
import clsx from 'clsx';
import { forwardRef, useState } from 'react';

import { PopupArrow } from '@/components/icons';

interface Props extends PopperProps {
  paperClassName?: string;
}

interface PopperEvent {
  flipped: boolean;
}

const useStyles = makeStyles({
  flipped: {
    transform: 'rotate(180deg)',
  },
});

/**
 * Component for rendering popups. This includes an arrow that centers around
 * the anchor element.
 */
export const Popup = forwardRef<HTMLDivElement, Props>(
  ({ children, paperClassName, ...props }, ref) => {
    // State to flip the popup arrow if the popper state is flipped.
    const [flipped, setFlipped] = useState(false);
    const classes = useStyles();

    return (
      <Popper
        {...props}
        ref={ref}
        popperOptions={{
          onUpdate(data: PopperEvent) {
            if (flipped !== data.flipped) {
              setFlipped(data.flipped);
            }
          },
        }}
      >
        <div className="tw-flex tw-flex-col tw-items-center">
          {flipped && <PopupArrow className="tw-z-10 " />}

          <Paper
            className={clsx(
              paperClassName,
              'tw-border tw-border-solid tw-border-napari-gray tw--mt-px',
              flipped ? 'tw--mt-px' : 'tw--mb-px',
            )}
          >
            {children}
          </Paper>

          {!flipped && (
            <PopupArrow className={clsx('tw-z-10', classes.flipped)} />
          )}
        </div>
      </Popper>
    );
  },
);
