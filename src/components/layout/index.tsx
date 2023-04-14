import Sidebar, { type NavItem } from './sidebar';
import Header from './Header';
import { useState } from 'react';

const Layout = ({
  children,
  title,
  subTitle = "",
  name,
}: {
  children: React.ReactNode;
  title: String;
  subTitle?: String;
  name: String;
}) => {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className='md:flex md:flex-row w-screen md:h-screen'>
      <Sidebar title={title} name={name} showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <main className='md:flex md:flex-col md:grow md:h-full'>
        <Header title={title} subTitle={subTitle} setShowSidebar={setShowSidebar} />
        <div className='md:grow overflow-auto'>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
