import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Image from "next/image";

interface HeadingProps {
  title: string;
  desc: string;
  icon?: LucideIcon;
  imgUrl: string;
  iconColor?: string;
  bgColor?: string;
}
const Heading = ({
  title,
  desc,
  icon: Icon,
  imgUrl,
  iconColor,
  bgColor,
}: HeadingProps) => {
  return (
    <>
      <div className="m-auto pt-6 px-4 lg:px-8 flex items-center justify-center gap-x-3 mb-8">
        <div className={cn("p-2 w-fit rounded-md", bgColor)}>
          {/* <Icon className={cn("w-10 h-10", iconColor)} /> */}
          <div className="relative h-20 w-20">
            <Image fill alt="Logo" src={imgUrl}/>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
    </>
  );
};

export default Heading;
