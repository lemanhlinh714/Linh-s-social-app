const {withInfoPlist} = require('expo/config-plugins')
const plist = require('@expo/plist')
// oxlint-disable-next-line import/no-nodejs-modules -- Expo config plugins run in Node.
const path = require('path')
// oxlint-disable-next-line import/no-nodejs-modules -- Expo config plugins run in Node.
const fs = require('fs')

const withExtensionInfoPlist = (config, {extensionName}) => {
  return withInfoPlist(config, config => {
    const plistPath = path.join(
      config.modRequest.projectRoot,
      'modules',
      extensionName,
      'Info.plist',
    )
    const targetPath = path.join(
      config.modRequest.platformProjectRoot,
      extensionName,
      'Info.plist',
    )

    /** @type {Record<string, string>} */
    const extPlist = plist.default.parse(
      fs.readFileSync(plistPath).toString(),
    )

    extPlist['MainAppScheme'] = config.scheme
    extPlist['CFBundleName'] = '$(PRODUCT_NAME)'
    extPlist['CFBundleDisplayName'] = 'ABC social Notifications'
    extPlist['CFBundleIdentifier'] = '$(PRODUCT_BUNDLE_IDENTIFIER)'
    extPlist['CFBundleVersion'] = '$(CURRENT_PROJECT_VERSION)'
    extPlist['CFBundleExecutable'] = '$(EXECUTABLE_NAME)'
    extPlist['CFBundlePackageType'] = '$(PRODUCT_BUNDLE_PACKAGE_TYPE)'
    extPlist['CFBundleShortVersionString'] = '$(MARKETING_VERSION)'

    fs.mkdirSync(path.dirname(targetPath), {recursive: true})
    fs.writeFileSync(targetPath, plist.default.build(extPlist))

    return config
  })
}

module.exports = {withExtensionInfoPlist}
