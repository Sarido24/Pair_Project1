const bcrypt = require('bcryptjs')

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync('23456', salt)

console.log(hash);

console.log(bcrypt.compareSync('23456', hash))