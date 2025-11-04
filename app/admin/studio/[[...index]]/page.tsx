// app/studio/[[...index]]/page.tsx
'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'

export default function StudioPage() {
  return <div className="pt-16">
      <NextStudio config={config} />
    </div>
}