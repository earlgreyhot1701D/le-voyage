-- Add Jessica (joellelux@gmail.com) as editor collaborator on NOLA trip
INSERT INTO trip_collaborators (trip_id, user_id, role)
VALUES (
  'd5a28539-e0c9-44eb-9209-d0aa83529800',
  '29a9f02d-2bf1-4a35-8e89-35a92a2db711',
  'editor'
)
ON CONFLICT (trip_id, user_id) DO NOTHING;