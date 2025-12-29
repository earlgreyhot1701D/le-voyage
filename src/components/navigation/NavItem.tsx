import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
  icon: LucideIcon | string;
  label: string;
  path: string | null;
  isActive: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
}

export function NavItem({ icon: Icon, label, path, isActive, disabled, comingSoon }: NavItemProps) {
  const itemClasses = `nav-item ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`;
  
  const renderIcon = () => {
    if (typeof Icon === 'string') {
      return <span className="nav-icon">{Icon}</span>;
    }
    return <Icon className="nav-icon h-4 w-4" />;
  };
  
  const content = (
    <>
      {renderIcon()}
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
