import { NotFoundError, AuthenticationError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import { SecurePassword } from "@blitzjs/auth"
import db from "db"
import { UpdateName } from "../validations"

export default resolver.pipe(
  resolver.zod(UpdateName),
  resolver.authorize(),
  async ({ name, tweetId }, ctx) => {
    const user = await db.user.findFirst({ where: { id: ctx.session.userId } })
    if (!user) throw new NotFoundError()
    const bookmarkAPI = process.env.API_URL + "/api/bookmarks/update_name/"
    const response = await fetch(bookmarkAPI, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${process.env.API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        twitter_id: user.twitterId,
        tweet_id: tweetId,
        name: name
      })
    })



    return response.json()
  }
)
