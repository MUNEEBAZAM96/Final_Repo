import './Button.css'

export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  className?: string
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`reusable-button reusable-button--${variant} reusable-button--${size} ${
        fullWidth ? 'reusable-button--full-width' : ''
      } ${loading ? 'reusable-button--loading' : ''} ${className}`}
    >
      {loading && <span className="reusable-button__spinner"></span>}
      {icon && iconPosition === 'left' && !loading && (
        <span className="reusable-button__icon reusable-button__icon--left">{icon}</span>
      )}
      <span className="reusable-button__content">{children}</span>
      {icon && iconPosition === 'right' && !loading && (
        <span className="reusable-button__icon reusable-button__icon--right">{icon}</span>
      )}
    </button>
  )
}

