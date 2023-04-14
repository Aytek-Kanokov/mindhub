import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { getCourseById, getCourseCollections } from '@/graphql/queries';
import { ICourse, ICourseProps, ILesson } from '@/global';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { supabase } from '@/utils/supabase-instance';
import { SupabaseHelper } from '@/utils/supabaseHelper';
import Layout from '@/components/layout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { course_id } = context.params as any;
  const User = await SupabaseHelper.getUserSessionFromContext(context);
  if (!User) {
    console.log('Not logged in');
    return {
      redirect: {
        permanent: false,
        destination: '/signin',
      },
    };
  }

  const getPermission = await supabase
    .from('purchased_courses')
    .select(`*`)
    .eq('course_id', course_id)
    .eq('user_id', User.id);

  const courseById = await getCourseById(course_id);

  let whitelist = courseById.data.course.whitelist;
  let permission = (getPermission?.data?.length || whitelist?.includes(User.email)) ? true : false;

  // if (getPermission?.data?.length || whitelist?.includes(User.email)) {
    return {
      props: {
        course_id: course_id,
        course: courseById.data.course,
        permission: permission,
        lessonsInCourse: courseById.data.course.lessonsCollection.items,
      },
    };
  // } else {
  //   return {
  //     redirect: {
  //       permanent: false,
  //       destination: `/courses/purchase/${course_id}`,
  //     },
  //   };
  // }
};

const Course: NextPage<ICourseProps> = (props): JSX.Element => {
  const username: string = props.username;
  const course_id: string = props.course_id;
  const course: ICourse = props.course;
  const permission: boolean = props.permission;
  const lessonsInCourse: ILesson[] = props.lessonsInCourse;

  const [totalVideoLength, setTotalVideoLength] = useState<number>(0);

  useEffect(() => {
    let total = 0
    for (let i = 0; i < lessonsInCourse.length; i++) {
      total += lessonsInCourse[i].videoLengthMins;
    }
    setTotalVideoLength(total)
  }, [lessonsInCourse]);

  return (
    <Layout title="View Course" name="explore">
      <Head>
        <title>Course</title>
      </Head>

      <main className="container mt-3 md:mt-10 mx-auto">
        <div className='px-6 md:px-[50px] pb-[92px] md:pb-5'>
          <div className="md:flex md:flex-row-reverse">
            <div className="md:w-5/12">
              <div className="relative pt-[56.25%] md:pt-[100%]">
                <iframe
                  className="absolute top-0 right-0 w-full h-full rounded-md md:rounded-xl"
                  src={course?.previewVideo?.assets?.player}
                  allowFullScreen
                />
              </div>
            </div>
            <div className="md:w-7/12 md:mr-12">
              <p className="mt-8 md:mt-0 text-base md:text-[28px] font-semibold">{course.title}</p>
              <p className="mt-[11px] text-[#424D61] text-[12px] md:text-[14px] font-normal">
                {documentToReactComponents(course?.description.json)}
              </p>
              <div className="flex flex-wrap mt-[23px] md:mt-9">
                <div className="w-1/2">
                  <p className="text-[#5B667A] text-[12px] md:text-base font-semibold">Instructor:</p>
                  <div className="flex mt-[18px] items-center">
                    <Image src="/icons/user.png" width={24} height={24} alt="user" />
                    <span className="ml-[11px] text-[14px] md:text-base font-medium md:font-semibold">{course.instructor.name}</span>
                  </div>
                </div>
                <div className="w-1/2">
                  <p className="text-[#5B667A] text-[12px] md:text-base font-semibold">Lectures:</p>
                  <div className="flex mt-[18px] items-center">
                    <Image src="/icons/video.png" width={24} height={24} alt="user" />
                    <span className="ml-[11px] text-[14px] md:text-base font-medium md:font-semibold">{lessonsInCourse.length} Total Lectures</span>
                  </div>
                </div>
                <div className="w-full mt-4 md:mt-[27px]">
                  <p className="text-[#5B667A] text-[12px] md:text-base font-semibold">Total Duration:</p>
                  <div className="flex mt-[18px] items-center">
                    <Image src="/icons/timer.png" width={24} height={24} alt="user" />
                    <span className="ml-[11px] text-[14px] md:text-base font-medium md:font-semibold">{`${Math.floor(totalVideoLength / 60) > 0 ? `${Math.floor(totalVideoLength / 60)} Hrs ` : ` `}`}{totalVideoLength % 60} Mins</span>
                  </div>
                </div>
              </div>
                {
                  (permission || course.isPurchased) &&
                  <div className="hidden mt-9 md:flex justify-center">
                    <button className="w-[259px] py-[16px] rounded-md bg-[#DCB949]">
                      <span className="text-[20px] text-white font-semibold">View Course</span>
                    </button>
                  </div>
                }
                {
                  !(permission || course.isPurchased) &&
                  <div className="hidden mt-9 md:flex items-center">
                    <button className="w-[259px] py-[16px] rounded-md bg-[#DCB949]">
                      <span className="text-[20px] text-white font-semibold">Enroll Now</span>
                    </button>
                    <div className="grow">
                      <p className="font-semibold text-xl text-center">${course.price}</p>
                    </div>
                  </div>
                }
            </div>
          </div>

          <hr className="mt-[23px] md:mt-9 border-[#DCE1EA]" />

          <div>
            {/* Lessons */}
            <div>
              <p className="md:text-[28px] font-semibold mt-[23px] md:mt-9 mb-4 md:mb-[31px]">Lesson List</p>
              <div>
                {
                  lessonsInCourse.map((lesson, idx) => {
                    return (
                      <Link
                        key={idx}
                        href={`/courses/${course_id}/lessons/${lesson.sys.id}`}
                        className="flex items-start md:mb-[31px]"
                      >
                        <Image className="md:hidden block object-cover w-[49px] h-[49px] rounded-md" src={lesson.coverPicture.url + ""} width={49} height={49} alt="user" />
                        <Image className="hidden md:block object-cover w-[192px] h-[192px] rounded-md" src={lesson.coverPicture.url + ""} width={192} height={192} alt="user" />
                        <div className="ml-[11px] md:ml-5">
                          <p className="text-[#94A0B4] text-[12px] md:text-base font-semibold mb-[3px] md:mb-[7px]">Lesson {idx + 1}</p>
                          <p className="text-[14px] md:text-[20px] font-medium mb-2 md:mb-4">{lesson?.title}</p>
                          <p className="text-[#424D61] md:text-[12px] text-[12px] font-normal">
                            {documentToReactComponents(lesson?.description.json)}
                          </p>
                          <hr className="block md:hidden my-[14px] border-[#DCE1EA]" />
                        </div>
                      </Link>
                    )
                  })
                }
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden fixed bottom-0 w-full bg-white py-[22px] px-6 rounded-t-[20px] flex justify-between items-center shadow-[0px_-4px_8px_rgba(0,0,0,0.05)]">
          {
            (permission || course.isPurchased) &&
            <>
              <button className="w-[201px] mx-auto py-[14px] rounded-md bg-[#DCB949]">
                <span className="font-semibold text-white">View Course</span>
              </button>
            </>
          }
          {
            !(permission || course.isPurchased) &&
            <>
              <button className="w-[201px] py-[14px] rounded-md bg-[#DCB949]">
                <span className="font-semibold text-white">Enroll Now</span>
              </button>
              <div className="grow">
                <p className="font-semibold text-center">${course.price}</p>
              </div>
            </>
          }
        </div>
      </main>
    </Layout>
  );
};

export default Course;
