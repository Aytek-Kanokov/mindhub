// async function sendResetPasswordEmail() {
//   if (email.length < 10) {
//     setEmailError("Please fill the email");
//     return;
//   } else {
//     setLoading(true);
//     setEmailError(null);
//     const { error } = await supabase.auth.resetPasswordForEmail(email, {
//       redirectTo: "http://localhost:3000/auth/reset-password",
//     });
//     if (error) {
//       toast(error.message, {
//         position: "top-center",
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//         theme: "dark",
//       });
//     }
//     setLoading(false);
//   }
// }

// async function resetPassword() {
//     if (password.length < 8) {
//       setPasswordError("Password must be atleast 8 character long");
//     } else {
//       setLoading(true);
//       setPasswordError(null);
//       const { error } = await supabase.auth.updateUser({
//         password: password,
//       });
//       setLoading(false);
//       if (!error) {
//         router.push("/auth/login");
//       } else {
//         toast(error.message, {
//           position: "top-center",
//           autoClose: 5000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           progress: undefined,
//           theme: "dark",
//         });
//       }
//     }
//   }

// const resendConfirmationEmail = async (event: React.FormEvent) => {
//     event.preventDefault();
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//     });
//     if (error) {
//       toast("😄 please wait! Dont spam", {
//         position: "top-center",
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//         theme: "dark",
//       });
//     }
//   };

export const random = "0";
