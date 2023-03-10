const { Op } = require('sequelize')
const { User, Profile, Post, Tag, Comment } = require('../models/index')
const verify = require('../helpers/verifyLogin')
const formatDate = require('../helpers/formatDate')
class Controller {
  static home(req, res) {
    res.render('home')
  }

  static register(req, res) {
    const { errorRegister } = req.query
    res.render('register', { errorRegister })
  }

  static postRegister(req, res) {
    const { username, password, email } = req.body

    User.create({ username, password, email })
      .then((user) => {
        user.createProfile({
          firstName: username,
          lastname: "",
          age: null,
          phone: ""
        })
          .then(() => {
            res.redirect('/login')

          })
      })
      .catch((err) => {
        if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {

          const errorRegister = err.errors.map((el) => {
            return el.message
          })

          res.redirect(`/register?errorRegister=${errorRegister}`)
        } else {
          res.send(err)
        }

      })
  }
  static login(req, res) {
    const { error } = req.query
    const isLoggedIn = req.session.username ? true : false;
    res.render('login', { error, isLoggedIn })
  }
  static postLogin(req, res) {
    const { username, password } = req.body
    User.findOne({
      where: { username }
    })
      .then((dataUser) => {
        if (dataUser) {
          let status = verify(dataUser, password)
          if (status === true) {//case berhasil login
            req.session.username = dataUser.username
            req.session.role = dataUser.role
            req.session.userId = dataUser.id
            return res.redirect('/')
          } else {
            const error = "Password yang anda masukkan salah!"
            return res.redirect(`/login?error=${error}`)
          }
        } else {
          const error = "Username tidak ditemukan!"
          return res.redirect(`/login?error=${error}`)
        }

      })
      .catch((err) => {
        res.send(err)
      })
  }

  static logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        res.send(err)
      } else {
        res.redirect('/login')
      }
    })
  }

  static userProfile(req, res) {
    const id = req.session.userId
    Profile.findOne({
      include: User,
      where: { UserId: id }
    })
      .then((data) => {
        res.render('myProfile', { data })
      })
      .catch((err) => {
        res.send(err)
      })
  }

  static addToProfile(req, res) {
    const id = req.session.userId
    Profile.findOne({
      where: { UserId: id }
    })
      .then((data) => {
        if (data) {
          res.render('addToProfile', { data })
        } else {
          Profile.create({
            firstName: "",
            lastname: "",
            age: null,
            phone: "",
            UserId: id
          })
          res.redirect('/addProfile')
        }

      })
      .catch((err) => {
        res.send(err)
      })
  }

  static postAddToProfile(req, res) {
    const { id } = req.params
    const { firstName, lastName, age, phone } = req.body
    Profile.update({
      firstName,
      lastName,
      age,
      phone
    },
      {
        where: { id }
      }

    )
      .then(() => {
        res.redirect('/userProfile')
      })
      .catch((err) => {
        res.send(err)
      })


  }

  static update(req, res) {
    Profile.findAll({ include: User })
      .then(profiles => {
        res.render('update', { profiles });
      })
      .catch(err => {
        console.error(err);
        res.send(err);
      })
  }

  static updateRole(req, res) {
    const { role } = req.body;
    const { id } = req.params;
    User.update({ role }, { where: { id: +id } })
      .then(() => {
        res.redirect('/update');
      })
      .catch(err => {
        console.error(err);
        res.send(err);
      })
  }

  // For posts
  static showLandingPage(req, res) {
    const options = {
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          include: {
            model: Profile,
            attributes: ['firstName', 'lastName']
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
    const UserId = req.session.userId;
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
            attributes: ['firstName', 'lastName']
          }
        },
        {
          model: User,
          as: 'UserComments',
          attributes: ['username'],
          include: {
            model: Profile,
            attributes: ['firstName', 'lastName']
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
    const UserId = req.session.userId;
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
        res.redirect('/posts');
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
    const UserId = req.session.userId;
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
      })
  }

  static addComment(req, res) {
    const { content } = req.body;
    const { id } = req.params;
    const UserId = req.session.userId;
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
}

module.exports = Controller