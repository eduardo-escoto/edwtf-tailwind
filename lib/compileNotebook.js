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
  code: compileCodeCell,
}

const outputCompilers = {
  stream: compileOutputStream,
  execute_result: compileOutputExecuteResult,
  display_data: compileOutputDisplayData,
  error: compileOutputError,
}

const dataCompilers = {
  'text/html': compileOutputHTML,
  'text/plain': compileOutputPlainText,
  'image/png': compileOutputPNG,
}

function compileOutputHTML(data) {
  const pipeline = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypePrism)
    .use(rehypeStringify)

  return pipeline.processSync(`<div style="overflow-x: auto;">${data.join('')}</div>`).value
}

function compileOutputPlainText(data) {
  const pipeline = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypePrism)
    .use(rehypeStringify)

  return pipeline.processSync(
    `<pre><samp>${data.join('').replace('<', '&#60;').replace('>', '&#62;')}</samp></pre>`
  ).value
}
function compileOutputPNG(data) {
  const pngTemplate = `<div class="my-1 px-2 w-full overflow-hidden xl:my-1 xl:px-2 xl:w-full" >
  <img
    class='dark:bg-white mx-auto'
    alt="Image Alt"
    src='data:image/png;base64,${data}'
  >
</div>`
  const pipeline = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypePrism)
    .use(rehypeStringify)

  return pipeline.processSync(pngTemplate).value
}

function compileOutputStream({ text }) {
  const pipeline = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypePrism)
    .use(rehypeStringify)

  return pipeline.processSync(`<pre><samp>${text.join('')}</samp></pre>`).value
}

function compileOutputExecuteResult({ data }) {
  const compiledData = Object.keys(data)
    .filter((key) => key !== 'text/plain')
    .map((key) => {
      return dataCompilers[key](data[key])
    })
  return compiledData.join('')
}

function compileOutputDisplayData({ data }) {
  const compiledData = Object.keys(data).map((key) => {
    return dataCompilers[key](data[key])
  })
  return compiledData.join('')
}

function compileOutputError() {
  return ''
}

function compileMarkdown({ cell: { source } }) {
  const pipeline = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypePrism)
    .use(rehypeStringify)
  // console.log(source)
  const sourceToCompile = source ? source.join('') : ''
  const compiled = pipeline.processSync(sourceToCompile)
  return compiled.value
}

function compileCode({ source, language }) {
  const pipeline = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypePrism)
    .use(rehypeStringify)
  const sourceToCompile = source ? source.join('') : ''
  return pipeline.processSync(
    `<pre class="language-${language}"><code class="language-${language}">${sourceToCompile}</code></pre>`
  ).value
}

function compileOutputs({ outputs }) {
  if (outputs.length === 0) return ''

  return outputs.map((output) => {
    return outputCompilers[output.output_type](output)
  })
}

function compileCodeCell({ cell, metadata }) {
  const compiledCode = compileCode({ ...cell, ...metadata.kernelspec })
  const compiledOutputs = compileOutputs(cell)
  return [compiledCode, ...compiledOutputs].join('')
}

export default async function compileNotebook({ cells, metadata }) {
  const compiled_cells = cells.map((cell) => {
    const compiled = cellCompilers[cell.cell_type]({
      cell,
      metadata,
    })
    return compiled
  })

  const allHtml = compiled_cells.join('')

  return allHtml
}
