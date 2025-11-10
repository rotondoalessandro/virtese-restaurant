// app/menu/page.tsx
import { sanityClient } from '@/lib/sanity.client'

export const metadata = { title: 'Menu — Virtese Restaurant' }

type MenuItem = {
  _id: string
  name: string
  description?: string
  price: string
  highlight?: boolean
  tags?: string[]
}

type MenuCategory = {
  _id: string
  title: string
  subtitle?: string
  items: MenuItem[]
}

async function getMenuData(): Promise<MenuCategory[]> {
  const query = `
    *[_type == "menuCategory"] | order(order asc, title asc) {
      _id,
      title,
      subtitle,
      "items": *[_type == "menuItem" && references(^._id)] | order(order asc, name asc) {
        _id,
        name,
        description,
        price,
        highlight,
        tags
      }
    }
  `
  const data = await sanityClient.fetch(query)
  return data
}

export default async function MenuPage() {
  const categories = await getMenuData()
  const activeCategories = categories?.filter(
    (cat) => cat.items && cat.items.length > 0
  )
  const hasMenu = activeCategories && activeCategories.length > 0

  return (
    <main className="min-h-screen bg-[#f7f2ec] text-[#5b4b41]">
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[#e1d6c9]/70 bg-white/90 px-6 py-10 shadow-lg backdrop-blur-sm sm:px-10 sm:py-12">
          {/* Header menu – “printed menu” meets modern website */}
          <header className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a7463]">
              Menu
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-[#3f3127] sm:text-5xl">
              Virtese Restaurant
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#5b4b41]">
              A short menu of contemporary Tuscan dishes: fresh pasta, grilled plates,
              seasonal vegetables and proper desserts. The menu changes often with
              the seasons — ask the team about today’s specials.
            </p>
            <p className="mt-4 text-[0.8rem] uppercase tracking-[0.2em] text-[#b19c88]">
              Sample menu · subject to change
            </p>
          </header>

          {/* Category pill nav */}
          {hasMenu && (
            <nav
              className="mb-10 -mx-4 overflow-x-auto pb-2 pt-1"
              aria-label="Menu categories"
            >
              <ul className="flex min-w-max items-center gap-2 px-4 sm:justify-center">
                {activeCategories.map((category) => {
                  const sectionId = `cat-${category._id}`
                  return (
                    <li key={category._id}>
                      <a
                        href={`#${sectionId}`}
                        className="inline-flex items-center rounded-full border border-[#e1d6c9] bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[#5b4b41] shadow-sm transition hover:border-[#c8b7a5] hover:bg-[#f8f2ea]"
                      >
                        {category.title}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </nav>
          )}

          {!hasMenu && (
            <p className="mt-8 text-center text-sm text-[#8a7463]">
              The menu is being updated right now. Check back soon or contact us to
              know today’s dishes.
            </p>
          )}

          {/* Menu content */}
          {hasMenu && (
            <div className="space-y-12">
              {activeCategories.map((category) => {
                const sectionId = `cat-${category._id}`

                return (
                  <section
                    key={category._id}
                    id={sectionId}
                    className="scroll-mt-24 space-y-5"
                    aria-labelledby={`${sectionId}-heading`}
                  >
                    {/* Category heading */}
                    <div className="text-center">
                      <h2
                        id={`${sectionId}-heading`}
                        className="font-display text-2xl uppercase tracking-[0.2em] text-[#3f3127]"
                      >
                        {category.title}
                      </h2>
                      {category.subtitle && (
                        <p className="mt-2 text-sm text-[#8a7463]">
                          {category.subtitle}
                        </p>
                      )}
                      <div className="mx-auto mt-4 h-px w-24 bg-[#e1d6c9]" />
                    </div>

                    {/* Items */}
                    <ul className="grid gap-4 sm:gap-5">
                      {category.items.map((item) => (
                        <li
                          key={item._id}
                          className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm ring-1 ring-[#e1d6c9]/70 transition hover:-translate-y-[1px] hover:bg-white hover:shadow-md sm:px-5 sm:py-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-semibold text-[#3f3127] sm:text-lg">
                                  {item.name}
                                </h3>
                                {item.highlight && (
                                  <span className="rounded-full border border-[#d0bfae] bg-[#f8f2ea] px-2.5 py-[2px] text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#5b4b41]">
                                    Chef&apos;s choice
                                  </span>
                                )}
                              </div>

                              {item.description && (
                                <p className="mt-1 text-sm leading-relaxed text-[#5b4b41] sm:text-[0.95rem]">
                                  {item.description}
                                </p>
                              )}

                              {item.tags && item.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {item.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded-full bg-[#f8f2ea] px-2 py-[2px] text-[0.68rem] uppercase tracking-[0.16em] text-[#8a7463]"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* dotted line + price */}
                            <div className="flex w-full items-center gap-2 sm:w-48 sm:flex-col sm:items-end sm:gap-1">
                              <div className="flex w-full items-center gap-2 sm:hidden">
                                <span className="h-px flex-1 border-b border-dotted border-[#e1d6c9]" />
                                <span className="shrink-0 text-sm font-semibold text-[#3f3127]">
                                  {item.price}
                                </span>
                              </div>
                              <span className="hidden text-lg font-semibold text-[#3f3127] sm:inline">
                                {item.price}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}

          <p className="mt-12 text-center text-[0.8rem] leading-relaxed text-[#8a7463]">
            A discretionary service charge may be added to your bill. Please inform us
            of any allergies or dietary requirements before ordering — we&apos;ll do
            our best to look after you.
          </p>
        </div>
      </div>
    </main>
  )
}
