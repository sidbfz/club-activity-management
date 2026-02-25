// ==================== TYPES ====================

export interface Club {
  clubId: number;
  clubName: string;
  category: string;
  description: string;
  logo?: string;
  coverColor?: string;
  meetingDay?: string;
  meetingTime?: string;
  location?: string;
  contactEmail?: string;
  foundedDate?: string;
  website?: string;
}

export interface Student {
  studentId: number;
  rollNumber: string;
  name: string;
  email: string;
  department: string;
  year: number;
  avatar?: string;
}

export interface Role {
  roleId: number;
  roleName: string;
  roleType: string;
}

export interface Membership {
  membershipId: number;
  studentId: number;
  clubId: number;
  roleId: number;
  joinDate: string;
}

export interface Budget {
  budgetId: number;
  clubId: number;
  amount: number;
  status: "pending" | "approved" | "rejected";
  description?: string;
  requestDate?: string;
}

export interface Event {
  eventId: number;
  clubId: number;
  eventName: string;
  eventDate: string;
  venue: string;
  maxParticipants: number;
  description?: string;
  status?: "upcoming" | "ongoing" | "completed";
}

export interface Registration {
  registrationId: number;
  eventId: number;
  studentId: number;
  registrationDate: string;
}

export interface Attendance {
  attendanceId: number;
  eventId: number;
  studentId: number;
  status: "present" | "absent" | "late";
  checkInTime: string;
}

export interface EventCoordinator {
  id: number;
  eventId: number;
  studentId: number;
}

// ==================== MOCK DATA ====================

export const clubs: Club[] = [
  {
    clubId: 1,
    clubName: "CodeCraft",
    category: "Technology",
    description:
      "A premier coding club fostering innovation through hackathons, coding competitions, and tech workshops. We build the future, one line at a time.",
    coverColor: "from-violet-600 to-indigo-600",
    meetingDay: "Every Wednesday",
    meetingTime: "4:00 PM – 6:00 PM",
    location: "Lab 301, CS Block",
    contactEmail: "codecraft@university.edu",
    foundedDate: "2020-08-15",
    website: "https://codecraft.university.edu",
  },
  {
    clubId: 2,
    clubName: "PixelPerfect",
    category: "Design",
    description:
      "A creative design club exploring UI/UX, graphic design, and digital art. We turn ideas into visual experiences.",
    coverColor: "from-pink-600 to-rose-600",
    meetingDay: "Every Thursday",
    meetingTime: "3:00 PM – 5:00 PM",
    location: "Design Studio, Block C",
    contactEmail: "pixelperfect@university.edu",
    foundedDate: "2021-01-10",
    website: "https://pixelperfect.university.edu",
  },
  {
    clubId: 3,
    clubName: "EcoVerse",
    category: "Environment",
    description:
      "Dedicated to sustainability and environmental awareness through campus drives, tree plantations, and green initiatives.",
    coverColor: "from-emerald-600 to-teal-600",
    meetingDay: "Every Saturday",
    meetingTime: "10:00 AM – 12:00 PM",
    location: "Eco Center, Ground Floor",
    contactEmail: "ecoverse@university.edu",
    foundedDate: "2019-04-22",
  },
  {
    clubId: 4,
    clubName: "Rhythm & Blues",
    category: "Music",
    description:
      "The heartbeat of campus culture. From jam sessions to grand concerts, we celebrate music in all its forms.",
    coverColor: "from-amber-500 to-orange-600",
    meetingDay: "Every Friday",
    meetingTime: "5:00 PM – 7:00 PM",
    location: "Music Room, Cultural Block",
    contactEmail: "rhythmblues@university.edu",
    foundedDate: "2018-06-01",
  },
  {
    clubId: 5,
    clubName: "SportSync",
    category: "Sports",
    description:
      "Bringing athletes together for inter-college tournaments, fitness challenges, and sports events throughout the year.",
    coverColor: "from-sky-500 to-blue-600",
    meetingDay: "Every Monday & Wednesday",
    meetingTime: "6:00 AM – 8:00 AM",
    location: "Sports Complex, Main Campus",
    contactEmail: "sportsync@university.edu",
    foundedDate: "2017-07-15",
    website: "https://sportsync.university.edu",
  },
  {
    clubId: 6,
    clubName: "LitCircle",
    category: "Literature",
    description:
      "A haven for book lovers, writers, and poets. We host book readings, poetry slams, and creative writing workshops.",
    coverColor: "from-purple-500 to-fuchsia-600",
    meetingDay: "Every Tuesday",
    meetingTime: "4:30 PM – 6:00 PM",
    location: "Library Hall, Room 102",
    contactEmail: "litcircle@university.edu",
    foundedDate: "2019-09-01",
  },
  {
    clubId: 7,
    clubName: "ShutterFrame",
    category: "Photography",
    description:
      "Capturing moments and telling stories through the lens. From nature walks to studio sessions, every click matters.",
    coverColor: "from-cyan-500 to-blue-500",
    meetingDay: "Every Sunday",
    meetingTime: "7:00 AM – 10:00 AM",
    location: "Media Lab, Block A",
    contactEmail: "shutterframe@university.edu",
    foundedDate: "2020-03-15",
    website: "https://shutterframe.university.edu",
  },
  {
    clubId: 8,
    clubName: "Robotics Lab",
    category: "Technology",
    description:
      "Building intelligent machines and competing in national robotics championships. From drones to humanoids, we engineer the impossible.",
    coverColor: "from-red-500 to-rose-600",
    meetingDay: "Every Tuesday & Thursday",
    meetingTime: "3:00 PM – 6:00 PM",
    location: "Robotics Lab, Engineering Block",
    contactEmail: "roboticslab@university.edu",
    foundedDate: "2018-01-20",
    website: "https://roboticslab.university.edu",
  },
];

