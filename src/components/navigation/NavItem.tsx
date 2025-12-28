import { Link, useLocation } from 'react-router-dom';

interface NavItemProps {
  icon: string;
  label: string;
  path: string;
  active?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
}

export function NavItem({ icon, label, path, disabled, comingSoon }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === path;
  
  const itemClasses = `nav-item ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`;
  
  const content = (
    <>
      <span className="nav-icon">{icon}</span>
      <span className="nav-label flex-1">{label}</span>
      {comingSoon && (
        <span className="coming-soon-badge">Soon</span>
      )}
    </>
  );

  if (disabled) {
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
