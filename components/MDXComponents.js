/* eslint-disable react/display-name */
import Pre from './Pre'
import Image from './Image'
import CustomLink from './Link'
import TOCInline from './TOCInline'
import { useMemo } from 'react'
import { BlogNewsletterForm } from './NewsletterForm'
import { getMDXComponent } from '@eduardo-exists/mdx-bundler/client'

export const MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  BlogNewsletterForm: BlogNewsletterForm,
  wrapper: ({ components, layout, ...rest }) => {
    const Layout = require(`../layouts/${layout}`).default
    return <Layout {...rest} />
  },
}

export const MDXLayoutRenderer = ({ layout, mdxSource, ...rest }) => {
  const MDXLayout = useMemo(() => getMDXComponent(mdxSource), [mdxSource])

  return <MDXLayout layout={layout} components={MDXComponents} {...rest} />
}
