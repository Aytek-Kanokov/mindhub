import Link from "next/link";
import Image from "next/image";

const Forbidden = () => {
  return (
    <div className="relative w-screen h-screen flex justify-center items-center">
      <Image className="absolute left-[58px] top-[47px]" src="/images/logo.png" width={184} height={49} alt="send" />
      <Image className="absolute right-0 top-0" src="/images/Spiral 2.png" width={259} height={312} alt="send" />
      <Image className="absolute left-0 bottom-0" src="/images/Spiral 3.png" width={91} height={86} alt="send" />
      <div className="flex flex-col items-center">
        <p className="text-[200px] font-bold leading-[235px] mb-[50px]">403</p>
        <p className="text-[28px] font-semibold leading-[33px] mb-[13px]">Course not purchased!</p>
        <p className="text-[14px] text-[#717E95] leading-[18px] mb-10">You haven&apos;t purchased this course</p>
        <Link href="/courses" className='w-[435px] rounded-md bg-green-dark text-white py-[14px] px-[16px] w-full text-center'>
          Go Back
        </Link>
      </div>
    </div>
  )
}

export default Forbidden