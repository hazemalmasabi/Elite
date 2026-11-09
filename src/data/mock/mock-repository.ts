import type { AcademyRepository, AttendanceMark, DemoAcademyData, NewDemoPlayer } from "@/data/models";
import type { DemoPlayer } from "@/data/models";

/**
 * Prototype fixtures only. No database, API, or durable writes are used.
 * Keep all sample content here so it can be removed without editing UI components.
 */
const additionalPlayerSeeds = [
  { id: "p-107", name: "حمد الدوسري", age: 12, birthDate: "2014-08-04", position: "وسط دفاعي", preferredFoot: "يمين", teamId: "t-1", attendance: 86, rating: 3.9, color: "sky" },
  { id: "p-108", name: "طلال الغامدي", age: 12, birthDate: "2014-01-20", position: "جناح أيسر", preferredFoot: "يسار", teamId: "t-1", attendance: 92, rating: 4.1, color: "lemon" },
  { id: "p-109", name: "بدر الزهراني", age: 13, birthDate: "2013-04-11", position: "ظهير أيمن", preferredFoot: "يمين", teamId: "t-2", attendance: 81, rating: 3.8, color: "rose" },
  { id: "p-110", name: "نواف العنزي", age: 13, birthDate: "2013-11-01", position: "مهاجم", preferredFoot: "يمين", teamId: "t-2", attendance: 77, rating: 3.6, color: "mint" },
  { id: "p-111", name: "ريان الشهري", age: 13, birthDate: "2013-03-08", position: "وسط", preferredFoot: "كلتا القدمين", teamId: "t-2", attendance: 89, rating: 4.2, color: "peach" },
  { id: "p-112", name: "فيصل العتيبي", age: 15, birthDate: "2011-02-15", position: "قلب دفاع", preferredFoot: "يمين", teamId: "t-3", attendance: 94, rating: 4.5, color: "lavender" },
  { id: "p-113", name: "صالح الحارثي", age: 14, birthDate: "2012-09-18", position: "وسط هجومي", preferredFoot: "يمين", teamId: "t-3", attendance: 83, rating: 4.0, color: "lemon" },
  { id: "p-114", name: "مازن العتيبي", age: 14, birthDate: "2012-06-20", position: "ظهير أيمن", preferredFoot: "يمين", teamId: "t-3", attendance: 71, rating: 3.6, color: "rose" },
  { id: "p-115", name: "عايض القرني", age: 14, birthDate: "2012-05-10", position: "حارس مرمى", preferredFoot: "يمين", teamId: "t-4", attendance: 90, rating: 4.4, color: "mint" },
  { id: "p-116", name: "فواز العمري", age: 15, birthDate: "2011-03-13", position: "مهاجم", preferredFoot: "يسار", teamId: "t-4", attendance: 87, rating: 4.1, color: "sky" },
  { id: "p-117", name: "حاتم الزهراني", age: 14, birthDate: "2012-10-19", position: "وسط", preferredFoot: "يمين", teamId: "t-4", attendance: 79, rating: 3.8, color: "peach" },
  { id: "p-118", name: "عبدالمجيد العبدلي", age: 12, birthDate: "2014-05-22", position: "جناح أيمن", preferredFoot: "يمين", teamId: "t-5", attendance: 95, rating: 4.5, color: "lavender" },
  { id: "p-119", name: "مهند السلمي", age: 13, birthDate: "2013-07-25", position: "وسط", preferredFoot: "يمين", teamId: "t-5", attendance: 85, rating: 4.0, color: "mint" },
  { id: "p-120", name: "سلطان العمري", age: 13, birthDate: "2013-02-17", position: "قلب دفاع", preferredFoot: "يمين", teamId: "t-5", attendance: 74, rating: 3.7, color: "rose" },
  { id: "p-121", name: "ياسر الغامدي", age: 14, birthDate: "2012-08-13", position: "مهاجم", preferredFoot: "يسار", teamId: "t-6", attendance: 91, rating: 4.3, color: "lemon" },
  { id: "p-122", name: "تركي المطيري", age: 15, birthDate: "2011-03-18", position: "وسط دفاعي", preferredFoot: "يمين", teamId: "t-6", attendance: 82, rating: 4.0, color: "peach" },
  { id: "p-123", name: "وليد الجهني", age: 14, birthDate: "2012-03-03", position: "ظهير أيسر", preferredFoot: "يسار", teamId: "t-6", attendance: 88, rating: 4.2, color: "sky" },
] as const;

const additionalPlayers: DemoPlayer[] = additionalPlayerSeeds.map((seed, index) => {
  const ratings = { technical: seed.rating + 0.1, tactical: seed.rating - 0.1, physical: seed.rating, mental: seed.rating };
  return {
    ...seed,
    initials: seed.name.split(" ").slice(0, 2).map((part) => part[0]).join(""),
    guardianName: ["سعد", "ناصر", "خالد", "محمد", "عبدالله"][index % 5] + " " + seed.name.split(" ").at(-1),
    guardianPhone: `+966 55 123 4${String(index + 107).padStart(3, "0")}`,
    lastAssessedAt: "2026-11-03",
    ratings,
    enrollmentStatus: "نشط",
    needsFollowUp: seed.attendance < 78,
  };
});

