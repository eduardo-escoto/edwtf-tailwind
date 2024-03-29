import fs from 'fs'
import PageTitle from '@/components/PageTitle'
import generateRss from '@/lib/generate-rss'
import { getFileBySlug } from '@/lib/mdx'
import { MDXLayoutRenderer } from '@/components/MDXComponents'
import {
  getNotebooks,
  formatNotebookSlug,
  getAllNotebookFrontMatter,
  getNotebookBySlug,
  getDataSlug,
} from '@/lib/ipynb'

const DEFAULT_LAYOUT = 'PostLayout'

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
  const { frontMatter, toc, mdxSource } = notebook

  return (
    <>
      {notebook.frontMatter.draft !== true ? (
        <MDXLayoutRenderer
          layout={frontMatter.layout || DEFAULT_LAYOUT}
          toc={toc}
          mdxSource={mdxSource}
          frontMatter={frontMatter}
          authorDetails={authorDetails}
          prev={prev}
          next={next}
        />
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
