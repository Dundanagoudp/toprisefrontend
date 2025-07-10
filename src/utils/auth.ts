import Cookies from "js-cookie"

export function getCookie(name: string): string | undefined {
  const value = Cookies.get(name)
  console.log(`[getCookie] Attempting to get cookie '${name}':`, value)
  return value
}

export function getAllCookies(): { [key: string]: string } {
  const allCookies = Cookies.get()
  console.log("[getAllCookies] All available cookies:", allCookies)
  return allCookies
}

export function getUserIdFromToken(): string | null {
  try {
    // First, let's see all available cookies
    const allCookies = getAllCookies()

    // Try different possible token cookie names
    const possibleTokenNames = ["token", "authToken", "auth_token", "accessToken", "access_token"]
    let token: string | undefined
    let tokenName: string | undefined

    for (const name of possibleTokenNames) {
      token = getCookie(name)
      if (token) {
        tokenName = name
        console.log(`[getUserIdFromToken] Found token with name '${name}'`)
        break
      }
    }

    if (!token) {
      console.error(
        "[getUserIdFromToken] No authentication token found in any of the expected cookie names:",
        possibleTokenNames,
      )
      console.log("[getUserIdFromToken] Available cookies:", Object.keys(allCookies))
      return null
    }

    const payloadBase64 = token.split(".")[1]
    if (!payloadBase64) {
      console.error("[getUserIdFromToken] Invalid token format - missing payload")
      return null
    }

    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
    const payloadJson = atob(paddedBase64)
    const payload = JSON.parse(payloadJson)

    console.log("[getUserIdFromToken] Token payload:", payload)
    console.log("[getUserIdFromToken] Token found in cookie:", tokenName)

    if (payload.id) {
      console.log("[getUserIdFromToken] User ID extracted:", payload.id)
      return payload.id
    } else {
      console.error("[getUserIdFromToken] User ID (id field) missing in token payload:", payload)
      return null
    }
  } catch (error) {
    console.error("[getUserIdFromToken] Failed to parse authentication token:", error)
    return null
  }
}

// Helper function to get token for API calls
export function getAuthToken(): string | null {
  // Try different possible token cookie names
  const possibleTokenNames = ["token", "authToken", "auth_token", "accessToken", "access_token"]

  for (const name of possibleTokenNames) {
    const token = getCookie(name)
    if (token) {
      console.log(`[getAuthToken] Found token with name '${name}'`)
      return token
    }
  }

  console.error("[getAuthToken] No authentication token found")
  return null
}
