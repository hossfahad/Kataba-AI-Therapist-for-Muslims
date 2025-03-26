import { betterAuth } from "better-auth";
import { Pool } from "pg";

/**
 * Better Auth configuration with PostgreSQL database
 * 
 * This creates an instance of Better Auth that connects to our PostgreSQL database
 * using the connection string from environment variables.
 */
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001",
  
  // Database table and field mappings to match existing schema
  databaseConfig: {
    userTable: "user",
    sessionTable: "session",
    verificationTable: "verification",
    accountTable: "account",
    
    // Field mappings for the user table
    userFields: {
      id: "id",
      email: "email",
      name: "name",
      emailVerified: "emailVerified",
      image: "image",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    },
    
    // Field mappings for the session table
    sessionFields: {
      id: "id",
      userId: "userId",
      expiresAt: "expiresAt",
      token: "token",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      ipAddress: "ipAddress",
      userAgent: "userAgent"
    },
    
    // Field mappings for the verification table
    verificationFields: {
      id: "id",
      identifier: "identifier",
      token: "value",
      expiresAt: "expiresAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }
});

/**
 * Authentication handler for API routes
 */
export default auth.handler;
