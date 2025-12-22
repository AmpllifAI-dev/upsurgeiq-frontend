/**
 * Sports Team Management
 * 
 * Handles team profiles, rosters, schedules, and statistics for all sports
 */

import { getDb } from "./db";
import { sportsTeams } from "../drizzle/schema";
import { eq, and, like, or } from "drizzle-orm";

export interface SportsTeamInput {
  teamName: string;
  sport: string; // football, basketball, motorsport, rugby, cricket, etc.
  league?: string;
  division?: string;
  location?: string;
  founded?: number;
  stadium?: string;
  website?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  description?: string;
  achievements?: Array<{ year: number; title: string }>;
  socialMedia?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
}

/**
 * Create a new sports team
 */
export async function createSportsTeam(
  businessId: number,
  teamData: SportsTeamInput
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const [team] = await db.insert(sportsTeams).values({
    businessId,
    ...teamData,
  }).$returningId();

  return await getTeamById(team.id, businessId);
}

/**
 * Get all teams for a business
 */
export async function getBusinessTeams(businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  return await db
    .select()
    .from(sportsTeams)
    .where(eq(sportsTeams.businessId, businessId))
    .orderBy(sportsTeams.teamName);
}

/**
 * Get a single team by ID
 */
export async function getTeamById(teamId: number, businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const [team] = await db
    .select()
    .from(sportsTeams)
    .where(
      and(
        eq(sportsTeams.id, teamId),
        eq(sportsTeams.businessId, businessId)
      )
    );

  return team;
}

/**
 * Update a team
 */
export async function updateSportsTeam(
  teamId: number,
  businessId: number,
  updates: Partial<SportsTeamInput>
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db
    .update(sportsTeams)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(sportsTeams.id, teamId),
        eq(sportsTeams.businessId, businessId)
      )
    );

  return await getTeamById(teamId, businessId);
}

/**
 * Delete a team
 */
export async function deleteSportsTeam(teamId: number, businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db
    .delete(sportsTeams)
    .where(
      and(
        eq(sportsTeams.id, teamId),
        eq(sportsTeams.businessId, businessId)
      )
    );

  return true;
}

/**
 * Search teams by name or sport
 */
export async function searchTeams(
  businessId: number,
  query: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  return await db
    .select()
    .from(sportsTeams)
    .where(
      and(
        eq(sportsTeams.businessId, businessId),
        or(
          like(sportsTeams.teamName, `%${query}%`),
          like(sportsTeams.sport, `%${query}%`),
          like(sportsTeams.league, `%${query}%`)
        )
      )
    )
    .orderBy(sportsTeams.teamName);
}

/**
 * Get teams by sport type
 */
export async function getTeamsBySport(
  businessId: number,
  sport: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  return await db
    .select()
    .from(sportsTeams)
    .where(
      and(
        eq(sportsTeams.businessId, businessId),
        eq(sportsTeams.sport, sport)
      )
    )
    .orderBy(sportsTeams.teamName);
}

/**
 * Generate team-specific press release template suggestions
 */
export async function generateTeamPressReleaseAngles(
  teamId: number,
  businessId: number
): Promise<string[]> {
  const team = await getTeamById(teamId, businessId);
  
  if (!team) {
    throw new Error("Team not found");
  }

  // Generate press release angles based on team type
  const angles: string[] = [];

  // Common angles for all sports
  angles.push(
    `${team.teamName} announces new season schedule and key matchups`,
    `${team.teamName} welcomes new talent to strengthen ${team.sport} roster`,
    `${team.teamName} launches community engagement initiative in ${team.location || 'local area'}`,
    `${team.teamName} partners with sponsors to enhance fan experience`
  );

  // Sport-specific angles
  if (team.sport === 'football' || team.sport === 'soccer') {
    angles.push(
      `${team.teamName} unveils new tactics ahead of ${team.league || 'league'} campaign`,
      `${team.teamName} youth academy produces next generation of talent`
    );
  } else if (team.sport === 'motorsport' || team.sport === 'racing') {
    angles.push(
      `${team.teamName} reveals technical innovations for upcoming ${team.league || 'series'} season`,
      `${team.teamName} driver lineup confirmed for ${new Date().getFullYear()} campaign`
    );
  } else if (team.sport === 'basketball') {
    angles.push(
      `${team.teamName} announces training camp roster and preseason schedule`,
      `${team.teamName} invests in player development and analytics`
    );
  } else if (team.sport === 'rugby') {
    angles.push(
      `${team.teamName} strengthens forward pack with strategic signings`,
      `${team.teamName} focuses on fitness and conditioning for ${team.league || 'league'} challenge`
    );
  }

  return angles.slice(0, 6); // Return top 6 angles
}

/**
 * List of supported sports
 */
export const SUPPORTED_SPORTS = [
  'football',
  'soccer',
  'basketball',
  'motorsport',
  'racing',
  'rugby',
  'cricket',
  'baseball',
  'hockey',
  'tennis',
  'golf',
  'athletics',
  'swimming',
  'cycling',
  'boxing',
  'mma',
  'esports',
  'other',
] as const;

export type SupportedSport = typeof SUPPORTED_SPORTS[number];
