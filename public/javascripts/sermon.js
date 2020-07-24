const audioPlayer = document.getElementById('audioPlayer')
const playButton = document.getElementById('playButton')
const pauseButton = document.getElementById('pauseButton')
const bibleLink = document.getElementById('bibleLink')
const shareButton = document.getElementById('shareButton')

// Show share button if sharing API available
if (navigator.share) shareButton.style.display = 'initial'

// Share button
shareButton.addEventListener('click', function () {
  navigator.share({
    // title: sermonTitle,
    // text: sermonDescription,
    url: window.url,
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
const bibleLinkClicked = false
bibleLink.addEventListener('click', function () {
  if (bibleLinkClicked) return
  gtag('event', 'bible_link_click', {
    event_category: '#{user.ministryName}',
    event_label: '#{sermon.title}',
  })
  bibleLinkClicked = true
})

// Analytics. Log inital play event.
const startLogged = false
audioPlayer.addEventListener('play', function () {
  if (startLogged) return
  gtag('event', 'listen_start', {
    event_category: '#{user.ministryName}',
    event_label: '#{sermon.title}',
  })
  startLogged = true
})

// Analytics. Log listened to end.
const completeLogged = false
audioPlayer.addEventListener('timeupdate', function (event) {
  if (completeLogged) return
  // If listener gets to the last 30 seconds treat as complete
  if (event.target.duration - event.target.currentTime > 30) return
  gtag('event', 'listen_complete', {
    event_category: '#{user.ministryName}',
    event_label: '#{sermon.title}',
  })
  completeLogged = true
})
