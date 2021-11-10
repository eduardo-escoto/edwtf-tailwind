import fs from 'fs'
import readingTime from 'reading-time'
import path from 'path'
import getAllFilesRecursively from './utils/files'
import dateSortDesc from './utils/dateSort'
import compileNotebook from './compileNotebook'
import xdm from 'xdm/esbuild.js'
import esbuild from 'esbuild'
import { compile } from 'xdm'

const root = process.cwd()

export function formatNotebookSlug(slug) {
  return 'notebooks/' + slug.replace(/\.(ipynb)/, '')
}

export function getDataSlug(pageSlug) {
  return pageSlug.replace(/notebooks\//, '')
}

export function getNotebooks(folder) {
  const prefixPaths = path.join(root, 'data', folder)
  const files = getAllFilesRecursively(prefixPaths)
  // Only want to return blog/path and ignore root, replace is needed to work on Windows
  return files.map((file) => file.slice(prefixPaths.length + 1).replace(/\\/g, '/'))
}

export async function getNotebookBySlug(folder, slug) {
  const ipynbPath = path.join(root, 'data', folder, `${slug}.ipynb`)
  const notebookFile = await fs.readFileSync(ipynbPath)
  const notebookJSON = await JSON.parse(notebookFile)
  const nbAST = await compileNotebook(notebookJSON)
  // console.log(nbAST)
  // const compiled = await compile(nbAST)
  // console.log(compiled)
  return {
    nbJSON: notebookJSON,
    nbAST,
    toc: [],
    readingTime: readingTime(notebookFile),
    fileName: fs.existsSync(ipynbPath) ? `${slug}.ipynb` : null,
    frontMatter: { ...notebookJSON.metadata.frontMatter, slug: slug || null },
  }
}

export async function getAllNotebookFrontMatter(folder) {
  const prefixPaths = path.join(root, 'data', folder)
  const files = getAllFilesRecursively(prefixPaths)

  const notebookFrontMatter = files
    .filter((file) => {
      // Replace is needed to work on Windows
      const fileName = file.slice(prefixPaths.length + 1).replace(/\\/g, '/')
      // Remove Unexpected File
      if (path.extname(fileName) !== '.ipynb') return false

      return true
    })
    .map((file) => {
      const source = fs.readFileSync(file, 'utf8')
      const fileName = file.slice(prefixPaths.length + 1).replace(/\\/g, '/')
      const frontMatter = JSON.parse(source).metadata.frontMatter
      return {
        ...frontMatter,
        slug: formatNotebookSlug(fileName),
        date: frontMatter.date ? new Date(frontMatter.date).toISOString() : null,
      }
    })

  return notebookFrontMatter.sort((a, b) => dateSortDesc(a.date, b.date))
}
