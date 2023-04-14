// Images
import EyeImage from '@/assets/signup/eye.svg';
import Brand from '@/assets/brand.svg';
import Divider from '@/assets/signup/line.svg';
import Mask from '@/assets/signup/mask.svg';
import BackgroundBlob from '@/assets/signup/background-blob.svg';
import Dots from '@/assets/signup/dots.svg';

// Deps
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { z } from 'zod';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

// Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const passwordVerifier = z.string().min(16, {
  message: 'Must be 16 or more characters',
});

export default function UpdatePassword() {
  // Form password
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Confirm password
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  // Supabase
  const supabase = useSupabaseClient();

  // Router
  const router = useRouter();

  // Toastify
  const notifyOfError = (error: string) => toast.error(error);

  const [hasAttemptedToSubmit, setHasAttemptedToSubmit] = useState(false);

  const validatePassword = useCallback(() => {
    try {
      passwordVerifier.parse(password.replaceAll(' ', ''));
      setPasswordError('');
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((issue) => {
          setPasswordError(issue.message);
        });
        return false;
      }
    }
    return true;
  }, [password]);

  const validateConfirmPassword = useCallback(() => {
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  }, [confirmPassword, password]);

  useEffect(() => {
    validatePassword();
    validateConfirmPassword();
  }, [password, confirmPassword, validatePassword, validateConfirmPassword]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.target.name) {
      case 'password':
        setPassword(e.target.value);
        break;
      case 'confirmPassword':
        setConfirmPassword(e.target.value);
        break;
      default:
        break;
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasAttemptedToSubmit(true);

    // To get "Remember me" checkbox value:
    // const Form = new FormData(e.currentTarget);
    // const checked = Form.get('checked') ?? false;

    if (!validatePassword() || !validateConfirmPassword()) return;

    const { data: userData, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      notifyOfError(error.message);
      return;
    }

    toast.success('Password updated successfully!');
    router.push('/');
  };

  return (
    <>
      <ToastContainer />
      <div className='flex-row lg:flex'>
        <div className='flex flex-col items-center justify-center py-4 bg-background-main font-raleway lg:px-8 lg:grow lg:h-screen'>
          <div
            className='flex flex-col items-start w-full max-w-md gap-6 px-4'
            aria-label='welcome message'
          >
            <Image src={Brand} alt='brand identity' />
            <div className='flex flex-col gap-[14px]'>
              <h1 className='font-bold text-[32px] leading-[38px]'>
                Update your password!
              </h1>
              <p className='font-medium text-gray-700 text-base leading-[19px]'>
                You can now update your password to a new one, make sure to make
                it strong and secure!
              </p>
            </div>
          </div>
          <Image
            src={Divider}
            alt='divider'
            aria-label='divider'
            className='my-8 opacity-50'
          />
          <form
            onSubmit={onSubmit}
            className='flex flex-col items-start w-full max-w-md gap-4 px-4'
            aria-label='login form'
          >
            <label className='flex flex-col w-full max-w-md' htmlFor='password'>
              <div className='flex flex-row items-center justify-between h-[18px]'>
                <span className='font-semibold text-[14px] leading-4'>
                  Password
                </span>
                {hasAttemptedToSubmit && passwordError && (
                  <span className='text-[12px] font-normal text-red-400'>
                    {passwordError}
                  </span>
                )}
              </div>
              <div className='flex flex-row border-[#DCE1EA] border-[1px] rounded-md p-4'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  id='password'
                  className='w-full text-gray-500 grow bg-background-main placeholder:text-gray-500'
                  placeholder='Password'
                  value={password}
                  onChange={onChange}
                />
                <Image
                  src={EyeImage}
                  alt='email svg'
                  onClick={() => setShowPassword(!showPassword)}
                  className='cursor-pointer'
                  aria-label={showPassword ? 'hide password' : 'show password'}
                />
              </div>
            </label>
            <label
              className='flex flex-col w-full max-w-md'
              htmlFor='confirmPassword'
            >
              <div className='flex flex-row items-center justify-between h-[18px]'>
                <span className='font-semibold text-[14px] leading-4'>
                  Password
                </span>
                {hasAttemptedToSubmit && confirmPasswordError && (
                  <span className='text-[12px] font-normal text-red-400'>
                    {confirmPasswordError}
                  </span>
                )}
              </div>
              <div className='flex flex-row border-[#DCE1EA] border-[1px] rounded-md p-4'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='confirmPassword'
                  id='confirmPassword'
                  className='w-full text-gray-500 grow bg-background-main placeholder:text-gray-500'
                  placeholder='Confirm password'
                  value={confirmPassword}
                  onChange={onChange}
                />
                <Image
                  src={EyeImage}
                  alt='email svg'
                  onClick={() => setShowPassword(!showPassword)}
                  className='cursor-pointer'
                  aria-label={showPassword ? 'hide password' : 'show password'}
                />
              </div>
            </label>
            <Image
              src={Divider}
              alt='divider'
              aria-label='divider'
              className='my-8 opacity-5'
            />

            <button className='px-[14px] py-[16px] bg-green-dark w-full text-white rounded-md font-semibold text-base'>
              Change password
            </button>
          </form>
          <Image src={Divider} alt='divider' aria-label='divider' />
        </div>
        <div
          aria-label='illustrations'
          className='relative hidden w-full max-w-2xl xl:max-w-4xl 2xl:max-w-5xl bg-green-dark lg:flex'
        >
          <Image
            src={Mask}
            alt='Mask'
            className='absolute top-0 left-0 z-[1]'
          />
          <Image
            src={Mask}
            alt='Mask'
            className='absolute bottom-0 right-0 rotate-180 z-[1]'
          />
          <Image
            src={BackgroundBlob}
            alt='Background blob'
            className='absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 z-[1]'
          />
          <div className='absolute z-10 flex flex-col items-center justify-center text-white -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2'>
            <div aria-label='2 images' className='relative w-full h-[500px]'>
              <Image
                src={'/images/woman-chewing-pencil.jpg'}
                width={270}
                height={270}
                className='absolute top-[170px] left-0 z-20 shadow-signin-outline'
                alt='Woman chewing pencil'
              />
              <Image
                src={'/images/kid-doing-scratch.jpg'}
                width={270}
                height={270}
                className='absolute top-0 right-0 z-20 shadow-signin-outline'
                alt='Kid doing scratch'
              />
            </div>
            <div
              aria-label='content'
              className='flex flex-col items-center justify-center gap-4'
            >
              <h2 className='font-bold text-[26px] leading-[31px]'>
                Keep Record of Everything
              </h2>
              <p className='font-medium leading-[19px] text-base'>
                Lorem ipsum dolor sit amet consectetur. Lectus at enim tempus et
                felis a.
              </p>
              <Image src={Dots} alt='Dots...' />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
