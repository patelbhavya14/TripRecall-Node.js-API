const env = process.env.NODE_ENV || "default";

const config = {
  default: {
    mongoURI: "mongodb://localhost:27017/triprecall",
    jwtSecret: "secret",
  },
  test: {
    mongoURI: "mongodb://localhost:27017/triprecall",
    jwtSecret: "secret",
  },
  production: {
    mongoURI: process.env.DB_HOST,
    jwtSecret: process.env.JWT_SECRET,
  },
};

config.get = (props) => {
  return config[env][props];
};

module.exports = config;
