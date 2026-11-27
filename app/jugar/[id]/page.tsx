import { Suspense } from "react";
import { notFound } from "next/navigation";
import GamePlayer from "@/components/game-player";
import { GAMES } from "@/lib/games";

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

async function Player({ params }: Pick<PageProps<"/jugar/[id]">, "params">) {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) notFound();
  return <GamePlayer game={game} />;
}

export default function PlayPage(props: PageProps<"/jugar/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="pixel neon-cyan" style={{ padding: 80, textAlign: "center" }}>
          CARGANDO_
        </div>
      }
    >
      <Player params={props.params} />
    </Suspense>
  );
}
