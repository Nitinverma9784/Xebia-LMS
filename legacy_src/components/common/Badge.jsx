/**
 * Generic pill badge — used for category tags, level tags, status tags
 * (Active/Draft/Published) and content-type tags throughout the app.
 */
export default function Badge({ children, color = 'gray' }) {
  return <span className={`badge badge--${color}`}>{children}</span>
}
