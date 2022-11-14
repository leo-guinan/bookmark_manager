import { Ctx } from "blitz"
import { refreshTwitterTokenIfNeeded } from "../../utils/refresh-token"
import db from "../../../db"

export default async function getBookmarks(_ = null, { session }: Ctx) {
  if (!session.userId) return null
  let user = await db.user.findFirst({ where: { id: session.userId } })
  if (!user) return null
  await refreshTwitterTokenIfNeeded(user.twitterRefreshToken, user.id)
  user = await db.user.findFirst({ where: { id: session.userId } })
  if (!user) return null
  const bookmarkAPI = process.env.API_URL + "/api/bookmarks/fetch/"
  const response = await fetch(bookmarkAPI, {
    method: "POST",
    headers: {
      Authorization: `Api-Key ${process.env.API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      twitter_id: user.twitterId,
      twitter_token: user.twitterApiToken
    })
  })
  const data = await response.json()
  console.log(data)
  return data
}
