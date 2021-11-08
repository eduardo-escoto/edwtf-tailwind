import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getAllNotebookFrontMatter } from '@/lib/ipynb'
import dateSortDesc from '@/lib/utils/dateSort'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSEO } from '@/components/SEO'

export const POSTS_PER_PAGE = 5

export async function getStaticProps() {
  const blogs = await getAllFilesFrontMatter('blog')
  const notebooks = await getAllNotebookFrontMatter('notebooks')
  const posts = [...blogs, ...notebooks].sort((a, b) => dateSortDesc(a.date, b.date))
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return { props: { initialDisplayPosts, posts, pagination } }
}

export default function Blog({ posts, initialDisplayPosts, pagination }) {
  return (
    <>
      <PageSEO title={`Blog - ${siteMetadata.author}`} description={siteMetadata.description} />
      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title="All Posts"
      />
    </>
  )
}
