-- Política para permitir a los usuarios borrar sus propios mensajes
CREATE POLICY "Users can delete their own chat messages"
ON chat_messages FOR DELETE
TO authenticated
USING (user_id = auth.uid());
