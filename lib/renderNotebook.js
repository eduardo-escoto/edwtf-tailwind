// import Highlight, { defaultProps } from 'prism-react-renderer'
// import htmr from 'htmr'
// import remarkGfm from 'remark-gfm'
// import remarkMath from 'remark-math'
// import rehypeKatex from 'rehype-katex'
import { unified } from 'unified'
import { rehype } from 'rehype'
import rehypePrismPlus from 'rehype-prism-plus'
// import ReactMarkdown from 'react-markdown'
import Pre from '@/components/Pre'
import { refractor } from 'refractor'
// import { useState } from 'react'
import Image from 'next/dist/client/image'
import React from 'react'
import python from 'refractor/lang/python.js'
import { toH } from 'hast-to-hyperscript'
import { toHtml } from 'hast-util-to-html'
refractor.register(python)
// import dateSortDesc from './utils/dateSort'

// function Table(props) {
//   return (
//     <table className="table-auto" {...props}>
//       {props.children}
//     </table>
//   )
// }

// const transform = { table: Table }

const cellRenderers = {
  code: RenderCodeCell,
  markdown: RenderMarkdownCell,
}

// const OutputRendererTypes = {
//   stream: RenderOutputStream,
//   execute_result: RenderOutputExecuteResult,
//   display_data: RenderOutputDisplayData,
//   error: RenderOutputError,
// }

// function RenderOutputStream({ name, output_type, text }) {
//   return (
//     <>
//       {/* Output Name: {name} <br />
//       Output Type: {output_type} <br />
//       Output Text:{' '} */}
//       <Pre>
//         <samp>{text}</samp>
//       </Pre>{' '}
//       {/* <br /> */}
//     </>
//   )
// }

// const DataRendererTypes = {
//   'text/html': RenderOutputHTML,
//   'text/plain': RenderOutputPlainText,
//   'image/png': RenderOutputPNG,
// }

// function RenderOutputHTML({ data }) {
//   // console.log("html", data);
//   // return <div dangerouslySetInnerHTML={{ __html: data }} />;
//   return <div style={{ overflowX: 'auto' }}> {htmr(data.join(''), { transform })}</div>
// }
// function RenderOutputPlainText({ data }) {
//   return (
//     <Pre>
//       <samp>{data}</samp>
//     </Pre>
//   )
// }

// function RenderOutputExecuteResult({ data, execution_count, metadata, output_type }) {
//   const DataComponents = Object.keys(data)
//     .filter((key) => key !== 'text/plain')
//     .map((key, idx) => {
//       const DataRenderer = DataRendererTypes[key]
//       return <DataRenderer data={data[key]} key={idx} />
//     })
//   return (
//     <>
//       {/* Execution Count: {execution_count} <br />
//       Output Type: {output_type} <br /> */}
//       {DataComponents}
//     </>
//   )
// }

// function RenderOutputDisplayData({ data, metadata, output_type }) {
//   const DataComponents = Object.keys(data).map((key, idx) => {
//     const DataRenderer = DataRendererTypes[key]
//     return <DataRenderer data={data[key]} key={idx} />
//   })
//   return <>{DataComponents}</>
// }

// function RenderOutputError(props) {
//   return null
//   // <Pre>
//   //   <samp>{props.traceback.join('\n').normalize()}</samp>
//   // </Pre>
// }

// function RenderOutputPNG({ data }) {
//   return (
//     <div style={{ position: 'relative', width: '100%', paddingBottom: '50%' }}>
//       <Image
//         className={'dark:bg-white'}
//         alt="Image Alt"
//         src={`data:image/png;base64,${data}`}
//         layout="fill"
//         objectFit="contain" // Scale your image down to fit into the container
//       />
//     </div>
//   )
// }

function RenderMarkdownCell({ cell, metadata }) {
  return (
    <></>
    // <ReactMarkdown
    //   remarkPlugins={[remarkGfm, remarkMath]}
    //   rehypePlugins={[rehypeKatex, [rehypePrismPlus, { ignoreMissing: true }]]}
    //   components={{ pre: Pre }}
    // >
    //   {cell.source.join('')}
    // </ReactMarkdown>
  )
}

function RenderSourceCode({ code, language }) {
  refractor.register(python)
  const tree = refractor.highlight(code.join(''), language)
  const h = toHtml(tree)
  rehype()
    .use(rehypePrismPlus)
    .process(h)
    .then((file) => {
      // console.log(String(file))
    })
  // const react = toH(React.createElement, tree)
  // console.log(react)
  return <>{h}</>
}

// function RenderSourceCode({ code, language }) {
//   return (
//     <Highlight {...defaultProps} code={code.join('')} language={language} theme={undefined}>
//       {({ className, tokens, getLineProps, getTokenProps }) => (
//         <code className={className.replace(/prism-code/, 'code-highlight')} key={1}>
//           {tokens.map((line, i) => {
//             const lineProps = getLineProps({ line, key: i })
//             const fixed = {
//               ...lineProps,
//               className: lineProps.className.replace(/token/, 'code'),
//             }
//             return (
//               // eslint-disable-next-line react/jsx-key
//               <span {...fixed}>
//                 {line.map((token, key) => (
//                   // eslint-disable-next-line react/jsx-key
//                   <span {...getTokenProps({ token, key })} />
//                 ))}
//               </span>
//             )
//           })}
//         </code>
//       )}
//     </Highlight>
//   )
// }

// function RenderOutputs({ outputArray }) {
//   if (outputArray.length === 0) return null

//   return outputArray.map((output, idx) => {
//     // console.log("Now rendering:", idx, output.output_type);
//     // console.log(output);
//     const OutputRenderComponent = OutputRendererTypes[output.output_type]
//     return OutputRenderComponent ? <OutputRenderComponent key={idx} {...output} /> : null
//   })
// }

function RenderCodeCell({ cell, metadata }) {
  return (
    <React.Fragment>
      <Pre>
        <RenderSourceCode code={cell.source} language={metadata.kernelspec.language} />
      </Pre>
      {/* <RenderOutputs outputArray={cell.outputs} /> */}
    </React.Fragment>
  )
}

export function NotebookRenderer({ cells, metadata }) {
  return cells.map((cell, idx) => {
    const Renderer = cellRenderers[cell.cell_type] ? cellRenderers[cell.cell_type] : null
    return (
      <React.Fragment key={cell.id ? cell.id : idx}>
        <Renderer cell={cell} metadata={metadata} />
      </React.Fragment>
    )
  })
}
