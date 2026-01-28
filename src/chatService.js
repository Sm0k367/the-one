import { supabase } from './supabaseClient'

// Save chat history to database
export async function saveChatHistory(userId, messages) {
  if (!userId) return

  try {
    // Check if user already has chat history
    const { data: existing } = await supabase
      .from('chat_history')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('chat_history')
        .update({
          messages: messages,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error
    } else {
      // Insert new
      const { error } = await supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          messages: messages
        })

      if (error) throw error
    }
  } catch (error) {
    console.error('Error saving chat history:', error)
  }
}

// Load chat history from database
export async function loadChatHistory(userId) {
  if (!userId) return null

  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('messages')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, return null
        return null
      }
      throw error
    }

    return data?.messages || null
  } catch (error) {
    console.error('Error loading chat history:', error)
    return null
  }
}

// Delete chat history from database
export async function deleteChatHistory(userId) {
  if (!userId) return

  try {
    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting chat history:', error)
  }
}
