import type { Table } from 'dexie'

export interface SavedDesign {
  id?: number
  kind: 'jewel-calendar' | 'rfq' | 'order'
  ref: string
  payload: any
  status: 'draft' | 'queued' | 'sent' | 'collected'
  updatedAt: number
}

type Database = {
  designs: Table<SavedDesign, number>
}

let databasePromise: Promise<Database> | null = null

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = import('dexie').then(({ default: Dexie }) => {
      const db = new Dexie('pms-db')
      db.version(1).stores({ designs: '++id, kind, ref, status, updatedAt' })
      return { designs: db.table<SavedDesign, number>('designs') }
    })
  }
  return databasePromise
}

export async function saveDesign(d: Omit<SavedDesign, 'updatedAt'> & { id?: number }) {
  const db = await getDatabase()
  const updatedAt = Date.now()
  if (d.id) {
    await db.designs.update(d.id, { ...d, updatedAt })
    return d.id
  }
  return db.designs.add({ ...d, updatedAt } as SavedDesign)
}

export async function listDesigns(kind?: SavedDesign['kind']) {
  const db = await getDatabase()
  if (kind) return db.designs.where('kind').equals(kind).reverse().sortBy('updatedAt')
  return db.designs.orderBy('updatedAt').reverse().toArray()
}

export async function findDesignByRef(ref: string) {
  const db = await getDatabase()
  return db.designs.where('ref').equalsIgnoreCase(ref).first()
}

export async function deleteDesign(id: number) {
  const db = await getDatabase()
  await db.designs.delete(id)
}
