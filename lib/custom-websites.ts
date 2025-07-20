import { supabase } from './supabase'

export interface CustomWebsite {
  id: string
  user_id: string
  name: string
  url: string
  icon?: string
  category: string
  is_favorite: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CreateWebsiteData {
  name: string
  url: string
  icon?: string
  category?: string
}

export async function addCustomWebsite(userId: string, website: CreateWebsiteData): Promise<CustomWebsite> {
  const { data, error } = await supabase
    .from('custom_websites')
    .insert({
      user_id: userId,
      name: website.name,
      url: website.url,
      icon: website.icon,
      category: website.category || 'custom',
      sort_order: 0
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add website: ${error.message}`)
  }

  return data
}

export async function getCustomWebsites(userId: string): Promise<CustomWebsite[]> {
  const { data, error } = await supabase
    .from('custom_websites')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch websites: ${error.message}`)
  }

  return data || []
}

export async function updateCustomWebsite(
  websiteId: string, 
  updates: Partial<{
    name: string
    url: string
    icon: string
    category: string
    is_favorite: boolean
    sort_order: number
  }>
): Promise<CustomWebsite> {
  const { data, error } = await supabase
    .from('custom_websites')
    .update(updates)
    .eq('id', websiteId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update website: ${error.message}`)
  }

  return data
}

export async function deleteCustomWebsite(websiteId: string): Promise<void> {
  const { error } = await supabase
    .from('custom_websites')
    .delete()
    .eq('id', websiteId)

  if (error) {
    throw new Error(`Failed to delete website: ${error.message}`)
  }
}

export async function reorderWebsites(userId: string, websiteIds: string[]): Promise<void> {
  const updates = websiteIds.map((id, index) => ({
    id,
    sort_order: index
  }))

  const { error } = await supabase
    .from('custom_websites')
    .upsert(updates, { onConflict: 'id' })

  if (error) {
    throw new Error(`Failed to reorder websites: ${error.message}`)
  }
}

export async function getWebsitesByCategory(userId: string, category: string): Promise<CustomWebsite[]> {
  const { data, error } = await supabase
    .from('custom_websites')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch websites by category: ${error.message}`)
  }

  return data || []
}

export async function searchWebsites(userId: string, query: string): Promise<CustomWebsite[]> {
  const { data, error } = await supabase
    .from('custom_websites')
    .select('*')
    .eq('user_id', userId)
    .or(`name.ilike.%${query}%,url.ilike.%${query}%`)
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(`Failed to search websites: ${error.message}`)
  }

  return data || []
} 