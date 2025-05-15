"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from '@/services/api';

// Email validation function
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [formStep, setFormStep] = useState(1); // Track form step
  
  // Form States
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpToken, setOtpToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    if (formStep === 1) {
      // Validate the email and send reset request
      if (!emailOrPhone || !validateEmail(emailOrPhone)) {
        setError("Please enter a valid email address");
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Call the forgot password API
        const response = await api.post('/auth/forgot-password', {
          email: emailOrPhone
        });
        
        setIsLoading(false);
        
        if (response.data.success) {
          setSuccessMessage("Verification code sent successfully.");
          setFormStep(2);
        } else {
          setError(response.data.message || 'Failed to send password reset request');
        }
      } catch (error: any) {
        setIsLoading(false);
        setError(error.response?.data?.message || "Failed to send reset request. Please try again.");
      }
    } else if (formStep === 2) {
      // Validate OTP
      if (otp.some(digit => !digit)) {
        setError("Please enter the complete verification code");
        return;
      }
      
      // Verify OTP before proceeding to the password reset step
      setIsLoading(true);
      
      try {
        // Get the OTP as a string
        const otpValue = otp.join('');
        
        // Call API to verify OTP before proceeding
        const response = await api.post('/auth/verify-otp', {
          email: emailOrPhone,
          otp: otpValue
        });
        
        setIsLoading(false);
        
        if (response.data.success) {
          // Store the verified OTP
          setOtpToken(otpValue);
          // Move to password reset step
          setFormStep(3);
        } else {
          setError(response.data.message || 'Invalid verification code');
        }
      } catch (error: any) {
        setIsLoading(false);
        setError(error.response?.data?.message || "Failed to verify code. Please check and try again.");
      }
    }
  };

  const handlePrevStep = () => {
    setError("");
    setSuccessMessage("");
    if (formStep > 1) {
      setFormStep(formStep - 1);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus to next input field if current field is filled
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get the OTP as a string
      const otpValue = otp.join('');
      
      // Call the verify-otp-reset-password API
      const response = await api.post('/auth/verify-otp-reset-password', {
        email: emailOrPhone,
        otp: otpValue,
        password: newPassword
      });
      
      setIsLoading(false);
      
      if (response.data.success) {
        setSuccessMessage("Your password has been reset successfully!");
        // Redirect to login page after short delay
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (error: any) {
      setIsLoading(false);
      setError(error.response?.data?.message || "Failed to reset password. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccessMessage("");
    
    if (!emailOrPhone || !validateEmail(emailOrPhone)) {
      setError("Invalid email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the forgot password API again to resend OTP
      const response = await api.post('/auth/forgot-password', {
        email: emailOrPhone
      });
      
      setIsLoading(false);
      
      if (response.data.success) {
        setSuccessMessage("A new verification code has been sent to your email address.");
        // Reset OTP input fields
        setOtp(["", "", "", ""]);
      } else {
        setError(response.data.message || 'Failed to resend verification code');
      }
    } catch (error: any) {
      setIsLoading(false);
      setError(error.response?.data?.message || "Failed to resend verification code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F1215] flex items-center justify-center font-poppins py-16">
      <div className="w-full max-w-[1400px] h-auto lg:h-[750px] mx-4 lg:mx-auto flex flex-col lg:flex-row shadow-2xl overflow-hidden rounded-xl">
        {/* Left Section - Purple background with message - 40% width */}
        <div className="w-full lg:w-2/5 bg-[#683BAB] text-white p-10 lg:p-[60px] flex flex-col justify-between relative overflow-hidden">
          <div className="max-w-md">
            <h1 className="text-4xl lg:text-5xl font-normal -tracking-[0.05em] mb-6">Recover Your Account Access</h1>
            <p className="text-lg opacity-80 mb-10">
              We're here to help you recover your account. Follow the steps to reset your password and regain access.
            </p>
          </div>
          
          <div className="max-w-md">
            {/* Rating stars */}
            <div className="flex mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-7 h-7 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            
            <p className="text-base mb-10">
              "This platform gives me complete control over my music career. The analytics and royalty tracking are exactly what independent artists need."
            </p>
            
            {/* Testimonial */}
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-full bg-purple-800 mr-4 overflow-hidden">
                <img src="/james.png" alt="James Hetfield" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-semibold">James Hetfield</p>
                <p className="text-sm opacity-80">Lead Vocal, Metallica</p>
              </div>
            </div>
          </div>
          
          {/* Top left curved decoration - 50% opacity */}
          <div className="absolute top-0 left-0 opacity-50 w-48 h-48 -translate-x-28 -translate-y-28">
            <div className="w-full h-full border-4 border-white rounded-full"></div>
          </div>
          
          {/* Bottom right curved decoration - white stroke */}
          <div className="absolute bottom-0 right-0 w-96 h-96 translate-x-48 translate-y-58">
            <div className="w-full h-full border-4 border-white rounded-full"></div>
          </div>
        </div>
        
        {/* Right Section - Reset Password Form - 60% width */}
        <div className="w-full lg:w-3/5 bg-[#161A1F] flex flex-col lg:p-[60px] p-10">
          {/* Fixed title and description */}
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-semibold mb-3 text-white">
              Forgot Password
            </h2>
            <p className="text-gray-400 text-sm">
              Follow the steps below to reset your password
            </p>
          </div>
          
          {/* Scrollable form container */}
          <div className="flex-1 overflow-y-auto pr-4 h-[430px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
            {error && (
              <div className="text-red-500 px-4 py-3 mb-6">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="text-green-500 px-4 py-3 mb-6">
                {successMessage}
              </div>
            )}
            
            {formStep === 1 ? (
              /* Step 1: Email/Phone Input Form */
              <form onSubmit={handleNextStep} className="space-y-6 max-w-md">
                <h3 className="text-xl font-medium text-white mb-4">Enter Email or Phone</h3>
                
                <div>
                  <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-300 mb-3">
                    Email or Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div className="absolute left-[45px] top-[16px] bottom-[16px] w-[1px] bg-gray-700"></div>
                    <input
                      type="text"
                      id="emailOrPhone"
                      className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter your email or phone number"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center h-[56px] px-6 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
                  >
                    Back to Login
                  </Link>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center h-[56px] px-10 rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : "Next"}
                  </button>
                </div>
              </form>
            ) : formStep === 2 ? (
              /* Step 2: OTP Verification Form */
              <form onSubmit={handleNextStep} className="space-y-6 max-w-md">
                <h3 className="text-xl font-medium text-white mb-4">Enter Verification Code</h3>
                
                <p className="text-gray-400 text-sm mb-2">
                  We've sent a 4-digit verification code to {emailOrPhone}. Please enter the code below.
                </p>
                
                <p className="text-yellow-500 text-xs mb-6">
                  Not seeing it? Be sure to check your spam or junk folder.
                </p>
                
                <div>
                  <div className="flex space-x-3 justify-center">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        className="w-[60px] h-[60px] text-center text-white text-xl bg-gray-800 shadow-sm border border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        value={otp[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        required
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm text-center mt-4">
                  Didn't receive a code? <button 
                    type="button" 
                    className="text-purple-500 hover:text-purple-400"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                  >
                    Resend
                  </button>
                </p>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="w-1/2 flex justify-center h-[56px] items-center rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 flex justify-center h-[56px] items-center rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </div>
                    ) : "Next"}
                  </button>
                </div>
              </form>
            ) : (
              /* Step 3: New Password Form */
              <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                <h3 className="text-xl font-medium text-white mb-4">Reset Your Password</h3>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-3">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute left-[45px] top-[16px] bottom-[16px] w-[1px] bg-gray-700"></div>
                    <input
                      type="password"
                      id="newPassword"
                      className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-3">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute left-[45px] top-[16px] bottom-[16px] w-[1px] bg-gray-700"></div>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="w-1/2 flex justify-center h-[56px] items-center rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 flex justify-center h-[56px] items-center rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {/* Login link at the bottom */}
          <div className="mt-6 text-left">
            <p className="text-gray-400 text-sm">
              Remember your password?{" "}
              <Link href="/auth/login" className="font-medium text-purple-500 hover:text-purple-400">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 