

import { Student, Teacher, Course, Grade, AttendanceRecord, TimetableEntry, CommunicationMessage } from '../types';

export const teachers: Teacher[] = [
  { id: 't1', teacherId: 'T001', name: 'Dr. Evelyn Reed', email: 'e.reed@school.edu', role: 'Professor', department: 'Science', office: 'A-101', avatarUrl: 'https://i.pravatar.cc/150?u=t1', status: 'Active', joinDate: '2020-08-15', phoneNumber: '+1 (555) 101-2020', address: '45 Science Ct, Tech Valley' },
  { id: 't2', teacherId: 'T002', name: 'Mr. David Chen', email: 'd.chen@school.edu', role: 'Professor', department: 'Mathematics', office: 'B-203', avatarUrl: 'https://i.pravatar.cc/150?u=t2', status: 'Active', joinDate: '2019-01-10', phoneNumber: '+1 (555) 202-3030', address: '88 Calculus Rd, Pi City' },
  { id: 't3', teacherId: 'T003', name: 'Ms. Maria Garcia', email: 'm.garcia@school.edu', role: 'Professor', department: 'History', office: 'C-105', avatarUrl: 'https://i.pravatar.cc/150?u=t3', status: 'Suspended', joinDate: '2021-03-22', phoneNumber: '+1 (555) 303-4040', address: '12 History Ln, Past Town' },
];

export const students: Student[] = [
  { id: 's1', studentId: 'S001', name: 'Alice Johnson', email: 'a.johnson@school.edu', role: 'Student', gradeLevel: 10, parentContact: 'parent1@email.com', avatarUrl: 'https://i.pravatar.cc/150?u=s1', status: 'Active', joinDate: '2022-09-01', phoneNumber: '+1 (555) 987-6543', address: '123 Maple St, Springfield' },
  { id: 's2', studentId: 'S002', name: 'Bob Williams', email: 'b.williams@school.edu', role: 'Student', gradeLevel: 11, parentContact: 'parent2@email.com', avatarUrl: 'https://i.pravatar.cc/150?u=s2', status: 'Active', joinDate: '2022-09-01', phoneNumber: '+1 (555) 876-5432', address: '456 Oak Ave, Shelbyville' },
  { id: 's3', studentId: 'S003', name: 'Charlie Brown', email: 'c.brown@school.edu', role: 'Student', gradeLevel: 10, parentContact: 'parent3@email.com', avatarUrl: 'https://i.pravatar.cc/150?u=s3', status: 'Inactive', joinDate: '2023-01-15', phoneNumber: '+1 (555) 765-4321', address: '789 Pine Rd, Capital City' },
  { id: 's4', studentId: 'S004', name: 'Diana Miller', email: 'd.miller@school.edu', role: 'Student', gradeLevel: 12, parentContact: 'parent4@email.com', avatarUrl: 'https://i.pravatar.cc/150?u=s4', status: 'Active', joinDate: '2021-09-01', phoneNumber: '+1 (555) 654-3210', address: '101 Birch Blvd, Ogdenville' },
];

export const courses: Course[] = [
  { id: 'c1', name: 'Biology 101', code: 'BIO-101', teacherId: 't1', description: 'Introduction to Biological Sciences.', studentIds: ['s1', 's3'] },
  { id: 'c2', name: 'Calculus II', code: 'MTH-201', teacherId: 't2', description: 'Advanced topics in calculus.', studentIds: ['s2', 's4'] },
  { id: 'c3', name: 'World History', code: 'HIS-102', teacherId: 't3', description: 'From the Renaissance to the modern era.', studentIds: ['s1', 's2', 's3'] },
];

export const grades: Grade[] = [
  { id: 'g1', studentId: 's1', courseId: 'c1', assignment: 'Midterm Exam', score: 88, date: '2023-10-15' },
  { id: 'g2', studentId: 's3', courseId: 'c1', assignment: 'Midterm Exam', score: 92, date: '2023-10-15' },
  { id: 'g3', studentId: 's2', courseId: 'c2', assignment: 'Homework 1', score: 95, date: '2023-09-20' },
  { id: 'g4', studentId: 's1', courseId: 'c3', assignment: 'Essay 1', score: 85, date: '2023-10-05' },
];

export const attendance: AttendanceRecord[] = [
  { id: 'a1', studentId: 's1', courseId: 'c1', date: '2023-11-01', status: 'Present' },
  { id: 'a2', studentId: 's3', courseId: 'c1', date: '2023-11-01', status: 'Late' },
  { id: 'a3', studentId: 's2', courseId: 'c3', date: '2023-11-01', status: 'Present' },
  { id: 'a4', studentId: 's1', courseId: 'c3', date: '2023-11-01', status: 'Absent' },
];

export const timetable: TimetableEntry[] = [
  { id: 'tt1', courseId: 'c1', day: 'Monday', startTime: '09:00', endTime: '10:30', room: 'Lab A' },
  { id: 'tt2', courseId: 'c3', day: 'Monday', startTime: '11:00', endTime: '12:00', room: 'Room 201' },
  { id: 'tt3', courseId: 'c2', day: 'Tuesday', startTime: '10:00', endTime: '11:30', room: 'Room 303' },
  { id: 'tt4', courseId: 'c1', day: 'Wednesday', startTime: '09:00', endTime: '10:30', room: 'Lab A' },
  { id: 'tt5', courseId: 'c3', day: 'Thursday', startTime: '11:00', endTime: '12:00', room: 'Room 201' },
];

export const messages: CommunicationMessage[] = [
  { id: 'm1', fromId: 't1', toId: 'all-students', subject: 'Upcoming Biology Exam', body: 'Reminder: The midterm exam is next Monday. Please review chapters 1-5.', date: '2023-10-10', read: false },
  { id: 'm2', fromId: 'SYSTEM_ADMIN', toId: 'all', subject: 'Parent-Teacher Conferences', body: 'Parent-Teacher conferences will be held on November 15th. Sign-ups are now available.', date: '2023-10-09', read: true },
];
