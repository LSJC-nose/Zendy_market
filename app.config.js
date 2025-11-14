import 'dotenv/config';

export default ({ config }) => ({
  ...config,
   android: {
    package: process.env.ANDROID_PACKAGE || 'com.ZendyMarket.tuapp'
  },
  eas: {
    projectId: process.env.EAS_PROJECT_ID || 'fb3d823e-f019-4eef-9f33-94fdd9efdaf2'
  },
  extra: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID
  },
  cli: {
      appVersionSource: 'manifest'
    },
});