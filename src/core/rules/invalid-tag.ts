import { Block } from '../htmlparser'
import { Rule } from '../types'

const validTags = [
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'picture',
  'pre',
  'progress',
  'q',
  'rb',
  'rp',
  'rt',
  'rtc',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr',
]

const svgTags = [
  'a',
  'altGlyph',
  'altGlyphDef',
  'altGlyphItem',
  'animate',
  'animateColor',
  'animateMotion',
  'animateTransform',
  'circle',
  'clipPath',
  'color-profile',
  'cursor',
  'defs',
  'desc',
  'discard',
  'ellipse',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feDropShadow',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',
  'filter',
  'font',
  'font-face',
  'font-face-format',
  'font-face-name',
  'font-face-src',
  'font-face-uri',
  'foreignObject',
  'g',
  'glyph',
  'glyphRef',
  'hatch',
  'hatchpath',
  'hkern',
  'image',
  'line',
  'linearGradient',
  'marker',
  'mask',
  'mesh',
  'meshgradient',
  'meshpatch',
  'meshrow',
  'metadata',
  'missing-glyph',
  'mpath',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'set',
  'stop',
  'svg',
  'switch',
  'symbol',
  'text',
  'textPath',
  'title',
  'tref',
  'tspan',
  'unknown',
  'use',
  'view',
  'vkern',
]

const allValidTags = [...new Set([...validTags, ...svgTags])]

export default {
  id: 'invalid-tag-pair',
  description: 'All tags must be valid HTML tags and they must be paired.',
  init(parser, reporter) {
    const stack: Array<Partial<Block>> = []

    parser.addListener('tagstart', (event) => {
      const tagName = event.tagName.toLowerCase()

      if (!allValidTags.includes(tagName)) {
        reporter.error(
          `The tag [ ${tagName} ] is not a valid HTML or SVG tag.`,
          event.line,
          event.col,
          this,
          event.raw
        )
      } else {
        stack.push({
          tagName: tagName,
          line: event.line,
          raw: event.raw,
        })
      }
    })

    parser.addListener('tagend', (event) => {
      const tagName = event.tagName.toLowerCase()

      if (!allValidTags.includes(tagName)) {
        reporter.error(
          `The closing tag [ ${tagName} ] is not a valid HTML or SVG tag.`,
          event.line,
          event.col,
          this,
          event.raw
        )
      } else {
        let pos
        for (pos = stack.length - 1; pos >= 0; pos--) {
          if (stack[pos].tagName === tagName) {
            break
          }
        }

        if (pos >= 0) {
          const arrTags = []
          for (let i = stack.length - 1; i > pos; i--) {
            arrTags.push(`</${stack[i].tagName}>`)
          }

          if (arrTags.length > 0) {
            const lastEvent = stack[stack.length - 1]
            reporter.error(
              `Tag must be paired, missing: [ ${arrTags.join(
                ''
              )} ], start tag match failed [ ${lastEvent.raw} ] on line ${
                lastEvent.line
              }.`,
              event.line,
              event.col,
              this,
              event.raw
            )
          }

          stack.length = pos
        } else {
          reporter.error(
            `Tag must be paired, no start tag: [ ${event.raw} ]`,
            event.line,
            event.col,
            this,
            event.raw
          )
        }
      }
    })

    parser.addListener('end', () => {
      const arrTags = []
      for (let i = stack.length - 1; i >= 0; i--) {
        arrTags.push(`</${stack[i].tagName}>`)
      }

      if (arrTags.length > 0) {
        const lastEvent = stack[stack.length - 1]
        reporter.error(
          `Tag must be paired, missing: [ ${arrTags.join(
            ''
          )} ], open tag match failed [ ${lastEvent.raw} ] on line ${
            lastEvent.line
          }.`,
          0,
          0,
          this,
          ''
        )
      }
    })
  },
} as Rule
