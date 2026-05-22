"use client";

import { useRouter } from "next/navigation";
import { useUser } from "hooks/api/auth";
import { useEffect } from "react";

export default function Home() {
  // const { status } = await api.health.getHealth.query();
  const { user, isLoading, isFetched } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isFetched || isLoading) return;
    if (user?.id) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isFetched, isLoading, user, router]);

  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      {/* <div>
        <h1 className="text-3xl">Streamyst - Stream in Style</h1>
        <h2>Server Status: {status}</h2>
      </div> */}
      <div>{JSON.stringify(user, null, 2)}</div>
    </main>
  );
}
