const ALGO = "AES-GCM"
const KEY_NAME = "api_xray_vault_key"

async function getOrCreateKey(): Promise<CryptoKey> {
  const stored = await chrome.storage.local.get(KEY_NAME)
  if (stored[KEY_NAME]) {
    const keyData = new Uint8Array(Object.values(stored[KEY_NAME]))
    return await crypto.subtle.importKey("raw", keyData, ALGO, true, [
      "encrypt",
      "decrypt"
    ])
  }

  const key = await crypto.subtle.generateKey(
    { name: ALGO, length: 256 },
    true,
    ["encrypt", "decrypt"]
  )
  const exported = await crypto.subtle.exportKey("raw", key)
  await chrome.storage.local.set({
    [KEY_NAME]: Array.from(new Uint8Array(exported))
  })
  return key
}

export async function encryptData(data: string): Promise<string> {
  try {
    const key = await getOrCreateKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(data)

    const encrypted = await crypto.subtle.encrypt(
      { name: ALGO, iv },
      key,
      encoded
    )

    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)

    return btoa(String.fromCharCode(...combined))
  } catch (e) {
    console.error("Encryption failed:", e)
    return data
  }
}

export async function decryptData(cipherText: string): Promise<string> {
  try {
    const key = await getOrCreateKey()
    const combined = new Uint8Array(
      atob(cipherText)
        .split("")
        .map((c) => c.charCodeAt(0))
    )

    const iv = combined.slice(0, 12)
    const data = combined.slice(12)

    const decrypted = await crypto.subtle.decrypt({ name: ALGO, iv }, key, data)

    return new TextDecoder().decode(decrypted)
  } catch (e) {
    console.error("Decryption failed:", e)
    return ""
  }
}
