import { supabase } from '@/lib/supabase'

export interface ChatRoom {
  id: string
  appointment_id?: number
  client_id: string
  therapist_id: string
  created_at: string
  // Join data
  client?: Profile
  therapist?: Profile
  last_message?: ChatMessage
}

export interface ChatMessage {
  id: number
  room_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file'
  created_at: string
  // Join data
  sender?: Profile
}

export interface Profile {
  id: string
  email: string
  name?: string
  role: 'ADMIN' | 'PATIENT' | 'THERAPIST' | 'RECEPTIONIST'
  avatar_url?: string
}

class ChatService {
  // Get chat rooms for a user
  async getChatRooms(userId: string, userRole: string): Promise<ChatRoom[]> {
    try {
      let query = supabase
        .from('chat_rooms')
        .select(`
          *,
          client:profiles!chat_rooms_client_id_fkey (
            id, name, email, avatar_url
          ),
          therapist:profiles!chat_rooms_therapist_id_fkey (
            id, name, email, avatar_url
          ),
          last_message:chat_messages (
            id, content, message_type, created_at,
            sender:profiles (
              id, name, avatar_url
            )
          )
        `)

      // Filter based on user role
      if (userRole === 'PATIENT') {
        query = query.eq('client_id', userId)
      } else if (userRole === 'THERAPIST') {
        query = query.eq('therapist_id', userId)
      }
      // Admin can see all chat rooms

      // Order by last message time
      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching chat rooms:', error)
      return []
    }
  }

  // Get or create chat room for an appointment
  async getOrCreateChatRoom(appointmentId: number, clientId: string, therapistId: string): Promise<ChatRoom | null> {
    try {
      // First try to find existing room
      const { data: existingRoom, error: fetchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single()

      if (existingRoom) {
        return existingRoom
      }

      // Create new room if doesn't exist
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
          appointment_id: appointmentId,
          client_id: clientId,
          therapist_id: therapistId
        })
        .select()
        .single()

      if (createError) throw createError
      return newRoom
    } catch (error) {
      console.error('Error getting or creating chat room:', error)
      return null
    }
  }

  // Get messages for a chat room
  async getChatMessages(roomId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles (
            id, name, email, avatar_url
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []).reverse() // Reverse to show oldest first
    } catch (error) {
      console.error('Error fetching chat messages:', error)
      return []
    }
  }

  // Send a message
  async sendMessage(roomId: string, senderId: string, content: string, messageType: 'text' | 'image' | 'file' = 'text'): Promise<{ success: boolean; error?: string; data?: ChatMessage }> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: senderId,
          content,
          message_type: messageType
        })
        .select(`
          *,
          sender:profiles (
            id, name, email, avatar_url
          )
        `)
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Delete a message
  async deleteMessage(messageId: number, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if user owns this message
      const { data: message, error: fetchError } = await supabase
        .from('chat_messages')
        .select('sender_id')
        .eq('id', messageId)
        .single()

      if (fetchError) throw fetchError

      if (message?.sender_id !== userId) {
        return { success: false, error: 'Unauthorized to delete this message' }
      }

      // Delete the message
      const { error: deleteError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)

      if (deleteError) throw deleteError

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Mark messages as read (optional - could implement read receipts)
  async markMessagesAsRead(roomId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This would require adding a 'read_at' column to chat_messages
      // For now, we'll just return success
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Get unread message count for a user
  async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      // Get all rooms where user is participant
      const { data: rooms, error: roomsError } = await supabase
        .from('chat_rooms')
        .select('id')
        .or(`client_id.eq.${userId},therapist_id.eq.${userId}`)

      if (roomsError) throw roomsError

      if (!rooms || rooms.length === 0) return 0

      // Count unread messages in these rooms
      // This would require adding a 'read_at' column and more complex logic
      // For now, return 0
      return 0
    } catch (error) {
      console.error('Error getting unread message count:', error)
      return 0
    }
  }

  // Subscribe to real-time messages for a room
  subscribeToChatMessages(roomId: string, callback: (message: ChatMessage) => void) {
    return supabase
      .channel(`chat_messages_${roomId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        }, 
        async (payload) => {
          if (payload.new) {
            // Get full message data with sender info
            const { data: message, error } = await supabase
              .from('chat_messages')
              .select(`
                *,
                sender:profiles (
                  id, name, email, avatar_url
                )
              `)
              .eq('id', payload.new.id)
              .single()

            if (!error && message) {
              callback(message)
            }
          }
        }
      )
      .subscribe()
  }

  // Subscribe to chat room updates
  subscribeToChatRooms(userId: string, userRole: string, callback: (room: ChatRoom) => void) {
    let filter = `client_id=eq.${userId}`
    if (userRole === 'THERAPIST') {
      filter = `therapist_id=eq.${userId}`
    }

    return supabase
      .channel('chat_rooms')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_rooms',
          filter: filter
        }, 
        async (payload) => {
          if (payload.new) {
            // Get full room data
            const { data: room, error } = await supabase
              .from('chat_rooms')
              .select(`
                *,
                client:profiles!chat_rooms_client_id_fkey (
                  id, name, email, avatar_url
                ),
                therapist:profiles!chat_rooms_therapist_id_fkey (
                  id, name, email, avatar_url
                )
              `)
              .eq('id', payload.new.id)
              .single()

            if (!error && room) {
              callback(room)
            }
          }
        }
      )
      .subscribe()
  }

  // Upload file for chat (image or document)
  async uploadChatFile(file: File, roomId: string, senderId: string): Promise<{ success: boolean; error?: string; url?: string }> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${roomId}/${senderId}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName)

      return { success: true, url: publicUrl }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Send image message
  async sendImageMessage(roomId: string, senderId: string, imageFile: File): Promise<{ success: boolean; error?: string; data?: ChatMessage }> {
    try {
      // Upload image first
      const uploadResult = await this.uploadChatFile(imageFile, roomId, senderId)
      if (!uploadResult.success || !uploadResult.url) {
        return { success: false, error: uploadResult.error || 'Failed to upload image' }
      }

      // Send message with image URL
      return await this.sendMessage(roomId, senderId, uploadResult.url, 'image')
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

export const chatService = new ChatService()