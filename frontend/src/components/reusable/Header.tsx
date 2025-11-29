import './Header.css'

export interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  avatar?: string
  userInfo?: {
    name: string
    email?: string
  }
  onLogout?: () => void
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
}

export default function Header({
  title,
  subtitle,
  actions,
  avatar,
  userInfo,
  onLogout,
  className = '',
  variant = 'default',
}: HeaderProps) {
  return (
    <header className={`reusable-header reusable-header--${variant} ${className}`}>
      <div className="reusable-header__container">
        <div className="reusable-header__content">
          <div className="reusable-header__title-section">
            <h1 className="reusable-header__title">{title}</h1>
            {subtitle && <p className="reusable-header__subtitle">{subtitle}</p>}
          </div>

          {userInfo && (
            <div className="reusable-header__user-info">
              {avatar && (
                <img
                  src={avatar}
                  alt={userInfo.name}
                  className="reusable-header__avatar"
                />
              )}
              <div className="reusable-header__user-details">
                <span className="reusable-header__user-name">{userInfo.name}</span>
                {userInfo.email && (
                  <span className="reusable-header__user-email">{userInfo.email}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="reusable-header__actions">
          {actions}
          {onLogout && (
            <button onClick={onLogout} className="reusable-header__logout-btn">
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

