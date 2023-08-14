"use client";
import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";

import qs from "query-string";
interface CategoriesProps {
  data: Category[];
}

export const Categories = ({ data }: CategoriesProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get("categoryId");
  // console.log(data);

  const onClick = (id: string | undefined) => {
    const query = { categoryId: id };

    const url = qs.stringifyUrl(
      {
        url: window.location.href,
        query,
      },
      { skipNull: true }
    );

    router.push(url);
  };
  return (
    <div className="w-full overflow-x-auto space-x-2 flex p-1 no-scrollbar lg:justify-center">
      <button
        onClick={() => onClick(undefined)}
        className={cn(
          `flex 
           items-center 
           text-center 
           text-xs 
           xl:text-sm 
           px-4
           md:px-4 
           py-2 
           md:py-3 
           rounded-md 
           bg-primary/10 
           hover:opacity-75 
           transition
        `,
          !categoryId ? "bg-primary/25" : "bg-primary/10"
        )}
      >
        Newest
      </button>
      {data.map((category) => (
        <button
          onClick={() => onClick(category.id)}
          className={cn(
            `
                flex 
                items-center 
                text-center 
                text-xs 
                xl:text-sm 
                px-4
                md:px-4 
                py-2 
                md:py-3 
                rounded-md 
                bg-primary/10 
                hover:opacity-75 
                transition
              `,
            category.id === categoryId ? "bg-primary/25" : "bg-primary/10",
            category.id === "cll9hdhra0000v6kklfkbao7c" &&
              "bg-gradient-to-r from-pink-500 to-purple-500"
          )}
          key={category.id}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
