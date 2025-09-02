
const bcrypt = require('bcrypt');

bcrypt.hash('123456', 10).then((hash) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Hash:", hash);
  }
  
});
