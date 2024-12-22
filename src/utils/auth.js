
const AccessTokenKey = 'ACCESS_TOKEN'
const RefreshTokenKey = 'REFRESH_TOKEN'

// ========== Token 相关 ==========

// TODO should rename to local storage?
export function getAccessToken() {
    return localStorage.getItem(AccessTokenKey)
}

export function setToken(token) {
    localStorage.setItem(AccessTokenKey, token.accessToken)
    localStorage.setItem(RefreshTokenKey, token.refreshToken)
}

export function removeToken() {
    localStorage.removeItem(AccessTokenKey)
    localStorage.removeItem(RefreshTokenKey)
}

export function getRefreshToken() {
    return localStorage.getItem(RefreshTokenKey)
}
