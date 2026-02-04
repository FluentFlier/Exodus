export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    email: string | null
                    institution: string | null
                    headline: string | null
                    bio: string | null
                    cv_text: string | null
                    preferences: Json | null
                    embedding: string | null
                    tags: string[] | null
                    methods: string[] | null
                    collab_open: boolean | null
                    collab_roles: string[] | null
                    availability: 'low' | 'medium' | 'high' | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    email?: string | null
                    institution?: string | null
                    headline?: string | null
                    bio?: string | null
                    cv_text?: string | null
                    preferences?: Json | null
                    embedding?: string | null
                    tags?: string[] | null
                    methods?: string[] | null
                    collab_open?: boolean | null
                    collab_roles?: string[] | null
                    availability?: 'low' | 'medium' | 'high' | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    email?: string | null
                    institution?: string | null
                    headline?: string | null
                    bio?: string | null
                    cv_text?: string | null
                    preferences?: Json | null
                    embedding?: string | null
                    tags?: string[] | null
                    methods?: string[] | null
                    collab_open?: boolean | null
                    collab_roles?: string[] | null
                    availability?: 'low' | 'medium' | 'high' | null
                    created_at?: string
                    updated_at?: string
                }
            }
            collaborator_directory: {
                Row: {
                    id: string
                    full_name: string | null
                    institution: string | null
                    headline: string | null
                    bio: string | null
                    tags: string[] | null
                    methods: string[] | null
                    collab_roles: string[] | null
                    availability: string | null
                    source: string | null
                    source_url: string | null
                    external_id: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    full_name?: string | null
                    institution?: string | null
                    headline?: string | null
                    bio?: string | null
                    tags?: string[] | null
                    methods?: string[] | null
                    collab_roles?: string[] | null
                    availability?: string | null
                    source?: string | null
                    source_url?: string | null
                    external_id?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    institution?: string | null
                    headline?: string | null
                    bio?: string | null
                    tags?: string[] | null
                    methods?: string[] | null
                    collab_roles?: string[] | null
                    availability?: string | null
                    source?: string | null
                    source_url?: string | null
                    external_id?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            grants: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    funder: string | null
                    deadline: string | null
                    amount_min: number | null
                    amount_max: number | null
                    eligibility_text: string | null
                    eligibility_json: Json | null
                    geography: string[] | null
                    categories: string[] | null
                    tags: string[] | null
                    source_url: string | null
                    source_name: string | null
                    source_identifier: string | null
                    embedding: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    funder?: string | null
                    deadline?: string | null
                    amount_min?: number | null
                    amount_max?: number | null
                    eligibility_text?: string | null
                    eligibility_json?: Json | null
                    geography?: string[] | null
                    categories?: string[] | null
                    tags?: string[] | null
                    source_url?: string | null
                    source_name?: string | null
                    source_identifier?: string | null
                    embedding?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    funder?: string | null
                    deadline?: string | null
                    amount_min?: number | null
                    amount_max?: number | null
                    eligibility_text?: string | null
                    eligibility_json?: Json | null
                    geography?: string[] | null
                    categories?: string[] | null
                    tags?: string[] | null
                    source_url?: string | null
                    source_name?: string | null
                    source_identifier?: string | null
                    embedding?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    grant_id: string | null
                    owner_id: string | null
                    status:
                        | 'discovered'
                        | 'under_evaluation'
                        | 'in_preparation'
                        | 'ready_to_submit'
                        | 'submitted'
                        | 'awarded'
                        | 'declined'
                        | 'archived'
                        | null
                    title: string | null
                    summary: string | null
                    readiness_score: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    grant_id?: string | null
                    owner_id?: string | null
                    status?:
                        | 'discovered'
                        | 'under_evaluation'
                        | 'in_preparation'
                        | 'ready_to_submit'
                        | 'submitted'
                        | 'awarded'
                        | 'declined'
                        | 'archived'
                        | null
                    title?: string | null
                    summary?: string | null
                    readiness_score?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    grant_id?: string | null
                    owner_id?: string | null
                    status?:
                        | 'discovered'
                        | 'under_evaluation'
                        | 'in_preparation'
                        | 'ready_to_submit'
                        | 'submitted'
                        | 'awarded'
                        | 'declined'
                        | 'archived'
                        | null
                    title?: string | null
                    summary?: string | null
                    readiness_score?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            project_members: {
                Row: {
                    project_id: string
                    user_id: string
                    role: string | null
                    status: string | null
                    invited_email: string | null
                    invited_by: string | null
                    created_at: string | null
                }
                Insert: {
                    project_id: string
                    user_id: string
                    role?: string | null
                    status?: string | null
                    invited_email?: string | null
                    invited_by?: string | null
                    created_at?: string | null
                }
                Update: {
                    project_id?: string
                    user_id?: string
                    role?: string | null
                    status?: string | null
                    invited_email?: string | null
                    invited_by?: string | null
                    created_at?: string | null
                }
            }
            project_invites: {
                Row: {
                    id: string
                    project_id: string | null
                    invited_email: string | null
                    invited_by: string | null
                    role: string | null
                    status: string | null
                    token: string | null
                    expires_at: string | null
                    accepted_at: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    project_id?: string | null
                    invited_email?: string | null
                    invited_by?: string | null
                    role?: string | null
                    status?: string | null
                    token?: string | null
                    expires_at?: string | null
                    accepted_at?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    project_id?: string | null
                    invited_email?: string | null
                    invited_by?: string | null
                    role?: string | null
                    status?: string | null
                    token?: string | null
                    expires_at?: string | null
                    accepted_at?: string | null
                    created_at?: string | null
                }
            }
            project_docs: {
                Row: {
                    id: string
                    project_id: string | null
                    title: string | null
                    content: Json | null
                    yjs_state: string | null
                    doc_type: string | null
                    updated_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id?: string | null
                    title?: string | null
                    content?: Json | null
                    yjs_state?: string | null
                    doc_type?: string | null
                    updated_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string | null
                    title?: string | null
                    content?: Json | null
                    yjs_state?: string | null
                    doc_type?: string | null
                    updated_at?: string
                    created_at?: string
                }
            }
            doc_comments: {
                Row: {
                    id: string
                    doc_id: string | null
                    author_id: string | null
                    thread: Json | null
                    status: string | null
                    anchor: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    doc_id?: string | null
                    author_id?: string | null
                    thread?: Json | null
                    status?: string | null
                    anchor?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    doc_id?: string | null
                    author_id?: string | null
                    thread?: Json | null
                    status?: string | null
                    anchor?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            doc_suggestions: {
                Row: {
                    id: string
                    doc_id: string | null
                    author_id: string | null
                    payload: Json | null
                    status: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    doc_id?: string | null
                    author_id?: string | null
                    payload?: Json | null
                    status?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    doc_id?: string | null
                    author_id?: string | null
                    payload?: Json | null
                    status?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            doc_versions: {
                Row: {
                    id: string
                    doc_id: string | null
                    name: string | null
                    snapshot: Json | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    doc_id?: string | null
                    name?: string | null
                    snapshot?: Json | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    doc_id?: string | null
                    name?: string | null
                    snapshot?: Json | null
                    created_by?: string | null
                    created_at?: string
                }
            }
            artifacts: {
                Row: {
                    id: string
                    project_id: string | null
                    name: string | null
                    storage_path: string | null
                    file_type: string | null
                    size_bytes: number | null
                    is_required: boolean | null
                    artifact_type: string | null
                    version: number | null
                    tags: string[] | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id?: string | null
                    name?: string | null
                    storage_path?: string | null
                    file_type?: string | null
                    size_bytes?: number | null
                    is_required?: boolean | null
                    artifact_type?: string | null
                    version?: number | null
                    tags?: string[] | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string | null
                    name?: string | null
                    storage_path?: string | null
                    file_type?: string | null
                    size_bytes?: number | null
                    is_required?: boolean | null
                    artifact_type?: string | null
                    version?: number | null
                    tags?: string[] | null
                    created_at?: string
                }
            }
            tasks: {
                Row: {
                    id: string
                    project_id: string | null
                    title: string | null
                    status: 'todo' | 'in_progress' | 'done' | null
                    assignee_id: string | null
                    due_date: string | null
                    linked_doc_id: string | null
                    linked_artifact_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    project_id?: string | null
                    title?: string | null
                    status?: 'todo' | 'in_progress' | 'done' | null
                    assignee_id?: string | null
                    due_date?: string | null
                    linked_doc_id?: string | null
                    linked_artifact_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string | null
                    title?: string | null
                    status?: 'todo' | 'in_progress' | 'done' | null
                    assignee_id?: string | null
                    due_date?: string | null
                    linked_doc_id?: string | null
                    linked_artifact_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string | null
                    type: string | null
                    message: string | null
                    payload: Json | null
                    read_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    type?: string | null
                    message?: string | null
                    payload?: Json | null
                    read_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    type?: string | null
                    message?: string | null
                    payload?: Json | null
                    read_at?: string | null
                    created_at?: string
                }
            }
            grant_feedback: {
                Row: {
                    id: string
                    user_id: string | null
                    grant_id: string | null
                    rating: number | null
                    reason: string | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    grant_id?: string | null
                    rating?: number | null
                    reason?: string | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    grant_id?: string | null
                    rating?: number | null
                    reason?: string | null
                    notes?: string | null
                    created_at?: string
                }
            }
            submission_packages: {
                Row: {
                    id: string
                    project_id: string | null
                    status: string | null
                    validation_report: Json | null
                    export_url: string | null
                    checksum: string | null
                    exported_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id?: string | null
                    status?: string | null
                    validation_report?: Json | null
                    export_url?: string | null
                    checksum?: string | null
                    exported_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string | null
                    status?: string | null
                    validation_report?: Json | null
                    export_url?: string | null
                    checksum?: string | null
                    exported_at?: string | null
                    created_at?: string
                }
            }
            grant_sources: {
                Row: {
                    id: string
                    name: string | null
                    url: string | null
                    last_ingested_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name?: string | null
                    url?: string | null
                    last_ingested_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string | null
                    url?: string | null
                    last_ingested_at?: string | null
                    created_at?: string
                }
            }
            ingestion_runs: {
                Row: {
                    id: string
                    source_id: string | null
                    status: string | null
                    summary: Json | null
                    started_at: string
                    finished_at: string | null
                }
                Insert: {
                    id?: string
                    source_id?: string | null
                    status?: string | null
                    summary?: Json | null
                    started_at?: string
                    finished_at?: string | null
                }
                Update: {
                    id?: string
                    source_id?: string | null
                    status?: string | null
                    summary?: Json | null
                    started_at?: string
                    finished_at?: string | null
                }
            }
        }
    }
}
