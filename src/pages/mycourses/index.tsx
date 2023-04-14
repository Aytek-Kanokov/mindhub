import { NextPage, GetServerSideProps } from 'next';
import Link from 'next/link';
import React from 'react';
import { ICourse, ICourses } from '@/global';
import { getCourseCollections } from '@/graphql/queries';
import Course from '@/components/courses/Course';
import { supabase } from '@/utils/supabase-instance';
import { SupabaseHelper } from '@/utils/supabaseHelper';
import Layout from '@/components/layout';

const MyCourses: NextPage<ICourses> = ({
  allCourses,
  purchasedCourseIds,
}): JSX.Element => {
  return (
    <Layout title='My Courses' name="course-lesson">
      <div className='p-8 px-[50px] min-h-screen bg-background-light'>
        {/* <div className='flex justify-end'>
          <UserComponent email='jhondoe@gmail.com' />
        </div> */}
        <div className='flex flex-row items-end justify-between'>
          {/* <Heading /> */}
          <Link
            href='/courses'
            className='bg-black-light px-3.5 py-3 text-white rounded'
          >
            Explore courses
          </Link>
        </div>
        <div className='grid grid-cols-4 gap-3.5 mt-7 bg-white'>
          {allCourses?.map((item: ICourse) => {
            const isPurchased = purchasedCourseIds.includes(
              item.sys.id as never,
              0
            );

            if (isPurchased) {
              return (
                <React.Fragment key={item.sys.id}>
                  <Course
                    title={item.title}
                    price={item.price}
                    description={item.description}
                    lessonsCollection={item.lessonsCollection}
                    instructor={item.instructor}
                    sys={item.sys}
                    isPurchased={isPurchased}
                    previewVideo={item.previewVideo}
                    previewVideoLengthMins={item.previewVideoLengthMins}
                  />
                </React.Fragment>
              );
            }
          })}
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const content = await getCourseCollections();
  const User = await SupabaseHelper.getUserSessionFromContext(context);
  if (!User)
    return {
      props: {
        redirect: {
          permanent: false,
          destination: '/signin',
        },
      },
    };

  const purchasedCourses = await supabase
    .from('purchased_courses')
    .select('*')
    .eq('user_id', User.id);
  let purchasedCourseIds: any = [];
  purchasedCourses?.data?.forEach((item: any) => {
    purchasedCourseIds.push(item.course_id);
  });
  return {
    props: {
      allCourses: content.data.courseCollection.items,
      purchasedCourseIds: purchasedCourseIds,
    },
  };
};

export default MyCourses;
