import { supabaseAdmin } from "@/utils/supabase-instance";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  status: "completed" | "not completed";
  error: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(500).json({
      status: "not completed",
      error: true,
    });
  }

  const supabaseServerClient = createServerSupabaseClient({
    req,
    res,
  });
  const { data, error } = await supabaseServerClient.auth.getUser();
  if (!data.user || error) {
    return res.status(500).json({
      error: true,
      status: "not completed",
    });
  }

  const admin_user = await supabaseAdmin
    .from("admin-user")
    .select("*")
    .eq("admin_id", data.user.id);

  if (!admin_user.data || admin_user.data.length === 0) {
    return res.status(500).json({
      error: true,
      status: "not completed",
    });
  }

  const del_user = await supabaseAdmin.auth.admin.getUserById(user_id);
  if (!del_user.data.user) {
    return res.status(500).json({
      error: true,
      status: "not completed",
    });
  };

  const purchased_course_data = await supabaseAdmin
    .from("purchased_courses")
    .delete()
    .eq("user_id", del_user.data.user.id);
  const scheduled_meeting_data = await supabaseAdmin
    .from("scheduled_meetings")
    .delete()
    .eq("user_email", del_user.data.user.email);
  const comments_data = await supabaseAdmin
    .from("comments")
    .delete()
    .eq("user_id", del_user.data.user.id);
  const user_data = await supabaseAdmin
    .from("users")
    .delete()
    .eq("id", del_user.data.user.id);
  if (
    !purchased_course_data.data ||
    !scheduled_meeting_data.data ||
    !comments_data.data ||
    !user_data.data
  ) {
    return res.status(500).json({ error: true, status: "not completed" });
  }
  await supabaseAdmin.auth.admin.deleteUser(user_id);
  return res.status(200).json({ error: false, status: "completed" });
}
