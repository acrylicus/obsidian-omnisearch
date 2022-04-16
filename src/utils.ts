import type { CachedMetadata } from 'obsidian'
import {
  isSearchMatch,
  regexLineSplit,
  regexWikilink,
  regexYaml,
} from './globals'
import type { SearchMatch } from './globals'
import { uniqBy } from 'lodash-es'

export function highlighter(str: string): string {
  return '<span class="search-result-file-matched-text">' + str + '</span>'
}

export function escapeHTML(html: string): string {
  return html
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

/**
 * The "title" line is the first line that isn't a wikilink
 * @param text
 * @returns
 */
export function getTitleLineIndex(lines: string[]): number {
  const index = lines.findIndex(l => !regexWikilink.test(l))
  return index > -1 ? index : 0
}

/**
 * Returns the "title" line from a text
 * @param text
 * @returns
 */
export function getTitleLine(text: string): string {
  const lines = splitLines(text.trim())
  return lines[getTitleLineIndex(lines)]
}

/**
 * Removes the "title" line from a text
 * @param text
 * @returns
 */
export function removeTitleLine(text: string): string {
  const lines = splitLines(text.trim())
  const index = getTitleLineIndex(lines)
  lines.splice(index, 1)
  return lines.join('. ')
}

export function splitLines(text: string): string[] {
  return text.split(regexLineSplit).filter(l => !!l && l.length > 2)
}

export function removeFrontMatter(text: string): string {
  // Regex to recognize YAML Front Matter (at beginning of file, 3 hyphens, than any charecter, including newlines, then 3 hyphens).
  return text.replace(regexYaml, '')
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

// https://stackoverflow.com/a/3561711
export function escapeRegex(str: string): string {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

/**
 * Returns the positions of all occurences of `val` inside of `text`
 * https://stackoverflow.com/a/58828841
 * @param text
 * @param regex
 * @returns
 */
export function getAllIndices(text: string, regex: RegExp): SearchMatch[] {
  return [...text.matchAll(regex)]
    .map(o => ({ match: o[0], index: o.index }))
    .filter(isSearchMatch)
}

// export function getAllIndices(text: string, terms: string[]): SearchMatch[] {
//   let matches: SearchMatch[] = []
//   for (const term of terms) {
//     matches = [
//       ...matches,
//       ...[...text.matchAll(new RegExp(escapeRegex(term), 'gi'))]
//         .map(o => ({ match: o[0], index: o.index }))
//         .filter(isSearchMatch),
//     ]
//   }
//   return matches
//   // matches.sort((a, b) => b.match.length - a.match.length)
//   // return uniqBy(matches, 'index')
// }

export function replaceAll(
  text: string,
  terms: string[],
  cb: (t: string) => string,
): string {
  terms.sort((a, b) => a.length - b.length)
  const regs = terms.map(term => new RegExp(escapeRegex(term), 'gi'))
  for (const reg of regs) {
    text = text.replaceAll(reg, cb)
  }
  return text
}

export function extractHeadingsFromCache(
  cache: CachedMetadata,
  level: number,
): string[] {
  return (
    cache.headings?.filter(h => h.level === level).map(h => h.heading) ?? []
  )
}
