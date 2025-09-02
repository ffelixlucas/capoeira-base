
const bcrypt = require('bcrypt');
const logger = require("../backend/utils/logger");


bcrypt.hash('123456', 10).then((hash) => {
    logger.log("Hash:", hash);
  }
  
);
