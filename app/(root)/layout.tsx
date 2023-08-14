import Navbar from "@/components/navigation/navbar";
import Sidebar from "@/components/navigation/sidebar";
import { getApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const RootLayout = async ({ children } : {
    children : React.ReactNode;
}) => {
    const isPro = await checkSubscription();
    const apiLimitCount = await getApiLimit();
    return(
        <div className="h-full">
            <Navbar isPro={isPro} apiLimitCount={apiLimitCount}/>
            <div className="hidden md:flex mt-16 h-full flex-col w-32 fixed inset-y-0">
                <Sidebar isPro={isPro} apiLimitCount={apiLimitCount}/>
            </div>
            <main className="md:pl-32 pt-16 h-full">
                {children}
            </main>
        </div>
    );
}

export default RootLayout;