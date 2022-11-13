import db from "db"
import base64 from "base-64"
export const refreshTwitterTokenIfNeeded = async (refreshToken, userId) => {
  console.log("refreshing token")
  // url = 'https://api.twitter.com/2/oauth2/token'
  // myobj = {
  //   'refresh_token': client_account.refresh_token,
  //   "grant_type": "refresh_token",
  //   "client_id": client.client_id
  // }
  // response = requests.post(url, data=myobj, auth=(client.client_id, client.client_secret))
  // results = response.json()
  // client_account.access_token = results['access_token']
  // client_account.refresh_token = results['refresh_token']
  // client_account.refreshed = timezone.now()
  // client_account.save()
  const results = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${base64.encode(process.env.TWITTER_CLIENT_ID + ":" + process.env.TWITTER_CLIENT_SECRET)}`,
      "Content-Type": "application/json;charset=UTF-8"
    },
    body: JSON.stringify({
      'refresh_token': refreshToken,
      "grant_type": "refresh_token",
      "client_id": process.env.TWITTER_CLIENT_ID
    })
  })
  const json = await results.json()
  if (!json.access_token || !json.refresh_token) {
    throw new Error("Could not refresh twitter token")
  }
  await db.user.update({
    where: {
      id: userId
    },
    data: {
      twitterApiToken: json.access_token,
      twitterRefreshToken: json.refresh_token
    }
  })
  console.log(json)
}
