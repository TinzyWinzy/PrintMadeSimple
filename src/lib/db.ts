import Dexie, { type Table } from 'dexie'

export interface SavedDesign {
  id?: number
  kind: 'jewel-calendar' | 'rfq' | 'order'
  ref: string
  payload: any
  status: 'draft' | 'queued' | 'sent' | 'collected'
  updatedAt: number
}

export class PMSDB extends Dexie {
  designs!: Table<SavedDesign, number>
  constructor() {
    super('pms-db')
    this.version(1).stores({ designs: '++id, kind, ref, status, updatedAt' })
  }
}

export const db = new PMSDB()

export async function saveDesign(d: Omit<SavedDesign, 'updatedAt'> & { id?: number }) {
  const updatedAt = Date.now()
  if (d.id) {
    await db.designs.update(d.id, { ...d, updatedAt })
    return d.id
  }
  return db.designs.add({ ...d, updatedAt } as SavedDesign)
}

export async function listDesigns(kind?: SavedDesign['kind']) {
  if (kind) return db.designs.where('kind').equals(kind).reverse().sortBy('updatedAt')
  return db.designs.orderBy('updatedAt').reverse().toArray()
}
