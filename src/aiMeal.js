// AI meal suggestion — constrained, safety-first.
// Requires a Vercel/serverless proxy holding the Anthropic API key.
// If the proxy URL isn't configured, this module returns a friendly error.

import { getItem, setItem } from './storage'

const PROXY_URL_KEY = 'hb.aiProxyUrl.v1'
const ACK_KEY = 'hb.aiAck.v1'

export async function getProxyUrl() {
  return await getItem(PROXY_URL_KEY)
}

export async function setProxyUrl(url) {
  if (url && url.trim()) {
    await setItem(PROXY_URL_KEY, url.trim())
  } else {
    await setItem(PROXY_URL_KEY, '')
  }
}

export async function hasUserAcknowledged() {
  const v = await getItem(ACK_KEY)
  return v === 'yes'
}

export async function setAcknowledged() {
  await setItem(ACK_KEY, 'yes')
}

// Constrained system prompt. We deliberately:
//  - restrict to common Ghanaian foods
//  - forbid liver in early pregnancy (vitamin A teratogenicity)
//  - forbid raw/undercooked items
//  - forbid specific portion claims
//  - require pairing iron + vitamin C explanation
//  - require a "check with midwife" line
const SYSTEM_PROMPT = `You are a helper for an antenatal app used by pregnant women in Ghana.
Your job is to suggest ONE simple meal idea based on common, affordable Ghanaian foods that supports healthy haemoglobin in pregnancy.

STRICT RULES (do not violate):
1. Only use common Ghanaian foods. Examples of safe iron-rich choices: kontomire (cocoyam leaves), aleefu, ayoyo, beans (red beans, black-eyed peas), eggs (kosua), smoked fish, fresh tilapia or other well-cooked fish, lean meat (well-cooked), groundnut, dark leafy vegetables. Pair with vitamin C foods: orange, pawpaw, pineapple, guava, lemon, tomato.
2. NEVER recommend liver if the user is in their first trimester (gestational week < 13). Liver is high in vitamin A which can be harmful early in pregnancy.
3. NEVER recommend raw or undercooked fish, eggs, meat. Everything must be well-cooked.
4. NEVER recommend unpasteurised milk or unpasteurised dairy.
5. NEVER specify exact portion sizes, grams, calories, or numerical nutrition claims.
6. NEVER promise a specific HB increase from one meal.
7. ALWAYS say one meal — do not generate a full day plan.
8. ALWAYS end with: "If you have any food allergies or specific dietary needs, please check with your midwife before trying this."
9. Keep the response under 120 words.
10. Use simple language — short sentences, no medical jargon.

If the user is severely anaemic (status = severe), prepend the meal idea with one sentence reminding them to go to a health facility today and that food alone will not be enough to treat severe anaemia.`

export async function suggestMeal({ status, week, name }) {
  const proxyUrl = await getProxyUrl()
  if (!proxyUrl) {
    return {
      ok: false,
      error: 'no-proxy',
      message: 'AI meal suggestions are not yet configured for this app. Ask the person who set up the app to enable it.',
    }
  }

  const userMessage = [
    `Suggest a meal idea for someone with these details:`,
    `- HB status: ${status || 'unknown'}`,
    week ? `- Pregnancy week: ${week}` : `- Pregnancy week: not given`,
    `- First name: ${name || 'friend'}`,
    ``,
    `Give just ONE meal idea following all the strict rules.`,
  ].join('\n')

  try {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return { ok: false, error: 'http', status: res.status, message: text || `Server returned ${res.status}` }
    }

    const data = await res.json()

    // Anthropic API returns content as array of blocks
    let text = ''
    if (Array.isArray(data.content)) {
      text = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim()
    } else if (typeof data.text === 'string') {
      text = data.text.trim()
    }

    if (!text) {
      return { ok: false, error: 'empty', message: 'The AI did not return a suggestion. Try again.' }
    }

    return { ok: true, text }
  } catch (e) {
    return { ok: false, error: 'network', message: e?.message || 'Could not reach the AI service. Check your internet.' }
  }
}
