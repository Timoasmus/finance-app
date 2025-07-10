import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { useState } from "react";
import Loader from "../Loader";

const schema = yup.object().shape({
  username: yup
    .string()
    .matches(/^[a-zA-Z0-9._]{3,30}$/, "*Invalid username")
    .required("*Username is required"),
  email: yup
    .string()
    .email("*Invalid email-address")
    .required("*Email is required"),
  password: yup
    .string()
    .min(8, "*Password should be at least 8 characters long")
    .matches(/[A-Z]/, "*Use at least 1 uppercase character")
    .matches(/[a-z]/, "*Use at least 1 lowercase character")
    .matches(/[0-9]/, "*Use at least 1 number")
    .matches(/[!@#$%^&*]/, "*Use at least 1 special character")
    .required("*Password is required"),
  dob: yup.date().required("*Date of birth is required"),
});

function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const navigate = useNavigate();

  const onSubmit = (data) => {
    setIsLoading(true);
    api
      .post("/auth/create", {
        username: data.username,
        email: data.email,
        password: data.password,
        dob: data.dob,
      })
      .then((res) => {
        alert(res.data.message);
        navigate("/login");
      })
      .catch((err) => alert(err.response.data.detail))
      .finally(() => setIsLoading(false));
  };
  return (
    <div className="min-h-[100vh] flex justify-center items-center flex-col bg-gray-200">
      <div className="mt-12 rounded-3xl overflow-y-auto flex flex-col items-center bg-gray-400/40 shadow-xl lg:w-[30vw] w-[60vw] h-[60vh] py-2">
        <h1 className="text-3xl text-black/60 font-bold tracking-widest">
          FINANCE TRACKER
        </h1>
        <h2 className="text-3xl text-black/60 font-thin tracking-wider">
          Sign Up
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex  flex-col space-y-1.5 h-full w-full px-15 pt-5"
        >
          <div className="flex flex-col space-y-0.5">
            <label className="font-thin text-xl text-white" htmlFor="username">
              Username
            </label>
            <input
              className="bg-white py-1.5 rounded-md"
              id="username"
              type="text"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-sm text-red-400">{errors.username.message}</p>
            )}
          </div>

          <div className="flex flex-col space-y-0.5">
            <label className="font-thin text-xl text-white" htmlFor="email">
              Email
            </label>
            <input
              className="bg-white py-1.5 rounded-md"
              id="email"
              type="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col space-y-0.5">
            <label className="font-thin text-xl text-white" htmlFor="password">
              Password
            </label>
            <div className="relative flex w-full ">
              <input
                className="bg-white py-1.5 rounded-md w-full"
                id="password"
                type={showPwd ? "text" : "password"}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute text-gray-500 self-center right-3 text-xl hover:text-gray-400"
              >
                {showPwd ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col space-y-0.5">
            <label className="font-thin text-xl text-white" htmlFor="dob">
              Date of birth
            </label>
            <input
              className="bg-white py-1.5 rounded-md"
              id="dob"
              type="date"
              {...register("dob")}
            />
            {errors.dob && (
              <p className="text-sm text-red-400">Fill in a valid date</p>
            )}
          </div>

          {isLoading ? (
            <Loader />
          ) : (
            <button
              className="self-center bg-green-500/40 text-2xl px-10 rounded-2xl border-2 mt-5 border-white/60 text-white shadow-lg py-2 hover:cursor-pointer hover:bg-green-400/40 hover:-translate-y-0.5 transition-all duration-150"
              type="submit"
            >
              Sign Up
            </button>
          )}
        </form>
      </div>
      <p className="font-thin text-black text-lg mt-5">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="hover:cursor-pointer hover:underline"
        >
          Log In
        </span>
      </p>
    </div>
  );
}

export default SignupPage;
