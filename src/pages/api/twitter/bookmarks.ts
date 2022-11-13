import db from "db"
import { api } from "../../../blitz-server"
import { NextApiRequest, NextApiResponse } from "next"
import { TwitterApi } from 'twitter-api-v2';
import { getSession } from "@blitzjs/auth"
import { refreshTwitterTokenIfNeeded } from "../../../utils/refresh-token"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const session = await getSession(req, res)
    if (!session.userId) {
      return res.status(401).send({ success: false, error: "User not logged in" })
    }
    const user = await db.user.findFirst({ where: { id: session.userId } })
    if (!user?.twitterApiToken) {
      return res.status(500).send({ success: false, error: "No user found" })
    }
    try {
      await refreshTwitterTokenIfNeeded(user.twitterRefreshToken, user.id)
      const refreshedUser = await db.user.findFirst({ where: { id: session.userId } })
      if (!refreshedUser?.twitterApiToken) {
        return res.status(500).send({ success: false, error: "Broken during refresh" })
      }
      const twitterClient = new TwitterApi(refreshedUser.twitterApiToken);
      const { data } = await twitterClient.v2.userByUsername("leo_guinan")
      res.statusCode = 200
      res.setHeader("Content-Type", "application/json")
      res.end(
        JSON.stringify({ "success": true })
      )
    } catch (error) {

      console.log(error)
      return res.status(500).send({ success: false, error: "Error" })
    }

  }
}

export default api(handler)