export const students: Student[] = [
  { studentId: 1, rollNumber: "CS2024001", name: "Aarav Sharma", email: "aarav.s@university.edu", department: "Computer Science", year: 2 },
  { studentId: 2, rollNumber: "EC2024015", name: "Priya Patel", email: "priya.p@university.edu", department: "Electronics", year: 3 },
  { studentId: 3, rollNumber: "ME2024032", name: "Rohan Gupta", email: "rohan.g@university.edu", department: "Mechanical", year: 1 },
  { studentId: 4, rollNumber: "CS2024008", name: "Ananya Singh", email: "ananya.s@university.edu", department: "Computer Science", year: 4 },
  { studentId: 5, rollNumber: "IT2024022", name: "Vikram Reddy", email: "vikram.r@university.edu", department: "Information Technology", year: 2 },
  { studentId: 6, rollNumber: "EE2024011", name: "Sneha Joshi", email: "sneha.j@university.edu", department: "Electrical", year: 3 },
  { studentId: 7, rollNumber: "CS2024045", name: "Arjun Nair", email: "arjun.n@university.edu", department: "Computer Science", year: 1 },
  { studentId: 8, rollNumber: "CE2024019", name: "Kavya Menon", email: "kavya.m@university.edu", department: "Civil", year: 2 },
  { studentId: 9, rollNumber: "IT2024033", name: "Rahul Verma", email: "rahul.v@university.edu", department: "Information Technology", year: 3 },
  { studentId: 10, rollNumber: "CS2024052", name: "Diya Kapoor", email: "diya.k@university.edu", department: "Computer Science", year: 4 },
  { studentId: 11, rollNumber: "ME2024007", name: "Aditya Rao", email: "aditya.r@university.edu", department: "Mechanical", year: 2 },
  { studentId: 12, rollNumber: "EC2024028", name: "Ishita Das", email: "ishita.d@university.edu", department: "Electronics", year: 1 },
  { studentId: 13, rollNumber: "CS2024060", name: "Nikhil Kumar", email: "nikhil.k@university.edu", department: "Computer Science", year: 3 },
  { studentId: 14, rollNumber: "IT2024041", name: "Meera Iyer", email: "meera.i@university.edu", department: "Information Technology", year: 2 },
  { studentId: 15, rollNumber: "EE2024005", name: "Siddharth Agarwal", email: "siddharth.a@university.edu", department: "Electrical", year: 4 },
];

