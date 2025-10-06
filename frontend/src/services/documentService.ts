// ========================================
// DOCUMENT MANAGEMENT SERVICE
// ========================================
// API service layer for document CRUD operations

import { supabase } from '../lib/supabase'

export interface Document {
  id: string
  title: string
  description: string | null
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  mime_type: string
  category: 'policy' | 'handbook' | 'form' | 'certificate' | 'contract' | 'personal' | 'training' | 'compliance'
  access_level: 'public' | 'internal' | 'confidential' | 'restricted'
  owner_id: string
  department_id: string | null
  tags: string[]
  version: number
  is_active: boolean
  requires_acknowledgment: boolean
  acknowledgment_deadline: string | null
  download_count: number
  created_at: string
  updated_at: string
}

export interface DocumentAcknowledgment {
  id: string
  document_id: string
  employee_id: string
  acknowledged_at: string
  ip_address: string | null
  user_agent: string | null
  notes: string | null
}

export interface DocumentAccess {
  id: string
  document_id: string
  employee_id: string
  access_type: 'view' | 'download' | 'edit'
  accessed_at: string
  ip_address: string | null
  user_agent: string | null
}

export interface CreateDocumentRequest {
  title: string
  description?: string
  file: File
  category: 'policy' | 'handbook' | 'form' | 'certificate' | 'contract' | 'personal' | 'training' | 'compliance'
  access_level: 'public' | 'internal' | 'confidential' | 'restricted'
  department_id?: string
  tags?: string[]
  requires_acknowledgment?: boolean
  acknowledgment_deadline?: string
}

export interface UpdateDocumentRequest {
  id: string
  title?: string
  description?: string
  category?: 'policy' | 'handbook' | 'form' | 'certificate' | 'contract' | 'personal' | 'training' | 'compliance'
  access_level?: 'public' | 'internal' | 'confidential' | 'restricted'
  department_id?: string
  tags?: string[]
  requires_acknowledgment?: boolean
  acknowledgment_deadline?: string
  is_active?: boolean
}

