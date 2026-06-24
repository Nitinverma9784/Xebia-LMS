/**
 * Shared button. Variants: 'primary' (filled accent), 'ghost' (outline),
 * 'icon' (square icon-only button used for row actions).
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  as: Component = 'button',
  className = '',
  ...rest
}) {
  return (
    <Component className={`btn btn--${variant} btn--${size} ${className}`} {...rest}>
      {icon}
      {children}
    </Component>
  )
}
