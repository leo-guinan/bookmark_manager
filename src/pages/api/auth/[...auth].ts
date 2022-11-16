// src/pages/api/auth/[...auth].ts
import { passportAuth } from "@blitzjs/auth"
import { api } from "src/blitz-server"
import TwitterStrategy from "@superfaceai/passport-twitter-oauth2"
import db from "db"

export default api(
  passportAuth({
    successRedirectUrl: "/",
    errorRedirectUrl: "/",
    secureProxy: true,
    strategies: [
      {
        strategy:  new TwitterStrategy(
          {
            consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
            consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
            callbackURL: process.env.TWITTER_CALLBACK_URL,
            clientID: process.env.TWITTER_CLIENT_ID as string,
            clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
            scope: [
              "tweet.read",
              "users.read",
              "bookmark.read",
              "follows.read",
              "offline.access",
              "follows.write",
            ],
            clientType: "confidential",
          },
          async function (accessToken, refreshToken, profile, done) {

            const user = await db.user.upsert({
              where: {
                twitterId: profile.id,
              },
              create: {
                name: profile.displayName,
                twitterId: profile.id,
                twitterApiToken: accessToken,
                twitterRefreshToken: refreshToken,
                twitterProfilePicture: profile.photos[0].value,
              },
              update: {
                name: profile.displayName,
                twitterProfilePicture: profile.photos[0].value,
                twitterApiToken: accessToken,
                twitterRefreshToken: refreshToken,
              },
            })
            const publicData = {
              userId: user.id,
              roles: [user.role],
              source: "twitter",
            }
            done(undefined, { publicData })
          }
        )
      },
    ],
  })
)
