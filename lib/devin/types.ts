// Types for the Devin API resources surfaced in the control plane.
// See https://docs.devin.ai/api-reference/v1 (playbooks, knowledge) and
// https://docs.devin.ai/api-reference/v3 (schedules).

export type Playbook = {
  playbook_id: string
  title: string
  body: string
  macro: string | null
  status: string
  access_type: string
  org_id: string
  created_at: string | null
  updated_at: string | null
  created_by_user_name: string | null
  updated_by_user_name: string | null
}

export type Knowledge = {
  id: string
  name: string
  body: string
  trigger_description: string
  parent_folder_id: string | null
  pinned_repo: string | null
  macro: string | null
  created_at: string
  created_by: { full_name: string; image_url?: string | null } | null
}

export type KnowledgeFolder = {
  id: string
  name: string
  description: string
  created_at: string
}

export type Schedule = {
  scheduled_session_id: string
  org_id: string
  name: string
  prompt: string
  schedule_type: "recurring" | "one_time"
  frequency: string | null
  scheduled_at: string | null
  enabled: boolean
  notify_on: "always" | "failure" | "never"
  agent: "devin" | "data_analyst" | "advanced"
  playbook: { playbook_id: string; title: string | null } | null
  tags: string[] | null
  last_executed_at: string | null
  last_error_at: string | null
  last_error_message: string | null
  consecutive_failures?: number
  created_at: string
  updated_at: string
  created_by: string | null
  target_devin_id: string | null
  slack_channel_id: string | null
  slack_team_id: string | null
}

export type CreatedSession = {
  session_id: string
  url: string
  is_new_session?: boolean | null
}