export const roles: Role[] = [
  { roleId: 1, roleName: "President", roleType: "admin" },
  { roleId: 2, roleName: "Vice President", roleType: "admin" },
  { roleId: 3, roleName: "Secretary", roleType: "admin" },
  { roleId: 4, roleName: "Treasurer", roleType: "admin" },
  { roleId: 5, roleName: "Member", roleType: "member" },
  { roleId: 6, roleName: "Coordinator", roleType: "member" },
];

export const memberships: Membership[] = [
  { membershipId: 1, studentId: 1, clubId: 1, roleId: 1, joinDate: "2024-08-15" },
  { membershipId: 2, studentId: 4, clubId: 1, roleId: 2, joinDate: "2024-08-15" },
  { membershipId: 3, studentId: 5, clubId: 1, roleId: 5, joinDate: "2024-09-01" },
  { membershipId: 4, studentId: 7, clubId: 1, roleId: 5, joinDate: "2024-09-10" },
  { membershipId: 5, studentId: 13, clubId: 1, roleId: 6, joinDate: "2024-09-05" },
  { membershipId: 6, studentId: 2, clubId: 2, roleId: 1, joinDate: "2024-08-20" },
  { membershipId: 7, studentId: 8, clubId: 2, roleId: 5, joinDate: "2024-09-15" },
  { membershipId: 8, studentId: 14, clubId: 2, roleId: 3, joinDate: "2024-08-20" },
  { membershipId: 9, studentId: 3, clubId: 3, roleId: 1, joinDate: "2024-08-10" },
  { membershipId: 10, studentId: 6, clubId: 3, roleId: 5, joinDate: "2024-09-20" },
  { membershipId: 11, studentId: 11, clubId: 3, roleId: 5, joinDate: "2024-10-01" },
  { membershipId: 12, studentId: 9, clubId: 4, roleId: 1, joinDate: "2024-08-18" },
  { membershipId: 13, studentId: 12, clubId: 4, roleId: 5, joinDate: "2024-09-25" },
  { membershipId: 14, studentId: 10, clubId: 5, roleId: 1, joinDate: "2024-08-12" },
  { membershipId: 15, studentId: 15, clubId: 5, roleId: 2, joinDate: "2024-08-12" },
  { membershipId: 16, studentId: 3, clubId: 5, roleId: 5, joinDate: "2024-09-01" },
  { membershipId: 17, studentId: 6, clubId: 6, roleId: 1, joinDate: "2024-08-25" },
  { membershipId: 18, studentId: 4, clubId: 6, roleId: 5, joinDate: "2024-10-05" },
  { membershipId: 19, studentId: 7, clubId: 7, roleId: 1, joinDate: "2024-08-22" },
  { membershipId: 20, studentId: 14, clubId: 7, roleId: 5, joinDate: "2024-09-30" },
  { membershipId: 21, studentId: 1, clubId: 8, roleId: 5, joinDate: "2024-09-15" },
  { membershipId: 22, studentId: 5, clubId: 8, roleId: 1, joinDate: "2024-08-14" },
  { membershipId: 23, studentId: 13, clubId: 8, roleId: 5, joinDate: "2024-10-10" },
];

