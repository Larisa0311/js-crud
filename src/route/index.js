// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

class Track {
  // Статичне приватне поле для зберігання об'єктів Track
  static #list = []

  constructor(name, author, image) {
    this.id = Math.floor(1000 + Math.random() * 9000) //Генеруємо випадкове ID
    this.name = name
    this.author = author
    this.image = image
  }

  //Статичсний метод для створення об'єкту Track і додавання його до списку #list
  static create(name, author, image) {
    const newTrack = new Track(name, author, image)
    this.#list.push(newTrack)
    return newTrack
  }

  //Статичний метод для отримання всього списку треків
  static getList() {
    return this.#list.reverse()
  }

  //Статичний метод для отримання треку по його ID
  static getById(id) {
    return Track.#list.find(
      (track) => track.id === id || null,
    )
  }
}

Track.create(
  'Інь Ян',
  'MONATIC & ROXOLANA',
  '/svg/img/In_Yan.png',
)
Track.create(
  'Baila Conmigo (Remix)',
  'Selena Gomez & Rauw Alejandro',
  '/svg/img/Conmigo.png',
)
Track.create(
  'Shameless',
  'Camila Cabello',
  '/svg/img/Shameless.png',
)
Track.create(
  'DAKITI',
  'BAD BUNNY & JHAY',
  '/svg/img/Dakiti.png',
)
Track.create('11 PM', 'Maluma', '/svg/img/11pm.png')
Track.create(
  'Інша любов',
  'Enleo',
  '/svg/img/Other_love.png',
)

console.log(Track.getList())

class PlayList {
  //Статичне пртиватне поледля зберігання списку об'єктів PlayList
  static #list = []

  constructor(name) {
    this.id = Math.floor(1000 + Math.random() * 9000) //Генеруємо випадкове ID
    this.name = name
    this.tracks = [] //Список треків, які додані до плейлиста
    this.image = 'https://picsum.photos/100/100'
  }

  //Статичний методдля створення об'єкту PlayList і додавання його до списку #list
  static create(name) {
    const newPlayList = new PlayList(name)
    this.#list.push(newPlayList)
    return newPlayList
  }

  //Статичний метод для отриманн всього списку плейлистів
  static getPlayList() {
    this.#list.reverse()
  }

  static makeMix(playList) {
    const allTracks = Track.getList()

    let randomTracks = allTracks
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)

    playList.tracks.push(...randomTracks)
  }

  static getById(id) {
    return (
      PlayList.#list.find(
        (playList) => playList.id === id,
      ) || null
    )
  }

  static findListByValue(name) {
    return this.#list.filter((playList) =>
      playList.name
        .toLowerCase()
        .includes(name.toLowerCase()),
    )
  }

  deleteTrackById(trackId) {
    this.tracks = this.tracks.filter(
      (track) => track.id !== trackId,
    )
  }

  addTrack(track) {
    this.tracks.push(track)
    this.image = this.tracks[this.tracks.length - 1].image
  }
}

// PlayList.makeMix(PlayList.create('Test'))
// PlayList.makeMix(PlayList.create('Test2'))
// PlayList.makeMix(PlayList.create('Test3'))

// console.log(PlayList.getPlayList())

// ================================================================
//  router.get Створює нам один ентпоїнт

// тут вводимо шлях (PATH) до сторінки
router.get('/', function (req, res) {
  const value = ''
  const list = PlayList.findListByValue(value)

  res.render('spotify-library', {
    style: 'spotify-library',

    data: {
      list: list.map(({ tracks, ...rest }) => ({
        ...rest,
        amount: tracks.length,
      })),
      value,
    },
  })
})

// ================================================================
//  router.get Створює нам один ентпоїнт

// тут вводимо шлях (PATH) до сторінки
router.get('/spotify-choose', function (req, res) {
  // res.render генерує нам HTML сторінку

  res.render('spotify-choose', {
    style: 'spotify-choose',
    data: {},
  })
})

// ================================================================

router.get('/spotify-create', function (req, res) {
  const isMix = !!req.query.isMix

  console.log(isMix)

  res.render('spotify-create', {
    style: 'spotify-create',

    data: {
      isMix,
    },
  })
})

// ================================================================

