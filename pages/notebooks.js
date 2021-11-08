import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSEO } from '@/components/SEO'
import { getAllNotebookFrontMatter } from '@/lib/ipynb'

export const POSTS_PER_PAGE = 5

export async function getStaticProps() {
  const notebooks = await getAllNotebookFrontMatter('notebooks')
  const initialDisplayPosts = notebooks.slice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(notebooks.length / POSTS_PER_PAGE),
  }
  return { props: { posts: notebooks, initialDisplayPosts, pagination } }
}

export default function Blog({ posts, initialDisplayPosts, pagination }) {
  return (
    <>
      <PageSEO
        title={`Notebooks - ${siteMetadata.author}`}
        description={siteMetadata.description}
      />
      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        slugPath="/"
        title="All Notebooks"
      />
    </>
  )
}
