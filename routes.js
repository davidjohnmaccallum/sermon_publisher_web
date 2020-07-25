const dateFormat = require('dateformat')
const express = require('express')
const router = express.Router()
const admin = require('firebase-admin')
const getenv = require('getenv')

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: getenv('PROJECT_ID'),
    clientEmail: getenv('CLIENT_EMAIL'),
    privateKey: getenv('PRIVATE_KEY').replace(/\\n/g, '\n'),
  }),
  databaseURL: getenv('DATABASE_URL'),
})

const docToSermon = (doc) => {
  const data = doc.data()
  return {
    id: doc.id,
    ...data,
    preachedOn: data.preachedOn
      ? dateFormat(data.preachedOn.toDate(), "ddd d mmm yyyy 'at' h tt")
      : undefined,
    bibleLink: data.bibleReferences
      ? `https://www.biblegateway.com/passage/?search=${encodeURI(
          data.bibleReferences
        )}`
      : undefined,
  }
}

const davidsUserId = 'TVkkJCFxh3dxoGhmZGcgYYtd1Ou2'
router.get('/', async (req, res, next) => {
  try {
    // Get users
    const usersQuery = await admin
      .firestore()
      .collection('users')
      .orderBy('ministryName')
      .get()
    const users = usersQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    res.render('user-list', { title: 'Ministries', users })
  } catch (err) {
    next(err)
  }
})

router.get('/:userId/', async (req, res, next) => {
  try {
    // Get user
    const userRef = admin.firestore().collection('users').doc(req.params.userId)
    const userDoc = await userRef.get()
    if (!userDoc.exists) {
      return res.status(404).render('_404', {
        message: 'Ministry not found',
        homeHref: '/',
        title: 'Ministry not found',
      })
    }
    const user = { id: userDoc.id, ...userDoc.data() }

    const sermonsQuery = await userRef
      .collection('sermons')
      .orderBy('preachedOn', 'desc')
      .get()
    const sermons = sermonsQuery.docs.map(docToSermon)

    res.render('sermon-list', {
      title: `${user.ministryName}: Sermon List`,
      user,
      sermons,
    })
  } catch (err) {
    next(err)
  }
})

const makeAudioUrl = (user, sermon) =>
  `https://storage.googleapis.com/${encodeURI(user.bucketName)}/${encodeURI(
    'sermons/' + sermon.id
  )}`

/**
 * The sermon page. A user id and a sermon id are passed in as inputs.
 *
 */
router.get('/:userId/sermon/:sermonId', async (req, res, next) => {
  try {
    // Get user
    const userRef = admin.firestore().collection('users').doc(req.params.userId)
    const userDoc = await userRef.get()
    if (!userDoc.exists) {
      return res.status(404).render('_404', {
        message: 'Ministry not found',
        homeHref: '/',
        title: 'Ministry not found',
      })
    }
    const user = { id: userDoc.id, ...userDoc.data() }

    // Get sermon
    const sermonRef = userRef.collection('sermons').doc(req.params.sermonId)
    const sermonDoc = await sermonRef.get()
    if (!sermonDoc.exists) {
      return res.status(404).render('_404', {
        message: 'Sermon not found',
        homeHref: `/${user.id}`,
        title: `${user.ministryName}: Sermon not found`,
      })
    }
    const sermon = docToSermon(sermonDoc)

    const listens = sermon.listens != undefined ? sermon.listens : 0
    await sermonRef.update({ listens: listens + 1 })

    // Get audio file
    const file = admin
      .storage()
      .bucket(user.bucketName)
      .file(`sermons/${sermon.id}`)
    const exists = await file.exists()
    if (!exists[0]) {
      console.error('Sermon audio file not found', file.name)
      return res.status(404).render('_404', {
        message: 'Sermon audio file not found',
        homeHref: `/${user.id}`,
        title: `${user.ministryName}: Sermon audio file not found`,
      })
    }
    const metadata = await file.getMetadata()

    res.render('sermon', {
      title: `${user.ministryName}: ${sermon.title}`,
      user,
      sermon,
      audioUrl: makeAudioUrl(user, sermon),
      contentType: metadata[0].contentType,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * Provides direct access to the sermon audio file.
 */
router.get('/:userId/sermon/:sermonId/download', async (req, res, next) => {
  try {
    // Get user
    const userRef = admin.firestore().collection('users').doc(req.params.userId)
    const userDoc = await userRef.get()
    if (!userDoc.exists) {
      return res.status(404).render('_404', {
        message: 'Ministry not found',
        homeHref: '/',
        title: 'Ministry not found',
      })
    }
    const user = { id: userDoc.id, ...userDoc.data() }

    // Get sermon
    const sermonRef = userRef.collection('sermons').doc(req.params.sermonId)
    const sermonDoc = await sermonRef.get()
    if (!sermonDoc.exists) {
      return res.status(404).render('_404', {
        message: 'Sermon not found',
        homeHref: `/${user.id}`,
        title: `${user.ministryName}: Sermon not found`,
      })
    }
    const sermon = docToSermon(sermonDoc)

    res.redirect(makeAudioUrl(user, sermon))
  } catch (err) {
    next(err)
  }
})

module.exports = router
