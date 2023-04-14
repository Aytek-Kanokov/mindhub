import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/utils/supabase-instance";
import { IBody } from "@/global";
import {
  addMinutes,
  createZoomMeeting,
  deleteZoomMeeting,
  GenerateZoomAdminData,
  UpdateZoomMeeting,
} from "@/utils/helper";

type Data = {
  meetingLink: string | null;
  error: boolean;
  status: "completed" | "not completed" | "deleted";
  reason?: string;
  meetingsData?: Array<object>;
};
// IBody is how you define the req.body and provide meeting_id as a query param in delete and patch request

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const zoom_admin_data = await GenerateZoomAdminData();
  if (!zoom_admin_data) {
    return res.status(500).json({
      error: true,
      reason: "Zoom Error",
      meetingLink: null,
      status: "not completed",
    });
  }

  if (req.method === "POST") {
    const {
      attendee_emails, // Array<emails>
      start_time, // UTC format 2023-03-31 22:21:48.819102+00
      meeting_title,
      meeting_description,
      adminEmail,
    }: IBody = req.body;
    if (attendee_emails.length <= 1 || adminEmail.length <= 9) {
      return res.status(400).json({
        error: true,
        reason: "Email not valid",
        status: "not completed",
        meetingLink: null,
      });
    }

    if (meeting_description.length < 5 || meeting_title.length < 3) {
      return res.status(500).json({
        error: true,
        reason: "meeting description",
        meetingLink: null,
        status: "not completed",
      });
    }
    // additional body checks we can do here
    const parsed_attendee_emails = attendee_emails.map((item) => {
      return { email: item };
    });
    const alternative_hosts = [""]; // admin email
    const alternative_hosts_string = alternative_hosts.join(";");
    const meeting_data = await createZoomMeeting(
      adminEmail,
      start_time,
      meeting_description,
      meeting_title,
      alternative_hosts_string,
      parsed_attendee_emails,
      zoom_admin_data.token
    )

    return res.status(200).json({
      status: "completed",
      error: false,
      meetingLink: meeting_data.join_link,
    });
    // start time to be in UTC
  } 
}
