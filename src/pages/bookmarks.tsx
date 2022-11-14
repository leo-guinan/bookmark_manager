import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import Layout from "src/core/layouts/Layout"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import logout from "src/auth/mutations/logout"
import logo from "public/logo.png"
import { useMutation } from "@blitzjs/rpc"
import { Routes, BlitzPage } from "@blitzjs/next"
import { getAntiCSRFToken } from "@blitzjs/auth"
import Bookmarks from "../bookmarks/components/Bookmarks"

/*
 * This file is just for a pleasant getting started page for your new app.
 * You can delete everything in here and start from scratch if you like.
 */

const UserInfo = () => {
  const antiCSRFToken = getAntiCSRFToken()

  const currentUser = useCurrentUser()
  const [logoutMutation] = useMutation(logout)

  const testUser = async () => {
    await fetch("/api/twitter/bookmarks", {
      method: "POST",
      credentials: "include",
      headers: {
        "anti-csrf": antiCSRFToken,
      },
    })
  }

  if (currentUser) {
    return (
      <>

        <Bookmarks />

        <button
          onClick={testUser}
        >
          Test User

        </button>
        <button
          className="button small"
          onClick={async () => {
            await logoutMutation()
          }}
        >
          Logout
        </button>
        <div>
          User id: <code>{currentUser.id}</code>
          <br />
          User role: <code>{currentUser.role}</code>
        </div>
      </>
    )
  } else {
    return (
      <>

        <a href="/api/auth/twitter">Log In With Twitter</a>

        <Link href={Routes.SignupPage()}>
          <a className="button small">
            <strong>Sign Up</strong>
          </a>
        </Link>
        <Link href={Routes.LoginPage()}>
          <a className="button small">
            <strong>Login</strong>
          </a>
        </Link>
      </>
    )
  }
}

const BookmarksPage: BlitzPage = () => {
  return (
    <Layout title="Home">
      <div className="container">
        <main>
          <Suspense fallback="Loading...">
            <UserInfo />
          </Suspense>
        </main>


      </div>
    </Layout>
  )
}

export default BookmarksPage
