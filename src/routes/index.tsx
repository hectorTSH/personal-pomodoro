import { createFileRoute } from "@tanstack/react-router";
import { StillApp } from "@/components/timer/app-shell";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <StillApp />;
}
