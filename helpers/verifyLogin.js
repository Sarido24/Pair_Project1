const bcrypt = require('bcryptjs')

function verify(user, password){
    let isValid = bcrypt.compareSync(password, user.password )
    if(isValid){
        return true
    }else{
        return false
    }
}

module.exports =verify