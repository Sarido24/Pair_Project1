'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Post.belongsTo(models.User)
      Post.belongsToMany(models.Tag, { through: models.TagPost })
      Post.belongsToMany(models.User, { through: models.Comment, as: 'UserComments' })
    }

    static postsPerMonth() {
      const options = {
        attributes: [sequelize.fn('date_part', 'month', sequelize.col('createdAt'))],
        group: [[sequelize.fn('date_part', 'month', sequelize.col('createdAt'))]]
      }
      return Post.findAndCountAll(options);
    }

    shortDesc() {
      if (this.description.length > 25) {
        return `${this.description.substring(0, 23)}...`
      }
      return this.description;
    }
  }
  Post.init({
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Title must not be empty!'
        }
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Image URL must not be empty!'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: {
          msg: 'Description must not be empty!'
        }
      }
    },
    UserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};