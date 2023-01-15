import fs from 'fs'
import readingTime from 'reading-time'
import path from 'path'
import getAllFilesRecursively from './utils/files'
import dateSortDesc from './utils/dateSort'
import compileNotebook from './compileNotebook'
import { bundleMDX } from '@eduardo-exists/mdx-bundler'
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
  return files
    .map((file) => file.slice(prefixPaths.length + 1).replace(/\\/g, '/'))
    .filter((file) => {
      if (path.extname(file) !== '.ipynb') {
        return false
      }

      return true
    })
}

export async function getNotebookBySlug(folder, slug) {
  const ipynbPath = path.join(root, 'data', folder, `${slug}.ipynb`)
  const notebookFile = await fs.readFileSync(ipynbPath)
  const notebookJSON = await JSON.parse(notebookFile)
  const nbAST = await compileNotebook(notebookJSON)

  // https://github.com/kentcdodds/mdx-bundler#nextjs-esbuild-enoent
  if (process.platform === 'win32') {
    process.env.ESBUILD_BINARY_PATH = path.join(
      process.cwd(),
      'node_modules',
      'esbuild',
      'esbuild.exe'
    )
  } else {
    process.env.ESBUILD_BINARY_PATH = path.join(
      process.cwd(),
      'node_modules',
      'esbuild',
      'bin',
      'esbuild'
    )
  }

  let toc = []

  const { code } = await bundleMDX(nbAST, {
    // mdx imports can be automatically source from the components directory
    cwd: path.join(process.cwd(), 'components'),
    xdmOptions(options) {
      // this is the recommended way to add custom remark/rehype plugins:
      // The syntax might look weird, but it protects you in case we add/remove
      // plugins in the future.
      options.format = 'html'
      return options
    },
    esbuildOptions: (options) => {
      options.loader = {
        ...options.loader,
        '.js': 'jsx',
      }
      return options
    },
  })
  return {
    toc,
    mdxSource: code.replace(/vAlign/g, 'valign'),
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
    .filter((frontmatter) => !frontmatter.draft)

  return notebookFrontMatter.sort((a, b) => dateSortDesc(a.date, b.date))
}
