import { Categories } from "@/components/aicompanion/categories";
import { Companions } from "@/components/aicompanion/companions";
import Heading from "@/components/heading";
import { SearchInput } from "@/components/aicompanion/search-input";
import prismadb from "@/lib/prismadb";

interface CompanionsPageProps {
  searchParams: {
    categoryId: string;
    name: string;
  };
}

const RootPage = async ({ searchParams }: CompanionsPageProps) => {
  const categories = await prismadb.category.findMany();

  const data = await prismadb.companion.findMany({
    where: {
      categoryId: searchParams.categoryId,
      name: {
        search: searchParams.name,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  console.log(data);

  return (
    <div className="h-full p-4 space-y-2">
      <SearchInput />
      <div>
        <div className="mb-8">
          <Heading
            title="AI Companions"
            desc="Always there to support you.."
            imgUrl="/pro.png"
          />
          <Categories data={categories} />
        </div>

        <div className="m-2 lg:m-6">
          <Companions data={data} />
        </div>
      </div>
    </div>
  );
};

export default RootPage;
