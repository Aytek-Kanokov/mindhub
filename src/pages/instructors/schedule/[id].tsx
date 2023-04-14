import { type GetServerSideProps } from 'next';
import React, { useEffect, useState } from 'react';
import { getInstructorByEmail } from '@/graphql/queries';
import Layout from '@/components/layout';
import { z } from 'zod';
import Image from 'next/image';
import Divider from '@/assets/signup/line.svg';
import { DatePicker } from '@mantine/dates';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getLocalTimeZone } from '@internationalized/date';
import clsx from 'clsx';
import { useSession } from '@supabase/auth-helpers-react';
import { supabaseAdmin } from '@/utils/supabase-instance';

type Schedule = Date[];

const InstructorSchedule: Schedule = [];
const UserSchedule: Schedule = [];

async function getScheduleOfInstructor(instructorEmail: string) {
  const instructorSchedule = await supabaseAdmin
    .from('scheduled_meetings')
    .select('start_time')
    .eq('user_email', instructorEmail);

  // format to UTC string
  const InstructorsSchedule = instructorSchedule.data?.map(({ start_time }) => {
    return new Date(start_time).toUTCString();
  });

  return InstructorsSchedule;
}

function CheckTime(schedule: string[], meeting_time: string) {
  const StartTimeForMeeting = new Date(meeting_time).toUTCString();

  // Check if the time is available
  if (schedule?.includes(StartTimeForMeeting)) {
    return false;
  }

  return true;
}

function addMeeting(meeting: Date, schedule: Schedule) {
  const index = schedule.findIndex((date) => date === meeting);
  if (index === -1) {
    schedule.push(meeting);
  }
}

const day = new Date();
day.setHours(15, 0, 0, 0);

addMeeting(day, InstructorSchedule);
addMeeting(day, UserSchedule);

function checkDayForMeetings(
  date: Date,
  instructorSchedule: Schedule,
  userSchedule: Schedule,
): boolean[] {
  const meetingsPerHour: boolean[] = [];

  // Set the date to the beginning of the day
  date.setHours(0, 0, 0, 0);

  // Iterate through each hour of the day
  for (let i = 0; i < 24; i++) {
    date.setHours(i);

    // Check if there are meetings scheduled for both the instructor and user at this hour
    const instructorMeeting = instructorSchedule.find(
      (meeting) => meeting.getTime() === date.getTime(),
    );
    const userMeeting = userSchedule.find(
      (meeting) => meeting.getTime() === date.getTime(),
    );

    if (instructorMeeting && userMeeting) {
      meetingsPerHour.push(!true);
    } else {
      meetingsPerHour.push(!false);
    }
  }

  return meetingsPerHour;
}

