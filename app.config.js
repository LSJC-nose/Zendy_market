import 'dotenv/config';

export default ({ config }) => {
  const expo = {
    ...config.expo,
    android: {
      ...(config.expo?.android || {}),
      package: process.env.ANDROID_PACKAGE || 'com.ZendyMarket.tuapp'
    },
    eas: {
      projectId: process.env.EAS_PROJECT_ID || 'e835aca7-65d2-4716-bda3-55345b6b6ed6'
    },
    extra: {
      ...(config.expo?.extra || {}),
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID
    },
    cli: {
      ...(config.expo?.cli || {}),
      appVersionSource: 'manifest'
    }
  };

  return {
    ...config,
    expo
  };
};