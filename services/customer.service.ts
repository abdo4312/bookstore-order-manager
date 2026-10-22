import { Customer } from '../types';
import { USE_CLOUD } from './config';
import { supabase } from './supabase.service';
import { logSQL } from './storage';

function mapCustomer(row: any): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    notes: row.notes ?? undefined,
    isBlocked: row.is_blocked ? true : row.isBlocked ? true : false,
    blockReason: row.block_reason ?? row.blockReason ?? undefined,
  };
}

// Cloud implementations
const cloudGetAllCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw new Error(error.message);
  return (data || []).map(mapCustomer);
};

const cloudAddCustomer = async (name: string, phone: string): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .insert({ name, phone })
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return mapCustomer(data);
};

const cloudUpdateCustomer = async (id: number, updatesOrName: any, phone?: string): Promise<void> => {
  // Backward compatibility: support legacy (id, name, phone) signature
  let updates: Partial<{ name: string; phone: string; notes: string; isBlocked: boolean; blockReason: string }>;
  if (typeof updatesOrName === 'string') {
    updates = { name: updatesOrName, phone } as any;
  } else {
    updates = updatesOrName;
  }

  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.isBlocked !== undefined) dbUpdates.is_blocked = updates.isBlocked;
  if (updates.blockReason !== undefined) dbUpdates.block_reason = updates.blockReason;

  if (Object.keys(dbUpdates).length === 0) return;

  const { error } = await supabase.from('customers').update(dbUpdates).eq('id', id);
  if (error) throw new Error(error.message);
};

const cloudDeleteCustomer = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);
  
  if (error) throw new Error(error.message);
};

// Local SQLite implementations
const localGetAllCustomers = async (): Promise<Customer[]> => {
  await logSQL(`SELECT * FROM customers;`);
  const rows: any[] = await window.electron.db.query('SELECT * FROM customers ORDER BY name ASC');
  return rows.map(mapCustomer);
};

const localAddCustomer = async (name: string, phone: string): Promise<Customer> => {
  await logSQL(`INSERT INTO customers (name, phone) VALUES ('${name}', '${phone}');`);
  
  const result = await window.electron.db.execute(
    'INSERT INTO customers (name, phone) VALUES (?, ?)',
    [name, phone]
  );
  
  return { id: result.lastInsertRowid, name, phone };
};

const localUpdateCustomer = async (id: number, updatesOrName: any, phone?: string): Promise<void> => {
  // Backward compatibility: support legacy (id, name, phone) signature
  let updates: Partial<{ name: string; phone: string; notes: string; isBlocked: boolean; blockReason: string }>;
  if (typeof updatesOrName === 'string') {
    updates = { name: updatesOrName, phone } as any;
  } else {
    updates = updatesOrName;
  }

  const fields: string[] = [];
  const values: any[] = [];
  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.phone !== undefined) { fields.push('phone = ?'); values.push(updates.phone); }
  if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
  if (updates.isBlocked !== undefined) { fields.push('is_blocked = ?'); values.push(updates.isBlocked ? 1 : 0); }
  if (updates.blockReason !== undefined) { fields.push('block_reason = ?'); values.push(updates.blockReason); }
  
  if (fields.length === 0) return;
  values.push(id);
  
  await logSQL(`UPDATE customers SET ${fields.join(', ')} WHERE id = ${id};`);
  await window.electron.db.execute(
    `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
};

const localDeleteCustomer = async (id: number): Promise<void> => {
  await logSQL(`DELETE FROM customers WHERE id = ${id};`);
  await window.electron.db.execute('DELETE FROM customers WHERE id = ?', [id]);
};

// Export based on USE_CLOUD config
export const getAllCustomers = USE_CLOUD ? cloudGetAllCustomers : localGetAllCustomers;
export const addCustomer = USE_CLOUD ? cloudAddCustomer : localAddCustomer;
export const updateCustomer = USE_CLOUD ? cloudUpdateCustomer : localUpdateCustomer;
export const deleteCustomer = USE_CLOUD ? cloudDeleteCustomer : localDeleteCustomer;
