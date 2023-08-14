import Image from "next/image"

export const Loader = ({txt} : {txt: string}) => {
  return (
    <div className="h-full flex flex-col gap-y-4 items-center justify-center">
      <div className="w-10 h-10 relative animate-spin">
        <Image
          alt="Logo"
          src="/logo.png"
          fill
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {
          txt ? txt : "Mavic is on work..."
        }
      </p>
    </div>
  );
};