import Button, { ButtonProps } from '@material-ui/core/Button';
import AddCircle from '@material-ui/icons/AddCircle';

import { Link } from '@/components/Link';

export function CopyCalendarButton({ children, href, ...props }: ButtonProps) {
  return (
    <Button
      classes={{ label: 'tw-space-x-1' }}
      className="tw-px-0"
      component={href ? Link : 'button'}
      href={href}
      newTab={!!href}
      variant="text"
      {...props}
    >
      <AddCircle className="tw-w-5 tw-h-5" />
      <span className="tw-underline">{children}</span>
    </Button>
  );
}
