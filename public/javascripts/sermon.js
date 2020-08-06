const SermonPage = function (ministryName, sermonTitle, c1, c2) {
  const audioPlayer = document.getElementById('audioPlayer')
  const playButton = document.getElementById('playButton')
  const pauseButton = document.getElementById('pauseButton')
  const bibleLink = document.getElementById('bibleLink')
  const shareButton = document.getElementById('shareButton')
  const emailContactButton = document.getElementById('emailContactButton')
  const phoneContactButton = document.getElementById('phoneContactButton')

  c1 &&
    emailContactButton &&
    emailContactButton.addEventListener('click', function () {
      gtag('event', 'email_contact_button_click', {
        event_category: ministryName,
        event_label: sermonTitle,
      })
      window.location.href = c1
        .split(',')
        .map((it) => it >> 1)
        .map((it) => String.fromCharCode(it))
        .join('')
    })

  c2 &&
    phoneContactButton &&
    phoneContactButton.addEventListener('click', function () {
      gtag('event', 'phone_contact_button_click', {
        event_category: ministryName,
        event_label: sermonTitle,
      })
      window.location.href = c2
        .split(',')
        .map((it) => it >> 1)
        .map((it) => String.fromCharCode(it))
        .join('')
    })

  // Show share button if sharing API available
  if (navigator.share) shareButton.style.display = 'initial'

  // Share button
  shareButton.addEventListener('click', function () {
    gtag('event', 'share_button_click', {
      event_category: ministryName,
      event_label: sermonTitle,
    })
    navigator.share({
      url: window.location.href,
    })
  })

  // When paused show play button.
  audioPlayer.addEventListener('pause', function () {
    playButton.style.display = 'inline-block'
    pauseButton.style.display = 'none'
  })

  // When playing show pause button.
  audioPlayer.addEventListener('play', function () {
    playButton.style.display = 'none'
    pauseButton.style.display = 'inline-block'
  })

  // Analytics. Log bible link click.
  let bibleLinkClicked = false
  bibleLink &&
    bibleLink.addEventListener('click', function () {
      if (bibleLinkClicked) return
      gtag('event', 'bible_link_click', {
        event_category: ministryName,
        event_label: sermonTitle,
      })
      bibleLinkClicked = true
    })

  // Analytics. Log inital play event.
  let startLogged = false
  audioPlayer.addEventListener('play', function () {
    if (startLogged) return
    gtag('event', 'listen_start', {
      event_category: ministryName,
      event_label: sermonTitle,
    })
    startLogged = true
  })

  // Analytics. Log listened to end.
  let completeLogged = false
  audioPlayer.addEventListener('timeupdate', function (event) {
    if (completeLogged) return
    // If listener gets to the last 30 seconds treat as complete
    if (event.target.duration - event.target.currentTime > 30) return
    gtag('event', 'listen_complete', {
      event_category: ministryName,
      event_label: sermonTitle,
    })
    completeLogged = true
  })
}
