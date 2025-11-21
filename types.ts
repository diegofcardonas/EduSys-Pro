
export type Role = 'Administrator' | 'Professor' | 'Student';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  status: UserStatus;
  joinDate: string;
  // New extended fields
  phoneNumber?: string;
  address?: string;
  department?: string; // Generic field for department or class/grade reference
  bio?: string;
}

export interface Student extends User {
  role: 'Student';
  studentId: string;
  gradeLevel: number;
  parentContact: string;
}

export interface Teacher extends User {
  role: 'Professor';
  teacherId: string;
  department: string;
  office: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  description: string;
  studentIds: string[];
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  assignment: string;
  score: number;
  date: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: AttendanceStatus;
}

export interface TimetableEntry {
  id: string;
  courseId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string;
  endTime: string;
  room: string;
}

export interface CommunicationMessage {
  id: string;
  fromId: string;
  toId: string | 'all-students' | 'all-professors' | 'all';
  subject: string;
  body: string;
  date: string;
  read: boolean;
}