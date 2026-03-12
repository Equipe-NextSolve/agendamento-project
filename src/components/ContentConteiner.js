import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";

export function ContentConteiner({ title, subtitle, children }) {
  return (
    <main className="flex min-h-screen w-full flex-col gap-4 px-3 pb-3 items-center bg-transparent text-bluedark">
      <Navbar />

      <div className="flex w-full max-w-6xl flex-col gap-4">
        <Card className="border-greenlight/70 bg-white/95">
          <div className="flex w-full flex-col gap-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-bluelight">{subtitle}</p>
          </div>
        </Card>

        <div className="flex w-full flex-col gap-4">{children}</div>
      </div>
    </main>
  );
}
