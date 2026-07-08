import type { StaffMember } from '@luxe-maison/core';

/** Pre-hashed demo passwords: admin123, manager123, employee123 */
export const STAFF_SEED_ACCOUNTS: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Admin User',
    email: 'admin@maison.com',
    role: 'admin',
    passwordHash: '$2b$10$TBBZWIGFEZMJZlCfeOxvc.gsb.FOJS/XI4mN4qzNiEk2q.6mYrAA2',
    addedAt: '2025-12-01',
    avatar: '',
  },
  {
    id: 'staff-2',
    name: 'Manager User',
    email: 'manager@maison.com',
    role: 'manager',
    passwordHash: '$2b$10$t4O5x82u2d1N6tAmK88JAOke0DxTB1enhEmqpdMqTc1o5RBGMVWTa',
    addedAt: '2026-01-15',
    avatar: '',
  },
  {
    id: 'staff-3',
    name: 'Employee User',
    email: 'employee@maison.com',
    role: 'employee',
    passwordHash: '$2b$10$WSMQuEds0Hcr7rOdcLpvwu99qefuScuQwTRyw3HbI1EmK.J1YPNJy',
    addedAt: '2026-02-20',
    avatar: '',
  },
];
