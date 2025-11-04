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

  const hasMenu = categories?.some((cat) => cat.items && cat.items.length > 0)

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-50">
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 lg:px-0">
        {/* Header menu – in linea col resto del sito */}
        <header className="mb-10 border-b border-zinc-800 pb-6">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Menu
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl">Menu</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300">
            Seasonal Tuscan plates, handmade pasta, dishes to share and desserts. The menu changes
            often — ask the team about today&apos;s specials and off–menu dishes.
          </p>
        </header>

        {!hasMenu && (
          <p className="mt-8 text-sm text-zinc-400">
            The menu is being updated. Please check back soon or contact us for today&apos;s dishes.
          </p>
        )}

        {/* Contenuto menu */}
        <div className="space-y-10">
          {categories.map((category) =>
            category.items && category.items.length > 0 ? (
              <section key={category._id} className="space-y-4">
                <div>
                  <h2 className="font-display text-2xl text-zinc-50">
                    {category.title}
                  </h2>
                  {category.subtitle && (
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                      {category.subtitle}
                    </p>
                  )}
                </div>

                <ul className="divide-y divide-zinc-800">
                  {category.items.map((item) => (
                    <li key={item._id} className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-zinc-50">
                              {item.name}
                            </h3>
                            {item.highlight && (
                              <span className="rounded-full border border-amber-400/60 bg-amber-500/10 px-2 py-[2px] text-[0.7rem] font-medium uppercase tracking-[0.16em] text-amber-300">
                                Chef&apos;s choice
                              </span>
                            )}
                          </div>

                          {item.description && (
                            <p className="mt-1 text-sm leading-relaxed text-zinc-300">
                              {item.description}
                            </p>
                          )}

                          {item.tags && item.tags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-zinc-900 px-2 py-[2px] text-[0.65rem] uppercase tracking-[0.16em] text-zinc-400"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 pl-2 text-sm font-semibold text-zinc-100">
                          {item.price}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null
          )}
        </div>

        <p className="mt-10 text-[0.75rem] leading-relaxed text-zinc-500">
          A discretionary service charge may be added to your bill. Please inform us of any allergies
          or dietary requirements — we&apos;ll do our best to look after you.
        </p>
      </div>
    </main>
  )
}
