/**
 * types/next-auth.d.ts
 *
 * Extends the NextAuth Session and JWT types to include `id` on the user object.
 * The NextAuth `session` callback already sets `session.user.id = token.sub` in
 * app/api/auth/[...nextauth]/route.ts — this declaration tells TypeScript about it.
 */

import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}
