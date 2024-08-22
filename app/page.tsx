import { SummaryForm } from "@/components/Form";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12 lg:p-24 bg-[#0a192f]">
    {/* <div className="w-full max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] mx-auto"> */}
        <SummaryForm />
    {/* </div> */}
</main>

  );
}
