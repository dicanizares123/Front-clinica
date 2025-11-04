"use client";

import useSWR from "swr";
import { fetcher } from "../../app/fetcher";
import { AuthActions } from "../utils";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const { data: user } = useSWR("/auth/users/me/", fetcher);

  const { logout, removeTokens } = AuthActions();

  const handleLogout = () => {
    logout()
      .res(() => {
        removeTokens();
        router.push("/");
      })
      .catch(() => {
        removeTokens();
        router.push("/");
      });
  };

  return <div></div>;
}