export const budgets: Budget[] = [
  { budgetId: 1, clubId: 1, amount: 25000, status: "approved", description: "Annual Hackathon 2025", requestDate: "2025-01-10" },
  { budgetId: 2, clubId: 1, amount: 8000, status: "approved", description: "Workshop Equipment", requestDate: "2025-01-15" },
  { budgetId: 3, clubId: 2, amount: 15000, status: "approved", description: "Design Tools Subscription", requestDate: "2025-01-12" },
  { budgetId: 4, clubId: 2, amount: 12000, status: "pending", description: "Design Exhibition Setup", requestDate: "2025-02-01" },
  { budgetId: 5, clubId: 3, amount: 10000, status: "approved", description: "Tree Plantation Drive", requestDate: "2025-01-08" },
  { budgetId: 6, clubId: 3, amount: 5000, status: "rejected", description: "Extra Saplings Purchase", requestDate: "2025-02-05" },
  { budgetId: 7, clubId: 4, amount: 30000, status: "approved", description: "Annual Music Festival", requestDate: "2025-01-20" },
  { budgetId: 8, clubId: 4, amount: 7500, status: "pending", description: "New Instruments Purchase", requestDate: "2025-02-10" },
  { budgetId: 9, clubId: 5, amount: 20000, status: "approved", description: "Inter-College Tournament", requestDate: "2025-01-05" },
  { budgetId: 10, clubId: 6, amount: 6000, status: "approved", description: "Poetry Slam Event", requestDate: "2025-01-25" },
  { budgetId: 11, clubId: 7, amount: 18000, status: "pending", description: "Camera Equipment Upgrade", requestDate: "2025-02-15" },
  { budgetId: 12, clubId: 8, amount: 35000, status: "approved", description: "Robotics Competition", requestDate: "2025-01-18" },
  { budgetId: 13, clubId: 8, amount: 10000, status: "pending", description: "3D Printer Maintenance", requestDate: "2025-02-20" },
];

export const events: Event[] = [
  { eventId: 1, clubId: 1, eventName: "HackFest 2025", eventDate: "2025-03-15T09:00:00", venue: "Main Auditorium", maxParticipants: 200, description: "24-hour hackathon with exciting prizes and mentorship from industry leaders.", status: "upcoming" },
  { eventId: 2, clubId: 1, eventName: "Python Bootcamp", eventDate: "2025-02-28T14:00:00", venue: "Lab 301", maxParticipants: 50, description: "Intensive Python programming bootcamp for beginners.", status: "upcoming" },
  { eventId: 3, clubId: 2, eventName: "Design Thinking Workshop", eventDate: "2025-03-05T10:00:00", venue: "Seminar Hall B", maxParticipants: 40, description: "Learn design thinking methodology and create user-centered solutions.", status: "upcoming" },
  { eventId: 4, clubId: 3, eventName: "Campus Green Drive", eventDate: "2025-02-20T07:00:00", venue: "Campus Ground", maxParticipants: 100, description: "Plant 500 trees across the campus and promote green initiatives.", status: "completed" },
  { eventId: 5, clubId: 4, eventName: "Melodia 2025", eventDate: "2025-04-10T18:00:00", venue: "Open Air Theatre", maxParticipants: 500, description: "Annual music festival featuring bands, solo performances, and DJ night.", status: "upcoming" },
  { eventId: 6, clubId: 5, eventName: "Sports Week", eventDate: "2025-03-20T08:00:00", venue: "Sports Complex", maxParticipants: 300, description: "Week-long sporting event with cricket, football, basketball, and athletics.", status: "upcoming" },
  { eventId: 7, clubId: 6, eventName: "Poetry Under Stars", eventDate: "2025-02-14T19:00:00", venue: "Rooftop Garden", maxParticipants: 60, description: "An evening of poetry recitation under the starlit sky.", status: "completed" },
  { eventId: 8, clubId: 7, eventName: "Photo Walk: Old City", eventDate: "2025-03-08T06:00:00", venue: "Old City Area", maxParticipants: 30, description: "Explore and capture the heritage architecture of the old city.", status: "upcoming" },
  { eventId: 9, clubId: 8, eventName: "RoboWars 2025", eventDate: "2025-04-05T10:00:00", venue: "Robotics Lab", maxParticipants: 80, description: "Battle of the bots! Bring your best robot and compete for glory.", status: "upcoming" },
  { eventId: 10, clubId: 1, eventName: "Web Dev Bootcamp", eventDate: "2025-01-20T14:00:00", venue: "Lab 205", maxParticipants: 45, description: "Full-stack web development crash course covering React and Node.js.", status: "completed" },
  { eventId: 11, clubId: 5, eventName: "Marathon 2025", eventDate: "2025-02-25T05:30:00", venue: "Campus Track", maxParticipants: 150, description: "5K and 10K marathon open to all students and faculty.", status: "completed" },
  { eventId: 12, clubId: 2, eventName: "UI/UX Challenge", eventDate: "2025-03-25T09:00:00", venue: "Design Studio", maxParticipants: 35, description: "48-hour UI/UX design challenge with real-world problem statements.", status: "upcoming" },
];