router.post('/spotify-create', function (req, res) {
  const isMix = !!req.query.isMix

  const name = req.body.name

  if (!name) {
    return res.render('alert', {
      style: 'alert',
      data: {
        message: 'Помилка',
        info: 'Введіть назву плейліста',
        link: isMix
          ? '/spotify-create?isMix=true'
          : '/spotify-create',
      },
    })
  }

  const playList = PlayList.create(name)

  if (isMix) {
    PlayList.makeMix(playList)
  }

  console.log(playList)

  res.render('spotify-playlist', {
    style: 'spotify-playlist',

    data: {
      playListId: playList.id,
      tracks: playList.tracks,
      name: playList.name,
    },
  })
})

// ===================================================

router.get('/spotify-playlist', function (req, res) {
  const id = Number(req.query.id)

  const playList = PlayList.getById(id)

  if (!playList) {
    return res.render('alert', {
      styles: 'alert',

      data: {
        message: 'Помилка',
        info: 'Такого плейліста не знайдено',
        link: '/',
      },
    })
  }

  res.render('spotify-playlist', {
    style: 'spotify-playlist',

    data: {
      playListId: playList.id,
      tracks: playList.tracks,
      name: playList.name,
    },
  })
})
// ===================================================

router.get('/spotify-track-delete', function (req, res) {
  const playListId = Number(req.query.playListId)
  const trackId = Number(req.query.trackId)

  const playList = PlayList.getById(playListId)

  if (!playList) {
    return res.render('alert', {
      style: 'alert',

      data: {
        message: 'Помилка',
        info: 'Такого плейліста незнайдено',
        link: `/spotify-playList?id=${playListId}`,
      },
    })
  }

  playList.deleteTrackById(trackId)
  res.render('spotify-playlist', {
    style: 'spotify-playlist',

    data: {
      playListId: playList.id,
      tracks: playList.tracks,
      name: playList.name,
    },
  })
})

// ===================================================

router.get('/spotify-track-add', function (req, res) {
  const playListId = Number(req.query.playListId)
  const playList = PlayList.getById(playListId)

  if (!playList) {
    return res.render('alert', {
      style: 'alert',

      data: {
        message: 'Помилка',
        info: 'Такого плейліста не знайдено',
        link: `/spotify-playList?id=${playListId}`,
      },
    })
  }

  res.render('spotify-track-add', {
    style: 'spotify-track-add',

    data: {
      playListId: playList.id,
      tracks: Track.getList(),
      // name: playList.name,
    },
  })
})

// ===================================================
router.post('/spotify-track-add', function (req, res) {
  const playListId = Number(req.body.playListId)
  const trackId = Number(req.body.trackId)
  console.log(playListId, trackId)

  const playList = PlayList.getById(playListId)

  if (!playList) {
    return res.render('alert', {
      style: 'alert',

      data: {
        message: 'Помилка',
        info: 'Такого плейліста не знайдено',
        link: `/spotify-playList?id=${playListId}`,
      },
    })
  }

  const trackToAdd = Track.getById(trackId)

  if (!trackToAdd) {
    return res.render('alert', {
      style: 'alert',

      data: {
        message: 'Помилка',
        info: 'Такого nhtre не знайдено',
        link: `/spotify-track-add?playListId=${playListId}`,
      },
    })
  }

  playList.addTrack(trackToAdd)

  res.render('spotify-playlist', {
    style: 'spotify-playlist',

    data: {
      playListId: playList.id,
      tracks: playList.tracks,
      name: playList.name,
    },
  })
})

// ===================================================

router.get('/spotify-search', function (req, res) {
  const value = ''

  const list = PlayList.findListByValue(value)
  res.render('spotify-search', {
    style: 'spotify-search',

    data: {
      list: list.map(({ tracks, ...rest }) => ({
        ...rest,
        amount: tracks.length,
      })),
      value,
    },
  })
})

// ===================================================

router.post('/spotify-search', function (req, res) {
  const value = req.body.value || ''

  const list = PlayList.findListByValue(value)

  console.log(value)

  res.render('spotify-search', {
    style: 'spotify-search',

    data: {
      list: list.map(({ tracks, ...rest }) => ({
        ...rest,
        amount: tracks.length,
      })),
      value,
    },
  })
})
// ===================================================
// Підключаємо роутер до бек-енду
module.exports = router
