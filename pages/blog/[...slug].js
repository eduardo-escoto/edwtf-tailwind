import fs from 'fs'
import PageTitle from '@/components/PageTitle'
import generateRss from '@/lib/generate-rss'
// import { MDXLayoutRenderer } from '@/components/MDXComponents'
import { formatSlug, getAllFilesFrontMatter, getFileBySlug, getFiles } from '@/lib/mdx'
import PostLayout from '@/layouts/PostLayout'
import PostSimple from '@/layouts/PostSimple'
import { getAllNotebookFrontMatter } from '@/lib/ipynb'
import dateSortDesc from '@/lib/utils/dateSort'
import { useState, useEffect, useMemo } from 'react'
import { getMDXComponent } from 'mdx-bundler/client'
import Image from '@/components/Image'
import CustomLink from '@/components/Link'
import TOCInline from '@/components/TOCInline'
import Pre from '@/components/Pre'
import { BlogNewsletterForm } from '@/components/NewsletterForm'

export const MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  BlogNewsletterForm: BlogNewsletterForm,
  // wrapper: ({ components, layout, ...rest }) => {
  //   const Layout = require(`../layouts/${layout}`).default
  //   return <Layout {...rest} />
  // },
}

export const LayoutDict = {
  PostLayout: PostLayout,
  PostSimple: PostSimple,
}

const DEFAULT_LAYOUT = 'PostLayout'

export async function getStaticPaths() {
  const posts = getFiles('blog')
  return {
    paths: posts.map((p) => ({
      params: {
        slug: formatSlug(p).split('/'),
      },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const allNotebooks = await getAllNotebookFrontMatter('notebooks')
  const allMDX = await getAllFilesFrontMatter('blog')
  const allPosts = [...allNotebooks, ...allMDX].sort((a, b) => dateSortDesc(a.date, b.date))
  const postIndex = allPosts.findIndex((post) => formatSlug(post.slug) === params.slug.join('/'))
  const prev = allPosts[postIndex + 1] || null
  const next = allPosts[postIndex - 1] || null
  const post = await getFileBySlug('blog', params.slug.join('/'))
  const authorList = post.frontMatter.authors || ['default']
  const authorPromise = authorList.map(async (author) => {
    const authorResults = await getFileBySlug('authors', [author])
    return authorResults.frontMatter
  })
  const authorDetails = await Promise.all(authorPromise)

  // rss
  const rss = generateRss(allPosts)
  fs.writeFileSync('./public/feed.xml', rss)

  return { props: { post, authorDetails, prev, next } }
}

export default function Blog({ post, authorDetails, prev, next }) {
  const { mdxSource, toc, frontMatter } = post
  // const { frontMatter, toc, nbJSON, slug } = notebook
  const [show, setShow] = useState(false)
  const MDComponent = useMemo(() => getMDXComponent(mdxSource), [mdxSource])
  const Layout = LayoutDict[frontMatter.layout]
  useEffect(() => setShow(true), [])
  console.log(frontMatter.layout, Layout)
  return (
    <>
      {frontMatter.draft !== true ? (
        <Layout
          toc={toc}
          frontMatter={frontMatter}
          authorDetails={authorDetails}
          next={next}
          prev={prev}
        >
          {/* {showNB ? NBComponent : null} */}
          {show ? <MDComponent components={MDXComponents} mdxSource={mdxSource} toc={toc} /> : null}
        </Layout>
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
