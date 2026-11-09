export type DemoRole = "platform_admin" | "owner" | "manager" | "coach" | "parent" | "player";

export type DemoProfile = {
  id: string;
  role: DemoRole;
  name: string;
  title: string;
  initials: string;
  color: string;
  email?: string;
  /** Demo access scope, represented by stable IDs like a real membership record. */
  teamIds?: string[];
  playerIds?: string[];
};

export type DemoBranch = {
  id: string;
  name: string;
  city: string;
  managerName: string;
  active: boolean;
};

export type DemoPlayer = {
  id: string;
  name: string;
  initials: string;
  age: number;
  birthDate: string;
  position: string;
  preferredFoot: "يمين" | "يسار" | "كلتا القدمين";
  teamId: string;
  guardianName: string;
  guardianPhone: string;
  attendance: number;
  rating: number;
  lastAssessedAt: string | null;
  ratings: { technical: number; tactical: number; physical: number; mental: number };
  enrollmentStatus: "نشط" | "غير مكتمل" | "بانتظار موافقة ولي الأمر" | "موقوف مؤقتاً" | "منسحب" | "متخرج";
  needsFollowUp: boolean;
  color: string;
};

export type DemoTeam = {
  id: string;
  branchId: string;
  name: string;
  ageGroup: string;
  coachId: string;
  color: string;
};

export type DemoStaff = {
  id: string;
  name: string;
  initials: string;
  role: string;
  teamIds: string[];
  responsibilities: string[];
  color: string;
  active: boolean;
};

export type DemoSession = {
  id: string;
  day: string;
  date: string;
  time: string;
  title: string;
  teamId: string;
  location: string;
  kind: "تدريب" | "مباراة";
};

export type DemoGoal = {
  id: string;
  playerId: string;
  title: string;
  category: string;
  progress: number;
  due: string;
  state: string;
};

export type NewDemoPlayer = Omit<DemoPlayer, "id">;
export type AttendanceMark = { playerId: string; status: string };

export type DemoAcademyData = {
  academyName: string;
  season: string;
  ownerUserId: string;
  managerUserId: string;
  branches: DemoBranch[];
  players: DemoPlayer[];
  teams: DemoTeam[];
  staff: DemoStaff[];
  sessions: DemoSession[];
  goals: DemoGoal[];
};

export type DemoPlatformAcademy = {
  id: string;
  name: string;
  city: string;
  ownerName?: string;
  ownerEmail?: string;
  players: number;
  activeUsers: number;
  status: "نشطة" | "بانتظار التفعيل";
  lastActivity: string;
};

export type DemoPlatformData = {
  academies: DemoPlatformAcademy[];
  weeklyActiveUsers: number[];
};

/** Replace this contract's mock implementation with an API/database adapter later. */
export interface AcademyRepository {
  getAcademyData(): Promise<DemoAcademyData>;
  createPlayer(input: NewDemoPlayer): Promise<DemoPlayer>;
  getAttendance(sessionId: string): Promise<AttendanceMark[]>;
  saveAttendance(sessionId: string, records: AttendanceMark[]): Promise<void>;
}

/** Platform-wide data has a separate adapter from tenant-scoped academy data. */
export interface PlatformRepository {
  getPlatformData(): Promise<DemoPlatformData>;
}
