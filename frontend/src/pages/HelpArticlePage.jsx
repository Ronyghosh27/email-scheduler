import { useState } from 'react'
import { ArrowLeft, Check, ChevronRight, ThumbsDown, ThumbsUp } from 'lucide-react'
import { helpArticles, helpCategories } from '../data/helpContent'

function HelpArticlePage({ articleId, categoryId, onBack, onOpenArticle, onNavigate }) {
  const [feedback, setFeedback] = useState(null)
  const article = helpArticles.find((item) => item.id === articleId)

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Article unavailable</h1>
        <p className="mt-2 text-sm text-slate-500">
          This help article could not be found.
        </p>
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

  const category = helpCategories.find((item) => item.id === article.category)
  const relatedArticles = helpArticles
    .filter((item) => item.category === article.category && item.id !== article.id)
    .slice(0, 3)

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
        <ChevronRight size={14} className="text-slate-300" />
        <button
          type="button"
          onClick={onBack}
          className="text-slate-400 transition-colors hover:text-indigo-600"
        >
          {categoryId ? (helpCategories.find((item) => item.id === categoryId)?.title || 'Help category') : 'Help Center'}
        </button>
        <ChevronRight size={14} className="text-slate-300" />
        <span className="max-w-[220px] truncate font-medium text-slate-600">
          {article.title}
        </span>
      </nav>

      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-indigo-600"
      >
        <ArrowLeft size={18} />
        {categoryId
          ? `Back to ${helpCategories.find((item) => item.id === categoryId)?.title || 'category'}`
          : 'Back to Help Center'}
      </button>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-100 px-5 py-7 sm:px-8 sm:py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              {category?.title || 'MailFlow Help'}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {article.title}
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-500">
              {article.description}
            </p>
          </header>

          <div className="px-5 py-7 sm:px-8 sm:py-8">
            {(article.problem || article.reason) && (
              <div className="mb-8 grid gap-3 sm:grid-cols-2">
                {article.problem && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      Possible problem
                    </p>
                    <p className="mt-2 text-sm leading-6 text-amber-900">
                      {article.problem}
                    </p>
                  </div>
                )}
                {article.reason && (
                  <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-sky-700">
                      Why it happens
                    </p>
                    <p className="mt-2 text-sm leading-6 text-sky-900">
                      {article.reason}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-8">
              {article.content.map((section, sectionIndex) => (
                <section key={`${section.heading}-${sectionIndex}`}>
                  <h2 className="text-lg font-bold text-slate-900">
                    {section.heading}
                  </h2>

                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="mt-3 text-sm leading-7 text-slate-600">
                      {paragraph}
                    </p>
                  ))}

                  {section.list && (
                    <ol className="mt-4 space-y-3">
                      {section.list.map((item, itemIndex) => (
                        <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                            {itemIndex + 1}
                          </span>
                          <span className="pt-0.5">{item}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-8">
            {feedback ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <Check size={17} />
                Thank you for your feedback.
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm font-semibold text-slate-700">
                  Was this article helpful?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedback('yes')}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <ThumbsUp size={16} />
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedback('no')}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <ThumbsDown size={16} />
                    No
                  </button>
                </div>
              </div>
            )}
          </div>
        </article>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">Related articles</h2>
          <div className="mt-3 space-y-1">
            {relatedArticles.length > 0 ? (
              relatedArticles.map((related) => (
                <button
                  type="button"
                  key={related.id}
                  onClick={() => onOpenArticle(related.id)}
                  className="flex w-full items-start justify-between gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="text-sm font-medium leading-5 text-slate-700">
                    {related.title}
                  </span>
                  <ChevronRight size={15} className="mt-0.5 shrink-0 text-slate-400" />
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-500">No related articles available.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default HelpArticlePage
