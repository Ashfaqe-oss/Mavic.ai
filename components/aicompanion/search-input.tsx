"use client";

import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEventHandler, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import qs from "query-string";

export const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // we will be using category in url

  const categoryId = searchParams.get("category");
  const name = searchParams.get("name");

  const [value, setValue] = useState(name || "");

  // using a debouncing function to only start searchingl after typing has stopped for 500ms -- how ?
  /// a debounce hook
  const debouncedValue = useDebounce<string>(value, 500);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    // formatting query object
    const query = {
      name: debouncedValue,
      categoryId: categoryId,
    };

    // put query in url
    const url = qs.stringifyUrl(
      {
        url: window.location.href,
        query,
      },
      { skipNull: true, skipEmptyString: true }
    );

    router.push(url);
  }, [router, categoryId, debouncedValue]);

  return (
    <div className="relative">
      <Search className="absolute h-4 w-4 top-3 left-4 text-muted-foreground" />
      <Input
        onChange={onChange}
        value={value}
        placeholder="Search..."
        className="pl-10 bg-primary/10"
      />
    </div>
  );
};
