/**
 * Permessi e token per le notifiche push.
 *
 * `registraToken` non lancia MAI: una push mancata non deve far cadere
 * niente, perché c'è sempre l'email di riserva.
 */
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { DEMO } from "./dati";
import { supabase } from "./supabase";

export async function statoPermesso(): Promise<"da_chiedere" | "concesso" | "negato"> {
  try {
    const p = await Notifications.getPermissionsAsync();
    if (p.granted) return "concesso";
    if (p.canAskAgain) return "da_chiedere";
    return "negato";
  } catch (e) {
    console.error("[notifiche] permesso non letto:", e);
    return "da_chiedere";
  }
}

/** Innesca il prompt nativo. Vero se l'utente concede. */
export async function chiediPermesso(): Promise<boolean> {
  try {
    const p = await Notifications.requestPermissionsAsync();
    return p.granted;
  } catch (e) {
    console.error("[notifiche] richiesta permesso fallita:", e);
    return false;
  }
}

/** Prende l'Expo push token e lo salva su profili.expo_push_token. */
export async function registraToken(): Promise<void> {
  try {
    if (DEMO) return; // in demo non si tocca la rete

    const permesso = await Notifications.getPermissionsAsync();
    if (!permesso.granted) return;

    // Il projectId serve nelle build EAS; se manca si tenta comunque
    // (in Expo Go funziona senza) e in caso di errore si tace.
    const projectId: string | undefined =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? undefined;
    const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
    if (!token) return;

    const { data } = await supabase.auth.getSession();
    const id = data.session?.user.id;
    if (!id) return;

    const { error } = await supabase.from("profili").update({ expo_push_token: token }).eq("id", id);
    if (error) console.error("[notifiche] token non salvato:", error.message);
  } catch (e) {
    console.error("[notifiche] registrazione token saltata:", e);
  }
}
