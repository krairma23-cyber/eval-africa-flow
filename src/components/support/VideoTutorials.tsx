import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const videos = [
  {
    id: "XohfEWlZhOg",
    title: "Présentation d'EvalScol Africa",
    url: "https://www.youtube.com/watch?v=XohfEWlZhOg",
  },
  {
    id: "RpiSLplyYeU",
    title: "Créer une classe",
    url: "https://youtu.be/RpiSLplyYeU",
  },
  {
    id: "XxEshxA6ZRw",
    title: "Utiliser l'IA dans son école",
    url: "https://youtu.be/XxEshxA6ZRw",
  },
  {
    id: "GIwf-MG56Wc",
    title: "API et Support",
    url: "https://youtu.be/GIwf-MG56Wc",
  },
  {
    id: "jHPDb0rvnWQ",
    title: "Abonnement et facturation",
    url: "https://youtu.be/jHPDb0rvnWQ",
  },
  {
    id: "rMejdKbVQBo",
    title: "Créer un emploi du temps",
    url: "https://youtu.be/rMejdKbVQBo",
  },
  {
    id: "ihNWml_FQew",
    title: "Ajouter un enseignant",
    url: "https://youtu.be/ihNWml_FQew",
  },
  {
    id: "9cYWcFrgYtg",
    title: "Générer les bulletins scolaires",
    url: "https://youtu.be/9cYWcFrgYtg",
  },
  {
    id: "ONeytHvzcVg",
    title: "Créer des classes (guide complet)",
    url: "https://youtu.be/ONeytHvzcVg",
  },
  {
    id: "0treqN-exHM",
    title: "Créer des évaluations",
    url: "https://youtu.be/0treqN-exHM",
  },
  {
    id: "VM5bH0pn8Nw",
    title: "PUB EvalScol Africa la nouvelle gestion scolaire avancée",
    url: "https://www.youtube.com/watch?v=VM5bH0pn8Nw",
  },
  {
    id: "CgR3WoJ5Q64",
    title: "PUB de gestion scolaire avance ''EvalScol Africa ''",
    url: "https://www.youtube.com/watch?v=CgR3WoJ5Q64",
  },
];

export interface VideoTutorialsProps {
  title?: string;
  description?: string;
  columns?: 1 | 2 | 3;
  showHeader?: boolean;
}

export default function VideoTutorials({
  title = "Tutoriels vidéo",
  description = "Apprenez à utiliser EvalScol Africa étape par étape avec nos vidéos explicatives.",
  columns = 2,
  showHeader = true,
}: VideoTutorialsProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
            >
              <path d="M2 8a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" />
              <path d="m10 9 5 3-5 3z" />
            </svg>
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <div className={`grid ${gridCols[columns]} gap-4`}>
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-lg border p-3 transition hover:bg-muted hover:border-primary/30"
            >
              <div className="shrink-0 overflow-hidden rounded-md">
                <img
                  src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
                  alt={video.title}
                  width="120"
                  height="68"
                  className="h-16 w-28 object-cover transition group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between self-stretch">
                <span className="line-clamp-2 text-sm font-medium leading-snug">
                  {video.title}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-auto w-fit justify-start p-0 text-xs text-primary hover:bg-transparent hover:text-primary/80"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Regarder
                </Button>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