let academyData: DemoAcademyData = {
  academyName: "أكاديمية النخبة",
  season: "موسم 2026 / 2027",
  ownerUserId: "demo-owner",
  managerUserId: "demo-manager",
  branches: [
    { id: "b-1", name: "فرع الرياض", city: "الرياض", managerName: "نورة الشمري", active: true },
    { id: "b-2", name: "فرع جدة", city: "جدة", managerName: "عبدالرحمن الغامدي", active: true },
    { id: "b-3", name: "فرع الدمام", city: "الدمام", managerName: "سلمان الدوسري", active: true },
  ],
  players: [
    { id: "p-101", name: "يوسف العتيبي", initials: "يع", age: 13, birthDate: "2013-07-15", position: "وسط هجومي", preferredFoot: "يمين", teamId: "t-1", guardianName: "عبدالرحمن العتيبي", guardianPhone: "+966 55 123 4001", attendance: 96, rating: 4.6, lastAssessedAt: "2026-11-03", ratings: { technical: 4.7, tactical: 4.3, physical: 4.5, mental: 4.9 }, enrollmentStatus: "نشط", needsFollowUp: false, color: "mint" },
    { id: "p-102", name: "راكان الحربي", initials: "رح", age: 14, birthDate: "2012-02-10", position: "حارس مرمى", preferredFoot: "يمين", teamId: "t-4", guardianName: "محمد الحربي", guardianPhone: "+966 55 123 4002", attendance: 88, rating: 4.2, lastAssessedAt: "2026-11-03", ratings: { technical: 4.2, tactical: 4.2, physical: 4.1, mental: 4.3 }, enrollmentStatus: "نشط", needsFollowUp: false, color: "peach" },
    { id: "p-103", name: "سلمان القحطاني", initials: "سق", age: 12, birthDate: "2014-06-23", position: "جناح أيمن", preferredFoot: "يسار", teamId: "t-1", guardianName: "سعد القحطاني", guardianPhone: "+966 55 123 4003", attendance: 72, rating: 3.7, lastAssessedAt: "2026-11-03", ratings: { technical: 3.8, tactical: 3.5, physical: 3.8, mental: 3.7 }, enrollmentStatus: "نشط", needsFollowUp: true, color: "lavender" },
    { id: "p-104", name: "عبدالله الدوسري", initials: "عد", age: 15, birthDate: "2011-05-13", position: "قلب دفاع", preferredFoot: "يمين", teamId: "t-3", guardianName: "ناصر الدوسري", guardianPhone: "+966 55 123 4004", attendance: 91, rating: 4.4, lastAssessedAt: "2026-11-03", ratings: { technical: 4.4, tactical: 4.3, physical: 4.5, mental: 4.4 }, enrollmentStatus: "نشط", needsFollowUp: false, color: "sky" },
    { id: "p-105", name: "مشعل الشمري", initials: "مش", age: 13, birthDate: "2013-09-09", position: "ظهير أيسر", preferredFoot: "يسار", teamId: "t-2", guardianName: "بدر الشمري", guardianPhone: "+966 55 123 4005", attendance: 84, rating: 4.0, lastAssessedAt: "2026-11-03", ratings: { technical: 4.1, tactical: 3.8, physical: 4.2, mental: 3.9 }, enrollmentStatus: "نشط", needsFollowUp: false, color: "lemon" },
    { id: "p-106", name: "زياد المطيري", initials: "زم", age: 14, birthDate: "2012-04-20", position: "مهاجم", preferredFoot: "يمين", teamId: "t-4", guardianName: "فهد المطيري", guardianPhone: "+966 55 123 4006", attendance: 68, rating: 3.5, lastAssessedAt: "2026-11-03", ratings: { technical: 3.4, tactical: 3.5, physical: 3.7, mental: 3.4 }, enrollmentStatus: "نشط", needsFollowUp: true, color: "rose" },
    ...additionalPlayers,
  ],
  teams: [
    { id: "t-1", branchId: "b-1", name: "فريق البراعم A", ageGroup: "2013 – 2014", coachId: "staff-fahad", color: "mint" },
    { id: "t-2", branchId: "b-1", name: "فريق البراعم B", ageGroup: "2013 – 2014", coachId: "staff-nasser", color: "peach" },
    { id: "t-3", branchId: "b-2", name: "فريق الناشئين A", ageGroup: "2011 – 2012", coachId: "staff-nasser", color: "sky" },
    { id: "t-4", branchId: "b-2", name: "فريق الناشئين B", ageGroup: "2011 – 2012", coachId: "staff-turki", color: "lavender" },
    { id: "t-5", branchId: "b-3", name: "فريق البراعم فرع الدمام", ageGroup: "2013 – 2014", coachId: "staff-amal", color: "lemon" },
    { id: "t-6", branchId: "b-3", name: "فريق الناشئين فرع الدمام", ageGroup: "2011 – 2012", coachId: "staff-yasser", color: "rose" },
  ],
  staff: [
    { id: "staff-fahad", name: "فهد السبيعي", initials: "فس", role: "مدرب رئيسي", teamIds: ["t-1"], responsibilities: ["تدريب الفريق", "تقييم اللاعبين"], color: "sky", active: true },
    { id: "staff-nasser", name: "ناصر الدخيل", initials: "ند", role: "مدرب", teamIds: ["t-2", "t-3"], responsibilities: ["تدريب الفريق", "تسجيل الحضور"], color: "mint", active: true },
    { id: "staff-turki", name: "تركي القحطاني", initials: "تق", role: "مدرب حراس", teamIds: ["t-4"], responsibilities: ["تدريب حراس المرمى"], color: "peach", active: true },
    { id: "staff-sara", name: "سارة العبدالله", initials: "سع", role: "منسقة إدارية", teamIds: [], responsibilities: ["التسجيل", "التواصل"], color: "lavender", active: true },
    { id: "staff-amal", name: "أمل الغامدي", initials: "أغ", role: "مدربة", teamIds: ["t-5"], responsibilities: ["تدريب الفريق", "تقييم اللاعبين"], color: "lemon", active: true },
    { id: "staff-yasser", name: "ياسر المطيري", initials: "يم", role: "مدرب", teamIds: ["t-6"], responsibilities: ["تدريب الفريق", "تسجيل الحضور"], color: "rose", active: true },
  ],
  sessions: [
    { id: "s-1", day: "الأحد", date: "08 نوفمبر", time: "5:30 م", title: "تطوير الاستحواذ", teamId: "t-1", location: "الملعب الرئيسي", kind: "تدريب" },
    { id: "s-2", day: "الأحد", date: "08 نوفمبر", time: "7:00 م", title: "تدريب حراس المرمى", teamId: "t-4", location: "الملعب الفرعي", kind: "تدريب" },
    { id: "s-3", day: "الاثنين", date: "09 نوفمبر", time: "6:00 م", title: "مباراة ودية", teamId: "t-3", location: "ملعب الأكاديمية", kind: "مباراة" },
    { id: "s-4", day: "الثلاثاء", date: "10 نوفمبر", time: "5:30 م", title: "التحرك بدون كرة", teamId: "t-2", location: "الملعب الرئيسي", kind: "تدريب" },
    { id: "s-5", day: "الأربعاء", date: "11 نوفمبر", time: "6:00 م", title: "اللمسة الأولى", teamId: "t-5", location: "ملعب فرع الدمام", kind: "تدريب" },
    { id: "s-6", day: "الخميس", date: "12 نوفمبر", time: "6:30 م", title: "التحول السريع", teamId: "t-6", location: "ملعب فرع الدمام", kind: "تدريب" },
  ],
  goals: [
    { id: "g-1", playerId: "p-101", title: "تحسين دقة التمرير تحت الضغط", category: "فني", progress: 72, due: "20 نوفمبر", state: "على المسار" },
    { id: "g-2", playerId: "p-103", title: "رفع التحمل البدني", category: "بدني", progress: 45, due: "24 نوفمبر", state: "تحتاج متابعة" },
    { id: "g-3", playerId: "p-104", title: "التواصل وتنظيم خط الدفاع", category: "تكتيكي", progress: 86, due: "18 نوفمبر", state: "على المسار" },
    { id: "g-4", playerId: "p-114", title: "رفع دقة التمرير الطويل", category: "فني", progress: 58, due: "27 نوفمبر", state: "على المسار" },
    { id: "g-5", playerId: "p-120", title: "الالتزام بالحضور الأسبوعي", category: "ذهني", progress: 40, due: "25 نوفمبر", state: "تحتاج متابعة" },
    { id: "g-6", playerId: "p-121", title: "تحسين إنهاء الهجمات", category: "فني", progress: 64, due: "30 نوفمبر", state: "على المسار" },
  ],
};

const attendanceBySession = new Map<string, AttendanceMark[]>([["s-1", [
  { playerId: "p-101", status: "حاضر" },
  { playerId: "p-103", status: "غياب بعذر" },
]]]);

let generatedPlayerId = 1;

export const mockRepository: AcademyRepository = {
  async getAcademyData() {
    return structuredClone(academyData);
  },
  async createPlayer(input: NewDemoPlayer) {
    const normalizedName = input.name.trim().toLocaleLowerCase("ar-SA");
    const duplicate = academyData.players.some((player) => player.name.trim().toLocaleLowerCase("ar-SA") === normalizedName && player.birthDate === input.birthDate);
    if (duplicate) throw new Error("يوجد ملف للاعب بالاسم وتاريخ الميلاد نفسيهما.");
    const player = { ...input, id: `p-local-${generatedPlayerId++}` };
    academyData = { ...academyData, players: [player, ...academyData.players] };
    return structuredClone(player);
  },
  async getAttendance(sessionId: string) {
    return structuredClone(attendanceBySession.get(sessionId) ?? []);
  },
  async saveAttendance(sessionId: string, records: AttendanceMark[]) {
    attendanceBySession.set(sessionId, structuredClone(records));
  },
};
