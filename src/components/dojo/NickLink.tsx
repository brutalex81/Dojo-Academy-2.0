import { Link } from "@tanstack/react-router";
import { slugify } from "@/lib/utils";

export function NickLink({ nick, className }: { nick: string; className?: string }) {
  return (
    <Link
      to="/players/$playerId"
      params={{ playerId: slugify(nick) }}
      className={className ?? "hover:text-accent"}
    >
      {nick}
    </Link>
  );
}
