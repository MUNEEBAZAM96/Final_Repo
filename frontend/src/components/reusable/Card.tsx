import './Card.css'

export interface CardProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  image?: string
  imageAlt?: string
  onClick?: () => void
  className?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'flat'
  hoverable?: boolean
  loading?: boolean
}

export default function Card({
  title,
  subtitle,
  children,
  footer,
  image,
  imageAlt,
  onClick,
  className = '',
  variant = 'default',
  hoverable = false,
  loading = false,
}: CardProps) {
  return (
    <div
      className={`reusable-card reusable-card--${variant} ${
        hoverable ? 'reusable-card--hoverable' : ''
      } ${onClick ? 'reusable-card--clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {loading && (
        <div className="reusable-card__loading">
          <div className="reusable-card__spinner"></div>
        </div>
      )}

      {image && (
        <div className="reusable-card__image-wrapper">
          <img src={image} alt={imageAlt || title || 'Card image'} className="reusable-card__image" />
        </div>
      )}

      {(title || subtitle) && (
        <div className="reusable-card__header">
          {title && <h3 className="reusable-card__title">{title}</h3>}
          {subtitle && <p className="reusable-card__subtitle">{subtitle}</p>}
        </div>
      )}

      <div className="reusable-card__body">{children}</div>

      {footer && <div className="reusable-card__footer">{footer}</div>}
    </div>
  )
}

