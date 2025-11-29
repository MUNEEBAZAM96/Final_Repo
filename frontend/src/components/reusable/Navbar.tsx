import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export interface NavbarItem {
  label: string
  path: string
  icon?: React.ReactNode
}

export interface NavbarProps {
  items: NavbarItem[]
  logo?: React.ReactNode | string
  logoPath?: string
  className?: string
  variant?: 'default' | 'minimal' | 'centered'
  showActiveIndicator?: boolean
}

export default function Navbar({
  items,
  logo,
  logoPath = '/',
  className = '',
  variant = 'default',
  showActiveIndicator = true,
}: NavbarProps) {
  const location = useLocation()

  return (
    <nav className={`reusable-navbar reusable-navbar--${variant} ${className}`}>
      <div className="reusable-navbar__container">
        {/* Logo Section */}
        {logo && (
          <Link to={logoPath} className="reusable-navbar__logo">
            {typeof logo === 'string' ? <span>{logo}</span> : logo}
          </Link>
        )}

        {/* Navigation Items */}
        <ul className="reusable-navbar__menu">
          {items.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path} className="reusable-navbar__item">
                <Link
                  to={item.path}
                  className={`reusable-navbar__link ${
                    isActive && showActiveIndicator ? 'reusable-navbar__link--active' : ''
                  }`}
                >
                  {item.icon && <span className="reusable-navbar__icon">{item.icon}</span>}
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

