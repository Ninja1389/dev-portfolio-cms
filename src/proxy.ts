import { auth } from "@/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  if (!isLoggedIn && pathname.startsWith("/dashboard")) {
    const newUrl = new URL("/login", req.nextUrl)
    newUrl.searchParams.set("callbackUrl", pathname)
    return Response.redirect(newUrl)
  }

  if (isLoggedIn && pathname === "/login") {
    return Response.redirect(new URL("/dashboard", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
