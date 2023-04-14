import Layout from '@/components/layout';
import { SupabaseHelper } from '@/utils/supabaseHelper';
import { useSession } from '@supabase/auth-helpers-react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from "next/router"

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const User = await SupabaseHelper.getUserSessionFromContext(context);
  if (!User) {
    console.log('Not logged in');
    return {
      redirect: {
        permanent: false,
        destination: '/signin',
      },
    };
  } else {
    return {
      redirect: {
        permanent: false,
        destination: '/courses'
      }
    }
  }
};

export default function Home() {
  return (
    <Layout title='Home' name="home">
      <div className='md:px-[40px] px-[20px] py-8'>
        <h1>This is a Homepage.</h1>
      </div>
    </Layout>
  );
}
