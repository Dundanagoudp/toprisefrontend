import NewPassowrd from '@/components/user-auth/passward-reset/NewPassowrd'

import React from 'react'

function page() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
     <NewPassowrd/>
    </div>
    </div>
   
  )
}

export default page
