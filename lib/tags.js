import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import { getFiles } from './mdx'
import { getNotebooks } from './ipynb'
import kebabCase from './utils/kebabCase'

const root = process.cwd()

const getFuncs = {
  blog: getFiles,
  notebooks: getNotebooks,
}

const getFrontMatter = {
  blog: matter,
  notebooks: (source) => {
    return { data: JSON.parse(source).metadata.frontMatter }
  },
}

export async function getAllTags(type) {
  const files = await getFuncs[type](type)
  // console.log(files)
  let tagCount = {}
  // Iterate through each post, putting all found tags into `tags`
  files.forEach((file) => {
    // console.log(file)
    const source = fs.readFileSync(path.join(root, 'data', type, file), 'utf8')
    const { data } = getFrontMatter[type](source)
    // console.log(data)
    if (data.tags && data.draft !== true) {
      data.tags.forEach((tag) => {
        const formattedTag = kebabCase(tag)
        if (formattedTag in tagCount) {
          tagCount[formattedTag] += 1
        } else {
          tagCount[formattedTag] = 1
        }
      })
    }
  })

  return tagCount
}
