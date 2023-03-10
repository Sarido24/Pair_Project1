'use strict';
const bcrypt = require('bcryptjs')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Post)
      User.hasOne(models.Profile)
      User.belongsToMany(models.Post, { through: models.Comment, as: 'PostComments' })
    }
  }
  User.init({
    username: {
      type:DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Username sudah ada yang punya kasihannn"
      },
      validate: {
        notEmpty: {
          msg: "username harus di isi"
        },
        notNull: {
          msg: "username harus di isi"
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "password harus di isi"
        },
        notNull: {
          msg: "password harus di isi"
        }
      }

    },
    email: {
      type: DataTypes.STRING,
      unique: {
        msg: "Maaf nih email yang kamu masukkan sudah ada yang punya"
      },
      validate: {
        isEmail: {
          msg: "masukkan sebuah email"
        }
      }
    
    },
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  User.beforeCreate((user) => {
    user.role = "user"
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(user.password, salt)
    user.password = hash
  });
  return User;
};


