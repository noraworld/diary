let container = document.querySelector('.container-md')
let hostname = window.location.hostname

for (let link of container.querySelectorAll('a')) {
  let href = link.getAttribute('href')
  // https://sarchitect.net/11237/
  let linkHostnameRegex = href.match(/^https?:\/{2,}(.*?)(?:\/|\?|#|$)/)
  let linkHostname
  if (linkHostnameRegex) {
    linkHostname = linkHostnameRegex[1]
  }

  if (hostname !== linkHostname && linkHostname) {
    link.setAttribute('target', '_blank')
    link.textContent += ' ⇱ '
  }
}
