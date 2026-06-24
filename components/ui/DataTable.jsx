'use client';

export function DataTable({ columns, data, emptyMessage = 'No data found' }) {
  if (!data?.length) {
    return (
      <div className="rounded-xl border border-brand-border bg-white p-8 text-center text-sm text-brand-text-secondary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-brand-border bg-white shadow-card">
      <table className="w-full text-sm">
        <thead className="bg-brand-surface border-b border-brand-border">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-semibold text-brand-text-primary">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id ?? i} className="border-b border-brand-border last:border-0 hover:bg-brand-surface/50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
