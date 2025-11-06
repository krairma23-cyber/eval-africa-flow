-- Create secure function for role management
CREATE OR REPLACE FUNCTION update_user_role(
  target_user_id UUID,
  new_role app_role,
  justification TEXT DEFAULT 'Role updated by admin'
)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  caller_role app_role;
  old_role app_role;
  result jsonb;
BEGIN
  -- Verify caller is admin
  SELECT role INTO caller_role
  FROM user_roles
  WHERE user_id = auth.uid();
  
  IF caller_role IS NULL OR caller_role != 'admin' THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Prevent self-modification
  IF auth.uid() = target_user_id THEN
    RAISE EXCEPTION 'Cannot modify your own role';
  END IF;
  
  -- Get old role for audit log
  SELECT role INTO old_role
  FROM user_roles
  WHERE user_id = target_user_id;
  
  -- Update role (delete old, insert new)
  DELETE FROM user_roles WHERE user_id = target_user_id;
  INSERT INTO user_roles (user_id, role) 
  VALUES (target_user_id, new_role);
  
  -- Log the change to audit system
  INSERT INTO comprehensive_audit_logs (
    user_id, 
    action, 
    resource_type, 
    resource_id,
    request_data,
    response_data,
    success
  ) VALUES (
    auth.uid(), 
    'ROLE_CHANGE', 
    'user_roles', 
    target_user_id,
    jsonb_build_object(
      'target_user_id', target_user_id,
      'old_role', old_role,
      'new_role', new_role,
      'justification', justification
    ),
    jsonb_build_object(
      'success', true,
      'message', 'Role updated successfully'
    ),
    true
  );
  
  -- Return success result
  result := jsonb_build_object(
    'success', true,
    'old_role', old_role,
    'new_role', new_role,
    'message', 'Role updated successfully'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the failure
    INSERT INTO comprehensive_audit_logs (
      user_id, 
      action, 
      resource_type, 
      resource_id,
      request_data,
      response_data,
      success
    ) VALUES (
      auth.uid(), 
      'ROLE_CHANGE_FAILED', 
      'user_roles', 
      target_user_id,
      jsonb_build_object(
        'target_user_id', target_user_id,
        'new_role', new_role,
        'justification', justification
      ),
      jsonb_build_object(
        'error', SQLERRM
      ),
      false
    );
    
    -- Re-raise the exception
    RAISE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_role(UUID, app_role, TEXT) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION update_user_role IS 'Securely updates user roles with admin verification, self-modification prevention, and full audit logging';