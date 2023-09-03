import { Rule } from '../types'
import { htmlElementAttributes } from 'html-element-attributes'
import { htmlEventAttributes } from 'html-event-attributes'
import { svgElementAttributes } from 'svg-element-attributes'
import { svgEventAttributes } from 'svg-event-attributes'

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

export default {
  id: 'attr-invalid',
  description: 'Attributes must be valid for the given HTML or SVG tags.',
  init(parser, reporter) {
    const commonAttributes = htmlElementAttributes['*'] || [] // Ensure this is an array.
    const commonSvgAttributes = svgElementAttributes['*'] || [] // Ensure this is an array.

    parser.addListener('tagstart', (event) => {
      const tagName = event.tagName.toLowerCase() // Use the lower case version for consistency.
      const attrs = event.attrs

      let validAttributesForTag = []

      if (svgTags.includes(tagName)) {
        // If the tag is an SVG tag, use SVG attributes
        const specificSvgAttributes = svgElementAttributes[tagName] || []
        validAttributesForTag = [
          ...commonSvgAttributes,
          ...specificSvgAttributes,
          ...(svgEventAttributes || []),
        ]
      } else {
        // If the tag is a regular HTML tag, use HTML attributes
        const specificAttributes = htmlElementAttributes[tagName] || []
        const offests = [
          'xmlns',
          'xmlns:xlink',
          'xml:lang',
          'xml:space',
          'xmlns:xml',
        ] // These are valid attributes for all HTML tags.
        validAttributesForTag = [
          ...offests,
          ...commonAttributes,
          ...specificAttributes,
          ...(htmlEventAttributes || []),
        ]
      }

      for (const attr of attrs) {
        // Skip attributes that are allowed based on special patterns.
        if (/^data-.+$/.test(attr.name)) continue
        if (/^aria-.+$|^role$/.test(attr.name)) continue
        if (/^adapt-.+$/.test(attr.name)) continue

        if (!validAttributesForTag.includes(attr.name)) {
          reporter.error(
            `The attribute [ ${attr.name} ] is not valid for the tag [ ${tagName} ].`,
            event.line,
            event.col + event.tagName.length + 1 + attr.index,
            this,
            attr.raw
          )
        }
      }
    })
  },
} as Rule
