const SermonPage = function (ministryName, sermonTitle, c1, c2) {
  const verbose = true

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

  // Analytics: Log when people stop listening to the sermon.  
  const getPercentComplete = (event) => {
    /*
     * Here is my thinking:
     * Subtract 30 seconds from the sermon duration. This is because there is often
     * some dead time at the end of a talk. So the formula for percentComplete = 
     * currentTime/(duration-30). This introduces an edge case where duration < 30.
     */
    const realDuration = event.target.duration-30
    if (realDuration <= 0) return 1
    return event.target.currentTime/realDuration
  }
  
  const logPercentComplete = (event, percent, tag, listenerKey) => {
    if (getPercentComplete(event) >= percent) {
      verbose && console.info("Analytics:", tag)
      gtag('event', tag, {
        event_category: ministryName,
        event_label: sermonTitle,
      })
      audioPlayer.removeEventListener('timeupdate', percentCompleteListeners[listenerKey])
    }
  }

  const percentCompleteListeners = {
    "100": (event) => logPercentComplete(event, 1, 'listen_complete', "100"),
    "75": (event) => logPercentComplete(event, 0.75, 'listened_to_three_quarters', "75"),
    "50": (event) => logPercentComplete(event, 0.5, 'listened_to_half', "50"),
    "25": (event) => logPercentComplete(event, 0.25, 'listened_to_one_quarter', "25"),
  }

  audioPlayer.addEventListener('timeupdate', percentCompleteListeners["100"])
  audioPlayer.addEventListener('timeupdate', percentCompleteListeners["75"])
  audioPlayer.addEventListener('timeupdate', percentCompleteListeners["50"])
  audioPlayer.addEventListener('timeupdate', percentCompleteListeners["25"])

}