class DocumentService {
  /**
   * Upload and create a new document
   */
  async createDocument(data: CreateDocumentRequest): Promise<{ success: boolean; document?: Document; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // Upload file to Supabase Storage
      const fileExt = data.file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `documents/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, data.file)

      if (uploadError) throw uploadError

      const currentTime = new Date().toISOString()
      const documentData = {
        title: data.title,
        description: data.description,
        file_name: data.file.name,
        file_path: filePath,
        file_size: data.file.size,
        file_type: fileExt || 'unknown',
        mime_type: data.file.type,
        category: data.category,
        access_level: data.access_level,
        department_id: data.department_id,
        tags: data.tags || [],
        version: 1,
        is_active: true,
        requires_acknowledgment: data.requires_acknowledgment || false,
        acknowledgment_deadline: data.acknowledgment_deadline,
        download_count: 0,
        created_at: currentTime,
        updated_at: currentTime
      }

      const { data: created, error } = await supabase
        .from('documents')
        .insert(documentData as any)
        .select()
        .single()

      if (error) throw error

      return { success: true, document: created }
    } catch (error: any) {
      console.error('Create document error:', error)
      return { success: false, error: error.message || 'Failed to create document' }
    }
  }

  /**
   * Get documents with filtering
   */
  async getDocuments(filters?: {
    category?: string
    access_level?: string
    department_id?: string
    owner_id?: string
    tags?: string[]
    is_active?: boolean
    search?: string
  }): Promise<Document[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      let query = supabase
        .from('documents')
        .select(`
          *,
          owner:user_profiles!owner_id(first_name, last_name),
          department:departments!department_id(name)
        `)

      if (filters?.category) query = query.eq('category', filters.category)
      if (filters?.access_level) query = query.eq('access_level', filters.access_level)
      if (filters?.department_id) query = query.eq('department_id', filters.department_id)
      if (filters?.owner_id) query = query.eq('owner_id', filters.owner_id)
      if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active)
      
      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to fetch documents:', error)
      return []
    }
  }

  /**
   * Get document by ID
   */
  async getDocumentById(id: string): Promise<Document | null> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          owner:user_profiles!owner_id(first_name, last_name),
          department:departments!department_id(name)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Failed to fetch document:', error)
      return null
    }
  }

  /**
   * Update document metadata
   */
  async updateDocument(data: UpdateDocumentRequest): Promise<{ success: boolean; document?: Document; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const updateData: any = { 
        updated_at: new Date().toISOString() 
      }

      if (data.title !== undefined) updateData.title = data.title
      if (data.description !== undefined) updateData.description = data.description
      if (data.category !== undefined) updateData.category = data.category
      if (data.access_level !== undefined) updateData.access_level = data.access_level
      if (data.department_id !== undefined) updateData.department_id = data.department_id
      if (data.tags !== undefined) updateData.tags = data.tags
      if (data.requires_acknowledgment !== undefined) updateData.requires_acknowledgment = data.requires_acknowledgment
      if (data.acknowledgment_deadline !== undefined) updateData.acknowledgment_deadline = data.acknowledgment_deadline
      if (data.is_active !== undefined) updateData.is_active = data.is_active

      const { data: updated, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single()

      if (error) throw error

      return { success: true, document: updated }
    } catch (error: any) {
      console.error('Update document error:', error)
      return { success: false, error: error.message || 'Failed to update document' }
    }
  }

  /**
   * Delete document (soft delete by setting is_active to false)
   */
  async deleteDocument(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { error } = await supabase
        .from('documents')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString() 
        } as any)
        .eq('id', id)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Delete document error:', error)
      return { success: false, error: error.message || 'Failed to delete document' }
    }
  }

  /**
   * Get document download URL
   */
  async getDocumentDownloadUrl(id: string, employeeId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // Get document details
      const document = await this.getDocumentById(id)
      if (!document) {
        return { success: false, error: 'Document not found' }
      }

      // Log access
      await this.logDocumentAccess(id, employeeId, 'download')

      // Increment download count
      await supabase
        .from('documents')
        .update({ 
          download_count: (document as any).download_count + 1,
          updated_at: new Date().toISOString() 
        } as any)
        .eq('id', id)

      // Get signed URL from Supabase Storage
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl((document as any).file_path, 3600) // 1 hour expiry

      if (error) throw error

      return { success: true, url: data.signedUrl }
    } catch (error: any) {
      console.error('Get document download URL error:', error)
      return { success: false, error: error.message || 'Failed to get download URL' }
    }
  }

  /**
   * Acknowledge document
   */
  async acknowledgeDocument(documentId: string, employeeId: string, notes?: string): Promise<{ success: boolean; acknowledgment?: DocumentAcknowledgment; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // Check if already acknowledged
      const { data: existing } = await supabase
        .from('document_acknowledgments')
        .select('id')
        .eq('document_id', documentId)
        .eq('employee_id', employeeId)
        .single()

      if (existing) {
        return { success: false, error: 'Document already acknowledged' }
      }

      const currentTime = new Date().toISOString()
      const acknowledgmentData = {
        document_id: documentId,
        employee_id: employeeId,
        acknowledged_at: currentTime,
        notes: notes
      }

      const { data: created, error } = await supabase
        .from('document_acknowledgments')
        .insert(acknowledgmentData as any)
        .select()
        .single()

      if (error) throw error

      // Log access
      await this.logDocumentAccess(documentId, employeeId, 'view')

      return { success: true, acknowledgment: created }
    } catch (error: any) {
      console.error('Acknowledge document error:', error)
      return { success: false, error: error.message || 'Failed to acknowledge document' }
    }
  }

  /**
   * Get document acknowledgments
   */
  async getDocumentAcknowledgments(documentId: string): Promise<DocumentAcknowledgment[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase
        .from('document_acknowledgments')
        .select(`
          *,
          employee:user_profiles!employee_id(first_name, last_name, employee_id)
        `)
        .eq('document_id', documentId)
        .order('acknowledged_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to fetch document acknowledgments:', error)
      return []
    }
  }

  /**
   * Get pending acknowledgments for employee
   */
  async getPendingAcknowledgments(employeeId: string): Promise<Document[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // Get documents requiring acknowledgment that haven't been acknowledged by this employee
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          owner:user_profiles!owner_id(first_name, last_name)
        `)
        .eq('requires_acknowledgment', true)
        .eq('is_active', true)
        .not('id', 'in', `(
          SELECT document_id 
          FROM document_acknowledgments 
          WHERE employee_id = '${employeeId}'
        )`)
        .order('acknowledgment_deadline', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to fetch pending acknowledgments:', error)
      return []
    }
  }

  /**
   * Log document access
   */
  private async logDocumentAccess(documentId: string, employeeId: string, accessType: 'view' | 'download' | 'edit'): Promise<void> {
    try {
      if (!supabase) return

      const accessData = {
        document_id: documentId,
        employee_id: employeeId,
        access_type: accessType,
        accessed_at: new Date().toISOString()
      }

      await supabase
        .from('document_access_logs')
        .insert(accessData as any)
    } catch (error: any) {
      console.error('Failed to log document access:', error)
    }
  }

  /**
   * Get document access logs
   */
  async getDocumentAccessLogs(documentId: string): Promise<DocumentAccess[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase
        .from('document_access_logs')
        .select(`
          *,
          employee:user_profiles!employee_id(first_name, last_name, employee_id)
        `)
        .eq('document_id', documentId)
        .order('accessed_at', { ascending: false })
        .limit(100)

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to fetch document access logs:', error)
      return []
    }
  }

  /**
   * Search documents
   */
  async searchDocuments(query: string, filters?: {
    category?: string
    access_level?: string
    department_id?: string
  }): Promise<Document[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      let dbQuery = supabase
        .from('documents')
        .select(`
          *,
          owner:user_profiles!owner_id(first_name, last_name),
          department:departments!department_id(name)
        `)
        .eq('is_active', true)

      // Full-text search on title, description, and tags
      if (query.trim()) {
        dbQuery = dbQuery.or(`
          title.ilike.%${query}%,
          description.ilike.%${query}%,
          tags.cs.{${query}}
        `)
      }

      if (filters?.category) dbQuery = dbQuery.eq('category', filters.category)
      if (filters?.access_level) dbQuery = dbQuery.eq('access_level', filters.access_level)
      if (filters?.department_id) dbQuery = dbQuery.eq('department_id', filters.department_id)

      dbQuery = dbQuery.order('created_at', { ascending: false })

      const { data, error } = await dbQuery

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Failed to search documents:', error)
      return []
    }
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(): Promise<{
    total_documents: number
    by_category: Record<string, number>
    by_access_level: Record<string, number>
    pending_acknowledgments: number
    total_downloads: number
  }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase
        .from('documents')
        .select('category, access_level, download_count, requires_acknowledgment')
        .eq('is_active', true)

      if (error) throw error

      const documents = data || []
      const totalDocuments = documents.length

      const byCategory: Record<string, number> = {}
      const byAccessLevel: Record<string, number> = {}
      let pendingAcknowledgments = 0
      let totalDownloads = 0

      documents.forEach(doc => {
        const category = (doc as any).category
        const accessLevel = (doc as any).access_level
        
        byCategory[category] = (byCategory[category] || 0) + 1
        byAccessLevel[accessLevel] = (byAccessLevel[accessLevel] || 0) + 1
        
        if ((doc as any).requires_acknowledgment) {
          pendingAcknowledgments++
        }
        
        totalDownloads += (doc as any).download_count || 0
      })

      return {
        total_documents: totalDocuments,
        by_category: byCategory,
        by_access_level: byAccessLevel,
        pending_acknowledgments: pendingAcknowledgments,
        total_downloads: totalDownloads
      }
    } catch (error: any) {
      console.error('Failed to fetch document stats:', error)
      return {
        total_documents: 0,
        by_category: {},
        by_access_level: {},
        pending_acknowledgments: 0,
        total_downloads: 0
      }
    }
  }
}

export const documentService = new DocumentService()
export default documentService
