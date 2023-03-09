const { Op } = require('sequelize');
const { User, Profile, Post, Tag, Comment } = require('../models')
const formatDate = require('../helpers/formatDate');

class Controller {
  static showLandingPage(req, res) {
    const options = {
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          include: {
            model: Profile,
            attributes: ['fullName', 'lastName']
          }
        },
        {
          model: Tag,
          attributes: ['name'],
          through: {
            attributes: []
          }
        }
      ]
    };
    Promise.all([Post.postsPerMonth(), Post.findAll(options)])
      .then(([{ count: postsPerMonth }, posts]) => {
        res.render('landing-page', { posts, formatDate, postsPerMonth });
      })
      .catch(err => {
        console.error(err);
        res.send(err);
      });
  }

  static renderPostManagementPage(req, res) {
    const UserId = 1;
    const { title } = req.query;
    const options = {
      where: {
        UserId
      }
    };
    if (title) options.where.title = { [Op.iLike]: `%${title}%` };
    Post.findAll(options)
      .then(posts => {
        res.render('post-management', { posts, title });
      })
      .catch(err => {
        console.error(err);
        res.send(err);
      });
  }

  static postDetail(req, res) {
    const { id } = req.params;
    const { error } = req.query;
    const options = {
      include: [
        {
          model: User,
          include: {
            model: Profile,
            attributes: ['fullName', 'lastName']
          }
        },
        {
          model: User,
          as: 'UserComments',
          attributes: ['username'],
          include: {
            model: Profile,
            attributes: ['fullName', 'lastName']
          },
          through: {
            attributes: ['content']
          }
        },
        {
          model: Tag,
          through: {
            attributes: []
          }
        }
      ]
    };
    Post.findByPk(+id, options)
      .then(post => {
        res.render('post-detail', { post, formatDate, error });
      })
      .catch(err => {
        console.error(err);
        res.send(err);
      });
  }

  static renderAddPost(req, res) {
    const { errors } = req.query;
    res.render('add-post', { errors });
  }

  static handleAddPost(req, res) {
    const UserId = 1;
    let { title, description, imageUrl, tags } = req.body;
    tags = tags.split(',');
    Post.create({ title, description, imageUrl, UserId })
      .then((post) => {
        Promise.all(tags.map(tag => Tag.findOne({ where: { name: tag } })))
          .then(tagInstances => {
            return Promise.all(tagInstances.map((tagInstance, i) => {
              if (tagInstance) return post.addTag(tagInstance);
              return post.createTag({ name: tags[i] });
            }));
          });
      })
      .then(() => {
        res.redirect('/');
      })
      .catch(err => {
        console.error(err);
        if (err.name === 'SequelizeValidationError') {
          const errors = err.errors.map(error => error.message);
          return res.redirect(`/posts/add?errors=${errors}`);
        }
        res.send(err);
      });
  }

  static renderEditPost(req, res) {
    const { id } = req.params;
    const { errors } = req.query;
    const options = {
      include: {
        model: Tag,
        attributes: ['name'],
        through: {
          attributes: []
        }
      }
    };
    Post.findByPk(+id, options)
      .then(post => {
        const tags = post.Tags.map(tag => tag.name);
        res.render('edit-post', { post, tags, errors });
      })
      .catch(err => {
        console.error(err);
        res.send(err);
      })
  }

  static handleEditPost(req, res) {
    const UserId = 1;
    const { id } = req.params;
    let { title, description, imageUrl, tags } = req.body;
    const options = { include: Tag };
    let postToBeUpdated;
    tags = tags.split(',');
    Post.findByPk(+id, options)
      .then(post => {
        postToBeUpdated = post;
        return post.removeTags(post.Tags);
      })
      .then(() => {
        return Promise.all(tags.map(tag => Tag.findOne({ where: { name: tag } })));
      })
      .then(tagInstances => {
        return Promise.all(tagInstances.map((tagInstance, i) => {
          if (tagInstance) return postToBeUpdated.addTag(tagInstance);
          return postToBeUpdated.createTag({ name: tags[i] });
        }));
      })
      .then(() => {
        return postToBeUpdated.update({ title, description, imageUrl });
      })
      .then(() => {
        res.redirect(`/posts`);
      })
      .catch(err => {
        console.error(err);
        if (err.name === 'SequelizeValidationError') {
          const errors = err.errors.map(error => error.message);
          return res.redirect(`/posts/edit/${id}?errors=${errors}`);
        }
        res.send(err);
      });
  }


  static deletePost(req, res) {
    const { id } = req.params;
    const options = {
      include: [Tag, { model: User, as: 'UserComments' }]
    };
    let postToBeRemoved;
    Post.findByPk(+id, options)
      .then(post => {
        postToBeRemoved = post;
        return Promise.all([
          post.removeTags(post.Tags),
          post.removeUserComments(post.UserComments)
        ]);
      })
      .then(() => {
        return postToBeRemoved.destroy();
      })
      .then(() => {
        res.redirect('/posts');
      })
      .catch(err => {
        console.error(err);
        res.send(err);
      });
  }

  static addComment(req, res) {
    const { content } = req.body;
    const { id } = req.params;
    const UserId = 1;
    Comment.create({ content, PostId: id, UserId })
      .then(() => {
        res.redirect(`/posts/detail/${id}`);
      })
      .catch(err => {
        console.error(err);
        if (err.name === 'SequelizeValidationError') {
          const error = err.errors[0].message;
          return res.redirect(`/posts/detail/${id}?error=${error}`);
        }
        res.send(err);
      });
  }

  static register(req, res) {

  }
}

module.exports = Controller