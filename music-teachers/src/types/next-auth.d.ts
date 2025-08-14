import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      image?: string
      isActive: boolean
    }
  }

  interface User {
    role?: string
    isActive?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    isActive?: boolean
  }
}