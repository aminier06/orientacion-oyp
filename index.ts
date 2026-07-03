// index.ts
// Punto de entrada de la Edge Function. Aquí sí se conecta la
// verificación real del JWT usando supabase-js, y se sirve el router
// de Hono. Sigue el mismo patrón de despliegue que tus otros
// proyectos: router.ts + permisos.ts + datos.ts se despliegan juntos.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import app from "./router.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

// Cliente liviano, solo para validar tokens de usuarios finales.
// La escritura/lectura real de datos pasa por datos.ts con la
// service role key, nunca por este cliente.
const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

// router.ts expone verificarJwtYObtenerUserId como placeholder.
// Aquí lo sobrescribimos con la implementación real antes de servir,
// para no mezclar la dependencia de supabase-js dentro de router.ts.
(globalThis as Record<string, unknown>).__verificarJwt = async (
  token: string,
): Promise<string | null> => {
  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
};

Deno.serve((req) => app.fetch(req));
