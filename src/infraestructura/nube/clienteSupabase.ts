import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

/**
 * Cliente único compartido por todos los adaptadores de infraestructura/nube.
 * El SDK persiste y refresca la sesión solo (localStorage), igual en el
 * renderer de Electron que en el WebView de Capacitor.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
