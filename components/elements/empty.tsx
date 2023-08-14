import Image from "next/image";


interface Empty{
    label: string;
    label2?: string;
}
const empty = ({label, label2}: Empty) => {
  return (
    <div className="h-full p-20 flex flex-col items-center justify-center">
      <div className="relative h-72 w-72">
        <Image src="/empty.png" fill alt="Empty" />
      </div>
      <p className="text-muted-foreground text-sm text-center">
        {label}
      </p>
      <p className="text-muted-foreground text-sm text-center mt-2">
        {label2}
      </p>
    </div>
  )
}

export default empty