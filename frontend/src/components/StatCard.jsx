
function StatCard({ title, value, description, valueColor = 'text-slate-900' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <h3 className={`mt-4 text-3xl font-bold ${valueColor}`}>
        {value}
      </h3>

      <p className="mt-2 text-xs text-slate-400">
        {description}
      </p>
    </div>
  )
}

export default StatCard
