import { withSentry } from "@sentry/nextjs";

export default withSentry(() => {
  return new Response(null, { status: 404 });
});

export const config = {
  matcher: [],
};
