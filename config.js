var config = null;

switch (process.env.NODE_ENV) {
  case 'development' :
    config = {
      ip : '127.0.0.1',
      port : '8080'
    };
    break;
  default :
    config = {
      ip : '127.0.0.1',
      port : '8080'
    };
}

module.exports = config;