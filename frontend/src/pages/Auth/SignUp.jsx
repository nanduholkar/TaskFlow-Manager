import React, { useContext, useState } from 'react'
import { useNavigate, Link } from "react-router-dom"

import AuthLayout from '../../components/layout/AuthLayout'
import Input from '../../components/Inputs/Input.jsx'
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector.jsx'

import { validateEmail } from "../../utils/helper.js"
import { API_PATHS } from "../../utils/apiPaths.js"
import axiosInstance from "../../utils/axiosInstance.js"
import { UserContext } from '../../context/UserContext.jsx'
import uploadImage from "../../utils/uploadImages.js"

const SignUp = () => {

  const [profilePic, setProfilePic] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [adminInviteToken, setAdminInviteToken] = useState("")

  const [error, setError] = useState(null)

  const { updateUser } = useContext(UserContext)

  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()

    // Validation
    if (!fullName) {
      setError("Please enter full name.")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setError(null)

    try {

      let profileImageUrl = ""

      // Upload Image
      if (profilePic) {
        const imgUploads = await uploadImage(profilePic)
        profileImageUrl = imgUploads.imageUrl || ""
      }

      // API Call
      const response = await axiosInstance.post(
        API_PATHS.AUTH.REGISTER,
        {
          name: fullName,
          email,
          password,
          adminInviteToken,
          profileImageUrl
        }
      )

      const { token, role } = response.data

      if (token) {

        localStorage.setItem("token", token)

        updateUser(response.data)

        if (role === "admin") {
          navigate("/admin/dashboard")
        } else {
          navigate("/user/dashboard")
        }
      }

    } catch (error) {

      if (error.response && error.response.data.message) {
        setError(error.response.data.message)
      } else {
        setError("Something went wrong. Please try again.")
      }
    }
  }

  return (
    <AuthLayout>

      <div className='lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center'>

        <h3 className='text-lg font-semibold text-black'>
          Create an Account
        </h3>

        <p className='text-xs text-slate-700 mt-[5px] mb-6'>
          Join us today by entering your details below
        </p>

        <form onSubmit={handleSignup}>

          <ProfilePhotoSelector
            image={profilePic}
            setImage={setProfilePic}
          />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

            <Input
              value={fullName}
              onChange={(value) => setFullName(value)}
              label='Full Name'
              placeholder='John Doe'
              type='text'
            />

            <Input
              value={email}
              onChange={(value) => setEmail(value)}
              label='Email Address'
              placeholder='john@example.com'
              type='email'
            />

            <Input
              value={password}
              onChange={(value) => setPassword(value)}
              label='Password'
              placeholder='Min 8 characters'
              type='password'
            />

            <Input
              value={adminInviteToken}
              onChange={(value) => setAdminInviteToken(value)}
              label='Admin Invite Token'
              placeholder='6 Digit Code'
              type='text'
            />

          </div>

          {error && (
            <p className='text-red-500 text-xs pb-2.5 mt-2'>
              {error}
            </p>
          )}

          <button type='submit' className='btn-primary'>
            SIGN UP
          </button>

          <p className='text-[13px] text-slate-800 mt-3'>

            Already have an account?{" "}

            <Link
              className="font-medium text-primary underline"
              to="/login"
            >
              Login
            </Link>

          </p>

        </form>

      </div>

    </AuthLayout>
  )
}

export default SignUp