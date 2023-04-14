import { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import Comments from '@/components/comments';
import LessonsWeb from '@/components/lessons/web';
import LessonsMobile from '@/components/lessons/mobile';
import { getCourseById, getLessonById, getLessonsInCourse } from '@/graphql/queries';
import { ILessonProps, ICourse, ILesson } from '@/global';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { supabase } from '@/utils/supabase-instance';
import { SupabaseHelper } from '@/utils/supabaseHelper';
import dynamic from 'next/dynamic';
import 'suneditor/dist/css/suneditor.min.css';
import Layout from '@/components/layout';
import { SearchForm } from '@/components/courses/SearchForm';

const NoteEditor = dynamic(() => import('../../../../components/notes/TextEditor'), {
  ssr: false,
});

export const getServerSideProps: GetServerSideProps = async (context: any) => {
  const { lesson_id, course_id } = context.params;
  const lessonById = await getLessonById(lesson_id);
  const lessonsInCourse = await getLessonsInCourse(course_id);
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

  const courseById = await getCourseById(course_id);
  let whitelist = courseById.data.course.whitelist;

  const getPermission = await supabase
    .from('purchased_courses')
    .select(`*`)
    .eq('course_id', course_id)
    .eq('user_id', User.id);

  if (getPermission?.data?.length || whitelist?.includes(User.email)) {
    return {
      props: {
        lesson_id: lesson_id,
        course_id: course_id,
        course: courseById.data.course,
        lesson: lessonById.data.lesson,
        lessonsInCourse: lessonsInCourse.data.course.lessonsCollection.items,
      },
    };
  } else {
    return {
      redirect: {
        permanent: false,
        destination: '/403',
      },
    };
  }
};

const Lesson: NextPage<ILessonProps> = (props): JSX.Element => {
  const lesson_id: string = props.lesson_id;
  const course_id: string = props.course_id;
  const username: string = props.username;
  const course: ICourse = props.course;
  const lesson: ILesson = props.lesson;
  const lessonsInCourse: ILesson[] = props.lessonsInCourse;

  const lessonNumber = lessonsInCourse.findIndex((el: any) => {
    return el.sys.id == lesson_id;
  });

  const [searchVal, setSearchVal] = useState<string>('');
  const [filter, setFilter] = useState<string>('');
  const [noteValue, setNoteValue] = useState<string>('');
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [commentOrLecture, setCommentOrLecture] = useState<boolean>(true);   //true: comments, false: lectures

  const onChangeComment = (count: number) => {
    setCommentsCount(count);
  };

  const handleFilter = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setFilter(searchVal);
  };

  const addNote = () => {
    notes.push(noteValue);
    setNoteValue('');
  };
  return (
    <Layout title="View Lesson" name="explore">
      <Head>
        <title>Lesson</title>
      </Head>

      <main className="container mt-3 md:mt-10 mx-auto px-6 md:px-[50px]">
        <div className="hidden md:block max-w-[280px] ml-auto">
          <SearchForm
            handleSubmit={handleFilter}
            searchVal={searchVal}
            setSearchVal={setSearchVal}
          />
        </div>
        <div className="mb-3 md:mb-5 flex items-start md:items-center">
          <h1 className="text-base md:text-xl font-bold leading-6 text-black">{lesson?.title}</h1>
          <div className='flex items-center shrink-0'>
            <div className="w-[6px] h-[6px] mx-3 rounded-full bg-[#D9D9D9]"></div>
            <span className="text-base md:text-xl font-semibold text-[#026A4F]">25% Completed</span>
          </div>
        </div>

        <div className="grid grid-cols-12 md:gap-8">
          <section className="col-span-12 md:col-span-8">
            {/* Lesson */}
            <div>
              <div className="relative pt-[56.25%]">
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={`https://embed.api.video/vod/${lesson.video.videoId}`}
                  allowFullScreen
                />
              </div>
              <div className="flex items-start justify-between gap-3.5 mt-[18px] md:mt-5 mb-5 md:mb-9 font-medium text-[14px] md:text-base text-[#94A0B4]">
                <div className="hidden md:flex items-center">
                  <Image src="/icons/msg.png" width={16} height={16} alt="send" />
                  <span className="ml-2 text-black-dark font-semibold">Comments</span>
                  <span className="ml-[14px]">{commentsCount}</span>
                </div>
                <span className="md:hidden block ml-2 text-black-dark font-semibold">{lesson.title}</span>
                <span className="shrink-0">
                  Lesson {lessonNumber + 1} of {lessonsInCourse.length}
                </span>
              </div>
            </div>
            
            <div className="flex md:hidden w-full py-3 px-4 mb-4 rounded-sm bg-[#F7F9FC]">
              <button className={`w-1/2 ${commentOrLecture ? 'bg-[#026A4F]' : 'bg-white'} py-2 px-4 rounded-sm`} onClick={() => setCommentOrLecture(true)}>
                <div className={`flex justify-between items-center text-${commentOrLecture ? 'white' : '[#BAC3D2]'} text-[14px]`}>
                  <Image src={`/icons/chat_${commentOrLecture ? 'white' : 'gray'}.png`} width={20} height={20} alt="comments" />
                  <span>Comments</span>
                  <span>{commentsCount}</span>
                </div>
              </button>
              <button className={`w-1/2 ${!commentOrLecture ? 'bg-[#026A4F]' : 'bg-white'} py-2 px-4 rounded-sm`} onClick={() => setCommentOrLecture(false)}>
                <div className={`flex justify-between items-center text-${!commentOrLecture ? 'white' : '[#BAC3D2]'} text-[14px]`}>
                  <Image src={`/icons/video_${!commentOrLecture ? 'white' : 'gray'}.png`} width={20} height={20} alt="comments" />
                  <span>Lectures</span>
                  <span>{lessonsInCourse.length}</span>
                </div>
              </button>
            </div>

            {/* Comments */}
            {
              commentOrLecture &&
              <div className="">
                <button
                  onClick={() => {
                    setShowNotes(!showNotes);
                  }}
                  className="bg-slate-400 p-2 shadow-lg rounded mb-5">
                  {showNotes ? 'Comments' : 'Notes'}
                </button>
                {showNotes ? (
                  <div className="bg-[#F7F9FC] p-3">
                    <NoteEditor />
                  </div>
                ) : (
                  <Comments id={lesson_id} onChangeComment={onChangeComment} username={username} />
                )}
                {/* <p className="mb-4">
                  {documentToReactComponents(lesson?.description.json)}
                </p> */}
              </div>
            }
            {
              !commentOrLecture &&
              <LessonsMobile id={course_id} lessonsInCourse={lessonsInCourse} filter={filter} lessonNumber={lessonNumber} />
            }

            <hr className="block md:hidden mt-5 border-[#DCE1EA]" />

            {/* Lesson Description */}
            <p className="mt-5 md:mt-9 text-base md:text-[18px] font-semibold">{lesson.title}</p>
            <p className="mt-[11px] text-[#424D61] text-[12px] md:text-[14px] font-normal">
              {documentToReactComponents(lesson?.description.json)}
            </p>

            <hr className="my-5 md:my-4 border-[#DCE1EA]" />

            <div className="flex mb-10">
              <div className="w-[54px] h-[54px]">
                <Image
                  className="w-full h-full rounded-full"
                  src={course.instructor.picture.url}
                  width={54}
                  height={54}
                  alt={'hero'}
                />
              </div>
              <div className="flex flex-col justify-center ml-[11px]">
                <p className="font-semibold">{course.instructor.name}</p>
                <p className="text-[#717E95] text-[12px] md:text-[14px]">{course.instructor.email}</p>
              </div>
            </div>
          </section>

          {/* Lessons */}
          <LessonsWeb id={course_id} lessonsInCourse={lessonsInCourse} filter={filter} lessonNumber={lessonNumber} />
        </div>
      </main>
    </Layout>
  );
};

export default Lesson;
