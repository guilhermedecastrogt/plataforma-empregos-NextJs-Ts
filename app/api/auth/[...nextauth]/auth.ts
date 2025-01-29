import { PrismaClient } from "@prisma/client"
import type { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"

const prisma = new PrismaClient()

// Remove the duplicate export and just declare it as a const
const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Credenciais inválidas.")
                }

                const admin = await prisma.admin.findUnique({
                    where: { email: credentials.email },
                })

                if (!admin) {
                    throw new Error("Credenciais inválidas.")
                }

                const isValid = await compare(credentials.password, admin.password)
                if (!isValid) {
                    throw new Error("Credenciais inválidas.")
                }

                return {
                    id: admin.id.toString(),
                    username: admin.username,
                    email: admin.email,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.username = user.name
                token.email = user.email
            }
            return token
        },

        async session({ session, token }) {
            if (token) {
                session.user = {
                    email: token.email,
                }
            }
            return session
        },
    },
    pages: {
        signIn: "/admin/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
}

// Single export statement at the end of the file
export { authOptions }