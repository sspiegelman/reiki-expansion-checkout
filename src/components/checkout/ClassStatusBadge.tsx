/**
 * Component for displaying the status of a class
 */

interface ClassStatusBadgeProps {
  status: 'live-on-date' | 'live-tomorrow' | 'live-today' | 'past';
  small?: boolean;
}

export function ClassStatusBadge({ status, small = false }: ClassStatusBadgeProps) {
  const baseClasses = `inline-flex items-center rounded-full px-${small ? '2' : '3'} py-${small ? '0.5' : '1'} text-${small ? 'xs' : 'sm'} font-medium`;
  
  switch (status) {
    case 'live-on-date':
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
          Upcoming
        </span>
      );
    case 'live-tomorrow':
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          Live Tomorrow!
        </span>
      );
    case 'live-today':
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          Live Today!
        </span>
      );
    case 'past':
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
          Recording Available
        </span>
      );
  }
}
