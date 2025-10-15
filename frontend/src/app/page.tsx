import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="collapse bg-base-100 border border-base-300">
          <input type="radio" name="my-accordion-1" defaultChecked />
          <div className="collapse-title font-semibold">How do I create an account?</div>
          <div className="collapse-content text-sm">Click the "Sign Up" button in the top right corner and follow the registration process.</div>
        </div>
        <div className="collapse bg-base-100 border border-base-300">
          <input type="radio" name="my-accordion-1" />
          <div className="collapse-title font-semibold">I forgot my password. What should I do?</div>
          <div className="collapse-content text-sm">Click on "Forgot Password" on the login page and follow the instructions sent to your email.</div>
        </div>
        <div className="collapse bg-base-100 border border-base-300">
          <input type="radio" name="my-accordion-1" />
          <div className="collapse-title font-semibold">How do I update my profile information?</div>
          <div className="collapse-content text-sm">Go to "My Account" settings and select "Edit Profile" to make changes.</div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        
      </footer>
    </div>
  );
}
