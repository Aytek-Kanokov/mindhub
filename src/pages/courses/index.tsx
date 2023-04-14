import { useState } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { ICourse, ICourses } from '@/global';
import { getCourseCollections } from '@/graphql/queries';
import Course from '@/components/courses/Course';
import { SearchForm } from '@/components/courses/SearchForm';
import { UserComponent } from '@/components/common/UserComponent';
import { supabase } from '@/utils/supabase-instance';
import { SupabaseHelper } from "@/utils/supabaseHelper";
import { PageHeading } from '@/components/common/PageHeading';
import { FilterTagItem } from '@/components/common/FilterTagItem';
import Layout from '@/components/layout';
import axios from 'axios';

const filterTags = ['All', 'Popular', 'Computer Science', 'Networking', 'Design & Graphics', 'Engineering', 'Marketing'];

const calcCommentsCount = (comments: any, id: string) => {
  const res: any = [];
  comments.forEach((comment: any)=> {
    if (comment.lesson_id === id) res.push(comment)
  })
  return res.length;
}

const Courses: NextPage<ICourses> = ({ allCourses, purchasedCourseIds, comments }): JSX.Element => {
  const [searchVal, setSearchVal] = useState<string>('');
  const [filter, setFilter] = useState<string>('');
  const [tagActive, setTagActive] = useState<string>('All');
  
  const handleFilter = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setFilter(searchVal);
  };

  const filteredCollection = allCourses?.filter((item: ICourse) => {
    return item.title.toLowerCase().includes(filter.toLowerCase());
  });

  const onPurchase = async () => {
    const {  } = await axios.post("/api/stripe/", {})
  }

  
  return (
    <Layout title='Explore Courses' name="explore">
      <div className='px-6 md:px-[50px]'>
        {/* <div className='flex flex-col justify-between mt-2 sm:flex-row'>
          <div className='flex justify-end flex-col items-start'>
            <PageHeading title="Explore Courses" desc="March 15, Tuesday" />
          </div>
          <UserComponent email='jhondoe@gmail.com' />
        </div> */}
        <div className='mt-5 sm:max-w-[280px] ml-auto'>
          <SearchForm
            handleSubmit={handleFilter}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
          />
        </div>
        <div className='grid grid-cols-1 gap-x-11 gap-y-5 md:gap-y-[36px] mt-8 md:mt-[36px] bg-white sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'>
          {filteredCollection?.map((item: ICourse) => {
            const commentsCnt = calcCommentsCount(comments, item.sys.id)
            return (
              <Course
                key={item.sys.id}
                title={item.title}
                price={item.price}
                previewVideo={item.previewVideo}
                previewVideoLengthMins={item.previewVideoLengthMins}
                description={item.description}
                lessonsCollection={item.lessonsCollection}
                instructor={item.instructor}
                sys={item.sys}
                commentsCnt={commentsCnt}
              />
            )
          })}
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const content = await getCourseCollections();

  const User = await SupabaseHelper.getUserSessionFromContext(context);
  if(!User) {
    console.log("Not logged in")
    return {
      redirect: {
        permanent: false,
        destination: "/signin",
      }
    }
  }

  const purchasedCourses = await supabase.from('purchased_courses').select('*').eq('user_id', User.id);
  let purchasedCourseIds: any = [];
  purchasedCourses?.data?.forEach((item: any) => {
    purchasedCourseIds.push(item.course_id)
  })

  const {data} = await supabase.from("comments").select("*");
  return {
    props: {
      allCourses: content.data.courseCollection.items,
      purchasedCourseIds: purchasedCourseIds,
      comments: data
    },
  };
};

export default Courses;
