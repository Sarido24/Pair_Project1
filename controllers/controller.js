const { User, Profile, Post, Tag, Comment } = require('../models')
const formatDate = require('../helpers/formatDate');

class Controller {
  static home(req, res) {
    const options = {
      order: [['createdAt', 'DESC']],
      include: {
        model: User,
        include: {
          model: Profile,
          attributes: ['fullName', 'lastName']
        }
      }
    };
    Post.findAll(options)
      .then(posts => {
        res.render('home', { posts, formatDate });
      })
      .catch(err => {
        console.error(err);
        res.send(err);
      });
  }

  static renderPostManagementPage(req, res) {
    const UserId = 1;
    const options = {
      include: Post
    };
    User.findByPk(UserId, options)
      .then(user => {
        res.render('post-management', { posts: user.Posts });
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
        // console.log(post.UserComments[0].Comment);
        res.render('post-detail', { post, formatDate, error });
      })
      .catch(err => {
        console.error(err);
        res.send(err);
      });
  }

  static renderAddPost(req, res) {
    res.render('add-post');
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
        // console.log(post.Tags, '<<<');
        // console.log(post.UserComments, '<<<');
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
        console.log(err);
        res.send(err);
      })
    // Post.destroy(options)
    //   .then(() => {
    //     res.redirect('/posts');
    //   })
    //   .catch(err => {
    //     console.error(err);
    //     res.send(err);
    //   })
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