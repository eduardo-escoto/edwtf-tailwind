import htmr from 'htmr'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypePrismPlus from 'rehype-prism-plus'
import ReactMarkdown from 'react-markdown'
import Pre from '@/components/Pre'
import Highlight, { defaultProps } from 'prism-react-renderer'
import { useState } from 'react'
import Image from 'next/dist/client/image'
import dateSortDesc from './utils/dateSort'

function Table(props) {
  return (
    <table className="table-auto" {...props}>
      {props.children}
    </table>
  )
}

const transform = { table: Table }

const cellRenderers = {
  code: RenderCodeCell,
  markdown: RenderMarkdownCell,
}

const OutputRendererTypes = {
  stream: RenderOutputStream,
  execute_result: RenderOutputExecuteResult,
  display_data: RenderOutputDisplayData,
  error: RenderOutputError,
}

function RenderOutputStream({ name, output_type, text }) {
  return (
    <>
      {/* Output Name: {name} <br />
      Output Type: {output_type} <br />
      Output Text:{' '} */}
      <Pre>
        <samp>{text}</samp>
      </Pre>{' '}
      {/* <br /> */}
    </>
  )
}

const DataRendererTypes = {
  'text/html': RenderOutputHTML,
  'text/plain': RenderOutputPlainText,
  'image/png': RenderOutputPNG,
}

function RenderOutputHTML({ data }) {
  // console.log("html", data);
  // return <div dangerouslySetInnerHTML={{ __html: data }} />;
  return <div style={{ overflowX: 'auto' }}> {htmr(data.join(''), { transform })}</div>
}
function RenderOutputPlainText({ data }) {
  return (
    <Pre>
      <samp>{data}</samp>
    </Pre>
  )
}

function RenderOutputExecuteResult({ data, execution_count, metadata, output_type }) {
  const DataComponents = Object.keys(data)
    .filter((key) => key !== 'text/plain')
    .map((key, idx) => {
      const DataRenderer = DataRendererTypes[key]
      return <DataRenderer data={data[key]} key={idx} />
    })
  return (
    <>
      {/* Execution Count: {execution_count} <br />
      Output Type: {output_type} <br /> */}
      {DataComponents}
    </>
  )
}

function RenderOutputDisplayData({ data, metadata, output_type }) {
  const DataComponents = Object.keys(data).map((key, idx) => {
    const DataRenderer = DataRendererTypes[key]
    return <DataRenderer data={data[key]} key={idx} />
  })
  return <>{DataComponents}</>
}

function RenderOutputError(props) {
  return null
  // <Pre>
  //   <samp>{props.traceback.join('\n').normalize()}</samp>
  // </Pre>
}

function RenderOutputPNG({ data }) {
  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: '50%' }}>
      <Image
        className={'dark:bg-white'}
        alt="Image Alt"
        src={`data:image/png;base64,${data}`}
        layout="fill"
        objectFit="contain" // Scale your image down to fit into the container
      />
    </div>
  )
}

function RenderMarkdownCell({ cell, metadata }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex, [rehypePrismPlus, { ignoreMissing: true }]]}
      components={{ pre: Pre }}
    >
      {cell.source.join('')}
    </ReactMarkdown>
  )
}

function RenderSourceCode({ code, language }) {
  return (
    <Pre>
      <Highlight {...defaultProps} code={code.join('')} language={language} theme={undefined}>
        {({ className, tokens, getLineProps, getTokenProps }) => (
          <code className={className.replace(/prism-code/, 'code-highlight')}>
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line, key: i })
              const fixed = {
                ...lineProps,
                className: lineProps.className.replace(/token/, 'code'),
              }
              return (
                // eslint-disable-next-line react/jsx-key
                <span {...fixed}>
                  {line.map((token, key) => (
                    // eslint-disable-next-line react/jsx-key
                    <span {...getTokenProps({ token, key })} />
                  ))}
                </span>
              )
            })}
          </code>
        )}
      </Highlight>
    </Pre>
  )
}

function RenderOutputs({ outputArray }) {
  if (outputArray.length === 0) return null

  return outputArray.map((output, idx) => {
    // console.log("Now rendering:", idx, output.output_type);
    // console.log(output);
    const OutputRenderComponent = OutputRendererTypes[output.output_type]
    return OutputRenderComponent ? <OutputRenderComponent key={idx} {...output} /> : null
  })
}

function RenderCodeCell({ cell, metadata }) {
  return (
    <>
      <RenderSourceCode code={cell.source} language={metadata.kernelspec.language} />
      <RenderOutputs outputArray={cell.outputs} />
    </>
  )
}

export function NotebookRenderer({ cells, metadata }) {
  // console.log(cells)
  const [state, setState] = useState({ selectedCellIdx: 0 })
  return (
    cells
      // .filter((cell) => cell.cell_type == 'code' || cell.cell_type == 'markdown')
      .map((cell, idx) => {
        const Renderer = cellRenderers[cell.cell_type] ? cellRenderers[cell.cell_type] : null
        return (
          <>
            <Renderer cell={cell} metadata={metadata} key={cell.id ? cell.id : idx} />
          </>
        )
      })
  )
}