export const registrations: Registration[] = [
  { registrationId: 1, eventId: 1, studentId: 1, registrationDate: "2025-02-15T10:30:00" },
  { registrationId: 2, eventId: 1, studentId: 4, registrationDate: "2025-02-15T11:00:00" },
  { registrationId: 3, eventId: 1, studentId: 5, registrationDate: "2025-02-16T09:00:00" },
  { registrationId: 4, eventId: 1, studentId: 7, registrationDate: "2025-02-16T14:30:00" },
  { registrationId: 5, eventId: 1, studentId: 13, registrationDate: "2025-02-17T10:00:00" },
  { registrationId: 6, eventId: 2, studentId: 3, registrationDate: "2025-02-10T08:00:00" },
  { registrationId: 7, eventId: 2, studentId: 7, registrationDate: "2025-02-10T12:00:00" },
  { registrationId: 8, eventId: 2, studentId: 12, registrationDate: "2025-02-11T16:00:00" },
  { registrationId: 9, eventId: 3, studentId: 2, registrationDate: "2025-02-20T09:00:00" },
  { registrationId: 10, eventId: 3, studentId: 8, registrationDate: "2025-02-20T13:00:00" },
  { registrationId: 11, eventId: 3, studentId: 14, registrationDate: "2025-02-21T10:00:00" },
  { registrationId: 12, eventId: 4, studentId: 3, registrationDate: "2025-02-10T07:00:00" },
  { registrationId: 13, eventId: 4, studentId: 6, registrationDate: "2025-02-10T08:00:00" },
  { registrationId: 14, eventId: 4, studentId: 11, registrationDate: "2025-02-11T09:00:00" },
  { registrationId: 15, eventId: 4, studentId: 8, registrationDate: "2025-02-12T07:30:00" },
  { registrationId: 16, eventId: 5, studentId: 9, registrationDate: "2025-03-01T10:00:00" },
  { registrationId: 17, eventId: 5, studentId: 12, registrationDate: "2025-03-01T14:00:00" },
  { registrationId: 18, eventId: 5, studentId: 1, registrationDate: "2025-03-02T09:00:00" },
  { registrationId: 19, eventId: 5, studentId: 4, registrationDate: "2025-03-02T15:00:00" },
  { registrationId: 20, eventId: 6, studentId: 10, registrationDate: "2025-03-01T08:00:00" },
  { registrationId: 21, eventId: 6, studentId: 15, registrationDate: "2025-03-01T11:00:00" },
  { registrationId: 22, eventId: 6, studentId: 3, registrationDate: "2025-03-02T07:00:00" },
  { registrationId: 23, eventId: 7, studentId: 6, registrationDate: "2025-02-05T10:00:00" },
  { registrationId: 24, eventId: 7, studentId: 4, registrationDate: "2025-02-06T14:00:00" },
  { registrationId: 25, eventId: 8, studentId: 7, registrationDate: "2025-02-25T09:00:00" },
  { registrationId: 26, eventId: 8, studentId: 14, registrationDate: "2025-02-25T16:00:00" },
  { registrationId: 27, eventId: 9, studentId: 5, registrationDate: "2025-03-10T10:00:00" },
  { registrationId: 28, eventId: 9, studentId: 1, registrationDate: "2025-03-10T12:00:00" },
  { registrationId: 29, eventId: 9, studentId: 13, registrationDate: "2025-03-11T09:00:00" },
  { registrationId: 30, eventId: 10, studentId: 1, registrationDate: "2025-01-10T10:00:00" },
  { registrationId: 31, eventId: 10, studentId: 4, registrationDate: "2025-01-10T14:00:00" },
  { registrationId: 32, eventId: 10, studentId: 7, registrationDate: "2025-01-11T09:00:00" },
  { registrationId: 33, eventId: 10, studentId: 5, registrationDate: "2025-01-11T16:00:00" },
  { registrationId: 34, eventId: 11, studentId: 10, registrationDate: "2025-02-15T06:00:00" },
  { registrationId: 35, eventId: 11, studentId: 15, registrationDate: "2025-02-15T07:00:00" },
  { registrationId: 36, eventId: 11, studentId: 3, registrationDate: "2025-02-16T08:00:00" },
  { registrationId: 37, eventId: 11, studentId: 11, registrationDate: "2025-02-16T09:00:00" },
];

