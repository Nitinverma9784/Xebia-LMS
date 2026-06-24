import { Search, ChevronDown } from 'lucide-react'

export default function CourseFilters({ filters, onChange, categories }) {
  const update = (key) => (e) => onChange({ ...filters, [key]: e.target.value })

  return (
    <div className="filters-bar">
      <div className="filters-bar__search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search course title or slug…"
          value={filters.query}
          onChange={update('query')}
        />
      </div>

      <div className="filters-bar__select">
        <select value={filters.categoryId} onChange={update('categoryId')}>
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} />
      </div>

      <div className="filters-bar__select">
        <select value={filters.status} onChange={update('status')}>
          <option value="all">All Statuses</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Inactive">Inactive</option>
        </select>
        <ChevronDown size={14} />
      </div>
    </div>
  )
}
