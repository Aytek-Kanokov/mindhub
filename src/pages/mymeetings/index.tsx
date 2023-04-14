/* eslint-disable @next/next/no-img-element */
import Layout from '@/components/layout';
import { getLocalTimeZone } from '@internationalized/date';
import debounce from 'lodash.debounce';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { DatePicker } from '@mantine/dates';
import { z } from 'zod';
import Image from 'next/image';
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

const FakeData = [
  {
    id: '1',
    title: 'Mock',
    description: 'Mockdate',
    event_date: (() => {
      const today = new Date();
      today.setHours(today.getHours(), 0, 0, 0);
      return today;
    })(),
    link: 'https://www.google.com',
    contestants: [
      {
        id: '1',
        name: 'John Wick',
        title: 'Senior Management',
        image:
          'https://images.unsplash.com/photo-1597113117918-eb40fe0b84e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      },
    ],
  },
  {
    id: '2',
    title: 'Mockingbird',
    description: 'Mockdate 2',
    event_date: (() => {
      const today = new Date();
      today.setHours(today.getHours() + 1, 0, 0, 0);
      today.setDate(today.getDate() + 2);
      return today;
    })(),
    link: 'https://www.google.com',
    contestants: [
      {
        id: '1',
        name: 'John Wick',
        title: 'Senior Management',
        image:
          'https://images.unsplash.com/photo-1597113117918-eb40fe0b84e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      },
    ],
  },
];

type Contestant = {
  id: string;
  name: string;
  title: string;
  image: string;
};

type Meeting = {
  id: string;
  meeting_id: string;
  meeting_title: string;
  meeting_description: string;
  start_time: Date;
  end_time: Date;
  zoom_link: string;
  contestants: Contestant[];
};

async function getMeetings(
  setter: Dispatch<SetStateAction<Meeting[]>>,
  email: string,
  origin?: string,
) {
  if (!window && !origin)
    throw new Error('No window object or origin provided');

  const URI = new URL(`${window.origin ?? origin}/api/meetings`);
  URI.searchParams.append('email', email);

  const response = await (await fetch(URI.href, { method: 'GET' })).json();

  const data = response.meetingsData.map((meeting: any) => ({
    ...meeting,
    start_time: new Date(meeting.start_time),
    end_time: new Date(meeting.end_time),
    updated_at: new Date(meeting.updated_at),
    inserted_at: new Date(meeting.inserted_at),
  }));

  if (response.status === 'completed') {
    setter(data);
    return;
  }

  if (response.status !== 'completed') {
    toast.error(response.reason);
    return;
  }

  toast.error('Something went wrong with the API: ' + response.reason);
}

async function removeMeeting(id: string, origin?: string) {
  if (!window && !origin)
    throw new Error('No window object or origin provided');

  const URI = new URL(`${window.origin ?? origin}/api/meetings`);
  URI.searchParams.append('meeting_id', id);
  const response = await (
    await fetch(URI.href, {
      method: 'DELETE',
    })
  ).json();

  if (response.status !== 'deleted') {
    toast.error(response.reason);
    return;
  }

  if (response.status === 'deleted') {
    toast.success('Meeting removed');
    return;
  }

  toast.error('Something went wrong');
}

async function PatchMeeting({
  meetingId,
  start_time,
  meeting_title,
  meeting_description,
  origin,
}: {
  meetingId: string;
  start_time: Date;
  meeting_title: string;
  meeting_description: string;
  origin?: string;
}) {
  if (!window && !origin)
    throw new Error('No window object or origin provided');

  const URI = new URL(`${window.origin ?? origin}/api/meetings`);
  URI.searchParams.append('meeting_id', meetingId);

  const FixedTime = new Date(start_time);
  FixedTime.setHours(FixedTime.getHours(), 0, 0, 0);

  const UTCVariant = start_time.toUTCString();

  const body = {
    start_time: UTCVariant,
    meeting_title,
    meeting_description,
  };

  const response = await (
    await fetch(URI.href, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  ).json();

  if (response.status !== 'completed') {
    toast.error(response.reason);
    return;
  }

  if (response.status === 'completed') {
    toast.success('Meeting updated');
    return;
  }

  toast.error('Something went wrong');
}

export default function Meetings() {
  const today = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  })();
  const [client, setClient] = useState(false);
  const session = useSession();

  // Remember to remove the fake data when the API is ready
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [editMeetingId, setEditMeetingId] = useState('');
  const [confirmRemovalMeetingId, setConfirmRemovalMeetingId] = useState('');

  const router = useRouter();
  // get

  const [newMeetingTime, setNewMeetingTime] = useState<Date | null>(today);
  const [newMeetingHour, setNewMeetingHour] = useState('');

  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState('');
  const changeHandler = (new_value: string) => setSearchText(new_value);
  const changeFilter = (new_value: string) => setFilter(new_value);
  const debouncedChangeHandler = useMemo(() => debounce(changeFilter, 300), []);

  useEffect(() => {
    debouncedChangeHandler(searchText);
  }, [debouncedChangeHandler, searchText]);

  useEffect(() => {
    setClient(true);
  }, []);

  // API Zoom integration not ready yet
  useEffect(() => {
    if (session?.user.email) getMeetings(setMeetings, session?.user?.email);
  }, [session?.user.email]);

  if (!client) {
    return null;
  }

  return (
    <Layout name={'video'} subTitle={''} title={'My Meetings'}>
      <div className='md:px-[40px] px-[20px] w-full h-auto py-4'>
        <label
          htmlFor='search-text'
          className='p-4 rounded-md border-[1px] border-[#DCE1EA] flex flex-row items-center max-w-xs'
        >
          <input
            type='text'
            placeholder='Search'
            className='grow'
            value={searchText}
            onChange={(event) => {
              changeHandler(event.target.value);
            }}
          />
          <svg
            width='20'
            height='20'
            viewBox='0 0 20 20'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M19.7555 18.6065L16.3182 15.2458L16.2376 15.1233C16.0878 14.9742 15.883 14.8902 15.6692 14.8902C15.4554 14.8902 15.2505 14.9742 15.1007 15.1233C12.1795 17.8033 7.67815 17.949 4.58201 15.4637C1.48586 12.9784 0.755668 8.63337 2.87568 5.31017C4.9957 1.98697 9.30807 0.716847 12.9528 2.34214C16.5976 3.96743 18.4438 7.98379 17.267 11.7276C17.1823 11.9981 17.2515 12.2922 17.4487 12.4992C17.6459 12.7062 17.9411 12.7946 18.223 12.7311C18.505 12.6676 18.7309 12.4619 18.8156 12.1914C20.2224 7.74864 18.0977 2.96755 13.8161 0.941058C9.53449 -1.08544 4.38084 0.250824 1.68905 4.08542C-1.00273 7.92001 -0.424821 13.1021 3.04893 16.2795C6.52268 19.4569 11.8498 19.6759 15.5841 16.7949L18.6277 19.7705C18.942 20.0765 19.4502 20.0765 19.7645 19.7705C20.0785 19.4602 20.0785 18.9606 19.7645 18.6503L19.7555 18.6065Z'
              fill='#94A0B4'
            />
          </svg>
        </label>
        <div className='flex flex-col mt-4'>
          <ul className='flex flex-col flex-wrap gap-4'>
            {JSON.stringify(meetings, null, 2)}
            {meetings
              .filter((meeting) =>
                meeting.meeting_title
                  .toLowerCase()
                  .includes(filter.toLowerCase()),
              )
              .map(
                ({
                  id,
                  meeting_id,
                  meeting_description,
                  start_time,
                  zoom_link,
                  meeting_title,
                  contestants,
                }) => {
                  const local_zone = getLocalTimeZone();

                  return (
                    <div
                      key={id + meeting_description}
                      className='border-2 border-gray-600 rounded-md'
                    >
                      <h2>Title: {meeting_title}</h2>

                      <button
                        onClick={() => {
                          setConfirmRemovalMeetingId(id);
                          setEditMeetingId('');
                        }}
                        className='px-4 py-2 mr-2 text-white bg-blue-500 rounded-md'
                      >
                        Delete Meeting
                      </button>
                      {confirmRemovalMeetingId === id && (
                        <div className='bg-rose-500'>
                          <p>Are you sure you want to delete this meeting?</p>
                          <button
                            className='text-blue-900'
                            onClick={() => setConfirmRemovalMeetingId('')}
                          >
                            Cancel
                          </button>
                          <button
                            className='text-red-900'
                            onClick={() => {
                              setConfirmRemovalMeetingId('');

                              // This is an optimistic update, basically just assuming that the API call will work and then updating the UI
                              setMeetings((previousMeetings) =>
                                previousMeetings.filter(
                                  (meeting) => meeting.id !== id,
                                ),
                              );

                              removeMeeting(meeting_id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setEditMeetingId(id);
                          setNewMeetingTime(start_time);
                          setConfirmRemovalMeetingId('');
                          const hours = start_time.getHours();

                          try {
                            setNewMeetingHour(hours.toString());
                          } catch (error) {}
                        }}
                        className='px-4 py-2 mr-2 text-white bg-blue-500 rounded-md'
                      >
                        Edit Meeting
                      </button>
                      {editMeetingId === id && (
                        <div className='bg-purple'>
                          <div className='flex flex-row flex-wrap'>
                            <DatePicker
                              minDate={today}
                              value={newMeetingTime}
                              onChange={setNewMeetingTime}
                            ></DatePicker>
                            <select
                              name=''
                              id=''
                              value={newMeetingHour}
                              onChange={(event) => {
                                setNewMeetingHour(event.target.value);
                              }}
                            >
                              {Array.from(Array(24)).map((_, i) => {
                                const hour = i < 10 ? `0${i}` : i;
                                return (
                                  <option id='' key={i}>
                                    {hour}
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          <button
                            onClick={() => setEditMeetingId('')}
                            className='px-4 py-2 mr-2 text-white bg-blue-500 rounded-md'
                          >
                            Cancel Edit
                          </button>
                          <button
                            className='px-4 py-2 mr-2 text-white bg-blue-500 rounded-md'
                            onClick={() => {
                              setEditMeetingId('');

                              const concatenatedTime = newMeetingTime;

                              const safeTime = z.string().parse(newMeetingHour);

                              concatenatedTime?.setHours(
                                parseInt(safeTime),
                                0,
                                0,
                                0,
                              );

                              const safeDate = z.date().parse(newMeetingTime);

                              PatchMeeting({
                                meetingId: meeting_id,
                                start_time: safeDate,
                                meeting_description: meeting_title,
                                meeting_title: meeting_description,
                              });
                            }}
                          >
                            Save Edit
                          </button>
                        </div>
                      )}
                      <hr />
                      <p>Description: {meeting_description}</p>
                      <p>
                        This meeting is happening:{' '}
                        {start_time.toLocaleTimeString()} in your local time{' '}
                        {local_zone}
                      </p>
                      <hr />
                      <button
                        onClick={() => {
                          window.open(zoom_link, '_blank');
                        }}
                        className='px-4 py-2 mr-2 text-white bg-blue-500 rounded-md'
                      >
                        Go to meeting
                      </button>
                    </div>
                  );
                },
              )}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
