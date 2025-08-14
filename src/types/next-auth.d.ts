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
      approvalStatus: string
    }
  }

  interface User {
    role?: string
    isActive?: boolean
    approvalStatus?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    isActive?: boolean
    approvalStatus?: string
  }
}