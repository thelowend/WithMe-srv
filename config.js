require('dotenv').config()

const config = {
  environment: process.env.NODE_ENV || 'dev',
  server: {
    port: process.env.PORT || 8080
  },
  mongo: {
    url: process.env.MONGO_DB_URI || 'mongodb://localhost/withmedb'
  },
  notifications: {
    appId: process.env.NOTIFICATIONS_APP_ID,
    apiKey: process.env.NOTIFICATIONS_KEY,
    apiUrl: process.env.NOTIFICATIONS_API
  }
}

module.exports = config
