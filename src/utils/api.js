const ALPEN_FAUCET_API_URL = import.meta.env.VITE_ALPEN_FAUCET_API_URL;

/**
 * Handles a fetch response, auto-detecting JSON or plain text.
 * Returns an object with { ok: true, data } or { ok: false, error }.
 *
 * @param {Response} res - The fetch Response object.
 * @returns {Promise<{ ok: true, data: any } | { ok: false, error: string }>}
 */
export async function handleResponse(res) {
    const raw = await res.text(); // read body once
  
    if (!res.ok) {
        return { ok: false, error: raw };
    }

    // Response is OK — try to parse as JSON
    try {
      const data = JSON.parse(raw);
      return { ok: true, data };
    } catch {
      return { ok: true, data: raw.trim() }; // fallback to plain text
    }
}

/**
 * Calls the faucet-api url. On error, logs the error with given context.
 * @returns {Promise<Object|null>} Response from the backend.
 */
async function safeFetchJson(url, context) {
    try {
        const res = await fetch(url);
        const result = await handleResponse(res);
  
        if (!result.ok) {
            console.error(`${context}:`, result.error);
            return { ok: false, error: result.error };
        }
  
        return { ok: true, data: result.data };
    } catch (e) {
        console.error(`${context}:`, e);
        return { ok: false, error: e };
    }
}

/**
 * Calls the faucet's /pow_challenge endpoint.
 * @returns {Promise<Object|null>} Response from the backend.
 */
export function getClaimAmount(chain) {
    return safeFetchJson(`${ALPEN_FAUCET_API_URL}/sats_to_claim/${chain}`, "Failed to get claim amount");
}

/**
 * Calls the faucet's /pow_challenge endpoint.
 * @returns {Promise<Object|null>} Response from the backend.
 */
export function getPowChallenge(chain) {
    return safeFetchJson(`${ALPEN_FAUCET_API_URL}/pow_challenge/${chain}`, "Failed to fetch Proof of Work");
}

/**
 * Calls the faucet's /claim_l2/:solution/:address endpoint.
 * @param {string} solution - The solution found for the PoW challenge.
 * @param {string} address - The user's Ethereum address.
 * @returns {Promise<Object>} Response from the backend.
 */
export async function submitClaim(solution, address) {
    return safeFetchJson(
        `${ALPEN_FAUCET_API_URL}/claim_l2/${solution}/${address}`,
        "Failed to claim test BTC"
    );
}
