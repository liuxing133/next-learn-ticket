
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isTenantRoute = createRouteMatcher([
  '/organization-selector(.*)',
  '/orgid/(.*)'
])

const isTenantAdminRoute = createRouteMatcher([
  '/orgId/(.*)/memberships',
  '/orgId/(.*)/domain',
]);




export default clerkMiddleware(async (auth, req) => {
  // Restrict admin routes to users with specific permissions
  const { userId, sessionClaims } = auth();

  // 检查用户是否已登录
  if (userId) {
    // 从sessionClaims中获取firstname
    const firstname = sessionClaims?.firstname;

    // 使用firstname进行操作
    console.log(`User's firstname: ${firstname}`, userId);
  }
  if (isTenantAdminRoute(req)) {
    auth().protect(has => {
      return (
        has({ permission: 'org:sys_memberships:manage' }) ||
        has({ permission: 'org:sys_domains_manage' })
      )
    })
  }
  // Restrict organization routes to signed in users
  if (isTenantRoute(req)) auth().protect();

  try {
    const reault = await fetch(process.env.API_ADDRESS + "/api/user", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: auth().userId
      })
    })
    await reault.json()

  } catch (error) {
    console.log(error);
  }

});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};