export const attendances: Attendance[] = [
  { attendanceId: 1, eventId: 4, studentId: 3, status: "present", checkInTime: "2025-02-20T07:05:00" },
  { attendanceId: 2, eventId: 4, studentId: 6, status: "present", checkInTime: "2025-02-20T07:10:00" },
  { attendanceId: 3, eventId: 4, studentId: 11, status: "late", checkInTime: "2025-02-20T07:45:00" },
  { attendanceId: 4, eventId: 4, studentId: 8, status: "absent", checkInTime: "2025-02-20T07:00:00" },
  { attendanceId: 5, eventId: 7, studentId: 6, status: "present", checkInTime: "2025-02-14T19:02:00" },
  { attendanceId: 6, eventId: 7, studentId: 4, status: "present", checkInTime: "2025-02-14T19:05:00" },
  { attendanceId: 7, eventId: 10, studentId: 1, status: "present", checkInTime: "2025-01-20T13:55:00" },
  { attendanceId: 8, eventId: 10, studentId: 4, status: "present", checkInTime: "2025-01-20T14:00:00" },
  { attendanceId: 9, eventId: 10, studentId: 7, status: "late", checkInTime: "2025-01-20T14:20:00" },
  { attendanceId: 10, eventId: 10, studentId: 5, status: "present", checkInTime: "2025-01-20T13:50:00" },
  { attendanceId: 11, eventId: 11, studentId: 10, status: "present", checkInTime: "2025-02-25T05:25:00" },
  { attendanceId: 12, eventId: 11, studentId: 15, status: "present", checkInTime: "2025-02-25T05:28:00" },
  { attendanceId: 13, eventId: 11, studentId: 3, status: "late", checkInTime: "2025-02-25T05:40:00" },
  { attendanceId: 14, eventId: 11, studentId: 11, status: "absent", checkInTime: "2025-02-25T05:30:00" },
];

export const eventCoordinators: EventCoordinator[] = [
  { id: 1, eventId: 1, studentId: 13 },  // Nikhil coordinates HackFest
  { id: 2, eventId: 2, studentId: 5 },   // Vikram coordinates Python Bootcamp
  { id: 3, eventId: 3, studentId: 14 },  // Meera coordinates Design Thinking
  { id: 4, eventId: 5, studentId: 12 },  // Ishita coordinates Melodia
  { id: 5, eventId: 9, studentId: 13 },  // Nikhil also coordinates RoboWars
  { id: 6, eventId: 9, studentId: 1 },   // Aarav also coordinates RoboWars
];

