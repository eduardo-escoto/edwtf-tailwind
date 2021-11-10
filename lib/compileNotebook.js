import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypePrism from 'rehype-prism-plus'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeWrap from 'rehype-wrap'
import rehypeParse from 'rehype-parse'

const cellCompilers = {
  markdown: compileMarkdown,
  code: compileCode,
}

function compileMarkdown({ source }) {
  const pipeline = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypePrism)
    // .use(rehypeWrap, { wrapper: 'div.md-block' })
    .use(rehypeStringify)

  const compiled = pipeline.processSync(source.join(''))
  return compiled.value
}

function compileCode({ source, language }) {
  const pipeline = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypePrism)
    .use(rehypeStringify)

  return pipeline.processSync(
    `<pre class="language-${language}"><code class="language-${language}">` +
      source.join('') +
      '</code></pre>'
  )
}

export default async function compileNotebook({ cells, metadata, options = {} }) {
  const compiled_cells = cells.map((cell) => {
    const compiled = cellCompilers[cell.cell_type]({
      ...cell,
      language: metadata.kernelspec.language,
    })
    return compiled
  })

  const allHtml = compiled_cells.join('')

  return allHtml
}
