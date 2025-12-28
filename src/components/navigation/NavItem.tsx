import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: string;
  label: string;
  path: string;
  active?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
}

export function NavItem({ icon, label, path, active, disabled, comingSoon }: NavItemProps) {
  const location = useLocation();
  const isActive = active ?? location.pathname === path;

  if (disabled) {
    return (
      <div
        className={cn(
          'nav-item disabled',
          'flex items-center justify-between'
        )}
        aria-disabled="true"
      >
        <div className="flex items-center gap-3">
          <span className="nav-icon">{icon}</span>
          <span className="nav-label">{label}</span>
        </div>
        {comingSoon && (
          <span className="coming-soon-badge">Coming Soon</span>
        )}
      </div>
    );
  }

  return (
    <Link
      to={path}
      className={cn(
        'nav-item',
        isActive && 'active'
      )}
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </Link>
  );
}