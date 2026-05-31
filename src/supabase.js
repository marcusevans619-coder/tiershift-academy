import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bbyvxfluwsiutmoosesz.supabase.co'
const supabaseKey = 'sb_publishable_H6VRowYm_GcPTewa495wrg_42-D4T1p'

export const supabase = createClient(supabaseUrl, supabaseKey)
