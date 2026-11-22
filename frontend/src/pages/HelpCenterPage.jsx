import { useMemo, useState } from 'react'
import {
  ArrowRight,
  ChevronDown,
  MailCheck,
  MessageCircleQuestion,
  Search,
  Settings,
  Sparkles,
  TriangleAlert,
  X,
} from 'lucide-react'
import { helpArticles, helpCategories, helpFaqs } from '../data/helpContent'

function HelpCenterPage({ onOpenArticle, onOpenCategory, onNavigate }) {
  const [query, setQuery] = useState('')
  const [openFaq, setOpenFaq] = useState(0)

  const normalizedQuery = query.trim().toLowerCase()
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return []

    return helpArticles.filter((article) => {
      const contentText = article.content
        .flatMap((section) => [
          section.heading,
          ...(section.paragraphs || []),
          ...(section.list || []),
        ])
        .join(' ')

      return [
        article.title,
        article.description,
        article.problem,
        article.reason,
        contentText,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    })
  }, [normalizedQuery])

  const popularArticles = [
    helpArticles.find((article) => article.id === 'connect-gmail'),
    helpArticles.find((article) => article.id === 'schedule-email'),
    helpArticles.find((article) => article.id === 'delete-sent'),
  ].filter(Boolean)

  const categoryIcons = {
    'getting-started': Sparkles,
    'managing-emails': MailCheck,
    troubleshooting: TriangleAlert,
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="text-slate-400 transition-colors hover:text-indigo-600"
        >
          Dashboard
        </button>
        <span className="text-slate-300">/</span>
        <span className="font-medium text-slate-600">Help Center</span>
      </nav>

      <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-5 py-10 text-center sm:px-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/15 text-indigo-300">
            <MessageCircleQuestion size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How can we help you?
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
            Find answers, learn how to use MailFlow, and solve common problems.
          </p>

          <div className="relative mx-auto mt-7 max-w-xl">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for help..."
              aria-label="Search Help Center"
              className="h-14 w-full rounded-2xl border border-white/10 bg-white pl-12 pr-12 text-sm text-slate-900 shadow-xl shadow-slate-950/20 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-300/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear Help Center search"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {normalizedQuery && (
            <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-white p-2 text-left shadow-2xl">
              {searchResults.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm font-semibold text-slate-700">No help articles found</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Try a shorter term or search for Gmail, scheduling, or search.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((article) => (
                    <button
                      type="button"
                      key={article.id}
                      onClick={() => onOpenArticle(article.id)}
                      className="flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {article.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {article.description}
                        </p>
                      </div>
                      <ArrowRight size={16} className="shrink-0 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              Browse
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Help categories</h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {helpCategories.map((category) => {
            const Icon = categoryIcons[category.id] || Settings
            const articleCount = helpArticles.filter(
              (article) => article.category === category.id
            ).length

            return (
              <button
                type="button"
                key={category.id}
                onClick={() => onOpenCategory(category.id)}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{category.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {category.description}
                </p>
                <p className="mt-4 text-xs font-semibold text-indigo-600">
                  {articleCount} articles
                </p>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Popular articles</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {popularArticles.map((article) => (
              <button
                type="button"
                key={article.id}
                onClick={() => onOpenArticle(article.id)}
                className="flex w-full items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 text-left transition-colors last:border-0 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {article.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {article.description}
                  </p>
                </div>
                <ArrowRight size={17} className="shrink-0 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">Quick links</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              ['Getting started', 'getting-started'],
              ['Manage emails', 'managing-emails'],
              ['Troubleshooting', 'troubleshooting'],
            ].map(([label, categoryId]) => (
              <button
                type="button"
                key={categoryId}
                onClick={() => onOpenCategory(categoryId)}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:text-indigo-600"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">Frequently asked questions</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {helpFaqs.map((faq, index) => {
            const isOpen = openFaq === index

            return (
              <div key={faq.question} className="border-b border-slate-100 last:border-0">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-slate-800">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm leading-6 text-slate-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

    </div>
  )
}

export default HelpCenterPage
