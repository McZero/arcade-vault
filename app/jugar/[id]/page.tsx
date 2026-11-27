import { notFound } from "next/navigation";
import GamePlayer from "@/components/game-player";
import { GAMES } from "@/lib/games";

// Allow a blocking route: reading `params` before rendering lets `notFound()`
// return a real HTTP 404 for unknown ids (inside <Suspense> it would be a 200).
export const instant = false;

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export default async function PlayPage(props: PageProps<"/jugar/[id]">) {
  const { id } = await props.params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) notFound();
  return <GamePlayer game={game} />;
}
