import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

const PROFILE_QUERY_KEY = ['profile'] as const

/**
 * Fetch user profile from Supabase
 */
async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is okay for new users
    throw new Error(error.message)
  }

  return data || null
}

/**
 * Hook to fetch user profile
 */
export function useProfile(userId: string | null | undefined) {
  return useQuery({
    queryKey: [...PROFILE_QUERY_KEY, userId],
    queryFn: () => fetchProfile(userId || ''),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Update user profile
 */
async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('Failed to update profile')
  }

  return data
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<Profile> }) =>
      updateProfile(userId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData([...PROFILE_QUERY_KEY, data.userId], data)
    },
  })
}

/**
 * Fetch projects for a user
 */
async function fetchProjects(userId: string) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('order', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

/**
 * Hook to fetch projects
 */
export function useProjects(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['projects', userId],
    queryFn: () => fetchProjects(userId || ''),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Fetch education records
 */
async function fetchEducation(userId: string) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const { data, error } = await supabase
    .from('education')
    .select('*')
    .eq('user_id', userId)
    .order('end_year', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

/**
 * Hook to fetch education
 */
export function useEducation(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['education', userId],
    queryFn: () => fetchEducation(userId || ''),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Fetch skills
 */
async function fetchSkills(userId: string) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', userId)
    .order('category', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

/**
 * Hook to fetch skills
 */
export function useSkills(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['skills', userId],
    queryFn: () => fetchSkills(userId || ''),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Fetch experiences
 */
async function fetchExperiences(userId: string) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

/**
 * Hook to fetch experiences
 */
export function useExperiences(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['experiences', userId],
    queryFn: () => fetchExperiences(userId || ''),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Fetch achievements
 */
async function fetchAchievements(userId: string) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

/**
 * Hook to fetch achievements
 */
export function useAchievements(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['achievements', userId],
    queryFn: () => fetchAchievements(userId || ''),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Fetch social links
 */
async function fetchSocialLinks(userId: string) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

/**
 * Hook to fetch social links
 */
export function useSocialLinks(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['social_links', userId],
    queryFn: () => fetchSocialLinks(userId || ''),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}
