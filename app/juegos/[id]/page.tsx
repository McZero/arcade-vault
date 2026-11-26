import { notFound } from "next/navigation";
import GameDetail from "@/components/game-detail";
import { GAMES } from "@/lib/games";

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export default async function GamePage(props: PageProps<"/juegos/[id]">) {
  const { id } = await props.params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) notFound();
  return <GameDetail game={game} />;
}