function Calendar({
  userMeetings,
  instructorMeetings,
  instructorEmail,
}: {
  userMeetings: Schedule;
  instructorMeetings: Schedule;
  instructorEmail: string;
}) {
  const client = useState(false);
  useEffect(() => {
    client[1](true);
  }, []);

  const session = useSession();

  const today = new Date();
  const hours = today.getHours();
  today.setHours(hours + 1, 0, 0, 0);
  const [value, setValue] = useState<Date | null>(today);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);

  const max = new Date();
  max.setFullYear(max.getFullYear() + 1);

  if (!client[0]) {
    return null;
  }

  const client_timezone = getLocalTimeZone();
  let client_time;
  if (client_timezone === 'America/New_York') {
    client_time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    client_time = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className='flex flex-col items-start justify-center h-full p-6 gap-[1px] font-raleway'>
      <div className='self-start mb-[37px]'>Select date & time</div>
      <div className='flex flex-row items-center justify-between w-full'>
        <div className='flex flex-col justify-between h-full'>
          <DatePicker
            value={value}
            onChange={setValue}
            minDate={today}
            maxDate={max}
            defaultDate={today}
            maxLevel='month'
            hideOutsideDates
          />
          <p className='flex flex-row items-center gap-4'>
            <svg
              width='20'
              height='20'
              viewBox='0 0 20 20'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M9.90116 0.679688C4.83436 0.679688 0.720184 4.79508 0.720184 9.86188C0.720184 14.9286 4.8344 19.0439 9.90104 19.0439C14.9677 19.0439 19.0832 14.9286 19.0832 9.86188C19.0832 4.79508 14.9678 0.679688 9.90116 0.679688ZM14.3701 2.68531C16.7625 4.17711 18.3533 6.83141 18.3533 9.86188C18.3533 10.5315 18.2754 11.1831 18.1287 11.8076L16.7908 11.1021L17.6501 13.2456C17.2808 14.0912 16.7766 14.8641 16.1658 15.5381L14.4799 14.3296L11.9555 16.1937L9.54706 16.4659L9.00386 14.8338L7.06167 15.8824L4.40179 15.1427L4.75948 16.5721C3.64972 15.7208 2.75831 14.6008 2.18136 13.3079L3.17382 11.8931L4.43358 12.562L6.74686 12.1763L6.85792 10.5783L5.39917 10.5112L5.59077 9.81418L6.79312 8.82539L5.81292 8.21504L8.4387 6.7075L6.66741 5.54902L4.06487 7.11883L2.13374 6.52195C2.67327 5.26648 3.50913 4.16961 4.55194 3.31633L4.40546 5.04973L6.09983 3.71676L8.91233 4.58473L8.03343 3.51414L9.10155 2.95141L10.1489 4.06344L12.9224 4.44801L12.7857 3.10152L14.4055 3.59594L14.3701 2.68531H14.3701ZM14.4152 7.37398L10.8594 7.79156L11.9885 9.47977L12.1118 11.998L13.2519 12.5388L13.6987 11.4304L16.1462 13.3311L15.4601 11.4841L15.7105 9.5957L14.0015 8.7082L14.4153 7.37402L14.4152 7.37398ZM8.6328 7.51688L7.39866 8.34453L8.82327 8.92188L9.47507 8.34453L8.6328 7.51684V7.51688ZM9.49952 13.1688L10.2295 15.2232L11.0021 13.5605L9.49952 13.1688Z'
                fill='#94A0B4'
              />
            </svg>
            <span>
              {client_timezone} - ({client_time})
            </span>
          </p>
        </div>

        <div>
          <p>{value?.toDateString()}</p>
          <div>
            {value && (
              <ul
                className='py-4 overflow-y-scroll w-52 max-h-80'
                id='fancylist'
              >
                {checkDayForMeetings(
                  new Date(value),
                  instructorMeetings,
                  userMeetings,
                ).map((item, index) => {
                  const day = new Date(value);
                  day.setHours(index);
                  return (
                    <div key={index}>
                      <button
                        onClick={() => {
                          setSelectedTimeSlot((prev) =>
                            prev === index ? null : index,
                          );
                        }}
                        disabled={!item}
                        className={clsx(
                          selectedTimeSlot === index && 'bg-blue-600',
                        )}
                      >
                        {day.toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        : {item ? 'Available' : 'Not available'}
                      </button>
                      {selectedTimeSlot === index && item && (
                        <button
                          onClick={() => {
                            try {
                              const base = window.origin;
                              const APIURI = new URL(`${base}/api/meetings`);

                              const start_time = new Date(
                                value.getFullYear(),
                                value.getMonth(),
                                value.getDate(),
                                index,
                              ).toISOString();

                              console.log(start_time);

                              fetch(APIURI.href, {
                                method: 'POST',
                                body: JSON.stringify({
                                  attendee_emails: [session?.user.email],
                                  start_time: start_time,
                                  meeting_title: 'test',
                                  meeting_description: 'testing description',
                                  adminEmail: instructorEmail,
                                }),
                              })
                                .then((response) => response.json())
                                .then((data) => {
                                  if (data.error === true) {
                                    toast.error(data.reason);
                                    return;
                                  }
                                });
                            } catch (error) {
                              toast.error('ho');
                            }
                          }}
                        >
                          Confirm
                        </button>
                      )}
                    </div>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Instructors = ({
  data,
  schedule,
}: {
  data: z.infer<typeof schema>;
  schedule: string[];
}): JSX.Element => {
  console.log(data, schedule);

  return (
    <Layout title={data.name} name={'instructor'} subTitle={data.email}>
      <div className='md:px-[50px] px-[20px] w-full h-auto py-4 flex mt-[70px] justify-between flex-wrap'>
        <div className='flex flex-col gap-[24px]'>
          <Image
            src={data.picture.url}
            alt='Something went wrong'
            height={127}
            width={127}
            className='rounded-full object-cover w-[127px] h-[127px]'
          />
          <div className='flex flex-col items-start gap-3'>
            <h2 className='text-xl font-medium'>{data.name}</h2>
            <p className='font-semibold text-[28px]'>Demo call</p>
            <div className='flex flex-row items-center gap-3 text-[#94A0B4] font-medium text-lg'>
              <svg
                width='20'
                height='20'
                viewBox='0 0 20 20'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M10 0C15.53 0 20 4.48 20 10C20 15.53 15.53 20 10 20C4.48 20 0 15.53 0 10C0 4.48 4.48 0 10 0ZM9.65 4.93C9.24 4.93 8.9 5.26 8.9 5.68V10.73C8.9 10.99 9.04 11.23 9.27 11.37L13.19 13.71C13.31 13.78 13.44 13.82 13.58 13.82C13.83 13.82 14.08 13.69 14.22 13.45C14.43 13.1 14.32 12.64 13.96 12.42L10.4 10.3V5.68C10.4 5.26 10.06 4.93 9.65 4.93Z'
                  fill='#94A0B4'
                />
              </svg>
              <p>60 min</p>
            </div>
          </div>
          <Image
            src={Divider}
            alt='divider'
            aria-label='divider'
            className='py-4'
          />
          <div>
            <p className='text-[#94A0B4] text-[14px] font-medium max-w-sm'>
              Lorem ipsum dolor sit amet consectetur. Fames eget scelerisque vel
              lacus vitae libero elementum. Tellus fusce pellentesque magnis
              ante nibh viverra ac semper.
            </p>
          </div>
        </div>
        <div className='border-[1px] border-gray-300 w-[611px] h-[420px] rounded-xl bg-[#FEFFF9]'>
          <Calendar
            instructorMeetings={InstructorSchedule}
            userMeetings={UserSchedule}
            instructorEmail={data.email}
          />
        </div>
      </div>
    </Layout>
  );
};

const schema = z.object({
  __typename: z.string(),
  sys: z.object({
    __typename: z.string(),
    id: z.string(),
  }),
  name: z.string(),
  email: z.string(),
  picture: z.object({
    __typename: z.string(),
    url: z.string(),
  }),
});

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const instructorId = ctx.query['id'];
  try {
    z.string().parse(instructorId);
  } catch (error) {
    return {
      redirect: {
        destination: '/instructors',
        permanent: false,
      },
    };
  }

  const content = await getInstructorByEmail(instructorId as string);

  const instructor = content.data.instructorCollection.items[0] as z.infer<
    typeof schema
  >;
  const schedule = await getScheduleOfInstructor(instructor.email);

  try {
    schema.parse(instructor);
  } catch (error) {
    return {
      redirect: {
        destination: '/instructors',
        permanent: false,
      },
    };
  }

  return {
    props: {
      data: instructor,
      schedule: schedule,
    },
  };
};

export default Instructors;
