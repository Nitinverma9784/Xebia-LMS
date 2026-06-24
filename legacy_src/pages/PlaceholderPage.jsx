/**
 * The uploaded schema and this build focus on Course Catalog / Module
 * Builder. The remaining sidebar destinations (Dashboard, User Directory,
 * etc.) are wired up for navigation completeness but not built out yet —
 * this keeps the sidebar honest about what exists today.
 */
export default function PlaceholderPage({ title }) {
  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">{title}</h1>
          <p className="page__subtitle">This section isn't built yet — Course Catalog is the focus of this build.</p>
        </div>
      </div>
      <div className="empty-state empty-state--lg">
        <strong>{title}</strong> is coming soon. Use the sidebar to jump back to the Course Catalog.
      </div>
    </div>
  )
}
