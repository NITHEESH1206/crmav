import { ProjectDetail } from "@/components/details/project-detail";
import { fetchProject } from "@/lib/data/detail-fetchers";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await fetchProject(id);
  return <ProjectDetail project={project} />;
}
