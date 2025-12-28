import { Link } from 'react-router-dom';

interface NavItemProps {
  icon: string;
  label: string;
  path: string | null;
  isActive: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
}

export function NavItem({ icon, label, path, isActive, disabled, comingSoon }: NavItemProps) {
  const itemClasses = `nav-item ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`;
  
  const content = (
    <>
      <span className="nav-icon">{icon}</span>
      <span className="nav-label flex-1">{label}</span>
      {comingSoon && (
        <span className="coming-soon-badge">Coming Soon</span>
      )}
    </>
  );

  // Disabled items or null path render as div (no navigation)
  if (disabled || !path) {
    return (
      <div className={itemClasses}>
        {content}
      </div>
    );
  }

  return (
    <Link to={path} className={itemClasses}>
      {content}
    </Link>
  );
}
