import fs from 'fs'
import PageTitle from '@/components/PageTitle'
import generateRss from '@/lib/generate-rss'
import { NotebookRenderer } from '@/lib/renderNotebook'
import PostLayout from '@/layouts/PostLayout'
import { getFileBySlug } from '@/lib/mdx'
import {
  getNotebooks,
  formatNotebookSlug,
  getAllNotebookFrontMatter,
  getNotebookBySlug,
  getDataSlug,
} from '@/lib/ipynb'
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

export default function Notebook({ notebook, authorDetails, prev, next }) {
  const { frontMatter, toc, nbJSON, slug } = notebook
  const NBComponent = useMemo(() => NotebookRenderer(nbJSON), [nbJSON])
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
          {NBComponent}
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
