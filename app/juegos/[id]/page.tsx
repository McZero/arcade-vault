import { Suspense } from "react";
import { notFound } from "next/navigation";
import GameDetail from "@/components/game-detail";
import { GAMES } from "@/lib/games";

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

async function Detail({ params }: Pick<PageProps<"/juegos/[id]">, "params">) {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) notFound();
  return <GameDetail game={game} />;
}

export default function GamePage(props: PageProps<"/juegos/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="pixel neon-cyan" style={{ padding: 80, textAlign: "center" }}>
          CARGANDO_
        </div>
      }
    >
      <Detail params={props.params} />
    </Suspense>
  );
}
