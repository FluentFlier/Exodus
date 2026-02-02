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
                    bio: string | null
                    embedding: string | null // vector type handled as string/array usually
                    tags: string[] | null
                    methods: string[] | null
                    collab_open: boolean | null
                    collab_roles: string[] | null
                    availability: 'low' | 'medium' | 'high' | null
                    created_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    email?: string | null
                    institution?: string | null
                    bio?: string | null
                    embedding?: string | null
                    tags?: string[] | null
                    methods?: string[] | null
                    collab_open?: boolean | null
                    collab_roles?: string[] | null
                    availability?: 'low' | 'medium' | 'high' | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    email?: string | null
                    institution?: string | null
                    bio?: string | null
                    embedding?: string | null
                    tags?: string[] | null
                    methods?: string[] | null
                    collab_open?: boolean | null
                    collab_roles?: string[] | null
                    availability?: 'low' | 'medium' | 'high' | null
                    created_at?: string
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
                    embedding: string | null
                    tags: string[] | null
                    source_url: string | null
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
                    embedding?: string | null
                    tags?: string[] | null
                    source_url?: string | null
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
                    embedding?: string | null
                    tags?: string[] | null
                    source_url?: string | null
                    updated_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    grant_id: string | null
                    owner_id: string | null
                    status: 'discovered' | 'draft' | 'submitted' | 'awarded' | null
                    title: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    grant_id?: string | null
                    owner_id?: string | null
                    status?: 'discovered' | 'draft' | 'submitted' | 'awarded' | null
                    title?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    grant_id?: string | null
                    owner_id?: string | null
                    status?: 'discovered' | 'draft' | 'submitted' | 'awarded' | null
                    title?: string | null
                    created_at?: string
                }
            }
            project_members: {
                Row: {
                    project_id: string
                    user_id: string
                    role: string | null
                }
                Insert: {
                    project_id: string
                    user_id: string
                    role?: string | null
                }
                Update: {
                    project_id?: string
                    user_id?: string
                    role?: string | null
                }
            }
            project_docs: {
                Row: {
                    id: string
                    project_id: string | null
                    title: string | null
                    content: Json | null
                    yjs_state: string | null // bytea represented as string/hex
                    doc_type: string | null
                    updated_at: string
                }
                Insert: {
                    id?: string
                    project_id?: string | null
                    title?: string | null
                    content?: Json | null
                    yjs_state?: string | null
                    doc_type?: string | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string | null
                    title?: string | null
                    content?: Json | null
                    yjs_state?: string | null
                    doc_type?: string | null
                    updated_at?: string
                }
            }
            artifacts: {
                Row: {
                    id: string
                    project_id: string | null
                    name: string | null
                    storage_path: string | null
                    file_type: string | null
                    is_required: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id?: string | null
                    name?: string | null
                    storage_path?: string | null
                    file_type?: string | null
                    is_required?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string | null
                    name?: string | null
                    storage_path?: string | null
                    file_type?: string | null
                    is_required?: boolean | null
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
                }
                Insert: {
                    id?: string
                    project_id?: string | null
                    title?: string | null
                    status?: 'todo' | 'in_progress' | 'done' | null
                    assignee_id?: string | null
                    due_date?: string | null
                }
                Update: {
                    id?: string
                    project_id?: string | null
                    title?: string | null
                    status?: 'todo' | 'in_progress' | 'done' | null
                    assignee_id?: string | null
                    due_date?: string | null
                }
            }
        }
    }
}
