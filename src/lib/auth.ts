import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

// Check if Google OAuth is configured
const isGoogleOAuthConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

const buildProviders = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providersArray: any[] = [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            teacher: true,
            employer: true
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        if (!user.isActive) {
          throw new Error('Account is not active. Please contact an administrator.')
        }

        if (user.approvalStatus === 'PENDING') {
          throw new Error('Your account is pending approval. Please wait for administrator approval.')
        }

        if (user.approvalStatus === 'REJECTED') {
          throw new Error('Your account registration has been rejected. Please contact an administrator.')
        }

        return {
          id: user.id,
          email: user.email!,
          name: user.name!,
          role: user.role!,
          image: user.image,
        }
      }
    })
  ]

  // Add Google provider only if configured
  if (isGoogleOAuthConfigured) {
    providersArray.unshift(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      })
    )
  }

  return providersArray
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: buildProviders(),
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // For Google OAuth, just validate that the user should be allowed to sign in
        // Let NextAuth handle user creation via the adapter
        return true
      }
      
      // For credentials, the validation is already done in the credentials provider
      // Just allow the sign in since the credentials provider handles approval status
      return true
    },
    jwt: async ({ token, user, account }) => {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id }
        })
        
        // If this is a new Google OAuth user, set them up as a teacher (PENDING approval)
        if (account?.provider === 'google' && dbUser && !dbUser.role) {
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              role: 'TEACHER',
              isActive: true,
              approvalStatus: 'PENDING'
            }
          })
          
          // Create teacher profile
          await prisma.teacher.create({
            data: {
              userId: user.id
            }
          })
          
          token.role = 'TEACHER'
          token.isActive = true
          token.approvalStatus = 'PENDING'
        } else {
          token.role = dbUser?.role || undefined
          token.isActive = dbUser?.isActive || false
          token.approvalStatus = dbUser?.approvalStatus || undefined
        }
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.isActive = token.isActive as boolean
        session.user.approvalStatus = token.approvalStatus as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful login
      if (url.includes('/api/auth/callback')) {
        return `${baseUrl}/dashboard`
      }
      // Allow relative and same-origin URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  events: {
    async signIn({ user, account }) {
      console.log(`User ${user.email} signed in with ${account?.provider}`)
    }
  }
}