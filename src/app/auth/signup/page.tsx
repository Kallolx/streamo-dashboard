"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { register } from '@/services/authService';
import { validateInvitation } from "@/services/invitationService";
import Image from "next/image";
import { useLogo } from '@/contexts/LogoContext';

// Country data with cities
const countryData: Record<string, { name: string; cities: string[] }> = {
  // Asian countries prioritized
  "bd": { name: "Bangladesh", cities: ["Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet", "Barisal", "Rangpur"] },
  "in": { name: "India", cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur"] },
  "np": { name: "Nepal", cities: ["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Biratnagar", "Birgunj", "Dharan"] },
  "mm": { name: "Myanmar", cities: ["Yangon", "Mandalay", "Naypyidaw", "Bago", "Mawlamyine", "Taunggyi", "Sittwe"] },
  "pk": { name: "Pakistan", cities: ["Karachi", "Lahore", "Islamabad", "Faisalabad", "Rawalpindi", "Multan", "Peshawar"] },
  "lk": { name: "Sri Lanka", cities: ["Colombo", "Kandy", "Galle", "Jaffna", "Negombo", "Batticaloa", "Trincomalee"] },
  "vn": { name: "Vietnam", cities: ["Hanoi", "Ho Chi Minh City", "Da Nang", "Hue", "Nha Trang", "Hai Phong"] },
  "th": { name: "Thailand", cities: ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Krabi", "Koh Samui"] },
  "my": { name: "Malaysia", cities: ["Kuala Lumpur", "Penang", "Johor Bahru", "Ipoh", "Melaka", "Kota Kinabalu"] },
  "id": { name: "Indonesia", cities: ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar"] },
  "ph": { name: "Philippines", cities: ["Manila", "Quezon City", "Davao", "Cebu", "Makati", "Baguio"] },
  "sg": { name: "Singapore", cities: ["Singapore City", "Jurong", "Woodlands", "Tampines", "Pasir Ris"] },
  "jp": { name: "Japan", cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", "Sapporo", "Fukuoka"] },
  "kr": { name: "South Korea", cities: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon"] },
  "cn": { name: "China", cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou", "Xi'an"] },
  "kh": { name: "Cambodia", cities: ["Phnom Penh", "Siem Reap", "Battambang", "Sihanoukville", "Kampot", "Kep"] },
  "la": { name: "Laos", cities: ["Vientiane", "Luang Prabang", "Pakse", "Savannakhet", "Thakhek"] },
  "bt": { name: "Bhutan", cities: ["Thimphu", "Paro", "Punakha", "Phuentsholing", "Jakar"] },
  "mv": { name: "Maldives", cities: ["Malé", "Addu City", "Fuvahmulah", "Kulhudhuffushi", "Thinadhoo"] },
  
  // Rest of the world
  "us": { name: "United States", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "San Francisco", "Seattle"] },
  "uk": { name: "United Kingdom", cities: ["London", "Manchester", "Birmingham", "Liverpool", "Glasgow", "Edinburgh"] },
  "ca": { name: "Canada", cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton"] },
  "au": { name: "Australia", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast"] },
  "nz": { name: "New Zealand", cities: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Dunedin"] },
  "de": { name: "Germany", cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart"] },
  "fr": { name: "France", cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Bordeaux"] },
  "it": { name: "Italy", cities: ["Rome", "Milan", "Naples", "Turin", "Florence", "Venice"] },
  "es": { name: "Spain", cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Malaga", "Bilbao"] },
  "br": { name: "Brazil", cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza"] },
  "mx": { name: "Mexico", cities: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana"] },
  "ar": { name: "Argentina", cities: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "Tucumán"] },
  "za": { name: "South Africa", cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth"] },
  "ng": { name: "Nigeria", cities: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt"] },
  "eg": { name: "Egypt", cities: ["Cairo", "Alexandria", "Giza", "Shubra El-Kheima", "Port Said"] },
  "ke": { name: "Kenya", cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"] },
  "af": { name: "Afghanistan", cities: ["Kabul", "Herat", "Mazar-i-Sharif", "Kandahar", "Jalalabad"] },
  "al": { name: "Albania", cities: ["Tirana", "Durrës", "Vlorë", "Elbasan", "Shkodër"] },
  "dz": { name: "Algeria", cities: ["Algiers", "Oran", "Constantine", "Annaba", "Blida"] }
};

// Client component with all the existing functionality
function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formStep, setFormStep] = useState(1); // Track form step
  
  // Add registration success state
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Invitation/referral related states
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [isValidatingReferral, setIsValidatingReferral] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  
  // Basic Info Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [introduction, setIntroduction] = useState("");
  
  // Address Form State
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  // Add state for available cities based on selected country
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  // Current Distributor Form State
  const [currentDistributor, setCurrentDistributor] = useState("");
  const [distributorNumber, setDistributorNumber] = useState("");
  
  // Social Profile Form State
  const [youtubeLink, setYoutubeLink] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [tiktokLink, setTiktokLink] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  
  // Verification Form State
  const [documentType, setDocumentType] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [documentPicture, setDocumentPicture] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const { logo } = useLogo();

  // Check for referral code in URL 
  useEffect(() => {
    if (searchParams) {
      const code = searchParams.get('referral');
      if (code) {
        setReferralCode(code);
        validateReferralCode(code);
      }
    }
  }, [searchParams]);
  
  // Validate referral code
  const validateReferralCode = async (code: string) => {
    try {
      setIsValidatingReferral(true);
      const result = await validateInvitation(code);
      if (result && result.inviter) {
        setInviterName(result.inviter.name);
        setReferralError(null);
      }
    } catch (error: any) {
      console.error('Error validating referral code:', error);
      setReferralError(error.response?.data?.message || 'Invalid referral code');
    } finally {
      setIsValidatingReferral(false);
    }
  };

  // Update available cities when country changes
  useEffect(() => {
    if (country && countryData[country]) {
      setAvailableCities(countryData[country].cities);
      // Reset city when country changes
      setCity("");
    } else {
      setAvailableCities([]);
    }
  }, [country]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add validation for city when on step 2
    if (formStep === 2 && country && !city) {
      // If country is selected but city is not, show an alert
      alert("Please select a city");
      return;
    }
    
    if (formStep < 5) {
      setFormStep(formStep + 1); // Move to the next step
    }
  };

  const handlePrevStep = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1); // Go back to the previous step
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create user data object with all text fields only
      const userData = {
        // Basic Info
        name: fullName,
        email,
        password,
        birthDate,
        gender,
        introduction,
        
        // Address - use the country name and city name, not the code
        country: country ? countryData[country].name : '',
        city,
        phone,
        address,
        
        // Distributor
        currentDistributor,
        distributorNumber,
        
        // Social Profiles
        youtubeLink,
        facebookLink,
        tiktokLink,
        instagramLink,
        
        // Documents - only the text data
        documentType,
        documentId,
        
        // Add referral code if present
        referralCode: referralCode || undefined,
        
        // Default role will be 'artist'
      };
      
      // Call the register function with text data only
      const response = await register(userData);
      
      if (response.success) {
        // Registration successful, show success message instead of redirecting
        setRegistrationSuccess(true);
        setIsLoading(false);
      } else {
        // Handle error (you may want to display an error message)
        console.error("Registration failed:", response.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);
    }
  };

  // Format date input as mm/dd/yyyy
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Remove any non-digit characters
    const digits = input.replace(/\D/g, '');
    
    // Format as mm/dd/yyyy
    let formattedDate = '';
    if (digits.length <= 2) {
      formattedDate = digits;
    } else if (digits.length <= 4) {
      formattedDate = `${digits.substring(0, 2)}/${digits.substring(2)}`;
    } else {
      formattedDate = `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4, 8)}`;
    }
    
    setBirthDate(formattedDate);
  };

  // If registration is successful, show the success message
  if (registrationSuccess) {
    return (
      <div className="min-h-screen w-full bg-[#0F1215] flex items-center justify-center font-poppins py-16">
        <div className="w-full max-w-[1400px] mx-4 lg:mx-auto bg-[#161A1F] rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-[#683BAB] p-10 flex justify-center">
            <Image 
              src={logo.includes('amazonaws.com') ? '/logo.png' : logo} 
              alt="Logo" 
              width={180} 
              height={70} 
              className="w-[180px]"
              onError={(e) => {
                // Fallback to local logo on error
                e.currentTarget.src = '/logo.png';
              }}
            />
          </div>
          
          <div className="p-10 lg:p-[60px] text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-600/20 flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-green-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-6">Registration Successful!</h2>
            
            <div className="bg-amber-600/10 border border-amber-600/20 rounded-md p-6 mb-8 mx-auto max-w-2xl">
              <p className="text-amber-400 text-base">
                Your account has been created successfully but is pending approval from an administrator. You'll be able to log in once your account is approved.
              </p>
            </div>
            
            <p className="text-gray-400 mb-10 mx-auto max-w-2xl">
              We'll notify you via email once your account has been approved. This usually takes less than 24 hours.
            </p>
            
            <button 
              onClick={() => router.push('/auth/login')}
              className="w-full max-w-md mx-auto flex justify-center h-[56px] items-center rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              Go to Login Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0F1215] flex items-center justify-center font-poppins py-16">
      <div className="w-full max-w-[1400px] h-auto lg:h-[750px] mx-4 lg:mx-auto flex flex-col lg:flex-row shadow-2xl overflow-hidden rounded-xl">
        {/* Left Section - Purple background with message - 40% width - Hidden on mobile */}
        <div className="hidden lg:flex w-full lg:w-2/5 bg-[#683BAB] text-white p-10 lg:p-[60px] flex-col justify-between relative overflow-hidden">
          {/* Logo at the top left */}
          <div className="flex justify-start">
            <Image 
              src={logo.includes('amazonaws.com') ? '/logo.png' : logo} 
              alt="Logo" 
              width={180} 
              height={70} 
              className="w-[180px]"
              onError={(e) => {
                // Fallback to local logo on error
                e.currentTarget.src = '/logo.png';
              }}
            />
          </div>
          
          <div className="max-w-md">
            <h1 className="text-4xl lg:text-5xl font-normal -tracking-[0.05em] mb-6">Join our Music <br /> Distribution & Marketing Platform</h1>
            <p className="text-lg opacity-80 mb-10">
              Create, distribute, and manage your music with powerful tools designed for independent artists.
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
        
        {/* Right Section - Signup Form - 60% width */}
        <div className="w-full lg:w-3/5 bg-[#161A1F] flex flex-col lg:p-[60px] p-10">
          {/* Fixed title and description */}
          <div className="mb-8">
            {/* Logo only visible on mobile */}
            <div className="flex justify-center mb-6 lg:hidden">
              <Image 
                src={logo.includes('amazonaws.com') ? '/logo.png' : logo} 
                alt="Logo" 
                width={180} 
                height={70} 
                className="w-[180px]"
                onError={(e) => {
                  // Fallback to local logo on error
                  e.currentTarget.src = '/logo.png';
                }}
              />
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-semibold mb-3 text-white">
              Join Promise Distribution
            </h2>
            <p className="text-gray-400 text-sm">
              Create your account and unlock a world of music distribution opportunities
            </p>
          </div>
          
          {/* Add referral info if present */}
          {referralCode && (
            <div className={`mb-6 p-4 rounded-lg ${
              referralError 
                ? 'bg-red-900/20 border border-red-700' 
                : 'bg-purple-900/20 border border-purple-700'
            }`}>
              {isValidatingReferral ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-purple-500 rounded-full"></div>
                  <p className="text-gray-300">Validating referral code...</p>
                </div>
              ) : referralError ? (
                <p className="text-red-400 text-sm">{referralError}</p>
              ) : inviterName ? (
                <p className="text-purple-400 text-sm">
                  You have been invited by <span className="font-medium">{inviterName}</span> to join as an artist.
                </p>
              ) : null}
            </div>
          )}
          
          {/* Scrollable form container - increased height to match forget-password page */}
          <div className="flex-1 overflow-y-auto pr-4 h-[430px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
            {formStep === 1 ? (
              /* Step 1: Basic Info Form */
              <form onSubmit={handleNextStep} className="space-y-6 max-w-md">
                <h3 className="text-xl font-medium text-white mb-4">Basic Info</h3>
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-3">
                    Full name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute left-[45px] top-[16px] bottom-[16px] w-[1px] bg-gray-700"></div>
                    <input
                      type="text"
                      id="fullName"
                      className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter Your Full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-3">
                    Email address
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
                      type="email"
                      id="email"
                      className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-3">
                    Password
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
                      id="password"
                      className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter Your Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-300 mb-3">
                    Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute left-[45px] top-[16px] bottom-[16px] w-[1px] bg-gray-700"></div>
                    <input
                      type="text"
                      id="birthDate"
                      className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="mm/dd/yyyy"
                      value={birthDate}
                      onChange={handleBirthDateChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Choose Gender
                  </label>
                  <div className="flex space-x-5">
                    <div className="flex items-center">
                      <input
                        id="gender-male"
                        name="gender"
                        type="radio"
                        value="male"
                        checked={gender === "male"}
                        onChange={() => setGender("male")}
                        className="h-5 w-5 text-purple-600 border-gray-700 bg-gray-800 focus:ring-purple-500"
                      />
                      <label htmlFor="gender-male" className="ml-3 text-sm text-gray-300">
                        Male
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="gender-female"
                        name="gender"
                        type="radio"
                        value="female"
                        checked={gender === "female"}
                        onChange={() => setGender("female")}
                        className="h-5 w-5 text-purple-600 border-gray-700 bg-gray-800 focus:ring-purple-500"
                      />
                      <label htmlFor="gender-female" className="ml-3 text-sm text-gray-300">
                        Female
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="gender-other"
                        name="gender"
                        type="radio"
                        value="other"
                        checked={gender === "other"}
                        onChange={() => setGender("other")}
                        className="h-5 w-5 text-purple-600 border-gray-700 bg-gray-800 focus:ring-purple-500"
                      />
                      <label htmlFor="gender-other" className="ml-3 text-sm text-gray-300">
                        Others
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="introduction" className="block text-sm font-medium text-gray-300 mb-3">
                    Introduction
                  </label>
                  <textarea
                    id="introduction"
                    rows={4}
                    className="pl-4 py-3 block w-full text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Type Your Bio"
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full flex justify-center h-[56px] items-center rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 mt-8 transition-colors"
                >
                  Next
                </button>
              </form>
            ) : formStep === 2 ? (
              /* Step 2: Address Form */
              <form onSubmit={handleNextStep} className="space-y-6 max-w-md">
                <h3 className="text-xl font-medium text-white mb-4">Address</h3>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-3">
                    Country
                  </label>
                  <div className="relative">
                    <select
                      id="country"
                      className="pl-4 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500 appearance-none pr-10"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select your country</option>
                      {/* Map over our expanded country list */}
                      {Object.entries(countryData).map(([code, data]) => (
                        <option key={code} value={code}>
                          {data.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-3">
                    City
                  </label>
                  <div className="relative">
                    <select
                      id="city"
                      className="pl-4 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500 appearance-none pr-10"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      disabled={!country} // Disable until country is selected
                    >
                      <option value="" disabled>
                        {country ? "Select your city" : "Please select a country first"}
                      </option>
                      {/* Map over cities based on selected country */}
                      {availableCities.map((cityName) => (
                        <option key={cityName} value={cityName}>
                          {cityName}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-3">
                    Phone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div className="absolute left-[45px] top-[16px] bottom-[16px] w-[1px] bg-gray-700"></div>
                    <input
                      type="tel"
                      id="phone"
                      className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Type your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-3">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute left-[45px] top-[16px] bottom-[16px] w-[1px] bg-gray-700"></div>
                    <input
                      type="text"
                      id="address"
                      className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Type Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
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
                  >
                    Next
                  </button>
                </div>
              </form>
            ) : formStep === 3 ? (
              /* Step 3: Current Distributor Form */
              <form onSubmit={handleNextStep} className="space-y-6 max-w-md">
                <h3 className="text-xl font-medium text-white mb-4">Current Distributor</h3>
                
                <div>
                  <label htmlFor="currentDistributor" className="block text-sm font-medium text-gray-300 mb-3">
                    Current Distributor
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute left-[45px] top-[16px] bottom-[16px] w-[1px] bg-gray-700"></div>
                    <input
                      type="text"
                      id="currentDistributor"
                      className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Type Current Distributor"
                      value={currentDistributor}
                      onChange={(e) => setCurrentDistributor(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="distributorNumber" className="block text-sm font-medium text-gray-300 mb-3">
                    Number of Distributor
                  </label>
                  <div className="relative">
                    <select
                      id="distributorNumber"
                      className="pl-4 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500 appearance-none pr-10"
                      value={distributorNumber}
                      onChange={(e) => setDistributorNumber(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select number of distributor</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5+</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
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
                  >
                    Next
                  </button>
                </div>
              </form>
            ) : formStep === 4 ? (
              /* Step 4: Social Profile Form */
              <form onSubmit={handleNextStep} className="space-y-6 max-w-md">
                <h3 className="text-xl font-medium text-white mb-4">Social Profile Links</h3>
                
                <div>
                  <label htmlFor="youtubeLink" className="block text-sm font-medium text-gray-300 mb-3">
                    Youtube Channel Link
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute left-[45px] top-[16px] bottom-[16px] w-[1px] bg-gray-700"></div>
                    <input
                      type="url"
                      id="youtubeLink"
                      className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter YouTube channel link"
                      value={youtubeLink}
                      onChange={(e) => setYoutubeLink(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="facebookLink" className="block text-sm font-medium text-gray-300 mb-3">
                    Facebook Link
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute left-[45px] top-[16px] bottom-[16px] w-[1px] bg-gray-700"></div>
                    <input
                      type="url"
                      id="facebookLink"
                      className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter Facebook profile link"
                      value={facebookLink}
                      onChange={(e) => setFacebookLink(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="tiktokLink" className="block text-sm font-medium text-gray-300 mb-3">
                    TikTok Link
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute left-[45px] top-[16px] bottom-[16px] w-[1px] bg-gray-700"></div>
                    <input
                      type="url"
                      id="tiktokLink"
                      className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter TikTok profile link"
                      value={tiktokLink}
                      onChange={(e) => setTiktokLink(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="instagramLink" className="block text-sm font-medium text-gray-300 mb-3">
                    Instagram Link
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute left-[45px] top-[16px] bottom-[16px] w-[1px] bg-gray-700"></div>
                    <input
                      type="url"
                      id="instagramLink"
                      className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter Instagram profile link"
                      value={instagramLink}
                      onChange={(e) => setInstagramLink(e.target.value)}
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
                  >
                    Next
                  </button>
                </div>
              </form>
            ) : (
              /* Step 5: Verification Form */
              <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                <h3 className="text-xl font-medium text-white mb-4">Verification</h3>
                
                <div>
                  <label htmlFor="documentType" className="block text-sm font-medium text-gray-300 mb-3">
                    Document Type
                  </label>
                  <div className="relative">
                    <select
                      id="documentType"
                      className="pl-4 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500 appearance-none pr-10"
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select document type</option>
                      <option value="nid">NID</option>
                      <option value="passport">Passport</option>
                      <option value="license">Driver's License</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="documentId" className="block text-sm font-medium text-gray-300 mb-3">
                    Document ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2a1 1 0 011-1h8a1 1 0 011 1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute left-[45px] top-[16px] bottom-[16px] w-[1px] bg-gray-700"></div>
                    <input
                      type="text"
                      id="documentId"
                      className="pl-14 block w-full h-[56px] text-white bg-gray-800 shadow-sm border placeholder:text-gray-500 placeholder:text-sm border-gray-700 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter Document ID"
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-300 mb-3">
                      Profile Picture
                    </label>
                    <div className="relative h-[120px] w-[120px] ml-0 border-2 border-dashed border-gray-700 rounded-md bg-gray-800 flex flex-col items-center justify-center">
                      <svg className="h-8 w-8 text-gray-500 mb-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <p className="text-gray-400 text-xs mb-1">Choose File</p>
                      <input
                        type="file"
                        id="profilePicture"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const file = e.target.files[0];
                            setProfilePicture(file);
                            
                            // Create preview URL
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfilePreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        required
                      />
                      {profilePreview && (
                        <div className="absolute inset-0 w-full h-full">
                          <img
                            src={profilePreview}
                            alt="Profile Preview"
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="documentPicture" className="block text-sm font-medium text-gray-300 mb-3">
                      Document Picture
                    </label>
                    <div className="relative h-[120px] w-[120px] ml-0 border-2 border-dashed border-gray-700 rounded-md bg-gray-800 flex flex-col items-center justify-center">
                      <svg className="h-8 w-8 text-gray-500 mb-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <p className="text-gray-400 text-xs mb-1">Choose File</p>
                      <input
                        type="file"
                        id="documentPicture"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const file = e.target.files[0];
                            setDocumentPicture(file);
                            
                            // Create preview URL
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setDocumentPreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        required
                      />
                      {documentPreview && (
                        <div className="absolute inset-0 w-full h-full">
                          <img
                            src={documentPreview}
                            alt="Document Preview"
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
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
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
            
          {/* Step indicators - just above login link - left aligned */}
          <div className="flex items-center justify-start mt-6 space-x-3">
            {[1, 2, 3, 4, 5].map((step) => (
              <div 
                key={step}
                className={`h-2.5 w-2.5 rounded-full transition-colors 
                  ${step === formStep ? 'bg-purple-500' : 
                    step < formStep ? 'bg-green-500' : 'bg-gray-600'}`}
              ></div>
            ))}
          </div>
            
          {/* Login link at the bottom */}
          <div className="mt-2 text-left">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
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

// Main component with Suspense boundary
export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#0F1215] flex items-center justify-center font-poppins">
        <div className="p-8 text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
} 
