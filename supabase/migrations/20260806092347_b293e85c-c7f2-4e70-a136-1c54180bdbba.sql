DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Leaderboard is viewable by all authenticated users" ON public.leaderboard_stats;
CREATE POLICY "Users can view their own stats"
ON public.leaderboard_stats FOR SELECT TO authenticated
USING (auth.uid() = user_id);

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_mt_account_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_leaderboard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

DROP POLICY IF EXISTS "Screenshots are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view screenshots" ON storage.objects;
CREATE POLICY "Users can view their own screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);