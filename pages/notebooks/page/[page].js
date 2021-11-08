import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { getAllNotebookFrontMatter } from '@/lib/ipynb'
import dateSortDesc from '@/lib/utils/dateSort'
import ListLayout from '@/layouts/ListLayout'
import { POSTS_PER_PAGE } from '../../blog'

export async function getStaticPaths() {
  const notebooks = await getAllNotebookFrontMatter('notebooks')
  const totalPosts = [...notebooks].sort((a, b) => dateSortDesc(a.date, b.date))
  const totalPages = Math.ceil(totalPosts.length / POSTS_PER_PAGE)
  const paths = Array.from({ length: totalPages }, (_, i) => ({
    params: { page: (i + 1).toString() },
  }))

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps(context) {
  const {
    params: { page },
  } = context
  const notebooks = await getAllNotebookFrontMatter('notebooks')
  const posts = [...notebooks].sort((a, b) => dateSortDesc(a.date, b.date))
  const pageNumber = parseInt(page)
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }
  console.log(posts.length)
  return {
    props: {
      posts,
      initialDisplayPosts,
      pagination,
    },
  }
}

export default function PostPage({ posts, initialDisplayPosts, pagination }) {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        slugPath="/"
        title="All Posts"
      />
    </>
  )
}
