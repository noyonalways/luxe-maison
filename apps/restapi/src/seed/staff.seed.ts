import type { StaffRepository } from '@luxe-maison/core';
import { STAFF_SEED_ACCOUNTS } from '@luxe-maison/database';

export async function seedStaffIfEmpty(staffRepository: StaffRepository): Promise<void> {
  const existing = await staffRepository.findAll();
  if (existing.length > 0) return;

  for (const account of STAFF_SEED_ACCOUNTS) {
    await staffRepository.create(structuredClone(account));
  }

  console.log(`Seeded ${STAFF_SEED_ACCOUNTS.length} staff accounts (admin, manager, employee)`);
}
