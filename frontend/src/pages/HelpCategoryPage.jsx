import { ArrowLeft, ArrowRight, MailCheck, Sparkles, TriangleAlert } from 'lucide-react'
import { helpArticles, helpCategories } from '../data/helpContent'

function HelpCategoryPage({ categoryId, onBack, onOpenArticle, onNavigate }) {
  const category = helpCategories.find((item) => item.id === categoryId)
  const articles = helpArticles.filter((article) => article.category === categoryId)

  const categoryIcons = {
    'getting-started': Sparkles,
    'managing-emails': MailCheck,
    troubleshooting: TriangleAlert,
  }

  const Icon = categoryIcons[categoryId] || MailCheck

  if (!category) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Category unavailable</h1>
        <button
          type="button"
          onClick={onBack}
          className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to Help Center
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="text-slate-400 transition-colors hover:text-indigo-600"
        >
          Dashboard
        </button>
        <span className="text-slate-300">/</span>
        <button
          type="button"
          onClick={onBack}
          className="text-slate-400 transition-colors hover:text-indigo-600"
        >
          Help Center
        </button>
        <span className="text-slate-300">/</span>
        <span className="font-medium text-slate-600">{category.title}</span>
      </nav>

      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-indigo-600"
      >
        <ArrowLeft size={18} />
        Back to Help Center
      </button>

      <header className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Icon size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              Help category
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {category.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {category.description}
            </p>
            <p className="mt-3 text-xs font-semibold text-slate-400">
              {articles.length} {articles.length === 1 ? 'article' : 'articles'}
            </p>
          </div>
        </div>
      </header>

      <section className="mt-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Articles</h2>
        {articles.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            No articles are available in this category.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {articles.map((article) => (
              <button
                type="button"
                key={article.id}
                onClick={() => onOpenArticle(article.id)}
                className="group flex w-full items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 text-left transition-colors last:border-0 hover:bg-slate-50 sm:px-6"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 transition-colors group-hover:text-indigo-600 sm:text-base">
                    {article.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {article.description}
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500"
                />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default HelpCategoryPage
