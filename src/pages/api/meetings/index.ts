import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/utils/supabase-instance';
import { IBody } from '@/global';
import {
  addMinutes,
  createZoomMeeting,
  deleteZoomMeeting,
  GenerateZoomAdminData,
  UpdateZoomMeeting,
} from '@/utils/helper';

type Data = {
  meetingLink: string | null;
  error: boolean;
  status: 'completed' | 'not completed' | 'deleted';
  reason?: string;
  meetingsData?: Array<object>;
};
// IBody is how you define the req.body and provide meeting_id as a query param in delete and patch request

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const supabaseServerClient = createServerSupabaseClient({
    req,
    res,
  });
  const { data } = await supabaseServerClient.auth.getUser();
  if (!data.user) {
    return res.status(401).json({
      error: true,
      status: 'not completed',
      reason: 'Unauthorized',
      meetingLink: null,
    });
  }
  const zoom_admin_data = await GenerateZoomAdminData();
  if (!zoom_admin_data) {
    return res.status(500).json({
      error: true,
      reason: 'Zoom Error',
      meetingLink: null,
      status: 'not completed',
    });
  }
  if (req.method === 'GET') {
    const { email } = req.query;
    if (email && email.length <= 9) {
      return res.status(400).json({
        error: true,
        reason: 'Email not valid',
        status: 'not completed',
        meetingLink: null,
      });
    }
    const meetingData = await supabaseAdmin
      .from('scheduled_meetings')
      .select('*')
      .eq('user_email', email);

    if (!meetingData.data || meetingData.error) {
      return res.status(500).json({
        error: true,
        reason: 'Supabase error',
        status: 'not completed',
        meetingLink: null,
      });
    }
    return res.status(200).json({
      error: false,
      status: 'completed',
      meetingLink: null,
      // meetingsData: meetingData.data.map((item) => {
      //   return {
      //     // according to the data required from db
      //   };
      // }),
      meetingsData: meetingData.data,
    });
  }
  if (req.method === 'POST') {
    const deserializedBody = JSON.parse(req.body);
    const {
      attendee_emails, // Array<emails>
      start_time, // ISO format 2023-03-16 22:21:48.819102+00
      meeting_title,
      meeting_description,
      adminEmail,
    }: IBody = deserializedBody;

    if (attendee_emails.length < 1 || adminEmail.length <= 9) {
      return res.status(400).json({
        error: true,
        reason: 'Email not valid',
        status: 'not completed',
        meetingLink: null,
      });
    }

    if (meeting_description.length < 5 || meeting_title.length < 3) {
      return res.status(500).json({
        error: true,
        reason: 'meeting description',
        meetingLink: null,
        status: 'not completed',
      });
    }
    // additional body checks we can do here
    const userData = await supabaseServerClient
      .from('users')
      .select('*')
      .eq('id', data.user.id);
    if (!userData.data) {
      return res.status(401).json({
        error: true,
        status: 'not completed',
        reason: 'not valid | Unauthorized',
        meetingLink: null,
      });
    }

    // Make an end_time by adding 60 minutes to start_time
    const end_date = addMinutes(new Date(start_time), 60);
    const parsed_attendee_emails = attendee_emails.map((item) => {
      return { email: item };
    });

    // Get the instructor's schedule and see if the time is available so we can prevent double booking

    const instructorSchedule = await supabaseAdmin
      .from('scheduled_meetings')
      .select('start_time')
      .eq('user_email', adminEmail);

    // instructorSchedule is an array of objects with start_time which is UTC format
    // make sure to convert the start_time to UTC format before comparing

    // format to UTC string
    const InstructorsSchedule = instructorSchedule.data?.map(
      ({ start_time: string }) => {
        return new Date(string).toUTCString();
      },
    );
    const StartTimeForMeeting = new Date(start_time).toUTCString();
    // Check if the time is available
    if (InstructorsSchedule?.includes(StartTimeForMeeting)) {
      return res.status(400).json({
        error: true,
        reason: 'Instructor is not available at this time',
        status: 'not completed',
        meetingLink: null,
      });
    }

    const alternative_hosts = ['']; // admin email
    const alternative_hosts_string = alternative_hosts.join(';');
    const meeting_data = await createZoomMeeting(
      adminEmail,
      start_time,
      meeting_description,
      meeting_title,
      alternative_hosts_string,
      parsed_attendee_emails,
      zoom_admin_data.token,
    );

    const meetings_insert_data = parsed_attendee_emails.map((item) => {
      return {
        meeting_id: meeting_data.id,
        user_email: item.email,
        zoom_link: meeting_data.start_url,
        start_time: new Date(start_time).toUTCString(),
        allowed_to_edit: true,
        end_time: end_date.toUTCString(),
        meeting_title,
        meeting_description,
      };
    });
    meetings_insert_data.push({
      meeting_id: meeting_data.id,
      user_email: adminEmail,
      zoom_link: meeting_data.start_url,
      start_time: new Date(start_time).toUTCString(),
      allowed_to_edit: true,
      end_time: end_date.toUTCString(),
      meeting_title,
      meeting_description,
    });

    const meetings_db = await supabaseAdmin
      .from('scheduled_meetings')
      .insert(meetings_insert_data);
    if (meetings_db.error) {
      return res.status(500).json({
        error: true,
        reason: 'Supabase error inserting meeting data',
        meetingLink: null,
        status: 'not completed',
      });
    }

    return res.status(200).json({
      status: 'completed',
      error: false,
      meetingLink: meeting_data.join_link,
    });
    // start time to be in UTC
  } else if (req.method === 'DELETE') {
    const { meeting_id } = req.query;
    if (!meeting_id || !data.user.email) {
      return res.status(400).json({
        error: true,
        status: 'not completed',
        meetingLink: null,
        reason: 'Query parameter not found',
      });
    }
    const delete_status = await deleteZoomMeeting(
      meeting_id as string,
      zoom_admin_data.token,
    );
    // delete from the database
    const { error } = await supabaseAdmin
      .from('scheduled_meetings')
      .delete()
      .eq('meeting_id', meeting_id.toString());
    if (error) {
      return res.status(500).json({
        error: true,
        status: 'not completed',
        meetingLink: null,
        reason: 'Supabase error',
      });
    }
    return res.status(200).json({
      error: false,
      status: 'deleted',
      meetingLink: null,
    });
  } else if (req.method === 'PATCH') {
    const serializedBody = JSON.parse(req.body);

    const { start_time, meeting_title, meeting_description }: IBody =
      serializedBody;
    const { meeting_id } = req.query;
    if (!meeting_id || !data.user.email) {
      return res.status(400).json({
        error: true,
        status: 'not completed',
        meetingLink: null,
        reason: 'Query parameter not found',
      });
    }
    const alternative_hosts = ['']; // admin email
    const alternative_hosts_string = alternative_hosts.join(';');
    const updation_status = await UpdateZoomMeeting(
      start_time,
      meeting_title,
      meeting_description,
      meeting_id as string,
      zoom_admin_data.token,
      '', // TODO: change to admin-email
      alternative_hosts_string,
    );
    const { error } = await supabaseAdmin
      .from('scheduled_meetings')
      .update({ start_time: start_time, meeting_title, meeting_description })
      .eq('meeting_id', meeting_id);
    if (error) {
      return res.status(500).json({
        error: true,
        status: 'not completed',
        meetingLink: null,
        reason: 'supabase error: scheduled_meetings',
      });
    }
    return res.status(200).json({
      error: false,
      status: 'completed',
      meetingLink: null,
    });
  }
}
