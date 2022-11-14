import db from "db"
import { api } from "../../../blitz-server"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "@blitzjs/auth"
import { refreshTwitterTokenIfNeeded } from "../../../utils/refresh-token"
import axios from "axios"

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

      const bookmarkAPI = process.env.API_URL + "/api/bookmarks/fetch/"
      let error = null
      await axios
        .post(
          bookmarkAPI,
          {
            twitter_id: refreshedUser.twitterId,
            twitter_token: refreshedUser.twitterApiToken
          },
          {
            headers: {
              Authorization: `Api-Key ${process.env.API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then(async ({ data }) => {
          console.log(data)
          return res.status(200).send({ success: true, data })
        })
        .catch((err) => {
          console.log(err)
          error = err
        })

      if (error) {
        console.log(error)
        return res.status(500).send({ success: false, error: "Error" })
      }


    } catch (error) {

      console.log(error)
      return res.status(500).send({ success: false, error: "Error" })
    }

  }
}

export default api(handler)
