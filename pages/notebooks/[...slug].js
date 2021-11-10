import fs from 'fs'
import PageTitle from '@/components/PageTitle'
import generateRss from '@/lib/generate-rss'
import PostLayout from '@/layouts/PostLayout'
import { getFileBySlug } from '@/lib/mdx'
import {
  getNotebooks,
  formatNotebookSlug,
  getAllNotebookFrontMatter,
  getNotebookBySlug,
  getDataSlug,
} from '@/lib/ipynb'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import { unified } from 'unified'
import React from 'react'
import Pre from '@/components/Pre'
import Image from 'next/dist/client/image'

import { useMemo } from 'react'

export async function getStaticPaths() {
  const posts = getNotebooks('notebooks')
  return {
    paths: posts.map((p) => ({
      params: {
        slug: getDataSlug(formatNotebookSlug(p)).split('/'),
      },
    })),
    fallback: false,
  }
}
const DEFAULT_LAYOUT = 'PostLayout'
export async function getStaticProps({ params }) {
  const allNotebooks = await getAllNotebookFrontMatter('notebooks')
  const notebook = await getNotebookBySlug('notebooks', params.slug.join('/'))
  const postIndex = allNotebooks.findIndex(
    (notebook) => getDataSlug(notebook.slug) === params.slug.join('/')
  )
  const prev = allNotebooks[postIndex + 1] || null
  const next = allNotebooks[postIndex - 1] || null
  const post = await getNotebookBySlug('notebooks', params.slug.join('/'))
  const authorList = post.authors || ['default']
  const authorPromise = authorList.map(async (author) => {
    const authorResults = await getFileBySlug('authors', [author])
    return authorResults.frontMatter
  })
  const authorDetails = await Promise.all(authorPromise)

  //   // rss
  const rss = generateRss(allNotebooks)
  fs.writeFileSync('./public/feed.xml', rss)

  return { props: { notebook, authorDetails, prev, next } }
}

const comps = {
  html: React.Fragment,
  body: React.Fragment,
  head: React.Fragment,
  pre: Pre,
}

export default function Notebook({ notebook, authorDetails, prev, next }) {
  const { frontMatter, toc, nbJSON, slug, nbAST } = notebook
  const pipeline = unified().use(rehypeParse).use(rehypeReact, {
    createElement: React.createElement,
    Fragment: React.Fragment,
    components: comps,
  })
  const Comp = useMemo(() => pipeline.processSync(nbAST).result, [nbAST, pipeline])
  return (
    <>
      {notebook.frontMatter.draft !== true ? (
        <PostLayout
          frontMatter={frontMatter}
          authorDetails={authorDetails}
          next={next}
          prev={prev}
          slugPath={'/'}
        >
          {Comp}
        </PostLayout>
      ) : (
        <div className="mt-24 text-center">
          <PageTitle>
            Under Construction{' '}
            <span role="img" aria-label="roadwork sign">
              🚧
            </span>
          </PageTitle>
        </div>
      )}
    </>
  )
}
