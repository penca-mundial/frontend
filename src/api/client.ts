import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

const LOGIN_PATH = '/login'
// A 401 from the auth probe just means "logged out" — it must not redirect.
const AUTH_PROBE_PATH = '/auth/me'
const CSRF_COOKIE = 'CSRF-TOKEN'
const CSRF_HEADER = 'X-CSRF-Token'
const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete'])

/**
 * Single axios instance shared by every API module. Auth is cookie-based:
 * `withCredentials` makes the browser send the httpOnly session cookie set
 * by the backend on login.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Navigation indirection for the 401 handler: keeps the redirect mockable in
 * tests and gives a seam to switch to client-side routing later.
 */
export const navigation = {
  redirectToLogin() {
    if (window.location.pathname !== LOGIN_PATH) {
      window.location.assign(LOGIN_PATH)
    }
  },
}

function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

// Attach the CSRF token (read from a cookie) to mutating requests.
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = config.method?.toLowerCase()
  if (method && MUTATING_METHODS.has(method)) {
    const token = readCookie(CSRF_COOKIE)
    if (token) {
      config.headers.set(CSRF_HEADER, token)
    }
  }
  return config
})

/**
 * Broadcast server (5xx) errors so the notifications UI can surface a toast.
 * Kept decoupled via a DOM event because the toast layer is wired separately.
 */
function notifyServerError(error: AxiosError) {
  window.dispatchEvent(
    new CustomEvent('penca:server-error', {
      detail: { status: error.response?.status, message: error.message },
    }),
  )
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    if (status === 401) {
      const url = error.config?.url ?? ''
      if (!url.includes(AUTH_PROBE_PATH)) {
        navigation.redirectToLogin()
      }
    } else if (status !== undefined && status >= 500) {
      notifyServerError(error)
    }
    return Promise.reject(error)
  },
)

export async function get<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.get<T>(url, config)
  return data
}

export async function post<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.post<T>(url, body, config)
  return data
}

export async function put<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.put<T>(url, body, config)
  return data
}

export async function patch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.patch<T>(url, body, config)
  return data
}

export async function del<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.delete<T>(url, config)
  return data
}
