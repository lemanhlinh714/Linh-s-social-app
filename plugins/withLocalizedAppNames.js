// oxlint-disable-next-line import/no-nodejs-modules -- Expo config plugins run in Node.
const fs = require('node:fs/promises')
// oxlint-disable-next-line import/no-nodejs-modules -- Expo config plugins run in Node.
const path = require('node:path')
const {withDangerousMod} = require('@expo/config-plugins')

const APP_NAMES = [
  {locale: 'en', name: 'ABC social'},
  {locale: 'vi', name: 'ABC social'},
]

module.exports = function withLocalizedAppNames(config) {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const projectRoot = config.modRequest.platformProjectRoot

      await Promise.all(
        APP_NAMES.map(async ({locale, name}) => {
          const localeDir = path.join(projectRoot, `${locale}.lproj`)
          const stringsPath = path.join(localeDir, 'InfoPlist.strings')
          const strings = `"CFBundleDisplayName" = "${name}";\n"CFBundleName" = "${name}";\n"CFBundleSpokenName" = "${name}";\n`

          await fs.mkdir(localeDir, {recursive: true})
          await fs.writeFile(stringsPath, strings, 'utf8')
        }),
      )

      return config
    },
  ])
}