-- Create support chat sessions table
CREATE TABLE IF NOT EXISTS support_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- Create support chat messages table
CREATE TABLE IF NOT EXISTS support_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES support_chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE support_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for support_chat_sessions
CREATE POLICY "Users can view their own chat sessions"
  ON support_chat_sessions FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own chat sessions"
  ON support_chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON support_chat_sessions FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Policies for support_chat_messages
CREATE POLICY "Users can view messages in their sessions"
  ON support_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_chat_sessions
      WHERE id = support_chat_messages.session_id
      AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can send messages in their sessions"
  ON support_chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM support_chat_sessions
      WHERE id = support_chat_messages.session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can send messages"
  ON support_chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    has_role(auth.uid(), 'admin')
  );

-- Create indexes for performance
CREATE INDEX idx_chat_sessions_user_id ON support_chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_status ON support_chat_sessions(status);
CREATE INDEX idx_chat_messages_session_id ON support_chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON support_chat_messages(created_at);

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE support_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE support_chat_sessions;