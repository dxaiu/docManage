import Cookies from 'js-cookie'

const TokenKey = 'token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export const getItem = key => {
  return localStorage.getItem(key)
}

export const setItem = (key, value) => {
  localStorage.setItem(key, value)
}

export const removeItem = key => {
  localStorage.removeItem(key)
}
