/* eslint-disable react/display-name */
import { useEffect, useState, useMemo } from 'react'
import { getMDXComponent } from 'mdx-bundler/client'
import Image from './Image'
import CustomLink from './Link'
import TOCInline from './TOCInline'
import Pre from './Pre'
import { BlogNewsletterForm } from './NewsletterForm'

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
  const [state, setState] = useState(0)
  const MDXLayout = useMemo(() => getMDXComponent(mdxSource), [mdxSource])
  useEffect(() => setState(1), [])

  return <MDXLayout layout={layout} components={MDXComponents} {...rest} />
}
