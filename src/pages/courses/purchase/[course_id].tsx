import { NextPage, GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { getCourseById, getCourseCollections } from "@/graphql/queries";
import { ICourse, ICourses, ICourseProps, ILesson } from "@/global";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Comments from "@/components/comments";
import LessonsWeb from "@/components/lessons/web";
import LessonsMobile from "@/components/lessons/mobile";
import { supabase } from "@/utils/supabase-instance";
import { SupabaseHelper } from "@/utils/supabaseHelper";
import Layout from "@/components/layout";
import { SearchForm } from "@/components/courses/SearchForm";
import { useState, useEffect, BlockquoteHTMLAttributes } from "react";
import axios from "axios";

const PurchaseCourse = (props: any) => {
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    const redirectToStripe = async () => {
      const { data } = await axios.post("/api/stripe/checkout", {
        course_id: props.course_id,
      });
      window.location.href = data.session_url;
      console.log(data);
    };
    if (loading === false) {
      setLoading(true);
      redirectToStripe();
    }
  }, []);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const User = await SupabaseHelper.getUserSessionFromContext(context);
  const course_id = context.query?.course_id;
  if (!User) {
    console.log("Not logged in");
    return {
      redirect: {
        permanent: false,
        destination: "/signin",
      },
    };
  }

  return {
    props: {
      course_id: course_id,
    },
  };
};

export default PurchaseCourse;
