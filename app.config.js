const dotenv = require('dotenv');
dotenv.config();

module.exports = ({ config }) => {
  const baseExpo = config.expo || {};

  const expo = {
    ...baseExpo,

    extra: {
      ...(baseExpo.extra || {}),
      eas: {
        ...(baseExpo.extra?.eas || {}),

        projectId:
          process.env.EAS_PROJECT_ID ||
          baseExpo.extra?.eas?.projectId ||
          '66aa1b56-21bb-479e-b061-106b67ae7ffe'
      },
      FIREBASE_API_KEY:
        process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
        process.env.FIREBASE_API_KEY ||
        baseExpo.extra?.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN:
        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
        process.env.FIREBASE_AUTH_DOMAIN ||
        baseExpo.extra?.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID:
        process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
        process.env.FIREBASE_PROJECT_ID ||
        baseExpo.extra?.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET:
        process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        process.env.FIREBASE_STORAGE_BUCKET ||
        baseExpo.extra?.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
        process.env.FIREBASE_MESSAGING_SENDER_ID ||
        baseExpo.extra?.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID:
        process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
        process.env.FIREBASE_APP_ID ||
        baseExpo.extra?.FIREBASE_APP_ID,
      FIREBASE_MEASUREMENT_ID:
        process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ||
        process.env.FIREBASE_MEASUREMENT_ID ||
        baseExpo.extra?.FIREBASE_MEASUREMENT_ID
    },
    cli: {
      ...(baseExpo.cli || {}),
      appVersionSource: 'manifest'
    }
  };

  // Ensure package / bundle identifiers are present for EAS builds.
  
  // Define package and bundle identifier consistently
  const BUNDLE_IDENTIFIER = 'com.lsjc.zendymarket';
  const PACKAGE = 'com.lsjc.zendymarket';
  
  expo.android = {
    ...(baseExpo.android || {}),
    package: process.env.ANDROID_PACKAGE || PACKAGE,
    versionCode: baseExpo.version ? parseInt(baseExpo.version.replace(/\./g, '')) : 1
  };

  expo.ios = {
    ...(baseExpo.ios || {}),
    bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER || BUNDLE_IDENTIFIER
  };

  return {
    ...config,
    expo,
    // Set owner at the root of the config so EAS can read it (can be overridden via env var)
    owner: process.env.EXPO_OWNER || config.owner || 'lsjc'
  };
};