// ==================== HELPER FUNCTIONS ====================

export function getClubById(id: number) {
  return clubs.find((c) => c.clubId === id);
}

export function getStudentById(id: number) {
  return students.find((s) => s.studentId === id);
}

export function getRoleById(id: number) {
  return roles.find((r) => r.roleId === id);
}

export function getClubMembers(clubId: number) {
  return memberships
    .filter((m) => m.clubId === clubId)
    .map((m) => ({
      ...m,
      student: getStudentById(m.studentId),
      role: getRoleById(m.roleId),
    }));
}

export function getClubEvents(clubId: number) {
  return events.filter((e) => e.clubId === clubId);
}

export function getClubBudgets(clubId: number) {
  return budgets.filter((b) => b.clubId === clubId);
}

export function getEventRegistrations(eventId: number) {
  return registrations
    .filter((r) => r.eventId === eventId)
    .map((r) => ({
      ...r,
      student: getStudentById(r.studentId),
    }));
}

export function getEventAttendance(eventId: number) {
  return attendances
    .filter((a) => a.eventId === eventId)
    .map((a) => ({
      ...a,
      student: getStudentById(a.studentId),
    }));
}

export function getStudentClubs(studentId: number) {
  return memberships
    .filter((m) => m.studentId === studentId)
    .map((m) => ({
      ...m,
      club: getClubById(m.clubId),
      role: getRoleById(m.roleId),
    }));
}

export function getStudentRegistrations(studentId: number) {
  return registrations
    .filter((r) => r.studentId === studentId)
    .map((r) => ({
      ...r,
      event: events.find((e) => e.eventId === r.eventId),
    }));
}

// ==================== STATS ====================

export function getDashboardStats() {
  const totalClubs = clubs.length;
  const totalStudents = students.length;
  const totalEvents = events.length;
  const upcomingEvents = events.filter((e) => e.status === "upcoming").length;
  const completedEvents = events.filter((e) => e.status === "completed").length;
  const totalMembers = memberships.length;
  const totalBudgetApproved = budgets.filter((b) => b.status === "approved").reduce((sum, b) => sum + b.amount, 0);
  const totalBudgetPending = budgets.filter((b) => b.status === "pending").reduce((sum, b) => sum + b.amount, 0);
  const totalRegistrations = registrations.length;

  return {
    totalClubs,
    totalStudents,
    totalEvents,
    upcomingEvents,
    completedEvents,
    totalMembers,
    totalBudgetApproved,
    totalBudgetPending,
    totalRegistrations,
  };
}

export function getClubMemberCounts() {
  return clubs.map((club) => ({
    clubName: club.clubName,
    members: memberships.filter((m) => m.clubId === club.clubId).length,
  }));
}

export function getEventRegistrationCounts() {
  return events.map((event) => ({
    eventName: event.eventName,
    registrations: registrations.filter((r) => r.eventId === event.eventId).length,
    maxParticipants: event.maxParticipants,
  }));
}

export function getCategoryDistribution() {
  const categoryMap: Record<string, number> = {};
  clubs.forEach((club) => {
    categoryMap[club.category] = (categoryMap[club.category] || 0) + 1;
  });
  return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
}

export function getBudgetByClub() {
  return clubs.map((club) => {
    const clubBudgets = budgets.filter((b) => b.clubId === club.clubId);
    return {
      clubName: club.clubName,
      approved: clubBudgets.filter((b) => b.status === "approved").reduce((s, b) => s + b.amount, 0),
      pending: clubBudgets.filter((b) => b.status === "pending").reduce((s, b) => s + b.amount, 0),
      rejected: clubBudgets.filter((b) => b.status === "rejected").reduce((s, b) => s + b.amount, 0),
    };
  });
}
