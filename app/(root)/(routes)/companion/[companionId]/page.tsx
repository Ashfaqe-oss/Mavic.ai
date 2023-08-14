import Heading from "@/components/heading"
import { auth, redirectToSignIn } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { redirect } from "next/navigation";
import { CompanionForm } from "./components/component-form";

interface CompProps {
  params: {
    companionId: string;
  }
}

const CompanionPage = async ({
  params
}: CompProps) => {
  const {userId} = auth();

  if(!userId) {
    return redirectToSignIn()
  }

  const validSubscription = await checkSubscription();

  if(!validSubscription) {
      // return redirect("/");
  }

  const companion = await prismadb.companion.findUnique({
    where: {
      id: params.companionId,
      userId,
    }
  })

  const categories = await prismadb.category.findMany();
  
  return (
    <div>
    <Heading title="Create AI Companion" desc="Always there for you.." imgUrl="/pro.png" />
    <CompanionForm initialData={companion} categories={categories} />
  </div>
  )
}

export default CompanionPage