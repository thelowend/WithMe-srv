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
    appId: process.env.NOTIFICATIONS_APP_ID || 'f9adf46b-d1d5-463f-8858-b934ef8d908c',
    apiKey: process.env.NOTIFICATIONS_KEY || 'ODE4ZjA2OWUtZWZlNS00YzliLTg2YzctYmUzOWNlODY1NGJm',
    apiUrl: process.env.NOTIFICATIONS_API || 'https://onesignal.com/api/v1/',
  }
}

module.exports = config
