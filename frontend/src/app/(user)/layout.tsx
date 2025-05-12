import Footer from "@/app/(user)/_components/footer/Footer";

import { ScrollArea } from "@/components/ui/scroll-area";
import NavbarHome from "./_components/navbar/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div >
       <NavbarHome/>
          <div className="h-[calc(100vh-5rem)] w-[calc(100vw-2px)] mt-[72px]">
            <ScrollArea className="h-[calc(100vh-64px)] ">
                {children}
                <Footer />
            </ScrollArea>
          </div>
        </div>
  );
}
