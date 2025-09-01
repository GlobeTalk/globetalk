
export function getHeaderText() {
  const header = document.querySelector("h1");
  return header ? header.textContent : null;
}

export function getJoinButtonText() {
  const button = document.querySelector("#joinBtn");
  return button ? button.textContent : null;
}

export function getJoinButtonLink() {
  const link = document.querySelector("a");
  return link ? link.getAttribute("href") : null;
}
