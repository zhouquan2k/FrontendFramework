let navbarExtension = null;

export function setNavbarExtension(config) {
  navbarExtension = config || null;
}

export function getNavbarExtension() {
  return navbarExtension;
}

export function clearNavbarExtension() {
  navbarExtension = null;
}
